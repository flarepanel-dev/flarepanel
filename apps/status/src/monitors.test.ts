import { describe, expect, it } from 'bun:test';
import { MONITORS, type Monitor, runCheck } from './monitors';

const monitor: Monitor = {
  id: 'api',
  name: 'API',
  description: '',
  url: 'https://api.example.com/healthcheck',
  expect: [200],
  bodyOk: (text) => text.includes('"ready":true'),
};
const answer = (status: number, body = '') =>
  (async () => new Response(body, { status })) as unknown as typeof fetch;

describe('runCheck', () => {
  it('is up when the expected status and body come back', async () => {
    const result = await runCheck(monitor, answer(200, '{"ready":true}'));
    expect(result.state).toBe('up');
    expect(result.statusCode).toBe(200);
    expect(result.error).toBeNull();
  });

  it('is down on an unexpected status', async () => {
    const result = await runCheck(monitor, answer(503));
    expect(result.state).toBe('down');
    expect(result.error).toBe('HTTP 503, expected 200');
  });

  it('is down when the body says not ready', async () => {
    const result = await runCheck(monitor, answer(200, '{"ready":false}'));
    expect(result.state).toBe('down');
    expect(result.error).toBe('Unexpected answer');
  });

  it('is down when nothing answers', async () => {
    const failing = (async () => {
      throw new TypeError('network');
    }) as unknown as typeof fetch;
    const result = await runCheck(monitor, failing);
    expect(result).toMatchObject({
      state: 'down',
      latencyMs: null,
      error: 'Could not connect',
    });
  });

  it('never sends a body that could be stored as data', () => {
    for (const m of MONITORS) {
      expect(m.url.startsWith('https://')).toBe(true);
      if (m.body) {
        expect(['{}', '{"jsonrpc":"2.0","id":1,"method":"ping"}']).toContain(
          m.body
        );
      }
    }
  });
});
