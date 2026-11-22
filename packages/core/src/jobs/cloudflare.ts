/**
 * The Cloudflare job backend: Queues instead of BullMQ, Cron Triggers instead
 * of BullMQ schedulers. Job definitions, payload schemas and handlers are the
 * same ones the BullMQ backend runs (`define.ts`, `runJob`).
 *
 * - One Cloudflare Queue carries every FlarePanel queue; the message says which.
 * - Retries and backoff follow each job's `attempts`/`backoff` (or its queue
 *   defaults), using `message.retry({ delaySeconds })`.
 * - `jobId` / `deduplicationId` are enforced with a coordination-store key;
 *   `remove(jobId)` marks the job cancelled and the consumer drops it.
 * - Delays above 12 hours are capped (Queues' maximum) and logged.
 * - Priority has no Queues equivalent and is ignored.
 *
 * The bindings are typed structurally so core needs no Workers types.
 */

import type { CoordinationStore } from '@flarepanel/platform';
import { generateId } from '@flarepanel/shared';
import type { AppDeps } from '../context';
import type { Logger } from '../logger';
import { parseCron } from './cron-match';
import type {
  EnqueueOptions,
  JobBackoff,
  QueueDefinition,
  QueueMap,
} from './define';
import { type JobEnvelope, wrap } from './envelope';
import {
  buildProducers,
  type EnqueueFn,
  type ProducerHandle,
  type RemoveFn,
} from './producers';
import type { SchedulerDefinition } from './schedulers';
import { runJob, type TerminalFailure } from './workers';

/** Cloudflare Queues allows at most 12 hours of delay. */
export const MAX_DELAY_SECONDS = 12 * 60 * 60;
/** How long a jobId / deduplicationId stays taken. */
const DEDUPE_TTL_MS = 24 * 60 * 60 * 1000;
/** How long a removed job is remembered as cancelled. */
const CANCELLED_TTL_MS = MAX_DELAY_SECONDS * 1000 + 60 * 60 * 1000;
const MINUTE_MS = 60_000;

/** What travels on the Cloudflare Queue. */
export interface CloudflareJobMessage {
  v: 1;
  queue: string;
  job: string;
  jobId: string;
  data: JobEnvelope;
  attempts: number;
  backoff?: JobBackoff;
}

/** The part of a Queue producer binding we use. */
export interface QueueSender {
  send(body: unknown, options?: { delaySeconds?: number }): Promise<void>;
}

/** The part of a consumed Queue message we use. */
export interface QueueMessageLike {
  id: string;
  body: unknown;
  /** Delivery count, starting at 1. */
  attempts: number;
  ack(): void;
  retry(options?: { delaySeconds?: number }): void;
}

const dedupeKey = (queue: string, id: string) => `jobs:dedupe:${queue}:${id}`;
const cancelledKey = (queue: string, id: string) =>
  `jobs:cancelled:${queue}:${id}`;

function toDelaySeconds(delayMs: number | undefined, logger?: Logger) {
  if (!delayMs || delayMs <= 0) {
    return 0;
  }
  const seconds = Math.ceil(delayMs / 1000);
  if (seconds > MAX_DELAY_SECONDS) {
    logger?.warn(
      { requestedSeconds: seconds, maxSeconds: MAX_DELAY_SECONDS },
      'job delay capped at the Cloudflare Queues maximum'
    );
    return MAX_DELAY_SECONDS;
  }
  return seconds;
}

export interface CreateCloudflareProducersOptions {
  sender: QueueSender;
  coordination: CoordinationStore;
  logger?: Logger;
}

export function createCloudflareProducers<TQueues extends QueueMap>(
  definitions: TQueues,
  { sender, coordination, logger }: CreateCloudflareProducersOptions
): ProducerHandle<TQueues> {
  const definitionFor = (name: string): QueueDefinition => {
    const definition = Object.values(definitions).find((d) => d.name === name);
    if (!definition) {
      throw new Error(`Queue '${name}' is not in the registry`);
    }
    return definition;
  };

  const enqueue: EnqueueFn = async (job, payload, options, meta) => {
    const parsed = job.payload.parse(payload);
    const merged: EnqueueOptions = { ...job.options, ...options };
    const defaults = definitionFor(job.queue).defaults;
    const jobId = merged.jobId ?? generateId();

    const uniqueId = merged.jobId ?? merged.deduplicationId;
    if (uniqueId !== undefined) {
      const isFirst = await coordination.setIfAbsent(
        dedupeKey(job.queue, uniqueId),
        jobId,
        DEDUPE_TTL_MS
      );
      if (!isFirst) {
        return (
          (await coordination.get(dedupeKey(job.queue, uniqueId))) ?? jobId
        );
      }
    }

    const message: CloudflareJobMessage = {
      v: 1,
      queue: job.queue,
      job: job.name,
      jobId,
      data: wrap(parsed, meta ?? {}) as JobEnvelope,
      attempts: Math.max(1, merged.attempts ?? defaults?.attempts ?? 1),
      backoff: merged.backoff ?? defaults?.backoff,
    };
    const delaySeconds = toDelaySeconds(merged.delay, logger);
    await sender.send(message, delaySeconds ? { delaySeconds } : undefined);
    return jobId;
  };

  const remove: RemoveFn = async (queue, jobId) => {
    await coordination.set(cancelledKey(queue, jobId), '1', CANCELLED_TTL_MS);
  };

  return {
    queues: buildProducers(definitions, enqueue, remove, {}),
    scope: (meta) => buildProducers(definitions, enqueue, remove, meta),
    enqueue,
    remove,
    bullQueues: [],
    close: async () => undefined,
  };
}

