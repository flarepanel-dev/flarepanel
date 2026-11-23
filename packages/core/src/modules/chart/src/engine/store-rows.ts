// On Workers the chart engine's rows come from the project's Durable Object
// instead of ClickHouse: the same label/date/count rows, so grouping,
// formulas and formatting stay shared.

import type { ServiceDeps } from '../../../../services';
import type { ISerieDataItem } from '../../../../shared/group-by-labels';
import type { RowFilter } from '../../../ingest/cloudflare/filter-eval';
import {
  buildBuckets,
  wallClockToMs,
} from '../../../ingest/cloudflare/time-buckets';
import type {
  IChartBreakdown,
  IChartEventFilter,
  IGetChartDataInput,
} from '../../../report/report.constants';

type EventStore = NonNullable<ServiceDeps['eventStore']>;

const MAX_BREAKDOWNS = 3;

/** Filters the Durable Object can evaluate; cohort filters need the cohort engine. */
export function toRowFilters(
  filters: IChartEventFilter[] | undefined
): RowFilter[] {
  return (filters ?? [])
    .filter(
      (filter) =>
        filter.operator !== 'inCohort' && filter.operator !== 'notInCohort'
    )
    .map((filter) => ({
      name: filter.name,
      operator: filter.operator,
      value: filter.value,
      ...(filter.type ? { type: filter.type } : {}),
    }));
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

/** One series' rows over time, bucketed in the project's timezone (weeks from Monday). */
export async function storeSeriesRows(
  store: EventStore,
  input: IGetChartDataInput & { timezone: string }
): Promise<ISerieDataItem[]> {
  if (input.chartType === 'distribution') {
    // Per-user distributions are not counted on Workers yet: empty state.
    return [];
  }
  const from = wallClockToMs(input.startDate, input.timezone);
  const to = wallClockToMs(input.endDate, input.timezone);
  const { rows } = await store.chartRows(input.projectId, {
    from,
    to,
    event: scanEvent(input.event),
    breakdowns: breakdownNames(input.breakdowns),
    buckets: buildBuckets(from, to, input.interval, input.timezone, 'monday'),
    timezone: input.timezone,
  });
  return rows;
}

/** One series' rows over the whole range (bar and pie charts), biggest first. */
export async function storeAggregateRows(
  store: EventStore,
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
  const { rows } = await store.chartRows(input.projectId, {
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
