// Imports on Cloudflare Workers. A queue job runs one short step (about three
// seconds) and enqueues the next, so no step meets the Worker's CPU limit and
// a failed step is simply run again:
// 1. Source: the file (Umami CSV) or each day's API export (Mixpanel JSON
//    lines, Amplitude ZIP) is copied once into R2 under `imports/`; then read
//    in byte slices that end on a record boundary. Each slice's events are
//    staged in the project's Durable Object together with the position it
//    reached, so a slice is never staged twice. Mixpanel profiles follow.
// 2. Sessions: gap-based sessions per device (see import-sessions.ts).
// 3. Commit: staged events go into the project's event store in time order.
// 4. Sessions are logged for the Sessions page; staging and R2 copies removed.

import { safeFetchStream } from '@flarepanel/shared/server';
import { parse } from 'csv-parse/sync';
import type { Logger } from '../../../logger';
import type { ServiceDeps } from '../../../services';
import type { IClickhouseEvent } from '../../event/event.service';
import type {
  ImportQuery,
  ImportState,
} from '../../ingest/cloudflare/import-store';
import type { IClickhouseProfile } from '../../profile/profile.service';
import type { IImportConfig } from '../import.constants';
import { gunzip, isGzip, readZip } from './web-unzip';

/** R2 access for import copies (the Worker's archive bucket, `imports/` prefix). */
export interface ImportFileStore {
  /** Streams a body into storage; returns its size. Throws past `maxBytes`. */
  put(
    key: string,
    body: ReadableStream<Uint8Array>,
    maxBytes: number
  ): Promise<number>;
  readRange(key: string, offset: number, length: number): Promise<Uint8Array>;
  read(key: string): Promise<ReadableStream<Uint8Array> | null>;
  removePrefix(prefix: string): Promise<void>;
}

/** The provider surface the Worker steps use. */
export interface WorkersImportProvider {
  validate(raw: unknown): boolean;
  transformEvent(raw: unknown): IClickhouseEvent;
  transformEventToProfile?(raw: unknown): IClickhouseProfile | null;
  streamProfiles?(): AsyncGenerator<unknown>;
  transformProfile?(raw: unknown): IClickhouseProfile | null;
  fetchDayExport?(day: string): Promise<Response | null>;
}

export interface WorkersImportStep {
  done: boolean;
  /** Wait this long before the next step (a provider rate limit). */
  delayMs?: number;
}

type Position =
  | { k: 'csv'; key: string; offset: number; size: number; header: string[] }
  | { k: 'day'; day: string; key?: string; offset?: number; size?: number }
  | { k: 'profiles'; skip: number };

const STEP_WALL_MS = 3000;
const SLICE_BYTES = 2 * 1024 * 1024;
const MAX_SOURCE_BYTES = 2_000_000_000;
const MAX_RECORD_BYTES = 1024 * 1024;
const PROFILE_BATCH = 2000;
const SESSIONS_ROWS = 20_000;
const COMMIT_ROWS = 5000;
const LOG_ROWS = 2000;
const DAY_MS = 24 * 60 * 60 * 1000;
const NEWLINE = 0x0a;
const QUOTE = 0x22;
const decoder = new TextDecoder();

export const importPrefix = (projectId: string, importId: string) =>
  `imports/${encodeURIComponent(projectId)}/${importId}/`;

function nextDay(day: string): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/**
 * Bytes up to the last complete record: after the last newline that is not
 * inside a quoted CSV field (`quoted` false: after the last newline).
 */
export function recordBoundary(bytes: Uint8Array, quoted: boolean): number {
  let inQuotes = false;
  let last = 0;
  for (let index = 0; index < bytes.length; index++) {
    const byte = bytes[index];
    if (quoted && byte === QUOTE) {
      inQuotes = !inQuotes;
    } else if (byte === NEWLINE && !inQuotes) {
      last = index + 1;
    }
  }
  return last;
}

/** An event row as the ClickHouse import stages it. */
function staged(event: IClickhouseEvent, now: string): IClickhouseEvent {
  return { ...event, imported_at: event.imported_at || now };
}

/** A profile as the ClickHouse import inserts it (empty properties dropped). */
function normalizedProfile(
  profile: IClickhouseProfile,
  projectId: string
): IClickhouseProfile {
  return {
    ...profile,
    project_id: projectId,
    first_name: profile.first_name ?? '',
    last_name: profile.last_name ?? '',
    email: profile.email ?? '',
    avatar: profile.avatar ?? '',
    is_external: profile.is_external ?? true,
    properties: Object.fromEntries(
      Object.entries(profile.properties || {}).filter(
        ([, value]) => value != null && value !== ''
      )
    ),
    last_seen_at: profile.last_seen_at ?? profile.created_at,
    groups: profile.groups ?? [],
  };
}

