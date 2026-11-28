import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { eW as ColumnCreatedAt, P as ProjectLink, h as getProfileName, eX as ProfileAvatar, S as SerieIcon, $ as useNavigate, e as useAppParams, eY as useReactTable, eZ as getCoreRowModel } from "./router-gBnYxPzA.js";
import { T as TableFilterPills } from "./TableFilterPills-CweHt97V.js";
import { D as DataTable } from "./data-table-WJSjaNsN.js";
import { d as useDataTablePagination, c as useDataTableColumnVisibility, u as useSearchQueryState, D as DataTableToolbarContainer, A as AnimatedSearchInput, a as DataTableViewOptions } from "./data-table-toolbar-BJU_j2v8.js";
import { a as arePropsEqual } from "./are-props-equal-DlAMv8r6.js";
function useColumns(type) {
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const profile = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          ProjectLink,
          {
            className: "flex items-center gap-2 font-medium",
            params: { profileId: profile.id },
            title: getProfileName(profile, false),
            to: "/profiles/$profileId",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileAvatar, { size: "sm", ...profile }),
              getProfileName(profile)
            ]
          }
        );
      }
    },
    {
      accessorKey: "referrer",
      header: "Referrer",
      cell({ row }) {
        const { referrer, referrer_name } = row.original.properties;
        const ref = referrer_name || referrer;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: ref }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: ref })
        ] });
      }
    },
    {
      accessorKey: "country",
      header: "Country",
      cell({ row }) {
        const { country, city } = row.original.properties;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: country }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: city })
        ] });
      }
    },
    {
      accessorKey: "os",
      header: "OS",
      cell({ row }) {
        const { os } = row.original.properties;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: os }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: os })
        ] });
      }
    },
    {
      accessorKey: "browser",
      header: "Browser",
      cell({ row }) {
        const { browser } = row.original.properties;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: browser }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: browser })
        ] });
      }
    },
    {
      accessorKey: "model",
      header: "Model",
      cell({ row }) {
        const { model, brand } = row.original.properties;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: brand }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
            brand,
            " / ",
            model
          ] })
        ] });
      }
    },
    {
      accessorKey: "createdAt",
      header: "First seen",
      size: ColumnCreatedAt.size,
      cell: ({ row }) => {
        const item = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ColumnCreatedAt, { children: item.createdAt });
      }
    },
    {
      accessorKey: "lastSeenAt",
      header: "Last seen",
      size: ColumnCreatedAt.size,
      cell: ({ row }) => {
        const item = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ColumnCreatedAt, { children: item.lastSeenAt });
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
          ProjectLink,
          {
            className: "rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums hover:underline",
            params: { groupId: g },
            to: "/groups/$groupId",
            children: g
          },
          g
        )) });
      }
    }
  ];
  if (type === "power-users") {
    columns.unshift({
      accessorKey: "count",
      header: "Events",
      cell: ({ row }) => {
        const profile = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: profile.count });
      }
    });
  }
  return columns;
}
const PAGE_SIZE = 50;
const LOADING_DATA = [{}, {}, {}, {}, {}, {}, {}, {}, {}];
const ProfilesTable = reactExports.memo(
  ({ type, query, pageSize = PAGE_SIZE }) => {
    const { data, isLoading, isError } = query;
    const columns = useColumns(type);
    const navigate = useNavigate();
    const { organizationId, projectId } = useAppParams();
    const handleRowClick = reactExports.useCallback(
      (row) => {
        navigate({
          to: "/$organizationId/$projectId/profiles/$profileId",
          params: {
            organizationId,
            projectId,
            profileId: row.original.id
          }
        });
      },
      [navigate, organizationId, projectId]
    );
    const { setPage, state: pagination } = useDataTablePagination(pageSize);
    const {
      columnVisibility,
      setColumnVisibility,
      columnOrder,
      setColumnOrder
    } = useDataTableColumnVisibility(columns, "profiles");
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileTableToolbar, { table }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          empty: {
            title: "No profiles",
            description: "Looks like you haven't identified any profiles yet."
          },
          error: isError,
          loading: isLoading,
          onRowClick: handleRowClick,
          table
        }
      )
    ] });
  },
  arePropsEqual([
    "query.isLoading",
    "query.isError",
    "query.data",
    "type",
    "pageSize"
  ])
);
function ProfileTableToolbar({ table }) {
  const { search, setSearch } = useSearchQueryState();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DataTableToolbarContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        AnimatedSearchInput,
        {
          onChange: setSearch,
          placeholder: "Search profiles",
          value: search
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableFilterPills,
        {
          categories: ["profile", "group", "cohort"],
          title: "Profile filters",
          urlKey: "f"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DataTableViewOptions, { table })
  ] });
}
export {
  ProfilesTable as P
};
//# sourceMappingURL=index-CFIJrx3s.js.map
