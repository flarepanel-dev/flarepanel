import { describe, expect, test } from 'bun:test';
import { createMemoryStores } from '@flarepanel/platform';
import { z } from 'zod';
import { testCoreConfig } from '../../test/config-fixture';
import type { AppDeps, Buffers } from '../context';
import { queues } from '../jobs.registry';
import type { Logger } from '../logger';
import {
  type CloudflareJobMessage,
  createCloudflareProducers,
  cronEnqueuer,
  dispatchDueSchedules,
  MAX_DELAY_SECONDS,
  processCloudflareJobBatch,
  type QueueMessageLike,
  retryDelaySeconds,
} from './cloudflare';
import { defineJob, defineQueue } from './define';
import { createRecordingProducers } from './testing';

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

function stubDeps(stores = createMemoryStores()): AppDeps {
  return {
    auth: null,
    db: {} as AppDeps['db'],
    prisma: {} as AppDeps['prisma'],
    ch: {} as AppDeps['ch'],
    redis: {} as AppDeps['redis'],
    stores,
    clients: {} as AppDeps['clients'],
    buffers: {} as Buffers,
    producers: createRecordingProducers(queues),
    logger: stubLogger(),
    config: testCoreConfig({ selfHosted: true }),
  };
}

/** Records sends like a Cloudflare Queue producer binding. */
class FakeQueue {
  sent: { body: CloudflareJobMessage; delaySeconds?: number }[] = [];
  send(body: unknown, options?: { delaySeconds?: number }) {
    // Like the real binding: the body is structured-cloned.
    this.sent.push({
      body: structuredClone(body) as CloudflareJobMessage,
      delaySeconds: options?.delaySeconds,
    });
    return Promise.resolve();
  }
}

/** A consumed message with Cloudflare's ack/retry semantics. */
function message(body: unknown, attempts = 1) {
  const state: { acked: boolean; retried?: { delaySeconds?: number } } = {
    acked: false,
  };
  const msg: QueueMessageLike = {
    id: `msg_${Math.random()}`,
    body,
    attempts,
    ack: () => {
      state.acked = true;
    },
    retry: (options) => {
      state.retried = options ?? {};
    },
  };
  return { msg, state };
}

const runs: { importId: string; attempt: number }[] = [];
let failTimes = 0;

const testQueues = {
  import: defineQueue('import', {
    defaults: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    jobs: {
      run: defineJob({
        payload: z.object({ importId: z.string() }),
        handler: async ({ payload, ctx }) => {
          runs.push({ importId: payload.importId, attempt: ctx.job.attempt });
          if (failTimes > 0) {
            failTimes--;
            throw new Error('boom');
          }
        },
      }),
    },
  }),
};

describe('Cloudflare producers', () => {
  test('send an enveloped message with attempts, backoff and delay', async () => {
    const fake = new FakeQueue();
    const stores = createMemoryStores();
    const handle = createCloudflareProducers(testQueues, {
      sender: fake,
      coordination: stores.coordination,
    });
    const id = await handle
      .scope({ requestId: 'req_1' })
      .import.run.add({ importId: 'imp_1' }, { delay: 1500 });

    expect(fake.sent).toHaveLength(1);
    const sent = fake.sent[0];
    expect(sent?.delaySeconds).toBe(2);
    expect(sent?.body.jobId).toBe(id);
    expect(sent?.body.queue).toBe('import');
    expect(sent?.body.job).toBe('run');
    expect(sent?.body.attempts).toBe(3);
    expect(sent?.body.data).toEqual({
      payload: { importId: 'imp_1' },
      meta: { requestId: 'req_1' },
    });
  });

  test('reject an invalid payload before sending', async () => {
    const fake = new FakeQueue();
    const handle = createCloudflareProducers(testQueues, {
      sender: fake,
      coordination: createMemoryStores().coordination,
    });
    await expect(
      handle.queues.import.run.add({ importId: 1 } as never)
    ).rejects.toThrow();
    expect(fake.sent).toHaveLength(0);
  });

  test('a jobId is sent once', async () => {
    const fake = new FakeQueue();
    const handle = createCloudflareProducers(testQueues, {
      sender: fake,
      coordination: createMemoryStores().coordination,
    });
    const first = await handle.queues.import.run.add(
      { importId: 'a' },
      { jobId: 'fixed' }
    );
    const second = await handle.queues.import.run.add(
      { importId: 'a' },
      { jobId: 'fixed' }
    );
    expect(first).toBe('fixed');
    expect(second).toBe('fixed');
    expect(fake.sent).toHaveLength(1);
  });

  test('delays are capped at the Queues maximum', async () => {
    const fake = new FakeQueue();
    const handle = createCloudflareProducers(testQueues, {
      sender: fake,
      coordination: createMemoryStores().coordination,
    });
    await handle.queues.import.run.add(
      { importId: 'a' },
      { delay: 3 * 24 * 60 * 60 * 1000 }
    );
    expect(fake.sent[0]?.delaySeconds).toBe(MAX_DELAY_SECONDS);
  });
});

