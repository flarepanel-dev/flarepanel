// Connect Cloudflare: one connection per project (token encrypted at rest,
// zone, hostname filter), the zone picker, and the hourly sync that imports
// crawler hits from the zone's analytics into the project's bot store.

import {
  decryptCredential,
  encryptCredential,
} from '@flarepanel/shared/server';
import type { Logger } from '../../logger';
import type { ServiceDeps, Services } from '../../services';
import { botMonthlyCap } from '../event/event.constants';
import {
  type CloudflareConnectInput,
  type CloudflareSyncStatus,
  type ICloudflareConnection,
  type ICloudflareSetup,
  type ICloudflareZoneList,
  parseHostnames,
} from './cloudflare-analytics.constants';
import {
  type ApiOptions,
  CloudflareApiError,
  checkCloudflareZone,
  listCloudflareZones,
} from './src/api';
import { runCloudflareSync } from './src/sync';

const TOKEN_HINT_LENGTH = 4;
const ERROR_MAX_LENGTH = 500;
const SYNC_NOW_WINDOW_MS = 60_000;

/** A problem the person connecting can fix; shown to them as is. */
export class CloudflareConnectError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CloudflareConnectError';
  }
}

type Deps = Pick<ServiceDeps, 'db' | 'config' | 'eventStore' | 'logger'>;

interface ConnectionRow {
  encryptedToken: string;
  tokenHint: string;
  zoneId: string;
  zoneName: string;
  hostnames: unknown;
  syncedThrough: Date | null;
  lastSyncedAt: Date | null;
  lastSyncStatus: string | null;
  lastSyncError: string | null;
  lastSyncHits: number | null;
  createdAt: Date;
}

function view(row: ConnectionRow): ICloudflareConnection {
  return {
    zoneId: row.zoneId,
    zoneName: row.zoneName,
    tokenHint: row.tokenHint,
    hostnames: Array.isArray(row.hostnames)
      ? parseHostnames(row.hostnames.map(String))
      : [],
    syncedThrough: row.syncedThrough,
    lastSyncedAt: row.lastSyncedAt,
    lastSyncStatus: row.lastSyncStatus as CloudflareSyncStatus | null,
    lastSyncError: row.lastSyncError,
    lastSyncHits: row.lastSyncHits,
    createdAt: row.createdAt,
  };
}

/** The project's own hostnames: its domain (with and without `www.`) and CORS origins. */
export function projectHostnames(project: {
  domain: string | null;
  cors: unknown;
}): string[] {
  const hosts = parseHostnames(
    [project.domain ?? '', ...(Array.isArray(project.cors) ? project.cors : [])]
      .map(String)
      .filter(Boolean)
  );
  const [domain] = project.domain ? parseHostnames([project.domain]) : [];
  if (domain) {
    hosts.push(domain.startsWith('www.') ? domain.slice(4) : `www.${domain}`);
  }
  return parseHostnames(hosts);
}

function storeAvailable(deps: Deps): boolean {
  return typeof deps.eventStore?.botImport === 'function';
}

function messageFor(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  return text.slice(0, ERROR_MAX_LENGTH);
}

function decryptToken(deps: Deps, encrypted: string): string {
  try {
    return decryptCredential(deps.config.encryptionKey, encrypted);
  } catch {
    throw new CloudflareConnectError(
      'The stored Cloudflare token can no longer be read. Paste the token again.'
    );
  }
}

export async function getCloudflareSetup(
  deps: Deps,
  projectId: string
): Promise<ICloudflareSetup> {
  const [project, row] = await Promise.all([
    deps.db.project.findUnique({
      where: { id: projectId },
      select: { domain: true, cors: true },
    }),
    deps.db.cloudflareConnection.findUnique({ where: { projectId } }),
  ]);
  return {
    available: storeAvailable(deps),
    defaultHostnames: project ? projectHostnames(project) : [],
    connection: row ? view(row) : null,
  };
}

async function storedToken(deps: Deps, projectId: string): Promise<string> {
  const row = await deps.db.cloudflareConnection.findUnique({
    where: { projectId },
    select: { encryptedToken: true },
  });
  if (!row) {
    throw new CloudflareConnectError('Paste a Cloudflare API token first.');
  }
  return decryptToken(deps, row.encryptedToken);
}

/**
 * The zones a token can read. Listing needs Zone → Zone → Read; without it
 * the answer says why and the zone ID can be entered by hand.
 */
