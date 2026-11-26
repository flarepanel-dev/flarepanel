/**
 * FlarePanel on Cloudflare Workers: the dashboard API (`/trpc`, public API,
 * auth) on D1, with the Cloudflare platform stores and job queue.
 *
 * Phase 3a: `/track` stores events in one Durable Object per project
 * (`ProjectEventsDurableObject`), archived to R2; the dashboard's live
 * sockets are forwarded to the same object. Profiles, groups, replays and the
 * ClickHouse-backed reports are not on Workers yet.
 */

process.env.TZ = 'UTC';

import { createHmac } from 'node:crypto';
import {
  type AppDeps,
  appRouter,
  CRON_SCHEDULES,
  cookieOptions,
  corsDelegator,
  createAuth,
  createClients,
  createInitialSalts,
  createTrpcFetchHandler,
  dashboardRoutes,
  errorHandler,
  type HttpCtx,
  opsRoutes,
  publicApiRoutes,
  queues,
  requestLogging,
  setGeoLookup,
  setSandboxRunner,
  TRPC_ENDPOINT,
} from '@flarepanel/core';
import {
  createCloudflareProducers,
  cronEnqueuer,
  dispatchDueSchedules,
  processCloudflareJobBatch,
  type QueueMessageLike,
} from '@flarepanel/core/jobs/cloudflare';
// Aliased to prisma-client.workerd.ts in wrangler.jsonc.
import { db, Prisma } from '@flarepanel/db/src/prisma-client';
import {
  bindD1Database,
  withRequestDb,
} from '@flarepanel/db/src/prisma-client.workerd';
import { configurePlatformStores } from '@flarepanel/platform';
import {
  CoordinatorDurableObject,
  createCloudflareStores,
  PubSubHubDurableObject,
} from '@flarepanel/platform/cloudflare';
import { Elysia } from 'elysia';
import { loadConfig } from '../../api/src/config/env';
import { createAdvancedAnalytics } from './advanced/analytics';
import { readAdvancedConfig } from './advanced/config';
import { BasinUsageDurableObject } from './advanced/usage-do';
import { limitRequestBody } from './body-limit';
import {
  createFeedbackScreenshotStore,
  serveFeedbackScreenshot,
} from './feedback-screenshots';
import {
  createGeoipLookup,
  GEOIP_MESSAGE_KIND,
  maybeStartGeoipRefresh,
  runGeoipRefreshStep,
} from './geoip';
import { httpsRedirect } from './https-redirect';
import {
  createPauseCheck,
  guardAnalyticsPause,
} from './ingest/analytics-pause';
import {
  createCloudflareIngestBackend,
  createWorkerBuffers,
  createWorkerEventStore,
  projectEventsStub,
} from './ingest/backend';
import { createEmptyClickHouse } from './ingest/empty-clickhouse';
import { liveAccessRoute, matchLivePath } from './ingest/live';
import { ProjectEventsDurableObject } from './ingest/project-events-do';
import { createDynamicWorkerRunner } from './js-sandbox';
import { createConsoleLogger } from './logger';
import {
  DEAD_LETTER_QUEUE,
  keepDeadLetters,
  reportFailedJob,
} from './ops-alerts';
import { handleOps, hasOpsToken, isOpsPath } from './ops-routes';
import { checkEdgeRateLimit } from './rate-limits';
import { unavailableOnWorkers } from './unavailable-deps';
import { isUptimeMinute, runUptimeCheck } from './uptime';

export {
  BasinUsageDurableObject,
  CoordinatorDurableObject,
  ProjectEventsDurableObject,
  PubSubHubDurableObject,
};

