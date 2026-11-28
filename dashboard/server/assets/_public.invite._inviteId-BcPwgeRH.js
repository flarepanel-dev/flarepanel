import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { dX as Route, a as useTRPC, $ as useNavigate, j as useQuery, b as useMutation, dM as handleError, B as Button, az as CircleAlert } from "./router-gBnYxPzA.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { a as AuthHeading } from "./auth-shell-kMzAqZTt.js";
import { u as useLogout } from "./use-logout-BdPNsaMJ.js";
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
function Component() {
  const {
    inviteId
  } = Route.useParams();
  const trpc = useTRPC();
  const navigate = useNavigate();
  const logout = useLogout();
  const {
    data: session
  } = useSuspenseQuery(trpc.auth.session.queryOptions());
  const {
    data: invite,
    isError
  } = useQuery(trpc.organization.getInvite.queryOptions({
    inviteId
  }));
  const accept = useMutation(trpc.organization.acceptInvite.mutationOptions({
    onSuccess({
      organizationId
    }) {
      navigate({
        to: "/$organizationId",
        params: {
          organizationId
        }
      });
    },
    onError: handleError
  }));
  if (isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(InviteProblem, { description: "It may have been revoked or already accepted.", title: "Invitation not found" });
  }
  if (!invite) {
    return null;
  }
  const organizationName = invite.organization?.name ?? "the workspace";
  if (invite.isExpired) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(InviteProblem, { description: "Ask the workspace owner for a new one.", title: `The invitation to ${organizationName} has expired` });
  }
  const signedInEmail = session.user?.email ?? "";
  const isInvitedAccount = signedInEmail.toLowerCase() === invite.email.toLowerCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col w-full gap-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthHeading, { description: isInvitedAccount ? `You were invited as ${invite.email}.` : `This invitation was sent to ${invite.email}, but you are signed in as ${signedInEmail}. Sign in with that address to accept it.`, title: `Join ${organizationName}` }),
    isInvitedAccount ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", loading: accept.isPending, onClick: () => accept.mutate({
      inviteId
    }), size: "xl", children: "Accept invitation" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", loading: logout.isPending, onClick: () => logout.mutate(), size: "xl", variant: "outline", children: "Sign out" })
  ] });
}
function InviteProblem({
  title,
  description
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-start gap-3 rounded-xl bg-destructive/10 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "mt-0.5 shrink-0 text-destructive", size: 18 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: description })
    ] })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_public.invite._inviteId-BcPwgeRH.js.map
