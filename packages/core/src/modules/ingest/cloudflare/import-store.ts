// An import's staging area in the project's Durable Object SQLite. The
// Worker's import job feeds it in slices (each slice's events and the source
// position it reached are written in one transaction, so a retried slice never
// stages twice); then sessions are built per device; then the staged events
// are committed to the engine in time order (chunks stay time-local, rollups
// update as for live events) and the sessions are logged for the Sessions page.

import type { IClickhouseEvent } from '../../event/event.service';
import type { IClickhouseSession } from '../../session/session.service';
import type { EngineSql, SqlValue } from './engine';
import { assignGapSessions, buildImportedSession } from './import-sessions';
import { eventTimeMs } from './time-buckets';

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS import_staging (import_id TEXT NOT NULL, seq INTEGER NOT NULL, device_id TEXT NOT NULL, ts INTEGER NOT NULL, session_id TEXT NOT NULL, body TEXT NOT NULL, PRIMARY KEY (import_id, seq)) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS import_staging_device ON import_staging (import_id, device_id, ts, seq)',
  'CREATE INDEX IF NOT EXISTS import_staging_time ON import_staging (import_id, ts, seq)',
  'CREATE TABLE IF NOT EXISTS import_sessions (import_id TEXT NOT NULL, id TEXT NOT NULL, body TEXT NOT NULL, PRIMARY KEY (import_id, id)) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS import_meta (import_id TEXT PRIMARY KEY, body TEXT NOT NULL) WITHOUT ROWID',
];

/** Rows read per query while committing or logging. */
const PAGE = 1000;

export interface ImportState {
  /** Next staging sequence number. */
  seq: number;
  staged: number;
  /** Opaque position of the Worker's source reader (byte offset, day, ...). */
  source: string | null;
  sourceDone: boolean;
  /** Last device whose sessions are built ('' before the first). */
  sessionsDevice: string;
  sessionsDone: boolean;
  sessionCount: number;
  /** Last committed (ts, seq). */
  commitTs: number;
  commitSeq: number;
  committed: number;
  commitDone: boolean;
  /** Last logged session id. */
  loggedSession: string;
  logDone: boolean;
}

const FRESH: ImportState = {
  seq: 0,
  staged: 0,
  source: null,
  sourceDone: false,
  sessionsDevice: '',
  sessionsDone: false,
  sessionCount: 0,
  commitTs: Number.MIN_SAFE_INTEGER,
  commitSeq: -1,
  committed: 0,
  commitDone: false,
  loggedSession: '',
  logDone: false,
};

const num = (value: SqlValue | undefined): number =>
  typeof value === 'number' ? value : Number(value ?? 0);

export interface ImportEngineHooks {
  /** Appends events to the engine (rollups, names, chunks) and makes them durable. */
  appendEvents(events: IClickhouseEvent[]): Promise<void>;
  logSessions(sessions: IClickhouseSession[]): void;
}

