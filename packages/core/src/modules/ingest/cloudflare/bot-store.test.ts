import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import { BOT_EVENTS_PER_DAY, openBotStore } from './bot-store';
import type { EngineSql, SqlRow } from './engine';

function memorySql(): EngineSql {
  const db = new Database(':memory:');
  return {
    exec(query, ...bindings) {
      return db
        .query(query)
        .all(...(bindings as SQLQueryBindings[])) as SqlRow[];
    },
    transaction: (fn) => db.transaction(fn)(),
  };
}

const hit = (id: string, createdAt: string, path = '/') => ({
  id,
  name: 'Googlebot',
  type: 'crawler',
  project_id: 'p1',
  path,
  created_at: createdAt,
});

describe('bot store', () => {
  it('lists bot hits newest first in the ClickHouse row shape', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('a', '2026-11-24 10:00:00.000', '/old'));
    bots.add(hit('b', '2026-11-24 11:30:00.000', '/new'));
    expect(bots.count()).toBe(2);
    expect(bots.page('p1', 1, 0)).toEqual([
      {
        id: 'b',
        name: 'Googlebot',
        type: 'crawler',
        project_id: 'p1',
        path: '/new',
        created_at: '2026-11-24 11:30:00.000',
      },
    ]);
    expect(bots.page('p1', 1, 1)[0]?.id).toBe('a');
  });

  it('keeps at most the daily quota, then only filters', () => {
    const bots = openBotStore(memorySql());
    for (let i = 0; i < BOT_EVENTS_PER_DAY; i++) {
      expect(bots.add(hit(`x${i}`, '2026-11-24 09:00:00.000'))).toBe(true);
    }
    expect(bots.add(hit('over', '2026-11-24 23:59:00.000'))).toBe(false);
    // A new day has a fresh quota.
    expect(bots.add(hit('next', '2026-11-25 00:00:01.000'))).toBe(true);
    expect(bots.count()).toBe(BOT_EVENTS_PER_DAY + 1);
  });

  it('expires old hits', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('a', '2026-10-01 00:00:00.000'));
    bots.add(hit('b', '2026-11-24 00:00:00.000'));
    bots.expire(Date.parse('2026-11-01T00:00:00Z'));
    expect(bots.page('p1', 10, 0).map((row) => row.id)).toEqual(['b']);
  });
});
