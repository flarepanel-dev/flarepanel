// AI answer visibility: does ChatGPT or Claude name your brand when someone
// asks the questions your customers ask? A daily job asks each tracked prompt
// with web search on, using the workspace's own AI key, and records whether
// the brand is named, where it ranks among the brands named, and which sites
// the answer cites.
import { z } from 'zod';
import { parseHostnames } from '../cloudflare-analytics/cloudflare-analytics.constants';

export const AI_ANSWER_PROVIDERS = ['openai', 'anthropic'] as const;
export type AiAnswerProvider = (typeof AI_ANSWER_PROVIDERS)[number];

/** What people know the providers by. */
export const AI_ANSWER_PROVIDER_LABELS: Record<AiAnswerProvider, string> = {
  openai: 'ChatGPT',
  anthropic: 'Claude',
};

/**
 * Small models with web search: close to what a person gets from the
 * assistant, at a few cents a day on the workspace's key.
 */
export const AI_ANSWER_MODELS: Record<AiAnswerProvider, string> = {
  openai: 'gpt-5.4-mini',
  anthropic: 'claude-haiku-5-5',
};

export const AI_ANSWER_PROMPTS_MAX = 10;
export const AI_ANSWER_BRAND_NAMES_MAX = 5;
export const AI_ANSWER_DOMAINS_MAX = 5;
export const AI_ANSWER_COMPETITORS_MAX = 10;
export const AI_ANSWER_PROMPT_MIN_LENGTH = 3;
export const AI_ANSWER_PROMPT_MAX_LENGTH = 300;
export const AI_ANSWER_TERM_MAX_LENGTH = 80;
/** Days the summary covers. */
export const AI_ANSWER_SUMMARY_DAYS = 30;
/** Days of answers kept. */
export const AI_ANSWER_RETENTION_DAYS = 90;
/** The shortest gap between two runs a person starts. */
export const AI_ANSWER_RUN_NOW_GAP_MS = 60 * 60 * 1000;
/** Citations kept per answer. */
export const AI_ANSWER_CITATIONS_MAX = 20;

export const AI_ANSWER_RUN_STATUSES = [
  'running',
  'success',
  'partial',
  'error',
  'no_key',
] as const;
export type AiAnswerRunStatus = (typeof AI_ANSWER_RUN_STATUSES)[number];

/** Trimmed, non-empty and unique regardless of case, in the order given. */
export function uniqueTerms(terms: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of terms) {
    const term = raw.trim().replace(/\s+/g, ' ');
    const key = term.toLowerCase();
    if (term && !seen.has(key)) {
      seen.add(key);
      out.push(term);
    }
  }
  return out;
}

const zTerms = (max: number) =>
  z
    .array(z.string().max(AI_ANSWER_TERM_MAX_LENGTH))
    .transform(uniqueTerms)
    .pipe(z.array(z.string()).max(max));

export const zAiAnswerSettingsInput = z.object({
  projectId: z.string(),
  brandNames: zTerms(AI_ANSWER_BRAND_NAMES_MAX).pipe(
    z.array(z.string()).min(1, 'Add the name your brand is known by.')
  ),
  brandDomains: z
    .array(z.string().max(300))
    .transform((hosts) => parseHostnames(hosts))
    .pipe(z.array(z.string()).max(AI_ANSWER_DOMAINS_MAX)),
  competitors: zTerms(AI_ANSWER_COMPETITORS_MAX),
  /** Empty: every provider the workspace has a key for. */
  providers: z
    .array(z.enum(AI_ANSWER_PROVIDERS))
    .transform((list) => [...new Set(list)]),
  enabled: z.boolean(),
});
export type AiAnswerSettingsInput = z.infer<typeof zAiAnswerSettingsInput>;

export const zAiAnswerPromptInput = z.object({
  projectId: z.string(),
  prompt: z
    .string()
    .trim()
    .min(AI_ANSWER_PROMPT_MIN_LENGTH, 'Write the question in a few words.')
    .max(AI_ANSWER_PROMPT_MAX_LENGTH),
});

export interface IAiAnswerTracker {
  brandNames: string[];
  brandDomains: string[];
  competitors: string[];
  providers: AiAnswerProvider[];
  enabled: boolean;
  lastRunAt: Date | null;
  lastRunStatus: AiAnswerRunStatus | null;
  lastRunError: string | null;
}

export interface IAiAnswerPrompt {
  id: string;
  prompt: string;
  createdAt: Date;
}

export interface IAiAnswerSetup {
  tracker: IAiAnswerTracker | null;
  prompts: IAiAnswerPrompt[];
  /** Providers the workspace has an AI key for. */
  keys: Record<AiAnswerProvider, boolean>;
  /** Suggestions for a first setup: the project's name and domain. */
  defaults: { brandNames: string[]; brandDomains: string[] };
  /** When a person may start the next run; null: now. */
  nextRunNowAt: Date | null;
}

export interface IAiAnswer {
  provider: AiAnswerProvider;
  model: string;
  day: string;
  mentioned: boolean;
  position: number | null;
  ownCited: boolean;
  citations: string[];
  competitors: string[];
  excerpt: string;
  error: string | null;
}

export interface IAiAnswerSummary {
  days: number;
  /** Answers without an error. */
  answers: number;
  /** Share of answers that name the brand, 0..1; null without answers. */
  mentionRate: number | null;
  /** Average rank among the brands named, when named. */
  avgPosition: number | null;
  /** Share of answers that cite one of the brand's domains, 0..1. */
  citationRate: number | null;
  byProvider: {
    provider: AiAnswerProvider;
    answers: number;
    mentioned: number;
    cited: number;
    avgPosition: number | null;
  }[];
  /** Answers naming each brand: yours first, then competitors by count. */
  shareOfVoice: { name: string; own: boolean; answers: number }[];
  topCitedDomains: { domain: string; answers: number; own: boolean }[];
  series: { day: string; answers: number; mentioned: number }[];
  prompts: {
    id: string;
    prompt: string;
    mentionRate: number | null;
    /** The latest answer per provider. */
    latest: IAiAnswer[];
  }[];
}
