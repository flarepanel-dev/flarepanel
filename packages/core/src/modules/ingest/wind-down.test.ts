/**
 * Tests for `isIngestionWoundDown` — the gate that stops ingestion for
 * organizations blocked by the wind-down sequence.
 *
 * Three behaviours matter: it gates on the wind-down STEP rather than the
 * subscription state (so an expired trial keeps ingesting until it has actually
 * been warned), the caller answers 202 rather than a 4xx (the SDKs retry
 * everything except 401 and 2xx), and it fails open. `SELF_HOSTED` is a
 * `selfHosted` argument: core reads no environment.
 */

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from 'bun:test';
import type { Logger } from '../../logger';
import type { ServiceDeps } from '../../services';

const getOrganizationByProjectIdCached = mock(
  async (_deps: unknown, _projectId: string): Promise<unknown> => null
);

/** The gate only threads `deps` through to the organization lookup, which is
 *  mocked, so an opaque marker is enough to assert it arrives. */
const deps = { marker: 'service-deps' } as unknown as ServiceDeps;

// Spread a plain-object SNAPSHOT of the real module: a partial factory
// replaces the whole module process-wide, and every other importer of it then
// fails on a missing export. The snapshot (not the live import binding) is
// what makes the afterAll restore real rather than a re-application of this
// mock — see AGENTS.md.
const realOrganizationService = {
  ...(await import('../organization/organization.service')),
};
mock.module('../organization/organization.service', () => ({
  ...realOrganizationService,
  getOrganizationByProjectIdCached,
}));

afterAll(() => {
  mock.module(
    '../organization/organization.service',
    () => realOrganizationService
  );
});

let isIngestionWoundDown: typeof import('./ingest.service').isIngestionWoundDown;

beforeAll(async () => {
  ({ isIngestionWoundDown } = await import('./ingest.service'));
});

function makeLogger() {
  const calls = { info: 0, warn: 0, error: 0 };
  const noop = () => undefined;
  const logger = {
    info: () => {
      calls.info++;
    },
    warn: () => {
      calls.warn++;
    },
    error: () => {
      calls.error++;
    },
    debug: noop,
    trace: noop,
    fatal: noop,
    child: () => logger,
  } as unknown as Logger;
  return { logger, calls };
}

beforeEach(() => {
  getOrganizationByProjectIdCached.mockReset();
});

describe('isIngestionWoundDown', () => {
  for (const windDownStep of ['blocked', 'final_warning']) {
    it(`blocks ingestion at step ${windDownStep}`, async () => {
      getOrganizationByProjectIdCached.mockResolvedValue({
        id: 'org-1',
        windDownStep,
      });
      const { logger } = makeLogger();

      expect(
        await isIngestionWoundDown(deps, {
          projectId: 'proj-1',
          selfHosted: false,
          logger,
        })
      ).toBe(true);
      expect(getOrganizationByProjectIdCached).toHaveBeenCalledWith(
        deps,
        'proj-1'
      );
    });
  }

  for (const windDownStep of ['expired_notice', 'stopping_soon']) {
    it(`still accepts ingestion at step ${windDownStep}`, async () => {
      getOrganizationByProjectIdCached.mockResolvedValue({
        id: 'org-1',
        windDownStep,
      });
      const { logger } = makeLogger();

      expect(
        await isIngestionWoundDown(deps, {
          projectId: 'proj-1',
          selfHosted: false,
          logger,
        })
      ).toBe(false);
      expect(getOrganizationByProjectIdCached).toHaveBeenCalled();
    });
  }

  it('accepts ingestion from an expired trial that has not been warned yet', async () => {
    // The reason the gate reads windDownStep and not subscriptionState: every
    // lapsed trial is already trial_expired, so gating on state would block
    // thousands of orgs at once.
    getOrganizationByProjectIdCached.mockResolvedValue({
      id: 'org-1',
      subscriptionState: 'trial_expired',
      windDownStep: null,
    });
    const { logger } = makeLogger();

    expect(
      await isIngestionWoundDown(deps, {
        projectId: 'proj-1',
        selfHosted: false,
        logger,
      })
    ).toBe(false);
  });

  it('fails open when the organization lookup throws', async () => {
    getOrganizationByProjectIdCached.mockRejectedValue(new Error('redis down'));
    const { logger, calls } = makeLogger();

    expect(
      await isIngestionWoundDown(deps, {
        projectId: 'proj-1',
        selfHosted: false,
        logger,
      })
    ).toBe(false);
    expect(calls.error).toBe(1);
  });

  it('does nothing when self hosted', async () => {
    const { logger } = makeLogger();

    expect(
      await isIngestionWoundDown(deps, {
        projectId: 'proj-1',
        selfHosted: true,
        logger,
      })
    ).toBe(false);
    expect(getOrganizationByProjectIdCached).not.toHaveBeenCalled();
  });

  it('does nothing without a resolved client project', async () => {
    const { logger } = makeLogger();

    expect(
      await isIngestionWoundDown(deps, {
        projectId: null,
        selfHosted: false,
        logger,
      })
    ).toBe(false);
    expect(getOrganizationByProjectIdCached).not.toHaveBeenCalled();
  });

  describe('free trial over its allowance', () => {
    const trial = {
      id: 'org-1',
      windDownStep: null,
      subscriptionStatus: 'trialing',
      subscriptionProductId: null,
      subscriptionPeriodEventsLimit: 1_000_000,
      subscriptionPeriodEventsCount: 1_000_001,
      subscriptionPeriodEventsCountExceededAt: new Date('2026-11-27'),
    };
    const check = async () =>
      isIngestionWoundDown(deps, {
        projectId: 'proj-1',
        selfHosted: false,
        logger: makeLogger().logger,
      });

    it('stops collecting for a trial over its limit', async () => {
      getOrganizationByProjectIdCached.mockResolvedValue(trial);
      expect(await check()).toBe(true);
    });

    it('stops a workspace that started without a trial (limit 0)', async () => {
      getOrganizationByProjectIdCached.mockResolvedValue({
        ...trial,
        subscriptionPeriodEventsLimit: 0,
        subscriptionPeriodEventsCount: 3,
      });
      expect(await check()).toBe(true);
    });

    it('keeps collecting for a trial under its limit', async () => {
      getOrganizationByProjectIdCached.mockResolvedValue({
        ...trial,
        subscriptionPeriodEventsCount: 999_999,
        subscriptionPeriodEventsCountExceededAt: null,
      });
      expect(await check()).toBe(false);
    });

    it('keeps collecting for a paid plan over its limit (only charts pause)', async () => {
      getOrganizationByProjectIdCached.mockResolvedValue({
        ...trial,
        subscriptionStatus: 'active',
        subscriptionProductId: 'prod_1',
      });
      expect(await check()).toBe(false);
    });

    it('never blocks when self-hosted', async () => {
      getOrganizationByProjectIdCached.mockResolvedValue(trial);
      expect(
        await isIngestionWoundDown(deps, {
          projectId: 'proj-1',
          selfHosted: true,
          logger: makeLogger().logger,
        })
      ).toBe(false);
    });
  });
});
