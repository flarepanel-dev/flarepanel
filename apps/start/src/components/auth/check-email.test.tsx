// @vitest-environment jsdom

// The "check your inbox" screen after an email sign-up or an unverified
// sign-in: the address is shown, and resending waits out a cooldown, since a
// link was sent the moment the screen opened.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const sendVerificationEmail = vi.fn(() =>
  Promise.resolve({ data: { status: true }, error: null })
);

vi.mock('@/integrations/auth/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/integrations/auth/client')>()),
  useAuthClient: () => ({ sendVerificationEmail }),
}));
vi.mock('@/utils/funnel-tracking', () => ({ trackFunnel: vi.fn() }));

const { CheckEmail, RESEND_COOLDOWN_SECONDS } = await import('./check-email');

function renderCheckEmail(props: Partial<Parameters<typeof CheckEmail>[0]>) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <CheckEmail
        email="ada@example.com"
        onBack={() => undefined}
        reason="sign-up"
        {...props}
      />
    </QueryClientProvider>
  );
}

describe('CheckEmail', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sendVerificationEmail.mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test('shows the address and makes the first resend wait', () => {
    const { getByText, getByRole } = renderCheckEmail({});

    expect(getByText('ada@example.com')).toBeTruthy();
    expect(getByRole('heading', { name: 'Check your inbox' })).toBeTruthy();
    const resend = getByRole('button', {
      name: `Resend email in ${RESEND_COOLDOWN_SECONDS}s`,
    });
    expect((resend as HTMLButtonElement).disabled).toBe(true);

    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(
      getByRole('button', {
        name: `Resend email in ${RESEND_COOLDOWN_SECONDS - 20}s`,
      })
    ).toBeTruthy();
  });

  test('resends to the same address once the cooldown is over, then waits again', async () => {
    const { getByRole } = renderCheckEmail({});
    act(() => {
      vi.advanceTimersByTime(RESEND_COOLDOWN_SECONDS * 1000);
    });
    vi.useRealTimers();

    const resend = getByRole('button', { name: 'Resend email' });
    expect((resend as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(resend);

    await waitFor(() =>
      expect(sendVerificationEmail).toHaveBeenCalledWith({
        email: 'ada@example.com',
      })
    );
    await waitFor(() =>
      expect(
        getByRole('button', {
          name: `Resend email in ${RESEND_COOLDOWN_SECONDS}s`,
        })
      ).toBeTruthy()
    );
  });

  test('an unverified sign-in says so and offers the way back', () => {
    const onBack = vi.fn();
    const { getByRole, queryByRole } = renderCheckEmail({
      reason: 'sign-in',
      onBack,
    });

    expect(getByRole('heading', { name: 'Verify your email' })).toBeTruthy();
    expect(queryByRole('link', { name: 'Sign in' })).toBeNull();
    fireEvent.click(getByRole('button', { name: 'Back to sign in' }));
    expect(onBack).toHaveBeenCalled();
  });

  test('an invited sign-up is told it joins the workspace with the link', () => {
    const { getByText } = renderCheckEmail({ organizationName: 'Acme' });

    expect(getByText(/You will join Acme as soon as you open it/)).toBeTruthy();
  });
});
