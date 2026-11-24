import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import type { EngineSql, SqlRow } from './engine';
import {
  isReplayId,
  openReplayIndex,
  replayChunkKey,
  replayPrefix,
} from './replay-store';

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

const chunk = {
  projectId: 'p1',
  sessionId: 's-1',
  chunkIndex: 3,
  startedAt: '2026-11-24T10:00:00.000Z',
  endedAt: '2026-11-24T10:00:10.000Z',
};

describe('replay keys', () => {
  it('sort in playback order: started, ended, index', () => {
    const key = replayChunkKey(chunk);
    expect(key).toBe(
      `replays/p1/s-1/${Date.parse(chunk.startedAt)}-${Date.parse(chunk.endedAt)}-00003.json.gz`
    );
    // A new page load restarts the index at 0 but starts later: still after.
    const nextPage = replayChunkKey({
      ...chunk,
      chunkIndex: 0,
      startedAt: '2026-11-24T10:00:11.000Z',
      endedAt: '2026-11-24T10:00:12.000Z',
    });
    expect([nextPage, key].sort()).toEqual([key, nextPage]);
    expect(replayPrefix('p1')).toBe('replays/p1/');
  });

  it('refuses ids that are not safe key segments, and bad times', () => {
    expect(isReplayId('..')).toBe(false);
    expect(replayChunkKey({ ...chunk, sessionId: '../p2/x' })).toBeNull();
    expect(replayChunkKey({ ...chunk, projectId: 'a/b' })).toBeNull();
    expect(replayChunkKey({ ...chunk, startedAt: 'yesterday' })).toBeNull();
    expect(replayChunkKey({ ...chunk, chunkIndex: -1 })).toBeNull();
  });
});

describe('replay index', () => {
  it('marks sessions, keeps the earliest start and expires old ones', () => {
    const index = openReplayIndex(memorySql());
    index.mark('s1', 2000);
    index.mark('s1', 1000);
    index.mark('s2', 5000);
    expect([...index.recorded(['s1', 's2', 's3'])].sort()).toEqual([
      's1',
      's2',
    ]);
    index.expire(3000);
    expect([...index.recorded(['s1', 's2'])]).toEqual(['s2']);
  });

  it('answers for more ids than one statement can bind', () => {
    const index = openReplayIndex(memorySql());
    const ids = Array.from({ length: 250 }, (_, i) => `s${i}`);
    for (const id of ids.slice(0, 200)) {
      index.mark(id, 1);
    }
    expect(index.recorded(ids).size).toBe(200);
  });
});
