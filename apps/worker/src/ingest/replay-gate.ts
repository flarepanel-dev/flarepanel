/**
 * Whether a session's replay is recorded, decided once per session (the
 * caller caches the answer):
 * 1. the organization may record (self-hosted: yes; hosted: a paid plan or
 *    the manual switch), looked up in D1 and cached for 5 minutes;
 * 2. the project knows the session (its Durable Object);
 * 3. a session new to replay fits the organization's monthly limit, counted
 *    in the shared counter store.
 */
import type {
  ProjectReplayAccess,
  ReplayAccessConfig,
} from '@flarepanel/core';
import type { CacheStore, CoordinationStore } from '@flarepanel/platform';
import type { ReplayAdmission, ReplayGate } from './replays';

const ACCESS_TTL_SECONDS = 5 * 60;

export interface ReplayProject {
  replayState(sessionId: string): Promise<'unknown' | 'recorded' | 'new'>;
  markReplay(sessionId: string, startedAtMs: number): Promise<boolean>;
}

export interface ReplayGateDeps {
  cache: CacheStore;
  coordination: CoordinationStore;
  config: ReplayAccessConfig;
  lookupAccess: (
    projectId: string,
    config: ReplayAccessConfig
  ) => Promise<ProjectReplayAccess | null>;
  countRecordedSession: (
    store: CoordinationStore,
    organizationId: string
  ) => Promise<number>;
}

async function cachedAccess(
  deps: ReplayGateDeps,
  projectId: string
): Promise<ProjectReplayAccess | null> {
  const key = `replay-access:${projectId}`;
  const cached = await deps.cache.get(key);
  if (cached) {
    return JSON.parse(cached) as ProjectReplayAccess | null;
  }
  const found = await deps.lookupAccess(projectId, deps.config);
  await deps.cache.set(key, JSON.stringify(found), ACCESS_TTL_SECONDS);
  return found;
}

export function createReplayGate(
  deps: ReplayGateDeps,
  projectId: string,
  project: ReplayProject
): ReplayGate {
  return async (sessionId, startedAtMs): Promise<ReplayAdmission> => {
    const found = await cachedAccess(deps, projectId);
    if (!found?.access.allowed) {
      return 'refused';
    }
    const state = await project.replayState(sessionId);
    if (state === 'unknown') {
      return 'unknown';
    }
    if (state === 'new' && found.access.limit !== null) {
      const count = await deps.countRecordedSession(
        deps.coordination,
        found.organizationId
      );
      if (count > found.access.limit) {
        return 'refused';
      }
    }
    return (await project.markReplay(sessionId, startedAtMs))
      ? 'recorded'
      : 'unknown';
  };
}
