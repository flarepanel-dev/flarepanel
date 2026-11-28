import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { d as cn, gr as flexRender, gs as getCommonPinningStyles, aA as FullPageErrorState, b4 as Skeleton, E as EmptyState } from "./router-gBnYxPzA.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Bl3avL3P.js";
import { P as Pagination } from "./pagination-Dj6_PitL.js";
function FloatingPagination(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row fixed right-0 bottom-8 left-0 justify-center lg:left-72", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card bg-background/50 p-8 py-4 shadow-lg backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pagination, { ...props }) }) });
}
function DataTable({
  table,
  loading,
  error,
  className,
  onRowClick,
  empty = {
    title: "Nothing here yet",
    description: "Rows show up here as soon as there is data to list."
  },
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn("flex w-full flex-col gap-2.5 overflow-auto", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-md border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: headerGroup.headers.map((header) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            TableHead,
            {
              colSpan: header.colSpan,
              style: {
                ...getCommonPinningStyles({
                  column: header.column
                })
              },
              children: header.isPlaceholder ? null : flexRender(
                header.column.columnDef.header,
                header.getContext()
              )
            },
            header.id
          )) }, headerGroup.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: error ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: table.getAllColumns().length, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            FullPageErrorState,
            {
              description: "We could not load this data. Try again in a moment.",
              title: "Something went wrong",
              variant: "inline"
            }
          ) }) }) : table.getRowModel().rows?.length ? table.getRowModel().rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            TableRow,
            {
              className: onRowClick ? "cursor-pointer" : void 0,
              "data-state": row.getIsSelected() && "selected",
              onClick: onRowClick ? () => onRowClick(row) : void 0,
              children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                TableCell,
                {
                  className: cn(
                    cell.column.columnDef.meta?.bold && "font-medium"
                  ),
                  style: {
                    ...getCommonPinningStyles({
                      column: cell.column
                    })
                  },
                  children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/5" }) : flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )
                },
                cell.id
              ))
            },
            row.id
          )) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: table.getAllColumns().length, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            EmptyState,
            {
              description: empty.description,
              title: empty.title,
              variant: "inline"
            }
          ) }) }) })
        ] }) }),
        table.getPageCount() > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FloatingPagination,
            {
              canNextPage: table.getCanNextPage(),
              canPreviousPage: table.getCanPreviousPage(),
              firstPage: table.firstPage,
              lastPage: table.lastPage,
              nextPage: table.nextPage,
              pageIndex: table.getState().pagination.pageIndex,
              previousPage: table.previousPage
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20" })
        ] })
      ]
    }
  );
}
export {
  DataTable as D
};
//# sourceMappingURL=data-table-WJSjaNsN.js.map
