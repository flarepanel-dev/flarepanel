import { getPlatformStores } from '@flarepanel/platform';
import { LRUCache } from '@flarepanel/redis';
import { TRPCError } from '@trpc/server';
import { getTrustedIpFromHeaders } from '../shared/get-client-ip';
import type { EnforceRateLimit } from './base';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

/** The first block; it doubles on every further strike, up to BLOCK_MAX_MS. */
const BLOCK_BASE_MS = 5 * MINUTE;
const BLOCK_MAX_MS = 24 * HOUR;

/**
 * Strikes decay only after a full quiet day and every new strike pushes the
 * expiry out, so sustained abuse stays at the 24h block.
 */
const STRIKE_TTL_MS = 24 * HOUR;

/** Past this the duration is capped anyway, so stop counting. */
const MAX_STRIKES = Math.ceil(Math.log2(BLOCK_MAX_MS / BLOCK_BASE_MS)) + 1;

/**
 * A blocked client earns further strikes at most once per cooldown: a human
 * clicking "sign in" in frustration adds one, a bot at 5 req/s reaches the cap
 * in under ten minutes.
 */
const ESCALATION_COOLDOWN_MS = MINUTE;

const SECONDS_IN_MINUTE = 60;
const READABLE_SECONDS_LIMIT = 90;
const READABLE_MINUTES_LIMIT = 90;
const FALLBACK_CACHE_MAX = 10_000;

/** Per-process fallback while Redis is unreachable, so sign-in is not left unthrottled. */
const fallbackCounters = new LRUCache<string, number>({
  max: FALLBACK_CACHE_MAX,
  ttl: 5 * MINUTE,
});

const keyFor = (kind: string, path: string, fingerprint: string) =>
  `rl:${kind}:${path}:${fingerprint}`;

function getBlockDurationMs(strikes: number): number {
  return Math.min(BLOCK_BASE_MS * 2 ** (strikes - 1), BLOCK_MAX_MS);
}

function formatDuration(ms: number): string {
  const seconds = Math.ceil(ms / SECOND);
  if (seconds < READABLE_SECONDS_LIMIT) {
    return `${seconds} seconds`;
  }
  const minutes = Math.ceil(seconds / SECONDS_IN_MINUTE);
  if (minutes < READABLE_MINUTES_LIMIT) {
    return `${minutes} minutes`;
  }
  return `${Math.ceil(minutes / SECONDS_IN_MINUTE)} hours`;
}

function tooManyRequests(blockMs: number): TRPCError {
  return new TRPCError({
    code: 'TOO_MANY_REQUESTS',
    message: `Too many requests. Try again in ${formatDuration(blockMs)}.`,
  });
}

/** Record a strike and (re)arm the block. */
async function escalate(
  strikeKey: string,
  blockKey: string,
  cooldownKey: string
): Promise<{ strikes: number; blockMs: number }> {
  const store = getPlatformStores().coordination;

  // Every strike pushes the expiry out again (see STRIKE_TTL_MS), so the
  // count is re-written with a fresh TTL after the atomic increment.
  const { count } = await store.increment(strikeKey, STRIKE_TTL_MS);
  await store.set(strikeKey, String(count), STRIKE_TTL_MS);

  const strikes = Math.min(count, MAX_STRIKES);
  const blockMs = getBlockDurationMs(strikes);

  await Promise.all([
    store.set(blockKey, String(strikes), blockMs),
    store.set(cooldownKey, '1', ESCALATION_COOLDOWN_MS),
  ]);

  return { strikes, blockMs };
}

/**
 * Blocks are keyed per procedure, so an office NAT that trips the sign-in limit
 * does not lose the rest of the dashboard. Every block is logged with the
 * resolved IP so repeat offenders can be blackholed at the edge.
 */
export const enforceRateLimit: EnforceRateLimit = async ({
  headers,
  remoteAddress,
  ipHeaders,
  logger,
  path,
  max,
  windowMs,
}) => {
  const { ip: trustedIp, header: ipHeader } = getTrustedIpFromHeaders(
    ipHeaders,
    headers,
    remoteAddress
  );
  // Everything we cannot identify shares one bucket. Fail closed: an edge that
  // stops forwarding IPs should throttle, not open the gates.
  const fingerprint = trustedIp || 'unknown';

  const counterKey = keyFor('count', path, fingerprint);
  const strikeKey = keyFor('strike', path, fingerprint);
  const blockKey = keyFor('block', path, fingerprint);
  const cooldownKey = keyFor('cooldown', path, fingerprint);

  const logBlocked = (payload: {
    strikes: number;
    blockMs: number;
    hits?: number;
  }) =>
    logger.warn(
      {
        ip: fingerprint,
        ipHeader,
        path,
        userAgent: headers.get('user-agent') ?? undefined,
        strikes: payload.strikes,
        blockedForSeconds: Math.ceil(payload.blockMs / SECOND),
        blockedUntil: new Date(Date.now() + payload.blockMs).toISOString(),
        hits: payload.hits,
        max,
        windowMs,
      },
      'rate limit blocked'
    );

  let blockTtlMs: number;
  let hits: number;

  try {
    const store = getPlatformStores().coordination;
    const [blockTtl, counter] = await Promise.all([
      store.ttl(blockKey),
      // The window opens on the first hit; the store re-arms a counter that
      // lost its expiry, so it can never lock the IP out permanently.
      store.increment(counterKey, windowMs),
    ]);
    blockTtlMs = blockTtl ?? 0;
    hits = counter.count;
  } catch (error) {
    logger.error({ err: error, path }, 'rate limit store unavailable');
    const fallbackHits = (fallbackCounters.get(counterKey) ?? 0) + 1;
    fallbackCounters.set(counterKey, fallbackHits, { ttl: windowMs });
    if (fallbackHits > max) {
      throw tooManyRequests(windowMs);
    }
    return;
  }

  if (blockTtlMs > 0) {
    // Still locked out. Knocking during a block is itself abusive, so it
    // extends the lockout instead of letting it run down — but at most once
    // per cooldown, so a frustrated human cannot punish themselves the way a
    // bot hammering at full speed does.
    let escalated: { strikes: number; blockMs: number } | null = null;

    try {
      const acquired = await getPlatformStores().coordination.setIfAbsent(
        cooldownKey,
        '1',
        ESCALATION_COOLDOWN_MS
      );
      if (acquired) {
        escalated = await escalate(strikeKey, blockKey, cooldownKey);
      }
    } catch (error) {
      logger.error({ err: error, path }, 'rate limit store unavailable');
    }

    if (!escalated) {
      throw tooManyRequests(blockTtlMs);
    }

    logBlocked(escalated);
    throw tooManyRequests(escalated.blockMs);
  }

  if (hits > max) {
    let escalated: { strikes: number; blockMs: number };

    try {
      escalated = await escalate(strikeKey, blockKey, cooldownKey);
      // Start the next window clean so the block, not a stale counter, decides.
      await getPlatformStores().coordination.delete(counterKey);
    } catch (error) {
      logger.error({ err: error, path }, 'rate limit store unavailable');
      throw tooManyRequests(windowMs);
    }

    logBlocked({ ...escalated, hits });
    throw tooManyRequests(escalated.blockMs);
  }
};

export const __testing = {
  BLOCK_BASE_MS,
  BLOCK_MAX_MS,
  MAX_STRIKES,
  ESCALATION_COOLDOWN_MS,
  getBlockDurationMs,
  formatDuration,
};
