(function() {
  "use strict";
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var worker = {};
  var isObservable = (value) => {
    if (!value) {
      return false;
    }
    if (typeof Symbol.observable === "symbol" && typeof value[Symbol.observable] === "function") {
      return value === value[Symbol.observable]();
    }
    if (typeof value["@@observable"] === "function") {
      return value === value["@@observable"]();
    }
    return false;
  };
  var common$1 = {};
  var serializers = {};
  Object.defineProperty(serializers, "__esModule", { value: true });
  serializers.DefaultSerializer = serializers.extendSerializer = void 0;
  function extendSerializer(extend2, implementation) {
    const fallbackDeserializer = extend2.deserialize.bind(extend2);
    const fallbackSerializer = extend2.serialize.bind(extend2);
    return {
      deserialize(message) {
        return implementation.deserialize(message, fallbackDeserializer);
      },
      serialize(input) {
        return implementation.serialize(input, fallbackSerializer);
      }
    };
  }
  serializers.extendSerializer = extendSerializer;
  const DefaultErrorSerializer = {
    deserialize(message) {
      return Object.assign(Error(message.message), {
        name: message.name,
        stack: message.stack
      });
    },
    serialize(error) {
      return {
        __error_marker: "$$error",
        message: error.message,
        name: error.name,
        stack: error.stack
      };
    }
  };
  const isSerializedError = (thing) => thing && typeof thing === "object" && "__error_marker" in thing && thing.__error_marker === "$$error";
  serializers.DefaultSerializer = {
    deserialize(message) {
      if (isSerializedError(message)) {
        return DefaultErrorSerializer.deserialize(message);
      } else {
        return message;
      }
    },
    serialize(input) {
      if (input instanceof Error) {
        return DefaultErrorSerializer.serialize(input);
      } else {
        return input;
      }
    }
  };
  Object.defineProperty(common$1, "__esModule", { value: true });
  common$1.serialize = common$1.deserialize = common$1.registerSerializer = void 0;
  const serializers_1 = serializers;
  let registeredSerializer = serializers_1.DefaultSerializer;
  function registerSerializer(serializer) {
    registeredSerializer = serializers_1.extendSerializer(registeredSerializer, serializer);
  }
  common$1.registerSerializer = registerSerializer;
  function deserialize(message) {
    return registeredSerializer.deserialize(message);
  }
  common$1.deserialize = deserialize;
  function serialize(input) {
    return registeredSerializer.serialize(input);
  }
  common$1.serialize = serialize;
  var transferable = {};
  var symbols = {};
  Object.defineProperty(symbols, "__esModule", { value: true });
  symbols.$worker = symbols.$transferable = symbols.$terminate = symbols.$events = symbols.$errors = void 0;
  symbols.$errors = Symbol("thread.errors");
  symbols.$events = Symbol("thread.events");
  symbols.$terminate = Symbol("thread.terminate");
  symbols.$transferable = Symbol("thread.transferable");
  symbols.$worker = Symbol("thread.worker");
  Object.defineProperty(transferable, "__esModule", { value: true });
  transferable.Transfer = transferable.isTransferDescriptor = void 0;
  const symbols_1 = symbols;
  function isTransferable(thing) {
    if (!thing || typeof thing !== "object")
      return false;
    return true;
  }
  function isTransferDescriptor(thing) {
    return thing && typeof thing === "object" && thing[symbols_1.$transferable];
  }
  transferable.isTransferDescriptor = isTransferDescriptor;
  function Transfer(payload, transferables) {
    if (!transferables) {
      if (!isTransferable(payload))
        throw Error();
      transferables = [payload];
    }
    return {
      [symbols_1.$transferable]: true,
      send: payload,
      transferables
    };
  }
  transferable.Transfer = Transfer;
  var messages$1 = {};
  (function(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkerMessageType = exports.MasterMessageType = void 0;
    (function(MasterMessageType) {
      MasterMessageType["cancel"] = "cancel";
      MasterMessageType["run"] = "run";
    })(exports.MasterMessageType || (exports.MasterMessageType = {}));
    (function(WorkerMessageType) {
      WorkerMessageType["error"] = "error";
      WorkerMessageType["init"] = "init";
      WorkerMessageType["result"] = "result";
      WorkerMessageType["running"] = "running";
      WorkerMessageType["uncaughtError"] = "uncaughtError";
    })(exports.WorkerMessageType || (exports.WorkerMessageType = {}));
  })(messages$1);
  var implementation_browser = {};
  Object.defineProperty(implementation_browser, "__esModule", { value: true });
  const isWorkerRuntime = function isWorkerRuntime2() {
    const isWindowContext = typeof self !== "undefined" && typeof Window !== "undefined" && self instanceof Window;
    return typeof self !== "undefined" && self.postMessage && !isWindowContext ? true : false;
  };
  const postMessageToMaster = function postMessageToMaster2(data, transferList) {
    self.postMessage(data, transferList);
  };
  const subscribeToMasterMessages = function subscribeToMasterMessages2(onMessage) {
    const messageHandler = (messageEvent) => {
      onMessage(messageEvent.data);
    };
    const unsubscribe = () => {
      self.removeEventListener("message", messageHandler);
    };
    self.addEventListener("message", messageHandler);
    return unsubscribe;
  };
  implementation_browser.default = {
    isWorkerRuntime,
    postMessageToMaster,
    subscribeToMasterMessages
  };
  (function(exports) {
    var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.expose = exports.isWorkerRuntime = exports.Transfer = exports.registerSerializer = void 0;
    const is_observable_1 = __importDefault2(isObservable);
    const common_1 = common$1;
    const transferable_1 = transferable;
    const messages_1 = messages$1;
    const implementation_1 = __importDefault2(implementation_browser);
    var common_2 = common$1;
    Object.defineProperty(exports, "registerSerializer", { enumerable: true, get: function() {
      return common_2.registerSerializer;
    } });
    var transferable_2 = transferable;
    Object.defineProperty(exports, "Transfer", { enumerable: true, get: function() {
      return transferable_2.Transfer;
    } });
    exports.isWorkerRuntime = implementation_1.default.isWorkerRuntime;
    let exposeCalled = false;
    const activeSubscriptions = /* @__PURE__ */ new Map();
    const isMasterJobCancelMessage = (thing) => thing && thing.type === messages_1.MasterMessageType.cancel;
    const isMasterJobRunMessage = (thing) => thing && thing.type === messages_1.MasterMessageType.run;
    const isObservable$1 = (thing) => is_observable_1.default(thing) || isZenObservable(thing);
    function isZenObservable(thing) {
      return thing && typeof thing === "object" && typeof thing.subscribe === "function";
    }
    function deconstructTransfer(thing) {
      return transferable_1.isTransferDescriptor(thing) ? { payload: thing.send, transferables: thing.transferables } : { payload: thing, transferables: void 0 };
    }
    function postFunctionInitMessage() {
      const initMessage = {
        type: messages_1.WorkerMessageType.init,
        exposed: {
          type: "function"
        }
      };
      implementation_1.default.postMessageToMaster(initMessage);
    }
    function postModuleInitMessage(methodNames) {
      const initMessage = {
        type: messages_1.WorkerMessageType.init,
        exposed: {
          type: "module",
          methods: methodNames
        }
      };
      implementation_1.default.postMessageToMaster(initMessage);
    }
    function postJobErrorMessage(uid, rawError) {
      const { payload: error, transferables } = deconstructTransfer(rawError);
      const errorMessage = {
        type: messages_1.WorkerMessageType.error,
        uid,
        error: common_1.serialize(error)
      };
      implementation_1.default.postMessageToMaster(errorMessage, transferables);
    }
    function postJobResultMessage(uid, completed, resultValue) {
      const { payload, transferables } = deconstructTransfer(resultValue);
      const resultMessage = {
        type: messages_1.WorkerMessageType.result,
        uid,
        complete: completed ? true : void 0,
        payload
      };
      implementation_1.default.postMessageToMaster(resultMessage, transferables);
    }
    function postJobStartMessage(uid, resultType) {
      const startMessage = {
        type: messages_1.WorkerMessageType.running,
        uid,
        resultType
      };
      implementation_1.default.postMessageToMaster(startMessage);
    }
    function postUncaughtErrorMessage(error) {
      try {
        const errorMessage = {
          type: messages_1.WorkerMessageType.uncaughtError,
          error: common_1.serialize(error)
        };
        implementation_1.default.postMessageToMaster(errorMessage);
      } catch (subError) {
        console.error("Not reporting uncaught error back to master thread as it occured while reporting an uncaught error already.\nLatest error:", subError, "\nOriginal error:", error);
      }
    }
    function runFunction(jobUID, fn, args) {
      return __awaiter(this, void 0, void 0, function* () {
        let syncResult;
        try {
          syncResult = fn(...args);
        } catch (error) {
          return postJobErrorMessage(jobUID, error);
        }
        const resultType = isObservable$1(syncResult) ? "observable" : "promise";
        postJobStartMessage(jobUID, resultType);
        if (isObservable$1(syncResult)) {
          const subscription = syncResult.subscribe((value) => postJobResultMessage(jobUID, false, common_1.serialize(value)), (error) => {
            postJobErrorMessage(jobUID, common_1.serialize(error));
            activeSubscriptions.delete(jobUID);
          }, () => {
            postJobResultMessage(jobUID, true);
            activeSubscriptions.delete(jobUID);
          });
          activeSubscriptions.set(jobUID, subscription);
        } else {
          try {
            const result = yield syncResult;
            postJobResultMessage(jobUID, true, common_1.serialize(result));
          } catch (error) {
            postJobErrorMessage(jobUID, common_1.serialize(error));
          }
        }
      });
    }
    function expose2(exposed) {
      if (!implementation_1.default.isWorkerRuntime()) {
        throw Error("expose() called in the master thread.");
      }
      if (exposeCalled) {
        throw Error("expose() called more than once. This is not possible. Pass an object to expose() if you want to expose multiple functions.");
      }
      exposeCalled = true;
      if (typeof exposed === "function") {
        implementation_1.default.subscribeToMasterMessages((messageData) => {
          if (isMasterJobRunMessage(messageData) && !messageData.method) {
            runFunction(messageData.uid, exposed, messageData.args.map(common_1.deserialize));
          }
        });
        postFunctionInitMessage();
      } else if (typeof exposed === "object" && exposed) {
        implementation_1.default.subscribeToMasterMessages((messageData) => {
          if (isMasterJobRunMessage(messageData) && messageData.method) {
            runFunction(messageData.uid, exposed[messageData.method], messageData.args.map(common_1.deserialize));
          }
        });
        const methodNames = Object.keys(exposed).filter((key) => typeof exposed[key] === "function");
        postModuleInitMessage(methodNames);
      } else {
        throw Error(`Invalid argument passed to expose(). Expected a function or an object, got: ${exposed}`);
      }
      implementation_1.default.subscribeToMasterMessages((messageData) => {
        if (isMasterJobCancelMessage(messageData)) {
          const jobUID = messageData.uid;
          const subscription = activeSubscriptions.get(jobUID);
          if (subscription) {
            subscription.unsubscribe();
            activeSubscriptions.delete(jobUID);
          }
        }
      });
    }
    exports.expose = expose2;
    if (typeof self !== "undefined" && typeof self.addEventListener === "function" && implementation_1.default.isWorkerRuntime()) {
      self.addEventListener("error", (event) => {
        setTimeout(() => postUncaughtErrorMessage(event.error || event), 250);
      });
      self.addEventListener("unhandledrejection", (event) => {
        const error = event.reason;
        if (error && typeof error.message === "string") {
          setTimeout(() => postUncaughtErrorMessage(error), 250);
        }
      });
    }
    if (typeof process !== "undefined" && typeof process.on === "function" && implementation_1.default.isWorkerRuntime()) {
      process.on("uncaughtException", (error) => {
        setTimeout(() => postUncaughtErrorMessage(error), 250);
      });
      process.on("unhandledRejection", (error) => {
        if (error && typeof error.message === "string") {
          setTimeout(() => postUncaughtErrorMessage(error), 250);
        }
      });
    }
  })(worker);
  var WorkerContext = /* @__PURE__ */ getDefaultExportFromCjs(worker);
  const expose = WorkerContext.expose;
  WorkerContext.registerSerializer;
  WorkerContext.Transfer;
  function ascending(a, b) {
    return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }
  function descending(a, b) {
    return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  }
  function bisector(f) {
    let compare1, compare2, delta;
    if (f.length !== 2) {
      compare1 = ascending;
      compare2 = (d, x) => ascending(f(d), x);
      delta = (d, x) => f(d) - x;
    } else {
      compare1 = f === ascending || f === descending ? f : zero$3;
      compare2 = f;
      delta = f;
    }
    function left(a, x, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x, x) !== 0)
          return hi;
        do {
          const mid = lo + hi >>> 1;
          if (compare2(a[mid], x) < 0)
            lo = mid + 1;
          else
            hi = mid;
        } while (lo < hi);
      }
      return lo;
    }
    function right(a, x, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x, x) !== 0)
          return hi;
        do {
          const mid = lo + hi >>> 1;
          if (compare2(a[mid], x) <= 0)
            lo = mid + 1;
          else
            hi = mid;
        } while (lo < hi);
      }
      return lo;
    }
    function center(a, x, lo = 0, hi = a.length) {
      const i2 = left(a, x, lo, hi - 1);
      return i2 > lo && delta(a[i2 - 1], x) > -delta(a[i2], x) ? i2 - 1 : i2;
    }
    return { left, center, right };
  }
  function zero$3() {
    return 0;
  }
  function number$1(x) {
    return x === null ? NaN : +x;
  }
  const ascendingBisect = bisector(ascending);
  const bisectRight = ascendingBisect.right;
  bisector(number$1).center;
  var bisect = bisectRight;
  const e10 = Math.sqrt(50), e5 = Math.sqrt(10), e2 = Math.sqrt(2);
  function tickSpec(start, stop, count) {
    const step = (stop - start) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
    let i1, i2, inc;
    if (power < 0) {
      inc = Math.pow(10, -power) / factor;
      i1 = Math.round(start * inc);
      i2 = Math.round(stop * inc);
      if (i1 / inc < start)
        ++i1;
      if (i2 / inc > stop)
        --i2;
      inc = -inc;
    } else {
      inc = Math.pow(10, power) * factor;
      i1 = Math.round(start / inc);
      i2 = Math.round(stop / inc);
      if (i1 * inc < start)
        ++i1;
      if (i2 * inc > stop)
        --i2;
    }
    if (i2 < i1 && 0.5 <= count && count < 2)
      return tickSpec(start, stop, count * 2);
    return [i1, i2, inc];
  }
  function ticks(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    if (!(count > 0))
      return [];
    if (start === stop)
      return [start];
    const reverse = stop < start, [i1, i2, inc] = reverse ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
    if (!(i2 >= i1))
      return [];
    const n = i2 - i1 + 1, ticks2 = new Array(n);
    if (reverse) {
      if (inc < 0)
        for (let i3 = 0; i3 < n; ++i3)
          ticks2[i3] = (i2 - i3) / -inc;
      else
        for (let i3 = 0; i3 < n; ++i3)
          ticks2[i3] = (i2 - i3) * inc;
    } else {
      if (inc < 0)
        for (let i3 = 0; i3 < n; ++i3)
          ticks2[i3] = (i1 + i3) / -inc;
      else
        for (let i3 = 0; i3 < n; ++i3)
          ticks2[i3] = (i1 + i3) * inc;
    }
    return ticks2;
  }
  function tickIncrement(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    return tickSpec(start, stop, count)[2];
  }
  function tickStep(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    const reverse = stop < start, inc = reverse ? tickIncrement(stop, start, count) : tickIncrement(start, stop, count);
    return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
  }
  function max(values, valueof) {
    let max2;
    if (valueof === void 0) {
      for (const value of values) {
        if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
          max2 = value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null && (max2 < value || max2 === void 0 && value >= value)) {
          max2 = value;
        }
      }
    }
    return max2;
  }
  function min(values, valueof) {
    let min2;
    if (valueof === void 0) {
      for (const value of values) {
        if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
          min2 = value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null && (min2 > value || min2 === void 0 && value >= value)) {
          min2 = value;
        }
      }
    }
    return min2;
  }
  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }
  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition)
      prototype[key] = definition[key];
    return prototype;
  }
  function Color() {
  }
  var darker = 0.7;
  var brighter = 1 / darker;
  var reI = "\\s*([+-]?\\d+)\\s*", reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", reHex = /^#([0-9a-f]{3,8})$/, reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`), reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`), reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`), reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`), reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`), reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
  var named = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  };
  define(Color, color, {
    copy(channels) {
      return Object.assign(new this.constructor(), this, channels);
    },
    displayable() {
      return this.rgb().displayable();
    },
    hex: color_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHex8: color_formatHex8,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });
  function color_formatHex() {
    return this.rgb().formatHex();
  }
  function color_formatHex8() {
    return this.rgb().formatHex8();
  }
  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }
  function color_formatRgb() {
    return this.rgb().formatRgb();
  }
  function color(format2) {
    var m, l;
    format2 = (format2 + "").trim().toLowerCase();
    return (m = reHex.exec(format2)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format2)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format2)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format2)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format2)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format2) ? rgbn(named[format2]) : format2 === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
  }
  function rgbn(n) {
    return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
  }
  function rgba(r, g, b, a) {
    if (a <= 0)
      r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }
  function rgbConvert(o) {
    if (!(o instanceof Color))
      o = color(o);
    if (!o)
      return new Rgb();
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }
  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }
  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }
  define(Rgb, rgb, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb() {
      return this;
    },
    clamp() {
      return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
    },
    displayable() {
      return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatHex8: rgb_formatHex8,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));
  function rgb_formatHex() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }
  function rgb_formatHex8() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
  }
  function rgb_formatRgb() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
  }
  function clampa(opacity) {
    return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
  }
  function clampi(value) {
    return Math.max(0, Math.min(255, Math.round(value) || 0));
  }
  function hex(value) {
    value = clampi(value);
    return (value < 16 ? "0" : "") + value.toString(16);
  }
  function hsla(h, s, l, a) {
    if (a <= 0)
      h = s = l = NaN;
    else if (l <= 0 || l >= 1)
      h = s = NaN;
    else if (s <= 0)
      h = NaN;
    return new Hsl(h, s, l, a);
  }
  function hslConvert(o) {
    if (o instanceof Hsl)
      return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color))
      o = color(o);
    if (!o)
      return new Hsl();
    if (o instanceof Hsl)
      return o;
    o = o.rgb();
    var r = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r, g, b), max2 = Math.max(r, g, b), h = NaN, s = max2 - min2, l = (max2 + min2) / 2;
    if (s) {
      if (r === max2)
        h = (g - b) / s + (g < b) * 6;
      else if (g === max2)
        h = (b - r) / s + 2;
      else
        h = (r - g) / s + 4;
      s /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }
  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }
  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }
  define(Hsl, hsl, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb() {
      var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    clamp() {
      return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
    },
    displayable() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl() {
      const a = clampa(this.opacity);
      return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
    }
  }));
  function clamph(value) {
    value = (value || 0) % 360;
    return value < 0 ? value + 360 : value;
  }
  function clampt(value) {
    return Math.max(0, Math.min(1, value || 0));
  }
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
  }
  var constant = (x) => () => x;
  function linear$1(a, d) {
    return function(t) {
      return a + t * d;
    };
  }
  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }
  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
    };
  }
  function nogamma(a, b) {
    var d = b - a;
    return d ? linear$1(a, d) : constant(isNaN(a) ? b : a);
  }
  var interpolateRgb = function rgbGamma(y) {
    var color2 = gamma(y);
    function rgb$1(start, end) {
      var r = color2((start = rgb(start)).r, (end = rgb(end)).r), g = color2(start.g, end.g), b = color2(start.b, end.b), opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }
    rgb$1.gamma = rgbGamma;
    return rgb$1;
  }(1);
  function numberArray(a, b) {
    if (!b)
      b = [];
    var n = a ? Math.min(b.length, a.length) : 0, c = b.slice(), i2;
    return function(t) {
      for (i2 = 0; i2 < n; ++i2)
        c[i2] = a[i2] * (1 - t) + b[i2] * t;
      return c;
    };
  }
  function isNumberArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
  }
  function genericArray(a, b) {
    var nb = b ? b.length : 0, na = a ? Math.min(nb, a.length) : 0, x = new Array(na), c = new Array(nb), i2;
    for (i2 = 0; i2 < na; ++i2)
      x[i2] = interpolate(a[i2], b[i2]);
    for (; i2 < nb; ++i2)
      c[i2] = b[i2];
    return function(t) {
      for (i2 = 0; i2 < na; ++i2)
        c[i2] = x[i2](t);
      return c;
    };
  }
  function date(a, b) {
    var d = /* @__PURE__ */ new Date();
    return a = +a, b = +b, function(t) {
      return d.setTime(a * (1 - t) + b * t), d;
    };
  }
  function interpolateNumber(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }
  function object(a, b) {
    var i2 = {}, c = {}, k;
    if (a === null || typeof a !== "object")
      a = {};
    if (b === null || typeof b !== "object")
      b = {};
    for (k in b) {
      if (k in a) {
        i2[k] = interpolate(a[k], b[k]);
      } else {
        c[k] = b[k];
      }
    }
    return function(t) {
      for (k in i2)
        c[k] = i2[k](t);
      return c;
    };
  }
  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, reB = new RegExp(reA.source, "g");
  function zero$2(b) {
    return function() {
      return b;
    };
  }
  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }
  function interpolateString(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i2 = -1, s = [], q = [];
    a = a + "", b = b + "";
    while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) {
        bs = b.slice(bi, bs);
        if (s[i2])
          s[i2] += bs;
        else
          s[++i2] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        if (s[i2])
          s[i2] += bm;
        else
          s[++i2] = bm;
      } else {
        s[++i2] = null;
        q.push({ i: i2, x: interpolateNumber(am, bm) });
      }
      bi = reB.lastIndex;
    }
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i2])
        s[i2] += bs;
      else
        s[++i2] = bs;
    }
    return s.length < 2 ? q[0] ? one(q[0].x) : zero$2(b) : (b = q.length, function(t) {
      for (var i3 = 0, o; i3 < b; ++i3)
        s[(o = q[i3]).i] = o.x(t);
      return s.join("");
    });
  }
  function interpolate(a, b) {
    var t = typeof b, c;
    return b == null || t === "boolean" ? constant(b) : (t === "number" ? interpolateNumber : t === "string" ? (c = color(b)) ? (b = c, interpolateRgb) : interpolateString : b instanceof color ? interpolateRgb : b instanceof Date ? date : isNumberArray(b) ? numberArray : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object : interpolateNumber)(a, b);
  }
  function interpolateRound(a, b) {
    return a = +a, b = +b, function(t) {
      return Math.round(a * (1 - t) + b * t);
    };
  }
  function formatDecimal(x) {
    return Math.abs(x = Math.round(x)) >= 1e21 ? x.toLocaleString("en").replace(/,/g, "") : x.toString(10);
  }
  function formatDecimalParts(x, p) {
    if ((i2 = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0)
      return null;
    var i2, coefficient = x.slice(0, i2);
    return [
      coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
      +x.slice(i2 + 1)
    ];
  }
  function exponent(x) {
    return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
  }
  function formatGroup(grouping, thousands) {
    return function(value, width) {
      var i2 = value.length, t = [], j = 0, g = grouping[0], length = 0;
      while (i2 > 0 && g > 0) {
        if (length + g + 1 > width)
          g = Math.max(1, width - length);
        t.push(value.substring(i2 -= g, i2 + g));
        if ((length += g + 1) > width)
          break;
        g = grouping[j = (j + 1) % grouping.length];
      }
      return t.reverse().join(thousands);
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
    if (!(match = re.exec(specifier)))
      throw new Error("invalid format: " + specifier);
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
  function formatTrim(s) {
    out:
      for (var n = s.length, i2 = 1, i0 = -1, i1; i2 < n; ++i2) {
        switch (s[i2]) {
          case ".":
            i0 = i1 = i2;
            break;
          case "0":
            if (i0 === 0)
              i0 = i2;
            i1 = i2;
            break;
          default:
            if (!+s[i2])
              break out;
            if (i0 > 0)
              i0 = 0;
            break;
        }
      }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
  }
  var prefixExponent;
  function formatPrefixAuto(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d)
      return x + "";
    var coefficient = d[0], exponent2 = d[1], i2 = exponent2 - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent2 / 3))) * 3) + 1, n = coefficient.length;
    return i2 === n ? coefficient : i2 > n ? coefficient + new Array(i2 - n + 1).join("0") : i2 > 0 ? coefficient.slice(0, i2) + "." + coefficient.slice(i2) : "0." + new Array(1 - i2).join("0") + formatDecimalParts(x, Math.max(0, p + i2 - 1))[0];
  }
  function formatRounded(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d)
      return x + "";
    var coefficient = d[0], exponent2 = d[1];
    return exponent2 < 0 ? "0." + new Array(-exponent2).join("0") + coefficient : coefficient.length > exponent2 + 1 ? coefficient.slice(0, exponent2 + 1) + "." + coefficient.slice(exponent2 + 1) : coefficient + new Array(exponent2 - coefficient.length + 2).join("0");
  }
  var formatTypes = {
    "%": (x, p) => (x * 100).toFixed(p),
    "b": (x) => Math.round(x).toString(2),
    "c": (x) => x + "",
    "d": formatDecimal,
    "e": (x, p) => x.toExponential(p),
    "f": (x, p) => x.toFixed(p),
    "g": (x, p) => x.toPrecision(p),
    "o": (x) => Math.round(x).toString(8),
    "p": (x, p) => formatRounded(x * 100, p),
    "r": formatRounded,
    "s": formatPrefixAuto,
    "X": (x) => Math.round(x).toString(16).toUpperCase(),
    "x": (x) => Math.round(x).toString(16)
  };
  function identity$2(x) {
    return x;
  }
  var map = Array.prototype.map, prefixes = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
  function formatLocale(locale2) {
    var group = locale2.grouping === void 0 || locale2.thousands === void 0 ? identity$2 : formatGroup(map.call(locale2.grouping, Number), locale2.thousands + ""), currencyPrefix = locale2.currency === void 0 ? "" : locale2.currency[0] + "", currencySuffix = locale2.currency === void 0 ? "" : locale2.currency[1] + "", decimal = locale2.decimal === void 0 ? "." : locale2.decimal + "", numerals = locale2.numerals === void 0 ? identity$2 : formatNumerals(map.call(locale2.numerals, String)), percent = locale2.percent === void 0 ? "%" : locale2.percent + "", minus = locale2.minus === void 0 ? "−" : locale2.minus + "", nan = locale2.nan === void 0 ? "NaN" : locale2.nan + "";
    function newFormat(specifier) {
      specifier = formatSpecifier(specifier);
      var fill = specifier.fill, align = specifier.align, sign = specifier.sign, symbol = specifier.symbol, zero2 = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type = specifier.type;
      if (type === "n")
        comma = true, type = "g";
      else if (!formatTypes[type])
        precision === void 0 && (precision = 12), trim = true, type = "g";
      if (zero2 || fill === "0" && align === "=")
        zero2 = true, fill = "0", align = "=";
      var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "", suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";
      var formatType = formatTypes[type], maybeSuffix = /[defgprs%]/.test(type);
      precision = precision === void 0 ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
      function format2(value) {
        var valuePrefix = prefix, valueSuffix = suffix, i2, n, c;
        if (type === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;
          var valueNegative = value < 0 || 1 / value < 0;
          value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
          if (trim)
            value = formatTrim(value);
          if (valueNegative && +value === 0 && sign !== "+")
            valueNegative = false;
          valuePrefix = (valueNegative ? sign === "(" ? sign : minus : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
          valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");
          if (maybeSuffix) {
            i2 = -1, n = value.length;
            while (++i2 < n) {
              if (c = value.charCodeAt(i2), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i2 + 1) : value.slice(i2)) + valueSuffix;
                value = value.slice(0, i2);
                break;
              }
            }
          }
        }
        if (comma && !zero2)
          value = group(value, Infinity);
        var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
        if (comma && zero2)
          value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
        switch (align) {
          case "<":
            value = valuePrefix + value + valueSuffix + padding;
            break;
          case "=":
            value = valuePrefix + padding + value + valueSuffix;
            break;
          case "^":
            value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
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
    function formatPrefix2(specifier, value) {
      var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)), e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3, k = Math.pow(10, -e), prefix = prefixes[8 + e / 3];
      return function(value2) {
        return f(k * value2) + prefix;
      };
    }
    return {
      format: newFormat,
      formatPrefix: formatPrefix2
    };
  }
  var locale;
  var format;
  var formatPrefix;
  defaultLocale({
    thousands: ",",
    grouping: [3],
    currency: ["$", ""]
  });
  function defaultLocale(definition) {
    locale = formatLocale(definition);
    format = locale.format;
    formatPrefix = locale.formatPrefix;
    return locale;
  }
  function precisionFixed(step) {
    return Math.max(0, -exponent(Math.abs(step)));
  }
  function precisionPrefix(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
  }
  function precisionRound(step, max2) {
    step = Math.abs(step), max2 = Math.abs(max2) - step;
    return Math.max(0, exponent(max2) - exponent(step)) + 1;
  }
  function initRange(domain, range) {
    switch (arguments.length) {
      case 0:
        break;
      case 1:
        this.range(domain);
        break;
      default:
        this.range(range).domain(domain);
        break;
    }
    return this;
  }
  function constants$1(x) {
    return function() {
      return x;
    };
  }
  function number(x) {
    return +x;
  }
  var unit = [0, 1];
  function identity$1(x) {
    return x;
  }
  function normalize(a, b) {
    return (b -= a = +a) ? function(x) {
      return (x - a) / b;
    } : constants$1(isNaN(b) ? NaN : 0.5);
  }
  function clamper(a, b) {
    var t;
    if (a > b)
      t = a, a = b, b = t;
    return function(x) {
      return Math.max(a, Math.min(b, x));
    };
  }
  function bimap(domain, range, interpolate2) {
    var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    if (d1 < d0)
      d0 = normalize(d1, d0), r0 = interpolate2(r1, r0);
    else
      d0 = normalize(d0, d1), r0 = interpolate2(r0, r1);
    return function(x) {
      return r0(d0(x));
    };
  }
  function polymap(domain, range, interpolate2) {
    var j = Math.min(domain.length, range.length) - 1, d = new Array(j), r = new Array(j), i2 = -1;
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }
    while (++i2 < j) {
      d[i2] = normalize(domain[i2], domain[i2 + 1]);
      r[i2] = interpolate2(range[i2], range[i2 + 1]);
    }
    return function(x) {
      var i3 = bisect(domain, x, 1, j) - 1;
      return r[i3](d[i3](x));
    };
  }
  function copy(source, target) {
    return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
  }
  function transformer() {
    var domain = unit, range = unit, interpolate$1 = interpolate, transform, untransform, unknown, clamp = identity$1, piecewise, output, input;
    function rescale() {
      var n = Math.min(domain.length, range.length);
      if (clamp !== identity$1)
        clamp = clamper(domain[0], domain[n - 1]);
      piecewise = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }
    function scale(x) {
      return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
    }
    scale.invert = function(y) {
      return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
    };
    scale.domain = function(_) {
      return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
    };
    scale.range = function(_) {
      return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
    };
    scale.rangeRound = function(_) {
      return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
    };
    scale.clamp = function(_) {
      return arguments.length ? (clamp = _ ? true : identity$1, rescale()) : clamp !== identity$1;
    };
    scale.interpolate = function(_) {
      return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    return function(t, u) {
      transform = t, untransform = u;
      return rescale();
    };
  }
  function continuous() {
    return transformer()(identity$1, identity$1);
  }
  function tickFormat(start, stop, count, specifier) {
    var step = tickStep(start, stop, count), precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        var value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value)))
          specifier.precision = precision;
        return formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop)))))
          specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN(precision = precisionFixed(step)))
          specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return format(specifier);
  }
  function linearish(scale) {
    var domain = scale.domain;
    scale.ticks = function(count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };
    scale.tickFormat = function(count, specifier) {
      var d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };
    scale.nice = function(count) {
      if (count == null)
        count = 10;
      var d = domain();
      var i0 = 0;
      var i1 = d.length - 1;
      var start = d[i0];
      var stop = d[i1];
      var prestep;
      var step;
      var maxIter = 10;
      if (stop < start) {
        step = start, start = stop, stop = step;
        step = i0, i0 = i1, i1 = step;
      }
      while (maxIter-- > 0) {
        step = tickIncrement(start, stop, count);
        if (step === prestep) {
          d[i0] = start;
          d[i1] = stop;
          return domain(d);
        } else if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
        } else {
          break;
        }
        prestep = step;
      }
      return scale;
    };
    return scale;
  }
  function linear() {
    var scale = continuous();
    scale.copy = function() {
      return copy(scale, linear());
    };
    initRange.apply(scale, arguments);
    return linearish(scale);
  }
  function quantize() {
    var x0 = 0, x1 = 1, n = 1, domain = [0.5], range = [0, 1], unknown;
    function scale(x) {
      return x != null && x <= x ? range[bisect(domain, x, 0, n)] : unknown;
    }
    function rescale() {
      var i2 = -1;
      domain = new Array(n);
      while (++i2 < n)
        domain[i2] = ((i2 + 1) * x1 - (i2 - n) * x0) / (n + 1);
      return scale;
    }
    scale.domain = function(_) {
      return arguments.length ? ([x0, x1] = _, x0 = +x0, x1 = +x1, rescale()) : [x0, x1];
    };
    scale.range = function(_) {
      return arguments.length ? (n = (range = Array.from(_)).length - 1, rescale()) : range.slice();
    };
    scale.invertExtent = function(y) {
      var i2 = range.indexOf(y);
      return i2 < 0 ? [NaN, NaN] : i2 < 1 ? [x0, domain[0]] : i2 >= n ? [domain[n - 1], x1] : [domain[i2 - 1], domain[i2]];
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : scale;
    };
    scale.thresholds = function() {
      return domain.slice();
    };
    scale.copy = function() {
      return quantize().domain([x0, x1]).range(range).unknown(unknown);
    };
    return initRange.apply(linearish(scale), arguments);
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
  Transform.prototype;
  const BigInt32 = BigInt(32);
  function getBigInt64(dataView, byteOffset, littleEndian) {
    const littleEndianMask = Number(!!littleEndian);
    const bigEndianMask = Number(!littleEndian);
    return BigInt(dataView.getInt32(byteOffset, littleEndian) * bigEndianMask + dataView.getInt32(byteOffset + 4, littleEndian) * littleEndianMask) << BigInt32 | BigInt(dataView.getUint32(byteOffset, littleEndian) * littleEndianMask + dataView.getUint32(byteOffset + 4, littleEndian) * bigEndianMask);
  }
  function getBigUint64(dataView, byteOffset, littleEndian) {
    const a = dataView.getUint32(byteOffset, littleEndian);
    const b = dataView.getUint32(byteOffset + 4, littleEndian);
    const littleEndianMask = Number(!!littleEndian);
    const bigEndianMask = Number(!littleEndian);
    return BigInt(a * bigEndianMask + b * littleEndianMask) << BigInt32 | BigInt(a * littleEndianMask + b * bigEndianMask);
  }
  function setBigInt64(dataView, byteOffset, value, littleEndian) {
    const hi = Number(value >> BigInt32);
    const lo = Number(value & BigInt(4294967295));
    if (littleEndian) {
      dataView.setInt32(byteOffset + 4, hi, littleEndian);
      dataView.setUint32(byteOffset, lo, littleEndian);
    } else {
      dataView.setInt32(byteOffset, hi, littleEndian);
      dataView.setUint32(byteOffset + 4, lo, littleEndian);
    }
  }
  function setBigUint64(dataView, byteOffset, value, littleEndian) {
    const hi = Number(value >> BigInt32);
    const lo = Number(value & BigInt(4294967295));
    if (littleEndian) {
      dataView.setUint32(byteOffset + 4, hi, littleEndian);
      dataView.setUint32(byteOffset, lo, littleEndian);
    } else {
      dataView.setUint32(byteOffset, hi, littleEndian);
      dataView.setUint32(byteOffset + 4, lo, littleEndian);
    }
  }
  if (!("getBigInt64" in DataView)) {
    DataView.prototype.getBigInt64 = function(byteOffset, littleEndian) {
      return getBigInt64(this, byteOffset, littleEndian);
    };
  }
  if (!("getBigUint64" in DataView)) {
    DataView.prototype.getBigUint64 = function(byteOffset, littleEndian) {
      return getBigUint64(this, byteOffset, littleEndian);
    };
  }
  if (!("setBigInt64" in DataView)) {
    DataView.prototype.setBigInt64 = function(byteOffset, value, littleEndian) {
      setBigInt64(this, byteOffset, value, littleEndian);
    };
  }
  if (!("setBigUint64" in DataView)) {
    DataView.prototype.setBigUint64 = function(byteOffset, value, littleEndian) {
      setBigUint64(this, byteOffset, value, littleEndian);
    };
  }
  var buffer = {};
  var base64Js = {};
  base64Js.byteLength = byteLength;
  base64Js.toByteArray = toByteArray;
  base64Js.fromByteArray = fromByteArray;
  var lookup = [];
  var revLookup = [];
  var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
  var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }
  revLookup["-".charCodeAt(0)] = 62;
  revLookup["_".charCodeAt(0)] = 63;
  function getLens(b64) {
    var len2 = b64.length;
    if (len2 % 4 > 0) {
      throw new Error("Invalid string. Length must be a multiple of 4");
    }
    var validLen = b64.indexOf("=");
    if (validLen === -1)
      validLen = len2;
    var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
    return [validLen, placeHoldersLen];
  }
  function byteLength(b64) {
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
  }
  function _byteLength(b64, validLen, placeHoldersLen) {
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
  }
  function toByteArray(b64) {
    var tmp;
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
    var curByte = 0;
    var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
    var i2;
    for (i2 = 0; i2 < len2; i2 += 4) {
      tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
      arr[curByte++] = tmp >> 16 & 255;
      arr[curByte++] = tmp >> 8 & 255;
      arr[curByte++] = tmp & 255;
    }
    if (placeHoldersLen === 2) {
      tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
      arr[curByte++] = tmp & 255;
    }
    if (placeHoldersLen === 1) {
      tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
      arr[curByte++] = tmp >> 8 & 255;
      arr[curByte++] = tmp & 255;
    }
    return arr;
  }
  function tripletToBase64(num) {
    return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
  }
  function encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];
    for (var i2 = start; i2 < end; i2 += 3) {
      tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
      output.push(tripletToBase64(tmp));
    }
    return output.join("");
  }
  function fromByteArray(uint8) {
    var tmp;
    var len2 = uint8.length;
    var extraBytes = len2 % 3;
    var parts = [];
    var maxChunkLength = 16383;
    for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
      parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
    }
    if (extraBytes === 1) {
      tmp = uint8[len2 - 1];
      parts.push(
        lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
      );
    } else if (extraBytes === 2) {
      tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
      parts.push(
        lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
      );
    }
    return parts.join("");
  }
  var ieee754 = {};
  /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
  ieee754.read = function(buffer2, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i2 = isLE ? nBytes - 1 : 0;
    var d = isLE ? -1 : 1;
    var s = buffer2[offset + i2];
    i2 += d;
    e = s & (1 << -nBits) - 1;
    s >>= -nBits;
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer2[offset + i2], i2 += d, nBits -= 8) {
    }
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer2[offset + i2], i2 += d, nBits -= 8) {
    }
    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : (s ? -1 : 1) * Infinity;
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
  };
  ieee754.write = function(buffer2, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i2 = isLE ? 0 : nBytes - 1;
    var d = isLE ? 1 : -1;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }
      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }
    for (; mLen >= 8; buffer2[offset + i2] = m & 255, i2 += d, m /= 256, mLen -= 8) {
    }
    e = e << mLen | m;
    eLen += mLen;
    for (; eLen > 0; buffer2[offset + i2] = e & 255, i2 += d, e /= 256, eLen -= 8) {
    }
    buffer2[offset + i2 - d] |= s * 128;
  };
  /*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */
  (function(exports) {
    const base64 = base64Js;
    const ieee754$1 = ieee754;
    const customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
    exports.Buffer = Buffer;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    const K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
    if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
      console.error(
        "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
      );
    }
    function typedArraySupport() {
      try {
        const arr = new Uint8Array(1);
        const proto = { foo: function() {
          return 42;
        } };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
      } catch (e) {
        return false;
      }
    }
    Object.defineProperty(Buffer.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer.isBuffer(this))
          return void 0;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer.isBuffer(this))
          return void 0;
        return this.byteOffset;
      }
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
      }
      const buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer.prototype);
      return buf;
    }
    function Buffer(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          );
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    Buffer.poolSize = 8192;
    function from(value, encodingOrOffset, length) {
      if (typeof value === "string") {
        return fromString(value, encodingOrOffset);
      }
      if (ArrayBuffer.isView(value)) {
        return fromArrayView(value);
      }
      if (value == null) {
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof value === "number") {
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        );
      }
      const valueOf = value.valueOf && value.valueOf();
      if (valueOf != null && valueOf !== value) {
        return Buffer.from(valueOf, encodingOrOffset, length);
      }
      const b = fromObject(value);
      if (b)
        return b;
      if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
        return Buffer.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
      }
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
      );
    }
    Buffer.from = function(value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer, Uint8Array);
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
      }
    }
    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size);
      }
      if (fill !== void 0) {
        return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
      }
      return createBuffer(size);
    }
    Buffer.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }
    Buffer.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      const length = byteLength2(string, encoding) | 0;
      let buf = createBuffer(length);
      const actual = buf.write(string, encoding);
      if (actual !== length) {
        buf = buf.slice(0, actual);
      }
      return buf;
    }
    function fromArrayLike(array) {
      const length = array.length < 0 ? 0 : checked(array.length) | 0;
      const buf = createBuffer(length);
      for (let i2 = 0; i2 < length; i2 += 1) {
        buf[i2] = array[i2] & 255;
      }
      return buf;
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        const copy2 = new Uint8Array(arrayView);
        return fromArrayBuffer(copy2.buffer, copy2.byteOffset, copy2.byteLength);
      }
      return fromArrayLike(arrayView);
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
      }
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
      }
      let buf;
      if (byteOffset === void 0 && length === void 0) {
        buf = new Uint8Array(array);
      } else if (length === void 0) {
        buf = new Uint8Array(array, byteOffset);
      } else {
        buf = new Uint8Array(array, byteOffset, length);
      }
      Object.setPrototypeOf(buf, Buffer.prototype);
      return buf;
    }
    function fromObject(obj) {
      if (Buffer.isBuffer(obj)) {
        const len2 = checked(obj.length) | 0;
        const buf = createBuffer(len2);
        if (buf.length === 0) {
          return buf;
        }
        obj.copy(buf, 0, 0, len2);
        return buf;
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      }
      return length | 0;
    }
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0;
      }
      return Buffer.alloc(+length);
    }
    Buffer.isBuffer = function isBuffer(b) {
      return b != null && b._isBuffer === true && b !== Buffer.prototype;
    };
    Buffer.compare = function compare(a, b) {
      if (isInstance(a, Uint8Array))
        a = Buffer.from(a, a.offset, a.byteLength);
      if (isInstance(b, Uint8Array))
        b = Buffer.from(b, b.offset, b.byteLength);
      if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        );
      }
      if (a === b)
        return 0;
      let x = a.length;
      let y = b.length;
      for (let i2 = 0, len2 = Math.min(x, y); i2 < len2; ++i2) {
        if (a[i2] !== b[i2]) {
          x = a[i2];
          y = b[i2];
          break;
        }
      }
      if (x < y)
        return -1;
      if (y < x)
        return 1;
      return 0;
    };
    Buffer.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    Buffer.concat = function concat(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer.alloc(0);
      }
      let i2;
      if (length === void 0) {
        length = 0;
        for (i2 = 0; i2 < list.length; ++i2) {
          length += list[i2].length;
        }
      }
      const buffer2 = Buffer.allocUnsafe(length);
      let pos = 0;
      for (i2 = 0; i2 < list.length; ++i2) {
        let buf = list[i2];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer2.length) {
            if (!Buffer.isBuffer(buf))
              buf = Buffer.from(buf);
            buf.copy(buffer2, pos);
          } else {
            Uint8Array.prototype.set.call(
              buffer2,
              buf,
              pos
            );
          }
        } else if (!Buffer.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        } else {
          buf.copy(buffer2, pos);
        }
        pos += buf.length;
      }
      return buffer2;
    };
    function byteLength2(string, encoding) {
      if (Buffer.isBuffer(string)) {
        return string.length;
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength;
      }
      if (typeof string !== "string") {
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
        );
      }
      const len2 = string.length;
      const mustMatch = arguments.length > 2 && arguments[2] === true;
      if (!mustMatch && len2 === 0)
        return 0;
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "ascii":
          case "latin1":
          case "binary":
            return len2;
          case "utf8":
          case "utf-8":
            return utf8ToBytes(string).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return len2 * 2;
          case "hex":
            return len2 >>> 1;
          case "base64":
            return base64ToBytes(string).length;
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes(string).length;
            }
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer.byteLength = byteLength2;
    function slowToString(encoding, start, end) {
      let loweredCase = false;
      if (start === void 0 || start < 0) {
        start = 0;
      }
      if (start > this.length) {
        return "";
      }
      if (end === void 0 || end > this.length) {
        end = this.length;
      }
      if (end <= 0) {
        return "";
      }
      end >>>= 0;
      start >>>= 0;
      if (end <= start) {
        return "";
      }
      if (!encoding)
        encoding = "utf8";
      while (true) {
        switch (encoding) {
          case "hex":
            return hexSlice(this, start, end);
          case "utf8":
          case "utf-8":
            return utf8Slice(this, start, end);
          case "ascii":
            return asciiSlice(this, start, end);
          case "latin1":
          case "binary":
            return latin1Slice(this, start, end);
          case "base64":
            return base64Slice(this, start, end);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return utf16leSlice(this, start, end);
          default:
            if (loweredCase)
              throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer.prototype._isBuffer = true;
    function swap(b, n, m) {
      const i2 = b[n];
      b[n] = b[m];
      b[m] = i2;
    }
    Buffer.prototype.swap16 = function swap16() {
      const len2 = this.length;
      if (len2 % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (let i2 = 0; i2 < len2; i2 += 2) {
        swap(this, i2, i2 + 1);
      }
      return this;
    };
    Buffer.prototype.swap32 = function swap32() {
      const len2 = this.length;
      if (len2 % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (let i2 = 0; i2 < len2; i2 += 4) {
        swap(this, i2, i2 + 3);
        swap(this, i2 + 1, i2 + 2);
      }
      return this;
    };
    Buffer.prototype.swap64 = function swap64() {
      const len2 = this.length;
      if (len2 % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (let i2 = 0; i2 < len2; i2 += 8) {
        swap(this, i2, i2 + 7);
        swap(this, i2 + 1, i2 + 6);
        swap(this, i2 + 2, i2 + 5);
        swap(this, i2 + 3, i2 + 4);
      }
      return this;
    };
    Buffer.prototype.toString = function toString2() {
      const length = this.length;
      if (length === 0)
        return "";
      if (arguments.length === 0)
        return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer.prototype.toLocaleString = Buffer.prototype.toString;
    Buffer.prototype.equals = function equals(b) {
      if (!Buffer.isBuffer(b))
        throw new TypeError("Argument must be a Buffer");
      if (this === b)
        return true;
      return Buffer.compare(this, b) === 0;
    };
    Buffer.prototype.inspect = function inspect() {
      let str = "";
      const max2 = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max2).replace(/(.{2})/g, "$1 ").trim();
      if (this.length > max2)
        str += " ... ";
      return "<Buffer " + str + ">";
    };
    if (customInspectSymbol) {
      Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
    }
    Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer.from(target, target.offset, target.byteLength);
      }
      if (!Buffer.isBuffer(target)) {
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
        );
      }
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = target ? target.length : 0;
      }
      if (thisStart === void 0) {
        thisStart = 0;
      }
      if (thisEnd === void 0) {
        thisEnd = this.length;
      }
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target)
        return 0;
      let x = thisEnd - thisStart;
      let y = end - start;
      const len2 = Math.min(x, y);
      const thisCopy = this.slice(thisStart, thisEnd);
      const targetCopy = target.slice(start, end);
      for (let i2 = 0; i2 < len2; ++i2) {
        if (thisCopy[i2] !== targetCopy[i2]) {
          x = thisCopy[i2];
          y = targetCopy[i2];
          break;
        }
      }
      if (x < y)
        return -1;
      if (y < x)
        return 1;
      return 0;
    };
    function bidirectionalIndexOf(buffer2, val, byteOffset, encoding, dir) {
      if (buffer2.length === 0)
        return -1;
      if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
      }
      byteOffset = +byteOffset;
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer2.length - 1;
      }
      if (byteOffset < 0)
        byteOffset = buffer2.length + byteOffset;
      if (byteOffset >= buffer2.length) {
        if (dir)
          return -1;
        else
          byteOffset = buffer2.length - 1;
      } else if (byteOffset < 0) {
        if (dir)
          byteOffset = 0;
        else
          return -1;
      }
      if (typeof val === "string") {
        val = Buffer.from(val, encoding);
      }
      if (Buffer.isBuffer(val)) {
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer2, val, byteOffset, encoding, dir);
      } else if (typeof val === "number") {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer2, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer2, val, byteOffset);
          }
        }
        return arrayIndexOf(buffer2, [val], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      let indexSize = 1;
      let arrLength = arr.length;
      let valLength = val.length;
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
          if (arr.length < 2 || val.length < 2) {
            return -1;
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }
      function read(buf, i3) {
        if (indexSize === 1) {
          return buf[i3];
        } else {
          return buf.readUInt16BE(i3 * indexSize);
        }
      }
      let i2;
      if (dir) {
        let foundIndex = -1;
        for (i2 = byteOffset; i2 < arrLength; i2++) {
          if (read(arr, i2) === read(val, foundIndex === -1 ? 0 : i2 - foundIndex)) {
            if (foundIndex === -1)
              foundIndex = i2;
            if (i2 - foundIndex + 1 === valLength)
              return foundIndex * indexSize;
          } else {
            if (foundIndex !== -1)
              i2 -= i2 - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength)
          byteOffset = arrLength - valLength;
        for (i2 = byteOffset; i2 >= 0; i2--) {
          let found = true;
          for (let j = 0; j < valLength; j++) {
            if (read(arr, i2 + j) !== read(val, j)) {
              found = false;
              break;
            }
          }
          if (found)
            return i2;
        }
      }
      return -1;
    }
    Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0;
      const remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }
      const strLen = string.length;
      if (length > strLen / 2) {
        length = strLen / 2;
      }
      let i2;
      for (i2 = 0; i2 < length; ++i2) {
        const parsed = parseInt(string.substr(i2 * 2, 2), 16);
        if (numberIsNaN(parsed))
          return i2;
        buf[offset + i2] = parsed;
      }
      return i2;
    }
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
    }
    Buffer.prototype.write = function write(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
      } else if (length === void 0 && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
          length = length >>> 0;
          if (encoding === void 0)
            encoding = "utf8";
        } else {
          encoding = length;
          length = void 0;
        }
      } else {
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        );
      }
      const remaining = this.length - offset;
      if (length === void 0 || length > remaining)
        length = remaining;
      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
      }
      if (!encoding)
        encoding = "utf8";
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length);
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string, offset, length);
          case "base64":
            return base64Write(this, string, offset, length);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length);
          default:
            if (loweredCase)
              throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };
    Buffer.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      const res = [];
      let i2 = start;
      while (i2 < end) {
        const firstByte = buf[i2];
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i2 + bytesPerSequence <= end) {
          let secondByte, thirdByte, fourthByte, tempCodePoint;
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte;
              }
              break;
            case 2:
              secondByte = buf[i2 + 1];
              if ((secondByte & 192) === 128) {
                tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 3:
              secondByte = buf[i2 + 1];
              thirdByte = buf[i2 + 2];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 4:
              secondByte = buf[i2 + 1];
              thirdByte = buf[i2 + 2];
              fourthByte = buf[i2 + 3];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          res.push(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i2 += bytesPerSequence;
      }
      return decodeCodePointsArray(res);
    }
    const MAX_ARGUMENTS_LENGTH = 4096;
    function decodeCodePointsArray(codePoints) {
      const len2 = codePoints.length;
      if (len2 <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
      }
      let res = "";
      let i2 = 0;
      while (i2 < len2) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i2, i2 += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res;
    }
    function asciiSlice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i2 = start; i2 < end; ++i2) {
        ret += String.fromCharCode(buf[i2] & 127);
      }
      return ret;
    }
    function latin1Slice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i2 = start; i2 < end; ++i2) {
        ret += String.fromCharCode(buf[i2]);
      }
      return ret;
    }
    function hexSlice(buf, start, end) {
      const len2 = buf.length;
      if (!start || start < 0)
        start = 0;
      if (!end || end < 0 || end > len2)
        end = len2;
      let out = "";
      for (let i2 = start; i2 < end; ++i2) {
        out += hexSliceLookupTable[buf[i2]];
      }
      return out;
    }
    function utf16leSlice(buf, start, end) {
      const bytes = buf.slice(start, end);
      let res = "";
      for (let i2 = 0; i2 < bytes.length - 1; i2 += 2) {
        res += String.fromCharCode(bytes[i2] + bytes[i2 + 1] * 256);
      }
      return res;
    }
    Buffer.prototype.slice = function slice(start, end) {
      const len2 = this.length;
      start = ~~start;
      end = end === void 0 ? len2 : ~~end;
      if (start < 0) {
        start += len2;
        if (start < 0)
          start = 0;
      } else if (start > len2) {
        start = len2;
      }
      if (end < 0) {
        end += len2;
        if (end < 0)
          end = 0;
      } else if (end > len2) {
        end = len2;
      }
      if (end < start)
        end = start;
      const newBuf = this.subarray(start, end);
      Object.setPrototypeOf(newBuf, Buffer.prototype);
      return newBuf;
    };
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0)
        throw new RangeError("offset is not uint");
      if (offset + ext > length)
        throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer.prototype.readUintLE = Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength3, noAssert) {
      offset = offset >>> 0;
      byteLength3 = byteLength3 >>> 0;
      if (!noAssert)
        checkOffset(offset, byteLength3, this.length);
      let val = this[offset];
      let mul = 1;
      let i2 = 0;
      while (++i2 < byteLength3 && (mul *= 256)) {
        val += this[offset + i2] * mul;
      }
      return val;
    };
    Buffer.prototype.readUintBE = Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength3, noAssert) {
      offset = offset >>> 0;
      byteLength3 = byteLength3 >>> 0;
      if (!noAssert) {
        checkOffset(offset, byteLength3, this.length);
      }
      let val = this[offset + --byteLength3];
      let mul = 1;
      while (byteLength3 > 0 && (mul *= 256)) {
        val += this[offset + --byteLength3] * mul;
      }
      return val;
    };
    Buffer.prototype.readUint8 = Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer.prototype.readUint16LE = Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer.prototype.readUint16BE = Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer.prototype.readUint32LE = Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    };
    Buffer.prototype.readUint32BE = Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
      const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
      return BigInt(lo) + (BigInt(hi) << BigInt(32));
    });
    Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
      return (BigInt(hi) << BigInt(32)) + BigInt(lo);
    });
    Buffer.prototype.readIntLE = function readIntLE(offset, byteLength3, noAssert) {
      offset = offset >>> 0;
      byteLength3 = byteLength3 >>> 0;
      if (!noAssert)
        checkOffset(offset, byteLength3, this.length);
      let val = this[offset];
      let mul = 1;
      let i2 = 0;
      while (++i2 < byteLength3 && (mul *= 256)) {
        val += this[offset + i2] * mul;
      }
      mul *= 128;
      if (val >= mul)
        val -= Math.pow(2, 8 * byteLength3);
      return val;
    };
    Buffer.prototype.readIntBE = function readIntBE(offset, byteLength3, noAssert) {
      offset = offset >>> 0;
      byteLength3 = byteLength3 >>> 0;
      if (!noAssert)
        checkOffset(offset, byteLength3, this.length);
      let i2 = byteLength3;
      let mul = 1;
      let val = this[offset + --i2];
      while (i2 > 0 && (mul *= 256)) {
        val += this[offset + --i2] * mul;
      }
      mul *= 128;
      if (val >= mul)
        val -= Math.pow(2, 8 * byteLength3);
      return val;
    };
    Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128))
        return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      const val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      const val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
      return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
    });
    Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = (first << 24) + // Overflow
      this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
    });
    Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return ieee754$1.read(this, offset, true, 23, 4);
    };
    Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return ieee754$1.read(this, offset, false, 23, 4);
    };
    Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 8, this.length);
      return ieee754$1.read(this, offset, true, 52, 8);
    };
    Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 8, this.length);
      return ieee754$1.read(this, offset, false, 52, 8);
    };
    function checkInt(buf, value, offset, ext, max2, min2) {
      if (!Buffer.isBuffer(buf))
        throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value > max2 || value < min2)
        throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length)
        throw new RangeError("Index out of range");
    }
    Buffer.prototype.writeUintLE = Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength3, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength3 = byteLength3 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength3) - 1;
        checkInt(this, value, offset, byteLength3, maxBytes, 0);
      }
      let mul = 1;
      let i2 = 0;
      this[offset] = value & 255;
      while (++i2 < byteLength3 && (mul *= 256)) {
        this[offset + i2] = value / mul & 255;
      }
      return offset + byteLength3;
    };
    Buffer.prototype.writeUintBE = Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength3, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength3 = byteLength3 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength3) - 1;
        checkInt(this, value, offset, byteLength3, maxBytes, 0);
      }
      let i2 = byteLength3 - 1;
      let mul = 1;
      this[offset + i2] = value & 255;
      while (--i2 >= 0 && (mul *= 256)) {
        this[offset + i2] = value / mul & 255;
      }
      return offset + byteLength3;
    };
    Buffer.prototype.writeUint8 = Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 1, 255, 0);
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer.prototype.writeUint16LE = Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer.prototype.writeUint16BE = Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer.prototype.writeUint32LE = Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset + 3] = value >>> 24;
      this[offset + 2] = value >>> 16;
      this[offset + 1] = value >>> 8;
      this[offset] = value & 255;
      return offset + 4;
    };
    Buffer.prototype.writeUint32BE = Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    function wrtBigUInt64LE(buf, value, offset, min2, max2) {
      checkIntBI(value, min2, max2, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      return offset;
    }
    function wrtBigUInt64BE(buf, value, offset, min2, max2) {
      checkIntBI(value, min2, max2, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset + 7] = lo;
      lo = lo >> 8;
      buf[offset + 6] = lo;
      lo = lo >> 8;
      buf[offset + 5] = lo;
      lo = lo >> 8;
      buf[offset + 4] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset + 3] = hi;
      hi = hi >> 8;
      buf[offset + 2] = hi;
      hi = hi >> 8;
      buf[offset + 1] = hi;
      hi = hi >> 8;
      buf[offset] = hi;
      return offset + 8;
    }
    Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength3, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength3 - 1);
        checkInt(this, value, offset, byteLength3, limit - 1, -limit);
      }
      let i2 = 0;
      let mul = 1;
      let sub = 0;
      this[offset] = value & 255;
      while (++i2 < byteLength3 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i2 - 1] !== 0) {
          sub = 1;
        }
        this[offset + i2] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength3;
    };
    Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength3, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength3 - 1);
        checkInt(this, value, offset, byteLength3, limit - 1, -limit);
      }
      let i2 = byteLength3 - 1;
      let mul = 1;
      let sub = 0;
      this[offset + i2] = value & 255;
      while (--i2 >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i2 + 1] !== 0) {
          sub = 1;
        }
        this[offset + i2] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength3;
    };
    Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 1, 127, -128);
      if (value < 0)
        value = 255 + value + 1;
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 2147483647, -2147483648);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      this[offset + 2] = value >>> 16;
      this[offset + 3] = value >>> 24;
      return offset + 4;
    };
    Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 2147483647, -2147483648);
      if (value < 0)
        value = 4294967295 + value + 1;
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function checkIEEE754(buf, value, offset, ext, max2, min2) {
      if (offset + ext > buf.length)
        throw new RangeError("Index out of range");
      if (offset < 0)
        throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4);
      }
      ieee754$1.write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert);
    };
    Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert);
    };
    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8);
      }
      ieee754$1.write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert);
    };
    Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert);
    };
    Buffer.prototype.copy = function copy2(target, targetStart, start, end) {
      if (!Buffer.isBuffer(target))
        throw new TypeError("argument should be a Buffer");
      if (!start)
        start = 0;
      if (!end && end !== 0)
        end = this.length;
      if (targetStart >= target.length)
        targetStart = target.length;
      if (!targetStart)
        targetStart = 0;
      if (end > 0 && end < start)
        end = start;
      if (end === start)
        return 0;
      if (target.length === 0 || this.length === 0)
        return 0;
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
      }
      if (start < 0 || start >= this.length)
        throw new RangeError("Index out of range");
      if (end < 0)
        throw new RangeError("sourceEnd out of bounds");
      if (end > this.length)
        end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }
      const len2 = end - start;
      if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
        this.copyWithin(targetStart, start, end);
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, end),
          targetStart
        );
      }
      return len2;
    };
    Buffer.prototype.fill = function fill(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = this.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val.length === 1) {
          const code2 = val.charCodeAt(0);
          if (encoding === "utf8" && code2 < 128 || encoding === "latin1") {
            val = code2;
          }
        }
      } else if (typeof val === "number") {
        val = val & 255;
      } else if (typeof val === "boolean") {
        val = Number(val);
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return this;
      }
      start = start >>> 0;
      end = end === void 0 ? this.length : end >>> 0;
      if (!val)
        val = 0;
      let i2;
      if (typeof val === "number") {
        for (i2 = start; i2 < end; ++i2) {
          this[i2] = val;
        }
      } else {
        const bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
        const len2 = bytes.length;
        if (len2 === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i2 = 0; i2 < end - start; ++i2) {
          this[i2 + start] = bytes[i2 % len2];
        }
      }
      return this;
    };
    const errors = {};
    function E(sym, getMessage, Base) {
      errors[sym] = class NodeError extends Base {
        constructor() {
          super();
          Object.defineProperty(this, "message", {
            value: getMessage.apply(this, arguments),
            writable: true,
            configurable: true
          });
          this.name = `${this.name} [${sym}]`;
          this.stack;
          delete this.name;
        }
        get code() {
          return sym;
        }
        set code(value) {
          Object.defineProperty(this, "code", {
            configurable: true,
            enumerable: true,
            value,
            writable: true
          });
        }
        toString() {
          return `${this.name} [${sym}]: ${this.message}`;
        }
      };
    }
    E(
      "ERR_BUFFER_OUT_OF_BOUNDS",
      function(name) {
        if (name) {
          return `${name} is outside of buffer bounds`;
        }
        return "Attempt to access memory outside buffer bounds";
      },
      RangeError
    );
    E(
      "ERR_INVALID_ARG_TYPE",
      function(name, actual) {
        return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
      },
      TypeError
    );
    E(
      "ERR_OUT_OF_RANGE",
      function(str, range, input) {
        let msg = `The value of "${str}" is out of range.`;
        let received = input;
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
          received = addNumericalSeparator(String(input));
        } else if (typeof input === "bigint") {
          received = String(input);
          if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
            received = addNumericalSeparator(received);
          }
          received += "n";
        }
        msg += ` It must be ${range}. Received ${received}`;
        return msg;
      },
      RangeError
    );
    function addNumericalSeparator(val) {
      let res = "";
      let i2 = val.length;
      const start = val[0] === "-" ? 1 : 0;
      for (; i2 >= start + 4; i2 -= 3) {
        res = `_${val.slice(i2 - 3, i2)}${res}`;
      }
      return `${val.slice(0, i2)}${res}`;
    }
    function checkBounds(buf, offset, byteLength3) {
      validateNumber(offset, "offset");
      if (buf[offset] === void 0 || buf[offset + byteLength3] === void 0) {
        boundsError(offset, buf.length - (byteLength3 + 1));
      }
    }
    function checkIntBI(value, min2, max2, buf, offset, byteLength3) {
      if (value > max2 || value < min2) {
        const n = typeof min2 === "bigint" ? "n" : "";
        let range;
        if (byteLength3 > 3) {
          if (min2 === 0 || min2 === BigInt(0)) {
            range = `>= 0${n} and < 2${n} ** ${(byteLength3 + 1) * 8}${n}`;
          } else {
            range = `>= -(2${n} ** ${(byteLength3 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength3 + 1) * 8 - 1}${n}`;
          }
        } else {
          range = `>= ${min2}${n} and <= ${max2}${n}`;
        }
        throw new errors.ERR_OUT_OF_RANGE("value", range, value);
      }
      checkBounds(buf, offset, byteLength3);
    }
    function validateNumber(value, name) {
      if (typeof value !== "number") {
        throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
      }
    }
    function boundsError(value, length, type) {
      if (Math.floor(value) !== value) {
        validateNumber(value, type);
        throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
      }
      if (length < 0) {
        throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
      }
      throw new errors.ERR_OUT_OF_RANGE(
        type || "offset",
        `>= ${type ? 1 : 0} and <= ${length}`,
        value
      );
    }
    const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2)
        return "";
      while (str.length % 4 !== 0) {
        str = str + "=";
      }
      return str;
    }
    function utf8ToBytes(string, units) {
      units = units || Infinity;
      let codePoint;
      const length = string.length;
      let leadSurrogate = null;
      const bytes = [];
      for (let i2 = 0; i2 < length; ++i2) {
        codePoint = string.charCodeAt(i2);
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1)
                bytes.push(239, 191, 189);
              continue;
            } else if (i2 + 1 === length) {
              if ((units -= 3) > -1)
                bytes.push(239, 191, 189);
              continue;
            }
            leadSurrogate = codePoint;
            continue;
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            leadSurrogate = codePoint;
            continue;
          }
          codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
          if ((units -= 1) < 0)
            break;
          bytes.push(codePoint);
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0)
            break;
          bytes.push(
            codePoint >> 6 | 192,
            codePoint & 63 | 128
          );
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0)
            break;
          bytes.push(
            codePoint >> 12 | 224,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0)
            break;
          bytes.push(
            codePoint >> 18 | 240,
            codePoint >> 12 & 63 | 128,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else {
          throw new Error("Invalid code point");
        }
      }
      return bytes;
    }
    function asciiToBytes(str) {
      const byteArray = [];
      for (let i2 = 0; i2 < str.length; ++i2) {
        byteArray.push(str.charCodeAt(i2) & 255);
      }
      return byteArray;
    }
    function utf16leToBytes(str, units) {
      let c, hi, lo;
      const byteArray = [];
      for (let i2 = 0; i2 < str.length; ++i2) {
        if ((units -= 2) < 0)
          break;
        c = str.charCodeAt(i2);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }
      return byteArray;
    }
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }
    function blitBuffer(src, dst, offset, length) {
      let i2;
      for (i2 = 0; i2 < length; ++i2) {
        if (i2 + offset >= dst.length || i2 >= src.length)
          break;
        dst[i2 + offset] = src[i2];
      }
      return i2;
    }
    function isInstance(obj, type) {
      return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
    const hexSliceLookupTable = function() {
      const alphabet = "0123456789abcdef";
      const table = new Array(256);
      for (let i2 = 0; i2 < 16; ++i2) {
        const i16 = i2 * 16;
        for (let j = 0; j < 16; ++j) {
          table[i16 + j] = alphabet[i2] + alphabet[j];
        }
      }
      return table;
    }();
    function defineBigIntMethod(fn) {
      return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
    }
    function BufferBigIntNotDefined() {
      throw new Error("BigInt not supported");
    }
  })(buffer);
  class Context {
    constructor(importPath, useContextVariables) {
      this.code = "";
      this.scopes = [["vars"]];
      this.bitFields = [];
      this.tmpVariableCount = 0;
      this.references = /* @__PURE__ */ new Map();
      this.imports = [];
      this.reverseImports = /* @__PURE__ */ new Map();
      this.useContextVariables = false;
      this.importPath = importPath;
      this.useContextVariables = useContextVariables;
    }
    generateVariable(name) {
      const scopes = [...this.scopes[this.scopes.length - 1]];
      if (name) {
        scopes.push(name);
      }
      return scopes.join(".");
    }
    generateOption(val) {
      switch (typeof val) {
        case "number":
          return val.toString();
        case "string":
          return this.generateVariable(val);
        case "function":
          return `${this.addImport(val)}.call(${this.generateVariable()}, vars)`;
      }
    }
    generateError(err2) {
      this.pushCode(`throw new Error(${err2});`);
    }
    generateTmpVariable() {
      return "$tmp" + this.tmpVariableCount++;
    }
    pushCode(code2) {
      this.code += code2 + "\n";
    }
    pushPath(name) {
      if (name) {
        this.scopes[this.scopes.length - 1].push(name);
      }
    }
    popPath(name) {
      if (name) {
        this.scopes[this.scopes.length - 1].pop();
      }
    }
    pushScope(name) {
      this.scopes.push([name]);
    }
    popScope() {
      this.scopes.pop();
    }
    addImport(im) {
      if (!this.importPath)
        return `(${im})`;
      let id = this.reverseImports.get(im);
      if (!id) {
        id = this.imports.push(im) - 1;
        this.reverseImports.set(im, id);
      }
      return `${this.importPath}[${id}]`;
    }
    addReference(alias) {
      if (!this.references.has(alias)) {
        this.references.set(alias, { resolved: false, requested: false });
      }
    }
    markResolved(alias) {
      const reference = this.references.get(alias);
      if (reference) {
        reference.resolved = true;
      }
    }
    markRequested(aliasList) {
      aliasList.forEach((alias) => {
        const reference = this.references.get(alias);
        if (reference) {
          reference.requested = true;
        }
      });
    }
    getUnresolvedReferences() {
      return Array.from(this.references).filter(([_, reference]) => !reference.resolved && !reference.requested).map(([alias, _]) => alias);
    }
  }
  const aliasRegistry = /* @__PURE__ */ new Map();
  const FUNCTION_PREFIX = "___parser_";
  const PRIMITIVE_SIZES = {
    uint8: 1,
    uint16le: 2,
    uint16be: 2,
    uint32le: 4,
    uint32be: 4,
    int8: 1,
    int16le: 2,
    int16be: 2,
    int32le: 4,
    int32be: 4,
    int64be: 8,
    int64le: 8,
    uint64be: 8,
    uint64le: 8,
    floatle: 4,
    floatbe: 4,
    doublele: 8,
    doublebe: 8
  };
  const PRIMITIVE_NAMES = {
    uint8: "Uint8",
    uint16le: "Uint16",
    uint16be: "Uint16",
    uint32le: "Uint32",
    uint32be: "Uint32",
    int8: "Int8",
    int16le: "Int16",
    int16be: "Int16",
    int32le: "Int32",
    int32be: "Int32",
    int64be: "BigInt64",
    int64le: "BigInt64",
    uint64be: "BigUint64",
    uint64le: "BigUint64",
    floatle: "Float32",
    floatbe: "Float32",
    doublele: "Float64",
    doublebe: "Float64"
  };
  const PRIMITIVE_LITTLE_ENDIANS = {
    uint8: false,
    uint16le: true,
    uint16be: false,
    uint32le: true,
    uint32be: false,
    int8: false,
    int16le: true,
    int16be: false,
    int32le: true,
    int32be: false,
    int64be: false,
    int64le: true,
    uint64be: false,
    uint64le: true,
    floatle: true,
    floatbe: false,
    doublele: true,
    doublebe: false
  };
  class Parser {
    constructor() {
      this.varName = "";
      this.type = "";
      this.options = {};
      this.endian = "be";
      this.useContextVariables = false;
    }
    static start() {
      return new Parser();
    }
    primitiveGenerateN(type, ctx) {
      const typeName = PRIMITIVE_NAMES[type];
      const littleEndian = PRIMITIVE_LITTLE_ENDIANS[type];
      ctx.pushCode(`${ctx.generateVariable(this.varName)} = dataView.get${typeName}(offset, ${littleEndian});`);
      ctx.pushCode(`offset += ${PRIMITIVE_SIZES[type]};`);
    }
    primitiveN(type, varName, options) {
      return this.setNextParser(type, varName, options);
    }
    useThisEndian(type) {
      return type + this.endian.toLowerCase();
    }
    uint8(varName, options = {}) {
      return this.primitiveN("uint8", varName, options);
    }
    uint16(varName, options = {}) {
      return this.primitiveN(this.useThisEndian("uint16"), varName, options);
    }
    uint16le(varName, options = {}) {
      return this.primitiveN("uint16le", varName, options);
    }
    uint16be(varName, options = {}) {
      return this.primitiveN("uint16be", varName, options);
    }
    uint32(varName, options = {}) {
      return this.primitiveN(this.useThisEndian("uint32"), varName, options);
    }
    uint32le(varName, options = {}) {
      return this.primitiveN("uint32le", varName, options);
    }
    uint32be(varName, options = {}) {
      return this.primitiveN("uint32be", varName, options);
    }
    int8(varName, options = {}) {
      return this.primitiveN("int8", varName, options);
    }
    int16(varName, options = {}) {
      return this.primitiveN(this.useThisEndian("int16"), varName, options);
    }
    int16le(varName, options = {}) {
      return this.primitiveN("int16le", varName, options);
    }
    int16be(varName, options = {}) {
      return this.primitiveN("int16be", varName, options);
    }
    int32(varName, options = {}) {
      return this.primitiveN(this.useThisEndian("int32"), varName, options);
    }
    int32le(varName, options = {}) {
      return this.primitiveN("int32le", varName, options);
    }
    int32be(varName, options = {}) {
      return this.primitiveN("int32be", varName, options);
    }
    bigIntVersionCheck() {
      if (!DataView.prototype.getBigInt64)
        throw new Error("BigInt64 is unsupported on this runtime");
    }
    int64(varName, options = {}) {
      this.bigIntVersionCheck();
      return this.primitiveN(this.useThisEndian("int64"), varName, options);
    }
    int64be(varName, options = {}) {
      this.bigIntVersionCheck();
      return this.primitiveN("int64be", varName, options);
    }
    int64le(varName, options = {}) {
      this.bigIntVersionCheck();
      return this.primitiveN("int64le", varName, options);
    }
    uint64(varName, options = {}) {
      this.bigIntVersionCheck();
      return this.primitiveN(this.useThisEndian("uint64"), varName, options);
    }
    uint64be(varName, options = {}) {
      this.bigIntVersionCheck();
      return this.primitiveN("uint64be", varName, options);
    }
    uint64le(varName, options = {}) {
      this.bigIntVersionCheck();
      return this.primitiveN("uint64le", varName, options);
    }
    floatle(varName, options = {}) {
      return this.primitiveN("floatle", varName, options);
    }
    floatbe(varName, options = {}) {
      return this.primitiveN("floatbe", varName, options);
    }
    doublele(varName, options = {}) {
      return this.primitiveN("doublele", varName, options);
    }
    doublebe(varName, options = {}) {
      return this.primitiveN("doublebe", varName, options);
    }
    bitN(size, varName, options) {
      options.length = size;
      return this.setNextParser("bit", varName, options);
    }
    bit1(varName, options = {}) {
      return this.bitN(1, varName, options);
    }
    bit2(varName, options = {}) {
      return this.bitN(2, varName, options);
    }
    bit3(varName, options = {}) {
      return this.bitN(3, varName, options);
    }
    bit4(varName, options = {}) {
      return this.bitN(4, varName, options);
    }
    bit5(varName, options = {}) {
      return this.bitN(5, varName, options);
    }
    bit6(varName, options = {}) {
      return this.bitN(6, varName, options);
    }
    bit7(varName, options = {}) {
      return this.bitN(7, varName, options);
    }
    bit8(varName, options = {}) {
      return this.bitN(8, varName, options);
    }
    bit9(varName, options = {}) {
      return this.bitN(9, varName, options);
    }
    bit10(varName, options = {}) {
      return this.bitN(10, varName, options);
    }
    bit11(varName, options = {}) {
      return this.bitN(11, varName, options);
    }
    bit12(varName, options = {}) {
      return this.bitN(12, varName, options);
    }
    bit13(varName, options = {}) {
      return this.bitN(13, varName, options);
    }
    bit14(varName, options = {}) {
      return this.bitN(14, varName, options);
    }
    bit15(varName, options = {}) {
      return this.bitN(15, varName, options);
    }
    bit16(varName, options = {}) {
      return this.bitN(16, varName, options);
    }
    bit17(varName, options = {}) {
      return this.bitN(17, varName, options);
    }
    bit18(varName, options = {}) {
      return this.bitN(18, varName, options);
    }
    bit19(varName, options = {}) {
      return this.bitN(19, varName, options);
    }
    bit20(varName, options = {}) {
      return this.bitN(20, varName, options);
    }
    bit21(varName, options = {}) {
      return this.bitN(21, varName, options);
    }
    bit22(varName, options = {}) {
      return this.bitN(22, varName, options);
    }
    bit23(varName, options = {}) {
      return this.bitN(23, varName, options);
    }
    bit24(varName, options = {}) {
      return this.bitN(24, varName, options);
    }
    bit25(varName, options = {}) {
      return this.bitN(25, varName, options);
    }
    bit26(varName, options = {}) {
      return this.bitN(26, varName, options);
    }
    bit27(varName, options = {}) {
      return this.bitN(27, varName, options);
    }
    bit28(varName, options = {}) {
      return this.bitN(28, varName, options);
    }
    bit29(varName, options = {}) {
      return this.bitN(29, varName, options);
    }
    bit30(varName, options = {}) {
      return this.bitN(30, varName, options);
    }
    bit31(varName, options = {}) {
      return this.bitN(31, varName, options);
    }
    bit32(varName, options = {}) {
      return this.bitN(32, varName, options);
    }
    namely(alias) {
      aliasRegistry.set(alias, this);
      this.alias = alias;
      return this;
    }
    skip(length, options = {}) {
      return this.seek(length, options);
    }
    seek(relOffset, options = {}) {
      if (options.assert) {
        throw new Error("assert option on seek is not allowed.");
      }
      return this.setNextParser("seek", "", { length: relOffset });
    }
    string(varName, options) {
      if (!options.zeroTerminated && !options.length && !options.greedy) {
        throw new Error("One of length, zeroTerminated, or greedy must be defined for string.");
      }
      if ((options.zeroTerminated || options.length) && options.greedy) {
        throw new Error("greedy is mutually exclusive with length and zeroTerminated for string.");
      }
      if (options.stripNull && !(options.length || options.greedy)) {
        throw new Error("length or greedy must be defined if stripNull is enabled.");
      }
      options.encoding = options.encoding || "utf8";
      return this.setNextParser("string", varName, options);
    }
    buffer(varName, options) {
      if (!options.length && !options.readUntil) {
        throw new Error("length or readUntil must be defined for buffer.");
      }
      return this.setNextParser("buffer", varName, options);
    }
    wrapped(varName, options) {
      if (typeof options !== "object" && typeof varName === "object") {
        options = varName;
        varName = "";
      }
      if (!options || !options.wrapper || !options.type) {
        throw new Error("Both wrapper and type must be defined for wrapped.");
      }
      if (!options.length && !options.readUntil) {
        throw new Error("length or readUntil must be defined for wrapped.");
      }
      return this.setNextParser("wrapper", varName, options);
    }
    array(varName, options) {
      if (!options.readUntil && !options.length && !options.lengthInBytes) {
        throw new Error("One of readUntil, length and lengthInBytes must be defined for array.");
      }
      if (!options.type) {
        throw new Error("type is required for array.");
      }
      if (typeof options.type === "string" && !aliasRegistry.has(options.type) && !(options.type in PRIMITIVE_SIZES)) {
        throw new Error(`Array element type "${options.type}" is unkown.`);
      }
      return this.setNextParser("array", varName, options);
    }
    choice(varName, options) {
      if (typeof options !== "object" && typeof varName === "object") {
        options = varName;
        varName = "";
      }
      if (!options) {
        throw new Error("tag and choices are are required for choice.");
      }
      if (!options.tag) {
        throw new Error("tag is requird for choice.");
      }
      if (!options.choices) {
        throw new Error("choices is required for choice.");
      }
      for (const keyString in options.choices) {
        const key = parseInt(keyString, 10);
        const value = options.choices[key];
        if (isNaN(key)) {
          throw new Error(`Choice key "${keyString}" is not a number.`);
        }
        if (typeof value === "string" && !aliasRegistry.has(value) && !(value in PRIMITIVE_SIZES)) {
          throw new Error(`Choice type "${value}" is unkown.`);
        }
      }
      return this.setNextParser("choice", varName, options);
    }
    nest(varName, options) {
      if (typeof options !== "object" && typeof varName === "object") {
        options = varName;
        varName = "";
      }
      if (!options || !options.type) {
        throw new Error("type is required for nest.");
      }
      if (!(options.type instanceof Parser) && !aliasRegistry.has(options.type)) {
        throw new Error("type must be a known parser name or a Parser object.");
      }
      if (!(options.type instanceof Parser) && !varName) {
        throw new Error("type must be a Parser object if the variable name is omitted.");
      }
      return this.setNextParser("nest", varName, options);
    }
    pointer(varName, options) {
      if (!options.offset) {
        throw new Error("offset is required for pointer.");
      }
      if (!options.type) {
        throw new Error("type is required for pointer.");
      }
      if (typeof options.type === "string" && !(options.type in PRIMITIVE_SIZES) && !aliasRegistry.has(options.type)) {
        throw new Error(`Pointer type "${options.type}" is unkown.`);
      }
      return this.setNextParser("pointer", varName, options);
    }
    saveOffset(varName, options = {}) {
      return this.setNextParser("saveOffset", varName, options);
    }
    endianness(endianness) {
      switch (endianness.toLowerCase()) {
        case "little":
          this.endian = "le";
          break;
        case "big":
          this.endian = "be";
          break;
        default:
          throw new Error('endianness must be one of "little" or "big"');
      }
      return this;
    }
    endianess(endianess) {
      return this.endianness(endianess);
    }
    useContextVars(useContextVariables = true) {
      this.useContextVariables = useContextVariables;
      return this;
    }
    create(constructorFn) {
      if (!(constructorFn instanceof Function)) {
        throw new Error("Constructor must be a Function object.");
      }
      this.constructorFn = constructorFn;
      return this;
    }
    getContext(importPath) {
      const ctx = new Context(importPath, this.useContextVariables);
      ctx.pushCode("var dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.length);");
      if (!this.alias) {
        this.addRawCode(ctx);
      } else {
        this.addAliasedCode(ctx);
        ctx.pushCode(`return ${FUNCTION_PREFIX + this.alias}(0).result;`);
      }
      return ctx;
    }
    getCode() {
      const importPath = "imports";
      return this.getContext(importPath).code;
    }
    addRawCode(ctx) {
      ctx.pushCode("var offset = 0;");
      ctx.pushCode(`var vars = ${this.constructorFn ? "new constructorFn()" : "{}"};`);
      ctx.pushCode("vars.$parent = null;");
      ctx.pushCode("vars.$root = vars;");
      this.generate(ctx);
      this.resolveReferences(ctx);
      ctx.pushCode("delete vars.$parent;");
      ctx.pushCode("delete vars.$root;");
      ctx.pushCode("return vars;");
    }
    addAliasedCode(ctx) {
      ctx.pushCode(`function ${FUNCTION_PREFIX + this.alias}(offset, context) {`);
      ctx.pushCode(`var vars = ${this.constructorFn ? "new constructorFn()" : "{}"};`);
      ctx.pushCode("var ctx = Object.assign({$parent: null, $root: vars}, context || {});");
      ctx.pushCode(`vars = Object.assign(vars, ctx);`);
      this.generate(ctx);
      ctx.markResolved(this.alias);
      this.resolveReferences(ctx);
      ctx.pushCode("Object.keys(ctx).forEach(function (item) { delete vars[item]; });");
      ctx.pushCode("return { offset: offset, result: vars };");
      ctx.pushCode("}");
      return ctx;
    }
    resolveReferences(ctx) {
      const references = ctx.getUnresolvedReferences();
      ctx.markRequested(references);
      references.forEach((alias) => {
        var _a;
        (_a = aliasRegistry.get(alias)) === null || _a === void 0 ? void 0 : _a.addAliasedCode(ctx);
      });
    }
    compile() {
      const importPath = "imports";
      const ctx = this.getContext(importPath);
      this.compiled = new Function(importPath, "TextDecoder", `return function (buffer, constructorFn) { ${ctx.code} };`)(ctx.imports, TextDecoder);
    }
    sizeOf() {
      let size = NaN;
      if (Object.keys(PRIMITIVE_SIZES).indexOf(this.type) >= 0) {
        size = PRIMITIVE_SIZES[this.type];
      } else if (this.type === "string" && typeof this.options.length === "number") {
        size = this.options.length;
      } else if (this.type === "buffer" && typeof this.options.length === "number") {
        size = this.options.length;
      } else if (this.type === "array" && typeof this.options.length === "number") {
        let elementSize = NaN;
        if (typeof this.options.type === "string") {
          elementSize = PRIMITIVE_SIZES[this.options.type];
        } else if (this.options.type instanceof Parser) {
          elementSize = this.options.type.sizeOf();
        }
        size = this.options.length * elementSize;
      } else if (this.type === "seek") {
        size = this.options.length;
      } else if (this.type === "nest") {
        size = this.options.type.sizeOf();
      } else if (!this.type) {
        size = 0;
      }
      if (this.next) {
        size += this.next.sizeOf();
      }
      return size;
    }
    // Follow the parser chain till the root and start parsing from there
    parse(buffer2) {
      if (!this.compiled) {
        this.compile();
      }
      return this.compiled(buffer2, this.constructorFn);
    }
    setNextParser(type, varName, options) {
      const parser = new Parser();
      parser.type = type;
      parser.varName = varName;
      parser.options = options;
      parser.endian = this.endian;
      if (this.head) {
        this.head.next = parser;
      } else {
        this.next = parser;
      }
      this.head = parser;
      return this;
    }
    // Call code generator for this parser
    generate(ctx) {
      if (this.type) {
        switch (this.type) {
          case "uint8":
          case "uint16le":
          case "uint16be":
          case "uint32le":
          case "uint32be":
          case "int8":
          case "int16le":
          case "int16be":
          case "int32le":
          case "int32be":
          case "int64be":
          case "int64le":
          case "uint64be":
          case "uint64le":
          case "floatle":
          case "floatbe":
          case "doublele":
          case "doublebe":
            this.primitiveGenerateN(this.type, ctx);
            break;
          case "bit":
            this.generateBit(ctx);
            break;
          case "string":
            this.generateString(ctx);
            break;
          case "buffer":
            this.generateBuffer(ctx);
            break;
          case "seek":
            this.generateSeek(ctx);
            break;
          case "nest":
            this.generateNest(ctx);
            break;
          case "array":
            this.generateArray(ctx);
            break;
          case "choice":
            this.generateChoice(ctx);
            break;
          case "pointer":
            this.generatePointer(ctx);
            break;
          case "saveOffset":
            this.generateSaveOffset(ctx);
            break;
          case "wrapper":
            this.generateWrapper(ctx);
            break;
        }
        if (this.type !== "bit")
          this.generateAssert(ctx);
      }
      const varName = ctx.generateVariable(this.varName);
      if (this.options.formatter && this.type !== "bit") {
        this.generateFormatter(ctx, varName, this.options.formatter);
      }
      return this.generateNext(ctx);
    }
    generateAssert(ctx) {
      if (!this.options.assert) {
        return;
      }
      const varName = ctx.generateVariable(this.varName);
      switch (typeof this.options.assert) {
        case "function":
          {
            const func = ctx.addImport(this.options.assert);
            ctx.pushCode(`if (!${func}.call(vars, ${varName})) {`);
          }
          break;
        case "number":
          ctx.pushCode(`if (${this.options.assert} !== ${varName}) {`);
          break;
        case "string":
          ctx.pushCode(`if (${JSON.stringify(this.options.assert)} !== ${varName}) {`);
          break;
        default:
          throw new Error("assert option must be a string, number or a function.");
      }
      ctx.generateError(`"Assertion error: ${varName} is " + ${JSON.stringify(this.options.assert.toString())}`);
      ctx.pushCode("}");
    }
    // Recursively call code generators and append results
    generateNext(ctx) {
      if (this.next) {
        ctx = this.next.generate(ctx);
      }
      return ctx;
    }
    generateBit(ctx) {
      const parser = JSON.parse(JSON.stringify(this));
      parser.options = this.options;
      parser.generateAssert = this.generateAssert.bind(this);
      parser.generateFormatter = this.generateFormatter.bind(this);
      parser.varName = ctx.generateVariable(parser.varName);
      ctx.bitFields.push(parser);
      if (!this.next || this.next && ["bit", "nest"].indexOf(this.next.type) < 0) {
        const val = ctx.generateTmpVariable();
        ctx.pushCode(`var ${val} = 0;`);
        const getMaxBits = (from = 0) => {
          let sum2 = 0;
          for (let i2 = from; i2 < ctx.bitFields.length; i2++) {
            const length = ctx.bitFields[i2].options.length;
            if (sum2 + length > 32)
              break;
            sum2 += length;
          }
          return sum2;
        };
        const getBytes = (sum2) => {
          if (sum2 <= 8) {
            ctx.pushCode(`${val} = dataView.getUint8(offset);`);
            sum2 = 8;
          } else if (sum2 <= 16) {
            ctx.pushCode(`${val} = dataView.getUint16(offset);`);
            sum2 = 16;
          } else if (sum2 <= 24) {
            ctx.pushCode(`${val} = (dataView.getUint16(offset) << 8) | dataView.getUint8(offset + 2);`);
            sum2 = 24;
          } else {
            ctx.pushCode(`${val} = dataView.getUint32(offset);`);
            sum2 = 32;
          }
          ctx.pushCode(`offset += ${sum2 / 8};`);
          return sum2;
        };
        let bitOffset = 0;
        const isBigEndian = this.endian === "be";
        let sum = 0;
        let rem = 0;
        ctx.bitFields.forEach((parser2, i2) => {
          let length = parser2.options.length;
          if (length > rem) {
            if (rem) {
              const mask2 = -1 >>> 32 - rem;
              ctx.pushCode(`${parser2.varName} = (${val} & 0x${mask2.toString(16)}) << ${length - rem};`);
              length -= rem;
            }
            bitOffset = 0;
            rem = sum = getBytes(getMaxBits(i2) - rem);
          }
          const offset = isBigEndian ? sum - bitOffset - length : bitOffset;
          const mask = -1 >>> 32 - length;
          ctx.pushCode(`${parser2.varName} ${length < parser2.options.length ? "|=" : "="} ${val} >> ${offset} & 0x${mask.toString(16)};`);
          if (parser2.options.length === 32) {
            ctx.pushCode(`${parser2.varName} >>>= 0`);
          }
          if (parser2.options.assert) {
            parser2.generateAssert(ctx);
          }
          if (parser2.options.formatter) {
            parser2.generateFormatter(ctx, parser2.varName, parser2.options.formatter);
          }
          bitOffset += length;
          rem -= length;
        });
        ctx.bitFields = [];
      }
    }
    generateSeek(ctx) {
      const length = ctx.generateOption(this.options.length);
      ctx.pushCode(`offset += ${length};`);
    }
    generateString(ctx) {
      const name = ctx.generateVariable(this.varName);
      const start = ctx.generateTmpVariable();
      const encoding = this.options.encoding;
      const isHex = encoding.toLowerCase() === "hex";
      const toHex = 'b => b.toString(16).padStart(2, "0")';
      if (this.options.length && this.options.zeroTerminated) {
        const len2 = this.options.length;
        ctx.pushCode(`var ${start} = offset;`);
        ctx.pushCode(`while(dataView.getUint8(offset++) !== 0 && offset - ${start} < ${len2});`);
        const end = `offset - ${start} < ${len2} ? offset - 1 : offset`;
        ctx.pushCode(isHex ? `${name} = Array.from(buffer.subarray(${start}, ${end}), ${toHex}).join('');` : `${name} = new TextDecoder('${encoding}').decode(buffer.subarray(${start}, ${end}));`);
      } else if (this.options.length) {
        const len2 = ctx.generateOption(this.options.length);
        ctx.pushCode(isHex ? `${name} = Array.from(buffer.subarray(offset, offset + ${len2}), ${toHex}).join('');` : `${name} = new TextDecoder('${encoding}').decode(buffer.subarray(offset, offset + ${len2}));`);
        ctx.pushCode(`offset += ${len2};`);
      } else if (this.options.zeroTerminated) {
        ctx.pushCode(`var ${start} = offset;`);
        ctx.pushCode("while(dataView.getUint8(offset++) !== 0);");
        ctx.pushCode(isHex ? `${name} = Array.from(buffer.subarray(${start}, offset - 1), ${toHex}).join('');` : `${name} = new TextDecoder('${encoding}').decode(buffer.subarray(${start}, offset - 1));`);
      } else if (this.options.greedy) {
        ctx.pushCode(`var ${start} = offset;`);
        ctx.pushCode("while(buffer.length > offset++);");
        ctx.pushCode(isHex ? `${name} = Array.from(buffer.subarray(${start}, offset), ${toHex}).join('');` : `${name} = new TextDecoder('${encoding}').decode(buffer.subarray(${start}, offset));`);
      }
      if (this.options.stripNull) {
        ctx.pushCode(`${name} = ${name}.replace(/\\x00+$/g, '')`);
      }
    }
    generateBuffer(ctx) {
      const varName = ctx.generateVariable(this.varName);
      if (typeof this.options.readUntil === "function") {
        const pred = this.options.readUntil;
        const start = ctx.generateTmpVariable();
        const cur = ctx.generateTmpVariable();
        ctx.pushCode(`var ${start} = offset;`);
        ctx.pushCode(`var ${cur} = 0;`);
        ctx.pushCode(`while (offset < buffer.length) {`);
        ctx.pushCode(`${cur} = dataView.getUint8(offset);`);
        const func = ctx.addImport(pred);
        ctx.pushCode(`if (${func}.call(${ctx.generateVariable()}, ${cur}, buffer.subarray(offset))) break;`);
        ctx.pushCode(`offset += 1;`);
        ctx.pushCode(`}`);
        ctx.pushCode(`${varName} = buffer.subarray(${start}, offset);`);
      } else if (this.options.readUntil === "eof") {
        ctx.pushCode(`${varName} = buffer.subarray(offset);`);
      } else {
        const len2 = ctx.generateOption(this.options.length);
        ctx.pushCode(`${varName} = buffer.subarray(offset, offset + ${len2});`);
        ctx.pushCode(`offset += ${len2};`);
      }
      if (this.options.clone) {
        ctx.pushCode(`${varName} = buffer.constructor.from(${varName});`);
      }
    }
    generateArray(ctx) {
      const length = ctx.generateOption(this.options.length);
      const lengthInBytes = ctx.generateOption(this.options.lengthInBytes);
      const type = this.options.type;
      const counter = ctx.generateTmpVariable();
      const lhs = ctx.generateVariable(this.varName);
      const item = ctx.generateTmpVariable();
      const key = this.options.key;
      const isHash = typeof key === "string";
      if (isHash) {
        ctx.pushCode(`${lhs} = {};`);
      } else {
        ctx.pushCode(`${lhs} = [];`);
      }
      if (typeof this.options.readUntil === "function") {
        ctx.pushCode("do {");
      } else if (this.options.readUntil === "eof") {
        ctx.pushCode(`for (var ${counter} = 0; offset < buffer.length; ${counter}++) {`);
      } else if (lengthInBytes !== void 0) {
        ctx.pushCode(`for (var ${counter} = offset + ${lengthInBytes}; offset < ${counter}; ) {`);
      } else {
        ctx.pushCode(`for (var ${counter} = ${length}; ${counter} > 0; ${counter}--) {`);
      }
      if (typeof type === "string") {
        if (!aliasRegistry.get(type)) {
          const typeName = PRIMITIVE_NAMES[type];
          const littleEndian = PRIMITIVE_LITTLE_ENDIANS[type];
          ctx.pushCode(`var ${item} = dataView.get${typeName}(offset, ${littleEndian});`);
          ctx.pushCode(`offset += ${PRIMITIVE_SIZES[type]};`);
        } else {
          const tempVar = ctx.generateTmpVariable();
          ctx.pushCode(`var ${tempVar} = ${FUNCTION_PREFIX + type}(offset, {`);
          if (ctx.useContextVariables) {
            const parentVar = ctx.generateVariable();
            ctx.pushCode(`$parent: ${parentVar},`);
            ctx.pushCode(`$root: ${parentVar}.$root,`);
            if (!this.options.readUntil && lengthInBytes === void 0) {
              ctx.pushCode(`$index: ${length} - ${counter},`);
            }
          }
          ctx.pushCode(`});`);
          ctx.pushCode(`var ${item} = ${tempVar}.result; offset = ${tempVar}.offset;`);
          if (type !== this.alias)
            ctx.addReference(type);
        }
      } else if (type instanceof Parser) {
        ctx.pushCode(`var ${item} = {};`);
        const parentVar = ctx.generateVariable();
        ctx.pushScope(item);
        if (ctx.useContextVariables) {
          ctx.pushCode(`${item}.$parent = ${parentVar};`);
          ctx.pushCode(`${item}.$root = ${parentVar}.$root;`);
          if (!this.options.readUntil && lengthInBytes === void 0) {
            ctx.pushCode(`${item}.$index = ${length} - ${counter};`);
          }
        }
        type.generate(ctx);
        if (ctx.useContextVariables) {
          ctx.pushCode(`delete ${item}.$parent;`);
          ctx.pushCode(`delete ${item}.$root;`);
          ctx.pushCode(`delete ${item}.$index;`);
        }
        ctx.popScope();
      }
      if (isHash) {
        ctx.pushCode(`${lhs}[${item}.${key}] = ${item};`);
      } else {
        ctx.pushCode(`${lhs}.push(${item});`);
      }
      ctx.pushCode("}");
      if (typeof this.options.readUntil === "function") {
        const pred = this.options.readUntil;
        const func = ctx.addImport(pred);
        ctx.pushCode(`while (!${func}.call(${ctx.generateVariable()}, ${item}, buffer.subarray(offset)));`);
      }
    }
    generateChoiceCase(ctx, varName, type) {
      if (typeof type === "string") {
        const varName2 = ctx.generateVariable(this.varName);
        if (!aliasRegistry.has(type)) {
          const typeName = PRIMITIVE_NAMES[type];
          const littleEndian = PRIMITIVE_LITTLE_ENDIANS[type];
          ctx.pushCode(`${varName2} = dataView.get${typeName}(offset, ${littleEndian});`);
          ctx.pushCode(`offset += ${PRIMITIVE_SIZES[type]}`);
        } else {
          const tempVar = ctx.generateTmpVariable();
          ctx.pushCode(`var ${tempVar} = ${FUNCTION_PREFIX + type}(offset, {`);
          if (ctx.useContextVariables) {
            ctx.pushCode(`$parent: ${varName2}.$parent,`);
            ctx.pushCode(`$root: ${varName2}.$root,`);
          }
          ctx.pushCode(`});`);
          ctx.pushCode(`${varName2} = ${tempVar}.result; offset = ${tempVar}.offset;`);
          if (type !== this.alias)
            ctx.addReference(type);
        }
      } else if (type instanceof Parser) {
        ctx.pushPath(varName);
        type.generate(ctx);
        ctx.popPath(varName);
      }
    }
    generateChoice(ctx) {
      const tag = ctx.generateOption(this.options.tag);
      const nestVar = ctx.generateVariable(this.varName);
      if (this.varName) {
        ctx.pushCode(`${nestVar} = {};`);
        if (ctx.useContextVariables) {
          const parentVar = ctx.generateVariable();
          ctx.pushCode(`${nestVar}.$parent = ${parentVar};`);
          ctx.pushCode(`${nestVar}.$root = ${parentVar}.$root;`);
        }
      }
      ctx.pushCode(`switch(${tag}) {`);
      for (const tagString in this.options.choices) {
        const tag2 = parseInt(tagString, 10);
        const type = this.options.choices[tag2];
        ctx.pushCode(`case ${tag2}:`);
        this.generateChoiceCase(ctx, this.varName, type);
        ctx.pushCode("break;");
      }
      ctx.pushCode("default:");
      if (this.options.defaultChoice) {
        this.generateChoiceCase(ctx, this.varName, this.options.defaultChoice);
      } else {
        ctx.generateError(`"Met undefined tag value " + ${tag} + " at choice"`);
      }
      ctx.pushCode("}");
      if (this.varName && ctx.useContextVariables) {
        ctx.pushCode(`delete ${nestVar}.$parent;`);
        ctx.pushCode(`delete ${nestVar}.$root;`);
      }
    }
    generateNest(ctx) {
      const nestVar = ctx.generateVariable(this.varName);
      if (this.options.type instanceof Parser) {
        if (this.varName) {
          ctx.pushCode(`${nestVar} = {};`);
          if (ctx.useContextVariables) {
            const parentVar = ctx.generateVariable();
            ctx.pushCode(`${nestVar}.$parent = ${parentVar};`);
            ctx.pushCode(`${nestVar}.$root = ${parentVar}.$root;`);
          }
        }
        ctx.pushPath(this.varName);
        this.options.type.generate(ctx);
        ctx.popPath(this.varName);
        if (this.varName && ctx.useContextVariables) {
          if (ctx.useContextVariables) {
            ctx.pushCode(`delete ${nestVar}.$parent;`);
            ctx.pushCode(`delete ${nestVar}.$root;`);
          }
        }
      } else if (aliasRegistry.has(this.options.type)) {
        const tempVar = ctx.generateTmpVariable();
        ctx.pushCode(`var ${tempVar} = ${FUNCTION_PREFIX + this.options.type}(offset, {`);
        if (ctx.useContextVariables) {
          const parentVar = ctx.generateVariable();
          ctx.pushCode(`$parent: ${parentVar},`);
          ctx.pushCode(`$root: ${parentVar}.$root,`);
        }
        ctx.pushCode(`});`);
        ctx.pushCode(`${nestVar} = ${tempVar}.result; offset = ${tempVar}.offset;`);
        if (this.options.type !== this.alias) {
          ctx.addReference(this.options.type);
        }
      }
    }
    generateWrapper(ctx) {
      const wrapperVar = ctx.generateVariable(this.varName);
      const wrappedBuf = ctx.generateTmpVariable();
      if (typeof this.options.readUntil === "function") {
        const pred = this.options.readUntil;
        const start = ctx.generateTmpVariable();
        const cur = ctx.generateTmpVariable();
        ctx.pushCode(`var ${start} = offset;`);
        ctx.pushCode(`var ${cur} = 0;`);
        ctx.pushCode(`while (offset < buffer.length) {`);
        ctx.pushCode(`${cur} = dataView.getUint8(offset);`);
        const func2 = ctx.addImport(pred);
        ctx.pushCode(`if (${func2}.call(${ctx.generateVariable()}, ${cur}, buffer.subarray(offset))) break;`);
        ctx.pushCode(`offset += 1;`);
        ctx.pushCode(`}`);
        ctx.pushCode(`${wrappedBuf} = buffer.subarray(${start}, offset);`);
      } else if (this.options.readUntil === "eof") {
        ctx.pushCode(`${wrappedBuf} = buffer.subarray(offset);`);
      } else {
        const len2 = ctx.generateOption(this.options.length);
        ctx.pushCode(`${wrappedBuf} = buffer.subarray(offset, offset + ${len2});`);
        ctx.pushCode(`offset += ${len2};`);
      }
      if (this.options.clone) {
        ctx.pushCode(`${wrappedBuf} = buffer.constructor.from(${wrappedBuf});`);
      }
      const tempBuf = ctx.generateTmpVariable();
      const tempOff = ctx.generateTmpVariable();
      const tempView = ctx.generateTmpVariable();
      const func = ctx.addImport(this.options.wrapper);
      ctx.pushCode(`${wrappedBuf} = ${func}.call(this, ${wrappedBuf}).subarray(0);`);
      ctx.pushCode(`var ${tempBuf} = buffer;`);
      ctx.pushCode(`var ${tempOff} = offset;`);
      ctx.pushCode(`var ${tempView} = dataView;`);
      ctx.pushCode(`buffer = ${wrappedBuf};`);
      ctx.pushCode(`offset = 0;`);
      ctx.pushCode(`dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.length);`);
      if (this.options.type instanceof Parser) {
        if (this.varName) {
          ctx.pushCode(`${wrapperVar} = {};`);
        }
        ctx.pushPath(this.varName);
        this.options.type.generate(ctx);
        ctx.popPath(this.varName);
      } else if (aliasRegistry.has(this.options.type)) {
        const tempVar = ctx.generateTmpVariable();
        ctx.pushCode(`var ${tempVar} = ${FUNCTION_PREFIX + this.options.type}(0);`);
        ctx.pushCode(`${wrapperVar} = ${tempVar}.result;`);
        if (this.options.type !== this.alias) {
          ctx.addReference(this.options.type);
        }
      }
      ctx.pushCode(`buffer = ${tempBuf};`);
      ctx.pushCode(`dataView = ${tempView};`);
      ctx.pushCode(`offset = ${tempOff};`);
    }
    generateFormatter(ctx, varName, formatter) {
      if (typeof formatter === "function") {
        const func = ctx.addImport(formatter);
        ctx.pushCode(`${varName} = ${func}.call(${ctx.generateVariable()}, ${varName});`);
      }
    }
    generatePointer(ctx) {
      const type = this.options.type;
      const offset = ctx.generateOption(this.options.offset);
      const tempVar = ctx.generateTmpVariable();
      const nestVar = ctx.generateVariable(this.varName);
      ctx.pushCode(`var ${tempVar} = offset;`);
      ctx.pushCode(`offset = ${offset};`);
      if (this.options.type instanceof Parser) {
        ctx.pushCode(`${nestVar} = {};`);
        if (ctx.useContextVariables) {
          const parentVar = ctx.generateVariable();
          ctx.pushCode(`${nestVar}.$parent = ${parentVar};`);
          ctx.pushCode(`${nestVar}.$root = ${parentVar}.$root;`);
        }
        ctx.pushPath(this.varName);
        this.options.type.generate(ctx);
        ctx.popPath(this.varName);
        if (ctx.useContextVariables) {
          ctx.pushCode(`delete ${nestVar}.$parent;`);
          ctx.pushCode(`delete ${nestVar}.$root;`);
        }
      } else if (aliasRegistry.has(this.options.type)) {
        const tempVar2 = ctx.generateTmpVariable();
        ctx.pushCode(`var ${tempVar2} = ${FUNCTION_PREFIX + this.options.type}(offset, {`);
        if (ctx.useContextVariables) {
          const parentVar = ctx.generateVariable();
          ctx.pushCode(`$parent: ${parentVar},`);
          ctx.pushCode(`$root: ${parentVar}.$root,`);
        }
        ctx.pushCode(`});`);
        ctx.pushCode(`${nestVar} = ${tempVar2}.result; offset = ${tempVar2}.offset;`);
        if (this.options.type !== this.alias) {
          ctx.addReference(this.options.type);
        }
      } else if (Object.keys(PRIMITIVE_SIZES).indexOf(this.options.type) >= 0) {
        const typeName = PRIMITIVE_NAMES[type];
        const littleEndian = PRIMITIVE_LITTLE_ENDIANS[type];
        ctx.pushCode(`${nestVar} = dataView.get${typeName}(offset, ${littleEndian});`);
        ctx.pushCode(`offset += ${PRIMITIVE_SIZES[type]};`);
      }
      ctx.pushCode(`offset = ${tempVar};`);
    }
    generateSaveOffset(ctx) {
      const varName = ctx.generateVariable(this.varName);
      ctx.pushCode(`${varName} = offset`);
    }
  }
  var esm = {};
  var AbortablePromiseCache$1 = {};
  var abortcontrollerPonyfill = {};
  var cjsPonyfill = {};
  Object.defineProperty(cjsPonyfill, "__esModule", { value: true });
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i2 = 0; i2 < props.length; i2++) {
      var descriptor = props[i2];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps)
      _defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass)
      _setPrototypeOf(subClass, superClass);
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
      return o2.__proto__ || Object.getPrototypeOf(o2);
    };
    return _getPrototypeOf(o);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
      o2.__proto__ = p2;
      return o2;
    };
    return _setPrototypeOf(o, p);
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct)
      return false;
    if (Reflect.construct.sham)
      return false;
    if (typeof Proxy === "function")
      return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
      return true;
    } catch (e) {
      return false;
    }
  }
  function _assertThisInitialized(self2) {
    if (self2 === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self2;
  }
  function _possibleConstructorReturn(self2, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }
    return _assertThisInitialized(self2);
  }
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived), result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn(this, result);
    };
  }
  function _superPropBase(object2, property) {
    while (!Object.prototype.hasOwnProperty.call(object2, property)) {
      object2 = _getPrototypeOf(object2);
      if (object2 === null)
        break;
    }
    return object2;
  }
  function _get() {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get.bind();
    } else {
      _get = function _get2(target, property, receiver) {
        var base = _superPropBase(target, property);
        if (!base)
          return;
        var desc = Object.getOwnPropertyDescriptor(base, property);
        if (desc.get) {
          return desc.get.call(arguments.length < 3 ? target : receiver);
        }
        return desc.value;
      };
    }
    return _get.apply(this, arguments);
  }
  var Emitter = /* @__PURE__ */ function() {
    function Emitter2() {
      _classCallCheck(this, Emitter2);
      Object.defineProperty(this, "listeners", {
        value: {},
        writable: true,
        configurable: true
      });
    }
    _createClass(Emitter2, [{
      key: "addEventListener",
      value: function addEventListener(type, callback, options) {
        if (!(type in this.listeners)) {
          this.listeners[type] = [];
        }
        this.listeners[type].push({
          callback,
          options
        });
      }
    }, {
      key: "removeEventListener",
      value: function removeEventListener(type, callback) {
        if (!(type in this.listeners)) {
          return;
        }
        var stack = this.listeners[type];
        for (var i2 = 0, l = stack.length; i2 < l; i2++) {
          if (stack[i2].callback === callback) {
            stack.splice(i2, 1);
            return;
          }
        }
      }
    }, {
      key: "dispatchEvent",
      value: function dispatchEvent(event) {
        if (!(event.type in this.listeners)) {
          return;
        }
        var stack = this.listeners[event.type];
        var stackToCall = stack.slice();
        for (var i2 = 0, l = stackToCall.length; i2 < l; i2++) {
          var listener = stackToCall[i2];
          try {
            listener.callback.call(this, event);
          } catch (e) {
            Promise.resolve().then(function() {
              throw e;
            });
          }
          if (listener.options && listener.options.once) {
            this.removeEventListener(event.type, listener.callback);
          }
        }
        return !event.defaultPrevented;
      }
    }]);
    return Emitter2;
  }();
  var AbortSignal$1 = /* @__PURE__ */ function(_Emitter) {
    _inherits(AbortSignal2, _Emitter);
    var _super = _createSuper(AbortSignal2);
    function AbortSignal2() {
      var _this;
      _classCallCheck(this, AbortSignal2);
      _this = _super.call(this);
      if (!_this.listeners) {
        Emitter.call(_assertThisInitialized(_this));
      }
      Object.defineProperty(_assertThisInitialized(_this), "aborted", {
        value: false,
        writable: true,
        configurable: true
      });
      Object.defineProperty(_assertThisInitialized(_this), "onabort", {
        value: null,
        writable: true,
        configurable: true
      });
      Object.defineProperty(_assertThisInitialized(_this), "reason", {
        value: void 0,
        writable: true,
        configurable: true
      });
      return _this;
    }
    _createClass(AbortSignal2, [{
      key: "toString",
      value: function toString2() {
        return "[object AbortSignal]";
      }
    }, {
      key: "dispatchEvent",
      value: function dispatchEvent(event) {
        if (event.type === "abort") {
          this.aborted = true;
          if (typeof this.onabort === "function") {
            this.onabort.call(this, event);
          }
        }
        _get(_getPrototypeOf(AbortSignal2.prototype), "dispatchEvent", this).call(this, event);
      }
    }]);
    return AbortSignal2;
  }(Emitter);
  var AbortController$1 = /* @__PURE__ */ function() {
    function AbortController2() {
      _classCallCheck(this, AbortController2);
      Object.defineProperty(this, "signal", {
        value: new AbortSignal$1(),
        writable: true,
        configurable: true
      });
    }
    _createClass(AbortController2, [{
      key: "abort",
      value: function abort(reason) {
        var event;
        try {
          event = new Event("abort");
        } catch (e) {
          if (typeof document !== "undefined") {
            if (!document.createEvent) {
              event = document.createEventObject();
              event.type = "abort";
            } else {
              event = document.createEvent("Event");
              event.initEvent("abort", false, false);
            }
          } else {
            event = {
              type: "abort",
              bubbles: false,
              cancelable: false
            };
          }
        }
        var signalReason = reason;
        if (signalReason === void 0) {
          if (typeof document === "undefined") {
            signalReason = new Error("This operation was aborted");
            signalReason.name = "AbortError";
          } else {
            try {
              signalReason = new DOMException("signal is aborted without reason");
            } catch (err2) {
              signalReason = new Error("This operation was aborted");
              signalReason.name = "AbortError";
            }
          }
        }
        this.signal.reason = signalReason;
        this.signal.dispatchEvent(event);
      }
    }, {
      key: "toString",
      value: function toString2() {
        return "[object AbortController]";
      }
    }]);
    return AbortController2;
  }();
  if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
    AbortController$1.prototype[Symbol.toStringTag] = "AbortController";
    AbortSignal$1.prototype[Symbol.toStringTag] = "AbortSignal";
  }
  function polyfillNeeded(self2) {
    if (self2.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL) {
      console.log("__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL=true is set, will force install polyfill");
      return true;
    }
    return typeof self2.Request === "function" && !self2.Request.prototype.hasOwnProperty("signal") || !self2.AbortController;
  }
  function abortableFetchDecorator(patchTargets) {
    if ("function" === typeof patchTargets) {
      patchTargets = {
        fetch: patchTargets
      };
    }
    var _patchTargets = patchTargets, fetch = _patchTargets.fetch, _patchTargets$Request = _patchTargets.Request, NativeRequest = _patchTargets$Request === void 0 ? fetch.Request : _patchTargets$Request, NativeAbortController = _patchTargets.AbortController, _patchTargets$__FORCE = _patchTargets.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL, __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL = _patchTargets$__FORCE === void 0 ? false : _patchTargets$__FORCE;
    if (!polyfillNeeded({
      fetch,
      Request: NativeRequest,
      AbortController: NativeAbortController,
      __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL
    })) {
      return {
        fetch,
        Request
      };
    }
    var Request = NativeRequest;
    if (Request && !Request.prototype.hasOwnProperty("signal") || __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL) {
      Request = function Request2(input, init) {
        var signal;
        if (init && init.signal) {
          signal = init.signal;
          delete init.signal;
        }
        var request = new NativeRequest(input, init);
        if (signal) {
          Object.defineProperty(request, "signal", {
            writable: false,
            enumerable: false,
            configurable: true,
            value: signal
          });
        }
        return request;
      };
      Request.prototype = NativeRequest.prototype;
    }
    var realFetch = fetch;
    var abortableFetch = function abortableFetch2(input, init) {
      var signal = Request && Request.prototype.isPrototypeOf(input) ? input.signal : init ? init.signal : void 0;
      if (signal) {
        var abortError;
        try {
          abortError = new DOMException("Aborted", "AbortError");
        } catch (err2) {
          abortError = new Error("Aborted");
          abortError.name = "AbortError";
        }
        if (signal.aborted) {
          return Promise.reject(abortError);
        }
        var cancellation = new Promise(function(_, reject) {
          signal.addEventListener("abort", function() {
            return reject(abortError);
          }, {
            once: true
          });
        });
        if (init && init.signal) {
          delete init.signal;
        }
        return Promise.race([cancellation, realFetch(input, init)]);
      }
      return realFetch(input, init);
    };
    return {
      fetch: abortableFetch,
      Request
    };
  }
  cjsPonyfill.AbortController = AbortController$1;
  cjsPonyfill.AbortSignal = AbortSignal$1;
  cjsPonyfill.abortableFetch = abortableFetchDecorator;
  Object.defineProperty(abortcontrollerPonyfill, "__esModule", { value: true });
  abortcontrollerPonyfill.AbortSignal = abortcontrollerPonyfill.AbortController = void 0;
  const cjs_ponyfill_1 = cjsPonyfill;
  var getGlobal = function() {
    if (typeof self !== "undefined") {
      return self;
    }
    if (typeof window !== "undefined") {
      return window;
    }
    if (typeof commonjsGlobal !== "undefined") {
      return commonjsGlobal;
    }
    throw new Error("unable to locate global object");
  };
  let AbortController = typeof getGlobal().AbortController === "undefined" ? cjs_ponyfill_1.AbortController : getGlobal().AbortController;
  abortcontrollerPonyfill.AbortController = AbortController;
  let AbortSignal = typeof getGlobal().AbortController === "undefined" ? cjs_ponyfill_1.AbortSignal : getGlobal().AbortSignal;
  abortcontrollerPonyfill.AbortSignal = AbortSignal;
  var AggregateAbortController$1 = {};
  Object.defineProperty(AggregateAbortController$1, "__esModule", { value: true });
  const abortcontroller_ponyfill_1$1 = abortcontrollerPonyfill;
  class NullSignal {
  }
  class AggregateAbortController {
    constructor() {
      this.signals = /* @__PURE__ */ new Set();
      this.abortController = new abortcontroller_ponyfill_1$1.AbortController();
    }
    /**
     * @param {AbortSignal} [signal] optional AbortSignal to add. if falsy,
     *  will be treated as a null-signal, and this abortcontroller will no
     *  longer be abortable.
     */
    //@ts-ignore
    addSignal(signal = new NullSignal()) {
      if (this.signal.aborted) {
        throw new Error("cannot add a signal, already aborted!");
      }
      this.signals.add(signal);
      if (signal.aborted) {
        this.handleAborted(signal);
      } else if (typeof signal.addEventListener === "function") {
        signal.addEventListener("abort", () => {
          this.handleAborted(signal);
        });
      }
    }
    handleAborted(signal) {
      this.signals.delete(signal);
      if (this.signals.size === 0) {
        this.abortController.abort();
      }
    }
    get signal() {
      return this.abortController.signal;
    }
    abort() {
      this.abortController.abort();
    }
  }
  AggregateAbortController$1.default = AggregateAbortController;
  var AggregateStatusReporter$1 = {};
  Object.defineProperty(AggregateStatusReporter$1, "__esModule", { value: true });
  class AggregateStatusReporter {
    constructor() {
      this.callbacks = /* @__PURE__ */ new Set();
    }
    addCallback(callback = () => {
    }) {
      this.callbacks.add(callback);
      callback(this.currentMessage);
    }
    callback(message) {
      this.currentMessage = message;
      this.callbacks.forEach((elt) => {
        elt(message);
      });
    }
  }
  AggregateStatusReporter$1.default = AggregateStatusReporter;
  var __importDefault$1 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(AbortablePromiseCache$1, "__esModule", { value: true });
  const abortcontroller_ponyfill_1 = abortcontrollerPonyfill;
  const AggregateAbortController_1 = __importDefault$1(AggregateAbortController$1);
  const AggregateStatusReporter_1 = __importDefault$1(AggregateStatusReporter$1);
  class AbortablePromiseCache {
    constructor({ fill, cache }) {
      if (typeof fill !== "function") {
        throw new TypeError("must pass a fill function");
      }
      if (typeof cache !== "object") {
        throw new TypeError("must pass a cache object");
      }
      if (typeof cache.get !== "function" || typeof cache.set !== "function" || typeof cache.delete !== "function") {
        throw new TypeError("cache must implement get(key), set(key, val), and and delete(key)");
      }
      this.cache = cache;
      this.fillCallback = fill;
    }
    static isAbortException(exception) {
      return (
        // DOMException
        exception.name === "AbortError" || // standard-ish non-DOM abort exception
        //@ts-ignore
        exception.code === "ERR_ABORTED" || // stringified DOMException
        exception.message === "AbortError: aborted" || // stringified standard-ish exception
        exception.message === "Error: aborted"
      );
    }
    evict(key, entry) {
      if (this.cache.get(key) === entry) {
        this.cache.delete(key);
      }
    }
    fill(key, data, signal, statusCallback) {
      const aborter = new AggregateAbortController_1.default();
      const statusReporter = new AggregateStatusReporter_1.default();
      statusReporter.addCallback(statusCallback);
      const newEntry = {
        aborter,
        promise: this.fillCallback(data, aborter.signal, (message) => {
          statusReporter.callback(message);
        }),
        settled: false,
        statusReporter,
        get aborted() {
          return this.aborter.signal.aborted;
        }
      };
      newEntry.aborter.addSignal(signal);
      newEntry.aborter.signal.addEventListener("abort", () => {
        if (!newEntry.settled) {
          this.evict(key, newEntry);
        }
      });
      newEntry.promise.then(() => {
        newEntry.settled = true;
      }, () => {
        newEntry.settled = true;
        this.evict(key, newEntry);
      }).catch((e) => {
        console.error(e);
        throw e;
      });
      this.cache.set(key, newEntry);
    }
    static checkSinglePromise(promise, signal) {
      function checkForSingleAbort() {
        if (signal && signal.aborted) {
          throw Object.assign(new Error("aborted"), { code: "ERR_ABORTED" });
        }
      }
      return promise.then((result) => {
        checkForSingleAbort();
        return result;
      }, (error) => {
        checkForSingleAbort();
        throw error;
      });
    }
    has(key) {
      return this.cache.has(key);
    }
    /**
     * Callback for getting status of the pending async
     *
     * @callback statusCallback
     * @param {any} status, current status string or message object
     */
    /**
     * @param {any} key cache key to use for this request
     * @param {any} data data passed as the first argument to the fill callback
     * @param {AbortSignal} [signal] optional AbortSignal object that aborts the request
     * @param {statusCallback} a callback to get the current status of a pending async operation
     */
    get(key, data, signal, statusCallback) {
      if (!signal && data instanceof abortcontroller_ponyfill_1.AbortSignal) {
        throw new TypeError("second get argument appears to be an AbortSignal, perhaps you meant to pass `null` for the fill data?");
      }
      const cacheEntry = this.cache.get(key);
      if (cacheEntry) {
        if (cacheEntry.aborted && !cacheEntry.settled) {
          this.evict(key, cacheEntry);
          return this.get(key, data, signal, statusCallback);
        }
        if (cacheEntry.settled) {
          return cacheEntry.promise;
        }
        cacheEntry.aborter.addSignal(signal);
        cacheEntry.statusReporter.addCallback(statusCallback);
        return AbortablePromiseCache.checkSinglePromise(cacheEntry.promise, signal);
      }
      this.fill(key, data, signal, statusCallback);
      return AbortablePromiseCache.checkSinglePromise(
        //see https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.cache.get(key).promise,
        signal
      );
    }
    /**
     * delete the given entry from the cache. if it exists and its fill request has
     * not yet settled, the fill will be signaled to abort.
     *
     * @param {any} key
     */
    delete(key) {
      const cachedEntry = this.cache.get(key);
      if (cachedEntry) {
        if (!cachedEntry.settled) {
          cachedEntry.aborter.abort();
        }
        this.cache.delete(key);
      }
    }
    /**
     * Clear all requests from the cache. Aborts any that have not settled.
     * @returns {number} count of entries deleted
     */
    clear() {
      const keyIter = this.cache.keys();
      let deleteCount = 0;
      for (let result = keyIter.next(); !result.done; result = keyIter.next()) {
        this.delete(result.value);
        deleteCount += 1;
      }
      return deleteCount;
    }
  }
  AbortablePromiseCache$1.default = AbortablePromiseCache;
  var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(esm, "__esModule", { value: true });
  const AbortablePromiseCache_1 = __importDefault(AbortablePromiseCache$1);
  var _default = esm.default = AbortablePromiseCache_1.default;
  class QuickLRU {
    constructor(options = {}) {
      if (!(options.maxSize && options.maxSize > 0)) {
        throw new TypeError("`maxSize` must be a number greater than 0");
      }
      this.maxSize = options.maxSize;
      this.cache = /* @__PURE__ */ new Map();
      this.oldCache = /* @__PURE__ */ new Map();
      this._size = 0;
    }
    _set(key, value) {
      this.cache.set(key, value);
      this._size++;
      if (this._size >= this.maxSize) {
        this._size = 0;
        this.oldCache = this.cache;
        this.cache = /* @__PURE__ */ new Map();
      }
    }
    get(key) {
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }
      if (this.oldCache.has(key)) {
        const value = this.oldCache.get(key);
        this.oldCache.delete(key);
        this._set(key, value);
        return value;
      }
    }
    set(key, value) {
      if (this.cache.has(key)) {
        this.cache.set(key, value);
      } else {
        this._set(key, value);
      }
      return this;
    }
    has(key) {
      return this.cache.has(key) || this.oldCache.has(key);
    }
    peek(key) {
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }
      if (this.oldCache.has(key)) {
        return this.oldCache.get(key);
      }
    }
    delete(key) {
      const deleted = this.cache.delete(key);
      if (deleted) {
        this._size--;
      }
      return this.oldCache.delete(key) || deleted;
    }
    clear() {
      this.cache.clear();
      this.oldCache.clear();
      this._size = 0;
    }
    *keys() {
      for (const [key] of this) {
        yield key;
      }
    }
    *values() {
      for (const [, value] of this) {
        yield value;
      }
    }
    *[Symbol.iterator]() {
      for (const item of this.cache) {
        yield item;
      }
      for (const item of this.oldCache) {
        const [key] = item;
        if (!this.cache.has(key)) {
          yield item;
        }
      }
    }
    get size() {
      let oldCacheSize = 0;
      for (const key of this.oldCache.keys()) {
        if (!this.cache.has(key)) {
          oldCacheSize++;
        }
      }
      return this._size + oldCacheSize;
    }
  }
  var quickLru = QuickLRU;
  class Range {
    constructor(arg1, arg2) {
      this.ranges = arguments.length === 2 ? [{ min: arg1, max: arg2 }] : 0 in arg1 ? Object.assign({}, arg1) : [arg1];
    }
    min() {
      return this.ranges[0].min;
    }
    max() {
      return this.ranges[this.ranges.length - 1].max;
    }
    contains(pos) {
      for (let s = 0; s < this.ranges.length; s += 1) {
        const r = this.ranges[s];
        if (r.min <= pos && r.max >= pos) {
          return true;
        }
      }
      return false;
    }
    isContiguous() {
      return this.ranges.length > 1;
    }
    getRanges() {
      return this.ranges.map((r) => new Range(r.min, r.max));
    }
    toString() {
      return this.ranges.map((r) => `[${r.min}-${r.max}]`).join(",");
    }
    union(s1) {
      const ranges = this.getRanges().concat(s1.getRanges()).sort(this.rangeOrder);
      const oranges = [];
      let current = ranges[0];
      for (let i2 = 1; i2 < ranges.length; i2 += 1) {
        const nxt = ranges[i2];
        if (nxt.min() > current.max() + 1) {
          oranges.push(current);
          current = nxt;
        } else if (nxt.max() > current.max()) {
          current = new Range(current.min(), nxt.max());
        }
      }
      oranges.push(current);
      if (oranges.length === 1) {
        return oranges[0];
      }
      return new Range(oranges);
    }
    intersection(arg) {
      let s0 = this;
      let s1 = arg;
      const r0 = this.ranges();
      const r1 = s1.ranges();
      const l0 = r0.length;
      const l1 = r1.length;
      let i0 = 0;
      let i1 = 0;
      const or = [];
      while (i0 < l0 && i1 < l1) {
        s0 = r0[i0];
        s1 = r1[i1];
        const lapMin = Math.max(s0.min(), s1.min());
        const lapMax = Math.min(s0.max(), s1.max());
        if (lapMax >= lapMin) {
          or.push(new Range(lapMin, lapMax));
        }
        if (s0.max() > s1.max()) {
          i1 += 1;
        } else {
          i0 += 1;
        }
      }
      if (or.length === 0) {
        throw new Error("found range of length 0");
      }
      if (or.length === 1) {
        return or[0];
      }
      return new Range(or);
    }
    coverage() {
      let tot = 0;
      const rl = this.ranges();
      for (const r of rl) {
        tot += r.max() - r.min() + 1;
      }
      return tot;
    }
    rangeOrder(tmpa, tmpb) {
      let a = tmpa;
      let b = tmpb;
      if (arguments.length < 2) {
        b = a;
        a = this;
      }
      if (a.min() < b.min()) {
        return -1;
      }
      if (a.min() > b.min()) {
        return 1;
      }
      if (a.max() < b.max()) {
        return -1;
      }
      if (b.max() > a.max()) {
        return 1;
      }
      return 0;
    }
  }
  /*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
  const Z_FIXED$1 = 4;
  const Z_BINARY = 0;
  const Z_TEXT = 1;
  const Z_UNKNOWN$1 = 2;
  function zero$1(buf) {
    let len2 = buf.length;
    while (--len2 >= 0) {
      buf[len2] = 0;
    }
  }
  const STORED_BLOCK = 0;
  const STATIC_TREES = 1;
  const DYN_TREES = 2;
  const MIN_MATCH$1 = 3;
  const MAX_MATCH$1 = 258;
  const LENGTH_CODES$1 = 29;
  const LITERALS$1 = 256;
  const L_CODES$1 = LITERALS$1 + 1 + LENGTH_CODES$1;
  const D_CODES$1 = 30;
  const BL_CODES$1 = 19;
  const HEAP_SIZE$1 = 2 * L_CODES$1 + 1;
  const MAX_BITS$1 = 15;
  const Buf_size = 16;
  const MAX_BL_BITS = 7;
  const END_BLOCK = 256;
  const REP_3_6 = 16;
  const REPZ_3_10 = 17;
  const REPZ_11_138 = 18;
  const extra_lbits = (
    /* extra bits for each length code */
    new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0])
  );
  const extra_dbits = (
    /* extra bits for each distance code */
    new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13])
  );
  const extra_blbits = (
    /* extra bits for each bit length code */
    new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7])
  );
  const bl_order = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  const DIST_CODE_LEN = 512;
  const static_ltree = new Array((L_CODES$1 + 2) * 2);
  zero$1(static_ltree);
  const static_dtree = new Array(D_CODES$1 * 2);
  zero$1(static_dtree);
  const _dist_code = new Array(DIST_CODE_LEN);
  zero$1(_dist_code);
  const _length_code = new Array(MAX_MATCH$1 - MIN_MATCH$1 + 1);
  zero$1(_length_code);
  const base_length = new Array(LENGTH_CODES$1);
  zero$1(base_length);
  const base_dist = new Array(D_CODES$1);
  zero$1(base_dist);
  function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
    this.static_tree = static_tree;
    this.extra_bits = extra_bits;
    this.extra_base = extra_base;
    this.elems = elems;
    this.max_length = max_length;
    this.has_stree = static_tree && static_tree.length;
  }
  let static_l_desc;
  let static_d_desc;
  let static_bl_desc;
  function TreeDesc(dyn_tree, stat_desc) {
    this.dyn_tree = dyn_tree;
    this.max_code = 0;
    this.stat_desc = stat_desc;
  }
  const d_code = (dist) => {
    return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
  };
  const put_short = (s, w) => {
    s.pending_buf[s.pending++] = w & 255;
    s.pending_buf[s.pending++] = w >>> 8 & 255;
  };
  const send_bits = (s, value, length) => {
    if (s.bi_valid > Buf_size - length) {
      s.bi_buf |= value << s.bi_valid & 65535;
      put_short(s, s.bi_buf);
      s.bi_buf = value >> Buf_size - s.bi_valid;
      s.bi_valid += length - Buf_size;
    } else {
      s.bi_buf |= value << s.bi_valid & 65535;
      s.bi_valid += length;
    }
  };
  const send_code = (s, c, tree) => {
    send_bits(
      s,
      tree[c * 2],
      tree[c * 2 + 1]
      /*.Len*/
    );
  };
  const bi_reverse = (code2, len2) => {
    let res = 0;
    do {
      res |= code2 & 1;
      code2 >>>= 1;
      res <<= 1;
    } while (--len2 > 0);
    return res >>> 1;
  };
  const bi_flush = (s) => {
    if (s.bi_valid === 16) {
      put_short(s, s.bi_buf);
      s.bi_buf = 0;
      s.bi_valid = 0;
    } else if (s.bi_valid >= 8) {
      s.pending_buf[s.pending++] = s.bi_buf & 255;
      s.bi_buf >>= 8;
      s.bi_valid -= 8;
    }
  };
  const gen_bitlen = (s, desc) => {
    const tree = desc.dyn_tree;
    const max_code = desc.max_code;
    const stree = desc.stat_desc.static_tree;
    const has_stree = desc.stat_desc.has_stree;
    const extra = desc.stat_desc.extra_bits;
    const base = desc.stat_desc.extra_base;
    const max_length = desc.stat_desc.max_length;
    let h;
    let n, m;
    let bits;
    let xbits;
    let f;
    let overflow = 0;
    for (bits = 0; bits <= MAX_BITS$1; bits++) {
      s.bl_count[bits] = 0;
    }
    tree[s.heap[s.heap_max] * 2 + 1] = 0;
    for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
      n = s.heap[h];
      bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
      if (bits > max_length) {
        bits = max_length;
        overflow++;
      }
      tree[n * 2 + 1] = bits;
      if (n > max_code) {
        continue;
      }
      s.bl_count[bits]++;
      xbits = 0;
      if (n >= base) {
        xbits = extra[n - base];
      }
      f = tree[n * 2];
      s.opt_len += f * (bits + xbits);
      if (has_stree) {
        s.static_len += f * (stree[n * 2 + 1] + xbits);
      }
    }
    if (overflow === 0) {
      return;
    }
    do {
      bits = max_length - 1;
      while (s.bl_count[bits] === 0) {
        bits--;
      }
      s.bl_count[bits]--;
      s.bl_count[bits + 1] += 2;
      s.bl_count[max_length]--;
      overflow -= 2;
    } while (overflow > 0);
    for (bits = max_length; bits !== 0; bits--) {
      n = s.bl_count[bits];
      while (n !== 0) {
        m = s.heap[--h];
        if (m > max_code) {
          continue;
        }
        if (tree[m * 2 + 1] !== bits) {
          s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
          tree[m * 2 + 1] = bits;
        }
        n--;
      }
    }
  };
  const gen_codes = (tree, max_code, bl_count) => {
    const next_code = new Array(MAX_BITS$1 + 1);
    let code2 = 0;
    let bits;
    let n;
    for (bits = 1; bits <= MAX_BITS$1; bits++) {
      code2 = code2 + bl_count[bits - 1] << 1;
      next_code[bits] = code2;
    }
    for (n = 0; n <= max_code; n++) {
      let len2 = tree[n * 2 + 1];
      if (len2 === 0) {
        continue;
      }
      tree[n * 2] = bi_reverse(next_code[len2]++, len2);
    }
  };
  const tr_static_init = () => {
    let n;
    let bits;
    let length;
    let code2;
    let dist;
    const bl_count = new Array(MAX_BITS$1 + 1);
    length = 0;
    for (code2 = 0; code2 < LENGTH_CODES$1 - 1; code2++) {
      base_length[code2] = length;
      for (n = 0; n < 1 << extra_lbits[code2]; n++) {
        _length_code[length++] = code2;
      }
    }
    _length_code[length - 1] = code2;
    dist = 0;
    for (code2 = 0; code2 < 16; code2++) {
      base_dist[code2] = dist;
      for (n = 0; n < 1 << extra_dbits[code2]; n++) {
        _dist_code[dist++] = code2;
      }
    }
    dist >>= 7;
    for (; code2 < D_CODES$1; code2++) {
      base_dist[code2] = dist << 7;
      for (n = 0; n < 1 << extra_dbits[code2] - 7; n++) {
        _dist_code[256 + dist++] = code2;
      }
    }
    for (bits = 0; bits <= MAX_BITS$1; bits++) {
      bl_count[bits] = 0;
    }
    n = 0;
    while (n <= 143) {
      static_ltree[n * 2 + 1] = 8;
      n++;
      bl_count[8]++;
    }
    while (n <= 255) {
      static_ltree[n * 2 + 1] = 9;
      n++;
      bl_count[9]++;
    }
    while (n <= 279) {
      static_ltree[n * 2 + 1] = 7;
      n++;
      bl_count[7]++;
    }
    while (n <= 287) {
      static_ltree[n * 2 + 1] = 8;
      n++;
      bl_count[8]++;
    }
    gen_codes(static_ltree, L_CODES$1 + 1, bl_count);
    for (n = 0; n < D_CODES$1; n++) {
      static_dtree[n * 2 + 1] = 5;
      static_dtree[n * 2] = bi_reverse(n, 5);
    }
    static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS$1 + 1, L_CODES$1, MAX_BITS$1);
    static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES$1, MAX_BITS$1);
    static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES$1, MAX_BL_BITS);
  };
  const init_block = (s) => {
    let n;
    for (n = 0; n < L_CODES$1; n++) {
      s.dyn_ltree[n * 2] = 0;
    }
    for (n = 0; n < D_CODES$1; n++) {
      s.dyn_dtree[n * 2] = 0;
    }
    for (n = 0; n < BL_CODES$1; n++) {
      s.bl_tree[n * 2] = 0;
    }
    s.dyn_ltree[END_BLOCK * 2] = 1;
    s.opt_len = s.static_len = 0;
    s.sym_next = s.matches = 0;
  };
  const bi_windup = (s) => {
    if (s.bi_valid > 8) {
      put_short(s, s.bi_buf);
    } else if (s.bi_valid > 0) {
      s.pending_buf[s.pending++] = s.bi_buf;
    }
    s.bi_buf = 0;
    s.bi_valid = 0;
  };
  const smaller = (tree, n, m, depth) => {
    const _n2 = n * 2;
    const _m2 = m * 2;
    return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
  };
  const pqdownheap = (s, tree, k) => {
    const v = s.heap[k];
    let j = k << 1;
    while (j <= s.heap_len) {
      if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
        j++;
      }
      if (smaller(tree, v, s.heap[j], s.depth)) {
        break;
      }
      s.heap[k] = s.heap[j];
      k = j;
      j <<= 1;
    }
    s.heap[k] = v;
  };
  const compress_block = (s, ltree, dtree) => {
    let dist;
    let lc;
    let sx = 0;
    let code2;
    let extra;
    if (s.sym_next !== 0) {
      do {
        dist = s.pending_buf[s.sym_buf + sx++] & 255;
        dist += (s.pending_buf[s.sym_buf + sx++] & 255) << 8;
        lc = s.pending_buf[s.sym_buf + sx++];
        if (dist === 0) {
          send_code(s, lc, ltree);
        } else {
          code2 = _length_code[lc];
          send_code(s, code2 + LITERALS$1 + 1, ltree);
          extra = extra_lbits[code2];
          if (extra !== 0) {
            lc -= base_length[code2];
            send_bits(s, lc, extra);
          }
          dist--;
          code2 = d_code(dist);
          send_code(s, code2, dtree);
          extra = extra_dbits[code2];
          if (extra !== 0) {
            dist -= base_dist[code2];
            send_bits(s, dist, extra);
          }
        }
      } while (sx < s.sym_next);
    }
    send_code(s, END_BLOCK, ltree);
  };
  const build_tree = (s, desc) => {
    const tree = desc.dyn_tree;
    const stree = desc.stat_desc.static_tree;
    const has_stree = desc.stat_desc.has_stree;
    const elems = desc.stat_desc.elems;
    let n, m;
    let max_code = -1;
    let node;
    s.heap_len = 0;
    s.heap_max = HEAP_SIZE$1;
    for (n = 0; n < elems; n++) {
      if (tree[n * 2] !== 0) {
        s.heap[++s.heap_len] = max_code = n;
        s.depth[n] = 0;
      } else {
        tree[n * 2 + 1] = 0;
      }
    }
    while (s.heap_len < 2) {
      node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
      tree[node * 2] = 1;
      s.depth[node] = 0;
      s.opt_len--;
      if (has_stree) {
        s.static_len -= stree[node * 2 + 1];
      }
    }
    desc.max_code = max_code;
    for (n = s.heap_len >> 1; n >= 1; n--) {
      pqdownheap(s, tree, n);
    }
    node = elems;
    do {
      n = s.heap[
        1
        /*SMALLEST*/
      ];
      s.heap[
        1
        /*SMALLEST*/
      ] = s.heap[s.heap_len--];
      pqdownheap(
        s,
        tree,
        1
        /*SMALLEST*/
      );
      m = s.heap[
        1
        /*SMALLEST*/
      ];
      s.heap[--s.heap_max] = n;
      s.heap[--s.heap_max] = m;
      tree[node * 2] = tree[n * 2] + tree[m * 2];
      s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
      tree[n * 2 + 1] = tree[m * 2 + 1] = node;
      s.heap[
        1
        /*SMALLEST*/
      ] = node++;
      pqdownheap(
        s,
        tree,
        1
        /*SMALLEST*/
      );
    } while (s.heap_len >= 2);
    s.heap[--s.heap_max] = s.heap[
      1
      /*SMALLEST*/
    ];
    gen_bitlen(s, desc);
    gen_codes(tree, max_code, s.bl_count);
  };
  const scan_tree = (s, tree, max_code) => {
    let n;
    let prevlen = -1;
    let curlen;
    let nextlen = tree[0 * 2 + 1];
    let count = 0;
    let max_count = 7;
    let min_count = 4;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    }
    tree[(max_code + 1) * 2 + 1] = 65535;
    for (n = 0; n <= max_code; n++) {
      curlen = nextlen;
      nextlen = tree[(n + 1) * 2 + 1];
      if (++count < max_count && curlen === nextlen) {
        continue;
      } else if (count < min_count) {
        s.bl_tree[curlen * 2] += count;
      } else if (curlen !== 0) {
        if (curlen !== prevlen) {
          s.bl_tree[curlen * 2]++;
        }
        s.bl_tree[REP_3_6 * 2]++;
      } else if (count <= 10) {
        s.bl_tree[REPZ_3_10 * 2]++;
      } else {
        s.bl_tree[REPZ_11_138 * 2]++;
      }
      count = 0;
      prevlen = curlen;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen === nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  };
  const send_tree = (s, tree, max_code) => {
    let n;
    let prevlen = -1;
    let curlen;
    let nextlen = tree[0 * 2 + 1];
    let count = 0;
    let max_count = 7;
    let min_count = 4;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    }
    for (n = 0; n <= max_code; n++) {
      curlen = nextlen;
      nextlen = tree[(n + 1) * 2 + 1];
      if (++count < max_count && curlen === nextlen) {
        continue;
      } else if (count < min_count) {
        do {
          send_code(s, curlen, s.bl_tree);
        } while (--count !== 0);
      } else if (curlen !== 0) {
        if (curlen !== prevlen) {
          send_code(s, curlen, s.bl_tree);
          count--;
        }
        send_code(s, REP_3_6, s.bl_tree);
        send_bits(s, count - 3, 2);
      } else if (count <= 10) {
        send_code(s, REPZ_3_10, s.bl_tree);
        send_bits(s, count - 3, 3);
      } else {
        send_code(s, REPZ_11_138, s.bl_tree);
        send_bits(s, count - 11, 7);
      }
      count = 0;
      prevlen = curlen;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen === nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  };
  const build_bl_tree = (s) => {
    let max_blindex;
    scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
    scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
    build_tree(s, s.bl_desc);
    for (max_blindex = BL_CODES$1 - 1; max_blindex >= 3; max_blindex--) {
      if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
        break;
      }
    }
    s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
    return max_blindex;
  };
  const send_all_trees = (s, lcodes, dcodes, blcodes) => {
    let rank2;
    send_bits(s, lcodes - 257, 5);
    send_bits(s, dcodes - 1, 5);
    send_bits(s, blcodes - 4, 4);
    for (rank2 = 0; rank2 < blcodes; rank2++) {
      send_bits(s, s.bl_tree[bl_order[rank2] * 2 + 1], 3);
    }
    send_tree(s, s.dyn_ltree, lcodes - 1);
    send_tree(s, s.dyn_dtree, dcodes - 1);
  };
  const detect_data_type = (s) => {
    let block_mask = 4093624447;
    let n;
    for (n = 0; n <= 31; n++, block_mask >>>= 1) {
      if (block_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
        return Z_BINARY;
      }
    }
    if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
      return Z_TEXT;
    }
    for (n = 32; n < LITERALS$1; n++) {
      if (s.dyn_ltree[n * 2] !== 0) {
        return Z_TEXT;
      }
    }
    return Z_BINARY;
  };
  let static_init_done = false;
  const _tr_init$1 = (s) => {
    if (!static_init_done) {
      tr_static_init();
      static_init_done = true;
    }
    s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
    s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
    s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
    s.bi_buf = 0;
    s.bi_valid = 0;
    init_block(s);
  };
  const _tr_stored_block$1 = (s, buf, stored_len, last) => {
    send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
    bi_windup(s);
    put_short(s, stored_len);
    put_short(s, ~stored_len);
    if (stored_len) {
      s.pending_buf.set(s.window.subarray(buf, buf + stored_len), s.pending);
    }
    s.pending += stored_len;
  };
  const _tr_align$1 = (s) => {
    send_bits(s, STATIC_TREES << 1, 3);
    send_code(s, END_BLOCK, static_ltree);
    bi_flush(s);
  };
  const _tr_flush_block$1 = (s, buf, stored_len, last) => {
    let opt_lenb, static_lenb;
    let max_blindex = 0;
    if (s.level > 0) {
      if (s.strm.data_type === Z_UNKNOWN$1) {
        s.strm.data_type = detect_data_type(s);
      }
      build_tree(s, s.l_desc);
      build_tree(s, s.d_desc);
      max_blindex = build_bl_tree(s);
      opt_lenb = s.opt_len + 3 + 7 >>> 3;
      static_lenb = s.static_len + 3 + 7 >>> 3;
      if (static_lenb <= opt_lenb) {
        opt_lenb = static_lenb;
      }
    } else {
      opt_lenb = static_lenb = stored_len + 5;
    }
    if (stored_len + 4 <= opt_lenb && buf !== -1) {
      _tr_stored_block$1(s, buf, stored_len, last);
    } else if (s.strategy === Z_FIXED$1 || static_lenb === opt_lenb) {
      send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
      compress_block(s, static_ltree, static_dtree);
    } else {
      send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
      send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
      compress_block(s, s.dyn_ltree, s.dyn_dtree);
    }
    init_block(s);
    if (last) {
      bi_windup(s);
    }
  };
  const _tr_tally$1 = (s, dist, lc) => {
    s.pending_buf[s.sym_buf + s.sym_next++] = dist;
    s.pending_buf[s.sym_buf + s.sym_next++] = dist >> 8;
    s.pending_buf[s.sym_buf + s.sym_next++] = lc;
    if (dist === 0) {
      s.dyn_ltree[lc * 2]++;
    } else {
      s.matches++;
      dist--;
      s.dyn_ltree[(_length_code[lc] + LITERALS$1 + 1) * 2]++;
      s.dyn_dtree[d_code(dist) * 2]++;
    }
    return s.sym_next === s.sym_end;
  };
  var _tr_init_1 = _tr_init$1;
  var _tr_stored_block_1 = _tr_stored_block$1;
  var _tr_flush_block_1 = _tr_flush_block$1;
  var _tr_tally_1 = _tr_tally$1;
  var _tr_align_1 = _tr_align$1;
  var trees = {
    _tr_init: _tr_init_1,
    _tr_stored_block: _tr_stored_block_1,
    _tr_flush_block: _tr_flush_block_1,
    _tr_tally: _tr_tally_1,
    _tr_align: _tr_align_1
  };
  const adler32 = (adler, buf, len2, pos) => {
    let s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
    while (len2 !== 0) {
      n = len2 > 2e3 ? 2e3 : len2;
      len2 -= n;
      do {
        s1 = s1 + buf[pos++] | 0;
        s2 = s2 + s1 | 0;
      } while (--n);
      s1 %= 65521;
      s2 %= 65521;
    }
    return s1 | s2 << 16 | 0;
  };
  var adler32_1 = adler32;
  const makeTable = () => {
    let c, table = [];
    for (var n = 0; n < 256; n++) {
      c = n;
      for (var k = 0; k < 8; k++) {
        c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
      }
      table[n] = c;
    }
    return table;
  };
  const crcTable = new Uint32Array(makeTable());
  const crc32 = (crc, buf, len2, pos) => {
    const t = crcTable;
    const end = pos + len2;
    crc ^= -1;
    for (let i2 = pos; i2 < end; i2++) {
      crc = crc >>> 8 ^ t[(crc ^ buf[i2]) & 255];
    }
    return crc ^ -1;
  };
  var crc32_1 = crc32;
  var messages = {
    2: "need dictionary",
    /* Z_NEED_DICT       2  */
    1: "stream end",
    /* Z_STREAM_END      1  */
    0: "",
    /* Z_OK              0  */
    "-1": "file error",
    /* Z_ERRNO         (-1) */
    "-2": "stream error",
    /* Z_STREAM_ERROR  (-2) */
    "-3": "data error",
    /* Z_DATA_ERROR    (-3) */
    "-4": "insufficient memory",
    /* Z_MEM_ERROR     (-4) */
    "-5": "buffer error",
    /* Z_BUF_ERROR     (-5) */
    "-6": "incompatible version"
    /* Z_VERSION_ERROR (-6) */
  };
  var constants$2 = {
    /* Allowed flush values; see deflate() and inflate() below for details */
    Z_NO_FLUSH: 0,
    Z_PARTIAL_FLUSH: 1,
    Z_SYNC_FLUSH: 2,
    Z_FULL_FLUSH: 3,
    Z_FINISH: 4,
    Z_BLOCK: 5,
    Z_TREES: 6,
    /* Return codes for the compression/decompression functions. Negative values
    * are errors, positive values are used for special but normal events.
    */
    Z_OK: 0,
    Z_STREAM_END: 1,
    Z_NEED_DICT: 2,
    Z_ERRNO: -1,
    Z_STREAM_ERROR: -2,
    Z_DATA_ERROR: -3,
    Z_MEM_ERROR: -4,
    Z_BUF_ERROR: -5,
    //Z_VERSION_ERROR: -6,
    /* compression levels */
    Z_NO_COMPRESSION: 0,
    Z_BEST_SPEED: 1,
    Z_BEST_COMPRESSION: 9,
    Z_DEFAULT_COMPRESSION: -1,
    Z_FILTERED: 1,
    Z_HUFFMAN_ONLY: 2,
    Z_RLE: 3,
    Z_FIXED: 4,
    Z_DEFAULT_STRATEGY: 0,
    /* Possible values of the data_type field (though see inflate()) */
    Z_BINARY: 0,
    Z_TEXT: 1,
    //Z_ASCII:                1, // = Z_TEXT (deprecated)
    Z_UNKNOWN: 2,
    /* The deflate compression method */
    Z_DEFLATED: 8
    //Z_NULL:                 null // Use -1 or null inline, depending on var type
  };
  const { _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align } = trees;
  const {
    Z_NO_FLUSH: Z_NO_FLUSH$2,
    Z_PARTIAL_FLUSH,
    Z_FULL_FLUSH: Z_FULL_FLUSH$1,
    Z_FINISH: Z_FINISH$3,
    Z_BLOCK: Z_BLOCK$1,
    Z_OK: Z_OK$3,
    Z_STREAM_END: Z_STREAM_END$3,
    Z_STREAM_ERROR: Z_STREAM_ERROR$2,
    Z_DATA_ERROR: Z_DATA_ERROR$2,
    Z_BUF_ERROR: Z_BUF_ERROR$1,
    Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1,
    Z_FILTERED,
    Z_HUFFMAN_ONLY,
    Z_RLE,
    Z_FIXED,
    Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$1,
    Z_UNKNOWN,
    Z_DEFLATED: Z_DEFLATED$2
  } = constants$2;
  const MAX_MEM_LEVEL = 9;
  const MAX_WBITS$1 = 15;
  const DEF_MEM_LEVEL = 8;
  const LENGTH_CODES = 29;
  const LITERALS = 256;
  const L_CODES = LITERALS + 1 + LENGTH_CODES;
  const D_CODES = 30;
  const BL_CODES = 19;
  const HEAP_SIZE = 2 * L_CODES + 1;
  const MAX_BITS = 15;
  const MIN_MATCH = 3;
  const MAX_MATCH = 258;
  const MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
  const PRESET_DICT = 32;
  const INIT_STATE = 42;
  const GZIP_STATE = 57;
  const EXTRA_STATE = 69;
  const NAME_STATE = 73;
  const COMMENT_STATE = 91;
  const HCRC_STATE = 103;
  const BUSY_STATE = 113;
  const FINISH_STATE = 666;
  const BS_NEED_MORE = 1;
  const BS_BLOCK_DONE = 2;
  const BS_FINISH_STARTED = 3;
  const BS_FINISH_DONE = 4;
  const OS_CODE = 3;
  const err = (strm, errorCode) => {
    strm.msg = messages[errorCode];
    return errorCode;
  };
  const rank = (f) => {
    return f * 2 - (f > 4 ? 9 : 0);
  };
  const zero = (buf) => {
    let len2 = buf.length;
    while (--len2 >= 0) {
      buf[len2] = 0;
    }
  };
  const slide_hash = (s) => {
    let n, m;
    let p;
    let wsize = s.w_size;
    n = s.hash_size;
    p = n;
    do {
      m = s.head[--p];
      s.head[p] = m >= wsize ? m - wsize : 0;
    } while (--n);
    n = wsize;
    p = n;
    do {
      m = s.prev[--p];
      s.prev[p] = m >= wsize ? m - wsize : 0;
    } while (--n);
  };
  let HASH_ZLIB = (s, prev, data) => (prev << s.hash_shift ^ data) & s.hash_mask;
  let HASH = HASH_ZLIB;
  const flush_pending = (strm) => {
    const s = strm.state;
    let len2 = s.pending;
    if (len2 > strm.avail_out) {
      len2 = strm.avail_out;
    }
    if (len2 === 0) {
      return;
    }
    strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len2), strm.next_out);
    strm.next_out += len2;
    s.pending_out += len2;
    strm.total_out += len2;
    strm.avail_out -= len2;
    s.pending -= len2;
    if (s.pending === 0) {
      s.pending_out = 0;
    }
  };
  const flush_block_only = (s, last) => {
    _tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
    s.block_start = s.strstart;
    flush_pending(s.strm);
  };
  const put_byte = (s, b) => {
    s.pending_buf[s.pending++] = b;
  };
  const putShortMSB = (s, b) => {
    s.pending_buf[s.pending++] = b >>> 8 & 255;
    s.pending_buf[s.pending++] = b & 255;
  };
  const read_buf = (strm, buf, start, size) => {
    let len2 = strm.avail_in;
    if (len2 > size) {
      len2 = size;
    }
    if (len2 === 0) {
      return 0;
    }
    strm.avail_in -= len2;
    buf.set(strm.input.subarray(strm.next_in, strm.next_in + len2), start);
    if (strm.state.wrap === 1) {
      strm.adler = adler32_1(strm.adler, buf, len2, start);
    } else if (strm.state.wrap === 2) {
      strm.adler = crc32_1(strm.adler, buf, len2, start);
    }
    strm.next_in += len2;
    strm.total_in += len2;
    return len2;
  };
  const longest_match = (s, cur_match) => {
    let chain_length = s.max_chain_length;
    let scan = s.strstart;
    let match;
    let len2;
    let best_len = s.prev_length;
    let nice_match = s.nice_match;
    const limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
    const _win = s.window;
    const wmask = s.w_mask;
    const prev = s.prev;
    const strend = s.strstart + MAX_MATCH;
    let scan_end1 = _win[scan + best_len - 1];
    let scan_end = _win[scan + best_len];
    if (s.prev_length >= s.good_match) {
      chain_length >>= 2;
    }
    if (nice_match > s.lookahead) {
      nice_match = s.lookahead;
    }
    do {
      match = cur_match;
      if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
        continue;
      }
      scan += 2;
      match++;
      do {
      } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
      len2 = MAX_MATCH - (strend - scan);
      scan = strend - MAX_MATCH;
      if (len2 > best_len) {
        s.match_start = cur_match;
        best_len = len2;
        if (len2 >= nice_match) {
          break;
        }
        scan_end1 = _win[scan + best_len - 1];
        scan_end = _win[scan + best_len];
      }
    } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
    if (best_len <= s.lookahead) {
      return best_len;
    }
    return s.lookahead;
  };
  const fill_window = (s) => {
    const _w_size = s.w_size;
    let n, more, str;
    do {
      more = s.window_size - s.lookahead - s.strstart;
      if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
        s.window.set(s.window.subarray(_w_size, _w_size + _w_size - more), 0);
        s.match_start -= _w_size;
        s.strstart -= _w_size;
        s.block_start -= _w_size;
        if (s.insert > s.strstart) {
          s.insert = s.strstart;
        }
        slide_hash(s);
        more += _w_size;
      }
      if (s.strm.avail_in === 0) {
        break;
      }
      n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
      s.lookahead += n;
      if (s.lookahead + s.insert >= MIN_MATCH) {
        str = s.strstart - s.insert;
        s.ins_h = s.window[str];
        s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
        while (s.insert) {
          s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
          s.prev[str & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = str;
          str++;
          s.insert--;
          if (s.lookahead + s.insert < MIN_MATCH) {
            break;
          }
        }
      }
    } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
  };
  const deflate_stored = (s, flush) => {
    let min_block = s.pending_buf_size - 5 > s.w_size ? s.w_size : s.pending_buf_size - 5;
    let len2, left, have, last = 0;
    let used = s.strm.avail_in;
    do {
      len2 = 65535;
      have = s.bi_valid + 42 >> 3;
      if (s.strm.avail_out < have) {
        break;
      }
      have = s.strm.avail_out - have;
      left = s.strstart - s.block_start;
      if (len2 > left + s.strm.avail_in) {
        len2 = left + s.strm.avail_in;
      }
      if (len2 > have) {
        len2 = have;
      }
      if (len2 < min_block && (len2 === 0 && flush !== Z_FINISH$3 || flush === Z_NO_FLUSH$2 || len2 !== left + s.strm.avail_in)) {
        break;
      }
      last = flush === Z_FINISH$3 && len2 === left + s.strm.avail_in ? 1 : 0;
      _tr_stored_block(s, 0, 0, last);
      s.pending_buf[s.pending - 4] = len2;
      s.pending_buf[s.pending - 3] = len2 >> 8;
      s.pending_buf[s.pending - 2] = ~len2;
      s.pending_buf[s.pending - 1] = ~len2 >> 8;
      flush_pending(s.strm);
      if (left) {
        if (left > len2) {
          left = len2;
        }
        s.strm.output.set(s.window.subarray(s.block_start, s.block_start + left), s.strm.next_out);
        s.strm.next_out += left;
        s.strm.avail_out -= left;
        s.strm.total_out += left;
        s.block_start += left;
        len2 -= left;
      }
      if (len2) {
        read_buf(s.strm, s.strm.output, s.strm.next_out, len2);
        s.strm.next_out += len2;
        s.strm.avail_out -= len2;
        s.strm.total_out += len2;
      }
    } while (last === 0);
    used -= s.strm.avail_in;
    if (used) {
      if (used >= s.w_size) {
        s.matches = 2;
        s.window.set(s.strm.input.subarray(s.strm.next_in - s.w_size, s.strm.next_in), 0);
        s.strstart = s.w_size;
        s.insert = s.strstart;
      } else {
        if (s.window_size - s.strstart <= used) {
          s.strstart -= s.w_size;
          s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
          if (s.matches < 2) {
            s.matches++;
          }
          if (s.insert > s.strstart) {
            s.insert = s.strstart;
          }
        }
        s.window.set(s.strm.input.subarray(s.strm.next_in - used, s.strm.next_in), s.strstart);
        s.strstart += used;
        s.insert += used > s.w_size - s.insert ? s.w_size - s.insert : used;
      }
      s.block_start = s.strstart;
    }
    if (s.high_water < s.strstart) {
      s.high_water = s.strstart;
    }
    if (last) {
      return BS_FINISH_DONE;
    }
    if (flush !== Z_NO_FLUSH$2 && flush !== Z_FINISH$3 && s.strm.avail_in === 0 && s.strstart === s.block_start) {
      return BS_BLOCK_DONE;
    }
    have = s.window_size - s.strstart;
    if (s.strm.avail_in > have && s.block_start >= s.w_size) {
      s.block_start -= s.w_size;
      s.strstart -= s.w_size;
      s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
      if (s.matches < 2) {
        s.matches++;
      }
      have += s.w_size;
      if (s.insert > s.strstart) {
        s.insert = s.strstart;
      }
    }
    if (have > s.strm.avail_in) {
      have = s.strm.avail_in;
    }
    if (have) {
      read_buf(s.strm, s.window, s.strstart, have);
      s.strstart += have;
      s.insert += have > s.w_size - s.insert ? s.w_size - s.insert : have;
    }
    if (s.high_water < s.strstart) {
      s.high_water = s.strstart;
    }
    have = s.bi_valid + 42 >> 3;
    have = s.pending_buf_size - have > 65535 ? 65535 : s.pending_buf_size - have;
    min_block = have > s.w_size ? s.w_size : have;
    left = s.strstart - s.block_start;
    if (left >= min_block || (left || flush === Z_FINISH$3) && flush !== Z_NO_FLUSH$2 && s.strm.avail_in === 0 && left <= have) {
      len2 = left > have ? have : left;
      last = flush === Z_FINISH$3 && s.strm.avail_in === 0 && len2 === left ? 1 : 0;
      _tr_stored_block(s, s.block_start, len2, last);
      s.block_start += len2;
      flush_pending(s.strm);
    }
    return last ? BS_FINISH_STARTED : BS_NEED_MORE;
  };
  const deflate_fast = (s, flush) => {
    let hash_head;
    let bflush;
    for (; ; ) {
      if (s.lookahead < MIN_LOOKAHEAD) {
        fill_window(s);
        if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break;
        }
      }
      hash_head = 0;
      if (s.lookahead >= MIN_MATCH) {
        s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
        hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = s.strstart;
      }
      if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
        s.match_length = longest_match(s, hash_head);
      }
      if (s.match_length >= MIN_MATCH) {
        bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
        s.lookahead -= s.match_length;
        if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
          s.match_length--;
          do {
            s.strstart++;
            s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          } while (--s.match_length !== 0);
          s.strstart++;
        } else {
          s.strstart += s.match_length;
          s.match_length = 0;
          s.ins_h = s.window[s.strstart];
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);
        }
      } else {
        bflush = _tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
      }
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    }
    s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
    if (flush === Z_FINISH$3) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.sym_next) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_BLOCK_DONE;
  };
  const deflate_slow = (s, flush) => {
    let hash_head;
    let bflush;
    let max_insert;
    for (; ; ) {
      if (s.lookahead < MIN_LOOKAHEAD) {
        fill_window(s);
        if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break;
        }
      }
      hash_head = 0;
      if (s.lookahead >= MIN_MATCH) {
        s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
        hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = s.strstart;
      }
      s.prev_length = s.match_length;
      s.prev_match = s.match_start;
      s.match_length = MIN_MATCH - 1;
      if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
        s.match_length = longest_match(s, hash_head);
        if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
          s.match_length = MIN_MATCH - 1;
        }
      }
      if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
        max_insert = s.strstart + s.lookahead - MIN_MATCH;
        bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
        s.lookahead -= s.prev_length - 1;
        s.prev_length -= 2;
        do {
          if (++s.strstart <= max_insert) {
            s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          }
        } while (--s.prev_length !== 0);
        s.match_available = 0;
        s.match_length = MIN_MATCH - 1;
        s.strstart++;
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      } else if (s.match_available) {
        bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
        if (bflush) {
          flush_block_only(s, false);
        }
        s.strstart++;
        s.lookahead--;
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      } else {
        s.match_available = 1;
        s.strstart++;
        s.lookahead--;
      }
    }
    if (s.match_available) {
      bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
      s.match_available = 0;
    }
    s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
    if (flush === Z_FINISH$3) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.sym_next) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_BLOCK_DONE;
  };
  const deflate_rle = (s, flush) => {
    let bflush;
    let prev;
    let scan, strend;
    const _win = s.window;
    for (; ; ) {
      if (s.lookahead <= MAX_MATCH) {
        fill_window(s);
        if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH$2) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break;
        }
      }
      s.match_length = 0;
      if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
        scan = s.strstart - 1;
        prev = _win[scan];
        if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
          strend = s.strstart + MAX_MATCH;
          do {
          } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
          s.match_length = MAX_MATCH - (strend - scan);
          if (s.match_length > s.lookahead) {
            s.match_length = s.lookahead;
          }
        }
      }
      if (s.match_length >= MIN_MATCH) {
        bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);
        s.lookahead -= s.match_length;
        s.strstart += s.match_length;
        s.match_length = 0;
      } else {
        bflush = _tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
      }
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    }
    s.insert = 0;
    if (flush === Z_FINISH$3) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.sym_next) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_BLOCK_DONE;
  };
  const deflate_huff = (s, flush) => {
    let bflush;
    for (; ; ) {
      if (s.lookahead === 0) {
        fill_window(s);
        if (s.lookahead === 0) {
          if (flush === Z_NO_FLUSH$2) {
            return BS_NEED_MORE;
          }
          break;
        }
      }
      s.match_length = 0;
      bflush = _tr_tally(s, 0, s.window[s.strstart]);
      s.lookahead--;
      s.strstart++;
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    }
    s.insert = 0;
    if (flush === Z_FINISH$3) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.sym_next) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_BLOCK_DONE;
  };
  function Config(good_length, max_lazy, nice_length, max_chain, func) {
    this.good_length = good_length;
    this.max_lazy = max_lazy;
    this.nice_length = nice_length;
    this.max_chain = max_chain;
    this.func = func;
  }
  const configuration_table = [
    /*      good lazy nice chain */
    new Config(0, 0, 0, 0, deflate_stored),
    /* 0 store only */
    new Config(4, 4, 8, 4, deflate_fast),
    /* 1 max speed, no lazy matches */
    new Config(4, 5, 16, 8, deflate_fast),
    /* 2 */
    new Config(4, 6, 32, 32, deflate_fast),
    /* 3 */
    new Config(4, 4, 16, 16, deflate_slow),
    /* 4 lazy matches */
    new Config(8, 16, 32, 32, deflate_slow),
    /* 5 */
    new Config(8, 16, 128, 128, deflate_slow),
    /* 6 */
    new Config(8, 32, 128, 256, deflate_slow),
    /* 7 */
    new Config(32, 128, 258, 1024, deflate_slow),
    /* 8 */
    new Config(32, 258, 258, 4096, deflate_slow)
    /* 9 max compression */
  ];
  const lm_init = (s) => {
    s.window_size = 2 * s.w_size;
    zero(s.head);
    s.max_lazy_match = configuration_table[s.level].max_lazy;
    s.good_match = configuration_table[s.level].good_length;
    s.nice_match = configuration_table[s.level].nice_length;
    s.max_chain_length = configuration_table[s.level].max_chain;
    s.strstart = 0;
    s.block_start = 0;
    s.lookahead = 0;
    s.insert = 0;
    s.match_length = s.prev_length = MIN_MATCH - 1;
    s.match_available = 0;
    s.ins_h = 0;
  };
  function DeflateState() {
    this.strm = null;
    this.status = 0;
    this.pending_buf = null;
    this.pending_buf_size = 0;
    this.pending_out = 0;
    this.pending = 0;
    this.wrap = 0;
    this.gzhead = null;
    this.gzindex = 0;
    this.method = Z_DEFLATED$2;
    this.last_flush = -1;
    this.w_size = 0;
    this.w_bits = 0;
    this.w_mask = 0;
    this.window = null;
    this.window_size = 0;
    this.prev = null;
    this.head = null;
    this.ins_h = 0;
    this.hash_size = 0;
    this.hash_bits = 0;
    this.hash_mask = 0;
    this.hash_shift = 0;
    this.block_start = 0;
    this.match_length = 0;
    this.prev_match = 0;
    this.match_available = 0;
    this.strstart = 0;
    this.match_start = 0;
    this.lookahead = 0;
    this.prev_length = 0;
    this.max_chain_length = 0;
    this.max_lazy_match = 0;
    this.level = 0;
    this.strategy = 0;
    this.good_match = 0;
    this.nice_match = 0;
    this.dyn_ltree = new Uint16Array(HEAP_SIZE * 2);
    this.dyn_dtree = new Uint16Array((2 * D_CODES + 1) * 2);
    this.bl_tree = new Uint16Array((2 * BL_CODES + 1) * 2);
    zero(this.dyn_ltree);
    zero(this.dyn_dtree);
    zero(this.bl_tree);
    this.l_desc = null;
    this.d_desc = null;
    this.bl_desc = null;
    this.bl_count = new Uint16Array(MAX_BITS + 1);
    this.heap = new Uint16Array(2 * L_CODES + 1);
    zero(this.heap);
    this.heap_len = 0;
    this.heap_max = 0;
    this.depth = new Uint16Array(2 * L_CODES + 1);
    zero(this.depth);
    this.sym_buf = 0;
    this.lit_bufsize = 0;
    this.sym_next = 0;
    this.sym_end = 0;
    this.opt_len = 0;
    this.static_len = 0;
    this.matches = 0;
    this.insert = 0;
    this.bi_buf = 0;
    this.bi_valid = 0;
  }
  const deflateStateCheck = (strm) => {
    if (!strm) {
      return 1;
    }
    const s = strm.state;
    if (!s || s.strm !== strm || s.status !== INIT_STATE && //#ifdef GZIP
    s.status !== GZIP_STATE && //#endif
    s.status !== EXTRA_STATE && s.status !== NAME_STATE && s.status !== COMMENT_STATE && s.status !== HCRC_STATE && s.status !== BUSY_STATE && s.status !== FINISH_STATE) {
      return 1;
    }
    return 0;
  };
  const deflateResetKeep = (strm) => {
    if (deflateStateCheck(strm)) {
      return err(strm, Z_STREAM_ERROR$2);
    }
    strm.total_in = strm.total_out = 0;
    strm.data_type = Z_UNKNOWN;
    const s = strm.state;
    s.pending = 0;
    s.pending_out = 0;
    if (s.wrap < 0) {
      s.wrap = -s.wrap;
    }
    s.status = //#ifdef GZIP
    s.wrap === 2 ? GZIP_STATE : (
      //#endif
      s.wrap ? INIT_STATE : BUSY_STATE
    );
    strm.adler = s.wrap === 2 ? 0 : 1;
    s.last_flush = -2;
    _tr_init(s);
    return Z_OK$3;
  };
  const deflateReset = (strm) => {
    const ret = deflateResetKeep(strm);
    if (ret === Z_OK$3) {
      lm_init(strm.state);
    }
    return ret;
  };
  const deflateSetHeader = (strm, head) => {
    if (deflateStateCheck(strm) || strm.state.wrap !== 2) {
      return Z_STREAM_ERROR$2;
    }
    strm.state.gzhead = head;
    return Z_OK$3;
  };
  const deflateInit2 = (strm, level, method, windowBits, memLevel, strategy) => {
    if (!strm) {
      return Z_STREAM_ERROR$2;
    }
    let wrap = 1;
    if (level === Z_DEFAULT_COMPRESSION$1) {
      level = 6;
    }
    if (windowBits < 0) {
      wrap = 0;
      windowBits = -windowBits;
    } else if (windowBits > 15) {
      wrap = 2;
      windowBits -= 16;
    }
    if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED$2 || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED || windowBits === 8 && wrap !== 1) {
      return err(strm, Z_STREAM_ERROR$2);
    }
    if (windowBits === 8) {
      windowBits = 9;
    }
    const s = new DeflateState();
    strm.state = s;
    s.strm = strm;
    s.status = INIT_STATE;
    s.wrap = wrap;
    s.gzhead = null;
    s.w_bits = windowBits;
    s.w_size = 1 << s.w_bits;
    s.w_mask = s.w_size - 1;
    s.hash_bits = memLevel + 7;
    s.hash_size = 1 << s.hash_bits;
    s.hash_mask = s.hash_size - 1;
    s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
    s.window = new Uint8Array(s.w_size * 2);
    s.head = new Uint16Array(s.hash_size);
    s.prev = new Uint16Array(s.w_size);
    s.lit_bufsize = 1 << memLevel + 6;
    s.pending_buf_size = s.lit_bufsize * 4;
    s.pending_buf = new Uint8Array(s.pending_buf_size);
    s.sym_buf = s.lit_bufsize;
    s.sym_end = (s.lit_bufsize - 1) * 3;
    s.level = level;
    s.strategy = strategy;
    s.method = method;
    return deflateReset(strm);
  };
  const deflateInit = (strm, level) => {
    return deflateInit2(strm, level, Z_DEFLATED$2, MAX_WBITS$1, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY$1);
  };
  const deflate$2 = (strm, flush) => {
    if (deflateStateCheck(strm) || flush > Z_BLOCK$1 || flush < 0) {
      return strm ? err(strm, Z_STREAM_ERROR$2) : Z_STREAM_ERROR$2;
    }
    const s = strm.state;
    if (!strm.output || strm.avail_in !== 0 && !strm.input || s.status === FINISH_STATE && flush !== Z_FINISH$3) {
      return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR$1 : Z_STREAM_ERROR$2);
    }
    const old_flush = s.last_flush;
    s.last_flush = flush;
    if (s.pending !== 0) {
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        return Z_OK$3;
      }
    } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH$3) {
      return err(strm, Z_BUF_ERROR$1);
    }
    if (s.status === FINISH_STATE && strm.avail_in !== 0) {
      return err(strm, Z_BUF_ERROR$1);
    }
    if (s.status === INIT_STATE && s.wrap === 0) {
      s.status = BUSY_STATE;
    }
    if (s.status === INIT_STATE) {
      let header = Z_DEFLATED$2 + (s.w_bits - 8 << 4) << 8;
      let level_flags = -1;
      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
        level_flags = 0;
      } else if (s.level < 6) {
        level_flags = 1;
      } else if (s.level === 6) {
        level_flags = 2;
      } else {
        level_flags = 3;
      }
      header |= level_flags << 6;
      if (s.strstart !== 0) {
        header |= PRESET_DICT;
      }
      header += 31 - header % 31;
      putShortMSB(s, header);
      if (s.strstart !== 0) {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 65535);
      }
      strm.adler = 1;
      s.status = BUSY_STATE;
      flush_pending(strm);
      if (s.pending !== 0) {
        s.last_flush = -1;
        return Z_OK$3;
      }
    }
    if (s.status === GZIP_STATE) {
      strm.adler = 0;
      put_byte(s, 31);
      put_byte(s, 139);
      put_byte(s, 8);
      if (!s.gzhead) {
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
        put_byte(s, OS_CODE);
        s.status = BUSY_STATE;
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
      } else {
        put_byte(
          s,
          (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
        );
        put_byte(s, s.gzhead.time & 255);
        put_byte(s, s.gzhead.time >> 8 & 255);
        put_byte(s, s.gzhead.time >> 16 & 255);
        put_byte(s, s.gzhead.time >> 24 & 255);
        put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
        put_byte(s, s.gzhead.os & 255);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte(s, s.gzhead.extra.length & 255);
          put_byte(s, s.gzhead.extra.length >> 8 & 255);
        }
        if (s.gzhead.hcrc) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
        }
        s.gzindex = 0;
        s.status = EXTRA_STATE;
      }
    }
    if (s.status === EXTRA_STATE) {
      if (s.gzhead.extra) {
        let beg = s.pending;
        let left = (s.gzhead.extra.length & 65535) - s.gzindex;
        while (s.pending + left > s.pending_buf_size) {
          let copy2 = s.pending_buf_size - s.pending;
          s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy2), s.pending);
          s.pending = s.pending_buf_size;
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          s.gzindex += copy2;
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK$3;
          }
          beg = 0;
          left -= copy2;
        }
        let gzhead_extra = new Uint8Array(s.gzhead.extra);
        s.pending_buf.set(gzhead_extra.subarray(s.gzindex, s.gzindex + left), s.pending);
        s.pending += left;
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        s.gzindex = 0;
      }
      s.status = NAME_STATE;
    }
    if (s.status === NAME_STATE) {
      if (s.gzhead.name) {
        let beg = s.pending;
        let val;
        do {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            if (s.pending !== 0) {
              s.last_flush = -1;
              return Z_OK$3;
            }
            beg = 0;
          }
          if (s.gzindex < s.gzhead.name.length) {
            val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
          } else {
            val = 0;
          }
          put_byte(s, val);
        } while (val !== 0);
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        s.gzindex = 0;
      }
      s.status = COMMENT_STATE;
    }
    if (s.status === COMMENT_STATE) {
      if (s.gzhead.comment) {
        let beg = s.pending;
        let val;
        do {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            if (s.pending !== 0) {
              s.last_flush = -1;
              return Z_OK$3;
            }
            beg = 0;
          }
          if (s.gzindex < s.gzhead.comment.length) {
            val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
          } else {
            val = 0;
          }
          put_byte(s, val);
        } while (val !== 0);
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
      }
      s.status = HCRC_STATE;
    }
    if (s.status === HCRC_STATE) {
      if (s.gzhead.hcrc) {
        if (s.pending + 2 > s.pending_buf_size) {
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK$3;
          }
        }
        put_byte(s, strm.adler & 255);
        put_byte(s, strm.adler >> 8 & 255);
        strm.adler = 0;
      }
      s.status = BUSY_STATE;
      flush_pending(strm);
      if (s.pending !== 0) {
        s.last_flush = -1;
        return Z_OK$3;
      }
    }
    if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH$2 && s.status !== FINISH_STATE) {
      let bstate = s.level === 0 ? deflate_stored(s, flush) : s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
      if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
        s.status = FINISH_STATE;
      }
      if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
        if (strm.avail_out === 0) {
          s.last_flush = -1;
        }
        return Z_OK$3;
      }
      if (bstate === BS_BLOCK_DONE) {
        if (flush === Z_PARTIAL_FLUSH) {
          _tr_align(s);
        } else if (flush !== Z_BLOCK$1) {
          _tr_stored_block(s, 0, 0, false);
          if (flush === Z_FULL_FLUSH$1) {
            zero(s.head);
            if (s.lookahead === 0) {
              s.strstart = 0;
              s.block_start = 0;
              s.insert = 0;
            }
          }
        }
        flush_pending(strm);
        if (strm.avail_out === 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
      }
    }
    if (flush !== Z_FINISH$3) {
      return Z_OK$3;
    }
    if (s.wrap <= 0) {
      return Z_STREAM_END$3;
    }
    if (s.wrap === 2) {
      put_byte(s, strm.adler & 255);
      put_byte(s, strm.adler >> 8 & 255);
      put_byte(s, strm.adler >> 16 & 255);
      put_byte(s, strm.adler >> 24 & 255);
      put_byte(s, strm.total_in & 255);
      put_byte(s, strm.total_in >> 8 & 255);
      put_byte(s, strm.total_in >> 16 & 255);
      put_byte(s, strm.total_in >> 24 & 255);
    } else {
      putShortMSB(s, strm.adler >>> 16);
      putShortMSB(s, strm.adler & 65535);
    }
    flush_pending(strm);
    if (s.wrap > 0) {
      s.wrap = -s.wrap;
    }
    return s.pending !== 0 ? Z_OK$3 : Z_STREAM_END$3;
  };
  const deflateEnd = (strm) => {
    if (deflateStateCheck(strm)) {
      return Z_STREAM_ERROR$2;
    }
    const status = strm.state.status;
    strm.state = null;
    return status === BUSY_STATE ? err(strm, Z_DATA_ERROR$2) : Z_OK$3;
  };
  const deflateSetDictionary = (strm, dictionary) => {
    let dictLength = dictionary.length;
    if (deflateStateCheck(strm)) {
      return Z_STREAM_ERROR$2;
    }
    const s = strm.state;
    const wrap = s.wrap;
    if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
      return Z_STREAM_ERROR$2;
    }
    if (wrap === 1) {
      strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
    }
    s.wrap = 0;
    if (dictLength >= s.w_size) {
      if (wrap === 0) {
        zero(s.head);
        s.strstart = 0;
        s.block_start = 0;
        s.insert = 0;
      }
      let tmpDict = new Uint8Array(s.w_size);
      tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
      dictionary = tmpDict;
      dictLength = s.w_size;
    }
    const avail = strm.avail_in;
    const next = strm.next_in;
    const input = strm.input;
    strm.avail_in = dictLength;
    strm.next_in = 0;
    strm.input = dictionary;
    fill_window(s);
    while (s.lookahead >= MIN_MATCH) {
      let str = s.strstart;
      let n = s.lookahead - (MIN_MATCH - 1);
      do {
        s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
      } while (--n);
      s.strstart = str;
      s.lookahead = MIN_MATCH - 1;
      fill_window(s);
    }
    s.strstart += s.lookahead;
    s.block_start = s.strstart;
    s.insert = s.lookahead;
    s.lookahead = 0;
    s.match_length = s.prev_length = MIN_MATCH - 1;
    s.match_available = 0;
    strm.next_in = next;
    strm.input = input;
    strm.avail_in = avail;
    s.wrap = wrap;
    return Z_OK$3;
  };
  var deflateInit_1 = deflateInit;
  var deflateInit2_1 = deflateInit2;
  var deflateReset_1 = deflateReset;
  var deflateResetKeep_1 = deflateResetKeep;
  var deflateSetHeader_1 = deflateSetHeader;
  var deflate_2$1 = deflate$2;
  var deflateEnd_1 = deflateEnd;
  var deflateSetDictionary_1 = deflateSetDictionary;
  var deflateInfo = "pako deflate (from Nodeca project)";
  var deflate_1$2 = {
    deflateInit: deflateInit_1,
    deflateInit2: deflateInit2_1,
    deflateReset: deflateReset_1,
    deflateResetKeep: deflateResetKeep_1,
    deflateSetHeader: deflateSetHeader_1,
    deflate: deflate_2$1,
    deflateEnd: deflateEnd_1,
    deflateSetDictionary: deflateSetDictionary_1,
    deflateInfo
  };
  const _has = (obj, key) => {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };
  var assign = function(obj) {
    const sources = Array.prototype.slice.call(arguments, 1);
    while (sources.length) {
      const source = sources.shift();
      if (!source) {
        continue;
      }
      if (typeof source !== "object") {
        throw new TypeError(source + "must be non-object");
      }
      for (const p in source) {
        if (_has(source, p)) {
          obj[p] = source[p];
        }
      }
    }
    return obj;
  };
  var flattenChunks = (chunks) => {
    let len2 = 0;
    for (let i2 = 0, l = chunks.length; i2 < l; i2++) {
      len2 += chunks[i2].length;
    }
    const result = new Uint8Array(len2);
    for (let i2 = 0, pos = 0, l = chunks.length; i2 < l; i2++) {
      let chunk = chunks[i2];
      result.set(chunk, pos);
      pos += chunk.length;
    }
    return result;
  };
  var common = {
    assign,
    flattenChunks
  };
  let STR_APPLY_UIA_OK = true;
  try {
    String.fromCharCode.apply(null, new Uint8Array(1));
  } catch (__) {
    STR_APPLY_UIA_OK = false;
  }
  const _utf8len = new Uint8Array(256);
  for (let q = 0; q < 256; q++) {
    _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
  }
  _utf8len[254] = _utf8len[254] = 1;
  var string2buf = (str) => {
    if (typeof TextEncoder === "function" && TextEncoder.prototype.encode) {
      return new TextEncoder().encode(str);
    }
    let buf, c, c2, m_pos, i2, str_len = str.length, buf_len = 0;
    for (m_pos = 0; m_pos < str_len; m_pos++) {
      c = str.charCodeAt(m_pos);
      if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
        c2 = str.charCodeAt(m_pos + 1);
        if ((c2 & 64512) === 56320) {
          c = 65536 + (c - 55296 << 10) + (c2 - 56320);
          m_pos++;
        }
      }
      buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
    }
    buf = new Uint8Array(buf_len);
    for (i2 = 0, m_pos = 0; i2 < buf_len; m_pos++) {
      c = str.charCodeAt(m_pos);
      if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
        c2 = str.charCodeAt(m_pos + 1);
        if ((c2 & 64512) === 56320) {
          c = 65536 + (c - 55296 << 10) + (c2 - 56320);
          m_pos++;
        }
      }
      if (c < 128) {
        buf[i2++] = c;
      } else if (c < 2048) {
        buf[i2++] = 192 | c >>> 6;
        buf[i2++] = 128 | c & 63;
      } else if (c < 65536) {
        buf[i2++] = 224 | c >>> 12;
        buf[i2++] = 128 | c >>> 6 & 63;
        buf[i2++] = 128 | c & 63;
      } else {
        buf[i2++] = 240 | c >>> 18;
        buf[i2++] = 128 | c >>> 12 & 63;
        buf[i2++] = 128 | c >>> 6 & 63;
        buf[i2++] = 128 | c & 63;
      }
    }
    return buf;
  };
  const buf2binstring = (buf, len2) => {
    if (len2 < 65534) {
      if (buf.subarray && STR_APPLY_UIA_OK) {
        return String.fromCharCode.apply(null, buf.length === len2 ? buf : buf.subarray(0, len2));
      }
    }
    let result = "";
    for (let i2 = 0; i2 < len2; i2++) {
      result += String.fromCharCode(buf[i2]);
    }
    return result;
  };
  var buf2string = (buf, max2) => {
    const len2 = max2 || buf.length;
    if (typeof TextDecoder === "function" && TextDecoder.prototype.decode) {
      return new TextDecoder().decode(buf.subarray(0, max2));
    }
    let i2, out;
    const utf16buf = new Array(len2 * 2);
    for (out = 0, i2 = 0; i2 < len2; ) {
      let c = buf[i2++];
      if (c < 128) {
        utf16buf[out++] = c;
        continue;
      }
      let c_len = _utf8len[c];
      if (c_len > 4) {
        utf16buf[out++] = 65533;
        i2 += c_len - 1;
        continue;
      }
      c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
      while (c_len > 1 && i2 < len2) {
        c = c << 6 | buf[i2++] & 63;
        c_len--;
      }
      if (c_len > 1) {
        utf16buf[out++] = 65533;
        continue;
      }
      if (c < 65536) {
        utf16buf[out++] = c;
      } else {
        c -= 65536;
        utf16buf[out++] = 55296 | c >> 10 & 1023;
        utf16buf[out++] = 56320 | c & 1023;
      }
    }
    return buf2binstring(utf16buf, out);
  };
  var utf8border = (buf, max2) => {
    max2 = max2 || buf.length;
    if (max2 > buf.length) {
      max2 = buf.length;
    }
    let pos = max2 - 1;
    while (pos >= 0 && (buf[pos] & 192) === 128) {
      pos--;
    }
    if (pos < 0) {
      return max2;
    }
    if (pos === 0) {
      return max2;
    }
    return pos + _utf8len[buf[pos]] > max2 ? pos : max2;
  };
  var strings = {
    string2buf,
    buf2string,
    utf8border
  };
  function ZStream() {
    this.input = null;
    this.next_in = 0;
    this.avail_in = 0;
    this.total_in = 0;
    this.output = null;
    this.next_out = 0;
    this.avail_out = 0;
    this.total_out = 0;
    this.msg = "";
    this.state = null;
    this.data_type = 2;
    this.adler = 0;
  }
  var zstream = ZStream;
  const toString$1 = Object.prototype.toString;
  const {
    Z_NO_FLUSH: Z_NO_FLUSH$1,
    Z_SYNC_FLUSH,
    Z_FULL_FLUSH,
    Z_FINISH: Z_FINISH$2,
    Z_OK: Z_OK$2,
    Z_STREAM_END: Z_STREAM_END$2,
    Z_DEFAULT_COMPRESSION,
    Z_DEFAULT_STRATEGY,
    Z_DEFLATED: Z_DEFLATED$1
  } = constants$2;
  function Deflate$1(options) {
    this.options = common.assign({
      level: Z_DEFAULT_COMPRESSION,
      method: Z_DEFLATED$1,
      chunkSize: 16384,
      windowBits: 15,
      memLevel: 8,
      strategy: Z_DEFAULT_STRATEGY
    }, options || {});
    let opt = this.options;
    if (opt.raw && opt.windowBits > 0) {
      opt.windowBits = -opt.windowBits;
    } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
      opt.windowBits += 16;
    }
    this.err = 0;
    this.msg = "";
    this.ended = false;
    this.chunks = [];
    this.strm = new zstream();
    this.strm.avail_out = 0;
    let status = deflate_1$2.deflateInit2(
      this.strm,
      opt.level,
      opt.method,
      opt.windowBits,
      opt.memLevel,
      opt.strategy
    );
    if (status !== Z_OK$2) {
      throw new Error(messages[status]);
    }
    if (opt.header) {
      deflate_1$2.deflateSetHeader(this.strm, opt.header);
    }
    if (opt.dictionary) {
      let dict;
      if (typeof opt.dictionary === "string") {
        dict = strings.string2buf(opt.dictionary);
      } else if (toString$1.call(opt.dictionary) === "[object ArrayBuffer]") {
        dict = new Uint8Array(opt.dictionary);
      } else {
        dict = opt.dictionary;
      }
      status = deflate_1$2.deflateSetDictionary(this.strm, dict);
      if (status !== Z_OK$2) {
        throw new Error(messages[status]);
      }
      this._dict_set = true;
    }
  }
  Deflate$1.prototype.push = function(data, flush_mode) {
    const strm = this.strm;
    const chunkSize = this.options.chunkSize;
    let status, _flush_mode;
    if (this.ended) {
      return false;
    }
    if (flush_mode === ~~flush_mode)
      _flush_mode = flush_mode;
    else
      _flush_mode = flush_mode === true ? Z_FINISH$2 : Z_NO_FLUSH$1;
    if (typeof data === "string") {
      strm.input = strings.string2buf(data);
    } else if (toString$1.call(data) === "[object ArrayBuffer]") {
      strm.input = new Uint8Array(data);
    } else {
      strm.input = data;
    }
    strm.next_in = 0;
    strm.avail_in = strm.input.length;
    for (; ; ) {
      if (strm.avail_out === 0) {
        strm.output = new Uint8Array(chunkSize);
        strm.next_out = 0;
        strm.avail_out = chunkSize;
      }
      if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
        this.onData(strm.output.subarray(0, strm.next_out));
        strm.avail_out = 0;
        continue;
      }
      status = deflate_1$2.deflate(strm, _flush_mode);
      if (status === Z_STREAM_END$2) {
        if (strm.next_out > 0) {
          this.onData(strm.output.subarray(0, strm.next_out));
        }
        status = deflate_1$2.deflateEnd(this.strm);
        this.onEnd(status);
        this.ended = true;
        return status === Z_OK$2;
      }
      if (strm.avail_out === 0) {
        this.onData(strm.output);
        continue;
      }
      if (_flush_mode > 0 && strm.next_out > 0) {
        this.onData(strm.output.subarray(0, strm.next_out));
        strm.avail_out = 0;
        continue;
      }
      if (strm.avail_in === 0)
        break;
    }
    return true;
  };
  Deflate$1.prototype.onData = function(chunk) {
    this.chunks.push(chunk);
  };
  Deflate$1.prototype.onEnd = function(status) {
    if (status === Z_OK$2) {
      this.result = common.flattenChunks(this.chunks);
    }
    this.chunks = [];
    this.err = status;
    this.msg = this.strm.msg;
  };
  const BAD$1 = 16209;
  const TYPE$1 = 16191;
  var inffast = function inflate_fast(strm, start) {
    let _in;
    let last;
    let _out;
    let beg;
    let end;
    let dmax;
    let wsize;
    let whave;
    let wnext;
    let s_window;
    let hold;
    let bits;
    let lcode;
    let dcode;
    let lmask;
    let dmask;
    let here;
    let op;
    let len2;
    let dist;
    let from;
    let from_source;
    let input, output;
    const state = strm.state;
    _in = strm.next_in;
    input = strm.input;
    last = _in + (strm.avail_in - 5);
    _out = strm.next_out;
    output = strm.output;
    beg = _out - (start - strm.avail_out);
    end = _out + (strm.avail_out - 257);
    dmax = state.dmax;
    wsize = state.wsize;
    whave = state.whave;
    wnext = state.wnext;
    s_window = state.window;
    hold = state.hold;
    bits = state.bits;
    lcode = state.lencode;
    dcode = state.distcode;
    lmask = (1 << state.lenbits) - 1;
    dmask = (1 << state.distbits) - 1;
    top:
      do {
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = lcode[hold & lmask];
        dolen:
          for (; ; ) {
            op = here >>> 24;
            hold >>>= op;
            bits -= op;
            op = here >>> 16 & 255;
            if (op === 0) {
              output[_out++] = here & 65535;
            } else if (op & 16) {
              len2 = here & 65535;
              op &= 15;
              if (op) {
                if (bits < op) {
                  hold += input[_in++] << bits;
                  bits += 8;
                }
                len2 += hold & (1 << op) - 1;
                hold >>>= op;
                bits -= op;
              }
              if (bits < 15) {
                hold += input[_in++] << bits;
                bits += 8;
                hold += input[_in++] << bits;
                bits += 8;
              }
              here = dcode[hold & dmask];
              dodist:
                for (; ; ) {
                  op = here >>> 24;
                  hold >>>= op;
                  bits -= op;
                  op = here >>> 16 & 255;
                  if (op & 16) {
                    dist = here & 65535;
                    op &= 15;
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                      if (bits < op) {
                        hold += input[_in++] << bits;
                        bits += 8;
                      }
                    }
                    dist += hold & (1 << op) - 1;
                    if (dist > dmax) {
                      strm.msg = "invalid distance too far back";
                      state.mode = BAD$1;
                      break top;
                    }
                    hold >>>= op;
                    bits -= op;
                    op = _out - beg;
                    if (dist > op) {
                      op = dist - op;
                      if (op > whave) {
                        if (state.sane) {
                          strm.msg = "invalid distance too far back";
                          state.mode = BAD$1;
                          break top;
                        }
                      }
                      from = 0;
                      from_source = s_window;
                      if (wnext === 0) {
                        from += wsize - op;
                        if (op < len2) {
                          len2 -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = _out - dist;
                          from_source = output;
                        }
                      } else if (wnext < op) {
                        from += wsize + wnext - op;
                        op -= wnext;
                        if (op < len2) {
                          len2 -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = 0;
                          if (wnext < len2) {
                            op = wnext;
                            len2 -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        }
                      } else {
                        from += wnext - op;
                        if (op < len2) {
                          len2 -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = _out - dist;
                          from_source = output;
                        }
                      }
                      while (len2 > 2) {
                        output[_out++] = from_source[from++];
                        output[_out++] = from_source[from++];
                        output[_out++] = from_source[from++];
                        len2 -= 3;
                      }
                      if (len2) {
                        output[_out++] = from_source[from++];
                        if (len2 > 1) {
                          output[_out++] = from_source[from++];
                        }
                      }
                    } else {
                      from = _out - dist;
                      do {
                        output[_out++] = output[from++];
                        output[_out++] = output[from++];
                        output[_out++] = output[from++];
                        len2 -= 3;
                      } while (len2 > 2);
                      if (len2) {
                        output[_out++] = output[from++];
                        if (len2 > 1) {
                          output[_out++] = output[from++];
                        }
                      }
                    }
                  } else if ((op & 64) === 0) {
                    here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                    continue dodist;
                  } else {
                    strm.msg = "invalid distance code";
                    state.mode = BAD$1;
                    break top;
                  }
                  break;
                }
            } else if ((op & 64) === 0) {
              here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
              continue dolen;
            } else if (op & 32) {
              state.mode = TYPE$1;
              break top;
            } else {
              strm.msg = "invalid literal/length code";
              state.mode = BAD$1;
              break top;
            }
            break;
          }
      } while (_in < last && _out < end);
    len2 = bits >> 3;
    _in -= len2;
    bits -= len2 << 3;
    hold &= (1 << bits) - 1;
    strm.next_in = _in;
    strm.next_out = _out;
    strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
    strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
    state.hold = hold;
    state.bits = bits;
    return;
  };
  const MAXBITS = 15;
  const ENOUGH_LENS$1 = 852;
  const ENOUGH_DISTS$1 = 592;
  const CODES$1 = 0;
  const LENS$1 = 1;
  const DISTS$1 = 2;
  const lbase = new Uint16Array([
    /* Length codes 257..285 base */
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    13,
    15,
    17,
    19,
    23,
    27,
    31,
    35,
    43,
    51,
    59,
    67,
    83,
    99,
    115,
    131,
    163,
    195,
    227,
    258,
    0,
    0
  ]);
  const lext = new Uint8Array([
    /* Length codes 257..285 extra */
    16,
    16,
    16,
    16,
    16,
    16,
    16,
    16,
    17,
    17,
    17,
    17,
    18,
    18,
    18,
    18,
    19,
    19,
    19,
    19,
    20,
    20,
    20,
    20,
    21,
    21,
    21,
    21,
    16,
    72,
    78
  ]);
  const dbase = new Uint16Array([
    /* Distance codes 0..29 base */
    1,
    2,
    3,
    4,
    5,
    7,
    9,
    13,
    17,
    25,
    33,
    49,
    65,
    97,
    129,
    193,
    257,
    385,
    513,
    769,
    1025,
    1537,
    2049,
    3073,
    4097,
    6145,
    8193,
    12289,
    16385,
    24577,
    0,
    0
  ]);
  const dext = new Uint8Array([
    /* Distance codes 0..29 extra */
    16,
    16,
    16,
    16,
    17,
    17,
    18,
    18,
    19,
    19,
    20,
    20,
    21,
    21,
    22,
    22,
    23,
    23,
    24,
    24,
    25,
    25,
    26,
    26,
    27,
    27,
    28,
    28,
    29,
    29,
    64,
    64
  ]);
  const inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) => {
    const bits = opts.bits;
    let len2 = 0;
    let sym = 0;
    let min2 = 0, max2 = 0;
    let root = 0;
    let curr = 0;
    let drop = 0;
    let left = 0;
    let used = 0;
    let huff = 0;
    let incr;
    let fill;
    let low;
    let mask;
    let next;
    let base = null;
    let match;
    const count = new Uint16Array(MAXBITS + 1);
    const offs = new Uint16Array(MAXBITS + 1);
    let extra = null;
    let here_bits, here_op, here_val;
    for (len2 = 0; len2 <= MAXBITS; len2++) {
      count[len2] = 0;
    }
    for (sym = 0; sym < codes; sym++) {
      count[lens[lens_index + sym]]++;
    }
    root = bits;
    for (max2 = MAXBITS; max2 >= 1; max2--) {
      if (count[max2] !== 0) {
        break;
      }
    }
    if (root > max2) {
      root = max2;
    }
    if (max2 === 0) {
      table[table_index++] = 1 << 24 | 64 << 16 | 0;
      table[table_index++] = 1 << 24 | 64 << 16 | 0;
      opts.bits = 1;
      return 0;
    }
    for (min2 = 1; min2 < max2; min2++) {
      if (count[min2] !== 0) {
        break;
      }
    }
    if (root < min2) {
      root = min2;
    }
    left = 1;
    for (len2 = 1; len2 <= MAXBITS; len2++) {
      left <<= 1;
      left -= count[len2];
      if (left < 0) {
        return -1;
      }
    }
    if (left > 0 && (type === CODES$1 || max2 !== 1)) {
      return -1;
    }
    offs[1] = 0;
    for (len2 = 1; len2 < MAXBITS; len2++) {
      offs[len2 + 1] = offs[len2] + count[len2];
    }
    for (sym = 0; sym < codes; sym++) {
      if (lens[lens_index + sym] !== 0) {
        work[offs[lens[lens_index + sym]]++] = sym;
      }
    }
    if (type === CODES$1) {
      base = extra = work;
      match = 20;
    } else if (type === LENS$1) {
      base = lbase;
      extra = lext;
      match = 257;
    } else {
      base = dbase;
      extra = dext;
      match = 0;
    }
    huff = 0;
    sym = 0;
    len2 = min2;
    next = table_index;
    curr = root;
    drop = 0;
    low = -1;
    used = 1 << root;
    mask = used - 1;
    if (type === LENS$1 && used > ENOUGH_LENS$1 || type === DISTS$1 && used > ENOUGH_DISTS$1) {
      return 1;
    }
    for (; ; ) {
      here_bits = len2 - drop;
      if (work[sym] + 1 < match) {
        here_op = 0;
        here_val = work[sym];
      } else if (work[sym] >= match) {
        here_op = extra[work[sym] - match];
        here_val = base[work[sym] - match];
      } else {
        here_op = 32 + 64;
        here_val = 0;
      }
      incr = 1 << len2 - drop;
      fill = 1 << curr;
      min2 = fill;
      do {
        fill -= incr;
        table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
      } while (fill !== 0);
      incr = 1 << len2 - 1;
      while (huff & incr) {
        incr >>= 1;
      }
      if (incr !== 0) {
        huff &= incr - 1;
        huff += incr;
      } else {
        huff = 0;
      }
      sym++;
      if (--count[len2] === 0) {
        if (len2 === max2) {
          break;
        }
        len2 = lens[lens_index + work[sym]];
      }
      if (len2 > root && (huff & mask) !== low) {
        if (drop === 0) {
          drop = root;
        }
        next += min2;
        curr = len2 - drop;
        left = 1 << curr;
        while (curr + drop < max2) {
          left -= count[curr + drop];
          if (left <= 0) {
            break;
          }
          curr++;
          left <<= 1;
        }
        used += 1 << curr;
        if (type === LENS$1 && used > ENOUGH_LENS$1 || type === DISTS$1 && used > ENOUGH_DISTS$1) {
          return 1;
        }
        low = huff & mask;
        table[low] = root << 24 | curr << 16 | next - table_index | 0;
      }
    }
    if (huff !== 0) {
      table[next + huff] = len2 - drop << 24 | 64 << 16 | 0;
    }
    opts.bits = root;
    return 0;
  };
  var inftrees = inflate_table;
  const CODES = 0;
  const LENS = 1;
  const DISTS = 2;
  const {
    Z_FINISH: Z_FINISH$1,
    Z_BLOCK,
    Z_TREES,
    Z_OK: Z_OK$1,
    Z_STREAM_END: Z_STREAM_END$1,
    Z_NEED_DICT: Z_NEED_DICT$1,
    Z_STREAM_ERROR: Z_STREAM_ERROR$1,
    Z_DATA_ERROR: Z_DATA_ERROR$1,
    Z_MEM_ERROR: Z_MEM_ERROR$1,
    Z_BUF_ERROR,
    Z_DEFLATED
  } = constants$2;
  const HEAD = 16180;
  const FLAGS = 16181;
  const TIME = 16182;
  const OS = 16183;
  const EXLEN = 16184;
  const EXTRA = 16185;
  const NAME = 16186;
  const COMMENT = 16187;
  const HCRC = 16188;
  const DICTID = 16189;
  const DICT = 16190;
  const TYPE = 16191;
  const TYPEDO = 16192;
  const STORED = 16193;
  const COPY_ = 16194;
  const COPY = 16195;
  const TABLE = 16196;
  const LENLENS = 16197;
  const CODELENS = 16198;
  const LEN_ = 16199;
  const LEN = 16200;
  const LENEXT = 16201;
  const DIST = 16202;
  const DISTEXT = 16203;
  const MATCH = 16204;
  const LIT = 16205;
  const CHECK = 16206;
  const LENGTH = 16207;
  const DONE = 16208;
  const BAD = 16209;
  const MEM = 16210;
  const SYNC = 16211;
  const ENOUGH_LENS = 852;
  const ENOUGH_DISTS = 592;
  const MAX_WBITS = 15;
  const DEF_WBITS = MAX_WBITS;
  const zswap32 = (q) => {
    return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
  };
  function InflateState() {
    this.strm = null;
    this.mode = 0;
    this.last = false;
    this.wrap = 0;
    this.havedict = false;
    this.flags = 0;
    this.dmax = 0;
    this.check = 0;
    this.total = 0;
    this.head = null;
    this.wbits = 0;
    this.wsize = 0;
    this.whave = 0;
    this.wnext = 0;
    this.window = null;
    this.hold = 0;
    this.bits = 0;
    this.length = 0;
    this.offset = 0;
    this.extra = 0;
    this.lencode = null;
    this.distcode = null;
    this.lenbits = 0;
    this.distbits = 0;
    this.ncode = 0;
    this.nlen = 0;
    this.ndist = 0;
    this.have = 0;
    this.next = null;
    this.lens = new Uint16Array(320);
    this.work = new Uint16Array(288);
    this.lendyn = null;
    this.distdyn = null;
    this.sane = 0;
    this.back = 0;
    this.was = 0;
  }
  const inflateStateCheck = (strm) => {
    if (!strm) {
      return 1;
    }
    const state = strm.state;
    if (!state || state.strm !== strm || state.mode < HEAD || state.mode > SYNC) {
      return 1;
    }
    return 0;
  };
  const inflateResetKeep = (strm) => {
    if (inflateStateCheck(strm)) {
      return Z_STREAM_ERROR$1;
    }
    const state = strm.state;
    strm.total_in = strm.total_out = state.total = 0;
    strm.msg = "";
    if (state.wrap) {
      strm.adler = state.wrap & 1;
    }
    state.mode = HEAD;
    state.last = 0;
    state.havedict = 0;
    state.flags = -1;
    state.dmax = 32768;
    state.head = null;
    state.hold = 0;
    state.bits = 0;
    state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
    state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);
    state.sane = 1;
    state.back = -1;
    return Z_OK$1;
  };
  const inflateReset = (strm) => {
    if (inflateStateCheck(strm)) {
      return Z_STREAM_ERROR$1;
    }
    const state = strm.state;
    state.wsize = 0;
    state.whave = 0;
    state.wnext = 0;
    return inflateResetKeep(strm);
  };
  const inflateReset2 = (strm, windowBits) => {
    let wrap;
    if (inflateStateCheck(strm)) {
      return Z_STREAM_ERROR$1;
    }
    const state = strm.state;
    if (windowBits < 0) {
      wrap = 0;
      windowBits = -windowBits;
    } else {
      wrap = (windowBits >> 4) + 5;
      if (windowBits < 48) {
        windowBits &= 15;
      }
    }
    if (windowBits && (windowBits < 8 || windowBits > 15)) {
      return Z_STREAM_ERROR$1;
    }
    if (state.window !== null && state.wbits !== windowBits) {
      state.window = null;
    }
    state.wrap = wrap;
    state.wbits = windowBits;
    return inflateReset(strm);
  };
  const inflateInit2 = (strm, windowBits) => {
    if (!strm) {
      return Z_STREAM_ERROR$1;
    }
    const state = new InflateState();
    strm.state = state;
    state.strm = strm;
    state.window = null;
    state.mode = HEAD;
    const ret = inflateReset2(strm, windowBits);
    if (ret !== Z_OK$1) {
      strm.state = null;
    }
    return ret;
  };
  const inflateInit = (strm) => {
    return inflateInit2(strm, DEF_WBITS);
  };
  let virgin = true;
  let lenfix, distfix;
  const fixedtables = (state) => {
    if (virgin) {
      lenfix = new Int32Array(512);
      distfix = new Int32Array(32);
      let sym = 0;
      while (sym < 144) {
        state.lens[sym++] = 8;
      }
      while (sym < 256) {
        state.lens[sym++] = 9;
      }
      while (sym < 280) {
        state.lens[sym++] = 7;
      }
      while (sym < 288) {
        state.lens[sym++] = 8;
      }
      inftrees(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
      sym = 0;
      while (sym < 32) {
        state.lens[sym++] = 5;
      }
      inftrees(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
      virgin = false;
    }
    state.lencode = lenfix;
    state.lenbits = 9;
    state.distcode = distfix;
    state.distbits = 5;
  };
  const updatewindow = (strm, src, end, copy2) => {
    let dist;
    const state = strm.state;
    if (state.window === null) {
      state.wsize = 1 << state.wbits;
      state.wnext = 0;
      state.whave = 0;
      state.window = new Uint8Array(state.wsize);
    }
    if (copy2 >= state.wsize) {
      state.window.set(src.subarray(end - state.wsize, end), 0);
      state.wnext = 0;
      state.whave = state.wsize;
    } else {
      dist = state.wsize - state.wnext;
      if (dist > copy2) {
        dist = copy2;
      }
      state.window.set(src.subarray(end - copy2, end - copy2 + dist), state.wnext);
      copy2 -= dist;
      if (copy2) {
        state.window.set(src.subarray(end - copy2, end), 0);
        state.wnext = copy2;
        state.whave = state.wsize;
      } else {
        state.wnext += dist;
        if (state.wnext === state.wsize) {
          state.wnext = 0;
        }
        if (state.whave < state.wsize) {
          state.whave += dist;
        }
      }
    }
    return 0;
  };
  const inflate$2 = (strm, flush) => {
    let state;
    let input, output;
    let next;
    let put;
    let have, left;
    let hold;
    let bits;
    let _in, _out;
    let copy2;
    let from;
    let from_source;
    let here = 0;
    let here_bits, here_op, here_val;
    let last_bits, last_op, last_val;
    let len2;
    let ret;
    const hbuf = new Uint8Array(4);
    let opts;
    let n;
    const order = (
      /* permutation of code lengths */
      new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15])
    );
    if (inflateStateCheck(strm) || !strm.output || !strm.input && strm.avail_in !== 0) {
      return Z_STREAM_ERROR$1;
    }
    state = strm.state;
    if (state.mode === TYPE) {
      state.mode = TYPEDO;
    }
    put = strm.next_out;
    output = strm.output;
    left = strm.avail_out;
    next = strm.next_in;
    input = strm.input;
    have = strm.avail_in;
    hold = state.hold;
    bits = state.bits;
    _in = have;
    _out = left;
    ret = Z_OK$1;
    inf_leave:
      for (; ; ) {
        switch (state.mode) {
          case HEAD:
            if (state.wrap === 0) {
              state.mode = TYPEDO;
              break;
            }
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (state.wrap & 2 && hold === 35615) {
              if (state.wbits === 0) {
                state.wbits = 15;
              }
              state.check = 0;
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state.check = crc32_1(state.check, hbuf, 2, 0);
              hold = 0;
              bits = 0;
              state.mode = FLAGS;
              break;
            }
            if (state.head) {
              state.head.done = false;
            }
            if (!(state.wrap & 1) || /* check if zlib header allowed */
            (((hold & 255) << 8) + (hold >> 8)) % 31) {
              strm.msg = "incorrect header check";
              state.mode = BAD;
              break;
            }
            if ((hold & 15) !== Z_DEFLATED) {
              strm.msg = "unknown compression method";
              state.mode = BAD;
              break;
            }
            hold >>>= 4;
            bits -= 4;
            len2 = (hold & 15) + 8;
            if (state.wbits === 0) {
              state.wbits = len2;
            }
            if (len2 > 15 || len2 > state.wbits) {
              strm.msg = "invalid window size";
              state.mode = BAD;
              break;
            }
            state.dmax = 1 << state.wbits;
            state.flags = 0;
            strm.adler = state.check = 1;
            state.mode = hold & 512 ? DICTID : TYPE;
            hold = 0;
            bits = 0;
            break;
          case FLAGS:
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.flags = hold;
            if ((state.flags & 255) !== Z_DEFLATED) {
              strm.msg = "unknown compression method";
              state.mode = BAD;
              break;
            }
            if (state.flags & 57344) {
              strm.msg = "unknown header flags set";
              state.mode = BAD;
              break;
            }
            if (state.head) {
              state.head.text = hold >> 8 & 1;
            }
            if (state.flags & 512 && state.wrap & 4) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state.check = crc32_1(state.check, hbuf, 2, 0);
            }
            hold = 0;
            bits = 0;
            state.mode = TIME;
          case TIME:
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (state.head) {
              state.head.time = hold;
            }
            if (state.flags & 512 && state.wrap & 4) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              hbuf[2] = hold >>> 16 & 255;
              hbuf[3] = hold >>> 24 & 255;
              state.check = crc32_1(state.check, hbuf, 4, 0);
            }
            hold = 0;
            bits = 0;
            state.mode = OS;
          case OS:
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (state.head) {
              state.head.xflags = hold & 255;
              state.head.os = hold >> 8;
            }
            if (state.flags & 512 && state.wrap & 4) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state.check = crc32_1(state.check, hbuf, 2, 0);
            }
            hold = 0;
            bits = 0;
            state.mode = EXLEN;
          case EXLEN:
            if (state.flags & 1024) {
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.length = hold;
              if (state.head) {
                state.head.extra_len = hold;
              }
              if (state.flags & 512 && state.wrap & 4) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32_1(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
            } else if (state.head) {
              state.head.extra = null;
            }
            state.mode = EXTRA;
          case EXTRA:
            if (state.flags & 1024) {
              copy2 = state.length;
              if (copy2 > have) {
                copy2 = have;
              }
              if (copy2) {
                if (state.head) {
                  len2 = state.head.extra_len - state.length;
                  if (!state.head.extra) {
                    state.head.extra = new Uint8Array(state.head.extra_len);
                  }
                  state.head.extra.set(
                    input.subarray(
                      next,
                      // extra field is limited to 65536 bytes
                      // - no need for additional size check
                      next + copy2
                    ),
                    /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                    len2
                  );
                }
                if (state.flags & 512 && state.wrap & 4) {
                  state.check = crc32_1(state.check, input, copy2, next);
                }
                have -= copy2;
                next += copy2;
                state.length -= copy2;
              }
              if (state.length) {
                break inf_leave;
              }
            }
            state.length = 0;
            state.mode = NAME;
          case NAME:
            if (state.flags & 2048) {
              if (have === 0) {
                break inf_leave;
              }
              copy2 = 0;
              do {
                len2 = input[next + copy2++];
                if (state.head && len2 && state.length < 65536) {
                  state.head.name += String.fromCharCode(len2);
                }
              } while (len2 && copy2 < have);
              if (state.flags & 512 && state.wrap & 4) {
                state.check = crc32_1(state.check, input, copy2, next);
              }
              have -= copy2;
              next += copy2;
              if (len2) {
                break inf_leave;
              }
            } else if (state.head) {
              state.head.name = null;
            }
            state.length = 0;
            state.mode = COMMENT;
          case COMMENT:
            if (state.flags & 4096) {
              if (have === 0) {
                break inf_leave;
              }
              copy2 = 0;
              do {
                len2 = input[next + copy2++];
                if (state.head && len2 && state.length < 65536) {
                  state.head.comment += String.fromCharCode(len2);
                }
              } while (len2 && copy2 < have);
              if (state.flags & 512 && state.wrap & 4) {
                state.check = crc32_1(state.check, input, copy2, next);
              }
              have -= copy2;
              next += copy2;
              if (len2) {
                break inf_leave;
              }
            } else if (state.head) {
              state.head.comment = null;
            }
            state.mode = HCRC;
          case HCRC:
            if (state.flags & 512) {
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.wrap & 4 && hold !== (state.check & 65535)) {
                strm.msg = "header crc mismatch";
                state.mode = BAD;
                break;
              }
              hold = 0;
              bits = 0;
            }
            if (state.head) {
              state.head.hcrc = state.flags >> 9 & 1;
              state.head.done = true;
            }
            strm.adler = state.check = 0;
            state.mode = TYPE;
            break;
          case DICTID:
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            strm.adler = state.check = zswap32(hold);
            hold = 0;
            bits = 0;
            state.mode = DICT;
          case DICT:
            if (state.havedict === 0) {
              strm.next_out = put;
              strm.avail_out = left;
              strm.next_in = next;
              strm.avail_in = have;
              state.hold = hold;
              state.bits = bits;
              return Z_NEED_DICT$1;
            }
            strm.adler = state.check = 1;
            state.mode = TYPE;
          case TYPE:
            if (flush === Z_BLOCK || flush === Z_TREES) {
              break inf_leave;
            }
          case TYPEDO:
            if (state.last) {
              hold >>>= bits & 7;
              bits -= bits & 7;
              state.mode = CHECK;
              break;
            }
            while (bits < 3) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.last = hold & 1;
            hold >>>= 1;
            bits -= 1;
            switch (hold & 3) {
              case 0:
                state.mode = STORED;
                break;
              case 1:
                fixedtables(state);
                state.mode = LEN_;
                if (flush === Z_TREES) {
                  hold >>>= 2;
                  bits -= 2;
                  break inf_leave;
                }
                break;
              case 2:
                state.mode = TABLE;
                break;
              case 3:
                strm.msg = "invalid block type";
                state.mode = BAD;
            }
            hold >>>= 2;
            bits -= 2;
            break;
          case STORED:
            hold >>>= bits & 7;
            bits -= bits & 7;
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
              strm.msg = "invalid stored block lengths";
              state.mode = BAD;
              break;
            }
            state.length = hold & 65535;
            hold = 0;
            bits = 0;
            state.mode = COPY_;
            if (flush === Z_TREES) {
              break inf_leave;
            }
          case COPY_:
            state.mode = COPY;
          case COPY:
            copy2 = state.length;
            if (copy2) {
              if (copy2 > have) {
                copy2 = have;
              }
              if (copy2 > left) {
                copy2 = left;
              }
              if (copy2 === 0) {
                break inf_leave;
              }
              output.set(input.subarray(next, next + copy2), put);
              have -= copy2;
              next += copy2;
              left -= copy2;
              put += copy2;
              state.length -= copy2;
              break;
            }
            state.mode = TYPE;
            break;
          case TABLE:
            while (bits < 14) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.nlen = (hold & 31) + 257;
            hold >>>= 5;
            bits -= 5;
            state.ndist = (hold & 31) + 1;
            hold >>>= 5;
            bits -= 5;
            state.ncode = (hold & 15) + 4;
            hold >>>= 4;
            bits -= 4;
            if (state.nlen > 286 || state.ndist > 30) {
              strm.msg = "too many length or distance symbols";
              state.mode = BAD;
              break;
            }
            state.have = 0;
            state.mode = LENLENS;
          case LENLENS:
            while (state.have < state.ncode) {
              while (bits < 3) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.lens[order[state.have++]] = hold & 7;
              hold >>>= 3;
              bits -= 3;
            }
            while (state.have < 19) {
              state.lens[order[state.have++]] = 0;
            }
            state.lencode = state.lendyn;
            state.lenbits = 7;
            opts = { bits: state.lenbits };
            ret = inftrees(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
            state.lenbits = opts.bits;
            if (ret) {
              strm.msg = "invalid code lengths set";
              state.mode = BAD;
              break;
            }
            state.have = 0;
            state.mode = CODELENS;
          case CODELENS:
            while (state.have < state.nlen + state.ndist) {
              for (; ; ) {
                here = state.lencode[hold & (1 << state.lenbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (here_val < 16) {
                hold >>>= here_bits;
                bits -= here_bits;
                state.lens[state.have++] = here_val;
              } else {
                if (here_val === 16) {
                  n = here_bits + 2;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= here_bits;
                  bits -= here_bits;
                  if (state.have === 0) {
                    strm.msg = "invalid bit length repeat";
                    state.mode = BAD;
                    break;
                  }
                  len2 = state.lens[state.have - 1];
                  copy2 = 3 + (hold & 3);
                  hold >>>= 2;
                  bits -= 2;
                } else if (here_val === 17) {
                  n = here_bits + 3;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= here_bits;
                  bits -= here_bits;
                  len2 = 0;
                  copy2 = 3 + (hold & 7);
                  hold >>>= 3;
                  bits -= 3;
                } else {
                  n = here_bits + 7;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= here_bits;
                  bits -= here_bits;
                  len2 = 0;
                  copy2 = 11 + (hold & 127);
                  hold >>>= 7;
                  bits -= 7;
                }
                if (state.have + copy2 > state.nlen + state.ndist) {
                  strm.msg = "invalid bit length repeat";
                  state.mode = BAD;
                  break;
                }
                while (copy2--) {
                  state.lens[state.have++] = len2;
                }
              }
            }
            if (state.mode === BAD) {
              break;
            }
            if (state.lens[256] === 0) {
              strm.msg = "invalid code -- missing end-of-block";
              state.mode = BAD;
              break;
            }
            state.lenbits = 9;
            opts = { bits: state.lenbits };
            ret = inftrees(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
            state.lenbits = opts.bits;
            if (ret) {
              strm.msg = "invalid literal/lengths set";
              state.mode = BAD;
              break;
            }
            state.distbits = 6;
            state.distcode = state.distdyn;
            opts = { bits: state.distbits };
            ret = inftrees(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
            state.distbits = opts.bits;
            if (ret) {
              strm.msg = "invalid distances set";
              state.mode = BAD;
              break;
            }
            state.mode = LEN_;
            if (flush === Z_TREES) {
              break inf_leave;
            }
          case LEN_:
            state.mode = LEN;
          case LEN:
            if (have >= 6 && left >= 258) {
              strm.next_out = put;
              strm.avail_out = left;
              strm.next_in = next;
              strm.avail_in = have;
              state.hold = hold;
              state.bits = bits;
              inffast(strm, _out);
              put = strm.next_out;
              output = strm.output;
              left = strm.avail_out;
              next = strm.next_in;
              input = strm.input;
              have = strm.avail_in;
              hold = state.hold;
              bits = state.bits;
              if (state.mode === TYPE) {
                state.back = -1;
              }
              break;
            }
            state.back = 0;
            for (; ; ) {
              here = state.lencode[hold & (1 << state.lenbits) - 1];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (here_op && (here_op & 240) === 0) {
              last_bits = here_bits;
              last_op = here_op;
              last_val = here_val;
              for (; ; ) {
                here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (last_bits + here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              hold >>>= last_bits;
              bits -= last_bits;
              state.back += last_bits;
            }
            hold >>>= here_bits;
            bits -= here_bits;
            state.back += here_bits;
            state.length = here_val;
            if (here_op === 0) {
              state.mode = LIT;
              break;
            }
            if (here_op & 32) {
              state.back = -1;
              state.mode = TYPE;
              break;
            }
            if (here_op & 64) {
              strm.msg = "invalid literal/length code";
              state.mode = BAD;
              break;
            }
            state.extra = here_op & 15;
            state.mode = LENEXT;
          case LENEXT:
            if (state.extra) {
              n = state.extra;
              while (bits < n) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.length += hold & (1 << state.extra) - 1;
              hold >>>= state.extra;
              bits -= state.extra;
              state.back += state.extra;
            }
            state.was = state.length;
            state.mode = DIST;
          case DIST:
            for (; ; ) {
              here = state.distcode[hold & (1 << state.distbits) - 1];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if ((here_op & 240) === 0) {
              last_bits = here_bits;
              last_op = here_op;
              last_val = here_val;
              for (; ; ) {
                here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (last_bits + here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              hold >>>= last_bits;
              bits -= last_bits;
              state.back += last_bits;
            }
            hold >>>= here_bits;
            bits -= here_bits;
            state.back += here_bits;
            if (here_op & 64) {
              strm.msg = "invalid distance code";
              state.mode = BAD;
              break;
            }
            state.offset = here_val;
            state.extra = here_op & 15;
            state.mode = DISTEXT;
          case DISTEXT:
            if (state.extra) {
              n = state.extra;
              while (bits < n) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.offset += hold & (1 << state.extra) - 1;
              hold >>>= state.extra;
              bits -= state.extra;
              state.back += state.extra;
            }
            if (state.offset > state.dmax) {
              strm.msg = "invalid distance too far back";
              state.mode = BAD;
              break;
            }
            state.mode = MATCH;
          case MATCH:
            if (left === 0) {
              break inf_leave;
            }
            copy2 = _out - left;
            if (state.offset > copy2) {
              copy2 = state.offset - copy2;
              if (copy2 > state.whave) {
                if (state.sane) {
                  strm.msg = "invalid distance too far back";
                  state.mode = BAD;
                  break;
                }
              }
              if (copy2 > state.wnext) {
                copy2 -= state.wnext;
                from = state.wsize - copy2;
              } else {
                from = state.wnext - copy2;
              }
              if (copy2 > state.length) {
                copy2 = state.length;
              }
              from_source = state.window;
            } else {
              from_source = output;
              from = put - state.offset;
              copy2 = state.length;
            }
            if (copy2 > left) {
              copy2 = left;
            }
            left -= copy2;
            state.length -= copy2;
            do {
              output[put++] = from_source[from++];
            } while (--copy2);
            if (state.length === 0) {
              state.mode = LEN;
            }
            break;
          case LIT:
            if (left === 0) {
              break inf_leave;
            }
            output[put++] = state.length;
            left--;
            state.mode = LEN;
            break;
          case CHECK:
            if (state.wrap) {
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold |= input[next++] << bits;
                bits += 8;
              }
              _out -= left;
              strm.total_out += _out;
              state.total += _out;
              if (state.wrap & 4 && _out) {
                strm.adler = state.check = /*UPDATE_CHECK(state.check, put - _out, _out);*/
                state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out);
              }
              _out = left;
              if (state.wrap & 4 && (state.flags ? hold : zswap32(hold)) !== state.check) {
                strm.msg = "incorrect data check";
                state.mode = BAD;
                break;
              }
              hold = 0;
              bits = 0;
            }
            state.mode = LENGTH;
          case LENGTH:
            if (state.wrap && state.flags) {
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.wrap & 4 && hold !== (state.total & 4294967295)) {
                strm.msg = "incorrect length check";
                state.mode = BAD;
                break;
              }
              hold = 0;
              bits = 0;
            }
            state.mode = DONE;
          case DONE:
            ret = Z_STREAM_END$1;
            break inf_leave;
          case BAD:
            ret = Z_DATA_ERROR$1;
            break inf_leave;
          case MEM:
            return Z_MEM_ERROR$1;
          case SYNC:
          default:
            return Z_STREAM_ERROR$1;
        }
      }
    strm.next_out = put;
    strm.avail_out = left;
    strm.next_in = next;
    strm.avail_in = have;
    state.hold = hold;
    state.bits = bits;
    if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH$1)) {
      if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out))
        ;
    }
    _in -= strm.avail_in;
    _out -= strm.avail_out;
    strm.total_in += _in;
    strm.total_out += _out;
    state.total += _out;
    if (state.wrap & 4 && _out) {
      strm.adler = state.check = /*UPDATE_CHECK(state.check, strm.next_out - _out, _out);*/
      state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out);
    }
    strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
    if ((_in === 0 && _out === 0 || flush === Z_FINISH$1) && ret === Z_OK$1) {
      ret = Z_BUF_ERROR;
    }
    return ret;
  };
  const inflateEnd = (strm) => {
    if (inflateStateCheck(strm)) {
      return Z_STREAM_ERROR$1;
    }
    let state = strm.state;
    if (state.window) {
      state.window = null;
    }
    strm.state = null;
    return Z_OK$1;
  };
  const inflateGetHeader = (strm, head) => {
    if (inflateStateCheck(strm)) {
      return Z_STREAM_ERROR$1;
    }
    const state = strm.state;
    if ((state.wrap & 2) === 0) {
      return Z_STREAM_ERROR$1;
    }
    state.head = head;
    head.done = false;
    return Z_OK$1;
  };
  const inflateSetDictionary = (strm, dictionary) => {
    const dictLength = dictionary.length;
    let state;
    let dictid;
    let ret;
    if (inflateStateCheck(strm)) {
      return Z_STREAM_ERROR$1;
    }
    state = strm.state;
    if (state.wrap !== 0 && state.mode !== DICT) {
      return Z_STREAM_ERROR$1;
    }
    if (state.mode === DICT) {
      dictid = 1;
      dictid = adler32_1(dictid, dictionary, dictLength, 0);
      if (dictid !== state.check) {
        return Z_DATA_ERROR$1;
      }
    }
    ret = updatewindow(strm, dictionary, dictLength, dictLength);
    if (ret) {
      state.mode = MEM;
      return Z_MEM_ERROR$1;
    }
    state.havedict = 1;
    return Z_OK$1;
  };
  var inflateReset_1 = inflateReset;
  var inflateReset2_1 = inflateReset2;
  var inflateResetKeep_1 = inflateResetKeep;
  var inflateInit_1 = inflateInit;
  var inflateInit2_1 = inflateInit2;
  var inflate_2$1 = inflate$2;
  var inflateEnd_1 = inflateEnd;
  var inflateGetHeader_1 = inflateGetHeader;
  var inflateSetDictionary_1 = inflateSetDictionary;
  var inflateInfo = "pako inflate (from Nodeca project)";
  var inflate_1$2 = {
    inflateReset: inflateReset_1,
    inflateReset2: inflateReset2_1,
    inflateResetKeep: inflateResetKeep_1,
    inflateInit: inflateInit_1,
    inflateInit2: inflateInit2_1,
    inflate: inflate_2$1,
    inflateEnd: inflateEnd_1,
    inflateGetHeader: inflateGetHeader_1,
    inflateSetDictionary: inflateSetDictionary_1,
    inflateInfo
  };
  function GZheader() {
    this.text = 0;
    this.time = 0;
    this.xflags = 0;
    this.os = 0;
    this.extra = null;
    this.extra_len = 0;
    this.name = "";
    this.comment = "";
    this.hcrc = 0;
    this.done = false;
  }
  var gzheader = GZheader;
  const toString$2 = Object.prototype.toString;
  const {
    Z_NO_FLUSH,
    Z_FINISH,
    Z_OK,
    Z_STREAM_END,
    Z_NEED_DICT,
    Z_STREAM_ERROR,
    Z_DATA_ERROR,
    Z_MEM_ERROR
  } = constants$2;
  function Inflate$1(options) {
    this.options = common.assign({
      chunkSize: 1024 * 64,
      windowBits: 15,
      to: ""
    }, options || {});
    const opt = this.options;
    if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
      opt.windowBits = -opt.windowBits;
      if (opt.windowBits === 0) {
        opt.windowBits = -15;
      }
    }
    if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
      opt.windowBits += 32;
    }
    if (opt.windowBits > 15 && opt.windowBits < 48) {
      if ((opt.windowBits & 15) === 0) {
        opt.windowBits |= 15;
      }
    }
    this.err = 0;
    this.msg = "";
    this.ended = false;
    this.chunks = [];
    this.strm = new zstream();
    this.strm.avail_out = 0;
    let status = inflate_1$2.inflateInit2(
      this.strm,
      opt.windowBits
    );
    if (status !== Z_OK) {
      throw new Error(messages[status]);
    }
    this.header = new gzheader();
    inflate_1$2.inflateGetHeader(this.strm, this.header);
    if (opt.dictionary) {
      if (typeof opt.dictionary === "string") {
        opt.dictionary = strings.string2buf(opt.dictionary);
      } else if (toString$2.call(opt.dictionary) === "[object ArrayBuffer]") {
        opt.dictionary = new Uint8Array(opt.dictionary);
      }
      if (opt.raw) {
        status = inflate_1$2.inflateSetDictionary(this.strm, opt.dictionary);
        if (status !== Z_OK) {
          throw new Error(messages[status]);
        }
      }
    }
  }
  Inflate$1.prototype.push = function(data, flush_mode) {
    const strm = this.strm;
    const chunkSize = this.options.chunkSize;
    const dictionary = this.options.dictionary;
    let status, _flush_mode, last_avail_out;
    if (this.ended)
      return false;
    if (flush_mode === ~~flush_mode)
      _flush_mode = flush_mode;
    else
      _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;
    if (toString$2.call(data) === "[object ArrayBuffer]") {
      strm.input = new Uint8Array(data);
    } else {
      strm.input = data;
    }
    strm.next_in = 0;
    strm.avail_in = strm.input.length;
    for (; ; ) {
      if (strm.avail_out === 0) {
        strm.output = new Uint8Array(chunkSize);
        strm.next_out = 0;
        strm.avail_out = chunkSize;
      }
      status = inflate_1$2.inflate(strm, _flush_mode);
      if (status === Z_NEED_DICT && dictionary) {
        status = inflate_1$2.inflateSetDictionary(strm, dictionary);
        if (status === Z_OK) {
          status = inflate_1$2.inflate(strm, _flush_mode);
        } else if (status === Z_DATA_ERROR) {
          status = Z_NEED_DICT;
        }
      }
      while (strm.avail_in > 0 && status === Z_STREAM_END && strm.state.wrap > 0 && data[strm.next_in] !== 0) {
        inflate_1$2.inflateReset(strm);
        status = inflate_1$2.inflate(strm, _flush_mode);
      }
      switch (status) {
        case Z_STREAM_ERROR:
        case Z_DATA_ERROR:
        case Z_NEED_DICT:
        case Z_MEM_ERROR:
          this.onEnd(status);
          this.ended = true;
          return false;
      }
      last_avail_out = strm.avail_out;
      if (strm.next_out) {
        if (strm.avail_out === 0 || status === Z_STREAM_END) {
          if (this.options.to === "string") {
            let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
            let tail = strm.next_out - next_out_utf8;
            let utf8str = strings.buf2string(strm.output, next_out_utf8);
            strm.next_out = tail;
            strm.avail_out = chunkSize - tail;
            if (tail)
              strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);
            this.onData(utf8str);
          } else {
            this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
          }
        }
      }
      if (status === Z_OK && last_avail_out === 0)
        continue;
      if (status === Z_STREAM_END) {
        status = inflate_1$2.inflateEnd(this.strm);
        this.onEnd(status);
        this.ended = true;
        return true;
      }
      if (strm.avail_in === 0)
        break;
    }
    return true;
  };
  Inflate$1.prototype.onData = function(chunk) {
    this.chunks.push(chunk);
  };
  Inflate$1.prototype.onEnd = function(status) {
    if (status === Z_OK) {
      if (this.options.to === "string") {
        this.result = this.chunks.join("");
      } else {
        this.result = common.flattenChunks(this.chunks);
      }
    }
    this.chunks = [];
    this.err = status;
    this.msg = this.strm.msg;
  };
  function inflate$1(input, options) {
    const inflator = new Inflate$1(options);
    inflator.push(input);
    if (inflator.err)
      throw inflator.msg || messages[inflator.err];
    return inflator.result;
  }
  function inflateRaw$1(input, options) {
    options = options || {};
    options.raw = true;
    return inflate$1(input, options);
  }
  var Inflate_1$1 = Inflate$1;
  var inflate_2 = inflate$1;
  var inflateRaw_1$1 = inflateRaw$1;
  var ungzip$1 = inflate$1;
  var constants = constants$2;
  var inflate_1$1 = {
    Inflate: Inflate_1$1,
    inflate: inflate_2,
    inflateRaw: inflateRaw_1$1,
    ungzip: ungzip$1,
    constants
  };
  const { Inflate, inflate, inflateRaw, ungzip } = inflate_1$1;
  var inflateRaw_1 = inflateRaw;
  function unzip(input) {
    return inflateRaw_1(input.subarray(2));
  }
  class AbortError extends Error {
    constructor(message) {
      super(message);
      this.code = "ERR_ABORTED";
    }
  }
  function groupBlocks(blocks) {
    blocks.sort((b0, b1) => Number(b0.offset) - Number(b1.offset));
    const blockGroups = [];
    let lastBlock;
    let lastBlockEnd;
    for (const block of blocks) {
      if (lastBlock && lastBlockEnd && Number(block.offset) - lastBlockEnd <= 2e3) {
        lastBlock.length = BigInt(Number(lastBlock.length) + Number(block.length) - lastBlockEnd + Number(block.offset));
        lastBlock.blocks.push(block);
      } else {
        blockGroups.push(lastBlock = {
          blocks: [block],
          length: block.length,
          offset: block.offset
        });
      }
      lastBlockEnd = Number(lastBlock.offset) + Number(lastBlock.length);
    }
    return blockGroups;
  }
  function checkAbortSignal(signal) {
    if (!signal) {
      return;
    }
    if (signal.aborted) {
      if (typeof DOMException === "undefined") {
        const e = new AbortError("aborted");
        e.code = "ERR_ABORTED";
        throw e;
      } else {
        throw new DOMException("aborted", "AbortError");
      }
    }
  }
  const BIG_WIG_TYPE_GRAPH = 1;
  const BIG_WIG_TYPE_VSTEP = 2;
  const BIG_WIG_TYPE_FSTEP = 3;
  function coordFilter(s1, e1, s2, e22) {
    return s1 < e22 && e1 >= s2;
  }
  function getParsers$1(isBigEndian) {
    const le = isBigEndian ? "big" : "little";
    const summaryParser = new Parser().endianess(le).uint32("chromId").uint32("start").uint32("end").uint32("validCnt").floatle("minScore").floatle("maxScore").floatle("sumData").floatle("sumSqData").saveOffset("offset");
    const leafParser = new Parser().endianess(le).uint8("isLeaf").skip(1).uint16("cnt").choice({
      tag: "isLeaf",
      choices: {
        1: new Parser().endianess(le).array("blocksToFetch", {
          length: "cnt",
          type: new Parser().endianess(le).uint32("startChrom").uint32("startBase").uint32("endChrom").uint32("endBase").uint64("blockOffset").uint64("blockSize").saveOffset("offset")
        }),
        0: new Parser().array("recurOffsets", {
          length: "cnt",
          type: new Parser().endianess(le).uint32("startChrom").uint32("startBase").uint32("endChrom").uint32("endBase").uint64("blockOffset").saveOffset("offset")
        })
      }
    });
    const bigBedParser = new Parser().endianess(le).uint32("chromId").int32("start").int32("end").string("rest", {
      zeroTerminated: true
    }).saveOffset("offset");
    const bigWigParser = new Parser().endianess(le).skip(4).int32("blockStart").skip(4).uint32("itemStep").uint32("itemSpan").uint8("blockType").skip(1).uint16("itemCount").choice({
      tag: "blockType",
      choices: {
        [BIG_WIG_TYPE_FSTEP]: new Parser().array("items", {
          length: "itemCount",
          type: new Parser().floatle("score")
        }),
        [BIG_WIG_TYPE_VSTEP]: new Parser().array("items", {
          length: "itemCount",
          type: new Parser().endianess(le).int32("start").floatle("score")
        }),
        [BIG_WIG_TYPE_GRAPH]: new Parser().array("items", {
          length: "itemCount",
          type: new Parser().endianess(le).int32("start").int32("end").floatle("score")
        })
      }
    });
    return {
      bigWigParser,
      bigBedParser,
      summaryParser,
      leafParser
    };
  }
  class BlockView {
    constructor(bbi, refsByName, cirTreeOffset, isBigEndian, isCompressed, blockType) {
      this.bbi = bbi;
      this.refsByName = refsByName;
      this.cirTreeOffset = cirTreeOffset;
      this.isBigEndian = isBigEndian;
      this.isCompressed = isCompressed;
      this.blockType = blockType;
      this.featureCache = new _default({
        cache: new quickLru({ maxSize: 1e3 }),
        fill: async (requestData, signal) => {
          const len2 = Number(requestData.length);
          const off = Number(requestData.offset);
          const { buffer: buffer$1 } = await this.bbi.read(buffer.Buffer.alloc(len2), 0, len2, off, {
            signal
          });
          return buffer$1;
        }
      });
      if (!(cirTreeOffset >= 0)) {
        throw new Error("invalid cirTreeOffset!");
      }
      const parsers = getParsers$1(isBigEndian);
      this.leafParser = parsers.leafParser;
      this.bigBedParser = parsers.bigBedParser;
    }
    async readWigData(chrName, start, end, observer, opts) {
      try {
        const { refsByName, bbi, cirTreeOffset, isBigEndian } = this;
        const chrId = refsByName[chrName];
        if (chrId === void 0) {
          observer.complete();
        }
        const request = { chrId, start, end };
        if (!this.cirTreePromise) {
          this.cirTreePromise = bbi.read(buffer.Buffer.alloc(48), 0, 48, Number(cirTreeOffset), opts);
        }
        const { buffer: buffer$1 } = await this.cirTreePromise;
        const cirBlockSize = isBigEndian ? buffer$1.readUInt32BE(4) : buffer$1.readUInt32LE(4);
        let blocksToFetch = [];
        let outstanding = 0;
        const cirFobRecur2 = (cirBlockData, offset, level) => {
          try {
            const data = cirBlockData.subarray(offset);
            const p = this.leafParser.parse(data);
            if (p.blocksToFetch) {
              blocksToFetch = blocksToFetch.concat(p.blocksToFetch.filter((f) => filterFeats(f)).map((l) => ({
                offset: l.blockOffset,
                length: l.blockSize
              })));
            }
            if (p.recurOffsets) {
              const recurOffsets = p.recurOffsets.filter((f) => filterFeats(f)).map((l) => Number(l.blockOffset));
              if (recurOffsets.length > 0) {
                cirFobRecur(recurOffsets, level + 1);
              }
            }
          } catch (e) {
            observer.error(e);
          }
        };
        const filterFeats = (b) => {
          const { startChrom, startBase, endChrom, endBase } = b;
          return (startChrom < chrId || startChrom === chrId && startBase <= end) && (endChrom > chrId || endChrom === chrId && endBase >= start);
        };
        const cirFobStartFetch = async (off, fr, level) => {
          try {
            const length = fr.max() - fr.min();
            const offset = fr.min();
            const resultBuffer = await this.featureCache.get(`${length}_${offset}`, { length, offset }, opts === null || opts === void 0 ? void 0 : opts.signal);
            for (const element of off) {
              if (fr.contains(element)) {
                cirFobRecur2(resultBuffer, element - offset, level);
                outstanding -= 1;
                if (outstanding === 0) {
                  this.readFeatures(observer, blocksToFetch, { ...opts, request });
                }
              }
            }
          } catch (e) {
            observer.error(e);
          }
        };
        const cirFobRecur = (offset, level) => {
          try {
            outstanding += offset.length;
            const maxCirBlockSpan = 4 + Number(cirBlockSize) * 32;
            let spans = new Range(offset[0], offset[0] + maxCirBlockSpan);
            for (let i2 = 1; i2 < offset.length; i2 += 1) {
              const blockSpan = new Range(offset[i2], offset[i2] + maxCirBlockSpan);
              spans = spans.union(blockSpan);
            }
            spans.getRanges().map((fr) => cirFobStartFetch(offset, fr, level));
          } catch (e) {
            observer.error(e);
          }
        };
        return cirFobRecur([Number(cirTreeOffset) + 48], 1);
      } catch (e) {
        observer.error(e);
      }
    }
    parseSummaryBlock(buffer2, startOffset, request) {
      const features = [];
      let offset = startOffset;
      const dataView = new DataView(buffer2.buffer, buffer2.byteOffset, buffer2.length);
      while (offset < buffer2.byteLength) {
        const chromId = dataView.getUint32(offset, true);
        offset += 4;
        const start = dataView.getUint32(offset, true);
        offset += 4;
        const end = dataView.getUint32(offset, true);
        offset += 4;
        const validCnt = dataView.getUint32(offset, true);
        offset += 4;
        const minScore = dataView.getFloat32(offset, true);
        offset += 4;
        const maxScore = dataView.getFloat32(offset, true);
        offset += 4;
        const sumData = dataView.getFloat32(offset, true);
        offset += 4;
        offset += 4;
        if (request ? chromId === request.chrId && coordFilter(start, end, request.start, request.end) : true) {
          features.push({
            start,
            end,
            maxScore,
            minScore,
            summary: true,
            score: sumData / (validCnt || 1)
          });
        }
      }
      return features;
    }
    parseBigBedBlock(data, startOffset, offset, request) {
      const items = [];
      let currOffset = startOffset;
      while (currOffset < data.byteLength) {
        const res = this.bigBedParser.parse(data.subarray(currOffset));
        items.push({ ...res, uniqueId: `bb-${offset + currOffset}` });
        currOffset += res.offset;
      }
      return request ? items.filter((f) => coordFilter(f.start, f.end, request.start, request.end)) : items;
    }
    parseBigWigBlock(buffer2, startOffset, request) {
      const b = buffer2.subarray(startOffset);
      const dataView = new DataView(b.buffer, b.byteOffset, b.length);
      let offset = 0;
      offset += 4;
      const blockStart = dataView.getInt32(offset, true);
      offset += 8;
      const itemStep = dataView.getUint32(offset, true);
      offset += 4;
      const itemSpan = dataView.getUint32(offset, true);
      offset += 4;
      const blockType = dataView.getUint8(offset);
      offset += 2;
      const itemCount = dataView.getUint16(offset, true);
      offset += 2;
      const items = new Array(itemCount);
      switch (blockType) {
        case 1: {
          for (let i2 = 0; i2 < itemCount; i2++) {
            const start = dataView.getInt32(offset, true);
            offset += 4;
            const end = dataView.getInt32(offset, true);
            offset += 4;
            const score = dataView.getFloat32(offset, true);
            offset += 4;
            items[i2] = { start, end, score };
          }
          break;
        }
        case 2: {
          for (let i2 = 0; i2 < itemCount; i2++) {
            const start = dataView.getInt32(offset, true);
            offset += 4;
            const score = dataView.getFloat32(offset, true);
            offset += 4;
            items[i2] = { score, start, end: start + itemSpan };
          }
          break;
        }
        case 3: {
          for (let i2 = 0; i2 < itemCount; i2++) {
            const score = dataView.getFloat32(offset, true);
            offset += 4;
            const start = blockStart + i2 * itemStep;
            items[i2] = { score, start, end: start + itemSpan };
          }
          break;
        }
      }
      return request ? items.filter((f) => coordFilter(f.start, f.end, request.start, request.end)) : items;
    }
    async readFeatures(observer, blocks, opts = {}) {
      try {
        const { blockType, isCompressed } = this;
        const { signal, request } = opts;
        const blockGroupsToFetch = groupBlocks(blocks);
        checkAbortSignal(signal);
        await Promise.all(blockGroupsToFetch.map(async (blockGroup) => {
          checkAbortSignal(signal);
          const { length, offset } = blockGroup;
          const data = await this.featureCache.get(`${length}_${offset}`, blockGroup, signal);
          for (const block of blockGroup.blocks) {
            checkAbortSignal(signal);
            let blockOffset = Number(block.offset) - Number(blockGroup.offset);
            let resultData = data;
            if (isCompressed) {
              resultData = unzip(data.subarray(blockOffset));
              blockOffset = 0;
            }
            checkAbortSignal(signal);
            switch (blockType) {
              case "summary": {
                observer.next(this.parseSummaryBlock(resultData, blockOffset, request));
                break;
              }
              case "bigwig": {
                observer.next(this.parseBigWigBlock(resultData, blockOffset, request));
                break;
              }
              case "bigbed": {
                observer.next(this.parseBigBedBlock(resultData, blockOffset, Number(block.offset) * (1 << 8), request));
                break;
              }
              default: {
                console.warn(`Don't know what to do with ${blockType}`);
              }
            }
          }
        }));
        observer.complete();
      } catch (e) {
        observer.error(e);
      }
    }
  }
  var LocalFile = {};
  class RemoteFile {
    async getBufferFromResponse(response) {
      if (typeof response.buffer === "function") {
        return response.buffer();
      } else if (typeof response.arrayBuffer === "function") {
        const resp = await response.arrayBuffer();
        return buffer.Buffer.from(resp);
      } else {
        throw new TypeError("invalid HTTP response object, has no buffer method, and no arrayBuffer method");
      }
    }
    constructor(source, opts = {}) {
      this.baseOverrides = {};
      this.url = source;
      const fetch = opts.fetch || globalThis.fetch.bind(globalThis);
      if (!fetch) {
        throw new TypeError(`no fetch function supplied, and none found in global environment`);
      }
      if (opts.overrides) {
        this.baseOverrides = opts.overrides;
      }
      this.fetchImplementation = fetch;
    }
    async fetch(input, init) {
      let response;
      try {
        response = await this.fetchImplementation(input, init);
      } catch (e) {
        if (`${e}`.includes("Failed to fetch")) {
          console.warn(`generic-filehandle: refetching ${input} to attempt to work around chrome CORS header caching bug`);
          response = await this.fetchImplementation(input, {
            ...init,
            cache: "reload"
          });
        } else {
          throw e;
        }
      }
      return response;
    }
    async read(buffer2, offset = 0, length, position = 0, opts = {}) {
      const { headers = {}, signal, overrides = {} } = opts;
      if (length < Infinity) {
        headers.range = `bytes=${position}-${position + length}`;
      } else if (length === Infinity && position !== 0) {
        headers.range = `bytes=${position}-`;
      }
      const args = {
        ...this.baseOverrides,
        ...overrides,
        headers: {
          ...headers,
          ...overrides.headers,
          ...this.baseOverrides.headers
        },
        method: "GET",
        redirect: "follow",
        mode: "cors",
        signal
      };
      const response = await this.fetch(this.url, args);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText} ${this.url}`);
      }
      if (response.status === 200 && position === 0 || response.status === 206) {
        const responseData = await this.getBufferFromResponse(response);
        const bytesCopied = responseData.copy(buffer2, offset, 0, Math.min(length, responseData.length));
        const res = response.headers.get("content-range");
        const sizeMatch = /\/(\d+)$/.exec(res || "");
        if (sizeMatch && sizeMatch[1]) {
          this._stat = { size: parseInt(sizeMatch[1], 10) };
        }
        return { bytesRead: bytesCopied, buffer: buffer2 };
      }
      if (response.status === 200) {
        throw new Error("${this.url} fetch returned status 200, expected 206");
      }
      throw new Error(`HTTP ${response.status} fetching ${this.url}`);
    }
    async readFile(options = {}) {
      let encoding;
      let opts;
      if (typeof options === "string") {
        encoding = options;
        opts = {};
      } else {
        encoding = options.encoding;
        opts = options;
        delete opts.encoding;
      }
      const { headers = {}, signal, overrides = {} } = opts;
      const args = {
        headers,
        method: "GET",
        redirect: "follow",
        mode: "cors",
        signal,
        ...this.baseOverrides,
        ...overrides
      };
      const response = await this.fetch(this.url, args);
      if (!response) {
        throw new Error("generic-filehandle failed to fetch");
      }
      if (response.status !== 200) {
        throw Object.assign(new Error(`HTTP ${response.status} fetching ${this.url}`), {
          status: response.status
        });
      }
      if (encoding === "utf8") {
        return response.text();
      }
      if (encoding) {
        throw new Error(`unsupported encoding: ${encoding}`);
      }
      return this.getBufferFromResponse(response);
    }
    async stat() {
      if (!this._stat) {
        const buf = buffer.Buffer.allocUnsafe(10);
        await this.read(buf, 0, 10, 0);
        if (!this._stat) {
          throw new Error(`unable to determine size of file at ${this.url}`);
        }
      }
      return this._stat;
    }
    async close() {
      return;
    }
  }
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i2 = 0;
    if (m)
      return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function() {
          if (o && i2 >= o.length)
            o = void 0;
          return { value: o && o[i2++], done: !o };
        }
      };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m)
      return o;
    var i2 = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i2.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i2["return"]))
          m.call(i2);
      } finally {
        if (e)
          throw e.error;
      }
    }
    return ar;
  }
  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i2 = 0, l = from.length, ar; i2 < l; i2++) {
        if (ar || !(i2 in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i2);
          ar[i2] = from[i2];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  }
  typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };
  function isFunction(value) {
    return typeof value === "function";
  }
  function createErrorClass(createImpl) {
    var _super = function(instance) {
      Error.call(instance);
      instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
  }
  var UnsubscriptionError = createErrorClass(function(_super) {
    return function UnsubscriptionErrorImpl(errors) {
      _super(this);
      this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err2, i2) {
        return i2 + 1 + ") " + err2.toString();
      }).join("\n  ") : "";
      this.name = "UnsubscriptionError";
      this.errors = errors;
    };
  });
  function arrRemove(arr, item) {
    if (arr) {
      var index = arr.indexOf(item);
      0 <= index && arr.splice(index, 1);
    }
  }
  var Subscription = function() {
    function Subscription2(initialTeardown) {
      this.initialTeardown = initialTeardown;
      this.closed = false;
      this._parentage = null;
      this._finalizers = null;
    }
    Subscription2.prototype.unsubscribe = function() {
      var e_1, _a, e_2, _b;
      var errors;
      if (!this.closed) {
        this.closed = true;
        var _parentage = this._parentage;
        if (_parentage) {
          this._parentage = null;
          if (Array.isArray(_parentage)) {
            try {
              for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                var parent_1 = _parentage_1_1.value;
                parent_1.remove(this);
              }
            } catch (e_1_1) {
              e_1 = { error: e_1_1 };
            } finally {
              try {
                if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return))
                  _a.call(_parentage_1);
              } finally {
                if (e_1)
                  throw e_1.error;
              }
            }
          } else {
            _parentage.remove(this);
          }
        }
        var initialFinalizer = this.initialTeardown;
        if (isFunction(initialFinalizer)) {
          try {
            initialFinalizer();
          } catch (e) {
            errors = e instanceof UnsubscriptionError ? e.errors : [e];
          }
        }
        var _finalizers = this._finalizers;
        if (_finalizers) {
          this._finalizers = null;
          try {
            for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
              var finalizer = _finalizers_1_1.value;
              try {
                execFinalizer(finalizer);
              } catch (err2) {
                errors = errors !== null && errors !== void 0 ? errors : [];
                if (err2 instanceof UnsubscriptionError) {
                  errors = __spreadArray(__spreadArray([], __read(errors)), __read(err2.errors));
                } else {
                  errors.push(err2);
                }
              }
            }
          } catch (e_2_1) {
            e_2 = { error: e_2_1 };
          } finally {
            try {
              if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return))
                _b.call(_finalizers_1);
            } finally {
              if (e_2)
                throw e_2.error;
            }
          }
        }
        if (errors) {
          throw new UnsubscriptionError(errors);
        }
      }
    };
    Subscription2.prototype.add = function(teardown) {
      var _a;
      if (teardown && teardown !== this) {
        if (this.closed) {
          execFinalizer(teardown);
        } else {
          if (teardown instanceof Subscription2) {
            if (teardown.closed || teardown._hasParent(this)) {
              return;
            }
            teardown._addParent(this);
          }
          (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
        }
      }
    };
    Subscription2.prototype._hasParent = function(parent) {
      var _parentage = this._parentage;
      return _parentage === parent || Array.isArray(_parentage) && _parentage.includes(parent);
    };
    Subscription2.prototype._addParent = function(parent) {
      var _parentage = this._parentage;
      this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    };
    Subscription2.prototype._removeParent = function(parent) {
      var _parentage = this._parentage;
      if (_parentage === parent) {
        this._parentage = null;
      } else if (Array.isArray(_parentage)) {
        arrRemove(_parentage, parent);
      }
    };
    Subscription2.prototype.remove = function(teardown) {
      var _finalizers = this._finalizers;
      _finalizers && arrRemove(_finalizers, teardown);
      if (teardown instanceof Subscription2) {
        teardown._removeParent(this);
      }
    };
    Subscription2.EMPTY = function() {
      var empty = new Subscription2();
      empty.closed = true;
      return empty;
    }();
    return Subscription2;
  }();
  Subscription.EMPTY;
  function isSubscription(value) {
    return value instanceof Subscription || value && "closed" in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe);
  }
  function execFinalizer(finalizer) {
    if (isFunction(finalizer)) {
      finalizer();
    } else {
      finalizer.unsubscribe();
    }
  }
  var config = {
    onUnhandledError: null,
    onStoppedNotification: null,
    Promise: void 0,
    useDeprecatedSynchronousErrorHandling: false,
    useDeprecatedNextContext: false
  };
  var timeoutProvider = {
    setTimeout: function(handler, timeout) {
      var args = [];
      for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
      }
      var delegate = timeoutProvider.delegate;
      if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) {
        return delegate.setTimeout.apply(delegate, __spreadArray([handler, timeout], __read(args)));
      }
      return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
    },
    clearTimeout: function(handle) {
      var delegate = timeoutProvider.delegate;
      return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
    },
    delegate: void 0
  };
  function reportUnhandledError(err2) {
    timeoutProvider.setTimeout(function() {
      {
        throw err2;
      }
    });
  }
  function noop() {
  }
  function errorContext(cb) {
    {
      cb();
    }
  }
  var Subscriber = function(_super) {
    __extends(Subscriber2, _super);
    function Subscriber2(destination) {
      var _this = _super.call(this) || this;
      _this.isStopped = false;
      if (destination) {
        _this.destination = destination;
        if (isSubscription(destination)) {
          destination.add(_this);
        }
      } else {
        _this.destination = EMPTY_OBSERVER;
      }
      return _this;
    }
    Subscriber2.create = function(next, error, complete) {
      return new SafeSubscriber(next, error, complete);
    };
    Subscriber2.prototype.next = function(value) {
      if (this.isStopped)
        ;
      else {
        this._next(value);
      }
    };
    Subscriber2.prototype.error = function(err2) {
      if (this.isStopped)
        ;
      else {
        this.isStopped = true;
        this._error(err2);
      }
    };
    Subscriber2.prototype.complete = function() {
      if (this.isStopped)
        ;
      else {
        this.isStopped = true;
        this._complete();
      }
    };
    Subscriber2.prototype.unsubscribe = function() {
      if (!this.closed) {
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
        this.destination = null;
      }
    };
    Subscriber2.prototype._next = function(value) {
      this.destination.next(value);
    };
    Subscriber2.prototype._error = function(err2) {
      try {
        this.destination.error(err2);
      } finally {
        this.unsubscribe();
      }
    };
    Subscriber2.prototype._complete = function() {
      try {
        this.destination.complete();
      } finally {
        this.unsubscribe();
      }
    };
    return Subscriber2;
  }(Subscription);
  var _bind = Function.prototype.bind;
  function bind(fn, thisArg) {
    return _bind.call(fn, thisArg);
  }
  var ConsumerObserver = function() {
    function ConsumerObserver2(partialObserver) {
      this.partialObserver = partialObserver;
    }
    ConsumerObserver2.prototype.next = function(value) {
      var partialObserver = this.partialObserver;
      if (partialObserver.next) {
        try {
          partialObserver.next(value);
        } catch (error) {
          handleUnhandledError(error);
        }
      }
    };
    ConsumerObserver2.prototype.error = function(err2) {
      var partialObserver = this.partialObserver;
      if (partialObserver.error) {
        try {
          partialObserver.error(err2);
        } catch (error) {
          handleUnhandledError(error);
        }
      } else {
        handleUnhandledError(err2);
      }
    };
    ConsumerObserver2.prototype.complete = function() {
      var partialObserver = this.partialObserver;
      if (partialObserver.complete) {
        try {
          partialObserver.complete();
        } catch (error) {
          handleUnhandledError(error);
        }
      }
    };
    return ConsumerObserver2;
  }();
  var SafeSubscriber = function(_super) {
    __extends(SafeSubscriber2, _super);
    function SafeSubscriber2(observerOrNext, error, complete) {
      var _this = _super.call(this) || this;
      var partialObserver;
      if (isFunction(observerOrNext) || !observerOrNext) {
        partialObserver = {
          next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : void 0,
          error: error !== null && error !== void 0 ? error : void 0,
          complete: complete !== null && complete !== void 0 ? complete : void 0
        };
      } else {
        var context_1;
        if (_this && config.useDeprecatedNextContext) {
          context_1 = Object.create(observerOrNext);
          context_1.unsubscribe = function() {
            return _this.unsubscribe();
          };
          partialObserver = {
            next: observerOrNext.next && bind(observerOrNext.next, context_1),
            error: observerOrNext.error && bind(observerOrNext.error, context_1),
            complete: observerOrNext.complete && bind(observerOrNext.complete, context_1)
          };
        } else {
          partialObserver = observerOrNext;
        }
      }
      _this.destination = new ConsumerObserver(partialObserver);
      return _this;
    }
    return SafeSubscriber2;
  }(Subscriber);
  function handleUnhandledError(error) {
    {
      reportUnhandledError(error);
    }
  }
  function defaultErrorHandler(err2) {
    throw err2;
  }
  var EMPTY_OBSERVER = {
    closed: true,
    next: noop,
    error: defaultErrorHandler,
    complete: noop
  };
  var observable = function() {
    return typeof Symbol === "function" && Symbol.observable || "@@observable";
  }();
  function identity(x) {
    return x;
  }
  function pipeFromArray(fns) {
    if (fns.length === 0) {
      return identity;
    }
    if (fns.length === 1) {
      return fns[0];
    }
    return function piped(input) {
      return fns.reduce(function(prev, fn) {
        return fn(prev);
      }, input);
    };
  }
  var Observable = function() {
    function Observable2(subscribe) {
      if (subscribe) {
        this._subscribe = subscribe;
      }
    }
    Observable2.prototype.lift = function(operator) {
      var observable2 = new Observable2();
      observable2.source = this;
      observable2.operator = operator;
      return observable2;
    };
    Observable2.prototype.subscribe = function(observerOrNext, error, complete) {
      var _this = this;
      var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
      errorContext(function() {
        var _a = _this, operator = _a.operator, source = _a.source;
        subscriber.add(operator ? operator.call(subscriber, source) : source ? _this._subscribe(subscriber) : _this._trySubscribe(subscriber));
      });
      return subscriber;
    };
    Observable2.prototype._trySubscribe = function(sink) {
      try {
        return this._subscribe(sink);
      } catch (err2) {
        sink.error(err2);
      }
    };
    Observable2.prototype.forEach = function(next, promiseCtor) {
      var _this = this;
      promiseCtor = getPromiseCtor(promiseCtor);
      return new promiseCtor(function(resolve, reject) {
        var subscriber = new SafeSubscriber({
          next: function(value) {
            try {
              next(value);
            } catch (err2) {
              reject(err2);
              subscriber.unsubscribe();
            }
          },
          error: reject,
          complete: resolve
        });
        _this.subscribe(subscriber);
      });
    };
    Observable2.prototype._subscribe = function(subscriber) {
      var _a;
      return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
    };
    Observable2.prototype[observable] = function() {
      return this;
    };
    Observable2.prototype.pipe = function() {
      var operations = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        operations[_i] = arguments[_i];
      }
      return pipeFromArray(operations)(this);
    };
    Observable2.prototype.toPromise = function(promiseCtor) {
      var _this = this;
      promiseCtor = getPromiseCtor(promiseCtor);
      return new promiseCtor(function(resolve, reject) {
        var value;
        _this.subscribe(function(x) {
          return value = x;
        }, function(err2) {
          return reject(err2);
        }, function() {
          return resolve(value);
        });
      });
    };
    Observable2.create = function(subscribe) {
      return new Observable2(subscribe);
    };
    return Observable2;
  }();
  function getPromiseCtor(promiseCtor) {
    var _a;
    return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
  }
  function isObserver(value) {
    return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
  }
  function isSubscriber(value) {
    return value && value instanceof Subscriber || isObserver(value) && isSubscription(value);
  }
  function hasLift(source) {
    return isFunction(source === null || source === void 0 ? void 0 : source.lift);
  }
  function operate(init) {
    return function(source) {
      if (hasLift(source)) {
        return source.lift(function(liftedSource) {
          try {
            return init(liftedSource, this);
          } catch (err2) {
            this.error(err2);
          }
        });
      }
      throw new TypeError("Unable to lift unknown Observable type");
    };
  }
  function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
    return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
  }
  var OperatorSubscriber = function(_super) {
    __extends(OperatorSubscriber2, _super);
    function OperatorSubscriber2(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
      var _this = _super.call(this, destination) || this;
      _this.onFinalize = onFinalize;
      _this.shouldUnsubscribe = shouldUnsubscribe;
      _this._next = onNext ? function(value) {
        try {
          onNext(value);
        } catch (err2) {
          destination.error(err2);
        }
      } : _super.prototype._next;
      _this._error = onError ? function(err2) {
        try {
          onError(err2);
        } catch (err3) {
          destination.error(err3);
        } finally {
          this.unsubscribe();
        }
      } : _super.prototype._error;
      _this._complete = onComplete ? function() {
        try {
          onComplete();
        } catch (err2) {
          destination.error(err2);
        } finally {
          this.unsubscribe();
        }
      } : _super.prototype._complete;
      return _this;
    }
    OperatorSubscriber2.prototype.unsubscribe = function() {
      var _a;
      if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
        var closed_1 = this.closed;
        _super.prototype.unsubscribe.call(this);
        !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
      }
    };
    return OperatorSubscriber2;
  }(Subscriber);
  var EmptyError = createErrorClass(function(_super) {
    return function EmptyErrorImpl() {
      _super(this);
      this.name = "EmptyError";
      this.message = "no elements in sequence";
    };
  });
  function firstValueFrom(source, config2) {
    var hasConfig = typeof config2 === "object";
    return new Promise(function(resolve, reject) {
      var subscriber = new SafeSubscriber({
        next: function(value) {
          resolve(value);
          subscriber.unsubscribe();
        },
        error: reject,
        complete: function() {
          if (hasConfig) {
            resolve(config2.defaultValue);
          } else {
            reject(new EmptyError());
          }
        }
      });
      source.subscribe(subscriber);
    });
  }
  function scanInternals(accumulator, seed, hasSeed, emitOnNext, emitBeforeComplete) {
    return function(source, subscriber) {
      var hasState = hasSeed;
      var state = seed;
      var index = 0;
      source.subscribe(createOperatorSubscriber(subscriber, function(value) {
        var i2 = index++;
        state = hasState ? accumulator(state, value, i2) : (hasState = true, value);
        emitOnNext && subscriber.next(state);
      }, emitBeforeComplete && function() {
        hasState && subscriber.next(state);
        subscriber.complete();
      }));
    };
  }
  function reduce(accumulator, seed) {
    return operate(scanInternals(accumulator, seed, arguments.length >= 2, false, true));
  }
  var arrReducer = function(arr, value) {
    return arr.push(value), arr;
  };
  function toArray() {
    return operate(function(source, subscriber) {
      reduce(arrReducer, [])(source).subscribe(subscriber);
    });
  }
  const BIG_WIG_MAGIC = -2003829722;
  const BIG_BED_MAGIC = -2021002517;
  function toString(arr) {
    return new TextDecoder().decode(arr);
  }
  function getParsers(isBE) {
    const le = isBE ? "big" : "little";
    const headerParser = new Parser().endianess(le).int32("magic").uint16("version").uint16("numZoomLevels").uint64("chromTreeOffset").uint64("unzoomedDataOffset").uint64("unzoomedIndexOffset").uint16("fieldCount").uint16("definedFieldCount").uint64("asOffset").uint64("totalSummaryOffset").uint32("uncompressBufSize").uint64("extHeaderOffset").array("zoomLevels", {
      length: "numZoomLevels",
      type: new Parser().endianess(le).uint32("reductionLevel").uint32("reserved").uint64("dataOffset").uint64("indexOffset")
    });
    const totalSummaryParser = new Parser().endianess(le).uint64("basesCovered").doublele("scoreMin").doublele("scoreMax").doublele("scoreSum").doublele("scoreSumSquares");
    const chromTreeParser = new Parser().endianess(le).uint32("magic").uint32("blockSize").uint32("keySize").uint32("valSize").uint64("itemCount");
    const isLeafNode = new Parser().endianess(le).uint8("isLeafNode").skip(1).uint16("cnt").saveOffset("offset");
    return {
      chromTreeParser,
      totalSummaryParser,
      headerParser,
      isLeafNode
    };
  }
  class BBI {
    /* fetch and parse header information from a bigwig or bigbed file
     * @param abortSignal - abort the operation, can be null
     * @return a Header object
     */
    getHeader(opts) {
      if (!this.headerP) {
        this.headerP = this._getHeader(opts).catch((e) => {
          this.headerP = void 0;
          throw e;
        });
      }
      return this.headerP;
    }
    /*
     * @param filehandle - a filehandle from generic-filehandle or implementing something similar to the node10 fs.promises API
     *
     * @param path - a Local file path as a string
     *
     * @param url - a URL string
     *
     * @param renameRefSeqs - an optional method to rename the internal reference
     * sequences using a mapping function
     */
    constructor(args) {
      const { filehandle, renameRefSeqs = (s) => s, path, url } = args;
      this.renameRefSeqs = renameRefSeqs;
      if (filehandle) {
        this.bbi = filehandle;
      } else if (url) {
        this.bbi = new RemoteFile(url);
      } else if (path) {
        this.bbi = new LocalFile(path);
      } else {
        throw new Error("no file given");
      }
    }
    async _getHeader(opts) {
      const header = await this._getMainHeader(opts);
      const chroms = await this._readChromTree(header, opts);
      return { ...header, ...chroms };
    }
    async _getMainHeader(opts, requestSize = 2e3) {
      const { buffer: buffer$1 } = await this.bbi.read(buffer.Buffer.alloc(requestSize), 0, requestSize, 0, opts);
      const isBigEndian = this._isBigEndian(buffer$1);
      const ret = getParsers(isBigEndian);
      const header = ret.headerParser.parse(buffer$1);
      const { magic, asOffset, totalSummaryOffset } = header;
      header.fileType = magic === BIG_BED_MAGIC ? "bigbed" : "bigwig";
      if (asOffset > requestSize || totalSummaryOffset > requestSize) {
        return this._getMainHeader(opts, requestSize * 2);
      }
      if (asOffset) {
        const off = Number(header.asOffset);
        header.autoSql = toString(buffer$1.subarray(off, buffer$1.indexOf(0, off)));
      }
      if (header.totalSummaryOffset > requestSize - 8 * 5) {
        return this._getMainHeader(opts, requestSize * 2);
      }
      if (header.totalSummaryOffset) {
        const tail = buffer$1.subarray(Number(header.totalSummaryOffset));
        const sum = ret.totalSummaryParser.parse(tail);
        header.totalSummary = { ...sum, basesCovered: Number(sum.basesCovered) };
      }
      return { ...header, isBigEndian };
    }
    _isBigEndian(buffer2) {
      let ret = buffer2.readInt32LE(0);
      if (ret === BIG_WIG_MAGIC || ret === BIG_BED_MAGIC) {
        return false;
      }
      ret = buffer2.readInt32BE(0);
      if (ret === BIG_WIG_MAGIC || ret === BIG_BED_MAGIC) {
        return true;
      }
      throw new Error("not a BigWig/BigBed file");
    }
    // todo: add progress if long running
    async _readChromTree(header, opts) {
      const isBE = header.isBigEndian;
      const le = isBE ? "big" : "little";
      const refsByNumber = [];
      const refsByName = {};
      let unzoomedDataOffset = Number(header.unzoomedDataOffset);
      const chromTreeOffset = Number(header.chromTreeOffset);
      while (unzoomedDataOffset % 4 !== 0) {
        unzoomedDataOffset += 1;
      }
      const off = unzoomedDataOffset - chromTreeOffset;
      const { buffer: buffer$1 } = await this.bbi.read(buffer.Buffer.alloc(off), 0, off, Number(chromTreeOffset), opts);
      const p = getParsers(isBE);
      const { keySize } = p.chromTreeParser.parse(buffer$1);
      const leafNodeParser = new Parser().endianess(le).string("key", { stripNull: true, length: keySize }).uint32("refId").uint32("refSize").saveOffset("offset");
      const nonleafNodeParser = new Parser().endianess(le).skip(keySize).uint64("childOffset").saveOffset("offset");
      const rootNodeOffset = 32;
      const bptReadNode = async (currentOffset) => {
        let offset = currentOffset;
        if (offset >= buffer$1.length) {
          throw new Error("reading beyond end of buffer");
        }
        const ret = p.isLeafNode.parse(buffer$1.subarray(offset));
        const { isLeafNode, cnt } = ret;
        offset += ret.offset;
        if (isLeafNode) {
          for (let n = 0; n < cnt; n += 1) {
            const leafRet = leafNodeParser.parse(buffer$1.subarray(offset));
            offset += leafRet.offset;
            const { key, refId, refSize } = leafRet;
            const refRec = { name: key, id: refId, length: refSize };
            refsByName[this.renameRefSeqs(key)] = refId;
            refsByNumber[refId] = refRec;
          }
        } else {
          const nextNodes = [];
          for (let n = 0; n < cnt; n += 1) {
            const nonleafRet = nonleafNodeParser.parse(buffer$1.subarray(offset));
            const { childOffset } = nonleafRet;
            offset += nonleafRet.offset;
            nextNodes.push(bptReadNode(Number(childOffset) - Number(chromTreeOffset)));
          }
          await Promise.all(nextNodes);
        }
      };
      await bptReadNode(rootNodeOffset);
      return {
        refsByName,
        refsByNumber
      };
    }
    /*
     * fetches the "unzoomed" view of the bigwig data. this is the default for bigbed
     * @param abortSignal - a signal to optionally abort this operation
     */
    async getUnzoomedView(opts) {
      const { unzoomedIndexOffset, refsByName, uncompressBufSize, isBigEndian, fileType } = await this.getHeader(opts);
      return new BlockView(this.bbi, refsByName, unzoomedIndexOffset, isBigEndian, uncompressBufSize > 0, fileType);
    }
    /**
     * Gets features from a BigWig file
     *
     * @param refName - The chromosome name
     * @param start - The start of a region
     * @param end - The end of a region
     * @param opts - An object containing basesPerSpan (e.g. pixels per basepair) or scale used to infer the zoomLevel to use
     */
    async getFeatureStream(refName, start, end, opts) {
      await this.getHeader(opts);
      const chrName = this.renameRefSeqs(refName);
      let view;
      const { basesPerSpan, scale } = opts || {};
      if (basesPerSpan) {
        view = await this.getView(1 / basesPerSpan, opts);
      } else if (scale) {
        view = await this.getView(scale, opts);
      } else {
        view = await this.getView(1, opts);
      }
      return new Observable((observer) => {
        view.readWigData(chrName, start, end, observer, opts);
      });
    }
    async getFeatures(refName, start, end, opts) {
      const ob = await this.getFeatureStream(refName, start, end, opts);
      const ret = await firstValueFrom(ob.pipe(toArray()));
      return ret.flat();
    }
  }
  class BigWig extends BBI {
    /**
     * Retrieves a BlockView of a specific zoomLevel
     *
     * @param scale - number
     * @param opts - An object containing basesPerSpan (e.g. pixels per basepair) or scale used to infer the zoomLevel to use
     */
    async getView(scale, opts) {
      const { zoomLevels, refsByName, fileSize, isBigEndian, uncompressBufSize } = await this.getHeader(opts);
      const basesPerPx = 1 / scale;
      let maxLevel = zoomLevels.length;
      if (!fileSize) {
        maxLevel -= 1;
      }
      for (let i2 = maxLevel; i2 >= 0; i2 -= 1) {
        const zh = zoomLevels[i2];
        if (zh && zh.reductionLevel <= 2 * basesPerPx) {
          const indexOffset = Number(zh.indexOffset);
          return new BlockView(this.bbi, refsByName, indexOffset, isBigEndian, uncompressBufSize > 0, "summary");
        }
      }
      return this.getUnzoomedView(opts);
    }
  }
  globalThis.Buffer = buffer.Buffer;
  const getbw = async (offscreen, url, y, chromValue, startValue, endValue, scaleValue, widthValue, heightValue, color2, showSpin) => {
    console.log("start getbw");
    console.log(widthValue, heightValue);
    const filehandle = new RemoteFile(url);
    const file = new BigWig({
      filehandle
    });
    const context = offscreen.getContext("2d");
    const results = await file.getFeatures(chromValue, startValue, endValue, { scale: scaleValue });
    const imageBitmap = drawCustomChart(results, y, chromValue, startValue, endValue, scaleValue, widthValue, heightValue, color2, showSpin, context, offscreen);
    console.img(imageBitmap);
    return imageBitmap;
  };
  function drawCustomChart(results, y, chromValue, startValue, endValue, scaleValue, widthValue, heightValue, color2, showSpin, context, offscreen) {
    console.log("start drawCustomChart");
    console.log(widthValue, heightValue);
    let data = _makeInitialRequest(widthValue, results).drawData[0].data;
    if (data.length > 1e3) {
      console.log(">10000");
      data = largestTriangleThreeBucket(data, 1e3, "pos", "score");
    }
    console.log(data[0]);
    const maxCount = max(data, function(d) {
      return d.score;
    });
    const minCount = min(data, function(d) {
      return d.score;
    });
    var xScale = linear().domain([startValue, endValue]).range([0, widthValue]);
    var colorScale = quantize().range([color2.zero_rgba, color2.min_rgba, color2.max_rgba]).domain([0, minCount, maxCount]).nice(200);
    data.forEach(function(d) {
      var x = xScale(d.pos);
      colorScale(d.score);
      context.fillStyle = "red";
      context.fillRect(x, 50, 5, 200);
    });
    context.fillStyle = "red";
    context.fillRect(694.643589617448, 40, 1, 40);
    context.fillRect(30, 40, 1, 40);
    console.log(offscreen.transferToImageBitmap());
    console.img(offscreen);
    const imageBitmap = offscreen.transferToImageBitmap();
    return imageBitmap;
  }
  function largestTriangleThreeBucket(data, threshold, xProperty, yProperty) {
    yProperty = yProperty || 0;
    xProperty = xProperty || 1;
    var m = Math.floor, y = Math.abs, f = data.length;
    if (threshold >= f || 0 === threshold) {
      return data;
    }
    var n = [], t = 0, p = (f - 2) / (threshold - 2), c = 0, v, u, w;
    n[t++] = data[c];
    for (var e = 0; e < threshold - 2; e++) {
      for (var g = 0, h = 0, a = m((e + 1) * p) + 1, d = m((e + 2) * p) + 1, d = d < f ? d : f, k = d - a; a < d; a++) {
        g += +data[a][xProperty], h += +data[a][yProperty];
      }
      for (var g = g / k, h = h / k, a = m((e + 0) * p) + 1, d = m((e + 1) * p) + 1, k = +data[c][xProperty], x = +data[c][yProperty], c = -1; a < d; a++) {
        "undefined" != typeof data[a] && (u = 0.5 * y((k - g) * (data[a][yProperty] - x) - (k - data[a][xProperty]) * (h - x)), u > c && (c = u, v = data[a], w = a));
      }
      n[t++] = v;
      c = w;
    }
    n[t++] = data[f - 1];
    return n;
  }
  const _makeInitialRequest = (widthValue, xdata) => {
    const xvalues2 = xdata.map((obj) => {
      const average = (obj.start + obj.end) / 2;
      const score = obj.score;
      return { pos: average, score };
    });
    const xvalues3 = [{
      // color: props.option.series[0].areaStyle.color,
      data: xvalues2
    }];
    return {
      // canvasEle: canvasEle,
      drawData: xvalues3
    };
  };
  expose(getbw);
})();
