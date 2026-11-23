import { beforeEach, describe, expect, it, spyOn } from 'bun:test';
import {
  configurePlatformStores,
  createMemoryStores,
} from '@flarepanel/platform';
import { createConsoleLogger } from './logger';
import { isUptimeMinute, runUptimeCheck, type UptimeEnv } from './uptime';

spyOn(console, 'error').mockImplementation(() => undefined);
const logger = createConsoleLogger('fatal');

function env(options: { dbFails?: boolean } = {}) {
  const emails: { subject: string }[] = [];
  const value = {
    DB: {
      prepare: () => ({
        first: () =>
          options.dbFails
            ? Promise.reject(new Error('D1 unavailable'))
            : Promise.resolve({ 1: 1 }),
      }),
    },
    EVENTS_ARCHIVE: { head: () => Promise.resolve(null) },
    EMAIL: {
      send: (message: { subject: string }) => {
        emails.push(message);
        return Promise.resolve();
      },
    },
    OPS_ALERT_EMAIL: 'ops@example.com',
    UPTIME_URLS: 'https://dash.example/login, https://docs.example/',
  } as unknown as UptimeEnv;
  return { env: value, emails };
}

const fetchAnswering = (status: Record<string, number>) =>
  ((url: string) =>
    Promise.resolve(
      new Response(null, { status: status[url] ?? 200 })
    )) as unknown as typeof fetch;

describe('uptime check', () => {
  beforeEach(() => configurePlatformStores(createMemoryStores()));

  it('runs every fifth minute', () => {
    expect(isUptimeMinute(Date.parse('2026-11-23T10:05:00Z'))).toBe(true);
    expect(isUptimeMinute(Date.parse('2026-11-23T10:06:00Z'))).toBe(false);
  });

  it('passes when everything answers below 500', async () => {
    const { env: value, emails } = env();
    const failures = await runUptimeCheck(
      value,
      logger,
      fetchAnswering({ 'https://docs.example/': 404 })
    );
    expect(failures).toEqual([]);
    expect(emails).toHaveLength(0);
  });

  it('reports a 5xx site and a failing D1, one email per target and hour', async () => {
    const { env: value, emails } = env({ dbFails: true });
    const fetchImpl = fetchAnswering({ 'https://dash.example/login': 502 });
    const failures = await runUptimeCheck(value, logger, fetchImpl);
    expect(failures).toEqual([
      { target: 'D1', reason: 'D1 unavailable' },
      { target: 'https://dash.example/login', reason: 'HTTP 502' },
    ]);
    await runUptimeCheck(value, logger, fetchImpl);
    expect(emails.map((email) => email.subject)).toEqual([
      'FlarePanel: D1 is failing',
      'FlarePanel: https://dash.example/login is failing',
    ]);
  });
});
