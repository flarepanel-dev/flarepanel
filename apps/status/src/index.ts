// status.flarepanel.dev: checks FlarePanel every minute and shows the result.
// Deliberately separate from the API and dashboard Workers, so the page still
// answers (and says so) when they do not.

import {
  type Impact,
  INCIDENT_STATUSES,
  type IncidentStatus,
} from './incidents';
import { MONITORS, monitorById, runCheck } from './monitors';
import {
  ANALYTICS_API,
  ANALYTICS_SCRIPT_HASH,
  ANALYTICS_SRC,
  renderActionPage,
  renderFeed,
  renderHistoryPage,
  renderIncidentPage,
  renderMessage,
  renderNotFound,
  renderStatusPage,
  renderSubscribePage,
  SCRIPT_HASH,
  SITE,
} from './render';
import {
  addIncidentUpdate,
  createIncident,
  loadIncident,
  loadIncidents,
  loadSnapshot,
  prune,
  recordRound,
} from './store';
import {
  confirm,
  type EmailSender,
  type MailDeps,
  queueNotifications,
  sendOutbox,
  subscribe,
  unsubscribe,
} from './subscribers';
import { buildView, OVERALL_TEXT } from './view';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  /** Secret: lets the operator post incidents and maintenance. Unset: off. */
  STATUS_ADMIN_TOKEN?: string;
  /** Cloudflare Email Service: email updates. Unset: the email option hides. */
  EMAIL?: SendEmail;
  /** Sender of status emails; defaults to hello@flarepanel.dev. */
  STATUS_EMAIL_FROM?: string;
  /** Secret signing unsubscribe links and keying rate limits. Unset: no email. */
  STATUS_SIGNING_KEY?: string;
}

const DAY = 24 * 60 * 60 * 1000;
const PAGE_TTL_SECONDS = 30;

const SECURITY_HEADERS: Record<string, string> = {
  'content-security-policy': `default-src 'none'; script-src '${SCRIPT_HASH}' '${ANALYTICS_SCRIPT_HASH}' ${ANALYTICS_SRC}; connect-src ${ANALYTICS_API}; style-src 'unsafe-inline'; font-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'`,
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'DENY',
};

function respond(
  body: string,
  type: string,
  init: { status?: number; ttl?: number; cors?: boolean } = {}
): Response {
  const headers = new Headers(SECURITY_HEADERS);
  headers.set('content-type', type);
  // Browsers always ask again: the zone's browser-cache setting would
  // otherwise stretch a short max-age to hours, and a status page must not
  // show a stale state. The Worker keeps its own 30-second copy (`cached`).
  headers.set('cache-control', init.ttl ? 'no-cache' : 'no-store');
  if (init.cors) {
    headers.set('access-control-allow-origin', '*');
  }
  return new Response(body, { status: init.status ?? 200, headers });
}

const json = (body: unknown, status = 200, ttl?: number) =>
  respond(JSON.stringify(body), 'application/json; charset=utf-8', {
    status,
    ttl,
    cors: true,
  });

