// The report builder's series rows, counted from a project's stored events.
// Produces exactly what the ClickHouse series query returns (label_0 = the
// event name, label_1..3 = breakdown values, a bucket date, count and the
// range's distinct users per breakdown as total_count), so the chart
// engine's grouping, formulas and formatting run unchanged on top.

import type { IClickhouseEvent } from '../../event/event.service';
import { matchesFilters, type RowFilter, readField } from './filter-eval';
import { type Bucket, wallClockText } from './time-buckets';

export interface ChartScanEvent {
  /** An event name, or `*` for every event. */
  name: string;
  /** Alternatives: any of these names, each with its own filters. */
  anyOf?: { name: string; filters: RowFilter[] }[];
  filters: RowFilter[];
  segment: string;
  property?: string;
}

export interface ChartScanQuery {
  /** Inclusive epoch ms; the first bucket may start earlier. */
  from: number;
  /** Inclusive epoch ms. */
  to: number;
  event: ChartScanEvent;
  /** Breakdown property names, up to three. */
  breakdowns: string[];
  /** The series buckets; one bucket for an aggregate (bar/pie) chart. */
  buckets: Bucket[];
  timezone: string;
  /** Aggregate charts label every row with this date. */
  fixedDate?: string;
}

export interface ChartRow {
  label_0: string;
  label_1?: string;
  label_2?: string;
  label_3?: string;
  date: string;
  count: number;
  total_count?: number;
}

/** A project's profile as the store keeps it, for `profile.*` fields. */
export type ProfileLookup = (
  profileId: string
) => Record<string, unknown> | null | undefined;

const MAX_GROUPS = 20_000;
const PERCENTILES: Record<string, number> = {
  property_p50: 0.5,
  property_p95: 0.95,
  property_p99: 0.99,
};
const UTM_FIELDS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;
const PROFILE_PREFIX = 'profile.';

interface Group {
  labels: string[];
  bucket: number;
  count: number;
  profiles: Set<string>;
  sessions: Set<string>;
  groups: Set<string>;
  values: number[];
}

/** An event as a flat row: columns, `utm_*`, and `profile.*` when asked for. */
export function eventRow(
  event: IClickhouseEvent,
  lookupProfile?: ProfileLookup
): Record<string, unknown> {
  const row: Record<string, unknown> = { ...event };
  for (const field of UTM_FIELDS) {
    row[field] = event.properties[`__query.${field}`];
  }
  row.has_profile = String(
    Boolean(event.profile_id && event.profile_id !== event.device_id)
  );
  const profile = lookupProfile?.(event.profile_id);
  if (profile) {
    for (const [key, value] of Object.entries(profile)) {
      if (key === 'properties' && value && typeof value === 'object') {
        for (const [property, propertyValue] of Object.entries(value)) {
          row[`${PROFILE_PREFIX}properties.${property}`] = propertyValue;
        }
      } else {
        row[`${PROFILE_PREFIX}${key}`] = value;
      }
    }
  }
  return row;
}

export function needsProfile(query: ChartScanQuery): boolean {
  const names = [
    ...query.event.filters.map((filter) => filter.name),
    ...(query.event.anyOf ?? []).flatMap((item) =>
      item.filters.map((filter) => filter.name)
    ),
    ...query.breakdowns,
    query.event.property ?? '',
  ];
  return names.some((name) => name.startsWith(PROFILE_PREFIX));
}

function matchesEvent(row: Record<string, unknown>, event: ChartScanEvent) {
  const name = String(row.name ?? '');
  if (event.anyOf?.length) {
    return event.anyOf.some(
      (item) => item.name === name && matchesFilters(row, item.filters)
    );
  }
  return event.name === '*' || event.name === name;
}

function asLabel(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

function numericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function findBucketIndex(buckets: Bucket[], at: number): number {
  let low = 0;
  let high = buckets.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const bucket = buckets[middle] as Bucket;
    if (at < bucket.start) {
      high = middle - 1;
    } else if (at >= bucket.end) {
      low = middle + 1;
    } else {
      return middle;
    }
  }
  return -1;
}

function percentile(sorted: number[], quantile: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  const position = (sorted.length - 1) * quantile;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const low = sorted[lower] ?? 0;
  const high = sorted[upper] ?? low;
  return low + (high - low) * (position - lower);
}

function aggregate(group: Group, segment: string): number {
  switch (segment) {
    case 'user':
      return group.profiles.size;
    case 'session':
      return group.sessions.size;
    case 'group':
      return group.groups.size;
    case 'user_average':
      return group.profiles.size > 0 ? group.count / group.profiles.size : 0;
    case 'property_sum':
      return group.values.reduce((sum, value) => sum + value, 0);
    case 'property_average':
      return group.values.length > 0
        ? group.values.reduce((sum, value) => sum + value, 0) /
            group.values.length
        : 0;
    case 'property_max':
      return group.values.length > 0 ? Math.max(...group.values) : 0;
    case 'property_min':
      return group.values.length > 0 ? Math.min(...group.values) : 0;
    default: {
      const quantile = PERCENTILES[segment];
      if (quantile !== undefined) {
        return percentile(
          [...group.values].sort((a, b) => a - b),
          quantile
        );
      }
      return group.count;
    }
  }
}

