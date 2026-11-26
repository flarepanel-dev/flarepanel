// Email updates for status.flarepanel.dev: double opt-in subscriptions, per
// service if wanted, and one email per incident update to confirmed
// subscribers. Every email carries a one-click unsubscribe link.

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

const HOUR = 60 * 60 * 1000;
/** Subscribe attempts allowed per client address and hour. */
export const ATTEMPTS_PER_HOUR = 5;
/** A pending address gets at most one confirmation email per hour. */
export const RESEND_AFTER_MS = HOUR;
/** Confirmation emails one unconfirmed address can ever receive. */
export const MAX_CONFIRMATIONS = 3;
/** Upper bound of emails one incident update sends. */
export const MAX_RECIPIENTS = 1000;

const EMAIL_PATTERN = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const email = raw.trim().toLowerCase();
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
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

export type SubscribeResult =
  | 'sent'
  | 'invalid'
  | 'rate-limited'
  | 'unavailable';

/**
 * Starts a subscription and emails the confirmation link. The answer never
 * tells whether an address is already subscribed ("sent" either way), so the
 * form cannot be used to look up subscribers.
 */
export async function subscribe(
  db: D1Database,
  email: EmailSender | undefined,
  input: { email: unknown; monitors: string[]; clientIp: string },
  site: string,
  from: string,
  now: number
): Promise<SubscribeResult> {
  if (!email) {
    return 'unavailable';
  }
  const address = normalizeEmail(input.email);
  if (!address) {
    return 'invalid';
  }
  const ipHash = await sha256(`status-subscribe:${input.clientIp}`);
  const attempts = await db
    .prepare(
      'SELECT COUNT(*) AS n FROM subscribe_attempts WHERE ip_hash = ? AND at > ?'
    )
    .bind(ipHash, now - HOUR)
    .first<{ n: number }>();
  if ((attempts?.n ?? 0) >= ATTEMPTS_PER_HOUR) {
    return 'rate-limited';
  }
  await db
    .prepare('INSERT INTO subscribe_attempts (ip_hash, at) VALUES (?, ?)')
    .bind(ipHash, now)
    .run();

  const monitors = input.monitors.filter((id) => monitorById.has(id));
  const monitorsJson = monitors.length ? JSON.stringify(monitors) : null;
  const existing = await db
    .prepare(
      'SELECT id, confirmed_at, last_sent_at, sends FROM subscribers WHERE email = ?'
    )
    .bind(address)
    .first<{
      id: string;
      confirmed_at: number | null;
      last_sent_at: number | null;
      sends: number;
    }>();

  if (existing?.confirmed_at) {
    // Already confirmed: nothing to send. Same answer as a new address.
    return 'sent';
  }
  if (existing?.last_sent_at && now - existing.last_sent_at < RESEND_AFTER_MS) {
    return 'sent';
  }
  // However many addresses an attacker rotates through, one inbox gets at
  // most this many confirmation emails.
  if ((existing?.sends ?? 0) >= MAX_CONFIRMATIONS) {
    return 'sent';
  }

  const token = newToken();
  const tokenHash = await sha256(token);
  if (existing) {
    await db
      .prepare(
        'UPDATE subscribers SET token_hash = ?, monitors = ?, last_sent_at = ?, sends = sends + 1 WHERE id = ?'
      )
      .bind(tokenHash, monitorsJson, now, existing.id)
      .run();
  } else {
    await db
      .prepare(
        'INSERT INTO subscribers (id, email, token_hash, monitors, created_at, last_sent_at, sends) VALUES (?, ?, ?, ?, ?, ?, 1)'
      )
      .bind(crypto.randomUUID(), address, tokenHash, monitorsJson, now, now)
      .run();
  }

  const confirmUrl = `${site}/subscribe/confirm?token=${token}`;
  const scope = monitors.length
    ? monitors.map((id) => monitorById.get(id)?.name ?? id).join(', ')
    : 'all FlarePanel services';
  await email.send({
    from,
    to: address,
    subject: 'Confirm your FlarePanel status updates',
    text: [
      `Confirm that you want emails when an incident affects ${scope}:`,
      '',
      confirmUrl,
      '',
      'If you did not ask for this, ignore this email and nothing happens.',
    ].join('\n'),
    html: emailHtml(
      'Confirm your status updates',
      `<p>Confirm that you want an email when an incident or maintenance affects <strong>${escapeHtml(scope)}</strong>.</p>
<p><a href="${confirmUrl}" style="display:inline-block;background:#f9fafe;color:#0d0d10;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600">Confirm subscription</a></p>
<p style="color:#727276">If you did not ask for this, ignore this email and nothing happens.</p>`
    ),
  });
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

export async function unsubscribe(
  db: D1Database,
  key: string,
  subscriberId: string,
  token: string
): Promise<boolean> {
  if (!(/^[0-9a-f-]{36}$/.test(subscriberId) && /^[0-9a-f]{64}$/.test(token))) {
    return false;
  }
  if (!sameText(await unsubscribeToken(key, subscriberId), token)) {
    return false;
  }
  const result = await db
    .prepare('DELETE FROM subscribers WHERE id = ?')
    .bind(subscriberId)
    .run();
  return result.meta.changes > 0;
}

export type UpdateKind = 'opened' | 'updated' | 'resolved';

/** Emails confirmed subscribers about an incident update. */
export async function notifySubscribers(
  db: D1Database,
  email: EmailSender | undefined,
  key: string | undefined,
  incident: Incident,
  site: string,
  from: string
): Promise<number> {
  if (!(email && key)) {
    return 0;
  }
  const rows = await db
    .prepare(
      'SELECT id, email, monitors FROM subscribers WHERE confirmed_at IS NOT NULL LIMIT ?'
    )
    .bind(MAX_RECIPIENTS)
    .all<{ id: string; email: string; monitors: string | null }>();
  const recipients = rows.results.filter((row) => {
    if (!row.monitors || incident.monitors.length === 0) {
      return true;
    }
    const wanted = JSON.parse(row.monitors) as string[];
    return incident.monitors.some((m) => wanted.includes(m));
  });

  const latest = incident.updates[0];
  const status = STATUS_LABEL[incident.status];
  const url = `${site}/incidents/${encodeURIComponent(incident.id)}`;
  const affected = incident.monitors
    .map((id) => monitorById.get(id)?.name ?? id)
    .join(', ');
  let sent = 0;
  for (const row of recipients) {
    const token = await unsubscribeToken(key, row.id);
    const unsubscribeUrl = `${site}/unsubscribe?id=${row.id}&token=${token}`;
    try {
      await email.send({
        from,
        to: row.email,
        subject: `[${status}] ${incident.title}`,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        text: [
          `${incident.title}`,
          `Status: ${status}${affected ? ` · Affects: ${affected}` : ''}`,
          '',
          latest?.message ?? '',
          '',
          `Details: ${url}`,
          '',
          `Stop these emails: ${unsubscribeUrl}`,
        ].join('\n'),
        html: emailHtml(
          incident.title,
          `<p style="color:#a1a1a5;margin:0 0 12px">${escapeHtml(status)}${affected ? ` · ${escapeHtml(affected)}` : ''}</p>
<p>${escapeHtml(latest?.message ?? '')}</p>
<p><a href="${url}" style="color:#f9fafe">See the incident on the status page</a></p>`,
          unsubscribeUrl
        ),
      });
      sent++;
    } catch {
      // One failing address must not stop the others.
    }
  }
  return sent;
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
