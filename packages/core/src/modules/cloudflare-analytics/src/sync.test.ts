import { describe, expect, it } from 'bun:test';
import {
  fakeCloudflare,
  groupsResponse,
} from '../../../../test/cloudflare-api-fixture';
import type {
  BotImportBatch,
  BotImportResult,
} from '../../ingest/cloudflare/bot-store';
import type { CrawlerGroup } from './crawler-query';
import {
  aggregateGroups,
  HOUR_MS,
  runCloudflareSync,
  SAMPLES_PER_SYNC,
  syncSpan,
} from './sync';

const TOKEN = 'cf-test-token-0123456789abcdef';
const ZONE = '0123456789abcdef0123456789abcdef';
const NOW = Date.parse('2026-11-27T12:30:00Z');
const LIMITS = { maxDuration: null, notOlderThan: null, maxPageSize: null };
const GPTBOT_UA =
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)';
const CHATGPT_UA =
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot';

const group = (overrides: Partial<CrawlerGroup>): CrawlerGroup => ({
  count: 1,
  hour: '2026-11-27T10:00:00Z',
  userAgent: GPTBOT_UA,
  host: 'example.com',
  path: '/docs',
  status: 200,
  statusClass: null,
  ...overrides,
});

function recorder() {
  const batches: BotImportBatch[] = [];
  const cursors: string[] = [];
  return {
    batches,
    cursors,
    write: async (batch: BotImportBatch): Promise<BotImportResult> => {
      batches.push(batch);
      const hits = batch.rows.reduce((sum, row) => sum + row.hits, 0);
      return {
        hours: new Set(batch.rows.map((row) => row.hour)).size,
        rows: batch.rows.length,
        hits,
        skippedHours: 0,
        cappedHours: 0,
      };
    },
    saveCursor: async (through: Date) => {
      cursors.push(through.toISOString());
    },
  };
}

describe('syncSpan', () => {
  it('reads 7 days back on the first sync, up to the last hour 15 minutes old', () => {
    const span = syncSpan(null, NOW, LIMITS);
    expect(new Date(span.to).toISOString()).toBe('2026-11-27T12:00:00.000Z');
    expect(new Date(span.from).toISOString()).toBe('2026-11-20T12:00:00.000Z');
    expect(span.step).toBe(24 * HOUR_MS);
    // At 12:10 the 11:00-12:00 hour is too fresh.
    expect(
      new Date(
        syncSpan(null, Date.parse('2026-11-27T12:10:00Z'), LIMITS).to
      ).toISOString()
    ).toBe('2026-11-27T11:00:00.000Z');
  });

  it('continues from the cursor, never further back than 30 days or the zone allows', () => {
    expect(
      new Date(
        syncSpan(new Date('2026-11-27T09:00:00Z'), NOW, LIMITS).from
      ).toISOString()
    ).toBe('2026-11-27T09:00:00.000Z');
    expect(
      new Date(
        syncSpan(new Date('2026-09-01T00:00:00Z'), NOW, LIMITS).from
      ).toISOString()
    ).toBe('2026-10-28T12:00:00.000Z');
    const short = syncSpan(new Date('2026-11-01T00:00:00Z'), NOW, {
      maxDuration: 6 * 3600,
      notOlderThan: 3 * 86_400,
      maxPageSize: null,
    });
    expect(new Date(short.from).toISOString()).toBe('2026-11-24T14:00:00.000Z');
    expect(short.step).toBe(6 * HOUR_MS);
  });
});

