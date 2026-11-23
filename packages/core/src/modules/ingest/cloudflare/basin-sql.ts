// Basin SQL for the report builder's series (advanced analytics, opt-in).
// The same question `ChartAccumulator` answers from a Durable Object, asked
// of the project's Iceberg table instead: for ranges older than the
// Durable Object keeps, or projects too large to scan there. Returns null
// for anything this dialect path does not cover (profile or group fields,
// cohorts, one event per user), so the caller keeps the Durable Object's
// answer. Every value is an escaped literal; every column is whitelisted.

import type { ChartScanQuery } from './chart-scan';
import type { RowFilter } from './filter-eval';

/** Basin SQL returns at most this many rows per query. */
export const BASIN_MAX_ROWS = 10_000;
/** A CASE per bucket: beyond this the series is too fine for one query. */
const MAX_BUCKETS = 750;

const EVENT_COLUMNS = new Set([
  'name',
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
  'profile_id',
  'device_id',
  'session_id',
]);
const NUMERIC_COLUMNS = new Set(['revenue', 'duration']);
const UTM_FIELDS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
]);
const PROPERTY_PREFIX = 'properties.';
const PERCENTILES: Record<string, number> = {
  property_p50: 0.5,
  property_p95: 0.95,
  property_p99: 0.99,
};

export class UnsupportedBasinQuery extends Error {}

export function sqlString(value: unknown): string {
  return `'${String(value ?? '').replaceAll("'", "''")}'`;
}

function at(ms: number): string {
  return `to_timestamp_millis(${Math.trunc(ms)})`;
}

/** A filter or breakdown name as a text expression. */
export function fieldExpression(name: string): string {
  if (EVENT_COLUMNS.has(name)) {
    return name;
  }
  if (NUMERIC_COLUMNS.has(name)) {
    return `CAST(${name} AS VARCHAR)`;
  }
  if (UTM_FIELDS.has(name)) {
    return `json_get_str(properties, ${sqlString(`__query.${name}`)})`;
  }
  if (name === 'has_profile') {
    return "CASE WHEN profile_id <> device_id THEN 'true' ELSE 'false' END";
  }
  if (
    name.startsWith(PROPERTY_PREFIX) &&
    name.length > PROPERTY_PREFIX.length
  ) {
    return `json_get_str(properties, ${sqlString(name.slice(PROPERTY_PREFIX.length))})`;
  }
  throw new UnsupportedBasinQuery(`Field ${name} is not in the events table`);
}

function numericExpression(name: string): string {
  if (NUMERIC_COLUMNS.has(name)) {
    return name;
  }
  return `TRY_CAST(${fieldExpression(name)} AS DOUBLE)`;
}

function escapeLike(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('%', '\\%')
    .replaceAll('_', '\\_');
}

export function filterExpression(filter: RowFilter): string {
  const field = `COALESCE(${fieldExpression(filter.name)}, '')`;
  const values = filter.value
    .filter((value) => value !== null && value !== undefined)
    .map(String);
  const list = values.map(sqlString).join(', ');
  const any = (make: (value: string) => string) =>
    values.length === 0 ? 'FALSE' : `(${values.map(make).join(' OR ')})`;
  switch (filter.operator) {
    case 'is':
      return values.length === 0 ? 'FALSE' : `${field} IN (${list})`;
    case 'isNot':
      return values.length === 0 ? 'TRUE' : `${field} NOT IN (${list})`;
    case 'contains':
      return any(
        (value) => `${field} LIKE ${sqlString(`%${escapeLike(value)}%`)}`
      );
    case 'doesNotContain':
      return `NOT ${any((value) => `${field} LIKE ${sqlString(`%${escapeLike(value)}%`)}`)}`;
    case 'startsWith':
      return any(
        (value) => `${field} LIKE ${sqlString(`${escapeLike(value)}%`)}`
      );
    case 'endsWith':
      return any(
        (value) => `${field} LIKE ${sqlString(`%${escapeLike(value)}`)}`
      );
    case 'regex':
      return any((value) => `regexp_like(${field}, ${sqlString(value)})`);
    case 'isNull':
      return `${field} = ''`;
    case 'isNotNull':
      return `${field} <> ''`;
    case 'gt':
    case 'lt':
    case 'gte':
    case 'lte': {
      const operator = { gt: '>', lt: '<', gte: '>=', lte: '<=' }[
        filter.operator
      ];
      const target = Number(values[0]);
      if (!Number.isFinite(target)) {
        throw new UnsupportedBasinQuery('Comparison needs a number on Basin');
      }
      return `${numericExpression(filter.name)} ${operator} ${target}`;
    }
    default:
      throw new UnsupportedBasinQuery(`Operator ${filter.operator}`);
  }
}

