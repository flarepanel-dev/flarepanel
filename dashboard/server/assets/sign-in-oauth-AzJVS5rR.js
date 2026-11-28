import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, aq as useAuthClient, b as useMutation, ar as unwrap, as as Ut, B as Button, I as useAppContext, d as cn } from "./router-gBnYxPzA.js";
import { a as AuthHeading } from "./auth-shell-kMzAqZTt.js";
import { t as trackFunnel, f as failureReason } from "./funnel-tracking-CMJu0A5n.js";
const __iconNode = [
  [
    "path",
    {
      d: "M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z",
      key: "1jhwl8"
    }
  ],
  ["path", { d: "m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10", key: "1qfld7" }]
];
const MailOpen = createLucideIcon("mail-open", __iconNode);
const RESEND_COOLDOWN_SECONDS = 60;
const TICK_MS = 1e3;
function useCooldown(seconds) {
  const [endsAt, setEndsAt] = reactExports.useState(() => Date.now() + seconds * 1e3);
  const [now, setNow] = reactExports.useState(() => Date.now());
  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1e3));
  reactExports.useEffect(() => {
    if (remaining === 0) {
      return;
    }
    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, [remaining]);
  const restart = reactExports.useCallback(() => {
    const start = Date.now();
    setNow(start);
    setEndsAt(start + seconds * 1e3);
  }, [seconds]);
  return { remaining, restart };
}
function CheckEmail({
  email,
  reason,
  onBack,
  organizationName,
  signInHref = "/login"
}) {
  const authClient = useAuthClient();
  const { remaining, restart } = useCooldown(RESEND_COOLDOWN_SECONDS);
  const mutation = useMutation({
    mutationFn: () => unwrap(authClient.sendVerificationEmail({ email })),
    onSuccess() {
      trackFunnel("auth_verification_resent", { page: reason });
      Ut.success("We sent you a new link");
      restart();
    },
    onError(error) {
      Ut.error(error.message);
    }
  });
  const signUp = reason === "sign-up";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col w-full gap-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AuthHeading,
      {
        description: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          signUp ? "We sent a verification link to " : "Your email address is not verified yet. We sent a new link to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: email }),
          ".",
          " ",
          signUp ? "Open it to finish creating your account." : "Open it to sign in."
        ] }),
        title: signUp ? "Check your inbox" : "Verify your email"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-start gap-3 rounded-xl bg-def-200 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MailOpen, { className: "mt-0.5 shrink-0 text-highlight", size: 18 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "The link works for 24 hours" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm", children: [
          organizationName ? `You will join ${organizationName} as soon as you open it. ` : "",
          "Nothing after a few minutes? Check your spam folder, then send it again."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        disabled: remaining > 0,
        loading: mutation.isPending,
        onClick: () => mutation.mutate(),
        size: "xl",
        type: "button",
        variant: "secondary",
        children: remaining > 0 ? `Resend email in ${remaining}s` : "Resend email"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-2 text-center text-muted-foreground text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        signUp ? "Wrong address? " : "Another account? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "font-medium text-foreground underline",
            onClick: onBack,
            type: "button",
            children: signUp ? "Use a different email" : "Back to sign in"
          }
        )
      ] }),
      signUp && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Already verified?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            className: "font-medium text-foreground underline",
            href: signInHref,
            children: "Sign in"
          }
        )
      ] })
    ] })
  ] });
}
function isFlarePanelCloud(dashboardUrl) {
  try {
    return new URL(dashboardUrl ?? "").hostname.endsWith("flarepanel.dev");
  } catch {
    return false;
  }
}
function LegalLink({ href, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "a",
    {
      className: "underline hover:text-foreground",
      href,
      rel: "noreferrer",
      target: "_blank",
      children
    }
  );
}
function AuthLegalLinks({ signUp = false }) {
  const { dashboardUrl } = useAppContext();
  if (!isFlarePanelCloud(dashboardUrl)) {
    return null;
  }
  const terms = /* @__PURE__ */ jsxRuntimeExports.jsx(LegalLink, { href: "https://flarepanel.dev/terms", children: "Terms of Service" });
  const privacy = /* @__PURE__ */ jsxRuntimeExports.jsx(LegalLink, { href: "https://flarepanel.dev/privacy", children: "Privacy Policy" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground text-xs leading-relaxed", children: signUp ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    "By creating an account you agree to the ",
    terms,
    " and ",
    privacy,
    "."
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    terms,
    " · ",
    privacy,
    " ·",
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(LegalLink, { href: "https://flarepanel.dev/refunds", children: "Refund policy" })
  ] }) });
}
function Or({
  className,
  children = "or"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("row items-center gap-4", className), role: "separator", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border" })
  ] });
}
function LastUsedBadge() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-2.5 right-3 rounded-full bg-highlight px-2 py-0.5 font-medium text-2xs text-white leading-none", children: "Used last time" });
}
const PROVIDER_LABELS = {
  google: "Google",
  github: "GitHub"
};
function GoogleIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      "aria-hidden": "true",
      className: "size-5 shrink-0",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z",
            fill: "#4285F4"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",
            fill: "#34A853"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z",
            fill: "#FBBC05"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",
            fill: "#EA4335"
          }
        )
      ]
    }
  );
}
function GithubIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "svg",
    {
      "aria-hidden": "true",
      className: "size-5 shrink-0",
      fill: "currentColor",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" })
    }
  );
}
function SignInOAuth({
  provider,
  type,
  inviteId,
  isLastUsed
}) {
  const authClient = useAuthClient();
  const { dashboardUrl } = useAppContext();
  const mutation = useMutation({
    // better-auth sends the browser to the provider itself.
    mutationFn: () => unwrap(
      authClient.signIn.social({
        provider,
        callbackURL: dashboardUrl,
        errorCallbackURL: `${dashboardUrl}/login`,
        additionalData: inviteId ? { inviteId } : void 0
      })
    ),
    onError(error) {
      trackFunnel(
        type === "sign-in" ? "auth_signin_failed" : "auth_signup_failed",
        { provider, reason: failureReason(error) }
      );
      Ut.error(error.message);
    }
  });
  const verb = type === "sign-in" ? "Sign in" : "Sign up";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        className: "w-full gap-3 border-def-300 bg-background hover:bg-def-100 dark:hover:bg-def-200",
        loading: mutation.isPending,
        onClick: () => {
          trackFunnel("auth_provider_clicked", {
            page: type === "sign-in" ? "login" : "signup",
            provider,
            isLastUsed: Boolean(isLastUsed)
          });
          mutation.mutate();
        },
        size: "xl",
        variant: "outline",
        children: [
          provider === "google" ? /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(GithubIcon, {}),
          verb,
          " with ",
          PROVIDER_LABELS[provider]
        ]
      }
    ),
    isLastUsed && /* @__PURE__ */ jsxRuntimeExports.jsx(LastUsedBadge, {})
  ] });
}
export {
  AuthLegalLinks as A,
  CheckEmail as C,
  LastUsedBadge as L,
  MailOpen as M,
  Or as O,
  SignInOAuth as S
};
//# sourceMappingURL=sign-in-oauth-AzJVS5rR.js.map
