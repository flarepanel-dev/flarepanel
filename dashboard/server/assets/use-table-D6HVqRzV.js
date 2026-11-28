import { c4 as useQueryState, c5 as parseAsInteger, gt as parseAsArrayOf, bl as parseAsString, bk as useQueryStates, eY as useReactTable, gu as getPaginationRowModel, gv as getFilteredRowModel, gw as getSortedRowModel, eZ as getCoreRowModel } from "./router-gBnYxPzA.js";
import { a as reactExports, R as React } from "./worker-entry-C5kSRogq.js";
import { c as useDataTableColumnVisibility } from "./data-table-toolbar-BJU_j2v8.js";
const nuqsOptions = {
  shallow: true,
  history: "push",
  clearOnDefault: true
};
function useTable({
  columns,
  pageSize,
  data,
  loading,
  name
}) {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions(nuqsOptions)
  );
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(pageSize ?? 10).withOptions(nuqsOptions)
  );
  const pagination = {
    pageIndex: page - 1,
    pageSize: perPage
  };
  const { columnVisibility, setColumnVisibility, columnOrder, setColumnOrder } = useDataTableColumnVisibility(columns, name);
  const [columnPinning, setColumnPinning] = reactExports.useState({
    left: [
      ...columns.filter((column) => column.meta?.pinned === "left").map((column) => column.id)
    ],
    right: columns.filter((column) => column.meta?.pinned === "right").map((column) => column.id)
  });
  const filterParsers = reactExports.useMemo(() => {
    return columns.reduce((acc, column) => {
      const columnId = (column.id ?? column.accessorKey)?.toString();
      if (!columnId) {
        return acc;
      }
      const variant = column.meta?.variant;
      switch (variant) {
        case "text":
        case "number":
          acc[columnId] = parseAsString.withDefault("");
          break;
        case "select":
          acc[columnId] = parseAsString.withDefault("");
          break;
        case "multiSelect":
          acc[columnId] = parseAsArrayOf(parseAsString).withDefault([]);
          break;
        case "date":
        case "dateRange":
        case "range":
          acc[columnId] = parseAsArrayOf(parseAsInteger).withDefault([]);
          break;
      }
      return acc;
    }, {});
  }, [columns]);
  const [qsFilters, setQsFilters] = useQueryStates(filterParsers, nuqsOptions);
  const initialColumnFilters = reactExports.useMemo(() => {
    return Object.entries(qsFilters).reduce(
      (filters, [key, value]) => {
        if (value === null || value === void 0) {
          return filters;
        }
        if (Array.isArray(value)) {
          if (value.length > 0) {
            filters.push({ id: key, value });
          }
        } else if (value !== "") {
          filters.push({ id: key, value });
        }
        return filters;
      },
      []
    );
  }, [qsFilters]);
  const [columnFilters, setColumnFilters] = reactExports.useState(initialColumnFilters);
  React.useEffect(() => {
    setColumnFilters(initialColumnFilters);
  }, [initialColumnFilters]);
  const isWithinRange = (row, columnId, value) => {
    const cellDate = row.getValue(columnId);
    if (!cellDate) {
      return false;
    }
    const [rawStart, rawEnd] = value;
    const startDate = new Date(rawStart ?? rawEnd);
    const endDate = new Date(rawEnd ?? rawStart);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return false;
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    const time = new Date(cellDate).getTime();
    return time >= startDate.getTime() && time <= endDate.getTime();
  };
  const table = useReactTable({
    meta: {
      name
    },
    columns,
    data: reactExports.useMemo(
      () => loading ? [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}] : data,
      [loading, data]
    ),
    debugTable: false,
    filterFns: {
      isWithinRange
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    onPaginationChange: (updaterOrValue) => {
      const nextPagination = typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue;
      const nextPage = nextPagination.pageIndex + 1;
      const nextPerPage = nextPagination.pageSize;
      if (nextPage !== page) {
        void setPage(nextPage);
      }
      if (nextPerPage !== perPage) {
        void setPerPage(nextPerPage);
      }
    },
    state: {
      pagination,
      columnPinning,
      columnFilters: loading ? [] : columnFilters,
      columnOrder,
      columnVisibility
    },
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onColumnFiltersChange: (updaterOrValue) => {
      setColumnFilters((prev) => {
        const next = typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue;
        const updates = {};
        const validKeys = new Set(Object.keys(filterParsers));
        for (const filter of next) {
          if (validKeys.has(filter.id)) {
            const value = filter.value;
            if (Array.isArray(value)) {
              const cleaned = value.filter(
                (v) => v !== void 0 && v !== null
              );
              updates[filter.id] = cleaned;
            } else {
              updates[filter.id] = value;
            }
          }
        }
        for (const prevFilter of prev) {
          if (!next.some((f) => f.id === prevFilter.id) && validKeys.has(prevFilter.id)) {
            updates[prevFilter.id] = null;
          }
        }
        void setPage(1);
        void setQsFilters(updates);
        return next;
      });
    }
  });
  return { table, loading };
}
export {
  useTable as u
};
//# sourceMappingURL=use-table-D6HVqRzV.js.map
