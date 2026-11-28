import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { u as useInfiniteQuery } from "./useInfiniteQuery-149RJLhL.js";
import { S as SessionsTable } from "./index-BT4U2wqg.js";
import { u as useSearchQueryState } from "./data-table-toolbar-BJU_j2v8.js";
import { iy as Route, a as useTRPC } from "./router-gBnYxPzA.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "./index-CHcXrYNT.js";
import "./TableFilterPills-CweHt97V.js";
import "./properties-B42zBES-.js";
import "./last-C7omGuiv.js";
import "./rotate-cw-59NMbvpf.js";
import "./sortable.esm-CAMhO-vx.js";
import "./settings-2-DrPzEv47.js";
import "./pick-CfnSzKDx.js";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
function Component() {
  const {
    projectId,
    profileId
  } = Route.useParams();
  const trpc = useTRPC();
  const {
    debouncedSearch
  } = useSearchQueryState();
  const query = useInfiniteQuery(trpc.session.list.infiniteQueryOptions({
    projectId,
    profileId,
    take: 50,
    search: debouncedSearch
  }, {
    getNextPageParam: (lastPage) => lastPage.meta.next
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SessionsTable, { query });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.profiles._profileId._tabs.sessions-C_Pzwe4_.js.map
