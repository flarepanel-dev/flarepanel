import { describe, expect, it } from 'bun:test';
import type { IClickhouseEvent } from '../../event/event.service';
import { JourneyAccumulator, journeyPath } from './journey-scan';

const ORIGIN = 'https://example.com';

function view(session: string, at: number, path: string): IClickhouseEvent {
  return {
    id: `${session}-${at}`,
    name: 'screen_view',
    session_id: session,
    path,
    origin: ORIGIN,
    created_at: new Date(at).toISOString(),
    properties: {},
  } as IClickhouseEvent;
}

describe('user journey', () => {
  it('collapses repeats, cuts to steps and at the first revisit', () => {
    expect(journeyPath(['/', '/', '/a', '/b', '/a', '/c'], 10)).toEqual([
      '/',
      '/a',
      '/b',
    ]);
    expect(journeyPath(['/', '/a', '/b', '/c'], 2)).toEqual(['/', '/a']);
  });

  it('counts entries and transitions from the top entry pages', () => {
    const accumulator = new JourneyAccumulator(
      { from: 0, to: 100, steps: 5, topEntries: 1, filters: [] },
      (event) => ({ ...event })
    );
    const events = [
      view('a', 1, '/'),
      view('a', 2, '/pricing'),
      view('b', 3, '/'),
      view('b', 4, '/pricing'),
      view('b', 5, '/signup'),
      view('c', 6, '/docs'),
      view('c', 7, '/'),
      view('d', 8, '/docs'),
    ];
    for (const event of events) {
      accumulator.add(event, Date.parse(event.created_at));
    }
    expect(accumulator.result()).toEqual({
      topEntries: [{ entry_page: `${ORIGIN}/`, count: 2 }],
      transitions: [
        {
          source: `${ORIGIN}/`,
          target: `${ORIGIN}/pricing`,
          step: 1,
          value: 2,
        },
        {
          source: `${ORIGIN}/pricing`,
          target: `${ORIGIN}/signup`,
          step: 2,
          value: 1,
        },
      ],
    });
  });
});
