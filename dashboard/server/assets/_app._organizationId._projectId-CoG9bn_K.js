import { a as reactExports, o as jsxRuntimeExports, O as Outlet } from "./worker-entry-C5kSRogq.js";
import { s as subscriptionBlocksDashboard } from "./subscription-state-C_3uzdIk.js";
import { g as getSubscriptionStateMeta } from "./subscription-state-meta-JPhB7GGT.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { a as useTRPC, j as useQuery, b as useMutation, as as Ut, ak as useQueryClient, a4 as useNumber, aW as op, M as Badge, bQ as formatDate, L as LinkButton, C as Check, B as Button, eh as Route } from "./router-gBnYxPzA.js";
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
const FREE_PRODUCT_IDS = (typeof process !== "undefined" && process.env?.POLAR_FREE_PRODUCT_IDS || "").split(",").map((id) => id.trim()).filter(Boolean);
const FEATURES = [
  "Plans start at $1/month",
  "Unlimited reports, members and projects",
  "Advanced funnels and conversions",
  "Real-time analytics",
  "Track KPIs and custom events",
  "Privacy-focused and GDPR compliant",
  "Revenue tracking",
  "Google Search Console integration"
];
const COPY = {
  trialEnded: {
    badge: { label: "Trial ended", variant: "secondary" },
    gradient: "rgb(16 185 129)",
    title: "Your 30 days are up",
    lead: "Thanks for trying FlarePanel. Everything you set up is still here: your projects, your reports, and every event you tracked. Pick a plan and your dashboards are live again in about a minute.",
    dateLabel: "Trial ended",
    action: "checkout",
    cta: (plan, price) => `Continue with ${plan} for ${price}/month`,
    note: "We keep collecting your incoming events for 7 days after the trial ends, so nothing is lost while you decide."
  },
  expired: {
    badge: { label: "Subscription ended", variant: "info" },
    gradient: "rgb(59 130 246)",
    title: "Your data is right where you left it",
    lead: "Your subscription ended, but we haven't deleted anything. Reactivate and your dashboards, reports, and events are back immediately.",
    dateLabel: "Subscription ended",
    action: "checkout",
    cta: (plan, price) => `Reactivate with ${plan} for ${price}/month`,
    note: null
  },
  unpaid: {
    badge: { label: "Payment issue", variant: "warning" },
    gradient: "rgb(245 158 11)",
    title: "Your last payment didn't go through",
    lead: "Usually it's an expired card or a bank block, and it takes a minute to fix. Update your payment method and your dashboards come straight back. Your data hasn't gone anywhere.",
    dateLabel: "Paid through",
    action: "portal",
    cta: () => "Update payment method",
    note: null
  },
  paused: {
    badge: { label: "Paused", variant: "secondary" },
    gradient: "rgb(16 185 129)",
    title: "Your subscription is on a break",
    lead: "You paused your subscription, so billing is stopped — but we're still collecting every event. Resume whenever you're ready and your dashboards are back immediately, right where you left them.",
    dateLabel: "Billing resumes",
    action: "resume",
    cta: () => "Resume subscription now",
    note: "Resuming starts a new billing period right away. Your events keep being collected while paused, so nothing is lost."
  },
  overLimit: {
    badge: { label: "Over plan limit", variant: "warning" },
    gradient: "rgb(245 158 11)",
    title: "Analytics are paused for this billing period",
    lead: "Your projects sent more events this month than your plan includes. We're still collecting every one of them; only the dashboards, reports and API reads are paused. Move to a bigger plan and everything is back in about a minute, or wait for your next billing period.",
    dateLabel: "Next billing period",
    action: "checkout",
    cta: (plan, price) => `Upgrade to ${plan} for ${price}/month`,
    note: "Nothing is lost: events from the paused days show up as soon as analytics are back."
  },
  freePlan: {
    badge: { label: "Plan change", variant: "secondary" },
    gradient: "rgb(16 185 129)",
    title: "We retired the free plan",
    lead: "We'd rather run a small, sustainable service than a free one we can't support properly. Paid plans start at $1/month and your data carries over as-is.",
    dateLabel: "Subscription ended",
    action: "checkout",
    cta: (plan, price) => `Continue with ${plan} for ${price}/month`,
    note: null
  }
};
const NO_TRIAL_COPY = {
  ...COPY.trialEnded,
  badge: { label: "Choose a plan", variant: "secondary" },
  title: "This workspace starts on a plan",
  lead: "Each email address gets one free trial, and yours was used on an earlier workspace. Choose a plan to start collecting events here.",
  dateLabel: "Created",
  note: null
};
function BillingPrompt({
  organization,
  type
}) {
  const number = useNumber();
  const trpc = useTRPC();
  const copy = type === "trialEnded" && organization.subscriptionPeriodEventsLimit === 0 ? NO_TRIAL_COPY : COPY[type];
  const { data: products, isLoading: isLoadingProducts } = useQuery(
    trpc.subscription.products.queryOptions({
      organizationId: organization.id
    })
  );
  const checkout = useMutation(
    trpc.subscription.checkout.mutationOptions({
      onSuccess(data) {
        if (data?.url) {
          window.location.href = data.url;
        } else {
          Ut.success("Subscription updated", {
            description: "It might take a few seconds to update"
          });
        }
      },
      onError(error) {
        Ut.error(error.message);
      }
    })
  );
  const portal = useMutation(
    trpc.subscription.portal.mutationOptions({
      onSuccess(data) {
        if (data?.url) {
          window.location.href = data.url;
        }
      },
      onError(error) {
        Ut.error(error.message);
      }
    })
  );
  const queryClient = useQueryClient();
  const resume = useMutation(
    trpc.subscription.resumeSubscription.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(trpc.organization.pathFilter());
        queryClient.invalidateQueries(trpc.subscription.pathFilter());
        Ut.success("Welcome back!", {
          description: "It might take a few seconds to update"
        });
      },
      onError(error) {
        Ut.error(error.message);
      }
    })
  );
  const eventsCount = organization.subscriptionPeriodEventsCount ?? 0;
  const bestProductFit = products?.filter(
    (product) => product.recurringInterval === "month" && !product.disabled && typeof product.metadata.eventsLimit === "number" && product.prices.some((price2) => price2.amountType === "fixed")
  ).find(
    (product) => typeof product.metadata.eventsLimit === "number" && product.metadata.eventsLimit >= eventsCount
  );
  const bestPrice = bestProductFit?.prices.find(
    (price2) => price2.amountType === "fixed"
  );
  const price = bestPrice && "priceAmount" in bestPrice ? number.currency(bestPrice.priceAmount / 100) : null;
  reactExports.useEffect(() => {
    op.track("billing_prompt_viewed", {
      type
    });
  }, [type]);
  const renderCta = () => {
    if (copy.action === "resume") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "w-full",
          loading: resume.isPending,
          onClick: () => {
            op.track("billing_prompt_upgrade_clicked", {
              type,
              cta: "resume"
            });
            resume.mutate({ organizationId: organization.id });
          },
          size: "lg",
          children: copy.cta("", "")
        }
      );
    }
    if (copy.action === "portal") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "w-full",
          loading: portal.isPending,
          onClick: () => {
            op.track("billing_prompt_upgrade_clicked", {
              type,
              cta: "portal"
            });
            portal.mutate({ organizationId: organization.id });
          },
          size: "lg",
          children: copy.cta("", "")
        }
      );
    }
    if (!(bestProductFit && bestPrice && price)) {
      if (isLoadingProducts) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", loading: true, size: "lg", children: "Loading plans" });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "w-full", size: "lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:hello@flarepanel.dev?subject=Custom plan", children: "Get a custom plan" }) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        className: "w-full",
        loading: isLoadingProducts || checkout.isPending,
        onClick: () => {
          op.track("billing_prompt_upgrade_clicked", {
            type,
            cta: "checkout",
            price: "priceAmount" in bestPrice ? bestPrice.priceAmount / 100 : 0
          });
          checkout.mutate({
            organizationId: organization.id,
            productPriceId: bestPrice.id,
            productId: bestProductFit.id
          });
        },
        size: "lg",
        children: copy.cta(bestProductFit.name, price)
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-xl px-4 py-12 md:py-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-lg border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full opacity-20 blur-3xl",
          style: {
            background: `radial-gradient(circle, ${copy.gradient} 0%, transparent 70%)`
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-3 p-6 md:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: copy.badge.variant, children: copy.badge.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-2xl", children: copy.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: copy.lead })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row gap-3 px-6 md:px-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col flex-1 gap-1 rounded-md bg-def-200 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-2xl tabular-nums", children: number.short(eventsCount) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: "Events tracked, all safe and stored" })
        ] }),
        (() => {
          const date = type === "paused" ? organization.subscriptionResumesAt : organization.subscriptionEndsAt;
          if (!date) {
            return null;
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col flex-1 gap-1 rounded-md bg-def-200 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-2xl tabular-nums", children: formatDate(date) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: copy.dateLabel })
          ] });
        })()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-3 p-6 md:p-8", children: [
        copy.action === "checkout" && (bestProductFit ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm", children: [
          "Based on your usage, the",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: bestProductFit.name }),
          " ",
          "plan covers you: up to",
          " ",
          number.short(Number(bestProductFit.metadata.eventsLimit)),
          " ",
          "events per month for ",
          price,
          "."
        ] }) : !isLoadingProducts && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Your usage is above our standard plans, so let's set you up with a custom one." })),
        renderCta(),
        copy.note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: copy.note }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            LinkButton,
            {
              params: { organizationId: organization.id },
              to: "/$organizationId/billing",
              variant: "outline",
              children: "See all plans"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              className: "text-muted-foreground text-sm hover:underline",
              href: "mailto:hello@flarepanel.dev",
              children: "Questions? Email us"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2", children: FEATURES.map((feature) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4 shrink-0 text-emerald-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: feature })
    ] }, feature)) })
  ] });
}
const BASE_SUFFIX = " | FlarePanel.dev";
function inject(title, projectName) {
  if (!title.endsWith(BASE_SUFFIX)) {
    return title;
  }
  if (title.includes(` | ${projectName}${BASE_SUFFIX}`)) {
    return title;
  }
  return title.replace(BASE_SUFFIX, ` | ${projectName}${BASE_SUFFIX}`);
}
function useProjectDocumentTitle(projectName) {
  const lastApplied = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!projectName) {
      return;
    }
    const apply = () => {
      const current = document.title;
      if (current === lastApplied.current) {
        return;
      }
      const next = inject(current, projectName);
      if (next !== current) {
        document.title = next;
      }
      lastApplied.current = document.title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      childList: true,
      characterData: true,
      subtree: true
    });
    return () => observer.disconnect();
  }, [projectName]);
}
function ProjectDashboard() {
  const {
    organizationId,
    projectId
  } = Route.useParams();
  const trpc = useTRPC();
  const {
    data: organization
  } = useSuspenseQuery(trpc.organization.get.queryOptions({
    organizationId
  }));
  const {
    data: project
  } = useSuspenseQuery(trpc.project.getProjectWithClients.queryOptions({
    projectId
  }));
  useProjectDocumentTitle(project?.name);
  if (organization.subscriptionProductId && FREE_PRODUCT_IDS.includes(organization.subscriptionProductId)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(BillingPrompt, { organization, type: "freePlan" });
  }
  if (subscriptionBlocksDashboard(organization.subscriptionState)) {
    const {
      blockType
    } = getSubscriptionStateMeta(organization.subscriptionState, {
      endsAt: organization.subscriptionEndsAt,
      canceledAt: organization.subscriptionCanceledAt
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(BillingPrompt, { organization, type: blockType ?? "expired" });
  }
  if (organization.isActive && organization.isExceeded && organization.subscriptionPeriodEventsLimit > 0 && organization.subscriptionPeriodEventsCountExceededAt) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(BillingPrompt, { organization, type: "overLimit" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
}
export {
  ProjectDashboard as component
};
//# sourceMappingURL=_app._organizationId._projectId-CoG9bn_K.js.map
