// The policies we hang on better-auth, run through its real handler against the
// test database: who may register, who must verify their email first, where
// invites are consumed, what stays unmounted.

import { afterAll, afterEach, beforeAll, expect, mock, test } from 'bun:test';
import { testCoreConfig } from '../../../../test/config-fixture';
import { testServiceDeps } from '../../../../test/service-deps';
import type { ServiceDeps } from '../../../services';
import {
  EMAIL_NOT_VERIFIED,
  INVITE_HEADER,
  PASSWORD_RESET_REQUIRED,
} from '../auth.constants';

const sentEmails: { template: string; to: string; url: string }[] = [];
const sendEmail = mock(
  (template: string, options: { to: string; data: { url: string } }) => {
    sentEmails.push({ template, to: options.to, url: options.data.url });
    return Promise.resolve();
  }
);
/** Whether the install has an email transport; read once per auth instance. */
let emailConfigured = true;
const canSendEmail = mock(() => Promise.resolve(emailConfigured));
mock.module('../../../clients/email', () => ({ sendEmail, canSendEmail }));

let createAuth: typeof import('./better-auth').createAuth;
let hashPassword: typeof import('./password').hashPassword;
let constants: typeof import('./better-auth');

const PREFIX = 'ba-test';
/** Creating and migrating the test databases on a fresh runner. */
const BOOTSTRAP_TIMEOUT_MS = 30_000;
const DASHBOARD_URL = 'http://dashboard.test';
const ORG_ID = `${PREFIX}-org`;
const PASSWORD = 'correct horse battery';
const EXISTING_EMAIL = `${PREFIX}-existing@openpanel.test`;
const EXISTING_ID = `${PREFIX}-existing`;
const TWO_FACTOR_EMAIL = `${PREFIX}-2fa@openpanel.test`;
const TWO_FACTOR_ID = `${PREFIX}-2fa`;
/** A password user from before verification existed: never verified. */
const UNVERIFIED_EMAIL = `${PREFIX}-unverified@openpanel.test`;
const UNVERIFIED_ID = `${PREFIX}-unverified`;
/** `PASSWORD` as Clerk exported it: bcrypt `$2a$`. */
const CLERK_BCRYPT_HASH =
  '$2a$04$GTCSUMj3dKSUbyUzA8PLBuNObwhyLwsAqCh1m32rIKhhfbKJd3Hxa';

let deps: ServiceDeps;
let ipCounter = 0;

function authWith(
  auth: Partial<ServiceDeps['config']['auth']> = {},
  logger: ServiceDeps['logger'] = deps.logger
) {
  const config = testCoreConfig({ dashboardUrl: DASHBOARD_URL });
  const instance = createAuth({
    db: deps.db,
    logger,
    coordination: deps.stores.coordination,
    config: {
      ...config,
      auth: {
        ...config.auth,
        secret: 'test-auth-secret-at-least-32-characters',
        trustedOrigins: [DASHBOARD_URL],
        ...auth,
      },
    },
  });
  if (!instance) {
    throw new Error('createAuth returned null with a secret');
  }
  return instance;
}

/** A fresh client IP per call, so better-auth's sign-in limit never trips. */
function call(
  auth: ReturnType<typeof authWith>,
  path: string,
  body: unknown,
  headers: Record<string, string> = {}
): Promise<Response> {
  ipCounter += 1;
  return auth.handler(
    new Request(`http://api.test${constants.AUTH_BASE_PATH}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: DASHBOARD_URL,
        [constants.TRUSTED_IP_HEADER]: `10.0.0.${ipCounter}`,
        ...headers,
      },
      body: JSON.stringify(body),
    })
  );
}

/** A link opened in the browser: a GET with no cookies. */
function open(
  auth: ReturnType<typeof authWith>,
  url: string,
  headers: Record<string, string> = {}
): Promise<Response> {
  ipCounter += 1;
  return auth.handler(
    new Request(url, {
      headers: {
        origin: DASHBOARD_URL,
        [constants.TRUSTED_IP_HEADER]: `10.0.0.${ipCounter}`,
        ...headers,
      },
    })
  );
}

/** The newest verification email sent to `to`. */
function verificationEmail(to: string) {
  return sentEmails.findLast(
    (email) => email.template === 'email-verify' && email.to === to
  );
}

/**
 * What the dashboard's `/verify-email` page does with the emailed link: hand
 * its token to the API.
 */
function verify(auth: ReturnType<typeof authWith>, to: string) {
  const link = new URL(verificationEmail(to)?.url ?? '');
  const token = link.searchParams.get('token') ?? '';
  return open(
    auth,
    `http://api.test${constants.AUTH_BASE_PATH}/verify-email?token=${encodeURIComponent(token)}`
  );
}

function lastLoginCookie(response: Response): string | undefined {
  const header = response.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith('last-auth-provider='));
  return header?.slice('last-auth-provider='.length, header.indexOf(';'));
}

