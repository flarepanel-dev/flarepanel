/**
 * One Durable Object per project: its events in the object's SQLite (via the
 * storage-agnostic engine in @flarepanel/core), an alarm that closes idle
 * sessions, checkpoints, archives to R2 and applies retention, and the
 * project's live dashboard sockets (hibernating).
 *
 * Idle projects cost nothing: no alarm is scheduled once every session has
 * ended and the state is checkpointed.
 */

import { gunzipSync, gzipSync } from 'node:zlib';
import { DurableObject } from 'cloudflare:workers';
import type { DeviceRequest, IClickhouseProfile } from '@flarepanel/core';
import {
  archivePrefix,
  buildArchiveObjects,
  type ChartScanQuery,
  createArchiveColdStore,
  createProjectEventsService,
  type Dimension,
  type EngineSql,
  eventRow,
  type FunnelScanQuery,
  type ListEventsQuery,
  type MetricsQuery,
  openProfileStore,
  openProjectEventsEngine,
  type ProfileListQuery,
  type ProfileStore,
  type ProjectEventsEngine,
  type ProjectEventsService,
  type ProjectEventsTrackInput,
  type RetentionScanQuery,
  type RowFilter,
  type SessionListQuery,
  type SqlRow,
  type SqlValue,
  toBasinRow,
} from '@flarepanel/core/ingest/cloudflare';
import { isStreamingEnabled } from '../advanced/config';
import type { Env } from '../index';
import { createConsoleLogger } from '../logger';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const ARCHIVE_INTERVAL_MS = 10 * 60 * 1000;
const ARCHIVE_BATCH_CHUNKS = 500;
const ARCHIVE_MAX_BATCHES = 4;
const RETENTION_INTERVAL_MS = 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RETENTION_DAYS = 90;
const LITE_RETENTION_DAYS = 30;
const BROADCAST_MIN_INTERVAL_MS = 1000;
/** An alarm already due this soon is not moved (each move is a write). */
const ALARM_SLACK_MS = 1000;

/**
 * Archive files one deep-history report may read (one R2 read each; R2 gives
 * 10 million reads a month free). Past it the report covers what was read.
 */
const COLD_MAX_OBJECTS = 3000;
/** The report builder's pickers read this much recent data. */
const PICKER_SCAN_CHUNKS = 100;
const PICKER_SCAN_EVENTS = 20_000;
const PICKER_MAX_VALUES = 500;
const HIDDEN_PROPERTY_KEYS = new Set(['__duration_from', '__properties_from']);

const KEY_PROJECT_ID = 'project_id';
const KEY_ARCHIVED_THROUGH = 'archived_through';
const KEY_STREAMED_THROUGH = 'streamed_through';
const KEY_STREAMED_AT = 'streamed_at';
/** Advanced analytics: events go to the Basin stream at most this often. */
const STREAM_INTERVAL_MS = 60 * 1000;
const STREAM_BATCH_CHUNKS = 100;
const STREAM_MAX_BATCHES = 10;
/** Rows per `send` call, well under the stream's request size limit. */
const STREAM_SEND_ROWS = 500;
const KEY_ARCHIVED_AT = 'archived_at';
const KEY_RETENTION_AT = 'retention_at';

/** `notifications` sockets stay open and quiet until Phase 4 sends on them. */
type LiveKind = 'events' | 'visitors' | 'notifications';

interface State {
  engine: ProjectEventsEngine;
  profiles: ProfileStore;
  service: ProjectEventsService;
}

