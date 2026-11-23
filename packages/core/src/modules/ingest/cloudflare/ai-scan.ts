// The AI page's numbers from the project's `ai_events` rows, with the rules
// of the ClickHouse queries in `ai/src/sql.ts`:
// - a model call is a `generation` or an `embedding`; errors count model
//   calls only; an unpriced call is a successful model call with no price;
// - latency (average, p50, p95) is timed on generations only;
// - users and conversations count non-empty ids;
// - the range is wall-clock in the project's timezone, both ends inclusive;
// - series buckets are zero-filled over the whole range (weeks from Sunday).
// Answers use the ClickHouse row shapes, so one set of transforms serves both.

import { toRangeBoundaryLiteral } from '../../../shared/ch-dates';
import type { AiBreakdownDimension, IAiFilters } from '../../ai/ai.constants';
import type { IClickhouseAiEvent } from '../../ai/src/row';
import type { AiQuery, AiQueryRange } from './ai-query';
import { AI_CONTENT_TTL_MS, type AiContent, aiTimeMs } from './ai-store';
import type { EngineSql, SqlRow, SqlValue } from './engine';
import { buildBuckets, wallClockText, wallClockToMs } from './time-buckets';

const SCAN_PAGE = 2000;
/** Calls one aggregate reads at most (newest data may then be left out). */
const MAX_SCAN_ROWS = 500_000;
const AROUND_MS = 24 * 60 * 60 * 1000;
const TOP_MODELS = 3;
const LIKE_SPECIAL = /[\\%_]/g;
const MODEL_CALLS = new Set(['generation', 'embedding']);

const LEAN_COLUMNS =
  'id, created_at, type, trace_id, conversation_id, name, model, provider, input_tokens, output_tokens, cache_read_tokens, total_cost, cost_source, latency_ms, is_error, stop_reason, error_code, profile_id, device_id, session_id, groups';

interface LeanRow {
  id: string;
  at: number;
  type: string;
  traceId: string;
  conversationId: string;
  name: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cost: number;
  costSource: string;
  latencyMs: number;
  isError: boolean;
  stopReason: string;
  errorCode: string;
  profileId: string;
  deviceId: string;
  sessionId: string;
  groups: string[];
}

export interface AiReadSource {
  sql: EngineSql;
  projectId: string;
  now: number;
  /** Full prompt, response and tool text of these rows, by id. */
  loadContent: (
    rows: { id: string; traceId: string }[]
  ) => Promise<Map<string, AiContent>>;
}

const num = (value: SqlValue | undefined): number =>
  typeof value === 'number' ? value : Number(value ?? 0);
const str = (value: SqlValue | undefined): string =>
  value === null || value === undefined ? '' : String(value);

function chText(ms: number): string {
  return new Date(ms).toISOString().replace('T', ' ').replace('Z', '');
}

function toLean(row: SqlRow): LeanRow {
  return {
    id: str(row.id),
    at: num(row.created_at),
    type: str(row.type),
    traceId: str(row.trace_id),
    conversationId: str(row.conversation_id),
    name: str(row.name),
    model: str(row.model),
    provider: str(row.provider),
    inputTokens: num(row.input_tokens),
    outputTokens: num(row.output_tokens),
    cacheReadTokens: num(row.cache_read_tokens),
    cost: num(row.total_cost),
    costSource: str(row.cost_source),
    latencyMs: num(row.latency_ms),
    isError: num(row.is_error) === 1,
    stopReason: str(row.stop_reason),
    errorCode: str(row.error_code),
    profileId: str(row.profile_id),
    deviceId: str(row.device_id),
    sessionId: str(row.session_id),
    groups: JSON.parse(str(row.groups) || '[]') as string[],
  };
}

/** `[from, to]` epoch ms of a wall-clock range, as ClickHouse reads it. */
export function aiRangeMs(range: AiQueryRange): [number, number] {
  return [
    wallClockToMs(
      toRangeBoundaryLiteral(range.startDate, 'start'),
      range.timezone
    ),
    wallClockToMs(toRangeBoundaryLiteral(range.endDate, 'end'), range.timezone),
  ];
}

interface Where {
  clause: string;
  bindings: SqlValue[];
}

function inList(column: string, values: string[] | undefined, where: Where) {
  if (values && values.length > 0) {
    where.clause += ` AND ${column} IN (SELECT value FROM json_each(?))`;
    where.bindings.push(JSON.stringify(values));
  }
}

function equals(column: string, value: string | undefined, where: Where) {
  if (value) {
    where.clause += ` AND ${column} = ?`;
    where.bindings.push(value);
  }
}

