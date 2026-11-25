import { describe, expect, it } from 'bun:test';
import { MONITORS } from './monitors';
import { renderStatusPage } from './render';
import { dayOf, type Incident, type Snapshot } from './store';
import { buildView, formatUptime } from './view';

const now = Date.parse('2026-11-25T12:00:00Z');
const today = dayOf(now);

function snapshot(over: Partial<Snapshot> = {}): Snapshot {
  return {
    now,
    daily: MONITORS.map((m) => ({
      monitor: m.id,
      day: today,
      checks: 720,
      down: 0,
      degraded: 0,
      latency_sum: 72_000,
    })),
    latest: MONITORS.map((m) => ({
      monitor: m.id,
      at: now - 30_000,
      state: 'up' as const,
      latency_ms: 100,
      error: null,
    })),
    hours: [],
    incidents: [],
    ...over,
  };
}

const incident = (over: Partial<Incident> = {}): Incident => ({
  id: 'i1',
  title: 'API is not responding',
  impact: 'major',
  status: 'investigating',
  monitors: ['api'],
  auto: true,
  startedAt: now - 10 * 60_000,
  resolvedAt: null,
  scheduledUntil: null,
  updates: [
    {
      at: now - 10 * 60_000,
      status: 'investigating',
      message: 'Looking into it.',
    },
  ],
  ...over,
});

describe('buildView', () => {
  it('is operational when every check passes', () => {
    const view = buildView(snapshot());
    expect(view.overall).toBe('operational');
    expect(view.monitors.every((m) => m.uptime === 100)).toBe(true);
    expect(view.monitors[0]?.bars).toHaveLength(90);
    expect(view.monitors[0]?.bars.at(-1)?.level).toBe('up');
    expect(view.monitors[0]?.bars[0]?.level).toBe('none');
  });

  it('is a partial outage when one service is down', () => {
    const latest = snapshot().latest.map((l) =>
      l.monitor === 'api'
        ? { ...l, state: 'down' as const, error: 'HTTP 503, expected 200' }
        : l
    );
    const view = buildView(snapshot({ latest }));
    expect(view.overall).toBe('partial');
    expect(view.monitors.find((m) => m.monitor.id === 'api')?.lastError).toBe(
      'HTTP 503, expected 200'
    );
  });

  it('is a major outage when half the services are down', () => {
    const latest = snapshot().latest.map((l, i) =>
      i < 3 ? { ...l, state: 'down' as const } : l
    );
    expect(buildView(snapshot({ latest })).overall).toBe('major');
  });

  it('shows no data rather than an old state', () => {
    const latest = snapshot().latest.map((l) => ({
      ...l,
      at: now - 20 * 60_000,
    }));
    expect(buildView(snapshot({ latest })).monitors[0]?.state).toBe('unknown');
  });

  it('colours a day with downtime and counts uptime', () => {
    const daily = snapshot().daily.map((d) =>
      d.monitor === 'api' ? { ...d, down: 36 } : d
    );
    const api = buildView(snapshot({ daily })).monitors.find(
      (m) => m.monitor.id === 'api'
    );
    expect(api?.bars.at(-1)?.level).toBe('major');
    expect(formatUptime(api?.uptime ?? null)).toBe('95.000%');
  });

  it('puts an open incident on top and future maintenance aside', () => {
    const planned = incident({
      id: 'm1',
      impact: 'maintenance',
      status: 'scheduled',
      startedAt: now + 3_600_000,
      monitors: [],
    });
    const view = buildView(snapshot({ incidents: [incident(), planned] }));
    expect(view.active.map((i) => i.id)).toEqual(['i1']);
    expect(view.scheduled.map((i) => i.id)).toEqual(['m1']);
    expect(view.overall).toBe('partial');
  });
});

describe('renderStatusPage', () => {
  it('escapes incident text', () => {
    const html = renderStatusPage(
      buildView(
        snapshot({
          incidents: [
            incident({
              title: '<script>alert(1)</script>',
              updates: [
                { at: now, status: 'investigating', message: '"><img src=x>' },
              ],
            }),
          ],
        })
      )
    );
    expect(html).not.toContain('<script>alert(1)');
    expect(html).not.toContain('<img src=x>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('shows every service with 90 day bars', () => {
    const html = renderStatusPage(buildView(snapshot()));
    for (const m of MONITORS) {
      expect(html).toContain(m.name);
    }
    expect(html.match(/data-tip=/g)?.length).toBe(90 * MONITORS.length);
    expect(html).toContain('All systems operational');
  });
});
