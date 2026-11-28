import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { c as createLucideIcon, a as useTRPC, B as Button, H as pushModal } from "./router-gBnYxPzA.js";
import { b as Widget, a as WidgetHead, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { S as ShieldCheck } from "./shield-check-BB0G9P-m.js";
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
const __iconNode$1 = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "M12 8v4", key: "1got3b" }],
  ["path", { d: "M12 16h.01", key: "1drbdi" }]
];
const ShieldAlert = createLucideIcon("shield-alert", __iconNode$1);
const __iconNode = [
  ["path", { d: "m2 2 20 20", key: "1ooewy" }],
  [
    "path",
    {
      d: "M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71",
      key: "1jlk70"
    }
  ],
  [
    "path",
    {
      d: "M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264",
      key: "18rp1v"
    }
  ]
];
const ShieldOff = createLucideIcon("shield-off", __iconNode);
function Component() {
  const trpc = useTRPC();
  const status = useSuspenseQuery(trpc.auth.twoFactorStatus.queryOptions());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full max-w-screen-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Two-factor authentication" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetBody, { className: "col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Protect your account with an authenticator app (Google Authenticator, 1Password, Authy, etc.). You'll be asked for a 6-digit code each time you sign in with email and password." }),
      status.data.enabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(EnabledView, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(DisabledView, { hasPassword: status.data.hasPassword, wasReset: status.data.wasReset })
    ] })
  ] });
}
function DisabledView({
  hasPassword,
  wasReset
}) {
  if (!hasPassword) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-2 rounded-md border border-border bg-def-100 px-4 py-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldOff, { className: "size-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Two-factor authentication is not available." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Your account signs in with Google or GitHub, which handle two-factor authentication in their account settings. Enable it in your provider's security settings." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    wasReset && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "size-4 text-amber-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Set up two-factor authentication again" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "We moved sign-in to a new system, and authenticator codes set up before the move no longer work there. Two-factor is off until you enable it again; remove the old FlarePanel entry from your authenticator app first." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center justify-between rounded-md border border-border bg-def-100 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldOff, { className: "size-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Two-factor authentication is disabled." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => pushModal("SetupTwoFactor"), size: "sm", children: "Enable" })
    ] })
  ] });
}
function EnabledView() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row items-center justify-between rounded-md border border-border bg-def-100 px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "center-center size-10 rounded-full bg-emerald-500/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-4 text-emerald-500" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Two-factor authentication is enabled." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => pushModal("RegenerateRecoveryCodes"), size: "sm", variant: "outline", children: "Regenerate recovery codes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => pushModal("DisableTwoFactor"), size: "sm", variant: "destructive", children: "Disable" })
    ] })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId.account._tabs.two-factor-CwjAQgdJ.js.map
