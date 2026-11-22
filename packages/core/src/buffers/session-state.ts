// The session lifecycle as pure functions over one stored session and one
// event. The Redis session buffer and the Cloudflare ingest engine both
// persist what these return; neither re-derives a rule.

import { DateTime } from '@flarepanel/shared';
import type { IServiceCreateEventPayload } from '../modules/event/event.service';
import type { IClickhouseSession } from '../modules/session/session.service';

// 30min of idle in event-time → session ends.
export const DEFAULT_SESSION_TIMEOUT_MS = 1000 * 60 * 30;

/** A session row is rewritten on every event, so its group union is capped. */
export const MAX_SESSION_GROUPS = 100;

const CLICKHOUSE_DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss.SSS';

export type SessionDecision =
  | { kind: 'new'; current: IClickhouseSession; chRows: IClickhouseSession[] }
  | {
      kind: 'extend';
      current: IClickhouseSession;
      previous: IClickhouseSession;
      chRows: IClickhouseSession[];
    }
  | {
      kind: 'boundary';
      current: IClickhouseSession;
      closed: IClickhouseSession;
      chRows: IClickhouseSession[];
    };

export function toClickhouseDate(date: Date): string {
  return DateTime.fromJSDate(date)
    .setZone('UTC')
    .toFormat(CLICKHOUSE_DATE_FORMAT);
}

export function fromClickhouseDate(s: string): Date {
  return DateTime.fromFormat(s, CLICKHOUSE_DATE_FORMAT, {
    zone: 'UTC',
  }).toJSDate();
}

function pickUtm(
  payload: IServiceCreateEventPayload,
  key: 'utm_medium' | 'utm_source' | 'utm_campaign' | 'utm_content' | 'utm_term'
): string {
  const query = (
    payload.properties as { __query?: Record<string, unknown> } | undefined
  )?.__query;
  const v = query?.[key];
  return v ? String(v) : '';
}

/**
 * Whether an event takes part in the session lifecycle. `session_start` /
 * `session_end` are derived signals, not session activity.
 */
export function isSessionActivity(
  payload: IServiceCreateEventPayload
): boolean {
  if (!(payload.projectId && payload.deviceId)) {
    return false;
  }
  return payload.name !== 'session_start' && payload.name !== 'session_end';
}

export function isSessionBoundary(
  existing: IClickhouseSession,
  eventTimeMs: number,
  idleTimeoutMs: number
): boolean {
  return (
    eventTimeMs - fromClickhouseDate(existing.ended_at).getTime() >
    idleTimeoutMs
  );
}

/** Extend, open, or close-and-reopen the device's session for this event. */
export function decideSession(
  existing: IClickhouseSession | null,
  payload: IServiceCreateEventPayload,
  idleTimeoutMs: number
): SessionDecision {
  const isBoundary =
    existing !== null &&
    isSessionBoundary(existing, payload.createdAt.getTime(), idleTimeoutMs);

  if (existing && !isBoundary) {
    const { current, chRows } = extendSession(existing, payload);
    return { kind: 'extend', current, previous: existing, chRows };
  }

  const current = newSession(payload);
  if (existing) {
    return { kind: 'boundary', current, closed: existing, chRows: [current] };
  }
  return { kind: 'new', current, chRows: [current] };
}

/**
 * Extend an in-flight session with a new event. Returns the updated
 * session AND the pair of CollapsingMergeTree rows that ClickHouse needs
 * to replace the previous row (sign=-1 cancels, sign=+1 inserts).
 */
