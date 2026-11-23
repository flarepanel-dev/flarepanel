import type { Polar } from '@polar-sh/sdk';
import type { validateEvent } from '@polar-sh/sdk/webhooks';

export type IPolarProduct = Awaited<ReturnType<typeof getProduct>>;
export type IPolarPrice = IPolarProduct['prices'][number];

// The SDK is large: it loads on the first billing call, not at Worker startup.
let client: Promise<Polar> | null = null;

function polarClient(): Promise<Polar> {
  client ??= import('@polar-sh/sdk').then(
    ({ Polar: PolarClient }) =>
      new PolarClient({
        accessToken: process.env.POLAR_ACCESS_TOKEN!,
        server:
          process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      })
  );
  return client;
}

/** Verifies a webhook's signature over the raw body and parses it. */
export async function validatePolarEvent(
  ...args: Parameters<typeof validateEvent>
): Promise<ReturnType<typeof validateEvent>> {
  const webhooks = await import('@polar-sh/sdk/webhooks');
  return webhooks.validateEvent(...args);
}

export const getSuccessUrl = (baseUrl: string, organizationId: string) =>
  `${baseUrl}/${organizationId}/billing`;

export async function getProducts() {
  const products = await (await polarClient()).products.list({
    limit: 100,
    isArchived: false,
    sorting: ['price_amount'],
  });
  return products.result.items.filter((product) => !isCustomProduct(product));
}

/** Made for one organization by `create-custom-pricing`; `metadata.organizationId` says which. */
export function isCustomProduct(product: Pick<IPolarProduct, 'metadata'>) {
  return product.metadata.custom === 'true' || product.metadata.custom === true;
}

export async function getProduct(id: string) {
  return (await polarClient()).products.get({ id });
}

export async function createPortal({ customerId }: { customerId: string }) {
  return (await polarClient()).customerSessions.create({
    customerId,
  });
}

export async function createCheckout({
  productId,
  organizationId,
  user,
  ipAddress,
}: {
  productId: string;
  organizationId: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  ipAddress: string | undefined;
}) {
  return (await polarClient()).checkouts.create({
    products: [productId],
    successUrl: getSuccessUrl(
      process.env.DASHBOARD_URL || process.env.NEXT_PUBLIC_DASHBOARD_URL!,
      organizationId
    ),
    customerEmail: user.email,
    customerName: [user.firstName, user.lastName].filter(Boolean).join(' '),
    customerIpAddress: ipAddress,
    metadata: {
      organizationId,
      userId: user.id,
    },
  });
}

export type ICancellationReason =
  | 'too_expensive'
  | 'missing_features'
  | 'switched_service'
  | 'unused'
  | 'customer_service'
  | 'low_quality'
  | 'too_complex'
  | 'other';

export async function cancelSubscription(
  subscriptionId: string,
  cancellation?: {
    reason?: ICancellationReason;
    comment?: string;
  }
) {
  try {
    return await (await polarClient()).subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        cancelAtPeriodEnd: true,
        customerCancellationReason: cancellation?.reason ?? null,
        customerCancellationComment: cancellation?.comment ?? null,
      },
    });
  } catch (error) {
    // Don't throw an error if the subscription is already canceled
    if (
      error instanceof Error &&
      error.name === 'AlreadyCanceledSubscription'
    ) {
      return (await polarClient()).subscriptions.get({ id: subscriptionId });
    }

    throw error;
  }
}

/**
 * Pause an active subscription at the end of the current period. Billing stops
 * but the subscription (and its payment method) is kept, so the customer can
 * come back without a new checkout. `resumesAt` must be after the current
 * period end; omitted means paused until manually resumed.
 */
export async function pauseSubscription(
  subscriptionId: string,
  resumesAt?: Date
) {
  return (await polarClient()).subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      pauseAtPeriodEnd: true,
      resumesAt: resumesAt ?? null,
    },
  });
}

/** Cancel a scheduled pause while the subscription is still active. */
export async function unpauseSubscription(subscriptionId: string) {
  return (await polarClient()).subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      pauseAtPeriodEnd: false,
    },
  });
}

/**
 * Resume an already-paused subscription immediately — starts a new billing
 * period and charges the customer.
 */
export async function resumeSubscription(subscriptionId: string) {
  return (await polarClient()).subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      resume: true,
    },
  });
}

/**
 * Attach a discount to an active subscription. Polar applies it starting with
 * the next billing cycle.
 */
export async function applySubscriptionDiscount(
  subscriptionId: string,
  discountId: string
) {
  return (await polarClient()).subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      discountId,
    },
  });
}

export async function reactivateSubscription(subscriptionId: string) {
  return (await polarClient()).subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      cancelAtPeriodEnd: false,
    },
  });
}

export async function changeSubscription(
  subscriptionId: string,
  productId: string
) {
  return (await polarClient()).subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      productId,
      prorationBehavior: 'invoice',
    },
  });
}
