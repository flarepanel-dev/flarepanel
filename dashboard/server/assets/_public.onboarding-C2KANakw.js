import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { aq as useAuthClient, b as useMutation, ar as unwrap, as as Ut, at as INVITE_HEADER, au as useForm, av as a, aw as zSignUpEmail, ax as InputWithLabel, B as Button, ay as Route, I as useAppContext, a as useTRPC, j as useQuery, az as CircleAlert } from "./router-gBnYxPzA.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { a as AuthHeading } from "./auth-shell-kMzAqZTt.js";
import { C as CheckEmail, M as MailOpen, S as SignInOAuth, O as Or, A as AuthLegalLinks } from "./sign-in-oauth-AzJVS5rR.js";
import { P as PasswordInput } from "./password-input-X7xJVkt1.js";
import { t as trackFunnel, f as failureReason } from "./funnel-tracking-CMJu0A5n.js";
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
const validator = zSignUpEmail;
function SignUpEmailForm({
  inviteId,
  onVerificationSent
}) {
  const authClient = useAuthClient();
  const mutation = useMutation({
    mutationFn: ({ firstName, lastName, email, password }) => unwrap(
      authClient.signUp.email(
        {
          email,
          password,
          name: `${firstName} ${lastName}`,
          firstName,
          lastName
        },
        { headers: inviteId ? { [INVITE_HEADER]: inviteId } : void 0 }
      )
    ),
    onSuccess(data, variables) {
      const verificationRequired = !data.token;
      trackFunnel("auth_signup_succeeded", {
        provider: "email",
        hasInvite: Boolean(inviteId),
        verificationRequired
      });
      if (verificationRequired) {
        onVerificationSent(variables.email);
        return;
      }
      Ut.success("Successfully signed up");
      window.location.href = "/";
    },
    onError(error) {
      trackFunnel("auth_signup_failed", {
        provider: "email",
        reason: failureReason(error)
      });
      Ut.error(error.message);
    }
  });
  const form = useForm({
    resolver: a(validator)
  });
  const onSubmit = (values) => {
    trackFunnel("auth_provider_clicked", { page: "signup", provider: "email" });
    mutation.mutate(values);
  };
  const onInvalid = (errors) => {
    trackFunnel("auth_form_invalid", {
      page: "signup",
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            InputWithLabel,
            {
              autoComplete: "given-name",
              label: "First name",
              placeholder: "Ada",
              size: "xl",
              type: "text",
              ...form.register("firstName"),
              error: form.formState.errors.firstName?.message
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            InputWithLabel,
            {
              autoComplete: "family-name",
              label: "Last name",
              placeholder: "Lovelace",
              size: "xl",
              type: "text",
              ...form.register("lastName"),
              error: form.formState.errors.lastName?.message
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          InputWithLabel,
          {
            autoComplete: "email",
            inputMode: "email",
            label: "Email",
            placeholder: "you@company.com",
            size: "xl",
            type: "email",
            ...form.register("email"),
            error: form.formState.errors.email?.message
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PasswordInput,
          {
            autoComplete: "new-password",
            hint: "At least 8 characters",
            label: "Password",
            placeholder: "Pick a strong password",
            size: "xl",
            ...form.register("password"),
            error: form.formState.errors.password?.message
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "mt-1 w-full",
            loading: mutation.isPending,
            size: "xl",
            type: "submit",
            children: "Create account"
          }
        )
      ]
    }
  );
}
function Component() {
  const {
    inviteId
  } = Route.useSearch();
  const {
    isSelfHosted
  } = useAppContext();
  const trpc = useTRPC();
  const {
    data: providers
  } = useSuspenseQuery(trpc.auth.providers.queryOptions());
  const hasOAuthProviders = providers.google || providers.github;
  const [sentTo, setSentTo] = reactExports.useState(null);
  const {
    data: invite
  } = useQuery(trpc.organization.getInvite.queryOptions({
    inviteId
  }, {
    enabled: !!inviteId
  }));
  reactExports.useEffect(() => {
    trackFunnel("auth_page_viewed", {
      page: "signup",
      hasInvite: Boolean(inviteId),
      inviteExpired: invite?.isExpired ?? null,
      google: providers.google,
      github: providers.github
    });
  }, [inviteId, invite?.isExpired, providers.google, providers.github]);
  const signInHref = inviteId ? `/login?inviteId=${encodeURIComponent(inviteId)}` : "/login";
  const description = isSelfHosted ? "Set up your account on this FlarePanel instance." : "Start your 30-day free trial. No credit card required.";
  if (sentTo) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckEmail, { email: sentTo, onBack: () => setSentTo(null), organizationName: invite && !invite.isExpired ? invite.organization?.name : void 0, reason: "sign-up", signInHref });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col w-full gap-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthHeading, { description, title: "Create your account" }),
    invite && !invite.isExpired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-start gap-3 rounded-xl bg-def-200 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MailOpen, { className: "mt-0.5 shrink-0 text-highlight", size: 18 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
          "You are invited to ",
          invite.organization?.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Create your account and you will join the workspace right away." })
      ] })
    ] }),
    invite?.isExpired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-start gap-3 rounded-xl bg-destructive/10 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "mt-0.5 shrink-0 text-destructive", size: 18 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
          "The invitation to ",
          invite.organization?.name,
          " has expired"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Ask the workspace owner for a new one. You can still create an account now and join later." })
      ] })
    ] }),
    hasOAuthProviders && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-3", children: [
        providers.google && /* @__PURE__ */ jsxRuntimeExports.jsx(SignInOAuth, { inviteId, provider: "google", type: "sign-up" }),
        providers.github && /* @__PURE__ */ jsxRuntimeExports.jsx(SignInOAuth, { inviteId, provider: "github", type: "sign-up" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Or, { children: "or sign up with email" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SignUpEmailForm, { inviteId, onVerificationSent: setSentTo }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthLegalLinks, { signUp: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-muted-foreground text-sm", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "font-medium text-foreground underline", href: signInHref, children: "Sign in" })
    ] })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_public.onboarding-C2KANakw.js.map
