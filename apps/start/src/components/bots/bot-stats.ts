import type { ICloudflareConnection } from '@flarepanel/core/modules/cloudflare-analytics/cloudflare-analytics.constants';
import {
  BOT_GROUP_LABELS,
  type BotGroup,
  type BotVerifiedFilter,
  type IBotStats,
  type IBotUsage,
} from '@flarepanel/core/modules/event/event.constants';
import { getChartColor } from '@/utils/theme';

export const BOTS_DOCS_URL = 'https://docs.flarepanel.dev/tracking/ai-crawlers';
export const CLOUDFLARE_DOCS_URL = `${BOTS_DOCS_URL}#connect-cloudflare-no-code`;

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

export type BotDataSource = 'snippet' | 'cloudflare' | 'both' | 'none';

/**
 * Where the numbers on the page come from: hits in the window per source,
 * and a connected zone even before its first import lands.
 */
export function botDataSource(
  stats: Pick<IBotStats, 'sources'> | undefined,
  cloudflareConnected: boolean
): BotDataSource {
  const snippet = (stats?.sources?.snippet ?? 0) > 0;
  const cloudflare =
    (stats?.sources?.cloudflare ?? 0) > 0 || cloudflareConnected;
  if (snippet && cloudflare) {
    return 'both';
  }
  if (cloudflare) {
    return 'cloudflare';
  }
  return snippet ? 'snippet' : 'none';
}

export const BOT_DATA_SOURCE_LABELS: Record<BotDataSource, string> = {
  snippet: 'Server snippet',
  cloudflare: 'Cloudflare',
  both: 'Server snippet + Cloudflare',
  none: 'Not set up',
};

/** One line on a connection's last sync, for the Cloudflare card. */
export function cloudflareSyncSummary(
  connection: Pick<
    ICloudflareConnection,
    'lastSyncStatus' | 'lastSyncHits' | 'lastSyncedAt'
  >
): { tone: 'ok' | 'pending' | 'error'; text: string } {
  switch (connection.lastSyncStatus) {
    case 'success': {
      const hits = connection.lastSyncHits ?? 0;
      return {
        tone: 'ok',
        text:
          hits > 0
            ? `Imported about ${hits.toLocaleString('en')} crawler hits`
            : 'No new crawler hits',
      };
    }
    case 'auth_error':
      return { tone: 'error', text: 'Cloudflare rejected the token' };
    case 'rate_limited':
      return {
        tone: 'error',
        text: 'Cloudflare rate limit reached; retrying shortly',
      };
    case 'error':
      return { tone: 'error', text: 'The last sync failed' };
    default:
      return { tone: 'pending', text: 'First sync queued' };
  }
}

export interface BotMixRow extends BotGroupSeries {
  hits: number;
  /** Share of every hit in the window, 0 to 1. */
  share: number;
}

/** Hits per purpose with each one's share, in the chart's stack order. */
export function botGroupMix(
  totals: IBotStats['totals'] | undefined
): BotMixRow[] {
  const total = totals?.total ?? 0;
  return BOT_GROUP_SERIES.map((group) => {
    const hits = totals?.[group.key] ?? 0;
    return { ...group, hits, share: total > 0 ? hits / total : 0 };
  });
}

/** Share of `part` in `whole` as a whole percentage; under 1% reads `<1%`. */
export function formatShare(part: number, whole: number): string {
  if (!(whole > 0) || part <= 0) {
    return '0%';
  }
  const percent = (part / whole) * 100;
  if (percent < 1) {
    return '<1%';
  }
  return `${Math.round(percent)}%`;
}

/**
 * 4xx and 5xx answers among the crawled pages listed, against the hits that
 * reported a status at all.
 */
export function botErrorSummary(paths: IBotStats['topPaths'] | undefined): {
  errors: number;
  reported: number;
} {
  let errors = 0;
  let reported = 0;
  for (const path of paths ?? []) {
    const {
      '2xx': ok,
      '3xx': moved,
      '4xx': client,
      '5xx': server,
    } = path.status;
    errors += client + server;
    reported += ok + moved + client + server;
  }
  return { errors, reported };
}
