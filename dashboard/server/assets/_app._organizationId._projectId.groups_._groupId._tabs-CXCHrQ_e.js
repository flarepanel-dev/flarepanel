import { b as useRouter, o as jsxRuntimeExports, O as Outlet } from "./worker-entry-C5kSRogq.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { ik as Route, a as useTRPC, ak as useQueryClient, $ as useNavigate, b as useMutation, dM as handleError, w as Building2, B as Button, H as pushModal, hb as showConfirm, hi as Trash2 } from "./router-gBnYxPzA.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-TM5g9vxR.js";
import { a as useEntityPageContext } from "./use-page-context-helpers-DUMZv3Xw.js";
import { u as usePageTabs } from "./use-page-tabs-CrMqsrps.js";
import { P as Pencil } from "./pencil-C1NQD0wZ.js";
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
    projectId,
    organizationId,
    groupId
  } = Route.useParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const group = useSuspenseQuery(trpc.group.byId.queryOptions({
    id: groupId,
    projectId
  }));
  useEntityPageContext("group", {
    groupId
  });
  const deleteMutation = useMutation(trpc.group.delete.mutationOptions({
    onSuccess() {
      queryClient.invalidateQueries(trpc.group.list.pathFilter());
      navigate({
        to: "/$organizationId/$projectId/groups",
        params: {
          organizationId,
          projectId
        }
      });
    },
    onError: handleError
  }));
  const {
    activeTab,
    tabs
  } = usePageTabs([{
    id: "/$organizationId/$projectId/groups/$groupId",
    label: "Overview"
  }, {
    id: "members",
    label: "Members"
  }, {
    id: "events",
    label: "Events"
  }]);
  const handleTabChange = (tabId) => {
    router.navigate({
      from: Route.fullPath,
      to: tabId
    });
  };
  const g = group.data;
  if (!g) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PageContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "size-10 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Group not found" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { className: "col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => pushModal("EditGroup", {
        id: g.id,
        projectId: g.projectId,
        name: g.name,
        type: g.type,
        properties: g.properties
      }), size: "sm", variant: "outline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-2 size-4" }),
        "Edit"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => showConfirm({
        title: "Delete group",
        text: `Are you sure you want to delete "${g.name}"? This action cannot be undone.`,
        onConfirm: () => deleteMutation.mutate({
          id: g.id,
          projectId
        })
      }), size: "sm", variant: "outline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 size-4" }),
        "Delete"
      ] })
    ] }), title: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row min-w-0 items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "size-6 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: g.name })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { className: "mt-2 mb-8", onValueChange: handleTabChange, value: activeTab, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { children: tabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: tab.id, children: tab.label }, tab.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.groups_._groupId._tabs-CXCHrQ_e.js.map