const IN_GROUP =
  'EXISTS (SELECT 1 FROM json_each(ai_events.groups) WHERE json_each.value = ?)';

/** The range and the filters every AI read shares. */
function scopeWhere(
  [from, to]: [number, number],
  filters: IAiFilters | undefined
): Where {
  const where: Where = {
    clause: 'created_at BETWEEN ? AND ?',
    bindings: [from, to],
  };
  if (!filters) {
    return where;
  }
  inList('model', filters.models, where);
  inList('provider', filters.providers, where);
  inList('name', filters.names, where);
  inList('type', filters.types, where);
  equals('profile_id', filters.profileId, where);
  equals('conversation_id', filters.conversationId, where);
  equals('session_id', filters.sessionId, where);
  if (filters.groupId) {
    where.clause += ` AND ${IN_GROUP}`;
    where.bindings.push(filters.groupId);
  }
  if (filters.isError !== undefined) {
    where.clause += ' AND is_error = ?';
    where.bindings.push(filters.isError ? 1 : 0);
  }
  if (filters.search) {
    const pattern = `%${filters.search.toLowerCase().replace(LIKE_SPECIAL, (c) => `\\${c}`)}%`;
    where.clause +=
      " AND (search LIKE ? ESCAPE '\\' OR trace_id = ? OR conversation_id = ?)";
    where.bindings.push(pattern, filters.search, filters.search);
  }
  return where;
}

/** Every matching call, oldest first, a page at a time. */
function scan(sql: EngineSql, where: Where, visit: (row: LeanRow) => void) {
  let lastAt = Number.MIN_SAFE_INTEGER;
  let lastId = '';
  let seen = 0;
  while (seen < MAX_SCAN_ROWS) {
    const rows = sql.exec(
      `SELECT ${LEAN_COLUMNS} FROM ai_events WHERE ${where.clause} AND (created_at > ? OR (created_at = ? AND id > ?)) ORDER BY created_at, id LIMIT ?`,
      ...where.bindings,
      lastAt,
      lastAt,
      lastId,
      SCAN_PAGE
    );
    for (const row of rows) {
      visit(toLean(row));
    }
    seen += rows.length;
    const last = rows.at(-1);
    if (!last || rows.length < SCAN_PAGE) {
      return;
    }
    lastAt = num(last.created_at);
    lastId = str(last.id);
  }
}

/** Linear interpolation between the closest ranks, like ClickHouse's quantile. */
function quantile(sorted: number[], q: number): number | null {
  if (sorted.length === 0) {
    return null;
  }
  const position = (sorted.length - 1) * q;
  const low = Math.floor(position);
  const high = Math.ceil(position);
  const lowValue = sorted[low] as number;
  const highValue = sorted[high] as number;
  return lowValue + (highValue - lowValue) * (position - low);
}

class Usage {
  generations = 0;
  events = 0;
  chatCalls = 0;
  errors = 0;
  unpriced = 0;
  cost = 0;
  inputTokens = 0;
  outputTokens = 0;
  cacheReadTokens = 0;
  first = Number.POSITIVE_INFINITY;
  last = Number.NEGATIVE_INFINITY;
  readonly traces = new Set<string>();
  readonly users = new Set<string>();
  readonly conversations = new Set<string>();
  readonly latencies: number[] = [];
  readonly models = new Map<string, number>();

  add(row: LeanRow) {
    const modelCall = MODEL_CALLS.has(row.type);
    this.events += 1;
    this.traces.add(row.traceId);
    if (row.profileId) {
      this.users.add(row.profileId);
    }
    if (row.conversationId) {
      this.conversations.add(row.conversationId);
    }
    this.cost += row.cost;
    this.inputTokens += row.inputTokens;
    this.outputTokens += row.outputTokens;
    this.cacheReadTokens += row.cacheReadTokens;
    this.first = Math.min(this.first, row.at);
    this.last = Math.max(this.last, row.at);
    if (row.type === 'generation') {
      this.chatCalls += 1;
      this.latencies.push(row.latencyMs);
    }
    if (modelCall) {
      this.generations += 1;
      this.models.set(row.model, (this.models.get(row.model) ?? 0) + 1);
      if (row.isError) {
        this.errors += 1;
      } else if (row.costSource === 'none') {
        this.unpriced += 1;
      }
    }
  }

  private sortedLatencies(): number[] {
    return [...this.latencies].sort((a, b) => a - b);
  }

