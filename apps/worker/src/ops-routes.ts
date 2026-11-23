/**
 * Operator-only recovery endpoints, off unless the OPS_TOKEN secret is set:
 *
 *   GET  /__ops/projects/:projectId/recovery
 *        → { bookmark, eventsLast30Days }
 *   POST /__ops/projects/:projectId/restore   { "at": "<ISO time>" }
 *                                          or { "bookmark": "<bookmark>" }
 *        → { restoredTo, undoBookmark }
 *
 * A restore puts the project's Durable Object (events, rollups, profiles,
 * groups, cohorts, AI calls, Search Console numbers) back to that moment, up
 * to 30 days ago. POST the returned undoBookmark to undo it.
 */
const PREFIX = '/__ops/projects/';
const ROUTE = /^\/__ops\/projects\/([^/]+)\/(recovery|restore)$/;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const BOOKMARK = /^[0-9a-f-]{20,120}$/i;

interface RecoveryStub {
  recoveryStatus(): Promise<{ bookmark: string; eventsLast30Days: number }>;
  restoreTo(target: {
    at?: number;
    bookmark?: string;
  }): Promise<{ restoredTo: string; undoBookmark: string }>;
}

export interface OpsEnv {
  OPS_TOKEN?: string;
}

export function isOpsPath(pathname: string): boolean {
  return pathname.startsWith(PREFIX);
}

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

async function sameSecret(given: string, expected: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(given)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  // Both are 32-byte digests: compare every byte, whatever differs.
  const left = new Uint8Array(a);
  const right = new Uint8Array(b);
  let diff = 0;
  for (let index = 0; index < left.length; index++) {
    // biome-ignore lint/suspicious/noBitwiseOperators: constant-time compare.
    diff |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return diff === 0;
}

export async function handleOps(
  request: Request,
  env: OpsEnv,
  stubFor: (projectId: string) => RecoveryStub
): Promise<Response> {
  const token = env.OPS_TOKEN;
  if (!token) {
    return json({ error: 'Not found' }, 404);
  }
  const given =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!(given && (await sameSecret(given, token)))) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const match = ROUTE.exec(new URL(request.url).pathname);
  const projectId = match?.[1] ? decodeURIComponent(match[1]) : undefined;
  const action = match?.[2];
  if (!(projectId && action)) {
    return json({ error: 'Not found' }, 404);
  }
  const stub = stubFor(projectId);
  // A refused restore (a time before the project's first event, an unknown
  // bookmark) is the caller's to fix: answer it, do not fail the request.
  const restore = async (target: { at?: number; bookmark?: string }) => {
    try {
      return json({ projectId, ...(await stub.restoreTo(target)) });
    } catch (error) {
      return json(
        { error: error instanceof Error ? error.message : String(error) },
        400
      );
    }
  };

  if (action === 'recovery' && request.method === 'GET') {
    return json({ projectId, ...(await stub.recoveryStatus()) });
  }
  if (action === 'restore' && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as {
      at?: string;
      bookmark?: string;
    };
    if (body.bookmark) {
      if (!BOOKMARK.test(body.bookmark)) {
        return json({ error: 'Invalid bookmark' }, 400);
      }
      return restore({ bookmark: body.bookmark });
    }
    const at = body.at ? Date.parse(body.at) : Number.NaN;
    if (
      !Number.isFinite(at) ||
      at > Date.now() ||
      Date.now() - at > MAX_AGE_MS
    ) {
      return json(
        { error: 'Give "at" as an ISO time within the last 30 days' },
        400
      );
    }
    return restore({ at });
  }
  return json({ error: 'Method not allowed' }, 405);
}
