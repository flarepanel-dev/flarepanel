import { describe, expect, it } from 'bun:test';
import { handleOps, isOpsPath } from './ops-routes';

const calls: unknown[] = [];
const stub = {
  recoveryStatus: () =>
    Promise.resolve({ bookmark: 'b-now', eventsLast30Days: 12 }),
  restoreTo: (target: { at?: number; bookmark?: string }) => {
    calls.push(target);
    return Promise.resolve({ restoredTo: 'b-then', undoBookmark: 'b-undo' });
  },
};
const env = { OPS_TOKEN: 'ops-secret' };
const request = (path: string, init: RequestInit = {}, token = 'ops-secret') =>
  new Request(`https://api.example${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
  });

describe('ops recovery routes', () => {
  it('matches only the ops prefix', () => {
    expect(isOpsPath('/__ops/projects/p1/recovery')).toBe(true);
    expect(isOpsPath('/track')).toBe(false);
  });

  it('is off without OPS_TOKEN and refuses a wrong token', async () => {
    const off = await handleOps(
      request('/__ops/projects/p1/recovery'),
      {},
      () => stub
    );
    expect(off.status).toBe(404);
    const wrong = await handleOps(
      request('/__ops/projects/p1/recovery', {}, 'nope'),
      env,
      () => stub
    );
    expect(wrong.status).toBe(401);
  });

  it('reports the recovery point', async () => {
    const response = await handleOps(
      request('/__ops/projects/p1/recovery'),
      env,
      () => stub
    );
    expect(await response.json()).toEqual({
      projectId: 'p1',
      bookmark: 'b-now',
      eventsLast30Days: 12,
    });
  });

  it('restores to a time within 30 days, or to a bookmark', async () => {
    const at = new Date(Date.now() - 60_000).toISOString();
    const byTime = await handleOps(
      request('/__ops/projects/p1/restore', {
        method: 'POST',
        body: JSON.stringify({ at }),
      }),
      env,
      () => stub
    );
    expect(await byTime.json()).toMatchObject({ undoBookmark: 'b-undo' });
    expect(calls.at(-1)).toEqual({ at: Date.parse(at) });

    const tooOld = await handleOps(
      request('/__ops/projects/p1/restore', {
        method: 'POST',
        body: JSON.stringify({ at: '2020-01-01T00:00:00Z' }),
      }),
      env,
      () => stub
    );
    expect(tooOld.status).toBe(400);

    const undo = await handleOps(
      request('/__ops/projects/p1/restore', {
        method: 'POST',
        body: JSON.stringify({ bookmark: '0000000c-00000002-0000512c-ca19' }),
      }),
      env,
      () => stub
    );
    expect(undo.status).toBe(200);
    expect(calls.at(-1)).toEqual({
      bookmark: '0000000c-00000002-0000512c-ca19',
    });
  });
});
