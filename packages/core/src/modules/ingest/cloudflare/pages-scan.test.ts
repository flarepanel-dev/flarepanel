import { describe, expect, it } from 'bun:test';
import type { IClickhouseEvent } from '../../event/event.service';
import { EventCountAccumulator } from './event-count-scan';
import { PageSeriesAccumulator, PagesAccumulator } from './pages-scan';

const START = Date.UTC(2026, 10, 23, 10, 0, 0);
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const ORIGIN = 'https://shop.example.com';

function event(
  name: string,
  minute: number,
  session: string,
  extra: Partial<IClickhouseEvent> = {}
): [IClickhouseEvent, number] {
  const at = START + minute * MINUTE;
  return [
    {
      id: `${name}-${session}-${minute}`,
      name,
      created_at: new Date(at).toISOString().replace('T', ' ').replace('Z', ''),
      session_id: session,
      profile_id: `p-${session}`,
      device_id: `p-${session}`,
      path: '',
      origin: ORIGIN,
      properties: {},
      ...extra,
    } as IClickhouseEvent,
    at,
  ];
}

const view = (
  minute: number,
  session: string,
  path: string,
  title = ''
): [IClickhouseEvent, number] =>
  event('screen_view', minute, session, {
    path,
    properties: title ? { __title: title } : {},
  });

// Session a: / for 2 minutes, then /explore (last view, 0). Session b
// bounces on /. Session c views /explore and ends as a bounce.
const events: [IClickhouseEvent, number][] = [
  event('session_start', 0, 'a'),
  view(0, 'a', '/', 'Home'),
  view(2, 'a', '/explore', 'Explore'),
  event('session_start', 3, 'b'),
  view(3, 'b', '/', 'Example'),
  event('session_start', 4, 'c'),
  view(4, 'c', '/explore'),
  event('link_out', 5, 'c', {
    properties: { href: 'https://x.com/example' },
  }),
  event('session_end', 40, 'c', { properties: { __bounce: 'true' } }),
];

function pageRows(query: ConstructorParameters<typeof PagesAccumulator>[0]) {
  const accumulator = new PagesAccumulator(query);
  for (const [row, at] of events) {
    accumulator.add(row, at);
  }
  return accumulator.rows();
}

describe('pages scan', () => {
  it('counts views, sessions, time on page, bounce rate and titles', () => {
    expect(pageRows({ from: START, to: START + DAY })).toEqual([
      {
        origin: ORIGIN,
        path: '/',
        title: 'Example',
        sessions: 2,
        pageviews: 2,
        avg_duration: 1,
        bounce_rate: 50,
        total_count: 2,
      },
      {
        origin: ORIGIN,
        path: '/explore',
        title: 'Explore',
        sessions: 2,
        pageviews: 2,
        avg_duration: 0,
        bounce_rate: 50,
        total_count: 2,
      },
    ]);
  });

  it('searches, sorts, pages and limits to the given pages', () => {
    expect(
      pageRows({ from: START, to: START + DAY, search: 'explore' }).map(
        (row) => [row.path, row.total_count]
      )
    ).toEqual([['/explore', 1]]);
    expect(
      pageRows({
        from: START,
        to: START + DAY,
        sortBy: 'avg_duration',
        sortOrder: 'asc',
        limit: 1,
        offset: 1,
      }).map((row) => row.path)
    ).toEqual(['/']);
    const only = pageRows({
      from: START,
      to: START + DAY,
      pages: [{ origin: ORIGIN, path: '/' }],
    });
    expect(only.map((row) => [row.path, row.avg_duration])).toEqual([['/', 1]]);
  });

  it('buckets views per day, filling empty days', () => {
    const accumulator = new PageSeriesAccumulator({
      from: START - DAY,
      to: START + DAY / 2,
      interval: 'day',
      timezone: 'UTC',
      path: '/',
      origin: ORIGIN,
    });
    for (const [row, at] of events) {
      accumulator.add(row, at);
    }
    expect(accumulator.rows()).toEqual([
      {
        origin: ORIGIN,
        path: '/',
        date: '2026-11-22 00:00:00',
        pageviews: 0,
        sessions: 0,
      },
      {
        origin: ORIGIN,
        path: '/',
        date: '2026-11-23 00:00:00',
        pageviews: 2,
        sessions: 2,
      },
    ]);
  });
});

describe('event count scan', () => {
  it('groups by name without the excluded events', () => {
    const accumulator = new EventCountAccumulator({
      from: START,
      to: START + DAY,
      by: 'name',
      excludeNames: ['session_start', 'session_end', 'screen_view'],
    });
    for (const [row] of events) {
      accumulator.add(row);
    }
    expect(accumulator.rows()).toEqual([{ key: 'link_out', count: 1 }]);
  });

  it('groups link outs by href and applies filters', () => {
    const count = (
      filters: { name: string; operator: string; value: string[] }[]
    ) => {
      const accumulator = new EventCountAccumulator({
        from: START,
        to: START + DAY,
        by: 'properties.href',
        names: ['link_out'],
        filters,
      });
      for (const [row] of events) {
        accumulator.add(row);
      }
      return accumulator.rows();
    };
    expect(count([])).toEqual([{ key: 'https://x.com/example', count: 1 }]);
    expect(
      count([{ name: 'path', operator: 'is', value: ['/nowhere'] }])
    ).toEqual([]);
  });
});
