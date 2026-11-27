import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import {
  BOT_DAILY_PATHS_PER_DAY,
  BOT_EVENTS_PER_DAY,
  BOT_OTHER_PATHS,
  type BotEventRow,
  botAggregatePath,
  openBotStore,
} from './bot-store';
import type { EngineSql, SqlRow } from './engine';
import { wallClockEndMs, wallClockToMs } from './time-buckets';

function memorySql(db = new Database(':memory:')): EngineSql {
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
  bot: { name: string; type: string } = { name: 'Googlebot', type: 'crawler' },
  extra: Partial<BotEventRow> = {}
): BotEventRow => ({
  id,
  ...bot,
  project_id: 'p1',
  path,
  created_at: createdAt,
  ...extra,
});

const GPTBOT = { name: 'GPTBot', type: 'AI Data Scraper' };
const CLAUDEBOT = { name: 'ClaudeBot', type: 'AI Data Scraper' };
const CHATGPT_USER = { name: 'ChatGPT-User', type: 'AI Assistant' };
const OAI_SEARCH = { name: 'OAI-SearchBot', type: 'AI Search Crawler' };
const GOOGLEBOT = { name: 'Googlebot', type: 'Search bot' };
const AHREFS = { name: 'aHrefs Bot', type: 'Crawler' };

/** A local-days window as the RPC builds it: wall-clock bounds in `timezone`. */
function window(from: string, to: string, timezone = 'UTC') {
  return {
    fromMs: wallClockToMs(from, timezone),
    toMs: wallClockEndMs(to, timezone),
    timezone,
  };
}

const ZERO = {
  total: 0,
  ai: 0,
  answers: 0,
  indexing: 0,
  training: 0,
  search: 0,
  other: 0,
};

