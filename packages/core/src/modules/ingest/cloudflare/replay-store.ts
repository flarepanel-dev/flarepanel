// Session replays on Cloudflare, with the rules of OpenPanel's ClickHouse
// `session_replay_chunks` table: chunks are kept 30 days and played back in
// (started_at, ended_at, chunk_index) order.
//
// - The chunks themselves go to R2, gzip-compressed, one object each:
//   replays/<project>/<session>/<started>-<ended>-<index>.json.gz
//   The name comes from the chunk, so a retried upload overwrites itself, and
//   R2's lexical listing is the playback order. An R2 lifecycle rule on
//   `replays/` removes them after 30 days.
// - The project's Durable Object keeps one row per recorded session, for the
//   "has replay" mark on the Sessions pages.

import type { EngineSql } from './engine';

export const REPLAY_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const TABLE = 'replay_sessions';
const SAFE_ID = /^[A-Za-z0-9._-]{1,128}$/;
const MS_DIGITS = 13;
const INDEX_DIGITS = 5;

export function replayPrefix(projectId: string, sessionId?: string): string {
  return sessionId === undefined
    ? `replays/${projectId}/`
    : `replays/${projectId}/${sessionId}/`;
}

/** Ids that are safe as R2 key segments; anything else is refused. */
export function isReplayId(value: string): boolean {
  return SAFE_ID.test(value) && value !== '.' && value !== '..';
}

export interface ReplayChunkRef {
  projectId: string;
  sessionId: string;
  chunkIndex: number;
  startedAt: string;
  endedAt: string;
}

export function replayChunkKey(chunk: ReplayChunkRef): string | null {
  const started = Date.parse(chunk.startedAt);
  const ended = Date.parse(chunk.endedAt);
  const valid =
    isReplayId(chunk.projectId) &&
    isReplayId(chunk.sessionId) &&
    Number.isFinite(started) &&
    Number.isFinite(ended) &&
    started >= 0 &&
    ended >= 0 &&
    Number.isInteger(chunk.chunkIndex) &&
    chunk.chunkIndex >= 0;
  if (!valid) {
    return null;
  }
  const pad = (value: number, digits: number) =>
    String(Math.trunc(value)).padStart(digits, '0');
  return `${replayPrefix(chunk.projectId, chunk.sessionId)}${pad(started, MS_DIGITS)}-${pad(ended, MS_DIGITS)}-${pad(chunk.chunkIndex, INDEX_DIGITS)}.json.gz`;
}

export function openReplayIndex(sql: EngineSql) {
  sql.exec(
    `CREATE TABLE IF NOT EXISTS ${TABLE} (session_id TEXT PRIMARY KEY, started_at INTEGER NOT NULL) WITHOUT ROWID`
  );
  sql.exec(
    `CREATE INDEX IF NOT EXISTS ${TABLE}_started ON ${TABLE} (started_at)`
  );

  return {
    /** Marks a session as recorded; the earliest start wins. */
    mark(sessionId: string, startedAtMs: number) {
      sql.exec(
        `INSERT INTO ${TABLE} (session_id, started_at) VALUES (?, ?) ON CONFLICT(session_id) DO UPDATE SET started_at = min(started_at, excluded.started_at)`,
        sessionId,
        startedAtMs
      );
    },
    /** Which of these sessions have a replay. */
    recorded(sessionIds: readonly string[]): Set<string> {
      const found = new Set<string>();
      const unique = [...new Set(sessionIds)];
      // SQLite's bound-parameter limit is 100 in Durable Objects.
      for (let start = 0; start < unique.length; start += 90) {
        const batch = unique.slice(start, start + 90);
        const rows = sql.exec(
          `SELECT session_id FROM ${TABLE} WHERE session_id IN (${batch.map(() => '?').join(', ')})`,
          ...batch
        );
        for (const row of rows) {
          found.add(String(row.session_id));
        }
      }
      return found;
    },
    /** Rows whose chunks R2 has already expired. */
    expire(beforeMs: number) {
      sql.exec(`DELETE FROM ${TABLE} WHERE started_at < ?`, beforeMs);
    },
  };
}

export type ReplayIndex = ReturnType<typeof openReplayIndex>;
