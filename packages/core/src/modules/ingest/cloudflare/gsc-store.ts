// Google Search Console numbers of one project in the project's Durable
// Object SQLite, with the rules of the ClickHouse `gsc_*_daily` tables: one
// row per day (and page or query), a newer sync replacing an older one
// (ReplacingMergeTree(synced_at)); reads sum clicks and impressions and
// average CTR and position without weights, as the ClickHouse reads do.

import type { EngineSql, SqlValue } from './engine';

const TABLES = {
  daily: 'gsc_daily',
  pages: 'gsc_pages_daily',
  queries: 'gsc_queries_daily',
} as const;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS ${TABLES.daily} (date TEXT PRIMARY KEY, clicks REAL NOT NULL, impressions REAL NOT NULL, ctr REAL NOT NULL, position REAL NOT NULL, synced_at TEXT NOT NULL) WITHOUT ROWID`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.pages} (date TEXT NOT NULL, page TEXT NOT NULL, clicks REAL NOT NULL, impressions REAL NOT NULL, ctr REAL NOT NULL, position REAL NOT NULL, synced_at TEXT NOT NULL, PRIMARY KEY (date, page)) WITHOUT ROWID`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.queries} (date TEXT NOT NULL, query TEXT NOT NULL, clicks REAL NOT NULL, impressions REAL NOT NULL, ctr REAL NOT NULL, position REAL NOT NULL, synced_at TEXT NOT NULL, PRIMARY KEY (date, query)) WITHOUT ROWID`,
];

const DAY_MS = 24 * 60 * 60 * 1000;

export interface GscStoredRow {
  date: string;
  /** The page or query, for the per-page and per-query tables. */
  key?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscTotals {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export type GscQuery =
  | {
      kind: 'write';
      table: 'daily' | 'pages' | 'queries';
      syncedAt: string;
      rows: GscStoredRow[];
    }
  /** `startDate`/`endDate`: `YYYY-MM-DD`, both inclusive. */
  | {
      kind: 'overview';
      startDate: string;
      endDate: string;
      interval: 'day' | 'week' | 'month';
    }
  | {
      kind: 'top';
      table: 'pages' | 'queries';
      startDate: string;
      endDate: string;
      limit: number;
    };

const num = (value: SqlValue | undefined): number =>
  typeof value === 'number' ? value : Number(value ?? 0);

/** ClickHouse `toStartOfWeek(date)` (mode 0: Sunday) and `toStartOfMonth`. */
function bucketOf(date: string, interval: 'day' | 'week' | 'month'): string {
  if (interval === 'day') {
    return date;
  }
  if (interval === 'month') {
    return `${date.slice(0, 7)}-01`;
  }
  const ms = Date.parse(`${date}T00:00:00Z`);
  return new Date(ms - new Date(ms).getUTCDay() * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

export function openGscStore(sql: EngineSql) {
  for (const statement of SCHEMA) {
    sql.exec(statement);
  }

  function write(
    table: 'daily' | 'pages' | 'queries',
    syncedAt: string,
    rows: GscStoredRow[]
  ): number {
    const name = TABLES[table];
    sql.transaction(() => {
      for (const row of rows) {
        if (table === 'daily') {
          sql.exec(
            `INSERT OR REPLACE INTO ${name} (date, clicks, impressions, ctr, position, synced_at) VALUES (?, ?, ?, ?, ?, ?)`,
            row.date,
            row.clicks,
            row.impressions,
            row.ctr,
            row.position,
            syncedAt
          );
        } else {
          const column = table === 'pages' ? 'page' : 'query';
          sql.exec(
            `INSERT OR REPLACE INTO ${name} (date, ${column}, clicks, impressions, ctr, position, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            row.date,
            row.key ?? '',
            row.clicks,
            row.impressions,
            row.ctr,
            row.position,
            syncedAt
          );
        }
      }
    });
    return rows.length;
  }

  /** Clicks and impressions summed, CTR and position averaged, per bucket. */
  function overview(
    startDate: string,
    endDate: string,
    interval: 'day' | 'week' | 'month'
  ) {
    const buckets = new Map<
      string,
      { clicks: number; impressions: number; ctr: number; position: number; n: number }
    >();
    for (const row of sql.exec(
      `SELECT date, clicks, impressions, ctr, position FROM ${TABLES.daily} WHERE date >= ? AND date <= ? ORDER BY date`,
      startDate,
      endDate
    )) {
      const key = bucketOf(String(row.date), interval);
      const bucket = buckets.get(key) ?? {
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
        n: 0,
      };
      bucket.clicks += num(row.clicks);
      bucket.impressions += num(row.impressions);
      bucket.ctr += num(row.ctr);
      bucket.position += num(row.position);
      bucket.n += 1;
      buckets.set(key, bucket);
    }
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, bucket]) => ({
        date,
        clicks: bucket.clicks,
        impressions: bucket.impressions,
        ctr: bucket.ctr / bucket.n,
        position: bucket.position / bucket.n,
      }));
  }

  /** Pages or queries by clicks over the range. */
  function top(
    table: 'pages' | 'queries',
    startDate: string,
    endDate: string,
    limit: number
  ) {
    const column = table === 'pages' ? 'page' : 'query';
    return sql
      .exec(
        `SELECT ${column} AS key, sum(clicks) AS clicks, sum(impressions) AS impressions, avg(ctr) AS ctr, avg(position) AS position FROM ${TABLES[table]} WHERE date >= ? AND date <= ? GROUP BY ${column} ORDER BY clicks DESC LIMIT ?`,
        startDate,
        endDate,
        limit
      )
      .map((row) => ({
        [column]: String(row.key),
        clicks: num(row.clicks),
        impressions: num(row.impressions),
        ctr: num(row.ctr),
        position: num(row.position),
      }));
  }

  function answer(query: GscQuery): unknown {
    switch (query.kind) {
      case 'write':
        return write(query.table, query.syncedAt, query.rows);
      case 'overview':
        return overview(query.startDate, query.endDate, query.interval);
      default:
        return top(query.table, query.startDate, query.endDate, query.limit);
    }
  }

  return { write, overview, top, answer };
}

export type GscStore = ReturnType<typeof openGscStore>;
