/**
 * Workers have no ClickHouse. Reports that still query it (everything the
 * Phase 4 query port has not moved yet) get an empty answer at once instead
 * of waiting on a connection that never opens, so the dashboard shows "no
 * data" rather than spinning until the 30 s request deadline.
 */
import type { AppDeps } from '@flarepanel/core';

const EMPTY_RESULT = {
  data: [],
  meta: [],
  rows: 0,
  statistics: { elapsed: 0, rows_read: 0, bytes_read: 0 },
};

function emptyResultSet() {
  return {
    json: () => Promise.resolve(EMPTY_RESULT),
    text: () => Promise.resolve(''),
    stream: () => {
      throw new Error('ClickHouse streams are not available on Workers');
    },
    close: () => undefined,
    query_id: 'workers-empty',
    response_headers: {},
  };
}

const done = () =>
  Promise.resolve({ query_id: 'workers-empty', response_headers: {} });

export function createEmptyClickHouse(): AppDeps['ch'] {
  return {
    query: () => Promise.resolve(emptyResultSet()),
    insert: () =>
      Promise.resolve({
        executed: false,
        query_id: 'workers-empty',
        response_headers: {},
      }),
    command: done,
    exec: () =>
      Promise.reject(new Error('ClickHouse exec is not available on Workers')),
    ping: () => Promise.resolve({ success: false }),
    close: () => Promise.resolve(),
  } as unknown as AppDeps['ch'];
}