function cookieNames(response: Response): string[] {
  return response.headers
    .getSetCookie()
    .filter((cookie) => !cookie.includes('Max-Age=0'))
    .map((cookie) => cookie.slice(0, cookie.indexOf('=')));
}

async function createInvite(id: string, email: string) {
  await deps.db.invite.create({
    data: {
      id,
      email,
      organizationId: ORG_ID,
      createdById: EXISTING_ID,
      role: 'viewer',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
}

function membership(userId: string) {
  return deps.db.member.findFirst({
    where: { organizationId: ORG_ID, userId },
    select: { role: true },
  });
}

async function cleanUp() {
  await deps.db.organization.deleteMany({ where: { id: ORG_ID } });
  await deps.db.user.deleteMany({
    where: { email: { startsWith: `${PREFIX}-` } },
  });
}

beforeAll(async () => {
  // A fresh CI shard has no test databases until a suite creates them.
  const { bootstrapTestDatabases } = await import(
    '../../../../../../test/bootstrap-databases'
  );
  await bootstrapTestDatabases();
  ({ createAuth } = await import('./better-auth'));
  ({ hashPassword } = await import('./password'));
  constants = await import('./better-auth');
  deps = await testServiceDeps();
  await cleanUp();
  const hash = await hashPassword(PASSWORD);
  for (const [id, email, twoFactorEnabled, emailVerified] of [
    [EXISTING_ID, EXISTING_EMAIL, false, true],
    [TWO_FACTOR_ID, TWO_FACTOR_EMAIL, true, true],
    [UNVERIFIED_ID, UNVERIFIED_EMAIL, false, false],
  ] as const) {
    await deps.db.user.create({
      data: {
        id,
        email,
        name: 'Ada',
        twoFactorEnabled,
        emailVerified,
        accounts: {
          create: { provider: 'credential', accountId: id, password: hash },
        },
      },
    });
  }
  await deps.db.twoFactor.create({
    data: { userId: TWO_FACTOR_ID, secret: 'unused', backupCodes: 'unused' },
  });
  await deps.db.organization.create({
    data: {
      id: ORG_ID,
      name: 'Better auth test',
      createdByUserId: EXISTING_ID,
    },
  });
}, BOOTSTRAP_TIMEOUT_MS);

afterAll(cleanUp);

afterEach(() => {
  emailConfigured = true;
});

test('sign-up creates a credential user with our hash and a joined name', async () => {
  const email = `${PREFIX}-new@openpanel.test`;
  const response = await call(authWith(), '/sign-up/email', {
    email,
    password: PASSWORD,
    name: 'ignored',
    firstName: 'Grace',
    lastName: 'Hopper',
  });

  expect(response.status).toBe(200);
  const user = await deps.db.user.findUniqueOrThrow({
    where: { email },
    include: { accounts: true },
  });
  expect(user.name).toBe('Grace Hopper');
  expect(user.accounts[0]?.provider).toBe('credential');
  expect(user.accounts[0]?.password?.startsWith('$argon2')).toBe(true);
});

test('sign-up sends a verification link to the dashboard and starts no session', async () => {
  const email = `${PREFIX}-verify-new@openpanel.test`;
  sentEmails.length = 0;
  const response = await call(authWith(), '/sign-up/email', {
    email,
    password: PASSWORD,
    name: 'Verify',
  });

  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ token: null });
  expect(cookieNames(response)).not.toContain(constants.AUTH_SESSION_COOKIE);
  const user = await deps.db.user.findUniqueOrThrow({ where: { email } });
  expect(user.emailVerified).toBe(false);
  expect(await deps.db.session.count({ where: { userId: user.id } })).toBe(0);
  const link = new URL(verificationEmail(email)?.url ?? '');
  expect(link.origin + link.pathname).toBe(`${DASHBOARD_URL}/verify-email`);
  expect(link.searchParams.get('token')).toBeTruthy();
});

test('a repeat sign-up answers like a new one and resends the link', async () => {
  const email = `${PREFIX}-verify-repeat@openpanel.test`;
  const auth = authWith();
  await call(auth, '/sign-up/email', { email, password: PASSWORD, name: 'A' });
  sentEmails.length = 0;

  const again = await call(auth, '/sign-up/email', {
    email,
    password: 'another password',
    name: 'B',
  });

  expect(again.status).toBe(200);
  expect(await again.json()).toMatchObject({ token: null });
  expect(verificationEmail(email)).toBeDefined();
  expect(await deps.db.user.count({ where: { email } })).toBe(1);
});

test('the verification link signs the user in and verifies the address', async () => {
  const email = `${PREFIX}-verify-link@openpanel.test`;
  const auth = authWith();
  await call(auth, '/sign-up/email', { email, password: PASSWORD, name: 'L' });

  const response = await verify(auth, email);

  expect(response.status).toBe(200);
  expect(cookieNames(response)).toContain(constants.AUTH_SESSION_COOKIE);
  expect(lastLoginCookie(response)).toBe('email');
  const user = await deps.db.user.findUniqueOrThrow({ where: { email } });
  expect(user.emailVerified).toBe(true);
  const signIn = await call(auth, '/sign-in/email', {
    email,
    password: PASSWORD,
  });
  expect(signIn.status).toBe(200);
});

test('a forged or garbled verification token is refused', async () => {
  const response = await open(
    authWith(),
    `http://api.test${constants.AUTH_BASE_PATH}/verify-email?token=not-a-token`
  );

  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({ code: 'INVALID_TOKEN' });
  expect(cookieNames(response)).not.toContain(constants.AUTH_SESSION_COOKIE);
});

test('an unverified sign-in is refused and sends a fresh link', async () => {
  const auth = authWith();
  sentEmails.length = 0;

  const wrongPassword = await call(auth, '/sign-in/email', {
    email: UNVERIFIED_EMAIL,
    password: 'not the password',
  });
  expect(wrongPassword.status).toBe(401);
  expect(verificationEmail(UNVERIFIED_EMAIL)).toBeUndefined();

  const response = await call(auth, '/sign-in/email', {
    email: UNVERIFIED_EMAIL,
    password: PASSWORD,
  });

  expect(response.status).toBe(403);
  expect(await response.json()).toMatchObject({ code: EMAIL_NOT_VERIFIED });
  expect(cookieNames(response)).not.toContain(constants.AUTH_SESSION_COOKIE);
  expect(verificationEmail(UNVERIFIED_EMAIL)).toBeDefined();
});

test('resending from the dashboard sends a link only to an unverified account', async () => {
  const auth = authWith();
  sentEmails.length = 0;

  for (const email of [UNVERIFIED_EMAIL, EXISTING_EMAIL]) {
    const response = await call(auth, '/send-verification-email', { email });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: true });
  }

  expect(verificationEmail(UNVERIFIED_EMAIL)).toBeDefined();
  expect(verificationEmail(EXISTING_EMAIL)).toBeUndefined();
});

