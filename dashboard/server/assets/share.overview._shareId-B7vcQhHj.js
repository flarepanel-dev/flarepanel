import { o as jsxRuntimeExports, I as notFound } from "./worker-entry-C5kSRogq.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { cq as Route, u as useSearch, a as useTRPC } from "./router-gBnYxPzA.js";
import { S as ShareEnterPassword } from "./share-enter-password-BTYxurU6.js";
import { L as LazyComponent } from "./lazy-component-BvTCtqML.js";
import { L as LoginNavbar } from "./public-page-card-Zyi9EoVv.js";
import { O as OverviewFiltersButtons } from "./overview-filters-buttons-C30tAgyS.js";
import { L as LiveCounter, O as OverviewMetrics, a as OverviewTopSources, b as OverviewTopPages, c as OverviewTopDevices, d as OverviewTopEvents, e as OverviewTopGeo, f as OverviewWeeklyTrends, g as OverviewUserJourney } from "./overview-weekly-trends-DrC2rBau.js";
import { O as OverviewRange } from "./overview-range-DoapqOyi.js";
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
import "./logo-BXfRcVLd.js";
import "./menu-BDOsAmJe.js";
import "./properties-B42zBES-.js";
import "./animated-number-DKHgshrj.js";
import "./use-live-counter-BawyL5Mu.js";
import "./use-debounce-state-BwHu4mHP.js";
import "./index-Dpi7uv2M.js";
import "./rotate-cw-59NMbvpf.js";
import "./widget-D7PGEeO1.js";
import "./overview-widget-q0VDaTtp.js";
import "./last-C7omGuiv.js";
import "./countries-CS917BhP.js";
import "./earth-Din9zDf9.js";
import "./table-DNq4Q3EQ.js";
import "./time-window-picker-BUBj3ZWF.js";
import "./index-DxXk7QJj.js";
import "./addDays-BIiJOlUZ.js";
import "./endOfMonth-C3pRd8ne.js";
import "./startOfMonth-Bf6CczcY.js";
function RouteComponent() {
  const {
    shareId
  } = Route.useParams();
  const {
    header
  } = useSearch({
    from: "/share/overview/$shareId"
  });
  const trpc = useTRPC();
  const shareQuery = useSuspenseQuery(trpc.share.overview.queryOptions({
    shareId
  }));
  if (shareQuery.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Loading..." });
  }
  const share = shareQuery.data;
  if (!share) {
    throw notFound();
  }
  if (share.requiresPassword) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ShareEnterPassword, { shareId: share.id });
  }
  const projectId = share.projectId;
  const isHeaderVisible = header !== "0" && header !== 0 && header !== "false" && header !== false;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    isHeaderVisible && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoginNavbar, { className: "relative p-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky-header [animation-range:50px_100px]!", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col mx-auto max-w-7xl gap-2 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewRange, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LiveCounter, { projectId, shareId }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewFiltersButtons, { filterModal: {
        mode: "events"
      } })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-7xl grid-cols-6 gap-4 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetrics, { projectId, shareId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTopSources, { projectId, shareId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTopPages, { projectId, shareId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTopDevices, { projectId, shareId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTopEvents, { projectId, shareId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTopGeo, { projectId, shareId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LazyComponent, { className: "col-span-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewWeeklyTrends, { projectId, shareId }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LazyComponent, { className: "col-span-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewUserJourney, { projectId, shareId }) })
    ] })
  ] });
}
export {
  RouteComponent as component
};
//# sourceMappingURL=share.overview._shareId-B7vcQhHj.js.map
