import type { IBotStats } from '@flarepanel/core/modules/event/event.constants';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
  BadgeCheckIcon,
  BookOpenIcon,
  RadarIcon,
  RotateCwIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useId, useState } from 'react';
import { AiVisibility } from '@/components/bots/ai-visibility';
import {
  BOTS_DOCS_URL,
  botGroupColor,
  botGroupLabel,
  botUsageNotice,
  botVerifiedFilter,
  displayBotPath,
  isBotsPageEmpty,
  toBotChartData,
} from '@/components/bots/bot-stats';
import { BotsChart } from '@/components/bots/bots-chart';
import { EmptyState } from '@/components/empty-state';
import { OverviewMetricCard } from '@/components/overview/overview-metric-card';
import { OverviewRange } from '@/components/overview/overview-range';
import { OverviewWidgetTable } from '@/components/overview/overview-widget-table';
import { useOverviewOptions } from '@/components/overview/useOverviewOptions';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { Skeleton } from '@/components/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, LinkButton } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTRPC } from '@/integrations/trpc/react';
import { formatTimeAgoOrDateTime } from '@/utils/date';
import { createProjectTitle, PAGE_TITLES } from '@/utils/title';

export const Route = createFileRoute('/_app/$organizationId/$projectId/bots')({
  component: Component,
  head: () => ({
    meta: [{ title: createProjectTitle(PAGE_TITLES.BOTS) }],
  }),
});

const RECENT_PAGE_SIZE = 20;
const TITLE = 'Bots & AI crawlers';
const DESCRIPTION =
  'AI crawlers, assistants and search bots that fetched your pages, grouped by what they fetched for. Kept for 30 days and never counted as events.';

const KPIS = [
  { id: 'total', label: 'All bot hits' },
  { id: 'answers', label: 'AI answers' },
  { id: 'indexing', label: 'AI search indexing' },
  { id: 'training', label: 'AI training' },
  { id: 'search', label: 'Search engines' },
] as const;

function Component() {
  const { projectId } = Route.useParams();
  const trpc = useTRPC();
  const { range, startDate, endDate } = useOverviewOptions();
  const [recentPage, setRecentPage] = useState(0);
  // Null until the user picks: verified only once the period has any.
  const [verifiedOnly, setVerifiedOnly] = useState<boolean | null>(null);

  const statsQuery = useQuery(
    trpc.event.botStats.queryOptions(
      {
        projectId,
        range,
        startDate,
        endDate,
        verified: botVerifiedFilter(verifiedOnly),
      },
      { placeholderData: keepPreviousData }
    )
  );
  const recentQuery = useQuery(
    trpc.event.bots.queryOptions(
      { projectId, cursor: recentPage, limit: RECENT_PAGE_SIZE },
      { placeholderData: keepPreviousData }
    )
  );

  const stats = statsQuery.data;
  const isLoading = statsQuery.isLoading || recentQuery.isLoading;
  const header = (
    <PageHeader
      actions={
        <div className="flex flex-wrap items-center gap-4">
          <VerifiedToggle
            checked={stats?.verifiedOnly ?? false}
            hasVerified={(stats?.verifiedHits ?? 0) > 0}
            onChange={setVerifiedOnly}
          />
          <OverviewRange />
        </div>
      }
      description={DESCRIPTION}
      title={TITLE}
    />
  );
  const notice = botUsageNotice(stats?.usage);

  if (statsQuery.isError) {
    return (
      <PageContainer>
        {header}
        <EmptyState
          className="mt-8"
          description="We could not load bot traffic. Try again in a moment."
          icon={RadarIcon}
          title="Bot traffic is unavailable"
        >
          <Button
            icon={RotateCwIcon}
            loading={statsQuery.isFetching}
            onClick={() => statsQuery.refetch()}
            variant="outline"
          >
            Try again
          </Button>
        </EmptyState>
      </PageContainer>
    );
  }

  if (
    !isLoading &&
    isBotsPageEmpty({ stats, recentCount: recentQuery.data?.count })
  ) {
    return (
      <PageContainer>
        {header}
        <EmptyState
          className="mt-8"
          description="AI crawlers such as GPTBot, ClaudeBot and PerplexityBot, and search bots like Googlebot, fetch your HTML without running JavaScript, so the FlarePanel script never sees them. Report page requests from your server or edge (a Cloudflare Worker, Next.js middleware) and they show up here."
          icon={RadarIcon}
          title="No bot traffic yet"
        >
          <LinkButton href={BOTS_DOCS_URL} icon={BookOpenIcon} target="_blank">
            Set up crawler tracking
          </LinkButton>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {header}
      <div className="mt-8 space-y-8">
        {notice && (
          <Alert variant={notice.level === 'capped' ? 'warning' : 'default'}>
            <TriangleAlertIcon className="size-4" />
            <AlertTitle>{notice.title}</AlertTitle>
            <AlertDescription>{notice.description}</AlertDescription>
          </Alert>
        )}
        <BotKpis isLoading={statsQuery.isLoading} range={range} stats={stats} />
        <BotsChart
          isLoading={statsQuery.isLoading}
          series={stats?.series ?? []}
        />
        <AiVisibility
          isLoading={statsQuery.isLoading}
          projectId={projectId}
          stats={stats}
        />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <TopBotsTable isLoading={statsQuery.isLoading} stats={stats} />
          <TopPathsTable isLoading={statsQuery.isLoading} stats={stats} />
        </div>
        <RecentHits
          count={recentQuery.data?.count ?? 0}
          isLoading={recentQuery.isLoading}
          onPageChange={setRecentPage}
          page={recentPage}
          rows={recentQuery.data?.data ?? []}
        />
        <p className="text-muted-foreground text-xs">
          The FlarePanel script cannot see crawlers, which never run JavaScript.{' '}
          <a
            className="underline underline-offset-2 hover:text-foreground"
            href={BOTS_DOCS_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            Report them from your server or edge
          </a>
          .
        </p>
      </div>
    </PageContainer>
  );
}

function VerifiedToggle({
  checked,
  hasVerified,
  onChange,
}: {
  checked: boolean;
  hasVerified: boolean;
  onChange: (verifiedOnly: boolean) => void;
}) {
  const id = useId();
  return (
    <div
      className="flex items-center gap-2"
      title={
        hasVerified
          ? 'Only hits your edge verified as the real crawler (Cloudflare verified bots)'
          : 'No verified hits in this period. Cloudflare Workers can send them: see the setup guide.'
      }
    >
      <Switch
        checked={checked}
        disabled={!(hasVerified || checked)}
        id={id}
        onCheckedChange={onChange}
      />
      <Label className="mb-0 cursor-pointer text-sm" htmlFor={id}>
        Verified only
      </Label>
    </div>
  );
}

function BotKpis({
  stats,
  isLoading,
  range,
}: {
  stats: IBotStats | undefined;
  isLoading: boolean;
  range: ReturnType<typeof useOverviewOptions>['range'];
}) {
  const points = toBotChartData(stats?.series ?? []);
  return (
    <div className="card grid grid-cols-2 overflow-hidden rounded-md md:grid-cols-3 lg:grid-cols-5">
      {KPIS.map((kpi) => (
        <OverviewMetricCard
          data={points.map((point) => ({
            current: point[kpi.id],
            date: point.date,
          }))}
          id={`bots-${kpi.id}`}
          interval="day"
          isLoading={isLoading}
          key={kpi.id}
          label={kpi.label}
          metric={{ current: stats?.totals[kpi.id] ?? 0, previous: null }}
          range={range}
        />
      ))}
    </div>
  );
}

function CardHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
      <h3 className="font-medium text-sm">{title}</h3>
      {children}
    </div>
  );
}

