import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, gx as interpolateNumber, gy as geoStream, gz as noop$1, gA as Adder, gB as tau, gC as atan2, gD as sin, gE as cos, gF as radians, gG as quarterPi, gH as asin, gI as sqrt, gJ as degrees$1, gK as abs, gL as pi, gM as acos, gN as epsilon, gO as epsilon2$1, gP as halfPi, gQ as sign, gR as merge, gS as atan, gT as log, gU as tan, gV as exp, c4 as useQueryState, d as cn, bE as Tooltiper, cn as ChevronLeft, d1 as parseAsBoolean, R as ChevronDown, P as ProjectLink, a as useTRPC, j as useQuery, S as SerieIcon, gW as EventIcon, gX as Globe, a4 as useNumber, ai as BarChart, aj as Bar, af as OPChartTooltip, Q as motion, X, eX as ProfileAvatar, f9 as useDispatch, f8 as useSelector, O as AnimatePresence, gY as closeMapBadgeDetails, gZ as interpolateRgb, df as interpolateString, g_ as color, l as useTheme, g$ as openMapBadgeDetails, G as Plus, h0 as Minus, ak as useQueryClient, al as useWS, h1 as Route, e$ as keepPreviousData } from "./router-gBnYxPzA.js";
import { d as distExports } from "./index-DxXk7QJj.js";
import { b as useDebounce } from "./index-CHcXrYNT.js";
import { A as AnimatedNumber } from "./animated-number-DKHgshrj.js";
import { P as Ping } from "./ping-B_apCr-3.js";
import { u as useLiveCounter } from "./use-live-counter-BawyL5Mu.js";
import { g as getCountry } from "./countries-CS917BhP.js";
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
import "./use-debounce-state-BwHu4mHP.js";
import "./index-Dpi7uv2M.js";
const __iconNode = [
  ["line", { x1: "2", x2: "5", y1: "12", y2: "12", key: "bvdh0s" }],
  ["line", { x1: "19", x2: "22", y1: "12", y2: "12", key: "1tbv5k" }],
  ["line", { x1: "12", x2: "12", y1: "2", y2: "5", key: "11lu5j" }],
  ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }],
  ["circle", { cx: "12", cy: "12", r: "7", key: "fim9np" }],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const LocateFixed = createLucideIcon("locate-fixed", __iconNode);
