/**
 * `/track` on Workers: geo from `request.cf`, a best-effort duplicate check in
 * the colo's Cache API, and one RPC to the project's Durable Object, which
 * resolves the device and session, stores the event and answers once it is
 * durable. Profiles live in the same Durable Object; groups and replays are
 * accepted without being stored until Phase 4.
 */
import {
  type AppDeps,
  type Buffers,
  createCtx,
  type DeviceRequest,
  type EventStore,
  getGeoFromCf,
  getProjectByIdCached,
  type IClickhouseProfile,
  type IngestBackend,
  type TrackDraft,
  updateEventsCount,
} from '@flarepanel/core';
import type { CacheStore } from '@flarepanel/platform';
import type { Env } from '../index';

/** Repeats of one request inside this window are dropped. */
const DEDUPE_TTL_SECONDS = 1;

type ProjectEventsStub = ReturnType<Env['PROJECT_EVENTS']['get']>;

export function projectEventsStub(
  env: Pick<Env, 'PROJECT_EVENTS'>,
  projectId: string
): ProjectEventsStub {
  return env.PROJECT_EVENTS.get(env.PROJECT_EVENTS.idFromName(projectId));
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

interface CloudflareIngestOptions {
  env: Pick<Env, 'PROJECT_EVENTS'>;
  cache: CacheStore;
  /** Resolved lazily: the backend is built before `AppDeps` exists. */
  deps: () => AppDeps;
}

export function createCloudflareIngestBackend({
  env,
  cache,
  deps,
}: CloudflareIngestOptions): IngestBackend {
  const markFirstEvent = async (projectId: string) => {
    const appDeps = deps();
    await appDeps.db.project.updateMany({
      where: { id: projectId, firstEventAt: null },
      data: { firstEventAt: new Date() },
    });
    await getProjectByIdCached.clear(appDeps, projectId);
    appDeps.logger.info({ projectId }, 'Project received its first event');
  };

  return {
    async isDuplicate({ ip, origin, payload, projectId }) {
      const key = `ingest:dedupe:${await sha256Hex(
        JSON.stringify([projectId, ip, origin, payload])
      )}`;
      if (await cache.get(key)) {
        return true;
      }
      await cache.set(key, '1', DEDUPE_TTL_SECONDS);
      return false;
    },

    // Bot counts arrive with Phase 3b.
    recordBot: () => Promise.resolve(),

    geo: ({ cf, ipOverridden }) =>
      Promise.resolve(getGeoFromCf(cf, { ipOverridden })),

    sink: {
      resolveDevice: (device: DeviceRequest) =>
        projectEventsStub(env, device.projectId).resolveDevice(device),

      async track(draft: TrackDraft) {
        const projectId = draft.event.projectId;
        const project = await getProjectByIdCached(deps(), projectId).catch(
          () => null
        );
        const result = await projectEventsStub(env, projectId).track({
          draft,
          project: project
            ? {
                firstEventAt: project.firstEventAt,
                filters: project.filters,
                aiStoreContent: project.aiStoreContent,
              }
            : null,
        });
        if (result.firstEvent) {
          await markFirstEvent(projectId).catch((error) =>
            deps().logger.error(
              { err: error, projectId },
              'Could not record the first event'
            )
          );
        }
        // Usage counters (project sort order, billing period): cached for an
        // hour per project, so this is a cache read on almost every request.
        const appDeps = deps();
        const scope = createCtx(appDeps, {
          requestId: `usage:${projectId}`,
          logger: appDeps.logger,
        });
        await updateEventsCount(scope, projectId).catch((error) =>
          appDeps.logger.warn(
            { err: error, projectId },
            'Could not refresh usage counters'
          )
        );
        return { deviceId: result.deviceId, sessionId: result.sessionId };
      },
    },
  };
}

/** Dashboard reads from each project's Durable Object. */
export function createWorkerEventStore(
  env: Pick<Env, 'PROJECT_EVENTS'>
): EventStore {
  return {
    listEvents: (projectId, query) =>
      projectEventsStub(env, projectId).listEvents(query),
    projectCard: (projectId) => projectEventsStub(env, projectId).projectCard(),
    activeVisitors: (projectId) =>
      projectEventsStub(env, projectId).activeVisitors(),
    overview: (projectId, from, to) =>
      projectEventsStub(env, projectId).overview(from, to),
    topDimension: (projectId, dim, from, to, limit, filters) =>
      projectEventsStub(env, projectId).topDimension(
        dim,
        from,
        to,
        limit,
        filters
      ),
    metrics: (projectId, query) =>
      projectEventsStub(env, projectId).metrics(query),
    liveData: (projectId) => projectEventsStub(env, projectId).liveData(),
    chartRows: (projectId, query) =>
      projectEventsStub(env, projectId).chartRows(query),
    funnelRows: (projectId, query) =>
      projectEventsStub(env, projectId).funnelRows(query),
    retentionRows: (projectId, query) =>
      projectEventsStub(env, projectId).retentionRows(query),
    eventNames: (projectId) => projectEventsStub(env, projectId).eventNames(),
    propertyKeys: (projectId, eventName) =>
      projectEventsStub(env, projectId).propertyKeys(eventName),
    propertyValues: (projectId, eventName, property) =>
      projectEventsStub(env, projectId).propertyValues(eventName, property),
    listSessions: (projectId, query) =>
      projectEventsStub(env, projectId).listSessions(query),
    countSessions: (projectId, query) =>
      projectEventsStub(env, projectId).countSessions(query),
    getSession: (projectId, sessionId) =>
      projectEventsStub(env, projectId).getSession(sessionId),
    listProfiles: (projectId, query) =>
      projectEventsStub(env, projectId).listProfiles(query),
    countEvents: (projectId, from, to) =>
      projectEventsStub(env, projectId).countEvents(from, to),
    async deleteProjects(projectIds) {
      for (const projectId of projectIds) {
        await projectEventsStub(env, projectId).purge(projectId);
      }
    },
  };
}

const noop = () => Promise.resolve();

/**
 * The buffers `/track` and `/track/device-id` touch on Workers: sessions live
 * in the project's Durable Object; profile, group, replay, AI and bot rows
 * have no store yet and are dropped. Anything else still throws.
 */
export function createWorkerBuffers(env: Pick<Env, 'PROJECT_EVENTS'>): Buffers {
  const standIns: Record<string, unknown> = {
    event: {
      getActiveVisitorCount: (projectId: string) =>
        projectEventsStub(env, projectId).activeVisitors(),
    },
    session: {
      getExistingSessions: (projectId: string, deviceIds: string[]) =>
        projectEventsStub(env, projectId).getExistingSessions(
          projectId,
          deviceIds
        ),
    },
    // identify / increment / decrement / group assignment go to the
    // project's Durable Object profile store.
    profile: {
      add: (profile: IClickhouseProfile, isFromEvent = false) =>
        projectEventsStub(env, profile.project_id).upsertProfile(
          profile,
          isFromEvent
        ),
      fetchFromCache: (profileId: string, projectId: string) =>
        projectEventsStub(env, projectId).getProfile(profileId),
    },
    group: { add: noop },
    replay: { add: noop },
    aiEvent: { add: noop },
    bot: { add: noop },
  };
  return new Proxy(standIns, {
    get(target, property) {
      if (property === 'then') {
        return undefined;
      }
      const value = target[String(property)];
      if (value === undefined) {
        throw new Error(
          `Event buffer "${String(property)}" is not available on Cloudflare Workers`
        );
      }
      return value;
    },
  }) as unknown as Buffers;
}
