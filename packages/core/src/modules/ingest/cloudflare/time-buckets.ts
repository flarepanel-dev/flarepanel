// Time math for the Durable Object's rollups. Rollups are stored per UTC hour
// (and per UTC day for long ranges); the dashboard asks in the project's
// timezone, with wall-clock `yyyy-MM-dd HH:mm:ss` boundaries, and expects
// series dates back as wall-clock times written as if they were UTC (what
// ClickHouse returns under `session_timezone`). Timezones whose offset is
// not a whole hour are bucketed to the nearest UTC hour.

import { DateTime } from '@flarepanel/shared';

export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = 60 * MINUTE_MS;
const HOURS_PER_DAY = 24;
const DAY_KEY_LENGTH = 10;
/** A series never has more points than this (ClickHouse's fill has a budget too). */
const MAX_BUCKETS = 5000;

export type BucketInterval = 'minute' | 'hour' | 'day' | 'week' | 'month';

export interface Bucket {
  /** Inclusive, epoch ms. */
  start: number;
  /** Exclusive, epoch ms. */
  end: number;
}

/** Event rows store `created_at` as UTC `yyyy-MM-dd HH:mm:ss.SSS`. */
export function eventTimeMs(createdAt: string): number {
  return Date.parse(`${createdAt.replace(' ', 'T')}Z`);
}

export function utcDayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, DAY_KEY_LENGTH);
}

export function hourNumber(ms: number): number {
  return Math.floor(ms / HOUR_MS);
}

/** A wall-clock boundary in `timezone` (or an ISO string with an offset) to epoch ms. */
export function wallClockToMs(value: string, timezone: string): number {
  const iso = value.includes('T') ? value : value.replace(' ', 'T');
  const parsed = DateTime.fromISO(iso, { zone: timezone || 'UTC' });
  return parsed.isValid ? parsed.toMillis() : Date.parse(value);
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The end of a range: a bare `yyyy-MM-dd` (as MCP and the REST API send it)
 * covers that whole day, as ClickHouse's `toRangeBoundaryLiteral` reads it.
 */
export function wallClockEndMs(value: string, timezone: string): number {
  return wallClockToMs(
    DATE_ONLY.test(value) ? `${value} 23:59:59` : value,
    timezone
  );
}

/** The wall-clock time of `ms` in `timezone` as `yyyy-MM-dd HH:mm:ss`. */
export function wallClockText(ms: number, timezone: string): string {
  return wallClockIso(ms, timezone).slice(0, 19).replace('T', ' ');
}

/** The wall-clock time of `ms` in `timezone`, written as a UTC ISO string. */
export function wallClockIso(ms: number, timezone: string): string {
  const local = DateTime.fromMillis(ms, { zone: timezone || 'UTC' });
  return new Date(
    Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second
    )
  ).toISOString();
}

/** Overview weeks start on Sunday (ClickHouse mode 0), report weeks on Monday (mode 1). */
export type WeekStart = 'sunday' | 'monday';

function bucketStart(
  ms: number,
  interval: BucketInterval,
  timezone: string,
  weekStart: WeekStart = 'sunday'
): number {
  if (interval === 'minute') {
    return Math.floor(ms / MINUTE_MS) * MINUTE_MS;
  }
  const local = DateTime.fromMillis(ms, { zone: timezone || 'UTC' });
  switch (interval) {
    case 'hour':
      return local.startOf('hour').toMillis();
    case 'day':
      return local.startOf('day').toMillis();
    case 'week':
      return local
        .startOf('day')
        .minus({
          days: weekStart === 'monday' ? local.weekday - 1 : local.weekday % 7,
        })
        .toMillis();
    default:
      return local.startOf('month').toMillis();
  }
}

function nextBucket(
  start: number,
  interval: BucketInterval,
  timezone: string
): number {
  if (interval === 'minute') {
    return start + MINUTE_MS;
  }
  const local = DateTime.fromMillis(start, { zone: timezone || 'UTC' });
  const unit = {
    hour: { hours: 1 },
    day: { days: 1 },
    week: { weeks: 1 },
    month: { months: 1 },
  }[interval];
  return local.plus(unit).toMillis();
}

/**
 * Buckets covering `fromMs`..`toMs`, the first one aligned down. A bucket
 * starting exactly at `toMs` is left out: ranges like "7 days" end at the
 * next midnight, and ClickHouse's `WITH FILL ... TO` is exclusive too.
 */
export function buildBuckets(
  fromMs: number,
  toMs: number,
  interval: BucketInterval,
  timezone: string,
  weekStart: WeekStart = 'sunday'
): Bucket[] {
  const buckets: Bucket[] = [];
  let start = bucketStart(fromMs, interval, timezone, weekStart);
  while (
    (start < toMs || buckets.length === 0) &&
    buckets.length < MAX_BUCKETS
  ) {
    const end = nextBucket(start, interval, timezone);
    buckets.push({ start, end });
    start = end;
  }
  return buckets;
}

export interface HourDayCover {
  /** Half-open ranges of hour numbers read from hourly rows. */
  hours: [number, number][];
  /** Inclusive UTC day keys read from daily rows, if any day is whole. */
  days: [string, string] | null;
}

/**
 * Splits `[fromMs, endMs)` into whole UTC days (cheap daily rows) and the
 * hours at either edge, so a long range reads ~365 rows instead of ~8760.
 */
export function coverWithHoursAndDays(
  fromMs: number,
  endMs: number
): HourDayCover {
  const fromHour = hourNumber(fromMs);
  const toHour = Math.max(fromHour, Math.ceil(endMs / HOUR_MS));
  const firstDayHour = Math.ceil(fromHour / HOURS_PER_DAY) * HOURS_PER_DAY;
  const lastDayHour = Math.floor(toHour / HOURS_PER_DAY) * HOURS_PER_DAY;
  if (firstDayHour >= lastDayHour) {
    return { hours: [[fromHour, toHour]], days: null };
  }
  const hours: [number, number][] = [];
  if (fromHour < firstDayHour) {
    hours.push([fromHour, firstDayHour]);
  }
  if (lastDayHour < toHour) {
    hours.push([lastDayHour, toHour]);
  }
  return {
    hours,
    days: [
      utcDayKey(firstDayHour * HOUR_MS),
      utcDayKey((lastDayHour - HOURS_PER_DAY) * HOUR_MS),
    ],
  };
}
