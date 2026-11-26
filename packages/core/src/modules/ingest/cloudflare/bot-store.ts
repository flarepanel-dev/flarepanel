// Bot traffic of one project in its Durable Object, as OpenPanel's
// `events_bots` table: one row per detected bot hit (name, type, path, time),
// listed newest first. Bots are kept out of analytics either way; this only
// keeps a record of them. Unlike ClickHouse, every row here is a metered
// write, so a project keeps at most BOT_EVENTS_PER_DAY a day (later hits that
// day are still filtered, just not listed) for BOT_EVENTS_TTL_MS.
//
// `bot_daily` counts every hit, listed or not, per UTC day, bot and path, so
// the charts keep their totals past the list's daily cap. A day holds at most
// BOT_DAILY_PATHS_PER_DAY distinct keys; later new paths count under
// BOT_OTHER_PATHS.

import {
  BOT_STATS_BOTS_PER_PATH,
  BOT_STATS_TOP_LIMIT,
  botCategoryGroup,
  type IBotStats,
  type IBotStatsTotals,
} from '../../event/event.constants';
import type { EngineSql } from './engine';

export const BOT_EVENTS_PER_DAY = 5000;
export const BOT_EVENTS_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const BOT_DAILY_PATHS_PER_DAY = 2000;
export const BOT_OTHER_PATHS = '(other)';
const BOT_PATH_MAX_LENGTH = 512;
/** A stats window longer than this is cut to its most recent days. */
const BOT_STATS_MAX_DAYS = 400;
const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DAY_LENGTH = 10;
const ABSOLUTE_URL = /^https?:\/\//i;
const QUERY_OR_HASH = /[?#]/;

export interface BotEventRow {
  id: string;
  name: string;
  type: string;
  project_id: string;
  path: string;
  created_at: string;
}

export interface BotStatsQuery {
  /** `YYYY-MM-DD`, UTC, inclusive. */
  fromDay: string;
  toDay: string;
  limit?: number;
}

/** The pathname a hit counts under: no origin, query or fragment. */
export function botAggregatePath(raw: string): string {
  let path = raw.trim();
  if (ABSOLUTE_URL.test(path)) {
    try {
      path = new URL(path).pathname;
    } catch {
      // not a URL after all; keep the text
    }
  }
  const cut = path.search(QUERY_OR_HASH);
  if (cut >= 0) {
    path = path.slice(0, cut);
  }
  return (path || '/').slice(0, BOT_PATH_MAX_LENGTH);
}

function parseCreatedAt(createdAt: string): number {
  // ClickHouse's 'YYYY-MM-DD HH:MM:SS.mmm' is UTC without a zone.
  const iso = createdAt.replace(' ', 'T');
  const at = Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  return Number.isFinite(at) ? at : Date.now();
}

function dayIndex(isoDay: string): number {
  const at = Date.parse(`${isoDay.slice(0, ISO_DAY_LENGTH)}T00:00:00Z`);
  return Number.isFinite(at) ? Math.floor(at / DAY_MS) : Number.NaN;
}

function isoDay(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, ISO_DAY_LENGTH);
}

const emptyTotals = (): IBotStatsTotals => ({
  total: 0,
  ai: 0,
  search: 0,
  other: 0,
});

export function emptyBotStats(): IBotStats {
  return { totals: emptyTotals(), series: [], topBots: [], topPaths: [] };
}

