import { describe, expect, it } from 'bun:test';
import {
  fakeCloudflare,
  jsonResponse,
  settingsResponse,
} from '../../../../test/cloudflare-api-fixture';
import {
  CloudflareApiError,
  checkCloudflareZone,
  cloudflareGraphql,
  listCloudflareZones,
  unknownFieldIn,
} from './api';

const TOKEN = 'cf-test-token-0123456789abcdef';
const ZONE = '0123456789abcdef0123456789abcdef';

describe('listCloudflareZones', () => {
  it('lists the zones with the bearer token, 50 per page, across pages', async () => {
    const cf = fakeCloudflare((request) => {
      const page = Number(new URL(request.url).searchParams.get('page'));
      return jsonResponse({
        success: true,
        result:
          page === 1
            ? [{ id: ZONE, name: 'example.com', status: 'active' }]
            : [{ id: 'f'.repeat(32), name: 'example.org', status: 'pending' }],
        result_info: { page, total_pages: 2 },
      });
    });
    const zones = await listCloudflareZones(TOKEN, { fetcher: cf.fetcher });
    expect(zones).toEqual([
      { id: ZONE, name: 'example.com', status: 'active' },
      { id: 'f'.repeat(32), name: 'example.org', status: 'pending' },
    ]);
    expect(cf.requests.map((request) => request.url)).toEqual([
      'https://api.cloudflare.com/client/v4/zones?per_page=50&page=1',
      'https://api.cloudflare.com/client/v4/zones?per_page=50&page=2',
    ]);
    expect(cf.requests[0]?.authorization).toBe(`Bearer ${TOKEN}`);
  });

  for (const status of [400, 401, 403]) {
    it(`treats ${status} as a token that cannot list zones`, async () => {
      const cf = fakeCloudflare(() =>
        jsonResponse(
          {
            success: false,
            errors: [
              {
                code: 9109,
                message: 'Unauthorized to access requested resource',
              },
            ],
          },
          status
        )
      );
      const error = await listCloudflareZones(TOKEN, {
        fetcher: cf.fetcher,
      }).catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(CloudflareApiError);
      expect(error).toMatchObject({ kind: 'auth', status });
      expect((error as Error).message).toContain('Unauthorized');
    });
  }

  it('reports a rate limit and an outage as such', async () => {
    const limited = fakeCloudflare(() => jsonResponse({}, 429));
    await expect(
      listCloudflareZones(TOKEN, { fetcher: limited.fetcher })
    ).rejects.toMatchObject({ kind: 'rate_limit' });
    const down = fakeCloudflare(() => jsonResponse({}, 502));
    await expect(
      listCloudflareZones(TOKEN, { fetcher: down.fetcher })
    ).rejects.toMatchObject({ kind: 'unavailable' });
  });
});

