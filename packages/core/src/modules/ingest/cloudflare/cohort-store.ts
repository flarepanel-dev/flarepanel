// Cohort members of one project in the project's Durable Object SQLite.
// A refresh writes only the difference from the stored members, so a stable
// cohort costs no writes. Stored cohorts register their membership with the
// filter evaluator, so `inCohort` filters work in every scan of the object.

import type { EngineSql, SqlValue } from './engine';
import { registerCohortMembership } from './filter-eval';

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS cohort_members (cohort_id TEXT NOT NULL, profile_id TEXT NOT NULL, matched_at INT NOT NULL, PRIMARY KEY (cohort_id, profile_id)) WITHOUT ROWID',
];
const MAX_TAKE = 1000;

function toNumber(value: SqlValue | undefined): number {
  return typeof value === 'number' ? value : Number(value ?? 0);
}

export function openCohortStore(sql: EngineSql, now: () => number) {
  for (const statement of SCHEMA) {
    sql.exec(statement);
  }
  const cache = new Map<string, Set<string>>();

  function ids(cohortId: string): Set<string> {
    let members = cache.get(cohortId);
    if (!members) {
      members = new Set(
        sql
          .exec(
            'SELECT profile_id FROM cohort_members WHERE cohort_id = ?',
            cohortId
          )
          .map((row) => String(row.profile_id))
      );
      cache.set(cohortId, members);
    }
    return members;
  }

  function register(cohortId: string) {
    registerCohortMembership(cohortId, (profileId) =>
      ids(cohortId).has(profileId)
    );
  }

  for (const row of sql.exec('SELECT DISTINCT cohort_id FROM cohort_members')) {
    register(String(row.cohort_id));
  }

  /** Stores the members; returns how many rows changed. */
  function replace(cohortId: string, profileIds: string[]): number {
    const next = new Set(profileIds);
    const current = ids(cohortId);
    const at = now();
    let changed = 0;
    sql.transaction(() => {
      for (const id of current) {
        if (!next.has(id)) {
          sql.exec(
            'DELETE FROM cohort_members WHERE cohort_id = ? AND profile_id = ?',
            cohortId,
            id
          );
          changed += 1;
        }
      }
      for (const id of next) {
        if (!current.has(id)) {
          sql.exec(
            'INSERT INTO cohort_members (cohort_id, profile_id, matched_at) VALUES (?, ?, ?)',
            cohortId,
            id,
            at
          );
          changed += 1;
        }
      }
    });
    cache.set(cohortId, next);
    register(cohortId);
    return changed;
  }

  /** Newest members first. */
  function members(
    cohortId: string,
    limit = MAX_TAKE,
    offset = 0
  ): { profileIds: string[]; total: number } {
    const rows = sql.exec(
      'SELECT profile_id FROM cohort_members WHERE cohort_id = ? ORDER BY matched_at DESC, profile_id LIMIT ? OFFSET ?',
      cohortId,
      Math.min(Math.max(1, limit), MAX_TAKE),
      Math.max(0, offset)
    );
    return {
      profileIds: rows.map((row) => String(row.profile_id)),
      total: count(cohortId),
    };
  }

  function count(cohortId: string): number {
    const [row] = sql.exec(
      'SELECT count(*) AS n FROM cohort_members WHERE cohort_id = ?',
      cohortId
    );
    return toNumber(row?.n);
  }

  function remove(cohortId: string) {
    sql.exec('DELETE FROM cohort_members WHERE cohort_id = ?', cohortId);
    cache.delete(cohortId);
    registerCohortMembership(cohortId, null);
  }

  return { ids, replace, members, count, remove };
}

export type CohortStore = ReturnType<typeof openCohortStore>;
