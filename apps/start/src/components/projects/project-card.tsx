import type { IServiceProject } from '@flarepanel/core';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { SettingsIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { FadeIn } from '../fade-in';
import { SerieIcon } from '../report-chart/common/serie-icon';
import { Skeleton } from '../skeleton';
import { LinkButton } from '../ui/button';
import { ProjectChart } from './project-chart';
import { useNumber } from '@/hooks/use-numer-formatter';
import { useTRPC } from '@/integrations/trpc/react';
import { cn } from '@/utils/cn';

export function ProjectCardRoot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'card relative hover:z-10 hover:-translate-y-px hover:shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <ProjectCardRoot className="col h-[250px] gap-4 p-5">
      <div className="row items-center gap-3">
        <Skeleton className="size-9 rounded-lg" />
        <Skeleton className="h-5 w-40" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="mt-auto h-3 w-1/2" />
    </ProjectCardRoot>
  );
}

/** `https://www.acme.com/` → `acme.com`. */
export function displayDomain(domain: string | null | undefined): string {
  return (domain ?? '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

function ProjectCard({ id, domain, name, organizationId }: IServiceProject) {
  const host = displayDomain(domain);
  return (
    <ProjectCardRoot className="group overflow-hidden transition-[transform,box-shadow,border-color] hover:border-foreground/20">
      <Link
        className="col h-full p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        params={{
          organizationId,
          projectId: id,
        }}
        to="/$organizationId/$projectId"
      >
        <div className="row items-center gap-3 pr-10">
          <div className="center-center size-9 shrink-0 rounded-lg border bg-def-100">
            {domain ? (
              <SerieIcon name={domain} />
            ) : (
              <span className="font-semibold text-muted-foreground text-sm">
                {name.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium leading-tight">{name}</div>
            <div className="truncate text-muted-foreground text-sm">
              {host || 'No domain'}
            </div>
          </div>
        </div>
        <ProjectHeadline id={id} />
        <div className="-mx-5 mt-2 mb-4 h-16">
          <ProjectChartOuter id={id} />
        </div>
        <ProjectMetrics id={id} />
      </Link>
      <LinkButton
        aria-label={`Settings for ${name}`}
        className="absolute top-3 right-3 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
        href={`/${organizationId}/${id}/settings`}
        size="icon"
        variant="ghost"
      >
        <SettingsIcon size={16} />
      </LinkButton>
    </ProjectCardRoot>
  );
}

/** The number the card leads with: visitors in the last 30 days, and whether data is arriving. */
function ProjectHeadline({ id }: { id: string }) {
  const number = useNumber();
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.chart.projectCard.queryOptions({
      projectId: id,
    })
  );
  const today = data?.metrics?.day ?? 0;
  const hasAny = (data?.metrics?.months_3 ?? 0) > 0;

  return (
    <div className="row mt-5 items-end justify-between gap-4">
      <div>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="font-semibold text-2xl tabular-nums leading-none">
            {number.short(data?.metrics?.month ?? 0)}
          </div>
        )}
        <div className="mt-1.5 text-muted-foreground text-sm">
          visitors in the last 30 days
        </div>
      </div>
      {!isLoading && (
        <div
          className={cn(
            'row shrink-0 items-center gap-1.5 text-sm',
            today > 0 ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          <span
            className={cn(
              'size-2 rounded-full',
              today > 0 ? 'bg-emerald-500' : 'bg-muted-foreground/40'
            )}
          />
          {today > 0
            ? `${number.short(today)} today`
            : hasAny
              ? 'Quiet today'
              : 'Waiting for first event'}
        </div>
      )}
    </div>
  );
}

function ProjectChartOuter({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.chart.projectCard.queryOptions({
      projectId: id,
    })
  );

  return (
    <FadeIn className="h-full w-full">
      <ProjectChart data={data?.chart || []} />
    </FadeIn>
  );
}

function Metric({
  value,
  label,
  className,
}: {
  value: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn('row items-center gap-1.5 text-sm', className)}>
      <span className="whitespace-nowrap font-medium tabular-nums">
        {value}
      </span>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}

function ProjectMetrics({ id }: { id: string }) {
  const number = useNumber();
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.chart.projectCard.queryOptions({
      projectId: id,
    })
  );

  return (
    <FadeIn className="row mt-auto flex-wrap items-center gap-x-5 gap-y-1 border-t pt-3">
      <Metric
        label="Last 3 months"
        value={number.short(data?.metrics?.months_3 ?? 0)}
      />
      {typeof data?.trend?.percentage === 'number' && (
        <Metric
          label="vs. the 3 months before"
          value={
            <span
              className={cn(
                'row items-center gap-1',
                data?.trend?.direction === 'up'
                  ? 'text-emerald-500'
                  : data?.trend?.direction === 'down'
                    ? 'text-orange-400'
                    : 'text-muted-foreground'
              )}
            >
              {data.trend.direction === 'up' && (
                <TrendingUpIcon className="size-4" />
              )}
              {data.trend.direction === 'down' && (
                <TrendingDownIcon className="size-4" />
              )}
              {Math.abs(data.trend.percentage)}%
            </span>
          }
        />
      )}
      {!!data?.metrics?.revenue && (
        <Metric
          className="ml-auto"
          label="Revenue"
          value={number.currency(data?.metrics?.revenue / 100, {
            short: true,
          })}
        />
      )}
    </FadeIn>
  );
}

export default ProjectCard;
