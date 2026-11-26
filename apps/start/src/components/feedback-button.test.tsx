// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { FeedbackButton, PUBLIC_FEEDBACK_URL } from './feedback-button';

const state = vi.hoisted(() => ({ inApp: false }));
const pushModal = vi.hoisted(() => vi.fn());

vi.mock('@/utils/op', () => ({ op: { track: vi.fn() } }));
vi.mock('@/modals', () => ({ pushModal }));
vi.mock('@/integrations/trpc/react', () => ({
  useTRPC: () => ({
    feedback: { config: { queryOptions: () => ({ queryKey: ['feedback'] }) } },
  }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { inApp: state.inApp } }),
}));

describe('FeedbackButton', () => {
  afterEach(() => {
    cleanup();
    pushModal.mockReset();
  });

  test('links to GitHub issues when the server takes no in-app feedback', () => {
    state.inApp = false;
    render(<FeedbackButton />);
    const link = screen.getByRole('link', { name: 'Give feedback' });
    expect(link.getAttribute('href')).toBe(PUBLIC_FEEDBACK_URL);
    expect(PUBLIC_FEEDBACK_URL).toContain(
      'github.com/flarepanel-dev/flarepanel'
    );
  });

  test('opens the in-app form, with its topic, when the server takes feedback', () => {
    state.inApp = true;
    render(<FeedbackButton topic="AI observability" />);
    expect(screen.queryByRole('link')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Give feedback' }));
    expect(pushModal).toHaveBeenCalledWith('Feedback', {
      topic: 'AI observability',
    });
  });
});
