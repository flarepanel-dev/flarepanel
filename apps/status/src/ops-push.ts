// Tells the operator, by ntfy push, when an automatic incident opens and when
// it resolves. This Worker shares nothing with the services it watches, so
// the push still goes out when the API itself is down, which the API's own
// alerts cannot report.
//
// OPS_ALERT_NTFY_URL is the full topic address (`https://ntfy.sh/<topic>`).
// Unset: no push. A failed push is logged and never fails the round.

import type { Incident } from './store';

const NTFY_TIMEOUT_MS = 8000;
const MINUTE = 60_000;

export interface OpsPushEnv {
  /** Secret: the operator's ntfy topic address. Unset: no push. */
  OPS_ALERT_NTFY_URL?: string;
  /** Secret: access token for a protected topic. */
  OPS_ALERT_NTFY_TOKEN?: string;
}

export interface OpsPush {
  title: string;
  body: string;
  priority: 'urgent' | 'high' | 'default';
  tags: string;
}

/** The push for an incident that just opened or resolved. */
export function incidentPush(
  incident: Pick<Incident, 'id' | 'title' | 'impact' | 'startedAt'>,
  kind: 'opened' | 'resolved',
  now: number,
  site: string
): OpsPush {
  const link = `${site}/incidents/${encodeURIComponent(incident.id)}`;
  if (kind === 'resolved') {
    const minutes = Math.max(
      1,
      Math.round((now - incident.startedAt) / MINUTE)
    );
    return {
      title: `Recovered: ${incident.title}`,
      body: `Back to normal after about ${minutes} minute${minutes === 1 ? '' : 's'}. ${link}`,
      priority: 'default',
      tags: 'white_check_mark',
    };
  }
  return {
    title: `Down: ${incident.title}`,
    body: `Two checks in a row failed. Checked every minute; you get one more message when it recovers. ${link}`,
    priority: incident.impact === 'major' ? 'urgent' : 'high',
    tags: 'rotating_light',
  };
}

/** Sends one push. Never throws. */
export async function sendOpsPush(env: OpsPushEnv, push: OpsPush) {
  const url = env.OPS_ALERT_NTFY_URL?.trim();
  if (!url) {
    return;
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Title: push.title,
        Priority: push.priority,
        Tags: push.tags,
        ...(env.OPS_ALERT_NTFY_TOKEN
          ? { Authorization: `Bearer ${env.OPS_ALERT_NTFY_TOKEN}` }
          : {}),
      },
      body: push.body,
      signal: AbortSignal.timeout(NTFY_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error('The operator push was refused', response.status);
    }
  } catch (error) {
    console.error('Could not send the operator push', error);
  }
}
