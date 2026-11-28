import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { aq as useAuthClient, b as useMutation, ar as unwrap, as as Ut, aH as InputOTP, aI as InputOTPGroup, aJ as InputOTPSlot, aK as Input, B as Button } from "./router-gBnYxPzA.js";
import { a as AuthHeading } from "./auth-shell-kMzAqZTt.js";
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
function VerifyPage() {
  const authClient = useAuthClient();
  const [mode, setMode] = reactExports.useState("totp");
  const [code, setCode] = reactExports.useState("");
  const mutation = useMutation({
    mutationFn: ({
      code: value
    }) => unwrap(mode === "totp" ? authClient.twoFactor.verifyTotp({
      code: value
    }) : authClient.twoFactor.verifyBackupCode({
      code: value.trim()
    })),
    onSuccess() {
      Ut.success("Signed in");
      window.location.href = "/";
    },
    onError(error) {
      Ut.error(error.message);
      setCode("");
    }
  });
  const canSubmit = mode === "totp" ? code.length === 6 : code.trim().length > 0;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }
    mutation.mutate({
      code
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "col w-full gap-8", onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthHeading, { description: mode === "totp" ? "Enter the 6-digit code from your authenticator app." : "Enter one of your recovery codes. Each code can be used only once.", title: "Two-factor authentication" }),
    mode === "totp" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col items-center gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTP, { autoFocus: true, disabled: mutation.isPending, maxLength: 6, onChange: (value) => {
      setCode(value);
      if (value.length === 6) {
        mutation.mutate({
          code: value
        });
      }
    }, value: code, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(InputOTPGroup, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 1 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 2 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 3 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 4 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 5 })
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Recovery code", autoCapitalize: "off", autoFocus: true, disabled: mutation.isPending, onChange: (e) => setCode(e.target.value), placeholder: "AbCdE-fGhIj", size: "xl", value: code }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !canSubmit, loading: mutation.isPending, size: "xl", type: "submit", children: "Verify" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-center text-muted-foreground text-sm transition-colors hover:text-foreground hover:underline", onClick: () => {
      setMode(mode === "totp" ? "recovery" : "totp");
      setCode("");
    }, type: "button", children: mode === "totp" ? "Use a recovery code instead" : "Use authenticator app instead" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "text-center text-muted-foreground text-sm hover:text-foreground hover:underline", href: "/login", children: "Sign in with a different account" })
  ] });
}
export {
  VerifyPage as component
};
//# sourceMappingURL=_login.verify-Ci-9dQtl.js.map
