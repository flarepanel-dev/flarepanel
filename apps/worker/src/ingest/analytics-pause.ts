/**
 * The one place analytics reads are paused for a workspace over its plan:
 * every dashboard, REST, MCP and assistant read of a project's data goes
 * through the event store, so the store refuses them (AnalyticsPausedError,
 * 402) while collection, billing counts, imports, notifications and the jobs
 * that write keep working. An export simply waits: its read returns nothing,
 * so nothing is acknowledged and it resumes where it stopped.
 */
import {
  AnalyticsPausedError,
  type EventStore,
  isAnalyticsPaused,
  type PauseOrganization,
} from '@flarepanel/core';
import type { CacheStore } from '@flarepanel/platform';

const CACHE_SECONDS = 60;

/** Methods that write, count for billing or move data in: never paused. */
const ALWAYS_ALLOWED = new Set<string>([
  'importFiles',
  'importOp',
  'publishNotification',
  'exportClaim',
  'exportRelease',
  'exportAck',
  'countEvents',
  'deleteProjects',
  'botImport',
]);

/** Kinds of the multi-purpose calls that write rather than read. */
const WRITE_KINDS: Record<string, Set<string>> = {
  cohorts: new Set(['compute', 'remove']),
  groups: new Set(['upsert', 'remove']),
  gsc: new Set(['write']),
};

export interface PauseLookup {
  cache: CacheStore;
  selfHosted: () => boolean;
  organizationOf: (projectId: string) => Promise<PauseOrganization | null>;
}

export function createPauseCheck(lookup: PauseLookup) {
  return async (projectId: string): Promise<boolean> => {
    if (lookup.selfHosted()) {
      return false;
    }
    const key = `analytics-paused:${projectId}`;
    const cached = await lookup.cache.get(key);
    if (cached !== null) {
      return cached === '1';
    }
    const organization = await lookup.organizationOf(projectId);
    const paused = organization
      ? isAnalyticsPaused(organization, lookup.selfHosted())
      : false;
    await lookup.cache.set(key, paused ? '1' : '0', CACHE_SECONDS);
    return paused;
  };
}

function isWrite(method: string, args: unknown[]): boolean {
  const kinds = WRITE_KINDS[method];
  if (!kinds) {
    return false;
  }
  const kind = (args[1] as { kind?: string } | undefined)?.kind;
  return kind !== undefined && kinds.has(kind);
}

export function guardAnalyticsPause(
  store: EventStore,
  isPaused: (projectId: string) => Promise<boolean>
): EventStore {
  return new Proxy(store, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      const method = String(property);
      if (typeof value !== 'function' || ALWAYS_ALLOWED.has(method)) {
        return value;
      }
      return async (...args: unknown[]) => {
        const projectId = args[0];
        if (
          typeof projectId === 'string' &&
          !isWrite(method, args) &&
          (await isPaused(projectId))
        ) {
          if (method === 'exportRead') {
            return { eventsJson: '[]', through: 0 };
          }
          throw new AnalyticsPausedError();
        }
        return value.apply(target, args);
      };
    },
  });
}
