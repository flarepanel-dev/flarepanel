/**
 * The behaviour every platform store must share. Runs under `bun:test` and
 * vitest alike: the caller passes its own `describe`/`test`/`expect`.
 *
 *   storeContract({ describe, test, expect }, 'memory', () => createMemoryStores());
 */

import type { PlatformStores } from '../ports';

interface Expectation {
  toBe(expected: unknown): void;
  toBeNull(): void;
  toBeGreaterThan(expected: number): void;
  toBeLessThanOrEqual(expected: number): void;
}

export interface TestApi {
  describe(name: string, fn: () => void): void;
  test(name: string, fn: () => Promise<void>, timeoutMs?: number): void;
  expect(value: unknown): Expectation;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let counter = 0;
/** Unique per test, so implementations backed by a shared server never collide. */
const uniqueKey = (name: string) =>
  `contract:${name}:${Date.now()}:${counter++}:${Math.random().toString(36).slice(2)}`;

export function storeContract(
  { describe, test, expect }: TestApi,
  label: string,
  create: () => PlatformStores | Promise<PlatformStores>
) {
  describe(`platform stores contract (${label})`, () => {
    test('coordination: get, set and delete', async () => {
      const { coordination } = await create();
      const key = uniqueKey('basic');
      expect(await coordination.get(key)).toBeNull();
      await coordination.set(key, 'a');
      expect(await coordination.get(key)).toBe('a');
      expect(await coordination.ttl(key)).toBeNull();
      await coordination.delete(key);
      expect(await coordination.get(key)).toBeNull();
    });

    test('coordination: values expire', async () => {
      const { coordination } = await create();
      const key = uniqueKey('expire');
      await coordination.set(key, 'a', 80);
      const ttl = await coordination.ttl(key);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl ?? 0).toBeLessThanOrEqual(80);
      await sleep(200);
      expect(await coordination.get(key)).toBeNull();
      expect(await coordination.ttl(key)).toBeNull();
    });

    test('coordination: setIfAbsent only sets once, again after expiry', async () => {
      const { coordination } = await create();
      const key = uniqueKey('nx');
      expect(await coordination.setIfAbsent(key, 'first', 80)).toBe(true);
      expect(await coordination.setIfAbsent(key, 'second', 80)).toBe(false);
      expect(await coordination.get(key)).toBe('first');
      await sleep(200);
      expect(await coordination.setIfAbsent(key, 'third', 1000)).toBe(true);
      expect(await coordination.get(key)).toBe('third');
    });

    test('coordination: deleteIfEquals and extendIfEquals check the value', async () => {
      const { coordination } = await create();
      const key = uniqueKey('cas');
      await coordination.set(key, 'token-a', 150);
      expect(await coordination.extendIfEquals(key, 'token-b', 5000)).toBe(
        false
      );
      expect(await coordination.extendIfEquals(key, 'token-a', 5000)).toBe(
        true
      );
      await sleep(250);
      expect(await coordination.get(key)).toBe('token-a');
      expect(await coordination.deleteIfEquals(key, 'token-b')).toBe(false);
      expect(await coordination.deleteIfEquals(key, 'token-a')).toBe(true);
      expect(await coordination.get(key)).toBeNull();
      expect(await coordination.deleteIfEquals(key, 'token-a')).toBe(false);
    });

    test('coordination: increment counts within a window that opens on the first hit', async () => {
      const { coordination } = await create();
      const key = uniqueKey('incr');
      const first = await coordination.increment(key, 120);
      expect(first.count).toBe(1);
      expect(first.ttlMs).toBeGreaterThan(0);
      expect(first.ttlMs).toBeLessThanOrEqual(120);
      const second = await coordination.increment(key, 120);
      expect(second.count).toBe(2);
      expect(second.ttlMs).toBeLessThanOrEqual(first.ttlMs);
      await sleep(250);
      expect((await coordination.increment(key, 120)).count).toBe(1);
    });

    test('coordination: increment re-arms a counter without expiry', async () => {
      const { coordination } = await create();
      const key = uniqueKey('rearm');
      await coordination.set(key, '5');
      const next = await coordination.increment(key, 1000);
      expect(next.count).toBe(6);
      expect(next.ttlMs).toBeGreaterThan(0);
    });

    test('coordination: concurrent increments are atomic', async () => {
      const { coordination } = await create();
      const key = uniqueKey('atomic');
      const results = await Promise.all(
        Array.from({ length: 25 }, () => coordination.increment(key, 5000))
      );
      const counts = results.map((r) => r.count).sort((a, b) => a - b);
      expect(counts.join(',')).toBe(
        Array.from({ length: 25 }, (_, i) => i + 1).join(',')
      );
    });

    test('coordination: ping', async () => {
      const { coordination } = await create();
      expect(await coordination.ping()).toBe(true);
    });

    test('cache: get, set and delete', async () => {
      const { cache } = await create();
      const key = uniqueKey('cache');
      expect(await cache.get(key)).toBeNull();
      await cache.set(key, '{"a":1}', 60);
      expect(await cache.get(key)).toBe('{"a":1}');
      await cache.delete(key);
      expect(await cache.get(key)).toBeNull();
    });
  });
}
