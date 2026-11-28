import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { eW as ColumnCreatedAt, hx as createActionColumn, es as CopyInput, a as useTRPC, ak as useQueryClient, b as useMutation, dM as handleError, as as Ut, o as DropdownMenuItem, bA as clipboard, H as pushModal, i9 as DropdownMenuSeparator, hb as showConfirm, B as Button, G as Plus, e as useAppParams, j as useQuery } from "./router-gBnYxPzA.js";
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
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: row.original.name });
      }
    },
    {
      accessorKey: "id",
      header: "Client ID",
      cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(CopyInput, { label: null, value: row.original.id })
    },
    {
      accessorKey: "createdAt",
      header: "Created at",
      size: ColumnCreatedAt.size,
      cell: ({ row }) => {
        const item = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ColumnCreatedAt, { children: item.createdAt });
      }
    },
    createActionColumn(({ row }) => {
      const client = row.original;
      const trpc = useTRPC();
      const queryClient = useQueryClient();
      const deletion = useMutation(
        trpc.client.remove.mutationOptions({
          onSuccess() {
            Ut("Success", {
              description: "Client revoked, incoming requests will be rejected."
            });
            queryClient.invalidateQueries(trpc.client.list.pathFilter());
          },
          onError: handleError
        })
      );
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => clipboard(client.id), children: "Copy client ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DropdownMenuItem,
          {
            onClick: () => {
              pushModal("EditClient", client);
            },
            children: "Edit"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DropdownMenuItem,
          {
            onClick: () => {
              showConfirm({
                title: "Revoke client",
                text: "Are you sure you want to revoke this client? This action cannot be undone.",
                onConfirm() {
                  deletion.mutate({
                    id: client.id
                  });
                }
              });
            },
            variant: "destructive",
            children: "Revoke"
          }
        )
      ] });
    })
  ];
  return columns;
}
const ClientsTable = ({ query }) => {
  const columns = useColumns();
  const { data, isLoading, isError } = query;
  const { table } = useTable({
    name: "clients",
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
        onClick: () => pushModal("AddClient"),
        responsive: true,
        children: "Create client"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { error: isError, loading: isLoading, table })
  ] });
};
function Component() {
  const {
    projectId
  } = useAppParams();
  const trpc = useTRPC();
  const query = useQuery(trpc.client.list.queryOptions({
    projectId
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ClientsTable, { query });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.settings._tabs.clients-DWiAAIiT.js.map
