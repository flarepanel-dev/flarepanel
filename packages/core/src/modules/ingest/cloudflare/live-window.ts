// The dashboard's live card: sessions, visitors and referrers per minute over
// the last 30 minutes. Kept in memory as sets (so adding an event twice is
// harmless) and rebuilt from recent chunks after a restart.

import type { IClickhouseEvent } from '../../event/event.service';
import { eventTimeMs, MINUTE_MS } from './time-buckets';

export const LIVE_WINDOW_MS = 30 * MINUTE_MS;
const TOP_REFERRERS = 10;

interface MinuteState {
  sessions: Set<string>;
  visitors: Set<string>;
  /** referrer name → sessions */
  referrers: Map<string, Set<string>>;
}

export interface LiveSnapshot {
  totalSessions: number;
  minutes: {
    /** `yyyy-MM-dd HH:mm:00`, UTC. */
    minute: string;
    sessions: number;
    visitors: number;
    referrers: { name: string; count: number }[];
  }[];
  referrers: { name: string; count: number }[];
}

function minuteLabel(ms: number): string {
  return `${new Date(ms).toISOString().slice(0, 16).replace('T', ' ')}:00`;
}

function rankReferrers(referrers: Map<string, Set<string>>, limit?: number) {
  const ranked = [...referrers.entries()]
    .map(([name, sessions]) => ({ name, count: sessions.size }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return limit ? ranked.slice(0, limit) : ranked;
}

export class LiveWindow {
  private readonly minutes = new Map<number, MinuteState>();

  add(event: IClickhouseEvent, nowMs: number): void {
    const at = eventTimeMs(event.created_at);
    if (!(at >= nowMs - LIVE_WINDOW_MS - MINUTE_MS) || at > nowMs + MINUTE_MS) {
      return;
    }
    const key = Math.floor(at / MINUTE_MS) * MINUTE_MS;
    let state = this.minutes.get(key);
    if (!state) {
      state = {
        sessions: new Set(),
        visitors: new Set(),
        referrers: new Map(),
      };
      this.minutes.set(key, state);
    }
    if (event.session_id) {
      state.sessions.add(event.session_id);
    }
    if (event.profile_id) {
      state.visitors.add(event.profile_id);
    }
    if (event.referrer_name && event.session_id) {
      const sessions = state.referrers.get(event.referrer_name) ?? new Set();
      sessions.add(event.session_id);
      state.referrers.set(event.referrer_name, sessions);
    }
  }

  clear(): void {
    this.minutes.clear();
  }

  snapshot(nowMs: number): LiveSnapshot {
    const since = nowMs - LIVE_WINDOW_MS;
    const firstMinute = Math.floor(since / MINUTE_MS) * MINUTE_MS;
    for (const key of this.minutes.keys()) {
      if (key < firstMinute) {
        this.minutes.delete(key);
      }
    }
    const allSessions = new Set<string>();
    const allReferrers = new Map<string, Set<string>>();
    const minutes: LiveSnapshot['minutes'] = [];
    for (let key = firstMinute; key <= nowMs; key += MINUTE_MS) {
      const state = this.minutes.get(key);
      for (const session of state?.sessions ?? []) {
        allSessions.add(session);
      }
      for (const [name, sessions] of state?.referrers ?? []) {
        const merged = allReferrers.get(name) ?? new Set<string>();
        for (const session of sessions) {
          merged.add(session);
        }
        allReferrers.set(name, merged);
      }
      minutes.push({
        minute: minuteLabel(key),
        sessions: state?.sessions.size ?? 0,
        visitors: state?.visitors.size ?? 0,
        referrers: state ? rankReferrers(state.referrers) : [],
      });
    }
    return {
      totalSessions: allSessions.size,
      minutes,
      referrers: rankReferrers(allReferrers, TOP_REFERRERS),
    };
  }
}
