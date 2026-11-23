// The project's group operations as one Durable Object call (answers are
// JSON text, like the realtime reads: group properties are open-ended).

import type {
  GroupListQuery,
  GroupMembersQuery,
  GroupWrite,
} from './group-store';

export type GroupQuery =
  | { kind: 'get'; id: string }
  | { kind: 'upsert'; group: GroupWrite }
  | { kind: 'remove'; id: string }
  | { kind: 'list'; query: GroupListQuery }
  | { kind: 'count'; query: { search?: string; type?: string } }
  | { kind: 'types' }
  | { kind: 'propertyKeys' }
  | { kind: 'propertyValues'; field: string }
  | { kind: 'byIds'; ids: string[] }
  | { kind: 'members'; query: GroupMembersQuery }
  | { kind: 'stats'; ids: string[] }
  | { kind: 'memberGrowth'; id: string; days: number }
  | { kind: 'summary'; id: string };
