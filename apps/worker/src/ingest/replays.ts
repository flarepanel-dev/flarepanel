/**
 * Session replay chunks on Workers: each chunk is gzip-compressed into its own
 * R2 object (see replay-store.ts for the key and retention rules), and the
 * project's Durable Object marks the session as recorded.
 *
 * Costs: one R2 write per chunk (the SDK sends one about every 10 seconds of
 * activity); the gate (plan, monthly limit, the project's Durable Object) is
 * asked once per session and data centre, because the answer is cached, and
 * refused sessions cost no write at all. Playback lists the session's chunks and reads
 * 40 at a time.
 */
import {
  type ReplayChunkRef,
  replayChunkKey,
  replayPrefix,
} from '@flarepanel/core/ingest/cloudflare';
import type { CacheStore } from '@flarepanel/platform';

const MARK_TTL_SECONDS = 60 * 60;
/** A session the project has not seen yet may still be on its way in. */
const UNKNOWN_TTL_SECONDS = 60;
/** Refused by plan or monthly limit: asked again a few minutes later. */
const REFUSED_TTL_SECONDS = 5 * 60;
const LIST_PAGE = 1000;
const CHUNK_NAME = /-(\d{5})\.json\.gz$/;

export interface ReplayChunkInput extends ReplayChunkRef {
  payload: string;
  eventsCount: number;
  isFullSnapshot: boolean;
}

/**
 * Decides, once per session, whether it is recorded: `recorded` (store its
 * chunks), `refused` (no plan, or over the monthly limit) or `unknown` (the
 * project has no such session).
 */
export type ReplayAdmission = 'recorded' | 'refused' | 'unknown';
export type ReplayGate = (
  sessionId: string,
  startedAtMs: number
) => Promise<ReplayAdmission>;

async function gzip(text: string): Promise<ArrayBuffer> {
  const stream = new Blob([text])
    .stream()
    .pipeThrough(new CompressionStream('gzip'));
  return await new Response(stream).arrayBuffer();
}

async function gunzip(body: ReadableStream): Promise<string> {
  return await new Response(
    body.pipeThrough(new DecompressionStream('gzip'))
  ).text();
}

/** Stores one chunk; false when it is refused (bad ids, gate). */
export async function storeReplayChunk(
  bucket: R2Bucket,
  cache: CacheStore,
  gate: ReplayGate,
  chunk: ReplayChunkInput
): Promise<boolean> {
  const key = replayChunkKey(chunk);
  if (!key) {
    return false;
  }
  const markKey = `replay-mark:${chunk.projectId}:${chunk.sessionId}`;
  const known = await cache.get(markKey);
  if (known === 'no') {
    return false;
  }
  if (known !== 'yes') {
    const admission = await gate(chunk.sessionId, Date.parse(chunk.startedAt));
    if (admission === 'recorded') {
      await cache.set(markKey, 'yes', MARK_TTL_SECONDS);
    } else {
      await cache.set(
        markKey,
        'no',
        admission === 'unknown' ? UNKNOWN_TTL_SECONDS : REFUSED_TTL_SECONDS
      );
      return false;
    }
  }
  await bucket.put(key, await gzip(chunk.payload), {
    // Stored as gzip bytes and unpacked by readReplayChunks.
    httpMetadata: { contentType: 'application/gzip' },
    customMetadata: {
      events: String(chunk.eventsCount),
      fullSnapshot: chunk.isFullSnapshot ? '1' : '0',
    },
  });
  return true;
}

/** A page of a session's chunks in playback order, as JSON text. */
export async function readReplayChunks(
  bucket: R2Bucket,
  projectId: string,
  sessionId: string,
  page: { offset: number; limit: number }
): Promise<{ chunk_index: number; payload: string }[]> {
  const keys: string[] = [];
  let cursor: string | undefined;
  do {
    const listed = await bucket.list({
      prefix: replayPrefix(projectId, sessionId),
      cursor,
      limit: LIST_PAGE,
    });
    keys.push(...listed.objects.map((object) => object.key));
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor && keys.length < page.offset + page.limit);

  const wanted = keys.sort().slice(page.offset, page.offset + page.limit);
  const chunks = await Promise.all(
    wanted.map(async (key) => {
      const object = await bucket.get(key);
      if (!object) {
        return null;
      }
      return {
        chunk_index: Number(CHUNK_NAME.exec(key)?.[1] ?? 0),
        payload: await gunzip(object.body),
      };
    })
  );
  return chunks.filter((chunk) => chunk !== null);
}
