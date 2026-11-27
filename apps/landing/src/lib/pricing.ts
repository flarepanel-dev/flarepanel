// The hosted plans, mirrored from packages/payments/src/prices.ts (the list
// Polar products are created from). Keep the two in step.

export interface Plan {
  events: number;
  monthly: number;
  popular?: boolean;
}

export const PLANS: Plan[] = [
  { events: 5000, monthly: 1 },
  { events: 10_000, monthly: 3 },
  { events: 100_000, monthly: 10, popular: true },
  { events: 250_000, monthly: 15 },
  { events: 500_000, monthly: 25 },
  { events: 1_000_000, monthly: 45 },
  { events: 2_500_000, monthly: 90 },
  { events: 5_000_000, monthly: 125 },
  { events: 10_000_000, monthly: 175 },
  { events: 20_000_000, monthly: 265 },
  { events: 30_000_000, monthly: 340 },
  { events: 40_000_000, monthly: 400 },
  { events: 50_000_000, monthly: 450 },
];

/** Yearly plans cost ten months. */
export const yearly = (plan: Plan) => plan.monthly * 10;

export const TRIAL_DAYS = 30;
export const TRIAL_EVENTS = 100_000;

export function formatEvents(events: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(events);
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
