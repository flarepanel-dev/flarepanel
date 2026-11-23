/**
 * Advanced analytics (Basin SQL) is off unless the install turns it on:
 * `FLAREPANEL_ADVANCED_ANALYTICS=on`, the `BASIN_SQL_TOKEN` secret and
 * `CLOUDFLARE_ACCOUNT_ID`. Sending events to Basin also needs the
 * `EVENTS_STREAM` pipeline binding. See docs/self-hosting/advanced-analytics.
 */
import { assertTableName } from '@flarepanel/core/ingest/cloudflare';
import type { Env } from '../index';

const GB = 1_000_000_000;
const DEFAULT_BUDGET_GB = 10;
const DEFAULT_TABLE = 'flarepanel.events';
const DEFAULT_BUCKET = 'flarepanel-events';
const DEFAULT_RETENTION_DAYS = 90;

export interface AdvancedConfig {
  accountId: string;
  bucket: string;
  table: string;
  token: string;
  budgetBytes: number;
  /** Days of raw events the Durable Objects keep. */
  hotDays: number;
}

export function isStreamingEnabled(env: Env): boolean {
  return (
    env.FLAREPANEL_ADVANCED_ANALYTICS === 'on' && Boolean(env.EVENTS_STREAM)
  );
}

export function readAdvancedConfig(env: Env): AdvancedConfig | null {
  if (env.FLAREPANEL_ADVANCED_ANALYTICS !== 'on') {
    return null;
  }
  const token = env.BASIN_SQL_TOKEN;
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  if (!(token && accountId)) {
    return null;
  }
  const budgetGb = Number(
    env.FLAREPANEL_ADVANCED_BUDGET_GB ?? DEFAULT_BUDGET_GB
  );
  const hotDays = Number(
    env.FLAREPANEL_EVENT_RETENTION_DAYS ?? DEFAULT_RETENTION_DAYS
  );
  return {
    accountId,
    bucket: env.FLAREPANEL_BASIN_BUCKET || DEFAULT_BUCKET,
    table: assertTableName(env.FLAREPANEL_BASIN_TABLE || DEFAULT_TABLE),
    token,
    budgetBytes:
      Number.isFinite(budgetGb) && budgetGb >= 0
        ? budgetGb * GB
        : DEFAULT_BUDGET_GB * GB,
    hotDays:
      Number.isFinite(hotDays) && hotDays > 0
        ? hotDays
        : DEFAULT_RETENTION_DAYS,
  };
}
