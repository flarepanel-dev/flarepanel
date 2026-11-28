import { b as useRouter, o as jsxRuntimeExports, O as Outlet } from "./worker-entry-C5kSRogq.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-TM5g9vxR.js";
import { u as usePageTabs } from "./use-page-tabs-CrMqsrps.js";
import { eS as Route } from "./router-gBnYxPzA.js";
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
    organizationId
  } = Route.useParams();
  const {
    activeTab,
    tabs
  } = usePageTabs([{
    id: "account",
    label: "Profile"
  }, {
    id: "email-preferences",
    label: "Email preferences"
  }, {
    id: "two-factor",
    label: "Two-factor auth"
  }]);
  const handleTabChange = (tabId) => {
    if (tabId === "account") {
      router.navigate({
        to: "/$organizationId/account",
        params: {
          organizationId
        }
      });
      return;
    }
    router.navigate({
      from: Route.fullPath,
      to: tabId
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Your account" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { className: "mt-2 mb-8", onValueChange: handleTabChange, value: activeTab, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { children: tabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: tab.id, children: tab.label }, tab.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId.account._tabs-BVtBr62S.js.map
