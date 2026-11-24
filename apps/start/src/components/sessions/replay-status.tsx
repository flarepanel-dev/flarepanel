import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Video } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTRPC } from '@/integrations/trpc/react';

const numberFormat = new Intl.NumberFormat();
/** As OpenPanel warns about events: speak up at 80% of the limit. */
const WARN_AT = 0.8;

function nextMonthStart(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  ).toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
}

/**
 * Session replay is in every plan, with a monthly number of recorded
 * sessions. This says so only when it matters: replay is off, or this month's
 * use is at 80% of the limit or past it.
 */
export function ReplayStatus({
  organizationId,
  projectId,
}: {
  organizationId: string;
  projectId: string;
}) {
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.session.replayStatus.queryOptions({ projectId })
  );
  if (!data) {
    return null;
  }

  if (!data.allowed) {
    if (data.reason === 'off') {
      return (
        <Alert className="mb-6">
          <Video className="size-4" />
          <AlertTitle>Session replay is turned off</AlertTitle>
          <AlertDescription>
            Sessions of this organization are not recorded.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <Alert className="mb-6" variant="warning">
        <Video className="size-4" />
        <AlertTitle>Session replay needs an active plan</AlertTitle>
        <AlertDescription>
          The trial or plan of this organization has ended, so new sessions are
          not recorded. Existing recordings stay for 30 days.{' '}
          <Link
            className="font-medium underline underline-offset-4"
            params={{ organizationId }}
            to="/$organizationId/billing"
          >
            Choose a plan
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (data.limit === null || data.used < data.limit * WARN_AT) {
    return null;
  }
  const reached = data.used >= data.limit;
  return (
    <Alert className="mb-6" variant="warning">
      <Video className="size-4" />
      <AlertTitle>
        {reached
          ? 'Monthly session replay limit reached'
          : `${Math.floor((data.used / data.limit) * 100)}% of this month's session replays used`}
      </AlertTitle>
      <AlertDescription>
        {numberFormat.format(Math.min(data.used, data.limit))} of{' '}
        {numberFormat.format(data.limit)} recorded sessions across this
        organization.{' '}
        {reached
          ? `New sessions are recorded again from ${nextMonthStart()}; sessions already recording finish. Nothing is charged for going over.`
          : 'Past the limit, new sessions are not recorded until next month; nothing is charged.'}
        {data.hosted && (
          <>
            {' '}
            <Link
              className="font-medium underline underline-offset-4"
              params={{ organizationId }}
              to="/$organizationId/billing"
            >
              Plans
            </Link>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
