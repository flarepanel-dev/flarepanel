import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, d as cn, a$ as ComposedChart, b0 as YAxis, a4 as useNumber, b1 as SeriesBar, b2 as Line, ad as getChartColor, ae as monotoneX, af as OPChartTooltip, A as Link, S as SerieIcon, L as LinkButton, b3 as Settings, b4 as Skeleton, a as useTRPC, j as useQuery, b5 as TrendingUp, b6 as TrendingDown, b7 as Route, E as EmptyState$1, B as Button, H as pushModal, G as Plus } from "./router-gBnYxPzA.js";
import { L as LazyComponent } from "./lazy-component-BvTCtqML.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { u as useSearchQueryState, A as AnimatedSearchInput } from "./data-table-toolbar-BJU_j2v8.js";
import { u as useOrganizationAccess } from "./use-organization-access-Bak6gOET.js";
import { S as SearchX } from "./search-x-G2uq0KeH.js";
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
const __iconNode = [
  ["path", { d: "M12 10v6", key: "1bos4e" }],
  ["path", { d: "M9 13h6", key: "1uhe8q" }],
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ]
];
const FolderPlus = createLucideIcon("folder-plus", __iconNode);
function FadeIn({ className, children }) {
  const ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (ref.current) {
      ref.current.classList.remove("opacity-0");
      ref.current.classList.add("opacity-100");
    }
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn("opacity-0 transition-opacity duration-500", className),
      ref,
      children
    }
  );
}
const MARGIN = { top: 10, right: 10, bottom: 10, left: 32 };
const SESSIONS_COLOR = getChartColor(0);
const REVENUE_COLOR = "#3ba974";
const REVENUE_AXIS_ID = "right";
const REVENUE_HEADROOM = 2;
const REVENUE_MAX_BAR_SIZE = 20;
const REVENUE_BAR_RADIUS = 2;
const HOVER_DOT_SIZE = 3;
const HOVER_DOT_HALO_SCALE = 1.8;
const LINE_WIDTH = 2;
const AXIS_TICKS = 2;
const EMPTY_STATE_BARS = [
  28,
  42,
  35,
  50,
  40,
  56,
  45,
  60,
  49,
  32,
  98,
  29,
  49,
  69,
  49,
  20,
  28,
  42,
  35,
  50,
  40,
  56,
  45,
  60,
  49,
  32,
  98,
  29,
  49,
  69,
  49,
  20
];
function ProjectChart({
  data
}) {
  const number = useNumber();
  if (data.length === 0) {
    return null;
  }
  const points = data.map((point) => ({ ...point }));
  const maxValue = Math.max(...data.map((point) => point.value), 0);
  const maxRevenue = Math.max(...data.map((point) => point.revenue), 0);
  const hasRevenue = maxRevenue > 0;
  if (maxValue === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-full w-full pl-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    ComposedChart,
    {
      animationDuration: 0,
      aspectRatio: "auto",
      className: "h-full",
      data: points,
      margin: MARGIN,
      maxBarSize: REVENUE_MAX_BAR_SIZE,
      xDataKey: "date",
      yDomains: hasRevenue ? { [REVENUE_AXIS_ID]: [0, maxRevenue * REVENUE_HEADROOM] } : void 0,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { formatValue: number.short, numTicks: AXIS_TICKS }),
        hasRevenue && /* @__PURE__ */ jsxRuntimeExports.jsx(
          SeriesBar,
          {
            animate: false,
            dataKey: "revenue",
            fill: REVENUE_COLOR,
            radius: REVENUE_BAR_RADIUS,
            yAxisId: REVENUE_AXIS_ID
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Line,
          {
            animate: false,
            curve: monotoneX,
            dataKey: "value",
            stroke: SESSIONS_COLOR,
            strokeWidth: LINE_WIDTH
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          OPChartTooltip,
          {
            datePill: false,
            dotHaloScale: HOVER_DOT_HALO_SCALE,
            dotSize: HOVER_DOT_SIZE,
            rows: (point) => [
              {
                color: SESSIONS_COLOR,
                label: "Sessions",
                value: point.value,
                format: number.format
              },
              ...point.revenue > 0 ? [
                {
                  color: REVENUE_COLOR,
                  label: "Revenue",
                  value: point.revenue,
                  unit: "currency"
                }
              ] : []
            ],
            showCrosshair: true,
            showDots: true
          }
        )
      ]
    }
  ) });
}
function EmptyState() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-full w-full pl-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-3 bottom-2 h-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-end gap-1.5 opacity-35", children: EMPTY_STATE_BARS.map((height, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex-1 rounded-full bg-foreground/20",
        style: { height: `${height}%` }
      },
      `${index}-${height}`
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground/85 text-sm", children: "No activity yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Sessions will show up here once tracking starts." })
    ] })
  ] });
}
function ProjectCardRoot({
  children,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "card relative hover:z-10 hover:-translate-y-px hover:shadow-sm",
        className
      ),
      children
    }
  );
}
function ProjectCardSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ProjectCardRoot, { className: "col h-[250px] gap-4 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "size-9 rounded-lg" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-40" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-20" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mt-auto h-3 w-1/2" })
  ] });
}
function displayDomain(domain) {
  return (domain ?? "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}
function ProjectCard({ id, domain, name, organizationId }) {
  const host = displayDomain(domain);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ProjectCardRoot, { className: "group overflow-hidden transition-[transform,box-shadow,border-color] hover:border-foreground/20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        className: "col h-full p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        params: {
          organizationId,
          projectId: id
        },
        to: "/$organizationId/$projectId",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-3 pr-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "center-center size-9 shrink-0 rounded-lg border bg-def-100", children: domain ? /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: domain }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-muted-foreground text-sm", children: name.slice(0, 1).toUpperCase() }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium leading-tight", children: name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-muted-foreground text-sm", children: host || "No domain" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectHeadline, { id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-5 mt-2 mb-4 h-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectChartOuter, { id }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectMetrics, { id })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      LinkButton,
      {
        "aria-label": `Settings for ${name}`,
        className: "absolute top-3 right-3 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100",
        href: `/${organizationId}/${id}/settings`,
        size: "icon",
        variant: "ghost",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 16 })
      }
    )
  ] });
}
function ProjectHeadline({ id }) {
  const number = useNumber();
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.chart.projectCard.queryOptions({
      projectId: id
    })
  );
  const today = data?.metrics?.day ?? 0;
  const hasAny = (data?.metrics?.months_3 ?? 0) > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row mt-5 items-end justify-between gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-16" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-2xl tabular-nums leading-none", children: number.short(data?.metrics?.month ?? 0) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 text-muted-foreground text-sm", children: "visitors in the last 30 days" })
    ] }),
    !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "row shrink-0 items-center gap-1.5 text-sm",
          today > 0 ? "text-foreground" : "text-muted-foreground"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "size-2 rounded-full",
                today > 0 ? "bg-emerald-500" : "bg-muted-foreground/40"
              )
            }
          ),
          today > 0 ? `${number.short(today)} today` : hasAny ? "Quiet today" : "Waiting for first event"
        ]
      }
    )
  ] });
}
function ProjectChartOuter({ id }) {
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.chart.projectCard.queryOptions({
      projectId: id
    })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FadeIn, { className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectChart, { data: data?.chart || [] }) });
}
function Metric({
  value,
  label,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("row items-center gap-1.5 text-sm", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap font-medium tabular-nums", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: label })
  ] });
}
function ProjectMetrics({ id }) {
  const number = useNumber();
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.chart.projectCard.queryOptions({
      projectId: id
    })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(FadeIn, { className: "row mt-auto flex-wrap items-center gap-x-5 gap-y-1 border-t pt-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Metric,
      {
        label: "Last 3 months",
        value: number.short(data?.metrics?.months_3 ?? 0)
      }
    ),
    typeof data?.trend?.percentage === "number" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Metric,
      {
        label: "vs. the 3 months before",
        value: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: cn(
              "row items-center gap-1",
              data?.trend?.direction === "up" ? "text-emerald-500" : data?.trend?.direction === "down" ? "text-orange-400" : "text-muted-foreground"
            ),
            children: [
              data.trend.direction === "up" && /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4" }),
              data.trend.direction === "down" && /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "size-4" }),
              Math.abs(data.trend.percentage),
              "%"
            ]
          }
        )
      }
    ),
    !!data?.metrics?.revenue && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Metric,
      {
        className: "ml-auto",
        label: "Revenue",
        value: number.currency(data?.metrics?.revenue / 100, {
          short: true
        })
      }
    )
  ] });
}
function OrganizationPage() {
  const {
    organizationId
  } = Route.useParams();
  const trpc = useTRPC();
  const {
    data: projects
  } = useQuery(trpc.project.list.queryOptions({
    organizationId
  }));
  const {
    isAdmin
  } = useOrganizationAccess(organizationId);
  const {
    setSearch,
    search
  } = useSearchQueryState();
  if (!projects?.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { className: "mb-8", description: "All your projects in this workspace", title: "Projects" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState$1, { description: isAdmin ? "A project holds the data for one website or app. Create one, install the SDK, and your first events show up within minutes." : "You don't have access to any projects in this workspace yet. Ask an admin to add you to one.", icon: FolderPlus, title: isAdmin ? "Create your first project" : "No projects yet", children: isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { icon: Plus, onClick: () => pushModal("AddProject"), children: "Create project" }) })
    ] });
  }
  const visible = projects.filter((project) => !search || project.name.toLowerCase().includes(search.toLowerCase()));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedSearchInput, { onChange: setSearch, placeholder: "Search projects", value: search }),
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { icon: Plus, onClick: () => pushModal("AddProject"), children: "New project" })
    ] }), className: "mb-6 items-center", description: `${projects.length} ${projects.length === 1 ? "project" : "projects"} in this workspace. Open one to see its analytics.`, title: "Projects" }),
    visible.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState$1, { description: `No project is called "${search}".`, icon: SearchX, title: "Nothing found", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setSearch(""), variant: "outline", children: "Clear search" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2 2xl:grid-cols-3", children: [
      visible.map((project, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(LazyComponent, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectCardSkeleton, {}), lazy: index >= 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectCard, { ...project, organizationId }) }, project.id)),
      isAdmin && !search && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "col center-center min-h-[250px] gap-2 rounded-md border border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-def-100 hover:text-foreground", onClick: () => pushModal("AddProject"), type: "button", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Add another website or app" })
      ] })
    ] })
  ] });
}
export {
  OrganizationPage as component
};
//# sourceMappingURL=_app._organizationId.index-CTwK5QrR.js.map
