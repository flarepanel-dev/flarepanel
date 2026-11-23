// The project's cohort operations as one Durable Object call (answers are
// JSON text, like the group and realtime reads).

import type { CohortDefinition } from '../../cohort/cohort.constants';

export type CohortQuery =
  /** Members of a definition; stored under `cohortId` when given. */
  | {
      kind: 'compute';
      definition: CohortDefinition;
      cohortId?: string;
      /** Ids returned (all members are still counted and stored). */
      sample?: number;
    }
  | { kind: 'members'; cohortId: string; limit: number; offset: number }
  | { kind: 'count'; cohortId: string }
  | { kind: 'remove'; cohortId: string }
  /** Members' top events and pages between `from` and `to` (epoch ms). */
  | {
      kind: 'activity';
      cohortId: string;
      from: number;
      to: number;
      limit: number;
    }
  /** Members' events per UTC day over the last `days` days. */
  | { kind: 'perDay'; cohortId: string; days: number };

export interface CohortComputeResult {
  ids: string[];
  count: number;
  complete: boolean;
}

export interface CohortActivity {
  events: { name: string; count: number }[];
  routes: { path: string; count: number }[];
}
