// Conversion charts from a project's stored events, like the ClickHouse
// conversion query: per session (or profile) and breakdown values, a
// two-step windowFunnel; a group counts on the day its chain started, as
// converted when it reached step two.

import type { IClickhouseEvent } from '../../event/event.service';
import { eventRow, type ProfileLookup } from './chart-scan';
import { readField } from './filter-eval';
import { type FunnelScanStep, matchesStep, replayFunnel } from './funnel-scan';
import { type Bucket, wallClockText } from './time-buckets';

export interface ConversionScanQuery {
  from: number;
  to: number;
  steps: [FunnelScanStep, FunnelScanStep];
  breakdowns: string[];
  windowMs: number;
  group: 'session_id' | 'profile_id';
  buckets: Bucket[];
  timezone: string;
}

/** `event_day`, `b_0`.., `total_first`, `conversions`, `conversion_rate_percentage`. */
export type ConversionRow = Record<string, string | number>;

const RATE_DECIMALS = 100;

export class ConversionAccumulator {
  private readonly groups = new Map<
    string,
    {
      values: string[];
      hits: { at: number; order: number; steps: number[]; values: string[] }[];
    }
  >();
  private order = 0;

  constructor(
    private readonly query: ConversionScanQuery,
    private readonly lookupProfile?: ProfileLookup
  ) {}

  add(event: IClickhouseEvent, at: number): void {
    const query = this.query;
    const key = String(event[query.group] ?? '');
    if (!key) {
      return;
    }
    const needsProfile = query.breakdowns.some((name) =>
      name.startsWith('profile.')
    );
    const row = eventRow(event, needsProfile ? this.lookupProfile : undefined);
    const steps = query.steps.flatMap((step, index) =>
      matchesStep(row, step) ? [index] : []
    );
    if (steps.length === 0) {
      return;
    }
    const values = query.breakdowns.map((name) => {
      const value = readField(row, name);
      return value === null || value === undefined ? '' : String(value);
    });
    const groupKey = `${key}\u0000${values.join('\u0001')}`;
    const group = this.groups.get(groupKey) ?? { values, hits: [] };
    group.hits.push({ at, order: this.order++, steps, values });
    this.groups.set(groupKey, group);
  }

  rows(): ConversionRow[] {
    const query = this.query;
    const totals = new Map<
      string,
      { day: string; values: string[]; total: number; converted: number }
    >();
    for (const group of this.groups.values()) {
      group.hits.sort((a, b) => a.at - b.at || a.order - b.order);
      const { level, chain } = replayFunnel(group.hits, 2, query.windowMs);
      if (level === 0 || !chain) {
        continue;
      }
      const start = chain.times[0] ?? query.from;
      const bucket =
        query.buckets.find((item) => start >= item.start && start < item.end) ??
        query.buckets[0];
      const day = wallClockText(bucket?.start ?? start, query.timezone);
      const key = `${day}\u0000${group.values.join('\u0001')}`;
      const entry = totals.get(key) ?? {
        day,
        values: group.values,
        total: 0,
        converted: 0,
      };
      entry.total += 1;
      entry.converted += level >= 2 ? 1 : 0;
      totals.set(key, entry);
    }
    return [...totals.values()]
      .sort(
        (a, b) =>
          a.day.localeCompare(b.day) ||
          a.values.join('\u0001').localeCompare(b.values.join('\u0001'))
      )
      .map((entry) => ({
        event_day: entry.day,
        ...Object.fromEntries(
          entry.values.map((value, index) => [`b_${index}`, value])
        ),
        total_first: entry.total,
        conversions: entry.converted,
        conversion_rate_percentage:
          Math.round(((100 * entry.converted) / entry.total) * RATE_DECIMALS) /
          RATE_DECIMALS,
      }));
  }
}
