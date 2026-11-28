import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, a as useTRPC, ak as useQueryClient, b as useMutation, as as Ut, ie as IntegrationCardHeader, hZ as IntegrationCardFooter, B as Button, hb as showConfirm, H as pushModal, fd as ColorSquare, bE as Tooltiper, M as Badge, F as Funnel, ig as Route, j as useQuery, E as EmptyState, G as Plus, ih as IntegrationCardSkeleton, O as AnimatePresence, Q as motion } from "./router-gBnYxPzA.js";
import { a as PingBadge } from "./ping-B_apCr-3.js";
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
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  ["path", { d: "M22 8c0-2.3-.8-4.3-2-6", key: "5bb3ad" }],
  [
    "path",
    {
      d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
      key: "11g9vi"
    }
  ],
  ["path", { d: "M4 2C2.8 3.7 2 5.7 2 8", key: "tap9e0" }]
];
const BellRing = createLucideIcon("bell-ring", __iconNode);
function EventBadge({
  event
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Tooltiper,
    {
      content: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col gap-2 tabular-nums", children: event.filters.map((filter) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        filter.name,
        " ",
        filter.operator,
        " ",
        JSON.stringify(filter.value)
      ] }, filter.id)) }),
      disabled: !event.filters.length,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "inline-flex", variant: "outline", children: [
        event.name === "*" ? "Any event" : event.name,
        Boolean(event.filters.length) && /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "ml-1 size-2" })
      ] })
    }
  );
}
function RuleCard({
  rule
}) {
  const trpc = useTRPC();
  const client = useQueryClient();
  const deletion = useMutation(
    trpc.notification.deleteRule.mutationOptions({
      onSuccess() {
        Ut.success("Rule deleted");
        client.refetchQueries(
          trpc.notification.rules.queryOptions({
            projectId: rule.projectId
          })
        );
      }
    })
  );
  const renderConfig = () => {
    switch (rule.config.type) {
      case "events":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row flex-wrap items-baseline gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Get notified when" }),
          rule.config.events.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsx(EventBadge, { event }, event.id)),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "occurs" })
        ] });
      case "funnel":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Get notified when a session has completed this funnel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col gap-2", children: rule.config.events.map((event, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "row items-center gap-2 tabular-nums",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ColorSquare, { children: index + 1 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(EventBadge, { event }, event.id)
              ]
            },
            event.id
          )) })
        ] });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationCardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "title", children: rule.name }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col gap-2 p-4", children: renderConfig() }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(IntegrationCardFooter, { className: "row items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row flex-wrap gap-2", children: rule.integrations.map((integration) => /* @__PURE__ */ jsxRuntimeExports.jsx(PingBadge, { children: integration.name }, integration.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "text-destructive",
            onClick: () => {
              showConfirm({
                title: `Delete ${rule.name}?`,
                text: "This action cannot be undone.",
                onConfirm: () => {
                  deletion.mutate({
                    id: rule.id
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
              pushModal("AddNotificationRule", {
                rule
              });
            },
            variant: "ghost",
            children: "Edit"
          }
        )
      ] })
    ] })
  ] });
}
function Component() {
  const {
    projectId
  } = Route.useParams();
  const trpc = useTRPC();
  const query = useQuery(trpc.notification.rules.queryOptions({
    projectId
  }));
  const data = reactExports.useMemo(() => {
    return query.data || [];
  }, [query.data]);
  const isLoading = query.isLoading;
  const addRule = () => pushModal("AddNotificationRule", {
    rule: void 0
  });
  if (!isLoading && data.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { description: "Get a message when an event fires or a funnel is completed, in Slack, Discord, email or a webhook.", icon: BellRing, title: "No notification rules yet", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { icon: Plus, onClick: addRule, children: "Add rule" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { icon: Plus, onClick: addRule, variant: "outline", children: "Add rule" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col grid w-full gap-4 md:grid-cols-2", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationCardSkeleton, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationCardSkeleton, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationCardSkeleton, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "popLayout", children: data.map((item) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { layout: "position", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RuleCard, { rule: item }) }, item.id);
      }) })
    ] })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.notifications._tabs.rules-B9PaQ5-3.js.map
