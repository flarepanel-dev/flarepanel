import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import { gzipSync } from 'node:zlib';
import type { IClickhouseEvent } from '../../event/event.service';
import type { EngineSql, SqlRow } from '../../ingest/cloudflare/engine';
import {
  type ImportQuery,
  openImportStore,
} from '../../ingest/cloudflare/import-store';
import type { IClickhouseSession } from '../../session/session.service';
import type { IImportConfig } from '../import.constants';
import { UmamiProvider } from './providers/umami';
import { ndjsonRecords, readZip } from './web-unzip';
import {
  type ImportFileStore,
  recordBoundary,
  runWorkersImportStep,
  type WorkersImportProvider,
} from './workers-import';

function memorySql(): EngineSql {
  const db = new Database(':memory:');
  return {
    exec(query, ...bindings) {
      return db
        .query(query)
        .all(...(bindings as SQLQueryBindings[])) as SqlRow[];
    },
    transaction: (fn) => db.transaction(fn)(),
  };
}

/** One import store per project, as each project's Durable Object holds one. */
function fakeProjects() {
  const stores = new Map<string, ReturnType<typeof openImportStore>>();
  const appended = new Map<string, IClickhouseEvent[]>();
  const logged = new Map<string, IClickhouseSession[]>();
  const storeOf = (projectId: string) => {
    let store = stores.get(projectId);
    if (!store) {
      store = openImportStore(memorySql());
      stores.set(projectId, store);
    }
    return store;
  };
  const importOp = async (projectId: string, query: ImportQuery) => {
    const store = storeOf(projectId);
    const hooks = {
      appendEvents: (events: IClickhouseEvent[]) => {
        appended.set(projectId, [
          ...(appended.get(projectId) ?? []),
          ...events,
        ]);
        return Promise.resolve();
      },
      logSessions: (sessions: IClickhouseSession[]) => {
        logged.set(projectId, [...(logged.get(projectId) ?? []), ...sessions]);
      },
    };
    switch (query.kind) {
      case 'stage':
        return JSON.stringify(
          store.stage(
            query.importId,
            JSON.parse(query.eventsJson),
            query.from,
            query.to,
            query.done
          )
        );
      case 'sessions':
        return JSON.stringify(
          store.buildSessions(query.importId, query.maxRows, 'now')
        );
      case 'commit':
        return JSON.stringify(
          await store.commit(query.importId, query.maxRows, hooks)
        );
      case 'logSessions':
        return JSON.stringify(
          store.logSessions(query.importId, query.maxRows, hooks)
        );
      case 'cleanup':
        store.cleanup(query.importId);
        return 'null';
      default:
        return JSON.stringify(store.state(query.importId));
    }
  };
  return { importOp, appended, logged, storeOf };
}

function fakeFiles(): ImportFileStore & { keys(): string[] } {
  const objects = new Map<string, Uint8Array>();
  return {
    keys: () => [...objects.keys()],
    async put(key, body, maxBytes) {
      const bytes = new Uint8Array(await new Response(body).arrayBuffer());
      if (bytes.length > maxBytes) {
        throw new Error('too large');
      }
      objects.set(key, bytes);
      return bytes.length;
    },
    readRange(key, offset, length) {
      const bytes = objects.get(key);
      if (!bytes) {
        return Promise.reject(new Error('missing'));
      }
      return Promise.resolve(bytes.slice(offset, offset + length));
    },
    read(key) {
      const bytes = objects.get(key);
      return Promise.resolve(bytes ? new Blob([bytes]).stream() : null);
    },
    removePrefix(prefix) {
      for (const key of [...objects.keys()]) {
        if (key.startsWith(prefix)) {
          objects.delete(key);
        }
      }
      return Promise.resolve();
    },
  };
}

function fakeDb(config: IImportConfig) {
  const record = {
    id: 'imp-1',
    projectId: 'p1',
    status: 'pending',
    config,
  };
  return {
    record,
    db: {
      import: {
        findUnique: () => Promise.resolve(record),
      },
    } as never,
  };
}

const silent = {
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
  debug: () => undefined,
  trace: () => undefined,
  fatal: () => undefined,
  child: () => silent,
} as never;

async function runToEnd(
  input: Omit<Parameters<typeof runWorkersImportStep>[0], 'progress'>,
  maxSteps = 200
) {
  const steps: string[] = [];
  let clock = 0;
  for (let index = 0; index < maxSteps; index++) {
    const result = await runWorkersImportStep({
      ...input,
      // Every call advances a second: steps end after three, like slices.
      now: () => {
        clock += 1000;
        return clock;
      },
      progress: (progress) => {
        steps.push(progress.step);
        return Promise.resolve();
      },
    });
    if (result.done || result.delayMs) {
      return { result, steps };
    }
  }
  throw new Error('import did not finish');
}

const HEADER =
  'website_id,session_id,visit_id,event_id,event_type,event_name,created_at,hostname,url_path,page_title,country,browser,os,device';

