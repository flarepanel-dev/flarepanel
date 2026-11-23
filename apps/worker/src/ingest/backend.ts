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
  checkNotificationRulesForEvent,
  createCtx,
  type DeviceRequest,
  type EventStore,
  getFunnelRules,
  getGeoFromCf,
  getNotificationRulesByProjectId,
  getProjectByIdCached,
  type IClickhouseProfile,
  type IngestBackend,
  type IServiceCreateEventPayload,
  type TrackDraft,
  updateEventsCount,
} from '@flarepanel/core';
import type { CacheStore } from '@flarepanel/platform';
import { toDots } from '@flarepanel/shared';
import type { Env } from '../index';
import { createImportFileStore } from './import-files';

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
        // Cached per project (Cache API), so usually no D1 read.
        const rules = await getNotificationRulesByProjectId(
          deps(),
          projectId
        ).catch(() => []);
        const result = await projectEventsStub(env, projectId).track({
          funnelRules: getFunnelRules(rules).length > 0,
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
        const hasEventRules = rules.some(
          (rule) => (rule.config as { type?: string }).type === 'events'
        );
        if (result.eventJson && hasEventRules) {
          const stored = JSON.parse(
            result.eventJson
          ) as IServiceCreateEventPayload;
          stored.createdAt = new Date(stored.createdAt);
          await checkNotificationRulesForEvent(scope, stored).catch((error) =>
            appDeps.logger.error(
              { err: error, projectId },
              'Could not check notification rules'
            )
          );
        }
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
  env: Pick<Env, 'PROJECT_EVENTS' | 'EVENTS_ARCHIVE'>
): EventStore {
  return {
    importFiles: env.EVENTS_ARCHIVE
      ? createImportFileStore(env.EVENTS_ARCHIVE)
      : undefined,
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
    dimensionDays: (projectId, dim, fromDay, toDay) =>
      projectEventsStub(env, projectId).dimensionDays(dim, fromDay, toDay),
    metrics: (projectId, query) =>
      projectEventsStub(env, projectId).metrics(query),
    liveData: (projectId) => projectEventsStub(env, projectId).liveData(),
    realtime: (projectId, query) =>
      projectEventsStub(env, projectId).realtime(query),
    publishNotification: (projectId, notification) =>
      projectEventsStub(env, projectId).publishNotification(notification),
    chartRows: (projectId, query) =>
      projectEventsStub(env, projectId).chartRows(query),
    conversionRows: (projectId, query) =>
      projectEventsStub(env, projectId).conversionRows(query),
    sankeyRows: (projectId, query) =>
      projectEventsStub(env, projectId).sankeyRows(query),
    pageRows: (projectId, query) =>
      projectEventsStub(env, projectId).pageRows(query),
    pageSeries: (projectId, query) =>
      projectEventsStub(env, projectId).pageSeries(query),
    eventCounts: (projectId, query) =>
      projectEventsStub(env, projectId).eventCounts(query),
    profilePropertyKeys: (projectId, options) =>
      projectEventsStub(env, projectId).profilePropertyKeys(
        options?.anonymous ?? false
      ),
    ai: (projectId, query) => projectEventsStub(env, projectId).ai(query),
    gsc: (projectId, query) => projectEventsStub(env, projectId).gsc(query),
    importOp: (projectId, query) =>
      projectEventsStub(env, projectId).importOp(query),
    exportClaim: (projectId, integrationId, token, ttlMs) =>
      projectEventsStub(env, projectId).exportClaim(
        integrationId,
        token,
        ttlMs
      ),
    exportRelease: (projectId, integrationId, token) =>
      projectEventsStub(env, projectId).exportRelease(integrationId, token),
    exportRead: (projectId, integrationId, maxEvents) =>
      projectEventsStub(env, projectId).exportRead(integrationId, maxEvents),
    exportAck: (projectId, integrationId, through) =>
      projectEventsStub(env, projectId).exportAck(integrationId, through),
    tools: (projectId, query) =>
      projectEventsStub(env, projectId).tools(query),
    cohorts: (projectId, query) =>
      projectEventsStub(env, projectId).cohorts(query),
    groups: (projectId, query) =>
      projectEventsStub(env, projectId).groups(query),
    findEvent: (projectId, id, createdAt) =>
      projectEventsStub(env, projectId).findEvent(id, createdAt?.getTime()),
    dimensionSeries: (projectId, dim, buckets, filters) =>
      projectEventsStub(env, projectId).dimensionSeries(dim, buckets, filters),
    journeyRows: (projectId, query) =>
      projectEventsStub(env, projectId).journeyRows(query),
    dailyStats: (projectId, from, to) =>
      projectEventsStub(env, projectId).dailyStats(from, to),
    profilePropertyValues: (projectId, property) =>
      projectEventsStub(env, projectId).profilePropertyValues(property),
    profileSummary: (projectId, profileId) =>
      projectEventsStub(env, projectId).profileSummary(profileId),
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
    // Group records go to the project's Durable Object group store.
    group: {
      add: (group: {
        id: string;
        projectId: string;
        type: string;
        name: string;
        properties?: Record<string, unknown>;
      }) =>
        projectEventsStub(env, group.projectId).groups({
          kind: 'upsert',
          group: {
            id: group.id,
            type: group.type,
            name: group.name,
            properties: toDots(group.properties ?? {}),
          },
        }),
    },
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
