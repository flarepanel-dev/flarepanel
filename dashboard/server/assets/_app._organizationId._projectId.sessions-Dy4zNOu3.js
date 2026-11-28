import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { u as useInfiniteQuery } from "./useInfiniteQuery-149RJLhL.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { a as useTRPC, j as useQuery, aD as Alert, eT as Video, aE as AlertTitle, aF as AlertDescription, A as Link, eU as Route, dH as useTableFilters } from "./router-gBnYxPzA.js";
import { S as SessionsTable } from "./index-BT4U2wqg.js";
import { u as useSearchQueryState } from "./data-table-toolbar-BJU_j2v8.js";
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
import "./index-CHcXrYNT.js";
import "./TableFilterPills-CweHt97V.js";
import "./properties-B42zBES-.js";
import "./last-C7omGuiv.js";
import "./rotate-cw-59NMbvpf.js";
import "./sortable.esm-CAMhO-vx.js";
import "./settings-2-DrPzEv47.js";
const numberFormat = new Intl.NumberFormat();
const WARN_AT = 0.8;
function nextMonthStart() {
  const now = /* @__PURE__ */ new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  ).toLocaleDateString(void 0, { day: "numeric", month: "long" });
}
function ReplayStatus({
  organizationId,
  projectId
}) {
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.session.replayStatus.queryOptions({ projectId })
  );
  if (!data) {
    return null;
  }
  if (!data.allowed) {
    if (data.reason === "off") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "size-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Session replay is turned off" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "Sessions of this organization are not recorded." })
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "mb-6", variant: "warning", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "size-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Session replay needs an active plan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
        "The trial or plan of this organization has ended, so new sessions are not recorded. Existing recordings stay for 30 days.",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            className: "font-medium underline underline-offset-4",
            params: { organizationId },
            to: "/$organizationId/billing",
            children: "Choose a plan"
          }
        )
      ] })
    ] });
  }
  if (data.limit === null || data.used < data.limit * WARN_AT) {
    return null;
  }
  const reached = data.used >= data.limit;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "mb-6", variant: "warning", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "size-4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: reached ? "Monthly session replay limit reached" : `${Math.floor(data.used / data.limit * 100)}% of this month's session replays used` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
      numberFormat.format(Math.min(data.used, data.limit)),
      " of",
      " ",
      numberFormat.format(data.limit),
      " recorded sessions across this organization.",
      " ",
      reached ? `New sessions are recorded again from ${nextMonthStart()}; sessions already recording finish. Nothing is charged for going over.` : "Past the limit, new sessions are not recorded until next month; nothing is charged.",
      data.hosted && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            className: "font-medium underline underline-offset-4",
            params: { organizationId },
            to: "/$organizationId/billing",
            children: "Plans"
          }
        )
      ] })
    ] })
  ] });
}
function Component() {
  const {
    organizationId,
    projectId
  } = Route.useParams();
  const trpc = useTRPC();
  const {
    debouncedSearch
  } = useSearchQueryState();
  const [filters] = useTableFilters("f");
  const query = useInfiniteQuery(trpc.session.list.infiniteQueryOptions({
    projectId,
    take: 50,
    search: debouncedSearch,
    filters
  }, {
    getNextPageParam: (lastPage) => lastPage.meta.next
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { className: "mb-8", description: "Access all your sessions here", title: "Sessions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ReplayStatus, { organizationId, projectId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SessionsTable, { query })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.sessions-Dy4zNOu3.js.map
