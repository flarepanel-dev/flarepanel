import { describe, expect, it } from 'bun:test';
import { createHash } from 'node:crypto';
import { renderHistoryPage, SCRIPT, SCRIPT_HASH } from './render';
import type { Incident } from './store';
import {
  clientNetwork,
  incidentEmail,
  normalizeEmail,
  unsubscribe,
  unsubscribeToken,
} from './subscribers';

/** Just enough of D1 for a DELETE that reports how many rows it changed. */
function fakeDb(rowsDeleted: number) {
  const calls: unknown[][] = [];
  const db = {
    prepare: () => ({
      bind: (...args: unknown[]) => {
        calls.push(args);
        return { run: async () => ({ meta: { changes: rowsDeleted } }) };
      },
    }),
  } as unknown as D1Database;
  return { db, calls };
}

const ID = '3f2b8c1e-1d2a-4c55-9a7e-0b6f1e2d3c4b';

describe('email subscriptions', () => {
  it('accepts plausible addresses only', () => {
    expect(normalizeEmail('  Ada@Example.com ')).toBe('ada@example.com');
    expect(normalizeEmail('not-an-email')).toBeNull();
    expect(normalizeEmail('a@b')).toBeNull();
    expect(normalizeEmail('x@y.com<script>')).toBeNull();
    expect(normalizeEmail(42)).toBeNull();
  });

  it('gives every email the same unsubscribe link', async () => {
    const a = await unsubscribeToken('key', ID);
    expect(await unsubscribeToken('key', ID)).toBe(a);
    expect(await unsubscribeToken('other-key', ID)).not.toBe(a);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('unsubscribes only with the signed token', async () => {
    const good = await unsubscribeToken('key', ID);
    const ok = fakeDb(1);
    expect(await unsubscribe(ok.db, 'key', ID, good)).toBe('removed');
    expect(ok.calls).toEqual([[ID]]);

    const forged = fakeDb(1);
    expect(await unsubscribe(forged.db, 'key', ID, 'a'.repeat(64))).toBe(
      'invalid'
    );
    expect(forged.calls).toEqual([]);

    const otherId = fakeDb(1);
    expect(
      await unsubscribe(
        otherId.db,
        'key',
        '00000000-0000-4000-8000-000000000000',
        good
      )
    ).toBe('invalid');
    expect(otherId.calls).toEqual([]);
  });
});

describe('rate-limit networks', () => {
  it('keys IPv4 by address and IPv6 by its /64', () => {
    expect(clientNetwork('203.0.113.9')).toBe('203.0.113.9');
    expect(clientNetwork('2001:db8:aa:1::5')).toBe('2001:db8:aa:1::/64');
    expect(clientNetwork('2001:db8:aa:1:ffff:1:2:3')).toBe(
      '2001:db8:aa:1::/64'
    );
    expect(clientNetwork('2001:0db8:00aa:0001::9')).toBe('2001:db8:aa:1::/64');
  });

  it('gives a not-found unsubscribe its own answer', async () => {
    const good = await unsubscribeToken('key', ID);
    expect(await unsubscribe(fakeDb(0).db, 'key', ID, good)).toBe('not-found');
  });
});

describe('incident emails', () => {
  const incident = (id: string, title: string): Incident => ({
    id,
    title,
    impact: 'major',
    status: 'investigating',
    monitors: ['api'],
    auto: true,
    startedAt: 0,
    resolvedAt: null,
    scheduledUntil: null,
    updates: [{ at: 0, status: 'investigating', message: '<b>looking</b>' }],
  });

  it('puts one round of changes into one email', () => {
    const one = incidentEmail(
      [incident('a', 'API down')],
      'https://s',
      'https://u'
    );
    expect(one.subject).toBe('[Investigating] API down');
    const two = incidentEmail(
      [incident('a', 'API down'), incident('b', 'Docs down')],
      'https://s',
      'https://u'
    );
    expect(two.subject).toBe('FlarePanel status: 2 updates');
    expect(two.text).toContain('API down');
    expect(two.text).toContain('Docs down');
  });

  it('escapes incident text in the HTML', () => {
    const mail = incidentEmail(
      [incident('a', '<script>x</script>')],
      'https://s',
      'https://u'
    );
    expect(mail.html).not.toContain('<script>x');
    expect(mail.html).not.toContain('<b>looking</b>');
  });
});

describe('page script', () => {
  it('matches the hash the CSP allows', () => {
    const hash = createHash('sha256').update(SCRIPT).digest('base64');
    expect(SCRIPT_HASH).toBe(`sha256-${hash}`);
  });
});

describe('history tabs', () => {
  const base: Incident = {
    id: 'a',
    title: 'API is not responding',
    impact: 'major',
    status: 'resolved',
    monitors: ['api'],
    auto: true,
    startedAt: Date.parse('2026-11-20T10:00:00Z'),
    resolvedAt: Date.parse('2026-11-20T10:05:00Z'),
    scheduledUntil: null,
    updates: [],
  };
  const maintenance: Incident = {
    ...base,
    id: 'b',
    title: 'Database upgrade',
    impact: 'maintenance',
    status: 'completed',
  };
  const now = Date.parse('2026-11-26T00:00:00Z');

  it('splits incidents from maintenance', () => {
    const incidents = renderHistoryPage([base, maintenance], now, 'incidents');
    expect(incidents).toContain('API is not responding');
    expect(incidents).not.toContain('Database upgrade');
    const planned = renderHistoryPage([base, maintenance], now, 'maintenance');
    expect(planned).toContain('Database upgrade');
    expect(planned).not.toContain('API is not responding');
  });
});
