import { x as useMatches, o as jsxRuntimeExports, O as Outlet } from "./worker-entry-C5kSRogq.js";
import { L as LogoSquare } from "./logo-BXfRcVLd.js";
import { c as createLucideIcon, d as cn, B as Button } from "./router-gBnYxPzA.js";
import { u as useLogout } from "./use-logout-BdPNsaMJ.js";
import { t as trackFunnel } from "./funnel-tracking-CMJu0A5n.js";
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
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }]
];
const LogOut = createLucideIcon("log-out", __iconNode);
const STEP_NAMES = ["Create project", "Install"];
const SHELL_BY_ROUTE = {
  "/_steps/onboarding/project": { step: 1, wide: false },
  "/_steps/onboarding/$projectId/connect": { step: 2, wide: true }
};
const DEFAULT_CONFIG = { step: 1, wide: false };
function useOnboardingShellConfig() {
  return useMatches({
    select: (matches) => {
      const stepMatch = matches.find(
        (match) => match.routeId in SHELL_BY_ROUTE
      );
      return stepMatch ? SHELL_BY_ROUTE[stepMatch.routeId] : DEFAULT_CONFIG;
    },
    structuralSharing: true
  });
}
function OnboardingLayout() {
  const logout = useLogout();
  const {
    step,
    wide
  } = useOnboardingShellConfig();
  const width = wide ? "max-w-5xl" : "max-w-2xl";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: cn("mx-auto flex w-full items-center justify-between px-6 py-6", width), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { className: "row items-center gap-2.5 font-medium", href: "/", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogoSquare, { className: "size-8 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "FlarePanel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { icon: LogOut, loading: logout.isPending, onClick: () => {
        trackFunnel("onboarding_signed_out", {
          step: STEP_NAMES[step - 1] ?? String(step)
        });
        logout.mutate();
      }, size: "sm", variant: "ghost", children: "Sign out" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: cn("mx-auto w-full px-6 pt-8 pb-24", width), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StepIndicator, { current: step }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
    ] })
  ] });
}
function StepIndicator({
  current
}) {
  const currentIndex = current - 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { "aria-label": "Onboarding progress", className: "col mb-8 gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm tabular-nums", children: [
      "Step ",
      current,
      " of ",
      STEP_NAMES.length
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "row gap-2", children: STEP_NAMES.map((name, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { "aria-current": index === currentIndex ? "step" : void 0, className: cn("h-1 flex-1 rounded-full transition-colors", index <= currentIndex ? "bg-foreground" : "bg-def-300"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: name }) }, name)) })
  ] });
}
export {
  OnboardingLayout as component
};
//# sourceMappingURL=_steps-CL1VllmT.js.map
