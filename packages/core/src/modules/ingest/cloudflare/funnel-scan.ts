// Funnels counted from a project's stored events, with ClickHouse's
// `windowFunnel` rules: per session, profile or group, events in time order;
// step 1 opens a chain, each later step extends the latest chain that is
// still inside the window, and a group's level is the deepest step any chain
// reached. Breakdowns read their value from the event that matched their
// step in the chain that first reached that deepest level. Rows have the
// shape the funnel SQL returns, so the funnel service formats them as-is.

import type { IClickhouseEvent } from '../../event/event.service';
import { eventRow, type ProfileLookup } from './chart-scan';
import { matchesFilters, type RowFilter, readField } from './filter-eval';

export interface FunnelScanStep {
  name: string;
  anyOf?: { name: string; filters: RowFilter[] }[];
  filters: RowFilter[];
}

export interface FunnelScanQuery {
  from: number;
  to: number;
  steps: FunnelScanStep[];
  breakdowns: { name: string; step?: number }[];
  windowMs: number;
  group: 'session_id' | 'profile_id' | 'group';
  /** Adds time-to-convert rows aggregated this way (avg, median, p90, ...). */
  timeToConvert?: string;
}

export interface FunnelScanResult {
  /** One row per (level, breakdown values): `level`, `count`, `b_0`.. */
  rows: Record<string, string | number>[];
  /** One row per (step >= 2, breakdown values), in seconds. */
  timeToConvert: Record<string, string | number>[];
}

const EMPTY_BREAKDOWN_LABEL = 'Not set';
const MS_PER_SECOND = 1000;
const QUANTILES: Record<string, number> = {
  median: 0.5,
  p25: 0.25,
  p75: 0.75,
  p90: 0.9,
  p99: 0.99,
};

interface Hit {
  at: number;
  order: number;
  /** Bit i set when the event matches step i. */
  steps: number[];
  /** Breakdown values read from this event. */
  values: string[];
}

interface Chain {
  start: number;
  times: number[];
  values: string[][];
}

export function matchesStep(
  row: Record<string, unknown>,
  step: FunnelScanStep
): boolean {
  const name = String(row.name ?? '');
  if (step.anyOf?.length) {
    return step.anyOf.some(
      (item) => item.name === name && matchesFilters(row, item.filters)
    );
  }
  return (
    (step.name === '*' || step.name === name) &&
    matchesFilters(row, step.filters)
  );
}

function label(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function didNotReach(step: number): string {
  return `Did not reach step ${step}`;
}

function aggregateTimes(values: number[], aggregation: string): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  switch (aggregation) {
    case 'min':
      return sorted[0] ?? 0;
    case 'max':
      return sorted.at(-1) ?? 0;
    case 'avg':
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    default: {
      const quantile = QUANTILES[aggregation] ?? 0.5;
      const position = (sorted.length - 1) * quantile;
      const low = sorted[Math.floor(position)] ?? 0;
      const high = sorted[Math.ceil(position)] ?? low;
      return low + (high - low) * (position - Math.floor(position));
    }
  }
}

/** windowFunnel over one group's hits (sorted): its level and winning chain. */
export function replayFunnel(
  hits: Pick<Hit, 'at' | 'steps' | 'values'>[],
  stepCount: number,
  windowMs: number
): { level: number; chain: Chain | null } {
  const chains: (Chain | null)[] = Array.from(
    { length: stepCount },
    () => null
  );
  let level = 0;
  let best: Chain | null = null;
  for (const hit of hits) {
    // Deepest step first, so one event cannot open and extend the same chain.
    for (let step = stepCount - 1; step >= 0; step--) {
      if (!hit.steps.includes(step)) {
        continue;
      }
      if (step === 0) {
        chains[0] = { start: hit.at, times: [hit.at], values: [hit.values] };
      } else {
        const previous = chains[step - 1];
        if (!previous || hit.at - previous.start > windowMs) {
          continue;
        }
        chains[step] = {
          start: previous.start,
          times: [...previous.times, hit.at],
          values: [...previous.values, hit.values],
        };
      }
      if (step + 1 > level) {
        level = step + 1;
        best = chains[step] ?? null;
      }
    }
  }
  return { level, chain: best };
}