function isJobMessage(body: unknown): body is CloudflareJobMessage {
  if (typeof body !== 'object' || body === null) {
    return false;
  }
  const message = body as Partial<CloudflareJobMessage>;
  return (
    message.v === 1 &&
    typeof message.queue === 'string' &&
    typeof message.job === 'string' &&
    typeof message.jobId === 'string'
  );
}

/** Seconds to wait before attempt `nextAttempt` (2 = first retry). */
export function retryDelaySeconds(
  backoff: JobBackoff | undefined,
  nextAttempt: number
): number {
  if (!backoff) {
    return 0;
  }
  const retryIndex = Math.max(0, nextAttempt - 2);
  const delayMs =
    backoff.type === 'exponential'
      ? backoff.delay * 2 ** retryIndex
      : backoff.delay;
  return Math.min(MAX_DELAY_SECONDS, Math.ceil(delayMs / 1000));
}

export interface ProcessBatchOptions<TQueues extends QueueMap> {
  definitions: TQueues;
  deps: AppDeps;
  onTerminalFailure?: (failure: TerminalFailure) => void;
}

/**
 * The Queue consumer: runs each message through `runJob`. Every message is
 * acked or retried individually, so one failing job never redelivers the batch.
 */
export async function processCloudflareJobBatch<TQueues extends QueueMap>(
  messages: readonly QueueMessageLike[],
  { definitions, deps, onTerminalFailure }: ProcessBatchOptions<TQueues>
): Promise<void> {
  const byName = new Map(
    Object.values(definitions).map((d) => [d.name, d] as const)
  );

  for (const message of messages) {
    const body = message.body;
    if (!isJobMessage(body)) {
      deps.logger.error(
        { messageId: message.id },
        'dropped malformed job message'
      );
      message.ack();
      continue;
    }

    const definition = byName.get(body.queue);
    if (!definition) {
      deps.logger.error(
        { queue: body.queue, job: body.job },
        'dropped job for unknown queue'
      );
      message.ack();
      continue;
    }

    if (
      await deps.stores.coordination.get(cancelledKey(body.queue, body.jobId))
    ) {
      deps.logger.debug(
        { queue: body.queue, jobId: body.jobId },
        'job removed, skipped'
      );
      message.ack();
      continue;
    }

    try {
      await runJob(
        definition,
        {
          id: body.jobId,
          name: body.job,
          data: body.data,
          attemptsMade: message.attempts - 1,
        },
        deps
      );
      message.ack();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (message.attempts < body.attempts) {
        message.retry({
          delaySeconds: retryDelaySeconds(body.backoff, message.attempts + 1),
        });
        continue;
      }
      deps.logger.error(
        {
          err,
          queue: body.queue,
          job: body.job,
          jobId: body.jobId,
          attempts: message.attempts,
        },
        'job failed terminally'
      );
      onTerminalFailure?.({
        queue: body.queue,
        job: body.job,
        jobId: body.jobId,
        attempts: message.attempts,
        error: err,
        data: body.data,
      });
      message.ack();
    }
  }
}

export interface DispatchOptions {
  schedulers: readonly SchedulerDefinition[];
  /** The cron queue's producers, e.g. `handle.enqueue` bound to `cron` jobs. */
  enqueueCron: (jobName: string, runAt: Date) => Promise<unknown>;
  /** When the Cron Trigger fired (`controller.scheduledTime`). */
  scheduledTime: number;
  /**
   * `every` schedules shorter than a minute flush the event pipeline, which
   * does not run on Workers yet; skipping them avoids ~10 messages a minute.
   */
  includeIntervalSchedules?: boolean;
  logger?: Logger;
}

/**
 * Called by a Cron Trigger that fires every minute: enqueues the cron jobs due
 * in that minute. Each is deduplicated per minute, so an overlapping or
 * repeated trigger never runs a job twice.
 */
export async function dispatchDueSchedules({
  schedulers,
  enqueueCron,
  scheduledTime,
  includeIntervalSchedules = false,
  logger,
}: DispatchOptions): Promise<string[]> {
  const minute = new Date(Math.floor(scheduledTime / MINUTE_MS) * MINUTE_MS);
  const due: string[] = [];

  for (const { id, schedule } of schedulers) {
    if ('pattern' in schedule) {
      if (parseCron(schedule.pattern).matches(minute)) {
        due.push(id);
      }
      continue;
    }
    if (!includeIntervalSchedules) {
      continue;
    }
    const everyMs = Math.max(MINUTE_MS, schedule.every);
    if (minute.getTime() % everyMs < MINUTE_MS) {
      due.push(id);
    }
  }

  for (const id of due) {
    try {
      await enqueueCron(id, minute);
    } catch (error) {
      logger?.error({ err: error, job: id }, 'failed to enqueue scheduled job');
    }
  }
  return due;
}

/**
 * `enqueueCron` for `dispatchDueSchedules`: enqueues a `cron` queue job with a
 * per-minute jobId, so a repeated trigger for the same minute is a no-op.
 */
export function cronEnqueuer(
  handle: Pick<ProducerHandle<QueueMap>, 'enqueue'>,
  cronQueue: QueueDefinition
) {
  return async (jobName: string, runAt: Date) => {
    const job = cronQueue.jobs[jobName];
    if (!job) {
      throw new Error(`Cron queue has no job named '${jobName}'`);
    }
    await handle.enqueue(job, null, {
      jobId: `cron:${jobName}:${runAt.toISOString()}`,
    });
  };
}
