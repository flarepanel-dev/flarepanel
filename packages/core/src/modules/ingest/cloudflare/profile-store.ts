// Identified profiles of one project (identify, increment, decrement, group
// assignment) in the project's Durable Object SQLite, merged with the same
// rules as the Bun profile buffer. One row per profile; a write that changes
// nothing but the last-seen time inside an hour is skipped, so SDKs that call
// identify on every page load do not cost a row each time.

import { mergeProfiles } from '../../../buffers/profile-merge';
import type { IClickhouseProfile } from '../../profile/profile.service';
import type { EngineSql, SqlValue } from './engine';

const SCHEMA =
  'CREATE TABLE IF NOT EXISTS identities (id TEXT PRIMARY KEY, body TEXT NOT NULL, is_external INT NOT NULL, last_seen INT NOT NULL, search TEXT NOT NULL) WITHOUT ROWID';
const LAST_SEEN_REFRESH_MS = 60 * 60 * 1000;
const MAX_TAKE = 200;
const LIKE_SPECIAL = /[\\%_]/g;

export interface ProfileListQuery {
  /** Page number, as the dashboard's profile list sends it. */
  cursor?: number;
  take: number;
  search?: string;
  isExternal?: boolean;
}

export interface ProfileListPage {
  profiles: IClickhouseProfile[];
  count: number;
}

function lastSeenMs(profile: IClickhouseProfile): number {
  const parsed = Date.parse(`${profile.last_seen_at.replace(' ', 'T')}Z`);
  return Number.isFinite(parsed) ? parsed : 0;
}

function searchText(profile: IClickhouseProfile): string {
  return [profile.id, profile.first_name, profile.last_name, profile.email]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function withoutLastSeen(profile: IClickhouseProfile): string {
  const { last_seen_at: _ignored, ...rest } = profile;
  return JSON.stringify(rest);
}

function toNumber(value: SqlValue | undefined): number {
  return typeof value === 'number' ? value : Number(value ?? 0);
}

export function openProfileStore(sql: EngineSql) {
  sql.exec(SCHEMA);

  function get(id: string): IClickhouseProfile | null {
    const [row] = sql.exec('SELECT body FROM identities WHERE id = ?', id);
    return row ? (JSON.parse(String(row.body)) as IClickhouseProfile) : null;
  }

  /**
   * Merges `incoming` into the stored profile and returns the result.
   * `onlyIfNew` (a profile seen on an event) never overwrites an existing one.
   */
  function upsert(
    incoming: IClickhouseProfile,
    { onlyIfNew = false }: { onlyIfNew?: boolean } = {}
  ): IClickhouseProfile {
    const existing = get(incoming.id);
    if (existing && onlyIfNew) {
      return existing;
    }
    const merged = mergeProfiles(existing, incoming);
    const unchanged =
      existing &&
      withoutLastSeen(existing) === withoutLastSeen(merged) &&
      lastSeenMs(merged) - lastSeenMs(existing) < LAST_SEEN_REFRESH_MS;
    if (unchanged) {
      return existing;
    }
    sql.exec(
      'INSERT OR REPLACE INTO identities (id, body, is_external, last_seen, search) VALUES (?, ?, ?, ?, ?)',
      merged.id,
      JSON.stringify(merged),
      merged.is_external ? 1 : 0,
      lastSeenMs(merged),
      searchText(merged)
    );
    return merged;
  }

  function list(query: ProfileListQuery): ProfileListPage {
    const take = Math.min(Math.max(1, query.take), MAX_TAKE);
    const offset = Math.max(0, query.cursor ?? 0) * take;
    const where: string[] = [];
    const bindings: SqlValue[] = [];
    const search = query.search?.trim().toLowerCase();
    if (search) {
      where.push("search LIKE ? ESCAPE '\\'");
      bindings.push(`%${search.replace(LIKE_SPECIAL, (c) => `\\${c}`)}%`);
    }
    if (query.isExternal !== undefined) {
      where.push('is_external = ?');
      bindings.push(query.isExternal ? 1 : 0);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = sql.exec(
      `SELECT body FROM identities ${clause} ORDER BY last_seen DESC LIMIT ? OFFSET ?`,
      ...bindings,
      take,
      offset
    );
    const [countRow] = sql.exec(
      `SELECT count(*) AS n FROM identities ${clause}`,
      ...bindings
    );
    return {
      profiles: rows.map(
        (row) => JSON.parse(String(row.body)) as IClickhouseProfile
      ),
      count: toNumber(countRow?.n),
    };
  }

  return { get, upsert, list };
}

export type ProfileStore = ReturnType<typeof openProfileStore>;
