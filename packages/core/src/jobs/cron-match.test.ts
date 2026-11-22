import { describe, expect, test } from 'bun:test';
import { CRON_SCHEDULES } from '../jobs.registry';
import { parseCron } from './cron-match';

const at = (iso: string) => new Date(iso);

describe('parseCron', () => {
  test('fixed minute and hour', () => {
    const cron = parseCron('30 4 * * *');
    expect(cron.matches(at('2026-11-22T04:30:00Z'))).toBe(true);
    expect(cron.matches(at('2026-11-22T04:31:00Z'))).toBe(false);
    expect(cron.matches(at('2026-11-22T05:30:00Z'))).toBe(false);
  });

  test('steps and wildcards', () => {
    const cron = parseCron('*/30 * * * *');
    expect(cron.matches(at('2026-11-22T10:00:00Z'))).toBe(true);
    expect(cron.matches(at('2026-11-22T10:30:00Z'))).toBe(true);
    expect(cron.matches(at('2026-11-22T10:15:00Z'))).toBe(false);
  });

  test('day of week, with 0 and 7 both Sunday', () => {
    const monday = parseCron('0 8 * * 1');
    expect(monday.matches(at('2026-11-23T08:00:00Z'))).toBe(true);
    expect(monday.matches(at('2026-11-22T08:00:00Z'))).toBe(false);
    expect(parseCron('0 0 * * 7').matches(at('2026-11-22T00:00:00Z'))).toBe(
      true
    );
  });

  test('ranges and lists', () => {
    const cron = parseCron('0,15 9-17 * * 1-5');
    expect(cron.matches(at('2026-11-23T09:15:00Z'))).toBe(true);
    expect(cron.matches(at('2026-11-23T18:00:00Z'))).toBe(false);
    expect(cron.matches(at('2026-11-22T09:15:00Z'))).toBe(false);
  });

  test('day of month or day of week when both are restricted', () => {
    const cron = parseCron('0 0 1 * 1');
    expect(cron.matches(at('2026-12-01T00:00:00Z'))).toBe(true);
    expect(cron.matches(at('2026-11-23T00:00:00Z'))).toBe(true);
    expect(cron.matches(at('2026-11-24T00:00:00Z'))).toBe(false);
  });

  test('rejects what it does not understand', () => {
    expect(() => parseCron('* * * *')).toThrow();
    expect(() => parseCron('61 * * * *')).toThrow();
    expect(() => parseCron('@daily')).toThrow();
  });

  test('understands every pattern in the registry', () => {
    for (const { schedule } of CRON_SCHEDULES) {
      if ('pattern' in schedule) {
        expect(() => parseCron(schedule.pattern)).not.toThrow();
      }
    }
  });
});
