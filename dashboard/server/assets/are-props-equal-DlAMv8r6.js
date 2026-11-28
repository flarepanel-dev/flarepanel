import { h7 as _curry3, h8 as path } from "./router-gBnYxPzA.js";
import "./worker-entry-C5kSRogq.js";
import { a as _curry2 } from "./pick-CfnSzKDx.js";
function is(x, y) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}
function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true;
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }
  return true;
}
var defaultTo = /* @__PURE__ */ _curry2(function defaultTo2(d, v) {
  return v == null || v !== v ? d : v;
});
var pathOr = /* @__PURE__ */ _curry3(function pathOr2(d, p, obj) {
  return defaultTo(d, path(p, obj));
});
function arePropsEqual(paths) {
  return (prevProps, nextProps) => paths.every(
    (path2) => shallowEqual(
      pathOr(void 0, path2.split("."), prevProps),
      pathOr(void 0, path2.split("."), nextProps)
    )
  );
}
export {
  arePropsEqual as a
};
//# sourceMappingURL=are-props-equal-DlAMv8r6.js.map
