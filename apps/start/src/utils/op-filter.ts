import type { TrackHandlerPayload } from '@flarepanel/web';

// These pages carry a credential in the URL: a reset token, an unsubscribe
// token, or an email verification token (which signs in).
const PATHS_WITH_URL_CREDENTIALS = new Set([
  '/reset-password',
  '/unsubscribe',
  '/verify-email',
]);

// Outgoing-link events carry their destination in `href`.
const URL_PROPERTIES = ['__path', '__referrer', 'href'] as const;

function pointsAtCredentialPage(url: unknown): boolean {
  if (typeof url !== 'string' || url === '') {
    return false;
  }
  try {
    const { pathname } = new URL(url, window.location.origin);
    return PATHS_WITH_URL_CREDENTIALS.has(pathname);
  } catch {
    return false;
  }
}

/** Drops any event that would send a credential-bearing URL to analytics. */
export function shouldSendAnalyticsEvent(event: TrackHandlerPayload): boolean {
  const onCredentialPage = pointsAtCredentialPage(window.location.href);
  if (onCredentialPage) {
    return false;
  }
  const properties: Record<string, unknown> =
    'properties' in event.payload && event.payload.properties
      ? event.payload.properties
      : {};
  return !URL_PROPERTIES.some((key) => pointsAtCredentialPage(properties[key]));
}
