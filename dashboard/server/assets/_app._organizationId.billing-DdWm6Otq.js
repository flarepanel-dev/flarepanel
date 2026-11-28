import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { bM as differenceInCalendarDays, a as useTRPC, j as useQuery, ad as getChartColor, bQ as formatDate, a$ as ComposedChart, cN as Grid, b0 as YAxis, a4 as useNumber, cO as XAxis, b1 as SeriesBar, af as OPChartTooltip, e1 as PieChart, e2 as PieSlice, e3 as PieCenter, B as Button, X, e4 as LoaderCircle, e5 as DEFAULT_HOVER_OFFSET, bK as round, d as cn, ab as formatDateInterval, c4 as useQueryState, ak as useQueryClient, b as useMutation, as as Ut, al as useWS, H as pushModal, e6 as useOnPushModal, M as Badge, aX as usedPercent, e7 as BillingPlanPicker, C as Check, e8 as Route, d$ as FullPageLoadingState, E as EmptyState, w as Building2 } from "./router-gBnYxPzA.js";
import { g as getSubscriptionStateMeta } from "./subscription-state-meta-JPhB7GGT.js";
import { P as Progress } from "./progress-Qvc7Obsu.js";
import { b as Widget, a as WidgetHead, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { A as Accordion, a as AccordionItem, b as AccordionTrigger, c as AccordionContent } from "./accordion-DCcazlXT.js";
import { a as addDays } from "./addDays-BIiJOlUZ.js";
import { d as differenceInDays } from "./differenceInDays-liXHUvyd.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
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
const questions = [
  {
    question: "Is there a free plan?",
    answer: [
      "No, but every new account starts with a 30-day free trial of up to 100,000 events, with every feature and no card needed.",
      "After that, plans start at $1 a month."
    ]
  },
  {
    question: "What happens if I go over my plan?",
    answer: [
      "Nothing is lost and nothing extra is charged. We keep recording every event; your charts pause until you move to a bigger plan or your next billing period starts, and then everything recorded in between shows up.",
      "We email you at 80% and at 100%, so it never comes as a surprise."
    ]
  },
  {
    question: "Can I change plan or cancel later?",
    answer: [
      "Any time, from this page. Upgrades apply straight away. If you cancel, your plan keeps running until the end of the period you paid for, and recording stops 7 days after that."
    ]
  },
  {
    question: "Can I get a refund?",
    answer: [
      "Yes: your first payment is refunded in full if you ask within 14 days. Email hello@flarepanel.dev from the address on your account."
    ]
  },
  {
    question: "Who handles the payment?",
    answer: [
      "Polar, our payment partner and merchant of record. Polar issues your invoice and adds VAT or sales tax at checkout where it applies. You can update your card and download invoices in the customer portal."
    ]
  },
  {
    question: "We track more than 50M events. Can you help?",
    answer: [
      "Yes. Email hello@flarepanel.dev and we will set up a plan for your volume."
    ]
  }
];
function BillingFaq() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Questions" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Accordion,
      {
        className: "w-full max-w-screen-md self-center",
        collapsible: true,
        type: "single",
        children: questions.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionItem, { value: q.question, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionTrigger, { className: "px-4 text-left", children: q.question }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col gap-2 p-4 pt-2", children: q.answer.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: a }, a)) }) })
        ] }, q.question))
      }
    )
  ] });
}
function projectUsage({
  used,
  limit,
  periodStart,
  periodEnd,
  now
}) {
  const daysElapsed = differenceInCalendarDays(now, periodStart) + 1;
  const daysInPeriod = differenceInCalendarDays(periodEnd, periodStart);
  if (used <= 0 || daysElapsed <= 0 || daysInPeriod <= 0) {
    return null;
  }
  const perDay = used / daysElapsed;
  const daysRemaining = Math.max(0, daysInPeriod - daysElapsed);
  const projectedTotal = Math.round(used + perDay * daysRemaining);
  const reachesLimit = limit > 0 && used < limit && projectedTotal >= limit;
  const limitReachedAt = reachesLimit ? addDays(now, Math.ceil((limit - used) / perDay)) : null;
  return { perDay, projectedTotal, limitReachedAt };
}
const MARGIN = { top: 12, right: 12, bottom: 28, left: 40 };
const BAR_RADIUS = 3;
const MAX_BAR_SIZE = 14;
const STACK_GAP = 1;
const DONUT_HOLE = 0.62;
const PAD_ANGLE = 0.02;
const CORNER_RADIUS = 3;
const PIE_SIZE = 200;
const OTHER_LABEL = "Other";
const OTHER_COLOR = "var(--chart-foreground-muted)";
function formatDayLabel(date) {
  return formatDateInterval({ interval: "day", date, short: true });
}
function toSlices(rows, total) {
  return rows.filter((row) => row.value > 0).map((row) => ({
    ...row,
    share: total ? round(row.value / total * 100, 1) : 0
  }));
}
function SliceRow({ slice }) {
  const number = useNumber();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "size-2.5 shrink-0 rounded-full",
        style: { background: slice.color }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 truncate", children: slice.label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tabular-nums", children: number.short(slice.value) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-12 text-right text-muted-foreground tabular-nums", children: [
      slice.share,
      "%"
    ] })
  ] });
}
const SLICE_ROW_CLASS = "flex w-full items-center gap-2 rounded px-1.5 py-1 text-left";
function SliceLegend({
  slices,
  hoveredIndex = null,
  onHover,
  selectedIndex = null,
  onSelect
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "col gap-0.5", children: slices.map((slice, index) => {
    const isSelected = selectedIndex === index;
    const isFaded = hoveredIndex !== null && hoveredIndex !== index;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        "aria-pressed": onSelect ? isSelected : void 0,
        className: cn(
          SLICE_ROW_CLASS,
          "transition-opacity hover:bg-def-100",
          isFaded && "opacity-50",
          isSelected && "bg-def-100 font-medium"
        ),
        onBlur: () => onHover?.(null),
        onClick: () => onSelect?.(isSelected ? null : index),
        onFocus: () => onHover?.(index),
        onMouseEnter: () => onHover?.(index),
        onMouseLeave: () => onHover?.(null),
        type: "button",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SliceRow, { slice })
      }
    ) }, slice.id ?? `${index}-${slice.label}`);
  }) });
}
function UsageWidget({
  title,
  subtitle,
  aside,
  className,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: cn("w-full", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetHead, { className: "row items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col min-w-0 gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: title }),
        subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: subtitle })
      ] }),
      aside
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children })
  ] });
}
function Message({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "center-center p-8 font-medium", children });
}
function BillingUsage({ organization }) {
  const number = useNumber();
  const trpc = useTRPC();
  const usageQuery = useQuery(
    trpc.subscription.usage.queryOptions({ organizationId: organization.id })
  );
  const usage = usageQuery.data;
  const [hoveredName, setHoveredName] = reactExports.useState(null);
  const [selectedProjectId, setSelectedProjectId] = reactExports.useState(
    null
  );
  const selectProject = (projectId) => {
    setSelectedProjectId(projectId);
    setHoveredName(null);
  };
  const projects = reactExports.useMemo(
    () => (usage?.projects ?? []).map((project, index) => ({
      ...project,
      color: getChartColor(index),
      total: usage?.projectTotals[project.id] ?? 0
    })),
    [usage]
  );
  const total = projects.reduce((sum, project) => sum + project.total, 0);
  const chartData = reactExports.useMemo(
    () => (usage?.days ?? []).map((row) => ({
      date: (/* @__PURE__ */ new Date(`${row.day}T00:00:00`)).getTime(),
      total: Object.values(row.counts).reduce((sum, n) => sum + n, 0),
      ...row.counts
    })),
    [usage]
  );
  const projectSlices = reactExports.useMemo(
    () => toSlices(
      projects.map((project) => ({
        id: project.id,
        label: project.name,
        value: project.total,
        color: project.color
      })),
      total
    ),
    [projects, total]
  );
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const namesTotal = selectedProject ? selectedProject.total : total;
  const nameSlices = reactExports.useMemo(() => {
    const rows = selectedProject ? usage?.eventNamesByProject[selectedProject.id] ?? [] : usage?.eventNames ?? [];
    const named = rows.map((row, index) => ({
      label: row.name,
      value: row.count,
      color: getChartColor(index)
    }));
    const namedTotal = named.reduce((sum, row) => sum + row.value, 0);
    return toSlices(
      [
        ...named,
        {
          label: OTHER_LABEL,
          value: namesTotal - namedTotal,
          color: OTHER_COLOR
        }
      ],
      namesTotal
    );
  }, [usage, selectedProject, namesTotal]);
  const windowLabel = (() => {
    if (!usage) {
      return void 0;
    }
    const range = `${formatDate(/* @__PURE__ */ new Date(`${usage.from}T00:00:00`))} – ${formatDate(/* @__PURE__ */ new Date(`${usage.to}T00:00:00`))}`;
    const kind = usage.window === "billing_period" ? "Current billing period" : "Last 30 days";
    return `${kind} · ${range}`;
  })();
  const renderState = () => {
    if (usageQuery.isLoading) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "center-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) });
    }
    if (usageQuery.isError) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Message, { children: "Issues loading usage data" });
    }
    if (total === 0) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Message, { children: "No events in this period" });
    }
    return null;
  };
  const state = renderState();
  if (state) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(UsageWidget, { title: "Usage", children: state });
  }
  const innerRadius = (PIE_SIZE / 2 - DEFAULT_HOVER_OFFSET) * DONUT_HOLE;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-8 lg:grid-cols-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      UsageWidget,
      {
        className: "lg:col-span-2",
        subtitle: windowLabel,
        title: "Events per project",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            ComposedChart,
            {
              animationDuration: 0,
              aspectRatio: "auto",
              className: "h-[260px]",
              data: chartData,
              formatDateLabel: formatDayLabel,
              margin: MARGIN,
              maxBarSize: MAX_BAR_SIZE,
              stacked: true,
              stackGap: STACK_GAP,
              xDataKey: "date",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { horizontal: true }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { formatValue: number.short }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, {}),
                projects.map((project) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SeriesBar,
                  {
                    animate: false,
                    dataKey: project.id,
                    fill: project.color,
                    radius: BAR_RADIUS
                  },
                  project.id
                )),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  OPChartTooltip,
                  {
                    interval: "day",
                    rows: (point) => [
                      ...projects.map((project) => ({
                        color: project.color,
                        label: project.name,
                        value: Number(point[project.id] ?? 0),
                        format: number.format
                      })).filter((row) => row.value > 0),
                      {
                        color: "transparent",
                        label: "Total",
                        value: point.total,
                        format: number.format
                      }
                    ],
                    showCrosshair: false,
                    showDots: false,
                    title: (point) => formatDate(new Date(point.date))
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 border-t pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SliceLegend,
            {
              onSelect: (index) => selectProject(
                index === null ? null : projectSlices[index]?.id ?? null
              ),
              selectedIndex: selectedProject ? projectSlices.findIndex(
                (slice) => slice.id === selectedProject.id
              ) : null,
              slices: projectSlices
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      UsageWidget,
      {
        aside: selectedProject && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => selectProject(null),
            size: "sm",
            variant: "outline",
            children: [
              "All projects",
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "ml-1 size-3.5" })
            ]
          }
        ),
        subtitle: windowLabel && `${selectedProject?.name ?? "All projects"} · ${windowLabel}`,
        title: "Events by name",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            PieChart,
            {
              cornerRadius: CORNER_RADIUS,
              data: nameSlices,
              hoveredIndex: hoveredName,
              innerRadius,
              onHoverChange: setHoveredName,
              padAngle: PAD_ANGLE,
              size: PIE_SIZE,
              children: [
                nameSlices.map((slice, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  PieSlice,
                  {
                    animate: false,
                    index
                  },
                  `${index}-${slice.label}`
                )),
                /* @__PURE__ */ jsxRuntimeExports.jsx(PieCenter, { children: ({ value, isHovered }) => {
                  const slice = hoveredName === null ? null : nameSlices[hoveredName];
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col max-w-[80%] items-center text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-lg tabular-nums", children: number.short(value) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full truncate text-muted-foreground text-xs", children: isHovered && slice ? `${slice.share}%` : "Total" })
                  ] });
                } })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SliceLegend,
            {
              hoveredIndex: hoveredName,
              onHover: setHoveredName,
              slices: nameSlices
            }
          ) })
        ] })
      }
    )
  ] });
}
const PLAN_INCLUDES = [
  "Unlimited websites, team members and dashboards",
  "Funnels, retention, sessions and session replay",
  "Cookieless tracking and your own data, exportable any time",
  "AI assistant on your own OpenAI or Anthropic key",
  "REST API and MCP access to your data",
  "No extra charges if you go over: charts pause, events are kept"
];
function Billing({ organization }) {
  const [success, setSuccess] = useQueryState("customer_session_token");
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const number = useNumber();
  const currentProductQuery = useQuery(
    trpc.subscription.getCurrent.queryOptions({
      organizationId: organization.id
    })
  );
  const portalMutation = useMutation(
    trpc.subscription.portal.mutationOptions({
      onSuccess(data) {
        if (data?.url) {
          window.location.href = data.url;
        }
      },
      onError(error) {
        Ut.error(error.message);
      }
    })
  );
  const resumeMutation = useMutation(
    trpc.subscription.resumeSubscription.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(trpc.organization.pathFilter());
        queryClient.invalidateQueries(trpc.subscription.pathFilter());
        Ut.success("Subscription resumed", {
          description: "It might take a few seconds to update"
        });
      },
      onError(error) {
        Ut.error(error.message);
      }
    })
  );
  const isPauseState = organization.subscriptionState === "pausing" || organization.subscriptionState === "paused";
  useWS(`/live/organization/${organization.id}`, () => {
    queryClient.invalidateQueries(trpc.organization.pathFilter());
    queryClient.invalidateQueries(trpc.subscription.pathFilter());
  });
  const recurringInterval = organization.subscriptionInterval ?? "month";
  const currentProduct = currentProductQuery.data ?? null;
  const currentPrice = currentProduct?.prices.flatMap(
    (p) => p.amountType === "fixed" ? [p] : []
  )[0];
  const listPrice = currentPrice ? currentPrice.priceAmount / 100 : null;
  const discountedPrice = (() => {
    const active = organization.subscriptionDiscount;
    if (!active || listPrice === null || active.duration === "once") {
      return null;
    }
    if (active.type === "percentage" && active.basisPoints) {
      return listPrice * (1 - active.basisPoints / 1e4);
    }
    if (active.type === "fixed" && active.amount) {
      return Math.max(0, listPrice - active.amount / 100);
    }
    return null;
  })();
  const discount = organization.subscriptionDiscount;
  const renderDiscount = () => {
    if (!discount) {
      return null;
    }
    const value = discount.type === "percentage" && discount.basisPoints ? `−${discount.basisPoints / 100}%` : discount.amount ? `−${number.currency(discount.amount / 100)}` : null;
    if (!value) {
      return null;
    }
    const duration = discount.duration === "repeating" && discount.durationInMonths ? `for the next ${discount.durationInMonths} months` : discount.duration === "forever" ? "on every invoice" : "on your next invoice";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-emerald-600 dark:text-emerald-500", children: [
      value,
      " ",
      duration
    ] });
  };
  const renderStatus = () => {
    const meta = getSubscriptionStateMeta(organization.subscriptionState, {
      endsAt: organization.subscriptionEndsAt,
      canceledAt: organization.subscriptionCanceledAt,
      resumesAt: organization.subscriptionResumesAt
    });
    if (!meta.statusLine) {
      return null;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: meta.statusLine.tone === "destructive" ? "text-destructive" : void 0,
        children: meta.statusLine.text
      }
    );
  };
  reactExports.useEffect(() => {
    if (success) {
      pushModal("BillingSuccess");
    }
  }, [success]);
  useOnPushModal("BillingSuccess", (open) => {
    if (!open) {
      setSuccess(null);
    }
  });
  if (currentProduct && currentPrice) {
    const eventsLimit = Number(currentProduct.metadata.eventsLimit);
    const eventsLeft = Math.max(
      0,
      eventsLimit - organization.subscriptionPeriodEventsCount
    );
    const periodStart = organization.subscriptionCurrentPeriodStart;
    const periodEnd = organization.subscriptionCurrentPeriodEnd;
    const periodLabel = periodStart && periodEnd ? `${formatDate(periodStart)} – ${formatDate(periodEnd)}` : null;
    const projection = periodStart && periodEnd ? projectUsage({
      used: organization.subscriptionPeriodEventsCount,
      limit: eventsLimit,
      periodStart,
      periodEnd,
      now: /* @__PURE__ */ new Date()
    }) : null;
    const isOverLimit = eventsLimit > 0 && organization.subscriptionPeriodEventsCount >= eventsLimit;
    const renderProjection = () => {
      if (isOverLimit) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: "Limit reached for this period. New events are not shown until the next period starts." });
      }
      if (!projection) {
        return null;
      }
      const pace = `${number.format(Math.round(projection.perDay))} events a day`;
      if (projection.limitReachedAt) {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-destructive", children: [
          "At ",
          pace,
          " the limit is reached around",
          " ",
          formatDate(projection.limitReachedAt),
          ", with about",
          " ",
          number.format(projection.projectedTotal),
          " events by period end."
        ] });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
        "At ",
        pace,
        " this period ends at about",
        " ",
        number.format(projection.projectedTotal),
        " events."
      ] });
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-8 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetHead, { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "title flex-1 truncate", children: currentProduct.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg", children: [
              discountedPrice !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-2 text-muted-foreground line-through", children: number.currency(currentPrice.priceAmount / 100) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: number.currency(
                discountedPrice ?? currentPrice.priceAmount / 100
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                " / ",
                recurringInterval === "year" ? "year" : "month"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetBody, { children: [
            renderStatus(),
            renderDiscount(),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col mt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row mb-2 items-baseline justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold", children: [
                  number.format(organization.subscriptionPeriodEventsCount),
                  " ",
                  "/ ",
                  number.format(eventsLimit),
                  " events"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
                  number.format(eventsLeft),
                  " left"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Progress,
                {
                  size: "sm",
                  value: eventsLimit ? organization.subscriptionPeriodEventsCount / eventsLimit * 100 : 0
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col mt-2 gap-1", children: [
                periodLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
                  "Current period ",
                  periodLabel
                ] }),
                renderProjection()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row mt-4 justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    loading: portalMutation.isPending,
                    onClick: () => portalMutation.mutate({ organizationId: organization.id }),
                    size: "sm",
                    variant: "outline",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "svg",
                        {
                          className: "mr-2 size-4",
                          fill: "none",
                          height: "300",
                          viewBox: "0 0 300 300",
                          width: "300",
                          xmlns: "http://www.w3.org/2000/svg",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("g", { "clip-path": "url(#clip0_1_4)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "path",
                              {
                                "clip-rule": "evenodd",
                                d: "M66.4284 274.26C134.876 320.593 227.925 302.666 274.258 234.219C320.593 165.771 302.666 72.7222 234.218 26.3885C165.77 -19.9451 72.721 -2.0181 26.3873 66.4297C-19.9465 134.877 -2.01938 227.927 66.4284 274.26ZM47.9555 116.67C30.8375 169.263 36.5445 221.893 59.2454 256.373C18.0412 217.361 7.27564 150.307 36.9437 92.318C55.9152 55.2362 87.5665 29.3937 122.5 18.3483C90.5911 36.7105 62.5549 71.8144 47.9555 116.67ZM175.347 283.137C211.377 272.606 244.211 246.385 263.685 208.322C293.101 150.825 282.768 84.4172 242.427 45.2673C264.22 79.7626 269.473 131.542 252.631 183.287C237.615 229.421 208.385 265.239 175.347 283.137ZM183.627 266.229C207.945 245.418 228.016 210.604 236.936 168.79C251.033 102.693 232.551 41.1978 195.112 20.6768C214.97 47.3945 225.022 99.2902 218.824 157.333C214.085 201.724 200.814 240.593 183.627 266.229ZM63.7178 131.844C49.5155 198.43 68.377 260.345 106.374 280.405C85.9962 254.009 75.5969 201.514 81.8758 142.711C86.5375 99.0536 99.4504 60.737 116.225 35.0969C92.2678 55.983 72.5384 90.4892 63.7178 131.844ZM199.834 149.561C200.908 217.473 179.59 272.878 152.222 273.309C124.853 273.742 101.797 219.039 100.724 151.127C99.6511 83.2138 120.968 27.8094 148.337 27.377C175.705 26.9446 198.762 81.648 199.834 149.561Z",
                                fill: "currentColor",
                                "fill-rule": "evenodd"
                              }
                            ) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("clipPath", { id: "clip0_1_4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { fill: "white", height: "300", width: "300" }) }) })
                          ]
                        }
                      ),
                      "Customer portal"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row gap-2", children: [
                  isPauseState && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      loading: resumeMutation.isPending,
                      onClick: () => resumeMutation.mutate({
                        organizationId: organization.id
                      }),
                      size: "sm",
                      children: organization.subscriptionState === "paused" ? "Resume subscription" : "Keep subscription"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      onClick: () => pushModal("SelectBillingPlan", {
                        organization,
                        currentProduct
                      }),
                      size: "sm",
                      variant: isPauseState ? "outline" : "default",
                      children: organization.isWillBeCanceled ? "Reactivate subscription" : "Change subscription"
                    }
                  )
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BillingFaq, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BillingUsage, { organization })
    ] });
  }
  const daysLeft = organization.subscriptionEndsAt ? differenceInDays(organization.subscriptionEndsAt, /* @__PURE__ */ new Date()) + 1 : null;
  const trialLimit = organization.subscriptionPeriodEventsLimit;
  const trialUsed = organization.subscriptionPeriodEventsCount;
  const hasTrial = organization.isTrial && trialLimit > 0;
  const trialUsedUp = hasTrial && trialUsed >= trialLimit;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Widget, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { className: "col gap-3", children: hasTrial ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row flex-wrap items-baseline justify-between gap-x-6 gap-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: trialUsedUp ? "warning" : "secondary", children: "Free trial" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: trialUsedUp ? "All trial events used" : daysLeft === 1 ? "Last day" : `${daysLeft} days left` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground tabular-nums", children: [
          number.format(Math.min(trialUsed, trialLimit)),
          " of",
          " ",
          number.format(trialLimit),
          " events used"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { size: "sm", value: usedPercent(trialUsed, trialLimit) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: trialUsedUp ? "New events are not being recorded. Everything collected so far is kept: choose a plan below and recording starts again straight away." : `Your trial runs until ${organization.subscriptionEndsAt ? formatDate(organization.subscriptionEndsAt) : "its end date"} or ${number.format(trialLimit)} events, whichever comes first. Choose a plan any time to keep everything running without a gap.` })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "No active plan" }) }),
      organization.isTrial ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Each email address gets one free trial, and yours was used on an earlier workspace. Choose a plan below to start recording events here." }) : renderStatus()
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full self-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "title", children: "Choose your plan" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { className: "col gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          BillingPlanPicker,
          {
            currentProduct,
            organization
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "title", children: "Every plan includes" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "col gap-2", children: PLAN_INCLUDES.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "row items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mt-0.5 size-4 shrink-0 text-emerald-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item })
          ] }, item)) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BillingFaq, {})
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BillingUsage, { organization })
  ] });
}
function OrganizationPage() {
  const {
    organizationId
  } = Route.useParams();
  const trpc = useTRPC();
  const {
    data: organization,
    isLoading
  } = useQuery(trpc.organization.get.queryOptions({
    organizationId
  }));
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FullPageLoadingState, {});
  }
  if (!organization) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { description: "This workspace doesn't exist or you don't have access to it.", icon: Building2, title: "Workspace not found", variant: "page" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { className: "mb-8", description: "Manage your billing here", title: "Billing" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Billing, { organization })
  ] });
}
export {
  OrganizationPage as component
};
//# sourceMappingURL=_app._organizationId.billing-DdWm6Otq.js.map
