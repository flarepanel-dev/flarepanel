import { Text } from '@react-email/components';
import { z } from 'zod';
import { Button } from '../components/button';
import { Layout } from '../components/layout';
import { withUtm } from '../utm';

export const zUsageNearLimit = z.object({
  firstName: z.string().optional(),
  organizationName: z.string(),
  billingUrl: z.string(),
  eventsCount: z.number(),
  eventsLimit: z.number(),
  /** A free trial stops collecting at its limit; a paid plan does not. */
  isTrial: z.boolean().optional(),
});

const formatNumber = (count: number) =>
  new Intl.NumberFormat('en-US').format(count);

export type Props = z.infer<typeof zUsageNearLimit>;
export default UsageNearLimit;
export function UsageNearLimit({
  firstName,
  organizationName,
  billingUrl = 'https://dashboard.flarepanel.dev',
  eventsCount,
  eventsLimit,
  isTrial,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  const percent = Math.round((eventsCount / eventsLimit) * 100);
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Hi{firstName ? ` ${firstName}` : ''},</Text>
      <Text>
        {organizationName} is having a busy month: you've used{' '}
        {formatNumber(eventsCount)} of your {formatNumber(eventsLimit)} events (
        {percent}%).
      </Text>
      <Text>
        {isTrial
          ? 'This is your free trial, so when it reaches the limit we stop recording new events until you choose a plan. Everything recorded so far stays.'
          : 'Nothing breaks if you go over. We keep recording every event and never charge extra. The only change: your charts pause until you move up a plan or your next billing period starts, and then everything recorded in between shows up.'}
      </Text>
      <Text>
        <Button href={withUtm(billingUrl, 'usage-near-limit')}>
          See usage and plans
        </Button>
      </Text>
      <Text>
        Not sure which plan fits? Just reply to this email and we'll help you
        pick.
      </Text>
      <Text>The FlarePanel team</Text>
    </Layout>
  );
}

UsageNearLimit.PreviewProps = {
  firstName: 'Alex',
  organizationName: 'Acme',
  billingUrl: 'https://dashboard.flarepanel.dev/org-id/billing',
  eventsCount: 4200,
  eventsLimit: 5000,
};