export function openImportStore(sql: EngineSql) {
  for (const statement of SCHEMA) {
    sql.exec(statement);
  }

  function state(importId: string): ImportState {
    const [row] = sql.exec(
      'SELECT body FROM import_meta WHERE import_id = ?',
      importId
    );
    return row
      ? { ...FRESH, ...(JSON.parse(String(row.body)) as ImportState) }
      : { ...FRESH };
  }

  function save(importId: string, value: ImportState) {
    sql.exec(
      'INSERT OR REPLACE INTO import_meta (import_id, body) VALUES (?, ?)',
      importId,
      JSON.stringify(value)
    );
  }

  function insertStaged(importId: string, current: ImportState, event: IClickhouseEvent) {
    sql.exec(
      'INSERT INTO import_staging (import_id, seq, device_id, ts, session_id, body) VALUES (?, ?, ?, ?, ?, ?)',
      importId,
      current.seq,
      event.device_id ?? '',
      eventTimeMs(event.created_at),
      event.session_id ?? '',
      JSON.stringify(event)
    );
    current.seq += 1;
  }

  /**
   * One slice of source events, and where the source reader now stands.
   * Skipped when the slice was already staged (same `from` position).
   */
  function stage(
    importId: string,
    events: IClickhouseEvent[],
    from: string | null,
    to: string | null,
    done: boolean
  ): ImportState {
    return sql.transaction(() => {
      const current = state(importId);
      if (current.source !== from) {
        // A retried slice whose first attempt already landed.
        return current;
      }
      for (const event of events) {
        insertStaged(importId, current, event);
      }
      current.staged += events.length;
      current.source = to;
      current.sourceDone = done;
      save(importId, current);
      return current;
    });
  }

  function deviceRows(importId: string, deviceId: string) {
    return sql.exec(
      'SELECT seq, body FROM import_staging WHERE import_id = ? AND device_id = ? ORDER BY ts, seq',
      importId,
      deviceId
    );
  }

  /** Sessions for whole devices until about `maxRows` events are handled. */
  function buildSessions(
    importId: string,
    maxRows: number,
    importedAt: string
  ): ImportState {
    let handled = 0;
    let current = state(importId);
    while (!current.sessionsDone && handled < maxRows) {
      const [next] = sql.exec(
        'SELECT device_id FROM import_staging WHERE import_id = ? AND device_id > ? ORDER BY device_id LIMIT 1',
        importId,
        current.sessionsDevice
      );
      if (!next) {
        current.sessionsDone = true;
        save(importId, current);
        break;
      }
      const deviceId = String(next.device_id);
      current = sql.transaction(() => {
        const working = state(importId);
        const rows = deviceRows(importId, deviceId);
        const events = rows.map(
          (row) => JSON.parse(String(row.body)) as IClickhouseEvent
        );
        const before = events.map((event) => event.session_id ?? '');
        assignGapSessions(events);
        const bySession = new Map<string, IClickhouseEvent[]>();
        events.forEach((event, index) => {
          if (event.session_id !== before[index]) {
            sql.exec(
              'UPDATE import_staging SET session_id = ?, body = ? WHERE import_id = ? AND seq = ?',
              event.session_id,
              JSON.stringify(event),
              importId,
              num(rows[index]?.seq)
            );
          }
          if (event.session_id) {
            const list = bySession.get(event.session_id) ?? [];
            list.push(event);
            bySession.set(event.session_id, list);
          }
        });
        for (const sessionEvents of bySession.values()) {
          const built = buildImportedSession(sessionEvents, importedAt);
          if (!built) {
            continue;
          }
          insertStaged(importId, working, built.start);
          insertStaged(importId, working, built.end);
          sql.exec(
            'INSERT OR REPLACE INTO import_sessions (import_id, id, body) VALUES (?, ?, ?)',
            importId,
            built.session.id,
            JSON.stringify(built.session)
          );
          working.sessionCount += 1;
        }
        working.sessionsDevice = deviceId;
        save(importId, working);
        handled += events.length;
        return working;
      });
    }
    return current;
  }

  /** Staged events after the commit cursor, in time order. */
  function nextToCommit(importId: string, maxRows: number) {
    const current = state(importId);
    return sql
      .exec(
        'SELECT seq, ts, body FROM import_staging WHERE import_id = ? AND (ts > ? OR (ts = ? AND seq > ?)) ORDER BY ts, seq LIMIT ?',
        importId,
        current.commitTs,
        current.commitTs,
        current.commitSeq,
        maxRows
      )
      .map((row) => ({
        seq: num(row.seq),
        ts: num(row.ts),
        event: JSON.parse(String(row.body)) as IClickhouseEvent,
      }));
  }

  /**
   * Commits up to `maxRows` staged events through the engine. The cursor is
   * saved right after the engine's write, with no I/O between them, so the
   * Durable Object stores both or neither.
   */
  async function commit(
    importId: string,
    maxRows: number,
    hooks: ImportEngineHooks
  ): Promise<ImportState> {
    let remaining = maxRows;
    let current = state(importId);
    while (!current.commitDone && remaining > 0) {
      const rows = nextToCommit(importId, Math.min(PAGE, remaining));
      if (rows.length === 0) {
        current.commitDone = true;
        save(importId, current);
        break;
      }
      await hooks.appendEvents(rows.map((row) => row.event));
      const last = rows.at(-1) as (typeof rows)[number];
      current = state(importId);
      current.commitTs = last.ts;
      current.commitSeq = last.seq;
      current.committed += rows.length;
      save(importId, current);
      remaining -= rows.length;
    }
    return current;
  }

  /** Logs built sessions (Sessions page) in id order. */
  function logSessions(
    importId: string,
    maxRows: number,
    hooks: ImportEngineHooks
  ): ImportState {
    return sql.transaction(() => {
      const current = state(importId);
      const rows = sql.exec(
        'SELECT id, body FROM import_sessions WHERE import_id = ? AND id > ? ORDER BY id LIMIT ?',
        importId,
        current.loggedSession,
        maxRows
      );
      if (rows.length === 0) {
        current.logDone = true;
      } else {
        hooks.logSessions(
          rows.map((row) => JSON.parse(String(row.body)) as IClickhouseSession)
        );
        current.loggedSession = String(rows.at(-1)?.id);
        current.logDone = rows.length < maxRows;
      }
      save(importId, current);
      return current;
    });
  }

  /** Removes the import's staging rows, sessions and state. */
  function cleanup(importId: string) {
    sql.exec('DELETE FROM import_staging WHERE import_id = ?', importId);
    sql.exec('DELETE FROM import_sessions WHERE import_id = ?', importId);
    sql.exec('DELETE FROM import_meta WHERE import_id = ?', importId);
  }

  return { state, stage, buildSessions, commit, logSessions, cleanup };
}

export type ImportStore = ReturnType<typeof openImportStore>;

/** The import operations as one Durable Object call (answers are JSON text). */
export type ImportQuery =
  | {
      kind: 'stage';
      importId: string;
      eventsJson: string;
      profilesJson?: string;
      from: string | null;
      to: string | null;
      done: boolean;
    }
  | { kind: 'sessions'; importId: string; maxRows: number }
  | { kind: 'commit'; importId: string; maxRows: number }
  | { kind: 'logSessions'; importId: string; maxRows: number }
  | { kind: 'state'; importId: string }
  | { kind: 'cleanup'; importId: string };
