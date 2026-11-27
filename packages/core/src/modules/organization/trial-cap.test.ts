import { describe, expect, it } from 'bun:test';
import { getTrialCap } from './organization.service';

function deps(organization: unknown) {
  return {
    db: { project: { findUnique: async () => ({ organization }) } },
  } as never;
}

const projects = [
  { id: 'p1', eventsCount: 40 },
  { id: 'p2', eventsCount: 25 },
  { id: 'p3', eventsCount: null },
];

describe('getTrialCap', () => {
  it('caps a trial at its limit, less what the other projects recorded', async () => {
    expect(
      await getTrialCap(
        deps({
          subscriptionStatus: 'trialing',
          subscriptionProductId: null,
          subscriptionPeriodEventsLimit: 100_000,
          projects,
        }),
        'p1'
      )
    ).toEqual({ limit: 100_000, others: 25 });
  });

  it('has no cap on a paid plan or for an unknown project', async () => {
    expect(
      await getTrialCap(
        deps({
          subscriptionStatus: 'active',
          subscriptionProductId: 'prod',
          subscriptionPeriodEventsLimit: 5000,
          projects,
        }),
        'p1'
      )
    ).toBeNull();
    expect(await getTrialCap(deps(null), 'p1')).toBeNull();
  });
});