test('resending is limited per caller', async () => {
  const auth = authWith();
  const ip = { [constants.TRUSTED_IP_HEADER]: '10.2.0.1' };
  const statuses: number[] = [];
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await call(
      auth,
      '/send-verification-email',
      { email: `${PREFIX}-nobody@openpanel.test` },
      ip
    );
    statuses.push(response.status);
  }

  expect(statuses).toEqual([200, 200, 200, 429]);
});

test('an install without email signs people straight in and says so once', async () => {
  emailConfigured = false;
  const warn = mock(() => undefined);
  const logger = Object.assign(Object.create(deps.logger), { warn });
  const auth = authWith({}, logger);
  const email = `${PREFIX}-no-email@openpanel.test`;
  sentEmails.length = 0;

  const signUp = await call(auth, '/sign-up/email', {
    email,
    password: PASSWORD,
    name: 'No email',
  });
  const unverified = await call(auth, '/sign-in/email', {
    email: UNVERIFIED_EMAIL,
    password: PASSWORD,
  });

  expect(signUp.status).toBe(200);
  expect(cookieNames(signUp)).toContain(constants.AUTH_SESSION_COOKIE);
  expect(unverified.status).toBe(200);
  expect(cookieNames(unverified)).toContain(constants.AUTH_SESSION_COOKIE);
  expect(sentEmails.filter((sent) => sent.template === 'email-verify')).toEqual(
    []
  );
  // Existing users are not marked verified behind anyone's back.
  const user = await deps.db.user.findUniqueOrThrow({
    where: { id: UNVERIFIED_ID },
  });
  expect(user.emailVerified).toBe(false);
  const warnings = warn.mock.calls.filter((args: unknown[]) =>
    String(args[0]).includes('No email provider')
  );
  expect(warnings).toHaveLength(1);
});

