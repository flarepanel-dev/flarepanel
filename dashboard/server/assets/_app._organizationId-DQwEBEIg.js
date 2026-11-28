import { a as reactExports, o as jsxRuntimeExports, x as useMatches, O as Outlet } from "./worker-entry-C5kSRogq.js";
import { s as subscriptionBlocksDashboard } from "./subscription-state-C_3uzdIk.js";
import { g as getSubscriptionStateMeta } from "./subscription-state-meta-JPhB7GGT.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { O as AnimatePresence, Q as motion, B as Button, X, I as useAppContext, a2 as useLocation, aR as useCookieStore, aW as op, M as Badge, aX as usedPercent, a4 as useNumber, L as LinkButton, a as useTRPC, j as useQuery, aY as isOrganizationAdminRole, H as pushModal, aZ as Route, a_ as format, d as cn } from "./router-gBnYxPzA.js";
import { u as useInAppFeedback, o as openFeedback, P as PUBLIC_FEEDBACK_URL } from "./feedback-button-D4N4cqSA.js";
import { P as Progress } from "./progress-Qvc7Obsu.js";
import { d as differenceInDays } from "./differenceInDays-liXHUvyd.js";
import { d as differenceInMonths } from "./differenceInMonths-nSGUi53F.js";
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
import "./endOfMonth-C3pRd8ne.js";
function PromptCard({
  title,
  subtitle,
  onClose,
  children,
  gradientColor = "rgb(16 185 129)",
  show
}) {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: show && mounted && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      animate: { opacity: 1, x: 0, scale: 1 },
      className: "fixed right-0 bottom-0 z-50 max-w-sm p-4",
      exit: { opacity: 0, x: 100, scale: 0.95 },
      initial: { opacity: 0, x: 100, scale: 0.95 },
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-6 overflow-hidden rounded-lg border bg-card py-6 shadow-[0_0_100px_50px_var(--color-background)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col relative gap-1 px-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full opacity-30 blur-3xl",
              style: {
                background: `radial-gradient(circle, ${gradientColor} 0%, transparent 70%)`
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "max-w-[240px] font-semibold text-lg", children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                className: "rounded-full",
                onClick: onClose,
                size: "icon",
                variant: "ghost",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: subtitle })
        ] }),
        children
      ] })
    }
  ) });
}
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;
function FeedbackPrompt() {
  const { isSelfHosted, isDemo } = useAppContext();
  const onChatPage = useLocation().pathname.endsWith("/chat");
  const inApp = useInAppFeedback();
  const [feedbackPromptSeen, setFeedbackPromptSeen] = useCookieStore(
    "feedback-prompt-seen",
    "",
    { maxAge: THIRTY_DAYS_IN_SECONDS }
  );
  const shouldShow = reactExports.useMemo(() => {
    if (isSelfHosted || onChatPage) {
      return false;
    }
    if (isDemo) {
      return false;
    }
    if (!feedbackPromptSeen) {
      return true;
    }
    try {
      const lastSeenDate = new Date(feedbackPromptSeen);
      const now = /* @__PURE__ */ new Date();
      const daysSinceLastSeen = (now.getTime() - lastSeenDate.getTime()) / (1e3 * 60 * 60 * 24);
      return daysSinceLastSeen >= 30;
    } catch {
      return true;
    }
  }, [isDemo, isSelfHosted, onChatPage, feedbackPromptSeen]);
  const handleGiveFeedback = () => {
    if (inApp) {
      openFeedback();
    } else if (typeof window !== "undefined") {
      window.open(PUBLIC_FEEDBACK_URL, "_blank", "noopener,noreferrer");
    }
    setFeedbackPromptSeen((/* @__PURE__ */ new Date()).toISOString());
    op.track("feedback_prompt_button_clicked");
  };
  const handleClose = () => {
    setFeedbackPromptSeen((/* @__PURE__ */ new Date()).toISOString());
  };
  reactExports.useEffect(() => {
    if (shouldShow) {
      op.track("feedback_prompt_viewed");
    }
  }, [shouldShow]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    PromptCard,
    {
      gradientColor: "rgb(255 106 77)",
      onClose: handleClose,
      show: shouldShow,
      subtitle: "Help us improve FlarePanel with your insights",
      title: "Share Your Feedback",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-4 px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground text-sm", children: "Your feedback helps us build features you actually need. Share your thoughts, report bugs, or suggest improvements" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "self-start", onClick: handleGiveFeedback, children: "Give Feedback" })
      ] })
    }
  );
}
const LONG_TRIAL_DAYS = 60;
const NEARLY_USED_PERCENT = 80;
const LAST_DAYS = 5;
function TrialStrip({
  organization
}) {
  const number = useNumber();
  const limit = organization.subscriptionPeriodEventsLimit;
  const used = Math.min(organization.subscriptionPeriodEventsCount, limit);
  const percent = usedPercent(used, limit);
  const daysLeft = organization.subscriptionEndsAt ? differenceInDays(organization.subscriptionEndsAt, /* @__PURE__ */ new Date()) + 1 : null;
  const showDays = daysLeft !== null && daysLeft <= LONG_TRIAL_DAYS;
  const urgent = percent >= NEARLY_USED_PERCENT || showDays && daysLeft <= LAST_DAYS;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row flex-wrap items-center gap-x-5 gap-y-2 border-b bg-card px-4 py-2.5 text-sm lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: urgent ? "warning" : "secondary", children: "Free trial" }),
      showDays && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: daysLeft === 1 ? "Last day" : `${daysLeft} days left` })
    ] }),
    limit > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row min-w-0 flex-1 items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { className: "w-28 shrink-0", size: "sm", value: percent }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate text-muted-foreground tabular-nums", children: [
        number.format(used),
        " of ",
        number.format(limit),
        " events used"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      LinkButton,
      {
        className: "ml-auto",
        params: { organizationId: organization.id },
        size: "sm",
        to: "/$organizationId/billing",
        variant: urgent ? "default" : "outline",
        children: "Choose a plan"
      }
    )
  ] });
}
const MIN_TENURE_MONTHS = 3;
const dismissKey = (organizationId) => `op-yearly-prompt-dismissed:${organizationId}`;
const readDismissed = (organizationId) => {
  try {
    return localStorage.getItem(dismissKey(organizationId)) === "1";
  } catch {
    return true;
  }
};
function YearlySwitchPrompt({
  organization
}) {
  const trpc = useTRPC();
  const [dismissed, setDismissed] = reactExports.useState(true);
  reactExports.useEffect(() => {
    setDismissed(readDismissed(organization.id));
  }, [organization.id]);
  const eligible = organization.subscriptionState === "active" && organization.subscriptionInterval === "month" && !!organization.subscriptionFirstStartedAt && differenceInMonths(/* @__PURE__ */ new Date(), organization.subscriptionFirstStartedAt) >= MIN_TENURE_MONTHS;
  const accessQuery = useQuery(
    trpc.organization.myAccess.queryOptions(
      { organizationId: organization.id },
      { enabled: eligible && !dismissed }
    )
  );
  const isAdmin = !!accessQuery.data && isOrganizationAdminRole(accessQuery.data.role);
  const currentProductQuery = useQuery(
    trpc.subscription.getCurrent.queryOptions(
      { organizationId: organization.id },
      { enabled: eligible && !dismissed && isAdmin }
    )
  );
  if (!(eligible && isAdmin) || dismissed) {
    return null;
  }
  const dismiss = () => {
    op.track("yearly_prompt_dismissed", { organizationId: organization.id });
    try {
      localStorage.setItem(dismissKey(organization.id), "1");
    } catch {
    }
    setDismissed(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-1 border-b bg-card p-4 lg:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-lg", children: "Switch to yearly — get 2 months free" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1", children: "You've been with us for a while. Pay for 10 months and get 12: same plan, same limits, one invoice a year." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          loading: currentProductQuery.isLoading,
          onClick: () => {
            op.track("yearly_prompt_clicked", {
              organizationId: organization.id
            });
            pushModal("SelectBillingPlan", {
              organization,
              currentProduct: currentProductQuery.data ?? null,
              defaultInterval: "year"
            });
          },
          children: "See my yearly price"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: dismiss, variant: "outline", children: "Maybe later" })
    ] })
  ] });
}
function Alert({
  title,
  description,
  children,
  className
}) {
  const location = useLocation();
  if (location.pathname.match(/\/.+\/billing/)) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("col gap-1 border-b bg-card p-4 lg:p-8", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-lg", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1", children: description }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row gap-2", children })
  ] });
}
function Component() {
  const {
    organizationId
  } = Route.useParams();
  const trpc = useTRPC();
  const {
    data: organization
  } = useSuspenseQuery(trpc.organization.get.queryOptions({
    organizationId
  }));
  const stateMeta = getSubscriptionStateMeta(organization.subscriptionState, {
    endsAt: organization.subscriptionEndsAt,
    canceledAt: organization.subscriptionCanceledAt,
    resumesAt: organization.subscriptionResumesAt
  });
  const isProjectRoute = useMatches({
    select: (matches) => matches.some((match) => match.routeId === "/_app/$organizationId/$projectId")
  });
  const hideBannerForPrompt = isProjectRoute && subscriptionBlocksDashboard(organization.subscriptionState);
  const isTrialOverLimit = Boolean(organization.subscriptionStatus === "trialing" && !organization.subscriptionProductId && organization.subscriptionPeriodEventsCountExceededAt && organization.subscriptionPeriodEventsLimit > 0 && organization.subscriptionPeriodEventsCount >= organization.subscriptionPeriodEventsLimit);
  const isOverLimit = Boolean(organization.subscriptionPeriodEventsCountExceededAt && organization.isActive && organization.isExceeded && organization.subscriptionPeriodEventsLimit > 0);
  const isTrialing = organization.subscriptionState === "trialing";
  const location = useLocation();
  const isBillingPage = /\/.+\/billing/.test(location.pathname);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    !(stateMeta.banner || isBillingPage) && /* @__PURE__ */ jsxRuntimeExports.jsx(YearlySwitchPrompt, { organization }),
    isTrialing && !isBillingPage && !isTrialOverLimit && /* @__PURE__ */ jsxRuntimeExports.jsx(TrialStrip, { organization }),
    stateMeta.banner && !hideBannerForPrompt && !isTrialing && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { description: stateMeta.banner.description, title: stateMeta.banner.title, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinkButton, { params: {
      organizationId
    }, to: "/$organizationId/billing", children: stateMeta.banner.cta }) }),
    organization.isActive && !organization.isExceeded && organization.subscriptionPeriodEventsLimit > 0 && organization.subscriptionPeriodEventsCount >= organization.subscriptionPeriodEventsLimit * 0.8 && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { description: `You've used ${Math.round(organization.subscriptionPeriodEventsCount / organization.subscriptionPeriodEventsLimit * 100)}% of your ${organization.subscriptionPeriodEventsLimit.toLocaleString()} monthly events. If you go over, we keep collecting your events but analytics pause until you upgrade or your next billing period.`, title: "Approaching your events limit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinkButton, { params: {
      organizationId
    }, to: "/$organizationId/billing", children: "See plans" }) }),
    isTrialOverLimit && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { description: `Your free trial has used all ${organization.subscriptionPeriodEventsLimit.toLocaleString()} of its events, so new events are no longer recorded. Everything collected so far is kept; choose a plan to start recording again.`, title: "Free trial events used up", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinkButton, { params: {
      organizationId
    }, to: "/$organizationId/billing", children: "Choose a plan" }) }),
    isOverLimit && !isProjectRoute && organization.subscriptionPeriodEventsCountExceededAt && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { description: `You hit your monthly events limit on ${format(organization.subscriptionPeriodEventsCountExceededAt, "PPP")}. We're still collecting your events — nothing is lost — but analytics are paused until you upgrade or your next billing period starts.`, title: "Analytics paused: events limit exceeded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinkButton, { params: {
      organizationId
    }, to: "/$organizationId/billing", children: "Upgrade now" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FeedbackPrompt, {})
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId-DQwEBEIg.js.map
