/**
 * One sync of a connected zone: reads the request analytics since the last
 * sync, keeps the rows a known crawler made, and stores them in the project's
 * bot store as hourly estimates (source `cloudflare`).
 *
 * - Window: from the cursor (first sync: 7 days back, never more than 30 or
 *   than the zone's retention) to the last full hour at least 15 minutes old,
 *   so Cloudflare has the hour's data. One window per day (or the zone's
 *   maximum query duration if shorter); a window that hits the row limit is
 *   split in halves down to one hour.
 * - Counts are Cloudflare's sampled estimates. They are written as aggregate
 *   rows (hour, bot, category, path, hits, status classes), one Durable Object
 *   call per window, replacing the window's earlier import; the cursor moves
 *   after each window, so a failed sync resumes where it stopped and a
 *   repeated one never counts twice.
 * - The bot store keeps the snippet's numbers for any hour the snippet
 *   reported, and stops at the month's cap.
 * - At most SAMPLES_PER_SYNC rows reach the recent-hits list per sync.
 */
import { createHash } from '@flarepanel/shared/server';
import type {
  BotEventRow,
  BotImportBatch,
  BotImportResult,
  BotImportRow,
} from '../../ingest/cloudflare/bot-store';
import { botAggregatePath } from '../../ingest/cloudflare/bot-store';
import { type BotMatch, detectBot } from '../../ingest/src/bots/detect';
import {
  CLOUDFLARE_SYNC_FIRST_DAYS,
  CLOUDFLARE_SYNC_MAX_DAYS,
} from '../cloudflare-analytics.constants';
import type { ApiOptions, ZoneDatasetLimits } from './api';
import {
  type CrawlerGroup,
  FULL_MODE,
  MAX_ROWS_PER_QUERY,
  type QueryMode,
  queryCrawlerWindow,
  type StatusClass,
} from './crawler-query';
import { crawlerPatternChunks } from './patterns';

export const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
/** How old an hour must be before Cloudflare's numbers for it are complete. */
export const SYNC_LAG_MS = 15 * 60 * 1000;
/** GraphQL queries one sync may send (Cloudflare allows 300 per 5 minutes). */
export const MAX_QUERIES_PER_SYNC = 60;
export const SAMPLES_PER_SYNC = 3;
const SAMPLE_ID_BYTES = 8;

export interface CloudflareSyncInput extends ApiOptions {
  token: string;
  zoneId: string;
  hostnames: readonly string[];
  syncedThrough: Date | null;
  now: number;
  limits: ZoneDatasetLimits;
  projectId: string;
  monthlyCap: number | null;
  /** Stores one window's rows in the project's bot store. */
  write: (batch: BotImportBatch) => Promise<BotImportResult>;
  /** Records that everything before `through` is imported. */
  saveCursor: (through: Date) => Promise<void>;
  maxQueries?: number;
  patternChunks?: string[][];
}

export interface CloudflareSyncOutcome {
  from: Date;
  through: Date;
  hits: number;
  rows: number;
  skippedHours: number;
  cappedHours: number;
  queries: number;
  /** False when the query budget ran out first: the next sync continues. */
  complete: boolean;
  mode: QueryMode;
}

const floorHour = (ms: number) => Math.floor(ms / HOUR_MS) * HOUR_MS;
const ceilHour = (ms: number) => Math.ceil(ms / HOUR_MS) * HOUR_MS;

/** The span one sync covers, on whole hours. */
export function syncSpan(
  syncedThrough: Date | null,
  now: number,
  limits: ZoneDatasetLimits
): { from: number; to: number; step: number } {
  const to = floorHour(now - SYNC_LAG_MS);
  let earliest = to - CLOUDFLARE_SYNC_MAX_DAYS * DAY_MS;
  if (limits.notOlderThan) {
    // An hour of margin: the query is checked against the time it runs.
    earliest = Math.max(
      earliest,
      ceilHour(now - limits.notOlderThan * 1000 + HOUR_MS)
    );
  }
  const from = Math.max(
    syncedThrough
      ? floorHour(syncedThrough.getTime())
      : to - CLOUDFLARE_SYNC_FIRST_DAYS * DAY_MS,
    earliest
  );
  const maxStep = limits.maxDuration
    ? Math.floor((limits.maxDuration * 1000) / HOUR_MS) * HOUR_MS
    : DAY_MS;
  return { from, to, step: Math.max(HOUR_MS, Math.min(DAY_MS, maxStep)) };
}

function statusClassOf(group: CrawlerGroup): StatusClass | null {
  if (group.status != null) {
    const index = Math.floor(group.status / 100) - 2;
    return (['2xx', '3xx', '4xx', '5xx'] as const)[index] ?? null;
  }
  return group.statusClass;
}

/** A short stable id for an imported sample row. */
function sampleId(hour: number, bot: BotMatch, path: string): string {
  return `cloudflare:${hour}:${createHash(`${bot.name}\u0000${path}`, SAMPLE_ID_BYTES)}`;
}

/**
 * Cloudflare groups → bot store rows: drops what is not a known bot or not on
 * a selected host, and merges groups that differ only in user agent version
 * or status code into one row per hour, bot and path.
 */
