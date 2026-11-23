// On Workers the chart engine's rows come from the project's Durable Object
// instead of ClickHouse: the same label/date/count rows, so grouping,
// formulas and formatting stay shared.

import type { ServiceDeps } from '../../../../services';
import type { ISerieDataItem } from '../../../../shared/group-by-labels';
import { AdvancedAnalyticsBudgetError } from '../../../event/src/advanced-analytics';
import {
  basinChartSql,
  UnsupportedBasinQuery,
} from '../../../ingest/cloudflare/basin-sql';
import type {
  ChartRow,
  ChartScanQuery,
} from '../../../ingest/cloudflare/chart-scan';
import { cohortFilter } from '../../../ingest/cloudflare/cohort-eval';
import type { RowFilter } from '../../../ingest/cloudflare/filter-eval';
import {
  buildBuckets,
  wallClockText,
  wallClockToMs,
} from '../../../ingest/cloudflare/time-buckets';
import type {
  IChartBreakdown,
  IChartEventFilter,
  IGetChartDataInput,
} from '../../../report/report.constants';

type EventStore = NonNullable<ServiceDeps['eventStore']>;
type StoreDeps = Pick<ServiceDeps, 'advancedAnalytics' | 'logger'> & {
  eventStore: EventStore;
};

const MAX_BREAKDOWNS = 3;

/** Filters the Durable Object can evaluate; cohort filters need the cohort engine. */
export function toRowFilters(
  filters: IChartEventFilter[] | undefined
): RowFilter[] {
  return (filters ?? []).map(
    (filter) =>
      cohortFilter(filter) ?? {
        name: filter.name,
        operator: filter.operator,
        value: filter.value,
        ...(filter.type ? { type: filter.type } : {}),
      }
  );
}

function scanEvent(event: IGetChartDataInput['event']) {
  return {
    name: event.name,
    anyOf: event.anyOf?.map((item) => ({
      name: item.name,
      filters: toRowFilters(item.filters),
    })),
    filters: toRowFilters(event.filters),
    segment: event.segment ?? 'event',
    property: event.property,
  };
}

function breakdownNames(breakdowns: IChartBreakdown[] | undefined): string[] {
  return (breakdowns ?? [])
    .slice(0, MAX_BREAKDOWNS)
    .map((breakdown) => breakdown.name);
}

/**
 * The Durable Object answers first. Advanced analytics (when turned on)
 * takes over for ranges older than the Durable Object keeps, or when its
 * scan stopped at its budget; if Basin cannot answer (unsupported field,
 * monthly budget used up, an error), the Durable Object's rows stand.
 */
async function chartRowsFor(
  deps: StoreDeps,
  projectId: string,
  query: ChartScanQuery
): Promise<ChartRow[]> {
  const analytics = deps.advancedAnalytics;
  const needsHistory = analytics ? query.from < analytics.hotFrom() : false;
  const fromStore = needsHistory
    ? null
    : await deps.eventStore.chartRows(projectId, query);
  if (!analytics || (fromStore && !fromStore.partial)) {
    return fromStore?.rows ?? [];
  }
  try {
    return await basinChartRows(analytics, projectId, query);
  } catch (error) {
    const isExpected =
      error instanceof UnsupportedBasinQuery ||
      error instanceof AdvancedAnalyticsBudgetError;
    if (!isExpected) {
      deps.logger.error(
        { err: error, projectId },
        'Advanced analytics query failed'
      );
    }
    return (
      fromStore?.rows ??
      (await deps.eventStore.chartRows(projectId, query)).rows
    );
  }
}

async function basinChartRows(
  analytics: NonNullable<ServiceDeps['advancedAnalytics']>,
  projectId: string,
  query: ChartScanQuery
): Promise<ChartRow[]> {
  const sql = basinChartSql(analytics.table, projectId, query);
  const [series, totals] = await Promise.all([
    analytics.query<Record<string, unknown>>(sql.series),
    analytics.query<Record<string, unknown>>(sql.totals),
  ]);
  const labelsOf = (row: Record<string, unknown>) =>
    query.breakdowns.map((_, index) => String(row[`label_${index + 1}`] ?? ''));
  const totalByLabels = new Map(
    totals.map((row) => [labelsOf(row).join('\u0001'), Number(row.total ?? 0)])
  );
  const dateOf = (bucket: number) =>
    query.fixedDate ??
    wallClockText(query.buckets[bucket]?.start ?? query.from, query.timezone);
  const rows: ChartRow[] = series.map((row) => {
    const labels = labelsOf(row);
    const columns: Record<string, string> = {};
    labels.forEach((label, index) => {
      columns[`label_${index + 1}`] = label;
    });
    return {
      label_0: query.event.name,
      ...columns,
      date: dateOf(Number(row.bucket ?? 0)),
      count: Number(row.count ?? 0),
      total_count: totalByLabels.get(labels.join('\u0001')) ?? 0,
    };
  });
  rows.sort((a, b) => a.date.localeCompare(b.date) || b.count - a.count);
  if (!query.fixedDate) {
    for (const [index] of query.buckets.entries()) {
      rows.push({ label_0: '', date: dateOf(index), count: 0 });
    }
  }
  return rows;
}

/** One series' rows over time, bucketed in the project's timezone (weeks from Monday). */
export async function storeSeriesRows(
  deps: StoreDeps,
  input: IGetChartDataInput & {
    timezone: string;
    binRange?: { lo: number; hi: number };
  }
): Promise<ISerieDataItem[]> {
  const from = wallClockToMs(input.startDate, input.timezone);
  const to = wallClockToMs(input.endDate, input.timezone);
  if (input.chartType === 'distribution') {
    // Users bucketed by one value each: counted in the Durable Object only.
    const { rows } = await deps.eventStore.chartRows(input.projectId, {
      from,
      to,
      event: scanEvent(input.event),
      breakdowns: breakdownNames(input.breakdowns),
      buckets: [{ start: from, end: to + 1 }],
      timezone: input.timezone,
      perUser: {
        aggregation: input.event.perUser?.aggregation ?? 'count',
        ...(input.event.perUser?.property
          ? { property: input.event.perUser.property }
          : {}),
      },
      ...(input.binRange ? { binRange: input.binRange } : {}),
    });
    return rows;
  }
  return chartRowsFor(deps, input.projectId, {
    from,
    to,
    event: scanEvent(input.event),
    breakdowns: breakdownNames(input.breakdowns),
    buckets: buildBuckets(from, to, input.interval, input.timezone, 'monday'),
    timezone: input.timezone,
  });
}

/** One series' rows over the whole range (bar and pie charts), biggest first. */
export async function storeAggregateRows(
  deps: StoreDeps,
  input: {
    projectId: string;
    event: IGetChartDataInput['event'];
    startDate: string;
    endDate: string;
    breakdowns: IChartBreakdown[];
    limit?: number;
    timezone: string;
  }
): Promise<ISerieDataItem[]> {
  const from = wallClockToMs(input.startDate, input.timezone);
  const to = wallClockToMs(input.endDate, input.timezone);
  const rows = await chartRowsFor(deps, input.projectId, {
    from,
    to,
    event: scanEvent(input.event),
    breakdowns: breakdownNames(input.breakdowns),
    buckets: [{ start: from, end: to + 1 }],
    timezone: input.timezone,
    fixedDate: input.startDate,
  });
  const sorted = [...rows].sort((a, b) => b.count - a.count);
  return input.limit ? sorted.slice(0, input.limit) : sorted;
}
