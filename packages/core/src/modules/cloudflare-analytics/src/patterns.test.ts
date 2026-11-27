import { describe, expect, it } from 'bun:test';
import { botGroup } from '../../event/event.constants';
import { detectBot, knownBots } from '../../ingest/src/bots/detect';
import {
  crawlerPatternChunks,
  crawlerUserAgentLiterals,
  regexLiterals,
  UA_PATTERNS_PER_QUERY,
} from './patterns';

const literals = crawlerUserAgentLiterals();
const covered = (userAgent: string) =>
  literals.some((literal) => userAgent.includes(literal));

describe('crawler user agent patterns', () => {
  it('cover the AI crawlers and search engines people ask about', () => {
    for (const userAgent of [
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'Mozilla/5.0 (compatible; Applebot-Extended/0.1)',
      'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
      'CCBot/2.0 (https://commoncrawl.org/faq/)',
    ]) {
      expect(detectBot(userAgent)).not.toBeNull();
      expect(covered(userAgent)).toBe(true);
    }
  });

  it('cover every non-other bot the detector finds by a plain substring', () => {
    for (const bot of knownBots()) {
      if (
        'includes' in bot &&
        bot.includes.length >= 4 &&
        botGroup(bot.name, bot.category ?? '') !== 'other'
      ) {
        expect(covered(bot.includes)).toBe(true);
      }
    }
  });

  it('leave out monitors, SEO tools and other bots', () => {
    expect(covered('Mozilla/5.0 (compatible; AhrefsBot/7.0)')).toBe(false);
    expect(covered('UptimeRobot/2.0')).toBe(false);
  });

  it('drop literals a shorter one already covers', () => {
    expect(literals).toContain('Applebot');
    expect(literals).not.toContain('Applebot-Extended');
  });

  it('read literals out of the detector regexes', () => {
    expect(regexLiterals('ClaudeBot|Anthropic-Claude')).toEqual([
      'ClaudeBot',
      'Anthropic-Claude',
    ]);
    expect(regexLiterals('(360Spider(?:-Image|-Video)?)')).toEqual([
      '360Spider',
    ]);
    expect(regexLiterals('Mail\\.RU')).toEqual(['Mail.RU']);
    expect(regexLiterals('^Google$')).toEqual(['Google']);
    expect(regexLiterals('(?<!HTC)[ _]Butterfly/')).toEqual([]);
  });

  it('chunk into small OR lists, one per query', () => {
    const chunks = crawlerPatternChunks();
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.length).toBeLessThanOrEqual(5);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(UA_PATTERNS_PER_QUERY);
      for (const pattern of chunk) {
        expect(pattern).toMatch(/^%[^%]+%$/);
      }
    }
    expect(chunks.flat()).toHaveLength(literals.length);
  });
});
