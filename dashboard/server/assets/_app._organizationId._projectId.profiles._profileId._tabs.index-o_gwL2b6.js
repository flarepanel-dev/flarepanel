import { o as jsxRuntimeExports, b as useRouter, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { A as AiUsageWidget } from "./ai-usage-widget-BIinfAEm.js";
import { b as AI_INTERNAL_EVENT_NAMES } from "./ai-cost-C8tzxtic.js";
import { e as useAppParams, d as cn, gW as EventIcon, S as SerieIcon, bE as Tooltiper, h as getProfileName, A as Link, a as useTRPC, j as useQuery, fE as Activity, B as Button, hD as ScrollArea, bt as ReportChart, N as Users, P as ProjectLink, cK as OverviewMetricCard, c4 as useQueryState, cS as parseAsStringEnum, bn as formatDateTime, E as EmptyState, iu as Route } from "./router-gBnYxPzA.js";
import { u as useEventDrawer } from "./use-event-drawer-DCAhkqzM.js";
import { W as WidgetHead, d as WidgetTitle, e as WidgetAbsoluteButtons, a as WidgetButtons } from "./overview-widget-q0VDaTtp.js";
import { b as Widget, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { M as MostEvents } from "./most-events-DZTLKeUn.js";
import { P as PopularRoutes } from "./popular-routes-o-BP_rMn.js";
import { P as ProfileActivity } from "./profile-activity-N0HlZRnj.js";
import { K as KeyValueGrid } from "./key-value-grid-BaTCXsBI.js";
import { T as Tag } from "./tag-vAspD_4c.js";
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
import "./last-C7omGuiv.js";
import "./route-Cx_TL1Oz.js";
import "./startOfMonth-Bf6CczcY.js";
import "./endOfMonth-C3pRd8ne.js";
import "./countries-CS917BhP.js";
function EventListItem(props) {
  const { openEvent } = useEventDrawer();
  const { organizationId, projectId } = useAppParams();
  const { createdAt, name, path, meta } = props;
  const profile = "profile" in props && !props.hideProfile ? props.profile : null;
  const renderName = () => {
    if (name === "screen_view") {
      if (path.includes("/")) {
        return path;
      }
      return `Route: ${path}`;
    }
    return name.replace(/_/g, " ");
  };
  const isMinimal = "minimal" in props;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      className: cn(
        "card flex w-full items-center justify-between rounded-lg p-4 transition-colors hover:bg-light-background",
        meta?.conversion && `bg-${meta.color}-50 dark:bg-${meta.color}-900 hover:bg-${meta.color}-100 dark:hover:bg-${meta.color}-700`
      ),
      onClick: () => {
        if (!isMinimal) {
          openEvent({ id: props.id, createdAt });
        }
      },
      type: "button",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(EventIcon, { meta, name, size: "sm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: renderName() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pl-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex origin-left scale-75 gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: props.country }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: props.os }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: props.browser })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 gap-4 pl-4", children: [
          profile && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltiper, { asChild: true, content: getProfileName(profile), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              className: "max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground hover:underline",
              onClick: (e) => {
                e.stopPropagation();
              },
              params: {
                organizationId,
                projectId,
                profileId: profile.id
              },
              to: "/$organizationId/$projectId/profiles/$profileId",
              children: getProfileName(profile)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltiper, { asChild: true, content: createdAt.toLocaleString(), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: createdAt.toLocaleTimeString() }) })
        ] })
      ]
    }
  );
}
const LatestEvents = ({
  profileId,
  projectId,
  organizationId
}) => {
  const router = useRouter();
  const trpc = useTRPC();
  const query = useQuery(
    trpc.event.events.queryOptions({
      projectId,
      profileId,
      filters: [
        {
          name: "name",
          operator: "isNot",
          value: [...AI_INTERNAL_EVENT_NAMES]
        }
      ]
    })
  );
  const handleShowMore = () => {
    router.navigate({
      to: "/$organizationId/$projectId/profiles/$profileId/events",
      params: {
        organizationId,
        projectId,
        profileId
      }
    });
  };
  const ref = reactExports.useRef(null);
  const scrollRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (ref.current && scrollRef.current) {
      scrollRef.current.style.height = `${ref.current?.getBoundingClientRect().height}px`;
    }
  }, [query.data?.data?.length]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "h-full w-full overflow-hidden", ref, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetHead, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTitle, { icon: Activity, children: "Latest Events" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetAbsoluteButtons, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleShowMore, size: "sm", variant: "outline", children: "All" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-0 p-4", ref: scrollRef, children: query.data?.data?.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EventListItem, { ...event, hideProfile: true }) }, event.id)) })
  ] });
};
const CHART_OPTIONS = { hideTable: true };
const ProfileCharts = reactExports.memo(
  ({ profileId, projectId }) => {
    const pageViewsChart = {
      projectId,
      chartType: "linear",
      series: [
        {
          type: "event",
          segment: "event",
          filters: [
            {
              id: "profile_id",
              name: "profile_id",
              operator: "is",
              value: [profileId]
            }
          ],
          id: "A",
          name: "screen_view",
          displayName: "Events"
        }
      ],
      breakdowns: [
        {
          id: "path",
          name: "path"
        }
      ],
      lineType: "monotone",
      interval: "day",
      name: "Events",
      range: "30d",
      previous: false,
      metric: "sum"
    };
    const eventsChart = {
      projectId,
      chartType: "linear",
      series: [
        {
          type: "event",
          segment: "event",
          filters: [
            {
              id: "profile_id",
              name: "profile_id",
              operator: "is",
              value: [profileId]
            },
            {
              id: "name",
              name: "name",
              operator: "isNot",
              value: [...AI_INTERNAL_EVENT_NAMES]
            }
          ],
          id: "A",
          name: "*",
          displayName: "Events"
        }
      ],
      breakdowns: [
        {
          id: "name",
          name: "name"
        }
      ],
      lineType: "monotone",
      interval: "day",
      name: "Events",
      range: "30d",
      previous: false,
      metric: "sum"
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Page views" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportChart, { options: CHART_OPTIONS, report: pageViewsChart }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Events per day" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportChart, { options: CHART_OPTIONS, report: eventsChart }) })
      ] })
    ] });
  },
  (a, b) => {
    return a.profileId === b.profileId && a.projectId === b.projectId;
  }
);
const ProfileGroups = ({ projectId, groups }) => {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.group.listByIds.queryOptions({
      projectId,
      ids: groups
    })
  );
  if (groups.length === 0 || !query.data?.length) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex shrink-0 items-center gap-1.5 text-muted-foreground text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-3.5" }),
      "Groups"
    ] }),
    query.data.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      ProjectLink,
      {
        className: "inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-1 text-xs transition-colors hover:bg-muted",
        params: { groupId: group.id },
        to: "/groups/$groupId",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: group.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: group.type })
        ]
      },
      group.id
    ))
  ] });
};
const PROFILE_METRICS = [
  {
    title: "Sessions",
    key: "sessions",
    unit: "",
    inverted: false,
    hideOnZero: false
  },
  {
    title: "Events",
    key: "totalEvents",
    unit: "",
    inverted: false,
    hideOnZero: false
  },
  {
    title: "Page views",
    key: "screenViews",
    unit: "",
    inverted: false,
    hideOnZero: false
  },
  {
    title: "Avg session",
    key: "durationAvg",
    unit: "min",
    inverted: false,
    hideOnZero: false
  },
  {
    title: "Days active",
    key: "uniqueDaysActive",
    unit: "",
    inverted: false,
    hideOnZero: false
  },
  {
    title: "Revenue",
    key: "revenue",
    unit: "currency",
    inverted: false,
    hideOnZero: true
  },
  {
    title: "Bounce rate",
    key: "bounceRate",
    unit: "%",
    inverted: true,
    hideOnZero: false
  }
];
const VISIBLE_METRICS = 6;
const ProfileMetrics = ({ data }) => {
  if (!data) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card grid grid-cols-2 overflow-hidden rounded-md md:grid-cols-3", children: PROFILE_METRICS.filter(
    (metric) => !(metric.hideOnZero && data[metric.key] === 0)
  ).slice(0, VISIBLE_METRICS).map((metric) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    OverviewMetricCard,
    {
      data: [],
      id: metric.key,
      inverted: metric.inverted,
      isLoading: false,
      label: metric.title,
      metric: {
        current: data[metric.key] || 0,
        previous: null
      },
      unit: metric.unit
    },
    metric.key
  )) });
};
const ProfileProperties = ({ profile }) => {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringEnum(["profile", "properties"]).withDefault("profile")
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetHead, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "title", children: "Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetButtons, { children: [
        {
          key: "profile",
          btn: "Profile"
        },
        {
          key: "properties",
          btn: "Properties"
        }
      ].map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: cn(w.key === tab && "active"),
          onClick: () => setTab(w.key),
          type: "button",
          children: w.btn
        },
        w.key
      )) })
    ] }),
    tab === "profile" && profile && /* @__PURE__ */ jsxRuntimeExports.jsx(
      KeyValueGrid,
      {
        className: "border-0",
        columns: 1,
        copyable: true,
        data: [
          { name: "id", value: profile.id },
          { name: "firstName", value: profile.firstName },
          { name: "lastName", value: profile.lastName },
          { name: "email", value: profile.email },
          { name: "isExternal", value: profile.isExternal ? "Yes" : "No" },
          {
            name: "createdAt",
            value: formatDateTime(new Date(profile.createdAt))
          },
          {
            name: "lastSeenAt",
            value: formatDateTime(new Date(profile.lastSeenAt))
          },
          ...profile.properties.country ? [{ name: "country", value: profile.properties.country }] : [],
          ...profile.properties.city ? [{ name: "city", value: profile.properties.city }] : [],
          ...profile.properties.os ? [{ name: "os", value: profile.properties.os }] : [],
          ...profile.properties.browser ? [{ name: "browser", value: profile.properties.browser }] : [],
          ...profile.properties.device ? [{ name: "device", value: profile.properties.device }] : [],
          ...profile.properties.referrer_name ? [
            {
              name: "referrerName",
              value: profile.properties.referrer_name
            }
          ] : []
        ].map((item) => ({
          ...item,
          event: {
            ...profile,
            ...profile.properties
          }
        }))
      }
    ),
    tab === "properties" && profile && /* @__PURE__ */ jsxRuntimeExports.jsx(
      KeyValueGrid,
      {
        className: "border-0",
        columns: 1,
        copyable: true,
        data: Object.entries(profile.properties).filter(([, value]) => value !== void 0 && value !== "").map(([key, value]) => ({
          name: key,
          value,
          event: {
            ...profile,
            ...profile.properties
          }
        }))
      }
    ),
    !profile?.properties && /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        description: "Properties you pass to identify show up here.",
        icon: Tag,
        title: "No properties yet",
        variant: "inline"
      }
    )
  ] });
};
function Component() {
  const {
    profileId,
    projectId,
    organizationId
  } = Route.useParams();
  const trpc = useTRPC();
  const profile = useSuspenseQuery(trpc.profile.byId.queryOptions({
    profileId,
    projectId
  }));
  const metrics = useSuspenseQuery(trpc.profile.metrics.queryOptions({
    profileId,
    projectId
  }));
  const activity = useSuspenseQuery(trpc.profile.activity.queryOptions({
    profileId,
    projectId
  }));
  const mostEvents = useSuspenseQuery(trpc.profile.mostEvents.queryOptions({
    profileId,
    projectId
  }));
  const popularRoutes = useSuspenseQuery(trpc.profile.popularRoutes.queryOptions({
    profileId,
    projectId
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "col gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileProperties, { profile: profile.data }),
      profile.data?.groups?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileGroups, { groups: profile.data.groups, profileId, projectId }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(AiUsageWidget, { entity: {
        kind: "profile",
        profileId
      }, projectId })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col min-w-0 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileMetrics, { data: metrics.data }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileActivity, { data: activity.data }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LatestEvents, { organizationId, profileId, projectId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MostEvents, { data: mostEvents.data }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PopularRoutes, { data: popularRoutes.data }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileCharts, { profileId, projectId })
      ] })
    ] })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.profiles._profileId._tabs.index-o_gwL2b6.js.map