async function sameSecret(given: string, expected: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(given)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  const left = new Uint8Array(a);
  const right = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < left.length; i++) {
    // biome-ignore lint/suspicious/noBitwiseOperators: constant-time compare.
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

const IMPACTS: Impact[] = ['minor', 'major', 'maintenance'];
const isStatus = (v: unknown): v is IncidentStatus =>
  typeof v === 'string' && (INCIDENT_STATUSES as readonly string[]).includes(v);
const text = (v: unknown, max: number) =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= max
    ? v.trim()
    : null;
const timeOf = (v: unknown) => {
  if (v === undefined || v === null) {
    return undefined;
  }
  const at = typeof v === 'string' ? Date.parse(v) : Number.NaN;
  return Number.isFinite(at) ? at : null;
};

/**
 * Email updates are on when the EMAIL binding and the STATUS_SIGNING_KEY
 * secret (unsubscribe links, rate-limit keys) are both set.
 */
function mailDeps(env: Env): MailDeps | undefined {
  if (!(env.EMAIL && env.STATUS_SIGNING_KEY)) {
    return;
  }
  return {
    email: env.EMAIL as unknown as EmailSender,
    key: env.STATUS_SIGNING_KEY,
    site: SITE,
    from: env.STATUS_EMAIL_FROM ?? 'hello@flarepanel.dev',
  };
}

/** Queues subscriber emails for these incidents; never fails the caller. */
async function announce(env: Env, ids: string[], now: number) {
  if (!mailDeps(env)) {
    return;
  }
  try {
    await queueNotifications(env.DB, ids, now);
  } catch (error) {
    console.error('Could not queue status emails', error);
  }
}

/** Operator API: POST /api/admin/incidents and /api/admin/incidents/:id. */
async function admin(
  request: Request,
  env: Env,
  path: string
): Promise<Response> {
  const token = env.STATUS_ADMIN_TOKEN;
  const given =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!token) {
    return json({ error: 'Not found' }, 404);
  }
  if (!(given && (await sameSecret(given, token)))) {
    return json({ error: 'Unauthorized' }, 401);
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return json({ error: 'Send a JSON body' }, 400);
  }
  const now = Date.now();
  const message = text(body.message, 2000);
  if (!(message && isStatus(body.status))) {
    return json(
      {
        error: `Give "message" and "status" (${INCIDENT_STATUSES.join(', ')})`,
      },
      400
    );
  }

  const match = /^\/api\/admin\/incidents\/([^/]+)$/.exec(path);
  if (match?.[1]) {
    const incidentId = decodeURIComponent(match[1]);
    const ok = await addIncidentUpdate(
      env.DB,
      incidentId,
      { status: body.status, message },
      now
    );
    if (ok) {
      await announce(env, [incidentId], now);
    }
    return ok ? json({ ok: true }) : json({ error: 'Incident not found' }, 404);
  }
  if (path !== '/api/admin/incidents') {
    return json({ error: 'Not found' }, 404);
  }

  const title = text(body.title, 200);
  const impact = IMPACTS.find((i) => i === body.impact);
  const monitors = Array.isArray(body.monitors)
    ? body.monitors.filter(
        (m): m is string => typeof m === 'string' && monitorById.has(m)
      )
    : [];
  const startsAt = timeOf(body.startsAt);
  const until = timeOf(body.until);
  if (!(title && impact) || startsAt === null || until === null) {
    return json(
      {
        error: `Give "title", "impact" (${IMPACTS.join(', ')}), optional "monitors" (${MONITORS.map((m) => m.id).join(', ')}) and ISO "startsAt"/"until"`,
      },
      400
    );
  }
  const id = await createIncident(
    env.DB,
    {
      title,
      impact,
      status: body.status,
      monitors,
      message,
      startsAt,
      scheduledUntil: until,
    },
    now
  );
  // Planned maintenance is announced when it is scheduled, and again when it
  // starts and ends (advanceMaintenance).
  await announce(env, [id], now);
  return json({ ok: true, id }, 201);
}

/** Planned maintenance starts and ends on its own schedule. */
async function advanceMaintenance(
  db: D1Database,
  now: number
): Promise<string[]> {
  const due = await db
    .prepare(
      `SELECT id FROM incidents
       WHERE (status = 'scheduled' AND started_at <= ?1)
          OR (status = 'in_progress' AND scheduled_until IS NOT NULL AND scheduled_until <= ?1)`
    )
    .bind(now)
    .all<{ id: string }>();
  if (due.results.length === 0) {
    return [];
  }
  await db.batch([
    db
      .prepare(
        `INSERT INTO incident_updates (incident_id, at, status, message)
         SELECT id, ?1, 'in_progress', 'Maintenance has started.' FROM incidents
         WHERE status = 'scheduled' AND started_at <= ?1`
      )
      .bind(now),
    db
      .prepare(
        `UPDATE incidents SET status = 'in_progress' WHERE status = 'scheduled' AND started_at <= ?`
      )
      .bind(now),
    db
      .prepare(
        `INSERT INTO incident_updates (incident_id, at, status, message)
         SELECT id, ?1, 'completed', 'Maintenance is complete.' FROM incidents
         WHERE status = 'in_progress' AND scheduled_until IS NOT NULL AND scheduled_until <= ?1`
      )
      .bind(now),
    db
      .prepare(
        `UPDATE incidents SET status = 'completed', resolved_at = ?1
         WHERE status = 'in_progress' AND scheduled_until IS NOT NULL AND scheduled_until <= ?1`
      )
      .bind(now),
  ]);
  return due.results.map((row) => row.id);
}

