// Only the "is anyone logged in" boundary is exercised here; no database.

import { expect, mock, test } from 'bun:test';
import {
  servicesWithProjectAccess,
  stubHttpCtx,
} from '../../../test/rpc-fixtures';
import { makeTrpcContext } from '../../rpc/base';
import type { Services } from '../../services';
import type { CookieOptions } from '../../shared/cookie';
import type { IBotStats } from './event.constants';
import { eventRouter } from './event.rpc';
import type { EventStore } from './src/event-store';

const COOKIE_OPTIONS: CookieOptions = {
  domain: '.flarepanel.dev',
  secure: true,
  sameSite: 'lax',
  httpOnly: true,
  path: '/',
};

const EMPTY_SESSION = { session: null, user: null, userId: null };
const PROJECT = { projectId: 'proj_1' };
const REF = { id: 'evt_1', projectId: 'proj_1' };
const WINDOW = { projectId: 'proj_1', range: '7d', interval: 'day' } as const;

async function anonCaller() {
  const { ctx } = stubHttpCtx({}, EMPTY_SESSION);
  const trpcCtx = await makeTrpcContext(ctx, new Headers(), {
    cookieOptions: COOKIE_OPTIONS,
  });
  return eventRouter.createCaller(trpcCtx);
}

/**
 * A signed-in member. `protectedProcedure` authenticates and authorizes
 * before the input parser runs, so reaching a zod rejection needs both.
 */
async function memberCaller() {
  const { ctx } = stubHttpCtx({ services: servicesWithProjectAccess() });
  const trpcCtx = await makeTrpcContext(ctx, new Headers(), {
    cookieOptions: COOKIE_OPTIONS,
  });
  return eventRouter.createCaller(trpcCtx);
}

const UNAUTHORIZED = { code: 'UNAUTHORIZED' };

test('every query rejects an unauthenticated caller before touching a database', async () => {
  const caller = await anonCaller();
  await expect(caller.byId(REF)).rejects.toMatchObject(UNAUTHORIZED);
  await expect(caller.details(REF)).rejects.toMatchObject(UNAUTHORIZED);
  await expect(caller.events(PROJECT)).rejects.toMatchObject(UNAUTHORIZED);
  await expect(caller.conversionNames(PROJECT)).rejects.toMatchObject(
    UNAUTHORIZED
  );
  await expect(caller.conversions(PROJECT)).rejects.toMatchObject(UNAUTHORIZED);
  await expect(caller.pages(WINDOW)).rejects.toMatchObject(UNAUTHORIZED);
  await expect(caller.pagesTimeseries(WINDOW)).rejects.toMatchObject(
    UNAUTHORIZED
  );
  await expect(
    caller.previousPages({ ...WINDOW, pages: [] })
  ).rejects.toMatchObject(UNAUTHORIZED);
  await expect(
    caller.pageTimeseries({ ...WINDOW, origin: 'https://a.io', path: '/' })
  ).rejects.toMatchObject(UNAUTHORIZED);
  await expect(caller.origin(PROJECT)).rejects.toMatchObject(UNAUTHORIZED);
});

// Letting anonymous callers in on the mere existence of a ShareOverview row
// was a bug.
test('bots rejects an unauthenticated caller (ADR-011: no anonymous share branch)', async () => {
  const caller = await anonCaller();
  await expect(caller.bots(PROJECT)).rejects.toMatchObject(UNAUTHORIZED);
  await expect(caller.botStats(PROJECT)).rejects.toMatchObject(UNAUTHORIZED);
});

