import type {
  BotCategoryGroup,
  IBotStats,
} from '@flarepanel/core/modules/event/event.constants';
import { getChartColor } from '@/utils/theme';

export const BOTS_DOCS_URL = 'https://docs.flarepanel.dev/tracking/ai-crawlers';

export interface BotGroupSeries {
  key: BotCategoryGroup;
  label: string;
  color: string;
}

/** Stack order in the chart, bottom first. */
export const BOT_GROUP_SERIES: readonly BotGroupSeries[] = [
  { key: 'ai', label: 'AI crawlers and agents', color: getChartColor(0) },
  { key: 'search', label: 'Search engines', color: getChartColor(1) },
  { key: 'other', label: 'Other bots', color: getChartColor(2) },
];

export function botGroupLabel(group: BotCategoryGroup): string {
  return BOT_GROUP_SERIES.find((series) => series.key === group)?.label ?? '';
}

export function botGroupColor(group: BotCategoryGroup): string {
  return (
    BOT_GROUP_SERIES.find((series) => series.key === group)?.color ??
    getChartColor(0)
  );
}

export type BotChartPoint = Record<BotCategoryGroup | 'total', number> & {
  date: string;
};

/**
 * Days arrive as UTC `YYYY-MM-DD`; a bare date parses as UTC midnight and
 * would render as the day before west of UTC, so each becomes local midnight.
 */
export function toBotChartData(series: IBotStats['series']): BotChartPoint[] {
  return series.map((day) => ({
    date: `${day.date}T00:00:00`,
    total: day.total,
    ai: day.ai,
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