export async function listZonesForToken(
  deps: Deps,
  projectId: string,
  token: string | undefined,
  api: ApiOptions = {}
): Promise<ICloudflareZoneList> {
  const secret = token ?? (await storedToken(deps, projectId));
  try {
    return { zones: await listCloudflareZones(secret, api), listError: null };
  } catch (error) {
    if (error instanceof CloudflareApiError && error.kind === 'auth') {
      return {
        zones: [],
        listError:
          'This token cannot list zones (that needs Zone → Zone → Read). Enter the zone ID instead: it is on the zone’s Overview page in Cloudflare.',
      };
    }
    if (error instanceof CloudflareApiError) {
      throw new CloudflareConnectError(error.message);
    }
    throw error;
  }
}

/**
 * Checks the token against the zone with one small GraphQL query, then
 * stores the connection (token encrypted) and queues its first sync.
 */
export async function connectCloudflare(
  deps: Deps,
  input: CloudflareConnectInput & { userId: string },
  api: ApiOptions = {}
): Promise<ICloudflareConnection> {
  if (!storeAvailable(deps)) {
    throw new CloudflareConnectError(
      'Bot traffic is kept only on the Cloudflare Workers deployment, so this server cannot import it.'
    );
  }
  if (!deps.config.encryptionKey) {
    throw new CloudflareConnectError(
      'This server has no ENCRYPTION_KEY, so it cannot store tokens safely.'
    );
  }
  const existing = await deps.db.cloudflareConnection.findUnique({
    where: { projectId: input.projectId },
  });
  const token =
    input.token ??
    (existing ? decryptToken(deps, existing.encryptedToken) : null);
  if (!token) {
    throw new CloudflareConnectError('Paste a Cloudflare API token.');
  }

  try {
    await checkCloudflareZone(token, input.zoneId, api);
  } catch (error) {
    if (error instanceof CloudflareApiError) {
      throw new CloudflareConnectError(
        error.kind === 'auth'
          ? 'Cloudflare rejected this token for that zone. Use a token with Zone → Analytics → Read that includes this zone.'
          : `Cloudflare could not check the zone: ${error.message}`
      );
    }
    throw error;
  }

  let zoneName = existing?.zoneId === input.zoneId ? existing.zoneName : '';
  if (!zoneName) {
    try {
      const zones = await listCloudflareZones(token, api);
      zoneName = zones.find((zone) => zone.id === input.zoneId)?.name ?? '';
    } catch {
      // Listing needs Zone Read, which the token may not have.
    }
  }

  const zoneChanged = existing?.zoneId !== input.zoneId;
  const hostnamesChanged =
    JSON.stringify(existing ? view(existing).hostnames : null) !==
    JSON.stringify(input.hostnames);
  const data = {
    encryptedToken: encryptCredential(deps.config.encryptionKey, token),
    tokenHint: token.slice(-TOKEN_HINT_LENGTH),
    zoneId: input.zoneId,
    zoneName,
    hostnames: input.hostnames,
    createdByUserId: input.userId,
    // A new zone or filter starts over: the first sync reads back 7 days.
    ...(zoneChanged || hostnamesChanged
      ? {
          syncedThrough: null,
          lastSyncStatus: null,
          lastSyncError: null,
          lastSyncHits: null,
        }
      : {}),
  };
  const row = await deps.db.cloudflareConnection.upsert({
    where: { projectId: input.projectId },
    create: { projectId: input.projectId, ...data },
    update: data,
  });
  return view(row);
}

export async function disconnectCloudflare(
  deps: Deps,
  projectId: string
): Promise<void> {
  await deps.db.cloudflareConnection.deleteMany({ where: { projectId } });
}

export async function listCloudflareConnectionsForSync(
  deps: Deps
): Promise<{ projectId: string }[]> {
  return deps.db.cloudflareConnection.findMany({
    select: { projectId: true },
  });
}

async function recordSync(
  deps: Deps,
  projectId: string,
  data: {
    lastSyncStatus: CloudflareSyncStatus;
    lastSyncError: string | null;
    lastSyncHits?: number;
  }
): Promise<void> {
  await deps.db.cloudflareConnection.updateMany({
    where: { projectId },
    data: { ...data, lastSyncedAt: new Date() },
  });
}

/**
 * The `cloudflareProjectSync` job body. A rate limit or an unreachable
 * Cloudflare rethrows so the queue retries later; a rejected token is
 * recorded and waits for the user to fix it.
 */
