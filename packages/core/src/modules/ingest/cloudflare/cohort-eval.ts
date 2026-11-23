// Cohort membership from a project's stored events and profiles, with the
// rules of the ClickHouse cohort queries:
// - event criteria count identified people only (profile id != device id),
//   by UTC calendar day: "last 30 days" starts at the UTC day 30 days ago,
//   an absolute window runs from its start day to the end of its end day;
// - frequency `gte`/`eq`/`lte` N compares that count; `eq 0` and `lte 0`
//   mean "never did it": every profile minus those who did;
// - criteria combine with `and` (intersection) or `or` (union);
// - property criteria test each stored profile's fields.

import type {
  CohortDefinition,
  EventCriteria,
  Frequency,
  Timeframe,
} from '../../cohort/cohort.constants';
import type { IClickhouseEvent } from '../../event/event.service';
import type { IClickhouseProfile } from '../../profile/profile.service';
import type { IChartEventFilter } from '../../report/report.constants';
import { eventRow, type ProfileLookup } from './chart-scan';
import { matchesFilters, type RowFilter } from './filter-eval';

const DAY_MS = 24 * 60 * 60 * 1000;
const RELATIVE = /^(\d+)d$/;
const PROFILE_PREFIX = /^profiles?\./;

export interface CohortEvalSource {
  now: number;
  /** Calls `visit` for every stored event between `from` and `to`. */
  scan: (
    from: number,
    to: number,
    visit: (event: IClickhouseEvent) => void
  ) => Promise<boolean>;
  /** Every stored profile of the project. */
  profiles: () => IClickhouseProfile[];
  lookupProfile?: ProfileLookup;
}

/**
 * A cohort filter as the scans evaluate it (`profile_id` against the stored
 * members), or null for any other filter.
 */
export function cohortFilter(filter: IChartEventFilter): RowFilter | null {
  if (filter.operator !== 'inCohort' && filter.operator !== 'notInCohort') {
    return null;
  }
  const ids = filter.cohortIds?.length
    ? filter.cohortIds
    : filter.cohortId
      ? [filter.cohortId]
      : [];
  return { name: 'profile_id', operator: filter.operator, value: ids };
}

/** Report filters as the scans evaluate them, cohort filters included. */
export function cohortRowFilters(
  filters: readonly IChartEventFilter[] | undefined
): RowFilter[] {
  return (filters ?? []).flatMap((filter) => {
    const isCohort =
      filter.operator === 'inCohort' || filter.operator === 'notInCohort';
    if (isCohort) {
      const ids = filter.cohortIds?.length
        ? filter.cohortIds
        : filter.cohortId
          ? [filter.cohortId]
          : [];
      return ids.length > 0
        ? [{ name: 'profile_id', operator: filter.operator, value: ids }]
        : [];
    }
    if (
      filter.value.length === 0 &&
      filter.operator !== 'isNull' &&
      filter.operator !== 'isNotNull'
    ) {
      return [];
    }
    return [
      {
        name: filter.name,
        operator: filter.operator,
        value: filter.value,
        ...(filter.type ? { type: filter.type } : {}),
      },
    ];
  });
}

/** The `[from, to]` epoch ms one timeframe covers. */
export function timeframeRange(
  timeframe: Timeframe,
  now: number
): [number, number] {
  if (timeframe.type === 'relative') {
    const days = Number(RELATIVE.exec(timeframe.value)?.[1] ?? 0);
    const today = Math.floor(now / DAY_MS) * DAY_MS;
    return [today - days * DAY_MS, now];
  }
  const start = Date.parse(`${timeframe.start}T00:00:00Z`);
  const end = timeframe.end
    ? Date.parse(`${timeframe.end}T00:00:00Z`) + DAY_MS - 1
    : now;
  return [start, end];
}

function isNever(frequency: Frequency | undefined): boolean {
  return (
    frequency !== undefined &&
    frequency.count === 0 &&
    (frequency.operator === 'eq' || frequency.operator === 'lte')
  );
}

