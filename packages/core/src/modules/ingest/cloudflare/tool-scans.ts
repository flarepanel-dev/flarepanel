// Reads the assistant, MCP server and `/insights` API need beyond the
// dashboard's, from a project's stored events and profiles, with the rules of
// the ClickHouse queries they replace:
// - weekly retention: identified people (profile id != device id) active in
//   a week (UTC, from Sunday) and again the following week;
// - rolling active users: distinct profile ids (anonymous ones included, as
//   the daily-active view keeps them) over the `days` UTC days ending on
//   each date, up to today;
// - last seen: identified people by whole UTC days since their last event;
// - find profiles: id/name/email search (every word must match), email and
//   visitor-property equality, profile filters, inactivity, a minimum number
//   of sessions and a performed event, newest (or oldest) first;
// - page conversions: a page view counts for a visitor when their next
//   conversion (after the view) comes within the window; visitors are the
//   page's distinct sessions.
// - traffic attribution: sessions grouped by one or two of their own columns
//   (UTM, referrer, place, device), with sessions, page views and revenue
//   (cents to units, as `sum(revenue) / 100`), largest first.

import type { IClickhouseEvent } from '../../event/event.service';
import type { IClickhouseProfile } from '../../profile/profile.service';
import type { IClickhouseSession } from '../../session/session.service';
import { matchesFilters, type RowFilter } from './filter-eval';
import { eventTimeMs } from './time-buckets';

const DAY_MS = 24 * 60 * 60 * 1000;
const SEARCH_MAX_TOKENS = 5;
const PROFILE_PREFIX = /^profiles?\./;
const SEARCH_SPLIT = /\s+/;

export type ToolQuery =
  /** `from`/`to` epoch ms; absent means everything the object keeps. */
  | { kind: 'weeklyRetention'; from?: number; to?: number }
  | { kind: 'rollingActive'; days: number }
  | { kind: 'lastSeen'; from?: number; to?: number }
  | { kind: 'findProfiles'; query: FindProfilesQuery }
  | {
      kind: 'pageConversions';
      from: number;
      to: number;
      conversionEvent: string;
      windowHours: number;
      limit: number;
    }
  | {
      kind: 'trafficAttribution';
      from: number;
      to: number;
      dimensions: string[];
      sortBy: 'sessions' | 'pageviews' | 'revenue';
      limit: number;
    };

export interface FindProfilesQuery {
  name?: string;
  email?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  inactiveDays?: number;
  minSessions?: number;
  performedEvent?: string;
  /** Profile filters as reports name them (`email`, `properties.plan`). */
  filters?: RowFilter[];
  sortOrder: 'asc' | 'desc';
  limit: number;
}

export interface ToolScanSource {
  now: number;
  /** Oldest time the object keeps raw events for (the hot window). */
  hotFrom: number;
  scan: (
    from: number,
    to: number,
    visit: (event: IClickhouseEvent) => void
  ) => Promise<boolean>;
  profiles: () => IClickhouseProfile[];
  /** Sessions created in [from, to): open ones and the session log. */
  sessions?: (
    from: number,
    to: number,
    visit: (session: IClickhouseSession) => void
  ) => boolean;
}

/** Columns a session carries that attribution may group by. */
const ATTRIBUTION_COLUMNS = new Set([
  'referrer_name',
  'referrer_type',
  'referrer',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'country',
  'region',
  'city',
  'device',
  'browser',
  'os',
  'entry_path',
  'exit_path',
]);

function trafficAttribution(
  source: ToolScanSource,
  query: Extract<ToolQuery, { kind: 'trafficAttribution' }>
) {
  const dimensions = query.dimensions.filter((d) => ATTRIBUTION_COLUMNS.has(d));
  const groups = new Map<
    string,
    { keys: string[]; sessions: number; pageviews: number; revenue: number }
  >();
  source.sessions?.(query.from, query.to, (session) => {
    const record = session as unknown as Record<string, unknown>;
    const keys = dimensions.map((d) => String(record[d] ?? ''));
    const id = JSON.stringify(keys);
    const group = groups.get(id) ?? {
      keys,
      sessions: 0,
      pageviews: 0,
      revenue: 0,
    };
    group.sessions += 1;
    group.pageviews += Number(session.screen_view_count ?? 0);
    group.revenue += Number(session.revenue ?? 0);
    groups.set(id, group);
  });
  return [...groups.values()]
    .map((group) => ({
      ...Object.fromEntries(dimensions.map((d, i) => [d, group.keys[i]])),
      sessions: group.sessions,
      pageviews: group.pageviews,
      revenue: group.revenue / 100,
    }))
    .sort((a, b) => b[query.sortBy] - a[query.sortBy])
    .slice(0, query.limit);
}

