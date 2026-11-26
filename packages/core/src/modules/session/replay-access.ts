// Who may record session replays, and how many sessions a month. Framed like
// OpenPanel: one switch (SELF_HOSTED) decides the deployment, and session
// replay is part of every plan, not a premium tier. On Cloudflare every
// recorded chunk is an R2 write someone pays for, so both sides get a monthly
// limit of recorded sessions per organization:
//
// - Self-hosted (SELF_HOSTED set): every organization records, up to
//   FLAREPANEL_REPLAY_MONTHLY_SESSIONS (10,000 by default, 0 = unlimited), so
//   an install stays near R2's free tier unless its owner raises it.
// - Hosted (SELF_HOSTED unset): organizations record while their trial or
//   plan is running. Trials get 500 sessions a month; plans one recorded
//   session per 100 events of their event limit, 1,000 to 100,000.
//
// `organizations.replayEnabled` switches replay on (hosted, without a plan) or
// off; `organizations.replaySessionsLimit` sets an organization's own limit
// (0 = unlimited).

import {
  getSubscriptionState,
  type SubscriptionState,
} from '@flarepanel/payments/subscription-state';
import type { CoordinationStore } from '@flarepanel/platform';

export const SELF_HOSTED_REPLAY_MONTHLY_SESSIONS = 10_000;
export const TRIAL_REPLAY_MONTHLY_SESSIONS = 500;
const EVENTS_PER_REPLAY_SESSION = 100;
const PLAN_REPLAY_MIN = 1000;
const PLAN_REPLAY_MAX = 100_000;
const MONTH_WINDOW_MS = 32 * 24 * 60 * 60 * 1000;

/** Hosted states that keep recording: the plan or trial is still running. */
const RECORDING_STATES = new Set<SubscriptionState>([
  'trialing',
  'active',
  'canceling',
  'pausing',
  'past_due',
]);

export interface ReplayAccessConfig {
  /** Hosted service (SELF_HOSTED unset): replay follows the plan. */
  hosted: boolean;
  /** Self-hosted limit per organization and month; null is unlimited. */
  selfHostedMonthlySessions: number | null;
}

export interface ReplayAccessOrganization {
  id: string;
  replayEnabled: boolean | null;
  replaySessionsLimit: number | null;
  subscriptionStatus: string | null;
  subscriptionCanceledAt: Date | null;
  subscriptionEndsAt: Date | null;
  subscriptionPauseAtPeriodEnd: boolean;
  subscriptionPeriodEventsLimit: number;
}

export type ReplayAccess =
  | { allowed: true; limit: number | null }
  | { allowed: false; reason: 'plan' | 'off' };

/** From the deployment switch and FLAREPANEL_REPLAY_MONTHLY_SESSIONS. */
export function replayAccessConfig(
  selfHosted: boolean,
  env: Record<string, string | undefined> = process.env
): ReplayAccessConfig {
  const raw = env.FLAREPANEL_REPLAY_MONTHLY_SESSIONS;
  const parsed = raw === undefined || raw === '' ? Number.NaN : Number(raw);
  let selfHostedMonthlySessions: number | null =
    SELF_HOSTED_REPLAY_MONTHLY_SESSIONS;
  if (Number.isFinite(parsed)) {
    selfHostedMonthlySessions = parsed > 0 ? Math.trunc(parsed) : null;
  }
  return { hosted: !selfHosted, selfHostedMonthlySessions };
}

/** A plan's recorded sessions a month, from its event limit. */
export function planReplayLimit(
  organization: ReplayAccessOrganization,
  state: SubscriptionState
): number {
  if (state === 'trialing') {
    return TRIAL_REPLAY_MONTHLY_SESSIONS;
  }
  const fromEvents = Math.round(
    organization.subscriptionPeriodEventsLimit / EVENTS_PER_REPLAY_SESSION
  );
  return Math.min(PLAN_REPLAY_MAX, Math.max(PLAN_REPLAY_MIN, fromEvents));
}

