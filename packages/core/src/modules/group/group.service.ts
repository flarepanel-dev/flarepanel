// Every query is a `sql` fragment (src/sql.ts). The one write
// (`writeGroupToCh`) goes through `deps.ch.insert`.

import { toDots } from '@flarepanel/shared';
import { chQuery } from '../../ch-query';
import { TRPCBadRequestError } from '../../rpc/errors';
import type { ServiceDeps, Services } from '../../services';
import type { GroupQuery } from '../ingest/cloudflare/group-query';
import type { GroupSummary } from '../ingest/cloudflare/group-scan';
import type { StoredGroup } from '../ingest/cloudflare/group-store';
import { getProfiles, type IServiceProfile } from '../profile/profile.service';
import { formatClickhouseDate, toNullIfDefaultMinDate } from './src/dates';
import {
  GROUPS_TABLE,
  groupActivityQuery,
  groupByIdQuery,
  groupEventMetricsQuery,
  groupListCountQuery,
  groupListQuery,
  groupMemberGrowthQuery,
  groupMemberProfilesQuery,
  groupMostEventsQuery,
  groupPopularRoutesQuery,
  groupPropertyKeysQuery,
  groupStatsQuery,
  groupsByIdsQuery,
  groupTypesQuery,
  groupUniqueProfilesQuery,
} from './src/sql';

const FIND_GROUPS_DEFAULT_LIMIT = 20;
const GROUP_MEMBERS_DEFAULT_LIMIT = 10;

