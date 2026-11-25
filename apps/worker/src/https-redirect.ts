// Plain-HTTP visits are sent to HTTPS before anything else runs. Cloudflare's
// "Always Use HTTPS" zone switch does the same at the edge; this keeps the
// API safe when that switch is off, and HSTS only helps after a first
// HTTPS visit.
//
// The scheme comes from `cf-visitor`, which Cloudflare's edge sets to what the
// visitor really used. `request.url` cannot tell: local `wrangler dev` hands
// the Worker the production hostname over plain HTTP, and it sets no
// `cf-visitor`, so local development is never redirected.

function visitorScheme(request: Request): string | undefined {
  try {
    const visitor = JSON.parse(request.headers.get('cf-visitor') ?? '{}');
    return typeof visitor?.scheme === 'string' ? visitor.scheme : undefined;
  } catch {
    return undefined;
  }
}

/** A redirect to the HTTPS URL, or null when the request needs none. */
export function httpsRedirect(request: Request): Response | null {
  if (visitorScheme(request) !== 'http') {
    return null;
  }
  const url = new URL(request.url);
  url.protocol = 'https:';
  // 308 keeps the method and body, so an SDK posting to http:// keeps working.
  const status =
    request.method === 'GET' || request.method === 'HEAD' ? 301 : 308;
  return new Response(null, {
    status,
    headers: { location: url.toString(), 'cache-control': 'no-store' },
  });
}
