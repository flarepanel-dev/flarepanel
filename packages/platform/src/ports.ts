/**
 * Platform stores: the small set of key-value operations FlarePanel needs
 * outside the event pipeline. Each has a Redis implementation (the Bun API
 * today), an in-memory one (tests, single-process dev) and a Cloudflare one
 * (Workers). Every implementation must pass `testing/contract.ts`.
 */

/**
 * A best-effort cache: values may disappear at any time and reads may be
 * stale. Never store anything here that cannot be recomputed.
 *
 * Cloudflare: the Cache API (per data center, no write limits).
 */
export interface CacheStore {
  get(key: string): Promise<string | null>;
  /** `ttlSeconds` must be at least 1. */
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface WindowCount {
  /** Hits in the current window, including this one. */
  count: number;
  /** Milliseconds until the window resets. */
  ttlMs: number;
}

/**
 * Strongly consistent key-value with expiry and atomic operations, for locks,
 * rate limits and counters. Values are strings.
 *
 * Cloudflare: a Durable Object (single-threaded per key shard).
 */
export interface CoordinationStore {
  get(key: string): Promise<string | null>;
  /** Without `ttlMs` the key does not expire. */
  set(key: string, value: string, ttlMs?: number): Promise<void>;
  /** Sets only when the key is absent (or expired). True when it was set. */
  setIfAbsent(key: string, value: string, ttlMs: number): Promise<boolean>;
  delete(key: string): Promise<void>;
  /** Deletes only when the key holds `value` (lock release). */
  deleteIfEquals(key: string, value: string): Promise<boolean>;
  /** Re-arms the expiry only when the key holds `value` (lock renewal). */
  extendIfEquals(key: string, value: string, ttlMs: number): Promise<boolean>;
  /**
   * Adds 1 to a counter. The window (expiry `windowMs`) opens on the first hit
   * and is re-armed when the key somehow has no expiry, so a counter can never
   * count up forever.
   */
  increment(key: string, windowMs: number): Promise<WindowCount>;
  /** Milliseconds until expiry; `null` when the key is absent or never expires. */
  ttl(key: string): Promise<number | null>;
  /** True when the store answers. */
  ping(): Promise<boolean>;
}

export interface Subscription {
  /** Stops delivery to this listener. Safe to call twice. */
  unsubscribe(): void;
  /** Settles once messages published from now on will be delivered. */
  ready: Promise<void>;
}

/**
 * Fire-and-forget fan-out between processes (live dashboards, ops signals).
 * At-most-once: a message published while nobody listens is dropped.
 *
 * Cloudflare: a Durable Object hub holding hibernating WebSockets.
 */
export interface PubSub {
  /** Returns how many subscribers it reached (best effort). */
  publish(channel: string, message: string): Promise<number>;
  subscribe(channel: string, listener: (message: string) => void): Subscription;
}

export interface PlatformStores {
  cache: CacheStore;
  coordination: CoordinationStore;
  pubsub: PubSub;
}
