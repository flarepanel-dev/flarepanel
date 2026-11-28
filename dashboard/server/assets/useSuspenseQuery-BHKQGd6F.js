import { bh as useBaseQuery, bi as QueryObserver, bj as defaultThrowOnError } from "./router-gBnYxPzA.js";
function useSuspenseQuery(options, queryClient) {
  return useBaseQuery(
    {
      ...options,
      enabled: true,
      suspense: true,
      throwOnError: defaultThrowOnError,
      placeholderData: void 0
    },
    QueryObserver
  );
}
export {
  useSuspenseQuery as u
};
//# sourceMappingURL=useSuspenseQuery-BHKQGd6F.js.map