  private avgLatency(): number | null {
    return this.latencies.length > 0
      ? this.latencies.reduce((sum, value) => sum + value, 0) /
          this.latencies.length
      : null;
  }

  metricsRow() {
    const sorted = this.sortedLatencies();
    return {
      generations: this.generations,
      events: this.events,
      traces: this.traces.size,
      users: this.users.size,
      conversations: this.conversations.size,
      cost: this.cost,
      input_tokens: this.inputTokens,
      output_tokens: this.outputTokens,
      cache_read_tokens: this.cacheReadTokens,
      p50_latency_ms: quantile(sorted, 0.5),
      p95_latency_ms: quantile(sorted, 0.95),
      avg_latency_ms: this.avgLatency(),
      errors: this.errors,
    };
  }

  breakdownRow(key: string) {
    return {
      key,
      generations: this.generations,
      events: this.events,
      traces: this.traces.size,
      users: this.users.size,
      cost: this.cost,
      tokens: this.inputTokens + this.outputTokens,
      avg_latency_ms: this.avgLatency(),
      p95_latency_ms: quantile(this.sortedLatencies(), 0.95),
      errors: this.errors,
      unpriced_calls: this.unpriced,
      chat_calls: this.chatCalls,
      last_at: chText(this.last),
    };
  }

  summaryRow() {
    const any = this.events > 0;
    return {
      generations: this.generations,
      traces: this.traces.size,
      conversations: this.conversations.size,
      cost: this.cost,
      input_tokens: this.inputTokens,
      output_tokens: this.outputTokens,
      avg_latency_ms: this.avgLatency(),
      errors: this.errors,
      unpriced_calls: this.unpriced,
      chat_calls: this.chatCalls,
      first_at: any ? chText(this.first) : '',
      last_at: any ? chText(this.last) : '',
      top_models: [...this.models.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, TOP_MODELS)
        .map(([model]) => model),
    };
  }
}

function overview(
  source: AiReadSource,
  query: Extract<AiQuery, { kind: 'overview' }>
) {
  const range = aiRangeMs(query.range);
  const totals = new Usage();
  const buckets = buildBuckets(
    range[0],
    range[1] + 1,
    query.interval,
    query.range.timezone
  ).map((bucket) => ({ ...bucket, usage: new Usage() }));
  let index = 0;
  scan(source.sql, scopeWhere(range, query.filters), (row) => {
    totals.add(row);
    while (index < buckets.length - 1 && row.at >= (buckets[index]?.end ?? 0)) {
      index += 1;
    }
    const bucket = buckets[index];
    if (bucket && row.at >= bucket.start && row.at < bucket.end) {
      bucket.usage.add(row);
    }
  });
  return {
    totals: totals.metricsRow(),
    series: buckets.map((bucket) => ({
      date: wallClockText(bucket.start, query.range.timezone),
      ...bucket.usage.metricsRow(),
    })),
  };
}

function breakdownKeys(
  row: LeanRow,
  dimension: AiBreakdownDimension
): string[] {
  switch (dimension) {
    case 'model':
      return [row.model];
    case 'provider':
      return [row.provider];
    case 'name':
      return [row.name];
    case 'profile':
      return [row.profileId];
    case 'conversation':
      return [row.conversationId];
    case 'group':
      return row.groups;
    case 'stopReason':
      return [row.stopReason];
    default:
      return row.isError ? [row.errorCode] : [];
  }
}

function breakdown(
  source: AiReadSource,
  query: Extract<AiQuery, { kind: 'breakdown' }>
) {
  const byKey = new Map<string, Usage>();
  scan(source.sql, scopeWhere(aiRangeMs(query.range), query.filters), (row) => {
    for (const key of breakdownKeys(row, query.dimension)) {
      let usage = byKey.get(key);
      if (!usage) {
        usage = new Usage();
        byKey.set(key, usage);
      }
      usage.add(row);
    }
  });
  const byErrors = query.sort === 'errors';
  // Anonymous AI usage is a real share of the spend, so it stays as its own row.
  const keepEmptyKey = query.dimension === 'profile';
  return [...byKey.entries()]
    .filter(
      ([key, usage]) =>
        (keepEmptyKey || key !== '') && (!byErrors || usage.errors > 0)
    )
    .sort(([, a], [, b]) =>
      byErrors
        ? b.errors - a.errors || b.cost - a.cost
        : b.cost - a.cost || b.events - a.events
    )
    .slice(0, query.limit)
    .map(([key, usage]) => usage.breakdownRow(key));
}

