import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import type { IAiFilters } from '../../ai/ai.constants';
import type { IClickhouseAiEvent } from '../../ai/src/row';
import type { AiQuery } from './ai-query';
import { answerAiQuery } from './ai-scan';
import {
  type AiContentArchive,
  aiContentKey,
  flushAiContent,
  loadAiContent,
  openAiStore,
} from './ai-store';
import type { EngineSql, SqlRow } from './engine';

const NOW = Date.UTC(2026, 10, 23, 12, 0, 0);
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;
const RANGE = {
  startDate: '2026-11-20',
  endDate: '2026-11-23',
  timezone: 'UTC',
};

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

function chText(ms: number) {
  return new Date(ms).toISOString().replace('T', ' ').replace('Z', '');
}

let seq = 0;
function call(
  over: Partial<IClickhouseAiEvent> & { at?: number } = {}
): IClickhouseAiEvent {
  seq += 1;
  const { at = NOW - 60 * MIN, ...rest } = over;
  return {
    project_id: 'p1',
    id: `e${seq}`,
    type: 'generation',
    trace_id: 't1',
    span_id: `s${seq}`,
    parent_id: '',
    conversation_id: '',
    name: '',
    model: 'gpt-x',
    provider: 'openai',
    input_tokens: 10,
    output_tokens: 5,
    cache_read_tokens: 0,
    cache_write_tokens: 0,
    reasoning_tokens: 0,
    input_cost: 0,
    output_cost: 0,
    total_cost: 0.01,
    cost_source: 'catalog',
    latency_ms: 100,
    time_to_first_token_ms: 0,
    is_error: false,
    http_status: 200,
    stop_reason: 'stop',
    is_stream: false,
    model_parameters: '',
    input: JSON.stringify([{ role: 'user', content: 'Hello there' }]),
    output: JSON.stringify({ text: 'Hi!' }),
    tools: '',
    error: '',
    properties: {},
    profile_id: 'ana',
    device_id: 'dev-ana',
    session_id: 'sess-1',
    groups: [],
    created_at: chText(at),
    ...rest,
  };
}

function setup(rows: IClickhouseAiEvent[]) {
  const sql = memorySql();
  const store = openAiStore(sql, () => NOW);
  for (const row of rows) {
    store.add(row);
  }
  const files = new Map<string, string>();
  const archive: AiContentArchive = {
    get: (key) => Promise.resolve(files.get(key) ?? null),
    put: (key, body) => {
      files.set(key, body);
      return Promise.resolve();
    },
  };
  const ask = <T>(query: AiQuery, now = NOW) =>
    answerAiQuery(query, {
      sql,
      projectId: 'p1',
      now,
      loadContent: (wanted) =>
        loadAiContent({ store, archive, projectId: 'p1', rows: wanted }),
    }) as Promise<T>;
  return { sql, store, files, archive, ask };
}

type Metrics = Record<string, number | null>;