var degrees = 180 / Math.PI;
var identity$3 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX,
    scaleY
  };
}
var svgNode;
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity$3 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
}
function parseSvg(value) {
  if (value == null) return identity$3;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity$3;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360;
      else if (b - a > 180) a += 360;
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }
  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a, b) {
    var s = [], q = [];
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");
var epsilon2 = 1e-12;
function cosh(x) {
  return ((x = Math.exp(x)) + 1 / x) / 2;
}
function sinh(x) {
  return ((x = Math.exp(x)) - 1 / x) / 2;
}
function tanh(x) {
  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}
const interpolateZoom = (function zoomRho(rho, rho2, rho4) {
  function zoom2(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      };
    } else {
      var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      };
    }
    i.duration = S * 1e3 * rho / Math.SQRT2;
    return i;
  }
  zoom2.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };
  return zoom2;
})(Math.SQRT2, 2, 4);
var areaRingSum$1 = new Adder();
var areaSum$1 = new Adder(), lambda00, phi00, lambda0, cosPhi0, sinPhi0;
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
  areaPoint$1(lambda00, phi00);
}
function areaPointFirst$1(lambda, phi) {
  areaStream$1.point = areaPoint$1;
  lambda00 = lambda, phi00 = phi;
  lambda *= radians, phi *= radians;
  lambda0 = lambda, cosPhi0 = cos(phi = phi / 2 + quarterPi), sinPhi0 = sin(phi);
}
function areaPoint$1(lambda, phi) {
  lambda *= radians, phi *= radians;
  phi = phi / 2 + quarterPi;
  var dLambda = lambda - lambda0, sdLambda = dLambda >= 0 ? 1 : -1, adLambda = sdLambda * dLambda, cosPhi = cos(phi), sinPhi = sin(phi), k = sinPhi0 * sinPhi, u = cosPhi0 * cosPhi + k * cos(adLambda), v = k * sdLambda * sin(adLambda);
  areaRingSum$1.add(atan2(v, u));
  lambda0 = lambda, cosPhi0 = cosPhi, sinPhi0 = sinPhi;
}
function geoArea(object2) {
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
function cartesianDot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cartesianCross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function cartesianAddInPlace(a, b) {
  a[0] += b[0], a[1] += b[1], a[2] += b[2];
}
function cartesianScale(vector, k) {
  return [vector[0] * k, vector[1] * k, vector[2] * k];
}
function cartesianNormalizeInPlace(d) {
  var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
  d[0] /= l, d[1] /= l, d[2] /= l;
}
function constant$2(x) {
  return function() {
    return x;
  };
}
function compose(a, b) {
  function compose2(x, y) {
    return x = a(x, y), b(x[0], x[1]);
  }
  if (a.invert && b.invert) compose2.invert = function(x, y) {
    return x = b.invert(x, y), x && a.invert(x[0], x[1]);
  };
  return compose2;
}
function rotationIdentity(lambda, phi) {
  if (abs(lambda) > pi) lambda -= Math.round(lambda / tau) * tau;
  return [lambda, phi];
}
rotationIdentity.invert = rotationIdentity;
function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
  return (deltaLambda %= tau) ? deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma)) : rotationLambda(deltaLambda) : deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma) : rotationIdentity;
}
function forwardRotationLambda(deltaLambda) {
  return function(lambda, phi) {
    lambda += deltaLambda;
    if (abs(lambda) > pi) lambda -= Math.round(lambda / tau) * tau;
    return [lambda, phi];
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
    var cosPhi = cos(phi), x = cos(lambda) * cosPhi, y = sin(lambda) * cosPhi, z = sin(phi), k = z * cosDeltaPhi + x * sinDeltaPhi;
    return [
      atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
      asin(k * cosDeltaGamma + y * sinDeltaGamma)
    ];
  }
  rotation2.invert = function(lambda, phi) {
    var cosPhi = cos(phi), x = cos(lambda) * cosPhi, y = sin(lambda) * cosPhi, z = sin(phi), k = z * cosDeltaGamma - y * sinDeltaGamma;
    return [
      atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
      asin(k * cosDeltaPhi - x * sinDeltaPhi)
    ];
  };
  return rotation2;
}
function rotation(rotate) {
  rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);
  function forward(coordinates) {
    coordinates = rotate(coordinates[0] * radians, coordinates[1] * radians);
    return coordinates[0] *= degrees$1, coordinates[1] *= degrees$1, coordinates;
  }
  forward.invert = function(coordinates) {
    coordinates = rotate.invert(coordinates[0] * radians, coordinates[1] * radians);
    return coordinates[0] *= degrees$1, coordinates[1] *= degrees$1, coordinates;
  };
  return forward;
}
function circleStream(stream, radius, delta, direction, t0, t1) {
  if (!delta) return;
  var cosRadius = cos(radius), sinRadius = sin(radius), step = direction * delta;
  if (t0 == null) {
    t0 = radius + direction * tau;
    t1 = radius - step / 2;
  } else {
    t0 = circleRadius(cosRadius, t0);
    t1 = circleRadius(cosRadius, t1);
    if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
  }
  for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
    point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
    stream.point(point[0], point[1]);
  }
}
function circleRadius(cosRadius, point) {
  point = cartesian(point), point[0] -= cosRadius;
  cartesianNormalizeInPlace(point);
  var radius = acos(-point[1]);
  return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
}
function geoCircle() {
  var center = constant$2([0, 0]), radius = constant$2(90), precision = constant$2(2), ring, rotate, stream = { point };
  function point(x, y) {
    ring.push(x = rotate(x, y));
    x[0] *= degrees$1, x[1] *= degrees$1;
  }
  function circle() {
    var c = center.apply(this, arguments), r = radius.apply(this, arguments) * radians, p = precision.apply(this, arguments) * radians;
    ring = [];
    rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert;
    circleStream(stream, r, p, 1);
    c = { type: "Polygon", coordinates: [ring] };
    ring = rotate = null;
    return c;
  }
  circle.center = function(_) {
    return arguments.length ? (center = typeof _ === "function" ? _ : constant$2([+_[0], +_[1]]), circle) : center;
  };
  circle.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant$2(+_), circle) : radius;
  };
  circle.precision = function(_) {
    return arguments.length ? (precision = typeof _ === "function" ? _ : constant$2(+_), circle) : precision;
  };
  return circle;
}
function clipBuffer() {
  var lines = [], line;
  return {
    point: function(x, y, m) {
      line.push([x, y, m]);
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
function pointEqual(a, b) {
  return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
}
function Intersection(point, points, other, entry) {
  this.x = point;
  this.z = points;
  this.o = other;
  this.e = entry;
  this.v = false;
  this.n = this.p = null;
}
function clipRejoin(segments, compareIntersection2, startInside, interpolate2, stream) {
  var subject = [], clip2 = [], i, n;
  segments.forEach(function(segment) {
    if ((n2 = segment.length - 1) <= 0) return;
    var n2, p0 = segment[0], p1 = segment[n2], x;
    if (pointEqual(p0, p1)) {
      if (!p0[2] && !p1[2]) {
        stream.lineStart();
        for (i = 0; i < n2; ++i) stream.point((p0 = segment[i])[0], p0[1]);
        stream.lineEnd();
        return;
      }
      p1[0] += 2 * epsilon;
    }
    subject.push(x = new Intersection(p0, segment, null, true));
    clip2.push(x.o = new Intersection(p0, null, x, false));
    subject.push(x = new Intersection(p1, segment, null, false));
    clip2.push(x.o = new Intersection(p1, null, x, true));
  });
  if (!subject.length) return;
  clip2.sort(compareIntersection2);
  link(subject);
  link(clip2);
  for (i = 0, n = clip2.length; i < n; ++i) {
    clip2[i].e = startInside = !startInside;
  }
  var start2 = subject[0], points, point;
  while (1) {
    var current = start2, isSubject = true;
    while (current.v) if ((current = current.n) === start2) return;
    points = current.z;
    stream.lineStart();
    do {
      current.v = current.o.v = true;
      if (current.e) {
        if (isSubject) {
          for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate2(current.x, current.n.x, 1, stream);
        }
        current = current.n;
      } else {
        if (isSubject) {
          points = current.p.z;
          for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
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
function link(array2) {
  if (!(n = array2.length)) return;
  var n, i = 0, a = array2[0], b;
  while (++i < n) {
    a.n = b = array2[i];
    b.p = a;
    a = b;
  }
  a.n = b = array2[0];
  b.p = a;
}
function longitude(point) {
  return abs(point[0]) <= pi ? point[0] : sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
}
function polygonContains(polygon, point) {
  var lambda = longitude(point), phi = point[1], sinPhi = sin(phi), normal = [sin(lambda), -cos(lambda), 0], angle = 0, winding = 0;
  var sum = new Adder();
  if (sinPhi === 1) phi = halfPi + epsilon;
  else if (sinPhi === -1) phi = -halfPi - epsilon;
  for (var i = 0, n = polygon.length; i < n; ++i) {
    if (!(m = (ring = polygon[i]).length)) continue;
    var ring, m, point0 = ring[m - 1], lambda02 = longitude(point0), phi0 = point0[1] / 2 + quarterPi, sinPhi02 = sin(phi0), cosPhi02 = cos(phi0);
    for (var j = 0; j < m; ++j, lambda02 = lambda1, sinPhi02 = sinPhi1, cosPhi02 = cosPhi1, point0 = point1) {
      var point1 = ring[j], lambda1 = longitude(point1), phi1 = point1[1] / 2 + quarterPi, sinPhi1 = sin(phi1), cosPhi1 = cos(phi1), delta = lambda1 - lambda02, sign2 = delta >= 0 ? 1 : -1, absDelta = sign2 * delta, antimeridian = absDelta > pi, k = sinPhi02 * sinPhi1;
      sum.add(atan2(k * sign2 * sin(absDelta), cosPhi02 * cosPhi1 + k * cos(absDelta)));
      angle += antimeridian ? delta + sign2 * tau : delta;
      if (antimeridian ^ lambda02 >= lambda ^ lambda1 >= lambda) {
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
  return (angle < -epsilon || angle < epsilon && sum < -epsilon2$1) ^ winding & 1;
}
function clip(pointVisible, clipLine2, interpolate2, start2) {
  return function(sink) {
    var line = clipLine2(sink), ringBuffer = clipBuffer(), ringSink = clipLine2(ringBuffer), polygonStarted = false, polygon, segments, ring;
    var clip2 = {
      point,
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
        clip2.point = point;
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
    function point(lambda, phi) {
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
      clip2.point = point;
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
      var clean = ringSink.clean(), ringSegments = ringBuffer.result(), i, n = ringSegments.length, m, segment, point2;
      ring.pop();
      polygon.push(ring);
      ring = null;
      if (!n) return;
      if (clean & 1) {
        segment = ringSegments[0];
        if ((m = segment.length - 1) > 0) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          for (i = 0; i < m; ++i) sink.point((point2 = segment[i])[0], point2[1]);
          sink.lineEnd();
        }
        return;
      }
      if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
      segments.push(ringSegments.filter(validSegment));
    }
    return clip2;
  };
}
function validSegment(segment) {
  return segment.length > 1;
}
function compareIntersection(a, b) {
  return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
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
  var lambda02 = NaN, phi0 = NaN, sign0 = NaN, clean;
  return {
    lineStart: function() {
      stream.lineStart();
      clean = 1;
    },
    point: function(lambda1, phi1) {
      var sign1 = lambda1 > 0 ? pi : -pi, delta = abs(lambda1 - lambda02);
      if (abs(delta - pi) < epsilon) {
        stream.point(lambda02, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        stream.point(lambda1, phi0);
        clean = 0;
      } else if (sign0 !== sign1 && delta >= pi) {
        if (abs(lambda02 - sign0) < epsilon) lambda02 -= sign0 * epsilon;
        if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
        phi0 = clipAntimeridianIntersect(lambda02, phi0, lambda1, phi1);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        clean = 0;
      }
      stream.point(lambda02 = lambda1, phi0 = phi1);
      sign0 = sign1;
    },
    lineEnd: function() {
      stream.lineEnd();
      lambda02 = phi0 = NaN;
    },
    clean: function() {
      return 2 - clean;
    }
  };
}
function clipAntimeridianIntersect(lambda02, phi0, lambda1, phi1) {
  var cosPhi02, cosPhi1, sinLambda0Lambda1 = sin(lambda02 - lambda1);
  return abs(sinLambda0Lambda1) > epsilon ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1) - sin(phi1) * (cosPhi02 = cos(phi0)) * sin(lambda02)) / (cosPhi02 * cosPhi1 * sinLambda0Lambda1)) : (phi0 + phi1) / 2;
}
function clipAntimeridianInterpolate(from, to, direction, stream) {
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
  } else if (abs(from[0] - to[0]) > epsilon) {
    var lambda = from[0] < to[0] ? pi : -pi;
    phi = direction * lambda / 2;
    stream.point(-lambda, phi);
    stream.point(0, phi);
    stream.point(lambda, phi);
  } else {
    stream.point(to[0], to[1]);
  }
}
function clipCircle(radius) {
  var cr = cos(radius), delta = 2 * radians, smallRadius = cr > 0, notHemisphere = abs(cr) > epsilon;
  function interpolate2(from, to, direction, stream) {
    circleStream(stream, radius, delta, direction, from, to);
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
        var point1 = [lambda, phi], point2, v = visible(lambda, phi), c = smallRadius ? v ? 0 : code(lambda, phi) : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
        if (!point0 && (v00 = v0 = v)) stream.lineStart();
        if (v !== v0) {
          point2 = intersect(point0, point1);
          if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
            point1[2] = 1;
        }
        if (v !== v0) {
          clean = 0;
          if (v) {
            stream.lineStart();
            point2 = intersect(point1, point0);
            stream.point(point2[0], point2[1]);
          } else {
            point2 = intersect(point0, point1);
            stream.point(point2[0], point2[1], 2);
            stream.lineEnd();
          }
          point0 = point2;
        } else if (notHemisphere && point0 && smallRadius ^ v) {
          var t;
          if (!(c & c0) && (t = intersect(point1, point0, true))) {
            clean = 0;
            if (smallRadius) {
              stream.lineStart();
              stream.point(t[0][0], t[0][1]);
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
            } else {
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
              stream.lineStart();
              stream.point(t[0][0], t[0][1], 3);
            }
          }
        }
        if (v && (!point0 || !pointEqual(point0, point1))) {
          stream.point(point1[0], point1[1]);
        }
        point0 = point1, v0 = v, c0 = c;
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
  function intersect(a, b, two) {
    var pa = cartesian(a), pb = cartesian(b);
    var n1 = [1, 0, 0], n2 = cartesianCross(pa, pb), n2n2 = cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
    if (!determinant) return !two && a;
    var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = cartesianCross(n1, n2), A = cartesianScale(n1, c1), B = cartesianScale(n2, c2);
    cartesianAddInPlace(A, B);
    var u = n1xn2, w = cartesianDot(A, u), uu = cartesianDot(u, u), t2 = w * w - uu * (cartesianDot(A, A) - 1);
    if (t2 < 0) return;
    var t = sqrt(t2), q = cartesianScale(u, (-w - t) / uu);
    cartesianAddInPlace(q, A);
    q = spherical(q);
    if (!two) return q;
    var lambda02 = a[0], lambda1 = b[0], phi0 = a[1], phi1 = b[1], z;
    if (lambda1 < lambda02) z = lambda02, lambda02 = lambda1, lambda1 = z;
    var delta2 = lambda1 - lambda02, polar = abs(delta2 - pi) < epsilon, meridian = polar || delta2 < epsilon;
    if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;
    if (meridian ? polar ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda02) < epsilon ? phi0 : phi1) : phi0 <= q[1] && q[1] <= phi1 : delta2 > pi ^ (lambda02 <= q[0] && q[0] <= lambda1)) {
      var q1 = cartesianScale(u, (-w + t) / uu);
      cartesianAddInPlace(q1, A);
      return [q, spherical(q1)];
    }
  }
  function code(lambda, phi) {
    var r = smallRadius ? radius : pi - radius, code2 = 0;
    if (lambda < -r) code2 |= 1;
    else if (lambda > r) code2 |= 2;
    if (phi < -r) code2 |= 4;
    else if (phi > r) code2 |= 8;
    return code2;
  }
  return clip(visible, clipLine2, interpolate2, smallRadius ? [0, -radius] : [-pi, radius - pi]);
}
function clipLine(a, b, x02, y02, x12, y12) {
  var ax = a[0], ay = a[1], bx = b[0], by = b[1], t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
  r = x02 - ax;
  if (!dx && r > 0) return;
  r /= dx;
  if (dx < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dx > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }
  r = x12 - ax;
  if (!dx && r < 0) return;
  r /= dx;
  if (dx < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dx > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }
  r = y02 - ay;
  if (!dy && r > 0) return;
  r /= dy;
  if (dy < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dy > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }
  r = y12 - ay;
  if (!dy && r < 0) return;
  r /= dy;
  if (dy < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dy > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }
  if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
  if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
  return true;
}
var clipMax = 1e9, clipMin = -clipMax;
function clipRectangle(x02, y02, x12, y12) {
  function visible(x, y) {
    return x02 <= x && x <= x12 && y02 <= y && y <= y12;
  }
  function interpolate2(from, to, direction, stream) {
    var a = 0, a1 = 0;
    if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoint(from, to) < 0 ^ direction > 0) {
      do
        stream.point(a === 0 || a === 3 ? x02 : x12, a > 1 ? y12 : y02);
      while ((a = (a + direction + 4) % 4) !== a1);
    } else {
      stream.point(to[0], to[1]);
    }
  }
  function corner(p, direction) {
    return abs(p[0] - x02) < epsilon ? direction > 0 ? 0 : 3 : abs(p[0] - x12) < epsilon ? direction > 0 ? 2 : 1 : abs(p[1] - y02) < epsilon ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
  }
  function compareIntersection2(a, b) {
    return comparePoint(a.x, b.x);
  }
  function comparePoint(a, b) {
    var ca = corner(a, 1), cb = corner(b, 1);
    return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
  }
  return function(stream) {
    var activeStream = stream, bufferStream = clipBuffer(), segments, polygon, ring, x__, y__, v__, x_, y_, v_, first, clean;
    var clipStream = {
      point,
      lineStart,
      lineEnd,
      polygonStart,
      polygonEnd
    };
    function point(x, y) {
      if (visible(x, y)) activeStream.point(x, y);
    }
    function polygonInside() {
      var winding = 0;
      for (var i = 0, n = polygon.length; i < n; ++i) {
        for (var ring2 = polygon[i], j = 1, m = ring2.length, point2 = ring2[0], a0, a1, b0 = point2[0], b1 = point2[1]; j < m; ++j) {
          a0 = b0, a1 = b1, point2 = ring2[j], b0 = point2[0], b1 = point2[1];
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
      clipStream.point = linePoint;
      if (polygon) polygon.push(ring = []);
      first = true;
      v_ = false;
      x_ = y_ = NaN;
    }
    function lineEnd() {
      if (segments) {
        linePoint(x__, y__);
        if (v__ && v_) bufferStream.rejoin();
        segments.push(bufferStream.result());
      }
      clipStream.point = point;
      if (v_) activeStream.lineEnd();
    }
    function linePoint(x, y) {
      var v = visible(x, y);
      if (polygon) ring.push([x, y]);
      if (first) {
        x__ = x, y__ = y, v__ = v;
        first = false;
        if (v) {
          activeStream.lineStart();
          activeStream.point(x, y);
        }
      } else {
        if (v && v_) activeStream.point(x, y);
        else {
          var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))], b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
          if (clipLine(a, b, x02, y02, x12, y12)) {
            if (!v_) {
              activeStream.lineStart();
              activeStream.point(a[0], a[1]);
            }
            activeStream.point(b[0], b[1]);
            if (!v) activeStream.lineEnd();
            clean = false;
          } else if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
            clean = false;
          }
        }
      }
      x_ = x, y_ = y, v_ = v;
    }
    return clipStream;
  };
}
const identity$2 = (x) => x;
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
    var area = areaSum / 2;
    areaSum = new Adder();
    return area;
  }
};
function areaRingStart() {
  areaStream.point = areaPointFirst;
}
function areaPointFirst(x, y) {
  areaStream.point = areaPoint;
  x00$2 = x0$3 = x, y00$2 = y0$3 = y;
}
function areaPoint(x, y) {
  areaRingSum.add(y0$3 * x - x0$3 * y);
  x0$3 = x, y0$3 = y;
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
    var bounds = [[x0$2, y0$2], [x1, y1]];
    x1 = y1 = -(y0$2 = x0$2 = Infinity);
    return bounds;
  }
};
function boundsPoint(x, y) {
  if (x < x0$2) x0$2 = x;
  if (x > x1) x1 = x;
  if (y < y0$2) y0$2 = y;
  if (y > y1) y1 = y;
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
    var centroid = Z2 ? [X2 / Z2, Y2 / Z2] : Z1 ? [X1 / Z1, Y1 / Z1] : Z0 ? [X0 / Z0, Y0 / Z0] : [NaN, NaN];
    X0 = Y0 = Z0 = X1 = Y1 = Z1 = X2 = Y2 = Z2 = 0;
    return centroid;
  }
};
function centroidPoint(x, y) {
  X0 += x;
  Y0 += y;
  ++Z0;
}
function centroidLineStart() {
  centroidStream.point = centroidPointFirstLine;
}
function centroidPointFirstLine(x, y) {
  centroidStream.point = centroidPointLine;
  centroidPoint(x0$1 = x, y0$1 = y);
}
function centroidPointLine(x, y) {
  var dx = x - x0$1, dy = y - y0$1, z = sqrt(dx * dx + dy * dy);
  X1 += z * (x0$1 + x) / 2;
  Y1 += z * (y0$1 + y) / 2;
  Z1 += z;
  centroidPoint(x0$1 = x, y0$1 = y);
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
function centroidPointFirstRing(x, y) {
  centroidStream.point = centroidPointRing;
  centroidPoint(x00$1 = x0$1 = x, y00$1 = y0$1 = y);
}
function centroidPointRing(x, y) {
  var dx = x - x0$1, dy = y - y0$1, z = sqrt(dx * dx + dy * dy);
  X1 += z * (x0$1 + x) / 2;
  Y1 += z * (y0$1 + y) / 2;
  Z1 += z;
  z = y0$1 * x - x0$1 * y;
  X2 += z * (x0$1 + x);
  Y2 += z * (y0$1 + y);
  Z2 += z * 3;
  centroidPoint(x0$1 = x, y0$1 = y);
}
function PathContext(context) {
  this._context = context;
}
PathContext.prototype = {
  _radius: 4.5,
  pointRadius: function(_) {
    return this._radius = _, this;
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
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._context.moveTo(x, y);
        this._point = 1;
        break;
      }
      case 1: {
        this._context.lineTo(x, y);
        break;
      }
      default: {
        this._context.moveTo(x + this._radius, y);
        this._context.arc(x, y, this._radius, 0, tau);
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
    var length = +lengthSum;
    lengthSum = new Adder();
    return length;
  }
};
function lengthPointFirst(x, y) {
  lengthStream.point = lengthPoint;
  x00 = x0 = x, y00 = y0 = y;
}
function lengthPoint(x, y) {
  x0 -= x, y0 -= y;
  lengthSum.add(sqrt(x0 * x0 + y0 * y0));
  x0 = x, y0 = y;
}
let cacheDigits, cacheAppend, cacheRadius, cacheCircle;
class PathString {
  constructor(digits) {
    this._append = digits == null ? append : appendRound(digits);
    this._radius = 4.5;
    this._ = "";
  }
  pointRadius(_) {
    this._radius = +_;
    return this;
  }
  polygonStart() {
    this._line = 0;
  }
  polygonEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {
    if (this._line === 0) this._ += "Z";
    this._point = NaN;
  }
  point(x, y) {
    switch (this._point) {
      case 0: {
        this._append`M${x},${y}`;
        this._point = 1;
        break;
      }
      case 1: {
        this._append`L${x},${y}`;
        break;
      }
      default: {
        this._append`M${x},${y}`;
        if (this._radius !== cacheRadius || this._append !== cacheAppend) {
          const r = this._radius;
          const s = this._;
          this._ = "";
          this._append`m0,${r}a${r},${r} 0 1,1 0,${-2 * r}a${r},${r} 0 1,1 0,${2 * r}z`;
          cacheRadius = r;
          cacheAppend = this._append;
          cacheCircle = this._;
          this._ = s;
        }
        this._ += cacheCircle;
        break;
      }
    }
  }
  result() {
    const result = this._;
    this._ = "";
    return result.length ? result : null;
  }
}
function append(strings) {
  let i = 1;
  this._ += strings[0];
  for (const j = strings.length; i < j; ++i) {
    this._ += arguments[i] + strings[i];
  }
}
function appendRound(digits) {
  const d = Math.floor(digits);
  if (!(d >= 0)) throw new RangeError(`invalid digits: ${digits}`);
  if (d > 15) return append;
  if (d !== cacheDigits) {
    const k = 10 ** d;
    cacheDigits = d;
    cacheAppend = function append2(strings) {
      let i = 1;
      this._ += strings[0];
      for (const j = strings.length; i < j; ++i) {
        this._ += Math.round(arguments[i] * k) / k + strings[i];
      }
    };
  }
  return cacheAppend;
}
function geoPath(projection2, context) {
  let digits = 3, pointRadius = 4.5, projectionStream, contextStream;
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
  path.projection = function(_) {
    if (!arguments.length) return projection2;
    projectionStream = _ == null ? (projection2 = null, identity$2) : (projection2 = _).stream;
    return path;
  };
  path.context = function(_) {
    if (!arguments.length) return context;
    contextStream = _ == null ? (context = null, new PathString(digits)) : new PathContext(context = _);
    if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
    return path;
  };
  path.pointRadius = function(_) {
    if (!arguments.length) return pointRadius;
    pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
    return path;
  };
  path.digits = function(_) {
    if (!arguments.length) return digits;
    if (_ == null) digits = null;
    else {
      const d = Math.floor(_);
      if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`);
      digits = d;
    }
    if (context === null) contextStream = new PathString(digits);
    return path;
  };
  return path.projection(projection2).digits(digits).context(context);
}
function transformer(methods) {
  return function(stream) {
    var s = new TransformStream();
    for (var key in methods) s[key] = methods[key];
    s.stream = stream;
    return s;
  };
}
function TransformStream() {
}
TransformStream.prototype = {
  constructor: TransformStream,
  point: function(x, y) {
    this.stream.point(x, y);
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
function fitExtent(projection2, extent, object2) {
  return fit(projection2, function(b) {
    var w = extent[1][0] - extent[0][0], h = extent[1][1] - extent[0][1], k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])), x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2, y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
    projection2.scale(150 * k).translate([x, y]);
  }, object2);
}
function fitSize(projection2, size, object2) {
  return fitExtent(projection2, [[0, 0], size], object2);
}
function fitWidth(projection2, width, object2) {
  return fit(projection2, function(b) {
    var w = +width, k = w / (b[1][0] - b[0][0]), x = (w - k * (b[1][0] + b[0][0])) / 2, y = -k * b[0][1];
    projection2.scale(150 * k).translate([x, y]);
  }, object2);
}
function fitHeight(projection2, height, object2) {
  return fit(projection2, function(b) {
    var h = +height, k = h / (b[1][1] - b[0][1]), x = -k * b[0][0], y = (h - k * (b[1][1] + b[0][1])) / 2;
    projection2.scale(150 * k).translate([x, y]);
  }, object2);
}
var maxDepth = 16, cosMinDistance = cos(30 * radians);
function resample(project, delta2) {
  return +delta2 ? resample$1(project, delta2) : resampleNone(project);
}
function resampleNone(project) {
  return transformer({
    point: function(x, y) {
      x = project(x, y);
      this.stream.point(x[0], x[1]);
    }
  });
}
function resample$1(project, delta2) {
  function resampleLineTo(x02, y02, lambda02, a0, b0, c0, x12, y12, lambda1, a1, b1, c1, depth, stream) {
    var dx = x12 - x02, dy = y12 - y02, d2 = dx * dx + dy * dy;
    if (d2 > 4 * delta2 && depth--) {
      var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = sqrt(a * a + b * b + c * c), phi2 = asin(c /= m), lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda02 - lambda1) < epsilon ? (lambda02 + lambda1) / 2 : atan2(b, a), p = project(lambda2, phi2), x2 = p[0], y2 = p[1], dx2 = x2 - x02, dy2 = y2 - y02, dz = dy * dx2 - dx * dy2;
      if (dz * dz / d2 > delta2 || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
        resampleLineTo(x02, y02, lambda02, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
        stream.point(x2, y2);
        resampleLineTo(x2, y2, lambda2, a, b, c, x12, y12, lambda1, a1, b1, c1, depth, stream);
      }
    }
  }
  return function(stream) {
    var lambda002, x002, y002, a00, b00, c00, lambda02, x02, y02, a0, b0, c0;
    var resampleStream = {
      point,
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
    function point(x, y) {
      x = project(x, y);
      stream.point(x[0], x[1]);
    }
    function lineStart() {
      x02 = NaN;
      resampleStream.point = linePoint;
      stream.lineStart();
    }
    function linePoint(lambda, phi) {
      var c = cartesian([lambda, phi]), p = project(lambda, phi);
      resampleLineTo(x02, y02, lambda02, a0, b0, c0, x02 = p[0], y02 = p[1], lambda02 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
      stream.point(x02, y02);
    }
    function lineEnd() {
      resampleStream.point = point;
      stream.lineEnd();
    }
    function ringStart() {
      lineStart();
      resampleStream.point = ringPoint;
      resampleStream.lineEnd = ringEnd;
    }
    function ringPoint(lambda, phi) {
      linePoint(lambda002 = lambda, phi), x002 = x02, y002 = y02, a00 = a0, b00 = b0, c00 = c0;
      resampleStream.point = linePoint;
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
  point: function(x, y) {
    this.stream.point(x * radians, y * radians);
  }
});
function transformRotate(rotate) {
  return transformer({
    point: function(x, y) {
      var r = rotate(x, y);
      return this.stream.point(r[0], r[1]);
    }
  });
}
function scaleTranslate(k, dx, dy, sx, sy) {
  function transform2(x, y) {
    x *= sx;
    y *= sy;
    return [dx + k * x, dy - k * y];
  }
  transform2.invert = function(x, y) {
    return [(x - dx) / k * sx, (dy - y) / k * sy];
  };
  return transform2;
}
function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
  if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
  var cosAlpha = cos(alpha), sinAlpha = sin(alpha), a = cosAlpha * k, b = sinAlpha * k, ai = cosAlpha / k, bi = sinAlpha / k, ci = (sinAlpha * dy - cosAlpha * dx) / k, fi = (sinAlpha * dx + cosAlpha * dy) / k;
  function transform2(x, y) {
    x *= sx;
    y *= sy;
    return [a * x - b * y + dx, dy - b * x - a * y];
  }
  transform2.invert = function(x, y) {
    return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
  };
  return transform2;
}
function projection(project) {
  return projectionMutator(function() {
    return project;
  })();
}
function projectionMutator(projectAt) {
  var project, k = 150, x = 480, y = 250, lambda = 0, phi = 0, deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, alpha = 0, sx = 1, sy = 1, theta = null, preclip = clipAntimeridian, x02 = null, y02, x12, y12, postclip = identity$2, delta2 = 0.5, projectResample, projectTransform, projectRotateTransform, cache, cacheStream;
  function projection2(point) {
    return projectRotateTransform(point[0] * radians, point[1] * radians);
  }
  function invert(point) {
    point = projectRotateTransform.invert(point[0], point[1]);
    return point && [point[0] * degrees$1, point[1] * degrees$1];
  }
  projection2.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
  };
  projection2.preclip = function(_) {
    return arguments.length ? (preclip = _, theta = void 0, reset()) : preclip;
  };
  projection2.postclip = function(_) {
    return arguments.length ? (postclip = _, x02 = y02 = x12 = y12 = null, reset()) : postclip;
  };
  projection2.clipAngle = function(_) {
    return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees$1;
  };
  projection2.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x02 = y02 = x12 = y12 = null, identity$2) : clipRectangle(x02 = +_[0][0], y02 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reset()) : x02 == null ? null : [[x02, y02], [x12, y12]];
  };
  projection2.scale = function(_) {
    return arguments.length ? (k = +_, recenter()) : k;
  };
  projection2.translate = function(_) {
    return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
  };
  projection2.center = function(_) {
    return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees$1, phi * degrees$1];
  };
  projection2.rotate = function(_) {
    return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees$1, deltaPhi * degrees$1, deltaGamma * degrees$1];
  };
  projection2.angle = function(_) {
    return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees$1;
  };
  projection2.reflectX = function(_) {
    return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
  };
  projection2.reflectY = function(_) {
    return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
  };
  projection2.precision = function(_) {
    return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
  };
  projection2.fitExtent = function(extent, object2) {
    return fitExtent(projection2, extent, object2);
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
    var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)), transform2 = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
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
function mercatorRaw(lambda, phi) {
  return [lambda, log(tan((halfPi + phi) / 2))];
}
mercatorRaw.invert = function(x, y) {
  return [x, 2 * atan(exp(y)) - halfPi];
};
function geoMercator() {
  return mercatorProjection(mercatorRaw).scale(961 / tau);
}
function mercatorProjection(project) {
  var m = projection(project), center = m.center, scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, x02 = null, y02, x12, y12;
  m.scale = function(_) {
    return arguments.length ? (scale(_), reclip()) : scale();
  };
  m.translate = function(_) {
    return arguments.length ? (translate(_), reclip()) : translate();
  };
  m.center = function(_) {
    return arguments.length ? (center(_), reclip()) : center();
  };
  m.clipExtent = function(_) {
    return arguments.length ? (_ == null ? x02 = y02 = x12 = y12 = null : (x02 = +_[0][0], y02 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reclip()) : x02 == null ? null : [[x02, y02], [x12, y12]];
  };
  function reclip() {
    var k = pi * scale(), t = m(rotation(m.rotate()).invert([0, 0]));
    return clipExtent(x02 == null ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw ? [[Math.max(t[0] - k, x02), y02], [Math.min(t[0] + k, x12), y12]] : [[x02, Math.max(t[1] - k, y02)], [x12, Math.min(t[1] + k, y12)]]);
  }
  return reclip();
}
const useFullscreen = () => useQueryState(
  "fullscreen",
  parseAsBoolean.withDefault(false).withOptions({
    history: "push"
  })
);
const Fullscreen = (props) => {
  const [isFullscreen] = useFullscreen();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        isFullscreen ? "fixed inset-0 z-50 overflow-auto bg-def-200" : "col min-h-full w-full"
      ),
      children: props.children
    }
  );
};
const FullscreenClose = () => {
  const [fullscreen, setIsFullscreen] = useFullscreen();
  const isFullscreenDebounced = useDebounce(fullscreen, 1e3);
  const [visible, setVisible] = reactExports.useState(false);
  const ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    let timer2;
    const unsub = distExports.bind(window, {
      type: "mousemove",
      listener(ev) {
        if (fullscreen) {
          setVisible(true);
          clearTimeout(timer2);
          timer2 = setTimeout(() => {
            if (!ref.current?.contains(ev.target)) {
              setVisible(false);
            }
          }, 500);
        }
      }
    });
    return () => {
      unsub();
      clearTimeout(timer2);
    };
  }, [fullscreen]);
  if (!fullscreen) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed top-0 bottom-0 z-50 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltiper, { asChild: true, content: "Exit full screen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      className: cn(
        "flex h-20 w-20 -translate-x-20 items-center justify-center rounded-full bg-foreground transition-transform",
        visible && isFullscreenDebounced && "-translate-x-10"
      ),
      onClick: () => {
        setIsFullscreen(false);
      },
      ref,
      type: "button",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "ml-6 text-background" })
    }
  ) }) });
};
function LiveCounter({ projectId }) {
  const counter = useLiveCounter({ projectId });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-6xl tabular-nums tracking-tight", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedNumber, { value: counter.debounced }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-medium text-2xs text-muted-foreground uppercase tracking-widest", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Ping, {}),
      "Online now"
    ] })
  ] });
}
const FEED_RELEASE_MS = 400;
const FEED_MAX_ITEMS = 24;
const FEED_SEEN_LIMIT = 1e3;
const FEED_CLOCK_MS = 1e4;
const ISLAND_TOP_COUNT = 5;
function useStoredToggle(key, defaultValue) {
  const [value, setValue] = reactExports.useState(defaultValue);
  reactExports.useEffect(() => {
    const stored = window.localStorage.getItem(key);
    if (stored !== null) {
      setValue(stored === "true");
    }
  }, [key]);
  const toggle = reactExports.useCallback(() => {
    setValue((previous) => {
      const next = !previous;
      window.localStorage.setItem(key, String(next));
      return next;
    });
  }, [key]);
  return [value, toggle];
}
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
function formatAge(date, now2) {
  const seconds = Math.max(
    0,
    Math.round((now2 - new Date(date).getTime()) / 1e3)
  );
  if (seconds < SECONDS_PER_MINUTE) {
    return "now";
  }
  if (seconds < SECONDS_PER_HOUR) {
    return `${Math.floor(seconds / SECONDS_PER_MINUTE)}m`;
  }
  return `${Math.floor(seconds / SECONDS_PER_HOUR)}h`;
}
function LiveFeed({
  title,
  storageKey,
  items,
  renderItem,
  className
}) {
  const [isOpen, toggleOpen] = useStoredToggle(
    `realtime-feed-${storageKey}-open`,
    true
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      "aria-label": title,
      className: cn(
        "flex min-h-0 flex-col gap-2 overflow-hidden",
        isOpen && "flex-1 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            "aria-expanded": isOpen,
            className: "pointer-events-auto flex items-center gap-1 font-medium text-2xs text-muted-foreground uppercase tracking-widest transition-colors hover:text-foreground",
            onClick: toggleOpen,
            title: isOpen ? `Hide ${title.toLowerCase()}` : `Show ${title.toLowerCase()}`,
            type: "button",
            children: [
              title,
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ChevronDown,
                {
                  className: cn(
                    "size-3 transition-transform",
                    isOpen ? "rotate-0" : "-rotate-90"
                  )
                }
              )
            ]
          }
        ) }),
        isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-col gap-1", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "animate-live-feed-in", children: renderItem(item) }, item.id)) }) : null
      ]
    }
  );
}
function LiveFeedItem({
  sessionId,
  icon,
  title,
  detail,
  trailing
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    ProjectLink,
    {
      className: "pointer-events-auto flex h-7 items-center gap-2 rounded-md border bg-card/70 px-2 text-xs backdrop-blur-md transition-colors hover:bg-card",
      params: { sessionId },
      to: "/sessions/$sessionId",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex size-4 shrink-0 items-center justify-center", children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-[55%] shrink-0 truncate font-medium", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 truncate text-muted-foreground", children: detail }),
        trailing ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex shrink-0 items-center gap-1.5 text-muted-foreground tabular-nums", children: trailing }) : null
      ]
    }
  );
}
function useLiveFeed(items) {
  const [shown, setShown] = reactExports.useState([]);
  const seenIds = reactExports.useRef(/* @__PURE__ */ new Set());
  const queue = reactExports.useRef([]);
  const isPrimed = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!items) {
      return;
    }
    if (!isPrimed.current) {
      isPrimed.current = true;
      seenIds.current = new Set(items.map((item) => item.id));
      setShown(items.slice(0, FEED_MAX_ITEMS));
      return;
    }
    if (seenIds.current.size > FEED_SEEN_LIMIT) {
      seenIds.current = new Set(items.map((item) => item.id));
      return;
    }
    const arrivals = items.filter((item) => !seenIds.current.has(item.id));
    for (const item of arrivals) {
      seenIds.current.add(item.id);
    }
    queue.current = [...queue.current, ...arrivals.reverse()].slice(
      -FEED_MAX_ITEMS
    );
  }, [items]);
  reactExports.useEffect(() => {
    const interval2 = setInterval(() => {
      const next = queue.current.shift();
      if (next) {
        setShown((previous) => [next, ...previous].slice(0, FEED_MAX_ITEMS));
      }
    }, FEED_RELEASE_MS);
    return () => clearInterval(interval2);
  }, []);
  return shown;
}
function useNow(intervalMs) {
  const [now2, setNow] = reactExports.useState(() => Date.now());
  reactExports.useEffect(() => {
    const interval2 = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(interval2);
  }, [intervalMs]);
  return now2;
}
const PAGE_VIEW_EVENT = "screen_view";
const SESSION_EVENTS = /* @__PURE__ */ new Set(["session_start", "session_end"]);
function LiveEventFeed({ projectId }) {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.realtime.activeSessions.queryOptions({ projectId })
  );
  const visibleEvents = reactExports.useMemo(
    () => query.data?.filter((event) => !SESSION_EVENTS.has(event.name)),
    [query.data]
  );
  const events = useLiveFeed(visibleEvents);
  const now2 = useNow(FEED_CLOCK_MS);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    LiveFeed,
    {
      items: events,
      renderItem: (event) => {
        const isPageView = event.name === PAGE_VIEW_EVENT;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          LiveFeedItem,
          {
            detail: event.city || getCountry(event.country),
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(EventIcon, { className: "size-4", name: event.name, size: "xs" }),
            sessionId: event.sessionId,
            title: isPageView ? event.path || "/" : event.name,
            trailing: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: event.country }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatAge(event.createdAt, now2) })
            ] })
          }
        );
      },
      storageKey: "events",
      title: "Events"
    }
  );
}
function LiveSessionFeed({ projectId }) {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.realtime.recentSessions.queryOptions({ projectId })
  );
  const sessions = useLiveFeed(query.data);
  const now2 = useNow(FEED_CLOCK_MS);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    LiveFeed,
    {
      items: sessions,
      renderItem: (session) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        LiveFeedItem,
        {
          detail: session.path || void 0,
          icon: session.country ? /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: session.country }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "size-3.5 text-muted-foreground" }),
          sessionId: session.sessionId,
          title: session.city || getCountry(session.country) || "Unknown location",
          trailing: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: session.referrerName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: session.device }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatAge(session.createdAt, now2) })
          ] })
        }
      ),
      storageKey: "sessions",
      title: "New sessions"
    }
  );
}
function LiveTopIsland({ projectId }) {
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.realtime.topSources.queryOptions({ projectId })
  );
  const referrers = (data?.referrers ?? []).slice(0, ISLAND_TOP_COUNT).map((row) => ({
    key: row.name,
    icon: row.name,
    label: row.name,
    count: row.sessions
  }));
  const countries = (data?.countries ?? []).slice(0, ISLAND_TOP_COUNT).map((row) => ({
    key: row.country,
    icon: row.country,
    label: getCountry(row.country) ?? row.country,
    count: row.sessions
  }));
  if (referrers.length === 0 && countries.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-auto flex max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-2xl border bg-card/85 px-4 py-3 shadow-lg backdrop-blur-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(IslandRow, { items: referrers, label: "Referrers" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(IslandRow, { items: countries, label: "Countries" })
  ] });
}
function IslandRow({ label, items }) {
  const number = useNumber();
  if (items.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-20 shrink-0 font-medium text-2xs text-muted-foreground uppercase tracking-widest", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "li",
      {
        className: "flex items-center gap-1.5 whitespace-nowrap",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: item.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground tabular-nums", children: number.format(item.count) })
        ]
      },
      item.key
    )) })
  ] });
}
const BAR_COLOR = "var(--color-emerald-500)";
const BAR_RADIUS = 1;
const BAR_GAP = 0.25;
const NO_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };
function formatMinute(minute) {
  return new Date(minute).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
function LiveVisitorBars({ projectId }) {
  const trpc = useTRPC();
  const number = useNumber();
  const { data } = useQuery(
    trpc.realtime.histogram.queryOptions({ projectId })
  );
  const points = (data?.minutes ?? []).map((point) => ({
    ...point,
    time: formatMinute(point.minute)
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-auto flex flex-col gap-2 rounded-xl border bg-card/80 p-3 shadow-sm backdrop-blur-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-2xs text-muted-foreground uppercase tracking-widest", children: "Last 30 minutes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-sm tabular-nums", children: [
        number.format(data?.totalSessions ?? 0),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 font-normal text-muted-foreground text-xs", children: "sessions" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-full", children: points.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      BarChart,
      {
        animationDuration: 0,
        aspectRatio: "auto",
        barGap: BAR_GAP,
        className: "h-full",
        data: points,
        margin: NO_MARGIN,
        xDataKey: "time",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Bar,
            {
              animate: false,
              dataKey: "visitors",
              fill: BAR_COLOR,
              lineCap: BAR_RADIUS
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            OPChartTooltip,
            {
              datePill: false,
              rows: (point) => [
                {
                  color: BAR_COLOR,
                  label: "Visitors",
                  value: point.visitors,
                  format: number.format
                }
              ],
              showDots: false,
              title: (point) => point.time
            }
          )
        ]
      }
    ) : null })
  ] });
}
function RealtimeLiveOverlays({ projectId }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 z-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-6 bottom-36 left-6 hidden w-72 flex-col gap-6 md:flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiveCounter, { projectId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiveSessionFeed, { projectId })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-6 right-6 bottom-36 hidden w-72 flex-col gap-6 md:flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiveVisitorBars, { projectId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiveEventFeed, { projectId })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-6 flex justify-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LiveTopIsland, { projectId }) })
  ] });
}
const MAP_MIN_ZOOM = 1;
const MAP_MAX_ZOOM = 24;
const MAP_ZOOM_BUTTON_FACTOR = 1.8;
const MAP_ZOOM_ANIMATION_MS = 300;
const NIGHT_REFRESH_MS = 6e4;
const LABEL_MIN_SCREEN_AREA = 9e3;
const LABEL_MAX_COUNT = 40;
const NIGHT_FEATHER_DEGREES = 18;
const NIGHT_FEATHER_STEPS = 12;
const NIGHT_MAX_ALPHA_DARK = 0.22;
const NIGHT_MAX_ALPHA_LIGHT = 0.05;
const MARKER_MIN_RADIUS = 3.5;
const MARKER_MAX_RADIUS = 10;
const MARKER_RADIUS_PER_SQRT_VISITOR = 1.2;
const MARKER_HIT_RADIUS = 12;
const MARKER_STROKE_WIDTH = 1.5;
const MARKER_ACTIVE_RING_GAP = 4;
const MARKER_VIEWPORT_MARGIN = 20;
const MARKER_PULSE_LIMIT = 40;
const MARKER_PULSE_DURATION_MS = 2400;
const MARKER_PULSE_SPREAD = 3.2;
const MARKER_PULSE_ALPHA = 0.45;
const RASTER_SETTLE_MS = 120;
const RASTER_DETAIL_MARGIN = 0.25;
const RASTER_DETAIL_MAX_PIXELS = 12e6;
const RASTER_MAX_PIXEL_RATIO = 2;
const RASTER_FINE_DETAIL_ZOOM = 3;
const BORDER_BUCKET_DEGREES = 10;
const RESIZE_SETTLE_MS = 150;
const PLACE_MAX_LOCATIONS = 200;
const DETAIL_CARD_WIDTH = 380;
const DETAIL_CARD_MIN_HEIGHT = 340;
const DETAIL_CARD_INSET = 12;
const DETAIL_CARD_GAP = 20;
const DETAIL_CARD_ANCHOR_OFFSET = 40;
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
const regionDisplayNames = typeof Intl !== "undefined" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
function normalizeLocationValue(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : void 0;
}
function isValidPoint(point) {
  return Number.isFinite(point.lat) && Number.isFinite(point.long);
}
function getPlaceId(point) {
  const country = normalizeLocationValue(point.country) ?? "";
  const city = normalizeLocationValue(point.city);
  if (city) {
    return `${country}:${city}`;
  }
  return `${country}:${point.long.toFixed(2)}:${point.lat.toFixed(2)}`;
}
function groupPointsByPlace(points) {
  const places = /* @__PURE__ */ new Map();
  for (const point of points) {
    if (!isValidPoint(point)) {
      continue;
    }
    const id2 = getPlaceId(point);
    const location = {
      city: point.city,
      country: point.country,
      lat: point.lat,
      long: point.long
    };
    const place = places.get(id2);
    if (!place) {
      places.set(id2, {
        id: id2,
        label: getPointLabel(point),
        count: point.count,
        lat: point.lat,
        long: point.long,
        locations: [location]
      });
      continue;
    }
    const total = place.count + point.count;
    place.lat = (place.lat * place.count + point.lat * point.count) / total;
    place.long = (place.long * place.count + point.long * point.count) / total;
    place.count = total;
    if (place.locations.length < PLACE_MAX_LOCATIONS) {
      place.locations.push(location);
    }
  }
  return [...places.values()];
}
function formatCountryLabel(country) {
  const normalized = normalizeLocationValue(country);
  if (!normalized) {
    return void 0;
  }
  if (!COUNTRY_CODE_PATTERN.test(normalized)) {
    return normalized;
  }
  return regionDisplayNames?.of(normalized) ?? normalized;
}
function getPointLabel(point) {
  const city = normalizeLocationValue(point.city);
  const country = formatCountryLabel(point.country);
  return [city, country].filter(Boolean).join(", ") || "Unknown location";
}
function getMarkerRadius(count) {
  const radius = MARKER_MIN_RADIUS + Math.sqrt(count) * MARKER_RADIUS_PER_SQRT_VISITOR;
  return Math.min(MARKER_MAX_RADIUS, radius);
}
function getBadgeOverlayPosition(marker, size) {
  const overlayWidth = Math.min(
    DETAIL_CARD_WIDTH,
    size.width - DETAIL_CARD_INSET * 2
  );
  const rightOfDot = marker.screenPoint.x + DETAIL_CARD_GAP;
  const leftOfDot = marker.screenPoint.x - DETAIL_CARD_GAP - overlayWidth;
  const fitsOnRight = rightOfDot + overlayWidth <= size.width - DETAIL_CARD_INSET;
  const left = Math.max(
    DETAIL_CARD_INSET,
    fitsOnRight ? rightOfDot : leftOfDot
  );
  const top = Math.max(
    DETAIL_CARD_INSET,
    Math.min(
      marker.screenPoint.y - DETAIL_CARD_ANCHOR_OFFSET,
      size.height - DETAIL_CARD_MIN_HEIGHT
    )
  );
  return { left, overlayWidth, top };
}
function getProfileDisplayName(profile) {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  return name || profile.email || profile.id;
}
function MapBadgeDetailCard({
  marker,
  onClose,
  panelRef,
  projectId,
  size
}) {
  const trpc = useTRPC();
  const input = {
    detailScope: marker.detailScope,
    projectId,
    locations: marker.locations
  };
  const query = useQuery(
    trpc.realtime.mapBadgeDetails.queryOptions(input, {
      enabled: input.locations.length > 0
    })
  );
  const position = getBadgeOverlayPosition(marker, size);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      animate: { opacity: 1, y: 0 },
      className: "absolute z-[90]",
      initial: { opacity: 0, y: -8 },
      onMouseDown: (event) => event.stopPropagation(),
      ref: panelRef,
      style: {
        left: position.left,
        top: position.top,
        width: position.overlayWidth
      },
      transition: { duration: 0.18 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          animate: { opacity: 1 },
          className: "overflow-hidden rounded-2xl border border-white/10 bg-background shadow-2xl",
          initial: { opacity: 0.98 },
          transition: { duration: 0.18 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 border-b p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-muted-foreground text-xs uppercase tracking-wide", children: "Online now" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-lg", style: { fontWeight: 600 }, children: marker.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "mt-1 text-muted-foreground",
                    style: { fontSize: 13 },
                    children: [
                      query.data?.summary.totalSessions ?? marker.count,
                      " sessions",
                      query.data?.summary.totalProfiles ? ` • ${query.data.summary.totalProfiles} profiles` : ""
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground",
                  onClick: onClose,
                  type: "button",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 border-b p-4 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-1 rounded-lg bg-def-200 p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs", children: "Locations" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: query.data?.summary.totalLocations ?? marker.locations.length })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-1 rounded-lg bg-def-200 p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs", children: "Countries" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: query.data?.summary.totalCountries ?? 0 })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-1 rounded-lg bg-def-200 p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs", children: "Cities" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: query.data?.summary.totalCities ?? 0 })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[420px] space-y-4 overflow-y-auto p-4", children: query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 animate-pulse rounded-xl bg-def-200" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 animate-pulse rounded-xl bg-def-200" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 animate-pulse rounded-xl bg-def-200" })
            ] }) : query.data ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 font-medium text-sm", children: "Top referrers" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: query.data.topReferrers.length > 0 ? query.data.topReferrers.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex items-center justify-between gap-2 text-sm",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: item.referrerName }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: item.referrerName.replaceAll("https://", "").replaceAll("http://", "").replaceAll("www.", "") || "(Not set)" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: item.count })
                      ]
                    },
                    item.referrerName || "(not set)"
                  )) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: "No data" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 font-medium text-sm", children: "Top events" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: query.data.topEvents.length > 0 ? query.data.topEvents.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex items-center justify-between gap-2 text-sm",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: item.name }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: item.count })
                      ]
                    },
                    item.name
                  )) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: "No data" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 rounded-xl border p-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 font-medium text-sm", children: "Top paths" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: query.data.topPaths.length > 0 ? query.data.topPaths.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex items-center justify-between gap-2 text-sm",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: item.path || "(Not set)" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: item.count })
                      ]
                    },
                    `${item.origin}${item.path}`
                  )) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: "No data" }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 font-medium text-sm", children: "Recent sessions" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: query.data.recentProfiles.length > 0 ? query.data.recentProfiles.map((profile) => {
                  const link2 = profile.profileId ? {
                    to: "/profiles/$profileId",
                    params: { profileId: profile.profileId }
                  } : {
                    to: "/sessions/$sessionId",
                    params: { sessionId: profile.sessionId }
                  };
                  return /* @__PURE__ */ reactExports.createElement(
                    ProjectLink,
                    {
                      className: "-mx-1 flex items-center gap-3 rounded-lg px-1 py-0.5 transition-colors hover:bg-def-200",
                      ...link2,
                      key: profile.profileId ? `p:${profile.profileId}` : `s:${profile.sessionId}`
                    },
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ProfileAvatar,
                      {
                        avatar: profile.avatar,
                        email: profile.email,
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        size: "sm"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "truncate",
                          style: { fontSize: 14, fontWeight: 500 },
                          children: getProfileDisplayName(profile)
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "truncate text-muted-foreground",
                          style: { fontSize: 12 },
                          children: profile.latestPath || profile.latestEvent
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "text-right text-muted-foreground",
                        style: { fontSize: 12 },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: [profile.city, profile.country].filter(Boolean).join(", ") || "Unknown" })
                      }
                    )
                  );
                }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: "No recent sessions" }) })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: "Could not load badge details." }) })
          ]
        }
      )
    }
  );
}
function MapBadgeDetails({
  containerRef
}) {
  const dispatch2 = useDispatch();
  const panelRef = reactExports.useRef(null);
  const { open, marker, projectId } = useSelector(
    (state) => state.realtimeMapBadge
  );
  const [overlaySize, setOverlaySize] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!(open && marker)) {
      return;
    }
    const onPointerDown = (event) => {
      if (!panelRef.current?.contains(event.target)) {
        dispatch2(closeMapBadgeDetails());
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        dispatch2(closeMapBadgeDetails());
      }
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dispatch2, marker, open]);
  reactExports.useEffect(() => {
    const measure = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      setOverlaySize({ width: rect.width, height: rect.height });
    };
    measure();
    return distExports.bind(window, {
      type: "resize",
      listener: measure
    });
  }, [containerRef]);
  if (!(open && marker && projectId && overlaySize)) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.button,
      {
        animate: { opacity: 1 },
        className: "fixed inset-0 z-[80] bg-black/10",
        exit: { opacity: 0 },
        initial: { opacity: 0 },
        onClick: () => dispatch2(closeMapBadgeDetails()),
        type: "button"
      },
      "map-badge-backdrop"
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MapBadgeDetailCard,
      {
        marker,
        onClose: () => dispatch2(closeMapBadgeDetails()),
        panelRef,
        projectId,
        size: overlaySize
      },
      "map-badge-panel"
    )
  ] });
}
var xhtml = "http://www.w3.org/1999/xhtml";
const namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function namespace(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? { space: namespaces[prefix], local: name } : name;
}
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator(name) {
  var fullname = namespace(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}
function none() {
}
function selector(selector2) {
  return selector2 == null ? none : function() {
    return this.querySelector(selector2);
  };
}
function selection_select(select2) {
  if (typeof select2 !== "function") select2 = selector(select2);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select2.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}
function array(x) {
  return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}
function empty() {
  return [];
}
function selectorAll(selector2) {
  return selector2 == null ? empty : function() {
    return this.querySelectorAll(selector2);
  };
}
function arrayAll(select2) {
  return function() {
    return array(select2.apply(this, arguments));
  };
}
function selection_selectAll(select2) {
  if (typeof select2 === "function") select2 = arrayAll(select2);
  else select2 = selectorAll(select2);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select2.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection$1(subgroups, parents);
}
function matcher(selector2) {
  return function() {
    return this.matches(selector2);
  };
}
function childMatcher(selector2) {
  return function(node) {
    return node.matches(selector2);
  };
}
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selection_selectChild(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}
var filter = Array.prototype.filter;
function children() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selection_selectChildren(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}
function selection_filter(match) {
  if (typeof match !== "function") match = matcher(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}
function sparse(update) {
  return new Array(update.length);
}
function selection_enter() {
  return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector2) {
    return this._parent.querySelector(selector2);
  },
  querySelectorAll: function(selector2) {
    return this._parent.querySelectorAll(selector2);
  }
};
function constant$1(x) {
  return function() {
    return x;
  };
}
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function selection_data(value, key) {
  if (!arguments.length) return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function") value = constant$1(value);
  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection$1(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data : Array.from(data);
}
function selection_exit() {
  return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
}
function selection_join(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter) enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update) update = update.selection();
  }
  if (onexit == null) exit.remove();
  else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}
function selection_merge(context) {
  var selection2 = context.selection ? context.selection() : context;
  for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge2[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection$1(merges, this._parents);
}
function selection_order() {
  for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}
function selection_sort(compare) {
  if (!compare) compare = ascending;
  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }
  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection$1(sortgroups, this._parents).order();
}
function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
function selection_call() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}
function selection_nodes() {
  return Array.from(this);
}
function selection_node() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }
  return null;
}
function selection_size() {
  let size = 0;
  for (const node of this) ++size;
  return size;
}
function selection_empty() {
  return !this.node();
}
function selection_each(callback) {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}
function attrRemove$1(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS$1(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant$1(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS$1(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction$1(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}
function attrFunctionNS$1(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function selection_attr(name, value) {
  var fullname = namespace(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS$1 : attrRemove$1 : typeof value === "function" ? fullname.local ? attrFunctionNS$1 : attrFunction$1 : fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, value));
}
function defaultView(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}
function styleRemove$1(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant$1(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction$1(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}
function selection_style(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove$1 : typeof value === "function" ? styleFunction$1 : styleConstant$1)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
}
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];
    else this[name] = v;
  };
}
function selection_property(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function selection_classed(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}
function textRemove() {
  this.textContent = "";
}
function textConstant$1(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction$1(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function selection_text(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction$1 : textConstant$1)(value)) : this.node().textContent;
}
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function selection_html(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}
function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}
function selection_raise() {
  return this.each(raise);
}
function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function selection_lower() {
  return this.each(lower);
}
function selection_append(name) {
  var create2 = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create2.apply(this, arguments));
  });
}
function constantNull() {
  return null;
}
function selection_insert(name, before) {
  var create2 = typeof name === "function" ? name : creator(name), select2 = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create2.apply(this, arguments), select2.apply(this, arguments) || null);
  });
}
function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}
function selection_remove() {
  return this.each(remove);
}
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_clone(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}
function selection_datum(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames$1(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
        this.addEventListener(o.type, o.listener = listener, o.options = options);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on) this.__on = [o];
    else on.push(o);
  };
}
function selection_on(typename, value, options) {
  var typenames = parseTypenames$1(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
  return this;
}
function dispatchEvent(node, type, params) {
  var window2 = defaultView(node), event = window2.CustomEvent;
  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window2.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}
function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}
function selection_dispatch(type, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
}
function* selection_iterator() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) yield node;
    }
  }
}
var root = [null];
function Selection$1(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection$1([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection$1.prototype = selection.prototype = {
  constructor: Selection$1,
  select: selection_select,
  selectAll: selection_selectAll,
  selectChild: selection_selectChild,
  selectChildren: selection_selectChildren,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  join: selection_join,
  merge: selection_merge,
  selection: selection_selection,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  clone: selection_clone,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch,
  [Symbol.iterator]: selection_iterator
};
function select(selector2) {
  return typeof selector2 === "string" ? new Selection$1([[document.querySelector(selector2)]], [document.documentElement]) : new Selection$1([[selector2]], root);
}
function sourceEvent(event) {
  let sourceEvent2;
  while (sourceEvent2 = event.sourceEvent) event = sourceEvent2;
  return event;
}
function pointer(event, node) {
  event = sourceEvent(event);
  if (node === void 0) node = event.currentTarget;
  if (node) {
    var svg = node.ownerSVGElement || node;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }
    if (node.getBoundingClientRect) {
      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }
  }
  return [event.pageX, event.pageY];
}
var noop = { value: () => {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return { type: t, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
      return;
    }
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};
function get$1(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}
function set$1(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({ name, value: callback });
  return type;
}
var frame = 0, timeout$1 = 0, interval = 0, pokeDelay = 1e3, taskHead, taskTail, clockLast = 0, clockNow = 0, clockSkew = 0, clock = typeof performance === "object" && performance.now ? performance : Date, setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}
function timerFlush() {
  now();
  ++frame;
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
    t = t._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout$1 = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}
function sleep(time) {
  if (frame) return;
  if (timeout$1) timeout$1 = clearTimeout(timeout$1);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}
function timeout(callback, delay, time) {
  var t = new Timer();
  delay = delay == null ? 0 : +delay;
  t.restart((elapsed) => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}
var emptyOn = dispatch("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule(node, name, id2, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};
  else if (id2 in schedules) return;
  create(node, id2, {
    name,
    index,
    // For context during callback.
    group,
    // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > CREATED) throw new Error("too late; already scheduled");
  return schedule2;
}
function set(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > STARTED) throw new Error("too late; already running");
  return schedule2;
}
function get(node, id2) {
  var schedule2 = node.__transition;
  if (!schedule2 || !(schedule2 = schedule2[id2])) throw new Error("transition not found");
  return schedule2;
}
function create(node, id2, self) {
  var schedules = node.__transition, tween;
  schedules[id2] = self;
  self.timer = timer(schedule2, 0, self.time);
  function schedule2(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start2, self.delay, self.time);
    if (self.delay <= elapsed) start2(elapsed - self.delay);
  }
  function start2(elapsed) {
    var i, j, n, o;
    if (self.state !== SCHEDULED) return stop();
    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) continue;
      if (o.state === STARTED) return timeout(start2);
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      } else if (+i < id2) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }
    timeout(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return;
    self.state = STARTED;
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }
  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1), i = -1, n = tween.length;
    while (++i < n) {
      tween[i].call(node, t);
    }
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }
  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id2];
    for (var i in schedules) return;
    delete node.__transition;
  }
}
function interrupt(node, name) {
  var schedules = node.__transition, schedule2, active, empty2 = true, i;
  if (!schedules) return;
  name = name == null ? null : name + "";
  for (i in schedules) {
    if ((schedule2 = schedules[i]).name !== name) {
      empty2 = false;
      continue;
    }
    active = schedule2.state > STARTING && schedule2.state < ENDING;
    schedule2.state = ENDED;
    schedule2.timer.stop();
    schedule2.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule2.index, schedule2.group);
    delete schedules[i];
  }
  if (empty2) delete node.__transition;
}
function selection_interrupt(name) {
  return this.each(function() {
    interrupt(this, name);
  });
}
function tweenRemove(id2, name) {
  var tween0, tween1;
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule2.tween = tween1;
  };
}
function tweenFunction(id2, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error();
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) tween1.push(t);
    }
    schedule2.tween = tween1;
  };
}
function transition_tween(name, value) {
  var id2 = this._id;
  name += "";
  if (arguments.length < 2) {
    var tween = get(this.node(), id2).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
}
function tweenValue(transition, name, value) {
  var id2 = transition._id;
  transition.each(function() {
    var schedule2 = set(this, id2);
    (schedule2.value || (schedule2.value = {}))[name] = value.apply(this, arguments);
  });
  return function(node) {
    return get(node, id2).value[name];
  };
}
function interpolate(a, b) {
  var c;
  return (typeof b === "number" ? interpolateNumber : b instanceof color ? interpolateRgb : (c = color(b)) ? (b = c, interpolateRgb) : interpolateString)(a, b);
}
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrConstantNS(fullname, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function attrFunctionNS(fullname, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function transition_attr(name, value) {
  var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname) : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
}
function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}
function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}
function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_attrTween(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  var fullname = namespace(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}
function delayFunction(id2, value) {
  return function() {
    init(this, id2).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id2, value) {
  return value = +value, function() {
    init(this, id2).delay = value;
  };
}
function transition_delay(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get(this.node(), id2).delay;
}
function durationFunction(id2, value) {
  return function() {
    set(this, id2).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id2, value) {
  return value = +value, function() {
    set(this, id2).duration = value;
  };
}
function transition_duration(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get(this.node(), id2).duration;
}
function easeConstant(id2, value) {
  if (typeof value !== "function") throw new Error();
  return function() {
    set(this, id2).ease = value;
  };
}
function transition_ease(value) {
  var id2 = this._id;
  return arguments.length ? this.each(easeConstant(id2, value)) : get(this.node(), id2).ease;
}
function easeVarying(id2, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function") throw new Error();
    set(this, id2).ease = v;
  };
}
function transition_easeVarying(value) {
  if (typeof value !== "function") throw new Error();
  return this.each(easeVarying(this._id, value));
}
function transition_filter(match) {
  if (typeof match !== "function") match = matcher(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}
function transition_merge(transition) {
  if (transition._id !== this._id) throw new Error();
  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge2[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}
function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0) t = t.slice(0, i);
    return !t || t === "start";
  });
}
function onFunction(id2, name, listener) {
  var on0, on1, sit = start(name) ? init : set;
  return function() {
    var schedule2 = sit(this, id2), on = schedule2.on;
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
    schedule2.on = on1;
  };
}
function transition_on(name, listener) {
  var id2 = this._id;
  return arguments.length < 2 ? get(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
}
function removeFunction(id2) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id2) return;
    if (parent) parent.removeChild(this);
  };
}
function transition_remove() {
  return this.on("end.remove", removeFunction(this._id));
}
function transition_select(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function") select2 = selector(select2);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select2.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id2, i, subgroup, get(node, id2));
      }
    }
  }
  return new Transition(subgroups, this._parents, name, id2);
}
function transition_selectAll(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function") select2 = selectorAll(select2);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children2 = select2.call(node, node.__data__, i, group), child, inherit2 = get(node, id2), k = 0, l = children2.length; k < l; ++k) {
          if (child = children2[k]) {
            schedule(child, name, id2, k, children2, inherit2);
          }
        }
        subgroups.push(children2);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name, id2);
}
var Selection = selection.prototype.constructor;
function transition_selection() {
  return new Selection(this._groups, this._parents);
}
function styleNull(name, interpolate2) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, string10 = string1);
  };
}
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function styleFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function styleMaybeRemove(id2, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
  return function() {
    var schedule2 = set(this, id2), on = schedule2.on, listener = schedule2.value[key] == null ? remove2 || (remove2 = styleRemove(name)) : void 0;
    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
    schedule2.on = on1;
  };
}
function transition_style(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
  return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove(name)) : typeof value === "function" ? this.styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant(name, i, value), priority).on("end.style." + name, null);
}
function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}
function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}
function transition_styleTween(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function transition_text(value) {
  return this.tween("text", typeof value === "function" ? textFunction(tweenValue(this, "text", value)) : textConstant(value == null ? "" : value + ""));
}
function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}
function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_textTween(value) {
  var key = "text";
  if (arguments.length < 1) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, textTween(value));
}
function transition_transition() {
  var name = this._name, id0 = this._id, id1 = newId();
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit2 = get(node, id0);
        schedule(node, name, id1, i, group, {
          time: inherit2.time + inherit2.delay + inherit2.duration,
          delay: 0,
          duration: inherit2.duration,
          ease: inherit2.ease
        });
      }
    }
  }
  return new Transition(groups, this._parents, name, id1);
}
function transition_end() {
  var on0, on1, that = this, id2 = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = { value: reject }, end = { value: function() {
      if (--size === 0) resolve();
    } };
    that.each(function() {
      var schedule2 = set(this, id2), on = schedule2.on;
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule2.on = on1;
    });
    if (size === 0) resolve();
  });
}
var id = 0;
function Transition(groups, parents, name, id2) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id2;
}
function newId() {
  return ++id;
}
var selection_prototype = selection.prototype;
Transition.prototype = {
  constructor: Transition,
  select: transition_select,
  selectAll: transition_selectAll,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: transition_filter,
  merge: transition_merge,
  selection: transition_selection,
  transition: transition_transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: transition_on,
  attr: transition_attr,
  attrTween: transition_attrTween,
  style: transition_style,
  styleTween: transition_styleTween,
  text: transition_text,
  textTween: transition_textTween,
  remove: transition_remove,
  tween: transition_tween,
  delay: transition_delay,
  duration: transition_duration,
  ease: transition_ease,
  easeVarying: transition_easeVarying,
  end: transition_end,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};
function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var defaultTiming = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit(node, id2) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id2])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id2} not found`);
    }
  }
  return timing;
}
function selection_transition(name) {
  var id2, timing;
  if (name instanceof Transition) {
    id2 = name._id, name = name._name;
  } else {
    id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id2, i, group, timing || inherit(node, id2));
      }
    }
  }
  return new Transition(groups, this._parents, name, id2);
}
selection.prototype.interrupt = selection_interrupt;
selection.prototype.transition = selection_transition;
const nonpassivecapture = { capture: true, passive: false };
function noevent$1(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function dragDisable(view) {
  var root2 = view.document.documentElement, selection2 = select(view).on("dragstart.drag", noevent$1, nonpassivecapture);
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", noevent$1, nonpassivecapture);
  } else {
    root2.__noselect = root2.style.MozUserSelect;
    root2.style.MozUserSelect = "none";
  }
}
function yesdrag(view, noclick) {
  var root2 = view.document.documentElement, selection2 = select(view).on("dragstart.drag", null);
  if (noclick) {
    selection2.on("click.drag", noevent$1, nonpassivecapture);
    setTimeout(function() {
      selection2.on("click.drag", null);
    }, 0);
  }
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", null);
  } else {
    root2.style.MozUserSelect = root2.__noselect;
    delete root2.__noselect;
  }
}
const constant = (x) => () => x;
function ZoomEvent(type, {
  sourceEvent: sourceEvent2,
  target,
  transform: transform2,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent2, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    transform: { value: transform2, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}
function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x) {
    return x * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x) {
    return (x - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var identity$1 = new Transform(1, 0, 0);
transform$1.prototype = Transform.prototype;
function transform$1(node) {
  while (!node.__zoom) if (!(node = node.parentNode)) return identity$1;
  return node.__zoom;
}
function nopropagation(event) {
  event.stopImmediatePropagation();
}
function noevent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function defaultFilter(event) {
  return (!event.ctrlKey || event.type === "wheel") && !event.button;
}
function defaultExtent() {
  var e = this;
  if (e instanceof SVGElement) {
    e = e.ownerSVGElement || e;
    if (e.hasAttribute("viewBox")) {
      e = e.viewBox.baseVal;
      return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
    }
    return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
  }
  return [[0, 0], [e.clientWidth, e.clientHeight]];
}
function defaultTransform() {
  return this.__zoom || identity$1;
}
function defaultWheelDelta(event) {
  return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 2e-3) * (event.ctrlKey ? 10 : 1);
}
function defaultTouchable() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function defaultConstrain(transform2, extent, translateExtent) {
  var dx0 = transform2.invertX(extent[0][0]) - translateExtent[0][0], dx1 = transform2.invertX(extent[1][0]) - translateExtent[1][0], dy0 = transform2.invertY(extent[0][1]) - translateExtent[0][1], dy1 = transform2.invertY(extent[1][1]) - translateExtent[1][1];
  return transform2.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
  );
}
function zoom() {
  var filter2 = defaultFilter, extent = defaultExtent, constrain = defaultConstrain, wheelDelta = defaultWheelDelta, touchable = defaultTouchable, scaleExtent = [0, Infinity], translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]], duration = 250, interpolate2 = interpolateZoom, listeners = dispatch("start", "zoom", "end"), touchstarting, touchfirst, touchending, touchDelay = 500, wheelDelay = 150, clickDistance2 = 0, tapDistance = 10;
  function zoom2(selection2) {
    selection2.property("__zoom", defaultTransform).on("wheel.zoom", wheeled, { passive: false }).on("mousedown.zoom", mousedowned).on("dblclick.zoom", dblclicked).filter(touchable).on("touchstart.zoom", touchstarted).on("touchmove.zoom", touchmoved).on("touchend.zoom touchcancel.zoom", touchended).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  zoom2.transform = function(collection, transform2, point, event) {
    var selection2 = collection.selection ? collection.selection() : collection;
    selection2.property("__zoom", defaultTransform);
    if (collection !== selection2) {
      schedule2(collection, transform2, point, event);
    } else {
      selection2.interrupt().each(function() {
        gesture(this, arguments).event(event).start().zoom(null, typeof transform2 === "function" ? transform2.apply(this, arguments) : transform2).end();
      });
    }
  };
  zoom2.scaleBy = function(selection2, k, p, event) {
    zoom2.scaleTo(selection2, function() {
      var k0 = this.__zoom.k, k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return k0 * k1;
    }, p, event);
  };
  zoom2.scaleTo = function(selection2, k, p, event) {
    zoom2.transform(selection2, function() {
      var e = extent.apply(this, arguments), t0 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p, p1 = t0.invert(p0), k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
    }, p, event);
  };
  zoom2.translateBy = function(selection2, x, y, event) {
    zoom2.transform(selection2, function() {
      return constrain(this.__zoom.translate(
        typeof x === "function" ? x.apply(this, arguments) : x,
        typeof y === "function" ? y.apply(this, arguments) : y
      ), extent.apply(this, arguments), translateExtent);
    }, null, event);
  };
  zoom2.translateTo = function(selection2, x, y, p, event) {
    zoom2.transform(selection2, function() {
      var e = extent.apply(this, arguments), t = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
      return constrain(identity$1.translate(p0[0], p0[1]).scale(t.k).translate(
        typeof x === "function" ? -x.apply(this, arguments) : -x,
        typeof y === "function" ? -y.apply(this, arguments) : -y
      ), e, translateExtent);
    }, p, event);
  };
  function scale(transform2, k) {
    k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
    return k === transform2.k ? transform2 : new Transform(k, transform2.x, transform2.y);
  }
  function translate(transform2, p0, p1) {
    var x = p0[0] - p1[0] * transform2.k, y = p0[1] - p1[1] * transform2.k;
    return x === transform2.x && y === transform2.y ? transform2 : new Transform(transform2.k, x, y);
  }
  function centroid(extent2) {
    return [(+extent2[0][0] + +extent2[1][0]) / 2, (+extent2[0][1] + +extent2[1][1]) / 2];
  }
  function schedule2(transition, transform2, point, event) {
    transition.on("start.zoom", function() {
      gesture(this, arguments).event(event).start();
    }).on("interrupt.zoom end.zoom", function() {
      gesture(this, arguments).event(event).end();
    }).tween("zoom", function() {
      var that = this, args = arguments, g = gesture(that, args).event(event), e = extent.apply(that, args), p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point, w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]), a = that.__zoom, b = typeof transform2 === "function" ? transform2.apply(that, args) : transform2, i = interpolate2(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
      return function(t) {
        if (t === 1) t = b;
        else {
          var l = i(t), k = w / l[2];
          t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k);
        }
        g.zoom(null, t);
      };
    });
  }
  function gesture(that, args, clean) {
    return !clean && that.__zooming || new Gesture(that, args);
  }
  function Gesture(that, args) {
    this.that = that;
    this.args = args;
    this.active = 0;
    this.sourceEvent = null;
    this.extent = extent.apply(that, args);
    this.taps = 0;
  }
  Gesture.prototype = {
    event: function(event) {
      if (event) this.sourceEvent = event;
      return this;
    },
    start: function() {
      if (++this.active === 1) {
        this.that.__zooming = this;
        this.emit("start");
      }
      return this;
    },
    zoom: function(key, transform2) {
      if (this.mouse && key !== "mouse") this.mouse[1] = transform2.invert(this.mouse[0]);
      if (this.touch0 && key !== "touch") this.touch0[1] = transform2.invert(this.touch0[0]);
      if (this.touch1 && key !== "touch") this.touch1[1] = transform2.invert(this.touch1[0]);
      this.that.__zoom = transform2;
      this.emit("zoom");
      return this;
    },
    end: function() {
      if (--this.active === 0) {
        delete this.that.__zooming;
        this.emit("end");
      }
      return this;
    },
    emit: function(type) {
      var d = select(this.that).datum();
      listeners.call(
        type,
        this.that,
        new ZoomEvent(type, {
          sourceEvent: this.sourceEvent,
          target: zoom2,
          transform: this.that.__zoom,
          dispatch: listeners
        }),
        d
      );
    }
  };
  function wheeled(event, ...args) {
    if (!filter2.apply(this, arguments)) return;
    var g = gesture(this, args).event(event), t = this.__zoom, k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))), p = pointer(event);
    if (g.wheel) {
      if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
        g.mouse[1] = t.invert(g.mouse[0] = p);
      }
      clearTimeout(g.wheel);
    } else if (t.k === k) return;
    else {
      g.mouse = [p, t.invert(p)];
      interrupt(this);
      g.start();
    }
    noevent(event);
    g.wheel = setTimeout(wheelidled, wheelDelay);
    g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));
    function wheelidled() {
      g.wheel = null;
      g.end();
    }
  }
  function mousedowned(event, ...args) {
    if (touchending || !filter2.apply(this, arguments)) return;
    var currentTarget = event.currentTarget, g = gesture(this, args, true).event(event), v = select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true), p = pointer(event, currentTarget), x02 = event.clientX, y02 = event.clientY;
    dragDisable(event.view);
    nopropagation(event);
    g.mouse = [p, this.__zoom.invert(p)];
    interrupt(this);
    g.start();
    function mousemoved(event2) {
      noevent(event2);
      if (!g.moved) {
        var dx = event2.clientX - x02, dy = event2.clientY - y02;
        g.moved = dx * dx + dy * dy > clickDistance2;
      }
      g.event(event2).zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer(event2, currentTarget), g.mouse[1]), g.extent, translateExtent));
    }
    function mouseupped(event2) {
      v.on("mousemove.zoom mouseup.zoom", null);
      yesdrag(event2.view, g.moved);
      noevent(event2);
      g.event(event2).end();
    }
  }
  function dblclicked(event, ...args) {
    if (!filter2.apply(this, arguments)) return;
    var t0 = this.__zoom, p0 = pointer(event.changedTouches ? event.changedTouches[0] : event, this), p1 = t0.invert(p0), k1 = t0.k * (event.shiftKey ? 0.5 : 2), t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);
    noevent(event);
    if (duration > 0) select(this).transition().duration(duration).call(schedule2, t1, p0, event);
    else select(this).call(zoom2.transform, t1, p0, event);
  }
  function touchstarted(event, ...args) {
    if (!filter2.apply(this, arguments)) return;
    var touches = event.touches, n = touches.length, g = gesture(this, args, event.changedTouches.length === n).event(event), started, i, t, p;
    nopropagation(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      p = [p, this.__zoom.invert(p), t.identifier];
      if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
      else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
    }
    if (touchstarting) touchstarting = clearTimeout(touchstarting);
    if (started) {
      if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() {
        touchstarting = null;
      }, touchDelay);
      interrupt(this);
      g.start();
    }
  }
  function touchmoved(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t, p, l;
    noevent(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
      else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
    }
    t = g.that.__zoom;
    if (g.touch1) {
      var p0 = g.touch0[0], l0 = g.touch0[1], p1 = g.touch1[0], l1 = g.touch1[1], dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp, dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
      t = scale(t, Math.sqrt(dp / dl));
      p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
    } else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
    else return;
    g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
  }
  function touchended(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t;
    nopropagation(event);
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, touchDelay);
    for (i = 0; i < n; ++i) {
      t = touches[i];
      if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
      else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
    }
    if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
    if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
    else {
      g.end();
      if (g.taps === 2) {
        t = pointer(t, this);
        if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
          var p = select(this).on("dblclick.zoom");
          if (p) p.apply(this, arguments);
        }
      }
    }
  }
  zoom2.wheelDelta = function(_) {
    return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant(+_), zoom2) : wheelDelta;
  };
  zoom2.filter = function(_) {
    return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant(!!_), zoom2) : filter2;
  };
  zoom2.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), zoom2) : touchable;
  };
  zoom2.extent = function(_) {
    return arguments.length ? (extent = typeof _ === "function" ? _ : constant([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom2) : extent;
  };
  zoom2.scaleExtent = function(_) {
    return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom2) : [scaleExtent[0], scaleExtent[1]];
  };
  zoom2.translateExtent = function(_) {
    return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom2) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
  };
  zoom2.constrain = function(_) {
    return arguments.length ? (constrain = _, zoom2) : constrain;
  };
  zoom2.duration = function(_) {
    return arguments.length ? (duration = +_, zoom2) : duration;
  };
  zoom2.interpolate = function(_) {
    return arguments.length ? (interpolate2 = _, zoom2) : interpolate2;
  };
  zoom2.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom2 : value;
  };
  zoom2.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom2) : Math.sqrt(clickDistance2);
  };
  zoom2.tapDistance = function(_) {
    return arguments.length ? (tapDistance = +_, zoom2) : tapDistance;
  };
  return zoom2;
}
function identity(x) {
  return x;
}
function transform(transform2) {
  if (transform2 == null) return identity;
  var x02, y02, kx = transform2.scale[0], ky = transform2.scale[1], dx = transform2.translate[0], dy = transform2.translate[1];
  return function(input, i) {
    if (!i) x02 = y02 = 0;
    var j = 2, n = input.length, output = new Array(n);
    output[0] = (x02 += input[0]) * kx + dx;
    output[1] = (y02 += input[1]) * ky + dy;
    while (j < n) output[j] = input[j], ++j;
    return output;
  };
}
function reverse(array2, n) {
  var t, j = array2.length, i = j - n;
  while (i < --j) t = array2[i], array2[i++] = array2[j], array2[j] = t;
}
function feature(topology, o) {
  if (typeof o === "string") o = topology.objects[o];
  return o.type === "GeometryCollection" ? { type: "FeatureCollection", features: o.geometries.map(function(o2) {
    return feature$1(topology, o2);
  }) } : feature$1(topology, o);
}
function feature$1(topology, o) {
  var id2 = o.id, bbox = o.bbox, properties = o.properties == null ? {} : o.properties, geometry = object(topology, o);
  return id2 == null && bbox == null ? { type: "Feature", properties, geometry } : bbox == null ? { type: "Feature", id: id2, properties, geometry } : { type: "Feature", id: id2, bbox, properties, geometry };
}
function object(topology, o) {
  var transformPoint = transform(topology.transform), arcs = topology.arcs;
  function arc(i, points) {
    if (points.length) points.pop();
    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
      points.push(transformPoint(a[k], k));
    }
    if (i < 0) reverse(points, n);
  }
  function point(p) {
    return transformPoint(p);
  }
  function line(arcs2) {
    var points = [];
    for (var i = 0, n = arcs2.length; i < n; ++i) arc(arcs2[i], points);
    if (points.length < 2) points.push(points[0]);
    return points;
  }
  function ring(arcs2) {
    var points = line(arcs2);
    while (points.length < 4) points.push(points[0]);
    return points;
  }
  function polygon(arcs2) {
    return arcs2.map(ring);
  }
  function geometry(o2) {
    var type = o2.type, coordinates;
    switch (type) {
      case "GeometryCollection":
        return { type, geometries: o2.geometries.map(geometry) };
      case "Point":
        coordinates = point(o2.coordinates);
        break;
      case "MultiPoint":
        coordinates = o2.coordinates.map(point);
        break;
      case "LineString":
        coordinates = line(o2.arcs);
        break;
      case "MultiLineString":
        coordinates = o2.arcs.map(line);
        break;
      case "Polygon":
        coordinates = polygon(o2.arcs);
        break;
      case "MultiPolygon":
        coordinates = o2.arcs.map(polygon);
        break;
      default:
        return null;
    }
    return { type, coordinates };
  }
  return geometry(o);
}
function stitch(topology, arcs) {
  var stitchedArcs = {}, fragmentByStart = {}, fragmentByEnd = {}, fragments = [], emptyIndex = -1;
  arcs.forEach(function(i, j) {
    var arc = topology.arcs[i < 0 ? ~i : i], t;
    if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
      t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
    }
  });
  arcs.forEach(function(i) {
    var e = ends(i), start2 = e[0], end = e[1], f, g;
    if (f = fragmentByEnd[start2]) {
      delete fragmentByEnd[f.end];
      f.push(i);
      f.end = end;
      if (g = fragmentByStart[end]) {
        delete fragmentByStart[g.start];
        var fg = g === f ? f : f.concat(g);
        fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
      } else {
        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
      }
    } else if (f = fragmentByStart[end]) {
      delete fragmentByStart[f.start];
      f.unshift(i);
      f.start = start2;
      if (g = fragmentByEnd[start2]) {
        delete fragmentByEnd[g.end];
        var gf = g === f ? f : g.concat(f);
        fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
      } else {
        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
      }
    } else {
      f = [i];
      fragmentByStart[f.start = start2] = fragmentByEnd[f.end = end] = f;
    }
  });
  function ends(i) {
    var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;
    if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) {
      p1[0] += dp[0], p1[1] += dp[1];
    });
    else p1 = arc[arc.length - 1];
    return i < 0 ? [p1, p0] : [p0, p1];
  }
  function flush(fragmentByEnd2, fragmentByStart2) {
    for (var k in fragmentByEnd2) {
      var f = fragmentByEnd2[k];
      delete fragmentByStart2[f.start];
      delete f.start;
      delete f.end;
      f.forEach(function(i) {
        stitchedArcs[i < 0 ? ~i : i] = 1;
      });
      fragments.push(f);
    }
  }
  flush(fragmentByEnd, fragmentByStart);
  flush(fragmentByStart, fragmentByEnd);
  arcs.forEach(function(i) {
    if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]);
  });
  return fragments;
}
function mesh(topology) {
  return object(topology, meshArcs.apply(this, arguments));
}
function meshArcs(topology, object2, filter2) {
  var arcs, i, n;
  if (arguments.length > 1) arcs = extractArcs(topology, object2, filter2);
  else for (i = 0, arcs = new Array(n = topology.arcs.length); i < n; ++i) arcs[i] = i;
  return { type: "MultiLineString", arcs: stitch(topology, arcs) };
}
function extractArcs(topology, object2, filter2) {
  var arcs = [], geomsByArc = [], geom;
  function extract0(i) {
    var j = i < 0 ? ~i : i;
    (geomsByArc[j] || (geomsByArc[j] = [])).push({ i, g: geom });
  }
  function extract1(arcs2) {
    arcs2.forEach(extract0);
  }
  function extract2(arcs2) {
    arcs2.forEach(extract1);
  }
  function extract3(arcs2) {
    arcs2.forEach(extract2);
  }
  function geometry(o) {
    switch (geom = o, o.type) {
      case "GeometryCollection":
        o.geometries.forEach(geometry);
        break;
      case "LineString":
        extract1(o.arcs);
        break;
      case "MultiLineString":
      case "Polygon":
        extract2(o.arcs);
        break;
      case "MultiPolygon":
        extract3(o.arcs);
        break;
    }
  }
  geometry(object2);
  geomsByArc.forEach(filter2 == null ? function(geoms) {
    arcs.push(geoms[0].i);
  } : function(geoms) {
    if (filter2(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i);
  });
  return arcs;
}
const fineAtlasUrl = "/assets/countries-50m-BphFPm15.json";
const coarseAtlasUrl = "/assets/countries-110m-B3KlhDC_.json";
const NORTH_LIMIT = 84;
const SOUTH_LIMIT = -58;
const PAN_LATITUDE_LIMIT = 85;
const HIDDEN_COUNTRIES = /* @__PURE__ */ new Set(["Antarctica"]);
const COUNTRY_NAME_OVERRIDES = {
  "United States of America": "United States",
  "Dem. Rep. Congo": "DR Congo",
  "Central African Rep.": "CAR"
};
const DAYS_PER_YEAR = 365;
const DAYS_FROM_SOLSTICE_TO_YEAR_END = 10;
const MS_PER_DAY = 864e5;
const MINUTES_PER_DAY = 1440;
async function loadAtlas(url) {
  const response = await fetch(url);
  const topology = await response.json();
  const collection = feature(
    topology,
    topology.objects.countries
  );
  return {
    countries: collection.features.filter(
      (country) => !HIDDEN_COUNTRIES.has(country.properties.name)
    ),
    borders: mesh(
      topology,
      topology.objects.countries,
      (a, b) => a !== b
    )
  };
}
async function loadWorldShapes() {
  const [coarse, fine] = await Promise.all([
    loadAtlas(coarseAtlasUrl),
    loadAtlas(fineAtlasUrl)
  ]);
  return { coarse, fine };
}
function projectMercatorY(latitude) {
  const radians2 = latitude * Math.PI / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians2 / 2));
}
function createCoverProjection(width, height) {
  const top = projectMercatorY(NORTH_LIMIT);
  const bottom = projectMercatorY(SOUTH_LIMIT);
  const scale = Math.max(width / (2 * Math.PI), height / (top - bottom));
  const middle = (top + bottom) / 2;
  return geoMercator().scale(scale).translate([width / 2, height / 2 + middle * scale]);
}
function getLargestPolygon(country) {
  const polygons = country.geometry.type === "Polygon" ? [country.geometry.coordinates] : country.geometry.coordinates;
  let largest = null;
  let largestArea = -1;
  for (const coordinates of polygons) {
    const candidate = {
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates }
    };
    const area = geoArea(candidate);
    if (area > largestArea) {
      largest = candidate;
      largestArea = area;
    }
  }
  return largest ?? country;
}
function createCountryLabels(countries, path) {
  const labels = [];
  for (const country of countries) {
    const mainland = getLargestPolygon(country);
    const [x, y] = path.centroid(mainland);
    if (!(Number.isFinite(x) && Number.isFinite(y))) {
      continue;
    }
    const name = country.properties.name;
    labels.push({
      name: COUNTRY_NAME_OVERRIDES[name] ?? name,
      x,
      y,
      area: path.area(mainland)
    });
  }
  return labels.sort((a, b) => b.area - a.area);
}
function toBoundedPath(path, shape) {
  return { path: new Path2D(path(shape) ?? ""), bounds: path.bounds(shape) };
}
function bucketBorders(path, borders) {
  const cells = /* @__PURE__ */ new Map();
  for (const line of borders.coordinates) {
    const [longitude2, latitude] = line[0] ?? [0, 0];
    const key = `${Math.floor(longitude2 / BORDER_BUCKET_DEGREES)}:${Math.floor(latitude / BORDER_BUCKET_DEGREES)}`;
    const cell = cells.get(key) ?? { type: "MultiLineString", coordinates: [] };
    cell.coordinates.push(line);
    cells.set(key, cell);
  }
  return [...cells.values()].map((cell) => toBoundedPath(path, cell));
}
function createMapGeometry(shapes, size) {
  const projection2 = createCoverProjection(size.width, size.height);
  const path = geoPath(projection2);
  const [worldLeft, panTop] = projection2([-180, PAN_LATITUDE_LIMIT]) ?? [0, 0];
  const [, panBottom] = projection2([0, -PAN_LATITUDE_LIMIT]) ?? [
    0,
    size.height
  ];
  return {
    projection: projection2,
    coarseLand: new Path2D(
      path({ type: "FeatureCollection", features: shapes.coarse.countries }) ?? ""
    ),
    coarseBorders: new Path2D(path(shapes.coarse.borders) ?? ""),
    fineCountries: shapes.fine.countries.map(
      (country) => toBoundedPath(path, country)
    ),
    fineBorders: bucketBorders(path, shapes.fine.borders),
    labels: createCountryLabels(shapes.coarse.countries, path),
    worldWidth: 2 * Math.PI * projection2.scale(),
    worldLeft,
    panBounds: [
      [Number.NEGATIVE_INFINITY, panTop],
      [Number.POSITIVE_INFINITY, panBottom]
    ]
  };
}
function getSubsolarPoint(date) {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = (date.getTime() - startOfYear) / MS_PER_DAY;
  const latitude = -23.44 * Math.cos(
    2 * Math.PI / DAYS_PER_YEAR * (dayOfYear + DAYS_FROM_SOLSTICE_TO_YEAR_END)
  );
  const minutesIntoDay = date.getUTCHours() * 60 + date.getUTCMinutes();
  const longitude2 = 180 - minutesIntoDay / MINUTES_PER_DAY * 360;
  return [longitude2, latitude];
}
function createNightRings(projection2, date) {
  const [sunLongitude, sunLatitude] = getSubsolarPoint(date);
  const antipode = [sunLongitude + 180, -sunLatitude];
  const path = geoPath(projection2);
  const circle = geoCircle().center(antipode);
  const radiusAt = (step) => 90 - step * NIGHT_FEATHER_DEGREES / NIGHT_FEATHER_STEPS;
  const rings = [];
  for (let step = 0; step < NIGHT_FEATHER_STEPS; step++) {
    const ring = new Path2D(path(circle.radius(radiusAt(step))()) ?? "");
    ring.addPath(new Path2D(path(circle.radius(radiusAt(step + 1))()) ?? ""));
    rings.push({ path: ring, strength: (step + 1) / NIGHT_FEATHER_STEPS });
  }
  rings.push({
    path: new Path2D(
      path(circle.radius(radiusAt(NIGHT_FEATHER_STEPS))()) ?? ""
    ),
    strength: 1
  });
  return rings;
}
const FULL_TURN = 2 * Math.PI;
const HASH_MODULUS = 1000003;
const PHASE_STEPS = 1e3;
function drawMarkers({
  context,
  markers,
  transform: transform2,
  viewport,
  copyOffsets,
  activeId,
  style,
  now: now2
}) {
  const { pixelRatio } = viewport;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(
    0,
    0,
    viewport.width * pixelRatio,
    viewport.height * pixelRatio
  );
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  const dots = new Path2D();
  const ring = new Path2D();
  const margin = MARKER_VIEWPORT_MARGIN;
  context.fillStyle = style.fill;
  for (const offset of copyOffsets) {
    for (const marker of markers) {
      const x = transform2.applyX(marker.x + offset);
      const y = transform2.applyY(marker.y);
      if (x < -margin || x > viewport.width + margin || y < -margin || y > viewport.height + margin) {
        continue;
      }
      if (marker.pulses) {
        drawPulse(context, marker, x, y, now2);
      }
      dots.moveTo(x + marker.radius, y);
      dots.arc(x, y, marker.radius, 0, FULL_TURN);
      if (marker.id === activeId) {
        const ringRadius = marker.radius + MARKER_ACTIVE_RING_GAP;
        ring.moveTo(x + ringRadius, y);
        ring.arc(x, y, ringRadius, 0, FULL_TURN);
      }
    }
  }
  context.globalAlpha = 1;
  context.fillStyle = style.fill;
  context.fill(dots);
  context.strokeStyle = style.stroke;
  context.lineWidth = MARKER_STROKE_WIDTH;
  context.stroke(dots);
  if (activeId) {
    context.strokeStyle = style.ring;
    context.lineWidth = MARKER_STROKE_WIDTH;
    context.stroke(ring);
  }
}
function drawPulse(context, marker, x, y, now2) {
  const offset = hashPhase(marker.id) * MARKER_PULSE_DURATION_MS;
  const phase = (now2 + offset) % MARKER_PULSE_DURATION_MS / MARKER_PULSE_DURATION_MS;
  const eased = 1 - (1 - phase) * (1 - phase);
  const radius = marker.radius * (1 + (MARKER_PULSE_SPREAD - 1) * eased);
  context.globalAlpha = MARKER_PULSE_ALPHA * (1 - eased);
  context.beginPath();
  context.arc(x, y, radius, 0, FULL_TURN);
  context.fill();
}
function hashPhase(id2) {
  let hash = 0;
  for (let index = 0; index < id2.length; index++) {
    hash = (hash * 31 + id2.charCodeAt(index)) % HASH_MODULUS;
  }
  return hash % PHASE_STEPS / PHASE_STEPS;
}
class WorldRaster {
  constructor(geometry, night, style, onDetailReady) {
    this.geometry = geometry;
    this.night = night;
    this.style = style;
    this.onDetailReady = onDetailReady;
  }
  geometry;
  night;
  style;
  onDetailReady;
  base = null;
  basePixelRatio = 1;
  detail = null;
  /** Reused between renders; allocating a bitmap this size each time was most of the cost. */
  detailCanvas = null;
  settleTimer = null;
  update(geometry, night, style) {
    this.geometry = geometry;
    this.night = night;
    this.style = style;
    this.base = null;
    this.detail = null;
  }
  dispose() {
    if (this.settleTimer) {
      clearTimeout(this.settleTimer);
    }
  }
  draw(context, transform2, viewport) {
    const { pixelRatio } = viewport;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = this.style.ocean;
    context.fillRect(
      0,
      0,
      viewport.width * pixelRatio,
      viewport.height * pixelRatio
    );
    context.setTransform(
      pixelRatio * transform2.k,
      0,
      0,
      pixelRatio * transform2.k,
      pixelRatio * transform2.x,
      pixelRatio * transform2.y
    );
    const detailCovers = this.detailCovers(transform2, viewport);
    if (!detailCovers) {
      const base = this.getBase();
      const { worldLeft, worldWidth, panBounds } = this.geometry;
      const panTop = panBounds[0][1];
      for (const offset of this.visibleCopies(transform2, viewport)) {
        context.drawImage(
          base,
          worldLeft + offset,
          panTop,
          worldWidth,
          base.height / this.basePixelRatio
        );
      }
      this.scheduleDetail(transform2, viewport);
    }
    if (this.detail && this.detail.k === transform2.k) {
      const { canvas, left, top, width, height } = this.detail;
      context.drawImage(canvas, left, top, width, height);
    }
  }
  detailCovers(transform2, viewport) {
    const detail = this.detail;
    if (!detail || detail.k !== transform2.k) {
      return false;
    }
    const [[left, top], [right, bottom]] = this.visibleWorldBox(
      transform2,
      viewport
    );
    return left >= detail.left && top >= detail.top && right <= detail.left + detail.width && bottom <= detail.top + detail.height;
  }
  visibleWorldBox(transform2, viewport) {
    return [
      [transform2.invertX(0), transform2.invertY(0)],
      [transform2.invertX(viewport.width), transform2.invertY(viewport.height)]
    ];
  }
  visibleCopies(transform2, viewport) {
    const [[left], [right]] = this.visibleWorldBox(transform2, viewport);
    return this.copiesInRange(left, right);
  }
  /** Offsets of every world copy overlapping a horizontal range in world coordinates. */
  copiesInRange(left, right) {
    const { worldLeft, worldWidth } = this.geometry;
    const first = Math.floor((left - worldLeft) / worldWidth);
    const last = Math.floor((right - worldLeft) / worldWidth);
    const offsets = [];
    for (let copy = first; copy <= last; copy++) {
      offsets.push(copy * worldWidth);
    }
    return offsets;
  }
  /** The whole world at zoom 1, at screen resolution; the fallback while moving. */
  getBase() {
    if (this.base) {
      return this.base;
    }
    const { worldLeft, worldWidth, panBounds } = this.geometry;
    const panTop = panBounds[0][1];
    const worldHeight = panBounds[1][1] - panTop;
    const pixelRatio = 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(worldWidth * pixelRatio);
    canvas.height = Math.ceil(worldHeight * pixelRatio);
    const context = canvas.getContext("2d");
    if (context) {
      context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        -worldLeft * pixelRatio,
        -panTop * pixelRatio
      );
      this.drawWorld(context, 1, [0], null);
    }
    this.base = canvas;
    this.basePixelRatio = pixelRatio;
    return canvas;
  }
  scheduleDetail(transform2, viewport) {
    if (this.settleTimer) {
      clearTimeout(this.settleTimer);
    }
    this.settleTimer = setTimeout(() => {
      this.settleTimer = null;
      this.renderDetail(transform2, viewport);
      this.onDetailReady();
    }, RASTER_SETTLE_MS);
  }
  renderDetail(transform2, viewport) {
    const pixelRatio = Math.min(viewport.pixelRatio, RASTER_MAX_PIXEL_RATIO);
    const marginX = viewport.width * RASTER_DETAIL_MARGIN;
    const marginY = viewport.height * RASTER_DETAIL_MARGIN;
    let screenWidth = viewport.width + 2 * marginX;
    let screenHeight = viewport.height + 2 * marginY;
    const pixels = screenWidth * screenHeight * pixelRatio * pixelRatio;
    if (pixels > RASTER_DETAIL_MAX_PIXELS) {
      const shrink = Math.sqrt(RASTER_DETAIL_MAX_PIXELS / pixels);
      screenWidth *= shrink;
      screenHeight *= shrink;
    }
    const offsetX = (screenWidth - viewport.width) / 2;
    const offsetY = (screenHeight - viewport.height) / 2;
    const { k } = transform2;
    const left = transform2.invertX(-offsetX);
    const top = transform2.invertY(-offsetY);
    const canvas = this.detailCanvas ?? document.createElement("canvas");
    this.detailCanvas = canvas;
    const width = Math.ceil(screenWidth * pixelRatio);
    const height = Math.ceil(screenHeight * pixelRatio);
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    } else {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, width, height);
    }
    context.setTransform(
      pixelRatio * k,
      0,
      0,
      pixelRatio * k,
      -left * pixelRatio * k,
      -top * pixelRatio * k
    );
    const area = [
      [left, top],
      [left + screenWidth / k, top + screenHeight / k]
    ];
    const copies = this.copiesInRange(area[0][0], area[1][0]);
    this.drawWorld(context, k, copies, area);
    this.detail = {
      canvas,
      k,
      left,
      top,
      width: screenWidth / k,
      height: screenHeight / k,
      pixelRatio
    };
  }
  /** Fills the coarse world, or only the detailed countries inside `area` when zoomed in. */
  drawWorld(context, k, copies, area) {
    const { style, night, geometry } = this;
    const useFine = area !== null && k >= RASTER_FINE_DETAIL_ZOOM;
    const hairline = 1 / k;
    for (const offset of copies) {
      context.save();
      context.translate(offset, 0);
      const local = area && [
        [area[0][0] - offset, area[0][1]],
        [area[1][0] - offset, area[1][1]]
      ];
      context.fillStyle = style.land;
      if (useFine && local) {
        for (const country of geometry.fineCountries) {
          if (overlaps(country.bounds, local)) {
            context.fill(country.path);
          }
        }
      } else {
        context.fill(geometry.coarseLand);
      }
      context.strokeStyle = style.border;
      context.lineWidth = hairline;
      if (useFine && local) {
        for (const bucket of geometry.fineBorders) {
          if (overlaps(bucket.bounds, local)) {
            context.stroke(bucket.path);
          }
        }
      } else {
        context.stroke(geometry.coarseBorders);
      }
      context.fillStyle = style.night;
      for (const ring of night) {
        context.globalAlpha = style.nightAlpha * ring.strength;
        context.fill(ring.path, "evenodd");
      }
      context.globalAlpha = 1;
      context.restore();
    }
  }
}
function overlaps(a, b) {
  return a[0][0] <= b[1][0] && a[1][0] >= b[0][0] && a[0][1] <= b[1][1] && a[1][1] >= b[0][1];
}
const FALLBACK_MARKER_FILL = "#10b981";
const FALLBACK_MARKER_RING = "#34d399";
let worldShapesPromise = null;
function useWorldShapes() {
  const [shapes, setShapes] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    worldShapesPromise ??= loadWorldShapes();
    worldShapesPromise.then((loaded) => {
      if (!cancelled) {
        setShapes(loaded);
      }
    }).catch(() => {
      worldShapesPromise = null;
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return shapes;
}
function useElementSize(ref) {
  const [size, setSize] = reactExports.useState({ width: 0, height: 0 });
  reactExports.useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    let timer2 = null;
    let isFirst = true;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }
      const next = {
        width: entry.contentRect.width,
        height: entry.contentRect.height
      };
      if (isFirst) {
        isFirst = false;
        setSize(next);
        return;
      }
      if (timer2) {
        clearTimeout(timer2);
      }
      timer2 = setTimeout(() => setSize(next), RESIZE_SETTLE_MS);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (timer2) {
        clearTimeout(timer2);
      }
    };
  }, [ref]);
  return size;
}
function useCurrentMinute() {
  const [now2, setNow] = reactExports.useState(() => /* @__PURE__ */ new Date());
  reactExports.useEffect(() => {
    const interval2 = setInterval(() => setNow(/* @__PURE__ */ new Date()), NIGHT_REFRESH_MS);
    return () => clearInterval(interval2);
  }, []);
  return now2;
}
function readMapStyle(element, isDark) {
  const style = getComputedStyle(element);
  const read = (name, fallback = "") => style.getPropertyValue(name).trim() || fallback;
  return {
    world: {
      ocean: read("--def-100"),
      land: read("--def-300"),
      border: read("--def-100"),
      night: isDark ? "#000" : "#0f172a",
      nightAlpha: isDark ? NIGHT_MAX_ALPHA_DARK : NIGHT_MAX_ALPHA_LIGHT
    },
    markers: {
      fill: read("--color-emerald-500", FALLBACK_MARKER_FILL),
      stroke: read("--def-100"),
      ring: read("--color-emerald-400", FALLBACK_MARKER_RING)
    }
  };
}
function useMapStyle(containerRef, isDark) {
  const [style, setStyle] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const frame2 = requestAnimationFrame(() => {
      if (containerRef.current) {
        setStyle(readMapStyle(containerRef.current, isDark));
      }
    });
    return () => cancelAnimationFrame(frame2);
  }, [containerRef, isDark]);
  return style;
}
function isSameMarker(a, b) {
  return a.x === b.x && a.y === b.y && a.radius === b.radius && a.pulses === b.pulses && a.place.count === b.place.count && a.place.label === b.place.label;
}
function placeMarkers(points, geometry, previous) {
  const placed = [];
  for (const place of groupPointsByPlace(points)) {
    const projected = geometry.projection([place.long, place.lat]);
    if (!projected) {
      continue;
    }
    placed.push({
      id: place.id,
      place,
      x: projected[0],
      y: projected[1],
      radius: getMarkerRadius(place.count),
      pulses: false
    });
  }
  placed.sort((a, b) => b.place.count - a.place.count);
  for (const marker of placed.slice(0, MARKER_PULSE_LIMIT)) {
    marker.pulses = true;
  }
  placed.reverse();
  const previousById = new Map(previous.map((marker) => [marker.id, marker]));
  let reused = 0;
  const next = placed.map((marker) => {
    const known = previousById.get(marker.id);
    if (known && isSameMarker(known, marker)) {
      reused++;
      return known;
    }
    return marker;
  });
  const isUnchanged = reused === next.length && next.length === previous.length;
  return isUnchanged ? previous : next;
}
function getWorldCopyOffsets(geometry, transform2, viewportWidth) {
  const centre = Math.floor(
    (transform2.invertX(viewportWidth / 2) - geometry.worldLeft) / geometry.worldWidth
  );
  return [centre - 1, centre, centre + 1].map(
    (copy) => copy * geometry.worldWidth
  );
}
function sameOffsets(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
function pointInContainer(event, container) {
  const bounds = container.getBoundingClientRect();
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
}
function findMarkerAt(point, markers, transform2, copyOffsets) {
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const offset of copyOffsets) {
    for (const marker of markers) {
      const x = transform2.applyX(marker.x + offset);
      const y = transform2.applyY(marker.y);
      const reach = Math.max(MARKER_HIT_RADIUS, marker.radius);
      const distance = Math.hypot(x - point.x, y - point.y);
      if (distance <= reach && distance < bestDistance) {
        best = { marker, x, y };
        bestDistance = distance;
      }
    }
  }
  return best;
}
function sizeCanvas(canvas, width, height) {
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
}
function RealtimeMap({ projectId, markers }) {
  const dispatch2 = useDispatch();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const containerRef = reactExports.useRef(null);
  const worldCanvasRef = reactExports.useRef(null);
  const markerCanvasRef = reactExports.useRef(null);
  const worldRef = reactExports.useRef(null);
  const zoomRef = reactExports.useRef(null);
  const transformRef = reactExports.useRef(identity$1);
  const rasterRef = reactExports.useRef(null);
  const copyOffsetsRef = reactExports.useRef([0]);
  const settleTimerRef = reactExports.useRef(null);
  const isMovingRef = reactExports.useRef(false);
  const { width, height } = useElementSize(containerRef);
  const shapes = useWorldShapes();
  const now2 = useCurrentMinute();
  const style = useMapStyle(containerRef, isDark);
  const [copyOffsets, setCopyOffsets] = reactExports.useState([0]);
  const [settledZoom, setSettledZoom] = reactExports.useState(1);
  const [hovered, setHovered] = reactExports.useState(null);
  const selectedId = useSelector(
    (state) => state.realtimeMapBadge.marker?.id ?? null
  );
  const activeId = hovered?.marker.id ?? selectedId;
  const hasSize = width > 0 && height > 0;
  const geometry = reactExports.useMemo(
    () => shapes && hasSize ? createMapGeometry(shapes, { width, height }) : null,
    [shapes, hasSize, width, height]
  );
  const night = reactExports.useMemo(
    () => geometry ? createNightRings(geometry.projection, now2) : null,
    [geometry, now2]
  );
  const previousMarkersRef = reactExports.useRef([]);
  const placedMarkers = reactExports.useMemo(() => {
    const placed = geometry ? placeMarkers(markers, geometry, previousMarkersRef.current) : [];
    previousMarkersRef.current = placed;
    return placed;
  }, [geometry, markers]);
  const visibleLabels = reactExports.useMemo(
    () => (geometry?.labels ?? []).filter(
      (label) => label.area * settledZoom * settledZoom >= LABEL_MIN_SCREEN_AREA
    ).slice(0, LABEL_MAX_COUNT),
    [geometry, settledZoom]
  );
  const viewport = reactExports.useCallback(
    () => ({ width, height, pixelRatio: window.devicePixelRatio || 1 }),
    [width, height]
  );
  const paintWorld = reactExports.useCallback(() => {
    const context = worldCanvasRef.current?.getContext("2d", { alpha: false });
    const raster = rasterRef.current;
    if (!(context && raster && hasSize)) {
      return;
    }
    raster.draw(context, transformRef.current, viewport());
  }, [hasSize, viewport]);
  const paintMarkers = reactExports.useCallback(
    (now22 = performance.now()) => {
      const context = markerCanvasRef.current?.getContext("2d");
      if (!(context && style && hasSize)) {
        return;
      }
      drawMarkers({
        context,
        markers: placedMarkers,
        transform: transformRef.current,
        viewport: viewport(),
        copyOffsets: copyOffsetsRef.current,
        activeId,
        style: style.markers,
        now: now22
      });
    },
    [style, hasSize, placedMarkers, activeId, viewport]
  );
  const paintWorldRef = reactExports.useRef(paintWorld);
  const paintMarkersRef = reactExports.useRef(paintMarkers);
  reactExports.useLayoutEffect(() => {
    paintWorldRef.current = paintWorld;
    paintMarkersRef.current = paintMarkers;
  });
  const applyTransform = reactExports.useCallback(
    (transform2) => {
      const previous = transformRef.current;
      transformRef.current = transform2;
      const world = worldRef.current;
      if (world) {
        world.style.transform = `translate(${transform2.x}px, ${transform2.y}px) scale(${transform2.k})`;
        if (transform2.k !== previous.k) {
          world.style.setProperty("--map-inverse-k", String(1 / transform2.k));
        }
      }
      if (geometry) {
        const offsets = getWorldCopyOffsets(geometry, transform2, width);
        if (!sameOffsets(copyOffsetsRef.current, offsets)) {
          copyOffsetsRef.current = offsets;
          setCopyOffsets(offsets);
        }
      }
      paintWorldRef.current();
      paintMarkersRef.current();
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
      settleTimerRef.current = setTimeout(() => {
        settleTimerRef.current = null;
        setSettledZoom(transform2.k);
      }, RASTER_SETTLE_MS);
    },
    [geometry, width]
  );
  reactExports.useLayoutEffect(() => {
    if (!(worldCanvasRef.current && markerCanvasRef.current && hasSize)) {
      return;
    }
    sizeCanvas(worldCanvasRef.current, width, height);
    sizeCanvas(markerCanvasRef.current, width, height);
  }, [hasSize, width, height]);
  reactExports.useLayoutEffect(() => {
    if (!(geometry && night && style)) {
      return;
    }
    if (rasterRef.current) {
      rasterRef.current.update(geometry, night, style.world);
    } else {
      rasterRef.current = new WorldRaster(
        geometry,
        night,
        style.world,
        () => paintWorld()
      );
    }
    paintWorld();
  }, [geometry, night, style, paintWorld]);
  reactExports.useLayoutEffect(() => {
    paintMarkers();
  }, [paintMarkers]);
  const hasPulses = placedMarkers.some((marker) => marker.pulses);
  reactExports.useEffect(() => {
    if (!hasPulses) {
      return;
    }
    let frame2 = 0;
    const tick = (now22) => {
      paintMarkersRef.current(now22);
      frame2 = requestAnimationFrame(tick);
    };
    const start2 = () => {
      cancelAnimationFrame(frame2);
      if (document.visibilityState === "visible") {
        frame2 = requestAnimationFrame(tick);
      }
    };
    start2();
    document.addEventListener("visibilitychange", start2);
    return () => {
      cancelAnimationFrame(frame2);
      document.removeEventListener("visibilitychange", start2);
    };
  }, [hasPulses]);
  reactExports.useEffect(
    () => () => {
      rasterRef.current?.dispose();
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    },
    []
  );
  reactExports.useEffect(() => {
    const element = containerRef.current;
    if (!(element && geometry)) {
      return;
    }
    let gestureStartScale = null;
    const behavior = zoom().scaleExtent([MAP_MIN_ZOOM, MAP_MAX_ZOOM]).extent([
      [0, 0],
      [width, height]
    ]).translateExtent(geometry.panBounds).filter((event) => {
      const isWheel = event.type === "wheel";
      if (isWheel && gestureStartScale !== null) {
        return false;
      }
      return (!event.ctrlKey || isWheel) && !event.button;
    }).on("start", (event) => {
      isMovingRef.current = true;
      if (event.sourceEvent) {
        setHovered(null);
        dispatch2(closeMapBadgeDetails());
      }
    }).on("zoom", (event) => {
      applyTransform(event.transform);
    }).on("end", () => {
      isMovingRef.current = false;
    });
    const selection2 = select(element);
    selection2.call(behavior);
    applyTransform(transform$1(element));
    zoomRef.current = behavior;
    const pointFromGesture = (event) => {
      const rect = element.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top];
    };
    const onGestureStart = (event) => {
      event.preventDefault();
      gestureStartScale = transform$1(element).k;
    };
    const onGestureChange = (event) => {
      event.preventDefault();
      if (gestureStartScale === null) {
        return;
      }
      const gesture = event;
      behavior.scaleTo(
        selection2,
        gestureStartScale * gesture.scale,
        pointFromGesture(gesture)
      );
    };
    const onGestureEnd = (event) => {
      event.preventDefault();
      gestureStartScale = null;
    };
    element.addEventListener("gesturestart", onGestureStart);
    element.addEventListener("gesturechange", onGestureChange);
    element.addEventListener("gestureend", onGestureEnd);
    return () => {
      selection2.on(".zoom", null);
      element.removeEventListener("gesturestart", onGestureStart);
      element.removeEventListener("gesturechange", onGestureChange);
      element.removeEventListener("gestureend", onGestureEnd);
    };
  }, [geometry, width, height, dispatch2, applyTransform]);
  const zoomBy = (factor) => {
    const element = containerRef.current;
    if (!(element && zoomRef.current)) {
      return;
    }
    select(element).transition().duration(MAP_ZOOM_ANIMATION_MS).call(zoomRef.current.scaleBy, factor);
  };
  const resetZoom = () => {
    const element = containerRef.current;
    if (!(element && zoomRef.current)) {
      return;
    }
    select(element).transition().duration(MAP_ZOOM_ANIMATION_MS).call(zoomRef.current.transform, identity$1);
  };
  const markerScreenPoint = reactExports.useCallback((marker) => {
    const transform2 = transformRef.current;
    const copy = copyOffsetsRef.current[1] ?? 0;
    return {
      x: transform2.applyX(marker.x + copy),
      y: transform2.applyY(marker.y)
    };
  }, []);
  const hoverAt = reactExports.useCallback(
    (point) => {
      const next = point ? findMarkerAt(
        point,
        placedMarkers,
        transformRef.current,
        copyOffsetsRef.current
      ) : null;
      setHovered(
        (previous) => previous?.marker === next?.marker ? previous : next
      );
    },
    [placedMarkers]
  );
  const handlePointerMove = (event) => {
    const container = containerRef.current;
    if (!container || isMovingRef.current) {
      return;
    }
    hoverAt(pointInContainer(event, container));
  };
  const selectMarker = reactExports.useCallback(
    (marker, screenPoint) => {
      dispatch2(
        openMapBadgeDetails({
          projectId,
          marker: {
            id: marker.place.id,
            label: marker.place.label,
            count: marker.place.count,
            detailScope: "coordinate",
            locations: marker.place.locations,
            screenPoint
          }
        })
      );
    },
    [dispatch2, projectId]
  );
  const handleClick = (event) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const hit = findMarkerAt(
      pointInContainer(event, container),
      placedMarkers,
      transformRef.current,
      copyOffsetsRef.current
    );
    if (hit) {
      selectMarker(hit.marker, hit);
    }
  };
  const focusMarker = reactExports.useCallback(
    (marker) => {
      setHovered(marker ? { marker, ...markerScreenPoint(marker) } : null);
    },
    [markerScreenPoint]
  );
  const activateMarker = reactExports.useCallback(
    (marker) => selectMarker(marker, markerScreenPoint(marker)),
    [selectMarker, markerScreenPoint]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative h-full w-full touch-none select-none overflow-hidden bg-def-100",
      ref: containerRef,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "canvas",
          {
            className: cn(
              "absolute inset-0 h-full w-full transition-opacity duration-500",
              geometry ? "opacity-100" : "opacity-0"
            ),
            ref: worldCanvasRef
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "canvas",
          {
            className: "pointer-events-none absolute inset-0 h-full w-full",
            ref: markerCanvasRef
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            "aria-hidden": "true",
            className: "pointer-events-none absolute top-0 left-0 origin-top-left will-change-transform",
            ref: worldRef,
            children: copyOffsets.map((offset) => /* @__PURE__ */ jsxRuntimeExports.jsx(WorldLabels, { labels: visibleLabels, offset }, offset))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MarkerList,
          {
            markers: placedMarkers,
            onActivate: activateMarker,
            onFocus: focusMarker
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "absolute inset-0 active:cursor-grabbing",
              hovered ? "cursor-pointer" : "cursor-grab"
            ),
            onClick: handleClick,
            onPointerLeave: () => hoverAt(null),
            onPointerMove: handlePointerMove
          }
        ),
        hovered ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border bg-card px-2.5 py-1.5 text-xs shadow-lg",
            style: {
              left: hovered.x,
              top: hovered.y - hovered.marker.radius - 8
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: hovered.marker.place.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
                hovered.marker.place.count.toLocaleString(),
                " online"
              ] })
            ]
          }
        ) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-4 bottom-4 flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MapControlButton,
            {
              label: "Zoom in",
              onClick: () => zoomBy(MAP_ZOOM_BUTTON_FACTOR),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MapControlButton,
            {
              label: "Zoom out",
              onClick: () => zoomBy(1 / MAP_ZOOM_BUTTON_FACTOR),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapControlButton, { label: "Show the whole world", onClick: resetZoom, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LocateFixed, { className: "size-4" }) })
        ] })
      ]
    }
  );
}
function MapControlButton({
  label,
  onClick,
  children: children2
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      "aria-label": label,
      className: "flex size-8 items-center justify-center text-muted-foreground transition-colors hover:bg-def-200 hover:text-foreground [&:not(:last-child)]:border-b",
      onClick,
      onMouseDown: (event) => event.stopPropagation(),
      title: label,
      type: "button",
      children: children2
    }
  );
}
const COUNTER_SCALE = "translate(-50%, -50%) scale(var(--map-inverse-k))";
const WorldLabels = reactExports.memo(function WorldLabels2({
  offset,
  labels
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute top-0 left-0",
      style: { transform: `translateX(${offset}px)` },
      children: labels.map((label) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute whitespace-nowrap font-medium text-2xs text-muted-foreground/60 uppercase tracking-widest",
          style: { left: label.x, top: label.y, transform: COUNTER_SCALE },
          children: label.name
        },
        label.name
      ))
    }
  );
});
const MarkerList = reactExports.memo(function MarkerList2({
  markers,
  onFocus,
  onActivate
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { "aria-label": "Visitors online now", className: "sr-only", children: markers.map((marker) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    MarkerListItem,
    {
      marker,
      onActivate,
      onFocus
    },
    marker.id
  )) });
});
const MarkerListItem = reactExports.memo(function MarkerListItem2({
  marker,
  onFocus,
  onActivate
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onBlur: () => onFocus(null),
      onClick: () => onActivate(marker),
      onFocus: () => onFocus(marker),
      type: "button",
      children: [
        marker.place.label,
        ", ",
        marker.place.count,
        " online"
      ]
    }
  ) });
});
const Map$1 = ({ projectId, markers }) => {
  const containerRef = reactExports.useRef(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-full w-full", ref: containerRef, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(RealtimeMap, { markers, projectId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MapBadgeDetails, { containerRef })
  ] });
};
const FEED_REFRESH_MS = 5e3;
const SUMMARY_REFRESH_MS = 2e4;
const RealtimeReloader = ({ projectId }) => {
  const client = useQueryClient();
  const trpc = useTRPC();
  const hasNewEvents = reactExports.useRef(false);
  useWS(`/live/events/${projectId}`, () => {
    hasNewEvents.current = true;
  });
  reactExports.useEffect(() => {
    const refreshFeeds = () => {
      if (document.hidden || !hasNewEvents.current) {
        return;
      }
      hasNewEvents.current = false;
      client.refetchQueries(
        trpc.realtime.recentSessions.queryFilter({ projectId })
      );
      client.refetchQueries(
        trpc.realtime.activeSessions.queryFilter({ projectId })
      );
    };
    const refreshSummaries = () => {
      if (document.hidden) {
        return;
      }
      client.refetchQueries(
        trpc.realtime.coordinates.queryFilter({ projectId })
      );
      client.refetchQueries(trpc.realtime.histogram.queryFilter({ projectId }));
      client.refetchQueries(
        trpc.realtime.topSources.queryFilter({ projectId })
      );
    };
    const feeds = setInterval(refreshFeeds, FEED_REFRESH_MS);
    const summaries = setInterval(refreshSummaries, SUMMARY_REFRESH_MS);
    return () => {
      clearInterval(feeds);
      clearInterval(summaries);
    };
  }, [client, trpc, projectId]);
  return null;
};
function Component() {
  const {
    projectId
  } = Route.useParams();
  const trpc = useTRPC();
  const coordinatesQuery = useQuery(trpc.realtime.coordinates.queryOptions({
    projectId
  }, {
    placeholderData: keepPreviousData
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Fullscreen, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FullscreenClose, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RealtimeReloader, { projectId }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-svh w-full overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Map$1, { markers: coordinatesQuery.data ?? [], projectId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RealtimeLiveOverlays, { projectId }, projectId)
    ] })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.realtime-CJQduWfC.js.map
