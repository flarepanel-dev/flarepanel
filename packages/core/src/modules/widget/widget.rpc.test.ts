import { describe, expect, test } from 'bun:test';
import { topByName } from './widget.rpc';

const row = (name: string, pageviews: number, sessions = 0) => ({
  name,
  pageviews,
  sessions,
});

describe('topByName', () => {
  test('merges a path seen on several origins and sorts by the total', () => {
    const rows = [
      row('/', 62),
      row('/pricing', 63),
      row('/', 45),
      row('/docs', 10),
    ];
    expect(topByName(rows, 'pageviews')).toEqual([
      ['/', 107],
      ['/pricing', 63],
      ['/docs', 10],
    ]);
  });

  test('drops empty names and keeps five', () => {
    const rows = [
      row('', 999),
      ...['a', 'b', 'c', 'd', 'e', 'f'].map((name, index) =>
        row(name, 0, 10 - index)
      ),
    ];
    expect(topByName(rows, 'sessions').map(([name]) => name)).toEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
    ]);
  });
});
