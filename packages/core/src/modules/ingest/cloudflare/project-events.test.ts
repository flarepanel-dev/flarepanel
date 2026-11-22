/**
 * The per-project service the Durable Object wraps: one `/track` draft in,
 * identity out, event stored before the answer; first-event and dedupe
 * signals; and the R2 archive grouping over what it stored.
 */
import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import { gunzipSync, gzipSync } from 'node:zlib';
import type { Logger } from '../../../logger';
import type { TrackDraft } from '../src/backend';
import { buildArchiveObjects } from './archive';
import { type EngineSql, openProjectEventsEngine, type SqlRow } from './engine';
import { createProjectEventsService } from './project-events';

const PROJECT_ID = 'project-service';

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

async function createService() {
  const db = new Database(':memory:');
  const sql: EngineSql = {
    exec(query, ...bindings) {
      const statement = db.query(query);
      return statement.all(...(bindings as SQLQueryBindings[])) as SqlRow[];
    },
    transaction: (fn) => db.transaction(fn)(),
  };
  const engine = await openProjectEventsEngine({
    sql,
    clock: {
      now: () => Date.now(),
      setTimeout: (callback, ms) => setTimeout(callback, ms),
      clearTimeout: (handle) =>
        clearTimeout(handle as ReturnType<typeof setTimeout>),
    },
    codec: {
      compress: (bytes) => Promise.resolve(gzipSync(bytes)),
      decompress: (bytes) => Promise.resolve(gunzipSync(bytes)),
    },
    options: { commitMaxDelayMs: 5 },
  });
  let stored = 0;
  const service = createProjectEventsService({
    engine,
    logger: noopLogger,
    sessionTimeoutMs: 30 * 60 * 1000,
    onStored: () => {
      stored += 1;
    },
  });
  return { engine, service, storedCount: () => stored };
}

function draft(name: string, path = '/'): TrackDraft {
  return {
    device: {
      projectId: PROJECT_ID,
      ip: '203.0.113.9',
      ua: 'Mozilla/5.0 (Macintosh)',
      salts: { current: 'salt-a', previous: 'salt-b' },
    },
    partitionBy: { by: 'device' },
    event: {
      projectId: PROJECT_ID,
      geo: {
        country: 'PT',
        city: 'Lisbon',
        region: '11',
        longitude: -9.1,
        latitude: 38.7,
      },
      uaInfo: {
        isServer: false,
        device: 'desktop',
        os: 'macOS',
        osVersion: '15',
        browser: 'Chrome',
        browserVersion: '148',
        brand: '',
        model: '',
      },
      headers: { 'user-agent': 'Mozilla/5.0 (Macintosh)' },
      event: {
        name,
        properties: { __path: `https://example.com${path}` },
        timestamp: Date.now(),
        isTimestampFromThePast: false,
      },
    },
  };
}

describe('project events service', () => {
  it('stores a tracked event before answering and returns its identity', async () => {
    const { engine, service, storedCount } = await createService();
    const result = await service.track({
      draft: draft('screen_view', '/pricing'),
      project: { firstEventAt: null, filters: [] },
    });

    expect(result.deviceId).not.toBe('');
    expect(result.sessionId).not.toBe('');
    expect(result.duplicate).toBe(false);
    expect(storedCount()).toBe(1);

    const page = await engine.listEvents();
    const names = page.events.map((event) => event.name);
    expect(names).toContain('screen_view');
    expect(names).toContain('session_start');
    const view = page.events.find((event) => event.name === 'screen_view');
    expect(view?.path).toBe('/pricing');
    expect(view?.country).toBe('PT');
    expect(view?.device_id).toBe(result.deviceId);
  });

  it('flags the first event only while the project has none', async () => {
    const { service } = await createService();
    const first = await service.track({
      draft: draft('screen_view'),
      project: { firstEventAt: null },
    });
    const later = await service.track({
      draft: draft('screen_view'),
      project: { firstEventAt: new Date() },
    });
    expect(first.firstEvent).toBe(true);
    expect(later.firstEvent).toBe(false);
  });

  it('keeps one session for a returning visitor and resolves it again', async () => {
    const { service } = await createService();
    const one = await service.track({
      draft: draft('screen_view'),
      project: null,
    });
    const two = await service.track({ draft: draft('sign_up'), project: null });
    expect(two.sessionId).toBe(one.sessionId);

    const device = draft('x').device;
    if (!device) {
      throw new Error('draft has a device');
    }
    const resolved = await service.resolveDevice(device);
    expect(resolved).toEqual({
      deviceId: one.deviceId,
      sessionId: one.sessionId,
    });
    const [existing] = await service.getExistingSessions(PROJECT_ID, [
      one.deviceId,
    ]);
    expect(existing?.id).toBe(one.sessionId);
  });

  it('drops a repeated request inside the dedupe window', async () => {
    const { engine, service } = await createService();
    await service.track({
      draft: draft('click'),
      project: null,
      dedupeKey: 'same',
    });
    const again = await service.track({
      draft: draft('click'),
      project: null,
      dedupeKey: 'same',
    });
    expect(again.duplicate).toBe(true);
    const page = await engine.listEvents({ names: ['click'] });
    expect(page.events).toHaveLength(1);
  });

  it('archives stored chunks as one ndjson object per event hour', async () => {
    const { engine, service } = await createService();
    await service.track({ draft: draft('screen_view'), project: null });
    await service.track({ draft: draft('sign_up'), project: null });
    await engine.flush();

    const chunks = await engine.readChunks(0, 100);
    const objects = buildArchiveObjects(PROJECT_ID, chunks);
    expect(objects.length).toBeGreaterThan(0);
    const [object] = objects;
    expect(object?.key).toMatch(
      /^v1\/events\/project_id=project-service\/date=\d{4}-\d{2}-\d{2}\/hour=\d{2}\/\d+-\d+\.ndjson$/
    );
    const lines = object?.body.trim().split('\n') ?? [];
    const total = objects.reduce((sum, o) => sum + o.events, 0);
    expect(lines.length).toBe(object?.events ?? -1);
    expect(total).toBe(chunks.reduce((sum, c) => sum + c.events.length, 0));
    expect(JSON.parse(lines[0] ?? '{}').project_id).toBe(PROJECT_ID);
  });
});