describe('aggregateGroups', () => {
  it('keeps known bots on selected hosts, one row per hour, bot and path', () => {
    const { rows, samples } = aggregateGroups(
      [
        group({ count: 10 }),
        // Another GPTBot version and status on the same page and hour.
        group({
          count: 3,
          userAgent: GPTBOT_UA.replace('1.2', '1.1'),
          status: 404,
          path: '/docs?ref=x',
        }),
        group({
          count: 4,
          userAgent: CHATGPT_UA,
          statusClass: '3xx',
          status: null,
        }),
        // Not a bot the detector knows.
        group({ count: 50, userAgent: 'Mozilla/5.0 (Macintosh) Safari/605.1' }),
        // Another host in the zone.
        group({ count: 9, host: 'staging.example.com' }),
      ],
      { hostnames: ['example.com'], projectId: 'p1', samples: 1 }
    );
    const hour = Date.parse('2026-11-27T10:00:00Z') / HOUR_MS;
    expect(rows).toEqual([
      {
        hour,
        name: 'GPTBot',
        type: 'AI Data Scraper',
        path: '/docs',
        hits: 13,
        status: { '2xx': 10, '3xx': 0, '4xx': 3, '5xx': 0 },
      },
      {
        hour,
        name: 'ChatGPT-User',
        type: 'AI Assistant',
        path: '/docs',
        hits: 4,
        status: { '2xx': 0, '3xx': 4, '4xx': 0, '5xx': 0 },
      },
    ]);
    expect(samples).toEqual([
      {
        id: expect.stringMatching(/^cloudflare:\d+:[a-f0-9]{16}$/),
        name: 'GPTBot',
        type: 'AI Data Scraper',
        project_id: 'p1',
        path: 'https://example.com/docs',
        created_at: '2026-11-27T10:30:00.000Z',
        status: 200,
        source: 'cloudflare',
      },
    ]);
  });

  it('keeps every host when no hostname is selected', () => {
    const { rows } = aggregateGroups([group({ host: 'docs.example.com' })], {
      hostnames: [],
      projectId: 'p1',
      samples: 0,
    });
    expect(rows).toHaveLength(1);
  });
});

