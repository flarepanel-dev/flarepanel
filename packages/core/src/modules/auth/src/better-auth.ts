// Sign-in, sign-up, password reset and two-factor run on better-auth. Legacy
// `session` cookies still resolve (see `http/session.ts`) and are handed
// better-auth's cookie on the way out, until PR 4 drops them.

import type { Session, User } from '@flarepanel/db/src/prisma-client';
import {
  APIError,
  type AuthContext,
  type BetterAuthPlugin,
  betterAuth,
} from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import {
  createAuthMiddleware,
  createEmailVerificationToken,
  getOAuthState,
  isAPIError,
} from 'better-auth/api';
import { parseSetCookieHeader } from 'better-auth/cookies';
import { makeSignature } from 'better-auth/crypto';
import type { OAuth2Tokens } from 'better-auth/oauth2';
import { lastLoginMethod, twoFactor } from 'better-auth/plugins';
import {
  github as githubProvider,
  google as googleProvider,
} from 'better-auth/social-providers';
import { canSendEmail, sendEmail } from '../../../clients/email';
import type { CoreConfig } from '../../../config';
import type { Db, PlatformStores } from '../../../context';
import type { Logger } from '../../../logger';
import type { ISetCookie } from '../../../shared/cookie';
import { connectUserToOrganization } from '../../organization/organization.service';
import {
  EMAIL_NOT_VERIFIED,
  INVITE_HEADER,
  PASSWORD_RESET_REQUIRED,
  VERIFY_EMAIL_PATH,
} from '../auth.constants';
import { cookieOptions } from './constants';
import { isDisposableEmail } from './disposable-email';
import { isOAuthClientConfigured } from './oauth';
import { hashPassword, verifyPasswordHash } from './password';
import { getIsRegistrationAllowed } from './registration';
import { generateSessionToken } from './token';

export const AUTH_BASE_PATH = '/api/auth';
const COOKIE_PREFIX = 'openpanel';
/** `${COOKIE_PREFIX}.session_token`, which is how better-auth names it. */
export const AUTH_SESSION_COOKIE = `${COOKIE_PREFIX}.session_token`;
/** Set by the HTTP mount from the trusted resolver; any incoming value is replaced. */
export const TRUSTED_IP_HEADER = 'x-openpanel-trusted-ip';
/** Holds the invite while a two-factor challenge is pending. */
const INVITE_COOKIE = 'inviteId';
/** Where a session can start, so where an invite is consumed. */
const SIGN_IN_PATHS = [
  '/sign-in/',
  '/sign-up/',
  '/callback/',
  '/two-factor/',
  '/verify-email',
];
/**
 * `pending-invite:<userId>` in the verification table: the invite a password
 * sign-up (or unverified sign-in) brought, held until the address is verified.
 */
const PENDING_INVITE_PREFIX = 'pending-invite:';
const LAST_LOGIN_METHOD_COOKIE = 'last-auth-provider';

const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 30;
const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24 * 15;
const RESET_PASSWORD_TOKEN_SECONDS = 60 * 10;
const TWO_FACTOR_CHALLENGE_SECONDS = 60 * 10;
/** The verification link signs in, so it does not live for long. */
export const EMAIL_VERIFICATION_SECONDS = 60 * 60 * 24;
/** Per address and IP: the dashboard waits a minute between resends anyway. */
const SEND_VERIFICATION_LIMIT = { window: 60, max: 3 };
/** Email sign-ups per IP: five an hour. */
const SIGN_UP_LIMIT = { window: 60 * 60, max: 5 };
const LAST_LOGIN_METHOD_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX = 100;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
/** Accounts imported from Clerk still hold its bcrypt digest. */
const ARGON2_PREFIX = '$argon2';

/** What the dashboard calls. Everything else better-auth mounts answers 404. */
const EXPOSED_PATHS = new Set([
  '/ok',
  '/error',
  '/get-session',
  '/sign-in/email',
  '/sign-in/social',
  '/sign-up/email',
  '/sign-out',
  '/request-password-reset',
  '/reset-password',
  '/send-verification-email',
  '/verify-email',
]);
const EXPOSED_PREFIXES = ['/callback/', '/two-factor/'];

interface AuthDeps {
  db: Db;
  config: CoreConfig;
  logger: Logger;
  /** Rate-limit counters, shared by every API process. */
  coordination: PlatformStores['coordination'];
}

