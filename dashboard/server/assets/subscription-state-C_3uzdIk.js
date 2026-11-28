function subscriptionBlocksDashboard(state) {
  switch (state) {
    case "trial_expired":
    case "expired":
    case "unpaid":
    case "canceled":
    // Paused blocks the dashboard too (billing has stopped), but with its own
    // prompt: data is still collected and one click resumes the subscription.
    case "paused":
      return true;
    default:
      return false;
  }
}
export {
  subscriptionBlocksDashboard as s
};
//# sourceMappingURL=subscription-state-C_3uzdIk.js.map
