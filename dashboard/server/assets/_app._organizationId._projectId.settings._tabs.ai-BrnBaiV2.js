import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { a as useTRPC, ak as useQueryClient, b as useMutation, dM as handleError, as as Ut, c2 as Label, fU as Switch, e as useAppParams, j as useQuery, d$ as FullPageLoadingState } from "./router-gBnYxPzA.js";
import { b as Widget, a as WidgetHead, W as WidgetBody } from "./widget-D7PGEeO1.js";
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
function EditProjectAi({ project }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.project.update.mutationOptions({
      onError: handleError,
      onSuccess: () => {
        Ut.success("AI settings updated");
        queryClient.invalidateQueries(
          trpc.project.getProjectWithClients.queryFilter({
            projectId: project.id
          })
        );
      }
    })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Content storage" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { className: "col gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center justify-between gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ai-store-content", children: "Store prompts and completions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "When off, FlarePanel keeps model, tokens, cost, latency and errors for every call but drops the messages, outputs and tool definitions before they are stored. Stored content expires after 30 days either way." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            checked: project.aiStoreContent,
            disabled: mutation.isPending,
            id: "ai-store-content",
            onCheckedChange: (checked) => mutation.mutate({ id: project.id, aiStoreContent: checked })
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Pricing" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm", children: [
        "Cost is computed at ingest from a built-in price catalog covering the major providers. Send ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono", children: "cost" }),
        " on an event to store the price your gateway reports instead. Calls to a model that is not in the catalog are stored with a cost of zero."
      ] }) })
    ] })
  ] });
}
function Component() {
  const {
    projectId
  } = useAppParams();
  const trpc = useTRPC();
  const query = useQuery(trpc.project.getProjectWithClients.queryOptions({
    projectId
  }));
  if (query.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FullPageLoadingState, {});
  }
  if (!query.data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Project not found" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EditProjectAi, { project: query.data });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.settings._tabs.ai-BrnBaiV2.js.map
