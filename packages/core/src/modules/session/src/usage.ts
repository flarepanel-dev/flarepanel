// After each event the owning project's and organization's event counters
// are refreshed, at most once every ten minutes per project, and usage alert emails go
// out at 80% / 100% of the billing limit.

import type { Organization } from '@flarepanel/db/src/prisma-client';
import { cacheablePerDeps } from '../../../cacheable-per-deps';
import { sendEmail } from '../../../clients/email';
import type { ServiceDeps } from '../../../services';
import { STORED_ADMIN_ROLES } from '../../organization/organization.constants';
import { getOrganizationBillingEventsCount } from '../../organization/organization.service';
import { getProjectEventsCount } from '../../project/project.service';

const INT4_MAX = 2_147_483_647;
const USAGE_WARNING_THRESHOLD = 0.8;
// Ten minutes: how long a trial can run past its allowance before it stops.
const UPDATE_EVENTS_COUNT_CACHE_SECONDS = 10 * 60;
const DEFAULT_DASHBOARD_URL = 'https://dashboard.flarepanel.dev';

/** Saturating: the columns are INT4 and lifetime counts can exceed them. */
function clampToInt4(count: number): number {
  return Math.min(count, INT4_MAX);
}

function isFreeTrial(organization: Organization): boolean {
  return (
    organization.subscriptionStatus === 'trialing' &&
    !organization.subscriptionProductId
  );
}

function nextExceededAt(
  organization: Organization,
  count: number,
  selfHosted: boolean
): Date | null {
  // Self-hosting has no billing limits: never flag, and clear any stale flag (default
  // limit 0 trips on the first event).
  if (selfHosted) {
    return null;
  }
  const limit = organization.subscriptionPeriodEventsLimit;
  // A trial is used up at its limit; a plan is exceeded past it.
  const over = isFreeTrial(organization) ? count >= limit : count > limit;
  if (!over) {
    return null;
  }
  return organization.subscriptionPeriodEventsCountExceededAt ?? new Date();
}

export const updateEventsCount = cacheablePerDeps(
  'updateEventsCount',
  async (deps: ServiceDeps, projectId: string): Promise<true | undefined> => {
    const logger = deps.logger;
    const db = deps.db;
    const organization = await db.organization.findFirst({
      where: { projects: { some: { id: projectId } } },
      include: { projects: true },
    });

    if (!organization) {
      return;
    }

    const organizationEventsCount = await getOrganizationBillingEventsCount(
      deps,
      organization
    );
    const projectEventsCount = await getProjectEventsCount(deps, projectId);

    if (projectEventsCount) {
      // Only a sort key and activity threshold, never billing — clamping is safe.
      await db.project.update({
        where: { id: projectId },
        data: { eventsCount: clampToInt4(projectEventsCount) },
      });
    }

    if (organizationEventsCount) {
      await db.organization.update({
        where: { id: organization.id },
        data: {
          subscriptionPeriodEventsCount: clampToInt4(organizationEventsCount),
          subscriptionPeriodEventsCountExceededAt: nextExceededAt(
            organization,
            organizationEventsCount,
            deps.config.selfHosted
          ),
        },
      });

      if (!deps.config.selfHosted) {
        try {
          await sendUsageAlerts(deps, organization, organizationEventsCount);
        } catch (error) {
          logger.error({ err: error }, 'Failed to send usage alert emails');
        }
      }
    }

    return true;
  },
  UPDATE_EVENTS_COUNT_CACHE_SECONDS
);

/**
 * One warning at 80% and one notice at 100% per billing cycle. The sent-at
 * markers are cleared by the Polar webhook when a new cycle resets the usage
 * counter (or the limit is raised), so each cycle can alert again.
 */
async function sendUsageAlerts(
  deps: ServiceDeps,
  organization: Organization,
  count: number
) {
  const logger = deps.logger;
  const limit = organization.subscriptionPeriodEventsLimit;
  if (!limit || limit <= 0) {
    return;
  }

  const isTrial = isFreeTrial(organization);
  const exceeded =
    (isTrial ? count >= limit : count > limit) &&
    !organization.usageExceededSentAt;
  const nearLimit =
    !exceeded &&
    count >= limit * USAGE_WARNING_THRESHOLD &&
    (isTrial ? count < limit : count <= limit) &&
    !organization.usageWarningSentAt;

  if (!(exceeded || nearLimit)) {
    return;
  }

  const db = deps.db;

  // Claim the alert atomically BEFORE sending: session jobs for different
  // projects of the same org can run concurrently, and both would otherwise
  // read null markers and double-send. Marking the warning together with the
  // exceeded notice keeps a both-thresholds-in-one-jump crossing from queueing
  // a redundant warning afterwards. Rolled back if every send fails.
  const claimedAt = new Date();
  const claimed = await db.organization.updateMany({
    where: {
      id: organization.id,
      ...(exceeded
        ? { usageExceededSentAt: null }
        : { usageWarningSentAt: null }),
    },
    data: exceeded
      ? { usageExceededSentAt: claimedAt, usageWarningSentAt: claimedAt }
      : { usageWarningSentAt: claimedAt },
  });
  if (claimed.count === 0) {
    return;
  }

  try {
    const admins = await db.member.findMany({
      where: {
        organizationId: organization.id,
        role: { in: STORED_ADMIN_ROLES },
        user: { deletedAt: null },
      },
      include: { user: { select: { email: true, firstName: true } } },
    });

    const billingUrl = `${deps.config.dashboardUrl || DEFAULT_DASHBOARD_URL}/${organization.id}/billing`;
    const recipients = new Map<string, string | undefined>();
    for (const member of admins) {
      if (member.user?.email) {
        recipients.set(member.user.email, member.user.firstName ?? undefined);
      }
    }

    let failedRecipients = 0;
    for (const [email, firstName] of recipients) {
      // One bad address must not abort the loop or roll back the claim —
      // that would re-email the recipients that succeeded.
      try {
        if (exceeded) {
          await sendEmail('usage-limit-exceeded', {
            to: email,
            data: {
              firstName,
              organizationName: organization.name,
              billingUrl,
              eventsLimit: limit,
              isTrial,
            },
          });
        } else {
          await sendEmail('usage-near-limit', {
            to: email,
            data: {
              firstName,
              organizationName: organization.name,
              billingUrl,
              eventsCount: count,
              eventsLimit: limit,
              isTrial,
            },
          });
        }
      } catch (error) {
        failedRecipients++;
        logger.error(
          { err: error, organizationId: organization.id, recipient: email },
          'Failed to send usage alert to recipient'
        );
      }
    }

    logger.info(
      {
        organizationId: organization.id,
        count,
        limit,
        kind: exceeded ? 'exceeded' : 'near-limit',
        recipients: recipients.size,
        failedRecipients,
      },
      'Sent usage alert emails'
    );
  } catch (error) {
    // Release the claim so the next usage update retries the alert.
    await db.organization.updateMany({
      where: { id: organization.id },
      data: exceeded
        ? {
            usageExceededSentAt: null,
            usageWarningSentAt: organization.usageWarningSentAt,
          }
        : { usageWarningSentAt: null },
    });
    throw error;
  }
}
