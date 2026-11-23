import { describe, expect, it } from 'bun:test';
import type { IClickhouseEvent } from '../../event/event.service';
import { ChartAccumulator, type ChartScanQuery } from './chart-scan';
import { FunnelAccumulator, type FunnelScanQuery } from './funnel-scan';
import {
  RetentionAccumulator,
  type RetentionScanQuery,
} from './retention-scan';
import { buildBuckets, eventTimeMs } from './time-buckets';

const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const T0 = Date.UTC(2026, 10, 16, 10, 0, 0); // Monday 10:00 UTC

function clickhouseDate(ms: number): string {
  return new Date(ms).toISOString().replace('T', ' ').replace('Z', '');
}

function event(
  name: string,
  at: number,
  who: string,
  extra: Partial<IClickhouseEvent> = {}
): IClickhouseEvent {
  return {
    id: `${name}-${at}-${who}`,
    name,
    created_at: clickhouseDate(at),
    profile_id: `user-${who}`,
    device_id: `device-${who}`,
    session_id: `session-${who}`,
    properties: {},
    path: '/',
    origin: 'https://example.com',
    country: 'SE',
    groups: [],
    ...extra,
  } as IClickhouseEvent;
}

function feed<T extends { add(event: IClickhouseEvent, at: number): void }>(
  accumulator: T,
  events: IClickhouseEvent[]
): T {
  for (const item of events) {
    accumulator.add(item, eventTimeMs(item.created_at));
  }
  return accumulator;
}

describe('chart rows from stored events', () => {
  const events = [
    event('screen_view', T0, 'a', { country: 'SE' }),
    event('screen_view', T0 + MINUTE, 'a', { country: 'SE' }),
    event('screen_view', T0 + DAY, 'b', { country: 'DE' }),
    event('purchase', T0 + DAY, 'b', {
      country: 'DE',
      properties: { price: '30' },
    }),
    event('purchase', T0 + 2 * DAY, 'a', {
      country: 'SE',
      properties: { price: '10' },
    }),
  ];
  const range = (interval: 'day' | 'week') => {
    const from = T0 - 10 * 60 * MINUTE;
    const to = from + 3 * DAY - 1;
    return {
      from,
      to,
      buckets: buildBuckets(from, to, interval, 'UTC', 'monday'),
    };
  };

  function rows(
    query: Partial<ChartScanQuery> & Pick<ChartScanQuery, 'event'>
  ) {
    return feed(
      new ChartAccumulator({
        ...range('day'),
        breakdowns: [],
        timezone: 'UTC',
        ...query,
      }),
      events
    ).rows();
  }

  it('counts events, users and property sums per day with fill rows', () => {
    const views = rows({
      event: { name: 'screen_view', filters: [], segment: 'event' },
    });
    const data = views.filter((row) => row.label_0);
    expect(data.map((row) => [row.date, row.count])).toEqual([
      ['2026-11-16 00:00:00', 2],
      ['2026-11-17 00:00:00', 1],
    ]);
    expect(views.filter((row) => !row.label_0)).toHaveLength(3);

    const users = rows({
      event: { name: '*', filters: [], segment: 'user' },
    }).filter((row) => row.label_0);
    expect(users.map((row) => row.count)).toEqual([1, 1, 1]);
    expect(users[0]?.total_count).toBe(2);

    const revenue = rows({
      event: {
        name: 'purchase',
        filters: [],
        segment: 'property_sum',
        property: 'properties.price',
      },
    }).filter((row) => row.label_0);
    expect(revenue.map((row) => row.count)).toEqual([30, 10]);
  });

  it('breaks down and filters like the ClickHouse query', () => {
    const byCountry = rows({
      event: { name: '*', filters: [], segment: 'event' },
      breakdowns: ['country'],
    }).filter((row) => row.label_0);
    expect(
      byCountry.map((row) => [row.date.slice(0, 10), row.label_1, row.count])
    ).toEqual([
      ['2026-11-16', 'SE', 2],
      ['2026-11-17', 'DE', 2],
      ['2026-11-18', 'SE', 1],
    ]);

    const swedish = rows({
      event: {
        name: 'purchase',
        filters: [{ name: 'country', operator: 'is', value: ['SE'] }],
        segment: 'event',
      },
    }).filter((row) => row.label_0);
    expect(swedish.map((row) => row.count)).toEqual([1]);
  });

  it('keeps one event per user, the latest', () => {
    const latest = rows({
      event: { name: '*', filters: [], segment: 'one_event_per_user' },
    }).filter((row) => row.label_0);
    expect(latest.map((row) => [row.date.slice(0, 10), row.count])).toEqual([
      ['2026-11-17', 1],
      ['2026-11-18', 1],
    ]);
  });
});