describe('ai store and reads', () => {
  it('counts calls with the ClickHouse rules', async () => {
    const { ask, store } = setup([
      call({ latency_ms: 100, conversation_id: 'c1' }),
      call({ latency_ms: 300, conversation_id: 'c1' }),
      call({
        type: 'embedding',
        latency_ms: 5,
        profile_id: 'ben',
        trace_id: 't2',
      }),
      call({
        is_error: true,
        latency_ms: 200,
        total_cost: 0,
        cost_source: 'none',
        trace_id: 't2',
      }),
      call({ cost_source: 'none', total_cost: 0, trace_id: 't3' }),
      call({ type: 'span', profile_id: '', trace_id: 't3' }),
    ]);
    // A redelivered event id is stored once.
    expect(store.add(call({ id: 'e1' }))).toBe(false);
    const { totals, series } = await ask<{
      totals: Metrics;
      series: (Metrics & { date: string })[];
    }>({ kind: 'overview', range: RANGE, interval: 'day' });
    expect(totals).toMatchObject({
      generations: 5,
      events: 6,
      traces: 3,
      users: 2,
      conversations: 1,
      errors: 1,
      input_tokens: 60,
      // Generations only: 100, 100, 200, 300 ms.
      p50_latency_ms: 150,
      avg_latency_ms: 175,
    });
    expect(totals.p95_latency_ms).toBeCloseTo(285);
    // Four zero-filled days, wall-clock labels.
    expect(series.map((point) => point.date)).toEqual([
      '2026-11-20 00:00:00',
      '2026-11-21 00:00:00',
      '2026-11-22 00:00:00',
      '2026-11-23 00:00:00',
    ]);
    expect(series.map((point) => point.events)).toEqual([0, 0, 0, 6]);
  });

  it('buckets series in the project timezone', async () => {
    // 23:30 UTC on the 22nd is the 23rd in Istanbul (UTC+3).
    const { ask } = setup([call({ at: Date.UTC(2026, 10, 22, 23, 30) })]);
    const { series } = await ask<{ series: (Metrics & { date: string })[] }>({
      kind: 'overview',
      range: { ...RANGE, timezone: 'Europe/Istanbul' },
      interval: 'day',
    });
    const busy = series.filter((point) => point.events);
    expect(busy.map((point) => point.date)).toEqual(['2026-11-23 00:00:00']);
  });

  it('breaks down by model, group, error code and profile', async () => {
    const { ask } = setup([
      call({ model: 'a', total_cost: 1, groups: ['acme'] }),
      call({ model: 'a', total_cost: 1, groups: ['acme', 'beta'] }),
      call({ model: 'b', total_cost: 5 }),
      call({
        model: 'b',
        is_error: true,
        error: JSON.stringify({ code: 'rate_limit' }),
      }),
      call({ model: 'c', profile_id: '', total_cost: 0.5 }),
    ]);
    const byModel = await ask<{ key: string; generations: number }[]>({
      kind: 'breakdown',
      range: RANGE,
      dimension: 'model',
      limit: 10,
      sort: 'cost',
    });
    expect(byModel.map((row) => row.key)).toEqual(['b', 'a', 'c']);
    const byGroup = await ask<{ key: string; events: number }[]>({
      kind: 'breakdown',
      range: RANGE,
      dimension: 'group',
      limit: 10,
      sort: 'cost',
    });
    expect(byGroup).toMatchObject([
      { key: 'acme', events: 2 },
      { key: 'beta', events: 1 },
    ]);
    const byError = await ask<{ key: string; errors: number }[]>({
      kind: 'breakdown',
      range: RANGE,
      dimension: 'errorCode',
      limit: 10,
      sort: 'errors',
    });
    expect(byError).toMatchObject([{ key: 'rate_limit', errors: 1 }]);
    const byProfile = await ask<{ key: string }[]>({
      kind: 'breakdown',
      range: RANGE,
      dimension: 'profile',
      limit: 10,
      sort: 'cost',
    });
    // Anonymous usage keeps its own row.
    expect(byProfile.map((row) => row.key).sort()).toEqual(['', 'ana']);
  });

  it('lists traces newest first with names, duration and a cursor', async () => {
    const t0 = NOW - 3 * 60 * MIN;
    const { ask } = setup([
      call({ trace_id: 'old', at: t0, name: 'retrieve', type: 'span' }),
      call({ trace_id: 'old', at: t0 + 1000, name: 'answer', latency_ms: 500 }),
      call({ trace_id: 'new', at: t0 + 60 * MIN, name: 'chat' }),
      call({
        trace_id: 'new',
        at: t0 + 61 * MIN,
        name: 'Support bot',
        type: 'trace',
      }),
    ]);
    const page = await ask<Record<string, unknown>[]>({
      kind: 'traces',
      range: RANGE,
      take: 1,
    });
    expect(page).toMatchObject([
      { trace_id: 'new', trace_name: 'Support bot', events: 2 },
    ]);
    const next = await ask<Record<string, unknown>[]>({
      kind: 'traces',
      range: RANGE,
      take: 1,
      cursor: String(page[0]?.started_at),
    });
    expect(next).toMatchObject([
      {
        trace_id: 'old',
        trace_name: 'answer',
        duration_ms: 1500,
        generations: 1,
        events: 2,
      },
    ]);
  });

  it('keeps text until the trace is quiet, then reads it from R2', async () => {
    const { ask, store, files, archive } = setup([
      call({ id: 'a1', trace_id: 'tr' }),
      call({ id: 'a2', trace_id: 'tr', input: '', output: '', tools: '' }),
    ]);
    // Lists show the preview only.
    const list = await ask<IClickhouseAiEvent[]>({
      kind: 'events',
      range: RANGE,
      take: 10,
    });
    const first = list.find((row) => row.id === 'a1');
    expect(JSON.parse(first?.input ?? '')).toBe('Hello there');
    expect(first?.output).toBe('');
    // Not due yet: nothing is written.
    expect(
      await flushAiContent({
        store,
        archive,
        projectId: 'p1',
        quietBefore: NOW - 5 * MIN,
        oldestBefore: NOW - 30 * MIN,
      })
    ).toBe(0);
    const detail = await ask<IClickhouseAiEvent | null>({
      kind: 'event',
      id: 'a1',
    });
    expect(detail?.output).toBe(JSON.stringify({ text: 'Hi!' }));
    // Quiet now: the trace's text moves to one R2 file.
    expect(
      await flushAiContent({
        store,
        archive,
        projectId: 'p1',
        quietBefore: NOW,
        oldestBefore: NOW,
      })
    ).toBe(1);
    expect([...files.keys()]).toEqual([aiContentKey('p1', 'tr')]);
    expect(store.localContent(['a1']).size).toBe(0);
    expect(store.nextDueAt(5 * MIN, 30 * MIN)).toBeNull();
    // A late call of the same trace is merged into the same file.
    store.add(call({ id: 'a3', trace_id: 'tr', input: '"late"' }));
    await flushAiContent({
      store,
      archive,
      projectId: 'p1',
      quietBefore: NOW,
      oldestBefore: NOW,
    });
    const trace = await ask<IClickhouseAiEvent[]>({
      kind: 'trace',
      traceId: 'tr',
    });
    expect(trace.map((row) => [row.id, row.input])).toEqual([
      ['a1', JSON.stringify([{ role: 'user', content: 'Hello there' }])],
      ['a2', ''],
      ['a3', '"late"'],
    ]);
  });

  it('hides text after 30 days, as the ClickHouse TTL does', async () => {
    const { ask, store } = setup([call({ id: 'x1' })]);
    const later = NOW + 31 * DAY;
    store.expireContent(later - 30 * DAY);
    const row = await ask<IClickhouseAiEvent | null>(
      { kind: 'event', id: 'x1' },
      later
    );
    expect(row?.input).toBe('');
    expect(row?.total_cost).toBe(0.01);
    expect(store.localContent(['x1']).size).toBe(0);
  });

  it('applies filters, summaries and filter values', async () => {
    const { ask } = setup([
      call({ model: 'a', groups: ['acme'], input: '"Refund my order"' }),
      call({ model: 'b', is_error: true, session_id: 'sess-2' }),
      call({ model: 'b', conversation_id: 'conv-9', profile_id: 'ben' }),
    ]);
    const count = async (filters: IAiFilters) =>
      (
        await ask<{ totals: Metrics }>({
          kind: 'overview',
          range: RANGE,
          interval: 'day',
          filters,
        })
      ).totals.events;
    expect(await count({ search: 'REFUND' })).toBe(1);
    expect(await count({ search: 'conv-9' })).toBe(1);
    expect(await count({ groupId: 'acme' })).toBe(1);
    expect(await count({ isError: true })).toBe(1);
    expect(await count({ models: ['b'] })).toBe(2);
    expect(await count({ profileId: 'ben' })).toBe(1);
    const summary = await ask<Record<string, unknown>>({
      kind: 'summary',
      by: 'profile',
      id: 'ana',
    });
    expect(summary).toMatchObject({
      generations: 2,
      errors: 1,
      top_models: ['a', 'b'],
    });
    const values = await ask<{ field: string; value: string; count: number }[]>(
      { kind: 'filterValues', range: RANGE }
    );
    expect(values.filter((row) => row.field === 'model')).toEqual([
      { field: 'model', value: 'b', count: 2 },
      { field: 'model', value: 'a', count: 1 },
    ]);
  });
});
