import { describe, expect, it } from 'bun:test';
import { analyzeAnswer, firstMention, onDomain, plainText } from './analyze';

const TARGET = {
  brandNames: ['FlarePanel'],
  brandDomains: ['flarepanel.dev'],
  competitors: ['Plausible', 'Umami', 'PostHog'],
};

describe('firstMention', () => {
  it('matches whole words, ignoring case', () => {
    expect(firstMention('Try plausible or Umami.', 'Plausible')).toBe(4);
    expect(firstMention('That is implausible.', 'Plausible')).toBe(-1);
    expect(firstMention('Use flarepanel.dev today', 'flarepanel.dev')).toBe(4);
    expect(firstMention('anything', '  ')).toBe(-1);
  });

  it('treats regex characters in a name literally', () => {
    expect(firstMention('We like C++ a lot', 'C++')).toBe(8);
    expect(firstMention('We like C a lot', 'C++')).toBe(-1);
  });
});

describe('analyzeAnswer', () => {
  it('ranks the brand among the brands named and finds its own citation', () => {
    const result = analyzeAnswer(
      {
        text: '**Plausible** is popular. [FlarePanel](https://flarepanel.dev) runs on Cloudflare. PostHog does more.',
        sources: [
          { url: 'https://plausible.io/' },
          { url: 'https://docs.flarepanel.dev/tracking' },
          { url: 'https://plausible.io/' },
          { url: 'not a url' },
        ],
      },
      TARGET
    );
    expect(result).toMatchObject({
      mentioned: true,
      position: 2,
      ownCited: true,
      competitors: ['Plausible', 'PostHog'],
      citations: [
        'https://plausible.io/',
        'https://docs.flarepanel.dev/tracking',
      ],
    });
    expect(result.excerpt).toStartWith('Plausible is popular. FlarePanel runs');
  });

  it('reports an answer that leaves the brand out', () => {
    const result = analyzeAnswer(
      { text: 'Umami and Plausible are good picks.', sources: [] },
      TARGET
    );
    expect(result).toMatchObject({
      mentioned: false,
      position: null,
      ownCited: false,
      competitors: ['Umami', 'Plausible'],
    });
  });

  it('counts the brand domain as a mention and cuts long excerpts around it', () => {
    const text = `${'Analytics tools vary a lot. '.repeat(30)}See flarepanel.dev for a Cloudflare one.`;
    const result = analyzeAnswer({ text, sources: [] }, TARGET);
    expect(result.mentioned).toBe(true);
    expect(result.position).toBe(1);
    expect(result.excerpt.startsWith('…')).toBe(true);
    expect(result.excerpt).toContain('flarepanel.dev');
  });
});

describe('helpers', () => {
  it('matches a domain and its subdomains only', () => {
    expect(onDomain('docs.flarepanel.dev', 'flarepanel.dev')).toBe(true);
    expect(onDomain('flarepanel.dev', 'www.flarepanel.dev')).toBe(true);
    expect(onDomain('notflarepanel.dev', 'flarepanel.dev')).toBe(false);
  });

  it('strips markdown', () => {
    expect(plainText('# Title\n\n**Bold** [link](https://a.b/(x))')).toBe(
      'Title Bold link'
    );
  });
});
