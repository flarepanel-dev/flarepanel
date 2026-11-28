import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { eW as ColumnCreatedAt, hx as createActionColumn, M as Badge, ak as useQueryClient, a as useTRPC, b as useMutation, as as Ut, o as DropdownMenuItem, H as pushModal, e as useAppParams, j as useQuery } from "./router-gBnYxPzA.js";
import { D as DataTable } from "./data-table-WJSjaNsN.js";
import { b as DataTableToolbar } from "./data-table-toolbar-BJU_j2v8.js";
import { u as useTable } from "./use-table-D6HVqRzV.js";
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
function useColumns() {
  const columns = [
    {
      accessorKey: "user",
      header: "Name",
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) {
          return null;
        }
        return [user.firstName, user.lastName].filter(Boolean).join(" ");
      },
      meta: {
        label: "Name"
      }
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) {
          return null;
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: user.email });
      },
      meta: {
        label: "Email",
        placeholder: "Search email",
        variant: "text"
      }
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: role });
      },
      meta: {
        label: "Role"
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      size: ColumnCreatedAt.size,
      cell: ({ row }) => {
        const item = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ColumnCreatedAt, { children: item.createdAt });
      },
      meta: {
        label: "Created"
      }
    },
    {
      accessorKey: "projects",
      header: "Access",
      cell: ({ row }) => {
        if (row.original.projectScope === "all") {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "All projects" });
        }
        if (row.original.projects.length === 0) {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "No projects" });
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row flex-wrap gap-2", children: row.original.projects.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
          item.projectId,
          item.level === "read" || row.original.role === "viewer" ? " (read-only)" : ""
        ] }, item.projectId)) });
      },
      meta: {
        label: "Access"
      }
    },
    createActionColumn(({ row }) => {
      const queryClient = useQueryClient();
      const trpc = useTRPC();
      const revoke = useMutation(
        trpc.organization.removeMember.mutationOptions({
          onSuccess() {
            Ut.success(
              `${row.original.user?.firstName} has been removed from the organization`
            );
            queryClient.invalidateQueries(
              trpc.organization.members.pathFilter()
            );
          },
          onError() {
            Ut.error(
              `Failed to remove ${row.original.user?.firstName} from the organization`
            );
          }
        })
      );
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DropdownMenuItem,
          {
            onClick: () => {
              pushModal("EditMember", row.original);
            },
            children: "Edit access"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DropdownMenuItem,
          {
            className: "text-destructive",
            onClick: () => {
              revoke.mutate({
                organizationId: row.original.organizationId,
                userId: row.original.userId,
                id: row.original.id
              });
            },
            children: "Remove member"
          }
        )
      ] });
    })
  ];
  return columns;
}
const MembersTable = ({ query }) => {
  const columns = useColumns();
  const { data, isLoading, isError } = query;
  const { table } = useTable({
    name: "members",
    columns,
    data: data ?? [],
    loading: isLoading,
    pageSize: 50
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DataTableToolbar, { table }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { error: isError, loading: isLoading, table })
  ] });
};
function Component() {
  const {
    organizationId
  } = useAppParams();
  const trpc = useTRPC();
  const query = useQuery(trpc.organization.members.queryOptions({
    organizationId
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MembersTable, { query });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId.members._tabs.members-u4bfCihP.js.map
