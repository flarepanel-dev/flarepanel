// AI answer visibility: the project's brand, competitors and prompts, the
// daily run that asks each prompt to each provider on the workspace's own AI
// key, and the summary the dashboard reads.

import type { Logger } from '../../logger';
import type { ServiceDeps, Services } from '../../services';
import {
  aiConfigFor,
  getWorkspaceAiKeys,
} from '../assistant/src/workspace-keys';
import { projectHostnames } from '../cloudflare-analytics/cloudflare-analytics.service';
import {
  AI_ANSWER_PROMPTS_MAX,
  AI_ANSWER_PROVIDERS,
  AI_ANSWER_RETENTION_DAYS,
  AI_ANSWER_RUN_NOW_GAP_MS,
  AI_ANSWER_SUMMARY_DAYS,
  type AiAnswerProvider,
  type AiAnswerRunStatus,
  type AiAnswerSettingsInput,
  type IAiAnswerPrompt,
  type IAiAnswerSetup,
  type IAiAnswerSummary,
  type IAiAnswerTracker,
} from './ai-answers.constants';
import { analyzeAnswer } from './src/analyze';
import { type AskAnswer, createAskAnswer } from './src/ask';
import { type StoredAnswer, summarizeAnswers, utcDay } from './src/summary';

const DAY_MS = 24 * 60 * 60 * 1000;
const ERROR_MAX_LENGTH = 300;
/** Calls in flight at once during a run. */
const RUN_CONCURRENCY = 3;

/** A problem the person can fix; shown to them as is. */
export class AiAnswerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiAnswerError';
  }
}

type Deps = Pick<ServiceDeps, 'db' | 'config' | 'logger' | 'queues'>;

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function providers(value: unknown): AiAnswerProvider[] {
  return strings(value).filter((p): p is AiAnswerProvider =>
    (AI_ANSWER_PROVIDERS as readonly string[]).includes(p)
  );
}

interface TrackerRow {
  brandNames: unknown;
  brandDomains: unknown;
  competitors: unknown;
  providers: unknown;
  enabled: boolean;
  lastRunAt: Date | null;
  lastRunStatus: string | null;
  lastRunError: string | null;
}

function trackerView(row: TrackerRow): IAiAnswerTracker {
  return {
    brandNames: strings(row.brandNames),
    brandDomains: strings(row.brandDomains),
    competitors: strings(row.competitors),
    providers: providers(row.providers),
    enabled: row.enabled,
    lastRunAt: row.lastRunAt,
    lastRunStatus: row.lastRunStatus as AiAnswerRunStatus | null,
    lastRunError: row.lastRunError,
  };
}

/** Short, single-line, and without anything that looks like a key. */
export function errorText(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  const clean = text
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, 'sk-…')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, ERROR_MAX_LENGTH);
  return clean || 'The AI provider returned an error without a message.';
}

async function workspaceKeys(
  deps: Deps,
  projectId: string
): Promise<Record<AiAnswerProvider, boolean>> {
  const project = await deps.db.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  });
  if (!project?.organizationId) {
    return { openai: false, anthropic: false };
  }
  const keys = await getWorkspaceAiKeys(deps, project.organizationId);
  const server = deps.config.selfHosted ? deps.config.ai : null;
  return {
    openai: Boolean(keys.openai ?? server?.openai.apiKey),
    anthropic: Boolean(keys.anthropic ?? server?.anthropic.apiKey),
  };
}

function nextRunNowAt(lastRunAt: Date | null, now: number): Date | null {
  if (!lastRunAt) {
    return null;
  }
  const next = lastRunAt.getTime() + AI_ANSWER_RUN_NOW_GAP_MS;
  return next > now ? new Date(next) : null;
}

export async function getAiAnswerSetup(
  deps: Deps,
  projectId: string,
  now = Date.now()
): Promise<IAiAnswerSetup> {
  const [project, tracker, prompts, keys] = await Promise.all([
    deps.db.project.findUnique({
      where: { id: projectId },
      select: { name: true, domain: true, cors: true },
    }),
    deps.db.aiAnswerTracker.findUnique({ where: { projectId } }),
    deps.db.aiAnswerPrompt.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, prompt: true, createdAt: true },
    }),
    workspaceKeys(deps, projectId),
  ]);
  const domains = project ? projectHostnames(project) : [];
  return {
    tracker: tracker ? trackerView(tracker) : null,
    prompts,
    keys,
    defaults: {
      brandNames: project?.name ? [project.name] : [],
      brandDomains: domains.filter((host) => !host.startsWith('www.')),
    },
    nextRunNowAt: nextRunNowAt(tracker?.lastRunAt ?? null, now),
  };
}

export async function saveAiAnswerSettings(
  deps: Deps,
  input: AiAnswerSettingsInput
): Promise<IAiAnswerTracker> {
  const { projectId, ...data } = input;
  const row = await deps.db.aiAnswerTracker.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
  return trackerView(row);
}

