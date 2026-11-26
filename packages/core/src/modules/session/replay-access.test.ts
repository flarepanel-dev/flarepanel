import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { MemoryCoordinationStore } from '@flarepanel/platform';
import {
  countRecordedSession,
  planReplayLimit,
  type ReplayAccessOrganization,
  recordedSessionsThisMonth,
  replayAccessConfig,
  replayAccessFor,
  SELF_HOSTED_REPLAY_MONTHLY_SESSIONS,
  TRIAL_REPLAY_MONTHLY_SESSIONS,
} from './replay-access';

const DAY = 24 * 60 * 60 * 1000;
const future = () => new Date(Date.now() + 10 * DAY);
const past = () => new Date(Date.now() - 10 * DAY);

const org = (
  overrides: Partial<ReplayAccessOrganization> = {}
): ReplayAccessOrganization => ({
  id: 'o1',
  replayEnabled: null,
  replaySessionsLimit: null,
  subscriptionStatus: null,
  subscriptionCanceledAt: null,
  subscriptionEndsAt: null,
  subscriptionPauseAtPeriodEnd: false,
  subscriptionPeriodEventsLimit: 0,
  ...overrides,
});
const hosted = replayAccessConfig(false, {});
const selfHosted = replayAccessConfig(true, {});

describe('replay access config', () => {
  it('follows the deployment switch; self-hosted caps at 10,000 unless changed', () => {
    expect(hosted.hosted).toBe(true);
    expect(selfHosted).toEqual({
      hosted: false,
      selfHostedMonthlySessions: SELF_HOSTED_REPLAY_MONTHLY_SESSIONS,
    });
    expect(
      replayAccessConfig(true, { FLAREPANEL_REPLAY_MONTHLY_SESSIONS: '200' })
        .selfHostedMonthlySessions
    ).toBe(200);
    expect(
      replayAccessConfig(true, { FLAREPANEL_REPLAY_MONTHLY_SESSIONS: '0' })
        .selfHostedMonthlySessions
    ).toBeNull();
  });
});

describe('self-hosted', () => {
  it('every organization records, up to the install limit', () => {
    expect(replayAccessFor(org(), selfHosted)).toEqual({
      allowed: true,
      limit: SELF_HOSTED_REPLAY_MONTHLY_SESSIONS,
    });
    expect(
      replayAccessFor(org({ replaySessionsLimit: 0 }), selfHosted)
    ).toEqual({ allowed: true, limit: null });
    expect(replayAccessFor(org({ replayEnabled: false }), selfHosted)).toEqual({
      allowed: false,
      reason: 'off',
    });
  });
});

describe('hosted', () => {
  // The test preload runs everything as self-hosted; these need the cloud.
  const saved = process.env.SELF_HOSTED;
  beforeEach(() => {
    // biome-ignore lint/performance/noDelete: an unset variable, not 'undefined'.
    delete process.env.SELF_HOSTED;
  });
  afterEach(() => {
    process.env.SELF_HOSTED = saved;
  });

  it('a running trial records with the trial limit', () => {
    expect(
      replayAccessFor(org({ subscriptionEndsAt: future() }), hosted)
    ).toEqual({ allowed: true, limit: TRIAL_REPLAY_MONTHLY_SESSIONS });
  });

  it('an ended trial, cancellation or unpaid plan does not record', () => {
    for (const ended of [
      org({ subscriptionEndsAt: past() }),
      org({ subscriptionStatus: 'canceled' }),
      org({ subscriptionStatus: 'unpaid' }),
      org({ subscriptionStatus: 'paused' }),
    ]) {
      expect(replayAccessFor(ended, hosted)).toEqual({
        allowed: false,
        reason: 'plan',
      });
    }
  });

  it('a paid plan records one session per 100 plan events, 1,000 to 100,000', () => {
    const plan = (eventsLimit: number) =>
      org({
        subscriptionStatus: 'active',
        subscriptionEndsAt: future(),
        subscriptionPeriodEventsLimit: eventsLimit,
      });
    expect(replayAccessFor(plan(1_000_000), hosted)).toEqual({
      allowed: true,
      limit: 10_000,
    });
    expect(planReplayLimit(plan(5000), 'active')).toBe(1000);
    expect(planReplayLimit(plan(50_000_000), 'active')).toBe(100_000);
    // Canceling keeps recording until the period ends.
    expect(
      replayAccessFor(
        org({
          subscriptionStatus: 'active',
          subscriptionCanceledAt: past(),
          subscriptionEndsAt: future(),
          subscriptionPeriodEventsLimit: 100_000,
        }),
        hosted
      ).allowed
    ).toBe(true);
  });

  it('the manual switch and an own limit override the plan', () => {
    expect(replayAccessFor(org({ replayEnabled: true }), hosted)).toEqual({
      allowed: true,
      limit: 1000,
    });
    expect(
      replayAccessFor(
        org({ replayEnabled: true, replaySessionsLimit: 25_000 }),
        hosted
      )
    ).toEqual({ allowed: true, limit: 25_000 });
    expect(
      replayAccessFor(
        org({
          replayEnabled: false,
          subscriptionStatus: 'active',
          subscriptionEndsAt: future(),
        }),
        hosted
      )
    ).toEqual({ allowed: false, reason: 'off' });
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
