import { describe, expect, it } from 'vitest';
import {
  formatEventVolume,
  formatPlanPrice,
  monthlyEquivalent,
  recommendedPlanId,
  usedPercent,
} from './billing-plans';

describe('billing plans', () => {
  it('formats event volumes', () => {
    expect(formatEventVolume(5000)).toBe('5K');
    expect(formatEventVolume(250_000)).toBe('250K');
    expect(formatEventVolume(2_500_000)).toBe('2.5M');
    expect(formatEventVolume(50_000_000)).toBe('50M');
  });

  it('recommends the smallest plan with room for the usage', () => {
    const plans = [
      { id: 'c', limit: 100_000 },
      { id: 'a', limit: 5000 },
      { id: 'b', limit: 10_000 },
    ];
    expect(recommendedPlanId(plans, 0)).toBe('a');
    expect(recommendedPlanId(plans, 5000)).toBe('b');
    expect(recommendedPlanId(plans, 60_000)).toBe('c');
    expect(recommendedPlanId(plans, 100_000)).toBeNull();
    expect(
      recommendedPlanId([{ id: 'a', limit: 5000, disabled: true }], 0)
    ).toBeNull();
  });

  it('works out yearly per month and the share used', () => {
    expect(monthlyEquivalent(100)).toBeCloseTo(8.33, 2);
    expect(usedPercent(50, 100_000)).toBe(0);
    expect(usedPercent(60_000, 100_000)).toBe(60);
    expect(usedPercent(120, 100)).toBe(100);
    expect(usedPercent(0, 0)).toBe(100);
  });

  it('shows whole dollars short and cents in full', () => {
    expect(formatPlanPrice(10)).toBe('$10');
    expect(formatPlanPrice(100 / 12)).toBe('$8.33');
    expect(formatPlanPrice(1250)).toBe('$1,250');
  });
});
