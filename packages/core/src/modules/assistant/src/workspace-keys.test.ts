import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { testCoreConfig } from '../../../../test/config-fixture';
import { chatLimitsFor } from './limits';
import { configuredProviders } from './providers';
import {
  AiKeyError,
  aiConfigFor,
  getWorkspaceAiKeys,
  saveWorkspaceAiKey,
  verifyAiKey,
} from './workspace-keys';

const ENCRYPTION_KEY = 'a'.repeat(64);
const OPENAI_KEY = 'sk-proj-abcdefghijklmnopqrstuvwxyz1234';
const ANTHROPIC_KEY = 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz9876';

function serverConfig(selfHosted: boolean) {
  const base = testCoreConfig({ selfHosted, encryptionKey: ENCRYPTION_KEY });
  return {
    ...base,
    ai: {
      openai: {
        apiKey: 'sk-server-key',
        baseUrl: 'https://gateway.example',
        project: 'proj',
        organization: 'org',
      },
      anthropic: {
        apiKey: undefined,
        baseUrl: undefined,
        authToken: undefined,
        version: undefined,
      },
    },
  };
}

/** An in-memory organization_ai_keys table. */
function memoryDb() {
  const rows: Record<string, unknown>[] = [];
  return {
    rows,
    db: {
      organizationAiKey: {
        findMany: async ({ where }: { where: { organizationId: string } }) =>
          rows.filter((row) => row.organizationId === where.organizationId),
        upsert: async ({
          where,
          create,
          update,
        }: {
          where: {
            organizationId_provider: {
              organizationId: string;
              provider: string;
            };
          };
          create: Record<string, unknown>;
          update: Record<string, unknown>;
        }) => {
          const key = where.organizationId_provider;
          const existing = rows.find(
            (row) =>
              row.organizationId === key.organizationId &&
              row.provider === key.provider
          );
          if (existing) {
            Object.assign(existing, update, { updatedAt: new Date() });
            return existing;
          }
          const row = { ...create, updatedAt: new Date() };
          rows.push(row);
          return row;
        },
      },
    },
  };
}

const ok = async () => new Response('{}', { status: 200 });

describe('bring your own AI key', () => {
  it('hosted runs only on the workspace key, never the server key or gateway', () => {
    const hosted = serverConfig(false);
    const none = aiConfigFor(hosted, { openai: null, anthropic: null });
    expect(configuredProviders(none)).toEqual({
      openai: false,
      anthropic: false,
    });

    const own = aiConfigFor(hosted, { openai: OPENAI_KEY, anthropic: null });
    expect(own.ai.openai).toEqual({
      apiKey: OPENAI_KEY,
      baseUrl: undefined,
      project: undefined,
      organization: undefined,
    });
  });

  it('self-hosted keeps the server key unless the workspace brings its own', () => {
    const selfHosted = serverConfig(true);
    const none = aiConfigFor(selfHosted, { openai: null, anthropic: null });
    expect(none.ai.openai.apiKey).toBe('sk-server-key');
    const own = aiConfigFor(selfHosted, {
      openai: null,
      anthropic: ANTHROPIC_KEY,
    });
    expect(own.ai.anthropic.apiKey).toBe(ANTHROPIC_KEY);
    expect(own.ai.openai.apiKey).toBe('sk-server-key');
  });

  it('stores the key encrypted and reads it back', async () => {
    const { db, rows } = memoryDb();
    const deps = { db, config: serverConfig(false) } as never;
    const saved = await saveWorkspaceAiKey(
      deps,
      {
        organizationId: 'o1',
        provider: 'openai',
        apiKey: ` ${OPENAI_KEY} `,
        userId: 'u1',
      },
      ok
    );
    expect(saved.keyHint).toBe('1234');
    expect(String(rows[0]?.encryptedKey)).toStartWith('enc:');
    expect(String(rows[0]?.encryptedKey)).not.toContain(OPENAI_KEY);
    expect(await getWorkspaceAiKeys(deps, 'o1')).toEqual({
      openai: OPENAI_KEY,
      anthropic: null,
    });
    expect(await getWorkspaceAiKeys(deps, 'o2')).toEqual({
      openai: null,
      anthropic: null,
    });
  });

  it('refuses keys of the wrong shape before calling the provider', async () => {
    const { db } = memoryDb();
    let calls = 0;
    const counting = async () => {
      calls++;
      return new Response('{}');
    };
    await expect(
      saveWorkspaceAiKey(
        { db, config: serverConfig(false) } as never,
        {
          organizationId: 'o1',
          provider: 'anthropic',
          apiKey: OPENAI_KEY,
          userId: 'u1',
        },
        counting
      )
    ).rejects.toBeInstanceOf(AiKeyError);
    expect(calls).toBe(0);
  });

  it('reports a key the provider rejects, and a provider outage, differently', async () => {
    await expect(
      verifyAiKey(
        'openai',
        OPENAI_KEY,
        async () => new Response('', { status: 401 })
      )
    ).rejects.toThrow('rejected this key');
    await expect(
      verifyAiKey(
        'anthropic',
        ANTHROPIC_KEY,
        async () => new Response('', { status: 529 })
      )
    ).rejects.toThrow('status 529');
  });

  it('sends each provider its own auth header', async () => {
    const seen: { url: string; headers: RequestInit['headers'] }[] = [];
    const capture = async (url: string, init?: RequestInit) => {
      seen.push({ url, headers: init?.headers });
      return new Response('{}');
    };
    await verifyAiKey('openai', OPENAI_KEY, capture);
    await verifyAiKey('anthropic', ANTHROPIC_KEY, capture);
    expect(seen[0]?.url).toStartWith('https://api.openai.com/');
    expect(seen[0]?.headers).toEqual({ authorization: `Bearer ${OPENAI_KEY}` });
    expect(seen[1]?.url).toStartWith('https://api.anthropic.com/');
    expect(seen[1]?.headers).toMatchObject({ 'x-api-key': ANTHROPIC_KEY });
  });

  // The test preload pins SELF_HOSTED=true; billing states need it off.
  let selfHostedEnv: string | undefined;
  beforeAll(() => {
    selfHostedEnv = process.env.SELF_HOSTED;
    process.env.SELF_HOSTED = 'false';
  });
  afterAll(() => {
    process.env.SELF_HOSTED = selfHostedEnv;
  });

  it('an own key lifts the daily and monthly caps but not an unpaid block', () => {
    const paying = {
      subscriptionStatus: 'active',
      subscriptionEndsAt: null,
      subscriptionCanceledAt: null,
      subscriptionResumesAt: null,
      subscriptionPeriodEventsLimit: 100_000,
      subscriptionProductId: 'p',
      subscriptionId: 's',
      subscriptionPauseAtPeriodEnd: false,
      subscriptionInterval: 'month',
      subscriptionStartsAt: new Date(),
    } as never;
    expect(chatLimitsFor(paying, false, false).budgetMicros).not.toBeNull();
    expect(chatLimitsFor(paying, false, true)).toEqual({
      tier: 'unlimited',
      budgetMicros: null,
    });
    const canceled = {
      ...(paying as object),
      subscriptionStatus: 'canceled',
    } as never;
    expect(chatLimitsFor(canceled, false, true).tier).toBe('blocked');
  });
});