describe('cloudflareGraphql', () => {
  it('retries a 429 with backoff, honouring Retry-After, then succeeds', async () => {
    const cf = fakeCloudflare((_request, index) =>
      index === 0
        ? jsonResponse({ errors: [{ message: 'rate limited' }] }, 429, {
            'retry-after': '3',
          })
        : index === 1
          ? jsonResponse({ errors: [{ message: 'rate limited' }] }, 429)
          : jsonResponse({ data: { ok: true }, errors: null })
    );
    const data = await cloudflareGraphql<{ ok: boolean }>(TOKEN, '{ ok }', {
      fetcher: cf.fetcher,
      sleep: cf.sleep,
    });
    expect(data).toEqual({ ok: true });
    expect(cf.requests).toHaveLength(3);
    expect(cf.sleeps).toEqual([3000, 4000]);
  });

  it('gives up after three rate-limited attempts', async () => {
    const cf = fakeCloudflare(() =>
      jsonResponse(
        {
          data: null,
          errors: [
            {
              message:
                'rate limiter budget depleted, try again after 5 minutes',
              extensions: { code: 'budget' },
            },
          ],
        },
        200
      )
    );
    await expect(
      cloudflareGraphql(TOKEN, '{ ok }', {
        fetcher: cf.fetcher,
        sleep: cf.sleep,
      })
    ).rejects.toMatchObject({ kind: 'rate_limit' });
    expect(cf.requests).toHaveLength(3);
    expect(cf.sleeps).toEqual([2000, 4000]);
  });

  it('turns 401 and 403 into auth errors without retrying', async () => {
    for (const status of [401, 403]) {
      const cf = fakeCloudflare(() =>
        jsonResponse(
          { errors: [{ message: 'not authorized for that account' }] },
          status
        )
      );
      await expect(
        cloudflareGraphql(TOKEN, '{ ok }', {
          fetcher: cf.fetcher,
          sleep: cf.sleep,
        })
      ).rejects.toMatchObject({ kind: 'auth', status });
      expect(cf.requests).toHaveLength(1);
    }
  });

  it('names an unknown optional field', async () => {
    const cf = fakeCloudflare(() =>
      jsonResponse({
        data: null,
        errors: [
          {
            message:
              'error parsing args: unknown field "edgeResponseStatus" in dimensions',
          },
        ],
      })
    );
    await expect(
      cloudflareGraphql(TOKEN, '{ ok }', {
        fetcher: cf.fetcher,
        optionalFields: ['edgeResponseStatus'],
      })
    ).rejects.toMatchObject({
      kind: 'unknown_field',
      field: 'edgeResponseStatus',
    });
  });

  it('reads field names out of the usual GraphQL error wordings', () => {
    const fields = ['edgeResponseStatus', 'requestSource'];
    expect(
      unknownFieldIn(
        [{ message: 'Cannot query field "edgeResponseStatus" on type "X"' }],
        fields
      )
    ).toBe('edgeResponseStatus');
    expect(
      unknownFieldIn(
        [{ message: 'unknown argument edgeResponseStatus_geq' }],
        fields
      )
    ).toBe('edgeResponseStatus');
    expect(
      unknownFieldIn([{ message: 'syntax error near requestSource' }], fields)
    ).toBeNull();
  });
});

describe('checkCloudflareZone', () => {
  it('validates the zone with one settings query and returns its limits', async () => {
    const cf = fakeCloudflare(() =>
      settingsResponse({ maxDuration: 86_400, notOlderThan: 2_678_400 })
    );
    const limits = await checkCloudflareZone(TOKEN, ZONE, {
      fetcher: cf.fetcher,
    });
    expect(limits).toEqual({
      maxDuration: 86_400,
      notOlderThan: 2_678_400,
      maxPageSize: 10_000,
    });
    expect(cf.requests).toHaveLength(1);
    expect(cf.requests[0]?.url).toBe(
      'https://api.cloudflare.com/client/v4/graphql'
    );
    expect(cf.requests[0]?.method).toBe('POST');
    expect(cf.requests[0]?.variables).toEqual({ zoneTag: ZONE });
    expect(cf.requests[0]?.query).toContain('httpRequestsAdaptiveGroups');
  });

  it('says the token cannot read a zone Cloudflare returns nothing for', async () => {
    const cf = fakeCloudflare(() =>
      jsonResponse({ data: { viewer: { zones: [] } }, errors: null })
    );
    await expect(
      checkCloudflareZone(TOKEN, ZONE, { fetcher: cf.fetcher })
    ).rejects.toMatchObject({ kind: 'auth' });
  });

  it('falls back to a one-row probe when the schema has no settings node', async () => {
    const cf = fakeCloudflare((request) =>
      request.query?.includes('settings')
        ? jsonResponse({
            data: null,
            errors: [
              { message: 'Cannot query field "settings" on type "zone"' },
            ],
          })
        : jsonResponse({
            data: {
              viewer: {
                zones: [{ httpRequestsAdaptiveGroups: [{ count: 1 }] }],
              },
            },
          })
    );
    const limits = await checkCloudflareZone(TOKEN, ZONE, {
      fetcher: cf.fetcher,
      now: Date.parse('2026-11-27T12:00:00Z'),
    });
    expect(limits).toEqual({
      maxDuration: null,
      notOlderThan: null,
      maxPageSize: null,
    });
    expect(cf.requests[1]?.variables).toEqual({
      zoneTag: ZONE,
      since: '2026-11-27T11:00:00.000Z',
      until: '2026-11-27T12:00:00.000Z',
    });
  });
});
