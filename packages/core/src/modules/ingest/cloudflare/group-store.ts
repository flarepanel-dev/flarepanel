// Groups of one project (companies, teams, ...) in the project's Durable
// Object SQLite, with the rules of the ClickHouse `groups` table: one live
// row per id, properties merged on every write, deleted rows hidden. Members
// are the stored profiles whose `groups` hold the group's id.

import type { IClickhouseProfile } from '../../profile/profile.service';
import type { EngineSql, SqlValue } from './engine';

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS groups (id TEXT PRIMARY KEY, type TEXT NOT NULL, name TEXT NOT NULL, properties TEXT NOT NULL, created_at INT NOT NULL, updated_at INT NOT NULL, deleted INT NOT NULL DEFAULT 0) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS groups_created ON groups (deleted, created_at)',
];
const LIKE_SPECIAL = /[\\%_]/g;
const MAX_TAKE = 200;
/** Members one group read looks at (newest first). */
const MEMBER_SCAN_LIMIT = 10_000;

export interface StoredGroup {
  id: string;
  type: string;
  name: string;
  properties: Record<string, string>;
  /** Epoch ms. */
  createdAt: number;
  updatedAt: number;
}

export interface GroupListQuery {
  take: number;
  offset?: number;
  search?: string;
  type?: string;
}

export interface GroupWrite {
  id: string;
  type?: string;
  name?: string;
  /** Already flattened to dotted string keys. */
  properties?: Record<string, string>;
}

export interface GroupMembersQuery {
  groupId: string;
  take: number;
  offset?: number;
  search?: string;
}

function toNumber(value: SqlValue | undefined): number {
  return typeof value === 'number' ? value : Number(value ?? 0);
}

function rowToGroup(row: Record<string, SqlValue>): StoredGroup {
  return {
    id: String(row.id),
    type: String(row.type),
    name: String(row.name),
    properties: JSON.parse(String(row.properties)) as Record<string, string>,
    createdAt: toNumber(row.created_at),
    updatedAt: toNumber(row.updated_at),
  };
}

function likePattern(search: string): string {
  return `%${search.toLowerCase().replace(LIKE_SPECIAL, (c) => `\\${c}`)}%`;
}

