/**
 * A minimal 5-field cron matcher (minute hour day-of-month month day-of-week),
 * evaluated in UTC like BullMQ's schedulers. Supports `*`, numbers, ranges
 * (`1-5`), lists (`1,15`) and steps (`*\/15`, `0-30/10`). Enough for every
 * schedule in the registry; anything else throws so a new pattern cannot be
 * silently skipped.
 */

const FIELDS = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'day of month', min: 1, max: 31 },
  { name: 'month', min: 1, max: 12 },
  { name: 'day of week', min: 0, max: 7 },
] as const;

type Field = (typeof FIELDS)[number];

function parseNumber(text: string, field: Field, pattern: string): number {
  const value = Number(text);
  if (!Number.isInteger(value) || value < field.min || value > field.max) {
    throw new Error(`Invalid ${field.name} "${text}" in cron "${pattern}"`);
  }
  return value;
}

function expandField(text: string, field: Field, pattern: string): Set<number> {
  const values = new Set<number>();
  for (const part of text.split(',')) {
    const [range = '', stepText] = part.split('/');
    const step =
      stepText === undefined ? 1 : parseNumber(stepText, field, pattern);
    if (step < 1) {
      throw new Error(`Invalid step in cron "${pattern}"`);
    }
    let from: number;
    let to: number;
    if (range === '*') {
      from = field.min;
      to = field.max;
    } else if (range.includes('-')) {
      const [a = '', b = ''] = range.split('-');
      from = parseNumber(a, field, pattern);
      to = parseNumber(b, field, pattern);
    } else {
      from = parseNumber(range, field, pattern);
      to = stepText === undefined ? from : field.max;
    }
    for (let value = from; value <= to; value += step) {
      values.add(value);
    }
  }
  return values;
}

export interface CronMatcher {
  matches(date: Date): boolean;
}

export function parseCron(pattern: string): CronMatcher {
  const parts = pattern.trim().split(/\s+/);
  if (parts.length !== FIELDS.length) {
    throw new Error(`Cron "${pattern}" must have 5 fields`);
  }
  const [minutes, hours, days, months, weekdays] = FIELDS.map((field, index) =>
    expandField(parts[index] ?? '', field, pattern)
  ) as [Set<number>, Set<number>, Set<number>, Set<number>, Set<number>];
  // 7 is Sunday too.
  if (weekdays.has(7)) {
    weekdays.add(0);
  }
  const dayRestricted = parts[2] !== '*';
  const weekdayRestricted = parts[4] !== '*';

  return {
    matches(date: Date) {
      if (
        !(
          minutes.has(date.getUTCMinutes()) &&
          hours.has(date.getUTCHours()) &&
          months.has(date.getUTCMonth() + 1)
        )
      ) {
        return false;
      }
      const dayMatch = days.has(date.getUTCDate());
      const weekdayMatch = weekdays.has(date.getUTCDay());
      // Standard cron: when both day fields are restricted, either may match.
      if (dayRestricted && weekdayRestricted) {
        return dayMatch || weekdayMatch;
      }
      return dayMatch && weekdayMatch;
    },
  };
}
