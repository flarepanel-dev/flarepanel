import {
  type IBotStats,
  isAiBotGroup,
} from '@flarepanel/core/modules/event/event.constants';
import { useQuery } from '@tanstack/react-query';
import { ArrowRightIcon } from 'lucide-react';
import {
  AI_REFERRER_FILTER,
  aiReferralSessions,
  botGroupColor,
  botGroupLabel,
} from './bot-stats';
import { useOverviewOptions } from '@/components/overview/useOverviewOptions';
import { SerieIcon } from '@/components/report-chart/common/serie-icon';
import { Skeleton } from '@/components/skeleton';
import { useTRPC } from '@/integrations/trpc/react';

const TOP_ROWS = 5;

/**
 * Crawl to visit: what AI crawlers and assistants read, next to the people
 * who arrived from AI answers in the same range. Visits come from the
 * overview's referrer rollups; per-assistant visits are only asked for when
 * there are any.
 */
export function AiVisibility({
  projectId,
  stats,
  isLoading,
}: {
  projectId: string;
  stats: IBotStats | undefined;
  isLoading: boolean;
}) {
  const trpc = useTRPC();
  const { range, startDate, endDate } = useOverviewOptions();
  const period = { projectId, range, startDate, endDate };

  const typesQuery = useQuery(
    trpc.overview.topGeneric.queryOptions({
      ...period,
      filters: [],
      column: 'referrer_type',
    })
  );
  const aiSessions = aiReferralSessions(typesQuery.data);
  const sourcesQuery = useQuery(
    trpc.overview.topGeneric.queryOptions(
      { ...period, filters: [AI_REFERRER_FILTER], column: 'referrer_name' },
      { enabled: aiSessions > 0 }
    )
  );

  const aiBots = (stats?.topBots ?? [])
    .filter((bot) => isAiBotGroup(bot.group))
    .slice(0, TOP_ROWS);
  const sources = (sourcesQuery.data ?? []).slice(0, TOP_ROWS);
  const answers = stats?.totals.answers ?? 0;

  return (
    <section aria-labelledby="ai-visibility" className="card overflow-hidden">
      <div className="border-b px-4 py-3">
        <h2 className="font-medium text-sm" id="ai-visibility">
          AI visibility
        </h2>
        <p className="text-muted-foreground text-xs">
          What AI crawlers and assistants read, and the people AI answers sent
          you, in the same period.
        </p>
      </div>
      <div className="grid grid-cols-1 divide-y md:grid-cols-[1fr_auto_1fr] md:divide-x md:divide-y-0">
        <div className="p-4">
          <Figure
            isLoading={isLoading}
            label="AI crawler and assistant hits"
            note={`${answers.toLocaleString()} fetched for an answer someone asked for`}
            value={stats?.totals.ai ?? 0}
          />
          <ul className="mt-4 space-y-2 text-xs">
            {aiBots.map((bot) => (
              <li
                className="flex items-center gap-2"
                key={`${bot.name}:${bot.category}`}
              >
                <span
                  className="size-2 shrink-0 rounded-sm"
                  style={{ backgroundColor: botGroupColor(bot.group) }}
                />
                <span className="truncate font-medium">{bot.name}</span>
                <span className="truncate text-muted-foreground">
                  {botGroupLabel(bot.group)}
                </span>
                <span className="ml-auto tabular-nums">
                  {bot.hits.toLocaleString()}
                </span>
              </li>
            ))}
            {!isLoading && aiBots.length === 0 && (
              <li className="text-muted-foreground">
                No AI crawler hits in this period
              </li>
            )}
          </ul>
        </div>
        <div className="hidden items-center px-2 text-muted-foreground md:flex">
          <ArrowRightIcon aria-hidden className="size-4" />
        </div>
        <div className="p-4">
          <Figure
            isLoading={typesQuery.isLoading}
            label="Visits from AI answers"
            note="Sessions referred by ChatGPT, Perplexity, Claude, Gemini and others"
            value={aiSessions}
          />
          <ul className="mt-4 space-y-2 text-xs">
            {sources.map((source) => (
              <li className="flex items-center gap-2" key={source.name}>
                <SerieIcon name={source.name} />
                <span className="truncate font-medium">{source.name}</span>
                <span className="ml-auto tabular-nums">
                  {source.sessions.toLocaleString()}
                </span>
              </li>
            ))}
            {sourcesQuery.isLoading && aiSessions > 0 && (
              <li>
                <Skeleton className="h-4 w-2/3" />
              </li>
            )}
            {!typesQuery.isLoading && aiSessions === 0 && (
              <li className="text-muted-foreground">
                No visits from AI answers in this period
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Figure({
  label,
  value,
  note,
  isLoading,
}: {
  label: string;
  value: number;
  note: string;
  isLoading: boolean;
}) {
  return (
    <div>
      <div className="text-muted-foreground text-xs">{label}</div>
      {isLoading ? (
        <Skeleton className="mt-1 h-8 w-24" />
      ) : (
        <div className="font-semibold text-2xl tabular-nums">
          {value.toLocaleString()}
        </div>
      )}
      <div className="text-muted-foreground text-xs">{note}</div>
    </div>
  );
}
