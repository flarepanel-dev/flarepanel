import { createRouter as createTanstackRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { CompassIcon } from 'lucide-react';
import * as TanstackQuery from './integrations/tanstack-query/root-provider';
import { routeTree } from './routeTree.gen';
import { getServerEnvs } from './server/get-envs';
import { EmptyState } from '@/components/empty-state';
import { LinkButton } from '@/components/ui/button';

const PRELOAD_RELOAD_KEY = 'flarepanel:preload-reload-at';
const PRELOAD_RELOAD_GAP_MS = 10_000;

/**
 * A tab opened before a dashboard deploy asks for route chunks the new
 * deploy no longer serves; the import fails and the route can stay on its
 * loading screen. Reload once to fetch the current build (not again within
 * a few seconds, so a real outage cannot loop).
 */
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    const last = Number(sessionStorage.getItem(PRELOAD_RELOAD_KEY) ?? 0);
    if (Date.now() - last < PRELOAD_RELOAD_GAP_MS) {
      return;
    }
    event.preventDefault();
    sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(Date.now()));
    window.location.reload();
  });
}

export const getRouter = async () => {
  const envs = await getServerEnvs();
  const rqContext = TanstackQuery.getContext(envs.apiUrl);

  const router = createTanstackRouter({
    scrollRestoration: true,
    routeTree,
    context: {
      ...rqContext,
      ...envs,
      session: {
        session: null,
        user: null,
        userId: null,
      },
    },
    defaultPreload: 'intent',
    defaultNotFoundComponent: () => (
      <EmptyState
        description="The page you're looking for doesn't exist or has moved."
        icon={CompassIcon}
        title="Page not found"
        variant="page"
      >
        <LinkButton href="/">Go to home</LinkButton>
      </EmptyState>
    ),
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        <TanstackQuery.Provider {...rqContext} apiUrl={envs.apiUrl}>
          {props.children}
        </TanstackQuery.Provider>
      );
    },
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient: rqContext.queryClient,
  });

  return router;
};

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
