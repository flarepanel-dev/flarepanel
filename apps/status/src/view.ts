// Turns stored rows into what the page shows. Pure: tested without a database.

import { CLOSED_STATUSES, type Impact } from './incidents';
import { type CheckState, MONITORS, type Monitor } from './monitors';
import { dayOf, HISTORY_DAYS, type Incident, type Snapshot } from './store';

const DAY = 24 * 60 * 60 * 1000;
/** A monitor not checked for this long shows "no data" rather than its last state. */
const STALE_AFTER_MS = 5 * 60 * 1000;

export type BarLevel = 'up' | 'minor' | 'major' | 'none';
export type DisplayState = CheckState | 'maintenance' | 'unknown';
export type Overall =
  | 'operational'
  | 'degraded'
  | 'partial'
  | 'major'
  | 'maintenance';

export interface Bar {
  day: string;
  level: BarLevel;
  label: string;
}

export interface MonitorView {
  monitor: Monitor;
  state: DisplayState;
  uptime: number | null;
  bars: Bar[];
  /** 24 hourly averages, oldest first; null where no check answered. */
  latency: (number | null)[];
  avgLatency: number | null;
  lastCheckedAt: number | null;
  lastError: string | null;
}

export interface PageView {
  now: number;
  overall: Overall;
  monitors: MonitorView[];
  active: Incident[];
  scheduled: Incident[];
  recent: Incident[];
}

export const OVERALL_TEXT: Record<Overall, string> = {
  operational: 'All systems operational',
  degraded: 'Degraded performance',
  partial: 'Partial outage',
  major: 'Major outage',
  maintenance: 'Maintenance in progress',
};

export function formatUptime(uptime: number | null): string {
  if (uptime === null) {
    return '—';
  }
  if (uptime >= 100) {
    return '100%';
  }
  return `${(Math.floor(uptime * 1000) / 1000).toFixed(3)}%`;
}

function minutes(count: number): string {
  return count === 1 ? '1 min' : `${count} min`;
}

function isOpen(incident: Incident, now: number): boolean {
  if (CLOSED_STATUSES.has(incident.status)) {
    return false;
  }
  return !(incident.status === 'scheduled' && incident.startedAt > now);
}

function touchesDay(
  incident: Incident,
  monitorId: string,
  day: string,
  now: number
) {
  if (
    !incident.monitors.includes(monitorId) ||
    incident.impact === 'maintenance'
  ) {
    return false;
  }
  const start = dayOf(incident.startedAt);
  const end = dayOf(incident.resolvedAt ?? now);
  return start <= day && day <= end;
}

export function buildView(snapshot: Snapshot): PageView {
  const { now } = snapshot;
  const active = snapshot.incidents.filter((i) => isOpen(i, now));
  const scheduled = snapshot.incidents.filter(
    (i) => i.status === 'scheduled' && i.startedAt > now
  );
  const recent = snapshot.incidents.filter(
    (i) => !(active.includes(i) || scheduled.includes(i))
  );
  const maintenanceNow = active.filter((i) => i.impact === 'maintenance');

  const days: string[] = [];
  for (let offset = HISTORY_DAYS - 1; offset >= 0; offset--) {
    days.push(dayOf(now - offset * DAY));
  }
  const currentHour = Math.floor(now / 3_600_000);

  const monitors = MONITORS.map((monitor): MonitorView => {
    const daily = new Map(
      snapshot.daily
        .filter((d) => d.monitor === monitor.id)
        .map((d) => [d.day, d])
    );
    let checks = 0;
    let down = 0;
    const bars = days.map((day): Bar => {
      const row = daily.get(day);
      const incidents = snapshot.incidents.filter((i) =>
        touchesDay(i, monitor.id, day, now)
      ).length;
      if (!row || row.checks === 0) {
        return { day, level: 'none', label: `${day}: no data` };
      }
      checks += row.checks;
      down += row.down;
      const ratio = (row.checks - row.down) / row.checks;
      let level: BarLevel = 'up';
      if (ratio < 0.99) {
        level = 'major';
      } else if (
        row.down > 0 ||
        incidents > 0 ||
        row.degraded > row.checks * 0.05
      ) {
        level = 'minor';
      }
      const parts = [`${formatUptime(ratio * 100)} uptime`];
      if (row.down > 0) {
        parts.push(`${minutes(row.down)} down`);
      }
      if (incidents > 0) {
        parts.push(incidents === 1 ? '1 incident' : `${incidents} incidents`);
      }
      return { day, level, label: `${day}: ${parts.join(' · ')}` };
    });

    const latest = snapshot.latest.find((l) => l.monitor === monitor.id);
    const fresh = latest && now - latest.at <= STALE_AFTER_MS;
    let state: DisplayState = fresh ? latest.state : 'unknown';
    if (maintenanceNow.some((i) => i.monitors.includes(monitor.id))) {
      state = 'maintenance';
    }

    const hours = snapshot.hours.filter((h) => h.monitor === monitor.id);
    const latency: (number | null)[] = [];
    for (let hour = currentHour - 23; hour <= currentHour; hour++) {
      const row = hours.find((h) => h.hour === hour);
      latency.push(
        row?.avg_latency == null ? null : Math.round(row.avg_latency)
      );
    }
    const answered = latency.filter((v): v is number => v !== null);

    return {
      monitor,
      state,
      uptime: checks > 0 ? ((checks - down) / checks) * 100 : null,
      bars,
      latency,
      avgLatency: answered.length
        ? Math.round(answered.reduce((a, b) => a + b, 0) / answered.length)
        : null,
      lastCheckedAt: latest?.at ?? null,
      lastError: latest?.state === 'down' ? latest.error : null,
    };
  });

  return {
    now,
    overall: overallOf(monitors, active),
    monitors,
    active,
    scheduled,
    recent,
  };
}

function overallOf(monitors: MonitorView[], active: Incident[]): Overall {
  const impacts = new Set<Impact>(active.map((i) => i.impact));
  const down = monitors.filter((m) => m.state === 'down').length;
  if (down >= Math.ceil(monitors.length / 2)) {
    return 'major';
  }
  if (down > 0 || impacts.has('major')) {
    return 'partial';
  }
  if (monitors.some((m) => m.state === 'degraded') || impacts.has('minor')) {
    return 'degraded';
  }
  if (impacts.has('maintenance')) {
    return 'maintenance';
  }
  return 'operational';
}
