import { a as reactExports, g as getDefaultExportFromCjs, F as requireReact, c as requireReactDom, o as jsxRuntimeExports, R as React } from "./worker-entry-C5kSRogq.js";
import { dC as ReactDOM2, dD as clsx$1, dE as GRID_GAP, dF as GRID_ROW_HEIGHT, dG as GRID_COLUMNS } from "./router-gBnYxPzA.js";
function calcGridColWidth(positionParams) {
  const { margin, containerPadding, containerWidth, cols } = positionParams;
  return (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols;
}
function calcGridItemWHPx(gridUnits, colOrRowSize, marginPx) {
  if (!Number.isFinite(gridUnits)) return gridUnits;
  return Math.round(
    colOrRowSize * gridUnits + Math.max(0, gridUnits - 1) * marginPx
  );
}
function calcGridItemPosition(positionParams, x, y, w, h, dragPosition, resizePosition) {
  const { margin, containerPadding, rowHeight } = positionParams;
  const colWidth = calcGridColWidth(positionParams);
  let width;
  let height;
  let top;
  let left;
  if (resizePosition) {
    width = Math.round(resizePosition.width);
    height = Math.round(resizePosition.height);
  } else {
    width = calcGridItemWHPx(w, colWidth, margin[0]);
    height = calcGridItemWHPx(h, rowHeight, margin[1]);
  }
  if (dragPosition) {
    top = Math.round(dragPosition.top);
    left = Math.round(dragPosition.left);
  } else if (resizePosition) {
    top = Math.round(resizePosition.top);
    left = Math.round(resizePosition.left);
  } else {
    top = Math.round((rowHeight + margin[1]) * y + containerPadding[1]);
    left = Math.round((colWidth + margin[0]) * x + containerPadding[0]);
  }
  if (!dragPosition && !resizePosition) {
    if (Number.isFinite(w)) {
      const siblingLeft = Math.round(
        (colWidth + margin[0]) * (x + w) + containerPadding[0]
      );
      const actualMarginRight = siblingLeft - left - width;
      if (actualMarginRight !== margin[0]) {
        width += actualMarginRight - margin[0];
      }
    }
    if (Number.isFinite(h)) {
      const siblingTop = Math.round(
        (rowHeight + margin[1]) * (y + h) + containerPadding[1]
      );
      const actualMarginBottom = siblingTop - top - height;
      if (actualMarginBottom !== margin[1]) {
        height += actualMarginBottom - margin[1];
      }
    }
  }
  return { top, left, width, height };
}
function calcXY(positionParams, top, left, w, h) {
  const { margin, containerPadding, cols, rowHeight, maxRows } = positionParams;
  const colWidth = calcGridColWidth(positionParams);
  let x = Math.round((left - containerPadding[0]) / (colWidth + margin[0]));
  let y = Math.round((top - containerPadding[1]) / (rowHeight + margin[1]));
  x = clamp$1(x, 0, cols - w);
  y = clamp$1(y, 0, maxRows - h);
  return { x, y };
}
function calcXYRaw(positionParams, top, left) {
  const { margin, containerPadding, rowHeight } = positionParams;
  const colWidth = calcGridColWidth(positionParams);
  const x = Math.round((left - containerPadding[0]) / (colWidth + margin[0]));
  const y = Math.round((top - containerPadding[1]) / (rowHeight + margin[1]));
  return { x, y };
}
function calcWHRaw(positionParams, width, height) {
  const { margin, rowHeight } = positionParams;
  const colWidth = calcGridColWidth(positionParams);
  const w = Math.max(
    1,
    Math.round((width + margin[0]) / (colWidth + margin[0]))
  );
  const h = Math.max(
    1,
    Math.round((height + margin[1]) / (rowHeight + margin[1]))
  );
  return { w, h };
}
function clamp$1(num, lowerBound, upperBound) {
  return Math.max(Math.min(num, upperBound), lowerBound);
}
function collides(l1, l2) {
  if (l1.i === l2.i) return false;
  if (l1.x + l1.w <= l2.x) return false;
  if (l1.x >= l2.x + l2.w) return false;
  if (l1.y + l1.h <= l2.y) return false;
  if (l1.y >= l2.y + l2.h) return false;
  return true;
}
function getFirstCollision(layout, layoutItem) {
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== void 0 && collides(item, layoutItem)) {
      return item;
    }
  }
  return void 0;
}
function getAllCollisions(layout, layoutItem) {
  return layout.filter((l) => collides(l, layoutItem));
}
function sortLayoutItems(layout, compactType) {
  if (compactType === "horizontal") {
    return sortLayoutItemsByColRow(layout);
  }
  if (compactType === "vertical") {
    return sortLayoutItemsByRowCol(layout);
  }
  if (compactType === "wrap") {
    return sortLayoutItemsByRowCol(layout);
  }
  return [...layout];
}
function sortLayoutItemsByRowCol(layout) {
  return [...layout].sort((a, b) => {
    if (a.y !== b.y) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });
}
function sortLayoutItemsByColRow(layout) {
  return [...layout].sort((a, b) => {
    if (a.x !== b.x) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });
}
function bottom(layout) {
  let max = 0;
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== void 0) {
      const bottomY = item.y + item.h;
      if (bottomY > max) max = bottomY;
    }
  }
  return max;
}
function getLayoutItem(layout, id) {
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== void 0 && item.i === id) {
      return item;
    }
  }
  return void 0;
}
function getStatics(layout) {
  return layout.filter((l) => l.static === true);
}
function cloneLayoutItem(layoutItem) {
  return {
    i: layoutItem.i,
    x: layoutItem.x,
    y: layoutItem.y,
    w: layoutItem.w,
    h: layoutItem.h,
    minW: layoutItem.minW,
    maxW: layoutItem.maxW,
    minH: layoutItem.minH,
    maxH: layoutItem.maxH,
    moved: Boolean(layoutItem.moved),
    static: Boolean(layoutItem.static),
    isDraggable: layoutItem.isDraggable,
    isResizable: layoutItem.isResizable,
    resizeHandles: layoutItem.resizeHandles,
    constraints: layoutItem.constraints,
    isBounded: layoutItem.isBounded
  };
}
function cloneLayout(layout) {
  const newLayout = new Array(layout.length);
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== void 0) {
      newLayout[i] = cloneLayoutItem(item);
    }
  }
  return newLayout;
}
function modifyLayout(layout, layoutItem) {
  const newLayout = new Array(layout.length);
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== void 0) {
      if (layoutItem.i === item.i) {
        newLayout[i] = layoutItem;
      } else {
        newLayout[i] = item;
      }
    }
  }
  return newLayout;
}
function withLayoutItem(layout, itemKey, cb) {
  let item = getLayoutItem(layout, itemKey);
  if (!item) {
    return [[...layout], null];
  }
  item = cb(cloneLayoutItem(item));
  const newLayout = modifyLayout(layout, item);
  return [newLayout, item];
}
function correctBounds(layout, bounds) {
  const collidesWith = getStatics(layout);
  for (let i = 0; i < layout.length; i++) {
    const l = layout[i];
    if (l === void 0) continue;
    if (l.x + l.w > bounds.cols) {
      l.x = bounds.cols - l.w;
    }
    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }
    if (l.y === Infinity) {
      l.y = bottom(collidesWith);
    }
    if (!l.static) {
      collidesWith.push(l);
    } else {
      while (getFirstCollision(collidesWith, l)) {
        l.y++;
      }
    }
  }
  return layout;
}
function moveElement(layout, l, x, y, isUserAction, preventCollision, compactType, cols, allowOverlap) {
  if (l.static && l.isDraggable !== true) {
    return [...layout];
  }
  if (l.y === y && l.x === x) {
    return [...layout];
  }
  const oldX = l.x;
  const oldY = l.y;
  if (typeof x === "number") l.x = x;
  if (typeof y === "number") l.y = y;
  l.moved = true;
  let sorted = sortLayoutItems(layout, compactType);
  const movingUp = compactType === "vertical" && typeof y === "number" ? oldY >= y : compactType === "horizontal" && typeof x === "number" ? oldX >= x : false;
  if (movingUp) {
    sorted = sorted.reverse();
  }
  const collisions = getAllCollisions(sorted, l);
  const hasCollisions = collisions.length > 0;
  if (hasCollisions && allowOverlap) {
    return cloneLayout(layout);
  }
  if (hasCollisions && preventCollision) {
    l.x = oldX;
    l.y = oldY;
    l.moved = false;
    return layout;
  }
  let resultLayout = [...layout];
  for (let i = 0; i < collisions.length; i++) {
    const collision = collisions[i];
    if (collision === void 0) continue;
    if (collision.moved) continue;
    if (collision.static) {
      resultLayout = moveElementAwayFromCollision(
        resultLayout,
        collision,
        l,
        isUserAction,
        compactType
      );
    } else {
      resultLayout = moveElementAwayFromCollision(
        resultLayout,
        l,
        collision,
        isUserAction,
        compactType
      );
    }
  }
  return resultLayout;
}
function moveElementAwayFromCollision(layout, collidesWith, itemToMove, isUserAction, compactType, cols) {
  const compactH = compactType === "horizontal" || compactType === "wrap";
  const compactV = compactType === "vertical";
  const preventCollision = collidesWith.static;
  if (isUserAction) {
    isUserAction = false;
    const fakeItem = {
      x: compactH ? Math.max(collidesWith.x - itemToMove.w, 0) : itemToMove.x,
      y: compactV ? Math.max(collidesWith.y - itemToMove.h, 0) : itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: "-1"
    };
    const firstCollision = getFirstCollision(layout, fakeItem);
    const collisionNorth = firstCollision !== void 0 && firstCollision.y + firstCollision.h > collidesWith.y;
    const collisionWest = firstCollision !== void 0 && collidesWith.x + collidesWith.w > firstCollision.x;
    if (!firstCollision) {
      return moveElement(
        layout,
        itemToMove,
        compactH ? fakeItem.x : void 0,
        compactV ? fakeItem.y : void 0,
        isUserAction,
        preventCollision,
        compactType
      );
    }
    if (collisionNorth && compactV) {
      return moveElement(
        layout,
        itemToMove,
        void 0,
        itemToMove.y + 1,
        isUserAction,
        preventCollision,
        compactType
      );
    }
    if (collisionNorth && compactType === null) {
      const newCollidesY = itemToMove.y;
      collidesWith.y = newCollidesY;
      itemToMove.y = newCollidesY + collidesWith.h;
      return [...layout];
    }
    if (collisionWest && compactH) {
      return moveElement(
        layout,
        collidesWith,
        itemToMove.x,
        void 0,
        isUserAction,
        preventCollision,
        compactType
      );
    }
  }
  const newX = compactH ? itemToMove.x + 1 : void 0;
  const newY = compactV ? itemToMove.y + 1 : void 0;
  if (newX === void 0 && newY === void 0) {
    return [...layout];
  }
  return moveElement(
    layout,
    itemToMove,
    newX,
    newY,
    isUserAction,
    preventCollision,
    compactType
  );
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
var gridBounds = {
  name: "gridBounds",
  constrainPosition(item, x, y, { cols, maxRows }) {
    return {
      x: clamp(x, 0, Math.max(0, cols - item.w)),
      y: clamp(y, 0, Math.max(0, maxRows - item.h))
    };
  },
  constrainSize(item, w, h, handle, { cols, maxRows }) {
    const maxW = handle === "w" || handle === "nw" || handle === "sw" ? item.x + item.w : cols - item.x;
    const maxH = handle === "n" || handle === "nw" || handle === "ne" ? item.y + item.h : maxRows - item.y;
    return {
      w: clamp(w, 1, Math.max(1, maxW)),
      h: clamp(h, 1, Math.max(1, maxH))
    };
  }
};
var minMaxSize = {
  name: "minMaxSize",
  constrainSize(item, w, h) {
    return {
      w: clamp(w, item.minW ?? 1, item.maxW ?? Infinity),
      h: clamp(h, item.minH ?? 1, item.maxH ?? Infinity)
    };
  }
};
var defaultConstraints = [gridBounds, minMaxSize];
function applyPositionConstraints(constraints, item, x, y, context) {
  let result = { x, y };
  for (const constraint of constraints) {
    if (constraint.constrainPosition) {
      result = constraint.constrainPosition(item, result.x, result.y, context);
    }
  }
  if (item.constraints) {
    for (const constraint of item.constraints) {
      if (constraint.constrainPosition) {
        result = constraint.constrainPosition(
          item,
          result.x,
          result.y,
          context
        );
      }
    }
  }
  return result;
}
function applySizeConstraints(constraints, item, w, h, handle, context) {
  let result = { w, h };
  for (const constraint of constraints) {
    if (constraint.constrainSize) {
      result = constraint.constrainSize(
        item,
        result.w,
        result.h,
        handle,
        context
      );
    }
  }
  if (item.constraints) {
    for (const constraint of item.constraints) {
      if (constraint.constrainSize) {
        result = constraint.constrainSize(
          item,
          result.w,
          result.h,
          handle,
          context
        );
      }
    }
  }
  return result;
}
function setTransform({
  top,
  left,
  width,
  height
}) {
  const translate = `translate(${left}px,${top}px)`;
  return {
    transform: translate,
    WebkitTransform: translate,
    MozTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: `${width}px`,
    height: `${height}px`,
    position: "absolute"
  };
}
function setTopLeft({
  top,
  left,
  width,
  height
}) {
  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    position: "absolute"
  };
}
function perc(num) {
  return num * 100 + "%";
}
function constrainWidth(left, currentWidth, newWidth, containerWidth) {
  return left + newWidth > containerWidth ? currentWidth : newWidth;
}
function constrainHeight(top, currentHeight, newHeight) {
  return top < 0 ? currentHeight : newHeight;
}
function constrainLeft(left) {
  return Math.max(0, left);
}
function constrainTop(top) {
  return Math.max(0, top);
}
var resizeNorth = (currentSize, newSize, _containerWidth) => {
  const { left, height, width } = newSize;
  const top = currentSize.top - (height - currentSize.height);
  return {
    left,
    width,
    height: constrainHeight(top, currentSize.height, height),
    top: constrainTop(top)
  };
};
var resizeEast = (currentSize, newSize, containerWidth) => {
  const { top, left, height, width } = newSize;
  return {
    top,
    height,
    width: constrainWidth(
      currentSize.left,
      currentSize.width,
      width,
      containerWidth
    ),
    left: constrainLeft(left)
  };
};
var resizeWest = (currentSize, newSize, _containerWidth) => {
  const { top, height, width } = newSize;
  const left = currentSize.left + currentSize.width - width;
  if (left < 0) {
    return {
      height,
      width: currentSize.left + currentSize.width,
      top: constrainTop(top),
      left: 0
    };
  }
  return {
    height,
    width,
    top: constrainTop(top),
    left
  };
};
var resizeSouth = (currentSize, newSize, _containerWidth) => {
  const { top, left, height, width } = newSize;
  return {
    width,
    left,
    height: constrainHeight(top, currentSize.height, height),
    top: constrainTop(top)
  };
};
var resizeNorthEast = (currentSize, newSize, containerWidth) => resizeNorth(
  currentSize,
  resizeEast(currentSize, newSize, containerWidth)
);
var resizeNorthWest = (currentSize, newSize, containerWidth) => resizeNorth(
  currentSize,
  resizeWest(currentSize, newSize)
);
var resizeSouthEast = (currentSize, newSize, containerWidth) => resizeSouth(
  currentSize,
  resizeEast(currentSize, newSize, containerWidth)
);
var resizeSouthWest = (currentSize, newSize, containerWidth) => resizeSouth(
  currentSize,
  resizeWest(currentSize, newSize)
);
var resizeHandlerMap = {
  n: resizeNorth,
  ne: resizeNorthEast,
  e: resizeEast,
  se: resizeSouthEast,
  s: resizeSouth,
  sw: resizeSouthWest,
  w: resizeWest,
  nw: resizeNorthWest
};
function resizeItemInDirection(direction, currentSize, newSize, containerWidth) {
  const handler = resizeHandlerMap[direction];
  if (!handler) {
    return newSize;
  }
  return handler(currentSize, { ...currentSize, ...newSize }, containerWidth);
}
var transformStrategy = {
  type: "transform",
  scale: 1,
  calcStyle(pos) {
    return setTransform(pos);
  }
};
var defaultPositionStrategy = transformStrategy;
var defaultGridConfig = {
  cols: 12,
  rowHeight: 150,
  margin: [10, 10],
  containerPadding: null,
  maxRows: Infinity
};
var defaultDragConfig = {
  enabled: true,
  bounded: false,
  threshold: 3
};
var defaultResizeConfig = {
  enabled: true,
  handles: ["se"]
};
var defaultDropConfig = {
  enabled: false,
  defaultItem: { w: 1, h: 1 },
  touchEnabled: true,
  touchDragSource: "[data-rgl-draggable]"
};
function resolveCompactionCollision(layout, item, moveToCoord, axis, hasStatics) {
  const sizeProp = axis === "x" ? "w" : "h";
  item[axis] += 1;
  const itemIndex = layout.findIndex((l) => l.i === item.i);
  const layoutHasStatics = hasStatics ?? getStatics(layout).length > 0;
  for (let i = itemIndex + 1; i < layout.length; i++) {
    const otherItem = layout[i];
    if (otherItem === void 0) continue;
    if (otherItem.static) continue;
    if (!layoutHasStatics && otherItem.y > item.y + item.h) break;
    if (collides(item, otherItem)) {
      resolveCompactionCollision(
        layout,
        otherItem,
        moveToCoord + item[sizeProp],
        axis,
        layoutHasStatics
      );
    }
  }
  item[axis] = moveToCoord;
}
function compactItemVertical(compareWith, l, fullLayout, maxY) {
  l.x = Math.max(l.x, 0);
  l.y = Math.max(l.y, 0);
  l.y = Math.min(maxY, l.y);
  while (l.y > 0 && !getFirstCollision(compareWith, l)) {
    l.y--;
  }
  let collision;
  while ((collision = getFirstCollision(compareWith, l)) !== void 0) {
    resolveCompactionCollision(fullLayout, l, collision.y + collision.h, "y");
  }
  l.y = Math.max(l.y, 0);
  return l;
}
function compactItemHorizontal(compareWith, l, cols, fullLayout) {
  l.x = Math.max(l.x, 0);
  l.y = Math.max(l.y, 0);
  while (l.x > 0 && !getFirstCollision(compareWith, l)) {
    l.x--;
  }
  let collision;
  while ((collision = getFirstCollision(compareWith, l)) !== void 0) {
    resolveCompactionCollision(fullLayout, l, collision.x + collision.w, "x");
    if (l.x + l.w > cols) {
      l.x = cols - l.w;
      l.y++;
      while (l.x > 0 && !getFirstCollision(compareWith, l)) {
        l.x--;
      }
    }
  }
  l.x = Math.max(l.x, 0);
  return l;
}
var verticalCompactor = {
  type: "vertical",
  allowOverlap: false,
  compact(layout, _cols) {
    const compareWith = getStatics(layout);
    let maxY = bottom(compareWith);
    const sorted = sortLayoutItemsByRowCol(layout);
    const out = new Array(layout.length);
    for (let i = 0; i < sorted.length; i++) {
      const sortedItem = sorted[i];
      if (sortedItem === void 0) continue;
      let l = cloneLayoutItem(sortedItem);
      if (!l.static) {
        l = compactItemVertical(compareWith, l, sorted, maxY);
        maxY = Math.max(maxY, l.y + l.h);
        compareWith.push(l);
      }
      const originalIndex = layout.indexOf(sortedItem);
      out[originalIndex] = l;
      l.moved = false;
    }
    return out;
  }
};
var horizontalCompactor = {
  type: "horizontal",
  allowOverlap: false,
  compact(layout, cols) {
    const compareWith = getStatics(layout);
    const sorted = sortLayoutItemsByColRow(layout);
    const out = new Array(layout.length);
    for (let i = 0; i < sorted.length; i++) {
      const sortedItem = sorted[i];
      if (sortedItem === void 0) continue;
      let l = cloneLayoutItem(sortedItem);
      if (!l.static) {
        l = compactItemHorizontal(compareWith, l, cols, sorted);
        compareWith.push(l);
      }
      const originalIndex = layout.indexOf(sortedItem);
      out[originalIndex] = l;
      l.moved = false;
    }
    return out;
  }
};
var noCompactor = {
  type: null,
  allowOverlap: false,
  compact(layout, _cols) {
    return cloneLayout(layout);
  }
};
var verticalOverlapCompactor = {
  ...verticalCompactor,
  allowOverlap: true,
  compact(layout, _cols) {
    return cloneLayout(layout);
  }
};
var horizontalOverlapCompactor = {
  ...horizontalCompactor,
  allowOverlap: true,
  compact(layout, _cols) {
    return cloneLayout(layout);
  }
};
var noOverlapCompactor = {
  ...noCompactor,
  allowOverlap: true
};
function getCompactor(compactType, allowOverlap = false, preventCollision = false) {
  let baseCompactor;
  if (allowOverlap) {
    if (compactType === "vertical") baseCompactor = verticalOverlapCompactor;
    else if (compactType === "horizontal")
      baseCompactor = horizontalOverlapCompactor;
    else baseCompactor = noOverlapCompactor;
  } else {
    if (compactType === "vertical") baseCompactor = verticalCompactor;
    else if (compactType === "horizontal") baseCompactor = horizontalCompactor;
    else baseCompactor = noCompactor;
  }
  if (preventCollision) {
    return { ...baseCompactor, preventCollision };
  }
  return baseCompactor;
}
function sortBreakpoints(breakpoints) {
  const keys = Object.keys(breakpoints);
  return keys.sort((a, b) => breakpoints[a] - breakpoints[b]);
}
function getBreakpointFromWidth(breakpoints, width) {
  const sorted = sortBreakpoints(breakpoints);
  let matching = sorted[0];
  if (matching === void 0) {
    throw new Error("No breakpoints defined");
  }
  for (let i = 1; i < sorted.length; i++) {
    const breakpointName = sorted[i];
    if (breakpointName === void 0) continue;
    const breakpointWidth = breakpoints[breakpointName];
    if (width > breakpointWidth) {
      matching = breakpointName;
    }
  }
  return matching;
}
function getColsFromBreakpoint(breakpoint, cols) {
  const colCount = cols[breakpoint];
  if (colCount === void 0) {
    throw new Error(
      `ResponsiveReactGridLayout: \`cols\` entry for breakpoint ${String(breakpoint)} is missing!`
    );
  }
  return colCount;
}
function findOrGenerateResponsiveLayout(layouts, breakpoints, breakpoint, lastBreakpoint, cols, compactTypeOrCompactor) {
  const existingLayout = layouts[breakpoint];
  if (existingLayout) {
    return cloneLayout(existingLayout);
  }
  let layout = layouts[lastBreakpoint];
  const breakpointsSorted = sortBreakpoints(breakpoints);
  const breakpointsAbove = breakpointsSorted.slice(
    breakpointsSorted.indexOf(breakpoint)
  );
  for (let i = 0; i < breakpointsAbove.length; i++) {
    const b = breakpointsAbove[i];
    if (b === void 0) continue;
    const layoutForBreakpoint = layouts[b];
    if (layoutForBreakpoint) {
      layout = layoutForBreakpoint;
      break;
    }
  }
  const clonedLayout = cloneLayout(layout || []);
  const corrected = correctBounds(clonedLayout, { cols });
  const compactor = typeof compactTypeOrCompactor === "object" && compactTypeOrCompactor !== null ? compactTypeOrCompactor : getCompactor(compactTypeOrCompactor);
  return compactor.compact(corrected, cols);
}
function getIndentationValue(value, breakpoint) {
  if (Array.isArray(value)) {
    return value;
  }
  const breakpointMap = value;
  const breakpointValue = breakpointMap[breakpoint];
  if (breakpointValue !== void 0) {
    return breakpointValue;
  }
  const keys = Object.keys(breakpointMap);
  for (const key of keys) {
    const v = breakpointMap[key];
    if (v !== void 0) {
      return v;
    }
  }
  return [10, 10];
}
function createDefaultIsNestedEqual(comparator) {
  return function isEqual(a, b, _indexOrKeyA, _indexOrKeyB, _parentA, _parentB, meta) {
    return comparator(a, b, meta);
  };
}
function createIsCircular(areItemsEqual) {
  return function isCircular(a, b, isEqual, cache) {
    if (!a || !b || typeof a !== "object" || typeof b !== "object") {
      return areItemsEqual(a, b, isEqual, cache);
    }
    var cachedA = cache.get(a);
    var cachedB = cache.get(b);
    if (cachedA && cachedB) {
      return cachedA === b && cachedB === a;
    }
    cache.set(a, b);
    cache.set(b, a);
    var result = areItemsEqual(a, b, isEqual, cache);
    cache.delete(a);
    cache.delete(b);
    return result;
  };
}
function merge(a, b) {
  var merged = {};
  for (var key in a) {
    merged[key] = a[key];
  }
  for (var key in b) {
    merged[key] = b[key];
  }
  return merged;
}
function isPlainObject(value) {
  return value.constructor === Object || value.constructor == null;
}
function isPromiseLike(value) {
  return typeof value.then === "function";
}
function sameValueZeroEqual(a, b) {
  return a === b || a !== a && b !== b;
}
var ARGUMENTS_TAG = "[object Arguments]";
var BOOLEAN_TAG = "[object Boolean]";
var DATE_TAG = "[object Date]";
var REG_EXP_TAG = "[object RegExp]";
var MAP_TAG = "[object Map]";
var NUMBER_TAG = "[object Number]";
var OBJECT_TAG = "[object Object]";
var SET_TAG = "[object Set]";
var STRING_TAG = "[object String]";
var toString = Object.prototype.toString;
function createComparator(_a) {
  var areArraysEqual2 = _a.areArraysEqual, areDatesEqual2 = _a.areDatesEqual, areMapsEqual2 = _a.areMapsEqual, areObjectsEqual2 = _a.areObjectsEqual, areRegExpsEqual2 = _a.areRegExpsEqual, areSetsEqual2 = _a.areSetsEqual, createIsNestedEqual = _a.createIsNestedEqual;
  var isEqual = createIsNestedEqual(comparator);
  function comparator(a, b, meta) {
    if (a === b) {
      return true;
    }
    if (!a || !b || typeof a !== "object" || typeof b !== "object") {
      return a !== a && b !== b;
    }
    if (isPlainObject(a) && isPlainObject(b)) {
      return areObjectsEqual2(a, b, isEqual, meta);
    }
    var aArray = Array.isArray(a);
    var bArray = Array.isArray(b);
    if (aArray || bArray) {
      return aArray === bArray && areArraysEqual2(a, b, isEqual, meta);
    }
    var aTag = toString.call(a);
    if (aTag !== toString.call(b)) {
      return false;
    }
    if (aTag === DATE_TAG) {
      return areDatesEqual2(a, b, isEqual, meta);
    }
    if (aTag === REG_EXP_TAG) {
      return areRegExpsEqual2(a, b, isEqual, meta);
    }
    if (aTag === MAP_TAG) {
      return areMapsEqual2(a, b, isEqual, meta);
    }
    if (aTag === SET_TAG) {
      return areSetsEqual2(a, b, isEqual, meta);
    }
    if (aTag === OBJECT_TAG || aTag === ARGUMENTS_TAG) {
      return isPromiseLike(a) || isPromiseLike(b) ? false : areObjectsEqual2(a, b, isEqual, meta);
    }
    if (aTag === BOOLEAN_TAG || aTag === NUMBER_TAG || aTag === STRING_TAG) {
      return sameValueZeroEqual(a.valueOf(), b.valueOf());
    }
    return false;
  }
  return comparator;
}
function areArraysEqual(a, b, isEqual, meta) {
  var index = a.length;
  if (b.length !== index) {
    return false;
  }
  while (index-- > 0) {
    if (!isEqual(a[index], b[index], index, index, a, b, meta)) {
      return false;
    }
  }
  return true;
}
var areArraysEqualCircular = createIsCircular(areArraysEqual);
function areDatesEqual(a, b) {
  return sameValueZeroEqual(a.valueOf(), b.valueOf());
}
function areMapsEqual(a, b, isEqual, meta) {
  var isValueEqual = a.size === b.size;
  if (!isValueEqual) {
    return false;
  }
  if (!a.size) {
    return true;
  }
  var matchedIndices = {};
  var indexA = 0;
  a.forEach(function(aValue, aKey) {
    if (!isValueEqual) {
      return;
    }
    var hasMatch = false;
    var matchIndexB = 0;
    b.forEach(function(bValue, bKey) {
      if (!hasMatch && !matchedIndices[matchIndexB] && (hasMatch = isEqual(aKey, bKey, indexA, matchIndexB, a, b, meta) && isEqual(aValue, bValue, aKey, bKey, a, b, meta))) {
        matchedIndices[matchIndexB] = true;
      }
      matchIndexB++;
    });
    indexA++;
    isValueEqual = hasMatch;
  });
  return isValueEqual;
}
var areMapsEqualCircular = createIsCircular(areMapsEqual);
var OWNER = "_owner";
var hasOwnProperty = Object.prototype.hasOwnProperty;
function areObjectsEqual(a, b, isEqual, meta) {
  var keysA = Object.keys(a);
  var index = keysA.length;
  if (Object.keys(b).length !== index) {
    return false;
  }
  var key;
  while (index-- > 0) {
    key = keysA[index];
    if (key === OWNER) {
      var reactElementA = !!a.$$typeof;
      var reactElementB = !!b.$$typeof;
      if ((reactElementA || reactElementB) && reactElementA !== reactElementB) {
        return false;
      }
    }
    if (!hasOwnProperty.call(b, key) || !isEqual(a[key], b[key], key, key, a, b, meta)) {
      return false;
    }
  }
  return true;
}
var areObjectsEqualCircular = createIsCircular(areObjectsEqual);
function areRegExpsEqual(a, b) {
  return a.source === b.source && a.flags === b.flags;
}
function areSetsEqual(a, b, isEqual, meta) {
  var isValueEqual = a.size === b.size;
  if (!isValueEqual) {
    return false;
  }
  if (!a.size) {
    return true;
  }
  var matchedIndices = {};
  a.forEach(function(aValue, aKey) {
    if (!isValueEqual) {
      return;
    }
    var hasMatch = false;
    var matchIndex = 0;
    b.forEach(function(bValue, bKey) {
      if (!hasMatch && !matchedIndices[matchIndex] && (hasMatch = isEqual(aValue, bValue, aKey, bKey, a, b, meta))) {
        matchedIndices[matchIndex] = true;
      }
      matchIndex++;
    });
    isValueEqual = hasMatch;
  });
  return isValueEqual;
}
var areSetsEqualCircular = createIsCircular(areSetsEqual);
var DEFAULT_CONFIG = Object.freeze({
  areArraysEqual,
  areDatesEqual,
  areMapsEqual,
  areObjectsEqual,
  areRegExpsEqual,
  areSetsEqual,
  createIsNestedEqual: createDefaultIsNestedEqual
});
var DEFAULT_CIRCULAR_CONFIG = Object.freeze({
  areArraysEqual: areArraysEqualCircular,
  areDatesEqual,
  areMapsEqual: areMapsEqualCircular,
  areObjectsEqual: areObjectsEqualCircular,
  areRegExpsEqual,
  areSetsEqual: areSetsEqualCircular,
  createIsNestedEqual: createDefaultIsNestedEqual
});
var isDeepEqual = createComparator(DEFAULT_CONFIG);
function deepEqual(a, b) {
  return isDeepEqual(a, b, void 0);
}
createComparator(merge(DEFAULT_CONFIG, { createIsNestedEqual: function() {
  return sameValueZeroEqual;
} }));
createComparator(DEFAULT_CIRCULAR_CONFIG);
createComparator(merge(DEFAULT_CIRCULAR_CONFIG, {
  createIsNestedEqual: function() {
    return sameValueZeroEqual;
  }
}));
function getContentWidth(node) {
  const style = typeof globalThis.getComputedStyle === "function" ? globalThis.getComputedStyle(node) : null;
  if (!style) return node.clientWidth;
  const px = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const computed = Number.parseFloat(style.width);
  if (Number.isFinite(computed)) return Math.max(0, computed);
  return Math.max(
    0,
    node.clientWidth - px(style.paddingLeft) - px(style.paddingRight)
  );
}
function useContainerWidth(options = {}) {
  const {
    measureBeforeMount = false,
    initialWidth = 1280,
    debounceTimeout
  } = options;
  const [width, setWidth] = reactExports.useState(initialWidth);
  const [mounted, setMounted] = reactExports.useState(!measureBeforeMount);
  const containerRef = reactExports.useRef(null);
  const observerRef = reactExports.useRef(null);
  const measureWidth = reactExports.useCallback(() => {
    const node = containerRef.current;
    if (node) {
      const newWidth = Math.round(getContentWidth(node));
      setWidth((prev) => prev === newWidth ? prev : newWidth);
      if (!mounted) {
        setMounted(true);
      }
    }
  }, [mounted]);
  reactExports.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    measureWidth();
    if (typeof ResizeObserver !== "undefined") {
      let rafId = null;
      let debounceTimer;
      observerRef.current = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const newWidth = Math.round(entry.contentRect.width);
          if (debounceTimeout && debounceTimeout > 0) {
            window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(() => {
              setWidth((prev) => prev === newWidth ? prev : newWidth);
              debounceTimer = void 0;
            }, debounceTimeout);
            return;
          }
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
          }
          rafId = requestAnimationFrame(() => {
            setWidth((prev) => prev === newWidth ? prev : newWidth);
            rafId = null;
          });
        }
      });
      observerRef.current.observe(node);
      return () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        window.clearTimeout(debounceTimer);
        debounceTimer = void 0;
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      };
    }
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [measureWidth, debounceTimeout]);
  return {
    width,
    mounted,
    containerRef,
    measureWidth
  };
}
var propTypes$1 = { exports: {} };
var ReactPropTypesSecret_1;
var hasRequiredReactPropTypesSecret;
function requireReactPropTypesSecret() {
  if (hasRequiredReactPropTypesSecret) return ReactPropTypesSecret_1;
  hasRequiredReactPropTypesSecret = 1;
  var ReactPropTypesSecret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  ReactPropTypesSecret_1 = ReactPropTypesSecret;
  return ReactPropTypesSecret_1;
}
var factoryWithThrowingShims;
var hasRequiredFactoryWithThrowingShims;
function requireFactoryWithThrowingShims() {
  if (hasRequiredFactoryWithThrowingShims) return factoryWithThrowingShims;
  hasRequiredFactoryWithThrowingShims = 1;
  var ReactPropTypesSecret = /* @__PURE__ */ requireReactPropTypesSecret();
  function emptyFunction() {
  }
  function emptyFunctionWithReset() {
  }
  emptyFunctionWithReset.resetWarningCache = emptyFunction;
  factoryWithThrowingShims = function() {
    function shim(props, propName, componentName, location, propFullName, secret) {
      if (secret === ReactPropTypesSecret) {
        return;
      }
      var err = new Error(
        "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
      );
      err.name = "Invariant Violation";
      throw err;
    }
    shim.isRequired = shim;
    function getShim() {
      return shim;
    }
    var ReactPropTypes = {
      array: shim,
      bigint: shim,
      bool: shim,
      func: shim,
      number: shim,
      object: shim,
      string: shim,
      symbol: shim,
      any: shim,
      arrayOf: getShim,
      element: shim,
      elementType: shim,
      instanceOf: getShim,
      node: shim,
      objectOf: getShim,
      oneOf: getShim,
      oneOfType: getShim,
      shape: getShim,
      exact: getShim,
      checkPropTypes: emptyFunctionWithReset,
      resetWarningCache: emptyFunction
    };
    ReactPropTypes.PropTypes = ReactPropTypes;
    return ReactPropTypes;
  };
  return factoryWithThrowingShims;
}
var hasRequiredPropTypes$1;
function requirePropTypes$1() {
  if (hasRequiredPropTypes$1) return propTypes$1.exports;
  hasRequiredPropTypes$1 = 1;
  {
    propTypes$1.exports = /* @__PURE__ */ requireFactoryWithThrowingShims()();
  }
  return propTypes$1.exports;
}
var propTypesExports = /* @__PURE__ */ requirePropTypes$1();
const PropTypes2 = /* @__PURE__ */ getDefaultExportFromCjs(propTypesExports);
function findInArray(array, callback) {
  for (let i = 0, length = array.length; i < length; i++) {
    if (callback.apply(callback, [array[i], i, array])) return array[i];
  }
}
function isFunction(func) {
  return typeof func === "function" || Object.prototype.toString.call(func) === "[object Function]";
}
function isNum(num) {
  return typeof num === "number" && !isNaN(num);
}
function int(a) {
  return parseInt(a, 10);
}
function dontSetMe(props, propName, componentName) {
  if (props[propName]) {
    return new Error(`Invalid prop ${propName} passed to ${componentName} - do not set this, set it on the child.`);
  }
}
var prefixes = ["Moz", "Webkit", "O", "ms"];
function getPrefix(prop = "transform") {
  var _a, _b;
  if (typeof window === "undefined") return "";
  const style = (_b = (_a = window.document) == null ? void 0 : _a.documentElement) == null ? void 0 : _b.style;
  if (!style) return "";
  if (prop in style) return "";
  for (let i = 0; i < prefixes.length; i++) {
    if (browserPrefixToKey(prop, prefixes[i]) in style) return prefixes[i];
  }
  return "";
}
function browserPrefixToKey(prop, prefix) {
  return prefix ? `${prefix}${kebabToTitleCase(prop)}` : prop;
}
function kebabToTitleCase(str) {
  let out = "";
  let shouldCapitalize = true;
  for (let i = 0; i < str.length; i++) {
    if (shouldCapitalize) {
      out += str[i].toUpperCase();
      shouldCapitalize = false;
    } else if (str[i] === "-") {
      shouldCapitalize = true;
    } else {
      out += str[i];
    }
  }
  return out;
}
var getPrefix_default = getPrefix();
var matchesSelectorFunc = "";
function matchesSelector(el, selector) {
  var _a;
  if (!matchesSelectorFunc) {
    matchesSelectorFunc = (_a = findInArray([
      "matches",
      "webkitMatchesSelector",
      "mozMatchesSelector",
      "msMatchesSelector",
      "oMatchesSelector"
    ], function(method) {
      return isFunction(el[method]);
    })) != null ? _a : "";
  }
  const matchFn = el[matchesSelectorFunc];
  if (!isFunction(matchFn)) return false;
  return Boolean(matchFn.call(el, selector));
}
function matchesSelectorAndParentsTo(el, selector, baseNode) {
  let node = el;
  do {
    if (matchesSelector(node, selector)) return true;
    if (node === baseNode) return false;
    node = node.parentNode;
  } while (node);
  return false;
}
function addEvent(el, event, handler, inputOptions) {
  if (!el) return;
  const options = { capture: true, ...inputOptions };
  const listener = handler;
  if (el.addEventListener) {
    el.addEventListener(event, listener, options);
  } else if (el.attachEvent) {
    el.attachEvent("on" + event, listener);
  } else {
    el["on" + event] = listener;
  }
}
function removeEvent(el, event, handler, inputOptions) {
  if (!el) return;
  const options = { capture: true, ...inputOptions };
  const listener = handler;
  if (el.removeEventListener) {
    el.removeEventListener(event, listener, options);
  } else if (el.detachEvent) {
    el.detachEvent("on" + event, listener);
  } else {
    el["on" + event] = null;
  }
}
function outerHeight(node) {
  let height = node.clientHeight;
  const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
  height += int(computedStyle.borderTopWidth);
  height += int(computedStyle.borderBottomWidth);
  return height;
}
function outerWidth(node) {
  let width = node.clientWidth;
  const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
  width += int(computedStyle.borderLeftWidth);
  width += int(computedStyle.borderRightWidth);
  return width;
}
function innerHeight(node) {
  let height = node.clientHeight;
  const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
  height -= int(computedStyle.paddingTop);
  height -= int(computedStyle.paddingBottom);
  return height;
}
function innerWidth(node) {
  let width = node.clientWidth;
  const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
  width -= int(computedStyle.paddingLeft);
  width -= int(computedStyle.paddingRight);
  return width;
}
function offsetXYFromParent(evt, offsetParent, scale) {
  const isBody = offsetParent === offsetParent.ownerDocument.body;
  const offsetParentRect = isBody ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect();
  const x = (evt.clientX + offsetParent.scrollLeft - offsetParentRect.left) / scale;
  const y = (evt.clientY + offsetParent.scrollTop - offsetParentRect.top) / scale;
  return { x, y };
}
function createCSSTransform(controlPos, positionOffset) {
  const translation = getTranslation(controlPos, positionOffset, "px");
  return { [browserPrefixToKey("transform", getPrefix_default)]: translation };
}
function createSVGTransform(controlPos, positionOffset) {
  const translation = getTranslation(controlPos, positionOffset, "");
  return translation;
}
function getTranslation({ x, y }, positionOffset, unitSuffix) {
  let translation = `translate(${x}${unitSuffix},${y}${unitSuffix})`;
  if (positionOffset) {
    const defaultX = `${typeof positionOffset.x === "string" ? positionOffset.x : positionOffset.x + unitSuffix}`;
    const defaultY = `${typeof positionOffset.y === "string" ? positionOffset.y : positionOffset.y + unitSuffix}`;
    translation = `translate(${defaultX}, ${defaultY})` + translation;
  }
  return translation;
}
function getTouch(e, identifier) {
  return e.targetTouches && findInArray(e.targetTouches, (t) => identifier === t.identifier) || e.changedTouches && findInArray(e.changedTouches, (t) => identifier === t.identifier);
}
function getTouchIdentifier(e) {
  if (e.targetTouches && e.targetTouches[0]) return e.targetTouches[0].identifier;
  if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].identifier;
}
function getDefaultNonce() {
  return typeof __webpack_nonce__ !== "undefined" ? __webpack_nonce__ : void 0;
}
function addUserSelectStyles(doc, nonce) {
  if (!doc) return;
  let styleEl = doc.getElementById("react-draggable-style-el");
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.type = "text/css";
    styleEl.id = "react-draggable-style-el";
    const resolvedNonce = nonce != null ? nonce : getDefaultNonce();
    if (resolvedNonce) styleEl.setAttribute("nonce", resolvedNonce);
    styleEl.innerHTML = ".react-draggable-transparent-selection *::-moz-selection {all: inherit;}\n";
    styleEl.innerHTML += ".react-draggable-transparent-selection *::selection {all: inherit;}\n";
    doc.getElementsByTagName("head")[0].appendChild(styleEl);
  }
  if (doc.body) addClassName(doc.body, "react-draggable-transparent-selection");
}
function scheduleRemoveUserSelectStyles(doc) {
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(() => {
      removeUserSelectStyles(doc);
    });
  } else {
    removeUserSelectStyles(doc);
  }
}
function removeUserSelectStyles(doc) {
  if (!doc) return;
  try {
    if (doc.body) removeClassName(doc.body, "react-draggable-transparent-selection");
    const ieSelection = doc.selection;
    if (ieSelection) {
      ieSelection.empty();
    } else {
      const selection = (doc.defaultView || window).getSelection();
      if (selection && selection.type !== "Caret") {
        selection.removeAllRanges();
      }
    }
  } catch {
  }
}
function addClassName(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    if (!el.className.match(new RegExp(`(?:^|\\s)${className}(?!\\S)`))) {
      el.className += ` ${className}`;
    }
  }
}
function removeClassName(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(new RegExp(`(?:^|\\s)${className}(?!\\S)`, "g"), "");
  }
}
function getBoundPosition(draggable, x, y) {
  if (!draggable.props.bounds) return [x, y];
  let { bounds } = draggable.props;
  bounds = typeof bounds === "string" ? bounds : cloneBounds(bounds);
  const node = findDOMNode(draggable);
  if (typeof bounds === "string") {
    const { ownerDocument } = node;
    const ownerWindow = ownerDocument.defaultView;
    if (!ownerWindow) {
      throw new Error("Cannot resolve the owner window of the draggable node.");
    }
    let boundNode;
    if (bounds === "parent") {
      boundNode = node.parentNode;
    } else {
      const rootNode = node.getRootNode();
      boundNode = rootNode.querySelector(bounds);
    }
    if (!(boundNode instanceof ownerWindow.HTMLElement)) {
      throw new Error('Bounds selector "' + bounds + '" could not find an element.');
    }
    const boundNodeEl = boundNode;
    const nodeStyle = ownerWindow.getComputedStyle(node);
    const boundNodeStyle = ownerWindow.getComputedStyle(boundNodeEl);
    bounds = {
      left: -node.offsetLeft + int(boundNodeStyle.paddingLeft) + int(nodeStyle.marginLeft),
      top: -node.offsetTop + int(boundNodeStyle.paddingTop) + int(nodeStyle.marginTop),
      right: innerWidth(boundNodeEl) - outerWidth(node) - node.offsetLeft + int(boundNodeStyle.paddingRight) - int(nodeStyle.marginRight),
      bottom: innerHeight(boundNodeEl) - outerHeight(node) - node.offsetTop + int(boundNodeStyle.paddingBottom) - int(nodeStyle.marginBottom)
    };
  }
  if (isNum(bounds.right)) x = Math.min(x, bounds.right);
  if (isNum(bounds.bottom)) y = Math.min(y, bounds.bottom);
  if (isNum(bounds.left)) x = Math.max(x, bounds.left);
  if (isNum(bounds.top)) y = Math.max(y, bounds.top);
  return [x, y];
}
function snapToGrid(grid, pendingX, pendingY) {
  const x = Math.round(pendingX / grid[0]) * grid[0];
  const y = Math.round(pendingY / grid[1]) * grid[1];
  return [x, y];
}
function canDragX(draggable) {
  return draggable.props.axis === "both" || draggable.props.axis === "x";
}
function canDragY(draggable) {
  return draggable.props.axis === "both" || draggable.props.axis === "y";
}
function getControlPosition(e, touchIdentifier, draggableCore) {
  const touchObj = typeof touchIdentifier === "number" ? getTouch(e, touchIdentifier) : null;
  if (typeof touchIdentifier === "number" && !touchObj) return null;
  const node = findDOMNode(draggableCore);
  const offsetParent = draggableCore.props.offsetParent || node.offsetParent || node.ownerDocument.body;
  return offsetXYFromParent(touchObj || e, offsetParent, draggableCore.props.scale);
}
function createCoreData(draggable, x, y) {
  const isStart = !isNum(draggable.lastX);
  const node = findDOMNode(draggable);
  if (isStart) {
    return {
      node,
      deltaX: 0,
      deltaY: 0,
      lastX: x,
      lastY: y,
      x,
      y
    };
  } else {
    return {
      node,
      deltaX: x - draggable.lastX,
      deltaY: y - draggable.lastY,
      lastX: draggable.lastX,
      lastY: draggable.lastY,
      x,
      y
    };
  }
}
function createDraggableData(draggable, coreData) {
  const scale = draggable.props.scale;
  return {
    node: coreData.node,
    x: draggable.state.x + coreData.deltaX / scale,
    y: draggable.state.y + coreData.deltaY / scale,
    deltaX: coreData.deltaX / scale,
    deltaY: coreData.deltaY / scale,
    lastX: draggable.state.x,
    lastY: draggable.state.y
  };
}
function cloneBounds(bounds) {
  return {
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom
  };
}
function findDOMNode(draggable) {
  const node = draggable.findDOMNode();
  if (!node) {
    throw new Error("<DraggableCore>: Unmounted during event!");
  }
  return node;
}
var log = typeof process !== "undefined" && process.env.DRAGGABLE_DEBUG ? console.log.bind(console) : function noop() {
};
var log_default = log;
var eventsFor = {
  touch: {
    start: "touchstart",
    move: "touchmove",
    stop: "touchend"
  },
  mouse: {
    start: "mousedown",
    move: "mousemove",
    stop: "mouseup"
  }
};
var dragEventFor = eventsFor.mouse;
var DraggableCore = class extends reactExports.Component {
  constructor() {
    super(...arguments);
    this.dragging = false;
    this.lastX = NaN;
    this.lastY = NaN;
    this.touchIdentifier = null;
    this.mounted = false;
    this.handleDragStart = (e) => {
      this.props.onMouseDown(e);
      if (!this.props.allowAnyClick && (typeof e.button === "number" && e.button !== 0 || e.ctrlKey)) return false;
      const thisNode = this.findDOMNode();
      if (!thisNode || !thisNode.ownerDocument || !thisNode.ownerDocument.body) {
        throw new Error("<DraggableCore> not mounted on DragStart!");
      }
      const { ownerDocument } = thisNode;
      if (this.props.disabled || !(e.target instanceof ownerDocument.defaultView.Node) || this.props.handle && !matchesSelectorAndParentsTo(e.target, this.props.handle, thisNode) || this.props.cancel && matchesSelectorAndParentsTo(e.target, this.props.cancel, thisNode)) {
        return;
      }
      if (e.type === "touchstart" && !this.props.allowMobileScroll) e.preventDefault();
      const touchIdentifier = getTouchIdentifier(e);
      this.touchIdentifier = touchIdentifier;
      const position = getControlPosition(e, touchIdentifier, this);
      if (position == null) return;
      const { x, y } = position;
      const coreEvent = createCoreData(this, x, y);
      log_default("DraggableCore: handleDragStart: %j", coreEvent);
      log_default("calling", this.props.onStart);
      const shouldUpdate = this.props.onStart(e, coreEvent);
      if (shouldUpdate === false || this.mounted === false) return;
      if (this.props.enableUserSelectHack) addUserSelectStyles(ownerDocument, this.props.nonce);
      this.dragging = true;
      this.lastX = x;
      this.lastY = y;
      addEvent(ownerDocument, dragEventFor.move, this.handleDrag);
      addEvent(ownerDocument, dragEventFor.stop, this.handleDragStop);
    };
    this.handleDrag = (e) => {
      const position = getControlPosition(e, this.touchIdentifier, this);
      if (position == null) return;
      let { x, y } = position;
      if (Array.isArray(this.props.grid)) {
        let deltaX = x - this.lastX, deltaY = y - this.lastY;
        [deltaX, deltaY] = snapToGrid(this.props.grid, deltaX, deltaY);
        if (!deltaX && !deltaY) return;
        x = this.lastX + deltaX;
        y = this.lastY + deltaY;
      }
      const coreEvent = createCoreData(this, x, y);
      log_default("DraggableCore: handleDrag: %j", coreEvent);
      const shouldUpdate = this.props.onDrag(e, coreEvent);
      if (shouldUpdate === false || this.mounted === false) {
        try {
          this.handleDragStop(new MouseEvent("mouseup"));
        } catch {
          const event = document.createEvent("MouseEvents");
          event.initMouseEvent("mouseup", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          this.handleDragStop(event);
        }
        return;
      }
      this.lastX = x;
      this.lastY = y;
    };
    this.handleDragStop = (e) => {
      if (!this.dragging) return;
      const position = getControlPosition(e, this.touchIdentifier, this);
      if (position == null) return;
      let { x, y } = position;
      if (Array.isArray(this.props.grid)) {
        let deltaX = x - this.lastX || 0;
        let deltaY = y - this.lastY || 0;
        [deltaX, deltaY] = snapToGrid(this.props.grid, deltaX, deltaY);
        x = this.lastX + deltaX;
        y = this.lastY + deltaY;
      }
      const coreEvent = createCoreData(this, x, y);
      const shouldContinue = this.props.onStop(e, coreEvent);
      if (shouldContinue === false || this.mounted === false) return false;
      const thisNode = this.findDOMNode();
      if (thisNode) {
        if (this.props.enableUserSelectHack) scheduleRemoveUserSelectStyles(thisNode.ownerDocument);
      }
      log_default("DraggableCore: handleDragStop: %j", coreEvent);
      this.dragging = false;
      this.lastX = NaN;
      this.lastY = NaN;
      if (thisNode) {
        log_default("DraggableCore: Removing handlers");
        removeEvent(thisNode.ownerDocument, dragEventFor.move, this.handleDrag);
        removeEvent(thisNode.ownerDocument, dragEventFor.stop, this.handleDragStop);
      }
    };
    this.onMouseDown = (e) => {
      dragEventFor = eventsFor.mouse;
      return this.handleDragStart(e);
    };
    this.onMouseUp = (e) => {
      dragEventFor = eventsFor.mouse;
      return this.handleDragStop(e);
    };
    this.onTouchStart = (e) => {
      dragEventFor = eventsFor.touch;
      return this.handleDragStart(e);
    };
    this.onTouchEnd = (e) => {
      dragEventFor = eventsFor.touch;
      return this.handleDragStop(e);
    };
  }
  componentDidMount() {
    this.mounted = true;
    const thisNode = this.findDOMNode();
    if (thisNode) {
      addEvent(thisNode, eventsFor.touch.start, this.onTouchStart, { passive: false });
    }
  }
  componentWillUnmount() {
    this.mounted = false;
    const thisNode = this.findDOMNode();
    if (thisNode) {
      const { ownerDocument } = thisNode;
      removeEvent(ownerDocument, eventsFor.mouse.move, this.handleDrag);
      removeEvent(ownerDocument, eventsFor.touch.move, this.handleDrag);
      removeEvent(ownerDocument, eventsFor.mouse.stop, this.handleDragStop);
      removeEvent(ownerDocument, eventsFor.touch.stop, this.handleDragStop);
      removeEvent(thisNode, eventsFor.touch.start, this.onTouchStart, { passive: false });
      if (this.props.enableUserSelectHack) scheduleRemoveUserSelectStyles(ownerDocument);
    }
  }
  // React 19 removed ReactDOM.findDOMNode, so nodeRef is now required.
  // For backward compatibility with React 18 and earlier, we still support findDOMNode if available.
  findDOMNode() {
    var _a;
    if ((_a = this.props) == null ? void 0 : _a.nodeRef) {
      return this.props.nodeRef.current;
    }
    const legacyReactDOM = ReactDOM2;
    if (typeof legacyReactDOM.findDOMNode === "function") {
      return legacyReactDOM.findDOMNode(this);
    }
    log_default(
      "react-draggable: ReactDOM.findDOMNode is not available in React 19+. You must provide a nodeRef prop. See: https://github.com/react-grid-layout/react-draggable#noderef"
    );
    return null;
  }
  render() {
    return reactExports.cloneElement(reactExports.Children.only(this.props.children), {
      // Note: mouseMove handler is attached to document so it will still function
      // when the user drags quickly and leaves the bounds of the element.
      onMouseDown: this.onMouseDown,
      onMouseUp: this.onMouseUp,
      // onTouchStart is added on `componentDidMount` so they can be added with
      // {passive: false}, which allows it to cancel. See
      // https://developers.google.com/web/updates/2017/01/scrolling-intervention
      onTouchEnd: this.onTouchEnd
    });
  }
};
DraggableCore.displayName = "DraggableCore";
DraggableCore.propTypes = {
  /**
   * `allowAnyClick` allows dragging using any mouse button.
   * By default, we only accept the left button.
   *
   * Defaults to `false`.
   */
  allowAnyClick: PropTypes2.bool,
  /**
   * `allowMobileScroll` turns off cancellation of the 'touchstart' event
   * on mobile devices. Only enable this if you are having trouble with click
   * events. Prefer using 'handle' / 'cancel' instead.
   *
   * Defaults to `false`.
   */
  allowMobileScroll: PropTypes2.bool,
  children: PropTypes2.node.isRequired,
  /**
   * `disabled`, if true, stops the <Draggable> from dragging. All handlers,
   * with the exception of `onMouseDown`, will not fire.
   */
  disabled: PropTypes2.bool,
  /**
   * By default, we add 'user-select:none' attributes to the document body
   * to prevent ugly text selection during drag. If this is causing problems
   * for your app, set this to `false`.
   */
  enableUserSelectHack: PropTypes2.bool,
  /**
   * `offsetParent`, if set, uses the passed DOM node to compute drag offsets
   * instead of using the parent node.
   */
  offsetParent: function(props, propName) {
    if (props[propName] && props[propName].nodeType !== 1) {
      throw new Error("Draggable's offsetParent must be a DOM Node.");
    }
  },
  /**
   * `grid` specifies the x and y that dragging should snap to.
   */
  grid: PropTypes2.arrayOf(PropTypes2.number),
  /**
   * `handle` specifies a selector to be used as the handle that initiates drag.
   *
   * Example:
   *
   * ```jsx
   *   let App = React.createClass({
   *       render: function () {
   *         return (
   *            <Draggable handle=".handle">
   *              <div>
   *                  <div className="handle">Click me to drag</div>
   *                  <div>This is some other content</div>
   *              </div>
   *           </Draggable>
   *         );
   *       }
   *   });
   * ```
   */
  handle: PropTypes2.string,
  /**
   * `cancel` specifies a selector to be used to prevent drag initialization.
   *
   * Example:
   *
   * ```jsx
   *   let App = React.createClass({
   *       render: function () {
   *           return(
   *               <Draggable cancel=".cancel">
   *                   <div>
   *                     <div className="cancel">You can't drag from here</div>
   *                     <div>Dragging here works fine</div>
   *                   </div>
   *               </Draggable>
   *           );
   *       }
   *   });
   * ```
   */
  cancel: PropTypes2.string,
  /* If running in React Strict mode, ReactDOM.findDOMNode() is deprecated.
   * Unfortunately, in order for <Draggable> to work properly, we need raw access
   * to the underlying DOM node. If you want to avoid the warning, pass a `nodeRef`
   * as in this example:
   *
   * function MyComponent() {
   *   const nodeRef = React.useRef(null);
   *   return (
   *     <Draggable nodeRef={nodeRef}>
   *       <div ref={nodeRef}>Example Target</div>
   *     </Draggable>
   *   );
   * }
   *
   * This can be used for arbitrarily nested components, so long as the ref ends up
   * pointing to the actual child DOM node and not a custom component.
   */
  nodeRef: PropTypes2.object,
  /**
   * `nonce` is applied to the dynamically-injected <style> element used by the
   * user-select hack, so it isn't blocked under a strict Content Security
   * Policy (`style-src` without `'unsafe-inline'`). If omitted, webpack's
   * `__webpack_nonce__` global is used when available.
   */
  nonce: PropTypes2.string,
  /**
   * Called when dragging starts.
   * If this function returns the boolean false, dragging will be canceled.
   */
  onStart: PropTypes2.func,
  /**
   * Called while dragging.
   * If this function returns the boolean false, dragging will be canceled.
   */
  onDrag: PropTypes2.func,
  /**
   * Called when dragging stops.
   * If this function returns the boolean false, the drag will remain active.
   */
  onStop: PropTypes2.func,
  /**
   * A workaround option which can be passed if onMouseDown needs to be accessed,
   * since it'll always be blocked (as there is internal use of onMouseDown)
   */
  onMouseDown: PropTypes2.func,
  /**
   * `scale`, if set, applies scaling while dragging an element
   */
  scale: PropTypes2.number,
  /**
   * These properties should be defined on the child, not here.
   */
  className: dontSetMe,
  style: dontSetMe,
  transform: dontSetMe
};
DraggableCore.defaultProps = {
  allowAnyClick: false,
  // by default only accept left click
  allowMobileScroll: false,
  disabled: false,
  enableUserSelectHack: true,
  onStart: function() {
  },
  onDrag: function() {
  },
  onStop: function() {
  },
  onMouseDown: function() {
  },
  scale: 1
};
var Draggable = class extends reactExports.Component {
  constructor(props) {
    super(props);
    this.onDragStart = (e, coreData) => {
      log_default("Draggable: onDragStart: %j", coreData);
      const shouldStart = this.props.onStart(e, createDraggableData(this, coreData));
      if (shouldStart === false) return false;
      this.setState({ dragging: true, dragged: true });
    };
    this.onDrag = (e, coreData) => {
      if (!this.state.dragging) return false;
      log_default("Draggable: onDrag: %j", coreData);
      const uiData = createDraggableData(this, coreData);
      const newState = {
        x: uiData.x,
        y: uiData.y,
        slackX: 0,
        slackY: 0
      };
      if (this.props.bounds) {
        const { x, y } = newState;
        newState.x += this.state.slackX;
        newState.y += this.state.slackY;
        const [newStateX, newStateY] = getBoundPosition(this, newState.x, newState.y);
        newState.x = newStateX;
        newState.y = newStateY;
        newState.slackX = this.state.slackX + (x - newState.x);
        newState.slackY = this.state.slackY + (y - newState.y);
        uiData.x = newState.x;
        uiData.y = newState.y;
        uiData.deltaX = newState.x - this.state.x;
        uiData.deltaY = newState.y - this.state.y;
      }
      const shouldUpdate = this.props.onDrag(e, uiData);
      if (shouldUpdate === false) return false;
      this.setState(newState);
    };
    this.onDragStop = (e, coreData) => {
      if (!this.state.dragging) return false;
      const shouldContinue = this.props.onStop(e, createDraggableData(this, coreData));
      if (shouldContinue === false) return false;
      log_default("Draggable: onDragStop: %j", coreData);
      const newState = {
        dragging: false,
        slackX: 0,
        slackY: 0
      };
      const controlled = Boolean(this.props.position);
      if (controlled) {
        const { x, y } = this.props.position;
        newState.x = x;
        newState.y = y;
      }
      this.setState(newState);
    };
    this.state = {
      // Whether or not we are currently dragging.
      dragging: false,
      // Whether or not we have been dragged before.
      dragged: false,
      // Current transform x and y.
      x: props.position ? props.position.x : props.defaultPosition.x,
      y: props.position ? props.position.y : props.defaultPosition.y,
      prevPropsPosition: { ...props.position },
      // Used for compensating for out-of-bounds drags
      slackX: 0,
      slackY: 0,
      // Can only determine if SVG after mounting
      isElementSVG: false
    };
    if (props.position && !(props.onDrag || props.onStop)) {
      console.warn("A `position` was applied to this <Draggable>, without drag handlers. This will make this component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the `position` of this element.");
    }
  }
  // React 16.3+
  // Arity (props, state)
  static getDerivedStateFromProps({ position }, { prevPropsPosition }) {
    if (position && (!prevPropsPosition || position.x !== prevPropsPosition.x || position.y !== prevPropsPosition.y)) {
      log_default("Draggable: getDerivedStateFromProps %j", { position, prevPropsPosition });
      return {
        x: position.x,
        y: position.y,
        prevPropsPosition: { ...position }
      };
    }
    return null;
  }
  componentDidMount() {
    if (typeof window.SVGElement !== "undefined" && this.findDOMNode() instanceof window.SVGElement) {
      this.setState({ isElementSVG: true });
    }
  }
  componentWillUnmount() {
    if (this.state.dragging) {
      this.setState({ dragging: false });
    }
  }
  // React 19 removed ReactDOM.findDOMNode, so nodeRef is now required.
  // For backward compatibility with React 18 and earlier, we still support findDOMNode if available.
  findDOMNode() {
    var _a;
    if ((_a = this.props) == null ? void 0 : _a.nodeRef) {
      return this.props.nodeRef.current;
    }
    const legacyReactDOM = ReactDOM2;
    if (typeof legacyReactDOM.findDOMNode === "function") {
      return legacyReactDOM.findDOMNode(this);
    }
    return null;
  }
  render() {
    const {
      axis,
      bounds,
      children,
      defaultPosition,
      defaultClassName,
      defaultClassNameDragging,
      defaultClassNameDragged,
      position,
      positionOffset,
      scale,
      ...draggableCoreProps
    } = this.props;
    let style = {};
    let svgTransform = null;
    const controlled = Boolean(position);
    const draggable = !controlled || this.state.dragging;
    const validPosition = position || defaultPosition;
    const transformOpts = {
      // Set left if horizontal drag is enabled
      x: canDragX(this) && draggable ? this.state.x : validPosition.x,
      // Set top if vertical drag is enabled
      y: canDragY(this) && draggable ? this.state.y : validPosition.y
    };
    if (this.state.isElementSVG) {
      svgTransform = createSVGTransform(transformOpts, positionOffset);
    } else {
      style = createCSSTransform(transformOpts, positionOffset);
    }
    const onlyChild = reactExports.Children.only(children);
    const className = clsx$1(onlyChild.props.className || "", defaultClassName, {
      [defaultClassNameDragging]: this.state.dragging,
      [defaultClassNameDragged]: this.state.dragged
    });
    return /* @__PURE__ */ reactExports.createElement(DraggableCore, { ...draggableCoreProps, onStart: this.onDragStart, onDrag: this.onDrag, onStop: this.onDragStop }, reactExports.cloneElement(onlyChild, {
      className,
      style: { ...onlyChild.props.style, ...style },
      transform: svgTransform
    }));
  }
};
Draggable.displayName = "Draggable";
Draggable.propTypes = {
  // Accepts all props <DraggableCore> accepts.
  ...DraggableCore.propTypes,
  /**
   * `axis` determines which axis the draggable can move.
   *
   *  Note that all callbacks will still return data as normal. This only
   *  controls flushing to the DOM.
   *
   * 'both' allows movement horizontally and vertically.
   * 'x' limits movement to horizontal axis.
   * 'y' limits movement to vertical axis.
   * 'none' limits all movement.
   *
   * Defaults to 'both'.
   */
  axis: PropTypes2.oneOf(["both", "x", "y", "none"]),
  /**
   * `bounds` determines the range of movement available to the element.
   * Available values are:
   *
   * 'parent' restricts movement within the Draggable's parent node.
   *
   * Alternatively, pass an object with the following properties, all of which are optional:
   *
   * {left: LEFT_BOUND, right: RIGHT_BOUND, bottom: BOTTOM_BOUND, top: TOP_BOUND}
   *
   * All values are in px.
   *
   * Example:
   *
   * ```jsx
   *   let App = React.createClass({
   *       render: function () {
   *         return (
   *            <Draggable bounds={{right: 300, bottom: 300}}>
   *              <div>Content</div>
   *           </Draggable>
   *         );
   *       }
   *   });
   * ```
   */
  bounds: PropTypes2.oneOfType([
    PropTypes2.shape({
      left: PropTypes2.number,
      right: PropTypes2.number,
      top: PropTypes2.number,
      bottom: PropTypes2.number
    }),
    PropTypes2.string,
    PropTypes2.oneOf([false])
  ]),
  defaultClassName: PropTypes2.string,
  defaultClassNameDragging: PropTypes2.string,
  defaultClassNameDragged: PropTypes2.string,
  /**
   * `defaultPosition` specifies the x and y that the dragged item should start at
   *
   * Example:
   *
   * ```jsx
   *      let App = React.createClass({
   *          render: function () {
   *              return (
   *                  <Draggable defaultPosition={{x: 25, y: 25}}>
   *                      <div>I start with transformX: 25px and transformY: 25px;</div>
   *                  </Draggable>
   *              );
   *          }
   *      });
   * ```
   */
  defaultPosition: PropTypes2.shape({
    x: PropTypes2.number,
    y: PropTypes2.number
  }),
  positionOffset: PropTypes2.shape({
    x: PropTypes2.oneOfType([PropTypes2.number, PropTypes2.string]),
    y: PropTypes2.oneOfType([PropTypes2.number, PropTypes2.string])
  }),
  /**
   * `position`, if present, defines the current position of the element.
   *
   *  This is similar to how form elements in React work - if no `position` is supplied, the component
   *  is uncontrolled.
   *
   * Example:
   *
   * ```jsx
   *      let App = React.createClass({
   *          render: function () {
   *              return (
   *                  <Draggable position={{x: 25, y: 25}}>
   *                      <div>I start with transformX: 25px and transformY: 25px;</div>
   *                  </Draggable>
   *              );
   *          }
   *      });
   * ```
   */
  position: PropTypes2.shape({
    x: PropTypes2.number,
    y: PropTypes2.number
  }),
  /**
   * These properties should be defined on the child, not here.
   */
  className: dontSetMe,
  style: dontSetMe,
  transform: dontSetMe
};
Draggable.defaultProps = {
  ...DraggableCore.defaultProps,
  axis: "both",
  bounds: false,
  defaultClassName: "react-draggable",
  defaultClassNameDragging: "react-draggable-dragging",
  defaultClassNameDragged: "react-draggable-dragged",
  defaultPosition: { x: 0, y: 0 },
  scale: 1
};
var reactResizable = { exports: {} };
var Resizable = {};
var cjs = { exports: {} };
var clsx = { exports: {} };
var hasRequiredClsx;
function requireClsx() {
  if (hasRequiredClsx) return clsx.exports;
  hasRequiredClsx = 1;
  function r(e2) {
    var o, t, f = "";
    if ("string" == typeof e2 || "number" == typeof e2) f += e2;
    else if ("object" == typeof e2) if (Array.isArray(e2)) {
      var n = e2.length;
      for (o = 0; o < n; o++) e2[o] && (t = r(e2[o])) && (f && (f += " "), f += t);
    } else for (t in e2) e2[t] && (f && (f += " "), f += t);
    return f;
  }
  function e() {
    for (var e2, o, t = 0, f = "", n = arguments.length; t < n; t++) (e2 = arguments[t]) && (o = r(e2)) && (f && (f += " "), f += o);
    return f;
  }
  clsx.exports = e, clsx.exports.clsx = e;
  return clsx.exports;
}
var Draggable_1;
var hasRequiredDraggable;
function requireDraggable() {
  if (hasRequiredDraggable) return Draggable_1;
  hasRequiredDraggable = 1;
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var Draggable_exports = {};
  __export(Draggable_exports, {
    DraggableCore: () => DraggableCore2,
    default: () => Draggable2
  });
  Draggable_1 = __toCommonJS(Draggable_exports);
  var React2 = __toESM(requireReact());
  var import_prop_types2 = __toESM(/* @__PURE__ */ requirePropTypes$1());
  var import_react_dom2 = __toESM(requireReactDom());
  var import_clsx = requireClsx();
  function findInArray2(array, callback) {
    for (let i = 0, length = array.length; i < length; i++) {
      if (callback.apply(callback, [array[i], i, array])) return array[i];
    }
  }
  function isFunction2(func) {
    return typeof func === "function" || Object.prototype.toString.call(func) === "[object Function]";
  }
  function isNum2(num) {
    return typeof num === "number" && !isNaN(num);
  }
  function int2(a) {
    return parseInt(a, 10);
  }
  function dontSetMe2(props, propName, componentName) {
    if (props[propName]) {
      return new Error(`Invalid prop ${propName} passed to ${componentName} - do not set this, set it on the child.`);
    }
  }
  var prefixes2 = ["Moz", "Webkit", "O", "ms"];
  function getPrefix2(prop = "transform") {
    var _a, _b;
    if (typeof window === "undefined") return "";
    const style = (_b = (_a = window.document) == null ? void 0 : _a.documentElement) == null ? void 0 : _b.style;
    if (!style) return "";
    if (prop in style) return "";
    for (let i = 0; i < prefixes2.length; i++) {
      if (browserPrefixToKey2(prop, prefixes2[i]) in style) return prefixes2[i];
    }
    return "";
  }
  function browserPrefixToKey2(prop, prefix) {
    return prefix ? `${prefix}${kebabToTitleCase2(prop)}` : prop;
  }
  function kebabToTitleCase2(str) {
    let out = "";
    let shouldCapitalize = true;
    for (let i = 0; i < str.length; i++) {
      if (shouldCapitalize) {
        out += str[i].toUpperCase();
        shouldCapitalize = false;
      } else if (str[i] === "-") {
        shouldCapitalize = true;
      } else {
        out += str[i];
      }
    }
    return out;
  }
  var getPrefix_default2 = getPrefix2();
  var matchesSelectorFunc2 = "";
  function matchesSelector2(el, selector) {
    var _a;
    if (!matchesSelectorFunc2) {
      matchesSelectorFunc2 = (_a = findInArray2([
        "matches",
        "webkitMatchesSelector",
        "mozMatchesSelector",
        "msMatchesSelector",
        "oMatchesSelector"
      ], function(method) {
        return isFunction2(el[method]);
      })) != null ? _a : "";
    }
    const matchFn = el[matchesSelectorFunc2];
    if (!isFunction2(matchFn)) return false;
    return Boolean(matchFn.call(el, selector));
  }
  function matchesSelectorAndParentsTo2(el, selector, baseNode) {
    let node = el;
    do {
      if (matchesSelector2(node, selector)) return true;
      if (node === baseNode) return false;
      node = node.parentNode;
    } while (node);
    return false;
  }
  function addEvent2(el, event, handler, inputOptions) {
    if (!el) return;
    const options = { capture: true, ...inputOptions };
    const listener = handler;
    if (el.addEventListener) {
      el.addEventListener(event, listener, options);
    } else if (el.attachEvent) {
      el.attachEvent("on" + event, listener);
    } else {
      el["on" + event] = listener;
    }
  }
  function removeEvent2(el, event, handler, inputOptions) {
    if (!el) return;
    const options = { capture: true, ...inputOptions };
    const listener = handler;
    if (el.removeEventListener) {
      el.removeEventListener(event, listener, options);
    } else if (el.detachEvent) {
      el.detachEvent("on" + event, listener);
    } else {
      el["on" + event] = null;
    }
  }
  function outerHeight2(node) {
    let height = node.clientHeight;
    const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
    height += int2(computedStyle.borderTopWidth);
    height += int2(computedStyle.borderBottomWidth);
    return height;
  }
  function outerWidth2(node) {
    let width = node.clientWidth;
    const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
    width += int2(computedStyle.borderLeftWidth);
    width += int2(computedStyle.borderRightWidth);
    return width;
  }
  function innerHeight2(node) {
    let height = node.clientHeight;
    const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
    height -= int2(computedStyle.paddingTop);
    height -= int2(computedStyle.paddingBottom);
    return height;
  }
  function innerWidth2(node) {
    let width = node.clientWidth;
    const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
    width -= int2(computedStyle.paddingLeft);
    width -= int2(computedStyle.paddingRight);
    return width;
  }
  function offsetXYFromParent2(evt, offsetParent, scale) {
    const isBody = offsetParent === offsetParent.ownerDocument.body;
    const offsetParentRect = isBody ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect();
    const x = (evt.clientX + offsetParent.scrollLeft - offsetParentRect.left) / scale;
    const y = (evt.clientY + offsetParent.scrollTop - offsetParentRect.top) / scale;
    return { x, y };
  }
  function createCSSTransform2(controlPos, positionOffset) {
    const translation = getTranslation2(controlPos, positionOffset, "px");
    return { [browserPrefixToKey2("transform", getPrefix_default2)]: translation };
  }
  function createSVGTransform2(controlPos, positionOffset) {
    const translation = getTranslation2(controlPos, positionOffset, "");
    return translation;
  }
  function getTranslation2({ x, y }, positionOffset, unitSuffix) {
    let translation = `translate(${x}${unitSuffix},${y}${unitSuffix})`;
    if (positionOffset) {
      const defaultX = `${typeof positionOffset.x === "string" ? positionOffset.x : positionOffset.x + unitSuffix}`;
      const defaultY = `${typeof positionOffset.y === "string" ? positionOffset.y : positionOffset.y + unitSuffix}`;
      translation = `translate(${defaultX}, ${defaultY})` + translation;
    }
    return translation;
  }
  function getTouch2(e, identifier) {
    return e.targetTouches && findInArray2(e.targetTouches, (t) => identifier === t.identifier) || e.changedTouches && findInArray2(e.changedTouches, (t) => identifier === t.identifier);
  }
  function getTouchIdentifier2(e) {
    if (e.targetTouches && e.targetTouches[0]) return e.targetTouches[0].identifier;
    if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].identifier;
  }
  function getDefaultNonce2() {
    return typeof __webpack_nonce__ !== "undefined" ? __webpack_nonce__ : void 0;
  }
  function addUserSelectStyles2(doc, nonce) {
    if (!doc) return;
    let styleEl = doc.getElementById("react-draggable-style-el");
    if (!styleEl) {
      styleEl = doc.createElement("style");
      styleEl.type = "text/css";
      styleEl.id = "react-draggable-style-el";
      const resolvedNonce = nonce != null ? nonce : getDefaultNonce2();
      if (resolvedNonce) styleEl.setAttribute("nonce", resolvedNonce);
      styleEl.innerHTML = ".react-draggable-transparent-selection *::-moz-selection {all: inherit;}\n";
      styleEl.innerHTML += ".react-draggable-transparent-selection *::selection {all: inherit;}\n";
      doc.getElementsByTagName("head")[0].appendChild(styleEl);
    }
    if (doc.body) addClassName2(doc.body, "react-draggable-transparent-selection");
  }
  function scheduleRemoveUserSelectStyles2(doc) {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
        removeUserSelectStyles2(doc);
      });
    } else {
      removeUserSelectStyles2(doc);
    }
  }
  function removeUserSelectStyles2(doc) {
    if (!doc) return;
    try {
      if (doc.body) removeClassName2(doc.body, "react-draggable-transparent-selection");
      const ieSelection = doc.selection;
      if (ieSelection) {
        ieSelection.empty();
      } else {
        const selection = (doc.defaultView || window).getSelection();
        if (selection && selection.type !== "Caret") {
          selection.removeAllRanges();
        }
      }
    } catch {
    }
  }
  function addClassName2(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      if (!el.className.match(new RegExp(`(?:^|\\s)${className}(?!\\S)`))) {
        el.className += ` ${className}`;
      }
    }
  }
  function removeClassName2(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(new RegExp(`(?:^|\\s)${className}(?!\\S)`, "g"), "");
    }
  }
  function getBoundPosition2(draggable, x, y) {
    if (!draggable.props.bounds) return [x, y];
    let { bounds } = draggable.props;
    bounds = typeof bounds === "string" ? bounds : cloneBounds2(bounds);
    const node = findDOMNode2(draggable);
    if (typeof bounds === "string") {
      const { ownerDocument } = node;
      const ownerWindow = ownerDocument.defaultView;
      if (!ownerWindow) {
        throw new Error("Cannot resolve the owner window of the draggable node.");
      }
      let boundNode;
      if (bounds === "parent") {
        boundNode = node.parentNode;
      } else {
        const rootNode = node.getRootNode();
        boundNode = rootNode.querySelector(bounds);
      }
      if (!(boundNode instanceof ownerWindow.HTMLElement)) {
        throw new Error('Bounds selector "' + bounds + '" could not find an element.');
      }
      const boundNodeEl = boundNode;
      const nodeStyle = ownerWindow.getComputedStyle(node);
      const boundNodeStyle = ownerWindow.getComputedStyle(boundNodeEl);
      bounds = {
        left: -node.offsetLeft + int2(boundNodeStyle.paddingLeft) + int2(nodeStyle.marginLeft),
        top: -node.offsetTop + int2(boundNodeStyle.paddingTop) + int2(nodeStyle.marginTop),
        right: innerWidth2(boundNodeEl) - outerWidth2(node) - node.offsetLeft + int2(boundNodeStyle.paddingRight) - int2(nodeStyle.marginRight),
        bottom: innerHeight2(boundNodeEl) - outerHeight2(node) - node.offsetTop + int2(boundNodeStyle.paddingBottom) - int2(nodeStyle.marginBottom)
      };
    }
    if (isNum2(bounds.right)) x = Math.min(x, bounds.right);
    if (isNum2(bounds.bottom)) y = Math.min(y, bounds.bottom);
    if (isNum2(bounds.left)) x = Math.max(x, bounds.left);
    if (isNum2(bounds.top)) y = Math.max(y, bounds.top);
    return [x, y];
  }
  function snapToGrid2(grid, pendingX, pendingY) {
    const x = Math.round(pendingX / grid[0]) * grid[0];
    const y = Math.round(pendingY / grid[1]) * grid[1];
    return [x, y];
  }
  function canDragX2(draggable) {
    return draggable.props.axis === "both" || draggable.props.axis === "x";
  }
  function canDragY2(draggable) {
    return draggable.props.axis === "both" || draggable.props.axis === "y";
  }
  function getControlPosition2(e, touchIdentifier, draggableCore) {
    const touchObj = typeof touchIdentifier === "number" ? getTouch2(e, touchIdentifier) : null;
    if (typeof touchIdentifier === "number" && !touchObj) return null;
    const node = findDOMNode2(draggableCore);
    const offsetParent = draggableCore.props.offsetParent || node.offsetParent || node.ownerDocument.body;
    return offsetXYFromParent2(touchObj || e, offsetParent, draggableCore.props.scale);
  }
  function createCoreData2(draggable, x, y) {
    const isStart = !isNum2(draggable.lastX);
    const node = findDOMNode2(draggable);
    if (isStart) {
      return {
        node,
        deltaX: 0,
        deltaY: 0,
        lastX: x,
        lastY: y,
        x,
        y
      };
    } else {
      return {
        node,
        deltaX: x - draggable.lastX,
        deltaY: y - draggable.lastY,
        lastX: draggable.lastX,
        lastY: draggable.lastY,
        x,
        y
      };
    }
  }
  function createDraggableData2(draggable, coreData) {
    const scale = draggable.props.scale;
    return {
      node: coreData.node,
      x: draggable.state.x + coreData.deltaX / scale,
      y: draggable.state.y + coreData.deltaY / scale,
      deltaX: coreData.deltaX / scale,
      deltaY: coreData.deltaY / scale,
      lastX: draggable.state.x,
      lastY: draggable.state.y
    };
  }
  function cloneBounds2(bounds) {
    return {
      left: bounds.left,
      top: bounds.top,
      right: bounds.right,
      bottom: bounds.bottom
    };
  }
  function findDOMNode2(draggable) {
    const node = draggable.findDOMNode();
    if (!node) {
      throw new Error("<DraggableCore>: Unmounted during event!");
    }
    return node;
  }
  var React3 = __toESM(requireReact());
  var import_prop_types = __toESM(/* @__PURE__ */ requirePropTypes$1());
  var import_react_dom = __toESM(requireReactDom());
  var log2 = typeof process !== "undefined" && process.env.DRAGGABLE_DEBUG ? console.log.bind(console) : function noop3() {
  };
  var log_default2 = log2;
  var eventsFor2 = {
    touch: {
      start: "touchstart",
      move: "touchmove",
      stop: "touchend"
    },
    mouse: {
      start: "mousedown",
      move: "mousemove",
      stop: "mouseup"
    }
  };
  var dragEventFor2 = eventsFor2.mouse;
  var DraggableCore2 = class extends React3.Component {
    constructor() {
      super(...arguments);
      this.dragging = false;
      this.lastX = NaN;
      this.lastY = NaN;
      this.touchIdentifier = null;
      this.mounted = false;
      this.handleDragStart = (e) => {
        this.props.onMouseDown(e);
        if (!this.props.allowAnyClick && (typeof e.button === "number" && e.button !== 0 || e.ctrlKey)) return false;
        const thisNode = this.findDOMNode();
        if (!thisNode || !thisNode.ownerDocument || !thisNode.ownerDocument.body) {
          throw new Error("<DraggableCore> not mounted on DragStart!");
        }
        const { ownerDocument } = thisNode;
        if (this.props.disabled || !(e.target instanceof ownerDocument.defaultView.Node) || this.props.handle && !matchesSelectorAndParentsTo2(e.target, this.props.handle, thisNode) || this.props.cancel && matchesSelectorAndParentsTo2(e.target, this.props.cancel, thisNode)) {
          return;
        }
        if (e.type === "touchstart" && !this.props.allowMobileScroll) e.preventDefault();
        const touchIdentifier = getTouchIdentifier2(e);
        this.touchIdentifier = touchIdentifier;
        const position = getControlPosition2(e, touchIdentifier, this);
        if (position == null) return;
        const { x, y } = position;
        const coreEvent = createCoreData2(this, x, y);
        log_default2("DraggableCore: handleDragStart: %j", coreEvent);
        log_default2("calling", this.props.onStart);
        const shouldUpdate = this.props.onStart(e, coreEvent);
        if (shouldUpdate === false || this.mounted === false) return;
        if (this.props.enableUserSelectHack) addUserSelectStyles2(ownerDocument, this.props.nonce);
        this.dragging = true;
        this.lastX = x;
        this.lastY = y;
        addEvent2(ownerDocument, dragEventFor2.move, this.handleDrag);
        addEvent2(ownerDocument, dragEventFor2.stop, this.handleDragStop);
      };
      this.handleDrag = (e) => {
        const position = getControlPosition2(e, this.touchIdentifier, this);
        if (position == null) return;
        let { x, y } = position;
        if (Array.isArray(this.props.grid)) {
          let deltaX = x - this.lastX, deltaY = y - this.lastY;
          [deltaX, deltaY] = snapToGrid2(this.props.grid, deltaX, deltaY);
          if (!deltaX && !deltaY) return;
          x = this.lastX + deltaX;
          y = this.lastY + deltaY;
        }
        const coreEvent = createCoreData2(this, x, y);
        log_default2("DraggableCore: handleDrag: %j", coreEvent);
        const shouldUpdate = this.props.onDrag(e, coreEvent);
        if (shouldUpdate === false || this.mounted === false) {
          try {
            this.handleDragStop(new MouseEvent("mouseup"));
          } catch {
            const event = document.createEvent("MouseEvents");
            event.initMouseEvent("mouseup", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            this.handleDragStop(event);
          }
          return;
        }
        this.lastX = x;
        this.lastY = y;
      };
      this.handleDragStop = (e) => {
        if (!this.dragging) return;
        const position = getControlPosition2(e, this.touchIdentifier, this);
        if (position == null) return;
        let { x, y } = position;
        if (Array.isArray(this.props.grid)) {
          let deltaX = x - this.lastX || 0;
          let deltaY = y - this.lastY || 0;
          [deltaX, deltaY] = snapToGrid2(this.props.grid, deltaX, deltaY);
          x = this.lastX + deltaX;
          y = this.lastY + deltaY;
        }
        const coreEvent = createCoreData2(this, x, y);
        const shouldContinue = this.props.onStop(e, coreEvent);
        if (shouldContinue === false || this.mounted === false) return false;
        const thisNode = this.findDOMNode();
        if (thisNode) {
          if (this.props.enableUserSelectHack) scheduleRemoveUserSelectStyles2(thisNode.ownerDocument);
        }
        log_default2("DraggableCore: handleDragStop: %j", coreEvent);
        this.dragging = false;
        this.lastX = NaN;
        this.lastY = NaN;
        if (thisNode) {
          log_default2("DraggableCore: Removing handlers");
          removeEvent2(thisNode.ownerDocument, dragEventFor2.move, this.handleDrag);
          removeEvent2(thisNode.ownerDocument, dragEventFor2.stop, this.handleDragStop);
        }
      };
      this.onMouseDown = (e) => {
        dragEventFor2 = eventsFor2.mouse;
        return this.handleDragStart(e);
      };
      this.onMouseUp = (e) => {
        dragEventFor2 = eventsFor2.mouse;
        return this.handleDragStop(e);
      };
      this.onTouchStart = (e) => {
        dragEventFor2 = eventsFor2.touch;
        return this.handleDragStart(e);
      };
      this.onTouchEnd = (e) => {
        dragEventFor2 = eventsFor2.touch;
        return this.handleDragStop(e);
      };
    }
    componentDidMount() {
      this.mounted = true;
      const thisNode = this.findDOMNode();
      if (thisNode) {
        addEvent2(thisNode, eventsFor2.touch.start, this.onTouchStart, { passive: false });
      }
    }
    componentWillUnmount() {
      this.mounted = false;
      const thisNode = this.findDOMNode();
      if (thisNode) {
        const { ownerDocument } = thisNode;
        removeEvent2(ownerDocument, eventsFor2.mouse.move, this.handleDrag);
        removeEvent2(ownerDocument, eventsFor2.touch.move, this.handleDrag);
        removeEvent2(ownerDocument, eventsFor2.mouse.stop, this.handleDragStop);
        removeEvent2(ownerDocument, eventsFor2.touch.stop, this.handleDragStop);
        removeEvent2(thisNode, eventsFor2.touch.start, this.onTouchStart, { passive: false });
        if (this.props.enableUserSelectHack) scheduleRemoveUserSelectStyles2(ownerDocument);
      }
    }
    // React 19 removed ReactDOM.findDOMNode, so nodeRef is now required.
    // For backward compatibility with React 18 and earlier, we still support findDOMNode if available.
    findDOMNode() {
      var _a;
      if ((_a = this.props) == null ? void 0 : _a.nodeRef) {
        return this.props.nodeRef.current;
      }
      const legacyReactDOM = import_react_dom.default;
      if (typeof legacyReactDOM.findDOMNode === "function") {
        return legacyReactDOM.findDOMNode(this);
      }
      log_default2(
        "react-draggable: ReactDOM.findDOMNode is not available in React 19+. You must provide a nodeRef prop. See: https://github.com/react-grid-layout/react-draggable#noderef"
      );
      return null;
    }
    render() {
      return React3.cloneElement(React3.Children.only(this.props.children), {
        // Note: mouseMove handler is attached to document so it will still function
        // when the user drags quickly and leaves the bounds of the element.
        onMouseDown: this.onMouseDown,
        onMouseUp: this.onMouseUp,
        // onTouchStart is added on `componentDidMount` so they can be added with
        // {passive: false}, which allows it to cancel. See
        // https://developers.google.com/web/updates/2017/01/scrolling-intervention
        onTouchEnd: this.onTouchEnd
      });
    }
  };
  DraggableCore2.displayName = "DraggableCore";
  DraggableCore2.propTypes = {
    /**
     * `allowAnyClick` allows dragging using any mouse button.
     * By default, we only accept the left button.
     *
     * Defaults to `false`.
     */
    allowAnyClick: import_prop_types.default.bool,
    /**
     * `allowMobileScroll` turns off cancellation of the 'touchstart' event
     * on mobile devices. Only enable this if you are having trouble with click
     * events. Prefer using 'handle' / 'cancel' instead.
     *
     * Defaults to `false`.
     */
    allowMobileScroll: import_prop_types.default.bool,
    children: import_prop_types.default.node.isRequired,
    /**
     * `disabled`, if true, stops the <Draggable> from dragging. All handlers,
     * with the exception of `onMouseDown`, will not fire.
     */
    disabled: import_prop_types.default.bool,
    /**
     * By default, we add 'user-select:none' attributes to the document body
     * to prevent ugly text selection during drag. If this is causing problems
     * for your app, set this to `false`.
     */
    enableUserSelectHack: import_prop_types.default.bool,
    /**
     * `offsetParent`, if set, uses the passed DOM node to compute drag offsets
     * instead of using the parent node.
     */
    offsetParent: function(props, propName) {
      if (props[propName] && props[propName].nodeType !== 1) {
        throw new Error("Draggable's offsetParent must be a DOM Node.");
      }
    },
    /**
     * `grid` specifies the x and y that dragging should snap to.
     */
    grid: import_prop_types.default.arrayOf(import_prop_types.default.number),
    /**
     * `handle` specifies a selector to be used as the handle that initiates drag.
     *
     * Example:
     *
     * ```jsx
     *   let App = React.createClass({
     *       render: function () {
     *         return (
     *            <Draggable handle=".handle">
     *              <div>
     *                  <div className="handle">Click me to drag</div>
     *                  <div>This is some other content</div>
     *              </div>
     *           </Draggable>
     *         );
     *       }
     *   });
     * ```
     */
    handle: import_prop_types.default.string,
    /**
     * `cancel` specifies a selector to be used to prevent drag initialization.
     *
     * Example:
     *
     * ```jsx
     *   let App = React.createClass({
     *       render: function () {
     *           return(
     *               <Draggable cancel=".cancel">
     *                   <div>
     *                     <div className="cancel">You can't drag from here</div>
     *                     <div>Dragging here works fine</div>
     *                   </div>
     *               </Draggable>
     *           );
     *       }
     *   });
     * ```
     */
    cancel: import_prop_types.default.string,
    /* If running in React Strict mode, ReactDOM.findDOMNode() is deprecated.
     * Unfortunately, in order for <Draggable> to work properly, we need raw access
     * to the underlying DOM node. If you want to avoid the warning, pass a `nodeRef`
     * as in this example:
     *
     * function MyComponent() {
     *   const nodeRef = React.useRef(null);
     *   return (
     *     <Draggable nodeRef={nodeRef}>
     *       <div ref={nodeRef}>Example Target</div>
     *     </Draggable>
     *   );
     * }
     *
     * This can be used for arbitrarily nested components, so long as the ref ends up
     * pointing to the actual child DOM node and not a custom component.
     */
    nodeRef: import_prop_types.default.object,
    /**
     * `nonce` is applied to the dynamically-injected <style> element used by the
     * user-select hack, so it isn't blocked under a strict Content Security
     * Policy (`style-src` without `'unsafe-inline'`). If omitted, webpack's
     * `__webpack_nonce__` global is used when available.
     */
    nonce: import_prop_types.default.string,
    /**
     * Called when dragging starts.
     * If this function returns the boolean false, dragging will be canceled.
     */
    onStart: import_prop_types.default.func,
    /**
     * Called while dragging.
     * If this function returns the boolean false, dragging will be canceled.
     */
    onDrag: import_prop_types.default.func,
    /**
     * Called when dragging stops.
     * If this function returns the boolean false, the drag will remain active.
     */
    onStop: import_prop_types.default.func,
    /**
     * A workaround option which can be passed if onMouseDown needs to be accessed,
     * since it'll always be blocked (as there is internal use of onMouseDown)
     */
    onMouseDown: import_prop_types.default.func,
    /**
     * `scale`, if set, applies scaling while dragging an element
     */
    scale: import_prop_types.default.number,
    /**
     * These properties should be defined on the child, not here.
     */
    className: dontSetMe2,
    style: dontSetMe2,
    transform: dontSetMe2
  };
  DraggableCore2.defaultProps = {
    allowAnyClick: false,
    // by default only accept left click
    allowMobileScroll: false,
    disabled: false,
    enableUserSelectHack: true,
    onStart: function() {
    },
    onDrag: function() {
    },
    onStop: function() {
    },
    onMouseDown: function() {
    },
    scale: 1
  };
  var Draggable2 = class extends React2.Component {
    constructor(props) {
      super(props);
      this.onDragStart = (e, coreData) => {
        log_default2("Draggable: onDragStart: %j", coreData);
        const shouldStart = this.props.onStart(e, createDraggableData2(this, coreData));
        if (shouldStart === false) return false;
        this.setState({ dragging: true, dragged: true });
      };
      this.onDrag = (e, coreData) => {
        if (!this.state.dragging) return false;
        log_default2("Draggable: onDrag: %j", coreData);
        const uiData = createDraggableData2(this, coreData);
        const newState = {
          x: uiData.x,
          y: uiData.y,
          slackX: 0,
          slackY: 0
        };
        if (this.props.bounds) {
          const { x, y } = newState;
          newState.x += this.state.slackX;
          newState.y += this.state.slackY;
          const [newStateX, newStateY] = getBoundPosition2(this, newState.x, newState.y);
          newState.x = newStateX;
          newState.y = newStateY;
          newState.slackX = this.state.slackX + (x - newState.x);
          newState.slackY = this.state.slackY + (y - newState.y);
          uiData.x = newState.x;
          uiData.y = newState.y;
          uiData.deltaX = newState.x - this.state.x;
          uiData.deltaY = newState.y - this.state.y;
        }
        const shouldUpdate = this.props.onDrag(e, uiData);
        if (shouldUpdate === false) return false;
        this.setState(newState);
      };
      this.onDragStop = (e, coreData) => {
        if (!this.state.dragging) return false;
        const shouldContinue = this.props.onStop(e, createDraggableData2(this, coreData));
        if (shouldContinue === false) return false;
        log_default2("Draggable: onDragStop: %j", coreData);
        const newState = {
          dragging: false,
          slackX: 0,
          slackY: 0
        };
        const controlled = Boolean(this.props.position);
        if (controlled) {
          const { x, y } = this.props.position;
          newState.x = x;
          newState.y = y;
        }
        this.setState(newState);
      };
      this.state = {
        // Whether or not we are currently dragging.
        dragging: false,
        // Whether or not we have been dragged before.
        dragged: false,
        // Current transform x and y.
        x: props.position ? props.position.x : props.defaultPosition.x,
        y: props.position ? props.position.y : props.defaultPosition.y,
        prevPropsPosition: { ...props.position },
        // Used for compensating for out-of-bounds drags
        slackX: 0,
        slackY: 0,
        // Can only determine if SVG after mounting
        isElementSVG: false
      };
      if (props.position && !(props.onDrag || props.onStop)) {
        console.warn("A `position` was applied to this <Draggable>, without drag handlers. This will make this component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the `position` of this element.");
      }
    }
    // React 16.3+
    // Arity (props, state)
    static getDerivedStateFromProps({ position }, { prevPropsPosition }) {
      if (position && (!prevPropsPosition || position.x !== prevPropsPosition.x || position.y !== prevPropsPosition.y)) {
        log_default2("Draggable: getDerivedStateFromProps %j", { position, prevPropsPosition });
        return {
          x: position.x,
          y: position.y,
          prevPropsPosition: { ...position }
        };
      }
      return null;
    }
    componentDidMount() {
      if (typeof window.SVGElement !== "undefined" && this.findDOMNode() instanceof window.SVGElement) {
        this.setState({ isElementSVG: true });
      }
    }
    componentWillUnmount() {
      if (this.state.dragging) {
        this.setState({ dragging: false });
      }
    }
    // React 19 removed ReactDOM.findDOMNode, so nodeRef is now required.
    // For backward compatibility with React 18 and earlier, we still support findDOMNode if available.
    findDOMNode() {
      var _a;
      if ((_a = this.props) == null ? void 0 : _a.nodeRef) {
        return this.props.nodeRef.current;
      }
      const legacyReactDOM = import_react_dom2.default;
      if (typeof legacyReactDOM.findDOMNode === "function") {
        return legacyReactDOM.findDOMNode(this);
      }
      return null;
    }
    render() {
      const {
        axis,
        bounds,
        children,
        defaultPosition,
        defaultClassName,
        defaultClassNameDragging,
        defaultClassNameDragged,
        position,
        positionOffset,
        scale,
        ...draggableCoreProps
      } = this.props;
      let style = {};
      let svgTransform = null;
      const controlled = Boolean(position);
      const draggable = !controlled || this.state.dragging;
      const validPosition = position || defaultPosition;
      const transformOpts = {
        // Set left if horizontal drag is enabled
        x: canDragX2(this) && draggable ? this.state.x : validPosition.x,
        // Set top if vertical drag is enabled
        y: canDragY2(this) && draggable ? this.state.y : validPosition.y
      };
      if (this.state.isElementSVG) {
        svgTransform = createSVGTransform2(transformOpts, positionOffset);
      } else {
        style = createCSSTransform2(transformOpts, positionOffset);
      }
      const onlyChild = React2.Children.only(children);
      const className = (0, import_clsx.clsx)(onlyChild.props.className || "", defaultClassName, {
        [defaultClassNameDragging]: this.state.dragging,
        [defaultClassNameDragged]: this.state.dragged
      });
      return /* @__PURE__ */ React2.createElement(DraggableCore2, { ...draggableCoreProps, onStart: this.onDragStart, onDrag: this.onDrag, onStop: this.onDragStop }, React2.cloneElement(onlyChild, {
        className,
        style: { ...onlyChild.props.style, ...style },
        transform: svgTransform
      }));
    }
  };
  Draggable2.displayName = "Draggable";
  Draggable2.propTypes = {
    // Accepts all props <DraggableCore> accepts.
    ...DraggableCore2.propTypes,
    /**
     * `axis` determines which axis the draggable can move.
     *
     *  Note that all callbacks will still return data as normal. This only
     *  controls flushing to the DOM.
     *
     * 'both' allows movement horizontally and vertically.
     * 'x' limits movement to horizontal axis.
     * 'y' limits movement to vertical axis.
     * 'none' limits all movement.
     *
     * Defaults to 'both'.
     */
    axis: import_prop_types2.default.oneOf(["both", "x", "y", "none"]),
    /**
     * `bounds` determines the range of movement available to the element.
     * Available values are:
     *
     * 'parent' restricts movement within the Draggable's parent node.
     *
     * Alternatively, pass an object with the following properties, all of which are optional:
     *
     * {left: LEFT_BOUND, right: RIGHT_BOUND, bottom: BOTTOM_BOUND, top: TOP_BOUND}
     *
     * All values are in px.
     *
     * Example:
     *
     * ```jsx
     *   let App = React.createClass({
     *       render: function () {
     *         return (
     *            <Draggable bounds={{right: 300, bottom: 300}}>
     *              <div>Content</div>
     *           </Draggable>
     *         );
     *       }
     *   });
     * ```
     */
    bounds: import_prop_types2.default.oneOfType([
      import_prop_types2.default.shape({
        left: import_prop_types2.default.number,
        right: import_prop_types2.default.number,
        top: import_prop_types2.default.number,
        bottom: import_prop_types2.default.number
      }),
      import_prop_types2.default.string,
      import_prop_types2.default.oneOf([false])
    ]),
    defaultClassName: import_prop_types2.default.string,
    defaultClassNameDragging: import_prop_types2.default.string,
    defaultClassNameDragged: import_prop_types2.default.string,
    /**
     * `defaultPosition` specifies the x and y that the dragged item should start at
     *
     * Example:
     *
     * ```jsx
     *      let App = React.createClass({
     *          render: function () {
     *              return (
     *                  <Draggable defaultPosition={{x: 25, y: 25}}>
     *                      <div>I start with transformX: 25px and transformY: 25px;</div>
     *                  </Draggable>
     *              );
     *          }
     *      });
     * ```
     */
    defaultPosition: import_prop_types2.default.shape({
      x: import_prop_types2.default.number,
      y: import_prop_types2.default.number
    }),
    positionOffset: import_prop_types2.default.shape({
      x: import_prop_types2.default.oneOfType([import_prop_types2.default.number, import_prop_types2.default.string]),
      y: import_prop_types2.default.oneOfType([import_prop_types2.default.number, import_prop_types2.default.string])
    }),
    /**
     * `position`, if present, defines the current position of the element.
     *
     *  This is similar to how form elements in React work - if no `position` is supplied, the component
     *  is uncontrolled.
     *
     * Example:
     *
     * ```jsx
     *      let App = React.createClass({
     *          render: function () {
     *              return (
     *                  <Draggable position={{x: 25, y: 25}}>
     *                      <div>I start with transformX: 25px and transformY: 25px;</div>
     *                  </Draggable>
     *              );
     *          }
     *      });
     * ```
     */
    position: import_prop_types2.default.shape({
      x: import_prop_types2.default.number,
      y: import_prop_types2.default.number
    }),
    /**
     * These properties should be defined on the child, not here.
     */
    className: dontSetMe2,
    style: dontSetMe2,
    transform: dontSetMe2
  };
  Draggable2.defaultProps = {
    ...DraggableCore2.defaultProps,
    axis: "both",
    bounds: false,
    defaultClassName: "react-draggable",
    defaultClassNameDragging: "react-draggable-dragging",
    defaultClassNameDragged: "react-draggable-dragged",
    defaultPosition: { x: 0, y: 0 },
    scale: 1
  };
  return Draggable_1;
}
var hasRequiredCjs;
function requireCjs() {
  if (hasRequiredCjs) return cjs.exports;
  hasRequiredCjs = 1;
  const Draggable2 = requireDraggable();
  const DraggableCore2 = Draggable2.DraggableCore;
  const Default = Draggable2.default || Draggable2;
  cjs.exports = Default;
  cjs.exports.default = Default;
  cjs.exports.DraggableCore = DraggableCore2;
  return cjs.exports;
}
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  utils.__esModule = true;
  utils.cloneElement = cloneElement;
  var _react = _interopRequireDefault(requireReact());
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
        _defineProperty(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function cloneElement(element, props) {
    if (props.style && element.props.style) {
      props.style = _objectSpread(_objectSpread({}, element.props.style), props.style);
    }
    if (props.className && element.props.className) {
      props.className = element.props.className + " " + props.className;
    }
    return /* @__PURE__ */ _react.default.cloneElement(element, props);
  }
  return utils;
}
var propTypes = {};
var hasRequiredPropTypes;
function requirePropTypes() {
  if (hasRequiredPropTypes) return propTypes;
  hasRequiredPropTypes = 1;
  propTypes.__esModule = true;
  propTypes.resizableProps = void 0;
  var _propTypes = _interopRequireDefault(/* @__PURE__ */ requirePropTypes$1());
  requireCjs();
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  propTypes.resizableProps = {
    /*
    * Restricts resizing to a particular axis (default: 'both')
    * 'both' - allows resizing by width or height
    * 'x' - only allows the width to be changed
    * 'y' - only allows the height to be changed
    * 'none' - disables resizing altogether
    * */
    axis: _propTypes.default.oneOf(["both", "x", "y", "none"]),
    className: _propTypes.default.string,
    /*
    * Require that one and only one child be present.
    * */
    children: _propTypes.default.element.isRequired,
    /*
    * These will be passed wholesale to react-draggable's DraggableCore
    * */
    draggableOpts: _propTypes.default.shape({
      allowAnyClick: _propTypes.default.bool,
      cancel: _propTypes.default.string,
      children: _propTypes.default.node,
      disabled: _propTypes.default.bool,
      enableUserSelectHack: _propTypes.default.bool,
      // #251: Check for Element to support SSR environments where DOM globals don't exist
      offsetParent: typeof Element !== "undefined" ? _propTypes.default.instanceOf(Element) : _propTypes.default.any,
      grid: _propTypes.default.arrayOf(_propTypes.default.number),
      handle: _propTypes.default.string,
      nodeRef: _propTypes.default.object,
      onStart: _propTypes.default.func,
      onDrag: _propTypes.default.func,
      onStop: _propTypes.default.func,
      onMouseDown: _propTypes.default.func,
      scale: _propTypes.default.number
    }),
    /*
    * Initial height
    * */
    height: function() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      const props = args[0];
      if (props.axis === "both" || props.axis === "y") {
        return _propTypes.default.number.isRequired(...args);
      }
      return _propTypes.default.number(...args);
    },
    /*
    * Customize cursor resize handle
    * */
    handle: _propTypes.default.oneOfType([_propTypes.default.node, _propTypes.default.func]),
    /*
    * If you change this, be sure to update your css
    * */
    handleSize: _propTypes.default.arrayOf(_propTypes.default.number),
    lockAspectRatio: _propTypes.default.bool,
    /*
    * Max X & Y measure
    * */
    maxConstraints: _propTypes.default.arrayOf(_propTypes.default.number),
    /*
    * Min X & Y measure
    * */
    minConstraints: _propTypes.default.arrayOf(_propTypes.default.number),
    /*
    * Called on stop resize event
    * */
    onResizeStop: _propTypes.default.func,
    /*
    * Called on start resize event
    * */
    onResizeStart: _propTypes.default.func,
    /*
    * Called on resize event
    * */
    onResize: _propTypes.default.func,
    /*
    * Defines which resize handles should be rendered (default: 'se')
    * 's' - South handle (bottom-center)
    * 'w' - West handle (left-center)
    * 'e' - East handle (right-center)
    * 'n' - North handle (top-center)
    * 'sw' - Southwest handle (bottom-left)
    * 'nw' - Northwest handle (top-left)
    * 'se' - Southeast handle (bottom-right)
    * 'ne' - Northeast handle (top-center)
    * */
    resizeHandles: _propTypes.default.arrayOf(_propTypes.default.oneOf(["s", "w", "e", "n", "sw", "nw", "se", "ne"])),
    /*
    * If `transform: scale(n)` is set on the parent, this should be set to `n`.
    * */
    transformScale: _propTypes.default.number,
    /*
     * Initial width
     */
    width: function() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      const props = args[0];
      if (props.axis === "both" || props.axis === "x") {
        return _propTypes.default.number.isRequired(...args);
      }
      return _propTypes.default.number(...args);
    }
  };
  return propTypes;
}
var hasRequiredResizable;
function requireResizable() {
  if (hasRequiredResizable) return Resizable;
  hasRequiredResizable = 1;
  Resizable.__esModule = true;
  Resizable.default = void 0;
  var React2 = _interopRequireWildcard(requireReact());
  var _reactDraggable = requireCjs();
  var _utils = requireUtils();
  var _propTypes = requirePropTypes();
  const _excluded = ["children", "className", "draggableOpts", "width", "height", "handle", "handleSize", "lockAspectRatio", "axis", "minConstraints", "maxConstraints", "onResize", "onResizeStop", "onResizeStart", "resizeHandles", "transformScale"];
  function _interopRequireWildcard(e, t) {
    if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
    return (_interopRequireWildcard = function(e2, t2) {
      if (!t2 && e2 && e2.__esModule) return e2;
      var o, i, f = { __proto__: null, default: e2 };
      if (null === e2 || "object" != typeof e2 && "function" != typeof e2) return f;
      if (o = t2 ? n : r) {
        if (o.has(e2)) return o.get(e2);
        o.set(e2, f);
      }
      for (const t3 in e2) "default" !== t3 && {}.hasOwnProperty.call(e2, t3) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, t3)) && (i.get || i.set) ? o(f, t3, i) : f[t3] = e2[t3]);
      return f;
    })(e, t);
  }
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }
  function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r[n];
    }
    return t;
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
        _defineProperty(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  let Resizable$1 = class Resizable extends React2.Component {
    constructor() {
      super(...arguments);
      this.handleRefs = {};
      this.lastHandleRect = null;
      this.slack = null;
      this.lastSize = null;
    }
    componentWillUnmount() {
      this.resetData();
    }
    resetData() {
      this.lastHandleRect = this.slack = this.lastSize = null;
    }
    // Clamp width and height within provided constraints
    runConstraints(width, height) {
      const _this$props = this.props, minConstraints = _this$props.minConstraints, maxConstraints = _this$props.maxConstraints, lockAspectRatio = _this$props.lockAspectRatio;
      if (!minConstraints && !maxConstraints && !lockAspectRatio) return [width, height];
      if (lockAspectRatio) {
        const ratio = this.props.width / this.props.height;
        const deltaW = width - this.props.width;
        const deltaH = height - this.props.height;
        if (Math.abs(deltaW) > Math.abs(deltaH * ratio)) {
          height = width / ratio;
        } else {
          width = height * ratio;
        }
      }
      const oldW = width, oldH = height;
      let _ref = this.slack || [0, 0], slackW = _ref[0], slackH = _ref[1];
      width += slackW;
      height += slackH;
      if (minConstraints) {
        width = Math.max(minConstraints[0], width);
        height = Math.max(minConstraints[1], height);
      }
      if (maxConstraints) {
        width = Math.min(maxConstraints[0], width);
        height = Math.min(maxConstraints[1], height);
      }
      this.slack = [slackW + (oldW - width), slackH + (oldH - height)];
      return [width, height];
    }
    /**
     * Wrapper around drag events to provide more useful data.
     *
     * @param  {String} handlerName Handler name to wrap.
     * @return {Function}           Handler function.
     */
    resizeHandler(handlerName, axis) {
      return (e, _ref2) => {
        var _this$lastSize$width, _this$lastSize, _this$lastSize$height, _this$lastSize2;
        let node = _ref2.node, deltaX = _ref2.deltaX, deltaY = _ref2.deltaY;
        if (handlerName === "onResizeStart") this.resetData();
        const canDragX2 = (this.props.axis === "both" || this.props.axis === "x") && axis !== "n" && axis !== "s";
        const canDragY2 = (this.props.axis === "both" || this.props.axis === "y") && axis !== "e" && axis !== "w";
        if (!canDragX2 && !canDragY2) return;
        const axisV = axis[0];
        const axisH = axis[axis.length - 1];
        const handleRect = node.getBoundingClientRect();
        if (this.lastHandleRect != null) {
          if (axisH === "w") {
            const deltaLeftSinceLast = handleRect.left - this.lastHandleRect.left;
            deltaX += deltaLeftSinceLast;
          }
          if (axisV === "n") {
            const deltaTopSinceLast = handleRect.top - this.lastHandleRect.top;
            deltaY += deltaTopSinceLast;
          }
        }
        this.lastHandleRect = handleRect;
        if (axisH === "w") deltaX = -deltaX;
        if (axisV === "n") deltaY = -deltaY;
        const baseWidth = (_this$lastSize$width = (_this$lastSize = this.lastSize) == null ? void 0 : _this$lastSize.width) != null ? _this$lastSize$width : this.props.width;
        const baseHeight = (_this$lastSize$height = (_this$lastSize2 = this.lastSize) == null ? void 0 : _this$lastSize2.height) != null ? _this$lastSize$height : this.props.height;
        let width = baseWidth + (canDragX2 ? deltaX / this.props.transformScale : 0);
        let height = baseHeight + (canDragY2 ? deltaY / this.props.transformScale : 0);
        var _this$runConstraints = this.runConstraints(width, height);
        width = _this$runConstraints[0];
        height = _this$runConstraints[1];
        if (handlerName === "onResizeStop" && this.lastSize) {
          var _this$lastSize3 = this.lastSize;
          width = _this$lastSize3.width;
          height = _this$lastSize3.height;
        }
        const dimensionsChanged = width !== baseWidth || height !== baseHeight;
        if (handlerName !== "onResizeStop") {
          this.lastSize = {
            width,
            height
          };
        }
        const cb = typeof this.props[handlerName] === "function" ? this.props[handlerName] : null;
        const shouldSkipCb = handlerName === "onResize" && !dimensionsChanged;
        if (cb && !shouldSkipCb) {
          e.persist == null || e.persist();
          cb(e, {
            node,
            size: {
              width,
              height
            },
            handle: axis
          });
        }
        if (handlerName === "onResizeStop") this.resetData();
      };
    }
    // Render a resize handle given an axis & DOM ref. Ref *must* be attached for
    // the underlying draggable library to work properly.
    renderResizeHandle(handleAxis, ref) {
      const handle = this.props.handle;
      if (!handle) {
        return /* @__PURE__ */ React2.createElement("span", {
          className: "react-resizable-handle react-resizable-handle-" + handleAxis,
          ref
        });
      }
      if (typeof handle === "function") {
        return handle(handleAxis, ref);
      }
      const isDOMElement = typeof handle.type === "string";
      const props = _objectSpread({
        ref
      }, isDOMElement ? {} : {
        handleAxis
      });
      return /* @__PURE__ */ React2.cloneElement(handle, props);
    }
    render() {
      const _this$props2 = this.props, children = _this$props2.children, className = _this$props2.className, draggableOpts = _this$props2.draggableOpts;
      _this$props2.width;
      _this$props2.height;
      _this$props2.handle;
      _this$props2.handleSize;
      _this$props2.lockAspectRatio;
      _this$props2.axis;
      _this$props2.minConstraints;
      _this$props2.maxConstraints;
      _this$props2.onResize;
      _this$props2.onResizeStop;
      _this$props2.onResizeStart;
      const resizeHandles = _this$props2.resizeHandles;
      _this$props2.transformScale;
      const p = _objectWithoutPropertiesLoose(_this$props2, _excluded);
      return (0, _utils.cloneElement)(children, _objectSpread(_objectSpread({}, p), {}, {
        className: (className ? className + " " : "") + "react-resizable",
        children: [...React2.Children.toArray(children.props.children), ...resizeHandles.map((handleAxis) => {
          var _this$handleRefs$hand;
          const ref = (_this$handleRefs$hand = this.handleRefs[handleAxis]) != null ? _this$handleRefs$hand : this.handleRefs[handleAxis] = /* @__PURE__ */ React2.createRef();
          return /* @__PURE__ */ React2.createElement(_reactDraggable.DraggableCore, _extends({}, draggableOpts, {
            nodeRef: ref,
            key: "resizableHandle-" + handleAxis,
            onStop: this.resizeHandler("onResizeStop", handleAxis),
            onStart: this.resizeHandler("onResizeStart", handleAxis),
            onDrag: this.resizeHandler("onResize", handleAxis)
          }), this.renderResizeHandle(handleAxis, ref));
        })]
      }));
    }
  };
  Resizable.default = Resizable$1;
  Resizable$1.propTypes = _propTypes.resizableProps;
  Resizable$1.defaultProps = {
    axis: "both",
    handleSize: [20, 20],
    lockAspectRatio: false,
    minConstraints: [20, 20],
    maxConstraints: [Infinity, Infinity],
    resizeHandles: ["se"],
    transformScale: 1
  };
  return Resizable;
}
var ResizableBox = {};
var hasRequiredResizableBox;
function requireResizableBox() {
  if (hasRequiredResizableBox) return ResizableBox;
  hasRequiredResizableBox = 1;
  ResizableBox.__esModule = true;
  ResizableBox.default = void 0;
  var React2 = _interopRequireWildcard(requireReact());
  var _propTypes = _interopRequireDefault(/* @__PURE__ */ requirePropTypes$1());
  var _Resizable = _interopRequireDefault(requireResizable());
  var _propTypes2 = requirePropTypes();
  const _excluded = ["handle", "handleSize", "onResize", "onResizeStart", "onResizeStop", "draggableOpts", "minConstraints", "maxConstraints", "lockAspectRatio", "axis", "width", "height", "resizeHandles", "style", "transformScale"];
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  function _interopRequireWildcard(e, t) {
    if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
    return (_interopRequireWildcard = function(e2, t2) {
      if (!t2 && e2 && e2.__esModule) return e2;
      var o, i, f = { __proto__: null, default: e2 };
      if (null === e2 || "object" != typeof e2 && "function" != typeof e2) return f;
      if (o = t2 ? n : r) {
        if (o.has(e2)) return o.get(e2);
        o.set(e2, f);
      }
      for (const t3 in e2) "default" !== t3 && {}.hasOwnProperty.call(e2, t3) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, t3)) && (i.get || i.set) ? o(f, t3, i) : f[t3] = e2[t3]);
      return f;
    })(e, t);
  }
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
        _defineProperty(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r[n];
    }
    return t;
  }
  let ResizableBox$1 = class ResizableBox extends React2.Component {
    constructor() {
      super(...arguments);
      this.state = {
        width: this.props.width,
        height: this.props.height,
        propsWidth: this.props.width,
        propsHeight: this.props.height
      };
      this.onResize = (e, data) => {
        const size = data.size;
        if (this.props.onResize) {
          e.persist == null || e.persist();
          this.setState(size, () => this.props.onResize && this.props.onResize(e, data));
        } else {
          this.setState(size);
        }
      };
    }
    static getDerivedStateFromProps(props, state) {
      if (state.propsWidth !== props.width || state.propsHeight !== props.height) {
        return {
          width: props.width,
          height: props.height,
          propsWidth: props.width,
          propsHeight: props.height
        };
      }
      return null;
    }
    render() {
      const _this$props = this.props, handle = _this$props.handle, handleSize = _this$props.handleSize;
      _this$props.onResize;
      const onResizeStart = _this$props.onResizeStart, onResizeStop = _this$props.onResizeStop, draggableOpts = _this$props.draggableOpts, minConstraints = _this$props.minConstraints, maxConstraints = _this$props.maxConstraints, lockAspectRatio = _this$props.lockAspectRatio, axis = _this$props.axis;
      _this$props.width;
      _this$props.height;
      const resizeHandles = _this$props.resizeHandles, style = _this$props.style, transformScale = _this$props.transformScale, props = _objectWithoutPropertiesLoose(_this$props, _excluded);
      return /* @__PURE__ */ React2.createElement(_Resizable.default, {
        axis,
        draggableOpts,
        handle,
        handleSize,
        height: this.state.height,
        lockAspectRatio,
        maxConstraints,
        minConstraints,
        onResizeStart,
        onResize: this.onResize,
        onResizeStop,
        resizeHandles,
        transformScale,
        width: this.state.width
      }, /* @__PURE__ */ React2.createElement("div", _extends({}, props, {
        style: _objectSpread(_objectSpread({}, style), {}, {
          width: this.state.width + "px",
          height: this.state.height + "px"
        })
      })));
    }
  };
  ResizableBox.default = ResizableBox$1;
  ResizableBox$1.propTypes = _objectSpread(_objectSpread({}, _propTypes2.resizableProps), {}, {
    children: _propTypes.default.element
  });
  return ResizableBox;
}
var hasRequiredReactResizable;
function requireReactResizable() {
  if (hasRequiredReactResizable) return reactResizable.exports;
  hasRequiredReactResizable = 1;
  reactResizable.exports = function() {
    throw new Error("Don't instantiate Resizable directly! Use require('react-resizable').Resizable");
  };
  reactResizable.exports.Resizable = requireResizable().default;
  reactResizable.exports.ResizableBox = requireResizableBox().default;
  return reactResizable.exports;
}
var reactResizableExports = requireReactResizable();
var EDGE_THRESHOLD = 50;
var SCROLL_STEP = 12;
function getNearestScrollable(node) {
  let el = node;
  while (el) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    const scrollable = (overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight;
    if (scrollable) return el;
    el = el.parentElement;
  }
  return null;
}
function createEdgeScrollController(node) {
  const scrollContainer = getNearestScrollable(node);
  let rafId = null;
  let lastX = 0;
  let lastY = 0;
  let running = false;
  function step() {
    const container = scrollContainer;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const { clientHeight, scrollTop, scrollHeight } = container;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    let dy = 0;
    let dx = 0;
    if (lastY < rect.top + EDGE_THRESHOLD && scrollTop > 0) {
      dy = -SCROLL_STEP;
    } else if (lastY > rect.bottom - EDGE_THRESHOLD && scrollTop + clientHeight < scrollHeight) {
      dy = SCROLL_STEP;
    }
    if (lastX < rect.left + EDGE_THRESHOLD && scrollLeft > 0) {
      dx = -SCROLL_STEP;
    } else if (lastX > rect.right - EDGE_THRESHOLD && scrollLeft + clientWidth < scrollWidth) {
      dx = SCROLL_STEP;
    }
    if (dy !== 0 || dx !== 0) {
      container.scrollTop += dy;
      container.scrollLeft += dx;
    }
    if (running) {
      rafId = requestAnimationFrame(step);
    }
  }
  return {
    feed(clientX, clientY) {
      lastX = clientX;
      lastY = clientY;
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(step);
      }
    },
    stop() {
      running = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  };
}
function GridItemInner(props) {
  const {
    children,
    cols,
    containerWidth,
    margin,
    containerPadding,
    rowHeight,
    maxRows,
    isDraggable,
    isResizable,
    isBounded,
    allowMobileScroll,
    static: isStatic,
    useCSSTransforms = true,
    usePercentages = false,
    transformScale = 1,
    positionStrategy,
    dragThreshold = 0,
    droppingPosition,
    className = "",
    style,
    handle = "",
    cancel = "",
    x,
    y,
    w,
    h,
    minW = 1,
    maxW = Infinity,
    minH = 1,
    maxH = Infinity,
    i,
    resizeHandles,
    resizeHandle,
    constraints = defaultConstraints,
    layoutItem,
    layout = [],
    onDragStart: onDragStartProp,
    onDrag: onDragProp,
    onDragStop: onDragStopProp,
    onResizeStart: onResizeStartProp,
    onResize: onResizeProp,
    onResizeStop: onResizeStopProp
  } = props;
  const [dragging, setDragging] = reactExports.useState(false);
  const [, bumpFrame] = reactExports.useState(0);
  const [resizing, setResizing] = reactExports.useState(false);
  const elementRef = reactExports.useRef(null);
  const dragPositionRef = reactExports.useRef({ left: 0, top: 0 });
  const resizePositionRef = reactExports.useRef({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  });
  const prevDroppingPositionRef = reactExports.useRef(
    void 0
  );
  const layoutRef = reactExports.useRef(layout);
  layoutRef.current = layout;
  const onDragStartRef = reactExports.useRef(null);
  const onDragRef = reactExports.useRef(null);
  const dragPendingRef = reactExports.useRef(false);
  const initialDragClientRef = reactExports.useRef({ x: 0, y: 0 });
  const thresholdExceededRef = reactExports.useRef(false);
  const edgeScrollRef = reactExports.useRef(null);
  const positionParams = reactExports.useMemo(
    () => ({
      cols,
      containerPadding,
      containerWidth,
      margin,
      maxRows,
      rowHeight
    }),
    [cols, containerPadding, containerWidth, margin, maxRows, rowHeight]
  );
  const constraintContext = reactExports.useMemo(
    () => ({
      cols,
      maxRows,
      containerWidth,
      containerHeight: 0,
      // Overridden per-interaction with the measured container height
      rowHeight,
      margin,
      // Use empty layout here - the actual layout will be accessed via layoutRef when needed
      // This prevents the context from changing when layout changes, avoiding callback recreation
      layout: []
    }),
    [cols, maxRows, containerWidth, rowHeight, margin]
  );
  const getConstraintContext = reactExports.useCallback(
    (containerHeight) => ({
      ...constraintContext,
      containerHeight: containerHeight ?? constraintContext.containerHeight,
      layout: layoutRef.current
    }),
    [constraintContext]
  );
  const effectiveLayoutItem = reactExports.useMemo(
    () => layoutItem ?? {
      i,
      x,
      y,
      w,
      h,
      minW,
      maxW,
      minH,
      maxH
    },
    [layoutItem, i, x, y, w, h, minW, maxW, minH, maxH]
  );
  const createStyle = reactExports.useCallback(
    (pos2) => {
      if (positionStrategy?.calcStyle) {
        return positionStrategy.calcStyle(pos2);
      }
      if (useCSSTransforms) {
        return setTransform(pos2);
      }
      const styleObj = setTopLeft(pos2);
      if (usePercentages) {
        return {
          ...styleObj,
          left: perc(pos2.left / containerWidth),
          width: perc(pos2.width / containerWidth)
        };
      }
      return styleObj;
    },
    [positionStrategy, useCSSTransforms, usePercentages, containerWidth]
  );
  const onDragStart = reactExports.useCallback(
    (e, { node }) => {
      if (!onDragStartProp) return;
      const { offsetParent } = node;
      if (!offsetParent) return;
      const parentRect = offsetParent.getBoundingClientRect();
      const clientRect = node.getBoundingClientRect();
      const cLeft = clientRect.left / transformScale;
      const pLeft = parentRect.left / transformScale;
      const cTop = clientRect.top / transformScale;
      const pTop = parentRect.top / transformScale;
      let newPosition;
      if (positionStrategy?.calcDragPosition) {
        const mouseEvent = e;
        newPosition = positionStrategy.calcDragPosition(
          mouseEvent.clientX,
          mouseEvent.clientY,
          mouseEvent.clientX - clientRect.left,
          mouseEvent.clientY - clientRect.top
        );
      } else {
        newPosition = {
          left: cLeft - pLeft + offsetParent.scrollLeft,
          top: cTop - pTop + offsetParent.scrollTop
        };
      }
      dragPositionRef.current = newPosition;
      if (!edgeScrollRef.current) {
        edgeScrollRef.current = createEdgeScrollController(
          node instanceof HTMLElement ? node : null
        );
      }
      if (dragThreshold > 0) {
        const mouseEvent = e;
        initialDragClientRef.current = {
          x: mouseEvent.clientX,
          y: mouseEvent.clientY
        };
        dragPendingRef.current = true;
        thresholdExceededRef.current = false;
        setDragging(true);
        return;
      }
      setDragging(true);
      const rawPos = calcXYRaw(
        positionParams,
        newPosition.top,
        newPosition.left
      );
      const { x: newX, y: newY } = applyPositionConstraints(
        constraints,
        effectiveLayoutItem,
        rawPos.x,
        rawPos.y,
        getConstraintContext()
      );
      onDragStartProp(i, newX, newY, {
        e,
        node,
        newPosition
      });
    },
    [
      onDragStartProp,
      transformScale,
      positionParams,
      positionStrategy,
      dragThreshold,
      constraints,
      effectiveLayoutItem,
      getConstraintContext,
      i
    ]
  );
  const onDrag = reactExports.useCallback(
    (e, { node, deltaX, deltaY }) => {
      if (!onDragProp || !dragging) return;
      const mouseEvent = e;
      if (dragPendingRef.current && !thresholdExceededRef.current) {
        const dx = mouseEvent.clientX - initialDragClientRef.current.x;
        const dy = mouseEvent.clientY - initialDragClientRef.current.y;
        const distance = Math.hypot(dx, dy);
        if (distance < dragThreshold) {
          return;
        }
        thresholdExceededRef.current = true;
        dragPendingRef.current = false;
        if (onDragStartProp) {
          const rawPos2 = calcXYRaw(
            positionParams,
            dragPositionRef.current.top,
            dragPositionRef.current.left
          );
          const { x: startX, y: startY } = applyPositionConstraints(
            constraints,
            effectiveLayoutItem,
            rawPos2.x,
            rawPos2.y,
            getConstraintContext()
          );
          onDragStartProp(i, startX, startY, {
            e,
            node,
            newPosition: dragPositionRef.current
          });
        }
      }
      edgeScrollRef.current?.feed(mouseEvent.clientX, mouseEvent.clientY);
      let top = dragPositionRef.current.top + deltaY;
      let left = dragPositionRef.current.left + deltaX;
      if (isBounded) {
        const { offsetParent } = node;
        if (offsetParent) {
          const bottomBoundary = offsetParent.clientHeight - calcGridItemWHPx(h, rowHeight, margin[1]);
          top = clamp$1(top, 0, bottomBoundary);
          const colWidth2 = calcGridColWidth(positionParams);
          const rightBoundary = containerWidth - calcGridItemWHPx(w, colWidth2, margin[0]);
          left = clamp$1(left, 0, rightBoundary);
        }
      }
      const newPosition = { top, left };
      dragPositionRef.current = newPosition;
      bumpFrame((frame) => frame + 1);
      const rawPos = calcXYRaw(positionParams, top, left);
      const { x: newX, y: newY } = applyPositionConstraints(
        constraints,
        effectiveLayoutItem,
        rawPos.x,
        rawPos.y,
        getConstraintContext()
      );
      onDragProp(i, newX, newY, {
        e,
        node,
        newPosition
      });
    },
    [
      onDragProp,
      onDragStartProp,
      dragging,
      dragThreshold,
      isBounded,
      h,
      rowHeight,
      margin,
      positionParams,
      containerWidth,
      w,
      i,
      constraints,
      effectiveLayoutItem,
      getConstraintContext
    ]
  );
  const onDragStop = reactExports.useCallback(
    (e, { node }) => {
      if (!onDragStopProp || !dragging) return;
      edgeScrollRef.current?.stop();
      edgeScrollRef.current = null;
      const wasPending = dragPendingRef.current;
      dragPendingRef.current = false;
      thresholdExceededRef.current = false;
      initialDragClientRef.current = { x: 0, y: 0 };
      if (wasPending) {
        setDragging(false);
        dragPositionRef.current = { left: 0, top: 0 };
        return;
      }
      const { left, top } = dragPositionRef.current;
      const newPosition = { top, left };
      setDragging(false);
      dragPositionRef.current = { left: 0, top: 0 };
      const rawPos = calcXYRaw(positionParams, top, left);
      const { x: newX, y: newY } = applyPositionConstraints(
        constraints,
        effectiveLayoutItem,
        rawPos.x,
        rawPos.y,
        getConstraintContext()
      );
      onDragStopProp(i, newX, newY, {
        e,
        node,
        newPosition
      });
    },
    [
      onDragStopProp,
      dragging,
      positionParams,
      constraints,
      effectiveLayoutItem,
      getConstraintContext,
      i
    ]
  );
  onDragStartRef.current = onDragStart;
  onDragRef.current = onDrag;
  const onResizeHandler = reactExports.useCallback(
    (e, { node, size, handle: resizeHandle2 }, position, handlerName) => {
      const handler = handlerName === "onResizeStart" ? onResizeStartProp : handlerName === "onResize" ? onResizeProp : onResizeStopProp;
      if (!handler) return;
      let updatedSize;
      if (node) {
        updatedSize = resizeItemInDirection(
          resizeHandle2,
          position,
          size,
          containerWidth
        );
      } else {
        updatedSize = {
          ...size,
          top: position.top,
          left: position.left
        };
      }
      resizePositionRef.current = updatedSize;
      bumpFrame((frame) => frame + 1);
      const containerHeight = node?.offsetParent?.clientHeight ?? 0;
      const rawSize = calcWHRaw(
        positionParams,
        updatedSize.width,
        updatedSize.height
      );
      const { w: newW, h: newH } = applySizeConstraints(
        constraints,
        effectiveLayoutItem,
        rawSize.w,
        rawSize.h,
        resizeHandle2,
        getConstraintContext(containerHeight)
      );
      handler(i, newW, newH, {
        // react-resizable forwards react-draggable's callback event, which is
        // already a native MouseEvent/TouchEvent and has no `nativeEvent`.
        // Reading it unconditionally handed consumers `undefined` (#2264).
        // The drag handlers above pass the raw event for the same reason.
        e: e.nativeEvent ?? e,
        node,
        size: updatedSize,
        handle: resizeHandle2
      });
    },
    [
      onResizeStartProp,
      onResizeProp,
      onResizeStopProp,
      containerWidth,
      positionParams,
      i,
      constraints,
      effectiveLayoutItem,
      getConstraintContext
    ]
  );
  const handleResizeStart = reactExports.useCallback(
    (e, data) => {
      setResizing(true);
      const pos2 = calcGridItemPosition(positionParams, x, y, w, h);
      const typedData = {
        ...data,
        handle: data.handle
      };
      onResizeHandler(e, typedData, pos2, "onResizeStart");
    },
    [onResizeHandler, positionParams, x, y, w, h]
  );
  const handleResize = reactExports.useCallback(
    (e, data) => {
      const pos2 = calcGridItemPosition(positionParams, x, y, w, h);
      const typedData = {
        ...data,
        handle: data.handle
      };
      onResizeHandler(e, typedData, pos2, "onResize");
    },
    [onResizeHandler, positionParams, x, y, w, h]
  );
  const handleResizeStop = reactExports.useCallback(
    (e, data) => {
      setResizing(false);
      resizePositionRef.current = { top: 0, left: 0, width: 0, height: 0 };
      const pos2 = calcGridItemPosition(positionParams, x, y, w, h);
      const typedData = {
        ...data,
        handle: data.handle
      };
      onResizeHandler(e, typedData, pos2, "onResizeStop");
    },
    [onResizeHandler, positionParams, x, y, w, h]
  );
  reactExports.useEffect(() => {
    if (!droppingPosition) return;
    const node = elementRef.current;
    if (!node) return;
    const prevDroppingPosition = prevDroppingPositionRef.current || {
      left: 0,
      top: 0
    };
    const shouldDrag = dragging && (droppingPosition.left !== prevDroppingPosition.left || droppingPosition.top !== prevDroppingPosition.top);
    if (!dragging) {
      const fakeData = {
        node,
        deltaX: droppingPosition.left,
        deltaY: droppingPosition.top,
        lastX: 0,
        lastY: 0,
        x: droppingPosition.left,
        y: droppingPosition.top
      };
      onDragStartRef.current?.(
        droppingPosition.e,
        fakeData
      );
    } else if (shouldDrag) {
      const deltaX = droppingPosition.left - dragPositionRef.current.left;
      const deltaY = droppingPosition.top - dragPositionRef.current.top;
      const fakeData = {
        node,
        deltaX,
        deltaY,
        lastX: dragPositionRef.current.left,
        lastY: dragPositionRef.current.top,
        x: droppingPosition.left,
        y: droppingPosition.top
      };
      onDragRef.current?.(
        droppingPosition.e,
        fakeData
      );
    }
    prevDroppingPositionRef.current = droppingPosition;
  }, [droppingPosition, dragging, i]);
  const pos = calcGridItemPosition(
    positionParams,
    x,
    y,
    w,
    h,
    dragging ? dragPositionRef.current : null,
    resizing ? resizePositionRef.current : null
  );
  const child = React.Children.only(children);
  const colWidth = calcGridColWidth(positionParams);
  const minConstraints = [
    calcGridItemWHPx(minW, colWidth, margin[0]),
    calcGridItemWHPx(minH, rowHeight, margin[1])
  ];
  const maxConstraints = [
    calcGridItemWHPx(maxW, colWidth, margin[0]),
    calcGridItemWHPx(maxH, rowHeight, margin[1])
  ];
  const childProps = child.props;
  const childClassName = childProps["className"];
  const childStyle = childProps["style"];
  let newChild = React.cloneElement(child, {
    ref: elementRef,
    className: clsx$1("react-grid-item", childClassName, className, {
      static: isStatic,
      resizing,
      "react-draggable": isDraggable,
      "react-draggable-dragging": dragging,
      dropping: Boolean(droppingPosition),
      cssTransforms: useCSSTransforms
    }),
    style: {
      ...style,
      ...childStyle,
      ...createStyle(pos)
    }
  });
  const resizableHandle = resizeHandle;
  newChild = /* @__PURE__ */ jsxRuntimeExports.jsx(
    reactResizableExports.Resizable,
    {
      draggableOpts: { disabled: !isResizable },
      className: isResizable ? void 0 : "react-resizable-hide",
      width: pos.width,
      height: pos.height,
      minConstraints,
      maxConstraints,
      onResizeStart: handleResizeStart,
      onResize: handleResize,
      onResizeStop: handleResizeStop,
      transformScale,
      resizeHandles,
      handle: resizableHandle,
      children: newChild
    }
  );
  newChild = /* @__PURE__ */ jsxRuntimeExports.jsx(
    DraggableCore,
    {
      disabled: !isDraggable,
      onStart: onDragStart,
      onDrag,
      onStop: onDragStop,
      handle,
      cancel: ".react-resizable-handle" + (cancel ? "," + cancel : ""),
      scale: transformScale,
      allowMobileScroll,
      nodeRef: elementRef,
      children: newChild
    }
  );
  return newChild;
}
var GridItem = React.memo(GridItemInner, (prev, next) => {
  if (prev.x !== next.x || prev.y !== next.y) return false;
  if (prev.w !== next.w || prev.h !== next.h) return false;
  if (prev.minW !== next.minW || prev.maxW !== next.maxW) return false;
  if (prev.minH !== next.minH || prev.maxH !== next.maxH) return false;
  if (prev.cols !== next.cols) return false;
  if (prev.containerWidth !== next.containerWidth) return false;
  if (prev.rowHeight !== next.rowHeight) return false;
  if (prev.maxRows !== next.maxRows) return false;
  if (prev.margin !== next.margin) return false;
  if (prev.containerPadding !== next.containerPadding) return false;
  if (prev.transformScale !== next.transformScale) return false;
  if (prev.isDraggable !== next.isDraggable) return false;
  if (prev.isResizable !== next.isResizable) return false;
  if (prev.isBounded !== next.isBounded) return false;
  if (prev.allowMobileScroll !== next.allowMobileScroll) return false;
  if (prev.useCSSTransforms !== next.useCSSTransforms) return false;
  if (prev.usePercentages !== next.usePercentages) return false;
  if (prev.children !== next.children) return false;
  if (prev.onDrag !== next.onDrag) return false;
  if (prev.onDragStop !== next.onDragStop) return false;
  if (prev.onResize !== next.onResize) return false;
  if (prev.onResizeStop !== next.onResizeStop) return false;
  if (prev.droppingPosition !== next.droppingPosition) return false;
  return true;
});
GridItem.displayName = "GridItem";
function computeDropPosition(input) {
  const {
    clientX,
    clientY,
    gridElement,
    droppingItem,
    event,
    dragOffsetX = 0,
    dragOffsetY = 0,
    transformScale,
    cols,
    margin,
    maxRows,
    rowHeight,
    width,
    containerPadding
  } = input;
  const gridRect = gridElement.getBoundingClientRect();
  const positionParams = {
    cols,
    margin,
    maxRows,
    rowHeight,
    containerWidth: width,
    containerPadding
  };
  const actualColWidth = calcGridColWidth(positionParams);
  const itemPixelWidth = calcGridItemWHPx(
    droppingItem.w,
    actualColWidth,
    margin[0]
  );
  const itemPixelHeight = calcGridItemWHPx(
    droppingItem.h,
    rowHeight,
    margin[1]
  );
  const itemCenterOffsetX = itemPixelWidth / 2;
  const itemCenterOffsetY = itemPixelHeight / 2;
  const scrollLeft = gridElement.scrollLeft ?? 0;
  const scrollTop = gridElement.scrollTop ?? 0;
  const rawGridX = clientX - gridRect.left + scrollLeft + dragOffsetX - itemCenterOffsetX;
  const rawGridY = clientY - gridRect.top + scrollTop + dragOffsetY - itemCenterOffsetY;
  const clampedGridX = Math.max(0, rawGridX);
  const clampedGridY = Math.max(0, rawGridY);
  const newDroppingPosition = {
    left: clampedGridX / transformScale,
    top: clampedGridY / transformScale,
    e: event
  };
  const calculatedXY = calcXY(
    positionParams,
    clampedGridY,
    clampedGridX,
    droppingItem.w,
    droppingItem.h
  );
  return {
    newDroppingPosition,
    calculatedXY
  };
}
var noop2 = () => {
};
var layoutClassName = "react-grid-layout";
var isFirefox = false;
try {
  isFirefox = /firefox/i.test(navigator.userAgent);
} catch {
}
function childrenEqual(a, b) {
  const aArr = React.Children.toArray(a);
  const bArr = React.Children.toArray(b);
  if (aArr.length !== bArr.length) return false;
  for (let i = 0; i < aArr.length; i++) {
    const aChild = aArr[i];
    const bChild = bArr[i];
    if (aChild?.key !== bChild?.key) return false;
  }
  return true;
}
function synchronizeLayoutWithChildren(initialLayout, children, cols, compactor) {
  const layout = [];
  const childKeys = /* @__PURE__ */ new Set();
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || child.key === null) return;
    const key = String(child.key);
    childKeys.add(key);
    const existingItem = initialLayout.find((l) => l.i === key);
    if (existingItem) {
      layout.push(cloneLayoutItem(existingItem));
    } else {
      const childProps = child.props;
      const dataGrid = childProps["data-grid"];
      if (dataGrid) {
        layout.push({
          i: key,
          x: dataGrid.x ?? 0,
          y: dataGrid.y ?? 0,
          w: dataGrid.w ?? 1,
          h: dataGrid.h ?? 1,
          minW: dataGrid.minW,
          maxW: dataGrid.maxW,
          minH: dataGrid.minH,
          maxH: dataGrid.maxH,
          static: dataGrid.static,
          isDraggable: dataGrid.isDraggable,
          isResizable: dataGrid.isResizable,
          resizeHandles: dataGrid.resizeHandles,
          isBounded: dataGrid.isBounded
        });
      } else {
        layout.push({
          i: key,
          x: 0,
          y: bottom(layout),
          w: 1,
          h: 1
        });
      }
    }
  });
  const corrected = correctBounds(layout, { cols });
  return compactor.compact(corrected, cols);
}
function GridLayout(props) {
  const {
    // Required
    children,
    width,
    // Composable config interfaces
    gridConfig: gridConfigProp,
    dragConfig: dragConfigProp,
    resizeConfig: resizeConfigProp,
    dropConfig: dropConfigProp,
    positionStrategy = defaultPositionStrategy,
    compactor: compactorProp,
    constraints = defaultConstraints,
    // Layout data
    layout: propsLayout = [],
    droppingItem: droppingItemProp,
    // Container props
    autoSize = true,
    className = "",
    style = {},
    innerRef,
    // Callbacks
    onLayoutChange = noop2,
    onDragStart: onDragStartProp = noop2,
    onDrag: onDragProp = noop2,
    onDragStop: onDragStopProp = noop2,
    onResizeStart: onResizeStartProp = noop2,
    onResize: onResizeProp = noop2,
    onResizeStop: onResizeStopProp = noop2,
    onDrop: onDropProp = noop2,
    onDropDragOver: onDropDragOverProp = noop2
  } = props;
  const gridConfig = reactExports.useMemo(
    () => ({ ...defaultGridConfig, ...gridConfigProp }),
    [gridConfigProp]
  );
  const dragConfig = reactExports.useMemo(
    () => ({ ...defaultDragConfig, ...dragConfigProp }),
    [dragConfigProp]
  );
  const resizeConfig = reactExports.useMemo(
    () => ({ ...defaultResizeConfig, ...resizeConfigProp }),
    [resizeConfigProp]
  );
  const dropConfig = reactExports.useMemo(
    () => ({ ...defaultDropConfig, ...dropConfigProp }),
    [dropConfigProp]
  );
  const { cols, rowHeight, maxRows, margin, containerPadding } = gridConfig;
  const {
    enabled: isDraggable,
    bounded: isBounded,
    handle: draggableHandle,
    cancel: draggableCancel,
    threshold: dragThreshold,
    allowMobileScroll: dragAllowMobileScroll
  } = dragConfig;
  const {
    enabled: isResizable,
    handles: resizeHandles,
    handleComponent: resizeHandle
  } = resizeConfig;
  const {
    enabled: isDroppable,
    defaultItem: defaultDropItem,
    onDragOver: dropConfigOnDragOver,
    touchEnabled = true,
    touchDragSource = "[data-rgl-draggable]"
  } = dropConfig;
  const compactor = compactorProp ?? getCompactor("vertical");
  const compactType = compactor.type;
  const allowOverlap = compactor.allowOverlap;
  const preventCollision = compactor.preventCollision ?? false;
  const droppingItem = reactExports.useMemo(
    () => droppingItemProp ?? {
      i: "__dropping-elem__",
      ...defaultDropItem
    },
    [droppingItemProp, defaultDropItem]
  );
  const useCSSTransforms = positionStrategy.type === "transform";
  const transformScale = positionStrategy.scale;
  const effectiveContainerPadding = containerPadding ?? margin;
  const [mounted, setMounted] = reactExports.useState(false);
  const [layout, setLayout] = reactExports.useState(
    () => synchronizeLayoutWithChildren(propsLayout, children, cols, compactor)
  );
  const [activeDrag, setActiveDrag] = reactExports.useState(null);
  const [resizing, setResizing] = reactExports.useState(false);
  const [droppingDOMNode, setDroppingDOMNode] = reactExports.useState(
    null
  );
  const [droppingPosition, setDroppingPosition] = reactExports.useState();
  const droppingPositionRef = reactExports.useRef(void 0);
  droppingPositionRef.current = droppingPosition;
  const oldDragItemRef = reactExports.useRef(null);
  const oldResizeItemRef = reactExports.useRef(null);
  const oldLayoutRef = reactExports.useRef(null);
  const dragEnterCounterRef = reactExports.useRef(0);
  const prevLayoutRef = reactExports.useRef(layout);
  const prevPropsLayoutRef = reactExports.useRef(propsLayout);
  const prevChildrenRef = reactExports.useRef(children);
  const prevCompactTypeRef = reactExports.useRef(compactType);
  const gridContainerRef = reactExports.useRef(null);
  const touchDragActiveRef = reactExports.useRef(false);
  const activeTouchIdRef = reactExports.useRef(null);
  const droppingDOMNodeRef = reactExports.useRef(null);
  droppingDOMNodeRef.current = droppingDOMNode;
  const onDropPropRef = reactExports.useRef(onDropProp);
  reactExports.useLayoutEffect(() => {
    onDropPropRef.current = onDropProp;
  });
  const layoutRef = reactExports.useRef(layout);
  layoutRef.current = layout;
  reactExports.useEffect(() => {
    setMounted(true);
    if (!deepEqual(layout, propsLayout)) {
      onLayoutChange(layout);
    }
  }, []);
  reactExports.useEffect(() => {
    if (activeDrag) return;
    if (droppingDOMNode) return;
    const layoutChanged = !deepEqual(propsLayout, prevPropsLayoutRef.current);
    const childrenChanged = !childrenEqual(children, prevChildrenRef.current);
    const compactTypeChanged = compactType !== prevCompactTypeRef.current;
    if (layoutChanged || childrenChanged || compactTypeChanged) {
      const baseLayout = layoutChanged ? propsLayout : layout;
      const newLayout = synchronizeLayoutWithChildren(
        baseLayout,
        children,
        cols,
        compactor
      );
      if (!deepEqual(newLayout, layout)) {
        setLayout(newLayout);
      }
    }
    prevPropsLayoutRef.current = propsLayout;
    prevChildrenRef.current = children;
    prevCompactTypeRef.current = compactType;
  }, [
    propsLayout,
    children,
    cols,
    compactType,
    compactor,
    activeDrag,
    droppingDOMNode,
    layout
  ]);
  reactExports.useEffect(() => {
    if (!activeDrag && !droppingDOMNode && !deepEqual(layout, prevLayoutRef.current)) {
      prevLayoutRef.current = layout;
      const publicLayout = layout.filter((l) => l.i !== droppingItem.i);
      onLayoutChange(publicLayout);
    }
  }, [layout, activeDrag, droppingDOMNode, onLayoutChange, droppingItem.i]);
  const containerHeight = reactExports.useMemo(() => {
    if (!autoSize) return void 0;
    const nbRow = bottom(layout);
    const containerPaddingY = effectiveContainerPadding[1];
    return nbRow * rowHeight + (nbRow - 1) * margin[1] + containerPaddingY * 2 + "px";
  }, [autoSize, layout, rowHeight, margin, effectiveContainerPadding]);
  const onDragStart = reactExports.useCallback(
    (i, _x, _y, data) => {
      const currentLayout = layoutRef.current;
      const l = getLayoutItem(currentLayout, i);
      if (!l) return;
      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        i
      };
      oldDragItemRef.current = cloneLayoutItem(l);
      oldLayoutRef.current = currentLayout;
      setActiveDrag(placeholder);
      onDragStartProp(currentLayout, l, l, null, data.e, data.node);
    },
    [onDragStartProp]
  );
  const onDrag = reactExports.useCallback(
    (i, x, y, data) => {
      const currentLayout = layoutRef.current;
      const oldDragItem = oldDragItemRef.current;
      const l = getLayoutItem(currentLayout, i);
      if (!l) return;
      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        i
      };
      const newLayout = moveElement(
        currentLayout,
        l,
        x,
        y,
        true,
        preventCollision,
        compactType,
        cols,
        allowOverlap
      );
      onDragProp(newLayout, oldDragItem, l, placeholder, data.e, data.node);
      setLayout(compactor.compact(newLayout, cols));
      setActiveDrag(placeholder);
    },
    [preventCollision, compactType, cols, allowOverlap, compactor, onDragProp]
  );
  const onDragStop = reactExports.useCallback(
    (i, x, y, data) => {
      if (!oldDragItemRef.current) return;
      const currentLayout = layoutRef.current;
      const oldDragItem = oldDragItemRef.current;
      const l = getLayoutItem(currentLayout, i);
      if (!l) return;
      const newLayout = moveElement(
        currentLayout,
        l,
        x,
        y,
        true,
        preventCollision,
        compactType,
        cols,
        allowOverlap
      );
      const finalLayout = compactor.compact(newLayout, cols);
      onDragStopProp(finalLayout, oldDragItem, l, null, data.e, data.node);
      const oldLayout = oldLayoutRef.current;
      oldDragItemRef.current = null;
      oldLayoutRef.current = null;
      setActiveDrag(null);
      setLayout(finalLayout);
      if (oldLayout && !deepEqual(oldLayout, finalLayout)) {
        onLayoutChange(finalLayout);
      }
    },
    [
      preventCollision,
      compactType,
      cols,
      allowOverlap,
      compactor,
      onDragStopProp,
      onLayoutChange
    ]
  );
  const onResizeStart = reactExports.useCallback(
    (i, _w, _h, data) => {
      const currentLayout = layoutRef.current;
      const l = getLayoutItem(currentLayout, i);
      if (!l) return;
      oldResizeItemRef.current = cloneLayoutItem(l);
      oldLayoutRef.current = currentLayout;
      setResizing(true);
      onResizeStartProp(currentLayout, l, l, null, data.e, data.node);
    },
    [onResizeStartProp]
  );
  const onResize = reactExports.useCallback(
    (i, w, h, data) => {
      const currentLayout = layoutRef.current;
      const oldResizeItem = oldResizeItemRef.current;
      const { handle } = data;
      let shouldMoveItem = false;
      let newX;
      let newY;
      const [newLayout, l] = withLayoutItem(currentLayout, i, (item) => {
        newX = item.x;
        newY = item.y;
        if (["sw", "w", "nw", "n", "ne"].includes(handle)) {
          if (["sw", "nw", "w"].includes(handle)) {
            newX = item.x + (item.w - w);
            w = item.x !== newX && newX < 0 ? item.w : w;
            newX = newX < 0 ? 0 : newX;
          }
          if (["ne", "n", "nw"].includes(handle)) {
            newY = item.y + (item.h - h);
            h = item.y !== newY && newY < 0 ? item.h : h;
            newY = newY < 0 ? 0 : newY;
          }
          shouldMoveItem = true;
        }
        if (preventCollision && !allowOverlap) {
          const collisions = getAllCollisions(currentLayout, {
            ...item,
            w,
            h,
            x: newX ?? item.x,
            y: newY ?? item.y
          }).filter((layoutItem) => layoutItem.i !== item.i);
          if (collisions.length > 0) {
            newY = item.y;
            h = item.h;
            newX = item.x;
            w = item.w;
            shouldMoveItem = false;
          }
        }
        item.w = w;
        item.h = h;
        if (handle === "n" || handle === "nw" || handle === "ne") {
          item.y = newY ?? item.y;
        }
        return item;
      });
      if (!l) return;
      let finalLayout = newLayout;
      if (shouldMoveItem && newX !== void 0 && newY !== void 0) {
        finalLayout = moveElement(
          newLayout,
          l,
          newX,
          newY,
          true,
          preventCollision,
          compactType,
          cols,
          allowOverlap
        );
      }
      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        i,
        static: true
      };
      onResizeProp(
        finalLayout,
        oldResizeItem,
        l,
        placeholder,
        data.e,
        data.node
      );
      const compactedLayout = compactor.compact(finalLayout, cols);
      if (handle === "n" || handle === "nw" || handle === "ne") {
        const resized = compactedLayout.find((item) => item.i === i);
        if (resized) {
          resized.y = l.y;
        }
      }
      setLayout(compactedLayout);
      setActiveDrag(placeholder);
    },
    [preventCollision, compactType, cols, allowOverlap, compactor, onResizeProp]
  );
  const onResizeStop = reactExports.useCallback(
    (i, _w, _h, data) => {
      const currentLayout = layoutRef.current;
      const oldResizeItem = oldResizeItemRef.current;
      const l = getLayoutItem(currentLayout, i);
      const finalLayout = compactor.compact(currentLayout, cols);
      onResizeStopProp(
        finalLayout,
        oldResizeItem,
        l ?? null,
        null,
        data.e,
        data.node
      );
      const oldLayout = oldLayoutRef.current;
      oldResizeItemRef.current = null;
      oldLayoutRef.current = null;
      setActiveDrag(null);
      setResizing(false);
      setLayout(finalLayout);
      if (oldLayout && !deepEqual(oldLayout, finalLayout)) {
        onLayoutChange(finalLayout);
      }
    },
    [cols, compactor, onResizeStopProp, onLayoutChange]
  );
  const placeDroppingItem = reactExports.useCallback(
    (itemToPlace, newDroppingPosition, calculatedXY, hasPlaceholder) => {
      if (!hasPlaceholder) {
        setDroppingDOMNode(/* @__PURE__ */ jsxRuntimeExports.jsx("div", {}, itemToPlace.i));
        setDroppingPosition(newDroppingPosition);
        const baseLayout = layoutRef.current.filter((l) => l.i !== itemToPlace.i);
        setLayout([
          ...baseLayout,
          {
            ...itemToPlace,
            x: calculatedXY.x,
            y: calculatedXY.y,
            static: false,
            isDraggable: true
          }
        ]);
      } else if (droppingPositionRef.current) {
        const shouldUpdate = droppingPositionRef.current.left !== newDroppingPosition.left || droppingPositionRef.current.top !== newDroppingPosition.top;
        if (shouldUpdate) {
          setDroppingPosition(newDroppingPosition);
          setLayout(
            (currentLayout) => currentLayout.map(
              (item) => item.i === itemToPlace.i && (item.x !== calculatedXY.x || item.y !== calculatedXY.y) ? { ...item, x: calculatedXY.x, y: calculatedXY.y } : item
            )
          );
        }
      }
    },
    []
  );
  const applyTouchDropPosition = reactExports.useCallback(
    (clientX, clientY, nativeEvent) => {
      const gridEl = gridContainerRef.current;
      if (!gridEl) return;
      const { newDroppingPosition, calculatedXY } = computeDropPosition({
        clientX,
        clientY,
        gridElement: gridEl,
        droppingItem,
        event: nativeEvent,
        transformScale,
        cols,
        margin,
        maxRows,
        rowHeight,
        width,
        containerPadding: effectiveContainerPadding
      });
      placeDroppingItem(
        droppingItem,
        newDroppingPosition,
        calculatedXY,
        !!droppingDOMNodeRef.current
      );
    },
    [
      droppingItem,
      transformScale,
      cols,
      margin,
      maxRows,
      rowHeight,
      width,
      effectiveContainerPadding,
      placeDroppingItem
    ]
  );
  const removeDroppingPlaceholder = reactExports.useCallback(() => {
    const currentLayout = layoutRef.current;
    const hasDroppingItem = currentLayout.some((l) => l.i === droppingItem.i);
    if (!hasDroppingItem) {
      setDroppingDOMNode(null);
      setActiveDrag(null);
      setDroppingPosition(void 0);
      return;
    }
    const newLayout = compactor.compact(
      currentLayout.filter((l) => l.i !== droppingItem.i),
      cols
    );
    setLayout(newLayout);
    setDroppingDOMNode(null);
    setActiveDrag(null);
    setDroppingPosition(void 0);
  }, [droppingItem.i, cols, compactor]);
  const handleDragOver = reactExports.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isFirefox && !e.nativeEvent.target?.classList.contains(
        layoutClassName
      )) {
        return false;
      }
      const rawResult = dropConfigOnDragOver ? dropConfigOnDragOver(e.nativeEvent) : onDropDragOverProp(e);
      if (rawResult === false) {
        if (droppingDOMNode) {
          removeDroppingPlaceholder();
        }
        return false;
      }
      const {
        dragOffsetX = 0,
        dragOffsetY = 0,
        ...onDragOverResult
      } = rawResult ?? {};
      const finalDroppingItem = { ...droppingItem, ...onDragOverResult };
      const { newDroppingPosition, calculatedXY } = computeDropPosition({
        clientX: e.clientX,
        clientY: e.clientY,
        gridElement: e.currentTarget,
        droppingItem: finalDroppingItem,
        event: e.nativeEvent,
        dragOffsetX,
        dragOffsetY,
        transformScale,
        cols,
        margin,
        maxRows,
        rowHeight,
        width,
        containerPadding: effectiveContainerPadding
      });
      placeDroppingItem(
        finalDroppingItem,
        newDroppingPosition,
        calculatedXY,
        !!droppingDOMNode
      );
    },
    [
      droppingDOMNode,
      droppingItem,
      dropConfigOnDragOver,
      onDropDragOverProp,
      removeDroppingPlaceholder,
      placeDroppingItem,
      transformScale,
      cols,
      margin,
      maxRows,
      rowHeight,
      width,
      effectiveContainerPadding
    ]
  );
  const handleDragLeave = reactExports.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragEnterCounterRef.current--;
      if (dragEnterCounterRef.current < 0) {
        dragEnterCounterRef.current = 0;
      }
      if (dragEnterCounterRef.current === 0) {
        removeDroppingPlaceholder();
      }
    },
    [removeDroppingPlaceholder]
  );
  const handleDragEnter = reactExports.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragEnterCounterRef.current++;
  }, []);
  const commitDrop = reactExports.useCallback(
    (nativeEvent) => {
      const currentLayout = layoutRef.current;
      const item = currentLayout.find((l) => l.i === droppingItem.i);
      removeDroppingPlaceholder();
      onDropPropRef.current(currentLayout, item, nativeEvent);
    },
    [droppingItem.i, removeDroppingPlaceholder]
  );
  const handleDrop = reactExports.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragEnterCounterRef.current = 0;
      commitDrop(e.nativeEvent);
    },
    [commitDrop]
  );
  reactExports.useEffect(() => {
    if (!isDroppable || !touchEnabled) return;
    const gridEl = gridContainerRef.current;
    if (!gridEl) return;
    const isOverGrid = (clientX, clientY) => {
      const el = document.elementFromPoint(clientX, clientY);
      return el ? gridEl.contains(el) : false;
    };
    const isSourceElement = (target) => {
      if (!(target instanceof HTMLElement)) return false;
      return target.closest(touchDragSource) !== null;
    };
    const getTouch2 = (e) => {
      const touches = e.changedTouches;
      if (!touches || touches.length === 0) return void 0;
      const id = activeTouchIdRef.current;
      if (id === null) return touches[0];
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        if (touch && touch.identifier === id) return touch;
      }
      return void 0;
    };
    const handleTouchStart = (e) => {
      if (!isSourceElement(e.target)) return;
      if (activeTouchIdRef.current !== null) return;
      e.preventDefault();
      const touch = e.changedTouches?.[0];
      if (!touch) return;
      activeTouchIdRef.current = touch.identifier;
      touchDragActiveRef.current = true;
    };
    const handleTouchMove = (e) => {
      if (!touchDragActiveRef.current) return;
      e.preventDefault();
      const touch = getTouch2(e);
      if (!touch) return;
      if (!isOverGrid(touch.clientX, touch.clientY)) {
        if (droppingDOMNodeRef.current) removeDroppingPlaceholder();
        return;
      }
      applyTouchDropPosition(touch.clientX, touch.clientY, e);
    };
    const handleTouchEnd = (e) => {
      if (!touchDragActiveRef.current) return;
      e.preventDefault();
      const touch = getTouch2(e);
      touchDragActiveRef.current = false;
      activeTouchIdRef.current = null;
      if (!touch) return;
      if (!isOverGrid(touch.clientX, touch.clientY)) {
        removeDroppingPlaceholder();
        return;
      }
      commitDrop(e);
    };
    const handleTouchCancel = () => {
      if (!touchDragActiveRef.current) return;
      touchDragActiveRef.current = false;
      activeTouchIdRef.current = null;
      removeDroppingPlaceholder();
    };
    const opts = { passive: false };
    document.addEventListener("touchstart", handleTouchStart, opts);
    document.addEventListener("touchmove", handleTouchMove, opts);
    document.addEventListener("touchend", handleTouchEnd, opts);
    document.addEventListener("touchcancel", handleTouchCancel, opts);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart, opts);
      document.removeEventListener("touchmove", handleTouchMove, opts);
      document.removeEventListener("touchend", handleTouchEnd, opts);
      document.removeEventListener("touchcancel", handleTouchCancel, opts);
    };
  }, [
    isDroppable,
    touchEnabled,
    touchDragSource,
    applyTouchDropPosition,
    removeDroppingPlaceholder,
    commitDrop,
    droppingItem.i
  ]);
  const processGridItem = reactExports.useCallback(
    (child, isDroppingItem) => {
      if (!child || !child.key) return null;
      const l = getLayoutItem(layout, String(child.key));
      if (!l) return null;
      const draggable = typeof l.isDraggable === "boolean" ? l.isDraggable : !l.static && isDraggable;
      const resizable = typeof l.isResizable === "boolean" ? l.isResizable : !l.static && isResizable;
      const resizeHandlesOptions = l.resizeHandles || [...resizeHandles];
      const bounded = draggable && isBounded && l.isBounded !== false;
      const resizeHandleElement = resizeHandle;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        GridItem,
        {
          containerWidth: width,
          cols,
          margin,
          containerPadding: effectiveContainerPadding,
          maxRows,
          rowHeight,
          cancel: draggableCancel,
          handle: draggableHandle,
          onDragStart,
          onDrag,
          onDragStop,
          onResizeStart,
          onResize,
          onResizeStop,
          isDraggable: draggable,
          isResizable: resizable,
          isBounded: bounded,
          allowMobileScroll: dragAllowMobileScroll,
          useCSSTransforms: useCSSTransforms && mounted,
          usePercentages: !mounted,
          transformScale,
          positionStrategy,
          dragThreshold,
          w: l.w,
          h: l.h,
          x: l.x,
          y: l.y,
          i: l.i,
          minH: l.minH,
          minW: l.minW,
          maxH: l.maxH,
          maxW: l.maxW,
          static: l.static,
          droppingPosition: isDroppingItem ? droppingPosition : void 0,
          resizeHandles: resizeHandlesOptions,
          resizeHandle: resizeHandleElement,
          constraints,
          layoutItem: l,
          layout,
          children: child
        },
        l.i
      );
    },
    [
      layout,
      width,
      cols,
      margin,
      effectiveContainerPadding,
      maxRows,
      rowHeight,
      draggableCancel,
      draggableHandle,
      onDragStart,
      onDrag,
      onDragStop,
      onResizeStart,
      onResize,
      onResizeStop,
      isDraggable,
      isResizable,
      isBounded,
      useCSSTransforms,
      mounted,
      transformScale,
      positionStrategy,
      dragThreshold,
      droppingPosition,
      resizeHandles,
      resizeHandle,
      constraints
    ]
  );
  const renderPlaceholder = () => {
    if (!activeDrag) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      GridItem,
      {
        w: activeDrag.w,
        h: activeDrag.h,
        x: activeDrag.x,
        y: activeDrag.y,
        i: activeDrag.i,
        className: `react-grid-placeholder ${resizing ? "placeholder-resizing" : ""}`,
        containerWidth: width,
        cols,
        margin,
        containerPadding: effectiveContainerPadding,
        maxRows,
        rowHeight,
        isDraggable: false,
        isResizable: false,
        isBounded: false,
        useCSSTransforms,
        transformScale,
        constraints,
        layout,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {})
      }
    );
  };
  const setGridRef = reactExports.useCallback(
    (node) => {
      gridContainerRef.current = node;
      if (typeof innerRef === "function") {
        innerRef(node);
      } else if (innerRef && "current" in innerRef) {
        innerRef.current = node;
      }
    },
    [innerRef]
  );
  const mergedClassName = clsx$1(layoutClassName, className);
  const mergedStyle = {
    height: containerHeight,
    ...style
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: setGridRef,
      className: mergedClassName,
      style: mergedStyle,
      onDrop: isDroppable ? handleDrop : void 0,
      onDragLeave: isDroppable ? handleDragLeave : void 0,
      onDragEnter: isDroppable ? handleDragEnter : void 0,
      onDragOver: isDroppable ? handleDragOver : void 0,
      children: [
        React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          return processGridItem(child);
        }),
        isDroppable && droppingDOMNode && processGridItem(droppingDOMNode, true),
        renderPlaceholder()
      ]
    }
  );
}
var DEFAULT_BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0
};
var DEFAULT_COLS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2
};
var noop22 = () => {
};
function synchronizeLayoutWithChildren2(initialLayout, children, cols, compactor, reSeedFromDataGrid = false) {
  const layout = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || child.key === null) return;
    const key = String(child.key);
    const childProps = child.props;
    const dataGrid = childProps["data-grid"];
    const existingItem = initialLayout.find((l) => l.i === key);
    if (existingItem) {
      if (reSeedFromDataGrid && dataGrid) {
        layout.push({
          ...existingItem,
          i: key,
          w: dataGrid.w ?? existingItem.w,
          h: dataGrid.h ?? existingItem.h,
          minW: dataGrid.minW ?? existingItem.minW,
          maxW: dataGrid.maxW ?? existingItem.maxW,
          minH: dataGrid.minH ?? existingItem.minH,
          maxH: dataGrid.maxH ?? existingItem.maxH
        });
      } else {
        layout.push({
          ...existingItem,
          i: key
        });
      }
    } else {
      if (dataGrid) {
        layout.push({
          i: key,
          x: dataGrid.x ?? 0,
          y: dataGrid.y ?? 0,
          w: dataGrid.w ?? 1,
          h: dataGrid.h ?? 1,
          minW: dataGrid.minW,
          maxW: dataGrid.maxW,
          minH: dataGrid.minH,
          maxH: dataGrid.maxH,
          static: dataGrid.static,
          isDraggable: dataGrid.isDraggable,
          isResizable: dataGrid.isResizable,
          resizeHandles: dataGrid.resizeHandles,
          isBounded: dataGrid.isBounded
        });
      } else {
        layout.push({
          i: key,
          x: 0,
          y: bottom(layout),
          w: 1,
          h: 1
        });
      }
    }
  });
  const corrected = correctBounds(layout, { cols });
  return compactor.compact(corrected, cols);
}
function ResponsiveGridLayoutInner(props) {
  const {
    children,
    width,
    breakpoint: propBreakpoint,
    breakpoints = DEFAULT_BREAKPOINTS,
    cols: colsConfig = DEFAULT_COLS,
    layouts: propsLayouts = {},
    rowHeight = 150,
    maxRows = Infinity,
    margin: propMargin = [10, 10],
    containerPadding: propContainerPadding = null,
    compactor: compactorProp,
    onBreakpointChange = noop22,
    onLayoutChange = noop22,
    onWidthChange = noop22,
    ...restProps
  } = props;
  const compactor = compactorProp ?? getCompactor("vertical");
  const compactType = compactor.type;
  const allowOverlap = compactor.allowOverlap;
  const initialBreakpoint = reactExports.useMemo(() => {
    return propBreakpoint ?? getBreakpointFromWidth(breakpoints, width);
  }, []);
  const initialCols = reactExports.useMemo(() => {
    return getColsFromBreakpoint(initialBreakpoint, colsConfig);
  }, [initialBreakpoint, colsConfig]);
  const initialLayout = reactExports.useMemo(() => {
    return findOrGenerateResponsiveLayout(
      propsLayouts,
      breakpoints,
      initialBreakpoint,
      initialBreakpoint,
      initialCols,
      compactType
    );
  }, []);
  const [breakpoint, setBreakpoint] = reactExports.useState(initialBreakpoint);
  const [cols, setCols] = reactExports.useState(initialCols);
  const [layout, setLayout] = reactExports.useState(initialLayout);
  const [layouts, setLayouts] = reactExports.useState(propsLayouts);
  const prevWidthRef = reactExports.useRef(width);
  const prevBreakpointRef = reactExports.useRef(propBreakpoint);
  const prevBreakpointsRef = reactExports.useRef(breakpoints);
  const prevColsRef = reactExports.useRef(colsConfig);
  const prevLayoutsRef = reactExports.useRef(propsLayouts);
  const prevCompactTypeRef = reactExports.useRef(compactType);
  const layoutsRef = reactExports.useRef(layouts);
  reactExports.useEffect(() => {
    layoutsRef.current = layouts;
  }, [layouts]);
  const derivedLayout = reactExports.useMemo(() => {
    if (!deepEqual(propsLayouts, prevLayoutsRef.current)) {
      return findOrGenerateResponsiveLayout(
        propsLayouts,
        breakpoints,
        breakpoint,
        breakpoint,
        cols,
        compactor
      );
    }
    return null;
  }, [propsLayouts, breakpoints, breakpoint, cols, compactor]);
  const effectiveLayout = derivedLayout ?? layout;
  reactExports.useEffect(() => {
    if (derivedLayout !== null) {
      setLayout(derivedLayout);
      setLayouts(propsLayouts);
      layoutsRef.current = propsLayouts;
      prevLayoutsRef.current = propsLayouts;
    }
  }, [derivedLayout, propsLayouts]);
  reactExports.useEffect(() => {
    if (compactType !== prevCompactTypeRef.current) {
      const newLayout = compactor.compact(cloneLayout(effectiveLayout), cols);
      const newLayouts = {
        ...layoutsRef.current,
        [breakpoint]: newLayout
      };
      setLayout(newLayout);
      setLayouts(newLayouts);
      layoutsRef.current = newLayouts;
      onLayoutChange(newLayout, newLayouts);
      prevCompactTypeRef.current = compactType;
    }
  }, [
    compactType,
    compactor,
    effectiveLayout,
    cols,
    allowOverlap,
    breakpoint,
    onLayoutChange
  ]);
  reactExports.useEffect(() => {
    const widthChanged = width !== prevWidthRef.current;
    const breakpointPropChanged = propBreakpoint !== prevBreakpointRef.current;
    const breakpointsChanged = !deepEqual(
      breakpoints,
      prevBreakpointsRef.current
    );
    const colsChanged = !deepEqual(colsConfig, prevColsRef.current);
    if (widthChanged || breakpointPropChanged || breakpointsChanged || colsChanged) {
      const newBreakpoint = propBreakpoint ?? getBreakpointFromWidth(breakpoints, width);
      const newCols = getColsFromBreakpoint(newBreakpoint, colsConfig);
      const lastBreakpoint = breakpoint;
      if (lastBreakpoint !== newBreakpoint || breakpointsChanged || colsChanged) {
        const newLayouts = { ...layoutsRef.current };
        if (!newLayouts[lastBreakpoint]) {
          newLayouts[lastBreakpoint] = cloneLayout(layout);
        }
        let newLayout = findOrGenerateResponsiveLayout(
          newLayouts,
          breakpoints,
          newBreakpoint,
          lastBreakpoint,
          newCols,
          compactor
        );
        const layoutWasGenerated = !newLayouts[newBreakpoint];
        newLayout = synchronizeLayoutWithChildren2(
          newLayout,
          children,
          newCols,
          compactor,
          layoutWasGenerated
        );
        newLayouts[newBreakpoint] = newLayout;
        setBreakpoint(newBreakpoint);
        setCols(newCols);
        setLayout(newLayout);
        setLayouts(newLayouts);
        layoutsRef.current = newLayouts;
        onBreakpointChange(newBreakpoint, newCols);
        onLayoutChange(newLayout, newLayouts);
      }
      const currentMargin2 = getIndentationValue(
        propMargin,
        newBreakpoint
      );
      const currentPadding = propContainerPadding ? getIndentationValue(
        propContainerPadding,
        newBreakpoint
      ) : null;
      onWidthChange(width, currentMargin2, newCols, currentPadding);
      prevWidthRef.current = width;
      prevBreakpointRef.current = propBreakpoint;
      prevBreakpointsRef.current = breakpoints;
      prevColsRef.current = colsConfig;
    }
  }, [
    width,
    propBreakpoint,
    breakpoints,
    colsConfig,
    breakpoint,
    cols,
    layout,
    children,
    compactor,
    compactType,
    allowOverlap,
    propMargin,
    propContainerPadding,
    onBreakpointChange,
    onLayoutChange,
    onWidthChange
  ]);
  const handleLayoutChange = reactExports.useCallback(
    (newLayout) => {
      const currentLayouts = layoutsRef.current;
      const newLayouts = {
        ...currentLayouts,
        [breakpoint]: newLayout
      };
      setLayout(newLayout);
      setLayouts(newLayouts);
      layoutsRef.current = newLayouts;
      onLayoutChange(newLayout, newLayouts);
    },
    [breakpoint, onLayoutChange]
  );
  const currentMargin = reactExports.useMemo(() => {
    return getIndentationValue(
      propMargin,
      breakpoint
    );
  }, [propMargin, breakpoint]);
  const currentContainerPadding = reactExports.useMemo(() => {
    if (propContainerPadding === null) return null;
    return getIndentationValue(
      propContainerPadding,
      breakpoint
    );
  }, [propContainerPadding, breakpoint]);
  const gridConfig = reactExports.useMemo(
    () => ({
      cols,
      rowHeight,
      maxRows,
      margin: currentMargin,
      containerPadding: currentContainerPadding
    }),
    [cols, rowHeight, maxRows, currentMargin, currentContainerPadding]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    GridLayout,
    {
      ...restProps,
      width,
      gridConfig,
      compactor,
      onLayoutChange: handleLayoutChange,
      layout: effectiveLayout,
      children
    }
  );
}
var ResponsiveGridLayoutWithRef = React.forwardRef(function ResponsiveGridLayoutForwardRef(props, ref) {
  const { innerRef, ...rest } = props;
  const effectiveInnerRef = innerRef ?? ref;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveGridLayoutInner, { ...rest, innerRef: effectiveInnerRef });
});
ResponsiveGridLayoutWithRef.displayName = "ResponsiveGridLayout";
const TILE_MIN_SIZE = { minW: 6, minH: 6 };
const RESIZE_HANDLES = [
  "n",
  "e",
  "s",
  "w",
  "ne",
  "nw",
  "se",
  "sw"
];
const DRAG_HANDLE = ".tile-header";
const DRAG_CANCEL = 'button, a, input, textarea, select, [role="menu"], [role="menuitem"]';
const AUTO_SCROLL_EDGE = 80;
const AUTO_SCROLL_MAX_SPEED = 18;
const TILE_DEFAULT_SIZE = { w: 12, h: 8 };
const SINGLE_COLUMN_MAX_WIDTH = 640;
function toLayout(reports) {
  return reports.map((report, index) => {
    const saved = report.layout;
    if (!saved) {
      return {
        i: report.id,
        x: index % 2 * TILE_DEFAULT_SIZE.w,
        y: Math.floor(index / 2) * TILE_DEFAULT_SIZE.h,
        ...TILE_DEFAULT_SIZE,
        ...TILE_MIN_SIZE
      };
    }
    const scale = GRID_COLUMNS / (saved.gridColumns ?? GRID_COLUMNS);
    return {
      i: report.id,
      x: saved.x * scale,
      y: saved.y * scale,
      w: saved.w * scale,
      h: saved.h * scale,
      ...TILE_MIN_SIZE
    };
  });
}
function toSingleColumn(layout) {
  const ordered = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
  let nextY = 0;
  return ordered.map((item) => {
    const stacked = { ...item, x: 0, y: nextY, w: GRID_COLUMNS };
    nextY += item.h;
    return stacked;
  });
}
function isSameTilePosition(a, b) {
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}
function useDashboardLayout(reports) {
  const savedLayout = reactExports.useMemo(() => toLayout(reports), [reports]);
  const [state, setState] = reactExports.useState({
    seed: savedLayout,
    layout: savedLayout
  });
  if (state.seed !== savedLayout) {
    setState({ seed: savedLayout, layout: savedLayout });
  }
  const setLayout = reactExports.useCallback(
    (layout) => setState((current) => ({ ...current, layout })),
    []
  );
  return [
    state.seed === savedLayout ? state.layout : savedLayout,
    setLayout
  ];
}
function hasScrollingAncestor(element) {
  for (let node = element?.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    const scrolls = overflowY === "auto" || overflowY === "scroll";
    if (scrolls && node.scrollHeight > node.clientHeight) {
      return true;
    }
  }
  return false;
}
function edgeScrollSpeed(pointerY) {
  const fromBottom = window.innerHeight - pointerY;
  if (pointerY < AUTO_SCROLL_EDGE) {
    return -AUTO_SCROLL_MAX_SPEED * (1 - pointerY / AUTO_SCROLL_EDGE);
  }
  if (fromBottom < AUTO_SCROLL_EDGE) {
    return AUTO_SCROLL_MAX_SPEED * (1 - fromBottom / AUTO_SCROLL_EDGE);
  }
  return 0;
}
function startEdgeScroll(container) {
  if (hasScrollingAncestor(container)) {
    return () => void 0;
  }
  let pointer = null;
  let frame = 0;
  const trackPointer = (event) => {
    if (event.isTrusted) {
      pointer = { x: event.clientX, y: event.clientY };
    }
  };
  const tick = () => {
    const speed = pointer ? edgeScrollSpeed(pointer.y) : 0;
    if (pointer && speed !== 0) {
      window.scrollBy(0, speed);
      document.dispatchEvent(
        new MouseEvent("mousemove", {
          bubbles: true,
          clientX: pointer.x,
          clientY: pointer.y
        })
      );
    }
    frame = requestAnimationFrame(tick);
  };
  document.addEventListener("mousemove", trackPointer);
  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    document.removeEventListener("mousemove", trackPointer);
  };
}
function tileOf(element) {
  return element?.closest(".react-grid-item") ?? null;
}
function tileBodyOf(tile) {
  return tile?.querySelector("[data-tile-body]") ?? null;
}
function useGestureEffects(containerRef, {
  onDragStop,
  onResizeStop
}) {
  const stopEdgeScroll = reactExports.useRef(null);
  const begin = reactExports.useCallback(() => {
    stopEdgeScroll.current?.();
    stopEdgeScroll.current = startEdgeScroll(containerRef.current);
    containerRef.current?.setAttribute("data-gesture", "");
  }, [containerRef]);
  const end = reactExports.useCallback(() => {
    stopEdgeScroll.current?.();
    stopEdgeScroll.current = null;
    containerRef.current?.removeAttribute("data-gesture");
  }, [containerRef]);
  reactExports.useEffect(() => end, [end]);
  const handleDragStart = reactExports.useCallback(() => begin(), [begin]);
  const handleDragStop = reactExports.useCallback(
    (...args) => {
      end();
      onDragStop?.(...args);
    },
    [end, onDragStop]
  );
  const handleResizeStart = reactExports.useCallback(
    (_layout, _oldItem, _newItem, _placeholder, _event, element) => {
      begin();
      const body = tileBodyOf(tileOf(element));
      if (body) {
        const { width, height } = body.getBoundingClientRect();
        body.style.flex = "none";
        body.style.width = `${width}px`;
        body.style.height = `${height}px`;
      }
    },
    [begin]
  );
  const handleResize = reactExports.useCallback(
    (_layout, _oldItem, newItem, _placeholder, _event, element) => {
      const tile = tileOf(element);
      if (tile && newItem) {
        tile.dataset.tileSize = `${newItem.w} × ${newItem.h}`;
      }
    },
    []
  );
  const handleResizeStop = reactExports.useCallback(
    (...args) => {
      end();
      const tile = tileOf(args[5]);
      const body = tileBodyOf(tile);
      if (body) {
        body.style.flex = "";
        body.style.width = "";
        body.style.height = "";
      }
      if (tile) {
        delete tile.dataset.tileSize;
      }
      onResizeStop?.(...args);
    },
    [end, onResizeStop]
  );
  return {
    onDragStart: handleDragStart,
    onDragStop: handleDragStop,
    onResizeStart: handleResizeStart,
    onResize: handleResize,
    onResizeStop: handleResizeStop
  };
}
function DashboardGrid({
  layout,
  isEditable = false,
  onLayoutChange,
  onDragStop,
  onResizeStop,
  children
}) {
  const { width, containerRef, mounted } = useContainerWidth();
  const isSingleColumn = width < SINGLE_COLUMN_MAX_WIDTH;
  const canEdit = isEditable && !isSingleColumn;
  const gridLayout = reactExports.useMemo(
    () => isSingleColumn ? toSingleColumn(layout) : layout,
    [isSingleColumn, layout]
  );
  const gesture = useGestureEffects(containerRef, {
    onDragStop,
    onResizeStop
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-m-4", ref: containerRef, children: mounted && /* @__PURE__ */ jsxRuntimeExports.jsx(
    GridLayout,
    {
      compactor: verticalCompactor,
      dragConfig: {
        enabled: canEdit,
        handle: DRAG_HANDLE,
        cancel: DRAG_CANCEL
      },
      gridConfig: {
        cols: GRID_COLUMNS,
        rowHeight: GRID_ROW_HEIGHT,
        margin: [GRID_GAP, GRID_GAP]
      },
      layout: gridLayout,
      onDragStart: gesture.onDragStart,
      onDragStop: gesture.onDragStop,
      onLayoutChange: canEdit ? onLayoutChange : void 0,
      onResize: gesture.onResize,
      onResizeStart: gesture.onResizeStart,
      onResizeStop: gesture.onResizeStop,
      resizeConfig: { enabled: canEdit, handles: RESIZE_HANDLES },
      width,
      children
    }
  ) });
}
export {
  DashboardGrid as D,
  TILE_MIN_SIZE as T,
  isSameTilePosition as i,
  toLayout as t,
  useDashboardLayout as u
};
//# sourceMappingURL=dashboard-grid-BOxGeuKe.js.map
