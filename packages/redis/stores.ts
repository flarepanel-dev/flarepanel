/**
 * Redis implementations of the platform stores (`@flarepanel/platform`), used
 * while the API runs on Bun. The Cloudflare build swaps in KV-free versions
 * (Cache API, Durable Objects) behind the same interfaces.
 */

import type {
  CacheStore,
  CoordinationStore,
  PlatformStores,
  PubSub,
  Subscription,
  WindowCount,
} from '@flarepanel/platform';
import type Redis from 'ioredis';

// PEXPIRE on the first hit, and re-arm a counter that lost its expiry.
const INCREMENT_SCRIPT = `
local count = redis.call("INCR", KEYS[1])
local ttl = redis.call("PTTL", KEYS[1])
if count == 1 or ttl < 0 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return {count, ttl}`;

const DELETE_IF_EQUALS_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
return 0`;

const EXTEND_IF_EQUALS_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("PEXPIRE", KEYS[1], ARGV[2])
end
return 0`;

export class RedisCoordinationStore implements CoordinationStore {
  constructor(private readonly redis: Redis) {}

  get(key: string) {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlMs?: number) {
    if (ttlMs === undefined) {
      await this.redis.set(key, value);
    } else {
      await this.redis.set(key, value, 'PX', ttlMs);
    }
  }

  async setIfAbsent(key: string, value: string, ttlMs: number) {
    return (await this.redis.set(key, value, 'PX', ttlMs, 'NX')) === 'OK';
  }

  async delete(key: string) {
    await this.redis.del(key);
  }

  async deleteIfEquals(key: string, value: string) {
    return (
      Number(await this.redis.eval(DELETE_IF_EQUALS_SCRIPT, 1, key, value)) ===
      1
    );
  }

  async extendIfEquals(key: string, value: string, ttlMs: number) {
    return (
      Number(
        await this.redis.eval(EXTEND_IF_EQUALS_SCRIPT, 1, key, value, ttlMs)
      ) === 1
    );
  }

  async increment(key: string, windowMs: number): Promise<WindowCount> {
    const [count, ttlMs] = (await this.redis.eval(
      INCREMENT_SCRIPT,
      1,
      key,
      windowMs
    )) as [number, number];
    return { count: Number(count), ttlMs: Number(ttlMs) };
  }

  async ttl(key: string) {
    const ttl = await this.redis.pttl(key);
    return ttl < 0 ? null : ttl;
  }

  async ping() {
    return (await this.redis.ping()) === 'PONG';
  }
}

export class RedisCacheStore implements CacheStore {
  constructor(private readonly redis: Redis) {}

  get(key: string) {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number) {
    await this.redis.setex(key, Math.max(1, Math.ceil(ttlSeconds)), value);
  }

  async delete(key: string) {
    await this.redis.del(key);
  }
}

/**
 * Every subscriber in the process shares ONE subscriber connection. SUBSCRIBE
 * and UNSUBSCRIBE on it are process-wide, so a per-subscriber UNSUBSCRIBE
 * would silence every other subscriber on that channel (closing one `/live`
 * socket once left every other socket receiving nothing). Channels are
 * therefore reference-counted: the wire SUBSCRIBE happens only on 0 -> 1 and
 * the wire UNSUBSCRIBE only on 1 -> 0, and one `message` handler dispatches by
 * channel name. ioredis re-subscribes on reconnect (`autoResubscribe`).
 */
export class RedisPubSub implements PubSub {
  private readonly listeners = new Map<
    string,
    Set<(message: string) => void>
  >();
  private isDispatcherInstalled = false;

  constructor(
    private readonly publisher: () => Redis,
    private readonly subscriber: () => Redis
  ) {}

  publish(channel: string, message: string) {
    return this.publisher().publish(channel, message);
  }

  private installDispatcherOnce() {
    if (this.isDispatcherInstalled) {
      return;
    }
    this.isDispatcherInstalled = true;
    this.subscriber().on('message', (channel: string, message: string) => {
      for (const listener of this.listeners.get(channel) ?? []) {
        listener(message);
      }
    });
  }

  subscribe(
    channel: string,
    listener: (message: string) => void
  ): Subscription {
    this.installDispatcherOnce();
    let ready: Promise<void> = Promise.resolve();
    const existing = this.listeners.get(channel);
    if (existing) {
      existing.add(listener);
    } else {
      this.listeners.set(channel, new Set([listener]));
      ready = this.subscriber()
        .subscribe(channel)
        .then(() => undefined);
    }

    let isActive = true;
    return {
      ready,
      unsubscribe: () => {
        if (!isActive) {
          return;
        }
        isActive = false;
        const set = this.listeners.get(channel);
        if (!set?.delete(listener) || set.size > 0) {
          return;
        }
        this.listeners.delete(channel);
        this.subscriber().unsubscribe(channel);
      },
    };
  }
}

export interface RedisPubSubConnections {
  /** Any command connection. */
  publisher: () => Redis;
  /** A dedicated connection: once subscribed it can run nothing else. */
  subscriber: () => Redis;
}

export function createRedisStores(
  redis: Redis,
  pubsub?: RedisPubSubConnections
): PlatformStores {
  let ownSubscriber: Redis | undefined;
  return {
    cache: new RedisCacheStore(redis),
    coordination: new RedisCoordinationStore(redis),
    pubsub: new RedisPubSub(
      pubsub?.publisher ?? (() => redis),
      pubsub?.subscriber ??
        (() => {
          ownSubscriber ??= redis.duplicate();
          return ownSubscriber;
        })
    ),
  };
}
