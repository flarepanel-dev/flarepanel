import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, h4 as Route, a as useTRPC, j as useQuery, $ as useNavigate, c4 as useQueryState, bl as parseAsString, cS as parseAsStringEnum, b4 as Skeleton, ei as Carousel, ej as CarouselContent, ek as CarouselItem, d as cn, el as CarouselPrevious, em as CarouselNext, E as EmptyState, W as Search, B as Button, a1 as Sparkles } from "./router-gBnYxPzA.js";
import { I as InsightCard } from "./insight-card-Cf29F786.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { A as AnimatedSearchInput } from "./data-table-toolbar-BJU_j2v8.js";
import { f as TableButtons } from "./table-Bl3avL3P.js";
import { T as ToolbarSelect } from "./toolbar-select-B2rkqrrv.js";
import { u as useRangePageContext } from "./use-page-context-helpers-DUMZv3Xw.js";
import { G as Gauge } from "./gauge-BTL4uoFL.js";
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
import "./sortable.esm-CAMhO-vx.js";
import "./settings-2-DrPzEv47.js";
import "./index-CHcXrYNT.js";
const __iconNode$2 = [
  ["path", { d: "m3 16 4 4 4-4", key: "1co6wj" }],
  ["path", { d: "M7 20V4", key: "1yoxec" }],
  ["path", { d: "M11 4h10", key: "1w87gc" }],
  ["path", { d: "M11 8h7", key: "djye34" }],
  ["path", { d: "M11 12h4", key: "q8tih4" }]
];
const ArrowDownWideNarrow = createLucideIcon("arrow-down-wide-narrow", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
  ["path", { d: "M17 20V4", key: "1ejh1v" }],
  ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
  ["path", { d: "M7 4v16", key: "1glfcx" }]
];
const ArrowUpDown = createLucideIcon("arrow-up-down", __iconNode$1);
const __iconNode = [
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M17 14h-6", key: "bkmgh3" }],
  ["path", { d: "M13 18H7", key: "bb0bb7" }],
  ["path", { d: "M7 14h.01", key: "1qa3f1" }],
  ["path", { d: "M17 18h.01", key: "1bdyru" }]
];
const CalendarRange = createLucideIcon("calendar-range", __iconNode);
const INSIGHT_LIST_ALL_MAX_LIMIT = 500;
const WINDOW_OPTIONS = [{
  value: "all",
  label: "All windows"
}, {
  value: "yesterday",
  label: "Yesterday"
}, {
  value: "rolling_7d",
  label: "7 days"
}, {
  value: "rolling_30d",
  label: "30 days"
}];
const SEVERITY_OPTIONS = [{
  value: "all",
  label: "All severities"
}, {
  value: "severe",
  label: "Severe"
}, {
  value: "moderate",
  label: "Moderate"
}, {
  value: "low",
  label: "Low"
}, {
  value: "none",
  label: "No severity"
}];
const DIRECTION_OPTIONS = [{
  value: "all",
  label: "All directions"
}, {
  value: "up",
  label: "Increasing"
}, {
  value: "down",
  label: "Decreasing"
}, {
  value: "flat",
  label: "Flat"
}];
const SORT_OPTIONS = [{
  value: "relevance",
  label: "Relevance (AI)"
}, {
  value: "impact-desc",
  label: "Impact (high → low)"
}, {
  value: "impact-asc",
  label: "Impact (low → high)"
}, {
  value: "severity-desc",
  label: "Severity (high → low)"
}, {
  value: "severity-asc",
  label: "Severity (low → high)"
}, {
  value: "recent",
  label: "Most recent"
}];
function getModuleDisplayName(moduleKey) {
  const displayNames = {
    geo: "Geographic",
    devices: "Devices",
    referrers: "Referrers",
    "entry-pages": "Entry Pages",
    "page-trends": "Page Trends",
    "exit-pages": "Exit Pages",
    "traffic-anomalies": "Anomalies"
  };
  return displayNames[moduleKey] || moduleKey.replace("-", " ");
}
function Component() {
  const {
    projectId
  } = Route.useParams();
  useRangePageContext("insights");
  const trpc = useTRPC();
  const {
    data: insights,
    isLoading
  } = useQuery(trpc.insight.listAll.queryOptions({
    projectId,
    limit: INSIGHT_LIST_ALL_MAX_LIMIT
  }));
  const navigate = useNavigate();
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [moduleFilter, setModuleFilter] = useQueryState("module", parseAsString.withDefault("all"));
  const [windowKindFilter, setWindowKindFilter] = useQueryState("window", parseAsStringEnum(["all", "yesterday", "rolling_7d", "rolling_30d"]).withDefault("all"));
  const [severityFilter, setSeverityFilter] = useQueryState("severity", parseAsStringEnum(["all", "severe", "moderate", "low", "none"]).withDefault("all"));
  const [directionFilter, setDirectionFilter] = useQueryState("direction", parseAsStringEnum(["all", "up", "down", "flat"]).withDefault("all"));
  const [sortBy, setSortBy] = useQueryState("sort", parseAsStringEnum(["relevance", "impact-desc", "impact-asc", "severity-desc", "severity-asc", "recent"]).withDefault("relevance"));
  const filteredAndSorted = reactExports.useMemo(() => {
    if (!insights) {
      return [];
    }
    const filtered = insights.filter((insight) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesTitle = insight.title.toLowerCase().includes(searchLower);
        const matchesSummary = insight.summary?.toLowerCase().includes(searchLower);
        const matchesAiSummary = insight.aiSummary?.toLowerCase().includes(searchLower);
        const matchesDimension = insight.dimensionKey.toLowerCase().includes(searchLower);
        if (!(matchesTitle || matchesSummary || matchesAiSummary || matchesDimension)) {
          return false;
        }
      }
      if (moduleFilter !== "all" && insight.moduleKey !== moduleFilter) {
        return false;
      }
      if (windowKindFilter !== "all" && insight.windowKind !== windowKindFilter) {
        return false;
      }
      if (severityFilter !== "all") {
        if (severityFilter === "none" && insight.severityBand) {
          return false;
        }
        if (severityFilter !== "none" && insight.severityBand !== severityFilter) {
          return false;
        }
      }
      if (directionFilter !== "all" && insight.direction !== directionFilter) {
        return false;
      }
      return true;
    });
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "relevance":
          return (b.relevanceScore ?? -1) - (a.relevanceScore ?? -1) || (b.impactScore ?? 0) - (a.impactScore ?? 0);
        case "impact-desc":
          return (b.impactScore ?? 0) - (a.impactScore ?? 0);
        case "impact-asc":
          return (a.impactScore ?? 0) - (b.impactScore ?? 0);
        case "severity-desc": {
          const severityOrder = {
            severe: 3,
            moderate: 2,
            low: 1
          };
          const aSev = severityOrder[a.severityBand ?? ""] ?? 0;
          const bSev = severityOrder[b.severityBand ?? ""] ?? 0;
          return bSev - aSev;
        }
        case "severity-asc": {
          const severityOrder = {
            severe: 3,
            moderate: 2,
            low: 1
          };
          const aSev = severityOrder[a.severityBand ?? ""] ?? 0;
          const bSev = severityOrder[b.severityBand ?? ""] ?? 0;
          return aSev - bSev;
        }
        case "recent":
          return new Date(b.firstDetectedAt ?? 0).getTime() - new Date(a.firstDetectedAt ?? 0).getTime();
        default:
          return 0;
      }
    });
    return sorted;
  }, [insights, search, moduleFilter, windowKindFilter, severityFilter, directionFilter, sortBy]);
  const groupedByModule = reactExports.useMemo(() => {
    const groups = /* @__PURE__ */ new Map();
    for (const insight of filteredAndSorted) {
      const existing = groups.get(insight.moduleKey) ?? [];
      existing.push(insight);
      groups.set(insight.moduleKey, existing);
    }
    return Array.from(groups.entries()).sort(([keyA, insightsA], [keyB, insightsB]) => {
      if (keyA === "referrers") {
        return -1;
      }
      if (keyB === "referrers") {
        return 1;
      }
      const avgImpactA = insightsA.reduce((sum, i) => sum + (i.impactScore ?? 0), 0) / insightsA.length;
      const avgImpactB = insightsB.reduce((sum, i) => sum + (i.impactScore ?? 0), 0) / insightsB.length;
      return avgImpactB - avgImpactA;
    });
  }, [filteredAndSorted]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { className: "mb-8", title: "Insights" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8", children: Array.from({
        length: 3
      }, (_, i) => `section-${i}`).map((key) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-32" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Carousel, { className: "w-full", opts: {
          align: "start"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselContent, { className: "-ml-4", children: Array.from({
          length: 4
        }, (_, i) => `skeleton-${i}`).map((cardKey) => /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselItem, { className: "basis-full pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 w-full" }) }, cardKey)) }) })
      ] }, key)) })
    ] });
  }
  const isFiltered = search !== "" || moduleFilter !== "all" || windowKindFilter !== "all" || severityFilter !== "all" || directionFilter !== "all";
  const clearFilters = () => {
    setSearch(null);
    setModuleFilter(null);
    setWindowKindFilter(null);
    setSeverityFilter(null);
    setDirectionFilter(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { className: "mb-8", description: "Discover trends and changes in your analytics", title: "Insights" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableButtons, { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedSearchInput, { onChange: (value) => setSearch(value || null), placeholder: "Search insights", value: search ?? "" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarSelect, { icon: CalendarRange, label: "Time window", onChange: setWindowKindFilter, options: WINDOW_OPTIONS, value: windowKindFilter ?? "all" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarSelect, { icon: Gauge, label: "Severity", onChange: setSeverityFilter, options: SEVERITY_OPTIONS, value: severityFilter ?? "all" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarSelect, { icon: ArrowUpDown, label: "Direction", onChange: setDirectionFilter, options: DIRECTION_OPTIONS, value: directionFilter ?? "all" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarSelect, { icon: ArrowDownWideNarrow, label: "Sort by", onChange: setSortBy, options: SORT_OPTIONS, value: sortBy ?? "relevance" })
    ] }),
    filteredAndSorted.length === 0 && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(InsightsEmptyState, { isFiltered, onClearFilters: clearFilters }),
    groupedByModule.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8", children: groupedByModule.map(([moduleKey, moduleInsights]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-lg capitalize", children: getModuleDisplayName(moduleKey) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-sm", children: [
          moduleInsights.length,
          " ",
          moduleInsights.length === 1 ? "insight" : "insights"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Carousel, { className: "group w-full", opts: {
        align: "start",
        dragFree: true
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselContent, { className: "mx-4 mr-8", children: moduleInsights.map((insight, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselItem, { className: cn("basis-full pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(InsightCard, { insight, onFilter: (() => {
          const filterString = insight.payload?.dimensions.map((dim) => `${dim.key},is,${encodeURIComponent(dim.value)}`).join(";");
          if (filterString) {
            return () => {
              navigate({
                to: "/$organizationId/$projectId",
                from: Route.fullPath,
                search: {
                  f: filterString
                }
              });
            };
          }
          return void 0;
        })() }) }, insight.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselPrevious, { className: "pointer-events-none left-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 [&:disabled]:opacity-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselNext, { className: "pointer-events-none right-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 [&:disabled]:opacity-0" })
      ] }) })
    ] }, moduleKey)) }),
    filteredAndSorted.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 text-center text-muted-foreground text-sm", children: [
      "Showing ",
      filteredAndSorted.length,
      " of ",
      insights?.length ?? 0,
      " insights"
    ] })
  ] });
}
function InsightsEmptyState({
  isFiltered,
  onClearFilters
}) {
  if (isFiltered) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { description: "Nothing matches the current search and filters.", icon: Search, title: "No matching insights", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClearFilters, variant: "outline", children: "Clear filters" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { description: "Insights are detected automatically from your traffic. Give it a few days of data and check back.", icon: Sparkles, title: "No insights yet" });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.insights-CbgIo8p8.js.map
