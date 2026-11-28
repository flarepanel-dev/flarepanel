import { o as jsxRuntimeExports, a as reactExports, J as getAugmentedNamespace, F as requireReact, g as getDefaultExportFromCjs } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, cy as Basis, cz as noop$2, cA as epsilon$1, cB as Tooltip, cC as TooltipTrigger, cD as TooltipPortal, cE as TooltipContent, ak as useQueryClient, as as Ut, d as cn$1, S as SerieIcon, cF as OPMarkerLayer, cG as useChart, c6 as reactDomExports, cH as useSpring$1, be as motion, a as useTRPC, j as useQuery, cI as MetricCardShell, b4 as Skeleton, a4 as useNumber, ai as BarChart, cJ as OPStatHoverBridge, aj as Bar, c8 as useOverviewOptions, g as useEventQueryFilters, cK as OverviewMetricCard, B as Button, cL as useDashedTail, ad as getChartColor, cM as MARKERS_MAX_POINTS, a$ as ComposedChart, cN as Grid, b0 as YAxis, cO as XAxis, ac as Area, cP as POINT_MARKER, b2 as Line, ae as monotoneX, af as OPChartTooltip, cQ as OPReferences, cR as LineChart, c4 as useQueryState, cS as parseAsStringEnum, a0 as ChartLine, cT as mapKeys, cU as OverviewWidgetTableLoading, cV as OverviewWidgetTableGeneric, cW as OVERVIEW_COLUMNS_NAME, cX as NOT_SET_VALUE, H as pushModal, e as useAppParams, $ as useNavigate, cY as OverviewWidgetTableEvents, cZ as eventQueryFiltersParser, c_ as tslib_es6, c$ as requireCountries_geo, d0 as AutoSizer$1, co as ChevronRight, d1 as parseAsBoolean, d2 as OverviewWidgetTableEntries, d3 as OverviewWidgetTablePages, d4 as require_baseGetTag, d5 as requireIsObject, d6 as require_root, d7 as requireIsObjectLike, d8 as require_freeGlobal, d9 as requireIsSymbol, da as require_Symbol, db as rgbBasis, dc as cubehelixLong, dd as cubehelix, de as rgb$1, df as interpolateString, dg as ordinal, dh as stepBefore, di as stepAfter, dj as K$2, dk as X$2, dl as monotoneY, dm as F$1, dn as U$1, dp as I, dq as G$1, dr as W$3, ds as Sankey, dt as z$4, du as right, dv as left, dw as justify, dx as center, c5 as parseAsInteger, l as useTheme, bK as round, dy as ArrowRight, dz as truncate, dA as TooltipProvider } from "./router-gBnYxPzA.js";
import { A as AnimatedNumber } from "./animated-number-DKHgshrj.js";
import { u as useLiveCounter } from "./use-live-counter-BawyL5Mu.js";
import { R as RotateCw } from "./rotate-cw-59NMbvpf.js";
import { b as Widget, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { b as WidgetHeadSearchable, c as WidgetFooter, W as WidgetHead, a as WidgetButtons } from "./overview-widget-q0VDaTtp.js";
import { c as countries } from "./countries-CS917BhP.js";
import { E as Earth } from "./earth-Din9zDf9.js";
import { T as Table } from "./table-DNq4Q3EQ.js";
const __iconNode = [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }],
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  [
    "path",
    {
      d: "M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0",
      key: "11ak4c"
    }
  ]
];
const ScanEye = createLucideIcon("scan-eye", __iconNode);
function Bundle(context, beta) {
  this._basis = new Basis(context);
  this._beta = beta;
}
Bundle.prototype = {
  lineStart: function() {
    this._x = [];
    this._y = [];
    this._basis.lineStart();
  },
  lineEnd: function() {
    var x2 = this._x, y2 = this._y, j2 = x2.length - 1;
    if (j2 > 0) {
      var x02 = x2[0], y02 = y2[0], dx = x2[j2] - x02, dy = y2[j2] - y02, i2 = -1, t2;
      while (++i2 <= j2) {
        t2 = i2 / j2;
        this._basis.point(
          this._beta * x2[i2] + (1 - this._beta) * (x02 + t2 * dx),
          this._beta * y2[i2] + (1 - this._beta) * (y02 + t2 * dy)
        );
      }
    }
    this._x = this._y = null;
    this._basis.lineEnd();
  },
  point: function(x2, y2) {
    this._x.push(+x2);
    this._y.push(+y2);
  }
};
const A$4 = (function custom(beta) {
  function bundle(context) {
    return beta === 1 ? new Basis(context) : new Bundle(context, beta);
  }
  bundle.beta = function(beta2) {
    return custom(+beta2);
  };
  return bundle;
})(0.85);
function point$1(that, x2, y2) {
  that._context.bezierCurveTo(
    that._x1 + that._k * (that._x2 - that._x0),
    that._y1 + that._k * (that._y2 - that._y0),
    that._x2 + that._k * (that._x1 - x2),
    that._y2 + that._k * (that._y1 - y2),
    that._x2,
    that._y2
  );
}
function Cardinal(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}
Cardinal.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        point$1(this, this._x1, this._y1);
        break;
    }
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
        this._x1 = x2, this._y1 = y2;
        break;
      case 2:
        this._point = 3;
      // falls through
      default:
        point$1(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
const L$2 = (function custom2(tension) {
  function cardinal(context) {
    return new Cardinal(context, tension);
  }
  cardinal.tension = function(tension2) {
    return custom2(+tension2);
  };
  return cardinal;
})(0);
function CardinalClosed(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}
CardinalClosed.prototype = {
  areaStart: noop$2,
  areaEnd: noop$2,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._x3 = x2, this._y3 = y2;
        break;
      case 1:
        this._point = 2;
        this._context.moveTo(this._x4 = x2, this._y4 = y2);
        break;
      case 2:
        this._point = 3;
        this._x5 = x2, this._y5 = y2;
        break;
      default:
        point$1(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
const S$2 = (function custom3(tension) {
  function cardinal(context) {
    return new CardinalClosed(context, tension);
  }
  cardinal.tension = function(tension2) {
    return custom3(+tension2);
  };
  return cardinal;
})(0);
function CardinalOpen(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}
CardinalOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || this._line !== 0 && this._point === 3) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2);
        break;
      case 3:
        this._point = 4;
      // falls through
      default:
        point$1(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
const Y$2 = (function custom4(tension) {
  function cardinal(context) {
    return new CardinalOpen(context, tension);
  }
  cardinal.tension = function(tension2) {
    return custom4(+tension2);
  };
  return cardinal;
})(0);
function point(that, x2, y2) {
  var x12 = that._x1, y12 = that._y1, x22 = that._x2, y22 = that._y2;
  if (that._l01_a > epsilon$1) {
    var a2 = 2 * that._l01_2a + 3 * that._l01_a * that._l12_a + that._l12_2a, n2 = 3 * that._l01_a * (that._l01_a + that._l12_a);
    x12 = (x12 * a2 - that._x0 * that._l12_2a + that._x2 * that._l01_2a) / n2;
    y12 = (y12 * a2 - that._y0 * that._l12_2a + that._y2 * that._l01_2a) / n2;
  }
  if (that._l23_a > epsilon$1) {
    var b2 = 2 * that._l23_2a + 3 * that._l23_a * that._l12_a + that._l12_2a, m2 = 3 * that._l23_a * (that._l23_a + that._l12_a);
    x22 = (x22 * b2 + that._x1 * that._l23_2a - x2 * that._l12_2a) / m2;
    y22 = (y22 * b2 + that._y1 * that._l23_2a - y2 * that._l12_2a) / m2;
  }
  that._context.bezierCurveTo(x12, y12, x22, y22, that._x2, that._y2);
}
function CatmullRom(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}
CatmullRom.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        this.point(this._x2, this._y2);
        break;
    }
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    if (this._point) {
      var x23 = this._x2 - x2, y23 = this._y2 - y2;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
      // falls through
      default:
        point(this, x2, y2);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
const q$1 = (function custom5(alpha) {
  function catmullRom(context) {
    return alpha ? new CatmullRom(context, alpha) : new Cardinal(context, 0);
  }
  catmullRom.alpha = function(alpha2) {
    return custom5(+alpha2);
  };
  return catmullRom;
})(0.5);
function CatmullRomClosed(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}
CatmullRomClosed.prototype = {
  areaStart: noop$2,
  areaEnd: noop$2,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
    this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    if (this._point) {
      var x23 = this._x2 - x2, y23 = this._y2 - y2;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1;
        this._x3 = x2, this._y3 = y2;
        break;
      case 1:
        this._point = 2;
        this._context.moveTo(this._x4 = x2, this._y4 = y2);
        break;
      case 2:
        this._point = 3;
        this._x5 = x2, this._y5 = y2;
        break;
      default:
        point(this, x2, y2);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
const D$1 = (function custom6(alpha) {
  function catmullRom(context) {
    return alpha ? new CatmullRomClosed(context, alpha) : new CardinalClosed(context, 0);
  }
  catmullRom.alpha = function(alpha2) {
    return custom6(+alpha2);
  };
  return catmullRom;
})(0.5);
function CatmullRomOpen(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}
CatmullRomOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    if (this._line || this._line !== 0 && this._point === 3) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    if (this._point) {
      var x23 = this._x2 - x2, y23 = this._y2 - y2;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2);
        break;
      case 3:
        this._point = 4;
      // falls through
      default:
        point(this, x2, y2);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
const E$4 = (function custom7(alpha) {
  function catmullRom(context) {
    return alpha ? new CatmullRomOpen(context, alpha) : new CardinalOpen(context, 0);
  }
  catmullRom.alpha = function(alpha2) {
    return custom7(+alpha2);
  };
  return catmullRom;
})(0.5);
class Adder {
  constructor() {
    this._partials = new Float64Array(32);
    this._n = 0;
  }
  add(x2) {
    const p2 = this._partials;
    let i2 = 0;
    for (let j2 = 0; j2 < this._n && j2 < 32; j2++) {
      const y2 = p2[j2], hi = x2 + y2, lo = Math.abs(x2) < Math.abs(y2) ? x2 - (hi - y2) : y2 - (hi - x2);
      if (lo) p2[i2++] = lo;
      x2 = hi;
    }
    p2[i2] = x2;
    this._n = i2 + 1;
    return this;
  }
  valueOf() {
    const p2 = this._partials;
    let n2 = this._n, x2, y2, lo, hi = 0;
    if (n2 > 0) {
      hi = p2[--n2];
      while (n2 > 0) {
        x2 = hi;
        y2 = p2[--n2];
        hi = x2 + y2;
        lo = y2 - (hi - x2);
        if (lo) break;
      }
      if (n2 > 0 && (lo < 0 && p2[n2 - 1] < 0 || lo > 0 && p2[n2 - 1] > 0)) {
        y2 = lo * 2;
        x2 = hi + y2;
        if (y2 == x2 - hi) hi = x2;
      }
    }
    return hi;
  }
}
function* flatten(arrays) {
  for (const array of arrays) {
    yield* array;
  }
}
function merge(arrays) {
  return Array.from(flatten(arrays));
}
function range$1(start2, stop2, step) {
  start2 = +start2, stop2 = +stop2, step = (n2 = arguments.length) < 2 ? (stop2 = start2, start2 = 0, 1) : n2 < 3 ? 1 : +step;
  var i2 = -1, n2 = Math.max(0, Math.ceil((stop2 - start2) / step)) | 0, range2 = new Array(n2);
  while (++i2 < n2) {
    range2[i2] = start2 + i2 * step;
  }
  return range2;
}
function TooltipComplete({
  children,
  disabled,
  content,
  side,
  delay
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { delayDuration: delay, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TooltipTrigger,
      {
        className: "appearance-none",
        style: { textAlign: "inherit" },
        children
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipPortal, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { disabled, side, children: content }) })
  ] });
}
function LiveCounter({ projectId, shareId }) {
  const client = useQueryClient();
  const onRefresh = reactExports.useCallback(() => {
    Ut("Refreshed data");
    client.refetchQueries({
      type: "active"
    });
  }, [client]);
  const counter = useLiveCounter({ projectId, shareId, onRefresh });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    TooltipComplete,
    {
      content: `${counter.debounced} unique visitors last 5 minutes`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-8 items-center gap-2 rounded border border-border px-3 font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn$1(
                "h-3 w-3 animate-ping rounded-full bg-live opacity-100 transition-all",
                counter.debounced === 0 && "bg-def-400 opacity-0"
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn$1(
                "absolute top-0 left-0 h-3 w-3 rounded-full bg-live transition-all",
                counter.debounced === 0 && "bg-def-400"
              )
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedNumber, { value: counter.debounced })
      ] })
    }
  );
}
function OPReferrerSpikes({
  items,
  size,
  onSpikeClick
}) {
  const clusters = reactExports.useMemo(() => {
    if (!items || items.length === 0) {
      return [];
    }
    return items.map((cluster) => {
      const markerItems = cluster.spikes.map((spike) => ({
        date: typeof spike.date === "string" ? new Date(spike.date) : spike.date,
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { fill: true, name: spike.referrer_name }),
        title: spike.referrer_name,
        onClick: onSpikeClick ? () => onSpikeClick(spike.referrer_name) : void 0
      }));
      return { anchorDate: cluster.anchorDate, items: markerItems };
    });
  }, [items, onSpikeClick]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OPMarkerLayer, { clusters, size });
}
const SPRING = { stiffness: 1e3, damping: 60 };
function OPSeriesDots({ dots }) {
  const { tooltipData, containerRef, margin } = useChart();
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
  }, []);
  if (!(mounted && containerRef.current && tooltipData)) {
    return null;
  }
  return reactDomExports.createPortal(
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "svg",
      {
        "aria-hidden": "true",
        className: "pointer-events-none absolute inset-0 z-[51]",
        height: "100%",
        width: "100%",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("g", { transform: `translate(${margin.left}, ${margin.top})`, children: dots.map((dot) => {
          const xPos = tooltipData.xPositions?.[dot.dataKey] ?? tooltipData.x;
          const yPos = tooltipData.yPositions[dot.dataKey];
          if (yPos == null) {
            return null;
          }
          const radius = dot.radius ?? (dot.label ? 8 : 5);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            OPDot,
            {
              color: dot.color,
              label: dot.label,
              radius,
              x: xPos,
              y: yPos
            },
            dot.dataKey
          );
        }) })
      }
    ),
    containerRef.current
  );
}
function OPDot({ x: x2, y: y2, color, label, radius }) {
  const animatedX = useSpring$1(x2, SPRING);
  const animatedY = useSpring$1(y2, SPRING);
  animatedX.set(x2);
  animatedY.set(y2);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.g, { style: { x: animatedX, y: animatedY }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "circle",
      {
        fill: color,
        r: radius,
        stroke: "var(--chart-background)",
        strokeWidth: 2
      }
    ),
    label && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "text",
      {
        dy: radius * 0.35,
        fill: "white",
        fontSize: radius * 1.2,
        fontWeight: 700,
        textAnchor: "middle",
        children: label
      }
    )
  ] });
}
const PRIMARY_COLOR = "var(--live)";
function OverviewLiveHistogram({
  projectId,
  shareId
}) {
  const trpc = useTRPC();
  const number = useNumber();
  const { data: liveData, isLoading } = useQuery(
    trpc.overview.liveData.queryOptions({ projectId, shareId })
  );
  const [hover, setHover] = reactExports.useState({
    index: null,
    point: null
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(MetricCardShell, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pt-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-24" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mt-1 h-6 w-12" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mt-0.5 h-3 w-32" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 h-[40px] animate-pulse bg-def-200/40" })
    ] });
  }
  if (!liveData) {
    return null;
  }
  const rawMinutes = liveData.minuteCounts ?? [];
  const now = Date.now();
  const chartData = rawMinutes.map((point2, i2) => ({
    ...point2,
    date: new Date(now - (rawMinutes.length - 1 - i2) * 6e4)
  }));
  const totalSessions = liveData.totalSessions ?? 0;
  const displayCount = hover.point?.sessionCount ?? totalSessions;
  const displayLabel = hover.point ? hover.point.time : "Last 30 min";
  const referrers = liveData.referrers ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MetricCardShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pt-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium text-3xs text-muted-foreground uppercase tracking-wider", children: "Live · 30 min" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2 items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn$1(
                "absolute inline-flex h-full w-full rounded-full opacity-75",
                totalSessions > 0 ? "animate-ping bg-live" : "bg-def-400"
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn$1(
                "relative inline-flex h-2 w-2 rounded-full",
                totalSessions > 0 ? "bg-live" : "bg-def-400"
              )
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-my-0.5 flex items-baseline gap-0.5 leading-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-mono font-semibold text-foreground text-xl tabular-nums tracking-tight", children: number.short(displayCount) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 flex items-center justify-between gap-2 truncate text-2xs text-muted-foreground leading-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: displayLabel }),
        referrers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex shrink-0 items-center gap-1.5", children: referrers.slice(0, 3).map((ref, index2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-0.5",
            title: `${ref.referrer} · ${ref.count}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: ref.referrer }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: ref.count })
            ]
          },
          `${ref.referrer}-${ref.count}-${index2}`
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 h-[40px]", children: chartData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      BarChart,
      {
        animationDuration: 0,
        aspectRatio: "auto",
        barGap: 0.25,
        className: "h-full",
        data: chartData,
        margin: { top: 6, right: 0, bottom: 4, left: 0 },
        xDataKey: "time",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(OPStatHoverBridge, { onHoverChange: setHover }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Bar,
            {
              animate: false,
              dataKey: "sessionCount",
              fill: PRIMARY_COLOR,
              lineCap: 2
            }
          )
        ]
      }
    ) })
  ] });
}
const REVENUE_COLOR = "oklch(0.68 0.11 158)";
const PREV_LINE_COLOR = "oklch(from var(--foreground) l c h / 0.4)";
const TITLES = [
  {
    title: "Unique Visitors",
    key: "unique_visitors",
    unit: "",
    inverted: false
  },
  {
    title: "Sessions",
    key: "total_sessions",
    unit: "",
    inverted: false
  },
  {
    title: "Pageviews",
    key: "total_screen_views",
    unit: "",
    inverted: false
  },
  {
    title: "Pages per session",
    key: "views_per_session",
    unit: "",
    inverted: false
  },
  {
    title: "Bounce Rate",
    key: "bounce_rate",
    unit: "%",
    inverted: true
  },
  {
    title: "Session Duration",
    key: "avg_session_duration",
    unit: "min",
    inverted: false
  },
  {
    title: "Revenue",
    key: "total_revenue",
    unit: "currency",
    inverted: false
  }
];
function OverviewMetrics({
  projectId,
  shareId
}) {
  const { range: range2, interval, metric, setMetric, startDate, endDate } = useOverviewOptions();
  const [filters] = useEventQueryFilters();
  const trpc = useTRPC();
  const activeMetric = TITLES[metric];
  const overviewQuery = useQuery(
    trpc.overview.stats.queryOptions({
      projectId,
      shareId,
      range: range2,
      interval,
      filters,
      startDate,
      endDate
    })
  );
  const series = overviewQuery.data?.series ?? [];
  const [mockRevenue, setMockRevenue] = reactExports.useState(false);
  const data = reactExports.useMemo(
    () => mockRevenue ? injectMockRevenue(series) : series,
    [series, mockRevenue]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative -top-0.5 col-span-6 mt-0 mb-0 md:m-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card mb-2 grid grid-cols-2 overflow-hidden rounded-md md:grid-cols-4", children: [
      TITLES.map((title, index2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        OverviewMetricCard,
        {
          active: metric === index2,
          data: data.map((item) => ({
            date: item.date,
            current: item[title.key],
            previous: item[`prev_${title.key}`]
          })),
          id: title.key,
          interval,
          inverted: title.inverted,
          isError: overviewQuery.isError,
          isLoading: overviewQuery.isLoading,
          label: title.title,
          metric: {
            current: overviewQuery.data?.metrics[title.key] ?? 0,
            previous: overviewQuery.data?.metrics[`prev_${title.key}`]
          },
          onClick: () => setMetric(index2),
          range: range2,
          unit: title.unit
        },
        title.key
      )),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewLiveHistogram, { projectId, shareId })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mt-1 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-3xs text-muted-foreground uppercase tracking-wider", children: activeMetric.title }),
        false
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-[190px] w-full", children: [
        overviewQuery.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-full w-full" }),
        overviewQuery.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "center-center h-full flex-col gap-3 text-center text-muted-foreground text-sm", children: [
          "We could not load this data. Try again in a moment.",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              icon: RotateCw,
              loading: overviewQuery.isFetching,
              onClick: () => overviewQuery.refetch(),
              size: "sm",
              variant: "outline",
              children: "Try again"
            }
          )
        ] }),
        overviewQuery.isSuccess && data.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chart,
          {
            activeMetric,
            data,
            interval,
            projectId,
            shareId
          }
        )
      ] })
    ] })
  ] });
}
function injectMockRevenue(series) {
  if (series.length === 0) {
    return series;
  }
  return series.map((item, i2) => {
    const seed = hashStr(String(item.date)) + i2;
    const wave = (Math.sin(seed * 0.7) + 1) / 2;
    const jitter = (seed * 9301 + 49297) % 233280 / 233280;
    const revenueCents = Math.round(5e4 + wave * 25e4 + jitter * 8e4);
    const prevCents = Math.round(revenueCents * (0.6 + jitter * 0.6));
    return {
      ...item,
      total_revenue: revenueCents,
      prev_total_revenue: prevCents
    };
  });
}
function hashStr(s2) {
  let h2 = 0;
  for (let i2 = 0; i2 < s2.length; i2++) {
    h2 = (h2 << 5) - h2 + s2.charCodeAt(i2);
    h2 |= 0;
  }
  return Math.abs(h2);
}
function Chart({
  activeMetric,
  interval,
  data,
  projectId,
  shareId
}) {
  const { range: range2, startDate, endDate } = useOverviewOptions();
  const trpc = useTRPC();
  const isRevenueTab = activeMetric.key === "total_revenue";
  const references = useQuery(
    trpc.reference.getChartReferences.queryOptions(
      {
        projectId,
        startDate,
        endDate,
        range: range2
      },
      { staleTime: 1e3 * 60 * 10 }
    )
  );
  const [filters, setFilter] = useEventQueryFilters();
  const referrerSpikes = useQuery(
    trpc.overview.getReferrerSpikes.queryOptions(
      {
        projectId,
        shareId,
        startDate,
        endDate,
        range: range2,
        interval,
        filters
      },
      { staleTime: 1e3 * 60 * 10 }
    )
  );
  const handleSpikeClick = reactExports.useCallback(
    (referrerName) => {
      setFilter("referrer_name", referrerName);
    },
    [setFilter]
  );
  const flatSpikes = reactExports.useMemo(
    () => referrerSpikes.data?.flatMap((c2) => c2.spikes) ?? null,
    [referrerSpikes.data]
  );
  const { chartData, showRevenue } = reactExports.useMemo(() => {
    if (isRevenueTab) {
      return {
        chartData: data,
        showRevenue: false
      };
    }
    let maxPrimary = 0;
    let maxRevenue = 0;
    for (const item of data) {
      const primary = item[activeMetric.key] ?? 0;
      const revenue = item.total_revenue ?? 0;
      if (primary > maxPrimary) {
        maxPrimary = primary;
      }
      if (revenue > maxRevenue) {
        maxRevenue = revenue;
      }
    }
    if (maxRevenue === 0 || maxPrimary === 0) {
      return {
        chartData: data,
        showRevenue: false
      };
    }
    const scale = maxPrimary * 0.4 / maxRevenue;
    return {
      chartData: data.map((item) => ({
        ...item,
        revenue_norm: (item.total_revenue ?? 0) * scale
      })),
      showRevenue: true
    };
  }, [data, activeMetric.key, isRevenueTab]);
  const dashFromIndex = useDashedTail({ data, range: range2, interval });
  const primaryColor = isRevenueTab ? REVENUE_COLOR : getChartColor(0);
  const showMarkers = chartData.length <= MARKERS_MAX_POINTS;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    ComposedChart,
    {
      animationDuration: 0,
      aspectRatio: "auto",
      className: "h-full",
      data: chartData,
      margin: { top: 0, right: 20, bottom: 40, left: 20 },
      xDataKey: "date",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { horizontal: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { numTicks: 4 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Area,
          {
            animate: false,
            dashArray: "4,4",
            dashFromIndex,
            dataKey: activeMetric.key,
            fadeEdges: "left",
            fill: primaryColor,
            fillOpacity: 0.18,
            gradientToOpacity: 0,
            markers: POINT_MARKER,
            showMarkers,
            stroke: primaryColor,
            strokeWidth: 2
          },
          activeMetric.key
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Line,
          {
            animate: false,
            curve: monotoneX,
            dataKey: `prev_${activeMetric.key}`,
            markers: POINT_MARKER,
            showMarkers,
            stroke: PREV_LINE_COLOR,
            strokeWidth: 2
          },
          `prev-${activeMetric.key}`
        ),
        showRevenue && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Line,
          {
            animate: false,
            curve: monotoneX,
            dataKey: "revenue_norm",
            markers: POINT_MARKER,
            showMarkers,
            stroke: REVENUE_COLOR,
            strokeWidth: 1.5
          },
          `revenue-${activeMetric.key}`
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          OPSeriesDots,
          {
            dots: [
              { dataKey: activeMetric.key, color: primaryColor },
              { dataKey: `prev_${activeMetric.key}`, color: "var(--foreground)" },
              ...showRevenue ? [
                {
                  dataKey: "revenue_norm",
                  color: REVENUE_COLOR,
                  label: "$"
                }
              ] : []
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          OPChartTooltip,
          {
            indicatorColor: primaryColor,
            interval,
            references: references.data,
            rows: (point2) => {
              const primaryVal = point2[activeMetric.key];
              const primaryPrev = point2[`prev_${activeMetric.key}`];
              const rows = [
                {
                  color: primaryColor,
                  label: activeMetric.title,
                  value: primaryVal,
                  previous: primaryPrev,
                  inverted: activeMetric.inverted,
                  unit: tooltipUnitFor(activeMetric.unit)
                }
              ];
              if (!isRevenueTab) {
                const revenue = point2.total_revenue ?? 0;
                const prevRevenue = point2.prev_total_revenue ?? 0;
                if (revenue > 0) {
                  rows.push({
                    color: REVENUE_COLOR,
                    label: "Revenue",
                    value: revenue,
                    previous: prevRevenue > 0 ? prevRevenue : void 0,
                    inverted: false,
                    unit: "currency"
                  });
                }
              }
              return rows;
            },
            showDots: false,
            spikes: flatSpikes
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OPReferences, { items: references.data }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          OPReferrerSpikes,
          {
            items: referrerSpikes.data,
            onSpikeClick: handleSpikeClick
          }
        )
      ]
    }
  );
}
function tooltipUnitFor(unit) {
  if (unit === "currency") {
    return "currency";
  }
  if (unit === "min") {
    return "min";
  }
  if (unit === "%") {
    return "pct";
  }
  return void 0;
}
const OverviewDetailsButton = (props) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScanEye, { size: 18 }) });
};
const VISIBLE_LIMIT = 5;
const TOOLTIP_LIMIT = 3;
function getSeriesKey(item) {
  return item.prefix ? `${item.prefix}:${item.name}` : item.name;
}
function transformData(items, visibleSeries) {
  const allDates = /* @__PURE__ */ new Set();
  for (const item of items) {
    for (const point2 of item.data) {
      allDates.add(point2.date);
    }
  }
  return Array.from(allDates).sort().map((date) => {
    const result = { date };
    visibleSeries.forEach((series) => {
      const item = items.find((i2) => getSeriesKey(i2) === series.key);
      const dataPoint = item?.data.find((d2) => d2.date === date);
      result[`${series.key}:sessions`] = dataPoint?.sessions ?? 0;
      result[`${series.key}:pageviews`] = dataPoint?.pageviews ?? 0;
      if (dataPoint?.revenue !== void 0) {
        result[`${series.key}:revenue`] = dataPoint.revenue;
      }
    });
    return result;
  });
}
function OverviewLineChart({
  data,
  interval,
  range: range2,
  searchQuery,
  className
}) {
  const visibleSeries = reactExports.useMemo(() => {
    const filtered = searchQuery ? data.items.filter((item) => {
      const q2 = searchQuery.toLowerCase();
      return (item.name?.toLowerCase().includes(q2) ?? false) || (item.prefix?.toLowerCase().includes(q2) ?? false);
    }) : data.items;
    return filtered.slice(0, VISIBLE_LIMIT).map((item, index2) => ({
      key: getSeriesKey(item),
      name: item.name,
      prefix: item.prefix ?? void 0,
      color: getChartColor(index2)
    }));
  }, [data.items, searchQuery]);
  const chartData = reactExports.useMemo(
    () => transformData(data.items, visibleSeries),
    [data.items, visibleSeries]
  );
  const dashFromIndex = useDashedTail({ data: chartData, range: range2, interval });
  if (visibleSeries.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn$1("flex h-[358px] items-center justify-center", className),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: searchQuery ? "No results found" : "No data available" })
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn$1("w-full p-4", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[300px] w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      LineChart,
      {
        animationDuration: 0,
        aspectRatio: "auto",
        className: "h-full",
        data: chartData,
        margin: { top: 8, right: 12, bottom: 40, left: 32 },
        xDataKey: "date",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { horizontal: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, {}),
          visibleSeries.map((series) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Line,
            {
              animate: false,
              curve: monotoneX,
              dashArray: "4,4",
              dashFromIndex,
              dataKey: `${series.key}:pageviews`,
              fadeEdges: "left",
              markers: POINT_MARKER,
              showMarkers: chartData.length <= MARKERS_MAX_POINTS,
              stroke: series.color,
              strokeWidth: 1.5
            },
            series.key
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            OPChartTooltip,
            {
              extra: () => {
                const total = visibleSeries.length;
                const hidden = Math.max(0, total - TOOLTIP_LIMIT);
                if (hidden === 0) {
                  return null;
                }
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm", children: [
                  "and ",
                  hidden,
                  " more ",
                  hidden === 1 ? "item" : "items"
                ] });
              },
              interval,
              rows: (point2) => {
                const ranked = visibleSeries.map((series) => {
                  const sessions = point2[`${series.key}:sessions`] ?? 0;
                  const pageviews = point2[`${series.key}:pageviews`] ?? 0;
                  const revenue = point2[`${series.key}:revenue`];
                  return { series, sessions, pageviews, revenue };
                }).sort((a2, b2) => b2.pageviews - a2.pageviews);
                const top = ranked.slice(0, TOOLTIP_LIMIT);
                return top.map(({ series, sessions, pageviews, revenue }) => ({
                  color: series.color,
                  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: series.prefix || series.name }),
                  label: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    series.prefix && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: series.prefix }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1", children: "/" })
                    ] }),
                    series.name || "Not set"
                  ] }),
                  sub: [
                    ...revenue !== void 0 && revenue > 0 ? [
                      {
                        label: "Revenue",
                        value: revenue,
                        unit: "currency",
                        color: "var(--chart-8)"
                      }
                    ] : [],
                    { label: "Pageviews", value: pageviews },
                    { label: "Sessions", value: sessions }
                  ]
                }));
              },
              showCrosshair: true,
              showDots: true
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LegendScrollable, { items: visibleSeries })
  ] });
}
function LegendScrollable({ items }) {
  const scrollRef = reactExports.useRef(null);
  const [showLeftGradient, setShowLeftGradient] = reactExports.useState(false);
  const [showRightGradient, setShowRightGradient] = reactExports.useState(false);
  const updateGradients = reactExports.useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const hasOverflow = scrollWidth > clientWidth;
    setShowLeftGradient(hasOverflow && scrollLeft > 0);
    setShowRightGradient(
      hasOverflow && scrollLeft < scrollWidth - clientWidth - 1
    );
  }, []);
  reactExports.useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    updateGradients();
    el.addEventListener("scroll", updateGradients);
    window.addEventListener("resize", updateGradients);
    return () => {
      el.removeEventListener("scroll", updateGradients);
      window.removeEventListener("resize", updateGradients);
    };
  }, [updateGradients]);
  reactExports.useEffect(() => {
    requestAnimationFrame(updateGradients);
  }, [items, updateGradients]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-4 -mb-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn$1(
          "pointer-events-none absolute top-0 left-0 z-10 h-full w-8 bg-gradient-to-r from-card to-transparent transition-opacity duration-200",
          showLeftGradient ? "opacity-100" : "opacity-0"
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "hide-scrollbar flex gap-x-4 gap-y-1 overflow-x-auto px-2 py-1 text-xs",
        ref: scrollRef,
        children: items.map((series) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex shrink-0 items-center gap-1",
            style: { color: series.color },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: series.prefix || series.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "whitespace-nowrap font-semibold", children: [
                series.prefix && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: series.prefix }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1", children: "/" })
                ] }),
                series.name || "Not set"
              ] })
            ]
          },
          series.key
        ))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn$1(
          "pointer-events-none absolute top-0 right-0 z-10 h-full w-8 bg-gradient-to-l from-card to-transparent transition-opacity duration-200",
          showRightGradient ? "opacity-100" : "opacity-0"
        )
      }
    )
  ] });
}
function OverviewLineChartLoading({
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn$1("flex h-[358px] items-center justify-center", className),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: "Loading..." })
    }
  );
}
function OverviewViewToggle({
  defaultView = "table",
  className
}) {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringEnum(["table", "chart"]).withDefault(defaultView).withOptions({ history: "push" })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      onClick: () => {
        setView(view === "table" ? "chart" : "table");
      },
      size: "icon",
      title: view === "table" ? "Switch to chart view" : "Switch to table view",
      variant: "ghost",
      children: view === "table" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartLine, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { size: 16 })
    }
  ) });
}
function useOverviewView() {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringEnum(["table", "chart"]).withDefault("table").withOptions({ history: "push" })
  );
  return [view, setView];
}
function useOverviewWidget(key, widgets) {
  const keys = Object.keys(widgets);
  const [widget, setWidget] = useQueryState(
    key,
    parseAsStringEnum(keys).withDefault(keys[0]).withOptions({ history: "push" })
  );
  return [
    {
      ...widgets[widget],
      key: widget
    },
    setWidget,
    mapKeys(widgets).map((key2) => ({
      ...widgets[key2],
      key: key2
    }))
  ];
}
function useOverviewWidgetV2(key, widgets) {
  const keys = Object.keys(widgets);
  const [widget, setWidget] = useQueryState(
    key,
    parseAsStringEnum(keys).withDefault(keys[0]).withOptions({ history: "push" })
  );
  return [
    {
      ...widgets[widget],
      key: widget
    },
    setWidget,
    mapKeys(widgets).map((key2) => ({
      ...widgets[key2],
      key: key2
    }))
  ];
}
function OverviewTopDevices({
  projectId,
  shareId
}) {
  const { interval, range: range2, previous, startDate, endDate } = useOverviewOptions();
  const [filters, setFilter] = useEventQueryFilters();
  const [chartType] = reactExports.useState("bar");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const isPageFilter = filters.find((filter) => filter.name === "path");
  const [widget, setWidget, widgets] = useOverviewWidget("tech", {
    device: {
      title: "Top devices",
      btn: "Devices",
      chart: {
        options: {
          columns: ["Device", isPageFilter ? "Views" : "Sessions"]
        },
        report: {
          limit: 10,
          projectId,
          startDate,
          endDate,
          series: [
            {
              type: "event",
              segment: "user",
              filters,
              id: "A",
              name: isPageFilter ? "screen_view" : "session_start"
            }
          ],
          breakdowns: [
            {
              id: "A",
              name: "device"
            }
          ],
          chartType,
          lineType: "monotone",
          interval,
          name: "Top devices",
          range: range2,
          previous,
          metric: "sum"
        }
      }
    },
    browser: {
      title: "Top browser",
      btn: "Browser",
      chart: {
        options: {
          columns: ["Browser", isPageFilter ? "Views" : "Sessions"]
        },
        report: {
          limit: 10,
          projectId,
          startDate,
          endDate,
          series: [
            {
              type: "event",
              segment: "user",
              filters,
              id: "A",
              name: isPageFilter ? "screen_view" : "session_start"
            }
          ],
          breakdowns: [
            {
              id: "A",
              name: "browser"
            }
          ],
          chartType,
          lineType: "monotone",
          interval,
          name: "Top browser",
          range: range2,
          previous,
          metric: "sum"
        }
      }
    },
    browser_version: {
      title: "Top Browser Version",
      btn: "Browser Version",
      chart: {
        options: {
          columns: ["Version", isPageFilter ? "Views" : "Sessions"],
          renderSerieName(name) {
            return name.at(-1) || NOT_SET_VALUE;
          }
        },
        report: {
          limit: 10,
          projectId,
          startDate,
          endDate,
          series: [
            {
              type: "event",
              segment: "user",
              filters,
              id: "A",
              name: isPageFilter ? "screen_view" : "session_start"
            }
          ],
          breakdowns: [
            {
              id: "A",
              name: "browser"
            },
            {
              id: "B",
              name: "browser_version"
            }
          ],
          chartType,
          lineType: "monotone",
          interval,
          name: "Top Browser Version",
          range: range2,
          previous,
          metric: "sum"
        }
      }
    },
    os: {
      title: "Top OS",
      btn: "OS",
      chart: {
        options: {
          columns: ["OS", isPageFilter ? "Views" : "Sessions"]
        },
        report: {
          limit: 10,
          projectId,
          startDate,
          endDate,
          series: [
            {
              type: "event",
              segment: "user",
              filters,
              id: "A",
              name: isPageFilter ? "screen_view" : "session_start"
            }
          ],
          breakdowns: [
            {
              id: "A",
              name: "os"
            }
          ],
          chartType,
          lineType: "monotone",
          interval,
          name: "Top OS",
          range: range2,
          previous,
          metric: "sum"
        }
      }
    },
    os_version: {
      title: "Top OS version",
      btn: "OS Version",
      chart: {
        options: {
          columns: ["Version", isPageFilter ? "Views" : "Sessions"],
          renderSerieName(name) {
            return name.at(-1) || NOT_SET_VALUE;
          }
        },
        report: {
          limit: 10,
          projectId,
          startDate,
          endDate,
          series: [
            {
              type: "event",
              segment: "user",
              filters,
              id: "A",
              name: isPageFilter ? "screen_view" : "session_start"
            }
          ],
          breakdowns: [
            {
              id: "A",
              name: "os"
            },
            {
              id: "B",
              name: "os_version"
            }
          ],
          chartType,
          lineType: "monotone",
          interval,
          name: "Top OS version",
          range: range2,
          previous,
          metric: "sum"
        }
      }
    },
    brand: {
      title: "Top Brands",
      btn: "Brands",
      chart: {
        options: {
          columns: ["Brand", isPageFilter ? "Views" : "Sessions"]
        },
        report: {
          limit: 10,
          projectId,
          startDate,
          endDate,
          series: [
            {
              type: "event",
              segment: "user",
              filters,
              id: "A",
              name: isPageFilter ? "screen_view" : "session_start"
            }
          ],
          breakdowns: [
            {
              id: "A",
              name: "brand"
            }
          ],
          chartType,
          lineType: "monotone",
          interval,
          name: "Top Brands",
          range: range2,
          previous,
          metric: "sum"
        }
      }
    },
    model: {
      title: "Top Models",
      btn: "Models",
      chart: {
        options: {
          columns: ["Model", isPageFilter ? "Views" : "Sessions"],
          renderSerieName(name) {
            return name.at(-1) || NOT_SET_VALUE;
          }
        },
        report: {
          limit: 10,
          projectId,
          startDate,
          endDate,
          series: [
            {
              type: "event",
              segment: "user",
              filters,
              id: "A",
              name: isPageFilter ? "screen_view" : "session_start"
            }
          ],
          breakdowns: [
            {
              id: "A",
              name: "brand"
            },
            {
              id: "B",
              name: "model"
            }
          ],
          chartType,
          lineType: "monotone",
          interval,
          name: "Top Models",
          range: range2,
          previous,
          metric: "sum"
        }
      }
    }
  });
  const trpc = useTRPC();
  const [view] = useOverviewView();
  const query = useQuery(
    trpc.overview.topGeneric.queryOptions({
      projectId,
      shareId,
      range: range2,
      filters,
      column: widget.key,
      startDate,
      endDate
    })
  );
  const seriesQuery = useQuery(
    trpc.overview.topGenericSeries.queryOptions(
      {
        projectId,
        shareId,
        range: range2,
        filters,
        column: widget.key,
        startDate,
        endDate,
        interval
      },
      {
        enabled: view === "chart"
      }
    )
  );
  const filteredData = reactExports.useMemo(() => {
    const data = query.data ?? [];
    if (!searchQuery.trim()) {
      return data;
    }
    const queryLower = searchQuery.toLowerCase();
    return data.filter((item) => item.name?.toLowerCase().includes(queryLower));
  }, [query.data, searchQuery]);
  const tabs = widgets.map((w2) => ({
    key: w2.key,
    label: w2.btn
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "col-span-6 md:col-span-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      WidgetHeadSearchable,
      {
        activeTab: widget.key,
        className: "border-b-0 pb-2",
        onSearchChange: setSearchQuery,
        onTabChange: setWidget,
        searchPlaceholder: `Search ${widget.btn.toLowerCase()}`,
        searchValue: searchQuery,
        tabs
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { className: "p-0", children: view === "chart" ? seriesQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewLineChartLoading, {}) : seriesQuery.data ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      OverviewLineChart,
      {
        data: seriesQuery.data,
        interval,
        range: range2,
        searchQuery
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewLineChartLoading, {}) : query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewWidgetTableLoading, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      OverviewWidgetTableGeneric,
      {
        column: {
          name: OVERVIEW_COLUMNS_NAME[widget.key],
          render(item) {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row relative min-w-0 items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: item.name || NOT_SET_VALUE }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "truncate",
                  onClick: () => {
                    setFilter(widget.key, item.name);
                  },
                  type: "button",
                  children: item.name || "Not set"
                }
              )
            ] });
          }
        },
        data: filteredData
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        OverviewDetailsButton,
        {
          onClick: () => pushModal("OverviewTopGenericModal", {
            projectId,
            shareId,
            column: widget.key
          })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewViewToggle, {})
    ] })
  ] }) });
}
function OverviewTopEvents({
  projectId,
  shareId
}) {
  const { range: range2, startDate, endDate } = useOverviewOptions();
  const [filters] = useEventQueryFilters();
  const { organizationId } = useAppParams();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { data: conversions } = useQuery(
    trpc.overview.topConversions.queryOptions({ projectId, shareId })
  );
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [widget, setWidget, widgets] = useOverviewWidgetV2("ev", {
    your: {
      title: "Events",
      btn: "Events",
      meta: {
        type: "events"
      }
    },
    conversions: {
      title: "Conversions",
      btn: "Conversions",
      hide: !conversions || conversions.length === 0,
      meta: {
        type: "conversions"
      }
    },
    link_out: {
      title: "Link out",
      btn: "Link out",
      meta: {
        type: "linkOut"
      }
    }
  });
  const eventsQuery = useQuery(
    trpc.overview.topEvents.queryOptions({
      projectId,
      shareId,
      range: range2,
      startDate,
      endDate,
      filters,
      excludeEvents: widget.meta?.type === "events" ? ["session_start", "session_end", "screen_view"] : void 0
    })
  );
  const linkOutQuery = useQuery(
    trpc.overview.topLinkOut.queryOptions({
      projectId,
      shareId,
      range: range2,
      startDate,
      endDate,
      filters
    })
  );
  const tableData = reactExports.useMemo(() => {
    if (widget.meta?.type === "linkOut") {
      if (!linkOutQuery.data) {
        return [];
      }
      return linkOutQuery.data.map((item) => ({
        id: item.href,
        name: item.href,
        count: item.count
      }));
    }
    if (!eventsQuery.data) {
      return [];
    }
    if (widget.meta?.type === "conversions" && conversions) {
      const conversionNames = new Set(conversions.map((c2) => c2.name));
      return eventsQuery.data.filter((item) => conversionNames.has(item.name)).map((item) => ({
        id: item.name,
        name: item.name,
        count: item.count
      }));
    }
    return eventsQuery.data.map((item) => ({
      id: item.name,
      name: item.name,
      count: item.count
    }));
  }, [eventsQuery.data, linkOutQuery.data, widget.meta?.type, conversions]);
  const isLoading = widget.meta?.type === "linkOut" ? linkOutQuery.isLoading : eventsQuery.isLoading;
  const filteredData = reactExports.useMemo(() => {
    if (!searchQuery.trim()) {
      return tableData;
    }
    const queryLower = searchQuery.toLowerCase();
    return tableData.filter(
      (item) => item.name?.toLowerCase().includes(queryLower)
    );
  }, [tableData, searchQuery]);
  const tabs = reactExports.useMemo(
    () => widgets.filter((item) => item.hide !== true).map((w2) => ({
      key: w2.key,
      label: w2.btn
    })),
    [widgets]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "col-span-6 md:col-span-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      WidgetHeadSearchable,
      {
        activeTab: widget.key,
        className: "border-b-0 pb-2",
        onSearchChange: setSearchQuery,
        onTabChange: setWidget,
        searchPlaceholder: `Search ${widget.btn.toLowerCase()}`,
        searchValue: searchQuery,
        tabs
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewWidgetTableLoading, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      OverviewWidgetTableEvents,
      {
        data: filteredData,
        onItemClick: (name) => {
          const filterName = widget.meta?.type === "linkOut" ? "properties.href" : "name";
          const f = eventQueryFiltersParser.serialize([
            {
              id: filterName,
              name: filterName,
              operator: "is",
              value: [name]
            }
          ]);
          navigate({
            to: "/$organizationId/$projectId/events/events",
            params: { organizationId, projectId },
            search: { f }
          });
        }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }) })
  ] }) });
}
var dist = {};
const require$$0 = /* @__PURE__ */ getAugmentedNamespace(tslib_es6);
var epsilon = 1e-6;
var epsilon2 = 1e-12;
var pi = Math.PI;
var halfPi = pi / 2;
var quarterPi = pi / 4;
var tau = pi * 2;
var degrees = 180 / pi;
var radians = pi / 180;
var abs = Math.abs;
var atan = Math.atan;
var atan2 = Math.atan2;
var cos = Math.cos;
var ceil = Math.ceil;
var exp = Math.exp;
var hypot = Math.hypot;
var log = Math.log;
var pow = Math.pow;
var sin = Math.sin;
var sign = Math.sign || function(x2) {
  return x2 > 0 ? 1 : x2 < 0 ? -1 : 0;
};
var sqrt = Math.sqrt;
var tan = Math.tan;
function acos(x2) {
  return x2 > 1 ? 0 : x2 < -1 ? pi : Math.acos(x2);
}
function asin(x2) {
  return x2 > 1 ? halfPi : x2 < -1 ? -halfPi : Math.asin(x2);
}
function haversin(x2) {
  return (x2 = sin(x2 / 2)) * x2;
}
function noop$1() {
}
function streamGeometry(geometry, stream) {
  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
    streamGeometryType[geometry.type](geometry, stream);
  }
}
var streamObjectType = {
  Feature: function(object2, stream) {
    streamGeometry(object2.geometry, stream);
  },
  FeatureCollection: function(object2, stream) {
    var features = object2.features, i2 = -1, n2 = features.length;
    while (++i2 < n2) streamGeometry(features[i2].geometry, stream);
  }
};
var streamGeometryType = {
  Sphere: function(object2, stream) {
    stream.sphere();
  },
  Point: function(object2, stream) {
    object2 = object2.coordinates;
    stream.point(object2[0], object2[1], object2[2]);
  },
  MultiPoint: function(object2, stream) {
    var coordinates2 = object2.coordinates, i2 = -1, n2 = coordinates2.length;
    while (++i2 < n2) object2 = coordinates2[i2], stream.point(object2[0], object2[1], object2[2]);
  },
  LineString: function(object2, stream) {
    streamLine(object2.coordinates, stream, 0);
  },
  MultiLineString: function(object2, stream) {
    var coordinates2 = object2.coordinates, i2 = -1, n2 = coordinates2.length;
    while (++i2 < n2) streamLine(coordinates2[i2], stream, 0);
  },
  Polygon: function(object2, stream) {
    streamPolygon(object2.coordinates, stream);
  },
  MultiPolygon: function(object2, stream) {
    var coordinates2 = object2.coordinates, i2 = -1, n2 = coordinates2.length;
    while (++i2 < n2) streamPolygon(coordinates2[i2], stream);
  },
  GeometryCollection: function(object2, stream) {
    var geometries = object2.geometries, i2 = -1, n2 = geometries.length;
    while (++i2 < n2) streamGeometry(geometries[i2], stream);
  }
};
function streamLine(coordinates2, stream, closed) {
  var i2 = -1, n2 = coordinates2.length - closed, coordinate;
  stream.lineStart();
  while (++i2 < n2) coordinate = coordinates2[i2], stream.point(coordinate[0], coordinate[1], coordinate[2]);
  stream.lineEnd();
}
function streamPolygon(coordinates2, stream) {
  var i2 = -1, n2 = coordinates2.length;
  stream.polygonStart();
  while (++i2 < n2) streamLine(coordinates2[i2], stream, 1);
  stream.polygonEnd();
}
function geoStream(object2, stream) {
  if (object2 && streamObjectType.hasOwnProperty(object2.type)) {
    streamObjectType[object2.type](object2, stream);
  } else {
    streamGeometry(object2, stream);
  }
}
var areaRingSum$1 = new Adder();
var areaSum$1 = new Adder(), lambda00$2, phi00$2, lambda0$2, cosPhi0$1, sinPhi0$1;
var areaStream$1 = {
  point: noop$1,
  lineStart: noop$1,
  lineEnd: noop$1,
  polygonStart: function() {
    areaRingSum$1 = new Adder();
    areaStream$1.lineStart = areaRingStart$1;
    areaStream$1.lineEnd = areaRingEnd$1;
  },
  polygonEnd: function() {
    var areaRing = +areaRingSum$1;
    areaSum$1.add(areaRing < 0 ? tau + areaRing : areaRing);
    this.lineStart = this.lineEnd = this.point = noop$1;
  },
  sphere: function() {
    areaSum$1.add(tau);
  }
};
function areaRingStart$1() {
  areaStream$1.point = areaPointFirst$1;
}
function areaRingEnd$1() {
  areaPoint$1(lambda00$2, phi00$2);
}
function areaPointFirst$1(lambda, phi) {
  areaStream$1.point = areaPoint$1;
  lambda00$2 = lambda, phi00$2 = phi;
  lambda *= radians, phi *= radians;
  lambda0$2 = lambda, cosPhi0$1 = cos(phi = phi / 2 + quarterPi), sinPhi0$1 = sin(phi);
}
function areaPoint$1(lambda, phi) {
  lambda *= radians, phi *= radians;
  phi = phi / 2 + quarterPi;
  var dLambda = lambda - lambda0$2, sdLambda = dLambda >= 0 ? 1 : -1, adLambda = sdLambda * dLambda, cosPhi = cos(phi), sinPhi = sin(phi), k2 = sinPhi0$1 * sinPhi, u2 = cosPhi0$1 * cosPhi + k2 * cos(adLambda), v2 = k2 * sdLambda * sin(adLambda);
  areaRingSum$1.add(atan2(v2, u2));
  lambda0$2 = lambda, cosPhi0$1 = cosPhi, sinPhi0$1 = sinPhi;
}
function area(object2) {
  areaSum$1 = new Adder();
  geoStream(object2, areaStream$1);
  return areaSum$1 * 2;
}
function spherical(cartesian2) {
  return [atan2(cartesian2[1], cartesian2[0]), asin(cartesian2[2])];
}
function cartesian(spherical2) {
  var lambda = spherical2[0], phi = spherical2[1], cosPhi = cos(phi);
  return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
}
function cartesianDot(a2, b2) {
  return a2[0] * b2[0] + a2[1] * b2[1] + a2[2] * b2[2];
}
function cartesianCross(a2, b2) {
  return [a2[1] * b2[2] - a2[2] * b2[1], a2[2] * b2[0] - a2[0] * b2[2], a2[0] * b2[1] - a2[1] * b2[0]];
}
function cartesianAddInPlace(a2, b2) {
  a2[0] += b2[0], a2[1] += b2[1], a2[2] += b2[2];
}
function cartesianScale(vector, k2) {
  return [vector[0] * k2, vector[1] * k2, vector[2] * k2];
}
function cartesianNormalizeInPlace(d2) {
  var l2 = sqrt(d2[0] * d2[0] + d2[1] * d2[1] + d2[2] * d2[2]);
  d2[0] /= l2, d2[1] /= l2, d2[2] /= l2;
}
var lambda0$1, phi0, lambda1, phi1, lambda2, lambda00$1, phi00$1, p0, deltaSum, ranges, range;
var boundsStream$1 = {
  point: boundsPoint$1,
  lineStart: boundsLineStart,
  lineEnd: boundsLineEnd,
  polygonStart: function() {
    boundsStream$1.point = boundsRingPoint;
    boundsStream$1.lineStart = boundsRingStart;
    boundsStream$1.lineEnd = boundsRingEnd;
    deltaSum = new Adder();
    areaStream$1.polygonStart();
  },
  polygonEnd: function() {
    areaStream$1.polygonEnd();
    boundsStream$1.point = boundsPoint$1;
    boundsStream$1.lineStart = boundsLineStart;
    boundsStream$1.lineEnd = boundsLineEnd;
    if (areaRingSum$1 < 0) lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
    else if (deltaSum > epsilon) phi1 = 90;
    else if (deltaSum < -epsilon) phi0 = -90;
    range[0] = lambda0$1, range[1] = lambda1;
  },
  sphere: function() {
    lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
  }
};
function boundsPoint$1(lambda, phi) {
  ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
  if (phi < phi0) phi0 = phi;
  if (phi > phi1) phi1 = phi;
}
function linePoint(lambda, phi) {
  var p2 = cartesian([lambda * radians, phi * radians]);
  if (p0) {
    var normal = cartesianCross(p0, p2), equatorial = [normal[1], -normal[0], 0], inflection = cartesianCross(equatorial, normal);
    cartesianNormalizeInPlace(inflection);
    inflection = spherical(inflection);
    var delta = lambda - lambda2, sign2 = delta > 0 ? 1 : -1, lambdai = inflection[0] * degrees * sign2, phii, antimeridian = abs(delta) > 180;
    if (antimeridian ^ (sign2 * lambda2 < lambdai && lambdai < sign2 * lambda)) {
      phii = inflection[1] * degrees;
      if (phii > phi1) phi1 = phii;
    } else if (lambdai = (lambdai + 360) % 360 - 180, antimeridian ^ (sign2 * lambda2 < lambdai && lambdai < sign2 * lambda)) {
      phii = -inflection[1] * degrees;
      if (phii < phi0) phi0 = phii;
    } else {
      if (phi < phi0) phi0 = phi;
      if (phi > phi1) phi1 = phi;
    }
    if (antimeridian) {
      if (lambda < lambda2) {
        if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
      } else {
        if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
      }
    } else {
      if (lambda1 >= lambda0$1) {
        if (lambda < lambda0$1) lambda0$1 = lambda;
        if (lambda > lambda1) lambda1 = lambda;
      } else {
        if (lambda > lambda2) {
          if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
        } else {
          if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
        }
      }
    }
  } else {
    ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
  }
  if (phi < phi0) phi0 = phi;
  if (phi > phi1) phi1 = phi;
  p0 = p2, lambda2 = lambda;
}
function boundsLineStart() {
  boundsStream$1.point = linePoint;
}
function boundsLineEnd() {
  range[0] = lambda0$1, range[1] = lambda1;
  boundsStream$1.point = boundsPoint$1;
  p0 = null;
}
function boundsRingPoint(lambda, phi) {
  if (p0) {
    var delta = lambda - lambda2;
    deltaSum.add(abs(delta) > 180 ? delta + (delta > 0 ? 360 : -360) : delta);
  } else {
    lambda00$1 = lambda, phi00$1 = phi;
  }
  areaStream$1.point(lambda, phi);
  linePoint(lambda, phi);
}
function boundsRingStart() {
  areaStream$1.lineStart();
}
function boundsRingEnd() {
  boundsRingPoint(lambda00$1, phi00$1);
  areaStream$1.lineEnd();
  if (abs(deltaSum) > epsilon) lambda0$1 = -(lambda1 = 180);
  range[0] = lambda0$1, range[1] = lambda1;
  p0 = null;
}
function angle(lambda02, lambda12) {
  return (lambda12 -= lambda02) < 0 ? lambda12 + 360 : lambda12;
}
function rangeCompare(a2, b2) {
  return a2[0] - b2[0];
}
function rangeContains(range2, x2) {
  return range2[0] <= range2[1] ? range2[0] <= x2 && x2 <= range2[1] : x2 < range2[0] || range2[1] < x2;
}
function bounds(feature) {
  var i2, n2, a2, b2, merged, deltaMax, delta;
  phi1 = lambda1 = -(lambda0$1 = phi0 = Infinity);
  ranges = [];
  geoStream(feature, boundsStream$1);
  if (n2 = ranges.length) {
    ranges.sort(rangeCompare);
    for (i2 = 1, a2 = ranges[0], merged = [a2]; i2 < n2; ++i2) {
      b2 = ranges[i2];
      if (rangeContains(a2, b2[0]) || rangeContains(a2, b2[1])) {
        if (angle(a2[0], b2[1]) > angle(a2[0], a2[1])) a2[1] = b2[1];
        if (angle(b2[0], a2[1]) > angle(a2[0], a2[1])) a2[0] = b2[0];
      } else {
        merged.push(a2 = b2);
      }
    }
    for (deltaMax = -Infinity, n2 = merged.length - 1, i2 = 0, a2 = merged[n2]; i2 <= n2; a2 = b2, ++i2) {
      b2 = merged[i2];
      if ((delta = angle(a2[1], b2[0])) > deltaMax) deltaMax = delta, lambda0$1 = b2[0], lambda1 = a2[1];
    }
  }
  ranges = range = null;
  return lambda0$1 === Infinity || phi0 === Infinity ? [[NaN, NaN], [NaN, NaN]] : [[lambda0$1, phi0], [lambda1, phi1]];
}
var W0, W1, X0$1, Y0$1, Z0$1, X1$1, Y1$1, Z1$1, X2$1, Y2$1, Z2$1, lambda00, phi00, x0$4, y0$4, z0;
var centroidStream$1 = {
  sphere: noop$1,
  point: centroidPoint$1,
  lineStart: centroidLineStart$1,
  lineEnd: centroidLineEnd$1,
  polygonStart: function() {
    centroidStream$1.lineStart = centroidRingStart$1;
    centroidStream$1.lineEnd = centroidRingEnd$1;
  },
  polygonEnd: function() {
    centroidStream$1.lineStart = centroidLineStart$1;
    centroidStream$1.lineEnd = centroidLineEnd$1;
  }
};
function centroidPoint$1(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi);
  centroidPointCartesian(cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi));
}
function centroidPointCartesian(x2, y2, z2) {
  ++W0;
  X0$1 += (x2 - X0$1) / W0;
  Y0$1 += (y2 - Y0$1) / W0;
  Z0$1 += (z2 - Z0$1) / W0;
}
function centroidLineStart$1() {
  centroidStream$1.point = centroidLinePointFirst;
}
function centroidLinePointFirst(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi);
  x0$4 = cosPhi * cos(lambda);
  y0$4 = cosPhi * sin(lambda);
  z0 = sin(phi);
  centroidStream$1.point = centroidLinePoint;
  centroidPointCartesian(x0$4, y0$4, z0);
}
function centroidLinePoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi), x2 = cosPhi * cos(lambda), y2 = cosPhi * sin(lambda), z2 = sin(phi), w2 = atan2(sqrt((w2 = y0$4 * z2 - z0 * y2) * w2 + (w2 = z0 * x2 - x0$4 * z2) * w2 + (w2 = x0$4 * y2 - y0$4 * x2) * w2), x0$4 * x2 + y0$4 * y2 + z0 * z2);
  W1 += w2;
  X1$1 += w2 * (x0$4 + (x0$4 = x2));
  Y1$1 += w2 * (y0$4 + (y0$4 = y2));
  Z1$1 += w2 * (z0 + (z0 = z2));
  centroidPointCartesian(x0$4, y0$4, z0);
}
function centroidLineEnd$1() {
  centroidStream$1.point = centroidPoint$1;
}
function centroidRingStart$1() {
  centroidStream$1.point = centroidRingPointFirst;
}
function centroidRingEnd$1() {
  centroidRingPoint(lambda00, phi00);
  centroidStream$1.point = centroidPoint$1;
}
function centroidRingPointFirst(lambda, phi) {
  lambda00 = lambda, phi00 = phi;
  lambda *= radians, phi *= radians;
  centroidStream$1.point = centroidRingPoint;
  var cosPhi = cos(phi);
  x0$4 = cosPhi * cos(lambda);
  y0$4 = cosPhi * sin(lambda);
  z0 = sin(phi);
  centroidPointCartesian(x0$4, y0$4, z0);
}
function centroidRingPoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi), x2 = cosPhi * cos(lambda), y2 = cosPhi * sin(lambda), z2 = sin(phi), cx = y0$4 * z2 - z0 * y2, cy = z0 * x2 - x0$4 * z2, cz = x0$4 * y2 - y0$4 * x2, m2 = hypot(cx, cy, cz), w2 = asin(m2), v2 = m2 && -w2 / m2;
  X2$1.add(v2 * cx);
  Y2$1.add(v2 * cy);
  Z2$1.add(v2 * cz);
  W1 += w2;
  X1$1 += w2 * (x0$4 + (x0$4 = x2));
  Y1$1 += w2 * (y0$4 + (y0$4 = y2));
  Z1$1 += w2 * (z0 + (z0 = z2));
  centroidPointCartesian(x0$4, y0$4, z0);
}
function centroid(object2) {
  W0 = W1 = X0$1 = Y0$1 = Z0$1 = X1$1 = Y1$1 = Z1$1 = 0;
  X2$1 = new Adder();
  Y2$1 = new Adder();
  Z2$1 = new Adder();
  geoStream(object2, centroidStream$1);
  var x2 = +X2$1, y2 = +Y2$1, z2 = +Z2$1, m2 = hypot(x2, y2, z2);
  if (m2 < epsilon2) {
    x2 = X1$1, y2 = Y1$1, z2 = Z1$1;
    if (W1 < epsilon) x2 = X0$1, y2 = Y0$1, z2 = Z0$1;
    m2 = hypot(x2, y2, z2);
    if (m2 < epsilon2) return [NaN, NaN];
  }
  return [atan2(y2, x2) * degrees, asin(z2 / m2) * degrees];
}
function constant(x2) {
  return function() {
    return x2;
  };
}
function compose(a2, b2) {
  function compose2(x2, y2) {
    return x2 = a2(x2, y2), b2(x2[0], x2[1]);
  }
  if (a2.invert && b2.invert) compose2.invert = function(x2, y2) {
    return x2 = b2.invert(x2, y2), x2 && a2.invert(x2[0], x2[1]);
  };
  return compose2;
}
function rotationIdentity(lambda, phi) {
  return [abs(lambda) > pi ? lambda + Math.round(-lambda / tau) * tau : lambda, phi];
}
rotationIdentity.invert = rotationIdentity;
function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
  return (deltaLambda %= tau) ? deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma)) : rotationLambda(deltaLambda) : deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma) : rotationIdentity;
}
function forwardRotationLambda(deltaLambda) {
  return function(lambda, phi) {
    return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
  };
}
function rotationLambda(deltaLambda) {
  var rotation2 = forwardRotationLambda(deltaLambda);
  rotation2.invert = forwardRotationLambda(-deltaLambda);
  return rotation2;
}
function rotationPhiGamma(deltaPhi, deltaGamma) {
  var cosDeltaPhi = cos(deltaPhi), sinDeltaPhi = sin(deltaPhi), cosDeltaGamma = cos(deltaGamma), sinDeltaGamma = sin(deltaGamma);
  function rotation2(lambda, phi) {
    var cosPhi = cos(phi), x2 = cos(lambda) * cosPhi, y2 = sin(lambda) * cosPhi, z2 = sin(phi), k2 = z2 * cosDeltaPhi + x2 * sinDeltaPhi;
    return [
      atan2(y2 * cosDeltaGamma - k2 * sinDeltaGamma, x2 * cosDeltaPhi - z2 * sinDeltaPhi),
      asin(k2 * cosDeltaGamma + y2 * sinDeltaGamma)
    ];
  }
  rotation2.invert = function(lambda, phi) {
    var cosPhi = cos(phi), x2 = cos(lambda) * cosPhi, y2 = sin(lambda) * cosPhi, z2 = sin(phi), k2 = z2 * cosDeltaGamma - y2 * sinDeltaGamma;
    return [
      atan2(y2 * cosDeltaGamma + z2 * sinDeltaGamma, x2 * cosDeltaPhi + k2 * sinDeltaPhi),
      asin(k2 * cosDeltaPhi - x2 * sinDeltaPhi)
    ];
  };
  return rotation2;
}
function rotation(rotate) {
  rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);
  function forward(coordinates2) {
    coordinates2 = rotate(coordinates2[0] * radians, coordinates2[1] * radians);
    return coordinates2[0] *= degrees, coordinates2[1] *= degrees, coordinates2;
  }
  forward.invert = function(coordinates2) {
    coordinates2 = rotate.invert(coordinates2[0] * radians, coordinates2[1] * radians);
    return coordinates2[0] *= degrees, coordinates2[1] *= degrees, coordinates2;
  };
  return forward;
}
function circleStream(stream, radius, delta, direction, t02, t12) {
  if (!delta) return;
  var cosRadius = cos(radius), sinRadius = sin(radius), step = direction * delta;
  if (t02 == null) {
    t02 = radius + direction * tau;
    t12 = radius - step / 2;
  } else {
    t02 = circleRadius(cosRadius, t02);
    t12 = circleRadius(cosRadius, t12);
    if (direction > 0 ? t02 < t12 : t02 > t12) t02 += direction * tau;
  }
  for (var point2, t2 = t02; direction > 0 ? t2 > t12 : t2 < t12; t2 -= step) {
    point2 = spherical([cosRadius, -sinRadius * cos(t2), -sinRadius * sin(t2)]);
    stream.point(point2[0], point2[1]);
  }
}
function circleRadius(cosRadius, point2) {
  point2 = cartesian(point2), point2[0] -= cosRadius;
  cartesianNormalizeInPlace(point2);
  var radius = acos(-point2[1]);
  return ((-point2[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
}
function circle$1() {
  var center2 = constant([0, 0]), radius = constant(90), precision = constant(6), ring, rotate, stream = { point: point2 };
  function point2(x2, y2) {
    ring.push(x2 = rotate(x2, y2));
    x2[0] *= degrees, x2[1] *= degrees;
  }
  function circle2() {
    var c2 = center2.apply(this, arguments), r2 = radius.apply(this, arguments) * radians, p2 = precision.apply(this, arguments) * radians;
    ring = [];
    rotate = rotateRadians(-c2[0] * radians, -c2[1] * radians, 0).invert;
    circleStream(stream, r2, p2, 1);
    c2 = { type: "Polygon", coordinates: [ring] };
    ring = rotate = null;
    return c2;
  }
  circle2.center = function(_2) {
    return arguments.length ? (center2 = typeof _2 === "function" ? _2 : constant([+_2[0], +_2[1]]), circle2) : center2;
  };
  circle2.radius = function(_2) {
    return arguments.length ? (radius = typeof _2 === "function" ? _2 : constant(+_2), circle2) : radius;
  };
  circle2.precision = function(_2) {
    return arguments.length ? (precision = typeof _2 === "function" ? _2 : constant(+_2), circle2) : precision;
  };
  return circle2;
}
function clipBuffer() {
  var lines = [], line;
  return {
    point: function(x2, y2, m2) {
      line.push([x2, y2, m2]);
    },
    lineStart: function() {
      lines.push(line = []);
    },
    lineEnd: noop$1,
    rejoin: function() {
      if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
    },
    result: function() {
      var result = lines;
      lines = [];
      line = null;
      return result;
    }
  };
}
function pointEqual(a2, b2) {
  return abs(a2[0] - b2[0]) < epsilon && abs(a2[1] - b2[1]) < epsilon;
}
function Intersection(point2, points, other, entry) {
  this.x = point2;
  this.z = points;
  this.o = other;
  this.e = entry;
  this.v = false;
  this.n = this.p = null;
}
function clipRejoin(segments, compareIntersection2, startInside, interpolate2, stream) {
  var subject = [], clip2 = [], i2, n2;
  segments.forEach(function(segment) {
    if ((n3 = segment.length - 1) <= 0) return;
    var n3, p02 = segment[0], p1 = segment[n3], x2;
    if (pointEqual(p02, p1)) {
      if (!p02[2] && !p1[2]) {
        stream.lineStart();
        for (i2 = 0; i2 < n3; ++i2) stream.point((p02 = segment[i2])[0], p02[1]);
        stream.lineEnd();
        return;
      }
      p1[0] += 2 * epsilon;
    }
    subject.push(x2 = new Intersection(p02, segment, null, true));
    clip2.push(x2.o = new Intersection(p02, null, x2, false));
    subject.push(x2 = new Intersection(p1, segment, null, false));
    clip2.push(x2.o = new Intersection(p1, null, x2, true));
  });
  if (!subject.length) return;
  clip2.sort(compareIntersection2);
  link(subject);
  link(clip2);
  for (i2 = 0, n2 = clip2.length; i2 < n2; ++i2) {
    clip2[i2].e = startInside = !startInside;
  }
  var start2 = subject[0], points, point2;
  while (1) {
    var current = start2, isSubject = true;
    while (current.v) if ((current = current.n) === start2) return;
    points = current.z;
    stream.lineStart();
    do {
      current.v = current.o.v = true;
      if (current.e) {
        if (isSubject) {
          for (i2 = 0, n2 = points.length; i2 < n2; ++i2) stream.point((point2 = points[i2])[0], point2[1]);
        } else {
          interpolate2(current.x, current.n.x, 1, stream);
        }
        current = current.n;
      } else {
        if (isSubject) {
          points = current.p.z;
          for (i2 = points.length - 1; i2 >= 0; --i2) stream.point((point2 = points[i2])[0], point2[1]);
        } else {
          interpolate2(current.x, current.p.x, -1, stream);
        }
        current = current.p;
      }
      current = current.o;
      points = current.z;
      isSubject = !isSubject;
    } while (!current.v);
    stream.lineEnd();
  }
}
function link(array) {
  if (!(n2 = array.length)) return;
  var n2, i2 = 0, a2 = array[0], b2;
  while (++i2 < n2) {
    a2.n = b2 = array[i2];
    b2.p = a2;
    a2 = b2;
  }
  a2.n = b2 = array[0];
  b2.p = a2;
}
function longitude(point2) {
  if (abs(point2[0]) <= pi)
    return point2[0];
  else
    return sign(point2[0]) * ((abs(point2[0]) + pi) % tau - pi);
}
function polygonContains(polygon, point2) {
  var lambda = longitude(point2), phi = point2[1], sinPhi = sin(phi), normal = [sin(lambda), -cos(lambda), 0], angle2 = 0, winding = 0;
  var sum = new Adder();
  if (sinPhi === 1) phi = halfPi + epsilon;
  else if (sinPhi === -1) phi = -halfPi - epsilon;
  for (var i2 = 0, n2 = polygon.length; i2 < n2; ++i2) {
    if (!(m2 = (ring = polygon[i2]).length)) continue;
    var ring, m2, point0 = ring[m2 - 1], lambda02 = longitude(point0), phi02 = point0[1] / 2 + quarterPi, sinPhi02 = sin(phi02), cosPhi02 = cos(phi02);
    for (var j2 = 0; j2 < m2; ++j2, lambda02 = lambda12, sinPhi02 = sinPhi1, cosPhi02 = cosPhi1, point0 = point1) {
      var point1 = ring[j2], lambda12 = longitude(point1), phi12 = point1[1] / 2 + quarterPi, sinPhi1 = sin(phi12), cosPhi1 = cos(phi12), delta = lambda12 - lambda02, sign2 = delta >= 0 ? 1 : -1, absDelta = sign2 * delta, antimeridian = absDelta > pi, k2 = sinPhi02 * sinPhi1;
      sum.add(atan2(k2 * sign2 * sin(absDelta), cosPhi02 * cosPhi1 + k2 * cos(absDelta)));
      angle2 += antimeridian ? delta + sign2 * tau : delta;
      if (antimeridian ^ lambda02 >= lambda ^ lambda12 >= lambda) {
        var arc = cartesianCross(cartesian(point0), cartesian(point1));
        cartesianNormalizeInPlace(arc);
        var intersection = cartesianCross(normal, arc);
        cartesianNormalizeInPlace(intersection);
        var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
        if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
          winding += antimeridian ^ delta >= 0 ? 1 : -1;
        }
      }
    }
  }
  return (angle2 < -epsilon || angle2 < epsilon && sum < -epsilon2) ^ winding & 1;
}
function clip(pointVisible, clipLine2, interpolate2, start2) {
  return function(sink) {
    var line = clipLine2(sink), ringBuffer = clipBuffer(), ringSink = clipLine2(ringBuffer), polygonStarted = false, polygon, segments, ring;
    var clip2 = {
      point: point2,
      lineStart,
      lineEnd,
      polygonStart: function() {
        clip2.point = pointRing;
        clip2.lineStart = ringStart;
        clip2.lineEnd = ringEnd;
        segments = [];
        polygon = [];
      },
      polygonEnd: function() {
        clip2.point = point2;
        clip2.lineStart = lineStart;
        clip2.lineEnd = lineEnd;
        segments = merge(segments);
        var startInside = polygonContains(polygon, start2);
        if (segments.length) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          clipRejoin(segments, compareIntersection, startInside, interpolate2, sink);
        } else if (startInside) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          interpolate2(null, null, 1, sink);
          sink.lineEnd();
        }
        if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
        segments = polygon = null;
      },
      sphere: function() {
        sink.polygonStart();
        sink.lineStart();
        interpolate2(null, null, 1, sink);
        sink.lineEnd();
        sink.polygonEnd();
      }
    };
    function point2(lambda, phi) {
      if (pointVisible(lambda, phi)) sink.point(lambda, phi);
    }
    function pointLine(lambda, phi) {
      line.point(lambda, phi);
    }
    function lineStart() {
      clip2.point = pointLine;
      line.lineStart();
    }
    function lineEnd() {
      clip2.point = point2;
      line.lineEnd();
    }
    function pointRing(lambda, phi) {
      ring.push([lambda, phi]);
      ringSink.point(lambda, phi);
    }
    function ringStart() {
      ringSink.lineStart();
      ring = [];
    }
    function ringEnd() {
      pointRing(ring[0][0], ring[0][1]);
      ringSink.lineEnd();
      var clean = ringSink.clean(), ringSegments = ringBuffer.result(), i2, n2 = ringSegments.length, m2, segment, point3;
      ring.pop();
      polygon.push(ring);
      ring = null;
      if (!n2) return;
      if (clean & 1) {
        segment = ringSegments[0];
        if ((m2 = segment.length - 1) > 0) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          for (i2 = 0; i2 < m2; ++i2) sink.point((point3 = segment[i2])[0], point3[1]);
          sink.lineEnd();
        }
        return;
      }
      if (n2 > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
      segments.push(ringSegments.filter(validSegment));
    }
    return clip2;
  };
}
function validSegment(segment) {
  return segment.length > 1;
}
function compareIntersection(a2, b2) {
  return ((a2 = a2.x)[0] < 0 ? a2[1] - halfPi - epsilon : halfPi - a2[1]) - ((b2 = b2.x)[0] < 0 ? b2[1] - halfPi - epsilon : halfPi - b2[1]);
}
const clipAntimeridian = clip(
  function() {
    return true;
  },
  clipAntimeridianLine,
  clipAntimeridianInterpolate,
  [-pi, -halfPi]
);
function clipAntimeridianLine(stream) {
  var lambda02 = NaN, phi02 = NaN, sign0 = NaN, clean;
  return {
    lineStart: function() {
      stream.lineStart();
      clean = 1;
    },
    point: function(lambda12, phi12) {
      var sign1 = lambda12 > 0 ? pi : -pi, delta = abs(lambda12 - lambda02);
      if (abs(delta - pi) < epsilon) {
        stream.point(lambda02, phi02 = (phi02 + phi12) / 2 > 0 ? halfPi : -halfPi);
        stream.point(sign0, phi02);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi02);
        stream.point(lambda12, phi02);
        clean = 0;
      } else if (sign0 !== sign1 && delta >= pi) {
        if (abs(lambda02 - sign0) < epsilon) lambda02 -= sign0 * epsilon;
        if (abs(lambda12 - sign1) < epsilon) lambda12 -= sign1 * epsilon;
        phi02 = clipAntimeridianIntersect(lambda02, phi02, lambda12, phi12);
        stream.point(sign0, phi02);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi02);
        clean = 0;
      }
      stream.point(lambda02 = lambda12, phi02 = phi12);
      sign0 = sign1;
    },
    lineEnd: function() {
      stream.lineEnd();
      lambda02 = phi02 = NaN;
    },
    clean: function() {
      return 2 - clean;
    }
  };
}
function clipAntimeridianIntersect(lambda02, phi02, lambda12, phi12) {
  var cosPhi02, cosPhi1, sinLambda0Lambda1 = sin(lambda02 - lambda12);
  return abs(sinLambda0Lambda1) > epsilon ? atan((sin(phi02) * (cosPhi1 = cos(phi12)) * sin(lambda12) - sin(phi12) * (cosPhi02 = cos(phi02)) * sin(lambda02)) / (cosPhi02 * cosPhi1 * sinLambda0Lambda1)) : (phi02 + phi12) / 2;
}
function clipAntimeridianInterpolate(from, to2, direction, stream) {
  var phi;
  if (from == null) {
    phi = direction * halfPi;
    stream.point(-pi, phi);
    stream.point(0, phi);
    stream.point(pi, phi);
    stream.point(pi, 0);
    stream.point(pi, -phi);
    stream.point(0, -phi);
    stream.point(-pi, -phi);
    stream.point(-pi, 0);
    stream.point(-pi, phi);
  } else if (abs(from[0] - to2[0]) > epsilon) {
    var lambda = from[0] < to2[0] ? pi : -pi;
    phi = direction * lambda / 2;
    stream.point(-lambda, phi);
    stream.point(0, phi);
    stream.point(lambda, phi);
  } else {
    stream.point(to2[0], to2[1]);
  }
}
function clipCircle(radius) {
  var cr = cos(radius), delta = 6 * radians, smallRadius = cr > 0, notHemisphere = abs(cr) > epsilon;
  function interpolate2(from, to2, direction, stream) {
    circleStream(stream, radius, delta, direction, from, to2);
  }
  function visible(lambda, phi) {
    return cos(lambda) * cos(phi) > cr;
  }
  function clipLine2(stream) {
    var point0, c0, v0, v00, clean;
    return {
      lineStart: function() {
        v00 = v0 = false;
        clean = 1;
      },
      point: function(lambda, phi) {
        var point1 = [lambda, phi], point2, v2 = visible(lambda, phi), c2 = smallRadius ? v2 ? 0 : code(lambda, phi) : v2 ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
        if (!point0 && (v00 = v0 = v2)) stream.lineStart();
        if (v2 !== v0) {
          point2 = intersect(point0, point1);
          if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
            point1[2] = 1;
        }
        if (v2 !== v0) {
          clean = 0;
          if (v2) {
            stream.lineStart();
            point2 = intersect(point1, point0);
            stream.point(point2[0], point2[1]);
          } else {
            point2 = intersect(point0, point1);
            stream.point(point2[0], point2[1], 2);
            stream.lineEnd();
          }
          point0 = point2;
        } else if (notHemisphere && point0 && smallRadius ^ v2) {
          var t2;
          if (!(c2 & c0) && (t2 = intersect(point1, point0, true))) {
            clean = 0;
            if (smallRadius) {
              stream.lineStart();
              stream.point(t2[0][0], t2[0][1]);
              stream.point(t2[1][0], t2[1][1]);
              stream.lineEnd();
            } else {
              stream.point(t2[1][0], t2[1][1]);
              stream.lineEnd();
              stream.lineStart();
              stream.point(t2[0][0], t2[0][1], 3);
            }
          }
        }
        if (v2 && (!point0 || !pointEqual(point0, point1))) {
          stream.point(point1[0], point1[1]);
        }
        point0 = point1, v0 = v2, c0 = c2;
      },
      lineEnd: function() {
        if (v0) stream.lineEnd();
        point0 = null;
      },
      // Rejoin first and last segments if there were intersections and the first
      // and last points were visible.
      clean: function() {
        return clean | (v00 && v0) << 1;
      }
    };
  }
  function intersect(a2, b2, two) {
    var pa = cartesian(a2), pb = cartesian(b2);
    var n1 = [1, 0, 0], n2 = cartesianCross(pa, pb), n2n2 = cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
    if (!determinant) return !two && a2;
    var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = cartesianCross(n1, n2), A5 = cartesianScale(n1, c1), B2 = cartesianScale(n2, c2);
    cartesianAddInPlace(A5, B2);
    var u2 = n1xn2, w2 = cartesianDot(A5, u2), uu = cartesianDot(u2, u2), t2 = w2 * w2 - uu * (cartesianDot(A5, A5) - 1);
    if (t2 < 0) return;
    var t3 = sqrt(t2), q2 = cartesianScale(u2, (-w2 - t3) / uu);
    cartesianAddInPlace(q2, A5);
    q2 = spherical(q2);
    if (!two) return q2;
    var lambda02 = a2[0], lambda12 = b2[0], phi02 = a2[1], phi12 = b2[1], z2;
    if (lambda12 < lambda02) z2 = lambda02, lambda02 = lambda12, lambda12 = z2;
    var delta2 = lambda12 - lambda02, polar = abs(delta2 - pi) < epsilon, meridian = polar || delta2 < epsilon;
    if (!polar && phi12 < phi02) z2 = phi02, phi02 = phi12, phi12 = z2;
    if (meridian ? polar ? phi02 + phi12 > 0 ^ q2[1] < (abs(q2[0] - lambda02) < epsilon ? phi02 : phi12) : phi02 <= q2[1] && q2[1] <= phi12 : delta2 > pi ^ (lambda02 <= q2[0] && q2[0] <= lambda12)) {
      var q1 = cartesianScale(u2, (-w2 + t3) / uu);
      cartesianAddInPlace(q1, A5);
      return [q2, spherical(q1)];
    }
  }
  function code(lambda, phi) {
    var r2 = smallRadius ? radius : pi - radius, code2 = 0;
    if (lambda < -r2) code2 |= 1;
    else if (lambda > r2) code2 |= 2;
    if (phi < -r2) code2 |= 4;
    else if (phi > r2) code2 |= 8;
    return code2;
  }
  return clip(visible, clipLine2, interpolate2, smallRadius ? [0, -radius] : [-pi, radius - pi]);
}
function clipLine(a2, b2, x02, y02, x12, y12) {
  var ax = a2[0], ay = a2[1], bx = b2[0], by = b2[1], t02 = 0, t12 = 1, dx = bx - ax, dy = by - ay, r2;
  r2 = x02 - ax;
  if (!dx && r2 > 0) return;
  r2 /= dx;
  if (dx < 0) {
    if (r2 < t02) return;
    if (r2 < t12) t12 = r2;
  } else if (dx > 0) {
    if (r2 > t12) return;
    if (r2 > t02) t02 = r2;
  }
  r2 = x12 - ax;
  if (!dx && r2 < 0) return;
  r2 /= dx;
  if (dx < 0) {
    if (r2 > t12) return;
    if (r2 > t02) t02 = r2;
  } else if (dx > 0) {
    if (r2 < t02) return;
    if (r2 < t12) t12 = r2;
  }
  r2 = y02 - ay;
  if (!dy && r2 > 0) return;
  r2 /= dy;
  if (dy < 0) {
    if (r2 < t02) return;
    if (r2 < t12) t12 = r2;
  } else if (dy > 0) {
    if (r2 > t12) return;
    if (r2 > t02) t02 = r2;
  }
  r2 = y12 - ay;
  if (!dy && r2 < 0) return;
  r2 /= dy;
  if (dy < 0) {
    if (r2 > t12) return;
    if (r2 > t02) t02 = r2;
  } else if (dy > 0) {
    if (r2 < t02) return;
    if (r2 < t12) t12 = r2;
  }
  if (t02 > 0) a2[0] = ax + t02 * dx, a2[1] = ay + t02 * dy;
  if (t12 < 1) b2[0] = ax + t12 * dx, b2[1] = ay + t12 * dy;
  return true;
}
var clipMax = 1e9, clipMin = -clipMax;
function clipRectangle(x02, y02, x12, y12) {
  function visible(x2, y2) {
    return x02 <= x2 && x2 <= x12 && y02 <= y2 && y2 <= y12;
  }
  function interpolate2(from, to2, direction, stream) {
    var a2 = 0, a1 = 0;
    if (from == null || (a2 = corner(from, direction)) !== (a1 = corner(to2, direction)) || comparePoint(from, to2) < 0 ^ direction > 0) {
      do
        stream.point(a2 === 0 || a2 === 3 ? x02 : x12, a2 > 1 ? y12 : y02);
      while ((a2 = (a2 + direction + 4) % 4) !== a1);
    } else {
      stream.point(to2[0], to2[1]);
    }
  }
  function corner(p2, direction) {
    return abs(p2[0] - x02) < epsilon ? direction > 0 ? 0 : 3 : abs(p2[0] - x12) < epsilon ? direction > 0 ? 2 : 1 : abs(p2[1] - y02) < epsilon ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
  }
  function compareIntersection2(a2, b2) {
    return comparePoint(a2.x, b2.x);
  }
  function comparePoint(a2, b2) {
    var ca = corner(a2, 1), cb = corner(b2, 1);
    return ca !== cb ? ca - cb : ca === 0 ? b2[1] - a2[1] : ca === 1 ? a2[0] - b2[0] : ca === 2 ? a2[1] - b2[1] : b2[0] - a2[0];
  }
  return function(stream) {
    var activeStream = stream, bufferStream = clipBuffer(), segments, polygon, ring, x__, y__, v__, x_, y_, v_, first, clean;
    var clipStream = {
      point: point2,
      lineStart,
      lineEnd,
      polygonStart,
      polygonEnd
    };
    function point2(x2, y2) {
      if (visible(x2, y2)) activeStream.point(x2, y2);
    }
    function polygonInside() {
      var winding = 0;
      for (var i2 = 0, n2 = polygon.length; i2 < n2; ++i2) {
        for (var ring2 = polygon[i2], j2 = 1, m2 = ring2.length, point3 = ring2[0], a0, a1, b0 = point3[0], b1 = point3[1]; j2 < m2; ++j2) {
          a0 = b0, a1 = b1, point3 = ring2[j2], b0 = point3[0], b1 = point3[1];
          if (a1 <= y12) {
            if (b1 > y12 && (b0 - a0) * (y12 - a1) > (b1 - a1) * (x02 - a0)) ++winding;
          } else {
            if (b1 <= y12 && (b0 - a0) * (y12 - a1) < (b1 - a1) * (x02 - a0)) --winding;
          }
        }
      }
      return winding;
    }
    function polygonStart() {
      activeStream = bufferStream, segments = [], polygon = [], clean = true;
    }
    function polygonEnd() {
      var startInside = polygonInside(), cleanInside = clean && startInside, visible2 = (segments = merge(segments)).length;
      if (cleanInside || visible2) {
        stream.polygonStart();
        if (cleanInside) {
          stream.lineStart();
          interpolate2(null, null, 1, stream);
          stream.lineEnd();
        }
        if (visible2) {
          clipRejoin(segments, compareIntersection2, startInside, interpolate2, stream);
        }
        stream.polygonEnd();
      }
      activeStream = stream, segments = polygon = ring = null;
    }
    function lineStart() {
      clipStream.point = linePoint2;
      if (polygon) polygon.push(ring = []);
      first = true;
      v_ = false;
      x_ = y_ = NaN;
    }
    function lineEnd() {
      if (segments) {
        linePoint2(x__, y__);
        if (v__ && v_) bufferStream.rejoin();
        segments.push(bufferStream.result());
      }
      clipStream.point = point2;
      if (v_) activeStream.lineEnd();
    }
    function linePoint2(x2, y2) {
      var v2 = visible(x2, y2);
      if (polygon) ring.push([x2, y2]);
      if (first) {
        x__ = x2, y__ = y2, v__ = v2;
        first = false;
        if (v2) {
          activeStream.lineStart();
          activeStream.point(x2, y2);
        }
      } else {
        if (v2 && v_) activeStream.point(x2, y2);
        else {
          var a2 = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))], b2 = [x2 = Math.max(clipMin, Math.min(clipMax, x2)), y2 = Math.max(clipMin, Math.min(clipMax, y2))];
          if (clipLine(a2, b2, x02, y02, x12, y12)) {
            if (!v_) {
              activeStream.lineStart();
              activeStream.point(a2[0], a2[1]);
            }
            activeStream.point(b2[0], b2[1]);
            if (!v2) activeStream.lineEnd();
            clean = false;
          } else if (v2) {
            activeStream.lineStart();
            activeStream.point(x2, y2);
            clean = false;
          }
        }
      }
      x_ = x2, y_ = y2, v_ = v2;
    }
    return clipStream;
  };
}
function extent() {
  var x02 = 0, y02 = 0, x12 = 960, y12 = 500, cache, cacheStream, clip2;
  return clip2 = {
    stream: function(stream) {
      return cache && cacheStream === stream ? cache : cache = clipRectangle(x02, y02, x12, y12)(cacheStream = stream);
    },
    extent: function(_2) {
      return arguments.length ? (x02 = +_2[0][0], y02 = +_2[0][1], x12 = +_2[1][0], y12 = +_2[1][1], cache = cacheStream = null, clip2) : [[x02, y02], [x12, y12]];
    }
  };
}
var lengthSum$1, lambda0, sinPhi0, cosPhi0;
var lengthStream$1 = {
  sphere: noop$1,
  point: noop$1,
  lineStart: lengthLineStart,
  lineEnd: noop$1,
  polygonStart: noop$1,
  polygonEnd: noop$1
};
function lengthLineStart() {
  lengthStream$1.point = lengthPointFirst$1;
  lengthStream$1.lineEnd = lengthLineEnd;
}
function lengthLineEnd() {
  lengthStream$1.point = lengthStream$1.lineEnd = noop$1;
}
function lengthPointFirst$1(lambda, phi) {
  lambda *= radians, phi *= radians;
  lambda0 = lambda, sinPhi0 = sin(phi), cosPhi0 = cos(phi);
  lengthStream$1.point = lengthPoint$1;
}
function lengthPoint$1(lambda, phi) {
  lambda *= radians, phi *= radians;
  var sinPhi = sin(phi), cosPhi = cos(phi), delta = abs(lambda - lambda0), cosDelta = cos(delta), sinDelta = sin(delta), x2 = cosPhi * sinDelta, y2 = cosPhi0 * sinPhi - sinPhi0 * cosPhi * cosDelta, z2 = sinPhi0 * sinPhi + cosPhi0 * cosPhi * cosDelta;
  lengthSum$1.add(atan2(sqrt(x2 * x2 + y2 * y2), z2));
  lambda0 = lambda, sinPhi0 = sinPhi, cosPhi0 = cosPhi;
}
function length(object2) {
  lengthSum$1 = new Adder();
  geoStream(object2, lengthStream$1);
  return +lengthSum$1;
}
var coordinates = [null, null], object = { type: "LineString", coordinates };
function distance(a2, b2) {
  coordinates[0] = a2;
  coordinates[1] = b2;
  return length(object);
}
var containsObjectType = {
  Feature: function(object2, point2) {
    return containsGeometry(object2.geometry, point2);
  },
  FeatureCollection: function(object2, point2) {
    var features = object2.features, i2 = -1, n2 = features.length;
    while (++i2 < n2) if (containsGeometry(features[i2].geometry, point2)) return true;
    return false;
  }
};
var containsGeometryType = {
  Sphere: function() {
    return true;
  },
  Point: function(object2, point2) {
    return containsPoint(object2.coordinates, point2);
  },
  MultiPoint: function(object2, point2) {
    var coordinates2 = object2.coordinates, i2 = -1, n2 = coordinates2.length;
    while (++i2 < n2) if (containsPoint(coordinates2[i2], point2)) return true;
    return false;
  },
  LineString: function(object2, point2) {
    return containsLine(object2.coordinates, point2);
  },
  MultiLineString: function(object2, point2) {
    var coordinates2 = object2.coordinates, i2 = -1, n2 = coordinates2.length;
    while (++i2 < n2) if (containsLine(coordinates2[i2], point2)) return true;
    return false;
  },
  Polygon: function(object2, point2) {
    return containsPolygon(object2.coordinates, point2);
  },
  MultiPolygon: function(object2, point2) {
    var coordinates2 = object2.coordinates, i2 = -1, n2 = coordinates2.length;
    while (++i2 < n2) if (containsPolygon(coordinates2[i2], point2)) return true;
    return false;
  },
  GeometryCollection: function(object2, point2) {
    var geometries = object2.geometries, i2 = -1, n2 = geometries.length;
    while (++i2 < n2) if (containsGeometry(geometries[i2], point2)) return true;
    return false;
  }
};
function containsGeometry(geometry, point2) {
  return geometry && containsGeometryType.hasOwnProperty(geometry.type) ? containsGeometryType[geometry.type](geometry, point2) : false;
}
function containsPoint(coordinates2, point2) {
  return distance(coordinates2, point2) === 0;
}
function containsLine(coordinates2, point2) {
  var ao, bo, ab;
  for (var i2 = 0, n2 = coordinates2.length; i2 < n2; i2++) {
    bo = distance(coordinates2[i2], point2);
    if (bo === 0) return true;
    if (i2 > 0) {
      ab = distance(coordinates2[i2], coordinates2[i2 - 1]);
      if (ab > 0 && ao <= ab && bo <= ab && (ao + bo - ab) * (1 - Math.pow((ao - bo) / ab, 2)) < epsilon2 * ab)
        return true;
    }
    ao = bo;
  }
  return false;
}
function containsPolygon(coordinates2, point2) {
  return !!polygonContains(coordinates2.map(ringRadians), pointRadians(point2));
}
function ringRadians(ring) {
  return ring = ring.map(pointRadians), ring.pop(), ring;
}
function pointRadians(point2) {
  return [point2[0] * radians, point2[1] * radians];
}
function contains(object2, point2) {
  return (object2 && containsObjectType.hasOwnProperty(object2.type) ? containsObjectType[object2.type] : containsGeometry)(object2, point2);
}
function graticuleX(y02, y12, dy) {
  var y2 = range$1(y02, y12 - epsilon, dy).concat(y12);
  return function(x2) {
    return y2.map(function(y3) {
      return [x2, y3];
    });
  };
}
function graticuleY(x02, x12, dx) {
  var x2 = range$1(x02, x12 - epsilon, dx).concat(x12);
  return function(y2) {
    return x2.map(function(x3) {
      return [x3, y2];
    });
  };
}
function graticule() {
  var x12, x02, X12, X02, y12, y02, Y12, Y02, dx = 10, dy = dx, DX = 90, DY = 360, x2, y2, X3, Y3, precision = 2.5;
  function graticule2() {
    return { type: "MultiLineString", coordinates: lines() };
  }
  function lines() {
    return range$1(ceil(X02 / DX) * DX, X12, DX).map(X3).concat(range$1(ceil(Y02 / DY) * DY, Y12, DY).map(Y3)).concat(range$1(ceil(x02 / dx) * dx, x12, dx).filter(function(x3) {
      return abs(x3 % DX) > epsilon;
    }).map(x2)).concat(range$1(ceil(y02 / dy) * dy, y12, dy).filter(function(y3) {
      return abs(y3 % DY) > epsilon;
    }).map(y2));
  }
  graticule2.lines = function() {
    return lines().map(function(coordinates2) {
      return { type: "LineString", coordinates: coordinates2 };
    });
  };
  graticule2.outline = function() {
    return {
      type: "Polygon",
      coordinates: [
        X3(X02).concat(
          Y3(Y12).slice(1),
          X3(X12).reverse().slice(1),
          Y3(Y02).reverse().slice(1)
        )
      ]
    };
  };
  graticule2.extent = function(_2) {
    if (!arguments.length) return graticule2.extentMinor();
    return graticule2.extentMajor(_2).extentMinor(_2);
  };
  graticule2.extentMajor = function(_2) {
    if (!arguments.length) return [[X02, Y02], [X12, Y12]];
    X02 = +_2[0][0], X12 = +_2[1][0];
    Y02 = +_2[0][1], Y12 = +_2[1][1];
    if (X02 > X12) _2 = X02, X02 = X12, X12 = _2;
    if (Y02 > Y12) _2 = Y02, Y02 = Y12, Y12 = _2;
    return graticule2.precision(precision);
  };
  graticule2.extentMinor = function(_2) {
    if (!arguments.length) return [[x02, y02], [x12, y12]];
    x02 = +_2[0][0], x12 = +_2[1][0];
    y02 = +_2[0][1], y12 = +_2[1][1];
    if (x02 > x12) _2 = x02, x02 = x12, x12 = _2;
    if (y02 > y12) _2 = y02, y02 = y12, y12 = _2;
    return graticule2.precision(precision);
  };
  graticule2.step = function(_2) {
    if (!arguments.length) return graticule2.stepMinor();
    return graticule2.stepMajor(_2).stepMinor(_2);
  };
  graticule2.stepMajor = function(_2) {
    if (!arguments.length) return [DX, DY];
    DX = +_2[0], DY = +_2[1];
    return graticule2;
  };
  graticule2.stepMinor = function(_2) {
    if (!arguments.length) return [dx, dy];
    dx = +_2[0], dy = +_2[1];
    return graticule2;
  };
  graticule2.precision = function(_2) {
    if (!arguments.length) return precision;
    precision = +_2;
    x2 = graticuleX(y02, y12, 90);
    y2 = graticuleY(x02, x12, precision);
    X3 = graticuleX(Y02, Y12, 90);
    Y3 = graticuleY(X02, X12, precision);
    return graticule2;
  };
  return graticule2.extentMajor([[-180, -90 + epsilon], [180, 90 - epsilon]]).extentMinor([[-180, -80 - epsilon], [180, 80 + epsilon]]);
}
function graticule10() {
  return graticule()();
}
function interpolate$1(a2, b2) {
  var x02 = a2[0] * radians, y02 = a2[1] * radians, x12 = b2[0] * radians, y12 = b2[1] * radians, cy0 = cos(y02), sy0 = sin(y02), cy1 = cos(y12), sy1 = sin(y12), kx0 = cy0 * cos(x02), ky0 = cy0 * sin(x02), kx1 = cy1 * cos(x12), ky1 = cy1 * sin(x12), d2 = 2 * asin(sqrt(haversin(y12 - y02) + cy0 * cy1 * haversin(x12 - x02))), k2 = sin(d2);
  var interpolate2 = d2 ? function(t2) {
    var B2 = sin(t2 *= d2) / k2, A5 = sin(d2 - t2) / k2, x2 = A5 * kx0 + B2 * kx1, y2 = A5 * ky0 + B2 * ky1, z2 = A5 * sy0 + B2 * sy1;
    return [
      atan2(y2, x2) * degrees,
      atan2(z2, sqrt(x2 * x2 + y2 * y2)) * degrees
    ];
  } : function() {
    return [x02 * degrees, y02 * degrees];
  };
  interpolate2.distance = d2;
  return interpolate2;
}
const identity$2 = (x2) => x2;
var areaSum = new Adder(), areaRingSum = new Adder(), x00$2, y00$2, x0$3, y0$3;
var areaStream = {
  point: noop$1,
  lineStart: noop$1,
  lineEnd: noop$1,
  polygonStart: function() {
    areaStream.lineStart = areaRingStart;
    areaStream.lineEnd = areaRingEnd;
  },
  polygonEnd: function() {
    areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop$1;
    areaSum.add(abs(areaRingSum));
    areaRingSum = new Adder();
  },
  result: function() {
    var area2 = areaSum / 2;
    areaSum = new Adder();
    return area2;
  }
};
function areaRingStart() {
  areaStream.point = areaPointFirst;
}
function areaPointFirst(x2, y2) {
  areaStream.point = areaPoint;
  x00$2 = x0$3 = x2, y00$2 = y0$3 = y2;
}
function areaPoint(x2, y2) {
  areaRingSum.add(y0$3 * x2 - x0$3 * y2);
  x0$3 = x2, y0$3 = y2;
}
function areaRingEnd() {
  areaPoint(x00$2, y00$2);
}
var x0$2 = Infinity, y0$2 = x0$2, x1 = -x0$2, y1 = x1;
var boundsStream = {
  point: boundsPoint,
  lineStart: noop$1,
  lineEnd: noop$1,
  polygonStart: noop$1,
  polygonEnd: noop$1,
  result: function() {
    var bounds2 = [[x0$2, y0$2], [x1, y1]];
    x1 = y1 = -(y0$2 = x0$2 = Infinity);
    return bounds2;
  }
};
function boundsPoint(x2, y2) {
  if (x2 < x0$2) x0$2 = x2;
  if (x2 > x1) x1 = x2;
  if (y2 < y0$2) y0$2 = y2;
  if (y2 > y1) y1 = y2;
}
var X0 = 0, Y0 = 0, Z0 = 0, X1 = 0, Y1 = 0, Z1 = 0, X2 = 0, Y2 = 0, Z2 = 0, x00$1, y00$1, x0$1, y0$1;
var centroidStream = {
  point: centroidPoint,
  lineStart: centroidLineStart,
  lineEnd: centroidLineEnd,
  polygonStart: function() {
    centroidStream.lineStart = centroidRingStart;
    centroidStream.lineEnd = centroidRingEnd;
  },
  polygonEnd: function() {
    centroidStream.point = centroidPoint;
    centroidStream.lineStart = centroidLineStart;
    centroidStream.lineEnd = centroidLineEnd;
  },
  result: function() {
    var centroid2 = Z2 ? [X2 / Z2, Y2 / Z2] : Z1 ? [X1 / Z1, Y1 / Z1] : Z0 ? [X0 / Z0, Y0 / Z0] : [NaN, NaN];
    X0 = Y0 = Z0 = X1 = Y1 = Z1 = X2 = Y2 = Z2 = 0;
    return centroid2;
  }
};
function centroidPoint(x2, y2) {
  X0 += x2;
  Y0 += y2;
  ++Z0;
}
function centroidLineStart() {
  centroidStream.point = centroidPointFirstLine;
}
function centroidPointFirstLine(x2, y2) {
  centroidStream.point = centroidPointLine;
  centroidPoint(x0$1 = x2, y0$1 = y2);
}
function centroidPointLine(x2, y2) {
  var dx = x2 - x0$1, dy = y2 - y0$1, z2 = sqrt(dx * dx + dy * dy);
  X1 += z2 * (x0$1 + x2) / 2;
  Y1 += z2 * (y0$1 + y2) / 2;
  Z1 += z2;
  centroidPoint(x0$1 = x2, y0$1 = y2);
}
function centroidLineEnd() {
  centroidStream.point = centroidPoint;
}
function centroidRingStart() {
  centroidStream.point = centroidPointFirstRing;
}
function centroidRingEnd() {
  centroidPointRing(x00$1, y00$1);
}
function centroidPointFirstRing(x2, y2) {
  centroidStream.point = centroidPointRing;
  centroidPoint(x00$1 = x0$1 = x2, y00$1 = y0$1 = y2);
}
function centroidPointRing(x2, y2) {
  var dx = x2 - x0$1, dy = y2 - y0$1, z2 = sqrt(dx * dx + dy * dy);
  X1 += z2 * (x0$1 + x2) / 2;
  Y1 += z2 * (y0$1 + y2) / 2;
  Z1 += z2;
  z2 = y0$1 * x2 - x0$1 * y2;
  X2 += z2 * (x0$1 + x2);
  Y2 += z2 * (y0$1 + y2);
  Z2 += z2 * 3;
  centroidPoint(x0$1 = x2, y0$1 = y2);
}
function PathContext(context) {
  this._context = context;
}
PathContext.prototype = {
  _radius: 4.5,
  pointRadius: function(_2) {
    return this._radius = _2, this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0) this._context.closePath();
    this._point = NaN;
  },
  point: function(x2, y2) {
    switch (this._point) {
      case 0: {
        this._context.moveTo(x2, y2);
        this._point = 1;
        break;
      }
      case 1: {
        this._context.lineTo(x2, y2);
        break;
      }
      default: {
        this._context.moveTo(x2 + this._radius, y2);
        this._context.arc(x2, y2, this._radius, 0, tau);
        break;
      }
    }
  },
  result: noop$1
};
var lengthSum = new Adder(), lengthRing, x00, y00, x0, y0;
var lengthStream = {
  point: noop$1,
  lineStart: function() {
    lengthStream.point = lengthPointFirst;
  },
  lineEnd: function() {
    if (lengthRing) lengthPoint(x00, y00);
    lengthStream.point = noop$1;
  },
  polygonStart: function() {
    lengthRing = true;
  },
  polygonEnd: function() {
    lengthRing = null;
  },
  result: function() {
    var length2 = +lengthSum;
    lengthSum = new Adder();
    return length2;
  }
};
function lengthPointFirst(x2, y2) {
  lengthStream.point = lengthPoint;
  x00 = x0 = x2, y00 = y0 = y2;
}
function lengthPoint(x2, y2) {
  x0 -= x2, y0 -= y2;
  lengthSum.add(sqrt(x0 * x0 + y0 * y0));
  x0 = x2, y0 = y2;
}
function PathString() {
  this._string = [];
}
PathString.prototype = {
  _radius: 4.5,
  _circle: circle(4.5),
  pointRadius: function(_2) {
    if ((_2 = +_2) !== this._radius) this._radius = _2, this._circle = null;
    return this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0) this._string.push("Z");
    this._point = NaN;
  },
  point: function(x2, y2) {
    switch (this._point) {
      case 0: {
        this._string.push("M", x2, ",", y2);
        this._point = 1;
        break;
      }
      case 1: {
        this._string.push("L", x2, ",", y2);
        break;
      }
      default: {
        if (this._circle == null) this._circle = circle(this._radius);
        this._string.push("M", x2, ",", y2, this._circle);
        break;
      }
    }
  },
  result: function() {
    if (this._string.length) {
      var result = this._string.join("");
      this._string = [];
      return result;
    } else {
      return null;
    }
  }
};
function circle(radius) {
  return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
}
function index(projection2, context) {
  var pointRadius = 4.5, projectionStream, contextStream;
  function path(object2) {
    if (object2) {
      if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
      geoStream(object2, projectionStream(contextStream));
    }
    return contextStream.result();
  }
  path.area = function(object2) {
    geoStream(object2, projectionStream(areaStream));
    return areaStream.result();
  };
  path.measure = function(object2) {
    geoStream(object2, projectionStream(lengthStream));
    return lengthStream.result();
  };
  path.bounds = function(object2) {
    geoStream(object2, projectionStream(boundsStream));
    return boundsStream.result();
  };
  path.centroid = function(object2) {
    geoStream(object2, projectionStream(centroidStream));
    return centroidStream.result();
  };
  path.projection = function(_2) {
    return arguments.length ? (projectionStream = _2 == null ? (projection2 = null, identity$2) : (projection2 = _2).stream, path) : projection2;
  };
  path.context = function(_2) {
    if (!arguments.length) return context;
    contextStream = _2 == null ? (context = null, new PathString()) : new PathContext(context = _2);
    if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
    return path;
  };
  path.pointRadius = function(_2) {
    if (!arguments.length) return pointRadius;
    pointRadius = typeof _2 === "function" ? _2 : (contextStream.pointRadius(+_2), +_2);
    return path;
  };
  return path.projection(projection2).context(context);
}
function transform(methods) {
  return {
    stream: transformer(methods)
  };
}
function transformer(methods) {
  return function(stream) {
    var s2 = new TransformStream();
    for (var key in methods) s2[key] = methods[key];
    s2.stream = stream;
    return s2;
  };
}
function TransformStream() {
}
TransformStream.prototype = {
  constructor: TransformStream,
  point: function(x2, y2) {
    this.stream.point(x2, y2);
  },
  sphere: function() {
    this.stream.sphere();
  },
  lineStart: function() {
    this.stream.lineStart();
  },
  lineEnd: function() {
    this.stream.lineEnd();
  },
  polygonStart: function() {
    this.stream.polygonStart();
  },
  polygonEnd: function() {
    this.stream.polygonEnd();
  }
};
function fit(projection2, fitBounds, object2) {
  var clip2 = projection2.clipExtent && projection2.clipExtent();
  projection2.scale(150).translate([0, 0]);
  if (clip2 != null) projection2.clipExtent(null);
  geoStream(object2, projection2.stream(boundsStream));
  fitBounds(boundsStream.result());
  if (clip2 != null) projection2.clipExtent(clip2);
  return projection2;
}
function fitExtent(projection2, extent2, object2) {
  return fit(projection2, function(b2) {
    var w2 = extent2[1][0] - extent2[0][0], h2 = extent2[1][1] - extent2[0][1], k2 = Math.min(w2 / (b2[1][0] - b2[0][0]), h2 / (b2[1][1] - b2[0][1])), x2 = +extent2[0][0] + (w2 - k2 * (b2[1][0] + b2[0][0])) / 2, y2 = +extent2[0][1] + (h2 - k2 * (b2[1][1] + b2[0][1])) / 2;
    projection2.scale(150 * k2).translate([x2, y2]);
  }, object2);
}
function fitSize(projection2, size, object2) {
  return fitExtent(projection2, [[0, 0], size], object2);
}
function fitWidth(projection2, width, object2) {
  return fit(projection2, function(b2) {
    var w2 = +width, k2 = w2 / (b2[1][0] - b2[0][0]), x2 = (w2 - k2 * (b2[1][0] + b2[0][0])) / 2, y2 = -k2 * b2[0][1];
    projection2.scale(150 * k2).translate([x2, y2]);
  }, object2);
}
function fitHeight(projection2, height, object2) {
  return fit(projection2, function(b2) {
    var h2 = +height, k2 = h2 / (b2[1][1] - b2[0][1]), x2 = -k2 * b2[0][0], y2 = (h2 - k2 * (b2[1][1] + b2[0][1])) / 2;
    projection2.scale(150 * k2).translate([x2, y2]);
  }, object2);
}
var maxDepth = 16, cosMinDistance = cos(30 * radians);
function resample(project, delta2) {
  return +delta2 ? resample$1(project, delta2) : resampleNone(project);
}
function resampleNone(project) {
  return transformer({
    point: function(x2, y2) {
      x2 = project(x2, y2);
      this.stream.point(x2[0], x2[1]);
    }
  });
}
function resample$1(project, delta2) {
  function resampleLineTo(x02, y02, lambda02, a0, b0, c0, x12, y12, lambda12, a1, b1, c1, depth, stream) {
    var dx = x12 - x02, dy = y12 - y02, d2 = dx * dx + dy * dy;
    if (d2 > 4 * delta2 && depth--) {
      var a2 = a0 + a1, b2 = b0 + b1, c2 = c0 + c1, m2 = sqrt(a2 * a2 + b2 * b2 + c2 * c2), phi2 = asin(c2 /= m2), lambda22 = abs(abs(c2) - 1) < epsilon || abs(lambda02 - lambda12) < epsilon ? (lambda02 + lambda12) / 2 : atan2(b2, a2), p2 = project(lambda22, phi2), x2 = p2[0], y2 = p2[1], dx2 = x2 - x02, dy2 = y2 - y02, dz = dy * dx2 - dx * dy2;
      if (dz * dz / d2 > delta2 || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
        resampleLineTo(x02, y02, lambda02, a0, b0, c0, x2, y2, lambda22, a2 /= m2, b2 /= m2, c2, depth, stream);
        stream.point(x2, y2);
        resampleLineTo(x2, y2, lambda22, a2, b2, c2, x12, y12, lambda12, a1, b1, c1, depth, stream);
      }
    }
  }
  return function(stream) {
    var lambda002, x002, y002, a00, b00, c00, lambda02, x02, y02, a0, b0, c0;
    var resampleStream = {
      point: point2,
      lineStart,
      lineEnd,
      polygonStart: function() {
        stream.polygonStart();
        resampleStream.lineStart = ringStart;
      },
      polygonEnd: function() {
        stream.polygonEnd();
        resampleStream.lineStart = lineStart;
      }
    };
    function point2(x2, y2) {
      x2 = project(x2, y2);
      stream.point(x2[0], x2[1]);
    }
    function lineStart() {
      x02 = NaN;
      resampleStream.point = linePoint2;
      stream.lineStart();
    }
    function linePoint2(lambda, phi) {
      var c2 = cartesian([lambda, phi]), p2 = project(lambda, phi);
      resampleLineTo(x02, y02, lambda02, a0, b0, c0, x02 = p2[0], y02 = p2[1], lambda02 = lambda, a0 = c2[0], b0 = c2[1], c0 = c2[2], maxDepth, stream);
      stream.point(x02, y02);
    }
    function lineEnd() {
      resampleStream.point = point2;
      stream.lineEnd();
    }
    function ringStart() {
      lineStart();
      resampleStream.point = ringPoint;
      resampleStream.lineEnd = ringEnd;
    }
    function ringPoint(lambda, phi) {
      linePoint2(lambda002 = lambda, phi), x002 = x02, y002 = y02, a00 = a0, b00 = b0, c00 = c0;
      resampleStream.point = linePoint2;
    }
    function ringEnd() {
      resampleLineTo(x02, y02, lambda02, a0, b0, c0, x002, y002, lambda002, a00, b00, c00, maxDepth, stream);
      resampleStream.lineEnd = lineEnd;
      lineEnd();
    }
    return resampleStream;
  };
}
var transformRadians = transformer({
  point: function(x2, y2) {
    this.stream.point(x2 * radians, y2 * radians);
  }
});
function transformRotate(rotate) {
  return transformer({
    point: function(x2, y2) {
      var r2 = rotate(x2, y2);
      return this.stream.point(r2[0], r2[1]);
    }
  });
}
function scaleTranslate(k2, dx, dy, sx, sy) {
  function transform2(x2, y2) {
    x2 *= sx;
    y2 *= sy;
    return [dx + k2 * x2, dy - k2 * y2];
  }
  transform2.invert = function(x2, y2) {
    return [(x2 - dx) / k2 * sx, (dy - y2) / k2 * sy];
  };
  return transform2;
}
function scaleTranslateRotate(k2, dx, dy, sx, sy, alpha) {
  if (!alpha) return scaleTranslate(k2, dx, dy, sx, sy);
  var cosAlpha = cos(alpha), sinAlpha = sin(alpha), a2 = cosAlpha * k2, b2 = sinAlpha * k2, ai = cosAlpha / k2, bi = sinAlpha / k2, ci = (sinAlpha * dy - cosAlpha * dx) / k2, fi = (sinAlpha * dx + cosAlpha * dy) / k2;
  function transform2(x2, y2) {
    x2 *= sx;
    y2 *= sy;
    return [a2 * x2 - b2 * y2 + dx, dy - b2 * x2 - a2 * y2];
  }
  transform2.invert = function(x2, y2) {
    return [sx * (ai * x2 - bi * y2 + ci), sy * (fi - bi * x2 - ai * y2)];
  };
  return transform2;
}
function projection(project) {
  return projectionMutator(function() {
    return project;
  })();
}
function projectionMutator(projectAt) {
  var project, k2 = 150, x2 = 480, y2 = 250, lambda = 0, phi = 0, deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, alpha = 0, sx = 1, sy = 1, theta = null, preclip = clipAntimeridian, x02 = null, y02, x12, y12, postclip = identity$2, delta2 = 0.5, projectResample, projectTransform, projectRotateTransform, cache, cacheStream;
  function projection2(point2) {
    return projectRotateTransform(point2[0] * radians, point2[1] * radians);
  }
  function invert(point2) {
    point2 = projectRotateTransform.invert(point2[0], point2[1]);
    return point2 && [point2[0] * degrees, point2[1] * degrees];
  }
  projection2.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
  };
  projection2.preclip = function(_2) {
    return arguments.length ? (preclip = _2, theta = void 0, reset()) : preclip;
  };
  projection2.postclip = function(_2) {
    return arguments.length ? (postclip = _2, x02 = y02 = x12 = y12 = null, reset()) : postclip;
  };
  projection2.clipAngle = function(_2) {
    return arguments.length ? (preclip = +_2 ? clipCircle(theta = _2 * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
  };
  projection2.clipExtent = function(_2) {
    return arguments.length ? (postclip = _2 == null ? (x02 = y02 = x12 = y12 = null, identity$2) : clipRectangle(x02 = +_2[0][0], y02 = +_2[0][1], x12 = +_2[1][0], y12 = +_2[1][1]), reset()) : x02 == null ? null : [[x02, y02], [x12, y12]];
  };
  projection2.scale = function(_2) {
    return arguments.length ? (k2 = +_2, recenter()) : k2;
  };
  projection2.translate = function(_2) {
    return arguments.length ? (x2 = +_2[0], y2 = +_2[1], recenter()) : [x2, y2];
  };
  projection2.center = function(_2) {
    return arguments.length ? (lambda = _2[0] % 360 * radians, phi = _2[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
  };
  projection2.rotate = function(_2) {
    return arguments.length ? (deltaLambda = _2[0] % 360 * radians, deltaPhi = _2[1] % 360 * radians, deltaGamma = _2.length > 2 ? _2[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
  };
  projection2.angle = function(_2) {
    return arguments.length ? (alpha = _2 % 360 * radians, recenter()) : alpha * degrees;
  };
  projection2.reflectX = function(_2) {
    return arguments.length ? (sx = _2 ? -1 : 1, recenter()) : sx < 0;
  };
  projection2.reflectY = function(_2) {
    return arguments.length ? (sy = _2 ? -1 : 1, recenter()) : sy < 0;
  };
  projection2.precision = function(_2) {
    return arguments.length ? (projectResample = resample(projectTransform, delta2 = _2 * _2), reset()) : sqrt(delta2);
  };
  projection2.fitExtent = function(extent2, object2) {
    return fitExtent(projection2, extent2, object2);
  };
  projection2.fitSize = function(size, object2) {
    return fitSize(projection2, size, object2);
  };
  projection2.fitWidth = function(width, object2) {
    return fitWidth(projection2, width, object2);
  };
  projection2.fitHeight = function(height, object2) {
    return fitHeight(projection2, height, object2);
  };
  function recenter() {
    var center2 = scaleTranslateRotate(k2, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)), transform2 = scaleTranslateRotate(k2, x2 - center2[0], y2 - center2[1], sx, sy, alpha);
    rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
    projectTransform = compose(project, transform2);
    projectRotateTransform = compose(rotate, projectTransform);
    projectResample = resample(projectTransform, delta2);
    return reset();
  }
  function reset() {
    cache = cacheStream = null;
    return projection2;
  }
  return function() {
    project = projectAt.apply(this, arguments);
    projection2.invert = project.invert && invert;
    return recenter();
  };
}
function conicProjection(projectAt) {
  var phi02 = 0, phi12 = pi / 3, m2 = projectionMutator(projectAt), p2 = m2(phi02, phi12);
  p2.parallels = function(_2) {
    return arguments.length ? m2(phi02 = _2[0] * radians, phi12 = _2[1] * radians) : [phi02 * degrees, phi12 * degrees];
  };
  return p2;
}
function cylindricalEqualAreaRaw(phi02) {
  var cosPhi02 = cos(phi02);
  function forward(lambda, phi) {
    return [lambda * cosPhi02, sin(phi) / cosPhi02];
  }
  forward.invert = function(x2, y2) {
    return [x2 / cosPhi02, asin(y2 * cosPhi02)];
  };
  return forward;
}
function conicEqualAreaRaw(y02, y12) {
  var sy0 = sin(y02), n2 = (sy0 + sin(y12)) / 2;
  if (abs(n2) < epsilon) return cylindricalEqualAreaRaw(y02);
  var c2 = 1 + sy0 * (2 * n2 - sy0), r0 = sqrt(c2) / n2;
  function project(x2, y2) {
    var r2 = sqrt(c2 - 2 * n2 * sin(y2)) / n2;
    return [r2 * sin(x2 *= n2), r0 - r2 * cos(x2)];
  }
  project.invert = function(x2, y2) {
    var r0y = r0 - y2, l2 = atan2(x2, abs(r0y)) * sign(r0y);
    if (r0y * n2 < 0)
      l2 -= pi * sign(x2) * sign(r0y);
    return [l2 / n2, asin((c2 - (x2 * x2 + r0y * r0y) * n2 * n2) / (2 * n2))];
  };
  return project;
}
function conicEqualArea() {
  return conicProjection(conicEqualAreaRaw).scale(155.424).center([0, 33.6442]);
}
function albers() {
  return conicEqualArea().parallels([29.5, 45.5]).scale(1070).translate([480, 250]).rotate([96, 0]).center([-0.6, 38.7]);
}
function multiplex(streams) {
  var n2 = streams.length;
  return {
    point: function(x2, y2) {
      var i2 = -1;
      while (++i2 < n2) streams[i2].point(x2, y2);
    },
    sphere: function() {
      var i2 = -1;
      while (++i2 < n2) streams[i2].sphere();
    },
    lineStart: function() {
      var i2 = -1;
      while (++i2 < n2) streams[i2].lineStart();
    },
    lineEnd: function() {
      var i2 = -1;
      while (++i2 < n2) streams[i2].lineEnd();
    },
    polygonStart: function() {
      var i2 = -1;
      while (++i2 < n2) streams[i2].polygonStart();
    },
    polygonEnd: function() {
      var i2 = -1;
      while (++i2 < n2) streams[i2].polygonEnd();
    }
  };
}
function albersUsa() {
  var cache, cacheStream, lower48 = albers(), lower48Point, alaska = conicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, hawaii = conicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, point2, pointStream = { point: function(x2, y2) {
    point2 = [x2, y2];
  } };
  function albersUsa2(coordinates2) {
    var x2 = coordinates2[0], y2 = coordinates2[1];
    return point2 = null, (lower48Point.point(x2, y2), point2) || (alaskaPoint.point(x2, y2), point2) || (hawaiiPoint.point(x2, y2), point2);
  }
  albersUsa2.invert = function(coordinates2) {
    var k2 = lower48.scale(), t2 = lower48.translate(), x2 = (coordinates2[0] - t2[0]) / k2, y2 = (coordinates2[1] - t2[1]) / k2;
    return (y2 >= 0.12 && y2 < 0.234 && x2 >= -0.425 && x2 < -0.214 ? alaska : y2 >= 0.166 && y2 < 0.234 && x2 >= -0.214 && x2 < -0.115 ? hawaii : lower48).invert(coordinates2);
  };
  albersUsa2.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
  };
  albersUsa2.precision = function(_2) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_2), alaska.precision(_2), hawaii.precision(_2);
    return reset();
  };
  albersUsa2.scale = function(_2) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_2), alaska.scale(_2 * 0.35), hawaii.scale(_2);
    return albersUsa2.translate(lower48.translate());
  };
  albersUsa2.translate = function(_2) {
    if (!arguments.length) return lower48.translate();
    var k2 = lower48.scale(), x2 = +_2[0], y2 = +_2[1];
    lower48Point = lower48.translate(_2).clipExtent([[x2 - 0.455 * k2, y2 - 0.238 * k2], [x2 + 0.455 * k2, y2 + 0.238 * k2]]).stream(pointStream);
    alaskaPoint = alaska.translate([x2 - 0.307 * k2, y2 + 0.201 * k2]).clipExtent([[x2 - 0.425 * k2 + epsilon, y2 + 0.12 * k2 + epsilon], [x2 - 0.214 * k2 - epsilon, y2 + 0.234 * k2 - epsilon]]).stream(pointStream);
    hawaiiPoint = hawaii.translate([x2 - 0.205 * k2, y2 + 0.212 * k2]).clipExtent([[x2 - 0.214 * k2 + epsilon, y2 + 0.166 * k2 + epsilon], [x2 - 0.115 * k2 - epsilon, y2 + 0.234 * k2 - epsilon]]).stream(pointStream);
    return reset();
  };
  albersUsa2.fitExtent = function(extent2, object2) {
    return fitExtent(albersUsa2, extent2, object2);
  };
  albersUsa2.fitSize = function(size, object2) {
    return fitSize(albersUsa2, size, object2);
  };
  albersUsa2.fitWidth = function(width, object2) {
    return fitWidth(albersUsa2, width, object2);
  };
  albersUsa2.fitHeight = function(height, object2) {
    return fitHeight(albersUsa2, height, object2);
  };
  function reset() {
    cache = cacheStream = null;
    return albersUsa2;
  }
  return albersUsa2.scale(1070);
}
function azimuthalRaw(scale) {
  return function(x2, y2) {
    var cx = cos(x2), cy = cos(y2), k2 = scale(cx * cy);
    if (k2 === Infinity) return [2, 0];
    return [
      k2 * cy * sin(x2),
      k2 * sin(y2)
    ];
  };
}
function azimuthalInvert(angle2) {
  return function(x2, y2) {
    var z2 = sqrt(x2 * x2 + y2 * y2), c2 = angle2(z2), sc = sin(c2), cc = cos(c2);
    return [
      atan2(x2 * sc, z2 * cc),
      asin(z2 && y2 * sc / z2)
    ];
  };
}
var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
  return sqrt(2 / (1 + cxcy));
});
azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z2) {
  return 2 * asin(z2 / 2);
});
function azimuthalEqualArea() {
  return projection(azimuthalEqualAreaRaw).scale(124.75).clipAngle(180 - 1e-3);
}
var azimuthalEquidistantRaw = azimuthalRaw(function(c2) {
  return (c2 = acos(c2)) && c2 / sin(c2);
});
azimuthalEquidistantRaw.invert = azimuthalInvert(function(z2) {
  return z2;
});
function azimuthalEquidistant() {
  return projection(azimuthalEquidistantRaw).scale(79.4188).clipAngle(180 - 1e-3);
}
function mercatorRaw(lambda, phi) {
  return [lambda, log(tan((halfPi + phi) / 2))];
}
mercatorRaw.invert = function(x2, y2) {
  return [x2, 2 * atan(exp(y2)) - halfPi];
};
function mercator() {
  return mercatorProjection(mercatorRaw).scale(961 / tau);
}
function mercatorProjection(project) {
  var m2 = projection(project), center2 = m2.center, scale = m2.scale, translate = m2.translate, clipExtent = m2.clipExtent, x02 = null, y02, x12, y12;
  m2.scale = function(_2) {
    return arguments.length ? (scale(_2), reclip()) : scale();
  };
  m2.translate = function(_2) {
    return arguments.length ? (translate(_2), reclip()) : translate();
  };
  m2.center = function(_2) {
    return arguments.length ? (center2(_2), reclip()) : center2();
  };
  m2.clipExtent = function(_2) {
    return arguments.length ? (_2 == null ? x02 = y02 = x12 = y12 = null : (x02 = +_2[0][0], y02 = +_2[0][1], x12 = +_2[1][0], y12 = +_2[1][1]), reclip()) : x02 == null ? null : [[x02, y02], [x12, y12]];
  };
  function reclip() {
    var k2 = pi * scale(), t2 = m2(rotation(m2.rotate()).invert([0, 0]));
    return clipExtent(x02 == null ? [[t2[0] - k2, t2[1] - k2], [t2[0] + k2, t2[1] + k2]] : project === mercatorRaw ? [[Math.max(t2[0] - k2, x02), y02], [Math.min(t2[0] + k2, x12), y12]] : [[x02, Math.max(t2[1] - k2, y02)], [x12, Math.min(t2[1] + k2, y12)]]);
  }
  return reclip();
}
function tany(y2) {
  return tan((halfPi + y2) / 2);
}
function conicConformalRaw(y02, y12) {
  var cy0 = cos(y02), n2 = y02 === y12 ? sin(y02) : log(cy0 / cos(y12)) / log(tany(y12) / tany(y02)), f = cy0 * pow(tany(y02), n2) / n2;
  if (!n2) return mercatorRaw;
  function project(x2, y2) {
    if (f > 0) {
      if (y2 < -halfPi + epsilon) y2 = -halfPi + epsilon;
    } else {
      if (y2 > halfPi - epsilon) y2 = halfPi - epsilon;
    }
    var r2 = f / pow(tany(y2), n2);
    return [r2 * sin(n2 * x2), f - r2 * cos(n2 * x2)];
  }
  project.invert = function(x2, y2) {
    var fy = f - y2, r2 = sign(n2) * sqrt(x2 * x2 + fy * fy), l2 = atan2(x2, abs(fy)) * sign(fy);
    if (fy * n2 < 0)
      l2 -= pi * sign(x2) * sign(fy);
    return [l2 / n2, 2 * atan(pow(f / r2, 1 / n2)) - halfPi];
  };
  return project;
}
function conicConformal() {
  return conicProjection(conicConformalRaw).scale(109.5).parallels([30, 30]);
}
function equirectangularRaw(lambda, phi) {
  return [lambda, phi];
}
equirectangularRaw.invert = equirectangularRaw;
function equirectangular() {
  return projection(equirectangularRaw).scale(152.63);
}
function conicEquidistantRaw(y02, y12) {
  var cy0 = cos(y02), n2 = y02 === y12 ? sin(y02) : (cy0 - cos(y12)) / (y12 - y02), g2 = cy0 / n2 + y02;
  if (abs(n2) < epsilon) return equirectangularRaw;
  function project(x2, y2) {
    var gy = g2 - y2, nx = n2 * x2;
    return [gy * sin(nx), g2 - gy * cos(nx)];
  }
  project.invert = function(x2, y2) {
    var gy = g2 - y2, l2 = atan2(x2, abs(gy)) * sign(gy);
    if (gy * n2 < 0)
      l2 -= pi * sign(x2) * sign(gy);
    return [l2 / n2, g2 - sign(n2) * sqrt(x2 * x2 + gy * gy)];
  };
  return project;
}
function conicEquidistant() {
  return conicProjection(conicEquidistantRaw).scale(131.154).center([0, 13.9389]);
}
var A1 = 1.340264, A2 = -0.081106, A3 = 893e-6, A4 = 3796e-6, M$3 = sqrt(3) / 2, iterations = 12;
function equalEarthRaw(lambda, phi) {
  var l2 = asin(M$3 * sin(phi)), l22 = l2 * l2, l6 = l22 * l22 * l22;
  return [
    lambda * cos(l2) / (M$3 * (A1 + 3 * A2 * l22 + l6 * (7 * A3 + 9 * A4 * l22))),
    l2 * (A1 + A2 * l22 + l6 * (A3 + A4 * l22))
  ];
}
equalEarthRaw.invert = function(x2, y2) {
  var l2 = y2, l22 = l2 * l2, l6 = l22 * l22 * l22;
  for (var i2 = 0, delta, fy, fpy; i2 < iterations; ++i2) {
    fy = l2 * (A1 + A2 * l22 + l6 * (A3 + A4 * l22)) - y2;
    fpy = A1 + 3 * A2 * l22 + l6 * (7 * A3 + 9 * A4 * l22);
    l2 -= delta = fy / fpy, l22 = l2 * l2, l6 = l22 * l22 * l22;
    if (abs(delta) < epsilon2) break;
  }
  return [
    M$3 * x2 * (A1 + 3 * A2 * l22 + l6 * (7 * A3 + 9 * A4 * l22)) / cos(l2),
    asin(sin(l2) / M$3)
  ];
};
function equalEarth() {
  return projection(equalEarthRaw).scale(177.158);
}
function gnomonicRaw(x2, y2) {
  var cy = cos(y2), k2 = cos(x2) * cy;
  return [cy * sin(x2) / k2, sin(y2) / k2];
}
gnomonicRaw.invert = azimuthalInvert(atan);
function gnomonic() {
  return projection(gnomonicRaw).scale(144.049).clipAngle(60);
}
function identity$1() {
  var k2 = 1, tx = 0, ty = 0, sx = 1, sy = 1, alpha = 0, ca, sa, x02 = null, y02, x12, y12, kx = 1, ky = 1, transform2 = transformer({
    point: function(x2, y2) {
      var p2 = projection2([x2, y2]);
      this.stream.point(p2[0], p2[1]);
    }
  }), postclip = identity$2, cache, cacheStream;
  function reset() {
    kx = k2 * sx;
    ky = k2 * sy;
    cache = cacheStream = null;
    return projection2;
  }
  function projection2(p2) {
    var x2 = p2[0] * kx, y2 = p2[1] * ky;
    if (alpha) {
      var t2 = y2 * ca - x2 * sa;
      x2 = x2 * ca + y2 * sa;
      y2 = t2;
    }
    return [x2 + tx, y2 + ty];
  }
  projection2.invert = function(p2) {
    var x2 = p2[0] - tx, y2 = p2[1] - ty;
    if (alpha) {
      var t2 = y2 * ca + x2 * sa;
      x2 = x2 * ca - y2 * sa;
      y2 = t2;
    }
    return [x2 / kx, y2 / ky];
  };
  projection2.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transform2(postclip(cacheStream = stream));
  };
  projection2.postclip = function(_2) {
    return arguments.length ? (postclip = _2, x02 = y02 = x12 = y12 = null, reset()) : postclip;
  };
  projection2.clipExtent = function(_2) {
    return arguments.length ? (postclip = _2 == null ? (x02 = y02 = x12 = y12 = null, identity$2) : clipRectangle(x02 = +_2[0][0], y02 = +_2[0][1], x12 = +_2[1][0], y12 = +_2[1][1]), reset()) : x02 == null ? null : [[x02, y02], [x12, y12]];
  };
  projection2.scale = function(_2) {
    return arguments.length ? (k2 = +_2, reset()) : k2;
  };
  projection2.translate = function(_2) {
    return arguments.length ? (tx = +_2[0], ty = +_2[1], reset()) : [tx, ty];
  };
  projection2.angle = function(_2) {
    return arguments.length ? (alpha = _2 % 360 * radians, sa = sin(alpha), ca = cos(alpha), reset()) : alpha * degrees;
  };
  projection2.reflectX = function(_2) {
    return arguments.length ? (sx = _2 ? -1 : 1, reset()) : sx < 0;
  };
  projection2.reflectY = function(_2) {
    return arguments.length ? (sy = _2 ? -1 : 1, reset()) : sy < 0;
  };
  projection2.fitExtent = function(extent2, object2) {
    return fitExtent(projection2, extent2, object2);
  };
  projection2.fitSize = function(size, object2) {
    return fitSize(projection2, size, object2);
  };
  projection2.fitWidth = function(width, object2) {
    return fitWidth(projection2, width, object2);
  };
  projection2.fitHeight = function(height, object2) {
    return fitHeight(projection2, height, object2);
  };
  return projection2;
}
function naturalEarth1Raw(lambda, phi) {
  var phi2 = phi * phi, phi4 = phi2 * phi2;
  return [
    lambda * (0.8707 - 0.131979 * phi2 + phi4 * (-0.013791 + phi4 * (3971e-6 * phi2 - 1529e-6 * phi4))),
    phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 5916e-6 * phi4)))
  ];
}
naturalEarth1Raw.invert = function(x2, y2) {
  var phi = y2, i2 = 25, delta;
  do {
    var phi2 = phi * phi, phi4 = phi2 * phi2;
    phi -= delta = (phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 5916e-6 * phi4))) - y2) / (1.007226 + phi2 * (0.015085 * 3 + phi4 * (-0.044475 * 7 + 0.028874 * 9 * phi2 - 5916e-6 * 11 * phi4)));
  } while (abs(delta) > epsilon && --i2 > 0);
  return [
    x2 / (0.8707 + (phi2 = phi * phi) * (-0.131979 + phi2 * (-0.013791 + phi2 * phi2 * phi2 * (3971e-6 - 1529e-6 * phi2)))),
    phi
  ];
};
function naturalEarth1() {
  return projection(naturalEarth1Raw).scale(175.295);
}
function orthographicRaw(x2, y2) {
  return [cos(y2) * sin(x2), sin(y2)];
}
orthographicRaw.invert = azimuthalInvert(asin);
function orthographic() {
  return projection(orthographicRaw).scale(249.5).clipAngle(90 + epsilon);
}
function stereographicRaw(x2, y2) {
  var cy = cos(y2), k2 = 1 + cos(x2) * cy;
  return [cy * sin(x2) / k2, sin(y2) / k2];
}
stereographicRaw.invert = azimuthalInvert(function(z2) {
  return 2 * atan(z2);
});
function stereographic() {
  return projection(stereographicRaw).scale(250).clipAngle(142);
}
function transverseMercatorRaw(lambda, phi) {
  return [log(tan((halfPi + phi) / 2)), -lambda];
}
transverseMercatorRaw.invert = function(x2, y2) {
  return [-y2, 2 * atan(exp(x2)) - halfPi];
};
function transverseMercator() {
  var m2 = mercatorProjection(transverseMercatorRaw), center2 = m2.center, rotate = m2.rotate;
  m2.center = function(_2) {
    return arguments.length ? center2([-_2[1], _2[0]]) : (_2 = center2(), [_2[1], -_2[0]]);
  };
  m2.rotate = function(_2) {
    return arguments.length ? rotate([_2[0], _2[1], _2.length > 2 ? _2[2] + 90 : 90]) : (_2 = rotate(), [_2[0], _2[1], _2[2] - 90]);
  };
  return rotate([0, 0, 90]).scale(159.155);
}
const src = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  geoAlbers: albers,
  geoAlbersUsa: albersUsa,
  geoArea: area,
  geoAzimuthalEqualArea: azimuthalEqualArea,
  geoAzimuthalEqualAreaRaw: azimuthalEqualAreaRaw,
  geoAzimuthalEquidistant: azimuthalEquidistant,
  geoAzimuthalEquidistantRaw: azimuthalEquidistantRaw,
  geoBounds: bounds,
  geoCentroid: centroid,
  geoCircle: circle$1,
  geoClipAntimeridian: clipAntimeridian,
  geoClipCircle: clipCircle,
  geoClipExtent: extent,
  geoClipRectangle: clipRectangle,
  geoConicConformal: conicConformal,
  geoConicConformalRaw: conicConformalRaw,
  geoConicEqualArea: conicEqualArea,
  geoConicEqualAreaRaw: conicEqualAreaRaw,
  geoConicEquidistant: conicEquidistant,
  geoConicEquidistantRaw: conicEquidistantRaw,
  geoContains: contains,
  geoDistance: distance,
  geoEqualEarth: equalEarth,
  geoEqualEarthRaw: equalEarthRaw,
  geoEquirectangular: equirectangular,
  geoEquirectangularRaw: equirectangularRaw,
  geoGnomonic: gnomonic,
  geoGnomonicRaw: gnomonicRaw,
  geoGraticule: graticule,
  geoGraticule10: graticule10,
  geoIdentity: identity$1,
  geoInterpolate: interpolate$1,
  geoLength: length,
  geoMercator: mercator,
  geoMercatorRaw: mercatorRaw,
  geoNaturalEarth1: naturalEarth1,
  geoNaturalEarth1Raw: naturalEarth1Raw,
  geoOrthographic: orthographic,
  geoOrthographicRaw: orthographicRaw,
  geoPath: index,
  geoProjection: projection,
  geoProjectionMutator: projectionMutator,
  geoRotation: rotation,
  geoStereographic: stereographic,
  geoStereographicRaw: stereographicRaw,
  geoStream,
  geoTransform: transform,
  geoTransverseMercator: transverseMercator,
  geoTransverseMercatorRaw: transverseMercatorRaw
}, Symbol.toStringTag, { value: "Module" }));
const require$$2 = /* @__PURE__ */ getAugmentedNamespace(src);
var constants = {};
var hasRequiredConstants;
function requireConstants() {
  if (hasRequiredConstants) return constants;
  hasRequiredConstants = 1;
  Object.defineProperty(constants, "__esModule", { value: true });
  constants.defaultTooltip = constants.defaultCountryStyle = constants.sizeMap = constants.heightRatio = constants.defaultColor = constants.defaultSize = void 0;
  constants.defaultSize = "xl";
  constants.defaultColor = "#dddddd";
  constants.heightRatio = 3 / 4;
  constants.sizeMap = {
    sm: 240,
    md: 336,
    lg: 480,
    xl: 640,
    xxl: 1200
  };
  const defaultCountryStyle = (stroke, strokeOpacity) => (context) => {
    const { countryValue, minValue, maxValue, color } = context;
    const calculatedValue = typeof countryValue === "string" ? minValue : (
      // TODO bug in TS-ESLint; report this
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      countryValue
    );
    let opacityLevel = calculatedValue !== void 0 ? 0.2 + 0.6 * ((calculatedValue - minValue) / (maxValue - minValue)) : 0;
    if (Number.isNaN(opacityLevel))
      opacityLevel = 0.8;
    const style = {
      fill: color,
      fillOpacity: opacityLevel,
      stroke,
      strokeWidth: 1,
      strokeOpacity,
      cursor: "pointer"
    };
    return style;
  };
  constants.defaultCountryStyle = defaultCountryStyle;
  const defaultTooltip = (context) => {
    const { countryName, countryValue, prefix: prefix2, suffix } = context;
    return `${countryName} ${prefix2} ${countryValue.toLocaleString()} ${suffix}`;
  };
  constants.defaultTooltip = defaultTooltip;
  return constants;
}
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  (function(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.responsify = exports.useWindowWidth = exports.useIsomorphicLayoutEffect = void 0;
    const react_1 = requireReact();
    const constants_js_1 = requireConstants();
    exports.useIsomorphicLayoutEffect = typeof window !== "undefined" ? react_1.useLayoutEffect : react_1.useEffect;
    function useWindowWidth() {
      const [width, setWidth] = (0, react_1.useState)(constants_js_1.sizeMap[constants_js_1.defaultSize]);
      (0, exports.useIsomorphicLayoutEffect)(() => {
        const updateWidth = () => {
          setWidth(window.innerWidth);
        };
        window.addEventListener("resize", updateWidth);
        updateWidth();
        return () => window.removeEventListener("resize", updateWidth);
      }, []);
      return width;
    }
    exports.useWindowWidth = useWindowWidth;
    function responsify(sizeOption, windowWidth) {
      if (sizeOption === "responsive") {
        if (typeof window === "undefined")
          return constants_js_1.sizeMap[constants_js_1.defaultSize];
        return Math.min(window.innerHeight, window.innerWidth) * 0.75;
      }
      if (typeof window === "undefined")
        return constants_js_1.sizeMap[sizeOption];
      const fittingSize = Object.values(constants_js_1.sizeMap).reverse().find((size) => size <= windowWidth) ?? constants_js_1.sizeMap.sm;
      return Math.min(fittingSize, constants_js_1.sizeMap[sizeOption]);
    }
    exports.responsify = responsify;
  })(utils);
  return utils;
}
var draw = {};
var ReactPathTooltip = {};
var hasRequiredReactPathTooltip;
function requireReactPathTooltip() {
  if (hasRequiredReactPathTooltip) return ReactPathTooltip;
  hasRequiredReactPathTooltip = 1;
  Object.defineProperty(ReactPathTooltip, "__esModule", { value: true });
  ReactPathTooltip.PathTooltip = void 0;
  const tslib_1 = require$$0;
  const react_1 = tslib_1.__importStar(requireReact());
  ReactPathTooltip.PathTooltip = (props) => {
    const [hidden, setHidden2] = react_1.useState(true);
    const [tooltipRect, setTooltipRect] = react_1.useState({ x: 0, y: 0, w: 0, h: 0, isLeft: false, isTop: false });
    const [fontSize] = react_1.useState(props["fontSize"] || 12);
    const [fontFamily] = react_1.useState(props["fontFamily"] || "sans-serif");
    const [bgColor] = react_1.useState(props["bgColor"] || "black");
    const [textColor] = react_1.useState(props["textColor"] || "white");
    const [rtl] = react_1.useState(props["rtl"] || false);
    const pathRef = props.pathRef;
    const svgRef = props.svgRef;
    const textRef = react_1.createRef();
    react_1.useEffect(() => {
      const updateTooltip = (e2) => {
        if (svgRef && pathRef && textRef && svgRef.current && pathRef.current && textRef.current) {
          const svgRect = svgRef.current.getBoundingClientRect();
          const textRect = textRef.current.getBoundingClientRect();
          const isLeft = e2.x - svgRect.x > svgRect.width / 2;
          const isTop = e2.y - svgRect.y > svgRect.height / 2;
          const w2 = textRect.width + 20;
          const h2 = textRect.height + 20;
          const x2 = isLeft ? e2.x - svgRect.x + 8 - w2 : e2.x - svgRect.x - 8;
          const y2 = isTop ? e2.y - svgRect.y - 12 - h2 : e2.y - svgRect.y + 8;
          setTooltipRect({ x: x2, y: y2, w: w2, h: h2, isLeft, isTop });
        }
      };
      if (pathRef && pathRef.current) {
        pathRef.current.addEventListener("mouseover", () => {
          setHidden2(false);
        });
        pathRef.current.addEventListener("mouseleave", () => {
          setHidden2(true);
        });
        pathRef.current.addEventListener("mousemove", (e2) => {
          if (!hidden)
            updateTooltip(e2);
        });
      }
    }, [pathRef, svgRef, textRef, hidden]);
    const bottomRight = (tooltipRect.x + 7).toString() + "," + (tooltipRect.y - 10).toString() + " " + (tooltipRect.x + 30).toString() + "," + tooltipRect.y.toString() + " " + (tooltipRect.x + 22).toString() + "," + tooltipRect.y.toString();
    const bottomLeft = (tooltipRect.x + tooltipRect.w - 8).toString() + "," + (tooltipRect.y - 10).toString() + " " + (tooltipRect.x + tooltipRect.w - 25).toString() + "," + tooltipRect.y.toString() + " " + (tooltipRect.x + tooltipRect.w - 15).toString() + "," + tooltipRect.y.toString();
    const topRight = (tooltipRect.x + 7).toString() + "," + (tooltipRect.y + tooltipRect.h + 10).toString() + " " + (tooltipRect.x + 15).toString() + "," + (tooltipRect.y + tooltipRect.h).toString() + " " + (tooltipRect.x + 7).toString() + "," + (tooltipRect.y + tooltipRect.h).toString();
    const topLeft = (tooltipRect.x + tooltipRect.w - 7).toString() + "," + (tooltipRect.y + tooltipRect.h + 10).toString() + " " + (tooltipRect.x + tooltipRect.w - 15).toString() + "," + (tooltipRect.y + tooltipRect.h).toString() + " " + (tooltipRect.x + tooltipRect.w - 7).toString() + "," + (tooltipRect.y + tooltipRect.h).toString();
    const points = tooltipRect.isLeft && tooltipRect.isTop ? topLeft : tooltipRect.isTop ? topRight : tooltipRect.isLeft ? bottomLeft : bottomRight;
    const findSpaceBeforeThreshold = (inputString, threshold) => {
      let i2 = 0;
      let temp = -1;
      if (inputString.length <= threshold) {
        return ["", inputString];
      }
      while (i2 <= inputString.length && i2 <= threshold) {
        if (inputString[i2] === " ") {
          temp = i2;
        }
        i2++;
      }
      return temp !== -1 ? [inputString.slice(0, temp), inputString.slice(temp + 1)] : [inputString.slice(0, threshold), inputString.slice(threshold + 1)];
    };
    const tips = [];
    const startTip = findSpaceBeforeThreshold(props.tip, 35 - (1 * fontSize - 11));
    tips.push(startTip[0]);
    let interimTip = startTip[1];
    let leftover = startTip[1];
    while (interimTip !== "") {
      const currTip = findSpaceBeforeThreshold(interimTip === leftover ? interimTip : leftover, 35 - (1 * fontSize - 11));
      interimTip = currTip[0];
      leftover = currTip[1];
      tips.push(interimTip === "" ? currTip[1] : currTip[0]);
    }
    return react_1.default.createElement(
      "g",
      { pointerEvents: "none" },
      react_1.default.createElement("rect", { x: tooltipRect.x, y: tooltipRect.y, width: tooltipRect.w, rx: 5, ry: 5, height: tooltipRect.h, fill: bgColor, visibility: hidden ? "hidden" : "visible" }),
      react_1.default.createElement("polygon", { fill: bgColor, visibility: hidden ? "hidden" : "visible", points }),
      react_1.default.createElement("text", { ref: textRef, x: rtl ? tooltipRect.x + tooltipRect.w - 10 : tooltipRect.x + 10, y: tooltipRect.y, cursor: "default", fontFamily, fontSize, fill: textColor, visibility: hidden ? "hidden" : "visible" }, props.tip.length > 35 - 1 * (fontSize - 11) ? tips.map((tip, index2) => {
        return react_1.default.createElement("tspan", { key: tip, x: rtl ? tooltipRect.x + tooltipRect.w - 10 : tooltipRect.x + 10, y: tooltipRect.y + (20 + (1 * fontSize - 11)) + 20 * index2 }, tip);
      }) : react_1.default.createElement("tspan", { x: rtl ? tooltipRect.x + tooltipRect.w - 10 : tooltipRect.x + 10, y: tooltipRect.y + (20 + (1 * fontSize - 11)) }, props.tip))
    );
  };
  return ReactPathTooltip;
}
var hasRequiredDraw;
function requireDraw() {
  if (hasRequiredDraw) return draw;
  hasRequiredDraw = 1;
  Object.defineProperty(draw, "__esModule", { value: true });
  draw.drawTooltip = void 0;
  const tslib_1 = require$$0;
  const React = tslib_1.__importStar(requireReact());
  const react_path_tooltip_1 = requireReactPathTooltip();
  function drawTooltip(tip, tooltipBgColor, tooltipTextColor, rtl, triggerRef, containerRef) {
    return tip ? React.createElement(react_path_tooltip_1.PathTooltip, { fontSize: 12, bgColor: tooltipBgColor, textColor: tooltipTextColor, key: tip, pathRef: triggerRef, svgRef: containerRef, rtl, tip }) : null;
  }
  draw.drawTooltip = drawTooltip;
  return draw;
}
var Frame = {};
var hasRequiredFrame;
function requireFrame() {
  if (hasRequiredFrame) return Frame;
  hasRequiredFrame = 1;
  Object.defineProperty(Frame, "__esModule", { value: true });
  const tslib_1 = require$$0;
  const React = tslib_1.__importStar(requireReact());
  function Frame$1({ color }) {
    return React.createElement("rect", { x: 0, y: 0, width: "100%", height: "100%", stroke: color, fill: "none" });
  }
  Frame.default = Frame$1;
  return Frame;
}
var Region = {};
var hasRequiredRegion;
function requireRegion() {
  if (hasRequiredRegion) return Region;
  hasRequiredRegion = 1;
  Object.defineProperty(Region, "__esModule", { value: true });
  const tslib_1 = require$$0;
  const React = tslib_1.__importStar(requireReact());
  function onMouseOver(strokeOpacity) {
    return (event) => {
      event.currentTarget.style.strokeWidth = "2";
      event.currentTarget.style.strokeOpacity = String(Math.min(strokeOpacity + 0.3, 1));
    };
  }
  function onMouseOut(strokeOpacity) {
    return (event) => {
      event.currentTarget.style.strokeWidth = "1";
      event.currentTarget.style.strokeOpacity = String(strokeOpacity);
    };
  }
  function Region$1({ href, ...props }, ref) {
    const path = React.createElement("path", { onMouseOver: onMouseOver(Number(props.strokeOpacity)), onMouseOut: onMouseOut(Number(props.strokeOpacity)), ref, ...props });
    if (href)
      return React.createElement("a", { ...typeof href === "string" ? { href } : href }, path);
    return path;
  }
  Region.default = React.forwardRef(Region$1);
  return Region;
}
var TextLabel = {};
var hasRequiredTextLabel;
function requireTextLabel() {
  if (hasRequiredTextLabel) return TextLabel;
  hasRequiredTextLabel = 1;
  Object.defineProperty(TextLabel, "__esModule", { value: true });
  const tslib_1 = require$$0;
  const React = tslib_1.__importStar(requireReact());
  function TextLabel$1({ label, ...props }) {
    return React.createElement("text", { ...props }, label);
  }
  TextLabel.default = TextLabel$1;
  return TextLabel;
}
var hasRequiredDist;
function requireDist() {
  if (hasRequiredDist) return dist;
  hasRequiredDist = 1;
  Object.defineProperty(dist, "__esModule", { value: true });
  dist.regions = dist.WorldMap = void 0;
  const tslib_1 = require$$0;
  const React = tslib_1.__importStar(requireReact());
  const react_1 = requireReact();
  const d3_geo_1 = require$$2;
  const countries_geo_js_1 = tslib_1.__importDefault(requireCountries_geo());
  const constants_js_1 = requireConstants();
  const utils_js_1 = requireUtils();
  const draw_js_1 = requireDraw();
  const Frame_js_1 = tslib_1.__importDefault(requireFrame());
  const Region_js_1 = tslib_1.__importDefault(requireRegion());
  const TextLabel_js_1 = tslib_1.__importDefault(requireTextLabel());
  function toValue({ value }) {
    return typeof value === "string" ? 0 : value;
  }
  function WorldMap2(props) {
    const { data, title, valuePrefix = "", valueSuffix = "", color = constants_js_1.defaultColor, strokeOpacity = 0.2, backgroundColor = "white", tooltipBgColor = "black", tooltipTextColor = "white", rtl = false, size = constants_js_1.defaultSize, frame = false, frameColor = "black", borderColor = "black", richInteraction = false, styleFunction = (0, constants_js_1.defaultCountryStyle)(borderColor, strokeOpacity), tooltipTextFunction = constants_js_1.defaultTooltip, onClickFunction, hrefFunction, textLabelFunction = () => [] } = props;
    const windowWidth = (0, utils_js_1.useWindowWidth)();
    const width = typeof size === "number" ? size : (0, utils_js_1.responsify)(size, windowWidth);
    const height = width * constants_js_1.heightRatio;
    const [scale, setScale] = (0, react_1.useState)(1);
    const [translateX, setTranslateX] = (0, react_1.useState)(0);
    const [translateY, setTranslateY] = (0, react_1.useState)(0);
    const containerRef = (0, react_1.createRef)();
    const countryValueMap = Object.fromEntries(data.map(({ country, value }) => [country.toUpperCase(), value]));
    const minValue = Math.min(...data.map(toValue));
    const maxValue = Math.max(...data.map(toValue));
    const projection2 = (0, d3_geo_1.geoMercator)();
    const pathGenerator = (0, d3_geo_1.geoPath)().projection(projection2);
    const onClick = React.useCallback((context) => (event) => onClickFunction?.({ ...context, event }), [onClickFunction]);
    const regions2 = countries_geo_js_1.default.features.map((feature) => {
      const triggerRef = (0, react_1.createRef)();
      const { I: isoCode, N: countryName, C: coordinates2 } = feature;
      const geoFeature = {
        type: "Feature",
        properties: { NAME: countryName, ISO_A2: isoCode },
        geometry: {
          type: "MultiPolygon",
          coordinates: coordinates2
        }
      };
      const context = {
        countryCode: isoCode,
        countryValue: countryValueMap[isoCode],
        countryName,
        color,
        minValue,
        maxValue,
        prefix: valuePrefix,
        suffix: valueSuffix
      };
      const path = React.createElement(Region_js_1.default, { ref: triggerRef, d: pathGenerator(geoFeature), style: styleFunction(context), onClick: onClick(context), strokeOpacity, href: hrefFunction?.(context), key: countryName });
      const tooltip = (0, draw_js_1.drawTooltip)(typeof context.countryValue === "undefined" ? void 0 : tooltipTextFunction(context), tooltipBgColor, tooltipTextColor, rtl, triggerRef, containerRef);
      return { path, highlightedTooltip: tooltip };
    });
    const regionPaths = regions2.map((entry) => entry.path);
    const regionTooltips = regions2.map((entry) => entry.highlightedTooltip);
    const eventHandlers = {
      onMouseDown(e2) {
        e2.preventDefault();
        e2.stopPropagation();
      },
      onDoubleClick(e2) {
        const rect = e2.currentTarget.getBoundingClientRect();
        const x2 = e2.clientX - rect.left;
        const y2 = e2.clientY - rect.top;
        if (scale === 4) {
          setTranslateX(0);
          setTranslateY(0);
          setScale(1);
        } else {
          setTranslateX(2 * translateX - x2);
          setTranslateY(2 * translateY - y2);
          setScale(scale * 2);
        }
      }
    };
    return React.createElement(
      "figure",
      { className: "worldmap__figure-container", style: { backgroundColor } },
      title && React.createElement("figcaption", { className: "worldmap__figure-caption" }, title),
      React.createElement(
        "svg",
        { ref: containerRef, height: `${height}px`, width: `${width}px`, ...richInteraction ? eventHandlers : void 0 },
        frame && React.createElement(Frame_js_1.default, { color: frameColor }),
        React.createElement("g", { transform: `translate(${translateX}, ${translateY}) scale(${width / 960 * scale}) translate(0, 240)`, style: { transition: "all 0.2s" } }, regionPaths),
        React.createElement("g", null, textLabelFunction(width).map((labelProps) => React.createElement(TextLabel_js_1.default, { ...labelProps, key: labelProps.label }))),
        regionTooltips
      )
    );
  }
  dist.default = WorldMap2;
  dist.WorldMap = WorldMap2;
  const regions = countries_geo_js_1.default.features.map((g2) => ({ name: g2.N, code: g2.I }));
  dist.regions = regions;
  return dist;
}
var distExports = requireDist();
const WorldMap = /* @__PURE__ */ getDefaultExportFromCjs(distExports);
function OverviewMap({ projectId, shareId }) {
  const { range: range2, startDate, endDate } = useOverviewOptions();
  const [filters, setFilter] = useEventQueryFilters();
  const trpc = useTRPC();
  const query = useQuery(
    trpc.overview.map.queryOptions({
      projectId,
      shareId,
      range: range2,
      filters,
      startDate,
      endDate
    })
  );
  const mapData = reactExports.useMemo(() => {
    if (!query.data) {
      return [];
    }
    const countryMap = /* @__PURE__ */ new Map();
    query.data.forEach((item) => {
      const country = item.country.toLowerCase();
      const current = countryMap.get(country) ?? 0;
      countryMap.set(country, current + item.count);
    });
    return Array.from(countryMap.entries()).map(([country, value]) => ({
      country,
      value
    }));
  }, [query.data]);
  if (query.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Loading map..." }) });
  }
  if (query.isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Error loading map" }) });
  }
  if (!query.data || mapData.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "No data available" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-full w-full", style: { minHeight: 300 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        className: "absolute right-1 bottom-0 z-10 text-3xs text-muted-foreground/70 hover:text-muted-foreground",
        href: "https://db-ip.com",
        rel: "noopener noreferrer",
        target: "_blank",
        children: "IP Geolocation by DB-IP"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AutoSizer$1, { disableHeight: true, children: ({ width }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      WorldMap,
      {
        borderColor: "var(--foreground)",
        color: "var(--chart-0)",
        data: mapData,
        onClickFunction: (event) => {
          if (event.countryCode) {
            setFilter("country", event.countryCode);
          }
        },
        size: width
      }
    ) })
  ] });
}
function OverviewTopGeo({
  projectId,
  shareId
}) {
  const { interval, range: range2, startDate, endDate } = useOverviewOptions();
  const [chartType, setChartType] = reactExports.useState("bar");
  const [filters, setFilter] = useEventQueryFilters();
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  filters.find((filter) => filter.name === "path");
  const [widget, setWidget, widgets] = useOverviewWidgetV2("geo", {
    country: {
      title: "Top countries",
      btn: "Countries"
    },
    region: {
      title: "Top regions",
      btn: "Regions"
    },
    city: {
      title: "Top cities",
      btn: "Cities"
    }
  });
  const trpc = useTRPC();
  const [view] = useOverviewView();
  const query = useQuery(
    trpc.overview.topGeneric.queryOptions({
      projectId,
      shareId,
      range: range2,
      filters,
      column: widget.key,
      startDate,
      endDate
    })
  );
  const seriesQuery = useQuery(
    trpc.overview.topGenericSeries.queryOptions(
      {
        projectId,
        shareId,
        range: range2,
        filters,
        column: widget.key,
        startDate,
        endDate,
        interval
      },
      {
        enabled: view === "chart"
      }
    )
  );
  const filteredData = reactExports.useMemo(() => {
    const data = query.data ?? [];
    if (!searchQuery.trim()) {
      return data;
    }
    const queryLower = searchQuery.toLowerCase();
    return data.filter(
      (item) => item.name?.toLowerCase().includes(queryLower) || item.prefix?.toLowerCase().includes(queryLower) || countries[item.name]?.toLowerCase().includes(queryLower)
    );
  }, [query.data, searchQuery]);
  const tabs = widgets.map((w2) => ({
    key: w2.key,
    label: w2.btn
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "col-span-6 md:col-span-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        WidgetHeadSearchable,
        {
          activeTab: widget.key,
          className: "border-b-0 pb-2",
          onSearchChange: setSearchQuery,
          onTabChange: setWidget,
          searchPlaceholder: `Search ${widget.btn.toLowerCase()}`,
          searchValue: searchQuery,
          tabs
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { className: "p-0", children: view === "chart" ? seriesQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewLineChartLoading, {}) : seriesQuery.data ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        OverviewLineChart,
        {
          data: seriesQuery.data,
          interval,
          range: range2,
          searchQuery
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewLineChartLoading, {}) : query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewWidgetTableLoading, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        OverviewWidgetTableGeneric,
        {
          column: {
            name: OVERVIEW_COLUMNS_NAME[widget.key],
            render(item) {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row relative min-w-0 items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SerieIcon,
                  {
                    name: item.prefix || item.name || NOT_SET_VALUE
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    className: "truncate",
                    onClick: () => {
                      if (widget.key === "country") {
                        setWidget("region");
                      } else if (widget.key === "region") {
                        setWidget("city");
                      }
                      setFilter(widget.key, item.name);
                    },
                    type: "button",
                    children: [
                      item.prefix && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "row mr-1 inline-flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: countries[item.prefix] ?? item.prefix }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-3" }) })
                      ] }),
                      (countries[item.name] ?? item.name) || "Not set"
                    ]
                  }
                )
              ] });
            }
          },
          data: filteredData
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetFooter, { className: "row items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          OverviewDetailsButton,
          {
            onClick: () => pushModal("OverviewTopGenericModal", {
              projectId,
              shareId,
              column: widget.key
            })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewViewToggle, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 pr-2 text-muted-foreground text-sm", children: [
          "Geo data provided by",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              className: "hover:underline",
              href: "https://www.maxmind.com",
              rel: "noopener noreferrer nofollow",
              target: "_blank",
              children: "MaxMind"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "col-span-6 md:col-span-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "title", children: "Map" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewMap, { projectId, shareId }) })
    ] })
  ] });
}
function OverviewTopPages({
  projectId,
  shareId
}) {
  const { range: range2, startDate, endDate } = useOverviewOptions();
  const [filters] = useEventQueryFilters();
  const [domain, setDomain] = useQueryState("d", parseAsBoolean);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [widget, setWidget, widgets] = useOverviewWidgetV2("pages", {
    page: {
      title: "Top pages",
      btn: "Pages"
    },
    entry: {
      title: "Entry Pages",
      btn: "Entries",
      meta: {
        columns: {
          sessions: "Entries"
        }
      }
    },
    exit: {
      title: "Exit Pages",
      btn: "Exits",
      meta: {
        columns: {
          sessions: "Exits"
        }
      }
    }
  });
  const trpc = useTRPC();
  const query = useQuery(
    trpc.overview.topPages.queryOptions({
      projectId,
      shareId,
      filters,
      startDate,
      endDate,
      mode: widget.key,
      range: range2
    })
  );
  const filteredData = reactExports.useMemo(() => {
    const data = query.data ?? [];
    if (!searchQuery.trim()) {
      return data;
    }
    const queryLower = searchQuery.toLowerCase();
    return data.filter(
      (item) => item.path.toLowerCase().includes(queryLower) || item.origin.toLowerCase().includes(queryLower)
    );
  }, [query.data, searchQuery]);
  const tabs = widgets.map((w2) => ({
    key: w2.key,
    label: w2.btn
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "col-span-6 md:col-span-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      WidgetHeadSearchable,
      {
        activeTab: widget.key,
        className: "border-b-0 pb-2",
        onSearchChange: setSearchQuery,
        onTabChange: setWidget,
        searchPlaceholder: `Search ${widget.btn.toLowerCase()}`,
        searchValue: searchQuery,
        tabs
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { className: "p-0", children: query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewWidgetTableLoading, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: widget.meta?.columns.sessions ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      OverviewWidgetTableEntries,
      {
        data: filteredData,
        lastColumnName: widget.meta.columns.sessions,
        showDomain: !!domain
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      OverviewWidgetTablePages,
      {
        data: filteredData,
        showDomain: !!domain
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        OverviewDetailsButton,
        {
          onClick: () => pushModal("OverviewTopPagesModal", { projectId, shareId })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          icon: Earth,
          onClick: () => {
            setDomain((p2) => !p2);
          },
          variant: "ghost",
          children: domain ? "Hide domain" : "Show domain"
        }
      )
    ] })
  ] }) });
}
function OverviewTopSources({
  projectId,
  shareId
}) {
  const { interval, range: range2, startDate, endDate } = useOverviewOptions();
  const [filters, setFilter] = useEventQueryFilters();
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [view] = useOverviewView();
  const [widget, setWidget, widgets] = useOverviewWidgetV2("sources", {
    referrer_name: {
      title: "Top sources",
      btn: "Refs"
    },
    referrer: {
      title: "Top urls",
      btn: "Urls"
    },
    referrer_type: {
      title: "Top types",
      btn: "Types"
    },
    utm_source: {
      title: "UTM Source",
      btn: "Source"
    },
    utm_medium: {
      title: "UTM Medium",
      btn: "Medium"
    },
    utm_campaign: {
      title: "UTM Campaign",
      btn: "Campaign"
    },
    utm_term: {
      title: "UTM Term",
      btn: "Term"
    },
    utm_content: {
      title: "UTM Content",
      btn: "Content"
    }
  });
  const trpc = useTRPC();
  const query = useQuery(
    trpc.overview.topGeneric.queryOptions({
      projectId,
      shareId,
      range: range2,
      filters,
      column: widget.key,
      startDate,
      endDate
    })
  );
  const seriesQuery = useQuery(
    trpc.overview.topGenericSeries.queryOptions(
      {
        projectId,
        shareId,
        range: range2,
        filters,
        column: widget.key,
        startDate,
        endDate,
        interval
      },
      {
        enabled: view === "chart"
      }
    )
  );
  const filteredData = reactExports.useMemo(() => {
    const data = query.data ?? [];
    if (!searchQuery.trim()) {
      return data;
    }
    const queryLower = searchQuery.toLowerCase();
    return data.filter((item) => item.name?.toLowerCase().includes(queryLower));
  }, [query.data, searchQuery]);
  const tabs = widgets.map((w2) => ({
    key: w2.key,
    label: w2.btn
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "col-span-6 md:col-span-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      WidgetHeadSearchable,
      {
        activeTab: widget.key,
        className: "border-b-0 pb-2",
        onSearchChange: setSearchQuery,
        onTabChange: setWidget,
        searchPlaceholder: `Search ${widget.btn.toLowerCase()}`,
        searchValue: searchQuery,
        tabs
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { className: "p-0", children: view === "chart" ? seriesQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewLineChartLoading, {}) : seriesQuery.data ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      OverviewLineChart,
      {
        data: seriesQuery.data,
        interval,
        range: range2,
        searchQuery
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewLineChartLoading, {}) : query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewWidgetTableLoading, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      OverviewWidgetTableGeneric,
      {
        column: {
          name: OVERVIEW_COLUMNS_NAME[widget.key],
          render(item) {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row relative min-w-0 items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: item.name || NOT_SET_VALUE }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "truncate",
                  onClick: () => {
                    if (widget.key.startsWith("utm_")) {
                      setFilter(
                        `properties.__query.${widget.key}`,
                        item.name
                      );
                    } else {
                      setFilter(widget.key, item.name);
                    }
                  },
                  type: "button",
                  children: (item.name || "Direct / Not set").replace(/https?:\/\//, "").replace("www.", "")
                }
              )
            ] });
          }
        },
        data: filteredData
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        OverviewDetailsButton,
        {
          onClick: () => pushModal("OverviewTopGenericModal", {
            projectId,
            shareId,
            column: widget.key
          })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewViewToggle, {})
    ] })
  ] }) });
}
var isFunction_1;
var hasRequiredIsFunction;
function requireIsFunction() {
  if (hasRequiredIsFunction) return isFunction_1;
  hasRequiredIsFunction = 1;
  var baseGetTag = require_baseGetTag(), isObject = requireIsObject();
  var asyncTag = "[object AsyncFunction]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }
  isFunction_1 = isFunction;
  return isFunction_1;
}
var _coreJsData;
var hasRequired_coreJsData;
function require_coreJsData() {
  if (hasRequired_coreJsData) return _coreJsData;
  hasRequired_coreJsData = 1;
  var root = require_root();
  var coreJsData = root["__core-js_shared__"];
  _coreJsData = coreJsData;
  return _coreJsData;
}
var _isMasked;
var hasRequired_isMasked;
function require_isMasked() {
  if (hasRequired_isMasked) return _isMasked;
  hasRequired_isMasked = 1;
  var coreJsData = require_coreJsData();
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  })();
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  _isMasked = isMasked;
  return _isMasked;
}
var _toSource;
var hasRequired_toSource;
function require_toSource() {
  if (hasRequired_toSource) return _toSource;
  hasRequired_toSource = 1;
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e2) {
      }
      try {
        return func + "";
      } catch (e2) {
      }
    }
    return "";
  }
  _toSource = toSource;
  return _toSource;
}
var _baseIsNative;
var hasRequired_baseIsNative;
function require_baseIsNative() {
  if (hasRequired_baseIsNative) return _baseIsNative;
  hasRequired_baseIsNative = 1;
  var isFunction = requireIsFunction(), isMasked = require_isMasked(), isObject = requireIsObject(), toSource = require_toSource();
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var funcProto = Function.prototype, objectProto = Object.prototype;
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var reIsNative = RegExp(
    "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  );
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  _baseIsNative = baseIsNative;
  return _baseIsNative;
}
var _getValue;
var hasRequired_getValue;
function require_getValue() {
  if (hasRequired_getValue) return _getValue;
  hasRequired_getValue = 1;
  function getValue(object2, key) {
    return object2 == null ? void 0 : object2[key];
  }
  _getValue = getValue;
  return _getValue;
}
var _getNative;
var hasRequired_getNative;
function require_getNative() {
  if (hasRequired_getNative) return _getNative;
  hasRequired_getNative = 1;
  var baseIsNative = require_baseIsNative(), getValue = require_getValue();
  function getNative(object2, key) {
    var value = getValue(object2, key);
    return baseIsNative(value) ? value : void 0;
  }
  _getNative = getNative;
  return _getNative;
}
var _nativeCreate;
var hasRequired_nativeCreate;
function require_nativeCreate() {
  if (hasRequired_nativeCreate) return _nativeCreate;
  hasRequired_nativeCreate = 1;
  var getNative = require_getNative();
  var nativeCreate = getNative(Object, "create");
  _nativeCreate = nativeCreate;
  return _nativeCreate;
}
var _hashClear;
var hasRequired_hashClear;
function require_hashClear() {
  if (hasRequired_hashClear) return _hashClear;
  hasRequired_hashClear = 1;
  var nativeCreate = require_nativeCreate();
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }
  _hashClear = hashClear;
  return _hashClear;
}
var _hashDelete;
var hasRequired_hashDelete;
function require_hashDelete() {
  if (hasRequired_hashDelete) return _hashDelete;
  hasRequired_hashDelete = 1;
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }
  _hashDelete = hashDelete;
  return _hashDelete;
}
var _hashGet;
var hasRequired_hashGet;
function require_hashGet() {
  if (hasRequired_hashGet) return _hashGet;
  hasRequired_hashGet = 1;
  var nativeCreate = require_nativeCreate();
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : void 0;
  }
  _hashGet = hashGet;
  return _hashGet;
}
var _hashHas;
var hasRequired_hashHas;
function require_hashHas() {
  if (hasRequired_hashHas) return _hashHas;
  hasRequired_hashHas = 1;
  var nativeCreate = require_nativeCreate();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
  }
  _hashHas = hashHas;
  return _hashHas;
}
var _hashSet;
var hasRequired_hashSet;
function require_hashSet() {
  if (hasRequired_hashSet) return _hashSet;
  hasRequired_hashSet = 1;
  var nativeCreate = require_nativeCreate();
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
    return this;
  }
  _hashSet = hashSet;
  return _hashSet;
}
var _Hash;
var hasRequired_Hash;
function require_Hash() {
  if (hasRequired_Hash) return _Hash;
  hasRequired_Hash = 1;
  var hashClear = require_hashClear(), hashDelete = require_hashDelete(), hashGet = require_hashGet(), hashHas = require_hashHas(), hashSet = require_hashSet();
  function Hash(entries) {
    var index2 = -1, length2 = entries == null ? 0 : entries.length;
    this.clear();
    while (++index2 < length2) {
      var entry = entries[index2];
      this.set(entry[0], entry[1]);
    }
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype["delete"] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;
  _Hash = Hash;
  return _Hash;
}
var _listCacheClear;
var hasRequired_listCacheClear;
function require_listCacheClear() {
  if (hasRequired_listCacheClear) return _listCacheClear;
  hasRequired_listCacheClear = 1;
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }
  _listCacheClear = listCacheClear;
  return _listCacheClear;
}
var eq_1;
var hasRequiredEq;
function requireEq() {
  if (hasRequiredEq) return eq_1;
  hasRequiredEq = 1;
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  eq_1 = eq;
  return eq_1;
}
var _assocIndexOf;
var hasRequired_assocIndexOf;
function require_assocIndexOf() {
  if (hasRequired_assocIndexOf) return _assocIndexOf;
  hasRequired_assocIndexOf = 1;
  var eq = requireEq();
  function assocIndexOf(array, key) {
    var length2 = array.length;
    while (length2--) {
      if (eq(array[length2][0], key)) {
        return length2;
      }
    }
    return -1;
  }
  _assocIndexOf = assocIndexOf;
  return _assocIndexOf;
}
var _listCacheDelete;
var hasRequired_listCacheDelete;
function require_listCacheDelete() {
  if (hasRequired_listCacheDelete) return _listCacheDelete;
  hasRequired_listCacheDelete = 1;
  var assocIndexOf = require_assocIndexOf();
  var arrayProto = Array.prototype;
  var splice = arrayProto.splice;
  function listCacheDelete(key) {
    var data = this.__data__, index2 = assocIndexOf(data, key);
    if (index2 < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index2 == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index2, 1);
    }
    --this.size;
    return true;
  }
  _listCacheDelete = listCacheDelete;
  return _listCacheDelete;
}
var _listCacheGet;
var hasRequired_listCacheGet;
function require_listCacheGet() {
  if (hasRequired_listCacheGet) return _listCacheGet;
  hasRequired_listCacheGet = 1;
  var assocIndexOf = require_assocIndexOf();
  function listCacheGet(key) {
    var data = this.__data__, index2 = assocIndexOf(data, key);
    return index2 < 0 ? void 0 : data[index2][1];
  }
  _listCacheGet = listCacheGet;
  return _listCacheGet;
}
var _listCacheHas;
var hasRequired_listCacheHas;
function require_listCacheHas() {
  if (hasRequired_listCacheHas) return _listCacheHas;
  hasRequired_listCacheHas = 1;
  var assocIndexOf = require_assocIndexOf();
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }
  _listCacheHas = listCacheHas;
  return _listCacheHas;
}
var _listCacheSet;
var hasRequired_listCacheSet;
function require_listCacheSet() {
  if (hasRequired_listCacheSet) return _listCacheSet;
  hasRequired_listCacheSet = 1;
  var assocIndexOf = require_assocIndexOf();
  function listCacheSet(key, value) {
    var data = this.__data__, index2 = assocIndexOf(data, key);
    if (index2 < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index2][1] = value;
    }
    return this;
  }
  _listCacheSet = listCacheSet;
  return _listCacheSet;
}
var _ListCache;
var hasRequired_ListCache;
function require_ListCache() {
  if (hasRequired_ListCache) return _ListCache;
  hasRequired_ListCache = 1;
  var listCacheClear = require_listCacheClear(), listCacheDelete = require_listCacheDelete(), listCacheGet = require_listCacheGet(), listCacheHas = require_listCacheHas(), listCacheSet = require_listCacheSet();
  function ListCache(entries) {
    var index2 = -1, length2 = entries == null ? 0 : entries.length;
    this.clear();
    while (++index2 < length2) {
      var entry = entries[index2];
      this.set(entry[0], entry[1]);
    }
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype["delete"] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;
  _ListCache = ListCache;
  return _ListCache;
}
var _Map;
var hasRequired_Map;
function require_Map() {
  if (hasRequired_Map) return _Map;
  hasRequired_Map = 1;
  var getNative = require_getNative(), root = require_root();
  var Map2 = getNative(root, "Map");
  _Map = Map2;
  return _Map;
}
var _mapCacheClear;
var hasRequired_mapCacheClear;
function require_mapCacheClear() {
  if (hasRequired_mapCacheClear) return _mapCacheClear;
  hasRequired_mapCacheClear = 1;
  var Hash = require_Hash(), ListCache = require_ListCache(), Map2 = require_Map();
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      "hash": new Hash(),
      "map": new (Map2 || ListCache)(),
      "string": new Hash()
    };
  }
  _mapCacheClear = mapCacheClear;
  return _mapCacheClear;
}
var _isKeyable;
var hasRequired_isKeyable;
function require_isKeyable() {
  if (hasRequired_isKeyable) return _isKeyable;
  hasRequired_isKeyable = 1;
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  _isKeyable = isKeyable;
  return _isKeyable;
}
var _getMapData;
var hasRequired_getMapData;
function require_getMapData() {
  if (hasRequired_getMapData) return _getMapData;
  hasRequired_getMapData = 1;
  var isKeyable = require_isKeyable();
  function getMapData(map2, key) {
    var data = map2.__data__;
    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  _getMapData = getMapData;
  return _getMapData;
}
var _mapCacheDelete;
var hasRequired_mapCacheDelete;
function require_mapCacheDelete() {
  if (hasRequired_mapCacheDelete) return _mapCacheDelete;
  hasRequired_mapCacheDelete = 1;
  var getMapData = require_getMapData();
  function mapCacheDelete(key) {
    var result = getMapData(this, key)["delete"](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  _mapCacheDelete = mapCacheDelete;
  return _mapCacheDelete;
}
var _mapCacheGet;
var hasRequired_mapCacheGet;
function require_mapCacheGet() {
  if (hasRequired_mapCacheGet) return _mapCacheGet;
  hasRequired_mapCacheGet = 1;
  var getMapData = require_getMapData();
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }
  _mapCacheGet = mapCacheGet;
  return _mapCacheGet;
}
var _mapCacheHas;
var hasRequired_mapCacheHas;
function require_mapCacheHas() {
  if (hasRequired_mapCacheHas) return _mapCacheHas;
  hasRequired_mapCacheHas = 1;
  var getMapData = require_getMapData();
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }
  _mapCacheHas = mapCacheHas;
  return _mapCacheHas;
}
var _mapCacheSet;
var hasRequired_mapCacheSet;
function require_mapCacheSet() {
  if (hasRequired_mapCacheSet) return _mapCacheSet;
  hasRequired_mapCacheSet = 1;
  var getMapData = require_getMapData();
  function mapCacheSet(key, value) {
    var data = getMapData(this, key), size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }
  _mapCacheSet = mapCacheSet;
  return _mapCacheSet;
}
var _MapCache;
var hasRequired_MapCache;
function require_MapCache() {
  if (hasRequired_MapCache) return _MapCache;
  hasRequired_MapCache = 1;
  var mapCacheClear = require_mapCacheClear(), mapCacheDelete = require_mapCacheDelete(), mapCacheGet = require_mapCacheGet(), mapCacheHas = require_mapCacheHas(), mapCacheSet = require_mapCacheSet();
  function MapCache(entries) {
    var index2 = -1, length2 = entries == null ? 0 : entries.length;
    this.clear();
    while (++index2 < length2) {
      var entry = entries[index2];
      this.set(entry[0], entry[1]);
    }
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype["delete"] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;
  _MapCache = MapCache;
  return _MapCache;
}
var _setCacheAdd;
var hasRequired_setCacheAdd;
function require_setCacheAdd() {
  if (hasRequired_setCacheAdd) return _setCacheAdd;
  hasRequired_setCacheAdd = 1;
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED);
    return this;
  }
  _setCacheAdd = setCacheAdd;
  return _setCacheAdd;
}
var _setCacheHas;
var hasRequired_setCacheHas;
function require_setCacheHas() {
  if (hasRequired_setCacheHas) return _setCacheHas;
  hasRequired_setCacheHas = 1;
  function setCacheHas(value) {
    return this.__data__.has(value);
  }
  _setCacheHas = setCacheHas;
  return _setCacheHas;
}
var _SetCache;
var hasRequired_SetCache;
function require_SetCache() {
  if (hasRequired_SetCache) return _SetCache;
  hasRequired_SetCache = 1;
  var MapCache = require_MapCache(), setCacheAdd = require_setCacheAdd(), setCacheHas = require_setCacheHas();
  function SetCache(values) {
    var index2 = -1, length2 = values == null ? 0 : values.length;
    this.__data__ = new MapCache();
    while (++index2 < length2) {
      this.add(values[index2]);
    }
  }
  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
  SetCache.prototype.has = setCacheHas;
  _SetCache = SetCache;
  return _SetCache;
}
var _baseFindIndex;
var hasRequired_baseFindIndex;
function require_baseFindIndex() {
  if (hasRequired_baseFindIndex) return _baseFindIndex;
  hasRequired_baseFindIndex = 1;
  function baseFindIndex(array, predicate, fromIndex, fromRight) {
    var length2 = array.length, index2 = fromIndex + (fromRight ? 1 : -1);
    while (fromRight ? index2-- : ++index2 < length2) {
      if (predicate(array[index2], index2, array)) {
        return index2;
      }
    }
    return -1;
  }
  _baseFindIndex = baseFindIndex;
  return _baseFindIndex;
}
var _baseIsNaN;
var hasRequired_baseIsNaN;
function require_baseIsNaN() {
  if (hasRequired_baseIsNaN) return _baseIsNaN;
  hasRequired_baseIsNaN = 1;
  function baseIsNaN(value) {
    return value !== value;
  }
  _baseIsNaN = baseIsNaN;
  return _baseIsNaN;
}
var _strictIndexOf;
var hasRequired_strictIndexOf;
function require_strictIndexOf() {
  if (hasRequired_strictIndexOf) return _strictIndexOf;
  hasRequired_strictIndexOf = 1;
  function strictIndexOf(array, value, fromIndex) {
    var index2 = fromIndex - 1, length2 = array.length;
    while (++index2 < length2) {
      if (array[index2] === value) {
        return index2;
      }
    }
    return -1;
  }
  _strictIndexOf = strictIndexOf;
  return _strictIndexOf;
}
var _baseIndexOf;
var hasRequired_baseIndexOf;
function require_baseIndexOf() {
  if (hasRequired_baseIndexOf) return _baseIndexOf;
  hasRequired_baseIndexOf = 1;
  var baseFindIndex = require_baseFindIndex(), baseIsNaN = require_baseIsNaN(), strictIndexOf = require_strictIndexOf();
  function baseIndexOf(array, value, fromIndex) {
    return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
  }
  _baseIndexOf = baseIndexOf;
  return _baseIndexOf;
}
var _arrayIncludes;
var hasRequired_arrayIncludes;
function require_arrayIncludes() {
  if (hasRequired_arrayIncludes) return _arrayIncludes;
  hasRequired_arrayIncludes = 1;
  var baseIndexOf = require_baseIndexOf();
  function arrayIncludes(array, value) {
    var length2 = array == null ? 0 : array.length;
    return !!length2 && baseIndexOf(array, value, 0) > -1;
  }
  _arrayIncludes = arrayIncludes;
  return _arrayIncludes;
}
var _arrayIncludesWith;
var hasRequired_arrayIncludesWith;
function require_arrayIncludesWith() {
  if (hasRequired_arrayIncludesWith) return _arrayIncludesWith;
  hasRequired_arrayIncludesWith = 1;
  function arrayIncludesWith(array, value, comparator) {
    var index2 = -1, length2 = array == null ? 0 : array.length;
    while (++index2 < length2) {
      if (comparator(value, array[index2])) {
        return true;
      }
    }
    return false;
  }
  _arrayIncludesWith = arrayIncludesWith;
  return _arrayIncludesWith;
}
var _cacheHas;
var hasRequired_cacheHas;
function require_cacheHas() {
  if (hasRequired_cacheHas) return _cacheHas;
  hasRequired_cacheHas = 1;
  function cacheHas(cache, key) {
    return cache.has(key);
  }
  _cacheHas = cacheHas;
  return _cacheHas;
}
var _Set;
var hasRequired_Set;
function require_Set() {
  if (hasRequired_Set) return _Set;
  hasRequired_Set = 1;
  var getNative = require_getNative(), root = require_root();
  var Set2 = getNative(root, "Set");
  _Set = Set2;
  return _Set;
}
var noop_1;
var hasRequiredNoop;
function requireNoop() {
  if (hasRequiredNoop) return noop_1;
  hasRequiredNoop = 1;
  function noop2() {
  }
  noop_1 = noop2;
  return noop_1;
}
var _setToArray;
var hasRequired_setToArray;
function require_setToArray() {
  if (hasRequired_setToArray) return _setToArray;
  hasRequired_setToArray = 1;
  function setToArray(set) {
    var index2 = -1, result = Array(set.size);
    set.forEach(function(value) {
      result[++index2] = value;
    });
    return result;
  }
  _setToArray = setToArray;
  return _setToArray;
}
var _createSet;
var hasRequired_createSet;
function require_createSet() {
  if (hasRequired_createSet) return _createSet;
  hasRequired_createSet = 1;
  var Set2 = require_Set(), noop2 = requireNoop(), setToArray = require_setToArray();
  var INFINITY = 1 / 0;
  var createSet = !(Set2 && 1 / setToArray(new Set2([, -0]))[1] == INFINITY) ? noop2 : function(values) {
    return new Set2(values);
  };
  _createSet = createSet;
  return _createSet;
}
var _baseUniq;
var hasRequired_baseUniq;
function require_baseUniq() {
  if (hasRequired_baseUniq) return _baseUniq;
  hasRequired_baseUniq = 1;
  var SetCache = require_SetCache(), arrayIncludes = require_arrayIncludes(), arrayIncludesWith = require_arrayIncludesWith(), cacheHas = require_cacheHas(), createSet = require_createSet(), setToArray = require_setToArray();
  var LARGE_ARRAY_SIZE = 200;
  function baseUniq(array, iteratee, comparator) {
    var index2 = -1, includes = arrayIncludes, length2 = array.length, isCommon = true, result = [], seen = result;
    if (comparator) {
      isCommon = false;
      includes = arrayIncludesWith;
    } else if (length2 >= LARGE_ARRAY_SIZE) {
      var set = iteratee ? null : createSet(array);
      if (set) {
        return setToArray(set);
      }
      isCommon = false;
      includes = cacheHas;
      seen = new SetCache();
    } else {
      seen = iteratee ? [] : result;
    }
    outer:
      while (++index2 < length2) {
        var value = array[index2], computed = iteratee ? iteratee(value) : value;
        value = comparator || value !== 0 ? value : 0;
        if (isCommon && computed === computed) {
          var seenIndex = seen.length;
          while (seenIndex--) {
            if (seen[seenIndex] === computed) {
              continue outer;
            }
          }
          if (iteratee) {
            seen.push(computed);
          }
          result.push(value);
        } else if (!includes(seen, computed, comparator)) {
          if (seen !== result) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
    return result;
  }
  _baseUniq = baseUniq;
  return _baseUniq;
}
var uniq_1;
var hasRequiredUniq;
function requireUniq() {
  if (hasRequiredUniq) return uniq_1;
  hasRequiredUniq = 1;
  var baseUniq = require_baseUniq();
  function uniq(array) {
    return array && array.length ? baseUniq(array) : [];
  }
  uniq_1 = uniq;
  return uniq_1;
}
var uniqExports = requireUniq();
const l$2 = /* @__PURE__ */ getDefaultExportFromCjs(uniqExports);
let updateQueue = makeQueue();
const raf = (fn2) => schedule(fn2, updateQueue);
let writeQueue = makeQueue();
raf.write = (fn2) => schedule(fn2, writeQueue);
let onStartQueue = makeQueue();
raf.onStart = (fn2) => schedule(fn2, onStartQueue);
let onFrameQueue = makeQueue();
raf.onFrame = (fn2) => schedule(fn2, onFrameQueue);
let onFinishQueue = makeQueue();
raf.onFinish = (fn2) => schedule(fn2, onFinishQueue);
let timeouts = [];
raf.setTimeout = (handler, ms) => {
  let time = raf.now() + ms;
  let cancel = () => {
    let i2 = timeouts.findIndex((t2) => t2.cancel == cancel);
    if (~i2) timeouts.splice(i2, 1);
    pendingCount -= ~i2 ? 1 : 0;
  };
  let timeout = {
    time,
    handler,
    cancel
  };
  timeouts.splice(findTimeout(time), 0, timeout);
  pendingCount += 1;
  start();
  return timeout;
};
let findTimeout = (time) => ~(~timeouts.findIndex((t2) => t2.time > time) || ~timeouts.length);
raf.cancel = (fn2) => {
  onStartQueue.delete(fn2);
  onFrameQueue.delete(fn2);
  updateQueue.delete(fn2);
  writeQueue.delete(fn2);
  onFinishQueue.delete(fn2);
};
raf.sync = (fn2) => {
  sync = true;
  raf.batchedUpdates(fn2);
  sync = false;
};
raf.throttle = (fn2) => {
  let lastArgs;
  function queuedFn() {
    try {
      fn2(...lastArgs);
    } finally {
      lastArgs = null;
    }
  }
  function throttled(...args) {
    lastArgs = args;
    raf.onStart(queuedFn);
  }
  throttled.handler = fn2;
  throttled.cancel = () => {
    onStartQueue.delete(queuedFn);
    lastArgs = null;
  };
  return throttled;
};
let nativeRaf = typeof window != "undefined" ? window.requestAnimationFrame : () => {
};
raf.use = (impl) => nativeRaf = impl;
raf.now = typeof performance != "undefined" ? () => performance.now() : Date.now;
raf.batchedUpdates = (fn2) => fn2();
raf.catch = console.error;
raf.frameLoop = "always";
raf.advance = () => {
  if (raf.frameLoop !== "demand") {
    console.warn("Cannot call the manual advancement of rafz whilst frameLoop is not set as demand");
  } else {
    update();
  }
};
let ts = -1;
let pendingCount = 0;
let sync = false;
function schedule(fn2, queue) {
  if (sync) {
    queue.delete(fn2);
    fn2(0);
  } else {
    queue.add(fn2);
    start();
  }
}
function start() {
  if (ts < 0) {
    ts = 0;
    if (raf.frameLoop !== "demand") {
      nativeRaf(loop);
    }
  }
}
function stop() {
  ts = -1;
}
function loop() {
  if (~ts) {
    nativeRaf(loop);
    raf.batchedUpdates(update);
  }
}
function update() {
  let prevTs = ts;
  ts = raf.now();
  let count = findTimeout(ts);
  if (count) {
    eachSafely(timeouts.splice(0, count), (t2) => t2.handler());
    pendingCount -= count;
  }
  onStartQueue.flush();
  updateQueue.flush(prevTs ? Math.min(64, ts - prevTs) : 16.667);
  onFrameQueue.flush();
  writeQueue.flush();
  onFinishQueue.flush();
  if (!pendingCount) {
    stop();
  }
}
function makeQueue() {
  let next = /* @__PURE__ */ new Set();
  let current = next;
  return {
    add(fn2) {
      pendingCount += current == next && !next.has(fn2) ? 1 : 0;
      next.add(fn2);
    },
    delete(fn2) {
      pendingCount -= current == next && next.has(fn2) ? 1 : 0;
      return next.delete(fn2);
    },
    flush(arg) {
      if (current.size) {
        next = /* @__PURE__ */ new Set();
        pendingCount -= current.size;
        eachSafely(current, (fn2) => fn2(arg) && next.add(fn2));
        pendingCount += next.size;
        current = next;
      }
    }
  };
}
function eachSafely(values, each2) {
  values.forEach((value) => {
    try {
      each2(value);
    } catch (e2) {
      raf.catch(e2);
    }
  });
}
function noop() {
}
const defineHidden = (obj, key, value) => Object.defineProperty(obj, key, {
  value,
  writable: true,
  configurable: true
});
const is = {
  arr: Array.isArray,
  obj: (a2) => !!a2 && a2.constructor.name === "Object",
  fun: (a2) => typeof a2 === "function",
  str: (a2) => typeof a2 === "string",
  num: (a2) => typeof a2 === "number",
  und: (a2) => a2 === void 0
};
function isEqual(a2, b2) {
  if (is.arr(a2)) {
    if (!is.arr(b2) || a2.length !== b2.length) return false;
    for (let i2 = 0; i2 < a2.length; i2++) {
      if (a2[i2] !== b2[i2]) return false;
    }
    return true;
  }
  return a2 === b2;
}
const each = (obj, fn2) => obj.forEach(fn2);
function eachProp(obj, fn2, ctx2) {
  if (is.arr(obj)) {
    for (let i2 = 0; i2 < obj.length; i2++) {
      fn2.call(ctx2, obj[i2], `${i2}`);
    }
    return;
  }
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      fn2.call(ctx2, obj[key], key);
    }
  }
}
const toArray = (a2) => is.und(a2) ? [] : is.arr(a2) ? a2 : [a2];
function flush(queue, iterator) {
  if (queue.size) {
    const items = Array.from(queue);
    queue.clear();
    each(items, iterator);
  }
}
const flushCalls = (queue, ...args) => flush(queue, (fn2) => fn2(...args));
const isSSR = () => typeof window === "undefined" || !window.navigator || /ServerSideRendering|^Deno\//.test(window.navigator.userAgent);
let createStringInterpolator$1;
let to$1;
let colors$1 = null;
let skipAnimation = false;
let willAdvance = noop;
const assign = (globals2) => {
  if (globals2.to) to$1 = globals2.to;
  if (globals2.now) raf.now = globals2.now;
  if (globals2.colors !== void 0) colors$1 = globals2.colors;
  if (globals2.skipAnimation != null) skipAnimation = globals2.skipAnimation;
  if (globals2.createStringInterpolator) createStringInterpolator$1 = globals2.createStringInterpolator;
  if (globals2.requestAnimationFrame) raf.use(globals2.requestAnimationFrame);
  if (globals2.batchedUpdates) raf.batchedUpdates = globals2.batchedUpdates;
  if (globals2.willAdvance) willAdvance = globals2.willAdvance;
  if (globals2.frameLoop) raf.frameLoop = globals2.frameLoop;
};
var globals = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  get createStringInterpolator() {
    return createStringInterpolator$1;
  },
  get to() {
    return to$1;
  },
  get colors() {
    return colors$1;
  },
  get skipAnimation() {
    return skipAnimation;
  },
  get willAdvance() {
    return willAdvance;
  },
  assign
});
const startQueue = /* @__PURE__ */ new Set();
let currentFrame = [];
let prevFrame = [];
let priority = 0;
const frameLoop = {
  get idle() {
    return !startQueue.size && !currentFrame.length;
  },
  start(animation) {
    if (priority > animation.priority) {
      startQueue.add(animation);
      raf.onStart(flushStartQueue);
    } else {
      startSafely(animation);
      raf(advance);
    }
  },
  advance,
  sort(animation) {
    if (priority) {
      raf.onFrame(() => frameLoop.sort(animation));
    } else {
      const prevIndex = currentFrame.indexOf(animation);
      if (~prevIndex) {
        currentFrame.splice(prevIndex, 1);
        startUnsafely(animation);
      }
    }
  },
  clear() {
    currentFrame = [];
    startQueue.clear();
  }
};
function flushStartQueue() {
  startQueue.forEach(startSafely);
  startQueue.clear();
  raf(advance);
}
function startSafely(animation) {
  if (!currentFrame.includes(animation)) startUnsafely(animation);
}
function startUnsafely(animation) {
  currentFrame.splice(findIndex(currentFrame, (other) => other.priority > animation.priority), 0, animation);
}
function advance(dt) {
  const nextFrame = prevFrame;
  for (let i2 = 0; i2 < currentFrame.length; i2++) {
    const animation = currentFrame[i2];
    priority = animation.priority;
    if (!animation.idle) {
      willAdvance(animation);
      animation.advance(dt);
      if (!animation.idle) {
        nextFrame.push(animation);
      }
    }
  }
  priority = 0;
  prevFrame = currentFrame;
  prevFrame.length = 0;
  currentFrame = nextFrame;
  return currentFrame.length > 0;
}
function findIndex(arr, test) {
  const index2 = arr.findIndex(test);
  return index2 < 0 ? arr.length : index2;
}
const colors$2 = {
  transparent: 0,
  aliceblue: 4042850303,
  antiquewhite: 4209760255,
  aqua: 16777215,
  aquamarine: 2147472639,
  azure: 4043309055,
  beige: 4126530815,
  bisque: 4293182719,
  black: 255,
  blanchedalmond: 4293643775,
  blue: 65535,
  blueviolet: 2318131967,
  brown: 2771004159,
  burlywood: 3736635391,
  burntsienna: 3934150143,
  cadetblue: 1604231423,
  chartreuse: 2147418367,
  chocolate: 3530104575,
  coral: 4286533887,
  cornflowerblue: 1687547391,
  cornsilk: 4294499583,
  crimson: 3692313855,
  cyan: 16777215,
  darkblue: 35839,
  darkcyan: 9145343,
  darkgoldenrod: 3095792639,
  darkgray: 2846468607,
  darkgreen: 6553855,
  darkgrey: 2846468607,
  darkkhaki: 3182914559,
  darkmagenta: 2332068863,
  darkolivegreen: 1433087999,
  darkorange: 4287365375,
  darkorchid: 2570243327,
  darkred: 2332033279,
  darksalmon: 3918953215,
  darkseagreen: 2411499519,
  darkslateblue: 1211993087,
  darkslategray: 793726975,
  darkslategrey: 793726975,
  darkturquoise: 13554175,
  darkviolet: 2483082239,
  deeppink: 4279538687,
  deepskyblue: 12582911,
  dimgray: 1768516095,
  dimgrey: 1768516095,
  dodgerblue: 512819199,
  firebrick: 2988581631,
  floralwhite: 4294635775,
  forestgreen: 579543807,
  fuchsia: 4278255615,
  gainsboro: 3705462015,
  ghostwhite: 4177068031,
  gold: 4292280575,
  goldenrod: 3668254975,
  gray: 2155905279,
  green: 8388863,
  greenyellow: 2919182335,
  grey: 2155905279,
  honeydew: 4043305215,
  hotpink: 4285117695,
  indianred: 3445382399,
  indigo: 1258324735,
  ivory: 4294963455,
  khaki: 4041641215,
  lavender: 3873897215,
  lavenderblush: 4293981695,
  lawngreen: 2096890111,
  lemonchiffon: 4294626815,
  lightblue: 2916673279,
  lightcoral: 4034953471,
  lightcyan: 3774873599,
  lightgoldenrodyellow: 4210742015,
  lightgray: 3553874943,
  lightgreen: 2431553791,
  lightgrey: 3553874943,
  lightpink: 4290167295,
  lightsalmon: 4288707327,
  lightseagreen: 548580095,
  lightskyblue: 2278488831,
  lightslategray: 2005441023,
  lightslategrey: 2005441023,
  lightsteelblue: 2965692159,
  lightyellow: 4294959359,
  lime: 16711935,
  limegreen: 852308735,
  linen: 4210091775,
  magenta: 4278255615,
  maroon: 2147483903,
  mediumaquamarine: 1724754687,
  mediumblue: 52735,
  mediumorchid: 3126187007,
  mediumpurple: 2473647103,
  mediumseagreen: 1018393087,
  mediumslateblue: 2070474495,
  mediumspringgreen: 16423679,
  mediumturquoise: 1221709055,
  mediumvioletred: 3340076543,
  midnightblue: 421097727,
  mintcream: 4127193855,
  mistyrose: 4293190143,
  moccasin: 4293178879,
  navajowhite: 4292783615,
  navy: 33023,
  oldlace: 4260751103,
  olive: 2155872511,
  olivedrab: 1804477439,
  orange: 4289003775,
  orangered: 4282712319,
  orchid: 3664828159,
  palegoldenrod: 4008225535,
  palegreen: 2566625535,
  paleturquoise: 2951671551,
  palevioletred: 3681588223,
  papayawhip: 4293907967,
  peachpuff: 4292524543,
  peru: 3448061951,
  pink: 4290825215,
  plum: 3718307327,
  powderblue: 2967529215,
  purple: 2147516671,
  rebeccapurple: 1714657791,
  red: 4278190335,
  rosybrown: 3163525119,
  royalblue: 1097458175,
  saddlebrown: 2336560127,
  salmon: 4202722047,
  sandybrown: 4104413439,
  seagreen: 780883967,
  seashell: 4294307583,
  sienna: 2689740287,
  silver: 3233857791,
  skyblue: 2278484991,
  slateblue: 1784335871,
  slategray: 1887473919,
  slategrey: 1887473919,
  snow: 4294638335,
  springgreen: 16744447,
  steelblue: 1182971135,
  tan: 3535047935,
  teal: 8421631,
  thistle: 3636451583,
  tomato: 4284696575,
  turquoise: 1088475391,
  violet: 4001558271,
  wheat: 4125012991,
  white: 4294967295,
  whitesmoke: 4126537215,
  yellow: 4294902015,
  yellowgreen: 2597139199
};
const NUMBER = "[-+]?\\d*\\.?\\d+";
const PERCENTAGE = NUMBER + "%";
function call(...parts) {
  return "\\(\\s*(" + parts.join(")\\s*,\\s*(") + ")\\s*\\)";
}
const rgb = new RegExp("rgb" + call(NUMBER, NUMBER, NUMBER));
const rgba = new RegExp("rgba" + call(NUMBER, NUMBER, NUMBER, NUMBER));
const hsl = new RegExp("hsl" + call(NUMBER, PERCENTAGE, PERCENTAGE));
const hsla = new RegExp("hsla" + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER));
const hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
const hex4 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
const hex6 = /^#([0-9a-fA-F]{6})$/;
const hex8 = /^#([0-9a-fA-F]{8})$/;
function normalizeColor(color) {
  let match;
  if (typeof color === "number") {
    return color >>> 0 === color && color >= 0 && color <= 4294967295 ? color : null;
  }
  if (match = hex6.exec(color)) return parseInt(match[1] + "ff", 16) >>> 0;
  if (colors$1 && colors$1[color] !== void 0) {
    return colors$1[color];
  }
  if (match = rgb.exec(color)) {
    return (parse255(match[1]) << 24 | parse255(match[2]) << 16 | parse255(match[3]) << 8 | 255) >>> 0;
  }
  if (match = rgba.exec(color)) {
    return (parse255(match[1]) << 24 | parse255(match[2]) << 16 | parse255(match[3]) << 8 | parse1(match[4])) >>> 0;
  }
  if (match = hex3.exec(color)) {
    return parseInt(match[1] + match[1] + match[2] + match[2] + match[3] + match[3] + "ff", 16) >>> 0;
  }
  if (match = hex8.exec(color)) return parseInt(match[1], 16) >>> 0;
  if (match = hex4.exec(color)) {
    return parseInt(match[1] + match[1] + match[2] + match[2] + match[3] + match[3] + match[4] + match[4], 16) >>> 0;
  }
  if (match = hsl.exec(color)) {
    return (hslToRgb(parse360(match[1]), parsePercentage(match[2]), parsePercentage(match[3])) | 255) >>> 0;
  }
  if (match = hsla.exec(color)) {
    return (hslToRgb(parse360(match[1]), parsePercentage(match[2]), parsePercentage(match[3])) | parse1(match[4])) >>> 0;
  }
  return null;
}
function hue2rgb(p2, q2, t2) {
  if (t2 < 0) t2 += 1;
  if (t2 > 1) t2 -= 1;
  if (t2 < 1 / 6) return p2 + (q2 - p2) * 6 * t2;
  if (t2 < 1 / 2) return q2;
  if (t2 < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t2) * 6;
  return p2;
}
function hslToRgb(h2, s2, l2) {
  const q2 = l2 < 0.5 ? l2 * (1 + s2) : l2 + s2 - l2 * s2;
  const p2 = 2 * l2 - q2;
  const r2 = hue2rgb(p2, q2, h2 + 1 / 3);
  const g2 = hue2rgb(p2, q2, h2);
  const b2 = hue2rgb(p2, q2, h2 - 1 / 3);
  return Math.round(r2 * 255) << 24 | Math.round(g2 * 255) << 16 | Math.round(b2 * 255) << 8;
}
function parse255(str) {
  const int = parseInt(str, 10);
  if (int < 0) return 0;
  if (int > 255) return 255;
  return int;
}
function parse360(str) {
  const int = parseFloat(str);
  return (int % 360 + 360) % 360 / 360;
}
function parse1(str) {
  const num = parseFloat(str);
  if (num < 0) return 0;
  if (num > 1) return 255;
  return Math.round(num * 255);
}
function parsePercentage(str) {
  const int = parseFloat(str);
  if (int < 0) return 0;
  if (int > 100) return 1;
  return int / 100;
}
function colorToRgba(input) {
  let int32Color = normalizeColor(input);
  if (int32Color === null) return input;
  int32Color = int32Color || 0;
  let r2 = (int32Color & 4278190080) >>> 24;
  let g2 = (int32Color & 16711680) >>> 16;
  let b2 = (int32Color & 65280) >>> 8;
  let a2 = (int32Color & 255) / 255;
  return `rgba(${r2}, ${g2}, ${b2}, ${a2})`;
}
const createInterpolator = (range2, output, extrapolate) => {
  if (is.fun(range2)) {
    return range2;
  }
  if (is.arr(range2)) {
    return createInterpolator({
      range: range2,
      output,
      extrapolate
    });
  }
  if (is.str(range2.output[0])) {
    return createStringInterpolator$1(range2);
  }
  const config2 = range2;
  const outputRange = config2.output;
  const inputRange = config2.range || [0, 1];
  const extrapolateLeft = config2.extrapolateLeft || config2.extrapolate || "extend";
  const extrapolateRight = config2.extrapolateRight || config2.extrapolate || "extend";
  const easing = config2.easing || ((t2) => t2);
  return (input) => {
    const range3 = findRange(input, inputRange);
    return interpolate(input, inputRange[range3], inputRange[range3 + 1], outputRange[range3], outputRange[range3 + 1], easing, extrapolateLeft, extrapolateRight, config2.map);
  };
};
function interpolate(input, inputMin, inputMax, outputMin, outputMax, easing, extrapolateLeft, extrapolateRight, map2) {
  let result = map2 ? map2(input) : input;
  if (result < inputMin) {
    if (extrapolateLeft === "identity") return result;
    else if (extrapolateLeft === "clamp") result = inputMin;
  }
  if (result > inputMax) {
    if (extrapolateRight === "identity") return result;
    else if (extrapolateRight === "clamp") result = inputMax;
  }
  if (outputMin === outputMax) return outputMin;
  if (inputMin === inputMax) return input <= inputMin ? outputMin : outputMax;
  if (inputMin === -Infinity) result = -result;
  else if (inputMax === Infinity) result = result - inputMin;
  else result = (result - inputMin) / (inputMax - inputMin);
  result = easing(result);
  if (outputMin === -Infinity) result = -result;
  else if (outputMax === Infinity) result = result + outputMin;
  else result = result * (outputMax - outputMin) + outputMin;
  return result;
}
function findRange(input, inputRange) {
  for (var i2 = 1; i2 < inputRange.length - 1; ++i2) if (inputRange[i2] >= input) break;
  return i2 - 1;
}
function _extends$2() {
  _extends$2 = Object.assign || function(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = arguments[i2];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$2.apply(this, arguments);
}
const $get = /* @__PURE__ */ Symbol.for("FluidValue.get");
const $observers = /* @__PURE__ */ Symbol.for("FluidValue.observers");
const hasFluidValue = (arg) => Boolean(arg && arg[$get]);
const getFluidValue = (arg) => arg && arg[$get] ? arg[$get]() : arg;
const getFluidObservers = (target) => target[$observers] || null;
function callFluidObserver(observer, event) {
  if (observer.eventObserved) {
    observer.eventObserved(event);
  } else {
    observer(event);
  }
}
function callFluidObservers(target, event) {
  let observers = target[$observers];
  if (observers) {
    observers.forEach((observer) => {
      callFluidObserver(observer, event);
    });
  }
}
class FluidValue {
  constructor(get) {
    this[$get] = void 0;
    this[$observers] = void 0;
    if (!get && !(get = this.get)) {
      throw Error("Unknown getter");
    }
    setFluidGetter(this, get);
  }
}
const setFluidGetter = (target, get) => setHidden(target, $get, get);
function addFluidObserver(target, observer) {
  if (target[$get]) {
    let observers = target[$observers];
    if (!observers) {
      setHidden(target, $observers, observers = /* @__PURE__ */ new Set());
    }
    if (!observers.has(observer)) {
      observers.add(observer);
      if (target.observerAdded) {
        target.observerAdded(observers.size, observer);
      }
    }
  }
  return observer;
}
function removeFluidObserver(target, observer) {
  let observers = target[$observers];
  if (observers && observers.has(observer)) {
    const count = observers.size - 1;
    if (count) {
      observers.delete(observer);
    } else {
      target[$observers] = null;
    }
    if (target.observerRemoved) {
      target.observerRemoved(count, observer);
    }
  }
}
const setHidden = (target, key, value) => Object.defineProperty(target, key, {
  value,
  writable: true,
  configurable: true
});
const numberRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
const colorRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gi;
const unitRegex = new RegExp(`(${numberRegex.source})(%|[a-z]+)`, "i");
const rgbaRegex = /rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi;
const cssVariableRegex = /var\((--[a-zA-Z0-9-_]+),? ?([a-zA-Z0-9 ()%#.,-]+)?\)/;
const variableToRgba = (input) => {
  const [token, fallback] = parseCSSVariable(input);
  if (!token || isSSR()) {
    return input;
  }
  const value = window.getComputedStyle(document.documentElement).getPropertyValue(token);
  if (value) {
    return value.trim();
  } else if (fallback && fallback.startsWith("--")) {
    const _value = window.getComputedStyle(document.documentElement).getPropertyValue(fallback);
    if (_value) {
      return _value;
    } else {
      return input;
    }
  } else if (fallback && cssVariableRegex.test(fallback)) {
    return variableToRgba(fallback);
  } else if (fallback) {
    return fallback;
  }
  return input;
};
const parseCSSVariable = (current) => {
  const match = cssVariableRegex.exec(current);
  if (!match) return [,];
  const [, token, fallback] = match;
  return [token, fallback];
};
let namedColorRegex;
const rgbaRound = (_2, p1, p2, p3, p4) => `rgba(${Math.round(p1)}, ${Math.round(p2)}, ${Math.round(p3)}, ${p4})`;
const createStringInterpolator = (config2) => {
  if (!namedColorRegex) namedColorRegex = colors$1 ? new RegExp(`(${Object.keys(colors$1).join("|")})(?!\\w)`, "g") : /^\b$/;
  const output = config2.output.map((value) => {
    return getFluidValue(value).replace(cssVariableRegex, variableToRgba).replace(colorRegex, colorToRgba).replace(namedColorRegex, colorToRgba);
  });
  const keyframes = output.map((value) => value.match(numberRegex).map(Number));
  const outputRanges = keyframes[0].map((_2, i2) => keyframes.map((values) => {
    if (!(i2 in values)) {
      throw Error('The arity of each "output" value must be equal');
    }
    return values[i2];
  }));
  const interpolators = outputRanges.map((output2) => createInterpolator(_extends$2({}, config2, {
    output: output2
  })));
  return (input) => {
    var _output$find;
    const missingUnit = !unitRegex.test(output[0]) && ((_output$find = output.find((value) => unitRegex.test(value))) == null ? void 0 : _output$find.replace(numberRegex, ""));
    let i2 = 0;
    return output[0].replace(numberRegex, () => `${interpolators[i2++](input)}${missingUnit || ""}`).replace(rgbaRegex, rgbaRound);
  };
};
const prefix = "react-spring: ";
const once = (fn2) => {
  const func = fn2;
  let called = false;
  if (typeof func != "function") {
    throw new TypeError(`${prefix}once requires a function parameter`);
  }
  return (...args) => {
    if (!called) {
      func(...args);
      called = true;
    }
  };
};
const warnInterpolate = once(console.warn);
function deprecateInterpolate() {
  warnInterpolate(`${prefix}The "interpolate" function is deprecated in v9 (use "to" instead)`);
}
const warnDirectCall = once(console.warn);
function deprecateDirectCall() {
  warnDirectCall(`${prefix}Directly calling start instead of using the api object is deprecated in v9 (use ".start" instead), this will be removed in later 0.X.0 versions`);
}
function isAnimatedString(value) {
  return is.str(value) && (value[0] == "#" || /\d/.test(value) || !isSSR() && cssVariableRegex.test(value) || value in (colors$1 || {}));
}
const useLayoutEffect = typeof window !== "undefined" && window.document && window.document.createElement ? reactExports.useLayoutEffect : reactExports.useEffect;
const useIsMounted = () => {
  const isMounted = reactExports.useRef(false);
  useLayoutEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
};
function useForceUpdate() {
  const update2 = reactExports.useState()[1];
  const isMounted = useIsMounted();
  return () => {
    if (isMounted.current) {
      update2(Math.random());
    }
  };
}
function useMemoOne(getResult, inputs) {
  const [initial] = reactExports.useState(() => ({
    inputs,
    result: getResult()
  }));
  const committed = reactExports.useRef();
  const prevCache = committed.current;
  let cache = prevCache;
  if (cache) {
    const useCache = Boolean(inputs && cache.inputs && areInputsEqual(inputs, cache.inputs));
    if (!useCache) {
      cache = {
        inputs,
        result: getResult()
      };
    }
  } else {
    cache = initial;
  }
  reactExports.useEffect(() => {
    committed.current = cache;
    if (prevCache == initial) {
      initial.inputs = initial.result = void 0;
    }
  }, [cache]);
  return cache.result;
}
function areInputsEqual(next, prev) {
  if (next.length !== prev.length) {
    return false;
  }
  for (let i2 = 0; i2 < next.length; i2++) {
    if (next[i2] !== prev[i2]) {
      return false;
    }
  }
  return true;
}
const useOnce = (effect) => reactExports.useEffect(effect, emptyDeps);
const emptyDeps = [];
function usePrev(value) {
  const prevRef = reactExports.useRef();
  reactExports.useEffect(() => {
    prevRef.current = value;
  });
  return prevRef.current;
}
const $node = /* @__PURE__ */ Symbol.for("Animated:node");
const isAnimated = (value) => !!value && value[$node] === value;
const getAnimated = (owner) => owner && owner[$node];
const setAnimated = (owner, node) => defineHidden(owner, $node, node);
const getPayload = (owner) => owner && owner[$node] && owner[$node].getPayload();
class Animated {
  constructor() {
    this.payload = void 0;
    setAnimated(this, this);
  }
  getPayload() {
    return this.payload || [];
  }
}
class AnimatedValue extends Animated {
  constructor(_value) {
    super();
    this.done = true;
    this.elapsedTime = void 0;
    this.lastPosition = void 0;
    this.lastVelocity = void 0;
    this.v0 = void 0;
    this.durationProgress = 0;
    this._value = _value;
    if (is.num(this._value)) {
      this.lastPosition = this._value;
    }
  }
  static create(value) {
    return new AnimatedValue(value);
  }
  getPayload() {
    return [this];
  }
  getValue() {
    return this._value;
  }
  setValue(value, step) {
    if (is.num(value)) {
      this.lastPosition = value;
      if (step) {
        value = Math.round(value / step) * step;
        if (this.done) {
          this.lastPosition = value;
        }
      }
    }
    if (this._value === value) {
      return false;
    }
    this._value = value;
    return true;
  }
  reset() {
    const {
      done
    } = this;
    this.done = false;
    if (is.num(this._value)) {
      this.elapsedTime = 0;
      this.durationProgress = 0;
      this.lastPosition = this._value;
      if (done) this.lastVelocity = null;
      this.v0 = null;
    }
  }
}
class AnimatedString extends AnimatedValue {
  constructor(value) {
    super(0);
    this._string = null;
    this._toString = void 0;
    this._toString = createInterpolator({
      output: [value, value]
    });
  }
  static create(value) {
    return new AnimatedString(value);
  }
  getValue() {
    let value = this._string;
    return value == null ? this._string = this._toString(this._value) : value;
  }
  setValue(value) {
    if (is.str(value)) {
      if (value == this._string) {
        return false;
      }
      this._string = value;
      this._value = 1;
    } else if (super.setValue(value)) {
      this._string = null;
    } else {
      return false;
    }
    return true;
  }
  reset(goal) {
    if (goal) {
      this._toString = createInterpolator({
        output: [this.getValue(), goal]
      });
    }
    this._value = 0;
    super.reset();
  }
}
const TreeContext = {
  dependencies: null
};
class AnimatedObject extends Animated {
  constructor(source) {
    super();
    this.source = source;
    this.setValue(source);
  }
  getValue(animated2) {
    const values = {};
    eachProp(this.source, (source, key) => {
      if (isAnimated(source)) {
        values[key] = source.getValue(animated2);
      } else if (hasFluidValue(source)) {
        values[key] = getFluidValue(source);
      } else if (!animated2) {
        values[key] = source;
      }
    });
    return values;
  }
  setValue(source) {
    this.source = source;
    this.payload = this._makePayload(source);
  }
  reset() {
    if (this.payload) {
      each(this.payload, (node) => node.reset());
    }
  }
  _makePayload(source) {
    if (source) {
      const payload = /* @__PURE__ */ new Set();
      eachProp(source, this._addToPayload, payload);
      return Array.from(payload);
    }
  }
  _addToPayload(source) {
    if (TreeContext.dependencies && hasFluidValue(source)) {
      TreeContext.dependencies.add(source);
    }
    const payload = getPayload(source);
    if (payload) {
      each(payload, (node) => this.add(node));
    }
  }
}
class AnimatedArray extends AnimatedObject {
  constructor(source) {
    super(source);
  }
  static create(source) {
    return new AnimatedArray(source);
  }
  getValue() {
    return this.source.map((node) => node.getValue());
  }
  setValue(source) {
    const payload = this.getPayload();
    if (source.length == payload.length) {
      return payload.map((node, i2) => node.setValue(source[i2])).some(Boolean);
    }
    super.setValue(source.map(makeAnimated));
    return true;
  }
}
function makeAnimated(value) {
  const nodeType = isAnimatedString(value) ? AnimatedString : AnimatedValue;
  return nodeType.create(value);
}
function getAnimatedType(value) {
  const parentNode = getAnimated(value);
  return parentNode ? parentNode.constructor : is.arr(value) ? AnimatedArray : isAnimatedString(value) ? AnimatedString : AnimatedValue;
}
function _extends$1() {
  _extends$1 = Object.assign || function(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = arguments[i2];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$1.apply(this, arguments);
}
const withAnimated = (Component, host2) => {
  const hasInstance = !is.fun(Component) || Component.prototype && Component.prototype.isReactComponent;
  return reactExports.forwardRef((givenProps, givenRef) => {
    const instanceRef = reactExports.useRef(null);
    const ref = hasInstance && reactExports.useCallback((value) => {
      instanceRef.current = updateRef(givenRef, value);
    }, [givenRef]);
    const [props, deps] = getAnimatedState(givenProps, host2);
    const forceUpdate = useForceUpdate();
    const callback = () => {
      const instance = instanceRef.current;
      if (hasInstance && !instance) {
        return;
      }
      const didUpdate = instance ? host2.applyAnimatedValues(instance, props.getValue(true)) : false;
      if (didUpdate === false) {
        forceUpdate();
      }
    };
    const observer = new PropsObserver(callback, deps);
    const observerRef = reactExports.useRef();
    useLayoutEffect(() => {
      observerRef.current = observer;
      each(deps, (dep) => addFluidObserver(dep, observer));
      return () => {
        if (observerRef.current) {
          each(observerRef.current.deps, (dep) => removeFluidObserver(dep, observerRef.current));
          raf.cancel(observerRef.current.update);
        }
      };
    });
    reactExports.useEffect(callback, []);
    useOnce(() => () => {
      const observer2 = observerRef.current;
      each(observer2.deps, (dep) => removeFluidObserver(dep, observer2));
    });
    const usedProps = host2.getComponentProps(props.getValue());
    return reactExports.createElement(Component, _extends$1({}, usedProps, {
      ref
    }));
  });
};
class PropsObserver {
  constructor(update2, deps) {
    this.update = update2;
    this.deps = deps;
  }
  eventObserved(event) {
    if (event.type == "change") {
      raf.write(this.update);
    }
  }
}
function getAnimatedState(props, host2) {
  const dependencies = /* @__PURE__ */ new Set();
  TreeContext.dependencies = dependencies;
  if (props.style) props = _extends$1({}, props, {
    style: host2.createAnimatedStyle(props.style)
  });
  props = new AnimatedObject(props);
  TreeContext.dependencies = null;
  return [props, dependencies];
}
function updateRef(ref, value) {
  if (ref) {
    if (is.fun(ref)) ref(value);
    else ref.current = value;
  }
  return value;
}
const cacheKey = /* @__PURE__ */ Symbol.for("AnimatedComponent");
const createHost = (components, {
  applyAnimatedValues: _applyAnimatedValues = () => false,
  createAnimatedStyle: _createAnimatedStyle = (style) => new AnimatedObject(style),
  getComponentProps: _getComponentProps = (props) => props
} = {}) => {
  const hostConfig = {
    applyAnimatedValues: _applyAnimatedValues,
    createAnimatedStyle: _createAnimatedStyle,
    getComponentProps: _getComponentProps
  };
  const animated2 = (Component) => {
    const displayName = getDisplayName(Component) || "Anonymous";
    if (is.str(Component)) {
      Component = animated2[Component] || (animated2[Component] = withAnimated(Component, hostConfig));
    } else {
      Component = Component[cacheKey] || (Component[cacheKey] = withAnimated(Component, hostConfig));
    }
    Component.displayName = `Animated(${displayName})`;
    return Component;
  };
  eachProp(components, (Component, key) => {
    if (is.arr(components)) {
      key = getDisplayName(Component);
    }
    animated2[key] = animated2(Component);
  });
  return {
    animated: animated2
  };
};
const getDisplayName = (arg) => is.str(arg) ? arg : arg && is.str(arg.displayName) ? arg.displayName : is.fun(arg) && arg.name || null;
function _extends() {
  _extends = Object.assign || function(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = arguments[i2];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function callProp(value, ...args) {
  return is.fun(value) ? value(...args) : value;
}
const matchProp = (value, key) => value === true || !!(key && value && (is.fun(value) ? value(key) : toArray(value).includes(key)));
const resolveProp = (prop, key) => is.obj(prop) ? key && prop[key] : prop;
const getDefaultProp = (props, key) => props.default === true ? props[key] : props.default ? props.default[key] : void 0;
const noopTransform = (value) => value;
const getDefaultProps = (props, transform2 = noopTransform) => {
  let keys = DEFAULT_PROPS;
  if (props.default && props.default !== true) {
    props = props.default;
    keys = Object.keys(props);
  }
  const defaults2 = {};
  for (const key of keys) {
    const value = transform2(props[key], key);
    if (!is.und(value)) {
      defaults2[key] = value;
    }
  }
  return defaults2;
};
const DEFAULT_PROPS = ["config", "onProps", "onStart", "onChange", "onPause", "onResume", "onRest"];
const RESERVED_PROPS = {
  config: 1,
  from: 1,
  to: 1,
  ref: 1,
  loop: 1,
  reset: 1,
  pause: 1,
  cancel: 1,
  reverse: 1,
  immediate: 1,
  default: 1,
  delay: 1,
  onProps: 1,
  onStart: 1,
  onChange: 1,
  onPause: 1,
  onResume: 1,
  onRest: 1,
  onResolve: 1,
  items: 1,
  trail: 1,
  sort: 1,
  expires: 1,
  initial: 1,
  enter: 1,
  update: 1,
  leave: 1,
  children: 1,
  onDestroyed: 1,
  keys: 1,
  callId: 1,
  parentId: 1
};
function getForwardProps(props) {
  const forward = {};
  let count = 0;
  eachProp(props, (value, prop) => {
    if (!RESERVED_PROPS[prop]) {
      forward[prop] = value;
      count++;
    }
  });
  if (count) {
    return forward;
  }
}
function inferTo(props) {
  const to2 = getForwardProps(props);
  if (to2) {
    const out = {
      to: to2
    };
    eachProp(props, (val, key) => key in to2 || (out[key] = val));
    return out;
  }
  return _extends({}, props);
}
function computeGoal(value) {
  value = getFluidValue(value);
  return is.arr(value) ? value.map(computeGoal) : isAnimatedString(value) ? globals.createStringInterpolator({
    range: [0, 1],
    output: [value, value]
  })(1) : value;
}
function hasProps(props) {
  for (const _2 in props) return true;
  return false;
}
function isAsyncTo(to2) {
  return is.fun(to2) || is.arr(to2) && is.obj(to2[0]);
}
function detachRefs(ctrl, ref) {
  var _ctrl$ref;
  (_ctrl$ref = ctrl.ref) == null ? void 0 : _ctrl$ref.delete(ctrl);
  ref == null ? void 0 : ref.delete(ctrl);
}
function replaceRef(ctrl, ref) {
  if (ref && ctrl.ref !== ref) {
    var _ctrl$ref2;
    (_ctrl$ref2 = ctrl.ref) == null ? void 0 : _ctrl$ref2.delete(ctrl);
    ref.add(ctrl);
    ctrl.ref = ref;
  }
}
const config = {
  default: {
    tension: 170,
    friction: 26
  },
  gentle: {
    tension: 120,
    friction: 14
  },
  wobbly: {
    tension: 180,
    friction: 12
  },
  stiff: {
    tension: 210,
    friction: 20
  },
  slow: {
    tension: 280,
    friction: 60
  },
  molasses: {
    tension: 280,
    friction: 120
  }
};
const easings = {
  linear: (x2) => x2
};
const defaults = _extends({}, config.default, {
  mass: 1,
  damping: 1,
  easing: easings.linear,
  clamp: false
});
class AnimationConfig {
  constructor() {
    this.tension = void 0;
    this.friction = void 0;
    this.frequency = void 0;
    this.damping = void 0;
    this.mass = void 0;
    this.velocity = 0;
    this.restVelocity = void 0;
    this.precision = void 0;
    this.progress = void 0;
    this.duration = void 0;
    this.easing = void 0;
    this.clamp = void 0;
    this.bounce = void 0;
    this.decay = void 0;
    this.round = void 0;
    Object.assign(this, defaults);
  }
}
function mergeConfig(config2, newConfig, defaultConfig) {
  if (defaultConfig) {
    defaultConfig = _extends({}, defaultConfig);
    sanitizeConfig(defaultConfig, newConfig);
    newConfig = _extends({}, defaultConfig, newConfig);
  }
  sanitizeConfig(config2, newConfig);
  Object.assign(config2, newConfig);
  for (const key in defaults) {
    if (config2[key] == null) {
      config2[key] = defaults[key];
    }
  }
  let {
    mass,
    frequency,
    damping
  } = config2;
  if (!is.und(frequency)) {
    if (frequency < 0.01) frequency = 0.01;
    if (damping < 0) damping = 0;
    config2.tension = Math.pow(2 * Math.PI / frequency, 2) * mass;
    config2.friction = 4 * Math.PI * damping * mass / frequency;
  }
  return config2;
}
function sanitizeConfig(config2, props) {
  if (!is.und(props.decay)) {
    config2.duration = void 0;
  } else {
    const isTensionConfig = !is.und(props.tension) || !is.und(props.friction);
    if (isTensionConfig || !is.und(props.frequency) || !is.und(props.damping) || !is.und(props.mass)) {
      config2.duration = void 0;
      config2.decay = void 0;
    }
    if (isTensionConfig) {
      config2.frequency = void 0;
    }
  }
}
const emptyArray = [];
class Animation {
  constructor() {
    this.changed = false;
    this.values = emptyArray;
    this.toValues = null;
    this.fromValues = emptyArray;
    this.to = void 0;
    this.from = void 0;
    this.config = new AnimationConfig();
    this.immediate = false;
  }
}
function scheduleProps(callId, {
  key,
  props,
  defaultProps,
  state,
  actions
}) {
  return new Promise((resolve, reject) => {
    var _props$cancel;
    let delay;
    let timeout;
    let cancel = matchProp((_props$cancel = props.cancel) != null ? _props$cancel : defaultProps == null ? void 0 : defaultProps.cancel, key);
    if (cancel) {
      onStart();
    } else {
      if (!is.und(props.pause)) {
        state.paused = matchProp(props.pause, key);
      }
      let pause = defaultProps == null ? void 0 : defaultProps.pause;
      if (pause !== true) {
        pause = state.paused || matchProp(pause, key);
      }
      delay = callProp(props.delay || 0, key);
      if (pause) {
        state.resumeQueue.add(onResume);
        actions.pause();
      } else {
        actions.resume();
        onResume();
      }
    }
    function onPause() {
      state.resumeQueue.add(onResume);
      state.timeouts.delete(timeout);
      timeout.cancel();
      delay = timeout.time - raf.now();
    }
    function onResume() {
      if (delay > 0 && !globals.skipAnimation) {
        state.delayed = true;
        timeout = raf.setTimeout(onStart, delay);
        state.pauseQueue.add(onPause);
        state.timeouts.add(timeout);
      } else {
        onStart();
      }
    }
    function onStart() {
      if (state.delayed) {
        state.delayed = false;
      }
      state.pauseQueue.delete(onPause);
      state.timeouts.delete(timeout);
      if (callId <= (state.cancelId || 0)) {
        cancel = true;
      }
      try {
        actions.start(_extends({}, props, {
          callId,
          cancel
        }), resolve);
      } catch (err) {
        reject(err);
      }
    }
  });
}
const getCombinedResult = (target, results) => results.length == 1 ? results[0] : results.some((result) => result.cancelled) ? getCancelledResult(target.get()) : results.every((result) => result.noop) ? getNoopResult(target.get()) : getFinishedResult(target.get(), results.every((result) => result.finished));
const getNoopResult = (value) => ({
  value,
  noop: true,
  finished: true,
  cancelled: false
});
const getFinishedResult = (value, finished, cancelled = false) => ({
  value,
  finished,
  cancelled
});
const getCancelledResult = (value) => ({
  value,
  cancelled: true,
  finished: false
});
function runAsync(to2, props, state, target) {
  const {
    callId,
    parentId,
    onRest
  } = props;
  const {
    asyncTo: prevTo,
    promise: prevPromise
  } = state;
  if (!parentId && to2 === prevTo && !props.reset) {
    return prevPromise;
  }
  return state.promise = (async () => {
    state.asyncId = callId;
    state.asyncTo = to2;
    const defaultProps = getDefaultProps(props, (value, key) => key === "onRest" ? void 0 : value);
    let preventBail;
    let bail;
    const bailPromise = new Promise((resolve, reject) => (preventBail = resolve, bail = reject));
    const bailIfEnded = (bailSignal) => {
      const bailResult = callId <= (state.cancelId || 0) && getCancelledResult(target) || callId !== state.asyncId && getFinishedResult(target, false);
      if (bailResult) {
        bailSignal.result = bailResult;
        bail(bailSignal);
        throw bailSignal;
      }
    };
    const animate = (arg1, arg2) => {
      const bailSignal = new BailSignal();
      const skipAnimationSignal = new SkipAniamtionSignal();
      return (async () => {
        if (globals.skipAnimation) {
          stopAsync(state);
          skipAnimationSignal.result = getFinishedResult(target, false);
          bail(skipAnimationSignal);
          throw skipAnimationSignal;
        }
        bailIfEnded(bailSignal);
        const props2 = is.obj(arg1) ? _extends({}, arg1) : _extends({}, arg2, {
          to: arg1
        });
        props2.parentId = callId;
        eachProp(defaultProps, (value, key) => {
          if (is.und(props2[key])) {
            props2[key] = value;
          }
        });
        const result2 = await target.start(props2);
        bailIfEnded(bailSignal);
        if (state.paused) {
          await new Promise((resume) => {
            state.resumeQueue.add(resume);
          });
        }
        return result2;
      })();
    };
    let result;
    if (globals.skipAnimation) {
      stopAsync(state);
      return getFinishedResult(target, false);
    }
    try {
      let animating;
      if (is.arr(to2)) {
        animating = (async (queue) => {
          for (const props2 of queue) {
            await animate(props2);
          }
        })(to2);
      } else {
        animating = Promise.resolve(to2(animate, target.stop.bind(target)));
      }
      await Promise.all([animating.then(preventBail), bailPromise]);
      result = getFinishedResult(target.get(), true, false);
    } catch (err) {
      if (err instanceof BailSignal) {
        result = err.result;
      } else if (err instanceof SkipAniamtionSignal) {
        result = err.result;
      } else {
        throw err;
      }
    } finally {
      if (callId == state.asyncId) {
        state.asyncId = parentId;
        state.asyncTo = parentId ? prevTo : void 0;
        state.promise = parentId ? prevPromise : void 0;
      }
    }
    if (is.fun(onRest)) {
      raf.batchedUpdates(() => {
        onRest(result, target, target.item);
      });
    }
    return result;
  })();
}
function stopAsync(state, cancelId) {
  flush(state.timeouts, (t2) => t2.cancel());
  state.pauseQueue.clear();
  state.resumeQueue.clear();
  state.asyncId = state.asyncTo = state.promise = void 0;
  if (cancelId) state.cancelId = cancelId;
}
class BailSignal extends Error {
  constructor() {
    super("An async animation has been interrupted. You see this error because you forgot to use `await` or `.catch(...)` on its returned promise.");
    this.result = void 0;
  }
}
class SkipAniamtionSignal extends Error {
  constructor() {
    super("SkipAnimationSignal");
    this.result = void 0;
  }
}
const isFrameValue = (value) => value instanceof FrameValue;
let nextId$1 = 1;
class FrameValue extends FluidValue {
  constructor(...args) {
    super(...args);
    this.id = nextId$1++;
    this.key = void 0;
    this._priority = 0;
  }
  get priority() {
    return this._priority;
  }
  set priority(priority2) {
    if (this._priority != priority2) {
      this._priority = priority2;
      this._onPriorityChange(priority2);
    }
  }
  get() {
    const node = getAnimated(this);
    return node && node.getValue();
  }
  to(...args) {
    return globals.to(this, args);
  }
  interpolate(...args) {
    deprecateInterpolate();
    return globals.to(this, args);
  }
  toJSON() {
    return this.get();
  }
  observerAdded(count) {
    if (count == 1) this._attach();
  }
  observerRemoved(count) {
    if (count == 0) this._detach();
  }
  _attach() {
  }
  _detach() {
  }
  _onChange(value, idle = false) {
    callFluidObservers(this, {
      type: "change",
      parent: this,
      value,
      idle
    });
  }
  _onPriorityChange(priority2) {
    if (!this.idle) {
      frameLoop.sort(this);
    }
    callFluidObservers(this, {
      type: "priority",
      parent: this,
      priority: priority2
    });
  }
}
const $P = /* @__PURE__ */ Symbol.for("SpringPhase");
const HAS_ANIMATED = 1;
const IS_ANIMATING = 2;
const IS_PAUSED = 4;
const hasAnimated = (target) => (target[$P] & HAS_ANIMATED) > 0;
const isAnimating = (target) => (target[$P] & IS_ANIMATING) > 0;
const isPaused = (target) => (target[$P] & IS_PAUSED) > 0;
const setActiveBit = (target, active) => active ? target[$P] |= IS_ANIMATING | HAS_ANIMATED : target[$P] &= ~IS_ANIMATING;
const setPausedBit = (target, paused) => paused ? target[$P] |= IS_PAUSED : target[$P] &= ~IS_PAUSED;
class SpringValue extends FrameValue {
  constructor(arg1, arg2) {
    super();
    this.key = void 0;
    this.animation = new Animation();
    this.queue = void 0;
    this.defaultProps = {};
    this._state = {
      paused: false,
      delayed: false,
      pauseQueue: /* @__PURE__ */ new Set(),
      resumeQueue: /* @__PURE__ */ new Set(),
      timeouts: /* @__PURE__ */ new Set()
    };
    this._pendingCalls = /* @__PURE__ */ new Set();
    this._lastCallId = 0;
    this._lastToId = 0;
    this._memoizedDuration = 0;
    if (!is.und(arg1) || !is.und(arg2)) {
      const props = is.obj(arg1) ? _extends({}, arg1) : _extends({}, arg2, {
        from: arg1
      });
      if (is.und(props.default)) {
        props.default = true;
      }
      this.start(props);
    }
  }
  get idle() {
    return !(isAnimating(this) || this._state.asyncTo) || isPaused(this);
  }
  get goal() {
    return getFluidValue(this.animation.to);
  }
  get velocity() {
    const node = getAnimated(this);
    return node instanceof AnimatedValue ? node.lastVelocity || 0 : node.getPayload().map((node2) => node2.lastVelocity || 0);
  }
  get hasAnimated() {
    return hasAnimated(this);
  }
  get isAnimating() {
    return isAnimating(this);
  }
  get isPaused() {
    return isPaused(this);
  }
  get isDelayed() {
    return this._state.delayed;
  }
  advance(dt) {
    let idle = true;
    let changed = false;
    const anim = this.animation;
    let {
      config: config2,
      toValues
    } = anim;
    const payload = getPayload(anim.to);
    if (!payload && hasFluidValue(anim.to)) {
      toValues = toArray(getFluidValue(anim.to));
    }
    anim.values.forEach((node2, i2) => {
      if (node2.done) return;
      const to2 = node2.constructor == AnimatedString ? 1 : payload ? payload[i2].lastPosition : toValues[i2];
      let finished = anim.immediate;
      let position = to2;
      if (!finished) {
        position = node2.lastPosition;
        if (config2.tension <= 0) {
          node2.done = true;
          return;
        }
        let elapsed = node2.elapsedTime += dt;
        const from = anim.fromValues[i2];
        const v0 = node2.v0 != null ? node2.v0 : node2.v0 = is.arr(config2.velocity) ? config2.velocity[i2] : config2.velocity;
        let velocity;
        if (!is.und(config2.duration)) {
          let p2 = 1;
          if (config2.duration > 0) {
            if (this._memoizedDuration !== config2.duration) {
              this._memoizedDuration = config2.duration;
              if (node2.durationProgress > 0) {
                node2.elapsedTime = config2.duration * node2.durationProgress;
                elapsed = node2.elapsedTime += dt;
              }
            }
            p2 = (config2.progress || 0) + elapsed / this._memoizedDuration;
            p2 = p2 > 1 ? 1 : p2 < 0 ? 0 : p2;
            node2.durationProgress = p2;
          }
          position = from + config2.easing(p2) * (to2 - from);
          velocity = (position - node2.lastPosition) / dt;
          finished = p2 == 1;
        } else if (config2.decay) {
          const decay = config2.decay === true ? 0.998 : config2.decay;
          const e2 = Math.exp(-(1 - decay) * elapsed);
          position = from + v0 / (1 - decay) * (1 - e2);
          finished = Math.abs(node2.lastPosition - position) < 0.1;
          velocity = v0 * e2;
        } else {
          velocity = node2.lastVelocity == null ? v0 : node2.lastVelocity;
          const precision = config2.precision || (from == to2 ? 5e-3 : Math.min(1, Math.abs(to2 - from) * 1e-3));
          const restVelocity = config2.restVelocity || precision / 10;
          const bounceFactor = config2.clamp ? 0 : config2.bounce;
          const canBounce = !is.und(bounceFactor);
          const isGrowing = from == to2 ? node2.v0 > 0 : from < to2;
          let isMoving;
          let isBouncing = false;
          const step = 1;
          const numSteps = Math.ceil(dt / step);
          for (let n2 = 0; n2 < numSteps; ++n2) {
            isMoving = Math.abs(velocity) > restVelocity;
            if (!isMoving) {
              finished = Math.abs(to2 - position) <= precision;
              if (finished) {
                break;
              }
            }
            if (canBounce) {
              isBouncing = position == to2 || position > to2 == isGrowing;
              if (isBouncing) {
                velocity = -velocity * bounceFactor;
                position = to2;
              }
            }
            const springForce = -config2.tension * 1e-6 * (position - to2);
            const dampingForce = -config2.friction * 1e-3 * velocity;
            const acceleration = (springForce + dampingForce) / config2.mass;
            velocity = velocity + acceleration * step;
            position = position + velocity * step;
          }
        }
        node2.lastVelocity = velocity;
        if (Number.isNaN(position)) {
          console.warn(`Got NaN while animating:`, this);
          finished = true;
        }
      }
      if (payload && !payload[i2].done) {
        finished = false;
      }
      if (finished) {
        node2.done = true;
      } else {
        idle = false;
      }
      if (node2.setValue(position, config2.round)) {
        changed = true;
      }
    });
    const node = getAnimated(this);
    const currVal = node.getValue();
    if (idle) {
      const finalVal = getFluidValue(anim.to);
      if ((currVal !== finalVal || changed) && !config2.decay) {
        node.setValue(finalVal);
        this._onChange(finalVal);
      } else if (changed && config2.decay) {
        this._onChange(currVal);
      }
      this._stop();
    } else if (changed) {
      this._onChange(currVal);
    }
  }
  set(value) {
    raf.batchedUpdates(() => {
      this._stop();
      this._focus(value);
      this._set(value);
    });
    return this;
  }
  pause() {
    this._update({
      pause: true
    });
  }
  resume() {
    this._update({
      pause: false
    });
  }
  finish() {
    if (isAnimating(this)) {
      const {
        to: to2,
        config: config2
      } = this.animation;
      raf.batchedUpdates(() => {
        this._onStart();
        if (!config2.decay) {
          this._set(to2, false);
        }
        this._stop();
      });
    }
    return this;
  }
  update(props) {
    const queue = this.queue || (this.queue = []);
    queue.push(props);
    return this;
  }
  start(to2, arg2) {
    let queue;
    if (!is.und(to2)) {
      queue = [is.obj(to2) ? to2 : _extends({}, arg2, {
        to: to2
      })];
    } else {
      queue = this.queue || [];
      this.queue = [];
    }
    return Promise.all(queue.map((props) => {
      const up = this._update(props);
      return up;
    })).then((results) => getCombinedResult(this, results));
  }
  stop(cancel) {
    const {
      to: to2
    } = this.animation;
    this._focus(this.get());
    stopAsync(this._state, cancel && this._lastCallId);
    raf.batchedUpdates(() => this._stop(to2, cancel));
    return this;
  }
  reset() {
    this._update({
      reset: true
    });
  }
  eventObserved(event) {
    if (event.type == "change") {
      this._start();
    } else if (event.type == "priority") {
      this.priority = event.priority + 1;
    }
  }
  _prepareNode(props) {
    const key = this.key || "";
    let {
      to: to2,
      from
    } = props;
    to2 = is.obj(to2) ? to2[key] : to2;
    if (to2 == null || isAsyncTo(to2)) {
      to2 = void 0;
    }
    from = is.obj(from) ? from[key] : from;
    if (from == null) {
      from = void 0;
    }
    const range2 = {
      to: to2,
      from
    };
    if (!hasAnimated(this)) {
      if (props.reverse) [to2, from] = [from, to2];
      from = getFluidValue(from);
      if (!is.und(from)) {
        this._set(from);
      } else if (!getAnimated(this)) {
        this._set(to2);
      }
    }
    return range2;
  }
  _update(_ref, isLoop) {
    let props = _extends({}, _ref);
    const {
      key,
      defaultProps
    } = this;
    if (props.default) Object.assign(defaultProps, getDefaultProps(props, (value, prop) => /^on/.test(prop) ? resolveProp(value, key) : value));
    mergeActiveFn(this, props, "onProps");
    sendEvent(this, "onProps", props, this);
    const range2 = this._prepareNode(props);
    if (Object.isFrozen(this)) {
      throw Error("Cannot animate a `SpringValue` object that is frozen. Did you forget to pass your component to `animated(...)` before animating its props?");
    }
    const state = this._state;
    return scheduleProps(++this._lastCallId, {
      key,
      props,
      defaultProps,
      state,
      actions: {
        pause: () => {
          if (!isPaused(this)) {
            setPausedBit(this, true);
            flushCalls(state.pauseQueue);
            sendEvent(this, "onPause", getFinishedResult(this, checkFinished(this, this.animation.to)), this);
          }
        },
        resume: () => {
          if (isPaused(this)) {
            setPausedBit(this, false);
            if (isAnimating(this)) {
              this._resume();
            }
            flushCalls(state.resumeQueue);
            sendEvent(this, "onResume", getFinishedResult(this, checkFinished(this, this.animation.to)), this);
          }
        },
        start: this._merge.bind(this, range2)
      }
    }).then((result) => {
      if (props.loop && result.finished && !(isLoop && result.noop)) {
        const nextProps = createLoopUpdate(props);
        if (nextProps) {
          return this._update(nextProps, true);
        }
      }
      return result;
    });
  }
  _merge(range2, props, resolve) {
    if (props.cancel) {
      this.stop(true);
      return resolve(getCancelledResult(this));
    }
    const hasToProp = !is.und(range2.to);
    const hasFromProp = !is.und(range2.from);
    if (hasToProp || hasFromProp) {
      if (props.callId > this._lastToId) {
        this._lastToId = props.callId;
      } else {
        return resolve(getCancelledResult(this));
      }
    }
    const {
      key,
      defaultProps,
      animation: anim
    } = this;
    const {
      to: prevTo,
      from: prevFrom
    } = anim;
    let {
      to: to2 = prevTo,
      from = prevFrom
    } = range2;
    if (hasFromProp && !hasToProp && (!props.default || is.und(to2))) {
      to2 = from;
    }
    if (props.reverse) [to2, from] = [from, to2];
    const hasFromChanged = !isEqual(from, prevFrom);
    if (hasFromChanged) {
      anim.from = from;
    }
    from = getFluidValue(from);
    const hasToChanged = !isEqual(to2, prevTo);
    if (hasToChanged) {
      this._focus(to2);
    }
    const hasAsyncTo = isAsyncTo(props.to);
    const {
      config: config2
    } = anim;
    const {
      decay,
      velocity
    } = config2;
    if (hasToProp || hasFromProp) {
      config2.velocity = 0;
    }
    if (props.config && !hasAsyncTo) {
      mergeConfig(config2, callProp(props.config, key), props.config !== defaultProps.config ? callProp(defaultProps.config, key) : void 0);
    }
    let node = getAnimated(this);
    if (!node || is.und(to2)) {
      return resolve(getFinishedResult(this, true));
    }
    const reset = is.und(props.reset) ? hasFromProp && !props.default : !is.und(from) && matchProp(props.reset, key);
    const value = reset ? from : this.get();
    const goal = computeGoal(to2);
    const isAnimatable = is.num(goal) || is.arr(goal) || isAnimatedString(goal);
    const immediate = !hasAsyncTo && (!isAnimatable || matchProp(defaultProps.immediate || props.immediate, key));
    if (hasToChanged) {
      const nodeType = getAnimatedType(to2);
      if (nodeType !== node.constructor) {
        if (immediate) {
          node = this._set(goal);
        } else throw Error(`Cannot animate between ${node.constructor.name} and ${nodeType.name}, as the "to" prop suggests`);
      }
    }
    const goalType = node.constructor;
    let started = hasFluidValue(to2);
    let finished = false;
    if (!started) {
      const hasValueChanged = reset || !hasAnimated(this) && hasFromChanged;
      if (hasToChanged || hasValueChanged) {
        finished = isEqual(computeGoal(value), goal);
        started = !finished;
      }
      if (!isEqual(anim.immediate, immediate) && !immediate || !isEqual(config2.decay, decay) || !isEqual(config2.velocity, velocity)) {
        started = true;
      }
    }
    if (finished && isAnimating(this)) {
      if (anim.changed && !reset) {
        started = true;
      } else if (!started) {
        this._stop(prevTo);
      }
    }
    if (!hasAsyncTo) {
      if (started || hasFluidValue(prevTo)) {
        anim.values = node.getPayload();
        anim.toValues = hasFluidValue(to2) ? null : goalType == AnimatedString ? [1] : toArray(goal);
      }
      if (anim.immediate != immediate) {
        anim.immediate = immediate;
        if (!immediate && !reset) {
          this._set(prevTo);
        }
      }
      if (started) {
        const {
          onRest
        } = anim;
        each(ACTIVE_EVENTS, (type) => mergeActiveFn(this, props, type));
        const result = getFinishedResult(this, checkFinished(this, prevTo));
        flushCalls(this._pendingCalls, result);
        this._pendingCalls.add(resolve);
        if (anim.changed) raf.batchedUpdates(() => {
          anim.changed = !reset;
          onRest == null ? void 0 : onRest(result, this);
          if (reset) {
            callProp(defaultProps.onRest, result);
          } else {
            anim.onStart == null ? void 0 : anim.onStart(result, this);
          }
        });
      }
    }
    if (reset) {
      this._set(value);
    }
    if (hasAsyncTo) {
      resolve(runAsync(props.to, props, this._state, this));
    } else if (started) {
      this._start();
    } else if (isAnimating(this) && !hasToChanged) {
      this._pendingCalls.add(resolve);
    } else {
      resolve(getNoopResult(value));
    }
  }
  _focus(value) {
    const anim = this.animation;
    if (value !== anim.to) {
      if (getFluidObservers(this)) {
        this._detach();
      }
      anim.to = value;
      if (getFluidObservers(this)) {
        this._attach();
      }
    }
  }
  _attach() {
    let priority2 = 0;
    const {
      to: to2
    } = this.animation;
    if (hasFluidValue(to2)) {
      addFluidObserver(to2, this);
      if (isFrameValue(to2)) {
        priority2 = to2.priority + 1;
      }
    }
    this.priority = priority2;
  }
  _detach() {
    const {
      to: to2
    } = this.animation;
    if (hasFluidValue(to2)) {
      removeFluidObserver(to2, this);
    }
  }
  _set(arg, idle = true) {
    const value = getFluidValue(arg);
    if (!is.und(value)) {
      const oldNode = getAnimated(this);
      if (!oldNode || !isEqual(value, oldNode.getValue())) {
        const nodeType = getAnimatedType(value);
        if (!oldNode || oldNode.constructor != nodeType) {
          setAnimated(this, nodeType.create(value));
        } else {
          oldNode.setValue(value);
        }
        if (oldNode) {
          raf.batchedUpdates(() => {
            this._onChange(value, idle);
          });
        }
      }
    }
    return getAnimated(this);
  }
  _onStart() {
    const anim = this.animation;
    if (!anim.changed) {
      anim.changed = true;
      sendEvent(this, "onStart", getFinishedResult(this, checkFinished(this, anim.to)), this);
    }
  }
  _onChange(value, idle) {
    if (!idle) {
      this._onStart();
      callProp(this.animation.onChange, value, this);
    }
    callProp(this.defaultProps.onChange, value, this);
    super._onChange(value, idle);
  }
  _start() {
    const anim = this.animation;
    getAnimated(this).reset(getFluidValue(anim.to));
    if (!anim.immediate) {
      anim.fromValues = anim.values.map((node) => node.lastPosition);
    }
    if (!isAnimating(this)) {
      setActiveBit(this, true);
      if (!isPaused(this)) {
        this._resume();
      }
    }
  }
  _resume() {
    if (globals.skipAnimation) {
      this.finish();
    } else {
      frameLoop.start(this);
    }
  }
  _stop(goal, cancel) {
    if (isAnimating(this)) {
      setActiveBit(this, false);
      const anim = this.animation;
      each(anim.values, (node) => {
        node.done = true;
      });
      if (anim.toValues) {
        anim.onChange = anim.onPause = anim.onResume = void 0;
      }
      callFluidObservers(this, {
        type: "idle",
        parent: this
      });
      const result = cancel ? getCancelledResult(this.get()) : getFinishedResult(this.get(), checkFinished(this, goal != null ? goal : anim.to));
      flushCalls(this._pendingCalls, result);
      if (anim.changed) {
        anim.changed = false;
        sendEvent(this, "onRest", result, this);
      }
    }
  }
}
function checkFinished(target, to2) {
  const goal = computeGoal(to2);
  const value = computeGoal(target.get());
  return isEqual(value, goal);
}
function createLoopUpdate(props, loop2 = props.loop, to2 = props.to) {
  let loopRet = callProp(loop2);
  if (loopRet) {
    const overrides = loopRet !== true && inferTo(loopRet);
    const reverse = (overrides || props).reverse;
    const reset = !overrides || overrides.reset;
    return createUpdate(_extends({}, props, {
      loop: loop2,
      default: false,
      pause: void 0,
      to: !reverse || isAsyncTo(to2) ? to2 : void 0,
      from: reset ? props.from : void 0,
      reset
    }, overrides));
  }
}
function createUpdate(props) {
  const {
    to: to2,
    from
  } = props = inferTo(props);
  const keys = /* @__PURE__ */ new Set();
  if (is.obj(to2)) findDefined(to2, keys);
  if (is.obj(from)) findDefined(from, keys);
  props.keys = keys.size ? Array.from(keys) : null;
  return props;
}
function declareUpdate(props) {
  const update2 = createUpdate(props);
  if (is.und(update2.default)) {
    update2.default = getDefaultProps(update2);
  }
  return update2;
}
function findDefined(values, keys) {
  eachProp(values, (value, key) => value != null && keys.add(key));
}
const ACTIVE_EVENTS = ["onStart", "onRest", "onChange", "onPause", "onResume"];
function mergeActiveFn(target, props, type) {
  target.animation[type] = props[type] !== getDefaultProp(props, type) ? resolveProp(props[type], target.key) : void 0;
}
function sendEvent(target, type, ...args) {
  var _target$animation$typ, _target$animation, _target$defaultProps$, _target$defaultProps;
  (_target$animation$typ = (_target$animation = target.animation)[type]) == null ? void 0 : _target$animation$typ.call(_target$animation, ...args);
  (_target$defaultProps$ = (_target$defaultProps = target.defaultProps)[type]) == null ? void 0 : _target$defaultProps$.call(_target$defaultProps, ...args);
}
const BATCHED_EVENTS = ["onStart", "onChange", "onRest"];
let nextId = 1;
class Controller {
  constructor(props, flush2) {
    this.id = nextId++;
    this.springs = {};
    this.queue = [];
    this.ref = void 0;
    this._flush = void 0;
    this._initialProps = void 0;
    this._lastAsyncId = 0;
    this._active = /* @__PURE__ */ new Set();
    this._changed = /* @__PURE__ */ new Set();
    this._started = false;
    this._item = void 0;
    this._state = {
      paused: false,
      pauseQueue: /* @__PURE__ */ new Set(),
      resumeQueue: /* @__PURE__ */ new Set(),
      timeouts: /* @__PURE__ */ new Set()
    };
    this._events = {
      onStart: /* @__PURE__ */ new Map(),
      onChange: /* @__PURE__ */ new Map(),
      onRest: /* @__PURE__ */ new Map()
    };
    this._onFrame = this._onFrame.bind(this);
    if (flush2) {
      this._flush = flush2;
    }
    if (props) {
      this.start(_extends({
        default: true
      }, props));
    }
  }
  get idle() {
    return !this._state.asyncTo && Object.values(this.springs).every((spring) => {
      return spring.idle && !spring.isDelayed && !spring.isPaused;
    });
  }
  get item() {
    return this._item;
  }
  set item(item) {
    this._item = item;
  }
  get() {
    const values = {};
    this.each((spring, key) => values[key] = spring.get());
    return values;
  }
  set(values) {
    for (const key in values) {
      const value = values[key];
      if (!is.und(value)) {
        this.springs[key].set(value);
      }
    }
  }
  update(props) {
    if (props) {
      this.queue.push(createUpdate(props));
    }
    return this;
  }
  start(props) {
    let {
      queue
    } = this;
    if (props) {
      queue = toArray(props).map(createUpdate);
    } else {
      this.queue = [];
    }
    if (this._flush) {
      return this._flush(this, queue);
    }
    prepareKeys(this, queue);
    return flushUpdateQueue(this, queue);
  }
  stop(arg, keys) {
    if (arg !== !!arg) {
      keys = arg;
    }
    if (keys) {
      const springs = this.springs;
      each(toArray(keys), (key) => springs[key].stop(!!arg));
    } else {
      stopAsync(this._state, this._lastAsyncId);
      this.each((spring) => spring.stop(!!arg));
    }
    return this;
  }
  pause(keys) {
    if (is.und(keys)) {
      this.start({
        pause: true
      });
    } else {
      const springs = this.springs;
      each(toArray(keys), (key) => springs[key].pause());
    }
    return this;
  }
  resume(keys) {
    if (is.und(keys)) {
      this.start({
        pause: false
      });
    } else {
      const springs = this.springs;
      each(toArray(keys), (key) => springs[key].resume());
    }
    return this;
  }
  each(iterator) {
    eachProp(this.springs, iterator);
  }
  _onFrame() {
    const {
      onStart,
      onChange,
      onRest
    } = this._events;
    const active = this._active.size > 0;
    const changed = this._changed.size > 0;
    if (active && !this._started || changed && !this._started) {
      this._started = true;
      flush(onStart, ([onStart2, result]) => {
        result.value = this.get();
        onStart2(result, this, this._item);
      });
    }
    const idle = !active && this._started;
    const values = changed || idle && onRest.size ? this.get() : null;
    if (changed && onChange.size) {
      flush(onChange, ([onChange2, result]) => {
        result.value = values;
        onChange2(result, this, this._item);
      });
    }
    if (idle) {
      this._started = false;
      flush(onRest, ([onRest2, result]) => {
        result.value = values;
        onRest2(result, this, this._item);
      });
    }
  }
  eventObserved(event) {
    if (event.type == "change") {
      this._changed.add(event.parent);
      if (!event.idle) {
        this._active.add(event.parent);
      }
    } else if (event.type == "idle") {
      this._active.delete(event.parent);
    } else return;
    raf.onFrame(this._onFrame);
  }
}
function flushUpdateQueue(ctrl, queue) {
  return Promise.all(queue.map((props) => flushUpdate(ctrl, props))).then((results) => getCombinedResult(ctrl, results));
}
async function flushUpdate(ctrl, props, isLoop) {
  const {
    keys,
    to: to2,
    from,
    loop: loop2,
    onRest,
    onResolve
  } = props;
  const defaults2 = is.obj(props.default) && props.default;
  if (loop2) {
    props.loop = false;
  }
  if (to2 === false) props.to = null;
  if (from === false) props.from = null;
  const asyncTo = is.arr(to2) || is.fun(to2) ? to2 : void 0;
  if (asyncTo) {
    props.to = void 0;
    props.onRest = void 0;
    if (defaults2) {
      defaults2.onRest = void 0;
    }
  } else {
    each(BATCHED_EVENTS, (key) => {
      const handler = props[key];
      if (is.fun(handler)) {
        const queue = ctrl["_events"][key];
        props[key] = ({
          finished,
          cancelled
        }) => {
          const result2 = queue.get(handler);
          if (result2) {
            if (!finished) result2.finished = false;
            if (cancelled) result2.cancelled = true;
          } else {
            queue.set(handler, {
              value: null,
              finished: finished || false,
              cancelled: cancelled || false
            });
          }
        };
        if (defaults2) {
          defaults2[key] = props[key];
        }
      }
    });
  }
  const state = ctrl["_state"];
  if (props.pause === !state.paused) {
    state.paused = props.pause;
    flushCalls(props.pause ? state.pauseQueue : state.resumeQueue);
  } else if (state.paused) {
    props.pause = true;
  }
  const promises = (keys || Object.keys(ctrl.springs)).map((key) => ctrl.springs[key].start(props));
  const cancel = props.cancel === true || getDefaultProp(props, "cancel") === true;
  if (asyncTo || cancel && state.asyncId) {
    promises.push(scheduleProps(++ctrl["_lastAsyncId"], {
      props,
      state,
      actions: {
        pause: noop,
        resume: noop,
        start(props2, resolve) {
          if (cancel) {
            stopAsync(state, ctrl["_lastAsyncId"]);
            resolve(getCancelledResult(ctrl));
          } else {
            props2.onRest = onRest;
            resolve(runAsync(asyncTo, props2, state, ctrl));
          }
        }
      }
    }));
  }
  if (state.paused) {
    await new Promise((resume) => {
      state.resumeQueue.add(resume);
    });
  }
  const result = getCombinedResult(ctrl, await Promise.all(promises));
  if (loop2 && result.finished && !(isLoop && result.noop)) {
    const nextProps = createLoopUpdate(props, loop2, to2);
    if (nextProps) {
      prepareKeys(ctrl, [nextProps]);
      return flushUpdate(ctrl, nextProps, true);
    }
  }
  if (onResolve) {
    raf.batchedUpdates(() => onResolve(result, ctrl, ctrl.item));
  }
  return result;
}
function getSprings(ctrl, props) {
  const springs = _extends({}, ctrl.springs);
  if (props) {
    each(toArray(props), (props2) => {
      if (is.und(props2.keys)) {
        props2 = createUpdate(props2);
      }
      if (!is.obj(props2.to)) {
        props2 = _extends({}, props2, {
          to: void 0
        });
      }
      prepareSprings(springs, props2, (key) => {
        return createSpring(key);
      });
    });
  }
  setSprings(ctrl, springs);
  return springs;
}
function setSprings(ctrl, springs) {
  eachProp(springs, (spring, key) => {
    if (!ctrl.springs[key]) {
      ctrl.springs[key] = spring;
      addFluidObserver(spring, ctrl);
    }
  });
}
function createSpring(key, observer) {
  const spring = new SpringValue();
  spring.key = key;
  if (observer) {
    addFluidObserver(spring, observer);
  }
  return spring;
}
function prepareSprings(springs, props, create) {
  if (props.keys) {
    each(props.keys, (key) => {
      const spring = springs[key] || (springs[key] = create(key));
      spring["_prepareNode"](props);
    });
  }
}
function prepareKeys(ctrl, queue) {
  each(queue, (props) => {
    prepareSprings(ctrl.springs, props, (key) => {
      return createSpring(key, ctrl);
    });
  });
}
function _objectWithoutPropertiesLoose$1(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i2;
  for (i2 = 0; i2 < sourceKeys.length; i2++) {
    key = sourceKeys[i2];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
const _excluded$3 = ["children"];
const SpringContext = (_ref) => {
  let {
    children
  } = _ref, props = _objectWithoutPropertiesLoose$1(_ref, _excluded$3);
  const inherited = reactExports.useContext(ctx);
  const pause = props.pause || !!inherited.pause, immediate = props.immediate || !!inherited.immediate;
  props = useMemoOne(() => ({
    pause,
    immediate
  }), [pause, immediate]);
  const {
    Provider
  } = ctx;
  return reactExports.createElement(Provider, {
    value: props
  }, children);
};
const ctx = makeContext(SpringContext, {});
SpringContext.Provider = ctx.Provider;
SpringContext.Consumer = ctx.Consumer;
function makeContext(target, init) {
  Object.assign(target, reactExports.createContext(init));
  target.Provider._context = target;
  target.Consumer._context = target;
  return target;
}
const SpringRef = () => {
  const current = [];
  const SpringRef2 = function SpringRef3(props) {
    deprecateDirectCall();
    const results = [];
    each(current, (ctrl, i2) => {
      if (is.und(props)) {
        results.push(ctrl.start());
      } else {
        const update2 = _getProps(props, ctrl, i2);
        if (update2) {
          results.push(ctrl.start(update2));
        }
      }
    });
    return results;
  };
  SpringRef2.current = current;
  SpringRef2.add = function(ctrl) {
    if (!current.includes(ctrl)) {
      current.push(ctrl);
    }
  };
  SpringRef2.delete = function(ctrl) {
    const i2 = current.indexOf(ctrl);
    if (~i2) current.splice(i2, 1);
  };
  SpringRef2.pause = function() {
    each(current, (ctrl) => ctrl.pause(...arguments));
    return this;
  };
  SpringRef2.resume = function() {
    each(current, (ctrl) => ctrl.resume(...arguments));
    return this;
  };
  SpringRef2.set = function(values) {
    each(current, (ctrl) => ctrl.set(values));
  };
  SpringRef2.start = function(props) {
    const results = [];
    each(current, (ctrl, i2) => {
      if (is.und(props)) {
        results.push(ctrl.start());
      } else {
        const update2 = this._getProps(props, ctrl, i2);
        if (update2) {
          results.push(ctrl.start(update2));
        }
      }
    });
    return results;
  };
  SpringRef2.stop = function() {
    each(current, (ctrl) => ctrl.stop(...arguments));
    return this;
  };
  SpringRef2.update = function(props) {
    each(current, (ctrl, i2) => ctrl.update(this._getProps(props, ctrl, i2)));
    return this;
  };
  const _getProps = function _getProps2(arg, ctrl, index2) {
    return is.fun(arg) ? arg(index2, ctrl) : arg;
  };
  SpringRef2._getProps = _getProps;
  return SpringRef2;
};
function useSprings(length2, props, deps) {
  const propsFn = is.fun(props) && props;
  if (propsFn && !deps) deps = [];
  const ref = reactExports.useMemo(() => propsFn || arguments.length == 3 ? SpringRef() : void 0, []);
  const layoutId = reactExports.useRef(0);
  const forceUpdate = useForceUpdate();
  const state = reactExports.useMemo(() => ({
    ctrls: [],
    queue: [],
    flush(ctrl, updates2) {
      const springs2 = getSprings(ctrl, updates2);
      const canFlushSync = layoutId.current > 0 && !state.queue.length && !Object.keys(springs2).some((key) => !ctrl.springs[key]);
      return canFlushSync ? flushUpdateQueue(ctrl, updates2) : new Promise((resolve) => {
        setSprings(ctrl, springs2);
        state.queue.push(() => {
          resolve(flushUpdateQueue(ctrl, updates2));
        });
        forceUpdate();
      });
    }
  }), []);
  const ctrls = reactExports.useRef([...state.ctrls]);
  const updates = [];
  const prevLength = usePrev(length2) || 0;
  reactExports.useMemo(() => {
    each(ctrls.current.slice(length2, prevLength), (ctrl) => {
      detachRefs(ctrl, ref);
      ctrl.stop(true);
    });
    ctrls.current.length = length2;
    declareUpdates(prevLength, length2);
  }, [length2]);
  reactExports.useMemo(() => {
    declareUpdates(0, Math.min(prevLength, length2));
  }, deps);
  function declareUpdates(startIndex, endIndex) {
    for (let i2 = startIndex; i2 < endIndex; i2++) {
      const ctrl = ctrls.current[i2] || (ctrls.current[i2] = new Controller(null, state.flush));
      const update2 = propsFn ? propsFn(i2, ctrl) : props[i2];
      if (update2) {
        updates[i2] = declareUpdate(update2);
      }
    }
  }
  const springs = ctrls.current.map((ctrl, i2) => getSprings(ctrl, updates[i2]));
  const context = reactExports.useContext(SpringContext);
  const prevContext = usePrev(context);
  const hasContext = context !== prevContext && hasProps(context);
  useLayoutEffect(() => {
    layoutId.current++;
    state.ctrls = ctrls.current;
    const {
      queue
    } = state;
    if (queue.length) {
      state.queue = [];
      each(queue, (cb) => cb());
    }
    each(ctrls.current, (ctrl, i2) => {
      ref == null ? void 0 : ref.add(ctrl);
      if (hasContext) {
        ctrl.start({
          default: context
        });
      }
      const update2 = updates[i2];
      if (update2) {
        replaceRef(ctrl, update2.ref);
        if (ctrl.ref) {
          ctrl.queue.push(update2);
        } else {
          ctrl.start(update2);
        }
      }
    });
  });
  useOnce(() => () => {
    each(state.ctrls, (ctrl) => ctrl.stop(true));
  });
  const values = springs.map((x2) => _extends({}, x2));
  return ref ? [values, ref] : values;
}
function useSpring(props, deps) {
  const isFn = is.fun(props);
  const [[values], ref] = useSprings(1, isFn ? props : [props], isFn ? [] : deps);
  return isFn || arguments.length == 2 ? [values, ref] : values;
}
let TransitionPhase;
(function(TransitionPhase2) {
  TransitionPhase2["MOUNT"] = "mount";
  TransitionPhase2["ENTER"] = "enter";
  TransitionPhase2["UPDATE"] = "update";
  TransitionPhase2["LEAVE"] = "leave";
})(TransitionPhase || (TransitionPhase = {}));
class Interpolation extends FrameValue {
  constructor(source, args) {
    super();
    this.key = void 0;
    this.idle = true;
    this.calc = void 0;
    this._active = /* @__PURE__ */ new Set();
    this.source = source;
    this.calc = createInterpolator(...args);
    const value = this._get();
    const nodeType = getAnimatedType(value);
    setAnimated(this, nodeType.create(value));
  }
  advance(_dt) {
    const value = this._get();
    const oldValue = this.get();
    if (!isEqual(value, oldValue)) {
      getAnimated(this).setValue(value);
      this._onChange(value, this.idle);
    }
    if (!this.idle && checkIdle(this._active)) {
      becomeIdle(this);
    }
  }
  _get() {
    const inputs = is.arr(this.source) ? this.source.map(getFluidValue) : toArray(getFluidValue(this.source));
    return this.calc(...inputs);
  }
  _start() {
    if (this.idle && !checkIdle(this._active)) {
      this.idle = false;
      each(getPayload(this), (node) => {
        node.done = false;
      });
      if (globals.skipAnimation) {
        raf.batchedUpdates(() => this.advance());
        becomeIdle(this);
      } else {
        frameLoop.start(this);
      }
    }
  }
  _attach() {
    let priority2 = 1;
    each(toArray(this.source), (source) => {
      if (hasFluidValue(source)) {
        addFluidObserver(source, this);
      }
      if (isFrameValue(source)) {
        if (!source.idle) {
          this._active.add(source);
        }
        priority2 = Math.max(priority2, source.priority + 1);
      }
    });
    this.priority = priority2;
    this._start();
  }
  _detach() {
    each(toArray(this.source), (source) => {
      if (hasFluidValue(source)) {
        removeFluidObserver(source, this);
      }
    });
    this._active.clear();
    becomeIdle(this);
  }
  eventObserved(event) {
    if (event.type == "change") {
      if (event.idle) {
        this.advance();
      } else {
        this._active.add(event.parent);
        this._start();
      }
    } else if (event.type == "idle") {
      this._active.delete(event.parent);
    } else if (event.type == "priority") {
      this.priority = toArray(this.source).reduce((highest, parent) => Math.max(highest, (isFrameValue(parent) ? parent.priority : 0) + 1), 0);
    }
  }
}
function isIdle(source) {
  return source.idle !== false;
}
function checkIdle(active) {
  return !active.size || Array.from(active).every(isIdle);
}
function becomeIdle(self2) {
  if (!self2.idle) {
    self2.idle = true;
    each(getPayload(self2), (node) => {
      node.done = true;
    });
    callFluidObservers(self2, {
      type: "idle",
      parent: self2
    });
  }
}
const to = (source, ...args) => new Interpolation(source, args);
globals.assign({
  createStringInterpolator,
  to: (source, args) => new Interpolation(source, args)
});
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i2;
  for (i2 = 0; i2 < sourceKeys.length; i2++) {
    key = sourceKeys[i2];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
const _excluded$2 = ["style", "children", "scrollTop", "scrollLeft"];
const isCustomPropRE = /^--/;
function dangerousStyleValue(name, value) {
  if (value == null || typeof value === "boolean" || value === "") return "";
  if (typeof value === "number" && value !== 0 && !isCustomPropRE.test(name) && !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])) return value + "px";
  return ("" + value).trim();
}
const attributeCache = {};
function applyAnimatedValues(instance, props) {
  if (!instance.nodeType || !instance.setAttribute) {
    return false;
  }
  const isFilterElement = instance.nodeName === "filter" || instance.parentNode && instance.parentNode.nodeName === "filter";
  const _ref = props, {
    style,
    children,
    scrollTop,
    scrollLeft
  } = _ref, attributes = _objectWithoutPropertiesLoose(_ref, _excluded$2);
  const values = Object.values(attributes);
  const names = Object.keys(attributes).map((name) => isFilterElement || instance.hasAttribute(name) ? name : attributeCache[name] || (attributeCache[name] = name.replace(/([A-Z])/g, (n2) => "-" + n2.toLowerCase())));
  if (children !== void 0) {
    instance.textContent = children;
  }
  for (let name in style) {
    if (style.hasOwnProperty(name)) {
      const value = dangerousStyleValue(name, style[name]);
      if (isCustomPropRE.test(name)) {
        instance.style.setProperty(name, value);
      } else {
        instance.style[name] = value;
      }
    }
  }
  names.forEach((name, i2) => {
    instance.setAttribute(name, values[i2]);
  });
  if (scrollTop !== void 0) {
    instance.scrollTop = scrollTop;
  }
  if (scrollLeft !== void 0) {
    instance.scrollLeft = scrollLeft;
  }
}
let isUnitlessNumber = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true
};
const prefixKey = (prefix2, key) => prefix2 + key.charAt(0).toUpperCase() + key.substring(1);
const prefixes$1 = ["Webkit", "Ms", "Moz", "O"];
isUnitlessNumber = Object.keys(isUnitlessNumber).reduce((acc, prop) => {
  prefixes$1.forEach((prefix2) => acc[prefixKey(prefix2, prop)] = acc[prop]);
  return acc;
}, isUnitlessNumber);
const _excluded$1 = ["x", "y", "z"];
const domTransforms = /^(matrix|translate|scale|rotate|skew)/;
const pxTransforms = /^(translate)/;
const degTransforms = /^(rotate|skew)/;
const addUnit = (value, unit) => is.num(value) && value !== 0 ? value + unit : value;
const isValueIdentity = (value, id) => is.arr(value) ? value.every((v2) => isValueIdentity(v2, id)) : is.num(value) ? value === id : parseFloat(value) === id;
class AnimatedStyle extends AnimatedObject {
  constructor(_ref) {
    let {
      x: x2,
      y: y2,
      z: z2
    } = _ref, style = _objectWithoutPropertiesLoose(_ref, _excluded$1);
    const inputs = [];
    const transforms = [];
    if (x2 || y2 || z2) {
      inputs.push([x2 || 0, y2 || 0, z2 || 0]);
      transforms.push((xyz) => [`translate3d(${xyz.map((v2) => addUnit(v2, "px")).join(",")})`, isValueIdentity(xyz, 0)]);
    }
    eachProp(style, (value, key) => {
      if (key === "transform") {
        inputs.push([value || ""]);
        transforms.push((transform2) => [transform2, transform2 === ""]);
      } else if (domTransforms.test(key)) {
        delete style[key];
        if (is.und(value)) return;
        const unit = pxTransforms.test(key) ? "px" : degTransforms.test(key) ? "deg" : "";
        inputs.push(toArray(value));
        transforms.push(key === "rotate3d" ? ([x3, y3, z3, deg]) => [`rotate3d(${x3},${y3},${z3},${addUnit(deg, unit)})`, isValueIdentity(deg, 0)] : (input) => [`${key}(${input.map((v2) => addUnit(v2, unit)).join(",")})`, isValueIdentity(input, key.startsWith("scale") ? 1 : 0)]);
      }
    });
    if (inputs.length) {
      style.transform = new FluidTransform(inputs, transforms);
    }
    super(style);
  }
}
class FluidTransform extends FluidValue {
  constructor(inputs, transforms) {
    super();
    this._value = null;
    this.inputs = inputs;
    this.transforms = transforms;
  }
  get() {
    return this._value || (this._value = this._get());
  }
  _get() {
    let transform2 = "";
    let identity2 = true;
    each(this.inputs, (input, i2) => {
      const arg1 = getFluidValue(input[0]);
      const [t2, id] = this.transforms[i2](is.arr(arg1) ? arg1 : input.map(getFluidValue));
      transform2 += " " + t2;
      identity2 = identity2 && id;
    });
    return identity2 ? "none" : transform2;
  }
  observerAdded(count) {
    if (count == 1) each(this.inputs, (input) => each(input, (value) => hasFluidValue(value) && addFluidObserver(value, this)));
  }
  observerRemoved(count) {
    if (count == 0) each(this.inputs, (input) => each(input, (value) => hasFluidValue(value) && removeFluidObserver(value, this)));
  }
  eventObserved(event) {
    if (event.type == "change") {
      this._value = null;
    }
    callFluidObservers(this, event);
  }
}
const primitives = ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "menu", "menuitem", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr", "circle", "clipPath", "defs", "ellipse", "foreignObject", "g", "image", "line", "linearGradient", "mask", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "text", "tspan"];
const _excluded = ["scrollTop", "scrollLeft"];
globals.assign({
  batchedUpdates: reactDomExports.unstable_batchedUpdates,
  createStringInterpolator,
  colors: colors$2
});
const host = createHost(primitives, {
  applyAnimatedValues,
  createAnimatedStyle: (style) => new AnimatedStyle(style),
  getComponentProps: (_ref) => {
    let props = _objectWithoutPropertiesLoose(_ref, _excluded);
    return props;
  }
});
const animated = host.animated;
var _stackClear;
var hasRequired_stackClear;
function require_stackClear() {
  if (hasRequired_stackClear) return _stackClear;
  hasRequired_stackClear = 1;
  var ListCache = require_ListCache();
  function stackClear() {
    this.__data__ = new ListCache();
    this.size = 0;
  }
  _stackClear = stackClear;
  return _stackClear;
}
var _stackDelete;
var hasRequired_stackDelete;
function require_stackDelete() {
  if (hasRequired_stackDelete) return _stackDelete;
  hasRequired_stackDelete = 1;
  function stackDelete(key) {
    var data = this.__data__, result = data["delete"](key);
    this.size = data.size;
    return result;
  }
  _stackDelete = stackDelete;
  return _stackDelete;
}
var _stackGet;
var hasRequired_stackGet;
function require_stackGet() {
  if (hasRequired_stackGet) return _stackGet;
  hasRequired_stackGet = 1;
  function stackGet(key) {
    return this.__data__.get(key);
  }
  _stackGet = stackGet;
  return _stackGet;
}
var _stackHas;
var hasRequired_stackHas;
function require_stackHas() {
  if (hasRequired_stackHas) return _stackHas;
  hasRequired_stackHas = 1;
  function stackHas(key) {
    return this.__data__.has(key);
  }
  _stackHas = stackHas;
  return _stackHas;
}
var _stackSet;
var hasRequired_stackSet;
function require_stackSet() {
  if (hasRequired_stackSet) return _stackSet;
  hasRequired_stackSet = 1;
  var ListCache = require_ListCache(), Map2 = require_Map(), MapCache = require_MapCache();
  var LARGE_ARRAY_SIZE = 200;
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs = data.__data__;
      if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }
  _stackSet = stackSet;
  return _stackSet;
}
var _Stack;
var hasRequired_Stack;
function require_Stack() {
  if (hasRequired_Stack) return _Stack;
  hasRequired_Stack = 1;
  var ListCache = require_ListCache(), stackClear = require_stackClear(), stackDelete = require_stackDelete(), stackGet = require_stackGet(), stackHas = require_stackHas(), stackSet = require_stackSet();
  function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }
  Stack.prototype.clear = stackClear;
  Stack.prototype["delete"] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;
  _Stack = Stack;
  return _Stack;
}
var _defineProperty;
var hasRequired_defineProperty;
function require_defineProperty() {
  if (hasRequired_defineProperty) return _defineProperty;
  hasRequired_defineProperty = 1;
  var getNative = require_getNative();
  var defineProperty = (function() {
    try {
      var func = getNative(Object, "defineProperty");
      func({}, "", {});
      return func;
    } catch (e2) {
    }
  })();
  _defineProperty = defineProperty;
  return _defineProperty;
}
var _baseAssignValue;
var hasRequired_baseAssignValue;
function require_baseAssignValue() {
  if (hasRequired_baseAssignValue) return _baseAssignValue;
  hasRequired_baseAssignValue = 1;
  var defineProperty = require_defineProperty();
  function baseAssignValue(object2, key, value) {
    if (key == "__proto__" && defineProperty) {
      defineProperty(object2, key, {
        "configurable": true,
        "enumerable": true,
        "value": value,
        "writable": true
      });
    } else {
      object2[key] = value;
    }
  }
  _baseAssignValue = baseAssignValue;
  return _baseAssignValue;
}
var _assignMergeValue;
var hasRequired_assignMergeValue;
function require_assignMergeValue() {
  if (hasRequired_assignMergeValue) return _assignMergeValue;
  hasRequired_assignMergeValue = 1;
  var baseAssignValue = require_baseAssignValue(), eq = requireEq();
  function assignMergeValue(object2, key, value) {
    if (value !== void 0 && !eq(object2[key], value) || value === void 0 && !(key in object2)) {
      baseAssignValue(object2, key, value);
    }
  }
  _assignMergeValue = assignMergeValue;
  return _assignMergeValue;
}
var _createBaseFor;
var hasRequired_createBaseFor;
function require_createBaseFor() {
  if (hasRequired_createBaseFor) return _createBaseFor;
  hasRequired_createBaseFor = 1;
  function createBaseFor(fromRight) {
    return function(object2, iteratee, keysFunc) {
      var index2 = -1, iterable = Object(object2), props = keysFunc(object2), length2 = props.length;
      while (length2--) {
        var key = props[fromRight ? length2 : ++index2];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object2;
    };
  }
  _createBaseFor = createBaseFor;
  return _createBaseFor;
}
var _baseFor;
var hasRequired_baseFor;
function require_baseFor() {
  if (hasRequired_baseFor) return _baseFor;
  hasRequired_baseFor = 1;
  var createBaseFor = require_createBaseFor();
  var baseFor = createBaseFor();
  _baseFor = baseFor;
  return _baseFor;
}
var _cloneBuffer = { exports: {} };
_cloneBuffer.exports;
var hasRequired_cloneBuffer;
function require_cloneBuffer() {
  if (hasRequired_cloneBuffer) return _cloneBuffer.exports;
  hasRequired_cloneBuffer = 1;
  (function(module, exports) {
    var root = require_root();
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = freeExports && true && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer = moduleExports ? root.Buffer : void 0, allocUnsafe = Buffer ? Buffer.allocUnsafe : void 0;
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length2 = buffer.length, result = allocUnsafe ? allocUnsafe(length2) : new buffer.constructor(length2);
      buffer.copy(result);
      return result;
    }
    module.exports = cloneBuffer;
  })(_cloneBuffer, _cloneBuffer.exports);
  return _cloneBuffer.exports;
}
var _Uint8Array;
var hasRequired_Uint8Array;
function require_Uint8Array() {
  if (hasRequired_Uint8Array) return _Uint8Array;
  hasRequired_Uint8Array = 1;
  var root = require_root();
  var Uint8Array = root.Uint8Array;
  _Uint8Array = Uint8Array;
  return _Uint8Array;
}
var _cloneArrayBuffer;
var hasRequired_cloneArrayBuffer;
function require_cloneArrayBuffer() {
  if (hasRequired_cloneArrayBuffer) return _cloneArrayBuffer;
  hasRequired_cloneArrayBuffer = 1;
  var Uint8Array = require_Uint8Array();
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array(result).set(new Uint8Array(arrayBuffer));
    return result;
  }
  _cloneArrayBuffer = cloneArrayBuffer;
  return _cloneArrayBuffer;
}
var _cloneTypedArray;
var hasRequired_cloneTypedArray;
function require_cloneTypedArray() {
  if (hasRequired_cloneTypedArray) return _cloneTypedArray;
  hasRequired_cloneTypedArray = 1;
  var cloneArrayBuffer = require_cloneArrayBuffer();
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }
  _cloneTypedArray = cloneTypedArray;
  return _cloneTypedArray;
}
var _copyArray;
var hasRequired_copyArray;
function require_copyArray() {
  if (hasRequired_copyArray) return _copyArray;
  hasRequired_copyArray = 1;
  function copyArray(source, array) {
    var index2 = -1, length2 = source.length;
    array || (array = Array(length2));
    while (++index2 < length2) {
      array[index2] = source[index2];
    }
    return array;
  }
  _copyArray = copyArray;
  return _copyArray;
}
var _baseCreate;
var hasRequired_baseCreate;
function require_baseCreate() {
  if (hasRequired_baseCreate) return _baseCreate;
  hasRequired_baseCreate = 1;
  var isObject = requireIsObject();
  var objectCreate = Object.create;
  var baseCreate = /* @__PURE__ */ (function() {
    function object2() {
    }
    return function(proto) {
      if (!isObject(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object2.prototype = proto;
      var result = new object2();
      object2.prototype = void 0;
      return result;
    };
  })();
  _baseCreate = baseCreate;
  return _baseCreate;
}
var _overArg;
var hasRequired_overArg;
function require_overArg() {
  if (hasRequired_overArg) return _overArg;
  hasRequired_overArg = 1;
  function overArg(func, transform2) {
    return function(arg) {
      return func(transform2(arg));
    };
  }
  _overArg = overArg;
  return _overArg;
}
var _getPrototype;
var hasRequired_getPrototype;
function require_getPrototype() {
  if (hasRequired_getPrototype) return _getPrototype;
  hasRequired_getPrototype = 1;
  var overArg = require_overArg();
  var getPrototype = overArg(Object.getPrototypeOf, Object);
  _getPrototype = getPrototype;
  return _getPrototype;
}
var _isPrototype;
var hasRequired_isPrototype;
function require_isPrototype() {
  if (hasRequired_isPrototype) return _isPrototype;
  hasRequired_isPrototype = 1;
  var objectProto = Object.prototype;
  function isPrototype(value) {
    var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
    return value === proto;
  }
  _isPrototype = isPrototype;
  return _isPrototype;
}
var _initCloneObject;
var hasRequired_initCloneObject;
function require_initCloneObject() {
  if (hasRequired_initCloneObject) return _initCloneObject;
  hasRequired_initCloneObject = 1;
  var baseCreate = require_baseCreate(), getPrototype = require_getPrototype(), isPrototype = require_isPrototype();
  function initCloneObject(object2) {
    return typeof object2.constructor == "function" && !isPrototype(object2) ? baseCreate(getPrototype(object2)) : {};
  }
  _initCloneObject = initCloneObject;
  return _initCloneObject;
}
var _baseIsArguments;
var hasRequired_baseIsArguments;
function require_baseIsArguments() {
  if (hasRequired_baseIsArguments) return _baseIsArguments;
  hasRequired_baseIsArguments = 1;
  var baseGetTag = require_baseGetTag(), isObjectLike = requireIsObjectLike();
  var argsTag = "[object Arguments]";
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }
  _baseIsArguments = baseIsArguments;
  return _baseIsArguments;
}
var isArguments_1;
var hasRequiredIsArguments;
function requireIsArguments() {
  if (hasRequiredIsArguments) return isArguments_1;
  hasRequiredIsArguments = 1;
  var baseIsArguments = require_baseIsArguments(), isObjectLike = requireIsObjectLike();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var isArguments = baseIsArguments(/* @__PURE__ */ (function() {
    return arguments;
  })()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
  };
  isArguments_1 = isArguments;
  return isArguments_1;
}
var isArray_1;
var hasRequiredIsArray;
function requireIsArray() {
  if (hasRequiredIsArray) return isArray_1;
  hasRequiredIsArray = 1;
  var isArray = Array.isArray;
  isArray_1 = isArray;
  return isArray_1;
}
var isLength_1;
var hasRequiredIsLength;
function requireIsLength() {
  if (hasRequiredIsLength) return isLength_1;
  hasRequiredIsLength = 1;
  var MAX_SAFE_INTEGER = 9007199254740991;
  function isLength(value) {
    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }
  isLength_1 = isLength;
  return isLength_1;
}
var isArrayLike_1;
var hasRequiredIsArrayLike;
function requireIsArrayLike() {
  if (hasRequiredIsArrayLike) return isArrayLike_1;
  hasRequiredIsArrayLike = 1;
  var isFunction = requireIsFunction(), isLength = requireIsLength();
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }
  isArrayLike_1 = isArrayLike;
  return isArrayLike_1;
}
var isArrayLikeObject_1;
var hasRequiredIsArrayLikeObject;
function requireIsArrayLikeObject() {
  if (hasRequiredIsArrayLikeObject) return isArrayLikeObject_1;
  hasRequiredIsArrayLikeObject = 1;
  var isArrayLike = requireIsArrayLike(), isObjectLike = requireIsObjectLike();
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }
  isArrayLikeObject_1 = isArrayLikeObject;
  return isArrayLikeObject_1;
}
var isBuffer = { exports: {} };
var stubFalse_1;
var hasRequiredStubFalse;
function requireStubFalse() {
  if (hasRequiredStubFalse) return stubFalse_1;
  hasRequiredStubFalse = 1;
  function stubFalse() {
    return false;
  }
  stubFalse_1 = stubFalse;
  return stubFalse_1;
}
isBuffer.exports;
var hasRequiredIsBuffer;
function requireIsBuffer() {
  if (hasRequiredIsBuffer) return isBuffer.exports;
  hasRequiredIsBuffer = 1;
  (function(module, exports) {
    var root = require_root(), stubFalse = requireStubFalse();
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = freeExports && true && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer = moduleExports ? root.Buffer : void 0;
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : void 0;
    var isBuffer2 = nativeIsBuffer || stubFalse;
    module.exports = isBuffer2;
  })(isBuffer, isBuffer.exports);
  return isBuffer.exports;
}
var isPlainObject_1;
var hasRequiredIsPlainObject;
function requireIsPlainObject() {
  if (hasRequiredIsPlainObject) return isPlainObject_1;
  hasRequiredIsPlainObject = 1;
  var baseGetTag = require_baseGetTag(), getPrototype = require_getPrototype(), isObjectLike = requireIsObjectLike();
  var objectTag = "[object Object]";
  var funcProto = Function.prototype, objectProto = Object.prototype;
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var objectCtorString = funcToString.call(Object);
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
  }
  isPlainObject_1 = isPlainObject;
  return isPlainObject_1;
}
var _baseIsTypedArray;
var hasRequired_baseIsTypedArray;
function require_baseIsTypedArray() {
  if (hasRequired_baseIsTypedArray) return _baseIsTypedArray;
  hasRequired_baseIsTypedArray = 1;
  var baseGetTag = require_baseGetTag(), isLength = requireIsLength(), isObjectLike = requireIsObjectLike();
  var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  function baseIsTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }
  _baseIsTypedArray = baseIsTypedArray;
  return _baseIsTypedArray;
}
var _baseUnary;
var hasRequired_baseUnary;
function require_baseUnary() {
  if (hasRequired_baseUnary) return _baseUnary;
  hasRequired_baseUnary = 1;
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }
  _baseUnary = baseUnary;
  return _baseUnary;
}
var _nodeUtil = { exports: {} };
_nodeUtil.exports;
var hasRequired_nodeUtil;
function require_nodeUtil() {
  if (hasRequired_nodeUtil) return _nodeUtil.exports;
  hasRequired_nodeUtil = 1;
  (function(module, exports) {
    var freeGlobal = require_freeGlobal();
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = freeExports && true && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = (function() {
      try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e2) {
      }
    })();
    module.exports = nodeUtil;
  })(_nodeUtil, _nodeUtil.exports);
  return _nodeUtil.exports;
}
var isTypedArray_1;
var hasRequiredIsTypedArray;
function requireIsTypedArray() {
  if (hasRequiredIsTypedArray) return isTypedArray_1;
  hasRequiredIsTypedArray = 1;
  var baseIsTypedArray = require_baseIsTypedArray(), baseUnary = require_baseUnary(), nodeUtil = require_nodeUtil();
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
  isTypedArray_1 = isTypedArray;
  return isTypedArray_1;
}
var _safeGet;
var hasRequired_safeGet;
function require_safeGet() {
  if (hasRequired_safeGet) return _safeGet;
  hasRequired_safeGet = 1;
  function safeGet(object2, key) {
    if (key === "constructor" && typeof object2[key] === "function") {
      return;
    }
    if (key == "__proto__") {
      return;
    }
    return object2[key];
  }
  _safeGet = safeGet;
  return _safeGet;
}
var _assignValue;
var hasRequired_assignValue;
function require_assignValue() {
  if (hasRequired_assignValue) return _assignValue;
  hasRequired_assignValue = 1;
  var baseAssignValue = require_baseAssignValue(), eq = requireEq();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function assignValue(object2, key, value) {
    var objValue = object2[key];
    if (!(hasOwnProperty.call(object2, key) && eq(objValue, value)) || value === void 0 && !(key in object2)) {
      baseAssignValue(object2, key, value);
    }
  }
  _assignValue = assignValue;
  return _assignValue;
}
var _copyObject;
var hasRequired_copyObject;
function require_copyObject() {
  if (hasRequired_copyObject) return _copyObject;
  hasRequired_copyObject = 1;
  var assignValue = require_assignValue(), baseAssignValue = require_baseAssignValue();
  function copyObject(source, props, object2, customizer) {
    var isNew = !object2;
    object2 || (object2 = {});
    var index2 = -1, length2 = props.length;
    while (++index2 < length2) {
      var key = props[index2];
      var newValue = customizer ? customizer(object2[key], source[key], key, object2, source) : void 0;
      if (newValue === void 0) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object2, key, newValue);
      } else {
        assignValue(object2, key, newValue);
      }
    }
    return object2;
  }
  _copyObject = copyObject;
  return _copyObject;
}
var _baseTimes;
var hasRequired_baseTimes;
function require_baseTimes() {
  if (hasRequired_baseTimes) return _baseTimes;
  hasRequired_baseTimes = 1;
  function baseTimes(n2, iteratee) {
    var index2 = -1, result = Array(n2);
    while (++index2 < n2) {
      result[index2] = iteratee(index2);
    }
    return result;
  }
  _baseTimes = baseTimes;
  return _baseTimes;
}
var _isIndex;
var hasRequired_isIndex;
function require_isIndex() {
  if (hasRequired_isIndex) return _isIndex;
  hasRequired_isIndex = 1;
  var MAX_SAFE_INTEGER = 9007199254740991;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  function isIndex(value, length2) {
    var type = typeof value;
    length2 = length2 == null ? MAX_SAFE_INTEGER : length2;
    return !!length2 && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length2);
  }
  _isIndex = isIndex;
  return _isIndex;
}
var _arrayLikeKeys;
var hasRequired_arrayLikeKeys;
function require_arrayLikeKeys() {
  if (hasRequired_arrayLikeKeys) return _arrayLikeKeys;
  hasRequired_arrayLikeKeys = 1;
  var baseTimes = require_baseTimes(), isArguments = requireIsArguments(), isArray = requireIsArray(), isBuffer2 = requireIsBuffer(), isIndex = require_isIndex(), isTypedArray = requireIsTypedArray();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer2(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length2 = result.length;
    for (var key in value) {
      if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
      (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
      isIndex(key, length2)))) {
        result.push(key);
      }
    }
    return result;
  }
  _arrayLikeKeys = arrayLikeKeys;
  return _arrayLikeKeys;
}
var _nativeKeysIn;
var hasRequired_nativeKeysIn;
function require_nativeKeysIn() {
  if (hasRequired_nativeKeysIn) return _nativeKeysIn;
  hasRequired_nativeKeysIn = 1;
  function nativeKeysIn(object2) {
    var result = [];
    if (object2 != null) {
      for (var key in Object(object2)) {
        result.push(key);
      }
    }
    return result;
  }
  _nativeKeysIn = nativeKeysIn;
  return _nativeKeysIn;
}
var _baseKeysIn;
var hasRequired_baseKeysIn;
function require_baseKeysIn() {
  if (hasRequired_baseKeysIn) return _baseKeysIn;
  hasRequired_baseKeysIn = 1;
  var isObject = requireIsObject(), isPrototype = require_isPrototype(), nativeKeysIn = require_nativeKeysIn();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseKeysIn(object2) {
    if (!isObject(object2)) {
      return nativeKeysIn(object2);
    }
    var isProto = isPrototype(object2), result = [];
    for (var key in object2) {
      if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object2, key)))) {
        result.push(key);
      }
    }
    return result;
  }
  _baseKeysIn = baseKeysIn;
  return _baseKeysIn;
}
var keysIn_1;
var hasRequiredKeysIn;
function requireKeysIn() {
  if (hasRequiredKeysIn) return keysIn_1;
  hasRequiredKeysIn = 1;
  var arrayLikeKeys = require_arrayLikeKeys(), baseKeysIn = require_baseKeysIn(), isArrayLike = requireIsArrayLike();
  function keysIn(object2) {
    return isArrayLike(object2) ? arrayLikeKeys(object2, true) : baseKeysIn(object2);
  }
  keysIn_1 = keysIn;
  return keysIn_1;
}
var toPlainObject_1;
var hasRequiredToPlainObject;
function requireToPlainObject() {
  if (hasRequiredToPlainObject) return toPlainObject_1;
  hasRequiredToPlainObject = 1;
  var copyObject = require_copyObject(), keysIn = requireKeysIn();
  function toPlainObject(value) {
    return copyObject(value, keysIn(value));
  }
  toPlainObject_1 = toPlainObject;
  return toPlainObject_1;
}
var _baseMergeDeep;
var hasRequired_baseMergeDeep;
function require_baseMergeDeep() {
  if (hasRequired_baseMergeDeep) return _baseMergeDeep;
  hasRequired_baseMergeDeep = 1;
  var assignMergeValue = require_assignMergeValue(), cloneBuffer = require_cloneBuffer(), cloneTypedArray = require_cloneTypedArray(), copyArray = require_copyArray(), initCloneObject = require_initCloneObject(), isArguments = requireIsArguments(), isArray = requireIsArray(), isArrayLikeObject = requireIsArrayLikeObject(), isBuffer2 = requireIsBuffer(), isFunction = requireIsFunction(), isObject = requireIsObject(), isPlainObject = requireIsPlainObject(), isTypedArray = requireIsTypedArray(), safeGet = require_safeGet(), toPlainObject = requireToPlainObject();
  function baseMergeDeep(object2, source, key, srcIndex, mergeFunc, customizer, stack) {
    var objValue = safeGet(object2, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
    if (stacked) {
      assignMergeValue(object2, key, stacked);
      return;
    }
    var newValue = customizer ? customizer(objValue, srcValue, key + "", object2, source, stack) : void 0;
    var isCommon = newValue === void 0;
    if (isCommon) {
      var isArr = isArray(srcValue), isBuff = !isArr && isBuffer2(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
      newValue = srcValue;
      if (isArr || isBuff || isTyped) {
        if (isArray(objValue)) {
          newValue = objValue;
        } else if (isArrayLikeObject(objValue)) {
          newValue = copyArray(objValue);
        } else if (isBuff) {
          isCommon = false;
          newValue = cloneBuffer(srcValue, true);
        } else if (isTyped) {
          isCommon = false;
          newValue = cloneTypedArray(srcValue, true);
        } else {
          newValue = [];
        }
      } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
        newValue = objValue;
        if (isArguments(objValue)) {
          newValue = toPlainObject(objValue);
        } else if (!isObject(objValue) || isFunction(objValue)) {
          newValue = initCloneObject(srcValue);
        }
      } else {
        isCommon = false;
      }
    }
    if (isCommon) {
      stack.set(srcValue, newValue);
      mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
      stack["delete"](srcValue);
    }
    assignMergeValue(object2, key, newValue);
  }
  _baseMergeDeep = baseMergeDeep;
  return _baseMergeDeep;
}
var _baseMerge;
var hasRequired_baseMerge;
function require_baseMerge() {
  if (hasRequired_baseMerge) return _baseMerge;
  hasRequired_baseMerge = 1;
  var Stack = require_Stack(), assignMergeValue = require_assignMergeValue(), baseFor = require_baseFor(), baseMergeDeep = require_baseMergeDeep(), isObject = requireIsObject(), keysIn = requireKeysIn(), safeGet = require_safeGet();
  function baseMerge(object2, source, srcIndex, customizer, stack) {
    if (object2 === source) {
      return;
    }
    baseFor(source, function(srcValue, key) {
      stack || (stack = new Stack());
      if (isObject(srcValue)) {
        baseMergeDeep(object2, source, key, srcIndex, baseMerge, customizer, stack);
      } else {
        var newValue = customizer ? customizer(safeGet(object2, key), srcValue, key + "", object2, source, stack) : void 0;
        if (newValue === void 0) {
          newValue = srcValue;
        }
        assignMergeValue(object2, key, newValue);
      }
    }, keysIn);
  }
  _baseMerge = baseMerge;
  return _baseMerge;
}
var identity_1;
var hasRequiredIdentity;
function requireIdentity() {
  if (hasRequiredIdentity) return identity_1;
  hasRequiredIdentity = 1;
  function identity2(value) {
    return value;
  }
  identity_1 = identity2;
  return identity_1;
}
var _apply;
var hasRequired_apply;
function require_apply() {
  if (hasRequired_apply) return _apply;
  hasRequired_apply = 1;
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0:
        return func.call(thisArg);
      case 1:
        return func.call(thisArg, args[0]);
      case 2:
        return func.call(thisArg, args[0], args[1]);
      case 3:
        return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }
  _apply = apply;
  return _apply;
}
var _overRest;
var hasRequired_overRest;
function require_overRest() {
  if (hasRequired_overRest) return _overRest;
  hasRequired_overRest = 1;
  var apply = require_apply();
  var nativeMax = Math.max;
  function overRest(func, start2, transform2) {
    start2 = nativeMax(start2 === void 0 ? func.length - 1 : start2, 0);
    return function() {
      var args = arguments, index2 = -1, length2 = nativeMax(args.length - start2, 0), array = Array(length2);
      while (++index2 < length2) {
        array[index2] = args[start2 + index2];
      }
      index2 = -1;
      var otherArgs = Array(start2 + 1);
      while (++index2 < start2) {
        otherArgs[index2] = args[index2];
      }
      otherArgs[start2] = transform2(array);
      return apply(func, this, otherArgs);
    };
  }
  _overRest = overRest;
  return _overRest;
}
var constant_1;
var hasRequiredConstant;
function requireConstant() {
  if (hasRequiredConstant) return constant_1;
  hasRequiredConstant = 1;
  function constant2(value) {
    return function() {
      return value;
    };
  }
  constant_1 = constant2;
  return constant_1;
}
var _baseSetToString;
var hasRequired_baseSetToString;
function require_baseSetToString() {
  if (hasRequired_baseSetToString) return _baseSetToString;
  hasRequired_baseSetToString = 1;
  var constant2 = requireConstant(), defineProperty = require_defineProperty(), identity2 = requireIdentity();
  var baseSetToString = !defineProperty ? identity2 : function(func, string) {
    return defineProperty(func, "toString", {
      "configurable": true,
      "enumerable": false,
      "value": constant2(string),
      "writable": true
    });
  };
  _baseSetToString = baseSetToString;
  return _baseSetToString;
}
var _shortOut;
var hasRequired_shortOut;
function require_shortOut() {
  if (hasRequired_shortOut) return _shortOut;
  hasRequired_shortOut = 1;
  var HOT_COUNT = 800, HOT_SPAN = 16;
  var nativeNow = Date.now;
  function shortOut(func) {
    var count = 0, lastCalled = 0;
    return function() {
      var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(void 0, arguments);
    };
  }
  _shortOut = shortOut;
  return _shortOut;
}
var _setToString;
var hasRequired_setToString;
function require_setToString() {
  if (hasRequired_setToString) return _setToString;
  hasRequired_setToString = 1;
  var baseSetToString = require_baseSetToString(), shortOut = require_shortOut();
  var setToString = shortOut(baseSetToString);
  _setToString = setToString;
  return _setToString;
}
var _baseRest;
var hasRequired_baseRest;
function require_baseRest() {
  if (hasRequired_baseRest) return _baseRest;
  hasRequired_baseRest = 1;
  var identity2 = requireIdentity(), overRest = require_overRest(), setToString = require_setToString();
  function baseRest(func, start2) {
    return setToString(overRest(func, start2, identity2), func + "");
  }
  _baseRest = baseRest;
  return _baseRest;
}
var _isIterateeCall;
var hasRequired_isIterateeCall;
function require_isIterateeCall() {
  if (hasRequired_isIterateeCall) return _isIterateeCall;
  hasRequired_isIterateeCall = 1;
  var eq = requireEq(), isArrayLike = requireIsArrayLike(), isIndex = require_isIndex(), isObject = requireIsObject();
  function isIterateeCall(value, index2, object2) {
    if (!isObject(object2)) {
      return false;
    }
    var type = typeof index2;
    if (type == "number" ? isArrayLike(object2) && isIndex(index2, object2.length) : type == "string" && index2 in object2) {
      return eq(object2[index2], value);
    }
    return false;
  }
  _isIterateeCall = isIterateeCall;
  return _isIterateeCall;
}
var _createAssigner;
var hasRequired_createAssigner;
function require_createAssigner() {
  if (hasRequired_createAssigner) return _createAssigner;
  hasRequired_createAssigner = 1;
  var baseRest = require_baseRest(), isIterateeCall = require_isIterateeCall();
  function createAssigner(assigner) {
    return baseRest(function(object2, sources) {
      var index2 = -1, length2 = sources.length, customizer = length2 > 1 ? sources[length2 - 1] : void 0, guard = length2 > 2 ? sources[2] : void 0;
      customizer = assigner.length > 3 && typeof customizer == "function" ? (length2--, customizer) : void 0;
      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length2 < 3 ? void 0 : customizer;
        length2 = 1;
      }
      object2 = Object(object2);
      while (++index2 < length2) {
        var source = sources[index2];
        if (source) {
          assigner(object2, source, index2, customizer);
        }
      }
      return object2;
    });
  }
  _createAssigner = createAssigner;
  return _createAssigner;
}
var merge_1;
var hasRequiredMerge;
function requireMerge() {
  if (hasRequiredMerge) return merge_1;
  hasRequiredMerge = 1;
  var baseMerge = require_baseMerge(), createAssigner = require_createAssigner();
  var merge2 = createAssigner(function(object2, source, srcIndex) {
    baseMerge(object2, source, srcIndex);
  });
  merge_1 = merge2;
  return merge_1;
}
var mergeExports = requireMerge();
const i$2 = /* @__PURE__ */ getDefaultExportFromCjs(mergeExports);
var _isKey;
var hasRequired_isKey;
function require_isKey() {
  if (hasRequired_isKey) return _isKey;
  hasRequired_isKey = 1;
  var isArray = requireIsArray(), isSymbol = requireIsSymbol();
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
  function isKey(value, object2) {
    if (isArray(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object2 != null && value in Object(object2);
  }
  _isKey = isKey;
  return _isKey;
}
var memoize_1;
var hasRequiredMemoize;
function requireMemoize() {
  if (hasRequiredMemoize) return memoize_1;
  hasRequiredMemoize = 1;
  var MapCache = require_MapCache();
  var FUNC_ERROR_TEXT = "Expected a function";
  function memoize(func, resolver) {
    if (typeof func != "function" || resolver != null && typeof resolver != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache)();
    return memoized;
  }
  memoize.Cache = MapCache;
  memoize_1 = memoize;
  return memoize_1;
}
var _memoizeCapped;
var hasRequired_memoizeCapped;
function require_memoizeCapped() {
  if (hasRequired_memoizeCapped) return _memoizeCapped;
  hasRequired_memoizeCapped = 1;
  var memoize = requireMemoize();
  var MAX_MEMOIZE_SIZE = 500;
  function memoizeCapped(func) {
    var result = memoize(func, function(key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });
    var cache = result.cache;
    return result;
  }
  _memoizeCapped = memoizeCapped;
  return _memoizeCapped;
}
var _stringToPath;
var hasRequired_stringToPath;
function require_stringToPath() {
  if (hasRequired_stringToPath) return _stringToPath;
  hasRequired_stringToPath = 1;
  var memoizeCapped = require_memoizeCapped();
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reEscapeChar = /\\(\\)?/g;
  var stringToPath = memoizeCapped(function(string) {
    var result = [];
    if (string.charCodeAt(0) === 46) {
      result.push("");
    }
    string.replace(rePropName, function(match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
    });
    return result;
  });
  _stringToPath = stringToPath;
  return _stringToPath;
}
var _arrayMap;
var hasRequired_arrayMap;
function require_arrayMap() {
  if (hasRequired_arrayMap) return _arrayMap;
  hasRequired_arrayMap = 1;
  function arrayMap(array, iteratee) {
    var index2 = -1, length2 = array == null ? 0 : array.length, result = Array(length2);
    while (++index2 < length2) {
      result[index2] = iteratee(array[index2], index2, array);
    }
    return result;
  }
  _arrayMap = arrayMap;
  return _arrayMap;
}
var _baseToString;
var hasRequired_baseToString;
function require_baseToString() {
  if (hasRequired_baseToString) return _baseToString;
  hasRequired_baseToString = 1;
  var Symbol2 = require_Symbol(), arrayMap = require_arrayMap(), isArray = requireIsArray(), isSymbol = requireIsSymbol();
  var symbolProto = Symbol2 ? Symbol2.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
  function baseToString(value) {
    if (typeof value == "string") {
      return value;
    }
    if (isArray(value)) {
      return arrayMap(value, baseToString) + "";
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -Infinity ? "-0" : result;
  }
  _baseToString = baseToString;
  return _baseToString;
}
var toString_1;
var hasRequiredToString;
function requireToString() {
  if (hasRequiredToString) return toString_1;
  hasRequiredToString = 1;
  var baseToString = require_baseToString();
  function toString(value) {
    return value == null ? "" : baseToString(value);
  }
  toString_1 = toString;
  return toString_1;
}
var _castPath;
var hasRequired_castPath;
function require_castPath() {
  if (hasRequired_castPath) return _castPath;
  hasRequired_castPath = 1;
  var isArray = requireIsArray(), isKey = require_isKey(), stringToPath = require_stringToPath(), toString = requireToString();
  function castPath(value, object2) {
    if (isArray(value)) {
      return value;
    }
    return isKey(value, object2) ? [value] : stringToPath(toString(value));
  }
  _castPath = castPath;
  return _castPath;
}
var _toKey;
var hasRequired_toKey;
function require_toKey() {
  if (hasRequired_toKey) return _toKey;
  hasRequired_toKey = 1;
  var isSymbol = requireIsSymbol();
  function toKey(value) {
    if (typeof value == "string" || isSymbol(value)) {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -Infinity ? "-0" : result;
  }
  _toKey = toKey;
  return _toKey;
}
var _baseGet;
var hasRequired_baseGet;
function require_baseGet() {
  if (hasRequired_baseGet) return _baseGet;
  hasRequired_baseGet = 1;
  var castPath = require_castPath(), toKey = require_toKey();
  function baseGet(object2, path) {
    path = castPath(path, object2);
    var index2 = 0, length2 = path.length;
    while (object2 != null && index2 < length2) {
      object2 = object2[toKey(path[index2++])];
    }
    return index2 && index2 == length2 ? object2 : void 0;
  }
  _baseGet = baseGet;
  return _baseGet;
}
var get_1;
var hasRequiredGet;
function requireGet() {
  if (hasRequiredGet) return get_1;
  hasRequiredGet = 1;
  var baseGet = require_baseGet();
  function get(object2, path, defaultValue) {
    var result = object2 == null ? void 0 : baseGet(object2, path);
    return result === void 0 ? defaultValue : result;
  }
  get_1 = get;
  return get_1;
}
var getExports = requireGet();
const ke = /* @__PURE__ */ getDefaultExportFromCjs(getExports);
var _baseSet;
var hasRequired_baseSet;
function require_baseSet() {
  if (hasRequired_baseSet) return _baseSet;
  hasRequired_baseSet = 1;
  var assignValue = require_assignValue(), castPath = require_castPath(), isIndex = require_isIndex(), isObject = requireIsObject(), toKey = require_toKey();
  function baseSet(object2, path, value, customizer) {
    if (!isObject(object2)) {
      return object2;
    }
    path = castPath(path, object2);
    var index2 = -1, length2 = path.length, lastIndex = length2 - 1, nested = object2;
    while (nested != null && ++index2 < length2) {
      var key = toKey(path[index2]), newValue = value;
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return object2;
      }
      if (index2 != lastIndex) {
        var objValue = nested[key];
        newValue = customizer ? customizer(objValue, key, nested) : void 0;
        if (newValue === void 0) {
          newValue = isObject(objValue) ? objValue : isIndex(path[index2 + 1]) ? [] : {};
        }
      }
      assignValue(nested, key, newValue);
      nested = nested[key];
    }
    return object2;
  }
  _baseSet = baseSet;
  return _baseSet;
}
var set_1;
var hasRequiredSet;
function requireSet() {
  if (hasRequiredSet) return set_1;
  hasRequiredSet = 1;
  var baseSet = require_baseSet();
  function set(object2, path, value) {
    return object2 == null ? object2 : baseSet(object2, path, value);
  }
  set_1 = set;
  return set_1;
}
var setExports = requireSet();
const Lr = /* @__PURE__ */ getDefaultExportFromCjs(setExports);
function u$2() {
  return u$2 = Object.assign ? Object.assign.bind() : function(t2) {
    for (var e2 = 1; e2 < arguments.length; e2++) {
      var o2 = arguments[e2];
      for (var i2 in o2) ({}).hasOwnProperty.call(o2, i2) && (t2[i2] = o2[i2]);
    }
    return t2;
  }, u$2.apply(null, arguments);
}
function d(t2, e2) {
  if (null == t2) return {};
  var o2 = {};
  for (var i2 in t2) if ({}.hasOwnProperty.call(t2, i2)) {
    if (-1 !== e2.indexOf(i2)) continue;
    o2[i2] = t2[i2];
  }
  return o2;
}
var s$1 = ["outlineWidth", "outlineColor", "outlineOpacity"], b$3 = function(t2) {
  return t2.outlineWidth, t2.outlineColor, t2.outlineOpacity, d(t2, s$1);
}, y$2 = ["axis.ticks.text", "axis.legend.text", "legends.title.text", "legends.text", "legends.ticks.text", "legends.title.text", "labels.text", "dots.text", "markers.text", "annotations.text"], W$2 = function(t2, e2) {
  return u$2({}, e2, t2);
}, O$3 = function(t2, e2) {
  var o2 = i$2({}, t2, e2);
  return y$2.forEach((function(t3) {
    Lr(o2, t3, W$2(ke(o2, t3), o2.text));
  })), o2;
}, C$2 = { background: "transparent", text: { fontFamily: "sans-serif", fontSize: 11, fill: "#333333", outlineWidth: 0, outlineColor: "#ffffff", outlineOpacity: 1 }, axis: { domain: { line: { stroke: "transparent", strokeWidth: 1 } }, ticks: { line: { stroke: "#777777", strokeWidth: 1 }, text: {} }, legend: { text: { fontSize: 12 } } }, grid: { line: { stroke: "#dddddd", strokeWidth: 1 } }, legends: { hidden: { symbol: { fill: "#333333", opacity: 0.6 }, text: { fill: "#333333", opacity: 0.6 } }, text: {}, ticks: { line: { stroke: "#777777", strokeWidth: 1 }, text: { fontSize: 10 } }, title: { text: {} } }, labels: { text: {} }, markers: { lineColor: "#000000", lineStrokeWidth: 1, text: {} }, dots: { text: {} }, tooltip: { container: { background: "white", color: "inherit", fontSize: "inherit", borderRadius: "2px", boxShadow: "0 1px 2px rgba(0, 0, 0, 0.25)", padding: "5px 9px" }, basic: { whiteSpace: "pre", display: "flex", alignItems: "center" }, chip: { marginRight: 7 }, table: {}, tableCell: { padding: "3px 5px" }, tableCellValue: { fontWeight: "bold" } }, crosshair: { line: { stroke: "#000000", strokeWidth: 1, strokeOpacity: 0.75, strokeDasharray: "6 6" } }, annotations: { text: { fontSize: 13, outlineWidth: 2, outlineColor: "#ffffff", outlineOpacity: 1 }, link: { stroke: "#000000", strokeWidth: 1, outlineWidth: 2, outlineColor: "#ffffff", outlineOpacity: 1 }, outline: { fill: "none", stroke: "#000000", strokeWidth: 2, outlineWidth: 2, outlineColor: "#ffffff", outlineOpacity: 1 }, symbol: { fill: "#000000", outlineWidth: 2, outlineColor: "#ffffff", outlineOpacity: 1 } } }, L$1 = function(e2) {
  return reactExports.useMemo((function() {
    return O$3(C$2, e2);
  }), [e2]);
}, S$1 = reactExports.createContext(null), j$3 = {}, z$3 = function(t2) {
  var e2 = t2.theme, o2 = void 0 === e2 ? j$3 : e2, i2 = t2.children, n2 = L$1(o2);
  return jsxRuntimeExports.jsx(S$1.Provider, { value: n2, children: i2 });
}, M$2 = function() {
  var t2 = reactExports.useContext(S$1);
  if (null === t2) throw new Error("Unable to find the theme, did you forget to wrap your component with ThemeProvider?");
  return t2;
};
function v$1() {
  return v$1 = Object.assign ? Object.assign.bind() : function(t2) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var n2 = arguments[i2];
      for (var o2 in n2) ({}).hasOwnProperty.call(n2, o2) && (t2[o2] = n2[o2]);
    }
    return t2;
  }, v$1.apply(null, arguments);
}
var x = ["basic", "chip", "container", "table", "tableCell", "tableCellValue"], m$1 = { pointerEvents: "none", position: "absolute", zIndex: 10, top: 0, left: 0 }, b$2 = function(t2, i2) {
  return "translate(" + t2 + "px, " + i2 + "px)";
}, g = reactExports.memo((function(t2) {
  var n2, o2 = t2.position, r2 = t2.anchor, e2 = t2.children, l2 = M$2(), u2 = Dr(), y2 = u2.animate, f = u2.config, g2 = sn(), w2 = g2[0], T2 = g2[1], C2 = reactExports.useRef(false), E2 = void 0, P2 = false, V2 = T2.width > 0 && T2.height > 0, O2 = Math.round(o2[0]), N2 = Math.round(o2[1]);
  V2 && ("top" === r2 ? (O2 -= T2.width / 2, N2 -= T2.height + 14) : "right" === r2 ? (O2 += 14, N2 -= T2.height / 2) : "bottom" === r2 ? (O2 -= T2.width / 2, N2 += 14) : "left" === r2 ? (O2 -= T2.width + 14, N2 -= T2.height / 2) : "center" === r2 && (O2 -= T2.width / 2, N2 -= T2.height / 2), E2 = { transform: b$2(O2, N2) }, C2.current || (P2 = true), C2.current = [O2, N2]);
  var j2 = useSpring({ to: E2, config: f, immediate: !y2 || P2 }), k2 = l2.tooltip;
  k2.basic, k2.chip, k2.container, k2.table, k2.tableCell, k2.tableCellValue;
  var z2 = (function(t3, i2) {
    if (null == t3) return {};
    var n3 = {};
    for (var o3 in t3) if ({}.hasOwnProperty.call(t3, o3)) {
      if (-1 !== i2.indexOf(o3)) continue;
      n3[o3] = t3[o3];
    }
    return n3;
  })(k2, x), A5 = v$1({}, m$1, z2, { transform: null != (n2 = j2.transform) ? n2 : b$2(O2, N2), opacity: j2.transform ? 1 : 0 });
  return jsxRuntimeExports.jsx(animated.div, { ref: w2, style: A5, children: e2 });
}));
g.displayName = "TooltipWrapper";
var w$1 = reactExports.memo((function(t2) {
  var i2 = t2.size, n2 = void 0 === i2 ? 12 : i2, o2 = t2.color, r2 = t2.style;
  return jsxRuntimeExports.jsx("span", { style: v$1({ display: "block", width: n2, height: n2, background: o2 }, void 0 === r2 ? {} : r2) });
})), T = reactExports.memo((function(t2) {
  var i2, n2 = t2.id, o2 = t2.value, r2 = t2.format, e2 = t2.enableChip, l2 = void 0 !== e2 && e2, a2 = t2.color, c2 = t2.renderContent, s2 = M$2(), h2 = hn(r2);
  if ("function" == typeof c2) i2 = c2();
  else {
    var f = o2;
    void 0 !== h2 && void 0 !== f && (f = h2(f)), i2 = jsxRuntimeExports.jsxs("div", { style: s2.tooltip.basic, children: [l2 && jsxRuntimeExports.jsx(w$1, { color: a2, style: s2.tooltip.chip }), void 0 !== f ? jsxRuntimeExports.jsxs("span", { children: [n2, ": ", jsxRuntimeExports.jsx("strong", { children: "" + f })] }) : n2] });
  }
  return jsxRuntimeExports.jsx("div", { style: s2.tooltip.container, role: "tooltip", children: i2 });
})), C$1 = { width: "100%", borderCollapse: "collapse" }, E$3 = reactExports.memo((function(t2) {
  var i2, n2 = t2.title, o2 = t2.rows, r2 = void 0 === o2 ? [] : o2, e2 = t2.renderContent, l2 = M$2();
  return r2.length ? (i2 = "function" == typeof e2 ? e2() : jsxRuntimeExports.jsxs("div", { children: [n2 && n2, jsxRuntimeExports.jsx("table", { style: v$1({}, C$1, l2.tooltip.table), children: jsxRuntimeExports.jsx("tbody", { children: r2.map((function(t3, i3) {
    return jsxRuntimeExports.jsx("tr", { children: t3.map((function(t4, i4) {
      return jsxRuntimeExports.jsx("td", { style: l2.tooltip.tableCell, children: t4 }, i4);
    })) }, i3);
  })) }) })] }), jsxRuntimeExports.jsx("div", { style: l2.tooltip.container, children: i2 })) : null;
}));
E$3.displayName = "TableTooltip";
var P$1 = reactExports.memo((function(t2) {
  var i2 = t2.x0, o2 = t2.x1, r2 = t2.y0, e2 = t2.y1, l2 = M$2(), h2 = Dr(), u2 = h2.animate, y2 = h2.config, f = reactExports.useMemo((function() {
    return v$1({}, l2.crosshair.line, { pointerEvents: "none" });
  }), [l2.crosshair.line]), x2 = useSpring({ x1: i2, x2: o2, y1: r2, y2: e2, config: y2, immediate: !u2 });
  return jsxRuntimeExports.jsx(animated.line, v$1({}, x2, { fill: "none", style: f }));
}));
P$1.displayName = "CrosshairLine";
var V = reactExports.memo((function(t2) {
  var i2, n2, o2 = t2.width, r2 = t2.height, e2 = t2.type, l2 = t2.x, a2 = t2.y;
  return "cross" === e2 ? (i2 = { x0: l2, x1: l2, y0: 0, y1: r2 }, n2 = { x0: 0, x1: o2, y0: a2, y1: a2 }) : "top-left" === e2 ? (i2 = { x0: l2, x1: l2, y0: 0, y1: a2 }, n2 = { x0: 0, x1: l2, y0: a2, y1: a2 }) : "top" === e2 ? i2 = { x0: l2, x1: l2, y0: 0, y1: a2 } : "top-right" === e2 ? (i2 = { x0: l2, x1: l2, y0: 0, y1: a2 }, n2 = { x0: l2, x1: o2, y0: a2, y1: a2 }) : "right" === e2 ? n2 = { x0: l2, x1: o2, y0: a2, y1: a2 } : "bottom-right" === e2 ? (i2 = { x0: l2, x1: l2, y0: a2, y1: r2 }, n2 = { x0: l2, x1: o2, y0: a2, y1: a2 }) : "bottom" === e2 ? i2 = { x0: l2, x1: l2, y0: a2, y1: r2 } : "bottom-left" === e2 ? (i2 = { x0: l2, x1: l2, y0: a2, y1: r2 }, n2 = { x0: 0, x1: l2, y0: a2, y1: a2 }) : "left" === e2 ? n2 = { x0: 0, x1: l2, y0: a2, y1: a2 } : "x" === e2 ? i2 = { x0: l2, x1: l2, y0: 0, y1: r2 } : "y" === e2 && (n2 = { x0: 0, x1: o2, y0: a2, y1: a2 }), jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [i2 && jsxRuntimeExports.jsx(P$1, { x0: i2.x0, x1: i2.x1, y0: i2.y0, y1: i2.y1 }), n2 && jsxRuntimeExports.jsx(P$1, { x0: n2.x0, x1: n2.x1, y0: n2.y0, y1: n2.y1 })] });
}));
V.displayName = "Crosshair";
var O$2 = reactExports.createContext({ showTooltipAt: function() {
}, showTooltipFromEvent: function() {
}, hideTooltip: function() {
} }), N$1 = { isVisible: false, position: [null, null], content: null, anchor: null }, j$2 = reactExports.createContext(N$1), k$2 = function(t2) {
  var i2 = reactExports.useState(N$1), o2 = i2[0], l2 = i2[1], a2 = reactExports.useCallback((function(t3, i3, n2) {
    var o3 = i3[0], r2 = i3[1];
    void 0 === n2 && (n2 = "top"), l2({ isVisible: true, position: [o3, r2], anchor: n2, content: t3 });
  }), [l2]), c2 = reactExports.useCallback((function(i3, n2, o3) {
    void 0 === o3 && (o3 = "top");
    var r2 = t2.current.getBoundingClientRect(), e2 = t2.current.offsetWidth, a3 = e2 === r2.width ? 1 : e2 / r2.width, c3 = "touches" in n2 ? n2.touches[0] : n2, s3 = c3.clientX, h2 = c3.clientY, u2 = (s3 - r2.left) * a3, d2 = (h2 - r2.top) * a3;
    "left" !== o3 && "right" !== o3 || (o3 = u2 < r2.width / 2 ? "right" : "left"), l2({ isVisible: true, position: [u2, d2], anchor: o3, content: i3 });
  }), [t2, l2]), s2 = reactExports.useCallback((function() {
    l2(N$1);
  }), [l2]);
  return { actions: reactExports.useMemo((function() {
    return { showTooltipAt: a2, showTooltipFromEvent: c2, hideTooltip: s2 };
  }), [a2, c2, s2]), state: o2 };
}, z$2 = function() {
  var t2 = reactExports.useContext(O$2);
  if (void 0 === t2) throw new Error("useTooltip must be used within a TooltipProvider");
  return t2;
}, A$3 = function() {
  var t2 = reactExports.useContext(j$2);
  if (void 0 === t2) throw new Error("useTooltipState must be used within a TooltipProvider");
  return t2;
}, F = function(t2) {
  return t2.isVisible;
}, M$1 = function() {
  var t2 = A$3();
  return F(t2) ? jsxRuntimeExports.jsx(g, { position: t2.position, anchor: t2.anchor, children: t2.content }) : null;
}, W$1 = function(t2) {
  var i2 = t2.container, n2 = t2.children, o2 = k$2(i2), r2 = o2.actions, e2 = o2.state;
  return jsxRuntimeExports.jsx(O$2.Provider, { value: r2, children: jsxRuntimeExports.jsx(j$2.Provider, { value: e2, children: n2 }) });
};
var isString_1;
var hasRequiredIsString;
function requireIsString() {
  if (hasRequiredIsString) return isString_1;
  hasRequiredIsString = 1;
  var baseGetTag = require_baseGetTag(), isArray = requireIsArray(), isObjectLike = requireIsObjectLike();
  var stringTag = "[object String]";
  function isString(value) {
    return typeof value == "string" || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
  }
  isString_1 = isString;
  return isString_1;
}
var isStringExports = requireIsString();
const _$2 = /* @__PURE__ */ getDefaultExportFromCjs(isStringExports);
let windowObject;
if (typeof window !== "undefined") {
  windowObject = window;
} else if (typeof self !== "undefined") {
  windowObject = self;
} else {
  windowObject = global;
}
let cancelFrame = null;
let requestFrame = null;
const TIMEOUT_DURATION = 20;
const clearTimeoutFn = windowObject.clearTimeout;
const setTimeoutFn = windowObject.setTimeout;
const cancelAnimationFrameFn = windowObject.cancelAnimationFrame || windowObject.mozCancelAnimationFrame || windowObject.webkitCancelAnimationFrame;
const requestAnimationFrameFn = windowObject.requestAnimationFrame || windowObject.mozRequestAnimationFrame || windowObject.webkitRequestAnimationFrame;
if (cancelAnimationFrameFn == null || requestAnimationFrameFn == null) {
  cancelFrame = clearTimeoutFn;
  requestFrame = function requestAnimationFrameViaSetTimeout(callback) {
    return setTimeoutFn(callback, TIMEOUT_DURATION);
  };
} else {
  cancelFrame = function cancelFrame2([animationFrameID, timeoutID]) {
    cancelAnimationFrameFn(animationFrameID);
    clearTimeoutFn(timeoutID);
  };
  requestFrame = function requestAnimationFrameWithSetTimeoutFallback(callback) {
    const animationFrameID = requestAnimationFrameFn(function animationFrameCallback() {
      clearTimeoutFn(timeoutID);
      callback();
    });
    const timeoutID = setTimeoutFn(function timeoutCallback() {
      cancelAnimationFrameFn(animationFrameID);
      callback();
    }, TIMEOUT_DURATION);
    return [animationFrameID, timeoutID];
  };
}
function createDetectElementResize(nonce) {
  let animationKeyframes;
  let animationName;
  let animationStartEvent;
  let animationStyle;
  let checkTriggers;
  let resetTriggers;
  let scrollListener;
  const attachEvent = typeof document !== "undefined" && document.attachEvent;
  if (!attachEvent) {
    resetTriggers = function(element) {
      const triggers = element.__resizeTriggers__, expand = triggers.firstElementChild, contract = triggers.lastElementChild, expandChild = expand.firstElementChild;
      contract.scrollLeft = contract.scrollWidth;
      contract.scrollTop = contract.scrollHeight;
      expandChild.style.width = expand.offsetWidth + 1 + "px";
      expandChild.style.height = expand.offsetHeight + 1 + "px";
      expand.scrollLeft = expand.scrollWidth;
      expand.scrollTop = expand.scrollHeight;
    };
    checkTriggers = function(element) {
      return element.offsetWidth !== element.__resizeLast__.width || element.offsetHeight !== element.__resizeLast__.height;
    };
    scrollListener = function(e2) {
      if (e2.target.className && typeof e2.target.className.indexOf === "function" && e2.target.className.indexOf("contract-trigger") < 0 && e2.target.className.indexOf("expand-trigger") < 0) {
        return;
      }
      const element = this;
      resetTriggers(this);
      if (this.__resizeRAF__) {
        cancelFrame(this.__resizeRAF__);
      }
      this.__resizeRAF__ = requestFrame(function animationFrame() {
        if (checkTriggers(element)) {
          element.__resizeLast__.width = element.offsetWidth;
          element.__resizeLast__.height = element.offsetHeight;
          element.__resizeListeners__.forEach(function forEachResizeListener(fn2) {
            fn2.call(element, e2);
          });
        }
      });
    };
    let animation = false;
    let keyframeprefix = "";
    animationStartEvent = "animationstart";
    const domPrefixes = "Webkit Moz O ms".split(" ");
    let startEvents = "webkitAnimationStart animationstart oAnimationStart MSAnimationStart".split(" ");
    let pfx = "";
    {
      const elm = document.createElement("fakeelement");
      if (elm.style.animationName !== void 0) {
        animation = true;
      }
      if (animation === false) {
        for (let i2 = 0; i2 < domPrefixes.length; i2++) {
          if (elm.style[domPrefixes[i2] + "AnimationName"] !== void 0) {
            pfx = domPrefixes[i2];
            keyframeprefix = "-" + pfx.toLowerCase() + "-";
            animationStartEvent = startEvents[i2];
            animation = true;
            break;
          }
        }
      }
    }
    animationName = "resizeanim";
    animationKeyframes = "@" + keyframeprefix + "keyframes " + animationName + " { from { opacity: 0; } to { opacity: 0; } } ";
    animationStyle = keyframeprefix + "animation: 1ms " + animationName + "; ";
  }
  const createStyles = function(doc) {
    if (!doc.getElementById("detectElementResize")) {
      const css = (animationKeyframes ? animationKeyframes : "") + ".resize-triggers { " + (animationStyle ? animationStyle : "") + 'visibility: hidden; opacity: 0; } .resize-triggers, .resize-triggers > div, .contract-trigger:before { content: " "; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; z-index: -1; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }', head = doc.head || doc.getElementsByTagName("head")[0], style = doc.createElement("style");
      style.id = "detectElementResize";
      style.type = "text/css";
      if (nonce != null) {
        style.setAttribute("nonce", nonce);
      }
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(doc.createTextNode(css));
      }
      head.appendChild(style);
    }
  };
  const addResizeListener = function(element, fn2) {
    if (attachEvent) {
      element.attachEvent("onresize", fn2);
    } else {
      if (!element.__resizeTriggers__) {
        const doc = element.ownerDocument;
        const elementStyle = windowObject.getComputedStyle(element);
        if (elementStyle && elementStyle.position === "static") {
          element.style.position = "relative";
        }
        createStyles(doc);
        element.__resizeLast__ = {};
        element.__resizeListeners__ = [];
        (element.__resizeTriggers__ = doc.createElement("div")).className = "resize-triggers";
        const expandTrigger = doc.createElement("div");
        expandTrigger.className = "expand-trigger";
        expandTrigger.appendChild(doc.createElement("div"));
        const contractTrigger = doc.createElement("div");
        contractTrigger.className = "contract-trigger";
        element.__resizeTriggers__.appendChild(expandTrigger);
        element.__resizeTriggers__.appendChild(contractTrigger);
        element.appendChild(element.__resizeTriggers__);
        resetTriggers(element);
        element.addEventListener("scroll", scrollListener, true);
        if (animationStartEvent) {
          element.__resizeTriggers__.__animationListener__ = function animationListener(e2) {
            if (e2.animationName === animationName) {
              resetTriggers(element);
            }
          };
          element.__resizeTriggers__.addEventListener(animationStartEvent, element.__resizeTriggers__.__animationListener__);
        }
      }
      element.__resizeListeners__.push(fn2);
    }
  };
  const removeResizeListener = function(element, fn2) {
    if (attachEvent) {
      element.detachEvent("onresize", fn2);
    } else {
      element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn2), 1);
      if (!element.__resizeListeners__.length) {
        element.removeEventListener("scroll", scrollListener, true);
        if (element.__resizeTriggers__.__animationListener__) {
          element.__resizeTriggers__.removeEventListener(animationStartEvent, element.__resizeTriggers__.__animationListener__);
          element.__resizeTriggers__.__animationListener__ = null;
        }
        try {
          element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
        } catch (e2) {
        }
      }
    }
  };
  return {
    addResizeListener,
    removeResizeListener
  };
}
class AutoSizer extends reactExports.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      height: this.props.defaultHeight || 0,
      width: this.props.defaultWidth || 0
    };
    this._autoSizer = null;
    this._detectElementResize = null;
    this._didLogDeprecationWarning = false;
    this._parentNode = null;
    this._resizeObserver = null;
    this._timeoutId = null;
    this._onResize = () => {
      this._timeoutId = null;
      const {
        disableHeight,
        disableWidth,
        onResize
      } = this.props;
      if (this._parentNode) {
        const style = window.getComputedStyle(this._parentNode) || {};
        const paddingLeft = parseFloat(style.paddingLeft || "0");
        const paddingRight = parseFloat(style.paddingRight || "0");
        const paddingTop = parseFloat(style.paddingTop || "0");
        const paddingBottom = parseFloat(style.paddingBottom || "0");
        const rect = this._parentNode.getBoundingClientRect();
        const height = rect.height - paddingTop - paddingBottom;
        const width = rect.width - paddingLeft - paddingRight;
        if (!disableHeight && this.state.height !== height || !disableWidth && this.state.width !== width) {
          this.setState({
            height,
            width
          });
          const maybeLogDeprecationWarning = () => {
            if (!this._didLogDeprecationWarning) {
              this._didLogDeprecationWarning = true;
              console.warn("scaledWidth and scaledHeight parameters have been deprecated; use width and height instead");
            }
          };
          if (typeof onResize === "function") {
            onResize({
              height,
              width,
              // TODO Remove these params in the next major release
              get scaledHeight() {
                maybeLogDeprecationWarning();
                return height;
              },
              get scaledWidth() {
                maybeLogDeprecationWarning();
                return width;
              }
            });
          }
        }
      }
    };
    this._setRef = (autoSizer) => {
      this._autoSizer = autoSizer;
    };
  }
  componentDidMount() {
    const {
      nonce
    } = this.props;
    const parentNode = this._autoSizer ? this._autoSizer.parentNode : null;
    if (parentNode != null && parentNode.ownerDocument && parentNode.ownerDocument.defaultView && parentNode instanceof parentNode.ownerDocument.defaultView.HTMLElement) {
      this._parentNode = parentNode;
      const ResizeObserverInstance = parentNode.ownerDocument.defaultView.ResizeObserver;
      if (ResizeObserverInstance != null) {
        this._resizeObserver = new ResizeObserverInstance(() => {
          this._timeoutId = setTimeout(this._onResize, 0);
        });
        this._resizeObserver.observe(parentNode);
      } else {
        this._detectElementResize = createDetectElementResize(nonce);
        this._detectElementResize.addResizeListener(parentNode, this._onResize);
      }
      this._onResize();
    }
  }
  componentWillUnmount() {
    if (this._parentNode) {
      if (this._detectElementResize) {
        this._detectElementResize.removeResizeListener(this._parentNode, this._onResize);
      }
      if (this._timeoutId !== null) {
        clearTimeout(this._timeoutId);
      }
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
      }
    }
  }
  render() {
    const {
      children,
      defaultHeight,
      defaultWidth,
      disableHeight = false,
      disableWidth = false,
      doNotBailOutOnEmptyChildren = false,
      nonce,
      onResize,
      style = {},
      tagName = "div",
      ...rest
    } = this.props;
    const {
      height,
      width
    } = this.state;
    const outerStyle = {
      overflow: "visible"
    };
    const childParams = {};
    let bailoutOnChildren = false;
    if (!disableHeight) {
      if (height === 0) {
        bailoutOnChildren = true;
      }
      outerStyle.height = 0;
      childParams.height = height;
      childParams.scaledHeight = height;
    }
    if (!disableWidth) {
      if (width === 0) {
        bailoutOnChildren = true;
      }
      outerStyle.width = 0;
      childParams.width = width;
      childParams.scaledWidth = width;
    }
    if (doNotBailOutOnEmptyChildren) {
      bailoutOnChildren = false;
    }
    return reactExports.createElement(tagName, {
      ref: this._setRef,
      style: {
        ...outerStyle,
        ...style
      },
      ...rest
    }, !bailoutOnChildren && children(childParams));
  }
}
function c$3(e2, u2, c2, i2) {
  var l2 = this, a2 = reactExports.useRef(null), o2 = reactExports.useRef(0), f = reactExports.useRef(0), v2 = reactExports.useRef(null), d2 = reactExports.useRef([]), s2 = reactExports.useRef(), m2 = reactExports.useRef(), h2 = reactExports.useRef(e2), g2 = reactExports.useRef(true), x2 = reactExports.useRef(), E2 = reactExports.useRef();
  h2.current = e2;
  var b2 = "undefined" != typeof window, p2 = !u2 && 0 !== u2 && b2;
  if ("function" != typeof e2) throw new TypeError("Expected a function");
  u2 = +u2 || 0;
  var y2 = !!(c2 = c2 || {}).leading, w2 = !("trailing" in c2) || !!c2.trailing, T2 = !!c2.flushOnExit && w2, O2 = "maxWait" in c2, F2 = "debounceOnServer" in c2 && !!c2.debounceOnServer, L2 = O2 ? Math.max(+c2.maxWait || 0, u2) : null, A5 = reactExports.useMemo(function() {
    var r2 = function(r3) {
      var n3 = d2.current, t3 = s2.current;
      return d2.current = s2.current = null, o2.current = r3, f.current = f.current || r3, m2.current = h2.current.apply(t3, n3);
    }, n2 = function(r3, n3) {
      p2 && cancelAnimationFrame(v2.current), v2.current = p2 ? requestAnimationFrame(r3) : setTimeout(r3, n3);
    }, t2 = function(r3) {
      if (!g2.current) return false;
      var n3 = r3 - a2.current;
      return !a2.current || n3 >= u2 || n3 < 0 || O2 && r3 - o2.current >= L2;
    }, e3 = function(n3) {
      return v2.current = null, w2 && d2.current ? r2(n3) : (d2.current = s2.current = null, m2.current);
    }, c3 = function r3() {
      var c4 = Date.now();
      if (y2 && f.current === o2.current && A6(), t2(c4)) return e3(c4);
      if (g2.current) {
        var i3 = u2 - (c4 - a2.current), l3 = O2 ? Math.min(i3, L2 - (c4 - o2.current)) : i3;
        n2(r3, l3);
      }
    }, A6 = function() {
      i2 && i2({});
    }, D2 = function() {
      if (b2 || F2) {
        var e4, i3 = Date.now(), f2 = t2(i3);
        if (d2.current = [].slice.call(arguments), s2.current = l2, a2.current = i3, T2 && !x2.current && (x2.current = function() {
          var r3;
          "hidden" === (null == (r3 = globalThis.document) ? void 0 : r3.visibilityState) && E2.current.flush();
        }, null == (e4 = globalThis.document) || null == e4.addEventListener || e4.addEventListener("visibilitychange", x2.current)), f2) {
          if (!v2.current && g2.current) return o2.current = a2.current, n2(c3, u2), y2 ? r2(a2.current) : m2.current;
          if (O2) return n2(c3, u2), r2(a2.current);
        }
        return v2.current || n2(c3, u2), m2.current;
      }
    };
    return D2.cancel = function() {
      var r3 = v2.current;
      r3 && (p2 ? cancelAnimationFrame(v2.current) : clearTimeout(v2.current)), o2.current = 0, d2.current = a2.current = s2.current = v2.current = null, r3 && i2 && i2({});
    }, D2.isPending = function() {
      return !!v2.current;
    }, D2.flush = function() {
      return v2.current ? e3(Date.now()) : m2.current;
    }, D2;
  }, [y2, O2, u2, L2, w2, T2, p2, b2, F2, i2]);
  return E2.current = A5, reactExports.useEffect(function() {
    return g2.current = true, function() {
      var r2;
      T2 && E2.current.flush(), x2.current && (null == (r2 = globalThis.document) || null == r2.removeEventListener || r2.removeEventListener("visibilitychange", x2.current), x2.current = null), g2.current = false;
    };
  }, [T2]), A5;
}
function i$1(r2, n2) {
  return r2 === n2;
}
function l$1(n2, t2, l2) {
  var a2 = l2 && l2.equalityFn || i$1, o2 = reactExports.useRef(n2), f = reactExports.useState({})[1], v2 = c$3(reactExports.useCallback(function(r2) {
    o2.current = r2, f({});
  }, [f]), t2, l2, f), d2 = reactExports.useRef(n2);
  return a2(d2.current, n2) || (v2(n2), d2.current = n2), [o2.current, v2];
}
var _baseDifference;
var hasRequired_baseDifference;
function require_baseDifference() {
  if (hasRequired_baseDifference) return _baseDifference;
  hasRequired_baseDifference = 1;
  var SetCache = require_SetCache(), arrayIncludes = require_arrayIncludes(), arrayIncludesWith = require_arrayIncludesWith(), arrayMap = require_arrayMap(), baseUnary = require_baseUnary(), cacheHas = require_cacheHas();
  var LARGE_ARRAY_SIZE = 200;
  function baseDifference(array, values, iteratee, comparator) {
    var index2 = -1, includes = arrayIncludes, isCommon = true, length2 = array.length, result = [], valuesLength = values.length;
    if (!length2) {
      return result;
    }
    if (iteratee) {
      values = arrayMap(values, baseUnary(iteratee));
    }
    if (comparator) {
      includes = arrayIncludesWith;
      isCommon = false;
    } else if (values.length >= LARGE_ARRAY_SIZE) {
      includes = cacheHas;
      isCommon = false;
      values = new SetCache(values);
    }
    outer:
      while (++index2 < length2) {
        var value = array[index2], computed = iteratee == null ? value : iteratee(value);
        value = comparator || value !== 0 ? value : 0;
        if (isCommon && computed === computed) {
          var valuesIndex = valuesLength;
          while (valuesIndex--) {
            if (values[valuesIndex] === computed) {
              continue outer;
            }
          }
          result.push(value);
        } else if (!includes(values, computed, comparator)) {
          result.push(value);
        }
      }
    return result;
  }
  _baseDifference = baseDifference;
  return _baseDifference;
}
var without_1;
var hasRequiredWithout;
function requireWithout() {
  if (hasRequiredWithout) return without_1;
  hasRequiredWithout = 1;
  var baseDifference = require_baseDifference(), baseRest = require_baseRest(), isArrayLikeObject = requireIsArrayLikeObject();
  var without = baseRest(function(array, values) {
    return isArrayLikeObject(array) ? baseDifference(array, values) : [];
  });
  without_1 = without;
  return without_1;
}
var withoutExports = requireWithout();
const P = /* @__PURE__ */ getDefaultExportFromCjs(withoutExports);
function colors(specifier) {
  var n2 = specifier.length / 6 | 0, colors2 = new Array(n2), i2 = 0;
  while (i2 < n2) colors2[i2] = "#" + specifier.slice(i2 * 6, ++i2 * 6);
  return colors2;
}
const e = colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");
const r = colors("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666");
const n = colors("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666");
const t = colors("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928");
const o = colors("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2");
const i = colors("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc");
const u$1 = colors("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999");
const l = colors("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3");
const a = colors("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f");
const c$2 = colors("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab");
const ramp$1 = (scheme2) => rgbBasis(scheme2[scheme2.length - 1]);
var scheme$q = new Array(3).concat(
  "d8b365f5f5f55ab4ac",
  "a6611adfc27d80cdc1018571",
  "a6611adfc27df5f5f580cdc1018571",
  "8c510ad8b365f6e8c3c7eae55ab4ac01665e",
  "8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e",
  "8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e",
  "8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e",
  "5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30",
  "5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30"
).map(colors);
const y$1 = ramp$1(scheme$q);
var scheme$p = new Array(3).concat(
  "af8dc3f7f7f77fbf7b",
  "7b3294c2a5cfa6dba0008837",
  "7b3294c2a5cff7f7f7a6dba0008837",
  "762a83af8dc3e7d4e8d9f0d37fbf7b1b7837",
  "762a83af8dc3e7d4e8f7f7f7d9f0d37fbf7b1b7837",
  "762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b7837",
  "762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b7837",
  "40004b762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b783700441b",
  "40004b762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b783700441b"
).map(colors);
const _$1 = ramp$1(scheme$p);
var scheme$o = new Array(3).concat(
  "e9a3c9f7f7f7a1d76a",
  "d01c8bf1b6dab8e1864dac26",
  "d01c8bf1b6daf7f7f7b8e1864dac26",
  "c51b7de9a3c9fde0efe6f5d0a1d76a4d9221",
  "c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221",
  "c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221",
  "c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221",
  "8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419",
  "8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419"
).map(colors);
const w = ramp$1(scheme$o);
var scheme$n = new Array(3).concat(
  "998ec3f7f7f7f1a340",
  "5e3c99b2abd2fdb863e66101",
  "5e3c99b2abd2f7f7f7fdb863e66101",
  "542788998ec3d8daebfee0b6f1a340b35806",
  "542788998ec3d8daebf7f7f7fee0b6f1a340b35806",
  "5427888073acb2abd2d8daebfee0b6fdb863e08214b35806",
  "5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806",
  "2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08",
  "2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08"
).map(colors);
const k$1 = ramp$1(scheme$n);
var scheme$m = new Array(3).concat(
  "ef8a62f7f7f767a9cf",
  "ca0020f4a58292c5de0571b0",
  "ca0020f4a582f7f7f792c5de0571b0",
  "b2182bef8a62fddbc7d1e5f067a9cf2166ac",
  "b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac",
  "b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac",
  "b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac",
  "67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061",
  "67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061"
).map(colors);
const j$1 = ramp$1(scheme$m);
var scheme$l = new Array(3).concat(
  "ef8a62ffffff999999",
  "ca0020f4a582bababa404040",
  "ca0020f4a582ffffffbababa404040",
  "b2182bef8a62fddbc7e0e0e09999994d4d4d",
  "b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d",
  "b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d",
  "b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d",
  "67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a",
  "67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a"
).map(colors);
const z$1 = ramp$1(scheme$l);
var scheme$k = new Array(3).concat(
  "fc8d59ffffbf91bfdb",
  "d7191cfdae61abd9e92c7bb6",
  "d7191cfdae61ffffbfabd9e92c7bb6",
  "d73027fc8d59fee090e0f3f891bfdb4575b4",
  "d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4",
  "d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4",
  "d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4",
  "a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695",
  "a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695"
).map(colors);
const A$2 = ramp$1(scheme$k);
var scheme$j = new Array(3).concat(
  "fc8d59ffffbf91cf60",
  "d7191cfdae61a6d96a1a9641",
  "d7191cfdae61ffffbfa6d96a1a9641",
  "d73027fc8d59fee08bd9ef8b91cf601a9850",
  "d73027fc8d59fee08bffffbfd9ef8b91cf601a9850",
  "d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850",
  "d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850",
  "a50026d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850006837",
  "a50026d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850006837"
).map(colors);
const E$2 = ramp$1(scheme$j);
var scheme$i = new Array(3).concat(
  "fc8d59ffffbf99d594",
  "d7191cfdae61abdda42b83ba",
  "d7191cfdae61ffffbfabdda42b83ba",
  "d53e4ffc8d59fee08be6f59899d5943288bd",
  "d53e4ffc8d59fee08bffffbfe6f59899d5943288bd",
  "d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd",
  "d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd",
  "9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2",
  "9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2"
).map(colors);
const O$1 = ramp$1(scheme$i);
var scheme$h = new Array(3).concat(
  "e5f5f999d8c92ca25f",
  "edf8fbb2e2e266c2a4238b45",
  "edf8fbb2e2e266c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b"
).map(colors);
const le = ramp$1(scheme$h);
var scheme$g = new Array(3).concat(
  "e0ecf49ebcda8856a7",
  "edf8fbb3cde38c96c688419d",
  "edf8fbb3cde38c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b"
).map(colors);
const ae = ramp$1(scheme$g);
var scheme$f = new Array(3).concat(
  "e0f3dba8ddb543a2ca",
  "f0f9e8bae4bc7bccc42b8cbe",
  "f0f9e8bae4bc7bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081"
).map(colors);
const ce = ramp$1(scheme$f);
var scheme$e = new Array(3).concat(
  "fee8c8fdbb84e34a33",
  "fef0d9fdcc8afc8d59d7301f",
  "fef0d9fdcc8afc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000"
).map(colors);
const se = ramp$1(scheme$e);
var scheme$d = new Array(3).concat(
  "ece2f0a6bddb1c9099",
  "f6eff7bdc9e167a9cf02818a",
  "f6eff7bdc9e167a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636"
).map(colors);
const fe = ramp$1(scheme$d);
var scheme$c = new Array(3).concat(
  "ece7f2a6bddb2b8cbe",
  "f1eef6bdc9e174a9cf0570b0",
  "f1eef6bdc9e174a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858"
).map(colors);
const pe = ramp$1(scheme$c);
var scheme$b = new Array(3).concat(
  "e7e1efc994c7dd1c77",
  "f1eef6d7b5d8df65b0ce1256",
  "f1eef6d7b5d8df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f"
).map(colors);
const de = ramp$1(scheme$b);
var scheme$a = new Array(3).concat(
  "fde0ddfa9fb5c51b8a",
  "feebe2fbb4b9f768a1ae017e",
  "feebe2fbb4b9f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a"
).map(colors);
const me = ramp$1(scheme$a);
var scheme$9 = new Array(3).concat(
  "edf8b17fcdbb2c7fb8",
  "ffffcca1dab441b6c4225ea8",
  "ffffcca1dab441b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58"
).map(colors);
const ge = ramp$1(scheme$9);
var scheme$8 = new Array(3).concat(
  "f7fcb9addd8e31a354",
  "ffffccc2e69978c679238443",
  "ffffccc2e69978c67931a354006837",
  "ffffccd9f0a3addd8e78c67931a354006837",
  "ffffccd9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529"
).map(colors);
const he = ramp$1(scheme$8);
var scheme$7 = new Array(3).concat(
  "fff7bcfec44fd95f0e",
  "ffffd4fed98efe9929cc4c02",
  "ffffd4fed98efe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506"
).map(colors);
const be = ramp$1(scheme$7);
var scheme$6 = new Array(3).concat(
  "ffeda0feb24cf03b20",
  "ffffb2fecc5cfd8d3ce31a1c",
  "ffffb2fecc5cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026"
).map(colors);
const ve = ramp$1(scheme$6);
var scheme$5 = new Array(3).concat(
  "deebf79ecae13182bd",
  "eff3ffbdd7e76baed62171b5",
  "eff3ffbdd7e76baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b"
).map(colors);
const K$1 = ramp$1(scheme$5);
var scheme$4 = new Array(3).concat(
  "e5f5e0a1d99b31a354",
  "edf8e9bae4b374c476238b45",
  "edf8e9bae4b374c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b"
).map(colors);
const L = ramp$1(scheme$4);
var scheme$3 = new Array(3).concat(
  "f0f0f0bdbdbd636363",
  "f7f7f7cccccc969696525252",
  "f7f7f7cccccc969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
).map(colors);
const N = ramp$1(scheme$3);
var scheme$2 = new Array(3).concat(
  "efedf5bcbddc756bb1",
  "f2f0f7cbc9e29e9ac86a51a3",
  "f2f0f7cbc9e29e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d"
).map(colors);
const W = ramp$1(scheme$2);
var scheme$1 = new Array(3).concat(
  "fee0d2fc9272de2d26",
  "fee5d9fcae91fb6a4acb181d",
  "fee5d9fcae91fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d"
).map(colors);
const X$1 = ramp$1(scheme$1);
var scheme = new Array(3).concat(
  "fee6cefdae6be6550d",
  "feeddefdbe85fd8d3cd94701",
  "feeddefdbe85fd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704"
).map(colors);
const Q$1 = ramp$1(scheme);
function te$1(t2) {
  t2 = Math.max(0, Math.min(1, t2));
  return "rgb(" + Math.max(0, Math.min(255, Math.round(-4.54 - t2 * (35.34 - t2 * (2381.73 - t2 * (6402.7 - t2 * (7024.72 - t2 * 2710.57))))))) + ", " + Math.max(0, Math.min(255, Math.round(32.49 + t2 * (170.73 + t2 * (52.82 - t2 * (131.46 - t2 * (176.58 - t2 * 67.37))))))) + ", " + Math.max(0, Math.min(255, Math.round(81.24 + t2 * (442.36 - t2 * (2482.43 - t2 * (6167.24 - t2 * (6614.94 - t2 * 2475.67))))))) + ")";
}
const ue = cubehelixLong(cubehelix(300, 0.5, 0), cubehelix(-240, 0.5, 1));
var warm = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.5, 0.8));
var cool = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.5, 0.8));
var c$1 = cubehelix();
function ye(t2) {
  if (t2 < 0 || t2 > 1) t2 -= Math.floor(t2);
  var ts2 = Math.abs(t2 - 0.5);
  c$1.h = 360 * t2 - 100;
  c$1.s = 1.5 - 1.5 * ts2;
  c$1.l = 0.8 - 0.9 * ts2;
  return c$1 + "";
}
var c = rgb$1(), pi_1_3 = Math.PI / 3, pi_2_3 = Math.PI * 2 / 3;
function _e(t2) {
  var x2;
  t2 = (0.5 - t2) * Math.PI;
  c.r = 255 * (x2 = Math.sin(t2)) * x2;
  c.g = 255 * (x2 = Math.sin(t2 + pi_1_3)) * x2;
  c.b = 255 * (x2 = Math.sin(t2 + pi_2_3)) * x2;
  return c + "";
}
function Y$1(t2) {
  t2 = Math.max(0, Math.min(1, t2));
  return "rgb(" + Math.max(0, Math.min(255, Math.round(34.61 + t2 * (1172.33 - t2 * (10793.56 - t2 * (33300.12 - t2 * (38394.49 - t2 * 14825.05))))))) + ", " + Math.max(0, Math.min(255, Math.round(23.31 + t2 * (557.33 + t2 * (1225.33 - t2 * (3574.96 - t2 * (1073.77 + t2 * 707.56))))))) + ", " + Math.max(0, Math.min(255, Math.round(27.2 + t2 * (3211.1 - t2 * (15327.97 - t2 * (27814 - t2 * (22569.18 - t2 * 6838.66))))))) + ")";
}
function ramp(range2) {
  var n2 = range2.length;
  return function(t2) {
    return range2[Math.max(0, Math.min(n2 - 1, Math.floor(t2 * n2)))];
  };
}
const Z$1 = ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));
var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));
var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));
var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));
var last_1;
var hasRequiredLast;
function requireLast() {
  if (hasRequiredLast) return last_1;
  hasRequiredLast = 1;
  function last(array) {
    var length2 = array == null ? 0 : array.length;
    return length2 ? array[length2 - 1] : void 0;
  }
  last_1 = last;
  return last_1;
}
var lastExports = requireLast();
const Rr = /* @__PURE__ */ getDefaultExportFromCjs(lastExports);
requireIsArray();
var isFunctionExports = requireIsFunction();
const Cr = /* @__PURE__ */ getDefaultExportFromCjs(isFunctionExports);
function formatDecimal(x2) {
  return Math.abs(x2 = Math.round(x2)) >= 1e21 ? x2.toLocaleString("en").replace(/,/g, "") : x2.toString(10);
}
function formatDecimalParts(x2, p2) {
  if ((i2 = (x2 = p2 ? x2.toExponential(p2 - 1) : x2.toExponential()).indexOf("e")) < 0) return null;
  var i2, coefficient = x2.slice(0, i2);
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x2.slice(i2 + 1)
  ];
}
function exponent(x2) {
  return x2 = formatDecimalParts(Math.abs(x2)), x2 ? x2[1] : NaN;
}
function formatGroup(grouping, thousands) {
  return function(value, width) {
    var i2 = value.length, t2 = [], j2 = 0, g2 = grouping[0], length2 = 0;
    while (i2 > 0 && g2 > 0) {
      if (length2 + g2 + 1 > width) g2 = Math.max(1, width - length2);
      t2.push(value.substring(i2 -= g2, i2 + g2));
      if ((length2 += g2 + 1) > width) break;
      g2 = grouping[j2 = (j2 + 1) % grouping.length];
    }
    return t2.reverse().join(thousands);
  };
}
function formatNumerals(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i2) {
      return numerals[+i2];
    });
  };
}
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function formatSpecifier(specifier) {
  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}
formatSpecifier.prototype = FormatSpecifier.prototype;
function FormatSpecifier(specifier) {
  this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
  this.align = specifier.align === void 0 ? ">" : specifier.align + "";
  this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === void 0 ? void 0 : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === void 0 ? "" : specifier.type + "";
}
FormatSpecifier.prototype.toString = function() {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
function formatTrim(s2) {
  out: for (var n2 = s2.length, i2 = 1, i0 = -1, i1; i2 < n2; ++i2) {
    switch (s2[i2]) {
      case ".":
        i0 = i1 = i2;
        break;
      case "0":
        if (i0 === 0) i0 = i2;
        i1 = i2;
        break;
      default:
        if (!+s2[i2]) break out;
        if (i0 > 0) i0 = 0;
        break;
    }
  }
  return i0 > 0 ? s2.slice(0, i0) + s2.slice(i1 + 1) : s2;
}
var prefixExponent;
function formatPrefixAuto(x2, p2) {
  var d2 = formatDecimalParts(x2, p2);
  if (!d2) return x2 + "";
  var coefficient = d2[0], exponent2 = d2[1], i2 = exponent2 - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent2 / 3))) * 3) + 1, n2 = coefficient.length;
  return i2 === n2 ? coefficient : i2 > n2 ? coefficient + new Array(i2 - n2 + 1).join("0") : i2 > 0 ? coefficient.slice(0, i2) + "." + coefficient.slice(i2) : "0." + new Array(1 - i2).join("0") + formatDecimalParts(x2, Math.max(0, p2 + i2 - 1))[0];
}
function formatRounded(x2, p2) {
  var d2 = formatDecimalParts(x2, p2);
  if (!d2) return x2 + "";
  var coefficient = d2[0], exponent2 = d2[1];
  return exponent2 < 0 ? "0." + new Array(-exponent2).join("0") + coefficient : coefficient.length > exponent2 + 1 ? coefficient.slice(0, exponent2 + 1) + "." + coefficient.slice(exponent2 + 1) : coefficient + new Array(exponent2 - coefficient.length + 2).join("0");
}
const formatTypes = {
  "%": function(x2, p2) {
    return (x2 * 100).toFixed(p2);
  },
  "b": function(x2) {
    return Math.round(x2).toString(2);
  },
  "c": function(x2) {
    return x2 + "";
  },
  "d": formatDecimal,
  "e": function(x2, p2) {
    return x2.toExponential(p2);
  },
  "f": function(x2, p2) {
    return x2.toFixed(p2);
  },
  "g": function(x2, p2) {
    return x2.toPrecision(p2);
  },
  "o": function(x2) {
    return Math.round(x2).toString(8);
  },
  "p": function(x2, p2) {
    return formatRounded(x2 * 100, p2);
  },
  "r": formatRounded,
  "s": formatPrefixAuto,
  "X": function(x2) {
    return Math.round(x2).toString(16).toUpperCase();
  },
  "x": function(x2) {
    return Math.round(x2).toString(16);
  }
};
function identity(x2) {
  return x2;
}
var map = Array.prototype.map, prefixes = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function formatLocale$1(locale2) {
  var group = locale2.grouping === void 0 || locale2.thousands === void 0 ? identity : formatGroup(map.call(locale2.grouping, Number), locale2.thousands + ""), currencyPrefix = locale2.currency === void 0 ? "" : locale2.currency[0] + "", currencySuffix = locale2.currency === void 0 ? "" : locale2.currency[1] + "", decimal = locale2.decimal + "", numerals = locale2.numerals === void 0 ? identity : formatNumerals(map.call(locale2.numerals, String)), percent = locale2.percent === void 0 ? "%" : locale2.percent + "", minus = locale2.minus + "", nan = locale2.nan === void 0 ? "NaN" : locale2.nan + "";
  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);
    var fill = specifier.fill, align = specifier.align, sign2 = specifier.sign, symbol = specifier.symbol, zero = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type = specifier.type;
    if (type === "n") comma = true, type = "g";
    else if (!formatTypes[type]) precision === void 0 && (precision = 12), trim = true, type = "g";
    if (zero || fill === "0" && align === "=") zero = true, fill = "0", align = "=";
    var prefix2 = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "", suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";
    var formatType = formatTypes[type], maybeSuffix = /[defgprs%]/.test(type);
    precision = precision === void 0 ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
    function format2(value) {
      var valuePrefix = prefix2, valueSuffix = suffix, i2, n2, c2;
      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;
        var valueNegative = value < 0 || 1 / value < 0;
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
        if (trim) value = formatTrim(value);
        if (valueNegative && +value === 0 && sign2 !== "+") valueNegative = false;
        valuePrefix = (valueNegative ? sign2 === "(" ? sign2 : minus : sign2 === "-" || sign2 === "(" ? "" : sign2) + valuePrefix;
        valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign2 === "(" ? ")" : "");
        if (maybeSuffix) {
          i2 = -1, n2 = value.length;
          while (++i2 < n2) {
            if (c2 = value.charCodeAt(i2), 48 > c2 || c2 > 57) {
              valueSuffix = (c2 === 46 ? decimal + value.slice(i2 + 1) : value.slice(i2)) + valueSuffix;
              value = value.slice(0, i2);
              break;
            }
          }
        }
      }
      if (comma && !zero) value = group(value, Infinity);
      var length2 = valuePrefix.length + value.length + valueSuffix.length, padding = length2 < width ? new Array(width - length2 + 1).join(fill) : "";
      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
      switch (align) {
        case "<":
          value = valuePrefix + value + valueSuffix + padding;
          break;
        case "=":
          value = valuePrefix + padding + value + valueSuffix;
          break;
        case "^":
          value = padding.slice(0, length2 = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length2);
          break;
        default:
          value = padding + valuePrefix + value + valueSuffix;
          break;
      }
      return numerals(value);
    }
    format2.toString = function() {
      return specifier + "";
    };
    return format2;
  }
  function formatPrefix(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)), e2 = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3, k2 = Math.pow(10, -e2), prefix2 = prefixes[8 + e2 / 3];
    return function(value2) {
      return f(k2 * value2) + prefix2;
    };
  }
  return {
    format: newFormat,
    formatPrefix
  };
}
var locale$1;
var format;
defaultLocale$1({
  decimal: ".",
  thousands: ",",
  grouping: [3],
  currency: ["$", ""],
  minus: "-"
});
function defaultLocale$1(definition) {
  locale$1 = formatLocale$1(definition);
  format = locale$1.format;
  locale$1.formatPrefix;
  return locale$1;
}
var t0 = /* @__PURE__ */ new Date(), t1 = /* @__PURE__ */ new Date();
function newInterval(floori, offseti, count, field) {
  function interval(date) {
    return floori(date = arguments.length === 0 ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(+date)), date;
  }
  interval.floor = function(date) {
    return floori(date = /* @__PURE__ */ new Date(+date)), date;
  };
  interval.ceil = function(date) {
    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
  };
  interval.round = function(date) {
    var d0 = interval(date), d1 = interval.ceil(date);
    return date - d0 < d1 - date ? d0 : d1;
  };
  interval.offset = function(date, step) {
    return offseti(date = /* @__PURE__ */ new Date(+date), step == null ? 1 : Math.floor(step)), date;
  };
  interval.range = function(start2, stop2, step) {
    var range2 = [], previous;
    start2 = interval.ceil(start2);
    step = step == null ? 1 : Math.floor(step);
    if (!(start2 < stop2) || !(step > 0)) return range2;
    do
      range2.push(previous = /* @__PURE__ */ new Date(+start2)), offseti(start2, step), floori(start2);
    while (previous < start2 && start2 < stop2);
    return range2;
  };
  interval.filter = function(test) {
    return newInterval(function(date) {
      if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
    }, function(date, step) {
      if (date >= date) {
        if (step < 0) while (++step <= 0) {
          while (offseti(date, -1), !test(date)) {
          }
        }
        else while (--step >= 0) {
          while (offseti(date, 1), !test(date)) {
          }
        }
      }
    });
  };
  if (count) {
    interval.count = function(start2, end) {
      t0.setTime(+start2), t1.setTime(+end);
      floori(t0), floori(t1);
      return Math.floor(count(t0, t1));
    };
    interval.every = function(step) {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval : interval.filter(field ? function(d2) {
        return field(d2) % step === 0;
      } : function(d2) {
        return interval.count(0, d2) % step === 0;
      });
    };
  }
  return interval;
}
const durationSecond = 1e3;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
var day = newInterval(
  (date) => date.setHours(0, 0, 0, 0),
  (date, step) => date.setDate(date.getDate() + step),
  (start2, end) => (end - start2 - (end.getTimezoneOffset() - start2.getTimezoneOffset()) * durationMinute) / durationDay,
  (date) => date.getDate() - 1
);
day.range;
function weekday(i2) {
  return newInterval(function(date) {
    date.setDate(date.getDate() - (date.getDay() + 7 - i2) % 7);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setDate(date.getDate() + step * 7);
  }, function(start2, end) {
    return (end - start2 - (end.getTimezoneOffset() - start2.getTimezoneOffset()) * durationMinute) / durationWeek;
  });
}
var sunday = weekday(0);
var monday = weekday(1);
var tuesday = weekday(2);
var wednesday = weekday(3);
var thursday = weekday(4);
var friday = weekday(5);
var saturday = weekday(6);
sunday.range;
monday.range;
tuesday.range;
wednesday.range;
thursday.range;
friday.range;
saturday.range;
var year = newInterval(function(date) {
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setFullYear(date.getFullYear() + step);
}, function(start2, end) {
  return end.getFullYear() - start2.getFullYear();
}, function(date) {
  return date.getFullYear();
});
year.every = function(k2) {
  return !isFinite(k2 = Math.floor(k2)) || !(k2 > 0) ? null : newInterval(function(date) {
    date.setFullYear(Math.floor(date.getFullYear() / k2) * k2);
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setFullYear(date.getFullYear() + step * k2);
  });
};
year.range;
var utcDay = newInterval(function(date) {
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCDate(date.getUTCDate() + step);
}, function(start2, end) {
  return (end - start2) / durationDay;
}, function(date) {
  return date.getUTCDate() - 1;
});
utcDay.range;
function utcWeekday(i2) {
  return newInterval(function(date) {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i2) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, function(start2, end) {
    return (end - start2) / durationWeek;
  });
}
var utcSunday = utcWeekday(0);
var utcMonday = utcWeekday(1);
var utcTuesday = utcWeekday(2);
var utcWednesday = utcWeekday(3);
var utcThursday = utcWeekday(4);
var utcFriday = utcWeekday(5);
var utcSaturday = utcWeekday(6);
utcSunday.range;
utcMonday.range;
utcTuesday.range;
utcWednesday.range;
utcThursday.range;
utcFriday.range;
utcSaturday.range;
var utcYear = newInterval(function(date) {
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCFullYear(date.getUTCFullYear() + step);
}, function(start2, end) {
  return end.getUTCFullYear() - start2.getUTCFullYear();
}, function(date) {
  return date.getUTCFullYear();
});
utcYear.every = function(k2) {
  return !isFinite(k2 = Math.floor(k2)) || !(k2 > 0) ? null : newInterval(function(date) {
    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k2) * k2);
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCFullYear(date.getUTCFullYear() + step * k2);
  });
};
utcYear.range;
function localDate(d2) {
  if (0 <= d2.y && d2.y < 100) {
    var date = new Date(-1, d2.m, d2.d, d2.H, d2.M, d2.S, d2.L);
    date.setFullYear(d2.y);
    return date;
  }
  return new Date(d2.y, d2.m, d2.d, d2.H, d2.M, d2.S, d2.L);
}
function utcDate(d2) {
  if (0 <= d2.y && d2.y < 100) {
    var date = new Date(Date.UTC(-1, d2.m, d2.d, d2.H, d2.M, d2.S, d2.L));
    date.setUTCFullYear(d2.y);
    return date;
  }
  return new Date(Date.UTC(d2.y, d2.m, d2.d, d2.H, d2.M, d2.S, d2.L));
}
function newDate(y2, m2, d2) {
  return { y: y2, m: m2, d: d2, H: 0, M: 0, S: 0, L: 0 };
}
function formatLocale(locale2) {
  var locale_dateTime = locale2.dateTime, locale_date = locale2.date, locale_time = locale2.time, locale_periods = locale2.periods, locale_weekdays = locale2.days, locale_shortWeekdays = locale2.shortDays, locale_months = locale2.months, locale_shortMonths = locale2.shortMonths;
  var periodRe = formatRe(locale_periods), periodLookup = formatLookup(locale_periods), weekdayRe = formatRe(locale_weekdays), weekdayLookup = formatLookup(locale_weekdays), shortWeekdayRe = formatRe(locale_shortWeekdays), shortWeekdayLookup = formatLookup(locale_shortWeekdays), monthRe = formatRe(locale_months), monthLookup = formatLookup(locale_months), shortMonthRe = formatRe(locale_shortMonths), shortMonthLookup = formatLookup(locale_shortMonths);
  var formats = {
    "a": formatShortWeekday,
    "A": formatWeekday,
    "b": formatShortMonth,
    "B": formatMonth,
    "c": null,
    "d": formatDayOfMonth,
    "e": formatDayOfMonth,
    "f": formatMicroseconds,
    "g": formatYearISO,
    "G": formatFullYearISO,
    "H": formatHour24,
    "I": formatHour12,
    "j": formatDayOfYear,
    "L": formatMilliseconds,
    "m": formatMonthNumber,
    "M": formatMinutes,
    "p": formatPeriod,
    "q": formatQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatSeconds,
    "u": formatWeekdayNumberMonday,
    "U": formatWeekNumberSunday,
    "V": formatWeekNumberISO,
    "w": formatWeekdayNumberSunday,
    "W": formatWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatYear,
    "Y": formatFullYear,
    "Z": formatZone,
    "%": formatLiteralPercent
  };
  var utcFormats = {
    "a": formatUTCShortWeekday,
    "A": formatUTCWeekday,
    "b": formatUTCShortMonth,
    "B": formatUTCMonth,
    "c": null,
    "d": formatUTCDayOfMonth,
    "e": formatUTCDayOfMonth,
    "f": formatUTCMicroseconds,
    "g": formatUTCYearISO,
    "G": formatUTCFullYearISO,
    "H": formatUTCHour24,
    "I": formatUTCHour12,
    "j": formatUTCDayOfYear,
    "L": formatUTCMilliseconds,
    "m": formatUTCMonthNumber,
    "M": formatUTCMinutes,
    "p": formatUTCPeriod,
    "q": formatUTCQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatUTCSeconds,
    "u": formatUTCWeekdayNumberMonday,
    "U": formatUTCWeekNumberSunday,
    "V": formatUTCWeekNumberISO,
    "w": formatUTCWeekdayNumberSunday,
    "W": formatUTCWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatUTCYear,
    "Y": formatUTCFullYear,
    "Z": formatUTCZone,
    "%": formatLiteralPercent
  };
  var parses = {
    "a": parseShortWeekday,
    "A": parseWeekday,
    "b": parseShortMonth,
    "B": parseMonth,
    "c": parseLocaleDateTime,
    "d": parseDayOfMonth,
    "e": parseDayOfMonth,
    "f": parseMicroseconds,
    "g": parseYear,
    "G": parseFullYear,
    "H": parseHour24,
    "I": parseHour24,
    "j": parseDayOfYear,
    "L": parseMilliseconds,
    "m": parseMonthNumber,
    "M": parseMinutes,
    "p": parsePeriod,
    "q": parseQuarter,
    "Q": parseUnixTimestamp,
    "s": parseUnixTimestampSeconds,
    "S": parseSeconds,
    "u": parseWeekdayNumberMonday,
    "U": parseWeekNumberSunday,
    "V": parseWeekNumberISO,
    "w": parseWeekdayNumberSunday,
    "W": parseWeekNumberMonday,
    "x": parseLocaleDate,
    "X": parseLocaleTime,
    "y": parseYear,
    "Y": parseFullYear,
    "Z": parseZone,
    "%": parseLiteralPercent
  };
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);
  function newFormat(specifier, formats2) {
    return function(date) {
      var string = [], i2 = -1, j2 = 0, n2 = specifier.length, c2, pad2, format2;
      if (!(date instanceof Date)) date = /* @__PURE__ */ new Date(+date);
      while (++i2 < n2) {
        if (specifier.charCodeAt(i2) === 37) {
          string.push(specifier.slice(j2, i2));
          if ((pad2 = pads[c2 = specifier.charAt(++i2)]) != null) c2 = specifier.charAt(++i2);
          else pad2 = c2 === "e" ? " " : "0";
          if (format2 = formats2[c2]) c2 = format2(date, pad2);
          string.push(c2);
          j2 = i2 + 1;
        }
      }
      string.push(specifier.slice(j2, i2));
      return string.join("");
    };
  }
  function newParse(specifier, Z3) {
    return function(string) {
      var d2 = newDate(1900, void 0, 1), i2 = parseSpecifier(d2, specifier, string += "", 0), week, day$1;
      if (i2 != string.length) return null;
      if ("Q" in d2) return new Date(d2.Q);
      if ("s" in d2) return new Date(d2.s * 1e3 + ("L" in d2 ? d2.L : 0));
      if (Z3 && !("Z" in d2)) d2.Z = 0;
      if ("p" in d2) d2.H = d2.H % 12 + d2.p * 12;
      if (d2.m === void 0) d2.m = "q" in d2 ? d2.q : 0;
      if ("V" in d2) {
        if (d2.V < 1 || d2.V > 53) return null;
        if (!("w" in d2)) d2.w = 1;
        if ("Z" in d2) {
          week = utcDate(newDate(d2.y, 0, 1)), day$1 = week.getUTCDay();
          week = day$1 > 4 || day$1 === 0 ? utcMonday.ceil(week) : utcMonday(week);
          week = utcDay.offset(week, (d2.V - 1) * 7);
          d2.y = week.getUTCFullYear();
          d2.m = week.getUTCMonth();
          d2.d = week.getUTCDate() + (d2.w + 6) % 7;
        } else {
          week = localDate(newDate(d2.y, 0, 1)), day$1 = week.getDay();
          week = day$1 > 4 || day$1 === 0 ? monday.ceil(week) : monday(week);
          week = day.offset(week, (d2.V - 1) * 7);
          d2.y = week.getFullYear();
          d2.m = week.getMonth();
          d2.d = week.getDate() + (d2.w + 6) % 7;
        }
      } else if ("W" in d2 || "U" in d2) {
        if (!("w" in d2)) d2.w = "u" in d2 ? d2.u % 7 : "W" in d2 ? 1 : 0;
        day$1 = "Z" in d2 ? utcDate(newDate(d2.y, 0, 1)).getUTCDay() : localDate(newDate(d2.y, 0, 1)).getDay();
        d2.m = 0;
        d2.d = "W" in d2 ? (d2.w + 6) % 7 + d2.W * 7 - (day$1 + 5) % 7 : d2.w + d2.U * 7 - (day$1 + 6) % 7;
      }
      if ("Z" in d2) {
        d2.H += d2.Z / 100 | 0;
        d2.M += d2.Z % 100;
        return utcDate(d2);
      }
      return localDate(d2);
    };
  }
  function parseSpecifier(d2, specifier, string, j2) {
    var i2 = 0, n2 = specifier.length, m2 = string.length, c2, parse;
    while (i2 < n2) {
      if (j2 >= m2) return -1;
      c2 = specifier.charCodeAt(i2++);
      if (c2 === 37) {
        c2 = specifier.charAt(i2++);
        parse = parses[c2 in pads ? specifier.charAt(i2++) : c2];
        if (!parse || (j2 = parse(d2, string, j2)) < 0) return -1;
      } else if (c2 != string.charCodeAt(j2++)) {
        return -1;
      }
    }
    return j2;
  }
  function parsePeriod(d2, string, i2) {
    var n2 = periodRe.exec(string.slice(i2));
    return n2 ? (d2.p = periodLookup.get(n2[0].toLowerCase()), i2 + n2[0].length) : -1;
  }
  function parseShortWeekday(d2, string, i2) {
    var n2 = shortWeekdayRe.exec(string.slice(i2));
    return n2 ? (d2.w = shortWeekdayLookup.get(n2[0].toLowerCase()), i2 + n2[0].length) : -1;
  }
  function parseWeekday(d2, string, i2) {
    var n2 = weekdayRe.exec(string.slice(i2));
    return n2 ? (d2.w = weekdayLookup.get(n2[0].toLowerCase()), i2 + n2[0].length) : -1;
  }
  function parseShortMonth(d2, string, i2) {
    var n2 = shortMonthRe.exec(string.slice(i2));
    return n2 ? (d2.m = shortMonthLookup.get(n2[0].toLowerCase()), i2 + n2[0].length) : -1;
  }
  function parseMonth(d2, string, i2) {
    var n2 = monthRe.exec(string.slice(i2));
    return n2 ? (d2.m = monthLookup.get(n2[0].toLowerCase()), i2 + n2[0].length) : -1;
  }
  function parseLocaleDateTime(d2, string, i2) {
    return parseSpecifier(d2, locale_dateTime, string, i2);
  }
  function parseLocaleDate(d2, string, i2) {
    return parseSpecifier(d2, locale_date, string, i2);
  }
  function parseLocaleTime(d2, string, i2) {
    return parseSpecifier(d2, locale_time, string, i2);
  }
  function formatShortWeekday(d2) {
    return locale_shortWeekdays[d2.getDay()];
  }
  function formatWeekday(d2) {
    return locale_weekdays[d2.getDay()];
  }
  function formatShortMonth(d2) {
    return locale_shortMonths[d2.getMonth()];
  }
  function formatMonth(d2) {
    return locale_months[d2.getMonth()];
  }
  function formatPeriod(d2) {
    return locale_periods[+(d2.getHours() >= 12)];
  }
  function formatQuarter(d2) {
    return 1 + ~~(d2.getMonth() / 3);
  }
  function formatUTCShortWeekday(d2) {
    return locale_shortWeekdays[d2.getUTCDay()];
  }
  function formatUTCWeekday(d2) {
    return locale_weekdays[d2.getUTCDay()];
  }
  function formatUTCShortMonth(d2) {
    return locale_shortMonths[d2.getUTCMonth()];
  }
  function formatUTCMonth(d2) {
    return locale_months[d2.getUTCMonth()];
  }
  function formatUTCPeriod(d2) {
    return locale_periods[+(d2.getUTCHours() >= 12)];
  }
  function formatUTCQuarter(d2) {
    return 1 + ~~(d2.getUTCMonth() / 3);
  }
  return {
    format: function(specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    parse: function(specifier) {
      var p2 = newParse(specifier += "", false);
      p2.toString = function() {
        return specifier;
      };
      return p2;
    },
    utcFormat: function(specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    utcParse: function(specifier) {
      var p2 = newParse(specifier += "", true);
      p2.toString = function() {
        return specifier;
      };
      return p2;
    }
  };
}
var pads = { "-": "", "_": " ", "0": "0" }, numberRe = /^\s*\d+/, percentRe = /^%/, requoteRe = /[\\^$*+?|[\]().{}]/g;
function pad(value, fill, width) {
  var sign2 = value < 0 ? "-" : "", string = (sign2 ? -value : value) + "", length2 = string.length;
  return sign2 + (length2 < width ? new Array(width - length2 + 1).join(fill) + string : string);
}
function requote(s2) {
  return s2.replace(requoteRe, "\\$&");
}
function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}
function formatLookup(names) {
  return new Map(names.map((name, i2) => [name.toLowerCase(), i2]));
}
function parseWeekdayNumberSunday(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 1));
  return n2 ? (d2.w = +n2[0], i2 + n2[0].length) : -1;
}
function parseWeekdayNumberMonday(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 1));
  return n2 ? (d2.u = +n2[0], i2 + n2[0].length) : -1;
}
function parseWeekNumberSunday(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d2.U = +n2[0], i2 + n2[0].length) : -1;
}
function parseWeekNumberISO(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d2.V = +n2[0], i2 + n2[0].length) : -1;
}
function parseWeekNumberMonday(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d2.W = +n2[0], i2 + n2[0].length) : -1;
}
function parseFullYear(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 4));
  return n2 ? (d2.y = +n2[0], i2 + n2[0].length) : -1;
}
function parseYear(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d2.y = +n2[0] + (+n2[0] > 68 ? 1900 : 2e3), i2 + n2[0].length) : -1;
}
function parseZone(d2, string, i2) {
  var n2 = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i2, i2 + 6));
  return n2 ? (d2.Z = n2[1] ? 0 : -(n2[2] + (n2[3] || "00")), i2 + n2[0].length) : -1;
}
function parseQuarter(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 1));
  return n2 ? (d2.q = n2[0] * 3 - 3, i2 + n2[0].length) : -1;
}
function parseMonthNumber(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d2.m = n2[0] - 1, i2 + n2[0].length) : -1;
}
function parseDayOfMonth(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d2.d = +n2[0], i2 + n2[0].length) : -1;
}
function parseDayOfYear(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 3));
  return n2 ? (d2.m = 0, d2.d = +n2[0], i2 + n2[0].length) : -1;
}
function parseHour24(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d2.H = +n2[0], i2 + n2[0].length) : -1;
}
function parseMinutes(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d2.M = +n2[0], i2 + n2[0].length) : -1;
}
function parseSeconds(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d2.S = +n2[0], i2 + n2[0].length) : -1;
}
function parseMilliseconds(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 3));
  return n2 ? (d2.L = +n2[0], i2 + n2[0].length) : -1;
}
function parseMicroseconds(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 6));
  return n2 ? (d2.L = Math.floor(n2[0] / 1e3), i2 + n2[0].length) : -1;
}
function parseLiteralPercent(d2, string, i2) {
  var n2 = percentRe.exec(string.slice(i2, i2 + 1));
  return n2 ? i2 + n2[0].length : -1;
}
function parseUnixTimestamp(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2));
  return n2 ? (d2.Q = +n2[0], i2 + n2[0].length) : -1;
}
function parseUnixTimestampSeconds(d2, string, i2) {
  var n2 = numberRe.exec(string.slice(i2));
  return n2 ? (d2.s = +n2[0], i2 + n2[0].length) : -1;
}
function formatDayOfMonth(d2, p2) {
  return pad(d2.getDate(), p2, 2);
}
function formatHour24(d2, p2) {
  return pad(d2.getHours(), p2, 2);
}
function formatHour12(d2, p2) {
  return pad(d2.getHours() % 12 || 12, p2, 2);
}
function formatDayOfYear(d2, p2) {
  return pad(1 + day.count(year(d2), d2), p2, 3);
}
function formatMilliseconds(d2, p2) {
  return pad(d2.getMilliseconds(), p2, 3);
}
function formatMicroseconds(d2, p2) {
  return formatMilliseconds(d2, p2) + "000";
}
function formatMonthNumber(d2, p2) {
  return pad(d2.getMonth() + 1, p2, 2);
}
function formatMinutes(d2, p2) {
  return pad(d2.getMinutes(), p2, 2);
}
function formatSeconds(d2, p2) {
  return pad(d2.getSeconds(), p2, 2);
}
function formatWeekdayNumberMonday(d2) {
  var day2 = d2.getDay();
  return day2 === 0 ? 7 : day2;
}
function formatWeekNumberSunday(d2, p2) {
  return pad(sunday.count(year(d2) - 1, d2), p2, 2);
}
function dISO(d2) {
  var day2 = d2.getDay();
  return day2 >= 4 || day2 === 0 ? thursday(d2) : thursday.ceil(d2);
}
function formatWeekNumberISO(d2, p2) {
  d2 = dISO(d2);
  return pad(thursday.count(year(d2), d2) + (year(d2).getDay() === 4), p2, 2);
}
function formatWeekdayNumberSunday(d2) {
  return d2.getDay();
}
function formatWeekNumberMonday(d2, p2) {
  return pad(monday.count(year(d2) - 1, d2), p2, 2);
}
function formatYear(d2, p2) {
  return pad(d2.getFullYear() % 100, p2, 2);
}
function formatYearISO(d2, p2) {
  d2 = dISO(d2);
  return pad(d2.getFullYear() % 100, p2, 2);
}
function formatFullYear(d2, p2) {
  return pad(d2.getFullYear() % 1e4, p2, 4);
}
function formatFullYearISO(d2, p2) {
  var day2 = d2.getDay();
  d2 = day2 >= 4 || day2 === 0 ? thursday(d2) : thursday.ceil(d2);
  return pad(d2.getFullYear() % 1e4, p2, 4);
}
function formatZone(d2) {
  var z2 = d2.getTimezoneOffset();
  return (z2 > 0 ? "-" : (z2 *= -1, "+")) + pad(z2 / 60 | 0, "0", 2) + pad(z2 % 60, "0", 2);
}
function formatUTCDayOfMonth(d2, p2) {
  return pad(d2.getUTCDate(), p2, 2);
}
function formatUTCHour24(d2, p2) {
  return pad(d2.getUTCHours(), p2, 2);
}
function formatUTCHour12(d2, p2) {
  return pad(d2.getUTCHours() % 12 || 12, p2, 2);
}
function formatUTCDayOfYear(d2, p2) {
  return pad(1 + utcDay.count(utcYear(d2), d2), p2, 3);
}
function formatUTCMilliseconds(d2, p2) {
  return pad(d2.getUTCMilliseconds(), p2, 3);
}
function formatUTCMicroseconds(d2, p2) {
  return formatUTCMilliseconds(d2, p2) + "000";
}
function formatUTCMonthNumber(d2, p2) {
  return pad(d2.getUTCMonth() + 1, p2, 2);
}
function formatUTCMinutes(d2, p2) {
  return pad(d2.getUTCMinutes(), p2, 2);
}
function formatUTCSeconds(d2, p2) {
  return pad(d2.getUTCSeconds(), p2, 2);
}
function formatUTCWeekdayNumberMonday(d2) {
  var dow = d2.getUTCDay();
  return dow === 0 ? 7 : dow;
}
function formatUTCWeekNumberSunday(d2, p2) {
  return pad(utcSunday.count(utcYear(d2) - 1, d2), p2, 2);
}
function UTCdISO(d2) {
  var day2 = d2.getUTCDay();
  return day2 >= 4 || day2 === 0 ? utcThursday(d2) : utcThursday.ceil(d2);
}
function formatUTCWeekNumberISO(d2, p2) {
  d2 = UTCdISO(d2);
  return pad(utcThursday.count(utcYear(d2), d2) + (utcYear(d2).getUTCDay() === 4), p2, 2);
}
function formatUTCWeekdayNumberSunday(d2) {
  return d2.getUTCDay();
}
function formatUTCWeekNumberMonday(d2, p2) {
  return pad(utcMonday.count(utcYear(d2) - 1, d2), p2, 2);
}
function formatUTCYear(d2, p2) {
  return pad(d2.getUTCFullYear() % 100, p2, 2);
}
function formatUTCYearISO(d2, p2) {
  d2 = UTCdISO(d2);
  return pad(d2.getUTCFullYear() % 100, p2, 2);
}
function formatUTCFullYear(d2, p2) {
  return pad(d2.getUTCFullYear() % 1e4, p2, 4);
}
function formatUTCFullYearISO(d2, p2) {
  var day2 = d2.getUTCDay();
  d2 = day2 >= 4 || day2 === 0 ? utcThursday(d2) : utcThursday.ceil(d2);
  return pad(d2.getUTCFullYear() % 1e4, p2, 4);
}
function formatUTCZone() {
  return "+0000";
}
function formatLiteralPercent() {
  return "%";
}
function formatUnixTimestamp(d2) {
  return +d2;
}
function formatUnixTimestampSeconds(d2) {
  return Math.floor(+d2 / 1e3);
}
var locale;
var timeFormat;
defaultLocale({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});
function defaultLocale(definition) {
  locale = formatLocale(definition);
  timeFormat = locale.format;
  locale.parse;
  locale.utcFormat;
  locale.utcParse;
  return locale;
}
var isPlainObjectExports = requireIsPlainObject();
const je = /* @__PURE__ */ getDefaultExportFromCjs(isPlainObjectExports);
var _basePickBy;
var hasRequired_basePickBy;
function require_basePickBy() {
  if (hasRequired_basePickBy) return _basePickBy;
  hasRequired_basePickBy = 1;
  var baseGet = require_baseGet(), baseSet = require_baseSet(), castPath = require_castPath();
  function basePickBy(object2, paths, predicate) {
    var index2 = -1, length2 = paths.length, result = {};
    while (++index2 < length2) {
      var path = paths[index2], value = baseGet(object2, path);
      if (predicate(value, path)) {
        baseSet(result, castPath(path, object2), value);
      }
    }
    return result;
  }
  _basePickBy = basePickBy;
  return _basePickBy;
}
var _baseHasIn;
var hasRequired_baseHasIn;
function require_baseHasIn() {
  if (hasRequired_baseHasIn) return _baseHasIn;
  hasRequired_baseHasIn = 1;
  function baseHasIn(object2, key) {
    return object2 != null && key in Object(object2);
  }
  _baseHasIn = baseHasIn;
  return _baseHasIn;
}
var _hasPath;
var hasRequired_hasPath;
function require_hasPath() {
  if (hasRequired_hasPath) return _hasPath;
  hasRequired_hasPath = 1;
  var castPath = require_castPath(), isArguments = requireIsArguments(), isArray = requireIsArray(), isIndex = require_isIndex(), isLength = requireIsLength(), toKey = require_toKey();
  function hasPath(object2, path, hasFunc) {
    path = castPath(path, object2);
    var index2 = -1, length2 = path.length, result = false;
    while (++index2 < length2) {
      var key = toKey(path[index2]);
      if (!(result = object2 != null && hasFunc(object2, key))) {
        break;
      }
      object2 = object2[key];
    }
    if (result || ++index2 != length2) {
      return result;
    }
    length2 = object2 == null ? 0 : object2.length;
    return !!length2 && isLength(length2) && isIndex(key, length2) && (isArray(object2) || isArguments(object2));
  }
  _hasPath = hasPath;
  return _hasPath;
}
var hasIn_1;
var hasRequiredHasIn;
function requireHasIn() {
  if (hasRequiredHasIn) return hasIn_1;
  hasRequiredHasIn = 1;
  var baseHasIn = require_baseHasIn(), hasPath = require_hasPath();
  function hasIn(object2, path) {
    return object2 != null && hasPath(object2, path, baseHasIn);
  }
  hasIn_1 = hasIn;
  return hasIn_1;
}
var _basePick;
var hasRequired_basePick;
function require_basePick() {
  if (hasRequired_basePick) return _basePick;
  hasRequired_basePick = 1;
  var basePickBy = require_basePickBy(), hasIn = requireHasIn();
  function basePick(object2, paths) {
    return basePickBy(object2, paths, function(value, path) {
      return hasIn(object2, path);
    });
  }
  _basePick = basePick;
  return _basePick;
}
var _arrayPush;
var hasRequired_arrayPush;
function require_arrayPush() {
  if (hasRequired_arrayPush) return _arrayPush;
  hasRequired_arrayPush = 1;
  function arrayPush(array, values) {
    var index2 = -1, length2 = values.length, offset = array.length;
    while (++index2 < length2) {
      array[offset + index2] = values[index2];
    }
    return array;
  }
  _arrayPush = arrayPush;
  return _arrayPush;
}
var _isFlattenable;
var hasRequired_isFlattenable;
function require_isFlattenable() {
  if (hasRequired_isFlattenable) return _isFlattenable;
  hasRequired_isFlattenable = 1;
  var Symbol2 = require_Symbol(), isArguments = requireIsArguments(), isArray = requireIsArray();
  var spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : void 0;
  function isFlattenable(value) {
    return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
  }
  _isFlattenable = isFlattenable;
  return _isFlattenable;
}
var _baseFlatten;
var hasRequired_baseFlatten;
function require_baseFlatten() {
  if (hasRequired_baseFlatten) return _baseFlatten;
  hasRequired_baseFlatten = 1;
  var arrayPush = require_arrayPush(), isFlattenable = require_isFlattenable();
  function baseFlatten(array, depth, predicate, isStrict, result) {
    var index2 = -1, length2 = array.length;
    predicate || (predicate = isFlattenable);
    result || (result = []);
    while (++index2 < length2) {
      var value = array[index2];
      if (depth > 0 && predicate(value)) {
        if (depth > 1) {
          baseFlatten(value, depth - 1, predicate, isStrict, result);
        } else {
          arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }
  _baseFlatten = baseFlatten;
  return _baseFlatten;
}
var flatten_1;
var hasRequiredFlatten;
function requireFlatten() {
  if (hasRequiredFlatten) return flatten_1;
  hasRequiredFlatten = 1;
  var baseFlatten = require_baseFlatten();
  function flatten2(array) {
    var length2 = array == null ? 0 : array.length;
    return length2 ? baseFlatten(array, 1) : [];
  }
  flatten_1 = flatten2;
  return flatten_1;
}
var _flatRest;
var hasRequired_flatRest;
function require_flatRest() {
  if (hasRequired_flatRest) return _flatRest;
  hasRequired_flatRest = 1;
  var flatten2 = requireFlatten(), overRest = require_overRest(), setToString = require_setToString();
  function flatRest(func) {
    return setToString(overRest(func, void 0, flatten2), func + "");
  }
  _flatRest = flatRest;
  return _flatRest;
}
var pick_1;
var hasRequiredPick;
function requirePick() {
  if (hasRequiredPick) return pick_1;
  hasRequiredPick = 1;
  var basePick = require_basePick(), flatRest = require_flatRest();
  var pick = flatRest(function(object2, paths) {
    return object2 == null ? {} : basePick(object2, paths);
  });
  pick_1 = pick;
  return pick_1;
}
requirePick();
var _arraySome;
var hasRequired_arraySome;
function require_arraySome() {
  if (hasRequired_arraySome) return _arraySome;
  hasRequired_arraySome = 1;
  function arraySome(array, predicate) {
    var index2 = -1, length2 = array == null ? 0 : array.length;
    while (++index2 < length2) {
      if (predicate(array[index2], index2, array)) {
        return true;
      }
    }
    return false;
  }
  _arraySome = arraySome;
  return _arraySome;
}
var _equalArrays;
var hasRequired_equalArrays;
function require_equalArrays() {
  if (hasRequired_equalArrays) return _equalArrays;
  hasRequired_equalArrays = 1;
  var SetCache = require_SetCache(), arraySome = require_arraySome(), cacheHas = require_cacheHas();
  var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
  function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }
    var arrStacked = stack.get(array);
    var othStacked = stack.get(other);
    if (arrStacked && othStacked) {
      return arrStacked == other && othStacked == array;
    }
    var index2 = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0;
    stack.set(array, other);
    stack.set(other, array);
    while (++index2 < arrLength) {
      var arrValue = array[index2], othValue = other[index2];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, arrValue, index2, other, array, stack) : customizer(arrValue, othValue, index2, array, other, stack);
      }
      if (compared !== void 0) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }
      if (seen) {
        if (!arraySome(other, function(othValue2, othIndex) {
          if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
            return seen.push(othIndex);
          }
        })) {
          result = false;
          break;
        }
      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
        result = false;
        break;
      }
    }
    stack["delete"](array);
    stack["delete"](other);
    return result;
  }
  _equalArrays = equalArrays;
  return _equalArrays;
}
var _mapToArray;
var hasRequired_mapToArray;
function require_mapToArray() {
  if (hasRequired_mapToArray) return _mapToArray;
  hasRequired_mapToArray = 1;
  function mapToArray(map2) {
    var index2 = -1, result = Array(map2.size);
    map2.forEach(function(value, key) {
      result[++index2] = [key, value];
    });
    return result;
  }
  _mapToArray = mapToArray;
  return _mapToArray;
}
var _equalByTag;
var hasRequired_equalByTag;
function require_equalByTag() {
  if (hasRequired_equalByTag) return _equalByTag;
  hasRequired_equalByTag = 1;
  var Symbol2 = require_Symbol(), Uint8Array = require_Uint8Array(), eq = requireEq(), equalArrays = require_equalArrays(), mapToArray = require_mapToArray(), setToArray = require_setToArray();
  var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
  var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
  var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]";
  var symbolProto = Symbol2 ? Symbol2.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
  function equalByTag(object2, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag:
        if (object2.byteLength != other.byteLength || object2.byteOffset != other.byteOffset) {
          return false;
        }
        object2 = object2.buffer;
        other = other.buffer;
      case arrayBufferTag:
        if (object2.byteLength != other.byteLength || !equalFunc(new Uint8Array(object2), new Uint8Array(other))) {
          return false;
        }
        return true;
      case boolTag:
      case dateTag:
      case numberTag:
        return eq(+object2, +other);
      case errorTag:
        return object2.name == other.name && object2.message == other.message;
      case regexpTag:
      case stringTag:
        return object2 == other + "";
      case mapTag:
        var convert = mapToArray;
      case setTag:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
        convert || (convert = setToArray);
        if (object2.size != other.size && !isPartial) {
          return false;
        }
        var stacked = stack.get(object2);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= COMPARE_UNORDERED_FLAG;
        stack.set(object2, other);
        var result = equalArrays(convert(object2), convert(other), bitmask, customizer, equalFunc, stack);
        stack["delete"](object2);
        return result;
      case symbolTag:
        if (symbolValueOf) {
          return symbolValueOf.call(object2) == symbolValueOf.call(other);
        }
    }
    return false;
  }
  _equalByTag = equalByTag;
  return _equalByTag;
}
var _baseGetAllKeys;
var hasRequired_baseGetAllKeys;
function require_baseGetAllKeys() {
  if (hasRequired_baseGetAllKeys) return _baseGetAllKeys;
  hasRequired_baseGetAllKeys = 1;
  var arrayPush = require_arrayPush(), isArray = requireIsArray();
  function baseGetAllKeys(object2, keysFunc, symbolsFunc) {
    var result = keysFunc(object2);
    return isArray(object2) ? result : arrayPush(result, symbolsFunc(object2));
  }
  _baseGetAllKeys = baseGetAllKeys;
  return _baseGetAllKeys;
}
var _arrayFilter;
var hasRequired_arrayFilter;
function require_arrayFilter() {
  if (hasRequired_arrayFilter) return _arrayFilter;
  hasRequired_arrayFilter = 1;
  function arrayFilter(array, predicate) {
    var index2 = -1, length2 = array == null ? 0 : array.length, resIndex = 0, result = [];
    while (++index2 < length2) {
      var value = array[index2];
      if (predicate(value, index2, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }
  _arrayFilter = arrayFilter;
  return _arrayFilter;
}
var stubArray_1;
var hasRequiredStubArray;
function requireStubArray() {
  if (hasRequiredStubArray) return stubArray_1;
  hasRequiredStubArray = 1;
  function stubArray() {
    return [];
  }
  stubArray_1 = stubArray;
  return stubArray_1;
}
var _getSymbols;
var hasRequired_getSymbols;
function require_getSymbols() {
  if (hasRequired_getSymbols) return _getSymbols;
  hasRequired_getSymbols = 1;
  var arrayFilter = require_arrayFilter(), stubArray = requireStubArray();
  var objectProto = Object.prototype;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var nativeGetSymbols = Object.getOwnPropertySymbols;
  var getSymbols = !nativeGetSymbols ? stubArray : function(object2) {
    if (object2 == null) {
      return [];
    }
    object2 = Object(object2);
    return arrayFilter(nativeGetSymbols(object2), function(symbol) {
      return propertyIsEnumerable.call(object2, symbol);
    });
  };
  _getSymbols = getSymbols;
  return _getSymbols;
}
var _nativeKeys;
var hasRequired_nativeKeys;
function require_nativeKeys() {
  if (hasRequired_nativeKeys) return _nativeKeys;
  hasRequired_nativeKeys = 1;
  var overArg = require_overArg();
  var nativeKeys = overArg(Object.keys, Object);
  _nativeKeys = nativeKeys;
  return _nativeKeys;
}
var _baseKeys;
var hasRequired_baseKeys;
function require_baseKeys() {
  if (hasRequired_baseKeys) return _baseKeys;
  hasRequired_baseKeys = 1;
  var isPrototype = require_isPrototype(), nativeKeys = require_nativeKeys();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseKeys(object2) {
    if (!isPrototype(object2)) {
      return nativeKeys(object2);
    }
    var result = [];
    for (var key in Object(object2)) {
      if (hasOwnProperty.call(object2, key) && key != "constructor") {
        result.push(key);
      }
    }
    return result;
  }
  _baseKeys = baseKeys;
  return _baseKeys;
}
var keys_1;
var hasRequiredKeys;
function requireKeys() {
  if (hasRequiredKeys) return keys_1;
  hasRequiredKeys = 1;
  var arrayLikeKeys = require_arrayLikeKeys(), baseKeys = require_baseKeys(), isArrayLike = requireIsArrayLike();
  function keys(object2) {
    return isArrayLike(object2) ? arrayLikeKeys(object2) : baseKeys(object2);
  }
  keys_1 = keys;
  return keys_1;
}
var _getAllKeys;
var hasRequired_getAllKeys;
function require_getAllKeys() {
  if (hasRequired_getAllKeys) return _getAllKeys;
  hasRequired_getAllKeys = 1;
  var baseGetAllKeys = require_baseGetAllKeys(), getSymbols = require_getSymbols(), keys = requireKeys();
  function getAllKeys(object2) {
    return baseGetAllKeys(object2, keys, getSymbols);
  }
  _getAllKeys = getAllKeys;
  return _getAllKeys;
}
var _equalObjects;
var hasRequired_equalObjects;
function require_equalObjects() {
  if (hasRequired_equalObjects) return _equalObjects;
  hasRequired_equalObjects = 1;
  var getAllKeys = require_getAllKeys();
  var COMPARE_PARTIAL_FLAG = 1;
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function equalObjects(object2, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object2), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index2 = objLength;
    while (index2--) {
      var key = objProps[index2];
      if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
        return false;
      }
    }
    var objStacked = stack.get(object2);
    var othStacked = stack.get(other);
    if (objStacked && othStacked) {
      return objStacked == other && othStacked == object2;
    }
    var result = true;
    stack.set(object2, other);
    stack.set(other, object2);
    var skipCtor = isPartial;
    while (++index2 < objLength) {
      key = objProps[index2];
      var objValue = object2[key], othValue = other[key];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, objValue, key, other, object2, stack) : customizer(objValue, othValue, key, object2, other, stack);
      }
      if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == "constructor");
    }
    if (result && !skipCtor) {
      var objCtor = object2.constructor, othCtor = other.constructor;
      if (objCtor != othCtor && ("constructor" in object2 && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack["delete"](object2);
    stack["delete"](other);
    return result;
  }
  _equalObjects = equalObjects;
  return _equalObjects;
}
var _DataView;
var hasRequired_DataView;
function require_DataView() {
  if (hasRequired_DataView) return _DataView;
  hasRequired_DataView = 1;
  var getNative = require_getNative(), root = require_root();
  var DataView = getNative(root, "DataView");
  _DataView = DataView;
  return _DataView;
}
var _Promise;
var hasRequired_Promise;
function require_Promise() {
  if (hasRequired_Promise) return _Promise;
  hasRequired_Promise = 1;
  var getNative = require_getNative(), root = require_root();
  var Promise2 = getNative(root, "Promise");
  _Promise = Promise2;
  return _Promise;
}
var _WeakMap;
var hasRequired_WeakMap;
function require_WeakMap() {
  if (hasRequired_WeakMap) return _WeakMap;
  hasRequired_WeakMap = 1;
  var getNative = require_getNative(), root = require_root();
  var WeakMap = getNative(root, "WeakMap");
  _WeakMap = WeakMap;
  return _WeakMap;
}
var _getTag;
var hasRequired_getTag;
function require_getTag() {
  if (hasRequired_getTag) return _getTag;
  hasRequired_getTag = 1;
  var DataView = require_DataView(), Map2 = require_Map(), Promise2 = require_Promise(), Set2 = require_Set(), WeakMap = require_WeakMap(), baseGetTag = require_baseGetTag(), toSource = require_toSource();
  var mapTag = "[object Map]", objectTag = "[object Object]", promiseTag = "[object Promise]", setTag = "[object Set]", weakMapTag = "[object WeakMap]";
  var dataViewTag = "[object DataView]";
  var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map2), promiseCtorString = toSource(Promise2), setCtorString = toSource(Set2), weakMapCtorString = toSource(WeakMap);
  var getTag = baseGetTag;
  if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
    getTag = function(value) {
      var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag;
          case mapCtorString:
            return mapTag;
          case promiseCtorString:
            return promiseTag;
          case setCtorString:
            return setTag;
          case weakMapCtorString:
            return weakMapTag;
        }
      }
      return result;
    };
  }
  _getTag = getTag;
  return _getTag;
}
var _baseIsEqualDeep;
var hasRequired_baseIsEqualDeep;
function require_baseIsEqualDeep() {
  if (hasRequired_baseIsEqualDeep) return _baseIsEqualDeep;
  hasRequired_baseIsEqualDeep = 1;
  var Stack = require_Stack(), equalArrays = require_equalArrays(), equalByTag = require_equalByTag(), equalObjects = require_equalObjects(), getTag = require_getTag(), isArray = requireIsArray(), isBuffer2 = requireIsBuffer(), isTypedArray = requireIsTypedArray();
  var COMPARE_PARTIAL_FLAG = 1;
  var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseIsEqualDeep(object2, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray(object2), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object2), othTag = othIsArr ? arrayTag : getTag(other);
    objTag = objTag == argsTag ? objectTag : objTag;
    othTag = othTag == argsTag ? objectTag : othTag;
    var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
    if (isSameTag && isBuffer2(object2)) {
      if (!isBuffer2(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack());
      return objIsArr || isTypedArray(object2) ? equalArrays(object2, other, bitmask, customizer, equalFunc, stack) : equalByTag(object2, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
      var objIsWrapped = objIsObj && hasOwnProperty.call(object2, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object2.value() : object2, othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new Stack());
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack());
    return equalObjects(object2, other, bitmask, customizer, equalFunc, stack);
  }
  _baseIsEqualDeep = baseIsEqualDeep;
  return _baseIsEqualDeep;
}
var _baseIsEqual;
var hasRequired_baseIsEqual;
function require_baseIsEqual() {
  if (hasRequired_baseIsEqual) return _baseIsEqual;
  hasRequired_baseIsEqual = 1;
  var baseIsEqualDeep = require_baseIsEqualDeep(), isObjectLike = requireIsObjectLike();
  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
  }
  _baseIsEqual = baseIsEqual;
  return _baseIsEqual;
}
var isEqual_1;
var hasRequiredIsEqual;
function requireIsEqual() {
  if (hasRequiredIsEqual) return isEqual_1;
  hasRequiredIsEqual = 1;
  var baseIsEqual = require_baseIsEqual();
  function isEqual2(value, other) {
    return baseIsEqual(value, other);
  }
  isEqual_1 = isEqual2;
  return isEqual_1;
}
requireIsEqual();
var Sr = reactExports.createContext(), qr = function(e2) {
  var t2 = e2.children, n2 = e2.animate, o2 = void 0 === n2 || n2, i2 = e2.config, a2 = void 0 === i2 ? "default" : i2, l2 = reactExports.useMemo((function() {
    var e3 = _$2(a2) ? config[a2] : a2;
    return { animate: o2, config: e3 };
  }), [o2, a2]);
  return jsxRuntimeExports.jsx(Sr.Provider, { value: l2, children: t2 });
}, Dr = function() {
  return reactExports.useContext(Sr);
}, Er = function(e2) {
  var r2 = e2.children, t2 = e2.condition, o2 = e2.wrapper;
  return t2 ? reactExports.cloneElement(o2, {}, r2) : r2;
}, Ur = { position: "relative" }, Fr = function(e2) {
  var r2 = e2.children, t2 = e2.theme, n2 = e2.renderWrapper, i2 = void 0 === n2 || n2, a2 = e2.isInteractive, l2 = void 0 === a2 || a2, d2 = e2.animate, u2 = e2.motionConfig, c2 = reactExports.useRef(null);
  return jsxRuntimeExports.jsx(z$3, { theme: t2, children: jsxRuntimeExports.jsx(qr, { animate: d2, config: u2, children: jsxRuntimeExports.jsx(W$1, { container: c2, children: jsxRuntimeExports.jsxs(Er, { condition: i2, wrapper: jsxRuntimeExports.jsx("div", { style: Ur, ref: c2 }), children: [r2, l2 && jsxRuntimeExports.jsx(M$1, {})] }) }) }) });
}, Kr = function(e2, r2) {
  return e2.width === r2.width && e2.height === r2.height;
}, Nr = function(e2) {
  var r2 = e2.children, t2 = e2.width, n2 = e2.height, o2 = e2.onResize, i2 = e2.debounceResize, l2 = l$1({ width: t2, height: n2 }, i2, { equalityFn: Kr })[0];
  return reactExports.useEffect((function() {
    null == o2 || o2(l2);
  }), [l2, o2]), jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: r2(l2) });
}, $r = function(e2) {
  var r2 = e2.children, t2 = e2.defaultWidth, n2 = e2.defaultHeight, o2 = e2.onResize, i2 = e2.debounceResize, a2 = void 0 === i2 ? 0 : i2;
  return jsxRuntimeExports.jsx(AutoSizer, { defaultWidth: t2, defaultHeight: n2, children: function(e3) {
    var t3 = e3.width, n3 = e3.height;
    return jsxRuntimeExports.jsx(Nr, { width: t3, height: n3, onResize: o2, debounceResize: a2, children: r2 });
  } });
};
function Vr() {
  return Vr = Object.assign ? Object.assign.bind() : function(e2) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t2 = arguments[r2];
      for (var n2 in t2) ({}).hasOwnProperty.call(t2, n2) && (e2[n2] = t2[n2]);
    }
    return e2;
  }, Vr.apply(null, arguments);
}
function Zr(e2, r2) {
  if (null == e2) return {};
  var t2 = {};
  for (var n2 in e2) if ({}.hasOwnProperty.call(e2, n2)) {
    if (-1 !== r2.indexOf(n2)) continue;
    t2[n2] = e2[n2];
  }
  return t2;
}
var rt = ["id", "colors"], tt = function(e2) {
  var r2 = e2.id, t2 = e2.colors, n2 = Zr(e2, rt);
  return jsxRuntimeExports.jsx("linearGradient", Vr({ id: r2, x1: 0, x2: 0, y1: 0, y2: 1 }, n2, { children: t2.map((function(e3) {
    var r3 = e3.offset, t3 = e3.color, n3 = e3.opacity;
    return jsxRuntimeExports.jsx("stop", { offset: r3 + "%", stopColor: t3, stopOpacity: void 0 !== n3 ? n3 : 1 }, r3);
  })) }));
}, ot = { linearGradient: tt }, it = { color: "#000000", background: "#ffffff", size: 4, padding: 4, stagger: false }, at = reactExports.memo((function(e2) {
  var r2 = e2.id, t2 = e2.background, n2 = void 0 === t2 ? it.background : t2, o2 = e2.color, i2 = void 0 === o2 ? it.color : o2, a2 = e2.size, l2 = void 0 === a2 ? it.size : a2, d2 = e2.padding, u2 = void 0 === d2 ? it.padding : d2, c2 = e2.stagger, s2 = void 0 === c2 ? it.stagger : c2, f = l2 + u2, h2 = l2 / 2, p2 = u2 / 2;
  return true === s2 && (f = 2 * l2 + 2 * u2), jsxRuntimeExports.jsxs("pattern", { id: r2, width: f, height: f, patternUnits: "userSpaceOnUse", children: [jsxRuntimeExports.jsx("rect", { width: f, height: f, fill: n2 }), jsxRuntimeExports.jsx("circle", { cx: p2 + h2, cy: p2 + h2, r: h2, fill: i2 }), s2 && jsxRuntimeExports.jsx("circle", { cx: 1.5 * u2 + l2 + h2, cy: 1.5 * u2 + l2 + h2, r: h2, fill: i2 })] });
})), ut = function(e2) {
  return e2 * Math.PI / 180;
}, mt = { spacing: 5, rotation: 0, background: "#000000", color: "#ffffff", lineWidth: 2 }, vt = reactExports.memo((function(e2) {
  var r2 = e2.id, t2 = e2.spacing, n2 = void 0 === t2 ? mt.spacing : t2, o2 = e2.rotation, i2 = void 0 === o2 ? mt.rotation : o2, a2 = e2.background, l2 = void 0 === a2 ? mt.background : a2, d2 = e2.color, u2 = void 0 === d2 ? mt.color : d2, c2 = e2.lineWidth, s2 = void 0 === c2 ? mt.lineWidth : c2, f = Math.round(i2) % 360, h2 = Math.abs(n2);
  f > 180 ? f -= 360 : f > 90 ? f -= 180 : f < -180 ? f += 360 : f < -90 && (f += 180);
  var p2, g2 = h2, b2 = h2;
  return 0 === f ? p2 = "\n                M 0 0 L " + g2 + " 0\n                M 0 " + b2 + " L " + g2 + " " + b2 + "\n            " : 90 === f ? p2 = "\n                M 0 0 L 0 " + b2 + "\n                M " + g2 + " 0 L " + g2 + " " + b2 + "\n            " : (g2 = Math.abs(h2 / Math.sin(ut(f))), b2 = h2 / Math.sin(ut(90 - f)), p2 = f > 0 ? "\n                    M 0 " + -b2 + " L " + 2 * g2 + " " + b2 + "\n                    M " + -g2 + " " + -b2 + " L " + g2 + " " + b2 + "\n                    M " + -g2 + " 0 L " + g2 + " " + 2 * b2 + "\n                " : "\n                    M " + -g2 + " " + b2 + " L " + g2 + " " + -b2 + "\n                    M " + -g2 + " " + 2 * b2 + " L " + 2 * g2 + " " + -b2 + "\n                    M 0 " + 2 * b2 + " L " + 2 * g2 + " 0\n                "), jsxRuntimeExports.jsxs("pattern", { id: r2, width: g2, height: b2, patternUnits: "userSpaceOnUse", children: [jsxRuntimeExports.jsx("rect", { width: g2, height: b2, fill: l2, stroke: "rgba(255, 0, 0, 0.1)", strokeWidth: 0 }), jsxRuntimeExports.jsx("path", { d: p2, strokeWidth: s2, stroke: u2, strokeLinecap: "square" })] });
})), _t = { color: "#000000", background: "#ffffff", size: 4, padding: 4, stagger: false }, wt = reactExports.memo((function(e2) {
  var r2 = e2.id, t2 = e2.color, n2 = void 0 === t2 ? _t.color : t2, o2 = e2.background, i2 = void 0 === o2 ? _t.background : o2, a2 = e2.size, l2 = void 0 === a2 ? _t.size : a2, d2 = e2.padding, u2 = void 0 === d2 ? _t.padding : d2, c2 = e2.stagger, s2 = void 0 === c2 ? _t.stagger : c2, f = l2 + u2, h2 = u2 / 2;
  return true === s2 && (f = 2 * l2 + 2 * u2), jsxRuntimeExports.jsxs("pattern", { id: r2, width: f, height: f, patternUnits: "userSpaceOnUse", children: [jsxRuntimeExports.jsx("rect", { width: f, height: f, fill: i2 }), jsxRuntimeExports.jsx("rect", { x: h2, y: h2, width: l2, height: l2, fill: n2 }), s2 && jsxRuntimeExports.jsx("rect", { x: 1.5 * u2 + l2, y: 1.5 * u2 + l2, width: l2, height: l2, fill: n2 })] });
})), xt = { patternDots: at, patternLines: vt, patternSquares: wt }, Ot = ["type"], zt = Vr({}, ot, xt), Mt = reactExports.memo((function(e2) {
  var r2 = e2.defs;
  return !r2 || r2.length < 1 ? null : jsxRuntimeExports.jsx("defs", { "aria-hidden": true, children: r2.map((function(e3) {
    var r3 = e3.type, t2 = Zr(e3, Ot);
    return zt[r3] ? reactExports.createElement(zt[r3], Vr({ key: t2.id }, t2)) : null;
  })) });
})), Rt = reactExports.forwardRef((function(e2, r2) {
  var t2 = e2.width, n2 = e2.height, o2 = e2.margin, i2 = e2.defs, a2 = e2.children, l2 = e2.role, d2 = e2.ariaLabel, u2 = e2.ariaLabelledBy, c2 = e2.ariaDescribedBy, s2 = e2.isFocusable, f = M$2();
  return jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: t2, height: n2, role: l2, "aria-label": d2, "aria-labelledby": u2, "aria-describedby": c2, focusable: s2, tabIndex: s2 ? 0 : void 0, ref: r2, children: [jsxRuntimeExports.jsx(Mt, { defs: i2 }), jsxRuntimeExports.jsx("rect", { width: t2, height: n2, fill: f.background }), jsxRuntimeExports.jsx("g", { transform: "translate(" + o2.left + "," + o2.top + ")", children: a2 })] });
})), jt = reactExports.memo((function(e2) {
  var r2 = e2.size, t2 = e2.color, n2 = e2.borderWidth, o2 = e2.borderColor;
  return jsxRuntimeExports.jsx("circle", { r: r2 / 2, fill: t2, stroke: o2, strokeWidth: n2, style: { pointerEvents: "none" } });
}));
reactExports.memo((function(e2) {
  var r2 = e2.x, t2 = e2.y, n2 = e2.symbol, o2 = void 0 === n2 ? jt : n2, a2 = e2.size, l2 = e2.datum, u2 = e2.color, c2 = e2.borderWidth, s2 = e2.borderColor, f = e2.label, h2 = e2.labelTextAnchor, p2 = void 0 === h2 ? "middle" : h2, g2 = e2.labelYOffset, b2 = void 0 === g2 ? -12 : g2, m2 = e2.ariaLabel, _2 = e2.ariaLabelledBy, w2 = e2.ariaDescribedBy, O2 = e2.ariaHidden, R = e2.ariaDisabled, j2 = e2.isFocusable, C2 = void 0 !== j2 && j2, B2 = e2.tabIndex, P2 = void 0 === B2 ? 0 : B2, W2 = e2.onFocus, G2 = e2.onBlur, I2 = e2.testId, A5 = M$2(), L2 = Dr(), S2 = L2.animate, Y3 = L2.config, q2 = useSpring({ transform: "translate(" + r2 + ", " + t2 + ")", config: Y3, immediate: !S2 }), D2 = reactExports.useCallback((function(e3) {
    null == W2 || W2(l2, e3);
  }), [W2, l2]), E2 = reactExports.useCallback((function(e3) {
    null == G2 || G2(l2, e3);
  }), [G2, l2]);
  return jsxRuntimeExports.jsxs(animated.g, { transform: q2.transform, style: { pointerEvents: "none" }, focusable: C2, tabIndex: C2 ? P2 : void 0, "aria-label": m2, "aria-labelledby": _2, "aria-describedby": w2, "aria-disabled": R, "aria-hidden": O2, onFocus: C2 && W2 ? D2 : void 0, onBlur: C2 && G2 ? E2 : void 0, "data-testid": I2, children: [reactExports.createElement(o2, { size: a2, color: u2, datum: l2, borderWidth: c2, borderColor: s2 }), f && jsxRuntimeExports.jsx("text", { textAnchor: p2, y: b2, style: b$3(A5.dots.text), children: f })] });
}));
var Bt = reactExports.memo((function(e2) {
  var r2 = e2.width, t2 = e2.height, n2 = e2.axis, o2 = e2.scale, i2 = e2.value, a2 = e2.lineStyle, l2 = e2.textStyle, d2 = e2.legend, u2 = e2.legendNode, c2 = e2.legendPosition, s2 = void 0 === c2 ? "top-right" : c2, f = e2.legendOffsetX, h2 = void 0 === f ? 14 : f, p2 = e2.legendOffsetY, g2 = void 0 === p2 ? 14 : p2, b2 = e2.legendOrientation, m2 = void 0 === b2 ? "horizontal" : b2, y2 = M$2(), _2 = 0, w2 = 0, k2 = 0, x2 = 0;
  if ("y" === n2 ? (k2 = o2(i2), w2 = r2) : (_2 = o2(i2), x2 = t2), d2 && !u2) {
    var O2 = (function(e3) {
      var r3 = e3.axis, t3 = e3.width, n3 = e3.height, o3 = e3.position, i3 = e3.offsetX, a3 = e3.offsetY, l3 = e3.orientation, d3 = 0, u3 = 0, c3 = "vertical" === l3 ? -90 : 0, s3 = "start";
      if ("x" === r3) switch (o3) {
        case "top-left":
          d3 = -i3, u3 = a3, s3 = "end";
          break;
        case "top":
          u3 = -a3, s3 = "horizontal" === l3 ? "middle" : "start";
          break;
        case "top-right":
          d3 = i3, u3 = a3, s3 = "horizontal" === l3 ? "start" : "end";
          break;
        case "right":
          d3 = i3, u3 = n3 / 2, s3 = "horizontal" === l3 ? "start" : "middle";
          break;
        case "bottom-right":
          d3 = i3, u3 = n3 - a3, s3 = "start";
          break;
        case "bottom":
          u3 = n3 + a3, s3 = "horizontal" === l3 ? "middle" : "end";
          break;
        case "bottom-left":
          u3 = n3 - a3, d3 = -i3, s3 = "horizontal" === l3 ? "end" : "start";
          break;
        case "left":
          d3 = -i3, u3 = n3 / 2, s3 = "horizontal" === l3 ? "end" : "middle";
      }
      else switch (o3) {
        case "top-left":
          d3 = i3, u3 = -a3, s3 = "start";
          break;
        case "top":
          d3 = t3 / 2, u3 = -a3, s3 = "horizontal" === l3 ? "middle" : "start";
          break;
        case "top-right":
          d3 = t3 - i3, u3 = -a3, s3 = "horizontal" === l3 ? "end" : "start";
          break;
        case "right":
          d3 = t3 + i3, s3 = "horizontal" === l3 ? "start" : "middle";
          break;
        case "bottom-right":
          d3 = t3 - i3, u3 = a3, s3 = "end";
          break;
        case "bottom":
          d3 = t3 / 2, u3 = a3, s3 = "horizontal" === l3 ? "middle" : "end";
          break;
        case "bottom-left":
          d3 = i3, u3 = a3, s3 = "horizontal" === l3 ? "start" : "end";
          break;
        case "left":
          d3 = -i3, s3 = "horizontal" === l3 ? "end" : "middle";
      }
      return { x: d3, y: u3, rotation: c3, textAnchor: s3 };
    })({ axis: n2, width: r2, height: t2, position: s2, offsetX: h2, offsetY: g2, orientation: m2 });
    u2 = jsxRuntimeExports.jsx("text", { transform: "translate(" + O2.x + ", " + O2.y + ") rotate(" + O2.rotation + ")", textAnchor: O2.textAnchor, dominantBaseline: "central", style: l2, children: d2 });
  }
  return jsxRuntimeExports.jsxs("g", { transform: "translate(" + _2 + ", " + k2 + ")", children: [jsxRuntimeExports.jsx("line", { x1: 0, x2: w2, y1: 0, y2: x2, stroke: y2.markers.lineColor, strokeWidth: y2.markers.lineStrokeWidth, style: a2 }), u2] });
}));
reactExports.memo((function(e2) {
  var r2 = e2.markers, t2 = e2.width, n2 = e2.height, o2 = e2.xScale, i2 = e2.yScale;
  return r2 && 0 !== r2.length ? r2.map((function(e3, r3) {
    return jsxRuntimeExports.jsx(Bt, Vr({}, e3, { width: t2, height: n2, scale: "y" === e3.axis ? i2 : o2 }), r3);
  })) : null;
}));
var It = function(e2) {
  var t2 = Dr(), n2 = t2.animate, i2 = t2.config, l2 = (function(e3) {
    var r2 = reactExports.useRef();
    return reactExports.useEffect((function() {
      r2.current = e3;
    }), [e3]), r2.current;
  })(e2), d2 = reactExports.useMemo((function() {
    return interpolateString(l2, e2);
  }), [l2, e2]), u2 = useSpring({ from: { value: 0 }, to: { value: 1 }, reset: true, config: i2, immediate: !n2 }).value;
  return to(u2, d2);
};
reactExports.createContext(void 0);
var Lt = { basis: W$3, basisClosed: G$1, basisOpen: I, bundle: A$4, cardinal: L$2, cardinalClosed: S$2, cardinalOpen: Y$2, catmullRom: q$1, catmullRomClosed: D$1, catmullRomOpen: E$4, linear: U$1, linearClosed: F$1, monotoneX, monotoneY, natural: X$2, step: K$2, stepAfter, stepBefore }, St = Object.keys(Lt);
St.filter((function(e2) {
  return e2.endsWith("Closed");
}));
P(St, "bundle", "basisClosed", "basisOpen", "cardinalClosed", "cardinalOpen", "catmullRomClosed", "catmullRomOpen", "linearClosed");
P(St, "bundle", "basisClosed", "basisOpen", "cardinalClosed", "cardinalOpen", "catmullRomClosed", "catmullRomOpen", "linearClosed");
({ BrBG: Rr(scheme$q), PRGn: Rr(scheme$p), PiYG: Rr(scheme$o), PuOr: Rr(scheme$n), RdBu: Rr(scheme$m), RdGy: Rr(scheme$l), RdYlBu: Rr(scheme$k), RdYlGn: Rr(scheme$j), spectral: Rr(scheme$i), blues: Rr(scheme$5), greens: Rr(scheme$4), greys: Rr(scheme$3), oranges: Rr(scheme), purples: Rr(scheme$2), reds: Rr(scheme$1), BuGn: Rr(scheme$h), BuPu: Rr(scheme$g), GnBu: Rr(scheme$f), OrRd: Rr(scheme$e), PuBuGn: Rr(scheme$d), PuBu: Rr(scheme$c), PuRd: Rr(scheme$b), RdPu: Rr(scheme$a), YlGnBu: Rr(scheme$9), YlGn: Rr(scheme$8), YlOrBr: Rr(scheme$7), YlOrRd: Rr(scheme$6) });
({ brown_blueGreen: Rr(scheme$q), purpleRed_green: Rr(scheme$p), pink_yellowGreen: Rr(scheme$o), purple_orange: Rr(scheme$n), red_blue: Rr(scheme$m), red_grey: Rr(scheme$l), red_yellow_blue: Rr(scheme$k), red_yellow_green: Rr(scheme$j), spectral: Rr(scheme$i), blues: Rr(scheme$5), greens: Rr(scheme$4), greys: Rr(scheme$3), oranges: Rr(scheme), purples: Rr(scheme$2), reds: Rr(scheme$1), blue_green: Rr(scheme$h), blue_purple: Rr(scheme$g), green_blue: Rr(scheme$f), orange_red: Rr(scheme$e), purple_blue_green: Rr(scheme$d), purple_blue: Rr(scheme$c), purple_red: Rr(scheme$b), red_purple: Rr(scheme$a), yellow_green_blue: Rr(scheme$9), yellow_green: Rr(scheme$8), yellow_orange_brown: Rr(scheme$7), yellow_orange_red: Rr(scheme$6) });
ordinal(a);
var un = { top: 0, right: 0, bottom: 0, left: 0 }, cn = function(e2, t2, n2) {
  return void 0 === n2 && (n2 = {}), reactExports.useMemo((function() {
    var r2 = Vr({}, un, n2);
    return { margin: r2, innerWidth: e2 - r2.left - r2.right, innerHeight: t2 - r2.top - r2.bottom, outerWidth: e2, outerHeight: t2 };
  }), [e2, t2, n2]);
}, sn = function() {
  var e2 = reactExports.useRef(null), r2 = reactExports.useState({ left: 0, top: 0, width: 0, height: 0 }), t2 = r2[0], n2 = r2[1], i2 = reactExports.useState((function() {
    return "undefined" == typeof ResizeObserver ? null : new ResizeObserver((function(e3) {
      var r3 = e3[0];
      return n2(r3.contentRect);
    }));
  }))[0];
  return reactExports.useEffect((function() {
    return e2.current && null !== i2 && i2.observe(e2.current), function() {
      null !== i2 && i2.disconnect();
    };
  }), [i2]), [e2, t2];
}, fn = function(e2) {
  return "function" == typeof e2 ? e2 : "string" == typeof e2 ? 0 === e2.indexOf("time:") ? timeFormat(e2.slice("5")) : format(e2) : function(e3) {
    return "" + e3;
  };
}, hn = function(e2) {
  return reactExports.useMemo((function() {
    return fn(e2);
  }), [e2]);
}, gn = function(e2) {
  return Cr(e2) ? e2 : function(r2) {
    return ke(r2, e2);
  };
}, bn = function(e2) {
  return reactExports.useMemo((function() {
    return gn(e2);
  }), [e2]);
};
function Se(e2, r2) {
  (null == r2 || r2 > e2.length) && (r2 = e2.length);
  for (var n2 = 0, t2 = Array(r2); n2 < r2; n2++) t2[n2] = e2[n2];
  return t2;
}
function qe(e2, r2) {
  var n2 = "undefined" != typeof Symbol && e2[Symbol.iterator] || e2["@@iterator"];
  if (n2) return (n2 = n2.call(e2)).next.bind(n2);
  if (Array.isArray(e2) || (n2 = (function(e3, r3) {
    if (e3) {
      if ("string" == typeof e3) return Se(e3, r3);
      var n3 = {}.toString.call(e3).slice(8, -1);
      return "Object" === n3 && e3.constructor && (n3 = e3.constructor.name), "Map" === n3 || "Set" === n3 ? Array.from(e3) : "Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3) ? Se(e3, r3) : void 0;
    }
  })(e2)) || r2) {
    n2 && (e2 = n2);
    var t2 = 0;
    return function() {
      return t2 >= e2.length ? { done: true } : { done: false, value: e2[t2++] };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Ce() {
  return Ce = Object.assign ? Object.assign.bind() : function(e2) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var n2 = arguments[r2];
      for (var t2 in n2) ({}).hasOwnProperty.call(n2, t2) && (e2[t2] = n2[t2]);
    }
    return e2;
  }, Ce.apply(null, arguments);
}
var Ge = { nivo: ["#e8c1a0", "#f47560", "#f1e15b", "#e8a838", "#61cdbb", "#97e3d5"], category10: e, accent: r, dark2: n, paired: t, pastel1: o, pastel2: i, set1: u$1, set2: l, set3: a, tableau10: c$2 }, Ve = Object.keys(Ge), Pe = { brown_blueGreen: scheme$q, purpleRed_green: scheme$p, pink_yellowGreen: scheme$o, purple_orange: scheme$n, red_blue: scheme$m, red_grey: scheme$l, red_yellow_blue: scheme$k, red_yellow_green: scheme$j, spectral: scheme$i }, Re = Object.keys(Pe), Ue = { brown_blueGreen: y$1, purpleRed_green: _$1, pink_yellowGreen: w, purple_orange: k$1, red_blue: j$1, red_grey: z$1, red_yellow_blue: A$2, red_yellow_green: E$2, spectral: O$1 }, De = { blues: scheme$5, greens: scheme$4, greys: scheme$3, oranges: scheme, purples: scheme$2, reds: scheme$1, blue_green: scheme$h, blue_purple: scheme$g, green_blue: scheme$f, orange_red: scheme$e, purple_blue_green: scheme$d, purple_blue: scheme$c, purple_red: scheme$b, red_purple: scheme$a, yellow_green_blue: scheme$9, yellow_green: scheme$8, yellow_orange_brown: scheme$7, yellow_orange_red: scheme$6 }, Me = Object.keys(De), Te = { blues: K$1, greens: L, greys: N, oranges: Q$1, purples: W, reds: X$1, turbo: Y$1, viridis: Z$1, inferno, magma, plasma, cividis: te$1, warm, cool, cubehelixDefault: ue, blue_green: le, blue_purple: ae, green_blue: ce, orange_red: se, purple_blue_green: fe, purple_blue: pe, purple_red: de, red_purple: me, yellow_green_blue: ge, yellow_green: he, yellow_orange_brown: be, yellow_orange_red: ve }, $e = Ce({}, Ge, Pe, De), Fe = function(e2) {
  return Ve.includes(e2);
}, He = function(e2) {
  return Re.includes(e2);
}, Je = function(e2) {
  return Me.includes(e2);
}, Ke = { rainbow: ye, sinebow: _e };
Ce({}, Ue, Te, Ke);
var Qe = function(e2) {
  return void 0 !== e2.theme;
}, We = function(e2) {
  return void 0 !== e2.from;
}, Xe = function(e2, r2) {
  if ("function" == typeof e2) return e2;
  if (je(e2)) {
    if (Qe(e2)) {
      if (void 0 === r2) throw new Error("Unable to use color from theme as no theme was provided");
      var n2 = ke(r2, e2.theme);
      if (void 0 === n2) throw new Error("Color from theme is undefined at path: '" + e2.theme + "'");
      return function() {
        return n2;
      };
    }
    if (We(e2)) {
      var t2 = function(r3) {
        return ke(r3, e2.from);
      };
      if (Array.isArray(e2.modifiers)) {
        for (var o2, i2 = [], u2 = function() {
          var e3 = o2.value, r3 = e3[0], n3 = e3[1];
          if ("brighter" === r3) i2.push((function(e4) {
            return e4.brighter(n3);
          }));
          else if ("darker" === r3) i2.push((function(e4) {
            return e4.darker(n3);
          }));
          else {
            if ("opacity" !== r3) throw new Error("Invalid color modifier: '" + r3 + "', must be one of: 'brighter', 'darker', 'opacity'");
            i2.push((function(e4) {
              return e4.opacity = n3, e4;
            }));
          }
        }, l2 = qe(e2.modifiers); !(o2 = l2()).done; ) u2();
        return 0 === i2.length ? t2 : function(e3) {
          return i2.reduce((function(e4, r3) {
            return r3(e4);
          }), rgb$1(t2(e3))).toString();
        };
      }
      return t2;
    }
    throw new Error("Invalid color spec, you should either specify 'theme' or 'from' when using a config object");
  }
  return function() {
    return e2;
  };
}, Ye = function(e2, r2) {
  return reactExports.useMemo((function() {
    return Xe(e2, r2);
  }), [e2, r2]);
}, gr = function(e2, r2) {
  if ("function" == typeof e2) return e2;
  var n2 = function(e3) {
    return ke(e3, r2);
  };
  if (Array.isArray(e2)) {
    var t2 = ordinal(e2), o2 = function(e3) {
      return t2(n2(e3));
    };
    return o2.scale = t2, o2;
  }
  if (je(e2)) {
    if ((function(e3) {
      return void 0 !== e3.datum;
    })(e2)) return function(r3) {
      return ke(r3, e2.datum);
    };
    if ((function(e3) {
      return void 0 !== e3.scheme;
    })(e2)) {
      if (Fe(e2.scheme)) {
        var i2 = ordinal($e[e2.scheme]), u2 = function(e3) {
          return i2(n2(e3));
        };
        return u2.scale = i2, u2;
      }
      if (He(e2.scheme)) {
        if (void 0 !== e2.size && (e2.size < 3 || e2.size > 11)) throw new Error("Invalid size '" + e2.size + "' for diverging color scheme '" + e2.scheme + "', must be between 3~11");
        var l2 = ordinal($e[e2.scheme][e2.size || 11]), a2 = function(e3) {
          return l2(n2(e3));
        };
        return a2.scale = l2, a2;
      }
      if (Je(e2.scheme)) {
        if (void 0 !== e2.size && (e2.size < 3 || e2.size > 9)) throw new Error("Invalid size '" + e2.size + "' for sequential color scheme '" + e2.scheme + "', must be between 3~9");
        var c2 = ordinal($e[e2.scheme][e2.size || 9]), s2 = function(e3) {
          return c2(n2(e3));
        };
        return s2.scale = c2, s2;
      }
    }
    throw new Error("Invalid colors, when using an object, you should either pass a 'datum' or a 'scheme' property");
  }
  return function() {
    return e2;
  };
}, hr = function(e2, r2) {
  return reactExports.useMemo((function() {
    return gr(e2, r2);
  }), [e2, r2]);
};
function p$1() {
  return p$1 = Object.assign ? Object.assign.bind() : function(t2) {
    for (var e2 = 1; e2 < arguments.length; e2++) {
      var o2 = arguments[e2];
      for (var n2 in o2) ({}).hasOwnProperty.call(o2, n2) && (t2[n2] = o2[n2]);
    }
    return t2;
  }, p$1.apply(null, arguments);
}
function s(t2, e2) {
  if (null == t2) return {};
  var o2 = {};
  for (var n2 in t2) if ({}.hasOwnProperty.call(t2, n2)) {
    if (-1 !== e2.indexOf(n2)) continue;
    o2[n2] = t2[n2];
  }
  return o2;
}
var h = ["style", "children"], m = ["outlineWidth", "outlineColor", "outlineOpacity"], b$1 = function(r2) {
  var i2 = r2.style, l2 = r2.children, c2 = s(r2, h), f = i2.outlineWidth, u2 = i2.outlineColor, a2 = i2.outlineOpacity, d2 = s(i2, m);
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [f > 0 && jsxRuntimeExports.jsx(animated.text, p$1({}, c2, { style: p$1({}, d2, { strokeWidth: 2 * f, stroke: u2, strokeOpacity: a2, strokeLinejoin: "round" }), children: l2 })), jsxRuntimeExports.jsx(animated.text, p$1({}, c2, { style: d2, children: l2 }))] });
};
var v = function(e2) {
  var i2 = e2.x, n2 = e2.y, o2 = e2.size, r2 = e2.fill, l2 = e2.opacity, a2 = void 0 === l2 ? 1 : l2, c2 = e2.borderWidth, s2 = void 0 === c2 ? 0 : c2, d2 = e2.borderColor;
  return jsxRuntimeExports.jsx("circle", { r: o2 / 2, cx: i2 + o2 / 2, cy: n2 + o2 / 2, fill: r2, opacity: a2, strokeWidth: s2, stroke: void 0 === d2 ? "transparent" : d2, style: { pointerEvents: "none" } });
}, u = function(e2) {
  var i2 = e2.x, n2 = e2.y, o2 = e2.size, r2 = e2.fill, l2 = e2.opacity, a2 = void 0 === l2 ? 1 : l2, c2 = e2.borderWidth, s2 = void 0 === c2 ? 0 : c2, d2 = e2.borderColor;
  return jsxRuntimeExports.jsx("g", { transform: "translate(" + i2 + "," + n2 + ")", children: jsxRuntimeExports.jsx("path", { d: "\n                    M" + o2 / 2 + " 0\n                    L" + 0.8 * o2 + " " + o2 / 2 + "\n                    L" + o2 / 2 + " " + o2 + "\n                    L" + 0.2 * o2 + " " + o2 / 2 + "\n                    L" + o2 / 2 + " 0\n                ", fill: r2, opacity: a2, strokeWidth: s2, stroke: void 0 === d2 ? "transparent" : d2, style: { pointerEvents: "none" } }) });
}, p = function(e2) {
  var i2 = e2.x, n2 = e2.y, o2 = e2.size, r2 = e2.fill, l2 = e2.opacity, a2 = void 0 === l2 ? 1 : l2, c2 = e2.borderWidth, s2 = void 0 === c2 ? 0 : c2, d2 = e2.borderColor;
  return jsxRuntimeExports.jsx("rect", { x: i2, y: n2, fill: r2, opacity: a2, strokeWidth: s2, stroke: void 0 === d2 ? "transparent" : d2, width: o2, height: o2, style: { pointerEvents: "none" } });
}, y = function(e2) {
  var i2 = e2.x, n2 = e2.y, o2 = e2.size, r2 = e2.fill, l2 = e2.opacity, a2 = void 0 === l2 ? 1 : l2, c2 = e2.borderWidth, s2 = void 0 === c2 ? 0 : c2, d2 = e2.borderColor;
  return jsxRuntimeExports.jsx("g", { transform: "translate(" + i2 + "," + n2 + ")", children: jsxRuntimeExports.jsx("path", { d: "\n                M" + o2 / 2 + " 0\n                L" + o2 + " " + o2 + "\n                L0 " + o2 + "\n                L" + o2 / 2 + " 0\n            ", fill: r2, opacity: a2, strokeWidth: s2, stroke: void 0 === d2 ? "transparent" : d2, style: { pointerEvents: "none" } }) });
};
function b() {
  return b = Object.assign ? Object.assign.bind() : function(t2) {
    for (var e2 = 1; e2 < arguments.length; e2++) {
      var i2 = arguments[e2];
      for (var n2 in i2) ({}).hasOwnProperty.call(i2, n2) && (t2[n2] = i2[n2]);
    }
    return t2;
  }, b.apply(null, arguments);
}
var k = { translateX: 0, translateY: 0, padding: 0, itemsSpacing: 0, itemDirection: "left-to-right", justify: false, symbolShape: "square", symbolSize: 16, symbolSpacing: 8 }, S = { top: 0, right: 0, bottom: 0, left: 0 }, A$1 = function(t2) {
  var e2, i2 = t2.direction, n2 = t2.itemsSpacing, o2 = t2.padding, r2 = t2.itemCount, l2 = t2.itemWidth, a2 = t2.itemHeight;
  if ("number" != typeof o2 && ("object" != typeof (e2 = o2) || Array.isArray(e2) || null === e2)) throw new Error("Invalid property padding, must be one of: number, object");
  var c2 = "number" == typeof o2 ? { top: o2, right: o2, bottom: o2, left: o2 } : b({}, S, o2), s2 = c2.left + c2.right, d2 = c2.top + c2.bottom, h2 = l2 + s2, g2 = a2 + d2, m2 = (r2 - 1) * n2;
  return "row" === i2 ? h2 = l2 * r2 + m2 + s2 : "column" === i2 && (g2 = a2 * r2 + m2 + d2), { width: h2, height: g2, padding: c2 };
}, C = function(t2) {
  var e2 = t2.anchor, i2 = t2.translateX, n2 = t2.translateY, o2 = t2.containerWidth, r2 = t2.containerHeight, l2 = t2.width, a2 = t2.height, c2 = i2, s2 = n2;
  switch (e2) {
    case "top":
      c2 += (o2 - l2) / 2;
      break;
    case "top-right":
      c2 += o2 - l2;
      break;
    case "right":
      c2 += o2 - l2, s2 += (r2 - a2) / 2;
      break;
    case "bottom-right":
      c2 += o2 - l2, s2 += r2 - a2;
      break;
    case "bottom":
      c2 += (o2 - l2) / 2, s2 += r2 - a2;
      break;
    case "bottom-left":
      s2 += r2 - a2;
      break;
    case "left":
      s2 += (r2 - a2) / 2;
      break;
    case "center":
      c2 += (o2 - l2) / 2, s2 += (r2 - a2) / 2;
  }
  return { x: c2, y: s2 };
}, z = function(t2) {
  var e2, i2, n2, o2, r2, l2, a2 = t2.direction, c2 = t2.justify, s2 = t2.symbolSize, d2 = t2.symbolSpacing, h2 = t2.width, g2 = t2.height;
  switch (a2) {
    case "left-to-right":
      e2 = 0, i2 = (g2 - s2) / 2, o2 = g2 / 2, l2 = "central", c2 ? (n2 = h2, r2 = "end") : (n2 = s2 + d2, r2 = "start");
      break;
    case "right-to-left":
      e2 = h2 - s2, i2 = (g2 - s2) / 2, o2 = g2 / 2, l2 = "central", c2 ? (n2 = 0, r2 = "start") : (n2 = h2 - s2 - d2, r2 = "end");
      break;
    case "top-to-bottom":
      e2 = (h2 - s2) / 2, i2 = 0, n2 = h2 / 2, r2 = "middle", c2 ? (o2 = g2, l2 = "alphabetic") : (o2 = s2 + d2, l2 = "text-before-edge");
      break;
    case "bottom-to-top":
      e2 = (h2 - s2) / 2, i2 = g2 - s2, n2 = h2 / 2, r2 = "middle", c2 ? (o2 = 0, l2 = "text-before-edge") : (o2 = g2 - s2 - d2, l2 = "alphabetic");
  }
  return { symbolX: e2, symbolY: i2, labelX: n2, labelY: o2, labelAnchor: r2, labelAlignment: l2 };
}, O = { circle: v, diamond: u, square: p, triangle: y }, B = function(i2) {
  var n2, o2, r2, a2, d2, m2, f, v2, u2, p2, y2, x2 = i2.x, S2 = i2.y, A5 = i2.width, C2 = i2.height, W2 = i2.data, w2 = i2.direction, X3 = void 0 === w2 ? k.itemDirection : w2, Y3 = i2.justify, B2 = void 0 === Y3 ? k.justify : Y3, H2 = i2.textColor, E2 = i2.background, j2 = void 0 === E2 ? "transparent" : E2, L2 = i2.opacity, M2 = void 0 === L2 ? 1 : L2, P2 = i2.symbolShape, F2 = void 0 === P2 ? k.symbolShape : P2, T2 = i2.symbolSize, V2 = void 0 === T2 ? k.symbolSize : T2, D2 = i2.symbolSpacing, R = void 0 === D2 ? k.symbolSpacing : D2, q2 = i2.symbolBorderWidth, G2 = void 0 === q2 ? 0 : q2, I2 = i2.symbolBorderColor, _2 = void 0 === I2 ? "transparent" : I2, J2 = i2.onClick, K2 = i2.onMouseEnter, N2 = i2.onMouseLeave, Q2 = i2.toggleSerie, U2 = i2.effects, Z3 = reactExports.useState({}), $2 = Z3[0], tt2 = Z3[1], et = M$2(), it2 = reactExports.useCallback((function(t2) {
    if (U2) {
      var e2 = U2.filter((function(t3) {
        return "hover" === t3.on;
      })).reduce((function(t3, e3) {
        return b({}, t3, e3.style);
      }), {});
      tt2(e2);
    }
    null == K2 || K2(W2, t2);
  }), [K2, W2, U2]), nt = reactExports.useCallback((function(t2) {
    if (U2) {
      var e2 = U2.filter((function(t3) {
        return "hover" !== t3.on;
      })).reduce((function(t3, e3) {
        return b({}, t3, e3.style);
      }), {});
      tt2(e2);
    }
    null == N2 || N2(W2, t2);
  }), [N2, W2, U2]), ot2 = z({ direction: X3, justify: B2, symbolSize: null != (n2 = $2.symbolSize) ? n2 : V2, symbolSpacing: R, width: A5, height: C2 }), rt2 = ot2.symbolX, lt = ot2.symbolY, at2 = ot2.labelX, ct = ot2.labelY, st = ot2.labelAnchor, dt = ot2.labelAlignment, ht = [J2, K2, N2, Q2].some((function(t2) {
    return void 0 !== t2;
  })), gt = "function" == typeof F2 ? F2 : O[F2];
  return jsxRuntimeExports.jsxs("g", { transform: "translate(" + x2 + "," + S2 + ")", style: { opacity: null != (o2 = $2.itemOpacity) ? o2 : M2 }, children: [jsxRuntimeExports.jsx("rect", { width: A5, height: C2, fill: null != (r2 = $2.itemBackground) ? r2 : j2, style: { cursor: ht ? "pointer" : "auto" }, onClick: function(t2) {
    null == J2 || J2(W2, t2), null == Q2 || Q2(W2.id);
  }, onMouseEnter: it2, onMouseLeave: nt }), reactExports.createElement(gt, b({ id: W2.id, x: rt2, y: lt, size: null != (a2 = $2.symbolSize) ? a2 : V2, fill: null != (d2 = null != (m2 = W2.fill) ? m2 : W2.color) ? d2 : "black", borderWidth: null != (f = $2.symbolBorderWidth) ? f : G2, borderColor: null != (v2 = $2.symbolBorderColor) ? v2 : _2 }, W2.hidden ? et.legends.hidden.symbol : void 0)), jsxRuntimeExports.jsx(b$1, { textAnchor: st, style: b({}, et.legends.text, { fill: null != (u2 = null != (p2 = null != (y2 = $2.itemTextColor) ? y2 : H2) ? p2 : et.legends.text.fill) ? u2 : "black", dominantBaseline: dt, pointerEvents: "none", userSelect: "none" }, W2.hidden ? et.legends.hidden.text : void 0), x: at2, y: ct, children: W2.label })] });
}, H = function(e2) {
  var i2 = e2.data, n2 = e2.x, o2 = e2.y, r2 = e2.direction, l2 = e2.padding, a2 = void 0 === l2 ? k.padding : l2, c2 = e2.justify, s2 = e2.effects, d2 = e2.itemWidth, h2 = e2.itemHeight, g2 = e2.itemDirection, m2 = void 0 === g2 ? k.itemDirection : g2, f = e2.itemsSpacing, v2 = void 0 === f ? k.itemsSpacing : f, u2 = e2.itemTextColor, p2 = e2.itemBackground, y2 = void 0 === p2 ? "transparent" : p2, b2 = e2.itemOpacity, x2 = void 0 === b2 ? 1 : b2, S2 = e2.symbolShape, C2 = e2.symbolSize, z2 = e2.symbolSpacing, W2 = e2.symbolBorderWidth, w2 = e2.symbolBorderColor, X3 = e2.onClick, Y3 = e2.onMouseEnter, O2 = e2.onMouseLeave, H2 = e2.toggleSerie, E2 = A$1({ itemCount: i2.length, itemWidth: d2, itemHeight: h2, itemsSpacing: v2, direction: r2, padding: a2 }).padding, j2 = "row" === r2 ? d2 + v2 : 0, L2 = "column" === r2 ? h2 + v2 : 0;
  return jsxRuntimeExports.jsx("g", { transform: "translate(" + n2 + "," + o2 + ")", children: i2.map((function(e3, i3) {
    return jsxRuntimeExports.jsx(B, { data: e3, x: i3 * j2 + E2.left, y: i3 * L2 + E2.top, width: d2, height: h2, direction: m2, justify: c2, effects: s2, textColor: u2, background: y2, opacity: x2, symbolShape: S2, symbolSize: C2, symbolSpacing: z2, symbolBorderWidth: W2, symbolBorderColor: w2, onClick: X3, onMouseEnter: Y3, onMouseLeave: O2, toggleSerie: H2 }, i3);
  })) });
}, E$1 = function(e2) {
  var i2 = e2.data, n2 = e2.containerWidth, o2 = e2.containerHeight, r2 = e2.translateX, l2 = void 0 === r2 ? k.translateX : r2, a2 = e2.translateY, c2 = void 0 === a2 ? k.translateY : a2, s2 = e2.anchor, d2 = e2.direction, h2 = e2.padding, g2 = void 0 === h2 ? k.padding : h2, m2 = e2.justify, f = e2.itemsSpacing, v2 = void 0 === f ? k.itemsSpacing : f, u2 = e2.itemWidth, p2 = e2.itemHeight, y2 = e2.itemDirection, b2 = e2.itemTextColor, x2 = e2.itemBackground, S2 = e2.itemOpacity, z2 = e2.symbolShape, W2 = e2.symbolSize, w2 = e2.symbolSpacing, X3 = e2.symbolBorderWidth, Y3 = e2.symbolBorderColor, O2 = e2.onClick, B2 = e2.onMouseEnter, E2 = e2.onMouseLeave, j2 = e2.toggleSerie, L2 = e2.effects, M2 = A$1({ itemCount: i2.length, itemsSpacing: v2, itemWidth: u2, itemHeight: p2, direction: d2, padding: g2 }), P2 = M2.width, F2 = M2.height, T2 = C({ anchor: s2, translateX: l2, translateY: c2, containerWidth: n2, containerHeight: o2, width: P2, height: F2 }), V2 = T2.x, D2 = T2.y;
  return jsxRuntimeExports.jsx(H, { data: i2, x: V2, y: D2, direction: d2, padding: g2, justify: m2, effects: L2, itemsSpacing: v2, itemWidth: u2, itemHeight: p2, itemDirection: y2, itemTextColor: b2, itemBackground: x2, itemOpacity: S2, symbolShape: z2, symbolSize: W2, symbolSpacing: w2, symbolBorderWidth: X3, symbolBorderColor: Y3, onClick: O2, onMouseEnter: B2, onMouseLeave: E2, toggleSerie: "boolean" == typeof j2 ? void 0 : j2 });
};
var _arrayEach;
var hasRequired_arrayEach;
function require_arrayEach() {
  if (hasRequired_arrayEach) return _arrayEach;
  hasRequired_arrayEach = 1;
  function arrayEach(array, iteratee) {
    var index2 = -1, length2 = array == null ? 0 : array.length;
    while (++index2 < length2) {
      if (iteratee(array[index2], index2, array) === false) {
        break;
      }
    }
    return array;
  }
  _arrayEach = arrayEach;
  return _arrayEach;
}
var _baseAssign;
var hasRequired_baseAssign;
function require_baseAssign() {
  if (hasRequired_baseAssign) return _baseAssign;
  hasRequired_baseAssign = 1;
  var copyObject = require_copyObject(), keys = requireKeys();
  function baseAssign(object2, source) {
    return object2 && copyObject(source, keys(source), object2);
  }
  _baseAssign = baseAssign;
  return _baseAssign;
}
var _baseAssignIn;
var hasRequired_baseAssignIn;
function require_baseAssignIn() {
  if (hasRequired_baseAssignIn) return _baseAssignIn;
  hasRequired_baseAssignIn = 1;
  var copyObject = require_copyObject(), keysIn = requireKeysIn();
  function baseAssignIn(object2, source) {
    return object2 && copyObject(source, keysIn(source), object2);
  }
  _baseAssignIn = baseAssignIn;
  return _baseAssignIn;
}
var _copySymbols;
var hasRequired_copySymbols;
function require_copySymbols() {
  if (hasRequired_copySymbols) return _copySymbols;
  hasRequired_copySymbols = 1;
  var copyObject = require_copyObject(), getSymbols = require_getSymbols();
  function copySymbols(source, object2) {
    return copyObject(source, getSymbols(source), object2);
  }
  _copySymbols = copySymbols;
  return _copySymbols;
}
var _getSymbolsIn;
var hasRequired_getSymbolsIn;
function require_getSymbolsIn() {
  if (hasRequired_getSymbolsIn) return _getSymbolsIn;
  hasRequired_getSymbolsIn = 1;
  var arrayPush = require_arrayPush(), getPrototype = require_getPrototype(), getSymbols = require_getSymbols(), stubArray = requireStubArray();
  var nativeGetSymbols = Object.getOwnPropertySymbols;
  var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object2) {
    var result = [];
    while (object2) {
      arrayPush(result, getSymbols(object2));
      object2 = getPrototype(object2);
    }
    return result;
  };
  _getSymbolsIn = getSymbolsIn;
  return _getSymbolsIn;
}
var _copySymbolsIn;
var hasRequired_copySymbolsIn;
function require_copySymbolsIn() {
  if (hasRequired_copySymbolsIn) return _copySymbolsIn;
  hasRequired_copySymbolsIn = 1;
  var copyObject = require_copyObject(), getSymbolsIn = require_getSymbolsIn();
  function copySymbolsIn(source, object2) {
    return copyObject(source, getSymbolsIn(source), object2);
  }
  _copySymbolsIn = copySymbolsIn;
  return _copySymbolsIn;
}
var _getAllKeysIn;
var hasRequired_getAllKeysIn;
function require_getAllKeysIn() {
  if (hasRequired_getAllKeysIn) return _getAllKeysIn;
  hasRequired_getAllKeysIn = 1;
  var baseGetAllKeys = require_baseGetAllKeys(), getSymbolsIn = require_getSymbolsIn(), keysIn = requireKeysIn();
  function getAllKeysIn(object2) {
    return baseGetAllKeys(object2, keysIn, getSymbolsIn);
  }
  _getAllKeysIn = getAllKeysIn;
  return _getAllKeysIn;
}
var _initCloneArray;
var hasRequired_initCloneArray;
function require_initCloneArray() {
  if (hasRequired_initCloneArray) return _initCloneArray;
  hasRequired_initCloneArray = 1;
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function initCloneArray(array) {
    var length2 = array.length, result = new array.constructor(length2);
    if (length2 && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }
  _initCloneArray = initCloneArray;
  return _initCloneArray;
}
var _cloneDataView;
var hasRequired_cloneDataView;
function require_cloneDataView() {
  if (hasRequired_cloneDataView) return _cloneDataView;
  hasRequired_cloneDataView = 1;
  var cloneArrayBuffer = require_cloneArrayBuffer();
  function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }
  _cloneDataView = cloneDataView;
  return _cloneDataView;
}
var _cloneRegExp;
var hasRequired_cloneRegExp;
function require_cloneRegExp() {
  if (hasRequired_cloneRegExp) return _cloneRegExp;
  hasRequired_cloneRegExp = 1;
  var reFlags = /\w*$/;
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }
  _cloneRegExp = cloneRegExp;
  return _cloneRegExp;
}
var _cloneSymbol;
var hasRequired_cloneSymbol;
function require_cloneSymbol() {
  if (hasRequired_cloneSymbol) return _cloneSymbol;
  hasRequired_cloneSymbol = 1;
  var Symbol2 = require_Symbol();
  var symbolProto = Symbol2 ? Symbol2.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
  function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }
  _cloneSymbol = cloneSymbol;
  return _cloneSymbol;
}
var _initCloneByTag;
var hasRequired_initCloneByTag;
function require_initCloneByTag() {
  if (hasRequired_initCloneByTag) return _initCloneByTag;
  hasRequired_initCloneByTag = 1;
  var cloneArrayBuffer = require_cloneArrayBuffer(), cloneDataView = require_cloneDataView(), cloneRegExp = require_cloneRegExp(), cloneSymbol = require_cloneSymbol(), cloneTypedArray = require_cloneTypedArray();
  var boolTag = "[object Boolean]", dateTag = "[object Date]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
  var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
  function initCloneByTag(object2, tag, isDeep) {
    var Ctor = object2.constructor;
    switch (tag) {
      case arrayBufferTag:
        return cloneArrayBuffer(object2);
      case boolTag:
      case dateTag:
        return new Ctor(+object2);
      case dataViewTag:
        return cloneDataView(object2, isDeep);
      case float32Tag:
      case float64Tag:
      case int8Tag:
      case int16Tag:
      case int32Tag:
      case uint8Tag:
      case uint8ClampedTag:
      case uint16Tag:
      case uint32Tag:
        return cloneTypedArray(object2, isDeep);
      case mapTag:
        return new Ctor();
      case numberTag:
      case stringTag:
        return new Ctor(object2);
      case regexpTag:
        return cloneRegExp(object2);
      case setTag:
        return new Ctor();
      case symbolTag:
        return cloneSymbol(object2);
    }
  }
  _initCloneByTag = initCloneByTag;
  return _initCloneByTag;
}
var _baseIsMap;
var hasRequired_baseIsMap;
function require_baseIsMap() {
  if (hasRequired_baseIsMap) return _baseIsMap;
  hasRequired_baseIsMap = 1;
  var getTag = require_getTag(), isObjectLike = requireIsObjectLike();
  var mapTag = "[object Map]";
  function baseIsMap(value) {
    return isObjectLike(value) && getTag(value) == mapTag;
  }
  _baseIsMap = baseIsMap;
  return _baseIsMap;
}
var isMap_1;
var hasRequiredIsMap;
function requireIsMap() {
  if (hasRequiredIsMap) return isMap_1;
  hasRequiredIsMap = 1;
  var baseIsMap = require_baseIsMap(), baseUnary = require_baseUnary(), nodeUtil = require_nodeUtil();
  var nodeIsMap = nodeUtil && nodeUtil.isMap;
  var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
  isMap_1 = isMap;
  return isMap_1;
}
var _baseIsSet;
var hasRequired_baseIsSet;
function require_baseIsSet() {
  if (hasRequired_baseIsSet) return _baseIsSet;
  hasRequired_baseIsSet = 1;
  var getTag = require_getTag(), isObjectLike = requireIsObjectLike();
  var setTag = "[object Set]";
  function baseIsSet(value) {
    return isObjectLike(value) && getTag(value) == setTag;
  }
  _baseIsSet = baseIsSet;
  return _baseIsSet;
}
var isSet_1;
var hasRequiredIsSet;
function requireIsSet() {
  if (hasRequiredIsSet) return isSet_1;
  hasRequiredIsSet = 1;
  var baseIsSet = require_baseIsSet(), baseUnary = require_baseUnary(), nodeUtil = require_nodeUtil();
  var nodeIsSet = nodeUtil && nodeUtil.isSet;
  var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
  isSet_1 = isSet;
  return isSet_1;
}
var _baseClone;
var hasRequired_baseClone;
function require_baseClone() {
  if (hasRequired_baseClone) return _baseClone;
  hasRequired_baseClone = 1;
  var Stack = require_Stack(), arrayEach = require_arrayEach(), assignValue = require_assignValue(), baseAssign = require_baseAssign(), baseAssignIn = require_baseAssignIn(), cloneBuffer = require_cloneBuffer(), copyArray = require_copyArray(), copySymbols = require_copySymbols(), copySymbolsIn = require_copySymbolsIn(), getAllKeys = require_getAllKeys(), getAllKeysIn = require_getAllKeysIn(), getTag = require_getTag(), initCloneArray = require_initCloneArray(), initCloneByTag = require_initCloneByTag(), initCloneObject = require_initCloneObject(), isArray = requireIsArray(), isBuffer2 = requireIsBuffer(), isMap = requireIsMap(), isObject = requireIsObject(), isSet = requireIsSet(), keys = requireKeys(), keysIn = requireKeysIn();
  var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
  var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
  function baseClone(value, bitmask, customizer, key, object2, stack) {
    var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
    if (customizer) {
      result = object2 ? customizer(value, key, object2, stack) : customizer(value);
    }
    if (result !== void 0) {
      return result;
    }
    if (!isObject(value)) {
      return value;
    }
    var isArr = isArray(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return copyArray(value, result);
      }
    } else {
      var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
      if (isBuffer2(value)) {
        return cloneBuffer(value, isDeep);
      }
      if (tag == objectTag || tag == argsTag || isFunc && !object2) {
        result = isFlat || isFunc ? {} : initCloneObject(value);
        if (!isDeep) {
          return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object2 ? value : {};
        }
        result = initCloneByTag(value, tag, isDeep);
      }
    }
    stack || (stack = new Stack());
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);
    if (isSet(value)) {
      value.forEach(function(subValue) {
        result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
      });
    } else if (isMap(value)) {
      value.forEach(function(subValue, key2) {
        result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
      });
    }
    var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
    var props = isArr ? void 0 : keysFunc(value);
    arrayEach(props || value, function(subValue, key2) {
      if (props) {
        key2 = subValue;
        subValue = value[key2];
      }
      assignValue(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
    });
    return result;
  }
  _baseClone = baseClone;
  return _baseClone;
}
var cloneDeep_1;
var hasRequiredCloneDeep;
function requireCloneDeep() {
  if (hasRequiredCloneDeep) return cloneDeep_1;
  hasRequiredCloneDeep = 1;
  var baseClone = require_baseClone();
  var CLONE_DEEP_FLAG = 1, CLONE_SYMBOLS_FLAG = 4;
  function cloneDeep(value) {
    return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
  }
  cloneDeep_1 = cloneDeep;
  return cloneDeep_1;
}
var cloneDeepExports = requireCloneDeep();
const M = /* @__PURE__ */ getDefaultExportFromCjs(cloneDeepExports);
function E() {
  return E = Object.assign ? Object.assign.bind() : function(e2) {
    for (var o2 = 1; o2 < arguments.length; o2++) {
      var n2 = arguments[o2];
      for (var t2 in n2) ({}).hasOwnProperty.call(n2, t2) && (e2[t2] = n2[t2]);
    }
    return e2;
  }, E.apply(null, arguments);
}
function G(e2, o2) {
  if (null == e2) return {};
  var n2 = {};
  for (var t2 in e2) if ({}.hasOwnProperty.call(e2, t2)) {
    if (-1 !== o2.indexOf(t2)) continue;
    n2[t2] = e2[t2];
  }
  return n2;
}
var j = { container: { display: "flex", alignItems: "center" }, sourceChip: { marginRight: 7 }, targetChip: { marginLeft: 7, marginRight: 7 } }, D = { center, justify, start: left, end: right }, A = function(e2) {
  return D[e2];
}, Z = { layout: "horizontal", align: "center", sort: "auto", colors: { scheme: "nivo" }, nodeOpacity: 0.75, nodeHoverOpacity: 1, nodeHoverOthersOpacity: 0.15, nodeThickness: 12, nodeInnerPadding: 0, nodeBorderWidth: 1, nodeBorderColor: { from: "color", modifiers: [["darker", 0.5]] }, nodeBorderRadius: 0, linkOpacity: 0.25, linkHoverOpacity: 0.6, linkHoverOthersOpacity: 0.15, linkContract: 0, linkBlendMode: "multiply", enableLinkGradient: false, enableLabels: true, label: "id", labelPosition: "inside", labelPadding: 9, labelOrientation: "horizontal", labelTextColor: { from: "color", modifiers: [["darker", 0.8]] }, labelComponent: b$1, isInteractive: true, nodeTooltip: function(e2) {
  var o2 = e2.node;
  return jsxRuntimeExports.jsx(T, { id: o2.label, enableChip: true, color: o2.color });
}, linkTooltip: function(e2) {
  var o2 = e2.link;
  return jsxRuntimeExports.jsx(T, { id: jsxRuntimeExports.jsxs("span", { style: j.container, children: [jsxRuntimeExports.jsx(w$1, { color: o2.source.color, style: j.sourceChip }), jsxRuntimeExports.jsx("strong", { children: o2.source.label }), " > ", jsxRuntimeExports.jsx("strong", { children: o2.target.label }), jsxRuntimeExports.jsx(w$1, { color: o2.target.color, style: j.targetChip }), jsxRuntimeExports.jsx("strong", { children: o2.formattedValue })] }) });
}, legends: [], layers: ["links", "nodes", "labels", "legends"], role: "img", animate: true, motionConfig: "gentle" }, q = function(e2) {
  return e2.id;
}, U = function(n2) {
  var t2 = n2.data, i2 = n2.valueFormat, r2 = n2.layout, l2 = n2.width, c2 = n2.height, s2 = n2.sort, u2 = n2.align, h2 = n2.colors, v2 = n2.nodeThickness, p2 = n2.nodeSpacing, f = n2.nodeInnerPadding, g2 = n2.nodeBorderColor, y2 = n2.label, m2 = n2.labelTextColor, k2 = reactExports.useState(null), C2 = k2[0], x2 = k2[1], O2 = reactExports.useState(null), L2 = O2[0], w2 = O2[1], H2 = reactExports.useMemo((function() {
    if ("auto" !== s2) return "input" === s2 ? null : "ascending" === s2 ? function(e2, o2) {
      return e2.value - o2.value;
    } : "descending" === s2 ? function(e2, o2) {
      return o2.value - e2.value;
    } : s2;
  }), [s2]), I2 = "input" === s2 ? null : void 0, N2 = reactExports.useMemo((function() {
    return "function" == typeof u2 ? u2 : A(u2);
  }), [u2]), W2 = M$2(), R = hr(h2, "id"), z2 = Ye(g2, W2), F2 = bn(y2), S2 = Ye(m2, W2), E2 = hn(i2), G2 = reactExports.useMemo((function() {
    return (function(e2) {
      var o2 = e2.data, n3 = e2.formatValue, t3 = e2.layout, i3 = e2.alignFunction, r3 = e2.sortFunction, l3 = e2.linkSortMode, a2 = e2.nodeThickness, d2 = e2.nodeSpacing, c3 = e2.nodeInnerPadding, s3 = e2.width, u3 = e2.height, h3 = e2.getColor, v3 = e2.getLabel, p3 = Sankey().nodeAlign(i3).nodeSort(r3).linkSort(l3).nodeWidth(a2).nodePadding(d2).size("horizontal" === t3 ? [s3, u3] : [u3, s3]).nodeId(q), f2 = M(o2);
      return p3(f2), f2.nodes.forEach((function(e3) {
        if (e3.color = h3(e3), e3.label = v3(e3), e3.formattedValue = n3(e3.value), "horizontal" === t3) e3.x = e3.x0 + c3, e3.y = e3.y0, e3.width = Math.max(e3.x1 - e3.x0 - 2 * c3, 0), e3.height = Math.max(e3.y1 - e3.y0, 0);
        else {
          e3.x = e3.y0, e3.y = e3.x0 + c3, e3.width = Math.max(e3.y1 - e3.y0, 0), e3.height = Math.max(e3.x1 - e3.x0 - 2 * c3, 0);
          var o3 = e3.x0, i4 = e3.x1;
          e3.x0 = e3.y0, e3.x1 = e3.y1, e3.y0 = o3, e3.y1 = i4;
        }
      })), f2.links.forEach((function(e3) {
        e3.formattedValue = n3(e3.value), e3.color = e3.source.color, e3.pos0 = e3.y0, e3.pos1 = e3.y1, e3.thickness = e3.width, delete e3.y0, delete e3.y1, delete e3.width;
      })), f2;
    })({ data: t2, formatValue: E2, layout: r2, alignFunction: N2, sortFunction: H2, linkSortMode: I2, nodeThickness: v2, nodeSpacing: p2, nodeInnerPadding: f, width: l2, height: c2, getColor: R, getLabel: F2 });
  }), [t2, E2, r2, N2, H2, I2, v2, p2, f, l2, c2, R, F2]), j2 = G2.nodes, D2 = G2.links, V2 = reactExports.useMemo((function() {
    return j2.map((function(e2) {
      return { id: e2.id, label: e2.label, color: e2.color };
    }));
  }), [j2]);
  return { nodes: j2, links: D2, legendData: V2, getNodeBorderColor: z2, currentNode: C2, setCurrentNode: x2, currentLink: L2, setCurrentLink: w2, getLabelTextColor: S2 };
}, J = function(e2) {
  var o2 = e2.node, i2 = e2.x, r2 = e2.y, l2 = e2.width, a2 = e2.height, d2 = e2.color, s2 = e2.opacity, u2 = e2.borderWidth, h2 = e2.borderColor, v2 = e2.borderRadius, p2 = e2.setCurrent, f = e2.isInteractive, g2 = e2.onClick, y2 = e2.tooltip, m2 = Dr(), k2 = m2.animate, b2 = m2.config, C2 = useSpring({ x: i2, y: r2, width: l2, height: a2, opacity: s2, color: d2, config: b2, immediate: !k2 }), x2 = z$2(), O2 = x2.showTooltipFromEvent, H2 = x2.hideTooltip, I2 = reactExports.useCallback((function(e3) {
    p2(o2), O2(reactExports.createElement(y2, { node: o2 }), e3, "left");
  }), [p2, o2, O2, y2]), M2 = reactExports.useCallback((function(e3) {
    O2(reactExports.createElement(y2, { node: o2 }), e3, "left");
  }), [O2, o2, y2]), T2 = reactExports.useCallback((function() {
    p2(null), H2();
  }), [p2, H2]), B2 = reactExports.useCallback((function(e3) {
    null == g2 || g2(o2, e3);
  }), [g2, o2]);
  return jsxRuntimeExports.jsx(animated.rect, { x: C2.x, y: C2.y, rx: v2, ry: v2, width: C2.width.to((function(e3) {
    return Math.max(e3, 0);
  })), height: C2.height.to((function(e3) {
    return Math.max(e3, 0);
  })), fill: C2.color, fillOpacity: C2.opacity, strokeWidth: u2, stroke: h2, strokeOpacity: s2, onMouseEnter: f ? I2 : void 0, onMouseMove: f ? M2 : void 0, onMouseLeave: f ? T2 : void 0, onClick: f ? B2 : void 0 });
}, K = function(e2) {
  var o2 = e2.nodes, n2 = e2.nodeOpacity, t2 = e2.nodeHoverOpacity, i2 = e2.nodeHoverOthersOpacity, r2 = e2.borderWidth, l2 = e2.getBorderColor, a2 = e2.borderRadius, d2 = e2.setCurrentNode, c2 = e2.currentNode, s2 = e2.currentLink, u2 = e2.isCurrentNode, h2 = e2.isInteractive, v2 = e2.onClick, p2 = e2.tooltip, f = function(e3) {
    return c2 || s2 ? u2(e3) ? t2 : i2 : n2;
  };
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: o2.map((function(e3) {
    return jsxRuntimeExports.jsx(J, { node: e3, x: e3.x, y: e3.y, width: e3.width, height: e3.height, color: e3.color, opacity: f(e3), borderWidth: r2, borderColor: l2(e3), borderRadius: a2, setCurrent: d2, isInteractive: h2, onClick: v2, tooltip: p2 }, e3.id);
  })) });
}, Q = function(e2) {
  var o2 = e2.id, n2 = e2.layout, t2 = e2.startColor, i2 = e2.endColor;
  return jsxRuntimeExports.jsxs("linearGradient", E({ id: o2, spreadMethod: "pad" }, "horizontal" === n2 ? { x1: "0%", x2: "100%", y1: "0%", y2: "0%" } : { x1: "0%", x2: "0%", y1: "0%", y2: "100%" }, { children: [jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: t2 }), jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: i2 })] }));
}, X = function(e2) {
  var o2 = e2.link, i2 = e2.layout, r2 = e2.path, l2 = e2.color, a2 = e2.opacity, d2 = e2.blendMode, u2 = e2.enableGradient, h2 = e2.setCurrent, v2 = e2.tooltip, p2 = e2.isInteractive, f = e2.onClick, g2 = o2.source.id + "." + o2.target.id + "." + o2.index, y2 = Dr(), m2 = y2.animate, k2 = y2.config, b2 = It(r2), C2 = useSpring({ color: l2, opacity: a2, config: k2, immediate: !m2 }), x2 = z$2(), O2 = x2.showTooltipFromEvent, M2 = x2.hideTooltip, T2 = reactExports.useCallback((function(e3) {
    h2(o2), O2(reactExports.createElement(v2, { link: o2 }), e3, "left");
  }), [h2, o2, O2, v2]), B2 = reactExports.useCallback((function(e3) {
    O2(reactExports.createElement(v2, { link: o2 }), e3, "left");
  }), [O2, o2, v2]), P2 = reactExports.useCallback((function() {
    h2(null), M2();
  }), [h2, M2]), R = reactExports.useCallback((function(e3) {
    null == f || f(o2, e3);
  }), [f, o2]);
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [u2 && jsxRuntimeExports.jsx(Q, { id: g2, layout: i2, startColor: o2.startColor || o2.source.color, endColor: o2.endColor || o2.target.color }), jsxRuntimeExports.jsx(animated.path, { fill: u2 ? 'url("#' + encodeURI(g2) + '")' : C2.color, d: b2, fillOpacity: C2.opacity, onMouseEnter: p2 ? T2 : void 0, onMouseMove: p2 ? B2 : void 0, onMouseLeave: p2 ? P2 : void 0, onClick: p2 ? R : void 0, style: { mixBlendMode: d2 } })] });
}, Y = function(e2) {
  var n2 = e2.links, t2 = e2.layout, i2 = e2.linkOpacity, r2 = e2.linkHoverOpacity, l2 = e2.linkHoverOthersOpacity, a2 = e2.linkContract, d2 = e2.linkBlendMode, c2 = e2.enableLinkGradient, s2 = e2.setCurrentLink, u2 = e2.currentLink, h2 = e2.currentNode, v2 = e2.isCurrentLink, p2 = e2.isInteractive, f = e2.onClick, g2 = e2.tooltip, y2 = function(e3) {
    return h2 || u2 ? v2(e3) ? r2 : l2 : i2;
  }, m2 = reactExports.useMemo((function() {
    return "horizontal" === t2 ? (e3 = z$4().curve(monotoneX), function(o2, n3) {
      var t3 = Math.max(1, o2.thickness - 2 * n3) / 2, i3 = 0.12 * (o2.target.x0 - o2.source.x1), r3 = [[o2.source.x1, o2.pos0 - t3], [o2.source.x1 + i3, o2.pos0 - t3], [o2.target.x0 - i3, o2.pos1 - t3], [o2.target.x0, o2.pos1 - t3], [o2.target.x0, o2.pos1 + t3], [o2.target.x0 - i3, o2.pos1 + t3], [o2.source.x1 + i3, o2.pos0 + t3], [o2.source.x1, o2.pos0 + t3], [o2.source.x1, o2.pos0 - t3]];
      return e3(r3) + "Z";
    }) : (function() {
      var e4 = z$4().curve(monotoneY);
      return function(o2, n3) {
        var t3 = Math.max(1, o2.thickness - 2 * n3) / 2, i3 = 0.12 * (o2.target.y0 - o2.source.y1), r3 = [[o2.pos0 + t3, o2.source.y1], [o2.pos0 + t3, o2.source.y1 + i3], [o2.pos1 + t3, o2.target.y0 - i3], [o2.pos1 + t3, o2.target.y0], [o2.pos1 - t3, o2.target.y0], [o2.pos1 - t3, o2.target.y0 - i3], [o2.pos0 - t3, o2.source.y1 + i3], [o2.pos0 - t3, o2.source.y1], [o2.pos0 + t3, o2.source.y1]];
        return e4(r3) + "Z";
      };
    })();
    var e3;
  }), [t2]);
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: n2.map((function(e3) {
    return jsxRuntimeExports.jsx(X, { link: e3, layout: t2, path: m2(e3, a2), color: e3.color, opacity: y2(e3), blendMode: d2, enableGradient: c2, setCurrent: s2, isInteractive: p2, onClick: f, tooltip: g2 }, e3.source.id + "." + e3.target.id + "." + e3.index);
  })) });
}, $ = function(e2) {
  var o2 = e2.nodes, n2 = e2.layout, t2 = e2.width, i2 = e2.height, r2 = e2.labelPosition, l2 = e2.labelPadding, a2 = e2.labelOrientation, d2 = e2.getLabelTextColor, s2 = e2.labelComponent, u2 = M$2(), h2 = "vertical" === a2 ? -90 : 0, v2 = o2.map((function(e3) {
    var o3, c2, s3;
    return "horizontal" === n2 ? (c2 = e3.y + e3.height / 2, e3.x < t2 / 2 ? "inside" === r2 ? (o3 = e3.x1 + l2, s3 = "vertical" === a2 ? "middle" : "start") : (o3 = e3.x - l2, s3 = "vertical" === a2 ? "middle" : "end") : "inside" === r2 ? (o3 = e3.x - l2, s3 = "vertical" === a2 ? "middle" : "end") : (o3 = e3.x1 + l2, s3 = "vertical" === a2 ? "middle" : "start")) : "vertical" === n2 && (o3 = e3.x + e3.width / 2, e3.y < i2 / 2 ? "inside" === r2 ? (c2 = e3.y1 + l2, s3 = "vertical" === a2 ? "end" : "middle") : (c2 = e3.y - l2, s3 = "vertical" === a2 ? "start" : "middle") : "inside" === r2 ? (c2 = e3.y - l2, s3 = "vertical" === a2 ? "start" : "middle") : (c2 = e3.y1 + l2, s3 = "vertical" === a2 ? "end" : "middle")), { id: e3.id, label: e3.label, x: o3, y: c2, textAnchor: s3, color: d2(e3) };
  })), p2 = Dr(), f = p2.animate, g2 = p2.config, y2 = useSprings(v2.length, v2.map((function(e3) {
    return { transform: "translate(" + e3.x + ", " + e3.y + ") rotate(" + h2 + ")", color: e3.color, config: g2, immediate: !f };
  })));
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: y2.map((function(e3, n3) {
    var t3 = v2[n3];
    return jsxRuntimeExports.jsx(s2, { dominantBaseline: "central", textAnchor: t3.textAnchor, transform: e3.transform, style: E({}, u2.labels.text, { fill: e3.color, pointerEvents: "none" }), node: o2[n3], children: t3.label }, t3.id);
  })) });
}, _ = ["isInteractive", "animate", "motionConfig", "theme", "renderWrapper"], ee = function(e2) {
  var n2 = e2.data, i2 = e2.valueFormat, a2 = e2.layout, d2 = void 0 === a2 ? Z.layout : a2, c2 = e2.sort, s2 = void 0 === c2 ? Z.sort : c2, u2 = e2.align, p2 = void 0 === u2 ? Z.align : u2, g2 = e2.width, y2 = e2.height, m2 = e2.margin, k2 = e2.colors, b2 = void 0 === k2 ? Z.colors : k2, C2 = e2.nodeThickness, x2 = void 0 === C2 ? Z.nodeThickness : C2, O2 = e2.nodeSpacing, L2 = void 0 === O2 ? Z.nodeThickness : O2, H2 = e2.nodeInnerPadding, I2 = void 0 === H2 ? Z.nodeInnerPadding : H2, M2 = e2.nodeBorderColor, T2 = void 0 === M2 ? Z.nodeBorderColor : M2, B2 = e2.nodeOpacity, P2 = void 0 === B2 ? Z.nodeOpacity : B2, N2 = e2.nodeHoverOpacity, W2 = void 0 === N2 ? Z.nodeHoverOpacity : N2, R = e2.nodeHoverOthersOpacity, z2 = void 0 === R ? Z.nodeHoverOthersOpacity : R, F2 = e2.nodeBorderWidth, S2 = void 0 === F2 ? Z.nodeBorderWidth : F2, G2 = e2.nodeBorderRadius, j2 = void 0 === G2 ? Z.nodeBorderRadius : G2, D2 = e2.linkOpacity, V2 = void 0 === D2 ? Z.linkOpacity : D2, A5 = e2.linkHoverOpacity, q2 = void 0 === A5 ? Z.linkHoverOpacity : A5, J2 = e2.linkHoverOthersOpacity, Q2 = void 0 === J2 ? Z.linkHoverOthersOpacity : J2, X3 = e2.linkContract, _2 = void 0 === X3 ? Z.linkContract : X3, ee2 = e2.linkBlendMode, oe2 = void 0 === ee2 ? Z.linkBlendMode : ee2, ne2 = e2.enableLinkGradient, te2 = void 0 === ne2 ? Z.enableLinkGradient : ne2, ie = e2.enableLabels, re2 = void 0 === ie ? Z.enableLabels : ie, le2 = e2.labelComponent, ae2 = void 0 === le2 ? Z.labelComponent : le2, de2 = e2.labelPosition, ce2 = void 0 === de2 ? Z.labelPosition : de2, se2 = e2.labelPadding, ue2 = void 0 === se2 ? Z.labelPadding : se2, he2 = e2.labelOrientation, ve2 = void 0 === he2 ? Z.labelOrientation : he2, pe2 = e2.label, fe2 = void 0 === pe2 ? Z.label : pe2, ge2 = e2.labelTextColor, ye2 = void 0 === ge2 ? Z.labelTextColor : ge2, me2 = e2.nodeTooltip, ke2 = void 0 === me2 ? Z.nodeTooltip : me2, be2 = e2.linkTooltip, Ce2 = void 0 === be2 ? Z.linkTooltip : be2, xe = e2.isInteractive, Oe = void 0 === xe ? Z.isInteractive : xe, Le = e2.onClick, we = e2.legends, He2 = void 0 === we ? Z.legends : we, Ie = e2.layers, Me2 = void 0 === Ie ? Z.layers : Ie, Te2 = e2.role, Be = void 0 === Te2 ? Z.role : Te2, Pe2 = e2.ariaLabel, Ne = e2.ariaLabelledBy, We2 = e2.ariaDescribedBy, Re2 = e2.forwardedRef, ze = cn(g2, y2, m2), Fe2 = ze.margin, Se2 = ze.innerWidth, Ee = ze.innerHeight, Ge2 = ze.outerWidth, je2 = ze.outerHeight, De2 = U({ data: n2, valueFormat: i2, layout: d2, width: Se2, height: Ee, sort: s2, align: p2, colors: b2, nodeThickness: x2, nodeSpacing: L2, nodeInnerPadding: I2, nodeBorderColor: T2, label: fe2, labelTextColor: ye2 }), Ve2 = De2.nodes, Ae = De2.links, Ze = De2.legendData, qe2 = De2.getNodeBorderColor, Ue2 = De2.currentNode, Je2 = De2.setCurrentNode, Ke2 = De2.currentLink, Qe2 = De2.setCurrentLink, Xe2 = De2.getLabelTextColor, Ye2 = reactExports.useMemo((function() {
    var e3 = function() {
      return false;
    }, o2 = function() {
      return false;
    };
    if (Ke2 && (e3 = function(e4) {
      var o3 = e4.id;
      return o3 === Ke2.source.id || o3 === Ke2.target.id;
    }, o2 = function(e4) {
      var o3 = e4.source, n4 = e4.target;
      return o3.id === Ke2.source.id && n4.id === Ke2.target.id;
    }), Ue2) {
      var n3 = [Ue2.id];
      Ae.filter((function(e4) {
        var o3 = e4.source, n4 = e4.target;
        return o3.id === Ue2.id || n4.id === Ue2.id;
      })).forEach((function(e4) {
        var o3 = e4.source, t2 = e4.target;
        n3.push(o3.id), n3.push(t2.id);
      })), n3 = l$2(n3), e3 = function(e4) {
        var o3 = e4.id;
        return n3.includes(o3);
      }, o2 = function(e4) {
        var o3 = e4.source, n4 = e4.target;
        return o3.id === Ue2.id || n4.id === Ue2.id;
      };
    }
    return { isCurrentNode: e3, isCurrentLink: o2 };
  }), [Ke2, Ue2, Ae]), $e2 = Ye2.isCurrentNode, _e2 = Ye2.isCurrentLink, eo = reactExports.useMemo((function() {
    return { links: Ae, nodes: Ve2, margin: Fe2, width: g2, height: y2, outerWidth: Ge2, outerHeight: je2, currentNode: Ue2, isCurrentNode: $e2, setCurrentNode: Je2, currentLink: Ke2, isCurrentLink: _e2, setCurrentLink: Qe2, isInteractive: Oe };
  }), [Ae, Ve2, Fe2, g2, y2, Ge2, je2, Ue2, $e2, Je2, Ke2, _e2, Qe2, Oe]), oo = { links: null, nodes: null, labels: null, legends: null };
  return Me2.includes("links") && (oo.links = jsxRuntimeExports.jsx(Y, { links: Ae, layout: d2, linkContract: _2, linkOpacity: V2, linkHoverOpacity: q2, linkHoverOthersOpacity: Q2, linkBlendMode: oe2, enableLinkGradient: te2, setCurrentLink: Qe2, currentNode: Ue2, currentLink: Ke2, isCurrentLink: _e2, isInteractive: Oe, onClick: Le, tooltip: Ce2 }, "links")), Me2.includes("nodes") && (oo.nodes = jsxRuntimeExports.jsx(K, { nodes: Ve2, nodeOpacity: P2, nodeHoverOpacity: W2, nodeHoverOthersOpacity: z2, borderWidth: S2, borderRadius: j2, getBorderColor: qe2, setCurrentNode: Je2, currentNode: Ue2, currentLink: Ke2, isCurrentNode: $e2, isInteractive: Oe, onClick: Le, tooltip: ke2 }, "nodes")), Me2.includes("labels") && re2 && (oo.labels = jsxRuntimeExports.jsx($, { nodes: Ve2, layout: d2, width: Se2, height: Ee, labelPosition: ce2, labelPadding: ue2, labelOrientation: ve2, getLabelTextColor: Xe2, labelComponent: ae2 }, "labels")), Me2.includes("legends") && (oo.legends = jsxRuntimeExports.jsx(reactExports.Fragment, { children: He2.map((function(e3, o2) {
    return jsxRuntimeExports.jsx(E$1, E({}, e3, { containerWidth: Se2, containerHeight: Ee, data: Ze }), "legend" + o2);
  })) }, "legends")), jsxRuntimeExports.jsx(Rt, { width: Ge2, height: je2, margin: Fe2, role: Be, ariaLabel: Pe2, ariaLabelledBy: Ne, ariaDescribedBy: We2, ref: Re2, children: Me2.map((function(e3, o2) {
    var n3;
    return "function" == typeof e3 ? jsxRuntimeExports.jsx(reactExports.Fragment, { children: reactExports.createElement(e3, eo) }, o2) : null != (n3 = null == oo ? void 0 : oo[e3]) ? n3 : null;
  })) });
}, oe = reactExports.forwardRef((function(e2, o2) {
  var n2 = e2.isInteractive, t2 = void 0 === n2 ? Z.isInteractive : n2, i2 = e2.animate, r2 = void 0 === i2 ? Z.animate : i2, l2 = e2.motionConfig, a2 = void 0 === l2 ? Z.motionConfig : l2, d2 = e2.theme, c2 = e2.renderWrapper, s2 = G(e2, _);
  return jsxRuntimeExports.jsx(Fr, { animate: r2, isInteractive: t2, motionConfig: a2, renderWrapper: c2, theme: d2, children: jsxRuntimeExports.jsx(ee, E({ isInteractive: t2 }, s2, { forwardedRef: o2 })) });
})), ne = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"], te = reactExports.forwardRef((function(e2, o2) {
  var n2 = e2.defaultWidth, t2 = e2.defaultHeight, i2 = e2.onResize, r2 = e2.debounceResize, l2 = G(e2, ne);
  return jsxRuntimeExports.jsx($r, { defaultWidth: n2, defaultHeight: t2, onResize: i2, debounceResize: r2, children: function(e3) {
    var n3 = e3.width, t3 = e3.height;
    return jsxRuntimeExports.jsx(oe, E({ width: n3, height: t3 }, l2, { ref: o2 }));
  } });
}));
const ChartTooltipContainer = ({
  children,
  className
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn$1(
        "col min-w-[180px] gap-2 rounded-xl border bg-background/80 p-3 shadow-xl backdrop-blur-sm",
        className
      ),
      children
    }
  );
};
const ChartTooltipHeader = ({
  children
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between gap-8", children });
};
const ChartTooltipItem = ({
  children,
  color,
  className,
  innerClassName
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn$1("flex gap-2", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[3px] rounded-full", style: { background: color } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn$1("col flex-1 gap-1", innerClassName), children })
  ] });
};
const showPath = (string) => {
  try {
    const url = new URL(string);
    return url.pathname;
  } catch {
    return string;
  }
};
const showDomain = (string) => {
  try {
    const url = new URL(string);
    return url.hostname;
  } catch {
    return string;
  }
};
function SankeyPortalTooltip({
  children,
  offset = 12,
  padding = 8
}) {
  const anchorRef = reactExports.useRef(null);
  const tooltipRef = reactExports.useRef(null);
  const [anchorRect, setAnchorRect] = reactExports.useState(null);
  const [pos, setPos] = reactExports.useState({
    left: 0,
    top: 0,
    ready: false
  });
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useLayoutEffect(() => {
    setMounted(true);
  }, []);
  reactExports.useLayoutEffect(() => {
    const el = anchorRef.current;
    if (!el) {
      return;
    }
    const wrapper = el.parentElement;
    if (!wrapper) {
      return;
    }
    const update2 = () => {
      setAnchorRect(wrapper.getBoundingClientRect());
    };
    update2();
    const ro = new ResizeObserver(update2);
    ro.observe(wrapper);
    window.addEventListener("scroll", update2, true);
    window.addEventListener("resize", update2);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update2, true);
      window.removeEventListener("resize", update2);
    };
  }, []);
  reactExports.useLayoutEffect(() => {
    if (!mounted) {
      return;
    }
    if (!anchorRect) {
      return;
    }
    const tooltipEl = tooltipRef.current;
    if (!tooltipEl) {
      return;
    }
    const rect = tooltipEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left2 = anchorRect.left + offset;
    let top = anchorRect.top + offset;
    left2 = Math.min(
      Math.max(padding, left2),
      Math.max(padding, vw - rect.width - padding)
    );
    top = Math.min(
      Math.max(padding, top),
      Math.max(padding, vh - rect.height - padding)
    );
    setPos({ left: left2, top, ready: true });
  }, [mounted, anchorRect, children, offset, padding]);
  if (typeof document === "undefined") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", ref: anchorRef }),
    mounted && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "pointer-events-none fixed z-[9999]",
          ref: tooltipRef,
          style: {
            left: pos.left,
            top: pos.top,
            visibility: pos.ready ? "visible" : "hidden"
          },
          children
        }
      ),
      document.body
    )
  ] });
}
function OverviewUserJourney({
  projectId,
  shareId
}) {
  const { range: range2, startDate, endDate } = useOverviewOptions();
  const [filters] = useEventQueryFilters();
  const [steps, setSteps] = useQueryState(
    "journeySteps",
    parseAsInteger.withDefault(5).withOptions({ history: "push" })
  );
  const containerRef = reactExports.useRef(null);
  const trpc = useTRPC();
  const query = useQuery(
    trpc.overview.userJourney.queryOptions({
      projectId,
      filters,
      startDate,
      endDate,
      range: range2,
      steps: steps ?? 5,
      shareId
    })
  );
  const data = query.data;
  const number = useNumber();
  const sankeyData = reactExports.useMemo(() => {
    if (!data) {
      return { nodes: [], links: [] };
    }
    return {
      nodes: data.nodes.map((node) => ({
        ...node,
        // Store label for display in tooltips
        label: node.label || node.id,
        data: {
          percentage: node.percentage,
          value: node.value,
          step: node.step,
          label: node.label || node.id
        }
      })),
      links: data.links
    };
  }, [data]);
  const totalSessions = reactExports.useMemo(() => {
    if (!sankeyData.nodes || sankeyData.nodes.length === 0) {
      return 0;
    }
    const step1 = sankeyData.nodes.filter((n2) => n2.data?.step === 1);
    const base = step1.length > 0 ? step1 : sankeyData.nodes;
    return base.reduce((sum, n2) => sum + (n2.data?.value ?? 0), 0);
  }, [sankeyData.nodes]);
  const stepOptions = [3, 5];
  const { appTheme } = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "col-span-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetHead, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "title", children: "User Journey" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetButtons, { children: stepOptions.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: cn$1((steps ?? 5) === option && "active"),
          onClick: () => setSteps(option),
          type: "button",
          children: [
            option,
            " Steps"
          ]
        },
        option
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-96 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: "Loading..." }) }) : sankeyData.nodes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-96 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: "No journey data available" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "relative aspect-square w-full md:aspect-[2]",
        ref: containerRef,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          te,
          {
            animate: false,
            colors: (node) => node.nodeColor,
            data: sankeyData,
            label: (node) => {
              const label = showPath(
                node.data?.label || node.label || node.id
              );
              return truncate(label, 30, "middle");
            },
            labelTextColor: appTheme === "dark" ? "#e2e8f0" : "#0f172a",
            linkBlendMode: "normal",
            linkContract: 1,
            linkOpacity: 0.3,
            linkTooltip: ({ link: link2 }) => {
              const sourceLabel = link2?.source?.data?.label ?? link2?.source?.label ?? link2?.source?.id;
              const targetLabel = link2?.target?.data?.label ?? link2?.target?.label ?? link2?.target?.id;
              const value = link2?.value ?? 0;
              const sourceValue = link2?.source?.data?.value ?? link2?.source?.value ?? 0;
              const pctOfTotal = totalSessions > 0 ? value / totalSessions * 100 : 0;
              const pctOfSource = sourceValue > 0 ? value / sourceValue * 100 : 0;
              const sourceStep = link2?.source?.data?.step;
              const targetStep = link2?.target?.data?.step;
              const color = link2?.color ?? link2?.source?.color ?? link2?.source?.data?.nodeColor ?? "#64748b";
              const sourceDomain = showDomain(sourceLabel);
              const targetDomain = showDomain(targetLabel);
              const isSameDomain = sourceDomain === targetDomain;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(SankeyPortalTooltip, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ChartTooltipContainer, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(ChartTooltipHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 break-words font-medium", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-1 opacity-40", children: showDomain(sourceLabel) }),
                    showPath(sourceLabel),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "mx-3 inline-block size-2" }),
                    !isSameDomain && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-1 opacity-40", children: showDomain(targetLabel) }),
                    showPath(targetLabel)
                  ] }),
                  typeof sourceStep === "number" && typeof targetStep === "number" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 text-muted-foreground", children: [
                    sourceStep,
                    " → ",
                    targetStep
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(ChartTooltipItem, { color, innerClassName: "gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-8 font-medium tabular-nums", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Sessions" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: number.format(value) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-8 text-sm tabular-nums", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "% of total" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      number.format(round(pctOfTotal, 1)),
                      " %"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-8 text-sm tabular-nums", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "% of source" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      number.format(round(pctOfSource, 1)),
                      " %"
                    ] })
                  ] })
                ] })
              ] }) });
            },
            margin: { top: 20, right: 20, bottom: 20, left: 20 },
            nodeBorderRadius: 2,
            nodeBorderWidth: 0,
            nodeOpacity: 0.8,
            nodeSpacing: 10,
            nodeTooltip: ({ node }) => {
              const label = node?.data?.label ?? node?.label ?? node?.id;
              const value = node?.data?.value ?? node?.value ?? 0;
              const step = node?.data?.step;
              const pct = typeof node?.data?.percentage === "number" ? node.data.percentage : totalSessions > 0 ? value / totalSessions * 100 : 0;
              const color = node?.color ?? node?.data?.nodeColor ?? node?.data?.color ?? node?.nodeColor ?? "#64748b";
              return /* @__PURE__ */ jsxRuntimeExports.jsx(SankeyPortalTooltip, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ChartTooltipContainer, { className: "min-w-[250px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(ChartTooltipHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 break-words font-medium", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-1 opacity-40", children: showDomain(label) }),
                    showPath(label)
                  ] }),
                  typeof step === "number" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 text-muted-foreground", children: [
                    "Step ",
                    step
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(ChartTooltipItem, { color, innerClassName: "gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-8 font-medium tabular-nums", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Sessions" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: number.format(value) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-8 font-medium tabular-nums", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Share" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      number.format(round(pct, 1)),
                      " %"
                    ] })
                  ] })
                ] })
              ] }) });
            }
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs", children: "Shows the most common paths users take through your application" }) })
  ] });
}
const METRICS = [
  { key: "unique_visitors", label: "Unique Visitors", unit: "" },
  { key: "total_sessions", label: "Sessions", unit: "" },
  { key: "total_screen_views", label: "Pageviews", unit: "" },
  { key: "bounce_rate", label: "Bounce Rate", unit: "pct" },
  { key: "views_per_session", label: "Pages / Session", unit: "" },
  { key: "avg_session_duration", label: "Session Duration", unit: "min" }
];
const SHORT_DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LONG_DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];
function formatHourRange(hour) {
  const pad2 = (n2) => String(n2).padStart(2, "0");
  return `${pad2(hour)}:00 – ${pad2(hour)}:59`;
}
function getColorClass(ratio) {
  if (ratio === 0) {
    return "bg-transparent";
  }
  if (ratio < 0.1) {
    return "bg-chart-0/5";
  }
  if (ratio < 0.2) {
    return "bg-chart-0/10";
  }
  if (ratio < 0.3) {
    return "bg-chart-0/20";
  }
  if (ratio < 0.4) {
    return "bg-chart-0/30";
  }
  if (ratio < 0.5) {
    return "bg-chart-0/40";
  }
  if (ratio < 0.6) {
    return "bg-chart-0/50";
  }
  if (ratio < 0.7) {
    return "bg-chart-0/60";
  }
  if (ratio < 0.8) {
    return "bg-chart-0/70";
  }
  if (ratio < 0.9) {
    return "bg-chart-0/90";
  }
  return "bg-chart-0";
}
function OverviewWeeklyTrends({
  projectId,
  shareId
}) {
  const { range: range2, startDate, endDate } = useOverviewOptions();
  const [filters] = useEventQueryFilters();
  const [metric, setMetric] = reactExports.useState("unique_visitors");
  const trpc = useTRPC();
  const number = useNumber();
  const query = useQuery(
    trpc.overview.stats.queryOptions({
      projectId,
      shareId,
      range: range2,
      interval: "hour",
      filters,
      startDate,
      endDate
    })
  );
  const heatmap = reactExports.useMemo(() => {
    const series = query.data?.series;
    if (!series?.length) {
      return null;
    }
    const sums = Array.from({ length: 7 }, () => Array(24).fill(0));
    const counts = Array.from(
      { length: 7 },
      () => Array(24).fill(0)
    );
    for (const item of series) {
      const value = item[metric];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        continue;
      }
      const d2 = new Date(item.date);
      const jsDay = d2.getDay();
      const day2 = jsDay === 0 ? 6 : jsDay - 1;
      const hour = d2.getHours();
      sums[day2][hour] += value;
      counts[day2][hour] += 1;
    }
    const averages = sums.map(
      (row, day2) => row.map((sum, hour) => {
        const count = counts[day2][hour];
        return count > 0 ? sum / count : 0;
      })
    );
    let max = 0;
    for (const row of averages) {
      for (const v2 of row) {
        if (v2 > max) {
          max = v2;
        }
      }
    }
    return { averages, max };
  }, [query.data, metric]);
  const activeMetric = METRICS.find((m2) => m2.key === metric);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "col-span-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      WidgetHeadSearchable,
      {
        activeTab: metric,
        onTabChange: setMetric,
        tabs: METRICS.map((m2) => ({ key: m2.key, label: m2.label }))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-48 items-center justify-center text-muted-foreground text-sm", children: "Loading..." }) : heatmap ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-14 shrink-0 pr-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6" }),
        Array.from({ length: 24 }, (_2, hour) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex h-4 items-center justify-end text-2xs text-muted-foreground",
            children: hour % 3 === 0 ? `${String(hour).padStart(2, "0")}:00` : ""
          },
          hour
        ))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-6", children: SHORT_DAY_NAMES.map((day2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex-1 text-center text-2xs text-muted-foreground",
            children: day2
          },
          day2
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 0, disableHoverableContent: true, children: Array.from({ length: 24 }, (_2, hour) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-4", children: Array.from({ length: 7 }, (_22, day2) => {
          const value = heatmap.averages[day2][hour];
          const ratio = heatmap.max > 0 && value > 0 ? value / heatmap.max : 0;
          const colorClass = getColorClass(ratio);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn$1("group flex-1 p-0.5"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn$1(
                  "size-full rounded-sm transition-all group-hover:ring-1 group-hover:ring-emerald-400",
                  colorClass
                )
              }
            ) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TooltipContent,
              {
                className: "border-0 bg-transparent p-0 shadow-none",
                side: "top",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ChartTooltipContainer, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm", children: [
                    LONG_DAY_NAMES[day2],
                    ", ",
                    formatHourRange(hour)
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipItem, { color: "#10b981", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-6 font-medium text-sm tabular-nums", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: activeMetric.label }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: activeMetric.unit === "pct" ? `${number.format(value)} %` : number.formatWithUnit(
                      value,
                      activeMetric.unit || null
                    ) })
                  ] }) })
                ] })
              }
            )
          ] }, day2);
        }) }, hour)) })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-48 items-center justify-center text-muted-foreground text-sm", children: "No data available" }) })
  ] });
}
export {
  LiveCounter as L,
  OverviewMetrics as O,
  OverviewTopSources as a,
  OverviewTopPages as b,
  OverviewTopDevices as c,
  OverviewTopEvents as d,
  OverviewTopGeo as e,
  OverviewWeeklyTrends as f,
  OverviewUserJourney as g
};
//# sourceMappingURL=overview-weekly-trends-DrC2rBau.js.map
