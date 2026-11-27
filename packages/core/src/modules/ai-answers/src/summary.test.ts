import { describe, expect, it } from 'bun:test';
import { type StoredAnswer, summarizeAnswers } from './summary';

const NOW = Date.parse('2026-11-27T12:00:00Z');
const PROMPTS = [
  { id: 'p1', prompt: 'best privacy analytics', createdAt: new Date(NOW) },
  { id: 'p2', prompt: 'analytics on cloudflare', createdAt: new Date(NOW) },
];

function answer(over: Partial<StoredAnswer>): StoredAnswer {
  return {
    promptId: 'p1',
    provider: 'openai',
    model: 'm',
    day: '2026-11-27',
    mentioned: false,
    position: null,
    ownCited: false,
    citations: [],
    competitors: [],
    excerpt: '',
    error: null,
    ...over,
  };
}

describe('summarizeAnswers', () => {
  it('counts rates, share of voice and domains, and skips failed answers', () => {
    const summary = summarizeAnswers({
      rows: [
        answer({
          mentioned: true,
          position: 1,
          ownCited: true,
          citations: [
            'https://flarepanel.dev/a',
            'https://docs.flarepanel.dev/b',
          ],
          competitors: ['Plausible'],
        }),
        answer({
          provider: 'anthropic',
          mentioned: true,
          position: 3,
          citations: ['https://plausible.io/'],
          competitors: ['Plausible', 'Umami'],
        }),
        answer({ promptId: 'p2', day: '2026-11-26', competitors: ['Umami'] }),
        answer({ promptId: 'p2', provider: 'anthropic', error: 'bad key' }),
        answer({ promptId: 'gone', mentioned: true }),
      ],
      prompts: PROMPTS,
      brandNames: ['FlarePanel'],
      brandDomains: ['flarepanel.dev'],
      competitors: ['Umami', 'Plausible', 'PostHog'],
      days: 3,
      now: NOW,
    });

    expect(summary.answers).toBe(3);
    expect(summary.mentionRate).toBeCloseTo(2 / 3);
    expect(summary.citationRate).toBeCloseTo(1 / 3);
    expect(summary.avgPosition).toBe(2);
    expect(summary.shareOfVoice).toEqual([
      { name: 'FlarePanel', own: true, answers: 2 },
      { name: 'Umami', own: false, answers: 2 },
      { name: 'Plausible', own: false, answers: 2 },
      { name: 'PostHog', own: false, answers: 0 },
    ]);
    expect(summary.topCitedDomains).toEqual([
      { domain: 'docs.flarepanel.dev', answers: 1, own: true },
      { domain: 'flarepanel.dev', answers: 1, own: true },
      { domain: 'plausible.io', answers: 1, own: false },
    ]);
    expect(summary.series).toEqual([
      { day: '2026-11-25', answers: 0, mentioned: 0 },
      { day: '2026-11-26', answers: 1, mentioned: 0 },
      { day: '2026-11-27', answers: 2, mentioned: 2 },
    ]);
    expect(summary.byProvider.map((p) => [p.provider, p.answers])).toEqual([
      ['anthropic', 1],
      ['openai', 2],
    ]);

    const [first, second] = summary.prompts;
    expect(first?.mentionRate).toBe(1);
    expect(first?.latest.map((a) => a.provider)).toEqual([
      'anthropic',
      'openai',
    ]);
    expect(second?.mentionRate).toBe(0);
    // The failed answer is the latest for its provider and is shown with its error.
    expect(second?.latest.find((a) => a.provider === 'anthropic')?.error).toBe(
      'bad key'
    );
  });

  it('has no rates without answers', () => {
    const summary = summarizeAnswers({
      rows: [],
      prompts: [],
      brandNames: [],
      brandDomains: [],
      competitors: [],
      days: 1,
      now: NOW,
    });
    expect(summary).toMatchObject({
      answers: 0,
      mentionRate: null,
      avgPosition: null,
      citationRate: null,
      shareOfVoice: [{ name: 'Your brand', own: true, answers: 0 }],
    });
  });
});
