/**
 * The GraphQL query a sync runs per time window and user agent chunk:
 *
 *   httpRequestsAdaptiveGroups(
 *     filter: { AND: [
 *       { datetime_geq, datetime_lt, requestSource: "eyeball" },
 *       { clientRequestHTTPHost_in: [...hostnames] },          // when filtered
 *       { OR: [{ userAgent_like: "%GPTBot%" }, ...] },
 *     ] }
 *     limit, orderBy: [count_DESC]
 *   ) { count dimensions { datetimeHour userAgent clientRequestHTTPHost
 *                          clientRequestPath edgeResponseStatus } }
 *
 * Cloudflare's schema differs by plan and changes over time, so the query
 * degrades instead of failing: when an error names `edgeResponseStatus` as a
 * dimension it runs once per status class with `edgeResponseStatus_geq/_lt`
 * filters, and without status at all if those fail too; `requestSource` and
 * `clientRequestHTTPHost` are dropped the same way. The mode found is kept
 * for the rest of the sync.
 */
import { type ApiOptions, CloudflareApiError, cloudflareGraphql } from './api';

export const STATUS_CLASSES = ['2xx', '3xx', '4xx', '5xx'] as const;
export type StatusClass = (typeof STATUS_CLASSES)[number];

/** The most rows Cloudflare returns per query on any plan. */
export const MAX_ROWS_PER_QUERY = 10_000;

/** One group Cloudflare returned: a request count and its dimensions. */
export interface CrawlerGroup {
  count: number;
  hour: string;
  userAgent: string;
  host: string | null;
  path: string;
  /** The exact status, when it was a dimension. */
  status: number | null;
  /** The status class, when the query filtered on one. */
  statusClass: StatusClass | null;
}

/** How the query asks for status codes and which optional fields it uses. */
export interface QueryMode {
  status: 'dimension' | 'class' | 'none';
  requestSource: boolean;
  hostDimension: boolean;
}

export const FULL_MODE: QueryMode = {
  status: 'dimension',
  requestSource: true,
  hostDimension: true,
};

export interface CrawlerWindow {
  zoneId: string;
  /** Inclusive, ISO. */
  since: string;
  /** Exclusive, ISO. */
  until: string;
  hostnames: readonly string[];
  /** `userAgent_like` patterns, `%…%`. */
  patterns: readonly string[];
  limit: number;
}

const STATUS_RANGES: Record<StatusClass, [number, number]> = {
  '2xx': [200, 300],
  '3xx': [300, 400],
  '4xx': [400, 500],
  '5xx': [500, 600],
};

