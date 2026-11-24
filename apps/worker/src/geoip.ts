/**
 * IP geolocation on Cloudflare, for what `request.cf` cannot answer: events a
 * server sends with the visitor's address (`__ip`) and the IP lookup tool.
 * Data: DB-IP "IP to City Lite" (CC BY 4.0), in its own D1 database (GEO_DB)
 * so the main database and its backups stay small. Without the binding the
 * feature is off and nothing here runs.
 *
 * Refresh (monthly, and on first deploy): one queue message per step.
 * 1. download: the month's file, gunzipped, into R2 (`geo/…csv`); create the
 *    next generation's tables.
 * 2. load: ~4 MB of the file per step (~45,000 ranges), inserted in batches;
 *    the position is saved after each step, so a retried step repeats rows
 *    harmlessly (`OR REPLACE`).
 * 3. switch: readers move to the new generation, the old tables and the R2
 *    copy are removed.
 * Writes: ~8.3M rows a month (50M are included in Workers Paid).
 *
 * Lookups: one indexed query on a cache miss; answers are cached a day in
 * this data centre's cache and in memory.
 */
import { type GeoLocation, geoipDbip } from '@flarepanel/core';
import type { CacheStore } from '@flarepanel/platform';
import { createImportFileStore } from './ingest/import-files';

const {
  compareKeys,
  createTablesSql,
  dbipCityLiteUrl,
  dropTablesSql,
  insertSql,
  ipToKey,
  keyHex,
  linesInChunk,
  lookupSql,
  monthOf,
  parseDbipLine,
} = geoipDbip;

export const GEOIP_MESSAGE_KIND = 'geoip-refresh';
const FILE_KEY = 'geo/dbip-city-lite.csv';
const MAX_FILE_BYTES = 2 * 1024 * 1024 * 1024;
const CHUNK_BYTES = 4 * 1024 * 1024;
const READ_MARGIN_BYTES = 4096;
/** A refresh that stopped moving for this long may be started again. */
const STALE_REFRESH_MS = 6 * 60 * 60 * 1000;
const ACTIVE_TTL_MS = 10 * 60 * 1000;
const LOOKUP_TTL_SECONDS = 24 * 60 * 60;
const D1_BATCH_STATEMENTS = 50;
/** DB-IP publishes on the 1st; refresh on the 2nd at 04:00 UTC. */
const REFRESH_DAY = 2;
const REFRESH_HOUR = 4;

export interface GeoipEnv {
  GEO_DB?: D1Database;
  EVENTS_ARCHIVE?: R2Bucket;
  JOBS: Queue;
}

interface RefreshState {
  phase: 'download' | 'load' | 'switch';
  generation: number;
  month?: string;
  size?: number;
  offset?: number;
  rows?: number;
  movedAt: number;
}

async function ensureMeta(db: D1Database) {
  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS geo_meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)'
    )
    .run();
}

async function getMeta(db: D1Database, key: string): Promise<string | null> {
  const row = await db
    .prepare('SELECT v FROM geo_meta WHERE k = ?')
    .bind(key)
    .first<{ v: string }>();
  return row?.v ?? null;
}

async function setMeta(db: D1Database, key: string, value: string | null) {
  if (value === null) {
    await db.prepare('DELETE FROM geo_meta WHERE k = ?').bind(key).run();
    return;
  }
  await db
    .prepare(
      'INSERT INTO geo_meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v'
    )
    .bind(key, value)
    .run();
}

async function runStatements(db: D1Database, statements: string[]) {
  for (let i = 0; i < statements.length; i += D1_BATCH_STATEMENTS) {
    await db.batch(
      statements.slice(i, i + D1_BATCH_STATEMENTS).map((sql) => db.prepare(sql))
    );
  }
}

// ---------------------------------------------------------------------------
// Lookups

let activeGeneration: { value: number | null; at: number } | undefined;

async function currentGeneration(db: D1Database): Promise<number | null> {
  if (activeGeneration && Date.now() - activeGeneration.at < ACTIVE_TTL_MS) {
    return activeGeneration.value;
  }
  await ensureMeta(db);
  const raw = await getMeta(db, 'active');
  const value = raw ? Number(raw) : null;
  activeGeneration = { value, at: Date.now() };
  return value;
}

function toBytes(value: unknown): Uint8Array | null {
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  if (Array.isArray(value)) {
    return Uint8Array.from(value as number[]);
  }
  return null;
}

