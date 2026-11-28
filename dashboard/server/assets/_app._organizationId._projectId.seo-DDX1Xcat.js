import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { a as useTRPC, I as useAppContext, j as useQuery, e$ as keepPreviousData, W as Search, aK as Input, d as cn, az as CircleAlert, x as ChevronsUpDown, H as pushModal, f0 as OPLineChartLegend, ad as getChartColor, b4 as Skeleton, ai as BarChart, cN as Grid, b0 as YAxis, f1 as BarXAxis, aj as Bar, af as OPChartTooltip, f2 as OPLineChart, c8 as useOverviewOptions, bq as TriangleAlert, aV as Eye, b5 as TrendingUp, f3 as MousePointerClick, e as useAppParams, $ as useNavigate, E as EmptyState, B as Button, cK as OverviewMetricCard, f4 as GSC_CLICKS_SERIES, f5 as OverviewWidgetTable, S as SerieIcon } from "./router-gBnYxPzA.js";
import { O as OverviewInterval } from "./overview-interval-cSBL6ZB5.js";
import { O as OverviewRange } from "./overview-range-DoapqOyi.js";
import { P as Pagination } from "./pagination-Dj6_PitL.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { u as useRangePageContext } from "./use-page-context-helpers-DUMZv3Xw.js";
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
import "./ReportInterval-zZuTI3j-.js";
import "./differenceInDays-liXHUvyd.js";
import "./time-window-picker-BUBj3ZWF.js";
import "./index-DxXk7QJj.js";
import "./addDays-BIiJOlUZ.js";
import "./endOfMonth-C3pRd8ne.js";
import "./startOfMonth-Bf6CczcY.js";
import "./useIsFetching-BWA9Maly.js";
function GscCannibalization({
  projectId,
  range,
  interval,
  startDate,
  endDate
}) {
  const trpc = useTRPC();
  const { apiUrl } = useAppContext();
  const [expanded, setExpanded] = reactExports.useState(/* @__PURE__ */ new Set());
  const [page, setPage] = reactExports.useState(0);
  const [search, setSearch] = reactExports.useState("");
  const pageSize = 15;
  const query = useQuery(
    trpc.gsc.getCannibalization.queryOptions(
      {
        projectId,
        range,
        interval,
        startDate,
        endDate
      },
      { placeholderData: keepPreviousData }
    )
  );
  const toggle = (q) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(q)) {
        next.delete(q);
      } else {
        next.add(q);
      }
      return next;
    });
  };
  const allItems = query.data ?? [];
  const items = reactExports.useMemo(() => {
    if (!search.trim()) {
      return allItems;
    }
    const q = search.toLowerCase();
    return allItems.filter(
      (item) => item.query.toLowerCase().includes(q) || item.pages.some((p) => p.page.toLowerCase().includes(q))
    );
  }, [allItems, search]);
  const pageCount = Math.ceil(items.length / pageSize) || 1;
  reactExports.useEffect(() => {
    setPage((p) => Math.max(0, Math.min(p, pageCount - 1)));
  }, [items, pageSize, pageCount]);
  const paginatedItems = reactExports.useMemo(
    () => items.slice(page * pageSize, (page + 1) * pageSize),
    [items, page, pageSize]
  );
  const rangeStart = items.length ? page * pageSize + 1 : 0;
  const rangeEnd = Math.min((page + 1) * pageSize, items.length);
  if (!(query.isLoading || allItems.length)) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: "Keyword Cannibalization" }),
          items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground text-xs", children: items.length })
        ] }),
        items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap text-muted-foreground text-xs", children: items.length === 0 ? "0 results" : `${rangeStart}-${rangeEnd} of ${items.length}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Pagination,
            {
              canNextPage: page < pageCount - 1,
              canPreviousPage: page > 0,
              nextPage: () => setPage((p) => Math.min(pageCount - 1, p + 1)),
              pageIndex: page,
              previousPage: () => setPage((p) => Math.max(0, p - 1))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            className: "rounded-none border-0 border-t bg-transparent pl-9 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-0",
            onChange: (e) => {
              setSearch(e.target.value);
              setPage(0);
            },
            placeholder: "Search keywords",
            size: "sm",
            type: "search",
            value: search
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y", children: [
      query.isLoading && [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-1/3 animate-pulse rounded bg-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-1/2 animate-pulse rounded bg-muted" })
      ] }, i)),
      paginatedItems.map((item) => {
        const isOpen = expanded.has(item.query);
        const avgCtr = item.pages.reduce((s, p) => s + p.ctr, 0) / item.pages.length;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              className: "flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/40",
              onClick: () => toggle(item.query),
              type: "button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: cn(
                        "row shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-medium text-xs",
                        "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                      ),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-3" }),
                        item.pages.length,
                        " pages"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium text-sm", children: item.query })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "whitespace-nowrap text-muted-foreground text-xs tabular-nums", children: [
                    item.totalImpressions.toLocaleString(),
                    " impr ·",
                    " ",
                    (avgCtr * 100).toFixed(1),
                    "% avg CTR"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ChevronsUpDown,
                    {
                      className: cn(
                        "size-3.5 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                      )
                    }
                  )
                ] })
              ]
            }
          ),
          isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t bg-muted/20 px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-3 text-muted-foreground text-xs", children: [
              "These pages all rank for",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
                '"',
                item.query,
                '"'
              ] }),
              ". Consider consolidating weaker pages into the top-ranking one to concentrate link equity and avoid splitting clicks."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: item.pages.map((page2, idx) => {
              let cleanUrl = page2.page;
              let origin = "";
              let path = page2.page;
              try {
                const u = new URL(page2.page);
                u.hash = "";
                cleanUrl = u.toString();
                origin = u.origin;
                path = u.pathname + u.search;
              } catch {
                cleanUrl = page2.page.split("#")[0] ?? page2.page;
              }
              const isWinner = idx === 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  className: "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted/60",
                  onClick: () => pushModal("PageDetails", {
                    type: "page",
                    projectId,
                    value: cleanUrl
                  }),
                  type: "button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        alt: "",
                        className: "size-3.5 shrink-0 rounded-sm",
                        loading: "lazy",
                        onError: (e) => {
                          e.target.style.display = "none";
                        },
                        src: `${apiUrl}/misc/favicon?url=${origin}&v=2`
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 truncate text-xs tabular-nums", children: path || page2.page }),
                    isWinner && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded bg-emerald-100 px-1 py-0.5 font-medium text-emerald-700 text-xs dark:bg-emerald-900/30 dark:text-emerald-400", children: "#1" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 whitespace-nowrap text-muted-foreground text-xs tabular-nums", children: [
                      "pos ",
                      page2.position.toFixed(1),
                      " ·",
                      " ",
                      (page2.ctr * 100).toFixed(1),
                      "% CTR ·",
                      " ",
                      page2.impressions.toLocaleString(),
                      " impr"
                    ] })
                  ]
                },
                page2.page
              );
            }) })
          ] })
        ] }, item.query);
      })
    ] })
  ] });
}
const BENCHMARK = {
  1: 28.5,
  2: 15.7,
  3: 11,
  4: 8,
  5: 6.3,
  6: 5,
  7: 4,
  8: 3.3,
  9: 2.8,
  10: 2.5,
  11: 2.2,
  12: 2,
  13: 1.8,
  14: 1.5,
  15: 1.2,
  16: 1.1,
  17: 1,
  18: 0.9,
  19: 0.8,
  20: 0.7
};
const POSITION_COUNT = 20;
const MIN_IMPRESSIONS = 10;
const PAGES_PER_POSITION = 5;
const MARGIN = { top: 12, right: 12, bottom: 28, left: 40 };
const BAR_GAP = 0.3;
const BAR_RADIUS = 2;
const AXIS_LABEL_COUNT = 5;
const YOUR_CTR_SERIES = {
  dataKey: "yourCtr",
  label: "Your CTR",
  color: getChartColor(0)
};
const BENCHMARK_SERIES = {
  dataKey: "benchmark",
  label: "Benchmark",
  color: `color-mix(in oklch, ${getChartColor(3)} 60%, transparent)`
};
const formatPercent = (value) => `${value.toFixed(1)}%`;
function GscCtrBenchmark({ data, isLoading }) {
  const grouped = /* @__PURE__ */ new Map();
  for (const row of data) {
    const position = Math.round(row.position);
    const outOfRange = position < 1 || position > POSITION_COUNT;
    if (outOfRange || row.impressions < MIN_IMPRESSIONS) {
      continue;
    }
    let path = row.page;
    try {
      path = new URL(row.page).pathname;
    } catch {
    }
    const entry = grouped.get(position) ?? { ctrSum: 0, pages: [] };
    entry.ctrSum += row.ctr * 100;
    entry.pages.push({ path, ctr: row.ctr, impressions: row.impressions });
    grouped.set(position, entry);
  }
  const rows = Array.from({ length: POSITION_COUNT }, (_, i) => {
    const position = i + 1;
    const entry = grouped.get(position);
    const pages = entry ? [...entry.pages].sort((a, b) => b.ctr - a.ctr).slice(0, PAGES_PER_POSITION) : [];
    return {
      position,
      label: `#${position}`,
      yourCtr: entry ? entry.ctrSum / entry.pages.length : null,
      benchmark: BENCHMARK[position] ?? 0,
      pages
    };
  });
  const hasAnyData = rows.some((row) => row.yourCtr != null);
  const legend = hasAnyData ? [YOUR_CTR_SERIES, BENCHMARK_SERIES] : [BENCHMARK_SERIES];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: "CTR vs Position" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OPLineChartLegend, { series: legend })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
      BarChart,
      {
        animationDuration: 0,
        aspectRatio: "auto",
        barGap: BAR_GAP,
        className: "h-40",
        data: rows,
        margin: MARGIN,
        xDataKey: "label",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { horizontal: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { formatValue: (value) => `${value}%` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BarXAxis, { maxLabels: AXIS_LABEL_COUNT }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Bar,
            {
              animate: false,
              dataKey: YOUR_CTR_SERIES.dataKey,
              fill: YOUR_CTR_SERIES.color,
              lineCap: BAR_RADIUS
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Bar,
            {
              animate: false,
              dataKey: BENCHMARK_SERIES.dataKey,
              fill: BENCHMARK_SERIES.color,
              lineCap: BAR_RADIUS
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            OPChartTooltip,
            {
              datePill: false,
              extra: renderPages,
              rows: tooltipRows,
              showDots: false,
              title: (row) => `Position ${row.label}`
            }
          )
        ]
      }
    )
  ] });
}
function tooltipRows(row) {
  const rows = [];
  if (row.yourCtr != null) {
    rows.push({
      color: YOUR_CTR_SERIES.color,
      label: YOUR_CTR_SERIES.label,
      value: row.yourCtr,
      format: formatPercent
    });
  }
  rows.push({
    color: getChartColor(3),
    label: BENCHMARK_SERIES.label,
    value: row.benchmark,
    format: formatPercent
  });
  return rows;
}
function renderPages(row) {
  if (row.pages.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 border-t pt-1.5", children: row.pages.map((page) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center justify-between gap-4 py-0.5",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-40 truncate text-muted-foreground text-xs tabular-nums", children: page.path }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs tabular-nums tabular-nums", children: formatPercent(page.ctr * 100) })
      ]
    },
    page.path
  )) });
}
const CHART_HEIGHT$1 = 160;
const POSITION_PADDING = 2;
const DEFAULT_MAX_POSITION = 20;
const SERIES = [
  {
    dataKey: "position",
    label: "Avg Position",
    color: getChartColor(2),
    format: (value) => value.toFixed(1)
  }
];
function GscPositionChart({
  data,
  interval,
  isLoading
}) {
  const positions = data.map((row) => row.position).filter((p) => p > 0);
  const minPosition = positions.length ? Math.max(1, Math.floor(Math.min(...positions)) - POSITION_PADDING) : 1;
  const maxPosition = positions.length ? Math.ceil(Math.max(...positions)) + POSITION_PADDING : DEFAULT_MAX_POSITION;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: "Avg Position" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "Lower is better" })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      OPLineChart,
      {
        data,
        formatAxisValue: (value) => `#${value}`,
        height: CHART_HEIGHT$1,
        interval,
        series: SERIES,
        yDomain: [minPosition, maxPosition],
        yReversed: true
      }
    )
  ] });
}
const INSIGHT_CONFIG = {
  low_ctr: {
    label: "Low CTR",
    icon: MousePointerClick,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30"
  },
  near_page_one: {
    label: "Near page 1",
    icon: TrendingUp,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30"
  },
  invisible_clicks: {
    label: "Low visibility",
    icon: Eye,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/30"
  },
  high_bounce: {
    label: "High bounce",
    icon: TriangleAlert,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30"
  }
};
function PagesInsights({ projectId }) {
  const trpc = useTRPC();
  const { range, interval, startDate, endDate } = useOverviewOptions();
  const { apiUrl } = useAppContext();
  const [page, setPage] = reactExports.useState(0);
  const [search, setSearch] = reactExports.useState("");
  const pageSize = 8;
  const dateInput = {
    range,
    startDate: startDate ?? void 0,
    endDate: endDate ?? void 0
  };
  const gscPagesQuery = useQuery(
    trpc.gsc.getPages.queryOptions(
      { projectId, ...dateInput, limit: 1e3 },
      { placeholderData: keepPreviousData }
    )
  );
  const analyticsQuery = useQuery(
    trpc.event.pages.queryOptions(
      { projectId, take: 1e3, range, interval },
      { placeholderData: keepPreviousData }
    )
  );
  const insights = reactExports.useMemo(() => {
    const gscPages = gscPagesQuery.data ?? [];
    const analyticsPages = analyticsQuery.data?.data ?? [];
    const analyticsMap = new Map(
      analyticsPages.map((p) => [p.origin + p.path, p])
    );
    const results = [];
    for (const gsc of gscPages) {
      let origin = "";
      let path = gsc.page;
      try {
        const url = new URL(gsc.page);
        origin = url.origin;
        path = url.pathname + url.search;
      } catch {
      }
      const analytics = analyticsMap.get(gsc.page);
      if (gsc.position <= 10 && gsc.ctr < 0.04 && gsc.impressions >= 100) {
        results.push({
          page: gsc.page,
          origin,
          path,
          type: "low_ctr",
          impact: gsc.impressions * (0.04 - gsc.ctr),
          headline: `Ranking #${Math.round(gsc.position)} but only ${(gsc.ctr * 100).toFixed(1)}% CTR`,
          suggestion: "You are on page 1 but people rarely click. Rewrite your title tag and meta description to be more compelling and match search intent.",
          metrics: `Pos ${Math.round(gsc.position)} · ${gsc.impressions.toLocaleString()} impr · ${(gsc.ctr * 100).toFixed(1)}% CTR`
        });
      }
      if (gsc.position > 10 && gsc.position <= 20 && gsc.impressions >= 100) {
        results.push({
          page: gsc.page,
          origin,
          path,
          type: "near_page_one",
          impact: gsc.impressions / gsc.position,
          headline: `Position ${Math.round(gsc.position)} — one push from page 1`,
          suggestion: "A content refresh, more internal links, or a few backlinks could move this into the top 10 and dramatically increase clicks.",
          metrics: `Pos ${Math.round(gsc.position)} · ${gsc.impressions.toLocaleString()} impr · ${gsc.clicks} clicks`
        });
      }
      if (gsc.impressions >= 500 && gsc.ctr < 0.01 && gsc.position > 10) {
        results.push({
          page: gsc.page,
          origin,
          path,
          type: "invisible_clicks",
          impact: gsc.impressions,
          headline: `${gsc.impressions.toLocaleString()} impressions but only ${gsc.clicks} clicks`,
          suggestion: "Google shows this page a lot, but it almost never gets clicked. Consider whether the page targets the right queries or if a different format (e.g. listicle, how-to) would perform better.",
          metrics: `${gsc.impressions.toLocaleString()} impr · ${gsc.clicks} clicks · Pos ${Math.round(gsc.position)}`
        });
      }
      if (analytics && analytics.bounce_rate >= 70 && analytics.sessions >= 20) {
        results.push({
          page: gsc.page,
          origin,
          path,
          type: "high_bounce",
          impact: analytics.sessions * (analytics.bounce_rate / 100),
          headline: `${Math.round(analytics.bounce_rate)}% bounce rate on a page with ${analytics.sessions} sessions`,
          suggestion: "Visitors are leaving without engaging. Check if the page delivers on its title/meta promise, improve page speed, and make sure key content is above the fold.",
          metrics: `${Math.round(analytics.bounce_rate)}% bounce · ${analytics.sessions} sessions · ${gsc.impressions.toLocaleString()} impr`
        });
      }
    }
    for (const p of analyticsPages) {
      const fullUrl = p.origin + p.path;
      if (!gscPagesQuery.data?.some((g) => g.page === fullUrl) && p.bounce_rate >= 75 && p.sessions >= 30) {
        results.push({
          page: fullUrl,
          origin: p.origin,
          path: p.path,
          type: "high_bounce",
          impact: p.sessions * (p.bounce_rate / 100),
          headline: `${Math.round(p.bounce_rate)}% bounce rate with ${p.sessions} sessions`,
          suggestion: "High bounce rate with no search visibility. Review content quality and check if the page is indexed and targeting the right keywords.",
          metrics: `${Math.round(p.bounce_rate)}% bounce · ${p.sessions} sessions`
        });
      }
    }
    const seen = /* @__PURE__ */ new Set();
    const deduped = results.filter((r) => {
      const key = `${r.page}::${r.type}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    return deduped.sort((a, b) => b.impact - a.impact);
  }, [gscPagesQuery.data, analyticsQuery.data]);
  const isLoading = gscPagesQuery.isLoading || analyticsQuery.isLoading;
  const filteredInsights = reactExports.useMemo(() => {
    if (!search.trim()) {
      return insights;
    }
    const q = search.toLowerCase();
    return insights.filter(
      (i) => i.path.toLowerCase().includes(q) || i.page.toLowerCase().includes(q)
    );
  }, [insights, search]);
  const pageCount = Math.ceil(filteredInsights.length / pageSize) || 1;
  const paginatedInsights = reactExports.useMemo(
    () => filteredInsights.slice(page * pageSize, (page + 1) * pageSize),
    [filteredInsights, page, pageSize]
  );
  const rangeStart = filteredInsights.length ? page * pageSize + 1 : 0;
  const rangeEnd = Math.min((page + 1) * pageSize, filteredInsights.length);
  if (!(isLoading || insights.length)) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: "Opportunities" }),
          filteredInsights.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground text-xs", children: filteredInsights.length })
        ] }),
        filteredInsights.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap text-muted-foreground text-xs", children: filteredInsights.length === 0 ? "0 results" : `${rangeStart}-${rangeEnd} of ${filteredInsights.length}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Pagination,
            {
              canNextPage: page < pageCount - 1,
              canPreviousPage: page > 0,
              nextPage: () => setPage((p) => Math.min(pageCount - 1, p + 1)),
              pageIndex: page,
              previousPage: () => setPage((p) => Math.max(0, p - 1))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            className: "rounded-none border-0 border-t bg-transparent pl-9 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-0",
            onChange: (e) => {
              setSearch(e.target.value);
              setPage(0);
            },
            placeholder: "Search pages",
            size: "sm",
            type: "search",
            value: search
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y", children: [
      isLoading && [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 h-7 w-20 animate-pulse rounded-md bg-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-2/3 animate-pulse rounded bg-muted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-full animate-pulse rounded bg-muted" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-32 animate-pulse rounded bg-muted" })
      ] }, i)),
      paginatedInsights.map((insight, i) => {
        const config = INSIGHT_CONFIG[insight.type];
        const Icon = config.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/40",
            onClick: () => pushModal("PageDetails", {
              type: "page",
              projectId,
              value: insight.page
            }),
            type: "button",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col min-w-0 flex-1 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: cn(
                    "row shrink-0 items-center gap-1 self-start rounded-md px-1 py-0.5 font-medium text-xs",
                    config.color,
                    config.bg
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-3" }),
                    config.label
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    alt: "",
                    className: "size-3.5 shrink-0 rounded-sm",
                    loading: "lazy",
                    onError: (e) => {
                      e.target.style.display = "none";
                    },
                    src: `${apiUrl}/misc/favicon?url=${insight.origin}&v=2`
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium text-xs tabular-nums", children: insight.path || insight.page }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto shrink-0 whitespace-nowrap text-muted-foreground text-xs tabular-nums", children: insight.metrics })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
                  insight.headline,
                  "."
                ] }),
                " ",
                insight.suggestion
              ] })
            ] })
          },
          `${insight.page}-${insight.type}-${i}`
        );
      })
    ] })
  ] });
}
const LABELS = {
  "chatgpt.com": "ChatGPT",
  "claude.ai": "Claude",
  "perplexity.ai": "Perplexity",
  "gemini.google.com": "Gemini",
  "copilot.com": "Copilot",
  "grok.com": "Grok",
  "mistral.ai": "Mistral",
  "kagi.com": "Kagi",
  "duckduckgo.com": "DuckDuckGo",
  "search.brave.com": "Brave Search",
  "ecosia.org": "Ecosia",
  "yandex.com": "Yandex",
  "baidu.com": "Baidu",
  "naver.com": "Naver"
};
function sourceLabel(name) {
  const known = LABELS[name.toLowerCase()];
  if (known) {
    return known;
  }
  const base = name.replace(/\..+$/, "");
  return base.charAt(0).toUpperCase() + base.slice(1);
}
const CHART_HEIGHT = 200;
function SeoPage() {
  const {
    projectId,
    organizationId
  } = useAppParams();
  useRangePageContext("seo");
  const trpc = useTRPC();
  const navigate = useNavigate();
  const {
    range,
    startDate,
    endDate,
    interval
  } = useOverviewOptions();
  const dateInput = {
    range,
    interval,
    startDate,
    endDate
  };
  const connectionQuery = useQuery(trpc.gsc.getConnection.queryOptions({
    projectId
  }));
  const connection = connectionQuery.data;
  const isConnected = connection?.siteUrl;
  const overviewQuery = useQuery(trpc.gsc.getOverview.queryOptions({
    projectId,
    ...dateInput,
    interval: interval ?? "day"
  }, {
    enabled: !!isConnected
  }));
  const pagesQuery = useQuery(trpc.gsc.getPages.queryOptions({
    projectId,
    ...dateInput,
    limit: 50
  }, {
    enabled: !!isConnected
  }));
  const queriesQuery = useQuery(trpc.gsc.getQueries.queryOptions({
    projectId,
    ...dateInput,
    limit: 50
  }, {
    enabled: !!isConnected
  }));
  const searchEnginesQuery = useQuery(trpc.gsc.getSearchEngines.queryOptions({
    projectId,
    ...dateInput
  }));
  const aiEnginesQuery = useQuery(trpc.gsc.getAiEngines.queryOptions({
    projectId,
    ...dateInput
  }));
  const previousOverviewQuery = useQuery(trpc.gsc.getPreviousOverview.queryOptions({
    projectId,
    ...dateInput,
    interval: interval ?? "day"
  }, {
    enabled: !!isConnected
  }));
  const [pagesPage, setPagesPage] = reactExports.useState(0);
  const [queriesPage, setQueriesPage] = reactExports.useState(0);
  const pageSize = 15;
  const [pagesSearch, setPagesSearch] = reactExports.useState("");
  const [queriesSearch, setQueriesSearch] = reactExports.useState("");
  const pages = pagesQuery.data ?? [];
  const queries = queriesQuery.data ?? [];
  const filteredPages = reactExports.useMemo(() => {
    if (!pagesSearch.trim()) {
      return pages;
    }
    const q = pagesSearch.toLowerCase();
    return pages.filter((row) => {
      return String(row.page).toLowerCase().includes(q);
    });
  }, [pages, pagesSearch]);
  const filteredQueries = reactExports.useMemo(() => {
    if (!queriesSearch.trim()) {
      return queries;
    }
    const q = queriesSearch.toLowerCase();
    return queries.filter((row) => {
      return String(row.query).toLowerCase().includes(q);
    });
  }, [queries, queriesSearch]);
  const paginatedPages = reactExports.useMemo(() => filteredPages.slice(pagesPage * pageSize, (pagesPage + 1) * pageSize), [filteredPages, pagesPage, pageSize]);
  const paginatedQueries = reactExports.useMemo(() => filteredQueries.slice(queriesPage * pageSize, (queriesPage + 1) * pageSize), [filteredQueries, queriesPage, pageSize]);
  const pagesPageCount = Math.ceil(filteredPages.length / pageSize) || 1;
  const queriesPageCount = Math.ceil(filteredQueries.length / pageSize) || 1;
  if (connectionQuery.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { description: "Google Search Console data", title: "SEO" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96 w-full" })
      ] })
    ] });
  }
  const trafficSources = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SearchEngines, { engines: searchEnginesQuery.data?.engines ?? [], isLoading: searchEnginesQuery.isLoading, previousTotal: searchEnginesQuery.data?.previousTotal ?? 0, total: searchEnginesQuery.data?.total ?? 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AiEngines, { engines: aiEnginesQuery.data?.engines ?? [], isLoading: aiEnginesQuery.isLoading, previousTotal: aiEnginesQuery.data?.previousTotal ?? 0, total: aiEnginesQuery.data?.total ?? 0 })
  ] });
  if (!isConnected) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewRange, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewInterval, {})
      ] }), description: "Search and AI assistant traffic", title: "SEO" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-2", children: trafficSources }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { description: "Add clicks, impressions, positions and the queries that bring people in, next to the rest of your analytics.", icon: Search, title: "Connect Google Search Console", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate({
          to: "/$organizationId/$projectId/settings/gsc",
          params: {
            organizationId,
            projectId
          }
        }), children: "Connect Google Search Console" }) })
      ] })
    ] });
  }
  const overview = overviewQuery.data ?? [];
  const prevOverview = previousOverviewQuery.data ?? [];
  const sumOverview = (rows) => rows.reduce((acc, row) => ({
    clicks: acc.clicks + row.clicks,
    impressions: acc.impressions + row.impressions,
    ctr: acc.ctr + row.ctr,
    position: acc.position + row.position
  }), {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0
  });
  const totals = sumOverview(overview);
  const prevTotals = sumOverview(prevOverview);
  const n = Math.max(overview.length, 1);
  const pn = Math.max(prevOverview.length, 1);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewRange, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewInterval, {})
    ] }), description: `Search performance for ${connection.siteUrl}`, title: "SEO" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card col-span-1 grid grid-cols-2 overflow-hidden rounded-md lg:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetricCard, { data: overview.map((r) => ({
            current: r.clicks,
            date: r.date
          })), id: "clicks", isLoading: overviewQuery.isLoading, label: "Clicks", metric: {
            current: totals.clicks,
            previous: prevTotals.clicks
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetricCard, { data: overview.map((r) => ({
            current: r.impressions,
            date: r.date
          })), id: "impressions", isLoading: overviewQuery.isLoading, label: "Impressions", metric: {
            current: totals.impressions,
            previous: prevTotals.impressions
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetricCard, { data: overview.map((r) => ({
            current: r.ctr * 100,
            date: r.date
          })), id: "ctr", isLoading: overviewQuery.isLoading, label: "Avg CTR", metric: {
            current: totals.ctr / n * 100,
            previous: prevTotals.ctr / pn * 100
          }, unit: "%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMetricCard, { data: overview.map((r) => ({
            current: r.position,
            date: r.date
          })), id: "position", inverted: true, isLoading: overviewQuery.isLoading, label: "Avg Position", metric: {
            current: totals.position / n,
            previous: prevTotals.position / pn
          } })
        ] }),
        trafficSources
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GscChart, { data: overview, interval: interval ?? "day", isLoading: overviewQuery.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GscPositionChart, { data: overview, interval: interval ?? "day", isLoading: overviewQuery.isLoading }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GscCtrBenchmark, { data: pagesQuery.data ?? [], isLoading: pagesQuery.isLoading })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-8 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GscTable, { isLoading: pagesQuery.isLoading, keyField: "page", keyLabel: "Page", maxClicks: Math.max(...paginatedPages.map((p) => p.clicks), 1), onNextPage: () => setPagesPage((p) => Math.min(pagesPageCount - 1, p + 1)), onPreviousPage: () => setPagesPage((p) => Math.max(0, p - 1)), onRowClick: (value) => pushModal("PageDetails", {
          type: "page",
          projectId,
          value
        }), onSearchChange: (v) => {
          setPagesSearch(v);
          setPagesPage(0);
        }, pageCount: pagesPageCount, pageIndex: pagesPage, pageSize, rows: paginatedPages, searchPlaceholder: "Search pages", searchValue: pagesSearch, title: "Top pages", totalCount: filteredPages.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GscTable, { isLoading: queriesQuery.isLoading, keyField: "query", keyLabel: "Query", maxClicks: Math.max(...paginatedQueries.map((q) => q.clicks), 1), onNextPage: () => setQueriesPage((p) => Math.min(queriesPageCount - 1, p + 1)), onPreviousPage: () => setQueriesPage((p) => Math.max(0, p - 1)), onRowClick: (value) => pushModal("PageDetails", {
          type: "query",
          projectId,
          value
        }), onSearchChange: (v) => {
          setQueriesSearch(v);
          setQueriesPage(0);
        }, pageCount: queriesPageCount, pageIndex: queriesPage, pageSize, rows: paginatedQueries, searchPlaceholder: "Search queries", searchValue: queriesSearch, title: "Top queries", totalCount: filteredQueries.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GscCannibalization, { endDate: endDate ?? void 0, interval: interval ?? "day", projectId, range, startDate: startDate ?? void 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PagesInsights, { projectId })
      ] })
    ] })
  ] });
}
function TrafficSourceWidget({
  title,
  engines,
  total,
  previousTotal,
  isLoading,
  emptyMessage
}) {
  const displayed = engines.length > 8 ? [...engines.slice(0, 7), {
    name: "Others",
    sessions: engines.slice(7).reduce((s, d) => s + d.sessions, 0)
  }] : engines.slice(0, 8);
  const max = displayed[0]?.sessions ?? 1;
  const pctChange = previousTotal > 0 ? (total - previousTotal) / previousTotal * 100 : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: title }),
      !isLoading && total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm tabular-nums tabular-nums", children: total.toLocaleString() }),
        pctChange !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs tabular-nums tabular-nums ${pctChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`, children: [
          pctChange >= 0 ? "+" : "",
          pctChange.toFixed(1),
          "%"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2", children: [
      isLoading && [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 px-4 py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 animate-pulse rounded-sm bg-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-16 animate-pulse rounded bg-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto h-3 w-8 animate-pulse rounded bg-muted" })
      ] }, i)),
      !isLoading && engines.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "col-span-2 px-4 py-6 text-center text-muted-foreground text-xs", children: emptyMessage }),
      !isLoading && displayed.map((engine) => {
        const pct = total > 0 ? engine.sessions / total * 100 : 0;
        const barPct = engine.sessions / max * 100;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-4 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 left-0 bg-muted/50", style: {
            width: `${barPct}%`
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-2", children: [
            engine.name !== "Others" && /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { className: "size-3.5 shrink-0 rounded-sm", name: engine.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 truncate text-xs", children: sourceLabel(engine.name) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs tabular-nums tabular-nums", children: engine.sessions.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 text-muted-foreground text-xs tabular-nums", children: [
              pct.toFixed(0),
              "%"
            ] })
          ] })
        ] }, engine.name);
      })
    ] })
  ] });
}
function SearchEngines(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TrafficSourceWidget, { ...props, emptyMessage: "No search traffic in this period", title: "Search engines" });
}
function AiEngines(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TrafficSourceWidget, { ...props, emptyMessage: "No AI traffic in this period", title: "AI referrals" });
}
function GscChart({
  data,
  interval,
  isLoading
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 font-medium text-sm", children: "Clicks & Impressions" }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(OPLineChart, { data: data.map((row) => ({
      date: row.date,
      clicks: row.clicks,
      impressions: row.impressions
    })), height: CHART_HEIGHT, interval, series: GSC_CLICKS_SERIES })
  ] });
}
function GscTable({
  title,
  rows,
  keyField,
  keyLabel,
  maxClicks,
  isLoading,
  onRowClick,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  totalCount,
  pageIndex,
  pageSize,
  pageCount,
  onPreviousPage,
  onNextPage
}) {
  const showPagination = totalCount != null && pageSize != null && pageCount != null && onPreviousPage != null && onNextPage != null && pageIndex != null;
  const canPreviousPage = (pageIndex ?? 0) > 0;
  const canNextPage = (pageIndex ?? 0) < (pageCount ?? 1) - 1;
  const rangeStart = totalCount ? (pageIndex ?? 0) * (pageSize ?? 0) + 1 : 0;
  const rangeEnd = Math.min((pageIndex ?? 0) * (pageSize ?? 0) + (pageSize ?? 0), totalCount ?? 0);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between border-b p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: title }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewWidgetTable, { columns: [{
        name: keyLabel,
        width: "w-full",
        render: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-2/3" })
      }, {
        name: "Clicks",
        width: "70px",
        render: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-10" })
      }, {
        name: "Impr.",
        width: "70px",
        render: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-10" })
      }, {
        name: "CTR",
        width: "60px",
        render: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-8" })
      }, {
        name: "Pos.",
        width: "55px",
        render: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-8" })
      }], data: [1, 2, 3, 4, 5], getColumnPercentage: () => 0, keyExtractor: (i) => String(i) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: title }),
        showPagination && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap text-muted-foreground text-xs", children: totalCount === 0 ? "0 results" : `${rangeStart}-${rangeEnd} of ${totalCount}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pagination, { canNextPage, canPreviousPage, nextPage: onNextPage, pageIndex, previousPage: onPreviousPage })
        ] })
      ] }),
      onSearchChange != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "rounded-none border-0 border-t bg-transparent pl-9 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-0", onChange: (e) => onSearchChange(e.target.value), placeholder: searchPlaceholder ?? "Search", size: "sm", type: "search", value: searchValue ?? "" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewWidgetTable, { columns: [{
      name: keyLabel,
      width: "w-full",
      render(item) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "block w-full truncate text-left text-xs tabular-nums hover:underline", onClick: () => onRowClick?.(String(item[keyField])), type: "button", children: String(item[keyField]) }) });
      }
    }, {
      name: "Clicks",
      width: "70px",
      getSortValue: (item) => item.clicks,
      render(item) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-xs tabular-nums", children: item.clicks.toLocaleString() });
      }
    }, {
      name: "Impr.",
      width: "70px",
      getSortValue: (item) => item.impressions,
      render(item) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-xs tabular-nums", children: item.impressions.toLocaleString() });
      }
    }, {
      name: "CTR",
      width: "60px",
      getSortValue: (item) => item.ctr,
      render(item) {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-xs tabular-nums", children: [
          (item.ctr * 100).toFixed(1),
          "%"
        ] });
      }
    }, {
      name: "Pos.",
      width: "55px",
      getSortValue: (item) => item.position,
      render(item) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-xs tabular-nums", children: item.position.toFixed(1) });
      }
    }], data: rows, getColumnPercentage: (item) => item.clicks / maxClicks, keyExtractor: (item) => String(item[keyField]) })
  ] });
}
export {
  SeoPage as component
};
//# sourceMappingURL=_app._organizationId._projectId.seo-DDX1Xcat.js.map
