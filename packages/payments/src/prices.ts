export type { ProductPrice } from '@polar-sh/sdk/models/components/productprice.js';

function formatEventsCount(events: number) {
  return new Intl.NumberFormat('en-gb', {
    notation: 'compact',
  }).format(events);
}

export type IPrice = {
  price: number;
  events: number;
  discount?: {
    code: string;
    amount: number;
    id: string;
  };
  popular?: boolean;
};

// FlarePanel's plans (2026-11-24): OpenPanel's shape (monthly events, every
// feature in every plan) at about half its prices. Yearly plans cost 10 months
// (scripts/create-products.ts). The 5K entry plan at $1 is the door in: Polar
// keeps about $0.44 of each monthly payment, so it is meant to be outgrown.
// apps/landing/src/lib/pricing.ts mirrors this list for the public page.
export const PRICING: IPrice[] = [
  { price: 1, events: 5000 },
  { price: 3, events: 10_000 },
  { price: 10, events: 100_000, popular: true },
  { price: 15, events: 250_000 },
  { price: 25, events: 500_000 },
  { price: 45, events: 1_000_000 },
  { price: 90, events: 2_500_000 },
  { price: 125, events: 5_000_000 },
  { price: 175, events: 10_000_000 },
  { price: 265, events: 20_000_000 },
  { price: 340, events: 30_000_000 },
  { price: 400, events: 40_000_000 },
  { price: 450, events: 50_000_000 },
];

/**
 * Polar products of a free plan, whose organizations see the "free plan"
 * prompt. FlarePanel has no free plan (a 30-day trial instead); OpenPanel's
 * product ids were removed. Comma-separated ids in POLAR_FREE_PRODUCT_IDS
 * add some back if a free plan ever exists.
 */
export const FREE_PRODUCT_IDS: string[] = (
  (typeof process !== 'undefined' && process.env?.POLAR_FREE_PRODUCT_IDS) ||
  ''
)
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

export function getRecommendedPlan<T>(
  monthlyEvents: number | undefined | null,
  cb: (
    options: {
      formattedEvents: string;
      formattedPrice: string;
    } & IPrice
  ) => T
): T | undefined {
  if (!monthlyEvents) {
    return undefined;
  }
  const price = PRICING.find((price) => price.events >= monthlyEvents);
  if (!price) {
    return undefined;
  }
  return cb({
    ...price,
    formattedEvents: formatEventsCount(price.events),
    formattedPrice: Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.price),
  });
}