interface TraceAcc {
  traceId: string;
  startedAt: number;
  endsAt: number;
  traceName: string | null;
  generationName: string | null;
  firstName: string | null;
  first: LeanRow;
  generations: number;
  events: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  hasError: boolean;
  unpriced: number;
  models: Set<string>;
  groups: Set<string>;
}

function traces(
  source: AiReadSource,
  query: Extract<AiQuery, { kind: 'traces' }>
) {
  const byTrace = new Map<string, TraceAcc>();
  scan(source.sql, scopeWhere(aiRangeMs(query.range), query.filters), (row) => {
    let trace = byTrace.get(row.traceId);
    if (!trace) {
      trace = {
        traceId: row.traceId,
        startedAt: row.at,
        endsAt: row.at,
        traceName: null,
        generationName: null,
        firstName: null,
        first: row,
        generations: 0,
        events: 0,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
        hasError: false,
        unpriced: 0,
        models: new Set(),
        groups: new Set(),
      };
      byTrace.set(row.traceId, trace);
    }
    trace.endsAt = Math.max(trace.endsAt, row.at + row.latencyMs);
    if (row.type === 'trace' && trace.traceName === null) {
      trace.traceName = row.name;
    }
    if (row.name) {
      if (row.type === 'generation' && trace.generationName === null) {
        trace.generationName = row.name;
      }
      trace.firstName ??= row.name;
    }
    trace.events += 1;
    trace.inputTokens += row.inputTokens;
    trace.outputTokens += row.outputTokens;
    trace.cost += row.cost;
    trace.hasError ||= row.isError;
    if (MODEL_CALLS.has(row.type)) {
      trace.generations += 1;
      if (!(row.isError || row.costSource !== 'none')) {
        trace.unpriced += 1;
      }
    }
    if (row.model) {
      trace.models.add(row.model);
    }
    for (const group of row.groups) {
      trace.groups.add(group);
    }
  });
  const cursor = query.cursor ? aiTimeMs(query.cursor) : null;
  return [...byTrace.values()]
    .filter((trace) => cursor === null || trace.startedAt < cursor)
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, query.take)
    .map((trace) => ({
      trace_id: trace.traceId,
      started_at: chText(trace.startedAt),
      duration_ms: trace.endsAt - trace.startedAt,
      trace_name:
        trace.traceName || trace.generationName || trace.firstName || '',
      first_profile_id: trace.first.profileId,
      first_device_id: trace.first.deviceId,
      first_session_id: trace.first.sessionId,
      first_conversation_id: trace.first.conversationId,
      first_id: trace.first.id,
      generations: trace.generations,
      events: trace.events,
      total_input_tokens: trace.inputTokens,
      total_output_tokens: trace.outputTokens,
      cost: trace.cost,
      has_error: trace.hasError,
      unpriced_calls: trace.unpriced,
      models: [...trace.models],
      all_groups: [...trace.groups],
    }));
}

/** A stored call as the ClickHouse row; `content` null keeps only the preview. */
function toAiEvent(
  row: SqlRow,
  projectId: string,
  content: AiContent | null | undefined,
  shown: boolean
): IClickhouseAiEvent {
  const preview = str(row.preview);
  const text: AiContent = shown
    ? (content ?? {
        input: preview ? JSON.stringify(preview) : '',
        output: '',
        tools: '',
      })
    : { input: '', output: '', tools: '' };
  return {
    project_id: projectId,
    id: str(row.id),
    type: str(row.type) as IClickhouseAiEvent['type'],
    trace_id: str(row.trace_id),
    span_id: str(row.span_id),
    parent_id: str(row.parent_id),
    conversation_id: str(row.conversation_id),
    name: str(row.name),
    model: str(row.model),
    provider: str(row.provider),
    input_tokens: num(row.input_tokens),
    output_tokens: num(row.output_tokens),
    cache_read_tokens: num(row.cache_read_tokens),
    cache_write_tokens: num(row.cache_write_tokens),
    reasoning_tokens: num(row.reasoning_tokens),
    input_cost: num(row.input_cost),
    output_cost: num(row.output_cost),
    total_cost: num(row.total_cost),
    cost_source: str(row.cost_source) as IClickhouseAiEvent['cost_source'],
    latency_ms: num(row.latency_ms),
    time_to_first_token_ms: num(row.time_to_first_token_ms),
    is_error: num(row.is_error) === 1,
    http_status: num(row.http_status),
    stop_reason: str(row.stop_reason),
    is_stream: num(row.is_stream) === 1,
    model_parameters: str(row.model_parameters),
    input: text.input,
    output: text.output,
    tools: text.tools,
    error: str(row.error),
    profile_id: str(row.profile_id),
    device_id: str(row.device_id),
    session_id: str(row.session_id),
    groups: JSON.parse(str(row.groups) || '[]') as string[],
    properties: JSON.parse(str(row.properties) || '{}') as Record<
      string,
      string
    >,
    created_at: chText(num(row.created_at)),
  };
}

