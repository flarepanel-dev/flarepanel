// Email updates for status.flarepanel.dev.
//
// Subscribing: double opt-in (the emailed link opens a page whose button
// confirms), optional per-service choice, and limits so the form cannot be
// used against someone's inbox or our shared email allowance.
//
// Sending: incident changes are queued in `email_outbox` (one row per
// subscriber, covering every incident of that round) and the minute cron
// sends a bounded batch, so a large list is never cut off by a request's
// time limit, and a flapping service does not mail everyone every few minutes.

import { STATUS_LABEL } from './incidents';
import { monitorById } from './monitors';
import type { Incident } from './store';

export interface EmailSender {
  send(message: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
    headers?: Record<string, string>;
  }): Promise<unknown>;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Subscribe attempts per client network (IPv4 address or IPv6 /64) and hour. */
export const ATTEMPTS_PER_HOUR = 5;
/** A pending address gets at most one confirmation email per hour… */
export const RESEND_AFTER_MS = HOUR;
/** …and at most this many in total, however many networks ask. */
export const MAX_CONFIRMATIONS = 3;
/** Confirmation emails across all addresses, so the allowance stays safe. */
export const CONFIRMATIONS_PER_HOUR = 30;
export const CONFIRMATIONS_PER_DAY = 150;
/** An automatic incident on a service that recovered this recently is not mailed. */
export const FLAP_COOLDOWN_MS = HOUR;
/** Emails the cron sends per run (one run a minute). */
export const OUTBOX_BATCH = 100;
const OUTBOX_MAX_ATTEMPTS = 5;
const SUBSCRIBER_PAGE = 500;

const EMAIL_PATTERN = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const email = raw.trim().toLowerCase();
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
}

/**
 * The network a client address belongs to for rate limits: the address for
 * IPv4, its /64 for IPv6 (one IPv6 customer can use billions of addresses).
 */
