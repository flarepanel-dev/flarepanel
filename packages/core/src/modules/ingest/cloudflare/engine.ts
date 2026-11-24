// One project's events on SQLite, written so a Durable Object pays for few
// rows: events land as gzip JSON chunks (one row per group commit), and
// sessions, daily rollups, event names and profiles are in-memory state
// checkpointed every few minutes. Chunks are the source of truth: after a
// restart, everything newer than the checkpoint's watermark is replayed from
// them. The SQL handle, clock and gzip are injected, so this runs on
// `bun:sqlite` in tests and on Durable Object SQLite in production.

import type { SessionIngestResult } from '../../../buffers/session-buffer';
import {
  DEFAULT_SESSION_TIMEOUT_MS,
  decideSession,
  extendSession,
  fromClickhouseDate,
  isSessionActivity,
  newSession,
} from '../../../buffers/session-state';
import type {
  IClickhouseEvent,
  IServiceCreateEventPayload,
  IServiceCreateEventPayloadWithId,
} from '../../event/event.service';
import { buildClickhouseEvent } from '../../event/src/clickhouse-event';
import type { IClickhouseSession } from '../../session/session.service';
import {
  buildSessionEndPayload,
  type EnqueueSessionEndInput,
  sessionEndJobPayload,
  sessionEndPayloadFromSnapshot,
} from '../../session/src/session-end-payload';
import type { ColdStore } from './archive';
import {
  ChartAccumulator,
  type ChartRow,
  type ChartScanQuery,
  DistributionAccumulator,
  type ProfileLookup,
} from './chart-scan';
import {
  ConversionAccumulator,
  type ConversionRow,
  type ConversionScanQuery,
} from './conversion-scan';
import {
  EventCountAccumulator,
  type EventCountQuery,
  type EventCountRow,
} from './event-count-scan';
import { matchesFilters, type RowFilter } from './filter-eval';
import {
  FunnelAccumulator,
  type FunnelScanQuery,
  type FunnelScanResult,
} from './funnel-scan';
import { type GroupSummary, GroupSummaryAccumulator } from './group-scan';
import { HyperLogLog } from './hyperloglog';
import {
  JourneyAccumulator,
  type JourneyScanQuery,
  type JourneyScanResult,
} from './journey-scan';
import { LIVE_WINDOW_MS, type LiveSnapshot, LiveWindow } from './live-window';
import {
  type PageScanRow,
  PageSeriesAccumulator,
  type PageSeriesQuery,
  type PageSeriesRow,
  PagesAccumulator,
  type PagesScanQuery,
} from './pages-scan';
import { type ProfileSummary, ProfileSummaryAccumulator } from './profile-scan';
import { type RealtimeQuery, realtimeFromEvents } from './realtime-scan';
import {
  RetentionAccumulator,
  type RetentionRow,
  type RetentionScanQuery,
} from './retention-scan';
import {
  SankeyAccumulator,
  type SankeyScanQuery,
  type SankeyScanResult,
} from './sankey-scan';
import {
  type BucketInterval,
  buildBuckets,
  coverWithHoursAndDays,
  type HourDayCover,
  hourNumber,
  MINUTE_MS,
} from './time-buckets';

/**
 * 2: hourly rollups (timezones, hour series) and the ended-session log.
 * 3: page sessions count page views only; entry and exit pages carry their
 * sessions' page views; visitors are the people sessions belong to. An upgrade rebuilds every rollup from the stored chunks.
 */
const SCHEMA_VERSION = 3;
const DEFAULT_COMMIT_MAX_EVENTS = 200;
const DEFAULT_COMMIT_MAX_DELAY_MS = 500;
const DEFAULT_CHECKPOINT_INTERVAL_MS = 5 * 60 * 1000;
const DEFAULT_DEDUPE_WINDOW_MS = 1000;
/**
 * Younger sessions are not written at a checkpoint; a restart rebuilds them
 * from chunks instead. A session stays in memory for the idle timeout after
 * its last event, so this must exceed that timeout or nearly every session
 * would be written once and deleted once. It also bounds how many chunks a
 * restart replays.
 */
const DEFAULT_SESSION_CHECKPOINT_AGE_MS = 40 * 60 * 1000;
const DEFAULT_ACTIVE_WINDOW_MS = 5 * 60 * 1000;
const LIST_EVENTS_PAGE_SIZE = 50;
const LIST_EVENTS_MAX_PAGE_SIZE = 200;
/**
 * Chunks one `listEvents` call may decompress before it hands back a cursor,
 * so a selective filter costs a bounded amount per call. Such a page can be
 * empty and still carry a cursor: keep paging until the cursor is null.
 */
const LIST_EVENTS_MAX_CHUNKS = 48;
/**
 * A group commit is cut before its raw JSON passes this, and a single event
 * may not exceed the next one, so a gzip chunk stays well under Durable
 * Object SQLite's 2 MB row limit without ever needing a split.
 */
const MAX_CHUNK_RAW_BYTES = 1_000_000;
const MAX_EVENT_RAW_BYTES = 1_500_000;
/** The alarm never asks to run sooner than this, so a stalled checkpoint cannot spin it. */
const MIN_ALARM_DELAY_MS = 1000;
/** A session change whose event never arrived (filtered out) stops blocking its checkpoint after this. */
const INGEST_MARKER_TTL_MS = 60 * 1000;
const CHUNK_READ_BATCH = 16;
const CHUNK_CACHE_SIZE = 16;
/** A checkpoint gives up (and retries on the next tick) if writes keep coming. */
const CHECKPOINT_MAX_FLUSH_ROUNDS = 5;
const CARD_CHART_MONTHS = 3;
const CARD_HISTORY_MONTHS = 6;
const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_KEY_LENGTH = 10;

const META_WATERMARK = 'watermark';
const META_SCHEMA_VERSION = 'schema_version';
const META_CHECKPOINT_AT = 'checkpoint_at';
/** Lowest chunk id a session left out of the checkpoint started in. */
const META_SESSION_FLOOR = 'session_floor';

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS chunks (id INTEGER PRIMARY KEY, ts_min INT, ts_max INT, n INT, body BLOB)',
  'CREATE TABLE IF NOT EXISTS sessions (device_id TEXT PRIMARY KEY, ended_at INT, body TEXT) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS daily (day TEXT PRIMARY KEY, visitors BLOB, sessions INT, bounces INT, duration_ms INT, screen_views INT, events INT, revenue INT) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS event_names (name TEXT PRIMARY KEY, count INT, last_seen INT) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, body TEXT, last_seen INT) WITHOUT ROWID',
  // Per-day counts by page, source, place and device for the overview's top
  // lists. Written additively at each checkpoint, like event_names.
  'CREATE TABLE IF NOT EXISTS dims (day TEXT, dim TEXT, value TEXT, sessions INT, pageviews INT, revenue INT, PRIMARY KEY (day, dim, value)) WITHOUT ROWID',
  // The same counts per UTC hour: the edges of a range in the project's
  // timezone, and hour/day series in any timezone.
  'CREATE TABLE IF NOT EXISTS hourly (hour INTEGER PRIMARY KEY, visitors BLOB, sessions INT, bounces INT, duration_ms INT, screen_views INT, events INT, revenue INT)',
  'CREATE TABLE IF NOT EXISTS dims_h (dim TEXT, hour INT, value TEXT, sessions INT, pageviews INT, revenue INT, PRIMARY KEY (dim, hour, value)) WITHOUT ROWID',
  // One row per ended session, for the Sessions page; live ones are in memory.
  'CREATE TABLE IF NOT EXISTS session_log (id TEXT PRIMARY KEY, created_at INT, profile_id TEXT, body TEXT) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS session_log_created ON session_log (created_at)',
  'CREATE INDEX IF NOT EXISTS session_log_profile ON session_log (profile_id, created_at)',
];

/** Session-level dimensions, counted once per session at session_start. */
const SESSION_DIMENSIONS = [
  'referrer',
  'referrer_name',
  'referrer_type',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'country',
  'region',
  'city',
  'device',
  'brand',
  'model',
  'browser',
  'browser_version',
  'os',
  'os_version',
] as const;
export type SessionDimension = (typeof SESSION_DIMENSIONS)[number];
/** Page dimensions: views by page, sessions by entry and exit page. */
export type PageDimension = 'path' | 'entry' | 'exit';
export type Dimension = SessionDimension | PageDimension;
/** Separates a value from its parent (country for a city, origin for a path). */
const DIM_PREFIX_SEPARATOR = '\u0001';
const DIM_KEY_SEPARATOR = '\u0000';
const DIM_PREFIX: Partial<Record<SessionDimension, SessionDimension>> = {
  region: 'country',
  city: 'country',
  browser_version: 'browser',
  os_version: 'os',
};
const DEFAULT_TOP_LIMIT = 50;
const P90 = 0.9;
/** The event drawer sends created_at; the stored time can differ slightly. */
const FIND_EVENT_SLACK_MS = 5000;
/** Values per bucket the overview's per-value trends read. */
const DIMENSION_SERIES_LIMIT = 10_000;
const MS_PER_SECOND = 1000;
const PERCENT = 100;
/** Minute series are counted from raw events, so only over short ranges. */
const MAX_MINUTE_RANGE_MS = 24 * 60 * 60 * 1000;
/** Stored chunks one range scan may decompress. */
const SCAN_MAX_CHUNKS = 2000;
const LIVE_REBUILD_MAX_CHUNKS = 4000;
/** Events one Realtime read holds in memory (the last 30 minutes). */
const REALTIME_MAX_EVENTS = 100_000;
const SESSION_PAGE_ROWS = 200;
/** Logged sessions one list or count call may read (filters run in JS). */
const SESSION_SCAN_MAX = 100_000;
const SESSION_LIST_MAX_TAKE = 1000;
const SESSION_SEARCH_FIELDS = [
  'id',
  'profile_id',
  'entry_path',
  'exit_path',
  'referrer_name',
  'country',
  'city',
] as const;

export interface DimensionDayRow extends DimensionRow {
  /** `YYYY-MM-DD`, UTC. */
  day: string;
}

export interface DimensionRow {
  /** The parent value (country, browser, os, or a page's origin). */
  prefix?: string;
  name: string;
  sessions: number;
  pageviews: number;
  revenue: number;
}

interface DimensionDelta {
  sessions: number;
  pageviews: number;
  revenue: number;
}

export interface RangeStats {
  visitors: number;
  sessions: number;
  bounces: number;
  durationMs: number;
  screenViews: number;
  events: number;
  revenue: number;
}

export interface MetricsQuery {
  /** Inclusive epoch ms. */
  from: number;
  /** Inclusive epoch ms. */
  to: number;
  interval: BucketInterval;
  /** IANA name; buckets start at local midnight, week (Sunday) or month. */
  timezone: string;
  /** Dashboard filters: counted from raw events (the retention window). */
  filters?: RowFilter[];
}

export interface MetricsResult {
  totals: RangeStats;
  /** One point per bucket; `start` is the bucket's epoch ms. */
  series: (RangeStats & { start: number })[];
  /** A raw-event count stopped at its scan budget: the numbers are a lower bound. */
  partial?: boolean;
}

/** The session half of a profile's metrics, as the ClickHouse query gives it. */
export interface ProfileSessionStats {
  sessions: number;
  /** Seconds, over sessions with a duration. */
  durationAvg: number;
  durationP90: number;
  /** Percent. */
  bounceRate: number;
}

export interface SessionListQuery {
  /** Sessions that started at or after this (epoch ms). */
  from?: number;
  /** …and at or before this. */
  to?: number;
  /** Page cursor: sessions that started strictly before this. */
  before?: number;
  profileId?: string;
  filters?: RowFilter[];
  search?: string;
  take?: number;
}

// ---------------------------------------------------------------------------
// Injected runtime

export type SqlValue =
  | string
  | number
  | bigint
  | null
  | Uint8Array
  | ArrayBuffer;
export type SqlRow = Record<string, SqlValue>;

/** `ctx.storage.sql` + `transactionSync` on a Durable Object; `bun:sqlite` in tests. */
export interface EngineSql {
  exec(query: string, ...bindings: SqlValue[]): SqlRow[];
  transaction<T>(fn: () => T): T;
}

