import { tool } from 'ai';
import { z } from 'zod';
import type { ChatToolContext } from '../context';

/** The public docs site (Vocs) and its all-pages text for LLMs. */
const DOCS_BASE_URL = 'https://docs.flarepanel.dev';
const DOCS_URL = `${DOCS_BASE_URL}/llms-full.txt`;
const DOCS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DOCS_FETCH_TIMEOUT_MS = 10_000;
const MAX_RESULTS = 3;
const MAX_SECTION_CHARS = 3500;
const MIN_TERM_LENGTH = 3;
const TITLE_WEIGHT = 6;
const MAX_BODY_HITS = 12;
const SECTION_SEPARATOR = /\n---\n/;
/** Vocs marks each page with `<!-- Source: /path -->` before its `# Title`. */
const VOCS_SOURCE_MARKER = /<!-- Source: (\S+) -->/;
const PAGE_TITLE_LINE = /^# (.+)$/m;
const TITLE_LINE = /^## (.+)$/m;
const URL_LINE = /^URL: (\S+)$/m;
const NON_WORD = /[^a-z0-9]+/;
/** Pages that only make sense when you run FlarePanel yourself. */
const SELF_HOSTING_DOCS = '/self-hosting';

interface DocSection {
  title: string;
  url: string;
  body: string;
  lowerTitle: string;
  lowerBody: string;
}

let cached: { fetchedAt: number; sections: DocSection[] } | null = null;

function toSection(title: string, url: string, body: string): DocSection {
  return {
    title,
    url,
    body,
    lowerTitle: title.toLowerCase(),
    lowerBody: body.toLowerCase(),
  };
}

/** Vocs `llms-full.txt`: `<!-- Source: /path -->` then the page's markdown. */
function parseVocsSections(text: string): DocSection[] {
  const sections: DocSection[] = [];
  const parts = text.split(VOCS_SOURCE_MARKER);
  // [preamble, path, page, path, page, ...]
  for (let i = 1; i < parts.length; i += 2) {
    const path = parts[i] ?? '';
    const page = parts[i + 1] ?? '';
    const title = PAGE_TITLE_LINE.exec(page)?.[1]?.trim();
    if (!title) {
      continue;
    }
    const url = path === '/' ? DOCS_BASE_URL : `${DOCS_BASE_URL}${path}`;
    sections.push(
      toSection(title, url, page.replace(PAGE_TITLE_LINE, '').trim())
    );
  }
  return sections;
}

export function parseSections(text: string): DocSection[] {
  if (VOCS_SOURCE_MARKER.test(text)) {
    return parseVocsSections(text);
  }
  const sections: DocSection[] = [];
  for (const chunk of text.split(SECTION_SEPARATOR)) {
    const title = TITLE_LINE.exec(chunk)?.[1]?.trim();
    const url = URL_LINE.exec(chunk)?.[1]?.trim();
    if (!(title && url)) {
      continue;
    }
    const body = chunk.replace(TITLE_LINE, '').replace(URL_LINE, '').trim();
    sections.push(toSection(title, url, body));
  }
  return sections;
}

async function loadSections(): Promise<DocSection[]> {
  if (cached && Date.now() - cached.fetchedAt < DOCS_CACHE_TTL_MS) {
    return cached.sections;
  }
  const response = await fetch(DOCS_URL, {
    signal: AbortSignal.timeout(DOCS_FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Docs fetch failed with ${response.status}`);
  }
  const sections = parseSections(await response.text());
  cached = { fetchedAt: Date.now(), sections };
  return sections;
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1 && count < MAX_BODY_HITS) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

export function rankSections(
  sections: DocSection[],
  query: string,
  options: { selfHosted: boolean }
) {
  const terms = query
    .toLowerCase()
    .split(NON_WORD)
    .filter((term) => term.length >= MIN_TERM_LENGTH);
  if (terms.length === 0) {
    return [];
  }
  return sections
    .filter(
      (section) =>
        options.selfHosted || !section.url.includes(SELF_HOSTING_DOCS)
    )
    .map((section) => {
      let score = 0;
      for (const term of terms) {
        if (section.lowerTitle.includes(term)) {
          score += TITLE_WEIGHT;
        }
        score += countOccurrences(section.lowerBody, term);
      }
      return { section, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ section }) => ({
      title: section.title,
      url: section.url,
      content:
        section.body.length > MAX_SECTION_CHARS
          ? `${section.body.slice(0, MAX_SECTION_CHARS)}…`
          : section.body,
    }));
}

export function docsTools(ctx: Pick<ChatToolContext, 'config'>) {
  return {
    search_docs: tool({
      description:
        'Search the FlarePanel documentation: SDK setup, tracking, identify users, groups, session replay, MCP, API, self-hosting, integrations, pricing concepts. Use it for any "how do I" or "is it possible" question about the product before answering from memory, and link the page you used.',
      inputSchema: z.object({ query: z.string().min(1) }),
      execute: async ({ query }) => {
        try {
          const sections = await loadSections();
          return {
            results: rankSections(sections, query, {
              selfHosted: ctx.config.selfHosted,
            }),
          };
        } catch (error) {
          return {
            error: `Documentation is not reachable right now (${error instanceof Error ? error.message : 'unknown error'}). Answer from what you know and point to ${DOCS_BASE_URL}.`,
          };
        }
      },
    }),
  };
}
