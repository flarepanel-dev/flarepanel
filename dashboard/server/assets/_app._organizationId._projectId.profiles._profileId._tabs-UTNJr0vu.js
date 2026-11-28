import { b as useRouter, o as jsxRuntimeExports, O as Outlet } from "./worker-entry-C5kSRogq.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { id as Route, a as useTRPC, S as SerieIcon, eX as ProfileAvatar, h as getProfileName } from "./router-gBnYxPzA.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-TM5g9vxR.js";
import { a as useEntityPageContext } from "./use-page-context-helpers-DUMZv3Xw.js";
import { u as usePageTabs } from "./use-page-tabs-CrMqsrps.js";
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
    profileId,
    projectId
  } = Route.useParams();
  const trpc = useTRPC();
  const profile = useSuspenseQuery(trpc.profile.byId.queryOptions({
    profileId,
    projectId
  }));
  useEntityPageContext("profile", {
    profileId
  });
  const {
    activeTab,
    tabs
  } = usePageTabs([{
    id: "/$organizationId/$projectId/profiles/$profileId",
    label: "Overview"
  }, {
    id: "events",
    label: "Events"
  }, {
    id: "sessions",
    label: "Sessions"
  }]);
  const handleTabChange = (tabId) => {
    router.navigate({
      from: Route.fullPath,
      to: tabId
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row min-w-0 items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileAvatar, { ...profile.data }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: profile.data ? getProfileName(profile.data, false) : "User not identified" })
    ] }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row mb-6 flex-wrap gap-4", children: [
      profile.data?.properties.country && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: profile.data.properties.country }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          profile.data.properties.country,
          profile.data.properties.city && ` / ${profile.data.properties.city}`
        ] })
      ] }),
      profile.data?.properties.device && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: profile.data.properties.device }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: profile.data.properties.device })
      ] }),
      profile.data?.properties.os && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: profile.data.properties.os }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: profile.data.properties.os })
      ] }),
      profile.data?.properties.model && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: profile.data.properties.model }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: profile.data.properties.model })
      ] }),
      profile.data?.properties.browser && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: profile.data.properties.browser }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: profile.data.properties.browser })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { className: "mt-2 mb-8", onValueChange: handleTabChange, value: activeTab, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { children: tabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: tab.id, children: tab.label }, tab.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.profiles._profileId._tabs-UTNJr0vu.js.map
