import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { a as useTRPC, j as useQuery, br as formatTokens, hH as formatLatencyOrNone, eu as timeAgo, T as Bot, b4 as Skeleton, M as Badge, P as ProjectLink } from "./router-gBnYxPzA.js";
import { A as AiCost } from "./ai-cost-C8tzxtic.js";
import { W as WidgetHead, d as WidgetTitle } from "./overview-widget-q0VDaTtp.js";
import { b as Widget, W as WidgetBody } from "./widget-D7PGEeO1.js";
function tracesSearch(entity) {
  switch (entity.kind) {
    case "profile":
      return { profile: entity.profileId };
    case "group":
      return { group: entity.groupId };
    default:
      return { session: entity.sessionId };
  }
}
function AiUsageWidget({ projectId, entity, className }) {
  switch (entity.kind) {
    case "profile":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        ProfileUsage,
        {
          className,
          entity,
          projectId
        }
      );
    case "group":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        GroupUsage,
        {
          className,
          entity,
          projectId
        }
      );
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        SessionUsage,
        {
          className,
          entity,
          projectId
        }
      );
  }
}
function ProfileUsage({
  projectId,
  entity,
  className
}) {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.ai.profileSummary.queryOptions({
      projectId,
      profileId: entity.profileId
    })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(UsageBody, { className, entity, query });
}
function GroupUsage({
  projectId,
  entity,
  className
}) {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.ai.groupSummary.queryOptions({ projectId, groupId: entity.groupId })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(UsageBody, { className, entity, query });
}
function SessionUsage({
  projectId,
  entity,
  className
}) {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.ai.sessionSummary.queryOptions({
      projectId,
      sessionId: entity.sessionId
    })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(UsageBody, { className, entity, query });
}
function UsageBody({
  query,
  entity,
  className
}) {
  const data = query.data;
  if (query.isSuccess && (!data || data.generations === 0)) {
    return null;
  }
  const stats = data ? [
    { label: "Calls", value: formatTokens(data.generations) },
    {
      label: "Cost",
      value: /* @__PURE__ */ jsxRuntimeExports.jsx(AiCost, { cost: data.cost, unpricedCalls: data.unpricedCalls })
    },
    {
      label: "Tokens",
      value: formatTokens(data.inputTokens + data.outputTokens)
    },
    {
      label: "Avg latency",
      value: formatLatencyOrNone(data.avgLatencyMs)
    },
    { label: "Errors", value: formatTokens(data.errors) },
    { label: "Last call", value: data.lastAt ? timeAgo(data.lastAt) : "—" }
  ] : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTitle, { icon: Bot, children: "AI usage" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetBody, { className: "col gap-3", children: [
      query.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full" }),
      data && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "grid grid-cols-2 gap-x-4 gap-y-3", children: stats.map((stat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground text-xs", children: stat.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium font-mono tabular-nums", children: stat.value })
        ] }, stat.label)) }),
        data.topModels.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row flex-wrap gap-1", children: data.topModels.map((model) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            className: "max-w-full truncate",
            variant: "secondary",
            children: model
          },
          model
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProjectLink,
          {
            className: "text-muted-foreground text-sm hover:underline",
            search: tracesSearch(entity),
            to: "/ai/traces",
            children: "View traces →"
          }
        )
      ] })
    ] })
  ] });
}
export {
  AiUsageWidget as A
};
//# sourceMappingURL=ai-usage-widget-BIinfAEm.js.map
