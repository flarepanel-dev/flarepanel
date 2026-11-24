/**
 * The Cloudflare ingest engine over `bun:sqlite`, driven through the real
 * `incomingEvent()` handler and device/session resolution, the way the
 * project's Durable Object will drive it. A fake clock fires the group-commit
 * timer; a counter adds up the rows each write statement changed, which is
 * what Durable Object SQLite bills.
 */

import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import { gunzipSync, gzipSync } from 'node:zlib';
import type { Logger } from '../../../logger';
import type {
  IClickhouseEvent,
  IServiceCreateEventPayloadWithId,
} from '../../event/event.service';
import { getDeviceId } from '../src/device-id';
import type { IncomingEventPayload } from '../src/incoming-event';
import {
  type IncomingEventDeps,
  incomingEvent,
} from '../src/incoming-event-handler';
import {
  type EngineClock,
  type EngineCodec,
  type EngineOptions,
  type EngineSql,
  type ListEventsQuery,
  openProjectEventsEngine,
  type ProjectEventsEngine,
  type SqlRow,
} from './engine';
import { HyperLogLog } from './hyperloglog';
import { wallClockToMs } from './time-buckets';

const PROJECT_ID = 'project-engine';
const START = Date.UTC(2026, 10, 20, 9, 0, 0);
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const SESSION_TIMEOUT_MS = 30 * MINUTE;
const SALTS = { current: 'salt-current', previous: 'salt-previous' };
const SIMULATION_TIMEOUT_MS = 120_000;
const WRITE_STATEMENT = /^\s*(INSERT|UPDATE|DELETE|REPLACE)/i;

const noopLogger: Logger = (() => {
  const noop = () => undefined;
  const logger: Logger = {
    fatal: noop,
    error: noop,
    warn: noop,
    info: noop,
    debug: noop,
    trace: noop,
    child: () => logger,
  };
  return logger;
})();

interface FakeClock extends EngineClock {
  advance(ms: number): Promise<void>;
  /** A crash: timers of the dead engine never fire. */
  dropTimers(): void;
}

