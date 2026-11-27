// Folds stored answers into what the dashboard shows: mention and citation
// rates, average rank, share of voice, cited domains and each prompt's latest
// answers. Answers that failed are listed per prompt but never counted.
import type {
  AiAnswerProvider,
  IAiAnswer,
  IAiAnswerPrompt,
  IAiAnswerSummary,
} from '../ai-answers.constants';
import { hostOf, onDomain } from './analyze';

const DAY_MS = 24 * 60 * 60 * 1000;
const TOP_DOMAINS = 10;

export interface StoredAnswer extends IAiAnswer {
  promptId: string;
}

/** `YYYY-MM-DD` in UTC. */
export function utcDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function rate(part: number, whole: number): number | null {
  return whole > 0 ? part / whole : null;
}

function average(values: number[]): number | null {
  return values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

export function summarizeAnswers(input: {
  rows: readonly StoredAnswer[];
  prompts: readonly IAiAnswerPrompt[];
  brandNames: readonly string[];
  brandDomains: readonly string[];
  competitors: readonly string[];
  days: number;
  now: number;
}): IAiAnswerSummary {
  const { rows, prompts, days, now } = input;
  const promptIds = new Set(prompts.map((prompt) => prompt.id));
  const scored = rows.filter(
    (row) => !row.error && promptIds.has(row.promptId)
  );

  const providers = new Map<
    AiAnswerProvider,
    { answers: number; mentioned: number; cited: number; positions: number[] }
  >();
  const competitorAnswers = new Map<string, number>();
  const domains = new Map<string, number>();
  for (const row of scored) {
    const entry = providers.get(row.provider) ?? {
      answers: 0,
      mentioned: 0,
      cited: 0,
      positions: [],
    };
    entry.answers += 1;
    entry.mentioned += row.mentioned ? 1 : 0;
    entry.cited += row.ownCited ? 1 : 0;
    if (row.position !== null) {
      entry.positions.push(row.position);
    }
    providers.set(row.provider, entry);

    for (const name of new Set(row.competitors)) {
      competitorAnswers.set(name, (competitorAnswers.get(name) ?? 0) + 1);
    }
    const hosts = new Set(
      row.citations.map(hostOf).filter((host): host is string => !!host)
    );
    for (const host of hosts) {
      domains.set(host, (domains.get(host) ?? 0) + 1);
    }
  }

  const mentioned = scored.filter((row) => row.mentioned).length;
  const cited = scored.filter((row) => row.ownCited).length;
  const positions = scored
    .map((row) => row.position)
    .filter((position): position is number => position !== null);

  const [brand = 'Your brand'] = input.brandNames;
  const shareOfVoice = [
    { name: brand, own: true, answers: mentioned },
    ...input.competitors
      .map((name) => ({
        name,
        own: false,
        answers: competitorAnswers.get(name) ?? 0,
      }))
      .sort((a, b) => b.answers - a.answers),
  ];

  const series: IAiAnswerSummary['series'] = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const day = utcDay(now - index * DAY_MS);
    const dayRows = scored.filter((row) => row.day === day);
    series.push({
      day,
      answers: dayRows.length,
      mentioned: dayRows.filter((row) => row.mentioned).length,
    });
  }

  return {
    days,
    answers: scored.length,
    mentionRate: rate(mentioned, scored.length),
    avgPosition: average(positions),
    citationRate: rate(cited, scored.length),
    byProvider: [...providers]
      .map(([provider, entry]) => ({
        provider,
        answers: entry.answers,
        mentioned: entry.mentioned,
        cited: entry.cited,
        avgPosition: average(entry.positions),
      }))
      .sort((a, b) => a.provider.localeCompare(b.provider)),
    shareOfVoice,
    topCitedDomains: [...domains]
      .map(([domain, answers]) => ({
        domain,
        answers,
        own: input.brandDomains.some((own) => onDomain(domain, own)),
      }))
      .sort((a, b) => b.answers - a.answers || a.domain.localeCompare(b.domain))
      .slice(0, TOP_DOMAINS),
    series,
    prompts: prompts.map((prompt) => {
      const own = rows.filter((row) => row.promptId === prompt.id);
      const ok = own.filter((row) => !row.error);
      const latest = new Map<AiAnswerProvider, StoredAnswer>();
      for (const row of own) {
        const seen = latest.get(row.provider);
        if (!seen || row.day > seen.day) {
          latest.set(row.provider, row);
        }
      }
      return {
        id: prompt.id,
        prompt: prompt.prompt,
        mentionRate: rate(ok.filter((row) => row.mentioned).length, ok.length),
        latest: [...latest.values()]
          .sort((a, b) => a.provider.localeCompare(b.provider))
          .map(({ promptId: _promptId, ...answer }) => answer),
      };
    }),
  };
}
