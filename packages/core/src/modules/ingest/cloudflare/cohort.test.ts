import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import type { CohortDefinition } from '../../cohort/cohort.constants';
import type { IClickhouseEvent } from '../../event/event.service';
import type { IClickhouseProfile } from '../../profile/profile.service';
import { evaluateCohort, timeframeRange } from './cohort-eval';
import { openCohortStore } from './cohort-store';
import type { EngineSql, SqlRow } from './engine';
import { matchesFilters } from './filter-eval';

const NOW = Date.UTC(2026, 10, 23, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

function event(
  name: string,
  daysAgo: number,
  who: string,
  extra: Partial<IClickhouseEvent> = {}
) {
  return {
    id: `${name}-${daysAgo}-${who}`,
    name,
    created_at: new Date(NOW - daysAgo * DAY)
      .toISOString()
      .replace('T', ' ')
      .replace('Z', ''),
    profile_id: who,
    device_id: who.startsWith('anon') ? who : `device-${who}`,
    properties: {},
    path: '/',
    ...extra,
  } as IClickhouseEvent;
}

function profile(
  id: string,
  properties: Record<string, string> = {}
): IClickhouseProfile {
  return {
    id,
    first_name: '',
    last_name: '',
    email: `${id}@x.io`,
    avatar: '',
    properties,
    project_id: 'p',
    is_external: !id.startsWith('anon'),
    created_at: '2026-11-01 00:00:00.000',
    last_seen_at: '2026-11-01 00:00:00.000',
    groups: [],
  };
}

const events = [
  event('signup', 2, 'ana', { properties: { plan: 'pro' } }),
  event('signup', 40, 'ben', { properties: { plan: 'free' } }),
  event('purchase', 1, 'ana'),
  event('purchase', 3, 'ana'),
  event('purchase', 5, 'cem'),
  event('signup', 1, 'anon-1'),
];
const profiles = [
  profile('ana', { plan: 'pro' }),
  profile('ben', { plan: 'free' }),
  profile('cem', { plan: 'pro' }),
  profile('anon-1'),
];

const source = {
  now: NOW,
  scan: (from: number, to: number, visit: (e: IClickhouseEvent) => void) => {
    for (const row of events) {
      const at = Date.parse(`${row.created_at.replace(' ', 'T')}Z`);
      if (at >= from && at <= to) {
        visit(row);
      }
    }
    return Promise.resolve(true);
  },
  profiles: () => profiles,
};

const run = async (definition: CohortDefinition) =>
  (await evaluateCohort(definition, source)).ids.sort();

describe('cohort evaluation', () => {
  it('reads relative and absolute timeframes as whole UTC days', () => {
    expect(timeframeRange({ type: 'relative', value: '7d' }, NOW)).toEqual([
      Date.UTC(2026, 10, 16),
      NOW,
    ]);
    expect(
      timeframeRange(
        { type: 'absolute', start: '2026-11-01', end: '2026-11-02' },
        NOW
      )
    ).toEqual([Date.UTC(2026, 10, 1), Date.UTC(2026, 10, 3) - 1]);
  });

  it('counts identified people, frequency, never, and/or', async () => {
    const signup7 = {
      name: 'signup',
      filters: [],
      timeframe: { type: 'relative' as const, value: '7d' as const },
    };
    const purchase7 = { ...signup7, name: 'purchase' };
    expect(
      await run({
        type: 'event',
        criteria: { operator: 'and', events: [signup7] },
      })
    ).toEqual(['ana']);
    expect(
      await run({
        type: 'event',
        criteria: {
          operator: 'and',
          events: [{ ...purchase7, frequency: { operator: 'gte', count: 2 } }],
        },
      })
    ).toEqual(['ana']);
    expect(
      await run({
        type: 'event',
        criteria: {
          operator: 'and',
          events: [{ ...signup7, frequency: { operator: 'eq', count: 0 } }],
        },
      })
    ).toEqual(['anon-1', 'ben', 'cem']);
    expect(
      await run({
        type: 'event',
        criteria: { operator: 'or', events: [signup7, purchase7] },
      })
    ).toEqual(['ana', 'cem']);
    expect(
      await run({
        type: 'event',
        criteria: {
          operator: 'and',
          events: [
            {
              ...signup7,
              timeframe: { type: 'relative', value: '90d' },
              filters: [
                {
                  id: 'f',
                  name: 'properties.plan',
                  operator: 'is',
                  value: ['free'],
                },
              ],
            },
          ],
        },
      })
    ).toEqual(['ben']);
  });

  it('matches profile properties', async () => {
    expect(
      await run({
        type: 'property',
        criteria: {
          operator: 'and',
          properties: [
            {
              id: 'p',
              name: 'properties.plan',
              operator: 'is',
              value: ['pro'],
            },
          ],
        },
      })
    ).toEqual(['ana', 'cem']);
  });
});

describe('cohort membership', () => {
  it('stores only the difference and answers cohort filters', () => {
    const db = new Database(':memory:');
    let writes = 0;
    const sql: EngineSql = {
      exec(query, ...bindings) {
        const statement = db.query(query);
        if (/^\s*(INSERT|DELETE)/i.test(query)) {
          writes += statement.run(...(bindings as SQLQueryBindings[])).changes;
          return [];
        }
        return statement.all(...(bindings as SQLQueryBindings[])) as SqlRow[];
      },
      transaction: (fn) => db.transaction(fn)(),
    };
    const store = openCohortStore(sql, () => NOW);
    expect(store.replace('c1', ['ana', 'ben'])).toBe(2);
    writes = 0;
    expect(store.replace('c1', ['ana', 'cem'])).toBe(2);
    expect(writes).toBe(2);
    expect(store.count('c1')).toBe(2);
    expect(store.members('c1').profileIds.sort()).toEqual(['ana', 'cem']);
    const inCohort = [
      { name: 'profile_id', operator: 'inCohort', value: ['c1'] },
    ];
    const notIn = [
      { name: 'profile_id', operator: 'notInCohort', value: ['c1'] },
    ];
    expect(matchesFilters({ profile_id: 'cem' }, inCohort)).toBe(true);
    expect(matchesFilters({ profile_id: 'ben' }, inCohort)).toBe(false);
    expect(matchesFilters({ profile_id: 'ben' }, notIn)).toBe(true);
    store.remove('c1');
    expect(matchesFilters({ profile_id: 'cem' }, inCohort)).toBe(false);
  });
});