const LOADING_ROWS = [1, 2, 3, 4, 5];

function LoadingTable({ label }: { label: string }) {
  return (
    <OverviewWidgetTable
      columns={[
        {
          name: label,
          width: 'w-full',
          render: () => <Skeleton className="h-4 w-2/3" />,
        },
        {
          name: 'Hits',
          width: '70px',
          render: () => <Skeleton className="h-4 w-10" />,
        },
      ]}
      data={LOADING_ROWS}
      getColumnPercentage={() => 0}
      keyExtractor={String}
    />
  );
}

function EmptyRows({ message }: { message: string }) {
  return (
    <p className="px-4 py-10 text-center text-muted-foreground text-xs">
      {message}
    </p>
  );
}

function TopBotsTable({
  stats,
  isLoading,
}: {
  stats: IBotStats | undefined;
  isLoading: boolean;
}) {
  const rows = stats?.topBots ?? [];
  const maxHits = Math.max(...rows.map((row) => row.hits), 1);
  return (
    <div className="card overflow-hidden">
      <CardHeader title="Bots" />
      {isLoading && <LoadingTable label="Bot" />}
      {!isLoading && rows.length === 0 && (
        <EmptyRows message="No bots in this period" />
      )}
      {!isLoading && rows.length > 0 && (
        <OverviewWidgetTable
          columns={[
            {
              name: 'Bot',
              width: 'w-full',
              render: (row) => (
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-sm"
                    style={{ backgroundColor: botGroupColor(row.group) }}
                    title={botGroupLabel(row.group)}
                  />
                  <span className="truncate font-medium">{row.name}</span>
                  {row.verifiedHits > 0 && (
                    <BadgeCheckIcon
                      aria-label="Verified"
                      className="size-3.5 shrink-0 text-emerald-600"
                    />
                  )}
                  <span
                    className="truncate text-muted-foreground"
                    title={`Detected as: ${row.category}`}
                  >
                    {botGroupLabel(row.group)} · {row.category}
                  </span>
                </div>
              ),
            },
            {
              name: 'Hits',
              width: '70px',
              getSortValue: (row) => row.hits,
              render: (row) => (
                <span className="font-semibold tabular-nums">
                  {row.hits.toLocaleString()}
                </span>
              ),
            },
            {
              name: 'Last seen',
              width: '110px',
              getSortValue: (row) => row.lastSeen,
              render: (row) => (
                <span className="text-muted-foreground">
                  {formatTimeAgoOrDateTime(new Date(row.lastSeen))}
                </span>
              ),
            },
          ]}
          data={rows}
          getColumnPercentage={(row) => row.hits / maxHits}
          keyExtractor={(row) => `${row.name}:${row.category}`}
        />
      )}
    </div>
  );
}