function passes(count: number, frequency: Frequency): boolean {
  switch (frequency.operator) {
    case 'eq':
      return count === frequency.count;
    case 'lte':
      return count <= frequency.count;
    default:
      return count >= frequency.count;
  }
}

function combine(sets: Set<string>[], operator: 'and' | 'or'): Set<string> {
  if (sets.length === 0) {
    return new Set();
  }
  if (operator === 'or') {
    return new Set(sets.flatMap((set) => [...set]));
  }
  const [first, ...rest] = sets as [Set<string>, ...Set<string>[]];
  return new Set([...first].filter((id) => rest.every((set) => set.has(id))));
}

/** A profile as a filter row: columns and `properties.*`. */
function profileRow(profile: IClickhouseProfile): Record<string, unknown> {
  return { ...profile, profile_id: profile.id };
}

function profileFilters(filters: readonly IChartEventFilter[]): RowFilter[] {
  return cohortRowFilters(filters).map((filter) => ({
    ...filter,
    name: filter.name.replace(PROFILE_PREFIX, ''),
  }));
}

async function eventCohort(
  criteria: EventCriteria[],
  operator: 'and' | 'or',
  source: CohortEvalSource
): Promise<{ ids: Set<string>; complete: boolean }> {
  const windows = criteria.map((item) =>
    timeframeRange(item.timeframe, source.now)
  );
  const from = Math.min(...windows.map(([start]) => start));
  const to = Math.max(...windows.map(([, end]) => end));
  const counts = criteria.map(() => new Map<string, number>());
  const filters = criteria.map((item) => cohortRowFilters(item.filters));
  const complete = await source.scan(from, to, (event) => {
    if (!event.profile_id || event.profile_id === event.device_id) {
      return;
    }
    const at = Date.parse(`${event.created_at.replace(' ', 'T')}Z`);
    criteria.forEach((item, index) => {
      const [start, end] = windows[index] as [number, number];
      if (event.name !== item.name || at < start || at > end) {
        return;
      }
      const itemFilters = filters[index] as RowFilter[];
      if (
        itemFilters.length > 0 &&
        !matchesFilters(eventRow(event, source.lookupProfile), itemFilters)
      ) {
        return;
      }
      const map = counts[index] as Map<string, number>;
      map.set(event.profile_id, (map.get(event.profile_id) ?? 0) + 1);
    });
  });
  let everyone: string[] | null = null;
  const sets = criteria.map((item, index) => {
    const map = counts[index] as Map<string, number>;
    if (isNever(item.frequency)) {
      everyone ??= source.profiles().map((profile) => profile.id);
      return new Set(everyone.filter((id) => !map.has(id)));
    }
    const frequency = item.frequency;
    return new Set(
      [...map.entries()]
        .filter(([, count]) => !frequency || passes(count, frequency))
        .map(([id]) => id)
    );
  });
  return { ids: combine(sets, operator), complete };
}

/** Member profile ids of a cohort definition (and whether the scan was whole). */
export async function evaluateCohort(
  definition: CohortDefinition,
  source: CohortEvalSource
): Promise<{ ids: string[]; complete: boolean }> {
  if (definition.type === 'event') {
    const { ids, complete } = await eventCohort(
      definition.criteria.events,
      definition.criteria.operator,
      source
    );
    return { ids: [...ids], complete };
  }
  const filters = profileFilters(definition.criteria.properties);
  if (filters.length === 0) {
    return { ids: [], complete: true };
  }
  const ids = source
    .profiles()
    .filter((profile) => {
      const row = profileRow(profile);
      return definition.criteria.operator === 'and'
        ? filters.every((filter) => matchesFilters(row, [filter]))
        : filters.some((filter) => matchesFilters(row, [filter]));
    })
    .map((profile) => profile.id);
  return { ids, complete: true };
}
