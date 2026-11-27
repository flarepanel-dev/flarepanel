/**
 * Tests for checkIngestBot — the bot filter run on ingestion.
 *
 * The key behaviour guarded here: requests authenticated with a client secret
 * (server-side SDKs) are never treated as bots, regardless of user agent. Bot
 * detection only applies to public/frontend (origin-authenticated) traffic.
 */

import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import type { BotMatch } from './bots/detect';

const isBot = mock(async (_ua: string): Promise<BotMatch | null> => null);
const recordBot = mock(
  async (_payload: unknown): Promise<{ capped: boolean } | undefined> =>
    undefined
);

let checkIngestBot: typeof import('../ingest.service').checkIngestBot;
let recordCrawlHit: typeof import('../ingest.service').recordCrawlHit;

// The bot row goes through the ingest backend, so a recording double stands
// in for it — nothing here reads a client.
const backend = { recordBot };

// Spread the real module and override by name: ingest.service re-exports
// `detectBot`, and a factory returning only the override makes it vanish
// under `--isolate`.
beforeAll(async () => {
  const detect = await import('./bots/detect');
  mock.module('./bots/detect', () => ({ ...detect, isBot }));
  ({ checkIngestBot, recordCrawlHit } = await import('../ingest.service'));
});

const baseRequest = {
  headers: { 'user-agent': 'Googlebot/2.1' },
  clientSecretAuth: false,
  projectId: 'proj-1',
  body: { type: 'track', payload: { properties: { path: '/home' } } },
};

beforeEach(() => {
  isBot.mockReset();
  recordBot.mockReset();
});

describe('checkIngestBot', () => {
  it('skips bot detection entirely for client-secret (server-side) traffic', async () => {
    const bot = await checkIngestBot(
      { ...baseRequest, clientSecretAuth: true },
      backend
    );

    expect(isBot).not.toHaveBeenCalled();
    expect(recordBot).not.toHaveBeenCalled();
    expect(bot).toBeNull();
  });

  it('records a bot event and reports the bot for public bot traffic', async () => {
    isBot.mockResolvedValue({ name: 'Googlebot', type: 'Search bot' });

    const bot = await checkIngestBot(baseRequest, backend);

    expect(isBot).toHaveBeenCalledWith('Googlebot/2.1');
    expect(recordBot).toHaveBeenCalledTimes(1);
    expect(recordBot.mock.calls[0]?.[0]).toMatchObject({
      name: 'Googlebot',
      type: 'Search bot',
      projectId: 'proj-1',
      path: '/home',
    });
    expect(bot).toEqual({ name: 'Googlebot', type: 'Search bot' });
  });

  it('passes legitimate public traffic through untouched', async () => {
    isBot.mockResolvedValue(null);

    const bot = await checkIngestBot(
      { ...baseRequest, headers: { 'user-agent': 'node' } },
      backend
    );

    expect(recordBot).not.toHaveBeenCalled();
    expect(bot).toBeNull();
  });
});

describe('recordCrawlHit', () => {
  const NOW = new Date('2026-11-24T10:00:00Z');
  const crawl = (payload: Parameters<typeof recordCrawlHit>[0]['payload']) =>
    recordCrawlHit({ projectId: 'proj-1', payload, now: NOW }, backend);

  it('records a known crawler with its category and path', async () => {
    isBot.mockResolvedValue({ name: 'GPTBot', type: 'AI Data Scraper' });

    const outcome = await crawl({
      path: '/pricing',
      userAgent: 'Mozilla/5.0; compatible; GPTBot/1.2',
    });

    expect(isBot).toHaveBeenCalledWith('Mozilla/5.0; compatible; GPTBot/1.2');
    expect(recordBot).toHaveBeenCalledTimes(1);
    expect(recordBot.mock.calls[0]?.[0]).toEqual({
      name: 'GPTBot',
      type: 'AI Data Scraper',
      projectId: 'proj-1',
      path: '/pricing',
      createdAt: NOW,
      status: undefined,
      verified: undefined,
      verifiedCategory: undefined,
    });
    expect(outcome).toEqual({
      bot: { name: 'GPTBot', type: 'AI Data Scraper' },
      capped: false,
    });
  });

  it('passes the status and the edge verification on', async () => {
    isBot.mockResolvedValue({ name: 'GPTBot', type: 'AI Data Scraper' });

    await crawl({
      path: '/gone',
      userAgent: 'GPTBot/1.2',
      status: 404,
      verifiedCategory: 'AI Crawler',
    });
    await crawl({ path: '/', userAgent: 'GPTBot/1.2', verified: false });

    expect(recordBot.mock.calls[0]?.[0]).toMatchObject({
      status: 404,
      verified: true,
      verifiedCategory: 'AI Crawler',
    });
    expect(recordBot.mock.calls[1]?.[0]).toMatchObject({ verified: false });
  });

  it('reports a hit the monthly allowance turned away', async () => {
    isBot.mockResolvedValue({ name: 'GPTBot', type: 'AI Data Scraper' });
    recordBot.mockResolvedValue({ capped: true });

    expect(await crawl({ path: '/', userAgent: 'GPTBot/1.2' })).toEqual({
      bot: { name: 'GPTBot', type: 'AI Data Scraper' },
      capped: true,
    });
  });

  it('prefixes the host, as the browser bot rows store full URLs', async () => {
    isBot.mockResolvedValue({ name: 'ClaudeBot', type: 'AI Data Scraper' });

    await crawl({ path: '/docs', userAgent: 'ClaudeBot', host: 'Example.com' });
    await crawl({
      path: 'https://a.io/x',
      userAgent: 'ClaudeBot',
      host: 'b.io',
    });
    await crawl({ path: '/y', userAgent: 'ClaudeBot', host: 'not a host/' });

    expect(
      recordBot.mock.calls.map((call) => (call[0] as { path: string }).path)
    ).toEqual(['https://example.com/docs', 'https://a.io/x', '/y']);
  });

  it('ignores a user agent that is not a known bot', async () => {
    isBot.mockResolvedValue(null);

    const outcome = await crawl({ path: '/', userAgent: 'Mozilla/5.0 Safari' });

    expect(isBot).toHaveBeenCalledTimes(1);
    expect(recordBot).not.toHaveBeenCalled();
    expect(outcome).toEqual({ bot: null, capped: false });
  });

  it('skips detection for an empty user agent', async () => {
    const outcome = await crawl({ path: '/', userAgent: '  ' });

    expect(isBot).not.toHaveBeenCalled();
    expect(recordBot).not.toHaveBeenCalled();
    expect(outcome.bot).toBeNull();
  });
});
