import { describe, expect, it } from 'bun:test';
import {
  type AdvancedAnalytics,
  AdvancedAnalyticsBudgetError,
} from '../../../event/src/advanced-analytics';
import type { EventStore } from '../../../event/src/event-store';
import { storeSeriesRows } from './store-rows';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 23, 12);
const doRow = { label_0: 'signup', date: '2026-11-22 00:00:00', count: 1 };

function store(partial = false) {
  const calls: unknown[] = [];
  const eventStore = {
    chartRows: (_projectId: string, query: unknown) => {
      calls.push(query);
      return Promise.resolve({ rows: [doRow], partial });
    },
  } as unknown as EventStore;
  return { eventStore, calls };
}

function analytics(result: Record<string, unknown>[] | Error) {
  const queries: string[] = [];
  const port: AdvancedAnalytics = {
    table: 'flarepanel.events',
    hotFrom: () => NOW - 90 * DAY,
    query: <T extends Record<string, unknown>>(sql: string) => {
      queries.push(sql);
      if (result instanceof Error) {
        return Promise.reject(result);
      }
      return Promise.resolve(
        (sql.includes('AS total') ? [{ total: 7 }] : result) as T[]
      );
    },
    usage: () =>
      Promise.resolve({ month: '2026-11', usedBytes: 0, budgetBytes: 1 }),
  };
  return { port, queries };
}

const logger = { error: () => undefined } as never;

function input(startDate: string, endDate: string) {
  return {
    projectId: 'p1',
    startDate,
    endDate,
    interval: 'day' as const,
    timezone: 'UTC',
    chartType: 'linear' as const,
    breakdowns: [],
    event: { name: 'signup', segment: 'user' as const, filters: [] },
  } as never;
}

describe('chart rows: Durable Object first, Basin for history', () => {
  it('answers recent ranges from the Durable Object without Basin', async () => {
    const { eventStore } = store();
    const { port, queries } = analytics([]);
    const rows = await storeSeriesRows(
      { eventStore, advancedAnalytics: port, logger },
      input('2026-11-20 00:00:00', '2026-11-22 23:59:59')
    );
    expect(rows).toEqual([doRow]);
    expect(queries).toHaveLength(0);
  });

  it('asks Basin for ranges older than the Durable Object keeps', async () => {
    const { eventStore, calls } = store();
    const { port, queries } = analytics([{ bucket: 1, count: 5 }]);
    const rows = await storeSeriesRows(
      { eventStore, advancedAnalytics: port, logger },
      input('2026-01-01 00:00:00', '2026-01-03 23:59:59')
    );
    expect(calls).toHaveLength(0);
    expect(queries).toHaveLength(2);
    expect(rows.filter((row) => row.label_0)).toEqual([
      {
        label_0: 'signup',
        date: '2026-01-02 00:00:00',
        count: 5,
        total_count: 7,
      },
    ]);
    expect(rows.filter((row) => !row.label_0)).toHaveLength(3);
  });

  it('keeps the Durable Object rows when the budget is used up', async () => {
    const { eventStore } = store(true);
    const { port } = analytics(new AdvancedAnalyticsBudgetError(2, 1));
    const rows = await storeSeriesRows(
      { eventStore, advancedAnalytics: port, logger },
      input('2026-11-20 00:00:00', '2026-11-22 23:59:59')
    );
    expect(rows).toEqual([doRow]);
  });
});
