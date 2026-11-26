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

const BOT_STATS: IBotStats = {
  totals: { total: 3, ai: 2, search: 1, other: 0 },
  series: [{ date: '2026-11-24', total: 3, ai: 2, search: 1, other: 0 }],
  topBots: [
    {
      name: 'GPTBot',
      category: 'AI Data Scraper',
      group: 'ai',
      hits: 2,
      lastSeen: 1,
    },
  ],
  topPaths: [
    {
      path: '/pricing',
      hits: 2,
      lastSeen: 1,
      bots: [{ name: 'GPTBot', category: 'AI Data Scraper', hits: 2 }],
    },
  ],
};

async function botStatsCaller(eventStore?: Partial<EventStore>) {
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
        Promise.resolve({ organization: { id: 'org_1', timezone: 'UTC' } }),
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

test('botStats checks read access and asks the store for the UTC day window', async () => {
  const botStats = mock(() => Promise.resolve(BOT_STATS));
  const { caller, requireProjectAccess } = await botStatsCaller({ botStats });

  const stats = await caller.botStats({
    ...PROJECT,
    range: 'custom',
    startDate: '2026-11-01',
    endDate: '2026-11-24',
  });

  expect(stats).toEqual(BOT_STATS);
  expect(requireProjectAccess).toHaveBeenCalledWith(
    expect.objectContaining({ projectId: 'proj_1', level: 'read' })
  );
  expect(botStats).toHaveBeenCalledTimes(1);
  expect(botStats.mock.calls[0] as unknown[]).toEqual([
    'proj_1',
    { fromDay: '2026-11-01', toDay: '2026-11-24', limit: undefined },
  ]);
});

test('botStats answers empty stats where the store keeps no daily counts', async () => {
  const { caller } = await botStatsCaller();

  expect(await caller.botStats({ ...PROJECT, range: '7d' })).toEqual({
    totals: { total: 0, ai: 0, search: 0, other: 0 },
    series: [],
    topBots: [],
    topPaths: [],
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
