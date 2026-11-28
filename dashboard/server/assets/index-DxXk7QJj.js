var dist = {};
var bind = {};
var hasRequiredBind;
function requireBind() {
  if (hasRequiredBind) return bind;
  hasRequiredBind = 1;
  Object.defineProperty(bind, "__esModule", { value: true });
  bind.bind = void 0;
  function bind$1(target, _a) {
    var type = _a.type, listener = _a.listener, options = _a.options;
    target.addEventListener(type, listener, options);
    return function unbind() {
      target.removeEventListener(type, listener, options);
    };
  }
  bind.bind = bind$1;
  return bind;
}
var bindAll = {};
var hasRequiredBindAll;
function requireBindAll() {
  if (hasRequiredBindAll) return bindAll;
  hasRequiredBindAll = 1;
  var __assign = bindAll && bindAll.__assign || function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  Object.defineProperty(bindAll, "__esModule", { value: true });
  bindAll.bindAll = void 0;
  var bind_1 = /* @__PURE__ */ requireBind();
  function toOptions(value) {
    if (typeof value === "undefined") {
      return void 0;
    }
    if (typeof value === "boolean") {
      return {
        capture: value
      };
    }
    return value;
  }
  function getBinding(original, sharedOptions) {
    if (sharedOptions == null) {
      return original;
    }
    var binding = __assign(__assign({}, original), { options: __assign(__assign({}, toOptions(sharedOptions)), toOptions(original.options)) });
    return binding;
  }
  function bindAll$1(target, bindings, sharedOptions) {
    var unbinds = bindings.map(function(original) {
      var binding = getBinding(original, sharedOptions);
      return (0, bind_1.bind)(target, binding);
    });
    return function unbindAll() {
      unbinds.forEach(function(unbind) {
        return unbind();
      });
    };
  }
  bindAll.bindAll = bindAll$1;
  return bindAll;
}
var hasRequiredDist;
function requireDist() {
  if (hasRequiredDist) return dist;
  hasRequiredDist = 1;
  (function(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.bindAll = exports.bind = void 0;
    var bind_1 = /* @__PURE__ */ requireBind();
    Object.defineProperty(exports, "bind", { enumerable: true, get: function() {
      return bind_1.bind;
    } });
    var bind_all_1 = /* @__PURE__ */ requireBindAll();
    Object.defineProperty(exports, "bindAll", { enumerable: true, get: function() {
      return bind_all_1.bindAll;
    } });
  })(dist);
  return dist;
}
var distExports = /* @__PURE__ */ requireDist();
export {
  distExports as d
};
//# sourceMappingURL=index-DxXk7QJj.js.map
