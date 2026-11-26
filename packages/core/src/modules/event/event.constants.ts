/**
 * Top-level filterable columns on the `events` table. These apply to
 * every event regardless of name and can be passed straight to
 * `getEventFiltersWhereClause` as filter / breakdown `name` values.
 *
 * Kept as a whitelist because the filter builder splices `name` into
 * SQL verbatim — only these are safe to expose through the AI /
 * MCP discovery surface.
 */
export const EVENT_COLUMNS = [
  'path',
  'origin',
  'referrer',
  'referrer_name',
  'referrer_type',
  'duration',
  'country',
  'city',
  'region',
  'os',
  'os_version',
  'browser',
  'browser_version',
  'device',
  'brand',
  'model',
  'sdk_name',
  'sdk_version',
  'profile_id',
  'session_id',
  'device_id',
  'revenue',
] as const;

export type IEventColumn = (typeof EVENT_COLUMNS)[number];

/** Every column `getEventList` can project. */
export const EVENT_LIST_COLUMNS = [
  'created_at',
  'project_id',
  'id',
  'name',
  'device_id',
  'profile_id',
  'session_id',
  'properties',
  'country',
  'city',
  'region',
  'longitude',
  'latitude',
  'os',
  'os_version',
  'browser',
  'browser_version',
  'device',
  'brand',
  'model',
  'path',
  'origin',
  'referrer',
  'referrer_name',
  'referrer_type',
  'imported_at',
  'sdk_name',
  'sdk_version',
  'revenue',
  'groups',
] as const;

export type EventListColumn = (typeof EVENT_LIST_COLUMNS)[number];

/** The `= value` columns `queryEventsCore` accepts. */
export const QUERY_EVENTS_EQUALITY_COLUMNS = [
  'path',
  'referrer',
  'referrer_name',
  'referrer_type',
  'device',
  'country',
  'city',
  'os',
  'browser',
] as const;

export type QueryEventsEqualityColumn =
  (typeof QUERY_EVENTS_EQUALITY_COLUMNS)[number];

/** The `event.pages` columns a client may sort by; the query sorts server-side. */
export const TOP_PAGES_SORT_COLUMNS = [
  'sessions',
  'pageviews',
  'bounce_rate',
  'avg_duration',
] as const;
export type TopPagesSortColumn = (typeof TOP_PAGES_SORT_COLUMNS)[number];

/**
 * How the bots page groups the detector's categories (`bots.ts`): AI crawlers,
 * assistants and agents; search engines; everything else.
 */
export const BOT_CATEGORY_GROUPS = ['ai', 'search', 'other'] as const;
export type BotCategoryGroup = (typeof BOT_CATEGORY_GROUPS)[number];

export function botCategoryGroup(category: string): BotCategoryGroup {
  if (category.startsWith('AI ')) {
    return 'ai';
  }
  if (category === 'Search bot') {
    return 'search';
  }
  return 'other';
}

/** Rows `event.botStats` returns per table. */
export const BOT_STATS_TOP_LIMIT = 50;
/** Bots listed per crawled path. */
export const BOT_STATS_BOTS_PER_PATH = 5;

export interface IBotStatsTotals {
  total: number;
  ai: number;
  search: number;
  other: number;
}

export interface IBotStats {
  totals: IBotStatsTotals;
  /** One row per UTC day in the window, `YYYY-MM-DD`, zero-filled. */
  series: (IBotStatsTotals & { date: string })[];
  topBots: {
    name: string;
    category: string;
    group: BotCategoryGroup;
    hits: number;
    /** Milliseconds since the epoch. */
    lastSeen: number;
  }[];
  topPaths: {
    path: string;
    hits: number;
    lastSeen: number;
    bots: { name: string; category: string; hits: number }[];
  }[];
}
