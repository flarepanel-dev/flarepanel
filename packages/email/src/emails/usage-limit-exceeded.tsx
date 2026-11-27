import { Text } from '@react-email/components';
import { z } from 'zod';
import { Button } from '../components/button';
import { Layout } from '../components/layout';
import { List } from '../components/list';
import { withUtm } from '../utm';

export const zUsageLimitExceeded = z.object({
  firstName: z.string().optional(),
  organizationName: z.string(),
  billingUrl: z.string(),
  eventsLimit: z.number(),
  /** A free trial stops collecting at its limit; a paid plan does not. */
  isTrial: z.boolean().optional(),
});

const formatNumber = (count: number) =>
  new Intl.NumberFormat('en-US').format(count);

export type Props = z.infer<typeof zUsageLimitExceeded>;
export default UsageLimitExceeded;
export function UsageLimitExceeded({
  firstName,
  organizationName,
  billingUrl = 'https://dashboard.flarepanel.dev',
  eventsLimit,
  isTrial,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  if (isTrial) {
    return (
      <Layout unsubscribeUrl={unsubscribeUrl}>
        <Text>Hi{firstName ? ` ${firstName}` : ''},</Text>
        <Text>
          {organizationName} has used all {formatNumber(eventsLimit)} events of
          its free trial.
        </Text>
        <Text>
          We have stopped recording new events. Everything collected so far is
          kept, and choosing a plan starts recording again straight away.
        </Text>
        <Text>
          <Button href={withUtm(billingUrl, 'usage-limit-exceeded')}>
            Choose a plan
          </Button>
        </Text>
        <Text>
          Not sure which plan fits? Reply to this email and we'll help.
        </Text>
        <Text>The FlarePanel team</Text>
      </Layout>
    );
  }
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Hi{firstName ? ` ${firstName}` : ''},</Text>
      <Text>
        {organizationName} has used all {formatNumber(eventsLimit)} events in
        this month's plan. Looks like a busier month than planned.
      </Text>
      <Text>
        Your data is safe: we're still recording every event, and we won't
        charge you extra. For now, your charts are paused at the point you hit
        the limit.
      </Text>
      <Text>You have two ways forward:</Text>
      <List
        items={[
          'Upgrade, and your charts are back in about a minute, including everything recorded since.',
          'Wait, and they come back by themselves when your next billing period starts.',
        ]}
      />
      <Text>
        <Button href={withUtm(billingUrl, 'usage-limit-exceeded')}>
          Upgrade your plan
        </Button>
      </Text>
      <Text>Stuck between two plans? Reply and we'll help you choose.</Text>
      <Text>The FlarePanel team</Text>
    </Layout>
  );
}

UsageLimitExceeded.PreviewProps = {
  firstName: 'Alex',
  organizationName: 'Acme',
  billingUrl: 'https://dashboard.flarepanel.dev/org-id/billing',
  eventsLimit: 5000,
};