/** Rows with their full text (from here or the trace's R2 file). */
async function withContent(
  source: AiReadSource,
  rows: SqlRow[]
): Promise<IClickhouseAiEvent[]> {
  const shownFrom = source.now - AI_CONTENT_TTL_MS;
  const wanted = rows
    .filter((row) => num(row.content) === 1 && num(row.created_at) >= shownFrom)
    .map((row) => ({ id: str(row.id), traceId: str(row.trace_id) }));
  const content = await source.loadContent(wanted);
  return rows.map((row) => {
    const shown = num(row.created_at) >= shownFrom;
    const text = content.get(str(row.id)) ?? {
      input: '',
      output: '',
      tools: '',
    };
    return toAiEvent(row, source.projectId, text, shown);
  });
}

function aroundClause(around: string | undefined, where: Where) {
  const at = around ? Date.parse(around) : Number.NaN;
  if (Number.isFinite(at)) {
    where.clause += ' AND created_at BETWEEN ? AND ?';
    where.bindings.push(at - AROUND_MS, at + AROUND_MS);
  }
}

function events(
  source: AiReadSource,
  query: Extract<AiQuery, { kind: 'events' }>
): IClickhouseAiEvent[] {
  const where = scopeWhere(aiRangeMs(query.range), query.filters);
  if (query.cursor) {
    where.clause += ' AND created_at < ?';
    where.bindings.push(aiTimeMs(query.cursor));
  }
  const shownFrom = source.now - AI_CONTENT_TTL_MS;
  return source.sql
    .exec(
      `SELECT * FROM ai_events WHERE ${where.clause} ORDER BY created_at DESC, id DESC LIMIT ?`,
      ...where.bindings,
      query.take
    )
    .map((row) =>
      toAiEvent(row, source.projectId, null, num(row.created_at) >= shownFrom)
    );
}

function summary(
  source: AiReadSource,
  query: Extract<AiQuery, { kind: 'summary' }>
) {
  const where: Where = { clause: '1 = 1', bindings: [] };
  if (query.by === 'group') {
    where.clause = IN_GROUP;
  } else {
    where.clause = query.by === 'profile' ? 'profile_id = ?' : 'session_id = ?';
  }
  where.bindings.push(query.id);
  const usage = new Usage();
  scan(source.sql, where, (row) => usage.add(row));
  return usage.summaryRow();
}

function filterValues(
  source: AiReadSource,
  query: Extract<AiQuery, { kind: 'filterValues' }>
) {
  const [from, to] = aiRangeMs(query.range);
  return (['model', 'provider', 'name'] as const).flatMap((field) =>
    source.sql
      .exec(
        `SELECT ${field} AS value, count(*) AS count FROM ai_events WHERE created_at BETWEEN ? AND ? AND ${field} != '' GROUP BY ${field} ORDER BY count DESC, value`,
        from,
        to
      )
      .map((row) => ({ field, value: str(row.value), count: num(row.count) }))
  );
}

/** One AI read, answered in the ClickHouse row shape of the same query. */
export async function answerAiQuery(
  query: AiQuery,
  source: AiReadSource
): Promise<unknown> {
  switch (query.kind) {
    case 'overview':
      return overview(source, query);
    case 'breakdown':
      return breakdown(source, query);
    case 'traces':
      return traces(source, query);
    case 'events':
      return events(source, query);
    case 'trace': {
      const where: Where = {
        clause: 'trace_id = ?',
        bindings: [query.traceId],
      };
      aroundClause(query.around, where);
      return withContent(
        source,
        source.sql.exec(
          `SELECT * FROM ai_events WHERE ${where.clause} ORDER BY created_at, id`,
          ...where.bindings
        )
      );
    }
    case 'event': {
      const where: Where = { clause: 'id = ?', bindings: [query.id] };
      aroundClause(query.around, where);
      const rows = source.sql.exec(
        `SELECT * FROM ai_events WHERE ${where.clause} LIMIT 1`,
        ...where.bindings
      );
      return (await withContent(source, rows))[0] ?? null;
    }
    case 'summary':
      return summary(source, query);
    default:
      return filterValues(source, query);
  }
}
