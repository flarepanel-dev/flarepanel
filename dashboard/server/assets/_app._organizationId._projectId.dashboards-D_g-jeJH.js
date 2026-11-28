import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, dG as GRID_COLUMNS, d as cn, b5 as TrendingUp, fi as Cone, fh as ChartPie, a0 as ChartLine, h9 as Route, a as useTRPC, ak as useQueryClient, j as useQuery, b as useMutation, ha as handleErrorToastOptions, as as Ut, B as Button, H as pushModal, G as Plus, E as EmptyState, A as Link, a_ as format, bz as Copy, dK as Trash, hb as showConfirm } from "./router-gBnYxPzA.js";
import { C as Card, a as CardActions, b as CardActionsItem } from "./card-cYnxdFV_.js";
import { t as toLayout } from "./dashboard-grid-BOxGeuKe.js";
import { C as ChartColumnBig, G as GitBranch } from "./git-branch-Co2cjI3D.js";
import { C as ChartArea } from "./chart-area-DUmaUMbJ.js";
import { E as Earth } from "./earth-Din9zDf9.js";
import { C as ChartBar } from "./chart-bar-D8P8dBZk.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { L as LayoutPanelTop } from "./layout-panel-top-B4lJ9Wyr.js";
import { P as Pencil } from "./pencil-C1NQD0wZ.js";
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
const __iconNode$2 = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
];
const ChartColumn = createLucideIcon("chart-column", __iconNode$2);
const __iconNode$1 = [
  ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }],
  ["circle", { cx: "18.5", cy: "5.5", r: ".5", fill: "currentColor", key: "lysivs" }],
  ["circle", { cx: "11.5", cy: "11.5", r: ".5", fill: "currentColor", key: "byv1b8" }],
  ["circle", { cx: "7.5", cy: "16.5", r: ".5", fill: "currentColor", key: "nkw3mc" }],
  ["circle", { cx: "17.5", cy: "14.5", r: ".5", fill: "currentColor", key: "1gjh6j" }],
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }]
];
const ChartScatter = createLucideIcon("chart-scatter", __iconNode$1);
const __iconNode = [
  ["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }],
  ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }],
  ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }],
  ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }]
];
const Hash = createLucideIcon("hash", __iconNode);
const CHART_TYPE_ICONS = {
  bar: ChartBar,
  linear: ChartLine,
  pie: ChartPie,
  metric: Hash,
  map: Earth,
  histogram: ChartColumn,
  funnel: Cone,
  area: ChartArea,
  retention: ChartScatter,
  conversion: TrendingUp,
  sankey: GitBranch,
  distribution: ChartColumnBig
};
const MIN_ROWS = 12;
const MAX_ROWS = 28;
const ICON_MIN_WIDTH_COLUMNS = 6;
const ICON_MIN_HEIGHT_ROWS = 4;
const ICON_SIZE = 14;
function iconFor(chartType) {
  return chartType ? CHART_TYPE_ICONS[chartType] : void 0;
}
function DashboardPreview({
  reports,
  className
}) {
  const tiles = reactExports.useMemo(() => {
    const layout = toLayout(reports);
    const byId = new Map(reports.map((report) => [report.id, report]));
    const rows = Math.min(
      MAX_ROWS,
      Math.max(MIN_ROWS, ...layout.map((item) => item.y + item.h))
    );
    return layout.filter((item) => item.y < rows).map((item) => ({
      id: item.i,
      icon: iconFor(byId.get(item.i)?.chartType),
      showIcon: item.w >= ICON_MIN_WIDTH_COLUMNS && item.h >= ICON_MIN_HEIGHT_ROWS,
      style: {
        left: `${item.x / GRID_COLUMNS * 100}%`,
        top: `${item.y / rows * 100}%`,
        width: `${item.w / GRID_COLUMNS * 100}%`,
        height: `${Math.min(item.h, rows - item.y) / rows * 100}%`
      }
    }));
  }, [reports]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "relative aspect-[2/1] w-full overflow-hidden rounded-md bg-def-100 p-1.5",
        className
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-full w-full", children: tiles.map((tile) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute p-0.5", style: tile.style, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center rounded-[3px] bg-def-300/70 text-muted-foreground transition-colors group-hover:bg-chart-0/20 group-hover:text-chart-0 dark:bg-def-700/70", children: tile.icon && tile.showIcon && /* @__PURE__ */ jsxRuntimeExports.jsx(tile.icon, { size: ICON_SIZE }) }) }, tile.id)) })
    }
  );
}
function Component() {
  const {
    projectId
  } = Route.useParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const query = useQuery(trpc.dashboard.list.queryOptions({
    projectId
  }));
  const dashboards = query.data ?? [];
  const duplication = useMutation(trpc.dashboard.duplicate.mutationOptions({
    onError: handleErrorToastOptions({}),
    onSuccess(dashboard) {
      query.refetch();
      Ut("Success", {
        description: `Created "${dashboard.name}".`
      });
    }
  }));
  const deletion = useMutation(trpc.dashboard.delete.mutationOptions({
    onError: (error, variables) => {
      return handleErrorToastOptions({
        action: {
          label: "Force delete",
          onClick: () => {
            deletion.mutate({
              forceDelete: true,
              id: variables.id
            });
          }
        }
      })(error);
    },
    onSuccess() {
      queryClient.invalidateQueries(trpc.dashboard.list.pathFilter());
      query.refetch();
      Ut("Success", {
        description: "Dashboard deleted."
      });
    }
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { icon: Plus, onClick: () => pushModal("AddDashboard"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-sm:hidden", children: "Create dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Dashboard" })
    ] }), className: "mb-8", description: "Access all your dashboards here", title: "Dashboards" }),
    dashboards.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { description: "Put the reports you check most often on one page, then share it with your team or embed it.", icon: LayoutPanelTop, title: "No dashboards yet", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { icon: Plus, onClick: () => pushModal("AddDashboard"), children: "Create dashboard" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3", children: dashboards.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "group", hover: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { className: "col gap-3 p-3", from: Route.fullPath, to: `${item.id}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardPreview, { reports: item.reports }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-0.5 px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium", children: item.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-muted-foreground text-sm", children: [
            item.reports.length,
            " ",
            item.reports.length === 1 ? "report" : "reports",
            " · Updated",
            " ",
            format(item.updatedAt, "MMM d, HH:mm")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardActionsItem, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          pushModal("EditDashboard", item);
        }, type: "button", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 16 }),
          "Edit"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardActionsItem, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: duplication.isPending, onClick: () => duplication.mutate({
          id: item.id
        }), type: "button", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 16 }),
          "Duplicate"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardActionsItem, { asChild: true, className: "w-full text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          showConfirm({
            title: "Delete dashboard",
            text: "Are you sure you want to delete this dashboard? All your reports will be deleted!",
            onConfirm: () => deletion.mutate({
              id: item.id
            })
          });
        }, type: "button", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash, { size: 16 }),
          "Delete"
        ] }) })
      ] })
    ] }, item.id)) })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.dashboards-D_g-jeJH.js.map