const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Sunday 00:00 UTC of the week holding `ms` (ClickHouse `toStartOfWeek`, mode 0). */
function weekStart(ms: number): number {
  const day = Math.floor(ms / DAY_MS) * DAY_MS;
  return day - new Date(day).getUTCDay() * DAY_MS;
}

const isIdentified = (event: IClickhouseEvent) =>
  Boolean(event.profile_id) && event.profile_id !== event.device_id;

async function weeklyRetention(
  source: ToolScanSource,
  from: number,
  to: number
) {
  const weeks = new Map<number, Set<string>>();
  await source.scan(from, to, (event) => {
    if (!isIdentified(event)) {
      return;
    }
    const week = weekStart(eventTimeMs(event.created_at));
    let people = weeks.get(week);
    if (!people) {
      people = new Set();
      weeks.set(week, people);
    }
    people.add(event.profile_id);
  });
  return [...weeks.entries()]
    .sort(([a], [b]) => a - b)
    .map(([week, people]) => {
      const next = weeks.get(week + 7 * DAY_MS);
      const retained = next
        ? [...people].filter((id) => next.has(id)).length
        : 0;
      return {
        date: dayKey(week),
        active_users: people.size,
        retained_users: retained,
        retention: (100 * retained) / people.size,
      };
    });
}

async function rollingActive(source: ToolScanSource, days: number) {
  const perDay = new Map<number, Set<string>>();
  await source.scan(source.hotFrom, source.now, (event) => {
    const day = Math.floor(eventTimeMs(event.created_at) / DAY_MS);
    let people = perDay.get(day);
    if (!people) {
      people = new Set();
      perDay.set(day, people);
    }
    people.add(event.profile_id);
  });
  if (perDay.size === 0) {
    return [];
  }
  const today = Math.floor(source.now / DAY_MS);
  const first = Math.min(...perDay.keys());
  const last = Math.min(today, Math.max(...perDay.keys()) + days - 1);
  const rows: { date: string; users: number }[] = [];
  for (let day = first; day <= last; day++) {
    const people = new Set<string>();
    for (let back = 0; back < days; back++) {
      for (const id of perDay.get(day - back) ?? []) {
        people.add(id);
      }
    }
    if (people.size > 0) {
      rows.push({ date: dayKey(day * DAY_MS), users: people.size });
    }
  }
  return rows;
}

async function lastSeen(source: ToolScanSource, from: number, to: number) {
  const last = new Map<string, number>();
  await source.scan(from, to, (event) => {
    if (!isIdentified(event)) {
      return;
    }
    const at = eventTimeMs(event.created_at);
    if (at > (last.get(event.profile_id) ?? Number.NEGATIVE_INFINITY)) {
      last.set(event.profile_id, at);
    }
  });
  const today = Math.floor(source.now / DAY_MS);
  const byDays = new Map<number, number>();
  for (const at of last.values()) {
    const days = today - Math.floor(at / DAY_MS);
    byDays.set(days, (byDays.get(days) ?? 0) + 1);
  }
  return [...byDays.entries()]
    .sort(([a], [b]) => a - b)
    .map(([days, users]) => ({ days, users }));
}

function matchesSearch(profile: IClickhouseProfile, search: string): boolean {
  const tokens = search
    .trim()
    .toLowerCase()
    .split(SEARCH_SPLIT)
    .filter(Boolean)
    .slice(0, SEARCH_MAX_TOKENS);
  const fields = [
    profile.id,
    profile.email,
    profile.first_name,
    profile.last_name,
    `${profile.first_name} ${profile.last_name}`,
  ].map((value) => (value ?? '').toLowerCase());
  return tokens.every((token) => fields.some((field) => field.includes(token)));
}

