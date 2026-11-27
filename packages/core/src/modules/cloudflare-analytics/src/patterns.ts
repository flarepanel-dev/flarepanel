/**
 * The user agent substrings a sync asks Cloudflare for: every AI crawler,
 * AI assistant and search engine our detector knows (its groups other than
 * `other`), as `userAgent_like: "%…%"` filters. Each returned row is still run
 * through `detectBot`, so a pattern only has to be broad enough; it never
 * decides what a row is.
 */
import { botGroup } from '../../event/event.constants';
import { type KnownBot, knownBots } from '../../ingest/src/bots/detect';

/** Shorter literals match too much unrelated traffic. */
const MIN_LITERAL_LENGTH = 4;
/** `userAgent_like` filters per query: keeps each query small. */
export const UA_PATTERNS_PER_QUERY = 50;
/**
 * Crawlers the detector finds by a regex no literal can be read from, with
 * the substring their user agents carry.
 */
const EXTRA_LITERALS = ['diffbot', 'Googlebot', 'bingbot', 'Baiduspider'];

const SPECIAL = /[()[\]{}?*+.^$|\\]/;

/** Splits a regex on its top-level `|`. */
function alternatives(regex: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < regex.length; index += 1) {
    const char = regex[index];
    if (char === '\\') {
      index += 1;
    } else if (char === '(' || char === '[') {
      depth += 1;
    } else if (char === ')' || char === ']') {
      depth -= 1;
    } else if (char === '|' && depth === 0) {
      parts.push(regex.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(regex.slice(start));
  return parts;
}

/** A regex wrapped whole in one group, without that group. */
function unwrap(regex: string): string {
  if (!(regex.startsWith('(') && regex.endsWith(')'))) {
    return regex;
  }
  let depth = 0;
  for (let index = 0; index < regex.length; index += 1) {
    const char = regex[index];
    if (char === '\\') {
      index += 1;
    } else if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
      if (depth === 0 && index < regex.length - 1) {
        return regex;
      }
    }
  }
  return regex.slice(1, -1).replace(/^\?:/, '');
}

/** The literal text a regex alternative starts with (`\.` read as `.`). */
function leadingLiteral(alternative: string): string {
  let text = '';
  for (let index = 0; index < alternative.length; index += 1) {
    const char = alternative[index] ?? '';
    if (char === '\\') {
      const next = alternative[index + 1] ?? '';
      if (!/[.\-/!]/.test(next)) {
        break;
      }
      text += next;
      index += 1;
      continue;
    }
    if (SPECIAL.test(char)) {
      // `x?` / `x*` make the previous character optional.
      if (char === '?' || char === '*' || char === '{') {
        text = text.slice(0, -1);
      }
      break;
    }
    text += char;
  }
  return text;
}

/** Literal substrings every user agent the regex matches contains. */
export function regexLiterals(regex: string): string[] {
  const body = unwrap(regex.replace(/^\^/, '').replace(/\$$/, ''));
  return alternatives(body)
    .map((alternative) => leadingLiteral(unwrap(alternative)).trim())
    .filter((literal) => literal.length >= MIN_LITERAL_LENGTH);
}

function literalsOf(bot: KnownBot): string[] {
  return 'includes' in bot
    ? [bot.includes].filter((text) => text.length >= MIN_LITERAL_LENGTH)
    : regexLiterals(bot.regex);
}

/**
 * The crawler substrings, shortest first, without any that a shorter one
 * already covers (`Applebot` covers `Applebot-Extended`).
 */
export function crawlerUserAgentLiterals(
  bots: readonly KnownBot[] = knownBots()
): string[] {
  const literals = new Set<string>(EXTRA_LITERALS);
  for (const bot of bots) {
    if (botGroup(bot.name, bot.category ?? '') === 'other') {
      continue;
    }
    for (const literal of literalsOf(bot)) {
      literals.add(literal);
    }
  }
  const sorted = [...literals].sort(
    (a, b) => a.length - b.length || a.localeCompare(b)
  );
  const kept: string[] = [];
  for (const literal of sorted) {
    if (!kept.some((shorter) => literal.includes(shorter))) {
      kept.push(literal);
    }
  }
  return kept;
}

/** `%literal%` patterns in groups of `size`, one group per query. */
export function crawlerPatternChunks(
  literals: readonly string[] = crawlerUserAgentLiterals(),
  size = UA_PATTERNS_PER_QUERY
): string[][] {
  const chunks: string[][] = [];
  for (let index = 0; index < literals.length; index += size) {
    chunks.push(
      literals.slice(index, index + size).map((literal) => `%${literal}%`)
    );
  }
  return chunks;
}
