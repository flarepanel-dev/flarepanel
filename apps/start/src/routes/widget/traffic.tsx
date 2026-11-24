import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { curveMonotoneX } from 'd3-shape';
import type React from 'react';
import { z } from 'zod';
import { Area, AreaChart } from '@/components/charts/area-chart';
import { OPChartTooltip } from '@/components/charts/op-tooltip';
import { LogoSquare } from '@/components/logo';
import { SerieIcon } from '@/components/report-chart/common/serie-icon';
import {
  embedSearch,
  MissingWidgetLink,
  sampleTraffic,
  useEmbedTheme,
  useMounted,
} from '@/components/widgets/embed';
import { formatDateInterval } from '@/hooks/use-format-date-interval';
import { useNumber } from '@/hooks/use-numer-formatter';
import { useTRPC } from '@/integrations/trpc/react';
import type { RouterOutputs } from '@/trpc/client';
import { cn } from '@/utils/cn';
import { getChartColor } from '@/utils/theme';

type TrafficData = RouterOutputs['widget']['trafficData'];
type Point = TrafficData['series'][number] & { [key: string]: unknown };

const DEFAULT_COLOR = getChartColor(0);
const NO_MARGIN = { top: 4, right: 0, bottom: 0, left: 0 };
const FILL_OPACITY = 0.25;
const TOOLTIP_MIN_WIDTH = 140;

const widgetSearchSchema = z.object({
  ...embedSearch,
  // Demo previews only: the sample's range and lists.
  range: z.enum(['7d', '30d']).optional().catch(undefined),
  pages: z.boolean().optional().catch(undefined),
  referrers: z.boolean().optional().catch(undefined),
});

export const Route = createFileRoute('/widget/traffic')({
  errorComponent: MissingWidgetLink,
  component: RouteComponent,
  validateSearch: widgetSearchSchema,
});

function RouteComponent() {
  const { shareId, demo, theme } = Route.useSearch();
  useEmbedTheme(theme);
  if (demo) {
    return <DemoTraffic />;
  }
  if (!shareId) {
    return <MissingWidgetLink />;
  }
  return <LiveTraffic shareId={shareId} />;
}

function DemoTraffic() {
  const { color, range, pages, referrers } = Route.useSearch();
  const mounted = useMounted();
  if (!mounted) {
    return <TrafficSkeleton />;
  }
  const sample = sampleTraffic(range ?? '30d');
  return (
    <TrafficView
      color={color}
      data={{
        ...sample,
        pages: pages === false ? [] : sample.pages,
        referrers: referrers === false ? [] : sample.referrers,
      }}
    />
  );
}

function LiveTraffic({ shareId }: { shareId: string }) {
  const { color } = Route.useSearch();
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.widget.trafficData.queryOptions({ shareId })
  );
  if (isLoading) {
    return <TrafficSkeleton />;
  }
  if (!data) {
    return (
      <div className="center-center col flex h-screen w-full bg-background p-4 text-foreground">
        <LogoSquare className="mb-4 size-10" />
        <h1 className="font-semibold text-xl">Widget not found</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          This widget is not available or has been removed.
        </p>
      </div>
    );
  }
  return <TrafficView color={color} data={data} />;
}

const formatDay = (date: Date) =>
  formatDateInterval({ interval: 'day', date, short: true });

function TrafficView({
  data,
  color,
}: {
  data: TrafficData;
  color: string | undefined;
}) {
  const number = useNumber();
  const stroke = color || DEFAULT_COLOR;
  const first = data.series[0]?.date;
  const last = data.series.at(-1)?.date;
  const lists = [data.pages.length > 0, data.referrers.length > 0].filter(
    Boolean
  ).length;

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <div className="p-6 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 font-medium text-muted-foreground text-sm">
            LAST {data.range === '7d' ? '7' : '30'} DAYS
          </div>
          {data.project.domain && <SerieIcon name={data.project.domain} />}
        </div>
        <div className="mt-2 flex items-end gap-8">
          <Stat label="Visitors" value={number.short(data.visitors)} />
          <Stat label="Pageviews" value={number.short(data.pageviews)} />
        </div>
        <div className="mt-4 flex h-24 w-full flex-col">
          <div className="min-h-0 flex-1">
            <AreaChart
              animationDuration={0}
              aspectRatio="auto"
              className="h-full"
              data={data.series as Point[]}
              formatDateLabel={formatDay}
              margin={NO_MARGIN}
              xDataKey="date"
            >
              <Area
                animate={false}
                curve={curveMonotoneX}
                dataKey="visitors"
                fill={stroke}
                fillOpacity={FILL_OPACITY}
                stroke={stroke}
              />
              <OPChartTooltip<Point>
                interval="day"
                minWidth={TOOLTIP_MIN_WIDTH}
                rows={(point) => [
                  {
                    color: stroke,
                    label: 'Visitors',
                    value: point.visitors,
                    format: number.format,
                  },
                ]}
                showCrosshair
                showDots
              />
            </AreaChart>
          </div>
          <div className="row justify-between pt-1 text-2xs text-muted-foreground">
            <span>{first ? formatDay(new Date(first)) : null}</span>
            <span>{last ? formatDay(new Date(last)) : null}</span>
          </div>
        </div>
      </div>

      {lists > 0 && (
        <div className="hide-scrollbar flex-1 overflow-auto border-t p-6">
          <div
            className={cn(
              'grid grid-cols-1 gap-6',
              lists === 2 && 'sm:grid-cols-2'
            )}
          >
            {data.pages.length > 0 && (
              <List title="TOP PAGES">
                {data.pages.map((row) => (
                  <Row count={row.count} key={row.path}>
                    <span className="truncate text-sm">{row.path}</span>
                  </Row>
                ))}
              </List>
            )}
            {data.referrers.length > 0 && (
              <List title="TOP SOURCES">
                {data.referrers.map((row) => (
                  <Row count={row.count} key={row.referrer}>
                    <div className="flex min-w-0 items-center gap-2">
                      <SerieIcon name={row.referrer} />
                      <span className="truncate text-sm">{row.referrer}</span>
                    </div>
                  </Row>
                ))}
              </List>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-bold text-4xl tabular-nums">{value}</div>
      <div className="text-muted-foreground text-xs">{label}</div>
    </div>
  );
}

function List({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="mb-3 font-medium text-muted-foreground text-xs">
        {title}
      </div>
      <div className="col">{children}</div>
    </div>
  );
}

function Row({
  children,
  count,
}: {
  children: React.ReactNode;
  count: number;
}) {
  const number = useNumber();
  return (
    <div className="-mx-3 flex h-10 items-center justify-between gap-3 border-b px-3 py-2 text-sm hover:bg-foreground/5">
      {children}
      <span className="shrink-0 font-semibold">{number.short(count)}</span>
    </div>
  );
}

const SKELETON_HEIGHTS = [
  40, 52, 46, 60, 38, 30, 55, 62, 58, 66, 48, 40, 64, 70, 68, 74, 56, 50, 72,
  78,
];

function TrafficSkeleton() {
  return (
    <div className="flex h-screen w-full animate-pulse flex-col bg-background p-6 text-foreground">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="mt-4 flex gap-8">
        <div className="h-10 w-20 rounded bg-muted" />
        <div className="h-10 w-20 rounded bg-muted" />
      </div>
      <div className="mt-4 flex h-24 items-end gap-1">
        {SKELETON_HEIGHTS.map((height, index) => (
          <div
            className="w-full rounded bg-muted"
            key={index.toString()}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}
