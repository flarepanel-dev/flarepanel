// RAW BYTES, deliberately: `validatePolarEvent` verifies Polar's signature over
// the exact request body, so this handler reads `await request.text` and
// declares no `body` schema — any parsing (JSON or otherwise) before the
// signature check breaks it.
//
// `parse: 'none'` is what makes that possible: Elysia parses the body before
// the handler runs by default, and reading the consumed stream throws "Body
// already used".

import { defineRoutes } from '../../http/define';

/** The Polar SDK's verification errors, matched by name (it loads lazily). */
export function isSignatureFailure(err: unknown): boolean {
  if (!(err instanceof Error)) {
    return false;
  }
  return (
    err.name === 'WebhookVerificationError' ||
    err.constructor?.name === 'WebhookVerificationError' ||
    /secret can't be empty|signature|missing required headers|timestamp too (old|new)/i.test(
      err.message
    )
  );
}

export const subscriptionRoutes = defineRoutes((app) =>
  app.post(
    '/webhook/polar',
    async ({ request, ctx, status }) => {
      const rawBody = await request.text();
      const headers = Object.fromEntries(request.headers);

      try {
        await ctx.services.subscription.handlePolarWebhookEvent(
          rawBody,
          headers,
          ctx.logger
        );
      } catch (err) {
        // A forged or unsigned request (or no webhook secret configured, which
        // the SDK refuses to verify against) is the caller's fault, not ours:
        // 401, so it never looks like an outage. Polar retries real failures
        // on 5xx only.
        if (isSignatureFailure(err)) {
          return status(401, 'Invalid signature');
        }
        return status(500, 'Error');
      }

      return status(202, 'OK');
    },
    { parse: 'none' }
  )
);
