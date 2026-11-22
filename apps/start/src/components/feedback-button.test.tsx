// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { FeedbackButton, PUBLIC_FEEDBACK_URL } from './feedback-button';

vi.mock('@/utils/op', () => ({ op: { track: vi.fn() } }));

describe('FeedbackButton', () => {
  afterEach(cleanup);

  test('links to GitHub issues', () => {
    render(<FeedbackButton />);
    const link = screen.getByRole('link', { name: 'Give feedback' });
    expect(link.getAttribute('href')).toBe(PUBLIC_FEEDBACK_URL);
    expect(PUBLIC_FEEDBACK_URL).toContain(
      'github.com/flarepanel-dev/flarepanel'
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});
