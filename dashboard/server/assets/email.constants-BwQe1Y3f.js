import { o as object, t as partialRecord, d as _enum, i as boolean } from "./pick-CfnSzKDx.js";
const emailCategories = {
  onboarding: {
    label: "Onboarding",
    description: "Get started tips and guidance emails"
  },
  weekly_digest: {
    label: "Weekly digest",
    description: "A weekly summary of your analytics with AI-surfaced insights"
  },
  product_alerts: {
    label: "Product alerts",
    description: "Important notices about your projects: tracking stopped sending data, event limits, and alerts from your notification rules"
  },
  // Kept separate from `onboarding` on purpose: opting out of getting-started
  // tips must not also opt you out of being told your account is winding down.
  // The final deletion warning has no category at all, so it always sends.
  account_lifecycle: {
    label: "Account status",
    description: "Notices about your trial ending, event ingestion being paused, and data scheduled for removal"
  }
};
object({
  categories: partialRecord(
    _enum(Object.keys(emailCategories)),
    boolean()
  )
});
export {
  emailCategories as e
};
//# sourceMappingURL=email.constants-BwQe1Y3f.js.map
