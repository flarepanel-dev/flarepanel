import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { W as WidgetHead, d as WidgetTitle } from "./overview-widget-q0VDaTtp.js";
import { fE as Activity, E as EmptyState, aa as AreaChart, ab as formatDateInterval, cN as Grid, b0 as YAxis, a4 as useNumber, cO as XAxis, ac as Area, ad as getChartColor, ae as monotoneX, af as OPChartTooltip, ix as Route, a as useTRPC, hk as Info, cK as OverviewMetricCard } from "./router-gBnYxPzA.js";
import { b as Widget, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { M as MostEvents } from "./most-events-DZTLKeUn.js";
import { P as PopularRoutes } from "./popular-routes-o-BP_rMn.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "./last-C7omGuiv.js";
import "./pick-CfnSzKDx.js";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
import "./route-Cx_TL1Oz.js";
const MARGIN = { top: 12, right: 12, bottom: 28, left: 40 };
const FILL_OPACITY = 0.3;
const COLOR = getChartColor(0);
const formatDateLabel = (date) => formatDateInterval({ interval: "day", date, short: true });
function CohortEventsChart({ data }) {
  const number = useNumber();
  const total = data.reduce((acc, point) => acc + point.count, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetTitle, { icon: Activity, children: [
      "Events last 30 days (",
      total.toLocaleString(),
      ")"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: total === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        className: "h-[200px]",
        description: "Events from people in this cohort will be charted here.",
        icon: Activity,
        title: "No events in the last 30 days",
        variant: "inline"
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
      AreaChart,
      {
        animationDuration: 0,
        aspectRatio: "auto",
        className: "h-[200px]",
        data,
        formatDateLabel,
        margin: MARGIN,
        xDataKey: "date",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { horizontal: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { formatValue: number.short }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Area,
            {
              animate: false,
              curve: monotoneX,
              dataKey: "count",
              fill: COLOR,
              fillOpacity: FILL_OPACITY,
              stroke: COLOR
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            OPChartTooltip,
            {
              interval: "day",
              rows: (point) => [
                {
                  color: COLOR,
                  label: "Events",
                  value: point.count,
                  format: number.format
                }
              ],
              showCrosshair: true,
              showDots: true
            }
          )
        ]
      }
    ) })
  ] });
}
function Component() {
  const {
    projectId,
    cohortId
  } = Route.useParams();
  const trpc = useTRPC();
  const cohort = useSuspenseQuery(trpc.cohort.get.queryOptions({
    id: cohortId
  }));
  const eventsPerDay = useSuspenseQuery(trpc.cohort.eventsPerDay.queryOptions({
    projectId,
    cohortId
  }));
  const mostEvents = useSuspenseQuery(trpc.cohort.mostEvents.queryOptions({
    projectId,
    cohortId
  }));
  const popularRoutes = useSuspenseQuery(trpc.cohort.popularRoutes.queryOptions({
    projectId,
    cohortId
  }));
  const c = cohort.data;
  if (!c) {
    return null;
  }
  const notComputed = c.lastComputedAt === null;
  const isCapped = c.profileCount >= 1e4;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-6", children: [
    notComputed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "size-4 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "This cohort hasn't been computed yet. Membership will appear within a minute." })
    ] }),
    isCapped && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "size-4 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Capped at 10,000 members — consider narrowing the criteria." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card grid grid-cols-1 overflow-hidden rounded-md md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetricCard, { data: [], id: "profileCount", isLoading: false, label: "Members", metric: {
        current: c.profileCount,
        previous: null
      }, unit: "" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetricCard, { data: [], id: "lastComputedAt", isLoading: false, label: "Last computed", metric: {
        current: c.lastComputedAt ? new Date(c.lastComputedAt).getTime() : 0,
        previous: null
      }, unit: "timeAgo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetricCard, { data: [], id: "createdAt", isLoading: false, label: "Created", metric: {
        current: new Date(c.createdAt).getTime(),
        previous: null
      }, unit: "timeAgo" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CohortEventsChart, { data: eventsPerDay.data }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MostEvents, { data: mostEvents.data }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PopularRoutes, { data: popularRoutes.data })
    ] })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.cohorts_._cohortId._tabs.index-f42VTi_m.js.map
