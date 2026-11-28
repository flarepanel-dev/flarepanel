import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, i as fancyMinutes, co as ChevronRight, d as cn, cK as OverviewMetricCard, c4 as useQueryState, cS as parseAsStringEnum, E as EmptyState, eC as Zap, bC as formatTime, gW as EventIcon, hA as SkipBack, c3 as RotateCcw, hB as SkipForward, hC as Pause, hs as Play, bE as Tooltiper, hD as ScrollArea, en as Lock, dA as TooltipProvider, cB as Tooltip, cC as TooltipTrigger, cE as TooltipContent, a as useTRPC, j as useQuery, ak as useQueryClient, hE as Route$1, hF as useSessionEvents, h as getProfileName, eX as ProfileAvatar, B as Button, eT as Video, bA as clipboard, bz as Copy, bn as formatDateTime, bU as Calendar, ca as Clock, S as SerieIcon, e4 as LoaderCircle, aD as Alert, aF as AlertDescription, hG as MAX_SESSION_EVENTS, A as Link, dy as ArrowRight } from "./router-gBnYxPzA.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { A as AiUsageWidget } from "./ai-usage-widget-BIinfAEm.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader$1 } from "./page-header-DbGieVLw.js";
import { M as MostEvents } from "./most-events-DZTLKeUn.js";
import { W as WidgetHead, d as WidgetTitle, a as WidgetButtons } from "./overview-widget-q0VDaTtp.js";
import { b as Widget, a as WidgetHead$1, c as WidgetTitle$1, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { R as Route } from "./route-Cx_TL1Oz.js";
import { K as KeyValueGrid } from "./key-value-grid-BaTCXsBI.js";
import { u as useEventDrawer } from "./use-event-drawer-DCAhkqzM.js";
import { R as RotateCw } from "./rotate-cw-59NMbvpf.js";
import { a as useEntityPageContext } from "./use-page-context-helpers-DUMZv3Xw.js";
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
import "./ai-cost-C8tzxtic.js";
import "./last-C7omGuiv.js";
import "./countries-CS917BhP.js";
const __iconNode$4 = [
  [
    "path",
    { d: "M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z", key: "b19h5q" }
  ],
  [
    "path",
    { d: "M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z", key: "h7h5ge" }
  ]
];
const FastForward = createLucideIcon("fast-forward", __iconNode$4);
const __iconNode$3 = [
  ["path", { d: "M8 5h13", key: "1pao27" }],
  ["path", { d: "M13 12h8", key: "h98zly" }],
  ["path", { d: "M13 19h8", key: "c3s6r1" }],
  ["path", { d: "M3 10a2 2 0 0 0 2 2h3", key: "1npucw" }],
  ["path", { d: "M3 5v12a2 2 0 0 0 2 2h3", key: "x1gjn2" }]
];
const ListTree = createLucideIcon("list-tree", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "m21 3-7 7", key: "1l2asr" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M9 21H3v-6", key: "wtvkvv" }]
];
const Maximize2 = createLucideIcon("maximize-2", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "m14 10 7-7", key: "oa77jy" }],
  ["path", { d: "M20 10h-6V4", key: "mjg0md" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M4 14h6v6", key: "rmj7iw" }]
];
const Minimize2 = createLucideIcon("minimize-2", __iconNode$1);
const __iconNode = [
  [
    "path",
    { d: "M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196", key: "w8jjjt" }
  ],
  ["path", { d: "M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2", key: "1xawa7" }],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
const VideoOff = createLucideIcon("video-off", __iconNode);
const MS_PER_SECOND$4 = 1e3;
const MIN_BAR_PERCENT = 4;
function StepBadge({ label, tone }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "rounded px-1 py-px font-semibold text-[10px] uppercase tracking-wider",
        tone === "entry" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
      ),
      children: label
    }
  );
}
function SessionJourney({ visits }) {
  const pages = visits.filter((visit) => visit.view !== null);
  if (pages.length === 0) {
    return null;
  }
  const longest = Math.max(...pages.map((page) => page.durationMs), 1);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTitle, { icon: Route, children: "Journey" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "row items-stretch overflow-x-auto p-4", children: pages.map((page, index) => {
      const isFirst = index === 0;
      const isLast = index === pages.length - 1;
      const customEvents = page.events.length;
      const barWidth = Math.max(
        MIN_BAR_PERCENT,
        page.durationMs / longest * 100
      );
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "row shrink-0 items-center",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col w-36 gap-1.5 rounded-lg border bg-def-100 px-3 py-2.5 transition-colors hover:border-def-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-2xs text-muted-foreground tabular-nums", children: index + 1 }),
                isFirst && /* @__PURE__ */ jsxRuntimeExports.jsx(StepBadge, { label: "Entry", tone: "entry" }),
                isLast && /* @__PURE__ */ jsxRuntimeExports.jsx(StepBadge, { label: "Exit", tone: "exit" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "truncate font-medium text-sm",
                  title: page.path,
                  children: page.path
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 overflow-hidden rounded-full bg-def-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-full rounded-full bg-highlight",
                  style: { width: `${barWidth}%` }
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xs text-muted-foreground tabular-nums", children: [
                fancyMinutes(page.durationMs / MS_PER_SECOND$4),
                customEvents > 0 && ` · ${customEvents} ${customEvents === 1 ? "event" : "events"}`
              ] })
            ] }),
            !isLast && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "mx-1 size-4 shrink-0 text-def-400" })
          ]
        },
        page.view?.id ?? index
      );
    }) })
  ] });
}
const COLUMNS_BY_COUNT = {
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6"
};
const MS_PER_SECOND$3 = 1e3;
function SessionMetrics({
  session,
  events
}) {
  const pageViews = events.filter((event) => event.name === "screen_view");
  const uniquePages = new Set(pageViews.map((event) => event.path || "/")).size;
  const durationSeconds = session.duration / MS_PER_SECOND$3;
  const hasPageViews = session.screenViewCount > 0;
  const metrics = [
    { key: "duration", label: "Duration", value: durationSeconds, unit: "min" },
    {
      key: "screenViews",
      label: "Page views",
      value: session.screenViewCount,
      unit: ""
    },
    { key: "uniquePages", label: "Unique pages", value: uniquePages, unit: "" },
    { key: "events", label: "Events", value: session.eventCount, unit: "" },
    ...hasPageViews ? [
      {
        key: "timePerPage",
        label: "Time per page",
        value: durationSeconds / session.screenViewCount,
        unit: "min"
      }
    ] : [],
    ...session.revenue > 0 ? [
      {
        key: "revenue",
        label: "Revenue",
        value: session.revenue,
        unit: "currency"
      }
    ] : []
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "card grid grid-cols-2 overflow-hidden rounded-md md:grid-cols-3",
        COLUMNS_BY_COUNT[metrics.length]
      ),
      children: metrics.map((metric) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        OverviewMetricCard,
        {
          data: [],
          id: metric.key,
          isLoading: false,
          label: metric.label,
          metric: { current: metric.value, previous: null },
          unit: metric.unit
        },
        metric.key
      ))
    }
  );
}
function toMs$1(date) {
  return date instanceof Date ? date.getTime() : new Date(date).getTime();
}
function pagePath(event) {
  return event.path || "/";
}
function compareEvents(a, b) {
  const difference = toMs$1(a.createdAt) - toMs$1(b.createdAt);
  const aIsView = a.name === "screen_view";
  const bIsView = b.name === "screen_view";
  if (difference !== 0 || aIsView === bIsView) {
    return difference;
  }
  const view = aIsView ? a : b;
  const other = aIsView ? b : a;
  const viewGoesFirst = pagePath(other) === pagePath(view);
  return viewGoesFirst === aIsView ? -1 : 1;
}
function sortEventsAscending(events) {
  return [...events].sort(compareEvents);
}
function groupEventsByPage(events, sessionEndedAt) {
  const visits = [];
  for (const event of sortEventsAscending(events)) {
    const isPageView = event.name === "screen_view";
    const current = visits.at(-1);
    if (isPageView || !current) {
      visits.push({
        view: isPageView ? event : null,
        path: isPageView ? pagePath(event) : "",
        startedAt: toMs$1(event.createdAt),
        durationMs: 0,
        events: isPageView ? [] : [event]
      });
      continue;
    }
    current.events.push(event);
  }
  const endedAt = toMs$1(sessionEndedAt);
  for (const [index, visit] of visits.entries()) {
    const next = visits[index + 1];
    const lastEvent = visit.events.at(-1);
    const end = next?.startedAt ?? Math.max(endedAt, lastEvent ? toMs$1(lastEvent.createdAt) : 0);
    visit.durationMs = Math.max(0, end - visit.startedAt);
  }
  return visits;
}
function getElapsedMs(event, sessionStart) {
  return Math.max(0, toMs$1(event.createdAt) - toMs$1(sessionStart));
}
const TABS = [
  { key: "session", label: "Session" },
  { key: "source", label: "Source" },
  { key: "device", label: "Device" }
];
const MS_PER_SECOND$2 = 1e3;
function sessionAsEvent(session) {
  return {
    ...session,
    name: "screen_view",
    sessionId: session.id,
    properties: {},
    path: session.exitPath,
    origin: session.exitOrigin,
    importedAt: void 0,
    meta: void 0,
    sdkName: void 0,
    sdkVersion: void 0,
    profile: void 0
  };
}
function withVersion(name, version) {
  return version ? `${name} ${version}` : name;
}
function getItems(session, tab) {
  const event = sessionAsEvent(session);
  const items = {
    session: [
      { name: "id", value: session.id },
      { name: "createdAt", value: session.createdAt },
      { name: "endedAt", value: session.endedAt },
      {
        name: "duration",
        value: fancyMinutes(session.duration / MS_PER_SECOND$2)
      },
      { name: "entryPath", value: session.entryPath },
      { name: "exitPath", value: session.exitPath },
      { name: "bounce", value: session.isBounce ? "Yes" : "No" },
      { name: "deviceId", value: session.deviceId }
    ],
    source: [
      { name: "referrerName", value: session.referrerName, event },
      { name: "referrerType", value: session.referrerType, event },
      { name: "referrer", value: session.referrer, event },
      { name: "utmSource", value: session.utmSource },
      { name: "utmMedium", value: session.utmMedium },
      { name: "utmCampaign", value: session.utmCampaign },
      { name: "utmContent", value: session.utmContent },
      { name: "utmTerm", value: session.utmTerm }
    ],
    device: [
      { name: "country", value: session.country, event },
      { name: "region", value: session.region, event },
      { name: "city", value: session.city, event },
      { name: "device", value: session.device, event },
      { name: "os", value: withVersion(session.os, session.osVersion) },
      {
        name: "browser",
        value: withVersion(session.browser, session.browserVersion)
      },
      { name: "brand", value: session.brand, event },
      { name: "model", value: session.model, event }
    ]
  };
  return items[tab].filter(
    (item) => item.value !== "" && item.value !== null && item.value !== void 0
  );
}
function SessionProperties({ session }) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringEnum(TABS.map((t) => t.key)).withDefault("session")
  );
  const items = getItems(session, tab);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetHead, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "title", children: "Details" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetButtons, { children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: cn(t.key === tab && "active"),
          onClick: () => setTab(t.key),
          type: "button",
          children: t.label
        },
        t.key
      )) })
    ] }),
    items.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(KeyValueGrid, { className: "border-0", columns: 1, copyable: true, data: items }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-muted-foreground text-sm", children: "Nothing recorded for this session." })
  ] });
}
const RRWEB_META = 4;
const RRWEB_INCREMENTAL = 3;
const SOURCE_MOUSE_MOVE = 1;
const SOURCE_MOUSE_INTERACTION = 2;
const SOURCE_SCROLL = 3;
const SOURCE_INPUT = 5;
const SOURCE_TOUCH_MOVE = 6;
const INTERACTION_CLICK = 2;
const USER_SOURCES = /* @__PURE__ */ new Set([
  SOURCE_MOUSE_MOVE,
  SOURCE_MOUSE_INTERACTION,
  SOURCE_SCROLL,
  SOURCE_INPUT,
  SOURCE_TOUCH_MOVE
]);
const RAGE_CLICK_MIN_CLICKS = 3;
const RAGE_CLICK_WINDOW_MS = 1e3;
const RAGE_CLICK_RADIUS_PX = 30;
function toMs(date) {
  return date instanceof Date ? date.getTime() : new Date(date).getTime();
}
function getEventOffsetMs(event, startTime) {
  return toMs(event.createdAt) - startTime;
}
function sortEventsByOffset(events, startTime) {
  const withOffsets = sortEventsAscending(events).map((event) => ({
    event,
    offsetMs: getEventOffsetMs(event, startTime)
  }));
  const isEarly = ({ offsetMs }) => offsetMs < -1e4;
  const openingView = withOffsets.filter((item) => isEarly(item) && item.event.name === "screen_view").at(-1);
  return withOffsets.filter((item) => !isEarly(item) || item === openingView);
}
function findLastIndexAtTime(sorted, timeMs) {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if ((sorted[mid]?.offsetMs ?? 0) <= timeMs) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo - 1;
}
function getPageSegments(sorted, durationMs) {
  const views = sorted.filter(({ event }) => event.name === "screen_view");
  return views.map(({ event, offsetMs }, index) => {
    const next = views[index + 1];
    return {
      id: event.id,
      path: event.path || "/",
      origin: event.origin ?? "",
      startMs: Math.max(0, offsetMs),
      endMs: Math.min(durationMs, next ? next.offsetMs : durationMs)
    };
  });
}
function getRecordedDimensions(events) {
  const meta = events.find((event) => event.type === RRWEB_META);
  if (meta && typeof meta.data === "object" && meta.data !== null && "width" in meta.data && "height" in meta.data) {
    const { width, height } = meta.data;
    if (width > 0 && height > 0) {
      return { width, height };
    }
  }
  return null;
}
function getIncrementalData(event) {
  if (event.type !== RRWEB_INCREMENTAL) {
    return null;
  }
  if (typeof event.data !== "object" || event.data === null) {
    return null;
  }
  return event.data;
}
function isUserInteraction(event) {
  const data = getIncrementalData(event);
  return data?.source !== void 0 && USER_SOURCES.has(data.source);
}
function getClick(event) {
  const data = getIncrementalData(event);
  const isClick = data?.source === SOURCE_MOUSE_INTERACTION && data.type === INTERACTION_CLICK;
  if (!isClick) {
    return null;
  }
  return { timestamp: event.timestamp, x: data.x ?? 0, y: data.y ?? 0 };
}
function detectRageClicks(clicks, startTime) {
  const sorted = [...clicks].sort((a, b) => a.timestamp - b.timestamp);
  const counted = /* @__PURE__ */ new Set();
  const rageClicks = [];
  for (const [index, first] of sorted.entries()) {
    if (counted.has(index)) {
      continue;
    }
    const burst = [index];
    for (let next = index + 1; next < sorted.length; next++) {
      const click = sorted[next];
      if (click.timestamp - first.timestamp > RAGE_CLICK_WINDOW_MS) {
        break;
      }
      const samePlace = Math.hypot(click.x - first.x, click.y - first.y) <= RAGE_CLICK_RADIUS_PX;
      if (samePlace && !counted.has(next)) {
        burst.push(next);
      }
    }
    if (burst.length >= RAGE_CLICK_MIN_CLICKS) {
      for (const member of burst) {
        counted.add(member);
      }
      rageClicks.push({
        offsetMs: first.timestamp - startTime,
        clicks: burst.length
      });
    }
  }
  return rageClicks;
}
function getActivityHistogram(timestamps, startTime, durationMs, buckets) {
  const counts = new Array(buckets).fill(0);
  if (durationMs <= 0) {
    return counts;
  }
  for (const timestamp of timestamps) {
    const ratio = (timestamp - startTime) / durationMs;
    if (ratio < 0 || ratio > 1) {
      continue;
    }
    const bucket = Math.min(buckets - 1, Math.floor(ratio * buckets));
    counts[bucket] = (counts[bucket] ?? 0) + 1;
  }
  const max = Math.max(...counts, 1);
  return counts.map((count) => Math.sqrt(count / max));
}
function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1e3));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function getEventLabel(event) {
  if (event.name === "screen_view" && event.path) {
    return event.path;
  }
  return event.name.replace(/_/g, " ");
}
const MS_PER_SECOND$1 = 1e3;
const MAX_PROPERTY_CHIPS$1 = 3;
const MAX_CHIP_VALUE_LENGTH$1 = 32;
function getPropertyChips$1(event) {
  return Object.entries(event.properties ?? {}).filter(
    ([key, value]) => !key.startsWith("__") && (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
  ).slice(0, MAX_PROPERTY_CHIPS$1).map(([key, value]) => {
    const text = String(value);
    return [
      key,
      text.length > MAX_CHIP_VALUE_LENGTH$1 ? `${text.slice(0, MAX_CHIP_VALUE_LENGTH$1)}…` : text
    ];
  });
}
function Elapsed({ ms }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-2xs text-muted-foreground tabular-nums", children: [
    "+",
    formatDuration(ms)
  ] });
}
function EventRow({
  event,
  sessionStart,
  onOpen
}) {
  const chips = getPropertyChips$1(event);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-3.5 left-[-21px] size-2 rounded-full border-2 border-card bg-def-400" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "row w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-def-100",
        onClick: onOpen,
        type: "button",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(EventIcon, { meta: event.meta, name: event.name, size: "xs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "col min-w-0 flex-1 gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm", children: event.name.replace(/_/g, " ") }),
            chips.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "row flex-wrap gap-1", children: chips.map(([key, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: "max-w-full truncate rounded bg-def-200 px-1.5 py-px font-mono text-2xs",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: key }),
                  " ",
                  value
                ]
              },
              key
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "leading-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Elapsed, { ms: getElapsedMs(event, sessionStart) }) })
        ]
      }
    )
  ] });
}
function PageHeader({
  visit,
  index,
  sessionStart,
  onOpen
}) {
  const view = visit.view;
  const content = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    view ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1/2 left-[-27px] grid size-5 -translate-y-1/2 place-items-center rounded-full bg-highlight font-semibold text-[10px] text-white ring-4 ring-card", children: index }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1/2 left-[-22px] size-2.5 -translate-y-1/2 rounded-full bg-def-400 ring-4 ring-card" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "col min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-semibold", children: view ? visit.path : "Session started" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xs text-muted-foreground", children: [
        formatTime(new Date(visit.startedAt)),
        view && ` · ${fancyMinutes(visit.durationMs / MS_PER_SECOND$1)} on page`
      ] })
    ] }),
    view && /* @__PURE__ */ jsxRuntimeExports.jsx(Elapsed, { ms: getElapsedMs(view, sessionStart) })
  ] });
  if (!onOpen) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row relative items-center gap-3 px-2 py-2", children: content });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      className: "row relative w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-def-100",
      onClick: onOpen,
      type: "button",
      children: content
    }
  );
}
function SessionTimeline({
  visits,
  sessionStart
}) {
  const { openEvent } = useEventDrawer();
  const open = (event) => openEvent({ id: event.id, createdAt: event.createdAt });
  let pageNumber = 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTitle, { icon: ListTree, children: "Timeline" }) }),
    visits.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        description: "This session has no events in it.",
        icon: Zap,
        title: "No events",
        variant: "inline"
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "col gap-1 py-3 pr-3 pl-10", children: visits.map((visit, index) => {
      const view = visit.view;
      if (view) {
        pageNumber++;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "relative before:absolute before:top-0 before:bottom-0 before:left-[-17px] before:w-px before:bg-border first:before:top-5 last:before:bottom-auto last:before:h-5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              PageHeader,
              {
                index: pageNumber,
                onOpen: view ? () => open(view) : void 0,
                sessionStart,
                visit
              }
            ),
            visit.events.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "col gap-0.5 pb-2", children: visit.events.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              EventRow,
              {
                event,
                onOpen: () => open(event),
                sessionStart
              },
              event.id
            )) })
          ]
        },
        view?.id ?? `pre-${index}`
      );
    }) })
  ] });
}
const SPEED_OPTIONS = [0.5, 1, 2, 4, 8];
const DEFAULT_SPEED = 1;
const DEFAULT_SKIP_INACTIVE = true;
const ReplayContext = reactExports.createContext(null);
function useReplayContext() {
  const ctx = reactExports.useContext(ReplayContext);
  if (!ctx) {
    throw new Error("useReplayContext must be used within ReplayProvider");
  }
  return ctx;
}
function useCurrentTime(intervalMs = 0) {
  const { currentTimeRef, subscribeToCurrentTime } = useReplayContext();
  const [time, setTime] = reactExports.useState(currentTimeRef.current);
  const lastUpdateRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    return subscribeToCurrentTime((t) => {
      if (intervalMs === 0) {
        setTime(t);
        return;
      }
      const now = performance.now();
      if (now - lastUpdateRef.current >= intervalMs) {
        lastUpdateRef.current = now;
        setTime(t);
      }
    });
  }, [subscribeToCurrentTime, intervalMs]);
  return time;
}
const EMPTY_ACTIVITY = { interactions: [], clicks: [] };
function ReplayProvider({ children }) {
  const playerRef = reactExports.useRef(null);
  const isPlayingRef = reactExports.useRef(false);
  const currentTimeRef = reactExports.useRef(0);
  const listenersRef = reactExports.useRef(/* @__PURE__ */ new Set());
  const activityRef = reactExports.useRef({
    interactions: [],
    clicks: []
  });
  const [isPlaying, setIsPlaying] = reactExports.useState(false);
  const [isSkipping, setIsSkipping] = reactExports.useState(false);
  const [duration, setDuration] = reactExports.useState(0);
  const [startTime, setStartTime] = reactExports.useState(null);
  const [isReady, setIsReady] = reactExports.useState(false);
  const [speed, setSpeedState] = reactExports.useState(DEFAULT_SPEED);
  const [skipInactive, setSkipInactive] = reactExports.useState(DEFAULT_SKIP_INACTIVE);
  const [activity, setActivity] = reactExports.useState(EMPTY_ACTIVITY);
  const setIsPlayingWithRef = reactExports.useCallback((playing) => {
    isPlayingRef.current = playing;
    setIsPlaying(playing);
  }, []);
  const subscribeToCurrentTime = reactExports.useCallback((fn) => {
    listenersRef.current.add(fn);
    return () => {
      listenersRef.current.delete(fn);
    };
  }, []);
  const setCurrentTime = reactExports.useCallback((t) => {
    currentTimeRef.current = t;
    for (const fn of listenersRef.current) {
      fn(t);
    }
  }, []);
  const collectActivity = reactExports.useCallback((event) => {
    if (!isUserInteraction(event)) {
      return;
    }
    activityRef.current.interactions.push(event.timestamp);
    const click = getClick(event);
    if (click) {
      activityRef.current.clicks.push(click);
    }
  }, []);
  const publishActivity = reactExports.useCallback(() => {
    setActivity({
      interactions: [...activityRef.current.interactions],
      clicks: [...activityRef.current.clicks]
    });
  }, []);
  const refreshDuration = reactExports.useCallback(() => {
    queueMicrotask(() => {
      const total = playerRef.current?.getMetaData().totalTime ?? 0;
      if (total > 0) {
        setDuration(total);
      }
      publishActivity();
    });
  }, [publishActivity]);
  const onPlayerReady = reactExports.useCallback(
    (player, initialEvents) => {
      playerRef.current = player;
      activityRef.current = { interactions: [], clicks: [] };
      for (const event of initialEvents) {
        collectActivity(event);
      }
      setStartTime(player.getMetaData().startTime);
      currentTimeRef.current = 0;
      setIsPlayingWithRef(false);
      setSpeedState(DEFAULT_SPEED);
      setSkipInactive(DEFAULT_SKIP_INACTIVE);
      refreshDuration();
      setIsReady(true);
    },
    [collectActivity, refreshDuration, setIsPlayingWithRef]
  );
  const onPlayerDestroy = reactExports.useCallback(() => {
    playerRef.current = null;
    setIsReady(false);
    currentTimeRef.current = 0;
    setDuration(0);
    setStartTime(null);
    setIsPlayingWithRef(false);
    setIsSkipping(false);
    setActivity(EMPTY_ACTIVITY);
  }, [setIsPlayingWithRef]);
  const play = reactExports.useCallback(() => {
    playerRef.current?.play();
  }, []);
  const pause = reactExports.useCallback(() => {
    playerRef.current?.pause();
  }, []);
  const toggle = reactExports.useCallback(() => {
    playerRef.current?.toggle();
  }, []);
  const seek = reactExports.useCallback((timeMs) => {
    playerRef.current?.goto(Math.max(0, timeMs), isPlayingRef.current);
  }, []);
  const setSpeed = reactExports.useCallback((next) => {
    playerRef.current?.setSpeed(next);
    setSpeedState(next);
  }, []);
  const toggleSkipInactive = reactExports.useCallback(() => {
    playerRef.current?.toggleSkipInactive();
    setSkipInactive((current) => !current);
  }, []);
  const addEvent = reactExports.useCallback(
    (event) => {
      playerRef.current?.addEvent(event);
      collectActivity(event);
    },
    [collectActivity]
  );
  const value = {
    currentTimeRef,
    subscribeToCurrentTime,
    isPlaying,
    isSkipping,
    duration,
    startTime,
    isReady,
    speed,
    skipInactive,
    activity,
    play,
    pause,
    toggle,
    seek,
    setSpeed,
    toggleSkipInactive,
    addEvent,
    refreshDuration,
    onPlayerReady,
    onPlayerDestroy,
    setCurrentTime,
    setIsPlaying: setIsPlayingWithRef,
    setIsSkipping
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ReplayContext.Provider, { value, children });
}
const JUMP_MS = 1e4;
const PREVIOUS_EVENT_GRACE_MS = 1500;
function ControlButton({
  label,
  shortcut,
  onClick,
  children,
  active,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Tooltiper,
    {
      asChild: true,
      content: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        label,
        shortcut && /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "ml-2 rounded border bg-def-100 px-1 font-mono text-2xs text-muted-foreground", children: shortcut })
      ] }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          "aria-label": label,
          className: cn(
            "flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-muted-foreground transition-colors hover:bg-def-200 hover:text-foreground",
            active && "bg-highlight/10 text-highlight hover:bg-highlight/15",
            className
          ),
          onClick,
          type: "button",
          children
        }
      )
    }
  );
}
function ReplayPlayPauseButton({ size = "md" }) {
  const { isPlaying, isReady, toggle } = useReplayContext();
  const isLarge = size === "lg";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      "aria-label": isPlaying ? "Pause" : "Play",
      className: cn(
        "flex shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-40",
        isLarge ? "size-16 shadow-2xl" : "size-9"
      ),
      disabled: !isReady,
      onClick: toggle,
      type: "button",
      children: isPlaying ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pause,
        {
          className: isLarge ? "size-6" : "size-4",
          fill: "currentColor"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        Play,
        {
          className: cn("translate-x-px", isLarge ? "size-6" : "size-4"),
          fill: "currentColor"
        }
      )
    }
  );
}
function ReplayTime() {
  const { duration } = useReplayContext();
  const currentTime = useCurrentTime(250);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs tabular-nums", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: formatDuration(currentTime) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
      " ",
      "/ ",
      formatDuration(duration)
    ] })
  ] });
}
function useEventJumps(events) {
  const { currentTimeRef, seek } = useReplayContext();
  const next = reactExports.useCallback(() => {
    const target = events.find(
      ({ offsetMs }) => offsetMs > currentTimeRef.current + 1
    );
    if (target) {
      seek(target.offsetMs);
    }
  }, [events, currentTimeRef, seek]);
  const previous = reactExports.useCallback(() => {
    const target = events.filter(
      ({ offsetMs }) => offsetMs < currentTimeRef.current - PREVIOUS_EVENT_GRACE_MS
    ).at(-1);
    seek(target ? target.offsetMs : 0);
  }, [events, currentTimeRef, seek]);
  return { next, previous };
}
function useFullscreen(target) {
  const [isFullscreen, setIsFullscreen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === target.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [target]);
  const toggle = reactExports.useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      target.current?.requestFullscreen();
    }
  }, [target]);
  return { isFullscreen, toggle };
}
function nextSpeed(current, direction) {
  const index = SPEED_OPTIONS.indexOf(
    current
  );
  const nextIndex = Math.max(
    0,
    Math.min(SPEED_OPTIONS.length - 1, index + direction)
  );
  return SPEED_OPTIONS[nextIndex] ?? SPEED_OPTIONS[1];
}
function useReplayHotkeys({
  events,
  scope,
  onFullscreen
}) {
  const {
    isReady,
    toggle,
    seek,
    currentTimeRef,
    duration,
    speed,
    setSpeed,
    toggleSkipInactive
  } = useReplayContext();
  const jumps = useEventJumps(events);
  reactExports.useEffect(() => {
    if (!isReady) {
      return;
    }
    const onKeyDown = (e) => {
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey;
      const isInScope = e.target === document.body || e.target instanceof Node && scope.current?.contains(e.target);
      if (hasModifier || !isInScope) {
        return;
      }
      const actions = {
        " ": toggle,
        k: toggle,
        j: () => seek(currentTimeRef.current - JUMP_MS),
        l: () => seek(Math.min(duration, currentTimeRef.current + JUMP_MS)),
        ",": jumps.previous,
        ".": jumps.next,
        "<": () => setSpeed(nextSpeed(speed, -1)),
        ">": () => setSpeed(nextSpeed(speed, 1)),
        i: toggleSkipInactive,
        f: onFullscreen
      };
      const action = actions[e.key];
      if (!action) {
        return;
      }
      const isButton = e.target instanceof HTMLButtonElement;
      if (e.key === " " && isButton) {
        return;
      }
      e.preventDefault();
      action();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    isReady,
    toggle,
    seek,
    currentTimeRef,
    duration,
    speed,
    setSpeed,
    toggleSkipInactive,
    jumps,
    scope,
    onFullscreen
  ]);
}
function ReplayControls({
  events,
  fullscreenTarget
}) {
  const {
    isReady,
    seek,
    currentTimeRef,
    duration,
    speed,
    setSpeed,
    skipInactive,
    toggleSkipInactive
  } = useReplayContext();
  const jumps = useEventJumps(events);
  const fullscreen = useFullscreen(fullscreenTarget);
  useReplayHotkeys({
    events,
    scope: fullscreenTarget,
    onFullscreen: fullscreen.toggle
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "row items-center gap-1 transition-opacity",
        !isReady && "pointer-events-none opacity-40"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReplayPlayPauseButton, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row ml-2 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ControlButton,
            {
              label: "Previous event",
              onClick: jumps.previous,
              shortcut: ",",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipBack, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ControlButton,
            {
              label: "Back 10 seconds",
              onClick: () => seek(currentTimeRef.current - JUMP_MS),
              shortcut: "J",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ControlButton,
            {
              label: "Forward 10 seconds",
              onClick: () => seek(Math.min(duration, currentTimeRef.current + JUMP_MS)),
              shortcut: "L",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ControlButton, { label: "Next event", onClick: jumps.next, shortcut: ".", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipForward, { className: "size-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReplayTime, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row ml-auto items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            ControlButton,
            {
              active: skipInactive,
              className: "gap-1.5 px-2.5 font-medium text-xs",
              label: skipInactive ? "Skipping idle time" : "Skip idle time",
              onClick: toggleSkipInactive,
              shortcut: "I",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FastForward, { className: "size-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Skip idle" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            ControlButton,
            {
              className: "w-11 font-mono font-semibold text-xs tabular-nums",
              label: "Playback speed",
              onClick: () => {
                const index = SPEED_OPTIONS.indexOf(speed);
                setSpeed(SPEED_OPTIONS[(index + 1) % SPEED_OPTIONS.length]);
              },
              shortcut: "< >",
              children: [
                speed,
                "×"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ControlButton,
            {
              label: fullscreen.isFullscreen ? "Exit fullscreen" : "Fullscreen",
              onClick: fullscreen.toggle,
              shortcut: "F",
              children: fullscreen.isFullscreen ? /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize2, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "size-4" })
            }
          )
        ] })
      ]
    }
  );
}
const MAX_PROPERTY_CHIPS = 2;
const MAX_CHIP_VALUE_LENGTH = 24;
function getPropertyChips(event) {
  return Object.entries(event.properties ?? {}).filter(
    ([key, value]) => !key.startsWith("__") && (typeof value === "string" || typeof value === "number")
  ).slice(0, MAX_PROPERTY_CHIPS).map(([key, value]) => {
    const text = String(value);
    const shortened = text.length > MAX_CHIP_VALUE_LENGTH ? `${text.slice(0, MAX_CHIP_VALUE_LENGTH)}…` : text;
    return `${key}: ${shortened}`;
  });
}
function ReplayEventItem({
  event,
  offsetMs,
  state,
  onClick
}) {
  const isPageView = event.name === "screen_view";
  const chips = isPageView ? [] : getPropertyChips(event);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      className: cn(
        "group row relative w-full items-start gap-2.5 py-1.5 pr-3 text-left transition-all duration-300",
        isPageView ? "pl-3" : "pl-7",
        state === "future" && "opacity-35 hover:opacity-80",
        state === "current" && "bg-highlight/[0.07]"
      ),
      "data-replay-state": state,
      onClick,
      type: "button",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: cn(
              "absolute inset-y-0 left-0 w-0.5 rounded-r bg-highlight transition-opacity",
              state === "current" ? "opacity-100" : "opacity-0"
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          EventIcon,
          {
            className: "mt-px",
            meta: event.meta,
            name: event.name,
            size: isPageView ? "sm" : "xs"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "col min-w-0 flex-1 gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "truncate group-hover:text-foreground",
                isPageView ? "font-semibold text-sm" : "text-foreground/80 text-sm",
                isPageView && "leading-6"
              ),
              children: getEventLabel(event)
            }
          ),
          chips.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "row flex-wrap gap-1", children: chips.map((chip) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "max-w-full truncate rounded bg-def-200 px-1.5 py-px font-mono text-2xs text-muted-foreground",
              children: chip
            },
            chip
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: cn(
              "shrink-0 font-mono text-2xs tabular-nums",
              isPageView ? "leading-6" : "leading-5",
              state === "current" ? "text-highlight" : "text-muted-foreground"
            ),
            children: formatDuration(Math.max(0, offsetMs))
          }
        )
      ]
    }
  );
}
const MANUAL_SCROLL_PAUSE_MS = 4e3;
const SKELETON_ROWS = Array.from({ length: 6 }, (_, index) => ({
  id: `skeleton-${index}`,
  width: 40 + index * 17 % 45
}));
function getState(index, currentIndex) {
  if (index === currentIndex) {
    return "current";
  }
  return index < currentIndex ? "past" : "future";
}
function ReplayEventFeed({
  events,
  currentIndex,
  isLoading
}) {
  const { seek } = useReplayContext();
  const viewportRef = reactExports.useRef(null);
  const lastManualScrollRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    const viewport = viewportRef.current;
    const isUserScrolling = performance.now() - lastManualScrollRef.current < MANUAL_SCROLL_PAUSE_MS;
    if (!viewport || isUserScrolling) {
      return;
    }
    const current = viewport.querySelector(
      '[data-replay-state="current"]'
    );
    if (!current) {
      return;
    }
    const top = current.offsetTop - viewport.clientHeight / 2 + current.clientHeight / 2;
    viewport.scrollTo({ top, behavior: "smooth" });
  }, [currentIndex]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col h-full min-h-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center justify-between border-b px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Activity" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-muted-foreground text-xs tabular-nums", children: [
        Math.max(0, currentIndex + 1),
        " / ",
        events.length
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScrollArea,
      {
        className: "min-h-0 flex-1",
        onWheel: () => {
          lastManualScrollRef.current = performance.now();
        },
        ref: viewportRef,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col py-1", children: [
          isLoading && SKELETON_ROWS.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2.5 px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-6 shrink-0 animate-pulse rounded-full bg-def-200" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-3 animate-pulse rounded bg-def-200",
                style: { width: `${row.width}%` }
              }
            )
          ] }, row.id)),
          !isLoading && events.map(({ event, offsetMs }, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ReplayEventItem,
            {
              event,
              offsetMs,
              onClick: () => seek(offsetMs),
              state: getState(index, currentIndex)
            },
            event.id
          )),
          !isLoading && events.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-10 text-center text-muted-foreground text-sm", children: "No events were tracked during this recording." })
        ] })
      }
    )
  ] });
}
const FALLBACK_ASPECT_RATIO = 16 / 9;
const STAGE_PADDING = 24;
const BROWSER_BAR_HEIGHT = 36;
const PHONE_BEZEL = 10;
const PHONE_URL_HEIGHT = 36;
const MOUSE_TAIL = {
  duration: 600,
  lineCap: "round",
  lineWidth: 3,
  strokeStyle: "rgba(34, 102, 236, 0.45)"
};
function fitViewport(area, aspectRatio, kind) {
  const chromeWidth = kind === "phone" ? PHONE_BEZEL * 2 : 0;
  const chromeHeight = kind === "phone" ? PHONE_BEZEL * 2 + PHONE_URL_HEIGHT : BROWSER_BAR_HEIGHT;
  const maxWidth = Math.max(0, area.width - STAGE_PADDING * 2 - chromeWidth);
  const maxHeight = Math.max(0, area.height - STAGE_PADDING * 2 - chromeHeight);
  const height = Math.min(maxHeight, maxWidth / aspectRatio);
  return {
    width: Math.round(height * aspectRatio),
    height: Math.round(height)
  };
}
function getStageFitHeight(events) {
  const recorded = getRecordedDimensions(events);
  const aspectRatio = recorded ? recorded.width / recorded.height : FALLBACK_ASPECT_RATIO;
  if (aspectRatio < 1) {
    return "100vh";
  }
  const verticalChrome = STAGE_PADDING * 2 + BROWSER_BAR_HEIGHT;
  return `calc((100cqw - ${STAGE_PADDING * 2}px) / ${aspectRatio.toFixed(4)} + ${verticalChrome}px)`;
}
function BrowserFrame({
  url,
  viewport,
  children,
  width
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "overflow-hidden rounded-xl bg-card shadow-[0_30px_80px_-20px_rgb(0_0_0/0.35),0_0_0_1px_var(--border)]",
      style: { width },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "row items-center gap-3 border-b bg-def-100 px-3",
            style: { height: BROWSER_BAR_HEIGHT },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row shrink-0 gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2.5 rounded-full bg-[#ff5f57]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2.5 rounded-full bg-[#febc2e]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2.5 rounded-full bg-[#28c840]" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row h-6 min-w-0 flex-1 items-center gap-1.5 rounded-md bg-card px-2.5 text-xs shadow-[0_0_0_1px_var(--border)]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3 shrink-0 text-muted-foreground" }),
                url
              ] }),
              viewport && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden shrink-0 font-mono text-2xs text-muted-foreground sm:block", children: viewport })
            ]
          }
        ),
        children
      ]
    }
  );
}
function PhoneFrame({
  url,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "row max-w-full items-center gap-1.5 self-stretch px-2",
        style: { height: PHONE_URL_HEIGHT },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row mx-auto h-6 min-w-0 max-w-full items-center gap-1.5 rounded-full bg-card px-3 text-xs shadow-[0_0_0_1px_var(--border)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3 shrink-0 text-muted-foreground" }),
          url
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "rounded-[44px] bg-neutral-900 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.45),inset_0_0_0_1px_rgb(255_255_255/0.08)] ring-1 ring-black/40",
        style: { padding: PHONE_BEZEL },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-[34px] bg-card", children })
      }
    )
  ] });
}
function ReplayPlayer({
  events,
  url,
  overlay
}) {
  const areaRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const playerRef = reactExports.useRef(null);
  const {
    onPlayerReady,
    onPlayerDestroy,
    setCurrentTime,
    setIsPlaying,
    setIsSkipping
  } = useReplayContext();
  const [importError, setImportError] = reactExports.useState(false);
  const [size, setSize] = reactExports.useState(null);
  const sizeRef = reactExports.useRef(null);
  const recorded = reactExports.useMemo(() => getRecordedDimensions(events), [events]);
  const aspectRatio = recorded ? recorded.width / recorded.height : FALLBACK_ASPECT_RATIO;
  const frameKind = aspectRatio < 1 ? "phone" : "browser";
  reactExports.useLayoutEffect(() => {
    const area = areaRef.current;
    if (!area) {
      return;
    }
    const measure = () => {
      const next = fitViewport(
        { width: area.clientWidth, height: area.clientHeight },
        aspectRatio,
        frameKind
      );
      sizeRef.current = next;
      setSize(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(area);
    return () => observer.disconnect();
  }, [aspectRatio, frameKind]);
  const hasSize = size !== null && size.width > 0;
  reactExports.useEffect(() => {
    const container = containerRef.current;
    const initialSize = sizeRef.current;
    if (!(events.length && container && hasSize && initialSize)) {
      return;
    }
    container.innerHTML = "";
    let mounted = true;
    let player = null;
    let handleVisibilityChange = null;
    import("./rrweb-player-DW4nRQQg.js").then((module) => {
      if (!mounted) {
        return;
      }
      player = new module.default({
        target: container,
        props: {
          events,
          width: initialSize.width,
          height: initialSize.height,
          autoPlay: false,
          showController: false,
          speedOption: [...SPEED_OPTIONS],
          skipInactive: DEFAULT_SKIP_INACTIVE,
          mouseTail: MOUSE_TAIL
        }
      });
      playerRef.current = player;
      let playingState = false;
      player.addEventListener("ui-update-current-time", (e) => {
        setCurrentTime(e.payload);
      });
      player.addEventListener("ui-update-player-state", (e) => {
        playingState = e.payload === "playing";
        setIsPlaying(playingState);
      });
      player.addEventListener("skip-start", () => setIsSkipping(true));
      player.addEventListener("skip-end", () => setIsSkipping(false));
      let wasPlaying = false;
      handleVisibilityChange = () => {
        if (!player) {
          return;
        }
        if (document.hidden) {
          wasPlaying = playingState;
          if (wasPlaying) {
            player.pause();
          }
        } else if (wasPlaying) {
          player.play();
          wasPlaying = false;
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      onPlayerReady(player, events);
    }).catch(() => {
      if (mounted) {
        setImportError(true);
      }
    });
    return () => {
      mounted = false;
      if (handleVisibilityChange) {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      }
      player?.pause();
      container.innerHTML = "";
      playerRef.current = null;
      onPlayerDestroy();
    };
  }, [
    events,
    hasSize,
    onPlayerReady,
    onPlayerDestroy,
    setCurrentTime,
    setIsPlaying,
    setIsSkipping
  ]);
  reactExports.useEffect(() => {
    if (!(size && playerRef.current?.$set)) {
      return;
    }
    playerRef.current.$set({ width: size.width, height: size.height });
    playerRef.current.triggerResize();
  }, [size]);
  if (importError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center text-muted-foreground text-sm", children: "Failed to load replay player." });
  }
  const viewport = /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "relative overflow-hidden bg-card",
        "[&_.rr-player]:!float-none [&_.rr-player]:!rounded-none [&_.rr-player]:!bg-transparent [&_.rr-player]:!shadow-none",
        "[&_.replayer-mouse]:after:!bg-highlight [&_.replayer-mouse]:after:!opacity-50"
      ),
      style: size ?? void 0,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: containerRef }),
        overlay
      ]
    }
  );
  const viewportLabel = recorded ? `${recorded.width} × ${recorded.height}` : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute inset-0 flex items-center justify-center",
      ref: areaRef,
      children: hasSize && (frameKind === "phone" ? /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneFrame, { url, children: viewport }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BrowserFrame, { url, viewport: viewportLabel, width: size.width, children: viewport }))
    }
  );
}
const HISTOGRAM_BUCKETS = 140;
const MARKER_GROUP_PX = 22;
const MIN_LABEL_WIDTH_PX = 48;
const FALLBACK_TRACK_WIDTH = 600;
const MIN_BAR_HEIGHT = 0.08;
function percent(timeMs, duration) {
  return Math.max(0, Math.min(100, timeMs / duration * 100));
}
function groupMarkers(events, duration, trackWidth) {
  const thresholdMs = MARKER_GROUP_PX / trackWidth * duration;
  const groups = [];
  for (const item of events) {
    const last = groups.at(-1);
    const anchor = last?.[0];
    if (last && anchor && item.offsetMs - anchor.offsetMs <= thresholdMs) {
      last.push(item);
    } else {
      groups.push([item]);
    }
  }
  return groups;
}
function useElementWidth(ref) {
  const [width, setWidth] = reactExports.useState(FALLBACK_TRACK_WIDTH);
  reactExports.useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(() => {
      setWidth(element.clientWidth || FALLBACK_TRACK_WIDTH);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}
function EventMarkers({
  events,
  duration,
  trackWidth
}) {
  const { seek } = useReplayContext();
  const markers = reactExports.useMemo(
    () => groupMarkers(
      events.filter(
        ({ event, offsetMs }) => event.name !== "screen_view" && offsetMs >= 0 && offsetMs <= duration
      ),
      duration,
      trackWidth
    ),
    [events, duration, trackWidth]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-6", children: markers.map((group) => {
    const first = group[0];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          "aria-label": `${getEventLabel(first.event)} at ${formatDuration(first.offsetMs)}`,
          className: "absolute top-0 -ml-2.5 transition-transform hover:z-10 hover:scale-125",
          onClick: () => seek(first.offsetMs),
          style: { left: `${percent(first.offsetMs, duration)}%` },
          type: "button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              EventIcon,
              {
                className: "ring-2 ring-card",
                meta: first.event.meta,
                name: first.event.name,
                size: "xs"
              }
            ),
            group.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-foreground px-0.5 font-semibold text-[9px] text-background tabular-nums", children: group.length })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { className: "col gap-1.5", side: "top", children: group.map(({ event, offsetMs }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(EventIcon, { meta: event.meta, name: event.name, size: "xs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: getEventLabel(event) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto pl-3 text-muted-foreground tabular-nums", children: formatDuration(offsetMs) })
      ] }, event.id)) })
    ] }, first.event.id);
  }) });
}
function PageBands({
  segments,
  duration,
  trackWidth,
  currentSegmentId
}) {
  const { seek } = useReplayContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-1.5 h-6", children: segments.map((segment) => {
    const left = percent(segment.startMs, duration);
    const width = percent(segment.endMs, duration) - left;
    const isCurrent = segment.id === currentSegmentId;
    const showLabel = width / 100 * trackWidth >= MIN_LABEL_WIDTH_PX;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          "aria-label": `Jump to ${segment.path}`,
          className: cn(
            "absolute inset-y-0 truncate rounded-[5px] border-card border-r-2 px-1.5 text-left font-medium text-2xs transition-colors",
            isCurrent ? "bg-highlight/15 text-highlight" : "bg-def-200 text-muted-foreground hover:bg-def-300 hover:text-foreground"
          ),
          onClick: () => seek(segment.startMs),
          style: { left: `${left}%`, width: `${width}%` },
          type: "button",
          children: showLabel ? segment.path : null
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipContent, { side: "bottom", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: segment.path }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-muted-foreground tabular-nums", children: formatDuration(segment.endMs - segment.startMs) })
      ] })
    ] }, segment.id);
  }) });
}
function Waveform({ bars, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-end gap-px", children: bars.map((value, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn("flex-1 rounded-t-[1px]", className),
      style: { height: `${Math.max(MIN_BAR_HEIGHT, value) * 100}%` }
    },
    index
  )) });
}
function ReplayTimeline({
  events,
  segments,
  currentSegmentId
}) {
  const {
    currentTimeRef,
    duration,
    startTime,
    isReady,
    seek,
    subscribeToCurrentTime,
    activity
  } = useReplayContext();
  const trackRef = reactExports.useRef(null);
  const scrubPointerRef = reactExports.useRef(null);
  const playedRef = reactExports.useRef(null);
  const playheadRef = reactExports.useRef(null);
  const [hover, setHover] = reactExports.useState(
    null
  );
  const trackWidth = useElementWidth(trackRef);
  const bars = reactExports.useMemo(
    () => startTime == null ? [] : getActivityHistogram(
      activity.interactions,
      startTime,
      duration,
      HISTOGRAM_BUCKETS
    ),
    [activity.interactions, startTime, duration]
  );
  const rageClicks = reactExports.useMemo(
    () => startTime == null ? [] : detectRageClicks(activity.clicks, startTime).filter(
      (rage) => rage.offsetMs >= 0 && rage.offsetMs <= duration
    ),
    [activity.clicks, startTime, duration]
  );
  reactExports.useEffect(() => {
    if (duration <= 0) {
      return;
    }
    const paint = (t) => {
      const pct = `${percent(t, duration)}%`;
      if (playedRef.current) {
        playedRef.current.style.clipPath = `inset(0 calc(100% - ${pct}) 0 0)`;
      }
      if (playheadRef.current) {
        playheadRef.current.style.left = pct;
      }
    };
    paint(currentTimeRef.current);
    return subscribeToCurrentTime(paint);
  }, [subscribeToCurrentTime, duration, currentTimeRef]);
  const getTimeFromClientX = reactExports.useCallback(
    (clientX) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0 || duration <= 0) {
        return null;
      }
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return { pct, timeMs: pct * duration };
    },
    [duration]
  );
  const startScrub = reactExports.useCallback(
    (e) => {
      if (!e.isPrimary || scrubPointerRef.current !== null) {
        return;
      }
      const first = getTimeFromClientX(e.clientX);
      if (first) {
        seek(first.timeMs);
      }
      const { pointerId } = e;
      scrubPointerRef.current = pointerId;
      const onMove = (move) => {
        if (move.pointerId !== pointerId) {
          return;
        }
        const info = getTimeFromClientX(move.clientX);
        if (info) {
          setHover(info);
          seek(info.timeMs);
        }
      };
      const onEnd = (end) => {
        if (end.pointerId !== pointerId) {
          return;
        }
        scrubPointerRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
    },
    [getTimeFromClientX, seek]
  );
  if (!isReady || duration <= 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[86px]" });
  }
  const hoverSegment = hover ? segments.find(
    (segment) => hover.timeMs >= segment.startMs && hover.timeMs < segment.endMs
  ) : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 150, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EventMarkers,
      {
        duration,
        events,
        trackWidth
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "aria-label": "Seek",
        "aria-valuemax": Math.round(duration / 1e3),
        "aria-valuemin": 0,
        "aria-valuenow": Math.round(currentTimeRef.current / 1e3),
        className: "relative h-10 cursor-pointer touch-none",
        onKeyDown: (e) => {
          const step = 5e3;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            seek(currentTimeRef.current - step);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            seek(Math.min(duration, currentTimeRef.current + step));
          }
        },
        onPointerDown: startScrub,
        onPointerLeave: () => setHover(null),
        onPointerMove: (e) => setHover(getTimeFromClientX(e.clientX)),
        ref: trackRef,
        role: "slider",
        tabIndex: 0,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Waveform, { bars, className: "bg-def-300" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", ref: playedRef, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Waveform, { bars, className: "bg-highlight" }) }),
          rageClicks.map((rage) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute -top-1 bottom-0 z-10 w-0.5 -translate-x-1/2 rounded-full bg-destructive",
                style: { left: `${percent(rage.offsetMs, duration)}%` },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 left-1/2 size-2 -translate-x-1/2 animate-pulse rounded-full bg-destructive ring-2 ring-card" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipContent, { side: "top", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-destructive", children: "Rage click" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-muted-foreground", children: [
                rage.clicks,
                " clicks at ",
                formatDuration(rage.offsetMs)
              ] })
            ] })
          ] }, rage.offsetMs)),
          hover && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "pointer-events-none absolute inset-y-0 z-20 w-px bg-foreground/40",
              style: { left: `${hover.pct * 100}%` },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-full left-1/2 mb-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-2xs text-background shadow-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tabular-nums", children: formatDuration(hover.timeMs) }),
                hoverSegment && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 opacity-70", children: hoverSegment.path })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "pointer-events-none absolute -top-1 -bottom-1 z-30 w-0.5 -translate-x-1/2 rounded-full bg-foreground",
              ref: playheadRef,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 left-1/2 size-3 -translate-x-1/2 rounded-full border-2 border-card bg-foreground shadow" })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageBands,
      {
        currentSegmentId,
        duration,
        segments,
        trackWidth
      }
    )
  ] }) });
}
const FEED_TICK_MS = 100;
function ReplayChunkLoader({
  sessionId,
  projectId,
  fromIndex
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addEvent, refreshDuration, isReady } = useReplayContext();
  reactExports.useEffect(() => {
    if (!isReady) {
      return;
    }
    let cancelled = false;
    function loadFrom(index) {
      queryClient.fetchQuery(
        trpc.session.replayChunksFrom.queryOptions({
          sessionId,
          projectId,
          fromIndex: index
        })
      ).then((res) => {
        if (cancelled) {
          return;
        }
        for (const row of res.data) {
          for (const event of row?.events ?? []) {
            addEvent(event);
          }
        }
        refreshDuration();
        if (res.hasMore && res.nextIndex > index) {
          loadFrom(res.nextIndex);
        }
      }).catch(() => {
      });
    }
    loadFrom(fromIndex);
    return () => {
      cancelled = true;
    };
  }, [
    isReady,
    queryClient,
    trpc,
    sessionId,
    projectId,
    fromIndex,
    addEvent,
    refreshDuration
  ]);
  return null;
}
function CurrentUrl({ segment }) {
  if (!segment) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-muted-foreground", children: "about:blank" });
  }
  const host = segment.origin.replace(/^https?:\/\//, "");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: "fade-in-0 slide-in-from-bottom-1 min-w-0 animate-in truncate duration-300",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: host }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: segment.path })
      ]
    },
    segment.id
  );
}
function StartOverlay() {
  const { isPlaying, isReady } = useReplayContext();
  const [hasStarted, setHasStarted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (isPlaying) {
      setHasStarted(true);
    }
  }, [isPlaying]);
  if (!isReady || hasStarted) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fade-in-0 absolute inset-0 z-10 grid animate-in place-items-center bg-background/20 backdrop-blur-[1.5px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReplayPlayPauseButton, { size: "lg" }) });
}
function SkippingBadge() {
  const { isSkipping, isPlaying } = useReplayContext();
  if (!(isSkipping && isPlaying)) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fade-in-0 zoom-in-95 row absolute top-4 left-1/2 z-20 -translate-x-1/2 animate-in items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-1.5 font-medium text-background text-xs shadow-lg backdrop-blur", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FastForward, { className: "size-3.5 animate-pulse", fill: "currentColor" }),
    "Skipping idle time"
  ] });
}
function StagePlaceholder({ status }) {
  if (status === "loading") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col aspect-video w-full max-w-3xl overflow-hidden rounded-xl bg-card shadow-[0_0_0_1px_var(--border)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 border-b bg-def-100" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 animate-pulse bg-def-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center text-muted-foreground text-sm", children: "Loading recording…" })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col absolute inset-0 items-center justify-center gap-3 text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(VideoOff, { className: "size-8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: status === "error" ? "The recording could not be loaded. Reload the page to try again." : "No recording was captured for this session." })
  ] });
}
function getStageStatus(isLoading, isError) {
  if (isLoading) {
    return "loading";
  }
  return isError ? "error" : "empty";
}
function ReplayStage({
  events,
  playerEvents,
  isLoading,
  isError,
  fullscreenTarget
}) {
  const { startTime, duration } = useReplayContext();
  const currentTime = useCurrentTime(FEED_TICK_MS);
  const sorted = reactExports.useMemo(() => {
    if (startTime == null) {
      return [];
    }
    const all = sortEventsByOffset(events, startTime);
    return duration > 0 ? all.filter(({ offsetMs }) => offsetMs <= duration) : all;
  }, [events, startTime, duration]);
  const segments = reactExports.useMemo(
    () => getPageSegments(sorted, duration),
    [sorted, duration]
  );
  const currentIndex = findLastIndexAtTime(sorted, currentTime);
  const currentSegment = segments.filter((segment) => segment.startMs <= currentTime).at(-1) ?? segments[0];
  const hasRecording = playerEvents.length > 0;
  const stageFitHeight = reactExports.useMemo(
    () => getStageFitHeight(playerEvents),
    [playerEvents]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid in-[:fullscreen]:h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_320px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "@container col min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: cn(
            "relative h-[max(360px,min(clamp(420px,64vh,760px),var(--stage-fit)))] in-[:fullscreen]:h-auto in-[:fullscreen]:flex-1 overflow-hidden bg-def-100",
            "bg-[radial-gradient(var(--def-300)_1px,transparent_1px)] [background-size:18px_18px]"
          ),
          style: { "--stage-fit": stageFitHeight },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,color-mix(in_oklab,var(--highlight)_14%,transparent),transparent)]" }),
            hasRecording ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              ReplayPlayer,
              {
                events: playerEvents,
                overlay: /* @__PURE__ */ jsxRuntimeExports.jsx(StartOverlay, {}),
                url: /* @__PURE__ */ jsxRuntimeExports.jsx(CurrentUrl, { segment: currentSegment })
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(StagePlaceholder, { status: getStageStatus(isLoading, isError) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkippingBadge, {})
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-3 border-t bg-card px-4 pt-2 pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ReplayTimeline,
          {
            currentSegmentId: currentSegment?.id ?? null,
            events: sorted,
            segments
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReplayControls, { events: sorted, fullscreenTarget })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "relative hidden border-l bg-card lg:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReplayEventFeed,
      {
        currentIndex,
        events: sorted,
        isLoading: isLoading || hasRecording && startTime == null
      }
    ) }) })
  ] });
}
function ReplayShell({
  sessionId,
  projectId,
  events
}) {
  const trpc = useTRPC();
  const rootRef = reactExports.useRef(null);
  const {
    data: firstBatch,
    isLoading,
    isError
  } = useQuery(
    trpc.session.replayChunksFrom.queryOptions({
      sessionId,
      projectId,
      fromIndex: 0
    })
  );
  const playerEvents = reactExports.useMemo(
    () => firstBatch?.data.flatMap((row) => row?.events ?? []) ?? [],
    [firstBatch]
  );
  return (
    // Keyed so playback state (e.g. the start overlay) resets per session.
    /* @__PURE__ */ jsxRuntimeExports.jsxs(ReplayProvider, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "card overflow-hidden [&:fullscreen]:rounded-none [&:fullscreen]:border-0",
          id: "replay",
          ref: rootRef,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            ReplayStage,
            {
              events,
              fullscreenTarget: rootRef,
              isError,
              isLoading,
              playerEvents
            }
          )
        }
      ),
      firstBatch?.hasMore && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ReplayChunkLoader,
        {
          fromIndex: firstBatch.nextIndex,
          projectId,
          sessionId
        }
      )
    ] }, sessionId)
  );
}
const MS_PER_SECOND = 1e3;
function HeaderFact({
  icon,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2 text-muted-foreground", children: [
    icon,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children })
  ] });
}
function SessionFacts({
  session
}) {
  const location = [session.city, session.country].filter(Boolean).join(", ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row mb-6 flex-wrap gap-x-5 gap-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderFact, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "size-4" }), children: formatDateTime(session.createdAt) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderFact, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-4" }), children: fancyMinutes(session.duration / MS_PER_SECOND) }),
    location && /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderFact, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: session.country || session.city }), children: location }),
    session.referrerName && /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderFact, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: session.referrerName }), children: session.referrerName }),
    session.device && /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderFact, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: session.device }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: session.device }) }),
    session.os && /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderFact, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: session.os }), children: session.os }),
    session.browser && /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderFact, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: session.browser }), children: session.browser })
  ] });
}
const EVENT_DERIVED_SECTIONS = "the journey, timeline, unique pages, popular events and replay activity";
function SessionEventsNotice({
  status,
  onRetry
}) {
  if (status === "complete") {
    return null;
  }
  if (status === "loading") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2 text-muted-foreground text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
      "Loading the rest of this session's events…"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "row items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: status === "failed" ? `Some of this session's events could not be loaded, so ${EVENT_DERIVED_SECTIONS} are incomplete.` : `This session has more than ${MAX_SESSION_EVENTS.toLocaleString()} events. Only the latest ${MAX_SESSION_EVENTS.toLocaleString()} are used for ${EVENT_DERIVED_SECTIONS}.` }),
    status === "failed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onRetry, size: "sm", variant: "outline", children: "Retry" })
  ] });
}
function VisitorCard({
  profile,
  session,
  organizationId,
  projectId
}) {
  const isIdentified = session.profileId !== session.deviceId;
  const name = profile && isIdentified ? getProfileName(profile, false) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTitle$1, { children: "Visitor" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { className: "group row items-center gap-3 p-4 transition-colors hover:bg-def-100", params: {
      organizationId,
      projectId,
      profileId: session.profileId
    }, to: "/$organizationId/$projectId/profiles/$profileId", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileAvatar, { ...profile, size: "lg" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col min-w-0 flex-1 gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: name ?? "Anonymous visitor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-muted-foreground text-sm", children: profile?.email || session.profileId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" })
    ] }) })
  ] });
}
function SessionGroups({
  groupIds,
  organizationId,
  projectId
}) {
  const trpc = useTRPC();
  const {
    data: groups
  } = useQuery({
    ...trpc.group.listByIds.queryOptions({
      projectId,
      ids: groupIds
    }),
    enabled: groupIds.length > 0
  });
  if (!groups?.length) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTitle$1, { children: "Groups" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: groups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { className: "row items-center gap-3 px-4 py-3 transition-colors hover:bg-def-100", params: {
      organizationId,
      projectId,
      groupId: group.id
    }, to: "/$organizationId/$projectId/groups/$groupId", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col min-w-0 flex-1 gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: group.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-muted-foreground text-sm tabular-nums", children: group.id })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded border px-1.5 py-0.5 text-muted-foreground text-xs", children: group.type })
    ] }, group.id)) })
  ] });
}
function Component() {
  const {
    projectId,
    sessionId,
    organizationId
  } = Route$1.useParams();
  const trpc = useTRPC();
  const {
    data: session
  } = useSuspenseQuery(trpc.session.byId.queryOptions({
    sessionId,
    projectId
  }));
  useEntityPageContext("session", {
    sessionId
  });
  const {
    events,
    status: eventsStatus,
    retry: retryEvents
  } = useSessionEvents(trpc, {
    projectId,
    sessionId
  });
  const {
    data: profile
  } = useSuspenseQuery(trpc.profile.byId.queryOptions({
    profileId: session.profileId,
    projectId
  }));
  const visits = reactExports.useMemo(() => groupEventsByPage(events, session.endedAt), [events, session.endedAt]);
  const eventCounts = reactExports.useMemo(() => {
    const counts = /* @__PURE__ */ new Map();
    for (const event of events) {
      counts.set(event.name, (counts.get(event.name) ?? 0) + 1);
    }
    return [...counts.entries()].map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  }, [events]);
  const isIdentified = session.profileId !== session.deviceId;
  const title = profile && isIdentified ? getProfileName(profile, false) : "Anonymous visitor";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { className: "col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader$1, { actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      session.hasReplay && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { icon: Video, onClick: () => document.getElementById("replay")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      }), variant: "outline", children: "Watch replay" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { icon: Copy, onClick: () => clipboard(session.id, "Session id copied"), variant: "outline", children: "Copy id" })
    ] }), title: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row min-w-0 items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileAvatar, { ...profile }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-md bg-def-200 px-2 py-0.5 font-medium text-muted-foreground text-xs", children: "Session" })
    ] }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SessionFacts, { session }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SessionEventsNotice, { onRetry: retryEvents, status: eventsStatus }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SessionMetrics, { events, session }),
    session.hasReplay && /* @__PURE__ */ jsxRuntimeExports.jsx(ReplayShell, { events, projectId, sessionId }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "col gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(VisitorCard, { organizationId, profile, projectId, session }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SessionProperties, { session }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SessionGroups, { groupIds: session.groups ?? [], organizationId, projectId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AiUsageWidget, { className: "w-full", entity: {
          kind: "session",
          sessionId
        }, projectId }),
        eventCounts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(MostEvents, { data: eventCounts })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col min-w-0 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SessionJourney, { visits }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SessionTimeline, { sessionStart: session.createdAt, visits })
      ] })
    ] })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.sessions_._sessionId-qyOeS7m4.js.map
