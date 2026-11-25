// Everything the status page keeps, in its own D1 database.

import {
  CLOSED_STATUSES,
  EMPTY_STATE,
  type Impact,
  type IncidentStatus,
  type MonitorState,
  nextState,
} from './incidents';
import { type CheckResult, type CheckState, monitorById } from './monitors';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
export const RAW_KEEP_MS = 48 * HOUR;
export const HISTORY_DAYS = 90;

export const dayOf = (at: number) => new Date(at).toISOString().slice(0, 10);

const newId = () =>
  `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;

/** Stores one round of checks and opens or resolves automatic incidents. */
export async function recordRound(
  db: D1Database,
  results: CheckResult[],
  now: number
): Promise<void> {
  const states = await db
    .prepare('SELECT monitor, fails, oks, incident_id FROM monitor_state')
    .all<{
      monitor: string;
      fails: number;
      oks: number;
      incident_id: string | null;
    }>();
  const previous = new Map<string, MonitorState>(
    states.results.map((row) => [
      row.monitor,
      { fails: row.fails, oks: row.oks, incidentId: row.incident_id },
    ])
  );

  const statements: D1PreparedStatement[] = [];
  for (const result of results) {
    statements.push(
      db
        .prepare(
          'INSERT OR REPLACE INTO checks (monitor, at, state, latency_ms, status_code, error) VALUES (?, ?, ?, ?, ?, ?)'
        )
        .bind(
          result.monitor,
          result.at,
          result.state,
          result.latencyMs,
          result.statusCode,
          result.error
        ),
      db
        .prepare(
          `INSERT INTO daily (monitor, day, checks, down, degraded, latency_sum)
           VALUES (?1, ?2, 1, ?3, ?4, ?5)
           ON CONFLICT (monitor, day) DO UPDATE SET
             checks = checks + 1,
             down = down + ?3,
             degraded = degraded + ?4,
             latency_sum = latency_sum + ?5`
        )
        .bind(
          result.monitor,
          dayOf(result.at),
          result.state === 'down' ? 1 : 0,
          result.state === 'degraded' ? 1 : 0,
          result.latencyMs ?? 0
        )
    );

    const { state, action } = nextState(
      previous.get(result.monitor) ?? EMPTY_STATE,
      result.state
    );
    let incidentId = state.incidentId;
    const name = monitorById.get(result.monitor)?.name ?? result.monitor;
    if (action?.type === 'open') {
      incidentId = newId();
      statements.push(
        db
          .prepare(
            `INSERT INTO incidents (id, title, impact, status, monitors, auto, started_at)
             VALUES (?, ?, 'major', 'investigating', ?, 1, ?)`
          )
          .bind(
            incidentId,
            `${name} is not responding`,
            JSON.stringify([result.monitor]),
            now
          ),
        db
          .prepare(
            'INSERT INTO incident_updates (incident_id, at, status, message) VALUES (?, ?, ?, ?)'
          )
          .bind(
            incidentId,
            now,
            'investigating',
            `Automated checks of ${name} are failing (${result.error ?? 'no answer'}). We are looking into it.`
          )
      );
    }
    if (action?.type === 'resolve') {
      statements.push(
        db
          .prepare(
            `UPDATE incidents SET status = 'resolved', resolved_at = ?
             WHERE id = ? AND status NOT IN ('resolved', 'completed')`
          )
          .bind(now, action.incidentId),
        db
          .prepare(
            'INSERT INTO incident_updates (incident_id, at, status, message) VALUES (?, ?, ?, ?)'
          )
          .bind(
            action.incidentId,
            now,
            'resolved',
            `${name} is answering normally again.`
          )
      );
    }
    statements.push(
      db
        .prepare(
          `INSERT INTO monitor_state (monitor, fails, oks, incident_id) VALUES (?1, ?2, ?3, ?4)
           ON CONFLICT (monitor) DO UPDATE SET fails = ?2, oks = ?3, incident_id = ?4`
        )
        .bind(result.monitor, state.fails, state.oks, incidentId)
    );
  }
  await db.batch(statements);
}

export async function prune(db: D1Database, now: number): Promise<void> {
  await db.batch([
    db.prepare('DELETE FROM checks WHERE at < ?').bind(now - RAW_KEEP_MS),
    db
      .prepare('DELETE FROM daily WHERE day < ?')
      .bind(dayOf(now - (HISTORY_DAYS + 1) * DAY)),
  ]);
}

// ---------- reads for the page ----------

export interface DailyRow {
  monitor: string;
  day: string;
  checks: number;
  down: number;
  degraded: number;
  latency_sum: number;
}

export interface LatestRow {
  monitor: string;
  at: number;
  state: CheckState;
  latency_ms: number | null;
  error: string | null;
}

export interface HourRow {
  monitor: string;
  hour: number;
  avg_latency: number | null;
  down: number;
}

export interface Incident {
  id: string;
  title: string;
  impact: Impact;
  status: IncidentStatus;
  monitors: string[];
  auto: boolean;
  startedAt: number;
  resolvedAt: number | null;
  scheduledUntil: number | null;
  updates: { at: number; status: IncidentStatus; message: string }[];
}

interface IncidentRow {
  id: string;
  title: string;
  impact: Impact;
  status: IncidentStatus;
  monitors: string;
  auto: number;
  started_at: number;
  resolved_at: number | null;
  scheduled_until: number | null;
}

export interface Snapshot {
  now: number;
  daily: DailyRow[];
  latest: LatestRow[];
  hours: HourRow[];
  incidents: Incident[];
}

async function withUpdates(
  db: D1Database,
  rows: IncidentRow[]
): Promise<Incident[]> {
  if (rows.length === 0) {
    return [];
  }
  const ids = rows.map((row) => row.id);
  const updates = await db
    .prepare(
      `SELECT incident_id, at, status, message FROM incident_updates
       WHERE incident_id IN (${ids.map(() => '?').join(',')}) ORDER BY at DESC`
    )
    .bind(...ids)
    .all<{
      incident_id: string;
      at: number;
      status: IncidentStatus;
      message: string;
    }>();
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    impact: row.impact,
    status: row.status,
    monitors: JSON.parse(row.monitors) as string[],
    auto: row.auto === 1,
    startedAt: row.started_at,
    resolvedAt: row.resolved_at,
    scheduledUntil: row.scheduled_until,
    updates: updates.results
      .filter((u) => u.incident_id === row.id)
      .map((u) => ({ at: u.at, status: u.status, message: u.message })),
  }));
}

/** Incidents that are open, or started within `sinceMs`. */
export async function loadIncidents(
  db: D1Database,
  since: number
): Promise<Incident[]> {
  const rows = await db
    .prepare(
      `SELECT * FROM incidents
       WHERE started_at >= ? OR status NOT IN ('resolved', 'completed')
       ORDER BY started_at DESC LIMIT 200`
    )
    .bind(since)
    .all<IncidentRow>();
  return withUpdates(db, rows.results);
}

export async function loadIncident(
  db: D1Database,
  id: string
): Promise<Incident | null> {
  const row = await db
    .prepare('SELECT * FROM incidents WHERE id = ?')
    .bind(id)
    .first<IncidentRow>();
  return row ? ((await withUpdates(db, [row]))[0] ?? null) : null;
}

export async function loadSnapshot(
  db: D1Database,
  now: number
): Promise<Snapshot> {
  const [daily, latest, hours] = await db.batch([
    db
      .prepare('SELECT * FROM daily WHERE day >= ? ORDER BY day')
      .bind(dayOf(now - (HISTORY_DAYS - 1) * DAY)),
    db.prepare(
      `SELECT c.monitor, c.at, c.state, c.latency_ms, c.error FROM checks c
       JOIN (SELECT monitor, MAX(at) AS at FROM checks GROUP BY monitor) l
         ON l.monitor = c.monitor AND l.at = c.at`
    ),
    db
      .prepare(
        `SELECT monitor, at / 3600000 AS hour, AVG(latency_ms) AS avg_latency,
                SUM(state = 'down') AS down
         FROM checks WHERE at >= ? GROUP BY monitor, hour ORDER BY hour`
      )
      .bind(now - 24 * HOUR),
  ]);
  return {
    now,
    daily: (daily?.results ?? []) as DailyRow[],
    latest: (latest?.results ?? []) as LatestRow[],
    hours: (hours?.results ?? []) as HourRow[],
    incidents: await loadIncidents(db, now - 7 * DAY),
  };
}

// ---------- operator writes ----------

export async function createIncident(
  db: D1Database,
  input: {
    title: string;
    impact: Impact;
    status: IncidentStatus;
    monitors: string[];
    message: string;
    startsAt?: number;
    scheduledUntil?: number;
  },
  now: number
): Promise<string> {
  const id = newId();
  const closed = CLOSED_STATUSES.has(input.status);
  await db.batch([
    db
      .prepare(
        `INSERT INTO incidents (id, title, impact, status, monitors, auto, started_at, resolved_at, scheduled_until)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`
      )
      .bind(
        id,
        input.title,
        input.impact,
        input.status,
        JSON.stringify(input.monitors),
        input.startsAt ?? now,
        closed ? now : null,
        input.scheduledUntil ?? null
      ),
    db
      .prepare(
        'INSERT INTO incident_updates (incident_id, at, status, message) VALUES (?, ?, ?, ?)'
      )
      .bind(id, now, input.status, input.message),
  ]);
  return id;
}

export async function addIncidentUpdate(
  db: D1Database,
  id: string,
  input: { status: IncidentStatus; message: string },
  now: number
): Promise<boolean> {
  const closed = CLOSED_STATUSES.has(input.status);
  const [updated] = await db.batch([
    db
      .prepare(
        'UPDATE incidents SET status = ?, resolved_at = CASE WHEN ? THEN ? ELSE NULL END WHERE id = ?'
      )
      .bind(input.status, closed ? 1 : 0, now, id),
    db
      .prepare(
        'INSERT INTO incident_updates (incident_id, at, status, message) SELECT ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM incidents WHERE id = ?)'
      )
      .bind(id, now, input.status, input.message, id),
    // A resolved automatic incident must not stay attached to its monitor.
    db
      .prepare(
        'UPDATE monitor_state SET incident_id = NULL WHERE incident_id = ? AND ?'
      )
      .bind(id, closed ? 1 : 0),
  ]);
  return (updated?.meta.changes ?? 0) > 0;
}
