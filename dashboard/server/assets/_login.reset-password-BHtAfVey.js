import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { $ as useNavigate, aq as useAuthClient, b as useMutation, ar as unwrap, as as Ut, au as useForm, av as a, aL as zResetPassword, B as Button, aM as Route } from "./router-gBnYxPzA.js";
import { a as AuthHeading } from "./auth-shell-kMzAqZTt.js";
import { P as PasswordInput } from "./password-input-X7xJVkt1.js";
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
const validator = zResetPassword;
function ResetPasswordForm({ token }) {
  const navigate = useNavigate();
  const authClient = useAuthClient();
  const mutation = useMutation({
    mutationFn: ({ token: token2, password }) => unwrap(authClient.resetPassword({ token: token2, newPassword: password })),
    onSuccess() {
      Ut.success("Password reset successfully");
      navigate({
        to: "/login"
      });
    },
    onError(error) {
      Ut.error(error.message);
    }
  });
  const form = useForm({
    resolver: a(validator),
    defaultValues: {
      token: token ?? "",
      password: ""
    }
  });
  const onSubmit = form.handleSubmit(async (data) => {
    mutation.mutate(data);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AuthHeading,
      {
        description: "Choose a new password for your account.",
        title: "Reset your password"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "col gap-5", method: "post", onSubmit, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        PasswordInput,
        {
          autoComplete: "new-password",
          error: form.formState.errors.password?.message,
          hint: "At least 8 characters",
          label: "New password",
          placeholder: "New password",
          size: "xl",
          ...form.register("password")
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { loading: mutation.isPending, size: "xl", type: "submit", children: "Reset password" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-muted-foreground text-sm", children: [
      "Remembered it after all?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "font-medium text-foreground underline", href: "/login", children: "Sign in" })
    ] })
  ] });
}
function Component() {
  const {
    token
  } = Route.useSearch();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col w-full gap-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResetPasswordForm, { token }) });
}
export {
  Component as component
};
//# sourceMappingURL=_login.reset-password-BHtAfVey.js.map
