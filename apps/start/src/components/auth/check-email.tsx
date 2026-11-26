import { useMutation } from '@tanstack/react-query';
import { MailOpenIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { AuthHeading } from './auth-shell';
import { unwrap, useAuthClient } from '@/integrations/auth/client';
import { trackFunnel } from '@/utils/funnel-tracking';

/** A link was just sent when this screen opens, so the first resend waits too. */
export const RESEND_COOLDOWN_SECONDS = 60;
const TICK_MS = 1000;

/** Seconds left before the next resend; `restart` starts the wait again. */
export function useCooldown(seconds: number) {
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
  useEffect(() => {
    if (remaining === 0) {
      return;
    }
    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, [remaining]);
  const restart = useCallback(() => {
    const start = Date.now();
    setNow(start);
    setEndsAt(start + seconds * 1000);
  }, [seconds]);
  return { remaining, restart };
}

interface CheckEmailProps {
  email: string;
  /** `sign-up`: the account was just created. `sign-in`: it exists, unverified. */
  reason: 'sign-up' | 'sign-in';
  /** Back to the form, to fix a typo or try another account. */
  onBack: () => void;
  /** Shown when the sign-up came from an invite, which waits for the link. */
  organizationName?: string;
  signInHref?: string;
}

/** "Check your inbox": the address, a resend with a cooldown, and a way out. */
export function CheckEmail({
  email,
  reason,
  onBack,
  organizationName,
  signInHref = '/login',
}: CheckEmailProps) {
  const authClient = useAuthClient();
  const { remaining, restart } = useCooldown(RESEND_COOLDOWN_SECONDS);
  const mutation = useMutation({
    mutationFn: () => unwrap(authClient.sendVerificationEmail({ email })),
    onSuccess() {
      trackFunnel('auth_verification_resent', { page: reason });
      toast.success('We sent you a new link');
      restart();
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  const signUp = reason === 'sign-up';
  return (
    <div className="col w-full gap-8">
      <AuthHeading
        description={
          <>
            {signUp
              ? 'We sent a verification link to '
              : 'Your email address is not verified yet. We sent a new link to '}
            <span className="font-medium text-foreground">{email}</span>.{' '}
            {signUp
              ? 'Open it to finish creating your account.'
              : 'Open it to sign in.'}
          </>
        }
        title={signUp ? 'Check your inbox' : 'Verify your email'}
      />

      <div className="row items-start gap-3 rounded-xl bg-def-200 p-4">
        <MailOpenIcon className="mt-0.5 shrink-0 text-highlight" size={18} />
        <div className="col gap-0.5">
          <div className="font-medium">The link works for 24 hours</div>
          <p className="text-muted-foreground text-sm">
            {organizationName
              ? `You will join ${organizationName} as soon as you open it. `
              : ''}
            Nothing after a few minutes? Check your spam folder, then send it
            again.
          </p>
        </div>
      </div>

      <Button
        disabled={remaining > 0}
        loading={mutation.isPending}
        onClick={() => mutation.mutate()}
        size="xl"
        type="button"
        variant="secondary"
      >
        {remaining > 0 ? `Resend email in ${remaining}s` : 'Resend email'}
      </Button>

      <div className="col gap-2 text-center text-muted-foreground text-sm">
        <p>
          {signUp ? 'Wrong address? ' : 'Another account? '}
          <button
            className="font-medium text-foreground underline"
            onClick={onBack}
            type="button"
          >
            {signUp ? 'Use a different email' : 'Back to sign in'}
          </button>
        </p>
        {signUp && (
          <p>
            Already verified?{' '}
            <a
              className="font-medium text-foreground underline"
              href={signInHref}
            >
              Sign in
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