export async function addAiAnswerPrompt(
  deps: Deps,
  projectId: string,
  prompt: string
): Promise<IAiAnswerPrompt> {
  const existing = await deps.db.aiAnswerPrompt.findMany({
    where: { projectId },
    select: { prompt: true },
  });
  if (existing.length >= AI_ANSWER_PROMPTS_MAX) {
    throw new AiAnswerError(
      `A project tracks up to ${AI_ANSWER_PROMPTS_MAX} prompts. Remove one first.`
    );
  }
  const key = prompt.trim().toLowerCase();
  if (existing.some((row) => row.prompt.trim().toLowerCase() === key)) {
    throw new AiAnswerError('This prompt is already tracked.');
  }
  return deps.db.aiAnswerPrompt.create({
    data: { projectId, prompt: prompt.trim() },
    select: { id: true, prompt: true, createdAt: true },
  });
}

export async function removeAiAnswerPrompt(
  deps: Deps,
  projectId: string,
  promptId: string
): Promise<void> {
  // Scoped by project: an id from another project removes nothing.
  await deps.db.aiAnswerPrompt.deleteMany({
    where: { id: promptId, projectId },
  });
}

export async function getAiAnswerSummary(
  deps: Deps,
  projectId: string,
  now = Date.now()
): Promise<IAiAnswerSummary> {
  const days = AI_ANSWER_SUMMARY_DAYS;
  const since = utcDay(now - (days - 1) * DAY_MS);
  const [tracker, prompts, rows] = await Promise.all([
    deps.db.aiAnswerTracker.findUnique({ where: { projectId } }),
    deps.db.aiAnswerPrompt.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, prompt: true, createdAt: true },
    }),
    deps.db.aiAnswerResult.findMany({
      where: { projectId, day: { gte: since } },
      orderBy: { day: 'asc' },
    }),
  ]);
  const view = tracker ? trackerView(tracker) : null;
  return summarizeAnswers({
    rows: rows.map(
      (row): StoredAnswer => ({
        promptId: row.promptId,
        provider: row.provider as AiAnswerProvider,
        model: row.model,
        day: row.day,
        mentioned: row.mentioned,
        position: row.position,
        ownCited: row.ownCited,
        citations: strings(row.citations),
        competitors: strings(row.competitors),
        excerpt: row.excerpt,
        error: row.error,
      })
    ),
    prompts,
    brandNames: view?.brandNames ?? [],
    brandDomains: view?.brandDomains ?? [],
    competitors: view?.competitors ?? [],
    days,
    now,
  });
}

export async function listAiAnswerProjectsForRun(
  deps: Pick<Deps, 'db'>
): Promise<{ projectId: string }[]> {
  const trackers = await deps.db.aiAnswerTracker.findMany({
    where: { enabled: true },
    select: { projectId: true },
  });
  if (trackers.length === 0) {
    return [];
  }
  const withPrompts = await deps.db.aiAnswerPrompt.findMany({
    where: { projectId: { in: trackers.map((t) => t.projectId) } },
    select: { projectId: true },
    distinct: ['projectId'],
  });
  return withPrompts.map(({ projectId }) => ({ projectId }));
}

async function inBatches<T>(
  items: readonly T[],
  size: number,
  run: (item: T) => Promise<void>
): Promise<void> {
  for (let index = 0; index < items.length; index += size) {
    await Promise.all(items.slice(index, index + size).map(run));
  }
}

export interface AiAnswerRunOutcome {
  status: AiAnswerRunStatus;
  answers: number;
  failed: number;
}

/**
 * Asks every prompt to every chosen provider once and stores today's answer
 * for each, replacing an earlier one from the same day. Never retried: each
 * call is billed to the workspace's key.
 */
