// `get`/`toggle`/`updateOptions` require a login; `counter`/`badge`/
// `realtimeData` are deliberately open, because a widget is embedded on a
// public page.
//
// Every statement is built with the project's timezone, so `chQuery` is given
// the same value as `clickhouse_settings.session_timezone`.

import { sql } from '@flarepanel/db/src/clickhouse/sql';
import { getCache } from '@flarepanel/redis';
import ShortUniqueId from 'short-unique-id';
import { z } from 'zod';
import { chQuery } from '../../ch-query';
import type { Ctx } from '../../context';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '../../rpc/base';
import { TRPCNotFoundError } from '../../rpc/errors';
import type { ServiceDeps } from '../../services';
import { TABLE_NAMES } from '../../shared/ch-tables';
import type { RealtimeQuery } from '../ingest/cloudflare/realtime-scan';
import { wallClockText } from '../ingest/cloudflare/time-buckets';
import { getSettingsForProject } from '../organization/organization.service';
import {
  zCounterWidgetOptions,
  zRealtimeWidgetOptions,
  zTrafficWidgetOptions,
  zWidgetOptions,
  zWidgetType,
} from '../report/report.constants';

const uid = new ShortUniqueId({ length: 6 });
const BADGE_CACHE_TTL_SECONDS = 5 * 60; // queries 30 days of data
const REALTIME_TOP_LIST_LIMIT = 10;
const BADGE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const REALTIME_MINUTES = 30;
const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const TRAFFIC_CACHE_TTL_SECONDS = 5 * 60;
const TRAFFIC_TOP_LIST_LIMIT = 5;
/** Rows read before merging by name, so the merged top five stay right. */
const TRAFFIC_TOP_LIST_READ = 50;

/** Sums rows that share a name and returns the largest `TRAFFIC_TOP_LIST_LIMIT`. */
export function topByName(
  rows: { name: string; pageviews: number; sessions: number }[],
  field: 'pageviews' | 'sessions'
): [string, number][] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    if (row.name) {
      totals.set(row.name, (totals.get(row.name) ?? 0) + row[field]);
    }
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TRAFFIC_TOP_LIST_LIMIT);
}

/** The realtime widget's numbers from the project's Durable Object. */
async function realtimeWidgetFromEventStore(
  store: NonNullable<ServiceDeps['eventStore']>,
  projectId: string,
  timezone: string,
  options: { countries?: boolean; referrers?: boolean; paths?: boolean }
) {
  const read = async <T>(query: RealtimeQuery): Promise<T> =>
    JSON.parse(await store.realtime(projectId, query)) as T;
  const [histogram, sources, paths] = await Promise.all([
    read<{
      totalSessions: number;
      minutes: { minute: number; sessions: number; visitors: number }[];
      now: number;
    }>({ kind: 'histogram' }),
    options.countries || options.referrers
      ? read<{
          referrers: { name: string; sessions: number }[];
          countries: { country: string; sessions: number }[];
        }>({ kind: 'topSources', limit: REALTIME_TOP_LIST_LIMIT })
      : Promise.resolve({ referrers: [], countries: [] }),
    options.paths
      ? read<{ path: string; count: number }[]>({
          kind: 'topPaths',
          limit: REALTIME_TOP_LIST_LIMIT,
        })
      : Promise.resolve([]),
  ]);
  const byMinute = new Map(histogram.minutes.map((row) => [row.minute, row]));
  const last = Math.floor(histogram.now / MINUTE_MS) * MINUTE_MS;
  const minutes = Array.from({ length: REALTIME_MINUTES + 1 }, (_, index) => {
    const minute = last - (REALTIME_MINUTES - index) * MINUTE_MS;
    const row = byMinute.get(minute);
    return {
      minute: wallClockText(minute, timezone),
      sessionCount: row?.sessions ?? 0,
      visitorCount: row?.visitors ?? 0,
      timestamp: minute,
      time: new Date(minute).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
      }),
    };
  });
  return {
    liveCount: histogram.totalSessions,
    histogram: minutes,
    countries: options.countries
      ? sources.countries.map((row) => ({
          country: row.country,
          count: row.sessions,
        }))
      : [],
    referrers: options.referrers
      ? sources.referrers.map((row) => ({
          referrer: row.name,
          count: row.sessions,
        }))
      : [],
    paths: paths.map((row) => ({ path: row.path, count: row.count })),
  };
}

