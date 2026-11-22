/**
 * FlarePanel on Cloudflare Workers: the dashboard API (`/trpc`, public API,
 * auth) on D1, with the Cloudflare platform stores and job queue.
 *
 * Phase 2c scope: accounts, organizations, projects and clients. The event
 * pipeline (ingest, buffers, sessions) still runs on Bun and moves in Phase 3;
 * on Workers its dependencies are stand-ins that fail loudly if reached.
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
  createTrpcFetchHandler,
  dashboardRoutes,
  errorHandler,
  type HttpCtx,
  opsRoutes,
  publicApiRoutes,
  queues,
  requestLogging,
  TRPC_ENDPOINT,
} from '@flarepanel/core';
import {
  createCloudflareProducers,
  cronEnqueuer,
  dispatchDueSchedules,
  processCloudflareJobBatch,
  type QueueMessageLike,
} from '@flarepanel/core/jobs/cloudflare';
import { ch } from '@flarepanel/db/src/clickhouse/client';
// Aliased to prisma-client.workerd.ts in wrangler.jsonc.
import { db, Prisma } from '@flarepanel/db/src/prisma-client';
import { bindD1Database } from '@flarepanel/db/src/prisma-client.workerd';
import { configurePlatformStores } from '@flarepanel/platform';
import {
  CoordinatorDurableObject,
  createCloudflareStores,
  PubSubHubDurableObject,
} from '@flarepanel/platform/cloudflare';
import { Elysia } from 'elysia';
import { loadConfig } from '../../api/src/config/env';
import { createConsoleLogger } from './logger';
import { unavailableOnWorkers } from './unavailable-deps';

export { CoordinatorDurableObject, PubSubHubDurableObject };

export interface Env {
  DB: D1Database;
  COORDINATOR: DurableObjectNamespace<CoordinatorDurableObject>;
  PUBSUB_HUB: DurableObjectNamespace<PubSubHubDurableObject>;
  JOBS: Queue;
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

let booted: Promise<Booted> | undefined;

async function boot(env: Env): Promise<Booted> {
  const config = loadConfig();
  const logger = createConsoleLogger(config.LOG_LEVEL ?? 'info');

  bindD1Database(env.DB);
  const stores = await createCloudflareStores(env);
  configurePlatformStores(stores);

  const producers = createCloudflareProducers(queues, {
    sender: env.JOBS,
    coordination: stores.coordination,
    logger,
  });

  const deps: AppDeps = {
    db,
    prisma: { DbNull: Prisma.DbNull, JsonNull: Prisma.JsonNull },
    ch,
    redis: unavailableOnWorkers<AppDeps['redis']>('Redis'),
    stores,
    clients: createClients(),
    buffers: unavailableOnWorkers<AppDeps['buffers']>('Event buffers'),
    producers,
    logger,
    config: config.core,
    auth: createAuth({
      db,
      config: config.core,
      logger,
      coordination: stores.coordination,
    }),
  };

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

function getBooted(env: Env) {
  booted ??= boot(env).catch((error) => {
    booted = undefined;
    throw error;
  });
  return booted;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { fetch } = await getBooted(env);
    return fetch(request);
  },

  async queue(batch: MessageBatch, env: Env): Promise<void> {
    const { deps } = await getBooted(env);
    await processCloudflareJobBatch(
      batch.messages as unknown as QueueMessageLike[],
      { definitions: queues, deps }
    );
  },

  async scheduled(controller: ScheduledController, env: Env): Promise<void> {
    const { deps } = await getBooted(env);
    await dispatchDueSchedules({
      schedulers: CRON_SCHEDULES,
      enqueueCron: cronEnqueuer(deps.producers, queues.cron),
      scheduledTime: controller.scheduledTime,
      logger: deps.logger,
    });
  },
} satisfies ExportedHandler<Env>;