export function replayAccessFor(
  organization: ReplayAccessOrganization,
  config: ReplayAccessConfig
): ReplayAccess {
  if (organization.replayEnabled === false) {
    return { allowed: false, reason: 'off' };
  }
  // An organization's own limit wins; 0 or less means unlimited.
  const override = organization.replaySessionsLimit;
  const ownLimit =
    override === null ? undefined : override > 0 ? override : null;

  if (!config.hosted) {
    return {
      allowed: true,
      limit:
        ownLimit === undefined ? config.selfHostedMonthlySessions : ownLimit,
    };
  }
  const state = getSubscriptionState(organization);
  if (organization.replayEnabled === true) {
    return {
      allowed: true,
      limit:
        ownLimit === undefined
          ? planReplayLimit(organization, 'active')
          : ownLimit,
    };
  }
  if (!RECORDING_STATES.has(state)) {
    return { allowed: false, reason: 'plan' };
  }
  return {
    allowed: true,
    limit:
      ownLimit === undefined ? planReplayLimit(organization, state) : ownLimit,
  };
}

function monthKey(organizationId: string, now: Date): string {
  return `replay-sessions:${organizationId}:${now.toISOString().slice(0, 7)}`;
}

/** Counts one newly recorded session this calendar month (UTC). */
export async function countRecordedSession(
  store: CoordinationStore,
  organizationId: string,
  now = new Date()
): Promise<number> {
  const { count } = await store.increment(
    monthKey(organizationId, now),
    MONTH_WINDOW_MS
  );
  return count;
}

/** Sessions recorded this calendar month (UTC). */
export async function recordedSessionsThisMonth(
  store: CoordinationStore,
  organizationId: string,
  now = new Date()
): Promise<number> {
  const value = await store.get(monthKey(organizationId, now));
  const count = Number(value ?? 0);
  return Number.isFinite(count) ? count : 0;
}

interface ReplayAccessDeps {
  db: {
    project: {
      findUnique(args: {
        where: { id: string };
        select: {
          organizationId: true;
          organization: {
            select: {
              id: true;
              replayEnabled: true;
              replaySessionsLimit: true;
              subscriptionStatus: true;
              subscriptionCanceledAt: true;
              subscriptionEndsAt: true;
              subscriptionPauseAtPeriodEnd: true;
              subscriptionPeriodEventsLimit: true;
            };
          };
        };
      }): Promise<{
        organizationId: string;
        organization: ReplayAccessOrganization;
      } | null>;
    };
  };
}

export interface ProjectReplayAccess {
  organizationId: string;
  access: ReplayAccess;
}

/** The project's organization and what it may record; null if unknown. */
export async function getProjectReplayAccess(
  deps: ReplayAccessDeps,
  projectId: string,
  config: ReplayAccessConfig
): Promise<ProjectReplayAccess | null> {
  const project = await deps.db.project.findUnique({
    where: { id: projectId },
    select: {
      organizationId: true,
      organization: {
        select: {
          id: true,
          replayEnabled: true,
          replaySessionsLimit: true,
          subscriptionStatus: true,
          subscriptionCanceledAt: true,
          subscriptionEndsAt: true,
          subscriptionPauseAtPeriodEnd: true,
          subscriptionPeriodEventsLimit: true,
        },
      },
    },
  });
  if (!project) {
    return null;
  }
  return {
    organizationId: project.organizationId,
    access: replayAccessFor(project.organization, config),
  };
}

export interface ReplayStatus {
  allowed: boolean;
  /** Why not: no running plan or trial (hosted), or switched off. */
  reason: 'plan' | 'off' | null;
  /** Recorded sessions allowed this month; null is unlimited. */
  limit: number | null;
  /** Recorded sessions this month (UTC). */
  used: number;
  /** Hosted service: replay follows the plan. */
  hosted: boolean;
}

/** What the dashboard shows about a project's session replay. */
export async function getReplayStatus(
  deps: ReplayAccessDeps & {
    stores: { coordination: CoordinationStore };
    config: { selfHosted: boolean };
  },
  projectId: string,
  config: ReplayAccessConfig = replayAccessConfig(deps.config.selfHosted)
): Promise<ReplayStatus> {
  const found = await getProjectReplayAccess(deps, projectId, config);
  if (!found) {
    return {
      allowed: false,
      reason: 'plan',
      limit: null,
      used: 0,
      hosted: config.hosted,
    };
  }
  const used = await recordedSessionsThisMonth(
    deps.stores.coordination,
    found.organizationId
  ).catch(() => 0);
  return found.access.allowed
    ? {
        allowed: true,
        reason: null,
        limit: found.access.limit,
        used,
        hosted: config.hosted,
      }
    : {
        allowed: false,
        reason: found.access.reason,
        limit: null,
        used,
        hosted: config.hosted,
      };
}
