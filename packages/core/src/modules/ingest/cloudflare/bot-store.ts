// Bot traffic of one project in its Durable Object, as OpenPanel's
// `events_bots` table: one row per detected bot hit (name, type, path, time,
// response status, whether the edge verified the bot), listed newest first.
// Bots are kept out of analytics either way; this only keeps a record of
// them. Unlike ClickHouse, every row here is a metered write, so a project
// lists at most BOT_EVENTS_PER_DAY a day (later hits that day are still
// counted, just not listed) for BOT_EVENTS_TTL_MS.
//
// `bot_hourly` counts every hit per UTC hour, bot, path and verification,
// with the response status classes, so the page can fold hours into the
// project's own days. A UTC day admits at most BOT_DAILY_PATHS_PER_DAY
// distinct paths; later new paths count under BOT_OTHER_PATHS.
//
// `bot_days` counts the hits stored per UTC day: the list's daily quota and
// the month's usage against a plan's cap both read it. Once a month reaches
// the cap, hits are answered and not written at all.
//
// `bot_daily` is the per-UTC-day table this store kept before hours. It is
// no longer written; its rows are read as if they fell at noon UTC of their
// day (the same calendar day in every time zone within 12 hours of UTC) and
// expire with the rest.
//
// `bot_hourly_imported` holds hourly estimates imported from another source
// (a connected Cloudflare zone's analytics), keyed like `bot_hourly` plus the
// source. An import replaces its source's rows for the hours it covers, so a
// retried or overlapping sync never counts twice. An hour with any snippet
// hit in `bot_hourly` keeps the snippet's numbers: imports skip such hours
// and reads ignore imported rows in them. `bot_import_hours` counts the
// imported hits per hour for the month's usage, like `bot_days`.

import {
  BOT_STATS_BOTS_PER_PATH,
  BOT_STATS_TOP_LIMIT,
  type BotGroup,
  type BotImportSource,
  type BotSource,
  type BotVerifiedFilter,
  botGroup,
  type IBotSourceTotals,
  type IBotStats,
  type IBotStatsTotals,
  type IBotStatusCounts,
  type IBotUsage,
  isAiBotGroup,
} from '../../event/event.constants';
import type { EngineSql, SqlRow } from './engine';
import { buildBuckets, HOUR_MS, wallClockText } from './time-buckets';

