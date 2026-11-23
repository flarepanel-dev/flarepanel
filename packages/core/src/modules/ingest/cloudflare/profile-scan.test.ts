import { describe, expect, it } from 'bun:test';
import type { IClickhouseEvent } from '../../event/event.service';
import { ProfileSummaryAccumulator } from './profile-scan';

function event(
  name: string,
  createdAt: string,
  extra: Partial<IClickhouseEvent> = {}
): IClickhouseEvent {
  return {
    id: `${name}-${createdAt}`,
    name,
    created_at: createdAt,
    profile_id: 'user-1',
    device_id: 'device-1',
    session_id: 's1',
    path: '',
    properties: {},
    ...extra,
  } as IClickhouseEvent;
}

describe('profile summary', () => {
  it('counts one profile like the ClickHouse profile queries', () => {
    const accumulator = new ProfileSummaryAccumulator('user-1');
    for (const row of [
      event('session_start', '2026-11-22 10:00:00.000'),
      event('screen_view', '2026-11-22 10:00:01.000', { path: '/a' }),
      event('screen_view', '2026-11-23 09:00:00.000', { path: '/a' }),
      event('screen_view', '2026-11-23 09:01:00.000', { path: '/b' }),
      event('purchase', '2026-11-23 09:02:00.000'),
      event('revenue', '2026-11-23 09:03:00.000', { revenue: 2900 }),
      event('screen_view', '2026-11-23 09:04:00.000', {
        path: '/c',
        profile_id: 'someone-else',
      }),
    ]) {
      accumulator.add(row);
    }
    expect(accumulator.result()).toEqual({
      activity: [
        { date: '2026-11-23 00:00:00', count: 4 },
        { date: '2026-11-22 00:00:00', count: 2 },
      ],
      mostEvents: [
        { name: 'purchase', count: 1 },
        { name: 'revenue', count: 1 },
      ],
      popularRoutes: [
        { path: '/a', count: 2 },
        { path: '/b', count: 1 },
      ],
      stats: {
        screenViews: 3,
        totalEvents: 6,
        uniqueDaysActive: 2,
        conversionEvents: 2,
        revenue: 2900,
      },
    });
  });
});