function settle(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

function createFakeClock(start: number): FakeClock {
  let now = start;
  let sequence = 0;
  const timers = new Map<number, { at: number; callback: () => void }>();
  return {
    now: () => now,
    setTimeout(callback, ms) {
      sequence += 1;
      timers.set(sequence, { at: now + ms, callback });
      return sequence;
    },
    clearTimeout(handle) {
      timers.delete(handle as number);
    },
    async advance(ms) {
      const target = now + ms;
      for (;;) {
        const due = [...timers.entries()]
          .filter(([, timer]) => timer.at <= target)
          .sort(([, a], [, b]) => a.at - b.at)[0];
        if (!due) {
          break;
        }
        const [id, timer] = due;
        timers.delete(id);
        now = timer.at;
        timer.callback();
        await settle();
      }
      now = target;
      await settle();
    },
    dropTimers() {
      timers.clear();
    },
  };
}

function createCountingSql(db: Database) {
  const counter = { rowsWritten: 0 };
  const sql: EngineSql = {
    exec(query, ...bindings) {
      const statement = db.query(query);
      const values = bindings as SQLQueryBindings[];
      if (WRITE_STATEMENT.test(query)) {
        counter.rowsWritten += statement.run(...values).changes;
        return [];
      }
      return statement.all(...values) as SqlRow[];
    },
    transaction: (fn) => db.transaction(fn)(),
  };
  return { sql, counter };
}

const codec = {
  compress: (bytes: Uint8Array) => Promise.resolve(gzipSync(bytes)),
  decompress: (bytes: Uint8Array) => Promise.resolve(gunzipSync(bytes)),
};

interface Harness {
  db: Database;
  clock: FakeClock;
  counter: { rowsWritten: number };
  engine: ProjectEventsEngine;
  options: EngineOptions;
}

async function createHarness(
  options: EngineOptions = {},
  engineCodec: EngineCodec = codec
): Promise<Harness> {
  const db = new Database(':memory:');
  const clock = createFakeClock(START);
  const { sql, counter } = createCountingSql(db);
  const engine = await openProjectEventsEngine({
    sql,
    clock,
    codec: engineCodec,
    options,
  });
  return { db, clock, counter, engine, options };
}

/** Throws the engine away without a flush or checkpoint and opens a new one. */
async function crashAndReopen(harness: Harness): Promise<ProjectEventsEngine> {
  harness.clock.dropTimers();
  const { sql } = createCountingSql(harness.db);
  harness.engine = await openProjectEventsEngine({
    sql,
    clock: harness.clock,
    codec,
    options: harness.options,
  });
  return harness.engine;
}

function handlerDeps(engine: ProjectEventsEngine): IncomingEventDeps {
  return {
    logger: noopLogger,
    sessions: engine.sessions,
    createEvent: (payload) => engine.createEvent(payload),
    checkNotificationRulesForEvent: () => Promise.resolve(null),
    projects: {
      getCached: () => Promise.resolve({ firstEventAt: new Date(START) }),
      markFirstEvent: () => Promise.resolve(null),
      getAiStoreContent: () => Promise.resolve(null),
    },
    enqueueSessionEnd: (input) => engine.endSession(input),
    metrics: {
      sessionStarted: () => undefined,
      sessionEndEnqueued: () => undefined,
    },
    aiEvents: { add: () => Promise.resolve(null) },
  };
}

const BROWSER_UA: IncomingEventPayload['uaInfo'] = {
  isServer: false,
  device: 'desktop',
  os: 'macOS',
  osVersion: '15',
  browser: 'Chrome',
  browserVersion: '148',
  brand: '',
  model: '',
};

const SERVER_UA: IncomingEventPayload['uaInfo'] = {
  isServer: true,
  device: 'server',
  os: '',
  osVersion: '',
  browser: '',
  browserVersion: '',
  brand: '',
  model: '',
};

interface TrackInput {
  visitor: string;
  name?: string;
  path?: string;
  profileId?: string;
  revenue?: number;
  /** A server-side SDK: rides along on a session, never opens one. */
  isServer?: boolean;
}

/** One `/track` request: resolve device and session, then run the handler. */
async function track(harness: Harness, input: TrackInput) {
  const { engine, clock } = harness;
  const at = clock.now();
  const { deviceId, sessionId } = await getDeviceId({
    projectId: PROJECT_ID,
    ip: '203.0.113.7',
    ua: 'Mozilla/5.0',
    salts: SALTS,
    overrideDeviceId: input.visitor,
    eventTimeMs: at,
    sessionBuffer: engine.sessions,
    sessionTimeoutMs: SESSION_TIMEOUT_MS,
    logger: noopLogger,
  });
  const properties: Record<string, unknown> = {
    __path: `https://example.com${input.path ?? '/'}`,
  };
  if (input.revenue !== undefined) {
    properties.__revenue = input.revenue;
  }
  const payload: IncomingEventPayload = {
    projectId: PROJECT_ID,
    deviceId,
    sessionId,
    geo: {
      country: 'SE',
      city: 'Stockholm',
      region: 'AB',
      longitude: 18,
      latitude: 59,
    },
    uaInfo: input.isServer ? SERVER_UA : BROWSER_UA,
    headers: { 'user-agent': 'Mozilla/5.0' },
    event: {
      name: input.name ?? 'screen_view',
      profileId: input.profileId,
      properties,
      timestamp: at,
      isTimestampFromThePast: false,
    },
  };
  await incomingEvent(payload, handlerDeps(engine));
  return { deviceId, sessionId };
}

/** Lets the group commit fire and waits until it is stored. */
async function commit(harness: Harness) {
  await harness.clock.advance(SECOND);
  await harness.engine.sync();
}

async function allEvents(engine: ProjectEventsEngine) {
  const ids: string[] = [];
  let cursor: string | null = null;
  do {
    const page = await engine.listEvents({ cursor, take: 50 });
    ids.push(...page.events.map((event) => event.id));
    cursor = page.cursor;
  } while (cursor);
  return ids;
}

async function collect(engine: ProjectEventsEngine, query: ListEventsQuery) {
  const events: IClickhouseEvent[] = [];
  let cursor: string | null = null;
  do {
    const page = await engine.listEvents({ ...query, cursor });
    events.push(...page.events);
    cursor = page.cursor;
  } while (cursor);
  return events;
}

async function snapshot(engine: ProjectEventsEngine) {
  return {
    events: (await allEvents(engine)).sort(),
    names: engine.eventNames().map(({ name, count }) => ({ name, count })),
    card: engine.projectCard(),
    daily: engine.dailyStats(
      new Date(START - 2 * 24 * 60 * MINUTE),
      new Date(START + 2 * 24 * 60 * MINUTE)
    ),
  };
}

const FAR_FUTURE = START + 365 * 24 * 60 * MINUTE;
const WAIT_LIMIT_MS = 1000;

/** Fails instead of hanging when a promise never settles. */
function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('never settled')), WAIT_LIMIT_MS)
    ),
  ]);
}

function sessionRows(harness: Harness): string[] {
  return harness.db
    .query('SELECT device_id FROM sessions')
    .all()
    .map((row) => (row as { device_id: string }).device_id);
}

/** An event as the handler hands it to `createEvent`, at the clock's now. */
function rawPayload(
  overrides: Partial<IServiceCreateEventPayloadWithId> = {}
): IServiceCreateEventPayloadWithId {
  return {
    name: 'screen_view',
    deviceId: 'device-raw',
    profileId: '',
    projectId: PROJECT_ID,
    sessionId: 'session-raw',
    properties: {},
    createdAt: new Date(START),
    path: '/',
    origin: 'https://example.com',
    referrer: '',
    referrerName: '',
    referrerType: '',
    sdkName: '',
    sdkVersion: '',
    groups: [],
    ...overrides,
  };
}

