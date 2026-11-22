import type {
  CacheStore,
  CoordinationStore,
  PlatformStores,
  PubSub,
  Subscription,
  WindowCount,
} from './ports';

interface Entry {
  value: string;
  /** Epoch ms; `null` never expires. */
  expiresAt: number | null;
}

/** Single-process stores for tests and local development. */
export class MemoryCoordinationStore implements CoordinationStore {
  private readonly entries = new Map<string, Entry>();

  constructor(private readonly now: () => number = Date.now) {}

  private read(key: string): Entry | undefined {
    const entry = this.entries.get(key);
    if (entry?.expiresAt !== null && entry && entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry;
  }

  private expiry(ttlMs: number | undefined): number | null {
    return ttlMs === undefined ? null : this.now() + ttlMs;
  }

  async get(key: string) {
    return this.read(key)?.value ?? null;
  }

  async set(key: string, value: string, ttlMs?: number) {
    this.entries.set(key, { value, expiresAt: this.expiry(ttlMs) });
  }

  async setIfAbsent(key: string, value: string, ttlMs: number) {
    if (this.read(key)) {
      return false;
    }
    this.entries.set(key, { value, expiresAt: this.expiry(ttlMs) });
    return true;
  }

  async delete(key: string) {
    this.entries.delete(key);
  }

  async deleteIfEquals(key: string, value: string) {
    if (this.read(key)?.value !== value) {
      return false;
    }
    this.entries.delete(key);
    return true;
  }

  async extendIfEquals(key: string, value: string, ttlMs: number) {
    const entry = this.read(key);
    if (entry?.value !== value) {
      return false;
    }
    entry.expiresAt = this.expiry(ttlMs);
    return true;
  }

  async increment(key: string, windowMs: number): Promise<WindowCount> {
    const entry = this.read(key);
    const count = (entry ? Number(entry.value) || 0 : 0) + 1;
    const expiresAt =
      entry?.expiresAt == null ? this.now() + windowMs : entry.expiresAt;
    this.entries.set(key, { value: String(count), expiresAt });
    return { count, ttlMs: expiresAt - this.now() };
  }

  async ttl(key: string) {
    const entry = this.read(key);
    return entry?.expiresAt == null ? null : entry.expiresAt - this.now();
  }

  async ping() {
    return true;
  }
}

export class MemoryCacheStore implements CacheStore {
  private readonly store: MemoryCoordinationStore;

  constructor(now: () => number = Date.now) {
    this.store = new MemoryCoordinationStore(now);
  }

  get(key: string) {
    return this.store.get(key);
  }

  set(key: string, value: string, ttlSeconds: number) {
    return this.store.set(key, value, ttlSeconds * 1000);
  }

  delete(key: string) {
    return this.store.delete(key);
  }
}

/** In-process fan-out; delivery is asynchronous like the real backends. */
export class MemoryPubSub implements PubSub {
  private readonly listeners = new Map<
    string,
    Set<(message: string) => void>
  >();

  async publish(channel: string, message: string) {
    const listeners = [...(this.listeners.get(channel) ?? [])];
    queueMicrotask(() => {
      for (const listener of listeners) {
        listener(message);
      }
    });
    return listeners.length;
  }

  subscribe(
    channel: string,
    listener: (message: string) => void
  ): Subscription {
    const set = this.listeners.get(channel) ?? new Set();
    set.add(listener);
    this.listeners.set(channel, set);
    let isActive = true;
    return {
      ready: Promise.resolve(),
      unsubscribe: () => {
        if (!isActive) {
          return;
        }
        isActive = false;
        set.delete(listener);
        if (set.size === 0) {
          this.listeners.delete(channel);
        }
      },
    };
  }
}

export function createMemoryStores(
  now: () => number = Date.now
): PlatformStores {
  return {
    cache: new MemoryCacheStore(now),
    coordination: new MemoryCoordinationStore(now),
    pubsub: new MemoryPubSub(),
  };
}
