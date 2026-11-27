import {
  BOT_GROUP_LABELS,
  type BotGroup,
  type BotVerifiedFilter,
  type IBotStats,
  type IBotUsage,
} from '@flarepanel/core/modules/event/event.constants';
import { getChartColor } from '@/utils/theme';

export const BOTS_DOCS_URL = 'https://docs.flarepanel.dev/tracking/ai-crawlers';

export interface BotGroupSeries {
  key: BotGroup;
  label: string;
  color: string;
}

/** Stack order in the chart, bottom first. */
export const BOT_GROUP_SERIES: readonly BotGroupSeries[] = (
  ['answers', 'indexing', 'training', 'search', 'other'] as const
).map((key, index) => ({
  key,
  label: BOT_GROUP_LABELS[key],
  color: getChartColor(index),
}));

export function botGroupLabel(group: BotGroup): string {
  return BOT_GROUP_LABELS[group] ?? '';
}

export function botGroupColor(group: BotGroup): string {
  return (
    BOT_GROUP_SERIES.find((series) => series.key === group)?.color ??
    getChartColor(0)
  );
}

export type BotChartPoint = Record<BotGroup | 'total' | 'ai', number> & {
  date: string;
};

/**
 * Days arrive as the project's local `YYYY-MM-DD`; a bare date parses as UTC
 * midnight and would render as the day before west of UTC, so each becomes
 * local midnight.
 */
export function toBotChartData(series: IBotStats['series']): BotChartPoint[] {
  return series.map((day) => ({
    date: `${day.date}T00:00:00`,
    total: day.total,
    ai: day.ai,
    answers: day.answers,
    indexing: day.indexing,
    training: day.training,
    search: day.search,
    other: day.other,
  }));
}

/** Shows `example.com/pricing` for `https://example.com/pricing?x=1`. */
export function displayBotPath(path: string): string {
  try {
    const url = new URL(path);
    return `${url.hostname}${url.pathname}`;
  } catch {
    return path;
  }
}

/** True when nothing was ever reported: the page shows its setup guide. */
export function isBotsPageEmpty({
  stats,
  recentCount,
}: {
  stats: IBotStats | undefined;
  recentCount: number | undefined;
}): boolean {
  return (stats?.totals.total ?? 0) === 0 && (recentCount ?? 0) === 0;
}

/**
 * The page asks for `auto` until the user picks: verified hits only once
 * the window has any, every hit otherwise.
 */
export function botVerifiedFilter(
  verifiedOnly: boolean | null
): BotVerifiedFilter {
  if (verifiedOnly === null) {
    return 'auto';
  }
  return verifiedOnly ? 'verified' : 'all';
}

/** Warn from this share of the monthly allowance on. */
const USAGE_WARNING_SHARE = 0.8;

export interface BotUsageNotice {
  level: 'capped' | 'near';
  title: string;
  description: string;
}

function monthName(month: string): string {
  const date = new Date(`${month}-01T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? month
    : date.toLocaleString('en', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
}

/** What to say about the month's bot allowance, if anything. */
export function botUsageNotice(
  usage: IBotUsage | undefined
): BotUsageNotice | null {
  if (!usage?.cap) {
    return null;
  }
  const cap = usage.cap.toLocaleString('en');
  const month = monthName(usage.month);
  if (usage.capped) {
    return {
      level: 'capped',
      title: 'Monthly bot allowance reached',
      description: `This project recorded ${cap} bot hits in ${month}, its monthly allowance. New hits are not stored until next month, so the numbers below stop there.`,
    };
  }
  if (usage.hits >= usage.cap * USAGE_WARNING_SHARE) {
    return {
      level: 'near',
      title: 'Close to the monthly bot allowance',
      description: `${usage.hits.toLocaleString('en')} of ${cap} bot hits used in ${month}. Past the allowance, new hits are not stored until next month.`,
    };
  }
  return null;
}

/** Sessions of the `ai` referrer type in an `overview.topGeneric` answer. */
export function aiReferralSessions(
  rows: { name: string | null; sessions: number }[] | undefined
): number {
  return rows?.find((row) => row.name === 'ai')?.sessions ?? 0;
}

/** The overview filter that keeps visits referred by AI assistants. */
export const AI_REFERRER_FILTER = {
  id: 'referrer-type-ai',
  name: 'referrer_type',
  operator: 'is' as const,
  value: ['ai'],
};
