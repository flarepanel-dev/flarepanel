import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { AlertCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { AuthHeading } from '@/components/auth/auth-shell';
import { FullPageErrorState } from '@/components/full-page-error-state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LinkButton } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AuthError, unwrap, useAuthClient } from '@/integrations/auth/client';
import { trackFunnel } from '@/utils/funnel-tracking';
import { createTitle, PAGE_TITLES } from '@/utils/title';

// better-auth's codes for a link it will not accept.
const VERIFY_ERROR_MESSAGES: Record<string, string> = {
  TOKEN_EXPIRED: 'This verification link has expired.',
  INVALID_TOKEN: 'This verification link is not valid.',
  USER_NOT_FOUND: 'The account for this link no longer exists.',
};

export const Route = createFileRoute('/_login/verify-email')({
  head: () => ({
    meta: [
      { title: createTitle(PAGE_TITLES.VERIFY_EMAIL) },
      { name: 'robots', content: 'noindex, follow' },
    ],
  }),
  component: Component,
  validateSearch: z.object({
    token: z.string(),
  }),
  errorComponent: () => (
    <FullPageErrorState description="Missing verification token" />
  ),
});

/**
 * The emailed link lands here. The API verifies the token and starts the
 * session (any invite the sign-up brought is joined then), and the visitor
 * carries on where a new account begins.
 */
function Component() {
  const { token } = Route.useSearch();
  const authClient = useAuthClient();
  const mutation = useMutation({
    mutationFn: () => unwrap(authClient.verifyEmail({ query: { token } })),
    onSuccess() {
      trackFunnel('auth_email_verified');
      toast.success('Email verified');
      window.location.href = '/';
    },
    onError(error) {
      trackFunnel('auth_email_verify_failed', {
        reason: error instanceof AuthError ? error.code : undefined,
      });
    },
  });
  // Once, even when React runs the effect twice.
  const started = useRef(false);
  const { mutate } = mutation;
  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;
    mutate();
  }, [mutate]);

  if (mutation.isError) {
    const code =
      mutation.error instanceof AuthError ? mutation.error.code : undefined;
    return (
      <div className="col w-full gap-8">
        <AuthHeading title="We could not verify your email" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {(code && VERIFY_ERROR_MESSAGES[code]) || mutation.error.message}
          </AlertTitle>
          <AlertDescription>
            Sign in with your email and password and we will send you a new
            link.
          </AlertDescription>
        </Alert>
        <LinkButton href="/login" size="xl">
          Go to sign in
        </LinkButton>
      </div>
    );
  }

  return (
    <div aria-busy className="col w-full items-center gap-4 text-center">
      <Spinner aria-hidden size="md" />
      <p className="text-muted-foreground text-sm" role="status">
        Verifying your email…
      </p>
    </div>
  );
}