export interface EngineClock {
  now(): number;
  setTimeout(callback: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
}

export interface EngineCodec {
  compress(bytes: Uint8Array): Promise<Uint8Array>;
  decompress(bytes: Uint8Array): Promise<Uint8Array>;
}

export interface EngineOptions {
  /** Idle window, in event time for boundaries and wall time for the sweep. */
  sessionTimeoutMs?: number;
  /** A group commit is written at this many events… */
  commitMaxEvents?: number;
  /** …or this long after its first event, whichever comes first. */
  commitMaxDelayMs?: number;
  checkpointIntervalMs?: number;
  /** Sessions younger than this are rebuilt from chunks, not checkpointed. */
  sessionCheckpointAgeMs?: number;
  dedupeWindowMs?: number;
}

export interface EngineDeps {
  sql: EngineSql;
  clock: EngineClock;
  codec: EngineCodec;
  options?: EngineOptions;
  /** Older events (the R2 archive) for scans that reach past the chunks. */
  cold?: ColdStore;
}

// ---------------------------------------------------------------------------
// Read shapes

export interface ListEventsQuery {
  profileId?: string;
  sessionId?: string;
  names?: string[];
  /** Event filters, as reports name them (`path`, `properties.plan`, ...). */
  filters?: RowFilter[];
  groupId?: string;
  startDate?: Date;
  endDate?: Date;
  /** From the previous page; absent for the newest page. */
  cursor?: string | null;
  take?: number;
}

export interface ListEventsPage {
  /** Newest first, in arrival order. */
  events: IClickhouseEvent[];
  /** Null on the last page. */
  cursor: string | null;
}

export interface DailyStats {
  /** `YYYY-MM-DD`, UTC. */
  day: string;
  visitors: number;
  sessions: number;
  bounces: number;
  durationMs: number;
  screenViews: number;
  events: number;
  revenue: number;
}

export interface ProjectCard {
  chart: { date: string; value: number; revenue: number }[];
  metrics: {
    months_3: number;
    months_3_prev: number;
    month: number;
    day: number;
    day_prev: number;
    revenue: number;
  };
}

export interface StoredChunk {
  id: number;
  tsMin: number;
  tsMax: number;
  events: IClickhouseEvent[];
}

export interface TickResult {
  /** Sessions the idle sweep closed (their `session_end` rows are stored). */
  endedSessions: IClickhouseSession[];
  checkpointed: boolean;
  nextAlarmAt: number | null;
}

// ---------------------------------------------------------------------------
// Internal state

interface LiveSession {
  session: IClickhouseSession;
  /** Wall-clock time of the last event, for the idle sweep. */
  lastActivityAt: number;
  /** Wall-clock time the session opened. */
  startedAt: number;
  /** The chunk its first event went into (or a lower one). */
  firstChunkId: number;
}

interface DailyRollup {
  visitors: HyperLogLog;
  sessions: number;
  bounces: number;
  durationMs: number;
  screenViews: number;
  events: number;
  revenue: number;
}

interface PendingBatch {
  events: IClickhouseEvent[];
  /** Raw JSON bytes of `events`. */
  bytes: number;
  committed: Promise<void>;
  resolve: () => void;
  reject: (error: unknown) => void;
}

interface ProfileSnapshot {
  body: Record<string, unknown>;
  lastSeen: number;
  /** Seen only at a session start: write it only if the profile is new. */
  insertOnly: boolean;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toBytes(value: SqlValue | undefined): Uint8Array {
  if (value instanceof Uint8Array) {
    return value;
  }
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  return new Uint8Array(0);
}

function toNumber(value: SqlValue | undefined): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'bigint' || typeof value === 'string') {
    return Number(value);
  }
  return 0;
}

/**
 * A chunk body: the events, and which of them moved a session (ran
 * `sessions.ingest`). Server-side, AI and back-dated events ride along on a
 * session without changing it, so replay must not treat them as activity.
 */
interface ChunkBody {
  events: IClickhouseEvent[];
  sessionActivity: number[];
}

function parseChunkBody(json: string): ChunkBody {
  const parsed = JSON.parse(json) as ChunkBody | IClickhouseEvent[];
  if (Array.isArray(parsed)) {
    return { events: parsed, sessionActivity: [] };
  }
  return parsed;
}

function ingestMarkerKey(deviceId: string, name: string, createdAtMs: number) {
  return `${deviceId}\u0000${name}\u0000${createdAtMs}`;
}

/** Faster than luxon for the scan path; the format is fixed and UTC. */
function eventTimeMs(createdAt: string): number {
  return Date.parse(`${createdAt.replace(' ', 'T')}Z`);
}

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, DAY_KEY_LENGTH);
}

function monthsBefore(ms: number, months: number): number {
  const date = new Date(ms);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date.getTime();
}

function createDeferred(): PendingBatch {
  let resolve: () => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const committed = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // A rejection nobody awaited must not crash the isolate; `sync` re-surfaces it.
  committed.catch(() => undefined);
  return { events: [], bytes: 0, committed, resolve, reject };
}

function rollupFromRow(row: SqlRow): DailyRollup {
  return {
    visitors: HyperLogLog.fromBytes(toBytes(row.visitors)),
    sessions: toNumber(row.sessions),
    bounces: toNumber(row.bounces),
    durationMs: toNumber(row.duration_ms),
    screenViews: toNumber(row.screen_views),
    events: toNumber(row.events),
    revenue: toNumber(row.revenue),
  };
}

function addDelta(
  deltas: Map<string, DimensionDelta>,
  key: string,
  delta: DimensionDelta
) {
  const current = deltas.get(key) ?? { sessions: 0, pageviews: 0, revenue: 0 };
  current.sessions += delta.sessions;
  current.pageviews += delta.pageviews;
  current.revenue += delta.revenue;
  deltas.set(key, current);
}

/** Session starts count sessions, session ends bounces and time, the rest events. */
function addToRollup(
  rollup: DailyRollup,
  event: IClickhouseEvent,
  isSessionStart: boolean,
  isSessionEnd: boolean
) {
  if (isSessionStart) {
    rollup.sessions += 1;
  } else if (isSessionEnd) {
    rollup.bounces += isBounce(event) ? 1 : 0;
    rollup.durationMs += Math.max(0, event.duration ?? 0);
  } else {
    rollup.events += 1;
    rollup.revenue += event.revenue ?? 0;
    if (event.name === 'screen_view') {
      rollup.screenViews += 1;
    }
  }
  // As OpenPanel's sessions table counts them: the people sessions belong to,
  // so server-side and back-dated events add no visitors.
  if (isSessionStart && event.profile_id) {
    rollup.visitors.add(event.profile_id);
  }
}

interface RangeTotals {
  sketch: HyperLogLog;
  sessions: number;
  bounces: number;
  durationMs: number;
  screenViews: number;
  events: number;
  revenue: number;
}

function emptyTotals(): RangeTotals {
  return {
    sketch: new HyperLogLog(),
    sessions: 0,
    bounces: 0,
    durationMs: 0,
    screenViews: 0,
    events: 0,
    revenue: 0,
  };
}

function addTotals(totals: RangeTotals, rollup: DailyRollup) {
  totals.sketch.merge(rollup.visitors);
  totals.sessions += rollup.sessions;
  totals.bounces += rollup.bounces;
  totals.durationMs += rollup.durationMs;
  totals.screenViews += rollup.screenViews;
  totals.events += rollup.events;
  totals.revenue += rollup.revenue;
}

/**
 * A page in event time, newest first. Pages follow arrival order (cheap);
 * an event sent later with a past timestamp still lands on the page it
 * arrived with, but no longer heads it.
 */
function byTimeDesc(events: IClickhouseEvent[]): IClickhouseEvent[] {
  return [...events].sort(
    (a, b) => eventTimeMs(b.created_at) - eventTimeMs(a.created_at)
  );
}

function round2(value: number): number {
  return Math.round(value * PERCENT) / PERCENT;
}

function toStats(totals: RangeTotals): RangeStats {
  return {
    visitors: totals.sketch.count(),
    sessions: totals.sessions,
    bounces: totals.bounces,
    durationMs: totals.durationMs,
    screenViews: totals.screenViews,
    events: totals.events,
    revenue: totals.revenue,
  };
}

function findBucket<T extends { start: number; end: number }>(
  buckets: T[],
  at: number
): T | undefined {
  let low = 0;
  let high = buckets.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const bucket = buckets[middle] as T;
    if (at < bucket.start) {
      high = middle - 1;
    } else if (at >= bucket.end) {
      low = middle + 1;
    } else {
      return bucket;
    }
  }
  return;
}

const UTM_FIELDS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

/** Event rows keep UTM tags as `__query.*` properties; filters name them bare. */
function eventFilterRow(event: IClickhouseEvent): Record<string, unknown> {
  const row: Record<string, unknown> = { ...event };
  for (const field of UTM_FIELDS) {
    row[field] = event.properties[`${UTM_PREFIX}${field}`];
  }
  return row;
}

/** Session filters name pages like event filters do: `path` is the entry page. */
function sessionFilterRow(
  session: IClickhouseSession
): Record<string, unknown> {
  return {
    ...session,
    path: session.entry_path,
    origin: session.entry_origin,
  };
}

function emptyRollup(): DailyRollup {
  return {
    visitors: new HyperLogLog(),
    sessions: 0,
    bounces: 0,
    durationMs: 0,
    screenViews: 0,
    events: 0,
    revenue: 0,
  };
}

const UTM_PREFIX = '__query.';

/** The dotted event row back into the payload shape the session rules read. */
function payloadFromEvent(event: IClickhouseEvent): IServiceCreateEventPayload {
  const query: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(event.properties)) {
    if (key.startsWith(UTM_PREFIX)) {
      query[key.slice(UTM_PREFIX.length)] = value;
    }
  }
  return {
    name: event.name,
    deviceId: event.device_id,
    profileId: event.profile_id,
    projectId: event.project_id,
    sessionId: event.session_id,
    properties: { __query: query },
    createdAt: fromClickhouseDate(event.created_at),
    country: event.country,
    city: event.city,
    region: event.region,
    longitude: event.longitude,
    latitude: event.latitude,
    os: event.os,
    osVersion: event.os_version,
    browser: event.browser,
    browserVersion: event.browser_version,
    device: event.device,
    brand: event.brand,
    model: event.model,
    duration: event.duration,
    path: event.path,
    origin: event.origin,
    referrer: event.referrer,
    referrerName: event.referrer_name,
    referrerType: event.referrer_type,
    sdkName: event.sdk_name,
    sdkVersion: event.sdk_version,
    revenue: event.revenue,
    groups: event.groups,
  };
}

/** `toDots` stores the flag as a string, like every property on the row. */
function isBounce(event: IClickhouseEvent): boolean {
  return String(event.properties.__bounce) === 'true';
}

function profileBody(event: IClickhouseEvent): Record<string, unknown> {
  return {
    path: event.path,
    country: event.country,
    city: event.city,
    region: event.region,
    longitude: event.longitude,
    latitude: event.latitude,
    os: event.os,
    os_version: event.os_version,
    browser: event.browser,
    browser_version: event.browser_version,
    device: event.device,
    brand: event.brand,
    model: event.model,
    referrer: event.referrer,
    referrer_name: event.referrer_name,
    referrer_type: event.referrer_type,
  };
}

function matchesQuery(
  event: IClickhouseEvent,
  query: ListEventsQuery,
  range: { fromMs: number; toMs: number }
): boolean {
  if (query.profileId && event.profile_id !== query.profileId) {
    return false;
  }
  if (query.sessionId && event.session_id !== query.sessionId) {
    return false;
  }
  if (query.names?.length && !query.names.includes(event.name)) {
    return false;
  }
  if (query.groupId && !(event.groups ?? []).includes(query.groupId)) {
    return false;
  }
  const at = eventTimeMs(event.created_at);
  if (at < range.fromMs || at > range.toMs) {
    return false;
  }
  return (
    !query.filters?.length ||
    matchesFilters(eventFilterRow(event), query.filters)
  );
}

function parseCursor(cursor: string | null | undefined) {
  const [chunk, index] = (cursor ?? '').split(':').map(Number);
  const isValid = Number.isInteger(chunk) && Number.isInteger(index);
  return isValid
    ? { chunk: chunk as number, index: index as number }
    : { chunk: Number.POSITIVE_INFINITY, index: Number.POSITIVE_INFINITY };
}

