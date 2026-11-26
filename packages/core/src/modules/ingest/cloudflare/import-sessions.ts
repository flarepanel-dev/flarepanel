// Sessions for imported events, with the rules of the ClickHouse import steps
// (`generateGapBasedSessionIds`, `createSessionsStartEndEvents`,
// `backfillSessionsToProduction` in import.service.ts):
// - per device in time order, events without a session id start a new one
//   after a 30-minute gap; the id is md5(`${device_id}-${counter}`);
//   server events (device 'server') get none;
// - each session gets a session_start one second before its first event,
//   carrying the first event's page, referrer, place and device, and a
//   session_end one second after its last event, carrying the last page and
//   the duration (last minus first event, ms);
// - the session's profile is any id that is not the device id, else the
//   device id; the session row counts screen views and other events, takes
//   entry from the start and exit from the end, and is a bounce with at most
//   one screen view. The end carries `__bounce` so the overview's rollups
//   count bounces the way the ClickHouse sessions table does.

import { createHash } from 'node:crypto';
import type { IClickhouseEvent } from '../../event/event.service';
import type { IClickhouseSession } from '../../session/session.service';
import { eventTimeMs } from './time-buckets';

export const IMPORT_SESSION_GAP_MS = 30 * 60 * 1000;
const SESSION_EDGE_MS = 1000;
const SERVER_DEVICE = 'server';

function chText(ms: number): string {
  return new Date(ms).toISOString().replace('T', ' ').replace('Z', '');
}

export function gapSessionId(deviceId: string, counter: number): string {
  return createHash('md5').update(`${deviceId}-${counter}`).digest('hex');
}

/** Where gap numbering stands for a device between slices. */
export interface DeviceSessionState {
  counter: number;
  lastAt: number;
  sessionId: string;
}

/**
 * Gives every event of one device (time order) without a session id the
 * gap-based one; returns the state to continue from.
 */
export function assignGapSessions(
  events: IClickhouseEvent[],
  state: DeviceSessionState = { counter: -1, lastAt: 0, sessionId: '' }
): DeviceSessionState {
  const next = { ...state };
  for (const event of events) {
    if (event.session_id || event.device === SERVER_DEVICE) {
      continue;
    }
    const at = eventTimeMs(event.created_at);
    if (!next.sessionId || at - next.lastAt > IMPORT_SESSION_GAP_MS) {
      next.counter += 1;
      next.sessionId = gapSessionId(event.device_id, next.counter);
    }
    next.lastAt = at;
    event.session_id = next.sessionId;
  }
  return next;
}

type Properties = IClickhouseEvent['properties'];

function sessionProfile(events: IClickhouseEvent[]): string {
  const identified = events.find(
    (event) => event.profile_id && event.profile_id !== event.device_id
  );
  return identified?.profile_id ?? events[0]?.profile_id ?? '';
}

function prop(properties: Properties, key: string): string {
  const value = properties?.[key];
  return value === null || value === undefined ? '' : String(value);
}

export interface ImportedSession {
  start: IClickhouseEvent;
  end: IClickhouseEvent;
  session: IClickhouseSession;
}

/** The start, end and session row of one session's events (any order). */
export function buildImportedSession(
  events: IClickhouseEvent[],
  importedAt: string
): ImportedSession | null {
  const ordered = events
    .filter(
      (event) => event.name !== 'session_start' && event.name !== 'session_end'
    )
    .sort((a, b) => eventTimeMs(a.created_at) - eventTimeMs(b.created_at));
  const first = ordered[0];
  const last = ordered.at(-1);
  if (!(first && last)) {
    return null;
  }
  const firstAt = eventTimeMs(first.created_at);
  const lastAt = eventTimeMs(last.created_at);
  const duration = Math.max(0, lastAt - firstAt);
  const profileId = sessionProfile(ordered);
  const screenViews = ordered.filter((e) => e.name === 'screen_view').length;
  const isBounce = screenViews <= 1;
  const shared = {
    device_id: first.device_id,
    profile_id: profileId,
    project_id: first.project_id,
    session_id: first.session_id,
    groups: [],
    referrer: first.referrer,
    referrer_name: first.referrer_name,
    referrer_type: first.referrer_type,
    country: first.country,
    city: first.city,
    region: first.region,
    longitude: first.longitude,
    latitude: first.latitude,
    os: first.os,
    os_version: first.os_version,
    browser: first.browser,
    browser_version: first.browser_version,
    device: first.device,
    brand: first.brand,
    model: first.model,
    imported_at: importedAt,
    sdk_name: 'import-session-reconstruction',
    sdk_version: '1.0.0',
  };
  const start = {
    ...shared,
    id: crypto.randomUUID(),
    name: 'session_start',
    path: first.path,
    origin: first.origin,
    duration: 0,
    properties: first.properties,
    created_at: chText(firstAt - SESSION_EDGE_MS),
  } as IClickhouseEvent;
  const end = {
    ...shared,
    id: crypto.randomUUID(),
    name: 'session_end',
    path: last.path,
    origin: last.origin,
    duration,
    properties: { ...last.properties, __bounce: String(isBounce) },
    created_at: chText(lastAt + SESSION_EDGE_MS),
  } as IClickhouseEvent;
  const session: IClickhouseSession = {
    id: first.session_id,
    project_id: first.project_id,
    profile_id: profileId,
    device_id: first.device_id,
    created_at: start.created_at,
    ended_at: end.created_at,
    is_bounce: isBounce,
    entry_origin: first.origin ?? '',
    entry_path: first.path ?? '',
    exit_origin: last.origin ?? '',
    exit_path: last.path ?? '',
    screen_view_count: screenViews,
    event_count: ordered.length - screenViews,
    revenue: 0,
    duration,
    country: first.country ?? '',
    region: first.region ?? '',
    city: first.city ?? '',
    longitude: first.longitude ?? null,
    latitude: first.latitude ?? null,
    device: first.device ?? '',
    brand: first.brand ?? '',
    model: first.model ?? '',
    browser: first.browser ?? '',
    browser_version: first.browser_version ?? '',
    os: first.os ?? '',
    os_version: first.os_version ?? '',
    utm_medium: prop(first.properties, '__query.utm_medium'),
    utm_source: prop(first.properties, '__query.utm_source'),
    utm_campaign: prop(first.properties, '__query.utm_campaign'),
    utm_content: prop(first.properties, '__query.utm_content'),
    utm_term: prop(first.properties, '__query.utm_term'),
    referrer: first.referrer ?? '',
    referrer_name: first.referrer_name ?? '',
    referrer_type: first.referrer_type ?? '',
    sign: 1,
    version: 1,
    groups: [],
  };
  return { start, end, session };
}
