import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { iA as Route, a as useTRPC, j as useQuery, e$ as keepPreviousData } from "./router-gBnYxPzA.js";
import { P as ProfilesTable } from "./index-CFIJrx3s.js";
import { u as useSearchQueryState, d as useDataTablePagination } from "./data-table-toolbar-BJU_j2v8.js";
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
const PAGE_SIZE = 50;
function Component() {
  const {
    projectId,
    groupId
  } = Route.useParams();
  const trpc = useTRPC();
  const {
    debouncedSearch
  } = useSearchQueryState();
  const {
    page
  } = useDataTablePagination(PAGE_SIZE);
  const query = useQuery({
    ...trpc.group.listProfiles.queryOptions({
      projectId,
      groupId,
      cursor: page - 1,
      take: PAGE_SIZE,
      search: debouncedSearch || void 0
    }),
    placeholderData: keepPreviousData
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilesTable, { pageSize: PAGE_SIZE, query, type: "profiles" });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.groups_._groupId._tabs.members-CdEYrpXp.js.map
