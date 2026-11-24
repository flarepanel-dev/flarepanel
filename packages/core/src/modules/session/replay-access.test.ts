import { describe, expect, it } from 'bun:test';
import { MemoryCoordinationStore } from '@flarepanel/platform';
import {
  countRecordedSession,
  HOSTED_REPLAY_MONTHLY_SESSIONS,
  type ReplayAccessOrganization,
  recordedSessionsThisMonth,
  replayAccessConfig,
  replayAccessFor,
} from './replay-access';

const org = (
  overrides: Partial<ReplayAccessOrganization> = {}
): ReplayAccessOrganization => ({
  id: 'o1',
  replayEnabled: null,
  replaySessionsLimit: null,
  subscriptionStatus: null,
  subscriptionProductId: null,
  ...overrides,
});
const hosted = replayAccessConfig({ FLAREPANEL_REPLAY_REQUIRES_PLAN: 'true' });
const selfHosted = replayAccessConfig({});

describe('replay access config', () => {
  it('self-hosted records without a plan or a cap; hosted caps at 5,000', () => {
    expect(selfHosted).toEqual({ requiresPlan: false, monthlySessions: null });
    expect(hosted).toEqual({
      requiresPlan: true,
      monthlySessions: HOSTED_REPLAY_MONTHLY_SESSIONS,
    });
    expect(
      replayAccessConfig({
        FLAREPANEL_REPLAY_REQUIRES_PLAN: 'true',
        FLAREPANEL_REPLAY_MONTHLY_SESSIONS: '200',
      }).monthlySessions
    ).toBe(200);
    expect(
      replayAccessConfig({ FLAREPANEL_REPLAY_MONTHLY_SESSIONS: '0' })
        .monthlySessions
    ).toBeNull();
  });
});

describe('replay access', () => {
  it('self-hosted: on unless an organization is switched off', () => {
    expect(replayAccessFor(org(), selfHosted)).toEqual({
      allowed: true,
      limit: null,
    });
    expect(replayAccessFor(org({ replayEnabled: false }), selfHosted)).toEqual(
      { allowed: false, reason: 'plan' }
    );
  });

  it('hosted: a paid plan or the manual switch, never a trial', () => {
    expect(replayAccessFor(org(), hosted).allowed).toBe(false);
    expect(
      replayAccessFor(
        org({ subscriptionStatus: 'trialing', subscriptionProductId: 'p' }),
        hosted
      ).allowed
    ).toBe(false);
    expect(
      replayAccessFor(
        org({ subscriptionStatus: 'active', subscriptionProductId: 'p' }),
        hosted
      )
    ).toEqual({ allowed: true, limit: HOSTED_REPLAY_MONTHLY_SESSIONS });
    expect(replayAccessFor(org({ replayEnabled: true }), hosted).allowed).toBe(
      true
    );
    // The switch also turns a paying organization off.
    expect(
      replayAccessFor(
        org({
          replayEnabled: false,
          subscriptionStatus: 'active',
          subscriptionProductId: 'p',
        }),
        hosted
      ).allowed
    ).toBe(false);
  });

  it("an organization's own limit wins; 0 is unlimited", () => {
    expect(
      replayAccessFor(
        org({ replayEnabled: true, replaySessionsLimit: 20_000 }),
        hosted
      )
    ).toEqual({ allowed: true, limit: 20_000 });
    expect(
      replayAccessFor(org({ replayEnabled: true, replaySessionsLimit: 0 }), hosted)
    ).toEqual({ allowed: true, limit: null });
  });
});

describe('monthly count', () => {
  it('counts per organization and calendar month', async () => {
    const store = new MemoryCoordinationStore();
    const nov = new Date('2026-11-24T10:00:00Z');
    const dec = new Date('2026-12-01T00:00:00Z');
    expect(await countRecordedSession(store, 'o1', nov)).toBe(1);
    expect(await countRecordedSession(store, 'o1', nov)).toBe(2);
    expect(await countRecordedSession(store, 'o2', nov)).toBe(1);
    expect(await recordedSessionsThisMonth(store, 'o1', nov)).toBe(2);
    expect(await recordedSessionsThisMonth(store, 'o1', dec)).toBe(0);
  });
});
