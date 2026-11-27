import type {
  AiAnswerProvider,
  IAiAnswerSetup,
  IAiAnswerTracker,
} from '@flarepanel/core/modules/ai-answers/ai-answers.constants';
import { AI_ANSWER_PROVIDERS } from '@flarepanel/core/modules/ai-answers/ai-answers.constants';

export const AI_ANSWERS_DOCS_URL =
  'https://docs.flarepanel.dev/tracking/ai-answers';

/** `0.4` → `40%`; null → `—`. */
export function percent(rate: number | null): string {
  return rate === null ? '—' : `${Math.round(rate * 100)}%`;
}

/** `1.5` → `#1.5`; null → `—`. */
export function rank(position: number | null): string {
  if (position === null) {
    return '—';
  }
  return `#${Number.isInteger(position) ? position : position.toFixed(1)}`;
}

/** Comma or newline separated terms, trimmed and without empties. */
export function splitTerms(text: string): string[] {
  return text
    .split(/[,\n]/)
    .map((term) => term.trim())
    .filter(Boolean);
}

/** One prompt per line. */
export function splitPrompts(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** The providers a run asks: the chosen ones that have a key, else every one with a key. */
export function providersToAsk(
  tracker: Pick<IAiAnswerTracker, 'providers'> | null,
  keys: IAiAnswerSetup['keys']
): AiAnswerProvider[] {
  const withKey = AI_ANSWER_PROVIDERS.filter((provider) => keys[provider]);
  const chosen = tracker?.providers.length ? tracker.providers : withKey;
  return chosen.filter((provider) => keys[provider]);
}

export function runStatusText(tracker: IAiAnswerTracker): {
  text: string;
  tone: 'muted' | 'error';
} {
  switch (tracker.lastRunStatus) {
    case 'running':
      return { text: 'Checking answers now…', tone: 'muted' };
    case 'success':
      return { text: 'All answers checked', tone: 'muted' };
    case 'partial':
      return { text: 'Some answers failed', tone: 'error' };
    case 'error':
      return { text: 'The last check failed', tone: 'error' };
    case 'no_key':
      return { text: 'No AI key to check with', tone: 'error' };
    default:
      return {
        text: tracker.enabled ? 'Not checked yet' : 'Paused',
        tone: 'muted',
      };
  }
}
