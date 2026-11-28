import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, dY as KeyRound, es as CopyInput, B as Button, bz as Copy, bA as clipboard, et as Download, a as useTRPC, ak as useQueryClient, j as useQuery, al as useWS, d as cn, C as Check, eu as timeAgo, ev as Dialog, ew as DialogTrigger, ex as DialogPortal, ey as DialogContent, ez as DialogHeader, eA as DialogTitle, eB as DialogDescription, b as useMutation, dM as handleError, as as Ut, A as Link, a1 as Sparkles, a3 as buttonVariants, aS as WithLabel, dV as TagInput, T as Bot, eC as Zap, dZ as ExternalLink, eD as Route, I as useAppContext, eE as useClientSecret, eF as useMcpToken, eG as isRealClientSecret, E as EmptyState, L as LinkButton } from "./router-gBnYxPzA.js";
import { t as trackFunnel, u as useSecondsOnStep } from "./funnel-tracking-CMJu0A5n.js";
import { P as Ping } from "./ping-B_apCr-3.js";
import { c as curlSnippet, I as InstallGuide } from "./install-guide-8ROrm6uK.js";
import { s as setLaunchedQuestion } from "./chat-launch-DoJA8ohM.js";
import { S as Syntax } from "./syntax-CwZKbcAR.js";
import { A as Accordion, a as AccordionItem, b as AccordionTrigger, c as AccordionContent } from "./accordion-DCcazlXT.js";
import { O as OnboardingHeading } from "./onboarding-heading-H3qQoDd5.js";
import { S as SearchX } from "./search-x-G2uq0KeH.js";
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
const __iconNode = [
  ["path", { d: "M5.8 11.3 2 22l10.7-3.79", key: "gwxi1d" }],
  ["path", { d: "M4 3h.01", key: "1vcuye" }],
  ["path", { d: "M22 8h.01", key: "1mrtc2" }],
  ["path", { d: "M15 2h.01", key: "1cjtqr" }],
  ["path", { d: "M22 20h.01", key: "1mrys2" }],
  [
    "path",
    {
      d: "m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10",
      key: "hbicv8"
    }
  ],
  [
    "path",
    { d: "m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17", key: "1i94pl" }
  ],
  ["path", { d: "m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7", key: "1cofks" }],
  [
    "path",
    {
      d: "M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z",
      key: "4kbmks"
    }
  ]
];
const PartyPopper = createLucideIcon("party-popper", __iconNode);
function ClientCredentials({
  clientId,
  clientSecret,
  mcpToken,
  projectId
}) {
  const isOneTimeView = Boolean(clientSecret);
  const credentials = [
    `CLIENT_ID=${clientId}`,
    clientSecret && `CLIENT_SECRET=${clientSecret}`,
    mcpToken && `MCP_TOKEN=${mcpToken}`
  ].filter(Boolean).join("\n");
  const copied = (what) => trackFunnel("onboarding_credentials_copied", { projectId, what });
  const download = () => {
    copied("download");
    const blob = new Blob([credentials], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "openpanel-credentials.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "col gap-4 rounded-xl border p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "text-muted-foreground", size: 16 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-base", children: "Your keys" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 [&>*]:min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CopyInput,
        {
          label: "Client ID",
          onCopy: () => copied("clientId"),
          value: clientId
        }
      ),
      clientSecret && /* @__PURE__ */ jsxRuntimeExports.jsx(
        CopyInput,
        {
          label: "Client secret",
          onCopy: () => copied("clientSecret"),
          value: clientSecret
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: isOneTimeView ? "The secret is shown only once. Save it if you track from a server or an app." : "Secrets are shown once, right after a project is created. Create a new client under Settings → Clients if you need another." }),
    isOneTimeView && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          icon: Copy,
          onClick: () => {
            copied("all");
            clipboard(credentials);
          },
          size: "sm",
          variant: "outline",
          children: "Copy all"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          icon: Download,
          onClick: download,
          size: "sm",
          variant: "outline",
          children: "Download"
        }
      )
    ] })
  ] });
}
const FALLBACK_POLL_MS = 1e4;
const SHOWN_EVENTS = 5;
function useFirstEvents(projectId, secondsOnStep) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(
    trpc.event.events.queryOptions(
      { projectId },
      {
        // The websocket below flips the status instantly; polling only covers
        // a socket that cannot connect.
        refetchInterval: FALLBACK_POLL_MS
      }
    )
  );
  useWS(`/live/events/${projectId}`, () => {
    queryClient.invalidateQueries(trpc.event.events.queryFilter({ projectId }));
  });
  const events = data?.data ?? [];
  const isVerified = events.length > 0;
  const firstEvent = events.at(-1);
  reactExports.useEffect(() => {
    if (isVerified) {
      trackFunnel("onboarding_first_event_verified", {
        projectId,
        secondsOnStep: secondsOnStep(),
        eventCount: events.length,
        firstEventName: firstEvent?.name ?? null,
        sdk: firstEvent?.sdkName || null
      });
    }
  }, [isVerified, projectId]);
  return { events, isVerified };
}
function FirstEventStatus({
  events,
  className,
  children,
  help
}) {
  const isVerified = events.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      "aria-live": "polite",
      className: cn(
        "@container col gap-4 rounded-xl p-5 transition-colors",
        isVerified ? "bg-emerald-500/10 text-emerald-950 dark:text-emerald-50" : "bg-def-200 dark:bg-def-300",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex @md:flex-row flex-col @md:items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "center-center size-10 shrink-0 rounded-full",
                isVerified ? "bg-emerald-500 text-white" : "bg-background"
              ),
              children: isVerified ? /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { size: 18 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Ping, { className: "size-2.5 bg-highlight" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-base", children: isVerified ? "Connected! Events are coming in." : "Listening for your first event" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: cn(
                  "text-sm",
                  isVerified ? "text-emerald-900/70 dark:text-emerald-100/70" : "text-muted-foreground"
                ),
                children: isVerified ? "Your setup works. Open the dashboard whenever you are ready." : "Install the snippet, open your site or app once, and this turns green by itself."
              }
            ),
            !isVerified && help && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: help })
          ] }),
          children && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "@md:ml-auto shrink-0", children })
        ] }),
        isVerified && /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "col gap-1 rounded-lg bg-background/60 p-3 text-sm", children: [
          events.slice(0, SHOWN_EVENTS).map((event) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "row items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "shrink-0 text-emerald-600", size: 14 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: event.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto shrink-0 text-muted-foreground tabular-nums", children: timeAgo(event.createdAt, "round") })
          ] }, event.id)),
          events.length > SHOWN_EVENTS && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-muted-foreground", children: [
            "and ",
            events.length - SHOWN_EVENTS,
            " more"
          ] })
        ] })
      ]
    }
  );
}
const TEST_EVENT_NAME = "openpanel_test_event";
function diagnoseQuestion(project) {
  if (project.domain) {
    return `No events have arrived for ${project.domain} after installing FlarePanel. Diagnose the install.`;
  }
  const kinds = project.types.length > 0 ? project.types.join(" and ") : "app";
  return `No events have arrived from my ${kinds} project after installing FlarePanel. Check what has reached the project and what could block events.`;
}
function normalizeOrigins(values) {
  return values.map((value) => value.trim()).filter(Boolean).map(
    (value) => value === "*" || /^https?:\/\//.test(value) ? value : `https://${value}`
  );
}
function InstallTroubleshootingDialog({
  project,
  context
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      onOpenChange: (open) => trackFunnel("onboarding_troubleshooting_toggled", {
        projectId: project.id,
        open
      }),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { className: "text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline", children: "I'm not receiving events" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogPortal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-2xl", showCloseButton: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Not seeing events?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "The checks that solve most installs, in the order they usually apply." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(InstallTroubleshooting, { context, project })
        ] }) })
      ]
    }
  );
}
function InstallTroubleshooting({
  project,
  context
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const updateProject = useMutation(
    trpc.project.update.mutationOptions({
      onError: handleError,
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.project.getProjectWithClients.queryFilter({
            projectId: project.id
          })
        );
        Ut.success("Allowed domains updated");
      }
    })
  );
  const isWebsite = project.types.includes("website");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "row flex-wrap items-center justify-between gap-3 rounded-xl bg-def-200 p-4 dark:bg-def-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Let the assistant find it" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "It fetches your site, reads the snippet and checks it against this project's keys and allowed domains." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          className: cn(buttonVariants({ size: "default" })),
          onClick: () => {
            setLaunchedQuestion(project.id, diagnoseQuestion(project));
            trackFunnel("onboarding_assistant_opened", {
              projectId: project.id,
              hasDomain: Boolean(project.domain)
            });
          },
          params: {
            organizationId: project.organizationId,
            projectId: project.id
          },
          search: { hint: { page: "onboarding" } },
          to: "/$organizationId/$projectId/chat",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mr-2 size-4" }),
            "Diagnose with the assistant"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "1. Did the page or app actually load with the snippet?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Events are sent when a screen is viewed. Deploy or run the code, then open it once and reload this page. Ad blockers can also stop the request; try an incognito window without extensions." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "2. Is the client ID the one for this project?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CopyInput, { label: "Client ID", value: context.clientId })
    ] }),
    isWebsite && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "3. Is your domain allowed?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Browser events are accepted only from these origins. Add every domain your site runs on, including localhost while testing." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WithLabel, { label: "Allowed domains", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TagInput,
        {
          onChange: (values) => {
            const cors = normalizeOrigins(values);
            trackFunnel("onboarding_allowed_domains_updated", {
              projectId: project.id,
              count: cors.length,
              wildcard: cors.includes("*")
            });
            updateProject.mutate({ id: project.id, cors });
          },
          placeholder: "Add a domain and press Enter",
          renderTag: (tag) => tag === "*" ? "Any domain" : tag,
          value: project.cors ?? []
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
        isWebsite ? "4." : "3.",
        " Send a test event from your terminal"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "This bypasses your code entirely. If it shows up above, the project is fine and the problem is in the integration." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Syntax,
        {
          code: curlSnippet(context, TEST_EVENT_NAME),
          language: "bash",
          onCopy: () => trackFunnel("onboarding_test_curl_copied", {
            projectId: project.id
          }),
          wrapLines: true
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-muted-foreground", children: [
      "Still stuck? Write to",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          className: "underline",
          href: "mailto:hello@flarepanel.dev",
          onClick: () => trackFunnel("onboarding_support_link_clicked", {
            projectId: project.id,
            target: "email"
          }),
          children: "hello@flarepanel.dev"
        }
      ),
      " ",
      "or join the",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          className: "underline",
          href: "https://go.flarepanel.dev/discord",
          onClick: () => trackFunnel("onboarding_support_link_clicked", {
            projectId: project.id,
            target: "discord"
          }),
          rel: "noreferrer",
          target: "_blank",
          children: "Discord"
        }
      ),
      ". We answer quickly."
    ] })
  ] });
}
const SERVER_NAME = "openpanel";
const PANEL = "mcp";
const HOSTS = [
  {
    key: "cursor",
    label: "Cursor",
    kind: "install",
    href: ({ endpoint, token }) => {
      const config = btoa(
        JSON.stringify({
          url: endpoint,
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      return `cursor://anysphere.cursor-deeplink/mcp/install?name=${SERVER_NAME}&config=${encodeURIComponent(config)}`;
    }
  },
  {
    key: "vscode",
    label: "VS Code",
    kind: "install",
    href: ({ endpoint, token }) => `vscode:mcp/install?${encodeURIComponent(
      JSON.stringify({
        name: SERVER_NAME,
        type: "http",
        url: endpoint,
        headers: { Authorization: `Bearer ${token}` }
      })
    )}`
  },
  {
    key: "claude-code",
    label: "Claude Code",
    kind: "command",
    command: ({ endpoint, token }) => `claude mcp add --transport http ${SERVER_NAME} ${endpoint} --header "Authorization: Bearer ${token}"`
  },
  {
    key: "claude",
    label: "Claude",
    kind: "paste",
    settingsUrl: "https://claude.ai/settings/connectors",
    hint: "Settings → Connectors → Add custom connector"
  },
  {
    key: "chatgpt",
    label: "ChatGPT",
    kind: "paste",
    settingsUrl: "https://chatgpt.com/#settings/Connectors",
    hint: "Settings → Connectors → Create (Developer mode)"
  }
];
const KIND_CAPTIONS = {
  install: "One click",
  command: "One command",
  paste: "Paste the URL"
};
function McpConnect({
  projectId,
  organizationId,
  apiUrl,
  mcpToken
}) {
  const connection = mcpToken ? { endpoint: `${apiUrl}/mcp`, token: mcpToken } : null;
  const track = (host) => trackFunnel("onboarding_mcp_connect_clicked", {
    projectId,
    host: host.key,
    kind: host.kind
  });
  const renderAction = (host, current) => {
    if (host.kind === "install") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          className: cn(buttonVariants({ variant: "outline", size: "sm" })),
          href: host.href(current),
          onClick: () => track(host),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "mr-1.5 size-3.5" }),
            "Install"
          ]
        }
      );
    }
    if (host.kind === "command") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          icon: Copy,
          onClick: () => {
            track(host);
            clipboard(host.command(current), "Run it in your terminal");
          },
          size: "sm",
          variant: "outline",
          children: "Copy command"
        }
      );
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        icon: ExternalLink,
        onClick: () => {
          track(host);
          clipboard(
            `${current.endpoint}?token=${current.token}`,
            `Paste it as the server URL: ${host.hint}`
          );
          window.open(host.settingsUrl, "_blank", "noopener");
        },
        size: "sm",
        variant: "outline",
        children: "Copy URL"
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Accordion,
    {
      className: "rounded-xl border",
      collapsible: true,
      onValueChange: (value) => trackFunnel("onboarding_mcp_connect_toggled", {
        projectId,
        open: value === PANEL,
        hadToken: Boolean(mcpToken)
      }),
      type: "single",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionItem, { className: "border-b-0", value: PANEL, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionTrigger, { className: "gap-4 rounded-xl p-5 text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "row items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "shrink-0 text-muted-foreground", size: 16 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-base", children: "Connect an AI assistant" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-muted-foreground text-sm", children: "Give Cursor, Claude or ChatGPT read access to this project over MCP and ask it questions instead of building reports." })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionContent, { className: "col gap-4 px-5 pb-5", children: [
          connection ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "col divide-y", children: HOSTS.map((host) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "li",
              {
                className: "row items-center justify-between gap-3 py-2.5",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: host.label }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: KIND_CAPTIONS[host.kind] })
                  ] }),
                  renderAction(host, connection)
                ]
              },
              host.key
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CopyInput,
              {
                label: "MCP token",
                onCopy: () => trackFunnel("onboarding_credentials_copied", {
                  projectId,
                  what: "mcpToken"
                }),
                value: connection.token
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "The MCP token was shown once when the project was created. Create another MCP client to connect an assistant." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              className: "self-start text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline",
              onClick: () => trackFunnel("onboarding_mcp_settings_clicked", {
                projectId,
                hadToken: Boolean(mcpToken)
              }),
              params: { organizationId, projectId },
              to: "/$organizationId/$projectId/settings/mcp",
              children: "Windsurf, Raycast and config files in Settings → MCP"
            }
          )
        ] })
      ] })
    }
  );
}
function Component() {
  const {
    projectId
  } = Route.useParams();
  const trpc = useTRPC();
  const {
    apiUrl,
    isSelfHosted
  } = useAppContext();
  const {
    data: project
  } = useQuery(trpc.project.getProjectWithClients.queryOptions({
    projectId
  }));
  const client = project?.clients.find((candidate) => candidate.type === "write");
  const [secret, secretReady] = useClientSecret(projectId);
  const [mcpToken, mcpTokenReady] = useMcpToken(projectId);
  const keysReady = secretReady && mcpTokenReady;
  const secondsOnStep = useSecondsOnStep();
  const {
    events,
    isVerified
  } = useFirstEvents(projectId, secondsOnStep);
  const hasSecret = isRealClientSecret(secret);
  const viewedProjectId = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!keysReady || viewedProjectId.current === projectId) {
      return;
    }
    viewedProjectId.current = projectId;
    trackFunnel("onboarding_connect_viewed", {
      projectId,
      types: project?.types ?? [],
      hasSecret,
      hasMcpToken: Boolean(mcpToken)
    });
  }, [keysReady, projectId, project?.types, hasSecret, mcpToken]);
  const openDashboard = (from) => trackFunnel("onboarding_dashboard_opened", {
    projectId,
    verified: isVerified,
    from,
    secondsOnStep: secondsOnStep()
  });
  if (!(project && client)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { description: "This project doesn't exist or isn't ready yet. Reload the page to try again.", icon: SearchX, title: "Project not found", variant: "page" });
  }
  const context = {
    clientId: client.id,
    clientSecret: hasSecret ? secret : null,
    apiUrl: isSelfHosted ? apiUrl : null
  };
  const dashboard = {
    to: "/$organizationId/$projectId",
    params: {
      organizationId: project.organizationId,
      projectId: project.id
    }
  };
  const sidebarPlacement = "col gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(OnboardingHeading, { className: "lg:col-start-1", description: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      "Add the snippet to",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: project.name }),
      " and we confirm the first event right here. Your keys stay on the side; you can also do this later from the dashboard."
    ] }), title: "Install FlarePanel" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: sidebarPlacement, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FirstEventStatus, { events, help: /* @__PURE__ */ jsxRuntimeExports.jsx(InstallTroubleshootingDialog, { context, project }), children: isVerified && /* @__PURE__ */ jsxRuntimeExports.jsx(LinkButton, { className: "w-full", onClick: () => openDashboard("status"), size: "lg", ...dashboard, children: "Open dashboard" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClientCredentials, { clientId: client.id, clientSecret: context.clientSecret, mcpToken, projectId: project.id }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(McpConnect, { apiUrl, mcpToken, organizationId: project.organizationId, projectId: project.id })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-10 lg:col-start-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(InstallGuide, { context, projectId: project.id, projectName: project.name, projectTypes: project.types }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center justify-between gap-4 border-t pt-8", children: [
        isVerified ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "You are all set." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "text-muted-foreground underline-offset-4 hover:text-foreground hover:underline", onClick: () => trackFunnel("onboarding_skipped", {
          projectId,
          secondsOnStep: secondsOnStep()
        }), ...dashboard, children: "Skip for now, I will install later" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LinkButton, { onClick: () => openDashboard("footer"), size: "xl", variant: isVerified ? "default" : "outline", ...dashboard, children: "Open dashboard" })
      ] })
    ] })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_steps.onboarding._projectId.connect-DM_Tcm0U.js.map
