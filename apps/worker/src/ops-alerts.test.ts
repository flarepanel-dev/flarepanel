import { beforeEach, describe, expect, it, spyOn } from 'bun:test';
import {
  configurePlatformStores,
  createMemoryStores,
} from '@flarepanel/platform';
import { createConsoleLogger } from './logger';
import {
  deadLetterKey,
  keepDeadLetters,
  type OpsAlertEnv,
  reportFailedJob,
} from './ops-alerts';

spyOn(console, 'error').mockImplementation(() => undefined);
const logger = createConsoleLogger('fatal');

function fakeEnv(withEmail = true) {
  const puts: { key: string; body: string }[] = [];
  const emails: { to: string; subject: string; text: string }[] = [];
  const env = {
    EVENTS_ARCHIVE: {
      put: (key: string, body: string) => {
        puts.push({ key, body });
        return Promise.resolve();
      },
    },
    EMAIL: {
      send: (message: { to: string; subject: string; text: string }) => {
        emails.push(message);
        return Promise.resolve();
      },
    },
    OPS_ALERT_EMAIL: withEmail ? 'ops@example.com' : undefined,
  } as unknown as OpsAlertEnv;
  return { env, puts, emails };
}

describe('failed jobs', () => {
  beforeEach(() => configurePlatformStores(createMemoryStores()));

  it('names the R2 copy by day, queue, job and id', () => {
    const key = deadLetterKey(
      {
        source: 'retries-exhausted',
        queue: 'import',
        job: 'run',
        jobId: 'a/b',
        attempts: 3,
      },
      new Date('2026-11-23T10:00:00Z')
    );
    expect(key).toBe(
      `dead-letters/2026-11-23/import-run-a_b-${Date.parse('2026-11-23T10:00:00Z')}.json`
    );
  });

  it('keeps every failure and emails once per job and hour', async () => {
    const { env, puts, emails } = fakeEnv();
    const failure = {
      source: 'retries-exhausted' as const,
      queue: 'cron',
      job: 'gscSync',
      jobId: 'j1',
      attempts: 3,
      error: 'boom',
      data: { projectId: 'p1' },
    };
    await reportFailedJob(env, logger, failure);
    await reportFailedJob(env, logger, { ...failure, jobId: 'j2' });
    expect(puts).toHaveLength(2);
    expect(JSON.parse(puts[0]?.body ?? '{}')).toMatchObject({
      job: 'gscSync',
      error: 'boom',
      data: { projectId: 'p1' },
    });
    expect(emails).toHaveLength(1);
    expect(emails[0]).toMatchObject({
      to: 'ops@example.com',
      subject: 'FlarePanel: job "gscSync" failed',
    });
  });

  it('sends no email without an operator address', async () => {
    const { env, puts, emails } = fakeEnv(false);
    await reportFailedJob(env, logger, {
      source: 'retries-exhausted',
      job: 'x',
      attempts: 1,
    });
    expect(puts).toHaveLength(1);
    expect(emails).toHaveLength(0);
  });

  it('keeps and acks what the dead letter queue delivers', async () => {
    const { env, puts } = fakeEnv();
    let acked = 0;
    await keepDeadLetters(
      [
        {
          id: 'm1',
          attempts: 6,
          body: { queue: 'import', job: 'import', jobId: 'i1', data: {} },
          ack: () => {
            acked++;
          },
        },
      ],
      env,
      logger
    );
    expect(acked).toBe(1);
    expect(puts[0]?.key).toContain('import-import-i1');
  });
});
