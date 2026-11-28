import { a as reactExports, b as useRouter, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { p as parseDashboardFilters, i as isSameDashboardFilters, b as ReportItem, R as ReportItemSkeleton } from "./report-item-BV3SztWe.js";
import { a as useTRPC, ak as useQueryClient, b as useMutation, hN as TRPCClientError, ha as handleErrorToastOptions, hO as Route, c8 as useOverviewOptions, j as useQuery, as as Ut, dH as useTableFilters, H as pushModal, W as Search, aK as Input, L as LinkButton, G as Plus, D as DropdownMenu, m as DropdownMenuTrigger, B as Button, dJ as Ellipsis, n as DropdownMenuContent, z as DropdownMenuGroup, o as DropdownMenuItem, gh as Share, hb as showConfirm, c3 as RotateCcw, bz as Copy, dK as Trash, fm as Save, E as EmptyState, a0 as ChartLine } from "./router-gBnYxPzA.js";
import { u as useDashboardLayout, i as isSameTilePosition, T as TILE_MIN_SIZE, D as DashboardGrid } from "./dashboard-grid-BOxGeuKe.js";
import { T as TableFilterPills } from "./TableFilterPills-CweHt97V.js";
import { O as OverviewInterval } from "./overview-interval-cSBL6ZB5.js";
import { O as OverviewRange } from "./overview-range-DoapqOyi.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { c as useDashboardPageContext } from "./use-page-context-helpers-DUMZv3Xw.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "./layout-panel-top-B4lJ9Wyr.js";
import "./table-DNq4Q3EQ.js";
import "./pick-CfnSzKDx.js";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
import "./properties-B42zBES-.js";
import "./ReportInterval-zZuTI3j-.js";
import "./differenceInDays-liXHUvyd.js";
import "./time-window-picker-BUBj3ZWF.js";
import "./index-DxXk7QJj.js";
import "./addDays-BIiJOlUZ.js";
import "./endOfMonth-C3pRd8ne.js";
import "./startOfMonth-Bf6CczcY.js";
function useTileViews({
  dashboardId,
  projectId
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [unsavedViews, setUnsavedViews] = reactExports.useState(
    {}
  );
  const queuedViews = reactExports.useRef(/* @__PURE__ */ new Map());
  const canSave = reactExports.useRef(true);
  const { mutateAsync: saveDisplay } = useMutation(
    trpc.report.updateDisplay.mutationOptions()
  );
  const changeView = reactExports.useCallback(
    (reportId, view) => {
      const reportsQueryKey = trpc.report.list.queryKey({
        dashboardId,
        projectId
      });
      const forgetUnsaved = () => setUnsavedViews(({ [reportId]: _saved, ...rest }) => rest);
      async function saveView(next) {
        try {
          await saveDisplay({ reportId, display: { view: next } });
        } catch (error) {
          queuedViews.current.delete(reportId);
          if (!(error instanceof TRPCClientError)) {
            throw error;
          }
          if (error.data?.code === "FORBIDDEN") {
            canSave.current = false;
            return;
          }
          handleErrorToastOptions({})(error);
          forgetUnsaved();
          return;
        }
        queryClient.setQueryData(
          reportsQueryKey,
          (current) => current?.map(
            (report) => report.id === reportId ? { ...report, display: { view: next } } : report
          )
        );
        const queued = queuedViews.current.get(reportId);
        if (queued) {
          queuedViews.current.set(reportId, void 0);
          return saveView(queued);
        }
        queuedViews.current.delete(reportId);
        forgetUnsaved();
      }
      setUnsavedViews((current) => ({ ...current, [reportId]: view }));
      if (!canSave.current) {
        return;
      }
      if (queuedViews.current.has(reportId)) {
        queuedViews.current.set(reportId, view);
        return;
      }
      queuedViews.current.set(reportId, void 0);
      saveView(view);
    },
    [trpc, queryClient, saveDisplay, dashboardId, projectId]
  );
  return { unsavedViews, changeView };
}
const DASHBOARD_FILTERS_URL_KEY = "f";
const DASHBOARD_FILTER_CATEGORIES = ["event", "profile", "group", "cohort", "session"];
function Component() {
  const router = useRouter();
  const {
    organizationId,
    dashboardId,
    projectId
  } = Route.useParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const {
    range,
    startDate,
    endDate,
    interval
  } = useOverviewOptions();
  const dashboardQuery = useQuery(trpc.dashboard.byId.queryOptions({
    id: dashboardId,
    projectId
  }));
  const reportsQuery = useQuery(trpc.report.list.queryOptions({
    dashboardId,
    projectId
  }));
  const dashboardDeletion = useMutation(trpc.dashboard.delete.mutationOptions({
    onError: handleErrorToastOptions({}),
    onSuccess() {
      queryClient.invalidateQueries(trpc.dashboard.list.pathFilter());
      Ut("Dashboard deleted");
      router.navigate({
        to: "/$organizationId/$projectId/dashboards",
        params: {
          organizationId,
          projectId
        }
      });
    }
  }));
  const dashboardDuplication = useMutation(trpc.dashboard.duplicate.mutationOptions({
    onError: handleErrorToastOptions({}),
    onSuccess(copy) {
      queryClient.invalidateQueries(trpc.dashboard.list.pathFilter());
      Ut(`Created "${copy.name}"`);
      router.navigate({
        to: "/$organizationId/$projectId/dashboards/$dashboardId",
        params: {
          organizationId,
          projectId,
          dashboardId: copy.id
        }
      });
    }
  }));
  const reports = reactExports.useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);
  const dashboard = dashboardQuery.data;
  const [search, setSearch] = reactExports.useState("");
  const savedFilters = reactExports.useMemo(() => parseDashboardFilters(dashboard?.filters), [dashboard?.filters]);
  const [rawUrlFilters, setUrlFilters] = useTableFilters(DASHBOARD_FILTERS_URL_KEY, {
    history: "replace"
  });
  const urlFilters = reactExports.useMemo(() => parseDashboardFilters(rawUrlFilters), [rawUrlFilters]);
  const [seededDashboardId, setSeededDashboardId] = reactExports.useState(null);
  const isSeeded = seededDashboardId === dashboardId;
  const dashboardFilters = !isSeeded && urlFilters.length === 0 ? savedFilters : urlFilters;
  const filtersChanged = !isSameDashboardFilters(dashboardFilters, savedFilters);
  reactExports.useEffect(() => {
    if (isSeeded || !dashboard) {
      return;
    }
    const openingFilters = urlFilters.length > 0 ? urlFilters : savedFilters;
    if (!isSameDashboardFilters(rawUrlFilters, openingFilters)) {
      setUrlFilters(openingFilters);
    }
    setSeededDashboardId(dashboardId);
  }, [isSeeded, dashboard, rawUrlFilters, urlFilters, savedFilters, setUrlFilters, dashboardId]);
  const saveFilters = useMutation(trpc.dashboard.update.mutationOptions({
    onError: handleErrorToastOptions({}),
    onSuccess() {
      queryClient.invalidateQueries(trpc.dashboard.byId.queryFilter({
        id: dashboardId,
        projectId
      }));
      Ut("Dashboard filters saved");
    }
  }));
  const filteredReports = reactExports.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return reports;
    }
    return reports.filter((r) => r.name?.toLowerCase().includes(q));
  }, [reports, search]);
  const reportDeletion = useMutation(trpc.report.delete.mutationOptions({
    onError: handleErrorToastOptions({}),
    onSuccess() {
      queryClient.invalidateQueries(trpc.dashboard.list.pathFilter());
      reportsQuery.refetch();
      Ut("Report deleted");
    }
  }));
  const reportDuplicate = useMutation(trpc.report.duplicate.mutationOptions({
    onError: handleErrorToastOptions({}),
    onSuccess() {
      queryClient.invalidateQueries(trpc.dashboard.list.pathFilter());
      reportsQuery.refetch();
      Ut("Report duplicated");
    }
  }));
  const reportsQueryKey = trpc.report.list.queryKey({
    dashboardId,
    projectId
  });
  const {
    mutate: saveLayouts
  } = useMutation(trpc.report.updateLayouts.mutationOptions({
    onSuccess(savedLayouts) {
      queryClient.setQueryData(reportsQueryKey, (current) => current?.map((report) => ({
        ...report,
        layout: savedLayouts.find((saved) => saved.reportId === report.id) ?? report.layout
      })));
    },
    onError(error) {
      handleErrorToastOptions({})(error);
      queryClient.invalidateQueries({
        queryKey: reportsQueryKey
      });
    }
  }));
  const {
    unsavedViews,
    changeView
  } = useTileViews({
    dashboardId,
    projectId
  });
  const resetLayout = useMutation(trpc.report.resetLayout.mutationOptions({
    onError: handleErrorToastOptions({}),
    onSuccess() {
      Ut("Layout reset to default");
      reportsQuery.refetch();
    }
  }));
  const [layout, setLayout] = useDashboardLayout(filteredReports);
  useDashboardPageContext(dashboardId);
  const saveLayout = reactExports.useCallback((newLayout) => {
    const items = newLayout.filter((item) => {
      const saved = reports.find((report) => report.id === item.i)?.layout;
      return !(saved && isSameTilePosition(item, saved));
    }).map((item) => ({
      reportId: item.i,
      layout: {
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW ?? TILE_MIN_SIZE.minW,
        minH: item.minH ?? TILE_MIN_SIZE.minH
      }
    }));
    if (items.length === 0) {
      return;
    }
    saveLayouts({
      dashboardId,
      projectId,
      items
    });
  }, [reports, saveLayouts, dashboardId, projectId]);
  const deleteReport = reportDeletion.mutate;
  const duplicateReport = reportDuplicate.mutate;
  const moveReport = reactExports.useCallback((reportId) => pushModal("MoveReport", {
    reportId,
    dashboardId
  }), [dashboardId]);
  const tiles = reactExports.useMemo(() => filteredReports.map((report) => {
    const unsavedView = unsavedViews[report.id];
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItem, { dashboardFilters, endDate, interval, onDelete: (reportId) => deleteReport({
      reportId
    }), onDuplicate: (reportId) => duplicateReport({
      reportId
    }), onMove: moveReport, onViewChange: changeView, organizationId, projectId, range, report: unsavedView ? {
      ...report,
      display: {
        view: unsavedView
      }
    } : report, startDate }) }, report.id);
  }), [filteredReports, unsavedViews, dashboardFilters, endDate, interval, range, startDate, organizationId, projectId, deleteReport, duplicateReport, moveReport, changeView]);
  if (!dashboard) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      reports.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "w-[180px] pl-8 sm:w-[220px]", onChange: (e) => setSearch(e.target.value), placeholder: "Search reports...", type: "search", value: search })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewRange, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewInterval, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(LinkButton, { from: Route.fullPath, icon: Plus, search: {
        dashboardId
      }, to: "/$organizationId/$projectId/reports", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-sm:hidden", children: "Create report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Report" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, {}) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "end", className: "w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuGroup, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => pushModal("ShareDashboardModal", {
            dashboardId
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share, { className: "mr-2 size-4" }),
            "Share dashboard"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => showConfirm({
            title: "Reset layout",
            text: "Are you sure you want to reset the layout to default? This will clear all custom positioning and sizing.",
            onConfirm: () => resetLayout.mutate({
              dashboardId,
              projectId
            })
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-2 size-4" }),
            "Reset layout"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { disabled: dashboardDuplication.isPending, onClick: () => dashboardDuplication.mutate({
            id: dashboardId
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "mr-2 size-4" }),
            "Duplicate dashboard"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => showConfirm({
            title: "Delete dashboard",
            text: "Are you sure you want to delete this dashboard? All your reports will be deleted!",
            onConfirm: () => dashboardDeletion.mutate({
              id: dashboardId
            })
          }), variant: "destructive", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash, { className: "mr-2 size-4" }),
            "Delete dashboard"
          ] })
        ] }) })
      ] })
    ] }), className: "mb-4", description: "View and manage your reports", title: dashboard.name }),
    reports.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row mb-4 flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableFilterPills, { categories: DASHBOARD_FILTER_CATEGORIES, title: "Dashboard filters", urlKey: DASHBOARD_FILTERS_URL_KEY }),
      filtersChanged && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row ml-auto gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setUrlFilters(savedFilters), size: "sm", variant: "ghost", children: "Reset" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { icon: Save, loading: saveFilters.isPending, onClick: () => saveFilters.mutate({
          id: dashboardId,
          filters: dashboardFilters
        }), size: "sm", children: "Save filters" })
      ] })
    ] }),
    reports.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { description: "Reports you save to this dashboard show up here as tiles you can move and resize.", icon: ChartLine, title: "No reports on this dashboard yet", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinkButton, { from: Route.fullPath, icon: Plus, search: {
      dashboardId
    }, to: "/$organizationId/$projectId/reports", children: "Create report" }) }) : reportsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItemSkeleton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItemSkeleton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItemSkeleton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItemSkeleton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItemSkeleton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportItemSkeleton, {})
    ] }) : filteredReports.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { description: `Nothing on this dashboard matches “${search}”.`, icon: Search, title: "No matching reports", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setSearch(""), variant: "outline", children: "Clear search" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardGrid, { isEditable: !search, layout, onDragStop: saveLayout, onLayoutChange: setLayout, onResizeStop: saveLayout, children: tiles })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.dashboards_._dashboardId-Cgguserb.js.map
