import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { e as useAppParams, a as useTRPC, ak as useQueryClient, I as useAppContext, j as useQuery, b as useMutation, as as Ut, b4 as Skeleton, L as LinkButton, B as Button, e4 as LoaderCircle, eH as Select, eI as SelectTrigger, eJ as SelectValue, eK as SelectContent, eL as SelectItem, bT as CircleX, h$ as CircleCheckBig, M as Badge } from "./router-gBnYxPzA.js";
import { f as formatDistanceToNow } from "./formatDistanceToNow-C3KGcHU7.js";
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
import "./differenceInMonths-nSGUi53F.js";
import "./endOfMonth-C3pRd8ne.js";
const GSC_SELF_HOSTING_DOCS_URL = "https://docs.flarepanel.dev/self-hosting/deploy#google-search-console-seo-page";
function GscSettings() {
  const {
    projectId
  } = useAppParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const {
    isSelfHosted
  } = useAppContext();
  const [selectedSite, setSelectedSite] = reactExports.useState("");
  const providersQuery = useQuery(trpc.auth.providers.queryOptions());
  const connectionQuery = useQuery(trpc.gsc.getConnection.queryOptions({
    projectId
  }, {
    refetchInterval: 5e3
  }));
  const sitesQuery = useQuery(trpc.gsc.getSites.queryOptions({
    projectId
  }, {
    enabled: !!connectionQuery.data && !connectionQuery.data.siteUrl
  }));
  const initiateOAuth = useMutation(trpc.gsc.initiateOAuth.mutationOptions({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => {
      Ut.error("Failed to initiate Google Search Console connection");
    }
  }));
  const selectSite = useMutation(trpc.gsc.selectSite.mutationOptions({
    onSuccess: () => {
      Ut.success("Site connected", {
        description: "Backfill of 6 months of data has started."
      });
      queryClient.invalidateQueries(trpc.gsc.getConnection.pathFilter());
    },
    onError: () => {
      Ut.error("Failed to select site");
    }
  }));
  const disconnect = useMutation(trpc.gsc.disconnect.mutationOptions({
    onSuccess: () => {
      Ut.success("Disconnected from Google Search Console");
      queryClient.invalidateQueries(trpc.gsc.getConnection.pathFilter());
    },
    onError: () => {
      Ut.error("Failed to disconnect");
    }
  }));
  const connection = connectionQuery.data;
  const isGscConfigured = providersQuery.data?.gsc ?? false;
  if (connectionQuery.isLoading || providersQuery.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }) });
  }
  if (!(connection || isGscConfigured)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-lg", children: "Google Search Console" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground text-sm", children: "Connect your Google Search Console property to import search performance data." })
      ] }),
      isSelfHosted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 rounded-lg border p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm", children: [
          "Google Search Console is not set up on this server yet. Whoever runs it creates a Google OAuth client in Google Cloud and adds three secrets to the API Worker: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "GOOGLE_CLIENT_ID" }),
          ",",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "GOOGLE_CLIENT_SECRET" }),
          " and",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "GSC_GOOGLE_REDIRECT_URI" }),
          ". The guide walks through it."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LinkButton, { className: "w-fit", href: GSC_SELF_HOSTING_DOCS_URL, target: "_blank", variant: "outline", children: "Open the setup guide" })
      ] }) : (
        // Hosted: customers cannot set this up, so no operator steps.
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 rounded-lg border p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Coming soon on FlarePanel Cloud" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Connecting Google Search Console is not switched on yet. The rest of your analytics works as usual, and this tab will show a Connect button once it is ready." })
        ] })
      )
    ] });
  }
  if (!connection) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-lg", children: "Google Search Console" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground text-sm", children: "Connect your Google Search Console property to import search performance data." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 rounded-lg border p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "You will be redirected to Google to authorize access. Only read-only access to Search Console data is requested." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-fit", disabled: initiateOAuth.isPending, onClick: () => initiateOAuth.mutate({
          projectId
        }), children: [
          initiateOAuth.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
          "Connect Google Search Console"
        ] })
      ] })
    ] });
  }
  if (!connection.siteUrl) {
    const sites = sitesQuery.data ?? [];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-lg", children: "Select a property" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground text-sm", children: "Choose which Google Search Console property to connect to this project." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 rounded-lg border p-6", children: sitesQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }) : sites.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "No Search Console properties found for this Google account." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: setSelectedSite, value: selectedSite, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a property..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: sites.map((site) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: site.siteUrl, children: site.siteUrl }, site.siteUrl)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !selectedSite || selectSite.isPending, onClick: () => selectSite.mutate({
          projectId,
          siteUrl: selectedSite
        }), children: [
          selectSite.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
          "Connect property"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => disconnect.mutate({
        projectId
      }), size: "sm", variant: "ghost", children: "Cancel" })
    ] });
  }
  if (connection.lastSyncStatus === "token_expired") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-lg", children: "Google Search Console" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground text-sm", children: "Connected to Google Search Console." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 rounded-lg border border-destructive/50 bg-destructive/5 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: "Authorization expired" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Your Google Search Console authorization has expired or been revoked. Please reconnect to continue syncing data." }),
        connection.lastSyncError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words text-muted-foreground text-xs tabular-nums", children: connection.lastSyncError }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-fit", disabled: initiateOAuth.isPending, onClick: () => initiateOAuth.mutate({
          projectId
        }), children: [
          initiateOAuth.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
          "Reconnect Google Search Console"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: disconnect.isPending, onClick: () => disconnect.mutate({
        projectId
      }), size: "sm", variant: "ghost", children: [
        disconnect.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Disconnect"
      ] })
    ] });
  }
  const syncStatusIcon = connection.lastSyncStatus === "success" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4" }) : connection.lastSyncStatus === "error" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }) : null;
  const syncStatusVariant = connection.lastSyncStatus === "success" ? "success" : connection.lastSyncStatus === "error" ? "destructive" : "secondary";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-lg", children: "Google Search Console" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground text-sm", children: "Connected to Google Search Console." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y rounded-lg border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: "Property" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm tabular-nums", children: connection.siteUrl })
      ] }),
      connection.backfillStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: "Backfill" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "capitalize", variant: connection.backfillStatus === "completed" ? "success" : connection.backfillStatus === "failed" ? "destructive" : connection.backfillStatus === "running" ? "default" : "secondary", children: [
          connection.backfillStatus === "running" && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-3 w-3 animate-spin" }),
          connection.backfillStatus
        ] })
      ] }),
      connection.lastSyncedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: "Last synced" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          connection.lastSyncStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "capitalize", variant: syncStatusVariant, children: [
            syncStatusIcon,
            connection.lastSyncStatus
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: formatDistanceToNow(new Date(connection.lastSyncedAt), {
            addSuffix: true
          }) })
        ] })
      ] }),
      connection.lastSyncError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-destructive text-sm", children: "Last error" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 break-words text-muted-foreground text-sm tabular-nums", children: connection.lastSyncError })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: disconnect.isPending, onClick: () => disconnect.mutate({
      projectId
    }), size: "sm", variant: "destructive", children: [
      disconnect.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
      "Disconnect"
    ] })
  ] });
}
export {
  GscSettings as component
};
//# sourceMappingURL=_app._organizationId._projectId.settings._tabs.gsc-Dv0VQKgn.js.map
