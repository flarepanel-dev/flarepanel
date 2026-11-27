// Job wiring and scheduling only; the sync itself is tested in the service.

import { afterEach, expect, setSystemTime, test } from 'bun:test';
import { createMemoryStores } from '@flarepanel/platform';
import { testCoreConfig } from '../../../test/config-fixture';
import type { AppDeps, Buffers, JobCtx } from '../../context';
import {
  type CloudflareJobMessage,
  createCloudflareProducers,
} from '../../jobs/cloudflare';
import { parseCron } from '../../jobs/cron-match';
import type { QueueProducers } from '../../jobs.registry';
import { CRON_SCHEDULES, queues } from '../../jobs.registry';
import type { Logger } from '../../logger';
import type { Services } from '../../services';
import {
  CLOUDFLARE_SYNC_CRON,
  cloudflareAnalyticsCronJobs,
  cloudflareAnalyticsQueueJobs,
} from './cloudflare-analytics.jobs';

afterEach(() => {
  setSystemTime();
});

function stubLogger(): Logger {
  const noop = () => undefined;
  const logger: Logger = {
    fatal: noop,
    error: noop,
    warn: noop,
    info: noop,
    debug: noop,
    trace: noop,
    child: () => logger,
  };
  return logger;
}

function stubJobCtx(
  cloudflareAnalytics: Partial<Services['cloudflareAnalytics']>,
  queueProducers: QueueProducers
): JobCtx {
  return {
    auth: null,
    db: {} as AppDeps['db'],
    prisma: {} as AppDeps['prisma'],
    ch: {} as AppDeps['ch'],
    redis: {} as AppDeps['redis'],
    stores: createMemoryStores(),
    clients: {} as AppDeps['clients'],
    buffers: {} as Buffers,
    logger: stubLogger(),
    queues: queueProducers,
    config: testCoreConfig(),
    services: { cloudflareAnalytics } as unknown as Services,
    requestId: 'req_1',
    job: { id: 'job_1', attempt: 0, queue: 'cron', name: 'cloudflareSync' },
  };
}

/** Producers on the Cloudflare Queues backend, with a fake queue binding. */
function cloudflareProducers() {
  const sent: CloudflareJobMessage[] = [];
  const handle = createCloudflareProducers(queues, {
    sender: {
      send: async (body) => {
        sent.push(structuredClone(body) as CloudflareJobMessage);
      },
    },
    coordination: createMemoryStores().coordination,
  });
  return { sent, queues: handle.queues };
}

test('the sync job runs on the gsc queue and the fan-out on the cron queue', () => {
  expect(queues.gsc.jobs.cloudflareProjectSync).toMatchObject({
    queue: 'gsc',
    name: 'cloudflareProjectSync',
  });
  expect(queues.cron.jobs.cloudflareSync).toMatchObject({
    queue: 'cron',
    name: 'cloudflareSync',
  });
});

test('the fan-out is scheduled hourly, past the hour', () => {
  expect(CLOUDFLARE_SYNC_CRON).toBe('20 * * * *');
  expect(
    CRON_SCHEDULES.find((schedule) => schedule.id === 'cloudflareSync')
  ).toMatchObject({ schedule: { pattern: CLOUDFLARE_SYNC_CRON } });
  expect(() => parseCron(CLOUDFLARE_SYNC_CRON)).not.toThrow();
});

test('a rate-limited sync is retried after Cloudflare’s 5-minute window', () => {
  expect(cloudflareAnalyticsQueueJobs.cloudflareProjectSync.options).toEqual({
    attempts: 3,
    backoff: { type: 'exponential', delay: 5 * 60 * 1000 },
  });
});

test('cloudflareProjectSync validates its payload and delegates', async () => {
  expect(() =>
    cloudflareAnalyticsQueueJobs.cloudflareProjectSync.payload.parse({})
  ).toThrow();
  const calls: string[] = [];
  const { queues: producers } = cloudflareProducers();
  await cloudflareAnalyticsQueueJobs.cloudflareProjectSync.handler({
    payload: { projectId: 'p1' },
    ctx: stubJobCtx(
      {
        runProjectSync: async (projectId: string) => {
          calls.push(projectId);
        },
      },
      producers
    ),
  });
  expect(calls).toEqual(['p1']);
});

test('the hourly fan-out queues one sync per connected project, once per hour', async () => {
  setSystemTime(new Date('2026-11-27T10:20:00Z'));
  const { sent, queues: producers } = cloudflareProducers();
  const ctx = stubJobCtx(
    {
      listConnectionsForSync: async () => [
        { projectId: 'p1' },
        { projectId: 'p2' },
      ],
    },
    producers
  );
  await cloudflareAnalyticsCronJobs.cloudflareSync.handler({
    payload: null,
    ctx,
  });
  // A second run in the same hour (a cron retry) queues nothing new.
  await cloudflareAnalyticsCronJobs.cloudflareSync.handler({
    payload: null,
    ctx,
  });
  expect(
    sent.map((message) => [message.queue, message.job, message.data.payload])
  ).toEqual([
    ['gsc', 'cloudflareProjectSync', { projectId: 'p1' }],
    ['gsc', 'cloudflareProjectSync', { projectId: 'p2' }],
  ]);
  expect(sent[0]?.attempts).toBe(3);
  // The next hour queues again.
  setSystemTime(new Date('2026-11-27T11:20:00Z'));
  await cloudflareAnalyticsCronJobs.cloudflareSync.handler({
    payload: null,
    ctx,
  });
  expect(sent).toHaveLength(4);
});
