// Project creation: one write client for the SDKs and one read client for MCP,
// whose token is the only thing the caller ever sees of it.

import { afterAll, beforeAll, expect, mock, test } from 'bun:test';
import { testCoreConfig } from '../../../test/config-fixture';

interface CreateArgs {
  data: Record<string, unknown>;
}

const clientCreate = mock(async ({ data }: CreateArgs) => ({
  id: `client_${String(data.type)}`,
  ...data,
}));
const dbMock = {
  organization: {
    create: mock(async ({ data }: CreateArgs) => ({ ...data })),
  },
  member: { create: mock(async () => ({})) },
  project: { create: mock(async ({ data }: CreateArgs) => ({ ...data })) },
  client: { create: clientCreate },
  trialClaim: {
    claimed: new Set<string>(),
    findUnique: mock(async ({ where }: { where: { emailKey: string } }) =>
      dbMock.trialClaim.claimed.has(where.emailKey)
        ? { emailKey: where.emailKey }
        : null
    ),
    create: mock(async ({ data }: { data: { emailKey: string } }) => {
      dbMock.trialClaim.claimed.add(data.emailKey);
      return data;
    }),
    deleteMany: mock(async () => ({ count: 0 })),
  },
  // Both Prisma forms: the array of operations the organization uses, and
  // the callback the project and its clients run in.
  $transaction: mock(
    (operations: Promise<unknown>[] | ((tx: unknown) => Promise<unknown>)) =>
      typeof operations === 'function'
        ? operations(dbMock)
        : Promise.all(operations)
  ),
};
const deps = {
  db: dbMock,
  config: testCoreConfig(),
} as unknown as import('../../services').ServiceDeps;

const realSlugId = { ...(await import('../../slug-id')) };
mock.module('../../slug-id', () => ({
  ...realSlugId,
  getId: mock(async (_deps: unknown, _table: string, name: string) =>
    name.toLowerCase().replace(/\s+/g, '-')
  ),
}));
const realUserService = { ...(await import('../user/user.service')) };
mock.module('../user/user.service', () => ({
  ...realUserService,
  getUserById: mock(async () => ({ email: 'ada@example.com' })),
}));

afterAll(() => {
  mock.module('../../slug-id', () => realSlugId);
  mock.module('../user/user.service', () => realUserService);
});

let createOnboardingProject: typeof import('./onboarding.service').createOnboardingProject;

beforeAll(async () => {
  ({ createOnboardingProject } = await import('./onboarding.service'));
});

test('creates a write client for events and a read client whose token works for MCP', async () => {
  const result = await createOnboardingProject(
    deps,
    {
      organization: 'Acme',
      project: 'Acme site',
      domain: 'https://acme.com',
      cors: [],
      website: true,
      app: false,
      backend: false,
    },
    'user_1'
  );

  expect(clientCreate).toHaveBeenCalledTimes(2);
  const created = clientCreate.mock.calls.map(([call]) => call.data);
  expect(created.map((data) => data.type)).toEqual(['write', 'read']);
  expect(created.map((data) => data.name)).toEqual([
    'Acme site Client',
    'Acme site MCP client',
  ]);
  expect(created.every((data) => data.projectId === 'acme-site')).toBe(true);

  expect(result.type).toBe('write');
  expect(result.secret).toMatch(/^sec_[0-9a-f]{20}$/);
  const decoded = Buffer.from(result.mcpToken, 'base64').toString();
  expect(decoded).toMatch(/^client_read:sec_[0-9a-f]{20}$/);
  // Its own secret, never the write client's.
  expect(decoded.endsWith(result.secret)).toBe(false);
});

test('stores the first touch on a new organization with the referrer resolved', async () => {
  dbMock.organization.create.mockClear();
  await createOnboardingProject(
    deps,
    {
      organization: 'Beta',
      project: 'Beta site',
      domain: 'https://beta.com',
      cors: [],
      website: true,
      app: false,
      backend: false,
      attribution: {
        referrer: 'https://www.reddit.com/r/selfhosted/comments/abc/',
        landingPage: '/compare/mixpanel',
        utmCampaign: 'launch',
        firstSeenAt: '2026-11-01T10:00:00.000Z',
      },
    },
    'user_1'
  );

  const [call] = dbMock.organization.create.mock.calls;
  expect(call?.[0].data.attribution).toEqual({
    referrer: 'https://www.reddit.com/r/selfhosted/comments/abc/',
    referrerName: 'Reddit',
    referrerType: 'social',
    landingPage: '/compare/mixpanel',
    utmSource: null,
    utmMedium: null,
    utmCampaign: 'launch',
    utmContent: null,
    utmTerm: null,
    firstSeenAt: '2026-11-01T10:00:00.000Z',
  });
});

test('resolves the referrer from utm_source and drops an empty first touch', async () => {
  const { toStoredAttribution } = await import('./onboarding.service');
  expect(toStoredAttribution({ utmSource: 'twitter' })?.referrerName).toBe(
    'Twitter'
  );
  expect(toStoredAttribution({})).toBeUndefined();
  expect(toStoredAttribution(undefined)).toBeUndefined();
});

test('gives one free trial per email address; later workspaces start without one', async () => {
  dbMock.trialClaim.claimed.clear();
  dbMock.organization.create.mockClear();
  const input = (name: string) => ({
    organization: name,
    project: `${name} site`,
    domain: 'https://acme.com',
    cors: [],
    website: true,
    app: false,
    backend: false,
  });

  await createOnboardingProject(deps, input('First'), 'user_1');
  await createOnboardingProject(deps, input('Second'), 'user_1');

  const [first, second] = dbMock.organization.create.mock.calls.map(
    ([call]) => call.data
  );
  expect(first?.subscriptionPeriodEventsLimit).toBe(1_000_000);
  expect(
    (first?.subscriptionEndsAt as Date).getTime() - Date.now()
  ).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
  expect(second?.subscriptionPeriodEventsLimit).toBe(0);
  expect((second?.subscriptionEndsAt as Date).getTime()).toBeLessThanOrEqual(
    Date.now()
  );
  expect(dbMock.trialClaim.claimed.size).toBe(1);
});

test('self-hosting keeps a trial for every workspace and records no claim', async () => {
  dbMock.trialClaim.claimed.clear();
  dbMock.trialClaim.create.mockClear();
  dbMock.organization.create.mockClear();
  const selfHosted = {
    ...deps,
    config: testCoreConfig({ selfHosted: true }),
  } as typeof deps;
  for (const name of ['One', 'Two']) {
    await createOnboardingProject(
      selfHosted,
      {
        organization: name,
        project: `${name} site`,
        domain: 'https://acme.com',
        cors: [],
        website: true,
        app: false,
        backend: false,
      },
      'user_1'
    );
  }
  const limits = dbMock.organization.create.mock.calls.map(
    ([call]) => call.data.subscriptionPeriodEventsLimit
  );
  expect(limits).toEqual([1_000_000, 1_000_000]);
  expect(dbMock.trialClaim.create).not.toHaveBeenCalled();
});
