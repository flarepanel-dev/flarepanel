// The dashboard's Realtime page from a project's stored events: the same six
// reads the ClickHouse realtime service makes over the last 30 minutes (map
// points, map badge details, active and recent sessions, top sources and the
// per-minute histogram), computed in the project's Durable Object so only the
// small answer leaves it.

import type { IClickhouseEvent } from '../../event/event.service';
import { eventTimeMs, MINUTE_MS } from './time-buckets';

export interface RealtimeLocationFilter {
  country?: string;
  city?: string;
  lat?: number;
  long?: number;
}

export type RealtimeQuery =
  | { kind: 'coordinates' }
  | { kind: 'activeSessions'; limit: number }
  | { kind: 'recentSessions'; limit: number }
  | { kind: 'topSources'; limit: number }
  | { kind: 'topPaths'; limit: number }
  | { kind: 'histogram' }
  | {
      kind: 'badge';
      scope: 'country' | 'city' | 'coordinate' | 'merged';
      locations: RealtimeLocationFilter[];
      excludedEvents: string[];
      top: number;
      recent: number;
    };

const COORDINATE_DECIMALS = 4;

function distinctCount<T>(
  rows: Iterable<T>,
  key: (row: T) => string,
  value: (row: T) => string
): Map<string, Set<string>> {
  const groups = new Map<string, Set<string>>();
  for (const row of rows) {
    const id = value(row);
    if (!id) {
      continue;
    }
    const group = key(row);
    const set = groups.get(group) ?? new Set<string>();
    set.add(id);
    groups.set(group, set);
  }
  return groups;
}

