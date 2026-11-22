/**
 * Cloudflare implementations of the platform stores, for code running inside a
 * Worker. Needs a Durable Object binding to `CoordinatorDurableObject`.
 *
 * Free-plan notes: each coordination call is one Durable Object request
 * (100,000/day free); the cache uses the Cache API, which has no write limit
 * (KV allows only 1,000 writes/day on the free plan). The Cache API is local to
 * each data center and is a no-op on `*.workers.dev`; it works on custom
 * domains.
 */

import type {
  CacheStore,
  CoordinationStore,
  PlatformStores,
  WindowCount,
} from '../ports';
import type { CoordinatorDurableObject } from './coordinator';
import { DurablePubSub, type PubSubHubDurableObject } from './pubsub';

const DEFAULT_SHARDS = 16;
const CACHE_ORIGIN = 'https://platform-cache.flarepanel.internal';

/** FNV-1a: stable, fast, good enough to spread keys over shards. */
function shardOf(key: string, shards: number): number {
  let hash = 0x81_1c_9d_c5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01_00_01_93);
  }
  return (hash >>> 0) % shards;
}

export class DurableCoordinationStore implements CoordinationStore {
  constructor(
    private readonly namespace: DurableObjectNamespace<CoordinatorDurableObject>,
    private readonly shards = DEFAULT_SHARDS
  ) {}

  private stub(key: string) {
    return this.namespace.getByName(`coordinator-${shardOf(key, this.shards)}`);
  }

  get(key: string) {
    return this.stub(key).get(key);
  }

  set(key: string, value: string, ttlMs?: number) {
    return this.stub(key).set(key, value, ttlMs);
  }

  setIfAbsent(key: string, value: string, ttlMs: number) {
    return this.stub(key).setIfAbsent(key, value, ttlMs);
  }

  async delete(key: string) {
    await this.stub(key).delete(key);
  }

  deleteIfEquals(key: string, value: string) {
    return this.stub(key).deleteIfEquals(key, value);
  }

  extendIfEquals(key: string, value: string, ttlMs: number) {
    return this.stub(key).extendIfEquals(key, value, ttlMs);
  }

  async increment(key: string, windowMs: number): Promise<WindowCount> {
    const result = await this.stub(key).increment(key, windowMs);
    return { count: result.count, ttlMs: result.ttlMs };
  }

  ttl(key: string) {
    return this.stub(key).ttl(key);
  }

  async ping() {
    try {
      return await this.namespace.getByName('coordinator-0').ping();
    } catch {
      return false;
    }
  }
}

export class CacheApiStore implements CacheStore {
  constructor(private readonly cache: Cache) {}

  private request(key: string) {
    return new Request(`${CACHE_ORIGIN}/${encodeURIComponent(key)}`);
  }

  async get(key: string) {
    const hit = await this.cache.match(this.request(key));
    return hit ? hit.text() : null;
  }

  async set(key: string, value: string, ttlSeconds: number) {
    const seconds = Math.max(1, Math.ceil(ttlSeconds));
    await this.cache.put(
      this.request(key),
      new Response(value, {
        headers: {
          'Cache-Control': `max-age=${seconds}`,
          'Content-Type': 'text/plain; charset=utf-8',
        },
      })
    );
  }

  async delete(key: string) {
    await this.cache.delete(this.request(key));
  }
}

export interface CloudflarePlatformBindings {
  COORDINATOR: DurableObjectNamespace<CoordinatorDurableObject>;
  PUBSUB_HUB: DurableObjectNamespace<PubSubHubDurableObject>;
}

export async function createCloudflareStores(
  env: CloudflarePlatformBindings,
  cache?: Cache
): Promise<PlatformStores> {
  return {
    cache: new CacheApiStore(cache ?? (await caches.open('flarepanel'))),
    coordination: new DurableCoordinationStore(env.COORDINATOR),
    pubsub: new DurablePubSub(env.PUBSUB_HUB),
  };
}