export interface Env {
  DB: D1Database;
  COORDINATOR: DurableObjectNamespace<CoordinatorDurableObject>;
  PUBSUB_HUB: DurableObjectNamespace<PubSubHubDurableObject>;
  PROJECT_EVENTS: DurableObjectNamespace<ProjectEventsDurableObject>;
  JOBS: Queue;
  /** Raw event archive; absent in lite mode (shorter retention, no R2). */
  EVENTS_ARCHIVE?: R2Bucket;
  /** Per-IP limit on ingest requests, checked before any Durable Object. */
  TRACK_LIMITER?: RateLimit;
  MCP_LIMITER?: RateLimit;
  FLAREPANEL_EVENT_RETENTION_DAYS?: string;
  /** Cloudflare Email Service; account emails go out through it when bound. */
  EMAIL?: SendEmail;
  /** IP geolocation tables (DB-IP City Lite); optional. */
  GEO_DB?: D1Database;
  /** Dynamic Workers: JavaScript webhook templates run here. */
  LOADER?: WorkerLoader;
  /** Where failed-job alerts go (one per job and hour). Unset: no email. */
  OPS_ALERT_EMAIL?: string;
  /** Public API origin; links to feedback screenshots are built on it. */
  API_URL?: string;
  /** Secret: enables the /__ops recovery endpoints (see ops-routes.ts). */
  OPS_TOKEN?: string;
  /** Comma-separated public URLs the cron checks every 5 minutes. */
  UPTIME_URLS?: string;
  /** Advanced analytics (opt-in, Basin): the install's monthly query budget. */
  BASIN_USAGE: DurableObjectNamespace<BasinUsageDurableObject>;
  /** `on` turns advanced analytics on; anything else (the default) is off. */
  FLAREPANEL_ADVANCED_ANALYTICS?: string;
  /** Monthly Basin SQL scan budget in GB (default 10, the free amount). */
  FLAREPANEL_ADVANCED_BUDGET_GB?: string;
  /** `namespace.table` of the Iceberg events table (default flarepanel.events). */
  FLAREPANEL_BASIN_TABLE?: string;
  /** Bucket with Basin Catalog on (default flarepanel-events). */
  FLAREPANEL_BASIN_BUCKET?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  /** Secret: R2 API token with Basin SQL, Catalog and storage read. */
  BASIN_SQL_TOKEN?: string;
  /** Basin Pipelines stream the project Durable Objects send events to. */
  EVENTS_STREAM?: { send(records: Record<string, unknown>[]): Promise<void> };
}

/** The three cookies the GSC OAuth flow signs (same as apps/api). */
const SIGNED_COOKIE_NAMES = [
  'gsc_oauth_state',
  'gsc_code_verifier',
  'gsc_project_id',
];
const BASE64_TRAILING_PADDING = /=+$/;

interface Booted {
  deps: AppDeps;
  fetch: (request: Request) => Response | Promise<Response>;
}

let booted: Booted | undefined;

