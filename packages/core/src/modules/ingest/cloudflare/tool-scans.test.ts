import { describe, expect, it } from 'bun:test';
import type { IClickhouseEvent } from '../../event/event.service';
import type { IClickhouseProfile } from '../../profile/profile.service';
import { wallClockEndMs, wallClockToMs } from './time-buckets';
import { answerToolQuery, type ToolScanSource } from './tool-scans';

// Monday 23 November 2026, noon UTC.
const NOW = Date.UTC(2026, 10, 23, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

function event(
  who: string,
  daysAgo: number,
  name = 'screen_view',
  device = who.startsWith('anon') ? who : `device-${who}`
): IClickhouseEvent {
  return {
    id: `${who}-${daysAgo}-${name}`,
    name,
    profile_id: who,
    device_id: device,
    created_at: new Date(NOW - daysAgo * DAY)
      .toISOString()
      .replace('T', ' ')
      .replace('Z', ''),
    properties: {},
  } as IClickhouseEvent;
}

function profile(
  id: string,
  createdDaysAgo: number,
  extra: Partial<IClickhouseProfile> = {}
): IClickhouseProfile {
  return {
    id,
    first_name: '',
    last_name: '',
    email: `${id}@example.com`,
    avatar: '',
    properties: {},
    project_id: 'p',
    is_external: true,
    created_at: new Date(NOW - createdDaysAgo * DAY)
      .toISOString()
      .replace('T', ' ')
      .replace('Z', ''),
    last_seen_at: '',
    groups: [],
    ...extra,
  };
}

function source(
  events: IClickhouseEvent[],
  profiles: IClickhouseProfile[] = []
): ToolScanSource {
  return {
    now: NOW,
    hotFrom: NOW - 90 * DAY,
    scan: (from, to, visit) => {
      for (const item of events) {
        const at = Date.parse(`${item.created_at.replace(' ', 'T')}Z`);
        if (at >= from && at <= to) {
          visit(item);
        }
      }
      return Promise.resolve(true);
    },
    profiles: () => profiles,
  };
}

describe('tool scans', () => {
  it('counts week-over-week retention of identified people', async () => {
    // Weeks start on Sunday: 15 Nov and 22 Nov.
    const rows = await answerToolQuery(
      { kind: 'weeklyRetention' },
      source([
        event('ana', 8),
        event('ben', 8),
        event('ana', 1),
        event('cem', 1),
        event('anon-1', 8),
      ])
    );
    expect(rows).toEqual([
      {
        date: '2026-11-15',
        active_users: 2,
        retained_users: 1,
        retention: 50,
      },
      {
        date: '2026-11-22',
        active_users: 2,
        retained_users: 0,
        retention: 0,
      },
    ]);
  });

  it('rolls active users over a window, anonymous ones included', async () => {
    const rows = (await answerToolQuery(
      { kind: 'rollingActive', days: 2 },
      source([event('ana', 3), event('anon-1', 2), event('ana', 0)])
    )) as { date: string; users: number }[];
    expect(rows).toEqual([
      { date: '2026-11-20', users: 1 },
      { date: '2026-11-21', users: 2 },
      { date: '2026-11-22', users: 1 },
      { date: '2026-11-23', users: 1 },
    ]);
  });

  it('spreads identified people by days since last seen', async () => {
    const rows = await answerToolQuery(
      { kind: 'lastSeen' },
      source([
        event('ana', 10),
        event('ana', 2),
        event('ben', 2),
        event('cem', 40),
        event('anon-1', 0),
      ])
    );
    expect(rows).toEqual([
      { days: 2, users: 2 },
      { days: 40, users: 1 },
    ]);
  });

  it('finds profiles by search, activity and filters', async () => {
    const profiles = [
      profile('ana', 30, {
        first_name: 'Ana',
        last_name: 'Lima',
        properties: { country: 'DE', plan: 'pro' },
      }),
      profile('ben', 20, { properties: { country: 'DE', plan: 'free' } }),
      profile('cem', 10, { properties: { country: 'TR' } }),
    ];
    const events = [
      event('ana', 1, 'session_start'),
      event('ana', 2, 'session_start'),
      event('ben', 15, 'session_start'),
      event('ben', 15, 'purchase'),
    ];
    const find = async (query: Record<string, unknown>) =>
      (
        (await answerToolQuery(
          {
            kind: 'findProfiles',
            query: { sortOrder: 'desc', limit: 10, ...query },
          },
          source(events, profiles)
        )) as IClickhouseProfile[]
      ).map((item) => item.id);

    expect(await find({})).toEqual(['cem', 'ben', 'ana']);
    expect(await find({ sortOrder: 'asc', limit: 1 })).toEqual(['ana']);
    expect(await find({ name: 'ana lima' })).toEqual(['ana']);
    expect(await find({ country: 'DE' })).toEqual(['ben', 'ana']);
    expect(await find({ inactiveDays: 7 })).toEqual(['cem', 'ben']);
    expect(await find({ minSessions: 2 })).toEqual(['ana']);
    expect(await find({ performedEvent: 'purchase' })).toEqual(['ben']);
    expect(
      await find({
        filters: [
          { name: 'properties.plan', operator: 'is', value: ['pro'] },
        ],
      })
    ).toEqual(['ana']);
  });

  it('attributes page views to the next conversion within the window', async () => {
    const view = (who: string, hoursAgo: number, path: string) =>
      ({
        ...event(who, hoursAgo / 24),
        path,
        origin: 'https://x.io',
        session_id: `s-${who}`,
      }) as IClickhouseEvent;
    const buy = (who: string, hoursAgo: number) =>
      event(who, hoursAgo / 24, 'purchase');
    const rows = await answerToolQuery(
      {
        kind: 'pageConversions',
        from: NOW - 10 * DAY,
        to: NOW,
        conversionEvent: 'purchase',
        windowHours: 24,
        limit: 10,
      },
      source([
        view('ana', 30, '/pricing'),
        buy('ana', 20),
        view('ben', 50, '/pricing'),
        buy('ben', 2),
        view('cem', 5, '/docs'),
      ])
    );
    expect(rows).toEqual([
      {
        path: '/pricing',
        origin: 'https://x.io',
        unique_converters: 1,
        total_visitors: 2,
        conversion_rate: 50,
      },
    ]);
  });

  it('reads a bare end date as the whole day', () => {
    expect(wallClockEndMs('2026-11-23', 'UTC')).toBe(
      Date.UTC(2026, 10, 23, 23, 59, 59)
    );
    expect(wallClockEndMs('2026-11-23 10:00:00', 'UTC')).toBe(
      wallClockToMs('2026-11-23 10:00:00', 'UTC')
    );
  });
});
