/**
 * A small uptime check run by the API Worker's own cron every 5 minutes: the
 * public sites in UPTIME_URLS answer, and the API's D1 and R2 respond. A
 * failure is logged and emailed to OPS_ALERT_EMAIL (one email per target and
 * hour). It cannot notice the API Worker itself being down; for that, point an
 * external monitor at /healthcheck (see the operations docs).
 */
import type { Logger } from '@flarepanel/core';
import { getPlatformStores } from '@flarepanel/platform';

export const UPTIME_EVERY_MINUTES = 5;
const TIMEOUT_MS = 10_000;
const ALERT_EVERY_MS = 60 * 60 * 1000;

export interface UptimeEnv {
  DB: D1Database;
  EVENTS_ARCHIVE?: R2Bucket;
  EMAIL?: SendEmail;
  OPS_ALERT_EMAIL?: string;
  UPTIME_URLS?: string;
}

export interface UptimeFailure {
  target: string;
  reason: string;
}

type Check = () => Promise<void>;

export function isUptimeMinute(scheduledTime: number): boolean {
  return Math.floor(scheduledTime / 60_000) % UPTIME_EVERY_MINUTES === 0;
}

function urlCheck(url: string, fetchImpl: typeof fetch): Check {
  return async () => {
    const response = await fetchImpl(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': 'FlarePanel-Uptime/1' },
    });
    await response.body?.cancel();
    if (response.status >= 500) {
      throw new Error(`HTTP ${response.status}`);
    }
  };
}

export async function runUptimeCheck(
  env: UptimeEnv,
  logger: Logger,
  fetchImpl: typeof fetch = fetch
): Promise<UptimeFailure[]> {
  const checks: [string, Check][] = [
    [
      'D1',
      async () => {
        await env.DB.prepare('SELECT 1').first();
      },
    ],
  ];
  if (env.EVENTS_ARCHIVE) {
    const bucket = env.EVENTS_ARCHIVE;
    checks.push([
      'R2',
      async () => {
        await bucket.head('uptime-probe');
      },
    ]);
  }
  for (const url of (env.UPTIME_URLS ?? '').split(',')) {
    const target = url.trim();
    if (target) {
      checks.push([target, urlCheck(target, fetchImpl)]);
    }
  }

  const results = await Promise.allSettled(checks.map(([, check]) => check()));
  const failures: UptimeFailure[] = [];
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const reason =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);
      failures.push({ target: checks[index]?.[0] ?? '?', reason });
    }
  });

  for (const failure of failures) {
    logger.error({ ...failure }, 'Uptime check failed');
    await alert(env, logger, failure);
  }
  return failures;
}

async function alert(env: UptimeEnv, logger: Logger, failure: UptimeFailure) {
  const to = env.OPS_ALERT_EMAIL;
  if (!(to && env.EMAIL)) {
    return;
  }
  try {
    const first = await getPlatformStores().coordination.setIfAbsent(
      `ops-alert:uptime:${failure.target}`,
      '1',
      ALERT_EVERY_MS
    );
    if (!first) {
      return;
    }
    await env.EMAIL.send({
      from: process.env.EMAIL_SENDER ?? 'hello@flarepanel.dev',
      to,
      subject: `FlarePanel: ${failure.target} is failing`,
      text: [
        `The uptime check could not reach ${failure.target}: ${failure.reason}.`,
        '',
        `Checked every ${UPTIME_EVERY_MINUTES} minutes; no further email for this target in the next hour.`,
      ].join('\n'),
    });
  } catch (error) {
    logger.error({ err: error }, 'Could not send the uptime alert');
  }
}
