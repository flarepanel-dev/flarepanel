import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import { gunzipSync, gzipSync } from 'node:zlib';
import type { IClickhouseEvent } from '../../event/event.service';
import {
  type ArchiveBucket,
  buildArchiveObjects,
  createArchiveColdStore,
} from './archive';
import { type EngineSql, openProjectEventsEngine, type SqlRow } from './engine';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 23, 12);
const CUTOFF = NOW - 90 * DAY;

function event(id: string, at: number, name = 'screen_view'): IClickhouseEvent {
  return {
    id,
    name,
    project_id: 'p1',
    created_at: new Date(at).toISOString().replace('T', ' ').replace('Z', ''),
    profile_id: `u-${id}`,
    device_id: `d-${id}`,
    session_id: `s-${id}`,
    properties: {},
    path: '/',
    origin: 'https://example.com',
    country: 'SE',
    groups: [],
  } as unknown as IClickhouseEvent;
}

function fakeBucket(events: IClickhouseEvent[]) {
  const objects = new Map<string, Uint8Array>();
  const chunks = [{ id: 1, tsMin: 0, tsMax: 0, events }];
  for (const object of buildArchiveObjects('p1', chunks)) {
    objects.set(`${object.key}.gz`, gzipSync(object.body));
  }
  const reads: string[] = [];
  const bucket: ArchiveBucket = {
    list: ({ prefix }) =>
      Promise.resolve({
        objects: [...objects.keys()]
          .filter((key) => key.startsWith(prefix))
          .map((key) => ({ key })),
        truncated: false,
      }),
    get: (key) => {
      reads.push(key);
      const bytes = objects.get(key);
      return Promise.resolve(
        bytes
          ? {
              arrayBuffer: () =>
                Promise.resolve(
                  bytes.buffer.slice(
                    bytes.byteOffset,
                    bytes.byteOffset + bytes.byteLength
                  ) as ArrayBuffer
                ),
            }
          : null
      );
    },
  };
  return { bucket, reads };
}

function coldStore(bucket: ArchiveBucket, maxObjects = 100) {
  return createArchiveColdStore({
    bucket,
    projectId: () => 'p1',
    before: () => CUTOFF,
    gunzip: (bytes) => new Uint8Array(gunzipSync(bytes)),
    maxObjects,
  });
}

describe('archive cold store', () => {
  const archived = [
    event('old-1', CUTOFF - 30 * DAY),
    event('old-2', CUTOFF - 30 * DAY + 3_600_000),
    event('old-3', CUTOFF - 2 * DAY),
  ];

  it('reads only the hours that overlap the range', async () => {
    const { bucket, reads } = fakeBucket(archived);
    const seen: string[] = [];
    const complete = await coldStore(bucket).scan(
      CUTOFF - 31 * DAY,
      CUTOFF - 30 * DAY + 60_000,
      (item) => seen.push(item.id)
    );
    expect(complete).toBe(true);
    expect(seen).toEqual(['old-1']);
    expect(reads).toHaveLength(1);
  });

  it('stops at its read budget and says so', async () => {
    const { bucket } = fakeBucket(archived);
    const seen: string[] = [];
    const complete = await coldStore(bucket, 1).scan(
      CUTOFF - 40 * DAY,
      CUTOFF - 1,
      (item) => seen.push(item.id)
    );
    expect(complete).toBe(false);
    expect(seen).toHaveLength(1);
  });

  it('lets reports reach past the hot window without counting twice', async () => {
    const db = new Database(':memory:');
    const sql: EngineSql = {
      exec(query, ...bindings) {
        const statement = db.query(query);
        if (/^\s*(INSERT|UPDATE|DELETE|REPLACE)/i.test(query)) {
          statement.run(...(bindings as SQLQueryBindings[]));
          return [];
        }
        return statement.all(...(bindings as SQLQueryBindings[])) as SqlRow[];
      },
      transaction: (fn) => db.transaction(fn)(),
    };
    // old-3 is still in the chunks too: retention has not pruned it yet.
    const recent = event('new-1', NOW - DAY);
    const { bucket } = fakeBucket([...archived, recent]);
    const engine = await openProjectEventsEngine({
      sql,
      clock: {
        now: () => NOW,
        setTimeout: () => 0,
        clearTimeout: () => undefined,
      },
      codec: {
        compress: (bytes) => Promise.resolve(gzipSync(bytes)),
        decompress: (bytes) => Promise.resolve(gunzipSync(bytes)),
      },
      cold: coldStore(bucket),
    });
    for (const item of [archived[2], recent] as IClickhouseEvent[]) {
      await engine.createEvent({
        name: item.name,
        projectId: 'p1',
        deviceId: item.device_id,
        profileId: item.profile_id,
        sessionId: item.session_id,
        country: 'SE',
        properties: {},
        createdAt: new Date(`${item.created_at.replace(' ', 'T')}Z`),
        path: '/',
        origin: 'https://example.com',
        referrer: '',
        referrerName: '',
        referrerType: '',
        sdkName: '',
        sdkVersion: '',
        groups: [],
      });
    }
    await engine.flush();

    const { totals, partial } = await engine.metrics({
      from: CUTOFF - 60 * DAY,
      to: NOW,
      interval: 'month',
      timezone: 'UTC',
      filters: [{ name: 'country', operator: 'is', value: ['SE'] }],
    });
    expect(partial).toBeUndefined();
    // old-1, old-2 (archive only), old-3 (archive, also in chunks), new-1 (chunks).
    expect(totals.screenViews).toBe(4);
  });
});
