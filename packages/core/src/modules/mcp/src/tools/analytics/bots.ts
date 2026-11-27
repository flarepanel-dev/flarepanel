import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  BOT_GROUP_LABELS,
  BOT_GROUPS,
  BOT_STATS_TOP_LIMIT,
} from '../../../../event/event.constants';
import { getBotStats } from '../../../../event/event.service';
import { getSettingsForProject } from '../../../../organization/organization.service';
import { zRange } from '../../../../report/report.constants';
import { getChartStartEndDate } from '../../../../report/src/chart-dates';
import {
  MAX_SERIES_POINTS,
  type McpToolDeps,
  projectIdSchema,
  resolveDateRange,
  resolveProjectId,
  table,
  withErrorHandling,
  zDateRange,
  zLimit,
} from '../shared';

const DEFAULT_BOTS_LIMIT = 15;

const GROUPS_TEXT = BOT_GROUPS.map(
  (group) => `"${group}" (${BOT_GROUP_LABELS[group]})`
).join(', ');

export function registerBotTools(
  server: McpServer,
  { context, deps }: McpToolDeps
) {
  server.tool(
    'get_bot_traffic',
    `Get AI crawler and bot traffic: requests that AI assistants, AI crawlers and search engines made to the site, as reported server-side through /track/crawl (crawlers never run the tracking script, so they are not in sessions or pageviews). Groups: ${GROUPS_TEXT}. "answers" are fetches a person triggered in ChatGPT, Claude, Perplexity and similar; "training" collects data for models. Returns totals per group, a daily series in the project's time zone, the top bots with their detector category, and the most crawled pages with how many 4xx/5xx responses bots got. Kept for 30 days. For human visitors who came from AI answers, use get_top_referrers with breakdown "referrer_type" (type "ai").`,
    {
      projectId: projectIdSchema(context),
      ...zDateRange,
      range: zRange
        .optional()
        .describe(
          'A named range in the project time zone (e.g. "today", "7d", "30d"). Overrides startDate/endDate.'
        ),
      group: z.enum(BOT_GROUPS).optional().describe('Keep one group only'),
      verified: z
        .boolean()
        .optional()
        .describe(
          'true: only hits the site edge verified as the real bot (Cloudflare verified bots); default: all hits'
        ),
      limit: zLimit(DEFAULT_BOTS_LIMIT, BOT_STATS_TOP_LIMIT),
    },
    async ({
      projectId: inputProjectId,
      startDate: sd,
      endDate: ed,
      range,
      group,
      verified,
      limit,
    }) =>
      withErrorHandling(deps, async () => {
        const projectId = await resolveProjectId(deps, context, inputProjectId);
        const { timezone } = await getSettingsForProject(deps, projectId);
        const { startDate, endDate } = range
          ? getChartStartEndDate({ range }, timezone)
          : resolveDateRange(sd, ed);
        const rowLimit = limit ?? DEFAULT_BOTS_LIMIT;
        const stats = await getBotStats(deps, {
          projectId,
          startDate,
          endDate,
          timezone,
          group,
          verified: verified ? 'verified' : 'all',
        });

        const series = stats.series.slice(-MAX_SERIES_POINTS);
        return {
          window: { startDate, endDate, timezone },
          ...(group ? { group } : {}),
          verified_only: stats.verifiedOnly,
          totals: stats.totals,
          // `cloudflare`: sampled estimates imported from a connected zone.
          sources: stats.sources,
          verified_hits: stats.verifiedHits,
          usage: stats.usage,
          daily: table(series, {
            limit: MAX_SERIES_POINTS,
            columns: [
              'date',
              'total',
              'answers',
              'indexing',
              'training',
              'search',
              'other',
            ],
          }),
          top_bots: table(
            stats.topBots.map((bot) => ({
              name: bot.name,
              group: bot.group,
              category: bot.category,
              hits: bot.hits,
              verified_hits: bot.verifiedHits,
              last_seen: new Date(bot.lastSeen).toISOString(),
            })),
            {
              limit: rowLimit,
              sum: ['hits', 'verified_hits'],
              sortedBy: 'hits',
              unit: 'bots',
            }
          ),
          top_pages: table(
            stats.topPaths.map((page) => ({
              path: page.path,
              hits: page.hits,
              status_4xx: page.status['4xx'],
              status_5xx: page.status['5xx'],
              bots: page.bots.map((bot) => bot.name).join(', '),
              last_seen: new Date(page.lastSeen).toISOString(),
            })),
            {
              limit: rowLimit,
              sum: ['hits', 'status_4xx', 'status_5xx'],
              sortedBy: 'hits',
              unit: 'pages',
            }
          ),
        };
      })
  );
}
