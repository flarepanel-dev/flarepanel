import {
  createFileRoute,
  Outlet,
  useLocation,
  useRouter,
} from '@tanstack/react-router';
import type React from 'react';
import FullPageLoadingState from '@/components/full-page-loading-state';
import { PageHeader } from '@/components/page-header';
import { PROJECT_SETTINGS_TABS } from '@/components/settings/settings-tabs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/hooks/use-app-context';
import { cn } from '@/utils/cn';
import { createProjectTitle, PAGE_TITLES } from '@/utils/title';

export const Route = createFileRoute(
  '/_app/$organizationId/$projectId/settings/_tabs'
)({
  component: ProjectDashboard,
  head: () => {
    return {
      meta: [
        {
          title: createProjectTitle(PAGE_TITLES.SETTINGS),
        },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const { trpc, queryClient } = context;
    await queryClient.prefetchQuery(
      trpc.project.getProjectWithClients.queryOptions({
        projectId: params.projectId,
      })
    );
  },
  pendingComponent: FullPageLoadingState,
});

function ProjectDashboard() {
  const router = useRouter();
  const location = useLocation();
  const tab = location.pathname.split('/').pop();
  const { isSelfHosted } = useAppContext();
  // The coloured tabs and card accents are the hosted edition's
  // look; self-hosted installs keep the plain settings.
  const hosted = !isSelfHosted;
  const active = PROJECT_SETTINGS_TABS.find((item) => item.id === tab);

  const handleTabChange = (tabId: string) => {
    router.navigate({
      from: Route.fullPath,
      to: `/$organizationId/$projectId/settings/${tabId}`,
    });
  };

  return (
    <div
      className="container p-8"
      data-edition={hosted ? 'hosted' : 'self-hosted'}
      style={
        active
          ? ({ '--tab-accent': active.accent } as React.CSSProperties)
          : undefined
      }
    >
      <PageHeader
        description="Manage your project settings here"
        title="Project settings"
      />

      <Tabs className="mt-2 mb-8" onValueChange={handleTabChange} value={tab}>
        <TabsList className="hide-scrollbar max-w-full overflow-x-auto">
          {PROJECT_SETTINGS_TABS.map((item) => (
            <TabsTrigger
              className={cn(
                hosted && 'data-[state=active]:border-(--item-accent)'
              )}
              key={item.id}
              style={{ '--item-accent': item.accent } as React.CSSProperties}
              value={item.id}
            >
              <span className="flex items-center gap-1.5">
                {hosted && (
                  <item.icon
                    aria-hidden
                    className="size-3.5 shrink-0 text-(--item-accent)"
                  />
                )}
                {item.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="settings-tab-body">
        <Outlet />
      </div>
    </div>
  );
}
