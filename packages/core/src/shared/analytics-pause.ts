// Over the plan's monthly events, the hosted service keeps collecting every
// event but stops showing analytics until the workspace upgrades or its next
// billing period starts (the Polar webhook then clears the exceeded mark). The
// rule matches the dashboard's `isExceeded`; self-hosted installs never pause.

import { HttpError } from './errors';

export const ANALYTICS_PAUSED_STATUS = 402;
export const ANALYTICS_PAUSED_MESSAGE =
  'Analytics are paused: this workspace is over its monthly events limit. Events are still being collected; everything shows again after an upgrade or when the next billing period starts.';

export class AnalyticsPausedError extends HttpError {
  constructor() {
    super(ANALYTICS_PAUSED_MESSAGE, {
      status: ANALYTICS_PAUSED_STATUS,
      fingerprint: 'analytics-paused',
    });
    this.name = 'AnalyticsPausedError';
  }
}

export interface PauseOrganization {
  subscriptionPeriodEventsCount: number;
  subscriptionPeriodEventsLimit: number;
  subscriptionPeriodEventsCountExceededAt: Date | string | null;
}

export function isAnalyticsPaused(
  organization: PauseOrganization,
  selfHosted: boolean
): boolean {
  return (
    !selfHosted &&
    organization.subscriptionPeriodEventsCountExceededAt !== null &&
    organization.subscriptionPeriodEventsLimit > 0 &&
    organization.subscriptionPeriodEventsCount >
      organization.subscriptionPeriodEventsLimit
  );
}
