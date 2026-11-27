import { cacheable } from '@flarepanel/redis';
import bots from './bots';

/**
 * Automation the generated list (scripts/get-bots.ts, from an upstream
 * database) does not cover. Kept here so a regeneration cannot drop them.
 * Headless Chrome is what Playwright, Puppeteer and most scrapers run; it
 * says so in its user agent, and no person browses with it.
 */
const EXTRA_BOTS = [
  {
    includes: 'HeadlessChrome',
    name: 'Headless Chrome',
    category: 'Headless browser',
  },
  // AI crawlers and fetchers documented by their operators that the upstream
  // list does not have yet.
  { includes: 'Google-Agent', name: 'Google-Agent', category: 'AI Agent' },
  {
    includes: 'Google-GeminiNotebook',
    name: 'Google-GeminiNotebook',
    category: 'AI Assistant',
  },
  { includes: 'Kimi-User', name: 'Kimi-User', category: 'AI Assistant' },
  {
    includes: 'Kimi-SearchBot',
    name: 'Kimi-SearchBot',
    category: 'AI Search Crawler',
  },
  { includes: 'KimiBot', name: 'KimiBot', category: 'AI Data Scraper' },
  {
    includes: 'xAI-SearchBot',
    name: 'xAI-SearchBot',
    category: 'AI Search Crawler',
  },
  {
    includes: 'Grok-DeepSearch',
    name: 'Grok-DeepSearch',
    category: 'AI Assistant',
  },
  { includes: 'GrokBot', name: 'GrokBot', category: 'AI Data Scraper' },
  { includes: 'DeepSeekBot', name: 'DeepseekBot', category: 'AI Data Scraper' },
] as const;

// Pre-compile regex patterns at module load time
const compiledBots = [...bots, ...EXTRA_BOTS].map((bot) => {
  if ('regex' in bot) {
    return {
      ...bot,
      compiledRegex: new RegExp(bot.regex),
    };
  }
  return bot;
});

const regexBots = compiledBots.filter((bot) => 'compiledRegex' in bot);
const includesBots = compiledBots.filter((bot) => 'includes' in bot);

export interface BotMatch {
  name: string;
  type: string;
}

// Pure, synchronous bot detection against the generated `bots.ts` list.
// Exported (and unwrapped from the cache) so it can be tested without Redis.
// The list itself decides what counts as a bot; legitimate runtime/client
// identifiers (e.g. `node`, `Node.js`) are stripped from the patterns at
// generation time (see scripts/get-bots.ts), so backend traffic is only
// flagged when its user agent explicitly identifies itself as a bot.
export function detectBot(ua: string): BotMatch | null {
  // Check simple string patterns first (fast)
  for (const bot of includesBots) {
    if (ua.includes(bot.includes)) {
      return {
        name: bot.name,
        type: 'category' in bot ? bot.category : 'Unknown',
      };
    }
  }

  // Check regex patterns (slower)
  for (const bot of regexBots) {
    if (bot.compiledRegex.test(ua)) {
      return {
        name: bot.name,
        type: 'category' in bot ? bot.category : 'Unknown',
      };
    }
  }

  return null;
}

export const isBot = cacheable('is-bot', detectBot, 60 * 5);