export class FunnelAccumulator {
  private readonly groups = new Map<string, Hit[]>();
  private order = 0;

  constructor(
    private readonly query: FunnelScanQuery,
    private readonly lookupProfile?: ProfileLookup
  ) {}

  private needsProfile(): boolean {
    const names = [
      ...this.query.steps.flatMap((step) => [
        ...step.filters.map((filter) => filter.name),
        ...(step.anyOf ?? []).flatMap((item) =>
          item.filters.map((filter) => filter.name)
        ),
      ]),
      ...this.query.breakdowns.map((breakdown) => breakdown.name),
    ];
    return names.some((name) => name.startsWith('profile.'));
  }

  add(event: IClickhouseEvent, at: number): void {
    const row = eventRow(
      event,
      this.needsProfile() ? this.lookupProfile : undefined
    );
    const steps: number[] = [];
    this.query.steps.forEach((step, index) => {
      if (matchesStep(row, step)) {
        steps.push(index);
      }
    });
    if (steps.length === 0) {
      return;
    }
    const values = this.query.breakdowns.map((breakdown) =>
      label(readField(row, breakdown.name))
    );
    const keys =
      this.query.group === 'group'
        ? (event.groups ?? [])
        : [String(event[this.query.group] ?? '')];
    for (const key of keys) {
      if (!key) {
        continue;
      }
      const hits = this.groups.get(key) ?? [];
      hits.push({ at, order: this.order++, steps, values });
      this.groups.set(key, hits);
    }
  }

  result(): FunnelScanResult {
    const { steps, breakdowns, windowMs, timeToConvert } = this.query;
    const counts = new Map<
      string,
      { level: number; values: string[]; count: number }
    >();
    const times = new Map<
      string,
      { step: number; values: string[]; previous: number[]; first: number[] }
    >();
    for (const hits of this.groups.values()) {
      hits.sort((a, b) => a.at - b.at || a.order - b.order);
      const { level, chain } = replayFunnel(hits, steps.length, windowMs);
      if (level === 0 || !chain) {
        continue;
      }
      const values = breakdowns.map((breakdown, index) => {
        const step =
          breakdown.step && breakdown.step <= steps.length ? breakdown.step : 1;
        if (level < step) {
          return didNotReach(step);
        }
        return chain.values[step - 1]?.[index] ?? '';
      });
      const key = `${level}\u0000${values.join('\u0001')}`;
      const entry = counts.get(key) ?? { level, values, count: 0 };
      entry.count += 1;
      counts.set(key, entry);

      if (timeToConvert) {
        const shown = values.map((value) => value || EMPTY_BREAKDOWN_LABEL);
        for (let step = 2; step <= chain.times.length; step++) {
          const timeKey = `${step}\u0000${shown.join('\u0001')}`;
          const bucket = times.get(timeKey) ?? {
            step,
            values: shown,
            previous: [],
            first: [],
          };
          const at = chain.times[step - 1] ?? 0;
          bucket.previous.push(at - (chain.times[step - 2] ?? at));
          bucket.first.push(at - (chain.times[0] ?? at));
          times.set(timeKey, bucket);
        }
      }
    }
    const columns = (values: string[]) =>
      Object.fromEntries(values.map((value, index) => [`b_${index}`, value]));
    return {
      rows: [...counts.values()]
        .sort((a, b) => b.level - a.level)
        .map((entry) => ({
          level: entry.level,
          ...columns(entry.values),
          count: entry.count,
        })),
      timeToConvert: [...times.values()].map((bucket) => ({
        step: bucket.step,
        ...columns(bucket.values),
        from_previous_step:
          aggregateTimes(bucket.previous, timeToConvert ?? 'avg') /
          MS_PER_SECOND,
        from_first_step:
          aggregateTimes(bucket.first, timeToConvert ?? 'avg') / MS_PER_SECOND,
      })),
    };
  }
}
