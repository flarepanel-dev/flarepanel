import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, e as useAppParams, a as useTRPC, ak as useQueryClient, j as useQuery, b as useMutation, as as Ut, hX as IMPORT_PROVIDERS, hY as IntegrationCard, hZ as IntegrationCardFooter, B as Button, et as Download, h_ as IntegrationCardLogoImage, E as EmptyState, b4 as Skeleton, M as Badge, bE as Tooltiper, hk as Info, H as pushModal, bT as CircleX, h$ as CircleCheckBig, e4 as LoaderCircle } from "./router-gBnYxPzA.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Bl3avL3P.js";
import { f as formatDistanceToNow } from "./formatDistanceToNow-C3KGcHU7.js";
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
import "./differenceInMonths-nSGUi53F.js";
import "./endOfMonth-C3pRd8ne.js";
const __iconNode = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m8 11 4 4 4-4", key: "1dohi6" }],
  [
    "path",
    {
      d: "M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4",
      key: "1ywtjm"
    }
  ]
];
const Import = createLucideIcon("import", __iconNode);
function ImportsSettings() {
  const {
    projectId
  } = useAppParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const importsQuery = useQuery(trpc.import.list.queryOptions({
    projectId
  }, {
    refetchInterval: 5e3
  }));
  const imports = importsQuery.data ?? [];
  const deleteImport = useMutation(trpc.import.delete.mutationOptions({
    onSuccess: () => {
      Ut.success("Import deleted", {
        description: "The import has been successfully deleted."
      });
      queryClient.invalidateQueries(trpc.import.list.pathFilter());
    }
  }));
  const retryImport = useMutation(trpc.import.retry.mutationOptions({
    onSuccess: () => {
      Ut.success("Import retried", {
        description: "The import has been queued for processing again."
      });
      queryClient.invalidateQueries(trpc.import.list.pathFilter());
    }
  }));
  const handleProviderSelect = (provider) => {
    pushModal("AddImport", {
      provider: provider.id,
      name: provider.name,
      types: provider.types
    });
  };
  const getStatusBadge = (status, errorMessage) => {
    const variants = {
      pending: "secondary",
      processing: "default",
      completed: "success",
      failed: "destructive"
    };
    const icons = {
      pending: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      processing: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      completed: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4" }),
      failed: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" })
    };
    if (status === "failed") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltiper, { content: errorMessage, tooltipClassName: "max-w-xs break-words", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "capitalize", variant: variants[status] || "default", children: [
        icons[status] || null,
        status
      ] }) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "capitalize", variant: variants[status] || "default", children: [
      icons[status] || null,
      status
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", children: IMPORT_PROVIDERS.map((provider) => /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationCard, { description: provider.description, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationCardLogoImage, { backgroundColor: provider.backgroundColor, className: "p-4", src: provider.logo }), name: provider.name, children: /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationCardFooter, { className: "row justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => handleProviderSelect(provider), variant: "ghost", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
      "Import Data"
    ] }) }) }, provider.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 font-medium text-lg", children: "Import History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Provider" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Created" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Progress" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Config" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          !importsQuery.isLoading && imports.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { description: "Imports from other analytics tools show up here with their progress.", icon: Import, title: "No imports yet", variant: "inline" }) }) }),
          importsQuery.isLoading && [1, 2, 3, 4].map((index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "row justify-end text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/5" }) })
          ] }, index)),
          imports.map((imp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium capitalize", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: imp.config.provider }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "uppercase", variant: "outline", children: imp.config.type })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDistanceToNow(new Date(imp.createdAt), {
              addSuffix: true
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              getStatusBadge(imp.status, imp.errorMessage),
              imp.statusMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-muted-foreground text-xs", children: imp.statusMessage })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: imp.totalEvents > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 tabular-nums", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
                imp.processedEvents.toLocaleString(),
                " / ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltiper, { content: "Estimated number of events. Can be inaccurate depending on the provider.", tooltipClassName: "max-w-xs", children: [
                  imp.totalEvents.toLocaleString(),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "relative -top-px inline-block h-4 w-4" })
                ] })
              ] }),
              imp.status === "processing" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full rounded-full bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-primary transition-all", style: {
                width: `${Math.min(Math.round(imp.processedEvents / imp.totalEvents * 100), 100)}%`
              } }) })
            ] }) : imp.totalEvents === -1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm tabular-nums", children: [
              imp.processedEvents.toLocaleString(),
              " / ",
              "N/A"
            ] }) : "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltiper, { content: /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "whitespace-pre-wrap break-words text-xs tabular-nums", children: JSON.stringify(imp.config, null, 2) }), tooltipClassName: "max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: "Config" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "space-x-2 text-right", children: [
              imp.status === "failed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => retryImport.mutate({
                id: imp.id
              }), size: "sm", variant: "outline", children: "Retry" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => deleteImport.mutate({
                id: imp.id
              }), size: "sm", variant: "ghost", children: "Delete" })
            ] })
          ] }, imp.id))
        ] })
      ] }) })
    ] })
  ] });
}
export {
  ImportsSettings as component
};
//# sourceMappingURL=_app._organizationId._projectId.settings._tabs.imports-pR0QGMv0.js.map
