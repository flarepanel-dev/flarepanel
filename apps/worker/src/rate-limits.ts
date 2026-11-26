// Per-IP caps checked at the edge, before the app boots or any Durable
// Object runs. Cloudflare's rate limiting binding counts per location and is
// eventually consistent: it stops floods and guessing, not one extra request.

const TOO_MANY_REQUESTS = 429;
// Not `/track/crawl`: it is called from customers' servers and Workers, which
// share egress addresses, so a per-IP cap would throttle them together. It
// needs the client secret, and the project's bot store caps what it keeps.
const INGEST_PATHS = new Set(['/track', '/event']);

/** The part of the Workers `RateLimit` binding used here. */
export interface EdgeLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface EdgeLimiters {
  /** /track and /event. */
  TRACK_LIMITER?: EdgeLimiter;
  /**
   * /mcp. Every call with an unknown secret costs a password-hash check. The
   * app's own limiter keys /mcp by the client id inside the token, so a
   * caller rotating fake ids only met its 3000/min per-IP budget; this edge
   * cap refuses earlier and cheaper, before the app boots.
   */
  MCP_LIMITER?: EdgeLimiter;
}

function limiterFor(
  request: Request,
  pathname: string,
  env: EdgeLimiters
): EdgeLimiter | undefined {
  if (request.method !== 'POST') {
    return;
  }
  if (INGEST_PATHS.has(pathname)) {
    return env.TRACK_LIMITER;
  }
  if (pathname === '/mcp') {
    return env.MCP_LIMITER;
  }
  return;
}

/**
 * A 429 when the caller's IP is over its cap for this path; `null` lets the
 * request through. A missing binding (local dev, a self-host that removed it)
 * means no cap.
 */
export async function checkEdgeRateLimit(
  request: Request,
  pathname: string,
  env: EdgeLimiters
): Promise<Response | null> {
  const limiter = limiterFor(request, pathname, env);
  if (!limiter) {
    return null;
  }
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const { success } = await limiter.limit({ key: ip });
  if (success) {
    return null;
  }
  if (pathname === '/mcp') {
    // MCP clients read JSON; say what happened and when to retry.
    return Response.json(
      { error: 'Too many requests. Try again in a minute.' },
      { status: TOO_MANY_REQUESTS, headers: { 'retry-after': '60' } }
    );
  }
  return new Response('Too Many Requests', { status: TOO_MANY_REQUESTS });
}
