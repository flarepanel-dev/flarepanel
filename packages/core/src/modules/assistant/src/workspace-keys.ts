/**
 * Bring your own key: a workspace stores its own OpenAI or Anthropic key and
 * every AI feature for that workspace runs on it, so the workspace pays its
 * provider directly.
 *
 * - Hosted (flarepanel.dev): only workspace keys are used for customer AI. A
 *   server key, if one is ever set, never pays for a customer's chat.
 * - Self-hosted: a workspace key overrides the server key for its provider;
 *   without one the server key works as before.
 *
 * Keys are stored encrypted (ENCRYPTION_KEY, AES-256-GCM) in their own table
 * and never leave the API: reads return the provider and the last 4 characters.
 */
import {
  decryptCredential,
  encryptCredential,
} from '@flarepanel/shared/server';
import type { CoreConfig } from '../../../config';
import type { ServiceDeps } from '../../../services';
import type { ChatProvider } from '../assistant.constants';

export const AI_KEY_PROVIDERS = ['openai', 'anthropic'] as const;

export type WorkspaceAiKeys = Record<ChatProvider, string | null>;

export interface WorkspaceAiKeySummary {
  provider: ChatProvider;
  keyHint: string;
  updatedAt: Date;
}

const NO_KEYS: WorkspaceAiKeys = { openai: null, anthropic: null };

const KEY_SHAPE: Record<ChatProvider, RegExp> = {
  openai: /^sk-[A-Za-z0-9_-]{20,}$/,
  anthropic: /^sk-ant-[A-Za-z0-9_-]{20,}$/,
};

const PROVIDER_LABELS: Record<ChatProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
};

export class AiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiKeyError';
  }
}

type Db = Pick<ServiceDeps, 'db'>['db'];

/** The workspace's decrypted keys; a key that no longer decrypts counts as missing. */
export async function getWorkspaceAiKeys(
  deps: Pick<ServiceDeps, 'db' | 'config'>,
  organizationId: string
): Promise<WorkspaceAiKeys> {
  const rows = await deps.db.organizationAiKey.findMany({
    where: { organizationId },
    select: { provider: true, encryptedKey: true },
  });
  const keys: WorkspaceAiKeys = { ...NO_KEYS };
  for (const row of rows) {
    if (!(AI_KEY_PROVIDERS as readonly string[]).includes(row.provider)) {
      continue;
    }
    try {
      keys[row.provider as ChatProvider] = decryptCredential(
        deps.config.encryptionKey,
        row.encryptedKey
      );
    } catch {
      // A rotated ENCRYPTION_KEY: treat as no key so the user adds it again.
    }
  }
  return keys;
}

export async function listWorkspaceAiKeys(
  db: Db,
  organizationId: string
): Promise<WorkspaceAiKeySummary[]> {
  const rows = await db.organizationAiKey.findMany({
    where: { organizationId },
    select: { provider: true, keyHint: true, updatedAt: true },
    orderBy: { provider: 'asc' },
  });
  return rows.filter((row): row is WorkspaceAiKeySummary =>
    (AI_KEY_PROVIDERS as readonly string[]).includes(row.provider)
  );
}

export function hasWorkspaceKey(keys: WorkspaceAiKeys): boolean {
  return Boolean(keys.openai || keys.anthropic);
}

/**
 * The config AI calls for this workspace run with. Hosted drops server keys
 * and their endpoints entirely; a workspace key always talks to the provider's
 * own API (never a server-side gateway or project).
 */
export function aiConfigFor(
  config: CoreConfig,
  keys: WorkspaceAiKeys
): CoreConfig {
  const server = config.selfHosted ? config.ai : null;
  return {
    ...config,
    ai: {
      openai: keys.openai
        ? {
            apiKey: keys.openai,
            baseUrl: undefined,
            project: undefined,
            organization: undefined,
          }
        : (server?.openai ?? {
            apiKey: undefined,
            baseUrl: undefined,
            project: undefined,
            organization: undefined,
          }),
      anthropic: keys.anthropic
        ? {
            apiKey: keys.anthropic,
            baseUrl: undefined,
            authToken: undefined,
            version: config.ai.anthropic.version,
          }
        : (server?.anthropic ?? {
            apiKey: undefined,
            baseUrl: undefined,
            authToken: undefined,
            version: config.ai.anthropic.version,
          }),
    },
  };
}