export function clientNetwork(ip: string): string {
  if (!ip.includes(':')) {
    return ip;
  }
  const [head = '', tail = ''] = ip.split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const groups = ip.includes('::')
    ? [
        ...left,
        ...new Array(8 - left.length - right.length).fill('0'),
        ...right,
      ]
    : left;
  return `${groups
    .slice(0, 4)
    .map((g) => g.toLowerCase().replace(/^0+(?=.)/, ''))
    .join(':')}::/64`;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmac(key: string, value: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(value)
  );
  return [...new Uint8Array(signature)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** The same link in every email, so an old email's link keeps working. */
export function unsubscribeToken(key: string, subscriberId: string) {
  return hmac(key, `unsubscribe:${subscriberId}`);
}

function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    // biome-ignore lint/suspicious/noBitwiseOperators: constant-time compare.
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface MailDeps {
  email: EmailSender;
  /** Secret for unsubscribe links and the rate-limit keys. */
  key: string;
  site: string;
  from: string;
}

export type SubscribeResult =
  | 'sent'
  | 'invalid'
  | 'rate-limited'
  | 'busy'
  | 'unavailable';

/**
 * Starts a subscription and queues the confirmation email on `defer`, so
 * every outcome answers in about the same time. The answer never tells
 * whether an address is already subscribed ("sent" either way).
 */
export async function subscribe(
  db: D1Database,
  mail: MailDeps | undefined,
  input: { email: unknown; monitors: string[]; clientIp: string },
  now: number,
  defer: (work: Promise<unknown>) => void
): Promise<SubscribeResult> {
  if (!mail) {
    return 'unavailable';
  }
  const address = normalizeEmail(input.email);
  if (!address) {
    return 'invalid';
  }
  // Keyed, so a stored value cannot be turned back into an address.
  const network = await hmac(
    mail.key,
    `subscribe:${clientNetwork(input.clientIp)}`
  );
  const attempts = await db
    .prepare(
      'SELECT COUNT(*) AS n FROM subscribe_attempts WHERE ip_hash = ? AND at > ?'
    )
    .bind(network, now - HOUR)
    .first<{ n: number }>();
  if ((attempts?.n ?? 0) >= ATTEMPTS_PER_HOUR) {
    return 'rate-limited';
  }
  await db
    .prepare('INSERT INTO subscribe_attempts (ip_hash, at) VALUES (?, ?)')
    .bind(network, now)
    .run();

  const recent = await db
    .prepare(
      `SELECT
         SUM(last_sent_at > ?1) AS hour,
         SUM(last_sent_at > ?2) AS day
       FROM subscribers WHERE confirmed_at IS NULL`
    )
    .bind(now - HOUR, now - DAY)
    .first<{ hour: number | null; day: number | null }>();
  if (
    (recent?.hour ?? 0) >= CONFIRMATIONS_PER_HOUR ||
    (recent?.day ?? 0) >= CONFIRMATIONS_PER_DAY
  ) {
    return 'busy';
  }

  const monitors = input.monitors.filter((id) => monitorById.has(id));
  const monitorsJson = monitors.length ? JSON.stringify(monitors) : null;
  const token = newToken();
  const tokenHash = await sha256(token);

  const inserted = await db
    .prepare(
      `INSERT INTO subscribers (id, email, token_hash, monitors, created_at, last_sent_at, sends)
       VALUES (?, ?, ?, ?, ?, ?, 1) ON CONFLICT (email) DO NOTHING`
    )
    .bind(crypto.randomUUID(), address, tokenHash, monitorsJson, now, now)
    .run();

  let scope = monitors;
  if (inserted.meta.changes === 0) {
    const existing = await db
      .prepare(
        'SELECT id, monitors, confirmed_at, last_sent_at, sends FROM subscribers WHERE email = ?'
      )
      .bind(address)
      .first<{
        id: string;
        monitors: string | null;
        confirmed_at: number | null;
        last_sent_at: number | null;
        sends: number;
      }>();
    if (
      !existing ||
      existing.confirmed_at ||
      (existing.last_sent_at &&
        now - existing.last_sent_at < RESEND_AFTER_MS) ||
      existing.sends >= MAX_CONFIRMATIONS
    ) {
      return 'sent';
    }
    // A resend keeps the services the address first asked for: someone else
    // re-submitting it cannot change them.
    await db
      .prepare(
        'UPDATE subscribers SET token_hash = ?, last_sent_at = ?, sends = sends + 1 WHERE id = ?'
      )
      .bind(tokenHash, now, existing.id)
      .run();
    scope = existing.monitors
      ? (JSON.parse(existing.monitors) as string[])
      : [];
  }

  const confirmUrl = `${mail.site}/subscribe/confirm?token=${token}`;
  const scopeText = scope.length
    ? scope.map((id) => monitorById.get(id)?.name ?? id).join(', ')
    : 'all FlarePanel services';
  defer(
    mail.email
      .send({
        from: mail.from,
        to: address,
        subject: 'Confirm your FlarePanel status updates',
        text: [
          `Confirm that you want emails when an incident affects ${scopeText}:`,
          '',
          confirmUrl,
          '',
          'If you did not ask for this, ignore this email and nothing happens.',
        ].join('\n'),
        html: emailHtml(
          'Confirm your status updates',
          `<p>Confirm that you want an email when an incident or maintenance affects <strong>${escapeHtml(scopeText)}</strong>.</p>
<p><a href="${confirmUrl}" style="display:inline-block;background:#f9fafe;color:#0d0d10;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600">Confirm subscription</a></p>
<p style="color:#727276">If you did not ask for this, ignore this email and nothing happens.</p>`
        ),
      })
      .catch((error) => console.error('Confirmation email failed', error))
  );
  return 'sent';
}

export async function confirm(
  db: D1Database,
  token: string,
  now: number
): Promise<boolean> {
  if (!/^[0-9a-f]{48}$/.test(token)) {
    return false;
  }
  const result = await db
    .prepare(
      'UPDATE subscribers SET confirmed_at = COALESCE(confirmed_at, ?) WHERE token_hash = ?'
    )
    .bind(now, await sha256(token))
    .run();
  return result.meta.changes > 0;
}

export type UnsubscribeResult = 'removed' | 'not-found' | 'invalid';

export async function unsubscribe(
  db: D1Database,
  key: string,
  subscriberId: string,
  token: string
): Promise<UnsubscribeResult> {
  if (!(/^[0-9a-f-]{36}$/.test(subscriberId) && /^[0-9a-f]{64}$/.test(token))) {
    return 'invalid';
  }
  if (!sameText(await unsubscribeToken(key, subscriberId), token)) {
    return 'invalid';
  }
  const result = await db
    .prepare('DELETE FROM subscribers WHERE id = ?')
    .bind(subscriberId)
    .run();
  return result.meta.changes > 0 ? 'removed' : 'not-found';
}

interface IncidentRow {
  id: string;
  auto: number;
  status: string;
  monitors: string;
  notified: number;
  resolved_at: number | null;
}

/**
 * Decides which of these changed incidents subscribers hear about, and
 * queues one email per subscriber covering them. Automatic incidents on a
 * service that recovered within FLAP_COOLDOWN_MS are not mailed, and their
 * resolution is only mailed if their opening was.
 */
export async function queueNotifications(
  db: D1Database,
  incidentIds: string[],
  now: number
): Promise<number> {
  const ids = [...new Set(incidentIds)];
  if (ids.length === 0) {
    return 0;
  }
  const rows = await db
    .prepare(
      `SELECT id, auto, status, monitors, notified, resolved_at FROM incidents
       WHERE id IN (${ids.map(() => '?').join(',')})`
    )
    .bind(...ids)
    .all<IncidentRow>();

  const announce: { id: string; monitors: string[] }[] = [];
  for (const row of rows.results) {
    const monitors = JSON.parse(row.monitors) as string[];
    const closed = row.status === 'resolved' || row.status === 'completed';
    if (row.auto === 1) {
      if (closed && row.notified !== 1) {
        continue;
      }
      if (!closed && row.notified !== 1) {
        const flapped = await db
          .prepare(
            `SELECT 1 FROM incidents, json_each(incidents.monitors) m
             WHERE incidents.auto = 1 AND incidents.id <> ?
               AND incidents.resolved_at > ?
               AND m.value IN (${monitors.map(() => '?').join(',') || "''"})
             LIMIT 1`
          )
          .bind(row.id, now - FLAP_COOLDOWN_MS, ...monitors)
          .first();
        if (flapped) {
          continue;
        }
      }
    }
    announce.push({ id: row.id, monitors });
  }
  if (announce.length === 0) {
    return 0;
  }
  await db
    .prepare(
      `UPDATE incidents SET notified = 1 WHERE id IN (${announce.map(() => '?').join(',')})`
    )
    .bind(...announce.map((a) => a.id))
    .run();

  let queued = 0;
  let after = '';
  for (;;) {
    const page = await db
      .prepare(
        `SELECT id, monitors FROM subscribers
         WHERE confirmed_at IS NOT NULL AND id > ? ORDER BY id LIMIT ?`
      )
      .bind(after, SUBSCRIBER_PAGE)
      .all<{ id: string; monitors: string | null }>();
    if (page.results.length === 0) {
      break;
    }
    const statements: D1PreparedStatement[] = [];
    for (const subscriber of page.results) {
      const wanted = subscriber.monitors
        ? (JSON.parse(subscriber.monitors) as string[])
        : null;
      const relevant = announce.filter(
        (a) =>
          !wanted ||
          a.monitors.length === 0 ||
          a.monitors.some((m) => wanted.includes(m))
      );
      if (relevant.length > 0) {
        statements.push(
          db
            .prepare(
              'INSERT INTO email_outbox (subscriber_id, incident_ids, created_at) VALUES (?, ?, ?)'
            )
            .bind(subscriber.id, JSON.stringify(relevant.map((a) => a.id)), now)
        );
      }
    }
    if (statements.length > 0) {
      await db.batch(statements);
      queued += statements.length;
    }
    after = page.results.at(-1)?.id ?? after;
    if (page.results.length < SUBSCRIBER_PAGE) {
      break;
    }
  }
  return queued;
}

/** Sends up to OUTBOX_BATCH queued emails; called by the minute cron. */
export async function sendOutbox(
  db: D1Database,
  mail: MailDeps | undefined,
  loadIncident: (id: string) => Promise<Incident | null>
): Promise<number> {
  if (!mail) {
    return 0;
  }
  const rows = await db
    .prepare(
      `SELECT o.id, o.incident_ids, o.attempts, s.id AS subscriber_id, s.email
       FROM email_outbox o LEFT JOIN subscribers s ON s.id = o.subscriber_id
       ORDER BY o.id LIMIT ?`
    )
    .bind(OUTBOX_BATCH)
    .all<{
      id: number;
      incident_ids: string;
      attempts: number;
      subscriber_id: string | null;
      email: string | null;
    }>();

  const incidents = new Map<string, Incident | null>();
  const incident = async (id: string) => {
    if (!incidents.has(id)) {
      incidents.set(id, await loadIncident(id));
    }
    return incidents.get(id) ?? null;
  };

  let sent = 0;
  for (const row of rows.results) {
    const done = db
      .prepare('DELETE FROM email_outbox WHERE id = ?')
      .bind(row.id);
    // Unsubscribed since it was queued: drop it.
    if (!(row.subscriber_id && row.email)) {
      await done.run();
      continue;
    }
    const list = (
      await Promise.all(
        (JSON.parse(row.incident_ids) as string[]).map((id) => incident(id))
      )
    ).filter((i): i is Incident => i !== null);
    if (list.length === 0) {
      await done.run();
      continue;
    }
    try {
      const unsubscribeUrl = `${mail.site}/unsubscribe?id=${row.subscriber_id}&token=${await unsubscribeToken(mail.key, row.subscriber_id)}`;
      await mail.email.send({
        from: mail.from,
        to: row.email,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        ...incidentEmail(list, mail.site, unsubscribeUrl),
      });
      await done.run();
      sent++;
    } catch (error) {
      console.error('Status email failed', row.id, error);
      await (row.attempts + 1 >= OUTBOX_MAX_ATTEMPTS
        ? done
        : db
            .prepare(
              'UPDATE email_outbox SET attempts = attempts + 1 WHERE id = ?'
            )
            .bind(row.id)
      ).run();
    }
  }
  return sent;
}

/** One email for one or more incidents of the same round. */
export function incidentEmail(
  incidents: Incident[],
  site: string,
  unsubscribeUrl: string
): { subject: string; text: string; html: string } {
  const describe = (incident: Incident) => {
    const status = STATUS_LABEL[incident.status];
    const affected = incident.monitors
      .map((id) => monitorById.get(id)?.name ?? id)
      .join(', ');
    return {
      status,
      affected,
      url: `${site}/incidents/${encodeURIComponent(incident.id)}`,
      message: incident.updates[0]?.message ?? '',
    };
  };
  const first = incidents[0] as Incident;
  const subject =
    incidents.length === 1
      ? `[${STATUS_LABEL[first.status]}] ${first.title}`
      : `FlarePanel status: ${incidents.length} updates`;
  const text = [
    ...incidents.flatMap((incident) => {
      const d = describe(incident);
      return [
        incident.title,
        `Status: ${d.status}${d.affected ? ` · Affects: ${d.affected}` : ''}`,
        '',
        d.message,
        '',
        `Details: ${d.url}`,
        '',
      ];
    }),
    `Stop these emails: ${unsubscribeUrl}`,
  ].join('\n');
  const html = emailHtml(
    incidents.length === 1 ? first.title : subject,
    incidents
      .map((incident) => {
        const d = describe(incident);
        return `${incidents.length > 1 ? `<h2 style="margin:18px 0 6px;color:#f9fafe;font-size:16px">${escapeHtml(incident.title)}</h2>` : ''}<p style="color:#a1a1a5;margin:0 0 12px">${escapeHtml(d.status)}${d.affected ? ` · ${escapeHtml(d.affected)}` : ''}</p>
<p>${escapeHtml(d.message)}</p>
<p><a href="${d.url}" style="color:#f9fafe">See it on the status page</a></p>`;
      })
      .join(''),
    unsubscribeUrl
  );
  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function emailHtml(title: string, body: string, unsubscribeUrl?: string) {
  return `<!doctype html><html><body style="margin:0;background:#0d0d10;padding:32px 16px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#d4d4d8;font-size:15px;line-height:1.6">
<div style="max-width:520px;margin:0 auto;background:#111114;border:1px solid #27272a;border-radius:14px;padding:28px">
<p style="margin:0 0 16px;color:#727276;font-size:13px">FlarePanel Status</p>
<h1 style="margin:0 0 14px;color:#f9fafe;font-size:20px;line-height:1.3">${escapeHtml(title)}</h1>
${body}
</div>
${unsubscribeUrl ? `<p style="max-width:520px;margin:16px auto 0;color:#727276;font-size:12px;text-align:center">You get this because you subscribed to FlarePanel status updates. <a href="${unsubscribeUrl}" style="color:#a1a1a5">Unsubscribe</a></p>` : ''}
</body></html>`;
}
