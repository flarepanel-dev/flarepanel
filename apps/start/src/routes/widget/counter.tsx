import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type React from 'react';
import { z } from 'zod';
import { AnimatedNumber } from '@/components/animated-number';
import { Ping } from '@/components/ping';
import {
  embedSearch,
  MissingWidgetLink,
  SAMPLE_COUNTER,
  useEmbedTheme,
  useMounted,
} from '@/components/widgets/embed';
import useWS from '@/hooks/use-ws';
import { useTRPC } from '@/integrations/trpc/react';

const widgetSearchSchema = z.object({
  ...embedSearch,
  limit: z.number().default(10),
});

export const Route = createFileRoute('/widget/counter')({
  // Embedded in someone else's page, so this stays small. Without it a
  // missing `shareId` fell through to the root handler, which prints
  // `error.message` — for a ZodError that is the raw issues array.
  errorComponent: MissingWidgetLink,
  component: RouteComponent,
  validateSearch: widgetSearchSchema,
});

function RouteComponent() {
  const { shareId, demo, theme } = Route.useSearch();
  useEmbedTheme(theme);
  if (demo) {
    return <DemoCounter />;
  }
  if (!shareId) {
    return <MissingWidgetLink />;
  }
  return <LiveCounter shareId={shareId} />;
}

function DemoCounter() {
  const mounted = useMounted();
  return <CounterView value={mounted ? SAMPLE_COUNTER.counter : 0} />;
}

function LiveCounter({ shareId }: { shareId: string }) {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.widget.counter.queryOptions({ shareId })
  );

  if (isLoading) {
    return <CounterView value={0} />;
  }
  if (!data) {
    return <CounterView pingClassName="bg-orange-500" value={0} />;
  }
  return (
    <CounterUpdates projectId={data.projectId} shareId={shareId}>
      <CounterView value={data.counter} />
    </CounterUpdates>
  );
}

function CounterUpdates({
  projectId,
  shareId,
  children,
}: {
  projectId: string;
  shareId: string;
  children: React.ReactNode;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // WebSocket subscription for real-time updates
  useWS<number>(
    `/live/visitors/${projectId}?shareId=${shareId}`,
    () => {
      if (!document.hidden) {
        queryClient.refetchQueries(
          trpc.widget.counter.queryFilter({ shareId })
        );
      }
    },
    {
      debounce: {
        delay: 1000,
        maxWait: 60_000,
      },
    }
  );

  return children;
}

function CounterView({
  value,
  pingClassName,
}: {
  value: number;
  pingClassName?: string;
}) {
  return (
    <div className="flex h-8 items-center gap-2 px-2 text-foreground">
      <Ping className={pingClassName} />
      <AnimatedNumber
        suffix={value === 1 ? ' visitor now' : ' visitors now'}
        value={value}
      />
    </div>
  );
}
