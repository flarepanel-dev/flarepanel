/**
 * Basin SQL for advanced analytics. Every query first checks the monthly
 * budget (stop at 100%), then records what Cloudflare bills for it (bytes
 * scanned, at least 10 MB); crossing 80% and 100% emails the install's
 * organization admins once a month.
 */
import type { AppDeps } from '@flarepanel/core';
import {
  type AdvancedAnalytics,
  AdvancedAnalyticsBudgetError,
  type AdvancedAnalyticsUsage,
} from '@flarepanel/core/ingest/cloudflare';
import { STORED_ADMIN_ROLES } from '@flarepanel/core/modules/organization/organization.constants';
import type { Env } from '../index';
import type { AdvancedConfig } from './config';
import type { BudgetAlert } from './usage-do';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Basin SQL bills at least this much per query. */
const MIN_BILLED_BYTES = 10_000_000;
const GB = 1_000_000_000;

interface BasinResponse {
  success?: boolean;
  errors?: { message?: string }[];
  result?: {
    rows?: Record<string, unknown>[];
    metrics?: { bytes_scanned?: number };
  };
}

function usageStub(env: Env) {
  return env.BASIN_USAGE.get(env.BASIN_USAGE.idFromName('install'));
}

async function sendBudgetAlert(
  deps: AppDeps,
  usage: AdvancedAnalyticsUsage,
  alert: Exclude<BudgetAlert, null>
) {
  const admins = await deps.db.member.findMany({
    where: { role: { in: STORED_ADMIN_ROLES }, user: { deletedAt: null } },
    include: { user: { select: { email: true, firstName: true } } },
  });
  const recipients = new Map<string, string | undefined>();
  for (const member of admins) {
    if (member.user?.email) {
      recipients.set(member.user.email, member.user.firstName ?? undefined);
    }
  }
  const { sendEmail } = await import('@flarepanel/email');
  for (const [to, firstName] of recipients) {
    await sendEmail('advanced-analytics-budget', {
      to,
      data: {
        firstName,
        usedGb: Math.round((usage.usedBytes / GB) * 10) / 10,
        budgetGb: Math.round((usage.budgetBytes / GB) * 10) / 10,
        reached: alert === 'reached',
        month: usage.month,
      },
    }).catch((error: unknown) =>
      deps.logger.error({ err: error }, 'Could not send the budget alert')
    );
  }
}

export function createAdvancedAnalytics(
  env: Env,
  config: AdvancedConfig,
  deps: () => AppDeps
): AdvancedAnalytics {
  const endpoint = `https://api.sql.cloudflarestorage.com/api/v1/accounts/${config.accountId}/basin-sql/query/${config.bucket}`;
  return {
    table: config.table,
    hotFrom: () => Date.now() - config.hotDays * DAY_MS,
    usage: () => usageStub(env).usage(config.budgetBytes),
    async query<T extends Record<string, unknown>>(sql: string): Promise<T[]> {
      const before = await usageStub(env).usage(config.budgetBytes);
      if (before.usedBytes >= config.budgetBytes) {
        throw new AdvancedAnalyticsBudgetError(
          before.usedBytes,
          config.budgetBytes
        );
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      });
      const body = (await response.json().catch(() => ({}))) as BasinResponse;
      // Failed queries are not billed, so they are not counted either.
      if (!response.ok || body.success === false || !body.result) {
        const reason = body.errors?.map((error) => error.message).join('; ');
        throw new Error(`Basin SQL ${response.status}: ${reason ?? 'failed'}`);
      }
      const scanned = Number(body.result.metrics?.bytes_scanned ?? 0);
      const { usage, alert } = await usageStub(env).record(
        Math.max(scanned, MIN_BILLED_BYTES),
        config.budgetBytes
      );
      if (alert) {
        await sendBudgetAlert(deps(), usage, alert).catch((error: unknown) =>
          deps().logger.error({ err: error }, 'Could not send the budget alert')
        );
      }
      return (body.result.rows ?? []) as T[];
    },
  };
}
