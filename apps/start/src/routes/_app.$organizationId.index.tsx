import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { FolderPlusIcon, PlusIcon, SearchXIcon } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import FullPageLoadingState from '@/components/full-page-loading-state';
import { LazyComponent } from '@/components/lazy-component';
import { PageHeader } from '@/components/page-header';
import ProjectCard, {
  ProjectCardSkeleton,
} from '@/components/projects/project-card';
import { Button } from '@/components/ui/button';
import { AnimatedSearchInput } from '@/components/ui/data-table/data-table-toolbar';
import { useOrganizationAccess } from '@/hooks/use-organization-access';
import { useSearchQueryState } from '@/hooks/use-search-query-state';
import { useTRPC } from '@/integrations/trpc/react';
import { pushModal } from '@/modals';
import { createOrganizationTitle, PAGE_TITLES } from '@/utils/title';

export const Route = createFileRoute('/_app/$organizationId/')({
  component: OrganizationPage,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.project.list.queryOptions({
        organizationId: params.organizationId,
      })
    );
  },
  pendingComponent: FullPageLoadingState,
  head: () => {
    return {
      meta: [
        {
          title: createOrganizationTitle(PAGE_TITLES.PROJECTS),
        },
      ],
    };
  },
});

function OrganizationPage() {
  const { organizationId } = Route.useParams();
  const trpc = useTRPC();
  const { data: projects } = useQuery(
    trpc.project.list.queryOptions({
      organizationId,
    })
  );
  const { isAdmin } = useOrganizationAccess(organizationId);
  const { setSearch, search } = useSearchQueryState();

  if (!projects?.length) {
    return (
      <div className="container p-8">
        <PageHeader
          className="mb-8"
          description="All your projects in this workspace"
          title="Projects"
        />
        <EmptyState
          description={
            isAdmin
              ? 'A project holds the data for one website or app. Create one, install the SDK, and your first events show up within minutes.'
              : "You don't have access to any projects in this workspace yet. Ask an admin to add you to one."
          }
          icon={FolderPlusIcon}
          title={isAdmin ? 'Create your first project' : 'No projects yet'}
        >
          {isAdmin && (
            <Button icon={PlusIcon} onClick={() => pushModal('AddProject')}>
              Create project
            </Button>
          )}
        </EmptyState>
      </div>
    );
  }

  const visible = projects.filter(
    (project) =>
      !search || project.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container p-8">
      <PageHeader
        actions={
          <>
            <AnimatedSearchInput
              onChange={setSearch}
              placeholder="Search projects"
              value={search}
            />
            {isAdmin && (
              <Button icon={PlusIcon} onClick={() => pushModal('AddProject')}>
                New project
              </Button>
            )}
          </>
        }
        className="mb-6 items-center"
        description={`${projects.length} ${projects.length === 1 ? 'project' : 'projects'} in this workspace. Open one to see its analytics.`}
        title="Projects"
      />

      {visible.length === 0 ? (
        <EmptyState
          description={`No project is called "${search}".`}
          icon={SearchXIcon}
          title="Nothing found"
        >
          <Button onClick={() => setSearch('')} variant="outline">
            Clear search
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {visible.map((project, index) => (
            <LazyComponent
              fallback={<ProjectCardSkeleton />}
              key={project.id}
              lazy={index >= 6}
            >
              <ProjectCard {...project} organizationId={organizationId} />
            </LazyComponent>
          ))}
          {isAdmin && !search && (
            <button
              className="col center-center min-h-[250px] gap-2 rounded-md border border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-def-100 hover:text-foreground"
              onClick={() => pushModal('AddProject')}
              type="button"
            >
              <PlusIcon className="size-5" />
              <span className="font-medium">Add another website or app</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
