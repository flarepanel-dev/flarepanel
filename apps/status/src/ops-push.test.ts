import { describe, expect, it, spyOn } from 'bun:test';
import { incidentPush, sendOpsPush } from './ops-push';

const INCIDENT = {
  id: 'auto-api-1',
  title: 'API is not responding',
  impact: 'major' as const,
  startedAt: 1_000_000,
};
const SITE = 'https://status.example.com';

describe('operator push', () => {
  it('announces an opened incident as urgent, with its page', () => {
    const push = incidentPush(INCIDENT, 'opened', 1_000_000, SITE);
    expect(push.title).toBe('Down: API is not responding');
    expect(push.priority).toBe('urgent');
    expect(push.body).toContain(`${SITE}/incidents/auto-api-1`);
  });

  it('says how long a resolved incident lasted', () => {
    const push = incidentPush(
      INCIDENT,
      'resolved',
      1_000_000 + 7 * 60_000,
      SITE
    );
    expect(push.title).toBe('Recovered: API is not responding');
    expect(push.body).toContain('about 7 minutes');
    expect(push.priority).toBe('default');
  });

  it('sends nothing without a topic, and survives a failing server', async () => {
    const calls: string[] = [];
    const spy = spyOn(globalThis, 'fetch').mockImplementation(((
      url: string
    ) => {
      calls.push(url);
      return Promise.reject(new Error('unreachable'));
    }) as unknown as typeof fetch);
    const errors = spyOn(console, 'error').mockImplementation(() => undefined);
    const push = incidentPush(INCIDENT, 'opened', 1_000_000, SITE);
    await sendOpsPush({}, push);
    expect(calls).toHaveLength(0);
    await sendOpsPush({ OPS_ALERT_NTFY_URL: 'https://ntfy.example/t' }, push);
    expect(calls).toEqual(['https://ntfy.example/t']);
    spy.mockRestore();
    errors.mockRestore();
  });
});
