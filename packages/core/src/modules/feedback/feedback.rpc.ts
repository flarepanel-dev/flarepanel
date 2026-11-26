// "Give feedback" in the dashboard. `config` tells the dashboard whether this
// server takes feedback in the app (and screenshots); `send` delivers one
// message (see feedback.service.ts). Rate limited per client IP.

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
  isImage,
  MAX_SCREENSHOT_BYTES,
  MAX_SCREENSHOTS,
  SCREENSHOT_TYPES,
} from './feedback.service';

const rateLimit = createRateLimitMiddleware(enforceRateLimit);

// Base64 grows by a third; leave a little room for padding.
const MAX_BASE64 = Math.ceil((MAX_SCREENSHOT_BYTES * 4) / 3) + 8;

export const zSendFeedback = z.object({
  type: z.enum(FEEDBACK_TYPES),
  message: z.string().trim().min(3).max(4000),
  page: z.string().max(300).optional(),
  allowReply: z.boolean().default(true),
  organizationId: z.string().max(100).optional(),
  projectId: z.string().max(100).optional(),
  screenshots: z
    .array(
      z.object({
        contentType: z.enum(SCREENSHOT_TYPES),
        data: z.string().max(MAX_BASE64),
      })
    )
    .max(MAX_SCREENSHOTS)
    .default([]),
});

export const feedbackRouter = createTRPCRouter({
  config: protectedProcedure.query(({ ctx }) => ({
    inApp: feedbackEnabled(ctx.config.feedback),
    screenshots: Boolean(ctx.feedbackAttachments),
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

      // Decode and check every screenshot before storing any of them.
      const images = input.screenshots.map(({ contentType, data }) => {
        const bytes = Uint8Array.from(Buffer.from(data, 'base64'));
        if (bytes.length === 0 || bytes.length > MAX_SCREENSHOT_BYTES) {
          throw new TRPCBadRequestError('A screenshot is too large.');
        }
        if (!isImage(bytes, contentType)) {
          throw new TRPCBadRequestError(
            'Screenshots must be PNG, JPEG or WebP images.'
          );
        }
        return { bytes, contentType };
      });
      if (images.length > 0 && !ctx.feedbackAttachments) {
        throw new TRPCBadRequestError(
          'This server does not take screenshots with feedback.'
        );
      }
      const store = ctx.feedbackAttachments;
      const screenshots = store
        ? await Promise.all(
            images.map((i) => store.put(i.bytes, i.contentType))
          )
        : [];

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
          screenshots,
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
