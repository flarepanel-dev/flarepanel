// AI calls of one project in the project's Durable Object SQLite, with the
// rules of the ClickHouse `ai_events` table: one row per call, keyed by the
// event id, numbers kept for good. Prompt, response and tool text is held
// here only until the trace goes quiet; then the whole trace is written to
// R2 as one gzip file and the rows here are dropped. A short preview and a
// lowercased search snippet stay on the row; text, preview and snippet are
// shown for 30 days, as ClickHouse's column TTL keeps them.

import { getSafeJson } from '@flarepanel/shared';
import type { IClickhouseAiEvent } from '../../ai/src/row';
import type { EngineSql, SqlValue } from './engine';

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS ai_events (
    id TEXT PRIMARY KEY,
    created_at INT NOT NULL,
    type TEXT NOT NULL,
    trace_id TEXT NOT NULL,
    span_id TEXT NOT NULL,
    parent_id TEXT NOT NULL,
    conversation_id TEXT NOT NULL,
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    provider TEXT NOT NULL,
    input_tokens INT NOT NULL,
    output_tokens INT NOT NULL,
    cache_read_tokens INT NOT NULL,
    cache_write_tokens INT NOT NULL,
    reasoning_tokens INT NOT NULL,
    input_cost REAL NOT NULL,
    output_cost REAL NOT NULL,
    total_cost REAL NOT NULL,
    cost_source TEXT NOT NULL,
    latency_ms INT NOT NULL,
    time_to_first_token_ms INT NOT NULL,
    is_error INT NOT NULL,
    http_status INT NOT NULL,
    stop_reason TEXT NOT NULL,
    is_stream INT NOT NULL,
    model_parameters TEXT NOT NULL,
    error TEXT NOT NULL,
    error_code TEXT NOT NULL,
    profile_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    groups TEXT NOT NULL,
    properties TEXT NOT NULL,
    preview TEXT NOT NULL,
    search TEXT NOT NULL,
    content INT NOT NULL
  ) WITHOUT ROWID`,
  'CREATE INDEX IF NOT EXISTS ai_events_time ON ai_events (created_at, id)',
  'CREATE INDEX IF NOT EXISTS ai_events_trace ON ai_events (trace_id, created_at)',
  'CREATE INDEX IF NOT EXISTS ai_events_profile ON ai_events (profile_id, created_at)',
  'CREATE INDEX IF NOT EXISTS ai_events_session ON ai_events (session_id)',
  'CREATE TABLE IF NOT EXISTS ai_content (id TEXT PRIMARY KEY, trace_id TEXT NOT NULL, created_at INT NOT NULL, body TEXT NOT NULL) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS ai_content_trace ON ai_content (trace_id)',
  'CREATE TABLE IF NOT EXISTS ai_pending (trace_id TEXT PRIMARY KEY, first_at INT NOT NULL, last_at INT NOT NULL) WITHOUT ROWID',
];

const DAY_MS = 24 * 60 * 60 * 1000;
/** Prompt and response text is shown this long, as ClickHouse's column TTL. */
export const AI_CONTENT_TTL_MS = 30 * DAY_MS;
const PREVIEW_CHARS = 280;
/** Characters of the prompt and of the response kept for search. */
const SEARCH_CHARS = 1000;
const MAX_FLUSH_TRACES = 50;

export interface AiContent {
  input: string;
  output: string;
  tools: string;
}

/** The trace's text in R2: one gzip JSON file per trace. */
export interface AiContentFile {
  events: Record<string, AiContent>;
}

/** Where flushed traces live (R2 in the Worker); bodies are JSON text. */
export interface AiContentArchive {
  get(key: string): Promise<string | null>;
  put(key: string, body: string): Promise<void>;
}

/** Every R2 file of one project's AI text starts with this. */
export function aiContentPrefix(projectId: string): string {
  return `ai/${encodeURIComponent(projectId)}/`;
}

export function aiContentKey(projectId: string, traceId: string): string {
  return `${aiContentPrefix(projectId)}${encodeURIComponent(traceId)}.json.gz`;
}

function toNumber(value: SqlValue | undefined): number {
  return typeof value === 'number' ? value : Number(value ?? 0);
}

/** The text the dashboard's generation list shows, from the stored prompt. */
function previewOf(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return previewOf(
      (value.at(-1) as { content?: unknown } | undefined)?.content
    );
  }
  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    if (typeof record.text === 'string') {
      return record.text;
    }
    if (typeof record.content === 'string') {
      return record.content;
    }
    return JSON.stringify(value);
  }
  return '';
}

export function aiPreview(input: string): string {
  if (!input) {
    return '';
  }
  return previewOf(getSafeJson<unknown>(input) ?? input).slice(
    0,
    PREVIEW_CHARS
  );
}

function errorCode(error: string): string {
  const parsed = error ? getSafeJson<{ code?: unknown }>(error) : null;
  return typeof parsed?.code === 'string' ? parsed.code : '';
}

export function aiTimeMs(createdAt: string): number {
  return Date.parse(`${createdAt.replace(' ', 'T')}Z`);
}

export function openAiStore(sql: EngineSql, now: () => number = Date.now) {
  for (const statement of SCHEMA) {
    sql.exec(statement);
  }

  /** Stores one call; a redelivered event id is ignored. */
  function add(row: IClickhouseAiEvent): boolean {
    const [existing] = sql.exec(
      'SELECT 1 AS x FROM ai_events WHERE id = ?',
      row.id
    );
    if (existing) {
      return false;
    }
    const at = aiTimeMs(row.created_at);
    const hasContent = Boolean(row.input || row.output || row.tools);
    sql.exec(
      `INSERT INTO ai_events (id, created_at, type, trace_id, span_id, parent_id, conversation_id, name, model, provider, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, reasoning_tokens, input_cost, output_cost, total_cost, cost_source, latency_ms, time_to_first_token_ms, is_error, http_status, stop_reason, is_stream, model_parameters, error, error_code, profile_id, device_id, session_id, groups, properties, preview, search, content)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      row.id,
      at,
      row.type,
      row.trace_id,
      row.span_id,
      row.parent_id,
      row.conversation_id,
      row.name,
      row.model,
      row.provider,
      row.input_tokens,
      row.output_tokens,
      row.cache_read_tokens,
      row.cache_write_tokens,
      row.reasoning_tokens,
      row.input_cost,
      row.output_cost,
      row.total_cost,
      row.cost_source,
      row.latency_ms,
      row.time_to_first_token_ms,
      row.is_error ? 1 : 0,
      row.http_status,
      row.stop_reason,
      row.is_stream ? 1 : 0,
      row.model_parameters,
      row.error,
      errorCode(row.error),
      row.profile_id,
      row.device_id,
      row.session_id,
      JSON.stringify(row.groups ?? []),
      JSON.stringify(row.properties ?? {}),
      aiPreview(row.input),
      `${row.input.slice(0, SEARCH_CHARS)}\n${row.output.slice(0, SEARCH_CHARS)}`.toLowerCase(),
      hasContent ? 1 : 0
    );
    if (hasContent) {
      const content: AiContent = {
        input: row.input,
        output: row.output,
        tools: row.tools,
      };
      sql.exec(
        'INSERT OR REPLACE INTO ai_content (id, trace_id, created_at, body) VALUES (?, ?, ?, ?)',
        row.id,
        row.trace_id,
        at,
        JSON.stringify(content)
      );
      sql.exec(
        'INSERT INTO ai_pending (trace_id, first_at, last_at) VALUES (?, ?, ?) ON CONFLICT (trace_id) DO UPDATE SET last_at = excluded.last_at',
        row.trace_id,
        now(),
        now()
      );
    }
    return true;
  }

  /**
   * Traces whose text should go to R2 now: quiet since `quietBefore`, or
   * pending since `oldestBefore` (a trace that never stops still gets saved).
   */
  function dueTraces(quietBefore: number, oldestBefore: number): string[] {
    return sql
      .exec(
        'SELECT trace_id FROM ai_pending WHERE last_at <= ? OR first_at <= ? ORDER BY last_at LIMIT ?',
        quietBefore,
        oldestBefore,
        MAX_FLUSH_TRACES
      )
      .map((row) => String(row.trace_id));
  }

  /** When the next trace becomes due, or null with nothing pending. */
  function nextDueAt(quietMs: number, maxAgeMs: number): number | null {
    const [row] = sql.exec(
      'SELECT min(last_at) AS quiet, min(first_at) AS oldest FROM ai_pending'
    );
    if (!row || row.quiet === null) {
      return null;
    }
    return Math.min(
      toNumber(row.quiet) + quietMs,
      toNumber(row.oldest) + maxAgeMs
    );
  }

  /** Text still held here, by event id. */
  function localContent(ids: string[]): Map<string, AiContent> {
    const found = new Map<string, AiContent>();
    if (ids.length === 0) {
      return found;
    }
    for (const row of sql.exec(
      'SELECT id, body FROM ai_content WHERE id IN (SELECT value FROM json_each(?))',
      JSON.stringify(ids)
    )) {
      found.set(String(row.id), JSON.parse(String(row.body)) as AiContent);
    }
    return found;
  }

  function traceContent(traceId: string): Record<string, AiContent> {
    const events: Record<string, AiContent> = {};
    for (const row of sql.exec(
      'SELECT id, body FROM ai_content WHERE trace_id = ?',
      traceId
    )) {
      events[String(row.id)] = JSON.parse(String(row.body)) as AiContent;
    }
    return events;
  }

  /**
   * Drops text that reached R2. Text stored meanwhile keeps the trace
   * pending for the next flush.
   */
  function dropFlushed(traceId: string, ids: string[]) {
    sql.exec(
      'DELETE FROM ai_content WHERE id IN (SELECT value FROM json_each(?))',
      JSON.stringify(ids)
    );
    const [left] = sql.exec(
      'SELECT count(*) AS n FROM ai_content WHERE trace_id = ?',
      traceId
    );
    if (toNumber(left?.n) === 0) {
      sql.exec('DELETE FROM ai_pending WHERE trace_id = ?', traceId);
    }
  }

  /**
   * Text older than the content TTL: preview and snippet cleared, text
   * still held here (no R2 archive) deleted.
   */
  function expireContent(beforeMs: number) {
    sql.exec(
      "UPDATE ai_events SET preview = '', search = '' WHERE created_at < ? AND (preview != '' OR search != '')",
      beforeMs
    );
    const traces = sql
      .exec(
        'SELECT DISTINCT trace_id FROM ai_content WHERE created_at < ?',
        beforeMs
      )
      .map((row) => String(row.trace_id));
    sql.exec('DELETE FROM ai_content WHERE created_at < ?', beforeMs);
    for (const traceId of traces) {
      dropFlushed(traceId, []);
    }
  }

  return {
    add,
    dueTraces,
    nextDueAt,
    localContent,
    traceContent,
    dropFlushed,
    expireContent,
  };
}