export async function runAiAnswerProject(
  deps: Deps,
  projectId: string,
  options: { ask?: AskAnswer; now?: number; logger?: Logger } = {}
): Promise<AiAnswerRunOutcome> {
  const now = options.now ?? Date.now();
  const tracker = await deps.db.aiAnswerTracker.findUnique({
    where: { projectId },
  });
  if (!tracker) {
    return { status: 'error', answers: 0, failed: 0 };
  }
  const view = trackerView(tracker);
  const prompts = await deps.db.aiAnswerPrompt.findMany({
    where: { projectId },
    select: { id: true, prompt: true },
  });
  const finish = async (
    status: AiAnswerRunStatus,
    error: string | null
  ): Promise<void> => {
    await deps.db.aiAnswerTracker.update({
      where: { projectId },
      data: {
        lastRunAt: new Date(now),
        lastRunStatus: status,
        lastRunError: error,
      },
    });
  };
  if (prompts.length === 0) {
    return { status: 'success', answers: 0, failed: 0 };
  }

  const project = await deps.db.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  });
  const keys = project?.organizationId
    ? await getWorkspaceAiKeys(deps, project.organizationId)
    : { openai: null, anthropic: null };
  const config = aiConfigFor(deps.config, keys);
  const available = AI_ANSWER_PROVIDERS.filter((provider) =>
    Boolean(config.ai[provider].apiKey)
  );
  const chosen = view.providers.length > 0 ? view.providers : available;
  const run = chosen.filter((provider) => available.includes(provider));
  if (run.length === 0) {
    await finish(
      'no_key',
      'Add an OpenAI or Anthropic key in workspace settings: answers run on your own key.'
    );
    return { status: 'no_key', answers: 0, failed: 0 };
  }

  const ask = options.ask ?? createAskAnswer(config);
  const day = utcDay(now);
  const target = {
    brandNames: view.brandNames,
    brandDomains: view.brandDomains,
    competitors: view.competitors,
  };
  const jobs = prompts.flatMap((prompt) =>
    run.map((provider) => ({ prompt, provider }))
  );
  let answers = 0;
  let failed = 0;
  let firstError: string | null = null;

  await inBatches(jobs, RUN_CONCURRENCY, async ({ prompt, provider }) => {
    let data: {
      model: string;
      mentioned: boolean;
      position: number | null;
      ownCited: boolean;
      citations: string[];
      competitors: string[];
      excerpt: string;
      error: string | null;
    };
    try {
      const answer = await ask(provider, prompt.prompt);
      const analysis = analyzeAnswer(answer, target);
      data = { model: answer.model, ...analysis, error: null };
      answers += 1;
    } catch (error) {
      failed += 1;
      const message = errorText(error);
      firstError ??= message;
      options.logger?.warn('AI answer failed', {
        projectId,
        provider,
        error: message,
      });
      data = {
        model: '',
        mentioned: false,
        position: null,
        ownCited: false,
        citations: [],
        competitors: [],
        excerpt: '',
        error: message,
      };
    }
    await deps.db.aiAnswerResult.upsert({
      where: {
        promptId_provider_day: { promptId: prompt.id, provider, day },
      },
      create: { projectId, promptId: prompt.id, provider, day, ...data },
      update: data,
    });
  });

  await deps.db.aiAnswerResult.deleteMany({
    where: {
      projectId,
      day: { lt: utcDay(now - AI_ANSWER_RETENTION_DAYS * DAY_MS) },
    },
  });

  const status: AiAnswerRunStatus =
    failed === 0 ? 'success' : answers === 0 ? 'error' : 'partial';
  await finish(status, firstError);
  return { status, answers, failed };
}

export function createAiAnswersService(
  deps: Pick<ServiceDeps, 'db' | 'config' | 'logger' | 'queues'>,
  _services: () => Services
) {
  const logger = deps.logger.child({ module: 'ai-answers' });

  return {
    getSetup: (projectId: string): Promise<IAiAnswerSetup> =>
      getAiAnswerSetup(deps, projectId),
    saveSettings: (input: AiAnswerSettingsInput): Promise<IAiAnswerTracker> =>
      saveAiAnswerSettings(deps, input),
    addPrompt: (projectId: string, prompt: string): Promise<IAiAnswerPrompt> =>
      addAiAnswerPrompt(deps, projectId, prompt),
    removePrompt: (projectId: string, promptId: string): Promise<void> =>
      removeAiAnswerPrompt(deps, projectId, promptId),
    summary: (projectId: string): Promise<IAiAnswerSummary> =>
      getAiAnswerSummary(deps, projectId),
    /** Queues a run now; at most one an hour, since each is billed to the key. */
    runNow: async (projectId: string): Promise<void> => {
      const setup = await getAiAnswerSetup(deps, projectId);
      if (!setup.tracker) {
        throw new AiAnswerError('Save your brand and prompts first.');
      }
      if (setup.prompts.length === 0) {
        throw new AiAnswerError('Add a prompt to track first.');
      }
      if (!(setup.keys.openai || setup.keys.anthropic)) {
        throw new AiAnswerError(
          'Add an OpenAI or Anthropic key in workspace settings first.'
        );
      }
      if (setup.nextRunNowAt) {
        const minutes = Math.ceil(
          (setup.nextRunNowAt.getTime() - Date.now()) / 60_000
        );
        throw new AiAnswerError(
          `Answers were checked less than an hour ago. Try again in ${minutes} min.`
        );
      }
      await deps.db.aiAnswerTracker.update({
        where: { projectId },
        data: {
          lastRunAt: new Date(),
          lastRunStatus: 'running',
          lastRunError: null,
        },
      });
      await deps.queues.gsc.aiAnswersProjectRun.add(
        { projectId },
        {
          deduplicationId: `ai-answers-now:${projectId}:${Math.floor(Date.now() / AI_ANSWER_RUN_NOW_GAP_MS)}`,
        }
      );
    },
    listProjectsForRun: (): Promise<{ projectId: string }[]> =>
      listAiAnswerProjectsForRun(deps),
    runProject: (projectId: string): Promise<AiAnswerRunOutcome> =>
      runAiAnswerProject(deps, projectId, { logger }),
  };
}
