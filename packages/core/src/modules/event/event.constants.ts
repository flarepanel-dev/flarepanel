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
 * What a bot hit was for: fetches a person triggered in an AI assistant (`answers`), crawls that feed
 * AI search (`indexing`), crawls that collect training data (`training`),
 * classic search engines, and everything else.
 */
export const BOT_GROUPS = [
  'answers',
  'indexing',
  'training',
  'search',
  'other',
] as const;
export type BotGroup = (typeof BOT_GROUPS)[number];

export const BOT_GROUP_LABELS: Record<BotGroup, string> = {
  answers: 'AI answers',
  indexing: 'AI search indexing',
  training: 'AI training',
  search: 'Search engines',
  other: 'Other',
};

/** The groups that are AI. */
export const AI_BOT_GROUPS: readonly BotGroup[] = [
  'answers',
  'indexing',
  'training',
];

/** The detector's categories (`bots.ts`) that say what a bot is for. */
const BOT_CATEGORY_GROUP: Record<string, BotGroup> = {
  'AI Assistant': 'answers',
  'AI Agent': 'answers',
  'AI Search Crawler': 'indexing',
  'AI Data Scraper': 'training',
  'Search bot': 'search',
};

/**
 * Bots whose upstream category says less than their operator documents.
 * Keyed by the detector's name, so hits stored before a fix regroup too.
 */
const BOT_NAME_GROUP: Record<string, BotGroup> = {
  // Meta: the agent crawls for training and indexing, the fetcher runs on a
  // user's request.
  'Meta-ExternalAgent': 'training',
  'Meta-ExternalFetcher': 'answers',
  // ByteDance's and Common Crawl's crawls are the usual training corpora.
  Bytespider: 'training',
  'ccBot crawler': 'training',
  // Amazon searches with Amzn-SearchBot; Amazonbot may train its models.
  Amazonbot: 'training',
  // Builds Vertex AI agents' search index on the site owner's request.
  'Google-CloudVertexBot': 'indexing',
  'Applebot-Extended': 'training',
};

export function botGroup(name: string, category: string): BotGroup {
  return BOT_NAME_GROUP[name] ?? BOT_CATEGORY_GROUP[category] ?? 'other';
}

export function isAiBotGroup(group: BotGroup): boolean {
  return AI_BOT_GROUPS.includes(group);
}

/** Rows `event.botStats` returns per table. */
export const BOT_STATS_TOP_LIMIT = 50;
/** Bots listed per crawled path. */
export const BOT_STATS_BOTS_PER_PATH = 5;

/**
 * Bot hits a hosted project keeps per calendar month (UTC). Later hits that
 * month are answered and not stored, which keeps the project's Durable
 * Object writes bounded.
 * Self-hosted projects keep every hit.
 */
export const BOT_HITS_PER_MONTH = 100_000;

export function botMonthlyCap(selfHosted: boolean): number | null {
  return selfHosted ? null : BOT_HITS_PER_MONTH;
}

/**
 * `auto` keeps to verified hits once the window has any (the page's
 * default); `all` and `verified` are explicit.
 */
export const BOT_VERIFIED_FILTERS = ['auto', 'all', 'verified'] as const;
export type BotVerifiedFilter = (typeof BOT_VERIFIED_FILTERS)[number];

export const CRAWL_STATUS_MIN = 100;
export const CRAWL_STATUS_MAX = 599;

export type IBotStatsTotals = Record<BotGroup | 'total' | 'ai', number>;

/** Responses served to bots by status class; hits without one count in none. */
export interface IBotStatusCounts {
  '2xx': number;
  '3xx': number;
  '4xx': number;
  '5xx': number;
}

/**
 * Where bot hits came from: `snippet` is a server or edge reporting each
 * request (`POST /track/crawl`), `cloudflare` the hourly import from a
 * connected Cloudflare zone's analytics (sampled estimates).
 */
export const BOT_SOURCES = ['snippet', 'cloudflare'] as const;
export type BotSource = (typeof BOT_SOURCES)[number];
/** Sources imported as hourly estimates rather than reported hit by hit. */
export type BotImportSource = Exclude<BotSource, 'snippet'>;

/** Hits per source in a window. */
export type IBotSourceTotals = Record<BotSource, number>;

export interface IBotStats {
  totals: IBotStatsTotals;
  /**
   * Hits per source. An hour with any snippet hit shows the snippet's
   * numbers only; imported estimates fill the other hours.
   */
  sources: IBotSourceTotals;
  /** One row per day of the project's time zone, `YYYY-MM-DD`, zero-filled. */
  series: (IBotStatsTotals & { date: string })[];
  topBots: {
    name: string;
    /** The detector's own category, e.g. `AI Data Scraper`. */
    category: string;
    group: BotGroup;
    hits: number;
    /** Hits the reporting edge (Cloudflare) verified as this bot. */
    verifiedHits: number;
    /** Milliseconds since the epoch. */
    lastSeen: number;
  }[];
  topPaths: {
    path: string;
    hits: number;
    lastSeen: number;
    status: IBotStatusCounts;
    bots: { name: string; category: string; group: BotGroup; hits: number }[];
  }[];
  /** Whether only verified hits were counted. */
  verifiedOnly: boolean;
  /** Verified hits in the window, whatever the filter. */
  verifiedHits: number;
  /** This calendar month (UTC) against the plan's allowance. */
  usage: IBotUsage;
}

export interface IBotUsage {
  /** `YYYY-MM`, UTC. */
  month: string;
  hits: number;
  /** Null where nothing is capped (self-hosted). */
  cap: number | null;
  capped: boolean;
}
