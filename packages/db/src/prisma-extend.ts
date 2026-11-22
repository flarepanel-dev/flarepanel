/**
 * FlarePanel's Prisma client setup, shared by the Bun client
 * (`prisma-client.ts`) and the Workers client (`prisma-client.workerd.ts`):
 * error/warn logging and the computed organization fields. It imports the
 * generated client as a TYPE only, so the Workers bundle never pulls in the
 * Bun query engine.
 */

import { getSubscriptionState } from '@flarepanel/payments/subscription-state';
import type { PrismaClient } from './generated/prisma/client';
import { logger } from './logger';

const subscriptionStateNeeds = {
  subscriptionStatus: true,
  subscriptionCanceledAt: true,
  subscriptionEndsAt: true,
  subscriptionPauseAtPeriodEnd: true,
} as const;

export function extendPrismaClient(client: PrismaClient<'error' | 'warn'>) {
  // $on only exists on the base client — keep it before $extends.
  client.$on('error', (event) => {
    logger.error({ target: event.target }, `prisma: ${event.message}`);
  });
  client.$on('warn', (event) => {
    logger.warn({ target: event.target }, `prisma: ${event.message}`);
  });

  const prisma = client.$extends({
    result: {
      organization: {
        subscriptionState: {
          needs: subscriptionStateNeeds,
          compute(org) {
            return getSubscriptionState(org);
          },
        },
        subscriptionStatus: {
          needs: { subscriptionStatus: true, subscriptionCanceledAt: true },
          compute(org) {
            if (process.env.SELF_HOSTED === 'true') {
              return 'active';
            }

            return org.subscriptionStatus || 'trialing';
          },
        },
        hasSubscription: {
          needs: subscriptionStateNeeds,
          compute(org) {
            const state = getSubscriptionState(org);
            return (
              state === 'active' ||
              state === 'canceling' ||
              state === 'pausing' ||
              state === 'paused' ||
              state === 'past_due' ||
              state === 'unpaid' ||
              state === 'incomplete'
            );
          },
        },
        slug: {
          needs: { id: true },
          compute(org) {
            return org.id;
          },
        },
        subscriptionChartEndDate: {
          needs: {
            subscriptionEndsAt: true,
            subscriptionPeriodEventsCountExceededAt: true,
          },
          compute(org) {
            if (process.env.SELF_HOSTED === 'true') {
              return null;
            }

            if (
              org.subscriptionEndsAt &&
              org.subscriptionPeriodEventsCountExceededAt
            ) {
              return org.subscriptionEndsAt >
                org.subscriptionPeriodEventsCountExceededAt
                ? org.subscriptionPeriodEventsCountExceededAt
                : org.subscriptionEndsAt;
            }

            if (org.subscriptionEndsAt) {
              return org.subscriptionEndsAt;
            }

            return new Date(Date.now() + 1000 * 60 * 60 * 24);
          },
        },
        isActive: {
          needs: subscriptionStateNeeds,
          compute(org) {
            const state = getSubscriptionState(org);
            return state === 'active' || state === 'self_hosted';
          },
        },
        isTrial: {
          needs: subscriptionStateNeeds,
          compute(org) {
            return getSubscriptionState(org) === 'trialing';
          },
        },
        isCanceled: {
          needs: subscriptionStateNeeds,
          compute(org) {
            return getSubscriptionState(org) === 'canceled';
          },
        },
        isWillBeCanceled: {
          needs: subscriptionStateNeeds,
          compute(org) {
            return getSubscriptionState(org) === 'canceling';
          },
        },
        isExpired: {
          needs: subscriptionStateNeeds,
          compute(org) {
            const state = getSubscriptionState(org);
            return state === 'expired' || state === 'trial_expired';
          },
        },
        isExceeded: {
          needs: {
            subscriptionPeriodEventsCount: true,
            subscriptionPeriodEventsLimit: true,
          },
          compute(org) {
            if (process.env.SELF_HOSTED === 'true') {
              return false;
            }

            return (
              org.subscriptionPeriodEventsCount >
              org.subscriptionPeriodEventsLimit
            );
          },
        },
        subscriptionCurrentPeriodStart: {
          needs: { subscriptionStartsAt: true, subscriptionInterval: true },
          compute(org) {
            if (process.env.SELF_HOSTED === 'true') {
              return null;
            }

            if (!org.subscriptionStartsAt) {
              return null;
            }

            if (org.subscriptionInterval === 'year') {
              const startDay = org.subscriptionStartsAt.getUTCDate();
              const now = new Date();
              return new Date(
                Date.UTC(
                  now.getUTCFullYear(),
                  now.getUTCMonth(),
                  startDay,
                  0,
                  0,
                  0,
                  0
                )
              );
            }

            return org.subscriptionStartsAt;
          },
        },
        subscriptionCurrentPeriodEnd: {
          needs: {
            subscriptionStartsAt: true,
            subscriptionEndsAt: true,
            subscriptionInterval: true,
          },
          compute(org) {
            if (process.env.SELF_HOSTED === 'true') {
              return null;
            }

            if (!org.subscriptionStartsAt) {
              return null;
            }

            if (org.subscriptionInterval === 'year') {
              const startDay = org.subscriptionStartsAt.getUTCDate();
              const now = new Date();
              return new Date(
                Date.UTC(
                  now.getUTCFullYear(),
                  now.getUTCMonth() + 1,
                  startDay - 1,
                  0,
                  0,
                  0,
                  0
                )
              );
            }

            return org.subscriptionEndsAt;
          },
        },
      },
    },
  });

  return prisma;
}

export type FlarepanelPrismaClient = ReturnType<typeof extendPrismaClient>;
