import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import {
  BOT_DAILY_PATHS_PER_DAY,
  BOT_EVENTS_PER_DAY,
  BOT_OTHER_PATHS,
  botAggregatePath,
  openBotStore,
} from './bot-store';
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

const hit = (
  id: string,
  createdAt: string,
  path = '/',
  bot: { name: string; type: string } = { name: 'Googlebot', type: 'crawler' }
) => ({
  id,
  ...bot,
  project_id: 'p1',
  path,
  created_at: createdAt,
});

const GPTBOT = { name: 'GPTBot', type: 'AI Data Scraper' };
const CLAUDEBOT = { name: 'ClaudeBot', type: 'AI Data Scraper' };
const GOOGLEBOT = { name: 'Googlebot', type: 'Search bot' };
const AHREFS = { name: 'aHrefs Bot', type: 'Crawler' };

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

  it('counts every hit per day, bot and path, past the list quota', () => {
    const bots = openBotStore(memorySql());
    for (let i = 0; i < BOT_EVENTS_PER_DAY + 5; i++) {
      bots.add(hit(`x${i}`, '2026-11-24 09:00:00.000', '/docs', GPTBOT));
    }
    expect(bots.count()).toBe(BOT_EVENTS_PER_DAY);
    const stats = bots.stats({ fromDay: '2026-11-24', toDay: '2026-11-24' });
    expect(stats.totals).toEqual({
      total: BOT_EVENTS_PER_DAY + 5,
      ai: BOT_EVENTS_PER_DAY + 5,
      search: 0,
      other: 0,
    });
    expect(stats.topPaths).toHaveLength(1);
  });

  it('builds totals, a zero-filled daily series, top bots and top paths', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('a', '2026-11-22 08:00:00.000', '/pricing', GPTBOT));
    bots.add(
      hit('b', '2026-11-22 09:00:00.000', 'https://a.io/pricing?x=1', GPTBOT)
    );
    bots.add(hit('c', '2026-11-22 10:00:00.000', '/pricing', CLAUDEBOT));
    bots.add(hit('d', '2026-11-24 11:00:00.000', '/', GOOGLEBOT));
    bots.add(hit('e', '2026-11-24 12:00:00.000', '/blog#top', AHREFS));
    // Outside the window.
    bots.add(hit('f', '2026-11-20 12:00:00.000', '/', GOOGLEBOT));

    const stats = bots.stats({ fromDay: '2026-11-22', toDay: '2026-11-24' });

    expect(stats.totals).toEqual({ total: 5, ai: 3, search: 1, other: 1 });
    expect(stats.series).toEqual([
      { date: '2026-11-22', total: 3, ai: 3, search: 0, other: 0 },
      { date: '2026-11-23', total: 0, ai: 0, search: 0, other: 0 },
      { date: '2026-11-24', total: 2, ai: 0, search: 1, other: 1 },
    ]);
    expect(stats.topBots[0]).toEqual({
      name: 'GPTBot',
      category: 'AI Data Scraper',
      group: 'ai',
      hits: 2,
      lastSeen: Date.parse('2026-11-22T09:00:00Z'),
    });
    expect(stats.topBots.map((bot) => bot.name)).toContain('Googlebot');
    expect(stats.topPaths[0]).toEqual({
      path: '/pricing',
      hits: 3,
      lastSeen: Date.parse('2026-11-22T10:00:00Z'),
      bots: [
        { name: 'GPTBot', category: 'AI Data Scraper', hits: 2 },
        { name: 'ClaudeBot', category: 'AI Data Scraper', hits: 1 },
      ],
    });
    expect(stats.topPaths.map((page) => page.path).sort()).toEqual([
      '/',
      '/blog',
      '/pricing',
    ]);
  });

  it('folds new paths past the daily key cap into one row', () => {
    const bots = openBotStore(memorySql());
    for (let i = 0; i < BOT_DAILY_PATHS_PER_DAY + 3; i++) {
      bots.add(hit(`p${i}`, '2026-11-24 09:00:00.000', `/p/${i}`, GPTBOT));
    }
    // A path already counted today still counts under its own name.
    bots.add(hit('again', '2026-11-24 10:00:00.000', '/p/0', GPTBOT));
    const stats = bots.stats({
      fromDay: '2026-11-24',
      toDay: '2026-11-24',
      limit: BOT_DAILY_PATHS_PER_DAY + 10,
    });
    expect(stats.totals.total).toBe(BOT_DAILY_PATHS_PER_DAY + 4);
    expect(stats.topPaths).toHaveLength(BOT_DAILY_PATHS_PER_DAY + 1);
    expect(stats.topPaths.find((page) => page.path === '/p/0')?.hits).toBe(2);
    expect(
      stats.topPaths.find((page) => page.path === BOT_OTHER_PATHS)?.hits
    ).toBe(3);
  });

  it('expires the daily counts with the list', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('a', '2026-10-01 00:00:00.000', '/', GPTBOT));
    bots.add(hit('b', '2026-11-24 00:00:00.000', '/', GPTBOT));
    bots.expire(Date.parse('2026-11-01T00:00:00Z'));
    const stats = bots.stats({ fromDay: '2026-09-01', toDay: '2026-11-30' });
    expect(stats.totals.total).toBe(1);
    expect(stats.series.find((day) => day.date === '2026-10-01')?.total).toBe(
      0
    );
  });

  it('answers empty stats for a malformed window', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('a', '2026-11-24 00:00:00.000', '/', GPTBOT));
    expect(bots.stats({ fromDay: 'nope', toDay: '2026-11-24' }).series).toEqual(
      []
    );
    expect(
      bots.stats({ fromDay: '2026-11-25', toDay: '2026-11-24' }).totals.total
    ).toBe(0);
  });
});

describe('botAggregatePath', () => {
  it('keeps only the pathname', () => {
    expect(botAggregatePath('https://a.io/docs/x?y=1#z')).toBe('/docs/x');
    expect(botAggregatePath('/pricing?utm=1')).toBe('/pricing');
    expect(botAggregatePath('https://a.io')).toBe('/');
    expect(botAggregatePath('')).toBe('/');
  });
});
