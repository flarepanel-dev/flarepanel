import type { IAiAnswerTracker } from '@flarepanel/core/modules/ai-answers/ai-answers.constants';
import { describe, expect, it } from 'vitest';
import {
  percent,
  providersToAsk,
  rank,
  runStatusText,
  splitPrompts,
  splitTerms,
} from './ai-answers-view';

const tracker: IAiAnswerTracker = {
  brandNames: ['Acme'],
  brandDomains: [],
  competitors: [],
  providers: [],
  enabled: true,
  lastRunAt: null,
  lastRunStatus: null,
  lastRunError: null,
};

describe('ai answers view', () => {
  it('formats rates and ranks', () => {
    expect(percent(0.456)).toBe('46%');
    expect(percent(null)).toBe('—');
    expect(rank(2)).toBe('#2');
    expect(rank(1.25)).toBe('#1.3');
    expect(rank(null)).toBe('—');
  });

  it('splits terms and prompts', () => {
    expect(splitTerms(' Acme, Acme Inc\n, ')).toEqual(['Acme', 'Acme Inc']);
    expect(splitPrompts('one?\n\n two? \n')).toEqual(['one?', 'two?']);
  });

  it('asks only providers with a key', () => {
    const keys = { openai: true, anthropic: false };
    expect(providersToAsk({ providers: [] }, keys)).toEqual(['openai']);
    expect(providersToAsk({ providers: ['anthropic'] }, keys)).toEqual([]);
    expect(providersToAsk(null, { openai: true, anthropic: true })).toEqual([
      'openai',
      'anthropic',
    ]);
  });

  it('describes the last run', () => {
    expect(runStatusText({ ...tracker }).text).toBe('Not checked yet');
    expect(runStatusText({ ...tracker, enabled: false }).text).toBe('Paused');
    expect(runStatusText({ ...tracker, lastRunStatus: 'partial' })).toEqual({
      text: 'Some answers failed',
      tone: 'error',
    });
  });
});
