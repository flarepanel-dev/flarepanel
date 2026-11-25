import { describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';
import { stubAppDeps } from '../../test/http-fixtures';
import { errorHandler } from './errors';

const { deps } = stubAppDeps();

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
  test('the raw SyntaxError Workers raise answers 400 too', async () => {
    // On Workers `request.json()` fails unwrapped; this is the same error.
    const workersLike = new Elysia()
      .use(errorHandler(deps, { production: true }))
      .post('/track', () => JSON.parse('{not json'));
    const response = await workersLike.handle(
      new Request('http://localhost/track', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      })
    );
    expect(response.status).toBe(400);
  });

  test('a server-side failure still answers 500', async () => {
    const broken = new Elysia()
      .use(errorHandler(deps, { production: true }))
      .get('/x', () => {
        throw new Error('boom');
      });
    const response = await broken.handle(new Request('http://localhost/x'));
    expect(response.status).toBe(500);
  });
});