export const BOT_EVENTS_PER_DAY = 5000;
export const BOT_EVENTS_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const BOT_DAILY_PATHS_PER_DAY = 2000;
export const BOT_OTHER_PATHS = '(other)';
/** Sample rows one import may add to the recent list. */
export const BOT_IMPORT_SAMPLES_MAX = 5;
const BOT_PATH_MAX_LENGTH = 512;
const BOT_VERIFIED_CATEGORY_MAX_LENGTH = 64;
/** A stats window longer than this is cut to its most recent days. */
const BOT_STATS_MAX_DAYS = 400;
const DAY_MS = 24 * HOUR_MS;
const HOURS_PER_DAY = 24;
const LEGACY_DAY_OFFSET_MS = 12 * HOUR_MS;
const ISO_DAY_LENGTH = 10;
const ISO_MONTH_LENGTH = 7;
const ABSOLUTE_URL = /^https?:\/\//i;
const QUERY_OR_HASH = /[?#]/;
const STATUS_CLASSES = ['2xx', '3xx', '4xx', '5xx'] as const;
const STATUS_COLUMNS = ['s2', 's3', 's4', 's5'] as const;
const EVENT_COLUMNS_ADDED = [
  ['status', 'INTEGER'],
  ['verified', 'INTEGER'],
  ['verified_category', 'TEXT'],
  ['source', 'TEXT'],
] as const;

export interface BotEventRow {
  id: string;
  name: string;
  type: string;
  project_id: string;
  path: string;
  created_at: string;
  /** The HTTP status the site answered with, when reported. */
  status?: number | null;
  /** True: the edge verified the bot; false: it said it did not; null: unknown. */
  verified?: boolean | null;
  /** The edge's own category for a verified bot (Cloudflare's, e.g. `AI Crawler`). */
  verified_category?: string | null;
  /** Absent for a reported hit; the import's source for an imported sample. */
  source?: BotImportSource | null;
}

export interface BotStatsQuery {
  /** Window start, epoch ms (inclusive). */
  fromMs: number;
  /** Window end, epoch ms (inclusive). */
  toMs: number;
  /** The project's time zone: the series has one point per local day. */
  timezone: string;
  limit?: number;
  group?: BotGroup;
  verified?: BotVerifiedFilter;
  /** Hits a month may store; null or absent: no cap. */
  monthlyCap?: number | null;
}

export interface BotAddOptions {
  /** Hits a month may store; null or absent: no cap. */
  monthlyCap?: number | null;
}

export interface BotAddResult {
  /** Kept in the recent list (under the day's quota). */
  listed: boolean;
  /** The month's cap was reached: nothing was stored. */
  capped: boolean;
}

/** One imported estimate: hits of one bot on one path in one UTC hour. */
export interface BotImportRow {
  /** UTC hour number (epoch ms / 3 600 000, floored). */
  hour: number;
  name: string;
  type: string;
  path: string;
  hits: number;
  /** Hits per response status class, when the source reports them. */
  status?: Partial<IBotStatusCounts>;
}

/**
 * Everything one import knows about `fromHour`..`toHour` (exclusive): rows
 * this source stored for those hours before are replaced.
 */
export interface BotImportBatch {
  source: BotImportSource;
  fromHour: number;
  toHour: number;
  rows: BotImportRow[];
  /** A few rows for the recent list; at most BOT_IMPORT_SAMPLES_MAX are kept. */
  samples?: BotEventRow[];
  /** Hits a month may store; null or absent: no cap. */
  monthlyCap?: number | null;
}

export interface BotImportResult {
  /** Hours written. */
  hours: number;
  /** Rows written after merging. */
  rows: number;
  /** Hits written. */
  hits: number;
  /** Hours left out because the snippet reported them. */
  skippedHours: number;
  /** Hours left out because their month reached the cap. */
  cappedHours: number;
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

/** The status class column a hit counts in, if any. */
function statusColumn(status: number | null | undefined): string | null {
  if (typeof status !== 'number') {
    return null;
  }
  return STATUS_COLUMNS[Math.floor(status / 100) - 2] ?? null;
}

/** The month holding `ms`: its first day, the next month's (UTC day numbers). */
function monthDays(ms: number): { from: number; to: number; key: string } {
  const at = new Date(ms);
  const from = Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), 1);
  const to = Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1);
  return {
    from: from / DAY_MS,
    to: to / DAY_MS,
    key: at.toISOString().slice(0, ISO_MONTH_LENGTH),
  };
}

const emptyTotals = (): IBotStatsTotals => ({
  total: 0,
  ai: 0,
  answers: 0,
  indexing: 0,
  training: 0,
  search: 0,
  other: 0,
});

const emptySources = (): IBotSourceTotals => ({ snippet: 0, cloudflare: 0 });

const emptyStatus = (): IBotStatusCounts => ({
  '2xx': 0,
  '3xx': 0,
  '4xx': 0,
  '5xx': 0,
});

export function emptyBotStats(usage?: IBotUsage): IBotStats {
  return {
    totals: emptyTotals(),
    sources: emptySources(),
    series: [],
    topBots: [],
    topPaths: [],
    verifiedOnly: false,
    verifiedHits: 0,
    allHits: 0,
    usage: usage ?? {
      month: new Date().toISOString().slice(0, ISO_MONTH_LENGTH),
      hits: 0,
      cap: null,
      capped: false,
    },
  };
}

interface CountRow {
  /** Where the row falls in time: the middle of its hour. */
  at: number;
  source: BotSource;
  name: string;
  category: string;
  path: string;
  verified: boolean;
  hits: number;
  status: IBotStatusCounts;
  lastSeen: number;
}

/** Index of the bucket holding `at`, or -1; buckets are ascending. */
function bucketIndex(starts: number[], ends: number[], at: number): number {
  let low = 0;
  let high = starts.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (at < (starts[mid] ?? 0)) {
      high = mid - 1;
    } else if (at >= (ends[mid] ?? 0)) {
      low = mid + 1;
    } else {
      return mid;
    }
  }
  return -1;
}

