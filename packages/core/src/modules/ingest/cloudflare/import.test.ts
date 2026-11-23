import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import type { IClickhouseEvent } from '../../event/event.service';
import type { IClickhouseSession } from '../../session/session.service';
import type { EngineSql, SqlRow } from './engine';
import {
  assignGapSessions,
  buildImportedSession,
  gapSessionId,
} from './import-sessions';
import { openImportStore } from './import-store';

const T0 = Date.UTC(2025, 0, 10, 12, 0, 0);
const MIN = 60 * 1000;

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

let seq = 0;
function event(
  minutes: number,
  extra: Partial<IClickhouseEvent> = {}
): IClickhouseEvent {
  seq += 1;
  return {
    id: `e${seq}`,
    name: 'screen_view',
    device_id: 'dev-a',
    profile_id: 'dev-a',
    project_id: 'p1',
    session_id: '',
    path: `/p${seq}`,
    origin: 'https://x.io',
    referrer: '',
    referrer_name: '',
    referrer_type: '',
    properties: {},
    created_at: new Date(T0 + minutes * MIN)
      .toISOString()
      .replace('T', ' ')
      .replace('Z', ''),
    country: 'DE',
    city: 'Berlin',
    region: '',
    os: 'macOS',
    browser: 'Chrome',
    device: 'desktop',
    groups: [],
    ...extra,
  } as IClickhouseEvent;
}

describe('import sessions', () => {
  it('splits a device after a 30-minute gap with md5 ids', () => {
    const events = [event(0), event(10), event(50), event(52)];
    assignGapSessions(events);
    expect(events.map((e) => e.session_id)).toEqual([
      gapSessionId('dev-a', 0),
      gapSessionId('dev-a', 0),
      gapSessionId('dev-a', 1),
      gapSessionId('dev-a', 1),
    ]);
    expect(gapSessionId('dev-a', 0)).toMatch(/^[0-9a-f]{32}$/);
    // Server events and events with an id keep theirs.
    const server = [
      event(0, { device: 'server' }),
      event(1, { session_id: 's9' }),
    ];
    assignGapSessions(server);
    expect(server.map((e) => e.session_id)).toEqual(['', 's9']);
  });

  it('builds start, end and the session row with the ClickHouse rules', () => {
    const built = buildImportedSession(
      [
        event(5, { session_id: 's1', name: 'signup', path: '/b' }),
        event(0, {
          session_id: 's1',
          path: '/a',
          properties: { '__query.utm_source': 'news' },
        }),
        event(9, { session_id: 's1', profile_id: 'user-1', path: '/c' }),
      ],
      '2025-01-11T00:00:00.000Z'
    );
    expect(built?.start).toMatchObject({
      name: 'session_start',
      path: '/a',
      profile_id: 'user-1',
      created_at: '2025-01-10 11:59:59.000',
    });
    expect(built?.end).toMatchObject({
      name: 'session_end',
      path: '/c',
      duration: 9 * MIN,
      created_at: '2025-01-10 12:09:01.000',
    });
    expect(built?.end.properties.__bounce).toBe('false');
    expect(built?.session).toMatchObject({
      id: 's1',
      entry_path: '/a',
      exit_path: '/c',
      screen_view_count: 2,
      event_count: 1,
      is_bounce: false,
      utm_source: 'news',
      duration: 9 * MIN,
    });
    const single = buildImportedSession([event(0, { session_id: 's2' })], 'x');
    expect(single?.session.is_bounce).toBe(true);
  });
});

describe('import store', () => {
  function setup() {
    const store = openImportStore(memorySql());
    const appended: IClickhouseEvent[][] = [];
    const logged: IClickhouseSession[] = [];
    const hooks = {
      appendEvents: (events: IClickhouseEvent[]) => {
        appended.push(events);
        return Promise.resolve();
      },
      logSessions: (sessions: IClickhouseSession[]) => {
        logged.push(...sessions);
      },
    };
    return { store, appended, logged, hooks };
  }

  it('stages a slice once even when the step is retried', () => {
    const { store } = setup();
    store.stage('i1', [event(0)], null, '{"o":1}', false);
    // Same slice again (its first attempt landed): skipped.
    const again = store.stage('i1', [event(0)], null, '{"o":1}', false);
    expect(again.staged).toBe(1);
    const next = store.stage(
      'i1',
      [event(1), event(2)],
      '{"o":1}',
      '{"o":2}',
      true
    );
    expect(next).toMatchObject({
      staged: 3,
      source: '{"o":2}',
      sourceDone: true,
    });
  });

  it('builds sessions, commits in time order, logs sessions and cleans up', async () => {
    const { store, appended, logged, hooks } = setup();
    store.stage(
      'i1',
      [
        event(60, { device_id: 'dev-b', profile_id: 'dev-b' }),
        event(0),
        event(5),
        event(61, { device_id: 'dev-b', profile_id: 'dev-b' }),
        event(3, { device: 'server', device_id: 'srv', profile_id: 'u' }),
      ],
      null,
      'end',
      true
    );
    const sessions = store.buildSessions('i1', 1000, 'now');
    expect(sessions).toMatchObject({ sessionsDone: true, sessionCount: 2 });
    // 5 events + 2 starts + 2 ends.
    expect(sessions.seq).toBe(9);

    // Small commit pages: still time order across pages.
    let state = await store.commit('i1', 4, hooks);
    expect(state.commitDone).toBe(false);
    state = await store.commit('i1', 100, hooks);
    expect(state).toMatchObject({ commitDone: true, committed: 9 });
    const times = appended.flat().map((e) => e.created_at);
    expect([...times].sort()).toEqual(times);
    expect(
      appended.flat().filter((e) => e.name === 'session_start')
    ).toHaveLength(2);

    expect(store.logSessions('i1', 1, hooks).logDone).toBe(false);
    expect(store.logSessions('i1', 10, hooks).logDone).toBe(true);
    expect(logged.map((s) => s.device_id).sort()).toEqual(['dev-a', 'dev-b']);

    store.cleanup('i1');
    expect(store.state('i1')).toMatchObject({ staged: 0, source: null });
  });
});
