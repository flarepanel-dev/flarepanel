import { Database, type SQLQueryBindings } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import { decryptCredential } from '@flarepanel/shared/server';
import {
  fakeCloudflare,
  groupsResponse,
  isSettingsQuery,
  jsonResponse,
  settingsResponse,
} from '../../../test/cloudflare-api-fixture';
import { testCoreConfig } from '../../../test/config-fixture';
import { openBotStore } from '../ingest/cloudflare/bot-store';
import type { EngineSql, SqlRow } from '../ingest/cloudflare/engine';
import {
  wallClockEndMs,
  wallClockToMs,
} from '../ingest/cloudflare/time-buckets';
import {
  connectCloudflare,
  getCloudflareSetup,
  listZonesForToken,
  projectHostnames,
  runCloudflareProjectSync,
} from './cloudflare-analytics.service';

const ENCRYPTION_KEY = 'b'.repeat(64);
const TOKEN = 'cfTestToken_0123456789abcdefWXYZ';
const ZONE = '0123456789abcdef0123456789abcdef';
const NOW = Date.parse('2026-11-27T12:30:00Z');
const GPTBOT_UA =
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)';

function memorySql(): EngineSql {
  const db = new Database(':memory:');
  return {
    exec(query, ...bindings) {
      return db
        .query(query)
        .all(...(bindings as SQLQueryBindings[])) as SqlRow[];
    },
    transaction: (fn) => db.transaction(fn)(),
  };
}

/** The two tables the service reads, in memory. */
function memoryDb() {
  const connections: Record<string, unknown>[] = [];
  const find = (projectId: string) =>
    connections.find((row) => row.projectId === projectId);
  const db = {
    project: {
      findUnique: async () => ({
        domain: 'https://example.com',
        cors: ['https://docs.example.com'],
      }),
    },
    cloudflareConnection: {
      findUnique: async ({ where }: { where: { projectId: string } }) =>
        find(where.projectId) ?? null,
      findMany: async () =>
        connections.map((row) => ({ projectId: row.projectId })),
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { projectId: string };
        create: Record<string, unknown>;
        update: Record<string, unknown>;
      }) => {
        const existing = find(where.projectId);
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          return existing;
        }
        const row = {
          syncedThrough: null,
          lastSyncedAt: null,
          lastSyncStatus: null,
          lastSyncError: null,
          lastSyncHits: null,
          createdAt: new Date(),
          ...create,
        };
        connections.push(row);
        return row;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { projectId: string };
        data: Record<string, unknown>;
      }) => {
        const row = find(where.projectId);
        if (row) {
          Object.assign(row, data);
        }
        return { count: row ? 1 : 0 };
      },
      deleteMany: async ({ where }: { where: { projectId: string } }) => {
        const index = connections.findIndex(
          (row) => row.projectId === where.projectId
        );
        if (index >= 0) {
          connections.splice(index, 1);
        }
        return { count: index >= 0 ? 1 : 0 };
      },
    },
  };
  return { db, connections };
}

const noopLogger = {
  fatal: () => undefined,
  error: () => undefined,
  warn: () => undefined,
  info: () => undefined,
  debug: () => undefined,
  trace: () => undefined,
  child: () => noopLogger,
};

function setup(options: { withStore?: boolean; selfHosted?: boolean } = {}) {
  const { db, connections } = memoryDb();
  const bots = openBotStore(memorySql());
  const imports: unknown[] = [];
  const eventStore =
    options.withStore === false
      ? undefined
      : {
          botImport: async (
            _projectId: string,
            batch: Parameters<typeof bots.importHours>[0]
          ) => {
            imports.push(batch);
            return bots.importHours(batch);
          },
        };
  const deps = {
    db,
    config: testCoreConfig({
      encryptionKey: ENCRYPTION_KEY,
      selfHosted: options.selfHosted ?? false,
    }),
    eventStore,
    logger: noopLogger,
  } as never;
  return { deps, connections, bots, imports };
}

const okCloudflare = (groups: Parameters<typeof groupsResponse>[0] = []) =>
  fakeCloudflare((request) => {
    if (request.url.includes('/zones?')) {
      return jsonResponse({
        success: true,
        result: [{ id: ZONE, name: 'example.com', status: 'active' }],
        result_info: { total_pages: 1 },
      });
    }
    return isSettingsQuery(request)
      ? settingsResponse()
      : groupsResponse(groups);
  });

