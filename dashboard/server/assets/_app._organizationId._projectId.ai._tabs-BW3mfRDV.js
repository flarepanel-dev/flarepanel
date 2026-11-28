import { o as jsxRuntimeExports, b as useRouter, O as Outlet } from "./worker-entry-C5kSRogq.js";
import { F as FeedbackButton } from "./feedback-button-D4N4cqSA.js";
import { c as createLucideIcon, aD as Alert, d as cn, aE as AlertTitle, aF as AlertDescription, hP as MessageSquare, a as useTRPC, c8 as useOverviewOptions, hQ as useAiFilters, j as useQuery, hR as Cpu, dU as Server, V as Layers, B as Button, bq as TriangleAlert, X, hS as Route, M as Badge } from "./router-gBnYxPzA.js";
import { B as BookOpen } from "./book-open-kNvy5Ks9.js";
import { A as AnimatedSearchInput } from "./data-table-toolbar-BJU_j2v8.js";
import { a as ToolbarMultiSelect } from "./toolbar-select-B2rkqrrv.js";
import { O as OverviewInterval } from "./overview-interval-cSBL6ZB5.js";
import { O as OverviewRange } from "./overview-range-DoapqOyi.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-TM5g9vxR.js";
import { u as usePageTabs } from "./use-page-tabs-CrMqsrps.js";
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
import "./ReportInterval-zZuTI3j-.js";
import "./differenceInDays-liXHUvyd.js";
import "./time-window-picker-BUBj3ZWF.js";
import "./index-DxXk7QJj.js";
import "./addDays-BIiJOlUZ.js";
import "./endOfMonth-C3pRd8ne.js";
import "./startOfMonth-Bf6CczcY.js";
const __iconNode = [
  [
    "path",
    {
      d: "M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2",
      key: "18mbvz"
    }
  ],
  ["path", { d: "M6.453 15h11.094", key: "3shlmq" }],
  ["path", { d: "M8.5 2h7", key: "csnxdl" }]
];
const FlaskConical = createLucideIcon("flask-conical", __iconNode);
const AI_DOCS_URL = "https://docs.flarepanel.dev";
const ACTION_CLASS = "row h-8 items-center gap-1.5 rounded-md border bg-background px-2.5 font-medium text-foreground text-xs transition-colors hover:bg-def-100";
function AiBetaBanner({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: cn("border-chart-0/40 bg-chart-0/5", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "size-4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "AI observability is in beta" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { className: "col gap-3 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We are shaping this with the people who use it. How events are sent and what these pages show may change before it is final, but events you have already sent stay readable. Tell us what you are trying to learn about your AI features and what is missing." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FeedbackButton, { className: ACTION_CLASS, topic: "AI observability", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "size-3.5" }),
          "Give feedback"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            className: ACTION_CLASS,
            href: AI_DOCS_URL,
            rel: "noopener noreferrer",
            target: "_blank",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-3.5" }),
              "Read the docs"
            ]
          }
        )
      ] })
    ] })
  ] });
}
const NO_VALUES_TEXT = "Nothing in this range";
function AiFilters({ projectId }) {
  const trpc = useTRPC();
  const { range, startDate, endDate } = useOverviewOptions();
  const { state, setState, activeCount, clear } = useAiFilters();
  const values = useQuery(
    trpc.ai.filterValues.queryOptions(
      { projectId, range, startDate, endDate },
      { staleTime: 6e4 }
    )
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ToolbarMultiSelect,
      {
        emptyText: NO_VALUES_TEXT,
        icon: Cpu,
        label: "Model",
        onChange: (models) => setState({ models: models.length ? models : null }),
        options: values.data?.model ?? [],
        selected: state.models ?? []
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ToolbarMultiSelect,
      {
        emptyText: NO_VALUES_TEXT,
        icon: Server,
        label: "Provider",
        onChange: (providers) => setState({ providers: providers.length ? providers : null }),
        options: values.data?.provider ?? [],
        selected: state.providers ?? []
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ToolbarMultiSelect,
      {
        emptyText: NO_VALUES_TEXT,
        icon: Layers,
        label: "Feature",
        onChange: (names) => setState({ names: names.length ? names : null }),
        options: values.data?.name ?? [],
        selected: state.names ?? []
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        className: cn(state.errors && "border-destructive/60 text-destructive"),
        icon: TriangleAlert,
        onClick: () => setState({ errors: state.errors ? null : true }),
        variant: "outline",
        children: "Errors only"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AnimatedSearchInput,
      {
        onChange: (value) => setState({ q: value || null }),
        placeholder: "Search prompts, trace id…",
        value: state.q ?? ""
      }
    ),
    state.profile && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScopePill,
      {
        label: `Profile ${state.profile}`,
        onClear: () => setState({ profile: null })
      }
    ),
    state.group && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScopePill,
      {
        label: `Group ${state.group}`,
        onClear: () => setState({ group: null })
      }
    ),
    state.conversation && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScopePill,
      {
        label: `Conversation ${state.conversation}`,
        onClear: () => setState({ conversation: null })
      }
    ),
    state.session && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScopePill,
      {
        label: `Session ${state.session}`,
        onClear: () => setState({ session: null })
      }
    ),
    activeCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: clear, variant: "ghost", children: "Clear" })
  ] });
}
function ScopePill({ label, onClear }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "row h-9 items-center gap-1 rounded-md border bg-def-100 px-2 text-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-48 truncate", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        "aria-label": `Remove ${label}`,
        className: "rounded p-0.5 hover:bg-def-200",
        onClick: onClear,
        type: "button",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" })
      }
    )
  ] });
}
function Component() {
  const router = useRouter();
  const {
    projectId
  } = Route.useParams();
  const {
    activeTab,
    tabs
  } = usePageTabs([{
    id: "ai",
    label: "Overview"
  }, {
    id: "traces",
    label: "Traces"
  }, {
    id: "generations",
    label: "Calls"
  }]);
  const handleTabChange = (tabId) => {
    router.navigate({
      from: Route.fullPath,
      to: tabId === "ai" ? "." : tabId,
      search: (previous) => previous
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { description: "Every model call your product makes: cost, tokens, latency and errors, tied to the profiles and sessions behind them", title: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "row items-center gap-2", children: [
      "AI",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Beta" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AiBetaBanner, { className: "mt-4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col mt-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewRange, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewInterval, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AiFilters, { projectId })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { className: "mt-4 mb-6", onValueChange: handleTabChange, value: activeTab, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { children: tabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: tab.id, children: tab.label }, tab.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.ai._tabs-BW3mfRDV.js.map
