import { describe, expect, it } from 'bun:test';
import {
  fakeCloudflare,
  groupsResponse,
  jsonResponse,
} from '../../../../test/cloudflare-api-fixture';
import {
  type CrawlerWindow,
  crawlerFilter,
  crawlerQuery,
  FULL_MODE,
  graphqlLiteral,
  queryCrawlerWindow,
} from './crawler-query';

const TOKEN = 'cf-test-token-0123456789abcdef';
const WINDOW: CrawlerWindow = {
  zoneId: '0123456789abcdef0123456789abcdef',
  since: '2026-11-26T00:00:00.000Z',
  until: '2026-11-27T00:00:00.000Z',
  hostnames: ['example.com', 'www.example.com'],
  patterns: ['%GPTBot%', '%ClaudeBot%'],
  limit: 10_000,
};

const unknownField = (field: string) =>
  jsonResponse({
    data: null,
    errors: [{ message: `unknown field "${field}"` }],
  });

describe('the crawler query', () => {
  it('filters on time, eyeball traffic, hostnames and crawler user agents', () => {
    expect(crawlerFilter(WINDOW, FULL_MODE, null)).toEqual({
      AND: [
        {
          datetime_geq: '2026-11-26T00:00:00.000Z',
          datetime_lt: '2026-11-27T00:00:00.000Z',
          requestSource: 'eyeball',
        },
        { clientRequestHTTPHost_in: ['example.com', 'www.example.com'] },
        {
          OR: [
            { userAgent_like: '%GPTBot%' },
            { userAgent_like: '%ClaudeBot%' },
          ],
        },
      ],
    });
  });

  it('asks for hour, user agent, host, path and status, biggest groups first', () => {
    const query = crawlerQuery(WINDOW, FULL_MODE, null);
    expect(query).toContain(
      'zones(filter: {zoneTag: "0123456789abcdef0123456789abcdef"})'
    );
    expect(query).toContain('httpRequestsAdaptiveGroups(filter: {AND: [');
    expect(query).toContain('requestSource: "eyeball"');
    expect(query).toContain(
      'clientRequestHTTPHost_in: ["example.com", "www.example.com"]'
    );
    expect(query).toContain('{userAgent_like: "%GPTBot%"}');
    expect(query).toContain('limit: 10000, orderBy: [count_DESC]');
    const dimensions = query
      .slice(query.indexOf('dimensions {') + 'dimensions {'.length)
      .split('}')[0]
      ?.trim()
      .split(/\s+/);
    expect(dimensions).toEqual([
      'datetimeHour',
      'userAgent',
      'clientRequestHTTPHost',
      'clientRequestPath',
      'edgeResponseStatus',
    ]);
  });

  it('leaves the hostname filter out when every host is wanted', () => {
    const filter = crawlerFilter({ ...WINDOW, hostnames: [] }, FULL_MODE, null);
    expect(JSON.stringify(filter)).not.toContain('clientRequestHTTPHost');
  });

  it('writes strings as escaped GraphQL literals', () => {
    expect(graphqlLiteral({ a: 'x"y\\z', b: [1, true] })).toBe(
      '{a: "x\\"y\\\\z", b: [1, true]}'
    );
    expect(() => graphqlLiteral({ 'bad key': 1 })).toThrow();
  });
});