const EVENTS_TABLE = sql.id(TABLE_NAMES.events);
const REALTIME_WINDOW = sql`created_at >= (now() - INTERVAL 30 MINUTE)`;

// The type lives in the `options` JSON, so nothing stops two concurrent
// enables from each creating a row; reads take the oldest, writes hit all.
// D1 is SQLite, where Prisma takes a JSON path as one `$.key` string (the
// array form is Postgres only and fails at runtime).
function widgetsOfType(projectId: string, type: z.infer<typeof zWidgetType>) {
  return { projectId, options: { path: '$.type', equals: type } };
}

function findWidgetByType(
  db: Ctx['db'],
  projectId: string,
  type: z.infer<typeof zWidgetType>
) {
  return db.shareWidget.findFirst({
    where: widgetsOfType(projectId, type),
    orderBy: { createdAt: 'asc' },
  });
}

// Shared by toggle/updateOptions: same update-or-create shape, differing only
// in which field is written and the create-time default. The update covers
// every row of the type, so disabling a widget revokes duplicate links too.
async function upsertWidgetByType(
  db: Ctx['db'],
  params: {
    projectId: string;
    organizationId: string;
    type: z.infer<typeof zWidgetType>;
    update: { public: boolean } | { options: z.infer<typeof zWidgetOptions> };
    create: { public: boolean; options: z.infer<typeof zWidgetOptions> };
  }
) {
  const { count } = await db.shareWidget.updateMany({
    where: widgetsOfType(params.projectId, params.type),
    data: params.update,
  });
  const existing =
    count > 0
      ? await findWidgetByType(db, params.projectId, params.type)
      : null;
  if (existing) {
    return existing;
  }

  return db.shareWidget.create({
    data: {
      id: uid.rnd(),
      projectId: params.projectId,
      organizationId: params.organizationId,
      public: params.create.public,
      options: params.create.options,
    },
  });
}

// Shared by counter/badge: both require the widget to exist, be public and
// be a counter widget before doing anything else.
async function findPublicCounterWidgetOrThrow(db: Ctx['db'], shareId: string) {
  const widget = await db.shareWidget.findUnique({
    where: { id: shareId },
  });

  if (!widget?.public) {
    throw new TRPCNotFoundError('Widget not found');
  }

  if (widget.options.type !== 'counter') {
    throw new TRPCNotFoundError('Invalid widget type');
  }

  return widget;
}

