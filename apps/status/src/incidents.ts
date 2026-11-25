// When a monitor's results open or close an automatic incident. Two failed
// checks in a row (two minutes) open one, so a single dropped request does not
// page the world; three good checks in a row close it.

import type { CheckState } from './monitors';

export const OPEN_AFTER_FAILS = 2;
export const RESOLVE_AFTER_OKS = 3;

export interface MonitorState {
  fails: number;
  oks: number;
  incidentId: string | null;
}

export type IncidentAction =
  | { type: 'open' }
  | { type: 'resolve'; incidentId: string }
  | null;

export const EMPTY_STATE: MonitorState = { fails: 0, oks: 0, incidentId: null };

export function nextState(
  previous: MonitorState,
  state: CheckState
): { state: MonitorState; action: IncidentAction } {
  if (state === 'down') {
    const fails = previous.fails + 1;
    const open = fails >= OPEN_AFTER_FAILS && !previous.incidentId;
    return {
      state: { fails, oks: 0, incidentId: previous.incidentId },
      action: open ? { type: 'open' } : null,
    };
  }
  const oks = previous.oks + 1;
  if (previous.incidentId && oks >= RESOLVE_AFTER_OKS) {
    return {
      state: { fails: 0, oks, incidentId: null },
      action: { type: 'resolve', incidentId: previous.incidentId },
    };
  }
  return {
    state: { fails: 0, oks, incidentId: previous.incidentId },
    action: null,
  };
}

export type Impact = 'minor' | 'major' | 'maintenance';
export const INCIDENT_STATUSES = [
  'investigating',
  'identified',
  'monitoring',
  'resolved',
  'scheduled',
  'in_progress',
  'completed',
] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
export const CLOSED_STATUSES = new Set<IncidentStatus>([
  'resolved',
  'completed',
]);

export const STATUS_LABEL: Record<IncidentStatus, string> = {
  investigating: 'Investigating',
  identified: 'Identified',
  monitoring: 'Monitoring',
  resolved: 'Resolved',
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  completed: 'Completed',
};
