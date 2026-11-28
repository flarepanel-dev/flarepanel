import { $ as useNavigate, e as useAppParams, bg as usePageContextRef } from "./router-gBnYxPzA.js";
import { a as reactExports } from "./worker-entry-C5kSRogq.js";
let launchedQuestion = null;
function setLaunchedQuestion(projectId, question) {
  const text = question?.trim();
  launchedQuestion = text ? { projectId, question: text } : null;
}
function takeLaunchedQuestion(projectId) {
  const pending = launchedQuestion;
  launchedQuestion = null;
  return pending?.projectId === projectId ? pending.question : null;
}
function useChatLaunch() {
  const navigate = useNavigate();
  const { organizationId, projectId } = useAppParams();
  const hintRef = usePageContextRef();
  return reactExports.useCallback(
    (question) => {
      setLaunchedQuestion(projectId, question);
      navigate({
        to: "/$organizationId/$projectId/chat",
        params: { organizationId, projectId },
        search: { hint: hintRef.current ?? void 0 }
      });
    },
    [navigate, organizationId, projectId, hintRef]
  );
}
export {
  setLaunchedQuestion as s,
  takeLaunchedQuestion as t,
  useChatLaunch as u
};
//# sourceMappingURL=chat-launch-DoJA8ohM.js.map