export type AiStore = ReturnType<typeof openAiStore>;

/**
 * Writes each due trace's text to its R2 file (merged with what an earlier
 * flush of the same trace wrote), then drops it here. Returns traces written.
 */
export async function flushAiContent(input: {
  store: AiStore;
  archive: AiContentArchive;
  projectId: string;
  quietBefore: number;
  oldestBefore: number;
}): Promise<number> {
  const { store, archive, projectId } = input;
  let written = 0;
  for (const traceId of store.dueTraces(
    input.quietBefore,
    input.oldestBefore
  )) {
    const pending = store.traceContent(traceId);
    const ids = Object.keys(pending);
    if (ids.length > 0) {
      const key = aiContentKey(projectId, traceId);
      const existing = await archive.get(key);
      const file: AiContentFile = {
        events: {
          ...(existing
            ? (getSafeJson<AiContentFile>(existing)?.events ?? {})
            : {}),
          ...pending,
        },
      };
      await archive.put(key, JSON.stringify(file));
      written += 1;
    }
    store.dropFlushed(traceId, ids);
  }
  return written;
}

/**
 * Full text of these calls: still held here, or read from their traces' R2
 * files (one read per trace).
 */
export async function loadAiContent(input: {
  store: AiStore;
  archive: AiContentArchive | null;
  projectId: string;
  rows: { id: string; traceId: string }[];
}): Promise<Map<string, AiContent>> {
  const found = input.store.localContent(input.rows.map((row) => row.id));
  if (!input.archive) {
    return found;
  }
  const traces = new Set(
    input.rows.filter((row) => !found.has(row.id)).map((row) => row.traceId)
  );
  for (const traceId of traces) {
    const body = await input.archive.get(
      aiContentKey(input.projectId, traceId)
    );
    const file = body ? getSafeJson<AiContentFile>(body) : null;
    for (const [id, content] of Object.entries(file?.events ?? {})) {
      if (!found.has(id)) {
        found.set(id, content);
      }
    }
  }
  return found;
}
