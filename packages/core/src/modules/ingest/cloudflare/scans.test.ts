import { describe, expect, it } from 'bun:test';
import type { IClickhouseEvent } from '../../event/event.service';
import {
  ChartAccumulator,
  type ChartScanQuery,
  DistributionAccumulator,
} from './chart-scan';
import { ConversionAccumulator } from './conversion-scan';
import { FunnelAccumulator, type FunnelScanQuery } from './funnel-scan';
import {
  RetentionAccumulator,
  type RetentionScanQuery,
} from './retention-scan';
import { SankeyAccumulator } from './sankey-scan';
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

  it('lists the profiles that reached or stopped at a step', () => {
    const profiles = (targetLevel: number, showDropoffs: boolean) =>
      feed(
        new FunnelAccumulator(
          query({
            profiles: {
              targetLevel,
              showDropoffs,
              breakdownValues: [],
              limit: 10,
            },
          })
        ),
        events
      )
        .result()
        .profileIds?.sort();
    expect(profiles(2, false)).toEqual(['user-a', 'user-c']);
    expect(profiles(1, true)).toEqual(['user-b']);
    expect(profiles(3, false)).toEqual(['user-a']);
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

describe('distribution, conversion and user flow from stored events', () => {
  const from = T0 - DAY;
  const to = T0 + 3 * DAY;

  it('buckets users by their event count and by a property range', () => {
    const events = [
      event('click', T0, 'a'),
      event('click', T0 + MINUTE, 'a'),
      event('click', T0, 'b'),
      ...Array.from({ length: 7 }, (_, index) =>
        event('click', T0 + index * MINUTE, 'c')
      ),
    ];
    const counts = feed(
      new DistributionAccumulator({
        from,
        to,
        event: { name: 'click', filters: [], segment: 'event' },
        breakdowns: [],
        buckets: [{ start: from, end: to + 1 }],
        timezone: 'UTC',
        perUser: { aggregation: 'count' },
      }),
      events
    ).rows();
    expect(counts.map((row) => [row.date, row.count])).toEqual([
      ['1', 1],
      ['2', 1],
      ['3', 0],
      ['4-5', 0],
      ['6-10', 1],
      ['11+', 0],
    ]);
    expect(counts[0]?.total_count).toBe(3);

    const prices = feed(
      new DistributionAccumulator({
        from,
        to,
        event: { name: 'purchase', filters: [], segment: 'event' },
        breakdowns: [],
        buckets: [{ start: from, end: to + 1 }],
        timezone: 'UTC',
        perUser: { aggregation: 'sum', property: 'properties.price' },
      }),
      [
        event('purchase', T0, 'a', { properties: { price: '10' } }),
        event('purchase', T0, 'b', { properties: { price: '110' } }),
      ]
    ).rows();
    expect(prices).toHaveLength(10);
    expect(prices[0]).toMatchObject({ date: '10 - 20', count: 1 });
    expect(prices[9]).toMatchObject({ date: '100 - 110', count: 1 });
  });

  it('counts conversions per day the chain started', () => {
    const rows = feed(
      new ConversionAccumulator({
        from,
        to,
        steps: [
          { name: 'screen_view', filters: [] },
          { name: 'signup', filters: [] },
        ],
        breakdowns: [],
        windowMs: 60 * MINUTE,
        group: 'session_id',
        buckets: buildBuckets(from, to, 'day', 'UTC'),
        timezone: 'UTC',
      }),
      [
        event('screen_view', T0, 'a'),
        event('signup', T0 + 5 * MINUTE, 'a'),
        event('screen_view', T0, 'b'),
        event('screen_view', T0 + DAY, 'c'),
        event('signup', T0 + DAY + 3 * 60 * MINUTE, 'c'),
      ]
    ).rows();
    expect(rows).toEqual([
      {
        event_day: '2026-11-16 00:00:00',
        total_first: 2,
        conversions: 1,
        conversion_rate_percentage: 50,
      },
      {
        event_day: '2026-11-17 00:00:00',
        total_first: 1,
        conversions: 0,
        conversion_rate_percentage: 0,
      },
    ]);
  });

  it('builds user-flow paths, top entries and transitions', () => {
    const flow = (names: string[], who: string) =>
      names.map((name, index) => event(name, T0 + index * MINUTE, who));
    const events = [
      ...flow(['home', 'home', 'pricing', 'signup'], 'a'),
      ...flow(['home', 'docs'], 'b'),
      ...flow(['blog'], 'c'),
    ];
    const base = { from, to, steps: 5, exclude: [] as string[] };
    const all = feed(
      new SankeyAccumulator({ ...base, mode: 'after' }),
      events
    ).result();
    expect(all.topEntries).toEqual([{ entry_event: 'home', count: 2 }]);
    expect(all.transitions).toEqual([
      { source: 'home', target: 'docs', step: 1, value: 1 },
      { source: 'home', target: 'pricing', step: 1, value: 1 },
      { source: 'pricing', target: 'signup', step: 2, value: 1 },
    ]);

    const between = feed(
      new SankeyAccumulator({
        ...base,
        mode: 'between',
        startEvent: { name: 'home', filters: [] },
        endEvent: { name: 'signup', filters: [] },
      }),
      events
    ).result();
    expect(between.topEntries).toEqual([{ entry_event: 'home', count: 1 }]);
    expect(between.transitions.map((item) => item.target)).toEqual([
      'pricing',
      'signup',
    ]);
  });
});
