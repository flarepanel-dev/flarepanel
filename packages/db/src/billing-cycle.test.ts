import { describe, expect, it } from 'bun:test';
import { yearlyPlanCycle } from './billing-cycle';

const iso = (d: Date) => d.toISOString();

describe('yearlyPlanCycle', () => {
  const startedOn28th = new Date('2026-01-28T10:00:00Z');

  it('uses last month’s cycle before the start day', () => {
    const cycle = yearlyPlanCycle(
      startedOn28th,
      new Date('2026-11-27T12:00:00Z')
    );
    expect(iso(cycle.start)).toBe('2026-10-28T00:00:00.000Z');
    expect(iso(cycle.end)).toBe('2026-11-27T23:59:59.999Z');
  });

  it('starts a new cycle on the start day', () => {
    const cycle = yearlyPlanCycle(
      startedOn28th,
      new Date('2026-11-28T00:00:01Z')
    );
    expect(iso(cycle.start)).toBe('2026-11-28T00:00:00.000Z');
    expect(iso(cycle.end)).toBe('2026-12-27T23:59:59.999Z');
  });

  it('clamps to short months', () => {
    const cycle = yearlyPlanCycle(
      new Date('2026-01-31T00:00:00Z'),
      new Date('2026-02-28T12:00:00Z')
    );
    expect(iso(cycle.start)).toBe('2026-02-28T00:00:00.000Z');
    expect(iso(cycle.end)).toBe('2026-03-30T23:59:59.999Z');
  });

  it('crosses the year boundary', () => {
    const cycle = yearlyPlanCycle(
      startedOn28th,
      new Date('2027-01-05T00:00:00Z')
    );
    expect(iso(cycle.start)).toBe('2026-12-28T00:00:00.000Z');
    expect(iso(cycle.end)).toBe('2027-01-27T23:59:59.999Z');
  });
});
