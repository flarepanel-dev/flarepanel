import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { a5 as Route, a6 as useEmbedTheme, a7 as MissingWidgetLink, a8 as useMounted, a9 as sampleTraffic, a as useTRPC, j as useQuery, S as SerieIcon, a4 as useNumber, aa as AreaChart, ab as formatDateInterval, ac as Area, ad as getChartColor, ae as monotoneX, af as OPChartTooltip, d as cn } from "./router-gBnYxPzA.js";
import { L as LogoSquare } from "./logo-BXfRcVLd.js";
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
const DEFAULT_COLOR = getChartColor(0);
const NO_MARGIN = {
  top: 4,
  right: 0,
  bottom: 0,
  left: 0
};
const FILL_OPACITY = 0.25;
const TOOLTIP_MIN_WIDTH = 140;
function RouteComponent() {
  const {
    shareId,
    demo,
    theme
  } = Route.useSearch();
  useEmbedTheme(theme);
  if (demo) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DemoTraffic, {});
  }
  if (!shareId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(MissingWidgetLink, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LiveTraffic, { shareId });
}
function DemoTraffic() {
  const {
    color,
    range,
    pages,
    referrers
  } = Route.useSearch();
  const mounted = useMounted();
  if (!mounted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(TrafficSkeleton, {});
  }
  const sample = sampleTraffic(range ?? "30d");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TrafficView, { color, data: {
    ...sample,
    pages: pages === false ? [] : sample.pages,
    referrers: referrers === false ? [] : sample.referrers
  } });
}
function LiveTraffic({
  shareId
}) {
  const {
    color
  } = Route.useSearch();
  const trpc = useTRPC();
  const {
    data,
    isLoading
  } = useQuery(trpc.widget.trafficData.queryOptions({
    shareId
  }));
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(TrafficSkeleton, {});
  }
  if (!data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "center-center col flex h-screen w-full bg-background p-4 text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LogoSquare, { className: "mb-4 size-10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-xl", children: "Widget not found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground text-sm", children: "This widget is not available or has been removed." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TrafficView, { color, data });
}
const formatDay = (date) => formatDateInterval({
  interval: "day",
  date,
  short: true
});
function TrafficView({
  data,
  color
}) {
  const number = useNumber();
  const stroke = color || DEFAULT_COLOR;
  const first = data.series[0]?.date;
  const last = data.series.at(-1)?.date;
  const lists = [data.pages.length > 0, data.referrers.length > 0].filter(Boolean).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-screen w-full flex-col bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 font-medium text-muted-foreground text-sm", children: [
          "LAST ",
          data.range === "7d" ? "7" : "30",
          " DAYS"
        ] }),
        data.project.domain && /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: data.project.domain })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-end gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Visitors", value: number.short(data.visitors) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Pageviews", value: number.short(data.pageviews) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex h-24 w-full flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-0 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { animationDuration: 0, aspectRatio: "auto", className: "h-full", data: data.series, formatDateLabel: formatDay, margin: NO_MARGIN, xDataKey: "date", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { animate: false, curve: monotoneX, dataKey: "visitors", fill: stroke, fillOpacity: FILL_OPACITY, stroke }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OPChartTooltip, { interval: "day", minWidth: TOOLTIP_MIN_WIDTH, rows: (point) => [{
            color: stroke,
            label: "Visitors",
            value: point.visitors,
            format: number.format
          }], showCrosshair: true, showDots: true })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row justify-between pt-1 text-2xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: first ? formatDay(new Date(first)) : null }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: last ? formatDay(new Date(last)) : null })
        ] })
      ] })
    ] }),
    lists > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hide-scrollbar flex-1 overflow-auto border-t p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("grid grid-cols-1 gap-6", lists === 2 && "sm:grid-cols-2"), children: [
      data.pages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(List, { title: "TOP PAGES", children: data.pages.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { count: row.count, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm", children: row.path }) }, row.path)) }),
      data.referrers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(List, { title: "TOP SOURCES", children: data.referrers.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { count: row.count, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: row.referrer }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm", children: row.referrer })
      ] }) }, row.referrer)) })
    ] }) })
  ] });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-4xl tabular-nums", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs", children: label })
  ] });
}
function List({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 font-medium text-muted-foreground text-xs", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col", children })
  ] });
}
function Row({
  children,
  count
}) {
  const number = useNumber();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mx-3 flex h-10 items-center justify-between gap-3 border-b px-3 py-2 text-sm hover:bg-foreground/5", children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 font-semibold", children: number.short(count) })
  ] });
}
const SKELETON_HEIGHTS = [40, 52, 46, 60, 38, 30, 55, 62, 58, 66, 48, 40, 64, 70, 68, 74, 56, 50, 72, 78];
function TrafficSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-screen w-full animate-pulse flex-col bg-background p-6 text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-24 rounded bg-muted" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-20 rounded bg-muted" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-20 rounded bg-muted" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex h-24 items-end gap-1", children: SKELETON_HEIGHTS.map((height, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full rounded bg-muted", style: {
      height: `${height}%`
    } }, index.toString())) })
  ] });
}
export {
  RouteComponent as component
};
//# sourceMappingURL=traffic-B3X6rfPQ.js.map