describe('Cloudflare consumer', () => {
  async function enqueueOne(stores = createMemoryStores()) {
    const fake = new FakeQueue();
    const handle = createCloudflareProducers(testQueues, {
      sender: fake,
      coordination: stores.coordination,
    });
    const jobId = await handle.queues.import.run.add({ importId: 'imp_9' });
    return { body: fake.sent[0]?.body, handle, jobId, stores };
  }

  test('runs the handler and acks', async () => {
    runs.length = 0;
    failTimes = 0;
    const { body, stores } = await enqueueOne();
    const { msg, state } = message(body);
    await processCloudflareJobBatch([msg], {
      definitions: testQueues,
      deps: stubDeps(stores),
    });
    expect(runs).toEqual([{ importId: 'imp_9', attempt: 1 }]);
    expect(state.acked).toBe(true);
  });

  test('retries with backoff, then reports a terminal failure', async () => {
    runs.length = 0;
    failTimes = 10;
    const { body, stores } = await enqueueOne();
    const failures: unknown[] = [];

    const first = message(body, 1);
    await processCloudflareJobBatch([first.msg], {
      definitions: testQueues,
      deps: stubDeps(stores),
      onTerminalFailure: (f) => failures.push(f),
    });
    expect(first.state.retried).toEqual({ delaySeconds: 2 });

    const second = message(body, 2);
    await processCloudflareJobBatch([second.msg], {
      definitions: testQueues,
      deps: stubDeps(stores),
      onTerminalFailure: (f) => failures.push(f),
    });
    expect(second.state.retried).toEqual({ delaySeconds: 4 });

    const last = message(body, 3);
    await processCloudflareJobBatch([last.msg], {
      definitions: testQueues,
      deps: stubDeps(stores),
      onTerminalFailure: (f) => failures.push(f),
    });
    expect(last.state.acked).toBe(true);
    expect(last.state.retried).toBeUndefined();
    expect(failures).toHaveLength(1);
    expect(runs.map((r) => r.attempt)).toEqual([1, 2, 3]);
  });

  test('a removed job is acked without running', async () => {
    runs.length = 0;
    failTimes = 0;
    const { body, handle, jobId, stores } = await enqueueOne();
    await handle.queues.import.run.remove(jobId);
    const { msg, state } = message(body);
    await processCloudflareJobBatch([msg], {
      definitions: testQueues,
      deps: stubDeps(stores),
    });
    expect(runs).toHaveLength(0);
    expect(state.acked).toBe(true);
  });

  test('malformed and unknown messages are dropped, not retried forever', async () => {
    const bad = message({ hello: 'world' });
    const unknown = message({
      v: 1,
      queue: 'nope',
      job: 'x',
      jobId: 'j',
      data: { payload: null, meta: {} },
      attempts: 1,
    });
    await processCloudflareJobBatch([bad.msg, unknown.msg], {
      definitions: testQueues,
      deps: stubDeps(),
    });
    expect(bad.state.acked).toBe(true);
    expect(unknown.state.acked).toBe(true);
  });
});

describe('retryDelaySeconds', () => {
  test('fixed and exponential', () => {
    expect(retryDelaySeconds(undefined, 2)).toBe(0);
    expect(retryDelaySeconds({ type: 'fixed', delay: 5000 }, 3)).toBe(5);
    expect(retryDelaySeconds({ type: 'exponential', delay: 1000 }, 2)).toBe(1);
    expect(retryDelaySeconds({ type: 'exponential', delay: 1000 }, 4)).toBe(4);
  });
});

describe('dispatchDueSchedules', () => {
  test('enqueues the pattern jobs due in that minute, once', async () => {
    const fake = new FakeQueue();
    const stores = createMemoryStores();
    const handle = createCloudflareProducers(queues, {
      sender: fake,
      coordination: stores.coordination,
    });
    const schedulers = [
      { id: 'salt', schedule: { pattern: '0 0 * * *' } },
      { id: 'cohortRefresh', schedule: { pattern: '*/30 * * * *' } },
      { id: 'flushEvents', schedule: { every: 10_000 } },
    ];
    // Only use job names that really exist on the cron queue.
    const known = schedulers.filter((s) => s.id in queues.cron.jobs);
    const midnight = Date.parse('2026-11-23T00:00:20Z');

    const due = await dispatchDueSchedules({
      schedulers: known,
      enqueueCron: cronEnqueuer(handle, queues.cron),
      scheduledTime: midnight,
    });
    // Interval (sub-minute flush) schedules are skipped by default.
    expect(due.every((id) => id !== 'flushEvents')).toBe(true);
    const sentOnce = fake.sent.length;
    expect(sentOnce).toBe(due.length);

    // The same minute again (a retried trigger) sends nothing new.
    await dispatchDueSchedules({
      schedulers: known,
      enqueueCron: cronEnqueuer(handle, queues.cron),
      scheduledTime: midnight + 5000,
    });
    expect(fake.sent.length).toBe(sentOnce);
  });

  test('every cron job in the registry can be enqueued with a null payload', async () => {
    const fake = new FakeQueue();
    const handle = createCloudflareProducers(queues, {
      sender: fake,
      coordination: createMemoryStores().coordination,
    });
    const enqueue = cronEnqueuer(handle, queues.cron);
    for (const name of Object.keys(queues.cron.jobs)) {
      await enqueue(name, new Date('2026-11-23T00:00:00Z'));
    }
    expect(fake.sent.length).toBe(Object.keys(queues.cron.jobs).length);
  });
});
