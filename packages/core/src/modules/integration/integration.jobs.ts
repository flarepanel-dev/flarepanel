import { z } from 'zod';
import { defineJob } from '../../jobs/define';
import {
  createEventStoreExportSource,
  createRedisExportClaim,
  type ExportClickhouse,
  type ExportDb,
  runFlushExportsCron,
} from './src/flush-exports';

/**
 * Every minute — drains new events to S3/GCS. A cron pattern rather than an
 * interval, so Cloudflare Workers' per-minute dispatcher runs it too.
 */
const FLUSH_EXPORTS_CRON = '* * * * *';
/** Workers: events per uploaded file and files per run, within Worker limits. */
const WORKERS_EXPORT_BATCH_SIZE = 10_000;
const WORKERS_EXPORT_MAX_BATCHES = 5;

/** This module's fragment of the `cron` queue's jobs. */
export const integrationCronJobs = {
  flushExports: defineJob({
    payload: z.null(),
    cron: { pattern: FLUSH_EXPORTS_CRON },
    handler: async ({ ctx }) => {
      // Lazy: the registry pulls the S3 and GCS SDKs, ~270ms of module
      // evaluation (measured, Bun 1.4.0) that a static edge here would add to
      // jobs.registry.ts's eager graph and so to every core test file.
      const { getServerIntegration } = await import('./src/registry');

      const exports = ctx.config.objectStoreExport;
      await runFlushExportsCron({
        db: ctx.db as unknown as ExportDb,
        ch: ctx.ch as unknown as ExportClickhouse,
        logger: ctx.logger.child({ job: 'flush-exports' }),
        config: ctx.eventStore
          ? {
              ...ctx.config,
              objectStoreExport: {
                ...exports,
                batchSize: Math.min(
                  exports.batchSize ?? WORKERS_EXPORT_BATCH_SIZE,
                  WORKERS_EXPORT_BATCH_SIZE
                ),
                maxBatchesPerRun: Math.min(
                  exports.maxBatchesPerRun ?? WORKERS_EXPORT_MAX_BATCHES,
                  WORKERS_EXPORT_MAX_BATCHES
                ),
              },
            }
          : ctx.config,
        createAdapter: (config) =>
          getServerIntegration(config.type).export?.createAdapter(
            config,
            ctx.config
          ),
        // Workers: events and the per-export claim live in each project's
        // Durable Object; elsewhere ClickHouse and a Redis lock.
        ...(ctx.eventStore
          ? createEventStoreExportSource(ctx.eventStore)
          : { claimExport: createRedisExportClaim(ctx.redis) }),
      });
    },
  }),
};
