import { c as createLucideIcon, d as cn, R as ChevronDown, bn as formatDateTime, P as ProjectLink, h as getProfileName, bo as formatCost, M as Badge, bp as AI_TYPE_LABELS, bq as TriangleAlert, br as formatTokens, bs as formatLatency } from "./router-gBnYxPzA.js";
import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { i as isAiModelCall, a as isUnpricedCall, A as AiCost } from "./ai-cost-C8tzxtic.js";
import { S as Syntax } from "./syntax-CwZKbcAR.js";
import { K as KeyValueGrid } from "./key-value-grid-BaTCXsBI.js";
const __iconNode$1 = [
  ["rect", { width: "8", height: "8", x: "3", y: "3", rx: "2", key: "by2w9f" }],
  ["path", { d: "M7 11v4a2 2 0 0 0 2 2h4", key: "xkn7yn" }],
  ["rect", { width: "8", height: "8", x: "13", y: "13", rx: "2", key: "1cgmvn" }]
];
const Workflow = createLucideIcon("workflow", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z",
      key: "1ngwbx"
    }
  ]
];
const Wrench = createLucideIcon("wrench", __iconNode);
const COLLAPSE_AFTER_CHARS = 1500;
const ROLE_CLASS = {
  system: "bg-def-200 text-muted-foreground",
  user: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  assistant: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  tool: "bg-amber-500/15 text-amber-700 dark:text-amber-300"
};
function isMessageLike(value) {
  return typeof value === "object" && value !== null && "role" in value && typeof value.role === "string";
}
function stringify(value) {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
function LongText({ text, className }) {
  const [expanded, setExpanded] = reactExports.useState(false);
  const tooLong = text.length > COLLAPSE_AFTER_CHARS;
  const shown = tooLong && !expanded ? text.slice(0, COLLAPSE_AFTER_CHARS) : text;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("whitespace-pre-wrap break-words text-sm", className), children: [
    shown,
    tooLong && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "ml-1 text-muted-foreground text-xs underline",
        onClick: () => setExpanded((value) => !value),
        type: "button",
        children: expanded ? "Show less" : `Show ${text.length - COLLAPSE_AFTER_CHARS} more characters`
      }
    )
  ] });
}
function ToolBlock({
  label,
  name,
  payload
}) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "row w-full items-center gap-2 px-2 py-1.5 text-left text-xs",
        onClick: () => setOpen((value) => !value),
        type: "button",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "size-3 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: label }),
          typeof name === "string" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium font-mono", children: name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ChevronDown,
            {
              className: cn(
                "ml-auto size-3 transition-transform",
                open && "rotate-180"
              )
            }
          )
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Syntax,
      {
        code: stringify(payload),
        copyable: false,
        language: "json",
        wrapLines: true
      }
    ) })
  ] });
}
function Part({ part }) {
  if (typeof part === "string") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LongText, { text: part });
  }
  if (typeof part !== "object" || part === null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LongText, { text: stringify(part) });
  }
  const record = part;
  switch (record.type) {
    case "text":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(LongText, { text: String(record.text ?? "") });
    case "reasoning":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        LongText,
        {
          className: "text-muted-foreground italic",
          text: String(record.text ?? "")
        }
      );
    case "tool_call":
    case "tool-call":
    case "function":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        ToolBlock,
        {
          label: "Tool call",
          name: record.toolName ?? record.name ?? record.function?.name,
          payload: record.input ?? record.arguments ?? record.args ?? record.function
        }
      );
    case "tool_result":
    case "tool-result":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        ToolBlock,
        {
          label: "Tool result",
          name: record.toolName,
          payload: record.output ?? record.result
        }
      );
    case "image":
    case "file":
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded bg-def-200 px-2 py-0.5 text-muted-foreground text-xs", children: [
        "[",
        String(record.type),
        typeof record.mediaType === "string" ? ` ${record.mediaType}` : "",
        "]"
      ] });
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Syntax,
        {
          code: stringify(part),
          copyable: false,
          language: "json",
          wrapLines: true
        }
      );
  }
}
function Message({ message }) {
  const parts = Array.isArray(message.content) ? message.content : [message.content];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: cn(
          "w-fit rounded px-1.5 py-0.5 font-medium text-2xs uppercase tracking-wider",
          ROLE_CLASS[message.role] ?? "bg-def-200 text-muted-foreground"
        ),
        children: message.role
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col gap-1.5 pl-1", children: parts.map((part, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: message parts have no ids and the list is never reordered
      /* @__PURE__ */ jsxRuntimeExports.jsx(Part, { part }, index)
    )) })
  ] });
}
function AiContent({
  value,
  empty = "Nothing captured"
}) {
  if (value === null || value === void 0 || value === "") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: empty });
  }
  if (Array.isArray(value) && value.length > 0 && value.every(isMessageLike)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col gap-4", children: value.map((message, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: messages have no ids and the list is never reordered
      /* @__PURE__ */ jsxRuntimeExports.jsx(Message, { message }, index)
    )) });
  }
  if (isMessageLike(value)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Message, { message: value });
  }
  if (typeof value === "string") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LongText, { text: value });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Syntax,
    {
      code: stringify(value),
      copyable: false,
      language: "json",
      wrapLines: true
    }
  );
}
const TABS = [
  { id: "conversation", title: "Conversation" },
  { id: "details", title: "Details" },
  { id: "raw", title: "Raw" }
];
function AiEventBadges({ event }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row flex-wrap items-center gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: AI_TYPE_LABELS[event.type] }),
    event.model && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: event.model }),
    event.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, {}),
      " ",
      event.httpStatus || "error"
    ] }),
    event.stopReason && event.stopReason !== "stop" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: event.stopReason }),
    event.isStream && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "stream" })
  ] });
}
function AiEventStats({ event }) {
  const items = [
    event.type !== "span" && event.type !== "trace" ? {
      label: "Tokens",
      value: `${formatTokens(event.inputTokens)} → ${formatTokens(event.outputTokens)}`
    } : null,
    event.cacheReadTokens > 0 ? { label: "Cached", value: formatTokens(event.cacheReadTokens) } : null,
    event.totalCost > 0 || event.costSource !== "none" || isUnpricedCall(event) ? {
      label: "Cost",
      value: /* @__PURE__ */ jsxRuntimeExports.jsx(
        AiCost,
        {
          cost: event.totalCost,
          unpricedCalls: isUnpricedCall(event) ? 1 : 0
        }
      )
    } : null,
    { label: "Latency", value: formatLatency(event.latencyMs) },
    event.timeToFirstTokenMs > 0 ? { label: "First token", value: formatLatency(event.timeToFirstTokenMs) } : null
  ].filter((item) => item !== null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row flex-wrap gap-x-5 gap-y-1 text-sm", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "row items-baseline gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: item.label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium font-mono tabular-nums", children: item.value })
  ] }, item.label)) });
}
function AiEventDetail({
  event,
  className,
  showTraceLink = true
}) {
  const [tab, setTab] = reactExports.useState("conversation");
  const isModelCall = isAiModelCall(event.type);
  const errorRecord = typeof event.error === "object" && event.error !== null ? event.error : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("col gap-4", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AiEventBadges, { event }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AiEventStats, { event }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDateTime(event.createdAt) }),
        event.profile && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProjectLink,
          {
            className: "hover:underline",
            params: { profileId: event.profileId },
            to: "/profiles/$profileId",
            children: getProfileName(event.profile, false)
          }
        ),
        showTraceLink && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProjectLink,
          {
            className: "hover:underline",
            params: { traceId: event.traceId },
            search: { at: event.createdAt.toISOString() },
            to: "/ai/traces/$traceId",
            children: "Open trace"
          }
        ),
        event.sessionId && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProjectLink,
          {
            className: "hover:underline",
            params: { sessionId: event.sessionId },
            to: "/sessions/$sessionId",
            children: "Open session"
          }
        )
      ] })
    ] }),
    event.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-destructive", children: String(errorRecord?.message ?? event.error ?? "Failed") }),
      typeof errorRecord?.code === "string" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-muted-foreground text-xs", children: errorRecord.code })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row gap-1 border-b", children: TABS.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: cn(
          "px-3 py-1.5 text-sm transition-colors",
          item.id === tab ? "border-foreground border-b-2 font-medium" : "text-muted-foreground hover:text-foreground"
        ),
        onClick: () => setTab(item.id),
        type: "button",
        children: item.title
      },
      item.id
    )) }),
    tab === "conversation" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "col gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-3xs text-muted-foreground uppercase tracking-wider", children: isModelCall ? "Input" : "Input state" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AiContent, { empty: "No input stored", value: event.input })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "col gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-3xs text-muted-foreground uppercase tracking-wider", children: isModelCall ? "Output" : "Output state" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AiContent,
          {
            empty: event.isError ? "No output, the call failed" : "No output stored",
            value: event.output
          }
        )
      ] }),
      event.tools !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "col gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-3xs text-muted-foreground uppercase tracking-wider", children: "Tools available" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AiContent, { value: event.tools })
      ] })
    ] }),
    tab === "details" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      KeyValueGrid,
      {
        className: "border-0",
        columns: 1,
        copyable: true,
        data: [
          { name: "id", value: event.id },
          { name: "traceId", value: event.traceId },
          { name: "spanId", value: event.spanId },
          ...event.parentId ? [{ name: "parentId", value: event.parentId }] : [],
          ...event.conversationId ? [{ name: "conversationId", value: event.conversationId }] : [],
          ...event.name ? [{ name: "name", value: event.name }] : [],
          ...event.model ? [{ name: "model", value: event.model }] : [],
          ...event.provider ? [{ name: "provider", value: event.provider }] : [],
          { name: "inputTokens", value: event.inputTokens },
          { name: "outputTokens", value: event.outputTokens },
          { name: "cacheReadTokens", value: event.cacheReadTokens },
          { name: "cacheWriteTokens", value: event.cacheWriteTokens },
          { name: "reasoningTokens", value: event.reasoningTokens },
          { name: "inputCost", value: formatCost(event.inputCost) },
          { name: "outputCost", value: formatCost(event.outputCost) },
          { name: "totalCost", value: formatCost(event.totalCost) },
          { name: "costSource", value: event.costSource },
          { name: "latencyMs", value: event.latencyMs },
          { name: "timeToFirstTokenMs", value: event.timeToFirstTokenMs },
          ...event.stopReason ? [{ name: "stopReason", value: event.stopReason }] : [],
          ...event.modelParameters ? [{ name: "modelParameters", value: event.modelParameters }] : [],
          { name: "profileId", value: event.profileId },
          { name: "sessionId", value: event.sessionId },
          ...event.groups.length ? [{ name: "groups", value: event.groups.join(", ") }] : [],
          ...Object.entries(event.properties).map(([name, value]) => ({
            name,
            value
          }))
        ]
      }
    ),
    tab === "raw" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Syntax,
      {
        code: JSON.stringify(event, null, 2),
        language: "json",
        wrapLines: true
      }
    )
  ] });
}
export {
  AiEventDetail as A,
  Workflow as W
};
//# sourceMappingURL=ai-event-detail-4RHMKfrC.js.map
