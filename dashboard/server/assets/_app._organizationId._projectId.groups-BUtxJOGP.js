import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { e as useAppParams, eW as ColumnCreatedAt, A as Link, M as Badge, eY as useReactTable, eZ as getCoreRowModel, h6 as Route, a as useTRPC, c4 as useQueryState, bl as parseAsString, j as useQuery, e$ as keepPreviousData, B as Button, H as pushModal, G as Plus } from "./router-gBnYxPzA.js";
import { D as DataTable } from "./data-table-WJSjaNsN.js";
import { d as useDataTablePagination, c as useDataTableColumnVisibility, u as useSearchQueryState, D as DataTableToolbarContainer, A as AnimatedSearchInput, a as DataTableViewOptions } from "./data-table-toolbar-BJU_j2v8.js";
import { a as arePropsEqual } from "./are-props-equal-DlAMv8r6.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { T as ToolbarSelect } from "./toolbar-select-B2rkqrrv.js";
import { T as Tag } from "./tag-vAspD_4c.js";
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
import "./table-Bl3avL3P.js";
import "./pagination-Dj6_PitL.js";
import "./useIsFetching-BWA9Maly.js";
import "./sortable.esm-CAMhO-vx.js";
import "./settings-2-DrPzEv47.js";
import "./index-CHcXrYNT.js";
function useGroupColumns() {
  const { organizationId, projectId } = useAppParams();
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const group = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            className: "font-medium hover:underline",
            params: { organizationId, projectId, groupId: group.id },
            to: "/$organizationId/$projectId/groups/$groupId",
            children: group.name
          }
        );
      }
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs tabular-nums", children: row.original.id })
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: row.original.type })
    },
    {
      accessorKey: "memberCount",
      header: "Members",
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: row.original.memberCount })
    },
    {
      accessorKey: "lastActiveAt",
      header: "Last active",
      size: ColumnCreatedAt.size,
      cell: ({ row }) => row.original.lastActiveAt ? /* @__PURE__ */ jsxRuntimeExports.jsx(ColumnCreatedAt, { children: row.original.lastActiveAt }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" })
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      size: ColumnCreatedAt.size,
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(ColumnCreatedAt, { children: row.original.createdAt })
    }
  ];
}
const PAGE_SIZE$1 = 50;
const LOADING_DATA = [
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {}
];
const GroupsTable = reactExports.memo(
  ({ query, pageSize = PAGE_SIZE$1, toolbarLeft }) => {
    const { data, isLoading, isError } = query;
    const columns = useGroupColumns();
    const { setPage, state: pagination } = useDataTablePagination(pageSize);
    const {
      columnVisibility,
      setColumnVisibility,
      columnOrder,
      setColumnOrder
    } = useDataTableColumnVisibility(columns, "groups");
    const table = useReactTable({
      data: isLoading ? LOADING_DATA : data?.data ?? [],
      getCoreRowModel: getCoreRowModel(),
      manualPagination: true,
      manualFiltering: true,
      manualSorting: true,
      columns,
      rowCount: data?.meta.count,
      pageCount: Math.ceil(
        (data?.meta.count || 0) / (pagination.pageSize || 1)
      ),
      filterFns: {
        isWithinRange: () => true
      },
      state: {
        pagination,
        columnVisibility,
        columnOrder
      },
      onColumnVisibilityChange: setColumnVisibility,
      onColumnOrderChange: setColumnOrder,
      onPaginationChange: (updaterOrValue) => {
        const nextPagination = typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue;
        setPage(nextPagination.pageIndex + 1);
      },
      getRowId: (row, index) => row.id ?? `loading-${index}`
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GroupsTableToolbar, { table, toolbarLeft }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          empty: {
            title: "No groups found",
            description: "Groups represent companies, teams, or other entities that events belong to."
          },
          error: isError,
          loading: isLoading,
          table
        }
      )
    ] });
  },
  arePropsEqual([
    "query.isLoading",
    "query.isError",
    "query.data",
    "pageSize",
    "toolbarLeft"
  ])
);
function GroupsTableToolbar({
  table,
  toolbarLeft
}) {
  const { search, setSearch } = useSearchQueryState();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DataTableToolbarContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      toolbarLeft,
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        AnimatedSearchInput,
        {
          onChange: setSearch,
          placeholder: "Search groups...",
          value: search
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DataTableViewOptions, { table })
  ] });
}
const PAGE_SIZE = 50;
const ALL_TYPES = "all";
function Component() {
  const {
    projectId
  } = Route.useParams();
  const trpc = useTRPC();
  const {
    debouncedSearch
  } = useSearchQueryState();
  const [typeFilter, setTypeFilter] = useQueryState("type", parseAsString.withDefault(""));
  const {
    page
  } = useDataTablePagination(PAGE_SIZE);
  const typesQuery = useQuery(trpc.group.types.queryOptions({
    projectId
  }));
  const groupsQuery = useQuery(trpc.group.list.queryOptions({
    projectId,
    search: debouncedSearch || void 0,
    type: typeFilter || void 0,
    take: PAGE_SIZE,
    cursor: page - 1
  }, {
    placeholderData: keepPreviousData
  }));
  const types = typesQuery.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => pushModal("AddGroup"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 size-4" }),
      "Add group"
    ] }), className: "mb-8", description: "Groups represent companies, teams, or other entities that events belong to.", title: "Groups" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GroupsTable, { pageSize: PAGE_SIZE, query: groupsQuery, toolbarLeft: types.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarSelect, { icon: Tag, label: "Type", onChange: (value) => setTypeFilter(value === ALL_TYPES ? "" : value), options: [{
      value: ALL_TYPES,
      label: "All types"
    }, ...types.map((type) => ({
      value: type,
      label: type
    }))], value: typeFilter || ALL_TYPES }) : null })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.groups-BUtxJOGP.js.map