describe('queryCrawlerWindow', () => {
  it('maps the groups Cloudflare returns', async () => {
    const cf = fakeCloudflare(() =>
      groupsResponse([
        {
          count: 12,
          dimensions: {
            datetimeHour: '2026-11-26T10:00:00Z',
            userAgent: 'Mozilla/5.0 (compatible; GPTBot/1.2)',
            clientRequestHTTPHost: 'example.com',
            clientRequestPath: '/docs',
            edgeResponseStatus: 200,
          },
        },
      ])
    );
    const result = await queryCrawlerWindow(TOKEN, WINDOW, FULL_MODE, {
      fetcher: cf.fetcher,
    });
    expect(result).toEqual({
      groups: [
        {
          count: 12,
          hour: '2026-11-26T10:00:00Z',
          userAgent: 'Mozilla/5.0 (compatible; GPTBot/1.2)',
          host: 'example.com',
          path: '/docs',
          status: 200,
          statusClass: null,
        },
      ],
      mode: FULL_MODE,
      queries: 1,
      truncated: false,
    });
    expect(cf.requests[0]?.authorization).toBe(`Bearer ${TOKEN}`);
  });

  it('falls back to one query per status class when status is not a dimension', async () => {
    const cf = fakeCloudflare((request) => {
      const query = request.query ?? '';
      if (query.includes('edgeResponseStatus\n')) {
        return unknownField('edgeResponseStatus');
      }
      const isClass = (from: number) =>
        query.includes(`edgeResponseStatus_geq: ${from}`);
      return groupsResponse(
        isClass(200) || isClass(400)
          ? [
              {
                count: isClass(200) ? 5 : 2,
                dimensions: {
                  datetimeHour: '2026-11-26T10:00:00Z',
                  userAgent: 'GPTBot/1.2',
                  clientRequestHTTPHost: 'example.com',
                  clientRequestPath: '/docs',
                },
              },
            ]
          : []
      );
    });
    const result = await queryCrawlerWindow(TOKEN, WINDOW, FULL_MODE, {
      fetcher: cf.fetcher,
    });
    expect(result.mode.status).toBe('class');
    expect(result.queries).toBe(5);
    expect(
      result.groups.map((group) => [group.count, group.statusClass])
    ).toEqual([
      [5, '2xx'],
      [2, '4xx'],
    ]);
    expect(cf.requests[1]?.query).toContain(
      'edgeResponseStatus_geq: 200, edgeResponseStatus_lt: 300'
    );
    expect(cf.requests[1]?.query).not.toContain('edgeResponseStatus\n');
  });

  it('drops status altogether when the status filter is unknown too', async () => {
    const cf = fakeCloudflare((request) =>
      request.query?.includes('edgeResponseStatus')
        ? unknownField('edgeResponseStatus')
        : groupsResponse([])
    );
    const result = await queryCrawlerWindow(TOKEN, WINDOW, FULL_MODE, {
      fetcher: cf.fetcher,
    });
    expect(result.mode.status).toBe('none');
    expect(cf.requests.at(-1)?.query).not.toContain('edgeResponseStatus');
  });

  it('retries without requestSource when Cloudflare does not know it', async () => {
    const cf = fakeCloudflare((request) =>
      request.query?.includes('requestSource')
        ? unknownField('requestSource')
        : groupsResponse([])
    );
    const result = await queryCrawlerWindow(TOKEN, WINDOW, FULL_MODE, {
      fetcher: cf.fetcher,
    });
    expect(result.mode).toMatchObject({
      requestSource: false,
      status: 'dimension',
    });
    expect(cf.requests).toHaveLength(2);
  });

  it('does not retry an unknown required field', async () => {
    const cf = fakeCloudflare(() => unknownField('userAgent'));
    await expect(
      queryCrawlerWindow(TOKEN, WINDOW, FULL_MODE, { fetcher: cf.fetcher })
    ).rejects.toMatchObject({ kind: 'request' });
    expect(cf.requests).toHaveLength(1);
  });

  it('flags a window that returned as many rows as allowed', async () => {
    const cf = fakeCloudflare(() =>
      groupsResponse([
        {
          count: 1,
          dimensions: {
            datetimeHour: '2026-11-26T10:00:00Z',
            userAgent: 'GPTBot',
            clientRequestPath: '/',
          },
        },
      ])
    );
    const result = await queryCrawlerWindow(
      TOKEN,
      { ...WINDOW, limit: 1 },
      FULL_MODE,
      { fetcher: cf.fetcher }
    );
    expect(result.truncated).toBe(true);
  });
});