function isExposedPath(path: string): boolean {
  return (
    EXPOSED_PATHS.has(path) ||
    EXPOSED_PREFIXES.some((prefix) => path.startsWith(prefix))
  );
}

const exposedPathsPlugin = {
  id: 'openpanel-exposed-paths',
  onRequest: async (request: Request) => {
    const path = new URL(request.url).pathname.slice(AUTH_BASE_PATH.length);
    if (isExposedPath(path)) {
      return;
    }
    return { response: new Response('Not Found', { status: 404 }) };
  },
} satisfies BetterAuthPlugin;

interface InviteSource {
  headers?: Headers;
  getCookie: (name: string) => string | null | undefined;
}

/** The invite rides a header (email), the OAuth state (social) or a cookie (2FA). */
async function readInviteId(ctx: InviteSource): Promise<string | undefined> {
  const fromHeader = ctx.headers?.get(INVITE_HEADER);
  if (fromHeader) {
    return fromHeader;
  }
  const state = await getOAuthState().catch(() => null);
  const fromState = state?.inviteId;
  if (typeof fromState === 'string' && fromState) {
    return fromState;
  }
  return ctx.getCookie(INVITE_COOKIE) ?? undefined;
}

type InternalAdapter = AuthContext['internalAdapter'];

/**
 * Holds an invite for a user who cannot sign in until their address is
 * verified. Only a session started by their verification link takes it (see
 * `takeHeldInvite`), and it lapses with the invite.
 */
async function holdInvite(
  deps: AuthDeps,
  adapter: InternalAdapter,
  userId: string,
  inviteId: string
): Promise<void> {
  const invite = await deps.db.invite.findUnique({
    where: { id: inviteId },
    select: { expiresAt: true },
  });
  if (!invite || invite.expiresAt < new Date()) {
    return;
  }
  await adapter.createVerificationValue({
    identifier: `${PENDING_INVITE_PREFIX}${userId}`,
    value: inviteId,
    expiresAt: invite.expiresAt,
  });
}

/** Consumed atomically, so two tabs opening the link join once. */
async function takeHeldInvite(
  adapter: InternalAdapter,
  userId: string
): Promise<string | undefined> {
  const held = await adapter.consumeVerificationValue(
    `${PENDING_INVITE_PREFIX}${userId}`
  );
  return held?.value;
}

/** The user a sign-up returned. A repeat sign-up returns a made-up one. */
function returnedUserId(returned: unknown): string | undefined {
  if (!(returned && typeof returned === 'object' && 'user' in returned)) {
    return;
  }
  const { user } = returned as { user?: { id?: unknown } };
  return typeof user?.id === 'string' ? user.id : undefined;
}

function isEmailNotVerified(returned: unknown): boolean {
  return isAPIError(returned) && returned.body?.code === EMAIL_NOT_VERIFIED;
}

interface PendingInviteContext extends InviteSource {
  path?: string;
  body?: unknown;
  context: { returned?: unknown; internalAdapter: InternalAdapter };
  setCookie: (
    name: string,
    value: string,
    options?: ReturnType<typeof cookieOptions> & { maxAge?: number }
  ) => unknown;
}

/** No session yet: keep the invite for the step that will start one. */
async function keepInvite(
  deps: AuthDeps,
  ctx: PendingInviteContext,
  inviteId: string
): Promise<void> {
  const adapter = ctx.context.internalAdapter;
  if (ctx.path === '/sign-up/email') {
    // Waits for the verification link, which may be opened days later or in
    // another browser, so it is held server-side rather than in a cookie.
    const userId = returnedUserId(ctx.context.returned);
    const created =
      userId &&
      (await deps.db.user.findUnique({
        where: { id: userId },
        select: { id: true },
      }));
    if (created) {
      await holdInvite(deps, adapter, created.id, inviteId);
    }
    return;
  }
  if (ctx.path !== '/sign-in/email') {
    return;
  }
  if (isEmailNotVerified(ctx.context.returned)) {
    // The password was right and a new link is on its way; the invite waits
    // for it.
    const { email } = (ctx.body ?? {}) as { email?: unknown };
    const found =
      typeof email === 'string'
        ? await adapter.findUserByEmail(email.toLowerCase())
        : null;
    if (found) {
      await holdInvite(deps, adapter, found.user.id, inviteId);
    }
    return;
  }
  // A password sign-in that now waits for a second factor.
  ctx.setCookie(INVITE_COOKIE, inviteId, {
    ...cookieOptions(deps.config),
    maxAge: TWO_FACTOR_CHALLENGE_SECONDS,
  });
}