describe('HyperLogLog', () => {
  it('counts distinct values within a few percent and merges by max', () => {
    const first = new HyperLogLog();
    const second = new HyperLogLog();
    for (let i = 0; i < 20_000; i++) {
      first.add(`visitor-${i}`);
      second.add(`visitor-${i + 10_000}`);
    }
    expect(Math.abs(first.count() - 20_000) / 20_000).toBeLessThan(0.05);
    first.merge(second);
    expect(Math.abs(first.count() - 30_000) / 30_000).toBeLessThan(0.05);

    const small = new HyperLogLog();
    for (const id of ['a', 'b', 'c', 'a']) {
      small.add(id);
    }
    expect(small.count()).toBe(3);
  });
});

describe('ProjectEventsEngine', () => {
  // Review regressions -------------------------------------------------------

  it('keeps chunk ids above the watermark after every chunk is pruned', async () => {
    const harness = await createHarness();
    await track(harness, { visitor: 'v1' });
    await commit(harness);
    await harness.clock.advance(31 * MINUTE);
    await harness.engine.tick();
    expect(await harness.engine.checkpoint()).toBe(true);
    const pruned = harness.engine.pruneChunks({ beforeMs: FAR_FUTURE });
    expect(pruned).toBe(2);

    let engine = await crashAndReopen(harness);
    await track(harness, { visitor: 'v2' });
    await commit(harness);
    const [chunk] = await engine.readChunks(0, 10);
    expect(chunk?.id).toBe(3);

    engine = await crashAndReopen(harness);
    const screenViews = engine
      .eventNames()
      .find((name) => name.name === 'screen_view');
    expect(screenViews?.count).toBe(2);
    expect(engine.activeVisitors()).toBe(1);
  });

  it('does not invent a session for a server-side event on replay', async () => {
    const harness = await createHarness();
    await track(harness, {
      visitor: 'server-1',
      isServer: true,
      name: 'order',
    });
    await commit(harness);
    expect(harness.engine.activeVisitors()).toBe(0);

    const engine = await crashAndReopen(harness);
    expect(engine.activeVisitors()).toBe(0);
    expect(
      await engine.sessions.getExistingSessions(PROJECT_ID, ['server-1'])
    ).toEqual([null]);
    await harness.clock.advance(31 * MINUTE);
    expect((await engine.tick()).endedSessions).toEqual([]);
  });

  it('rejects every waiting batch after a failed write instead of hanging', async () => {
    let failed = false;
    const failingCodec: EngineCodec = {
      compress: (bytes) => {
        if (!failed) {
          failed = true;
          return Promise.reject(new Error('disk full'));
        }
        return codec.compress(bytes);
      },
      decompress: codec.decompress,
    };
    const harness = await createHarness({}, failingCodec);
    // Both batches are queued before the first write fails.
    harness.engine.createEvent(rawPayload({ name: 'a' }));
    const firstWrite = harness.engine.flush();
    harness.engine.createEvent(rawPayload({ name: 'b' }));
    const secondWrite = harness.engine.sync();
    harness.engine.flush().catch(() => undefined);

    const [first, second] = await Promise.allSettled([
      withTimeout(firstWrite),
      withTimeout(secondWrite),
    ]);
    expect(first).toMatchObject({
      status: 'rejected',
      reason: { message: 'disk full' },
    });
    expect(second).toMatchObject({
      status: 'rejected',
      reason: { message: 'disk full' },
    });
    expect(() => harness.engine.sync()).toThrow('reopen');
  });

  it('cuts a chunk before 1 MB and refuses an event over the size limit', async () => {
    const harness = await createHarness();
    const filler = 'x'.repeat(400_000);
    for (const name of ['a', 'b', 'c']) {
      await harness.engine.createEvent(
        rawPayload({ name, properties: { filler } })
      );
    }
    await commit(harness);
    const chunks = await harness.engine.readChunks(0, 10);
    expect(
      chunks.map((chunk) => chunk.events.map((event) => event.name))
    ).toEqual([['a', 'b'], ['c']]);

    await expect(
      harness.engine.createEvent(
        rawPayload({
          name: 'huge',
          properties: { filler: 'x'.repeat(1_600_000) },
        })
      )
    ).rejects.toThrow('limit');
    await harness.engine.createEvent(rawPayload({ name: 'after' }));
    await commit(harness);
    expect((await harness.engine.listEvents()).events[0]?.name).toBe('after');
  });

  it('does not checkpoint a session that counts an event not stored yet', async () => {
    const harness = await createHarness({ sessionCheckpointAgeMs: 0 });
    await track(harness, { visitor: 'v1' });
    await commit(harness);
    expect(await harness.engine.checkpoint()).toBe(true);
    expect(sessionRows(harness)).toEqual(['v1']);

    // The handler's gap: the session moved, its event is not appended yet.
    const [live] = await harness.engine.sessions.getExistingSessions(
      PROJECT_ID,
      ['v1']
    );
    const payload = rawPayload({ deviceId: 'v1', sessionId: live?.id ?? '' });
    await harness.engine.sessions.ingest(payload);
    expect(await harness.engine.checkpoint()).toBe(true);
    expect(sessionRows(harness)).toEqual([]);

    await harness.engine.createEvent(payload);
    await commit(harness);
    const engine = await crashAndReopen(harness);
    const [restored] = await engine.sessions.getExistingSessions(PROJECT_ID, [
      'v1',
    ]);
    expect(restored?.screen_view_count).toBe(2);
  });

  it('decompresses at most 48 chunks per page, handing back a cursor', async () => {
    const harness = await createHarness();
    await harness.engine.createEvent(rawPayload({ name: 'needle' }));
    await commit(harness);
    for (let i = 0; i < 100; i++) {
      await harness.engine.createEvent(rawPayload({ name: 'hay' }));
      await commit(harness);
    }

    const pages: number[] = [];
    let cursor: string | null = null;
    do {
      const page = await harness.engine.listEvents({
        names: ['needle'],
        cursor,
      });
      pages.push(page.events.length);
      cursor = page.cursor;
    } while (cursor);
    expect(pages).toEqual([0, 0, 1]);
  });

  it('never asks for an alarm in the past', async () => {
    const harness = await createHarness();
    await track(harness, { visitor: 'v1' });
    await commit(harness);
    await harness.clock.advance(10 * MINUTE);
    expect(harness.engine.nextAlarmAt()).toBeGreaterThanOrEqual(
      harness.clock.now() + SECOND
    );
  });

  it('lists stored events newest first, 50 a page, with filters', async () => {
    const harness = await createHarness();
    for (let i = 0; i < 60; i++) {
      await track(harness, {
        visitor: `v${i % 3}`,
        name: i % 2 === 0 ? 'screen_view' : 'click',
        path: `/page-${i}`,
        profileId: i % 3 === 0 ? 'user-1' : undefined,
      });
      await harness.clock.advance(10 * SECOND);
    }
    await harness.engine.sync();

    // 60 events plus one session_start per visitor, one chunk each (10 s
    // apart), so the 48-chunk scan budget ends the first page early.
    const first = await harness.engine.listEvents();
    expect(first.events).toHaveLength(48);
    expect(first.events[0]?.path).toBe('/page-59');
    expect(first.cursor).not.toBeNull();
    const ids = await allEvents(harness.engine);
    expect(ids.slice(0, 48)).toEqual(first.events.map((event) => event.id));
    expect(new Set(ids).size).toBe(63);

    const clicks = await collect(harness.engine, { names: ['click'] });
    expect(clicks).toHaveLength(30);
    expect(clicks.every((event) => event.name === 'click')).toBe(true);

    const user = await collect(harness.engine, { profileId: 'user-1' });
    expect(user.length).toBeGreaterThanOrEqual(20);
    expect(user.every((event) => event.profile_id === 'user-1')).toBe(true);

    const sessionId = user[0]?.session_id ?? '';
    const session = await harness.engine.listEvents({ sessionId });
    expect(
      session.events.every((event) => event.session_id === sessionId)
    ).toBe(true);

    const window = await harness.engine.listEvents({
      startDate: new Date(START + 100 * SECOND),
      endDate: new Date(START + 200 * SECOND),
    });
    expect(window.events.map((event) => event.path).sort()).toEqual(
      [
        '/page-10',
        '/page-11',
        '/page-12',
        '/page-13',
        '/page-14',
        '/page-15',
        '/page-16',
        '/page-17',
        '/page-18',
        '/page-19',
        '/page-20',
      ].sort()
    );
  });

  it('shows events that are not committed yet', async () => {
    const harness = await createHarness();
    await track(harness, { visitor: 'v1', path: '/now' });
    const page = await harness.engine.listEvents();
    expect(page.events.map((event) => event.name)).toEqual([
      'screen_view',
      'session_start',
    ]);
  });

  it('closes an idle session with session_end after the timeout', async () => {
    const harness = await createHarness();
    const { sessionId } = await track(harness, { visitor: 'v1', path: '/a' });
    await harness.clock.advance(30 * SECOND);
    await track(harness, { visitor: 'v1', name: 'click', path: '/a' });
    await commit(harness);

    expect(harness.engine.activeVisitors()).toBe(1);
    const nextAlarm = harness.engine.nextAlarmAt();
    expect(nextAlarm).not.toBeNull();

    await harness.clock.advance(29 * MINUTE);
    let tick = await harness.engine.tick();
    expect(tick.endedSessions).toHaveLength(0);

    await harness.clock.advance(2 * MINUTE);
    tick = await harness.engine.tick();
    expect(tick.endedSessions.map((session) => session.id)).toEqual([
      sessionId,
    ]);

    const ends = await harness.engine.listEvents({ names: ['session_end'] });
    expect(ends.events).toHaveLength(1);
    expect(ends.events[0]).toMatchObject({
      session_id: sessionId,
      duration: 30 * SECOND,
      path: '/a',
      properties: { __bounce: 'true' },
    });
    expect(
      await harness.engine.sessions.getExistingSessions(PROJECT_ID, ['v1'])
    ).toEqual([null]);

    const [today] = harness.engine.dailyStats(new Date(START), new Date(START));
    expect(today).toMatchObject({
      sessions: 1,
      bounces: 1,
      durationMs: 30 * SECOND,
      screenViews: 1,
      events: 2,
      visitors: 1,
    });

    await harness.clock.advance(5 * MINUTE);
    tick = await harness.engine.tick();
    expect(tick.checkpointed).toBe(true);
    expect(tick.nextAlarmAt).toBeNull();
  });

  it('reads chunks for the archive and prunes only what a restart no longer needs', async () => {
    const harness = await createHarness();
    await track(harness, { visitor: 'v1', path: '/a' });
    await commit(harness);
    await track(harness, { visitor: 'v2', path: '/b' });
    await commit(harness);

    const chunks = await harness.engine.readChunks(0, 10);
    expect(chunks.map((chunk) => chunk.events.length)).toEqual([2, 2]);

    // Both sessions are live and young: their chunks are the replay floor.
    expect(await harness.engine.checkpoint()).toBe(true);
    const future = START + 365 * 24 * 60 * MINUTE;
    expect(harness.engine.pruneChunks({ beforeMs: future })).toBe(0);

    await harness.clock.advance(31 * MINUTE);
    await harness.engine.tick();
    expect(await harness.engine.checkpoint()).toBe(true);
    const lastStored = (await harness.engine.readChunks(0, 10)).at(-1)?.id ?? 0;
    expect(
      harness.engine.pruneChunks({ beforeMs: future, maxId: lastStored })
    ).toBe(3);
    expect((await harness.engine.listEvents()).events).toEqual([]);
    expect(
      harness.engine.dailyStats(new Date(START), new Date(START))[0]?.sessions
    ).toBe(2);
  });

  it('ends the old session and starts a new one when a visitor returns after the timeout', async () => {
    const harness = await createHarness();
    const first = await track(harness, { visitor: 'v1', path: '/a' });
    await track(harness, { visitor: 'v1', path: '/b' });
    await harness.clock.advance(31 * MINUTE);
    const second = await track(harness, { visitor: 'v1', path: '/c' });
    await commit(harness);

    expect(second.sessionId).not.toBe(first.sessionId);
    const names = (await harness.engine.listEvents()).events
      .map(
        (event) =>
          `${event.name}:${event.session_id === first.sessionId ? 1 : 2}`
      )
      .reverse();
    expect(names).toEqual([
      'session_start:1',
      'screen_view:1',
      'screen_view:1',
      'session_end:1',
      'session_start:2',
      'screen_view:2',
    ]);
    const [end] = (await harness.engine.listEvents({ names: ['session_end'] }))
      .events;
    expect(end?.properties.__bounce).toBe('false');
  });

  it('loses nothing stored when it restarts, and counts nothing twice', async () => {
    const harness = await createHarness({
      sessionCheckpointAgeMs: 10 * MINUTE,
    });
    // A long session: older than the checkpoint age, so its state is written
    // at the checkpoint; the short ones are rebuilt from chunks.
    for (let minute = 0; minute < 15; minute++) {
      await track(harness, {
        visitor: 'long',
        path: `/long-${minute}`,
        profileId: 'user-long',
      });
      await track(harness, {
        visitor: `short-${minute}`,
        path: '/landing',
        revenue: minute === 3 ? 4200 : undefined,
        name: minute === 3 ? 'revenue' : 'screen_view',
      });
      await harness.clock.advance(MINUTE);
    }
    await harness.engine.sync();
    expect(await harness.engine.checkpoint()).toBe(true);
    const stored = harness.db
      .query('SELECT device_id FROM sessions')
      .all()
      .map((row) => (row as { device_id: string }).device_id);
    // Sessions opened 10+ minutes ago are written; younger ones are not.
    expect(stored).toContain('long');
    expect(stored).toContain('short-5');
    expect(stored).not.toContain('short-6');

    // After the checkpoint: a young session and more of the long one.
    const young = await track(harness, { visitor: 'young', path: '/young' });
    await track(harness, {
      visitor: 'long',
      path: '/long-after',
      profileId: 'user-long',
    });
    await commit(harness);
    const before = await snapshot(harness.engine);
    expect(before.card.metrics.revenue).toBe(4200);

    // Appended but never committed: lost in the crash, as its request never
    // got an answer.
    const liveDevices = ['long', 'short-5', 'short-14', 'young'];
    const liveBefore = await harness.engine.sessions.getExistingSessions(
      PROJECT_ID,
      liveDevices
    );
    await track(harness, { visitor: 'unlucky', path: '/never-stored' });
    const engine = await crashAndReopen(harness);
    expect(await snapshot(engine)).toEqual(before);
    // Written, rebuilt from before the watermark, and rebuilt from after it.
    expect(
      await engine.sessions.getExistingSessions(PROJECT_ID, liveDevices)
    ).toEqual(liveBefore);
    expect(liveBefore.every(Boolean)).toBe(true);

    // Live sessions survive: the next events extend them, no new session_start.
    const [longSession, youngSession] =
      await engine.sessions.getExistingSessions(PROJECT_ID, ['long', 'young']);
    expect(longSession?.screen_view_count).toBe(16);
    expect(youngSession?.id).toBe(young.sessionId);
    const again = await track(harness, { visitor: 'young', path: '/young-2' });
    expect(again.sessionId).toBe(young.sessionId);
    await commit(harness);
    const starts = await engine.listEvents({
      names: ['session_start'],
      sessionId: young.sessionId,
    });
    expect(starts.events).toHaveLength(1);

    // Checkpoint and restart again: rollups are not applied twice.
    expect(await engine.checkpoint()).toBe(true);
    const checkpointed = await snapshot(engine);
    const reopened = await crashAndReopen(harness);
    expect(await snapshot(reopened)).toEqual(checkpointed);
    const [restoredLong] = await reopened.sessions.getExistingSessions(
      PROJECT_ID,
      ['long']
    );
    expect(restoredLong?.screen_view_count).toBe(16);
  });

  it(
    'writes about 0.1 rows per event at steady traffic',
    async () => {
      const harness = await createHarness();
      const rows = await simulateTraffic(harness, {
        eventsPerSecond: 25,
        warmupMs: 6 * MINUTE,
        measureMs: 15 * MINUTE,
      });
      expect(rows.perEvent).toBeLessThanOrEqual(0.1);
    },
    SIMULATION_TIMEOUT_MS
  );

  it(
    'writes at most about one row per event at trickle traffic',
    async () => {
      const harness = await createHarness();
      const rows = await simulateTraffic(harness, {
        eventsPerSecond: 1,
        warmupMs: 6 * MINUTE,
        measureMs: 15 * MINUTE,
      });
      expect(rows.perEvent).toBeLessThanOrEqual(1.2);
    },
    SIMULATION_TIMEOUT_MS
  );
});