export function openBotStore(sql: EngineSql) {
  sql.exec(
    'CREATE TABLE IF NOT EXISTS bot_events (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, path TEXT NOT NULL, created_at INTEGER NOT NULL) WITHOUT ROWID'
  );
  sql.exec(
    'CREATE INDEX IF NOT EXISTS bot_events_created ON bot_events (created_at)'
  );
  sql.exec(
    'CREATE TABLE IF NOT EXISTS bot_days (day INTEGER PRIMARY KEY, n INTEGER NOT NULL) WITHOUT ROWID'
  );
  sql.exec(
    'CREATE TABLE IF NOT EXISTS bot_daily (day INTEGER NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, path TEXT NOT NULL, hits INTEGER NOT NULL, last_at INTEGER NOT NULL, PRIMARY KEY (day, name, type, path)) WITHOUT ROWID'
  );
  sql.exec(
    'CREATE TABLE IF NOT EXISTS bot_daily_paths (day INTEGER PRIMARY KEY, n INTEGER NOT NULL) WITHOUT ROWID'
  );

  function countHit(row: BotEventRow, day: number, at: number) {
    const path = botAggregatePath(row.path);
    const [existing] = sql.exec(
      'SELECT hits FROM bot_daily WHERE day = ? AND name = ? AND type = ? AND path = ?',
      day,
      row.name,
      row.type,
      path
    );
    if (existing) {
      sql.exec(
        'UPDATE bot_daily SET hits = hits + 1, last_at = max(last_at, ?) WHERE day = ? AND name = ? AND type = ? AND path = ?',
        at,
        day,
        row.name,
        row.type,
        path
      );
      return;
    }
    const [paths] = sql.exec(
      'SELECT n FROM bot_daily_paths WHERE day = ?',
      day
    );
    const hasRoom = Number(paths?.n ?? 0) < BOT_DAILY_PATHS_PER_DAY;
    sql.exec(
      'INSERT INTO bot_daily (day, name, type, path, hits, last_at) VALUES (?, ?, ?, ?, 1, ?) ON CONFLICT(day, name, type, path) DO UPDATE SET hits = hits + 1, last_at = max(last_at, excluded.last_at)',
      day,
      row.name,
      row.type,
      hasRoom ? path : BOT_OTHER_PATHS,
      at
    );
    if (hasRoom) {
      sql.exec(
        'INSERT INTO bot_daily_paths (day, n) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET n = n + 1',
        day
      );
    }
  }

  return {
    /** Counts one bot hit and lists it; false once today's list quota is used. */
    add(row: BotEventRow): boolean {
      const createdAt = parseCreatedAt(row.created_at);
      const day = Math.floor(createdAt / DAY_MS);
      return sql.transaction(() => {
        countHit(row, day, createdAt);
        const [counted] = sql.exec('SELECT n FROM bot_days WHERE day = ?', day);
        if (Number(counted?.n ?? 0) >= BOT_EVENTS_PER_DAY) {
          return false;
        }
        sql.exec(
          'INSERT OR IGNORE INTO bot_events (id, name, type, path, created_at) VALUES (?, ?, ?, ?, ?)',
          row.id,
          row.name,
          row.type,
          row.path,
          createdAt
        );
        sql.exec(
          'INSERT INTO bot_days (day, n) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET n = n + 1',
          day
        );
        return true;
      });
    },
    /** Newest first, as `SELECT * FROM events_bots ... ORDER BY created_at DESC`. */
    page(projectId: string, limit: number, offset: number): BotEventRow[] {
      return sql
        .exec(
          'SELECT id, name, type, path, created_at FROM bot_events ORDER BY created_at DESC LIMIT ? OFFSET ?',
          limit,
          offset
        )
        .map((row) => ({
          id: String(row.id),
          name: String(row.name),
          type: String(row.type),
          project_id: projectId,
          path: String(row.path),
          created_at: new Date(Number(row.created_at))
            .toISOString()
            .replace('T', ' ')
            .replace('Z', ''),
        }));
    },
    count(): number {
      const [row] = sql.exec('SELECT count(*) AS n FROM bot_events');
      return Number(row?.n ?? 0);
    },
    /** Totals, a zero-filled daily series, top bots and top paths. */
    stats(query: BotStatsQuery): IBotStats {
      const toDay = dayIndex(query.toDay);
      let fromDay = dayIndex(query.fromDay);
      if (!(Number.isFinite(fromDay) && Number.isFinite(toDay))) {
        return emptyBotStats();
      }
      fromDay = Math.max(fromDay, toDay - BOT_STATS_MAX_DAYS + 1);
      if (fromDay > toDay) {
        return emptyBotStats();
      }
      const limit = query.limit ?? BOT_STATS_TOP_LIMIT;

      const totals = emptyTotals();
      const byDay = new Map<number, IBotStatsTotals>();
      for (let day = fromDay; day <= toDay; day++) {
        byDay.set(day, emptyTotals());
      }
      const bots = new Map<
        string,
        { name: string; category: string; hits: number; lastSeen: number }
      >();
      const paths = new Map<
        string,
        {
          hits: number;
          lastSeen: number;
          bots: Map<string, { name: string; category: string; hits: number }>;
        }
      >();

      // One pass over the window: every view below reads the same rows.
      const rows = sql.exec(
        'SELECT day, name, type, path, hits, last_at FROM bot_daily WHERE day >= ? AND day <= ?',
        fromDay,
        toDay
      );
      for (const row of rows) {
        const name = String(row.name);
        const category = String(row.type);
        const path = String(row.path);
        const hits = Number(row.hits);
        const lastSeen = Number(row.last_at);
        const group = botCategoryGroup(category);

        totals.total += hits;
        totals[group] += hits;
        const daily = byDay.get(Number(row.day));
        if (daily) {
          daily.total += hits;
          daily[group] += hits;
        }

        const botKey = `${name}\u0000${category}`;
        const bot = bots.get(botKey) ?? { name, category, hits: 0, lastSeen };
        bot.hits += hits;
        bot.lastSeen = Math.max(bot.lastSeen, lastSeen);
        bots.set(botKey, bot);

        const page = paths.get(path) ?? {
          hits: 0,
          lastSeen,
          bots: new Map(),
        };
        page.hits += hits;
        page.lastSeen = Math.max(page.lastSeen, lastSeen);
        const pageBot = page.bots.get(botKey) ?? { name, category, hits: 0 };
        pageBot.hits += hits;
        page.bots.set(botKey, pageBot);
        paths.set(path, page);
      }

      const byHits = (a: { hits: number }, b: { hits: number }) =>
        b.hits - a.hits;
      return {
        totals,
        series: [...byDay].map(([day, counts]) => ({
          date: isoDay(day),
          ...counts,
        })),
        topBots: [...bots.values()]
          .sort(byHits)
          .slice(0, limit)
          .map((bot) => ({ ...bot, group: botCategoryGroup(bot.category) })),
        topPaths: [...paths]
          .map(([path, page]) => ({
            path,
            hits: page.hits,
            lastSeen: page.lastSeen,
            bots: [...page.bots.values()]
              .sort(byHits)
              .slice(0, BOT_STATS_BOTS_PER_PATH),
          }))
          .sort(byHits)
          .slice(0, limit),
      };
    },
    expire(beforeMs: number) {
      const beforeDay = Math.floor(beforeMs / DAY_MS);
      sql.exec('DELETE FROM bot_events WHERE created_at < ?', beforeMs);
      sql.exec('DELETE FROM bot_days WHERE day < ?', beforeDay);
      sql.exec('DELETE FROM bot_daily WHERE day < ?', beforeDay);
      sql.exec('DELETE FROM bot_daily_paths WHERE day < ?', beforeDay);
    },
  };
}

export type BotStore = ReturnType<typeof openBotStore>;
