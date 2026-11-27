import { describe, expect, it } from 'vitest';
import {
  aiReferralSessions,
  BOT_GROUP_SERIES,
  botUsageNotice,
  botVerifiedFilter,
  displayBotPath,
  isBotsPageEmpty,
  toBotChartData,
} from './bot-stats';

const EMPTY_TOTALS = {
  total: 0,
  ai: 0,
  answers: 0,
  indexing: 0,
  training: 0,
  search: 0,
  other: 0,
};

describe('toBotChartData', () => {
  it('turns each local day into local midnight so labels keep their day', () => {
    const day = {
      ...EMPTY_TOTALS,
      date: '2026-11-24',
      total: 5,
      ai: 3,
      answers: 1,
      training: 2,
      search: 1,
      other: 1,
    };
    const [point] = toBotChartData([day]);
    expect(point).toEqual({ ...day, date: '2026-11-24T00:00:00' });
    expect(new Date(point?.date ?? '').getDate()).toBe(24);
  });
});

describe('BOT_GROUP_SERIES', () => {
  it('stacks every group the stats return, AI answers first', () => {
    expect(BOT_GROUP_SERIES.map((group) => group.key)).toEqual([
      'answers',
      'indexing',
      'training',
      'search',
      'other',
    ]);
    expect(BOT_GROUP_SERIES[0]?.label).toBe('AI answers');
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
    verifiedOnly: false,
    verifiedHits: 0,
    usage: { month: '2026-11', hits: total, cap: null, capped: false },
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

describe('botVerifiedFilter', () => {
  it('lets the server pick until the user does', () => {
    expect(botVerifiedFilter(null)).toBe('auto');
    expect(botVerifiedFilter(true)).toBe('verified');
    expect(botVerifiedFilter(false)).toBe('all');
  });
});

describe('botUsageNotice', () => {
  const usage = (hits: number, cap: number | null, capped = false) => ({
    month: '2026-11',
    hits,
    cap,
    capped,
  });

  it('says nothing without a cap or far from it', () => {
    expect(botUsageNotice(undefined)).toBe(null);
    expect(botUsageNotice(usage(5_000_000, null))).toBe(null);
    expect(botUsageNotice(usage(10, 100_000))).toBe(null);
  });

  it('warns near the cap and says when hits stop being stored', () => {
    expect(botUsageNotice(usage(85_000, 100_000))?.level).toBe('near');
    const capped = botUsageNotice(usage(100_000, 100_000, true));
    expect(capped?.level).toBe('capped');
    expect(capped?.description).toContain('100,000');
    expect(capped?.description).toContain('November 2026');
  });
});

describe('aiReferralSessions', () => {
  it('reads the AI referrer type out of the overview rollup', () => {
    expect(
      aiReferralSessions([
        { name: 'search', sessions: 40 },
        { name: 'ai', sessions: 7 },
      ])
    ).toBe(7);
    expect(aiReferralSessions([])).toBe(0);
    expect(aiReferralSessions(undefined)).toBe(0);
  });
});