const PARK_MILLER_MODULUS = 2_147_483_647;
const PARK_MILLER_MULTIPLIER = 48_271;

/** Park–Miller: a seeded generator, so the simulated traffic is the same every run. */
function seededRandom(seed: number) {
  let state = (seed % (PARK_MILLER_MODULUS - 1)) + 1;
  return () => {
    state = (state * PARK_MILLER_MULTIPLIER) % PARK_MILLER_MODULUS;
    return (state - 1) / (PARK_MILLER_MODULUS - 1);
  };
}

/**
 * Visitors arrive at random (Poisson) times and each sends 20 events about
 * 10 seconds apart; one in five is signed in. The Durable Object alarm runs
 * whenever the engine asks for it.
 */
async function simulateTraffic(
  harness: Harness,
  {
    eventsPerSecond,
    warmupMs,
    measureMs,
  }: { eventsPerSecond: number; warmupMs: number; measureMs: number }
) {
  const eventsPerVisitor = 20;
  const gapMs = 10 * SECOND;
  const stepMs = 100;
  const meanArrivalMs = (eventsPerVisitor * SECOND) / eventsPerSecond;
  const random = seededRandom(eventsPerSecond * 1000);
  const nextGap = (meanMs: number) => -Math.log(1 - random()) * meanMs;
  let visitors: {
    id: string;
    sent: number;
    nextAt: number;
    profileId?: string;
  }[] = [];
  let nextArrival = START;
  let arrived = 0;
  let eventsMeasured = 0;
  let rowsAtStart = 0;
  const end = START + warmupMs + measureMs;

  while (harness.clock.now() < end) {
    const now = harness.clock.now();
    const measuring = now >= START + warmupMs;
    if (measuring && rowsAtStart === 0) {
      rowsAtStart = harness.counter.rowsWritten || 1;
    }
    while (nextArrival <= now) {
      arrived += 1;
      visitors.push({
        id: `visitor-${arrived}`,
        sent: 0,
        nextAt: nextArrival,
        profileId: arrived % 5 === 0 ? `user-${arrived}` : undefined,
      });
      nextArrival += nextGap(meanArrivalMs);
    }
    for (const visitor of visitors) {
      if (visitor.sent >= eventsPerVisitor || visitor.nextAt > now) {
        continue;
      }
      await track(harness, {
        visitor: visitor.id,
        path: `/page-${visitor.sent}`,
        profileId: visitor.profileId,
      });
      visitor.sent += 1;
      visitor.nextAt += gapMs / 2 + random() * gapMs;
      if (measuring) {
        eventsMeasured += 1;
      }
    }
    visitors = visitors.filter((visitor) => visitor.sent < eventsPerVisitor);
    const alarmAt = harness.engine.nextAlarmAt();
    if (alarmAt !== null && alarmAt <= now) {
      await harness.engine.tick();
    }
    await harness.clock.advance(stepMs);
  }
  await commit(harness);
  const rowsWritten = harness.counter.rowsWritten - rowsAtStart;
  return {
    rowsWritten,
    eventsMeasured,
    perEvent: rowsWritten / eventsMeasured,
  };
}

