// Who may record session replays, and how many sessions a month.
//
// Self-hosted installs (the default) record without a plan check and without
// a cap: the owner pays their own Cloudflare bill. The hosted service sets
// FLAREPANEL_REPLAY_REQUIRES_PLAN=true: then an organization records when it
// has an active paid subscription, or when `replayEnabled` switches it on by
// hand, up to a monthly number of recorded sessions.

import type { CoordinationStore } from '@flarepanel/platform';

/** Hosted default for recorded sessions per organization and month. */
export const HOSTED_REPLAY_MONTHLY_SESSIONS = 5000;
const MONTH_WINDOW_MS = 32 * 24 * 60 * 60 * 1000;

export interface ReplayAccessConfig {
  /** Hosted: replay needs a paid plan or a manual switch. */
  requiresPlan: boolean;
  /** Recorded sessions per organization and month; null is unlimited. */
  monthlySessions: number | null;
}

export interface ReplayAccessOrganization {
  id: string;
  replayEnabled: boolean | null;
  replaySessionsLimit: number | null;
  subscriptionStatus: string | null;
  subscriptionProductId: string | null;
}

export type ReplayAccess =
  | { allowed: true; limit: number | null }
  | { allowed: false; reason: 'plan' };

/** Reads FLAREPANEL_REPLAY_REQUIRES_PLAN and FLAREPANEL_REPLAY_MONTHLY_SESSIONS. */
export function replayAccessConfig(
  env: Record<string, string | undefined> = process.env
): ReplayAccessConfig {
  const requiresPlan = env.FLAREPANEL_REPLAY_REQUIRES_PLAN === 'true';
  const raw = env.FLAREPANEL_REPLAY_MONTHLY_SESSIONS;
  const parsed = raw === undefined || raw === '' ? Number.NaN : Number(raw);
  let monthlySessions: number | null;
  if (Number.isFinite(parsed)) {
    monthlySessions = parsed > 0 ? Math.trunc(parsed) : null;
  } else {
    monthlySessions = requiresPlan ? HOSTED_REPLAY_MONTHLY_SESSIONS : null;
  }
  return { requiresPlan, monthlySessions };
}

/** An active subscription to a product; trials and ended plans are not. */
export function hasPaidPlan(organization: ReplayAccessOrganization): boolean {
  return (
    organization.subscriptionStatus === 'active' &&
    Boolean(organization.subscriptionProductId)
  );
}

export function replayAccessFor(
  organization: ReplayAccessOrganization,
  config: ReplayAccessConfig
): ReplayAccess {
  // An organization's own limit wins; 0 or less means unlimited.
  const override = organization.replaySessionsLimit;
  let limit = config.monthlySessions;
  if (override !== null) {
    limit = override > 0 ? override : null;
  }

  if (!config.requiresPlan) {
    return organization.replayEnabled === false
      ? { allowed: false, reason: 'plan' }
      : { allowed: true, limit };
  }
  const allowed =
    organization.replayEnabled ?? hasPaidPlan(organization);
  return allowed ? { allowed: true, limit } : { allowed: false, reason: 'plan' };
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
              subscriptionProductId: true;
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
  config: ReplayAccessConfig = replayAccessConfig()
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
          subscriptionProductId: true,
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
  /** Why not: the plan (hosted) or a switch that turned it off. */
  reason: 'plan' | null;
  /** Recorded sessions allowed this month; null is unlimited. */
  limit: number | null;
  /** Recorded sessions this month (UTC). */
  used: number;
  /** Hosted service: replay is a paid feature. */
  requiresPlan: boolean;
}

/** What the dashboard shows about a project's session replay. */
export async function getReplayStatus(
  deps: ReplayAccessDeps & { stores: { coordination: CoordinationStore } },
  projectId: string,
  config: ReplayAccessConfig = replayAccessConfig()
): Promise<ReplayStatus> {
  const found = await getProjectReplayAccess(deps, projectId, config);
  if (!found) {
    return {
      allowed: false,
      reason: 'plan',
      limit: null,
      used: 0,
      requiresPlan: config.requiresPlan,
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
        requiresPlan: config.requiresPlan,
      }
    : {
        allowed: false,
        reason: found.access.reason,
        limit: null,
        used,
        requiresPlan: config.requiresPlan,
      };
}