function ranked(groups: Map<string, Set<string>>, limit: number) {
  return [...groups.entries()]
    .map(([key, set]) => ({ key, count: set.size }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit);
}

function round(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toFixed(COORDINATE_DECIMALS) : '';
}

/** Which events a badge describes: by country, by city, or by exact point. */
function locationMatcher(
  scope: 'country' | 'city' | 'coordinate' | 'merged',
  locations: RealtimeLocationFilter[]
) {
  const countries = new Set(locations.map((item) => item.country ?? ''));
  const cities = new Set(
    locations.map((item) =>
      JSON.stringify([item.country ?? '', item.city ?? ''])
    )
  );
  const points = new Set(
    locations
      .filter(
        (item) => typeof item.lat === 'number' && typeof item.long === 'number'
      )
      .map((item) =>
        JSON.stringify([
          item.country ?? '',
          item.city ?? '',
          round(item.long),
          round(item.lat),
        ])
      )
  );
  const byCountry = (event: IClickhouseEvent) =>
    countries.has(event.country ?? '');
  const byCity = (event: IClickhouseEvent) =>
    cities.has(JSON.stringify([event.country ?? '', event.city ?? '']));
  if (scope === 'country') {
    return byCountry;
  }
  if (scope === 'coordinate' && points.size > 0) {
    return (event: IClickhouseEvent) =>
      points.has(
        JSON.stringify([
          event.country ?? '',
          event.city ?? '',
          round(event.longitude),
          round(event.latitude),
        ])
      );
  }
  return cities.size > 0 ? byCity : byCountry;
}

/** `events` are the window's events, oldest first. */
export function realtimeFromEvents(
  events: IClickhouseEvent[],
  query: RealtimeQuery,
  now: number
): unknown {
  switch (query.kind) {
    case 'coordinates': {
      const groups = new Map<
        string,
        {
          country: string;
          city: string;
          long: number;
          lat: number;
          sessions: Set<string>;
        }
      >();
      for (const event of events) {
        if (
          typeof event.longitude !== 'number' ||
          typeof event.latitude !== 'number'
        ) {
          continue;
        }
        const key = JSON.stringify([
          event.country,
          event.city,
          event.longitude,
          event.latitude,
        ]);
        const group = groups.get(key) ?? {
          country: event.country ?? '',
          city: event.city ?? '',
          long: event.longitude,
          lat: event.latitude,
          sessions: new Set<string>(),
        };
        if (event.session_id) {
          group.sessions.add(event.session_id);
        }
        groups.set(key, group);
      }
      return [...groups.values()]
        .map(({ sessions, ...point }) => ({ ...point, count: sessions.size }))
        .filter((point) => point.count > 0)
        .sort((a, b) => b.count - a.count);
    }
    case 'activeSessions':
      return events.slice(-query.limit).reverse();
    case 'recentSessions':
      return events
        .filter((event) => event.name === 'session_start')
        .slice(-query.limit)
        .reverse();
    case 'topSources': {
      const referrers = ranked(
        distinctCount(
          events.filter((event) => event.referrer_name),
          (event) => event.referrer_name,
          (event) => event.session_id
        ),
        query.limit
      );
      const countries = ranked(
        distinctCount(
          events.filter((event) => event.country),
          (event) => event.country,
          (event) => event.session_id
        ),
        query.limit
      );
      return {
        referrers: referrers.map((row) => ({
          name: row.key,
          sessions: row.count,
        })),
        countries: countries.map((row) => ({
          country: row.key,
          sessions: row.count,
        })),
      };
    }
    case 'topPaths':
      return ranked(
        distinctCount(
          events.filter((event) => event.path),
          (event) => event.path,
          (event) => event.session_id
        ),
        query.limit
      ).map((row) => ({ path: row.key, count: row.count }));
    case 'histogram': {
      const sessions = new Set<string>();
      const minutes = new Map<
        number,
        { sessions: Set<string>; visitors: Set<string> }
      >();
      for (const event of events) {
        const minute =
          Math.floor(eventTimeMs(event.created_at) / MINUTE_MS) * MINUTE_MS;
        const bucket = minutes.get(minute) ?? {
          sessions: new Set<string>(),
          visitors: new Set<string>(),
        };
        if (event.session_id) {
          bucket.sessions.add(event.session_id);
          sessions.add(event.session_id);
        }
        if (event.profile_id) {
          bucket.visitors.add(event.profile_id);
        }
        minutes.set(minute, bucket);
      }
      return {
        totalSessions: sessions.size,
        minutes: [...minutes.entries()].map(([minute, bucket]) => ({
          minute,
          sessions: bucket.sessions.size,
          visitors: bucket.visitors.size,
        })),
        now,
      };
    }
    default: {
      const matches = locationMatcher(query.scope, query.locations);
      const scoped = events.filter(matches);
      const sessions = new Set(
        scoped.map((event) => event.session_id).filter(Boolean)
      );
      const profiles = new Set(
        scoped.map((event) => event.profile_id).filter(Boolean)
      );
      const excluded = new Set(query.excludedEvents);
      const latestBySession = new Map<string, IClickhouseEvent>();
      for (const event of scoped) {
        latestBySession.set(event.session_id, event);
      }
      return {
        totalSessions: sessions.size,
        totalProfiles: profiles.size,
        topReferrers: ranked(
          distinctCount(
            scoped.filter((event) => event.referrer_name),
            (event) => event.referrer_name,
            (event) => event.session_id
          ),
          query.top
        ).map((row) => ({ referrer_name: row.key, count: row.count })),
        topPaths: ranked(
          distinctCount(
            scoped.filter((event) => event.path),
            (event) => JSON.stringify([event.origin ?? '', event.path]),
            (event) => event.session_id
          ),
          query.top
        ).map((row) => {
          const [origin, path] = JSON.parse(row.key) as [string, string];
          return { origin, path, count: row.count };
        }),
        topEvents: ranked(
          distinctCount(
            scoped.filter((event) => !excluded.has(event.name)),
            (event) => event.name,
            (event) => event.session_id
          ),
          query.top
        ).map((row) => ({ name: row.key, count: row.count })),
        recentSessions: [...latestBySession.values()]
          .sort((a, b) => eventTimeMs(b.created_at) - eventTimeMs(a.created_at))
          .slice(0, query.recent)
          .map((event) => ({
            session_id: event.session_id,
            profile_id: event.profile_id,
            created_at: event.created_at,
            path: event.path,
            name: event.name,
            country: event.country,
            city: event.city,
          })),
      };
    }
  }
}
