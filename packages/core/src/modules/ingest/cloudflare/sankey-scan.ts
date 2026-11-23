// User flow (Sankey) from a project's stored events, with the ClickHouse
// sankey statements' rules: per session, event names in time order with
// consecutive repeats collapsed; sliced by mode (`after` / `before` a start
// event, `between` a start and an end event, or from the session's start);
// paths of at least two events; the three most common entry events; and the
// counted transitions (source, target, step) of paths that start with them.

import type { IClickhouseEvent } from '../../event/event.service';
import { eventRow } from './chart-scan';
import { matchesFilters, type RowFilter } from './filter-eval';

export interface SankeyScanEvent {
  name: string;
  filters: RowFilter[];
}

export interface SankeyScanQuery {
  from: number;
  to: number;
  steps: number;
  mode: 'after' | 'before' | 'between';
  startEvent?: SankeyScanEvent;
  endEvent?: SankeyScanEvent;
  include?: string[];
  exclude: string[];
}

export interface SankeyScanResult {
  topEntries: { entry_event: string; count: number }[];
  transitions: {
    source: string;
    target: string;
    step: number;
    value: number;
  }[];
}

const TOP_ENTRY_EVENTS = 3;
const MIN_PATH_LENGTH = 2;

/** 1-based like ClickHouse's arrayFirstIndex; 0 when absent. */
function firstIndex(names: string[], name: string, after = 0): number {
  for (let index = after; index < names.length; index++) {
    if (names[index] === name) {
      return index + 1;
    }
  }
  return 0;
}

function truncateAtRepeat(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of names) {
    if (seen.has(name)) {
      break;
    }
    seen.add(name);
    out.push(name);
  }
  return out;
}

export class SankeyAccumulator {
  private readonly sessions = new Map<
    string,
    { at: number; order: number; name: string }[]
  >();
  private readonly startSessions = new Set<string>();
  private readonly endSessions = new Set<string>();
  private order = 0;

  constructor(private readonly query: SankeyScanQuery) {}

  private isListed(name: string): boolean {
    const { include, exclude, startEvent, endEvent } = this.query;
    if (include && include.length > 0) {
      return (
        include.includes(name) ||
        name === startEvent?.name ||
        name === endEvent?.name
      );
    }
    return !exclude.includes(name);
  }

  add(event: IClickhouseEvent, at: number): void {
    const sessionId = event.session_id;
    if (!sessionId) {
      return;
    }
    const { startEvent, endEvent } = this.query;
    const needsRow =
      (startEvent && event.name === startEvent.name) ||
      (endEvent && event.name === endEvent.name);
    if (needsRow) {
      const row = eventRow(event);
      if (
        startEvent &&
        event.name === startEvent.name &&
        matchesFilters(row, startEvent.filters)
      ) {
        this.startSessions.add(sessionId);
      }
      if (
        endEvent &&
        event.name === endEvent.name &&
        matchesFilters(row, endEvent.filters)
      ) {
        this.endSessions.add(sessionId);
      }
    }
    if (!this.isListed(event.name)) {
      return;
    }
    const events = this.sessions.get(sessionId) ?? [];
    events.push({ at, order: this.order++, name: event.name });
    this.sessions.set(sessionId, events);
  }

  private path(sessionId: string, deduped: string[]): string[] | null {
    const { mode, startEvent, endEvent, steps } = this.query;
    if (mode === 'after' && startEvent) {
      if (!this.startSessions.has(sessionId)) {
        return null;
      }
      const first = firstIndex(deduped, startEvent.name);
      const sliced =
        first === 0 ? [] : deduped.slice(first - 1, first - 1 + steps);
      return truncateAtRepeat(sliced);
    }
    if (mode === 'before' && startEvent) {
      if (!this.startSessions.has(sessionId)) {
        return null;
      }
      const first = firstIndex(deduped, startEvent.name);
      if (first === 0) {
        return [];
      }
      const from = Math.max(1, first - steps + 1);
      return deduped.slice(from - 1, first);
    }
    if (mode === 'between' && startEvent && endEvent) {
      if (
        !(this.startSessions.has(sessionId) && this.endSessions.has(sessionId))
      ) {
        return null;
      }
      const first = firstIndex(deduped, startEvent.name);
      const rest = first === 0 ? [] : deduped.slice(first - 1);
      const start = firstIndex(rest, startEvent.name);
      const end = start === 0 ? 0 : firstIndex(rest, endEvent.name, start);
      if (start === 0 || end === 0 || end - start >= steps) {
        return null;
      }
      return rest.slice(start - 1, end);
    }
    return deduped.slice(0, steps);
  }

  result(): SankeyScanResult {
    const paths: string[][] = [];
    for (const [sessionId, events] of this.sessions) {
      events.sort((a, b) => a.at - b.at || a.order - b.order);
      const deduped: string[] = [];
      for (const { name } of events) {
        if (deduped.at(-1) !== name) {
          deduped.push(name);
        }
      }
      const path = this.path(sessionId, deduped);
      if (path && path.length >= MIN_PATH_LENGTH) {
        paths.push(path);
      }
    }
    const entries = new Map<string, number>();
    for (const path of paths) {
      const entry = path[0] as string;
      entries.set(entry, (entries.get(entry) ?? 0) + 1);
    }
    const topEntries = [...entries.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, TOP_ENTRY_EVENTS)
      .map(([entry_event, count]) => ({ entry_event, count }));
    const top = new Set(topEntries.map((entry) => entry.entry_event));
    const transitions = new Map<
      string,
      { source: string; target: string; step: number; value: number }
    >();
    for (const path of paths) {
      if (!top.has(path[0] as string)) {
        continue;
      }
      for (let index = 1; index < path.length; index++) {
        const source = path[index - 1] as string;
        const target = path[index] as string;
        const key = `${source}\u0000${target}\u0000${index}`;
        const entry = transitions.get(key) ?? {
          source,
          target,
          step: index,
          value: 0,
        };
        entry.value += 1;
        transitions.set(key, entry);
      }
    }
    return {
      topEntries,
      transitions: [...transitions.values()].sort(
        (a, b) =>
          a.step - b.step ||
          b.value - a.value ||
          a.source.localeCompare(b.source) ||
          a.target.localeCompare(b.target)
      ),
    };
  }
}
