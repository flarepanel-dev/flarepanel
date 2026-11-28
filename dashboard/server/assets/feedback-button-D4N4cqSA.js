import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { aW as op, a as useTRPC, j as useQuery, H as pushModal } from "./router-gBnYxPzA.js";
const PUBLIC_FEEDBACK_URL = "https://github.com/flarepanel-dev/flarepanel/issues/new/choose";
function useInAppFeedback() {
  const trpc = useTRPC();
  const config = useQuery({
    ...trpc.feedback.config.queryOptions(),
    staleTime: Number.POSITIVE_INFINITY,
    retry: false
  });
  return config.data?.inApp === true;
}
function openFeedback(topic) {
  op.track("feedback_button_clicked", topic ? { topic } : void 0);
  pushModal("Feedback", topic ? { topic } : {});
}
function FeedbackButton({
  className,
  children = "Give feedback",
  topic
}) {
  const inApp = useInAppFeedback();
  if (inApp) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className,
        onClick: () => openFeedback(topic),
        type: "button",
        children
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "a",
    {
      className,
      href: PUBLIC_FEEDBACK_URL,
      onClick: () => op.track("feedback_button_clicked"),
      rel: "noopener noreferrer",
      target: "_blank",
      children
    }
  );
}
export {
  FeedbackButton as F,
  PUBLIC_FEEDBACK_URL as P,
  openFeedback as o,
  useInAppFeedback as u
};
//# sourceMappingURL=feedback-button-D4N4cqSA.js.map