function createdMs(profile: IClickhouseProfile): number {
  const parsed = eventTimeMs(profile.created_at);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function findProfiles(source: ToolScanSource, query: FindProfilesQuery) {
  const inactiveFrom =
    query.inactiveDays === undefined
      ? null
      : source.now - query.inactiveDays * DAY_MS;
  const needsScan =
    inactiveFrom !== null ||
    query.minSessions !== undefined ||
    Boolean(query.performedEvent);
  const active = new Set<string>();
  const sessions = new Map<string, number>();
  const performed = new Set<string>();
  if (needsScan) {
    const from =
      query.minSessions !== undefined || query.performedEvent
        ? source.hotFrom
        : Math.max(source.hotFrom, inactiveFrom ?? source.hotFrom);
    await source.scan(from, source.now, (event) => {
      if (!event.profile_id) {
        return;
      }
      if (
        inactiveFrom !== null &&
        eventTimeMs(event.created_at) >= inactiveFrom
      ) {
        active.add(event.profile_id);
      }
      if (event.name === 'session_start') {
        sessions.set(
          event.profile_id,
          (sessions.get(event.profile_id) ?? 0) + 1
        );
      }
      if (event.name === query.performedEvent) {
        performed.add(event.profile_id);
      }
    });
  }
  const filters = (query.filters ?? []).map((filter) => ({
    ...filter,
    name: filter.name.replace(PROFILE_PREFIX, ''),
  }));
  const email = query.email?.toLowerCase();
  const visitorFields = (['country', 'city', 'device', 'browser'] as const)
    .filter((key) => query[key])
    .map((key) => [key, query[key] as string] as const);
  const direction = query.sortOrder === 'asc' ? 1 : -1;
  return source
    .profiles()
    .filter((profile) => {
      if (email && !(profile.email ?? '').toLowerCase().includes(email)) {
        return false;
      }
      if (query.name && !matchesSearch(profile, query.name)) {
        return false;
      }
      if (
        visitorFields.some(
          ([key, value]) => profile.properties?.[key] !== value
        )
      ) {
        return false;
      }
      if (
        filters.length > 0 &&
        !matchesFilters({ ...profile, profile_id: profile.id }, filters)
      ) {
        return false;
      }
      if (inactiveFrom !== null && active.has(profile.id)) {
        return false;
      }
      if (
        query.minSessions !== undefined &&
        (sessions.get(profile.id) ?? 0) < query.minSessions
      ) {
        return false;
      }
      return !query.performedEvent || performed.has(profile.id);
    })
    .sort((a, b) => direction * (createdMs(a) - createdMs(b)))
    .slice(0, query.limit);
}

async function pageConversions(
  source: ToolScanSource,
  query: Extract<ToolQuery, { kind: 'pageConversions' }>
) {
  const conversions = new Map<string, number[]>();
  await source.scan(query.from, query.to, (event) => {
    if (event.name === query.conversionEvent && event.profile_id) {
      const times = conversions.get(event.profile_id) ?? [];
      times.push(eventTimeMs(event.created_at));
      conversions.set(event.profile_id, times);
    }
  });
  for (const times of conversions.values()) {
    times.sort((a, b) => a - b);
  }
  const windowMs = query.windowHours * 60 * 60 * 1000;
  const pages = new Map<
    string,
    {
      path: string;
      origin: string;
      sessions: Set<string>;
      converters: Set<string>;
    }
  >();
  await source.scan(query.from, query.to, (event) => {
    if (event.name !== 'screen_view' || !event.path) {
      return;
    }
    const key = `${event.origin}\u0000${event.path}`;
    let page = pages.get(key);
    if (!page) {
      page = {
        path: event.path,
        origin: event.origin ?? '',
        sessions: new Set(),
        converters: new Set(),
      };
      pages.set(key, page);
    }
    page.sessions.add(event.session_id);
    const times = conversions.get(event.profile_id);
    if (!times) {
      return;
    }
    const at = eventTimeMs(event.created_at);
    const next = times.find((time) => time > at);
    if (next !== undefined && next <= at + windowMs) {
      page.converters.add(event.profile_id);
    }
  });
  return [...pages.values()]
    .filter((page) => page.converters.size > 0)
    .map((page) => ({
      path: page.path,
      origin: page.origin,
      unique_converters: page.converters.size,
      total_visitors: page.sessions.size,
      conversion_rate:
        Math.round((10_000 * page.converters.size) / page.sessions.size) / 100,
    }))
    .sort((a, b) => b.unique_converters - a.unique_converters)
    .slice(0, query.limit);
}

/** One tool read, answered in the ClickHouse row shape of the same query. */
export function answerToolQuery(
  query: ToolQuery,
  source: ToolScanSource
): Promise<unknown> {
  switch (query.kind) {
    case 'weeklyRetention':
      return weeklyRetention(
        source,
        Math.max(source.hotFrom, query.from ?? source.hotFrom),
        query.to ?? source.now
      );
    case 'rollingActive':
      return rollingActive(source, query.days);
    case 'lastSeen':
      return lastSeen(
        source,
        Math.max(source.hotFrom, query.from ?? source.hotFrom),
        query.to ?? source.now
      );
    case 'pageConversions':
      return pageConversions(source, query);
    case 'trafficAttribution':
      return Promise.resolve(trafficAttribution(source, query));
    default:
      return findProfiles(source, query.query);
  }
}
