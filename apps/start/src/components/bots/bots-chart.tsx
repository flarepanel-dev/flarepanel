import type { IBotStats } from '@flarepanel/core/modules/event/event.constants';
import { useMemo } from 'react';
import {
  BOT_GROUP_SERIES,
  type BotChartPoint,
  toBotChartData,
} from './bot-stats';
import { ComposedChart } from '@/components/charts/composed-chart';
import { Grid } from '@/components/charts/grid';
import { OPChartTooltip } from '@/components/charts/op-tooltip';
import { SeriesBar } from '@/components/charts/series-bar';
import { XAxis } from '@/components/charts/x-axis';
import { YAxis } from '@/components/charts/y-axis';
import { Skeleton } from '@/components/skeleton';
import { useNumber } from '@/hooks/use-numer-formatter';

const BAR_RADIUS = 4;
const STACK_GAP = 2;
const MAX_BAR_WIDTH = 48;
const MARGIN = { top: 8, right: 16, bottom: 32, left: 40 };

export function BotsChart({
  series,
  isLoading,
}: {
  series: IBotStats['series'];
  isLoading: boolean;
}) {
  const number = useNumber();
  const data = useMemo(() => toBotChartData(series), [series]);

  return (
    <div className="card flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h3 className="font-medium text-sm">Bot hits per day</h3>
      </div>
      <div className="min-h-[280px] w-full flex-1 p-4">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ComposedChart
            animationDuration={0}
            aspectRatio="auto"
            className="h-full"
            data={data}
            margin={MARGIN}
            maxBarSize={MAX_BAR_WIDTH}
            stacked
            stackGap={STACK_GAP}
            xDataKey="date"
          >
            <Grid horizontal />
            <YAxis formatValue={(value) => number.short(value)} numTicks={4} />
            <XAxis />
            {BOT_GROUP_SERIES.map((group) => (
              <SeriesBar
                animate={false}
                dataKey={group.key}
                fill={group.color}
                key={group.key}
                radius={BAR_RADIUS}
              />
            ))}
            <OPChartTooltip<BotChartPoint>
              interval="day"
              rows={(point) =>
                BOT_GROUP_SERIES.map((group) => ({
                  color: group.color,
                  label: group.label,
                  value: point[group.key],
                }))
              }
              showCrosshair={false}
              showDots={false}
            />
          </ComposedChart>
        )}
      </div>
    </div>
  );
}
