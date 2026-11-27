// Only the "is anyone logged in" boundary is exercised here, with no database.

import { expect, test } from 'bun:test';
import { stubHttpCtx } from '../../../test/rpc-fixtures';
import { makeTrpcContext } from '../../rpc/base';
import type { CookieOptions } from '../../shared/cookie';
import { cloudflareAnalyticsRouter } from './cloudflare-analytics.rpc';

const COOKIE_OPTIONS: CookieOptions = {
  domain: '.flarepanel.dev',
  secure: true,
  sameSite: 'lax',
  httpOnly: true,
  path: '/',
};
const EMPTY_SESSION = { session: null, user: null, userId: null };
const ZONE = '0123456789abcdef0123456789abcdef';
const TOKEN = 'cfTestToken_0123456789abcdefWXYZ';

async function anonCaller() {
  const { ctx } = stubHttpCtx({}, EMPTY_SESSION);
  const trpcCtx = await makeTrpcContext(ctx, new Headers(), {
    cookieOptions: COOKIE_OPTIONS,
  });
  return cloudflareAnalyticsRouter.createCaller(trpcCtx);
}

test('every procedure rejects an unauthenticated caller before touching a token', async () => {
  const caller = await anonCaller();
  const UNAUTHORIZED = { code: 'UNAUTHORIZED' };
  await expect(caller.getSetup({ projectId: 'p1' })).rejects.toMatchObject(
    UNAUTHORIZED
  );
  await expect(
    caller.listZones({ projectId: 'p1', token: TOKEN })
  ).rejects.toMatchObject(UNAUTHORIZED);
  await expect(
    caller.connect({
      projectId: 'p1',
      token: TOKEN,
      zoneId: ZONE,
      hostnames: [],
    })
  ).rejects.toMatchObject(UNAUTHORIZED);
  await expect(caller.syncNow({ projectId: 'p1' })).rejects.toMatchObject(
    UNAUTHORIZED
  );
  await expect(caller.disconnect({ projectId: 'p1' })).rejects.toMatchObject(
    UNAUTHORIZED
  );
});