function umamiRow(
  website: string,
  session: string,
  event: number,
  minute: number,
  title = 'Home'
) {
  const at = new Date(Date.UTC(2025, 0, 10, 12, minute)).toISOString();
  return `${website},${session},v-${session},00000000-0000-4000-8000-${String(event).padStart(12, '0')},1,,${at},x.io,/p${event},"${title}",DE,Chrome,macOS,desktop`;
}

/** A ZIP with one deflated and one stored entry, built by hand. */
function zip(entries: { name: string; data: Uint8Array; deflate: boolean }[]) {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const body = entry.deflate
      ? Bun.deflateSync(new Uint8Array(entry.data))
      : entry.data;
    const local = new Uint8Array(30 + name.length + body.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04_03_4b_50, true);
    lv.setUint16(8, entry.deflate ? 8 : 0, true);
    lv.setUint32(18, body.length, true);
    lv.setUint32(22, entry.data.length, true);
    lv.setUint16(26, name.length, true);
    local.set(name, 30);
    local.set(body, 30 + name.length);
    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02_01_4b_50, true);
    cv.setUint16(10, entry.deflate ? 8 : 0, true);
    cv.setUint32(20, body.length, true);
    cv.setUint32(24, entry.data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    central.set(name, 46);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  const centralSize = centrals.reduce((sum, c) => sum + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06_05_4b_50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  return new Uint8Array(
    Buffer.concat(
      [...locals, ...centrals, end].map((part) => Buffer.from(part))
    )
  );
}

describe('imports on Workers', () => {
  it('finds record boundaries outside quoted fields', () => {
    const bytes = new TextEncoder().encode('a,"x\ny"\nb,c\nd');
    expect(recordBoundary(bytes, true)).toBe(12);
    expect(recordBoundary(bytes, false)).toBe(12);
    expect(recordBoundary(new TextEncoder().encode('a,"x\ny'), true)).toBe(0);
  });

  it('imports an Umami CSV into each mapped project, slice by slice', async () => {
    const csv = [
      HEADER,
      umamiRow('site-a', 's1', 1, 0),
      umamiRow('site-a', 's1', 2, 5, 'Multi\nline title'),
      umamiRow('site-b', 's2', 3, 1),
      umamiRow('site-a', 's3', 4, 90),
      'broken-row-without-columns',
    ].join('\n');
    const config = {
      provider: 'umami',
      type: 'file',
      fileUrl: 'https://files.example.com/umami.csv.gz',
      projectMapper: [
        { from: 'site-a', to: 'p1' },
        { from: 'site-b', to: 'p2' },
      ],
    } as IImportConfig;
    const projects = fakeProjects();
    const files = fakeFiles();
    const { db, record } = fakeDb(config);
    const { result, steps } = await runToEnd({
      deps: {
        db,
        eventStore: {
          importOp: projects.importOp,
          importFiles: files,
        } as never,
        logger: silent,
      },
      importId: record.id,
      createProvider: (projectId, cfg) =>
        Promise.resolve(
          new UmamiProvider(
            projectId,
            cfg as never
          ) as unknown as WorkersImportProvider
        ),
      // Gzipped source, read in slices smaller than two rows.
      fetchSource: () =>
        Promise.resolve({
          status: 200,
          headers: new Headers(),
          body: new Blob([gzipSync(csv)]).stream(),
          finalUrl: '',
          chain: [],
          close: () => Promise.resolve(),
        }),
      sliceBytes: 300,
    });

    expect(result.done).toBe(true);
    expect(steps.at(-1)).toBe('completed');
    const p1 = projects.appended.get('p1') ?? [];
    const p2 = projects.appended.get('p2') ?? [];
    // p1: 3 page views + 2 sessions (start/end); p2: 1 + 1 session.
    expect(p1.filter((e) => e.name === 'screen_view')).toHaveLength(3);
    expect(p1.filter((e) => e.name === 'session_start')).toHaveLength(2);
    expect(p2.map((e) => e.name).sort()).toEqual([
      'screen_view',
      'session_end',
      'session_start',
    ]);
    expect(p1.every((e) => e.project_id === 'p1')).toBe(true);
    expect(
      projects.logged
        .get('p1')
        ?.map((s) => s.id)
        .sort()
    ).toEqual(['s1', 's3']);
    // Committed in time order, and nothing left behind.
    const times = p1.map((e) => e.created_at);
    expect([...times].sort()).toEqual(times);
    expect(files.keys()).toEqual([]);
    expect(projects.storeOf('p1').state(record.id).staged).toBe(0);
  });

  it('downloads each API day once and waits out a rate limit', async () => {
    const day = (date: string, n: number) =>
      Array.from({ length: n }, (_, index) =>
        JSON.stringify({
          id: `${date}-${index}`,
          at: `${date}T10:0${index}:00Z`,
        })
      ).join('\n');
    let rateLimited = true;
    const fetched: string[] = [];
    const provider: WorkersImportProvider = {
      validate: (raw) => typeof (raw as { id?: unknown }).id === 'string',
      transformEvent: (raw) => {
        const { id, at } = raw as { id: string; at: string };
        return {
          id,
          name: 'purchase',
          device_id: 'dev',
          profile_id: 'dev',
          project_id: 'p1',
          session_id: '',
          properties: {},
          created_at: at.replace('T', ' ').replace('Z', ''),
          device: 'desktop',
        } as unknown as IClickhouseEvent;
      },
      fetchDayExport: (date) => {
        if (date === '2025-01-02' && rateLimited) {
          rateLimited = false;
          const error = new Error('Mixpanel rate limit exceeded (429)');
          Object.assign(error, { retryAfterMs: 5000 });
          return Promise.reject(error);
        }
        fetched.push(date);
        return Promise.resolve(
          new Response(date === '2025-01-03' ? '' : day(date, 3))
        );
      },
    };
    const config = {
      provider: 'mixpanel',
      type: 'api',
      from: '2025-01-01',
      to: '2025-01-03',
    } as IImportConfig;
    const projects = fakeProjects();
    const files = fakeFiles();
    const { db, record } = fakeDb(config);
    const input = {
      deps: {
        db,
        eventStore: {
          importOp: projects.importOp,
          importFiles: files,
        } as never,
        logger: silent,
      },
      importId: record.id,
      createProvider: () => Promise.resolve(provider),
      sliceBytes: 120,
    };
    const first = await runToEnd(input);
    expect(first.result.delayMs).toBe(5000);
    const second = await runToEnd(input);
    expect(second.result.done).toBe(true);
    expect(fetched).toEqual(['2025-01-01', '2025-01-02', '2025-01-03']);
    const committed = projects.appended.get('p1') ?? [];
    expect(committed.filter((e) => e.name === 'purchase')).toHaveLength(6);
    expect(files.keys()).toEqual([]);
  });
  it('unpacks an Amplitude day archive before slicing it', async () => {
    const lines = (day: string) =>
      `${JSON.stringify({ id: `${day}-a`, at: `${day}T08:00:00Z` })}\n${JSON.stringify({ id: `${day}-b`, at: `${day}T08:05:00Z` })}\n`;
    const provider: WorkersImportProvider = {
      validate: () => true,
      transformEvent: (raw) => {
        const { id, at } = raw as { id: string; at: string };
        return {
          id,
          name: 'screen_view',
          device_id: 'dev',
          profile_id: 'dev',
          project_id: 'p1',
          session_id: '',
          properties: {},
          created_at: at.replace('T', ' ').replace('Z', ''),
          device: 'desktop',
        } as unknown as IClickhouseEvent;
      },
      fetchDayExport: (date) =>
        Promise.resolve(
          new Response(
            zip([
              {
                name: `1/${date}_0#0.json.gz`,
                data: new Uint8Array(gzipSync(lines(date))),
                deflate: true,
              },
            ])
          )
        ),
    };
    const config = {
      provider: 'amplitude',
      type: 'api',
      from: '2025-02-01',
      to: '2025-02-02',
    } as IImportConfig;
    const projects = fakeProjects();
    const files = fakeFiles();
    const { db, record } = fakeDb(config);
    const { result } = await runToEnd({
      deps: {
        db,
        eventStore: {
          importOp: projects.importOp,
          importFiles: files,
        } as never,
        logger: silent,
      },
      importId: record.id,
      createProvider: () => Promise.resolve(provider),
    });
    expect(result.done).toBe(true);
    const committed = projects.appended.get('p1') ?? [];
    expect(
      committed.filter((e) => e.name === 'screen_view').map((e) => e.id)
    ).toEqual(['2025-02-01-a', '2025-02-01-b', '2025-02-02-a', '2025-02-02-b']);
    // One session per day (a day apart), each with start and end.
    expect(committed.filter((e) => e.name === 'session_start')).toHaveLength(2);
  });
});

describe('web unzip', () => {
  it('reads deflated and stored entries and gzipped NDJSON', async () => {
    const lines = '{"a":1}\n{"a":2}\nnot json\n';
    const archive = zip([
      {
        name: '123/2025-01-01_0#0.json.gz',
        data: new Uint8Array(gzipSync(lines)),
        deflate: true,
      },
      {
        name: 'readme.txt',
        data: new TextEncoder().encode('hi'),
        deflate: false,
      },
    ]);
    const entries = readZip(archive);
    expect(entries.map((entry) => entry.name)).toEqual([
      '123/2025-01-01_0#0.json.gz',
      'readme.txt',
    ]);
    const records: unknown[] = [];
    let bad = 0;
    for await (const record of ndjsonRecords(await entries[0]!.read(), () => {
      bad += 1;
    })) {
      records.push(record);
    }
    expect(records).toEqual([{ a: 1 }, { a: 2 }]);
    expect(bad).toBe(1);
    expect(new TextDecoder().decode(await entries[1]!.read())).toBe('hi');
  });
});