// ---------------------------------------------------------------------------

export type ProjectEventsEngine = Awaited<
  ReturnType<typeof openProjectEventsEngine>
>;

/** Creates the schema if needed and rebuilds in-memory state from storage. */
export async function openProjectEventsEngine({
  sql,
  clock,
  codec,
  options = {},
  cold,
}: EngineDeps) {
  const sessionTimeoutMs =
    options.sessionTimeoutMs ?? DEFAULT_SESSION_TIMEOUT_MS;
  const commitMaxEvents = options.commitMaxEvents ?? DEFAULT_COMMIT_MAX_EVENTS;
  const commitMaxDelayMs =
    options.commitMaxDelayMs ?? DEFAULT_COMMIT_MAX_DELAY_MS;
  const checkpointIntervalMs =
    options.checkpointIntervalMs ?? DEFAULT_CHECKPOINT_INTERVAL_MS;
  const dedupeWindowMs = options.dedupeWindowMs ?? DEFAULT_DEDUPE_WINDOW_MS;
  const sessionCheckpointAgeMs =
    options.sessionCheckpointAgeMs ?? DEFAULT_SESSION_CHECKPOINT_AGE_MS;

  const sessions = new Map<string, LiveSession>();
  const profileIndex = new Map<string, string>();
  const dirtySessions = new Set<string>();
  /** device id → session id of each row in the `sessions` table. */
  const persistedSessions = new Map<string, string>();
  const days = new Map<string, DailyRollup>();
  const dirtyDays = new Set<string>();
  const nameDeltas = new Map<string, { count: number; lastSeen: number }>();
  const dimDeltas = new Map<string, DimensionDelta>();
  const hours = new Map<number, DailyRollup>();
  const dirtyHours = new Set<number>();
  /** `hour \0 dim \0 value` → delta, written additively like `dimDeltas`. */
  const dimHourDeltas = new Map<string, DimensionDelta>();
  const live = new LiveWindow();
  /** False after a restart until the live card is rebuilt from chunks. */
  let liveReady = false;
  /** Pages each live session has viewed, so a page counts a session once. */
  const sessionPages = new Map<string, Set<string>>();
  /** Each live session's entry page and page views, for entry and exit pages. */
  const sessionViews = new Map<
    string,
    { entry: string | null; views: number }
  >();
  const dirtyProfiles = new Map<string, ProfileSnapshot>();
  const recentRequests = new Map<string, number>();
  const chunkCache = new Map<number, IClickhouseEvent[]>();
  const inflight = new Map<number, IClickhouseEvent[]>();
  /** Events stored for a `sessions.ingest` call; flagged in their chunk. */
  const sessionActivityEvents = new WeakSet<IClickhouseEvent>();
  /** `sessions.ingest` calls whose event is not appended yet. */
  const ingestMarkers = new Map<string, { deviceId: string; at: number }>();

  let pending = createDeferred();
  let commitTimer: unknown = null;
  let flushChain: Promise<void> = Promise.resolve();
  let nextChunkId = 1;
  let watermark = 0;
  /** Highest chunk id written; the checkpoint's watermark comes from it. */
  let watermarkCandidate = 0;
  /** A restart replays sessions from this chunk on; it must not be pruned. */
  let sessionFloor = 1;
  let lastCheckpointAt = clock.now();
  let broken: unknown = null;

  function assertUsable() {
    if (broken) {
      throw new Error(
        'Engine storage failed; reopen it to rebuild state from chunks',
        { cause: broken }
      );
    }
  }

  // -- sessions -------------------------------------------------------------

  function putSession(
    session: IClickhouseSession,
    opened: Pick<LiveSession, 'lastActivityAt' | 'startedAt' | 'firstChunkId'>
  ) {
    const previous = sessions.get(session.device_id)?.session;
    const previousProfileId = previous?.profile_id;
    if (
      previousProfileId &&
      previousProfileId !== session.profile_id &&
      profileIndex.get(previousProfileId) === session.device_id
    ) {
      profileIndex.delete(previousProfileId);
    }
    if (session.profile_id && session.profile_id !== session.device_id) {
      profileIndex.set(session.profile_id, session.device_id);
    }
    sessions.set(session.device_id, { session, ...opened });
    dirtySessions.add(session.device_id);
  }

  /** Keeps when and where a continuing session opened. */
  function touchSession(
    session: IClickhouseSession,
    lastActivityAt: number,
    chunkId: number
  ) {
    const live = sessions.get(session.device_id);
    const isSameSession = live?.session.id === session.id;
    putSession(session, {
      lastActivityAt,
      startedAt: isSameSession && live ? live.startedAt : lastActivityAt,
      firstChunkId: isSameSession && live ? live.firstChunkId : chunkId,
    });
  }

  function dropSession(deviceId: string, sessionId: string) {
    const live = sessions.get(deviceId);
    if (!live || live.session.id !== sessionId) {
      return;
    }
    const { profile_id: profileId } = live.session;
    if (profileId && profileIndex.get(profileId) === deviceId) {
      profileIndex.delete(profileId);
    }
    sessions.delete(deviceId);
    dirtySessions.delete(deviceId);
  }

  /** Replay twin of `ingest`: the event already carries its session id. */
  function replaySessionEvent(
    event: IClickhouseEvent,
    chunkId: number,
    isActivity: boolean
  ) {
    if (event.name === 'session_end') {
      dropSession(event.device_id, event.session_id);
      return;
    }
    if (!isActivity) {
      return;
    }
    const payload = payloadFromEvent(event);
    if (!isSessionActivity(payload)) {
      return;
    }
    const existing = sessions.get(event.device_id)?.session;
    const lastActivityAt = event.inserted_at
      ? eventTimeMs(event.inserted_at)
      : clock.now();
    const current =
      existing && existing.id === event.session_id
        ? extendSession(existing, payload).current
        : newSession(payload);
    touchSession(current, lastActivityAt, chunkId);
  }

  // -- rollups ----------------------------------------------------------------

  function loadDay(day: string): DailyRollup {
    const cached = days.get(day);
    if (cached) {
      return cached;
    }
    const [row] = sql.exec('SELECT * FROM daily WHERE day = ?', day);
    const rollup = row
      ? {
          visitors: HyperLogLog.fromBytes(toBytes(row.visitors)),
          sessions: toNumber(row.sessions),
          bounces: toNumber(row.bounces),
          durationMs: toNumber(row.duration_ms),
          screenViews: toNumber(row.screen_views),
          events: toNumber(row.events),
          revenue: toNumber(row.revenue),
        }
      : emptyRollup();
    days.set(day, rollup);
    return rollup;
  }

  function loadHour(hour: number): DailyRollup {
    const cached = hours.get(hour);
    if (cached) {
      return cached;
    }
    const [row] = sql.exec('SELECT * FROM hourly WHERE hour = ?', hour);
    const rollup = row ? rollupFromRow(row) : emptyRollup();
    hours.set(hour, rollup);
    return rollup;
  }

  function addDimension(
    at: number,
    dim: Dimension,
    value: string,
    delta: DimensionDelta
  ) {
    addDelta(
      dimDeltas,
      [dayKey(at), dim, value].join(DIM_KEY_SEPARATOR),
      delta
    );
    addDelta(
      dimHourDeltas,
      [hourNumber(at), dim, value].join(DIM_KEY_SEPARATOR),
      delta
    );
  }

  function sessionDimensionValue(
    event: IClickhouseEvent,
    dim: SessionDimension
  ): string {
    const raw = dim.startsWith('utm_')
      ? event.properties[`${UTM_PREFIX}${dim}`]
      : (event as unknown as Record<string, unknown>)[dim];
    const value = raw === undefined || raw === null ? '' : String(raw);
    const parent = DIM_PREFIX[dim];
    if (!parent) {
      return value;
    }
    const parentValue = (event as unknown as Record<string, unknown>)[parent];
    return `${parentValue ?? ''}${DIM_PREFIX_SEPARATOR}${value}`;
  }

  function pageValue(event: IClickhouseEvent): string {
    return `${event.origin ?? ''}${DIM_PREFIX_SEPARATOR}${event.path ?? ''}`;
  }

  function recordDimensions(
    event: IClickhouseEvent,
    at: number,
    isSessionStart: boolean,
    isSessionEnd: boolean
  ) {
    const isView = event.name === 'screen_view';
    const revenue = isSessionStart || isSessionEnd ? 0 : (event.revenue ?? 0);
    if (isSessionStart) {
      for (const dim of SESSION_DIMENSIONS) {
        addDimension(at, dim, sessionDimensionValue(event, dim), {
          sessions: 1,
          pageviews: 0,
          revenue: 0,
        });
      }
      if (event.path) {
        addDimension(at, 'entry', pageValue(event), {
          sessions: 1,
          pageviews: 0,
          revenue: 0,
        });
      }
      if (event.session_id) {
        sessionViews.set(event.session_id, {
          entry: event.path ? pageValue(event) : null,
          views: 0,
        });
      }
      return;
    }
    if (isSessionEnd) {
      sessionPages.delete(event.session_id);
      const views = sessionViews.get(event.session_id)?.views ?? 0;
      sessionViews.delete(event.session_id);
      if (event.path) {
        addDimension(at, 'exit', pageValue(event), {
          sessions: 1,
          pageviews: views,
          revenue: 0,
        });
      }
      return;
    }
    if (isView && event.session_id) {
      const session = sessionViews.get(event.session_id);
      if (session) {
        session.views += 1;
        if (session.entry) {
          addDimension(at, 'entry', session.entry, {
            sessions: 0,
            pageviews: 1,
            revenue: 0,
          });
        }
      }
    }
    if (isView || revenue) {
      for (const dim of SESSION_DIMENSIONS) {
        addDimension(at, dim, sessionDimensionValue(event, dim), {
          sessions: 0,
          pageviews: isView ? 1 : 0,
          revenue,
        });
      }
    }
    // Pages without a path (server-side events) are left out of page lists.
    if (event.path && (isView || revenue)) {
      const page = pageValue(event);
      // Like ClickHouse's page list: sessions are those that viewed the page.
      const seen = sessionPages.get(event.session_id) ?? new Set<string>();
      const firstInSession =
        isView && event.session_id ? !seen.has(page) : false;
      if (isView && event.session_id) {
        seen.add(page);
        sessionPages.set(event.session_id, seen);
      }
      addDimension(at, 'path', page, {
        sessions: firstInSession ? 1 : 0,
        pageviews: isView ? 1 : 0,
        revenue,
      });
    }
  }

  function applyCommitted(event: IClickhouseEvent) {
    const at = eventTimeMs(event.created_at);
    const day = loadDay(dayKey(at));
    dirtyDays.add(dayKey(at));
    const hour = loadHour(hourNumber(at));
    dirtyHours.add(hourNumber(at));

    const isSessionStart = event.name === 'session_start';
    const isSessionEnd = event.name === 'session_end';
    addToRollup(day, event, isSessionStart, isSessionEnd);
    addToRollup(hour, event, isSessionStart, isSessionEnd);
    live.add(event, clock.now());

    const name = nameDeltas.get(event.name) ?? { count: 0, lastSeen: 0 };
    name.count += 1;
    name.lastSeen = Math.max(name.lastSeen, at);
    nameDeltas.set(event.name, name);
    recordDimensions(event, at, isSessionStart, isSessionEnd);

    const isIdentified =
      event.profile_id && event.profile_id !== event.device_id;
    if (isIdentified && (isSessionStart || isSessionEnd)) {
      const previous = dirtyProfiles.get(event.profile_id);
      dirtyProfiles.set(event.profile_id, {
        body: profileBody(event),
        lastSeen: Math.max(at, previous?.lastSeen ?? 0),
        insertOnly: isSessionStart && (previous?.insertOnly ?? true),
      });
    }
  }

  // -- group commit -------------------------------------------------------------

  function append(event: IClickhouseEvent, bytes: number) {
    assertUsable();
    if (
      pending.events.length > 0 &&
      pending.bytes + bytes > MAX_CHUNK_RAW_BYTES
    ) {
      flush().catch(() => undefined);
    }
    pending.events.push(event);
    pending.bytes += bytes;
    const isFull =
      pending.events.length >= commitMaxEvents ||
      pending.bytes >= MAX_CHUNK_RAW_BYTES;
    if (isFull) {
      flush().catch(() => undefined);
      return;
    }
    if (commitTimer === null) {
      commitTimer = clock.setTimeout(() => {
        commitTimer = null;
        flush().catch(() => undefined);
      }, commitMaxDelayMs);
    }
  }

  async function writeBatch(id: number, batch: PendingBatch) {
    try {
      const sessionActivity: number[] = [];
      for (const [index, event] of batch.events.entries()) {
        if (sessionActivityEvents.has(event)) {
          sessionActivity.push(index);
        }
      }
      const chunkBody: ChunkBody = { events: batch.events, sessionActivity };
      const body = await codec.compress(
        textEncoder.encode(JSON.stringify(chunkBody))
      );
      let tsMin = Number.POSITIVE_INFINITY;
      let tsMax = Number.NEGATIVE_INFINITY;
      for (const event of batch.events) {
        const at = eventTimeMs(event.created_at);
        tsMin = Math.min(tsMin, at);
        tsMax = Math.max(tsMax, at);
      }
      sql.exec(
        'INSERT INTO chunks (id, ts_min, ts_max, n, body) VALUES (?, ?, ?, ?, ?)',
        id,
        tsMin,
        tsMax,
        batch.events.length,
        body
      );
      for (const event of batch.events) {
        applyCommitted(event);
      }
      watermarkCandidate = id;
      batch.resolve();
    } catch (error) {
      breakEngine(error);
      batch.reject(error);
      throw error;
    } finally {
      inflight.delete(id);
    }
  }

  /** After a failed write nothing more is stored; every waiter hears why. */
  function breakEngine(error: unknown) {
    broken ??= error;
    if (commitTimer !== null) {
      clock.clearTimeout(commitTimer);
      commitTimer = null;
    }
    pending.reject(broken);
  }

  /** Writes whatever is pending now; serialised so chunk ids stay in order. */
  function flush(): Promise<void> {
    if (commitTimer !== null) {
      clock.clearTimeout(commitTimer);
      commitTimer = null;
    }
    if (pending.events.length === 0) {
      return flushChain;
    }
    const batch = pending;
    pending = createDeferred();
    const id = nextChunkId++;
    inflight.set(id, batch.events);
    // A failed write must not strand the batches queued behind it.
    flushChain = flushChain
      .catch(() => undefined)
      .then(() => {
        if (broken) {
          inflight.delete(id);
          batch.reject(broken);
          throw broken;
        }
        return writeBatch(id, batch);
      });
    return flushChain;
  }

  /** Resolves once every event appended so far is stored. */
  function sync(): Promise<void> {
    assertUsable();
    if (pending.events.length > 0) {
      return pending.committed;
    }
    return flushChain;
  }

  // -- checkpoint ---------------------------------------------------------------

  function isCheckpointedSession(live: LiveSession, now: number): boolean {
    return now - live.startedAt >= sessionCheckpointAgeMs;
  }

  /**
   * Old sessions are written; young ones stay dirty and are rebuilt on
   * restart from the session floor, the first chunk any of them touched.
   */
  /** Devices whose session already counts an event that is not appended yet. */
  function devicesAheadOfChunks(now: number): Set<string> {
    const devices = new Set<string>();
    for (const [key, marker] of ingestMarkers) {
      if (now - marker.at > INGEST_MARKER_TTL_MS) {
        ingestMarkers.delete(key);
        continue;
      }
      devices.add(marker.deviceId);
    }
    return devices;
  }

  function writeSessions(now: number): number {
    let floor = watermarkCandidate + 1;
    const written: string[] = [];
    const aheadOfChunks = devicesAheadOfChunks(now);
    for (const deviceId of dirtySessions) {
      const live = sessions.get(deviceId);
      if (!live) {
        continue;
      }
      // A session counting an unstored event is rebuilt from chunks instead,
      // so a restart cannot count that event twice.
      if (aheadOfChunks.has(deviceId) || !isCheckpointedSession(live, now)) {
        floor = Math.min(floor, live.firstChunkId);
        if (persistedSessions.has(deviceId)) {
          sql.exec('DELETE FROM sessions WHERE device_id = ?', deviceId);
          persistedSessions.delete(deviceId);
        }
        continue;
      }
      sql.exec(
        'INSERT INTO sessions (device_id, ended_at, body) VALUES (?, ?, ?) ON CONFLICT (device_id) DO UPDATE SET ended_at = excluded.ended_at, body = excluded.body',
        deviceId,
        fromClickhouseDate(live.session.ended_at).getTime(),
        JSON.stringify(live)
      );
      persistedSessions.set(deviceId, live.session.id);
      written.push(deviceId);
    }
    for (const [deviceId, sessionId] of persistedSessions) {
      if (sessions.get(deviceId)?.session.id === sessionId) {
        continue;
      }
      sql.exec('DELETE FROM sessions WHERE device_id = ?', deviceId);
      persistedSessions.delete(deviceId);
    }
    for (const deviceId of written) {
      dirtySessions.delete(deviceId);
    }
    return floor;
  }

  function writeCheckpoint(now: number) {
    sessionFloor = writeSessions(now);
    writeRollups();
    sql.exec(
      'INSERT INTO meta (k, v) VALUES (?, ?), (?, ?), (?, ?) ON CONFLICT (k) DO UPDATE SET v = excluded.v',
      META_WATERMARK,
      String(watermarkCandidate),
      META_CHECKPOINT_AT,
      String(now),
      META_SESSION_FLOOR,
      String(sessionFloor)
    );
  }

  /** Rollups, event names, dimension counts and profiles touched since the last write. */
  function writeRollups() {
    for (const day of dirtyDays) {
      const rollup = days.get(day);
      if (!rollup) {
        continue;
      }
      sql.exec(
        'INSERT INTO daily (day, visitors, sessions, bounces, duration_ms, screen_views, events, revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (day) DO UPDATE SET visitors = excluded.visitors, sessions = excluded.sessions, bounces = excluded.bounces, duration_ms = excluded.duration_ms, screen_views = excluded.screen_views, events = excluded.events, revenue = excluded.revenue',
        day,
        rollup.visitors.toBytes(),
        rollup.sessions,
        rollup.bounces,
        rollup.durationMs,
        rollup.screenViews,
        rollup.events,
        rollup.revenue
      );
    }
    for (const [name, delta] of nameDeltas) {
      sql.exec(
        'INSERT INTO event_names (name, count, last_seen) VALUES (?, ?, ?) ON CONFLICT (name) DO UPDATE SET count = count + excluded.count, last_seen = max(last_seen, excluded.last_seen)',
        name,
        delta.count,
        delta.lastSeen
      );
    }
    for (const [key, delta] of dimDeltas) {
      const [day, dim, value] = key.split(DIM_KEY_SEPARATOR);
      sql.exec(
        'INSERT INTO dims (day, dim, value, sessions, pageviews, revenue) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (day, dim, value) DO UPDATE SET sessions = sessions + excluded.sessions, pageviews = pageviews + excluded.pageviews, revenue = revenue + excluded.revenue',
        day ?? '',
        dim ?? '',
        value ?? '',
        delta.sessions,
        delta.pageviews,
        delta.revenue
      );
    }
    for (const hour of dirtyHours) {
      const rollup = hours.get(hour);
      if (!rollup) {
        continue;
      }
      sql.exec(
        'INSERT INTO hourly (hour, visitors, sessions, bounces, duration_ms, screen_views, events, revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (hour) DO UPDATE SET visitors = excluded.visitors, sessions = excluded.sessions, bounces = excluded.bounces, duration_ms = excluded.duration_ms, screen_views = excluded.screen_views, events = excluded.events, revenue = excluded.revenue',
        hour,
        rollup.visitors.toBytes(),
        rollup.sessions,
        rollup.bounces,
        rollup.durationMs,
        rollup.screenViews,
        rollup.events,
        rollup.revenue
      );
    }
    for (const [key, delta] of dimHourDeltas) {
      const [hour, dim, value] = key.split(DIM_KEY_SEPARATOR);
      sql.exec(
        'INSERT INTO dims_h (dim, hour, value, sessions, pageviews, revenue) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (dim, hour, value) DO UPDATE SET sessions = sessions + excluded.sessions, pageviews = pageviews + excluded.pageviews, revenue = revenue + excluded.revenue',
        dim ?? '',
        Number(hour),
        value ?? '',
        delta.sessions,
        delta.pageviews,
        delta.revenue
      );
    }
    for (const [id, profile] of dirtyProfiles) {
      const onConflict = profile.insertOnly
        ? 'DO NOTHING'
        : 'DO UPDATE SET body = excluded.body, last_seen = max(last_seen, excluded.last_seen)';
      sql.exec(
        `INSERT INTO profiles (id, body, last_seen) VALUES (?, ?, ?) ON CONFLICT (id) ${onConflict}`,
        id,
        JSON.stringify(profile.body),
        profile.lastSeen
      );
    }
  }

  function clearCheckpointedState() {
    dirtyDays.clear();
    days.clear();
    dirtyHours.clear();
    hours.clear();
    dimHourDeltas.clear();
    nameDeltas.clear();
    dimDeltas.clear();
    dirtyProfiles.clear();
  }

  function hasUncheckpointedState(): boolean {
    const hasDroppedSession = [...persistedSessions].some(
      ([deviceId, sessionId]) =>
        sessions.get(deviceId)?.session.id !== sessionId
    );
    return (
      watermarkCandidate > watermark ||
      dirtySessions.size > 0 ||
      hasDroppedSession
    );
  }

  /**
   * Snapshots in-memory state with the watermark of the last stored chunk.
   * Every event the state reflects must be stored first, so pending writes
   * are drained and the snapshot runs with no await in between.
   */
  async function checkpoint(): Promise<boolean> {
    assertUsable();
    for (let round = 0; round < CHECKPOINT_MAX_FLUSH_ROUNDS; round++) {
      await flush();
      if (pending.events.length === 0 && inflight.size === 0) {
        const now = clock.now();
        sql.transaction(() => writeCheckpoint(now));
        watermark = watermarkCandidate;
        lastCheckpointAt = now;
        clearCheckpointedState();
        return true;
      }
    }
    return false;
  }

  // -- open / replay ------------------------------------------------------------

  function readMeta(key: string): string | undefined {
    const [row] = sql.exec('SELECT v FROM meta WHERE k = ?', key);
    return row ? String(row.v) : undefined;
  }

  async function decodeChunk(body: SqlValue | undefined): Promise<ChunkBody> {
    const bytes = await codec.decompress(toBytes(body));
    return parseChunkBody(textDecoder.decode(bytes));
  }

  /**
   * Recounts every rollup from the stored chunks up to `throughChunk` (the
   * rest is replayed by `restore`). Rollups of days whose chunks retention
   * already deleted are lost, so this runs only on a schema upgrade.
   */
  async function rebuildRollups(throughChunk: number) {
    for (const table of ['daily', 'dims', 'event_names', 'hourly', 'dims_h']) {
      sql.exec(`DELETE FROM ${table}`);
    }
    let after = 0;
    for (;;) {
      const rows = sql.exec(
        'SELECT id, body FROM chunks WHERE id > ? AND id <= ? ORDER BY id LIMIT ?',
        after,
        throughChunk,
        CHUNK_READ_BATCH
      );
      if (rows.length === 0) {
        break;
      }
      for (const row of rows) {
        const { events } = await decodeChunk(row.body);
        for (const event of events) {
          applyCommitted(event);
        }
        after = toNumber(row.id);
      }
      // Bounded memory: deltas are additive and rollups reload from their rows.
      sql.transaction(() => writeRollups());
      clearCheckpointedState();
    }
    sessionPages.clear();
    sessionViews.clear();
  }

  async function restore() {
    for (const statement of SCHEMA) {
      sql.exec(statement);
    }
    const version = readMeta(META_SCHEMA_VERSION);
    watermark = Number(readMeta(META_WATERMARK) ?? 0);
    watermarkCandidate = watermark;
    lastCheckpointAt = Number(readMeta(META_CHECKPOINT_AT) ?? clock.now());

    if (version !== undefined && Number(version) < SCHEMA_VERSION) {
      await rebuildRollups(watermark);
    }
    if (version === undefined || Number(version) < SCHEMA_VERSION) {
      sql.exec(
        'INSERT INTO meta (k, v) VALUES (?, ?) ON CONFLICT (k) DO UPDATE SET v = excluded.v',
        META_SCHEMA_VERSION,
        String(SCHEMA_VERSION)
      );
    }

    for (const row of sql.exec('SELECT body FROM sessions')) {
      const live = JSON.parse(String(row.body)) as LiveSession;
      putSession(live.session, live);
      persistedSessions.set(live.session.device_id, live.session.id);
    }
    dirtySessions.clear();

    // Pruning can delete every chunk up to the watermark; ids must still
    // never go back below it, or new chunks would be skipped by replay.
    const [last] = sql.exec('SELECT max(id) AS id FROM chunks');
    nextChunkId = Math.max(toNumber(last?.id), watermark) + 1;

    sessionFloor = Number(readMeta(META_SESSION_FLOOR) ?? watermark + 1);
    const restoredDevices = new Set(persistedSessions.keys());
    let after = Math.min(sessionFloor - 1, watermark);
    for (;;) {
      const rows = sql.exec(
        'SELECT id, body FROM chunks WHERE id > ? ORDER BY id LIMIT ?',
        after,
        CHUNK_READ_BATCH
      );
      if (rows.length === 0) {
        break;
      }
      for (const row of rows) {
        const id = toNumber(row.id);
        const isAfterWatermark = id > watermark;
        const { events, sessionActivity } = await decodeChunk(row.body);
        const activity = new Set(sessionActivity);
        for (const [index, event] of events.entries()) {
          const isActivity = activity.has(index);
          if (isAfterWatermark) {
            applyCommitted(event);
            replaySessionEvent(event, id, isActivity);
          } else if (!restoredDevices.has(event.device_id)) {
            replaySessionEvent(event, id, isActivity);
          }
        }
        after = id;
        watermarkCandidate = Math.max(watermarkCandidate, id);
      }
    }
  }

  // -- reads ----------------------------------------------------------------------

  async function chunkEvents(id: number, body: SqlValue | undefined) {
    const cached = chunkCache.get(id);
    if (cached) {
      return cached;
    }
    const { events } = await decodeChunk(body);
    chunkCache.set(id, events);
    if (chunkCache.size > CHUNK_CACHE_SIZE) {
      const oldest = chunkCache.keys().next().value;
      if (oldest !== undefined) {
        chunkCache.delete(oldest);
      }
    }
    return events;
  }

  function memoryChunks(): [number, IClickhouseEvent[]][] {
    const chunks: [number, IClickhouseEvent[]][] = [];
    if (pending.events.length > 0) {
      chunks.push([nextChunkId, pending.events]);
    }
    const flushing = [...inflight.entries()].sort(([a], [b]) => b - a);
    return [...chunks, ...flushing];
  }

  async function listEvents(
    query: ListEventsQuery = {}
  ): Promise<ListEventsPage> {
    const take = Math.min(
      Math.max(1, query.take ?? LIST_EVENTS_PAGE_SIZE),
      LIST_EVENTS_MAX_PAGE_SIZE
    );
    const range = {
      fromMs: query.startDate?.getTime() ?? Number.NEGATIVE_INFINITY,
      toMs: query.endDate?.getTime() ?? Number.POSITIVE_INFINITY,
    };
    const cursor = parseCursor(query.cursor);
    const page: IClickhouseEvent[] = [];

    const collect = (id: number, events: IClickhouseEvent[]): string | null => {
      for (let index = events.length - 1; index >= 0; index--) {
        const isAfterCursor =
          id > cursor.chunk || (id === cursor.chunk && index >= cursor.index);
        const event = events[index];
        if (isAfterCursor || !event || !matchesQuery(event, query, range)) {
          continue;
        }
        page.push(event);
        if (page.length === take) {
          return `${id}:${index}`;
        }
      }
      return null;
    };

    let lowestMemoryId = Number.POSITIVE_INFINITY;
    for (const [id, events] of memoryChunks()) {
      lowestMemoryId = Math.min(lowestMemoryId, id);
      const next = collect(id, events);
      if (next) {
        return { events: byTimeDesc(page), cursor: next };
      }
    }

    let before = Math.min(lowestMemoryId, cursor.chunk + 1);
    let scanned = 0;
    while (scanned < LIST_EVENTS_MAX_CHUNKS) {
      const rows = sql.exec(
        'SELECT id, body FROM chunks WHERE id < ? AND ts_max >= ? AND ts_min <= ? ORDER BY id DESC LIMIT ?',
        Number.isFinite(before) ? before : Number.MAX_SAFE_INTEGER,
        Number.isFinite(range.fromMs) ? range.fromMs : Number.MIN_SAFE_INTEGER,
        Number.isFinite(range.toMs) ? range.toMs : Number.MAX_SAFE_INTEGER,
        CHUNK_READ_BATCH
      );
      if (rows.length === 0) {
        return { events: byTimeDesc(page), cursor: null };
      }
      for (const row of rows) {
        const id = toNumber(row.id);
        const next = collect(id, await chunkEvents(id, row.body));
        if (next) {
          return { events: byTimeDesc(page), cursor: next };
        }
        before = id;
        scanned += 1;
      }
    }
    // Scan budget spent: hand back what we have and resume below this chunk.
    return { events: byTimeDesc(page), cursor: `${before}:0` };
  }

  function rollupsSince(fromDay: string): Map<string, DailyRollup> {
    const rollups = new Map<string, DailyRollup>();
    for (const row of sql.exec(
      'SELECT * FROM daily WHERE day >= ? ORDER BY day',
      fromDay
    )) {
      const day = String(row.day);
      rollups.set(day, {
        visitors: HyperLogLog.fromBytes(toBytes(row.visitors)),
        sessions: toNumber(row.sessions),
        bounces: toNumber(row.bounces),
        durationMs: toNumber(row.duration_ms),
        screenViews: toNumber(row.screen_views),
        events: toNumber(row.events),
        revenue: toNumber(row.revenue),
      });
    }
    for (const [day, rollup] of days) {
      if (day >= fromDay) {
        rollups.set(day, rollup);
      }
    }
    return rollups;
  }

  function visitorsBetween(
    rollups: Map<string, DailyRollup>,
    fromDay: string,
    toDay: string
  ): number {
    const merged = new HyperLogLog();
    for (const [day, rollup] of rollups) {
      if (day >= fromDay && day <= toDay) {
        merged.merge(rollup.visitors);
      }
    }
    return merged.count();
  }

  function dailyStats(from: Date, to: Date): DailyStats[] {
    const fromDay = dayKey(from.getTime());
    const toDay = dayKey(to.getTime());
    const stats: DailyStats[] = [];
    for (const [day, rollup] of rollupsSince(fromDay)) {
      if (day > toDay) {
        continue;
      }
      stats.push({
        day,
        visitors: rollup.visitors.count(),
        sessions: rollup.sessions,
        bounces: rollup.bounces,
        durationMs: rollup.durationMs,
        screenViews: rollup.screenViews,
        events: rollup.events,
        revenue: rollup.revenue,
      });
    }
    return stats.sort((a, b) => a.day.localeCompare(b.day));
  }

  /** Distinct visitors over the UTC days `from`..`to`: the daily sketches merged. */
  function rangeVisitors(from: Date, to: Date): number {
    const toDay = dayKey(to.getTime());
    const merged = new HyperLogLog();
    for (const [day, rollup] of rollupsSince(dayKey(from.getTime()))) {
      if (day <= toDay) {
        merged.merge(rollup.visitors);
      }
    }
    return merged.count();
  }

  /** Visitors and revenue as the dashboard's project card shows them, by UTC day. */
  function projectCard(): ProjectCard {
    const now = clock.now();
    const today = dayKey(now);
    const yesterday = dayKey(now - DAY_MS);
    const chartFrom = monthsBefore(now, CARD_CHART_MONTHS);
    const historyFrom = dayKey(monthsBefore(now, CARD_HISTORY_MONTHS));
    const rollups = rollupsSince(historyFrom);

    const chart: ProjectCard['chart'] = [];
    for (let at = chartFrom; dayKey(at) <= today; at += DAY_MS) {
      const day = dayKey(at);
      const rollup = rollups.get(day);
      chart.push({
        date: day,
        value: rollup ? rollup.visitors.count() : 0,
        revenue: rollup?.revenue ?? 0,
      });
    }

    let revenue = 0;
    for (const rollup of rollups.values()) {
      revenue += rollup.revenue;
    }
    const chartFromDay = dayKey(chartFrom);
    return {
      chart,
      metrics: {
        months_3: visitorsBetween(rollups, chartFromDay, today),
        months_3_prev: visitorsBetween(
          rollups,
          historyFrom,
          dayKey(chartFrom - DAY_MS)
        ),
        month: visitorsBetween(rollups, dayKey(monthsBefore(now, 1)), today),
        day: visitorsBetween(rollups, today, today),
        day_prev: visitorsBetween(rollups, yesterday, yesterday),
        revenue,
      },
    };
  }

  function eventNames(): { name: string; count: number; lastSeen: number }[] {
    const names = new Map<string, { count: number; lastSeen: number }>();
    for (const row of sql.exec(
      'SELECT name, count, last_seen FROM event_names'
    )) {
      names.set(String(row.name), {
        count: toNumber(row.count),
        lastSeen: toNumber(row.last_seen),
      });
    }
    for (const [name, delta] of nameDeltas) {
      const stored = names.get(name) ?? { count: 0, lastSeen: 0 };
      names.set(name, {
        count: stored.count + delta.count,
        lastSeen: Math.max(stored.lastSeen, delta.lastSeen),
      });
    }
    return [...names.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }

  // -- range reads ----------------------------------------------------------------
  // Ranges are real instants (the service resolves the project's timezone);
  // whole UTC days read daily rows and the edges read hourly rows.

  function rangeCounts(cover: HourDayCover): RangeTotals {
    const totals = emptyTotals();
    if (cover.days) {
      const [fromDay, toDay] = cover.days;
      const seen = new Set<string>();
      for (const row of sql.exec(
        'SELECT * FROM daily WHERE day >= ? AND day <= ?',
        fromDay,
        toDay
      )) {
        const day = String(row.day);
        seen.add(day);
        addTotals(totals, days.get(day) ?? rollupFromRow(row));
      }
      for (const [day, rollup] of days) {
        if (!seen.has(day) && day >= fromDay && day <= toDay) {
          addTotals(totals, rollup);
        }
      }
    }
    for (const [fromHour, toHour] of cover.hours) {
      const seen = new Set<number>();
      for (const row of sql.exec(
        'SELECT * FROM hourly WHERE hour >= ? AND hour < ?',
        fromHour,
        toHour
      )) {
        const hour = toNumber(row.hour);
        seen.add(hour);
        addTotals(totals, hours.get(hour) ?? rollupFromRow(row));
      }
      for (const [hour, rollup] of hours) {
        if (!seen.has(hour) && hour >= fromHour && hour < toHour) {
          addTotals(totals, rollup);
        }
      }
    }
    return totals;
  }

  /**
   * Overview numbers for `from`..`to` (inclusive, epoch ms) and a series by
   * `interval` in `timezone`. Minute series (ranges up to a day) are counted
   * from the raw events; everything else from rollups.
   */
  async function metrics(query: MetricsQuery): Promise<MetricsResult> {
    const end = query.to + 1;
    const isMinute =
      query.interval === 'minute' && end - query.from <= MAX_MINUTE_RANGE_MS;
    const interval =
      query.interval === 'minute' && !isMinute ? 'hour' : query.interval;
    if (isMinute || query.filters?.length) {
      return rawMetrics(
        query.from,
        query.to,
        buildBuckets(query.from, query.to, interval, query.timezone),
        query.filters
      );
    }
    const series = buildBuckets(
      query.from,
      query.to,
      interval,
      query.timezone
    ).map((bucket) => {
      const from = Math.max(bucket.start, query.from);
      const to = Math.min(bucket.end, end);
      return {
        start: bucket.start,
        ...withOpenSessions(
          toStats(rangeCounts(coverWithHoursAndDays(from, to))),
          from,
          to
        ),
      };
    });
    return {
      totals: withOpenSessions(
        toStats(rangeCounts(coverWithHoursAndDays(query.from, end))),
        query.from,
        end
      ),
      series,
    };
  }

  /**
   * Bounces and time of sessions still open, which the rollups only get at
   * session end: OpenPanel's sessions table shows them while they run.
   */
  function withOpenSessions(
    stats: RangeStats,
    from: number,
    to: number
  ): RangeStats {
    let bounces = 0;
    let durationMs = 0;
    for (const { session } of sessions.values()) {
      const at = eventTimeMs(session.created_at);
      if (at < from || at >= to) {
        continue;
      }
      bounces += session.is_bounce ? 1 : 0;
      durationMs += Math.max(0, session.duration ?? 0);
    }
    return {
      ...stats,
      bounces: stats.bounces + bounces,
      durationMs: stats.durationMs + durationMs,
    };
  }

  /**
   * `metrics` counted from the stored events, for minute series and filters,
   * as ClickHouse's filtered overview counts them: visitors, sessions and
   * views from the page views that match; revenue and events from matching
   * events; bounce rate and duration from those sessions (open ones too).
   */
  async function rawMetrics(
    from: number,
    to: number,
    buckets: { start: number; end: number }[],
    filters: RowFilter[] | undefined
  ): Promise<MetricsResult> {
    interface Point {
      people: Set<string>;
      sessions: Set<string>;
      screenViews: number;
      events: number;
      revenue: number;
    }
    const fresh = (): Point => ({
      people: new Set<string>(),
      sessions: new Set<string>(),
      screenViews: 0,
      events: 0,
      revenue: 0,
    });
    const points = buckets.map((bucket) => ({ ...bucket, value: fresh() }));
    const total = fresh();
    const seen = new Map<
      string,
      { first: number; last: number; views: number; bounce?: boolean }
    >();
    const complete = await scanRange(from, to, (event, at) => {
      if (event.session_id) {
        const session = seen.get(event.session_id) ?? {
          first: at,
          last: at,
          views: 0,
        };
        session.first = Math.min(session.first, at);
        session.last = Math.max(session.last, at);
        if (event.name === 'screen_view') {
          session.views += 1;
        }
        if (event.name === 'session_end') {
          session.bounce = isBounce(event);
        }
        seen.set(event.session_id, session);
      }
      if (filters?.length && !matchesFilters(eventFilterRow(event), filters)) {
        return;
      }
      const point = findBucket(points, at)?.value;
      for (const target of point ? [total, point] : [total]) {
        if (event.name === 'screen_view') {
          target.screenViews += 1;
          target.events += 1;
          if (event.profile_id) {
            target.people.add(event.profile_id);
          }
          if (event.session_id) {
            target.sessions.add(event.session_id);
          }
        } else if (
          event.name !== 'session_start' &&
          event.name !== 'session_end'
        ) {
          target.events += 1;
          target.revenue += event.revenue ?? 0;
        }
      }
    });
    const stats = (point: Point): RangeStats => {
      let bounces = 0;
      let durationMs = 0;
      for (const id of point.sessions) {
        const session = seen.get(id);
        if (!session) {
          continue;
        }
        bounces += (session.bounce ?? session.views <= 1) ? 1 : 0;
        durationMs += session.last - session.first;
      }
      return {
        visitors: point.people.size,
        sessions: point.sessions.size,
        bounces,
        durationMs,
        screenViews: point.screenViews,
        events: point.events,
        revenue: point.revenue,
      };
    };
    return {
      totals: stats(total),
      series: points.map((point) => ({
        start: point.start,
        ...stats(point.value),
      })),
      ...(complete ? {} : { partial: true }),
    };
  }

  /**
   * Calls `visit` for every stored or pending event with `created_at` in
   * `from`..`to`, newest chunks last. Stops after `maxChunks` stored chunks.
   */
  async function scanRange(
    rangeFrom: number,
    to: number,
    visit: (event: IClickhouseEvent, at: number) => void,
    maxChunks = SCAN_MAX_CHUNKS
  ): Promise<boolean> {
    // Before the cold store's cutoff, events come from the archive only; the
    // chunks still hold some of them, so they are skipped there.
    let from = rangeFrom;
    let coldComplete = true;
    const cutoff = cold?.before();
    if (cold && cutoff !== undefined && from < cutoff) {
      const coldTo = Math.min(to, cutoff - 1);
      coldComplete = await cold.scan(from, coldTo, (event) => {
        const at = eventTimeMs(event.created_at);
        if (at >= from && at <= coldTo) {
          visit(event, at);
        }
      });
      from = cutoff;
      if (from > to) {
        return coldComplete;
      }
    }
    const visitEvents = (events: IClickhouseEvent[]) => {
      for (const event of events) {
        const at = eventTimeMs(event.created_at);
        if (at >= from && at <= to) {
          visit(event, at);
        }
      }
    };
    const inMemory = memoryChunks();
    const memoryIds = new Set(inMemory.map(([id]) => id));
    let after = 0;
    let scanned = 0;
    while (scanned < maxChunks) {
      const rows = sql.exec(
        'SELECT id, body FROM chunks WHERE id > ? AND ts_max >= ? AND ts_min <= ? ORDER BY id LIMIT ?',
        after,
        from,
        to,
        CHUNK_READ_BATCH
      );
      if (rows.length === 0) {
        break;
      }
      for (const row of rows) {
        const id = toNumber(row.id);
        after = id;
        scanned += 1;
        if (!memoryIds.has(id)) {
          visitEvents(await chunkEvents(id, row.body));
        }
      }
    }
    for (const [, events] of inMemory.reverse()) {
      visitEvents(events);
    }
    return coldComplete && scanned < maxChunks;
  }

  /** Top values of a dimension recounted from stored events matching `filters`. */
  async function rawTopDimension(
    dim: Dimension,
    from: number,
    to: number,
    filters: RowFilter[]
  ): Promise<Map<string, DimensionDelta>> {
    // As ClickHouse's filtered lists count them: the sessions are those with
    // a matching page view (a page filter included), views are matching page
    // views, revenue is matching events'; entry and exit pages are those
    // sessions' first and last pages with all their page views.
    const totals = new Map<string, DimensionDelta>();
    const valueSessions = new Map<string, Set<string>>();
    const isSessionDim = (SESSION_DIMENSIONS as readonly string[]).includes(
      dim
    );
    const isEdgeDim = dim === 'entry' || dim === 'exit';
    const edges = new Map<
      string,
      { entry?: string; exit?: string; views: number; matched: boolean }
    >();
    const valueOf = (event: IClickhouseEvent): string | null => {
      if (isSessionDim) {
        return sessionDimensionValue(event, dim as SessionDimension);
      }
      return event.path ? pageValue(event) : null;
    };
    await scanRange(from, to, (event) => {
      const isView = event.name === 'screen_view';
      const matches = matchesFilters(eventFilterRow(event), filters);
      if (isEdgeDim && event.session_id) {
        const session = edges.get(event.session_id) ?? {
          views: 0,
          matched: false,
        };
        const page = event.path ? pageValue(event) : undefined;
        if (event.name === 'session_start' && page) {
          session.entry = page;
        } else if (event.name === 'session_end' && page) {
          session.exit = page;
        } else if (isView && page) {
          session.entry ??= page;
          session.exit = page;
          session.views += 1;
          session.matched ||= matches;
        }
        edges.set(event.session_id, session);
        return;
      }
      if (!matches || event.name === 'session_start') {
        return;
      }
      if (event.name === 'session_end') {
        return;
      }
      const revenue = event.revenue ?? 0;
      if (!(isView || revenue)) {
        return;
      }
      const value = valueOf(event);
      if (value === null) {
        return;
      }
      let firstInSession = false;
      if (isView && event.session_id) {
        const seen = valueSessions.get(value) ?? new Set<string>();
        firstInSession = !seen.has(event.session_id);
        seen.add(event.session_id);
        valueSessions.set(value, seen);
      }
      addDelta(totals, value, {
        sessions: firstInSession ? 1 : 0,
        pageviews: isView ? 1 : 0,
        revenue,
      });
    });
    for (const session of edges.values()) {
      const page = dim === 'entry' ? session.entry : session.exit;
      if (session.matched && page) {
        addDelta(totals, page, {
          sessions: 1,
          pageviews: session.views,
          revenue: 0,
        });
      }
    }
    return totals;
  }

  /** One dimension's totals per UTC day (`YYYY-MM-DD`), stored and pending. */
  function dimensionDays(
    dim: Dimension,
    fromDay: string,
    toDay: string
  ): DimensionDayRow[] {
    const totals = new Map<string, DimensionDelta>();
    for (const row of sql.exec(
      'SELECT day, value, sessions, pageviews, revenue FROM dims WHERE dim = ? AND day >= ? AND day <= ?',
      dim,
      fromDay,
      toDay
    )) {
      addDelta(
        totals,
        `${String(row.day)}${DIM_KEY_SEPARATOR}${String(row.value)}`,
        {
          sessions: toNumber(row.sessions),
          pageviews: toNumber(row.pageviews),
          revenue: toNumber(row.revenue),
        }
      );
    }
    for (const [key, delta] of dimDeltas) {
      const [day = '', deltaDim, value = ''] = key.split(DIM_KEY_SEPARATOR);
      if (deltaDim === dim && day >= fromDay && day <= toDay) {
        addDelta(totals, `${day}${DIM_KEY_SEPARATOR}${value}`, delta);
      }
    }
    return [...totals.entries()].map(([key, delta]) => {
      const [day = '', value = ''] = key.split(DIM_KEY_SEPARATOR);
      const split = value.indexOf(DIM_PREFIX_SEPARATOR);
      return {
        day,
        ...(split >= 0
          ? { prefix: value.slice(0, split), name: value.slice(split + 1) }
          : { name: value }),
        ...delta,
      };
    });
  }

  /** Top values of one dimension over `from`..`to` (inclusive instants). */
  async function topDimension(
    dim: Dimension,
    from: Date,
    to: Date,
    limit = DEFAULT_TOP_LIMIT,
    filters: RowFilter[] = []
  ): Promise<DimensionRow[]> {
    if (filters.length > 0) {
      return rankDimension(
        await rawTopDimension(dim, from.getTime(), to.getTime(), filters),
        limit
      );
    }
    const cover = coverWithHoursAndDays(from.getTime(), to.getTime() + 1);
    const totals = new Map<string, DimensionDelta>();
    const add = (value: string, delta: DimensionDelta) =>
      addDelta(totals, value, delta);
    const rowDelta = (row: SqlRow): DimensionDelta => ({
      sessions: toNumber(row.sessions),
      pageviews: toNumber(row.pageviews),
      revenue: toNumber(row.revenue),
    });
    if (cover.days) {
      const [fromDay, toDay] = cover.days;
      for (const row of sql.exec(
        'SELECT value, sum(sessions) AS sessions, sum(pageviews) AS pageviews, sum(revenue) AS revenue FROM dims WHERE dim = ? AND day >= ? AND day <= ? GROUP BY value',
        dim,
        fromDay,
        toDay
      )) {
        add(String(row.value), rowDelta(row));
      }
      for (const [key, delta] of dimDeltas) {
        const [day = '', deltaDim, value = ''] = key.split(DIM_KEY_SEPARATOR);
        if (deltaDim === dim && day >= fromDay && day <= toDay) {
          add(value, delta);
        }
      }
    }
    for (const [fromHour, toHour] of cover.hours) {
      for (const row of sql.exec(
        'SELECT value, sum(sessions) AS sessions, sum(pageviews) AS pageviews, sum(revenue) AS revenue FROM dims_h WHERE dim = ? AND hour >= ? AND hour < ? GROUP BY value',
        dim,
        fromHour,
        toHour
      )) {
        add(String(row.value), rowDelta(row));
      }
      for (const [key, delta] of dimHourDeltas) {
        const [hour = '', deltaDim, value = ''] = key.split(DIM_KEY_SEPARATOR);
        const at = Number(hour);
        if (deltaDim === dim && at >= fromHour && at < toHour) {
          add(value, delta);
        }
      }
    }
    return rankDimension(totals, limit);
  }

  function rankDimension(
    totals: Map<string, DimensionDelta>,
    limit: number
  ): DimensionRow[] {
    return [...totals.entries()]
      .map(([value, delta]) => {
        const split = value.indexOf(DIM_PREFIX_SEPARATOR);
        return split >= 0
          ? {
              prefix: value.slice(0, split),
              name: value.slice(split + 1),
              ...delta,
            }
          : { name: value, ...delta };
      })
      .sort(
        (a, b) =>
          b.sessions - a.sessions ||
          b.pageviews - a.pageviews ||
          a.name.localeCompare(b.name)
      )
      .slice(0, Math.max(1, limit));
  }

  /** Report builder series rows (see chart-scan) from the stored events. */
  async function chartRows(
    query: ChartScanQuery,
    lookupProfile?: ProfileLookup
  ): Promise<{ rows: ChartRow[]; partial: boolean }> {
    const accumulator = query.perUser
      ? new DistributionAccumulator(query, lookupProfile)
      : new ChartAccumulator(query, lookupProfile);
    const complete = await scanRange(query.from, query.to, (event, at) =>
      accumulator.add(event, at)
    );
    return {
      rows: accumulator.rows(),
      partial:
        !complete ||
        (accumulator instanceof ChartAccumulator && accumulator.overflowed),
    };
  }

  /** The Pages report's rows from the stored events. */
  async function pageRows(
    query: PagesScanQuery
  ): Promise<{ rows: PageScanRow[]; partial: boolean }> {
    const accumulator = new PagesAccumulator(query);
    const complete = await scanRange(query.from, query.to, (event, at) =>
      accumulator.add(event, at)
    );
    return { rows: accumulator.rows(), partial: !complete };
  }

  /** Page views and sessions per date bucket (the Pages trend column). */
  async function pageSeries(
    query: PageSeriesQuery
  ): Promise<{ rows: PageSeriesRow[]; partial: boolean }> {
    const accumulator = new PageSeriesAccumulator(query);
    const complete = await scanRange(query.from, query.to, (event, at) =>
      accumulator.add(event, at)
    );
    return { rows: accumulator.rows(), partial: !complete };
  }

  /** Event counts grouped by one field. */
  async function eventCounts(
    query: EventCountQuery,
    lookupProfile?: ProfileLookup
  ): Promise<{ rows: EventCountRow[]; partial: boolean }> {
    const accumulator = new EventCountAccumulator(query, lookupProfile);
    const complete = await scanRange(query.from, query.to, (event) =>
      accumulator.add(event)
    );
    return { rows: accumulator.rows(), partial: !complete };
  }

  /** Conversion rows (two-step funnel per day) from the stored events. */
  async function conversionRows(
    query: ConversionScanQuery,
    lookupProfile?: ProfileLookup
  ): Promise<{ rows: ConversionRow[]; partial: boolean }> {
    const accumulator = new ConversionAccumulator(query, lookupProfile);
    const complete = await scanRange(query.from, query.to, (event, at) =>
      accumulator.add(event, at)
    );
    return { rows: accumulator.rows(), partial: !complete };
  }

  /** User flow (Sankey) entries and transitions from the stored events. */
  /**
   * One event by id. `around` (its created_at, as the event drawer sends it)
   * narrows the scan to a few seconds; without it the scan covers `from`
   * (the caller's hot-storage cutoff) to now.
   */
  async function findEvent(
    id: string,
    around: number | undefined,
    from: number
  ): Promise<IClickhouseEvent | null> {
    let found: IClickhouseEvent | null = null;
    const [start, end] =
      around === undefined
        ? [from, clock.now()]
        : [around - FIND_EVENT_SLACK_MS, around + FIND_EVENT_SLACK_MS];
    await scanRange(start, end, (event) => {
      if (!found && event.id === id) {
        found = event;
      }
    });
    return found;
  }

  /** One dimension's totals per bucket (the overview's per-value trends). */
  async function dimensionSeries(
    dim: Dimension,
    buckets: { start: number; end: number }[],
    filters: RowFilter[] = []
  ): Promise<{ start: number; rows: DimensionRow[] }[]> {
    const series: { start: number; rows: DimensionRow[] }[] = [];
    for (const bucket of buckets) {
      series.push({
        start: bucket.start,
        rows: await topDimension(
          dim,
          new Date(bucket.start),
          new Date(bucket.end - 1),
          DIMENSION_SERIES_LIMIT,
          filters
        ),
      });
    }
    return series;
  }

  /** One group's page from its stored events since `from`. */
  async function groupSummary(
    groupId: string,
    from: number
  ): Promise<GroupSummary> {
    const accumulator = new GroupSummaryAccumulator(groupId);
    await scanRange(from, clock.now(), (event) => accumulator.add(event));
    return accumulator.result();
  }

  /** The overview's user journey from the stored page views. */
  async function journeyRows(
    query: JourneyScanQuery
  ): Promise<JourneyScanResult & { partial: boolean }> {
    const accumulator = new JourneyAccumulator(query, eventFilterRow);
    const complete = await scanRange(query.from, query.to, (event, at) =>
      accumulator.add(event, at)
    );
    return { ...accumulator.result(), partial: !complete };
  }

  /**
   * One profile's page from its stored events since `from` (the Durable
   * Object passes its hot-storage cutoff) and its sessions.
   */
  async function profileSummary(
    profileId: string,
    from: number
  ): Promise<ProfileSummary & { sessions: ProfileSessionStats }> {
    const accumulator = new ProfileSummaryAccumulator(profileId);
    await scanRange(from, clock.now(), (event) => accumulator.add(event));
    const ended = listSessions({ profileId, take: SESSION_LIST_MAX_TAKE });
    const durations = ended
      .map((session) => session.duration ?? 0)
      .filter((duration) => duration !== 0)
      .sort((a, b) => a - b);
    const average = durations.length
      ? durations.reduce((sum, value) => sum + value, 0) / durations.length
      : 0;
    // quantileExactInclusive(0.9): linear between the two nearest ranks.
    const rank = (durations.length - 1) * P90;
    const low = durations[Math.floor(rank)] ?? 0;
    const high = durations[Math.ceil(rank)] ?? low;
    const p90 = low + (high - low) * (rank - Math.floor(rank));
    const bounces = ended.filter((session) => session.is_bounce).length;
    return {
      ...accumulator.result(),
      sessions: {
        sessions: ended.length,
        durationAvg: round2(average / MS_PER_SECOND),
        durationP90: round2(p90 / MS_PER_SECOND),
        bounceRate: ended.length ? (bounces / ended.length) * PERCENT : 0,
      },
    };
  }

  async function sankeyRows(
    query: SankeyScanQuery
  ): Promise<SankeyScanResult & { partial: boolean }> {
    const accumulator = new SankeyAccumulator(query);
    const complete = await scanRange(query.from, query.to, (event, at) =>
      accumulator.add(event, at)
    );
    return { ...accumulator.result(), partial: !complete };
  }

  /** Funnel levels (and time to convert) from the stored events. */
  async function funnelRows(
    query: FunnelScanQuery,
    lookupProfile?: ProfileLookup
  ): Promise<FunnelScanResult & { partial: boolean }> {
    const accumulator = new FunnelAccumulator(query, lookupProfile);
    const complete = await scanRange(query.from, query.to, (event, at) =>
      accumulator.add(event, at)
    );
    return { ...accumulator.result(), partial: !complete };
  }

  /** Retention cohorts from the stored events. */
  async function retentionRows(
    query: RetentionScanQuery
  ): Promise<{ rows: RetentionRow[]; partial: boolean }> {
    const accumulator = new RetentionAccumulator(query);
    const periodDays = { day: 1, week: 7, month: 31 }[query.interval];
    const complete = await scanRange(
      query.start,
      query.end + (query.diffInterval + 1) * periodDays * DAY_MS,
      (event, at) => accumulator.add(event, at)
    );
    return { rows: accumulator.rows(), partial: !complete };
  }

  /** Newest events first, from memory and the newest `maxChunks` stored chunks. */
  async function recentEvents(
    maxChunks: number,
    visit: (event: IClickhouseEvent) => boolean | undefined
  ): Promise<void> {
    const inMemory = memoryChunks();
    const memoryIds = new Set(inMemory.map(([id]) => id));
    for (const [, events] of inMemory) {
      for (let index = events.length - 1; index >= 0; index--) {
        const event = events[index];
        if (event && visit(event) === false) {
          return;
        }
      }
    }
    const rows = sql.exec(
      'SELECT id, body FROM chunks ORDER BY id DESC LIMIT ?',
      maxChunks
    );
    for (const row of rows) {
      const id = toNumber(row.id);
      if (memoryIds.has(id)) {
        continue;
      }
      const events = await chunkEvents(id, row.body);
      for (let index = events.length - 1; index >= 0; index--) {
        const event = events[index];
        if (event && visit(event) === false) {
          return;
        }
      }
    }
  }

  /** The Realtime page's reads over the last 30 minutes (see realtime-scan). */
  async function realtime(query: RealtimeQuery): Promise<unknown> {
    const now = clock.now();
    const events: IClickhouseEvent[] = [];
    await scanRange(
      now - LIVE_WINDOW_MS,
      now + MINUTE_MS,
      (event) => {
        if (events.length < REALTIME_MAX_EVENTS) {
          events.push(event);
        }
      },
      LIVE_REBUILD_MAX_CHUNKS
    );
    events.sort(
      (a, b) => eventTimeMs(a.created_at) - eventTimeMs(b.created_at)
    );
    return realtimeFromEvents(events, query, now);
  }

  /** Sessions, visitors and referrers per minute over the last 30 minutes. */
  async function liveData(): Promise<LiveSnapshot> {
    const now = clock.now();
    if (!liveReady) {
      live.clear();
      await scanRange(
        now - LIVE_WINDOW_MS - MINUTE_MS,
        now + MINUTE_MS,
        (event) => live.add(event, now),
        LIVE_REBUILD_MAX_CHUNKS
      );
      liveReady = true;
    }
    return live.snapshot(now);
  }

  // -- sessions page ----------------------------------------------------------------

  function logSession(session: IClickhouseSession) {
    sql.exec(
      'INSERT INTO session_log (id, created_at, profile_id, body) VALUES (?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET created_at = excluded.created_at, profile_id = excluded.profile_id, body = excluded.body',
      session.id,
      eventTimeMs(session.created_at),
      session.profile_id ?? '',
      JSON.stringify(session)
    );
  }

  function sessionAccepts(query: SessionListQuery) {
    const search = query.search?.trim().toLowerCase();
    return (session: IClickhouseSession): boolean => {
      if (query.profileId && session.profile_id !== query.profileId) {
        return false;
      }
      if (!matchesFilters(sessionFilterRow(session), query.filters)) {
        return false;
      }
      if (!search) {
        return true;
      }
      return SESSION_SEARCH_FIELDS.some((field) =>
        String(session[field] ?? '')
          .toLowerCase()
          .includes(search)
      );
    };
  }

  function* loggedSessions(query: SessionListQuery, upper: number) {
    const lower = query.from ?? Number.MIN_SAFE_INTEGER;
    let before = upper;
    let scanned = 0;
    while (scanned < SESSION_SCAN_MAX) {
      const rows = query.profileId
        ? sql.exec(
            'SELECT created_at, body FROM session_log WHERE profile_id = ? AND created_at < ? AND created_at >= ? ORDER BY created_at DESC LIMIT ?',
            query.profileId,
            before,
            lower,
            SESSION_PAGE_ROWS
          )
        : sql.exec(
            'SELECT created_at, body FROM session_log WHERE created_at < ? AND created_at >= ? ORDER BY created_at DESC LIMIT ?',
            before,
            lower,
            SESSION_PAGE_ROWS
          );
      if (rows.length === 0) {
        return;
      }
      for (const row of rows) {
        scanned += 1;
        before = toNumber(row.created_at);
        yield JSON.parse(String(row.body)) as IClickhouseSession;
      }
    }
  }

  function liveSessionsInRange(query: SessionListQuery, upper: number) {
    const lower = query.from ?? Number.MIN_SAFE_INTEGER;
    return [...sessions.values()]
      .map((entry) => entry.session)
      .filter((session) => {
        const at = eventTimeMs(session.created_at);
        return at >= lower && at < upper;
      });
  }

  /** Newest first: open sessions from memory, ended ones from the log. */
  function listSessions(query: SessionListQuery = {}): IClickhouseSession[] {
    const take = Math.min(
      Math.max(1, query.take ?? LIST_EVENTS_PAGE_SIZE),
      SESSION_LIST_MAX_TAKE
    );
    const upper = Math.min(
      query.before ?? Number.MAX_SAFE_INTEGER,
      query.to === undefined ? Number.MAX_SAFE_INTEGER : query.to + 1
    );
    const accepts = sessionAccepts(query);
    const found = liveSessionsInRange(query, upper).filter(accepts);
    const seen = new Set(found.map((session) => session.id));
    let logged = 0;
    for (const session of loggedSessions(query, upper)) {
      if (seen.has(session.id) || !accepts(session)) {
        continue;
      }
      found.push(session);
      logged += 1;
      if (logged >= take) {
        break;
      }
    }
    return found
      .sort((a, b) => eventTimeMs(b.created_at) - eventTimeMs(a.created_at))
      .slice(0, take);
  }

  function countSessions(query: SessionListQuery = {}): number {
    const upper =
      query.to === undefined ? Number.MAX_SAFE_INTEGER : query.to + 1;
    const accepts = sessionAccepts(query);
    const open = liveSessionsInRange(query, upper).filter(accepts);
    const seen = new Set(open.map((session) => session.id));
    const isPlain = !(query.filters?.length || query.search?.trim());
    if (isPlain) {
      const lower = query.from ?? Number.MIN_SAFE_INTEGER;
      const [row] = query.profileId
        ? sql.exec(
            'SELECT count(*) AS n FROM session_log WHERE profile_id = ? AND created_at < ? AND created_at >= ?',
            query.profileId,
            upper,
            lower
          )
        : sql.exec(
            'SELECT count(*) AS n FROM session_log WHERE created_at < ? AND created_at >= ?',
            upper,
            lower
          );
      return open.length + toNumber(row?.n);
    }
    let count = open.length;
    for (const session of loggedSessions(query, upper)) {
      if (!seen.has(session.id) && accepts(session)) {
        count += 1;
      }
    }
    return count;
  }

  /**
   * Visits every session created in [from, to): the open ones, then the log
   * (up to SESSION_SCAN_MAX). False when the log was cut short.
   */
  function visitSessions(
    from: number,
    to: number,
    visit: (session: IClickhouseSession) => void
  ): boolean {
    const query = { from };
    const seen = new Set<string>();
    for (const session of liveSessionsInRange(query, to)) {
      seen.add(session.id);
      visit(session);
    }
    let logged = 0;
    for (const session of loggedSessions(query, to)) {
      logged += 1;
      if (!seen.has(session.id)) {
        visit(session);
      }
    }
    return logged < SESSION_SCAN_MAX;
  }

  function getSession(sessionId: string): IClickhouseSession | null {
    for (const entry of sessions.values()) {
      if (entry.session.id === sessionId) {
        return entry.session;
      }
    }
    const [row] = sql.exec(
      'SELECT body FROM session_log WHERE id = ?',
      sessionId
    );
    return row ? (JSON.parse(String(row.body)) as IClickhouseSession) : null;
  }

  function pruneSessionLog(beforeMs: number): number {
    const [row] = sql.exec(
      'SELECT count(*) AS n FROM session_log WHERE created_at < ?',
      beforeMs
    );
    sql.exec('DELETE FROM session_log WHERE created_at < ?', beforeMs);
    return toNumber(row?.n);
  }

  function activeVisitors(windowMs = DEFAULT_ACTIVE_WINDOW_MS): number {
    const since = clock.now() - windowMs;
    const visitors = new Set<string>();
    for (const live of sessions.values()) {
      if (live.lastActivityAt >= since) {
        visitors.add(live.session.profile_id || live.session.device_id);
      }
    }
    return visitors.size;
  }

  // -- archive / retention ----------------------------------------------------------

  /** Stored chunks after `afterId`, oldest first, for the R2 archive. */
  /** The newest chunk id handed out so far (0 when none): where a new export starts. */
  function lastChunkId(): number {
    return nextChunkId - 1;
  }

  async function readChunks(afterId: number, limit: number) {
    const chunks: StoredChunk[] = [];
    for (const row of sql.exec(
      'SELECT id, ts_min, ts_max, body FROM chunks WHERE id > ? ORDER BY id LIMIT ?',
      afterId,
      limit
    )) {
      const id = toNumber(row.id);
      chunks.push({
        id,
        tsMin: toNumber(row.ts_min),
        tsMax: toNumber(row.ts_max),
        events: await chunkEvents(id, row.body),
      });
    }
    return chunks;
  }

  /**
   * Deletes chunks whose newest event is older than `beforeMs`, never one a
   * restart still replays. Returns how many went.
   */
  function pruneChunks({
    beforeMs,
    maxId = Number.MAX_SAFE_INTEGER,
  }: {
    beforeMs: number;
    maxId?: number;
  }): number {
    const ceiling = Math.min(maxId, watermark, sessionFloor - 1);
    const [row] = sql.exec(
      'SELECT count(*) AS n FROM chunks WHERE ts_max < ? AND id <= ?',
      beforeMs,
      ceiling
    );
    sql.exec(
      'DELETE FROM chunks WHERE ts_max < ? AND id <= ?',
      beforeMs,
      ceiling
    );
    chunkCache.clear();
    return toNumber(row?.n);
  }

  // -- write API ------------------------------------------------------------------

  const sessionStore = {
    getExistingSession(
      query:
        | { projectId: string; deviceId: string }
        | { projectId: string; profileId: string }
    ): Promise<IClickhouseSession | null> {
      const deviceId =
        'deviceId' in query
          ? query.deviceId
          : profileIndex.get(query.profileId);
      const live = deviceId ? sessions.get(deviceId) : undefined;
      return Promise.resolve(live?.session ?? null);
    },

    getExistingSessions(
      _projectId: string,
      deviceIds: string[]
    ): Promise<(IClickhouseSession | null)[]> {
      return Promise.resolve(
        deviceIds.map((deviceId) => sessions.get(deviceId)?.session ?? null)
      );
    },

    ingest(
      payload: IServiceCreateEventPayload
    ): Promise<SessionIngestResult | null> {
      assertUsable();
      if (!isSessionActivity(payload)) {
        return Promise.resolve(null);
      }
      const existing = sessions.get(payload.deviceId)?.session ?? null;
      const decision = decideSession(existing, payload, sessionTimeoutMs);
      if (decision.kind === 'boundary') {
        dropSession(decision.closed.device_id, decision.closed.id);
      }
      touchSession(decision.current, clock.now(), nextChunkId);
      ingestMarkers.set(
        ingestMarkerKey(
          payload.deviceId,
          payload.name,
          payload.createdAt.getTime()
        ),
        { deviceId: payload.deviceId, at: clock.now() }
      );
      if (decision.kind === 'boundary') {
        return Promise.resolve({
          kind: 'boundary',
          current: decision.current,
          closed: decision.closed,
        });
      }
      return Promise.resolve({
        kind: decision.kind,
        current: decision.current,
      });
    },
  };

  /** Appends one event row; `sync()` is the durability barrier. */
  function createEvent(payload: IServiceCreateEventPayloadWithId): Promise<{
    document: IClickhouseEvent;
  }> {
    const nextPayload =
      !payload.profileId && payload.deviceId
        ? { ...payload, profileId: payload.deviceId }
        : payload;
    const document = buildClickhouseEvent(nextPayload, new Date(clock.now()));
    try {
      append(document, eventBytes(document));
    } catch (error) {
      return Promise.reject(error);
    }
    const markerKey = ingestMarkerKey(
      nextPayload.deviceId,
      nextPayload.name,
      nextPayload.createdAt.getTime()
    );
    if (ingestMarkers.delete(markerKey)) {
      sessionActivityEvents.add(document);
    }
    return Promise.resolve({ document });
  }

  function eventBytes(event: IClickhouseEvent): number {
    const bytes = textEncoder.encode(JSON.stringify(event)).byteLength;
    if (bytes > MAX_EVENT_RAW_BYTES) {
      throw new Error(
        `Event is ${bytes} bytes; the limit is ${MAX_EVENT_RAW_BYTES}`
      );
    }
    return bytes;
  }

  /**
   * Imported events (already complete rows, sessions built): appended in the
   * given order as their own chunks — live events are flushed first so they
   * do not share a chunk — and resolved once stored. Rollups, event names and
   * dimensions update as for live events.
   */
  async function importEvents(events: IClickhouseEvent[]): Promise<void> {
    await flush();
    for (const event of events) {
      append(event, eventBytes(event));
    }
    await flush();
  }

  /** Ended sessions of an import, for the Sessions page. */
  function logImportedSessions(list: IClickhouseSession[]): void {
    for (const session of list) {
      logSession(session);
    }
  }

  /** Stores `session_end` for a session that was closed or swept. */
  function endSession(input: EnqueueSessionEndInput): Promise<void> {
    const { event, snapshot } = sessionEndJobPayload(input);
    logSession(snapshot);
    const document = buildClickhouseEvent(
      buildSessionEndPayload(event, snapshot),
      new Date(clock.now())
    );
    try {
      append(document, eventBytes(document));
    } catch (error) {
      return Promise.reject(error);
    }
    return Promise.resolve();
  }

  function isDuplicate(key: string): boolean {
    const now = clock.now();
    for (const [seen, at] of recentRequests) {
      if (now - at <= dedupeWindowMs) {
        break;
      }
      recentRequests.delete(seen);
    }
    const seenAt = recentRequests.get(key);
    if (seenAt !== undefined && now - seenAt <= dedupeWindowMs) {
      return true;
    }
    recentRequests.delete(key);
    recentRequests.set(key, now);
    return false;
  }

  function nextAlarmAt(): number | null {
    let next = Number.POSITIVE_INFINITY;
    for (const live of sessions.values()) {
      next = Math.min(next, live.lastActivityAt + sessionTimeoutMs + 1);
    }
    if (hasUncheckpointedState() || pending.events.length > 0) {
      next = Math.min(next, lastCheckpointAt + checkpointIntervalMs);
    }
    if (!Number.isFinite(next)) {
      return null;
    }
    return Math.max(next, clock.now() + MIN_ALARM_DELAY_MS);
  }

  /** The alarm: close idle sessions, store everything, checkpoint when due. */
  async function tick(): Promise<TickResult> {
    assertUsable();
    const now = clock.now();
    const swept: IClickhouseSession[] = [];
    for (const [deviceId, live] of sessions) {
      if (now - live.lastActivityAt <= sessionTimeoutMs) {
        continue;
      }
      await endSession({
        payload: sessionEndPayloadFromSnapshot(live.session),
        closedSession: live.session,
      });
      dropSession(deviceId, live.session.id);
      swept.push(live.session);
    }

    const isCheckpointDue =
      hasUncheckpointedState() &&
      now - lastCheckpointAt >= checkpointIntervalMs;
    const checkpointed = isCheckpointDue ? await checkpoint() : false;
    if (!checkpointed) {
      await flush();
    }
    return { endedSessions: swept, checkpointed, nextAlarmAt: nextAlarmAt() };
  }

  await restore();

  return {
    sessions: sessionStore,
    createEvent,
    endSession,
    isDuplicate,
    sync,
    flush,
    checkpoint,
    tick,
    nextAlarmAt,
    listEvents,
    metrics,
    chartRows,
    findEvent,
    groupSummary,
    dimensionSeries,
    journeyRows,
    profileSummary,
    pageRows,
    pageSeries,
    eventCounts,
    conversionRows,
    sankeyRows,
    funnelRows,
    retentionRows,
    recentEvents,
    scanRange,
    liveData,
    realtime,
    listSessions,
    countSessions,
    visitSessions,
    getSession,
    pruneSessionLog,
    projectCard,
    dailyStats,
    rangeVisitors,
    topDimension,
    dimensionDays,
    eventNames,
    activeVisitors,
    readChunks,
    lastChunkId,
    importEvents,
    logImportedSessions,
    pruneChunks,
  };
}
