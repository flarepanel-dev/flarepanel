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
import { HyperLogLog } from './hyperloglog';

const SCHEMA_VERSION = 1;
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
];

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
}

// ---------------------------------------------------------------------------
// Read shapes

export interface ListEventsQuery {
  profileId?: string;
  sessionId?: string;
  names?: string[];
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
  const at = eventTimeMs(event.created_at);
  return at >= range.fromMs && at <= range.toMs;
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
          visitors: new HyperLogLog(toBytes(row.visitors).slice()),
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

  function applyCommitted(event: IClickhouseEvent) {
    const at = eventTimeMs(event.created_at);
    const day = loadDay(dayKey(at));
    dirtyDays.add(dayKey(at));

    const isSessionStart = event.name === 'session_start';
    const isSessionEnd = event.name === 'session_end';
    if (isSessionStart) {
      day.sessions += 1;
    } else if (isSessionEnd) {
      day.bounces += isBounce(event) ? 1 : 0;
      day.durationMs += Math.max(0, event.duration ?? 0);
    } else {
      day.events += 1;
      day.revenue += event.revenue ?? 0;
      if (event.name === 'screen_view') {
        day.screenViews += 1;
      }
    }
    if (event.profile_id && !isSessionEnd) {
      day.visitors.add(event.profile_id);
    }

    const name = nameDeltas.get(event.name) ?? { count: 0, lastSeen: 0 };
    name.count += 1;
    name.lastSeen = Math.max(name.lastSeen, at);
    nameDeltas.set(event.name, name);

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
    for (const day of dirtyDays) {
      const rollup = days.get(day);
      if (!rollup) {
        continue;
      }
      sql.exec(
        'INSERT INTO daily (day, visitors, sessions, bounces, duration_ms, screen_views, events, revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (day) DO UPDATE SET visitors = excluded.visitors, sessions = excluded.sessions, bounces = excluded.bounces, duration_ms = excluded.duration_ms, screen_views = excluded.screen_views, events = excluded.events, revenue = excluded.revenue',
        day,
        rollup.visitors.registers,
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

  function clearCheckpointedState() {
    dirtyDays.clear();
    days.clear();
    nameDeltas.clear();
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

  async function restore() {
    for (const statement of SCHEMA) {
      sql.exec(statement);
    }
    const version = readMeta(META_SCHEMA_VERSION);
    if (version === undefined) {
      sql.exec(
        'INSERT INTO meta (k, v) VALUES (?, ?)',
        META_SCHEMA_VERSION,
        String(SCHEMA_VERSION)
      );
    }

    watermark = Number(readMeta(META_WATERMARK) ?? 0);
    watermarkCandidate = watermark;
    lastCheckpointAt = Number(readMeta(META_CHECKPOINT_AT) ?? clock.now());

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
        return { events: page, cursor: next };
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
        return { events: page, cursor: null };
      }
      for (const row of rows) {
        const id = toNumber(row.id);
        const next = collect(id, await chunkEvents(id, row.body));
        if (next) {
          return { events: page, cursor: next };
        }
        before = id;
        scanned += 1;
      }
    }
    // Scan budget spent: hand back what we have and resume below this chunk.
    return { events: page, cursor: `${before}:0` };
  }

  function rollupsSince(fromDay: string): Map<string, DailyRollup> {
    const rollups = new Map<string, DailyRollup>();
    for (const row of sql.exec(
      'SELECT * FROM daily WHERE day >= ? ORDER BY day',
      fromDay
    )) {
      const day = String(row.day);
      rollups.set(day, {
        visitors: new HyperLogLog(toBytes(row.visitors).slice()),
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

  /** Stores `session_end` for a session that was closed or swept. */
  function endSession(input: EnqueueSessionEndInput): Promise<void> {
    const { event, snapshot } = sessionEndJobPayload(input);
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
    projectCard,
    dailyStats,
    eventNames,
    activeVisitors,
    readChunks,
    pruneChunks,
  };
}
