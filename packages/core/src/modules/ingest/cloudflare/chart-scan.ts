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
  /** Distribution charts: users bucketed by one value per user. */
  perUser?: { aggregation: string; property?: string };
  /** Distribution charts: a value range shared with the other series. */
  binRange?: { lo: number; hi: number };
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

/**
 * A project's profile as the store keeps it, for `profile.*` fields; with
 * `group`, also its groups for `group.*` fields.
 */
export type ProfileLookup = ((
  profileId: string
) => Record<string, unknown> | null | undefined) & {
  group?: (groupId: string) => {
    name: string;
    type: string;
    properties: Record<string, string>;
  } | null;
};

/** Fields that need the profile or group lookup. */
export function readsLookup(name: string): boolean {
  return name.startsWith('profile.') || name.startsWith('group.');
}

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
  // `group.*` reads the event's first known group (ClickHouse joins each).
  const lookupGroup = lookupProfile?.group;
  if (lookupGroup && event.groups?.length) {
    for (const groupId of event.groups) {
      const group = lookupGroup(groupId);
      if (group) {
        row['group.id'] = groupId;
        row['group.name'] = group.name;
        row['group.type'] = group.type;
        for (const [key, value] of Object.entries(group.properties)) {
          row[`group.properties.${key}`] = value;
        }
        break;
      }
    }
  }
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
  return names.some(readsLookup);
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
    const query = this.query;
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
    const query = this.query;
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
    if (!query.fixedDate) {
      for (const [index] of query.buckets.entries()) {
        rows.push({ label_0: '', date: this.dateOf(index), count: 0 });
      }
    }
    // In date order with the padding interleaved, as ClickHouse's WITH FILL
    // returns it: series take their points in row order, so a padding row
    // after a real one would draw the line back to an earlier date.
    rows.sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        Number(!a.label_0) - Number(!b.label_0) ||
        b.count - a.count
    );
    return rows;
  }
}

// ---------------------------------------------------------------------------
// Distribution charts: one value per user (count of events, or an aggregate
// of a property), users counted per bucket, like `perUserDistributionQuery`.

const DISCRETE_BUCKET_BOUNDS = [1, 2, 3, 5, 10];
const DISCRETE_BUCKET_LABELS = ['1', '2', '3', '4-5', '6-10', '11+'];
const CONTINUOUS_BUCKET_COUNT = 10;
const MIN_BIN_LABEL_DIGITS = 2;
const PER_USER_QUANTILES: Record<string, number> = {
  median: 0.5,
  p90: 0.9,
  p95: 0.95,
  p99: 0.99,
};

interface UserValues {
  count: number;
  values: number[];
  distinct: Set<string>;
}

function roundTo(value: number, digits: number): string {
  return String(Number(value.toFixed(Math.max(0, Math.min(digits, 20)))));
}

function userValue(user: UserValues, aggregation: string): number | null {
  if (aggregation === 'count') {
    return user.count;
  }
  if (aggregation === 'distinct_count') {
    return user.distinct.size;
  }
  const { values } = user;
  if (values.length === 0) {
    return null;
  }
  switch (aggregation) {
    case 'sum':
      return values.reduce((sum, value) => sum + value, 0);
    case 'avg':
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return percentile(
        [...values].sort((a, b) => a - b),
        PER_USER_QUANTILES[aggregation] ?? 0.5
      );
  }
}

export class DistributionAccumulator {
  /** breakdown labels → profile → that user's values */
  private readonly groups = new Map<
    string,
    { labels: string[]; users: Map<string, UserValues> }
  >();

  constructor(
    private readonly query: ChartScanQuery,
    private readonly lookupProfile?: ProfileLookup
  ) {}

  add(event: IClickhouseEvent, _at?: number): void {
    const query = this.query;
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
    const aggregation = query.perUser?.aggregation ?? 'count';
    const property = query.perUser?.property;
    let numeric: number | null = null;
    let text = '';
    if (aggregation !== 'count') {
      if (!property) {
        return;
      }
      const raw = readField(row, property);
      text = asLabel(raw);
      if (!text) {
        return;
      }
      if (aggregation !== 'distinct_count') {
        numeric = numericValue(raw);
        if (numeric === null) {
          return;
        }
      }
    }
    const labels = query.breakdowns.map((name) =>
      asLabel(readField(row, name))
    );
    const key = labels.join('\u0001');
    let group = this.groups.get(key);
    if (!group) {
      if (this.groups.size >= MAX_GROUPS) {
        return;
      }
      group = { labels, users: new Map() };
      this.groups.set(key, group);
    }
    let user = group.users.get(event.profile_id);
    if (!user) {
      user = { count: 0, values: [], distinct: new Set() };
      group.users.set(event.profile_id, user);
    }
    user.count += 1;
    if (numeric !== null) {
      user.values.push(numeric);
    }
    if (aggregation === 'distinct_count') {
      user.distinct.add(text);
    }
  }

  rows(): ChartRow[] {
    const query = this.query;
    const aggregation = query.perUser?.aggregation ?? 'count';
    const discrete =
      aggregation === 'count' || aggregation === 'distinct_count';
    const perGroup = [...this.groups.values()].map((group) => ({
      labels: group.labels,
      values: [...group.users.values()]
        .map((user) => userValue(user, aggregation))
        .filter(
          (value): value is number => value !== null && Number.isFinite(value)
        ),
    }));
    const all = perGroup.flatMap((group) => group.values);
    if (all.length === 0) {
      return [];
    }
    const lo = query.binRange?.lo ?? Math.min(...all);
    const hi = query.binRange?.hi ?? Math.max(...all);
    const width = (hi - lo) / CONTINUOUS_BUCKET_COUNT;
    const bucketCount = discrete
      ? DISCRETE_BUCKET_LABELS.length
      : hi === lo
        ? 1
        : CONTINUOUS_BUCKET_COUNT;
    const digits = Math.max(
      MIN_BIN_LABEL_DIGITS,
      width > 0 ? Math.ceil(-Math.log10(width)) + 1 : MIN_BIN_LABEL_DIGITS
    );
    const bucketOf = (value: number) => {
      if (discrete) {
        return DISCRETE_BUCKET_BOUNDS.filter((bound) => value > bound).length;
      }
      if (hi === lo) {
        return 0;
      }
      return Math.min(
        Math.max(Math.floor((value - lo) / width), 0),
        CONTINUOUS_BUCKET_COUNT - 1
      );
    };
    const labelOf = (bucket: number) => {
      if (discrete) {
        return DISCRETE_BUCKET_LABELS[bucket] ?? '';
      }
      if (hi === lo) {
        return roundTo(lo, MIN_BIN_LABEL_DIGITS);
      }
      return `${roundTo(lo + bucket * width, digits)} - ${roundTo(lo + (bucket + 1) * width, digits)}`;
    };
    const rows: ChartRow[] = [];
    for (let bucket = 0; bucket < bucketCount; bucket++) {
      for (const group of perGroup) {
        const columns: Pick<ChartRow, 'label_1' | 'label_2' | 'label_3'> = {};
        group.labels.forEach((label, index) => {
          columns[`label_${index + 1}` as 'label_1'] = label;
        });
        rows.push({
          label_0: query.event.name,
          ...columns,
          date: labelOf(bucket),
          count: group.values.filter((value) => bucketOf(value) === bucket)
            .length,
          total_count: group.values.length,
        });
      }
    }
    return rows;
  }
}
