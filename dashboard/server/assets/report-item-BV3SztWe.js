import { b as useRouter, o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { dI as zChartEventFilter, cs as getCohortIds, ck as timeWindows, D as DropdownMenu, m as DropdownMenuTrigger, dJ as Ellipsis, n as DropdownMenuContent, o as DropdownMenuItem, bz as Copy, z as DropdownMenuGroup, dK as Trash, d as cn, bt as ReportChart, a0 as ChartLine } from "./router-gBnYxPzA.js";
import { L as LayoutPanelTop } from "./layout-panel-top-B4lJ9Wyr.js";
import { T as Table } from "./table-DNq4Q3EQ.js";
const VALUELESS_OPERATORS = [
  "isNull",
  "isNotNull"
];
function isCohortFilter(filter) {
  return filter.operator === "inCohort" || filter.operator === "notInCohort";
}
function narrowsResults(filter) {
  if (isCohortFilter(filter)) {
    return getCohortIds(filter).length > 0;
  }
  if (VALUELESS_OPERATORS.includes(filter.operator)) {
    return true;
  }
  return filter.value.length > 0;
}
function mergeDashboardFilters(reportFilters, dashboardFilters) {
  const own = reportFilters ?? [];
  const active = (dashboardFilters ?? []).filter(narrowsResults);
  if (active.length === 0) {
    return own;
  }
  return [...own, ...active];
}
function parseDashboardFilters(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap((item) => {
    const parsed = zChartEventFilter.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}
function filterSignature(filter) {
  return JSON.stringify([
    filter.name,
    filter.operator,
    filter.type ?? null,
    filter.value.map((value) => String(value ?? "")),
    getCohortIds(filter)
  ]);
}
function isSameDashboardFilters(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every(
    (filter, index) => filterSignature(filter) === filterSignature(b[index])
  );
}
function TileViewToggle({
  chartType,
  view,
  onChange
}) {
  if (chartType === "metric") {
    return null;
  }
  const isTable = view === "table";
  const label = isTable ? "Show chart" : "Show table";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      "aria-label": label,
      className: "flex h-8 w-8 items-center justify-center rounded opacity-0 transition-opacity hover:border focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100",
      onClick: (event) => {
        event.stopPropagation();
        onChange(isTable ? "chart" : "table");
      },
      title: label,
      type: "button",
      children: isTable ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartLine, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { size: 16 })
    }
  );
}
function ReportItemSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card flex h-full animate-pulse flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-border border-b p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 h-5 w-32 rounded bg-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-24 rounded bg-muted/50" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded bg-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded bg-muted" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex aspect-video flex-1 items-center justify-center p-4" })
  ] });
}
function ReportItem({
  report,
  organizationId,
  projectId,
  range,
  startDate,
  endDate,
  interval,
  dashboardFilters,
  onDelete,
  onDuplicate,
  onMove,
  onViewChange
}) {
  const router = useRouter();
  const chartRange = report.range;
  const view = report.display?.view ?? "chart";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card group flex h-full flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tile-header flex items-center justify-between border-border border-b p-4 hover:bg-muted/50 [&_svg]:hover:opacity-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "-m-4 flex-1 cursor-pointer p-4",
          onClick: (event) => {
            if (event.metaKey) {
              window.open(
                `/${organizationId}/${projectId}/reports/${report.id}`,
                "_blank"
              );
              return;
            }
            router.navigate({
              to: "/$organizationId/$projectId/reports/$reportId",
              params: {
                organizationId,
                projectId,
                reportId: report.id
              }
            });
          },
          onKeyUp: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              router.navigate({
                to: "/$organizationId/$projectId/reports/$reportId",
                params: {
                  organizationId,
                  projectId,
                  reportId: report.id
                }
              });
            }
          },
          role: "button",
          tabIndex: 0,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: report.name }),
            chartRange !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: chartRange !== range && range !== null || startDate && endDate ? "line-through" : "",
                  children: timeWindows[chartRange]?.label
                }
              ),
              startDate && endDate ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Custom dates" }) : range !== null && chartRange !== range && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: timeWindows[range]?.label })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TileViewToggle,
          {
            chartType: report.chartType,
            onChange: (next) => onViewChange(report.id, next),
            view
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { className: "flex h-8 w-8 items-center justify-center rounded hover:border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { size: 16 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-[200px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              DropdownMenuItem,
              {
                onClick: (event) => {
                  event.stopPropagation();
                  onDuplicate(report.id);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "mr-2", size: 16 }),
                  "Duplicate"
                ]
              }
            ),
            onMove && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              DropdownMenuItem,
              {
                onClick: (event) => {
                  event.stopPropagation();
                  onMove(report.id);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutPanelTop, { className: "mr-2", size: 16 }),
                  "Move to dashboard"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuGroup, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              DropdownMenuItem,
              {
                className: "text-destructive",
                onClick: (event) => {
                  event.stopPropagation();
                  onDelete(report.id);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash, { className: "mr-2", size: 16 }),
                  "Delete"
                ]
              }
            ) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "min-h-0 flex-1 overflow-hidden p-4",
          report.chartType === "metric" && "p-0"
        ),
        "data-tile-body": true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ReportChart,
          {
            layout: "fill",
            options: { view },
            report: {
              ...report,
              range: range ?? report.range,
              startDate: startDate ?? null,
              endDate: endDate ?? null,
              interval: interval ?? report.interval,
              globalFilters: mergeDashboardFilters(
                report.globalFilters,
                dashboardFilters
              )
            }
          }
        )
      }
    )
  ] });
}
function ReportItemReadOnly({
  report,
  shareId,
  range,
  startDate,
  endDate,
  interval
}) {
  const chartRange = report.range;
  const [view, setView] = reactExports.useState(report.display?.view ?? "chart");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card group flex h-full flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-border border-b p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: report.name }),
        chartRange !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: chartRange !== range && range !== null || startDate && endDate ? "line-through" : "",
              children: timeWindows[chartRange]?.label
            }
          ),
          startDate && endDate ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Custom dates" }) : range !== null && chartRange !== range && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: timeWindows[range]?.label })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TileViewToggle,
        {
          chartType: report.chartType,
          onChange: setView,
          view
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "min-h-0 flex-1 overflow-hidden p-4",
          report.chartType === "metric" && "p-0"
        ),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ReportChart,
          {
            layout: "fill",
            options: { view },
            report: {
              ...report,
              range: range ?? report.range,
              startDate: startDate ?? null,
              endDate: endDate ?? null,
              interval: interval ?? report.interval
            },
            shareId
          }
        )
      }
    )
  ] });
}
export {
  ReportItemSkeleton as R,
  ReportItemReadOnly as a,
  ReportItem as b,
  isSameDashboardFilters as i,
  parseDashboardFilters as p
};
//# sourceMappingURL=report-item-BV3SztWe.js.map
