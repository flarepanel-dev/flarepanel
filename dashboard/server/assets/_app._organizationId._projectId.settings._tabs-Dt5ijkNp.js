import { b as useRouter, o as jsxRuntimeExports, O as Outlet } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, eC as Zap, dY as KeyRound, T as Bot, et as Download, W as Search, a1 as Sparkles, a2 as useLocation, I as useAppContext, d as cn, hz as Route } from "./router-gBnYxPzA.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { S as Settings2 } from "./settings-2-DrPzEv47.js";
import { C as Code } from "./code-BqUmYONv.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-TM5g9vxR.js";
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
const __iconNode = [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
];
const LayoutGrid = createLucideIcon("layout-grid", __iconNode);
const PROJECT_SETTINGS_TABS = [
  {
    id: "details",
    label: "Details",
    icon: Settings2,
    accent: "var(--chart-0)"
  },
  {
    id: "events",
    label: "Events",
    icon: Zap,
    accent: "var(--chart-2)"
  },
  {
    id: "clients",
    label: "Clients / API keys",
    icon: KeyRound,
    accent: "var(--chart-1)"
  },
  {
    id: "tracking",
    label: "Tracking script",
    icon: Code,
    accent: "var(--chart-4)"
  },
  {
    id: "mcp",
    label: "MCP",
    icon: Bot,
    accent: "var(--chart-3)"
  },
  {
    id: "widgets",
    label: "Widgets",
    icon: LayoutGrid,
    accent: "var(--chart-11)"
  },
  {
    id: "imports",
    label: "Imports",
    icon: Download,
    accent: "var(--chart-7)"
  },
  {
    id: "gsc",
    label: "Google Search",
    icon: Search,
    accent: "var(--chart-10)"
  },
  {
    id: "ai",
    label: "AI",
    icon: Sparkles,
    accent: "var(--chart-9)"
  }
];
function ProjectDashboard() {
  const router = useRouter();
  const location = useLocation();
  const tab = location.pathname.split("/").pop();
  const {
    isSelfHosted
  } = useAppContext();
  const hosted = !isSelfHosted;
  const active = PROJECT_SETTINGS_TABS.find((item) => item.id === tab);
  const handleTabChange = (tabId) => {
    router.navigate({
      from: Route.fullPath,
      to: `/$organizationId/$projectId/settings/${tabId}`
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container p-8", "data-edition": hosted ? "hosted" : "self-hosted", style: active ? {
    "--tab-accent": active.accent
  } : void 0, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { description: "Manage your project settings here", title: "Project settings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { className: "mt-2 mb-8", onValueChange: handleTabChange, value: tab, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "hide-scrollbar max-w-full overflow-x-auto", children: PROJECT_SETTINGS_TABS.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { className: cn(hosted && "data-[state=active]:border-(--item-accent)"), style: {
      "--item-accent": item.accent
    }, value: item.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
      hosted && /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { "aria-hidden": true, className: "size-3.5 shrink-0 text-(--item-accent)" }),
      item.label
    ] }) }, item.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "settings-tab-body", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
  ] });
}
export {
  ProjectDashboard as component
};
//# sourceMappingURL=_app._organizationId._projectId.settings._tabs-Dt5ijkNp.js.map
