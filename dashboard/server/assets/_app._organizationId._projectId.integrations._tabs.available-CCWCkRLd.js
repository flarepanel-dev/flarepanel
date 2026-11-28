import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { ij as INTEGRATIONS, hY as IntegrationCard, hZ as IntegrationCardFooter, B as Button, H as pushModal } from "./router-gBnYxPzA.js";
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
function AllIntegrations() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: INTEGRATIONS.map((integration) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    IntegrationCard,
    {
      description: integration.description,
      icon: integration.icon,
      name: integration.name,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationCardFooter, { className: "row justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => {
            pushModal("AddIntegration", {
              type: integration.type
            });
          },
          variant: "outline",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plug, { className: "mr-2 size-4" }),
            "Connect"
          ]
        }
      ) })
    },
    integration.name
  )) });
}
function Component() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AllIntegrations, {});
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.integrations._tabs.available-CCWCkRLd.js.map
