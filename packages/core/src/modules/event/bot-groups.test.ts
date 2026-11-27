// Every crawler the bots page names lands in the group its operator
// documents, from its real user agent through the detector.

import { describe, expect, it } from 'bun:test';
import bots from '../ingest/src/bots/bots';
import { detectBot } from '../ingest/src/bots/detect';
import {
  AI_BOT_GROUPS,
  BOT_GROUP_LABELS,
  BOT_GROUPS,
  type BotGroup,
  botGroup,
} from './event.constants';

const CASES: [string, string, BotGroup][] = [
  [
    'ChatGPT-User',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
    'answers',
  ],
  [
    'Claude-User',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)',
    'answers',
  ],
  [
    'Perplexity-User',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)',
    'answers',
  ],
  [
    'MistralAI-User',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; MistralAI-User/1.0; +https://docs.mistral.ai/robots)',
    'answers',
  ],
  [
    'DuckAssistBot',
    'DuckAssistBot/1.2; (+http://duckduckgo.com/duckassistbot.html)',
    'answers',
  ],
  [
    'Google-Agent',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko; compatible; Google-Agent; +https://developers.google.com/crawling/docs/crawlers-fetchers/google-agent) Chrome/140.0.0.0 Safari/537.36',
    'answers',
  ],
  [
    'Google-GeminiNotebook',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 (compatible; Google-GeminiNotebook; +https://developers.google.com/crawling/docs/crawlers-fetchers/google-gemininotebook)',
    'answers',
  ],
  [
    'Meta-ExternalFetcher',
    'meta-externalfetcher/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    'answers',
  ],
  [
    'Kimi-User',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Kimi-User/1.0; +https://www.kimi.com/policies/kimi-crawlers',
    'answers',
  ],
  [
    'OAI-SearchBot',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.3; +https://openai.com/searchbot',
    'indexing',
  ],
  [
    'Claude-SearchBot',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +Claude-SearchBot@anthropic.com)',
    'indexing',
  ],
  [
    'PerplexityBot',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
    'indexing',
  ],
  ['Google-CloudVertexBot', 'Google-CloudVertexBot', 'indexing'],
  [
    'Kimi-SearchBot',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Kimi-SearchBot/1.0; +https://www.kimi.com/policies/kimi-crawlers',
    'indexing',
  ],
  [
    'GPTBot',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.3; +https://openai.com/gptbot',
    'training',
  ],
  [
    'ClaudeBot',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'training',
  ],
  [
    'Meta-ExternalAgent',
    'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    'training',
  ],
  [
    'Applebot-Extended',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15 (Applebot-Extended/0.1; +http://www.apple.com/go/applebot)',
    'training',
  ],
  [
    'Amazonbot',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot) Chrome/119.0.6045.214 Safari/537.36',
    'training',
  ],
  [
    'Bytespider',
    'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)',
    'training',
  ],
  ['ccBot crawler', 'CCBot/2.0 (https://commoncrawl.org/faq/)', 'training'],
  [
    'DeepseekBot',
    'Mozilla/5.0 (compatible; DeepSeekBot/1.0; +https://www.deepseek.com/bot)',
    'training',
  ],
  ['Cohere AI', 'cohere-ai', 'training'],
  ['xAI-Bot', 'Mozilla/5.0 (compatible; xAI-Bot/1.0)', 'training'],
  [
    'KimiBot',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; KimiBot/1.0; +https://www.kimi.com/policies/kimi-crawlers',
    'training',
  ],
  [
    'Googlebot',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/141.0.0.0 Safari/537.36',
    'search',
  ],
  [
    'BingBot',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36',
    'search',
  ],
];

describe('botGroup', () => {
  for (const [name, userAgent, group] of CASES) {
    it(`puts ${name} in ${BOT_GROUP_LABELS[group]}`, () => {
      const bot = detectBot(userAgent);
      expect(bot?.name).toBe(name);
      expect(botGroup(bot?.name ?? '', bot?.type ?? '')).toBe(group);
    });
  }

  it('maps every AI category of the detector to an AI group', () => {
    for (const bot of bots) {
      const category = 'category' in bot ? String(bot.category) : '';
      if (category.startsWith('AI ')) {
        expect(AI_BOT_GROUPS).toContain(botGroup(bot.name, category));
      }
    }
  });

  it('labels every group and puts unknown categories in Other', () => {
    for (const group of BOT_GROUPS) {
      expect(BOT_GROUP_LABELS[group]).toBeTruthy();
    }
    expect(botGroup('aHrefs Bot', 'Crawler')).toBe('other');
    expect(botGroup('Something', 'Site Monitor')).toBe('other');
  });
});
