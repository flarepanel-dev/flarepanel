// legacyCompat.notification discriminates on this exact job name (jobs/compat.ts).
// No cron fragment: notifications are only triggered by a rule match.

import type { Prisma } from '@flarepanel/db/src/prisma-client';
import { z } from 'zod';
import { isProviderError } from '../../clients/provider-error';
import { defineJob } from '../../jobs/define';
import { type IClickhouseEvent, transformEvent } from '../event/event.service';
import { checkNotificationRulesForSessionEnd } from './src/notification-dispatch';

// A loose mirror of `Prisma.NotificationUncheckedCreateInput` — the payload
// is a Prisma create input on the wire, and BullMQ stores job data as JSON,
// so this only needs to survive that round-trip, not model every Prisma
// input variant.
const notificationPayload = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  title: z.string(),
  message: z.string(),
  sendToApp: z.boolean().optional(),
  sendToEmail: z.boolean().optional(),
  integrationId: z.string().nullable().optional(),
  notificationRuleId: z.string().nullable().optional(),
  payload: z.unknown().optional(),
});

/** Pages of a session's events read for its funnel rules (50 events each). */
const SESSION_FUNNEL_MAX_PAGES = 20;

/** The `notification` queue's own jobs. */
export const notificationQueueJobs = {
  /**
   * Workers: a session ended in a project that has funnel rules. Its events
   * come from the project's Durable Object; the rules run as on Bun.
   */
  checkSessionFunnel: defineJob({
    payload: z.object({ projectId: z.string(), sessionId: z.string() }),
    handler: async ({ payload, ctx }) => {
      const store = ctx.eventStore;
      if (!store) {
        return;
      }
      const events: IClickhouseEvent[] = [];
      let cursor: string | null = null;
      for (let page = 0; page < SESSION_FUNNEL_MAX_PAGES; page++) {
        const result = await store.listEvents(payload.projectId, {
          sessionId: payload.sessionId,
          cursor,
          take: 50,
        });
        events.push(...result.events);
        cursor = result.cursor;
        if (!cursor) {
          break;
        }
      }
      if (events.length > 0) {
        await checkNotificationRulesForSessionEnd(
          ctx,
          events.map(transformEvent)
        );
      }
    },
  }),
  sendNotification: defineJob({
    payload: z.object({ notification: notificationPayload }),
    handler: async ({ payload, ctx }) => {
      try {
        // `payload.notification` round-tripped through BullMQ's JSON storage
        // and the loose wire schema above — the real shape is Prisma's create
        // input.
        await ctx.services.notification.dispatch(
          payload.notification as Prisma.NotificationUncheckedCreateInput
        );
      } catch (error) {
        // The transport classified this once. A destination that refused the
        // request (4xx) will refuse the identical retry, so it is logged and
        // the job completes; anything retryable is rethrown so the failure is
        // recorded against the job.
        if (isProviderError(error) && !error.retryable) {
          ctx.logger.error(
            {
              err: error,
              provider: error.provider,
              status: error.status,
              integrationId: payload.notification.integrationId,
            },
            'Notification permanently refused by the destination'
          );
          return;
        }
        throw error;
      }
    },
  }),
};
