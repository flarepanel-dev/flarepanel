import { b as useRouter, o as jsxRuntimeExports, O as Outlet } from "./worker-entry-C5kSRogq.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { ip as Route, a as useTRPC, ak as useQueryClient, $ as useNavigate, b as useMutation, dM as handleError, as as Ut, Z as Target, B as Button, et as Download, hd as RefreshCw, H as pushModal, hb as showConfirm, hi as Trash2, he as cohortMembersToCSV, hf as downloadCSV } from "./router-gBnYxPzA.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-TM5g9vxR.js";
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
    cohortId
  } = Route.useParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const cohort = useSuspenseQuery(trpc.cohort.get.queryOptions({
    id: cohortId
  }));
  const deleteMutation = useMutation(trpc.cohort.delete.mutationOptions({
    onSuccess() {
      queryClient.invalidateQueries(trpc.cohort.list.pathFilter());
      navigate({
        to: "/$organizationId/$projectId/cohorts",
        params: {
          organizationId,
          projectId
        }
      });
    },
    onError: handleError
  }));
  const refreshMutation = useMutation(trpc.cohort.refresh.mutationOptions({
    onSuccess() {
      Ut("Success", {
        description: "Cohort refresh queued."
      });
      queryClient.invalidateQueries(trpc.cohort.get.pathFilter());
    },
    onError: handleError
  }));
  async function handleDownload() {
    if (!c) {
      return;
    }
    try {
      const result = await queryClient.fetchQuery(trpc.cohort.exportProfiles.queryOptions({
        cohortId
      }));
      const csv = cohortMembersToCSV(result.profileIds);
      downloadCSV(csv, `${c.name}-members.csv`);
    } catch {
      Ut.error("Failed to download cohort members");
    }
  }
  const {
    activeTab,
    tabs
  } = usePageTabs([{
    id: "/$organizationId/$projectId/cohorts/$cohortId",
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
  const c = cohort.data;
  if (!c) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PageContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "size-10 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Cohort not found" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { className: "col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleDownload, size: "sm", variant: "outline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 size-4" }),
        "Download"
      ] }),
      !c.isStatic && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: refreshMutation.isPending, onClick: () => refreshMutation.mutate({
        cohortId: c.id
      }), size: "sm", variant: "outline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 size-4" }),
        "Refresh"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => pushModal("EditCohort", {
        id: c.id,
        name: c.name,
        description: c.description,
        definition: c.definition,
        isStatic: c.isStatic
      }), size: "sm", variant: "outline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-2 size-4" }),
        "Edit"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => showConfirm({
        title: "Delete cohort",
        text: `Are you sure you want to delete "${c.name}"? This action cannot be undone.`,
        onConfirm: () => deleteMutation.mutate({
          id: c.id
        })
      }), size: "sm", variant: "outline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 size-4" }),
        "Delete"
      ] })
    ] }), description: c.description || void 0, title: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row min-w-0 items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "size-6 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: c.name }),
      c.isStatic && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-blue-100 px-2 py-0.5 text-blue-700 text-xs", children: "Static" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { className: "mt-2 mb-8", onValueChange: handleTabChange, value: activeTab, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { children: tabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: tab.id, children: tab.label }, tab.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.cohorts_._cohortId._tabs-Bm5twUl6.js.map