async function boot(env: Env): Promise<Booted> {
  const config = loadConfig();
  const logger = createConsoleLogger(config.LOG_LEVEL ?? 'info');

  bindD1Database(env.DB);
  // Workers cannot spawn the Bun template sandbox; Dynamic Workers replace it.
  if (env.LOADER) {
    setSandboxRunner(createDynamicWorkerRunner(env.LOADER));
  }
  const stores = await createCloudflareStores(env);
  configurePlatformStores(stores);
  // IP geolocation for addresses request.cf cannot answer (DB-IP in GEO_DB).
  if (env.GEO_DB) {
    setGeoLookup(createGeoipLookup(env.GEO_DB, stores.cache));
  }

  const producers = createCloudflareProducers(queues, {
    sender: env.JOBS,
    coordination: stores.coordination,
    logger,
  });

  const deps: AppDeps = {
    db,
    prisma: { DbNull: Prisma.DbNull, JsonNull: Prisma.JsonNull },
    ch: createEmptyClickHouse(),
    redis: unavailableOnWorkers<AppDeps['redis']>('Redis'),
    stores,
    clients: createClients(),
    buffers: createWorkerBuffers(env, stores.cache, () => deps),
    producers,
    logger,
    config: config.core,
    auth: createAuth({
      db,
      config: config.core,
      logger,
      coordination: stores.coordination,
    }),
    ingest: createCloudflareIngestBackend({
      env,
      cache: stores.cache,
      deps: () => deps,
    }),
    // Over the plan's events, reads pause (hosted only); collection goes on.
    eventStore: guardAnalyticsPause(
      createWorkerEventStore(env),
      createPauseCheck({
        cache: stores.cache,
        selfHosted: () => deps.config.selfHosted,
        organizationOf: async (projectId) =>
          (
            await deps.db.project.findUnique({
              where: { id: projectId },
              select: {
                organization: {
                  select: {
                    subscriptionPeriodEventsCount: true,
                    subscriptionPeriodEventsLimit: true,
                    subscriptionPeriodEventsCountExceededAt: true,
                  },
                },
              },
            })
          )?.organization ?? null,
      })
    ),
  };
  const advanced = readAdvancedConfig(env);
  if (advanced) {
    deps.advancedAnalytics = createAdvancedAnalytics(env, advanced, () => deps);
  }

  // Screenshots attached to in-app feedback (feedback-screenshots.ts).
  if (env.EVENTS_ARCHIVE && env.API_URL) {
    deps.feedbackAttachments = createFeedbackScreenshotStore(
      env.EVENTS_ARCHIVE,
      env.API_URL
    );
  }

  const emailBinding = env.EMAIL;
  if (emailBinding) {
    // Loaded here, not at the top: @flarepanel/email pulls in @flarepanel/db.
    const { setEmailSender } = await import('@flarepanel/email');
    setEmailSender((email) =>
      emailBinding.send({
        from: email.from,
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        headers: email.headers,
        ...(email.replyTo ? { replyTo: email.replyTo } : {}),
      })
    );
  }

  // Device ids hash the visitor with the day's salt; the daily cron rotates
  // it, and the first two are created here, as apps/api does at boot.
  await createInitialSalts(deps);

  const signCookie = (value: string) =>
    `${value}.${createHmac('sha256', config.COOKIE_SECRET)
      .update(value)
      .digest('base64')
      .replace(BASE64_TRAILING_PADDING, '')}`;

  const trpc = createTrpcFetchHandler({
    router: appRouter,
    logger,
    cookieOptions: cookieOptions(config.core),
    ipHeaders: config.core.ipHeaders,
    simulateLatency: false,
    signCookie,
    demoMode: Boolean(config.core.demoUserId),
  });

  // Same root chain as apps/api: cors -> request context -> routes.
  const app = new Elysia({
    // Workers forbid code generation (eval / new Function) at request time,
    // and the app is built on the first request once bindings exist. Dynamic
    // mode on the standard web adapter generates no code.
    aot: false,
    cookie: config.COOKIE_SECRET
      ? { secrets: config.COOKIE_SECRET, sign: SIGNED_COOKIE_NAMES }
      : {},
  })
    .use(corsDelegator({ dashboardOrigins: config.dashboardOrigins }))
    .use(errorHandler(deps, { production: config.core.isProduction }))
    .use(requestLogging(deps, { verboseClientIds: config.verboseClientIds }))
    .use(opsRoutes(deps))
    .use(liveAccessRoute(deps))
    .use(publicApiRoutes(deps))
    .use(dashboardRoutes(deps))
    .all(
      `${TRPC_ENDPOINT}/*`,
      ({ request, ctx }: { request: Request; ctx: HttpCtx }) =>
        trpc(request, ctx),
      { parse: 'none' }
    );

  return { deps, fetch: (request) => app.fetch(request) };
}

/**
 * Only a finished boot is shared. Workers forbid one request from awaiting a
 * promise another request created: if the request that started the boot ends
 * first, the shared promise can never settle and every later request in the
 * isolate failed with "This promise was created by a request that has since
 * ended" (error 1101). Concurrent cold requests now each boot once; the first
 * to finish is kept.
 */
async function getBooted(env: Env): Promise<Booted> {
  if (booted) {
    return booted;
  }
  const fresh = await boot(env);
  booted ??= fresh;
  return booted;
}

const OPERATOR_ONLY_PATHS = new Set(['/metrics', '/misc/stats']);

