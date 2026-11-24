// Bot traffic of one project in its Durable Object, as OpenPanel's
// `events_bots` table: one row per detected bot hit (name, type, path, time),
// listed newest first. Bots are kept out of analytics either way; this only
// keeps a record of them. Unlike ClickHouse, every row here is a metered
// write, so a project keeps at most BOT_EVENTS_PER_DAY a day (later hits that
// day are still filtered, just not listed) for BOT_EVENTS_TTL_MS.

import type { EngineSql } from './engine';

export const BOT_EVENTS_PER_DAY = 5000;
export const BOT_EVENTS_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface BotEventRow {
  id: string;
  name: string;
  type: string;
  project_id: string;
  path: string;
  created_at: string;
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

  return {
    /** Keeps one bot hit; false once today's quota is used. */
    add(row: BotEventRow): boolean {
      // ClickHouse's 'YYYY-MM-DD HH:MM:SS.mmm' is UTC without a zone.
      const iso = row.created_at.replace(' ', 'T');
      const at = Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
      const createdAt = Number.isFinite(at) ? at : Date.now();
      const day = Math.floor(createdAt / DAY_MS);
      const [counted] = sql.exec('SELECT n FROM bot_days WHERE day = ?', day);
      if (Number(counted?.n ?? 0) >= BOT_EVENTS_PER_DAY) {
        return false;
      }
      sql.transaction(() => {
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
      });
      return true;
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
    expire(beforeMs: number) {
      sql.exec('DELETE FROM bot_events WHERE created_at < ?', beforeMs);
      sql.exec(
        'DELETE FROM bot_days WHERE day < ?',
        Math.floor(beforeMs / DAY_MS)
      );
    },
  };
}

export type BotStore = ReturnType<typeof openBotStore>;
