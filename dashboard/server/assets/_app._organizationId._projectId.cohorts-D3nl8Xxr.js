import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { hc as Route, a as useTRPC, j as useQuery, b as useMutation, dM as handleError, as as Ut, ak as useQueryClient, B as Button, H as pushModal, G as Plus, E as EmptyState, N as Users, P as ProjectLink, a_ as format, d as cn, et as Download, hd as RefreshCw, bz as Copy, dK as Trash, hb as showConfirm, he as cohortMembersToCSV, hf as downloadCSV } from "./router-gBnYxPzA.js";
import { C as Card, a as CardActions, b as CardActionsItem } from "./card-cYnxdFV_.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
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
  const {
    projectId
  } = Route.useParams();
  const trpc = useTRPC();
  const query = useQuery(trpc.cohort.list.queryOptions({
    projectId,
    includeCount: true
  }));
  const cohorts = query.data ?? [];
  const deletion = useMutation(trpc.cohort.delete.mutationOptions({
    onError: handleError,
    onSuccess() {
      query.refetch();
      Ut("Success", {
        description: "Cohort deleted."
      });
    }
  }));
  const duplication = useMutation(trpc.cohort.duplicate.mutationOptions({
    onError: handleError,
    onSuccess(cohort) {
      query.refetch();
      Ut("Success", {
        description: `Created "${cohort.name}".`
      });
    }
  }));
  const refresh = useMutation(trpc.cohort.refresh.mutationOptions({
    onError: handleError,
    onSuccess() {
      query.refetch();
      Ut("Success", {
        description: "Cohort refresh queued."
      });
    }
  }));
  const queryClient = useQueryClient();
  async function handleDownload(cohortId, cohortName) {
    try {
      const result = await queryClient.fetchQuery(trpc.cohort.exportProfiles.queryOptions({
        cohortId
      }));
      const csv = cohortMembersToCSV(result.profileIds);
      downloadCSV(csv, `${cohortName}-members.csv`);
    } catch {
      Ut.error("Failed to download cohort members");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { icon: Plus, onClick: () => pushModal("AddCohort"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-sm:hidden", children: "Create cohort" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Cohort" })
    ] }), className: "mb-8", description: "Create and manage user segments based on events and properties", title: "Cohorts" }),
    cohorts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { description: "Group people by what they did or who they are, then filter any report or funnel by that group.", icon: Users, title: "No cohorts yet", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { icon: Plus, onClick: () => pushModal("AddCohort"), children: "Create cohort" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3", children: cohorts.map((cohort) => {
      const count = "currentCount" in cohort ? cohort.currentCount : cohort.profileCount;
      const displayCount = count ?? 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { hover: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectLink, { className: "flex flex-col p-4 outline-none", params: {
          cohortId: cohort.id
        }, to: "/cohorts/$cohortId", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: cohort.name }),
          cohort.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-2 text-muted-foreground text-sm", children: cohort.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-4 text-muted-foreground text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                displayCount.toLocaleString(),
                " ",
                displayCount === 1 ? "member" : "members"
              ] })
            ] }),
            cohort.lastComputedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("text-xs"), children: [
              "Updated",
              " ",
              format(cohort.lastComputedAt, "MMM d, HH:mm")
            ] })
          ] }),
          cohort.isStatic && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 inline-flex w-fit rounded bg-blue-100 px-2 py-0.5 text-blue-700 text-xs", children: "Static" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardActions, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardActionsItem, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleDownload(cohort.id, cohort.name), type: "button", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 16 }),
            "Download"
          ] }) }),
          !cohort.isStatic && /* @__PURE__ */ jsxRuntimeExports.jsx(CardActionsItem, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            refresh.mutate({
              cohortId: cohort.id
            });
          }, type: "button", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 16 }),
            "Refresh"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardActionsItem, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            pushModal("EditCohort", {
              id: cohort.id,
              name: cohort.name,
              description: cohort.description,
              definition: cohort.definition,
              isStatic: cohort.isStatic
            });
          }, type: "button", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 16 }),
            "Edit"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardActionsItem, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: duplication.isPending, onClick: () => duplication.mutate({
            id: cohort.id
          }), type: "button", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 16 }),
            "Duplicate"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardActionsItem, { asChild: true, className: "w-full text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            showConfirm({
              title: "Delete cohort",
              text: "Are you sure you want to delete this cohort? This action cannot be undone.",
              onConfirm: () => deletion.mutate({
                id: cohort.id
              })
            });
          }, type: "button", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash, { size: 16 }),
            "Delete"
          ] }) })
        ] })
      ] }, cohort.id);
    }) })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.cohorts-D3nl8Xxr.js.map