test('sign-up is refused when registration is closed and there is no invite', async () => {
  const email = `${PREFIX}-closed@openpanel.test`;
  const response = await call(
    authWith({ allowRegistration: false }),
    '/sign-up/email',
    { email, password: PASSWORD, name: 'Closed' }
  );

  expect(response.status).toBe(403);
  expect(await response.json()).toMatchObject({
    code: 'REGISTRATION_NOT_ALLOWED',
  });
  expect(await deps.db.user.findUnique({ where: { email } })).toBeNull();
});

test('an invite opens closed registration and is consumed once the new user verifies', async () => {
  const email = `${PREFIX}-invited@openpanel.test`;
  const inviteId = `${PREFIX}-invite-signup`;
  await createInvite(inviteId, email);
  const auth = authWith({ allowRegistration: false, allowInvitation: true });

  const response = await call(
    auth,
    '/sign-up/email',
    { email, password: PASSWORD, name: 'Invited' },
    { [INVITE_HEADER]: inviteId }
  );

  expect(response.status).toBe(200);
  const user = await deps.db.user.findUniqueOrThrow({ where: { email } });
  expect(await membership(user.id)).toBeNull();
  expect(
    await deps.db.invite.findUnique({ where: { id: inviteId } })
  ).not.toBeNull();

  // Opened later, in a browser that never saw the invite.
  const verified = await verify(auth, email);

  expect(verified.status).toBe(200);
  expect(await membership(user.id)).toEqual({ role: 'viewer' });
  expect(
    await deps.db.invite.findUnique({ where: { id: inviteId } })
  ).toBeNull();
  // Taken once: opening the link again joins nothing twice and fails nothing.
  expect((await verify(auth, email)).status).toBe(200);
});

test('without email an invited sign-up joins straight away, as before', async () => {
  emailConfigured = false;
  const email = `${PREFIX}-invited-no-email@openpanel.test`;
  const inviteId = `${PREFIX}-invite-no-email`;
  await createInvite(inviteId, email);

  const response = await call(
    authWith({ allowRegistration: false, allowInvitation: true }),
    '/sign-up/email',
    { email, password: PASSWORD, name: 'Invited' },
    { [INVITE_HEADER]: inviteId }
  );

  expect(response.status).toBe(200);
  expect(cookieNames(response)).toContain(constants.AUTH_SESSION_COOKIE);
  const user = await deps.db.user.findUniqueOrThrow({ where: { email } });
  expect(await membership(user.id)).toEqual({ role: 'viewer' });
});

test('an invite brought to an unverified sign-in waits for the link', async () => {
  const email = `${PREFIX}-unverified-invited@openpanel.test`;
  const inviteId = `${PREFIX}-invite-unverified`;
  const user = await deps.db.user.create({
    data: {
      email,
      name: 'Late',
      accounts: {
        create: {
          provider: 'credential',
          password: await hashPassword(PASSWORD),
        },
      },
    },
  });
  await deps.db.account.updateMany({
    where: { userId: user.id },
    data: { accountId: user.id },
  });
  await createInvite(inviteId, email);
  const auth = authWith();

  const signIn = await call(
    auth,
    '/sign-in/email',
    { email, password: PASSWORD },
    { [INVITE_HEADER]: inviteId }
  );
  expect(signIn.status).toBe(403);
  expect(cookieNames(signIn)).not.toContain('inviteId');
  expect(await membership(user.id)).toBeNull();

  await verify(auth, email);

  expect(await membership(user.id)).toEqual({ role: 'viewer' });
});

test('a sign-up never holds an invite for an account it did not create', async () => {
  const inviteId = `${PREFIX}-invite-squat`;
  await createInvite(inviteId, UNVERIFIED_EMAIL);
  const auth = authWith();

  // Someone else signs up with the unverified user's address and an invite.
  await call(
    auth,
    '/sign-up/email',
    { email: UNVERIFIED_EMAIL, password: 'attacker password', name: 'X' },
    { [INVITE_HEADER]: inviteId }
  );
  await verify(auth, UNVERIFIED_EMAIL);

  expect(await membership(UNVERIFIED_ID)).toBeNull();
  await deps.db.user.update({
    where: { id: UNVERIFIED_ID },
    data: { emailVerified: false },
  });
});

