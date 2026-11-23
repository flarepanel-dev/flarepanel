/**
 * The dashboard's live sockets on Workers. Elysia's `.ws` needs a server
 * runtime, so the Worker handles the upgrade itself: it asks this route
 * whether the caller may watch the project (same rules as the Bun routes),
 * then forwards the upgrade to the project's Durable Object.
 */
import { type AppDeps, type HttpCtx, requestContext } from '@flarepanel/core';
import { Elysia } from 'elysia';

const LIVE_PATH = /^\/live\/(events|visitors|notifications)\/([^/]+)$/;
const ACCESS_PREFIX = '/__live-access';
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;

export interface LivePath {
  kind: 'events' | 'visitors' | 'notifications';
  projectId: string;
  /** The internal route that answers whether the caller may connect. */
  accessPath: string;
}

export function matchLivePath(pathname: string): LivePath | null {
  const match = LIVE_PATH.exec(pathname);
  const kind = match?.[1];
  const projectId = match?.[2];
  if (!(kind && projectId)) {
    return null;
  }
  return {
    kind: kind as LivePath['kind'],
    projectId: decodeURIComponent(projectId),
    accessPath: `${ACCESS_PREFIX}/${kind}/${projectId}`,
  };
}

function hasMemberAccess(ctx: HttpCtx, userId: string, projectId: string) {
  return ctx.services.auth
    .getProjectAccess({ userId, projectId })
    .then((access) => Boolean(access))
    .catch(() => false);
}

export function liveAccessRoute(deps: AppDeps) {
  return new Elysia({ name: 'worker/live-access' })
    .use(requestContext(deps))
    .get(
      `${ACCESS_PREFIX}/:kind/:projectId`,
      async ({ ctx, params, query, status }) => {
        const { kind, projectId } = params as {
          kind: string;
          projectId: string;
        };
        const shareId = (query as { shareId?: string }).shareId;
        if (kind === 'visitors' && shareId) {
          const shared = await ctx.services.share
            .canShareViewLiveVisitors({ projectId, shareId }, ctx.cookies)
            .catch(() => false);
          if (shared) {
            return { ok: true };
          }
        }
        const userId = (await ctx.session().catch(() => null))?.userId;
        if (!userId) {
          return status(UNAUTHORIZED, { ok: false, reason: 'no-session' });
        }
        if (!(await hasMemberAccess(ctx, userId, projectId))) {
          return status(FORBIDDEN, { ok: false, reason: 'no-access' });
        }
        return { ok: true };
      }
    );
}
