import { describe, expect, it } from 'bun:test';
import { encryptCredential } from '@flarepanel/shared/server';
import { testCoreConfig } from '../../../test/config-fixture';
import { zAiAnswerSettingsInput } from './ai-answers.constants';
import {
  AiAnswerError,
  addAiAnswerPrompt,
  createAiAnswersService,
  errorText,
  getAiAnswerSetup,
  getAiAnswerSummary,
  removeAiAnswerPrompt,
  runAiAnswerProject,
  saveAiAnswerSettings,
} from './ai-answers.service';
import type { AskAnswer } from './src/ask';

const KEY = 'c'.repeat(64);
const NOW = Date.parse('2026-11-27T05:30:00Z');

type Row = Record<string, unknown>;

/** The tables the service reads and writes, in memory. */
function memoryDb(options: { keys?: Record<string, string> } = {}) {
  const trackers: Row[] = [];
  const prompts: Row[] = [];
  const results: Row[] = [];
  let id = 0;
  const matches = (row: Row, where: Row = {}) =>
    Object.entries(where).every(([field, cond]) => {
      if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
        const c = cond as { gte?: string; lt?: string; in?: string[] };
        const value = row[field] as string;
        return (
          (c.gte === undefined || value >= c.gte) &&
          (c.lt === undefined || value < c.lt) &&
          (c.in === undefined || c.in.includes(value))
        );
      }
      return row[field] === cond;
    });
  const tracker = (projectId: string) =>
    trackers.find((row) => row.projectId === projectId);
  const db = {
    project: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        where.id === 'p'
          ? {
              name: 'FlarePanel',
              domain: 'https://flarepanel.dev',
              cors: [],
              organizationId: 'org',
            }
          : null,
    },
    organizationAiKey: {
      findMany: async () =>
        Object.entries(options.keys ?? {}).map(([provider, key]) => ({
          provider,
          encryptedKey: encryptCredential(KEY, key),
        })),
    },
    aiAnswerTracker: {
      findUnique: async ({ where }: { where: { projectId: string } }) =>
        tracker(where.projectId) ?? null,
      findMany: async ({ where }: { where: Row }) =>
        trackers.filter((row) => matches(row, where)),
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { projectId: string };
        create: Row;
        update: Row;
      }) => {
        const existing = tracker(where.projectId);
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }
        const row = {
          lastRunAt: null,
          lastRunStatus: null,
          lastRunError: null,
          ...create,
        };
        trackers.push(row);
        return row;
      },
      update: async ({
        where,
        data,
      }: {
        where: { projectId: string };
        data: Row;
      }) => Object.assign(tracker(where.projectId) ?? {}, data),
    },
    aiAnswerPrompt: {
      findMany: async ({
        where,
        distinct,
      }: {
        where: Row;
        distinct?: string[];
      }) => {
        const rows = prompts.filter((row) => matches(row, where));
        return distinct
          ? rows.filter(
              (row, index) =>
                rows.findIndex((other) => other.projectId === row.projectId) ===
                index
            )
          : rows;
      },
      create: async ({ data }: { data: Row }) => {
        id += 1;
        const row = { id: `q${id}`, createdAt: new Date(NOW + id), ...data };
        prompts.push(row);
        return row;
      },
      deleteMany: async ({ where }: { where: Row }) => {
        for (let i = prompts.length - 1; i >= 0; i -= 1) {
          if (matches(prompts[i] as Row, where)) {
            prompts.splice(i, 1);
          }
        }
      },
    },
    aiAnswerResult: {
      findMany: async ({ where }: { where: Row }) =>
        results.filter((row) => matches(row, where)),
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { promptId_provider_day: Row };
        create: Row;
        update: Row;
      }) => {
        const existing = results.find((row) =>
          matches(row, where.promptId_provider_day)
        );
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }
        results.push({ ...create });
        return create;
      },
      deleteMany: async ({ where }: { where: Row }) => {
        for (let i = results.length - 1; i >= 0; i -= 1) {
          if (matches(results[i] as Row, where)) {
            results.splice(i, 1);
          }
        }
      },
    },
  };
  return { db, trackers, prompts, results };
}

