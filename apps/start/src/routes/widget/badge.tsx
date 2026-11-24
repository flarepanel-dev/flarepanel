import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { UsersIcon } from 'lucide-react';
import { z } from 'zod';
import { LogoSquare } from '@/components/logo';
import {
  embedSearch,
  MissingWidgetLink,
  SAMPLE_BADGE_VISITORS,
  useEmbedTheme,
  useMounted,
} from '@/components/widgets/embed';
import { useNumber } from '@/hooks/use-numer-formatter';
import { useTRPC } from '@/integrations/trpc/react';

const widgetSearchSchema = z.object(embedSearch);
const BADGE_PLATE = '#16171c';

export const Route = createFileRoute('/widget/badge')({
  // Embedded in someone else's page, so this stays small. Without it a
  // missing `shareId` fell through to the root handler, which prints
  // `error.message` — for a ZodError that is the raw issues array.
  errorComponent: MissingWidgetLink,
  component: RouteComponent,
  validateSearch: widgetSearchSchema,
});

function RouteComponent() {
  const { shareId, color, demo, theme } = Route.useSearch();
  useEmbedTheme(theme);
  if (demo) {
    return <DemoBadge color={color} />;
  }
  if (!shareId) {
    return <MissingWidgetLink />;
  }
  return <LiveBadge color={color} shareId={shareId} />;
}

function DemoBadge({ color }: { color?: string }) {
  const mounted = useMounted();
  return (
    <BadgeWidget
      color={color}
      isLoading={!mounted}
      visitors={SAMPLE_BADGE_VISITORS}
    />
  );
}

function LiveBadge({ shareId, color }: { shareId: string; color?: string }) {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.widget.badge.queryOptions({ shareId })
  );
  return (
    <BadgeWidget
      color={color}
      isLoading={isLoading}
      visitors={data?.visitors ?? 0}
    />
  );
}

interface BadgeWidgetProps {
  visitors: number;
  isLoading?: boolean;
  color?: string;
}

function BadgeWidget({ visitors, isLoading, color }: BadgeWidgetProps) {
  const number = useNumber();
  return (
    <div
      className="group center-center absolute inset-0 inline-flex items-center gap-3 rounded-lg px-2"
      // The text is white, so the badge brings its own dark plate unless the
      // embed code picks a colour; on a white page it was invisible.
      style={{
        backgroundColor: color || BADGE_PLATE,
      }}
    >
      <div className="flex-shrink-0">
        <LogoSquare className="h-8 w-8" />
      </div>

      <div className="-mt-px flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <div className="font-medium text-3xs text-white/80 uppercase tracking-wide">
          ANALYTICS FROM
        </div>
        <div className="font-semibold text-white">FlarePanel</div>
      </div>

      <div className="col center-center flex-shrink-0 gap-1">
        <UsersIcon className="size-4 text-white" />
        <div className="font-medium text-sm text-white tabular-nums">
          {isLoading ? <span>...</span> : number.short(visitors)}
        </div>
      </div>
    </div>
  );
}
