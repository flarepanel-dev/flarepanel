import type { IServiceOrganization } from '@flarepanel/core';
import { differenceInDays } from 'date-fns';
import { usedPercent } from './billing-plans';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNumber } from '@/hooks/use-numer-formatter';

/** Past this, "N days left" stops meaning anything; only the usage is shown. */
const LONG_TRIAL_DAYS = 60;
/** From here on the strip asks for attention. */
const NEARLY_USED_PERCENT = 80;
const LAST_DAYS = 5;

/**
 * The free trial at a glance, on every workspace page: days left, events
 * used, and the way to a plan. One quiet line, not a banner.
 */
export function TrialStrip({
  organization,
}: {
  organization: IServiceOrganization;
}) {
  const number = useNumber();
  const limit = organization.subscriptionPeriodEventsLimit;
  const used = Math.min(organization.subscriptionPeriodEventsCount, limit);
  const percent = usedPercent(used, limit);
  const daysLeft = organization.subscriptionEndsAt
    ? differenceInDays(organization.subscriptionEndsAt, new Date()) + 1
    : null;
  const showDays = daysLeft !== null && daysLeft <= LONG_TRIAL_DAYS;
  const urgent =
    percent >= NEARLY_USED_PERCENT || (showDays && daysLeft <= LAST_DAYS);

  return (
    <div className="row flex-wrap items-center gap-x-5 gap-y-2 border-b bg-card px-4 py-2.5 text-sm lg:px-8">
      <div className="row items-center gap-2">
        <Badge variant={urgent ? 'warning' : 'secondary'}>Free trial</Badge>
        {showDays && (
          <span className="font-medium">
            {daysLeft === 1 ? 'Last day' : `${daysLeft} days left`}
          </span>
        )}
      </div>
      {limit > 0 && (
        <div className="row min-w-0 flex-1 items-center gap-3">
          <Progress className="w-28 shrink-0" size="sm" value={percent} />
          <span className="truncate text-muted-foreground tabular-nums">
            {number.format(used)} of {number.format(limit)} events used
          </span>
        </div>
      )}
      <LinkButton
        className="ml-auto"
        params={{ organizationId: organization.id }}
        size="sm"
        to="/$organizationId/billing"
        variant={urgent ? 'default' : 'outline'}
      >
        Choose a plan
      </LinkButton>
    </div>
  );
}
