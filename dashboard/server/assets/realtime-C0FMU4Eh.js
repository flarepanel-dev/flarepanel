import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { ag as Route, a6 as useEmbedTheme, a7 as MissingWidgetLink, a8 as useMounted, ah as sampleRealtime, a as useTRPC, j as useQuery, S as SerieIcon, ai as BarChart, aj as Bar, ad as getChartColor, af as OPChartTooltip, d as cn, ak as useQueryClient, al as useWS, a4 as useNumber } from "./router-gBnYxPzA.js";
import { A as AnimatedNumber } from "./animated-number-DKHgshrj.js";
import { L as LogoSquare } from "./logo-BXfRcVLd.js";
import { P as Ping } from "./ping-B_apCr-3.js";
import { c as countries } from "./countries-CS917BhP.js";
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
const DEFAULT_BAR_COLOR = getChartColor(0);
const BAR_RADIUS = 4;
const BAR_GAP = 0.25;
const NO_MARGIN = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};
const TOOLTIP_MIN_WIDTH = 120;
function RouteComponent() {
  const search = Route.useSearch();
  useEmbedTheme(search.theme);
  if (search.demo) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DemoRealtime, {});
  }
  if (!search.shareId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(MissingWidgetLink, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LiveRealtime, { shareId: search.shareId });
}
function DemoRealtime() {
  const {
    limit,
    color,
    countries: countries2,
    referrers,
    paths
  } = Route.useSearch();
  const mounted = useMounted();
  if (!mounted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RealtimeWidgetSkeleton, { limit });
  }
  const sample = sampleRealtime();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RealtimeView, { color, data: {
    ...sample,
    countries: countries2 === false ? [] : sample.countries,
    referrers: referrers === false ? [] : sample.referrers,
    paths: paths ? sample.paths : []
  }, limit });
}
function LiveRealtime({
  shareId
}) {
  const {
    limit,
    color
  } = Route.useSearch();
  const trpc = useTRPC();
  const {
    data: widgetData,
    isLoading
  } = useQuery(trpc.widget.realtimeData.queryOptions({
    shareId
  }));
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RealtimeWidgetSkeleton, { limit });
  }
  if (!widgetData) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "center-center col flex h-screen w-full bg-background p-4 text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LogoSquare, { className: "mb-4 size-10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-xl", children: "Widget not found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground text-sm", children: "This widget is not available or has been removed." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RealtimeWidget, { color, data: widgetData, limit, shareId });
}
function RealtimeWidget({
  shareId,
  data,
  limit,
  color
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  useWS(`/live/visitors/${data.projectId}?shareId=${shareId}`, () => {
    if (!document.hidden) {
      queryClient.refetchQueries(trpc.widget.realtimeData.queryFilter({
        shareId
      }));
    }
  }, {
    debounce: {
      delay: 1e3,
      maxWait: 6e4
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RealtimeView, { color, data, limit });
}
function RealtimeView({
  data,
  limit,
  color
}) {
  const barColor = color || DEFAULT_BAR_COLOR;
  const firstMinute = data.histogram[0]?.time;
  const lastMinute = data.histogram.at(-1)?.time;
  const grids = (() => {
    const countries2 = data.countries.length > 0 ? 1 : 0;
    const referrers = data.referrers.length > 0 ? 1 : 0;
    const paths = data.paths.length > 0 ? 1 : 0;
    const value = countries2 + referrers + paths;
    if (value === 3) {
      return "md:grid-cols-3";
    }
    if (value === 2) {
      return "md:grid-cols-2";
    }
    return "md:grid-cols-1";
  })();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-screen w-full flex-col bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-4 w-full items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Ping, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 font-medium text-muted-foreground text-sm", children: "USERS IN LAST 30 MINUTES" }),
        data.project.domain && /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: data.project.domain })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-18 font-bold text-5xl text-foreground tabular-nums", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedNumber, { value: data.liveCount }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mt-4 flex h-20 w-full flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-0 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { animationDuration: 0, aspectRatio: "auto", barGap: BAR_GAP, className: "h-full", data: data.histogram, margin: NO_MARGIN, xDataKey: "time", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { animate: false, dataKey: "sessionCount", fill: barColor, lineCap: BAR_RADIUS }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OPChartTooltip, { datePill: false, minWidth: TOOLTIP_MIN_WIDTH, rows: (point) => [{
            color: barColor,
            label: "Visitors",
            value: point.sessionCount
          }], showDots: false, title: (point) => point.time })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row justify-between pt-1 text-2xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: firstMinute }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: lastMinute })
        ] })
      ] })
    ] }),
    (data.countries.length > 0 || data.referrers.length > 0 || data.paths.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hide-scrollbar flex flex-1 flex-col gap-6 overflow-auto border-t p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("grid grid-cols-1 gap-6", grids), children: [
      data.countries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 font-medium text-muted-foreground text-xs", children: "COUNTRY" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col", children: (() => {
          const {
            visible,
            rest,
            restCount
          } = getRestItems(data.countries, limit);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            visible.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(RowItem, { count: item.count, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: item.country }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: countries[item.country] || item.country })
            ] }) }, item.country)),
            rest.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(RestRow, { firstName: countries[rest[0].country] || rest[0].country, restCount: rest.length, totalCount: restCount, type: "countries" })
          ] });
        })() })
      ] }),
      data.referrers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 font-medium text-muted-foreground text-xs", children: "REFERRER" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col", children: (() => {
          const {
            visible,
            rest,
            restCount
          } = getRestItems(data.referrers, limit);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            visible.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(RowItem, { count: item.count, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: item.referrer }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm", children: item.referrer })
            ] }) }, item.referrer)),
            rest.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(RestRow, { firstName: rest[0].referrer, restCount: rest.length, totalCount: restCount, type: "referrers" })
          ] });
        })() })
      ] }),
      data.paths.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 font-medium text-muted-foreground text-xs", children: "PATH" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col", children: (() => {
          const {
            visible,
            rest,
            restCount
          } = getRestItems(data.paths, limit);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            visible.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(RowItem, { count: item.count, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm", children: item.path }) }, item.path)),
            rest.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(RestRow, { firstName: rest[0].path, restCount: rest.length, totalCount: restCount, type: "paths" })
          ] });
        })() })
      ] })
    ] }) })
  ] });
}
function RowItem({
  children,
  count
}) {
  const number = useNumber();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mx-3 flex h-10 items-center justify-between border-b px-3 py-2 text-sm hover:bg-foreground/5", children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: number.short(count) })
  ] });
}
function getRestItems(items, limit) {
  const visible = items.slice(0, limit);
  const rest = items.slice(limit);
  const restCount = rest.reduce((sum, item) => sum + item.count, 0);
  return {
    visible,
    rest,
    restCount
  };
}
function RestRow({
  firstName,
  restCount,
  totalCount,
  type
}) {
  const number = useNumber();
  const otherCount = restCount - 1;
  const typeLabel = type === "countries" ? otherCount === 1 ? "country" : "countries" : type === "referrers" ? otherCount === 1 ? "referrer" : "referrers" : otherCount === 1 ? "path" : "paths";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mx-3 flex h-10 items-center justify-between border-b px-3 py-2 text-sm hover:bg-foreground/5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
      firstName,
      " and ",
      otherCount,
      " more ",
      typeLabel,
      "..."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: number.short(totalCount) })
  ] });
}
const SKELETON_KEYS = {
  countries: ["country-0", "country-1", "country-2", "country-3", "country-4", "country-5", "country-6", "country-7", "country-8", "country-9"],
  referrers: ["referrer-0", "referrer-1", "referrer-2", "referrer-3", "referrer-4", "referrer-5", "referrer-6", "referrer-7", "referrer-8", "referrer-9"],
  paths: ["path-0", "path-1", "path-2", "path-3", "path-4", "path-5", "path-6", "path-7", "path-8", "path-9"]
};
const SKELETON_HISTOGRAM = [24, 48, 21, 32, 19, 16, 52, 14, 11, 7, 12, 18, 25, 65, 55, 62, 9, 68, 10, 31, 58, 70, 10, 47, 43, 10, 38, 35, 41, 28];
function RealtimeWidgetSkeleton({
  limit
}) {
  const itemCount = Math.min(limit, 5);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-screen w-full animate-pulse flex-col bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b p-6 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-4 w-full items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-2 rounded-full bg-muted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 font-medium text-muted-foreground text-sm", children: "USERS IN LAST 30 MINUTES" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 shrink-0 rounded bg-muted" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row flex h-18 items-center gap-1 py-4 font-bold text-5xl tabular-nums", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-6 rounded bg-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-6 rounded bg-muted" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mt-4 flex h-20 w-full flex-col pb-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row h-full flex-1 gap-1", children: SKELETON_HISTOGRAM.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-auto h-full w-full rounded bg-muted", style: {
          height: `${item}%`
        } }, index.toString())) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row justify-between pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-8 rounded bg-muted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-8 rounded bg-muted" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hide-scrollbar flex flex-1 flex-col gap-6 overflow-auto p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 font-medium text-muted-foreground text-xs", children: "COUNTRY" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col", children: SKELETON_KEYS.countries.slice(0, itemCount).map((key) => /* @__PURE__ */ jsxRuntimeExports.jsx(RowItemSkeleton, {}, key)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 font-medium text-muted-foreground text-xs", children: "REFERRER" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col", children: SKELETON_KEYS.referrers.slice(0, itemCount).map((key) => /* @__PURE__ */ jsxRuntimeExports.jsx(RowItemSkeleton, {}, key)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 font-medium text-muted-foreground text-xs", children: "PATH" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col", children: SKELETON_KEYS.paths.slice(0, itemCount).map((key) => /* @__PURE__ */ jsxRuntimeExports.jsx(RowItemSkeleton, {}, key)) })
      ] })
    ] }) })
  ] });
}
function RowItemSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mx-3 flex h-10 items-center justify-between border-b px-3 py-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-5 rounded bg-muted" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-24 rounded bg-muted" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-8 rounded bg-muted" })
  ] });
}
export {
  RouteComponent as component
};
//# sourceMappingURL=realtime-C0FMU4Eh.js.map
