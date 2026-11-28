import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { eW as ColumnCreatedAt, hx as createActionColumn, a as useTRPC, ak as useQueryClient, b as useMutation, as as Ut, o as DropdownMenuItem, bA as clipboard, j as useQuery, M as Badge, B as Button, G as Plus, H as pushModal, hy as Route } from "./router-gBnYxPzA.js";
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
  return [
    {
      accessorKey: "id"
    },
    {
      accessorKey: "email",
      header: "Mail",
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: row.original.email }),
      meta: {
        label: "Email",
        placeholder: "Search email",
        variant: "text"
      }
    },
    {
      accessorKey: "role",
      header: "Role",
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
      accessorKey: "projectAccess",
      header: "Access",
      cell: ({ row }) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(AccessCell, { row });
      },
      meta: {
        label: "Access"
      }
    },
    createActionColumn(({ row }) => {
      const trpc = useTRPC();
      const queryClient = useQueryClient();
      const revoke = useMutation(
        trpc.organization.revokeInvite.mutationOptions({
          onSuccess() {
            Ut.success(`Invite for ${row.original.email} revoked`);
            queryClient.invalidateQueries(
              trpc.organization.invitations.queryFilter({
                organizationId: row.original.organizationId
              })
            );
          },
          onError() {
            Ut.error(`Failed to revoke invite for ${row.original.email}`);
          }
        })
      );
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DropdownMenuItem,
          {
            onClick: () => {
              clipboard(
                `${window.location.origin}/onboarding?inviteId=${row.original.id}`
              );
            },
            children: "Copy invite link"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DropdownMenuItem,
          {
            className: "text-destructive",
            onClick: () => {
              revoke.mutate({ inviteId: row.original.id });
            },
            children: "Revoke invite"
          }
        )
      ] });
    })
  ];
}
function AccessCell({
  row
}) {
  const trpc = useTRPC();
  const projectsQuery = useQuery(
    trpc.project.list.queryOptions({
      organizationId: row.original.organizationId
    })
  );
  const projects = projectsQuery.data ?? [];
  const access = row.original.projectAccess ?? [];
  if (row.original.projectScope === "all") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "All projects" });
  }
  if (access.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "No projects" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: access.map((grant) => {
    const project = projects.find((p) => p.id === grant.projectId);
    if (!project) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "mr-1", children: "Unknown" }, grant.projectId);
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "mr-1", color: "blue", children: [
      project.name,
      grant.level === "read" ? " (read-only)" : ""
    ] }, grant.projectId);
  }) });
}
const InvitesTable = ({ query }) => {
  const columns = useColumns();
  const { data, isLoading, isError } = query;
  const { table } = useTable({
    name: "invites",
    columns,
    data: data ?? [],
    loading: isLoading,
    pageSize: 50
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DataTableToolbar, { table, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        icon: Plus,
        onClick: () => {
          pushModal("CreateInvite");
        },
        children: "Invite user"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { error: isError, loading: isLoading, table })
  ] });
};
function Component() {
  const {
    organizationId
  } = Route.useParams();
  const trpc = useTRPC();
  const query = useQuery(trpc.organization.invitations.queryOptions({
    organizationId
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(InvitesTable, { query });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId.members._tabs.invitations-s9t0kiBs.js.map
