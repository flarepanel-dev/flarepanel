import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { u as useInfiniteQuery } from "./useInfiniteQuery-149RJLhL.js";
import { iD as Route, a as useTRPC, c4 as useQueryState, bm as parseAsIsoDateTime, f as useEventQueryNamesFilter } from "./router-gBnYxPzA.js";
import { E as EventsTable } from "./index-CDLE9IG-.js";
import { e as useReadColumnVisibility } from "./data-table-toolbar-BJU_j2v8.js";
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
import "./animated-number-DKHgshrj.js";
import "./use-debounce-state-BwHu4mHP.js";
import "./index-Dpi7uv2M.js";
import "./use-event-drawer-DCAhkqzM.js";
import "./key-value-grid-BaTCXsBI.js";
import "./countries-CS917BhP.js";
import "./overview-filters-buttons-C30tAgyS.js";
import "./properties-B42zBES-.js";
import "./last-C7omGuiv.js";
import "./sortable.esm-CAMhO-vx.js";
import "./settings-2-DrPzEv47.js";
import "./index-CHcXrYNT.js";
function Component() {
  const {
    projectId,
    cohortId
  } = Route.useParams();
  const trpc = useTRPC();
  const [startDate] = useQueryState("startDate", parseAsIsoDateTime);
  const [endDate] = useQueryState("endDate", parseAsIsoDateTime);
  const [eventNames] = useEventQueryNamesFilter();
  const columnVisibility = useReadColumnVisibility("events");
  const query = useInfiniteQuery(trpc.event.events.infiniteQueryOptions({
    projectId,
    cohortId,
    filters: [],
    startDate: startDate || void 0,
    endDate: endDate || void 0,
    events: eventNames,
    columnVisibility: columnVisibility ?? {}
  }, {
    enabled: columnVisibility !== null,
    getNextPageParam: (lastPage) => lastPage.meta.next
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EventsTable, { query });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.cohorts_._cohortId._tabs.events-DxbFel4o.js.map
