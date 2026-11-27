import { useAppContext } from '@/hooks/use-app-context';

/** True on FlarePanel Cloud, whose terms and privacy policy live on flarepanel.dev. */
export function isFlarePanelCloud(dashboardUrl: string | undefined): boolean {
  try {
    return new URL(dashboardUrl ?? '').hostname.endsWith('flarepanel.dev');
  } catch {
    return false;
  }
}

function LegalLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      className="underline hover:text-foreground"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

/**
 * FlarePanel Cloud's terms and privacy links on the sign-in and sign-up
 * pages. Self-hosted installs have their own terms, so nothing shows there.
 */
export function AuthLegalLinks({ signUp = false }: { signUp?: boolean }) {
  const { dashboardUrl } = useAppContext();
  if (!isFlarePanelCloud(dashboardUrl)) {
    return null;
  }
  const terms = (
    <LegalLink href="https://flarepanel.dev/terms">Terms of Service</LegalLink>
  );
  const privacy = (
    <LegalLink href="https://flarepanel.dev/privacy">Privacy Policy</LegalLink>
  );
  return (
    <p className="text-center text-muted-foreground text-xs leading-relaxed">
      {signUp ? (
        <>
          By creating an account you agree to the {terms} and {privacy}.
        </>
      ) : (
        <>
          {terms} · {privacy} ·{' '}
          <LegalLink href="https://flarepanel.dev/refunds">
            Refund policy
          </LegalLink>
        </>
      )}
    </p>
  );
}
