import { describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';
import { testCoreConfig } from '../../test/config-fixture';
import type { AppDeps } from '../context';
import { errorHandler } from './errors';

const silent = {
  child: () => silent,
  error() {},
  warn() {},
  info() {},
  debug() {},
};
const deps = { config: testCoreConfig(), logger: silent } as unknown as AppDeps;

describe('errorHandler', () => {
  const app = new Elysia()
    .use(errorHandler(deps, { production: true }))
    .post('/track', ({ body }) => body);

  test('a body that is not JSON answers 400, not 500', async () => {
    const response = await app.handle(
      new Request('http://localhost/track', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{not json',
      })
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      status: 400,
      error: 'Error',
      message: 'body Invalid JSON',
    });
  });
});