/** Keys and the config to run AI with, for one workspace. */
export async function resolveWorkspaceAi(
  deps: Pick<ServiceDeps, 'db' | 'config'>,
  organizationId: string
): Promise<{ config: CoreConfig; ownKey: boolean }> {
  const keys = await getWorkspaceAiKeys(deps, organizationId);
  return {
    config: aiConfigFor(deps.config, keys),
    ownKey: hasWorkspaceKey(keys),
  };
}

/** The same, for the workspace that owns a project. */
export async function resolveProjectAi(
  deps: Pick<ServiceDeps, 'db' | 'config'>,
  projectId: string
): Promise<{ config: CoreConfig; ownKey: boolean }> {
  const project = await deps.db.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  });
  if (!project?.organizationId) {
    return { config: aiConfigFor(deps.config, NO_KEYS), ownKey: false };
  }
  return resolveWorkspaceAi(deps, project.organizationId);
}

/** What to tell a user when no AI provider is available to their workspace. */
export function noAiProviderMessage(config: CoreConfig): string {
  return config.selfHosted
    ? 'No AI provider is configured: set OPENAI_API_KEY or ANTHROPIC_API_KEY, or add a key in workspace settings.'
    : 'The assistant runs on your own AI key. Add an OpenAI or Anthropic key in workspace settings to start.';
}

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

/** Asks the provider whether the key works, with a call that costs nothing (list models). */
export async function verifyAiKey(
  provider: ChatProvider,
  apiKey: string,
  fetcher: Fetch = fetch
): Promise<void> {
  const response =
    provider === 'openai'
      ? await fetcher('https://api.openai.com/v1/models?limit=1', {
          headers: { authorization: `Bearer ${apiKey}` },
        })
      : await fetcher('https://api.anthropic.com/v1/models?limit=1', {
          headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        });
  if (response.ok) {
    return;
  }
  if (response.status === 401 || response.status === 403) {
    throw new AiKeyError(
      `${PROVIDER_LABELS[provider]} rejected this key. Check that it is active and copied in full.`
    );
  }
  throw new AiKeyError(
    `Could not check the key with ${PROVIDER_LABELS[provider]} right now (status ${response.status}). Try again in a minute.`
  );
}

/** Checks the key with its provider, then stores it encrypted (replacing an older one). */
export async function saveWorkspaceAiKey(
  deps: Pick<ServiceDeps, 'db' | 'config'>,
  input: {
    organizationId: string;
    provider: ChatProvider;
    apiKey: string;
    userId: string;
  },
  fetcher: Fetch = fetch
): Promise<WorkspaceAiKeySummary> {
  const apiKey = input.apiKey.trim();
  if (!KEY_SHAPE[input.provider].test(apiKey)) {
    throw new AiKeyError(
      input.provider === 'openai'
        ? 'That does not look like an OpenAI key (it starts with "sk-").'
        : 'That does not look like an Anthropic key (it starts with "sk-ant-").'
    );
  }
  if (!deps.config.encryptionKey) {
    throw new AiKeyError(
      'This server has no ENCRYPTION_KEY, so it cannot store keys safely.'
    );
  }
  await verifyAiKey(input.provider, apiKey, fetcher);
  const encryptedKey = encryptCredential(deps.config.encryptionKey, apiKey);
  const keyHint = apiKey.slice(-4);
  const row = await deps.db.organizationAiKey.upsert({
    where: {
      organizationId_provider: {
        organizationId: input.organizationId,
        provider: input.provider,
      },
    },
    create: {
      organizationId: input.organizationId,
      provider: input.provider,
      encryptedKey,
      keyHint,
      createdByUserId: input.userId,
    },
    update: { encryptedKey, keyHint, createdByUserId: input.userId },
    select: { provider: true, keyHint: true, updatedAt: true },
  });
  return row as WorkspaceAiKeySummary;
}

export async function removeWorkspaceAiKey(
  db: Db,
  organizationId: string,
  provider: ChatProvider
): Promise<void> {
  await db.organizationAiKey.deleteMany({
    where: { organizationId, provider },
  });
}
