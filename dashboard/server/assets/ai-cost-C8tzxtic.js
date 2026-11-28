import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { bD as zEventGroupIds, bE as Tooltiper, bo as formatCost, bF as SMALLEST_SHOWN_COST } from "./router-gBnYxPzA.js";
import { s as string, n as number, o as object, h as array, m as unknown, u as union, r as record, i as boolean, d as _enum } from "./pick-CfnSzKDx.js";
const AI_EVENT_KINDS = [
  "generation",
  "embedding",
  "span",
  "trace"
];
const AI_EVENT_NAMES = {
  embedding: "ai_embedding",
  span: "ai_span",
  trace: "ai_trace"
};
const AI_INTERNAL_EVENT_NAMES = [
  AI_EVENT_NAMES.trace,
  AI_EVENT_NAMES.span,
  AI_EVENT_NAMES.embedding
];
const AI_ID_MAX_LENGTH = 128;
const AI_ID_PATTERN = /^[A-Za-z0-9._:@()!'|~-]+$/;
const AI_NAME_MAX_LENGTH = 200;
const zAiId = string().min(1).max(AI_ID_MAX_LENGTH).regex(
  AI_ID_PATTERN,
  "Allowed characters: letters, digits and - _ ~ . @ ( ) ! ' : |"
);
const UINT32_MAX = 4294967295;
const zTokenCount = number().int().min(0).max(UINT32_MAX);
const zNonNegative = number().min(0);
const zDurationMs = number().min(0).max(UINT32_MAX);
const zAiUsage = object({
  inputTokens: zTokenCount.optional(),
  outputTokens: zTokenCount.optional(),
  cacheReadTokens: zTokenCount.optional(),
  cacheWriteTokens: zTokenCount.optional(),
  reasoningTokens: zTokenCount.optional()
});
const zAiError = object({
  message: string(),
  code: string().max(AI_NAME_MAX_LENGTH).optional(),
  httpStatus: number().int().min(100).max(599).optional()
});
const zAiModelParameters = object({
  temperature: number().optional(),
  maxTokens: number().int().optional(),
  topP: number().optional(),
  topK: number().int().optional(),
  frequencyPenalty: number().optional(),
  presencePenalty: number().optional(),
  seed: number().int().optional(),
  stopSequences: array(string()).optional()
}).catchall(unknown());
const MODEL_CALL_KINDS = ["generation", "embedding"];
function isAiModelCall(kind) {
  return MODEL_CALL_KINDS.includes(kind);
}
object({
  kind: _enum(AI_EVENT_KINDS),
  traceId: zAiId,
  spanId: zAiId.optional(),
  parentId: zAiId.optional(),
  name: string().min(1).max(AI_NAME_MAX_LENGTH).optional(),
  conversationId: zAiId.optional(),
  model: string().min(1).max(AI_NAME_MAX_LENGTH).optional(),
  provider: string().min(1).max(AI_NAME_MAX_LENGTH).optional(),
  input: unknown().optional(),
  output: unknown().optional(),
  tools: unknown().optional(),
  usage: zAiUsage.optional(),
  cost: zNonNegative.optional(),
  latencyMs: zDurationMs.optional(),
  timeToFirstTokenMs: zDurationMs.optional(),
  error: zAiError.nullish(),
  stopReason: string().max(AI_NAME_MAX_LENGTH).optional(),
  stream: boolean().optional(),
  modelParameters: zAiModelParameters.optional(),
  privacyMode: boolean().optional(),
  properties: record(string(), unknown()).optional(),
  profileId: union([string().min(1), number()]).optional(),
  groups: zEventGroupIds.nullish(),
  deviceId: string().min(1).max(64).optional(),
  timestamp: string().datetime({ offset: true }).optional()
}).superRefine((payload, context) => {
  if (payload.spanId !== void 0 && payload.parentId === payload.spanId) {
    context.addIssue({
      code: "custom",
      path: ["parentId"],
      message: "parentId must not be the span itself"
    });
  }
  if (!isAiModelCall(payload.kind)) {
    return;
  }
  for (const field of ["model", "provider"]) {
    if (!payload[field]) {
      context.addIssue({
        code: "custom",
        path: [field],
        message: `${field} is required for ${payload.kind}`
      });
    }
  }
  if (payload.usage?.inputTokens === void 0) {
    context.addIssue({
      code: "custom",
      path: ["usage", "inputTokens"],
      message: `usage.inputTokens is required for ${payload.kind}`
    });
  }
  if (payload.kind === "generation" && payload.usage?.outputTokens === void 0) {
    context.addIssue({
      code: "custom",
      path: ["usage", "outputTokens"],
      message: "usage.outputTokens is required for generation"
    });
  }
});
object({
  models: array(string()).optional(),
  providers: array(string()).optional(),
  names: array(string()).optional(),
  types: array(_enum(AI_EVENT_KINDS)).optional(),
  profileId: string().optional(),
  conversationId: string().optional(),
  sessionId: string().optional(),
  groupId: string().optional(),
  isError: boolean().optional(),
  /** Matches trace and conversation ids exactly, prompt and completion text loosely. */
  search: string().max(200).optional()
});
const UNKNOWN_COST_HINT = "Cost unknown: the model has no price in the price catalog, or the provider reported no token usage.";
function isUnpricedCall(event) {
  return isAiModelCall(event.type) && !event.isError && event.costSource === "none";
}
function describeAiCost(cost, unpricedCalls) {
  if (unpricedCalls === 0) {
    return { text: formatCost(cost) };
  }
  if (cost < SMALLEST_SHOWN_COST) {
    return { text: "—", hint: UNKNOWN_COST_HINT };
  }
  const calls = unpricedCalls === 1 ? "1 call has" : `${unpricedCalls} calls have`;
  return {
    text: `${formatCost(cost, "down")}+`,
    hint: `At least this much: ${calls} no known cost.`
  };
}
function AiCost({
  cost,
  unpricedCalls
}) {
  const { text, hint } = describeAiCost(cost, unpricedCalls);
  if (!hint) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: text });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltiper, { asChild: true, content: hint, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: "cursor-help text-muted-foreground underline decoration-dotted underline-offset-2",
      tabIndex: 0,
      children: text
    }
  ) });
}
export {
  AiCost as A,
  isUnpricedCall as a,
  AI_INTERNAL_EVENT_NAMES as b,
  isAiModelCall as i
};
//# sourceMappingURL=ai-cost-C8tzxtic.js.map