function profileCreatedMs(profile: IClickhouseProfile): number {
  const parsed = Date.parse(`${profile.created_at.replace(' ', 'T')}Z`);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function openGroupStore(sql: EngineSql, now: () => number) {
  for (const statement of SCHEMA) {
    sql.exec(statement);
  }

  function get(id: string): StoredGroup | null {
    const [row] = sql.exec(
      'SELECT * FROM groups WHERE id = ? AND deleted = 0',
      id
    );
    return row ? rowToGroup(row) : null;
  }

  /** Creates or merges: incoming properties on top, first creation time kept. */
  function upsert(input: GroupWrite): StoredGroup {
    const [row] = sql.exec('SELECT * FROM groups WHERE id = ?', input.id);
    const existing =
      row && toNumber(row.deleted) === 0 ? rowToGroup(row) : null;
    const at = now();
    const group: StoredGroup = {
      id: input.id,
      type: input.type ?? existing?.type ?? '',
      name: input.name ?? existing?.name ?? input.id,
      properties: {
        ...(existing?.properties ?? {}),
        ...(input.properties ?? {}),
      },
      createdAt: existing?.createdAt ?? at,
      updatedAt: at,
    };
    sql.exec(
      'INSERT OR REPLACE INTO groups (id, type, name, properties, created_at, updated_at, deleted) VALUES (?, ?, ?, ?, ?, ?, 0)',
      group.id,
      group.type,
      group.name,
      JSON.stringify(group.properties),
      group.createdAt,
      group.updatedAt
    );
    return group;
  }

  function remove(id: string): StoredGroup | null {
    const existing = get(id);
    if (existing) {
      sql.exec(
        'UPDATE groups SET deleted = 1, updated_at = ? WHERE id = ?',
        now(),
        id
      );
    }
    return existing;
  }

  function where(query: { search?: string; type?: string }) {
    const clauses = ['deleted = 0'];
    const bindings: SqlValue[] = [];
    if (query.type) {
      clauses.push('type = ?');
      bindings.push(query.type);
    }
    const search = query.search?.trim();
    if (search) {
      clauses.push(
        "(lower(name) LIKE ? ESCAPE '\\' OR lower(id) LIKE ? ESCAPE '\\')"
      );
      bindings.push(likePattern(search), likePattern(search));
    }
    return { clause: clauses.join(' AND '), bindings };
  }

  function list(query: GroupListQuery): StoredGroup[] {
    const { clause, bindings } = where(query);
    const take = Math.min(Math.max(1, query.take), MAX_TAKE);
    return sql
      .exec(
        `SELECT * FROM groups WHERE ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        ...bindings,
        take,
        Math.max(0, query.offset ?? 0)
      )
      .map(rowToGroup);
  }

  function count(query: { search?: string; type?: string }): number {
    const { clause, bindings } = where(query);
    const [row] = sql.exec(
      `SELECT count(*) AS n FROM groups WHERE ${clause}`,
      ...bindings
    );
    return toNumber(row?.n);
  }

  function types(): string[] {
    return sql
      .exec('SELECT DISTINCT type FROM groups WHERE deleted = 0 ORDER BY type')
      .map((row) => String(row.type));
  }

  function propertyKeys(): string[] {
    const keys = new Set<string>();
    for (const row of sql.exec(
      'SELECT properties FROM groups WHERE deleted = 0'
    )) {
      for (const key of Object.keys(JSON.parse(String(row.properties)))) {
        keys.add(key);
      }
    }
    return [...keys].sort();
  }

  function byIds(ids: string[]): StoredGroup[] {
    if (ids.length === 0) {
      return [];
    }
    return sql
      .exec(
        `SELECT * FROM groups WHERE deleted = 0 AND id IN (${ids.map(() => '?').join(', ')})`,
        ...ids
      )
      .map(rowToGroup);
  }

  /** Profiles whose `groups` hold the id, newest first (by first seen). */
  function memberProfiles(groupId: string): IClickhouseProfile[] {
    return sql
      .exec(
        "SELECT body FROM identities WHERE EXISTS (SELECT 1 FROM json_each(identities.body, '$.groups') WHERE json_each.value = ?) ORDER BY last_seen DESC LIMIT ?",
        groupId,
        MEMBER_SCAN_LIMIT
      )
      .map((row) => JSON.parse(String(row.body)) as IClickhouseProfile)
      .sort((a, b) => profileCreatedMs(b) - profileCreatedMs(a));
  }

  function members(query: GroupMembersQuery): { ids: string[]; count: number } {
    const search = query.search?.trim().toLowerCase();
    const all = memberProfiles(query.groupId).filter(
      (profile) =>
        !search ||
        [profile.email, profile.first_name, profile.last_name].some((value) =>
          value?.toLowerCase().includes(search)
        )
    );
    const offset = Math.max(0, query.offset ?? 0);
    return {
      ids: all
        .slice(offset, offset + Math.min(query.take, MAX_TAKE))
        .map((profile) => profile.id),
      count: all.length,
    };
  }

  /** Member count and the latest member activity, per group. */
  function stats(
    ids: string[]
  ): { groupId: string; memberCount: number; lastActiveAt: number | null }[] {
    return ids.map((groupId) => {
      const profiles = memberProfiles(groupId);
      const lastSeen = profiles
        .map((profile) =>
          Date.parse(`${profile.last_seen_at.replace(' ', 'T')}Z`)
        )
        .filter(Number.isFinite);
      return {
        groupId,
        memberCount: profiles.length,
        lastActiveAt: lastSeen.length > 0 ? Math.max(...lastSeen) : null,
      };
    });
  }

  /** New members per UTC day over the last `days` days, oldest first. */
  function memberGrowth(
    groupId: string,
    days: number
  ): { date: string; count: number }[] {
    const dayMs = 24 * 60 * 60 * 1000;
    const today = Math.floor(now() / dayMs) * dayMs;
    const counts = new Map<string, number>();
    for (let index = days - 1; index >= 0; index--) {
      counts.set(new Date(today - index * dayMs).toISOString().slice(0, 10), 0);
    }
    for (const profile of memberProfiles(groupId)) {
      const day = new Date(profileCreatedMs(profile))
        .toISOString()
        .slice(0, 10);
      if (counts.has(day)) {
        counts.set(day, (counts.get(day) ?? 0) + 1);
      }
    }
    return [...counts.entries()].map(([date, count]) => ({ date, count }));
  }

  /** Distinct values of `name`, `type`, `id` or `properties.<key>`. */
  function propertyValues(field: string): string[] {
    const values = new Set<string>();
    for (const row of sql.exec(
      'SELECT * FROM groups WHERE deleted = 0 ORDER BY updated_at DESC LIMIT ?',
      MEMBER_SCAN_LIMIT
    )) {
      const group = rowToGroup(row);
      const value = field.startsWith('properties.')
        ? group.properties[field.slice('properties.'.length)]
        : field === 'name' || field === 'type' || field === 'id'
          ? group[field]
          : undefined;
      if (value?.trim()) {
        values.add(value.trim());
      }
    }
    return [...values].sort();
  }

  return {
    get,
    upsert,
    propertyValues,
    remove,
    list,
    count,
    types,
    propertyKeys,
    byIds,
    members,
    stats,
    memberGrowth,
  };
}

export type GroupStore = ReturnType<typeof openGroupStore>;
