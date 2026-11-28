import { a as reactExports, I as notFound, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { dB as Route, u as useSearch, a as useTRPC, c8 as useOverviewOptions, j as useQuery, E as EmptyState } from "./router-gBnYxPzA.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { S as ShareEnterPassword } from "./share-enter-password-BTYxurU6.js";
import { u as useDashboardLayout, D as DashboardGrid } from "./dashboard-grid-BOxGeuKe.js";
import { R as ReadOnlyFilterPills } from "./TableFilterPills-CweHt97V.js";
import { L as LoginNavbar } from "./public-page-card-Zyi9EoVv.js";
import { O as OverviewInterval } from "./overview-interval-cSBL6ZB5.js";
import { O as OverviewRange } from "./overview-range-DoapqOyi.js";
import { R as ReportItemSkeleton, a as ReportItemReadOnly } from "./report-item-BV3SztWe.js";
import { L as LayoutPanelTop } from "./layout-panel-top-B4lJ9Wyr.js";
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
import "./properties-B42zBES-.js";
import "./logo-BXfRcVLd.js";
import "./menu-BDOsAmJe.js";
import "./ReportInterval-zZuTI3j-.js";
import "./differenceInDays-liXHUvyd.js";
import "./time-window-picker-BUBj3ZWF.js";
import "./index-DxXk7QJj.js";
import "./addDays-BIiJOlUZ.js";
import "./endOfMonth-C3pRd8ne.js";
import "./startOfMonth-Bf6CczcY.js";
import "./table-DNq4Q3EQ.js";
function RouteComponent() {
  const {
    shareId
  } = Route.useParams();
  const {
    header
  } = useSearch({
    from: "/share/dashboard/$shareId"
  });
  const trpc = useTRPC();
  const {
    range,
    startDate,
    endDate,
    interval
  } = useOverviewOptions();
  const shareQuery = useSuspenseQuery(trpc.share.dashboard.queryOptions({
    shareId
  }));
  const reportsQuery = useQuery({
    ...trpc.share.dashboardReports.queryOptions({
      shareId
    }),
    enabled: !shareQuery.data?.requiresPassword
  });
  const share = shareQuery.data;
  const reports = reactExports.useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);
  const [layout] = useDashboardLayout(reports);
  if (!share) {
    throw notFound();
  }
  if (share.requiresPassword) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ShareEnterPassword, { shareId: share.id, shareType: "dashboard" });
  }
  const isHeaderVisible = header !== "0" && header !== 0 && header !== "false" && header !== false;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    isHeaderVisible && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoginNavbar, { className: "relative p-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky-header [animation-range:50px_100px]!", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col mx-auto max-w-7xl gap-2 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewRange, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewInterval, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReadOnlyFilterPills, { cohortNames: share.dashboard.cohortNames, filters: share.dashboard.filters })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl p-4", children: reportsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItemSkeleton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItemSkeleton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItemSkeleton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItemSkeleton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItemSkeleton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItemSkeleton, {})
    ] }) : reports.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { description: "Reports added to this dashboard will show up here.", icon: LayoutPanelTop, title: "This dashboard is empty" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardGrid, { layout, children: reports.map((report) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItemReadOnly, { endDate, interval, range, report, shareId, startDate }) }, report.id)) }) })
  ] });
}
export {
  RouteComponent as component
};
//# sourceMappingURL=share.dashboard._shareId-gIW2ZaSu.js.map
