import { a as useTRPC, ak as useQueryClient, j as useQuery, al as useWS } from "./router-gBnYxPzA.js";
import { a as reactExports } from "./worker-entry-C5kSRogq.js";
import { u as useDebounceState } from "./use-debounce-state-BwHu4mHP.js";
const FIFTEEN_SECONDS = 1e3 * 15;
const FALLBACK_STALE_MS = 1e3 * 60;
function useLiveCounter({
  projectId,
  shareId,
  onRefresh
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const counter = useDebounceState(0, 1e3);
  const lastRefresh = reactExports.useRef(Date.now());
  const query = useQuery(
    trpc.overview.liveVisitors.queryOptions({
      projectId,
      shareId: shareId ?? void 0
    })
  );
  reactExports.useEffect(() => {
    if (query.data) {
      counter.set(query.data);
    }
  }, [query.data]);
  useWS(
    shareId ? `/live/visitors/${projectId}?shareId=${shareId}` : `/live/visitors/${projectId}`,
    (value) => {
      if (!Number.isNaN(value)) {
        counter.set(value);
        if (Date.now() - lastRefresh.current > FIFTEEN_SECONDS) {
          lastRefresh.current = Date.now();
          if (!document.hidden) {
            onRefresh?.();
          }
        }
      }
    },
    {
      debounce: {
        delay: 1e3,
        maxWait: 5e3
      }
    }
  );
  reactExports.useEffect(() => {
    const id = setInterval(async () => {
      if (Date.now() - lastRefresh.current < FALLBACK_STALE_MS) {
        return;
      }
      const data = await queryClient.fetchQuery(
        trpc.overview.liveVisitors.queryOptions(
          {
            projectId,
            shareId: shareId ?? void 0
          },
          // Default query staleTime is 5m; bypass cache so this reconciliation always hits the API.
          { staleTime: 0 }
        )
      );
      counter.set(data);
      lastRefresh.current = Date.now();
    }, FALLBACK_STALE_MS);
    return () => clearInterval(id);
  }, [projectId, shareId, trpc, queryClient, counter.set]);
  return counter;
}
export {
  useLiveCounter as u
};
//# sourceMappingURL=use-live-counter-BawyL5Mu.js.map
