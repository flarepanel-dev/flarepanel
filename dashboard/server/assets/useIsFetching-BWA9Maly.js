import { a as reactExports } from "./worker-entry-C5kSRogq.js";
import { ak as useQueryClient, f6 as notifyManager } from "./router-gBnYxPzA.js";
function useIsFetching(filters, queryClient) {
  const client = useQueryClient();
  const queryCache = client.getQueryCache();
  return reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => queryCache.subscribe(notifyManager.batchCalls(onStoreChange)),
      [queryCache]
    ),
    () => client.isFetching(filters),
    () => client.isFetching(filters)
  );
}
export {
  useIsFetching as u
};
//# sourceMappingURL=useIsFetching-BWA9Maly.js.map
