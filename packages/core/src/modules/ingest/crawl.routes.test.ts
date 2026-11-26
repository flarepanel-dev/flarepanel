// `POST /track/crawl`: secret-only, never an event, a bot hit or nothing.

import { beforeAll, beforeEach, expect, mock, test } from 'bun:test';
import { Elysia } from 'elysia';
import { stubAppDeps } from '../../../test/http-fixtures';
import type { ClientAuthResult } from '../../http/client-auth';
import { errorHandler } from '../../http/errors';
import type { IngestBackend } from './src/backend';

const CLIENT = {
  id: 'client-1',
  projectId: 'project-1',
  organizationId: 'organization-1',
  type: 'write' as const,
  secretVerified: true,
};
const GPTBOT_UA =
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)';
const SAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';

const authenticateClient = mock(
  (): Promise<ClientAuthResult> => Promise.resolve({ ok: true, client: CLIENT })
);
mock.module('../../http/client-auth', () => ({ authenticateClient }));

// The real detector, without its Redis-backed cache.
const detect = await import('./src/bots/detect');
const isBot = mock(async (ua: string) => detect.detectBot(ua));
mock.module('./src/bots/detect', () => ({ ...detect, isBot }));

const ingestTrack = mock(async () => ({ status: 'ok' as const }));
const isIngestionWoundDown = mock(async () => false);
const realService = { ...(await import('./ingest.service')) };
mock.module('./ingest.service', () => ({
  ...realService,
  ingestTrack,
  isIngestionWoundDown,
}));

let ingestRoutes: typeof import('./ingest.routes').ingestRoutes;
beforeAll(async () => {
  ({ ingestRoutes } = await import('./ingest.routes'));
});

const recordBot = mock(async (_bot: unknown) => undefined);

beforeEach(() => {
  authenticateClient.mockClear();
  authenticateClient.mockImplementation(() =>
    Promise.resolve({ ok: true, client: CLIENT })
  );
  isBot.mockClear();
  recordBot.mockClear();
  ingestTrack.mockClear();
  isIngestionWoundDown.mockClear();
  isIngestionWoundDown.mockResolvedValue(false);
});

function crawl(body: unknown) {
  const { deps } = stubAppDeps();
  deps.ingest = { recordBot } as unknown as IngestBackend;
  // The app's error handler answers a bad body with 400, as in production.
  const app = new Elysia()
    .use(errorHandler(deps, { production: true }))
    .use(ingestRoutes(deps));
  return app.handle(
    new Request('http://localhost/track/crawl', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'openpanel-client-id': '00000000-0000-4000-8000-000000000000',
        'openpanel-client-secret': 'sec_test',
      },
      body: JSON.stringify(body),
    })
  );
}

test('records a known AI crawler with its name, category and path', async () => {
  const response = await crawl({
    path: '/pricing',
    userAgent: GPTBOT_UA,
    host: 'example.com',
  });

  expect(response.status).toBe(202);
  expect(await response.json()).toEqual({
    bot: { name: 'GPTBot', type: 'AI Data Scraper' },
  });
  expect(authenticateClient).toHaveBeenCalledTimes(1);
  expect(recordBot).toHaveBeenCalledTimes(1);
  expect(recordBot.mock.calls[0]?.[0]).toMatchObject({
    name: 'GPTBot',
    type: 'AI Data Scraper',
    projectId: 'project-1',
    path: 'https://example.com/pricing',
  });
  expect(ingestTrack).not.toHaveBeenCalled();
});

test('ignores a human user agent and stores nothing', async () => {
  const response = await crawl({ path: '/', userAgent: SAFARI_UA });

  expect(response.status).toBe(202);
  expect(await response.json()).toEqual({ bot: null });
  expect(isBot).toHaveBeenCalledTimes(1);
  expect(recordBot).not.toHaveBeenCalled();
  expect(ingestTrack).not.toHaveBeenCalled();
});

test('refuses a caller that did not prove the client secret', async () => {
  authenticateClient.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      client: { ...CLIENT, secretVerified: false },
    })
  );

  const response = await crawl({ path: '/', userAgent: GPTBOT_UA });

  expect(response.status).toBe(401);
  expect(await response.text()).toContain('client-secret');
  expect(isBot).not.toHaveBeenCalled();
  expect(recordBot).not.toHaveBeenCalled();
});

test('refuses an unknown client', async () => {
  authenticateClient.mockImplementation(() =>
    Promise.resolve({
      ok: false,
      ingest: true,
      message: 'Ingestion: Invalid client id',
    })
  );

  const response = await crawl({ path: '/', userAgent: GPTBOT_UA });

  expect(response.status).toBe(401);
  expect(recordBot).not.toHaveBeenCalled();
});

test('rejects a body without a path or with an oversized user agent', async () => {
  const missingPath = await crawl({ userAgent: GPTBOT_UA });
  const longAgent = await crawl({ path: '/', userAgent: 'x'.repeat(5000) });

  expect(missingPath.status).toBe(400);
  expect(longAgent.status).toBe(400);
  expect(recordBot).not.toHaveBeenCalled();
});

test('stores nothing for a wound-down project', async () => {
  isIngestionWoundDown.mockResolvedValue(true);

  const response = await crawl({ path: '/', userAgent: GPTBOT_UA });

  expect(response.status).toBe(202);
  expect(await response.json()).toEqual({ blocked: true });
  expect(isIngestionWoundDown).toHaveBeenCalledTimes(1);
  expect(recordBot).not.toHaveBeenCalled();
});