export interface WorkersImportInput {
  deps: Pick<ServiceDeps, 'db' | 'eventStore'> & { logger: Logger };
  importId: string;
  createProvider: (
    projectId: string,
    config: IImportConfig
  ) => Promise<WorkersImportProvider>;
  progress: (
    step:
      | { step: 'loading'; batch?: string; processedEvents?: number }
      | { step: 'loading_profiles'; processedProfiles?: number }
      | { step: 'creating_sessions' }
      | { step: 'moving'; batch?: string }
      | { step: 'backfilling_sessions' }
      | { step: 'completed' }
      | { step: 'failed'; errorMessage: string }
  ) => Promise<void>;
  now?: () => number;
  /** Tests: the remote file fetch and the slice size. */
  fetchSource?: typeof safeFetchStream;
  sliceBytes?: number;
}

class RateLimited extends Error {
  constructor(readonly delayMs: number) {
    super('rate limited');
  }
}

/** Runs one step of an import; `done` when it finished (or failed for good). */
export async function runWorkersImportStep(
  input: WorkersImportInput
): Promise<WorkersImportStep> {
  const { deps, importId } = input;
  const now = input.now ?? Date.now;
  const sliceBytes = input.sliceBytes ?? SLICE_BYTES;
  const fetchSource = input.fetchSource ?? safeFetchStream;
  const maybeStore = deps.eventStore;
  const maybeFiles = maybeStore?.importFiles;
  if (!(maybeStore && maybeFiles)) {
    throw new Error('Imports on Workers need the project event store and R2');
  }
  const store: NonNullable<typeof maybeStore> = maybeStore;
  const files: ImportFileStore = maybeFiles;
  const record = await deps.db.import.findUnique({ where: { id: importId } });
  if (!record || record.status === 'completed' || record.status === 'failed') {
    return { done: true };
  }
  const projectId = record.projectId;
  const config = record.config as IImportConfig;
  const prefix = importPrefix(projectId, importId);
  // A file can map its websites to other projects of the organization: each
  // project's events are staged in that project's Durable Object.
  const others = [
    ...new Set(
      ('projectMapper' in config ? config.projectMapper : [])
        .map((mapper) => mapper.to)
        .filter((target) => target && target !== projectId)
    ),
  ];
  const targets = [projectId, ...others];
  const callOn = async (target: string, query: ImportQuery) =>
    JSON.parse(await store.importOp(target, query)) as ImportState;
  const call = (query: ImportQuery) => callOn(projectId, query);
  /**
   * One slice into every target project, the import's own project last: its
   * position is the one the next step reads, and each project skips a slice
   * it already staged, so a retried slice stays exactly once everywhere.
   */
  const stage = async (
    from: Position | null,
    to: Position | null,
    events: IClickhouseEvent[],
    done: boolean,
    profiles: IClickhouseProfile[] = []
  ) => {
    const stamp = new Date(now()).toISOString();
    const byProject = new Map<string, IClickhouseEvent[]>();
    for (const event of events) {
      const target = targets.includes(event.project_id)
        ? event.project_id
        : projectId;
      const list = byProject.get(target) ?? [];
      list.push(staged({ ...event, project_id: target }, stamp));
      byProject.set(target, list);
    }
    const query = (target: string): ImportQuery => ({
      kind: 'stage',
      importId,
      eventsJson: JSON.stringify(byProject.get(target) ?? []),
      profilesJson:
        target === projectId && profiles.length > 0
          ? JSON.stringify(
              profiles.map((profile) => normalizedProfile(profile, projectId))
            )
          : undefined,
      from: from ? JSON.stringify(from) : null,
      to: to ? JSON.stringify(to) : null,
      done,
    });
    for (const target of others) {
      await callOn(target, query(target));
    }
    return call(query(projectId));
  };
  /** The first target project not yet past `done`, or null when all are. */
  const pending = async (done: (state: ImportState) => boolean) => {
    for (const target of targets) {
      const state = await callOn(target, { kind: 'state', importId });
      if (!done(state)) {
        return target;
      }
    }
    return null;
  };

  const provider = await input.createProvider(projectId, config);
  const started = now();
  try {
    while (now() - started < STEP_WALL_MS) {
      const home = await call({ kind: 'state', importId });
      if (!home.sourceDone) {
        const state = await sourceStep();
        await input.progress({
          step: 'loading',
          processedEvents: state.staged,
          batch: progressLabel(state.source),
        });
        continue;
      }
      const sessions = await pending((state) => state.sessionsDone);
      if (sessions) {
        await input.progress({ step: 'creating_sessions' });
        await callOn(sessions, {
          kind: 'sessions',
          importId,
          maxRows: SESSIONS_ROWS,
        });
        continue;
      }
      const commit = await pending((state) => state.commitDone);
      if (commit) {
        const state = await callOn(commit, {
          kind: 'commit',
          importId,
          maxRows: COMMIT_ROWS,
        });
        await input.progress({
          step: 'moving',
          batch: `${state.committed} of ${state.seq}`,
        });
        continue;
      }
      const log = await pending((state) => state.logDone);
      if (log) {
        await input.progress({ step: 'backfilling_sessions' });
        await callOn(log, { kind: 'logSessions', importId, maxRows: LOG_ROWS });
        continue;
      }
      for (const target of targets) {
        await callOn(target, { kind: 'cleanup', importId });
      }
      await files.removePrefix(prefix);
      await input.progress({ step: 'completed' });
      return { done: true };
    }
    return { done: false };
  } catch (error) {
    if (error instanceof RateLimited) {
      return { done: false, delayMs: error.delayMs };
    }
    deps.logger.error({ err: error, importId }, 'Import step failed');
    for (const target of targets) {
      await callOn(target, { kind: 'cleanup', importId }).catch(
        () => undefined
      );
    }
    await files.removePrefix(prefix).catch(() => undefined);
    await input.progress({
      step: 'failed',
      errorMessage:
        error instanceof Error ? error.message : 'The import failed',
    });
    return { done: true };
  }

  function progressLabel(source: string | null): string | undefined {
    if (!source) {
      return;
    }
    const position = JSON.parse(source) as Position;
    if (position.k === 'csv') {
      return `${Math.round((100 * position.offset) / Math.max(1, position.size))}%`;
    }
    return position.k === 'day' ? position.day : 'profiles';
  }

  async function sourceStep(): Promise<ImportState> {
    const state = await call({ kind: 'state', importId });
    const position = state.source
      ? (JSON.parse(state.source) as Position)
      : null;
    if (config.type === 'file') {
      return position?.k === 'csv' ? csvSlice(position) : copyFile();
    }
    if (!position) {
      return stage(null, { k: 'day', day: config.from }, [], false);
    }
    if (position.k === 'profiles') {
      return profilesStep(position);
    }
    if (position.k !== 'day') {
      throw new Error('Unexpected import position');
    }
    if (position.key === undefined) {
      return downloadDay(position);
    }
    return daySlice(position);
  }

  /** Umami: the remote file into R2, gunzipped; then the header row. */
  async function copyFile(): Promise<ImportState> {
    if (!('fileUrl' in config)) {
      throw new Error('This import has no file');
    }
    const remote = await fetchSource(config.fileUrl, {
      timeoutMs: 30_000,
    });
    if (!(remote.status >= 200 && remote.status < 300 && remote.body)) {
      await remote.close();
      throw new Error('Failed to fetch remote file');
    }
    const rawKey = `${prefix}source.raw`;
    let size = await files.put(rawKey, remote.body, MAX_SOURCE_BYTES);
    await remote.close();
    let key = rawKey;
    if (isGzip(await files.readRange(rawKey, 0, 2))) {
      key = `${prefix}source.csv`;
      const raw = await files.read(rawKey);
      if (!raw) {
        throw new Error('The copied import file is missing');
      }
      size = await files.put(
        key,
        raw.pipeThrough(
          new DecompressionStream('gzip') as unknown as ReadableWritablePair<
            Uint8Array,
            Uint8Array
          >
        ),
        MAX_SOURCE_BYTES * 10
      );
      await files.removePrefix(rawKey);
    }
    const head = await files.readRange(key, 0, MAX_RECORD_BYTES);
    const end = head.indexOf(NEWLINE) + 1;
    if (end <= 0) {
      throw new Error('The import file has no header row');
    }
    const [header] = parse(decoder.decode(head.subarray(0, end)), {
      bom: true,
    }) as string[][];
    return stage(
      null,
      { k: 'csv', key, offset: end, size, header: header ?? [] },
      [],
      end >= size
    );
  }

  async function csvSlice(
    position: Extract<Position, { k: 'csv' }>
  ): Promise<ImportState> {
    const bytes = await files.readRange(
      position.key,
      position.offset,
      sliceBytes
    );
    const atEnd = position.offset + bytes.length >= position.size;
    const cut = atEnd ? bytes.length : recordBoundary(bytes, true);
    if (cut === 0) {
      throw new Error('A row of the import file is larger than 2 MB');
    }
    const records = parse(decoder.decode(bytes.subarray(0, cut)), {
      columns: position.header,
      relax_column_count: true,
      skip_empty_lines: true,
      max_record_size: MAX_RECORD_BYTES,
    }) as unknown[];
    const events = records
      .filter((raw) => provider.validate(raw))
      .map((raw) => provider.transformEvent(raw));
    const offset = position.offset + cut;
    return stage(
      position,
      { ...position, offset },
      events,
      offset >= position.size
    );
  }

  /** One day's API export into R2 (Mixpanel lines as sent; Amplitude unzipped). */
  async function downloadDay(
    position: Extract<Position, { k: 'day' }>
  ): Promise<ImportState> {
    if (!('to' in config) || position.day > config.to) {
      return provider.streamProfiles
        ? stage(position, { k: 'profiles', skip: 0 }, [], false)
        : stage(position, position, [], true);
    }
    let response: Response | null;
    try {
      response = (await provider.fetchDayExport?.(position.day)) ?? null;
    } catch (error) {
      const retryAfterMs = (error as { retryAfterMs?: number }).retryAfterMs;
      if (error instanceof Error && /429|rate limit/i.test(error.message)) {
        throw new RateLimited(retryAfterMs ?? 60_000);
      }
      throw error;
    }
    const key = `${prefix}day-${position.day}.jsonl`;
    if (!response?.body) {
      return stage(
        position,
        { k: 'day', day: nextDay(position.day) },
        [],
        false
      );
    }
    let body: ReadableStream<Uint8Array> = response.body;
    if (config.provider === 'amplitude') {
      const archive = new Uint8Array(await response.arrayBuffer());
      const parts: Uint8Array[] = [];
      for (const entry of readZip(archive)) {
        if (/\.json(\.gz)?$/i.test(entry.name)) {
          const data = await entry.read();
          parts.push(isGzip(data) ? await gunzip(data) : data);
          parts.push(new Uint8Array([NEWLINE]));
        }
      }
      body = new Blob(parts as Uint8Array<ArrayBuffer>[]).stream();
    }
    const size = await files.put(key, body, MAX_SOURCE_BYTES);
    return stage(
      position,
      { k: 'day', day: position.day, key, offset: 0, size },
      [],
      false
    );
  }

  async function daySlice(
    position: Extract<Position, { k: 'day' }>
  ): Promise<ImportState> {
    const key = position.key as string;
    const offset = position.offset ?? 0;
    const size = position.size ?? 0;
    const bytes =
      offset < size
        ? await files.readRange(key, offset, sliceBytes)
        : new Uint8Array();
    const atEnd = offset + bytes.length >= size;
    const cut = atEnd ? bytes.length : recordBoundary(bytes, false);
    if (cut === 0 && !atEnd) {
      throw new Error('An exported event is larger than 2 MB');
    }
    const events: IClickhouseEvent[] = [];
    const profiles = new Map<string, IClickhouseProfile>();
    for (const line of decoder.decode(bytes.subarray(0, cut)).split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      let raw: unknown;
      try {
        raw = JSON.parse(trimmed);
      } catch {
        continue;
      }
      if (!provider.validate(raw)) {
        continue;
      }
      events.push(provider.transformEvent(raw));
      const profile = provider.transformEventToProfile?.(raw);
      if (profile) {
        profiles.set(profile.id, profile);
      }
    }
    const next = offset + cut;
    const finished = next >= size;
    const to: Position = finished
      ? { k: 'day', day: nextDay(position.day) }
      : { ...position, offset: next };
    const state = await stage(position, to, events, false, [
      ...profiles.values(),
    ]);
    if (finished) {
      await files.removePrefix(key);
    }
    return state;
  }

  /** Mixpanel profiles, after the events; a resumed step skips those staged. */
  async function profilesStep(
    position: Extract<Position, { k: 'profiles' }>
  ): Promise<ImportState> {
    const stream = provider.streamProfiles?.();
    let state = await call({ kind: 'state', importId });
    if (!stream) {
      return stage(position, position, [], true);
    }
    let seen = 0;
    let from = position;
    let batch: IClickhouseProfile[] = [];
    for await (const raw of stream) {
      seen += 1;
      if (seen <= position.skip) {
        continue;
      }
      const profile = provider.transformProfile?.(raw);
      if (profile) {
        batch.push(profile);
      }
      if (batch.length >= PROFILE_BATCH) {
        const to: Position = { k: 'profiles', skip: seen };
        state = await stage(from, to, [], false, batch);
        await input.progress({
          step: 'loading_profiles',
          processedProfiles: seen,
        });
        from = to;
        batch = [];
        if (now() - started >= STEP_WALL_MS) {
          return state;
        }
      }
    }
    return stage(from, { k: 'profiles', skip: seen }, [], true, batch);
  }
}
