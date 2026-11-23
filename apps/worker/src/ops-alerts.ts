/**
 * Jobs that fail for good. On Workers the logs are sampled, so a failure line
 * alone can be lost: each failed job is also kept in R2 under
 * `dead-letters/<date>/`, and the operator (OPS_ALERT_EMAIL) gets one email per
 * job name and hour. Two ways a job ends here:
 * - its own retries are used up (`job failed terminally`);
 * - Cloudflare Queues gave up on the message (a crash, CPU limit or timeout on
 *   every delivery) and moved it to the dead letter queue.
 */
import type { Logger } from '@flarepanel/core';
import { getPlatformStores } from '@flarepanel/platform';

export const DEAD_LETTER_QUEUE = 'flarepanel-jobs-dlq';
export const DEAD_LETTER_PREFIX = 'dead-letters/';
const ALERT_EVERY_MS = 60 * 60 * 1000;
const MAX_ERROR_LENGTH = 2000;
const UNSAFE_KEY_CHARS = /[^a-zA-Z0-9._-]/g;

export interface FailedJob {
  source: 'retries-exhausted' | 'dead-letter-queue';
  queue?: string;
  job?: string;
  jobId?: string;
  attempts: number;
  error?: string;
  data?: unknown;
}

export interface OpsAlertEnv {
  EVENTS_ARCHIVE?: R2Bucket;
  EMAIL?: SendEmail;
  OPS_ALERT_EMAIL?: string;
}

export function deadLetterKey(failure: FailedJob, now: Date): string {
  const day = now.toISOString().slice(0, 10);
  const name = [failure.queue, failure.job, failure.jobId]
    .filter(Boolean)
    .join('-')
    .replace(UNSAFE_KEY_CHARS, '_');
  return `${DEAD_LETTER_PREFIX}${day}/${name || 'job'}-${now.getTime()}.json`;
}

/** Keeps the failure in R2, logs it and alerts the operator. Never throws. */
export async function reportFailedJob(
  env: OpsAlertEnv,
  logger: Logger,
  failure: FailedJob,
  now = new Date()
): Promise<void> {
  const key = deadLetterKey(failure, now);
  const record = {
    ...failure,
    error: failure.error?.slice(0, MAX_ERROR_LENGTH),
    failedAt: now.toISOString(),
  };
  try {
    await env.EVENTS_ARCHIVE?.put(key, JSON.stringify(record), {
      httpMetadata: { contentType: 'application/json' },
    });
  } catch (error) {
    logger.error({ err: error, key }, 'Could not keep the failed job in R2');
  }
  logger.error(
    {
      source: failure.source,
      queue: failure.queue,
      job: failure.job,
      jobId: failure.jobId,
      attempts: failure.attempts,
      key,
    },
    'Job failed for good'
  );
  await alertOperator(env, logger, failure, key);
}

async function alertOperator(
  env: OpsAlertEnv,
  logger: Logger,
  failure: FailedJob,
  key: string
) {
  const to = env.OPS_ALERT_EMAIL;
  if (!(to && env.EMAIL)) {
    return;
  }
  const job = failure.job ?? failure.queue ?? 'unknown job';
  try {
    const first = await getPlatformStores().coordination.setIfAbsent(
      `ops-alert:job:${job}`,
      '1',
      ALERT_EVERY_MS
    );
    if (!first) {
      return;
    }
    await env.EMAIL.send({
      from: process.env.EMAIL_SENDER ?? 'hello@flarepanel.dev',
      to,
      subject: `FlarePanel: job "${job}" failed`,
      text: [
        `The job "${job}" failed after ${failure.attempts} attempt(s) (${failure.source}).`,
        '',
        `Error: ${failure.error?.slice(0, 500) ?? 'none recorded'}`,
        '',
        `The job and its data are kept in R2: ${key}`,
        'More failures of this job in the next hour are kept and logged, without another email.',
      ].join('\n'),
    });
  } catch (error) {
    logger.error({ err: error }, 'Could not send the failed-job alert');
  }
}

interface DeadLetterMessage {
  id: string;
  body: unknown;
  attempts: number;
  ack(): void;
}

/** The dead letter queue's consumer: keep, log and alert, then ack. */
export async function keepDeadLetters(
  messages: readonly DeadLetterMessage[],
  env: OpsAlertEnv,
  logger: Logger
): Promise<void> {
  for (const message of messages) {
    const body = (message.body ?? {}) as {
      queue?: string;
      job?: string;
      jobId?: string;
      data?: unknown;
    };
    await reportFailedJob(env, logger, {
      source: 'dead-letter-queue',
      queue: body.queue,
      job: body.job,
      jobId: body.jobId ?? message.id,
      attempts: message.attempts,
      error: 'Cloudflare Queues gave up on every delivery',
      data: body.data ?? message.body,
    });
    message.ack();
  }
}