describe('bot store', () => {
  it('lists bot hits newest first in the ClickHouse row shape', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('a', '2026-11-24 10:00:00.000', '/old'));
    bots.add(
      hit('b', '2026-11-24 11:30:00.000', '/new', GOOGLEBOT, {
        status: 404,
        verified: true,
        verified_category: 'Search Engine Crawler',
      })
    );
    expect(bots.count()).toBe(2);
    expect(bots.page('p1', 1, 0)).toEqual([
      {
        id: 'b',
        name: 'Googlebot',
        type: 'Search bot',
        project_id: 'p1',
        path: '/new',
        created_at: '2026-11-24 11:30:00.000',
        status: 404,
        verified: true,
        verified_category: 'Search Engine Crawler',
      },
    ]);
    expect(bots.page('p1', 1, 1)[0]).toMatchObject({
      id: 'a',
      status: null,
      verified: null,
      verified_category: null,
    });
  });

  it('keeps at most the daily quota in the list, then only counts', () => {
    const bots = openBotStore(memorySql());
    for (let i = 0; i < BOT_EVENTS_PER_DAY; i++) {
      expect(bots.add(hit(`x${i}`, '2026-11-24 09:00:00.000')).listed).toBe(
        true
      );
    }
    expect(bots.add(hit('over', '2026-11-24 23:59:00.000'))).toEqual({
      listed: false,
      capped: false,
    });
    // A new day has a fresh quota.
    expect(bots.add(hit('next', '2026-11-25 00:00:01.000')).listed).toBe(true);
    expect(bots.count()).toBe(BOT_EVENTS_PER_DAY + 1);
    const stats = bots.stats(window('2026-11-24', '2026-11-25'));
    expect(stats.totals.total).toBe(BOT_EVENTS_PER_DAY + 2);
  });

  it('expires old hits', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('a', '2026-10-01 00:00:00.000'));
    bots.add(hit('b', '2026-11-24 00:00:00.000'));
    bots.expire(Date.parse('2026-11-01T00:00:00Z'));
    expect(bots.page('p1', 10, 0).map((row) => row.id)).toEqual(['b']);
  });

  it('builds grouped totals, a zero-filled daily series, top bots and top paths', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('a', '2026-11-22 08:00:00.000', '/pricing', GPTBOT));
    bots.add(
      hit('b', '2026-11-22 09:00:00.000', 'https://a.io/pricing?x=1', GPTBOT)
    );
    bots.add(hit('c', '2026-11-22 10:00:00.000', '/pricing', CLAUDEBOT));
    bots.add(hit('d', '2026-11-24 11:00:00.000', '/', GOOGLEBOT));
    bots.add(hit('e', '2026-11-24 12:00:00.000', '/blog#top', AHREFS));
    bots.add(hit('g', '2026-11-24 13:00:00.000', '/docs', CHATGPT_USER));
    bots.add(hit('h', '2026-11-24 14:00:00.000', '/docs', OAI_SEARCH));
    // Outside the window.
    bots.add(hit('f', '2026-11-20 12:00:00.000', '/', GOOGLEBOT));

    const stats = bots.stats(window('2026-11-22', '2026-11-24'));

    expect(stats.totals).toEqual({
      total: 7,
      ai: 5,
      answers: 1,
      indexing: 1,
      training: 3,
      search: 1,
      other: 1,
    });
    expect(stats.series).toEqual([
      { date: '2026-11-22', ...ZERO, total: 3, ai: 3, training: 3 },
      { date: '2026-11-23', ...ZERO },
      {
        date: '2026-11-24',
        ...ZERO,
        total: 4,
        ai: 2,
        answers: 1,
        indexing: 1,
        search: 1,
        other: 1,
      },
    ]);
    expect(stats.topBots[0]).toEqual({
      name: 'GPTBot',
      category: 'AI Data Scraper',
      group: 'training',
      hits: 2,
      verifiedHits: 0,
      lastSeen: Date.parse('2026-11-22T09:00:00Z'),
    });
    expect(stats.topPaths[0]).toEqual({
      path: '/pricing',
      hits: 3,
      lastSeen: Date.parse('2026-11-22T10:00:00Z'),
      status: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
      bots: [
        {
          name: 'GPTBot',
          category: 'AI Data Scraper',
          group: 'training',
          hits: 2,
        },
        {
          name: 'ClaudeBot',
          category: 'AI Data Scraper',
          group: 'training',
          hits: 1,
        },
      ],
    });
    expect(stats.topPaths.map((page) => page.path).sort()).toEqual([
      '/',
      '/blog',
      '/docs',
      '/pricing',
    ]);
  });

  it('keeps one group when asked', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('a', '2026-11-24 08:00:00.000', '/', GPTBOT));
    bots.add(hit('b', '2026-11-24 09:00:00.000', '/', CHATGPT_USER));
    const stats = bots.stats({
      ...window('2026-11-24', '2026-11-24'),
      group: 'answers',
    });
    expect(stats.totals.total).toBe(1);
    expect(stats.totals.training).toBe(0);
    expect(stats.topBots.map((bot) => bot.name)).toEqual(['ChatGPT-User']);
  });

  describe('local days', () => {
    const BERLIN = 'Europe/Berlin';

    it('counts a hit after local midnight on the local day (23:40 UTC is 00:40 in Berlin)', () => {
      const bots = openBotStore(memorySql());
      bots.add(hit('late', '2026-11-26 23:40:00.000', '/', GPTBOT));

      // "Today" in Berlin: 2026-11-27 00:00 to 23:59:59 local.
      const today = bots.stats(
        window('2026-11-27 00:00:00', '2026-11-27 23:59:59', BERLIN)
      );
      expect(today.totals.total).toBe(1);
      expect(today.series.map((day) => [day.date, day.total])).toEqual([
        ['2026-11-27', 1],
      ]);

      const yesterday = bots.stats(
        window('2026-11-26 00:00:00', '2026-11-26 23:59:59', BERLIN)
      );
      expect(yesterday.totals.total).toBe(0);
    });

    it('ends a 7-day series on the local today, not the next day', () => {
      const bots = openBotStore(memorySql());
      bots.add(hit('a', '2026-11-26 23:30:00.000', '/', GPTBOT));
      // The RPC's 7d range ends at the next local midnight.
      const stats = bots.stats({
        fromMs: wallClockToMs('2026-11-20 00:00:00', BERLIN),
        toMs: wallClockToMs('2026-11-28 00:00:00', BERLIN),
        timezone: BERLIN,
      });
      expect(stats.series.at(-1)?.date).toBe('2026-11-27');
      expect(stats.series).toHaveLength(8);
      expect(stats.series.at(-1)?.total).toBe(1);
    });

    it('places a hit west of UTC on the evening before', () => {
      const bots = openBotStore(memorySql());
      bots.add(hit('a', '2026-11-27 02:00:00.000', '/', GPTBOT));
      const stats = bots.stats(
        window('2026-11-26', '2026-11-27', 'America/New_York')
      );
      expect(stats.series.map((day) => [day.date, day.total])).toEqual([
        ['2026-11-26', 1],
        ['2026-11-27', 0],
      ]);
    });

    it('reads day rows stored before hourly counts as their UTC day', () => {
      const db = new Database(':memory:');
      db.run(
        'CREATE TABLE bot_daily (day INTEGER NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, path TEXT NOT NULL, hits INTEGER NOT NULL, last_at INTEGER NOT NULL, PRIMARY KEY (day, name, type, path)) WITHOUT ROWID'
      );
      db.run(
        'CREATE TABLE bot_events (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, path TEXT NOT NULL, created_at INTEGER NOT NULL) WITHOUT ROWID'
      );
      db.run(
        "INSERT INTO bot_events VALUES ('old', 'GPTBot', 'AI Data Scraper', '/', 1)"
      );
      const day = Date.parse('2026-11-26T00:00:00Z') / 86_400_000;
      db.run(
        `INSERT INTO bot_daily VALUES (${day}, 'GPTBot', 'AI Data Scraper', '/docs', 4, ${Date.parse('2026-11-26T20:00:00Z')})`
      );
      const bots = openBotStore(memorySql(db));
      bots.add(hit('new', '2026-11-27 09:00:00.000', '/docs', GPTBOT));

      const stats = bots.stats(window('2026-11-26', '2026-11-27', BERLIN));
      expect(stats.series.map((point) => [point.date, point.total])).toEqual([
        ['2026-11-26', 4],
        ['2026-11-27', 1],
      ]);
      expect(stats.topPaths[0]).toMatchObject({ path: '/docs', hits: 5 });
      // The list table gained its new columns in place.
      expect(bots.page('p1', 10, 0).map((row) => row.id)).toEqual([
        'new',
        'old',
      ]);
    });
  });

  it('counts status classes per path', () => {
    const bots = openBotStore(memorySql());
    const at = '2026-11-24 09:00:00.000';
    bots.add(hit('a', at, '/gone', GPTBOT, { status: 404 }));
    bots.add(hit('b', at, '/gone', GPTBOT, { status: 410 }));
    bots.add(hit('c', at, '/gone', CLAUDEBOT, { status: 500 }));
    bots.add(hit('d', at, '/gone', GPTBOT, { status: 200 }));
    bots.add(hit('e', at, '/gone', GPTBOT, { status: 301 }));
    bots.add(hit('f', at, '/gone', GPTBOT));
    const [page] = bots.stats(window('2026-11-24', '2026-11-24')).topPaths;
    expect(page).toMatchObject({
      path: '/gone',
      hits: 6,
      status: { '2xx': 1, '3xx': 1, '4xx': 2, '5xx': 1 },
    });
  });

  it('counts verified hits and keeps to them when asked or by default', () => {
    const bots = openBotStore(memorySql());
    const at = '2026-11-24 09:00:00.000';
    bots.add(hit('a', at, '/', GPTBOT, { verified: true }));
    bots.add(hit('b', at, '/', GPTBOT, { verified: true }));
    bots.add(hit('c', at, '/', GPTBOT, { verified: false }));
    bots.add(hit('d', at, '/', CLAUDEBOT));
    const range = window('2026-11-24', '2026-11-24');

    const all = bots.stats({ ...range, verified: 'all' });
    expect(all).toMatchObject({ verifiedOnly: false, verifiedHits: 2 });
    expect(all.totals.total).toBe(4);
    expect(all.topBots[0]).toMatchObject({
      name: 'GPTBot',
      hits: 3,
      verifiedHits: 2,
    });

    const verified = bots.stats({ ...range, verified: 'verified' });
    expect(verified.verifiedOnly).toBe(true);
    expect(verified.totals.total).toBe(2);
    expect(verified.topBots.map((bot) => bot.name)).toEqual(['GPTBot']);

    expect(bots.stats({ ...range, verified: 'auto' }).totals.total).toBe(2);
  });

  it('shows every hit by default when none is verified', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('a', '2026-11-24 09:00:00.000', '/', GPTBOT));
    const stats = bots.stats({
      ...window('2026-11-24', '2026-11-24'),
      verified: 'auto',
    });
    expect(stats).toMatchObject({ verifiedOnly: false, verifiedHits: 0 });
    expect(stats.totals.total).toBe(1);
  });

  describe('monthly cap', () => {
    it('stops storing once the month reaches the cap, and starts again next month', () => {
      const sql = memorySql();
      const bots = openBotStore(sql);
      const cap = { monthlyCap: 3 };
      for (const id of ['a', 'b', 'c']) {
        expect(
          bots.add(hit(id, '2026-11-24 09:00:00.000', '/', GPTBOT), cap)
        ).toEqual({ listed: true, capped: false });
      }
      expect(
        bots.add(hit('d', '2026-11-30 09:00:00.000', '/', GPTBOT), cap)
      ).toEqual({ listed: false, capped: true });
      expect(bots.count()).toBe(3);

      const now = Date.parse('2026-11-30T10:00:00Z');
      const stats = bots.stats(
        { ...window('2026-11-01', '2026-11-30'), monthlyCap: 3 },
        now
      );
      expect(stats.totals.total).toBe(3);
      expect(stats.usage).toEqual({
        month: '2026-11',
        hits: 3,
        cap: 3,
        capped: true,
      });

      expect(
        bots.add(hit('e', '2026-12-01 00:00:01.000', '/', GPTBOT), cap)
      ).toEqual({ listed: true, capped: false });

      // A fresh store (the Durable Object woke up) reads the month back.
      const reopened = openBotStore(sql);
      expect(
        reopened.add(hit('f', '2026-11-30 12:00:00.000', '/', GPTBOT), cap)
          .capped
      ).toBe(true);
      expect(reopened.usage(null, Date.parse('2026-12-02T00:00:00Z'))).toEqual({
        month: '2026-12',
        hits: 1,
        cap: null,
        capped: false,
      });
    });

    it('caps nothing without a cap (self-hosted)', () => {
      const bots = openBotStore(memorySql());
      for (let i = 0; i < 5; i++) {
        expect(
          bots.add(hit(`x${i}`, '2026-11-24 09:00:00.000'), {
            monthlyCap: null,
          }).capped
        ).toBe(false);
      }
      expect(
        bots.usage(undefined, Date.parse('2026-11-25T00:00:00Z')).hits
      ).toBe(5);
    });

    it('keeps the month usage past the 30-day retention', () => {
      const sql = memorySql();
      const bots = openBotStore(sql);
      bots.add(hit('a', '2026-12-01 09:00:00.000'));
      const now = Date.parse('2026-12-31T12:00:00Z');
      bots.expire(Date.parse('2026-12-02T00:00:00Z'), now);
      expect(bots.count()).toBe(0);
      expect(openBotStore(sql).usage(null, now).hits).toBe(1);
    });
  });

  it('folds new paths past the daily path cap into one row', () => {
    const bots = openBotStore(memorySql());
    for (let i = 0; i < BOT_DAILY_PATHS_PER_DAY + 3; i++) {
      bots.add(hit(`p${i}`, '2026-11-24 09:00:00.000', `/p/${i}`, GPTBOT));
    }
    // A path already counted today keeps its name, in any hour of the day.
    bots.add(hit('again', '2026-11-24 15:00:00.000', '/p/0', GPTBOT));
    const stats = bots.stats({
      ...window('2026-11-24', '2026-11-24'),
      limit: BOT_DAILY_PATHS_PER_DAY + 10,
    });
    expect(stats.totals.total).toBe(BOT_DAILY_PATHS_PER_DAY + 4);
    expect(stats.topPaths).toHaveLength(BOT_DAILY_PATHS_PER_DAY + 1);
    expect(stats.topPaths.find((page) => page.path === '/p/0')?.hits).toBe(2);
    expect(
      stats.topPaths.find((page) => page.path === BOT_OTHER_PATHS)?.hits
    ).toBe(3);
  });

  it('expires the counts with the list', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('a', '2026-10-01 00:00:00.000', '/', GPTBOT));
    bots.add(hit('b', '2026-11-24 00:00:00.000', '/', GPTBOT));
    bots.expire(Date.parse('2026-11-01T00:00:00Z'));
    const stats = bots.stats(window('2026-09-01', '2026-11-30'));
    expect(stats.totals.total).toBe(1);
    expect(stats.series.find((day) => day.date === '2026-10-01')?.total).toBe(
      0
    );
  });

  it('answers empty stats for a malformed window', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('a', '2026-11-24 00:00:00.000', '/', GPTBOT));
    expect(
      bots.stats({ fromMs: Number.NaN, toMs: 1, timezone: 'UTC' }).series
    ).toEqual([]);
    expect(
      bots.stats({
        fromMs: Date.parse('2026-11-25T00:00:00Z'),
        toMs: Date.parse('2026-11-24T00:00:00Z'),
        timezone: 'UTC',
      }).totals.total
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

describe('imported hours (Cloudflare)', () => {
  const HOUR_MS = 60 * 60 * 1000;
  const hourOf = (iso: string) => Date.parse(iso) / HOUR_MS;
  const H10 = hourOf('2026-11-24T10:00:00Z');
  const H11 = H10 + 1;
  const H12 = H10 + 2;

  const imported = (
    hour: number,
    hits: number,
    bot: { name: string; type: string } = GPTBOT,
    path = '/docs'
  ) => ({
    hour,
    ...bot,
    path,
    hits,
    status: { '2xx': hits, '3xx': 0, '4xx': 0, '5xx': 0 },
  });

  it('stores estimates as hourly rows and reports their source', () => {
    const bots = openBotStore(memorySql());
    const result = bots.importHours({
      source: 'cloudflare',
      fromHour: H10,
      toHour: H12,
      rows: [
        imported(H10, 40),
        { ...imported(H11, 5, CLAUDEBOT, '/x?y=1'), status: { '4xx': 5 } },
      ],
    });
    expect(result).toEqual({
      hours: 2,
      rows: 2,
      hits: 45,
      skippedHours: 0,
      cappedHours: 0,
    });
    const stats = bots.stats(window('2026-11-24', '2026-11-24'));
    expect(stats.totals.total).toBe(45);
    expect(stats.sources).toEqual({ snippet: 0, cloudflare: 45 });
    expect(stats.topPaths.find((page) => page.path === '/x')?.status).toEqual({
      '2xx': 0,
      '3xx': 0,
      '4xx': 5,
      '5xx': 0,
    });
    // Estimates are never listed hit by hit.
    expect(bots.count()).toBe(0);
  });

  it('replaces its own earlier import for the same hours instead of adding', () => {
    const bots = openBotStore(memorySql());
    const batch = {
      source: 'cloudflare' as const,
      fromHour: H10,
      toHour: H11,
      rows: [imported(H10, 40)],
    };
    bots.importHours(batch);
    bots.importHours(batch);
    bots.importHours({ ...batch, rows: [imported(H10, 30)] });
    expect(bots.stats(window('2026-11-24', '2026-11-24')).totals.total).toBe(
      30
    );
    expect(bots.usage(null, Date.parse('2026-11-24T12:00:00Z')).hits).toBe(30);
  });

  it('keeps the snippet numbers for an hour the snippet reported (no double count)', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('s1', '2026-11-24 10:15:00.000', '/docs', GPTBOT));
    bots.add(hit('s2', '2026-11-24 10:45:00.000', '/docs', GPTBOT));
    const result = bots.importHours({
      source: 'cloudflare',
      fromHour: H10,
      toHour: H12,
      rows: [imported(H10, 40), imported(H11, 7)],
    });
    expect(result.skippedHours).toBe(1);
    expect(result.hits).toBe(7);
    const stats = bots.stats(window('2026-11-24', '2026-11-24'));
    expect(stats.totals.total).toBe(9);
    expect(stats.sources).toEqual({ snippet: 2, cloudflare: 7 });
  });

  it('prefers the snippet at read time when its hits arrive after the import', () => {
    const bots = openBotStore(memorySql());
    bots.importHours({
      source: 'cloudflare',
      fromHour: H10,
      toHour: H11,
      rows: [imported(H10, 40)],
    });
    bots.add(hit('late', '2026-11-24 10:30:00.000', '/docs', GPTBOT));
    const stats = bots.stats(window('2026-11-24', '2026-11-24'));
    expect(stats.totals.total).toBe(1);
    expect(stats.sources).toEqual({ snippet: 1, cloudflare: 0 });
  });

  it('counts imported hits against the monthly cap and stops at it', () => {
    const bots = openBotStore(memorySql());
    bots.add(hit('s1', '2026-11-01 00:00:00.000', '/', GPTBOT));
    const result = bots.importHours({
      source: 'cloudflare',
      fromHour: H10,
      toHour: H12 + 1,
      rows: [imported(H10, 5), imported(H11, 5), imported(H12, 5)],
      monthlyCap: 8,
    });
    // 1 + 5 = 6 < 8: hour 11 still fits; 11 >= 8: hour 12 does not.
    expect(result.hours).toBe(2);
    expect(result.cappedHours).toBe(1);
    const usage = bots.usage(8, Date.parse('2026-11-24T13:00:00Z'));
    expect(usage).toMatchObject({ hits: 11, capped: true });
    expect(
      bots.add(hit('s2', '2026-11-24 14:00:00.000'), { monthlyCap: 8 })
    ).toEqual({ listed: false, capped: true });
  });

  it('lists at most a few samples, marked with their source', () => {
    const bots = openBotStore(memorySql());
    const samples = Array.from({ length: 8 }, (_, index) => ({
      id: `cloudflare:${H10}:${index}`,
      ...GPTBOT,
      project_id: 'p1',
      path: `https://example.com/p${index}`,
      created_at: new Date(H10 * HOUR_MS + HOUR_MS / 2).toISOString(),
      status: 200,
      source: 'cloudflare' as const,
    }));
    bots.importHours({
      source: 'cloudflare',
      fromHour: H10,
      toHour: H11,
      rows: [imported(H10, 40)],
      samples,
    });
    // A retry does not list them twice.
    bots.importHours({
      source: 'cloudflare',
      fromHour: H10,
      toHour: H11,
      rows: [imported(H10, 40)],
      samples,
    });
    const listed = bots.page('p1', 20, 0);
    expect(listed).toHaveLength(5);
    expect(listed[0]).toMatchObject({ source: 'cloudflare', status: 200 });
  });

  it('expires imported hours with the rest', () => {
    const bots = openBotStore(memorySql());
    bots.importHours({
      source: 'cloudflare',
      fromHour: hourOf('2026-10-01T00:00:00Z'),
      toHour: hourOf('2026-10-01T01:00:00Z'),
      rows: [imported(hourOf('2026-10-01T00:00:00Z'), 3)],
    });
    bots.importHours({
      source: 'cloudflare',
      fromHour: H10,
      toHour: H11,
      rows: [imported(H10, 4)],
    });
    bots.expire(
      Date.parse('2026-11-01T00:00:00Z'),
      Date.parse('2026-11-24T12:00:00Z')
    );
    expect(bots.stats(window('2026-09-01', '2026-11-30')).totals.total).toBe(4);
  });
});