export class ChartAccumulator {
  private readonly groups = new Map<string, Group>();
  /** Distinct users per breakdown combination over the whole range. */
  private readonly totals = new Map<string, Set<string>>();
  /** one_event_per_user: each user's latest matching event. */
  private readonly latest = new Map<
    string,
    { at: number; labels: string[]; bucket: number }
  >();
  overflowed = false;

  constructor(
    private readonly query: ChartScanQuery,
    private readonly lookupProfile?: ProfileLookup
  ) {}

  add(event: IClickhouseEvent, at: number): void {
    const { query } = this;
    const bucket = findBucketIndex(query.buckets, at);
    if (bucket < 0) {
      return;
    }
    const row = eventRow(
      event,
      needsProfile(query) ? this.lookupProfile : undefined
    );
    if (
      !(
        matchesEvent(row, query.event) &&
        matchesFilters(row, query.event.filters)
      )
    ) {
      return;
    }
    const isPropertySegment = query.event.segment.startsWith('property_');
    let value: number | null = null;
    if (isPropertySegment) {
      if (!query.event.property) {
        return;
      }
      value = numericValue(readField(row, query.event.property));
      if (value === null) {
        return;
      }
    }
    const labels = query.breakdowns.map((name) =>
      asLabel(readField(row, name))
    );
    const labelKey = labels.join('\u0001');

    if (query.event.segment === 'one_event_per_user') {
      const seen = this.latest.get(event.profile_id);
      if (!seen || at >= seen.at) {
        this.latest.set(event.profile_id, { at, labels, bucket });
      }
      return;
    }

    const key = `${bucket}\u0000${labelKey}`;
    let group = this.groups.get(key);
    if (!group) {
      if (this.groups.size >= MAX_GROUPS) {
        this.overflowed = true;
        return;
      }
      group = {
        labels,
        bucket,
        count: 0,
        profiles: new Set(),
        sessions: new Set(),
        groups: new Set(),
        values: [],
      };
      this.groups.set(key, group);
    }
    group.count += 1;
    group.profiles.add(event.profile_id);
    if (event.session_id) {
      group.sessions.add(event.session_id);
    }
    for (const groupId of event.groups ?? []) {
      group.groups.add(groupId);
    }
    if (value !== null) {
      group.values.push(value);
    }
    const total = this.totals.get(labelKey) ?? new Set<string>();
    total.add(event.profile_id);
    this.totals.set(labelKey, total);
  }

  private dateOf(bucket: number): string {
    if (this.query.fixedDate) {
      return this.query.fixedDate;
    }
    const start = this.query.buckets[bucket]?.start ?? 0;
    return wallClockText(start, this.query.timezone);
  }

  private labelColumns(labels: string[]) {
    const columns: Pick<ChartRow, 'label_1' | 'label_2' | 'label_3'> = {};
    labels.forEach((label, index) => {
      columns[`label_${index + 1}` as 'label_1'] = label;
    });
    return columns;
  }

  /** Rows like ClickHouse's: data rows, then a fill row per bucket. */
  rows(): ChartRow[] {
    const { query } = this;
    const rows: ChartRow[] = [];
    if (query.event.segment === 'one_event_per_user') {
      const counts = new Map<
        string,
        { labels: string[]; bucket: number; count: number }
      >();
      for (const { labels, bucket } of this.latest.values()) {
        const key = `${bucket}\u0000${labels.join('\u0001')}`;
        const entry = counts.get(key) ?? { labels, bucket, count: 0 };
        entry.count += 1;
        counts.set(key, entry);
      }
      for (const entry of counts.values()) {
        rows.push({
          label_0: query.event.name,
          ...this.labelColumns(entry.labels),
          date: this.dateOf(entry.bucket),
          count: entry.count,
        });
      }
    } else {
      for (const group of this.groups.values()) {
        rows.push({
          label_0: query.event.name,
          ...this.labelColumns(group.labels),
          date: this.dateOf(group.bucket),
          count: aggregate(group, query.event.segment),
          total_count: this.totals.get(group.labels.join('\u0001'))?.size ?? 0,
        });
      }
    }
    rows.sort((a, b) => a.date.localeCompare(b.date) || b.count - a.count);
    if (!query.fixedDate) {
      for (const [index] of query.buckets.entries()) {
        rows.push({ label_0: '', date: this.dateOf(index), count: 0 });
      }
    }
    return rows;
  }
}