/** Email subscription routes; never cached. */
async function updates(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  url: URL,
  path: string
): Promise<Response | null> {
  const page = (title: string, text: string, status = 200) =>
    respond(renderMessage(title, text), 'text/html; charset=utf-8', { status });
  const now = Date.now();

  if (path === '/subscribe' && request.method === 'POST') {
    // Only our own form: another site must not submit it from its visitors'
    // browsers.
    const origin = request.headers.get('origin');
    const site = request.headers.get('sec-fetch-site');
    if ((origin && origin !== url.origin) || site === 'cross-site') {
      return page('Not allowed', 'Subscribe from the Get updates page.', 403);
    }
    const form = await request.formData().catch(() => null);
    const result = await subscribe(
      env.DB,
      mailDeps(env),
      {
        email: form?.get('email'),
        monitors: (form?.getAll('monitors') ?? []).map(String),
        clientIp: request.headers.get('cf-connecting-ip') ?? 'unknown',
      },
      now,
      (work) => ctx.waitUntil(work)
    );
    if (result === 'sent') {
      return page(
        'Check your inbox',
        'If this address is not subscribed yet, we have sent it a link to confirm. Nothing is sent until you click it.'
      );
    }
    if (result === 'invalid') {
      return page(
        'That address looks wrong',
        'Go back and check the email address.',
        400
      );
    }
    if (result === 'rate-limited') {
      return page('Too many attempts', 'Please try again in an hour.', 429);
    }
    if (result === 'busy') {
      return page(
        'Too many sign-ups right now',
        'Please try again later, or use the RSS feed.',
        429
      );
    }
    return page(
      'Email updates are not available',
      'Use the RSS feed instead.',
      503
    );
  }
  // Links in emails only show a button; the button's POST does the work.
  const here = `${url.pathname}${url.search}`;
  if (path === '/subscribe/confirm') {
    if (request.method !== 'POST') {
      return respond(
        renderActionPage(
          'Confirm your subscription',
          'Press the button to start getting FlarePanel status emails.',
          'Confirm subscription',
          here
        ),
        'text/html; charset=utf-8'
      );
    }
    const ok = await confirm(env.DB, url.searchParams.get('token') ?? '', now);
    return ok
      ? page(
          'You are subscribed',
          'We will email you when an incident or maintenance affects FlarePanel.'
        )
      : page(
          'This link does not work',
          'It may have expired. Subscribe again from the Get updates page.',
          400
        );
  }
  if (path === '/unsubscribe') {
    if (request.method !== 'POST') {
      return respond(
        renderActionPage(
          'Unsubscribe',
          'Press the button to stop getting FlarePanel status emails.',
          'Unsubscribe',
          here
        ),
        'text/html; charset=utf-8'
      );
    }
    // Our button and a mail client's one-click unsubscribe (RFC 8058) both
    // POST here with the signed id and token in the query.
    const key = env.STATUS_SIGNING_KEY;
    const result = key
      ? await unsubscribe(
          env.DB,
          key,
          url.searchParams.get('id') ?? '',
          url.searchParams.get('token') ?? ''
        )
      : 'invalid';
    if (result === 'invalid') {
      return page(
        'This link does not work',
        'Use the unsubscribe link in your most recent status email, or write to hello@flarepanel.dev.',
        400
      );
    }
    return result === 'removed'
      ? page(
          'You are unsubscribed',
          'You will not get status emails from FlarePanel any more.'
        )
      : page('Already unsubscribed', 'This address gets no status emails.');
  }
  return null;
}

async function cached(
  request: Request,
  ctx: ExecutionContext,
  make: () => Promise<Response>
): Promise<Response> {
  const cache = (caches as unknown as { default: Cache }).default;
  const key = new Request(new URL(request.url).toString(), { method: 'GET' });
  const hit = await cache.match(key);
  if (hit) {
    return forBrowser(hit);
  }
  const response = await make();
  if (response.status === 200) {
    const copy = new Response(response.clone().body, response);
    copy.headers.set('cache-control', `public, max-age=${PAGE_TTL_SECONDS}`);
    ctx.waitUntil(cache.put(key, copy));
  }
  return response;
}

