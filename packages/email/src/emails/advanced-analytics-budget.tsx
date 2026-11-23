import { Text } from '@react-email/components';
import { z } from 'zod';
import { Layout } from '../components/layout';

export const zAdvancedAnalyticsBudget = z.object({
  firstName: z.string().optional(),
  /** Gigabytes scanned this month, rounded. */
  usedGb: z.number(),
  budgetGb: z.number(),
  /** True at 100%: queries stop until next month or a higher budget. */
  reached: z.boolean(),
  month: z.string(),
});

export type Props = z.infer<typeof zAdvancedAnalyticsBudget>;
export default AdvancedAnalyticsBudget;
export function AdvancedAnalyticsBudget({
  firstName,
  usedGb,
  budgetGb,
  reached,
  month,
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  const percent = budgetGb > 0 ? Math.round((usedGb / budgetGb) * 100) : 100;
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>Hi{firstName ? ` ${firstName}` : ''},</Text>
      {reached ? (
        <Text>
          Advanced analytics on your FlarePanel install has used its budget for{' '}
          {month}: {usedGb} GB of {budgetGb} GB scanned. Queries to Basin SQL
          are paused until next month, so Cloudflare will not bill more for
          them. Reports keep working from the last 90 days of events.
        </Text>
      ) : (
        <Text>
          Advanced analytics on your FlarePanel install has used {percent}% of
          its budget for {month}: {usedGb} GB of {budgetGb} GB scanned.
        </Text>
      )}
      <Text>
        To change the budget, set FLAREPANEL_ADVANCED_BUDGET_GB on the
        flarepanel-api Worker. Basin SQL costs $2.50 per TB scanned after the
        first 10 GB each month.
      </Text>
      <Text>The FlarePanel team</Text>
    </Layout>
  );
}

AdvancedAnalyticsBudget.PreviewProps = {
  firstName: 'Alex',
  usedGb: 8,
  budgetGb: 10,
  reached: false,
  month: '2026-11',
};