test('signing in with an invite joins the organization', async () => {
  await createInvite(`${PREFIX}-invite-signin`, EXISTING_EMAIL);

  const response = await call(
    authWith(),
    '/sign-in/email',
    { email: EXISTING_EMAIL, password: PASSWORD },
    { [INVITE_HEADER]: `${PREFIX}-invite-signin` }
  );

  expect(response.status).toBe(200);
  expect(await membership(EXISTING_ID)).toEqual({ role: 'viewer' });
});

test('a password with edge whitespace signs in exactly as it was set', async () => {
  const email = `${PREFIX}-spaces@openpanel.test`;
  // Signed in straight after sign-up, as on an install without email.
  emailConfigured = false;
  const auth = authWith();
  await call(auth, '/sign-up/email', {
    email,
    password: '  spaced out  ',
    name: 'Spaces',
  });

  const trimmed = await call(auth, '/sign-in/email', {
    email,
    password: 'spaced out',
  });
  const exact = await call(auth, '/sign-in/email', {
    email,
    password: '  spaced out  ',
  });

  expect(trimmed.status).toBe(401);
  expect(exact.status).toBe(200);
});

test('a Clerk password is refused with a reset prompt until the user resets it', async () => {
  const email = `${PREFIX}-clerk@openpanel.test`;
  // Needs the session sign-up hands out on an install without email.
  emailConfigured = false;
  const auth = authWith();
  const signUp = await call(auth, '/sign-up/email', {
    email,
    password: PASSWORD,
    name: 'Clerk',
  });
  const sessionCookie = signUp.headers
    .getSetCookie()
    .map((cookie) => cookie.slice(0, cookie.indexOf(';')))
    .join('; ');
  await deps.db.account.updateMany({
    where: { user: { email }, provider: 'credential' },
    data: { password: CLERK_BCRYPT_HASH },
  });
  // Recovery codes are only offered once two-factor is on.
  await deps.db.user.update({
    where: { email },
    data: { twoFactorEnabled: true },
  });

  const signIn = await call(auth, '/sign-in/email', {
    email,
    password: PASSWORD,
  });
  expect(signIn.status).toBe(400);
  expect(await signIn.json()).toMatchObject({ code: PASSWORD_RESET_REQUIRED });
  for (const path of [
    '/two-factor/enable',
    '/two-factor/disable',
    '/two-factor/generate-backup-codes',
  ]) {
    const response = await call(
      auth,
      path,
      { password: PASSWORD },
      { cookie: sessionCookie }
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      code: PASSWORD_RESET_REQUIRED,
    });
  }

  sentEmails.length = 0;
  await call(auth, '/request-password-reset', {
    email,
    redirectTo: `${DASHBOARD_URL}/reset-password`,
  });
  const token = new URL(sentEmails[0]?.url ?? '').searchParams.get('token');
  await call(auth, '/reset-password', { token, newPassword: PASSWORD });
  const afterReset = await call(auth, '/sign-in/email', {
    email,
    password: PASSWORD,
  });

  expect(afterReset.status).toBe(200);
});

test('a two-factor sign-in has no session yet and keeps the invite for the second step', async () => {
  await createInvite(`${PREFIX}-invite-2fa`, TWO_FACTOR_EMAIL);

  const response = await call(
    authWith(),
    '/sign-in/email',
    { email: TWO_FACTOR_EMAIL, password: PASSWORD },
    { [INVITE_HEADER]: `${PREFIX}-invite-2fa` }
  );

  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ twoFactorRedirect: true });
  expect(cookieNames(response)).toContain('inviteId');
  expect(cookieNames(response)).not.toContain(constants.AUTH_SESSION_COOKIE);
  expect(await membership(TWO_FACTOR_ID)).toBeNull();
});