export const widgetRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ projectId: z.string(), type: zWidgetType }))
    .query(async ({ input, ctx }) => {
      const widget = await findWidgetByType(
        ctx.db,
        input.projectId,
        input.type
      );

      if (!widget) {
        return null;
      }

      return widget;
    }),

  toggle: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        organizationId: z.string(),
        type: zWidgetType,
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.services.auth.requireProjectAccess({
        userId: ctx.session.userId,
        projectId: input.projectId,
        level: 'write',
      });

      const defaultOptions =
        input.type === 'realtime'
          ? zRealtimeWidgetOptions.parse({ type: 'realtime' })
          : input.type === 'traffic'
            ? zTrafficWidgetOptions.parse({ type: 'traffic' })
            : zCounterWidgetOptions.parse({ type: 'counter' });

      return upsertWidgetByType(ctx.db, {
        projectId: input.projectId,
        organizationId: input.organizationId,
        type: input.type,
        update: { public: input.enabled },
        create: { public: input.enabled, options: defaultOptions },
      });
    }),

  updateOptions: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        organizationId: z.string(),
        options: zWidgetOptions,
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.services.auth.requireProjectAccess({
        userId: ctx.session.userId,
        projectId: input.projectId,
        level: 'write',
      });

      return upsertWidgetByType(ctx.db, {
        projectId: input.projectId,
        organizationId: input.organizationId,
        type: input.options.type,
        update: { options: input.options },
        create: { public: false, options: input.options },
      });
    }),

  counter: publicProcedure
    .input(z.object({ shareId: z.string() }))
    .query(async ({ input, ctx }) => {
      const widget = await findPublicCounterWidgetOrThrow(
        ctx.db,
        input.shareId
      );
      const eventBuffer = ctx.buffers.event;

      return {
        projectId: widget.projectId,
        counter: await eventBuffer.getActiveVisitorCount(widget.projectId),
      };
    }),

  badge: publicProcedure
    .input(z.object({ shareId: z.string() }))
    .query(async ({ input, ctx }) => {
      const widget = await findPublicCounterWidgetOrThrow(
        ctx.db,
        input.shareId
      );
      const { projectId } = widget;
      const { timezone } = await getSettingsForProject(ctx, projectId);

      const cacheKey = `widget:badge:${projectId}`;
      const visitors = await getCache(
        cacheKey,
        BADGE_CACHE_TTL_SECONDS,
        async () => {
          if (ctx.eventStore) {
            const now = Date.now();
            const { totals } = await ctx.eventStore.metrics(projectId, {
              from: now - BADGE_WINDOW_MS,
              to: now,
              interval: 'day',
              timezone,
            });
            return totals.visitors;
          }
          const result = await chQuery<{ count: number }>(
            ctx,
            sql`SELECT uniq(profile_id) as count FROM ${EVENTS_TABLE} WHERE project_id = ${sql.string(projectId)} AND created_at >= (now() - INTERVAL 30 DAY)`,
            { session_timezone: timezone }
          );
          return result[0]?.count || 0;
        }
      );

      return {
        projectId,
        visitors,
      };
    }),

  trafficData: publicProcedure
    .input(z.object({ shareId: z.string() }))
    .query(async ({ input, ctx }) => {
      const widget = await ctx.db.shareWidget.findUnique({
        where: { id: input.shareId },
        include: { project: { select: { domain: true, name: true } } },
      });
      if (!widget?.public) {
        throw new TRPCNotFoundError('Widget not found');
      }
      const { projectId, options } = widget;
      if (options.type !== 'traffic') {
        throw new TRPCNotFoundError('Invalid widget type');
      }
      const store = ctx.eventStore;
      if (!store) {
        // Self-hosted ClickHouse installs keep the realtime/counter widgets.
        throw new TRPCNotFoundError('Traffic widget needs the event store');
      }
      const { timezone } = await getSettingsForProject(ctx, projectId);
      const days = options.range === '7d' ? 7 : 30;
      const cacheKey = `widget:traffic:${widget.id}:${options.range}:${options.pages ? 1 : 0}${options.referrers ? 1 : 0}`;

      const data = await getCache(
        cacheKey,
        TRAFFIC_CACHE_TTL_SECONDS,
        async () => {
          const to = Date.now();
          const from = to - days * DAY_MS;
          const [metrics, pages, referrers] = await Promise.all([
            store.metrics(projectId, { from, to, interval: 'day', timezone }),
            options.pages
              ? store.topDimension(
                  projectId,
                  'path',
                  new Date(from),
                  new Date(to),
                  TRAFFIC_TOP_LIST_READ
                )
              : Promise.resolve([]),
            options.referrers
              ? store.topDimension(
                  projectId,
                  'referrer_name',
                  new Date(from),
                  new Date(to),
                  TRAFFIC_TOP_LIST_READ
                )
              : Promise.resolve([]),
          ]);
          return {
            visitors: metrics.totals.visitors,
            pageviews: metrics.totals.screenViews,
            series: metrics.series.map((point) => ({
              // The project's local day, `yyyy-MM-dd`.
              date: wallClockText(point.start, timezone).slice(0, 10),
              visitors: point.visitors,
              pageviews: point.screenViews,
            })),
            // A path comes once per origin (www and apex, preview hosts):
            // the widget shows it once.
            pages: topByName(pages, 'pageviews').map(([path, count]) => ({
              path,
              count,
            })),
            referrers: topByName(referrers, 'sessions').map(
              ([referrer, count]) => ({ referrer, count })
            ),
          };
        }
      );

      return {
        projectId,
        project: widget.project,
        range: options.range,
        ...data,
      };
    }),

  realtimeData: publicProcedure
    .input(z.object({ shareId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = ctx.db;
      const widget = await db.shareWidget.findUnique({
        where: {
          id: input.shareId,
        },
        include: {
          project: {
            select: {
              domain: true,
              name: true,
            },
          },
        },
      });

      if (!widget?.public) {
        throw new TRPCNotFoundError('Widget not found');
      }

      const { projectId, options } = widget;

      if (options.type !== 'realtime') {
        throw new TRPCNotFoundError('Invalid widget type');
      }

      const { timezone } = await getSettingsForProject(ctx, projectId);

      if (ctx.eventStore) {
        return {
          projectId,
          project: widget.project,
          ...(await realtimeWidgetFromEventStore(
            ctx.eventStore,
            projectId,
            timezone,
            options
          )),
        };
      }

      const settings = { session_timezone: timezone };
      const totalSessionsStatement = sql`SELECT uniq(session_id) as total_sessions FROM ${EVENTS_TABLE} WHERE project_id = ${sql.string(projectId)} AND ${REALTIME_WINDOW}`;

      const minuteCountsStatement = sql`SELECT toStartOfMinute(created_at) as minute, uniq(session_id) as session_count, uniq(profile_id) as visitor_count FROM ${EVENTS_TABLE} WHERE project_id = ${sql.string(projectId)} AND ${REALTIME_WINDOW} GROUP BY minute ORDER BY minute ASC WITH FILL FROM toStartOfMinute(now() - INTERVAL 30 MINUTE) TO toStartOfMinute(now()) STEP INTERVAL 1 MINUTE`;

      const countriesQueryPromise = options.countries
        ? chQuery<{ country: string; count: number }>(
            ctx,
            sql`SELECT country, uniq(session_id) as count FROM ${EVENTS_TABLE} WHERE project_id = ${sql.string(projectId)} AND ${REALTIME_WINDOW} AND country != '' AND country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT ${sql.uint64(REALTIME_TOP_LIST_LIMIT)}`,
            settings
          )
        : Promise.resolve<Array<{ country: string; count: number }>>([]);

      const referrersQueryPromise = options.referrers
        ? chQuery<{ referrer: string; count: number }>(
            ctx,
            sql`SELECT referrer_name as referrer, uniq(session_id) as count FROM ${EVENTS_TABLE} WHERE project_id = ${sql.string(projectId)} AND ${REALTIME_WINDOW} AND referrer_name != '' AND referrer_name IS NOT NULL GROUP BY referrer_name ORDER BY count DESC LIMIT ${sql.uint64(REALTIME_TOP_LIST_LIMIT)}`,
            settings
          )
        : Promise.resolve<Array<{ referrer: string; count: number }>>([]);

      const pathsQueryPromise = options.paths
        ? chQuery<{ path: string; count: number }>(
            ctx,
            sql`SELECT path, uniq(session_id) as count FROM ${EVENTS_TABLE} WHERE project_id = ${sql.string(projectId)} AND ${REALTIME_WINDOW} AND path != '' AND path IS NOT NULL GROUP BY path ORDER BY count DESC LIMIT ${sql.uint64(REALTIME_TOP_LIST_LIMIT)}`,
            settings
          )
        : Promise.resolve<Array<{ path: string; count: number }>>([]);

      const [totalSessions, minuteCounts, countries, referrers, paths] =
        await Promise.all([
          chQuery<{ total_sessions: number }>(
            ctx,
            totalSessionsStatement,
            settings
          ),
          chQuery<{
            minute: string;
            session_count: number;
            visitor_count: number;
          }>(ctx, minuteCountsStatement, settings),
          countriesQueryPromise,
          referrersQueryPromise,
          pathsQueryPromise,
        ]);

      return {
        projectId,
        liveCount: totalSessions[0]?.total_sessions || 0,
        project: widget.project,
        histogram: minuteCounts.map((item) => ({
          minute: item.minute,
          sessionCount: item.session_count,
          visitorCount: item.visitor_count,
          timestamp: new Date(item.minute).getTime(),
          time: new Date(item.minute).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        })),
        countries: countries.map((item) => ({
          country: item.country,
          count: item.count,
        })),
        referrers: referrers.map((item) => ({
          referrer: item.referrer,
          count: item.count,
        })),
        paths: paths.map((item) => ({
          path: item.path,
          count: item.count,
        })),
      };
    }),
});