export function createGeoipLookup(db: D1Database, cache: CacheStore) {
  return async (ip: string): Promise<GeoLocation | null> => {
    const key = ipToKey(ip);
    if (!key) {
      return null;
    }
    const cacheKey = `geoip:${keyHex(key)}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached === '-' ? null : (JSON.parse(cached) as GeoLocation);
    }
    const generation = await currentGeneration(db);
    if (!generation) {
      return null;
    }
    const row = await db
      .prepare(lookupSql(generation))
      .bind(key.buffer.slice(key.byteOffset, key.byteOffset + 16))
      .first<{
        e: unknown;
        country: string;
        region: string;
        city: string;
        lat: number;
        lon: number;
      }>();
    const end = row ? toBytes(row.e) : null;
    const found =
      row && end && compareKeys(end, key) >= 0 && row.country !== 'ZZ'
        ? {
            country: row.country || undefined,
            region: row.region || undefined,
            city: row.city || undefined,
            latitude: row.lat,
            longitude: row.lon,
          }
        : null;
    await cache.set(
      cacheKey,
      found ? JSON.stringify(found) : '-',
      LOOKUP_TTL_SECONDS
    );
    return found;
  };
}

// ---------------------------------------------------------------------------
// Refresh

async function enqueueStep(env: GeoipEnv) {
  await env.JOBS.send({ kind: GEOIP_MESSAGE_KIND });
}

async function readState(db: D1Database): Promise<RefreshState | null> {
  const raw = await getMeta(db, 'refresh');
  return raw ? (JSON.parse(raw) as RefreshState) : null;
}

async function writeState(db: D1Database, state: RefreshState | null) {
  await setMeta(
    db,
    'refresh',
    state ? JSON.stringify({ ...state, movedAt: Date.now() }) : null
  );
}

/** Starts a refresh unless one is moving; true when it started. */
export async function startGeoipRefresh(env: GeoipEnv): Promise<boolean> {
  const db = env.GEO_DB;
  if (!(db && env.EVENTS_ARCHIVE)) {
    return false;
  }
  await ensureMeta(db);
  const running = await readState(db);
  if (running && Date.now() - running.movedAt < STALE_REFRESH_MS) {
    return false;
  }
  const active = Number((await getMeta(db, 'active')) ?? 0);
  await writeState(db, {
    phase: 'download',
    generation: active + 1,
    movedAt: Date.now(),
  });
  await enqueueStep(env);
  return true;
}

let loadedOnce = false;

/** From the cron: the monthly refresh, or the first load until one exists. */
export async function maybeStartGeoipRefresh(
  env: GeoipEnv,
  scheduledTime: number
): Promise<void> {
  const db = env.GEO_DB;
  if (!db) {
    return;
  }
  const at = new Date(scheduledTime);
  const monthly =
    at.getUTCMinutes() === 0 &&
    at.getUTCDate() === REFRESH_DAY &&
    at.getUTCHours() === REFRESH_HOUR;
  if (!monthly && loadedOnce) {
    return;
  }
  await ensureMeta(db);
  const neverLoaded = !(await getMeta(db, 'active'));
  loadedOnce = !neverLoaded;
  if (monthly || neverLoaded) {
    await startGeoipRefresh(env);
  }
}

async function downloadStep(env: GeoipEnv, state: RefreshState) {
  const db = env.GEO_DB as D1Database;
  const bucket = env.EVENTS_ARCHIVE as R2Bucket;
  const now = Date.now();
  // The 1st's file may not be out yet early on the 1st: fall back a month.
  const months = [monthOf(now), monthOf(now - 20 * 24 * 60 * 60 * 1000)];
  let response: Response | undefined;
  let month = '';
  for (const candidate of months) {
    const attempt = await fetch(dbipCityLiteUrl(candidate));
    if (attempt.ok && attempt.body) {
      response = attempt;
      month = candidate;
      break;
    }
    await attempt.body?.cancel();
  }
  if (!response?.body) {
    throw new Error('No DB-IP City Lite file for this or last month');
  }
  const size = await createImportFileStore(bucket).put(
    FILE_KEY,
    response.body.pipeThrough(
      new DecompressionStream('gzip')
    ) as ReadableStream<Uint8Array>,
    MAX_FILE_BYTES
  );
  await runStatements(db, createTablesSql(state.generation));
  return {
    ...state,
    phase: 'load' as const,
    month,
    size,
    offset: 0,
    rows: 0,
  };
}

async function loadStep(env: GeoipEnv, state: RefreshState) {
  const db = env.GEO_DB as D1Database;
  const bucket = env.EVENTS_ARCHIVE as R2Bucket;
  const offset = state.offset ?? 0;
  const size = state.size ?? 0;
  const from = Math.max(0, offset - 1);
  const to = Math.min(size, offset + CHUNK_BYTES + READ_MARGIN_BYTES);
  const object = await bucket.get(FILE_KEY, {
    range: { offset: from, length: to - from },
  });
  if (!object) {
    throw new Error('The GeoIP file copy is missing');
  }
  const bytes = new Uint8Array(await object.arrayBuffer());
  const ranges = linesInChunk(bytes, offset, CHUNK_BYTES, to === size)
    .map((line) => parseDbipLine(line))
    .filter((range) => range !== null);
  await runStatements(db, insertSql(state.generation, ranges));
  const next = offset + CHUNK_BYTES;
  return {
    ...state,
    phase: next >= size ? ('switch' as const) : ('load' as const),
    offset: next,
    rows: (state.rows ?? 0) + ranges.length,
  };
}

async function switchStep(env: GeoipEnv, state: RefreshState) {
  const db = env.GEO_DB as D1Database;
  const previous = Number((await getMeta(db, 'active')) ?? 0);
  await setMeta(db, 'active', String(state.generation));
  await setMeta(
    db,
    'loaded',
    JSON.stringify({
      generation: state.generation,
      month: state.month,
      rows: state.rows,
      at: new Date().toISOString(),
    })
  );
  activeGeneration = undefined;
  if (previous > 0 && previous !== state.generation) {
    await runStatements(db, dropTablesSql(previous));
  }
  await env.EVENTS_ARCHIVE?.delete(FILE_KEY);
}

/** One refresh step per queue message; enqueues the next until done. */
export async function runGeoipRefreshStep(env: GeoipEnv): Promise<void> {
  const db = env.GEO_DB;
  if (!(db && env.EVENTS_ARCHIVE)) {
    return;
  }
  await ensureMeta(db);
  const state = await readState(db);
  if (!state) {
    return;
  }
  if (state.phase === 'switch') {
    await switchStep(env, state);
    await writeState(db, null);
    return;
  }
  const next =
    state.phase === 'download'
      ? await downloadStep(env, state)
      : await loadStep(env, state);
  await writeState(db, next);
  await enqueueStep(env);
}