export async function runCloudflareProjectSync(
  deps: Deps,
  projectId: string,
  options: ApiOptions & { now?: number; logger?: Logger } = {}
): Promise<void> {
  const logger = options.logger ?? deps.logger;
  const row = await deps.db.cloudflareConnection.findUnique({
    where: { projectId },
  });
  if (!row) {
    logger.info({ projectId }, 'Cloudflare sync skipped: not connected');
    return;
  }
  const store = deps.eventStore;
  if (!store?.botImport) {
    await recordSync(deps, projectId, {
      lastSyncStatus: 'error',
      lastSyncError:
        'Bot traffic is kept only on the Cloudflare Workers deployment.',
    });
    return;
  }
  const botImport = store.botImport.bind(store);

  try {
    const token = decryptToken(deps, row.encryptedToken);
    const limits = await checkCloudflareZone(token, row.zoneId, options);
    const outcome = await runCloudflareSync({
      ...options,
      token,
      zoneId: row.zoneId,
      hostnames: view(row).hostnames,
      syncedThrough: row.syncedThrough,
      now: options.now ?? Date.now(),
      limits,
      projectId,
      monthlyCap: botMonthlyCap(deps.config.selfHosted),
      write: (batch) => botImport(projectId, batch),
      saveCursor: async (through) => {
        await deps.db.cloudflareConnection.updateMany({
          where: { projectId },
          data: { syncedThrough: through },
        });
      },
    });
    await recordSync(deps, projectId, {
      lastSyncStatus: 'success',
      lastSyncError: null,
      lastSyncHits: outcome.hits,
    });
    logger.info(
      {
        projectId,
        hits: outcome.hits,
        rows: outcome.rows,
        queries: outcome.queries,
        skippedHours: outcome.skippedHours,
        cappedHours: outcome.cappedHours,
        complete: outcome.complete,
        statusMode: outcome.mode.status,
      },
      'Cloudflare sync completed'
    );
  } catch (error) {
    if (error instanceof CloudflareConnectError) {
      await recordSync(deps, projectId, {
        lastSyncStatus: 'auth_error',
        lastSyncError: error.message,
      });
      return;
    }
    if (error instanceof CloudflareApiError && error.kind === 'auth') {
      await recordSync(deps, projectId, {
        lastSyncStatus: 'auth_error',
        lastSyncError:
          'Cloudflare rejected the token for this zone. Create a token with Zone → Analytics → Read and connect again.',
      });
      return;
    }
    const rateLimited =
      error instanceof CloudflareApiError && error.kind === 'rate_limit';
    await recordSync(deps, projectId, {
      lastSyncStatus: rateLimited ? 'rate_limited' : 'error',
      lastSyncError: messageFor(error),
    });
    logger.warn({ err: error, projectId }, 'Cloudflare sync failed');
    if (
      rateLimited ||
      (error instanceof CloudflareApiError && error.kind === 'unavailable')
    ) {
      throw error;
    }
  }
}

/** `ctx.services.cloudflareAnalytics`. */
export function createCloudflareAnalyticsService(
  deps: ServiceDeps,
  _services: () => Services
) {
  const logger = deps.logger.child({ module: 'cloudflare-analytics' });

  return {
    getSetup: (projectId: string): Promise<ICloudflareSetup> =>
      getCloudflareSetup(deps, projectId),
    listZones: (
      projectId: string,
      token: string | undefined
    ): Promise<ICloudflareZoneList> =>
      listZonesForToken(deps, projectId, token),
    /** Also queues the first sync. */
    connect: async (
      input: CloudflareConnectInput & { userId: string }
    ): Promise<ICloudflareConnection> => {
      const connection = await connectCloudflare(deps, input);
      await deps.queues.gsc.cloudflareProjectSync.add(
        { projectId: input.projectId },
        {
          deduplicationId: `cloudflare-sync-now:${input.projectId}:${Math.floor(Date.now() / SYNC_NOW_WINDOW_MS)}`,
        }
      );
      return connection;
    },
    /** Queues a sync; repeated clicks within a minute queue one. */
    syncNow: async (projectId: string): Promise<void> => {
      const row = await deps.db.cloudflareConnection.findUnique({
        where: { projectId },
        select: { id: true },
      });
      if (!row) {
        throw new CloudflareConnectError('Connect a Cloudflare zone first.');
      }
      await deps.queues.gsc.cloudflareProjectSync.add(
        { projectId },
        {
          deduplicationId: `cloudflare-sync-now:${projectId}:${Math.floor(Date.now() / SYNC_NOW_WINDOW_MS)}`,
        }
      );
    },
    disconnect: (projectId: string): Promise<void> =>
      disconnectCloudflare(deps, projectId),
    listConnectionsForSync: (): Promise<{ projectId: string }[]> =>
      listCloudflareConnectionsForSync(deps),
    runProjectSync: (projectId: string): Promise<void> =>
      runCloudflareProjectSync(deps, projectId, { logger }),
  };
}
