// Retention cohorts counted from a project's stored events, as the ClickHouse
// cohort query does it: identified users only, in UTC; a user's cohort is the
// day, week (Sunday) or month of their first `firstEvent` in the range, and
// they count in column i when a `secondEvent` falls i periods later (exactly,
// or at least i periods later for `on_or_after`).

import type { IClickhouseEvent } from '../../event/event.service';
import { eventRow } from './chart-scan';
import { matchesFilters, type RowFilter } from './filter-eval';

export type RetentionInterval = 'day' | 'week' | 'month';

export interface RetentionScanQuery {
  /** Cohort range, inclusive epoch ms (UTC). */
  start: number;
  end: number;
  firstEvent: string[];
  secondEvent: string[];
  criteria: 'on' | 'on_or_after';
  interval: RetentionInterval;
  /** Columns 0..diffInterval. */
  diffInterval: number;
  filters: RowFilter[];
}

export type RetentionRow = Record<string, string | number> & {
  cohort_interval: string;
  total_first_event_count: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;
const MONTHS_PER_YEAR = 12;

/** Start of the UTC day, Sunday-week or month of `ms`. */
export function periodStart(ms: number, interval: RetentionInterval): number {
  const date = new Date(ms);
  const day = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  if (interval === 'day') {
    return day;
  }
  if (interval === 'week') {
    return day - date.getUTCDay() * DAY_MS;
  }
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function periodsBetween(
  from: number,
  to: number,
  interval: RetentionInterval
): number {
  if (interval === 'month') {
    const a = new Date(from);
    const b = new Date(to);
    return (
      (b.getUTCFullYear() - a.getUTCFullYear()) * MONTHS_PER_YEAR +
      (b.getUTCMonth() - a.getUTCMonth())
    );
  }
  const days = Math.round((to - from) / DAY_MS);
  return interval === 'week' ? Math.floor(days / DAYS_PER_WEEK) : days;
}

function matchesNames(name: string, names: string[]): boolean {
  return names.length === 0 || names.includes('*') || names.includes(name);
}

export class RetentionAccumulator {
  private readonly firstSeen = new Map<string, number>();
  /** profile → UTC days with a returning event. */
  private readonly returns = new Map<string, Set<number>>();

  constructor(private readonly query: RetentionScanQuery) {}

  add(event: IClickhouseEvent, at: number): void {
    const profileId = event.profile_id;
    if (!profileId || profileId === event.device_id) {
      return;
    }
    const { query } = this;
    if (
      query.filters.length > 0 &&
      !matchesFilters(eventRow(event), query.filters)
    ) {
      return;
    }
    const isFirst =
      at >= query.start &&
      at <= query.end &&
      matchesNames(event.name, query.firstEvent);
    if (isFirst) {
      const seen = this.firstSeen.get(profileId);
      if (seen === undefined || at < seen) {
        this.firstSeen.set(profileId, at);
      }
    }
    if (at >= query.start && matchesNames(event.name, query.secondEvent)) {
      const days = this.returns.get(profileId) ?? new Set<number>();
      days.add(periodStart(at, 'day'));
      this.returns.set(profileId, days);
    }
  }

  rows(): RetentionRow[] {
    const { interval, diffInterval, criteria } = this.query;
    const cohorts = new Map<number, { size: number; columns: Set<string>[] }>();
    for (const [profileId, first] of this.firstSeen) {
      const cohort = periodStart(first, interval);
      const entry = cohorts.get(cohort) ?? {
        size: 0,
        columns: Array.from({ length: diffInterval + 1 }, () => new Set()),
      };
      entry.size += 1;
      cohorts.set(cohort, entry);
      for (const day of this.returns.get(profileId) ?? []) {
        if (day < cohort) {
          continue;
        }
        const offset = periodsBetween(
          cohort,
          periodStart(day, interval),
          interval
        );
        if (offset < 0 || offset > diffInterval) {
          continue;
        }
        if (criteria === 'on') {
          entry.columns[offset]?.add(profileId);
        } else {
          for (let column = 0; column <= offset; column++) {
            entry.columns[column]?.add(profileId);
          }
        }
      }
    }
    return [...cohorts.entries()]
      .filter(([, entry]) => entry.columns.some((column) => column.size > 0))
      .sort(([a], [b]) => a - b)
      .map(([cohort, entry]) => {
        const row: RetentionRow = {
          cohort_interval: new Date(cohort).toISOString().slice(0, 10),
          total_first_event_count: entry.size,
        };
        entry.columns.forEach((column, index) => {
          row[`interval_${index}_user_count`] = column.size;
        });
        return row;
      });
  }
}
