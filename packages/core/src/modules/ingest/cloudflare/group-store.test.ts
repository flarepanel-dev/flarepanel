import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import type { IClickhouseEvent } from '../../event/event.service';
import type { IClickhouseProfile } from '../../profile/profile.service';
import type { EngineSql, SqlRow } from './engine';
import { GroupSummaryAccumulator } from './group-scan';
import { openGroupStore } from './group-store';
import { openProfileStore } from './profile-store';

const NOW = Date.UTC(2026, 10, 23, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

function createStores() {
  const db = new Database(':memory:');
  const sql: EngineSql = {
    exec(query, ...bindings) {
      return db
        .query(query)
        .all(...(bindings as SQLQueryBindings[])) as SqlRow[];
    },
    transaction: (fn) => db.transaction(fn)(),
  };
  let now = NOW;
  return {
    profiles: openProfileStore(sql),
    groups: openGroupStore(sql, () => now),
    advance: (ms: number) => {
      now += ms;
    },
  };
}

function profile(
  id: string,
  groups: string[],
  createdAt: string,
  extra: Partial<IClickhouseProfile> = {}
): IClickhouseProfile {
  return {
    id,
    first_name: '',
    last_name: '',
    email: '',
    avatar: '',
    properties: {},
    project_id: 'p',
    is_external: true,
    created_at: createdAt,
    last_seen_at: createdAt,
    groups,
    ...extra,
  };
}

describe('group store', () => {
  it('merges writes, lists, counts, searches and hides deleted groups', () => {
    const { groups, advance } = createStores();
    groups.upsert({
      id: 'acme',
      type: 'company',
      name: 'Acme',
      properties: { plan: 'pro' },
    });
    advance(1000);
    groups.upsert({ id: 'beta', type: 'company', name: 'Beta Inc' });
    advance(1000);
    groups.upsert({ id: 'acme', properties: { seats: '10' } });
    groups.upsert({ id: 'team-1', type: 'team', name: 'Core team' });

    expect(groups.get('acme')).toMatchObject({
      name: 'Acme',
      type: 'company',
      properties: { plan: 'pro', seats: '10' },
      createdAt: NOW,
    });
    expect(groups.list({ take: 10 }).map((g) => g.id)).toEqual([
      'team-1',
      'beta',
      'acme',
    ]);
    expect(groups.list({ take: 10, type: 'company' }).map((g) => g.id)).toEqual(
      ['beta', 'acme']
    );
    expect(groups.count({ search: 'inc' })).toBe(1);
    expect(groups.types()).toEqual(['company', 'team']);
    expect(groups.propertyKeys()).toEqual(['plan', 'seats']);
    expect(groups.propertyValues('properties.plan')).toEqual(['pro']);
    expect(groups.byIds(['acme', 'nope']).map((g) => g.id)).toEqual(['acme']);

    groups.remove('beta');
    expect(groups.get('beta')).toBeNull();
    expect(groups.count({})).toBe(2);
  });

  it('finds members through their profiles and counts their growth', () => {
    const { groups, profiles } = createStores();
    groups.upsert({ id: 'acme', type: 'company', name: 'Acme' });
    profiles.upsert(
      profile('u1', ['acme'], '2026-11-20 10:00:00.000', {
        email: 'ana@acme.io',
      })
    );
    profiles.upsert(profile('u2', ['acme', 'beta'], '2026-11-23 09:00:00.000'));
    profiles.upsert(profile('u3', ['beta'], '2026-11-23 09:00:00.000'));

    expect(groups.members({ groupId: 'acme', take: 10 })).toEqual({
      ids: ['u2', 'u1'],
      count: 2,
    });
    expect(
      groups.members({ groupId: 'acme', take: 10, search: 'ana' }).ids
    ).toEqual(['u1']);
    expect(groups.stats(['acme'])).toEqual([
      {
        groupId: 'acme',
        memberCount: 2,
        lastActiveAt: Date.parse('2026-11-23T09:00:00Z'),
      },
    ]);
    const growth = groups.memberGrowth('acme', 30);
    expect(growth).toHaveLength(30);
    expect(growth.filter((day) => day.count > 0)).toEqual([
      { date: '2026-11-20', count: 1 },
      { date: '2026-11-23', count: 1 },
    ]);
  });
});

describe('group summary', () => {
  it('counts a group events like the ClickHouse group queries', () => {
    const accumulator = new GroupSummaryAccumulator('acme');
    const event = (name: string, at: number, groups: string[], path = '') =>
      ({
        id: `${name}-${at}`,
        name,
        created_at: new Date(at)
          .toISOString()
          .replace('T', ' ')
          .replace('Z', ''),
        groups,
        path,
        properties: {},
      }) as unknown as IClickhouseEvent;
    for (const row of [
      event('screen_view', NOW - DAY, ['acme'], '/'),
      event('screen_view', NOW, ['acme', 'beta'], '/pricing'),
      event('signup', NOW, ['acme']),
      event('signup', NOW, ['beta']),
    ]) {
      accumulator.add(row);
    }
    expect(accumulator.result()).toEqual({
      totalEvents: 3,
      firstSeen: '2026-11-22 12:00:00.000',
      lastSeen: '2026-11-23 12:00:00.000',
      activity: [
        { date: '2026-11-23 00:00:00', count: 2 },
        { date: '2026-11-22 00:00:00', count: 1 },
      ],
      mostEvents: [{ name: 'signup', count: 1 }],
      popularRoutes: [
        { path: '/', count: 1 },
        { path: '/pricing', count: 1 },
      ],
    });
  });
});