/** The Worker cache copy carries a max-age; what leaves for the browser does not. */
function forBrowser(response: Response): Response {
  const out = new Response(response.body, response);
  out.headers.set('cache-control', 'no-cache');
  return out;
}

/** Plain-HTTP visits go to HTTPS (`cf-visitor` is set by Cloudflare's edge). */
function httpsRedirect(request: Request): Response | null {
  let scheme: unknown;
  try {
    scheme = JSON.parse(request.headers.get('cf-visitor') ?? '{}')?.scheme;
  } catch {
    return null;
  }
  if (scheme !== 'http') {
    return null;
  }
  const url = new URL(request.url);
  url.protocol = 'https:';
  return Response.redirect(url.toString(), 301);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const insecure = httpsRedirect(request);
    if (insecure) {
      return insecure;
    }
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const html = (body: string, status = 200) =>
      respond(body, 'text/html; charset=utf-8', {
        status,
        ttl: status === 200 ? PAGE_TTL_SECONDS : undefined,
      });

    if (path.startsWith('/api/admin/')) {
      return admin(request, env, path);
    }
    const update = await updates(request, env, ctx, url, path);
    if (update) {
      return update;
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json({ error: 'Method not allowed' }, 405);
    }
    if (path === '/healthz') {
      return json({ ok: true });
    }

    return cached(request, ctx, async () => {
      const now = Date.now();
      if (path === '/') {
        return html(
          renderStatusPage(buildView(await loadSnapshot(env.DB, now)))
        );
      }
      if (path === '/api/status.json') {
        const view = buildView(await loadSnapshot(env.DB, now));
        return json(
          {
            status: view.overall,
            description: OVERALL_TEXT[view.overall],
            updatedAt: new Date(now).toISOString(),
            services: view.monitors.map((m) => ({
              id: m.monitor.id,
              name: m.monitor.name,
              state: m.state,
              uptime90d: m.uptime === null ? null : Number(m.uptime.toFixed(3)),
            })),
            incidents: view.active.map((i) => ({
              id: i.id,
              title: i.title,
              impact: i.impact,
              status: i.status,
              startedAt: new Date(i.startedAt).toISOString(),
            })),
          },
          200,
          PAGE_TTL_SECONDS
        );
      }
      if (path === '/history') {
        return html(
          renderHistoryPage(
            await loadIncidents(env.DB, now - 90 * DAY),
            now,
            url.searchParams.get('type') === 'maintenance'
              ? 'maintenance'
              : 'incidents'
          )
        );
      }
      if (path === '/subscribe') {
        return html(renderSubscribePage(Boolean(mailDeps(env))));
      }
      if (path === '/feed.atom' || path === '/feed.xml' || path === '/rss') {
        return respond(
          renderFeed(await loadIncidents(env.DB, now - 90 * DAY)),
          'application/atom+xml; charset=utf-8',
          { ttl: PAGE_TTL_SECONDS }
        );
      }
      const incident = /^\/incidents\/([^/]+)$/.exec(path);
      if (incident?.[1]) {
        const found = await loadIncident(
          env.DB,
          decodeURIComponent(incident[1])
        );
        return found
          ? html(renderIncidentPage(found, now))
          : html(renderNotFound(), 404);
      }
      return html(renderNotFound(), 404);
    });
  },

  async scheduled(controller: ScheduledController, env: Env) {
    const now = controller.scheduledTime;
    const results = await Promise.all(MONITORS.map((m) => runCheck(m)));
    const changes = await recordRound(env.DB, results, now);
    const maintenance = await advanceMaintenance(env.DB, now);
    await announce(
      env,
      [...changes.opened, ...changes.resolved, ...maintenance],
      now
    );
    try {
      await sendOutbox(env.DB, mailDeps(env), (id) => loadIncident(env.DB, id));
    } catch (error) {
      console.error('Could not send status emails', error);
    }
    if (new Date(now).getUTCMinutes() === 0) {
      await prune(env.DB, now);
    }
  },
} satisfies ExportedHandler<Env>;