describe('Phase 4 reads: hourly rollups, live card, sessions', () => {
  const NEW_YORK = 'America/New_York';
  const HOUR = 60 * MINUTE;

  /** Visitor a at 09:00 UTC (04:00 New York), b at 01:00 UTC next day (20:00 New York). */
  async function twoVisitors() {
    const harness = await createHarness();
    await track(harness, { visitor: 'a', path: '/a' });
    await commit(harness);
    await harness.clock.advance(16 * HOUR);
    await track(harness, { visitor: 'b', path: '/b' });
    await commit(harness);
    return harness;
  }

  it('stores sparse visitor sketches and reads both forms back', () => {
    const sparse = new HyperLogLog();
    for (const id of ['x', 'y', 'z']) {
      sparse.add(id);
    }
    const bytes = sparse.toBytes();
    expect(bytes.length).toBeLessThan(20);
    expect(HyperLogLog.fromBytes(bytes).count()).toBe(3);

    const dense = new HyperLogLog();
    for (let i = 0; i < 5000; i++) {
      dense.add(`v-${i}`);
    }
    expect(dense.toBytes().length).toBe(4096);
    expect(HyperLogLog.fromBytes(dense.toBytes()).count()).toBe(dense.count());
  });

  it('buckets days in the project timezone, before and after a restart', async () => {
    const harness = await twoVisitors();
    const range = (timezone: string) => ({
      from: wallClockToMs('2026-11-20 00:00:00', timezone),
      to: wallClockToMs('2026-11-21 23:59:59', timezone),
      interval: 'day' as const,
      timezone,
    });
    const sessionsByDay = async (timezone: string) =>
      (await harness.engine.metrics(range(timezone))).series.map(
        (point) => point.sessions
      );

    expect(await sessionsByDay('UTC')).toEqual([1, 1]);
    expect(await sessionsByDay(NEW_YORK)).toEqual([2, 0]);

    await harness.engine.checkpoint();
    await crashAndReopen(harness);
    expect(await sessionsByDay(NEW_YORK)).toEqual([2, 0]);
    const { totals } = await harness.engine.metrics(range(NEW_YORK));
    expect(totals).toMatchObject({ sessions: 2, visitors: 2, screenViews: 2 });
  });

  it('reads whole days from daily rows and edge hours from hourly rows', async () => {
    const harness = await twoVisitors();
    await harness.engine.checkpoint();
    const day = async (date: string, timezone: string) =>
      (
        await harness.engine.topDimension(
          'path',
          new Date(wallClockToMs(`${date} 00:00:00`, timezone)),
          new Date(wallClockToMs(`${date} 23:59:59`, timezone))
        )
      ).map((row) => row.name);
    expect(await day('2026-11-20', 'UTC')).toEqual(['/a']);
    expect((await day('2026-11-20', NEW_YORK)).sort()).toEqual(['/a', '/b']);
    expect(await day('2026-11-21', NEW_YORK)).toEqual([]);
  });

  it('counts a minute series from raw events', async () => {
    const harness = await createHarness();
    // Off the minute boundary: session_start is stamped just before its event.
    await harness.clock.advance(10 * SECOND);
    await track(harness, { visitor: 'a' });
    await harness.clock.advance(2 * MINUTE);
    await track(harness, { visitor: 'b' });
    await track(harness, { visitor: 'a', name: 'click' });
    await commit(harness);
    const { series, totals } = await harness.engine.metrics({
      from: START,
      to: START + 5 * MINUTE - 1,
      interval: 'minute',
      timezone: 'UTC',
    });
    expect(series).toHaveLength(5);
    expect(series.map((point) => point.screenViews)).toEqual([1, 0, 1, 0, 0]);
    expect(totals).toMatchObject({ visitors: 2, sessions: 2, events: 3 });
  });

  it('serves the live card from memory and rebuilds it after a restart', async () => {
    const harness = await createHarness();
    await harness.clock.advance(10 * SECOND);
    await track(harness, { visitor: 'a' });
    await harness.clock.advance(3 * MINUTE);
    await track(harness, { visitor: 'b' });
    await commit(harness);

    const before = await harness.engine.liveData();
    expect(before.totalSessions).toBe(2);
    expect(before.minutes.length).toBeGreaterThanOrEqual(30);
    expect(before.minutes.reduce((sum, m) => sum + m.visitors, 0)).toBe(2);

    await crashAndReopen(harness);
    const after = await harness.engine.liveData();
    expect(after.totalSessions).toBe(2);

    await harness.clock.advance(40 * MINUTE);
    expect((await harness.engine.liveData()).totalSessions).toBe(0);
  });

  it('lists open and ended sessions newest first, with filters and paging', async () => {
    const harness = await createHarness();
    const first = await track(harness, { visitor: 'a', path: '/a' });
    await commit(harness);
    await harness.clock.advance(31 * MINUTE);
    await harness.engine.tick();
    const second = await track(harness, {
      visitor: 'b',
      path: '/b',
      profileId: 'user-b',
    });
    await commit(harness);

    const all = harness.engine.listSessions({});
    expect(all.map((session) => session.id)).toEqual([
      second.sessionId,
      first.sessionId,
    ]);
    expect(harness.engine.countSessions({})).toBe(2);
    expect(harness.engine.getSession(first.sessionId)?.entry_path).toBe('/a');

    const byProfile = harness.engine.listSessions({ profileId: 'user-b' });
    expect(byProfile.map((session) => session.id)).toEqual([second.sessionId]);
    const byPath = harness.engine.listSessions({
      filters: [{ name: 'path', operator: 'is', value: ['/a'] }],
    });
    expect(byPath.map((session) => session.id)).toEqual([first.sessionId]);
    expect(
      harness.engine.countSessions({
        filters: [{ name: 'country', operator: 'is', value: ['SE'] }],
      })
    ).toBe(2);

    const page = harness.engine.listSessions({
      take: 1,
      before: fromSessionTime(all[0]?.created_at),
    });
    expect(page.map((session) => session.id)).toEqual([first.sessionId]);

    expect(harness.engine.pruneSessionLog(FAR_FUTURE)).toBe(1);
    expect(harness.engine.getSession(first.sessionId)).toBeNull();
  });

  it('rebuilds rollups from chunks when it opens storage of schema 1', async () => {
    const harness = await twoVisitors();
    await harness.engine.checkpoint();
    const query = {
      from: wallClockToMs('2026-11-20 00:00:00', NEW_YORK),
      to: wallClockToMs('2026-11-20 23:59:59', NEW_YORK),
      interval: 'hour' as const,
      timezone: NEW_YORK,
    };
    const expected = await harness.engine.metrics(query);

    harness.db.run("UPDATE meta SET v = '1' WHERE k = 'schema_version'");
    harness.db.run('DELETE FROM hourly');
    harness.db.run('DELETE FROM dims_h');
    harness.db.run('UPDATE daily SET sessions = 99');
    await crashAndReopen(harness);

    expect(await harness.engine.metrics(query)).toEqual(expected);
    const [today] = harness.engine.dailyStats(new Date(START), new Date(START));
    expect(today?.sessions).toBe(1);
  });
});

