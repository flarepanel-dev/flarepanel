import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { T as TOP_PAGES_SORT_COLUMNS } from "./event.constants-DKhXjlKd.js";
import { c8 as useOverviewOptions, a as useTRPC, j as useQuery, bE as Tooltiper, I as useAppContext, h2 as createHeaderColumn, a4 as useNumber, dZ as ExternalLink, i as fancyMinutes, bk as useQueryStates, cS as parseAsStringEnum, e$ as keepPreviousData, eY as useReactTable, H as pushModal, eZ as getCoreRowModel, h3 as Route } from "./router-gBnYxPzA.js";
import { L as LazyComponent } from "./lazy-component-BvTCtqML.js";
import { O as OverviewInterval } from "./overview-interval-cSBL6ZB5.js";
import { O as OverviewRange } from "./overview-range-DoapqOyi.js";
import { D as DataTable } from "./data-table-WJSjaNsN.js";
import { u as useSearchQueryState, d as useDataTablePagination, c as useDataTableColumnVisibility, D as DataTableToolbarContainer, A as AnimatedSearchInput, a as DataTableViewOptions } from "./data-table-toolbar-BJU_j2v8.js";
import { u as useRangePageContext } from "./use-page-context-helpers-DUMZv3Xw.js";
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
import "./ReportInterval-zZuTI3j-.js";
import "./differenceInDays-liXHUvyd.js";
import "./time-window-picker-BUBj3ZWF.js";
import "./index-DxXk7QJj.js";
import "./addDays-BIiJOlUZ.js";
import "./endOfMonth-C3pRd8ne.js";
import "./startOfMonth-Bf6CczcY.js";
import "./table-Bl3avL3P.js";
import "./pagination-Dj6_PitL.js";
import "./useIsFetching-BWA9Maly.js";
import "./sortable.esm-CAMhO-vx.js";
import "./settings-2-DrPzEv47.js";
import "./index-CHcXrYNT.js";
const defaultGap = 1;
const height = 24;
const width = 100;
function getTrendDirection(data) {
  const n = data.length;
  if (n < 3) {
    return "→";
  }
  const third = Math.max(1, Math.floor(n / 3));
  const firstAvg = data.slice(0, third).reduce((s, d) => s + d.pageviews, 0) / third;
  const lastAvg = data.slice(n - third).reduce((s, d) => s + d.pageviews, 0) / third;
  const threshold = firstAvg * 0.05;
  if (lastAvg - firstAvg > threshold) {
    return "↑";
  }
  if (firstAvg - lastAvg > threshold) {
    return "↓";
  }
  return "→";
}
function SparklineBars({ data }) {
  if (!data.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height, width } });
  }
  const max = Math.max(...data.map((d) => d.pageviews), 1);
  const total = data.length;
  let gap = defaultGap;
  let barW = Math.floor((width - gap * (total - 1)) / total);
  if (barW < 1 && total > 1) {
    gap = 0;
    barW = Math.floor((width - gap * (total - 1)) / total);
  }
  if (barW < 1) {
    barW = 1;
  }
  const trend = getTrendDirection(data);
  const trendColor = trend === "↑" ? "text-emerald-500" : trend === "↓" ? "text-red-500" : "text-muted-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "shrink-0", height, width, children: data.map((d, i) => {
      const barH = Math.max(
        2,
        Math.round(d.pageviews / max * (height * 0.8))
      );
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "rect",
        {
          className: "fill-chart-0",
          height: barH,
          rx: "1",
          width: barW,
          x: i * (barW + gap),
          y: height - barH
        },
        d.date
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Tooltiper,
      {
        content: trend === "↑" ? "Upward trend" : trend === "↓" ? "Downward trend" : "Stable trend",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `shrink-0 font-medium text-xs ${trendColor}`, children: trend })
      }
    )
  ] });
}
function PageSparkline({ projectId, origin, path }) {
  const { range, interval } = useOverviewOptions();
  const trpc = useTRPC();
  const query = useQuery(
    trpc.event.pageTimeseries.queryOptions({
      projectId,
      range,
      interval,
      origin,
      path
    })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LazyComponent, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height, width } }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SparklineBars, { data: query.data ?? [] }) });
}
const SECONDS_PER_MINUTE = 60;
function useColumns({
  projectId,
  isGscConnected,
  previousMap
}) {
  const number = useNumber();
  const { apiUrl } = useAppContext();
  return reactExports.useMemo(() => {
    const cols = [
      {
        id: "page",
        accessorFn: (row) => `${row.origin}${row.path} ${row.title ?? ""}`,
        header: createHeaderColumn("Page"),
        enableSorting: false,
        size: 400,
        meta: { bold: true },
        cell: ({ row }) => {
          const page = row.original;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
            page.origin ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                alt: "",
                className: "size-4 shrink-0 rounded-sm",
                loading: "lazy",
                onError: (e) => {
                  e.target.style.display = "none";
                },
                src: `${apiUrl}/misc/favicon?url=${encodeURIComponent(page.origin)}&v=2`
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              page.title && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium text-sm", children: page.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-muted-foreground text-xs tabular-nums", children: page.path }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    className: "shrink-0 opacity-0 transition-opacity group-hover/row:opacity-100",
                    href: page.origin + page.path,
                    onClick: (e) => e.stopPropagation(),
                    rel: "noreferrer noopener",
                    target: "_blank",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-3 text-muted-foreground" })
                  }
                )
              ] })
            ] })
          ] });
        }
      },
      {
        id: "trend",
        header: "Trend",
        enableSorting: false,
        size: 96,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          PageSparkline,
          {
            origin: row.original.origin,
            path: row.original.path,
            projectId
          }
        )
      },
      {
        accessorKey: "pageviews",
        header: createHeaderColumn("Views"),
        size: 80,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm tabular-nums tabular-nums", children: number.short(row.original.pageviews) })
      },
      {
        accessorKey: "sessions",
        header: createHeaderColumn("Sessions"),
        size: 90,
        cell: ({ row }) => {
          const prev = previousMap?.get(
            row.original.origin + row.original.path
          );
          const count = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm tabular-nums tabular-nums", children: number.short(row.original.sessions) });
          if (prev == null) {
            return count;
          }
          if (prev === 0) {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              count,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "new" })
            ] });
          }
          const pct = (row.original.sessions - prev) / prev * 100;
          const isPos = pct >= 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            count,
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: `text-2xs tabular-nums ${isPos ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`,
                children: [
                  isPos ? "+" : "",
                  pct.toFixed(1),
                  "%"
                ]
              }
            )
          ] });
        }
      },
      {
        accessorKey: "bounce_rate",
        header: createHeaderColumn("Bounce"),
        size: 80,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm tabular-nums tabular-nums", children: [
          row.original.bounce_rate.toFixed(0),
          "%"
        ] })
      },
      {
        accessorKey: "avg_duration",
        header: createHeaderColumn("Duration"),
        size: 90,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap text-sm tabular-nums tabular-nums", children: fancyMinutes(row.original.avg_duration * SECONDS_PER_MINUTE) })
      }
    ];
    if (isGscConnected) {
      cols.push(
        {
          id: "gsc_impressions",
          accessorFn: (row) => row.gsc?.impressions ?? 0,
          header: createHeaderColumn("Impr."),
          enableSorting: false,
          size: 80,
          cell: ({ row }) => row.original.gsc ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm tabular-nums tabular-nums", children: number.short(row.original.gsc.impressions) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" })
        },
        {
          id: "gsc_ctr",
          accessorFn: (row) => row.gsc?.ctr ?? 0,
          header: createHeaderColumn("CTR"),
          enableSorting: false,
          size: 70,
          cell: ({ row }) => row.original.gsc ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm tabular-nums tabular-nums", children: [
            (row.original.gsc.ctr * 100).toFixed(1),
            "%"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" })
        },
        {
          id: "gsc_clicks",
          accessorFn: (row) => row.gsc?.clicks ?? 0,
          header: createHeaderColumn("Clicks"),
          enableSorting: false,
          size: 80,
          cell: ({ row }) => row.original.gsc ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm tabular-nums tabular-nums", children: number.short(row.original.gsc.clicks) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" })
        }
      );
    }
    return cols;
  }, [isGscConnected, number, apiUrl, projectId, previousMap]);
}
const PAGE_SIZE = 50;
const SORT_ORDERS = ["asc", "desc"];
const DEFAULT_SORT = { sortBy: "sessions", sortOrder: "desc" };
const LOADING_DATA = Array.from({ length: 9 }, () => ({}));
function isSortColumn(id) {
  return TOP_PAGES_SORT_COLUMNS.includes(id);
}
function PagesTable({ projectId }) {
  const trpc = useTRPC();
  const { range, interval, startDate, endDate } = useOverviewOptions();
  const { debouncedSearch, setSearch, search } = useSearchQueryState();
  const {
    page,
    setPage,
    state: pagination
  } = useDataTablePagination(PAGE_SIZE);
  const [sort, setSort] = useQueryStates(
    {
      sortBy: parseAsStringEnum([...TOP_PAGES_SORT_COLUMNS]).withDefault(
        DEFAULT_SORT.sortBy
      ),
      sortOrder: parseAsStringEnum([...SORT_ORDERS]).withDefault(
        DEFAULT_SORT.sortOrder
      )
    },
    { clearOnDefault: true, history: "push" }
  );
  const sorting = [
    { id: sort.sortBy, desc: sort.sortOrder === "desc" }
  ];
  const pagesQuery = useQuery(
    trpc.event.pages.queryOptions(
      {
        projectId,
        search: debouncedSearch || void 0,
        range,
        interval,
        cursor: page - 1,
        take: PAGE_SIZE,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder
      },
      { placeholderData: keepPreviousData }
    )
  );
  const pages = pagesQuery.data?.data;
  const pageKeys = reactExports.useMemo(
    () => (pages ?? []).map(({ origin, path }) => ({ origin, path })),
    [pages]
  );
  const connectionQuery = useQuery(
    trpc.gsc.getConnection.queryOptions({ projectId })
  );
  const isGscConnected = !!connectionQuery.data?.siteUrl;
  const gscPagesQuery = useQuery(
    trpc.gsc.getPages.queryOptions(
      {
        projectId,
        range,
        startDate: startDate ?? void 0,
        endDate: endDate ?? void 0,
        limit: 1e4
      },
      { enabled: isGscConnected }
    )
  );
  const previousPagesQuery = useQuery(
    trpc.event.previousPages.queryOptions(
      { projectId, range, interval, pages: pageKeys },
      { placeholderData: keepPreviousData, enabled: pageKeys.length > 0 }
    )
  );
  const previousMap = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const p of previousPagesQuery.data ?? []) {
      map.set(p.origin + p.path, p.sessions);
    }
    return map;
  }, [previousPagesQuery.data]);
  const gscMap = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const row of gscPagesQuery.data ?? []) {
      map.set(row.page, {
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      });
    }
    return map;
  }, [gscPagesQuery.data]);
  const rawData = reactExports.useMemo(() => {
    return (pages ?? []).map((p) => ({
      ...p,
      gsc: gscMap.get(p.origin + p.path)
    }));
  }, [pages, gscMap]);
  const columns = useColumns({ projectId, isGscConnected, previousMap });
  const { columnVisibility, setColumnVisibility, columnOrder, setColumnOrder } = useDataTableColumnVisibility(columns, "pages");
  const table = useReactTable({
    data: pagesQuery.isLoading ? LOADING_DATA : rawData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: pagesQuery.data?.meta.count,
    pageCount: Math.ceil((pagesQuery.data?.meta.count ?? 0) / PAGE_SIZE),
    filterFns: {
      isWithinRange: () => true
    },
    state: { pagination, sorting, columnVisibility, columnOrder },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      setPage(next.pageIndex + 1);
    },
    onSortingChange: (updater) => {
      const [next] = typeof updater === "function" ? updater(sorting) : updater;
      setSort(
        next && isSortColumn(next.id) ? { sortBy: next.id, sortOrder: next.desc ? "desc" : "asc" } : null
      );
      setPage(1);
    },
    getRowId: (row, index) => row.origin === void 0 ? `loading-${index}` : row.origin + row.path
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DataTableToolbarContainer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        AnimatedSearchInput,
        {
          onChange: setSearch,
          placeholder: "Search pages",
          value: search ?? ""
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewRange, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewInterval, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataTableViewOptions, { table })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        empty: {
          title: "No pages",
          description: debouncedSearch ? `No pages found matching "${debouncedSearch}"` : "Integrate our web SDK to your site to get pages here."
        },
        error: pagesQuery.isError,
        loading: pagesQuery.isLoading,
        onRowClick: (row) => {
          if (!isGscConnected) {
            return;
          }
          const page2 = row.original;
          pushModal("PageDetails", {
            type: "page",
            projectId,
            value: page2.origin + page2.path
          });
        },
        table
      }
    )
  ] });
}
function Component() {
  const {
    projectId
  } = Route.useParams();
  useRangePageContext("pages");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { className: "mb-8", description: "Access all your pages here", title: "Pages" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PagesTable, { projectId })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.pages-CwNdwzqw.js.map
