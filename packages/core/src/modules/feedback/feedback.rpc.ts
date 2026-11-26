// "Give feedback" in the dashboard. `config` tells the dashboard whether this
// server takes feedback in the app; `send` delivers one message (see
// feedback.service.ts). Rate limited per client IP.

import { z } from 'zod';
import { sendEmail } from '../../clients/email';
import {
  createRateLimitMiddleware,
  createTRPCRouter,
  protectedProcedure,
} from '../../rpc/base';
import { TRPCBadRequestError, TRPCInternalServerError } from '../../rpc/errors';
import { enforceRateLimit } from '../../rpc/rate-limit';
import {
  deliverFeedback,
  FEEDBACK_TYPES,
  feedbackEnabled,
} from './feedback.service';

const rateLimit = createRateLimitMiddleware(enforceRateLimit);

export const zSendFeedback = z.object({
  type: z.enum(FEEDBACK_TYPES),
  message: z.string().trim().min(3).max(4000),
  page: z.string().max(300).optional(),
  allowReply: z.boolean().default(true),
  organizationId: z.string().max(100).optional(),
  projectId: z.string().max(100).optional(),
});

export const feedbackRouter = createTRPCRouter({
  config: protectedProcedure.query(({ ctx }) => ({
    inApp: feedbackEnabled(ctx.config.feedback),
  })),

  send: protectedProcedure
    .use(rateLimit({ max: 5, windowMs: 10 * 60_000 }))
    .input(zSendFeedback)
    .mutation(async ({ input, ctx }) => {
      if (!feedbackEnabled(ctx.config.feedback)) {
        throw new TRPCBadRequestError(
          'This server does not take feedback in the app'
        );
      }
      const email = ctx.session.user?.email;
      const result = await deliverFeedback(
        {
          config: ctx.config.feedback,
          fetch: (url, init) => fetch(url, init),
          sendEmail: (options) => sendEmail('feedback', options),
          logger: ctx.logger,
        },
        {
          type: input.type,
          message: input.message,
          page: input.page,
          organizationId: input.organizationId,
          projectId: input.projectId,
          replyTo: input.allowReply && email ? email : undefined,
          userAgent: ctx.headers.get('user-agent') ?? undefined,
        }
      );
      if (!result.delivered) {
        throw new TRPCInternalServerError(
          'Your feedback could not be sent. Please try again in a minute.'
        );
      }
      return { ok: true as const, issueNumber: result.issueNumber };
    }),
});
