// Security headers on every page the dashboard server renders. Static assets
// are served by Workers Assets and never pass through here.

/** Pages made to be embedded on other sites: public widgets and share links. */
const EMBEDDABLE_PREFIXES = ['/widget/', '/share/'];

const ALWAYS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/** No other site may frame the app: blocks clickjacking on settings and deletes. */
const NOT_EMBEDDABLE: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "frame-ancestors 'none'",
};

export function isEmbeddablePath(pathname: string): boolean {
  return EMBEDDABLE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** The headers for a page, leaving any the page already set untouched. */
export function securityHeadersFor(pathname: string): Record<string, string> {
  return isEmbeddablePath(pathname)
    ? { ...ALWAYS }
    : { ...ALWAYS, ...NOT_EMBEDDABLE };
}

export function withSecurityHeaders(
  request: Request,
  response: Response
): Response {
  const { pathname } = new URL(request.url);
  // A WebSocket upgrade (status 101) cannot be rebuilt as a new Response.
  if (response.status === 101) {
    return response;
  }
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(securityHeadersFor(pathname))) {
    if (!headers.has(name)) {
      headers.set(name, value);
    }
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
