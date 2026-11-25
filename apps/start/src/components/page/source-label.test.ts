import { describe, expect, test } from 'vitest';
import { sourceLabel } from './source-label';

describe('sourceLabel', () => {
  test('names AI assistants and search engines properly', () => {
    expect(sourceLabel('chatgpt.com')).toBe('ChatGPT');
    expect(sourceLabel('gemini.google.com')).toBe('Gemini');
    expect(sourceLabel('duckduckgo.com')).toBe('DuckDuckGo');
  });

  test('falls back to the capitalised domain', () => {
    expect(sourceLabel('bing.com')).toBe('Bing');
    expect(sourceLabel('Others')).toBe('Others');
  });
});