test('a reset link goes to the dashboard and its token sets the new password', async () => {
  const auth = authWith();
  sentEmails.length = 0;
  await call(auth, '/request-password-reset', {
    email: EXISTING_EMAIL,
    redirectTo: `${DASHBOARD_URL}/reset-password`,
  });

  expect(sendEmail).toHaveBeenCalled();
  const url = new URL(sentEmails[0]?.url ?? '');
  expect(url.origin + url.pathname).toBe(`${DASHBOARD_URL}/reset-password`);
  const token = url.searchParams.get('token');

  const reset = await call(auth, '/reset-password', {
    token,
    newPassword: 'a brand new password',
  });
  const signIn = await call(auth, '/sign-in/email', {
    email: EXISTING_EMAIL,
    password: 'a brand new password',
  });

  expect(reset.status).toBe(200);
  expect(signIn.status).toBe(200);
});

test('endpoints the dashboard does not use stay unmounted', async () => {
  const auth = authWith();
  for (const path of [
    '/list-sessions',
    '/update-user',
    '/delete-user',
    '/change-email',
  ]) {
    expect((await call(auth, path, {})).status).toBe(404);
  }
});

const GOOGLE = {
  clientId: 'google-client',
  clientSecret: 'google-secret',
  redirectUri: 'http://api.test/oauth/google/callback',
};

function unsignedIdToken(claims: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(claims)}.signature`;
}

/** Stubs Google's token endpoint so the callback sees this profile. */
interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified?: boolean;
}

function stubGoogle({ emailVerified = true, ...profile }: GoogleProfile) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (
    input: Request | string | URL,
    init?: RequestInit
  ) => {
    const url = input instanceof Request ? input.url : String(input);
    if (!url.startsWith('https://oauth2.googleapis.com/token')) {
      return realFetch(input, init);
    }
    return Response.json({
      access_token: 'access',
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: unsignedIdToken({
        ...profile,
        email_verified: emailVerified,
        given_name: 'Ada',
        family_name: 'Lovelace',
        iss: 'https://accounts.google.com',
        aud: GOOGLE.clientId,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    });
  }) as typeof fetch;
  return () => {
    globalThis.fetch = realFetch;
  };
}

/** Starts a Google sign-in, then answers its callback; returns where it lands. */
async function googleSignIn(
  auth: ReturnType<typeof authWith>,
  profile: GoogleProfile,
  additionalData?: Record<string, string>
): Promise<{ location: URL; response: Response }> {
  const start = await call(auth, '/sign-in/social', {
    provider: 'google',
    callbackURL: DASHBOARD_URL,
    errorCallbackURL: `${DASHBOARD_URL}/login`,
    additionalData,
  });
  const { url } = (await start.json()) as { url: string };
  const state = new URL(url).searchParams.get('state') ?? '';
  const cookie = start.headers
    .getSetCookie()
    .map((header) => header.slice(0, header.indexOf(';')))
    .join('; ');
  const restore = stubGoogle(profile);
  try {
    const response = await auth.handler(
      new Request(
        `http://api.test${constants.AUTH_BASE_PATH}/callback/google?code=code&state=${state}`,
        { headers: { cookie, [constants.TRUSTED_IP_HEADER]: '10.1.0.1' } }
      )
    );
    return {
      response,
      location: new URL(response.headers.get('location') ?? '', DASHBOARD_URL),
    };
  } finally {
    restore();
  }
}

test('Google sends the browser to the redirect URI registered at Google', async () => {
  const start = await call(authWith({ google: GOOGLE }), '/sign-in/social', {
    provider: 'google',
    callbackURL: DASHBOARD_URL,
  });
  const { url } = (await start.json()) as { url: string };
  expect(new URL(url).searchParams.get('redirect_uri')).toBe(
    GOOGLE.redirectUri
  );
});

test('a bulk-imported oauth user signing in with Google gets the account linked', async () => {
  const email = `${PREFIX}-imported@openpanel.test`;
  const user = await deps.db.user.create({
    data: {
      email,
      emailVerified: true,
      accounts: { create: { provider: 'oauth' } },
    },
  });

  const { location, response } = await googleSignIn(
    authWith({ google: GOOGLE }),
    {
      sub: 'google-imported',
      email,
    }
  );

  expect(location.toString()).toBe(`${DASHBOARD_URL}/`);
  expect(lastLoginCookie(response)).toBe('google');
  const google = await deps.db.account.findFirst({
    where: { userId: user.id, provider: 'google' },
  });
  expect(google?.accountId).toBe('google-imported');
});

test('an unverified password user is not joined by a Google sign-in with the same email', async () => {
  const { location } = await googleSignIn(authWith({ google: GOOGLE }), {
    sub: 'google-unverified-password',
    email: UNVERIFIED_EMAIL,
  });

  expect(location.pathname).toBe('/login');
  expect(location.searchParams.get('error')).toBe('account_not_linked');
  expect(
    await deps.db.account.count({
      where: { userId: UNVERIFIED_ID, provider: 'google' },
    })
  ).toBe(0);
});