function invitePlugin(deps: AuthDeps) {
  return {
    id: 'openpanel-invite',
    hooks: {
      after: [
        {
          matcher: (ctx: { path?: string }) =>
            SIGN_IN_PATHS.some((prefix) => ctx.path?.startsWith(prefix)),
          handler: createAuthMiddleware(async (ctx) => {
            const inviteId = await readInviteId(ctx);
            const signedIn = ctx.context.newSession;
            if (!signedIn) {
              if (inviteId) {
                await keepInvite(deps, ctx, inviteId).catch(
                  (error: unknown) => {
                    deps.logger.error(
                      { err: error, inviteId },
                      'Failed to keep invite for a sign-in that has no session yet'
                    );
                  }
                );
              }
              return;
            }
            const held =
              ctx.path === '/verify-email'
                ? await takeHeldInvite(
                    ctx.context.internalAdapter,
                    signedIn.user.id
                  )
                : undefined;
            for (const id of new Set([inviteId, held])) {
              if (!id) {
                continue;
              }
              // Best effort: an expired invite must not undo the sign-in.
              await connectUserToOrganization(deps, {
                user: signedIn.user,
                inviteId: id,
              }).catch((error: unknown) => {
                deps.logger.error(
                  { err: error, userId: signedIn.user.id, inviteId: id },
                  'Failed to connect user to organization via invite'
                );
              });
            }
            if (ctx.getCookie(INVITE_COOKIE)) {
              ctx.setCookie(INVITE_COOKIE, '', {
                ...cookieOptions(deps.config),
                maxAge: 0,
              });
            }
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
}

async function assertRegistrationAllowed(
  deps: AuthDeps,
  ctx: InviteSource | null
): Promise<void> {
  const inviteId = ctx ? await readInviteId(ctx) : undefined;
  if (!(await getIsRegistrationAllowed(deps, inviteId))) {
    throw new APIError('FORBIDDEN', {
      code: 'REGISTRATION_NOT_ALLOWED',
      message: 'Registrations are not allowed',
    });
  }
}

/**
 * FlarePanel Cloud refuses throwaway inboxes, which would otherwise start a
 * new free trial each. Self-hosted installs decide for themselves.
 */
function assertPermanentEmail(deps: AuthDeps, body: unknown): void {
  if (deps.config.selfHosted) {
    return;
  }
  const { email } = (body ?? {}) as { email?: unknown };
  if (typeof email === 'string' && isDisposableEmail(email)) {
    throw new APIError('BAD_REQUEST', {
      code: 'DISPOSABLE_EMAIL',
      message:
        'Please sign up with a permanent email address. Temporary inboxes are not accepted.',
    });
  }
}

/**
 * A closed install refuses an email sign-up before better-auth looks the
 * address up. Once verification is required, better-auth answers a refusal
 * from the user-create hook with its made-up "check your inbox" user, and the
 * visitor would wait for an email that never comes. The answer is the same
 * for every address, so it reveals no account. The create hook still guards
 * Google and GitHub sign-ups.
 */
function registrationPlugin(deps: AuthDeps) {
  return {
    id: 'openpanel-registration',
    hooks: {
      before: [
        {
          matcher: (ctx: { path?: string }) => ctx.path === '/sign-up/email',
          handler: createAuthMiddleware(async (ctx) => {
            await assertRegistrationAllowed(deps, ctx);
            assertPermanentEmail(deps, ctx.body);
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
}

/**
 * Email verification is required only where an email can arrive: an install
 * without SMTP, Resend or a `send_email` binding keeps signing people straight
 * in, or nobody could ever finish a sign-up. Decided on the first call rather
 * than in `createAuth`, because Workers hand `@flarepanel/email` its sender
 * after the auth instance is built.
 */
function emailVerificationGate(logger: Logger) {
  // The answer, never the promise: on Workers a request must not await a
  // promise that another request created.
  let canSend: boolean | undefined;
  return {
    id: 'openpanel-email-verification',
    hooks: {
      before: [
        {
          matcher: () => true,
          handler: createAuthMiddleware(async (ctx) => {
            if (canSend === undefined) {
              const resolved = await canSendEmail().catch(() => false);
              if (canSend === undefined && !resolved) {
                logger.warn(
                  'No email provider is configured (send_email binding, SMTP_HOST or RESEND_API_KEY); email sign-ups are not verified'
                );
              }
              canSend = resolved;
            }
            const { emailAndPassword, emailVerification } = ctx.context.options;
            if (emailAndPassword) {
              emailAndPassword.requireEmailVerification = canSend;
            }
            if (emailVerification) {
              emailVerification.sendOnSignUp = canSend;
            }
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
}

/** One counter per key, shared by every API process. */
function rateLimitStorage(store: PlatformStores['coordination']) {
  return {
    consume: async (key: string, rule: { window: number; max: number }) => {
      // The window opens on the first hit; the store re-arms a counter without
      // an expiry, so the caller is never locked out for good.
      const { count, ttlMs } = await store.increment(
        `rl:auth:${key}`,
        rule.window * 1000
      );
      if (count <= rule.max) {
        return { allowed: true, retryAfter: null };
      }
      return { allowed: false, retryAfter: Math.ceil(ttlMs / 1000) };
    },
  };
}

interface ProviderUserInfo {
  user: { emailVerified: boolean };
}

/**
 * No user unless the provider verified the email, so nobody signs in or links
 * on an address they never proved they own. better-auth turns `null` into
 * `?error=unable_to_get_user_info`.
 */
function requireVerifiedEmail<T extends ProviderUserInfo>(
  getUserInfo: (token: OAuth2Tokens) => Promise<T | null>
) {
  return async (token: OAuth2Tokens): Promise<T | null> => {
    const info = await getUserInfo(token);
    return info?.user.emailVerified ? info : null;
  };
}

function socialProviders(config: CoreConfig) {
  const { google, github } = config.auth;
  const googleOptions = {
    clientId: google.clientId,
    clientSecret: google.clientSecret,
    // The URI registered at Google; its legacy path forwards here.
    redirectURI: google.redirectUri,
    mapProfileToUser: (profile: {
      given_name?: string;
      family_name?: string;
    }) => ({
      firstName: profile.given_name ?? '',
      lastName: profile.family_name ?? '',
    }),
  };
  const githubOptions = {
    clientId: github.clientId,
    clientSecret: github.clientSecret,
    redirectURI: github.redirectUri,
    // What users already granted: profile reads need no scope, so asking for
    // better-auth's default `read:user` would re-prompt every existing user.
    disableDefaultScope: true,
    scope: ['user:email'],
    mapProfileToUser: (profile: { name?: string | null; login: string }) => ({
      firstName: profile.name || profile.login,
      lastName: '',
    }),
  };
  return {
    ...(isOAuthClientConfigured(google) && {
      google: {
        ...googleOptions,
        getUserInfo: requireVerifiedEmail(
          googleProvider(googleOptions).getUserInfo
        ),
      },
    }),
    ...(isOAuthClientConfigured(github) && {
      github: {
        ...githubOptions,
        getUserInfo: requireVerifiedEmail(
          githubProvider(githubOptions).getUserInfo
        ),
      },
    }),
  };
}

function buildAuth(deps: AuthDeps, secret: string) {
  const { db, config, logger, coordination } = deps;
  // The link opens the dashboard, which calls `/verify-email` itself, as the
  // reset link does; better-auth's own link would land on the API.
  const sendVerificationLink = async (email: string, token: string) => {
    const url = new URL(VERIFY_EMAIL_PATH, config.dashboardUrl);
    url.searchParams.set('token', token);
    await sendEmail('email-verify', {
      to: email,
      data: { url: url.toString() },
    });
  };
  return betterAuth({
    secret,
    basePath: AUTH_BASE_PATH,
    trustedOrigins: config.auth.trustedOrigins,
    database: prismaAdapter(db, { provider: 'sqlite' }),
    telemetry: { enabled: false },
    logger: {
      log: (level, message, ...args) => {
        const log = level === 'error' || level === 'warn' ? level : 'info';
        // The logger serializes an error only under `err`; inside `args` it is `{}`.
        const err = args.find((arg) => arg instanceof Error);
        logger[log]({ err, args }, `better-auth: ${message}`);
      },
    },
    onAPIError: { errorURL: `${config.dashboardUrl}/login` },
    user: {
      additionalFields: {
        firstName: { type: 'string', required: false, input: true },
        lastName: { type: 'string', required: false, input: true },
        deletedAt: { type: 'date', required: false, input: false },
      },
    },
    account: {
      // Our column for the provider's name. `providerId` is the legacy IdP id.
      fields: { providerId: 'provider' },
      // A Google or GitHub sign-in (verified email only, see
      // `requireVerifiedEmail`) joins the user who owns that email if that
      // user is verified too. A password user is verified only by opening
      // their verification link, so an unverified sign-up is never joined.
      accountLinking: { enabled: true },
    },
    session: {
      expiresIn: SESSION_EXPIRES_IN_SECONDS,
      updateAge: SESSION_UPDATE_AGE_SECONDS,
    },
    socialProviders: socialProviders(config),
    emailVerification: {
      // `sendOnSignUp` is switched on with `requireEmailVerification` by
      // `emailVerificationGate`, once the install is known to send email.
      sendOnSignUp: false,
      // An unverified password user gets a fresh link at every refused
      // sign-in, accounts from before verification existed included.
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      expiresIn: EMAIL_VERIFICATION_SECONDS,
      sendVerificationEmail: ({ user, token }) =>
        sendVerificationLink(user.email, token),
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      // A repeat sign-up answers exactly like a new one, so it reveals no
      // account; one still waiting on its link is sent a fresh one.
      onExistingUserSignUp: async ({ user }) => {
        if (user.emailVerified) {
          return;
        }
        const token = await createEmailVerificationToken(
          secret,
          user.email,
          undefined,
          EMAIL_VERIFICATION_SECONDS
        );
        await sendVerificationLink(user.email, token);
      },
      minPasswordLength: MIN_PASSWORD_LENGTH,
      maxPasswordLength: MAX_PASSWORD_LENGTH,
      resetPasswordTokenExpiresIn: RESET_PASSWORD_TOKEN_SECONDS,
      password: {
        hash: hashPassword,
        verify: ({ hash, password }) => {
          if (!hash.startsWith(ARGON2_PREFIX)) {
            throw new APIError('BAD_REQUEST', {
              code: PASSWORD_RESET_REQUIRED,
              message:
                'Your password was set in an older version of FlarePanel and has expired. Reset your password to continue.',
            });
          }
          return verifyPasswordHash(hash, password);
        },
      },
      sendResetPassword: async ({ user, token }) => {
        const url = new URL('/reset-password', config.dashboardUrl);
        url.searchParams.set('token', token);
        await sendEmail('reset-password', {
          to: user.email,
          data: { url: url.toString() },
        });
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user, ctx) => {
            await assertRegistrationAllowed(deps, ctx);
            const name = [user.firstName, user.lastName]
              .filter(Boolean)
              .join(' ')
              .trim();
            return { data: { ...user, name: name || user.name } };
          },
        },
      },
    },
    rateLimit: {
      enabled: true,
      window: RATE_LIMIT_WINDOW_SECONDS,
      max: RATE_LIMIT_MAX,
      customStorage: rateLimitStorage(coordination),
      // Every allowed call sends an email.
      customRules: {
        '/send-verification-email': SEND_VERIFICATION_LIMIT,
        // Each sign-up sends an email and can start a trial.
        '/sign-up/email': SIGN_UP_LIMIT,
      },
    },
    advanced: {
      cookiePrefix: COOKIE_PREFIX,
      // The name stays `openpanel.session_token` on https too; `Secure` comes
      // from the same options as the legacy cookie.
      useSecureCookies: false,
      defaultCookieAttributes: cookieOptions(config),
      ipAddress: { ipAddressHeaders: [TRUSTED_IP_HEADER] },
    },
    plugins: [
      exposedPathsPlugin,
      // First, so every endpoint sees whether verification is required.
      emailVerificationGate(logger),
      registrationPlugin(deps),
      twoFactor({
        issuer: 'FlarePanel',
        twoFactorCookieMaxAge: TWO_FACTOR_CHALLENGE_SECONDS,
      }),
      lastLoginMethod({
        cookieName: LAST_LOGIN_METHOD_COOKIE,
        maxAge: LAST_LOGIN_METHOD_MAX_AGE_SECONDS,
        customResolveMethod: (ctx) =>
          ctx.path.startsWith('/two-factor/') || ctx.path === '/verify-email'
            ? 'email'
            : null,
      }),
      // After `twoFactor`, so a sign-in still waiting for its second factor
      // has no session yet and keeps the invite for later.
      invitePlugin(deps),
    ],
  });
}

export type Auth = ReturnType<typeof buildAuth>;

/** Null without a secret: sessions then resolve through the legacy cookie only. */
export function createAuth(deps: AuthDeps): Auth | null {
  const secret = deps.config.auth.secret;
  if (!secret) {
    deps.logger.warn(
      'AUTH_SECRET and COOKIE_SECRET are unset; sign-in is unavailable and only legacy sessions resolve'
    );
    return null;
  }
  return buildAuth(deps, secret);
}

export interface AuthSessionResult {
  session: Session;
  user: User;
  userId: string;
}

/**
 * Re-sets the cookies better-auth wrote, so a refreshed session's cookie
 * reaches the browser through whichever transport is answering.
 */
function forwardSetCookies(
  config: CoreConfig,
  headers: Headers,
  setCookie: ISetCookie
): void {
  for (const header of headers.getSetCookie()) {
    for (const [name, cookie] of parseSetCookieHeader(header)) {
      setCookie(name, cookie.value, {
        ...cookieOptions(config),
        maxAge: cookie['max-age'],
      });
    }
  }
}

/** The better-auth session in the request's cookies, in our row types. */
export async function getAuthSession(
  auth: Auth,
  config: CoreConfig,
  headers: Headers,
  setCookie: ISetCookie
): Promise<AuthSessionResult | null> {
  if (!headers.get('cookie')?.includes(AUTH_SESSION_COOKIE)) {
    return null;
  }
  const response = await auth.api
    .getSession({ headers, returnHeaders: true })
    .catch((error: unknown) => {
      // A refresh racing a sign-out; anything else is the database.
      if (error instanceof APIError) {
        return null;
      }
      throw error;
    });
  if (!response) {
    return null;
  }
  forwardSetCookies(config, response.headers, setCookie);
  const result = response.response;
  if (!result) {
    return null;
  }
  const { session, user } = result;
  return {
    userId: user.id,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      image: user.image ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      twoFactorEnabled: user.twoFactorEnabled ?? false,
      deletedAt: user.deletedAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    session: {
      id: session.id,
      token: session.token,
      userId: session.userId,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress ?? null,
      userAgent: session.userAgent ?? null,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    },
  };
}

export type PasswordSignInResult =
  | { type: 'signed_in' }
  | { type: 'two_factor' };

/** A server-side email sign-in whose cookies go out through `setCookie`. */
export async function signInWithPassword(
  auth: Auth,
  config: CoreConfig,
  credentials: { email: string; password: string },
  headers: Headers,
  setCookie: ISetCookie
): Promise<PasswordSignInResult> {
  const result = await auth.api.signInEmail({
    body: credentials,
    headers,
    returnHeaders: true,
  });
  forwardSetCookies(config, result.headers, setCookie);
  return 'twoFactorRedirect' in result.response
    ? { type: 'two_factor' }
    : { type: 'signed_in' };
}

/**
 * The token better-auth knows this session by. It is its own random value, never
 * the legacy cookie's: that cookie is unsigned, so storing it would let a
 * database read sign in.
 */
async function claimAuthToken(db: Db, session: Session): Promise<string> {
  if (session.token) {
    return session.token;
  }
  const token = generateSessionToken();
  const claimed = await db.session.updateMany({
    where: { id: session.id, token: null },
    data: { token },
  });
  if (claimed.count > 0) {
    return token;
  }
  // A concurrent request upgraded it first.
  const row = await db.session.findUniqueOrThrow({
    where: { id: session.id },
    select: { token: true },
  });
  return row.token ?? token;
}

/**
 * Gives a legacy session better-auth's cookie on the same row, so the session
 * keeps its id and expiry and signing out either way ends both.
 */
export async function upgradeLegacySession(
  { db, config }: Pick<AuthDeps, 'db' | 'config'>,
  secret: string,
  session: Session,
  setCookie: ISetCookie
): Promise<void> {
  const token = await claimAuthToken(db, session);
  const signature = await makeSignature(token, secret);
  setCookie(AUTH_SESSION_COOKIE, `${token}.${signature}`, {
    ...cookieOptions(config),
    maxAge: Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
  });
}

export function deleteAuthSessionCookie(
  config: CoreConfig,
  setCookie: ISetCookie
): void {
  setCookie(AUTH_SESSION_COOKIE, '', { ...cookieOptions(config), maxAge: 0 });
}
