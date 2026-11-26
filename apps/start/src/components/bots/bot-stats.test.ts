import { describe, expect, it } from 'vitest';
import {
  BOT_GROUP_SERIES,
  displayBotPath,
  isBotsPageEmpty,
  toBotChartData,
} from './bot-stats';

const EMPTY_TOTALS = { total: 0, ai: 0, search: 0, other: 0 };

describe('toBotChartData', () => {
  it('turns each UTC day into local midnight so labels keep their day', () => {
    const [point] = toBotChartData([
      { date: '2026-11-24', total: 5, ai: 3, search: 1, other: 1 },
    ]);
    expect(point).toEqual({
      date: '2026-11-24T00:00:00',
      total: 5,
      ai: 3,
      search: 1,
      other: 1,
    });
    expect(new Date(point?.date ?? '').getDate()).toBe(24);
  });
});

describe('BOT_GROUP_SERIES', () => {
  it('stacks every group the stats return, AI first', () => {
    expect(BOT_GROUP_SERIES.map((group) => group.key)).toEqual([
      'ai',
      'search',
      'other',
    ]);
  });
});

describe('displayBotPath', () => {
  it('drops the scheme and query of a full URL', () => {
    expect(displayBotPath('https://example.com/pricing?x=1')).toBe(
      'example.com/pricing'
    );
  });

  it('keeps a bare path as it is', () => {
    expect(displayBotPath('/docs')).toBe('/docs');
  });
});

describe('isBotsPageEmpty', () => {
  const stats = (total: number) => ({
    totals: { ...EMPTY_TOTALS, total },
    series: [],
    topBots: [],
    topPaths: [],
  });

  it('shows the setup guide only when nothing was ever reported', () => {
    expect(isBotsPageEmpty({ stats: stats(0), recentCount: 0 })).toBe(true);
    expect(isBotsPageEmpty({ stats: undefined, recentCount: undefined })).toBe(
      true
    );
  });

  it('keeps the page when the window is quiet but older hits exist', () => {
    expect(isBotsPageEmpty({ stats: stats(0), recentCount: 4 })).toBe(false);
    expect(isBotsPageEmpty({ stats: stats(2), recentCount: 0 })).toBe(false);
  });
});
