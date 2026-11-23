// The event row FlarePanel sends to its Basin Pipelines stream (advanced
// analytics, opt-in). One flat record per event; `created_at` as epoch ms,
// properties as JSON. `BASIN_EVENT_SCHEMA` is the stream's schema file
// (apps/worker/basin/events.schema.json is generated from it and a test
// keeps the two equal).

import type { IClickhouseEvent } from '../../event/event.service';
import { eventTimeMs } from './time-buckets';

const STRING_COLUMNS = [
  'project_id',
  'id',
  'name',
  'device_id',
  'profile_id',
  'session_id',
  'path',
  'origin',
  'referrer',
  'referrer_name',
  'referrer_type',
  'country',
  'city',
  'region',
  'os',
  'os_version',
  'browser',
  'browser_version',
  'device',
  'brand',
  'model',
  'sdk_name',
  'sdk_version',
] as const;

const REQUIRED = new Set(['project_id', 'id', 'name']);

export const BASIN_EVENT_SCHEMA = {
  fields: [
    ...STRING_COLUMNS.map((name) => ({
      name,
      type: 'string',
      required: REQUIRED.has(name),
    })),
    { name: 'created_at', type: 'timestamp', required: true },
    { name: 'duration', type: 'int64', required: false },
    { name: 'revenue', type: 'int64', required: false },
    { name: 'properties', type: 'json', required: false },
    {
      name: 'groups',
      type: 'list',
      required: false,
      items: { type: 'string' },
    },
  ],
};

export type BasinEventRow = Record<string, unknown>;

export function toBasinRow(event: IClickhouseEvent): BasinEventRow {
  const row: BasinEventRow = {};
  for (const column of STRING_COLUMNS) {
    const value = event[column];
    row[column] = value === null || value === undefined ? '' : String(value);
  }
  row.created_at = eventTimeMs(event.created_at);
  row.duration = Math.round(Number(event.duration ?? 0)) || 0;
  row.revenue = Math.round(Number(event.revenue ?? 0)) || 0;
  row.properties = event.properties ?? {};
  row.groups = event.groups ?? [];
  return row;
}
