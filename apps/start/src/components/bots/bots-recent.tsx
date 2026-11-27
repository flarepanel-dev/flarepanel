import { botGroup } from '@flarepanel/core/modules/event/event.constants';
import { BadgeCheckIcon } from 'lucide-react';
import { botGroupColor, botGroupLabel, displayBotPath } from './bot-stats';
import { Pagination } from '@/components/pagination';
import { Skeleton } from '@/components/skeleton';
import { cn } from '@/utils/cn';
import { formatTimeAgoOrDateTime } from '@/utils/date';

export const RECENT_PAGE_SIZE = 20;
const LOADING_ROWS = [1, 2, 3, 4, 5, 6];
const ERROR_STATUS_FROM = 400;
const GRID =
  'grid grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)_auto] items-center gap-x-4 px-4 sm:grid-cols-[minmax(0,11rem)_minmax(0,9rem)_minmax(0,1fr)_3.5rem_6.5rem]';

export interface RecentHit {
  id: string;
  name: string;
  type: string;
  path: string;
  createdAt: Date | string;
  status?: number | null;
  verified?: boolean | null;
  /** Set on a sample imported from Cloudflare (stands for an hourly estimate). */
  source?: string | null;
}

function StatusPill({ status }: { status: number | null | undefined }) {
  if (status == null) {
    return <span className="text-muted-foreground">-</span>;
  }
  return (
    <span
      className={cn(
        'inline-flex min-w-9 justify-center rounded px-1.5 py-0.5 font-medium tabular-nums',
        status >= ERROR_STATUS_FROM
          ? 'bg-destructive/10 text-destructive'
          : 'bg-def-200 text-muted-foreground'
      )}
    >
      {status}
    </span>
  );
}

export function RecentHits({
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
    <section aria-labelledby="bots-latest" className="card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex items-baseline gap-2">
          <h3 className="font-medium text-sm" id="bots-latest">
            Latest hits
          </h3>
          {count > 0 && (
            <span className="text-muted-foreground text-xs tabular-nums">
              {count.toLocaleString()} kept
            </span>
          )}
        </div>
        {count > RECENT_PAGE_SIZE && (
          <Pagination
            canNextPage={page < pageCount - 1}
            canPreviousPage={page > 0}
            nextPage={() => onPageChange(Math.min(page + 1, pageCount - 1))}
            pageIndex={page}
            previousPage={() => onPageChange(Math.max(page - 1, 0))}
          />
        )}
      </div>
      {isLoading && (
        <div className="space-y-2 p-4">
          {LOADING_ROWS.map((row) => (
            <Skeleton className="h-5 w-full" key={row} />
          ))}
        </div>
      )}
      {!isLoading && rows.length === 0 && (
        <p className="px-4 py-10 text-center text-muted-foreground text-xs">
          No bot hits kept yet
        </p>
      )}
      {!isLoading && rows.length > 0 && (
        <div className="text-xs">
          <div
            className={cn(
              GRID,
              'border-b bg-def-100 py-2 font-medium text-[11px] text-muted-foreground uppercase tracking-wide'
            )}
          >
            <span>Bot</span>
            <span className="hidden sm:block">Came for</span>
            <span>Page</span>
            <span className="hidden text-right sm:block">Status</span>
            <span className="text-right">When</span>
          </div>
          <ul className="divide-y">
            {rows.map((row) => {
              const group = botGroup(row.name, row.type);
              return (
                <li
                  className={cn(GRID, 'py-2.5 hover:bg-def-100')}
                  key={row.id}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2 shrink-0 rounded-sm"
                      style={{ backgroundColor: botGroupColor(group) }}
                    />
                    <span className="truncate font-medium">{row.name}</span>
                    {row.verified && (
                      <BadgeCheckIcon
                        aria-label="Verified"
                        className="size-3.5 shrink-0 text-emerald-600"
                      />
                    )}
                  </span>
                  <span
                    className="hidden truncate text-muted-foreground sm:block"
                    title={`Detected as: ${row.type}`}
                  >
                    {botGroupLabel(group)}
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate" title={row.path}>
                      {displayBotPath(row.path)}
                    </span>
                    {row.source === 'cloudflare' && (
                      <span
                        className="shrink-0 rounded border px-1 text-[10px] text-muted-foreground"
                        title="A sample from the hourly Cloudflare import, not a single reported hit"
                      >
                        Cloudflare
                      </span>
                    )}
                  </span>
                  <span className="hidden text-right sm:block">
                    <StatusPill status={row.status} />
                  </span>
                  <span className="truncate text-right text-muted-foreground tabular-nums">
                    {formatTimeAgoOrDateTime(new Date(row.createdAt))}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
