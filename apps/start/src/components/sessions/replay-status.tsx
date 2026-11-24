import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Video } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTRPC } from '@/integrations/trpc/react';

const numberFormat = new Intl.NumberFormat();

function nextMonthStart(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  ).toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
}

/**
 * Session replay on the hosted service: a paid feature with a monthly number
 * of recorded sessions. Self-hosted installs (no plan, no limit) show nothing.
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
    if (!data.requiresPlan) {
      return null;
    }
    return (
      <Alert className="mb-6">
        <Video className="size-4" />
        <AlertTitle>Session replay is on paid plans</AlertTitle>
        <AlertDescription>
          Watch what visitors did, page by page. Sessions are not recorded on
          this organization's current plan.{' '}
          <Link
            className="font-medium underline underline-offset-4"
            params={{ organizationId }}
            to="/$organizationId/billing"
          >
            See plans
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (data.limit === null) {
    return null;
  }
  const reached = data.used >= data.limit;
  return (
    <Alert className="mb-6" variant={reached ? 'warning' : 'default'}>
      <Video className="size-4" />
      <AlertTitle>
        {reached
          ? 'Monthly session replay limit reached'
          : 'Session replay this month'}
      </AlertTitle>
      <AlertDescription>
        {numberFormat.format(Math.min(data.used, data.limit))} of{' '}
        {numberFormat.format(data.limit)} recorded sessions across this
        organization.{' '}
        {reached
          ? `New sessions are recorded again from ${nextMonthStart()}; sessions already recording finish.`
          : 'Recordings are kept 30 days.'}
      </AlertDescription>
    </Alert>
  );
}
