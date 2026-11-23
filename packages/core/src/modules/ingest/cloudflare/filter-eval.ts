// Dashboard filters (`IChartEventFilter`) evaluated in JavaScript against one
// stored row, so a Durable Object can filter the events and sessions it
// keeps. Mirrors the ClickHouse compiler's meaning: `is` matches any listed
// value, `isNot` none of them, text operators match any value, comparisons
// use the first value. Cohort filters need the cohort engine and are
// reported as unsupported rather than silently ignored.

export interface RowFilter {
  name: string;
  operator: string;
  value: (string | number | boolean | null)[];
  type?: string;
}

const PROPERTY_PREFIX = 'properties.';
const UNSUPPORTED_OPERATORS = new Set<string>();

/**
 * Cohort membership the project's Durable Object has stored, by cohort id
 * (ids are unique across projects, so objects sharing an isolate do not
 * collide). `inCohort` / `notInCohort` filters carry cohort ids as values
 * and test the row's `profile_id`.
 */
const cohortMembership = new Map<string, (profileId: string) => boolean>();

export function registerCohortMembership(
  cohortId: string,
  has: ((profileId: string) => boolean) | null
): void {
  if (has) {
    cohortMembership.set(cohortId, has);
  } else {
    cohortMembership.delete(cohortId);
  }
}

function inAnyCohort(profileId: string, cohortIds: string[]): boolean {
  return cohortIds.some(
    (cohortId) => cohortMembership.get(cohortId)?.(profileId) ?? false
  );
}
const MAX_REGEX_LENGTH = 500;

export function unsupportedFilters(filters: readonly RowFilter[]): RowFilter[] {
  return filters.filter((filter) => UNSUPPORTED_OPERATORS.has(filter.operator));
}

/** A row's value for a filter name: a column, or `properties.<key>`. */
export function readField(row: Record<string, unknown>, name: string): unknown {
  if (name in row) {
    return row[name];
  }
  if (name.startsWith(PROPERTY_PREFIX)) {
    const properties = row.properties as Record<string, unknown> | undefined;
    return properties?.[name.slice(PROPERTY_PREFIX.length)];
  }
  return undefined;
}

function asText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

function asNumber(value: unknown, type: string | undefined): number {
  if (type === 'date' || type === 'datetime') {
    const text = asText(value);
    return Date.parse(text.includes('T') ? text : `${text.replace(' ', 'T')}Z`);
  }
  return Number(value);
}

const regexCache = new Map<string, RegExp | null>();

function compileRegex(pattern: string): RegExp | null {
  if (!regexCache.has(pattern)) {
    let compiled: RegExp | null = null;
    if (pattern.length <= MAX_REGEX_LENGTH) {
      try {
        compiled = new RegExp(pattern);
      } catch {
        compiled = null;
      }
    }
    regexCache.set(pattern, compiled);
  }
  return regexCache.get(pattern) ?? null;
}

function compare(
  actual: unknown,
  expected: unknown,
  type: string | undefined
): number | null {
  const left = asNumber(actual, type);
  const right = asNumber(expected, type);
  if (Number.isNaN(left) || Number.isNaN(right)) {
    return null;
  }
  return left - right;
}

export function matchesFilter(
  row: Record<string, unknown>,
  filter: RowFilter
): boolean {
  const actual = readField(row, filter.name);
  const text = asText(actual);
  const values = filter.value.filter(
    (value) => value !== null && value !== undefined
  );
  const texts = values.map(asText);
  switch (filter.operator) {
    case 'is':
      return texts.includes(text);
    case 'isNot':
      return !texts.includes(text);
    case 'contains':
      return texts.some((value) => text.includes(value));
    case 'doesNotContain':
      return !texts.some((value) => text.includes(value));
    case 'startsWith':
      return texts.some((value) => text.startsWith(value));
    case 'endsWith':
      return texts.some((value) => text.endsWith(value));
    case 'regex':
      return texts.some((value) => compileRegex(value)?.test(text) ?? false);
    case 'inCohort':
      return inAnyCohort(String(row.profile_id ?? ''), texts);
    case 'notInCohort':
      return !inAnyCohort(String(row.profile_id ?? ''), texts);
    case 'isNull':
      return text === '';
    case 'isNotNull':
      return text !== '';
    case 'gt':
    case 'lt':
    case 'gte':
    case 'lte': {
      const diff = compare(actual, values[0], filter.type);
      if (diff === null || text === '') {
        return false;
      }
      if (filter.operator === 'gt') {
        return diff > 0;
      }
      if (filter.operator === 'lt') {
        return diff < 0;
      }
      return filter.operator === 'gte' ? diff >= 0 : diff <= 0;
    }
    default:
      return false;
  }
}

export function matchesFilters(
  row: Record<string, unknown>,
  filters: readonly RowFilter[] | undefined
): boolean {
  return (filters ?? []).every((filter) => matchesFilter(row, filter));
}
