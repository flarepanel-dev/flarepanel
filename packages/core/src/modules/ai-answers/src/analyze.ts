// Reads one AI answer: is the brand named, where does it rank among the
// brands named, which sites are cited, and is one of them the brand's own.
import { AI_ANSWER_CITATIONS_MAX } from '../ai-answers.constants';

export interface AnswerSource {
  url: string;
  title?: string | null;
}

export interface AnswerTarget {
  brandNames: readonly string[];
  brandDomains: readonly string[];
  competitors: readonly string[];
}

export interface AnswerAnalysis {
  mentioned: boolean;
  /** 1-based rank among the brands named, by first mention; null when absent. */
  position: number | null;
  ownCited: boolean;
  /** Unique cited URLs, in the order given. */
  citations: string[];
  /** Competitors the answer names, in the order they appear. */
  competitors: string[];
  excerpt: string;
}

const EXCERPT_LENGTH = 360;
const EXCERPT_LEAD = 120;
const MARKDOWN_LINK = /\[([^\]]*)\]\((?:[^()]|\([^)]*\))*\)/g;
const MARKDOWN_NOISE = /[*_`#>]+/g;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Index of the first mention of `term` as a whole word (`Plausible` but not
 * `implausible`), ignoring case; -1 when absent.
 */
export function firstMention(text: string, term: string): number {
  const needle = term.trim();
  if (!needle) {
    return -1;
  }
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}])${escapeRegExp(needle)}(?![\\p{L}\\p{N}])`,
    'iu'
  );
  const match = pattern.exec(text);
  return match ? match.index : -1;
}

function earliest(text: string, terms: readonly string[]): number {
  let best = -1;
  for (const term of terms) {
    const at = firstMention(text, term);
    if (at >= 0 && (best < 0 || at < best)) {
      best = at;
    }
  }
  return best;
}

/** The hostname without `www.`, or null for a URL that does not parse. */
export function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** True when `host` is `domain` or one of its subdomains. */
export function onDomain(host: string, domain: string): boolean {
  const bare = domain.toLowerCase().replace(/^www\./, '');
  return host === bare || host.endsWith(`.${bare}`);
}

/** Markdown links and emphasis out, so excerpts read as text. */
export function plainText(text: string): string {
  return text
    .replace(MARKDOWN_LINK, '$1')
    .replace(MARKDOWN_NOISE, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerptAround(text: string, at: number): string {
  if (text.length <= EXCERPT_LENGTH) {
    return text;
  }
  const start = Math.max(0, at - EXCERPT_LEAD);
  const end = Math.min(text.length, start + EXCERPT_LENGTH);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
}

export function analyzeAnswer(
  answer: { text: string; sources: readonly AnswerSource[] },
  target: AnswerTarget
): AnswerAnalysis {
  const text = plainText(answer.text);
  const brandTerms = [...target.brandNames, ...target.brandDomains];
  const brandAt = earliest(text, brandTerms);

  const named = target.competitors
    .map((name) => ({ name, at: firstMention(text, name) }))
    .filter((entry) => entry.at >= 0)
    .sort((a, b) => a.at - b.at);

  const position =
    brandAt >= 0
      ? named.filter((entry) => entry.at < brandAt).length + 1
      : null;

  const citations: string[] = [];
  for (const source of answer.sources) {
    const url = source.url?.trim();
    if (url && hostOf(url) && !citations.includes(url)) {
      citations.push(url);
    }
    if (citations.length >= AI_ANSWER_CITATIONS_MAX) {
      break;
    }
  }
  const ownCited = citations.some((url) => {
    const host = hostOf(url);
    return Boolean(
      host && target.brandDomains.some((domain) => onDomain(host, domain))
    );
  });

  return {
    mentioned: brandAt >= 0,
    position,
    ownCited,
    citations,
    competitors: named.map((entry) => entry.name),
    excerpt: excerptAround(text, Math.max(brandAt, 0)),
  };
}
