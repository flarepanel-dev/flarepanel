// `GET /insights/:projectId/bots`: the bots page's stats for API clients.

import { beforeAll, expect, mock, test } from 'bun:test';
import { Elysia } from 'elysia';
import { stubAppDeps } from '../../../test/http-fixtures';
import type { ClientAuthResult } from '../../http/client-auth';
import { errorHandler } from '../../http/errors';
import { emptyBotStats } from '../ingest/cloudflare/bot-store';

const CLIENT = {
  id: 'client-1',
  projectId: 'project-1',
  organizationId: 'organization-1',
  type: 'read' as const,
  secretVerified: true,
};

const authenticateClient = mock(
  (): Promise<ClientAuthResult> => Promise.resolve({ ok: true, client: CLIENT })
);
mock.module('../../http/client-auth', () => ({ authenticateClient }));

let insightsRoutes: typeof import('./export.routes').insightsRoutes;
beforeAll(async () => {
  ({ insightsRoutes } = await import('./export.routes'));
});

function request(query: string) {
  const botStats = mock(async (_projectId: string, _query: unknown) =>
    emptyBotStats({ month: '2026-11', hits: 0, cap: 100_000, capped: false })
  );
  const { deps } = stubAppDeps();
  deps.db = {
    project: {
      findUniqueOrThrow: async () => ({
        organization: { id: 'organization-1', timezone: 'Europe/Berlin' },
      }),
    },
  } as never;
  deps.eventStore = { botStats } as never;
  const app = new Elysia()
    .use(errorHandler(deps, { production: true }))
    .use(insightsRoutes(deps));
  const response = app.handle(
    new Request(`http://localhost/insights/project-1/bots?${query}`, {
      headers: {
        'openpanel-client-id': '00000000-0000-4000-8000-000000000000',
        'openpanel-client-secret': 'sec_test',
      },
    })
  );
  return { botStats, response };
}

test('answers the bot stats for the local-day window with group and verified filters', async () => {
  const { botStats, response } = request(
    'startDate=2026-11-01&endDate=2026-11-27&group=training&verified=true&limit=5'
  );
  const res = await response;

  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({
    totals: { total: 0 },
    usage: { month: '2026-11', cap: 100_000 },
  });
  expect(botStats).toHaveBeenCalledTimes(1);
  expect(botStats.mock.calls[0]).toEqual([
    'project-1',
    {
      fromMs: Date.parse('2026-10-31T23:00:00Z'),
      toMs: Date.parse('2026-11-27T22:59:59Z'),
      timezone: 'Europe/Berlin',
      group: 'training',
      verified: 'verified',
      limit: 5,
      monthlyCap: 100_000,
    },
  ]);
});

test('counts every hit by default and rejects an unknown group', async () => {
  const all = request('range=7d');
  expect((await all.response).status).toBe(200);
  expect(
    (all.botStats.mock.calls[0]?.[1] as { verified: string }).verified
  ).toBe('all');

  const bad = request('group=robots');
  expect((await bad.response).status).toBe(400);
  expect(bad.botStats).not.toHaveBeenCalled();
});
