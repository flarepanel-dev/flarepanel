import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import type { IClickhouseProfile } from '../../profile/profile.service';
import type { EngineSql, SqlRow } from './engine';
import { openProfileStore } from './profile-store';

const WRITE = /^\s*(INSERT|UPDATE|DELETE|REPLACE)/i;

function createStore() {
  const db = new Database(':memory:');
  const counter = { writes: 0 };
  const sql: EngineSql = {
    exec(query, ...bindings) {
      const statement = db.query(query);
      const values = bindings as SQLQueryBindings[];
      if (WRITE.test(query)) {
        counter.writes += statement.run(...values).changes;
        return [];
      }
      return statement.all(...values) as SqlRow[];
    },
    transaction: (fn) => db.transaction(fn)(),
  };
  return { store: openProfileStore(sql), counter };
}

function profile(
  id: string,
  overrides: Partial<IClickhouseProfile> = {}
): IClickhouseProfile {
  return {
    id,
    first_name: '',
    last_name: '',
    email: '',
    avatar: '',
    properties: {},
    project_id: 'project-profiles',
    is_external: true,
    created_at: '2026-11-23 08:00:00.000',
    last_seen_at: '2026-11-23 08:00:00.000',
    groups: [],
    ...overrides,
  };
}

describe('profile store', () => {
  it('merges identify calls and keeps the first-seen time', () => {
    const { store } = createStore();
    store.upsert(profile('user-1', { email: 'ana@example.com' }));
    store.upsert(
      profile('user-1', {
        first_name: 'Ana',
        properties: { plan: 'team' },
        created_at: '2026-11-23 09:00:00.000',
        last_seen_at: '2026-11-23 09:00:00.000',
      })
    );
    const stored = store.get('user-1');
    expect(stored?.email).toBe('ana@example.com');
    expect(stored?.first_name).toBe('Ana');
    expect(stored?.properties.plan).toBe('team');
    expect(stored?.created_at).toBe('2026-11-23 08:00:00.000');
    expect(stored?.last_seen_at).toBe('2026-11-23 09:00:00.000');
  });

  it('skips a write that only moves last seen by less than an hour', () => {
    const { store, counter } = createStore();
    store.upsert(profile('user-1', { email: 'ana@example.com' }));
    const before = counter.writes;
    store.upsert(
      profile('user-1', {
        email: 'ana@example.com',
        last_seen_at: '2026-11-23 08:30:00.000',
      })
    );
    expect(counter.writes).toBe(before);
    store.upsert(
      profile('user-1', {
        email: 'ana@example.com',
        last_seen_at: '2026-11-23 10:00:00.000',
      })
    );
    expect(counter.writes).toBe(before + 1);
  });

  it('never overwrites an existing profile from an event', () => {
    const { store } = createStore();
    store.upsert(profile('user-1', { email: 'ana@example.com' }));
    store.upsert(profile('user-1', { email: '' }), { onlyIfNew: true });
    expect(store.get('user-1')?.email).toBe('ana@example.com');
  });

  it('lists newest first with search, external filter and pages', () => {
    const { store } = createStore();
    store.upsert(
      profile('user-a', {
        email: 'a@example.com',
        last_seen_at: '2026-11-23 08:00:00.000',
      })
    );
    store.upsert(
      profile('user-b', {
        first_name: 'Bea',
        last_seen_at: '2026-11-23 09:00:00.000',
      })
    );
    store.upsert(
      profile('device-c', {
        is_external: false,
        last_seen_at: '2026-11-23 10:00:00.000',
      })
    );

    const all = store.list({ take: 10 });
    expect(all.count).toBe(3);
    expect(all.profiles.map((p) => p.id)).toEqual([
      'device-c',
      'user-b',
      'user-a',
    ]);
    expect(store.list({ take: 10, search: 'BEA' }).profiles[0]?.id).toBe(
      'user-b'
    );
    expect(store.list({ take: 10, search: '100%' }).count).toBe(0);
    expect(store.list({ take: 10, isExternal: true }).count).toBe(2);
    const second = store.list({ take: 2, cursor: 1 });
    expect(second.profiles.map((p) => p.id)).toEqual(['user-a']);
    expect(second.count).toBe(3);
  });
});
