import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { IClickhouseEvent } from '../../event/event.service';
import { BASIN_EVENT_SCHEMA, toBasinRow } from './basin-row';
import {
  assertTableName,
  basinChartSql,
  filterExpression,
  UnsupportedBasinQuery,
} from './basin-sql';
import type { ChartScanQuery } from './chart-scan';

const DAY = 24 * 60 * 60 * 1000;
const FROM = Date.UTC(2026, 7, 1);

function query(extra: Partial<ChartScanQuery> = {}): ChartScanQuery {
  return {
    from: FROM,
    to: FROM + 3 * DAY - 1,
    event: { name: 'signup', filters: [], segment: 'user' },
    breakdowns: [],
    buckets: [0, 1, 2].map((day) => ({
      start: FROM + day * DAY,
      end: FROM + (day + 1) * DAY,
    })),
    timezone: 'UTC',
    ...extra,
  };
}

describe('Basin events table', () => {
  it('keeps the stream schema file in step with the code', () => {
    const file = readFileSync(
      join(
        import.meta.dir,
        '../../../../../../apps/worker/basin/events.schema.json'
      ),
      'utf8'
    );
    expect(JSON.parse(file)).toEqual(BASIN_EVENT_SCHEMA);
  });

  it('turns an event into a flat row with epoch-ms time', () => {
    const row = toBasinRow({
      id: 'e1',
      name: 'purchase',
      project_id: 'p1',
      created_at: '2026-08-01 10:00:00.000',
      properties: { plan: 'pro' },
      revenue: 4900,
      groups: ['g1'],
    } as unknown as IClickhouseEvent);
    expect(row).toMatchObject({
      id: 'e1',
      project_id: 'p1',
      created_at: Date.UTC(2026, 7, 1, 10),
      revenue: 4900,
      path: '',
      properties: { plan: 'pro' },
      groups: ['g1'],
    });
  });
});

describe('Basin chart SQL', () => {
  it('buckets, filters and counts users for one project', () => {
    const { series, totals } = basinChartSql(
      'flarepanel.events',
      "p'1",
      query({
        event: {
          name: 'signup',
          segment: 'user',
          filters: [
            { name: 'properties.plan', operator: 'is', value: ['pro'] },
          ],
        },
        breakdowns: ['country'],
      })
    );
    expect(series).toContain("project_id = 'p''1'");
    expect(series).toContain(`created_at >= to_timestamp_millis(${FROM})`);
    expect(series).toContain("name = 'signup'");
    expect(series).toContain(
      "COALESCE(json_get_str(properties, 'plan'), '') IN ('pro')"
    );
    expect(series).toContain(
      `CASE WHEN created_at < to_timestamp_millis(${FROM + DAY}) THEN 0 WHEN created_at < to_timestamp_millis(${FROM + 2 * DAY}) THEN 1 ELSE 2 END AS bucket`
    );
    expect(series).toContain("COALESCE(country, '') AS label_1");
    expect(series).toContain('count(DISTINCT profile_id) AS count');
    expect(totals).toContain('count(DISTINCT profile_id) AS total');
    expect(totals).toContain("GROUP BY COALESCE(country, '')");
  });

  it('never groups on the constant bucket of a bar or pie chart', () => {
    const single = query({ buckets: [{ start: FROM, end: FROM + 3 * DAY }] });
    expect(
      basinChartSql('flarepanel.events', 'p1', single).series
    ).not.toContain('GROUP BY');
    const byCountry = basinChartSql('flarepanel.events', 'p1', {
      ...single,
      breakdowns: ['country'],
    }).series;
    expect(byCountry).toContain("GROUP BY COALESCE(country, '') LIMIT");
  });

  it('escapes every value and pattern', () => {
    expect(
      filterExpression({
        name: 'path',
        operator: 'contains',
        value: ["50%_off'"],
      })
    ).toBe("(COALESCE(path, '') LIKE '%50\\%\\_off''%')");
    expect(
      filterExpression({ name: 'revenue', operator: 'gte', value: ['100'] })
    ).toBe('revenue >= 100');
    expect(() =>
      filterExpression({ name: 'revenue', operator: 'gt', value: ['1; DROP'] })
    ).toThrow(UnsupportedBasinQuery);
  });

  it('refuses what the events table cannot answer', () => {
    const unsupported = [
      query({ breakdowns: ['profile.email'] }),
      query({
        event: { name: '*', filters: [], segment: 'one_event_per_user' },
      }),
      query({
        event: {
          name: '*',
          segment: 'event',
          filters: [{ name: 'group.name', operator: 'is', value: ['x'] }],
        },
      }),
    ];
    for (const item of unsupported) {
      expect(() => basinChartSql('flarepanel.events', 'p1', item)).toThrow(
        UnsupportedBasinQuery
      );
    }
  });

  it('only accepts plain namespace.table names', () => {
    expect(assertTableName('flarepanel.events')).toBe('flarepanel.events');
    expect(() => assertTableName('events; DROP')).toThrow();
    expect(() => assertTableName('a.b.c')).toThrow();
  });
});
