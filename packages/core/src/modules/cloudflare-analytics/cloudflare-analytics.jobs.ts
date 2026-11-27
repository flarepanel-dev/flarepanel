import { z } from 'zod';
import { defineJob } from '../../jobs/define';

/** Past the hour so the previous hour's analytics are complete (see SYNC_LAG_MS). */
export const CLOUDFLARE_SYNC_CRON = '20 * * * *';
/** Cloudflare's GraphQL budget refills over 5 minutes. */
const RATE_LIMIT_BACKOFF_MS = 5 * 60 * 1000;
const SYNC_ATTEMPTS = 3;
const HOUR_MS = 60 * 60 * 1000;

const projectPayload = z.object({ projectId: z.string() });

/**
 * Per-project syncs, on the `gsc` queue: like Search Console they pull a
 * third party's API per project, and a queue of their own would need a new
 * ENABLED_QUEUES token on every self-hosted install.
 */
export const cloudflareAnalyticsQueueJobs = {
  cloudflareProjectSync: defineJob({
    payload: projectPayload,
    // Rate limits and Cloudflare outages rethrow: retried after the budget refills.
    options: {
      attempts: SYNC_ATTEMPTS,
      backoff: { type: 'exponential', delay: RATE_LIMIT_BACKOFF_MS },
    },
    handler: async ({ payload, ctx }) => {
      await ctx.services.cloudflareAnalytics.runProjectSync(payload.projectId);
    },
  }),
};

/** This module's fragment of the `cron` queue's jobs. */
export const cloudflareAnalyticsCronJobs = {
  // Fans out one `cloudflareProjectSync` per connected project, once an hour.
  cloudflareSync: defineJob({
    payload: z.null(),
    cron: { pattern: CLOUDFLARE_SYNC_CRON },
    handler: async ({ ctx }) => {
      const connections =
        await ctx.services.cloudflareAnalytics.listConnectionsForSync();
      const hour = Math.floor(Date.now() / HOUR_MS);
      for (const { projectId } of connections) {
        await ctx.queues.gsc.cloudflareProjectSync.add(
          { projectId },
          { deduplicationId: `cloudflare-sync:${projectId}:${hour}` }
        );
      }
    },
  }),
};