function deps(memory: ReturnType<typeof memoryDb>, queued: unknown[] = []) {
  return {
    db: memory.db,
    config: testCoreConfig({ encryptionKey: KEY }),
    logger: { child: () => ({ warn: () => undefined }) },
    queues: {
      gsc: {
        aiAnswersProjectRun: {
          add: async (payload: unknown, opts: unknown) => {
            queued.push({ payload, opts });
          },
        },
      },
    },
  } as never;
}

const settings = zAiAnswerSettingsInput.parse({
  projectId: 'p',
  brandNames: ['FlarePanel', ' flarepanel '],
  brandDomains: ['https://www.flarepanel.dev/'],
  competitors: ['Plausible', 'Umami'],
  providers: [],
  enabled: true,
});

describe('settings input', () => {
  it('dedupes names and normalizes domains', () => {
    expect(settings.brandNames).toEqual(['FlarePanel']);
    expect(settings.brandDomains).toEqual(['www.flarepanel.dev']);
  });

  it('needs a brand name', () => {
    expect(
      zAiAnswerSettingsInput.safeParse({ ...settings, brandNames: [' '] })
        .success
    ).toBe(false);
  });
});

describe('ai answers service', () => {
  it('suggests the project name and domain before setup', async () => {
    const memory = memoryDb({
      keys: { openai: 'sk-test-0123456789abcdefghij' },
    });
    const setup = await getAiAnswerSetup(deps(memory), 'p', NOW);
    expect(setup).toMatchObject({
      tracker: null,
      prompts: [],
      keys: { openai: true, anthropic: false },
      defaults: {
        brandNames: ['FlarePanel'],
        brandDomains: ['flarepanel.dev'],
      },
      nextRunNowAt: null,
    });
  });

  it('limits prompts and refuses duplicates; removal is scoped to the project', async () => {
    const memory = memoryDb();
    const d = deps(memory);
    const first = await addAiAnswerPrompt(
      d,
      'p',
      'Best analytics on Cloudflare?'
    );
    await expect(
      addAiAnswerPrompt(d, 'p', ' best analytics on cloudflare? ')
    ).rejects.toBeInstanceOf(AiAnswerError);
    for (let i = 0; i < 9; i += 1) {
      await addAiAnswerPrompt(d, 'p', `prompt ${i}`);
    }
    await expect(addAiAnswerPrompt(d, 'p', 'one more')).rejects.toThrow(
      'up to 10 prompts'
    );
    await removeAiAnswerPrompt(d, 'other', first.id);
    expect(memory.prompts).toHaveLength(10);
    await removeAiAnswerPrompt(d, 'p', first.id);
    expect(memory.prompts).toHaveLength(9);
  });

  it('runs every prompt on every provider with a key and stores one answer a day', async () => {
    const memory = memoryDb({
      keys: {
        openai: 'sk-test-0123456789abcdefghij',
        anthropic: 'sk-ant-test-0123456789abcdefghij',
      },
    });
    const d = deps(memory);
    await saveAiAnswerSettings(d, settings);
    await addAiAnswerPrompt(d, 'p', 'privacy analytics?');
    await addAiAnswerPrompt(d, 'p', 'cloudflare analytics?');

    const calls: string[] = [];
    const ask: AskAnswer = async (provider, prompt) => {
      calls.push(`${provider}:${prompt}`);
      if (provider === 'anthropic' && prompt.startsWith('cloud')) {
        throw new Error('Invalid key sk-ant-secretsecret123');
      }
      return {
        model: `${provider}-model`,
        text: prompt.startsWith('privacy')
          ? 'Plausible, then FlarePanel.'
          : 'Umami is fine.',
        sources: [{ url: 'https://flarepanel.dev/' }],
      };
    };

    const outcome = await runAiAnswerProject(d, 'p', { ask, now: NOW });
    expect(outcome).toEqual({ status: 'partial', answers: 3, failed: 1 });
    expect(calls).toHaveLength(4);
    expect(memory.results).toHaveLength(4);
    expect(memory.trackers[0]).toMatchObject({
      lastRunStatus: 'partial',
      lastRunError: 'Invalid key sk-…',
    });

    // A second run the same day replaces the answers.
    await runAiAnswerProject(d, 'p', { ask, now: NOW + 1000 });
    expect(memory.results).toHaveLength(4);

    const summary = await getAiAnswerSummary(d, 'p', NOW);
    expect(summary.answers).toBe(3);
    expect(summary.mentionRate).toBeCloseTo(2 / 3);
    expect(
      summary.byProvider.find((p) => p.provider === 'openai')
    ).toMatchObject({
      answers: 2,
      mentioned: 1,
      avgPosition: 2,
    });
  });

  it('records a missing key instead of calling anyone', async () => {
    const memory = memoryDb();
    const d = deps(memory);
    await saveAiAnswerSettings(d, settings);
    await addAiAnswerPrompt(d, 'p', 'privacy analytics?');
    const ask: AskAnswer = async () => {
      throw new Error('should not be called');
    };
    const outcome = await runAiAnswerProject(d, 'p', { ask, now: NOW });
    expect(outcome.status).toBe('no_key');
    expect(memory.results).toHaveLength(0);
    expect(memory.trackers[0]?.lastRunStatus).toBe('no_key');
  });

  it('only asks the providers the tracker picked', async () => {
    const memory = memoryDb({
      keys: {
        openai: 'sk-test-0123456789abcdefghij',
        anthropic: 'sk-ant-test-0123456789abcdefghij',
      },
    });
    const d = deps(memory);
    await saveAiAnswerSettings(d, { ...settings, providers: ['anthropic'] });
    await addAiAnswerPrompt(d, 'p', 'privacy analytics?');
    const providers: string[] = [];
    await runAiAnswerProject(d, 'p', {
      now: NOW,
      ask: async (provider) => {
        providers.push(provider);
        return { model: 'm', text: '', sources: [] };
      },
    });
    expect(providers).toEqual(['anthropic']);
  });

  it('queues a run now at most once an hour', async () => {
    const memory = memoryDb({
      keys: { openai: 'sk-test-0123456789abcdefghij' },
    });
    const queued: unknown[] = [];
    const service = createAiAnswersService(
      deps(memory, queued),
      () => ({}) as never
    );
    await expect(service.runNow('p')).rejects.toThrow('Save your brand');
    await saveAiAnswerSettings(deps(memory), settings);
    await expect(service.runNow('p')).rejects.toThrow('Add a prompt');
    await addAiAnswerPrompt(deps(memory), 'p', 'privacy analytics?');
    await service.runNow('p');
    expect(queued).toHaveLength(1);
    expect(memory.trackers[0]?.lastRunStatus).toBe('running');
    await expect(service.runNow('p')).rejects.toThrow('less than an hour ago');
  });

  it('lists enabled projects that have prompts, once each', async () => {
    const memory = memoryDb();
    const d = deps(memory);
    await saveAiAnswerSettings(d, settings);
    await saveAiAnswerSettings(d, {
      ...settings,
      projectId: 'off',
      enabled: false,
    });
    await addAiAnswerPrompt(d, 'p', 'one?');
    await addAiAnswerPrompt(d, 'p', 'two?');
    await addAiAnswerPrompt(d, 'off', 'three?');
    const service = createAiAnswersService(d, () => ({}) as never);
    expect(await service.listProjectsForRun()).toEqual([{ projectId: 'p' }]);
  });

  it('keeps keys out of error text', () => {
    expect(errorText(new Error('bad\n key sk-proj-abcdefghijklmnop'))).toBe(
      'bad key sk-…'
    );
  });
});
