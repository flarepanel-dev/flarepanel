// The HTTP limiter: a fixed window with no escalation, matching the published
// rate-limit docs.

import { getPlatformStores } from '@flarepanel/platform';
import { Elysia } from 'elysia';
import type { IpHeaderConfig } from '../config';
import type { AppDeps } from '../context';
import type { Logger } from '../logger';
import { getTrustedIpFromHeaders } from '../shared/get-client-ip';
import { requestContext } from './context';

const TOO_MANY_REQUESTS = 429;

/** Exact response body the rate-limit docs publish. */
const TOO_MANY_REQUESTS_BODY = {
  statusCode: TOO_MANY_REQUESTS,
  error: 'Too Many Requests',
  message: 'You have exceeded the rate limit for this endpoint.',
} as const;

const MCP_TOKEN_SEPARATOR = ':';

/**
 * Per-address budgets on top of the per-client limits. A client id is
 * unverified when the limiter runs, so rotating it buys fresh client buckets;
 * the address budget caps how often one caller reaches the secret check. Set
 * well above one client's limit because many clients share an egress
 * (offices, CI, hosted AI clients for MCP).
 */
const MANAGE_IP_BUDGET = { max: 200, windowMs: 10_000 } as const;
const EXPORT_IP_BUDGET = { max: 1000, windowMs: 10_000 } as const;
const INSIGHTS_IP_BUDGET = { max: 1000, windowMs: 10_000 } as const;
const MCP_IP_BUDGET = { max: 3000, windowMs: 60_000 } as const;

/**
 * Who a bucket belongs to. The limiter runs before authentication, so a
 * caller-supplied id only names the bucket where it also names the credential
 * that request is checked against:
 * - `client`: the `openpanel-client-id` header the route authenticates.
 * - `mcp-token`: the client id inside the MCP token, which MCP authenticates;
 *   its callers share egress addresses (hosted AI clients), so not only the ip.
 * - `ip`: an unauthenticated route, where any header is free to rotate.
 */
export type RateLimitKey = 'client' | 'mcp-token' | 'ip';

function mcpTokenClientId(request: Request): string | undefined {
  const token =
    new URL(request.url).searchParams.get('token') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return undefined;
  }
  const decoded = Buffer.from(token, 'base64').toString('utf-8');
  const separator = decoded.indexOf(MCP_TOKEN_SEPARATOR);
  return separator > 0 ? decoded.slice(0, separator) : undefined;
}

function callerIdFor(
  keyBy: RateLimitKey,
  request: Request
): string | undefined {
  if (keyBy === 'client') {
    return request.headers.get('openpanel-client-id') ?? undefined;
  }
  if (keyBy === 'mcp-token') {
    return mcpTokenClientId(request);
  }
  return undefined;
}

export interface RateLimitCaller {
  request: Request;
  ipHeaders: IpHeaderConfig;
  remoteAddress?: string;
}

/** Never a caller-set header: an attribution address would rotate freely. */
function ipFingerprint({
  request,
  ipHeaders,
  remoteAddress,
}: RateLimitCaller): string {
  const { ip } = getTrustedIpFromHeaders(
    ipHeaders,
    request.headers,
    remoteAddress
  );
  // Fail closed: an edge that stops forwarding IPs should throttle, not open.
  return `ip:${ip || 'unknown'}`;
}

export function fingerprintFor(
  keyBy: RateLimitKey,
  caller: RateLimitCaller
): string {
  const clientId = callerIdFor(keyBy, caller.request);
  if (clientId) {
    return `client:${clientId}`;
  }
  return ipFingerprint(caller);
}

interface RateLimitWindow {
  /** Requests allowed per window. */
  max: number;
  windowMs: number;
}

export interface HttpRateLimit extends RateLimitWindow {
  /** Groups every route under one bucket. */
  scope: string;
  keyBy: RateLimitKey;
  /** A second bucket per trusted address, counted on every request. */
  ipBudget?: RateLimitWindow;
}

interface Bucket extends RateLimitWindow {
  key: string;
}

export function bucketsFor(
  { max, windowMs, scope, keyBy, ipBudget }: HttpRateLimit,
  caller: RateLimitCaller
): Bucket[] {
  const buckets: Bucket[] = [
    {
      key: `rl:http:${scope}:${fingerprintFor(keyBy, caller)}`,
      max,
      windowMs,
    },
  ];
  if (ipBudget) {
    buckets.push({
      key: `rl:http:${scope}:budget:${ipFingerprint(caller)}`,
      ...ipBudget,
    });
  }
  return buckets;
}

