import { b as useRouter, o as jsxRuntimeExports, O as Outlet } from "./worker-entry-C5kSRogq.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-TM5g9vxR.js";
import { u as usePageTabs } from "./use-page-tabs-CrMqsrps.js";
import { hL as Route } from "./router-gBnYxPzA.js";
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
function Component() {
  const router = useRouter();
  const {
    activeTab,
    tabs
  } = usePageTabs([{
    id: "installed",
    label: "Installed"
  }, {
    id: "available",
    label: "Available"
  }]);
  const handleTabChange = (tabId) => {
    router.navigate({
      from: Route.fullPath,
      to: tabId
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { description: "Manage your integrations here", title: "Integrations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { className: "mt-2 mb-8", onValueChange: handleTabChange, value: activeTab, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { children: tabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: tab.id, children: tab.label }, tab.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.integrations._tabs-CLNKeGfs.js.map