describe('funnels from stored events', () => {
  const steps = [
    { name: 'screen_view', filters: [] },
    { name: 'signup', filters: [] },
    { name: 'purchase', filters: [] },
  ];
  const query = (extra: Partial<FunnelScanQuery> = {}): FunnelScanQuery => ({
    from: T0 - DAY,
    to: T0 + 5 * DAY,
    steps,
    breakdowns: [],
    windowMs: 60 * MINUTE,
    group: 'profile_id',
    ...extra,
  });
  const events = [
    // a: all three steps inside the window
    event('screen_view', T0, 'a', { country: 'SE' }),
    event('signup', T0 + 5 * MINUTE, 'a'),
    event('purchase', T0 + 20 * MINUTE, 'a'),
    // b: signs up after the window closes
    event('screen_view', T0, 'b', { country: 'DE' }),
    event('signup', T0 + 2 * 60 * MINUTE, 'b'),
    // c: two steps, out of order first
    event('signup', T0, 'c', { country: 'SE' }),
    event('screen_view', T0 + MINUTE, 'c', { country: 'SE' }),
    event('signup', T0 + 2 * MINUTE, 'c'),
  ];

  it('counts each group at the deepest step reached inside the window', () => {
    const { rows } = feed(new FunnelAccumulator(query()), events).result();
    expect(rows.map((row) => [row.level, row.count])).toEqual([
      [3, 1],
      [2, 1],
      [1, 1],
    ]);
  });

  it('reads breakdowns from the chain and reports time to convert', () => {
    const { rows, timeToConvert } = feed(
      new FunnelAccumulator(
        query({
          breakdowns: [{ name: 'country' }],
          timeToConvert: 'avg',
        })
      ),
      events
    ).result();
    expect(rows.map((row) => [row.level, row.b_0, row.count])).toEqual([
      [3, 'SE', 1],
      [2, 'SE', 1],
      [1, 'DE', 1],
    ]);
    const stepTwo = timeToConvert.filter((row) => row.step === 2);
    expect(stepTwo.map((row) => row.from_previous_step)).toEqual([180]);
  });
});

describe('retention from stored events', () => {
  const base: RetentionScanQuery = {
    start: T0 - 10 * 60 * MINUTE,
    end: T0 + 2 * DAY,
    firstEvent: ['signup'],
    secondEvent: ['*'],
    criteria: 'on',
    interval: 'day',
    diffInterval: 3,
    filters: [],
  };
  const events = [
    event('signup', T0, 'a'),
    event('screen_view', T0 + DAY, 'a'),
    event('screen_view', T0 + 3 * DAY, 'a'),
    event('signup', T0 + DAY, 'b'),
    event('screen_view', T0 + DAY + MINUTE, 'b'),
    // anonymous visitors never count
    event('signup', T0, 'x', { profile_id: 'device-x' }),
  ];

  it('builds cohorts of identified users by their first event', () => {
    const rows = feed(new RetentionAccumulator(base), events).rows();
    expect(rows).toEqual([
      {
        cohort_interval: '2026-11-16',
        total_first_event_count: 1,
        interval_0_user_count: 1,
        interval_1_user_count: 1,
        interval_2_user_count: 0,
        interval_3_user_count: 1,
      },
      {
        cohort_interval: '2026-11-17',
        total_first_event_count: 1,
        interval_0_user_count: 1,
        interval_1_user_count: 0,
        interval_2_user_count: 0,
        interval_3_user_count: 0,
      },
    ]);
  });

  it('counts a return in every earlier column with on_or_after', () => {
    const rows = feed(
      new RetentionAccumulator({ ...base, criteria: 'on_or_after' }),
      events
    ).rows();
    expect(rows[0]).toMatchObject({
      interval_0_user_count: 1,
      interval_1_user_count: 1,
      interval_2_user_count: 1,
      interval_3_user_count: 1,
    });
  });
});
