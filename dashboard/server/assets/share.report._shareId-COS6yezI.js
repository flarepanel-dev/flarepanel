import { I as notFound, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { c7 as Route, u as useSearch, a as useTRPC, c8 as useOverviewOptions, bt as ReportChart } from "./router-gBnYxPzA.js";
import { S as ShareEnterPassword } from "./share-enter-password-BTYxurU6.js";
import { L as LoginNavbar } from "./public-page-card-Zyi9EoVv.js";
import { O as OverviewInterval } from "./overview-interval-cSBL6ZB5.js";
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
import "./ReportInterval-zZuTI3j-.js";
import "./differenceInDays-liXHUvyd.js";
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
    from: "/share/report/$shareId"
  });
  const trpc = useTRPC();
  const {
    range,
    startDate,
    endDate,
    interval
  } = useOverviewOptions();
  const shareQuery = useSuspenseQuery(trpc.share.report.queryOptions({
    shareId
  }));
  const share = shareQuery.data;
  if (!share) {
    throw notFound();
  }
  if (share.requiresPassword) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ShareEnterPassword, { shareId: share.id, shareType: "report" });
  }
  const isHeaderVisible = header !== "0" && header !== 0 && header !== "false" && header !== false;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    isHeaderVisible && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoginNavbar, { className: "relative p-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky-header [animation-range:50px_100px]!", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col mx-auto max-w-7xl gap-2 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewRange, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewInterval, {})
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-xl", children: share.report.name }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportChart, { report: {
        ...share.report,
        range: range ?? share.report.range,
        startDate: startDate ?? share.report.startDate,
        endDate: endDate ?? share.report.endDate,
        interval: interval ?? share.report.interval
      }, shareId }) })
    ] }) })
  ] });
}
export {
  RouteComponent as component
};
//# sourceMappingURL=share.report._shareId-COS6yezI.js.map
