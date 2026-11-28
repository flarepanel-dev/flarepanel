import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { L as LogoSquare } from "./logo-BXfRcVLd.js";
import { b9 as useIsomorphicLayoutEffect, ba as frame, bb as LayoutGroupContext, bc as useReducedMotion, d as cn, bd as AnimatePresence, be as motion, a1 as Sparkles, bf as ArrowUp, I as useAppContext } from "./router-gBnYxPzA.js";
const notify = (node) => !node.isLayoutDirty && node.willUpdate(false);
function nodeGroup() {
  const nodes = /* @__PURE__ */ new Set();
  const subscriptions = /* @__PURE__ */ new WeakMap();
  const dirtyAll = () => nodes.forEach(notify);
  return {
    add: (node) => {
      nodes.add(node);
      subscriptions.set(node, node.addEventListener("willUpdate", dirtyAll));
    },
    remove: (node) => {
      nodes.delete(node);
      const unsubscribe = subscriptions.get(node);
      if (unsubscribe) {
        unsubscribe();
        subscriptions.delete(node);
      }
      dirtyAll();
    },
    dirty: dirtyAll
  };
}
const DeprecatedLayoutGroupContext = reactExports.createContext(null);
function useIsMounted() {
  const isMounted = reactExports.useRef(false);
  useIsomorphicLayoutEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
}
function useForceUpdate() {
  const isMounted = useIsMounted();
  const [forcedRenderCount, setForcedRenderCount] = reactExports.useState(0);
  const forceRender = reactExports.useCallback(() => {
    isMounted.current && setForcedRenderCount(forcedRenderCount + 1);
  }, [forcedRenderCount]);
  const deferredForceRender = reactExports.useCallback(() => frame.postRender(forceRender), [forceRender]);
  return [deferredForceRender, forcedRenderCount];
}
const shouldInheritGroup = (inherit) => inherit === true;
const shouldInheritId = (inherit) => shouldInheritGroup(inherit === true) || inherit === "id";
const LayoutGroup = ({ children, id, inherit = true }) => {
  const layoutGroupContext = reactExports.useContext(LayoutGroupContext);
  const deprecatedLayoutGroupContext = reactExports.useContext(DeprecatedLayoutGroupContext);
  const [forceRender, key] = useForceUpdate();
  const context = reactExports.useRef(null);
  const upstreamId = layoutGroupContext.id || deprecatedLayoutGroupContext;
  if (context.current === null) {
    if (shouldInheritId(inherit) && upstreamId) {
      id = id ? upstreamId + "-" + id : upstreamId;
    }
    context.current = {
      id,
      group: shouldInheritGroup(inherit) ? layoutGroupContext.group || nodeGroup() : nodeGroup()
    };
  }
  const memoizedContext = reactExports.useMemo(() => ({ ...context.current, forceRender }), [key]);
  return jsxRuntimeExports.jsx(LayoutGroupContext.Provider, { value: memoizedContext, children });
};
const SCRIPT = [
  { role: "user", text: "How did signups do this week?" },
  {
    role: "assistant",
    text: "Up 18% on last week: 1,284 signups against 1,089. The jump came on Tuesday.",
    chart: "trend"
  },
  { role: "user", text: "Where did they come from?" },
  {
    role: "assistant",
    text: "Mostly Google and Product Hunt. Direct visitors convert best.",
    chart: "breakdown"
  },
  { role: "user", text: "Build a funnel from pricing to checkout" },
  {
    role: "assistant",
    text: "41% of pricing visitors start checkout; the drop is on the plan step.",
    chart: "funnel"
  }
];
const THINKING_MS = 900;
const AFTER_USER_MS = 500;
const AFTER_ASSISTANT_MS = 2600;
const RESTART_MS = 5e3;
const ENTER_TRANSITION = {
  type: "spring",
  stiffness: 260,
  damping: 28
};
const INSTANT = { duration: 0 };
const TREND = [96, 132, 148, 212, 240, 226, 230];
const BREAKDOWN = [
  { label: "Google", value: 48 },
  { label: "Product Hunt", value: 27 },
  { label: "Direct", value: 17 },
  { label: "X / Twitter", value: 8 }
];
const FUNNEL = [
  { label: "Viewed pricing", value: 100, count: "3,120" },
  { label: "Picked a plan", value: 58, count: "1,810" },
  { label: "Started checkout", value: 41, count: "1,279" }
];
function useScriptedReplay(length, reducedMotion) {
  const [shown, setShown] = reactExports.useState(1);
  const [thinking, setThinking] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (reducedMotion) {
      setThinking(false);
      setShown(length);
      return;
    }
    if (shown >= length) {
      const restart = window.setTimeout(() => setShown(1), RESTART_MS);
      return () => window.clearTimeout(restart);
    }
    const next = SCRIPT[shown];
    const previous = SCRIPT[shown - 1];
    const timers = [];
    if (next?.role === "assistant") {
      timers.push(window.setTimeout(() => setThinking(true), AFTER_USER_MS));
      timers.push(
        window.setTimeout(() => {
          setThinking(false);
          setShown((count) => count + 1);
        }, AFTER_USER_MS + THINKING_MS)
      );
    } else {
      timers.push(
        window.setTimeout(
          () => setShown((count) => count + 1),
          previous?.role === "assistant" ? AFTER_ASSISTANT_MS : AFTER_USER_MS
        )
      );
    }
    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, [shown, length, reducedMotion]);
  return { shown, thinking };
}
function ChatPreview({ className }) {
  const reducedMotion = useReducedMotion() ?? false;
  const { shown, thinking } = useScriptedReplay(SCRIPT.length, reducedMotion);
  const turns = SCRIPT.slice(0, shown);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "aria-hidden": "true",
      className: cn(
        "flex max-h-[38rem] flex-col overflow-hidden rounded-xl border bg-background shadow-sm",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGroup, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 flex-col justify-end gap-3 overflow-hidden p-4 [mask-image:linear-gradient(to_bottom,transparent,black_3rem)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { initial: false, children: [
          turns.map((turn, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              animate: { opacity: 1, y: 0 },
              className: turn.role === "user" ? "flex justify-end" : "col gap-2",
              exit: { opacity: 0, transition: { duration: 0.15 } },
              initial: { opacity: 0, y: 16 },
              layout: "position",
              transition: reducedMotion ? INSTANT : ENTER_TRANSITION,
              children: turn.role === "user" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground text-sm", children: turn.text }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: turn.text }),
                turn.chart && /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { kind: turn.chart })
              ] })
            },
            `${index}-${turn.text}`
          )),
          thinking && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              animate: { opacity: 1, y: 0 },
              className: "op-shimmer font-medium text-muted-foreground text-sm",
              exit: { opacity: 0, transition: { duration: 0.15 } },
              initial: { opacity: 0, y: 8 },
              layout: "position",
              transition: reducedMotion ? INSTANT : ENTER_TRANSITION,
              children: "Thinking…"
            },
            "thinking"
          )
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row m-3 mt-0 items-center gap-3 rounded-2xl border bg-card px-4 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 shrink-0 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate text-muted-foreground/70 text-sm", children: "Ask about your data, build a chart, or ask how something works…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "center-center size-7 shrink-0 rounded-full bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "size-3.5" }) })
        ] })
      ]
    }
  );
}
function ChartCard({ kind }) {
  const titles = {
    trend: ["Signups", "Last 7 days, by day"],
    breakdown: ["Signups by referrer", "Last 7 days"],
    funnel: ["Pricing to checkout", "Last 30 days"]
  };
  const [title, subtitle] = titles[kind];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-xl border bg-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-3 pb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs", children: subtitle })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-1 pb-4", children: [
      kind === "trend" && /* @__PURE__ */ jsxRuntimeExports.jsx(TrendChart, {}),
      kind === "breakdown" && /* @__PURE__ */ jsxRuntimeExports.jsx(BreakdownChart, {}),
      kind === "funnel" && /* @__PURE__ */ jsxRuntimeExports.jsx(FunnelChart, {})
    ] })
  ] });
}
const TREND_WIDTH = 300;
const TREND_HEIGHT = 72;
function TrendChart() {
  const max = Math.max(...TREND);
  const stepX = TREND_WIDTH / (TREND.length - 1);
  const points = TREND.map(
    (value, index) => [
      index * stepX,
      TREND_HEIGHT - value / max * (TREND_HEIGHT - 8)
    ]
  );
  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,${TREND_HEIGHT} ${line} ${TREND_WIDTH},${TREND_HEIGHT}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-baseline gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-xl tabular-nums", children: "1,284" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-emerald-600 text-xs tabular-nums dark:text-emerald-400", children: "+18%" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "svg",
      {
        className: "h-[72px] w-full",
        preserveAspectRatio: "none",
        viewBox: `0 0 ${TREND_WIDTH} ${TREND_HEIGHT}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("title", { children: "Signups trend" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "polygon",
            {
              className: "fill-chart-0/15",
              points: area,
              vectorEffect: "non-scaling-stroke"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "polyline",
            {
              className: "stroke-chart-0",
              fill: "none",
              points: line,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              vectorEffect: "non-scaling-stroke"
            }
          )
        ]
      }
    )
  ] });
}
function BreakdownChart() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "col gap-2", children: BREAKDOWN.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "col gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row justify-between text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: row.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground tabular-nums", children: [
        row.value,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-def-200 dark:bg-def-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "h-full rounded-full bg-chart-0",
        style: { width: `${row.value}%` }
      }
    ) })
  ] }, row.label)) });
}
function FunnelChart() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "col gap-2", children: FUNNEL.map((step) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "col gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row justify-between text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: step.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground tabular-nums", children: [
        step.count,
        " · ",
        step.value,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded bg-def-200 dark:bg-def-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "h-full rounded bg-chart-0",
        style: { width: `${step.value}%` }
      }
    ) })
  ] }, step.label)) });
}
const ROTATE_EVERY_MS = 7e3;
const TESTIMONIALS = [
  {
    quote: "Web and product analytics built on Cloudflare. Add one script and see visitors, pages and sources within seconds.",
    author: "Built on Cloudflare"
  },
  {
    quote: "Events are taken at the Cloudflare location closest to your visitors. No cookies by default, and session replay masks what people type.",
    author: "Fast and private"
  },
  {
    quote: "Open source under AGPL-3.0. Use it here, or run the same code on your own Cloudflare account.",
    author: "Open source",
    site: "github.com/flarepanel-dev"
  }
];
function useRotatingIndex(length) {
  const [index, setIndex] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % length),
      ROTATE_EVERY_MS
    );
    return () => window.clearInterval(timer);
  }, [length]);
  return [index, setIndex];
}
function AuthShowcase() {
  const [index, setIndex] = useRotatingIndex(TESTIMONIALS.length);
  const testimonial = TESTIMONIALS[index] ?? TESTIMONIALS[0];
  return (
    // Pinned to the viewport so the page height never follows the chat
    // replay; the replay takes whatever height is left between the headline
    // and the testimonial, which always sits at the bottom.
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "relative hidden overflow-hidden lg:sticky lg:top-3 lg:m-3 lg:flex lg:h-[calc(100vh-1.5rem)] lg:flex-col lg:self-start lg:rounded-2xl lg:bg-def-200 lg:p-12 xl:p-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "aria-hidden": "true",
          className: "pointer-events-none absolute -top-40 -right-40 size-[32rem] rounded-full bg-highlight/10 blur-3xl"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col relative max-w-lg shrink-0 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-3xl leading-tight tracking-tight", children: "Ask your analytics a question. Get the chart back." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-muted-foreground [@media(max-height:820px)]:hidden", children: "Web and product analytics in one place, open source, and a chat that answers with charts." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-6 min-h-0 max-w-lg flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPreview, { className: "h-full" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("figure", { className: "col relative mt-6 max-w-lg shrink-0 gap-5 rounded-xl bg-background p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "blockquote",
          {
            className: "fade-in animate-in text-base leading-relaxed duration-500 motion-reduce:animate-none",
            children: [
              "“",
              testimonial.quote,
              "”"
            ]
          },
          testimonial.author
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("figcaption", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: testimonial.author }),
            testimonial.site && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              " ",
              "· ",
              testimonial.site
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": "true", className: "row gap-1.5", children: TESTIMONIALS.map((item, dotIndex) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: cn(
                "h-1.5 rounded-full transition-all",
                dotIndex === index ? "w-5 bg-foreground" : "w-1.5 bg-def-400 hover:bg-foreground/60"
              ),
              onClick: () => setIndex(dotIndex),
              tabIndex: -1,
              type: "button"
            },
            item.author
          )) })
        ] })
      ] })
    ] })
  );
}
const SELF_HOSTED_LINKS = [
  { label: "FlarePanel Cloud", href: "https://flarepanel.dev" },
  {
    label: "Mixpanel alternative",
    href: "https://flarepanel.dev/compare/mixpanel-alternative"
  },
  {
    label: "PostHog alternative",
    href: "https://flarepanel.dev/compare/posthog-alternative"
  },
  {
    label: "Open source analytics",
    href: "https://flarepanel.dev/articles/open-source-web-analytics"
  }
];
function AuthShell({ children }) {
  const { isSelfHosted } = useAppContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between p-6 lg:px-10 lg:py-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            className: "row items-center gap-2.5 font-medium",
            href: "https://flarepanel.dev",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LogoSquare, { className: "size-8 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "FlarePanel" })
            ]
          }
        ),
        isSelfHosted && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-def-200 px-2.5 py-1 text-muted-foreground text-xs", children: "Self-hosted" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex flex-1 items-center justify-center px-6 py-6 lg:px-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-[400px]", children }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "p-6 text-center text-muted-foreground text-xs lg:px-10", children: isSelfHosted ? /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "row flex-wrap justify-center gap-x-4 gap-y-1", children: SELF_HOSTED_LINKS.map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "hover:text-foreground", href: link.href, children: link.label }) }, link.href)) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Open source product analytics · flarepanel.dev" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthShowcase, {})
  ] });
}
function AuthHeading({
  title,
  description
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-2xl tracking-tight", children: title }),
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-muted-foreground", children: description })
  ] });
}
export {
  AuthShell as A,
  AuthHeading as a
};
//# sourceMappingURL=auth-shell-kMzAqZTt.js.map