export interface IServiceGroup {
  id: string;
  projectId: string;
  type: string;
  name: string;
  properties: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceUpsertGroup {
  id: string;
  projectId: string;
  type: string;
  name: string;
  properties?: Record<string, unknown>;
}

interface IClickhouseGroup {
  project_id: string;
  id: string;
  type: string;
  name: string;
  properties: Record<string, string>;
  created_at: string;
  version: string;
}

function transformGroup(row: IClickhouseGroup): IServiceGroup {
  return {
    id: row.id,
    projectId: row.project_id,
    type: row.type,
    name: row.name,
    properties: row.properties,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(Number(row.version)),
  };
}

/** Workers: one group call to the project's Durable Object (JSON answers). */
async function storeGroups<T>(
  deps: ServiceDeps,
  projectId: string,
  query: GroupQuery
): Promise<T> {
  const store = deps.eventStore as NonNullable<ServiceDeps['eventStore']>;
  return JSON.parse(await store.groups(projectId, query)) as T;
}

function fromStored(group: StoredGroup, projectId: string): IServiceGroup {
  return {
    id: group.id,
    projectId,
    type: group.type,
    name: group.name,
    properties: group.properties,
    createdAt: new Date(group.createdAt),
    updatedAt: new Date(group.updatedAt),
  };
}

const MEMBER_GROWTH_DAYS = 30;

function pageOffset(cursor: number | undefined, take: number): number {
  return Math.max(0, (cursor ?? 0) * take);
}

async function writeGroupToCh(
  deps: ServiceDeps,
  group: {
    id: string;
    projectId: string;
    type: string;
    name: string;
    properties: Record<string, string>;
    createdAt?: Date;
  },
  deleted = 0
) {
  await deps.ch.insert({
    format: 'JSONEachRow',
    table: GROUPS_TABLE,
    values: [
      {
        project_id: group.projectId,
        id: group.id,
        type: group.type,
        name: group.name,
        properties: group.properties,
        created_at: formatClickhouseDate(group.createdAt ?? new Date()),
        version: Date.now(),
        deleted,
      },
    ],
  });
}

/** `upsertGroup`/`updateGroup` share this: existing properties, incoming ones on top. */
function mergeGroupProperties(
  existingProperties: Record<string, unknown> | undefined,
  incomingProperties: Record<string, unknown> | undefined
): Record<string, string> {
  return toDots({
    ...(existingProperties ?? {}),
    ...(incomingProperties ?? {}),
  });
}

export async function upsertGroup(
  deps: ServiceDeps,
  input: IServiceUpsertGroup
) {
  if (deps.eventStore) {
    await storeGroups(deps, input.projectId, {
      kind: 'upsert',
      group: {
        id: input.id,
        type: input.type,
        name: input.name,
        properties: mergeGroupProperties({}, input.properties),
      },
    });
    return;
  }
  const existing = await getGroupById(deps, input.id, input.projectId);
  await writeGroupToCh(deps, {
    id: input.id,
    projectId: input.projectId,
    type: input.type,
    name: input.name,
    properties: mergeGroupProperties(existing?.properties, input.properties),
    createdAt: existing?.createdAt,
  });
}

export async function getGroupById(
  deps: ServiceDeps,
  id: string,
  projectId: string
): Promise<IServiceGroup | null> {
  if (deps.eventStore) {
    const group = await storeGroups<StoredGroup | null>(deps, projectId, {
      kind: 'get',
      id,
    });
    return group ? fromStored(group, projectId) : null;
  }
  const rows = await chQuery<IClickhouseGroup>(
    deps,
    groupByIdQuery({ id, projectId })
  );
  return rows[0] ? transformGroup(rows[0]) : null;
}

export interface GetGroupListOptions {
  projectId: string;
  cursor?: number;
  take: number;
  search?: string;
  type?: string;
}

export async function getGroupList(
  deps: ServiceDeps,
  { projectId, cursor, take, search, type }: GetGroupListOptions
): Promise<IServiceGroup[]> {
  if (deps.eventStore) {
    const groups = await storeGroups<StoredGroup[]>(deps, projectId, {
      kind: 'list',
      query: { take, offset: pageOffset(cursor, take), search, type },
    });
    return groups.map((group) => fromStored(group, projectId));
  }
  const rows = await chQuery<IClickhouseGroup>(
    deps,
    groupListQuery({
      projectId,
      take,
      offset: pageOffset(cursor, take),
      search,
      type,
    })
  );
  return rows.map(transformGroup);
}

export async function getGroupListCount(
  deps: ServiceDeps,
  {
    projectId,
    type,
    search,
  }: {
    projectId: string;
    type?: string;
    search?: string;
  }
): Promise<number> {
  if (deps.eventStore) {
    return storeGroups<number>(deps, projectId, {
      kind: 'count',
      query: { type, search },
    });
  }
  const rows = await chQuery<{ count: number }>(
    deps,
    groupListCountQuery({ projectId, type, search })
  );
  return rows[0]?.count ?? 0;
}

export async function getGroupTypes(
  deps: ServiceDeps,
  projectId: string
): Promise<string[]> {
  if (deps.eventStore) {
    return storeGroups<string[]>(deps, projectId, { kind: 'types' });
  }
  const rows = await chQuery<{ type: string }>(
    deps,
    groupTypesQuery(projectId)
  );
  return rows.map((r) => r.type);
}

export async function createGroup(
  deps: ServiceDeps,
  input: IServiceUpsertGroup
) {
  // `upsertGroup` merges onto an existing row, so without this a create
  // silently overwrote a group instead of telling the caller it was taken —
  // the inverse of the guard updateGroup and deleteGroup already carry.
  const existing = await getGroupById(deps, input.id, input.projectId);
  if (existing) {
    throw new TRPCBadRequestError(`Group ${input.id} already exists`);
  }
  await upsertGroup(deps, input);
  return getGroupById(deps, input.id, input.projectId);
}

export async function updateGroup(
  deps: ServiceDeps,
  id: string,
  projectId: string,
  data: { type?: string; name?: string; properties?: Record<string, unknown> }
) {
  const existing = await getGroupById(deps, id, projectId);
  if (!existing) {
    throw new Error(`Group ${id} not found`);
  }
  const updated = {
    id,
    projectId,
    type: data.type ?? existing.type,
    name: data.name ?? existing.name,
    properties: mergeGroupProperties(existing.properties, data.properties),
    createdAt: existing.createdAt,
  };
  if (deps.eventStore) {
    // The incoming properties were merged above; the store merges again,
    // which is the same result.
    await storeGroups(deps, projectId, {
      kind: 'upsert',
      group: {
        id,
        type: updated.type,
        name: updated.name,
        properties: updated.properties,
      },
    });
  } else {
    await writeGroupToCh(deps, updated);
  }
  return { ...existing, ...updated };
}

export async function deleteGroup(
  deps: ServiceDeps,
  id: string,
  projectId: string
) {
  const existing = await getGroupById(deps, id, projectId);
  if (!existing) {
    throw new Error(`Group ${id} not found`);
  }
  if (deps.eventStore) {
    await storeGroups(deps, projectId, { kind: 'remove', id });
    return existing;
  }
  await writeGroupToCh(
    deps,
    {
      id,
      projectId,
      type: existing.type,
      name: existing.name,
      properties: existing.properties as Record<string, string>,
      createdAt: existing.createdAt,
    },
    1
  );
  return existing;
}

export async function getGroupPropertyKeys(
  deps: ServiceDeps,
  projectId: string
): Promise<string[]> {
  if (deps.eventStore) {
    return storeGroups<string[]>(deps, projectId, { kind: 'propertyKeys' });
  }
  const rows = await chQuery<{ key: string }>(
    deps,
    groupPropertyKeysQuery(projectId)
  );
  return rows.map((r) => r.key).sort();
}

export interface IServiceGroupStats {
  groupId: string;
  memberCount: number;
  lastActiveAt: Date | null;
}

export async function getGroupStats(
  deps: ServiceDeps,
  projectId: string,
  groupIds: string[]
): Promise<Map<string, IServiceGroupStats>> {
  if (groupIds.length === 0) {
    return new Map();
  }
  if (deps.eventStore) {
    const stats = await storeGroups<
      { groupId: string; memberCount: number; lastActiveAt: number | null }[]
    >(deps, projectId, { kind: 'stats', ids: groupIds });
    return new Map(
      stats.map((stat) => [
        stat.groupId,
        {
          groupId: stat.groupId,
          memberCount: stat.memberCount,
          lastActiveAt: stat.lastActiveAt ? new Date(stat.lastActiveAt) : null,
        },
      ])
    );
  }

  const rows = await chQuery<{
    group_id: string;
    member_count: number;
    last_active_at: string;
  }>(deps, groupStatsQuery({ projectId, groupIds }));

  return new Map(
    rows.map((r) => [
      r.group_id,
      {
        groupId: r.group_id,
        memberCount: r.member_count,
        lastActiveAt: r.last_active_at ? new Date(r.last_active_at) : null,
      },
    ])
  );
}

export async function getGroupsByIds(
  deps: ServiceDeps,
  projectId: string,
  ids: string[]
): Promise<IServiceGroup[]> {
  if (ids.length === 0) {
    return [];
  }
  if (deps.eventStore) {
    const groups = await storeGroups<StoredGroup[]>(deps, projectId, {
      kind: 'byIds',
      ids,
    });
    return groups.map((group) => fromStored(group, projectId));
  }

  const rows = await chQuery<IClickhouseGroup>(
    deps,
    groupsByIdsQuery({ projectId, ids })
  );
  return rows.map(transformGroup);
}

export interface GetGroupMemberProfilesOptions {
  projectId: string;
  groupId: string;
  cursor?: number;
  take: number;
  search?: string;
}

export async function getGroupMemberProfiles(
  deps: ServiceDeps,
  { projectId, groupId, cursor, take, search }: GetGroupMemberProfilesOptions
): Promise<{
  data: IServiceProfile[];
  count: number;
}> {
  let count: number;
  let profileIds: string[];
  if (deps.eventStore) {
    const page = await storeGroups<{ ids: string[]; count: number }>(
      deps,
      projectId,
      {
        kind: 'members',
        query: {
          groupId,
          take,
          offset: pageOffset(cursor, take),
          search: search?.trim() || undefined,
        },
      }
    );
    count = page.count;
    profileIds = page.ids;
  } else {
    const rows = await chQuery<{ id: string; total_count: number }>(
      deps,
      groupMemberProfilesQuery({
        projectId,
        groupId,
        take,
        offset: pageOffset(cursor, take),
        search: search?.trim() || undefined,
      })
    );
    count = rows[0]?.total_count ?? 0;
    profileIds = rows.map((r) => r.id);
  }

  if (profileIds.length === 0) {
    return { data: [], count };
  }

  const profiles = await getProfiles(deps, profileIds, projectId);
  const byId = new Map(profiles.map((p) => [p.id, p]));
  const data = profileIds
    .map((id) => byId.get(id))
    .filter(Boolean) as IServiceProfile[];
  return { data, count };
}

/** `list`: the page plus each group's member count / last activity. */
export async function getGroupListPage(
  deps: ServiceDeps,
  input: GetGroupListOptions
) {
  const [data, count] = await Promise.all([
    getGroupList(deps, input),
    getGroupListCount(deps, input),
  ]);
  const stats = await getGroupStats(
    deps,
    input.projectId,
    data.map((g) => g.id)
  );
  return {
    data: data.map((g) => ({
      ...g,
      memberCount: stats.get(g.id)?.memberCount ?? 0,
      lastActiveAt: stats.get(g.id)?.lastActiveAt ?? null,
    })),
    meta: { count, take: input.take },
  };
}

export async function getGroupMetrics(
  deps: ServiceDeps,
  id: string,
  projectId: string
) {
  if (deps.eventStore) {
    const [summary, stats] = await Promise.all([
      storeGroups<GroupSummary>(deps, projectId, { kind: 'summary', id }),
      storeGroups<{ memberCount: number }[]>(deps, projectId, {
        kind: 'stats',
        ids: [id],
      }),
    ]);
    return {
      totalEvents: summary.totalEvents,
      uniqueProfiles: stats[0]?.memberCount ?? 0,
      firstSeen: toNullIfDefaultMinDate(summary.firstSeen),
      lastSeen: toNullIfDefaultMinDate(summary.lastSeen),
    };
  }
  const [eventData, profileData] = await Promise.all([
    chQuery<{ totalEvents: number; firstSeen: string; lastSeen: string }>(
      deps,
      groupEventMetricsQuery({ projectId, groupId: id })
    ),
    chQuery<{ uniqueProfiles: number }>(
      deps,
      groupUniqueProfilesQuery({ projectId, groupId: id })
    ),
  ]);

  return {
    totalEvents: eventData[0]?.totalEvents ?? 0,
    uniqueProfiles: profileData[0]?.uniqueProfiles ?? 0,
    firstSeen: toNullIfDefaultMinDate(eventData[0]?.firstSeen),
    lastSeen: toNullIfDefaultMinDate(eventData[0]?.lastSeen),
  };
}

export async function getGroupActivity(
  deps: ServiceDeps,
  id: string,
  projectId: string
) {
  if (deps.eventStore) {
    return (
      await storeGroups<GroupSummary>(deps, projectId, { kind: 'summary', id })
    ).activity;
  }
  return chQuery<{ count: number; date: string }>(
    deps,
    groupActivityQuery({ projectId, groupId: id })
  );
}

export async function getGroupMemberGrowth(
  deps: ServiceDeps,
  id: string,
  projectId: string
) {
  if (deps.eventStore) {
    return storeGroups<{ date: string; count: number }[]>(deps, projectId, {
      kind: 'memberGrowth',
      id,
      days: MEMBER_GROWTH_DAYS,
    });
  }
  return chQuery<{ date: string; count: number }>(
    deps,
    groupMemberGrowthQuery({ projectId, groupId: id })
  );
}

export async function getGroupMostEvents(
  deps: ServiceDeps,
  id: string,
  projectId: string
) {
  if (deps.eventStore) {
    return (
      await storeGroups<GroupSummary>(deps, projectId, { kind: 'summary', id })
    ).mostEvents;
  }
  return chQuery<{ count: number; name: string }>(
    deps,
    groupMostEventsQuery({ projectId, groupId: id })
  );
}

export async function getGroupPopularRoutes(
  deps: ServiceDeps,
  id: string,
  projectId: string
) {
  if (deps.eventStore) {
    return (
      await storeGroups<GroupSummary>(deps, projectId, { kind: 'summary', id })
    ).popularRoutes;
  }
  return chQuery<{ count: number; path: string }>(
    deps,
    groupPopularRoutesQuery({ projectId, groupId: id })
  );
}

export async function getGroupMemberProfilesPage(
  deps: ServiceDeps,
  input: GetGroupMemberProfilesOptions
) {
  const { data, count } = await getGroupMemberProfiles(deps, input);
  return {
    data,
    meta: { count, pageCount: input.take },
  };
}

export async function listGroupTypesCore(deps: ServiceDeps, projectId: string) {
  const types = await getGroupTypes(deps, projectId);
  return { types };
}

export async function findGroupsCore(
  deps: ServiceDeps,
  input: {
    projectId: string;
    type?: string;
    search?: string;
    limit?: number;
  }
) {
  return getGroupList(deps, {
    projectId: input.projectId,
    type: input.type,
    search: input.search,
    take: input.limit ?? FIND_GROUPS_DEFAULT_LIMIT,
  });
}

export async function getGroupCore(
  deps: ServiceDeps,
  input: {
    projectId: string;
    groupId: string;
    memberLimit?: number;
  }
) {
  const [group, members] = await Promise.all([
    getGroupById(deps, input.groupId, input.projectId),
    getGroupMemberProfiles(deps, {
      projectId: input.projectId,
      groupId: input.groupId,
      take: input.memberLimit ?? GROUP_MEMBERS_DEFAULT_LIMIT,
    }),
  ]);

  if (!group) {
    throw new Error(`Group not found: ${input.groupId}`);
  }

  return {
    group,
    member_count: members.count,
    members: members.data,
  };
}

export function createGroupService(
  deps: ServiceDeps,
  _services: () => Services
) {
  return {
    getGroupById: (
      id: string,
      projectId: string
    ): ReturnType<typeof getGroupById> => getGroupById(deps, id, projectId),
    upsertGroup: (input: IServiceUpsertGroup): ReturnType<typeof upsertGroup> =>
      upsertGroup(deps, input),
    getGroupList: (
      options: GetGroupListOptions
    ): ReturnType<typeof getGroupList> => getGroupList(deps, options),
    getGroupListCount: (options: {
      projectId: string;
      type?: string;
      search?: string;
    }): ReturnType<typeof getGroupListCount> =>
      getGroupListCount(deps, options),
    getGroupTypes: (projectId: string): ReturnType<typeof getGroupTypes> =>
      getGroupTypes(deps, projectId),
    createGroup: (input: IServiceUpsertGroup): ReturnType<typeof createGroup> =>
      createGroup(deps, input),
    updateGroup: (
      id: string,
      projectId: string,
      data: {
        type?: string;
        name?: string;
        properties?: Record<string, unknown>;
      }
    ): ReturnType<typeof updateGroup> => updateGroup(deps, id, projectId, data),
    deleteGroup: (
      id: string,
      projectId: string
    ): ReturnType<typeof deleteGroup> => deleteGroup(deps, id, projectId),
    getGroupPropertyKeys: (
      projectId: string
    ): ReturnType<typeof getGroupPropertyKeys> =>
      getGroupPropertyKeys(deps, projectId),
    getGroupStats: (
      projectId: string,
      groupIds: string[]
    ): ReturnType<typeof getGroupStats> =>
      getGroupStats(deps, projectId, groupIds),
    getGroupsByIds: (
      projectId: string,
      ids: string[]
    ): ReturnType<typeof getGroupsByIds> =>
      getGroupsByIds(deps, projectId, ids),
    getGroupMemberProfiles: (
      options: GetGroupMemberProfilesOptions
    ): ReturnType<typeof getGroupMemberProfiles> =>
      getGroupMemberProfiles(deps, options),
    getGroupListPage: (
      input: GetGroupListOptions
    ): ReturnType<typeof getGroupListPage> => getGroupListPage(deps, input),
    getGroupMetrics: (
      id: string,
      projectId: string
    ): ReturnType<typeof getGroupMetrics> =>
      getGroupMetrics(deps, id, projectId),
    getGroupActivity: (
      id: string,
      projectId: string
    ): ReturnType<typeof getGroupActivity> =>
      getGroupActivity(deps, id, projectId),
    getGroupMemberGrowth: (
      id: string,
      projectId: string
    ): ReturnType<typeof getGroupMemberGrowth> =>
      getGroupMemberGrowth(deps, id, projectId),
    getGroupMostEvents: (
      id: string,
      projectId: string
    ): ReturnType<typeof getGroupMostEvents> =>
      getGroupMostEvents(deps, id, projectId),
    getGroupPopularRoutes: (
      id: string,
      projectId: string
    ): ReturnType<typeof getGroupPopularRoutes> =>
      getGroupPopularRoutes(deps, id, projectId),
    getGroupMemberProfilesPage: (
      input: GetGroupMemberProfilesOptions
    ): ReturnType<typeof getGroupMemberProfilesPage> =>
      getGroupMemberProfilesPage(deps, input),
    listGroupTypesCore: (
      projectId: string
    ): ReturnType<typeof listGroupTypesCore> =>
      listGroupTypesCore(deps, projectId),
    findGroupsCore: (
      input: Parameters<typeof findGroupsCore>[1]
    ): ReturnType<typeof findGroupsCore> => findGroupsCore(deps, input),
    getGroupCore: (
      input: Parameters<typeof getGroupCore>[1]
    ): ReturnType<typeof getGroupCore> => getGroupCore(deps, input),
  };
}
