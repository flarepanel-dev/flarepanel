import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, M as Badge, B as Button, b3 as Settings, dZ as ExternalLink, b4 as Skeleton, a as useTRPC, j as useQuery, b as useMutation, dM as handleError, as as Ut, hr as formatTimeAgoOrDateTime, hs as Play, L as LinkButton, c2 as Label, aK as Input, fO as Checkbox, ht as Textarea, bq as TriangleAlert, ak as useQueryClient, G as Plus, R as ChevronDown, X, C as Check, h0 as Minus, ad as getChartColor, c8 as useOverviewOptions, dy as ArrowRight, S as SerieIcon, a$ as ComposedChart, cN as Grid, b0 as YAxis, a4 as useNumber, cO as XAxis, b1 as SeriesBar, af as OPChartTooltip, hu as BadgeCheck, d as cn, hv as Cloud, hd as RefreshCw, eH as Select, eI as SelectTrigger, eJ as SelectValue, eK as SelectContent, eL as SelectItem, hw as Route, e$ as keepPreviousData, E as EmptyState, aD as Alert, aE as AlertTitle, aF as AlertDescription, fU as Switch, cK as OverviewMetricCard, f5 as OverviewWidgetTable } from "./router-gBnYxPzA.js";
import { s as string, h as array, o as object, i as boolean, d as _enum } from "./pick-CfnSzKDx.js";
import { B as BOT_GROUP_LABELS, i as isAiBotGroup, b as botGroup } from "./event.constants-DKhXjlKd.js";
import { P as Pagination } from "./pagination-Dj6_PitL.js";
import { O as OverviewRange } from "./overview-range-DoapqOyi.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { R as Radar } from "./radar-DPrPNpBG.js";
import { R as RotateCw } from "./rotate-cw-59NMbvpf.js";
import { B as BookOpen } from "./book-open-kNvy5Ks9.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
import "./useIsFetching-BWA9Maly.js";
import "./time-window-picker-BUBj3ZWF.js";
import "./index-DxXk7QJj.js";
import "./addDays-BIiJOlUZ.js";
import "./endOfMonth-C3pRd8ne.js";
import "./startOfMonth-Bf6CczcY.js";
const __iconNode = [
  ["path", { d: "M14 14a2 2 0 0 0 2-2V8h-2", key: "1r06pg" }],
  [
    "path",
    {
      d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
      key: "18887p"
    }
  ],
  ["path", { d: "M8 14a2 2 0 0 0 2-2V8H8", key: "1jzu5j" }]
];
const MessageSquareQuote = createLucideIcon("message-square-quote", __iconNode);
const CLOUDFLARE_HOSTNAMES_MAX = 20;
const ZONE_ID = /^[a-f0-9]{32}$/;
const TOKEN = /^[A-Za-z0-9._-]{20,512}$/;
const HOSTNAME = /^(?=.{1,253}$)[a-z0-9-]+(?:\.[a-z0-9-]+)+$/;
const SCHEME = /^[a-z][a-z0-9+.-]*:\/\//;
const PATH_OR_PORT = /[/:?#].*$/;
function normalizeHostname(value) {
  const host = value.trim().toLowerCase().replace(SCHEME, "").replace(PATH_OR_PORT, "").replace(/\.$/, "");
  return HOSTNAME.test(host) ? host : null;
}
function parseHostnames(text) {
  const parts = typeof text === "string" ? text.split(/[\s,]+/) : text;
  const hosts = [];
  for (const part of parts) {
    const host = normalizeHostname(part);
    if (host && !hosts.includes(host)) {
      hosts.push(host);
    }
  }
  return hosts;
}
const zCloudflareZoneId = string().trim().toLowerCase().regex(ZONE_ID, "A zone ID is 32 characters of 0-9 and a-f.");
const zCloudflareToken = string().trim().regex(TOKEN, "That does not look like a Cloudflare API token.");
const zCloudflareHostnames = array(string().trim().max(300)).max(CLOUDFLARE_HOSTNAMES_MAX).transform((hosts) => parseHostnames(hosts));
object({
  projectId: string(),
  /** Absent: the connection's stored token. */
  token: zCloudflareToken.optional()
});
object({
  projectId: string(),
  /** Absent: keep the connection's stored token (changing zone or hostnames). */
  token: zCloudflareToken.optional(),
  zoneId: zCloudflareZoneId,
  /** Empty: every hostname in the zone. */
  hostnames: zCloudflareHostnames
});
const AI_ANSWER_PROVIDERS = ["openai", "anthropic"];
const AI_ANSWER_PROVIDER_LABELS = {
  openai: "ChatGPT",
  anthropic: "Claude"
};
const AI_ANSWER_PROMPTS_MAX = 10;
const AI_ANSWER_BRAND_NAMES_MAX = 5;
const AI_ANSWER_DOMAINS_MAX = 5;
const AI_ANSWER_COMPETITORS_MAX = 10;
const AI_ANSWER_PROMPT_MIN_LENGTH = 3;
const AI_ANSWER_PROMPT_MAX_LENGTH = 300;
const AI_ANSWER_TERM_MAX_LENGTH = 80;
function uniqueTerms(terms) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const raw of terms) {
    const term = raw.trim().replace(/\s+/g, " ");
    const key = term.toLowerCase();
    if (term && !seen.has(key)) {
      seen.add(key);
      out.push(term);
    }
  }
  return out;
}
const zTerms = (max) => array(string().max(AI_ANSWER_TERM_MAX_LENGTH)).transform(uniqueTerms).pipe(array(string()).max(max));
object({
  projectId: string(),
  brandNames: zTerms(AI_ANSWER_BRAND_NAMES_MAX).pipe(
    array(string()).min(1, "Add the name your brand is known by.")
  ),
  brandDomains: array(string().max(300)).transform((hosts) => parseHostnames(hosts)).pipe(array(string()).max(AI_ANSWER_DOMAINS_MAX)),
  competitors: zTerms(AI_ANSWER_COMPETITORS_MAX),
  /** Empty: every provider the workspace has a key for. */
  providers: array(_enum(AI_ANSWER_PROVIDERS)).transform((list) => [...new Set(list)]),
  enabled: boolean()
});
object({
  projectId: string(),
  prompt: string().trim().min(AI_ANSWER_PROMPT_MIN_LENGTH, "Write the question in a few words.").max(AI_ANSWER_PROMPT_MAX_LENGTH)
});
const AI_ANSWERS_DOCS_URL = "https://docs.flarepanel.dev/tracking/ai-answers";
function percent(rate) {
  return rate === null ? "—" : `${Math.round(rate * 100)}%`;
}
function rank(position) {
  if (position === null) {
    return "—";
  }
  return `#${Number.isInteger(position) ? position : position.toFixed(1)}`;
}
function splitTerms(text) {
  return text.split(/[,\n]/).map((term) => term.trim()).filter(Boolean);
}
function splitPrompts(text) {
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}
function providersToAsk(tracker, keys) {
  const withKey = AI_ANSWER_PROVIDERS.filter((provider) => keys[provider]);
  const chosen = tracker?.providers.length ? tracker.providers : withKey;
  return chosen.filter((provider) => keys[provider]);
}
function runStatusText(tracker) {
  switch (tracker.lastRunStatus) {
    case "running":
      return { text: "Checking answers now…", tone: "muted" };
    case "success":
      return { text: "All answers checked", tone: "muted" };
    case "partial":
      return { text: "Some answers failed", tone: "error" };
    case "error":
      return { text: "The last check failed", tone: "error" };
    case "no_key":
      return { text: "No AI key to check with", tone: "error" };
    default:
      return {
        text: tracker.enabled ? "Not checked yet" : "Paused",
        tone: "muted"
      };
  }
}
const RUNNING_REFETCH_MS = 1e4;
const HTTP_URL = /^https?:\/\//i;
function useAiAnswers(projectId) {
  const trpc = useTRPC();
  const setup = useQuery(
    trpc.aiAnswers.getSetup.queryOptions(
      { projectId },
      {
        refetchInterval: (query) => query.state.data?.tracker?.lastRunStatus === "running" ? RUNNING_REFETCH_MS : false
      }
    )
  );
  const running = setup.data?.tracker?.lastRunStatus === "running";
  const summary = useQuery(
    trpc.aiAnswers.summary.queryOptions(
      { projectId },
      {
        enabled: Boolean(setup.data?.tracker),
        refetchInterval: running ? RUNNING_REFETCH_MS : false
      }
    )
  );
  return { setup, summary };
}
function useRefresh() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries(trpc.aiAnswers.getSetup.pathFilter()),
    queryClient.invalidateQueries(trpc.aiAnswers.summary.pathFilter())
  ]);
}
function AiAnswersCard({
  projectId,
  organizationId
}) {
  const { setup, summary } = useAiAnswers(projectId);
  const [editing, setEditing] = reactExports.useState(false);
  const data = setup.data;
  const tracker = data?.tracker ?? null;
  const hasKey = Boolean(data && (data.keys.openai || data.keys.anthropic));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-labelledby": "ai-answers", className: "card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "h2",
          {
            className: "flex items-center gap-2 font-medium text-sm",
            id: "ai-answers",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquareQuote, { className: "size-4 text-muted-foreground" }),
              "AI answers",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Beta" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Whether ChatGPT and Claude name you when people ask. Checked daily with web search, on your workspace’s own AI key." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        tracker && !editing && data && /* @__PURE__ */ jsxRuntimeExports.jsx(RunNowButton, { projectId, setup: data }),
        tracker && !editing && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            icon: Settings,
            onClick: () => setEditing(true),
            size: "sm",
            variant: "ghost",
            children: "Settings"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            className: "flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground",
            href: AI_ANSWERS_DOCS_URL,
            rel: "noopener noreferrer",
            target: "_blank",
            children: [
              "How it works",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-3" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: setup.isLoading || !data ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      !hasKey && /* @__PURE__ */ jsxRuntimeExports.jsx(NoKeyNotice, { organizationId }),
      !tracker || editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsForm,
        {
          hasKey,
          onCancel: tracker ? () => setEditing(false) : void 0,
          onDone: () => setEditing(false),
          projectId,
          setup: data
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        Results,
        {
          isLoading: summary.isLoading,
          projectId,
          setup: data,
          summary: summary.data
        }
      )
    ] }) })
  ] });
}
function NoKeyNotice({ organizationId }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed p-3 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Answers are checked with your own OpenAI or Anthropic key, so your provider bills the few calls a day directly. Add a key to start." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      LinkButton,
      {
        params: { organizationId },
        size: "sm",
        to: "/$organizationId/settings",
        variant: "outline",
        children: "Add an AI key"
      }
    )
  ] });
}
function RunNowButton({
  projectId,
  setup
}) {
  const trpc = useTRPC();
  const refresh = useRefresh();
  const runNow = useMutation(
    trpc.aiAnswers.runNow.mutationOptions({
      onSuccess() {
        Ut.success("Checking answers", {
          description: "Results show up here in a minute or two."
        });
        refresh();
      },
      onError: handleError
    })
  );
  const running = setup.tracker?.lastRunStatus === "running";
  const wait = setup.nextRunNowAt ? new Date(setup.nextRunNowAt) : null;
  const disabled = running || setup.prompts.length === 0 || providersToAsk(setup.tracker, setup.keys).length === 0 || Boolean(wait && wait.getTime() > Date.now());
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      disabled,
      icon: Play,
      loading: runNow.isPending || running,
      onClick: () => runNow.mutate({ projectId }),
      size: "sm",
      title: wait ? `You can check again ${formatTimeAgoOrDateTime(wait)}` : "Ask every prompt now",
      variant: "outline",
      children: "Check now"
    }
  );
}
function SettingsForm({
  projectId,
  setup,
  hasKey,
  onCancel,
  onDone
}) {
  const trpc = useTRPC();
  const refresh = useRefresh();
  const ids = {
    brand: reactExports.useId(),
    domains: reactExports.useId(),
    competitors: reactExports.useId(),
    prompts: reactExports.useId()
  };
  const tracker = setup.tracker;
  const [brand, setBrand] = reactExports.useState(
    (tracker?.brandNames ?? setup.defaults.brandNames).join(", ")
  );
  const [domains, setDomains] = reactExports.useState(
    (tracker?.brandDomains ?? setup.defaults.brandDomains).join(", ")
  );
  const [competitors, setCompetitors] = reactExports.useState(
    (tracker?.competitors ?? []).join(", ")
  );
  const [providers, setProviders] = reactExports.useState(
    tracker?.providers.length ? tracker.providers : AI_ANSWER_PROVIDERS.filter((provider) => setup.keys[provider])
  );
  const [enabled, setEnabled] = reactExports.useState(tracker?.enabled ?? true);
  const [prompts, setPrompts] = reactExports.useState("");
  const save = useMutation(trpc.aiAnswers.saveSettings.mutationOptions());
  const addPrompt = useMutation(trpc.aiAnswers.addPrompt.mutationOptions());
  const runNow = useMutation(trpc.aiAnswers.runNow.mutationOptions());
  const firstSetup = !tracker;
  const newPrompts = splitPrompts(prompts).slice(0, AI_ANSWER_PROMPTS_MAX);
  const asked = providers.filter((provider) => setup.keys[provider]);
  const submit = async () => {
    try {
      await save.mutateAsync({
        projectId,
        brandNames: splitTerms(brand),
        brandDomains: splitTerms(domains),
        competitors: splitTerms(competitors),
        providers,
        enabled
      });
      for (const prompt of newPrompts) {
        await addPrompt.mutateAsync({ projectId, prompt });
      }
      if (firstSetup && hasKey && newPrompts.length > 0 && asked.length > 0) {
        await runNow.mutateAsync({ projectId });
        Ut.success("Tracking started", {
          description: "The first answers show up here in a minute or two."
        });
      } else {
        Ut.success("Saved");
      }
      await refresh();
      onDone();
    } catch (error) {
      handleError(error);
      await refresh();
    }
  };
  const busy = save.isPending || addPrompt.isPending || runNow.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      className: "space-y-4",
      onSubmit: (event) => {
        event.preventDefault();
        submit();
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: ids.brand, children: "Your brand" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: ids.brand,
                onChange: (event) => setBrand(event.target.value),
                placeholder: "Acme, Acme Analytics",
                value: brand
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Names people use for you, comma separated." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: ids.domains, children: "Your domains" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: ids.domains,
                onChange: (event) => setDomains(event.target.value),
                placeholder: "acme.com",
                value: domains
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "A source on these counts as your site." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: ids.competitors, children: "Competitors" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: ids.competitors,
                onChange: (event) => setCompetitors(event.target.value),
                placeholder: "Plausible, Fathom, PostHog",
                value: competitors
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Up to 10. Your rank is your place among the brands an answer names." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "mb-1 font-medium text-sm", children: "Ask" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4", children: [
            AI_ANSWER_PROVIDERS.map((provider) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              ProviderCheckbox,
              {
                checked: providers.includes(provider),
                hasKey: setup.keys[provider],
                onChange: (checked) => setProviders(
                  (list) => checked ? [.../* @__PURE__ */ new Set([...list, provider])] : list.filter((p) => p !== provider)
                ),
                provider
              },
              provider
            )),
            tracker && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: enabled,
                  onCheckedChange: (value) => setEnabled(value === true)
                }
              ),
              "Check daily"
            ] })
          ] })
        ] }),
        setup.prompts.length < AI_ANSWER_PROMPTS_MAX && firstSetup && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: ids.prompts, children: "Prompts to track" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: ids.prompts,
              onChange: (event) => setPrompts(event.target.value),
              placeholder: "What is the best privacy-friendly analytics tool?\nWhich analytics tools run on Cloudflare?",
              rows: 4,
              value: prompts
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs", children: [
            "One question per line, the way your customers would ask it. Up to",
            " ",
            AI_ANSWER_PROMPTS_MAX,
            ".",
            " ",
            asked.length > 0 ? `Each check asks every prompt once per assistant: ${newPrompts.length * asked.length} calls a day on your key.` : "Checks start once the workspace has an AI key."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              disabled: splitTerms(brand).length === 0,
              loading: busy,
              type: "submit",
              children: firstSetup ? "Start tracking" : "Save"
            }
          ),
          onCancel && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onCancel, type: "button", variant: "ghost", children: "Cancel" })
        ] })
      ]
    }
  );
}
function ProviderCheckbox({
  provider,
  checked,
  hasKey,
  onChange
}) {
  const id = reactExports.useId();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Checkbox,
      {
        checked: checked && hasKey,
        disabled: !hasKey,
        id,
        onCheckedChange: (value) => onChange(value === true)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "mb-0 cursor-pointer", htmlFor: id, children: [
      AI_ANSWER_PROVIDER_LABELS[provider],
      !hasKey && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 font-normal text-muted-foreground text-xs", children: [
        "(needs an ",
        provider === "openai" ? "OpenAI" : "Anthropic",
        " key)"
      ] })
    ] })
  ] });
}
function Results({
  projectId,
  setup,
  summary,
  isLoading
}) {
  const tracker = setup.tracker;
  if (!tracker) {
    return null;
  }
  const status = runStatusText(tracker);
  const brandName = tracker.brandNames[0] ?? "You";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: status.tone === "error" ? "text-destructive" : "", children: status.text }),
      tracker.lastRunAt && tracker.lastRunStatus !== "running" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Last check ",
        formatTimeAgoOrDateTime(new Date(tracker.lastRunAt))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Last ",
        summary?.days ?? 30,
        " days"
      ] })
    ] }),
    tracker.lastRunError && tracker.lastRunStatus !== "running" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mt-0.5 size-3.5 shrink-0 text-destructive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "break-words", children: tracker.lastRunError })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Kpi,
        {
          isLoading,
          label: `Answers naming ${brandName}`,
          value: percent(summary?.mentionRate ?? null)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Kpi,
        {
          isLoading,
          label: "Average rank when named",
          value: rank(summary?.avgPosition ?? null)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Kpi,
        {
          isLoading,
          label: "Answers using your site",
          value: percent(summary?.citationRate ?? null)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Kpi,
        {
          isLoading,
          label: "Answers checked",
          value: (summary?.answers ?? 0).toLocaleString()
        }
      )
    ] }),
    summary && summary.answers > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShareOfVoice, { summary }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CitedDomains, { summary })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PromptsTable, { projectId, setup, summary })
  ] });
}
function Kpi({
  label,
  value,
  isLoading
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-muted-foreground text-xs", children: label }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mt-1 h-7 w-16" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-2xl tabular-nums", children: value })
  ] });
}
function ShareOfVoice({ summary }) {
  const max = Math.max(1, ...summary.shareOfVoice.map((row) => row.answers));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-medium text-xs", children: "Named in answers" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 text-xs", children: summary.shareOfVoice.slice(0, 8).map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `w-28 shrink-0 truncate ${row.own ? "font-medium" : ""}`,
          children: row.name
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 flex-1 overflow-hidden rounded-sm bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `block h-full rounded-sm ${row.own ? "bg-primary" : "bg-muted-foreground/50"}`,
          style: { width: `${row.answers / max * 100}%` }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-16 shrink-0 text-right text-muted-foreground tabular-nums", children: [
        row.answers,
        " of ",
        summary.answers
      ] })
    ] }, row.name)) })
  ] });
}
function CitedDomains({ summary }) {
  if (summary.topCitedDomains.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-medium text-xs", children: "Sources the answers used" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "No sources yet." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-medium text-xs", children: "Sources the answers used" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 text-xs", children: summary.topCitedDomains.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "li",
      {
        className: "flex items-center justify-between gap-2",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `truncate ${row.own ? "font-medium" : ""}`, children: [
            row.domain,
            row.own && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "ml-2", variant: "success", children: "Yours" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-muted-foreground tabular-nums", children: row.answers })
        ]
      },
      row.domain
    )) })
  ] });
}
function PromptsTable({
  projectId,
  setup,
  summary
}) {
  const trpc = useTRPC();
  const refresh = useRefresh();
  const inputId = reactExports.useId();
  const [draft, setDraft] = reactExports.useState("");
  const [open, setOpen] = reactExports.useState(null);
  const addPrompt = useMutation(
    trpc.aiAnswers.addPrompt.mutationOptions({
      onSuccess() {
        setDraft("");
        refresh();
      },
      onError: handleError
    })
  );
  const removePrompt = useMutation(
    trpc.aiAnswers.removePrompt.mutationOptions({
      onSuccess: () => refresh(),
      onError: handleError
    })
  );
  const providers = providersToAsk(setup.tracker, setup.keys);
  const columns = providers.length > 0 ? providers : AI_ANSWER_PROVIDERS;
  const byId = new Map((summary?.prompts ?? []).map((row) => [row.id, row]));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 font-medium text-xs", children: [
      "Prompts (",
      setup.prompts.length,
      " of ",
      AI_ANSWER_PROMPTS_MAX,
      ")"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-md border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-muted-foreground text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium", children: "Prompt" }),
        columns.map((provider) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium", children: AI_ANSWER_PROVIDER_LABELS[provider] }, provider)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium", children: "Named" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-8" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        setup.prompts.map((prompt) => {
          const row = byId.get(prompt.id);
          const latest = new Map(
            (row?.latest ?? []).map((answer) => [answer.provider, answer])
          );
          const expanded = open === prompt.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            PromptRow,
            {
              answers: columns.map((provider) => latest.get(provider)),
              columns: columns.length,
              expanded,
              mentionRate: row?.mentionRate ?? null,
              onRemove: () => removePrompt.mutate({ projectId, promptId: prompt.id }),
              onToggle: () => setOpen(expanded ? null : prompt.id),
              prompt: prompt.prompt
            },
            prompt.id
          );
        }),
        setup.prompts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "td",
          {
            className: "px-3 py-4 text-muted-foreground text-xs",
            colSpan: columns.length + 3,
            children: "Add the questions your customers ask an assistant."
          }
        ) })
      ] })
    ] }) }),
    setup.prompts.length < AI_ANSWER_PROMPTS_MAX && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        className: "mt-3 flex gap-2",
        onSubmit: (event) => {
          event.preventDefault();
          if (draft.trim()) {
            addPrompt.mutate({ projectId, prompt: draft });
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "sr-only", htmlFor: inputId, children: "New prompt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: inputId,
              onChange: (event) => setDraft(event.target.value),
              placeholder: "Add a prompt, e.g. Which analytics tools are GDPR friendly?",
              value: draft
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              disabled: !draft.trim(),
              icon: Plus,
              loading: addPrompt.isPending,
              type: "submit",
              variant: "outline",
              children: "Add"
            }
          )
        ]
      }
    )
  ] });
}
function PromptRow({
  prompt,
  answers,
  columns,
  mentionRate,
  expanded,
  onToggle,
  onRemove
}) {
  const hasAnswers = answers.some(Boolean);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "align-top", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          "aria-expanded": expanded,
          className: "flex items-start gap-1.5 text-left disabled:cursor-default",
          disabled: !hasAnswers,
          onClick: onToggle,
          type: "button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ChevronDown,
              {
                className: `mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform ${expanded ? "" : "-rotate-90"} ${hasAnswers ? "" : "opacity-0"}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: prompt })
          ]
        }
      ) }),
      answers.map((answer, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnswerCell, { answer }) }, answer?.provider ?? index)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right tabular-nums", children: percent(mentionRate) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-1 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          "aria-label": "Remove prompt",
          onClick: onRemove,
          size: "icon",
          variant: "ghost",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3.5" })
        }
      ) })
    ] }),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-muted/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "space-y-3 px-3 py-3", colSpan: columns + 3, children: answers.filter(Boolean).map((answer) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      AnswerDetail,
      {
        answer
      },
      answer?.provider
    )) }) })
  ] });
}
function AnswerCell({ answer }) {
  if (!answer) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "Not checked" });
  }
  if (answer.error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "span",
      {
        className: "flex items-center gap-1 text-destructive text-xs",
        title: answer.error,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-3.5" }),
          "Failed"
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-xs", children: [
    answer.mentioned ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 font-medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5 text-emerald-600" }),
      rank(answer.position)
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "size-3.5" }),
      "Not named"
    ] }),
    answer.ownCited && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Your site" })
  ] });
}
function AnswerDetail({ answer }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 font-medium", children: [
      AI_ANSWER_PROVIDER_LABELS[answer.provider],
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 font-normal text-muted-foreground", children: [
        answer.day,
        answer.model ? ` · ${answer.model}` : ""
      ] })
    ] }),
    answer.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: answer.error }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: answer.excerpt || "The answer was empty." }),
      answer.competitors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Also named: " }),
        answer.competitors.join(", ")
      ] }),
      answer.citations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1 flex flex-wrap gap-x-3 gap-y-0.5", children: answer.citations.filter((url) => HTTP_URL.test(url)).slice(0, 8).map((url) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          className: "underline underline-offset-2 hover:text-foreground",
          href: url,
          rel: "noopener noreferrer nofollow",
          target: "_blank",
          children: safeHost(url)
        }
      ) }, url)) })
    ] })
  ] });
}
function safeHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
const BOTS_DOCS_URL = "https://docs.flarepanel.dev/tracking/ai-crawlers";
const CLOUDFLARE_DOCS_URL = `${BOTS_DOCS_URL}#connect-cloudflare-no-code`;
const BOT_GROUP_SERIES = ["answers", "indexing", "training", "search", "other"].map((key, index) => ({
  key,
  label: BOT_GROUP_LABELS[key],
  color: getChartColor(index)
}));
function botGroupLabel(group) {
  return BOT_GROUP_LABELS[group] ?? "";
}
function botGroupColor(group) {
  return BOT_GROUP_SERIES.find((series) => series.key === group)?.color ?? getChartColor(0);
}
function toBotChartData(series) {
  return series.map((day) => ({
    date: `${day.date}T00:00:00`,
    total: day.total,
    ai: day.ai,
    answers: day.answers,
    indexing: day.indexing,
    training: day.training,
    search: day.search,
    other: day.other
  }));
}
function displayBotPath(path) {
  try {
    const url = new URL(path);
    return `${url.hostname}${url.pathname}`;
  } catch {
    return path;
  }
}
function isBotsPageEmpty({
  stats,
  recentCount
}) {
  return (stats?.totals.total ?? 0) === 0 && (recentCount ?? 0) === 0;
}
function botVerifiedFilter(verifiedOnly) {
  if (verifiedOnly === null) {
    return "auto";
  }
  return verifiedOnly ? "verified" : "all";
}
const USAGE_WARNING_SHARE = 0.8;
function monthName(month) {
  const date = /* @__PURE__ */ new Date(`${month}-01T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? month : date.toLocaleString("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
}
function botUsageNotice(usage) {
  if (!usage?.cap) {
    return null;
  }
  const cap = usage.cap.toLocaleString("en");
  const month = monthName(usage.month);
  if (usage.capped) {
    return {
      level: "capped",
      title: "Monthly bot allowance reached",
      description: `This project recorded ${cap} bot hits in ${month}, its monthly allowance. New hits are not stored until next month, so the numbers below stop there.`
    };
  }
  if (usage.hits >= usage.cap * USAGE_WARNING_SHARE) {
    return {
      level: "near",
      title: "Close to the monthly bot allowance",
      description: `${usage.hits.toLocaleString("en")} of ${cap} bot hits used in ${month}. Past the allowance, new hits are not stored until next month.`
    };
  }
  return null;
}
function aiReferralSessions(rows) {
  return rows?.find((row) => row.name === "ai")?.sessions ?? 0;
}
const AI_REFERRER_FILTER = {
  id: "referrer-type-ai",
  name: "referrer_type",
  operator: "is",
  value: ["ai"]
};
function botDataSource(stats, cloudflareConnected) {
  const snippet = (stats?.sources?.snippet ?? 0) > 0;
  const cloudflare = (stats?.sources?.cloudflare ?? 0) > 0 || cloudflareConnected;
  if (snippet && cloudflare) {
    return "both";
  }
  if (cloudflare) {
    return "cloudflare";
  }
  return snippet ? "snippet" : "none";
}
const BOT_DATA_SOURCE_LABELS = {
  snippet: "Server snippet",
  cloudflare: "Cloudflare",
  both: "Server snippet + Cloudflare",
  none: "Not set up"
};
function cloudflareSyncSummary(connection) {
  switch (connection.lastSyncStatus) {
    case "success": {
      const hits = connection.lastSyncHits ?? 0;
      return {
        tone: "ok",
        text: hits > 0 ? `Imported about ${hits.toLocaleString("en")} crawler hits` : "No new crawler hits"
      };
    }
    case "auth_error":
      return { tone: "error", text: "Cloudflare rejected the token" };
    case "rate_limited":
      return {
        tone: "error",
        text: "Cloudflare rate limit reached; retrying shortly"
      };
    case "error":
      return { tone: "error", text: "The last sync failed" };
    default:
      return { tone: "pending", text: "First sync queued" };
  }
}
function botGroupMix(totals) {
  const total = totals?.total ?? 0;
  return BOT_GROUP_SERIES.map((group) => {
    const hits = totals?.[group.key] ?? 0;
    return { ...group, hits, share: total > 0 ? hits / total : 0 };
  });
}
function formatShare(part, whole) {
  if (!(whole > 0) || part <= 0) {
    return "0%";
  }
  const percent2 = part / whole * 100;
  if (percent2 < 1) {
    return "<1%";
  }
  return `${Math.round(percent2)}%`;
}
function botErrorSummary(paths) {
  let errors = 0;
  let reported = 0;
  for (const path of paths ?? []) {
    const {
      "2xx": ok,
      "3xx": moved,
      "4xx": client,
      "5xx": server
    } = path.status;
    errors += client + server;
    reported += ok + moved + client + server;
  }
  return { errors, reported };
}
const TOP_ROWS = 5;
function AiVisibility({
  projectId,
  stats,
  isLoading
}) {
  const trpc = useTRPC();
  const { range, startDate, endDate } = useOverviewOptions();
  const period = { projectId, range, startDate, endDate };
  const typesQuery = useQuery(
    trpc.overview.topGeneric.queryOptions({
      ...period,
      filters: [],
      column: "referrer_type"
    })
  );
  const aiSessions = aiReferralSessions(typesQuery.data);
  const sourcesQuery = useQuery(
    trpc.overview.topGeneric.queryOptions(
      { ...period, filters: [AI_REFERRER_FILTER], column: "referrer_name" },
      { enabled: aiSessions > 0 }
    )
  );
  const aiBots = (stats?.topBots ?? []).filter((bot) => isAiBotGroup(bot.group)).slice(0, TOP_ROWS);
  const sources = (sourcesQuery.data ?? []).slice(0, TOP_ROWS);
  const answers = stats?.totals.answers ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-labelledby": "ai-visibility", className: "card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-medium text-sm", id: "ai-visibility", children: "AI visibility" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "What AI crawlers and assistants read, and the people AI answers sent you, in the same period." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 divide-y md:grid-cols-[1fr_auto_1fr] md:divide-x md:divide-y-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Figure,
          {
            isLoading,
            label: "AI crawler and assistant hits",
            note: `${answers.toLocaleString()} fetched for an answer someone asked for`,
            value: stats?.totals.ai ?? 0
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-2 text-xs", children: [
          aiBots.map((bot) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: "flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "size-2 shrink-0 rounded-sm",
                    style: { backgroundColor: botGroupColor(bot.group) }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: bot.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-muted-foreground", children: botGroupLabel(bot.group) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto tabular-nums", children: bot.hits.toLocaleString() })
              ]
            },
            `${bot.name}:${bot.category}`
          )),
          !isLoading && aiBots.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-muted-foreground", children: "No AI crawler hits in this period" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden items-center px-2 text-muted-foreground md:flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { "aria-hidden": true, className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Figure,
          {
            isLoading: typesQuery.isLoading,
            label: "Visits from AI answers",
            note: "Sessions referred by ChatGPT, Perplexity, Claude, Gemini and others",
            value: aiSessions
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-2 text-xs", children: [
          sources.map((source) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: source.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: source.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto tabular-nums", children: source.sessions.toLocaleString() })
          ] }, source.name)),
          sourcesQuery.isLoading && aiSessions > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-2/3" }) }),
          !typesQuery.isLoading && aiSessions === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-muted-foreground", children: "No visits from AI answers in this period" })
        ] })
      ] })
    ] })
  ] });
}
function Figure({
  label,
  value,
  note,
  isLoading
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs", children: label }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mt-1 h-8 w-24" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-2xl tabular-nums", children: value.toLocaleString() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs", children: note })
  ] });
}
const BAR_RADIUS = 4;
const STACK_GAP = 2;
const MAX_BAR_WIDTH = 48;
const MARGIN = { top: 8, right: 16, bottom: 32, left: 40 };
function BotsChart({
  series,
  isLoading
}) {
  const number = useNumber();
  const data = reactExports.useMemo(() => toBotChartData(series), [series]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card flex h-full flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: "Bot hits per day" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[280px] w-full flex-1 p-4", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-full w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
      ComposedChart,
      {
        animationDuration: 0,
        aspectRatio: "auto",
        className: "h-full",
        data,
        margin: MARGIN,
        maxBarSize: MAX_BAR_WIDTH,
        stacked: true,
        stackGap: STACK_GAP,
        xDataKey: "date",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { horizontal: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { formatValue: (value) => number.short(value), numTicks: 4 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, {}),
          BOT_GROUP_SERIES.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            SeriesBar,
            {
              animate: false,
              dataKey: group.key,
              fill: group.color,
              radius: BAR_RADIUS
            },
            group.key
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            OPChartTooltip,
            {
              interval: "day",
              rows: (point) => BOT_GROUP_SERIES.map((group) => ({
                color: group.color,
                label: group.label,
                value: point[group.key]
              })),
              showCrosshair: false,
              showDots: false
            }
          )
        ]
      }
    ) })
  ] });
}
const SEGMENT_MIN_PERCENT = 1.5;
function BotsMix({
  stats,
  isLoading
}) {
  const mix = botGroupMix(stats?.totals);
  const total = stats?.totals.total ?? 0;
  const { errors, reported } = botErrorSummary(stats?.topPaths);
  const verified = stats?.verifiedHits ?? 0;
  const allHits = stats?.allHits ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      "aria-labelledby": "bots-mix",
      className: "card flex flex-col overflow-hidden",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", id: "bots-mix", children: "What they came for" }) }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-2.5 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-2/3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/5" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              "aria-hidden": true,
              className: "flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-def-200",
              children: mix.filter((row) => row.hits > 0).map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "h-full first:rounded-l-full last:rounded-r-full",
                  style: {
                    backgroundColor: row.color,
                    width: `${Math.max(row.share * 100, SEGMENT_MIN_PERCENT)}%`
                  }
                },
                row.key
              ))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 mb-4 space-y-2.5 text-sm", children: mix.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "size-2 shrink-0 rounded-sm",
                style: { backgroundColor: row.color }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: row.hits > 0 ? "truncate" : "truncate text-muted-foreground",
                children: row.label
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto font-medium tabular-nums", children: row.hits.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-10 text-right text-muted-foreground text-xs tabular-nums", children: formatShare(row.hits, total) })
          ] }, row.key)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "mt-auto grid grid-cols-2 gap-4 border-t pt-4 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("dt", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  BadgeCheck,
                  {
                    "aria-hidden": true,
                    className: "size-3.5 text-emerald-600"
                  }
                ),
                "Verified"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "dd",
                {
                  className: "mt-1 font-semibold text-base tabular-nums",
                  title: `${verified.toLocaleString()} of ${allHits.toLocaleString()} hits were confirmed as the real crawler by your edge`,
                  children: formatShare(verified, allHits)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("dt", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TriangleAlert,
                  {
                    "aria-hidden": true,
                    className: errors > 0 ? "size-3.5 text-destructive" : "size-3.5"
                  }
                ),
                "Got an error"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "dd",
                {
                  className: "mt-1 font-semibold text-base tabular-nums",
                  title: reported > 0 ? `${errors.toLocaleString()} of ${reported.toLocaleString()} answers on the crawled pages below were 4xx or 5xx` : "No response status was reported in this period",
                  children: reported > 0 ? formatShare(errors, reported) : "n/a"
                }
              )
            ] })
          ] })
        ] })
      ]
    }
  );
}
const RECENT_PAGE_SIZE = 20;
const LOADING_ROWS$1 = [1, 2, 3, 4, 5, 6];
const ERROR_STATUS_FROM = 400;
const GRID = "grid grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)_auto] items-center gap-x-4 px-4 sm:grid-cols-[minmax(0,11rem)_minmax(0,9rem)_minmax(0,1fr)_3.5rem_6.5rem]";
function StatusPill({ status }) {
  if (status == null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "-" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "inline-flex min-w-9 justify-center rounded px-1.5 py-0.5 font-medium tabular-nums",
        status >= ERROR_STATUS_FROM ? "bg-destructive/10 text-destructive" : "bg-def-200 text-muted-foreground"
      ),
      children: status
    }
  );
}
function RecentHits({
  rows,
  count,
  page,
  isLoading,
  onPageChange
}) {
  const pageCount = Math.max(Math.ceil(count / RECENT_PAGE_SIZE), 1);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-labelledby": "bots-latest", className: "card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 border-b px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", id: "bots-latest", children: "Latest hits" }),
        count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs tabular-nums", children: [
          count.toLocaleString(),
          " kept"
        ] })
      ] }),
      count > RECENT_PAGE_SIZE && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pagination,
        {
          canNextPage: page < pageCount - 1,
          canPreviousPage: page > 0,
          nextPage: () => onPageChange(Math.min(page + 1, pageCount - 1)),
          pageIndex: page,
          previousPage: () => onPageChange(Math.max(page - 1, 0))
        }
      )
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 p-4", children: LOADING_ROWS$1.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-full" }, row)) }),
    !isLoading && rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-4 py-10 text-center text-muted-foreground text-xs", children: "No bot hits kept yet" }),
    !isLoading && rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: cn(
            GRID,
            "border-b bg-def-100 py-2 font-medium text-[11px] text-muted-foreground uppercase tracking-wide"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Bot" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:block", children: "Came for" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Page" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden text-right sm:block", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right", children: "When" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: rows.map((row) => {
        const group = botGroup(row.name, row.type);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "li",
          {
            className: cn(GRID, "py-2.5 hover:bg-def-100"),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex min-w-0 items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "size-2 shrink-0 rounded-sm",
                    style: { backgroundColor: botGroupColor(group) }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: row.name }),
                row.verified && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  BadgeCheck,
                  {
                    "aria-label": "Verified",
                    className: "size-3.5 shrink-0 text-emerald-600"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "hidden truncate text-muted-foreground sm:block",
                  title: `Detected as: ${row.type}`,
                  children: botGroupLabel(group)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex min-w-0 items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", title: row.path, children: displayBotPath(row.path) }),
                row.source === "cloudflare" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "shrink-0 rounded border px-1 text-[10px] text-muted-foreground",
                    title: "A sample from the hourly Cloudflare import, not a single reported hit",
                    children: "Cloudflare"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden text-right sm:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: row.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-right text-muted-foreground tabular-nums", children: formatTimeAgoOrDateTime(new Date(row.createdAt)) })
            ]
          },
          row.id
        );
      }) })
    ] })
  ] });
}
const CLOUDFLARE_TOKENS_URL = "https://dash.cloudflare.com/profile/api-tokens";
const PENDING_REFETCH_MS = 1e4;
function useCloudflareSetup(projectId) {
  const trpc = useTRPC();
  return useQuery(
    trpc.cloudflareAnalytics.getSetup.queryOptions(
      { projectId },
      {
        // Poll while a first sync is pending, so the card updates by itself.
        refetchInterval: (query) => query.state.data?.connection && !query.state.data.connection.lastSyncedAt ? PENDING_REFETCH_MS : false
      }
    )
  );
}
function CloudflareConnectCard({
  projectId,
  setup
}) {
  const [editing, setEditing] = reactExports.useState(false);
  const connection = setup.connection;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 border-b px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 font-medium text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { className: "size-4 text-muted-foreground" }),
        "Cloudflare",
        connection ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "success", children: "Connected" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "No code needed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          className: "flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground",
          href: CLOUDFLARE_DOCS_URL,
          rel: "noopener noreferrer",
          target: "_blank",
          children: [
            "How it works",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-3" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: setup.available ? connection && !editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConnectedView,
      {
        connection,
        onEdit: () => setEditing(true),
        projectId
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConnectForm,
      {
        connection,
        defaultHostnames: setup.defaultHostnames,
        onCancel: connection ? () => setEditing(false) : void 0,
        onDone: () => setEditing(false),
        projectId
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Importing from Cloudflare needs the Cloudflare Workers deployment of FlarePanel, where bot traffic is kept." }) })
  ] });
}
function ConnectedView({
  projectId,
  connection,
  onEdit
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries(
    trpc.cloudflareAnalytics.getSetup.pathFilter()
  );
  const syncNow = useMutation(
    trpc.cloudflareAnalytics.syncNow.mutationOptions({
      onSuccess() {
        Ut.success("Sync queued", {
          description: "New crawler hits show up here in a minute or two."
        });
        setTimeout(refresh, PENDING_REFETCH_MS);
      },
      onError: handleError
    })
  );
  const disconnect = useMutation(
    trpc.cloudflareAnalytics.disconnect.mutationOptions({
      onSuccess() {
        Ut.success("Cloudflare disconnected", {
          description: "Imported hits stay until they expire after 30 days. Delete the token in Cloudflare too."
        });
        refresh();
      },
      onError: handleError
    })
  );
  const summary = cloudflareSyncSummary(connection);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Zone" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "truncate", children: connection.zoneName || connection.zoneId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Token" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "tabular-nums", children: [
        "····",
        connection.tokenHint
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Hostnames" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "truncate", children: connection.hostnames.length > 0 ? connection.hostnames.join(", ") : "Every hostname in the zone" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Last sync" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { children: [
        connection.lastSyncedAt ? `${formatTimeAgoOrDateTime(new Date(connection.lastSyncedAt))} · ` : "",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: summary.tone === "error" ? "text-destructive" : void 0,
            children: summary.text
          }
        )
      ] })
    ] }),
    connection.lastSyncError && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mt-0.5 size-3.5 shrink-0 text-destructive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "break-words", children: connection.lastSyncError })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Synced every hour. Cloudflare samples its analytics, so these numbers are estimates. Hours your server snippet reported keep the snippet's exact numbers." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          icon: RefreshCw,
          loading: syncNow.isPending,
          onClick: () => syncNow.mutate({ projectId }),
          size: "sm",
          variant: "outline",
          children: "Sync now"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onEdit, size: "sm", variant: "outline", children: "Change zone or token" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          loading: disconnect.isPending,
          onClick: () => disconnect.mutate({ projectId }),
          size: "sm",
          variant: "ghost",
          children: "Disconnect"
        }
      )
    ] })
  ] });
}
function ConnectForm({
  projectId,
  connection,
  defaultHostnames,
  onCancel,
  onDone
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const tokenId = reactExports.useId();
  const zoneId = reactExports.useId();
  const hostsId = reactExports.useId();
  const [token, setToken] = reactExports.useState("");
  const [zones, setZones] = reactExports.useState(null);
  const [listError, setListError] = reactExports.useState(null);
  const [zone, setZone] = reactExports.useState(connection?.zoneId ?? "");
  const [hostnames, setHostnames] = reactExports.useState(
    (connection?.hostnames ?? defaultHostnames).join(", ")
  );
  const listZones = useMutation(
    trpc.cloudflareAnalytics.listZones.mutationOptions({
      onSuccess(result) {
        setZones(result.zones);
        setListError(result.listError);
        const [only] = result.zones;
        if (!zone && only && result.zones.length === 1) {
          setZone(only.id);
        }
      },
      onError: handleError
    })
  );
  const connect = useMutation(
    trpc.cloudflareAnalytics.connect.mutationOptions({
      onSuccess() {
        Ut.success("Cloudflare connected", {
          description: "The first sync reads the last 7 days; crawler hits show up here in a few minutes."
        });
        setToken("");
        queryClient.invalidateQueries(
          trpc.cloudflareAnalytics.getSetup.pathFilter()
        );
        onDone();
      },
      onError: handleError
    })
  );
  const trimmedToken = token.trim();
  const canUseStoredToken = Boolean(connection) && !trimmedToken;
  const checked = zones !== null;
  const showZoneStep = checked || Boolean(connection);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      className: "space-y-4 text-sm",
      onSubmit: (event) => {
        event.preventDefault();
        if (!showZoneStep) {
          listZones.mutate({ projectId, token: trimmedToken });
          return;
        }
        connect.mutate({
          projectId,
          ...trimmedToken ? { token: trimmedToken } : {},
          zoneId: zone.trim(),
          hostnames: parseHostnames(hostnames)
        });
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          "On Cloudflare? Import AI crawler and search bot hits from your zone's analytics, no code on your site. Create a",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              className: "underline underline-offset-2 hover:text-foreground",
              href: CLOUDFLARE_TOKENS_URL,
              rel: "noopener noreferrer",
              target: "_blank",
              children: "custom API token"
            }
          ),
          " ",
          "with ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Zone → Analytics → Read" }),
          " (add",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Zone → Zone → Read" }),
          " to pick the zone from a list), for this zone only."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: tokenId, children: "API token" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                autoComplete: "off",
                className: "flex-1",
                id: tokenId,
                onChange: (event) => setToken(event.target.value),
                placeholder: connection ? `Keep the saved token ····${connection.tokenHint}` : "Paste the token",
                spellCheck: false,
                type: "password",
                value: token
              }
            ),
            showZoneStep && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                disabled: !(trimmedToken || canUseStoredToken),
                loading: listZones.isPending,
                onClick: () => listZones.mutate({
                  projectId,
                  ...trimmedToken ? { token: trimmedToken } : {}
                }),
                type: "button",
                variant: "outline",
                children: "List zones"
              }
            )
          ] })
        ] }),
        showZoneStep && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: zoneId, children: "Zone" }),
            zones && zones.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: setZone, value: zone, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: zoneId, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Pick the zone of this site" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: zones.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: item.id, children: item.name }, item.id)) })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                autoComplete: "off",
                id: zoneId,
                onChange: (event) => setZone(event.target.value),
                placeholder: "Zone ID (32 characters, on the zone's Overview page)",
                spellCheck: false,
                value: zone
              }
            ),
            listError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: listError }),
            zones && zones.length === 0 && !listError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "This token sees no zones. Enter the zone ID instead." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: hostsId, children: "Hostnames" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: hostsId,
                onChange: (event) => setHostnames(event.target.value),
                placeholder: "Every hostname in the zone",
                spellCheck: false,
                value: hostnames
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Only requests to these hostnames are imported, comma separated. Leave empty for every hostname in the zone." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          showZoneStep ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              disabled: !(zone.trim() && (trimmedToken || canUseStoredToken)),
              loading: connect.isPending,
              type: "submit",
              children: connection ? "Save" : "Connect"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              disabled: !trimmedToken,
              loading: listZones.isPending,
              type: "submit",
              children: "Continue"
            }
          ),
          onCancel && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onCancel, type: "button", variant: "ghost", children: "Cancel" })
        ] })
      ]
    }
  );
}
const TITLE = "Bots & AI crawlers";
const DESCRIPTION = "AI crawlers, assistants and search bots that fetched your pages, grouped by what they fetched for. Kept for 30 days and never counted as events.";
const KPIS = [{
  id: "total",
  label: "All bot hits"
}, {
  id: "answers",
  label: "AI answers"
}, {
  id: "indexing",
  label: "AI search indexing"
}, {
  id: "training",
  label: "AI training"
}, {
  id: "search",
  label: "Search engines"
}];
function Component() {
  const {
    projectId,
    organizationId
  } = Route.useParams();
  const trpc = useTRPC();
  const {
    range,
    startDate,
    endDate
  } = useOverviewOptions();
  const [recentPage, setRecentPage] = reactExports.useState(0);
  const [verifiedOnly, setVerifiedOnly] = reactExports.useState(null);
  const statsQuery = useQuery(trpc.event.botStats.queryOptions({
    projectId,
    range,
    startDate,
    endDate,
    verified: botVerifiedFilter(verifiedOnly)
  }, {
    placeholderData: keepPreviousData
  }));
  const recentQuery = useQuery(trpc.event.bots.queryOptions({
    projectId,
    cursor: recentPage,
    limit: RECENT_PAGE_SIZE
  }, {
    placeholderData: keepPreviousData
  }));
  const setupQuery = useCloudflareSetup(projectId);
  const cloudflare = setupQuery.data;
  const canConnectCloudflare = Boolean(cloudflare?.available);
  const stats = statsQuery.data;
  const isLoading = statsQuery.isLoading || recentQuery.isLoading;
  const header = /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedToggle, { checked: stats?.verifiedOnly ?? false, cloudflare: canConnectCloudflare, hasVerified: (stats?.verifiedHits ?? 0) > 0, onChange: setVerifiedOnly }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewRange, {})
  ] }), description: DESCRIPTION, title: TITLE });
  const notice = botUsageNotice(stats?.usage);
  if (statsQuery.isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
      header,
      /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { className: "mt-8", description: "We could not load bot traffic. Try again in a moment.", icon: Radar, title: "Bot traffic is unavailable", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { icon: RotateCw, loading: statsQuery.isFetching, onClick: () => statsQuery.refetch(), variant: "outline", children: "Try again" }) })
    ] });
  }
  if (!isLoading && isBotsPageEmpty({
    stats,
    recentCount: recentQuery.data?.count
  })) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
      header,
      /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { className: "mt-8", description: `AI crawlers such as GPTBot, ClaudeBot and PerplexityBot, and search bots like Googlebot, fetch your HTML without running JavaScript, so the FlarePanel script never sees them. Report page requests from your server or edge (a Cloudflare Worker, Next.js middleware)${canConnectCloudflare ? ", or connect your Cloudflare zone below," : ""} and they show up here.`, icon: Radar, title: "No bot traffic yet", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinkButton, { href: BOTS_DOCS_URL, icon: BookOpen, target: "_blank", children: "Set up crawler tracking" }) }),
      cloudflare && canConnectCloudflare && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mt-8 max-w-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudflareConnectCard, { projectId, setup: cloudflare }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AiAnswersCard, { organizationId, projectId }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
    header,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-8", children: [
      notice && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: notice.level === "capped" ? "warning" : "default", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: notice.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: notice.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ContextBar, { cloudflareConnected: Boolean(cloudflare?.connection), lastCloudflareSync: cloudflare?.connection?.lastSyncedAt ?? null, onShowAll: () => setVerifiedOnly(false), stats }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BotKpis, { isLoading: statsQuery.isLoading, range, stats }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-8 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BotsChart, { isLoading: statsQuery.isLoading, series: stats?.series ?? [] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BotsMix, { isLoading: statsQuery.isLoading, stats })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-8 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopBotsTable, { isLoading: statsQuery.isLoading, stats }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopPathsTable, { isLoading: statsQuery.isLoading, stats })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RecentHits, { count: recentQuery.data?.count ?? 0, isLoading: recentQuery.isLoading, onPageChange: setRecentPage, page: recentPage, rows: recentQuery.data?.data ?? [] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AiVisibility, { isLoading: statsQuery.isLoading, projectId, stats }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AiAnswersCard, { organizationId, projectId }),
      cloudflare && canConnectCloudflare && /* @__PURE__ */ jsxRuntimeExports.jsx(CloudflareConnectCard, { projectId, setup: cloudflare }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs", children: [
        "The FlarePanel script cannot see crawlers, which never run JavaScript.",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "underline underline-offset-2 hover:text-foreground", href: BOTS_DOCS_URL, rel: "noopener noreferrer", target: "_blank", children: "Report them from your server or edge" }),
        canConnectCloudflare ? " or connect Cloudflare." : "."
      ] })
    ] })
  ] });
}
function ContextBar({
  stats,
  cloudflareConnected,
  lastCloudflareSync,
  onShowAll
}) {
  const source = botDataSource(stats, cloudflareConnected);
  const usesCloudflare = source === "cloudflare" || source === "both";
  const hidden = stats?.verifiedOnly && stats.allHits > stats.verifiedHits ? stats.allHits - stats.verifiedHits : 0;
  if (source === "none" && hidden === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground text-xs", children: [
    source !== "none" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border bg-card px-2.5 py-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "size-1.5 rounded-full bg-emerald-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: BOT_DATA_SOURCE_LABELS[source] }),
      usesCloudflare && lastCloudflareSync && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "synced ",
        formatTimeAgoOrDateTime(new Date(lastCloudflareSync))
      ] })
    ] }),
    usesCloudflare && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: "Cloudflare analytics are sampled: imported counts are estimates. Hours the server snippet reported keep its exact numbers.", children: "Cloudflare numbers are sampled estimates" }),
    hidden > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { "aria-hidden": true, className: "size-3.5 text-emerald-600" }),
      "Verified hits only: ",
      hidden.toLocaleString(),
      " unverified hidden.",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "font-medium text-foreground underline underline-offset-2", onClick: onShowAll, type: "button", children: "Show all" })
    ] })
  ] });
}
function VerifiedToggle({
  checked,
  hasVerified,
  cloudflare,
  onChange
}) {
  const id = reactExports.useId();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", title: hasVerified ? "Only hits your edge confirmed as the real crawler" : `No verified hits in this period. ${cloudflare ? "Cloudflare Workers can send them" : "Your edge can send them with each hit"}: see the setup guide.`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked, disabled: !(hasVerified || checked), id, onCheckedChange: onChange }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-0 cursor-pointer text-sm", htmlFor: id, children: "Verified only" })
  ] });
}
function BotKpis({
  stats,
  isLoading,
  range
}) {
  const points = toBotChartData(stats?.series ?? []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card grid grid-cols-2 overflow-hidden rounded-md md:grid-cols-3 lg:grid-cols-5", children: KPIS.map((kpi) => /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetricCard, { data: points.map((point) => ({
    current: point[kpi.id],
    date: point.date
  })), id: `bots-${kpi.id}`, interval: "day", isLoading, label: kpi.label, metric: {
    current: stats?.totals[kpi.id] ?? 0,
    previous: null
  }, range }, kpi.id)) });
}
function CardHeader({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 border-b px-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: title }),
    children
  ] });
}
const LOADING_ROWS = [1, 2, 3, 4, 5];
function LoadingTable({
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewWidgetTable, { columns: [{
    name: label,
    width: "w-full",
    render: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-2/3" })
  }, {
    name: "Hits",
    width: "70px",
    render: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-10" })
  }], data: LOADING_ROWS, getColumnPercentage: () => 0, keyExtractor: String });
}
function EmptyRows({
  message
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-4 py-10 text-center text-muted-foreground text-xs", children: message });
}
function TopBotsTable({
  stats,
  isLoading
}) {
  const rows = stats?.topBots ?? [];
  const maxHits = Math.max(...rows.map((row) => row.hits), 1);
  const total = stats?.totals.total ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { title: "Bots", children: rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs tabular-nums", children: [
      rows.length.toLocaleString(),
      " seen"
    ] }) }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingTable, { label: "Bot" }),
    !isLoading && rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyRows, { message: "No bots in this period" }),
    !isLoading && rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewWidgetTable, { columns: [{
      name: "Bot",
      width: "w-full",
      render: (row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 shrink-0 rounded-sm", style: {
          backgroundColor: botGroupColor(row.group)
        }, title: botGroupLabel(row.group) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: row.name }),
        row.verifiedHits > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { "aria-label": "Verified", className: "size-3.5 shrink-0 text-emerald-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden truncate text-muted-foreground sm:inline", title: `Detected as: ${row.category}`, children: botGroupLabel(row.group) })
      ] })
    }, {
      name: "Hits",
      width: "70px",
      getSortValue: (row) => row.hits,
      render: (row) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tabular-nums", children: row.hits.toLocaleString() })
    }, {
      name: "Share",
      width: "60px",
      responsive: {
        priority: 5
      },
      render: (row) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground tabular-nums", children: formatShare(row.hits, total) })
    }, {
      name: "Last seen",
      width: "110px",
      responsive: {
        priority: 6
      },
      getSortValue: (row) => row.lastSeen,
      render: (row) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: formatTimeAgoOrDateTime(new Date(row.lastSeen)) })
    }], data: rows, getColumnPercentage: (row) => row.hits / maxHits, keyExtractor: (row) => `${row.name}:${row.category}` })
  ] });
}
function TopPathsTable({
  stats,
  isLoading
}) {
  const rows = stats?.topPaths ?? [];
  const maxHits = Math.max(...rows.map((row) => row.hits), 1);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { title: "Crawled pages", children: rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs tabular-nums", children: [
      rows.length.toLocaleString(),
      " pages"
    ] }) }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingTable, { label: "Path" }),
    !isLoading && rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyRows, { message: "No crawled pages in this period" }),
    !isLoading && rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewWidgetTable, { columns: [{
      name: "Path",
      width: "w-full",
      render: (row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", title: row.path, children: row.path }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden shrink-0 items-center gap-0.5 sm:flex", title: row.bots.map((bot) => bot.name).join(", "), children: row.bots.map((bot) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full", style: {
          backgroundColor: botGroupColor(bot.group)
        } }, `${bot.name}:${bot.category}`)) })
      ] })
    }, {
      name: "Hits",
      width: "70px",
      getSortValue: (row) => row.hits,
      render: (row) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tabular-nums", children: row.hits.toLocaleString() })
    }, {
      name: "4xx",
      width: "50px",
      responsive: {
        priority: 4
      },
      getSortValue: (row) => row.status["4xx"],
      render: (row) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatusCount, { value: row.status["4xx"] })
    }, {
      name: "5xx",
      width: "50px",
      responsive: {
        priority: 4
      },
      getSortValue: (row) => row.status["5xx"],
      render: (row) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatusCount, { value: row.status["5xx"] })
    }, {
      name: "Last seen",
      width: "110px",
      responsive: {
        priority: 6
      },
      getSortValue: (row) => row.lastSeen,
      render: (row) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: formatTimeAgoOrDateTime(new Date(row.lastSeen)) })
    }], data: rows, getColumnPercentage: (row) => row.hits / maxHits, keyExtractor: (row) => row.path })
  ] });
}
function StatusCount({
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: value > 0 ? "font-medium text-destructive tabular-nums" : "text-muted-foreground tabular-nums", children: value.toLocaleString() });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.bots-BOm_-DLc.js.map
