import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { A as AiUsageWidget } from "./ai-usage-widget-BIinfAEm.js";
import { W as WidgetHead, d as WidgetTitle } from "./overview-widget-q0VDaTtp.js";
import { b5 as TrendingUp, E as EmptyState, aa as AreaChart, ab as formatDateInterval, cN as Grid, b0 as YAxis, a4 as useNumber, cO as XAxis, ac as Area, ad as getChartColor, ae as monotoneX, af as OPChartTooltip, iw as Route, a as useTRPC, cK as OverviewMetricCard, bn as formatDateTime } from "./router-gBnYxPzA.js";
import { b as Widget, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { M as MostEvents } from "./most-events-DZTLKeUn.js";
import { P as PopularRoutes } from "./popular-routes-o-BP_rMn.js";
import { P as ProfileActivity } from "./profile-activity-N0HlZRnj.js";
import { K as KeyValueGrid } from "./key-value-grid-BaTCXsBI.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "./ai-cost-C8tzxtic.js";
import "./pick-CfnSzKDx.js";
import "./last-C7omGuiv.js";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
import "./route-Cx_TL1Oz.js";
import "./startOfMonth-Bf6CczcY.js";
import "./endOfMonth-C3pRd8ne.js";
import "./countries-CS917BhP.js";
const MARGIN = { top: 12, right: 12, bottom: 28, left: 40 };
const FILL_OPACITY = 0.3;
const COLOR = getChartColor(0);
const formatDateLabel = (date) => formatDateInterval({ interval: "day", date, short: true });
function GroupMemberGrowth({ data }) {
  const number = useNumber();
  let cumulative = 0;
  const points = data.map((item) => {
    cumulative += item.count;
    return { date: item.date, count: item.count, cumulative };
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTitle, { icon: TrendingUp, children: "New members last 30 days" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: data.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        className: "h-[200px]",
        description: "New members in the last 30 days will be charted here.",
        icon: TrendingUp,
        title: "No new members yet",
        variant: "inline"
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
      AreaChart,
      {
        animationDuration: 0,
        aspectRatio: "auto",
        className: "h-[200px]",
        data: points,
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
              dataKey: "cumulative",
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
                  label: "Total members",
                  value: point.cumulative,
                  format: number.format,
                  sub: point.count > 0 ? [
                    {
                      label: "New",
                      value: `+${number.format(point.count)}`
                    }
                  ] : void 0
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
    groupId
  } = Route.useParams();
  const trpc = useTRPC();
  const group = useSuspenseQuery(trpc.group.byId.queryOptions({
    id: groupId,
    projectId
  }));
  const metrics = useSuspenseQuery(trpc.group.metrics.queryOptions({
    id: groupId,
    projectId
  }));
  const activity = useSuspenseQuery(trpc.group.activity.queryOptions({
    id: groupId,
    projectId
  }));
  const mostEvents = useSuspenseQuery(trpc.group.mostEvents.queryOptions({
    id: groupId,
    projectId
  }));
  const popularRoutes = useSuspenseQuery(trpc.group.popularRoutes.queryOptions({
    id: groupId,
    projectId
  }));
  const memberGrowth = useSuspenseQuery(trpc.group.memberGrowth.queryOptions({
    id: groupId,
    projectId
  }));
  const g = group.data;
  const m = metrics.data;
  if (!g) {
    return null;
  }
  const properties = g.properties;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
    m && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card grid grid-cols-2 overflow-hidden rounded-md md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetricCard, { data: [], id: "totalEvents", isLoading: false, label: "Total Events", metric: {
        current: m.totalEvents,
        previous: null
      }, unit: "" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetricCard, { data: [], id: "uniqueMembers", isLoading: false, label: "Unique Members", metric: {
        current: m.uniqueProfiles,
        previous: null
      }, unit: "" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetricCard, { data: [], id: "firstSeen", isLoading: false, label: "First Seen", metric: {
        current: m.firstSeen ? new Date(m.firstSeen).getTime() : 0,
        previous: null
      }, unit: "timeAgo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetricCard, { data: [], id: "lastSeen", isLoading: false, label: "Last Seen", metric: {
        current: m.lastSeen ? new Date(m.lastSeen).getTime() : 0,
        previous: null
      }, unit: "timeAgo" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AiUsageWidget, { className: "w-full", entity: {
      kind: "group",
      groupId
    }, projectId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "title", children: "Group Information" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KeyValueGrid, { className: "border-0", columns: 3, copyable: true, data: [{
        name: "id",
        value: g.id
      }, {
        name: "name",
        value: g.name
      }, {
        name: "type",
        value: g.type
      }, {
        name: "createdAt",
        value: formatDateTime(new Date(g.createdAt))
      }, ...Object.entries(properties).filter(([, v]) => v !== void 0 && v !== "").map(([k, v]) => ({
        name: k,
        value: String(v)
      }))] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileActivity, { data: activity.data }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GroupMemberGrowth, { data: memberGrowth.data }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MostEvents, { data: mostEvents.data }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PopularRoutes, { data: popularRoutes.data }) })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.groups_._groupId._tabs.index-CEvTTzZr.js.map
