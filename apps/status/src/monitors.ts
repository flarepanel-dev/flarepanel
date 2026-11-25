// What the status page checks, once a minute, from a Worker that shares
// nothing with the services it watches: no binding, no database, no code. A
// check only reads; none of them stores data in FlarePanel.

export type CheckState = 'up' | 'degraded' | 'down';

export interface Monitor {
  id: string;
  name: string;
  description: string;
  url: string;
  method?: 'GET' | 'POST';
  body?: string;
  /** Statuses that mean "answering normally". */
  expect: number[];
  /** Optional check of the answer body. */
  bodyOk?: (text: string) => boolean;
}

export interface CheckResult {
  monitor: string;
  at: number;
  state: CheckState;
  latencyMs: number | null;
  statusCode: number | null;
  error: string | null;
}

/** Slower than this is "degraded"; no answer by the timeout is "down". */
export const DEGRADED_AFTER_MS = 2500;
export const TIMEOUT_MS = 10_000;

export const MONITORS: Monitor[] = [
  {
    id: 'api',
    name: 'API',
    description: 'Dashboard API, REST API and sign-in',
    url: 'https://api.flarepanel.dev/healthcheck',
    expect: [200],
    bodyOk: (text) => {
      try {
        return (JSON.parse(text) as { ready?: boolean }).ready === true;
      } catch {
        return false;
      }
    },
  },
  {
    // An empty event is refused by validation (400): proof that the tracking
    // route answers, without storing anything.
    id: 'tracking',
    name: 'Event tracking',
    description: 'Ingestion of events from the SDKs and script',
    url: 'https://api.flarepanel.dev/track',
    method: 'POST',
    body: '{}',
    expect: [400],
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'dashboard.flarepanel.dev',
    url: 'https://dashboard.flarepanel.dev/login',
    expect: [200],
  },
  {
    // Without a token the MCP server must refuse (401): it is up and guarded.
    id: 'mcp',
    name: 'MCP server',
    description: 'AI assistants connected over MCP',
    url: 'https://api.flarepanel.dev/mcp',
    method: 'POST',
    body: '{"jsonrpc":"2.0","id":1,"method":"ping"}',
    expect: [401],
  },
  {
    id: 'website',
    name: 'Website',
    description: 'flarepanel.dev',
    url: 'https://flarepanel.dev/',
    expect: [200],
  },
  {
    id: 'docs',
    name: 'Documentation',
    description: 'docs.flarepanel.dev',
    url: 'https://docs.flarepanel.dev/',
    expect: [200],
  },
];

export const monitorById = new Map(MONITORS.map((m) => [m.id, m]));

export async function runCheck(
  monitor: Monitor,
  fetchImpl: typeof fetch = fetch,
  now: () => number = Date.now
): Promise<CheckResult> {
  const at = now();
  const started = performance.now();
  try {
    const response = await fetchImpl(monitor.url, {
      method: monitor.method ?? 'GET',
      body: monitor.body,
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'user-agent': 'FlarePanel-Status/1 (+https://status.flarepanel.dev)',
        ...(monitor.body ? { 'content-type': 'application/json' } : {}),
      },
    });
    const text = monitor.bodyOk ? await response.text() : '';
    if (!monitor.bodyOk) {
      await response.body?.cancel();
    }
    const latencyMs = Math.round(performance.now() - started);
    const expected = monitor.expect.includes(response.status);
    const bodyOk = monitor.bodyOk ? monitor.bodyOk(text) : true;
    if (!(expected && bodyOk)) {
      return {
        monitor: monitor.id,
        at,
        state: 'down',
        latencyMs,
        statusCode: response.status,
        error: expected
          ? 'Unexpected answer'
          : `HTTP ${response.status}, expected ${monitor.expect.join(' or ')}`,
      };
    }
    return {
      monitor: monitor.id,
      at,
      state: latencyMs > DEGRADED_AFTER_MS ? 'degraded' : 'up',
      latencyMs,
      statusCode: response.status,
      error: null,
    };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError');
    return {
      monitor: monitor.id,
      at,
      state: 'down',
      latencyMs: null,
      statusCode: null,
      error: timedOut
        ? `No answer within ${TIMEOUT_MS / 1000}s`
        : 'Could not connect',
    };
  }
}
