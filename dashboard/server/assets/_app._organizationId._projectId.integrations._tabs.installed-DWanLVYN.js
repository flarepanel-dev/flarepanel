import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { e as useAppParams, a as useTRPC, j as useQuery, ak as useQueryClient, b as useMutation, ij as INTEGRATIONS, ih as IntegrationCardSkeleton, E as EmptyState, L as LinkButton, O as AnimatePresence, Q as motion, hY as IntegrationCard, hZ as IntegrationCardFooter, B as Button, hb as showConfirm, H as pushModal } from "./router-gBnYxPzA.js";
import { a as PingBadge } from "./ping-B_apCr-3.js";
import { P as Plug } from "./plug-DmRJjXv_.js";
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
function ActiveIntegrations() {
  const { organizationId, projectId } = useAppParams();
  const trpc = useTRPC();
  const query = useQuery(
    trpc.integration.list.queryOptions({
      projectId
    })
  );
  const client = useQueryClient();
  const deletion = useMutation(
    trpc.integration.delete.mutationOptions({
      onSuccess() {
        client.refetchQueries(
          trpc.integration.list.queryFilter({
            projectId
          })
        );
      }
    })
  );
  const data = reactExports.useMemo(() => {
    return (query.data || []).map((item) => {
      const integration = INTEGRATIONS.find(
        (integration2) => integration2.type === item.config.type
      );
      return {
        ...item,
        integration
      };
    }).filter((item) => item.integration);
  }, [query.data]);
  const isLoading = query.isLoading;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid auto-rows-auto grid-cols-1 gap-4 md:grid-cols-2", children: [
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationCardSkeleton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationCardSkeleton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationCardSkeleton, {})
    ] }),
    !isLoading && data.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        className: "md:col-span-2",
        description: "Connect Slack, Discord or a webhook to send notifications and data to the tools you already use.",
        icon: Plug,
        title: "No integrations yet",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          LinkButton,
          {
            params: { organizationId, projectId },
            to: "/$organizationId/$projectId/integrations/available",
            children: "Browse integrations"
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "popLayout", children: data.map((item) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { layout: "position", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationCard, { ...item.integration, name: item.name, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(IntegrationCardFooter, { className: "row items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PingBadge, { children: "Connected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              className: "text-destructive",
              onClick: () => {
                showConfirm({
                  title: `Delete ${item.name}?`,
                  text: "This action cannot be undone.",
                  onConfirm: () => {
                    deletion.mutate({
                      id: item.id
                    });
                  }
                });
              },
              variant: "ghost",
              children: "Delete"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => {
                pushModal("AddIntegration", {
                  id: item.id,
                  type: item.config.type
                });
              },
              variant: "ghost",
              children: "Edit"
            }
          )
        ] })
      ] }) }) }, item.id);
    }) })
  ] });
}
function Component() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ActiveIntegrations, {});
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.integrations._tabs.installed-DWanLVYN.js.map
