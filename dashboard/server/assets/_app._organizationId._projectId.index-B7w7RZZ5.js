import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { L as LazyComponent } from "./lazy-component-BvTCtqML.js";
import { e as useAppParams, a as useTRPC, $ as useNavigate, j as useQuery, aW as op, H as pushModal, B as Button, d as cn, C as Check, g as useEventQueryFilters, ei as Carousel, ej as CarouselContent, ek as CarouselItem, b4 as Skeleton, el as CarouselPrevious, em as CarouselNext, b as useMutation, D as DropdownMenu, m as DropdownMenuTrigger, en as Lock, n as DropdownMenuContent, z as DropdownMenuGroup, o as DropdownMenuItem, A as Link, aV as Eye, eo as Route, ep as OverviewAICommand } from "./router-gBnYxPzA.js";
import { P as Ping } from "./ping-B_apCr-3.js";
import { a as OverviewFilterButton, O as OverviewFiltersButtons } from "./overview-filters-buttons-C30tAgyS.js";
import { L as LiveCounter, O as OverviewMetrics, a as OverviewTopSources, b as OverviewTopPages, c as OverviewTopDevices, d as OverviewTopEvents, e as OverviewTopGeo, f as OverviewWeeklyTrends, g as OverviewUserJourney } from "./overview-weekly-trends-DrC2rBau.js";
import { I as InsightCard } from "./insight-card-Cf29F786.js";
import { O as OverviewInterval } from "./overview-interval-cSBL6ZB5.js";
import { O as OverviewRange } from "./overview-range-DoapqOyi.js";
import { E as Earth } from "./earth-Din9zDf9.js";
import { u as useRangePageContext } from "./use-page-context-helpers-DUMZv3Xw.js";
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
import "./properties-B42zBES-.js";
import "./animated-number-DKHgshrj.js";
import "./use-live-counter-BawyL5Mu.js";
import "./use-debounce-state-BwHu4mHP.js";
import "./index-Dpi7uv2M.js";
import "./rotate-cw-59NMbvpf.js";
import "./widget-D7PGEeO1.js";
import "./overview-widget-q0VDaTtp.js";
import "./last-C7omGuiv.js";
import "./countries-CS917BhP.js";
import "./table-DNq4Q3EQ.js";
import "./ReportInterval-zZuTI3j-.js";
import "./differenceInDays-liXHUvyd.js";
import "./time-window-picker-BUBj3ZWF.js";
import "./index-DxXk7QJj.js";
import "./addDays-BIiJOlUZ.js";
import "./endOfMonth-C3pRd8ne.js";
import "./startOfMonth-Bf6CczcY.js";
const dismissKey = (projectId) => `op-activation-checklist-dismissed:${projectId}`;
const readDismissed = (projectId) => {
  try {
    return localStorage.getItem(dismissKey(projectId)) === "1";
  } catch {
    return false;
  }
};
const HEADLINES = {
  "first-event": {
    title: "Waiting for your first event",
    sub: "Install the snippet — this banner lights up the moment data arrives."
  },
  "first-report": {
    title: "Data is flowing — now shape it",
    sub: "Build your first report from the events coming in."
  },
  "invite-teammate": {
    title: "Bring your team in",
    sub: "Invite a teammate to see what you are seeing."
  }
};
function ActivationBanner() {
  const { organizationId, projectId } = useAppParams();
  const trpc = useTRPC();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = reactExports.useState(true);
  reactExports.useEffect(() => {
    setDismissed(readDismissed(projectId));
  }, [projectId]);
  const statusQuery = useQuery(
    trpc.project.activationStatus.queryOptions(
      { projectId },
      {
        enabled: !dismissed,
        // Poll only while listening for the first event, so the banner reacts
        // on its own; afterwards the remaining steps are user-driven.
        refetchInterval: (query) => query.state.data && !query.state.data.hasFirstEvent ? 1e4 : false
      }
    )
  );
  const status = statusQuery.data;
  if (dismissed || !status) {
    return null;
  }
  const steps = [
    {
      key: "first-event",
      label: "First event",
      done: status.hasFirstEvent,
      go: () => {
        op.track("activation_checklist_setup_clicked", { projectId });
        navigate({
          to: "/onboarding/$projectId/connect",
          params: { projectId }
        });
      }
    },
    {
      key: "first-report",
      label: "First report",
      done: status.hasReport,
      go: () => {
        op.track("activation_checklist_report_clicked", { projectId });
        navigate({
          to: "/$organizationId/$projectId/reports",
          params: { organizationId, projectId }
        });
      }
    },
    {
      key: "invite-teammate",
      label: "Invite a teammate",
      done: status.hasTeammate,
      go: () => {
        op.track("activation_checklist_invite_clicked", { projectId });
        pushModal("CreateInvite");
      }
    }
  ];
  const doneCount = steps.filter((step) => step.done).length;
  if (doneCount === steps.length) {
    return null;
  }
  const current = steps.find((step) => !step.done) ?? steps[0];
  const headline = HEADLINES[current.key];
  const dismiss = () => {
    op.track("activation_checklist_dismissed", { projectId });
    try {
      localStorage.setItem(dismissKey(projectId), "1");
    } catch {
    }
    setDismissed(true);
  };
  const actions = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: current.go, size: "sm", children: current.key === "first-event" ? "Set up tracking" : current.key === "first-report" ? "Create a report" : "Invite" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: dismiss, size: "sm", variant: "ghost", children: "Skip setup" })
  ] });
  return (
    // Container queries, not viewport breakpoints: the banner sits beside the
    // sidebar, so its own width — not the window's — decides when the
    // three-column row fits. In the stacked layout the actions move up to the
    // headline row (top-right corner) instead of dangling below the funnel.
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "@container relative overflow-hidden border-b bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "pointer-events-none absolute -top-24 -right-24 size-64 rounded-full opacity-20 blur-3xl",
          style: {
            background: "radial-gradient(circle, rgb(16 185 129) 0%, transparent 70%)"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "@5xl:row col relative @5xl:items-center @5xl:justify-between @5xl:gap-10 gap-6 @5xl:p-6 p-4 @5xl:px-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row @5xl:contents min-w-0 flex-wrap items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-1.5 text-3xs text-muted-foreground uppercase tabular-nums tracking-wider", children: [
              "Setup funnel",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-600 dark:text-emerald-500", children: [
                doneCount,
                "/",
                steps.length
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-base", children: headline.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-muted-foreground text-sm", children: headline.sub })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row @5xl:hidden shrink-0 items-center gap-2", children: actions })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row min-w-0 max-w-xl flex-1 items-center gap-0", children: steps.map((step, index) => {
          const isCurrent = step.key === current.key;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cn("row items-center", index > 0 && "flex-1"),
              children: [
                index > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: cn(
                      // Aligned to the node centers (size-7 nodes), not the
                      // taller node+label buttons the row centers against.
                      "mx-2 mt-[13px] h-0.5 min-w-4 flex-1 self-start rounded-full transition-colors",
                      steps[index - 1].done ? "bg-emerald-500" : "bg-border"
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    className: cn(
                      "group col shrink-0 items-center gap-1.5 outline-none",
                      step.done && "cursor-default"
                    ),
                    disabled: step.done,
                    onClick: step.go,
                    type: "button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: cn(
                            "center-center size-7 rounded-full border transition-colors group-focus-visible:ring-2 group-focus-visible:ring-ring",
                            step.done && "border-emerald-500 bg-emerald-500 text-white",
                            !step.done && isCurrent && "border-emerald-500/50 bg-background group-hover:border-emerald-500",
                            !(step.done || isCurrent) && "border-dashed bg-background text-muted-foreground group-hover:border-foreground/40"
                          ),
                          children: step.done ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5" }) : isCurrent ? /* @__PURE__ */ jsxRuntimeExports.jsx(Ping, { className: "motion-reduce:animate-none" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-current opacity-40" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: cn(
                            "whitespace-nowrap text-xs transition-colors",
                            step.done && "text-muted-foreground line-through",
                            !step.done && isCurrent && "font-medium",
                            !(step.done || isCurrent) && "text-muted-foreground"
                          ),
                          children: step.label
                        }
                      )
                    ]
                  }
                )
              ]
            },
            step.key
          );
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "@5xl:flex hidden shrink-0 items-center gap-2", children: actions })
      ] })
    ] })
  );
}
function OverviewInsights({ projectId }) {
  const trpc = useTRPC();
  const [filters, setFilter] = useEventQueryFilters();
  const { data: insights, isLoading } = useQuery(
    trpc.insight.list.queryOptions({
      projectId,
      limit: 20
    })
  );
  if (isLoading) {
    const keys = Array.from({ length: 4 }, (_, i) => `insight-skeleton-${i}`);
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Carousel, { className: "w-full", opts: { align: "start" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselContent, { className: "-ml-4", children: keys.map((key) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      CarouselItem,
      {
        className: "basis-full pl-4 sm:basis-1/2 lg:basis-1/4",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-36 w-full" })
      },
      key
    )) }) }) });
  }
  if (!insights || insights.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6 -mx-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Carousel, { className: "group w-full", opts: { align: "start" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselContent, { className: "mr-4", children: insights.map((insight) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      CarouselItem,
      {
        className: "basis-full pl-4 sm:basis-1/2 lg:basis-1/4",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          InsightCard,
          {
            insight,
            onFilter: () => {
              insight.payload.dimensions.forEach((dim) => {
                void setFilter(dim.key, dim.value, "is");
              });
            }
          }
        )
      },
      insight.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselPrevious, { className: "!opacity-0 group-hover:!opacity-100 pointer-events-none transition-opacity group-hover:pointer-events-auto group-focus:pointer-events-auto group-focus:opacity-100" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselNext, { className: "!opacity-0 group-hover:!opacity-100 pointer-events-none transition-opacity group-hover:pointer-events-auto group-focus:pointer-events-auto group-focus:opacity-100" })
  ] }) });
}
function OverviewShare({ projectId }) {
  const { organizationId } = useAppParams();
  const trpc = useTRPC();
  const query = useQuery(
    trpc.share.overviewSettings.queryOptions(
      {
        projectId
      },
      {
        retry: 0
      }
    )
  );
  const data = query.data;
  const mutation = useMutation(
    trpc.share.createOverview.mutationOptions({
      onSuccess() {
        query.refetch();
      }
    })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        icon: data?.public ? Earth : Lock,
        loading: query.isLoading,
        responsive: true,
        children: data?.public ? "Public" : "Private"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuGroup, { children: [
      (!data || data.public === false) && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => pushModal("ShareOverviewModal"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Earth, { className: "mr-2", size: 16 }),
        "Make public"
      ] }),
      data?.public && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          params: { shareId: data.id },
          to: "/share/overview/$shareId",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "mr-2", size: 16 }),
            "View"
          ]
        }
      ) }),
      data?.public && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DropdownMenuItem,
        {
          onClick: () => {
            mutation.mutate({
              organizationId,
              projectId,
              public: false,
              password: null
            });
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "mr-2", size: 16 }),
            "Make private"
          ]
        }
      )
    ] }) })
  ] });
}
function ProjectDashboard() {
  const {
    projectId
  } = Route.useParams();
  useRangePageContext("overview");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ActivationBanner, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky-header -top-px!", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-2 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewRange, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewInterval, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewFilterButton, { mode: "events" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewAICommand, { className: "hidden w-[280px] md:block" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LiveCounter, { projectId }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewShare, { projectId })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewFiltersButtons, { filterModal: {
        mode: "events"
      } })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-6 gap-4 p-4 pt-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetrics, { projectId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewInsights, { projectId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTopSources, { projectId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTopPages, { projectId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTopDevices, { projectId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTopEvents, { projectId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTopGeo, { projectId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LazyComponent, { className: "col-span-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewWeeklyTrends, { projectId }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LazyComponent, { className: "col-span-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewUserJourney, { projectId }) })
    ] })
  ] });
}
export {
  ProjectDashboard as component
};
//# sourceMappingURL=_app._organizationId._projectId.index-B7w7RZZ5.js.map