describe('connecting a zone', () => {
  it('stores the token encrypted at rest and only ever shows its last 4 characters', async () => {
    const { deps, connections } = setup();
    const cf = okCloudflare();
    const connection = await connectCloudflare(
      deps,
      {
        projectId: 'p1',
        token: TOKEN,
        zoneId: ZONE,
        hostnames: ['example.com'],
        userId: 'u1',
      },
      { fetcher: cf.fetcher }
    );
    const row = connections[0] as { encryptedToken: string };
    expect(row.encryptedToken.startsWith('enc:')).toBe(true);
    expect(row.encryptedToken).not.toContain(TOKEN);
    expect(decryptCredential(ENCRYPTION_KEY, row.encryptedToken)).toBe(TOKEN);
    expect(connection).toMatchObject({
      zoneId: ZONE,
      zoneName: 'example.com',
      tokenHint: 'WXYZ',
      hostnames: ['example.com'],
    });
    expect(JSON.stringify(connection)).not.toContain(TOKEN);
    const setupView = await getCloudflareSetup(deps, 'p1');
    expect(JSON.stringify(setupView)).not.toContain(TOKEN);
    expect(JSON.stringify(setupView)).not.toContain(row.encryptedToken);
    expect(setupView.available).toBe(true);
  });

  it('checks the zone with Cloudflare before saving anything', async () => {
    const { deps, connections } = setup();
    const cf = fakeCloudflare(() =>
      jsonResponse({ errors: [{ message: 'Unauthorized' }] }, 403)
    );
    await expect(
      connectCloudflare(
        deps,
        {
          projectId: 'p1',
          token: TOKEN,
          zoneId: ZONE,
          hostnames: [],
          userId: 'u1',
        },
        { fetcher: cf.fetcher }
      )
    ).rejects.toThrow(/Zone → Analytics → Read/);
    expect(connections).toHaveLength(0);
  });

  it('keeps the stored token when only the hostnames change, and starts over', async () => {
    const { deps, connections } = setup();
    const cf = okCloudflare();
    const input = {
      projectId: 'p1',
      zoneId: ZONE,
      hostnames: ['example.com'],
      userId: 'u1',
    };
    await connectCloudflare(deps, { ...input, token: TOKEN }, cf);
    Object.assign(connections[0] ?? {}, {
      syncedThrough: new Date('2026-11-27T00:00:00Z'),
    });
    const changed = await connectCloudflare(
      deps,
      { ...input, hostnames: ['docs.example.com'] },
      cf
    );
    expect(changed.tokenHint).toBe('WXYZ');
    expect(changed.syncedThrough).toBeNull();
  });

  it('refuses where bot traffic is not kept, and without an encryption key', async () => {
    const cf = okCloudflare();
    const input = {
      projectId: 'p1',
      token: TOKEN,
      zoneId: ZONE,
      hostnames: [],
      userId: 'u1',
    };
    await expect(
      connectCloudflare(setup({ withStore: false }).deps, input, cf)
    ).rejects.toThrow(/Workers deployment/);
    const { deps } = setup();
    (deps as { config: { encryptionKey?: string } }).config.encryptionKey =
      undefined;
    await expect(connectCloudflare(deps, input, cf)).rejects.toThrow(
      /ENCRYPTION_KEY/
    );
  });
});

describe('listing zones', () => {
  it('lists the zones a token can read', async () => {
    const { deps } = setup();
    const cf = okCloudflare();
    expect(await listZonesForToken(deps, 'p1', TOKEN, cf)).toEqual({
      zones: [{ id: ZONE, name: 'example.com', status: 'active' }],
      listError: null,
    });
  });

  it('asks for the zone ID when the token cannot list zones', async () => {
    const { deps } = setup();
    const cf = fakeCloudflare(() =>
      jsonResponse(
        { success: false, errors: [{ code: 9109, message: 'Unauthorized' }] },
        403
      )
    );
    const result = await listZonesForToken(deps, 'p1', TOKEN, cf);
    expect(result.zones).toEqual([]);
    expect(result.listError).toMatch(/zone ID/);
  });
});

describe('suggested hostnames', () => {
  it('are the project domain, its www twin and the CORS origins', () => {
    expect(
      projectHostnames({
        domain: 'https://example.com',
        cors: ['https://docs.example.com/', 'not a url'],
      })
    ).toEqual(['example.com', 'docs.example.com', 'www.example.com']);
    expect(projectHostnames({ domain: null, cors: [] })).toEqual([]);
  });
});