function eventMatch(query: ChartScanQuery): string | null {
  const { event } = query;
  if (event.anyOf?.length) {
    return `(${event.anyOf
      .map((item) =>
        [
          `name = ${sqlString(item.name)}`,
          ...item.filters.map(filterExpression),
        ].join(' AND ')
      )
      .join(' OR ')})`;
  }
  return event.name === '*' ? null : `name = ${sqlString(event.name)}`;
}

function aggregateExpression(query: ChartScanQuery): string {
  const { segment, property } = query.event;
  switch (segment) {
    case 'event':
      return 'count(*)';
    case 'user':
      return 'count(DISTINCT profile_id)';
    case 'session':
      return 'count(DISTINCT session_id)';
    case 'user_average':
      return 'CAST(count(*) AS DOUBLE) / count(DISTINCT profile_id)';
    case 'property_sum':
    case 'property_average':
    case 'property_max':
    case 'property_min': {
      if (!property) {
        throw new UnsupportedBasinQuery('Property segment without a property');
      }
      const fn = {
        property_sum: 'sum',
        property_average: 'avg',
        property_max: 'max',
        property_min: 'min',
      }[segment];
      return `${fn}(${numericExpression(property)})`;
    }
    default: {
      const quantile = PERCENTILES[segment];
      if (quantile !== undefined && property) {
        return `approx_percentile_cont(${numericExpression(property)}, ${quantile})`;
      }
      throw new UnsupportedBasinQuery(`Segment ${segment}`);
    }
  }
}

function bucketExpression(query: ChartScanQuery): string {
  const { buckets } = query;
  if (buckets.length === 1) {
    return '0';
  }
  if (buckets.length > MAX_BUCKETS) {
    throw new UnsupportedBasinQuery('Too many buckets for one query');
  }
  const cases = buckets
    .slice(1)
    .map(
      (bucket, index) => `WHEN created_at < ${at(bucket.start)} THEN ${index}`
    )
    .join(' ');
  return `CASE ${cases} ELSE ${buckets.length - 1} END`;
}

export interface BasinChartSql {
  /** bucket, label_1..n, count */
  series: string;
  /** label_1..n, total (distinct users per breakdown over the range) */
  totals: string;
}

/** The series and totals queries, or throws UnsupportedBasinQuery. */
export function basinChartSql(
  table: string,
  projectId: string,
  query: ChartScanQuery
): BasinChartSql {
  const where = [
    `project_id = ${sqlString(projectId)}`,
    `created_at >= ${at(query.from)}`,
    `created_at <= ${at(query.to)}`,
    eventMatch(query),
    ...query.event.filters.map(filterExpression),
  ].filter(Boolean);
  const isProperty = query.event.segment.startsWith('property_');
  if (isProperty && query.event.property) {
    where.push(`${numericExpression(query.event.property)} IS NOT NULL`);
  }
  const labels = query.breakdowns.map(
    (name) => `COALESCE(${fieldExpression(name)}, '')`
  );
  const labelSelect = labels.map(
    (label, index) => `${label} AS label_${index + 1}`
  );
  const bucket = bucketExpression(query);
  const whereSql = where.join(' AND ');
  // A constant bucket is not grouped on: Basin reads `GROUP BY 0` as a
  // column position.
  const groupKeys = query.buckets.length === 1 ? labels : [bucket, ...labels];
  const series = [
    `SELECT ${[`${bucket} AS bucket`, ...labelSelect, `${aggregateExpression(query)} AS count`].join(', ')}`,
    `FROM ${table}`,
    `WHERE ${whereSql}`,
    groupKeys.length > 0 ? `GROUP BY ${groupKeys.join(', ')}` : '',
    `LIMIT ${BASIN_MAX_ROWS}`,
  ]
    .filter(Boolean)
    .join(' ');
  const totals = [
    `SELECT ${[...labelSelect, 'count(DISTINCT profile_id) AS total'].join(', ')}`,
    `FROM ${table}`,
    `WHERE ${whereSql}`,
    labels.length > 0 ? `GROUP BY ${labels.join(', ')}` : '',
    `LIMIT ${BASIN_MAX_ROWS}`,
  ]
    .filter(Boolean)
    .join(' ');
  return { series, totals };
}

/** Table names come from configuration: `namespace.table`, letters, digits and `_`. */
export function assertTableName(table: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*$/.test(table)) {
    throw new Error(`Invalid Basin table name: ${table}`);
  }
  return table;
}