function addTotals(totals: IBotStatsTotals, group: BotGroup, hits: number) {
  totals.total += hits;
  totals[group] += hits;
  if (isAiBotGroup(group)) {
    totals.ai += hits;
  }
}

function statusOf(row: SqlRow): IBotStatusCounts {
  return {
    '2xx': Number(row.s2 ?? 0),
    '3xx': Number(row.s3 ?? 0),
    '4xx': Number(row.s4 ?? 0),
    '5xx': Number(row.s5 ?? 0),
  };
}

export function openBotStore(sql: EngineSql) {
  sql.exec(
    'CREATE TABLE IF NOT EXISTS bot_events (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, path TEXT NOT NULL, created_at INTEGER NOT NULL) WITHOUT ROWID'
  );
  // Lists kept before status and verification gain the columns in place.
  for (const [column, type] of EVENT_COLUMNS_ADDED) {
    try {
      sql.exec(`SELECT ${column} FROM bot_events LIMIT 0`);
    } catch {
      sql.exec(`ALTER TABLE bot_events ADD COLUMN ${column} ${type}`);
    }
  }
  sql.exec(
    'CREATE INDEX IF NOT EXISTS bot_events_created ON bot_events (created_at)'
  );
  sql.exec(
    'CREATE TABLE IF NOT EXISTS bot_days (day INTEGER PRIMARY KEY, n INTEGER NOT NULL) WITHOUT ROWID'
  );
  sql.exec(
    'CREATE TABLE IF NOT EXISTS bot_hourly (hour INTEGER NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, path TEXT NOT NULL, verified INTEGER NOT NULL, hits INTEGER NOT NULL, s2 INTEGER NOT NULL DEFAULT 0, s3 INTEGER NOT NULL DEFAULT 0, s4 INTEGER NOT NULL DEFAULT 0, s5 INTEGER NOT NULL DEFAULT 0, last_at INTEGER NOT NULL, PRIMARY KEY (hour, name, type, path, verified)) WITHOUT ROWID'
  );
  sql.exec(
    'CREATE TABLE IF NOT EXISTS bot_day_paths (day INTEGER NOT NULL, path TEXT NOT NULL, PRIMARY KEY (day, path)) WITHOUT ROWID'
  );
  sql.exec(
    'CREATE TABLE IF NOT EXISTS bot_daily_paths (day INTEGER PRIMARY KEY, n INTEGER NOT NULL) WITHOUT ROWID'
  );
  // Read-only since hourly counts: see the header.
  sql.exec(
    'CREATE TABLE IF NOT EXISTS bot_daily (day INTEGER NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, path TEXT NOT NULL, hits INTEGER NOT NULL, last_at INTEGER NOT NULL, PRIMARY KEY (day, name, type, path)) WITHOUT ROWID'
  );
  sql.exec(
    'CREATE TABLE IF NOT EXISTS bot_hourly_imported (hour INTEGER NOT NULL, source TEXT NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, path TEXT NOT NULL, hits INTEGER NOT NULL, s2 INTEGER NOT NULL DEFAULT 0, s3 INTEGER NOT NULL DEFAULT 0, s4 INTEGER NOT NULL DEFAULT 0, s5 INTEGER NOT NULL DEFAULT 0, last_at INTEGER NOT NULL, PRIMARY KEY (hour, source, name, type, path)) WITHOUT ROWID'
  );
  sql.exec(
    'CREATE TABLE IF NOT EXISTS bot_import_hours (hour INTEGER NOT NULL, source TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (hour, source)) WITHOUT ROWID'
  );

  // The month's stored hits, kept in memory: this store is the only writer.
  let month: { key: string; hits: number } | null = null;

  /** Hits stored in the month holding `at`: reported and imported. */
  function readMonthHits(at: number): number {
    const { from, to } = monthDays(at);
    const [reported] = sql.exec(
      'SELECT coalesce(sum(n), 0) AS n FROM bot_days WHERE day >= ? AND day < ?',
      from,
      to
    );
    const [imported] = sql.exec(
      'SELECT coalesce(sum(n), 0) AS n FROM bot_import_hours WHERE hour >= ? AND hour < ?',
      from * HOURS_PER_DAY,
      to * HOURS_PER_DAY
    );
    return Number(reported?.n ?? 0) + Number(imported?.n ?? 0);
  }

  function monthHits(at: number): { key: string; hits: number } {
    const { key } = monthDays(at);
    if (month?.key !== key) {
      month = { key, hits: readMonthHits(at) };
    }
    return month;
  }

  /** The path a hit counts under: its own, or `(other)` past the day's cap. */
  function admitPath(day: number, path: string): string {
    const [known] = sql.exec(
      'SELECT 1 AS known FROM bot_day_paths WHERE day = ? AND path = ?',
      day,
      path
    );
    if (known) {
      return path;
    }
    const [paths] = sql.exec(
      'SELECT n FROM bot_daily_paths WHERE day = ?',
      day
    );
    if (Number(paths?.n ?? 0) >= BOT_DAILY_PATHS_PER_DAY) {
      return BOT_OTHER_PATHS;
    }
    sql.exec('INSERT INTO bot_day_paths (day, path) VALUES (?, ?)', day, path);
    sql.exec(
      'INSERT INTO bot_daily_paths (day, n) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET n = n + 1',
      day
    );
    return path;
  }

  function countHit(row: BotEventRow, at: number) {
    const path = admitPath(Math.floor(at / DAY_MS), botAggregatePath(row.path));
    const status = statusColumn(row.status);
    sql.exec(
      'INSERT INTO bot_hourly (hour, name, type, path, verified, hits, s2, s3, s4, s5, last_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?) ON CONFLICT(hour, name, type, path, verified) DO UPDATE SET hits = hits + 1, s2 = s2 + excluded.s2, s3 = s3 + excluded.s3, s4 = s4 + excluded.s4, s5 = s5 + excluded.s5, last_at = max(last_at, excluded.last_at)',
      Math.floor(at / HOUR_MS),
      row.name,
      row.type,
      path,
      row.verified ? 1 : 0,
      ...STATUS_COLUMNS.map((column) => (column === status ? 1 : 0)),
      at
    );
  }

  /** Imports one hour's merged rows; false when the month is capped. */
  function importHour(
    source: BotImportSource,
    hour: number,
    rows: BotImportRow[],
    cap: number | null | undefined
  ): { written: boolean; rows: number; hits: number } {
    const at = hour * HOUR_MS;
    const hits = rows.reduce((sum, row) => sum + row.hits, 0);
    if (cap != null && readMonthHits(at) >= cap) {
      return { written: false, rows: 0, hits: 0 };
    }
    const day = Math.floor(at / DAY_MS);
    const lastAt = at + HOUR_MS - 1;
    let stored = 0;
    for (const row of rows) {
      const path = admitPath(day, botAggregatePath(row.path));
      const status = row.status ?? {};
      sql.exec(
        'INSERT INTO bot_hourly_imported (hour, source, name, type, path, hits, s2, s3, s4, s5, last_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(hour, source, name, type, path) DO UPDATE SET hits = hits + excluded.hits, s2 = s2 + excluded.s2, s3 = s3 + excluded.s3, s4 = s4 + excluded.s4, s5 = s5 + excluded.s5',
        hour,
        source,
        row.name,
        row.type,
        path,
        row.hits,
        ...STATUS_CLASSES.map((statusClass) =>
          Math.max(0, Math.round(status[statusClass] ?? 0))
        ),
        lastAt
      );
      stored += 1;
    }
    sql.exec(
      'INSERT INTO bot_import_hours (hour, source, n) VALUES (?, ?, ?)',
      hour,
      source,
      hits
    );
    return { written: true, rows: stored, hits };
  }

  function importBatch(batch: BotImportBatch): BotImportResult {
    const { source, fromHour, toHour } = batch;
    const result: BotImportResult = {
      hours: 0,
      rows: 0,
      hits: 0,
      skippedHours: 0,
      cappedHours: 0,
    };
    const byHour = new Map<number, BotImportRow[]>();
    for (const row of batch.rows) {
      const hits = Math.round(row.hits);
      if (
        !Number.isFinite(row.hour) ||
        row.hour < fromHour ||
        row.hour >= toHour ||
        !(hits > 0)
      ) {
        continue;
      }
      const hourRows = byHour.get(row.hour) ?? [];
      hourRows.push({ ...row, hits });
      byHour.set(row.hour, hourRows);
    }
    const written = new Set<number>();
    sql.transaction(() => {
      sql.exec(
        'DELETE FROM bot_hourly_imported WHERE source = ? AND hour >= ? AND hour < ?',
        source,
        fromHour,
        toHour
      );
      sql.exec(
        'DELETE FROM bot_import_hours WHERE source = ? AND hour >= ? AND hour < ?',
        source,
        fromHour,
        toHour
      );
      for (const hour of [...byHour.keys()].sort((a, b) => a - b)) {
        const [reported] = sql.exec(
          'SELECT 1 AS reported FROM bot_hourly WHERE hour = ? LIMIT 1',
          hour
        );
        if (reported) {
          result.skippedHours += 1;
          continue;
        }
        const outcome = importHour(
          source,
          hour,
          byHour.get(hour) ?? [],
          batch.monthlyCap
        );
        if (!outcome.written) {
          result.cappedHours += 1;
          continue;
        }
        written.add(hour);
        result.hours += 1;
        result.rows += outcome.rows;
        result.hits += outcome.hits;
      }
      for (const sample of (batch.samples ?? []).slice(
        0,
        BOT_IMPORT_SAMPLES_MAX
      )) {
        const at = parseCreatedAt(sample.created_at);
        if (!written.has(Math.floor(at / HOUR_MS))) {
          continue;
        }
        sql.exec(
          'INSERT OR IGNORE INTO bot_events (id, name, type, path, created_at, status, verified, verified_category, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          sample.id,
          sample.name,
          sample.type,
          sample.path,
          at,
          sample.status ?? null,
          null,
          null,
          source
        );
      }
    });
    // The month's usage changed under the cache.
    month = null;
    return result;
  }

  function readCounts(fromMs: number, toMs: number): CountRow[] {
    // An hour belongs to the window when its middle does, and to the local
    // day its middle falls in; that also places half-hour zones sensibly.
    const fromHour = Math.ceil((fromMs - HOUR_MS / 2) / HOUR_MS);
    const toHour = Math.floor((toMs - HOUR_MS / 2) / HOUR_MS);
    const rows: CountRow[] = [];
    const reportedHours = new Set<number>();
    for (const row of sql.exec(
      'SELECT hour, name, type, path, verified, hits, s2, s3, s4, s5, last_at FROM bot_hourly WHERE hour >= ? AND hour <= ?',
      fromHour,
      toHour
    )) {
      reportedHours.add(Number(row.hour));
      rows.push({
        at: Number(row.hour) * HOUR_MS + HOUR_MS / 2,
        source: 'snippet',
        name: String(row.name),
        category: String(row.type),
        path: String(row.path),
        verified: Number(row.verified) === 1,
        hits: Number(row.hits),
        status: statusOf(row),
        lastSeen: Number(row.last_at),
      });
    }
    // The snippet reported these hours itself: its numbers win.
    for (const row of sql.exec(
      'SELECT hour, source, name, type, path, hits, s2, s3, s4, s5, last_at FROM bot_hourly_imported WHERE hour >= ? AND hour <= ?',
      fromHour,
      toHour
    )) {
      if (reportedHours.has(Number(row.hour))) {
        continue;
      }
      rows.push({
        at: Number(row.hour) * HOUR_MS + HOUR_MS / 2,
        source: String(row.source) as BotImportSource,
        name: String(row.name),
        category: String(row.type),
        path: String(row.path),
        verified: false,
        hits: Number(row.hits),
        status: statusOf(row),
        lastSeen: Number(row.last_at),
      });
    }
    const fromDay = Math.ceil((fromMs - LEGACY_DAY_OFFSET_MS) / DAY_MS);
    const toDay = Math.floor((toMs - LEGACY_DAY_OFFSET_MS) / DAY_MS);
    for (const row of sql.exec(
      'SELECT day, name, type, path, hits, last_at FROM bot_daily WHERE day >= ? AND day <= ?',
      fromDay,
      toDay
    )) {
      rows.push({
        at: Number(row.day) * DAY_MS + LEGACY_DAY_OFFSET_MS,
        source: 'snippet',
        name: String(row.name),
        category: String(row.type),
        path: String(row.path),
        verified: false,
        hits: Number(row.hits),
        status: emptyStatus(),
        lastSeen: Number(row.last_at),
      });
    }
    return rows;
  }

  function usage(cap: number | null | undefined, now: number): IBotUsage {
    const current = monthHits(now);
    return {
      month: current.key,
      hits: current.hits,
      cap: cap ?? null,
      capped: cap != null && current.hits >= cap,
    };
  }

  return {
    /**
     * Counts one bot hit and lists it while the day's list quota lasts.
     * Nothing is written once the month's cap is reached.
     */
    add(row: BotEventRow, options: BotAddOptions = {}): BotAddResult {
      const createdAt = parseCreatedAt(row.created_at);
      const day = Math.floor(createdAt / DAY_MS);
      const current = monthHits(createdAt);
      if (options.monthlyCap != null && current.hits >= options.monthlyCap) {
        return { listed: false, capped: true };
      }
      const listed = sql.transaction(() => {
        countHit(row, createdAt);
        const [counted] = sql.exec('SELECT n FROM bot_days WHERE day = ?', day);
        sql.exec(
          'INSERT INTO bot_days (day, n) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET n = n + 1',
          day
        );
        if (Number(counted?.n ?? 0) >= BOT_EVENTS_PER_DAY) {
          return false;
        }
        sql.exec(
          'INSERT OR IGNORE INTO bot_events (id, name, type, path, created_at, status, verified, verified_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          row.id,
          row.name,
          row.type,
          row.path,
          createdAt,
          row.status ?? null,
          row.verified == null ? null : Number(row.verified),
          row.verified_category?.slice(0, BOT_VERIFIED_CATEGORY_MAX_LENGTH) ??
            null
        );
        return true;
      });
      current.hits += 1;
      return { listed, capped: false };
    },
    /**
     * Stores one import's hourly estimates for `fromHour`..`toHour`,
     * replacing what the same source stored for those hours. Hours the
     * snippet reported, and hours of a month at its cap, are left out.
     */
    importHours(batch: BotImportBatch): BotImportResult {
      return importBatch(batch);
    },
    /** Newest first, as `SELECT * FROM events_bots ... ORDER BY created_at DESC`. */
    page(projectId: string, limit: number, offset: number): BotEventRow[] {
      return sql
        .exec(
          'SELECT id, name, type, path, created_at, status, verified, verified_category, source FROM bot_events ORDER BY created_at DESC LIMIT ? OFFSET ?',
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
          status: row.status == null ? null : Number(row.status),
          verified: row.verified == null ? null : Number(row.verified) === 1,
          verified_category:
            row.verified_category == null
              ? null
              : String(row.verified_category),
          ...(row.source == null
            ? {}
            : { source: String(row.source) as BotImportSource }),
        }));
    },
    count(): number {
      const [row] = sql.exec('SELECT count(*) AS n FROM bot_events');
      return Number(row?.n ?? 0);
    },
    /** This month's stored hits against `cap`. */
    usage(cap?: number | null, now: number = Date.now()): IBotUsage {
      return usage(cap, now);
    },
    /**
     * Totals, a zero-filled series of the project's local days, top bots and
     * top paths for `fromMs`..`toMs`, and the month's usage.
     */
    stats(query: BotStatsQuery, now: number = Date.now()): IBotStats {
      const monthUsage = usage(query.monthlyCap, now);
      const { toMs, timezone } = query;
      if (!(Number.isFinite(query.fromMs) && Number.isFinite(toMs))) {
        return emptyBotStats(monthUsage);
      }
      const fromMs = Math.max(query.fromMs, toMs - BOT_STATS_MAX_DAYS * DAY_MS);
      if (fromMs > toMs) {
        return emptyBotStats(monthUsage);
      }
      const limit = query.limit ?? BOT_STATS_TOP_LIMIT;

      const counts = readCounts(fromMs, toMs).filter(
        (row) =>
          !query.group || botGroup(row.name, row.category) === query.group
      );
      const verifiedHits = counts.reduce(
        (sum, row) => sum + (row.verified ? row.hits : 0),
        0
      );
      const allHits = counts.reduce((sum, row) => sum + row.hits, 0);
      const verifiedOnly =
        query.verified === 'verified' ||
        (query.verified === 'auto' && verifiedHits > 0);

      const buckets = buildBuckets(fromMs, toMs, 'day', timezone);
      const starts = buckets.map((bucket) => bucket.start);
      const ends = buckets.map((bucket) => bucket.end);
      const series = buckets.map(() => emptyTotals());
      const totals = emptyTotals();
      const sources = emptySources();
      const bots = new Map<string, IBotStats['topBots'][number]>();
      const paths = new Map<
        string,
        {
          hits: number;
          lastSeen: number;
          status: IBotStatusCounts;
          bots: Map<string, IBotStats['topPaths'][number]['bots'][number]>;
        }
      >();

      for (const row of counts) {
        if (verifiedOnly && !row.verified) {
          continue;
        }
        const { name, category, path, hits, lastSeen } = row;
        const group = botGroup(name, category);

        addTotals(totals, group, hits);
        sources[row.source] += hits;
        const day = series[bucketIndex(starts, ends, row.at)];
        if (day) {
          addTotals(day, group, hits);
        }

        const botKey = `${name}\u0000${category}`;
        const bot = bots.get(botKey) ?? {
          name,
          category,
          group,
          hits: 0,
          verifiedHits: 0,
          lastSeen,
        };
        bot.hits += hits;
        bot.verifiedHits += row.verified ? hits : 0;
        bot.lastSeen = Math.max(bot.lastSeen, lastSeen);
        bots.set(botKey, bot);

        const page = paths.get(path) ?? {
          hits: 0,
          lastSeen,
          status: emptyStatus(),
          bots: new Map(),
        };
        page.hits += hits;
        page.lastSeen = Math.max(page.lastSeen, lastSeen);
        for (const statusClass of STATUS_CLASSES) {
          page.status[statusClass] += row.status[statusClass];
        }
        const pageBot = page.bots.get(botKey) ?? {
          name,
          category,
          group,
          hits: 0,
        };
        pageBot.hits += hits;
        page.bots.set(botKey, pageBot);
        paths.set(path, page);
      }

      const byHits = (a: { hits: number }, b: { hits: number }) =>
        b.hits - a.hits;
      return {
        totals,
        sources,
        series: buckets.map((bucket, index) => ({
          date: wallClockText(bucket.start, timezone).slice(0, ISO_DAY_LENGTH),
          ...(series[index] ?? emptyTotals()),
        })),
        topBots: [...bots.values()].sort(byHits).slice(0, limit),
        topPaths: [...paths]
          .map(([path, page]) => ({
            path,
            hits: page.hits,
            lastSeen: page.lastSeen,
            status: page.status,
            bots: [...page.bots.values()]
              .sort(byHits)
              .slice(0, BOT_STATS_BOTS_PER_PATH),
          }))
          .sort(byHits)
          .slice(0, limit),
        verifiedOnly,
        verifiedHits,
        allHits,
        usage: monthUsage,
      };
    },
    /**
     * Drops what is older than `beforeMs`. A day's hit count stays while its
     * month is current, so the month's usage outlives the list's retention.
     */
    expire(beforeMs: number, now: number = Date.now()) {
      const beforeDay = Math.floor(beforeMs / DAY_MS);
      sql.exec('DELETE FROM bot_events WHERE created_at < ?', beforeMs);
      sql.exec(
        'DELETE FROM bot_days WHERE day < ?',
        Math.min(beforeDay, monthDays(now).from)
      );
      sql.exec(
        'DELETE FROM bot_hourly WHERE hour < ?',
        beforeDay * HOURS_PER_DAY
      );
      sql.exec('DELETE FROM bot_day_paths WHERE day < ?', beforeDay);
      sql.exec('DELETE FROM bot_daily_paths WHERE day < ?', beforeDay);
      sql.exec('DELETE FROM bot_daily WHERE day < ?', beforeDay);
      sql.exec(
        'DELETE FROM bot_hourly_imported WHERE hour < ?',
        beforeDay * HOURS_PER_DAY
      );
      sql.exec(
        'DELETE FROM bot_import_hours WHERE hour < ?',
        Math.min(beforeDay, monthDays(now).from) * HOURS_PER_DAY
      );
    },
  };
}

export type BotStore = ReturnType<typeof openBotStore>;