function fromSessionTime(createdAt: string | undefined): number {
  return Date.parse(`${(createdAt ?? '').replace(' ', 'T')}Z`);
}

describe('billable event counts', () => {
  it('counts exactly between instants, without session bookkeeping', async () => {
    const harness = await createHarness();
    await track(harness, { visitor: 'v1', path: '/a' }); // 09:00 + session_start
    await harness.clock.advance(10 * MINUTE);
    await track(harness, { visitor: 'v1', name: 'click', path: '/a' }); // 09:10
    await harness.clock.advance(55 * MINUTE);
    await track(harness, { visitor: 'v1', name: 'click', path: '/b' }); // 10:05
    await harness.clock.advance(2 * 60 * MINUTE);
    await track(harness, { visitor: 'v2', name: 'click', path: '/c' }); // 12:05
    await commit(harness);

    const at = (hours: number, minutes = 0) =>
      START + (hours - 9) * 60 * MINUTE + minutes * MINUTE;
    const count = (from: number, to: number) =>
      harness.engine.countBillableEvents(from, to);

    // The whole morning: 4 billable events, 2 session starts not counted.
    expect(await count(at(0), at(23, 59))).toBe(4);
    // A period starting at 09:05 does not bill the 09:00 page view, although
    // the day's rollup has it.
    expect(await count(at(9, 5), at(23, 59))).toBe(3);
    expect(
      harness.engine.dailyStats(new Date(at(9, 5)), new Date(at(23, 59)))[0]
        ?.events
    ).toBe(4);
    // Both ends inside hours.
    expect(await count(at(9, 5), at(10, 4))).toBe(1);
    expect(await count(at(10, 0), at(12, 4))).toBe(1);
    expect(await count(at(12, 5), at(12, 5))).toBe(1);
    expect(await count(at(13), at(12))).toBe(0);
  });
});