describe('the project sync', () => {
  async function connected(
    options: Parameters<typeof setup>[0] = {},
    groups: Parameters<typeof groupsResponse>[0] = []
  ) {
    const context = setup(options);
    const cf = okCloudflare(groups);
    await connectCloudflare(
      context.deps,
      {
        projectId: 'p1',
        token: TOKEN,
        zoneId: ZONE,
        hostnames: ['example.com'],
        userId: 'u1',
      },
      cf
    );
    return { ...context, cf };
  }

  it('imports estimates, records the cursor, hits and success', async () => {
    const { deps, connections, bots, cf } = await connected({}, [
      {
        count: 25,
        dimensions: {
          datetimeHour: '2026-11-27T09:00:00Z',
          userAgent: GPTBOT_UA,
          clientRequestHTTPHost: 'example.com',
          clientRequestPath: '/docs',
          edgeResponseStatus: 200,
        },
      },
    ]);
    await runCloudflareProjectSync(deps, 'p1', {
      fetcher: cf.fetcher,
      sleep: cf.sleep,
      now: NOW,
    });
    expect(connections[0]).toMatchObject({
      lastSyncStatus: 'success',
      lastSyncError: null,
      syncedThrough: new Date('2026-11-27T12:00:00Z'),
    });
    // Every query answers the same group; only the window holding its hour keeps it.
    const stats = bots.stats({
      fromMs: wallClockToMs('2026-11-27', 'UTC'),
      toMs: wallClockEndMs('2026-11-27', 'UTC'),
      timezone: 'UTC',
    });
    expect(stats.totals.training).toBe(25);
    expect(stats.sources).toEqual({ snippet: 0, cloudflare: 25 });
    // Every request carried the token; none went anywhere but Cloudflare.
    for (const request of cf.requests) {
      expect(request.authorization).toBe(`Bearer ${TOKEN}`);
      expect(request.url.startsWith('https://api.cloudflare.com/')).toBe(true);
    }
  });

  it('does not double count hours the snippet already reported', async () => {
    const { deps, bots, cf } = await connected({}, [
      {
        count: 25,
        dimensions: {
          datetimeHour: '2026-11-27T09:00:00Z',
          userAgent: GPTBOT_UA,
          clientRequestHTTPHost: 'example.com',
          clientRequestPath: '/docs',
          edgeResponseStatus: 200,
        },
      },
    ]);
    bots.add({
      id: 'snippet-1',
      name: 'GPTBot',
      type: 'AI Data Scraper',
      project_id: 'p1',
      path: 'https://example.com/docs',
      created_at: '2026-11-27 09:20:00.000',
    });
    await runCloudflareProjectSync(deps, 'p1', {
      fetcher: cf.fetcher,
      now: NOW,
    });
    const stats = bots.stats({
      fromMs: wallClockToMs('2026-11-27', 'UTC'),
      toMs: wallClockEndMs('2026-11-27', 'UTC'),
      timezone: 'UTC',
    });
    expect(stats.totals.total).toBe(1);
    expect(stats.sources).toEqual({ snippet: 1, cloudflare: 0 });
  });

  it('records a rejected token and does not retry it', async () => {
    const { deps, connections, imports } = await connected();
    const cf = fakeCloudflare(() =>
      jsonResponse({ errors: [{ message: 'Invalid API Token' }] }, 401)
    );
    await runCloudflareProjectSync(deps, 'p1', {
      fetcher: cf.fetcher,
      now: NOW,
    });
    expect(connections[0]).toMatchObject({ lastSyncStatus: 'auth_error' });
    expect(String(connections[0]?.lastSyncError)).toMatch(/Analytics → Read/);
    expect(imports).toHaveLength(0);
  });

  it('records a rate limit and rethrows so the queue retries after backoff', async () => {
    const { deps, connections } = await connected();
    const cf = fakeCloudflare(() =>
      jsonResponse({ errors: [{ message: 'rate limited' }] }, 429)
    );
    await expect(
      runCloudflareProjectSync(deps, 'p1', {
        fetcher: cf.fetcher,
        sleep: cf.sleep,
        now: NOW,
      })
    ).rejects.toMatchObject({ kind: 'rate_limit' });
    expect(cf.requests).toHaveLength(3);
    expect(connections[0]).toMatchObject({ lastSyncStatus: 'rate_limited' });
  });

  it('respects the hosted monthly cap', async () => {
    const { deps, bots, cf } = await connected({}, [
      {
        count: 150_000,
        dimensions: {
          datetimeHour: '2026-11-27T09:00:00Z',
          userAgent: GPTBOT_UA,
          clientRequestHTTPHost: 'example.com',
          clientRequestPath: '/docs',
          edgeResponseStatus: 200,
        },
      },
      {
        count: 10,
        dimensions: {
          datetimeHour: '2026-11-27T10:00:00Z',
          userAgent: GPTBOT_UA,
          clientRequestHTTPHost: 'example.com',
          clientRequestPath: '/docs',
          edgeResponseStatus: 200,
        },
      },
    ]);
    await runCloudflareProjectSync(deps, 'p1', {
      fetcher: cf.fetcher,
      now: NOW,
    });
    const usage = bots.usage(100_000, NOW);
    expect(usage.capped).toBe(true);
    // The hour that crossed the cap is kept whole; nothing after it.
    expect(usage.hits).toBe(150_000);
  });
});
