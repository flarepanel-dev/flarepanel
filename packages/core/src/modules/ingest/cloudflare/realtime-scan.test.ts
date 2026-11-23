import { describe, expect, it } from 'bun:test';
import type { IClickhouseEvent } from '../../event/event.service';
import { realtimeFromEvents } from './realtime-scan';

const NOW = Date.UTC(2026, 10, 23, 16, 0, 0);
const MINUTE = 60_000;

function event(
  name: string,
  minutesAgo: number,
  session: string,
  extra: Partial<IClickhouseEvent> = {}
): IClickhouseEvent {
  return {
    id: `${name}-${session}-${minutesAgo}`,
    name,
    created_at: new Date(NOW - minutesAgo * MINUTE)
      .toISOString()
      .replace('T', ' ')
      .replace('Z', ''),
    session_id: session,
    profile_id: `p-${session}`,
    device_id: `d-${session}`,
    country: 'TR',
    city: 'Istanbul',
    latitude: 41.01,
    longitude: 28.97,
    referrer_name: '',
    path: '/',
    origin: 'https://shop.example.com',
    properties: {},
    ...extra,
  } as IClickhouseEvent;
}

// Oldest first, as the Durable Object passes them.
const events = [
  event('session_start', 20, 'a', { referrer_name: 'Google' }),
  event('screen_view', 20, 'a', { referrer_name: 'Google' }),
  event('session_start', 5, 'b', {
    country: 'DE',
    city: 'Berlin',
    latitude: 52.52,
    longitude: 13.4,
  }),
  event('screen_view', 5, 'b', {
    country: 'DE',
    city: 'Berlin',
    latitude: 52.52,
    longitude: 13.4,
    path: '/explore',
  }),
  event('launch_click', 4, 'b', {
    country: 'DE',
    city: 'Berlin',
    latitude: 52.52,
    longitude: 13.4,
  }),
];

describe('realtime page from stored events', () => {
  it('counts sessions per minute and in total', () => {
    const result = realtimeFromEvents(events, { kind: 'histogram' }, NOW) as {
      totalSessions: number;
      minutes: { minute: number; sessions: number }[];
    };
    expect(result.totalSessions).toBe(2);
    expect(result.minutes.map((item) => item.sessions).sort()).toEqual([
      1, 1, 1,
    ]);
  });

  it('places sessions on the map and ranks sources', () => {
    const points = realtimeFromEvents(events, { kind: 'coordinates' }, NOW) as {
      city: string;
      count: number;
    }[];
    expect(points.map((point) => [point.city, point.count]).sort()).toEqual([
      ['Berlin', 1],
      ['Istanbul', 1],
    ]);
    const sources = realtimeFromEvents(
      events,
      { kind: 'topSources', limit: 8 },
      NOW
    ) as {
      referrers: unknown[];
      countries: { country: string; sessions: number }[];
    };
    expect(sources.referrers).toEqual([{ name: 'Google', sessions: 1 }]);
    expect(sources.countries.map((row) => row.country)).toEqual(['DE', 'TR']);
  });

  it('lists the newest events and session starts first', () => {
    const active = realtimeFromEvents(
      events,
      { kind: 'activeSessions', limit: 2 },
      NOW
    ) as IClickhouseEvent[];
    expect(active.map((item) => item.name)).toEqual([
      'launch_click',
      'screen_view',
    ]);
    const recent = realtimeFromEvents(
      events,
      { kind: 'recentSessions', limit: 30 },
      NOW
    ) as IClickhouseEvent[];
    expect(recent.map((item) => item.session_id)).toEqual(['b', 'a']);
  });

  it('details one map badge by city', () => {
    const badge = realtimeFromEvents(
      events,
      {
        kind: 'badge',
        scope: 'city',
        locations: [{ country: 'DE', city: 'Berlin' }],
        excludedEvents: ['screen_view', 'session_start', 'session_end'],
        top: 3,
        recent: 8,
      },
      NOW
    ) as {
      totalSessions: number;
      topPaths: { path: string }[];
      topEvents: { name: string }[];
      recentSessions: { name: string }[];
    };
    expect(badge.totalSessions).toBe(1);
    expect(badge.topEvents.map((item) => item.name)).toEqual(['launch_click']);
    expect(badge.topPaths.map((item) => item.path).sort()).toEqual([
      '/',
      '/explore',
    ]);
    expect(badge.recentSessions[0]?.name).toBe('launch_click');
  });
});
