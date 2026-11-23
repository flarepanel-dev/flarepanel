import { describe, expect, it } from 'bun:test';
import type { DimensionDayRow } from '../../ingest/cloudflare/engine';
import type { ComputeContext } from './types';
import { aggregatesFromRollups } from './utils';
import { resolveWindow } from './windows';

const NOW = new Date('2026-11-24T06:00:00Z'); // Tuesday: yesterday is Monday 23rd

function context(kind: 'yesterday' | 'rolling_7d', rows: DimensionDayRow[]) {
  const asked: string[][] = [];
  const ctx = {
    projectId: 'p1',
    window: resolveWindow(kind, NOW),
    now: NOW,
    logger: console,
    runQuery: () => Promise.resolve([]),
    rollups: {
      dimensionDays: (dim: string, fromDay: string, toDay: string) => {
        asked.push([dim, fromDay, toDay]);
        return Promise.resolve(
          rows.filter((row) => row.day >= fromDay && row.day <= toDay)
        );
      },
    },
  } as unknown as ComputeContext;
  return { ctx, asked };
}

const row = (day: string, name: string, sessions: number): DimensionDayRow => ({
  day,
  name,
  sessions,
  pageviews: sessions * 2,
  revenue: 0,
});

describe('insight aggregates from Durable Object rollups', () => {
  it('compares yesterday with the median of the same weekday', () => {
    const rows = [
      row('2026-11-23', 'Google', 30),
      row('2026-11-23', '', 5),
      // Earlier Mondays: medians 10 (Google) and 4 (direct).
      row('2026-11-16', 'Google', 12),
      row('2026-11-09', 'Google', 10),
      row('2026-11-02', 'Google', 8),
      row('2026-11-16', '', 4),
      // Not a Monday: ignored by the baseline.
      row('2026-11-17', 'Google', 999),
    ];
    const { ctx, asked } = context('yesterday', rows);
    return aggregatesFromRollups(
      ctx,
      'referrer_name',
      'sessions',
      (item) => item.name || 'direct'
    ).then((result) => {
      expect(asked[0]?.[0]).toBe('referrer_name');
      expect(result.currentMap.get('Google')).toBe(30);
      expect(result.currentMap.get('direct')).toBe(5);
      expect(result.baselineMap.get('Google')).toBe(10);
      expect(result.baselineMap.get('direct')).toBe(4);
      expect(result.totalCurrent).toBe(35);
      expect(result.totalBaseline).toBe(14);
    });
  });

  it('sums rolling windows and can count page views', async () => {
    const window = resolveWindow('rolling_7d', NOW);
    const day = (date: Date) => date.toISOString().slice(0, 10);
    const rows = [
      row(day(window.end), '/pricing', 10),
      row(day(window.start), '/pricing', 5),
      row(day(window.baselineEnd), '/pricing', 3),
    ];
    const { ctx } = context('rolling_7d', rows);
    const result = await aggregatesFromRollups(
      ctx,
      'path',
      'pageviews',
      (item) => item.name
    );
    expect(result.currentMap.get('/pricing')).toBe(30);
    expect(result.baselineMap.get('/pricing')).toBe(6);
  });
});

describe('insight modules on rollups', () => {
  it('finds a referrer that grew against its weekday baseline', async () => {
    const { referrersModule } = await import('./modules/referrers.module');
    const rows = [
      row('2026-11-23', 'Google', 300),
      row('2026-11-16', 'Google', 100),
      row('2026-11-09', 'Google', 110),
      row('2026-11-02', 'Google', 90),
    ];
    const { ctx } = context('yesterday', rows);
    const dims = await referrersModule.enumerateDimensions?.(ctx);
    expect(dims).toContain('referrer:Google');
    const [result] = await referrersModule.computeMany(ctx, [
      'referrer:Google',
    ]);
    expect(result).toMatchObject({
      ok: true,
      currentValue: 300,
      compareValue: 100,
      direction: 'up',
    });
    expect(referrersModule.render(result as never, ctx).title).toContain(
      'Google'
    );
  });
});
