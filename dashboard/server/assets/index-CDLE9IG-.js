import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { e as useAppParams, al as useWS, cB as Tooltip, cC as TooltipTrigger, d as cn, cE as TooltipContent, eW as ColumnCreatedAt, a4 as useNumber, gW as EventIcon, H as pushModal, P as ProjectLink, h as getProfileName, eX as ProfileAvatar, S as SerieIcon, eY as useReactTable, eZ as getCoreRowModel, bP as esExports, e4 as LoaderCircle, c4 as useQueryState, bm as parseAsIsoDateTime, B as Button, a_ as format, bU as Calendar, e_ as useWindowVirtualizer, E as EmptyState, eC as Zap, b4 as Skeleton } from "./router-gBnYxPzA.js";
import { A as AnimatedNumber } from "./animated-number-DKHgshrj.js";
import { u as useDebounceState } from "./use-debounce-state-BwHu4mHP.js";
import { u as useEventDrawer } from "./use-event-drawer-DCAhkqzM.js";
import { K as KeyValueGrid } from "./key-value-grid-BaTCXsBI.js";
import { a as OverviewFilterButton, O as OverviewFiltersButtons } from "./overview-filters-buttons-C30tAgyS.js";
import { c as useDataTableColumnVisibility, D as DataTableToolbarContainer, a as DataTableViewOptions } from "./data-table-toolbar-BJU_j2v8.js";
import { l as last } from "./last-C7omGuiv.js";
function EventListener({
  onRefresh
}) {
  const { projectId } = useAppParams();
  const counter = useDebounceState(0, 1e3);
  useWS(
    `/live/events/${projectId}`,
    ({ count }) => {
      counter.set((prev) => prev + count);
    },
    {
      debounce: {
        delay: 1e3,
        maxWait: 5e3
      }
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "flex h-8 items-center gap-2 rounded-md border border-border bg-card px-3 font-medium",
        onClick: () => {
          counter.set(0);
          onRefresh();
        },
        type: "button",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "h-3 w-3 animate-ping rounded-full bg-live opacity-100 transition-all"
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "absolute top-0 left-0 h-3 w-3 rounded-full bg-live transition-all"
                )
              }
            )
          ] }),
          counter.debounced === 0 ? "Listening" : /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedNumber, { suffix: " new events", value: counter.debounced })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", children: counter.debounced === 0 ? "Listening to new events" : "Click to refresh" })
  ] });
}
function useColumns() {
  const { openEvent } = useEventDrawer();
  const number = useNumber();
  const columns = [
    {
      accessorKey: "createdAt",
      header: "Created at",
      size: ColumnCreatedAt.size,
      cell: ({ row }) => {
        const session = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ColumnCreatedAt, { children: session.createdAt });
      }
    },
    {
      size: 300,
      accessorKey: "name",
      header: "Name",
      cell({ row }) {
        const { name, path, revenue } = row.original;
        const fullTitle = name === "screen_view" ? path : name === "revenue" && revenue ? `${name} (${number.currency(revenue / 100)})` : name.replace(/_/g, " ");
        const renderName = () => {
          if (name === "screen_view") {
            if (path.includes("/")) {
              return path;
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Screen: " }),
              path
            ] });
          }
          if (name === "revenue" && revenue) {
            return `${name} (${number.currency(revenue / 100)})`;
          }
          if (name.startsWith("ai_")) {
            const model = row.original.properties?.ai_model;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              name.replace(/_/g, " "),
              typeof model === "string" && model && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-muted-foreground", children: model })
            ] });
          }
          return name.replace(/_/g, " ");
        };
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "shrink-0 transition-transform hover:scale-105",
              onClick: () => {
                pushModal("EditEvent", {
                  id: row.original.id
                });
              },
              type: "button",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                EventIcon,
                {
                  meta: row.original.meta,
                  name: row.original.name,
                  size: "sm"
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex min-w-0 flex-1 gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "min-w-0 max-w-full truncate text-left font-medium hover:underline",
              onClick: () => {
                openEvent({
                  id: row.original.id,
                  createdAt: row.original.createdAt
                });
              },
              title: fullTitle,
              type: "button",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block truncate", children: renderName() })
            }
          ) })
        ] });
      }
    },
    {
      accessorKey: "profileId",
      header: "Profile",
      cell({ row }) {
        const { profile, profileId, deviceId } = row.original;
        if (profile) {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            ProjectLink,
            {
              className: "group row items-center gap-2 whitespace-nowrap font-medium hover:underline",
              params: { profileId: profile.id },
              to: "/profiles/$profileId",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileAvatar, { size: "sm", ...profile }),
                getProfileName(profile)
              ]
            }
          );
        }
        if (profileId && profileId !== deviceId) {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            ProjectLink,
            {
              className: "whitespace-nowrap font-medium hover:underline",
              params: { profileId },
              to: "/profiles/$profileId",
              children: "Unknown"
            }
          );
        }
        if (deviceId) {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            ProjectLink,
            {
              className: "whitespace-nowrap font-medium hover:underline",
              params: { profileId: deviceId },
              to: "/profiles/$profileId",
              children: "Anonymous"
            }
          );
        }
        return null;
      }
    },
    {
      accessorKey: "sessionId",
      header: "Session ID",
      size: 100,
      meta: {
        hidden: true
      },
      cell({ row }) {
        const { sessionId } = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProjectLink,
          {
            className: "whitespace-nowrap font-medium hover:underline",
            params: { sessionId },
            to: "/sessions/$sessionId",
            children: sessionId.slice(0, 6)
          }
        );
      }
    },
    {
      accessorKey: "deviceId",
      header: "Device ID",
      size: 320,
      meta: {
        hidden: true
      }
    },
    {
      accessorKey: "country",
      header: "Country",
      size: 150,
      cell({ row }) {
        const { country, city } = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: country }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: city })
        ] });
      }
    },
    {
      accessorKey: "os",
      header: "OS",
      size: 130,
      cell({ row }) {
        const { os } = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: os }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: os })
        ] });
      }
    },
    {
      accessorKey: "browser",
      header: "Browser",
      size: 110,
      cell({ row }) {
        const { browser } = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: browser }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: browser })
        ] });
      }
    },
    {
      accessorKey: "groups",
      header: "Groups",
      size: 200,
      meta: {
        hidden: true
      },
      cell({ row }) {
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
    },
    {
      accessorKey: "properties",
      header: "Properties",
      size: 400,
      meta: {
        hidden: true
      },
      cell({ row }) {
        const { properties } = row.original;
        const filteredProperties = Object.fromEntries(
          Object.entries(properties || {}).filter(
            ([key]) => !key.startsWith("__")
          )
        );
        const items = Object.entries(filteredProperties);
        const limit = 2;
        const data = items.slice(0, limit).map(([key, value]) => ({
          name: key,
          value
        }));
        if (items.length > limit) {
          data.push({
            name: "",
            value: `${items.length - limit} more item${items.length - limit === 1 ? "" : "s"}`
          });
        }
        if (data.length === 0) {
          return null;
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx(KeyValueGrid, { className: "w-full", data });
      }
    }
  ];
  return columns;
}
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
const VirtualizedEventsTable = ({
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
    overscan: 10,
    scrollMargin: parentRef.current?.offsetTop ?? 0
  });
  reactExports.useEffect(() => {
    rowVirtualizer.measure();
  }, [headerColumns.length]);
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
            description: "Nothing matches this date range and filters. Events appear within seconds of your site or app sending them.",
            icon: Zap,
            title: "No events",
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
const EventsTable = ({ query, showEventListener = false }) => {
  const { isLoading } = query;
  const columns = useColumns();
  const { openEvent } = useEventDrawer();
  const handleRowClick = reactExports.useCallback(
    (row) => {
      openEvent({ id: row.original.id, createdAt: row.original.createdAt });
    },
    [openEvent]
  );
  const data = reactExports.useMemo(() => {
    if (isLoading) {
      return LOADING_DATA;
    }
    return query.data?.pages?.flatMap((p) => p.data) ?? [];
  }, [query.data, isLoading]);
  const { columnVisibility, setColumnVisibility, columnOrder, setColumnOrder } = useDataTableColumnVisibility(columns, "events");
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
      columnVisibility,
      columnOrder
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EventsTableToolbar,
      {
        query,
        showEventListener,
        table
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      VirtualizedEventsTable,
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
function EventsTableToolbar({
  query,
  table,
  showEventListener
}) {
  const [startDate, setStartDate] = useQueryState(
    "startDate",
    parseAsIsoDateTime
  );
  const [endDate, setEndDate] = useQueryState("endDate", parseAsIsoDateTime);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DataTableToolbarContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-wrap items-center gap-2", children: [
      showEventListener && /* @__PURE__ */ jsxRuntimeExports.jsx(EventListener, { onRefresh: () => query.refetch() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          icon: Calendar,
          onClick: () => {
            pushModal("DateRangerPicker", {
              onChange: ({ startDate: startDate2, endDate: endDate2 }) => {
                setStartDate(startDate2);
                setEndDate(endDate2);
              },
              startDate: startDate || void 0,
              endDate: endDate || void 0
            });
          },
          size: "sm",
          variant: "outline",
          children: startDate && endDate ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}` : "Date range"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewFilterButton, { enableEventsFilter: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        OverviewFiltersButtons,
        {
          className: "justify-end p-0",
          filterModal: { enableEventsFilter: true }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DataTableViewOptions, { table })
  ] });
}
export {
  EventsTable as E
};
//# sourceMappingURL=index-CDLE9IG-.js.map