function TopPathsTable({
  stats,
  isLoading,
}: {
  stats: IBotStats | undefined;
  isLoading: boolean;
}) {
  const rows = stats?.topPaths ?? [];
  const maxHits = Math.max(...rows.map((row) => row.hits), 1);
  return (
    <div className="card overflow-hidden">
      <CardHeader title="Crawled pages" />
      {isLoading && <LoadingTable label="Path" />}
      {!isLoading && rows.length === 0 && (
        <EmptyRows message="No crawled pages in this period" />
      )}
      {!isLoading && rows.length > 0 && (
        <OverviewWidgetTable
          columns={[
            {
              name: 'Path',
              width: 'w-full',
              render: (row) => (
                <div className="min-w-0">
                  <div className="truncate font-medium" title={row.path}>
                    {row.path}
                  </div>
                  <div className="truncate text-muted-foreground">
                    {row.bots.map((bot) => bot.name).join(', ')}
                  </div>
                </div>
              ),
            },
            {
              name: 'Hits',
              width: '70px',
              getSortValue: (row) => row.hits,
              render: (row) => (
                <span className="font-semibold tabular-nums">
                  {row.hits.toLocaleString()}
                </span>
              ),
            },
            {
              name: '4xx',
              width: '50px',
              getSortValue: (row) => row.status['4xx'],
              render: (row) => <StatusCount value={row.status['4xx']} />,
            },
            {
              name: '5xx',
              width: '50px',
              getSortValue: (row) => row.status['5xx'],
              render: (row) => <StatusCount value={row.status['5xx']} />,
            },
            {
              name: 'Last seen',
              width: '110px',
              getSortValue: (row) => row.lastSeen,
              render: (row) => (
                <span className="text-muted-foreground">
                  {formatTimeAgoOrDateTime(new Date(row.lastSeen))}
                </span>
              ),
            },
          ]}
          data={rows}
          getColumnPercentage={(row) => row.hits / maxHits}
          keyExtractor={(row) => row.path}
        />
      )}
    </div>
  );
}

function StatusCount({ value }: { value: number }) {
  return (
    <span
      className={
        value > 0
          ? 'font-medium text-destructive tabular-nums'
          : 'text-muted-foreground tabular-nums'
      }
    >
      {value.toLocaleString()}
    </span>
  );
}

interface RecentHit {
  id: string;
  name: string;
  type: string;
  path: string;
  createdAt: Date | string;
  status?: number | null;
  verified?: boolean | null;
}

function RecentHits({
  rows,
  count,
  page,
  isLoading,
  onPageChange,
}: {
  rows: RecentHit[];
  count: number;
  page: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.max(Math.ceil(count / RECENT_PAGE_SIZE), 1);
  return (
    <div className="card overflow-hidden">
      <CardHeader title="Latest hits">
        {count > RECENT_PAGE_SIZE && (
          <Pagination
            canNextPage={page < pageCount - 1}
            canPreviousPage={page > 0}
            nextPage={() => onPageChange(Math.min(page + 1, pageCount - 1))}
            pageIndex={page}
            previousPage={() => onPageChange(Math.max(page - 1, 0))}
          />
        )}
      </CardHeader>
      {isLoading && (
        <div className="space-y-2 p-4">
          {LOADING_ROWS.map((row) => (
            <Skeleton className="h-5 w-full" key={row} />
          ))}
        </div>
      )}
      {!isLoading && rows.length === 0 && (
        <EmptyRows message="No bot hits kept yet" />
      )}
      {!isLoading && rows.length > 0 && (
        <ul className="divide-y text-xs">
          {rows.map((row) => (
            <li className="flex items-center gap-3 px-4 py-2.5" key={row.id}>
              <span className="w-32 shrink-0 truncate font-medium">
                {row.name}
              </span>
              <span className="hidden w-36 shrink-0 truncate text-muted-foreground sm:block">
                {row.type}
              </span>
              <span className="min-w-0 flex-1 truncate" title={row.path}>
                {displayBotPath(row.path)}
              </span>
              {row.verified && (
                <BadgeCheckIcon
                  aria-label="Verified"
                  className="size-3.5 shrink-0 text-emerald-600"
                />
              )}
              {row.status != null && (
                <span
                  className={
                    row.status >= 400
                      ? 'shrink-0 font-medium text-destructive tabular-nums'
                      : 'shrink-0 text-muted-foreground tabular-nums'
                  }
                >
                  {row.status}
                </span>
              )}
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {formatTimeAgoOrDateTime(new Date(row.createdAt))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
