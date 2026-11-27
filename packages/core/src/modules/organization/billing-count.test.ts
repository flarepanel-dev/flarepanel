// What a workspace's usage counter counts: the Polar billing period on a
// plan, and every event since creation on a trial.
import { describe, expect, it, mock } from 'bun:test';
import { getOrganizationBillingEventsCount } from './organization.service';

function deps() {
  const countEvents = mock(
    async (_projectId: string, _from: Date, _to: Date) => 7
  );
  return {
    countEvents,
    deps: { eventStore: { countEvents } } as never,
  };
}

const created = new Date('2026-11-27T10:00:00Z');

describe('getOrganizationBillingEventsCount', () => {
  it('counts a trial from creation until now, also after it ended', async () => {
    const { deps: d, countEvents } = deps();
    const count = await getOrganizationBillingEventsCount(d, {
      subscriptionStatus: 'trialing',
      subscriptionCurrentPeriodStart: null,
      subscriptionCurrentPeriodEnd: null,
      createdAt: created,
      // A workspace without a trial: it ended at creation.
      subscriptionEndsAt: created,
      projects: [{ id: 'p1' }, { id: 'p2' }],
    } as never);
    expect(count).toBe(14);
    const [, from, to] = countEvents.mock.calls[0] ?? [];
    expect(from).toEqual(created);
    expect((to as Date).getTime()).toBeGreaterThan(Date.now() - 5000);
  });

  it('counts a plan over its billing period', async () => {
    const { deps: d, countEvents } = deps();
    const start = new Date('2026-11-27T11:20:00Z');
    const end = new Date('2026-12-27T11:20:00Z');
    await getOrganizationBillingEventsCount(d, {
      subscriptionStatus: 'active',
      subscriptionCurrentPeriodStart: start,
      subscriptionCurrentPeriodEnd: end,
      createdAt: created,
      subscriptionEndsAt: end,
      projects: [{ id: 'p1' }],
    } as never);
    expect(countEvents.mock.calls[0]).toEqual(['p1', start, end]);
  });
});