const handlers = {
  async fetch(incoming: Request, env: Env): Promise<Response> {
    const insecure = httpsRedirect(incoming);
    if (insecure) {
      return insecure;
    }
    const url = new URL(incoming.url);
    const limited = await checkEdgeRateLimit(incoming, url.pathname, env);
    if (limited) {
      return limited;
    }
    const bounded = limitRequestBody(incoming);
    if ('response' in bounded) {
      return bounded.response;
    }
    const request = bounded.request;

    // Operator token only: Prometheus scrape output (per-isolate counters
    // that describe internals) and the install-wide totals (project and
    // event counts are business numbers, not public information).
    if (
      OPERATOR_ONLY_PATHS.has(url.pathname) &&
      !(await hasOpsToken(request, env))
    ) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    if (isOpsPath(url.pathname)) {
      return handleOps(
        request,
        env,
        (projectId) =>
          projectEventsStub(env, projectId) as unknown as Parameters<
            typeof handleOps
          >[2] extends (id: string) => infer S
            ? S
            : never
      );
    }

    const screenshot = await serveFeedbackScreenshot(
      request,
      url.pathname,
      env.EVENTS_ARCHIVE
    );
    if (screenshot) {
      return screenshot;
    }

    const { fetch } = await getBooted(env);

    const live = matchLivePath(url.pathname);
    if (live && request.headers.get('upgrade')?.toLowerCase() === 'websocket') {
      // The app checks the session and project access; the project's Durable
      // Object then holds the (hibernating) socket.
      const check = await fetch(
        new Request(new URL(live.accessPath + url.search, url), {
          headers: request.headers,
        })
      );
      if (!check.ok) {
        return check;
      }
      return projectEventsStub(env, live.projectId).fetch(request);
    }

    return fetch(request);
  },

  async queue(
    batch: MessageBatch,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    const { deps } = await getBooted(env);
    if (batch.queue === DEAD_LETTER_QUEUE) {
      await keepDeadLetters(batch.messages, env, deps.logger);
      return;
    }
    // GeoIP refresh steps share the jobs queue but not the job envelope.
    const jobs: Message[] = [];
    for (const message of batch.messages) {
      if (
        (message.body as { kind?: string } | null)?.kind === GEOIP_MESSAGE_KIND
      ) {
        try {
          await runGeoipRefreshStep(env);
          message.ack();
        } catch (error) {
          deps.logger.error({ err: error }, 'GeoIP refresh step failed');
          message.retry({ delaySeconds: 60 });
        }
      } else {
        jobs.push(message);
      }
    }
    await processCloudflareJobBatch(jobs as unknown as QueueMessageLike[], {
      definitions: queues,
      deps,
      onTerminalFailure: (failure) =>
        ctx.waitUntil(
          reportFailedJob(env, deps.logger, {
            source: 'retries-exhausted',
            queue: failure.queue,
            job: failure.job,
            jobId: failure.jobId,
            attempts: failure.attempts,
            error: failure.error.message,
            data: failure.data,
          })
        ),
    });
  },

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    const { deps } = await getBooted(env);
    ctx.waitUntil(
      maybeStartGeoipRefresh(env, controller.scheduledTime).catch((error) =>
        deps.logger.error({ err: error }, 'Could not start the GeoIP refresh')
      )
    );
    if (isUptimeMinute(controller.scheduledTime)) {
      ctx.waitUntil(runUptimeCheck(env, deps.logger));
    }
    await dispatchDueSchedules({
      schedulers: CRON_SCHEDULES,
      enqueueCron: cronEnqueuer(deps.producers, queues.cron),
      scheduledTime: controller.scheduledTime,
      logger: deps.logger,
    });
  },
};

// Every invocation runs with its own Prisma client (see `withRequestDb`):
// sharing one across concurrent requests let Prisma merge their lookups and
// the runtime cancel one of them as hung.
export default {
  fetch: (request, env) => withRequestDb(() => handlers.fetch(request, env)),
  queue: (batch, env, ctx) =>
    withRequestDb(() => handlers.queue(batch, env, ctx)),
  scheduled: (controller, env, ctx) =>
    withRequestDb(() => handlers.scheduled(controller, env, ctx)),
} satisfies ExportedHandler<Env>;