/**
 * `true` when the caller is over its limit and the request must be refused.
 * A store failure allows the request: this guards a documented quota, not a
 * credential.
 */
export async function isRateLimited(
  limit: HttpRateLimit,
  caller: RateLimitCaller,
  logger: Logger
): Promise<boolean> {
  const buckets = bucketsFor(limit, caller);

  try {
    const store = getPlatformStores().coordination;
    // The window opens on the first hit; the store re-arms a counter that lost
    // its expiry, so it can never count up forever and lock the caller out.
    const counts = await Promise.all(
      buckets.map(({ key, windowMs }) => store.increment(key, windowMs))
    );

    let isLimited = false;
    for (const [index, { key, max, windowMs }] of buckets.entries()) {
      const hits = counts[index]?.count ?? 1;

      if (hits > max) {
        logger.warn(
          { scope: limit.scope, key, hits, max, windowMs },
          'rate limit exceeded'
        );
        isLimited = true;
      }
    }
    return isLimited;
  } catch (error) {
    logger.error(
      { err: error, scope: limit.scope },
      'rate limit store unavailable'
    );
    return false;
  }
}

/**
 * The first matching prefix wins. `/export`, `/insights` and `/manage` are the
 * published limits; `/track`, `/profile` and `/import` are absent on purpose:
 * the docs promise they are unlimited. `/misc/favicon` asks third-party icon
 * services on the caller's behalf, and one dashboard page loads a few dozen
 * icons at once.
 */
export const HTTP_RATE_LIMITS: readonly (HttpRateLimit & {
  prefix: string;
})[] = [
  {
    prefix: '/manage',
    scope: 'manage',
    keyBy: 'client',
    ipBudget: MANAGE_IP_BUDGET,
    max: 20,
    windowMs: 10_000,
  },
  {
    prefix: '/export',
    scope: 'export',
    keyBy: 'client',
    ipBudget: EXPORT_IP_BUDGET,
    max: 100,
    windowMs: 10_000,
  },
  {
    prefix: '/insights',
    scope: 'insights',
    keyBy: 'client',
    ipBudget: INSIGHTS_IP_BUDGET,
    max: 100,
    windowMs: 10_000,
  },
  {
    prefix: '/mcp',
    scope: 'mcp',
    keyBy: 'mcp-token',
    ipBudget: MCP_IP_BUDGET,
    max: 60,
    windowMs: 60_000,
  },
  {
    prefix: '/misc/favicon',
    scope: 'favicon',
    keyBy: 'ip',
    max: 100,
    windowMs: 10_000,
  },
  // The public tools fetch other sites. Their own limiter is a per-process
  // map, which on Workers only counts inside one isolate; this one is shared.
  {
    prefix: '/tools/site-checker',
    scope: 'site-checker',
    keyBy: 'ip',
    max: 10,
    windowMs: 60_000,
  },
  {
    prefix: '/tools/ip-lookup',
    scope: 'ip-lookup',
    keyBy: 'ip',
    max: 20,
    windowMs: 60_000,
  },
];

export function limitFor(pathname: string): HttpRateLimit | undefined {
  return HTTP_RATE_LIMITS.find((limit) => pathname.startsWith(limit.prefix));
}

/** The part of Bun's server Elysia hands a hook: the peer address. */
interface SocketAddressSource {
  requestIP(request: Request): { address: string } | null;
}

/** Mounted once per route surface so a new `/manage` route cannot arrive without a limit. */
export function httpRateLimit(deps: AppDeps) {
  return new Elysia({ name: 'core/http/rate-limit' })
    .use(requestContext(deps))
    .onBeforeHandle({ as: 'global' }, async (context) => {
      const { ctx, request, path, set } = context;
      const server: SocketAddressSource | null = context.server;
      const limit = limitFor(path);
      if (!limit) {
        return;
      }
      // `ctx` is absent for a request that matched no route, and an unmatched
      // path deserves its 404 rather than a quota.
      if (!ctx) {
        return;
      }
      const limited = await isRateLimited(
        limit,
        {
          request,
          ipHeaders: deps.config.ipHeaders,
          remoteAddress: server?.requestIP(request)?.address,
        },
        ctx.logger
      );
      if (limited) {
        set.status = TOO_MANY_REQUESTS;
        return TOO_MANY_REQUESTS_BODY;
      }
    });
}

export { TOO_MANY_REQUESTS, TOO_MANY_REQUESTS_BODY };
