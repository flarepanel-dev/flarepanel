import { describe, expect, it } from 'bun:test';
import {
  AnalyticsPausedError,
  type EventStore,
  isAnalyticsPaused,
} from '@flarepanel/core';
import { MemoryCacheStore } from '@flarepanel/platform';
import { createPauseCheck, guardAnalyticsPause } from './analytics-pause';

const over = {
  subscriptionPeriodEventsCount: 120,
  subscriptionPeriodEventsLimit: 100,
  subscriptionPeriodEventsCountExceededAt: new Date(),
};
const under = { ...over, subscriptionPeriodEventsCount: 80 };

function fakeStore() {
  const calls: string[] = [];
  const handler =
    (name: string) =>
    (..._args: unknown[]) => {
      calls.push(name);
      return Promise.resolve(
        name === 'exportRead' ? { eventsJson: '[1]', through: 5 } : name
      );
    };
  const store = new Proxy(
    {},
    { get: (_t, property) => handler(String(property)) }
  ) as unknown as EventStore;
  return { store, calls };
}

describe('over-limit analytics pause', () => {
  it('pauses only hosted workspaces marked over a real limit', () => {
    expect(isAnalyticsPaused(over, false)).toBe(true);
    expect(isAnalyticsPaused(over, true)).toBe(false);
    expect(isAnalyticsPaused(under, false)).toBe(false);
    expect(
      isAnalyticsPaused(
        { ...over, subscriptionPeriodEventsCountExceededAt: null },
        false
      )
    ).toBe(false);
    expect(
      isAnalyticsPaused({ ...over, subscriptionPeriodEventsLimit: 0 }, false)
    ).toBe(false);
  });

  it('refuses reads but lets collection, counting, imports and writes through', async () => {
    const { store, calls } = fakeStore();
    const guarded = guardAnalyticsPause(store, () => Promise.resolve(true));
    const read = guarded as unknown as Record<
      string,
      (...a: unknown[]) => Promise<unknown>
    >;
    await expect(read.series!('p1', {})).rejects.toBeInstanceOf(
      AnalyticsPausedError
    );
    await expect(read.cohorts!('p1', { kind: 'list' })).rejects.toBeInstanceOf(
      AnalyticsPausedError
    );
    expect(await read.countEvents!('p1')).toBe('countEvents');
    expect(await read.importOp!('p1')).toBe('importOp');
    expect(await read.publishNotification!('p1')).toBe('publishNotification');
    expect(await read.cohorts!('p1', { kind: 'compute' })).toBe('cohorts');
    expect(await read.groups!('p1', { kind: 'upsert' })).toBe('groups');
    expect(await read.gsc!('p1', { kind: 'write' })).toBe('gsc');
    await expect(read.gsc!('p1', { kind: 'overview' })).rejects.toBeInstanceOf(
      AnalyticsPausedError
    );
    // An export waits: nothing to read, so nothing is acknowledged.
    expect(await read.exportRead!('p1')).toEqual({
      eventsJson: '[]',
      through: 0,
    });
    expect(calls).not.toContain('series');
    expect(calls).not.toContain('exportRead');
  });

  it('passes everything through when not paused', async () => {
    const { store } = fakeStore();
    const guarded = guardAnalyticsPause(store, () => Promise.resolve(false));
    const read = guarded as unknown as Record<
      string,
      (...a: unknown[]) => Promise<unknown>
    >;
    expect(await read.series!('p1', {})).toBe('series');
    expect(await read.exportRead!('p1')).toEqual({
      eventsJson: '[1]',
      through: 5,
    });
  });

  it('caches the answer per project and never looks up self-hosted', async () => {
    let lookups = 0;
    const check = createPauseCheck({
      cache: new MemoryCacheStore(),
      selfHosted: () => false,
      organizationOf: () => {
        lookups++;
        return Promise.resolve(over);
      },
    });
    expect(await check('p1')).toBe(true);
    expect(await check('p1')).toBe(true);
    expect(lookups).toBe(1);

    const selfHosted = createPauseCheck({
      cache: new MemoryCacheStore(),
      selfHosted: () => true,
      organizationOf: () => {
        lookups++;
        return Promise.resolve(over);
      },
    });
    expect(await selfHosted('p1')).toBe(false);
    expect(lookups).toBe(1);
  });
});