const GRAPHQL_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** A value written as a GraphQL input literal (object keys are field names). */
export function graphqlLiteral(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(graphqlLiteral).join(', ')}]`;
  }
  if (value !== null && typeof value === 'object') {
    const fields = Object.entries(value as Record<string, unknown>)
      .filter(([, field]) => field !== undefined)
      .map(([key, field]) => {
        if (!GRAPHQL_NAME.test(key)) {
          throw new Error(`Not a GraphQL field name: ${key}`);
        }
        return `${key}: ${graphqlLiteral(field)}`;
      });
    return `{${fields.join(', ')}}`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  // JSON string escapes are valid GraphQL string escapes.
  return JSON.stringify(String(value));
}

/** The `filter` argument for one window, chunk and (optional) status class. */
export function crawlerFilter(
  window: CrawlerWindow,
  mode: QueryMode,
  statusClass: StatusClass | null
): Record<string, unknown> {
  const and: Record<string, unknown>[] = [
    {
      datetime_geq: window.since,
      datetime_lt: window.until,
      ...(mode.requestSource ? { requestSource: 'eyeball' } : {}),
    },
  ];
  if (window.hostnames.length > 0) {
    and.push({ clientRequestHTTPHost_in: [...window.hostnames] });
  }
  and.push({
    OR: window.patterns.map((pattern) => ({ userAgent_like: pattern })),
  });
  if (statusClass) {
    const [from, to] = STATUS_RANGES[statusClass];
    and.push({ edgeResponseStatus_geq: from, edgeResponseStatus_lt: to });
  }
  return { AND: and };
}

export function crawlerDimensions(mode: QueryMode): string[] {
  return [
    'datetimeHour',
    'userAgent',
    ...(mode.hostDimension ? ['clientRequestHTTPHost'] : []),
    'clientRequestPath',
    ...(mode.status === 'dimension' ? ['edgeResponseStatus'] : []),
  ];
}

export function crawlerQuery(
  window: CrawlerWindow,
  mode: QueryMode,
  statusClass: StatusClass | null
): string {
  return `query FlarePanelCrawlers {
  viewer {
    zones(filter: {zoneTag: ${graphqlLiteral(window.zoneId)}}) {
      httpRequestsAdaptiveGroups(filter: ${graphqlLiteral(crawlerFilter(window, mode, statusClass))}, limit: ${window.limit}, orderBy: [count_DESC]) {
        count
        dimensions {
          ${crawlerDimensions(mode).join('\n          ')}
        }
      }
    }
  }
}`;
}

interface GroupsData {
  viewer?: {
    zones?: {
      httpRequestsAdaptiveGroups?: {
        count?: number;
        dimensions?: {
          datetimeHour?: string;
          userAgent?: string;
          clientRequestHTTPHost?: string;
          clientRequestPath?: string;
          edgeResponseStatus?: number;
        };
      }[];
    }[];
  };
}

function toGroups(
  data: GroupsData,
  statusClass: StatusClass | null
): CrawlerGroup[] {
  const zone = data.viewer?.zones?.[0];
  if (!zone) {
    throw new CloudflareApiError(
      'auth',
      'Cloudflare returned no data for this zone: the token cannot read it.'
    );
  }
  const groups: CrawlerGroup[] = [];
  for (const row of zone.httpRequestsAdaptiveGroups ?? []) {
    const dimensions = row.dimensions ?? {};
    const count = Number(row.count ?? 0);
    if (!(count > 0 && dimensions.datetimeHour && dimensions.userAgent)) {
      continue;
    }
    groups.push({
      count,
      hour: dimensions.datetimeHour,
      userAgent: dimensions.userAgent,
      host: dimensions.clientRequestHTTPHost || null,
      path: dimensions.clientRequestPath || '/',
      status:
        typeof dimensions.edgeResponseStatus === 'number'
          ? dimensions.edgeResponseStatus
          : null,
      statusClass,
    });
  }
  return groups;
}

/** The fields an error may name that a narrower mode can do without. */
function optionalFields(mode: QueryMode): string[] {
  return [
    ...(mode.status === 'none' ? [] : ['edgeResponseStatus']),
    ...(mode.requestSource ? ['requestSource'] : []),
    ...(mode.hostDimension ? ['clientRequestHTTPHost'] : []),
  ];
}

/** The mode without the field Cloudflare did not know, or null. */
export function narrowMode(mode: QueryMode, field: string): QueryMode | null {
  if (field === 'edgeResponseStatus' && mode.status !== 'none') {
    return { ...mode, status: mode.status === 'dimension' ? 'class' : 'none' };
  }
  if (field === 'requestSource' && mode.requestSource) {
    return { ...mode, requestSource: false };
  }
  if (field === 'clientRequestHTTPHost' && mode.hostDimension) {
    // Only the dimension is dropped; the hostname filter stays.
    return { ...mode, hostDimension: false };
  }
  return null;
}

export interface CrawlerQueryResult {
  groups: CrawlerGroup[];
  /** The mode that worked: start the next window with it. */
  mode: QueryMode;
  /** GraphQL queries sent. */
  queries: number;
  /** A query returned as many rows as it may: smaller windows needed. */
  truncated: boolean;
}

/**
 * Runs the query for one window and chunk, narrowing the mode on errors
 * that name an optional field.
 */
export async function queryCrawlerWindow(
  token: string,
  window: CrawlerWindow,
  startMode: QueryMode,
  options: ApiOptions = {}
): Promise<CrawlerQueryResult> {
  let mode = startMode;
  let queries = 0;
  for (;;) {
    const classes: (StatusClass | null)[] =
      mode.status === 'class' ? [...STATUS_CLASSES] : [null];
    const groups: CrawlerGroup[] = [];
    let truncated = false;
    try {
      for (const statusClass of classes) {
        queries += 1;
        const data = await cloudflareGraphql<GroupsData>(
          token,
          crawlerQuery(window, mode, statusClass),
          { ...options, optionalFields: optionalFields(mode) }
        );
        const rows = toGroups(data, statusClass);
        truncated ||= rows.length >= window.limit;
        groups.push(...rows);
      }
      return { groups, mode, queries, truncated };
    } catch (error) {
      const narrower =
        error instanceof CloudflareApiError &&
        error.kind === 'unknown_field' &&
        error.field
          ? narrowMode(mode, error.field)
          : null;
      if (!narrower) {
        throw error;
      }
      mode = narrower;
    }
  }
}
