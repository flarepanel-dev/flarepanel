import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

const STUCK_CHECK_MS = 1000;
/** Seconds of "nothing loading, yet a route still pending" before acting. */
const STUCK_INVALIDATE_AFTER = 3;
const STUCK_RELOAD_AFTER = 7;
const RELOAD_KEY = 'flarepanel:stuck-reload-at';
const RELOAD_GAP_MS = 30_000;

/**
 * Sometimes a client-side navigation leaves a tabs layout route `pending`
 * after every loader has settled (the router is no longer loading, nothing
 * is fetching), so its loading screen never goes away. Seen on Events and
 * Profiles in production, not reproducible on demand. When that exact state
 * lasts, re-run the route matches; if it still lasts, reload the page once.
 * A slow but real load (router still loading) is never touched.
 */
function useRecoverStuckNavigation() {
  const router = useRouter({ warn: false });
  useEffect(() => {
    if (!router || typeof window === 'undefined') {
      return;
    }
    let stuckFor = 0;
    const timer = window.setInterval(() => {
      const { isLoading, matches } = router.state;
      const stuck =
        !isLoading &&
        matches.some(
          (match) => match.status === 'pending' && !match.isFetching
        );
      stuckFor = stuck ? stuckFor + 1 : 0;
      if (stuckFor === STUCK_INVALIDATE_AFTER) {
        router.invalidate();
      }
      if (stuckFor >= STUCK_RELOAD_AFTER) {
        window.clearInterval(timer);
        const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
        if (Date.now() - last > RELOAD_GAP_MS) {
          sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
          window.location.reload();
        }
      }
    }, STUCK_CHECK_MS);
    return () => window.clearInterval(timer);
  }, [router]);
}

const FullPageLoadingState = ({ title = 'Loading…' }: { title?: string }) => {
  useRecoverStuckNavigation();
  return (
    <div
      aria-busy
      className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-3 p-8 text-center lg:min-h-dvh"
    >
      <Spinner aria-hidden size="md" />
      <p className="text-muted-foreground text-sm" role="status">
        {title}
      </p>
    </div>
  );
};

export default FullPageLoadingState;
