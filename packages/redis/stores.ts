/**
 * Redis implementations of the platform stores (`@flarepanel/platform`), used
 * while the API runs on Bun. The Cloudflare build swaps in KV-free versions
 * (Cache API, Durable Objects) behind the same interfaces.
 */

import type {
  CacheStore,
  CoordinationStore,
  PlatformStores,
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

export function createRedisStores(redis: Redis): PlatformStores {
  return {
    cache: new RedisCacheStore(redis),
    coordination: new RedisCoordinationStore(redis),
  };
}
