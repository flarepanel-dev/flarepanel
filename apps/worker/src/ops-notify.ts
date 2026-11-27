/**
 * How the operator hears about a problem: an email (OPS_ALERT_EMAIL, through
 * the EMAIL binding), a push notification through ntfy (OPS_ALERT_NTFY_URL,
 * the full topic address such as `https://ntfy.sh/<your-topic>`), or both.
 * Each channel is tried on its own, so one failing does not stop the other.
 *
 * The push text is kept short and free of job data and error text: a topic
 * on a public ntfy server is only as private as its name.
 */
import type { Logger } from '@flarepanel/core';

const NTFY_TIMEOUT_MS = 8000;

export interface OpsNotifyEnv {
  EMAIL?: SendEmail;
  OPS_ALERT_EMAIL?: string;
  OPS_ALERT_NTFY_URL?: string;
  /** Access token for a protected topic or a self-hosted ntfy server. */
  OPS_ALERT_NTFY_TOKEN?: string;
}

export interface OpsNotice {
  title: string;
  /** The email body: may carry detail. */
  text: string;
  /** The push body: short, no job data or error text. */
  push: string;
}

/** True when at least one alert channel is configured. */
export function hasOpsChannel(env: OpsNotifyEnv): boolean {
  return Boolean(
    (env.OPS_ALERT_EMAIL && env.EMAIL) || env.OPS_ALERT_NTFY_URL?.trim()
  );
}

/** Sends the notice on every configured channel. Never throws. */
export async function notifyOperator(
  env: OpsNotifyEnv,
  logger: Logger,
  notice: OpsNotice
): Promise<void> {
  const ntfyUrl = env.OPS_ALERT_NTFY_URL?.trim();
  if (ntfyUrl) {
    try {
      const response = await fetch(ntfyUrl, {
        method: 'POST',
        headers: {
          Title: notice.title,
          Priority: 'high',
          Tags: 'warning',
          ...(env.OPS_ALERT_NTFY_TOKEN
            ? { Authorization: `Bearer ${env.OPS_ALERT_NTFY_TOKEN}` }
            : {}),
        },
        body: notice.push,
        signal: AbortSignal.timeout(NTFY_TIMEOUT_MS),
      });
      if (!response.ok) {
        logger.error({ status: response.status }, 'The ntfy alert was refused');
      }
    } catch (error) {
      logger.error({ err: error }, 'Could not send the ntfy alert');
    }
  }
  if (env.OPS_ALERT_EMAIL && env.EMAIL) {
    try {
      await env.EMAIL.send({
        from: process.env.EMAIL_SENDER ?? 'hello@flarepanel.dev',
        to: env.OPS_ALERT_EMAIL,
        subject: notice.title,
        text: notice.text,
      });
    } catch (error) {
      logger.error({ err: error }, 'Could not send the alert email');
    }
  }
}
