import { a_ as format } from "./router-gBnYxPzA.js";
const fmt = (date) => date ? format(date, "PPP") : null;
function getSubscriptionStateMeta(state, opts) {
  const endsAt = fmt(opts.endsAt);
  const canceledAt = fmt(opts.canceledAt);
  const resumesAt = fmt(opts.resumesAt);
  switch (state) {
    case "self_hosted":
    case "active":
      return {
        badge: null,
        banner: null,
        statusLine: endsAt ? { text: `Your subscription renews on ${endsAt}`, tone: "default" } : null,
        blockType: null
      };
    case "trialing":
      return {
        badge: { label: "Trial", variant: "secondary" },
        banner: {
          title: "Free trial",
          description: endsAt ? `Your organization is on a free trial. It ends on ${endsAt}.` : "Your organization is on a free trial.",
          cta: "Upgrade from $1/month",
          tone: "default"
        },
        statusLine: endsAt ? { text: `Your trial ends on ${endsAt}`, tone: "default" } : null,
        blockType: null
      };
    case "trial_expired":
      return {
        badge: { label: "Trial ended", variant: "destructive" },
        banner: {
          title: "Trial ended",
          description: "Your free trial has ended. Upgrade to keep using FlarePanel.",
          cta: "Upgrade",
          tone: "destructive"
        },
        statusLine: { text: "Your free trial has ended.", tone: "destructive" },
        blockType: "trialEnded"
      };
    case "canceling":
      return {
        badge: { label: "Canceling", variant: "warning" },
        banner: {
          title: "Subscription will be canceled",
          description: endsAt ? `You have canceled your subscription. It will be canceled on ${endsAt} — reactivate it to keep your access.` : "You have canceled your subscription. Reactivate it to keep your access.",
          cta: "Reactivate",
          tone: "warning"
        },
        statusLine: endsAt ? {
          text: `Your subscription will be canceled on ${endsAt}`,
          tone: "destructive"
        } : null,
        blockType: null
      };
    case "canceled":
      return {
        badge: { label: "Canceled", variant: "destructive" },
        banner: {
          title: "Subscription canceled",
          description: canceledAt ? `Your subscription was canceled on ${canceledAt}. Choose a plan to regain access.` : "Your subscription was canceled. Choose a plan to regain access.",
          cta: "Choose a plan",
          tone: "destructive"
        },
        statusLine: {
          text: canceledAt ? `Your subscription was canceled on ${canceledAt}` : "Your subscription was canceled",
          tone: "destructive"
        },
        blockType: "expired"
      };
    case "pausing":
      return {
        badge: { label: "Pausing", variant: "warning" },
        banner: {
          title: "Subscription will be paused",
          description: endsAt ? `Your subscription pauses on ${endsAt}. We keep collecting your events while it's paused${resumesAt ? `, and billing resumes on ${resumesAt}` : ""}.` : `Your subscription is scheduled to pause at the end of the current period. We keep collecting your events while it's paused.`,
          cta: "Keep subscription",
          tone: "warning"
        },
        statusLine: endsAt ? {
          text: `Your subscription will be paused on ${endsAt}`,
          tone: "warning"
        } : {
          text: "Your subscription will be paused at the end of the current period",
          tone: "warning"
        },
        blockType: null
      };
    case "paused":
      return {
        badge: { label: "Paused", variant: "warning" },
        banner: {
          title: "Subscription paused",
          description: resumesAt ? `Your subscription is paused and resumes on ${resumesAt}. Your events are still being collected.` : "Your subscription is paused. Your events are still being collected — resume any time to pick up where you left off.",
          cta: "Resume subscription",
          tone: "warning"
        },
        statusLine: {
          text: resumesAt ? `Your subscription is paused until ${resumesAt}` : "Your subscription is paused",
          tone: "warning"
        },
        blockType: "paused"
      };
    case "past_due":
      return {
        badge: { label: "Past due", variant: "warning" },
        banner: {
          title: "Payment past due",
          description: "Your last payment failed. Update your payment method to avoid losing access.",
          cta: "Update payment",
          tone: "warning"
        },
        statusLine: {
          text: "Your last payment failed — please update your payment method.",
          tone: "destructive"
        },
        blockType: null
      };
    case "unpaid":
      return {
        badge: { label: "Unpaid", variant: "destructive" },
        banner: {
          title: "Subscription unpaid",
          description: "Your subscription is unpaid. Update your payment method to restore access.",
          cta: "Update payment",
          tone: "destructive"
        },
        statusLine: {
          text: "Your subscription is unpaid.",
          tone: "destructive"
        },
        blockType: "unpaid"
      };
    case "incomplete":
      return {
        badge: { label: "Incomplete", variant: "warning" },
        banner: {
          title: "Finish setting up your subscription",
          description: "Your subscription setup is incomplete. Complete checkout to activate it.",
          cta: "Complete checkout",
          tone: "warning"
        },
        statusLine: {
          text: "Your subscription setup is incomplete.",
          tone: "destructive"
        },
        blockType: null
      };
    case "expired":
      return {
        badge: { label: "Expired", variant: "destructive" },
        banner: {
          title: "Subscription expired",
          description: endsAt ? `Your subscription expired on ${endsAt}. Choose a plan to regain access.` : "Your subscription expired. Choose a plan to regain access.",
          cta: "Choose a plan",
          tone: "destructive"
        },
        statusLine: {
          text: endsAt ? `Your subscription expired on ${endsAt}` : "Your subscription expired",
          tone: "destructive"
        },
        blockType: "expired"
      };
    default: {
      const _exhaustive = state;
      return _exhaustive;
    }
  }
}
export {
  getSubscriptionStateMeta as g
};
//# sourceMappingURL=subscription-state-meta-JPhB7GGT.js.map
