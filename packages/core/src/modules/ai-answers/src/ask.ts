// Asks one prompt to one provider with its web search tool on, the way a
// person would in ChatGPT or Claude, and returns the answer and its sources.
import { generateText } from 'ai';
import type { CoreConfig } from '../../../config';
import { webSearchModel } from '../../assistant/src/providers';
import {
  AI_ANSWER_MODELS,
  type AiAnswerProvider,
} from '../ai-answers.constants';
import type { AnswerSource } from './analyze';

/** Long enough for a search and an answer, short enough for a queue step. */
const ANSWER_TIMEOUT_MS = 120_000;
const ANSWER_MAX_TOKENS = 1500;

export interface Answer {
  text: string;
  sources: AnswerSource[];
  model: string;
}

export type AskAnswer = (
  provider: AiAnswerProvider,
  prompt: string
) => Promise<Answer>;

export function createAskAnswer(config: CoreConfig): AskAnswer {
  return async (provider, prompt) => {
    const modelId = AI_ANSWER_MODELS[provider];
    const { model, tools } = webSearchModel(config, provider, modelId);
    const result = await generateText({
      model,
      tools,
      prompt,
      maxOutputTokens: ANSWER_MAX_TOKENS,
      abortSignal: AbortSignal.timeout(ANSWER_TIMEOUT_MS),
      maxRetries: 1,
    });
    return {
      text: result.text,
      sources: collectSources(result),
      model: modelId,
    };
  };
}

interface CitedPart {
  type: string;
  url?: string;
  title?: string;
  sourceType?: string;
  citations?: { source?: { url?: string; title?: string } }[];
}

/**
 * Sources the answer cites inline first, then the pages its searches read.
 * The SDK folds providers' inline citations into text parts; `sources` alone
 * may carry only the search results.
 */
export function collectSources(result: {
  content: readonly unknown[];
  sources?: readonly { sourceType: string; url?: string; title?: string }[];
}): AnswerSource[] {
  const cited: AnswerSource[] = [];
  const read: AnswerSource[] = [];
  for (const part of result.content as CitedPart[]) {
    if (part.type === 'text') {
      for (const citation of part.citations ?? []) {
        if (citation.source?.url) {
          cited.push({
            url: citation.source.url,
            title: citation.source.title ?? null,
          });
        }
      }
    } else if (part.type === 'source' && part.url) {
      read.push({ url: part.url, title: part.title ?? null });
    }
  }
  for (const source of result.sources ?? []) {
    if (source.sourceType === 'url' && source.url) {
      read.push({ url: source.url, title: source.title ?? null });
    }
  }
  const seen = new Set<string>();
  return [...cited, ...read].filter((source) => {
    if (seen.has(source.url)) {
      return false;
    }
    seen.add(source.url);
    return true;
  });
}
