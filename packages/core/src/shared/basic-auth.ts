// HTTP Basic auth for operator-only surfaces. Browsers prompt for the
// credentials, so such a surface needs no UI of its own.

import { createHash, timingSafeEqual } from 'node:crypto';

export interface BasicAuthCredentials {
  username: string;
  password: string;
}

const BASIC_SCHEME = 'basic';

/**
 * Constant time whatever the inputs: both sides are hashed to 32 bytes first.
 * Comparing lengths before `timingSafeEqual` returned early on a mismatch and
 * so told a caller the secret's length (Cloudflare Workers best practices).
 */
function safeEqual(a: string, b: string): boolean {
  const left = createHash('sha256').update(a).digest();
  const right = createHash('sha256').update(b).digest();
  return timingSafeEqual(left, right);
}

/** Whether an `Authorization` header carries exactly these credentials. */
export function matchesBasicAuth(
  header: string | null | undefined,
  expected: BasicAuthCredentials
): boolean {
  const [scheme, encoded] = (header ?? '').split(' ');
  if (scheme?.toLowerCase() !== BASIC_SCHEME || !encoded) {
    return false;
  }

  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const separator = decoded.indexOf(':');
  if (separator === -1) {
    return false;
  }

  return (
    safeEqual(decoded.slice(0, separator), expected.username) &&
    safeEqual(decoded.slice(separator + 1), expected.password)
  );
}

/** The header that makes a browser show its credentials prompt. */
export function basicAuthChallenge(realm: string): Record<string, string> {
  return { 'WWW-Authenticate': `Basic realm="${realm}"` };
}
