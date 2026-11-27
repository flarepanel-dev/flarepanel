// Pure helpers for the plan picker: labels, the plan that fits, yearly maths.

/** `5000` → `5K`, `2500000` → `2.5M`. */
export function formatEventVolume(events: number): string {
  if (events >= 1_000_000) {
    return `${Number((events / 1_000_000).toFixed(1))}M`;
  }
  if (events >= 1000) {
    return `${Number((events / 1000).toFixed(1))}K`;
  }
  return String(events);
}

/** The smallest plan that still has room for what was used this period. */
export function recommendedPlanId(
  plans: readonly { id: string; limit: number; disabled?: boolean }[],
  used: number
): string | null {
  const fits = plans
    .filter((plan) => !plan.disabled && plan.limit > used)
    .sort((a, b) => a.limit - b.limit);
  return fits[0]?.id ?? null;
}

/** What a yearly price comes to per month. */
export function monthlyEquivalent(yearlyPrice: number): number {
  return yearlyPrice / 12;
}

/** Share of the trial's events used, 0..100. */
export function usedPercent(used: number, limit: number): number {
  if (limit <= 0) {
    return 100;
  }
  return Math.min(100, Math.round((used / limit) * 100));
}

/** `10` → `$10`, `8.333` → `$8.33`: whole dollars stay short, cents are exact. */
export function formatPlanPrice(amount: number): string {
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount);
}
