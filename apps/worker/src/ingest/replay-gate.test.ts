import { describe, expect, it } from 'bun:test';
import type { ProjectReplayAccess } from '@flarepanel/core';
import {
  MemoryCacheStore,
  MemoryCoordinationStore,
} from '@flarepanel/platform';
import { createReplayGate, type ReplayProject } from './replay-gate';

function project(sessions: Record<string, 'recorded' | 'new'>): ReplayProject {
  return {
    replayState: (id) => Promise.resolve(sessions[id] ?? 'unknown'),
    markReplay: (id) => {
      if (!sessions[id]) {
        return Promise.resolve(false);
      }
      sessions[id] = 'recorded';
      return Promise.resolve(true);
    },
  };
}

function gateFor(access: ProjectReplayAccess | null, p: ReplayProject) {
  let lookups = 0;
  let counter = 0;
  const gate = createReplayGate(
    {
      cache: new MemoryCacheStore(),
      coordination: new MemoryCoordinationStore(),
      config: { hosted: true, selfHostedMonthlySessions: null },
      lookupAccess: () => {
        lookups++;
        return Promise.resolve(access);
      },
      countRecordedSession: () => Promise.resolve(++counter),
    },
    'p1',
    p
  );
  return { gate, lookups: () => lookups, counted: () => counter };
}

const allowed = (limit: number | null): ProjectReplayAccess => ({
  organizationId: 'o1',
  access: { allowed: true, limit },
});

describe('replay gate', () => {
  it('refuses an organization without replay, before asking the project', async () => {
    const asked: string[] = [];
    const p: ReplayProject = {
      replayState: (id) => {
        asked.push(id);
        return Promise.resolve('new');
      },
      markReplay: () => Promise.resolve(true),
    };
    const { gate } = gateFor(
      { organizationId: 'o1', access: { allowed: false, reason: 'plan' } },
      p
    );
    expect(await gate('s1', 0)).toBe('refused');
    expect(asked).toEqual([]);
  });

  it('records new sessions up to the monthly limit, then refuses', async () => {
    const { gate, lookups, counted } = gateFor(
      allowed(2),
      project({ a: 'new', b: 'new', c: 'new', d: 'recorded' })
    );
    expect(await gate('a', 0)).toBe('recorded');
    expect(await gate('b', 0)).toBe('recorded');
    expect(await gate('c', 0)).toBe('refused');
    // A session already recorded is not counted again.
    expect(await gate('d', 0)).toBe('recorded');
    expect(await gate('zzz', 0)).toBe('unknown');
    expect(counted()).toBe(3);
    // The plan lookup is cached across sessions.
    expect(lookups()).toBe(1);
  });

  it('does not count when there is no limit', async () => {
    const { gate, counted } = gateFor(allowed(null), project({ a: 'new' }));
    expect(await gate('a', 0)).toBe('recorded');
    expect(counted()).toBe(0);
  });
});
