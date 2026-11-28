import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { aB as Route, aq as useAuthClient, b as useMutation, ar as unwrap, aC as AuthError, as as Ut, aD as Alert, az as CircleAlert, aE as AlertTitle, aF as AlertDescription, L as LinkButton, aG as Spinner } from "./router-gBnYxPzA.js";
import { a as AuthHeading } from "./auth-shell-kMzAqZTt.js";
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
import "./logo-BXfRcVLd.js";
const VERIFY_ERROR_MESSAGES = {
  TOKEN_EXPIRED: "This verification link has expired.",
  INVALID_TOKEN: "This verification link is not valid.",
  USER_NOT_FOUND: "The account for this link no longer exists."
};
function Component() {
  const {
    token
  } = Route.useSearch();
  const authClient = useAuthClient();
  const mutation = useMutation({
    mutationFn: () => unwrap(authClient.verifyEmail({
      query: {
        token
      }
    })),
    onSuccess() {
      trackFunnel("auth_email_verified");
      Ut.success("Email verified");
      window.location.href = "/";
    },
    onError(error) {
      trackFunnel("auth_email_verify_failed", {
        reason: error instanceof AuthError ? error.code : void 0
      });
    }
  });
  const started = reactExports.useRef(false);
  const {
    mutate
  } = mutation;
  reactExports.useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;
    mutate();
  }, [mutate]);
  if (mutation.isError) {
    const code = mutation.error instanceof AuthError ? mutation.error.code : void 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col w-full gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AuthHeading, { title: "We could not verify your email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: code && VERIFY_ERROR_MESSAGES[code] || mutation.error.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "Sign in with your email and password and we will send you a new link." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LinkButton, { href: "/login", size: "xl", children: "Go to sign in" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-busy": true, className: "col w-full items-center gap-4 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { "aria-hidden": true, size: "md" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", role: "status", children: "Verifying your email…" })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_login.verify-email-BVTAauUu.js.map