export function aggregateGroups(
  groups: readonly CrawlerGroup[],
  options: { hostnames: readonly string[]; projectId: string; samples: number }
): { rows: BotImportRow[]; samples: BotEventRow[] } {
  const hosts = new Set(options.hostnames);
  const detected = new Map<string, BotMatch | null>();
  const rows = new Map<string, BotImportRow>();
  const biggest = new Map<
    string,
    { group: CrawlerGroup; bot: BotMatch; hour: number }
  >();

  for (const group of groups) {
    if (group.host && hosts.size > 0 && !hosts.has(group.host.toLowerCase())) {
      continue;
    }
    let bot = detected.get(group.userAgent);
    if (bot === undefined) {
      bot = detectBot(group.userAgent);
      detected.set(group.userAgent, bot);
    }
    const at = Date.parse(group.hour);
    if (!(bot && Number.isFinite(at))) {
      continue;
    }
    const hour = Math.floor(at / HOUR_MS);
    const path = botAggregatePath(group.path);
    const key = `${hour}\u0000${bot.name}\u0000${bot.type}\u0000${path}`;
    const row = rows.get(key) ?? {
      hour,
      name: bot.name,
      type: bot.type,
      path,
      hits: 0,
      status: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
    };
    row.hits += group.count;
    const statusClass = statusClassOf(group);
    if (statusClass && row.status) {
      row.status[statusClass] = (row.status[statusClass] ?? 0) + group.count;
    }
    rows.set(key, row);
    const top = biggest.get(key);
    if (!top || top.group.count < group.count) {
      biggest.set(key, { group, bot, hour });
    }
  }

  const samples = [...biggest.values()]
    .sort((a, b) => b.group.count - a.group.count)
    .slice(0, options.samples)
    .map(({ group, bot, hour }): BotEventRow => {
      const path = botAggregatePath(group.path);
      return {
        id: sampleId(hour, bot, path),
        name: bot.name,
        type: bot.type,
        project_id: options.projectId,
        path: group.host ? `https://${group.host}${path}` : path,
        created_at: new Date(hour * HOUR_MS + HOUR_MS / 2).toISOString(),
        status: group.status,
        source: 'cloudflare',
      };
    });
  return { rows: [...rows.values()], samples };
}

/** Groups seen by more than one chunk (overlapping patterns) count once. */
function mergeGroups(
  target: Map<string, CrawlerGroup>,
  groups: CrawlerGroup[]
) {
  for (const group of groups) {
    const key = [
      group.hour,
      group.userAgent,
      group.host,
      group.path,
      group.status,
      group.statusClass,
    ].join('\u0000');
    const seen = target.get(key);
    if (!seen || seen.count < group.count) {
      target.set(key, group);
    }
  }
}

export class QueryBudgetExceeded extends Error {
  constructor() {
    super('Query budget for this sync used up');
    this.name = 'QueryBudgetExceeded';
  }
}

export async function runCloudflareSync(
  input: CloudflareSyncInput
): Promise<CloudflareSyncOutcome> {
  const { from, to, step } = syncSpan(
    input.syncedThrough,
    input.now,
    input.limits
  );
  const chunks = input.patternChunks ?? crawlerPatternChunks();
  const maxQueries = input.maxQueries ?? MAX_QUERIES_PER_SYNC;
  const limit = Math.min(
    input.limits.maxPageSize ?? MAX_ROWS_PER_QUERY,
    MAX_ROWS_PER_QUERY
  );
  const outcome: CloudflareSyncOutcome = {
    from: new Date(from),
    through: new Date(from),
    hits: 0,
    rows: 0,
    skippedHours: 0,
    cappedHours: 0,
    queries: 0,
    complete: true,
    mode: FULL_MODE,
  };

  async function collect(
    since: number,
    until: number,
    patterns: string[],
    target: Map<string, CrawlerGroup>
  ): Promise<void> {
    if (outcome.queries >= maxQueries) {
      throw new QueryBudgetExceeded();
    }
    const result = await queryCrawlerWindow(
      input.token,
      {
        zoneId: input.zoneId,
        since: new Date(since).toISOString(),
        until: new Date(until).toISOString(),
        hostnames: input.hostnames,
        patterns,
        limit,
      },
      outcome.mode,
      input
    );
    outcome.queries += result.queries;
    outcome.mode = result.mode;
    if (result.truncated && until - since > HOUR_MS) {
      const middle =
        since + Math.floor((until - since) / 2 / HOUR_MS) * HOUR_MS;
      await collect(since, middle, patterns, target);
      await collect(middle, until, patterns, target);
      return;
    }
    mergeGroups(target, result.groups);
  }

  const windows: [number, number][] = [];
  for (let since = from; since < to; since += step) {
    windows.push([since, Math.min(since + step, to)]);
  }

  for (const [index, [since, until]] of windows.entries()) {
    const groups = new Map<string, CrawlerGroup>();
    try {
      for (const patterns of chunks) {
        await collect(since, until, patterns, groups);
      }
    } catch (error) {
      if (error instanceof QueryBudgetExceeded) {
        outcome.complete = false;
        break;
      }
      throw error;
    }
    const { rows, samples } = aggregateGroups([...groups.values()], {
      hostnames: input.hostnames,
      projectId: input.projectId,
      samples: index >= windows.length - SAMPLES_PER_SYNC ? 1 : 0,
    });
    const result = await input.write({
      source: 'cloudflare',
      fromHour: since / HOUR_MS,
      toHour: until / HOUR_MS,
      rows,
      samples,
      monthlyCap: input.monthlyCap,
    });
    outcome.hits += result.hits;
    outcome.rows += result.rows;
    outcome.skippedHours += result.skippedHours;
    outcome.cappedHours += result.cappedHours;
    outcome.through = new Date(until);
    await input.saveCursor(outcome.through);
  }
  return outcome;
}