test('a password user who verified their email is joined by Google', async () => {
  const email = `${PREFIX}-verified-password@openpanel.test`;
  const auth = authWith({ google: GOOGLE });
  await call(auth, '/sign-up/email', { email, password: PASSWORD, name: 'V' });
  await verify(auth, email);

  const { location } = await googleSignIn(auth, {
    sub: 'google-verified-password',
    email,
  });

  expect(location.toString()).toBe(`${DASHBOARD_URL}/`);
  const user = await deps.db.user.findUniqueOrThrow({ where: { email } });
  expect(
    await deps.db.account.count({
      where: { userId: user.id, provider: 'google' },
    })
  ).toBe(1);
});

test('a new Google user is refused when registration is closed', async () => {
  const email = `${PREFIX}-google-new@openpanel.test`;
  const { location } = await googleSignIn(
    authWith({ google: GOOGLE, allowRegistration: false }),
    { sub: 'google-new', email }
  );

  expect(location.pathname).toBe('/login');
  expect(location.searchParams.get('error')).toBe('REGISTRATION_NOT_ALLOWED');
  expect(await deps.db.user.findUnique({ where: { email } })).toBeNull();
});

test('a Google sign-up carries its invite through the OAuth state', async () => {
  const email = `${PREFIX}-google-invited@openpanel.test`;
  await createInvite(`${PREFIX}-invite-google`, email);

  const { location, response } = await googleSignIn(
    authWith({ google: GOOGLE, allowRegistration: false }),
    { sub: 'google-invited', email },
    { inviteId: `${PREFIX}-invite-google` }
  );

  expect(location.toString()).toBe(`${DASHBOARD_URL}/`);
  expect(lastLoginCookie(response)).toBe('google');
  const user = await deps.db.user.findUniqueOrThrow({ where: { email } });
  expect(user.firstName).toBe('Ada');
  expect(user.name).toBe('Ada Lovelace');
  expect(await membership(user.id)).toEqual({ role: 'viewer' });
});

test('an unverified Google email does not join the user who owns it', async () => {
  const email = `${PREFIX}-unverified-link@openpanel.test`;
  const user = await deps.db.user.create({
    data: {
      email,
      emailVerified: true,
      accounts: { create: { provider: 'oauth' } },
    },
  });

  const { location } = await googleSignIn(authWith({ google: GOOGLE }), {
    sub: 'google-unverified-link',
    email,
    emailVerified: false,
  });

  expect(location.pathname).toBe('/login');
  expect(location.searchParams.get('error')).toBe('unable_to_get_user_info');
  expect(
    await deps.db.account.count({
      where: { userId: user.id, provider: 'google' },
    })
  ).toBe(0);
});

test('an unverified Google email cannot sign up', async () => {
  const email = `${PREFIX}-unverified-new@openpanel.test`;
  const { location } = await googleSignIn(authWith({ google: GOOGLE }), {
    sub: 'google-unverified-new',
    email,
    emailVerified: false,
  });

  expect(location.searchParams.get('error')).toBe('unable_to_get_user_info');
  expect(await deps.db.user.findUnique({ where: { email } })).toBeNull();
});

test('a provider missing any credential cannot start a sign-in', async () => {
  for (const missing of ['clientId', 'clientSecret', 'redirectUri'] as const) {
    const google = { ...GOOGLE, [missing]: '' };
    const start = await call(authWith({ google }), '/sign-in/social', {
      provider: 'google',
      callbackURL: DASHBOARD_URL,
    });
    expect(start.status).toBe(404);
    expect(cookieNames(start)).toEqual([]);
  }
});

test('GitHub asks only for the scope users already granted', async () => {
  const github = {
    clientId: 'github-client',
    clientSecret: 'github-secret',
    redirectUri: 'http://api.test/oauth/github/callback',
  };
  const start = await call(authWith({ github }), '/sign-in/social', {
    provider: 'github',
    callbackURL: DASHBOARD_URL,
  });
  const { url } = (await start.json()) as { url: string };
  const params = new URL(url).searchParams;
  expect(params.get('scope')).toBe('user:email');
  expect(params.get('redirect_uri')).toBe(github.redirectUri);
});
