// R2 archive layout for a project's events. One run turns a range of stored
// chunks into one newline-delimited JSON object per event hour:
//   v1/events/project_id=<pid>/date=YYYY-MM-DD/hour=HH/<first>-<last>.ndjson
// (gzip is applied by the caller). The chunk range in the name makes a retried
// run overwrite the same object instead of adding a second copy.

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
