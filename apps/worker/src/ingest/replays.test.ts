import { describe, expect, it } from 'bun:test';
import { MemoryCacheStore } from '@flarepanel/platform';
import { readReplayChunks, storeReplayChunk } from './replays';

/** Just enough of R2 for the replay store: put, get, sorted list, delete. */
function memoryBucket() {
  const objects = new Map<string, Uint8Array<ArrayBuffer>>();
  let puts = 0;
  const bucket = {
    async put(key: string, value: ArrayBuffer) {
      puts++;
      objects.set(key, new Uint8Array(value));
      return {};
    },
    get(key: string) {
      const bytes = objects.get(key);
      return Promise.resolve(
        bytes ? { body: new Blob([bytes]).stream() } : null
      );
    },
    list({ prefix, limit = 1000 }: { prefix: string; limit?: number }) {
      const keys = [...objects.keys()]
        .filter((key) => key.startsWith(prefix))
        .sort()
        .slice(0, limit);
      return Promise.resolve({
        objects: keys.map((key) => ({ key })),
        truncated: false,
      });
    },
  };
  return {
    bucket: bucket as unknown as R2Bucket,
    objects,
    puts: () => puts,
  };
}

function marker(known: string[]) {
  const calls: string[] = [];
  return {
    calls,
    markReplay: (sessionId: string) => {
      calls.push(sessionId);
      return Promise.resolve(known.includes(sessionId));
    },
  };
}

const chunk = (index: number, startSecond: number, events: unknown[]) => ({
  projectId: 'p1',
  sessionId: 's1',
  chunkIndex: index,
  startedAt: new Date(Date.UTC(2026, 10, 24, 10, 0, startSecond)).toISOString(),
  endedAt: new Date(
    Date.UTC(2026, 10, 24, 10, 0, startSecond + 5)
  ).toISOString(),
  payload: JSON.stringify(events),
  eventsCount: events.length,
  isFullSnapshot: index === 0,
});

describe('replay chunks on R2', () => {
  it('stores gzip chunks and plays them back in order, a page at a time', async () => {
    const { bucket, objects } = memoryBucket();
    const cache = new MemoryCacheStore();
    const project = marker(['s1']);
    // A second page load restarts at index 0, later in time.
    await storeReplayChunk(bucket, cache, project, chunk(1, 10, [{ n: 2 }]));
    await storeReplayChunk(bucket, cache, project, chunk(0, 0, [{ n: 1 }]));
    await storeReplayChunk(bucket, cache, project, chunk(0, 20, [{ n: 3 }]));

    const stored = [...objects.values()][0] ?? new Uint8Array();
    expect([stored[0], stored[1]]).toEqual([0x1f, 0x8b]); // gzip magic

    const first = await readReplayChunks(bucket, 'p1', 's1', {
      offset: 0,
      limit: 2,
    });
    expect(first.map((c) => JSON.parse(c.payload)[0].n)).toEqual([1, 2]);
    const rest = await readReplayChunks(bucket, 'p1', 's1', {
      offset: 2,
      limit: 2,
    });
    expect(rest.map((c) => JSON.parse(c.payload)[0].n)).toEqual([3]);
    // The project was asked once; later chunks used the cached answer.
    expect(project.calls).toEqual(['s1']);
  });

  it('refuses chunks for sessions the project never saw, without storing', async () => {
    const { bucket, puts } = memoryBucket();
    const cache = new MemoryCacheStore();
    const project = marker([]);
    expect(
      await storeReplayChunk(bucket, cache, project, chunk(0, 0, [{}]))
    ).toBe(false);
    expect(
      await storeReplayChunk(bucket, cache, project, chunk(1, 5, [{}]))
    ).toBe(false);
    expect(puts()).toBe(0);
    expect(project.calls).toEqual(['s1']);
  });

  it('a retried chunk overwrites itself instead of duplicating', async () => {
    const { bucket, objects } = memoryBucket();
    const cache = new MemoryCacheStore();
    const project = marker(['s1']);
    await storeReplayChunk(bucket, cache, project, chunk(0, 0, [{}]));
    await storeReplayChunk(bucket, cache, project, chunk(0, 0, [{}]));
    expect(objects.size).toBe(1);
  });
});
