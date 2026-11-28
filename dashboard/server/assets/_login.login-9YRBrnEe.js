import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { a as AuthHeading } from "./auth-shell-kMzAqZTt.js";
import { L as LastUsedBadge, C as CheckEmail, S as SignInOAuth, O as Or, A as AuthLegalLinks } from "./sign-in-oauth-AzJVS5rR.js";
import { c as createLucideIcon, a as useTRPC, b as useMutation, as as Ut, B as Button, aq as useAuthClient, ar as unwrap, aC as AuthError, aN as EMAIL_NOT_VERIFIED, aO as toastAuthError, at as INVITE_HEADER, au as useForm, av as a, aP as zSignInEmail, ax as InputWithLabel, H as pushModal, aQ as Route, aR as useCookieStore, aD as Alert, az as CircleAlert, aE as AlertTitle, aF as AlertDescription } from "./router-gBnYxPzA.js";
import { P as PasswordInput } from "./password-input-X7xJVkt1.js";
import { t as trackFunnel, f as failureReason } from "./funnel-tracking-CMJu0A5n.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "./logo-BXfRcVLd.js";
import "./pick-CfnSzKDx.js";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
const __iconNode = [
  ["path", { d: "M12 19h8", key: "baeox8" }],
  ["path", { d: "m4 17 6-6-6-6", key: "1yngyt" }]
];
const Terminal = createLucideIcon("terminal", __iconNode);
function SignInDev({ inviteId }) {
  const trpc = useTRPC();
  const mutation = useMutation(
    trpc.auth.signInDev.mutationOptions({
      onSuccess(data) {
        if (data.type === "two_factor") {
          window.location.href = "/verify";
          return;
        }
        window.location.href = "/";
      },
      onError(error) {
        Ut.error(error.message);
      }
    })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      className: "w-full",
      icon: Terminal,
      loading: mutation.isPending,
      onClick: () => mutation.mutate({ inviteId }),
      size: "xl",
      variant: "secondary",
      children: "Dev login"
    }
  );
}
const validator = zSignInEmail;
function SignInEmailForm({
  isLastUsed,
  inviteId,
  onUnverified
}) {
  const authClient = useAuthClient();
  const mutation = useMutation({
    mutationFn: (values) => unwrap(
      authClient.signIn.email(values, {
        headers: inviteId ? { [INVITE_HEADER]: inviteId } : void 0
      })
    ),
    onSuccess(data) {
      const totpRequired = "twoFactorRedirect" in data;
      trackFunnel("auth_signin_succeeded", { provider: "email", totpRequired });
      if (totpRequired) {
        window.location.href = "/verify";
        return;
      }
      Ut.success("Successfully signed in");
      window.location.href = "/";
    },
    onError(error, variables) {
      const unverified = error instanceof AuthError && error.code === EMAIL_NOT_VERIFIED;
      trackFunnel("auth_signin_failed", {
        provider: "email",
        reason: unverified ? EMAIL_NOT_VERIFIED : failureReason(error)
      });
      if (unverified && onUnverified) {
        onUnverified(variables.email);
        return;
      }
      toastAuthError(error, variables.email);
    }
  });
  const form = useForm({
    resolver: a(validator),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const onSubmit = (values) => {
    trackFunnel("auth_provider_clicked", {
      page: "login",
      provider: "email",
      isLastUsed: Boolean(isLastUsed)
    });
    mutation.mutate(values);
  };
  const onInvalid = (errors) => {
    trackFunnel("auth_form_invalid", {
      page: "login",
      fields: Object.keys(errors)
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      className: "col gap-5",
      method: "post",
      onSubmit: form.handleSubmit(onSubmit, onInvalid),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          InputWithLabel,
          {
            ...form.register("email"),
            autoComplete: "email",
            error: form.formState.errors.email?.message,
            inputMode: "email",
            label: "Email",
            placeholder: "you@company.com",
            size: "xl",
            type: "email"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PasswordInput,
          {
            ...form.register("password"),
            action: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "text-muted-foreground text-sm transition-colors hover:text-foreground hover:underline",
                onClick: () => {
                  trackFunnel("auth_forgot_password_clicked");
                  pushModal("RequestPasswordReset", {
                    email: form.getValues("email")
                  });
                },
                type: "button",
                children: "Forgot password?"
              }
            ),
            error: form.formState.errors.password?.message,
            label: "Password",
            placeholder: "Your password",
            size: "xl"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              className: "w-full",
              loading: mutation.isPending,
              size: "xl",
              type: "submit",
              children: "Sign in"
            }
          ),
          isLastUsed && /* @__PURE__ */ jsxRuntimeExports.jsx(LastUsedBadge, {})
        ] })
      ]
    }
  );
}
const OAUTH_ERROR_MESSAGES = {
  account_not_linked: "Please sign in using your original authentication method",
  state_mismatch: "The sign-in took too long or was opened in another tab. Try again.",
  email_not_found: "Your provider did not share a verified email address",
  unable_to_get_user_info: "We could not get a verified email address from your provider. Verify your email with Google or GitHub and try again."
};
function signInErrorMessage(error, description) {
  return description || OAUTH_ERROR_MESSAGES[error] || error.replaceAll("_", " ");
}
function LoginPage() {
  const {
    error,
    error_description: errorDescription,
    correlationId,
    inviteId
  } = Route.useSearch();
  const trpc = useTRPC();
  const {
    data: providers
  } = useSuspenseQuery(trpc.auth.providers.queryOptions());
  const {
    data: registrationAllowed
  } = useSuspenseQuery(trpc.auth.registrationAllowed.queryOptions({
    inviteId
  }));
  const hasOAuthProviders = providers.google || providers.github;
  const [unverifiedEmail, setUnverifiedEmail] = reactExports.useState(null);
  const [lastProvider] = useCookieStore("last-auth-provider", null);
  reactExports.useEffect(() => {
    trackFunnel("auth_page_viewed", {
      page: "login",
      hasInvite: Boolean(inviteId),
      hadError: Boolean(error),
      google: providers.google,
      github: providers.github,
      lastProvider
    });
  }, [inviteId, error, providers.google, providers.github, lastProvider]);
  const signUpHref = inviteId ? `/onboarding?inviteId=${encodeURIComponent(inviteId)}` : "/onboarding";
  if (unverifiedEmail) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckEmail, { email: unverifiedEmail, onBack: () => setUnverifiedEmail(null), reason: "sign-in" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col w-full gap-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthHeading, { description: "Sign in to your FlarePanel account.", title: "Welcome back" }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Could not sign you in" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: signInErrorMessage(error, errorDescription) }),
        correlationId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2", children: [
          "Reference: ",
          correlationId,
          ".",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "font-medium underline", href: `mailto:hello@flarepanel.dev?subject=${encodeURIComponent(`Login Issue - Correlation ID: ${correlationId}`)}`, children: "Email us" }),
          " ",
          "and we will sort it out."
        ] })
      ] })
    ] }),
    hasOAuthProviders && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-3", children: [
        providers.google && /* @__PURE__ */ jsxRuntimeExports.jsx(SignInOAuth, { inviteId, isLastUsed: lastProvider === "google", provider: "google", type: "sign-in" }),
        providers.github && /* @__PURE__ */ jsxRuntimeExports.jsx(SignInOAuth, { inviteId, isLastUsed: lastProvider === "github", provider: "github", type: "sign-in" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Or, { children: "or continue with email" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SignInEmailForm, { inviteId, isLastUsed: lastProvider === "email", onUnverified: setUnverifiedEmail }),
    providers.devLogin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Or, { children: "local development" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SignInDev, { inviteId })
    ] }),
    registrationAllowed && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-muted-foreground text-sm", children: [
      "New to FlarePanel?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "font-medium text-foreground underline", href: signUpHref, children: "Create an account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthLegalLinks, {})
  ] });
}
export {
  LoginPage as component
};
//# sourceMappingURL=_login.login-9YRBrnEe.js.map
