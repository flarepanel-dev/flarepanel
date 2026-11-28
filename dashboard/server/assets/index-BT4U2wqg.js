import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { eW as ColumnCreatedAt, P as ProjectLink, eT as Video, h as getProfileName, eX as ProfileAvatar, S as SerieIcon, a4 as useNumber, bK as round, $ as useNavigate, e as useAppParams, eY as useReactTable, bP as esExports, aA as FullPageErrorState, B as Button, d as cn, e4 as LoaderCircle, eZ as getCoreRowModel, e_ as useWindowVirtualizer, E as EmptyState, N as Users, b4 as Skeleton } from "./router-gBnYxPzA.js";
import { u as useLocalStorage } from "./index-CHcXrYNT.js";
import { T as TableFilterPills } from "./TableFilterPills-CweHt97V.js";
import { u as useSearchQueryState, D as DataTableToolbarContainer, A as AnimatedSearchInput, a as DataTableViewOptions } from "./data-table-toolbar-BJU_j2v8.js";
import { l as last } from "./last-C7omGuiv.js";
import { R as RotateCw } from "./rotate-cw-59NMbvpf.js";
function formatDuration(milliseconds) {
  const seconds = milliseconds / 1e3;
  if (seconds < 60) {
    return `${round(seconds, 1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${round(remainingSeconds, 0)}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${round(remainingMinutes, 0)}m`;
}
function useColumns() {
  const number = useNumber();
  const columns = [
    {
      accessorKey: "createdAt",
      header: "Started",
      size: ColumnCreatedAt.size,
      cell: ({ row }) => {
        const item = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ColumnCreatedAt, { children: item.createdAt });
      }
    },
    {
      accessorKey: "id",
      header: "Session ID",
      size: 120,
      cell: ({ row }) => {
        const session = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            ProjectLink,
            {
              className: "font-medium",
              params: { sessionId: session.id },
              title: session.id,
              to: "/sessions/$sessionId",
              children: [
                session.id.slice(0, 8),
                "..."
              ]
            }
          ),
          session.hasReplay && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ProjectLink,
            {
              "aria-label": "View replay",
              className: "text-muted-foreground hover:text-foreground",
              hash: "replay",
              params: { sessionId: session.id },
              title: "View replay",
              to: "/sessions/$sessionId",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "size-4" })
            }
          )
        ] });
      }
    },
    {
      accessorKey: "profileId",
      header: "Profile",
      size: 150,
      cell: ({ row }) => {
        const session = row.original;
        if (session.profile) {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            ProjectLink,
            {
              className: "row items-center gap-2 font-medium hover:underline",
              params: { profileId: session.profile.id },
              to: "/profiles/$profileId",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileAvatar, { size: "sm", ...session.profile }),
                getProfileName(session.profile)
              ]
            }
          );
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProjectLink,
          {
            className: "font-medium tabular-nums",
            params: { profileId: session.profileId },
            to: "/profiles/$profileId",
            children: session.profileId
          }
        );
      }
    },
    {
      accessorKey: "entryPath",
      header: "Entry Page",
      size: 200,
      cell: ({ row }) => {
        const session = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: session.entryPath || "/" }) });
      }
    },
    {
      accessorKey: "exitPath",
      header: "Exit Page",
      size: 200,
      cell: ({ row }) => {
        const session = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: session.exitPath || session.entryPath || "/" }) });
      }
    },
    {
      accessorKey: "duration",
      header: "Duration",
      size: 100,
      cell: ({ row }) => {
        const session = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: formatDuration(session.duration) });
      }
    },
    {
      accessorKey: "isBounce",
      header: "Bounce",
      size: 80,
      cell: ({ row }) => {
        const session = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: session.isBounce ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-orange-600", children: "Yes" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600", children: "No" }) });
      }
    },
    {
      accessorKey: "referrerName",
      header: "Referrer",
      size: 150,
      cell: ({ row }) => {
        const session = row.original;
        const ref = session.referrerName || session.referrer || "Direct";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: ref }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: ref })
        ] });
      }
    },
    {
      accessorKey: "country",
      header: "Location",
      size: 150,
      cell: ({ row }) => {
        const session = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: session.country }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: session.city || session.country })
        ] });
      }
    },
    {
      accessorKey: "os",
      header: "OS",
      size: 120,
      cell: ({ row }) => {
        const session = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: session.os }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: session.os })
        ] });
      }
    },
    {
      accessorKey: "browser",
      header: "Browser",
      size: 120,
      cell: ({ row }) => {
        const session = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: session.browser }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: session.browser })
        ] });
      }
    },
    {
      accessorKey: "device",
      header: "Device",
      size: 150,
      cell: ({ row }) => {
        const session = row.original;
        let deviceInfo = session.brand || session.model ? [session.brand, session.model].filter(Boolean).join(" / ") : session.device;
        if (deviceInfo === "K") {
          deviceInfo = session.device;
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: session.device }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: deviceInfo })
        ] });
      }
    },
    {
      accessorKey: "screenViewCount",
      header: "Page views",
      size: 100,
      cell: ({ row }) => {
        const session = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center font-medium", children: session.screenViewCount });
      }
    },
    {
      accessorKey: "eventCount",
      header: "Events",
      size: 90,
      cell: ({ row }) => {
        const session = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center font-medium", children: session.eventCount });
      }
    },
    {
      accessorKey: "revenue",
      header: "Revenue",
      size: 100,
      cell: ({ row }) => {
        const session = row.original;
        return session.revenue > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-green-600", children: number.currency(session.revenue / 100) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "-" });
      }
    },
    {
      accessorKey: "deviceId",
      header: "Device ID",
      size: 120
    },
    {
      accessorKey: "groups",
      header: "Groups",
      size: 200,
      cell: ({ row }) => {
        const { groups } = row.original;
        if (!groups?.length) {
          return null;
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: groups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums",
            children: g
          },
          g
        )) });
      }
    }
  ];
  return columns;
}
const usePersistentColumnVisibility = (columns) => {
  const [savedVisibility, setSavedVisibility] = useLocalStorage("@op:sessions-table-column-visibility", {});
  const columnVisibility = reactExports.useMemo(() => {
    return columns.reduce(
      (acc, column) => {
        const columnId = column.id || column.accessorKey;
        if (columnId) {
          acc[columnId] = savedVisibility[columnId] ?? true;
        }
        return acc;
      },
      {}
    );
  }, [columns, savedVisibility]);
  const handleColumnVisibilityChange = (updater) => {
    const newVisibility = typeof updater === "function" ? updater(columnVisibility) : updater;
    setSavedVisibility(newVisibility);
  };
  return {
    columnVisibility,
    setColumnVisibility: handleColumnVisibilityChange
  };
};
const LOADING_DATA = [{}, {}, {}, {}, {}, {}, {}, {}, {}];
const ROW_HEIGHT = 40;
const VirtualRow = reactExports.memo(
  function VirtualRow2({
    row,
    virtualRow,
    headerColumns,
    scrollMargin,
    isLoading,
    onRowClick
  }) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "group/row absolute top-0 left-0 w-full border-b transition-colors hover:bg-muted/50",
          onRowClick && "cursor-pointer"
        ),
        "data-index": virtualRow.index,
        onClick: onRowClick ? (e) => {
          if (e.target.closest("a, button")) {
            return;
          }
          onRowClick(row);
        } : void 0,
        ref: virtualRow.measureElement,
        style: {
          transform: `translateY(${virtualRow.start - scrollMargin}px)`,
          display: "grid",
          gridTemplateColumns: headerColumns.map((col) => `${col.getSize()}px`).join(" "),
          minWidth: "fit-content",
          minHeight: ROW_HEIGHT
        },
        children: row.getVisibleCells().map((cell) => {
          const width = `${cell.column.getSize()}px`;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "flex items-center whitespace-nowrap p-2 px-4 align-middle",
              style: {
                width,
                overflow: "hidden"
              },
              children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/5" }) : cell.column.columnDef.cell ? typeof cell.column.columnDef.cell === "function" ? cell.column.columnDef.cell(cell.getContext()) : cell.column.columnDef.cell : cell.getValue()
            },
            cell.id
          );
        })
      }
    );
  },
  (prevProps, nextProps) => {
    return prevProps.row.id === nextProps.row.id && prevProps.virtualRow.index === nextProps.virtualRow.index && prevProps.virtualRow.start === nextProps.virtualRow.start && prevProps.virtualRow.size === nextProps.virtualRow.size && prevProps.isLoading === nextProps.isLoading && prevProps.headerColumnsHash === nextProps.headerColumnsHash && prevProps.onRowClick === nextProps.onRowClick;
  }
);
const VirtualizedSessionsTable = ({
  table,
  data,
  isLoading,
  onRowClick
}) => {
  const parentRef = reactExports.useRef(null);
  const headerColumns = table.getAllLeafColumns().filter((col) => {
    return table.getState().columnVisibility[col.id] !== false;
  });
  const rowVirtualizer = useWindowVirtualizer({
    count: data.length,
    estimateSize: () => ROW_HEIGHT,
    // Estimated row height
    overscan: 10,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
    // Key cache entries by row id so when filters refetch and the data
    // array changes, the virtualizer doesn't reuse stale per-index
    // measurements (which produces overlapping rows).
    getItemKey: (index) => data[index]?.id ?? index
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const headerColumnsHash = headerColumns.map((col) => col.id).join(",");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "w-full overflow-x-auto rounded-md border bg-card",
      ref: parentRef,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "sticky top-0 z-10 border-b bg-card",
            style: {
              display: "grid",
              gridTemplateColumns: headerColumns.map((col) => `${col.getSize()}px`).join(" "),
              minWidth: "fit-content"
            },
            children: headerColumns.map((column) => {
              const header = column.columnDef.header;
              const width = `${column.getSize()}px`;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "flex h-10 items-center whitespace-nowrap px-4 text-left font-semibold text-3xs text-foreground uppercase",
                  style: {
                    width
                  },
                  children: typeof header === "function" ? header({}) : header
                },
                column.id
              );
            })
          }
        ),
        !isLoading && data.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          EmptyState,
          {
            className: "py-16",
            description: "Nothing matches this date range and filters. Sessions appear as soon as your site or app sends events.",
            icon: Users,
            title: "No sessions",
            variant: "inline"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "relative w-full",
            style: {
              height: `${rowVirtualizer.getTotalSize()}px`,
              minHeight: "fit-content",
              minWidth: "fit-content"
            },
            children: virtualRows.map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index];
              if (!row) {
                return null;
              }
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                VirtualRow,
                {
                  headerColumns,
                  headerColumnsHash,
                  isLoading,
                  onRowClick,
                  row,
                  scrollMargin: rowVirtualizer.options.scrollMargin,
                  virtualRow: {
                    ...virtualRow,
                    measureElement: rowVirtualizer.measureElement
                  }
                },
                row.id
              );
            })
          }
        )
      ]
    }
  );
};
const SessionsTable = ({ query }) => {
  const { isLoading } = query;
  const columns = useColumns();
  const navigate = useNavigate();
  const { organizationId, projectId } = useAppParams();
  const handleRowClick = reactExports.useCallback(
    (row) => {
      navigate({
        to: "/$organizationId/$projectId/sessions/$sessionId",
        params: { organizationId, projectId, sessionId: row.original.id }
      });
    },
    [navigate, organizationId, projectId]
  );
  const data = reactExports.useMemo(() => {
    if (isLoading) {
      return LOADING_DATA;
    }
    return query.data?.pages?.flatMap((p) => p.items) ?? [];
  }, [query.data, isLoading]);
  const { columnVisibility, setColumnVisibility } = usePersistentColumnVisibility(columns);
  const table = useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    columns,
    rowCount: 50,
    pageCount: 1,
    filterFns: {
      isWithinRange: () => true
    },
    state: {
      columnVisibility
    },
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: (row, index) => row.id ?? `loading-${index}`
  });
  const inViewportRef = reactExports.useRef(null);
  const { inViewport, enterCount } = esExports.useInViewport(inViewportRef, void 0, {
    disconnectOnLeave: true
  });
  const hasNextPage = last(query.data?.pages ?? [])?.meta.next;
  reactExports.useEffect(() => {
    if (hasNextPage && data.length > 0 && inViewport && enterCount > 0 && query.isFetchingNextPage === false) {
      query.fetchNextPage();
    }
  }, [inViewport, enterCount, hasNextPage]);
  const hasFailedWithoutData = query.isError && !query.data;
  if (hasFailedWithoutData) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SessionTableToolbar, { table }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FullPageErrorState,
        {
          description: "We could not load this data. Try again in a moment.",
          title: "Something went wrong",
          variant: "inline",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              icon: RotateCw,
              loading: query.isFetching,
              onClick: () => query.refetch(),
              variant: "outline",
              children: "Try again"
            }
          )
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SessionTableToolbar, { table }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      VirtualizedSessionsTable,
      {
        data,
        isLoading,
        onRowClick: handleRowClick,
        table
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "center-center h-10 w-full pt-4", ref: inViewportRef, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "center-center size-8 rounded-full border bg-background opacity-0 transition-opacity",
          query.isFetchingNextPage && "opacity-100"
        ),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" })
      }
    ) })
  ] });
};
function SessionTableToolbar({ table }) {
  const { search, setSearch } = useSearchQueryState();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DataTableToolbarContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        AnimatedSearchInput,
        {
          onChange: setSearch,
          placeholder: "Search sessions by path, referrer...",
          value: search
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableFilterPills,
        {
          categories: ["profile", "group", "cohort", "session"],
          title: "Session filters",
          urlKey: "f"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DataTableViewOptions, { table })
  ] });
}
export {
  SessionsTable as S
};
//# sourceMappingURL=index-BT4U2wqg.js.map
