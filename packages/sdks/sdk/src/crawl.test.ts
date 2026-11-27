import { describe, expect, mock, test } from 'bun:test';
import {
  captureCrawl,
  crawlHitFromRequest,
  looksLikeBot,
  trackCrawl,
  type WaitUntil,
  withCrawlCapture,
} from './crawl';

const GPTBOT_UA =
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.3; +https://openai.com/gptbot';
const SAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const OPTIONS = {
  clientId: 'client-1',
  clientSecret: 'sec_test',
  apiUrl: 'https://api.example.com/',
};

function botRequest(
  path = '/pricing',
  init: { method?: string; userAgent?: string; cf?: unknown } = {}
) {
  const request = new Request(`https://example.com${path}?utm=1`, {
    method: init.method ?? 'GET',
    headers: {
      'user-agent': init.userAgent ?? GPTBOT_UA,
      referer: 'https://chatgpt.com/',
    },
  });
  if (init.cf) {
    Object.defineProperty(request, 'cf', { value: init.cf });
  }
  return request;
}

function recordingFetch(answer: unknown = { bot: null, capped: false }) {
  return mock(
    async (_url: string, _init: RequestInit) =>
      new Response(JSON.stringify(answer), { status: 202 })
  );
}

function waitUntil() {
  const promises: Promise<unknown>[] = [];
  return {
    ctx: { waitUntil: (promise: Promise<unknown>) => promises.push(promise) },
    settled: () => Promise.all(promises),
    count: () => promises.length,
  };
}

describe('crawlHitFromRequest', () => {
  test('takes the path, host, user agent, referrer and status', () => {
    expect(crawlHitFromRequest(botRequest(), { status: 404 })).toEqual({
      path: '/pricing',
      host: 'example.com',
      userAgent: GPTBOT_UA,
      referrer: 'https://chatgpt.com/',
      status: 404,
    });
  });

  test('passes on what Cloudflare verified, only when present', () => {
    expect(
      crawlHitFromRequest(
        botRequest('/', { cf: { verifiedBotCategory: 'AI Crawler' } })
      )
    ).toMatchObject({ verified: true, verifiedCategory: 'AI Crawler' });
    expect(
      crawlHitFromRequest(
        botRequest('/', { cf: { botManagement: { verifiedBot: false } } })
      )
    ).toMatchObject({ verified: false });
    const plain = crawlHitFromRequest(botRequest('/', { cf: {} }));
    expect(plain && 'verified' in plain).toBe(false);
  });

  test('skips humans, assets and writes', () => {
    expect(crawlHitFromRequest(botRequest('/', { userAgent: SAFARI_UA }))).toBe(
      null
    );
    expect(crawlHitFromRequest(botRequest('/app.css'))).toBe(null);
    expect(crawlHitFromRequest(botRequest('/', { method: 'POST' }))).toBe(null);
    // robots.txt, llms.txt and markdown are what AI crawlers read.
    expect(crawlHitFromRequest(botRequest('/llms.txt'))?.path).toBe(
      '/llms.txt'
    );
  });

  test('recognises the usual AI user agents', () => {
    expect(looksLikeBot('Mozilla/5.0; compatible; ChatGPT-User/1.0')).toBe(
      true
    );
    expect(looksLikeBot('Claude-User/1.0')).toBe(true);
    expect(looksLikeBot(SAFARI_UA)).toBe(false);
    expect(looksLikeBot(undefined)).toBe(false);
  });
});

describe('trackCrawl', () => {
  test('posts the hit with the client id and secret', async () => {
    const send = recordingFetch({
      bot: { name: 'GPTBot', type: 'AI Data Scraper' },
      capped: false,
    });
    const result = await trackCrawl(
      { ...OPTIONS, fetch: send as unknown as typeof fetch },
      { path: '/x', userAgent: GPTBOT_UA, status: 200 }
    );

    expect(result).toEqual({
      bot: { name: 'GPTBot', type: 'AI Data Scraper' },
      capped: false,
    });
    expect(send).toHaveBeenCalledTimes(1);
    const [url, init] = send.mock.calls[0] ?? [];
    expect(url).toBe('https://api.example.com/track/crawl');
    expect(init?.headers).toMatchObject({
      'openpanel-client-id': 'client-1',
      'openpanel-client-secret': 'sec_test',
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      path: '/x',
      userAgent: GPTBOT_UA,
      status: 200,
    });
  });

  test('never throws', async () => {
    const failing = mock(async () => {
      throw new Error('offline');
    });
    expect(
      await trackCrawl(
        { ...OPTIONS, fetch: failing as unknown as typeof fetch },
        { path: '/', userAgent: GPTBOT_UA }
      )
    ).toBe(null);
    expect(failing).toHaveBeenCalledTimes(1);
  });
});

describe('captureCrawl', () => {
  test('reports a bot in the background and nothing for a human', async () => {
    const send = recordingFetch();
    const background = waitUntil();
    const options = { ...OPTIONS, fetch: send as unknown as typeof fetch };

    captureCrawl(
      botRequest('/a', { userAgent: SAFARI_UA }),
      background.ctx,
      options
    );
    captureCrawl(botRequest('/b'), background.ctx, options);
    await background.settled();

    expect(background.count()).toBe(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(send.mock.calls[0]?.[1].body)).path).toBe('/b');
  });
});

describe('withCrawlCapture', () => {
  test('returns the response untouched and reports it with its status', async () => {
    const send = recordingFetch();
    const realFetch = globalThis.fetch;
    globalThis.fetch = send as unknown as typeof fetch;
    try {
      const worker = withCrawlCapture({
        fetch: (_request: Request, _env: object, _ctx: WaitUntil) =>
          new Response('missing', { status: 404 }),
      });
      const background = waitUntil();
      const env = {
        FLAREPANEL_CLIENT_ID: 'client-1',
        FLAREPANEL_CLIENT_SECRET: 'sec_test',
      };

      const response = await worker.fetch?.(
        botRequest('/gone'),
        env,
        background.ctx
      );
      await background.settled();

      expect(response?.status).toBe(404);
      expect(await response?.text()).toBe('missing');
      expect(send).toHaveBeenCalledTimes(1);
      const [url, init] = send.mock.calls[0] ?? [];
      expect(url).toBe('https://api.flarepanel.dev/track/crawl');
      expect(JSON.parse(String(init?.body))).toMatchObject({
        path: '/gone',
        status: 404,
      });
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  test('sends nothing without credentials', async () => {
    const send = recordingFetch();
    const realFetch = globalThis.fetch;
    globalThis.fetch = send as unknown as typeof fetch;
    try {
      const worker = withCrawlCapture({
        fetch: (_request: Request, _env: object, _ctx: WaitUntil) =>
          new Response('ok'),
      });
      const background = waitUntil();
      await worker.fetch?.(botRequest('/'), {}, background.ctx);
      expect(background.count()).toBe(0);
      expect(send).not.toHaveBeenCalled();
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});
