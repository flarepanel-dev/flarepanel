// R2 archive layout for a project's events. One run turns a range of stored
// chunks into one newline-delimited JSON object per event hour:
//   v1/events/project_id=<pid>/date=YYYY-MM-DD/hour=HH/<first>-<last>.ndjson
// (gzip is applied by the caller). The chunk range in the name makes a retried
// run overwrite the same object instead of adding a second copy.

import type { IClickhouseEvent } from '../../event/event.service';
import type { StoredChunk } from './engine';

export interface ArchiveObject {
  key: string;
  /** Newline-delimited JSON, one event per line. */
  body: string;
  events: number;
}

const HOUR_KEY_LENGTH = 13; // `YYYY-MM-DD HH`

export function archivePrefix(projectId: string): string {
  return `v1/events/project_id=${encodeURIComponent(projectId)}/`;
}

/** Groups the events of `chunks` (ascending ids) by their UTC hour. */
export function buildArchiveObjects(
  projectId: string,
  chunks: StoredChunk[]
): ArchiveObject[] {
  const first = chunks[0];
  const last = chunks.at(-1);
  if (!(first && last)) {
    return [];
  }
  const range = `${first.id}-${last.id}`;
  const byHour = new Map<string, string[]>();
  for (const chunk of chunks) {
    for (const event of chunk.events) {
      // `created_at` is `YYYY-MM-DD HH:MM:SS.mmm` in UTC.
      const hour = event.created_at.slice(0, HOUR_KEY_LENGTH);
      const lines = byHour.get(hour) ?? [];
      lines.push(JSON.stringify(event));
      byHour.set(hour, lines);
    }
  }
  const objects: ArchiveObject[] = [];
  for (const [hour, lines] of byHour) {
    const [date, hh] = hour.split(' ');
    objects.push({
      key: `${archivePrefix(projectId)}date=${date}/hour=${hh}/${range}.ndjson`,
      body: `${lines.join('\n')}\n`,
      events: lines.length,
    });
  }
  return objects;
}

// ---------------------------------------------------------------------------
// Reading it back: events older than the Durable Object keeps.

/** The parts of an R2 bucket binding the archive reader uses. */
export interface ArchiveBucket {
  list(options: { prefix: string; cursor?: string; limit?: number }): Promise<{
    objects: { key: string }[];
    truncated: boolean;
    cursor?: string;
  }>;
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
}

/** Where `scanRange` reads events older than the hot window from. */
export interface ColdStore {
  /** Events before this instant come from here; later ones from the chunks. */
  before(): number;
  /** Visits every event in `from`..`to`; false when it stopped at its budget. */
  scan(
    from: number,
    to: number,
    visit: (event: IClickhouseEvent) => void
  ): Promise<boolean>;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_IN_KEY = /date=(\d{4}-\d{2}-\d{2})\/hour=(\d{2})\//;
const LIST_PAGE = 1000;

function utcDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Reads a project's archive, day by day and only the hours that overlap the
 * range. Each scan reads at most `maxObjects` files (one R2 read each), so a
 * long range on a busy project stops early and says so.
 */
export function createArchiveColdStore({
  bucket,
  projectId,
  before,
  gunzip,
  maxObjects,
}: {
  bucket: ArchiveBucket;
  projectId: () => string | null;
  before: () => number;
  gunzip: (bytes: Uint8Array) => Uint8Array;
  maxObjects: number;
}): ColdStore {
  const decoder = new TextDecoder();
  const decode = (bytes: Uint8Array): string => {
    // Gzip magic bytes; an object stored plain is read as is.
    const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;
    return decoder.decode(isGzip ? gunzip(bytes) : bytes);
  };
  return {
    before,
    async scan(from, to, visit) {
      const project = projectId();
      if (!project || from > to) {
        return true;
      }
      const firstHour = Math.floor(from / (DAY_MS / 24));
      const lastHour = Math.floor(to / (DAY_MS / 24));
      let read = 0;
      for (let day = Date.parse(utcDay(from)); day <= to; day += DAY_MS) {
        let cursor: string | undefined;
        do {
          const page = await bucket.list({
            prefix: `${archivePrefix(project)}date=${utcDay(day)}/`,
            cursor,
            limit: LIST_PAGE,
          });
          for (const object of page.objects) {
            const match = HOUR_IN_KEY.exec(object.key);
            if (!match) {
              continue;
            }
            const hour = Math.floor(
              Date.parse(`${match[1]}T${match[2]}:00:00Z`) / (DAY_MS / 24)
            );
            if (hour < firstHour || hour > lastHour) {
              continue;
            }
            if (read >= maxObjects) {
              return false;
            }
            read += 1;
            const body = await bucket.get(object.key);
            if (!body) {
              continue;
            }
            const text = decode(new Uint8Array(await body.arrayBuffer()));
            for (const line of text.split('\n')) {
              if (line) {
                visit(JSON.parse(line) as IClickhouseEvent);
              }
            }
          }
          cursor = page.truncated ? page.cursor : undefined;
        } while (cursor);
      }
      return true;
    },
  };
}
