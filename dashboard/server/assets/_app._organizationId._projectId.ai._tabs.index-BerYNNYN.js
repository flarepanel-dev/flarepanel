import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { P as ProjectLink, d as cn, a0 as ChartLine, a as useTRPC, c8 as useOverviewOptions, hQ as useAiFilters, j as useQuery, b4 as Skeleton, eX as ProfileAvatar, h as getProfileName, br as formatTokens, hH as formatLatencyOrNone, bo as formatCost, bs as formatLatency, ad as getChartColor, cK as OverviewMetricCard, B as Button, a$ as ComposedChart, cN as Grid, b0 as YAxis, cO as XAxis, ac as Area, b2 as Line, ae as monotoneX, af as OPChartTooltip, hT as Route, hR as Cpu, V as Layers, N as Users, w as Building2, dU as Server, bq as TriangleAlert } from "./router-gBnYxPzA.js";
import { A as AiCost } from "./ai-cost-C8tzxtic.js";
import { W as WidgetHead, d as WidgetTitle, c as WidgetFooter } from "./overview-widget-q0VDaTtp.js";
import { b as Widget, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { R as RotateCw } from "./rotate-cw-59NMbvpf.js";
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
import "./last-C7omGuiv.js";
const AI_EVENT = "ai_generation";
const USD = "$";
const BREAKDOWN_BY_DIMENSION = {
  model: "properties.ai_model",
  provider: "properties.ai_provider",
  name: "properties.ai_name",
  profile: "profile_id",
  conversation: "properties.ai_conversation_id",
  stopReason: "properties.ai_stop_reason",
  errorCode: "properties.ai_error_code"
};
const ERROR_FILTER = {
  name: "properties.ai_is_error",
  operator: "is",
  value: ["true"]
};
function aiFiltersToChartFilters(filters) {
  const out = [];
  const add = (name, values) => {
    if (values && values.length > 0) {
      out.push({ name, operator: "is", value: values });
    }
  };
  add("properties.ai_model", filters.models);
  add("properties.ai_provider", filters.providers);
  add("properties.ai_name", filters.names);
  add("profile_id", filters.profileId ? [filters.profileId] : void 0);
  add("session_id", filters.sessionId ? [filters.sessionId] : void 0);
  add(
    "properties.ai_conversation_id",
    filters.conversationId ? [filters.conversationId] : void 0
  );
  if (filters.isError) {
    out.push(ERROR_FILTER);
  }
  return out;
}
function measureSeries(measure, filters) {
  const base = { id: "A", type: "event", name: AI_EVENT };
  switch (measure) {
    case "cost":
      return {
        unit: USD,
        series: [
          {
            ...base,
            displayName: "AI cost",
            segment: "property_sum",
            property: "properties.ai_cost",
            filters
          }
        ]
      };
    case "tokens":
      return {
        series: [
          {
            ...base,
            displayName: "Tokens",
            segment: "property_sum",
            property: "properties.ai_total_tokens",
            filters
          }
        ]
      };
    case "p95LatencyMs":
      return {
        series: [
          {
            ...base,
            displayName: "Latency p95 (ms)",
            segment: "property_p95",
            property: "properties.ai_latency_ms",
            filters
          }
        ]
      };
    case "errors":
      return {
        series: [
          {
            ...base,
            displayName: "Failed generations",
            segment: "event",
            filters: [...filters, ERROR_FILTER]
          }
        ]
      };
    default:
      return {
        series: [
          { ...base, displayName: "Generations", segment: "event", filters }
        ]
      };
  }
}
function breakdownReportDraft(scope, input) {
  const breakdown = BREAKDOWN_BY_DIMENSION[input.dimension];
  if (!breakdown) {
    return null;
  }
  const { series, unit } = measureSeries(
    input.measure,
    aiFiltersToChartFilters(scope.filters)
  );
  return {
    name: input.name,
    projectId: scope.projectId,
    chartType: "bar",
    interval: scope.interval,
    range: scope.range,
    startDate: scope.startDate,
    endDate: scope.endDate,
    previous: false,
    metric: "sum",
    series,
    breakdowns: [{ name: breakdown }],
    unit
  };
}
function metricReportDraft(scope, input) {
  const filters = aiFiltersToChartFilters(scope.filters);
  const base = { type: "event", name: AI_EVENT, filters };
  const common = {
    name: input.name,
    projectId: scope.projectId,
    chartType: "linear",
    interval: scope.interval,
    range: scope.range,
    startDate: scope.startDate,
    endDate: scope.endDate,
    previous: true,
    metric: "sum",
    breakdowns: []
  };
  switch (input.metric) {
    case "cost":
      return {
        ...common,
        unit: USD,
        series: [
          {
            ...base,
            id: "A",
            displayName: "AI cost",
            segment: "property_sum",
            property: "properties.ai_cost"
          }
        ]
      };
    case "users":
      return {
        ...common,
        series: [{ ...base, id: "A", displayName: "Users", segment: "user" }]
      };
    case "costPerUser":
      return {
        ...common,
        unit: USD,
        metric: "average",
        series: [
          {
            ...base,
            id: "A",
            displayName: "AI cost",
            segment: "property_sum",
            property: "properties.ai_cost"
          },
          { ...base, id: "B", displayName: "Users", segment: "user" },
          {
            id: "C",
            type: "formula",
            formula: "A/B",
            displayName: "Cost per user",
            hideSeries: ["A", "B"]
          }
        ]
      };
    case "inputTokens":
      return {
        ...common,
        series: [
          {
            ...base,
            id: "A",
            displayName: "Input tokens",
            segment: "property_sum",
            property: "properties.ai_input_tokens"
          }
        ]
      };
    case "outputTokens":
      return {
        ...common,
        series: [
          {
            ...base,
            id: "A",
            displayName: "Output tokens",
            segment: "property_sum",
            property: "properties.ai_output_tokens"
          }
        ]
      };
    case "p95LatencyMs":
      return {
        ...common,
        metric: "average",
        series: [
          {
            ...base,
            id: "A",
            displayName: "Latency p95 (ms)",
            segment: "property_p95",
            property: "properties.ai_latency_ms"
          }
        ]
      };
    case "errorRate":
      return {
        ...common,
        metric: "average",
        unit: "%",
        series: [
          {
            ...base,
            id: "A",
            displayName: "Failed",
            segment: "event",
            filters: [...filters, ERROR_FILTER]
          },
          { ...base, id: "B", displayName: "Generations", segment: "event" },
          {
            id: "C",
            type: "formula",
            formula: "A/B*100",
            displayName: "Error rate",
            hideSeries: ["A", "B"]
          }
        ]
      };
    default:
      return {
        ...common,
        series: [
          { ...base, id: "A", displayName: "Generations", segment: "event" }
        ]
      };
  }
}
function OpenAsReportLink({
  draft,
  className
}) {
  if (!draft) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    ProjectLink,
    {
      className: cn(
        "row h-8 items-center gap-1.5 rounded-md px-2 text-muted-foreground text-xs transition-colors hover:bg-def-200 hover:text-foreground",
        className
      ),
      search: { draft },
      to: "/reports",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartLine, { className: "size-3.5" }),
        "Open as report"
      ]
    }
  );
}
const MEASURE_LABEL = {
  cost: "Cost",
  generations: "Calls",
  errors: "Errors",
  tokens: "Tokens",
  p95LatencyMs: "p95"
};
function formatMeasure(measure, value) {
  switch (measure) {
    case "cost":
      return formatCost(value ?? 0);
    case "p95LatencyMs":
      return formatLatencyOrNone(value);
    default:
      return formatTokens(value ?? 0);
  }
}
const SKELETON_ROWS = ["a", "b", "c", "d", "e"];
const DIMENSION_HEADER = {
  model: "Model",
  provider: "Provider",
  name: "Feature",
  profile: "User",
  conversation: "Conversation",
  group: "Group",
  stopReason: "Stop reason",
  errorCode: "Error"
};
function RowLabel({
  row,
  dimension
}) {
  const isAnonymous = dimension === "profile" && !row.key;
  if (isAnonymous) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-muted-foreground", children: "Anonymous" });
  }
  if (dimension === "profile") {
    const profile = row.profile;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      ProjectLink,
      {
        className: "row min-w-0 items-center gap-2 hover:underline",
        params: { profileId: row.key },
        to: "/profiles/$profileId",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileAvatar, { size: "xs", ...profile }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: profile ? getProfileName(profile, false) : row.key })
        ]
      }
    );
  }
  if (dimension === "group") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProjectLink,
      {
        className: "truncate hover:underline",
        params: { groupId: row.key },
        to: "/groups/$groupId",
        children: row.label
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: row.label });
}
function AiBreakdownWidget({
  projectId,
  dimension,
  title,
  icon,
  measure = "cost",
  secondary = "generations",
  limit,
  className
}) {
  const trpc = useTRPC();
  const { range, startDate, endDate, interval } = useOverviewOptions();
  const { filters } = useAiFilters();
  const draft = breakdownReportDraft(
    { projectId, range, startDate, endDate, interval, filters },
    { dimension, measure, name: title }
  );
  const query = useQuery(
    trpc.ai.breakdown.queryOptions({
      projectId,
      range,
      startDate,
      endDate,
      filters,
      dimension,
      limit,
      sort: measure === "errors" ? "errors" : "cost"
    })
  );
  const rows = query.data ?? [];
  const max = Math.max(...rows.map((row) => row[measure] ?? 0), 0) || 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: cn("col-span-6 md:col-span-3", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { className: "border-b-0 pb-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTitle, { icon, children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetBody, { className: "p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row justify-between px-4 pb-1 font-medium text-3xs text-muted-foreground uppercase tracking-wider", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: DIMENSION_HEADER[dimension] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "row gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-16 text-right", children: MEASURE_LABEL[secondary] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-16 text-right", children: MEASURE_LABEL[measure] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-0.5 p-1 pt-0", children: [
        query.isLoading && SKELETON_ROWS.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full" }, row)),
        query.isSuccess && rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-6 text-center text-muted-foreground text-sm", children: "Nothing in this range" }),
        rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative px-3 py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute top-0 bottom-0 left-0 rounded bg-def-200 transition-colors group-hover:bg-def-300",
              style: { width: `${(row[measure] ?? 0) / max * 100}%` }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row relative min-w-0 items-center justify-between gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RowLabel, { dimension, row }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "row shrink-0 gap-6 font-mono tabular-nums", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-16 text-right text-muted-foreground", children: formatMeasure(secondary, row[secondary]) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-16 text-right font-medium", children: measure === "cost" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                AiCost,
                {
                  cost: row.cost,
                  unpricedCalls: row.unpricedCalls
                }
              ) : formatMeasure(measure, row[measure]) })
            ] })
          ] })
        ] }, row.key))
      ] })
    ] }),
    draft && /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(OpenAsReportLink, { draft }) })
  ] });
}
const PREV_LINE_COLOR = "oklch(from var(--foreground) l c h / 0.4)";
const Y_AXIS_WIDTH = 52;
const METRICS = [
  {
    key: "cost",
    title: "Cost",
    unit: "usd",
    inverted: true,
    format: formatCost
  },
  {
    key: "generations",
    title: "Calls",
    unit: "",
    inverted: false,
    format: formatTokens
  },
  {
    key: "users",
    title: "Users",
    unit: "",
    inverted: false,
    format: formatTokens
  },
  {
    key: "costPerUser",
    title: "Cost per user",
    unit: "usd",
    inverted: true,
    format: formatCost
  },
  {
    key: "inputTokens",
    title: "Input tokens",
    unit: "",
    inverted: false,
    format: formatTokens
  },
  {
    key: "outputTokens",
    title: "Output tokens",
    unit: "",
    inverted: false,
    format: formatTokens
  },
  {
    key: "p95LatencyMs",
    title: "Latency p95",
    unit: "ms",
    inverted: true,
    format: formatLatency
  },
  {
    key: "errorRate",
    title: "Error rate",
    unit: "%",
    inverted: true,
    format: (value) => `${value.toFixed(1)}%`
  }
];
function AiMetrics({ projectId }) {
  const trpc = useTRPC();
  const { range, interval, startDate, endDate, previous } = useOverviewOptions();
  const { filters } = useAiFilters();
  const [activeIndex, setActiveIndex] = reactExports.useState(0);
  const active = METRICS[activeIndex] ?? METRICS[0];
  const query = useQuery(
    trpc.ai.overview.queryOptions({
      projectId,
      range,
      interval,
      startDate,
      endDate,
      previous,
      filters
    })
  );
  const series = query.data?.series ?? [];
  const pointsFor = (key) => series.map((point) => ({
    date: point.date,
    current: point[key],
    previous: point.previous?.[key]
  }));
  const chartData = pointsFor(active.key);
  const color = getChartColor(0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card mb-2 grid grid-cols-2 overflow-hidden rounded-md md:grid-cols-4", children: METRICS.map((metric, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      OverviewMetricCard,
      {
        active: index === activeIndex,
        data: pointsFor(metric.key),
        id: metric.key,
        interval,
        inverted: metric.inverted,
        isError: query.isError,
        isLoading: query.isLoading,
        label: metric.title,
        metric: {
          current: query.data?.metrics[metric.key] ?? 0,
          previous: query.data?.previousMetrics?.[metric.key] ?? null
        },
        onClick: () => setActiveIndex(index),
        range,
        unit: metric.unit
      },
      metric.key
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row -mt-1 items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-3xs text-muted-foreground uppercase tracking-wider", children: active.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          OpenAsReportLink,
          {
            draft: metricReportDraft(
              { projectId, range, startDate, endDate, interval, filters },
              { metric: active.key, name: `AI ${active.title.toLowerCase()}` }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-[190px] w-full", children: [
        query.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-full w-full" }),
        query.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "center-center h-full flex-col gap-3 text-center text-muted-foreground text-sm", children: [
          "We could not load this data. Try again in a moment.",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              icon: RotateCw,
              loading: query.isFetching,
              onClick: () => query.refetch(),
              size: "sm",
              variant: "outline",
              children: "Try again"
            }
          )
        ] }),
        query.isSuccess && chartData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          ComposedChart,
          {
            animationDuration: 0,
            aspectRatio: "auto",
            className: "h-full",
            data: chartData,
            margin: { top: 0, right: 20, bottom: 40, left: Y_AXIS_WIDTH },
            xDataKey: "date",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { horizontal: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { formatValue: active.format, numTicks: 4 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Area,
                {
                  animate: false,
                  dataKey: "current",
                  fadeEdges: "left",
                  fill: color,
                  fillOpacity: 0.18,
                  gradientToOpacity: 0,
                  stroke: color,
                  strokeWidth: 2
                },
                active.key
              ),
              previous && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Line,
                {
                  animate: false,
                  curve: monotoneX,
                  dataKey: "previous",
                  stroke: PREV_LINE_COLOR,
                  strokeWidth: 2
                },
                `prev-${active.key}`
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                OPChartTooltip,
                {
                  indicatorColor: color,
                  interval,
                  rows: (point) => [
                    {
                      color,
                      label: active.title,
                      value: point.current,
                      previous: point.previous,
                      format: active.format
                    }
                  ]
                }
              )
            ]
          }
        )
      ] })
    ] })
  ] });
}
function Component() {
  const {
    projectId
  } = Route.useParams();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-6 gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AiMetrics, { projectId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AiBreakdownWidget, { dimension: "model", icon: Cpu, projectId, title: "Cost by model" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AiBreakdownWidget, { dimension: "name", icon: Layers, projectId, title: "Cost by feature" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AiBreakdownWidget, { dimension: "profile", icon: Users, projectId, title: "Top users" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AiBreakdownWidget, { dimension: "group", icon: Building2, projectId, title: "Top groups" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AiBreakdownWidget, { dimension: "provider", icon: Server, projectId, title: "Cost by provider" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AiBreakdownWidget, { dimension: "model", icon: TriangleAlert, measure: "errors", projectId, secondary: "generations", title: "Errors by model" })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.ai._tabs.index-BerYNNYN.js.map