export function extendSession(
  existing: IClickhouseSession,
  payload: IServiceCreateEventPayload
): {
  current: IClickhouseSession;
  chRows: [IClickhouseSession, IClickhouseSession];
} {
  const oldRow: IClickhouseSession = { ...existing, sign: -1 };
  const current: IClickhouseSession = {
    ...existing,
    sign: 1,
    version: existing.version + 1,
  };

  // Out-of-order safety: treat the session window as [min(event ts),
  // max(event ts)]. Late-arriving events (offline mobile flush, retries)
  // can't drag ended_at backwards or push duration negative.
  const eventTimeMs = payload.createdAt.getTime();
  const startMs = fromClickhouseDate(current.created_at).getTime();
  const endMs = fromClickhouseDate(current.ended_at).getTime();
  const eventCh = toClickhouseDate(payload.createdAt);

  if (eventTimeMs >= endMs) {
    current.ended_at = eventCh;
    if (payload.path) {
      current.exit_path = payload.path;
    }
    if (payload.origin) {
      current.exit_origin = payload.origin;
    }
  }

  if (eventTimeMs < startMs) {
    current.created_at = eventCh;
    if (payload.path) {
      current.entry_path = payload.path;
    }
    if (payload.origin) {
      current.entry_origin = payload.origin;
    }
  } else {
    if (!current.entry_path && payload.path) {
      current.entry_path = payload.path;
    }
    if (!current.entry_origin && payload.origin) {
      current.entry_origin = payload.origin;
    }
  }

  current.duration =
    fromClickhouseDate(current.ended_at).getTime() -
    fromClickhouseDate(current.created_at).getTime();

  if (payload.name === 'revenue') {
    current.revenue = (current.revenue ?? 0) + (payload.revenue ?? 0);
  }

  if (payload.name === 'screen_view' && payload.path) {
    current.screen_view_count += 1;
  } else {
    current.event_count += 1;
  }

  if (current.screen_view_count > 1) {
    current.is_bounce = false;
  }

  if (payload.profileId && payload.profileId !== payload.deviceId) {
    current.profile_id = payload.profileId;
  }

  if (payload.groups?.length) {
    current.groups = [
      ...new Set([...(current.groups ?? []), ...payload.groups]),
    ].slice(0, MAX_SESSION_GROUPS);
  }

  return { current, chRows: [current, oldRow] };
}

/**
 * Open a brand-new session from this event's payload. Called for the first
 * event of a device AND on boundary (gap > 30min closing the old session).
 */
export function newSession(
  payload: IServiceCreateEventPayload
): IClickhouseSession {
  const createdAt = toClickhouseDate(payload.createdAt);
  // For anonymous traffic the SDK doesn't send a profileId — fall back to
  // the deviceId so each anonymous device shows up as a unique visitor in
  // the dashboard. Matches what `createEvent` does for the events table.
  const profileId = payload.profileId || payload.deviceId;
  return {
    id: payload.sessionId,
    project_id: payload.projectId,
    device_id: payload.deviceId,
    profile_id: profileId,
    is_bounce: true,
    created_at: createdAt,
    ended_at: createdAt,
    event_count: payload.name === 'screen_view' ? 0 : 1,
    screen_view_count: payload.name === 'screen_view' ? 1 : 0,
    entry_path: payload.path ?? '',
    entry_origin: payload.origin ?? '',
    exit_path: payload.path ?? '',
    exit_origin: payload.origin ?? '',
    revenue: payload.name === 'revenue' ? (payload.revenue ?? 0) : 0,
    referrer: payload.referrer ?? '',
    referrer_name: payload.referrerName ?? '',
    referrer_type: payload.referrerType ?? '',
    os: payload.os ?? '',
    os_version: payload.osVersion ?? '',
    browser: payload.browser ?? '',
    browser_version: payload.browserVersion ?? '',
    device: payload.device ?? '',
    brand: payload.brand ?? '',
    model: payload.model ?? '',
    country: payload.country ?? '',
    region: payload.region ?? '',
    city: payload.city ?? '',
    longitude: payload.longitude ?? null,
    latitude: payload.latitude ?? null,
    duration: payload.duration ?? 0,
    utm_medium: pickUtm(payload, 'utm_medium'),
    utm_source: pickUtm(payload, 'utm_source'),
    utm_campaign: pickUtm(payload, 'utm_campaign'),
    utm_content: pickUtm(payload, 'utm_content'),
    utm_term: pickUtm(payload, 'utm_term'),
    groups: (payload.groups ?? []).slice(0, MAX_SESSION_GROUPS),
    sign: 1,
    version: 1,
  };
}