const BOT_TOTALS = {
  total: 3,
  ai: 2,
  answers: 0,
  indexing: 0,
  training: 2,
  search: 1,
  other: 0,
};
const BOT_STATS: IBotStats = {
  totals: BOT_TOTALS,
  sources: { snippet: 3, cloudflare: 0 },
  series: [{ date: '2026-11-24', ...BOT_TOTALS }],
  topBots: [
    {
      name: 'GPTBot',
      category: 'AI Data Scraper',
      group: 'training',
      hits: 2,
      verifiedHits: 0,
      lastSeen: 1,
    },
  ],
  topPaths: [
    {
      path: '/pricing',
      hits: 2,
      lastSeen: 1,
      status: { '2xx': 2, '3xx': 0, '4xx': 0, '5xx': 0 },
      bots: [
        {
          name: 'GPTBot',
          category: 'AI Data Scraper',
          group: 'training',
          hits: 2,
        },
      ],
    },
  ],
  verifiedOnly: false,
  verifiedHits: 0,
  allHits: 3,
  usage: { month: '2026-11', hits: 3, cap: 100_000, capped: false },
};

async function botStatsCaller(
  eventStore?: Partial<EventStore>,
  timezone = 'UTC'
) {
  const requireProjectAccess = mock(() => Promise.resolve({ level: 'read' }));
  const services = {
    auth: {
      requireProjectAccess,
      getOrganizationAccess: () => Promise.resolve({ role: 'admin' }),
    },
  } as unknown as Services;
  const db = {
    project: {
      findUniqueOrThrow: () =>
        Promise.resolve({ organization: { id: 'org_1', timezone } }),
    },
  };
  const { ctx } = stubHttpCtx({
    services,
    db: db as never,
    eventStore: eventStore as EventStore | undefined,
  });
  const trpcCtx = await makeTrpcContext(ctx, new Headers(), {
    cookieOptions: COOKIE_OPTIONS,
  });
  return { caller: eventRouter.createCaller(trpcCtx), requireProjectAccess };
}

test('botStats checks read access and asks the store for the local-day window', async () => {
  const botStats = mock(() => Promise.resolve(BOT_STATS));
  const { caller, requireProjectAccess } = await botStatsCaller(
    { botStats },
    'Europe/Berlin'
  );

  const stats = await caller.botStats({
    ...PROJECT,
    range: 'custom',
    startDate: '2026-11-01',
    endDate: '2026-11-24',
    group: 'answers',
  });

  expect(stats).toEqual(BOT_STATS);
  expect(requireProjectAccess).toHaveBeenCalledWith(
    expect.objectContaining({ projectId: 'proj_1', level: 'read' })
  );
  expect(botStats).toHaveBeenCalledTimes(1);
  const [projectId, query] = botStats.mock.calls[0] as unknown as [
    string,
    Record<string, unknown>,
  ];
  expect(projectId).toBe('proj_1');
  // Berlin is UTC+1 in November: local midnight is 23:00 UTC the day before.
  expect(query).toMatchObject({
    fromMs: Date.parse('2026-10-31T23:00:00Z'),
    toMs: Date.parse('2026-11-24T22:59:59Z'),
    timezone: 'Europe/Berlin',
    group: 'answers',
    verified: 'auto',
  });
  expect(
    typeof query.monthlyCap === 'number' || query.monthlyCap === null
  ).toBe(true);
});

test('botStats rejects an unknown group', async () => {
  const { caller } = await botStatsCaller({
    botStats: () => Promise.resolve(BOT_STATS),
  });
  await expect(
    caller.botStats({ ...PROJECT, group: 'robots' as never })
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
});

test('botStats answers empty stats where the store keeps no counts', async () => {
  const { caller } = await botStatsCaller();

  const stats = await caller.botStats({ ...PROJECT, range: '7d' });
  expect(stats).toMatchObject({
    totals: { total: 0, ai: 0, answers: 0, training: 0 },
    series: [],
    topBots: [],
    topPaths: [],
    verifiedOnly: false,
  });
});

test('updateEventMeta rejects an unauthenticated caller before touching Postgres', async () => {
  const caller = await anonCaller();
  await expect(
    caller.updateEventMeta({ ...PROJECT, name: 'signup', conversion: true })
  ).rejects.toMatchObject(UNAUTHORIZED);
});

test('events rejects a malformed filter at the input boundary', async () => {
  const caller = await memberCaller();
  await expect(
    caller.events({ ...PROJECT, filters: [{ bogus: true }] as never })
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
});