function toBinding(value: SqlValue): SqlValue {
  if (value instanceof Uint8Array) {
    return value.buffer.slice(
      value.byteOffset,
      value.byteOffset + value.byteLength
    ) as ArrayBuffer;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  return value;
}

// node:zlib (nodejs_compat) rather than CompressionStream: a stream pump never
// completes inside blockConcurrencyWhile, where the engine restores chunks.
const gzip = (bytes: Uint8Array) =>
  Promise.resolve(new Uint8Array(gzipSync(bytes)));
const gunzip = (bytes: Uint8Array) =>
  Promise.resolve(new Uint8Array(gunzipSync(bytes)));

export class ProjectEventsDurableObject extends DurableObject<Env> {
  private readonly logger = createConsoleLogger('info', {
    component: 'project-events',
  });
  private state: Promise<State>;
  private projectId: string | null = null;
  private alarmAt: number | null = null;
  private unarchived = false;
  /** Advanced analytics: stored chunks not sent to the Basin stream yet. */
  private unstreamed = false;
  private pendingEvents = 0;
  private lastBroadcastAt = 0;
  private broadcastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.state = this.open();
    ctx.blockConcurrencyWhile(async () => {
      await this.state;
    });
  }

  private async open(): Promise<State> {
    const storage = this.ctx.storage;
    const sql: EngineSql = {
      exec: (query, ...bindings) =>
        storage.sql
          .exec(query, ...bindings.map(toBinding))
          .toArray() as SqlRow[],
      transaction: (fn) => storage.transactionSync(fn),
    };
    const bucket = this.env.EVENTS_ARCHIVE;
    const engine = await openProjectEventsEngine({
      // Reports reaching past the hot window read the R2 archive.
      cold: bucket
        ? createArchiveColdStore({
            bucket,
            projectId: () => this.projectId,
            before: () => Date.now() - this.retentionDays() * DAY_MS,
            gunzip: (bytes) => new Uint8Array(gunzipSync(bytes)),
            maxObjects: COLD_MAX_OBJECTS,
          })
        : undefined,
      sql,
      clock: {
        now: () => Date.now(),
        setTimeout: (callback, ms) => setTimeout(callback, ms),
        clearTimeout: (handle) =>
          clearTimeout(handle as ReturnType<typeof setTimeout>),
      },
      codec: { compress: gzip, decompress: gunzip },
      options: { sessionTimeoutMs: SESSION_TIMEOUT_MS },
    });
    const service = createProjectEventsService({
      engine,
      logger: this.logger,
      sessionTimeoutMs: SESSION_TIMEOUT_MS,
      onStored: () => this.afterStore(),
    });

    this.projectId = (await storage.get<string>(KEY_PROJECT_ID)) ?? null;
    this.alarmAt = await storage.getAlarm();
    const archivedThrough =
      (await storage.get<number>(KEY_ARCHIVED_THROUGH)) ?? 0;
    this.unarchived = (await engine.readChunks(archivedThrough, 1)).length > 0;
    if (isStreamingEnabled(this.env)) {
      const streamedThrough =
        (await storage.get<number>(KEY_STREAMED_THROUGH)) ?? 0;
      this.unstreamed =
        (await engine.readChunks(streamedThrough, 1)).length > 0;
    }
    return { engine, service, profiles: openProfileStore(sql) };
  }

  private async rememberProject(projectId: string) {
    if (this.projectId === projectId) {
      return;
    }
    this.projectId = projectId;
    await this.ctx.storage.put(KEY_PROJECT_ID, projectId);
  }

  // -------------------------------------------------------------------------
  // RPC (called by the Worker with the project's id as the object name)

  async track(input: ProjectEventsTrackInput) {
    const { service } = await this.state;
    await this.rememberProject(input.draft.event.projectId);
    const result = await service.track(input);
    if (!result.duplicate) {
      this.pendingEvents += 1;
      this.scheduleBroadcast();
    }
    return result;
  }

  async resolveDevice(device: DeviceRequest) {
    const { service } = await this.state;
    return service.resolveDevice(device);
  }

  async getExistingSessions(projectId: string, deviceIds: string[]) {
    const { service } = await this.state;
    return service.getExistingSessions(projectId, deviceIds);
  }

  async listEvents(query: ListEventsQuery) {
    const { engine } = await this.state;
    return engine.listEvents(query);
  }

  async projectCard() {
    const { engine } = await this.state;
    return engine.projectCard();
  }

  async dailyStats(from: Date, to: Date) {
    const { engine } = await this.state;
    return engine.dailyStats(from, to);
  }

  async upsertProfile(profile: IClickhouseProfile, isFromEvent: boolean) {
    const { profiles } = await this.state;
    await this.rememberProject(profile.project_id);
    profiles.upsert(profile, { onlyIfNew: isFromEvent });
  }

  async getProfile(profileId: string) {
    const { profiles } = await this.state;
    return profiles.get(profileId);
  }

  async listProfiles(query: ProfileListQuery) {
    const { profiles } = await this.state;
    return profiles.list(query);
  }

  async topDimension(
    dim: Dimension,
    from: Date,
    to: Date,
    limit?: number,
    filters?: RowFilter[]
  ) {
    const { engine } = await this.state;
    return engine.topDimension(dim, from, to, limit, filters);
  }

  async countEvents(from: Date, to: Date) {
    const { engine } = await this.state;
    return engine
      .dailyStats(from, to)
      .reduce((sum, day) => sum + day.events, 0);
  }

  /**
   * Deletes everything this project stored: its R2 archive, alarm, sockets
   * and SQLite. The object then starts over empty if it is ever called again.
   */
  async purge(projectId: string) {
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.close(1000, 'project deleted');
      } catch {
        // Already closed.
      }
    }
    const bucket = this.env.EVENTS_ARCHIVE;
    let deleted = 0;
    if (bucket) {
      const prefix = archivePrefix(projectId);
      let cursor: string | undefined;
      do {
        const page = await bucket.list({ prefix, cursor, limit: 1000 });
        const keys = page.objects.map((object) => object.key);
        if (keys.length > 0) {
          await bucket.delete(keys);
          deleted += keys.length;
        }
        cursor = page.truncated ? page.cursor : undefined;
      } while (cursor);
    }
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
    this.alarmAt = null;
    this.projectId = null;
    this.unarchived = false;
    this.unstreamed = false;
    this.pendingEvents = 0;
    this.state = this.open();
    await this.state;
    return { archivedObjectsDeleted: deleted };
  }

  async overview(from: Date, to: Date) {
    const { engine } = await this.state;
    return {
      visitors: engine.rangeVisitors(from, to),
      days: engine.dailyStats(from, to),
    };
  }

  async metrics(query: MetricsQuery) {
    const { engine } = await this.state;
    return engine.metrics(query);
  }

  /** `profile.*` fields for report filters and breakdowns, cached per call. */
  private profileLookup(profiles: ProfileStore) {
    const cache = new Map<string, Record<string, unknown> | null>();
    return (profileId: string) => {
      if (!cache.has(profileId)) {
        const profile = profiles.get(profileId);
        cache.set(
          profileId,
          profile ? (profile as unknown as Record<string, unknown>) : null
        );
      }
      return cache.get(profileId);
    };
  }

  async chartRows(query: ChartScanQuery) {
    const { engine, profiles } = await this.state;
    return engine.chartRows(query, this.profileLookup(profiles));
  }

  async funnelRows(query: FunnelScanQuery) {
    const { engine, profiles } = await this.state;
    return engine.funnelRows(query, this.profileLookup(profiles));
  }

  async retentionRows(query: RetentionScanQuery) {
    const { engine } = await this.state;
    return engine.retentionRows(query);
  }

  /** Property keys seen on recent events (of one event name, or all). */
  async propertyKeys(eventName?: string) {
    const { engine } = await this.state;
    const keys = new Set<string>();
    let seen = 0;
    await engine.recentEvents(PICKER_SCAN_CHUNKS, (event) => {
      if (eventName && eventName !== '*' && event.name !== eventName) {
        return;
      }
      for (const [key, value] of Object.entries(event.properties)) {
        // Same exclusions as ClickHouse's event_property_values_mv.
        const isHidden = HIDDEN_PROPERTY_KEYS.has(key);
        if (
          !isHidden &&
          value !== '' &&
          value !== null &&
          value !== undefined
        ) {
          keys.add(key);
        }
      }
      seen += 1;
      return seen < PICKER_SCAN_EVENTS;
    });
    return [...keys].sort();
  }

  /** Distinct values of one field on recent events, most common first. */
  async propertyValues(eventName: string, property: string) {
    const { engine } = await this.state;
    const counts = new Map<string, number>();
    let seen = 0;
    await engine.recentEvents(PICKER_SCAN_CHUNKS, (event) => {
      if (eventName && eventName !== '*' && event.name !== eventName) {
        return;
      }
      const row = eventRow(event);
      const key = property.startsWith('properties.')
        ? property.slice('properties.'.length)
        : null;
      const raw = key === null ? row[property] : event.properties[key];
      const value = raw === null || raw === undefined ? '' : String(raw);
      if (value) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
      seen += 1;
      return seen < PICKER_SCAN_EVENTS;
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, PICKER_MAX_VALUES)
      .map(([value]) => value);
  }

  async liveData() {
    const { engine } = await this.state;
    return engine.liveData();
  }

  async listSessions(query: SessionListQuery) {
    const { engine } = await this.state;
    return engine.listSessions(query);
  }

  async countSessions(query: SessionListQuery) {
    const { engine } = await this.state;
    return engine.countSessions(query);
  }

  async getSession(sessionId: string) {
    const { engine } = await this.state;
    return engine.getSession(sessionId);
  }

  async eventNames() {
    const { engine } = await this.state;
    return engine.eventNames();
  }

  async activeVisitors(windowMs?: number) {
    const { engine } = await this.state;
    return engine.activeVisitors(windowMs);
  }

  // -------------------------------------------------------------------------
  // Alarm: session sweep, checkpoint, archive, retention

  private afterStore() {
    this.unarchived = true;
    this.unstreamed = isStreamingEnabled(this.env);
    this.scheduleAlarm().catch((error) =>
      this.logger.error({ err: error }, 'Could not schedule the alarm')
    );
  }

  private async desiredAlarmAt(): Promise<number | null> {
    const { engine } = await this.state;
    let next = engine.nextAlarmAt() ?? Number.POSITIVE_INFINITY;
    if (this.unarchived && this.env.EVENTS_ARCHIVE) {
      const archivedAt =
        (await this.ctx.storage.get<number>(KEY_ARCHIVED_AT)) ?? 0;
      next = Math.min(next, archivedAt + ARCHIVE_INTERVAL_MS);
    }
    if (this.unstreamed) {
      const streamedAt =
        (await this.ctx.storage.get<number>(KEY_STREAMED_AT)) ?? 0;
      next = Math.min(next, streamedAt + STREAM_INTERVAL_MS);
    }
    return Number.isFinite(next) ? next : null;
  }

  private async scheduleAlarm() {
    const desired = await this.desiredAlarmAt();
    if (desired === null) {
      return;
    }
    const at = Math.max(desired, Date.now());
    if (this.alarmAt !== null && this.alarmAt <= at + ALARM_SLACK_MS) {
      return;
    }
    this.alarmAt = at;
    await this.ctx.storage.setAlarm(at);
  }

  async alarm() {
    this.alarmAt = null;
    const { engine } = await this.state;
    const result = await engine.tick();
    await this.archive(engine);
    await this.stream(engine).catch((error) =>
      this.logger.error({ err: error }, 'Could not send events to Basin')
    );
    await this.applyRetention(engine);
    if (result.endedSessions.length > 0) {
      this.scheduleBroadcast();
    }
    await this.scheduleAlarm();
  }

  /**
   * Advanced analytics: sends stored chunks to the Basin Pipelines stream,
   * oldest first, behind a cursor (at least once). Turning it on backfills
   * everything the object still keeps.
   */
  private async stream(engine: ProjectEventsEngine) {
    const stream = this.env.EVENTS_STREAM;
    if (!(stream && this.unstreamed && isStreamingEnabled(this.env))) {
      return;
    }
    const storage = this.ctx.storage;
    const streamedAt = (await storage.get<number>(KEY_STREAMED_AT)) ?? 0;
    if (Date.now() - streamedAt < STREAM_INTERVAL_MS) {
      return;
    }
    await engine.flush();
    let through = (await storage.get<number>(KEY_STREAMED_THROUGH)) ?? 0;
    for (let batch = 0; batch < STREAM_MAX_BATCHES; batch++) {
      const chunks = await engine.readChunks(through, STREAM_BATCH_CHUNKS);
      const last = chunks.at(-1);
      if (!last) {
        break;
      }
      const rows = chunks.flatMap((chunk) => chunk.events.map(toBasinRow));
      for (let index = 0; index < rows.length; index += STREAM_SEND_ROWS) {
        await stream.send(rows.slice(index, index + STREAM_SEND_ROWS));
      }
      through = last.id;
      await storage.put(KEY_STREAMED_THROUGH, through);
      if (chunks.length < STREAM_BATCH_CHUNKS) {
        break;
      }
    }
    await storage.put(KEY_STREAMED_AT, Date.now());
    this.unstreamed = (await engine.readChunks(through, 1)).length > 0;
  }

  private async archive(engine: ProjectEventsEngine) {
    const bucket = this.env.EVENTS_ARCHIVE;
    const projectId = this.projectId;
    if (!(bucket && projectId && this.unarchived)) {
      return;
    }
    const storage = this.ctx.storage;
    const archivedAt = (await storage.get<number>(KEY_ARCHIVED_AT)) ?? 0;
    if (Date.now() - archivedAt < ARCHIVE_INTERVAL_MS) {
      return;
    }
    await engine.flush();
    let through = (await storage.get<number>(KEY_ARCHIVED_THROUGH)) ?? 0;
    for (let batch = 0; batch < ARCHIVE_MAX_BATCHES; batch++) {
      const chunks = await engine.readChunks(through, ARCHIVE_BATCH_CHUNKS);
      const last = chunks.at(-1);
      if (!last) {
        break;
      }
      for (const object of buildArchiveObjects(projectId, chunks)) {
        await bucket.put(
          `${object.key}.gz`,
          await gzip(new TextEncoder().encode(object.body)),
          {
            httpMetadata: {
              contentType: 'application/x-ndjson',
              contentEncoding: 'gzip',
            },
            customMetadata: { events: String(object.events) },
          }
        );
      }
      through = last.id;
      await storage.put(KEY_ARCHIVED_THROUGH, through);
      if (chunks.length < ARCHIVE_BATCH_CHUNKS) {
        break;
      }
    }
    await storage.put(KEY_ARCHIVED_AT, Date.now());
    this.unarchived = (await engine.readChunks(through, 1)).length > 0;
  }

  /** Days of raw events the object keeps (older ones live in the archive). */
  private retentionDays(): number {
    const configured = Number(this.env.FLAREPANEL_EVENT_RETENTION_DAYS);
    if (Number.isFinite(configured) && configured > 0) {
      return configured;
    }
    return this.env.EVENTS_ARCHIVE
      ? DEFAULT_RETENTION_DAYS
      : LITE_RETENTION_DAYS;
  }

  private async applyRetention(engine: ProjectEventsEngine) {
    const storage = this.ctx.storage;
    const lastRun = (await storage.get<number>(KEY_RETENTION_AT)) ?? 0;
    if (Date.now() - lastRun < RETENTION_INTERVAL_MS) {
      return;
    }
    const hasArchive = Boolean(this.env.EVENTS_ARCHIVE);
    const days = this.retentionDays();
    const archivedThrough = hasArchive
      ? ((await storage.get<number>(KEY_ARCHIVED_THROUGH)) ?? 0)
      : Number.MAX_SAFE_INTEGER;
    // Nothing is pruned before it reached the Basin stream either.
    const streamedThrough = isStreamingEnabled(this.env)
      ? ((await storage.get<number>(KEY_STREAMED_THROUGH)) ?? 0)
      : Number.MAX_SAFE_INTEGER;
    engine.pruneChunks({
      beforeMs: Date.now() - days * DAY_MS,
      maxId: Math.min(archivedThrough, streamedThrough),
    });
    engine.pruneSessionLog(Date.now() - days * DAY_MS);
    await storage.put(KEY_RETENTION_AT, Date.now());
  }

  // -------------------------------------------------------------------------
  // Live sockets: `/live/events/:projectId` and `/live/visitors/:projectId`,
  // forwarded here by the Worker after its session and access checks.

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Expected a WebSocket upgrade', { status: 426 });
    }
    const path = new URL(request.url).pathname;
    let kind: LiveKind = 'events';
    if (path.includes('/live/visitors/')) {
      kind = 'visitors';
    } else if (path.includes('/live/notifications/')) {
      kind = 'notifications';
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    this.ctx.acceptWebSocket(server, [kind]);
    if (kind === 'visitors') {
      const { engine } = await this.state;
      server.send(String(engine.activeVisitors()));
    }
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage() {
    // The dashboard only listens.
  }

  webSocketClose(ws: WebSocket, code: number) {
    try {
      ws.close(code === 1005 ? 1000 : code, 'closed');
    } catch {
      // Already closed.
    }
  }

  private scheduleBroadcast() {
    if (this.broadcastTimer !== null) {
      return;
    }
    const wait = Math.max(
      0,
      this.lastBroadcastAt + BROADCAST_MIN_INTERVAL_MS - Date.now()
    );
    this.broadcastTimer = setTimeout(() => {
      this.broadcastTimer = null;
      this.broadcast().catch((error) =>
        this.logger.warn({ err: error }, 'Live broadcast failed')
      );
    }, wait);
  }

  private async broadcast() {
    this.lastBroadcastAt = Date.now();
    const count = this.pendingEvents;
    this.pendingEvents = 0;
    const eventSockets = this.ctx.getWebSockets('events');
    if (count > 0 && eventSockets.length > 0) {
      // superjson's wire shape, as the Bun routes send it.
      const message = JSON.stringify({ json: { count } });
      for (const ws of eventSockets) {
        safeSend(ws, message);
      }
    }
    const visitorSockets = this.ctx.getWebSockets('visitors');
    if (visitorSockets.length > 0) {
      const { engine } = await this.state;
      const message = String(engine.activeVisitors());
      for (const ws of visitorSockets) {
        safeSend(ws, message);
      }
    }
  }
}

function safeSend(ws: WebSocket, message: string) {
  try {
    ws.send(message);
  } catch {
    // A socket closing under us; its close handler cleans up.
  }
}