describe('runCloudflareSync', () => {
  it('writes one batch per day window and moves the cursor after each', async () => {
    const cf = fakeCloudflare((request) =>
      groupsResponse(
        request.query?.includes('datetime_geq: "2026-11-26T12:00:00.000Z"')
          ? [
              {
                count: 7,
                dimensions: {
                  datetimeHour: '2026-11-26T15:00:00Z',
                  userAgent: GPTBOT_UA,
                  clientRequestHTTPHost: 'example.com',
                  clientRequestPath: '/pricing',
                  edgeResponseStatus: 200,
                },
              },
            ]
          : []
      )
    );
    const sink = recorder();
    const outcome = await runCloudflareSync({
      token: TOKEN,
      zoneId: ZONE,
      hostnames: ['example.com'],
      syncedThrough: new Date('2026-11-25T12:00:00Z'),
      now: NOW,
      limits: LIMITS,
      projectId: 'p1',
      monthlyCap: 100_000,
      write: sink.write,
      saveCursor: sink.saveCursor,
      fetcher: cf.fetcher,
      patternChunks: [['%GPTBot%'], ['%ChatGPT-User%']],
    });
    expect(sink.cursors).toEqual([
      '2026-11-26T12:00:00.000Z',
      '2026-11-27T12:00:00.000Z',
    ]);
    expect(sink.batches.map((batch) => [batch.fromHour, batch.toHour])).toEqual(
      [
        [
          Date.parse('2026-11-25T12:00:00Z') / HOUR_MS,
          Date.parse('2026-11-26T12:00:00Z') / HOUR_MS,
        ],
        [
          Date.parse('2026-11-26T12:00:00Z') / HOUR_MS,
          Date.parse('2026-11-27T12:00:00Z') / HOUR_MS,
        ],
      ]
    );
    // A group two chunks both return counts once.
    expect(sink.batches[1]?.rows).toEqual([
      expect.objectContaining({ name: 'GPTBot', path: '/pricing', hits: 7 }),
    ]);
    expect(sink.batches.every((batch) => batch.source === 'cloudflare')).toBe(
      true
    );
    expect(sink.batches[0]?.monthlyCap).toBe(100_000);
    expect(outcome).toMatchObject({ hits: 7, queries: 4, complete: true });
    // Two windows times two pattern chunks.
    expect(cf.requests).toHaveLength(4);
  });

  it('does nothing when the cursor is already at the last full hour', async () => {
    const cf = fakeCloudflare(() => groupsResponse([]));
    const sink = recorder();
    const outcome = await runCloudflareSync({
      token: TOKEN,
      zoneId: ZONE,
      hostnames: [],
      syncedThrough: new Date('2026-11-27T12:00:00Z'),
      now: NOW,
      limits: LIMITS,
      projectId: 'p1',
      monthlyCap: null,
      write: sink.write,
      saveCursor: sink.saveCursor,
      fetcher: cf.fetcher,
    });
    expect(cf.requests).toHaveLength(0);
    expect(sink.batches).toHaveLength(0);
    expect(outcome.hits).toBe(0);
  });

  it('splits a window that hit the row limit', async () => {
    const cf = fakeCloudflare((request) => {
      const wide = request.query?.includes(
        'datetime_geq: "2026-11-27T08:00:00.000Z", datetime_lt: "2026-11-27T12:00:00.000Z"'
      );
      return groupsResponse(
        wide
          ? [1, 2].map((count) => ({
              count,
              dimensions: {
                datetimeHour: '2026-11-27T08:00:00Z',
                userAgent: `GPTBot/${count}`,
                clientRequestPath: '/',
              },
            }))
          : [
              {
                count: 1,
                dimensions: {
                  datetimeHour: '2026-11-27T09:00:00Z',
                  userAgent: 'GPTBot/1',
                  clientRequestPath: '/',
                },
              },
            ]
      );
    });
    const sink = recorder();
    const outcome = await runCloudflareSync({
      token: TOKEN,
      zoneId: ZONE,
      hostnames: [],
      syncedThrough: new Date('2026-11-27T08:00:00Z'),
      now: NOW,
      limits: { ...LIMITS, maxPageSize: 2 },
      projectId: 'p1',
      monthlyCap: null,
      write: sink.write,
      saveCursor: sink.saveCursor,
      fetcher: cf.fetcher,
      patternChunks: [['%GPTBot%']],
    });
    // The 4-hour window came back full: two 2-hour halves instead.
    expect(outcome.queries).toBe(3);
    expect(sink.batches).toHaveLength(1);
  });

  it('stops at the query budget and leaves the rest for the next sync', async () => {
    const cf = fakeCloudflare(() => groupsResponse([]));
    const sink = recorder();
    const outcome = await runCloudflareSync({
      token: TOKEN,
      zoneId: ZONE,
      hostnames: [],
      syncedThrough: null,
      now: NOW,
      limits: LIMITS,
      projectId: 'p1',
      monthlyCap: null,
      write: sink.write,
      saveCursor: sink.saveCursor,
      fetcher: cf.fetcher,
      patternChunks: [['%GPTBot%'], ['%ClaudeBot%']],
      maxQueries: 5,
    });
    expect(outcome.complete).toBe(false);
    expect(sink.cursors).toEqual([
      '2026-11-21T12:00:00.000Z',
      '2026-11-22T12:00:00.000Z',
    ]);
  });

  it('lists samples only from the last few windows', async () => {
    const cf = fakeCloudflare((request) => {
      const since = /datetime_geq: "([^"]+)"/.exec(request.query ?? '')?.[1];
      return groupsResponse([
        {
          count: 3,
          dimensions: {
            datetimeHour: since ?? '',
            userAgent: GPTBOT_UA,
            clientRequestPath: '/',
          },
        },
      ]);
    });
    const sink = recorder();
    await runCloudflareSync({
      token: TOKEN,
      zoneId: ZONE,
      hostnames: [],
      syncedThrough: null,
      now: NOW,
      limits: LIMITS,
      projectId: 'p1',
      monthlyCap: null,
      write: sink.write,
      saveCursor: sink.saveCursor,
      fetcher: cf.fetcher,
      patternChunks: [['%GPTBot%']],
    });
    expect(sink.batches).toHaveLength(7);
    expect(
      sink.batches.reduce((sum, batch) => sum + (batch.samples?.length ?? 0), 0)
    ).toBe(SAMPLES_PER_SYNC);
  });
});
