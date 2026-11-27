import type { IBotStats } from '@flarepanel/core/modules/event/event.constants';
import { BadgeCheckIcon, TriangleAlertIcon } from 'lucide-react';
import { botErrorSummary, botGroupMix, formatShare } from './bot-stats';
import { Skeleton } from '@/components/skeleton';

const SEGMENT_MIN_PERCENT = 1.5;

/**
 * Who is crawling: one bar split by what the bots fetched for, the same
 * split as a list, and how much of it was verified and answered with errors.
 */
export function BotsMix({
  stats,
  isLoading,
}: {
  stats: IBotStats | undefined;
  isLoading: boolean;
}) {
  const mix = botGroupMix(stats?.totals);
  const total = stats?.totals.total ?? 0;
  const { errors, reported } = botErrorSummary(stats?.topPaths);
  const verified = stats?.verifiedHits ?? 0;
  const allHits = stats?.allHits ?? 0;

  return (
    <section
      aria-labelledby="bots-mix"
      className="card flex flex-col overflow-hidden"
    >
      <div className="border-b px-4 py-3">
        <h3 className="font-medium text-sm" id="bots-mix">
          What they came for
        </h3>
      </div>
      {isLoading ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col p-4">
          <div
            aria-hidden
            className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-def-200"
          >
            {mix
              .filter((row) => row.hits > 0)
              .map((row) => (
                <span
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  key={row.key}
                  style={{
                    backgroundColor: row.color,
                    width: `${Math.max(row.share * 100, SEGMENT_MIN_PERCENT)}%`,
                  }}
                />
              ))}
          </div>
          <ul className="mt-4 mb-4 space-y-2.5 text-sm">
            {mix.map((row) => (
              <li className="flex items-center gap-2" key={row.key}>
                <span
                  className="size-2 shrink-0 rounded-sm"
                  style={{ backgroundColor: row.color }}
                />
                <span
                  className={
                    row.hits > 0 ? 'truncate' : 'truncate text-muted-foreground'
                  }
                >
                  {row.label}
                </span>
                <span className="ml-auto font-medium tabular-nums">
                  {row.hits.toLocaleString()}
                </span>
                <span className="w-10 text-right text-muted-foreground text-xs tabular-nums">
                  {formatShare(row.hits, total)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-auto grid grid-cols-2 gap-4 border-t pt-4 text-xs">
            <div>
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <BadgeCheckIcon
                  aria-hidden
                  className="size-3.5 text-emerald-600"
                />
                Verified
              </dt>
              <dd
                className="mt-1 font-semibold text-base tabular-nums"
                title={`${verified.toLocaleString()} of ${allHits.toLocaleString()} hits were confirmed as the real crawler by your edge`}
              >
                {formatShare(verified, allHits)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <TriangleAlertIcon
                  aria-hidden
                  className={
                    errors > 0 ? 'size-3.5 text-destructive' : 'size-3.5'
                  }
                />
                Got an error
              </dt>
              <dd
                className="mt-1 font-semibold text-base tabular-nums"
                title={
                  reported > 0
                    ? `${errors.toLocaleString()} of ${reported.toLocaleString()} answers on the crawled pages below were 4xx or 5xx`
                    : 'No response status was reported in this period'
                }
              >
                {reported > 0 ? formatShare(errors, reported) : 'n/a'}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
