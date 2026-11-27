// The crawler report every FlarePanel site Worker sends (shared helper).

import { afterEach, describe, expect, mock, test } from 'bun:test';
import { reportCrawl } from '../../../tooling/workers/crawl-capture';

const ENV = {
  FLAREPANEL_CLIENT_ID: 'client-1',
  FLAREPANEL_CLIENT_SECRET: 'sec_test',
};
const GPTBOT_UA =
  'Mozilla/5.0; compatible; GPTBot/1.3; +https://openai.com/gptbot';
const realFetch = globalThis.fetch;

function capture() {
  const send = mock(
    async (_url: string, _init: RequestInit) => new Response('{}')
  );
  globalThis.fetch = send as unknown as typeof fetch;
  const pending: Promise<unknown>[] = [];
  return {
    send,
    ctx: { waitUntil: (promise: Promise<unknown>) => pending.push(promise) },
    settled: () => Promise.all(pending),
  };
}

function request(path: string, userAgent = GPTBOT_UA, cf?: unknown) {
  const req = new Request(`https://status.example.com${path}`, {
    headers: { 'user-agent': userAgent },
  });
  if (cf) {
    Object.defineProperty(req, 'cf', { value: cf });
  }
  return req;
}

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe('reportCrawl', () => {
  test('sends the status the bot was served and the edge verification', async () => {
    const { send, ctx, settled } = capture();
    reportCrawl(
      request('/incidents/x', GPTBOT_UA, { verifiedBotCategory: 'AI Crawler' }),
      new Response('gone', { status: 404 }),
      ENV,
      ctx
    );
    await settled();

    expect(send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(send.mock.calls[0]?.[1].body))).toEqual({
      path: '/incidents/x',
      host: 'status.example.com',
      userAgent: GPTBOT_UA,
      status: 404,
      verified: true,
      verifiedCategory: 'AI Crawler',
    });
  });

  test('leaves verification out when the edge says nothing', async () => {
    const { send, ctx, settled } = capture();
    reportCrawl(request('/'), new Response('ok'), ENV, ctx);
    await settled();
    const body = JSON.parse(String(send.mock.calls[0]?.[1].body));
    expect(body.status).toBe(200);
    expect('verified' in body).toBe(false);
  });

  test('sends nothing for people, assets or without credentials', async () => {
    const { send, ctx, settled } = capture();
    reportCrawl(
      request('/', 'Mozilla/5.0 (Macintosh) Safari/605.1.15'),
      new Response('ok'),
      ENV,
      ctx
    );
    reportCrawl(request('/app.css'), new Response('ok'), ENV, ctx);
    reportCrawl(request('/'), new Response('ok'), {}, ctx);
    await settled();
    expect(send).not.toHaveBeenCalled();
  });
});
