import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import type { EngineSql, SqlRow } from './engine';
import { openGscStore } from './gsc-store';

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

const day = (date: string, clicks: number, ctr = 0.1, position = 5) => ({
  date,
  clicks,
  impressions: clicks * 10,
  ctr,
  position,
});

describe('gsc store', () => {
  it('replaces a day on a newer sync and buckets by week and month', () => {
    const store = openGscStore(memorySql());
    store.write('daily', '2026-11-01 00:00:00', [
      day('2026-11-15', 1),
      day('2026-11-21', 2),
    ]);
    // A later sync of the same day replaces it.
    store.write('daily', '2026-11-22 00:00:00', [
      day('2026-11-21', 4, 0.3, 3),
      day('2026-11-22', 6, 0.2, 7),
    ]);

    expect(store.overview('2026-11-01', '2026-11-30', 'day')).toEqual([
      { date: '2026-11-15', clicks: 1, impressions: 10, ctr: 0.1, position: 5 },
      { date: '2026-11-21', clicks: 4, impressions: 40, ctr: 0.3, position: 3 },
      { date: '2026-11-22', clicks: 6, impressions: 60, ctr: 0.2, position: 7 },
    ]);
    // Weeks start on Sunday (15 and 22 November 2026 are Sundays).
    const weeks = store.overview('2026-11-01', '2026-11-30', 'week');
    expect(weeks.map((row) => [row.date, row.clicks])).toEqual([
      ['2026-11-15', 5],
      ['2026-11-22', 6],
    ]);
    expect(weeks[0]?.ctr).toBeCloseTo(0.2);
    const months = store.overview('2026-11-01', '2026-11-30', 'month');
    expect(months.map((row) => [row.date, row.clicks])).toEqual([
      ['2026-11-01', 11],
    ]);
    // Both ends are inclusive.
    expect(store.overview('2026-11-21', '2026-11-21', 'day')).toHaveLength(1);
  });

  it('ranks pages and queries by clicks over the range', () => {
    const store = openGscStore(memorySql());
    store.write('pages', 's1', [
      { ...day('2026-11-20', 3), key: '/a' },
      { ...day('2026-11-21', 3), key: '/a' },
      { ...day('2026-11-21', 5), key: '/b' },
      { ...day('2026-10-01', 99), key: '/old' },
    ]);
    store.write('queries', 's1', [{ ...day('2026-11-21', 2), key: 'flare' }]);

    expect(store.top('pages', '2026-11-01', '2026-11-30', 10)).toEqual([
      { page: '/a', clicks: 6, impressions: 60, ctr: 0.1, position: 5 },
      { page: '/b', clicks: 5, impressions: 50, ctr: 0.1, position: 5 },
    ]);
    expect(store.top('pages', '2026-11-01', '2026-11-30', 1)).toHaveLength(1);
    expect(store.top('queries', '2026-11-01', '2026-11-30', 10)).toEqual([
      { query: 'flare', clicks: 2, impressions: 20, ctr: 0.1, position: 5 },
    ]);
  });
});
