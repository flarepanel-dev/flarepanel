import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { ic as Route, a as useTRPC, dH as useTableFilters, j as useQuery, e$ as keepPreviousData } from "./router-gBnYxPzA.js";
import { P as ProfilesTable } from "./index-CFIJrx3s.js";
import { d as useDataTablePagination, u as useSearchQueryState } from "./data-table-toolbar-BJU_j2v8.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "./pick-CfnSzKDx.js";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
import "./TableFilterPills-CweHt97V.js";
import "./properties-B42zBES-.js";
import "./data-table-WJSjaNsN.js";
import "./table-Bl3avL3P.js";
import "./pagination-Dj6_PitL.js";
import "./useIsFetching-BWA9Maly.js";
import "./are-props-equal-DlAMv8r6.js";
import "./sortable.esm-CAMhO-vx.js";
import "./settings-2-DrPzEv47.js";
import "./index-CHcXrYNT.js";
function Component() {
  const {
    projectId
  } = Route.useParams();
  const trpc = useTRPC();
  const {
    page
  } = useDataTablePagination(50);
  const {
    debouncedSearch
  } = useSearchQueryState();
  const [filters] = useTableFilters("f");
  const query = useQuery(trpc.profile.list.queryOptions({
    cursor: page - 1,
    projectId,
    take: 50,
    search: debouncedSearch,
    isExternal: false,
    filters
  }, {
    placeholderData: keepPreviousData
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilesTable, { query, type: "profiles" });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.profiles._tabs.anonymous-lXq5ntPL.js.map
