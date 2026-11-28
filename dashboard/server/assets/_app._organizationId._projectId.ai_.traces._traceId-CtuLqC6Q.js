import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { a as isUnpricedCall, A as AiCost, i as isAiModelCall } from "./ai-cost-C8tzxtic.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { W as Workflow, A as AiEventDetail } from "./ai-event-detail-4RHMKfrC.js";
import { c as createLucideIcon, bs as formatLatency, iq as FileText, a1 as Sparkles, d as cn, bq as TriangleAlert, br as formatTokens, ir as Route, a as useTRPC, bn as formatDateTime, P as ProjectLink } from "./router-gBnYxPzA.js";
import { P as ProfileCell } from "./ai-traces-table-CKNiytqr.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { b as Widget, a as WidgetHead, c as WidgetTitle, W as WidgetBody } from "./widget-D7PGEeO1.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "./pick-CfnSzKDx.js";
import "./syntax-CwZKbcAR.js";
import "./key-value-grid-BaTCXsBI.js";
import "./countries-CS917BhP.js";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
import "./useInfiniteQuery-149RJLhL.js";
import "./data-table-WJSjaNsN.js";
import "./table-Bl3avL3P.js";
import "./pagination-Dj6_PitL.js";
import "./useIsFetching-BWA9Maly.js";
const __iconNode = [
  [
    "path",
    { d: "M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1", key: "ezmyqa" }
  ],
  [
    "path",
    {
      d: "M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1",
      key: "e1hn23"
    }
  ]
];
const Braces = createLucideIcon("braces", __iconNode);
const TYPE_ICON = {
  generation: Sparkles,
  embedding: Braces,
  span: Workflow,
  trace: FileText
};
const TYPE_COLOR = {
  generation: "bg-chart-0",
  embedding: "bg-chart-2",
  span: "bg-chart-4",
  trace: "bg-foreground/40"
};
const INDENT_PX = 16;
const MIN_BAR_PX = 2;
function buildTraceNodes(events) {
  const sorted = [...events].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
  const start = sorted[0]?.createdAt.getTime() ?? 0;
  const end = Math.max(
    ...sorted.map((event) => event.createdAt.getTime() + event.latencyMs),
    start
  );
  const byId = new Map(
    sorted.map((event) => [event.spanId || event.id, event])
  );
  const children = /* @__PURE__ */ new Map();
  const roots = [];
  for (const event of sorted) {
    const parentKey = event.parentId && event.parentId !== event.traceId && byId.has(event.parentId) ? event.parentId : null;
    if (parentKey) {
      children.set(parentKey, [...children.get(parentKey) ?? [], event]);
    } else {
      roots.push(event);
    }
  }
  const nodes = [];
  const visit = (event, depth) => {
    nodes.push({ event, depth, offsetMs: event.createdAt.getTime() - start });
    for (const child of children.get(event.spanId || event.id) ?? []) {
      visit(child, depth + 1);
    }
  };
  for (const root of roots) {
    visit(root, 0);
  }
  return { nodes, totalMs: Math.max(end - start, 1) };
}
function AiTraceTree({ events, selectedId, onSelect }) {
  const { nodes, totalMs } = reactExports.useMemo(() => buildTraceNodes(events), [events]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center justify-between px-3 py-1.5 font-medium text-3xs text-muted-foreground uppercase tracking-wider", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Step" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        formatLatency(totalMs),
        " total"
      ] })
    ] }),
    nodes.map(({ event, depth, offsetMs }) => {
      const Icon = TYPE_ICON[event.type];
      const left = offsetMs / totalMs * 100;
      const width = Math.max(event.latencyMs / totalMs * 100, 0);
      const selected = event.id === selectedId;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: cn(
            "group grid w-full grid-cols-[minmax(0,1fr)_minmax(120px,40%)] items-center gap-3 border-t px-3 py-2 text-left transition-colors hover:bg-def-100",
            selected && "bg-def-100"
          ),
          onClick: () => onSelect(event.id),
          type: "button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "row min-w-0 items-center gap-2",
                style: { paddingLeft: depth * INDENT_PX },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Icon,
                    {
                      className: cn(
                        "size-3.5 shrink-0",
                        event.isError ? "text-destructive" : "text-muted-foreground"
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium text-sm", children: event.name || event.model || event.type }),
                  event.model && event.name && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-muted-foreground text-xs", children: event.model }),
                  event.isError && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-3 shrink-0 text-destructive" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-4 flex-1 rounded bg-def-200/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: cn(
                    "absolute top-0 h-full rounded",
                    event.isError ? "bg-destructive" : TYPE_COLOR[event.type]
                  ),
                  style: {
                    left: `${left}%`,
                    width: `max(${width}%, ${MIN_BAR_PX}px)`
                  }
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-28 shrink-0 text-right font-mono text-muted-foreground text-xs tabular-nums", children: [
                formatLatency(event.latencyMs),
                event.type === "generation" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1", children: [
                  "· ",
                  formatTokens(event.inputTokens + event.outputTokens),
                  "t"
                ] }),
                (event.totalCost > 0 || isUnpricedCall(event)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1", children: [
                  "·",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AiCost,
                    {
                      cost: event.totalCost,
                      unpricedCalls: isUnpricedCall(event) ? 1 : 0
                    }
                  )
                ] })
              ] })
            ] })
          ]
        },
        event.id
      );
    })
  ] });
}
function Component() {
  const {
    projectId,
    traceId
  } = Route.useParams();
  const {
    at
  } = Route.useSearch();
  const trpc = useTRPC();
  const {
    data: events
  } = useSuspenseQuery(trpc.ai.trace.queryOptions({
    projectId,
    traceId,
    around: at
  }));
  const [selectedId, setSelectedId] = reactExports.useState(null);
  const {
    nodes,
    totalMs
  } = buildTraceNodes(events);
  const first = nodes[0]?.event;
  const selected = events.find((event) => event.id === selectedId) ?? first;
  const totals = events.reduce((acc, event) => ({
    cost: acc.cost + event.totalCost,
    tokens: acc.tokens + event.inputTokens + event.outputTokens,
    generations: acc.generations + (isAiModelCall(event.type) ? 1 : 0),
    errors: acc.errors + (event.isError ? 1 : 0),
    unpricedCalls: acc.unpricedCalls + (isUnpricedCall(event) ? 1 : 0)
  }), {
    cost: 0,
    tokens: 0,
    generations: 0,
    errors: 0,
    unpricedCalls: 0
  });
  const root = events.find((event) => event.type === "trace");
  const name = root?.name || events.find((event) => event.type === "generation" && event.name)?.name || first?.name || "Trace";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { className: "col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: name, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row flex-wrap items-center gap-x-5 gap-y-1", children: [
        first && /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileCell, { deviceId: first.deviceId, profile: first.profile, profileId: first.profileId }),
        first && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: formatDateTime(first.createdAt) }),
        first?.sessionId && /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectLink, { className: "text-muted-foreground hover:underline", params: {
          sessionId: first.sessionId
        }, to: "/sessions/$sessionId", children: "Open session" }),
        first?.conversationId && /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectLink, { className: "text-muted-foreground hover:underline", search: {
          conversation: first.conversationId
        }, to: "/ai/traces", children: "Conversation" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row flex-wrap gap-x-5 gap-y-1 font-mono text-xs tabular-nums", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatLatency(totalMs) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          totals.generations,
          " ",
          totals.generations === 1 ? "call" : "calls"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          formatTokens(totals.tokens),
          " tokens"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AiCost, { cost: totals.cost, unpricedCalls: totals.unpricedCalls }) }),
        totals.errors > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-destructive", children: [
          totals.errors,
          " errors"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-2xs text-muted-foreground", children: traceId })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full self-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTitle, { children: "Timeline" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AiTraceTree, { events, onSelect: setSelectedId, selectedId: selected?.id ?? null })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full self-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTitle, { children: selected?.name || selected?.model || "Step" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: selected && /* @__PURE__ */ jsxRuntimeExports.jsx(AiEventDetail, { event: selected, showTraceLink: false }) })
      ] })
    ] })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.ai_.traces._traceId-CtuLqC6Q.js.map
