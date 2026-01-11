(() => {
  var __create = Object.create;
  var __getProtoOf = Object.getPrototypeOf;
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __toESM = (mod, isNodeMode, target) => {
    target = mod != null ? __create(__getProtoOf(mod)) : {};
    const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
    for (let key of __getOwnPropNames(mod))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: () => mod[key],
          enumerable: true
        });
    return to;
  };
  var __moduleCache = /* @__PURE__ */ new WeakMap;
  var __toCommonJS = (from) => {
    var entry = __moduleCache.get(from), desc;
    if (entry)
      return entry;
    entry = __defProp({}, "__esModule", { value: true });
    if (from && typeof from === "object" || typeof from === "function")
      __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
        get: () => from[key],
        enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
      }));
    __moduleCache.set(from, entry);
    return entry;
  };
  var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {
        get: all[name],
        enumerable: true,
        configurable: true,
        set: (newValue) => all[name] = () => newValue
      });
  };

  // ../../node_modules/dexie/dist/dexie.js
  var require_dexie = __commonJS((exports, module) => {
    (function(global2, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, global2.Dexie = factory());
    })(exports, function() {
      /*! *****************************************************************************
          Copyright (c) Microsoft Corporation.
          Permission to use, copy, modify, and/or distribute this software for any
          purpose with or without fee is hereby granted.
          THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
          REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
          AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
          INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
          LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
          OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
          PERFORMANCE OF THIS SOFTWARE.
          ***************************************************************************** */
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
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
      }
      var __assign = function() {
        __assign = Object.assign || function __assign(t) {
          for (var s, i2 = 1, n = arguments.length;i2 < n; i2++) {
            s = arguments[i2];
            for (var p in s)
              if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2)
          for (var i2 = 0, l = from.length, ar;i2 < l; i2++) {
            if (ar || !(i2 in from)) {
              if (!ar)
                ar = Array.prototype.slice.call(from, 0, i2);
              ar[i2] = from[i2];
            }
          }
        return to.concat(ar || Array.prototype.slice.call(from));
      }
      var _global = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
      var keys = Object.keys;
      var isArray = Array.isArray;
      if (typeof Promise !== "undefined" && !_global.Promise) {
        _global.Promise = Promise;
      }
      function extend(obj, extension) {
        if (typeof extension !== "object")
          return obj;
        keys(extension).forEach(function(key) {
          obj[key] = extension[key];
        });
        return obj;
      }
      var getProto = Object.getPrototypeOf;
      var _hasOwn = {}.hasOwnProperty;
      function hasOwn(obj, prop) {
        return _hasOwn.call(obj, prop);
      }
      function props(proto, extension) {
        if (typeof extension === "function")
          extension = extension(getProto(proto));
        (typeof Reflect === "undefined" ? keys : Reflect.ownKeys)(extension).forEach(function(key) {
          setProp(proto, key, extension[key]);
        });
      }
      var defineProperty = Object.defineProperty;
      function setProp(obj, prop, functionOrGetSet, options) {
        defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === "function" ? { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } : { value: functionOrGetSet, configurable: true, writable: true }, options));
      }
      function derive(Child) {
        return {
          from: function(Parent) {
            Child.prototype = Object.create(Parent.prototype);
            setProp(Child.prototype, "constructor", Child);
            return {
              extend: props.bind(null, Child.prototype)
            };
          }
        };
      }
      var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
      function getPropertyDescriptor(obj, prop) {
        var pd = getOwnPropertyDescriptor(obj, prop);
        var proto;
        return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
      }
      var _slice = [].slice;
      function slice(args, start, end) {
        return _slice.call(args, start, end);
      }
      function override(origFunc, overridedFactory) {
        return overridedFactory(origFunc);
      }
      function assert2(b) {
        if (!b)
          throw new Error("Assertion Failed");
      }
      function asap$1(fn) {
        if (_global.setImmediate)
          setImmediate(fn);
        else
          setTimeout(fn, 0);
      }
      function arrayToObject(array, extractor) {
        return array.reduce(function(result, item, i2) {
          var nameAndValue = extractor(item, i2);
          if (nameAndValue)
            result[nameAndValue[0]] = nameAndValue[1];
          return result;
        }, {});
      }
      function getByKeyPath(obj, keyPath) {
        if (typeof keyPath === "string" && hasOwn(obj, keyPath))
          return obj[keyPath];
        if (!keyPath)
          return obj;
        if (typeof keyPath !== "string") {
          var rv = [];
          for (var i2 = 0, l = keyPath.length;i2 < l; ++i2) {
            var val = getByKeyPath(obj, keyPath[i2]);
            rv.push(val);
          }
          return rv;
        }
        var period = keyPath.indexOf(".");
        if (period !== -1) {
          var innerObj = obj[keyPath.substr(0, period)];
          return innerObj == null ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
        }
        return;
      }
      function setByKeyPath(obj, keyPath, value) {
        if (!obj || keyPath === undefined)
          return;
        if ("isFrozen" in Object && Object.isFrozen(obj))
          return;
        if (typeof keyPath !== "string" && "length" in keyPath) {
          assert2(typeof value !== "string" && "length" in value);
          for (var i2 = 0, l = keyPath.length;i2 < l; ++i2) {
            setByKeyPath(obj, keyPath[i2], value[i2]);
          }
        } else {
          var period = keyPath.indexOf(".");
          if (period !== -1) {
            var currentKeyPath = keyPath.substr(0, period);
            var remainingKeyPath = keyPath.substr(period + 1);
            if (remainingKeyPath === "")
              if (value === undefined) {
                if (isArray(obj) && !isNaN(parseInt(currentKeyPath)))
                  obj.splice(currentKeyPath, 1);
                else
                  delete obj[currentKeyPath];
              } else
                obj[currentKeyPath] = value;
            else {
              var innerObj = obj[currentKeyPath];
              if (!innerObj || !hasOwn(obj, currentKeyPath))
                innerObj = obj[currentKeyPath] = {};
              setByKeyPath(innerObj, remainingKeyPath, value);
            }
          } else {
            if (value === undefined) {
              if (isArray(obj) && !isNaN(parseInt(keyPath)))
                obj.splice(keyPath, 1);
              else
                delete obj[keyPath];
            } else
              obj[keyPath] = value;
          }
        }
      }
      function delByKeyPath(obj, keyPath) {
        if (typeof keyPath === "string")
          setByKeyPath(obj, keyPath, undefined);
        else if ("length" in keyPath)
          [].map.call(keyPath, function(kp) {
            setByKeyPath(obj, kp, undefined);
          });
      }
      function shallowClone(obj) {
        var rv = {};
        for (var m in obj) {
          if (hasOwn(obj, m))
            rv[m] = obj[m];
        }
        return rv;
      }
      var concat = [].concat;
      function flatten(a) {
        return concat.apply([], a);
      }
      var intrinsicTypeNames = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(flatten([8, 16, 32, 64].map(function(num) {
        return ["Int", "Uint", "Float"].map(function(t) {
          return t + num + "Array";
        });
      }))).filter(function(t) {
        return _global[t];
      });
      var intrinsicTypes = new Set(intrinsicTypeNames.map(function(t) {
        return _global[t];
      }));
      function cloneSimpleObjectTree(o) {
        var rv = {};
        for (var k in o)
          if (hasOwn(o, k)) {
            var v = o[k];
            rv[k] = !v || typeof v !== "object" || intrinsicTypes.has(v.constructor) ? v : cloneSimpleObjectTree(v);
          }
        return rv;
      }
      function objectIsEmpty(o) {
        for (var k in o)
          if (hasOwn(o, k))
            return false;
        return true;
      }
      var circularRefs = null;
      function deepClone(any) {
        circularRefs = new WeakMap;
        var rv = innerDeepClone(any);
        circularRefs = null;
        return rv;
      }
      function innerDeepClone(x) {
        if (!x || typeof x !== "object")
          return x;
        var rv = circularRefs.get(x);
        if (rv)
          return rv;
        if (isArray(x)) {
          rv = [];
          circularRefs.set(x, rv);
          for (var i2 = 0, l = x.length;i2 < l; ++i2) {
            rv.push(innerDeepClone(x[i2]));
          }
        } else if (intrinsicTypes.has(x.constructor)) {
          rv = x;
        } else {
          var proto = getProto(x);
          rv = proto === Object.prototype ? {} : Object.create(proto);
          circularRefs.set(x, rv);
          for (var prop in x) {
            if (hasOwn(x, prop)) {
              rv[prop] = innerDeepClone(x[prop]);
            }
          }
        }
        return rv;
      }
      var toString = {}.toString;
      function toStringTag(o) {
        return toString.call(o).slice(8, -1);
      }
      var iteratorSymbol = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
      var getIteratorOf = typeof iteratorSymbol === "symbol" ? function(x) {
        var i2;
        return x != null && (i2 = x[iteratorSymbol]) && i2.apply(x);
      } : function() {
        return null;
      };
      function delArrayItem(a, x) {
        var i2 = a.indexOf(x);
        if (i2 >= 0)
          a.splice(i2, 1);
        return i2 >= 0;
      }
      var NO_CHAR_ARRAY = {};
      function getArrayOf(arrayLike) {
        var i2, a, x, it;
        if (arguments.length === 1) {
          if (isArray(arrayLike))
            return arrayLike.slice();
          if (this === NO_CHAR_ARRAY && typeof arrayLike === "string")
            return [arrayLike];
          if (it = getIteratorOf(arrayLike)) {
            a = [];
            while (x = it.next(), !x.done)
              a.push(x.value);
            return a;
          }
          if (arrayLike == null)
            return [arrayLike];
          i2 = arrayLike.length;
          if (typeof i2 === "number") {
            a = new Array(i2);
            while (i2--)
              a[i2] = arrayLike[i2];
            return a;
          }
          return [arrayLike];
        }
        i2 = arguments.length;
        a = new Array(i2);
        while (i2--)
          a[i2] = arguments[i2];
        return a;
      }
      var isAsyncFunction = typeof Symbol !== "undefined" ? function(fn) {
        return fn[Symbol.toStringTag] === "AsyncFunction";
      } : function() {
        return false;
      };
      var dexieErrorNames = [
        "Modify",
        "Bulk",
        "OpenFailed",
        "VersionChange",
        "Schema",
        "Upgrade",
        "InvalidTable",
        "MissingAPI",
        "NoSuchDatabase",
        "InvalidArgument",
        "SubTransaction",
        "Unsupported",
        "Internal",
        "DatabaseClosed",
        "PrematureCommit",
        "ForeignAwait"
      ];
      var idbDomErrorNames = [
        "Unknown",
        "Constraint",
        "Data",
        "TransactionInactive",
        "ReadOnly",
        "Version",
        "NotFound",
        "InvalidState",
        "InvalidAccess",
        "Abort",
        "Timeout",
        "QuotaExceeded",
        "Syntax",
        "DataClone"
      ];
      var errorList = dexieErrorNames.concat(idbDomErrorNames);
      var defaultTexts = {
        VersionChanged: "Database version changed by other database connection",
        DatabaseClosed: "Database has been closed",
        Abort: "Transaction aborted",
        TransactionInactive: "Transaction has already completed or failed",
        MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
      };
      function DexieError(name, msg) {
        this.name = name;
        this.message = msg;
      }
      derive(DexieError).from(Error).extend({
        toString: function() {
          return this.name + ": " + this.message;
        }
      });
      function getMultiErrorMessage(msg, failures) {
        return msg + ". Errors: " + Object.keys(failures).map(function(key) {
          return failures[key].toString();
        }).filter(function(v, i2, s) {
          return s.indexOf(v) === i2;
        }).join(`
`);
      }
      function ModifyError(msg, failures, successCount, failedKeys) {
        this.failures = failures;
        this.failedKeys = failedKeys;
        this.successCount = successCount;
        this.message = getMultiErrorMessage(msg, failures);
      }
      derive(ModifyError).from(DexieError);
      function BulkError(msg, failures) {
        this.name = "BulkError";
        this.failures = Object.keys(failures).map(function(pos) {
          return failures[pos];
        });
        this.failuresByPos = failures;
        this.message = getMultiErrorMessage(msg, this.failures);
      }
      derive(BulkError).from(DexieError);
      var errnames = errorList.reduce(function(obj, name) {
        return obj[name] = name + "Error", obj;
      }, {});
      var BaseException = DexieError;
      var exceptions = errorList.reduce(function(obj, name) {
        var fullName = name + "Error";
        function DexieError2(msgOrInner, inner) {
          this.name = fullName;
          if (!msgOrInner) {
            this.message = defaultTexts[name] || fullName;
            this.inner = null;
          } else if (typeof msgOrInner === "string") {
            this.message = "".concat(msgOrInner).concat(!inner ? "" : `
 ` + inner);
            this.inner = inner || null;
          } else if (typeof msgOrInner === "object") {
            this.message = "".concat(msgOrInner.name, " ").concat(msgOrInner.message);
            this.inner = msgOrInner;
          }
        }
        derive(DexieError2).from(BaseException);
        obj[name] = DexieError2;
        return obj;
      }, {});
      exceptions.Syntax = SyntaxError;
      exceptions.Type = TypeError;
      exceptions.Range = RangeError;
      var exceptionMap = idbDomErrorNames.reduce(function(obj, name) {
        obj[name + "Error"] = exceptions[name];
        return obj;
      }, {});
      function mapError(domError, message) {
        if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
          return domError;
        var rv = new exceptionMap[domError.name](message || domError.message, domError);
        if ("stack" in domError) {
          setProp(rv, "stack", { get: function() {
            return this.inner.stack;
          } });
        }
        return rv;
      }
      var fullNameExceptions = errorList.reduce(function(obj, name) {
        if (["Syntax", "Type", "Range"].indexOf(name) === -1)
          obj[name + "Error"] = exceptions[name];
        return obj;
      }, {});
      fullNameExceptions.ModifyError = ModifyError;
      fullNameExceptions.DexieError = DexieError;
      fullNameExceptions.BulkError = BulkError;
      function nop() {}
      function mirror(val) {
        return val;
      }
      function pureFunctionChain(f1, f2) {
        if (f1 == null || f1 === mirror)
          return f2;
        return function(val) {
          return f2(f1(val));
        };
      }
      function callBoth(on1, on2) {
        return function() {
          on1.apply(this, arguments);
          on2.apply(this, arguments);
        };
      }
      function hookCreatingChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          var res = f1.apply(this, arguments);
          if (res !== undefined)
            arguments[0] = res;
          var onsuccess = this.onsuccess, onerror = this.onerror;
          this.onsuccess = null;
          this.onerror = null;
          var res2 = f2.apply(this, arguments);
          if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
          if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
          return res2 !== undefined ? res2 : res;
        };
      }
      function hookDeletingChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          f1.apply(this, arguments);
          var onsuccess = this.onsuccess, onerror = this.onerror;
          this.onsuccess = this.onerror = null;
          f2.apply(this, arguments);
          if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
          if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        };
      }
      function hookUpdatingChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function(modifications) {
          var res = f1.apply(this, arguments);
          extend(modifications, res);
          var onsuccess = this.onsuccess, onerror = this.onerror;
          this.onsuccess = null;
          this.onerror = null;
          var res2 = f2.apply(this, arguments);
          if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
          if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
          return res === undefined ? res2 === undefined ? undefined : res2 : extend(res, res2);
        };
      }
      function reverseStoppableEventChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          if (f2.apply(this, arguments) === false)
            return false;
          return f1.apply(this, arguments);
        };
      }
      function promisableChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          var res = f1.apply(this, arguments);
          if (res && typeof res.then === "function") {
            var thiz = this, i2 = arguments.length, args = new Array(i2);
            while (i2--)
              args[i2] = arguments[i2];
            return res.then(function() {
              return f2.apply(thiz, args);
            });
          }
          return f2.apply(this, arguments);
        };
      }
      var debug = typeof location !== "undefined" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
      function setDebug(value, filter) {
        debug = value;
      }
      var INTERNAL = {};
      var ZONE_ECHO_LIMIT = 100, _a$1 = typeof Promise === "undefined" ? [] : function() {
        var globalP = Promise.resolve();
        if (typeof crypto === "undefined" || !crypto.subtle)
          return [globalP, getProto(globalP), globalP];
        var nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
        return [
          nativeP,
          getProto(nativeP),
          globalP
        ];
      }(), resolvedNativePromise = _a$1[0], nativePromiseProto = _a$1[1], resolvedGlobalPromise = _a$1[2], nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
      var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
      var patchGlobalPromise = !!resolvedGlobalPromise;
      function schedulePhysicalTick() {
        queueMicrotask(physicalTick);
      }
      var asap = function(callback, args) {
        microtickQueue.push([callback, args]);
        if (needsNewPhysicalTick) {
          schedulePhysicalTick();
          needsNewPhysicalTick = false;
        }
      };
      var isOutsideMicroTick = true, needsNewPhysicalTick = true, unhandledErrors = [], rejectingErrors = [], rejectionMapper = mirror;
      var globalPSD = {
        id: "global",
        global: true,
        ref: 0,
        unhandleds: [],
        onunhandled: nop,
        pgp: false,
        env: {},
        finalize: nop
      };
      var PSD = globalPSD;
      var microtickQueue = [];
      var numScheduledCalls = 0;
      var tickFinalizers = [];
      function DexiePromise(fn) {
        if (typeof this !== "object")
          throw new TypeError("Promises must be constructed via new");
        this._listeners = [];
        this._lib = false;
        var psd = this._PSD = PSD;
        if (typeof fn !== "function") {
          if (fn !== INTERNAL)
            throw new TypeError("Not a function");
          this._state = arguments[1];
          this._value = arguments[2];
          if (this._state === false)
            handleRejection(this, this._value);
          return;
        }
        this._state = null;
        this._value = null;
        ++psd.ref;
        executePromiseTask(this, fn);
      }
      var thenProp = {
        get: function() {
          var psd = PSD, microTaskId = totalEchoes;
          function then(onFulfilled, onRejected) {
            var _this = this;
            var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
            var cleanup = possibleAwait && !decrementExpectedAwaits();
            var rv = new DexiePromise(function(resolve, reject) {
              propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup), resolve, reject, psd));
            });
            if (this._consoleTask)
              rv._consoleTask = this._consoleTask;
            return rv;
          }
          then.prototype = INTERNAL;
          return then;
        },
        set: function(value) {
          setProp(this, "then", value && value.prototype === INTERNAL ? thenProp : {
            get: function() {
              return value;
            },
            set: thenProp.set
          });
        }
      };
      props(DexiePromise.prototype, {
        then: thenProp,
        _then: function(onFulfilled, onRejected) {
          propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
        },
        catch: function(onRejected) {
          if (arguments.length === 1)
            return this.then(null, onRejected);
          var type2 = arguments[0], handler = arguments[1];
          return typeof type2 === "function" ? this.then(null, function(err) {
            return err instanceof type2 ? handler(err) : PromiseReject(err);
          }) : this.then(null, function(err) {
            return err && err.name === type2 ? handler(err) : PromiseReject(err);
          });
        },
        finally: function(onFinally) {
          return this.then(function(value) {
            return DexiePromise.resolve(onFinally()).then(function() {
              return value;
            });
          }, function(err) {
            return DexiePromise.resolve(onFinally()).then(function() {
              return PromiseReject(err);
            });
          });
        },
        timeout: function(ms, msg) {
          var _this = this;
          return ms < Infinity ? new DexiePromise(function(resolve, reject) {
            var handle = setTimeout(function() {
              return reject(new exceptions.Timeout(msg));
            }, ms);
            _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
          }) : this;
        }
      });
      if (typeof Symbol !== "undefined" && Symbol.toStringTag)
        setProp(DexiePromise.prototype, Symbol.toStringTag, "Dexie.Promise");
      globalPSD.env = snapShot();
      function Listener(onFulfilled, onRejected, resolve, reject, zone) {
        this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
        this.onRejected = typeof onRejected === "function" ? onRejected : null;
        this.resolve = resolve;
        this.reject = reject;
        this.psd = zone;
      }
      props(DexiePromise, {
        all: function() {
          var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
          return new DexiePromise(function(resolve, reject) {
            if (values.length === 0)
              resolve([]);
            var remaining = values.length;
            values.forEach(function(a, i2) {
              return DexiePromise.resolve(a).then(function(x) {
                values[i2] = x;
                if (!--remaining)
                  resolve(values);
              }, reject);
            });
          });
        },
        resolve: function(value) {
          if (value instanceof DexiePromise)
            return value;
          if (value && typeof value.then === "function")
            return new DexiePromise(function(resolve, reject) {
              value.then(resolve, reject);
            });
          var rv = new DexiePromise(INTERNAL, true, value);
          return rv;
        },
        reject: PromiseReject,
        race: function() {
          var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
          return new DexiePromise(function(resolve, reject) {
            values.map(function(value) {
              return DexiePromise.resolve(value).then(resolve, reject);
            });
          });
        },
        PSD: {
          get: function() {
            return PSD;
          },
          set: function(value) {
            return PSD = value;
          }
        },
        totalEchoes: { get: function() {
          return totalEchoes;
        } },
        newPSD: newScope,
        usePSD,
        scheduler: {
          get: function() {
            return asap;
          },
          set: function(value) {
            asap = value;
          }
        },
        rejectionMapper: {
          get: function() {
            return rejectionMapper;
          },
          set: function(value) {
            rejectionMapper = value;
          }
        },
        follow: function(fn, zoneProps) {
          return new DexiePromise(function(resolve, reject) {
            return newScope(function(resolve2, reject2) {
              var psd = PSD;
              psd.unhandleds = [];
              psd.onunhandled = reject2;
              psd.finalize = callBoth(function() {
                var _this = this;
                run_at_end_of_this_or_next_physical_tick(function() {
                  _this.unhandleds.length === 0 ? resolve2() : reject2(_this.unhandleds[0]);
                });
              }, psd.finalize);
              fn();
            }, zoneProps, resolve, reject);
          });
        }
      });
      if (NativePromise) {
        if (NativePromise.allSettled)
          setProp(DexiePromise, "allSettled", function() {
            var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function(resolve) {
              if (possiblePromises.length === 0)
                resolve([]);
              var remaining = possiblePromises.length;
              var results = new Array(remaining);
              possiblePromises.forEach(function(p, i2) {
                return DexiePromise.resolve(p).then(function(value) {
                  return results[i2] = { status: "fulfilled", value };
                }, function(reason) {
                  return results[i2] = { status: "rejected", reason };
                }).then(function() {
                  return --remaining || resolve(results);
                });
              });
            });
          });
        if (NativePromise.any && typeof AggregateError !== "undefined")
          setProp(DexiePromise, "any", function() {
            var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function(resolve, reject) {
              if (possiblePromises.length === 0)
                reject(new AggregateError([]));
              var remaining = possiblePromises.length;
              var failures = new Array(remaining);
              possiblePromises.forEach(function(p, i2) {
                return DexiePromise.resolve(p).then(function(value) {
                  return resolve(value);
                }, function(failure) {
                  failures[i2] = failure;
                  if (!--remaining)
                    reject(new AggregateError(failures));
                });
              });
            });
          });
        if (NativePromise.withResolvers)
          DexiePromise.withResolvers = NativePromise.withResolvers;
      }
      function executePromiseTask(promise, fn) {
        try {
          fn(function(value) {
            if (promise._state !== null)
              return;
            if (value === promise)
              throw new TypeError("A promise cannot be resolved with itself.");
            var shouldExecuteTick = promise._lib && beginMicroTickScope();
            if (value && typeof value.then === "function") {
              executePromiseTask(promise, function(resolve, reject) {
                value instanceof DexiePromise ? value._then(resolve, reject) : value.then(resolve, reject);
              });
            } else {
              promise._state = true;
              promise._value = value;
              propagateAllListeners(promise);
            }
            if (shouldExecuteTick)
              endMicroTickScope();
          }, handleRejection.bind(null, promise));
        } catch (ex) {
          handleRejection(promise, ex);
        }
      }
      function handleRejection(promise, reason) {
        rejectingErrors.push(reason);
        if (promise._state !== null)
          return;
        var shouldExecuteTick = promise._lib && beginMicroTickScope();
        reason = rejectionMapper(reason);
        promise._state = false;
        promise._value = reason;
        addPossiblyUnhandledError(promise);
        propagateAllListeners(promise);
        if (shouldExecuteTick)
          endMicroTickScope();
      }
      function propagateAllListeners(promise) {
        var listeners = promise._listeners;
        promise._listeners = [];
        for (var i2 = 0, len = listeners.length;i2 < len; ++i2) {
          propagateToListener(promise, listeners[i2]);
        }
        var psd = promise._PSD;
        --psd.ref || psd.finalize();
        if (numScheduledCalls === 0) {
          ++numScheduledCalls;
          asap(function() {
            if (--numScheduledCalls === 0)
              finalizePhysicalTick();
          }, []);
        }
      }
      function propagateToListener(promise, listener) {
        if (promise._state === null) {
          promise._listeners.push(listener);
          return;
        }
        var cb = promise._state ? listener.onFulfilled : listener.onRejected;
        if (cb === null) {
          return (promise._state ? listener.resolve : listener.reject)(promise._value);
        }
        ++listener.psd.ref;
        ++numScheduledCalls;
        asap(callListener, [cb, promise, listener]);
      }
      function callListener(cb, promise, listener) {
        try {
          var ret, value = promise._value;
          if (!promise._state && rejectingErrors.length)
            rejectingErrors = [];
          ret = debug && promise._consoleTask ? promise._consoleTask.run(function() {
            return cb(value);
          }) : cb(value);
          if (!promise._state && rejectingErrors.indexOf(value) === -1) {
            markErrorAsHandled(promise);
          }
          listener.resolve(ret);
        } catch (e) {
          listener.reject(e);
        } finally {
          if (--numScheduledCalls === 0)
            finalizePhysicalTick();
          --listener.psd.ref || listener.psd.finalize();
        }
      }
      function physicalTick() {
        usePSD(globalPSD, function() {
          beginMicroTickScope() && endMicroTickScope();
        });
      }
      function beginMicroTickScope() {
        var wasRootExec = isOutsideMicroTick;
        isOutsideMicroTick = false;
        needsNewPhysicalTick = false;
        return wasRootExec;
      }
      function endMicroTickScope() {
        var callbacks, i2, l;
        do {
          while (microtickQueue.length > 0) {
            callbacks = microtickQueue;
            microtickQueue = [];
            l = callbacks.length;
            for (i2 = 0;i2 < l; ++i2) {
              var item = callbacks[i2];
              item[0].apply(null, item[1]);
            }
          }
        } while (microtickQueue.length > 0);
        isOutsideMicroTick = true;
        needsNewPhysicalTick = true;
      }
      function finalizePhysicalTick() {
        var unhandledErrs = unhandledErrors;
        unhandledErrors = [];
        unhandledErrs.forEach(function(p) {
          p._PSD.onunhandled.call(null, p._value, p);
        });
        var finalizers = tickFinalizers.slice(0);
        var i2 = finalizers.length;
        while (i2)
          finalizers[--i2]();
      }
      function run_at_end_of_this_or_next_physical_tick(fn) {
        function finalizer() {
          fn();
          tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
        }
        tickFinalizers.push(finalizer);
        ++numScheduledCalls;
        asap(function() {
          if (--numScheduledCalls === 0)
            finalizePhysicalTick();
        }, []);
      }
      function addPossiblyUnhandledError(promise) {
        if (!unhandledErrors.some(function(p) {
          return p._value === promise._value;
        }))
          unhandledErrors.push(promise);
      }
      function markErrorAsHandled(promise) {
        var i2 = unhandledErrors.length;
        while (i2)
          if (unhandledErrors[--i2]._value === promise._value) {
            unhandledErrors.splice(i2, 1);
            return;
          }
      }
      function PromiseReject(reason) {
        return new DexiePromise(INTERNAL, false, reason);
      }
      function wrap(fn, errorCatcher) {
        var psd = PSD;
        return function() {
          var wasRootExec = beginMicroTickScope(), outerScope = PSD;
          try {
            switchToZone(psd, true);
            return fn.apply(this, arguments);
          } catch (e) {
            errorCatcher && errorCatcher(e);
          } finally {
            switchToZone(outerScope, false);
            if (wasRootExec)
              endMicroTickScope();
          }
        };
      }
      var task = { awaits: 0, echoes: 0, id: 0 };
      var taskCounter = 0;
      var zoneStack = [];
      var zoneEchoes = 0;
      var totalEchoes = 0;
      var zone_id_counter = 0;
      function newScope(fn, props2, a1, a2) {
        var parent = PSD, psd = Object.create(parent);
        psd.parent = parent;
        psd.ref = 0;
        psd.global = false;
        psd.id = ++zone_id_counter;
        globalPSD.env;
        psd.env = patchGlobalPromise ? {
          Promise: DexiePromise,
          PromiseProp: { value: DexiePromise, configurable: true, writable: true },
          all: DexiePromise.all,
          race: DexiePromise.race,
          allSettled: DexiePromise.allSettled,
          any: DexiePromise.any,
          resolve: DexiePromise.resolve,
          reject: DexiePromise.reject
        } : {};
        if (props2)
          extend(psd, props2);
        ++parent.ref;
        psd.finalize = function() {
          --this.parent.ref || this.parent.finalize();
        };
        var rv = usePSD(psd, fn, a1, a2);
        if (psd.ref === 0)
          psd.finalize();
        return rv;
      }
      function incrementExpectedAwaits() {
        if (!task.id)
          task.id = ++taskCounter;
        ++task.awaits;
        task.echoes += ZONE_ECHO_LIMIT;
        return task.id;
      }
      function decrementExpectedAwaits() {
        if (!task.awaits)
          return false;
        if (--task.awaits === 0)
          task.id = 0;
        task.echoes = task.awaits * ZONE_ECHO_LIMIT;
        return true;
      }
      if (("" + nativePromiseThen).indexOf("[native code]") === -1) {
        incrementExpectedAwaits = decrementExpectedAwaits = nop;
      }
      function onPossibleParallellAsync(possiblePromise) {
        if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
          incrementExpectedAwaits();
          return possiblePromise.then(function(x) {
            decrementExpectedAwaits();
            return x;
          }, function(e) {
            decrementExpectedAwaits();
            return rejection(e);
          });
        }
        return possiblePromise;
      }
      function zoneEnterEcho(targetZone) {
        ++totalEchoes;
        if (!task.echoes || --task.echoes === 0) {
          task.echoes = task.awaits = task.id = 0;
        }
        zoneStack.push(PSD);
        switchToZone(targetZone, true);
      }
      function zoneLeaveEcho() {
        var zone = zoneStack[zoneStack.length - 1];
        zoneStack.pop();
        switchToZone(zone, false);
      }
      function switchToZone(targetZone, bEnteringZone) {
        var currentZone = PSD;
        if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
          queueMicrotask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
        }
        if (targetZone === PSD)
          return;
        PSD = targetZone;
        if (currentZone === globalPSD)
          globalPSD.env = snapShot();
        if (patchGlobalPromise) {
          var GlobalPromise = globalPSD.env.Promise;
          var targetEnv = targetZone.env;
          if (currentZone.global || targetZone.global) {
            Object.defineProperty(_global, "Promise", targetEnv.PromiseProp);
            GlobalPromise.all = targetEnv.all;
            GlobalPromise.race = targetEnv.race;
            GlobalPromise.resolve = targetEnv.resolve;
            GlobalPromise.reject = targetEnv.reject;
            if (targetEnv.allSettled)
              GlobalPromise.allSettled = targetEnv.allSettled;
            if (targetEnv.any)
              GlobalPromise.any = targetEnv.any;
          }
        }
      }
      function snapShot() {
        var GlobalPromise = _global.Promise;
        return patchGlobalPromise ? {
          Promise: GlobalPromise,
          PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
          all: GlobalPromise.all,
          race: GlobalPromise.race,
          allSettled: GlobalPromise.allSettled,
          any: GlobalPromise.any,
          resolve: GlobalPromise.resolve,
          reject: GlobalPromise.reject
        } : {};
      }
      function usePSD(psd, fn, a1, a2, a3) {
        var outerScope = PSD;
        try {
          switchToZone(psd, true);
          return fn(a1, a2, a3);
        } finally {
          switchToZone(outerScope, false);
        }
      }
      function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
        return typeof fn !== "function" ? fn : function() {
          var outerZone = PSD;
          if (possibleAwait)
            incrementExpectedAwaits();
          switchToZone(zone, true);
          try {
            return fn.apply(this, arguments);
          } finally {
            switchToZone(outerZone, false);
            if (cleanup)
              queueMicrotask(decrementExpectedAwaits);
          }
        };
      }
      function execInGlobalContext(cb) {
        if (Promise === NativePromise && task.echoes === 0) {
          if (zoneEchoes === 0) {
            cb();
          } else {
            enqueueNativeMicroTask(cb);
          }
        } else {
          setTimeout(cb, 0);
        }
      }
      var rejection = DexiePromise.reject;
      function tempTransaction(db, mode, storeNames, fn) {
        if (!db.idbdb || !db._state.openComplete && (!PSD.letThrough && !db._vip)) {
          if (db._state.openComplete) {
            return rejection(new exceptions.DatabaseClosed(db._state.dbOpenError));
          }
          if (!db._state.isBeingOpened) {
            if (!db._state.autoOpen)
              return rejection(new exceptions.DatabaseClosed);
            db.open().catch(nop);
          }
          return db._state.dbReadyPromise.then(function() {
            return tempTransaction(db, mode, storeNames, fn);
          });
        } else {
          var trans = db._createTransaction(mode, storeNames, db._dbSchema);
          try {
            trans.create();
            db._state.PR1398_maxLoop = 3;
          } catch (ex) {
            if (ex.name === errnames.InvalidState && db.isOpen() && --db._state.PR1398_maxLoop > 0) {
              console.warn("Dexie: Need to reopen db");
              db.close({ disableAutoOpen: false });
              return db.open().then(function() {
                return tempTransaction(db, mode, storeNames, fn);
              });
            }
            return rejection(ex);
          }
          return trans._promise(mode, function(resolve, reject) {
            return newScope(function() {
              PSD.trans = trans;
              return fn(resolve, reject, trans);
            });
          }).then(function(result) {
            if (mode === "readwrite")
              try {
                trans.idbtrans.commit();
              } catch (_a2) {}
            return mode === "readonly" ? result : trans._completion.then(function() {
              return result;
            });
          });
        }
      }
      var DEXIE_VERSION = "4.2.1";
      var maxString = String.fromCharCode(65535);
      var minKey = -Infinity;
      var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
      var STRING_EXPECTED = "String expected.";
      var connections = [];
      var DBNAMES_DB = "__dbnames";
      var READONLY = "readonly";
      var READWRITE = "readwrite";
      function combine(filter1, filter2) {
        return filter1 ? filter2 ? function() {
          return filter1.apply(this, arguments) && filter2.apply(this, arguments);
        } : filter1 : filter2;
      }
      var AnyRange = {
        type: 3,
        lower: -Infinity,
        lowerOpen: false,
        upper: [[]],
        upperOpen: false
      };
      function workaroundForUndefinedPrimKey(keyPath) {
        return typeof keyPath === "string" && !/\./.test(keyPath) ? function(obj) {
          if (obj[keyPath] === undefined && keyPath in obj) {
            obj = deepClone(obj);
            delete obj[keyPath];
          }
          return obj;
        } : function(obj) {
          return obj;
        };
      }
      function Entity() {
        throw exceptions.Type("Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.");
      }
      function cmp(a, b) {
        try {
          var ta = type(a);
          var tb = type(b);
          if (ta !== tb) {
            if (ta === "Array")
              return 1;
            if (tb === "Array")
              return -1;
            if (ta === "binary")
              return 1;
            if (tb === "binary")
              return -1;
            if (ta === "string")
              return 1;
            if (tb === "string")
              return -1;
            if (ta === "Date")
              return 1;
            if (tb !== "Date")
              return NaN;
            return -1;
          }
          switch (ta) {
            case "number":
            case "Date":
            case "string":
              return a > b ? 1 : a < b ? -1 : 0;
            case "binary": {
              return compareUint8Arrays(getUint8Array(a), getUint8Array(b));
            }
            case "Array":
              return compareArrays(a, b);
          }
        } catch (_a2) {}
        return NaN;
      }
      function compareArrays(a, b) {
        var al = a.length;
        var bl = b.length;
        var l = al < bl ? al : bl;
        for (var i2 = 0;i2 < l; ++i2) {
          var res = cmp(a[i2], b[i2]);
          if (res !== 0)
            return res;
        }
        return al === bl ? 0 : al < bl ? -1 : 1;
      }
      function compareUint8Arrays(a, b) {
        var al = a.length;
        var bl = b.length;
        var l = al < bl ? al : bl;
        for (var i2 = 0;i2 < l; ++i2) {
          if (a[i2] !== b[i2])
            return a[i2] < b[i2] ? -1 : 1;
        }
        return al === bl ? 0 : al < bl ? -1 : 1;
      }
      function type(x) {
        var t = typeof x;
        if (t !== "object")
          return t;
        if (ArrayBuffer.isView(x))
          return "binary";
        var tsTag = toStringTag(x);
        return tsTag === "ArrayBuffer" ? "binary" : tsTag;
      }
      function getUint8Array(a) {
        if (a instanceof Uint8Array)
          return a;
        if (ArrayBuffer.isView(a))
          return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        return new Uint8Array(a);
      }
      function builtInDeletionTrigger(table, keys2, res) {
        var yProps = table.schema.yProps;
        if (!yProps)
          return res;
        if (keys2 && res.numFailures > 0)
          keys2 = keys2.filter(function(_, i2) {
            return !res.failures[i2];
          });
        return Promise.all(yProps.map(function(_a2) {
          var updatesTable = _a2.updatesTable;
          return keys2 ? table.db.table(updatesTable).where("k").anyOf(keys2).delete() : table.db.table(updatesTable).clear();
        })).then(function() {
          return res;
        });
      }
      var PropModification = function() {
        function PropModification2(spec) {
          this["@@propmod"] = spec;
        }
        PropModification2.prototype.execute = function(value) {
          var _a2;
          var spec = this["@@propmod"];
          if (spec.add !== undefined) {
            var term = spec.add;
            if (isArray(term)) {
              return __spreadArray(__spreadArray([], isArray(value) ? value : [], true), term, true).sort();
            }
            if (typeof term === "number")
              return (Number(value) || 0) + term;
            if (typeof term === "bigint") {
              try {
                return BigInt(value) + term;
              } catch (_b) {
                return BigInt(0) + term;
              }
            }
            throw new TypeError("Invalid term ".concat(term));
          }
          if (spec.remove !== undefined) {
            var subtrahend_1 = spec.remove;
            if (isArray(subtrahend_1)) {
              return isArray(value) ? value.filter(function(item) {
                return !subtrahend_1.includes(item);
              }).sort() : [];
            }
            if (typeof subtrahend_1 === "number")
              return Number(value) - subtrahend_1;
            if (typeof subtrahend_1 === "bigint") {
              try {
                return BigInt(value) - subtrahend_1;
              } catch (_c) {
                return BigInt(0) - subtrahend_1;
              }
            }
            throw new TypeError("Invalid subtrahend ".concat(subtrahend_1));
          }
          var prefixToReplace = (_a2 = spec.replacePrefix) === null || _a2 === undefined ? undefined : _a2[0];
          if (prefixToReplace && typeof value === "string" && value.startsWith(prefixToReplace)) {
            return spec.replacePrefix[1] + value.substring(prefixToReplace.length);
          }
          return value;
        };
        return PropModification2;
      }();
      function applyUpdateSpec(obj, changes) {
        var keyPaths = keys(changes);
        var numKeys = keyPaths.length;
        var anythingModified = false;
        for (var i2 = 0;i2 < numKeys; ++i2) {
          var keyPath = keyPaths[i2];
          var value = changes[keyPath];
          var origValue = getByKeyPath(obj, keyPath);
          if (value instanceof PropModification) {
            setByKeyPath(obj, keyPath, value.execute(origValue));
            anythingModified = true;
          } else if (origValue !== value) {
            setByKeyPath(obj, keyPath, value);
            anythingModified = true;
          }
        }
        return anythingModified;
      }
      var Table = function() {
        function Table2() {}
        Table2.prototype._trans = function(mode, fn, writeLocked) {
          var trans = this._tx || PSD.trans;
          var tableName = this.name;
          var task2 = debug && typeof console !== "undefined" && console.createTask && console.createTask("Dexie: ".concat(mode === "readonly" ? "read" : "write", " ").concat(this.name));
          function checkTableInTransaction(resolve, reject, trans2) {
            if (!trans2.schema[tableName])
              throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
            return fn(trans2.idbtrans, trans2);
          }
          var wasRootExec = beginMicroTickScope();
          try {
            var p = trans && trans.db._novip === this.db._novip ? trans === PSD.trans ? trans._promise(mode, checkTableInTransaction, writeLocked) : newScope(function() {
              return trans._promise(mode, checkTableInTransaction, writeLocked);
            }, { trans, transless: PSD.transless || PSD }) : tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
            if (task2) {
              p._consoleTask = task2;
              p = p.catch(function(err) {
                console.trace(err);
                return rejection(err);
              });
            }
            return p;
          } finally {
            if (wasRootExec)
              endMicroTickScope();
          }
        };
        Table2.prototype.get = function(keyOrCrit, cb) {
          var _this = this;
          if (keyOrCrit && keyOrCrit.constructor === Object)
            return this.where(keyOrCrit).first(cb);
          if (keyOrCrit == null)
            return rejection(new exceptions.Type("Invalid argument to Table.get()"));
          return this._trans("readonly", function(trans) {
            return _this.core.get({ trans, key: keyOrCrit }).then(function(res) {
              return _this.hook.reading.fire(res);
            });
          }).then(cb);
        };
        Table2.prototype.where = function(indexOrCrit) {
          if (typeof indexOrCrit === "string")
            return new this.db.WhereClause(this, indexOrCrit);
          if (isArray(indexOrCrit))
            return new this.db.WhereClause(this, "[".concat(indexOrCrit.join("+"), "]"));
          var keyPaths = keys(indexOrCrit);
          if (keyPaths.length === 1)
            return this.where(keyPaths[0]).equals(indexOrCrit[keyPaths[0]]);
          var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function(ix) {
            if (ix.compound && keyPaths.every(function(keyPath) {
              return ix.keyPath.indexOf(keyPath) >= 0;
            })) {
              for (var i2 = 0;i2 < keyPaths.length; ++i2) {
                if (keyPaths.indexOf(ix.keyPath[i2]) === -1)
                  return false;
              }
              return true;
            }
            return false;
          }).sort(function(a, b) {
            return a.keyPath.length - b.keyPath.length;
          })[0];
          if (compoundIndex && this.db._maxKey !== maxString) {
            var keyPathsInValidOrder = compoundIndex.keyPath.slice(0, keyPaths.length);
            return this.where(keyPathsInValidOrder).equals(keyPathsInValidOrder.map(function(kp) {
              return indexOrCrit[kp];
            }));
          }
          if (!compoundIndex && debug)
            console.warn("The query ".concat(JSON.stringify(indexOrCrit), " on ").concat(this.name, " would benefit from a ") + "compound index [".concat(keyPaths.join("+"), "]"));
          var idxByName = this.schema.idxByName;
          function equals(a, b) {
            return cmp(a, b) === 0;
          }
          var _a2 = keyPaths.reduce(function(_a3, keyPath) {
            var prevIndex = _a3[0], prevFilterFn = _a3[1];
            var index = idxByName[keyPath];
            var value = indexOrCrit[keyPath];
            return [
              prevIndex || index,
              prevIndex || !index ? combine(prevFilterFn, index && index.multi ? function(x) {
                var prop = getByKeyPath(x, keyPath);
                return isArray(prop) && prop.some(function(item) {
                  return equals(value, item);
                });
              } : function(x) {
                return equals(value, getByKeyPath(x, keyPath));
              }) : prevFilterFn
            ];
          }, [null, null]), idx = _a2[0], filterFunction = _a2[1];
          return idx ? this.where(idx.name).equals(indexOrCrit[idx.keyPath]).filter(filterFunction) : compoundIndex ? this.filter(filterFunction) : this.where(keyPaths).equals("");
        };
        Table2.prototype.filter = function(filterFunction) {
          return this.toCollection().and(filterFunction);
        };
        Table2.prototype.count = function(thenShortcut) {
          return this.toCollection().count(thenShortcut);
        };
        Table2.prototype.offset = function(offset) {
          return this.toCollection().offset(offset);
        };
        Table2.prototype.limit = function(numRows) {
          return this.toCollection().limit(numRows);
        };
        Table2.prototype.each = function(callback) {
          return this.toCollection().each(callback);
        };
        Table2.prototype.toArray = function(thenShortcut) {
          return this.toCollection().toArray(thenShortcut);
        };
        Table2.prototype.toCollection = function() {
          return new this.db.Collection(new this.db.WhereClause(this));
        };
        Table2.prototype.orderBy = function(index) {
          return new this.db.Collection(new this.db.WhereClause(this, isArray(index) ? "[".concat(index.join("+"), "]") : index));
        };
        Table2.prototype.reverse = function() {
          return this.toCollection().reverse();
        };
        Table2.prototype.mapToClass = function(constructor) {
          var _a2 = this, db = _a2.db, tableName = _a2.name;
          this.schema.mappedClass = constructor;
          if (constructor.prototype instanceof Entity) {
            constructor = function(_super) {
              __extends(class_1, _super);
              function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
              }
              Object.defineProperty(class_1.prototype, "db", {
                get: function() {
                  return db;
                },
                enumerable: false,
                configurable: true
              });
              class_1.prototype.table = function() {
                return tableName;
              };
              return class_1;
            }(constructor);
          }
          var inheritedProps = new Set;
          for (var proto = constructor.prototype;proto; proto = getProto(proto)) {
            Object.getOwnPropertyNames(proto).forEach(function(propName) {
              return inheritedProps.add(propName);
            });
          }
          var readHook = function(obj) {
            if (!obj)
              return obj;
            var res = Object.create(constructor.prototype);
            for (var m in obj)
              if (!inheritedProps.has(m))
                try {
                  res[m] = obj[m];
                } catch (_) {}
            return res;
          };
          if (this.schema.readHook) {
            this.hook.reading.unsubscribe(this.schema.readHook);
          }
          this.schema.readHook = readHook;
          this.hook("reading", readHook);
          return constructor;
        };
        Table2.prototype.defineClass = function() {
          function Class(content) {
            extend(this, content);
          }
          return this.mapToClass(Class);
        };
        Table2.prototype.add = function(obj, key) {
          var _this = this;
          var _a2 = this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
          var objToAdd = obj;
          if (keyPath && auto) {
            objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
          }
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "add", keys: key != null ? [key] : null, values: [objToAdd] });
          }).then(function(res) {
            return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
          }).then(function(lastResult) {
            if (keyPath) {
              try {
                setByKeyPath(obj, keyPath, lastResult);
              } catch (_) {}
            }
            return lastResult;
          });
        };
        Table2.prototype.upsert = function(key, modifications) {
          var _this = this;
          var keyPath = this.schema.primKey.keyPath;
          return this._trans("readwrite", function(trans) {
            return _this.core.get({ trans, key }).then(function(existing) {
              var obj = existing !== null && existing !== undefined ? existing : {};
              applyUpdateSpec(obj, modifications);
              if (keyPath)
                setByKeyPath(obj, keyPath, key);
              return _this.core.mutate({
                trans,
                type: "put",
                values: [obj],
                keys: [key],
                upsert: true,
                updates: { keys: [key], changeSpecs: [modifications] }
              }).then(function(res) {
                return res.numFailures ? DexiePromise.reject(res.failures[0]) : !!existing;
              });
            });
          });
        };
        Table2.prototype.update = function(keyOrObject, modifications) {
          if (typeof keyOrObject === "object" && !isArray(keyOrObject)) {
            var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
            if (key === undefined)
              return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
            return this.where(":id").equals(key).modify(modifications);
          } else {
            return this.where(":id").equals(keyOrObject).modify(modifications);
          }
        };
        Table2.prototype.put = function(obj, key) {
          var _this = this;
          var _a2 = this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
          var objToAdd = obj;
          if (keyPath && auto) {
            objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
          }
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "put", values: [objToAdd], keys: key != null ? [key] : null });
          }).then(function(res) {
            return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
          }).then(function(lastResult) {
            if (keyPath) {
              try {
                setByKeyPath(obj, keyPath, lastResult);
              } catch (_) {}
            }
            return lastResult;
          });
        };
        Table2.prototype.delete = function(key) {
          var _this = this;
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "delete", keys: [key] }).then(function(res) {
              return builtInDeletionTrigger(_this, [key], res);
            }).then(function(res) {
              return res.numFailures ? DexiePromise.reject(res.failures[0]) : undefined;
            });
          });
        };
        Table2.prototype.clear = function() {
          var _this = this;
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "deleteRange", range: AnyRange }).then(function(res) {
              return builtInDeletionTrigger(_this, null, res);
            });
          }).then(function(res) {
            return res.numFailures ? DexiePromise.reject(res.failures[0]) : undefined;
          });
        };
        Table2.prototype.bulkGet = function(keys2) {
          var _this = this;
          return this._trans("readonly", function(trans) {
            return _this.core.getMany({
              keys: keys2,
              trans
            }).then(function(result) {
              return result.map(function(res) {
                return _this.hook.reading.fire(res);
              });
            });
          });
        };
        Table2.prototype.bulkAdd = function(objects, keysOrOptions, options) {
          var _this = this;
          var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
          options = options || (keys2 ? undefined : keysOrOptions);
          var wantResults = options ? options.allKeys : undefined;
          return this._trans("readwrite", function(trans) {
            var _a2 = _this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
            if (keyPath && keys2)
              throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
            if (keys2 && keys2.length !== objects.length)
              throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
            var numObjects = objects.length;
            var objectsToAdd = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
            return _this.core.mutate({ trans, type: "add", keys: keys2, values: objectsToAdd, wantResults }).then(function(_a3) {
              var { numFailures, results, lastResult, failures } = _a3;
              var result = wantResults ? results : lastResult;
              if (numFailures === 0)
                return result;
              throw new BulkError("".concat(_this.name, ".bulkAdd(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
            });
          });
        };
        Table2.prototype.bulkPut = function(objects, keysOrOptions, options) {
          var _this = this;
          var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
          options = options || (keys2 ? undefined : keysOrOptions);
          var wantResults = options ? options.allKeys : undefined;
          return this._trans("readwrite", function(trans) {
            var _a2 = _this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
            if (keyPath && keys2)
              throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
            if (keys2 && keys2.length !== objects.length)
              throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
            var numObjects = objects.length;
            var objectsToPut = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
            return _this.core.mutate({ trans, type: "put", keys: keys2, values: objectsToPut, wantResults }).then(function(_a3) {
              var { numFailures, results, lastResult, failures } = _a3;
              var result = wantResults ? results : lastResult;
              if (numFailures === 0)
                return result;
              throw new BulkError("".concat(_this.name, ".bulkPut(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
            });
          });
        };
        Table2.prototype.bulkUpdate = function(keysAndChanges) {
          var _this = this;
          var coreTable = this.core;
          var keys2 = keysAndChanges.map(function(entry) {
            return entry.key;
          });
          var changeSpecs = keysAndChanges.map(function(entry) {
            return entry.changes;
          });
          var offsetMap = [];
          return this._trans("readwrite", function(trans) {
            return coreTable.getMany({ trans, keys: keys2, cache: "clone" }).then(function(objs) {
              var resultKeys = [];
              var resultObjs = [];
              keysAndChanges.forEach(function(_a2, idx) {
                var { key, changes } = _a2;
                var obj = objs[idx];
                if (obj) {
                  for (var _i = 0, _b = Object.keys(changes);_i < _b.length; _i++) {
                    var keyPath = _b[_i];
                    var value = changes[keyPath];
                    if (keyPath === _this.schema.primKey.keyPath) {
                      if (cmp(value, key) !== 0) {
                        throw new exceptions.Constraint("Cannot update primary key in bulkUpdate()");
                      }
                    } else {
                      setByKeyPath(obj, keyPath, value);
                    }
                  }
                  offsetMap.push(idx);
                  resultKeys.push(key);
                  resultObjs.push(obj);
                }
              });
              var numEntries = resultKeys.length;
              return coreTable.mutate({
                trans,
                type: "put",
                keys: resultKeys,
                values: resultObjs,
                updates: {
                  keys: keys2,
                  changeSpecs
                }
              }).then(function(_a2) {
                var { numFailures, failures } = _a2;
                if (numFailures === 0)
                  return numEntries;
                for (var _i = 0, _b = Object.keys(failures);_i < _b.length; _i++) {
                  var offset = _b[_i];
                  var mappedOffset = offsetMap[Number(offset)];
                  if (mappedOffset != null) {
                    var failure = failures[offset];
                    delete failures[offset];
                    failures[mappedOffset] = failure;
                  }
                }
                throw new BulkError("".concat(_this.name, ".bulkUpdate(): ").concat(numFailures, " of ").concat(numEntries, " operations failed"), failures);
              });
            });
          });
        };
        Table2.prototype.bulkDelete = function(keys2) {
          var _this = this;
          var numKeys = keys2.length;
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "delete", keys: keys2 }).then(function(res) {
              return builtInDeletionTrigger(_this, keys2, res);
            });
          }).then(function(_a2) {
            var { numFailures, lastResult, failures } = _a2;
            if (numFailures === 0)
              return lastResult;
            throw new BulkError("".concat(_this.name, ".bulkDelete(): ").concat(numFailures, " of ").concat(numKeys, " operations failed"), failures);
          });
        };
        return Table2;
      }();
      function Events(ctx) {
        var evs = {};
        var rv = function(eventName, subscriber) {
          if (subscriber) {
            var i3 = arguments.length, args = new Array(i3 - 1);
            while (--i3)
              args[i3 - 1] = arguments[i3];
            evs[eventName].subscribe.apply(null, args);
            return ctx;
          } else if (typeof eventName === "string") {
            return evs[eventName];
          }
        };
        rv.addEventType = add2;
        for (var i2 = 1, l = arguments.length;i2 < l; ++i2) {
          add2(arguments[i2]);
        }
        return rv;
        function add2(eventName, chainFunction, defaultFunction) {
          if (typeof eventName === "object")
            return addConfiguredEvents(eventName);
          if (!chainFunction)
            chainFunction = reverseStoppableEventChain;
          if (!defaultFunction)
            defaultFunction = nop;
          var context = {
            subscribers: [],
            fire: defaultFunction,
            subscribe: function(cb) {
              if (context.subscribers.indexOf(cb) === -1) {
                context.subscribers.push(cb);
                context.fire = chainFunction(context.fire, cb);
              }
            },
            unsubscribe: function(cb) {
              context.subscribers = context.subscribers.filter(function(fn) {
                return fn !== cb;
              });
              context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
            }
          };
          evs[eventName] = rv[eventName] = context;
          return context;
        }
        function addConfiguredEvents(cfg) {
          keys(cfg).forEach(function(eventName) {
            var args = cfg[eventName];
            if (isArray(args)) {
              add2(eventName, cfg[eventName][0], cfg[eventName][1]);
            } else if (args === "asap") {
              var context = add2(eventName, mirror, function fire() {
                var i3 = arguments.length, args2 = new Array(i3);
                while (i3--)
                  args2[i3] = arguments[i3];
                context.subscribers.forEach(function(fn) {
                  asap$1(function fireEvent() {
                    fn.apply(null, args2);
                  });
                });
              });
            } else
              throw new exceptions.InvalidArgument("Invalid event config");
          });
        }
      }
      function makeClassConstructor(prototype, constructor) {
        derive(constructor).from({ prototype });
        return constructor;
      }
      function createTableConstructor(db) {
        return makeClassConstructor(Table.prototype, function Table(name, tableSchema, trans) {
          this.db = db;
          this._tx = trans;
          this.name = name;
          this.schema = tableSchema;
          this.hook = db._allTables[name] ? db._allTables[name].hook : Events(null, {
            creating: [hookCreatingChain, nop],
            reading: [pureFunctionChain, mirror],
            updating: [hookUpdatingChain, nop],
            deleting: [hookDeletingChain, nop]
          });
        });
      }
      function isPlainKeyRange(ctx, ignoreLimitFilter) {
        return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
      }
      function addFilter(ctx, fn) {
        ctx.filter = combine(ctx.filter, fn);
      }
      function addReplayFilter(ctx, factory, isLimitFilter) {
        var curr = ctx.replayFilter;
        ctx.replayFilter = curr ? function() {
          return combine(curr(), factory());
        } : factory;
        ctx.justLimit = isLimitFilter && !curr;
      }
      function addMatchFilter(ctx, fn) {
        ctx.isMatch = combine(ctx.isMatch, fn);
      }
      function getIndexOrStore(ctx, coreSchema) {
        if (ctx.isPrimKey)
          return coreSchema.primaryKey;
        var index = coreSchema.getIndexByKeyPath(ctx.index);
        if (!index)
          throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
        return index;
      }
      function openCursor(ctx, coreTable, trans) {
        var index = getIndexOrStore(ctx, coreTable.schema);
        return coreTable.openCursor({
          trans,
          values: !ctx.keysOnly,
          reverse: ctx.dir === "prev",
          unique: !!ctx.unique,
          query: {
            index,
            range: ctx.range
          }
        });
      }
      function iter(ctx, fn, coreTrans, coreTable) {
        var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
        if (!ctx.or) {
          return iterate(openCursor(ctx, coreTable, coreTrans), combine(ctx.algorithm, filter), fn, !ctx.keysOnly && ctx.valueMapper);
        } else {
          var set_1 = {};
          var union = function(item, cursor, advance) {
            if (!filter || filter(cursor, advance, function(result) {
              return cursor.stop(result);
            }, function(err) {
              return cursor.fail(err);
            })) {
              var primaryKey = cursor.primaryKey;
              var key = "" + primaryKey;
              if (key === "[object ArrayBuffer]")
                key = "" + new Uint8Array(primaryKey);
              if (!hasOwn(set_1, key)) {
                set_1[key] = true;
                fn(item, cursor, advance);
              }
            }
          };
          return Promise.all([
            ctx.or._iterate(union, coreTrans),
            iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)
          ]);
        }
      }
      function iterate(cursorPromise, filter, fn, valueMapper) {
        var mappedFn = valueMapper ? function(x, c, a) {
          return fn(valueMapper(x), c, a);
        } : fn;
        var wrappedFn = wrap(mappedFn);
        return cursorPromise.then(function(cursor) {
          if (cursor) {
            return cursor.start(function() {
              var c = function() {
                return cursor.continue();
              };
              if (!filter || filter(cursor, function(advancer) {
                return c = advancer;
              }, function(val) {
                cursor.stop(val);
                c = nop;
              }, function(e) {
                cursor.fail(e);
                c = nop;
              }))
                wrappedFn(cursor.value, cursor, function(advancer) {
                  return c = advancer;
                });
              c();
            });
          }
        });
      }
      var Collection = function() {
        function Collection2() {}
        Collection2.prototype._read = function(fn, cb) {
          var ctx = this._ctx;
          return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readonly", fn).then(cb);
        };
        Collection2.prototype._write = function(fn) {
          var ctx = this._ctx;
          return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readwrite", fn, "locked");
        };
        Collection2.prototype._addAlgorithm = function(fn) {
          var ctx = this._ctx;
          ctx.algorithm = combine(ctx.algorithm, fn);
        };
        Collection2.prototype._iterate = function(fn, coreTrans) {
          return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
        };
        Collection2.prototype.clone = function(props2) {
          var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
          if (props2)
            extend(ctx, props2);
          rv._ctx = ctx;
          return rv;
        };
        Collection2.prototype.raw = function() {
          this._ctx.valueMapper = null;
          return this;
        };
        Collection2.prototype.each = function(fn) {
          var ctx = this._ctx;
          return this._read(function(trans) {
            return iter(ctx, fn, trans, ctx.table.core);
          });
        };
        Collection2.prototype.count = function(cb) {
          var _this = this;
          return this._read(function(trans) {
            var ctx = _this._ctx;
            var coreTable = ctx.table.core;
            if (isPlainKeyRange(ctx, true)) {
              return coreTable.count({
                trans,
                query: {
                  index: getIndexOrStore(ctx, coreTable.schema),
                  range: ctx.range
                }
              }).then(function(count2) {
                return Math.min(count2, ctx.limit);
              });
            } else {
              var count = 0;
              return iter(ctx, function() {
                ++count;
                return false;
              }, trans, coreTable).then(function() {
                return count;
              });
            }
          }).then(cb);
        };
        Collection2.prototype.sortBy = function(keyPath, cb) {
          var parts = keyPath.split(".").reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
          function getval(obj, i2) {
            if (i2)
              return getval(obj[parts[i2]], i2 - 1);
            return obj[lastPart];
          }
          var order = this._ctx.dir === "next" ? 1 : -1;
          function sorter(a, b) {
            var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
            return cmp(aVal, bVal) * order;
          }
          return this.toArray(function(a) {
            return a.sort(sorter);
          }).then(cb);
        };
        Collection2.prototype.toArray = function(cb) {
          var _this = this;
          return this._read(function(trans) {
            var ctx = _this._ctx;
            if (ctx.dir === "next" && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
              var valueMapper_1 = ctx.valueMapper;
              var index = getIndexOrStore(ctx, ctx.table.core.schema);
              return ctx.table.core.query({
                trans,
                limit: ctx.limit,
                values: true,
                query: {
                  index,
                  range: ctx.range
                }
              }).then(function(_a2) {
                var result = _a2.result;
                return valueMapper_1 ? result.map(valueMapper_1) : result;
              });
            } else {
              var a_1 = [];
              return iter(ctx, function(item) {
                return a_1.push(item);
              }, trans, ctx.table.core).then(function() {
                return a_1;
              });
            }
          }, cb);
        };
        Collection2.prototype.offset = function(offset) {
          var ctx = this._ctx;
          if (offset <= 0)
            return this;
          ctx.offset += offset;
          if (isPlainKeyRange(ctx)) {
            addReplayFilter(ctx, function() {
              var offsetLeft = offset;
              return function(cursor, advance) {
                if (offsetLeft === 0)
                  return true;
                if (offsetLeft === 1) {
                  --offsetLeft;
                  return false;
                }
                advance(function() {
                  cursor.advance(offsetLeft);
                  offsetLeft = 0;
                });
                return false;
              };
            });
          } else {
            addReplayFilter(ctx, function() {
              var offsetLeft = offset;
              return function() {
                return --offsetLeft < 0;
              };
            });
          }
          return this;
        };
        Collection2.prototype.limit = function(numRows) {
          this._ctx.limit = Math.min(this._ctx.limit, numRows);
          addReplayFilter(this._ctx, function() {
            var rowsLeft = numRows;
            return function(cursor, advance, resolve) {
              if (--rowsLeft <= 0)
                advance(resolve);
              return rowsLeft >= 0;
            };
          }, true);
          return this;
        };
        Collection2.prototype.until = function(filterFunction, bIncludeStopEntry) {
          addFilter(this._ctx, function(cursor, advance, resolve) {
            if (filterFunction(cursor.value)) {
              advance(resolve);
              return bIncludeStopEntry;
            } else {
              return true;
            }
          });
          return this;
        };
        Collection2.prototype.first = function(cb) {
          return this.limit(1).toArray(function(a) {
            return a[0];
          }).then(cb);
        };
        Collection2.prototype.last = function(cb) {
          return this.reverse().first(cb);
        };
        Collection2.prototype.filter = function(filterFunction) {
          addFilter(this._ctx, function(cursor) {
            return filterFunction(cursor.value);
          });
          addMatchFilter(this._ctx, filterFunction);
          return this;
        };
        Collection2.prototype.and = function(filter) {
          return this.filter(filter);
        };
        Collection2.prototype.or = function(indexName) {
          return new this.db.WhereClause(this._ctx.table, indexName, this);
        };
        Collection2.prototype.reverse = function() {
          this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
          if (this._ondirectionchange)
            this._ondirectionchange(this._ctx.dir);
          return this;
        };
        Collection2.prototype.desc = function() {
          return this.reverse();
        };
        Collection2.prototype.eachKey = function(cb) {
          var ctx = this._ctx;
          ctx.keysOnly = !ctx.isMatch;
          return this.each(function(val, cursor) {
            cb(cursor.key, cursor);
          });
        };
        Collection2.prototype.eachUniqueKey = function(cb) {
          this._ctx.unique = "unique";
          return this.eachKey(cb);
        };
        Collection2.prototype.eachPrimaryKey = function(cb) {
          var ctx = this._ctx;
          ctx.keysOnly = !ctx.isMatch;
          return this.each(function(val, cursor) {
            cb(cursor.primaryKey, cursor);
          });
        };
        Collection2.prototype.keys = function(cb) {
          var ctx = this._ctx;
          ctx.keysOnly = !ctx.isMatch;
          var a = [];
          return this.each(function(item, cursor) {
            a.push(cursor.key);
          }).then(function() {
            return a;
          }).then(cb);
        };
        Collection2.prototype.primaryKeys = function(cb) {
          var ctx = this._ctx;
          if (ctx.dir === "next" && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
            return this._read(function(trans) {
              var index = getIndexOrStore(ctx, ctx.table.core.schema);
              return ctx.table.core.query({
                trans,
                values: false,
                limit: ctx.limit,
                query: {
                  index,
                  range: ctx.range
                }
              });
            }).then(function(_a2) {
              var result = _a2.result;
              return result;
            }).then(cb);
          }
          ctx.keysOnly = !ctx.isMatch;
          var a = [];
          return this.each(function(item, cursor) {
            a.push(cursor.primaryKey);
          }).then(function() {
            return a;
          }).then(cb);
        };
        Collection2.prototype.uniqueKeys = function(cb) {
          this._ctx.unique = "unique";
          return this.keys(cb);
        };
        Collection2.prototype.firstKey = function(cb) {
          return this.limit(1).keys(function(a) {
            return a[0];
          }).then(cb);
        };
        Collection2.prototype.lastKey = function(cb) {
          return this.reverse().firstKey(cb);
        };
        Collection2.prototype.distinct = function() {
          var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
          if (!idx || !idx.multi)
            return this;
          var set = {};
          addFilter(this._ctx, function(cursor) {
            var strKey = cursor.primaryKey.toString();
            var found = hasOwn(set, strKey);
            set[strKey] = true;
            return !found;
          });
          return this;
        };
        Collection2.prototype.modify = function(changes) {
          var _this = this;
          var ctx = this._ctx;
          return this._write(function(trans) {
            var modifyer;
            if (typeof changes === "function") {
              modifyer = changes;
            } else {
              modifyer = function(item) {
                return applyUpdateSpec(item, changes);
              };
            }
            var coreTable = ctx.table.core;
            var _a2 = coreTable.schema.primaryKey, outbound = _a2.outbound, extractKey = _a2.extractKey;
            var limit2 = 200;
            var modifyChunkSize = _this.db._options.modifyChunkSize;
            if (modifyChunkSize) {
              if (typeof modifyChunkSize == "object") {
                limit2 = modifyChunkSize[coreTable.name] || modifyChunkSize["*"] || 200;
              } else {
                limit2 = modifyChunkSize;
              }
            }
            var totalFailures = [];
            var successCount = 0;
            var failedKeys = [];
            var applyMutateResult = function(expectedCount, res) {
              var { failures, numFailures } = res;
              successCount += expectedCount - numFailures;
              for (var _i = 0, _a3 = keys(failures);_i < _a3.length; _i++) {
                var pos = _a3[_i];
                totalFailures.push(failures[pos]);
              }
            };
            var isUnconditionalDelete = changes === deleteCallback;
            return _this.clone().primaryKeys().then(function(keys2) {
              var criteria = isPlainKeyRange(ctx) && ctx.limit === Infinity && (typeof changes !== "function" || isUnconditionalDelete) && {
                index: ctx.index,
                range: ctx.range
              };
              var nextChunk = function(offset) {
                var count = Math.min(limit2, keys2.length - offset);
                var keysInChunk = keys2.slice(offset, offset + count);
                return (isUnconditionalDelete ? Promise.resolve([]) : coreTable.getMany({
                  trans,
                  keys: keysInChunk,
                  cache: "immutable"
                })).then(function(values) {
                  var addValues = [];
                  var putValues = [];
                  var putKeys = outbound ? [] : null;
                  var deleteKeys = isUnconditionalDelete ? keysInChunk : [];
                  if (!isUnconditionalDelete)
                    for (var i2 = 0;i2 < count; ++i2) {
                      var origValue = values[i2];
                      var ctx_1 = {
                        value: deepClone(origValue),
                        primKey: keys2[offset + i2]
                      };
                      if (modifyer.call(ctx_1, ctx_1.value, ctx_1) !== false) {
                        if (ctx_1.value == null) {
                          deleteKeys.push(keys2[offset + i2]);
                        } else if (!outbound && cmp(extractKey(origValue), extractKey(ctx_1.value)) !== 0) {
                          deleteKeys.push(keys2[offset + i2]);
                          addValues.push(ctx_1.value);
                        } else {
                          putValues.push(ctx_1.value);
                          if (outbound)
                            putKeys.push(keys2[offset + i2]);
                        }
                      }
                    }
                  return Promise.resolve(addValues.length > 0 && coreTable.mutate({ trans, type: "add", values: addValues }).then(function(res) {
                    for (var pos in res.failures) {
                      deleteKeys.splice(parseInt(pos), 1);
                    }
                    applyMutateResult(addValues.length, res);
                  })).then(function() {
                    return (putValues.length > 0 || criteria && typeof changes === "object") && coreTable.mutate({
                      trans,
                      type: "put",
                      keys: putKeys,
                      values: putValues,
                      criteria,
                      changeSpec: typeof changes !== "function" && changes,
                      isAdditionalChunk: offset > 0
                    }).then(function(res) {
                      return applyMutateResult(putValues.length, res);
                    });
                  }).then(function() {
                    return (deleteKeys.length > 0 || criteria && isUnconditionalDelete) && coreTable.mutate({
                      trans,
                      type: "delete",
                      keys: deleteKeys,
                      criteria,
                      isAdditionalChunk: offset > 0
                    }).then(function(res) {
                      return builtInDeletionTrigger(ctx.table, deleteKeys, res);
                    }).then(function(res) {
                      return applyMutateResult(deleteKeys.length, res);
                    });
                  }).then(function() {
                    return keys2.length > offset + count && nextChunk(offset + limit2);
                  });
                });
              };
              return nextChunk(0).then(function() {
                if (totalFailures.length > 0)
                  throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys);
                return keys2.length;
              });
            });
          });
        };
        Collection2.prototype.delete = function() {
          var ctx = this._ctx, range = ctx.range;
          if (isPlainKeyRange(ctx) && !ctx.table.schema.yProps && (ctx.isPrimKey || range.type === 3)) {
            return this._write(function(trans) {
              var primaryKey = ctx.table.core.schema.primaryKey;
              var coreRange = range;
              return ctx.table.core.count({ trans, query: { index: primaryKey, range: coreRange } }).then(function(count) {
                return ctx.table.core.mutate({ trans, type: "deleteRange", range: coreRange }).then(function(_a2) {
                  var { failures, numFailures } = _a2;
                  if (numFailures)
                    throw new ModifyError("Could not delete some values", Object.keys(failures).map(function(pos) {
                      return failures[pos];
                    }), count - numFailures);
                  return count - numFailures;
                });
              });
            });
          }
          return this.modify(deleteCallback);
        };
        return Collection2;
      }();
      var deleteCallback = function(value, ctx) {
        return ctx.value = null;
      };
      function createCollectionConstructor(db) {
        return makeClassConstructor(Collection.prototype, function Collection(whereClause, keyRangeGenerator) {
          this.db = db;
          var keyRange = AnyRange, error = null;
          if (keyRangeGenerator)
            try {
              keyRange = keyRangeGenerator();
            } catch (ex) {
              error = ex;
            }
          var whereCtx = whereClause._ctx;
          var table = whereCtx.table;
          var readingHook = table.hook.reading.fire;
          this._ctx = {
            table,
            index: whereCtx.index,
            isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
            range: keyRange,
            keysOnly: false,
            dir: "next",
            unique: "",
            algorithm: null,
            filter: null,
            replayFilter: null,
            justLimit: true,
            isMatch: null,
            offset: 0,
            limit: Infinity,
            error,
            or: whereCtx.or,
            valueMapper: readingHook !== mirror ? readingHook : null
          };
        });
      }
      function simpleCompare(a, b) {
        return a < b ? -1 : a === b ? 0 : 1;
      }
      function simpleCompareReverse(a, b) {
        return a > b ? -1 : a === b ? 0 : 1;
      }
      function fail(collectionOrWhereClause, err, T) {
        var collection = collectionOrWhereClause instanceof WhereClause ? new collectionOrWhereClause.Collection(collectionOrWhereClause) : collectionOrWhereClause;
        collection._ctx.error = T ? new T(err) : new TypeError(err);
        return collection;
      }
      function emptyCollection(whereClause) {
        return new whereClause.Collection(whereClause, function() {
          return rangeEqual("");
        }).limit(0);
      }
      function upperFactory(dir) {
        return dir === "next" ? function(s) {
          return s.toUpperCase();
        } : function(s) {
          return s.toLowerCase();
        };
      }
      function lowerFactory(dir) {
        return dir === "next" ? function(s) {
          return s.toLowerCase();
        } : function(s) {
          return s.toUpperCase();
        };
      }
      function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp2, dir) {
        var length = Math.min(key.length, lowerNeedle.length);
        var llp = -1;
        for (var i2 = 0;i2 < length; ++i2) {
          var lwrKeyChar = lowerKey[i2];
          if (lwrKeyChar !== lowerNeedle[i2]) {
            if (cmp2(key[i2], upperNeedle[i2]) < 0)
              return key.substr(0, i2) + upperNeedle[i2] + upperNeedle.substr(i2 + 1);
            if (cmp2(key[i2], lowerNeedle[i2]) < 0)
              return key.substr(0, i2) + lowerNeedle[i2] + upperNeedle.substr(i2 + 1);
            if (llp >= 0)
              return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
            return null;
          }
          if (cmp2(key[i2], lwrKeyChar) < 0)
            llp = i2;
        }
        if (length < lowerNeedle.length && dir === "next")
          return key + upperNeedle.substr(key.length);
        if (length < key.length && dir === "prev")
          return key.substr(0, upperNeedle.length);
        return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
      }
      function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
        var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
        if (!needles.every(function(s) {
          return typeof s === "string";
        })) {
          return fail(whereClause, STRING_EXPECTED);
        }
        function initDirection(dir) {
          upper = upperFactory(dir);
          lower = lowerFactory(dir);
          compare = dir === "next" ? simpleCompare : simpleCompareReverse;
          var needleBounds = needles.map(function(needle) {
            return { lower: lower(needle), upper: upper(needle) };
          }).sort(function(a, b) {
            return compare(a.lower, b.lower);
          });
          upperNeedles = needleBounds.map(function(nb) {
            return nb.upper;
          });
          lowerNeedles = needleBounds.map(function(nb) {
            return nb.lower;
          });
          direction = dir;
          nextKeySuffix = dir === "next" ? "" : suffix;
        }
        initDirection("next");
        var c = new whereClause.Collection(whereClause, function() {
          return createRange(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
        });
        c._ondirectionchange = function(direction2) {
          initDirection(direction2);
        };
        var firstPossibleNeedle = 0;
        c._addAlgorithm(function(cursor, advance, resolve) {
          var key = cursor.key;
          if (typeof key !== "string")
            return false;
          var lowerKey = lower(key);
          if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
            return true;
          } else {
            var lowestPossibleCasing = null;
            for (var i2 = firstPossibleNeedle;i2 < needlesLen; ++i2) {
              var casing = nextCasing(key, lowerKey, upperNeedles[i2], lowerNeedles[i2], compare, direction);
              if (casing === null && lowestPossibleCasing === null)
                firstPossibleNeedle = i2 + 1;
              else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                lowestPossibleCasing = casing;
              }
            }
            if (lowestPossibleCasing !== null) {
              advance(function() {
                cursor.continue(lowestPossibleCasing + nextKeySuffix);
              });
            } else {
              advance(resolve);
            }
            return false;
          }
        });
        return c;
      }
      function createRange(lower, upper, lowerOpen, upperOpen) {
        return {
          type: 2,
          lower,
          upper,
          lowerOpen,
          upperOpen
        };
      }
      function rangeEqual(value) {
        return {
          type: 1,
          lower: value,
          upper: value
        };
      }
      var WhereClause = function() {
        function WhereClause2() {}
        Object.defineProperty(WhereClause2.prototype, "Collection", {
          get: function() {
            return this._ctx.table.db.Collection;
          },
          enumerable: false,
          configurable: true
        });
        WhereClause2.prototype.between = function(lower, upper, includeLower, includeUpper) {
          includeLower = includeLower !== false;
          includeUpper = includeUpper === true;
          try {
            if (this._cmp(lower, upper) > 0 || this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper))
              return emptyCollection(this);
            return new this.Collection(this, function() {
              return createRange(lower, upper, !includeLower, !includeUpper);
            });
          } catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
        };
        WhereClause2.prototype.equals = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return rangeEqual(value);
          });
        };
        WhereClause2.prototype.above = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(value, undefined, true);
          });
        };
        WhereClause2.prototype.aboveOrEqual = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(value, undefined, false);
          });
        };
        WhereClause2.prototype.below = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(undefined, value, false, true);
          });
        };
        WhereClause2.prototype.belowOrEqual = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(undefined, value);
          });
        };
        WhereClause2.prototype.startsWith = function(str) {
          if (typeof str !== "string")
            return fail(this, STRING_EXPECTED);
          return this.between(str, str + maxString, true, true);
        };
        WhereClause2.prototype.startsWithIgnoreCase = function(str) {
          if (str === "")
            return this.startsWith(str);
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return x.indexOf(a[0]) === 0;
          }, [str], maxString);
        };
        WhereClause2.prototype.equalsIgnoreCase = function(str) {
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return x === a[0];
          }, [str], "");
        };
        WhereClause2.prototype.anyOfIgnoreCase = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (set.length === 0)
            return emptyCollection(this);
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return a.indexOf(x) !== -1;
          }, set, "");
        };
        WhereClause2.prototype.startsWithAnyOfIgnoreCase = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (set.length === 0)
            return emptyCollection(this);
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return a.some(function(n) {
              return x.indexOf(n) === 0;
            });
          }, set, maxString);
        };
        WhereClause2.prototype.anyOf = function() {
          var _this = this;
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          var compare = this._cmp;
          try {
            set.sort(compare);
          } catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
          if (set.length === 0)
            return emptyCollection(this);
          var c = new this.Collection(this, function() {
            return createRange(set[0], set[set.length - 1]);
          });
          c._ondirectionchange = function(direction) {
            compare = direction === "next" ? _this._ascending : _this._descending;
            set.sort(compare);
          };
          var i2 = 0;
          c._addAlgorithm(function(cursor, advance, resolve) {
            var key = cursor.key;
            while (compare(key, set[i2]) > 0) {
              ++i2;
              if (i2 === set.length) {
                advance(resolve);
                return false;
              }
            }
            if (compare(key, set[i2]) === 0) {
              return true;
            } else {
              advance(function() {
                cursor.continue(set[i2]);
              });
              return false;
            }
          });
          return c;
        };
        WhereClause2.prototype.notEqual = function(value) {
          return this.inAnyRange([[minKey, value], [value, this.db._maxKey]], { includeLowers: false, includeUppers: false });
        };
        WhereClause2.prototype.noneOf = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (set.length === 0)
            return new this.Collection(this);
          try {
            set.sort(this._ascending);
          } catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
          var ranges = set.reduce(function(res, val) {
            return res ? res.concat([[res[res.length - 1][1], val]]) : [[minKey, val]];
          }, null);
          ranges.push([set[set.length - 1], this.db._maxKey]);
          return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
        };
        WhereClause2.prototype.inAnyRange = function(ranges, options) {
          var _this = this;
          var cmp2 = this._cmp, ascending = this._ascending, descending = this._descending, min = this._min, max = this._max;
          if (ranges.length === 0)
            return emptyCollection(this);
          if (!ranges.every(function(range) {
            return range[0] !== undefined && range[1] !== undefined && ascending(range[0], range[1]) <= 0;
          })) {
            return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
          }
          var includeLowers = !options || options.includeLowers !== false;
          var includeUppers = options && options.includeUppers === true;
          function addRange2(ranges2, newRange) {
            var i2 = 0, l = ranges2.length;
            for (;i2 < l; ++i2) {
              var range = ranges2[i2];
              if (cmp2(newRange[0], range[1]) < 0 && cmp2(newRange[1], range[0]) > 0) {
                range[0] = min(range[0], newRange[0]);
                range[1] = max(range[1], newRange[1]);
                break;
              }
            }
            if (i2 === l)
              ranges2.push(newRange);
            return ranges2;
          }
          var sortDirection = ascending;
          function rangeSorter(a, b) {
            return sortDirection(a[0], b[0]);
          }
          var set;
          try {
            set = ranges.reduce(addRange2, []);
            set.sort(rangeSorter);
          } catch (ex) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
          var rangePos = 0;
          var keyIsBeyondCurrentEntry = includeUppers ? function(key) {
            return ascending(key, set[rangePos][1]) > 0;
          } : function(key) {
            return ascending(key, set[rangePos][1]) >= 0;
          };
          var keyIsBeforeCurrentEntry = includeLowers ? function(key) {
            return descending(key, set[rangePos][0]) > 0;
          } : function(key) {
            return descending(key, set[rangePos][0]) >= 0;
          };
          function keyWithinCurrentRange(key) {
            return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
          }
          var checkKey = keyIsBeyondCurrentEntry;
          var c = new this.Collection(this, function() {
            return createRange(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
          });
          c._ondirectionchange = function(direction) {
            if (direction === "next") {
              checkKey = keyIsBeyondCurrentEntry;
              sortDirection = ascending;
            } else {
              checkKey = keyIsBeforeCurrentEntry;
              sortDirection = descending;
            }
            set.sort(rangeSorter);
          };
          c._addAlgorithm(function(cursor, advance, resolve) {
            var key = cursor.key;
            while (checkKey(key)) {
              ++rangePos;
              if (rangePos === set.length) {
                advance(resolve);
                return false;
              }
            }
            if (keyWithinCurrentRange(key)) {
              return true;
            } else if (_this._cmp(key, set[rangePos][1]) === 0 || _this._cmp(key, set[rangePos][0]) === 0) {
              return false;
            } else {
              advance(function() {
                if (sortDirection === ascending)
                  cursor.continue(set[rangePos][0]);
                else
                  cursor.continue(set[rangePos][1]);
              });
              return false;
            }
          });
          return c;
        };
        WhereClause2.prototype.startsWithAnyOf = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (!set.every(function(s) {
            return typeof s === "string";
          })) {
            return fail(this, "startsWithAnyOf() only works with strings");
          }
          if (set.length === 0)
            return emptyCollection(this);
          return this.inAnyRange(set.map(function(str) {
            return [str, str + maxString];
          }));
        };
        return WhereClause2;
      }();
      function createWhereClauseConstructor(db) {
        return makeClassConstructor(WhereClause.prototype, function WhereClause(table, index, orCollection) {
          this.db = db;
          this._ctx = {
            table,
            index: index === ":id" ? null : index,
            or: orCollection
          };
          this._cmp = this._ascending = cmp;
          this._descending = function(a, b) {
            return cmp(b, a);
          };
          this._max = function(a, b) {
            return cmp(a, b) > 0 ? a : b;
          };
          this._min = function(a, b) {
            return cmp(a, b) < 0 ? a : b;
          };
          this._IDBKeyRange = db._deps.IDBKeyRange;
          if (!this._IDBKeyRange)
            throw new exceptions.MissingAPI;
        });
      }
      function eventRejectHandler(reject) {
        return wrap(function(event) {
          preventDefault(event);
          reject(event.target.error);
          return false;
        });
      }
      function preventDefault(event) {
        if (event.stopPropagation)
          event.stopPropagation();
        if (event.preventDefault)
          event.preventDefault();
      }
      var DEXIE_STORAGE_MUTATED_EVENT_NAME = "storagemutated";
      var STORAGE_MUTATED_DOM_EVENT_NAME = "x-storagemutated-1";
      var globalEvents = Events(null, DEXIE_STORAGE_MUTATED_EVENT_NAME);
      var Transaction = function() {
        function Transaction2() {}
        Transaction2.prototype._lock = function() {
          assert2(!PSD.global);
          ++this._reculock;
          if (this._reculock === 1 && !PSD.global)
            PSD.lockOwnerFor = this;
          return this;
        };
        Transaction2.prototype._unlock = function() {
          assert2(!PSD.global);
          if (--this._reculock === 0) {
            if (!PSD.global)
              PSD.lockOwnerFor = null;
            while (this._blockedFuncs.length > 0 && !this._locked()) {
              var fnAndPSD = this._blockedFuncs.shift();
              try {
                usePSD(fnAndPSD[1], fnAndPSD[0]);
              } catch (e) {}
            }
          }
          return this;
        };
        Transaction2.prototype._locked = function() {
          return this._reculock && PSD.lockOwnerFor !== this;
        };
        Transaction2.prototype.create = function(idbtrans) {
          var _this = this;
          if (!this.mode)
            return this;
          var idbdb = this.db.idbdb;
          var dbOpenError = this.db._state.dbOpenError;
          assert2(!this.idbtrans);
          if (!idbtrans && !idbdb) {
            switch (dbOpenError && dbOpenError.name) {
              case "DatabaseClosedError":
                throw new exceptions.DatabaseClosed(dbOpenError);
              case "MissingAPIError":
                throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
              default:
                throw new exceptions.OpenFailed(dbOpenError);
            }
          }
          if (!this.active)
            throw new exceptions.TransactionInactive;
          assert2(this._completion._state === null);
          idbtrans = this.idbtrans = idbtrans || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : idbdb.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }));
          idbtrans.onerror = wrap(function(ev) {
            preventDefault(ev);
            _this._reject(idbtrans.error);
          });
          idbtrans.onabort = wrap(function(ev) {
            preventDefault(ev);
            _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
            _this.active = false;
            _this.on("abort").fire(ev);
          });
          idbtrans.oncomplete = wrap(function() {
            _this.active = false;
            _this._resolve();
            if ("mutatedParts" in idbtrans) {
              globalEvents.storagemutated.fire(idbtrans["mutatedParts"]);
            }
          });
          return this;
        };
        Transaction2.prototype._promise = function(mode, fn, bWriteLock) {
          var _this = this;
          if (mode === "readwrite" && this.mode !== "readwrite")
            return rejection(new exceptions.ReadOnly("Transaction is readonly"));
          if (!this.active)
            return rejection(new exceptions.TransactionInactive);
          if (this._locked()) {
            return new DexiePromise(function(resolve, reject) {
              _this._blockedFuncs.push([function() {
                _this._promise(mode, fn, bWriteLock).then(resolve, reject);
              }, PSD]);
            });
          } else if (bWriteLock) {
            return newScope(function() {
              var p2 = new DexiePromise(function(resolve, reject) {
                _this._lock();
                var rv = fn(resolve, reject, _this);
                if (rv && rv.then)
                  rv.then(resolve, reject);
              });
              p2.finally(function() {
                return _this._unlock();
              });
              p2._lib = true;
              return p2;
            });
          } else {
            var p = new DexiePromise(function(resolve, reject) {
              var rv = fn(resolve, reject, _this);
              if (rv && rv.then)
                rv.then(resolve, reject);
            });
            p._lib = true;
            return p;
          }
        };
        Transaction2.prototype._root = function() {
          return this.parent ? this.parent._root() : this;
        };
        Transaction2.prototype.waitFor = function(promiseLike) {
          var root = this._root();
          var promise = DexiePromise.resolve(promiseLike);
          if (root._waitingFor) {
            root._waitingFor = root._waitingFor.then(function() {
              return promise;
            });
          } else {
            root._waitingFor = promise;
            root._waitingQueue = [];
            var store = root.idbtrans.objectStore(root.storeNames[0]);
            (function spin() {
              ++root._spinCount;
              while (root._waitingQueue.length)
                root._waitingQueue.shift()();
              if (root._waitingFor)
                store.get(-Infinity).onsuccess = spin;
            })();
          }
          var currentWaitPromise = root._waitingFor;
          return new DexiePromise(function(resolve, reject) {
            promise.then(function(res) {
              return root._waitingQueue.push(wrap(resolve.bind(null, res)));
            }, function(err) {
              return root._waitingQueue.push(wrap(reject.bind(null, err)));
            }).finally(function() {
              if (root._waitingFor === currentWaitPromise) {
                root._waitingFor = null;
              }
            });
          });
        };
        Transaction2.prototype.abort = function() {
          if (this.active) {
            this.active = false;
            if (this.idbtrans)
              this.idbtrans.abort();
            this._reject(new exceptions.Abort);
          }
        };
        Transaction2.prototype.table = function(tableName) {
          var memoizedTables = this._memoizedTables || (this._memoizedTables = {});
          if (hasOwn(memoizedTables, tableName))
            return memoizedTables[tableName];
          var tableSchema = this.schema[tableName];
          if (!tableSchema) {
            throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
          }
          var transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
          transactionBoundTable.core = this.db.core.table(tableName);
          memoizedTables[tableName] = transactionBoundTable;
          return transactionBoundTable;
        };
        return Transaction2;
      }();
      function createTransactionConstructor(db) {
        return makeClassConstructor(Transaction.prototype, function Transaction(mode, storeNames, dbschema, chromeTransactionDurability, parent) {
          var _this = this;
          if (mode !== "readonly")
            storeNames.forEach(function(storeName) {
              var _a2;
              var yProps = (_a2 = dbschema[storeName]) === null || _a2 === undefined ? undefined : _a2.yProps;
              if (yProps)
                storeNames = storeNames.concat(yProps.map(function(p) {
                  return p.updatesTable;
                }));
            });
          this.db = db;
          this.mode = mode;
          this.storeNames = storeNames;
          this.schema = dbschema;
          this.chromeTransactionDurability = chromeTransactionDurability;
          this.idbtrans = null;
          this.on = Events(this, "complete", "error", "abort");
          this.parent = parent || null;
          this.active = true;
          this._reculock = 0;
          this._blockedFuncs = [];
          this._resolve = null;
          this._reject = null;
          this._waitingFor = null;
          this._waitingQueue = null;
          this._spinCount = 0;
          this._completion = new DexiePromise(function(resolve, reject) {
            _this._resolve = resolve;
            _this._reject = reject;
          });
          this._completion.then(function() {
            _this.active = false;
            _this.on.complete.fire();
          }, function(e) {
            var wasActive = _this.active;
            _this.active = false;
            _this.on.error.fire(e);
            _this.parent ? _this.parent._reject(e) : wasActive && _this.idbtrans && _this.idbtrans.abort();
            return rejection(e);
          });
        });
      }
      function createIndexSpec(name, keyPath, unique, multi, auto, compound, isPrimKey, type2) {
        return {
          name,
          keyPath,
          unique,
          multi,
          auto,
          compound,
          src: (unique && !isPrimKey ? "&" : "") + (multi ? "*" : "") + (auto ? "++" : "") + nameFromKeyPath(keyPath),
          type: type2
        };
      }
      function nameFromKeyPath(keyPath) {
        return typeof keyPath === "string" ? keyPath : keyPath ? "[" + [].join.call(keyPath, "+") + "]" : "";
      }
      function createTableSchema(name, primKey, indexes) {
        return {
          name,
          primKey,
          indexes,
          mappedClass: null,
          idxByName: arrayToObject(indexes, function(index) {
            return [index.name, index];
          })
        };
      }
      function safariMultiStoreFix(storeNames) {
        return storeNames.length === 1 ? storeNames[0] : storeNames;
      }
      var getMaxKey = function(IdbKeyRange) {
        try {
          IdbKeyRange.only([[]]);
          getMaxKey = function() {
            return [[]];
          };
          return [[]];
        } catch (e) {
          getMaxKey = function() {
            return maxString;
          };
          return maxString;
        }
      };
      function getKeyExtractor(keyPath) {
        if (keyPath == null) {
          return function() {
            return;
          };
        } else if (typeof keyPath === "string") {
          return getSinglePathKeyExtractor(keyPath);
        } else {
          return function(obj) {
            return getByKeyPath(obj, keyPath);
          };
        }
      }
      function getSinglePathKeyExtractor(keyPath) {
        var split = keyPath.split(".");
        if (split.length === 1) {
          return function(obj) {
            return obj[keyPath];
          };
        } else {
          return function(obj) {
            return getByKeyPath(obj, keyPath);
          };
        }
      }
      function arrayify(arrayLike) {
        return [].slice.call(arrayLike);
      }
      var _id_counter = 0;
      function getKeyPathAlias(keyPath) {
        return keyPath == null ? ":id" : typeof keyPath === "string" ? keyPath : "[".concat(keyPath.join("+"), "]");
      }
      function createDBCore(db, IdbKeyRange, tmpTrans) {
        function extractSchema(db2, trans) {
          var tables2 = arrayify(db2.objectStoreNames);
          return {
            schema: {
              name: db2.name,
              tables: tables2.map(function(table) {
                return trans.objectStore(table);
              }).map(function(store) {
                var { keyPath, autoIncrement } = store;
                var compound = isArray(keyPath);
                var outbound = keyPath == null;
                var indexByKeyPath = {};
                var result = {
                  name: store.name,
                  primaryKey: {
                    name: null,
                    isPrimaryKey: true,
                    outbound,
                    compound,
                    keyPath,
                    autoIncrement,
                    unique: true,
                    extractKey: getKeyExtractor(keyPath)
                  },
                  indexes: arrayify(store.indexNames).map(function(indexName) {
                    return store.index(indexName);
                  }).map(function(index) {
                    var { name, unique, multiEntry, keyPath: keyPath2 } = index;
                    var compound2 = isArray(keyPath2);
                    var result2 = {
                      name,
                      compound: compound2,
                      keyPath: keyPath2,
                      unique,
                      multiEntry,
                      extractKey: getKeyExtractor(keyPath2)
                    };
                    indexByKeyPath[getKeyPathAlias(keyPath2)] = result2;
                    return result2;
                  }),
                  getIndexByKeyPath: function(keyPath2) {
                    return indexByKeyPath[getKeyPathAlias(keyPath2)];
                  }
                };
                indexByKeyPath[":id"] = result.primaryKey;
                if (keyPath != null) {
                  indexByKeyPath[getKeyPathAlias(keyPath)] = result.primaryKey;
                }
                return result;
              })
            },
            hasGetAll: tables2.length > 0 && "getAll" in trans.objectStore(tables2[0]) && !(typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
          };
        }
        function makeIDBKeyRange(range) {
          if (range.type === 3)
            return null;
          if (range.type === 4)
            throw new Error("Cannot convert never type to IDBKeyRange");
          var { lower, upper, lowerOpen, upperOpen } = range;
          var idbRange = lower === undefined ? upper === undefined ? null : IdbKeyRange.upperBound(upper, !!upperOpen) : upper === undefined ? IdbKeyRange.lowerBound(lower, !!lowerOpen) : IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
          return idbRange;
        }
        function createDbCoreTable(tableSchema) {
          var tableName = tableSchema.name;
          function mutate(_a3) {
            var { trans, type: type2, keys: keys2, values, range } = _a3;
            return new Promise(function(resolve, reject) {
              resolve = wrap(resolve);
              var store = trans.objectStore(tableName);
              var outbound = store.keyPath == null;
              var isAddOrPut = type2 === "put" || type2 === "add";
              if (!isAddOrPut && type2 !== "delete" && type2 !== "deleteRange")
                throw new Error("Invalid operation type: " + type2);
              var length = (keys2 || values || { length: 1 }).length;
              if (keys2 && values && keys2.length !== values.length) {
                throw new Error("Given keys array must have same length as given values array.");
              }
              if (length === 0)
                return resolve({ numFailures: 0, failures: {}, results: [], lastResult: undefined });
              var req;
              var reqs = [];
              var failures = [];
              var numFailures = 0;
              var errorHandler = function(event) {
                ++numFailures;
                preventDefault(event);
              };
              if (type2 === "deleteRange") {
                if (range.type === 4)
                  return resolve({ numFailures, failures, results: [], lastResult: undefined });
                if (range.type === 3)
                  reqs.push(req = store.clear());
                else
                  reqs.push(req = store.delete(makeIDBKeyRange(range)));
              } else {
                var _a4 = isAddOrPut ? outbound ? [values, keys2] : [values, null] : [keys2, null], args1 = _a4[0], args2 = _a4[1];
                if (isAddOrPut) {
                  for (var i2 = 0;i2 < length; ++i2) {
                    reqs.push(req = args2 && args2[i2] !== undefined ? store[type2](args1[i2], args2[i2]) : store[type2](args1[i2]));
                    req.onerror = errorHandler;
                  }
                } else {
                  for (var i2 = 0;i2 < length; ++i2) {
                    reqs.push(req = store[type2](args1[i2]));
                    req.onerror = errorHandler;
                  }
                }
              }
              var done = function(event) {
                var lastResult = event.target.result;
                reqs.forEach(function(req2, i3) {
                  return req2.error != null && (failures[i3] = req2.error);
                });
                resolve({
                  numFailures,
                  failures,
                  results: type2 === "delete" ? keys2 : reqs.map(function(req2) {
                    return req2.result;
                  }),
                  lastResult
                });
              };
              req.onerror = function(event) {
                errorHandler(event);
                done(event);
              };
              req.onsuccess = done;
            });
          }
          function openCursor2(_a3) {
            var { trans, values, query: query2, reverse, unique } = _a3;
            return new Promise(function(resolve, reject) {
              resolve = wrap(resolve);
              var { index, range } = query2;
              var store = trans.objectStore(tableName);
              var source = index.isPrimaryKey ? store : store.index(index.name);
              var direction = reverse ? unique ? "prevunique" : "prev" : unique ? "nextunique" : "next";
              var req = values || !("openKeyCursor" in source) ? source.openCursor(makeIDBKeyRange(range), direction) : source.openKeyCursor(makeIDBKeyRange(range), direction);
              req.onerror = eventRejectHandler(reject);
              req.onsuccess = wrap(function(ev) {
                var cursor = req.result;
                if (!cursor) {
                  resolve(null);
                  return;
                }
                cursor.___id = ++_id_counter;
                cursor.done = false;
                var _cursorContinue = cursor.continue.bind(cursor);
                var _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
                if (_cursorContinuePrimaryKey)
                  _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
                var _cursorAdvance = cursor.advance.bind(cursor);
                var doThrowCursorIsNotStarted = function() {
                  throw new Error("Cursor not started");
                };
                var doThrowCursorIsStopped = function() {
                  throw new Error("Cursor not stopped");
                };
                cursor.trans = trans;
                cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
                cursor.fail = wrap(reject);
                cursor.next = function() {
                  var _this = this;
                  var gotOne = 1;
                  return this.start(function() {
                    return gotOne-- ? _this.continue() : _this.stop();
                  }).then(function() {
                    return _this;
                  });
                };
                cursor.start = function(callback) {
                  var iterationPromise = new Promise(function(resolveIteration, rejectIteration) {
                    resolveIteration = wrap(resolveIteration);
                    req.onerror = eventRejectHandler(rejectIteration);
                    cursor.fail = rejectIteration;
                    cursor.stop = function(value) {
                      cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
                      resolveIteration(value);
                    };
                  });
                  var guardedCallback = function() {
                    if (req.result) {
                      try {
                        callback();
                      } catch (err) {
                        cursor.fail(err);
                      }
                    } else {
                      cursor.done = true;
                      cursor.start = function() {
                        throw new Error("Cursor behind last entry");
                      };
                      cursor.stop();
                    }
                  };
                  req.onsuccess = wrap(function(ev2) {
                    req.onsuccess = guardedCallback;
                    guardedCallback();
                  });
                  cursor.continue = _cursorContinue;
                  cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
                  cursor.advance = _cursorAdvance;
                  guardedCallback();
                  return iterationPromise;
                };
                resolve(cursor);
              }, reject);
            });
          }
          function query(hasGetAll2) {
            return function(request) {
              return new Promise(function(resolve, reject) {
                resolve = wrap(resolve);
                var { trans, values, limit: limit2, query: query2 } = request;
                var nonInfinitLimit = limit2 === Infinity ? undefined : limit2;
                var { index, range } = query2;
                var store = trans.objectStore(tableName);
                var source = index.isPrimaryKey ? store : store.index(index.name);
                var idbKeyRange = makeIDBKeyRange(range);
                if (limit2 === 0)
                  return resolve({ result: [] });
                if (hasGetAll2) {
                  var req = values ? source.getAll(idbKeyRange, nonInfinitLimit) : source.getAllKeys(idbKeyRange, nonInfinitLimit);
                  req.onsuccess = function(event) {
                    return resolve({ result: event.target.result });
                  };
                  req.onerror = eventRejectHandler(reject);
                } else {
                  var count_1 = 0;
                  var req_1 = values || !("openKeyCursor" in source) ? source.openCursor(idbKeyRange) : source.openKeyCursor(idbKeyRange);
                  var result_1 = [];
                  req_1.onsuccess = function(event) {
                    var cursor = req_1.result;
                    if (!cursor)
                      return resolve({ result: result_1 });
                    result_1.push(values ? cursor.value : cursor.primaryKey);
                    if (++count_1 === limit2)
                      return resolve({ result: result_1 });
                    cursor.continue();
                  };
                  req_1.onerror = eventRejectHandler(reject);
                }
              });
            };
          }
          return {
            name: tableName,
            schema: tableSchema,
            mutate,
            getMany: function(_a3) {
              var { trans, keys: keys2 } = _a3;
              return new Promise(function(resolve, reject) {
                resolve = wrap(resolve);
                var store = trans.objectStore(tableName);
                var length = keys2.length;
                var result = new Array(length);
                var keyCount = 0;
                var callbackCount = 0;
                var req;
                var successHandler = function(event) {
                  var req2 = event.target;
                  if ((result[req2._pos] = req2.result) != null)
                    ;
                  if (++callbackCount === keyCount)
                    resolve(result);
                };
                var errorHandler = eventRejectHandler(reject);
                for (var i2 = 0;i2 < length; ++i2) {
                  var key = keys2[i2];
                  if (key != null) {
                    req = store.get(keys2[i2]);
                    req._pos = i2;
                    req.onsuccess = successHandler;
                    req.onerror = errorHandler;
                    ++keyCount;
                  }
                }
                if (keyCount === 0)
                  resolve(result);
              });
            },
            get: function(_a3) {
              var { trans, key } = _a3;
              return new Promise(function(resolve, reject) {
                resolve = wrap(resolve);
                var store = trans.objectStore(tableName);
                var req = store.get(key);
                req.onsuccess = function(event) {
                  return resolve(event.target.result);
                };
                req.onerror = eventRejectHandler(reject);
              });
            },
            query: query(hasGetAll),
            openCursor: openCursor2,
            count: function(_a3) {
              var { query: query2, trans } = _a3;
              var { index, range } = query2;
              return new Promise(function(resolve, reject) {
                var store = trans.objectStore(tableName);
                var source = index.isPrimaryKey ? store : store.index(index.name);
                var idbKeyRange = makeIDBKeyRange(range);
                var req = idbKeyRange ? source.count(idbKeyRange) : source.count();
                req.onsuccess = wrap(function(ev) {
                  return resolve(ev.target.result);
                });
                req.onerror = eventRejectHandler(reject);
              });
            }
          };
        }
        var _a2 = extractSchema(db, tmpTrans), schema = _a2.schema, hasGetAll = _a2.hasGetAll;
        var tables = schema.tables.map(function(tableSchema) {
          return createDbCoreTable(tableSchema);
        });
        var tableMap = {};
        tables.forEach(function(table) {
          return tableMap[table.name] = table;
        });
        return {
          stack: "dbcore",
          transaction: db.transaction.bind(db),
          table: function(name) {
            var result = tableMap[name];
            if (!result)
              throw new Error("Table '".concat(name, "' not found"));
            return tableMap[name];
          },
          MIN_KEY: -Infinity,
          MAX_KEY: getMaxKey(IdbKeyRange),
          schema
        };
      }
      function createMiddlewareStack(stackImpl, middlewares) {
        return middlewares.reduce(function(down, _a2) {
          var create = _a2.create;
          return __assign(__assign({}, down), create(down));
        }, stackImpl);
      }
      function createMiddlewareStacks(middlewares, idbdb, _a2, tmpTrans) {
        var IDBKeyRange = _a2.IDBKeyRange;
        _a2.indexedDB;
        var dbcore = createMiddlewareStack(createDBCore(idbdb, IDBKeyRange, tmpTrans), middlewares.dbcore);
        return {
          dbcore
        };
      }
      function generateMiddlewareStacks(db, tmpTrans) {
        var idbdb = tmpTrans.db;
        var stacks = createMiddlewareStacks(db._middlewares, idbdb, db._deps, tmpTrans);
        db.core = stacks.dbcore;
        db.tables.forEach(function(table) {
          var tableName = table.name;
          if (db.core.schema.tables.some(function(tbl) {
            return tbl.name === tableName;
          })) {
            table.core = db.core.table(tableName);
            if (db[tableName] instanceof db.Table) {
              db[tableName].core = table.core;
            }
          }
        });
      }
      function setApiOnPlace(db, objs, tableNames, dbschema) {
        tableNames.forEach(function(tableName) {
          var schema = dbschema[tableName];
          objs.forEach(function(obj) {
            var propDesc = getPropertyDescriptor(obj, tableName);
            if (!propDesc || "value" in propDesc && propDesc.value === undefined) {
              if (obj === db.Transaction.prototype || obj instanceof db.Transaction) {
                setProp(obj, tableName, {
                  get: function() {
                    return this.table(tableName);
                  },
                  set: function(value) {
                    defineProperty(this, tableName, { value, writable: true, configurable: true, enumerable: true });
                  }
                });
              } else {
                obj[tableName] = new db.Table(tableName, schema);
              }
            }
          });
        });
      }
      function removeTablesApi(db, objs) {
        objs.forEach(function(obj) {
          for (var key in obj) {
            if (obj[key] instanceof db.Table)
              delete obj[key];
          }
        });
      }
      function lowerVersionFirst(a, b) {
        return a._cfg.version - b._cfg.version;
      }
      function runUpgraders(db, oldVersion, idbUpgradeTrans, reject) {
        var globalSchema = db._dbSchema;
        if (idbUpgradeTrans.objectStoreNames.contains("$meta") && !globalSchema.$meta) {
          globalSchema.$meta = createTableSchema("$meta", parseIndexSyntax("")[0], []);
          db._storeNames.push("$meta");
        }
        var trans = db._createTransaction("readwrite", db._storeNames, globalSchema);
        trans.create(idbUpgradeTrans);
        trans._completion.catch(reject);
        var rejectTransaction = trans._reject.bind(trans);
        var transless = PSD.transless || PSD;
        newScope(function() {
          PSD.trans = trans;
          PSD.transless = transless;
          if (oldVersion === 0) {
            keys(globalSchema).forEach(function(tableName) {
              createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
            });
            generateMiddlewareStacks(db, idbUpgradeTrans);
            DexiePromise.follow(function() {
              return db.on.populate.fire(trans);
            }).catch(rejectTransaction);
          } else {
            generateMiddlewareStacks(db, idbUpgradeTrans);
            return getExistingVersion(db, trans, oldVersion).then(function(oldVersion2) {
              return updateTablesAndIndexes(db, oldVersion2, trans, idbUpgradeTrans);
            }).catch(rejectTransaction);
          }
        });
      }
      function patchCurrentVersion(db, idbUpgradeTrans) {
        createMissingTables(db._dbSchema, idbUpgradeTrans);
        if (idbUpgradeTrans.db.version % 10 === 0 && !idbUpgradeTrans.objectStoreNames.contains("$meta")) {
          idbUpgradeTrans.db.createObjectStore("$meta").add(Math.ceil(idbUpgradeTrans.db.version / 10 - 1), "version");
        }
        var globalSchema = buildGlobalSchema(db, db.idbdb, idbUpgradeTrans);
        adjustToExistingIndexNames(db, db._dbSchema, idbUpgradeTrans);
        var diff = getSchemaDiff(globalSchema, db._dbSchema);
        var _loop_1 = function(tableChange2) {
          if (tableChange2.change.length || tableChange2.recreate) {
            console.warn("Unable to patch indexes of table ".concat(tableChange2.name, " because it has changes on the type of index or primary key."));
            return { value: undefined };
          }
          var store = idbUpgradeTrans.objectStore(tableChange2.name);
          tableChange2.add.forEach(function(idx) {
            if (debug)
              console.debug("Dexie upgrade patch: Creating missing index ".concat(tableChange2.name, ".").concat(idx.src));
            addIndex(store, idx);
          });
        };
        for (var _i = 0, _a2 = diff.change;_i < _a2.length; _i++) {
          var tableChange = _a2[_i];
          var state_1 = _loop_1(tableChange);
          if (typeof state_1 === "object")
            return state_1.value;
        }
      }
      function getExistingVersion(db, trans, oldVersion) {
        if (trans.storeNames.includes("$meta")) {
          return trans.table("$meta").get("version").then(function(metaVersion) {
            return metaVersion != null ? metaVersion : oldVersion;
          });
        } else {
          return DexiePromise.resolve(oldVersion);
        }
      }
      function updateTablesAndIndexes(db, oldVersion, trans, idbUpgradeTrans) {
        var queue = [];
        var versions = db._versions;
        var globalSchema = db._dbSchema = buildGlobalSchema(db, db.idbdb, idbUpgradeTrans);
        var versToRun = versions.filter(function(v) {
          return v._cfg.version >= oldVersion;
        });
        if (versToRun.length === 0) {
          return DexiePromise.resolve();
        }
        versToRun.forEach(function(version) {
          queue.push(function() {
            var oldSchema = globalSchema;
            var newSchema = version._cfg.dbschema;
            adjustToExistingIndexNames(db, oldSchema, idbUpgradeTrans);
            adjustToExistingIndexNames(db, newSchema, idbUpgradeTrans);
            globalSchema = db._dbSchema = newSchema;
            var diff = getSchemaDiff(oldSchema, newSchema);
            diff.add.forEach(function(tuple) {
              createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
            });
            diff.change.forEach(function(change) {
              if (change.recreate) {
                throw new exceptions.Upgrade("Not yet support for changing primary key");
              } else {
                var store_1 = idbUpgradeTrans.objectStore(change.name);
                change.add.forEach(function(idx) {
                  return addIndex(store_1, idx);
                });
                change.change.forEach(function(idx) {
                  store_1.deleteIndex(idx.name);
                  addIndex(store_1, idx);
                });
                change.del.forEach(function(idxName) {
                  return store_1.deleteIndex(idxName);
                });
              }
            });
            var contentUpgrade = version._cfg.contentUpgrade;
            if (contentUpgrade && version._cfg.version > oldVersion) {
              generateMiddlewareStacks(db, idbUpgradeTrans);
              trans._memoizedTables = {};
              var upgradeSchema_1 = shallowClone(newSchema);
              diff.del.forEach(function(table) {
                upgradeSchema_1[table] = oldSchema[table];
              });
              removeTablesApi(db, [db.Transaction.prototype]);
              setApiOnPlace(db, [db.Transaction.prototype], keys(upgradeSchema_1), upgradeSchema_1);
              trans.schema = upgradeSchema_1;
              var contentUpgradeIsAsync_1 = isAsyncFunction(contentUpgrade);
              if (contentUpgradeIsAsync_1) {
                incrementExpectedAwaits();
              }
              var returnValue_1;
              var promiseFollowed = DexiePromise.follow(function() {
                returnValue_1 = contentUpgrade(trans);
                if (returnValue_1) {
                  if (contentUpgradeIsAsync_1) {
                    var decrementor = decrementExpectedAwaits.bind(null, null);
                    returnValue_1.then(decrementor, decrementor);
                  }
                }
              });
              return returnValue_1 && typeof returnValue_1.then === "function" ? DexiePromise.resolve(returnValue_1) : promiseFollowed.then(function() {
                return returnValue_1;
              });
            }
          });
          queue.push(function(idbtrans) {
            var newSchema = version._cfg.dbschema;
            deleteRemovedTables(newSchema, idbtrans);
            removeTablesApi(db, [db.Transaction.prototype]);
            setApiOnPlace(db, [db.Transaction.prototype], db._storeNames, db._dbSchema);
            trans.schema = db._dbSchema;
          });
          queue.push(function(idbtrans) {
            if (db.idbdb.objectStoreNames.contains("$meta")) {
              if (Math.ceil(db.idbdb.version / 10) === version._cfg.version) {
                db.idbdb.deleteObjectStore("$meta");
                delete db._dbSchema.$meta;
                db._storeNames = db._storeNames.filter(function(name) {
                  return name !== "$meta";
                });
              } else {
                idbtrans.objectStore("$meta").put(version._cfg.version, "version");
              }
            }
          });
        });
        function runQueue() {
          return queue.length ? DexiePromise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) : DexiePromise.resolve();
        }
        return runQueue().then(function() {
          createMissingTables(globalSchema, idbUpgradeTrans);
        });
      }
      function getSchemaDiff(oldSchema, newSchema) {
        var diff = {
          del: [],
          add: [],
          change: []
        };
        var table;
        for (table in oldSchema) {
          if (!newSchema[table])
            diff.del.push(table);
        }
        for (table in newSchema) {
          var oldDef = oldSchema[table], newDef = newSchema[table];
          if (!oldDef) {
            diff.add.push([table, newDef]);
          } else {
            var change = {
              name: table,
              def: newDef,
              recreate: false,
              del: [],
              add: [],
              change: []
            };
            if ("" + (oldDef.primKey.keyPath || "") !== "" + (newDef.primKey.keyPath || "") || oldDef.primKey.auto !== newDef.primKey.auto) {
              change.recreate = true;
              diff.change.push(change);
            } else {
              var oldIndexes = oldDef.idxByName;
              var newIndexes = newDef.idxByName;
              var idxName = undefined;
              for (idxName in oldIndexes) {
                if (!newIndexes[idxName])
                  change.del.push(idxName);
              }
              for (idxName in newIndexes) {
                var oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
                if (!oldIdx)
                  change.add.push(newIdx);
                else if (oldIdx.src !== newIdx.src)
                  change.change.push(newIdx);
              }
              if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                diff.change.push(change);
              }
            }
          }
        }
        return diff;
      }
      function createTable(idbtrans, tableName, primKey, indexes) {
        var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
        indexes.forEach(function(idx) {
          return addIndex(store, idx);
        });
        return store;
      }
      function createMissingTables(newSchema, idbtrans) {
        keys(newSchema).forEach(function(tableName) {
          if (!idbtrans.db.objectStoreNames.contains(tableName)) {
            if (debug)
              console.debug("Dexie: Creating missing table", tableName);
            createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
          }
        });
      }
      function deleteRemovedTables(newSchema, idbtrans) {
        [].slice.call(idbtrans.db.objectStoreNames).forEach(function(storeName) {
          return newSchema[storeName] == null && idbtrans.db.deleteObjectStore(storeName);
        });
      }
      function addIndex(store, idx) {
        store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
      }
      function buildGlobalSchema(db, idbdb, tmpTrans) {
        var globalSchema = {};
        var dbStoreNames = slice(idbdb.objectStoreNames, 0);
        dbStoreNames.forEach(function(storeName) {
          var store = tmpTrans.objectStore(storeName);
          var keyPath = store.keyPath;
          var primKey = createIndexSpec(nameFromKeyPath(keyPath), keyPath || "", true, false, !!store.autoIncrement, keyPath && typeof keyPath !== "string", true);
          var indexes = [];
          for (var j = 0;j < store.indexNames.length; ++j) {
            var idbindex = store.index(store.indexNames[j]);
            keyPath = idbindex.keyPath;
            var index = createIndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== "string", false);
            indexes.push(index);
          }
          globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
        });
        return globalSchema;
      }
      function readGlobalSchema(db, idbdb, tmpTrans) {
        db.verno = idbdb.version / 10;
        var globalSchema = db._dbSchema = buildGlobalSchema(db, idbdb, tmpTrans);
        db._storeNames = slice(idbdb.objectStoreNames, 0);
        setApiOnPlace(db, [db._allTables], keys(globalSchema), globalSchema);
      }
      function verifyInstalledSchema(db, tmpTrans) {
        var installedSchema = buildGlobalSchema(db, db.idbdb, tmpTrans);
        var diff = getSchemaDiff(installedSchema, db._dbSchema);
        return !(diff.add.length || diff.change.some(function(ch) {
          return ch.add.length || ch.change.length;
        }));
      }
      function adjustToExistingIndexNames(db, schema, idbtrans) {
        var storeNames = idbtrans.db.objectStoreNames;
        for (var i2 = 0;i2 < storeNames.length; ++i2) {
          var storeName = storeNames[i2];
          var store = idbtrans.objectStore(storeName);
          db._hasGetAll = "getAll" in store;
          for (var j = 0;j < store.indexNames.length; ++j) {
            var indexName = store.indexNames[j];
            var keyPath = store.index(indexName).keyPath;
            var dexieName = typeof keyPath === "string" ? keyPath : "[" + slice(keyPath).join("+") + "]";
            if (schema[storeName]) {
              var indexSpec = schema[storeName].idxByName[dexieName];
              if (indexSpec) {
                indexSpec.name = indexName;
                delete schema[storeName].idxByName[dexieName];
                schema[storeName].idxByName[indexName] = indexSpec;
              }
            }
          }
        }
        if (typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
          db._hasGetAll = false;
        }
      }
      function parseIndexSyntax(primKeyAndIndexes) {
        return primKeyAndIndexes.split(",").map(function(index, indexNum) {
          var _a2;
          var typeSplit = index.split(":");
          var type2 = (_a2 = typeSplit[1]) === null || _a2 === undefined ? undefined : _a2.trim();
          index = typeSplit[0].trim();
          var name = index.replace(/([&*]|\+\+)/g, "");
          var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split("+") : name;
          return createIndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), indexNum === 0, type2);
        });
      }
      var Version = function() {
        function Version2() {}
        Version2.prototype._createTableSchema = function(name, primKey, indexes) {
          return createTableSchema(name, primKey, indexes);
        };
        Version2.prototype._parseIndexSyntax = function(primKeyAndIndexes) {
          return parseIndexSyntax(primKeyAndIndexes);
        };
        Version2.prototype._parseStoresSpec = function(stores, outSchema) {
          var _this = this;
          keys(stores).forEach(function(tableName) {
            if (stores[tableName] !== null) {
              var indexes = _this._parseIndexSyntax(stores[tableName]);
              var primKey = indexes.shift();
              if (!primKey) {
                throw new exceptions.Schema("Invalid schema for table " + tableName + ": " + stores[tableName]);
              }
              primKey.unique = true;
              if (primKey.multi)
                throw new exceptions.Schema("Primary key cannot be multiEntry*");
              indexes.forEach(function(idx) {
                if (idx.auto)
                  throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                if (!idx.keyPath)
                  throw new exceptions.Schema("Index must have a name and cannot be an empty string");
              });
              var tblSchema = _this._createTableSchema(tableName, primKey, indexes);
              outSchema[tableName] = tblSchema;
            }
          });
        };
        Version2.prototype.stores = function(stores) {
          var db = this.db;
          this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;
          var versions = db._versions;
          var storesSpec = {};
          var dbschema = {};
          versions.forEach(function(version) {
            extend(storesSpec, version._cfg.storesSource);
            dbschema = version._cfg.dbschema = {};
            version._parseStoresSpec(storesSpec, dbschema);
          });
          db._dbSchema = dbschema;
          removeTablesApi(db, [db._allTables, db, db.Transaction.prototype]);
          setApiOnPlace(db, [db._allTables, db, db.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
          db._storeNames = keys(dbschema);
          return this;
        };
        Version2.prototype.upgrade = function(upgradeFunction) {
          this._cfg.contentUpgrade = promisableChain(this._cfg.contentUpgrade || nop, upgradeFunction);
          return this;
        };
        return Version2;
      }();
      function createVersionConstructor(db) {
        return makeClassConstructor(Version.prototype, function Version(versionNumber) {
          this.db = db;
          this._cfg = {
            version: versionNumber,
            storesSource: null,
            dbschema: {},
            tables: {},
            contentUpgrade: null
          };
        });
      }
      function getDbNamesTable(indexedDB2, IDBKeyRange) {
        var dbNamesDB = indexedDB2["_dbNamesDB"];
        if (!dbNamesDB) {
          dbNamesDB = indexedDB2["_dbNamesDB"] = new Dexie$1(DBNAMES_DB, {
            addons: [],
            indexedDB: indexedDB2,
            IDBKeyRange
          });
          dbNamesDB.version(1).stores({ dbnames: "name" });
        }
        return dbNamesDB.table("dbnames");
      }
      function hasDatabasesNative(indexedDB2) {
        return indexedDB2 && typeof indexedDB2.databases === "function";
      }
      function getDatabaseNames(_a2) {
        var { indexedDB: indexedDB2, IDBKeyRange } = _a2;
        return hasDatabasesNative(indexedDB2) ? Promise.resolve(indexedDB2.databases()).then(function(infos) {
          return infos.map(function(info) {
            return info.name;
          }).filter(function(name) {
            return name !== DBNAMES_DB;
          });
        }) : getDbNamesTable(indexedDB2, IDBKeyRange).toCollection().primaryKeys();
      }
      function _onDatabaseCreated(_a2, name) {
        var { indexedDB: indexedDB2, IDBKeyRange } = _a2;
        !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).put({ name }).catch(nop);
      }
      function _onDatabaseDeleted(_a2, name) {
        var { indexedDB: indexedDB2, IDBKeyRange } = _a2;
        !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).delete(name).catch(nop);
      }
      function vip(fn) {
        return newScope(function() {
          PSD.letThrough = true;
          return fn();
        });
      }
      function idbReady() {
        var isSafari = !navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent);
        if (!isSafari || !indexedDB.databases)
          return Promise.resolve();
        var intervalId;
        return new Promise(function(resolve) {
          var tryIdb = function() {
            return indexedDB.databases().finally(resolve);
          };
          intervalId = setInterval(tryIdb, 100);
          tryIdb();
        }).finally(function() {
          return clearInterval(intervalId);
        });
      }
      var _a;
      function isEmptyRange(node) {
        return !("from" in node);
      }
      var RangeSet = function(fromOrTree, to) {
        if (this) {
          extend(this, arguments.length ? { d: 1, from: fromOrTree, to: arguments.length > 1 ? to : fromOrTree } : { d: 0 });
        } else {
          var rv = new RangeSet;
          if (fromOrTree && "d" in fromOrTree) {
            extend(rv, fromOrTree);
          }
          return rv;
        }
      };
      props(RangeSet.prototype, (_a = {
        add: function(rangeSet) {
          mergeRanges(this, rangeSet);
          return this;
        },
        addKey: function(key) {
          addRange(this, key, key);
          return this;
        },
        addKeys: function(keys2) {
          var _this = this;
          keys2.forEach(function(key) {
            return addRange(_this, key, key);
          });
          return this;
        },
        hasKey: function(key) {
          var node = getRangeSetIterator(this).next(key).value;
          return node && cmp(node.from, key) <= 0 && cmp(node.to, key) >= 0;
        }
      }, _a[iteratorSymbol] = function() {
        return getRangeSetIterator(this);
      }, _a));
      function addRange(target, from, to) {
        var diff = cmp(from, to);
        if (isNaN(diff))
          return;
        if (diff > 0)
          throw RangeError();
        if (isEmptyRange(target))
          return extend(target, { from, to, d: 1 });
        var left = target.l;
        var right = target.r;
        if (cmp(to, target.from) < 0) {
          left ? addRange(left, from, to) : target.l = { from, to, d: 1, l: null, r: null };
          return rebalance(target);
        }
        if (cmp(from, target.to) > 0) {
          right ? addRange(right, from, to) : target.r = { from, to, d: 1, l: null, r: null };
          return rebalance(target);
        }
        if (cmp(from, target.from) < 0) {
          target.from = from;
          target.l = null;
          target.d = right ? right.d + 1 : 1;
        }
        if (cmp(to, target.to) > 0) {
          target.to = to;
          target.r = null;
          target.d = target.l ? target.l.d + 1 : 1;
        }
        var rightWasCutOff = !target.r;
        if (left && !target.l) {
          mergeRanges(target, left);
        }
        if (right && rightWasCutOff) {
          mergeRanges(target, right);
        }
      }
      function mergeRanges(target, newSet) {
        function _addRangeSet(target2, _a2) {
          var { from, to, l, r } = _a2;
          addRange(target2, from, to);
          if (l)
            _addRangeSet(target2, l);
          if (r)
            _addRangeSet(target2, r);
        }
        if (!isEmptyRange(newSet))
          _addRangeSet(target, newSet);
      }
      function rangesOverlap(rangeSet1, rangeSet2) {
        var i1 = getRangeSetIterator(rangeSet2);
        var nextResult1 = i1.next();
        if (nextResult1.done)
          return false;
        var a = nextResult1.value;
        var i2 = getRangeSetIterator(rangeSet1);
        var nextResult2 = i2.next(a.from);
        var b = nextResult2.value;
        while (!nextResult1.done && !nextResult2.done) {
          if (cmp(b.from, a.to) <= 0 && cmp(b.to, a.from) >= 0)
            return true;
          cmp(a.from, b.from) < 0 ? a = (nextResult1 = i1.next(b.from)).value : b = (nextResult2 = i2.next(a.from)).value;
        }
        return false;
      }
      function getRangeSetIterator(node) {
        var state = isEmptyRange(node) ? null : { s: 0, n: node };
        return {
          next: function(key) {
            var keyProvided = arguments.length > 0;
            while (state) {
              switch (state.s) {
                case 0:
                  state.s = 1;
                  if (keyProvided) {
                    while (state.n.l && cmp(key, state.n.from) < 0)
                      state = { up: state, n: state.n.l, s: 1 };
                  } else {
                    while (state.n.l)
                      state = { up: state, n: state.n.l, s: 1 };
                  }
                case 1:
                  state.s = 2;
                  if (!keyProvided || cmp(key, state.n.to) <= 0)
                    return { value: state.n, done: false };
                case 2:
                  if (state.n.r) {
                    state.s = 3;
                    state = { up: state, n: state.n.r, s: 0 };
                    continue;
                  }
                case 3:
                  state = state.up;
              }
            }
            return { done: true };
          }
        };
      }
      function rebalance(target) {
        var _a2, _b;
        var diff = (((_a2 = target.r) === null || _a2 === undefined ? undefined : _a2.d) || 0) - (((_b = target.l) === null || _b === undefined ? undefined : _b.d) || 0);
        var r = diff > 1 ? "r" : diff < -1 ? "l" : "";
        if (r) {
          var l = r === "r" ? "l" : "r";
          var rootClone = __assign({}, target);
          var oldRootRight = target[r];
          target.from = oldRootRight.from;
          target.to = oldRootRight.to;
          target[r] = oldRootRight[r];
          rootClone[r] = oldRootRight[l];
          target[l] = rootClone;
          rootClone.d = computeDepth(rootClone);
        }
        target.d = computeDepth(target);
      }
      function computeDepth(_a2) {
        var { r, l } = _a2;
        return (r ? l ? Math.max(r.d, l.d) : r.d : l ? l.d : 0) + 1;
      }
      function extendObservabilitySet(target, newSet) {
        keys(newSet).forEach(function(part) {
          if (target[part])
            mergeRanges(target[part], newSet[part]);
          else
            target[part] = cloneSimpleObjectTree(newSet[part]);
        });
        return target;
      }
      function obsSetsOverlap(os1, os2) {
        return os1.all || os2.all || Object.keys(os1).some(function(key) {
          return os2[key] && rangesOverlap(os2[key], os1[key]);
        });
      }
      var cache = {};
      var unsignaledParts = {};
      var isTaskEnqueued = false;
      function signalSubscribersLazily(part, optimistic) {
        extendObservabilitySet(unsignaledParts, part);
        if (!isTaskEnqueued) {
          isTaskEnqueued = true;
          setTimeout(function() {
            isTaskEnqueued = false;
            var parts = unsignaledParts;
            unsignaledParts = {};
            signalSubscribersNow(parts, false);
          }, 0);
        }
      }
      function signalSubscribersNow(updatedParts, deleteAffectedCacheEntries) {
        if (deleteAffectedCacheEntries === undefined) {
          deleteAffectedCacheEntries = false;
        }
        var queriesToSignal = new Set;
        if (updatedParts.all) {
          for (var _i = 0, _a2 = Object.values(cache);_i < _a2.length; _i++) {
            var tblCache = _a2[_i];
            collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
          }
        } else {
          for (var key in updatedParts) {
            var parts = /^idb\:\/\/(.*)\/(.*)\//.exec(key);
            if (parts) {
              var dbName = parts[1], tableName = parts[2];
              var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
              if (tblCache)
                collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
            }
          }
        }
        queriesToSignal.forEach(function(requery) {
          return requery();
        });
      }
      function collectTableSubscribers(tblCache, updatedParts, outQueriesToSignal, deleteAffectedCacheEntries) {
        var updatedEntryLists = [];
        for (var _i = 0, _a2 = Object.entries(tblCache.queries.query);_i < _a2.length; _i++) {
          var _b = _a2[_i], indexName = _b[0], entries = _b[1];
          var filteredEntries = [];
          for (var _c = 0, entries_1 = entries;_c < entries_1.length; _c++) {
            var entry = entries_1[_c];
            if (obsSetsOverlap(updatedParts, entry.obsSet)) {
              entry.subscribers.forEach(function(requery) {
                return outQueriesToSignal.add(requery);
              });
            } else if (deleteAffectedCacheEntries) {
              filteredEntries.push(entry);
            }
          }
          if (deleteAffectedCacheEntries)
            updatedEntryLists.push([indexName, filteredEntries]);
        }
        if (deleteAffectedCacheEntries) {
          for (var _d = 0, updatedEntryLists_1 = updatedEntryLists;_d < updatedEntryLists_1.length; _d++) {
            var _e = updatedEntryLists_1[_d], indexName = _e[0], filteredEntries = _e[1];
            tblCache.queries.query[indexName] = filteredEntries;
          }
        }
      }
      function dexieOpen(db) {
        var state = db._state;
        var indexedDB2 = db._deps.indexedDB;
        if (state.isBeingOpened || db.idbdb)
          return state.dbReadyPromise.then(function() {
            return state.dbOpenError ? rejection(state.dbOpenError) : db;
          });
        state.isBeingOpened = true;
        state.dbOpenError = null;
        state.openComplete = false;
        var openCanceller = state.openCanceller;
        var nativeVerToOpen = Math.round(db.verno * 10);
        var schemaPatchMode = false;
        function throwIfCancelled() {
          if (state.openCanceller !== openCanceller)
            throw new exceptions.DatabaseClosed("db.open() was cancelled");
        }
        var resolveDbReady = state.dbReadyResolve, upgradeTransaction = null, wasCreated = false;
        var tryOpenDB = function() {
          return new DexiePromise(function(resolve, reject) {
            throwIfCancelled();
            if (!indexedDB2)
              throw new exceptions.MissingAPI;
            var dbName = db.name;
            var req = state.autoSchema || !nativeVerToOpen ? indexedDB2.open(dbName) : indexedDB2.open(dbName, nativeVerToOpen);
            if (!req)
              throw new exceptions.MissingAPI;
            req.onerror = eventRejectHandler(reject);
            req.onblocked = wrap(db._fireOnBlocked);
            req.onupgradeneeded = wrap(function(e) {
              upgradeTransaction = req.transaction;
              if (state.autoSchema && !db._options.allowEmptyDB) {
                req.onerror = preventDefault;
                upgradeTransaction.abort();
                req.result.close();
                var delreq = indexedDB2.deleteDatabase(dbName);
                delreq.onsuccess = delreq.onerror = wrap(function() {
                  reject(new exceptions.NoSuchDatabase("Database ".concat(dbName, " doesnt exist")));
                });
              } else {
                upgradeTransaction.onerror = eventRejectHandler(reject);
                var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion;
                wasCreated = oldVer < 1;
                db.idbdb = req.result;
                if (schemaPatchMode) {
                  patchCurrentVersion(db, upgradeTransaction);
                }
                runUpgraders(db, oldVer / 10, upgradeTransaction, reject);
              }
            }, reject);
            req.onsuccess = wrap(function() {
              upgradeTransaction = null;
              var idbdb = db.idbdb = req.result;
              var objectStoreNames = slice(idbdb.objectStoreNames);
              if (objectStoreNames.length > 0)
                try {
                  var tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), "readonly");
                  if (state.autoSchema)
                    readGlobalSchema(db, idbdb, tmpTrans);
                  else {
                    adjustToExistingIndexNames(db, db._dbSchema, tmpTrans);
                    if (!verifyInstalledSchema(db, tmpTrans) && !schemaPatchMode) {
                      console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this.");
                      idbdb.close();
                      nativeVerToOpen = idbdb.version + 1;
                      schemaPatchMode = true;
                      return resolve(tryOpenDB());
                    }
                  }
                  generateMiddlewareStacks(db, tmpTrans);
                } catch (e) {}
              connections.push(db);
              idbdb.onversionchange = wrap(function(ev) {
                state.vcFired = true;
                db.on("versionchange").fire(ev);
              });
              idbdb.onclose = wrap(function() {
                db.close({ disableAutoOpen: false });
              });
              if (wasCreated)
                _onDatabaseCreated(db._deps, dbName);
              resolve();
            }, reject);
          }).catch(function(err) {
            switch (err === null || err === undefined ? undefined : err.name) {
              case "UnknownError":
                if (state.PR1398_maxLoop > 0) {
                  state.PR1398_maxLoop--;
                  console.warn("Dexie: Workaround for Chrome UnknownError on open()");
                  return tryOpenDB();
                }
                break;
              case "VersionError":
                if (nativeVerToOpen > 0) {
                  nativeVerToOpen = 0;
                  return tryOpenDB();
                }
                break;
            }
            return DexiePromise.reject(err);
          });
        };
        return DexiePromise.race([
          openCanceller,
          (typeof navigator === "undefined" ? DexiePromise.resolve() : idbReady()).then(tryOpenDB)
        ]).then(function() {
          throwIfCancelled();
          state.onReadyBeingFired = [];
          return DexiePromise.resolve(vip(function() {
            return db.on.ready.fire(db.vip);
          })).then(function fireRemainders() {
            if (state.onReadyBeingFired.length > 0) {
              var remainders_1 = state.onReadyBeingFired.reduce(promisableChain, nop);
              state.onReadyBeingFired = [];
              return DexiePromise.resolve(vip(function() {
                return remainders_1(db.vip);
              })).then(fireRemainders);
            }
          });
        }).finally(function() {
          if (state.openCanceller === openCanceller) {
            state.onReadyBeingFired = null;
            state.isBeingOpened = false;
          }
        }).catch(function(err) {
          state.dbOpenError = err;
          try {
            upgradeTransaction && upgradeTransaction.abort();
          } catch (_a2) {}
          if (openCanceller === state.openCanceller) {
            db._close();
          }
          return rejection(err);
        }).finally(function() {
          state.openComplete = true;
          resolveDbReady();
        }).then(function() {
          if (wasCreated) {
            var everything_1 = {};
            db.tables.forEach(function(table) {
              table.schema.indexes.forEach(function(idx) {
                if (idx.name)
                  everything_1["idb://".concat(db.name, "/").concat(table.name, "/").concat(idx.name)] = new RangeSet(-Infinity, [[[]]]);
              });
              everything_1["idb://".concat(db.name, "/").concat(table.name, "/")] = everything_1["idb://".concat(db.name, "/").concat(table.name, "/:dels")] = new RangeSet(-Infinity, [[[]]]);
            });
            globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME).fire(everything_1);
            signalSubscribersNow(everything_1, true);
          }
          return db;
        });
      }
      function awaitIterator(iterator) {
        var callNext = function(result) {
          return iterator.next(result);
        }, doThrow = function(error) {
          return iterator.throw(error);
        }, onSuccess = step(callNext), onError = step(doThrow);
        function step(getNext) {
          return function(val) {
            var next = getNext(val), value = next.value;
            return next.done ? value : !value || typeof value.then !== "function" ? isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
          };
        }
        return step(callNext)();
      }
      function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
        var i2 = arguments.length;
        if (i2 < 2)
          throw new exceptions.InvalidArgument("Too few arguments");
        var args = new Array(i2 - 1);
        while (--i2)
          args[i2 - 1] = arguments[i2];
        scopeFunc = args.pop();
        var tables = flatten(args);
        return [mode, tables, scopeFunc];
      }
      function enterTransactionScope(db, mode, storeNames, parentTransaction, scopeFunc) {
        return DexiePromise.resolve().then(function() {
          var transless = PSD.transless || PSD;
          var trans = db._createTransaction(mode, storeNames, db._dbSchema, parentTransaction);
          trans.explicit = true;
          var zoneProps = {
            trans,
            transless
          };
          if (parentTransaction) {
            trans.idbtrans = parentTransaction.idbtrans;
          } else {
            try {
              trans.create();
              trans.idbtrans._explicit = true;
              db._state.PR1398_maxLoop = 3;
            } catch (ex) {
              if (ex.name === errnames.InvalidState && db.isOpen() && --db._state.PR1398_maxLoop > 0) {
                console.warn("Dexie: Need to reopen db");
                db.close({ disableAutoOpen: false });
                return db.open().then(function() {
                  return enterTransactionScope(db, mode, storeNames, null, scopeFunc);
                });
              }
              return rejection(ex);
            }
          }
          var scopeFuncIsAsync = isAsyncFunction(scopeFunc);
          if (scopeFuncIsAsync) {
            incrementExpectedAwaits();
          }
          var returnValue;
          var promiseFollowed = DexiePromise.follow(function() {
            returnValue = scopeFunc.call(trans, trans);
            if (returnValue) {
              if (scopeFuncIsAsync) {
                var decrementor = decrementExpectedAwaits.bind(null, null);
                returnValue.then(decrementor, decrementor);
              } else if (typeof returnValue.next === "function" && typeof returnValue.throw === "function") {
                returnValue = awaitIterator(returnValue);
              }
            }
          }, zoneProps);
          return (returnValue && typeof returnValue.then === "function" ? DexiePromise.resolve(returnValue).then(function(x) {
            return trans.active ? x : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
          }) : promiseFollowed.then(function() {
            return returnValue;
          })).then(function(x) {
            if (parentTransaction)
              trans._resolve();
            return trans._completion.then(function() {
              return x;
            });
          }).catch(function(e) {
            trans._reject(e);
            return rejection(e);
          });
        });
      }
      function pad2(a, value, count) {
        var result = isArray(a) ? a.slice() : [a];
        for (var i2 = 0;i2 < count; ++i2)
          result.push(value);
        return result;
      }
      function createVirtualIndexMiddleware(down) {
        return __assign(__assign({}, down), { table: function(tableName) {
          var table = down.table(tableName);
          var schema = table.schema;
          var indexLookup = {};
          var allVirtualIndexes = [];
          function addVirtualIndexes(keyPath, keyTail, lowLevelIndex) {
            var keyPathAlias = getKeyPathAlias(keyPath);
            var indexList = indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || [];
            var keyLength = keyPath == null ? 0 : typeof keyPath === "string" ? 1 : keyPath.length;
            var isVirtual = keyTail > 0;
            var virtualIndex = __assign(__assign({}, lowLevelIndex), { name: isVirtual ? "".concat(keyPathAlias, "(virtual-from:").concat(lowLevelIndex.name, ")") : lowLevelIndex.name, lowLevelIndex, isVirtual, keyTail, keyLength, extractKey: getKeyExtractor(keyPath), unique: !isVirtual && lowLevelIndex.unique });
            indexList.push(virtualIndex);
            if (!virtualIndex.isPrimaryKey) {
              allVirtualIndexes.push(virtualIndex);
            }
            if (keyLength > 1) {
              var virtualKeyPath = keyLength === 2 ? keyPath[0] : keyPath.slice(0, keyLength - 1);
              addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
            }
            indexList.sort(function(a, b) {
              return a.keyTail - b.keyTail;
            });
            return virtualIndex;
          }
          var primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
          indexLookup[":id"] = [primaryKey];
          for (var _i = 0, _a2 = schema.indexes;_i < _a2.length; _i++) {
            var index = _a2[_i];
            addVirtualIndexes(index.keyPath, 0, index);
          }
          function findBestIndex(keyPath) {
            var result2 = indexLookup[getKeyPathAlias(keyPath)];
            return result2 && result2[0];
          }
          function translateRange(range, keyTail) {
            return {
              type: range.type === 1 ? 2 : range.type,
              lower: pad2(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
              lowerOpen: true,
              upper: pad2(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
              upperOpen: true
            };
          }
          function translateRequest(req) {
            var index2 = req.query.index;
            return index2.isVirtual ? __assign(__assign({}, req), { query: {
              index: index2.lowLevelIndex,
              range: translateRange(req.query.range, index2.keyTail)
            } }) : req;
          }
          var result = __assign(__assign({}, table), { schema: __assign(__assign({}, schema), { primaryKey, indexes: allVirtualIndexes, getIndexByKeyPath: findBestIndex }), count: function(req) {
            return table.count(translateRequest(req));
          }, query: function(req) {
            return table.query(translateRequest(req));
          }, openCursor: function(req) {
            var _a3 = req.query.index, keyTail = _a3.keyTail, isVirtual = _a3.isVirtual, keyLength = _a3.keyLength;
            if (!isVirtual)
              return table.openCursor(req);
            function createVirtualCursor(cursor) {
              function _continue(key) {
                key != null ? cursor.continue(pad2(key, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) : req.unique ? cursor.continue(cursor.key.slice(0, keyLength).concat(req.reverse ? down.MIN_KEY : down.MAX_KEY, keyTail)) : cursor.continue();
              }
              var virtualCursor = Object.create(cursor, {
                continue: { value: _continue },
                continuePrimaryKey: {
                  value: function(key, primaryKey2) {
                    cursor.continuePrimaryKey(pad2(key, down.MAX_KEY, keyTail), primaryKey2);
                  }
                },
                primaryKey: {
                  get: function() {
                    return cursor.primaryKey;
                  }
                },
                key: {
                  get: function() {
                    var key = cursor.key;
                    return keyLength === 1 ? key[0] : key.slice(0, keyLength);
                  }
                },
                value: {
                  get: function() {
                    return cursor.value;
                  }
                }
              });
              return virtualCursor;
            }
            return table.openCursor(translateRequest(req)).then(function(cursor) {
              return cursor && createVirtualCursor(cursor);
            });
          } });
          return result;
        } });
      }
      var virtualIndexMiddleware = {
        stack: "dbcore",
        name: "VirtualIndexMiddleware",
        level: 1,
        create: createVirtualIndexMiddleware
      };
      function getObjectDiff(a, b, rv, prfx) {
        rv = rv || {};
        prfx = prfx || "";
        keys(a).forEach(function(prop) {
          if (!hasOwn(b, prop)) {
            rv[prfx + prop] = undefined;
          } else {
            var ap = a[prop], bp = b[prop];
            if (typeof ap === "object" && typeof bp === "object" && ap && bp) {
              var apTypeName = toStringTag(ap);
              var bpTypeName = toStringTag(bp);
              if (apTypeName !== bpTypeName) {
                rv[prfx + prop] = b[prop];
              } else if (apTypeName === "Object") {
                getObjectDiff(ap, bp, rv, prfx + prop + ".");
              } else if (ap !== bp) {
                rv[prfx + prop] = b[prop];
              }
            } else if (ap !== bp)
              rv[prfx + prop] = b[prop];
          }
        });
        keys(b).forEach(function(prop) {
          if (!hasOwn(a, prop)) {
            rv[prfx + prop] = b[prop];
          }
        });
        return rv;
      }
      function getEffectiveKeys(primaryKey, req) {
        if (req.type === "delete")
          return req.keys;
        return req.keys || req.values.map(primaryKey.extractKey);
      }
      var hooksMiddleware = {
        stack: "dbcore",
        name: "HooksMiddleware",
        level: 2,
        create: function(downCore) {
          return __assign(__assign({}, downCore), { table: function(tableName) {
            var downTable = downCore.table(tableName);
            var primaryKey = downTable.schema.primaryKey;
            var tableMiddleware = __assign(__assign({}, downTable), { mutate: function(req) {
              var dxTrans = PSD.trans;
              var _a2 = dxTrans.table(tableName).hook, deleting = _a2.deleting, creating = _a2.creating, updating = _a2.updating;
              switch (req.type) {
                case "add":
                  if (creating.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return addPutOrDelete(req);
                  }, true);
                case "put":
                  if (creating.fire === nop && updating.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return addPutOrDelete(req);
                  }, true);
                case "delete":
                  if (deleting.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return addPutOrDelete(req);
                  }, true);
                case "deleteRange":
                  if (deleting.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return deleteRange(req);
                  }, true);
              }
              return downTable.mutate(req);
              function addPutOrDelete(req2) {
                var dxTrans2 = PSD.trans;
                var keys2 = req2.keys || getEffectiveKeys(primaryKey, req2);
                if (!keys2)
                  throw new Error("Keys missing");
                req2 = req2.type === "add" || req2.type === "put" ? __assign(__assign({}, req2), { keys: keys2 }) : __assign({}, req2);
                if (req2.type !== "delete")
                  req2.values = __spreadArray([], req2.values, true);
                if (req2.keys)
                  req2.keys = __spreadArray([], req2.keys, true);
                return getExistingValues(downTable, req2, keys2).then(function(existingValues) {
                  var contexts = keys2.map(function(key, i2) {
                    var existingValue = existingValues[i2];
                    var ctx = { onerror: null, onsuccess: null };
                    if (req2.type === "delete") {
                      deleting.fire.call(ctx, key, existingValue, dxTrans2);
                    } else if (req2.type === "add" || existingValue === undefined) {
                      var generatedPrimaryKey = creating.fire.call(ctx, key, req2.values[i2], dxTrans2);
                      if (key == null && generatedPrimaryKey != null) {
                        key = generatedPrimaryKey;
                        req2.keys[i2] = key;
                        if (!primaryKey.outbound) {
                          setByKeyPath(req2.values[i2], primaryKey.keyPath, key);
                        }
                      }
                    } else {
                      var objectDiff = getObjectDiff(existingValue, req2.values[i2]);
                      var additionalChanges_1 = updating.fire.call(ctx, objectDiff, key, existingValue, dxTrans2);
                      if (additionalChanges_1) {
                        var requestedValue_1 = req2.values[i2];
                        Object.keys(additionalChanges_1).forEach(function(keyPath) {
                          if (hasOwn(requestedValue_1, keyPath)) {
                            requestedValue_1[keyPath] = additionalChanges_1[keyPath];
                          } else {
                            setByKeyPath(requestedValue_1, keyPath, additionalChanges_1[keyPath]);
                          }
                        });
                      }
                    }
                    return ctx;
                  });
                  return downTable.mutate(req2).then(function(_a3) {
                    var { failures, results, numFailures, lastResult } = _a3;
                    for (var i2 = 0;i2 < keys2.length; ++i2) {
                      var primKey = results ? results[i2] : keys2[i2];
                      var ctx = contexts[i2];
                      if (primKey == null) {
                        ctx.onerror && ctx.onerror(failures[i2]);
                      } else {
                        ctx.onsuccess && ctx.onsuccess(req2.type === "put" && existingValues[i2] ? req2.values[i2] : primKey);
                      }
                    }
                    return { failures, results, numFailures, lastResult };
                  }).catch(function(error) {
                    contexts.forEach(function(ctx) {
                      return ctx.onerror && ctx.onerror(error);
                    });
                    return Promise.reject(error);
                  });
                });
              }
              function deleteRange(req2) {
                return deleteNextChunk(req2.trans, req2.range, 1e4);
              }
              function deleteNextChunk(trans, range, limit2) {
                return downTable.query({ trans, values: false, query: { index: primaryKey, range }, limit: limit2 }).then(function(_a3) {
                  var result = _a3.result;
                  return addPutOrDelete({ type: "delete", keys: result, trans }).then(function(res) {
                    if (res.numFailures > 0)
                      return Promise.reject(res.failures[0]);
                    if (result.length < limit2) {
                      return { failures: [], numFailures: 0, lastResult: undefined };
                    } else {
                      return deleteNextChunk(trans, __assign(__assign({}, range), { lower: result[result.length - 1], lowerOpen: true }), limit2);
                    }
                  });
                });
              }
            } });
            return tableMiddleware;
          } });
        }
      };
      function getExistingValues(table, req, effectiveKeys) {
        return req.type === "add" ? Promise.resolve([]) : table.getMany({ trans: req.trans, keys: effectiveKeys, cache: "immutable" });
      }
      function getFromTransactionCache(keys2, cache2, clone) {
        try {
          if (!cache2)
            return null;
          if (cache2.keys.length < keys2.length)
            return null;
          var result = [];
          for (var i2 = 0, j = 0;i2 < cache2.keys.length && j < keys2.length; ++i2) {
            if (cmp(cache2.keys[i2], keys2[j]) !== 0)
              continue;
            result.push(clone ? deepClone(cache2.values[i2]) : cache2.values[i2]);
            ++j;
          }
          return result.length === keys2.length ? result : null;
        } catch (_a2) {
          return null;
        }
      }
      var cacheExistingValuesMiddleware = {
        stack: "dbcore",
        level: -1,
        create: function(core) {
          return {
            table: function(tableName) {
              var table = core.table(tableName);
              return __assign(__assign({}, table), { getMany: function(req) {
                if (!req.cache) {
                  return table.getMany(req);
                }
                var cachedResult = getFromTransactionCache(req.keys, req.trans["_cache"], req.cache === "clone");
                if (cachedResult) {
                  return DexiePromise.resolve(cachedResult);
                }
                return table.getMany(req).then(function(res) {
                  req.trans["_cache"] = {
                    keys: req.keys,
                    values: req.cache === "clone" ? deepClone(res) : res
                  };
                  return res;
                });
              }, mutate: function(req) {
                if (req.type !== "add")
                  req.trans["_cache"] = null;
                return table.mutate(req);
              } });
            }
          };
        }
      };
      function isCachableContext(ctx, table) {
        return ctx.trans.mode === "readonly" && !!ctx.subscr && !ctx.trans.explicit && ctx.trans.db._options.cache !== "disabled" && !table.schema.primaryKey.outbound;
      }
      function isCachableRequest(type2, req) {
        switch (type2) {
          case "query":
            return req.values && !req.unique;
          case "get":
            return false;
          case "getMany":
            return false;
          case "count":
            return false;
          case "openCursor":
            return false;
        }
      }
      var observabilityMiddleware = {
        stack: "dbcore",
        level: 0,
        name: "Observability",
        create: function(core) {
          var dbName = core.schema.name;
          var FULL_RANGE = new RangeSet(core.MIN_KEY, core.MAX_KEY);
          return __assign(__assign({}, core), { transaction: function(stores, mode, options) {
            if (PSD.subscr && mode !== "readonly") {
              throw new exceptions.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(PSD.querier));
            }
            return core.transaction(stores, mode, options);
          }, table: function(tableName) {
            var table = core.table(tableName);
            var schema = table.schema;
            var { primaryKey, indexes } = schema;
            var { extractKey, outbound } = primaryKey;
            var indexesWithAutoIncPK = primaryKey.autoIncrement && indexes.filter(function(index) {
              return index.compound && index.keyPath.includes(primaryKey.keyPath);
            });
            var tableClone = __assign(__assign({}, table), { mutate: function(req) {
              var _a2, _b;
              var trans = req.trans;
              var mutatedParts = req.mutatedParts || (req.mutatedParts = {});
              var getRangeSet = function(indexName) {
                var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
                return mutatedParts[part] || (mutatedParts[part] = new RangeSet);
              };
              var pkRangeSet = getRangeSet("");
              var delsRangeSet = getRangeSet(":dels");
              var type2 = req.type;
              var _c = req.type === "deleteRange" ? [req.range] : req.type === "delete" ? [req.keys] : req.values.length < 50 ? [getEffectiveKeys(primaryKey, req).filter(function(id) {
                return id;
              }), req.values] : [], keys2 = _c[0], newObjs = _c[1];
              var oldCache = req.trans["_cache"];
              if (isArray(keys2)) {
                pkRangeSet.addKeys(keys2);
                var oldObjs = type2 === "delete" || keys2.length === newObjs.length ? getFromTransactionCache(keys2, oldCache) : null;
                if (!oldObjs) {
                  delsRangeSet.addKeys(keys2);
                }
                if (oldObjs || newObjs) {
                  trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs);
                }
              } else if (keys2) {
                var range = {
                  from: (_a2 = keys2.lower) !== null && _a2 !== undefined ? _a2 : core.MIN_KEY,
                  to: (_b = keys2.upper) !== null && _b !== undefined ? _b : core.MAX_KEY
                };
                delsRangeSet.add(range);
                pkRangeSet.add(range);
              } else {
                pkRangeSet.add(FULL_RANGE);
                delsRangeSet.add(FULL_RANGE);
                schema.indexes.forEach(function(idx) {
                  return getRangeSet(idx.name).add(FULL_RANGE);
                });
              }
              return table.mutate(req).then(function(res) {
                if (keys2 && (req.type === "add" || req.type === "put")) {
                  pkRangeSet.addKeys(res.results);
                  if (indexesWithAutoIncPK) {
                    indexesWithAutoIncPK.forEach(function(idx) {
                      var idxVals = req.values.map(function(v) {
                        return idx.extractKey(v);
                      });
                      var pkPos = idx.keyPath.findIndex(function(prop) {
                        return prop === primaryKey.keyPath;
                      });
                      for (var i2 = 0, len = res.results.length;i2 < len; ++i2) {
                        idxVals[i2][pkPos] = res.results[i2];
                      }
                      getRangeSet(idx.name).addKeys(idxVals);
                    });
                  }
                }
                trans.mutatedParts = extendObservabilitySet(trans.mutatedParts || {}, mutatedParts);
                return res;
              });
            } });
            var getRange = function(_a2) {
              var _b, _c;
              var _d = _a2.query, index = _d.index, range = _d.range;
              return [
                index,
                new RangeSet((_b = range.lower) !== null && _b !== undefined ? _b : core.MIN_KEY, (_c = range.upper) !== null && _c !== undefined ? _c : core.MAX_KEY)
              ];
            };
            var readSubscribers = {
              get: function(req) {
                return [primaryKey, new RangeSet(req.key)];
              },
              getMany: function(req) {
                return [primaryKey, new RangeSet().addKeys(req.keys)];
              },
              count: getRange,
              query: getRange,
              openCursor: getRange
            };
            keys(readSubscribers).forEach(function(method) {
              tableClone[method] = function(req) {
                var subscr = PSD.subscr;
                var isLiveQuery = !!subscr;
                var cachable = isCachableContext(PSD, table) && isCachableRequest(method, req);
                var obsSet = cachable ? req.obsSet = {} : subscr;
                if (isLiveQuery) {
                  var getRangeSet = function(indexName) {
                    var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
                    return obsSet[part] || (obsSet[part] = new RangeSet);
                  };
                  var pkRangeSet_1 = getRangeSet("");
                  var delsRangeSet_1 = getRangeSet(":dels");
                  var _a2 = readSubscribers[method](req), queriedIndex = _a2[0], queriedRanges = _a2[1];
                  if (method === "query" && queriedIndex.isPrimaryKey && !req.values) {
                    delsRangeSet_1.add(queriedRanges);
                  } else {
                    getRangeSet(queriedIndex.name || "").add(queriedRanges);
                  }
                  if (!queriedIndex.isPrimaryKey) {
                    if (method === "count") {
                      delsRangeSet_1.add(FULL_RANGE);
                    } else {
                      var keysPromise_1 = method === "query" && outbound && req.values && table.query(__assign(__assign({}, req), { values: false }));
                      return table[method].apply(this, arguments).then(function(res) {
                        if (method === "query") {
                          if (outbound && req.values) {
                            return keysPromise_1.then(function(_a3) {
                              var resultingKeys = _a3.result;
                              pkRangeSet_1.addKeys(resultingKeys);
                              return res;
                            });
                          }
                          var pKeys = req.values ? res.result.map(extractKey) : res.result;
                          if (req.values) {
                            pkRangeSet_1.addKeys(pKeys);
                          } else {
                            delsRangeSet_1.addKeys(pKeys);
                          }
                        } else if (method === "openCursor") {
                          var cursor_1 = res;
                          var wantValues_1 = req.values;
                          return cursor_1 && Object.create(cursor_1, {
                            key: {
                              get: function() {
                                delsRangeSet_1.addKey(cursor_1.primaryKey);
                                return cursor_1.key;
                              }
                            },
                            primaryKey: {
                              get: function() {
                                var pkey = cursor_1.primaryKey;
                                delsRangeSet_1.addKey(pkey);
                                return pkey;
                              }
                            },
                            value: {
                              get: function() {
                                wantValues_1 && pkRangeSet_1.addKey(cursor_1.primaryKey);
                                return cursor_1.value;
                              }
                            }
                          });
                        }
                        return res;
                      });
                    }
                  }
                }
                return table[method].apply(this, arguments);
              };
            });
            return tableClone;
          } });
        }
      };
      function trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs) {
        function addAffectedIndex(ix) {
          var rangeSet = getRangeSet(ix.name || "");
          function extractKey(obj) {
            return obj != null ? ix.extractKey(obj) : null;
          }
          var addKeyOrKeys = function(key) {
            return ix.multiEntry && isArray(key) ? key.forEach(function(key2) {
              return rangeSet.addKey(key2);
            }) : rangeSet.addKey(key);
          };
          (oldObjs || newObjs).forEach(function(_, i2) {
            var oldKey = oldObjs && extractKey(oldObjs[i2]);
            var newKey = newObjs && extractKey(newObjs[i2]);
            if (cmp(oldKey, newKey) !== 0) {
              if (oldKey != null)
                addKeyOrKeys(oldKey);
              if (newKey != null)
                addKeyOrKeys(newKey);
            }
          });
        }
        schema.indexes.forEach(addAffectedIndex);
      }
      function adjustOptimisticFromFailures(tblCache, req, res) {
        if (res.numFailures === 0)
          return req;
        if (req.type === "deleteRange") {
          return null;
        }
        var numBulkOps = req.keys ? req.keys.length : ("values" in req) && req.values ? req.values.length : 1;
        if (res.numFailures === numBulkOps) {
          return null;
        }
        var clone = __assign({}, req);
        if (isArray(clone.keys)) {
          clone.keys = clone.keys.filter(function(_, i2) {
            return !(i2 in res.failures);
          });
        }
        if ("values" in clone && isArray(clone.values)) {
          clone.values = clone.values.filter(function(_, i2) {
            return !(i2 in res.failures);
          });
        }
        return clone;
      }
      function isAboveLower(key, range) {
        return range.lower === undefined ? true : range.lowerOpen ? cmp(key, range.lower) > 0 : cmp(key, range.lower) >= 0;
      }
      function isBelowUpper(key, range) {
        return range.upper === undefined ? true : range.upperOpen ? cmp(key, range.upper) < 0 : cmp(key, range.upper) <= 0;
      }
      function isWithinRange(key, range) {
        return isAboveLower(key, range) && isBelowUpper(key, range);
      }
      function applyOptimisticOps(result, req, ops, table, cacheEntry, immutable) {
        if (!ops || ops.length === 0)
          return result;
        var index = req.query.index;
        var multiEntry = index.multiEntry;
        var queryRange = req.query.range;
        var primaryKey = table.schema.primaryKey;
        var extractPrimKey = primaryKey.extractKey;
        var extractIndex = index.extractKey;
        var extractLowLevelIndex = (index.lowLevelIndex || index).extractKey;
        var finalResult = ops.reduce(function(result2, op) {
          var modifedResult = result2;
          var includedValues = [];
          if (op.type === "add" || op.type === "put") {
            var includedPKs = new RangeSet;
            for (var i2 = op.values.length - 1;i2 >= 0; --i2) {
              var value = op.values[i2];
              var pk = extractPrimKey(value);
              if (includedPKs.hasKey(pk))
                continue;
              var key = extractIndex(value);
              if (multiEntry && isArray(key) ? key.some(function(k) {
                return isWithinRange(k, queryRange);
              }) : isWithinRange(key, queryRange)) {
                includedPKs.addKey(pk);
                includedValues.push(value);
              }
            }
          }
          switch (op.type) {
            case "add": {
              var existingKeys_1 = new RangeSet().addKeys(req.values ? result2.map(function(v) {
                return extractPrimKey(v);
              }) : result2);
              modifedResult = result2.concat(req.values ? includedValues.filter(function(v) {
                var key2 = extractPrimKey(v);
                if (existingKeys_1.hasKey(key2))
                  return false;
                existingKeys_1.addKey(key2);
                return true;
              }) : includedValues.map(function(v) {
                return extractPrimKey(v);
              }).filter(function(k) {
                if (existingKeys_1.hasKey(k))
                  return false;
                existingKeys_1.addKey(k);
                return true;
              }));
              break;
            }
            case "put": {
              var keySet_1 = new RangeSet().addKeys(op.values.map(function(v) {
                return extractPrimKey(v);
              }));
              modifedResult = result2.filter(function(item) {
                return !keySet_1.hasKey(req.values ? extractPrimKey(item) : item);
              }).concat(req.values ? includedValues : includedValues.map(function(v) {
                return extractPrimKey(v);
              }));
              break;
            }
            case "delete":
              var keysToDelete_1 = new RangeSet().addKeys(op.keys);
              modifedResult = result2.filter(function(item) {
                return !keysToDelete_1.hasKey(req.values ? extractPrimKey(item) : item);
              });
              break;
            case "deleteRange":
              var range_1 = op.range;
              modifedResult = result2.filter(function(item) {
                return !isWithinRange(extractPrimKey(item), range_1);
              });
              break;
          }
          return modifedResult;
        }, result);
        if (finalResult === result)
          return result;
        finalResult.sort(function(a, b) {
          return cmp(extractLowLevelIndex(a), extractLowLevelIndex(b)) || cmp(extractPrimKey(a), extractPrimKey(b));
        });
        if (req.limit && req.limit < Infinity) {
          if (finalResult.length > req.limit) {
            finalResult.length = req.limit;
          } else if (result.length === req.limit && finalResult.length < req.limit) {
            cacheEntry.dirty = true;
          }
        }
        return immutable ? Object.freeze(finalResult) : finalResult;
      }
      function areRangesEqual(r1, r2) {
        return cmp(r1.lower, r2.lower) === 0 && cmp(r1.upper, r2.upper) === 0 && !!r1.lowerOpen === !!r2.lowerOpen && !!r1.upperOpen === !!r2.upperOpen;
      }
      function compareLowers(lower1, lower2, lowerOpen1, lowerOpen2) {
        if (lower1 === undefined)
          return lower2 !== undefined ? -1 : 0;
        if (lower2 === undefined)
          return 1;
        var c = cmp(lower1, lower2);
        if (c === 0) {
          if (lowerOpen1 && lowerOpen2)
            return 0;
          if (lowerOpen1)
            return 1;
          if (lowerOpen2)
            return -1;
        }
        return c;
      }
      function compareUppers(upper1, upper2, upperOpen1, upperOpen2) {
        if (upper1 === undefined)
          return upper2 !== undefined ? 1 : 0;
        if (upper2 === undefined)
          return -1;
        var c = cmp(upper1, upper2);
        if (c === 0) {
          if (upperOpen1 && upperOpen2)
            return 0;
          if (upperOpen1)
            return -1;
          if (upperOpen2)
            return 1;
        }
        return c;
      }
      function isSuperRange(r1, r2) {
        return compareLowers(r1.lower, r2.lower, r1.lowerOpen, r2.lowerOpen) <= 0 && compareUppers(r1.upper, r2.upper, r1.upperOpen, r2.upperOpen) >= 0;
      }
      function findCompatibleQuery(dbName, tableName, type2, req) {
        var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
        if (!tblCache)
          return [];
        var queries = tblCache.queries[type2];
        if (!queries)
          return [null, false, tblCache, null];
        var indexName = req.query ? req.query.index.name : null;
        var entries = queries[indexName || ""];
        if (!entries)
          return [null, false, tblCache, null];
        switch (type2) {
          case "query":
            var equalEntry = entries.find(function(entry) {
              return entry.req.limit === req.limit && entry.req.values === req.values && areRangesEqual(entry.req.query.range, req.query.range);
            });
            if (equalEntry)
              return [
                equalEntry,
                true,
                tblCache,
                entries
              ];
            var superEntry = entries.find(function(entry) {
              var limit2 = "limit" in entry.req ? entry.req.limit : Infinity;
              return limit2 >= req.limit && (req.values ? entry.req.values : true) && isSuperRange(entry.req.query.range, req.query.range);
            });
            return [superEntry, false, tblCache, entries];
          case "count":
            var countQuery = entries.find(function(entry) {
              return areRangesEqual(entry.req.query.range, req.query.range);
            });
            return [countQuery, !!countQuery, tblCache, entries];
        }
      }
      function subscribeToCacheEntry(cacheEntry, container, requery, signal) {
        cacheEntry.subscribers.add(requery);
        signal.addEventListener("abort", function() {
          cacheEntry.subscribers.delete(requery);
          if (cacheEntry.subscribers.size === 0) {
            enqueForDeletion(cacheEntry, container);
          }
        });
      }
      function enqueForDeletion(cacheEntry, container) {
        setTimeout(function() {
          if (cacheEntry.subscribers.size === 0) {
            delArrayItem(container, cacheEntry);
          }
        }, 3000);
      }
      var cacheMiddleware = {
        stack: "dbcore",
        level: 0,
        name: "Cache",
        create: function(core) {
          var dbName = core.schema.name;
          var coreMW = __assign(__assign({}, core), { transaction: function(stores, mode, options) {
            var idbtrans = core.transaction(stores, mode, options);
            if (mode === "readwrite") {
              var ac_1 = new AbortController;
              var signal = ac_1.signal;
              var endTransaction = function(wasCommitted) {
                return function() {
                  ac_1.abort();
                  if (mode === "readwrite") {
                    var affectedSubscribers_1 = new Set;
                    for (var _i = 0, stores_1 = stores;_i < stores_1.length; _i++) {
                      var storeName = stores_1[_i];
                      var tblCache = cache["idb://".concat(dbName, "/").concat(storeName)];
                      if (tblCache) {
                        var table = core.table(storeName);
                        var ops = tblCache.optimisticOps.filter(function(op) {
                          return op.trans === idbtrans;
                        });
                        if (idbtrans._explicit && wasCommitted && idbtrans.mutatedParts) {
                          for (var _a2 = 0, _b = Object.values(tblCache.queries.query);_a2 < _b.length; _a2++) {
                            var entries = _b[_a2];
                            for (var _c = 0, _d = entries.slice();_c < _d.length; _c++) {
                              var entry = _d[_c];
                              if (obsSetsOverlap(entry.obsSet, idbtrans.mutatedParts)) {
                                delArrayItem(entries, entry);
                                entry.subscribers.forEach(function(requery) {
                                  return affectedSubscribers_1.add(requery);
                                });
                              }
                            }
                          }
                        } else if (ops.length > 0) {
                          tblCache.optimisticOps = tblCache.optimisticOps.filter(function(op) {
                            return op.trans !== idbtrans;
                          });
                          for (var _e = 0, _f = Object.values(tblCache.queries.query);_e < _f.length; _e++) {
                            var entries = _f[_e];
                            for (var _g = 0, _h = entries.slice();_g < _h.length; _g++) {
                              var entry = _h[_g];
                              if (entry.res != null && idbtrans.mutatedParts) {
                                if (wasCommitted && !entry.dirty) {
                                  var freezeResults = Object.isFrozen(entry.res);
                                  var modRes = applyOptimisticOps(entry.res, entry.req, ops, table, entry, freezeResults);
                                  if (entry.dirty) {
                                    delArrayItem(entries, entry);
                                    entry.subscribers.forEach(function(requery) {
                                      return affectedSubscribers_1.add(requery);
                                    });
                                  } else if (modRes !== entry.res) {
                                    entry.res = modRes;
                                    entry.promise = DexiePromise.resolve({ result: modRes });
                                  }
                                } else {
                                  if (entry.dirty) {
                                    delArrayItem(entries, entry);
                                  }
                                  entry.subscribers.forEach(function(requery) {
                                    return affectedSubscribers_1.add(requery);
                                  });
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    affectedSubscribers_1.forEach(function(requery) {
                      return requery();
                    });
                  }
                };
              };
              idbtrans.addEventListener("abort", endTransaction(false), {
                signal
              });
              idbtrans.addEventListener("error", endTransaction(false), {
                signal
              });
              idbtrans.addEventListener("complete", endTransaction(true), {
                signal
              });
            }
            return idbtrans;
          }, table: function(tableName) {
            var downTable = core.table(tableName);
            var primKey = downTable.schema.primaryKey;
            var tableMW = __assign(__assign({}, downTable), { mutate: function(req) {
              var trans = PSD.trans;
              if (primKey.outbound || trans.db._options.cache === "disabled" || trans.explicit || trans.idbtrans.mode !== "readwrite") {
                return downTable.mutate(req);
              }
              var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
              if (!tblCache)
                return downTable.mutate(req);
              var promise = downTable.mutate(req);
              if ((req.type === "add" || req.type === "put") && (req.values.length >= 50 || getEffectiveKeys(primKey, req).some(function(key) {
                return key == null;
              }))) {
                promise.then(function(res) {
                  var reqWithResolvedKeys = __assign(__assign({}, req), { values: req.values.map(function(value, i2) {
                    var _a2;
                    if (res.failures[i2])
                      return value;
                    var valueWithKey = ((_a2 = primKey.keyPath) === null || _a2 === undefined ? undefined : _a2.includes(".")) ? deepClone(value) : __assign({}, value);
                    setByKeyPath(valueWithKey, primKey.keyPath, res.results[i2]);
                    return valueWithKey;
                  }) });
                  var adjustedReq = adjustOptimisticFromFailures(tblCache, reqWithResolvedKeys, res);
                  tblCache.optimisticOps.push(adjustedReq);
                  queueMicrotask(function() {
                    return req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                  });
                });
              } else {
                tblCache.optimisticOps.push(req);
                req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                promise.then(function(res) {
                  if (res.numFailures > 0) {
                    delArrayItem(tblCache.optimisticOps, req);
                    var adjustedReq = adjustOptimisticFromFailures(tblCache, req, res);
                    if (adjustedReq) {
                      tblCache.optimisticOps.push(adjustedReq);
                    }
                    req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                  }
                });
                promise.catch(function() {
                  delArrayItem(tblCache.optimisticOps, req);
                  req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                });
              }
              return promise;
            }, query: function(req) {
              var _a2;
              if (!isCachableContext(PSD, downTable) || !isCachableRequest("query", req))
                return downTable.query(req);
              var freezeResults = ((_a2 = PSD.trans) === null || _a2 === undefined ? undefined : _a2.db._options.cache) === "immutable";
              var _b = PSD, requery = _b.requery, signal = _b.signal;
              var _c = findCompatibleQuery(dbName, tableName, "query", req), cacheEntry = _c[0], exactMatch = _c[1], tblCache = _c[2], container = _c[3];
              if (cacheEntry && exactMatch) {
                cacheEntry.obsSet = req.obsSet;
              } else {
                var promise = downTable.query(req).then(function(res) {
                  var result = res.result;
                  if (cacheEntry)
                    cacheEntry.res = result;
                  if (freezeResults) {
                    for (var i2 = 0, l = result.length;i2 < l; ++i2) {
                      Object.freeze(result[i2]);
                    }
                    Object.freeze(result);
                  } else {
                    res.result = deepClone(result);
                  }
                  return res;
                }).catch(function(error) {
                  if (container && cacheEntry)
                    delArrayItem(container, cacheEntry);
                  return Promise.reject(error);
                });
                cacheEntry = {
                  obsSet: req.obsSet,
                  promise,
                  subscribers: new Set,
                  type: "query",
                  req,
                  dirty: false
                };
                if (container) {
                  container.push(cacheEntry);
                } else {
                  container = [cacheEntry];
                  if (!tblCache) {
                    tblCache = cache["idb://".concat(dbName, "/").concat(tableName)] = {
                      queries: {
                        query: {},
                        count: {}
                      },
                      objs: new Map,
                      optimisticOps: [],
                      unsignaledParts: {}
                    };
                  }
                  tblCache.queries.query[req.query.index.name || ""] = container;
                }
              }
              subscribeToCacheEntry(cacheEntry, container, requery, signal);
              return cacheEntry.promise.then(function(res) {
                return {
                  result: applyOptimisticOps(res.result, req, tblCache === null || tblCache === undefined ? undefined : tblCache.optimisticOps, downTable, cacheEntry, freezeResults)
                };
              });
            } });
            return tableMW;
          } });
          return coreMW;
        }
      };
      function vipify(target, vipDb) {
        return new Proxy(target, {
          get: function(target2, prop, receiver) {
            if (prop === "db")
              return vipDb;
            return Reflect.get(target2, prop, receiver);
          }
        });
      }
      var Dexie$1 = function() {
        function Dexie2(name, options) {
          var _this = this;
          this._middlewares = {};
          this.verno = 0;
          var deps = Dexie2.dependencies;
          this._options = options = __assign({
            addons: Dexie2.addons,
            autoOpen: true,
            indexedDB: deps.indexedDB,
            IDBKeyRange: deps.IDBKeyRange,
            cache: "cloned"
          }, options);
          this._deps = {
            indexedDB: options.indexedDB,
            IDBKeyRange: options.IDBKeyRange
          };
          var addons = options.addons;
          this._dbSchema = {};
          this._versions = [];
          this._storeNames = [];
          this._allTables = {};
          this.idbdb = null;
          this._novip = this;
          var state = {
            dbOpenError: null,
            isBeingOpened: false,
            onReadyBeingFired: null,
            openComplete: false,
            dbReadyResolve: nop,
            dbReadyPromise: null,
            cancelOpen: nop,
            openCanceller: null,
            autoSchema: true,
            PR1398_maxLoop: 3,
            autoOpen: options.autoOpen
          };
          state.dbReadyPromise = new DexiePromise(function(resolve) {
            state.dbReadyResolve = resolve;
          });
          state.openCanceller = new DexiePromise(function(_, reject) {
            state.cancelOpen = reject;
          });
          this._state = state;
          this.name = name;
          this.on = Events(this, "populate", "blocked", "versionchange", "close", { ready: [promisableChain, nop] });
          this.once = function(event, callback) {
            var fn = function() {
              var args = [];
              for (var _i = 0;_i < arguments.length; _i++) {
                args[_i] = arguments[_i];
              }
              _this.on(event).unsubscribe(fn);
              callback.apply(_this, args);
            };
            return _this.on(event, fn);
          };
          this.on.ready.subscribe = override(this.on.ready.subscribe, function(subscribe) {
            return function(subscriber, bSticky) {
              Dexie2.vip(function() {
                var state2 = _this._state;
                if (state2.openComplete) {
                  if (!state2.dbOpenError)
                    DexiePromise.resolve().then(subscriber);
                  if (bSticky)
                    subscribe(subscriber);
                } else if (state2.onReadyBeingFired) {
                  state2.onReadyBeingFired.push(subscriber);
                  if (bSticky)
                    subscribe(subscriber);
                } else {
                  subscribe(subscriber);
                  var db_1 = _this;
                  if (!bSticky)
                    subscribe(function unsubscribe() {
                      db_1.on.ready.unsubscribe(subscriber);
                      db_1.on.ready.unsubscribe(unsubscribe);
                    });
                }
              });
            };
          });
          this.Collection = createCollectionConstructor(this);
          this.Table = createTableConstructor(this);
          this.Transaction = createTransactionConstructor(this);
          this.Version = createVersionConstructor(this);
          this.WhereClause = createWhereClauseConstructor(this);
          this.on("versionchange", function(ev) {
            if (ev.newVersion > 0)
              console.warn("Another connection wants to upgrade database '".concat(_this.name, "'. Closing db now to resume the upgrade."));
            else
              console.warn("Another connection wants to delete database '".concat(_this.name, "'. Closing db now to resume the delete request."));
            _this.close({ disableAutoOpen: false });
          });
          this.on("blocked", function(ev) {
            if (!ev.newVersion || ev.newVersion < ev.oldVersion)
              console.warn("Dexie.delete('".concat(_this.name, "') was blocked"));
            else
              console.warn("Upgrade '".concat(_this.name, "' blocked by other connection holding version ").concat(ev.oldVersion / 10));
          });
          this._maxKey = getMaxKey(options.IDBKeyRange);
          this._createTransaction = function(mode, storeNames, dbschema, parentTransaction) {
            return new _this.Transaction(mode, storeNames, dbschema, _this._options.chromeTransactionDurability, parentTransaction);
          };
          this._fireOnBlocked = function(ev) {
            _this.on("blocked").fire(ev);
            connections.filter(function(c) {
              return c.name === _this.name && c !== _this && !c._state.vcFired;
            }).map(function(c) {
              return c.on("versionchange").fire(ev);
            });
          };
          this.use(cacheExistingValuesMiddleware);
          this.use(cacheMiddleware);
          this.use(observabilityMiddleware);
          this.use(virtualIndexMiddleware);
          this.use(hooksMiddleware);
          var vipDB = new Proxy(this, {
            get: function(_, prop, receiver) {
              if (prop === "_vip")
                return true;
              if (prop === "table")
                return function(tableName) {
                  return vipify(_this.table(tableName), vipDB);
                };
              var rv = Reflect.get(_, prop, receiver);
              if (rv instanceof Table)
                return vipify(rv, vipDB);
              if (prop === "tables")
                return rv.map(function(t) {
                  return vipify(t, vipDB);
                });
              if (prop === "_createTransaction")
                return function() {
                  var tx = rv.apply(this, arguments);
                  return vipify(tx, vipDB);
                };
              return rv;
            }
          });
          this.vip = vipDB;
          addons.forEach(function(addon) {
            return addon(_this);
          });
        }
        Dexie2.prototype.version = function(versionNumber) {
          if (isNaN(versionNumber) || versionNumber < 0.1)
            throw new exceptions.Type("Given version is not a positive number");
          versionNumber = Math.round(versionNumber * 10) / 10;
          if (this.idbdb || this._state.isBeingOpened)
            throw new exceptions.Schema("Cannot add version when database is open");
          this.verno = Math.max(this.verno, versionNumber);
          var versions = this._versions;
          var versionInstance = versions.filter(function(v) {
            return v._cfg.version === versionNumber;
          })[0];
          if (versionInstance)
            return versionInstance;
          versionInstance = new this.Version(versionNumber);
          versions.push(versionInstance);
          versions.sort(lowerVersionFirst);
          versionInstance.stores({});
          this._state.autoSchema = false;
          return versionInstance;
        };
        Dexie2.prototype._whenReady = function(fn) {
          var _this = this;
          return this.idbdb && (this._state.openComplete || PSD.letThrough || this._vip) ? fn() : new DexiePromise(function(resolve, reject) {
            if (_this._state.openComplete) {
              return reject(new exceptions.DatabaseClosed(_this._state.dbOpenError));
            }
            if (!_this._state.isBeingOpened) {
              if (!_this._state.autoOpen) {
                reject(new exceptions.DatabaseClosed);
                return;
              }
              _this.open().catch(nop);
            }
            _this._state.dbReadyPromise.then(resolve, reject);
          }).then(fn);
        };
        Dexie2.prototype.use = function(_a2) {
          var { stack, create, level, name } = _a2;
          if (name)
            this.unuse({ stack, name });
          var middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
          middlewares.push({ stack, create, level: level == null ? 10 : level, name });
          middlewares.sort(function(a, b) {
            return a.level - b.level;
          });
          return this;
        };
        Dexie2.prototype.unuse = function(_a2) {
          var { stack, name, create } = _a2;
          if (stack && this._middlewares[stack]) {
            this._middlewares[stack] = this._middlewares[stack].filter(function(mw) {
              return create ? mw.create !== create : name ? mw.name !== name : false;
            });
          }
          return this;
        };
        Dexie2.prototype.open = function() {
          var _this = this;
          return usePSD(globalPSD, function() {
            return dexieOpen(_this);
          });
        };
        Dexie2.prototype._close = function() {
          this.on.close.fire(new CustomEvent("close"));
          var state = this._state;
          var idx = connections.indexOf(this);
          if (idx >= 0)
            connections.splice(idx, 1);
          if (this.idbdb) {
            try {
              this.idbdb.close();
            } catch (e) {}
            this.idbdb = null;
          }
          if (!state.isBeingOpened) {
            state.dbReadyPromise = new DexiePromise(function(resolve) {
              state.dbReadyResolve = resolve;
            });
            state.openCanceller = new DexiePromise(function(_, reject) {
              state.cancelOpen = reject;
            });
          }
        };
        Dexie2.prototype.close = function(_a2) {
          var _b = _a2 === undefined ? { disableAutoOpen: true } : _a2, disableAutoOpen = _b.disableAutoOpen;
          var state = this._state;
          if (disableAutoOpen) {
            if (state.isBeingOpened) {
              state.cancelOpen(new exceptions.DatabaseClosed);
            }
            this._close();
            state.autoOpen = false;
            state.dbOpenError = new exceptions.DatabaseClosed;
          } else {
            this._close();
            state.autoOpen = this._options.autoOpen || state.isBeingOpened;
            state.openComplete = false;
            state.dbOpenError = null;
          }
        };
        Dexie2.prototype.delete = function(closeOptions) {
          var _this = this;
          if (closeOptions === undefined) {
            closeOptions = { disableAutoOpen: true };
          }
          var hasInvalidArguments = arguments.length > 0 && typeof arguments[0] !== "object";
          var state = this._state;
          return new DexiePromise(function(resolve, reject) {
            var doDelete = function() {
              _this.close(closeOptions);
              var req = _this._deps.indexedDB.deleteDatabase(_this.name);
              req.onsuccess = wrap(function() {
                _onDatabaseDeleted(_this._deps, _this.name);
                resolve();
              });
              req.onerror = eventRejectHandler(reject);
              req.onblocked = _this._fireOnBlocked;
            };
            if (hasInvalidArguments)
              throw new exceptions.InvalidArgument("Invalid closeOptions argument to db.delete()");
            if (state.isBeingOpened) {
              state.dbReadyPromise.then(doDelete);
            } else {
              doDelete();
            }
          });
        };
        Dexie2.prototype.backendDB = function() {
          return this.idbdb;
        };
        Dexie2.prototype.isOpen = function() {
          return this.idbdb !== null;
        };
        Dexie2.prototype.hasBeenClosed = function() {
          var dbOpenError = this._state.dbOpenError;
          return dbOpenError && dbOpenError.name === "DatabaseClosed";
        };
        Dexie2.prototype.hasFailed = function() {
          return this._state.dbOpenError !== null;
        };
        Dexie2.prototype.dynamicallyOpened = function() {
          return this._state.autoSchema;
        };
        Object.defineProperty(Dexie2.prototype, "tables", {
          get: function() {
            var _this = this;
            return keys(this._allTables).map(function(name) {
              return _this._allTables[name];
            });
          },
          enumerable: false,
          configurable: true
        });
        Dexie2.prototype.transaction = function() {
          var args = extractTransactionArgs.apply(this, arguments);
          return this._transaction.apply(this, args);
        };
        Dexie2.prototype._transaction = function(mode, tables, scopeFunc) {
          var _this = this;
          var parentTransaction = PSD.trans;
          if (!parentTransaction || parentTransaction.db !== this || mode.indexOf("!") !== -1)
            parentTransaction = null;
          var onlyIfCompatible = mode.indexOf("?") !== -1;
          mode = mode.replace("!", "").replace("?", "");
          var idbMode, storeNames;
          try {
            storeNames = tables.map(function(table) {
              var storeName = table instanceof _this.Table ? table.name : table;
              if (typeof storeName !== "string")
                throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
              return storeName;
            });
            if (mode == "r" || mode === READONLY)
              idbMode = READONLY;
            else if (mode == "rw" || mode == READWRITE)
              idbMode = READWRITE;
            else
              throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
            if (parentTransaction) {
              if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
                if (onlyIfCompatible) {
                  parentTransaction = null;
                } else
                  throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
              }
              if (parentTransaction) {
                storeNames.forEach(function(storeName) {
                  if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                    if (onlyIfCompatible) {
                      parentTransaction = null;
                    } else
                      throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
                  }
                });
              }
              if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
                parentTransaction = null;
              }
            }
          } catch (e) {
            return parentTransaction ? parentTransaction._promise(null, function(_, reject) {
              reject(e);
            }) : rejection(e);
          }
          var enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
          return parentTransaction ? parentTransaction._promise(idbMode, enterTransaction, "lock") : PSD.trans ? usePSD(PSD.transless, function() {
            return _this._whenReady(enterTransaction);
          }) : this._whenReady(enterTransaction);
        };
        Dexie2.prototype.table = function(tableName) {
          if (!hasOwn(this._allTables, tableName)) {
            throw new exceptions.InvalidTable("Table ".concat(tableName, " does not exist"));
          }
          return this._allTables[tableName];
        };
        return Dexie2;
      }();
      var symbolObservable = typeof Symbol !== "undefined" && "observable" in Symbol ? Symbol.observable : "@@observable";
      var Observable = function() {
        function Observable2(subscribe) {
          this._subscribe = subscribe;
        }
        Observable2.prototype.subscribe = function(x, error, complete) {
          return this._subscribe(!x || typeof x === "function" ? { next: x, error, complete } : x);
        };
        Observable2.prototype[symbolObservable] = function() {
          return this;
        };
        return Observable2;
      }();
      var domDeps;
      try {
        domDeps = {
          indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
          IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
        };
      } catch (e) {
        domDeps = { indexedDB: null, IDBKeyRange: null };
      }
      function liveQuery(querier) {
        var hasValue = false;
        var currentValue;
        var observable = new Observable(function(observer) {
          var scopeFuncIsAsync = isAsyncFunction(querier);
          function execute(ctx) {
            var wasRootExec = beginMicroTickScope();
            try {
              if (scopeFuncIsAsync) {
                incrementExpectedAwaits();
              }
              var rv = newScope(querier, ctx);
              if (scopeFuncIsAsync) {
                rv = rv.finally(decrementExpectedAwaits);
              }
              return rv;
            } finally {
              wasRootExec && endMicroTickScope();
            }
          }
          var closed = false;
          var abortController;
          var accumMuts = {};
          var currentObs = {};
          var subscription = {
            get closed() {
              return closed;
            },
            unsubscribe: function() {
              if (closed)
                return;
              closed = true;
              if (abortController)
                abortController.abort();
              if (startedListening)
                globalEvents.storagemutated.unsubscribe(mutationListener);
            }
          };
          observer.start && observer.start(subscription);
          var startedListening = false;
          var doQuery = function() {
            return execInGlobalContext(_doQuery);
          };
          function shouldNotify() {
            return obsSetsOverlap(currentObs, accumMuts);
          }
          var mutationListener = function(parts) {
            extendObservabilitySet(accumMuts, parts);
            if (shouldNotify()) {
              doQuery();
            }
          };
          var _doQuery = function() {
            if (closed || !domDeps.indexedDB) {
              return;
            }
            accumMuts = {};
            var subscr = {};
            if (abortController)
              abortController.abort();
            abortController = new AbortController;
            var ctx = {
              subscr,
              signal: abortController.signal,
              requery: doQuery,
              querier,
              trans: null
            };
            var ret = execute(ctx);
            Promise.resolve(ret).then(function(result) {
              hasValue = true;
              currentValue = result;
              if (closed || ctx.signal.aborted) {
                return;
              }
              accumMuts = {};
              currentObs = subscr;
              if (!objectIsEmpty(currentObs) && !startedListening) {
                globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, mutationListener);
                startedListening = true;
              }
              execInGlobalContext(function() {
                return !closed && observer.next && observer.next(result);
              });
            }, function(err) {
              hasValue = false;
              if (!["DatabaseClosedError", "AbortError"].includes(err === null || err === undefined ? undefined : err.name)) {
                if (!closed)
                  execInGlobalContext(function() {
                    if (closed)
                      return;
                    observer.error && observer.error(err);
                  });
              }
            });
          };
          setTimeout(doQuery, 0);
          return subscription;
        });
        observable.hasValue = function() {
          return hasValue;
        };
        observable.getValue = function() {
          return currentValue;
        };
        return observable;
      }
      var Dexie = Dexie$1;
      props(Dexie, __assign(__assign({}, fullNameExceptions), {
        delete: function(databaseName) {
          var db = new Dexie(databaseName, { addons: [] });
          return db.delete();
        },
        exists: function(name) {
          return new Dexie(name, { addons: [] }).open().then(function(db) {
            db.close();
            return true;
          }).catch("NoSuchDatabaseError", function() {
            return false;
          });
        },
        getDatabaseNames: function(cb) {
          try {
            return getDatabaseNames(Dexie.dependencies).then(cb);
          } catch (_a2) {
            return rejection(new exceptions.MissingAPI);
          }
        },
        defineClass: function() {
          function Class(content) {
            extend(this, content);
          }
          return Class;
        },
        ignoreTransaction: function(scopeFunc) {
          return PSD.trans ? usePSD(PSD.transless, scopeFunc) : scopeFunc();
        },
        vip,
        async: function(generatorFn) {
          return function() {
            try {
              var rv = awaitIterator(generatorFn.apply(this, arguments));
              if (!rv || typeof rv.then !== "function")
                return DexiePromise.resolve(rv);
              return rv;
            } catch (e) {
              return rejection(e);
            }
          };
        },
        spawn: function(generatorFn, args, thiz) {
          try {
            var rv = awaitIterator(generatorFn.apply(thiz, args || []));
            if (!rv || typeof rv.then !== "function")
              return DexiePromise.resolve(rv);
            return rv;
          } catch (e) {
            return rejection(e);
          }
        },
        currentTransaction: {
          get: function() {
            return PSD.trans || null;
          }
        },
        waitFor: function(promiseOrFunction, optionalTimeout) {
          var promise = DexiePromise.resolve(typeof promiseOrFunction === "function" ? Dexie.ignoreTransaction(promiseOrFunction) : promiseOrFunction).timeout(optionalTimeout || 60000);
          return PSD.trans ? PSD.trans.waitFor(promise) : promise;
        },
        Promise: DexiePromise,
        debug: {
          get: function() {
            return debug;
          },
          set: function(value) {
            setDebug(value);
          }
        },
        derive,
        extend,
        props,
        override,
        Events,
        on: globalEvents,
        liveQuery,
        extendObservabilitySet,
        getByKeyPath,
        setByKeyPath,
        delByKeyPath,
        shallowClone,
        deepClone,
        getObjectDiff,
        cmp,
        asap: asap$1,
        minKey,
        addons: [],
        connections,
        errnames,
        dependencies: domDeps,
        cache,
        semVer: DEXIE_VERSION,
        version: DEXIE_VERSION.split(".").map(function(n) {
          return parseInt(n);
        }).reduce(function(p, c, i2) {
          return p + c / Math.pow(10, i2 * 2);
        })
      }));
      Dexie.maxKey = getMaxKey(Dexie.dependencies.IDBKeyRange);
      if (typeof dispatchEvent !== "undefined" && typeof addEventListener !== "undefined") {
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function(updatedParts) {
          if (!propagatingLocally) {
            var event_1;
            event_1 = new CustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, {
              detail: updatedParts
            });
            propagatingLocally = true;
            dispatchEvent(event_1);
            propagatingLocally = false;
          }
        });
        addEventListener(STORAGE_MUTATED_DOM_EVENT_NAME, function(_a2) {
          var detail = _a2.detail;
          if (!propagatingLocally) {
            propagateLocally(detail);
          }
        });
      }
      function propagateLocally(updateParts) {
        var wasMe = propagatingLocally;
        try {
          propagatingLocally = true;
          globalEvents.storagemutated.fire(updateParts);
          signalSubscribersNow(updateParts, true);
        } finally {
          propagatingLocally = wasMe;
        }
      }
      var propagatingLocally = false;
      var bc;
      var createBC = function() {};
      if (typeof BroadcastChannel !== "undefined") {
        createBC = function() {
          bc = new BroadcastChannel(STORAGE_MUTATED_DOM_EVENT_NAME);
          bc.onmessage = function(ev) {
            return ev.data && propagateLocally(ev.data);
          };
        };
        createBC();
        if (typeof bc.unref === "function") {
          bc.unref();
        }
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function(changedParts) {
          if (!propagatingLocally) {
            bc.postMessage(changedParts);
          }
        });
      }
      if (typeof addEventListener !== "undefined") {
        addEventListener("pagehide", function(event) {
          if (!Dexie$1.disableBfCache && event.persisted) {
            if (debug)
              console.debug("Dexie: handling persisted pagehide");
            bc === null || bc === undefined || bc.close();
            for (var _i = 0, connections_1 = connections;_i < connections_1.length; _i++) {
              var db = connections_1[_i];
              db.close({ disableAutoOpen: false });
            }
          }
        });
        addEventListener("pageshow", function(event) {
          if (!Dexie$1.disableBfCache && event.persisted) {
            if (debug)
              console.debug("Dexie: handling persisted pageshow");
            createBC();
            propagateLocally({ all: new RangeSet(-Infinity, [[]]) });
          }
        });
      }
      function add(value) {
        return new PropModification({ add: value });
      }
      function remove(value) {
        return new PropModification({ remove: value });
      }
      function replacePrefix(a, b) {
        return new PropModification({ replacePrefix: [a, b] });
      }
      DexiePromise.rejectionMapper = mapError;
      setDebug(debug);
      var namedExports = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        Dexie: Dexie$1,
        liveQuery,
        Entity,
        cmp,
        PropModification,
        replacePrefix,
        add,
        remove,
        default: Dexie$1,
        RangeSet,
        mergeRanges,
        rangesOverlap
      });
      __assign(Dexie$1, namedExports, { default: Dexie$1 });
      return Dexie$1;
    });
  });

  // src/engine/index.ts
  var exports_engine = {};
  __export(exports_engine, {
    waitForKeysReady: () => waitForKeysReady
  });

  // ../../node_modules/@noble/curves/node_modules/@noble/hashes/esm/_assert.js
  function number(n) {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error(`Wrong positive integer: ${n}`);
  }
  function bytes(b, ...lengths) {
    if (!(b instanceof Uint8Array))
      throw new Error("Expected Uint8Array");
    if (lengths.length > 0 && !lengths.includes(b.length))
      throw new Error(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
  }
  function hash(hash2) {
    if (typeof hash2 !== "function" || typeof hash2.create !== "function")
      throw new Error("Hash should be wrapped by utils.wrapConstructor");
    number(hash2.outputLen);
    number(hash2.blockLen);
  }
  function exists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function output(out, instance) {
    bytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error(`digestInto() expects output buffer of length at least ${min}`);
    }
  }

  // ../../node_modules/@noble/curves/node_modules/@noble/hashes/esm/crypto.js
  var crypto2 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : undefined;

  // ../../node_modules/@noble/curves/node_modules/@noble/hashes/esm/utils.js
  /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  var u8a = (a) => a instanceof Uint8Array;
  var createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  var rotr = (word, shift) => word << 32 - shift | word >>> shift;
  var isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
  if (!isLE)
    throw new Error("Non little-endian hardware is not supported");
  function utf8ToBytes(str) {
    if (typeof str !== "string")
      throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
    return new Uint8Array(new TextEncoder().encode(str));
  }
  function toBytes(data) {
    if (typeof data === "string")
      data = utf8ToBytes(data);
    if (!u8a(data))
      throw new Error(`expected Uint8Array, got ${typeof data}`);
    return data;
  }
  function concatBytes(...arrays) {
    const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
    let pad = 0;
    arrays.forEach((a) => {
      if (!u8a(a))
        throw new Error("Uint8Array expected");
      r.set(a, pad);
      pad += a.length;
    });
    return r;
  }

  class Hash {
    clone() {
      return this._cloneInto();
    }
  }
  var toStr = {}.toString;
  function wrapConstructor(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
  }
  function randomBytes(bytesLength = 32) {
    if (crypto2 && typeof crypto2.getRandomValues === "function") {
      return crypto2.getRandomValues(new Uint8Array(bytesLength));
    }
    throw new Error("crypto.getRandomValues must be defined");
  }

  // ../../node_modules/@noble/curves/node_modules/@noble/hashes/esm/_sha2.js
  function setBigUint64(view, byteOffset, value, isLE2) {
    if (typeof view.setBigUint64 === "function")
      return view.setBigUint64(byteOffset, value, isLE2);
    const _32n = BigInt(32);
    const _u32_max = BigInt(4294967295);
    const wh = Number(value >> _32n & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE2 ? 4 : 0;
    const l = isLE2 ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE2);
    view.setUint32(byteOffset + l, wl, isLE2);
  }

  class SHA2 extends Hash {
    constructor(blockLen, outputLen, padOffset, isLE2) {
      super();
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE2;
      this.finished = false;
      this.length = 0;
      this.pos = 0;
      this.destroyed = false;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView(this.buffer);
    }
    update(data) {
      exists(this);
      const { view, buffer, blockLen } = this;
      data = toBytes(data);
      const len = data.length;
      for (let pos = 0;pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView(data);
          for (;blockLen <= len - pos; pos += blockLen)
            this.process(dataView, pos);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
        }
      }
      this.length += data.length;
      this.roundClean();
      return this;
    }
    digestInto(out) {
      exists(this);
      output(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE: isLE2 } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      this.buffer.subarray(pos).fill(0);
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i = pos;i < blockLen; i++)
        buffer[i] = 0;
      setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
      this.process(view, 0);
      const oview = createView(out);
      const len = this.outputLen;
      if (len % 4)
        throw new Error("_sha2: outputLen should be aligned to 32bit");
      const outLen = len / 4;
      const state = this.get();
      if (outLen > state.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let i = 0;i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE2);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      to || (to = new this.constructor);
      to.set(...this.get());
      const { blockLen, buffer, length, finished, destroyed, pos } = this;
      to.length = length;
      to.pos = pos;
      to.finished = finished;
      to.destroyed = destroyed;
      if (length % blockLen)
        to.buffer.set(buffer);
      return to;
    }
  }

  // ../../node_modules/@noble/curves/node_modules/@noble/hashes/esm/sha256.js
  var Chi = (a, b, c) => a & b ^ ~a & c;
  var Maj = (a, b, c) => a & b ^ a & c ^ b & c;
  var SHA256_K = /* @__PURE__ */ new Uint32Array([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  var IV = /* @__PURE__ */ new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  var SHA256_W = /* @__PURE__ */ new Uint32Array(64);

  class SHA256 extends SHA2 {
    constructor() {
      super(64, 32, 8, false);
      this.A = IV[0] | 0;
      this.B = IV[1] | 0;
      this.C = IV[2] | 0;
      this.D = IV[3] | 0;
      this.E = IV[4] | 0;
      this.F = IV[5] | 0;
      this.G = IV[6] | 0;
      this.H = IV[7] | 0;
    }
    get() {
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    set(A, B, C, D, E, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    process(view, offset) {
      for (let i = 0;i < 16; i++, offset += 4)
        SHA256_W[i] = view.getUint32(offset, false);
      for (let i = 16;i < 64; i++) {
        const W15 = SHA256_W[i - 15];
        const W2 = SHA256_W[i - 2];
        const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
        const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
        SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0;i < 64; i++) {
        const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
        const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
        const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
        const T2 = sigma0 + Maj(A, B, C) | 0;
        H = G;
        G = F;
        F = E;
        E = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E = E + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
      SHA256_W.fill(0);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      this.buffer.fill(0);
    }
  }
  var sha256 = /* @__PURE__ */ wrapConstructor(() => new SHA256);

  // ../../node_modules/@noble/curves/esm/abstract/utils.js
  var exports_utils = {};
  __export(exports_utils, {
    validateObject: () => validateObject,
    utf8ToBytes: () => utf8ToBytes2,
    numberToVarBytesBE: () => numberToVarBytesBE,
    numberToHexUnpadded: () => numberToHexUnpadded,
    numberToBytesLE: () => numberToBytesLE,
    numberToBytesBE: () => numberToBytesBE,
    hexToNumber: () => hexToNumber,
    hexToBytes: () => hexToBytes,
    equalBytes: () => equalBytes,
    ensureBytes: () => ensureBytes,
    createHmacDrbg: () => createHmacDrbg,
    concatBytes: () => concatBytes2,
    bytesToNumberLE: () => bytesToNumberLE,
    bytesToNumberBE: () => bytesToNumberBE,
    bytesToHex: () => bytesToHex,
    bitSet: () => bitSet,
    bitMask: () => bitMask,
    bitLen: () => bitLen,
    bitGet: () => bitGet
  });
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  var _0n = BigInt(0);
  var _1n = BigInt(1);
  var _2n = BigInt(2);
  var u8a2 = (a) => a instanceof Uint8Array;
  var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  function bytesToHex(bytes2) {
    if (!u8a2(bytes2))
      throw new Error("Uint8Array expected");
    let hex = "";
    for (let i = 0;i < bytes2.length; i++) {
      hex += hexes[bytes2[i]];
    }
    return hex;
  }
  function numberToHexUnpadded(num) {
    const hex = num.toString(16);
    return hex.length & 1 ? `0${hex}` : hex;
  }
  function hexToNumber(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    return BigInt(hex === "" ? "0" : `0x${hex}`);
  }
  function hexToBytes(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    const len = hex.length;
    if (len % 2)
      throw new Error("padded hex string expected, got unpadded hex of length " + len);
    const array = new Uint8Array(len / 2);
    for (let i = 0;i < array.length; i++) {
      const j = i * 2;
      const hexByte = hex.slice(j, j + 2);
      const byte = Number.parseInt(hexByte, 16);
      if (Number.isNaN(byte) || byte < 0)
        throw new Error("Invalid byte sequence");
      array[i] = byte;
    }
    return array;
  }
  function bytesToNumberBE(bytes2) {
    return hexToNumber(bytesToHex(bytes2));
  }
  function bytesToNumberLE(bytes2) {
    if (!u8a2(bytes2))
      throw new Error("Uint8Array expected");
    return hexToNumber(bytesToHex(Uint8Array.from(bytes2).reverse()));
  }
  function numberToBytesBE(n, len) {
    return hexToBytes(n.toString(16).padStart(len * 2, "0"));
  }
  function numberToBytesLE(n, len) {
    return numberToBytesBE(n, len).reverse();
  }
  function numberToVarBytesBE(n) {
    return hexToBytes(numberToHexUnpadded(n));
  }
  function ensureBytes(title, hex, expectedLength) {
    let res;
    if (typeof hex === "string") {
      try {
        res = hexToBytes(hex);
      } catch (e) {
        throw new Error(`${title} must be valid hex string, got "${hex}". Cause: ${e}`);
      }
    } else if (u8a2(hex)) {
      res = Uint8Array.from(hex);
    } else {
      throw new Error(`${title} must be hex string or Uint8Array`);
    }
    const len = res.length;
    if (typeof expectedLength === "number" && len !== expectedLength)
      throw new Error(`${title} expected ${expectedLength} bytes, got ${len}`);
    return res;
  }
  function concatBytes2(...arrays) {
    const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
    let pad = 0;
    arrays.forEach((a) => {
      if (!u8a2(a))
        throw new Error("Uint8Array expected");
      r.set(a, pad);
      pad += a.length;
    });
    return r;
  }
  function equalBytes(b1, b2) {
    if (b1.length !== b2.length)
      return false;
    for (let i = 0;i < b1.length; i++)
      if (b1[i] !== b2[i])
        return false;
    return true;
  }
  function utf8ToBytes2(str) {
    if (typeof str !== "string")
      throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
    return new Uint8Array(new TextEncoder().encode(str));
  }
  function bitLen(n) {
    let len;
    for (len = 0;n > _0n; n >>= _1n, len += 1)
      ;
    return len;
  }
  function bitGet(n, pos) {
    return n >> BigInt(pos) & _1n;
  }
  var bitSet = (n, pos, value) => {
    return n | (value ? _1n : _0n) << BigInt(pos);
  };
  var bitMask = (n) => (_2n << BigInt(n - 1)) - _1n;
  var u8n = (data) => new Uint8Array(data);
  var u8fr = (arr) => Uint8Array.from(arr);
  function createHmacDrbg(hashLen, qByteLen, hmacFn) {
    if (typeof hashLen !== "number" || hashLen < 2)
      throw new Error("hashLen must be a number");
    if (typeof qByteLen !== "number" || qByteLen < 2)
      throw new Error("qByteLen must be a number");
    if (typeof hmacFn !== "function")
      throw new Error("hmacFn must be a function");
    let v = u8n(hashLen);
    let k = u8n(hashLen);
    let i = 0;
    const reset = () => {
      v.fill(1);
      k.fill(0);
      i = 0;
    };
    const h = (...b) => hmacFn(k, v, ...b);
    const reseed = (seed = u8n()) => {
      k = h(u8fr([0]), seed);
      v = h();
      if (seed.length === 0)
        return;
      k = h(u8fr([1]), seed);
      v = h();
    };
    const gen = () => {
      if (i++ >= 1000)
        throw new Error("drbg: tried 1000 values");
      let len = 0;
      const out = [];
      while (len < qByteLen) {
        v = h();
        const sl = v.slice();
        out.push(sl);
        len += v.length;
      }
      return concatBytes2(...out);
    };
    const genUntil = (seed, pred) => {
      reset();
      reseed(seed);
      let res = undefined;
      while (!(res = pred(gen())))
        reseed();
      reset();
      return res;
    };
    return genUntil;
  }
  var validatorFns = {
    bigint: (val) => typeof val === "bigint",
    function: (val) => typeof val === "function",
    boolean: (val) => typeof val === "boolean",
    string: (val) => typeof val === "string",
    stringOrUint8Array: (val) => typeof val === "string" || val instanceof Uint8Array,
    isSafeInteger: (val) => Number.isSafeInteger(val),
    array: (val) => Array.isArray(val),
    field: (val, object) => object.Fp.isValid(val),
    hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
  };
  function validateObject(object, validators, optValidators = {}) {
    const checkField = (fieldName, type, isOptional) => {
      const checkVal = validatorFns[type];
      if (typeof checkVal !== "function")
        throw new Error(`Invalid validator "${type}", expected function`);
      const val = object[fieldName];
      if (isOptional && val === undefined)
        return;
      if (!checkVal(val, object)) {
        throw new Error(`Invalid param ${String(fieldName)}=${val} (${typeof val}), expected ${type}`);
      }
    };
    for (const [fieldName, type] of Object.entries(validators))
      checkField(fieldName, type, false);
    for (const [fieldName, type] of Object.entries(optValidators))
      checkField(fieldName, type, true);
    return object;
  }

  // ../../node_modules/@noble/curves/esm/abstract/modular.js
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  var _0n2 = BigInt(0);
  var _1n2 = BigInt(1);
  var _2n2 = BigInt(2);
  var _3n = BigInt(3);
  var _4n = BigInt(4);
  var _5n = BigInt(5);
  var _8n = BigInt(8);
  var _9n = BigInt(9);
  var _16n = BigInt(16);
  function mod(a, b) {
    const result = a % b;
    return result >= _0n2 ? result : b + result;
  }
  function pow(num, power, modulo) {
    if (modulo <= _0n2 || power < _0n2)
      throw new Error("Expected power/modulo > 0");
    if (modulo === _1n2)
      return _0n2;
    let res = _1n2;
    while (power > _0n2) {
      if (power & _1n2)
        res = res * num % modulo;
      num = num * num % modulo;
      power >>= _1n2;
    }
    return res;
  }
  function pow2(x, power, modulo) {
    let res = x;
    while (power-- > _0n2) {
      res *= res;
      res %= modulo;
    }
    return res;
  }
  function invert(number2, modulo) {
    if (number2 === _0n2 || modulo <= _0n2) {
      throw new Error(`invert: expected positive integers, got n=${number2} mod=${modulo}`);
    }
    let a = mod(number2, modulo);
    let b = modulo;
    let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
    while (a !== _0n2) {
      const q = b / a;
      const r = b % a;
      const m = x - u * q;
      const n = y - v * q;
      b = a, a = r, x = u, y = v, u = m, v = n;
    }
    const gcd = b;
    if (gcd !== _1n2)
      throw new Error("invert: does not exist");
    return mod(x, modulo);
  }
  function tonelliShanks(P) {
    const legendreC = (P - _1n2) / _2n2;
    let Q, S, Z;
    for (Q = P - _1n2, S = 0;Q % _2n2 === _0n2; Q /= _2n2, S++)
      ;
    for (Z = _2n2;Z < P && pow(Z, legendreC, P) !== P - _1n2; Z++)
      ;
    if (S === 1) {
      const p1div4 = (P + _1n2) / _4n;
      return function tonelliFast(Fp, n) {
        const root = Fp.pow(n, p1div4);
        if (!Fp.eql(Fp.sqr(root), n))
          throw new Error("Cannot find square root");
        return root;
      };
    }
    const Q1div2 = (Q + _1n2) / _2n2;
    return function tonelliSlow(Fp, n) {
      if (Fp.pow(n, legendreC) === Fp.neg(Fp.ONE))
        throw new Error("Cannot find square root");
      let r = S;
      let g = Fp.pow(Fp.mul(Fp.ONE, Z), Q);
      let x = Fp.pow(n, Q1div2);
      let b = Fp.pow(n, Q);
      while (!Fp.eql(b, Fp.ONE)) {
        if (Fp.eql(b, Fp.ZERO))
          return Fp.ZERO;
        let m = 1;
        for (let t2 = Fp.sqr(b);m < r; m++) {
          if (Fp.eql(t2, Fp.ONE))
            break;
          t2 = Fp.sqr(t2);
        }
        const ge = Fp.pow(g, _1n2 << BigInt(r - m - 1));
        g = Fp.sqr(ge);
        x = Fp.mul(x, ge);
        b = Fp.mul(b, g);
        r = m;
      }
      return x;
    };
  }
  function FpSqrt(P) {
    if (P % _4n === _3n) {
      const p1div4 = (P + _1n2) / _4n;
      return function sqrt3mod4(Fp, n) {
        const root = Fp.pow(n, p1div4);
        if (!Fp.eql(Fp.sqr(root), n))
          throw new Error("Cannot find square root");
        return root;
      };
    }
    if (P % _8n === _5n) {
      const c1 = (P - _5n) / _8n;
      return function sqrt5mod8(Fp, n) {
        const n2 = Fp.mul(n, _2n2);
        const v = Fp.pow(n2, c1);
        const nv = Fp.mul(n, v);
        const i = Fp.mul(Fp.mul(nv, _2n2), v);
        const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
        if (!Fp.eql(Fp.sqr(root), n))
          throw new Error("Cannot find square root");
        return root;
      };
    }
    if (P % _16n === _9n) {}
    return tonelliShanks(P);
  }
  var FIELD_FIELDS = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN"
  ];
  function validateField(field) {
    const initial = {
      ORDER: "bigint",
      MASK: "bigint",
      BYTES: "isSafeInteger",
      BITS: "isSafeInteger"
    };
    const opts = FIELD_FIELDS.reduce((map, val) => {
      map[val] = "function";
      return map;
    }, initial);
    return validateObject(field, opts);
  }
  function FpPow(f, num, power) {
    if (power < _0n2)
      throw new Error("Expected power > 0");
    if (power === _0n2)
      return f.ONE;
    if (power === _1n2)
      return num;
    let p = f.ONE;
    let d = num;
    while (power > _0n2) {
      if (power & _1n2)
        p = f.mul(p, d);
      d = f.sqr(d);
      power >>= _1n2;
    }
    return p;
  }
  function FpInvertBatch(f, nums) {
    const tmp = new Array(nums.length);
    const lastMultiplied = nums.reduce((acc, num, i) => {
      if (f.is0(num))
        return acc;
      tmp[i] = acc;
      return f.mul(acc, num);
    }, f.ONE);
    const inverted = f.inv(lastMultiplied);
    nums.reduceRight((acc, num, i) => {
      if (f.is0(num))
        return acc;
      tmp[i] = f.mul(acc, tmp[i]);
      return f.mul(acc, num);
    }, inverted);
    return tmp;
  }
  function nLength(n, nBitLength) {
    const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length;
    const nByteLength = Math.ceil(_nBitLength / 8);
    return { nBitLength: _nBitLength, nByteLength };
  }
  function Field(ORDER, bitLen2, isLE2 = false, redef = {}) {
    if (ORDER <= _0n2)
      throw new Error(`Expected Field ORDER > 0, got ${ORDER}`);
    const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen2);
    if (BYTES > 2048)
      throw new Error("Field lengths over 2048 bytes are not supported");
    const sqrtP = FpSqrt(ORDER);
    const f = Object.freeze({
      ORDER,
      BITS,
      BYTES,
      MASK: bitMask(BITS),
      ZERO: _0n2,
      ONE: _1n2,
      create: (num) => mod(num, ORDER),
      isValid: (num) => {
        if (typeof num !== "bigint")
          throw new Error(`Invalid field element: expected bigint, got ${typeof num}`);
        return _0n2 <= num && num < ORDER;
      },
      is0: (num) => num === _0n2,
      isOdd: (num) => (num & _1n2) === _1n2,
      neg: (num) => mod(-num, ORDER),
      eql: (lhs, rhs) => lhs === rhs,
      sqr: (num) => mod(num * num, ORDER),
      add: (lhs, rhs) => mod(lhs + rhs, ORDER),
      sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
      mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
      pow: (num, power) => FpPow(f, num, power),
      div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
      sqrN: (num) => num * num,
      addN: (lhs, rhs) => lhs + rhs,
      subN: (lhs, rhs) => lhs - rhs,
      mulN: (lhs, rhs) => lhs * rhs,
      inv: (num) => invert(num, ORDER),
      sqrt: redef.sqrt || ((n) => sqrtP(f, n)),
      invertBatch: (lst) => FpInvertBatch(f, lst),
      cmov: (a, b, c) => c ? b : a,
      toBytes: (num) => isLE2 ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES),
      fromBytes: (bytes2) => {
        if (bytes2.length !== BYTES)
          throw new Error(`Fp.fromBytes: expected ${BYTES}, got ${bytes2.length}`);
        return isLE2 ? bytesToNumberLE(bytes2) : bytesToNumberBE(bytes2);
      }
    });
    return Object.freeze(f);
  }
  function getFieldBytesLength(fieldOrder) {
    if (typeof fieldOrder !== "bigint")
      throw new Error("field order must be bigint");
    const bitLength = fieldOrder.toString(2).length;
    return Math.ceil(bitLength / 8);
  }
  function getMinHashLength(fieldOrder) {
    const length = getFieldBytesLength(fieldOrder);
    return length + Math.ceil(length / 2);
  }
  function mapHashToField(key, fieldOrder, isLE2 = false) {
    const len = key.length;
    const fieldLen = getFieldBytesLength(fieldOrder);
    const minLen = getMinHashLength(fieldOrder);
    if (len < 16 || len < minLen || len > 1024)
      throw new Error(`expected ${minLen}-1024 bytes of input, got ${len}`);
    const num = isLE2 ? bytesToNumberBE(key) : bytesToNumberLE(key);
    const reduced = mod(num, fieldOrder - _1n2) + _1n2;
    return isLE2 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
  }

  // ../../node_modules/@noble/curves/esm/abstract/curve.js
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  var _0n3 = BigInt(0);
  var _1n3 = BigInt(1);
  function wNAF(c, bits) {
    const constTimeNegate = (condition, item) => {
      const neg = item.negate();
      return condition ? neg : item;
    };
    const opts = (W) => {
      const windows = Math.ceil(bits / W) + 1;
      const windowSize = 2 ** (W - 1);
      return { windows, windowSize };
    };
    return {
      constTimeNegate,
      unsafeLadder(elm, n) {
        let p = c.ZERO;
        let d = elm;
        while (n > _0n3) {
          if (n & _1n3)
            p = p.add(d);
          d = d.double();
          n >>= _1n3;
        }
        return p;
      },
      precomputeWindow(elm, W) {
        const { windows, windowSize } = opts(W);
        const points = [];
        let p = elm;
        let base = p;
        for (let window2 = 0;window2 < windows; window2++) {
          base = p;
          points.push(base);
          for (let i = 1;i < windowSize; i++) {
            base = base.add(p);
            points.push(base);
          }
          p = base.double();
        }
        return points;
      },
      wNAF(W, precomputes, n) {
        const { windows, windowSize } = opts(W);
        let p = c.ZERO;
        let f = c.BASE;
        const mask = BigInt(2 ** W - 1);
        const maxNumber = 2 ** W;
        const shiftBy = BigInt(W);
        for (let window2 = 0;window2 < windows; window2++) {
          const offset = window2 * windowSize;
          let wbits = Number(n & mask);
          n >>= shiftBy;
          if (wbits > windowSize) {
            wbits -= maxNumber;
            n += _1n3;
          }
          const offset1 = offset;
          const offset2 = offset + Math.abs(wbits) - 1;
          const cond1 = window2 % 2 !== 0;
          const cond2 = wbits < 0;
          if (wbits === 0) {
            f = f.add(constTimeNegate(cond1, precomputes[offset1]));
          } else {
            p = p.add(constTimeNegate(cond2, precomputes[offset2]));
          }
        }
        return { p, f };
      },
      wNAFCached(P, precomputesMap, n, transform) {
        const W = P._WINDOW_SIZE || 1;
        let comp = precomputesMap.get(P);
        if (!comp) {
          comp = this.precomputeWindow(P, W);
          if (W !== 1) {
            precomputesMap.set(P, transform(comp));
          }
        }
        return this.wNAF(W, comp, n);
      }
    };
  }
  function validateBasic(curve) {
    validateField(curve.Fp);
    validateObject(curve, {
      n: "bigint",
      h: "bigint",
      Gx: "field",
      Gy: "field"
    }, {
      nBitLength: "isSafeInteger",
      nByteLength: "isSafeInteger"
    });
    return Object.freeze({
      ...nLength(curve.n, curve.nBitLength),
      ...curve,
      ...{ p: curve.Fp.ORDER }
    });
  }

  // ../../node_modules/@noble/curves/esm/abstract/weierstrass.js
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  function validatePointOpts(curve) {
    const opts = validateBasic(curve);
    validateObject(opts, {
      a: "field",
      b: "field"
    }, {
      allowedPrivateKeyLengths: "array",
      wrapPrivateKey: "boolean",
      isTorsionFree: "function",
      clearCofactor: "function",
      allowInfinityPoint: "boolean",
      fromBytes: "function",
      toBytes: "function"
    });
    const { endo, Fp, a } = opts;
    if (endo) {
      if (!Fp.eql(a, Fp.ZERO)) {
        throw new Error("Endomorphism can only be defined for Koblitz curves that have a=0");
      }
      if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") {
        throw new Error("Expected endomorphism with beta: bigint and splitScalar: function");
      }
    }
    return Object.freeze({ ...opts });
  }
  var { bytesToNumberBE: b2n, hexToBytes: h2b } = exports_utils;
  var DER = {
    Err: class DERErr extends Error {
      constructor(m = "") {
        super(m);
      }
    },
    _parseInt(data) {
      const { Err: E } = DER;
      if (data.length < 2 || data[0] !== 2)
        throw new E("Invalid signature integer tag");
      const len = data[1];
      const res = data.subarray(2, len + 2);
      if (!len || res.length !== len)
        throw new E("Invalid signature integer: wrong length");
      if (res[0] & 128)
        throw new E("Invalid signature integer: negative");
      if (res[0] === 0 && !(res[1] & 128))
        throw new E("Invalid signature integer: unnecessary leading zero");
      return { d: b2n(res), l: data.subarray(len + 2) };
    },
    toSig(hex) {
      const { Err: E } = DER;
      const data = typeof hex === "string" ? h2b(hex) : hex;
      if (!(data instanceof Uint8Array))
        throw new Error("ui8a expected");
      let l = data.length;
      if (l < 2 || data[0] != 48)
        throw new E("Invalid signature tag");
      if (data[1] !== l - 2)
        throw new E("Invalid signature: incorrect length");
      const { d: r, l: sBytes } = DER._parseInt(data.subarray(2));
      const { d: s, l: rBytesLeft } = DER._parseInt(sBytes);
      if (rBytesLeft.length)
        throw new E("Invalid signature: left bytes after parsing");
      return { r, s };
    },
    hexFromSig(sig) {
      const slice = (s2) => Number.parseInt(s2[0], 16) & 8 ? "00" + s2 : s2;
      const h = (num) => {
        const hex = num.toString(16);
        return hex.length & 1 ? `0${hex}` : hex;
      };
      const s = slice(h(sig.s));
      const r = slice(h(sig.r));
      const shl = s.length / 2;
      const rhl = r.length / 2;
      const sl = h(shl);
      const rl = h(rhl);
      return `30${h(rhl + shl + 4)}02${rl}${r}02${sl}${s}`;
    }
  };
  var _0n4 = BigInt(0);
  var _1n4 = BigInt(1);
  var _2n3 = BigInt(2);
  var _3n2 = BigInt(3);
  var _4n2 = BigInt(4);
  function weierstrassPoints(opts) {
    const CURVE = validatePointOpts(opts);
    const { Fp } = CURVE;
    const toBytes2 = CURVE.toBytes || ((_c, point, _isCompressed) => {
      const a = point.toAffine();
      return concatBytes2(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
    });
    const fromBytes = CURVE.fromBytes || ((bytes2) => {
      const tail = bytes2.subarray(1);
      const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
      const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
      return { x, y };
    });
    function weierstrassEquation(x) {
      const { a, b } = CURVE;
      const x2 = Fp.sqr(x);
      const x3 = Fp.mul(x2, x);
      return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
    }
    if (!Fp.eql(Fp.sqr(CURVE.Gy), weierstrassEquation(CURVE.Gx)))
      throw new Error("bad generator point: equation left != right");
    function isWithinCurveOrder(num) {
      return typeof num === "bigint" && _0n4 < num && num < CURVE.n;
    }
    function assertGE(num) {
      if (!isWithinCurveOrder(num))
        throw new Error("Expected valid bigint: 0 < bigint < curve.n");
    }
    function normPrivateKeyToScalar(key) {
      const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n } = CURVE;
      if (lengths && typeof key !== "bigint") {
        if (key instanceof Uint8Array)
          key = bytesToHex(key);
        if (typeof key !== "string" || !lengths.includes(key.length))
          throw new Error("Invalid key");
        key = key.padStart(nByteLength * 2, "0");
      }
      let num;
      try {
        num = typeof key === "bigint" ? key : bytesToNumberBE(ensureBytes("private key", key, nByteLength));
      } catch (error) {
        throw new Error(`private key must be ${nByteLength} bytes, hex or bigint, not ${typeof key}`);
      }
      if (wrapPrivateKey)
        num = mod(num, n);
      assertGE(num);
      return num;
    }
    const pointPrecomputes = new Map;
    function assertPrjPoint(other) {
      if (!(other instanceof Point))
        throw new Error("ProjectivePoint expected");
    }

    class Point {
      constructor(px, py, pz) {
        this.px = px;
        this.py = py;
        this.pz = pz;
        if (px == null || !Fp.isValid(px))
          throw new Error("x required");
        if (py == null || !Fp.isValid(py))
          throw new Error("y required");
        if (pz == null || !Fp.isValid(pz))
          throw new Error("z required");
      }
      static fromAffine(p) {
        const { x, y } = p || {};
        if (!p || !Fp.isValid(x) || !Fp.isValid(y))
          throw new Error("invalid affine point");
        if (p instanceof Point)
          throw new Error("projective point not allowed");
        const is0 = (i) => Fp.eql(i, Fp.ZERO);
        if (is0(x) && is0(y))
          return Point.ZERO;
        return new Point(x, y, Fp.ONE);
      }
      get x() {
        return this.toAffine().x;
      }
      get y() {
        return this.toAffine().y;
      }
      static normalizeZ(points) {
        const toInv = Fp.invertBatch(points.map((p) => p.pz));
        return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
      }
      static fromHex(hex) {
        const P = Point.fromAffine(fromBytes(ensureBytes("pointHex", hex)));
        P.assertValidity();
        return P;
      }
      static fromPrivateKey(privateKey) {
        return Point.BASE.multiply(normPrivateKeyToScalar(privateKey));
      }
      _setWindowSize(windowSize) {
        this._WINDOW_SIZE = windowSize;
        pointPrecomputes.delete(this);
      }
      assertValidity() {
        if (this.is0()) {
          if (CURVE.allowInfinityPoint && !Fp.is0(this.py))
            return;
          throw new Error("bad point: ZERO");
        }
        const { x, y } = this.toAffine();
        if (!Fp.isValid(x) || !Fp.isValid(y))
          throw new Error("bad point: x or y not FE");
        const left = Fp.sqr(y);
        const right = weierstrassEquation(x);
        if (!Fp.eql(left, right))
          throw new Error("bad point: equation left != right");
        if (!this.isTorsionFree())
          throw new Error("bad point: not in prime-order subgroup");
      }
      hasEvenY() {
        const { y } = this.toAffine();
        if (Fp.isOdd)
          return !Fp.isOdd(y);
        throw new Error("Field doesn't support isOdd");
      }
      equals(other) {
        assertPrjPoint(other);
        const { px: X1, py: Y1, pz: Z1 } = this;
        const { px: X2, py: Y2, pz: Z2 } = other;
        const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
        const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
        return U1 && U2;
      }
      negate() {
        return new Point(this.px, Fp.neg(this.py), this.pz);
      }
      double() {
        const { a, b } = CURVE;
        const b3 = Fp.mul(b, _3n2);
        const { px: X1, py: Y1, pz: Z1 } = this;
        let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp;
        let t0 = Fp.mul(X1, X1);
        let t1 = Fp.mul(Y1, Y1);
        let t2 = Fp.mul(Z1, Z1);
        let t3 = Fp.mul(X1, Y1);
        t3 = Fp.add(t3, t3);
        Z3 = Fp.mul(X1, Z1);
        Z3 = Fp.add(Z3, Z3);
        X3 = Fp.mul(a, Z3);
        Y3 = Fp.mul(b3, t2);
        Y3 = Fp.add(X3, Y3);
        X3 = Fp.sub(t1, Y3);
        Y3 = Fp.add(t1, Y3);
        Y3 = Fp.mul(X3, Y3);
        X3 = Fp.mul(t3, X3);
        Z3 = Fp.mul(b3, Z3);
        t2 = Fp.mul(a, t2);
        t3 = Fp.sub(t0, t2);
        t3 = Fp.mul(a, t3);
        t3 = Fp.add(t3, Z3);
        Z3 = Fp.add(t0, t0);
        t0 = Fp.add(Z3, t0);
        t0 = Fp.add(t0, t2);
        t0 = Fp.mul(t0, t3);
        Y3 = Fp.add(Y3, t0);
        t2 = Fp.mul(Y1, Z1);
        t2 = Fp.add(t2, t2);
        t0 = Fp.mul(t2, t3);
        X3 = Fp.sub(X3, t0);
        Z3 = Fp.mul(t2, t1);
        Z3 = Fp.add(Z3, Z3);
        Z3 = Fp.add(Z3, Z3);
        return new Point(X3, Y3, Z3);
      }
      add(other) {
        assertPrjPoint(other);
        const { px: X1, py: Y1, pz: Z1 } = this;
        const { px: X2, py: Y2, pz: Z2 } = other;
        let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp;
        const a = CURVE.a;
        const b3 = Fp.mul(CURVE.b, _3n2);
        let t0 = Fp.mul(X1, X2);
        let t1 = Fp.mul(Y1, Y2);
        let t2 = Fp.mul(Z1, Z2);
        let t3 = Fp.add(X1, Y1);
        let t4 = Fp.add(X2, Y2);
        t3 = Fp.mul(t3, t4);
        t4 = Fp.add(t0, t1);
        t3 = Fp.sub(t3, t4);
        t4 = Fp.add(X1, Z1);
        let t5 = Fp.add(X2, Z2);
        t4 = Fp.mul(t4, t5);
        t5 = Fp.add(t0, t2);
        t4 = Fp.sub(t4, t5);
        t5 = Fp.add(Y1, Z1);
        X3 = Fp.add(Y2, Z2);
        t5 = Fp.mul(t5, X3);
        X3 = Fp.add(t1, t2);
        t5 = Fp.sub(t5, X3);
        Z3 = Fp.mul(a, t4);
        X3 = Fp.mul(b3, t2);
        Z3 = Fp.add(X3, Z3);
        X3 = Fp.sub(t1, Z3);
        Z3 = Fp.add(t1, Z3);
        Y3 = Fp.mul(X3, Z3);
        t1 = Fp.add(t0, t0);
        t1 = Fp.add(t1, t0);
        t2 = Fp.mul(a, t2);
        t4 = Fp.mul(b3, t4);
        t1 = Fp.add(t1, t2);
        t2 = Fp.sub(t0, t2);
        t2 = Fp.mul(a, t2);
        t4 = Fp.add(t4, t2);
        t0 = Fp.mul(t1, t4);
        Y3 = Fp.add(Y3, t0);
        t0 = Fp.mul(t5, t4);
        X3 = Fp.mul(t3, X3);
        X3 = Fp.sub(X3, t0);
        t0 = Fp.mul(t3, t1);
        Z3 = Fp.mul(t5, Z3);
        Z3 = Fp.add(Z3, t0);
        return new Point(X3, Y3, Z3);
      }
      subtract(other) {
        return this.add(other.negate());
      }
      is0() {
        return this.equals(Point.ZERO);
      }
      wNAF(n) {
        return wnaf.wNAFCached(this, pointPrecomputes, n, (comp) => {
          const toInv = Fp.invertBatch(comp.map((p) => p.pz));
          return comp.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
        });
      }
      multiplyUnsafe(n) {
        const I = Point.ZERO;
        if (n === _0n4)
          return I;
        assertGE(n);
        if (n === _1n4)
          return this;
        const { endo } = CURVE;
        if (!endo)
          return wnaf.unsafeLadder(this, n);
        let { k1neg, k1, k2neg, k2 } = endo.splitScalar(n);
        let k1p = I;
        let k2p = I;
        let d = this;
        while (k1 > _0n4 || k2 > _0n4) {
          if (k1 & _1n4)
            k1p = k1p.add(d);
          if (k2 & _1n4)
            k2p = k2p.add(d);
          d = d.double();
          k1 >>= _1n4;
          k2 >>= _1n4;
        }
        if (k1neg)
          k1p = k1p.negate();
        if (k2neg)
          k2p = k2p.negate();
        k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
        return k1p.add(k2p);
      }
      multiply(scalar) {
        assertGE(scalar);
        let n = scalar;
        let point, fake;
        const { endo } = CURVE;
        if (endo) {
          const { k1neg, k1, k2neg, k2 } = endo.splitScalar(n);
          let { p: k1p, f: f1p } = this.wNAF(k1);
          let { p: k2p, f: f2p } = this.wNAF(k2);
          k1p = wnaf.constTimeNegate(k1neg, k1p);
          k2p = wnaf.constTimeNegate(k2neg, k2p);
          k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
          point = k1p.add(k2p);
          fake = f1p.add(f2p);
        } else {
          const { p, f } = this.wNAF(n);
          point = p;
          fake = f;
        }
        return Point.normalizeZ([point, fake])[0];
      }
      multiplyAndAddUnsafe(Q, a, b) {
        const G = Point.BASE;
        const mul = (P, a2) => a2 === _0n4 || a2 === _1n4 || !P.equals(G) ? P.multiplyUnsafe(a2) : P.multiply(a2);
        const sum = mul(this, a).add(mul(Q, b));
        return sum.is0() ? undefined : sum;
      }
      toAffine(iz) {
        const { px: x, py: y, pz: z } = this;
        const is0 = this.is0();
        if (iz == null)
          iz = is0 ? Fp.ONE : Fp.inv(z);
        const ax = Fp.mul(x, iz);
        const ay = Fp.mul(y, iz);
        const zz = Fp.mul(z, iz);
        if (is0)
          return { x: Fp.ZERO, y: Fp.ZERO };
        if (!Fp.eql(zz, Fp.ONE))
          throw new Error("invZ was invalid");
        return { x: ax, y: ay };
      }
      isTorsionFree() {
        const { h: cofactor, isTorsionFree } = CURVE;
        if (cofactor === _1n4)
          return true;
        if (isTorsionFree)
          return isTorsionFree(Point, this);
        throw new Error("isTorsionFree() has not been declared for the elliptic curve");
      }
      clearCofactor() {
        const { h: cofactor, clearCofactor } = CURVE;
        if (cofactor === _1n4)
          return this;
        if (clearCofactor)
          return clearCofactor(Point, this);
        return this.multiplyUnsafe(CURVE.h);
      }
      toRawBytes(isCompressed = true) {
        this.assertValidity();
        return toBytes2(Point, this, isCompressed);
      }
      toHex(isCompressed = true) {
        return bytesToHex(this.toRawBytes(isCompressed));
      }
    }
    Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
    Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
    const _bits = CURVE.nBitLength;
    const wnaf = wNAF(Point, CURVE.endo ? Math.ceil(_bits / 2) : _bits);
    return {
      CURVE,
      ProjectivePoint: Point,
      normPrivateKeyToScalar,
      weierstrassEquation,
      isWithinCurveOrder
    };
  }
  function validateOpts(curve) {
    const opts = validateBasic(curve);
    validateObject(opts, {
      hash: "hash",
      hmac: "function",
      randomBytes: "function"
    }, {
      bits2int: "function",
      bits2int_modN: "function",
      lowS: "boolean"
    });
    return Object.freeze({ lowS: true, ...opts });
  }
  function weierstrass(curveDef) {
    const CURVE = validateOpts(curveDef);
    const { Fp, n: CURVE_ORDER } = CURVE;
    const compressedLen = Fp.BYTES + 1;
    const uncompressedLen = 2 * Fp.BYTES + 1;
    function isValidFieldElement(num) {
      return _0n4 < num && num < Fp.ORDER;
    }
    function modN(a) {
      return mod(a, CURVE_ORDER);
    }
    function invN(a) {
      return invert(a, CURVE_ORDER);
    }
    const { ProjectivePoint: Point, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
      ...CURVE,
      toBytes(_c, point, isCompressed) {
        const a = point.toAffine();
        const x = Fp.toBytes(a.x);
        const cat = concatBytes2;
        if (isCompressed) {
          return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
        } else {
          return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
        }
      },
      fromBytes(bytes2) {
        const len = bytes2.length;
        const head = bytes2[0];
        const tail = bytes2.subarray(1);
        if (len === compressedLen && (head === 2 || head === 3)) {
          const x = bytesToNumberBE(tail);
          if (!isValidFieldElement(x))
            throw new Error("Point is not on curve");
          const y2 = weierstrassEquation(x);
          let y = Fp.sqrt(y2);
          const isYOdd = (y & _1n4) === _1n4;
          const isHeadOdd = (head & 1) === 1;
          if (isHeadOdd !== isYOdd)
            y = Fp.neg(y);
          return { x, y };
        } else if (len === uncompressedLen && head === 4) {
          const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
          const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
          return { x, y };
        } else {
          throw new Error(`Point of length ${len} was invalid. Expected ${compressedLen} compressed bytes or ${uncompressedLen} uncompressed bytes`);
        }
      }
    });
    const numToNByteStr = (num) => bytesToHex(numberToBytesBE(num, CURVE.nByteLength));
    function isBiggerThanHalfOrder(number2) {
      const HALF = CURVE_ORDER >> _1n4;
      return number2 > HALF;
    }
    function normalizeS(s) {
      return isBiggerThanHalfOrder(s) ? modN(-s) : s;
    }
    const slcNum = (b, from, to) => bytesToNumberBE(b.slice(from, to));

    class Signature {
      constructor(r, s, recovery) {
        this.r = r;
        this.s = s;
        this.recovery = recovery;
        this.assertValidity();
      }
      static fromCompact(hex) {
        const l = CURVE.nByteLength;
        hex = ensureBytes("compactSignature", hex, l * 2);
        return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
      }
      static fromDER(hex) {
        const { r, s } = DER.toSig(ensureBytes("DER", hex));
        return new Signature(r, s);
      }
      assertValidity() {
        if (!isWithinCurveOrder(this.r))
          throw new Error("r must be 0 < r < CURVE.n");
        if (!isWithinCurveOrder(this.s))
          throw new Error("s must be 0 < s < CURVE.n");
      }
      addRecoveryBit(recovery) {
        return new Signature(this.r, this.s, recovery);
      }
      recoverPublicKey(msgHash) {
        const { r, s, recovery: rec } = this;
        const h = bits2int_modN(ensureBytes("msgHash", msgHash));
        if (rec == null || ![0, 1, 2, 3].includes(rec))
          throw new Error("recovery id invalid");
        const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
        if (radj >= Fp.ORDER)
          throw new Error("recovery id 2 or 3 invalid");
        const prefix = (rec & 1) === 0 ? "02" : "03";
        const R = Point.fromHex(prefix + numToNByteStr(radj));
        const ir = invN(radj);
        const u1 = modN(-h * ir);
        const u2 = modN(s * ir);
        const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
        if (!Q)
          throw new Error("point at infinify");
        Q.assertValidity();
        return Q;
      }
      hasHighS() {
        return isBiggerThanHalfOrder(this.s);
      }
      normalizeS() {
        return this.hasHighS() ? new Signature(this.r, modN(-this.s), this.recovery) : this;
      }
      toDERRawBytes() {
        return hexToBytes(this.toDERHex());
      }
      toDERHex() {
        return DER.hexFromSig({ r: this.r, s: this.s });
      }
      toCompactRawBytes() {
        return hexToBytes(this.toCompactHex());
      }
      toCompactHex() {
        return numToNByteStr(this.r) + numToNByteStr(this.s);
      }
    }
    const utils = {
      isValidPrivateKey(privateKey) {
        try {
          normPrivateKeyToScalar(privateKey);
          return true;
        } catch (error) {
          return false;
        }
      },
      normPrivateKeyToScalar,
      randomPrivateKey: () => {
        const length = getMinHashLength(CURVE.n);
        return mapHashToField(CURVE.randomBytes(length), CURVE.n);
      },
      precompute(windowSize = 8, point = Point.BASE) {
        point._setWindowSize(windowSize);
        point.multiply(BigInt(3));
        return point;
      }
    };
    function getPublicKey(privateKey, isCompressed = true) {
      return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
    }
    function isProbPub(item) {
      const arr = item instanceof Uint8Array;
      const str = typeof item === "string";
      const len = (arr || str) && item.length;
      if (arr)
        return len === compressedLen || len === uncompressedLen;
      if (str)
        return len === 2 * compressedLen || len === 2 * uncompressedLen;
      if (item instanceof Point)
        return true;
      return false;
    }
    function getSharedSecret(privateA, publicB, isCompressed = true) {
      if (isProbPub(privateA))
        throw new Error("first arg must be private key");
      if (!isProbPub(publicB))
        throw new Error("second arg must be public key");
      const b = Point.fromHex(publicB);
      return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
    }
    const bits2int = CURVE.bits2int || function(bytes2) {
      const num = bytesToNumberBE(bytes2);
      const delta = bytes2.length * 8 - CURVE.nBitLength;
      return delta > 0 ? num >> BigInt(delta) : num;
    };
    const bits2int_modN = CURVE.bits2int_modN || function(bytes2) {
      return modN(bits2int(bytes2));
    };
    const ORDER_MASK = bitMask(CURVE.nBitLength);
    function int2octets(num) {
      if (typeof num !== "bigint")
        throw new Error("bigint expected");
      if (!(_0n4 <= num && num < ORDER_MASK))
        throw new Error(`bigint expected < 2^${CURVE.nBitLength}`);
      return numberToBytesBE(num, CURVE.nByteLength);
    }
    function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
      if (["recovered", "canonical"].some((k) => (k in opts)))
        throw new Error("sign() legacy options not supported");
      const { hash: hash2, randomBytes: randomBytes2 } = CURVE;
      let { lowS, prehash, extraEntropy: ent } = opts;
      if (lowS == null)
        lowS = true;
      msgHash = ensureBytes("msgHash", msgHash);
      if (prehash)
        msgHash = ensureBytes("prehashed msgHash", hash2(msgHash));
      const h1int = bits2int_modN(msgHash);
      const d = normPrivateKeyToScalar(privateKey);
      const seedArgs = [int2octets(d), int2octets(h1int)];
      if (ent != null) {
        const e = ent === true ? randomBytes2(Fp.BYTES) : ent;
        seedArgs.push(ensureBytes("extraEntropy", e));
      }
      const seed = concatBytes2(...seedArgs);
      const m = h1int;
      function k2sig(kBytes) {
        const k = bits2int(kBytes);
        if (!isWithinCurveOrder(k))
          return;
        const ik = invN(k);
        const q = Point.BASE.multiply(k).toAffine();
        const r = modN(q.x);
        if (r === _0n4)
          return;
        const s = modN(ik * modN(m + r * d));
        if (s === _0n4)
          return;
        let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n4);
        let normS = s;
        if (lowS && isBiggerThanHalfOrder(s)) {
          normS = normalizeS(s);
          recovery ^= 1;
        }
        return new Signature(r, normS, recovery);
      }
      return { seed, k2sig };
    }
    const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
    const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
    function sign(msgHash, privKey, opts = defaultSigOpts) {
      const { seed, k2sig } = prepSig(msgHash, privKey, opts);
      const C = CURVE;
      const drbg = createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac);
      return drbg(seed, k2sig);
    }
    Point.BASE._setWindowSize(8);
    function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
      const sg = signature;
      msgHash = ensureBytes("msgHash", msgHash);
      publicKey = ensureBytes("publicKey", publicKey);
      if ("strict" in opts)
        throw new Error("options.strict was renamed to lowS");
      const { lowS, prehash } = opts;
      let _sig = undefined;
      let P;
      try {
        if (typeof sg === "string" || sg instanceof Uint8Array) {
          try {
            _sig = Signature.fromDER(sg);
          } catch (derError) {
            if (!(derError instanceof DER.Err))
              throw derError;
            _sig = Signature.fromCompact(sg);
          }
        } else if (typeof sg === "object" && typeof sg.r === "bigint" && typeof sg.s === "bigint") {
          const { r: r2, s: s2 } = sg;
          _sig = new Signature(r2, s2);
        } else {
          throw new Error("PARSE");
        }
        P = Point.fromHex(publicKey);
      } catch (error) {
        if (error.message === "PARSE")
          throw new Error(`signature must be Signature instance, Uint8Array or hex string`);
        return false;
      }
      if (lowS && _sig.hasHighS())
        return false;
      if (prehash)
        msgHash = CURVE.hash(msgHash);
      const { r, s } = _sig;
      const h = bits2int_modN(msgHash);
      const is = invN(s);
      const u1 = modN(h * is);
      const u2 = modN(r * is);
      const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
      if (!R)
        return false;
      const v = modN(R.x);
      return v === r;
    }
    return {
      CURVE,
      getPublicKey,
      getSharedSecret,
      sign,
      verify,
      ProjectivePoint: Point,
      Signature,
      utils
    };
  }

  // ../../node_modules/@noble/curves/node_modules/@noble/hashes/esm/hmac.js
  class HMAC extends Hash {
    constructor(hash2, _key) {
      super();
      this.finished = false;
      this.destroyed = false;
      hash(hash2);
      const key = toBytes(_key);
      this.iHash = hash2.create();
      if (typeof this.iHash.update !== "function")
        throw new Error("Expected instance of class which extends utils.Hash");
      this.blockLen = this.iHash.blockLen;
      this.outputLen = this.iHash.outputLen;
      const blockLen = this.blockLen;
      const pad = new Uint8Array(blockLen);
      pad.set(key.length > blockLen ? hash2.create().update(key).digest() : key);
      for (let i = 0;i < pad.length; i++)
        pad[i] ^= 54;
      this.iHash.update(pad);
      this.oHash = hash2.create();
      for (let i = 0;i < pad.length; i++)
        pad[i] ^= 54 ^ 92;
      this.oHash.update(pad);
      pad.fill(0);
    }
    update(buf) {
      exists(this);
      this.iHash.update(buf);
      return this;
    }
    digestInto(out) {
      exists(this);
      bytes(out, this.outputLen);
      this.finished = true;
      this.iHash.digestInto(out);
      this.oHash.update(out);
      this.oHash.digestInto(out);
      this.destroy();
    }
    digest() {
      const out = new Uint8Array(this.oHash.outputLen);
      this.digestInto(out);
      return out;
    }
    _cloneInto(to) {
      to || (to = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
      to = to;
      to.finished = finished;
      to.destroyed = destroyed;
      to.blockLen = blockLen;
      to.outputLen = outputLen;
      to.oHash = oHash._cloneInto(to.oHash);
      to.iHash = iHash._cloneInto(to.iHash);
      return to;
    }
    destroy() {
      this.destroyed = true;
      this.oHash.destroy();
      this.iHash.destroy();
    }
  }
  var hmac = (hash2, key, message) => new HMAC(hash2, key).update(message).digest();
  hmac.create = (hash2, key) => new HMAC(hash2, key);

  // ../../node_modules/@noble/curves/esm/_shortw_utils.js
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  function getHash(hash2) {
    return {
      hash: hash2,
      hmac: (key, ...msgs) => hmac(hash2, key, concatBytes(...msgs)),
      randomBytes
    };
  }
  function createCurve(curveDef, defHash) {
    const create = (hash2) => weierstrass({ ...curveDef, ...getHash(hash2) });
    return Object.freeze({ ...create(defHash), create });
  }

  // ../../node_modules/@noble/curves/esm/secp256k1.js
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  var secp256k1P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
  var secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
  var _1n5 = BigInt(1);
  var _2n4 = BigInt(2);
  var divNearest = (a, b) => (a + b / _2n4) / b;
  function sqrtMod(y) {
    const P = secp256k1P;
    const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
    const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
    const b2 = y * y * y % P;
    const b3 = b2 * b2 * y % P;
    const b6 = pow2(b3, _3n3, P) * b3 % P;
    const b9 = pow2(b6, _3n3, P) * b3 % P;
    const b11 = pow2(b9, _2n4, P) * b2 % P;
    const b22 = pow2(b11, _11n, P) * b11 % P;
    const b44 = pow2(b22, _22n, P) * b22 % P;
    const b88 = pow2(b44, _44n, P) * b44 % P;
    const b176 = pow2(b88, _88n, P) * b88 % P;
    const b220 = pow2(b176, _44n, P) * b44 % P;
    const b223 = pow2(b220, _3n3, P) * b3 % P;
    const t1 = pow2(b223, _23n, P) * b22 % P;
    const t2 = pow2(t1, _6n, P) * b2 % P;
    const root = pow2(t2, _2n4, P);
    if (!Fp.eql(Fp.sqr(root), y))
      throw new Error("Cannot find square root");
    return root;
  }
  var Fp = Field(secp256k1P, undefined, undefined, { sqrt: sqrtMod });
  var secp256k1 = createCurve({
    a: BigInt(0),
    b: BigInt(7),
    Fp,
    n: secp256k1N,
    Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
    Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
    h: BigInt(1),
    lowS: true,
    endo: {
      beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
      splitScalar: (k) => {
        const n = secp256k1N;
        const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
        const b1 = -_1n5 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
        const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
        const b2 = a1;
        const POW_2_128 = BigInt("0x100000000000000000000000000000000");
        const c1 = divNearest(b2 * k, n);
        const c2 = divNearest(-b1 * k, n);
        let k1 = mod(k - c1 * a1 - c2 * a2, n);
        let k2 = mod(-c1 * b1 - c2 * b2, n);
        const k1neg = k1 > POW_2_128;
        const k2neg = k2 > POW_2_128;
        if (k1neg)
          k1 = n - k1;
        if (k2neg)
          k2 = n - k2;
        if (k1 > POW_2_128 || k2 > POW_2_128) {
          throw new Error("splitScalar: Endomorphism failed, k=" + k);
        }
        return { k1neg, k1, k2neg, k2 };
      }
    }
  }, sha256);
  var _0n5 = BigInt(0);
  var fe = (x) => typeof x === "bigint" && _0n5 < x && x < secp256k1P;
  var ge = (x) => typeof x === "bigint" && _0n5 < x && x < secp256k1N;
  var TAGGED_HASH_PREFIXES = {};
  function taggedHash(tag, ...messages) {
    let tagP = TAGGED_HASH_PREFIXES[tag];
    if (tagP === undefined) {
      const tagH = sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
      tagP = concatBytes2(tagH, tagH);
      TAGGED_HASH_PREFIXES[tag] = tagP;
    }
    return sha256(concatBytes2(tagP, ...messages));
  }
  var pointToBytes = (point) => point.toRawBytes(true).slice(1);
  var numTo32b = (n) => numberToBytesBE(n, 32);
  var modP = (x) => mod(x, secp256k1P);
  var modN = (x) => mod(x, secp256k1N);
  var Point = secp256k1.ProjectivePoint;
  var GmulAdd = (Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b);
  function schnorrGetExtPubKey(priv) {
    let d_ = secp256k1.utils.normPrivateKeyToScalar(priv);
    let p = Point.fromPrivateKey(d_);
    const scalar = p.hasEvenY() ? d_ : modN(-d_);
    return { scalar, bytes: pointToBytes(p) };
  }
  function lift_x(x) {
    if (!fe(x))
      throw new Error("bad x: need 0 < x < p");
    const xx = modP(x * x);
    const c = modP(xx * x + BigInt(7));
    let y = sqrtMod(c);
    if (y % _2n4 !== _0n5)
      y = modP(-y);
    const p = new Point(x, y, _1n5);
    p.assertValidity();
    return p;
  }
  function challenge(...args) {
    return modN(bytesToNumberBE(taggedHash("BIP0340/challenge", ...args)));
  }
  function schnorrGetPublicKey(privateKey) {
    return schnorrGetExtPubKey(privateKey).bytes;
  }
  function schnorrSign(message, privateKey, auxRand = randomBytes(32)) {
    const m = ensureBytes("message", message);
    const { bytes: px, scalar: d } = schnorrGetExtPubKey(privateKey);
    const a = ensureBytes("auxRand", auxRand, 32);
    const t = numTo32b(d ^ bytesToNumberBE(taggedHash("BIP0340/aux", a)));
    const rand = taggedHash("BIP0340/nonce", t, px, m);
    const k_ = modN(bytesToNumberBE(rand));
    if (k_ === _0n5)
      throw new Error("sign failed: k is zero");
    const { bytes: rx, scalar: k } = schnorrGetExtPubKey(k_);
    const e = challenge(rx, px, m);
    const sig = new Uint8Array(64);
    sig.set(rx, 0);
    sig.set(numTo32b(modN(k + e * d)), 32);
    if (!schnorrVerify(sig, m, px))
      throw new Error("sign: Invalid signature produced");
    return sig;
  }
  function schnorrVerify(signature, message, publicKey) {
    const sig = ensureBytes("signature", signature, 64);
    const m = ensureBytes("message", message);
    const pub = ensureBytes("publicKey", publicKey, 32);
    try {
      const P = lift_x(bytesToNumberBE(pub));
      const r = bytesToNumberBE(sig.subarray(0, 32));
      if (!fe(r))
        return false;
      const s = bytesToNumberBE(sig.subarray(32, 64));
      if (!ge(s))
        return false;
      const e = challenge(numTo32b(r), pointToBytes(P), m);
      const R = GmulAdd(P, s, modN(-e));
      if (!R || !R.hasEvenY() || R.toAffine().x !== r)
        return false;
      return true;
    } catch (error) {
      return false;
    }
  }
  var schnorr = /* @__PURE__ */ (() => ({
    getPublicKey: schnorrGetPublicKey,
    sign: schnorrSign,
    verify: schnorrVerify,
    utils: {
      randomPrivateKey: secp256k1.utils.randomPrivateKey,
      lift_x,
      pointToBytes,
      numberToBytesBE,
      bytesToNumberBE,
      taggedHash,
      mod
    }
  }))();

  // ../../node_modules/@noble/hashes/esm/crypto.js
  var crypto3 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : undefined;

  // ../../node_modules/@noble/hashes/esm/utils.js
  /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  var u8a3 = (a) => a instanceof Uint8Array;
  var createView2 = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  var rotr2 = (word, shift) => word << 32 - shift | word >>> shift;
  var isLE2 = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
  if (!isLE2)
    throw new Error("Non little-endian hardware is not supported");
  var hexes2 = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, "0"));
  function bytesToHex2(bytes2) {
    if (!u8a3(bytes2))
      throw new Error("Uint8Array expected");
    let hex = "";
    for (let i = 0;i < bytes2.length; i++) {
      hex += hexes2[bytes2[i]];
    }
    return hex;
  }
  function hexToBytes2(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    const len = hex.length;
    if (len % 2)
      throw new Error("padded hex string expected, got unpadded hex of length " + len);
    const array = new Uint8Array(len / 2);
    for (let i = 0;i < array.length; i++) {
      const j = i * 2;
      const hexByte = hex.slice(j, j + 2);
      const byte = Number.parseInt(hexByte, 16);
      if (Number.isNaN(byte) || byte < 0)
        throw new Error("Invalid byte sequence");
      array[i] = byte;
    }
    return array;
  }
  function utf8ToBytes3(str) {
    if (typeof str !== "string")
      throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
    return new Uint8Array(new TextEncoder().encode(str));
  }
  function toBytes2(data) {
    if (typeof data === "string")
      data = utf8ToBytes3(data);
    if (!u8a3(data))
      throw new Error(`expected Uint8Array, got ${typeof data}`);
    return data;
  }
  function concatBytes3(...arrays) {
    const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
    let pad = 0;
    arrays.forEach((a) => {
      if (!u8a3(a))
        throw new Error("Uint8Array expected");
      r.set(a, pad);
      pad += a.length;
    });
    return r;
  }

  class Hash2 {
    clone() {
      return this._cloneInto();
    }
  }
  function wrapConstructor2(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes2(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
  }
  function randomBytes2(bytesLength = 32) {
    if (crypto3 && typeof crypto3.getRandomValues === "function") {
      return crypto3.getRandomValues(new Uint8Array(bytesLength));
    }
    throw new Error("crypto.getRandomValues must be defined");
  }

  // ../../node_modules/@noble/hashes/esm/_assert.js
  function number2(n) {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error(`Wrong positive integer: ${n}`);
  }
  function bool(b) {
    if (typeof b !== "boolean")
      throw new Error(`Expected boolean, not ${b}`);
  }
  function bytes2(b, ...lengths) {
    if (!(b instanceof Uint8Array))
      throw new Error("Expected Uint8Array");
    if (lengths.length > 0 && !lengths.includes(b.length))
      throw new Error(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
  }
  function hash2(hash3) {
    if (typeof hash3 !== "function" || typeof hash3.create !== "function")
      throw new Error("Hash should be wrapped by utils.wrapConstructor");
    number2(hash3.outputLen);
    number2(hash3.blockLen);
  }
  function exists2(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function output2(out, instance) {
    bytes2(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error(`digestInto() expects output buffer of length at least ${min}`);
    }
  }
  var assert = {
    number: number2,
    bool,
    bytes: bytes2,
    hash: hash2,
    exists: exists2,
    output: output2
  };
  var _assert_default = assert;

  // ../../node_modules/@noble/hashes/esm/_sha2.js
  function setBigUint642(view, byteOffset, value, isLE3) {
    if (typeof view.setBigUint64 === "function")
      return view.setBigUint64(byteOffset, value, isLE3);
    const _32n = BigInt(32);
    const _u32_max = BigInt(4294967295);
    const wh = Number(value >> _32n & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE3 ? 4 : 0;
    const l = isLE3 ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE3);
    view.setUint32(byteOffset + l, wl, isLE3);
  }

  class SHA22 extends Hash2 {
    constructor(blockLen, outputLen, padOffset, isLE3) {
      super();
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE3;
      this.finished = false;
      this.length = 0;
      this.pos = 0;
      this.destroyed = false;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView2(this.buffer);
    }
    update(data) {
      _assert_default.exists(this);
      const { view, buffer, blockLen } = this;
      data = toBytes2(data);
      const len = data.length;
      for (let pos = 0;pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView2(data);
          for (;blockLen <= len - pos; pos += blockLen)
            this.process(dataView, pos);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
        }
      }
      this.length += data.length;
      this.roundClean();
      return this;
    }
    digestInto(out) {
      _assert_default.exists(this);
      _assert_default.output(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE: isLE3 } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      this.buffer.subarray(pos).fill(0);
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i = pos;i < blockLen; i++)
        buffer[i] = 0;
      setBigUint642(view, blockLen - 8, BigInt(this.length * 8), isLE3);
      this.process(view, 0);
      const oview = createView2(out);
      const len = this.outputLen;
      if (len % 4)
        throw new Error("_sha2: outputLen should be aligned to 32bit");
      const outLen = len / 4;
      const state = this.get();
      if (outLen > state.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let i = 0;i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE3);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      to || (to = new this.constructor);
      to.set(...this.get());
      const { blockLen, buffer, length, finished, destroyed, pos } = this;
      to.length = length;
      to.pos = pos;
      to.finished = finished;
      to.destroyed = destroyed;
      if (length % blockLen)
        to.buffer.set(buffer);
      return to;
    }
  }

  // ../../node_modules/@noble/hashes/esm/sha256.js
  var Chi2 = (a, b, c) => a & b ^ ~a & c;
  var Maj2 = (a, b, c) => a & b ^ a & c ^ b & c;
  var SHA256_K2 = new Uint32Array([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  var IV2 = new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  var SHA256_W2 = new Uint32Array(64);

  class SHA2562 extends SHA22 {
    constructor() {
      super(64, 32, 8, false);
      this.A = IV2[0] | 0;
      this.B = IV2[1] | 0;
      this.C = IV2[2] | 0;
      this.D = IV2[3] | 0;
      this.E = IV2[4] | 0;
      this.F = IV2[5] | 0;
      this.G = IV2[6] | 0;
      this.H = IV2[7] | 0;
    }
    get() {
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    set(A, B, C, D, E, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    process(view, offset) {
      for (let i = 0;i < 16; i++, offset += 4)
        SHA256_W2[i] = view.getUint32(offset, false);
      for (let i = 16;i < 64; i++) {
        const W15 = SHA256_W2[i - 15];
        const W2 = SHA256_W2[i - 2];
        const s0 = rotr2(W15, 7) ^ rotr2(W15, 18) ^ W15 >>> 3;
        const s1 = rotr2(W2, 17) ^ rotr2(W2, 19) ^ W2 >>> 10;
        SHA256_W2[i] = s1 + SHA256_W2[i - 7] + s0 + SHA256_W2[i - 16] | 0;
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0;i < 64; i++) {
        const sigma1 = rotr2(E, 6) ^ rotr2(E, 11) ^ rotr2(E, 25);
        const T1 = H + sigma1 + Chi2(E, F, G) + SHA256_K2[i] + SHA256_W2[i] | 0;
        const sigma0 = rotr2(A, 2) ^ rotr2(A, 13) ^ rotr2(A, 22);
        const T2 = sigma0 + Maj2(A, B, C) | 0;
        H = G;
        G = F;
        F = E;
        E = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E = E + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
      SHA256_W2.fill(0);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      this.buffer.fill(0);
    }
  }

  class SHA224 extends SHA2562 {
    constructor() {
      super();
      this.A = 3238371032 | 0;
      this.B = 914150663 | 0;
      this.C = 812702999 | 0;
      this.D = 4144912697 | 0;
      this.E = 4290775857 | 0;
      this.F = 1750603025 | 0;
      this.G = 1694076839 | 0;
      this.H = 3204075428 | 0;
      this.outputLen = 28;
    }
  }
  var sha2562 = wrapConstructor2(() => new SHA2562);
  var sha224 = wrapConstructor2(() => new SHA224);

  // ../../node_modules/@scure/base/lib/esm/index.js
  /*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  function assertNumber(n) {
    if (!Number.isSafeInteger(n))
      throw new Error(`Wrong integer: ${n}`);
  }
  function chain(...args) {
    const wrap = (a, b) => (c) => a(b(c));
    const encode = Array.from(args).reverse().reduce((acc, i) => acc ? wrap(acc, i.encode) : i.encode, undefined);
    const decode = args.reduce((acc, i) => acc ? wrap(acc, i.decode) : i.decode, undefined);
    return { encode, decode };
  }
  function alphabet(alphabet2) {
    return {
      encode: (digits) => {
        if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
          throw new Error("alphabet.encode input should be an array of numbers");
        return digits.map((i) => {
          assertNumber(i);
          if (i < 0 || i >= alphabet2.length)
            throw new Error(`Digit index outside alphabet: ${i} (alphabet: ${alphabet2.length})`);
          return alphabet2[i];
        });
      },
      decode: (input) => {
        if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
          throw new Error("alphabet.decode input should be array of strings");
        return input.map((letter) => {
          if (typeof letter !== "string")
            throw new Error(`alphabet.decode: not string element=${letter}`);
          const index = alphabet2.indexOf(letter);
          if (index === -1)
            throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet2}`);
          return index;
        });
      }
    };
  }
  function join(separator = "") {
    if (typeof separator !== "string")
      throw new Error("join separator should be string");
    return {
      encode: (from) => {
        if (!Array.isArray(from) || from.length && typeof from[0] !== "string")
          throw new Error("join.encode input should be array of strings");
        for (let i of from)
          if (typeof i !== "string")
            throw new Error(`join.encode: non-string input=${i}`);
        return from.join(separator);
      },
      decode: (to) => {
        if (typeof to !== "string")
          throw new Error("join.decode input should be string");
        return to.split(separator);
      }
    };
  }
  function padding(bits, chr = "=") {
    assertNumber(bits);
    if (typeof chr !== "string")
      throw new Error("padding chr should be string");
    return {
      encode(data) {
        if (!Array.isArray(data) || data.length && typeof data[0] !== "string")
          throw new Error("padding.encode input should be array of strings");
        for (let i of data)
          if (typeof i !== "string")
            throw new Error(`padding.encode: non-string input=${i}`);
        while (data.length * bits % 8)
          data.push(chr);
        return data;
      },
      decode(input) {
        if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
          throw new Error("padding.encode input should be array of strings");
        for (let i of input)
          if (typeof i !== "string")
            throw new Error(`padding.decode: non-string input=${i}`);
        let end = input.length;
        if (end * bits % 8)
          throw new Error("Invalid padding: string should have whole number of bytes");
        for (;end > 0 && input[end - 1] === chr; end--) {
          if (!((end - 1) * bits % 8))
            throw new Error("Invalid padding: string has too much padding");
        }
        return input.slice(0, end);
      }
    };
  }
  function normalize(fn) {
    if (typeof fn !== "function")
      throw new Error("normalize fn should be function");
    return { encode: (from) => from, decode: (to) => fn(to) };
  }
  function convertRadix(data, from, to) {
    if (from < 2)
      throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`);
    if (to < 2)
      throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`);
    if (!Array.isArray(data))
      throw new Error("convertRadix: data should be array");
    if (!data.length)
      return [];
    let pos = 0;
    const res = [];
    const digits = Array.from(data);
    digits.forEach((d) => {
      assertNumber(d);
      if (d < 0 || d >= from)
        throw new Error(`Wrong integer: ${d}`);
    });
    while (true) {
      let carry = 0;
      let done = true;
      for (let i = pos;i < digits.length; i++) {
        const digit = digits[i];
        const digitBase = from * carry + digit;
        if (!Number.isSafeInteger(digitBase) || from * carry / from !== carry || digitBase - digit !== from * carry) {
          throw new Error("convertRadix: carry overflow");
        }
        carry = digitBase % to;
        digits[i] = Math.floor(digitBase / to);
        if (!Number.isSafeInteger(digits[i]) || digits[i] * to + carry !== digitBase)
          throw new Error("convertRadix: carry overflow");
        if (!done)
          continue;
        else if (!digits[i])
          pos = i;
        else
          done = false;
      }
      res.push(carry);
      if (done)
        break;
    }
    for (let i = 0;i < data.length - 1 && data[i] === 0; i++)
      res.push(0);
    return res.reverse();
  }
  var gcd = (a, b) => !b ? a : gcd(b, a % b);
  var radix2carry = (from, to) => from + (to - gcd(from, to));
  function convertRadix2(data, from, to, padding2) {
    if (!Array.isArray(data))
      throw new Error("convertRadix2: data should be array");
    if (from <= 0 || from > 32)
      throw new Error(`convertRadix2: wrong from=${from}`);
    if (to <= 0 || to > 32)
      throw new Error(`convertRadix2: wrong to=${to}`);
    if (radix2carry(from, to) > 32) {
      throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${radix2carry(from, to)}`);
    }
    let carry = 0;
    let pos = 0;
    const mask = 2 ** to - 1;
    const res = [];
    for (const n of data) {
      assertNumber(n);
      if (n >= 2 ** from)
        throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
      carry = carry << from | n;
      if (pos + from > 32)
        throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
      pos += from;
      for (;pos >= to; pos -= to)
        res.push((carry >> pos - to & mask) >>> 0);
      carry &= 2 ** pos - 1;
    }
    carry = carry << to - pos & mask;
    if (!padding2 && pos >= from)
      throw new Error("Excess padding");
    if (!padding2 && carry)
      throw new Error(`Non-zero padding: ${carry}`);
    if (padding2 && pos > 0)
      res.push(carry >>> 0);
    return res;
  }
  function radix(num) {
    assertNumber(num);
    return {
      encode: (bytes3) => {
        if (!(bytes3 instanceof Uint8Array))
          throw new Error("radix.encode input should be Uint8Array");
        return convertRadix(Array.from(bytes3), 2 ** 8, num);
      },
      decode: (digits) => {
        if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
          throw new Error("radix.decode input should be array of strings");
        return Uint8Array.from(convertRadix(digits, num, 2 ** 8));
      }
    };
  }
  function radix2(bits, revPadding = false) {
    assertNumber(bits);
    if (bits <= 0 || bits > 32)
      throw new Error("radix2: bits should be in (0..32]");
    if (radix2carry(8, bits) > 32 || radix2carry(bits, 8) > 32)
      throw new Error("radix2: carry overflow");
    return {
      encode: (bytes3) => {
        if (!(bytes3 instanceof Uint8Array))
          throw new Error("radix2.encode input should be Uint8Array");
        return convertRadix2(Array.from(bytes3), 8, bits, !revPadding);
      },
      decode: (digits) => {
        if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
          throw new Error("radix2.decode input should be array of strings");
        return Uint8Array.from(convertRadix2(digits, bits, 8, revPadding));
      }
    };
  }
  function unsafeWrapper(fn) {
    if (typeof fn !== "function")
      throw new Error("unsafeWrapper fn should be function");
    return function(...args) {
      try {
        return fn.apply(null, args);
      } catch (e) {}
    };
  }
  var base16 = chain(radix2(4), alphabet("0123456789ABCDEF"), join(""));
  var base32 = chain(radix2(5), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), padding(5), join(""));
  var base32hex = chain(radix2(5), alphabet("0123456789ABCDEFGHIJKLMNOPQRSTUV"), padding(5), join(""));
  var base32crockford = chain(radix2(5), alphabet("0123456789ABCDEFGHJKMNPQRSTVWXYZ"), join(""), normalize((s) => s.toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1")));
  var base64 = chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), padding(6), join(""));
  var base64url = chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), padding(6), join(""));
  var genBase58 = (abc) => chain(radix(58), alphabet(abc), join(""));
  var base58 = genBase58("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
  var base58flickr = genBase58("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ");
  var base58xrp = genBase58("rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz");
  var XMR_BLOCK_LEN = [0, 2, 3, 5, 6, 7, 9, 10, 11];
  var base58xmr = {
    encode(data) {
      let res = "";
      for (let i = 0;i < data.length; i += 8) {
        const block = data.subarray(i, i + 8);
        res += base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], "1");
      }
      return res;
    },
    decode(str) {
      let res = [];
      for (let i = 0;i < str.length; i += 11) {
        const slice = str.slice(i, i + 11);
        const blockLen = XMR_BLOCK_LEN.indexOf(slice.length);
        const block = base58.decode(slice);
        for (let j = 0;j < block.length - blockLen; j++) {
          if (block[j] !== 0)
            throw new Error("base58xmr: wrong padding");
        }
        res = res.concat(Array.from(block.slice(block.length - blockLen)));
      }
      return Uint8Array.from(res);
    }
  };
  var BECH_ALPHABET = chain(alphabet("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), join(""));
  var POLYMOD_GENERATORS = [996825010, 642813549, 513874426, 1027748829, 705979059];
  function bech32Polymod(pre) {
    const b = pre >> 25;
    let chk = (pre & 33554431) << 5;
    for (let i = 0;i < POLYMOD_GENERATORS.length; i++) {
      if ((b >> i & 1) === 1)
        chk ^= POLYMOD_GENERATORS[i];
    }
    return chk;
  }
  function bechChecksum(prefix, words, encodingConst = 1) {
    const len = prefix.length;
    let chk = 1;
    for (let i = 0;i < len; i++) {
      const c = prefix.charCodeAt(i);
      if (c < 33 || c > 126)
        throw new Error(`Invalid prefix (${prefix})`);
      chk = bech32Polymod(chk) ^ c >> 5;
    }
    chk = bech32Polymod(chk);
    for (let i = 0;i < len; i++)
      chk = bech32Polymod(chk) ^ prefix.charCodeAt(i) & 31;
    for (let v of words)
      chk = bech32Polymod(chk) ^ v;
    for (let i = 0;i < 6; i++)
      chk = bech32Polymod(chk);
    chk ^= encodingConst;
    return BECH_ALPHABET.encode(convertRadix2([chk % 2 ** 30], 30, 5, false));
  }
  function genBech32(encoding) {
    const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
    const _words = radix2(5);
    const fromWords = _words.decode;
    const toWords = _words.encode;
    const fromWordsUnsafe = unsafeWrapper(fromWords);
    function encode(prefix, words, limit = 90) {
      if (typeof prefix !== "string")
        throw new Error(`bech32.encode prefix should be string, not ${typeof prefix}`);
      if (!Array.isArray(words) || words.length && typeof words[0] !== "number")
        throw new Error(`bech32.encode words should be array of numbers, not ${typeof words}`);
      const actualLength = prefix.length + 7 + words.length;
      if (limit !== false && actualLength > limit)
        throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
      prefix = prefix.toLowerCase();
      return `${prefix}1${BECH_ALPHABET.encode(words)}${bechChecksum(prefix, words, ENCODING_CONST)}`;
    }
    function decode(str, limit = 90) {
      if (typeof str !== "string")
        throw new Error(`bech32.decode input should be string, not ${typeof str}`);
      if (str.length < 8 || limit !== false && str.length > limit)
        throw new TypeError(`Wrong string length: ${str.length} (${str}). Expected (8..${limit})`);
      const lowered = str.toLowerCase();
      if (str !== lowered && str !== str.toUpperCase())
        throw new Error(`String must be lowercase or uppercase`);
      str = lowered;
      const sepIndex = str.lastIndexOf("1");
      if (sepIndex === 0 || sepIndex === -1)
        throw new Error(`Letter "1" must be present between prefix and data only`);
      const prefix = str.slice(0, sepIndex);
      const _words2 = str.slice(sepIndex + 1);
      if (_words2.length < 6)
        throw new Error("Data must be at least 6 characters long");
      const words = BECH_ALPHABET.decode(_words2).slice(0, -6);
      const sum = bechChecksum(prefix, words, ENCODING_CONST);
      if (!_words2.endsWith(sum))
        throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
      return { prefix, words };
    }
    const decodeUnsafe = unsafeWrapper(decode);
    function decodeToBytes(str) {
      const { prefix, words } = decode(str, false);
      return { prefix, words, bytes: fromWords(words) };
    }
    return { encode, decode, decodeToBytes, decodeUnsafe, fromWords, fromWordsUnsafe, toWords };
  }
  var bech32 = genBech32("bech32");
  var bech32m = genBech32("bech32m");
  var utf8 = {
    encode: (data) => new TextDecoder().decode(data),
    decode: (str) => new TextEncoder().encode(str)
  };
  var hex = chain(radix2(4), alphabet("0123456789abcdef"), join(""), normalize((s) => {
    if (typeof s !== "string" || s.length % 2)
      throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`);
    return s.toLowerCase();
  }));
  var CODERS = {
    utf8,
    hex,
    base16,
    base32,
    base64,
    base64url,
    base58,
    base58xmr
  };
  var coderTypeError = `Invalid encoding type. Available types: ${Object.keys(CODERS).join(", ")}`;

  // ../../node_modules/nostr-tools/node_modules/@noble/ciphers/esm/_assert.js
  function number3(n) {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error(`positive integer expected, not ${n}`);
  }
  function bool2(b) {
    if (typeof b !== "boolean")
      throw new Error(`boolean expected, not ${b}`);
  }
  function isBytes(a) {
    return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
  }
  function bytes3(b, ...lengths) {
    if (!isBytes(b))
      throw new Error("Uint8Array expected");
    if (lengths.length > 0 && !lengths.includes(b.length))
      throw new Error(`Uint8Array expected of length ${lengths}, not of length=${b.length}`);
  }
  function exists3(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function output3(out, instance) {
    bytes3(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error(`digestInto() expects output buffer of length at least ${min}`);
    }
  }

  // ../../node_modules/nostr-tools/node_modules/@noble/ciphers/esm/utils.js
  /*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
  var u8 = (arr) => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  var u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
  var createView3 = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  var isLE3 = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
  if (!isLE3)
    throw new Error("Non little-endian hardware is not supported");
  var hexes3 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  function bytesToHex3(bytes4) {
    bytes3(bytes4);
    let hex2 = "";
    for (let i = 0;i < bytes4.length; i++) {
      hex2 += hexes3[bytes4[i]];
    }
    return hex2;
  }
  var asciis = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 };
  function asciiToBase16(char) {
    if (char >= asciis._0 && char <= asciis._9)
      return char - asciis._0;
    if (char >= asciis._A && char <= asciis._F)
      return char - (asciis._A - 10);
    if (char >= asciis._a && char <= asciis._f)
      return char - (asciis._a - 10);
    return;
  }
  function hexToBytes3(hex2) {
    if (typeof hex2 !== "string")
      throw new Error("hex string expected, got " + typeof hex2);
    const hl = hex2.length;
    const al = hl / 2;
    if (hl % 2)
      throw new Error("padded hex string expected, got unpadded hex of length " + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0;ai < al; ai++, hi += 2) {
      const n1 = asciiToBase16(hex2.charCodeAt(hi));
      const n2 = asciiToBase16(hex2.charCodeAt(hi + 1));
      if (n1 === undefined || n2 === undefined) {
        const char = hex2[hi] + hex2[hi + 1];
        throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
      }
      array[ai] = n1 * 16 + n2;
    }
    return array;
  }
  function utf8ToBytes4(str) {
    if (typeof str !== "string")
      throw new Error(`string expected, got ${typeof str}`);
    return new Uint8Array(new TextEncoder().encode(str));
  }
  function toBytes3(data) {
    if (typeof data === "string")
      data = utf8ToBytes4(data);
    else if (isBytes(data))
      data = data.slice();
    else
      throw new Error(`Uint8Array expected, got ${typeof data}`);
    return data;
  }
  function checkOpts(defaults, opts) {
    if (opts == null || typeof opts !== "object")
      throw new Error("options must be defined");
    const merged = Object.assign(defaults, opts);
    return merged;
  }
  function equalBytes2(a, b) {
    if (a.length !== b.length)
      return false;
    let diff = 0;
    for (let i = 0;i < a.length; i++)
      diff |= a[i] ^ b[i];
    return diff === 0;
  }
  var wrapCipher = (params, c) => {
    Object.assign(c, params);
    return c;
  };
  function setBigUint643(view, byteOffset, value, isLE4) {
    if (typeof view.setBigUint64 === "function")
      return view.setBigUint64(byteOffset, value, isLE4);
    const _32n = BigInt(32);
    const _u32_max = BigInt(4294967295);
    const wh = Number(value >> _32n & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE4 ? 4 : 0;
    const l = isLE4 ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE4);
    view.setUint32(byteOffset + l, wl, isLE4);
  }

  // ../../node_modules/nostr-tools/node_modules/@noble/ciphers/esm/_polyval.js
  var BLOCK_SIZE = 16;
  var ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
  var ZEROS32 = u32(ZEROS16);
  var POLY = 225;
  var mul2 = (s0, s1, s2, s3) => {
    const hiBit = s3 & 1;
    return {
      s3: s2 << 31 | s3 >>> 1,
      s2: s1 << 31 | s2 >>> 1,
      s1: s0 << 31 | s1 >>> 1,
      s0: s0 >>> 1 ^ POLY << 24 & -(hiBit & 1)
    };
  };
  var swapLE = (n) => (n >>> 0 & 255) << 24 | (n >>> 8 & 255) << 16 | (n >>> 16 & 255) << 8 | n >>> 24 & 255 | 0;
  function _toGHASHKey(k) {
    k.reverse();
    const hiBit = k[15] & 1;
    let carry = 0;
    for (let i = 0;i < k.length; i++) {
      const t = k[i];
      k[i] = t >>> 1 | carry;
      carry = (t & 1) << 7;
    }
    k[0] ^= -hiBit & 225;
    return k;
  }
  var estimateWindow = (bytes4) => {
    if (bytes4 > 64 * 1024)
      return 8;
    if (bytes4 > 1024)
      return 4;
    return 2;
  };

  class GHASH {
    constructor(key, expectedLength) {
      this.blockLen = BLOCK_SIZE;
      this.outputLen = BLOCK_SIZE;
      this.s0 = 0;
      this.s1 = 0;
      this.s2 = 0;
      this.s3 = 0;
      this.finished = false;
      key = toBytes3(key);
      bytes3(key, 16);
      const kView = createView3(key);
      let k0 = kView.getUint32(0, false);
      let k1 = kView.getUint32(4, false);
      let k2 = kView.getUint32(8, false);
      let k3 = kView.getUint32(12, false);
      const doubles = [];
      for (let i = 0;i < 128; i++) {
        doubles.push({ s0: swapLE(k0), s1: swapLE(k1), s2: swapLE(k2), s3: swapLE(k3) });
        ({ s0: k0, s1: k1, s2: k2, s3: k3 } = mul2(k0, k1, k2, k3));
      }
      const W = estimateWindow(expectedLength || 1024);
      if (![1, 2, 4, 8].includes(W))
        throw new Error(`ghash: wrong window size=${W}, should be 2, 4 or 8`);
      this.W = W;
      const bits = 128;
      const windows = bits / W;
      const windowSize = this.windowSize = 2 ** W;
      const items = [];
      for (let w = 0;w < windows; w++) {
        for (let byte = 0;byte < windowSize; byte++) {
          let s0 = 0, s1 = 0, s2 = 0, s3 = 0;
          for (let j = 0;j < W; j++) {
            const bit = byte >>> W - j - 1 & 1;
            if (!bit)
              continue;
            const { s0: d0, s1: d1, s2: d2, s3: d3 } = doubles[W * w + j];
            s0 ^= d0, s1 ^= d1, s2 ^= d2, s3 ^= d3;
          }
          items.push({ s0, s1, s2, s3 });
        }
      }
      this.t = items;
    }
    _updateBlock(s0, s1, s2, s3) {
      s0 ^= this.s0, s1 ^= this.s1, s2 ^= this.s2, s3 ^= this.s3;
      const { W, t, windowSize } = this;
      let o0 = 0, o1 = 0, o2 = 0, o3 = 0;
      const mask = (1 << W) - 1;
      let w = 0;
      for (const num of [s0, s1, s2, s3]) {
        for (let bytePos = 0;bytePos < 4; bytePos++) {
          const byte = num >>> 8 * bytePos & 255;
          for (let bitPos = 8 / W - 1;bitPos >= 0; bitPos--) {
            const bit = byte >>> W * bitPos & mask;
            const { s0: e0, s1: e1, s2: e2, s3: e3 } = t[w * windowSize + bit];
            o0 ^= e0, o1 ^= e1, o2 ^= e2, o3 ^= e3;
            w += 1;
          }
        }
      }
      this.s0 = o0;
      this.s1 = o1;
      this.s2 = o2;
      this.s3 = o3;
    }
    update(data) {
      data = toBytes3(data);
      exists3(this);
      const b32 = u32(data);
      const blocks = Math.floor(data.length / BLOCK_SIZE);
      const left = data.length % BLOCK_SIZE;
      for (let i = 0;i < blocks; i++) {
        this._updateBlock(b32[i * 4 + 0], b32[i * 4 + 1], b32[i * 4 + 2], b32[i * 4 + 3]);
      }
      if (left) {
        ZEROS16.set(data.subarray(blocks * BLOCK_SIZE));
        this._updateBlock(ZEROS32[0], ZEROS32[1], ZEROS32[2], ZEROS32[3]);
        ZEROS32.fill(0);
      }
      return this;
    }
    destroy() {
      const { t } = this;
      for (const elm of t) {
        elm.s0 = 0, elm.s1 = 0, elm.s2 = 0, elm.s3 = 0;
      }
    }
    digestInto(out) {
      exists3(this);
      output3(out, this);
      this.finished = true;
      const { s0, s1, s2, s3 } = this;
      const o32 = u32(out);
      o32[0] = s0;
      o32[1] = s1;
      o32[2] = s2;
      o32[3] = s3;
      return out;
    }
    digest() {
      const res = new Uint8Array(BLOCK_SIZE);
      this.digestInto(res);
      this.destroy();
      return res;
    }
  }

  class Polyval extends GHASH {
    constructor(key, expectedLength) {
      key = toBytes3(key);
      const ghKey = _toGHASHKey(key.slice());
      super(ghKey, expectedLength);
      ghKey.fill(0);
    }
    update(data) {
      data = toBytes3(data);
      exists3(this);
      const b32 = u32(data);
      const left = data.length % BLOCK_SIZE;
      const blocks = Math.floor(data.length / BLOCK_SIZE);
      for (let i = 0;i < blocks; i++) {
        this._updateBlock(swapLE(b32[i * 4 + 3]), swapLE(b32[i * 4 + 2]), swapLE(b32[i * 4 + 1]), swapLE(b32[i * 4 + 0]));
      }
      if (left) {
        ZEROS16.set(data.subarray(blocks * BLOCK_SIZE));
        this._updateBlock(swapLE(ZEROS32[3]), swapLE(ZEROS32[2]), swapLE(ZEROS32[1]), swapLE(ZEROS32[0]));
        ZEROS32.fill(0);
      }
      return this;
    }
    digestInto(out) {
      exists3(this);
      output3(out, this);
      this.finished = true;
      const { s0, s1, s2, s3 } = this;
      const o32 = u32(out);
      o32[0] = s0;
      o32[1] = s1;
      o32[2] = s2;
      o32[3] = s3;
      return out.reverse();
    }
  }
  function wrapConstructorWithKey(hashCons) {
    const hashC = (msg, key) => hashCons(key, msg.length).update(toBytes3(msg)).digest();
    const tmp = hashCons(new Uint8Array(16), 0);
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (key, expectedLength) => hashCons(key, expectedLength);
    return hashC;
  }
  var ghash = wrapConstructorWithKey((key, expectedLength) => new GHASH(key, expectedLength));
  var polyval = wrapConstructorWithKey((key, expectedLength) => new Polyval(key, expectedLength));

  // ../../node_modules/nostr-tools/node_modules/@noble/ciphers/esm/aes.js
  var BLOCK_SIZE2 = 16;
  var BLOCK_SIZE32 = 4;
  var EMPTY_BLOCK = new Uint8Array(BLOCK_SIZE2);
  var POLY2 = 283;
  function mul22(n) {
    return n << 1 ^ POLY2 & -(n >> 7);
  }
  function mul(a, b) {
    let res = 0;
    for (;b > 0; b >>= 1) {
      res ^= a & -(b & 1);
      a = mul22(a);
    }
    return res;
  }
  var sbox = /* @__PURE__ */ (() => {
    let t = new Uint8Array(256);
    for (let i = 0, x = 1;i < 256; i++, x ^= mul22(x))
      t[i] = x;
    const box = new Uint8Array(256);
    box[0] = 99;
    for (let i = 0;i < 255; i++) {
      let x = t[255 - i];
      x |= x << 8;
      box[t[i]] = (x ^ x >> 4 ^ x >> 5 ^ x >> 6 ^ x >> 7 ^ 99) & 255;
    }
    return box;
  })();
  var invSbox = /* @__PURE__ */ sbox.map((_, j) => sbox.indexOf(j));
  var rotr32_8 = (n) => n << 24 | n >>> 8;
  var rotl32_8 = (n) => n << 8 | n >>> 24;
  function genTtable(sbox2, fn) {
    if (sbox2.length !== 256)
      throw new Error("Wrong sbox length");
    const T0 = new Uint32Array(256).map((_, j) => fn(sbox2[j]));
    const T1 = T0.map(rotl32_8);
    const T2 = T1.map(rotl32_8);
    const T3 = T2.map(rotl32_8);
    const T01 = new Uint32Array(256 * 256);
    const T23 = new Uint32Array(256 * 256);
    const sbox22 = new Uint16Array(256 * 256);
    for (let i = 0;i < 256; i++) {
      for (let j = 0;j < 256; j++) {
        const idx = i * 256 + j;
        T01[idx] = T0[i] ^ T1[j];
        T23[idx] = T2[i] ^ T3[j];
        sbox22[idx] = sbox2[i] << 8 | sbox2[j];
      }
    }
    return { sbox: sbox2, sbox2: sbox22, T0, T1, T2, T3, T01, T23 };
  }
  var tableEncoding = /* @__PURE__ */ genTtable(sbox, (s) => mul(s, 3) << 24 | s << 16 | s << 8 | mul(s, 2));
  var tableDecoding = /* @__PURE__ */ genTtable(invSbox, (s) => mul(s, 11) << 24 | mul(s, 13) << 16 | mul(s, 9) << 8 | mul(s, 14));
  var xPowers = /* @__PURE__ */ (() => {
    const p = new Uint8Array(16);
    for (let i = 0, x = 1;i < 16; i++, x = mul22(x))
      p[i] = x;
    return p;
  })();
  function expandKeyLE(key) {
    bytes3(key);
    const len = key.length;
    if (![16, 24, 32].includes(len))
      throw new Error(`aes: wrong key size: should be 16, 24 or 32, got: ${len}`);
    const { sbox2 } = tableEncoding;
    const k32 = u32(key);
    const Nk = k32.length;
    const subByte = (n) => applySbox(sbox2, n, n, n, n);
    const xk = new Uint32Array(len + 28);
    xk.set(k32);
    for (let i = Nk;i < xk.length; i++) {
      let t = xk[i - 1];
      if (i % Nk === 0)
        t = subByte(rotr32_8(t)) ^ xPowers[i / Nk - 1];
      else if (Nk > 6 && i % Nk === 4)
        t = subByte(t);
      xk[i] = xk[i - Nk] ^ t;
    }
    return xk;
  }
  function expandKeyDecLE(key) {
    const encKey = expandKeyLE(key);
    const xk = encKey.slice();
    const Nk = encKey.length;
    const { sbox2 } = tableEncoding;
    const { T0, T1, T2, T3 } = tableDecoding;
    for (let i = 0;i < Nk; i += 4) {
      for (let j = 0;j < 4; j++)
        xk[i + j] = encKey[Nk - i - 4 + j];
    }
    encKey.fill(0);
    for (let i = 4;i < Nk - 4; i++) {
      const x = xk[i];
      const w = applySbox(sbox2, x, x, x, x);
      xk[i] = T0[w & 255] ^ T1[w >>> 8 & 255] ^ T2[w >>> 16 & 255] ^ T3[w >>> 24];
    }
    return xk;
  }
  function apply0123(T01, T23, s0, s1, s2, s3) {
    return T01[s0 << 8 & 65280 | s1 >>> 8 & 255] ^ T23[s2 >>> 8 & 65280 | s3 >>> 24 & 255];
  }
  function applySbox(sbox2, s0, s1, s2, s3) {
    return sbox2[s0 & 255 | s1 & 65280] | sbox2[s2 >>> 16 & 255 | s3 >>> 16 & 65280] << 16;
  }
  function encrypt(xk, s0, s1, s2, s3) {
    const { sbox2, T01, T23 } = tableEncoding;
    let k = 0;
    s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
    const rounds = xk.length / 4 - 2;
    for (let i = 0;i < rounds; i++) {
      const t02 = xk[k++] ^ apply0123(T01, T23, s0, s1, s2, s3);
      const t12 = xk[k++] ^ apply0123(T01, T23, s1, s2, s3, s0);
      const t22 = xk[k++] ^ apply0123(T01, T23, s2, s3, s0, s1);
      const t32 = xk[k++] ^ apply0123(T01, T23, s3, s0, s1, s2);
      s0 = t02, s1 = t12, s2 = t22, s3 = t32;
    }
    const t0 = xk[k++] ^ applySbox(sbox2, s0, s1, s2, s3);
    const t1 = xk[k++] ^ applySbox(sbox2, s1, s2, s3, s0);
    const t2 = xk[k++] ^ applySbox(sbox2, s2, s3, s0, s1);
    const t3 = xk[k++] ^ applySbox(sbox2, s3, s0, s1, s2);
    return { s0: t0, s1: t1, s2: t2, s3: t3 };
  }
  function decrypt(xk, s0, s1, s2, s3) {
    const { sbox2, T01, T23 } = tableDecoding;
    let k = 0;
    s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
    const rounds = xk.length / 4 - 2;
    for (let i = 0;i < rounds; i++) {
      const t02 = xk[k++] ^ apply0123(T01, T23, s0, s3, s2, s1);
      const t12 = xk[k++] ^ apply0123(T01, T23, s1, s0, s3, s2);
      const t22 = xk[k++] ^ apply0123(T01, T23, s2, s1, s0, s3);
      const t32 = xk[k++] ^ apply0123(T01, T23, s3, s2, s1, s0);
      s0 = t02, s1 = t12, s2 = t22, s3 = t32;
    }
    const t0 = xk[k++] ^ applySbox(sbox2, s0, s3, s2, s1);
    const t1 = xk[k++] ^ applySbox(sbox2, s1, s0, s3, s2);
    const t2 = xk[k++] ^ applySbox(sbox2, s2, s1, s0, s3);
    const t3 = xk[k++] ^ applySbox(sbox2, s3, s2, s1, s0);
    return { s0: t0, s1: t1, s2: t2, s3: t3 };
  }
  function getDst(len, dst) {
    if (!dst)
      return new Uint8Array(len);
    bytes3(dst);
    if (dst.length < len)
      throw new Error(`aes: wrong destination length, expected at least ${len}, got: ${dst.length}`);
    return dst;
  }
  function ctrCounter(xk, nonce, src, dst) {
    bytes3(nonce, BLOCK_SIZE2);
    bytes3(src);
    const srcLen = src.length;
    dst = getDst(srcLen, dst);
    const ctr = nonce;
    const c32 = u32(ctr);
    let { s0, s1, s2, s3 } = encrypt(xk, c32[0], c32[1], c32[2], c32[3]);
    const src32 = u32(src);
    const dst32 = u32(dst);
    for (let i = 0;i + 4 <= src32.length; i += 4) {
      dst32[i + 0] = src32[i + 0] ^ s0;
      dst32[i + 1] = src32[i + 1] ^ s1;
      dst32[i + 2] = src32[i + 2] ^ s2;
      dst32[i + 3] = src32[i + 3] ^ s3;
      let carry = 1;
      for (let i2 = ctr.length - 1;i2 >= 0; i2--) {
        carry = carry + (ctr[i2] & 255) | 0;
        ctr[i2] = carry & 255;
        carry >>>= 8;
      }
      ({ s0, s1, s2, s3 } = encrypt(xk, c32[0], c32[1], c32[2], c32[3]));
    }
    const start = BLOCK_SIZE2 * Math.floor(src32.length / BLOCK_SIZE32);
    if (start < srcLen) {
      const b32 = new Uint32Array([s0, s1, s2, s3]);
      const buf = u8(b32);
      for (let i = start, pos = 0;i < srcLen; i++, pos++)
        dst[i] = src[i] ^ buf[pos];
    }
    return dst;
  }
  function ctr32(xk, isLE4, nonce, src, dst) {
    bytes3(nonce, BLOCK_SIZE2);
    bytes3(src);
    dst = getDst(src.length, dst);
    const ctr = nonce;
    const c32 = u32(ctr);
    const view = createView3(ctr);
    const src32 = u32(src);
    const dst32 = u32(dst);
    const ctrPos = isLE4 ? 0 : 12;
    const srcLen = src.length;
    let ctrNum = view.getUint32(ctrPos, isLE4);
    let { s0, s1, s2, s3 } = encrypt(xk, c32[0], c32[1], c32[2], c32[3]);
    for (let i = 0;i + 4 <= src32.length; i += 4) {
      dst32[i + 0] = src32[i + 0] ^ s0;
      dst32[i + 1] = src32[i + 1] ^ s1;
      dst32[i + 2] = src32[i + 2] ^ s2;
      dst32[i + 3] = src32[i + 3] ^ s3;
      ctrNum = ctrNum + 1 >>> 0;
      view.setUint32(ctrPos, ctrNum, isLE4);
      ({ s0, s1, s2, s3 } = encrypt(xk, c32[0], c32[1], c32[2], c32[3]));
    }
    const start = BLOCK_SIZE2 * Math.floor(src32.length / BLOCK_SIZE32);
    if (start < srcLen) {
      const b32 = new Uint32Array([s0, s1, s2, s3]);
      const buf = u8(b32);
      for (let i = start, pos = 0;i < srcLen; i++, pos++)
        dst[i] = src[i] ^ buf[pos];
    }
    return dst;
  }
  var ctr = wrapCipher({ blockSize: 16, nonceLength: 16 }, function ctr2(key, nonce) {
    bytes3(key);
    bytes3(nonce, BLOCK_SIZE2);
    function processCtr(buf, dst) {
      const xk = expandKeyLE(key);
      const n = nonce.slice();
      const out = ctrCounter(xk, n, buf, dst);
      xk.fill(0);
      n.fill(0);
      return out;
    }
    return {
      encrypt: (plaintext, dst) => processCtr(plaintext, dst),
      decrypt: (ciphertext, dst) => processCtr(ciphertext, dst)
    };
  });
  function validateBlockDecrypt(data) {
    bytes3(data);
    if (data.length % BLOCK_SIZE2 !== 0) {
      throw new Error(`aes/(cbc-ecb).decrypt ciphertext should consist of blocks with size ${BLOCK_SIZE2}`);
    }
  }
  function validateBlockEncrypt(plaintext, pcks5, dst) {
    let outLen = plaintext.length;
    const remaining = outLen % BLOCK_SIZE2;
    if (!pcks5 && remaining !== 0)
      throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
    const b = u32(plaintext);
    if (pcks5) {
      let left = BLOCK_SIZE2 - remaining;
      if (!left)
        left = BLOCK_SIZE2;
      outLen = outLen + left;
    }
    const out = getDst(outLen, dst);
    const o = u32(out);
    return { b, o, out };
  }
  function validatePCKS(data, pcks5) {
    if (!pcks5)
      return data;
    const len = data.length;
    if (!len)
      throw new Error(`aes/pcks5: empty ciphertext not allowed`);
    const lastByte = data[len - 1];
    if (lastByte <= 0 || lastByte > 16)
      throw new Error(`aes/pcks5: wrong padding byte: ${lastByte}`);
    const out = data.subarray(0, -lastByte);
    for (let i = 0;i < lastByte; i++)
      if (data[len - i - 1] !== lastByte)
        throw new Error(`aes/pcks5: wrong padding`);
    return out;
  }
  function padPCKS(left) {
    const tmp = new Uint8Array(16);
    const tmp32 = u32(tmp);
    tmp.set(left);
    const paddingByte = BLOCK_SIZE2 - left.length;
    for (let i = BLOCK_SIZE2 - paddingByte;i < BLOCK_SIZE2; i++)
      tmp[i] = paddingByte;
    return tmp32;
  }
  var ecb = wrapCipher({ blockSize: 16 }, function ecb2(key, opts = {}) {
    bytes3(key);
    const pcks5 = !opts.disablePadding;
    return {
      encrypt: (plaintext, dst) => {
        bytes3(plaintext);
        const { b, o, out: _out } = validateBlockEncrypt(plaintext, pcks5, dst);
        const xk = expandKeyLE(key);
        let i = 0;
        for (;i + 4 <= b.length; ) {
          const { s0, s1, s2, s3 } = encrypt(xk, b[i + 0], b[i + 1], b[i + 2], b[i + 3]);
          o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
        }
        if (pcks5) {
          const tmp32 = padPCKS(plaintext.subarray(i * 4));
          const { s0, s1, s2, s3 } = encrypt(xk, tmp32[0], tmp32[1], tmp32[2], tmp32[3]);
          o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
        }
        xk.fill(0);
        return _out;
      },
      decrypt: (ciphertext, dst) => {
        validateBlockDecrypt(ciphertext);
        const xk = expandKeyDecLE(key);
        const out = getDst(ciphertext.length, dst);
        const b = u32(ciphertext);
        const o = u32(out);
        for (let i = 0;i + 4 <= b.length; ) {
          const { s0, s1, s2, s3 } = decrypt(xk, b[i + 0], b[i + 1], b[i + 2], b[i + 3]);
          o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
        }
        xk.fill(0);
        return validatePCKS(out, pcks5);
      }
    };
  });
  var cbc = wrapCipher({ blockSize: 16, nonceLength: 16 }, function cbc2(key, iv, opts = {}) {
    bytes3(key);
    bytes3(iv, 16);
    const pcks5 = !opts.disablePadding;
    return {
      encrypt: (plaintext, dst) => {
        const xk = expandKeyLE(key);
        const { b, o, out: _out } = validateBlockEncrypt(plaintext, pcks5, dst);
        const n32 = u32(iv);
        let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
        let i = 0;
        for (;i + 4 <= b.length; ) {
          s0 ^= b[i + 0], s1 ^= b[i + 1], s2 ^= b[i + 2], s3 ^= b[i + 3];
          ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
          o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
        }
        if (pcks5) {
          const tmp32 = padPCKS(plaintext.subarray(i * 4));
          s0 ^= tmp32[0], s1 ^= tmp32[1], s2 ^= tmp32[2], s3 ^= tmp32[3];
          ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
          o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
        }
        xk.fill(0);
        return _out;
      },
      decrypt: (ciphertext, dst) => {
        validateBlockDecrypt(ciphertext);
        const xk = expandKeyDecLE(key);
        const n32 = u32(iv);
        const out = getDst(ciphertext.length, dst);
        const b = u32(ciphertext);
        const o = u32(out);
        let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
        for (let i = 0;i + 4 <= b.length; ) {
          const ps0 = s0, ps1 = s1, ps2 = s2, ps3 = s3;
          s0 = b[i + 0], s1 = b[i + 1], s2 = b[i + 2], s3 = b[i + 3];
          const { s0: o0, s1: o1, s2: o2, s3: o3 } = decrypt(xk, s0, s1, s2, s3);
          o[i++] = o0 ^ ps0, o[i++] = o1 ^ ps1, o[i++] = o2 ^ ps2, o[i++] = o3 ^ ps3;
        }
        xk.fill(0);
        return validatePCKS(out, pcks5);
      }
    };
  });
  var cfb = wrapCipher({ blockSize: 16, nonceLength: 16 }, function cfb2(key, iv) {
    bytes3(key);
    bytes3(iv, 16);
    function processCfb(src, isEncrypt, dst) {
      const xk = expandKeyLE(key);
      const srcLen = src.length;
      dst = getDst(srcLen, dst);
      const src32 = u32(src);
      const dst32 = u32(dst);
      const next32 = isEncrypt ? dst32 : src32;
      const n32 = u32(iv);
      let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
      for (let i = 0;i + 4 <= src32.length; ) {
        const { s0: e0, s1: e1, s2: e2, s3: e3 } = encrypt(xk, s0, s1, s2, s3);
        dst32[i + 0] = src32[i + 0] ^ e0;
        dst32[i + 1] = src32[i + 1] ^ e1;
        dst32[i + 2] = src32[i + 2] ^ e2;
        dst32[i + 3] = src32[i + 3] ^ e3;
        s0 = next32[i++], s1 = next32[i++], s2 = next32[i++], s3 = next32[i++];
      }
      const start = BLOCK_SIZE2 * Math.floor(src32.length / BLOCK_SIZE32);
      if (start < srcLen) {
        ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
        const buf = u8(new Uint32Array([s0, s1, s2, s3]));
        for (let i = start, pos = 0;i < srcLen; i++, pos++)
          dst[i] = src[i] ^ buf[pos];
        buf.fill(0);
      }
      xk.fill(0);
      return dst;
    }
    return {
      encrypt: (plaintext, dst) => processCfb(plaintext, true, dst),
      decrypt: (ciphertext, dst) => processCfb(ciphertext, false, dst)
    };
  });
  function computeTag(fn, isLE4, key, data, AAD) {
    const h = fn.create(key, data.length + (AAD?.length || 0));
    if (AAD)
      h.update(AAD);
    h.update(data);
    const num = new Uint8Array(16);
    const view = createView3(num);
    if (AAD)
      setBigUint643(view, 0, BigInt(AAD.length * 8), isLE4);
    setBigUint643(view, 8, BigInt(data.length * 8), isLE4);
    h.update(num);
    return h.digest();
  }
  var gcm = wrapCipher({ blockSize: 16, nonceLength: 12, tagLength: 16 }, function gcm2(key, nonce, AAD) {
    bytes3(nonce);
    if (nonce.length === 0)
      throw new Error("aes/gcm: empty nonce");
    const tagLength = 16;
    function _computeTag(authKey, tagMask, data) {
      const tag = computeTag(ghash, false, authKey, data, AAD);
      for (let i = 0;i < tagMask.length; i++)
        tag[i] ^= tagMask[i];
      return tag;
    }
    function deriveKeys() {
      const xk = expandKeyLE(key);
      const authKey = EMPTY_BLOCK.slice();
      const counter = EMPTY_BLOCK.slice();
      ctr32(xk, false, counter, counter, authKey);
      if (nonce.length === 12) {
        counter.set(nonce);
      } else {
        const nonceLen = EMPTY_BLOCK.slice();
        const view = createView3(nonceLen);
        setBigUint643(view, 8, BigInt(nonce.length * 8), false);
        ghash.create(authKey).update(nonce).update(nonceLen).digestInto(counter);
      }
      const tagMask = ctr32(xk, false, counter, EMPTY_BLOCK);
      return { xk, authKey, counter, tagMask };
    }
    return {
      encrypt: (plaintext) => {
        bytes3(plaintext);
        const { xk, authKey, counter, tagMask } = deriveKeys();
        const out = new Uint8Array(plaintext.length + tagLength);
        ctr32(xk, false, counter, plaintext, out);
        const tag = _computeTag(authKey, tagMask, out.subarray(0, out.length - tagLength));
        out.set(tag, plaintext.length);
        xk.fill(0);
        return out;
      },
      decrypt: (ciphertext) => {
        bytes3(ciphertext);
        if (ciphertext.length < tagLength)
          throw new Error(`aes/gcm: ciphertext less than tagLen (${tagLength})`);
        const { xk, authKey, counter, tagMask } = deriveKeys();
        const data = ciphertext.subarray(0, -tagLength);
        const passedTag = ciphertext.subarray(-tagLength);
        const tag = _computeTag(authKey, tagMask, data);
        if (!equalBytes2(tag, passedTag))
          throw new Error("aes/gcm: invalid ghash tag");
        const out = ctr32(xk, false, counter, data);
        authKey.fill(0);
        tagMask.fill(0);
        xk.fill(0);
        return out;
      }
    };
  });
  var limit = (name, min, max) => (value) => {
    if (!Number.isSafeInteger(value) || min > value || value > max)
      throw new Error(`${name}: invalid value=${value}, must be [${min}..${max}]`);
  };
  var siv = wrapCipher({ blockSize: 16, nonceLength: 12, tagLength: 16 }, function siv2(key, nonce, AAD) {
    const tagLength = 16;
    const AAD_LIMIT = limit("AAD", 0, 2 ** 36);
    const PLAIN_LIMIT = limit("plaintext", 0, 2 ** 36);
    const NONCE_LIMIT = limit("nonce", 12, 12);
    const CIPHER_LIMIT = limit("ciphertext", 16, 2 ** 36 + 16);
    bytes3(nonce);
    NONCE_LIMIT(nonce.length);
    if (AAD) {
      bytes3(AAD);
      AAD_LIMIT(AAD.length);
    }
    function deriveKeys() {
      const len = key.length;
      if (len !== 16 && len !== 24 && len !== 32)
        throw new Error(`key length must be 16, 24 or 32 bytes, got: ${len} bytes`);
      const xk = expandKeyLE(key);
      const encKey = new Uint8Array(len);
      const authKey = new Uint8Array(16);
      const n32 = u32(nonce);
      let s0 = 0, s1 = n32[0], s2 = n32[1], s3 = n32[2];
      let counter = 0;
      for (const derivedKey of [authKey, encKey].map(u32)) {
        const d32 = u32(derivedKey);
        for (let i = 0;i < d32.length; i += 2) {
          const { s0: o0, s1: o1 } = encrypt(xk, s0, s1, s2, s3);
          d32[i + 0] = o0;
          d32[i + 1] = o1;
          s0 = ++counter;
        }
      }
      xk.fill(0);
      return { authKey, encKey: expandKeyLE(encKey) };
    }
    function _computeTag(encKey, authKey, data) {
      const tag = computeTag(polyval, true, authKey, data, AAD);
      for (let i = 0;i < 12; i++)
        tag[i] ^= nonce[i];
      tag[15] &= 127;
      const t32 = u32(tag);
      let s0 = t32[0], s1 = t32[1], s2 = t32[2], s3 = t32[3];
      ({ s0, s1, s2, s3 } = encrypt(encKey, s0, s1, s2, s3));
      t32[0] = s0, t32[1] = s1, t32[2] = s2, t32[3] = s3;
      return tag;
    }
    function processSiv(encKey, tag, input) {
      let block = tag.slice();
      block[15] |= 128;
      return ctr32(encKey, true, block, input);
    }
    return {
      encrypt: (plaintext) => {
        bytes3(plaintext);
        PLAIN_LIMIT(plaintext.length);
        const { encKey, authKey } = deriveKeys();
        const tag = _computeTag(encKey, authKey, plaintext);
        const out = new Uint8Array(plaintext.length + tagLength);
        out.set(tag, plaintext.length);
        out.set(processSiv(encKey, tag, plaintext));
        encKey.fill(0);
        authKey.fill(0);
        return out;
      },
      decrypt: (ciphertext) => {
        bytes3(ciphertext);
        CIPHER_LIMIT(ciphertext.length);
        const tag = ciphertext.subarray(-tagLength);
        const { encKey, authKey } = deriveKeys();
        const plaintext = processSiv(encKey, tag, ciphertext.subarray(0, -tagLength));
        const expectedTag = _computeTag(encKey, authKey, plaintext);
        encKey.fill(0);
        authKey.fill(0);
        if (!equalBytes2(tag, expectedTag))
          throw new Error("invalid polyval tag");
        return plaintext;
      }
    };
  });

  // ../../node_modules/nostr-tools/node_modules/@noble/ciphers/esm/_poly1305.js
  var u8to16 = (a, i) => a[i++] & 255 | (a[i++] & 255) << 8;

  class Poly1305 {
    constructor(key) {
      this.blockLen = 16;
      this.outputLen = 16;
      this.buffer = new Uint8Array(16);
      this.r = new Uint16Array(10);
      this.h = new Uint16Array(10);
      this.pad = new Uint16Array(8);
      this.pos = 0;
      this.finished = false;
      key = toBytes3(key);
      bytes3(key, 32);
      const t0 = u8to16(key, 0);
      const t1 = u8to16(key, 2);
      const t2 = u8to16(key, 4);
      const t3 = u8to16(key, 6);
      const t4 = u8to16(key, 8);
      const t5 = u8to16(key, 10);
      const t6 = u8to16(key, 12);
      const t7 = u8to16(key, 14);
      this.r[0] = t0 & 8191;
      this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
      this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
      this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
      this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
      this.r[5] = t4 >>> 1 & 8190;
      this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
      this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
      this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
      this.r[9] = t7 >>> 5 & 127;
      for (let i = 0;i < 8; i++)
        this.pad[i] = u8to16(key, 16 + 2 * i);
    }
    process(data, offset, isLast = false) {
      const hibit = isLast ? 0 : 1 << 11;
      const { h, r } = this;
      const r0 = r[0];
      const r1 = r[1];
      const r2 = r[2];
      const r3 = r[3];
      const r4 = r[4];
      const r5 = r[5];
      const r6 = r[6];
      const r7 = r[7];
      const r8 = r[8];
      const r9 = r[9];
      const t0 = u8to16(data, offset + 0);
      const t1 = u8to16(data, offset + 2);
      const t2 = u8to16(data, offset + 4);
      const t3 = u8to16(data, offset + 6);
      const t4 = u8to16(data, offset + 8);
      const t5 = u8to16(data, offset + 10);
      const t6 = u8to16(data, offset + 12);
      const t7 = u8to16(data, offset + 14);
      let h0 = h[0] + (t0 & 8191);
      let h1 = h[1] + ((t0 >>> 13 | t1 << 3) & 8191);
      let h2 = h[2] + ((t1 >>> 10 | t2 << 6) & 8191);
      let h3 = h[3] + ((t2 >>> 7 | t3 << 9) & 8191);
      let h4 = h[4] + ((t3 >>> 4 | t4 << 12) & 8191);
      let h5 = h[5] + (t4 >>> 1 & 8191);
      let h6 = h[6] + ((t4 >>> 14 | t5 << 2) & 8191);
      let h7 = h[7] + ((t5 >>> 11 | t6 << 5) & 8191);
      let h8 = h[8] + ((t6 >>> 8 | t7 << 8) & 8191);
      let h9 = h[9] + (t7 >>> 5 | hibit);
      let c = 0;
      let d0 = c + h0 * r0 + h1 * (5 * r9) + h2 * (5 * r8) + h3 * (5 * r7) + h4 * (5 * r6);
      c = d0 >>> 13;
      d0 &= 8191;
      d0 += h5 * (5 * r5) + h6 * (5 * r4) + h7 * (5 * r3) + h8 * (5 * r2) + h9 * (5 * r1);
      c += d0 >>> 13;
      d0 &= 8191;
      let d1 = c + h0 * r1 + h1 * r0 + h2 * (5 * r9) + h3 * (5 * r8) + h4 * (5 * r7);
      c = d1 >>> 13;
      d1 &= 8191;
      d1 += h5 * (5 * r6) + h6 * (5 * r5) + h7 * (5 * r4) + h8 * (5 * r3) + h9 * (5 * r2);
      c += d1 >>> 13;
      d1 &= 8191;
      let d2 = c + h0 * r2 + h1 * r1 + h2 * r0 + h3 * (5 * r9) + h4 * (5 * r8);
      c = d2 >>> 13;
      d2 &= 8191;
      d2 += h5 * (5 * r7) + h6 * (5 * r6) + h7 * (5 * r5) + h8 * (5 * r4) + h9 * (5 * r3);
      c += d2 >>> 13;
      d2 &= 8191;
      let d3 = c + h0 * r3 + h1 * r2 + h2 * r1 + h3 * r0 + h4 * (5 * r9);
      c = d3 >>> 13;
      d3 &= 8191;
      d3 += h5 * (5 * r8) + h6 * (5 * r7) + h7 * (5 * r6) + h8 * (5 * r5) + h9 * (5 * r4);
      c += d3 >>> 13;
      d3 &= 8191;
      let d4 = c + h0 * r4 + h1 * r3 + h2 * r2 + h3 * r1 + h4 * r0;
      c = d4 >>> 13;
      d4 &= 8191;
      d4 += h5 * (5 * r9) + h6 * (5 * r8) + h7 * (5 * r7) + h8 * (5 * r6) + h9 * (5 * r5);
      c += d4 >>> 13;
      d4 &= 8191;
      let d5 = c + h0 * r5 + h1 * r4 + h2 * r3 + h3 * r2 + h4 * r1;
      c = d5 >>> 13;
      d5 &= 8191;
      d5 += h5 * r0 + h6 * (5 * r9) + h7 * (5 * r8) + h8 * (5 * r7) + h9 * (5 * r6);
      c += d5 >>> 13;
      d5 &= 8191;
      let d6 = c + h0 * r6 + h1 * r5 + h2 * r4 + h3 * r3 + h4 * r2;
      c = d6 >>> 13;
      d6 &= 8191;
      d6 += h5 * r1 + h6 * r0 + h7 * (5 * r9) + h8 * (5 * r8) + h9 * (5 * r7);
      c += d6 >>> 13;
      d6 &= 8191;
      let d7 = c + h0 * r7 + h1 * r6 + h2 * r5 + h3 * r4 + h4 * r3;
      c = d7 >>> 13;
      d7 &= 8191;
      d7 += h5 * r2 + h6 * r1 + h7 * r0 + h8 * (5 * r9) + h9 * (5 * r8);
      c += d7 >>> 13;
      d7 &= 8191;
      let d8 = c + h0 * r8 + h1 * r7 + h2 * r6 + h3 * r5 + h4 * r4;
      c = d8 >>> 13;
      d8 &= 8191;
      d8 += h5 * r3 + h6 * r2 + h7 * r1 + h8 * r0 + h9 * (5 * r9);
      c += d8 >>> 13;
      d8 &= 8191;
      let d9 = c + h0 * r9 + h1 * r8 + h2 * r7 + h3 * r6 + h4 * r5;
      c = d9 >>> 13;
      d9 &= 8191;
      d9 += h5 * r4 + h6 * r3 + h7 * r2 + h8 * r1 + h9 * r0;
      c += d9 >>> 13;
      d9 &= 8191;
      c = (c << 2) + c | 0;
      c = c + d0 | 0;
      d0 = c & 8191;
      c = c >>> 13;
      d1 += c;
      h[0] = d0;
      h[1] = d1;
      h[2] = d2;
      h[3] = d3;
      h[4] = d4;
      h[5] = d5;
      h[6] = d6;
      h[7] = d7;
      h[8] = d8;
      h[9] = d9;
    }
    finalize() {
      const { h, pad } = this;
      const g = new Uint16Array(10);
      let c = h[1] >>> 13;
      h[1] &= 8191;
      for (let i = 2;i < 10; i++) {
        h[i] += c;
        c = h[i] >>> 13;
        h[i] &= 8191;
      }
      h[0] += c * 5;
      c = h[0] >>> 13;
      h[0] &= 8191;
      h[1] += c;
      c = h[1] >>> 13;
      h[1] &= 8191;
      h[2] += c;
      g[0] = h[0] + 5;
      c = g[0] >>> 13;
      g[0] &= 8191;
      for (let i = 1;i < 10; i++) {
        g[i] = h[i] + c;
        c = g[i] >>> 13;
        g[i] &= 8191;
      }
      g[9] -= 1 << 13;
      let mask = (c ^ 1) - 1;
      for (let i = 0;i < 10; i++)
        g[i] &= mask;
      mask = ~mask;
      for (let i = 0;i < 10; i++)
        h[i] = h[i] & mask | g[i];
      h[0] = (h[0] | h[1] << 13) & 65535;
      h[1] = (h[1] >>> 3 | h[2] << 10) & 65535;
      h[2] = (h[2] >>> 6 | h[3] << 7) & 65535;
      h[3] = (h[3] >>> 9 | h[4] << 4) & 65535;
      h[4] = (h[4] >>> 12 | h[5] << 1 | h[6] << 14) & 65535;
      h[5] = (h[6] >>> 2 | h[7] << 11) & 65535;
      h[6] = (h[7] >>> 5 | h[8] << 8) & 65535;
      h[7] = (h[8] >>> 8 | h[9] << 5) & 65535;
      let f = h[0] + pad[0];
      h[0] = f & 65535;
      for (let i = 1;i < 8; i++) {
        f = (h[i] + pad[i] | 0) + (f >>> 16) | 0;
        h[i] = f & 65535;
      }
    }
    update(data) {
      exists3(this);
      const { buffer, blockLen } = this;
      data = toBytes3(data);
      const len = data.length;
      for (let pos = 0;pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          for (;blockLen <= len - pos; pos += blockLen)
            this.process(data, pos);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(buffer, 0, false);
          this.pos = 0;
        }
      }
      return this;
    }
    destroy() {
      this.h.fill(0);
      this.r.fill(0);
      this.buffer.fill(0);
      this.pad.fill(0);
    }
    digestInto(out) {
      exists3(this);
      output3(out, this);
      this.finished = true;
      const { buffer, h } = this;
      let { pos } = this;
      if (pos) {
        buffer[pos++] = 1;
        for (;pos < 16; pos++)
          buffer[pos] = 0;
        this.process(buffer, 0, true);
      }
      this.finalize();
      let opos = 0;
      for (let i = 0;i < 8; i++) {
        out[opos++] = h[i] >>> 0;
        out[opos++] = h[i] >>> 8;
      }
      return out;
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
  }
  function wrapConstructorWithKey2(hashCons) {
    const hashC = (msg, key) => hashCons(key).update(toBytes3(msg)).digest();
    const tmp = hashCons(new Uint8Array(32));
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (key) => hashCons(key);
    return hashC;
  }
  var poly1305 = wrapConstructorWithKey2((key) => new Poly1305(key));

  // ../../node_modules/nostr-tools/node_modules/@noble/ciphers/esm/_arx.js
  var _utf8ToBytes = (str) => Uint8Array.from(str.split("").map((c) => c.charCodeAt(0)));
  var sigma16 = _utf8ToBytes("expand 16-byte k");
  var sigma32 = _utf8ToBytes("expand 32-byte k");
  var sigma16_32 = u32(sigma16);
  var sigma32_32 = u32(sigma32);
  var sigma = sigma32_32.slice();
  function rotl(a, b) {
    return a << b | a >>> 32 - b;
  }
  function isAligned32(b) {
    return b.byteOffset % 4 === 0;
  }
  var BLOCK_LEN = 64;
  var BLOCK_LEN32 = 16;
  var MAX_COUNTER = 2 ** 32 - 1;
  var U32_EMPTY = new Uint32Array;
  function runCipher(core, sigma2, key, nonce, data, output4, counter, rounds) {
    const len = data.length;
    const block = new Uint8Array(BLOCK_LEN);
    const b32 = u32(block);
    const isAligned = isAligned32(data) && isAligned32(output4);
    const d32 = isAligned ? u32(data) : U32_EMPTY;
    const o32 = isAligned ? u32(output4) : U32_EMPTY;
    for (let pos = 0;pos < len; counter++) {
      core(sigma2, key, nonce, b32, counter, rounds);
      if (counter >= MAX_COUNTER)
        throw new Error("arx: counter overflow");
      const take = Math.min(BLOCK_LEN, len - pos);
      if (isAligned && take === BLOCK_LEN) {
        const pos32 = pos / 4;
        if (pos % 4 !== 0)
          throw new Error("arx: invalid block position");
        for (let j = 0, posj;j < BLOCK_LEN32; j++) {
          posj = pos32 + j;
          o32[posj] = d32[posj] ^ b32[j];
        }
        pos += BLOCK_LEN;
        continue;
      }
      for (let j = 0, posj;j < take; j++) {
        posj = pos + j;
        output4[posj] = data[posj] ^ block[j];
      }
      pos += take;
    }
  }
  function createCipher(core, opts) {
    const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds } = checkOpts({ allowShortKeys: false, counterLength: 8, counterRight: false, rounds: 20 }, opts);
    if (typeof core !== "function")
      throw new Error("core must be a function");
    number3(counterLength);
    number3(rounds);
    bool2(counterRight);
    bool2(allowShortKeys);
    return (key, nonce, data, output4, counter = 0) => {
      bytes3(key);
      bytes3(nonce);
      bytes3(data);
      const len = data.length;
      if (!output4)
        output4 = new Uint8Array(len);
      bytes3(output4);
      number3(counter);
      if (counter < 0 || counter >= MAX_COUNTER)
        throw new Error("arx: counter overflow");
      if (output4.length < len)
        throw new Error(`arx: output (${output4.length}) is shorter than data (${len})`);
      const toClean = [];
      let l = key.length, k, sigma2;
      if (l === 32) {
        k = key.slice();
        toClean.push(k);
        sigma2 = sigma32_32;
      } else if (l === 16 && allowShortKeys) {
        k = new Uint8Array(32);
        k.set(key);
        k.set(key, 16);
        sigma2 = sigma16_32;
        toClean.push(k);
      } else {
        throw new Error(`arx: invalid 32-byte key, got length=${l}`);
      }
      if (!isAligned32(nonce)) {
        nonce = nonce.slice();
        toClean.push(nonce);
      }
      const k32 = u32(k);
      if (extendNonceFn) {
        if (nonce.length !== 24)
          throw new Error(`arx: extended nonce must be 24 bytes`);
        extendNonceFn(sigma2, k32, u32(nonce.subarray(0, 16)), k32);
        nonce = nonce.subarray(16);
      }
      const nonceNcLen = 16 - counterLength;
      if (nonceNcLen !== nonce.length)
        throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`);
      if (nonceNcLen !== 12) {
        const nc = new Uint8Array(12);
        nc.set(nonce, counterRight ? 0 : 12 - nonce.length);
        nonce = nc;
        toClean.push(nonce);
      }
      const n32 = u32(nonce);
      runCipher(core, sigma2, k32, n32, data, output4, counter, rounds);
      while (toClean.length > 0)
        toClean.pop().fill(0);
      return output4;
    };
  }

  // ../../node_modules/nostr-tools/node_modules/@noble/ciphers/esm/chacha.js
  function chachaCore(s, k, n, out, cnt, rounds = 20) {
    let y00 = s[0], y01 = s[1], y02 = s[2], y03 = s[3], y04 = k[0], y05 = k[1], y06 = k[2], y07 = k[3], y08 = k[4], y09 = k[5], y10 = k[6], y11 = k[7], y12 = cnt, y13 = n[0], y14 = n[1], y15 = n[2];
    let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
    for (let r = 0;r < rounds; r += 2) {
      x00 = x00 + x04 | 0;
      x12 = rotl(x12 ^ x00, 16);
      x08 = x08 + x12 | 0;
      x04 = rotl(x04 ^ x08, 12);
      x00 = x00 + x04 | 0;
      x12 = rotl(x12 ^ x00, 8);
      x08 = x08 + x12 | 0;
      x04 = rotl(x04 ^ x08, 7);
      x01 = x01 + x05 | 0;
      x13 = rotl(x13 ^ x01, 16);
      x09 = x09 + x13 | 0;
      x05 = rotl(x05 ^ x09, 12);
      x01 = x01 + x05 | 0;
      x13 = rotl(x13 ^ x01, 8);
      x09 = x09 + x13 | 0;
      x05 = rotl(x05 ^ x09, 7);
      x02 = x02 + x06 | 0;
      x14 = rotl(x14 ^ x02, 16);
      x10 = x10 + x14 | 0;
      x06 = rotl(x06 ^ x10, 12);
      x02 = x02 + x06 | 0;
      x14 = rotl(x14 ^ x02, 8);
      x10 = x10 + x14 | 0;
      x06 = rotl(x06 ^ x10, 7);
      x03 = x03 + x07 | 0;
      x15 = rotl(x15 ^ x03, 16);
      x11 = x11 + x15 | 0;
      x07 = rotl(x07 ^ x11, 12);
      x03 = x03 + x07 | 0;
      x15 = rotl(x15 ^ x03, 8);
      x11 = x11 + x15 | 0;
      x07 = rotl(x07 ^ x11, 7);
      x00 = x00 + x05 | 0;
      x15 = rotl(x15 ^ x00, 16);
      x10 = x10 + x15 | 0;
      x05 = rotl(x05 ^ x10, 12);
      x00 = x00 + x05 | 0;
      x15 = rotl(x15 ^ x00, 8);
      x10 = x10 + x15 | 0;
      x05 = rotl(x05 ^ x10, 7);
      x01 = x01 + x06 | 0;
      x12 = rotl(x12 ^ x01, 16);
      x11 = x11 + x12 | 0;
      x06 = rotl(x06 ^ x11, 12);
      x01 = x01 + x06 | 0;
      x12 = rotl(x12 ^ x01, 8);
      x11 = x11 + x12 | 0;
      x06 = rotl(x06 ^ x11, 7);
      x02 = x02 + x07 | 0;
      x13 = rotl(x13 ^ x02, 16);
      x08 = x08 + x13 | 0;
      x07 = rotl(x07 ^ x08, 12);
      x02 = x02 + x07 | 0;
      x13 = rotl(x13 ^ x02, 8);
      x08 = x08 + x13 | 0;
      x07 = rotl(x07 ^ x08, 7);
      x03 = x03 + x04 | 0;
      x14 = rotl(x14 ^ x03, 16);
      x09 = x09 + x14 | 0;
      x04 = rotl(x04 ^ x09, 12);
      x03 = x03 + x04 | 0;
      x14 = rotl(x14 ^ x03, 8);
      x09 = x09 + x14 | 0;
      x04 = rotl(x04 ^ x09, 7);
    }
    let oi = 0;
    out[oi++] = y00 + x00 | 0;
    out[oi++] = y01 + x01 | 0;
    out[oi++] = y02 + x02 | 0;
    out[oi++] = y03 + x03 | 0;
    out[oi++] = y04 + x04 | 0;
    out[oi++] = y05 + x05 | 0;
    out[oi++] = y06 + x06 | 0;
    out[oi++] = y07 + x07 | 0;
    out[oi++] = y08 + x08 | 0;
    out[oi++] = y09 + x09 | 0;
    out[oi++] = y10 + x10 | 0;
    out[oi++] = y11 + x11 | 0;
    out[oi++] = y12 + x12 | 0;
    out[oi++] = y13 + x13 | 0;
    out[oi++] = y14 + x14 | 0;
    out[oi++] = y15 + x15 | 0;
  }
  function hchacha(s, k, i, o32) {
    let x00 = s[0], x01 = s[1], x02 = s[2], x03 = s[3], x04 = k[0], x05 = k[1], x06 = k[2], x07 = k[3], x08 = k[4], x09 = k[5], x10 = k[6], x11 = k[7], x12 = i[0], x13 = i[1], x14 = i[2], x15 = i[3];
    for (let r = 0;r < 20; r += 2) {
      x00 = x00 + x04 | 0;
      x12 = rotl(x12 ^ x00, 16);
      x08 = x08 + x12 | 0;
      x04 = rotl(x04 ^ x08, 12);
      x00 = x00 + x04 | 0;
      x12 = rotl(x12 ^ x00, 8);
      x08 = x08 + x12 | 0;
      x04 = rotl(x04 ^ x08, 7);
      x01 = x01 + x05 | 0;
      x13 = rotl(x13 ^ x01, 16);
      x09 = x09 + x13 | 0;
      x05 = rotl(x05 ^ x09, 12);
      x01 = x01 + x05 | 0;
      x13 = rotl(x13 ^ x01, 8);
      x09 = x09 + x13 | 0;
      x05 = rotl(x05 ^ x09, 7);
      x02 = x02 + x06 | 0;
      x14 = rotl(x14 ^ x02, 16);
      x10 = x10 + x14 | 0;
      x06 = rotl(x06 ^ x10, 12);
      x02 = x02 + x06 | 0;
      x14 = rotl(x14 ^ x02, 8);
      x10 = x10 + x14 | 0;
      x06 = rotl(x06 ^ x10, 7);
      x03 = x03 + x07 | 0;
      x15 = rotl(x15 ^ x03, 16);
      x11 = x11 + x15 | 0;
      x07 = rotl(x07 ^ x11, 12);
      x03 = x03 + x07 | 0;
      x15 = rotl(x15 ^ x03, 8);
      x11 = x11 + x15 | 0;
      x07 = rotl(x07 ^ x11, 7);
      x00 = x00 + x05 | 0;
      x15 = rotl(x15 ^ x00, 16);
      x10 = x10 + x15 | 0;
      x05 = rotl(x05 ^ x10, 12);
      x00 = x00 + x05 | 0;
      x15 = rotl(x15 ^ x00, 8);
      x10 = x10 + x15 | 0;
      x05 = rotl(x05 ^ x10, 7);
      x01 = x01 + x06 | 0;
      x12 = rotl(x12 ^ x01, 16);
      x11 = x11 + x12 | 0;
      x06 = rotl(x06 ^ x11, 12);
      x01 = x01 + x06 | 0;
      x12 = rotl(x12 ^ x01, 8);
      x11 = x11 + x12 | 0;
      x06 = rotl(x06 ^ x11, 7);
      x02 = x02 + x07 | 0;
      x13 = rotl(x13 ^ x02, 16);
      x08 = x08 + x13 | 0;
      x07 = rotl(x07 ^ x08, 12);
      x02 = x02 + x07 | 0;
      x13 = rotl(x13 ^ x02, 8);
      x08 = x08 + x13 | 0;
      x07 = rotl(x07 ^ x08, 7);
      x03 = x03 + x04 | 0;
      x14 = rotl(x14 ^ x03, 16);
      x09 = x09 + x14 | 0;
      x04 = rotl(x04 ^ x09, 12);
      x03 = x03 + x04 | 0;
      x14 = rotl(x14 ^ x03, 8);
      x09 = x09 + x14 | 0;
      x04 = rotl(x04 ^ x09, 7);
    }
    let oi = 0;
    o32[oi++] = x00;
    o32[oi++] = x01;
    o32[oi++] = x02;
    o32[oi++] = x03;
    o32[oi++] = x12;
    o32[oi++] = x13;
    o32[oi++] = x14;
    o32[oi++] = x15;
  }
  var chacha20 = /* @__PURE__ */ createCipher(chachaCore, {
    counterRight: false,
    counterLength: 4,
    allowShortKeys: false
  });
  var xchacha20 = /* @__PURE__ */ createCipher(chachaCore, {
    counterRight: false,
    counterLength: 8,
    extendNonceFn: hchacha,
    allowShortKeys: false
  });
  var ZEROS162 = /* @__PURE__ */ new Uint8Array(16);
  var updatePadded = (h, msg) => {
    h.update(msg);
    const left = msg.length % 16;
    if (left)
      h.update(ZEROS162.subarray(left));
  };
  var ZEROS322 = /* @__PURE__ */ new Uint8Array(32);
  function computeTag2(fn, key, nonce, data, AAD) {
    const authKey = fn(key, nonce, ZEROS322);
    const h = poly1305.create(authKey);
    if (AAD)
      updatePadded(h, AAD);
    updatePadded(h, data);
    const num = new Uint8Array(16);
    const view = createView3(num);
    setBigUint643(view, 0, BigInt(AAD ? AAD.length : 0), true);
    setBigUint643(view, 8, BigInt(data.length), true);
    h.update(num);
    const res = h.digest();
    authKey.fill(0);
    return res;
  }
  var _poly1305_aead = (xorStream) => (key, nonce, AAD) => {
    const tagLength = 16;
    bytes3(key, 32);
    bytes3(nonce);
    return {
      encrypt: (plaintext, output4) => {
        const plength = plaintext.length;
        const clength = plength + tagLength;
        if (output4) {
          bytes3(output4, clength);
        } else {
          output4 = new Uint8Array(clength);
        }
        xorStream(key, nonce, plaintext, output4, 1);
        const tag = computeTag2(xorStream, key, nonce, output4.subarray(0, -tagLength), AAD);
        output4.set(tag, plength);
        return output4;
      },
      decrypt: (ciphertext, output4) => {
        const clength = ciphertext.length;
        const plength = clength - tagLength;
        if (clength < tagLength)
          throw new Error(`encrypted data must be at least ${tagLength} bytes`);
        if (output4) {
          bytes3(output4, plength);
        } else {
          output4 = new Uint8Array(plength);
        }
        const data = ciphertext.subarray(0, -tagLength);
        const passedTag = ciphertext.subarray(-tagLength);
        const tag = computeTag2(xorStream, key, nonce, data, AAD);
        if (!equalBytes2(passedTag, tag))
          throw new Error("invalid tag");
        xorStream(key, nonce, data, output4, 1);
        return output4;
      }
    };
  };
  var chacha20poly1305 = /* @__PURE__ */ wrapCipher({ blockSize: 64, nonceLength: 12, tagLength: 16 }, _poly1305_aead(chacha20));
  var xchacha20poly1305 = /* @__PURE__ */ wrapCipher({ blockSize: 64, nonceLength: 24, tagLength: 16 }, _poly1305_aead(xchacha20));

  // ../../node_modules/@noble/hashes/esm/hmac.js
  class HMAC2 extends Hash2 {
    constructor(hash3, _key) {
      super();
      this.finished = false;
      this.destroyed = false;
      _assert_default.hash(hash3);
      const key = toBytes2(_key);
      this.iHash = hash3.create();
      if (typeof this.iHash.update !== "function")
        throw new Error("Expected instance of class which extends utils.Hash");
      this.blockLen = this.iHash.blockLen;
      this.outputLen = this.iHash.outputLen;
      const blockLen = this.blockLen;
      const pad = new Uint8Array(blockLen);
      pad.set(key.length > blockLen ? hash3.create().update(key).digest() : key);
      for (let i = 0;i < pad.length; i++)
        pad[i] ^= 54;
      this.iHash.update(pad);
      this.oHash = hash3.create();
      for (let i = 0;i < pad.length; i++)
        pad[i] ^= 54 ^ 92;
      this.oHash.update(pad);
      pad.fill(0);
    }
    update(buf) {
      _assert_default.exists(this);
      this.iHash.update(buf);
      return this;
    }
    digestInto(out) {
      _assert_default.exists(this);
      _assert_default.bytes(out, this.outputLen);
      this.finished = true;
      this.iHash.digestInto(out);
      this.oHash.update(out);
      this.oHash.digestInto(out);
      this.destroy();
    }
    digest() {
      const out = new Uint8Array(this.oHash.outputLen);
      this.digestInto(out);
      return out;
    }
    _cloneInto(to) {
      to || (to = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
      to = to;
      to.finished = finished;
      to.destroyed = destroyed;
      to.blockLen = blockLen;
      to.outputLen = outputLen;
      to.oHash = oHash._cloneInto(to.oHash);
      to.iHash = iHash._cloneInto(to.iHash);
      return to;
    }
    destroy() {
      this.destroyed = true;
      this.oHash.destroy();
      this.iHash.destroy();
    }
  }
  var hmac2 = (hash3, key, message) => new HMAC2(hash3, key).update(message).digest();
  hmac2.create = (hash3, key) => new HMAC2(hash3, key);

  // ../../node_modules/@noble/hashes/esm/hkdf.js
  function extract(hash3, ikm, salt) {
    _assert_default.hash(hash3);
    if (salt === undefined)
      salt = new Uint8Array(hash3.outputLen);
    return hmac2(hash3, toBytes2(salt), toBytes2(ikm));
  }
  var HKDF_COUNTER = new Uint8Array([0]);
  var EMPTY_BUFFER = new Uint8Array;
  function expand(hash3, prk, info, length = 32) {
    _assert_default.hash(hash3);
    _assert_default.number(length);
    if (length > 255 * hash3.outputLen)
      throw new Error("Length should be <= 255*HashLen");
    const blocks = Math.ceil(length / hash3.outputLen);
    if (info === undefined)
      info = EMPTY_BUFFER;
    const okm = new Uint8Array(blocks * hash3.outputLen);
    const HMAC3 = hmac2.create(hash3, prk);
    const HMACTmp = HMAC3._cloneInto();
    const T = new Uint8Array(HMAC3.outputLen);
    for (let counter = 0;counter < blocks; counter++) {
      HKDF_COUNTER[0] = counter + 1;
      HMACTmp.update(counter === 0 ? EMPTY_BUFFER : T).update(info).update(HKDF_COUNTER).digestInto(T);
      okm.set(T, hash3.outputLen * counter);
      HMAC3._cloneInto(HMACTmp);
    }
    HMAC3.destroy();
    HMACTmp.destroy();
    T.fill(0);
    HKDF_COUNTER.fill(0);
    return okm.slice(0, length);
  }

  // ../../node_modules/nostr-tools/lib/esm/index.js
  var __defProp2 = Object.defineProperty;
  var __export2 = (target, all) => {
    for (var name in all)
      __defProp2(target, name, { get: all[name], enumerable: true });
  };
  var verifiedSymbol = Symbol("verified");
  var isRecord = (obj) => obj instanceof Object;
  function validateEvent(event) {
    if (!isRecord(event))
      return false;
    if (typeof event.kind !== "number")
      return false;
    if (typeof event.content !== "string")
      return false;
    if (typeof event.created_at !== "number")
      return false;
    if (typeof event.pubkey !== "string")
      return false;
    if (!event.pubkey.match(/^[a-f0-9]{64}$/))
      return false;
    if (!Array.isArray(event.tags))
      return false;
    for (let i2 = 0;i2 < event.tags.length; i2++) {
      let tag = event.tags[i2];
      if (!Array.isArray(tag))
        return false;
      for (let j = 0;j < tag.length; j++) {
        if (typeof tag[j] !== "string")
          return false;
      }
    }
    return true;
  }
  var utils_exports = {};
  __export2(utils_exports, {
    Queue: () => Queue,
    QueueNode: () => QueueNode,
    binarySearch: () => binarySearch,
    bytesToHex: () => bytesToHex2,
    hexToBytes: () => hexToBytes2,
    insertEventIntoAscendingList: () => insertEventIntoAscendingList,
    insertEventIntoDescendingList: () => insertEventIntoDescendingList,
    normalizeURL: () => normalizeURL,
    utf8Decoder: () => utf8Decoder,
    utf8Encoder: () => utf8Encoder
  });
  var utf8Decoder = new TextDecoder("utf-8");
  var utf8Encoder = new TextEncoder;
  function normalizeURL(url) {
    try {
      if (url.indexOf("://") === -1)
        url = "wss://" + url;
      let p = new URL(url);
      if (p.protocol === "http:")
        p.protocol = "ws:";
      else if (p.protocol === "https:")
        p.protocol = "wss:";
      p.pathname = p.pathname.replace(/\/+/g, "/");
      if (p.pathname.endsWith("/"))
        p.pathname = p.pathname.slice(0, -1);
      if (p.port === "80" && p.protocol === "ws:" || p.port === "443" && p.protocol === "wss:")
        p.port = "";
      p.searchParams.sort();
      p.hash = "";
      return p.toString();
    } catch (e) {
      throw new Error(`Invalid URL: ${url}`);
    }
  }
  function insertEventIntoDescendingList(sortedArray, event) {
    const [idx, found] = binarySearch(sortedArray, (b) => {
      if (event.id === b.id)
        return 0;
      if (event.created_at === b.created_at)
        return -1;
      return b.created_at - event.created_at;
    });
    if (!found) {
      sortedArray.splice(idx, 0, event);
    }
    return sortedArray;
  }
  function insertEventIntoAscendingList(sortedArray, event) {
    const [idx, found] = binarySearch(sortedArray, (b) => {
      if (event.id === b.id)
        return 0;
      if (event.created_at === b.created_at)
        return -1;
      return event.created_at - b.created_at;
    });
    if (!found) {
      sortedArray.splice(idx, 0, event);
    }
    return sortedArray;
  }
  function binarySearch(arr, compare) {
    let start = 0;
    let end = arr.length - 1;
    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      const cmp = compare(arr[mid]);
      if (cmp === 0) {
        return [mid, true];
      }
      if (cmp < 0) {
        end = mid - 1;
      } else {
        start = mid + 1;
      }
    }
    return [start, false];
  }
  var QueueNode = class {
    value;
    next = null;
    prev = null;
    constructor(message) {
      this.value = message;
    }
  };
  var Queue = class {
    first;
    last;
    constructor() {
      this.first = null;
      this.last = null;
    }
    enqueue(value) {
      const newNode = new QueueNode(value);
      if (!this.last) {
        this.first = newNode;
        this.last = newNode;
      } else if (this.last === this.first) {
        this.last = newNode;
        this.last.prev = this.first;
        this.first.next = newNode;
      } else {
        newNode.prev = this.last;
        this.last.next = newNode;
        this.last = newNode;
      }
      return true;
    }
    dequeue() {
      if (!this.first)
        return null;
      if (this.first === this.last) {
        const target2 = this.first;
        this.first = null;
        this.last = null;
        return target2.value;
      }
      const target = this.first;
      this.first = target.next;
      if (this.first) {
        this.first.prev = null;
      }
      return target.value;
    }
  };
  var JS = class {
    generateSecretKey() {
      return schnorr.utils.randomPrivateKey();
    }
    getPublicKey(secretKey) {
      return bytesToHex2(schnorr.getPublicKey(secretKey));
    }
    finalizeEvent(t, secretKey) {
      const event = t;
      event.pubkey = bytesToHex2(schnorr.getPublicKey(secretKey));
      event.id = getEventHash(event);
      event.sig = bytesToHex2(schnorr.sign(getEventHash(event), secretKey));
      event[verifiedSymbol] = true;
      return event;
    }
    verifyEvent(event) {
      if (typeof event[verifiedSymbol] === "boolean")
        return event[verifiedSymbol];
      const hash3 = getEventHash(event);
      if (hash3 !== event.id) {
        event[verifiedSymbol] = false;
        return false;
      }
      try {
        const valid = schnorr.verify(event.sig, hash3, event.pubkey);
        event[verifiedSymbol] = valid;
        return valid;
      } catch (err) {
        event[verifiedSymbol] = false;
        return false;
      }
    }
  };
  function serializeEvent(evt) {
    if (!validateEvent(evt))
      throw new Error("can't serialize event with wrong or missing properties");
    return JSON.stringify([0, evt.pubkey, evt.created_at, evt.kind, evt.tags, evt.content]);
  }
  function getEventHash(event) {
    let eventHash = sha2562(utf8Encoder.encode(serializeEvent(event)));
    return bytesToHex2(eventHash);
  }
  var i = new JS;
  var generateSecretKey = i.generateSecretKey;
  var getPublicKey = i.getPublicKey;
  var finalizeEvent = i.finalizeEvent;
  var verifyEvent = i.verifyEvent;
  var kinds_exports = {};
  __export2(kinds_exports, {
    Application: () => Application,
    BadgeAward: () => BadgeAward,
    BadgeDefinition: () => BadgeDefinition,
    BlockedRelaysList: () => BlockedRelaysList,
    BlossomServerList: () => BlossomServerList,
    BookmarkList: () => BookmarkList,
    Bookmarksets: () => Bookmarksets,
    Calendar: () => Calendar,
    CalendarEventRSVP: () => CalendarEventRSVP,
    ChannelCreation: () => ChannelCreation,
    ChannelHideMessage: () => ChannelHideMessage,
    ChannelMessage: () => ChannelMessage,
    ChannelMetadata: () => ChannelMetadata,
    ChannelMuteUser: () => ChannelMuteUser,
    ChatMessage: () => ChatMessage,
    ClassifiedListing: () => ClassifiedListing,
    ClientAuth: () => ClientAuth,
    Comment: () => Comment,
    CommunitiesList: () => CommunitiesList,
    CommunityDefinition: () => CommunityDefinition,
    CommunityPostApproval: () => CommunityPostApproval,
    Contacts: () => Contacts,
    CreateOrUpdateProduct: () => CreateOrUpdateProduct,
    CreateOrUpdateStall: () => CreateOrUpdateStall,
    Curationsets: () => Curationsets,
    Date: () => Date2,
    DirectMessageRelaysList: () => DirectMessageRelaysList,
    DraftClassifiedListing: () => DraftClassifiedListing,
    DraftLong: () => DraftLong,
    Emojisets: () => Emojisets,
    EncryptedDirectMessage: () => EncryptedDirectMessage,
    EventDeletion: () => EventDeletion,
    FavoriteRelays: () => FavoriteRelays,
    FileMessage: () => FileMessage,
    FileMetadata: () => FileMetadata,
    FileServerPreference: () => FileServerPreference,
    Followsets: () => Followsets,
    ForumThread: () => ForumThread,
    GenericRepost: () => GenericRepost,
    Genericlists: () => Genericlists,
    GiftWrap: () => GiftWrap,
    GroupMetadata: () => GroupMetadata,
    HTTPAuth: () => HTTPAuth,
    Handlerinformation: () => Handlerinformation,
    Handlerrecommendation: () => Handlerrecommendation,
    Highlights: () => Highlights,
    InterestsList: () => InterestsList,
    Interestsets: () => Interestsets,
    JobFeedback: () => JobFeedback,
    JobRequest: () => JobRequest,
    JobResult: () => JobResult,
    Label: () => Label,
    LightningPubRPC: () => LightningPubRPC,
    LiveChatMessage: () => LiveChatMessage,
    LiveEvent: () => LiveEvent,
    LongFormArticle: () => LongFormArticle,
    Metadata: () => Metadata,
    Mutelist: () => Mutelist,
    NWCWalletInfo: () => NWCWalletInfo,
    NWCWalletRequest: () => NWCWalletRequest,
    NWCWalletResponse: () => NWCWalletResponse,
    NormalVideo: () => NormalVideo,
    NostrConnect: () => NostrConnect,
    OpenTimestamps: () => OpenTimestamps,
    Photo: () => Photo,
    Pinlist: () => Pinlist,
    Poll: () => Poll,
    PollResponse: () => PollResponse,
    PrivateDirectMessage: () => PrivateDirectMessage,
    ProblemTracker: () => ProblemTracker,
    ProfileBadges: () => ProfileBadges,
    PublicChatsList: () => PublicChatsList,
    Reaction: () => Reaction,
    RecommendRelay: () => RecommendRelay,
    RelayList: () => RelayList,
    RelayReview: () => RelayReview,
    Relaysets: () => Relaysets,
    Report: () => Report,
    Reporting: () => Reporting,
    Repost: () => Repost,
    Seal: () => Seal,
    SearchRelaysList: () => SearchRelaysList,
    ShortTextNote: () => ShortTextNote,
    ShortVideo: () => ShortVideo,
    Time: () => Time,
    UserEmojiList: () => UserEmojiList,
    UserStatuses: () => UserStatuses,
    Voice: () => Voice,
    VoiceComment: () => VoiceComment,
    Zap: () => Zap,
    ZapGoal: () => ZapGoal,
    ZapRequest: () => ZapRequest,
    classifyKind: () => classifyKind,
    isAddressableKind: () => isAddressableKind,
    isEphemeralKind: () => isEphemeralKind,
    isKind: () => isKind,
    isRegularKind: () => isRegularKind,
    isReplaceableKind: () => isReplaceableKind
  });
  function isRegularKind(kind) {
    return kind < 1e4 && kind !== 0 && kind !== 3;
  }
  function isReplaceableKind(kind) {
    return kind === 0 || kind === 3 || 1e4 <= kind && kind < 20000;
  }
  function isEphemeralKind(kind) {
    return 20000 <= kind && kind < 30000;
  }
  function isAddressableKind(kind) {
    return 30000 <= kind && kind < 40000;
  }
  function classifyKind(kind) {
    if (isRegularKind(kind))
      return "regular";
    if (isReplaceableKind(kind))
      return "replaceable";
    if (isEphemeralKind(kind))
      return "ephemeral";
    if (isAddressableKind(kind))
      return "parameterized";
    return "unknown";
  }
  function isKind(event, kind) {
    const kindAsArray = kind instanceof Array ? kind : [kind];
    return validateEvent(event) && kindAsArray.includes(event.kind) || false;
  }
  var Metadata = 0;
  var ShortTextNote = 1;
  var RecommendRelay = 2;
  var Contacts = 3;
  var EncryptedDirectMessage = 4;
  var EventDeletion = 5;
  var Repost = 6;
  var Reaction = 7;
  var BadgeAward = 8;
  var ChatMessage = 9;
  var ForumThread = 11;
  var Seal = 13;
  var PrivateDirectMessage = 14;
  var FileMessage = 15;
  var GenericRepost = 16;
  var Photo = 20;
  var NormalVideo = 21;
  var ShortVideo = 22;
  var ChannelCreation = 40;
  var ChannelMetadata = 41;
  var ChannelMessage = 42;
  var ChannelHideMessage = 43;
  var ChannelMuteUser = 44;
  var OpenTimestamps = 1040;
  var GiftWrap = 1059;
  var Poll = 1068;
  var FileMetadata = 1063;
  var Comment = 1111;
  var LiveChatMessage = 1311;
  var Voice = 1222;
  var VoiceComment = 1244;
  var ProblemTracker = 1971;
  var Report = 1984;
  var Reporting = 1984;
  var Label = 1985;
  var CommunityPostApproval = 4550;
  var JobRequest = 5999;
  var JobResult = 6999;
  var JobFeedback = 7000;
  var ZapGoal = 9041;
  var ZapRequest = 9734;
  var Zap = 9735;
  var Highlights = 9802;
  var PollResponse = 1018;
  var Mutelist = 1e4;
  var Pinlist = 10001;
  var RelayList = 10002;
  var BookmarkList = 10003;
  var CommunitiesList = 10004;
  var PublicChatsList = 10005;
  var BlockedRelaysList = 10006;
  var SearchRelaysList = 10007;
  var FavoriteRelays = 10012;
  var InterestsList = 10015;
  var UserEmojiList = 10030;
  var DirectMessageRelaysList = 10050;
  var FileServerPreference = 10096;
  var BlossomServerList = 10063;
  var NWCWalletInfo = 13194;
  var LightningPubRPC = 21000;
  var ClientAuth = 22242;
  var NWCWalletRequest = 23194;
  var NWCWalletResponse = 23195;
  var NostrConnect = 24133;
  var HTTPAuth = 27235;
  var Followsets = 30000;
  var Genericlists = 30001;
  var Relaysets = 30002;
  var Bookmarksets = 30003;
  var Curationsets = 30004;
  var ProfileBadges = 30008;
  var BadgeDefinition = 30009;
  var Interestsets = 30015;
  var CreateOrUpdateStall = 30017;
  var CreateOrUpdateProduct = 30018;
  var LongFormArticle = 30023;
  var DraftLong = 30024;
  var Emojisets = 30030;
  var Application = 30078;
  var LiveEvent = 30311;
  var UserStatuses = 30315;
  var ClassifiedListing = 30402;
  var DraftClassifiedListing = 30403;
  var Date2 = 31922;
  var Time = 31923;
  var Calendar = 31924;
  var CalendarEventRSVP = 31925;
  var RelayReview = 31987;
  var Handlerrecommendation = 31989;
  var Handlerinformation = 31990;
  var CommunityDefinition = 34550;
  var GroupMetadata = 39000;
  function matchFilter(filter, event) {
    if (filter.ids && filter.ids.indexOf(event.id) === -1) {
      return false;
    }
    if (filter.kinds && filter.kinds.indexOf(event.kind) === -1) {
      return false;
    }
    if (filter.authors && filter.authors.indexOf(event.pubkey) === -1) {
      return false;
    }
    for (let f in filter) {
      if (f[0] === "#") {
        let tagName = f.slice(1);
        let values = filter[`#${tagName}`];
        if (values && !event.tags.find(([t, v]) => t === f.slice(1) && values.indexOf(v) !== -1))
          return false;
      }
    }
    if (filter.since && event.created_at < filter.since)
      return false;
    if (filter.until && event.created_at > filter.until)
      return false;
    return true;
  }
  function matchFilters(filters, event) {
    for (let i2 = 0;i2 < filters.length; i2++) {
      if (matchFilter(filters[i2], event)) {
        return true;
      }
    }
    return false;
  }
  var fakejson_exports = {};
  __export2(fakejson_exports, {
    getHex64: () => getHex64,
    getInt: () => getInt,
    getSubscriptionId: () => getSubscriptionId,
    matchEventId: () => matchEventId,
    matchEventKind: () => matchEventKind,
    matchEventPubkey: () => matchEventPubkey
  });
  function getHex64(json, field) {
    let len = field.length + 3;
    let idx = json.indexOf(`"${field}":`) + len;
    let s = json.slice(idx).indexOf(`"`) + idx + 1;
    return json.slice(s, s + 64);
  }
  function getInt(json, field) {
    let len = field.length;
    let idx = json.indexOf(`"${field}":`) + len + 3;
    let sliced = json.slice(idx);
    let end = Math.min(sliced.indexOf(","), sliced.indexOf("}"));
    return parseInt(sliced.slice(0, end), 10);
  }
  function getSubscriptionId(json) {
    let idx = json.slice(0, 22).indexOf(`"EVENT"`);
    if (idx === -1)
      return null;
    let pstart = json.slice(idx + 7 + 1).indexOf(`"`);
    if (pstart === -1)
      return null;
    let start = idx + 7 + 1 + pstart;
    let pend = json.slice(start + 1, 80).indexOf(`"`);
    if (pend === -1)
      return null;
    let end = start + 1 + pend;
    return json.slice(start + 1, end);
  }
  function matchEventId(json, id) {
    return id === getHex64(json, "id");
  }
  function matchEventPubkey(json, pubkey) {
    return pubkey === getHex64(json, "pubkey");
  }
  function matchEventKind(json, kind) {
    return kind === getInt(json, "kind");
  }
  var nip42_exports = {};
  __export2(nip42_exports, {
    makeAuthEvent: () => makeAuthEvent
  });
  function makeAuthEvent(relayURL, challenge2) {
    return {
      kind: ClientAuth,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["relay", relayURL],
        ["challenge", challenge2]
      ],
      content: ""
    };
  }
  async function yieldThread() {
    return new Promise((resolve, reject) => {
      try {
        if (typeof MessageChannel !== "undefined") {
          const ch = new MessageChannel;
          const handler = () => {
            ch.port1.removeEventListener("message", handler);
            resolve();
          };
          ch.port1.addEventListener("message", handler);
          ch.port2.postMessage(0);
          ch.port1.start();
        } else {
          if (typeof setImmediate !== "undefined") {
            setImmediate(resolve);
          } else if (typeof setTimeout !== "undefined") {
            setTimeout(resolve, 0);
          } else {
            resolve();
          }
        }
      } catch (e) {
        console.error("during yield: ", e);
        reject(e);
      }
    });
  }
  var alwaysTrue = (t) => {
    t[verifiedSymbol] = true;
    return true;
  };
  var SendingOnClosedConnection = class extends Error {
    constructor(message, relay) {
      super(`Tried to send message '${message} on a closed connection to ${relay}.`);
      this.name = "SendingOnClosedConnection";
    }
  };
  var AbstractRelay = class {
    url;
    _connected = false;
    onclose = null;
    onnotice = (msg) => console.debug(`NOTICE from ${this.url}: ${msg}`);
    onauth;
    baseEoseTimeout = 4400;
    connectionTimeout = 4400;
    publishTimeout = 4400;
    pingFrequency = 29000;
    pingTimeout = 20000;
    resubscribeBackoff = [1e4, 1e4, 1e4, 20000, 20000, 30000, 60000];
    openSubs = /* @__PURE__ */ new Map;
    enablePing;
    enableReconnect;
    connectionTimeoutHandle;
    reconnectTimeoutHandle;
    pingIntervalHandle;
    reconnectAttempts = 0;
    closedIntentionally = false;
    connectionPromise;
    openCountRequests = /* @__PURE__ */ new Map;
    openEventPublishes = /* @__PURE__ */ new Map;
    ws;
    incomingMessageQueue = new Queue;
    queueRunning = false;
    challenge;
    authPromise;
    serial = 0;
    verifyEvent;
    _WebSocket;
    constructor(url, opts) {
      this.url = normalizeURL(url);
      this.verifyEvent = opts.verifyEvent;
      this._WebSocket = opts.websocketImplementation || WebSocket;
      this.enablePing = opts.enablePing;
      this.enableReconnect = opts.enableReconnect || false;
    }
    static async connect(url, opts) {
      const relay = new AbstractRelay(url, opts);
      await relay.connect();
      return relay;
    }
    closeAllSubscriptions(reason) {
      for (let [_, sub] of this.openSubs) {
        sub.close(reason);
      }
      this.openSubs.clear();
      for (let [_, ep] of this.openEventPublishes) {
        ep.reject(new Error(reason));
      }
      this.openEventPublishes.clear();
      for (let [_, cr] of this.openCountRequests) {
        cr.reject(new Error(reason));
      }
      this.openCountRequests.clear();
    }
    get connected() {
      return this._connected;
    }
    async reconnect() {
      const backoff = this.resubscribeBackoff[Math.min(this.reconnectAttempts, this.resubscribeBackoff.length - 1)];
      this.reconnectAttempts++;
      this.reconnectTimeoutHandle = setTimeout(async () => {
        try {
          await this.connect();
        } catch (err) {}
      }, backoff);
    }
    handleHardClose(reason) {
      if (this.pingIntervalHandle) {
        clearInterval(this.pingIntervalHandle);
        this.pingIntervalHandle = undefined;
      }
      this._connected = false;
      this.connectionPromise = undefined;
      const wasIntentional = this.closedIntentionally;
      this.closedIntentionally = false;
      this.onclose?.();
      if (this.enableReconnect && !wasIntentional) {
        this.reconnect();
      } else {
        this.closeAllSubscriptions(reason);
      }
    }
    async connect() {
      if (this.connectionPromise)
        return this.connectionPromise;
      this.challenge = undefined;
      this.authPromise = undefined;
      this.connectionPromise = new Promise((resolve, reject) => {
        this.connectionTimeoutHandle = setTimeout(() => {
          reject("connection timed out");
          this.connectionPromise = undefined;
          this.onclose?.();
          this.closeAllSubscriptions("relay connection timed out");
        }, this.connectionTimeout);
        try {
          this.ws = new this._WebSocket(this.url);
        } catch (err) {
          clearTimeout(this.connectionTimeoutHandle);
          reject(err);
          return;
        }
        this.ws.onopen = () => {
          if (this.reconnectTimeoutHandle) {
            clearTimeout(this.reconnectTimeoutHandle);
            this.reconnectTimeoutHandle = undefined;
          }
          clearTimeout(this.connectionTimeoutHandle);
          this._connected = true;
          const isReconnection = this.reconnectAttempts > 0;
          this.reconnectAttempts = 0;
          for (const sub of this.openSubs.values()) {
            sub.eosed = false;
            if (isReconnection) {
              for (let f = 0;f < sub.filters.length; f++) {
                if (sub.lastEmitted) {
                  sub.filters[f].since = sub.lastEmitted + 1;
                }
              }
            }
            sub.fire();
          }
          if (this.enablePing) {
            this.pingIntervalHandle = setInterval(() => this.pingpong(), this.pingFrequency);
          }
          resolve();
        };
        this.ws.onerror = (ev) => {
          clearTimeout(this.connectionTimeoutHandle);
          reject(ev.message || "websocket error");
          this.handleHardClose("relay connection errored");
        };
        this.ws.onclose = (ev) => {
          clearTimeout(this.connectionTimeoutHandle);
          reject(ev.message || "websocket closed");
          this.handleHardClose("relay connection closed");
        };
        this.ws.onmessage = this._onmessage.bind(this);
      });
      return this.connectionPromise;
    }
    waitForPingPong() {
      return new Promise((resolve) => {
        this.ws.once("pong", () => resolve(true));
        this.ws.ping();
      });
    }
    waitForDummyReq() {
      return new Promise((resolve, reject) => {
        if (!this.connectionPromise)
          return reject(new Error(`no connection to ${this.url}, can't ping`));
        try {
          const sub = this.subscribe([{ ids: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"], limit: 0 }], {
            label: "forced-ping",
            oneose: () => {
              resolve(true);
              sub.close();
            },
            onclose() {
              resolve(true);
            },
            eoseTimeout: this.pingTimeout + 1000
          });
        } catch (err) {
          reject(err);
        }
      });
    }
    async pingpong() {
      if (this.ws?.readyState === 1) {
        const result = await Promise.any([
          this.ws && this.ws.ping && this.ws.once ? this.waitForPingPong() : this.waitForDummyReq(),
          new Promise((res) => setTimeout(() => res(false), this.pingTimeout))
        ]);
        if (!result) {
          if (this.ws?.readyState === this._WebSocket.OPEN) {
            this.ws?.close();
          }
        }
      }
    }
    async runQueue() {
      this.queueRunning = true;
      while (true) {
        if (this.handleNext() === false) {
          break;
        }
        await yieldThread();
      }
      this.queueRunning = false;
    }
    handleNext() {
      const json = this.incomingMessageQueue.dequeue();
      if (!json) {
        return false;
      }
      const subid = getSubscriptionId(json);
      if (subid) {
        const so = this.openSubs.get(subid);
        if (!so) {
          return;
        }
        const id = getHex64(json, "id");
        const alreadyHave = so.alreadyHaveEvent?.(id);
        so.receivedEvent?.(this, id);
        if (alreadyHave) {
          return;
        }
      }
      try {
        let data = JSON.parse(json);
        switch (data[0]) {
          case "EVENT": {
            const so = this.openSubs.get(data[1]);
            const event = data[2];
            if (this.verifyEvent(event) && matchFilters(so.filters, event)) {
              so.onevent(event);
            }
            if (!so.lastEmitted || so.lastEmitted < event.created_at)
              so.lastEmitted = event.created_at;
            return;
          }
          case "COUNT": {
            const id = data[1];
            const payload = data[2];
            const cr = this.openCountRequests.get(id);
            if (cr) {
              cr.resolve(payload.count);
              this.openCountRequests.delete(id);
            }
            return;
          }
          case "EOSE": {
            const so = this.openSubs.get(data[1]);
            if (!so)
              return;
            so.receivedEose();
            return;
          }
          case "OK": {
            const id = data[1];
            const ok = data[2];
            const reason = data[3];
            const ep = this.openEventPublishes.get(id);
            if (ep) {
              clearTimeout(ep.timeout);
              if (ok)
                ep.resolve(reason);
              else
                ep.reject(new Error(reason));
              this.openEventPublishes.delete(id);
            }
            return;
          }
          case "CLOSED": {
            const id = data[1];
            const so = this.openSubs.get(id);
            if (!so)
              return;
            so.closed = true;
            so.close(data[2]);
            return;
          }
          case "NOTICE": {
            this.onnotice(data[1]);
            return;
          }
          case "AUTH": {
            this.challenge = data[1];
            if (this.onauth) {
              this.auth(this.onauth);
            }
            return;
          }
          default: {
            const so = this.openSubs.get(data[1]);
            so?.oncustom?.(data);
            return;
          }
        }
      } catch (err) {
        return;
      }
    }
    async send(message) {
      if (!this.connectionPromise)
        throw new SendingOnClosedConnection(message, this.url);
      this.connectionPromise.then(() => {
        this.ws?.send(message);
      });
    }
    async auth(signAuthEvent) {
      const challenge2 = this.challenge;
      if (!challenge2)
        throw new Error("can't perform auth, no challenge was received");
      if (this.authPromise)
        return this.authPromise;
      this.authPromise = new Promise(async (resolve, reject) => {
        try {
          let evt = await signAuthEvent(makeAuthEvent(this.url, challenge2));
          let timeout = setTimeout(() => {
            let ep = this.openEventPublishes.get(evt.id);
            if (ep) {
              ep.reject(new Error("auth timed out"));
              this.openEventPublishes.delete(evt.id);
            }
          }, this.publishTimeout);
          this.openEventPublishes.set(evt.id, { resolve, reject, timeout });
          this.send('["AUTH",' + JSON.stringify(evt) + "]");
        } catch (err) {
          console.warn("subscribe auth function failed:", err);
        }
      });
      return this.authPromise;
    }
    async publish(event) {
      const ret = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          const ep = this.openEventPublishes.get(event.id);
          if (ep) {
            ep.reject(new Error("publish timed out"));
            this.openEventPublishes.delete(event.id);
          }
        }, this.publishTimeout);
        this.openEventPublishes.set(event.id, { resolve, reject, timeout });
      });
      this.send('["EVENT",' + JSON.stringify(event) + "]");
      return ret;
    }
    async count(filters, params) {
      this.serial++;
      const id = params?.id || "count:" + this.serial;
      const ret = new Promise((resolve, reject) => {
        this.openCountRequests.set(id, { resolve, reject });
      });
      this.send('["COUNT","' + id + '",' + JSON.stringify(filters).substring(1));
      return ret;
    }
    subscribe(filters, params) {
      const sub = this.prepareSubscription(filters, params);
      sub.fire();
      return sub;
    }
    prepareSubscription(filters, params) {
      this.serial++;
      const id = params.id || (params.label ? params.label + ":" : "sub:") + this.serial;
      const subscription = new Subscription(this, id, filters, params);
      this.openSubs.set(id, subscription);
      return subscription;
    }
    close() {
      this.closedIntentionally = true;
      if (this.reconnectTimeoutHandle) {
        clearTimeout(this.reconnectTimeoutHandle);
        this.reconnectTimeoutHandle = undefined;
      }
      if (this.pingIntervalHandle) {
        clearInterval(this.pingIntervalHandle);
        this.pingIntervalHandle = undefined;
      }
      this.closeAllSubscriptions("relay connection closed by us");
      this._connected = false;
      this.onclose?.();
      if (this.ws?.readyState === this._WebSocket.OPEN) {
        this.ws?.close();
      }
    }
    _onmessage(ev) {
      this.incomingMessageQueue.enqueue(ev.data);
      if (!this.queueRunning) {
        this.runQueue();
      }
    }
  };
  var Subscription = class {
    relay;
    id;
    lastEmitted;
    closed = false;
    eosed = false;
    filters;
    alreadyHaveEvent;
    receivedEvent;
    onevent;
    oneose;
    onclose;
    oncustom;
    eoseTimeout;
    eoseTimeoutHandle;
    constructor(relay, id, filters, params) {
      if (filters.length === 0)
        throw new Error("subscription can't be created with zero filters");
      this.relay = relay;
      this.filters = filters;
      this.id = id;
      this.alreadyHaveEvent = params.alreadyHaveEvent;
      this.receivedEvent = params.receivedEvent;
      this.eoseTimeout = params.eoseTimeout || relay.baseEoseTimeout;
      this.oneose = params.oneose;
      this.onclose = params.onclose;
      this.onevent = params.onevent || ((event) => {
        console.warn(`onevent() callback not defined for subscription '${this.id}' in relay ${this.relay.url}. event received:`, event);
      });
    }
    fire() {
      this.relay.send('["REQ","' + this.id + '",' + JSON.stringify(this.filters).substring(1));
      this.eoseTimeoutHandle = setTimeout(this.receivedEose.bind(this), this.eoseTimeout);
    }
    receivedEose() {
      if (this.eosed)
        return;
      clearTimeout(this.eoseTimeoutHandle);
      this.eosed = true;
      this.oneose?.();
    }
    close(reason = "closed by caller") {
      if (!this.closed && this.relay.connected) {
        try {
          this.relay.send('["CLOSE",' + JSON.stringify(this.id) + "]");
        } catch (err) {
          if (err instanceof SendingOnClosedConnection) {} else {
            throw err;
          }
        }
        this.closed = true;
      }
      this.relay.openSubs.delete(this.id);
      this.onclose?.(reason);
    }
  };
  var _WebSocket;
  try {
    _WebSocket = WebSocket;
  } catch {}
  var AbstractSimplePool = class {
    relays = /* @__PURE__ */ new Map;
    seenOn = /* @__PURE__ */ new Map;
    trackRelays = false;
    verifyEvent;
    enablePing;
    enableReconnect;
    automaticallyAuth;
    trustedRelayURLs = /* @__PURE__ */ new Set;
    _WebSocket;
    constructor(opts) {
      this.verifyEvent = opts.verifyEvent;
      this._WebSocket = opts.websocketImplementation;
      this.enablePing = opts.enablePing;
      this.enableReconnect = opts.enableReconnect || false;
      this.automaticallyAuth = opts.automaticallyAuth;
    }
    async ensureRelay(url, params) {
      url = normalizeURL(url);
      let relay = this.relays.get(url);
      if (!relay) {
        relay = new AbstractRelay(url, {
          verifyEvent: this.trustedRelayURLs.has(url) ? alwaysTrue : this.verifyEvent,
          websocketImplementation: this._WebSocket,
          enablePing: this.enablePing,
          enableReconnect: this.enableReconnect
        });
        relay.onclose = () => {
          if (relay && !relay.enableReconnect) {
            this.relays.delete(url);
          }
        };
        if (params?.connectionTimeout)
          relay.connectionTimeout = params.connectionTimeout;
        this.relays.set(url, relay);
      }
      if (this.automaticallyAuth) {
        const authSignerFn = this.automaticallyAuth(url);
        if (authSignerFn) {
          relay.onauth = authSignerFn;
        }
      }
      await relay.connect();
      return relay;
    }
    close(relays) {
      relays.map(normalizeURL).forEach((url) => {
        this.relays.get(url)?.close();
        this.relays.delete(url);
      });
    }
    subscribe(relays, filter, params) {
      const request = [];
      for (let i2 = 0;i2 < relays.length; i2++) {
        const url = normalizeURL(relays[i2]);
        if (!request.find((r) => r.url === url)) {
          request.push({ url, filter });
        }
      }
      return this.subscribeMap(request, params);
    }
    subscribeMany(relays, filter, params) {
      const request = [];
      const uniqUrls = [];
      for (let i2 = 0;i2 < relays.length; i2++) {
        const url = normalizeURL(relays[i2]);
        if (uniqUrls.indexOf(url) === -1) {
          uniqUrls.push(url);
          request.push({ url, filter });
        }
      }
      return this.subscribeMap(request, params);
    }
    subscribeMap(requests, params) {
      const grouped = /* @__PURE__ */ new Map;
      for (const req of requests) {
        const { url, filter } = req;
        if (!grouped.has(url))
          grouped.set(url, []);
        grouped.get(url).push(filter);
      }
      const groupedRequests = Array.from(grouped.entries()).map(([url, filters]) => ({ url, filters }));
      if (this.trackRelays) {
        params.receivedEvent = (relay, id) => {
          let set = this.seenOn.get(id);
          if (!set) {
            set = /* @__PURE__ */ new Set;
            this.seenOn.set(id, set);
          }
          set.add(relay);
        };
      }
      const _knownIds = /* @__PURE__ */ new Set;
      const subs = [];
      const eosesReceived = [];
      let handleEose = (i2) => {
        if (eosesReceived[i2])
          return;
        eosesReceived[i2] = true;
        if (eosesReceived.filter((a) => a).length === groupedRequests.length) {
          params.oneose?.();
          handleEose = () => {};
        }
      };
      const closesReceived = [];
      let handleClose = (i2, reason) => {
        if (closesReceived[i2])
          return;
        handleEose(i2);
        closesReceived[i2] = reason;
        if (closesReceived.filter((a) => a).length === groupedRequests.length) {
          params.onclose?.(closesReceived);
          handleClose = () => {};
        }
      };
      const localAlreadyHaveEventHandler = (id) => {
        if (params.alreadyHaveEvent?.(id)) {
          return true;
        }
        const have = _knownIds.has(id);
        _knownIds.add(id);
        return have;
      };
      const allOpened = Promise.all(groupedRequests.map(async ({ url, filters }, i2) => {
        let relay;
        try {
          relay = await this.ensureRelay(url, {
            connectionTimeout: params.maxWait ? Math.max(params.maxWait * 0.8, params.maxWait - 1000) : undefined
          });
        } catch (err) {
          handleClose(i2, err?.message || String(err));
          return;
        }
        let subscription = relay.subscribe(filters, {
          ...params,
          oneose: () => handleEose(i2),
          onclose: (reason) => {
            if (reason.startsWith("auth-required: ") && params.onauth) {
              relay.auth(params.onauth).then(() => {
                relay.subscribe(filters, {
                  ...params,
                  oneose: () => handleEose(i2),
                  onclose: (reason2) => {
                    handleClose(i2, reason2);
                  },
                  alreadyHaveEvent: localAlreadyHaveEventHandler,
                  eoseTimeout: params.maxWait
                });
              }).catch((err) => {
                handleClose(i2, `auth was required and attempted, but failed with: ${err}`);
              });
            } else {
              handleClose(i2, reason);
            }
          },
          alreadyHaveEvent: localAlreadyHaveEventHandler,
          eoseTimeout: params.maxWait
        });
        subs.push(subscription);
      }));
      return {
        async close(reason) {
          await allOpened;
          subs.forEach((sub) => {
            sub.close(reason);
          });
        }
      };
    }
    subscribeEose(relays, filter, params) {
      const subcloser = this.subscribe(relays, filter, {
        ...params,
        oneose() {
          subcloser.close("closed automatically on eose");
        }
      });
      return subcloser;
    }
    subscribeManyEose(relays, filter, params) {
      const subcloser = this.subscribeMany(relays, filter, {
        ...params,
        oneose() {
          subcloser.close("closed automatically on eose");
        }
      });
      return subcloser;
    }
    async querySync(relays, filter, params) {
      return new Promise(async (resolve) => {
        const events = [];
        this.subscribeEose(relays, filter, {
          ...params,
          onevent(event) {
            events.push(event);
          },
          onclose(_) {
            resolve(events);
          }
        });
      });
    }
    async get(relays, filter, params) {
      filter.limit = 1;
      const events = await this.querySync(relays, filter, params);
      events.sort((a, b) => b.created_at - a.created_at);
      return events[0] || null;
    }
    publish(relays, event, options) {
      return relays.map(normalizeURL).map(async (url, i2, arr) => {
        if (arr.indexOf(url) !== i2) {
          return Promise.reject("duplicate url");
        }
        let r = await this.ensureRelay(url);
        return r.publish(event).catch(async (err) => {
          if (err instanceof Error && err.message.startsWith("auth-required: ") && options?.onauth) {
            await r.auth(options.onauth);
            return r.publish(event);
          }
          throw err;
        }).then((reason) => {
          if (this.trackRelays) {
            let set = this.seenOn.get(event.id);
            if (!set) {
              set = /* @__PURE__ */ new Set;
              this.seenOn.set(event.id, set);
            }
            set.add(r);
          }
          return reason;
        });
      });
    }
    listConnectionStatus() {
      const map = /* @__PURE__ */ new Map;
      this.relays.forEach((relay, url) => map.set(url, relay.connected));
      return map;
    }
    destroy() {
      this.relays.forEach((conn) => conn.close());
      this.relays = /* @__PURE__ */ new Map;
    }
  };
  var _WebSocket2;
  try {
    _WebSocket2 = WebSocket;
  } catch {}
  var SimplePool = class extends AbstractSimplePool {
    constructor(options) {
      super({ verifyEvent, websocketImplementation: _WebSocket2, ...options });
    }
  };
  var nip19_exports = {};
  __export2(nip19_exports, {
    BECH32_REGEX: () => BECH32_REGEX,
    Bech32MaxSize: () => Bech32MaxSize,
    NostrTypeGuard: () => NostrTypeGuard,
    decode: () => decode,
    decodeNostrURI: () => decodeNostrURI,
    encodeBytes: () => encodeBytes,
    naddrEncode: () => naddrEncode,
    neventEncode: () => neventEncode,
    noteEncode: () => noteEncode,
    nprofileEncode: () => nprofileEncode,
    npubEncode: () => npubEncode,
    nsecEncode: () => nsecEncode
  });
  var NostrTypeGuard = {
    isNProfile: (value) => /^nprofile1[a-z\d]+$/.test(value || ""),
    isNEvent: (value) => /^nevent1[a-z\d]+$/.test(value || ""),
    isNAddr: (value) => /^naddr1[a-z\d]+$/.test(value || ""),
    isNSec: (value) => /^nsec1[a-z\d]{58}$/.test(value || ""),
    isNPub: (value) => /^npub1[a-z\d]{58}$/.test(value || ""),
    isNote: (value) => /^note1[a-z\d]+$/.test(value || ""),
    isNcryptsec: (value) => /^ncryptsec1[a-z\d]+$/.test(value || "")
  };
  var Bech32MaxSize = 5000;
  var BECH32_REGEX = /[\x21-\x7E]{1,83}1[023456789acdefghjklmnpqrstuvwxyz]{6,}/;
  function integerToUint8Array(number4) {
    const uint8Array = new Uint8Array(4);
    uint8Array[0] = number4 >> 24 & 255;
    uint8Array[1] = number4 >> 16 & 255;
    uint8Array[2] = number4 >> 8 & 255;
    uint8Array[3] = number4 & 255;
    return uint8Array;
  }
  function decodeNostrURI(nip19code) {
    try {
      if (nip19code.startsWith("nostr:"))
        nip19code = nip19code.substring(6);
      return decode(nip19code);
    } catch (_err) {
      return { type: "invalid", data: null };
    }
  }
  function decode(code) {
    let { prefix, words } = bech32.decode(code, Bech32MaxSize);
    let data = new Uint8Array(bech32.fromWords(words));
    switch (prefix) {
      case "nprofile": {
        let tlv = parseTLV(data);
        if (!tlv[0]?.[0])
          throw new Error("missing TLV 0 for nprofile");
        if (tlv[0][0].length !== 32)
          throw new Error("TLV 0 should be 32 bytes");
        return {
          type: "nprofile",
          data: {
            pubkey: bytesToHex2(tlv[0][0]),
            relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : []
          }
        };
      }
      case "nevent": {
        let tlv = parseTLV(data);
        if (!tlv[0]?.[0])
          throw new Error("missing TLV 0 for nevent");
        if (tlv[0][0].length !== 32)
          throw new Error("TLV 0 should be 32 bytes");
        if (tlv[2] && tlv[2][0].length !== 32)
          throw new Error("TLV 2 should be 32 bytes");
        if (tlv[3] && tlv[3][0].length !== 4)
          throw new Error("TLV 3 should be 4 bytes");
        return {
          type: "nevent",
          data: {
            id: bytesToHex2(tlv[0][0]),
            relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : [],
            author: tlv[2]?.[0] ? bytesToHex2(tlv[2][0]) : undefined,
            kind: tlv[3]?.[0] ? parseInt(bytesToHex2(tlv[3][0]), 16) : undefined
          }
        };
      }
      case "naddr": {
        let tlv = parseTLV(data);
        if (!tlv[0]?.[0])
          throw new Error("missing TLV 0 for naddr");
        if (!tlv[2]?.[0])
          throw new Error("missing TLV 2 for naddr");
        if (tlv[2][0].length !== 32)
          throw new Error("TLV 2 should be 32 bytes");
        if (!tlv[3]?.[0])
          throw new Error("missing TLV 3 for naddr");
        if (tlv[3][0].length !== 4)
          throw new Error("TLV 3 should be 4 bytes");
        return {
          type: "naddr",
          data: {
            identifier: utf8Decoder.decode(tlv[0][0]),
            pubkey: bytesToHex2(tlv[2][0]),
            kind: parseInt(bytesToHex2(tlv[3][0]), 16),
            relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : []
          }
        };
      }
      case "nsec":
        return { type: prefix, data };
      case "npub":
      case "note":
        return { type: prefix, data: bytesToHex2(data) };
      default:
        throw new Error(`unknown prefix ${prefix}`);
    }
  }
  function parseTLV(data) {
    let result = {};
    let rest = data;
    while (rest.length > 0) {
      let t = rest[0];
      let l = rest[1];
      let v = rest.slice(2, 2 + l);
      rest = rest.slice(2 + l);
      if (v.length < l)
        throw new Error(`not enough data to read on TLV ${t}`);
      result[t] = result[t] || [];
      result[t].push(v);
    }
    return result;
  }
  function nsecEncode(key) {
    return encodeBytes("nsec", key);
  }
  function npubEncode(hex2) {
    return encodeBytes("npub", hexToBytes2(hex2));
  }
  function noteEncode(hex2) {
    return encodeBytes("note", hexToBytes2(hex2));
  }
  function encodeBech32(prefix, data) {
    let words = bech32.toWords(data);
    return bech32.encode(prefix, words, Bech32MaxSize);
  }
  function encodeBytes(prefix, bytes4) {
    return encodeBech32(prefix, bytes4);
  }
  function nprofileEncode(profile) {
    let data = encodeTLV({
      0: [hexToBytes2(profile.pubkey)],
      1: (profile.relays || []).map((url) => utf8Encoder.encode(url))
    });
    return encodeBech32("nprofile", data);
  }
  function neventEncode(event) {
    let kindArray;
    if (event.kind !== undefined) {
      kindArray = integerToUint8Array(event.kind);
    }
    let data = encodeTLV({
      0: [hexToBytes2(event.id)],
      1: (event.relays || []).map((url) => utf8Encoder.encode(url)),
      2: event.author ? [hexToBytes2(event.author)] : [],
      3: kindArray ? [new Uint8Array(kindArray)] : []
    });
    return encodeBech32("nevent", data);
  }
  function naddrEncode(addr) {
    let kind = new ArrayBuffer(4);
    new DataView(kind).setUint32(0, addr.kind, false);
    let data = encodeTLV({
      0: [utf8Encoder.encode(addr.identifier)],
      1: (addr.relays || []).map((url) => utf8Encoder.encode(url)),
      2: [hexToBytes2(addr.pubkey)],
      3: [new Uint8Array(kind)]
    });
    return encodeBech32("naddr", data);
  }
  function encodeTLV(tlv) {
    let entries = [];
    Object.entries(tlv).reverse().forEach(([t, vs]) => {
      vs.forEach((v) => {
        let entry = new Uint8Array(v.length + 2);
        entry.set([parseInt(t)], 0);
        entry.set([v.length], 1);
        entry.set(v, 2);
        entries.push(entry);
      });
    });
    return concatBytes3(...entries);
  }
  var nip04_exports = {};
  __export2(nip04_exports, {
    decrypt: () => decrypt2,
    encrypt: () => encrypt2
  });
  function encrypt2(secretKey, pubkey, text) {
    const privkey = secretKey instanceof Uint8Array ? bytesToHex2(secretKey) : secretKey;
    const key = secp256k1.getSharedSecret(privkey, "02" + pubkey);
    const normalizedKey = getNormalizedX(key);
    let iv = Uint8Array.from(randomBytes2(16));
    let plaintext = utf8Encoder.encode(text);
    let ciphertext = cbc(normalizedKey, iv).encrypt(plaintext);
    let ctb64 = base64.encode(new Uint8Array(ciphertext));
    let ivb64 = base64.encode(new Uint8Array(iv.buffer));
    return `${ctb64}?iv=${ivb64}`;
  }
  function decrypt2(secretKey, pubkey, data) {
    const privkey = secretKey instanceof Uint8Array ? bytesToHex2(secretKey) : secretKey;
    let [ctb64, ivb64] = data.split("?iv=");
    let key = secp256k1.getSharedSecret(privkey, "02" + pubkey);
    let normalizedKey = getNormalizedX(key);
    let iv = base64.decode(ivb64);
    let ciphertext = base64.decode(ctb64);
    let plaintext = cbc(normalizedKey, iv).decrypt(ciphertext);
    return utf8Decoder.decode(plaintext);
  }
  function getNormalizedX(key) {
    return key.slice(1, 33);
  }
  var nip05_exports = {};
  __export2(nip05_exports, {
    NIP05_REGEX: () => NIP05_REGEX,
    isNip05: () => isNip05,
    isValid: () => isValid,
    queryProfile: () => queryProfile,
    searchDomain: () => searchDomain,
    useFetchImplementation: () => useFetchImplementation
  });
  var NIP05_REGEX = /^(?:([\w.+-]+)@)?([\w_-]+(\.[\w_-]+)+)$/;
  var isNip05 = (value) => NIP05_REGEX.test(value || "");
  var _fetch;
  try {
    _fetch = fetch;
  } catch (_) {}
  function useFetchImplementation(fetchImplementation) {
    _fetch = fetchImplementation;
  }
  async function searchDomain(domain, query = "") {
    try {
      const url = `https://${domain}/.well-known/nostr.json?name=${query}`;
      const res = await _fetch(url, { redirect: "manual" });
      if (res.status !== 200) {
        throw Error("Wrong response code");
      }
      const json = await res.json();
      return json.names;
    } catch (_) {
      return {};
    }
  }
  async function queryProfile(fullname) {
    const match = fullname.match(NIP05_REGEX);
    if (!match)
      return null;
    const [, name = "_", domain] = match;
    try {
      const url = `https://${domain}/.well-known/nostr.json?name=${name}`;
      const res = await _fetch(url, { redirect: "manual" });
      if (res.status !== 200) {
        throw Error("Wrong response code");
      }
      const json = await res.json();
      const pubkey = json.names[name];
      return pubkey ? { pubkey, relays: json.relays?.[pubkey] } : null;
    } catch (_e) {
      return null;
    }
  }
  async function isValid(pubkey, nip05) {
    const res = await queryProfile(nip05);
    return res ? res.pubkey === pubkey : false;
  }
  var nip10_exports = {};
  __export2(nip10_exports, {
    parse: () => parse
  });
  function parse(event) {
    const result = {
      reply: undefined,
      root: undefined,
      mentions: [],
      profiles: [],
      quotes: []
    };
    let maybeParent;
    let maybeRoot;
    for (let i2 = event.tags.length - 1;i2 >= 0; i2--) {
      const tag = event.tags[i2];
      if (tag[0] === "e" && tag[1]) {
        const [_, eTagEventId, eTagRelayUrl, eTagMarker, eTagAuthor] = tag;
        const eventPointer = {
          id: eTagEventId,
          relays: eTagRelayUrl ? [eTagRelayUrl] : [],
          author: eTagAuthor
        };
        if (eTagMarker === "root") {
          result.root = eventPointer;
          continue;
        }
        if (eTagMarker === "reply") {
          result.reply = eventPointer;
          continue;
        }
        if (eTagMarker === "mention") {
          result.mentions.push(eventPointer);
          continue;
        }
        if (!maybeParent) {
          maybeParent = eventPointer;
        } else {
          maybeRoot = eventPointer;
        }
        result.mentions.push(eventPointer);
        continue;
      }
      if (tag[0] === "q" && tag[1]) {
        const [_, eTagEventId, eTagRelayUrl] = tag;
        result.quotes.push({
          id: eTagEventId,
          relays: eTagRelayUrl ? [eTagRelayUrl] : []
        });
      }
      if (tag[0] === "p" && tag[1]) {
        result.profiles.push({
          pubkey: tag[1],
          relays: tag[2] ? [tag[2]] : []
        });
        continue;
      }
    }
    if (!result.root) {
      result.root = maybeRoot || maybeParent || result.reply;
    }
    if (!result.reply) {
      result.reply = maybeParent || result.root;
    }
    [result.reply, result.root].forEach((ref) => {
      if (!ref)
        return;
      let idx = result.mentions.indexOf(ref);
      if (idx !== -1) {
        result.mentions.splice(idx, 1);
      }
      if (ref.author) {
        let author = result.profiles.find((p) => p.pubkey === ref.author);
        if (author && author.relays) {
          if (!ref.relays) {
            ref.relays = [];
          }
          author.relays.forEach((url) => {
            if (ref.relays?.indexOf(url) === -1)
              ref.relays.push(url);
          });
          author.relays = ref.relays;
        }
      }
    });
    result.mentions.forEach((ref) => {
      if (ref.author) {
        let author = result.profiles.find((p) => p.pubkey === ref.author);
        if (author && author.relays) {
          if (!ref.relays) {
            ref.relays = [];
          }
          author.relays.forEach((url) => {
            if (ref.relays.indexOf(url) === -1)
              ref.relays.push(url);
          });
          author.relays = ref.relays;
        }
      }
    });
    return result;
  }
  var nip11_exports = {};
  __export2(nip11_exports, {
    fetchRelayInformation: () => fetchRelayInformation,
    useFetchImplementation: () => useFetchImplementation2
  });
  var _fetch2;
  try {
    _fetch2 = fetch;
  } catch {}
  function useFetchImplementation2(fetchImplementation) {
    _fetch2 = fetchImplementation;
  }
  async function fetchRelayInformation(url) {
    return await (await fetch(url.replace("ws://", "http://").replace("wss://", "https://"), {
      headers: { Accept: "application/nostr+json" }
    })).json();
  }
  var nip13_exports = {};
  __export2(nip13_exports, {
    fastEventHash: () => fastEventHash,
    getPow: () => getPow,
    minePow: () => minePow
  });
  function getPow(hex2) {
    let count = 0;
    for (let i2 = 0;i2 < 64; i2 += 8) {
      const nibble = parseInt(hex2.substring(i2, i2 + 8), 16);
      if (nibble === 0) {
        count += 32;
      } else {
        count += Math.clz32(nibble);
        break;
      }
    }
    return count;
  }
  function minePow(unsigned, difficulty) {
    let count = 0;
    const event = unsigned;
    const tag = ["nonce", count.toString(), difficulty.toString()];
    event.tags.push(tag);
    while (true) {
      const now2 = Math.floor(new Date().getTime() / 1000);
      if (now2 !== event.created_at) {
        count = 0;
        event.created_at = now2;
      }
      tag[1] = (++count).toString();
      event.id = fastEventHash(event);
      if (getPow(event.id) >= difficulty) {
        break;
      }
    }
    return event;
  }
  function fastEventHash(evt) {
    return bytesToHex2(sha2562(utf8Encoder.encode(JSON.stringify([0, evt.pubkey, evt.created_at, evt.kind, evt.tags, evt.content]))));
  }
  var nip17_exports = {};
  __export2(nip17_exports, {
    unwrapEvent: () => unwrapEvent2,
    unwrapManyEvents: () => unwrapManyEvents2,
    wrapEvent: () => wrapEvent2,
    wrapManyEvents: () => wrapManyEvents2
  });
  var nip59_exports = {};
  __export2(nip59_exports, {
    createRumor: () => createRumor,
    createSeal: () => createSeal,
    createWrap: () => createWrap,
    unwrapEvent: () => unwrapEvent,
    unwrapManyEvents: () => unwrapManyEvents,
    wrapEvent: () => wrapEvent,
    wrapManyEvents: () => wrapManyEvents
  });
  var nip44_exports = {};
  __export2(nip44_exports, {
    decrypt: () => decrypt22,
    encrypt: () => encrypt22,
    getConversationKey: () => getConversationKey,
    v2: () => v2
  });
  var minPlaintextSize = 1;
  var maxPlaintextSize = 65535;
  function getConversationKey(privkeyA, pubkeyB) {
    const sharedX = secp256k1.getSharedSecret(privkeyA, "02" + pubkeyB).subarray(1, 33);
    return extract(sha2562, sharedX, "nip44-v2");
  }
  function getMessageKeys(conversationKey, nonce) {
    const keys = expand(sha2562, conversationKey, nonce, 76);
    return {
      chacha_key: keys.subarray(0, 32),
      chacha_nonce: keys.subarray(32, 44),
      hmac_key: keys.subarray(44, 76)
    };
  }
  function calcPaddedLen(len) {
    if (!Number.isSafeInteger(len) || len < 1)
      throw new Error("expected positive integer");
    if (len <= 32)
      return 32;
    const nextPower = 1 << Math.floor(Math.log2(len - 1)) + 1;
    const chunk = nextPower <= 256 ? 32 : nextPower / 8;
    return chunk * (Math.floor((len - 1) / chunk) + 1);
  }
  function writeU16BE(num) {
    if (!Number.isSafeInteger(num) || num < minPlaintextSize || num > maxPlaintextSize)
      throw new Error("invalid plaintext size: must be between 1 and 65535 bytes");
    const arr = new Uint8Array(2);
    new DataView(arr.buffer).setUint16(0, num, false);
    return arr;
  }
  function pad(plaintext) {
    const unpadded = utf8Encoder.encode(plaintext);
    const unpaddedLen = unpadded.length;
    const prefix = writeU16BE(unpaddedLen);
    const suffix = new Uint8Array(calcPaddedLen(unpaddedLen) - unpaddedLen);
    return concatBytes3(prefix, unpadded, suffix);
  }
  function unpad(padded) {
    const unpaddedLen = new DataView(padded.buffer).getUint16(0);
    const unpadded = padded.subarray(2, 2 + unpaddedLen);
    if (unpaddedLen < minPlaintextSize || unpaddedLen > maxPlaintextSize || unpadded.length !== unpaddedLen || padded.length !== 2 + calcPaddedLen(unpaddedLen))
      throw new Error("invalid padding");
    return utf8Decoder.decode(unpadded);
  }
  function hmacAad(key, message, aad) {
    if (aad.length !== 32)
      throw new Error("AAD associated data must be 32 bytes");
    const combined = concatBytes3(aad, message);
    return hmac2(sha2562, key, combined);
  }
  function decodePayload(payload) {
    if (typeof payload !== "string")
      throw new Error("payload must be a valid string");
    const plen = payload.length;
    if (plen < 132 || plen > 87472)
      throw new Error("invalid payload length: " + plen);
    if (payload[0] === "#")
      throw new Error("unknown encryption version");
    let data;
    try {
      data = base64.decode(payload);
    } catch (error) {
      throw new Error("invalid base64: " + error.message);
    }
    const dlen = data.length;
    if (dlen < 99 || dlen > 65603)
      throw new Error("invalid data length: " + dlen);
    const vers = data[0];
    if (vers !== 2)
      throw new Error("unknown encryption version " + vers);
    return {
      nonce: data.subarray(1, 33),
      ciphertext: data.subarray(33, -32),
      mac: data.subarray(-32)
    };
  }
  function encrypt22(plaintext, conversationKey, nonce = randomBytes2(32)) {
    const { chacha_key, chacha_nonce, hmac_key } = getMessageKeys(conversationKey, nonce);
    const padded = pad(plaintext);
    const ciphertext = chacha20(chacha_key, chacha_nonce, padded);
    const mac = hmacAad(hmac_key, ciphertext, nonce);
    return base64.encode(concatBytes3(new Uint8Array([2]), nonce, ciphertext, mac));
  }
  function decrypt22(payload, conversationKey) {
    const { nonce, ciphertext, mac } = decodePayload(payload);
    const { chacha_key, chacha_nonce, hmac_key } = getMessageKeys(conversationKey, nonce);
    const calculatedMac = hmacAad(hmac_key, ciphertext, nonce);
    if (!equalBytes2(calculatedMac, mac))
      throw new Error("invalid MAC");
    const padded = chacha20(chacha_key, chacha_nonce, ciphertext);
    return unpad(padded);
  }
  var v2 = {
    utils: {
      getConversationKey,
      calcPaddedLen
    },
    encrypt: encrypt22,
    decrypt: decrypt22
  };
  var TWO_DAYS = 2 * 24 * 60 * 60;
  var now = () => Math.round(Date.now() / 1000);
  var randomNow = () => Math.round(now() - Math.random() * TWO_DAYS);
  var nip44ConversationKey = (privateKey, publicKey) => getConversationKey(privateKey, publicKey);
  var nip44Encrypt = (data, privateKey, publicKey) => encrypt22(JSON.stringify(data), nip44ConversationKey(privateKey, publicKey));
  var nip44Decrypt = (data, privateKey) => JSON.parse(decrypt22(data.content, nip44ConversationKey(privateKey, data.pubkey)));
  function createRumor(event, privateKey) {
    const rumor = {
      created_at: now(),
      content: "",
      tags: [],
      ...event,
      pubkey: getPublicKey(privateKey)
    };
    rumor.id = getEventHash(rumor);
    return rumor;
  }
  function createSeal(rumor, privateKey, recipientPublicKey) {
    return finalizeEvent({
      kind: Seal,
      content: nip44Encrypt(rumor, privateKey, recipientPublicKey),
      created_at: randomNow(),
      tags: []
    }, privateKey);
  }
  function createWrap(seal, recipientPublicKey) {
    const randomKey = generateSecretKey();
    return finalizeEvent({
      kind: GiftWrap,
      content: nip44Encrypt(seal, randomKey, recipientPublicKey),
      created_at: randomNow(),
      tags: [["p", recipientPublicKey]]
    }, randomKey);
  }
  function wrapEvent(event, senderPrivateKey, recipientPublicKey) {
    const rumor = createRumor(event, senderPrivateKey);
    const seal = createSeal(rumor, senderPrivateKey, recipientPublicKey);
    return createWrap(seal, recipientPublicKey);
  }
  function wrapManyEvents(event, senderPrivateKey, recipientsPublicKeys) {
    if (!recipientsPublicKeys || recipientsPublicKeys.length === 0) {
      throw new Error("At least one recipient is required.");
    }
    const senderPublicKey = getPublicKey(senderPrivateKey);
    const wrappeds = [wrapEvent(event, senderPrivateKey, senderPublicKey)];
    recipientsPublicKeys.forEach((recipientPublicKey) => {
      wrappeds.push(wrapEvent(event, senderPrivateKey, recipientPublicKey));
    });
    return wrappeds;
  }
  function unwrapEvent(wrap, recipientPrivateKey) {
    const unwrappedSeal = nip44Decrypt(wrap, recipientPrivateKey);
    return nip44Decrypt(unwrappedSeal, recipientPrivateKey);
  }
  function unwrapManyEvents(wrappedEvents, recipientPrivateKey) {
    let unwrappedEvents = [];
    wrappedEvents.forEach((e) => {
      unwrappedEvents.push(unwrapEvent(e, recipientPrivateKey));
    });
    unwrappedEvents.sort((a, b) => a.created_at - b.created_at);
    return unwrappedEvents;
  }
  function createEvent(recipients, message, conversationTitle, replyTo) {
    const baseEvent = {
      created_at: Math.ceil(Date.now() / 1000),
      kind: PrivateDirectMessage,
      tags: [],
      content: message
    };
    const recipientsArray = Array.isArray(recipients) ? recipients : [recipients];
    recipientsArray.forEach(({ publicKey, relayUrl }) => {
      baseEvent.tags.push(relayUrl ? ["p", publicKey, relayUrl] : ["p", publicKey]);
    });
    if (replyTo) {
      baseEvent.tags.push(["e", replyTo.eventId, replyTo.relayUrl || "", "reply"]);
    }
    if (conversationTitle) {
      baseEvent.tags.push(["subject", conversationTitle]);
    }
    return baseEvent;
  }
  function wrapEvent2(senderPrivateKey, recipient, message, conversationTitle, replyTo) {
    const event = createEvent(recipient, message, conversationTitle, replyTo);
    return wrapEvent(event, senderPrivateKey, recipient.publicKey);
  }
  function wrapManyEvents2(senderPrivateKey, recipients, message, conversationTitle, replyTo) {
    if (!recipients || recipients.length === 0) {
      throw new Error("At least one recipient is required.");
    }
    const senderPublicKey = getPublicKey(senderPrivateKey);
    return [{ publicKey: senderPublicKey }, ...recipients].map((recipient) => wrapEvent2(senderPrivateKey, recipient, message, conversationTitle, replyTo));
  }
  var unwrapEvent2 = unwrapEvent;
  var unwrapManyEvents2 = unwrapManyEvents;
  var nip18_exports = {};
  __export2(nip18_exports, {
    finishRepostEvent: () => finishRepostEvent,
    getRepostedEvent: () => getRepostedEvent,
    getRepostedEventPointer: () => getRepostedEventPointer
  });
  function finishRepostEvent(t, reposted, relayUrl, privateKey) {
    let kind;
    const tags = [...t.tags ?? [], ["e", reposted.id, relayUrl], ["p", reposted.pubkey]];
    if (reposted.kind === ShortTextNote) {
      kind = Repost;
    } else {
      kind = GenericRepost;
      tags.push(["k", String(reposted.kind)]);
    }
    return finalizeEvent({
      kind,
      tags,
      content: t.content === "" || reposted.tags?.find((tag) => tag[0] === "-") ? "" : JSON.stringify(reposted),
      created_at: t.created_at
    }, privateKey);
  }
  function getRepostedEventPointer(event) {
    if (![Repost, GenericRepost].includes(event.kind)) {
      return;
    }
    let lastETag;
    let lastPTag;
    for (let i2 = event.tags.length - 1;i2 >= 0 && (lastETag === undefined || lastPTag === undefined); i2--) {
      const tag = event.tags[i2];
      if (tag.length >= 2) {
        if (tag[0] === "e" && lastETag === undefined) {
          lastETag = tag;
        } else if (tag[0] === "p" && lastPTag === undefined) {
          lastPTag = tag;
        }
      }
    }
    if (lastETag === undefined) {
      return;
    }
    return {
      id: lastETag[1],
      relays: [lastETag[2], lastPTag?.[2]].filter((x) => typeof x === "string"),
      author: lastPTag?.[1]
    };
  }
  function getRepostedEvent(event, { skipVerification } = {}) {
    const pointer = getRepostedEventPointer(event);
    if (pointer === undefined || event.content === "") {
      return;
    }
    let repostedEvent;
    try {
      repostedEvent = JSON.parse(event.content);
    } catch (error) {
      return;
    }
    if (repostedEvent.id !== pointer.id) {
      return;
    }
    if (!skipVerification && !verifyEvent(repostedEvent)) {
      return;
    }
    return repostedEvent;
  }
  var nip21_exports = {};
  __export2(nip21_exports, {
    NOSTR_URI_REGEX: () => NOSTR_URI_REGEX,
    parse: () => parse2,
    test: () => test
  });
  var NOSTR_URI_REGEX = new RegExp(`nostr:(${BECH32_REGEX.source})`);
  function test(value) {
    return typeof value === "string" && new RegExp(`^${NOSTR_URI_REGEX.source}$`).test(value);
  }
  function parse2(uri) {
    const match = uri.match(new RegExp(`^${NOSTR_URI_REGEX.source}$`));
    if (!match)
      throw new Error(`Invalid Nostr URI: ${uri}`);
    return {
      uri: match[0],
      value: match[1],
      decoded: decode(match[1])
    };
  }
  var nip25_exports = {};
  __export2(nip25_exports, {
    finishReactionEvent: () => finishReactionEvent,
    getReactedEventPointer: () => getReactedEventPointer
  });
  function finishReactionEvent(t, reacted, privateKey) {
    const inheritedTags = reacted.tags.filter((tag) => tag.length >= 2 && (tag[0] === "e" || tag[0] === "p"));
    return finalizeEvent({
      ...t,
      kind: Reaction,
      tags: [...t.tags ?? [], ...inheritedTags, ["e", reacted.id], ["p", reacted.pubkey]],
      content: t.content ?? "+"
    }, privateKey);
  }
  function getReactedEventPointer(event) {
    if (event.kind !== Reaction) {
      return;
    }
    let lastETag;
    let lastPTag;
    for (let i2 = event.tags.length - 1;i2 >= 0 && (lastETag === undefined || lastPTag === undefined); i2--) {
      const tag = event.tags[i2];
      if (tag.length >= 2) {
        if (tag[0] === "e" && lastETag === undefined) {
          lastETag = tag;
        } else if (tag[0] === "p" && lastPTag === undefined) {
          lastPTag = tag;
        }
      }
    }
    if (lastETag === undefined || lastPTag === undefined) {
      return;
    }
    return {
      id: lastETag[1],
      relays: [lastETag[2], lastPTag[2]].filter((x) => x !== undefined),
      author: lastPTag[1]
    };
  }
  var nip27_exports = {};
  __export2(nip27_exports, {
    parse: () => parse3
  });
  var noCharacter = /\W/m;
  var noURLCharacter = /[^\w\/] |[^\w\/]$|$|,| /m;
  var MAX_HASHTAG_LENGTH = 42;
  function* parse3(content) {
    let emojis = [];
    if (typeof content !== "string") {
      for (let i2 = 0;i2 < content.tags.length; i2++) {
        const tag = content.tags[i2];
        if (tag[0] === "emoji" && tag.length >= 3) {
          emojis.push({ type: "emoji", shortcode: tag[1], url: tag[2] });
        }
      }
      content = content.content;
    }
    const max = content.length;
    let prevIndex = 0;
    let index = 0;
    mainloop:
      while (index < max) {
        const u = content.indexOf(":", index);
        const h = content.indexOf("#", index);
        if (u === -1 && h === -1) {
          break mainloop;
        }
        if (u === -1 || h >= 0 && h < u) {
          if (h === 0 || content[h - 1] === " ") {
            const m = content.slice(h + 1, h + MAX_HASHTAG_LENGTH).match(noCharacter);
            const end = m ? h + 1 + m.index : max;
            yield { type: "text", text: content.slice(prevIndex, h) };
            yield { type: "hashtag", value: content.slice(h + 1, end) };
            index = end;
            prevIndex = index;
            continue mainloop;
          }
          index = h + 1;
          continue mainloop;
        }
        if (content.slice(u - 5, u) === "nostr") {
          const m = content.slice(u + 60).match(noCharacter);
          const end = m ? u + 60 + m.index : max;
          try {
            let pointer;
            let { data, type } = decode(content.slice(u + 1, end));
            switch (type) {
              case "npub":
                pointer = { pubkey: data };
                break;
              case "note":
                pointer = { id: data };
                break;
              case "nsec":
                index = end + 1;
                continue;
              default:
                pointer = data;
            }
            if (prevIndex !== u - 5) {
              yield { type: "text", text: content.slice(prevIndex, u - 5) };
            }
            yield { type: "reference", pointer };
            index = end;
            prevIndex = index;
            continue mainloop;
          } catch (_err) {
            index = u + 1;
            continue mainloop;
          }
        } else if (content.slice(u - 5, u) === "https" || content.slice(u - 4, u) === "http") {
          const m = content.slice(u + 4).match(noURLCharacter);
          const end = m ? u + 4 + m.index : max;
          const prefixLen = content[u - 1] === "s" ? 5 : 4;
          try {
            let url = new URL(content.slice(u - prefixLen, end));
            if (url.hostname.indexOf(".") === -1) {
              throw new Error("invalid url");
            }
            if (prevIndex !== u - prefixLen) {
              yield { type: "text", text: content.slice(prevIndex, u - prefixLen) };
            }
            if (/\.(png|jpe?g|gif|webp|heic|svg)$/i.test(url.pathname)) {
              yield { type: "image", url: url.toString() };
              index = end;
              prevIndex = index;
              continue mainloop;
            }
            if (/\.(mp4|avi|webm|mkv|mov)$/i.test(url.pathname)) {
              yield { type: "video", url: url.toString() };
              index = end;
              prevIndex = index;
              continue mainloop;
            }
            if (/\.(mp3|aac|ogg|opus|wav|flac)$/i.test(url.pathname)) {
              yield { type: "audio", url: url.toString() };
              index = end;
              prevIndex = index;
              continue mainloop;
            }
            yield { type: "url", url: url.toString() };
            index = end;
            prevIndex = index;
            continue mainloop;
          } catch (_err) {
            index = end + 1;
            continue mainloop;
          }
        } else if (content.slice(u - 3, u) === "wss" || content.slice(u - 2, u) === "ws") {
          const m = content.slice(u + 4).match(noURLCharacter);
          const end = m ? u + 4 + m.index : max;
          const prefixLen = content[u - 1] === "s" ? 3 : 2;
          try {
            let url = new URL(content.slice(u - prefixLen, end));
            if (url.hostname.indexOf(".") === -1) {
              throw new Error("invalid ws url");
            }
            if (prevIndex !== u - prefixLen) {
              yield { type: "text", text: content.slice(prevIndex, u - prefixLen) };
            }
            yield { type: "relay", url: url.toString() };
            index = end;
            prevIndex = index;
            continue mainloop;
          } catch (_err) {
            index = end + 1;
            continue mainloop;
          }
        } else {
          for (let e = 0;e < emojis.length; e++) {
            const emoji = emojis[e];
            if (content[u + emoji.shortcode.length + 1] === ":" && content.slice(u + 1, u + emoji.shortcode.length + 1) === emoji.shortcode) {
              if (prevIndex !== u) {
                yield { type: "text", text: content.slice(prevIndex, u) };
              }
              yield emoji;
              index = u + emoji.shortcode.length + 2;
              prevIndex = index;
              continue mainloop;
            }
          }
          index = u + 1;
          continue mainloop;
        }
      }
    if (prevIndex !== max) {
      yield { type: "text", text: content.slice(prevIndex) };
    }
  }
  var nip28_exports = {};
  __export2(nip28_exports, {
    channelCreateEvent: () => channelCreateEvent,
    channelHideMessageEvent: () => channelHideMessageEvent,
    channelMessageEvent: () => channelMessageEvent,
    channelMetadataEvent: () => channelMetadataEvent,
    channelMuteUserEvent: () => channelMuteUserEvent
  });
  var channelCreateEvent = (t, privateKey) => {
    let content;
    if (typeof t.content === "object") {
      content = JSON.stringify(t.content);
    } else if (typeof t.content === "string") {
      content = t.content;
    } else {
      return;
    }
    return finalizeEvent({
      kind: ChannelCreation,
      tags: [...t.tags ?? []],
      content,
      created_at: t.created_at
    }, privateKey);
  };
  var channelMetadataEvent = (t, privateKey) => {
    let content;
    if (typeof t.content === "object") {
      content = JSON.stringify(t.content);
    } else if (typeof t.content === "string") {
      content = t.content;
    } else {
      return;
    }
    return finalizeEvent({
      kind: ChannelMetadata,
      tags: [["e", t.channel_create_event_id], ...t.tags ?? []],
      content,
      created_at: t.created_at
    }, privateKey);
  };
  var channelMessageEvent = (t, privateKey) => {
    const tags = [["e", t.channel_create_event_id, t.relay_url, "root"]];
    if (t.reply_to_channel_message_event_id) {
      tags.push(["e", t.reply_to_channel_message_event_id, t.relay_url, "reply"]);
    }
    return finalizeEvent({
      kind: ChannelMessage,
      tags: [...tags, ...t.tags ?? []],
      content: t.content,
      created_at: t.created_at
    }, privateKey);
  };
  var channelHideMessageEvent = (t, privateKey) => {
    let content;
    if (typeof t.content === "object") {
      content = JSON.stringify(t.content);
    } else if (typeof t.content === "string") {
      content = t.content;
    } else {
      return;
    }
    return finalizeEvent({
      kind: ChannelHideMessage,
      tags: [["e", t.channel_message_event_id], ...t.tags ?? []],
      content,
      created_at: t.created_at
    }, privateKey);
  };
  var channelMuteUserEvent = (t, privateKey) => {
    let content;
    if (typeof t.content === "object") {
      content = JSON.stringify(t.content);
    } else if (typeof t.content === "string") {
      content = t.content;
    } else {
      return;
    }
    return finalizeEvent({
      kind: ChannelMuteUser,
      tags: [["p", t.pubkey_to_mute], ...t.tags ?? []],
      content,
      created_at: t.created_at
    }, privateKey);
  };
  var nip30_exports = {};
  __export2(nip30_exports, {
    EMOJI_SHORTCODE_REGEX: () => EMOJI_SHORTCODE_REGEX,
    matchAll: () => matchAll,
    regex: () => regex,
    replaceAll: () => replaceAll
  });
  var EMOJI_SHORTCODE_REGEX = /:(\w+):/;
  var regex = () => new RegExp(`\\B${EMOJI_SHORTCODE_REGEX.source}\\B`, "g");
  function* matchAll(content) {
    const matches = content.matchAll(regex());
    for (const match of matches) {
      try {
        const [shortcode, name] = match;
        yield {
          shortcode,
          name,
          start: match.index,
          end: match.index + shortcode.length
        };
      } catch (_e) {}
    }
  }
  function replaceAll(content, replacer) {
    return content.replaceAll(regex(), (shortcode, name) => {
      return replacer({
        shortcode,
        name
      });
    });
  }
  var nip39_exports = {};
  __export2(nip39_exports, {
    useFetchImplementation: () => useFetchImplementation3,
    validateGithub: () => validateGithub
  });
  var _fetch3;
  try {
    _fetch3 = fetch;
  } catch {}
  function useFetchImplementation3(fetchImplementation) {
    _fetch3 = fetchImplementation;
  }
  async function validateGithub(pubkey, username, proof) {
    try {
      let res = await (await _fetch3(`https://gist.github.com/${username}/${proof}/raw`)).text();
      return res === `Verifying that I control the following Nostr public key: ${pubkey}`;
    } catch (_) {
      return false;
    }
  }
  var nip47_exports = {};
  __export2(nip47_exports, {
    makeNwcRequestEvent: () => makeNwcRequestEvent,
    parseConnectionString: () => parseConnectionString
  });
  function parseConnectionString(connectionString) {
    const { host, pathname, searchParams } = new URL(connectionString);
    const pubkey = pathname || host;
    const relay = searchParams.get("relay");
    const secret = searchParams.get("secret");
    if (!pubkey || !relay || !secret) {
      throw new Error("invalid connection string");
    }
    return { pubkey, relay, secret };
  }
  async function makeNwcRequestEvent(pubkey, secretKey, invoice) {
    const content = {
      method: "pay_invoice",
      params: {
        invoice
      }
    };
    const encryptedContent = encrypt2(secretKey, pubkey, JSON.stringify(content));
    const eventTemplate = {
      kind: NWCWalletRequest,
      created_at: Math.round(Date.now() / 1000),
      content: encryptedContent,
      tags: [["p", pubkey]]
    };
    return finalizeEvent(eventTemplate, secretKey);
  }
  var nip54_exports = {};
  __export2(nip54_exports, {
    normalizeIdentifier: () => normalizeIdentifier
  });
  function normalizeIdentifier(name) {
    name = name.trim().toLowerCase();
    name = name.normalize("NFKC");
    return Array.from(name).map((char) => {
      if (/\p{Letter}/u.test(char) || /\p{Number}/u.test(char)) {
        return char;
      }
      return "-";
    }).join("");
  }
  var nip57_exports = {};
  __export2(nip57_exports, {
    getSatoshisAmountFromBolt11: () => getSatoshisAmountFromBolt11,
    getZapEndpoint: () => getZapEndpoint,
    makeZapReceipt: () => makeZapReceipt,
    makeZapRequest: () => makeZapRequest,
    useFetchImplementation: () => useFetchImplementation4,
    validateZapRequest: () => validateZapRequest
  });
  var _fetch4;
  try {
    _fetch4 = fetch;
  } catch {}
  function useFetchImplementation4(fetchImplementation) {
    _fetch4 = fetchImplementation;
  }
  async function getZapEndpoint(metadata) {
    try {
      let lnurl = "";
      let { lud06, lud16 } = JSON.parse(metadata.content);
      if (lud16) {
        let [name, domain] = lud16.split("@");
        lnurl = new URL(`/.well-known/lnurlp/${name}`, `https://${domain}`).toString();
      } else if (lud06) {
        let { words } = bech32.decode(lud06, 1000);
        let data = bech32.fromWords(words);
        lnurl = utf8Decoder.decode(data);
      } else {
        return null;
      }
      let res = await _fetch4(lnurl);
      let body = await res.json();
      if (body.allowsNostr && body.nostrPubkey) {
        return body.callback;
      }
    } catch (err) {}
    return null;
  }
  function makeZapRequest(params) {
    let zr = {
      kind: 9734,
      created_at: Math.round(Date.now() / 1000),
      content: params.comment || "",
      tags: [
        ["p", "pubkey" in params ? params.pubkey : params.event.pubkey],
        ["amount", params.amount.toString()],
        ["relays", ...params.relays]
      ]
    };
    if ("event" in params) {
      zr.tags.push(["e", params.event.id]);
      if (isReplaceableKind(params.event.kind)) {
        const a = ["a", `${params.event.kind}:${params.event.pubkey}:`];
        zr.tags.push(a);
      } else if (isAddressableKind(params.event.kind)) {
        let d = params.event.tags.find(([t, v]) => t === "d" && v);
        if (!d)
          throw new Error("d tag not found or is empty");
        const a = ["a", `${params.event.kind}:${params.event.pubkey}:${d[1]}`];
        zr.tags.push(a);
      }
      zr.tags.push(["k", params.event.kind.toString()]);
    }
    return zr;
  }
  function validateZapRequest(zapRequestString) {
    let zapRequest;
    try {
      zapRequest = JSON.parse(zapRequestString);
    } catch (err) {
      return "Invalid zap request JSON.";
    }
    if (!validateEvent(zapRequest))
      return "Zap request is not a valid Nostr event.";
    if (!verifyEvent(zapRequest))
      return "Invalid signature on zap request.";
    let p = zapRequest.tags.find(([t, v]) => t === "p" && v);
    if (!p)
      return "Zap request doesn't have a 'p' tag.";
    if (!p[1].match(/^[a-f0-9]{64}$/))
      return "Zap request 'p' tag is not valid hex.";
    let e = zapRequest.tags.find(([t, v]) => t === "e" && v);
    if (e && !e[1].match(/^[a-f0-9]{64}$/))
      return "Zap request 'e' tag is not valid hex.";
    let relays = zapRequest.tags.find(([t, v]) => t === "relays" && v);
    if (!relays)
      return "Zap request doesn't have a 'relays' tag.";
    return null;
  }
  function makeZapReceipt({
    zapRequest,
    preimage,
    bolt11,
    paidAt
  }) {
    let zr = JSON.parse(zapRequest);
    let tagsFromZapRequest = zr.tags.filter(([t]) => t === "e" || t === "p" || t === "a");
    let zap = {
      kind: 9735,
      created_at: Math.round(paidAt.getTime() / 1000),
      content: "",
      tags: [...tagsFromZapRequest, ["P", zr.pubkey], ["bolt11", bolt11], ["description", zapRequest]]
    };
    if (preimage) {
      zap.tags.push(["preimage", preimage]);
    }
    return zap;
  }
  function getSatoshisAmountFromBolt11(bolt11) {
    if (bolt11.length < 50) {
      return 0;
    }
    bolt11 = bolt11.substring(0, 50);
    const idx = bolt11.lastIndexOf("1");
    if (idx === -1) {
      return 0;
    }
    const hrp = bolt11.substring(0, idx);
    if (!hrp.startsWith("lnbc")) {
      return 0;
    }
    const amount = hrp.substring(4);
    if (amount.length < 1) {
      return 0;
    }
    const char = amount[amount.length - 1];
    const digit = char.charCodeAt(0) - 48;
    const isDigit = digit >= 0 && digit <= 9;
    let cutPoint = amount.length - 1;
    if (isDigit) {
      cutPoint++;
    }
    if (cutPoint < 1) {
      return 0;
    }
    const num = parseInt(amount.substring(0, cutPoint));
    switch (char) {
      case "m":
        return num * 1e5;
      case "u":
        return num * 100;
      case "n":
        return num / 10;
      case "p":
        return num / 1e4;
      default:
        return num * 1e8;
    }
  }
  var nip77_exports = {};
  __export2(nip77_exports, {
    Negentropy: () => Negentropy,
    NegentropyStorageVector: () => NegentropyStorageVector,
    NegentropySync: () => NegentropySync
  });
  var PROTOCOL_VERSION = 97;
  var ID_SIZE = 32;
  var FINGERPRINT_SIZE = 16;
  var Mode = {
    Skip: 0,
    Fingerprint: 1,
    IdList: 2
  };
  var WrappedBuffer = class {
    _raw;
    length;
    constructor(buffer) {
      if (typeof buffer === "number") {
        this._raw = new Uint8Array(buffer);
        this.length = 0;
      } else if (buffer instanceof Uint8Array) {
        this._raw = new Uint8Array(buffer);
        this.length = buffer.length;
      } else {
        this._raw = new Uint8Array(512);
        this.length = 0;
      }
    }
    unwrap() {
      return this._raw.subarray(0, this.length);
    }
    get capacity() {
      return this._raw.byteLength;
    }
    extend(buf) {
      if (buf instanceof WrappedBuffer)
        buf = buf.unwrap();
      if (typeof buf.length !== "number")
        throw Error("bad length");
      const targetSize = buf.length + this.length;
      if (this.capacity < targetSize) {
        const oldRaw = this._raw;
        const newCapacity = Math.max(this.capacity * 2, targetSize);
        this._raw = new Uint8Array(newCapacity);
        this._raw.set(oldRaw);
      }
      this._raw.set(buf, this.length);
      this.length += buf.length;
    }
    shift() {
      const first = this._raw[0];
      this._raw = this._raw.subarray(1);
      this.length--;
      return first;
    }
    shiftN(n = 1) {
      const firstSubarray = this._raw.subarray(0, n);
      this._raw = this._raw.subarray(n);
      this.length -= n;
      return firstSubarray;
    }
  };
  function decodeVarInt(buf) {
    let res = 0;
    while (true) {
      if (buf.length === 0)
        throw Error("parse ends prematurely");
      let byte = buf.shift();
      res = res << 7 | byte & 127;
      if ((byte & 128) === 0)
        break;
    }
    return res;
  }
  function encodeVarInt(n) {
    if (n === 0)
      return new WrappedBuffer(new Uint8Array([0]));
    let o = [];
    while (n !== 0) {
      o.push(n & 127);
      n >>>= 7;
    }
    o.reverse();
    for (let i2 = 0;i2 < o.length - 1; i2++)
      o[i2] |= 128;
    return new WrappedBuffer(new Uint8Array(o));
  }
  function getByte(buf) {
    return getBytes(buf, 1)[0];
  }
  function getBytes(buf, n) {
    if (buf.length < n)
      throw Error("parse ends prematurely");
    return buf.shiftN(n);
  }
  var Accumulator = class {
    buf;
    constructor() {
      this.setToZero();
    }
    setToZero() {
      this.buf = new Uint8Array(ID_SIZE);
    }
    add(otherBuf) {
      let currCarry = 0, nextCarry = 0;
      let p = new DataView(this.buf.buffer);
      let po = new DataView(otherBuf.buffer);
      for (let i2 = 0;i2 < 8; i2++) {
        let offset = i2 * 4;
        let orig = p.getUint32(offset, true);
        let otherV = po.getUint32(offset, true);
        let next = orig;
        next += currCarry;
        next += otherV;
        if (next > 4294967295)
          nextCarry = 1;
        p.setUint32(offset, next & 4294967295, true);
        currCarry = nextCarry;
        nextCarry = 0;
      }
    }
    negate() {
      let p = new DataView(this.buf.buffer);
      for (let i2 = 0;i2 < 8; i2++) {
        let offset = i2 * 4;
        p.setUint32(offset, ~p.getUint32(offset, true));
      }
      let one = new Uint8Array(ID_SIZE);
      one[0] = 1;
      this.add(one);
    }
    getFingerprint(n) {
      let input = new WrappedBuffer;
      input.extend(this.buf);
      input.extend(encodeVarInt(n));
      let hash3 = sha2562(input.unwrap());
      return hash3.subarray(0, FINGERPRINT_SIZE);
    }
  };
  var NegentropyStorageVector = class {
    items;
    sealed;
    constructor() {
      this.items = [];
      this.sealed = false;
    }
    insert(timestamp, id) {
      if (this.sealed)
        throw Error("already sealed");
      const idb = hexToBytes3(id);
      if (idb.byteLength !== ID_SIZE)
        throw Error("bad id size for added item");
      this.items.push({ timestamp, id: idb });
    }
    seal() {
      if (this.sealed)
        throw Error("already sealed");
      this.sealed = true;
      this.items.sort(itemCompare);
      for (let i2 = 1;i2 < this.items.length; i2++) {
        if (itemCompare(this.items[i2 - 1], this.items[i2]) === 0)
          throw Error("duplicate item inserted");
      }
    }
    unseal() {
      this.sealed = false;
    }
    size() {
      this._checkSealed();
      return this.items.length;
    }
    getItem(i2) {
      this._checkSealed();
      if (i2 >= this.items.length)
        throw Error("out of range");
      return this.items[i2];
    }
    iterate(begin, end, cb) {
      this._checkSealed();
      this._checkBounds(begin, end);
      for (let i2 = begin;i2 < end; ++i2) {
        if (!cb(this.items[i2], i2))
          break;
      }
    }
    findLowerBound(begin, end, bound) {
      this._checkSealed();
      this._checkBounds(begin, end);
      return this._binarySearch(this.items, begin, end, (a) => itemCompare(a, bound) < 0);
    }
    fingerprint(begin, end) {
      let out = new Accumulator;
      out.setToZero();
      this.iterate(begin, end, (item) => {
        out.add(item.id);
        return true;
      });
      return out.getFingerprint(end - begin);
    }
    _checkSealed() {
      if (!this.sealed)
        throw Error("not sealed");
    }
    _checkBounds(begin, end) {
      if (begin > end || end > this.items.length)
        throw Error("bad range");
    }
    _binarySearch(arr, first, last, cmp) {
      let count = last - first;
      while (count > 0) {
        let it = first;
        let step = Math.floor(count / 2);
        it += step;
        if (cmp(arr[it])) {
          first = ++it;
          count -= step + 1;
        } else {
          count = step;
        }
      }
      return first;
    }
  };
  var Negentropy = class {
    storage;
    frameSizeLimit;
    lastTimestampIn;
    lastTimestampOut;
    constructor(storage, frameSizeLimit = 60000) {
      if (frameSizeLimit < 4096)
        throw Error("frameSizeLimit too small");
      this.storage = storage;
      this.frameSizeLimit = frameSizeLimit;
      this.lastTimestampIn = 0;
      this.lastTimestampOut = 0;
    }
    _bound(timestamp, id) {
      return { timestamp, id: id || new Uint8Array(0) };
    }
    initiate() {
      let output4 = new WrappedBuffer;
      output4.extend(new Uint8Array([PROTOCOL_VERSION]));
      this.splitRange(0, this.storage.size(), this._bound(Number.MAX_VALUE), output4);
      return bytesToHex3(output4.unwrap());
    }
    reconcile(queryMsg, onhave, onneed) {
      const query = new WrappedBuffer(hexToBytes3(queryMsg));
      this.lastTimestampIn = this.lastTimestampOut = 0;
      let fullOutput = new WrappedBuffer;
      fullOutput.extend(new Uint8Array([PROTOCOL_VERSION]));
      let protocolVersion = getByte(query);
      if (protocolVersion < 96 || protocolVersion > 111)
        throw Error("invalid negentropy protocol version byte");
      if (protocolVersion !== PROTOCOL_VERSION) {
        throw Error("unsupported negentropy protocol version requested: " + (protocolVersion - 96));
      }
      let storageSize = this.storage.size();
      let prevBound = this._bound(0);
      let prevIndex = 0;
      let skip = false;
      while (query.length !== 0) {
        let o = new WrappedBuffer;
        let doSkip = () => {
          if (skip) {
            skip = false;
            o.extend(this.encodeBound(prevBound));
            o.extend(encodeVarInt(Mode.Skip));
          }
        };
        let currBound = this.decodeBound(query);
        let mode = decodeVarInt(query);
        let lower = prevIndex;
        let upper = this.storage.findLowerBound(prevIndex, storageSize, currBound);
        if (mode === Mode.Skip) {
          skip = true;
        } else if (mode === Mode.Fingerprint) {
          let theirFingerprint = getBytes(query, FINGERPRINT_SIZE);
          let ourFingerprint = this.storage.fingerprint(lower, upper);
          if (compareUint8Array(theirFingerprint, ourFingerprint) !== 0) {
            doSkip();
            this.splitRange(lower, upper, currBound, o);
          } else {
            skip = true;
          }
        } else if (mode === Mode.IdList) {
          let numIds = decodeVarInt(query);
          let theirElems = {};
          for (let i2 = 0;i2 < numIds; i2++) {
            let e = getBytes(query, ID_SIZE);
            theirElems[bytesToHex3(e)] = e;
          }
          skip = true;
          this.storage.iterate(lower, upper, (item) => {
            let k = item.id;
            const id = bytesToHex3(k);
            if (!theirElems[id]) {
              onhave?.(id);
            } else {
              delete theirElems[bytesToHex3(k)];
            }
            return true;
          });
          if (onneed) {
            for (let v of Object.values(theirElems)) {
              onneed(bytesToHex3(v));
            }
          }
        } else {
          throw Error("unexpected mode");
        }
        if (this.exceededFrameSizeLimit(fullOutput.length + o.length)) {
          let remainingFingerprint = this.storage.fingerprint(upper, storageSize);
          fullOutput.extend(this.encodeBound(this._bound(Number.MAX_VALUE)));
          fullOutput.extend(encodeVarInt(Mode.Fingerprint));
          fullOutput.extend(remainingFingerprint);
          break;
        } else {
          fullOutput.extend(o);
        }
        prevIndex = upper;
        prevBound = currBound;
      }
      return fullOutput.length === 1 ? null : bytesToHex3(fullOutput.unwrap());
    }
    splitRange(lower, upper, upperBound, o) {
      let numElems = upper - lower;
      let buckets = 16;
      if (numElems < buckets * 2) {
        o.extend(this.encodeBound(upperBound));
        o.extend(encodeVarInt(Mode.IdList));
        o.extend(encodeVarInt(numElems));
        this.storage.iterate(lower, upper, (item) => {
          o.extend(item.id);
          return true;
        });
      } else {
        let itemsPerBucket = Math.floor(numElems / buckets);
        let bucketsWithExtra = numElems % buckets;
        let curr = lower;
        for (let i2 = 0;i2 < buckets; i2++) {
          let bucketSize = itemsPerBucket + (i2 < bucketsWithExtra ? 1 : 0);
          let ourFingerprint = this.storage.fingerprint(curr, curr + bucketSize);
          curr += bucketSize;
          let nextBound;
          if (curr === upper) {
            nextBound = upperBound;
          } else {
            let prevItem;
            let currItem;
            this.storage.iterate(curr - 1, curr + 1, (item, index) => {
              if (index === curr - 1)
                prevItem = item;
              else
                currItem = item;
              return true;
            });
            nextBound = this.getMinimalBound(prevItem, currItem);
          }
          o.extend(this.encodeBound(nextBound));
          o.extend(encodeVarInt(Mode.Fingerprint));
          o.extend(ourFingerprint);
        }
      }
    }
    exceededFrameSizeLimit(n) {
      return n > this.frameSizeLimit - 200;
    }
    decodeTimestampIn(encoded) {
      let timestamp = decodeVarInt(encoded);
      timestamp = timestamp === 0 ? Number.MAX_VALUE : timestamp - 1;
      if (this.lastTimestampIn === Number.MAX_VALUE || timestamp === Number.MAX_VALUE) {
        this.lastTimestampIn = Number.MAX_VALUE;
        return Number.MAX_VALUE;
      }
      timestamp += this.lastTimestampIn;
      this.lastTimestampIn = timestamp;
      return timestamp;
    }
    decodeBound(encoded) {
      let timestamp = this.decodeTimestampIn(encoded);
      let len = decodeVarInt(encoded);
      if (len > ID_SIZE)
        throw Error("bound key too long");
      let id = getBytes(encoded, len);
      return { timestamp, id };
    }
    encodeTimestampOut(timestamp) {
      if (timestamp === Number.MAX_VALUE) {
        this.lastTimestampOut = Number.MAX_VALUE;
        return encodeVarInt(0);
      }
      let temp = timestamp;
      timestamp -= this.lastTimestampOut;
      this.lastTimestampOut = temp;
      return encodeVarInt(timestamp + 1);
    }
    encodeBound(key) {
      let output4 = new WrappedBuffer;
      output4.extend(this.encodeTimestampOut(key.timestamp));
      output4.extend(encodeVarInt(key.id.length));
      output4.extend(key.id);
      return output4;
    }
    getMinimalBound(prev, curr) {
      if (curr.timestamp !== prev.timestamp) {
        return this._bound(curr.timestamp);
      } else {
        let sharedPrefixBytes = 0;
        let currKey = curr.id;
        let prevKey = prev.id;
        for (let i2 = 0;i2 < ID_SIZE; i2++) {
          if (currKey[i2] !== prevKey[i2])
            break;
          sharedPrefixBytes++;
        }
        return this._bound(curr.timestamp, curr.id.subarray(0, sharedPrefixBytes + 1));
      }
    }
  };
  function compareUint8Array(a, b) {
    for (let i2 = 0;i2 < a.byteLength; i2++) {
      if (a[i2] < b[i2])
        return -1;
      if (a[i2] > b[i2])
        return 1;
    }
    if (a.byteLength > b.byteLength)
      return 1;
    if (a.byteLength < b.byteLength)
      return -1;
    return 0;
  }
  function itemCompare(a, b) {
    if (a.timestamp === b.timestamp) {
      return compareUint8Array(a.id, b.id);
    }
    return a.timestamp - b.timestamp;
  }
  var NegentropySync = class {
    relay;
    storage;
    neg;
    filter;
    subscription;
    onhave;
    onneed;
    constructor(relay, storage, filter, params = {}) {
      this.relay = relay;
      this.storage = storage;
      this.neg = new Negentropy(storage);
      this.onhave = params.onhave;
      this.onneed = params.onneed;
      this.filter = filter;
      this.subscription = this.relay.prepareSubscription([{}], { label: params.label || "negentropy" });
      this.subscription.oncustom = (data) => {
        switch (data[0]) {
          case "NEG-MSG": {
            if (data.length < 3) {
              console.warn(`got invalid NEG-MSG from ${this.relay.url}: ${data}`);
            }
            try {
              const response = this.neg.reconcile(data[2], this.onhave, this.onneed);
              if (response) {
                this.relay.send(`["NEG-MSG", "${this.subscription.id}", "${response}"]`);
              } else {
                this.close();
                params.onclose?.();
              }
            } catch (error) {
              console.error("negentropy reconcile error:", error);
              params?.onclose?.(`reconcile error: ${error}`);
            }
            break;
          }
          case "NEG-CLOSE": {
            const reason = data[2];
            console.warn("negentropy error:", reason);
            params.onclose?.(reason);
            break;
          }
          case "NEG-ERR": {
            params.onclose?.();
          }
        }
      };
    }
    async start() {
      const initMsg = this.neg.initiate();
      this.relay.send(`["NEG-OPEN","${this.subscription.id}",${JSON.stringify(this.filter)},"${initMsg}"]`);
    }
    close() {
      this.relay.send(`["NEG-CLOSE","${this.subscription.id}"]`);
      this.subscription.close();
    }
  };
  var nip98_exports = {};
  __export2(nip98_exports, {
    getToken: () => getToken,
    hashPayload: () => hashPayload,
    unpackEventFromToken: () => unpackEventFromToken,
    validateEvent: () => validateEvent2,
    validateEventKind: () => validateEventKind,
    validateEventMethodTag: () => validateEventMethodTag,
    validateEventPayloadTag: () => validateEventPayloadTag,
    validateEventTimestamp: () => validateEventTimestamp,
    validateEventUrlTag: () => validateEventUrlTag,
    validateToken: () => validateToken
  });
  var _authorizationScheme = "Nostr ";
  async function getToken(loginUrl, httpMethod, sign, includeAuthorizationScheme = false, payload) {
    const event = {
      kind: HTTPAuth,
      tags: [
        ["u", loginUrl],
        ["method", httpMethod]
      ],
      created_at: Math.round(new Date().getTime() / 1000),
      content: ""
    };
    if (payload) {
      event.tags.push(["payload", hashPayload(payload)]);
    }
    const signedEvent = await sign(event);
    const authorizationScheme = includeAuthorizationScheme ? _authorizationScheme : "";
    return authorizationScheme + base64.encode(utf8Encoder.encode(JSON.stringify(signedEvent)));
  }
  async function validateToken(token, url, method) {
    const event = await unpackEventFromToken(token).catch((error) => {
      throw error;
    });
    const valid = await validateEvent2(event, url, method).catch((error) => {
      throw error;
    });
    return valid;
  }
  async function unpackEventFromToken(token) {
    if (!token) {
      throw new Error("Missing token");
    }
    token = token.replace(_authorizationScheme, "");
    const eventB64 = utf8Decoder.decode(base64.decode(token));
    if (!eventB64 || eventB64.length === 0 || !eventB64.startsWith("{")) {
      throw new Error("Invalid token");
    }
    const event = JSON.parse(eventB64);
    return event;
  }
  function validateEventTimestamp(event) {
    if (!event.created_at) {
      return false;
    }
    return Math.round(new Date().getTime() / 1000) - event.created_at < 60;
  }
  function validateEventKind(event) {
    return event.kind === HTTPAuth;
  }
  function validateEventUrlTag(event, url) {
    const urlTag = event.tags.find((t) => t[0] === "u");
    if (!urlTag) {
      return false;
    }
    return urlTag.length > 0 && urlTag[1] === url;
  }
  function validateEventMethodTag(event, method) {
    const methodTag = event.tags.find((t) => t[0] === "method");
    if (!methodTag) {
      return false;
    }
    return methodTag.length > 0 && methodTag[1].toLowerCase() === method.toLowerCase();
  }
  function hashPayload(payload) {
    const hash3 = sha2562(utf8Encoder.encode(JSON.stringify(payload)));
    return bytesToHex2(hash3);
  }
  function validateEventPayloadTag(event, payload) {
    const payloadTag = event.tags.find((t) => t[0] === "payload");
    if (!payloadTag) {
      return false;
    }
    const payloadHash = hashPayload(payload);
    return payloadTag.length > 0 && payloadTag[1] === payloadHash;
  }
  async function validateEvent2(event, url, method, body) {
    if (!verifyEvent(event)) {
      throw new Error("Invalid nostr event, signature invalid");
    }
    if (!validateEventKind(event)) {
      throw new Error("Invalid nostr event, kind invalid");
    }
    if (!validateEventTimestamp(event)) {
      throw new Error("Invalid nostr event, created_at timestamp invalid");
    }
    if (!validateEventUrlTag(event, url)) {
      throw new Error("Invalid nostr event, url tag invalid");
    }
    if (!validateEventMethodTag(event, method)) {
      throw new Error("Invalid nostr event, method tag invalid");
    }
    if (Boolean(body) && typeof body === "object" && Object.keys(body).length > 0) {
      if (!validateEventPayloadTag(event, body)) {
        throw new Error("Invalid nostr event, payload tag does not match request body hash");
      }
    }
    return true;
  }

  // ../../node_modules/dexie/import-wrapper.mjs
  var import_dexie = __toESM(require_dexie());
  var DexieSymbol = Symbol.for("Dexie");
  var Dexie = globalThis[DexieSymbol] || (globalThis[DexieSymbol] = import_dexie.default);
  if (import_dexie.default.semVer !== Dexie.semVer) {
    throw new Error(`Two different versions of Dexie loaded in the same app: ${import_dexie.default.semVer} and ${Dexie.semVer}`);
  }
  var import_wrapper_default = Dexie;

  // src/engine/local-relay.ts
  class LocalRelay {
    url;
    _connected = false;
    db;
    subs = new Set;
    get connected() {
      return this._connected;
    }
    constructor(url = "mirage://local", dbName) {
      this.url = url;
      this.db = new MirageDB(dbName);
    }
    async connect() {
      await this.db.open();
      this._connected = true;
    }
    async close() {
      this._connected = false;
      this.subs.forEach((s) => s.close());
      this.subs.clear();
    }
    async publish(event) {
      if (!this._connected) {
        throw new Error("LocalRelay not connected");
      }
      if (event.kind === 5) {
        const idsToDelete = event.tags.filter((t) => t[0] === "e").map((t) => t[1]);
        const addrsToDelete = event.tags.filter((t) => t[0] === "a").map((t) => t[1]);
        await this.db.transaction("rw", this.db.events, async () => {
          if (idsToDelete.length > 0) {
            await this.db.events.where("id").anyOf(idsToDelete).delete();
          }
          for (const addr of addrsToDelete) {
            const firstColon = addr.indexOf(":");
            const secondColon = addr.indexOf(":", firstColon + 1);
            if (firstColon === -1 || secondColon === -1)
              continue;
            const kindStr = addr.slice(0, firstColon);
            const pubkey = addr.slice(firstColon + 1, secondColon);
            const dVal = addr.slice(secondColon + 1);
            const kind = parseInt(kindStr, 10);
            if (!isNaN(kind) && pubkey) {
              const candidates = await this.db.events.where("pubkey").equals(pubkey).filter((e) => e.kind === kind).toArray();
              const toDelete = candidates.filter((e) => {
                const dTag = e.tags.find((t) => t[0] === "d");
                return dTag && dTag[1] === dVal;
              });
              if (toDelete.length > 0) {
                await this.db.events.bulkDelete(toDelete.map((e) => e.id));
              }
            }
          }
        });
        return "OK";
      }
      try {
        await this.db.events.put(event);
        this.broadcast(event);
        return "OK";
      } catch (e) {
        return "Error: " + e;
      }
    }
    broadcast(event) {
      this.subs.forEach((sub) => {
        if (matchFilters(sub.filters, event)) {
          sub.onevent(event);
        }
      });
    }
    async countEvents(filters) {
      const events = await this.queryLocal(filters);
      return events.length;
    }
    subscribe(filters, params) {
      const sub = {
        filters,
        onevent: params.onevent,
        oneose: params.oneose,
        close: () => {
          this.subs.delete(sub);
        }
      };
      this.subs.add(sub);
      this.queryLocal(filters).then((events) => {
        events.forEach((e) => sub.onevent(e));
        if (sub.oneose)
          sub.oneose();
      });
      return sub;
    }
    async queryLocal(filters) {
      const results = new Map;
      for (const filter of filters) {
        let collection = this.db.events.toCollection();
        if (filter.ids)
          collection = this.db.events.where("id").anyOf(filter.ids);
        else if (filter.authors)
          collection = this.db.events.where("pubkey").anyOf(filter.authors);
        else if (filter.kinds)
          collection = this.db.events.where("kind").anyOf(filter.kinds);
        const events = await collection.toArray();
        events.forEach((e) => {
          if (matchFilters([filter], e)) {
            results.set(e.id, e);
          }
        });
      }
      return Array.from(results.values()).sort((a, b) => b.created_at - a.created_at);
    }
  }

  class MirageDB extends import_wrapper_default {
    events;
    constructor(dbName = "MirageEvents") {
      super(dbName);
      this.version(1).stores({
        events: "id, pubkey, kind, created_at"
      });
    }
  }

  // src/engine/mirage-pool.ts
  class ExtendedSimplePool extends SimplePool {
    localRelay;
    constructor() {
      super();
      this.localRelay = new LocalRelay;
    }
    async ensureRelay(url) {
      if (url === "mirage://local") {
        if (!this.localRelay.connected) {
          await this.localRelay.connect();
        }
        return this.localRelay;
      }
      return super.ensureRelay(url);
    }
    async connectRelay(url) {
      return this.ensureRelay(url);
    }
  }

  class MiragePool {
    pool;
    relays = new Map;
    constructor() {
      this.pool = new ExtendedSimplePool;
    }
    async setRelays(urls) {
      const newUrls = new Set(urls);
      const currentUrls = new Set(this.relays.keys());
      const toRemove = [...currentUrls].filter((url) => !newUrls.has(url));
      const toAdd = urls.filter((url) => !currentUrls.has(url));
      if (toRemove.length > 0) {
        this.pool.close(toRemove);
        toRemove.forEach((url) => this.relays.delete(url));
      }
      await Promise.all(toAdd.map(async (url) => {
        try {
          const relay = await this.pool.ensureRelay(url);
          this.relays.set(url, relay);
        } catch (e) {
          console.error(`[MiragePool] Failed to connect to ${url}`, e);
        }
      }));
    }
    async addRelay(url) {
      if (this.relays.has(url))
        return;
      try {
        const relay = await this.pool.ensureRelay(url);
        this.relays.set(url, relay);
      } catch (e) {
        console.error(`[MiragePool] Failed to add relay ${url}`, e);
      }
    }
    removeRelay(url) {
      if (!this.relays.has(url))
        return;
      this.relays.delete(url);
      this.pool.close([url]);
    }
    getRelays() {
      return Array.from(this.relays.keys());
    }
    async publish(event, targetRelays) {
      const relays = targetRelays || Array.from(this.relays.keys());
      if (relays.length === 0)
        return [];
      return Promise.all(this.pool.publish(relays, event));
    }
    subscribe(filters, params, targetRelays) {
      const relays = targetRelays || Array.from(this.relays.keys());
      return this.pool.subscribeMany(relays, filters, params);
    }
    async list(filters, targetRelays) {
      const relays = targetRelays || Array.from(this.relays.keys());
      if (relays.length === 0) {
        return [];
      }
      try {
        const events = await this.pool.querySync(relays, filters[0]);
        return events;
      } catch (e) {
        console.error("[MiragePool] list() querySync failed", e);
        return [];
      }
    }
    async get(filter, targetRelays) {
      const relays = targetRelays || Array.from(this.relays.keys());
      return this.pool.get(relays, filter);
    }
    withRelays(relays) {
      return new ScopedMiragePool(this, relays);
    }
    getStats() {
      return Array.from(this.relays.entries()).map(([url, relay]) => {
        if (url === "mirage://local") {
          return { url, status: this.pool.localRelay.connected ? "connected" : "disconnected" };
        }
        return {
          url,
          status: relay.connected || relay.status === 1 || relay.open ? "connected" : "connecting"
        };
      });
    }
  }

  class ScopedMiragePool {
    mainPool;
    scopedRelays;
    constructor(mainPool, scopedRelays) {
      this.mainPool = mainPool;
      this.scopedRelays = scopedRelays;
    }
    async get(filter, relays) {
      return this.mainPool.get(filter, relays || this.scopedRelays);
    }
    async list(filters, relays) {
      return this.mainPool.list(filters, relays || this.scopedRelays);
    }
    async publish(event, relays) {
      return this.mainPool.publish(event, relays || this.scopedRelays);
    }
    subscribe(filters, params, relays) {
      return this.mainPool.subscribe(filters, params, relays || this.scopedRelays);
    }
    withRelays(relays) {
      return new ScopedMiragePool(this.mainPool, relays);
    }
    async setRelays(urls) {
      return this.mainPool.setRelays(urls);
    }
    async addRelay(url) {
      return this.mainPool.addRelay(url);
    }
    removeRelay(url) {
      return this.mainPool.removeRelay(url);
    }
    getRelays() {
      return this.scopedRelays;
    }
    getStats() {
      return this.mainPool.getStats();
    }
  }

  // src/engine/routes/user.ts
  async function getCurrentUser(ctx) {
    if (!ctx.currentPubkey) {
      return { status: 401, body: { error: "Not authenticated" } };
    }
    return getUserByPubkey(ctx, ctx.currentPubkey);
  }
  async function getUserByPubkey(ctx, pubkey) {
    const filter = {
      kinds: [0],
      authors: [pubkey],
      limit: 1
    };
    const event = await ctx.pool.get(filter);
    if (!event) {
      return { status: 404, body: { error: "User not found" } };
    }
    try {
      const metadata = JSON.parse(event.content);
      const profile = {
        pubkey: event.pubkey,
        name: metadata.name,
        displayName: metadata.display_name || metadata.displayName,
        about: metadata.about,
        picture: metadata.picture,
        nip05: metadata.nip05,
        lud16: metadata.lud16
      };
      return { status: 200, body: profile };
    } catch {
      return { status: 500, body: { error: "Invalid metadata format" } };
    }
  }

  // src/engine/keys.ts
  var SYSTEM_APP_ORIGIN = "mirage";
  var KEY_STORAGE_ID = "space_keys";
  async function loadSpaceKeys(ctx) {
    try {
      const mirageCtx = { ...ctx, appOrigin: SYSTEM_APP_ORIGIN };
      const rawMap = await internalGetStorage(mirageCtx, KEY_STORAGE_ID);
      if (!rawMap) {
        return new Map;
      }
      const map = new Map;
      for (const [id, keyInfo] of Object.entries(rawMap)) {
        map.set(id, keyInfo);
      }
      return map;
    } catch (error) {
      console.error("[Keys] Failed to load keys:", error);
      return new Map;
    }
  }
  async function saveSpaceKeys(ctx, keys) {
    try {
      const rawMap = {};
      for (const [id, keyInfo] of keys.entries()) {
        rawMap[id] = keyInfo;
      }
      const mirageCtx = { ...ctx, appOrigin: SYSTEM_APP_ORIGIN };
      await internalPutStorage(mirageCtx, KEY_STORAGE_ID, rawMap);
      console.log("[Keys] Saved keys to NIP-78 (global keychain)");
    } catch (error) {
      console.error("[Keys] Failed to save keys:", error);
      throw error;
    }
  }

  // src/engine/routes/storage.ts
  async function internalGetStorage(ctx, key, targetPubkey) {
    if (!ctx.currentPubkey && !targetPubkey)
      throw new Error("Not authenticated");
    const isSystemStorage = ctx.appOrigin === SYSTEM_APP_ORIGIN;
    if (!isSystemStorage && !ctx.currentSpace?.id) {
      throw new Error("Space context required for storage operations");
    }
    const author = targetPubkey || ctx.currentPubkey;
    const dTag = isSystemStorage ? `${ctx.appOrigin}:${key}` : `${ctx.appOrigin}:${ctx.currentSpace.id}:${key}`;
    const filter = {
      kinds: [30078],
      authors: [author],
      "#d": [dTag],
      limit: 1
    };
    console.log(`[Storage_DEBUG] internalGetStorage calling pool.get()`, {
      filter,
      relayCount: ctx.pool.getRelays().length,
      relays: ctx.pool.getRelays()
    });
    const event = await ctx.pool.get(filter);
    if (!event) {
      console.log(`[Storage_DEBUG] internalGetStorage: No event found for dTag=${dTag}`);
      return null;
    }
    console.log(`[Storage_DEBUG] internalGetStorage: Found event ${event.id} kind=${event.kind}`);
    const content = event.content;
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch {}
    if (ctx.currentPubkey === author) {
      try {
        const plaintext = await ctx.requestDecrypt(ctx.currentPubkey, content);
        try {
          return JSON.parse(plaintext);
        } catch (e) {
          return plaintext;
        }
      } catch (e) {
        console.error(`Decryption failed:`, e);
      }
    }
    return content;
  }
  async function internalPutStorage(ctx, key, value, isPublic = false) {
    if (!ctx.currentPubkey)
      throw new Error("Not authenticated");
    const isSystemStorage = ctx.appOrigin === SYSTEM_APP_ORIGIN;
    if (!isSystemStorage && !ctx.currentSpace?.id) {
      throw new Error("Space context required for storage operations");
    }
    const dTag = isSystemStorage ? `${ctx.appOrigin}:${key}` : `${ctx.appOrigin}:${ctx.currentSpace.id}:${key}`;
    const plaintext = typeof value === "string" ? value : JSON.stringify(value);
    let content = plaintext;
    if (!isPublic) {
      content = await ctx.requestEncrypt(ctx.currentPubkey, plaintext);
    }
    const created_at = Math.floor(Date.now() / 1000);
    const unsignedEvent = {
      kind: 30078,
      created_at,
      tags: [["d", dTag]],
      content
    };
    const signedEvent = await ctx.requestSign(unsignedEvent);
    await ctx.pool.publish(signedEvent);
    return signedEvent;
  }
  async function getStorage(ctx, key, params) {
    try {
      if (!ctx.currentPubkey && !params.pubkey)
        return { status: 401, body: { error: "Not authenticated" } };
      const value = await internalGetStorage(ctx, key, params.pubkey);
      if (value === null) {
        return { status: 404, body: { error: "Key not found" } };
      }
      return {
        status: 200,
        body: {
          key,
          value,
          updatedAt: Math.floor(Date.now() / 1000)
        }
      };
    } catch (error) {
      console.error("[Storage] Error:", error);
      return { status: 500, body: { error: error instanceof Error ? error.message : "Storage error" } };
    }
  }
  async function putStorage(ctx, key, body, params) {
    try {
      if (!ctx.currentPubkey)
        return { status: 401, body: { error: "Not authenticated" } };
      const isPublic = params.public === "true";
      const event = await internalPutStorage(ctx, key, body, isPublic);
      return {
        status: 200,
        body: {
          key,
          value: body,
          updatedAt: event.created_at,
          public: isPublic
        }
      };
    } catch (error) {
      console.error("[Storage] Error:", error);
      return { status: 500, body: { error: error instanceof Error ? error.message : "Storage error" } };
    }
  }
  async function deleteStorage(ctx, key) {
    if (!ctx.currentPubkey) {
      return { status: 401, body: { error: "Not authenticated" } };
    }
    const isSystemStorage = ctx.appOrigin === SYSTEM_APP_ORIGIN;
    if (!isSystemStorage && !ctx.currentSpace?.id) {
      return { status: 400, body: { error: "Space context required for storage operations" } };
    }
    const dTag = isSystemStorage ? `${ctx.appOrigin}:${key}` : `${ctx.appOrigin}:${ctx.currentSpace.id}:${key}`;
    let ciphertext;
    try {
      ciphertext = await ctx.requestEncrypt(ctx.currentPubkey, "");
    } catch (err) {
      return { status: 500, body: { error: "Failed to encrypt deletion marker" } };
    }
    const unsignedEvent = {
      kind: 30078,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["d", dTag], ["deleted", "true"]],
      content: ciphertext
    };
    try {
      const signedTombstone = await ctx.requestSign(unsignedEvent);
      await ctx.pool.publish(signedTombstone);
      const deletionEvent = {
        kind: 5,
        created_at: Math.floor(Date.now() / 1000) + 5,
        content: "Deleted by Mirage",
        tags: [["a", `30078:${ctx.currentPubkey}:${dTag}`]]
      };
      const signedDeletion = await ctx.requestSign(deletionEvent);
      await ctx.pool.publish(signedDeletion);
      return { status: 200, body: { deleted: true, key } };
    } catch (error) {
      console.error("[Storage] Delete failed:", error);
      return { status: 500, body: { error: "Failed to delete value" } };
    }
  }

  // ../../node_modules/@noble/ciphers/utils.js
  /*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
  function isBytes2(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function abool(b) {
    if (typeof b !== "boolean")
      throw new Error(`boolean expected, not ${b}`);
  }
  function anumber(n) {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error("positive integer expected, got " + n);
  }
  function abytes(value, length, title = "") {
    const bytes4 = isBytes2(value);
    const len = value?.length;
    const needsLen = length !== undefined;
    if (!bytes4 || needsLen && len !== length) {
      const prefix = title && `"${title}" `;
      const ofLen = needsLen ? ` of length ${length}` : "";
      const got = bytes4 ? `length=${len}` : `type=${typeof value}`;
      throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
    }
    return value;
  }
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function aoutput(out, instance) {
    abytes(out, undefined, "output");
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error("digestInto() expects output buffer of length at least " + min);
    }
  }
  function u322(arr) {
    return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
  }
  function clean(...arrays) {
    for (let i2 = 0;i2 < arrays.length; i2++) {
      arrays[i2].fill(0);
    }
  }
  function createView4(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  var isLE4 = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
  var hasHexBuiltin = /* @__PURE__ */ (() => typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function")();
  var hexes4 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i2) => i2.toString(16).padStart(2, "0"));
  function bytesToHex4(bytes4) {
    abytes(bytes4);
    if (hasHexBuiltin)
      return bytes4.toHex();
    let hex2 = "";
    for (let i2 = 0;i2 < bytes4.length; i2++) {
      hex2 += hexes4[bytes4[i2]];
    }
    return hex2;
  }
  function checkOpts2(defaults, opts) {
    if (opts == null || typeof opts !== "object")
      throw new Error("options must be defined");
    const merged = Object.assign(defaults, opts);
    return merged;
  }
  function equalBytes3(a, b) {
    if (a.length !== b.length)
      return false;
    let diff = 0;
    for (let i2 = 0;i2 < a.length; i2++)
      diff |= a[i2] ^ b[i2];
    return diff === 0;
  }
  var wrapCipher2 = (params, constructor) => {
    function wrappedCipher(key, ...args) {
      abytes(key, undefined, "key");
      if (!isLE4)
        throw new Error("Non little-endian hardware is not yet supported");
      if (params.nonceLength !== undefined) {
        const nonce = args[0];
        abytes(nonce, params.varSizeNonce ? undefined : params.nonceLength, "nonce");
      }
      const tagl = params.tagLength;
      if (tagl && args[1] !== undefined)
        abytes(args[1], undefined, "AAD");
      const cipher = constructor(key, ...args);
      const checkOutput = (fnLength, output4) => {
        if (output4 !== undefined) {
          if (fnLength !== 2)
            throw new Error("cipher output not supported");
          abytes(output4, undefined, "output");
        }
      };
      let called = false;
      const wrCipher = {
        encrypt(data, output4) {
          if (called)
            throw new Error("cannot encrypt() twice with same key + nonce");
          called = true;
          abytes(data);
          checkOutput(cipher.encrypt.length, output4);
          return cipher.encrypt(data, output4);
        },
        decrypt(data, output4) {
          abytes(data);
          if (tagl && data.length < tagl)
            throw new Error('"ciphertext" expected length bigger than tagLength=' + tagl);
          checkOutput(cipher.decrypt.length, output4);
          return cipher.decrypt(data, output4);
        }
      };
      return wrCipher;
    }
    Object.assign(wrappedCipher, params);
    return wrappedCipher;
  };
  function getOutput(expectedLength, out, onlyAligned = true) {
    if (out === undefined)
      return new Uint8Array(expectedLength);
    if (out.length !== expectedLength)
      throw new Error('"output" expected Uint8Array of length ' + expectedLength + ", got: " + out.length);
    if (onlyAligned && !isAligned322(out))
      throw new Error("invalid output, must be aligned");
    return out;
  }
  function u64Lengths(dataLength, aadLength, isLE5) {
    abool(isLE5);
    const num = new Uint8Array(16);
    const view = createView4(num);
    view.setBigUint64(0, BigInt(aadLength), isLE5);
    view.setBigUint64(8, BigInt(dataLength), isLE5);
    return num;
  }
  function isAligned322(bytes4) {
    return bytes4.byteOffset % 4 === 0;
  }
  function copyBytes(bytes4) {
    return Uint8Array.from(bytes4);
  }

  // ../../node_modules/@noble/ciphers/_arx.js
  var encodeStr = (str) => Uint8Array.from(str.split(""), (c) => c.charCodeAt(0));
  var sigma162 = encodeStr("expand 16-byte k");
  var sigma322 = encodeStr("expand 32-byte k");
  var sigma16_322 = u322(sigma162);
  var sigma32_322 = u322(sigma322);
  function rotl2(a, b) {
    return a << b | a >>> 32 - b;
  }
  function isAligned323(b) {
    return b.byteOffset % 4 === 0;
  }
  var BLOCK_LEN2 = 64;
  var BLOCK_LEN322 = 16;
  var MAX_COUNTER2 = 2 ** 32 - 1;
  var U32_EMPTY2 = Uint32Array.of();
  function runCipher2(core, sigma2, key, nonce, data, output4, counter, rounds) {
    const len = data.length;
    const block = new Uint8Array(BLOCK_LEN2);
    const b32 = u322(block);
    const isAligned = isAligned323(data) && isAligned323(output4);
    const d32 = isAligned ? u322(data) : U32_EMPTY2;
    const o32 = isAligned ? u322(output4) : U32_EMPTY2;
    for (let pos = 0;pos < len; counter++) {
      core(sigma2, key, nonce, b32, counter, rounds);
      if (counter >= MAX_COUNTER2)
        throw new Error("arx: counter overflow");
      const take = Math.min(BLOCK_LEN2, len - pos);
      if (isAligned && take === BLOCK_LEN2) {
        const pos32 = pos / 4;
        if (pos % 4 !== 0)
          throw new Error("arx: invalid block position");
        for (let j = 0, posj;j < BLOCK_LEN322; j++) {
          posj = pos32 + j;
          o32[posj] = d32[posj] ^ b32[j];
        }
        pos += BLOCK_LEN2;
        continue;
      }
      for (let j = 0, posj;j < take; j++) {
        posj = pos + j;
        output4[posj] = data[posj] ^ block[j];
      }
      pos += take;
    }
  }
  function createCipher2(core, opts) {
    const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds } = checkOpts2({ allowShortKeys: false, counterLength: 8, counterRight: false, rounds: 20 }, opts);
    if (typeof core !== "function")
      throw new Error("core must be a function");
    anumber(counterLength);
    anumber(rounds);
    abool(counterRight);
    abool(allowShortKeys);
    return (key, nonce, data, output4, counter = 0) => {
      abytes(key, undefined, "key");
      abytes(nonce, undefined, "nonce");
      abytes(data, undefined, "data");
      const len = data.length;
      if (output4 === undefined)
        output4 = new Uint8Array(len);
      abytes(output4, undefined, "output");
      anumber(counter);
      if (counter < 0 || counter >= MAX_COUNTER2)
        throw new Error("arx: counter overflow");
      if (output4.length < len)
        throw new Error(`arx: output (${output4.length}) is shorter than data (${len})`);
      const toClean = [];
      let l = key.length;
      let k;
      let sigma2;
      if (l === 32) {
        toClean.push(k = copyBytes(key));
        sigma2 = sigma32_322;
      } else if (l === 16 && allowShortKeys) {
        k = new Uint8Array(32);
        k.set(key);
        k.set(key, 16);
        sigma2 = sigma16_322;
        toClean.push(k);
      } else {
        abytes(key, 32, "arx key");
        throw new Error("invalid key size");
      }
      if (!isAligned323(nonce))
        toClean.push(nonce = copyBytes(nonce));
      const k32 = u322(k);
      if (extendNonceFn) {
        if (nonce.length !== 24)
          throw new Error(`arx: extended nonce must be 24 bytes`);
        extendNonceFn(sigma2, k32, u322(nonce.subarray(0, 16)), k32);
        nonce = nonce.subarray(16);
      }
      const nonceNcLen = 16 - counterLength;
      if (nonceNcLen !== nonce.length)
        throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`);
      if (nonceNcLen !== 12) {
        const nc = new Uint8Array(12);
        nc.set(nonce, counterRight ? 0 : 12 - nonce.length);
        nonce = nc;
        toClean.push(nonce);
      }
      const n32 = u322(nonce);
      runCipher2(core, sigma2, k32, n32, data, output4, counter, rounds);
      clean(...toClean);
      return output4;
    };
  }

  // ../../node_modules/@noble/ciphers/_poly1305.js
  function u8to162(a, i2) {
    return a[i2++] & 255 | (a[i2++] & 255) << 8;
  }
  class Poly13052 {
    blockLen = 16;
    outputLen = 16;
    buffer = new Uint8Array(16);
    r = new Uint16Array(10);
    h = new Uint16Array(10);
    pad = new Uint16Array(8);
    pos = 0;
    finished = false;
    constructor(key) {
      key = copyBytes(abytes(key, 32, "key"));
      const t0 = u8to162(key, 0);
      const t1 = u8to162(key, 2);
      const t2 = u8to162(key, 4);
      const t3 = u8to162(key, 6);
      const t4 = u8to162(key, 8);
      const t5 = u8to162(key, 10);
      const t6 = u8to162(key, 12);
      const t7 = u8to162(key, 14);
      this.r[0] = t0 & 8191;
      this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
      this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
      this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
      this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
      this.r[5] = t4 >>> 1 & 8190;
      this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
      this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
      this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
      this.r[9] = t7 >>> 5 & 127;
      for (let i2 = 0;i2 < 8; i2++)
        this.pad[i2] = u8to162(key, 16 + 2 * i2);
    }
    process(data, offset, isLast = false) {
      const hibit = isLast ? 0 : 1 << 11;
      const { h, r } = this;
      const r0 = r[0];
      const r1 = r[1];
      const r2 = r[2];
      const r3 = r[3];
      const r4 = r[4];
      const r5 = r[5];
      const r6 = r[6];
      const r7 = r[7];
      const r8 = r[8];
      const r9 = r[9];
      const t0 = u8to162(data, offset + 0);
      const t1 = u8to162(data, offset + 2);
      const t2 = u8to162(data, offset + 4);
      const t3 = u8to162(data, offset + 6);
      const t4 = u8to162(data, offset + 8);
      const t5 = u8to162(data, offset + 10);
      const t6 = u8to162(data, offset + 12);
      const t7 = u8to162(data, offset + 14);
      let h0 = h[0] + (t0 & 8191);
      let h1 = h[1] + ((t0 >>> 13 | t1 << 3) & 8191);
      let h2 = h[2] + ((t1 >>> 10 | t2 << 6) & 8191);
      let h3 = h[3] + ((t2 >>> 7 | t3 << 9) & 8191);
      let h4 = h[4] + ((t3 >>> 4 | t4 << 12) & 8191);
      let h5 = h[5] + (t4 >>> 1 & 8191);
      let h6 = h[6] + ((t4 >>> 14 | t5 << 2) & 8191);
      let h7 = h[7] + ((t5 >>> 11 | t6 << 5) & 8191);
      let h8 = h[8] + ((t6 >>> 8 | t7 << 8) & 8191);
      let h9 = h[9] + (t7 >>> 5 | hibit);
      let c = 0;
      let d0 = c + h0 * r0 + h1 * (5 * r9) + h2 * (5 * r8) + h3 * (5 * r7) + h4 * (5 * r6);
      c = d0 >>> 13;
      d0 &= 8191;
      d0 += h5 * (5 * r5) + h6 * (5 * r4) + h7 * (5 * r3) + h8 * (5 * r2) + h9 * (5 * r1);
      c += d0 >>> 13;
      d0 &= 8191;
      let d1 = c + h0 * r1 + h1 * r0 + h2 * (5 * r9) + h3 * (5 * r8) + h4 * (5 * r7);
      c = d1 >>> 13;
      d1 &= 8191;
      d1 += h5 * (5 * r6) + h6 * (5 * r5) + h7 * (5 * r4) + h8 * (5 * r3) + h9 * (5 * r2);
      c += d1 >>> 13;
      d1 &= 8191;
      let d2 = c + h0 * r2 + h1 * r1 + h2 * r0 + h3 * (5 * r9) + h4 * (5 * r8);
      c = d2 >>> 13;
      d2 &= 8191;
      d2 += h5 * (5 * r7) + h6 * (5 * r6) + h7 * (5 * r5) + h8 * (5 * r4) + h9 * (5 * r3);
      c += d2 >>> 13;
      d2 &= 8191;
      let d3 = c + h0 * r3 + h1 * r2 + h2 * r1 + h3 * r0 + h4 * (5 * r9);
      c = d3 >>> 13;
      d3 &= 8191;
      d3 += h5 * (5 * r8) + h6 * (5 * r7) + h7 * (5 * r6) + h8 * (5 * r5) + h9 * (5 * r4);
      c += d3 >>> 13;
      d3 &= 8191;
      let d4 = c + h0 * r4 + h1 * r3 + h2 * r2 + h3 * r1 + h4 * r0;
      c = d4 >>> 13;
      d4 &= 8191;
      d4 += h5 * (5 * r9) + h6 * (5 * r8) + h7 * (5 * r7) + h8 * (5 * r6) + h9 * (5 * r5);
      c += d4 >>> 13;
      d4 &= 8191;
      let d5 = c + h0 * r5 + h1 * r4 + h2 * r3 + h3 * r2 + h4 * r1;
      c = d5 >>> 13;
      d5 &= 8191;
      d5 += h5 * r0 + h6 * (5 * r9) + h7 * (5 * r8) + h8 * (5 * r7) + h9 * (5 * r6);
      c += d5 >>> 13;
      d5 &= 8191;
      let d6 = c + h0 * r6 + h1 * r5 + h2 * r4 + h3 * r3 + h4 * r2;
      c = d6 >>> 13;
      d6 &= 8191;
      d6 += h5 * r1 + h6 * r0 + h7 * (5 * r9) + h8 * (5 * r8) + h9 * (5 * r7);
      c += d6 >>> 13;
      d6 &= 8191;
      let d7 = c + h0 * r7 + h1 * r6 + h2 * r5 + h3 * r4 + h4 * r3;
      c = d7 >>> 13;
      d7 &= 8191;
      d7 += h5 * r2 + h6 * r1 + h7 * r0 + h8 * (5 * r9) + h9 * (5 * r8);
      c += d7 >>> 13;
      d7 &= 8191;
      let d8 = c + h0 * r8 + h1 * r7 + h2 * r6 + h3 * r5 + h4 * r4;
      c = d8 >>> 13;
      d8 &= 8191;
      d8 += h5 * r3 + h6 * r2 + h7 * r1 + h8 * r0 + h9 * (5 * r9);
      c += d8 >>> 13;
      d8 &= 8191;
      let d9 = c + h0 * r9 + h1 * r8 + h2 * r7 + h3 * r6 + h4 * r5;
      c = d9 >>> 13;
      d9 &= 8191;
      d9 += h5 * r4 + h6 * r3 + h7 * r2 + h8 * r1 + h9 * r0;
      c += d9 >>> 13;
      d9 &= 8191;
      c = (c << 2) + c | 0;
      c = c + d0 | 0;
      d0 = c & 8191;
      c = c >>> 13;
      d1 += c;
      h[0] = d0;
      h[1] = d1;
      h[2] = d2;
      h[3] = d3;
      h[4] = d4;
      h[5] = d5;
      h[6] = d6;
      h[7] = d7;
      h[8] = d8;
      h[9] = d9;
    }
    finalize() {
      const { h, pad: pad2 } = this;
      const g = new Uint16Array(10);
      let c = h[1] >>> 13;
      h[1] &= 8191;
      for (let i2 = 2;i2 < 10; i2++) {
        h[i2] += c;
        c = h[i2] >>> 13;
        h[i2] &= 8191;
      }
      h[0] += c * 5;
      c = h[0] >>> 13;
      h[0] &= 8191;
      h[1] += c;
      c = h[1] >>> 13;
      h[1] &= 8191;
      h[2] += c;
      g[0] = h[0] + 5;
      c = g[0] >>> 13;
      g[0] &= 8191;
      for (let i2 = 1;i2 < 10; i2++) {
        g[i2] = h[i2] + c;
        c = g[i2] >>> 13;
        g[i2] &= 8191;
      }
      g[9] -= 1 << 13;
      let mask = (c ^ 1) - 1;
      for (let i2 = 0;i2 < 10; i2++)
        g[i2] &= mask;
      mask = ~mask;
      for (let i2 = 0;i2 < 10; i2++)
        h[i2] = h[i2] & mask | g[i2];
      h[0] = (h[0] | h[1] << 13) & 65535;
      h[1] = (h[1] >>> 3 | h[2] << 10) & 65535;
      h[2] = (h[2] >>> 6 | h[3] << 7) & 65535;
      h[3] = (h[3] >>> 9 | h[4] << 4) & 65535;
      h[4] = (h[4] >>> 12 | h[5] << 1 | h[6] << 14) & 65535;
      h[5] = (h[6] >>> 2 | h[7] << 11) & 65535;
      h[6] = (h[7] >>> 5 | h[8] << 8) & 65535;
      h[7] = (h[8] >>> 8 | h[9] << 5) & 65535;
      let f = h[0] + pad2[0];
      h[0] = f & 65535;
      for (let i2 = 1;i2 < 8; i2++) {
        f = (h[i2] + pad2[i2] | 0) + (f >>> 16) | 0;
        h[i2] = f & 65535;
      }
      clean(g);
    }
    update(data) {
      aexists(this);
      abytes(data);
      data = copyBytes(data);
      const { buffer, blockLen } = this;
      const len = data.length;
      for (let pos = 0;pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          for (;blockLen <= len - pos; pos += blockLen)
            this.process(data, pos);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(buffer, 0, false);
          this.pos = 0;
        }
      }
      return this;
    }
    destroy() {
      clean(this.h, this.r, this.buffer, this.pad);
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const { buffer, h } = this;
      let { pos } = this;
      if (pos) {
        buffer[pos++] = 1;
        for (;pos < 16; pos++)
          buffer[pos] = 0;
        this.process(buffer, 0, true);
      }
      this.finalize();
      let opos = 0;
      for (let i2 = 0;i2 < 8; i2++) {
        out[opos++] = h[i2] >>> 0;
        out[opos++] = h[i2] >>> 8;
      }
      return out;
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
  }
  function wrapConstructorWithKey3(hashCons) {
    const hashC = (msg, key) => hashCons(key).update(msg).digest();
    const tmp = hashCons(new Uint8Array(32));
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (key) => hashCons(key);
    return hashC;
  }
  var poly13052 = /* @__PURE__ */ (() => wrapConstructorWithKey3((key) => new Poly13052(key)))();

  // ../../node_modules/@noble/ciphers/chacha.js
  function chachaCore2(s, k, n, out, cnt, rounds = 20) {
    let y00 = s[0], y01 = s[1], y02 = s[2], y03 = s[3], y04 = k[0], y05 = k[1], y06 = k[2], y07 = k[3], y08 = k[4], y09 = k[5], y10 = k[6], y11 = k[7], y12 = cnt, y13 = n[0], y14 = n[1], y15 = n[2];
    let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
    for (let r = 0;r < rounds; r += 2) {
      x00 = x00 + x04 | 0;
      x12 = rotl2(x12 ^ x00, 16);
      x08 = x08 + x12 | 0;
      x04 = rotl2(x04 ^ x08, 12);
      x00 = x00 + x04 | 0;
      x12 = rotl2(x12 ^ x00, 8);
      x08 = x08 + x12 | 0;
      x04 = rotl2(x04 ^ x08, 7);
      x01 = x01 + x05 | 0;
      x13 = rotl2(x13 ^ x01, 16);
      x09 = x09 + x13 | 0;
      x05 = rotl2(x05 ^ x09, 12);
      x01 = x01 + x05 | 0;
      x13 = rotl2(x13 ^ x01, 8);
      x09 = x09 + x13 | 0;
      x05 = rotl2(x05 ^ x09, 7);
      x02 = x02 + x06 | 0;
      x14 = rotl2(x14 ^ x02, 16);
      x10 = x10 + x14 | 0;
      x06 = rotl2(x06 ^ x10, 12);
      x02 = x02 + x06 | 0;
      x14 = rotl2(x14 ^ x02, 8);
      x10 = x10 + x14 | 0;
      x06 = rotl2(x06 ^ x10, 7);
      x03 = x03 + x07 | 0;
      x15 = rotl2(x15 ^ x03, 16);
      x11 = x11 + x15 | 0;
      x07 = rotl2(x07 ^ x11, 12);
      x03 = x03 + x07 | 0;
      x15 = rotl2(x15 ^ x03, 8);
      x11 = x11 + x15 | 0;
      x07 = rotl2(x07 ^ x11, 7);
      x00 = x00 + x05 | 0;
      x15 = rotl2(x15 ^ x00, 16);
      x10 = x10 + x15 | 0;
      x05 = rotl2(x05 ^ x10, 12);
      x00 = x00 + x05 | 0;
      x15 = rotl2(x15 ^ x00, 8);
      x10 = x10 + x15 | 0;
      x05 = rotl2(x05 ^ x10, 7);
      x01 = x01 + x06 | 0;
      x12 = rotl2(x12 ^ x01, 16);
      x11 = x11 + x12 | 0;
      x06 = rotl2(x06 ^ x11, 12);
      x01 = x01 + x06 | 0;
      x12 = rotl2(x12 ^ x01, 8);
      x11 = x11 + x12 | 0;
      x06 = rotl2(x06 ^ x11, 7);
      x02 = x02 + x07 | 0;
      x13 = rotl2(x13 ^ x02, 16);
      x08 = x08 + x13 | 0;
      x07 = rotl2(x07 ^ x08, 12);
      x02 = x02 + x07 | 0;
      x13 = rotl2(x13 ^ x02, 8);
      x08 = x08 + x13 | 0;
      x07 = rotl2(x07 ^ x08, 7);
      x03 = x03 + x04 | 0;
      x14 = rotl2(x14 ^ x03, 16);
      x09 = x09 + x14 | 0;
      x04 = rotl2(x04 ^ x09, 12);
      x03 = x03 + x04 | 0;
      x14 = rotl2(x14 ^ x03, 8);
      x09 = x09 + x14 | 0;
      x04 = rotl2(x04 ^ x09, 7);
    }
    let oi = 0;
    out[oi++] = y00 + x00 | 0;
    out[oi++] = y01 + x01 | 0;
    out[oi++] = y02 + x02 | 0;
    out[oi++] = y03 + x03 | 0;
    out[oi++] = y04 + x04 | 0;
    out[oi++] = y05 + x05 | 0;
    out[oi++] = y06 + x06 | 0;
    out[oi++] = y07 + x07 | 0;
    out[oi++] = y08 + x08 | 0;
    out[oi++] = y09 + x09 | 0;
    out[oi++] = y10 + x10 | 0;
    out[oi++] = y11 + x11 | 0;
    out[oi++] = y12 + x12 | 0;
    out[oi++] = y13 + x13 | 0;
    out[oi++] = y14 + x14 | 0;
    out[oi++] = y15 + x15 | 0;
  }
  function hchacha2(s, k, i2, out) {
    let x00 = s[0], x01 = s[1], x02 = s[2], x03 = s[3], x04 = k[0], x05 = k[1], x06 = k[2], x07 = k[3], x08 = k[4], x09 = k[5], x10 = k[6], x11 = k[7], x12 = i2[0], x13 = i2[1], x14 = i2[2], x15 = i2[3];
    for (let r = 0;r < 20; r += 2) {
      x00 = x00 + x04 | 0;
      x12 = rotl2(x12 ^ x00, 16);
      x08 = x08 + x12 | 0;
      x04 = rotl2(x04 ^ x08, 12);
      x00 = x00 + x04 | 0;
      x12 = rotl2(x12 ^ x00, 8);
      x08 = x08 + x12 | 0;
      x04 = rotl2(x04 ^ x08, 7);
      x01 = x01 + x05 | 0;
      x13 = rotl2(x13 ^ x01, 16);
      x09 = x09 + x13 | 0;
      x05 = rotl2(x05 ^ x09, 12);
      x01 = x01 + x05 | 0;
      x13 = rotl2(x13 ^ x01, 8);
      x09 = x09 + x13 | 0;
      x05 = rotl2(x05 ^ x09, 7);
      x02 = x02 + x06 | 0;
      x14 = rotl2(x14 ^ x02, 16);
      x10 = x10 + x14 | 0;
      x06 = rotl2(x06 ^ x10, 12);
      x02 = x02 + x06 | 0;
      x14 = rotl2(x14 ^ x02, 8);
      x10 = x10 + x14 | 0;
      x06 = rotl2(x06 ^ x10, 7);
      x03 = x03 + x07 | 0;
      x15 = rotl2(x15 ^ x03, 16);
      x11 = x11 + x15 | 0;
      x07 = rotl2(x07 ^ x11, 12);
      x03 = x03 + x07 | 0;
      x15 = rotl2(x15 ^ x03, 8);
      x11 = x11 + x15 | 0;
      x07 = rotl2(x07 ^ x11, 7);
      x00 = x00 + x05 | 0;
      x15 = rotl2(x15 ^ x00, 16);
      x10 = x10 + x15 | 0;
      x05 = rotl2(x05 ^ x10, 12);
      x00 = x00 + x05 | 0;
      x15 = rotl2(x15 ^ x00, 8);
      x10 = x10 + x15 | 0;
      x05 = rotl2(x05 ^ x10, 7);
      x01 = x01 + x06 | 0;
      x12 = rotl2(x12 ^ x01, 16);
      x11 = x11 + x12 | 0;
      x06 = rotl2(x06 ^ x11, 12);
      x01 = x01 + x06 | 0;
      x12 = rotl2(x12 ^ x01, 8);
      x11 = x11 + x12 | 0;
      x06 = rotl2(x06 ^ x11, 7);
      x02 = x02 + x07 | 0;
      x13 = rotl2(x13 ^ x02, 16);
      x08 = x08 + x13 | 0;
      x07 = rotl2(x07 ^ x08, 12);
      x02 = x02 + x07 | 0;
      x13 = rotl2(x13 ^ x02, 8);
      x08 = x08 + x13 | 0;
      x07 = rotl2(x07 ^ x08, 7);
      x03 = x03 + x04 | 0;
      x14 = rotl2(x14 ^ x03, 16);
      x09 = x09 + x14 | 0;
      x04 = rotl2(x04 ^ x09, 12);
      x03 = x03 + x04 | 0;
      x14 = rotl2(x14 ^ x03, 8);
      x09 = x09 + x14 | 0;
      x04 = rotl2(x04 ^ x09, 7);
    }
    let oi = 0;
    out[oi++] = x00;
    out[oi++] = x01;
    out[oi++] = x02;
    out[oi++] = x03;
    out[oi++] = x12;
    out[oi++] = x13;
    out[oi++] = x14;
    out[oi++] = x15;
  }
  var chacha202 = /* @__PURE__ */ createCipher2(chachaCore2, {
    counterRight: false,
    counterLength: 4,
    allowShortKeys: false
  });
  var xchacha202 = /* @__PURE__ */ createCipher2(chachaCore2, {
    counterRight: false,
    counterLength: 8,
    extendNonceFn: hchacha2,
    allowShortKeys: false
  });
  var ZEROS163 = /* @__PURE__ */ new Uint8Array(16);
  var updatePadded2 = (h, msg) => {
    h.update(msg);
    const leftover = msg.length % 16;
    if (leftover)
      h.update(ZEROS163.subarray(leftover));
  };
  var ZEROS323 = /* @__PURE__ */ new Uint8Array(32);
  function computeTag3(fn, key, nonce, ciphertext, AAD) {
    if (AAD !== undefined)
      abytes(AAD, undefined, "AAD");
    const authKey = fn(key, nonce, ZEROS323);
    const lengths = u64Lengths(ciphertext.length, AAD ? AAD.length : 0, true);
    const h = poly13052.create(authKey);
    if (AAD)
      updatePadded2(h, AAD);
    updatePadded2(h, ciphertext);
    h.update(lengths);
    const res = h.digest();
    clean(authKey, lengths);
    return res;
  }
  var _poly1305_aead2 = (xorStream) => (key, nonce, AAD) => {
    const tagLength = 16;
    return {
      encrypt(plaintext, output4) {
        const plength = plaintext.length;
        output4 = getOutput(plength + tagLength, output4, false);
        output4.set(plaintext);
        const oPlain = output4.subarray(0, -tagLength);
        xorStream(key, nonce, oPlain, oPlain, 1);
        const tag = computeTag3(xorStream, key, nonce, oPlain, AAD);
        output4.set(tag, plength);
        clean(tag);
        return output4;
      },
      decrypt(ciphertext, output4) {
        output4 = getOutput(ciphertext.length - tagLength, output4, false);
        const data = ciphertext.subarray(0, -tagLength);
        const passedTag = ciphertext.subarray(-tagLength);
        const tag = computeTag3(xorStream, key, nonce, data, AAD);
        if (!equalBytes3(passedTag, tag))
          throw new Error("invalid tag");
        output4.set(ciphertext.subarray(0, -tagLength));
        xorStream(key, nonce, output4, output4, 1);
        clean(tag);
        return output4;
      }
    };
  };
  var chacha20poly13052 = /* @__PURE__ */ wrapCipher2({ blockSize: 64, nonceLength: 12, tagLength: 16 }, _poly1305_aead2(chacha202));
  var xchacha20poly13052 = /* @__PURE__ */ wrapCipher2({ blockSize: 64, nonceLength: 24, tagLength: 16 }, _poly1305_aead2(xchacha202));

  // src/engine/crypto.ts
  var KEY_LENGTH = 32;
  var NONCE_LENGTH = 24;
  function generateSymmetricKey() {
    const key = new Uint8Array(KEY_LENGTH);
    crypto.getRandomValues(key);
    return bytesToBase64(key);
  }
  function generateRandomId() {
    const bytes4 = new Uint8Array(32);
    crypto.getRandomValues(bytes4);
    return bytesToHex4(bytes4);
  }
  function encryptSymmetric(keyBase64, plaintext) {
    const key = base64ToBytes(keyBase64);
    if (key.length !== KEY_LENGTH)
      throw new Error(`Invalid key length: ${key.length}`);
    const nonce = new Uint8Array(NONCE_LENGTH);
    crypto.getRandomValues(nonce);
    const message = new TextEncoder().encode(plaintext);
    const ciphertext = xchacha20poly13052(key, nonce).encrypt(message);
    return {
      ciphertext: bytesToBase64(ciphertext),
      nonce: bytesToBase64(nonce)
    };
  }
  function decryptSymmetric(keyBase64, ciphertextBase64, nonceBase64) {
    try {
      const key = base64ToBytes(keyBase64);
      if (key.length !== KEY_LENGTH)
        throw new Error(`Invalid key length: ${key.length}`);
      const nonce = base64ToBytes(nonceBase64);
      if (nonce.length !== NONCE_LENGTH)
        throw new Error(`Invalid nonce length: ${nonce.length}`);
      const ciphertext = base64ToBytes(ciphertextBase64);
      const decrypted = xchacha20poly13052(key, nonce).decrypt(ciphertext);
      return new TextDecoder().decode(decrypted);
    } catch (e) {
      console.error("[Crypto] Decryption failed:", e);
      return null;
    }
  }
  function bytesToBase64(bytes4) {
    const binString = Array.from(bytes4, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString);
  }
  function base64ToBytes(base642) {
    const binString = atob(base642);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
  }

  // src/engine/nip17.ts
  function wrapEvent3(signedEvent, receiverPubkey) {
    const ephemeralPrivKey = generateSecretKey();
    const ephemeralPubKey = getPublicKey(ephemeralPrivKey);
    const innerJson = JSON.stringify(signedEvent);
    const conversationKey = nip44_exports.v2.utils.getConversationKey(ephemeralPrivKey, receiverPubkey);
    const ciphertext = nip44_exports.v2.encrypt(innerJson, conversationKey);
    const tags = [["p", receiverPubkey]];
    const twoDaysAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
    const jitter = Math.floor(Math.random() * (4 * 60 * 60));
    console.log(`[InviteDebug] wrapEvent: Backdating by ~24h. Timestamp=${twoDaysAgo - jitter} (Now=${Math.floor(Date.now() / 1000)})`);
    const unsignedWrapper = {
      kind: 1059,
      pubkey: ephemeralPubKey,
      created_at: twoDaysAgo - jitter,
      tags,
      content: ciphertext
    };
    return finalizeEvent(unsignedWrapper, ephemeralPrivKey);
  }
  async function unwrapEvent3(event, requestDecrypt) {
    if (event.kind !== 1059)
      return null;
    try {
      const plaintext = await requestDecrypt(event.pubkey, event.content);
      const innerEvent = JSON.parse(plaintext);
      return innerEvent;
    } catch (e) {
      console.warn("[NIP-17] Failed to unwrap:", e);
      return null;
    }
  }

  // src/engine/routes/spaces.ts
  var keyCache = null;
  var storeCache = new Map;
  async function getKeys(ctx) {
    if (!keyCache) {
      keyCache = await loadSpaceKeys(ctx);
    }
    return keyCache;
  }
  function resolveSpaceId(ctx, spaceId) {
    if (spaceId === "current") {
      return ctx.currentSpace?.id || "default";
    }
    return spaceId;
  }
  async function getSpaceContext(ctx) {
    if (ctx.currentSpace) {
      return { status: 200, body: ctx.currentSpace };
    }
    return { status: 200, body: { id: null, standalone: true } };
  }
  async function listSpaces(ctx) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    await syncInvites(ctx);
    const keys = await getKeys(ctx);
    const spaces = [];
    const appPrefix = `${ctx.appOrigin}:`;
    for (const [scopedId, keyInfo] of keys.entries()) {
      if (keyInfo.deleted)
        continue;
      if (scopedId.startsWith(appPrefix)) {
        const id = scopedId.slice(appPrefix.length);
        spaces.push({
          id,
          name: keyInfo.name || `Space ${id.slice(0, 8)}`,
          createdAt: keyInfo.createdAt || 0,
          memberCount: 0,
          appOrigin: ctx.appOrigin
        });
      }
    }
    return { status: 200, body: spaces };
  }
  async function listAllSpaces(ctx) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    const keys = await getKeys(ctx);
    const spaces = [];
    for (const [scopedId, keyInfo] of keys.entries()) {
      if (keyInfo.deleted)
        continue;
      const colonIndex = scopedId.lastIndexOf(":");
      if (colonIndex === -1)
        continue;
      const appOrigin = scopedId.slice(0, colonIndex);
      const id = scopedId.slice(colonIndex + 1);
      spaces.push({
        id,
        name: keyInfo.name || `Space ${id.slice(0, 8)}`,
        createdAt: keyInfo.createdAt || 0,
        memberCount: 0,
        appOrigin
      });
    }
    return { status: 200, body: spaces };
  }
  async function createSpace(ctx, body) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    if (!body?.name)
      return { status: 400, body: { error: "Space name required" } };
    const targetOrigin = body.appOrigin || ctx.appOrigin;
    const spaceId = generateRandomId();
    const key = generateSymmetricKey();
    const scopedId = `${targetOrigin}:${spaceId}`;
    const createdAt = Math.floor(Date.now() / 1000);
    const keys = await getKeys(ctx);
    keys.set(scopedId, {
      key,
      version: 1,
      name: body.name,
      createdAt,
      deleted: false
    });
    await saveSpaceKeys(ctx, keys);
    const space = {
      id: spaceId,
      name: body.name,
      createdAt,
      memberCount: 1,
      appOrigin: targetOrigin
    };
    return { status: 201, body: space };
  }
  async function deleteSpace(ctx, rawSpaceId) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    const spaceId = resolveSpaceId(ctx, rawSpaceId);
    const keys = await getKeys(ctx);
    let targetScopedId = `${ctx.appOrigin}:${spaceId}`;
    if (!keys.has(targetScopedId)) {
      const found = Array.from(keys.keys()).find((k) => k.endsWith(`:${spaceId}`));
      if (found) {
        targetScopedId = found;
      } else {
        return { status: 404, body: { error: "Space not found" } };
      }
    }
    const existing = keys.get(targetScopedId);
    keys.set(targetScopedId, {
      ...existing,
      deleted: true,
      deletedAt: Math.floor(Date.now() / 1000)
    });
    await saveSpaceKeys(ctx, keys);
    return { status: 200, body: { deleted: spaceId } };
  }
  async function updateSpace(ctx, rawSpaceId, body) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    if (!body?.name)
      return { status: 400, body: { error: "Space name required" } };
    const spaceId = resolveSpaceId(ctx, rawSpaceId);
    const keys = await getKeys(ctx);
    let targetScopedId = `${ctx.appOrigin}:${spaceId}`;
    if (!keys.has(targetScopedId)) {
      const found = Array.from(keys.keys()).find((k) => k.endsWith(`:${spaceId}`));
      if (found) {
        targetScopedId = found;
      } else {
        return { status: 404, body: { error: "Space not found" } };
      }
    }
    const existing = keys.get(targetScopedId);
    keys.set(targetScopedId, {
      ...existing,
      name: body.name
    });
    await saveSpaceKeys(ctx, keys);
    return { status: 200, body: { id: spaceId, name: body.name } };
  }
  async function getSpaceMessages(ctx, rawSpaceId, params) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    const spaceId = resolveSpaceId(ctx, rawSpaceId);
    const scopedId = `${ctx.appOrigin}:${spaceId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);
    if (!keyInfo)
      return { status: 404, body: { error: "Space key not found" } };
    const filter = {
      kinds: [42],
      "#e": [spaceId],
      limit: params.limit || 50
    };
    if (params.since)
      filter.since = params.since;
    const events = await ctx.pool.list([filter]);
    const messages = [];
    for (const ev of events) {
      try {
        let payload;
        try {
          payload = JSON.parse(ev.content);
        } catch {
          continue;
        }
        const plaintext = decryptSymmetric(keyInfo.key, payload.ciphertext, payload.nonce);
        if (plaintext) {
          messages.push({
            id: ev.id,
            spaceId,
            author: ev.pubkey,
            content: plaintext,
            type: "message",
            createdAt: ev.created_at
          });
        }
      } catch (e) {}
    }
    return { status: 200, body: messages };
  }
  async function postSpaceMessage(ctx, rawSpaceId, body) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    if (!body?.content)
      return { status: 400, body: { error: "Content required" } };
    const spaceId = resolveSpaceId(ctx, rawSpaceId);
    const scopedId = `${ctx.appOrigin}:${spaceId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);
    if (!keyInfo)
      return { status: 404, body: { error: "Space key not found" } };
    const encrypted = encryptSymmetric(keyInfo.key, body.content);
    const content = JSON.stringify(encrypted);
    const unsigned = {
      kind: 42,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["e", spaceId, "", "root"]],
      content,
      pubkey: ctx.currentPubkey
    };
    const signed = await ctx.requestSign(unsigned);
    await ctx.pool.publish(signed);
    const msg = {
      id: signed.id,
      spaceId,
      author: signed.pubkey,
      content: body.content,
      type: "message",
      createdAt: signed.created_at
    };
    return { status: 201, body: msg };
  }
  async function inviteMember(ctx, rawSpaceId, body) {
    console.log("[InviteDebug] inviteMember called", { rawSpaceId, body });
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    if (!body?.pubkey)
      return { status: 400, body: { error: "Pubkey required" } };
    const spaceId = resolveSpaceId(ctx, rawSpaceId);
    let receiverPubkey = body.pubkey;
    if (receiverPubkey.startsWith("npub")) {
      try {
        const decoded = nip19_exports.decode(receiverPubkey);
        if (decoded.type === "npub") {
          receiverPubkey = decoded.data;
        }
      } catch (e) {
        return { status: 400, body: { error: "Invalid npub format" } };
      }
    }
    const scopedId = `${ctx.appOrigin}:${spaceId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);
    if (!keyInfo) {
      return { status: 404, body: { error: "Space key not found" } };
    }
    const invitePayload = {
      type: "mirage_invite",
      spaceId,
      scopedId,
      key: keyInfo.key,
      version: keyInfo.version,
      name: body.name || keyInfo.name || `Space ${spaceId.slice(0, 8)}`,
      origin: ctx.appOrigin
    };
    const innerEvent = {
      kind: 13,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify(invitePayload),
      pubkey: ctx.currentPubkey
    };
    const signedInner = await ctx.requestSign(innerEvent);
    const wrapper = wrapEvent3(signedInner, receiverPubkey);
    const publishResult = await ctx.pool.publish(wrapper);
    console.log(`[Invites] Sent invite to ${receiverPubkey} for space ${spaceId} (scoped: ${scopedId}) with timestamp ${innerEvent.created_at}`);
    return { status: 200, body: { invited: receiverPubkey } };
  }
  async function syncInvites(ctx) {
    if (!ctx.currentPubkey)
      return;
    const filter = {
      kinds: [1059],
      "#p": [ctx.currentPubkey],
      limit: 100,
      since: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60
    };
    const events = await ctx.pool.list([filter]);
    console.log(`[Invites] Synced checks: Found ${events.length} candidates (Kind 1059).`);
    const keys = await getKeys(ctx);
    let updated = false;
    const newSpaces = [];
    for (const wrap of events) {
      try {
        const innerJson = await ctx.requestDecrypt(wrap.pubkey, wrap.content);
        const innerEvent = JSON.parse(innerJson);
        if (innerEvent.kind === 13) {
          const payload = JSON.parse(innerEvent.content);
          if (payload.type === "mirage_invite" && payload.key && payload.scopedId) {
            const existing = keys.get(payload.scopedId);
            let isNewerInvite = false;
            const inviteTime = innerEvent.created_at;
            if (existing) {
              if (existing.latestInviteTimestamp) {
                isNewerInvite = inviteTime > existing.latestInviteTimestamp;
              } else {
                isNewerInvite = inviteTime > (existing.deletedAt || existing.createdAt || 0);
              }
            }
            if (!existing || !existing.deleted && existing.version < payload.version || isNewerInvite) {
              keys.set(payload.scopedId, {
                key: payload.key,
                version: payload.version,
                name: payload.name,
                deleted: false,
                deletedAt: undefined,
                latestInviteTimestamp: inviteTime
              });
              updated = true;
              const parts = payload.scopedId.split(":");
              if (parts.length > 1) {
                newSpaces.push({ id: parts[1], name: payload.name });
              }
            } else if (existing.deleted) {}
          }
        } else {}
      } catch (e) {
        console.warn("[Invites] Failed to process wrapper:", e);
        continue;
      }
    }
    if (updated) {
      await saveSpaceKeys(ctx, keys);
      for (const space of newSpaces) {
        console.log(`[Invites] Accepted new space: ${space.id} (${space.name})`);
        self.postMessage({
          type: "NEW_SPACE_INVITE",
          id: crypto.randomUUID(),
          spaceId: space.id,
          spaceName: space.name
        });
      }
    } else if (events.length > 0) {
      console.log("[Invites] Synced checks, no updates found.");
    }
  }
  async function getSpaceStore(ctx, rawSpaceId) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    const spaceId = resolveSpaceId(ctx, rawSpaceId);
    const scopedId = `${ctx.appOrigin}:${spaceId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);
    if (!keyInfo)
      return { status: 404, body: { error: "Space key not found" } };
    let cache = storeCache.get(scopedId);
    if (!cache) {
      cache = { state: new Map, latestTimestamp: 0 };
      storeCache.set(scopedId, cache);
    }
    const filter = {
      kinds: [42],
      "#e": [spaceId],
      "#t": ["mirage_store"],
      since: cache.latestTimestamp + 1
    };
    const events = await ctx.pool.list([filter]);
    let hasUpdates = false;
    for (const ev of events) {
      if (ev.created_at > cache.latestTimestamp) {
        cache.latestTimestamp = ev.created_at;
      }
      try {
        let payload;
        try {
          payload = JSON.parse(ev.content);
        } catch {
          continue;
        }
        const plaintext = decryptSymmetric(keyInfo.key, payload.ciphertext, payload.nonce);
        if (!plaintext) {
          console.warn(`[SpaceStore] Decryption failed for event ${ev.id}`);
          continue;
        }
        const data = JSON.parse(plaintext);
        if (Array.isArray(data) && data[0] === "store_put" && data.length === 3) {
          const [_, key, value] = data;
          const existing = cache.state.get(key);
          if (!existing || ev.created_at >= existing.updatedAt) {
            cache.state.set(key, { value, updatedAt: ev.created_at });
            hasUpdates = true;
          }
        }
      } catch (e) {}
    }
    const stateObj = {};
    for (const [key, record] of cache.state.entries()) {
      stateObj[key] = record.value;
    }
    return { status: 200, body: stateObj };
  }
  async function updateSpaceStore(ctx, rawSpaceId, key, value) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    const spaceId = resolveSpaceId(ctx, rawSpaceId);
    const scopedId = `${ctx.appOrigin}:${spaceId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);
    if (!keyInfo)
      return { status: 404, body: { error: "Space key not found" } };
    const rawPayload = JSON.stringify(["store_put", key, value]);
    const encrypted = encryptSymmetric(keyInfo.key, rawPayload);
    const content = JSON.stringify(encrypted);
    const unsigned = {
      kind: 42,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["e", spaceId, "", "root"],
        ["t", "mirage_store"],
        ["k", key]
      ],
      content,
      pubkey: ctx.currentPubkey
    };
    const signed = await ctx.requestSign(unsigned);
    await ctx.pool.publish(signed);
    let cache = storeCache.get(scopedId);
    if (!cache) {
      cache = { state: new Map, latestTimestamp: 0 };
      storeCache.set(scopedId, cache);
    }
    cache.state.set(key, { value, updatedAt: signed.created_at });
    if (signed.created_at > cache.latestTimestamp) {
      cache.latestTimestamp = signed.created_at;
    }
    return { status: 200, body: { key, value, updatedAt: signed.created_at } };
  }

  // src/engine/routes/dm.ts
  async function listDMs(ctx) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    const filter = {
      kinds: [1059],
      "#p": [ctx.currentPubkey],
      limit: 100
    };
    const events = await ctx.pool.list([filter]);
    const conversations = new Map;
    const seenIds = new Set;
    for (const wrap of events) {
      try {
        const sealEvent = await unwrapEvent3(wrap, ctx.requestDecrypt);
        if (!sealEvent || sealEvent.kind !== 13)
          continue;
        if (!sealEvent.pubkey)
          continue;
        const senderPubkey = sealEvent.pubkey;
        let rumorJson;
        try {
          rumorJson = await ctx.requestDecrypt(senderPubkey, sealEvent.content);
        } catch (err) {
          console.warn(`[DM] Failed to decrypt Seal from ${senderPubkey.slice(0, 8)}`);
          continue;
        }
        const rumor = JSON.parse(rumorJson);
        if (!rumor.pubkey)
          continue;
        const uniqueId = rumor.id || `${rumor.pubkey}:${rumor.created_at}:${rumor.content.slice(0, 20)}`;
        if (seenIds.has(uniqueId))
          continue;
        seenIds.add(uniqueId);
        const sender = rumor.pubkey;
        let otherPubkey = sender;
        if (sender === ctx.currentPubkey) {
          const pTag = rumor.tags.find((t) => t[0] === "p");
          if (pTag && pTag[1]) {
            otherPubkey = pTag[1];
          }
        }
        const existing = conversations.get(otherPubkey);
        const ts = rumor.created_at;
        if (!existing || ts > existing.timestamp) {
          conversations.set(otherPubkey, {
            pubkey: otherPubkey,
            lastMessage: rumor.content,
            timestamp: ts,
            unreadCount: 0
          });
        }
      } catch (e) {
        continue;
      }
    }
    const start = Array.from(conversations.values()).sort((a, b) => b.timestamp - a.timestamp);
    return { status: 200, body: start };
  }
  async function getDMMessages(ctx, targetPubkey, params) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    let hexTarget = targetPubkey;
    if (hexTarget.startsWith("npub")) {
      try {
        const d = nip19_exports.decode(hexTarget);
        if (d.type === "npub")
          hexTarget = d.data;
      } catch {}
    }
    const filter = {
      kinds: [1059],
      "#p": [ctx.currentPubkey],
      limit: params.limit || 50
    };
    const events = await ctx.pool.list([filter]);
    const messages = [];
    const seenIds = new Set;
    for (const wrap of events) {
      try {
        const sealEvent = await unwrapEvent3(wrap, ctx.requestDecrypt);
        if (!sealEvent || sealEvent.kind !== 13)
          continue;
        if (!sealEvent.pubkey)
          continue;
        const senderPubkey = sealEvent.pubkey;
        let rumorJson;
        try {
          rumorJson = await ctx.requestDecrypt(senderPubkey, sealEvent.content);
        } catch (decErr) {
          continue;
        }
        const rumor = JSON.parse(rumorJson);
        if (!rumor.pubkey)
          continue;
        const uniqueId = rumor.id || `${rumor.pubkey}:${rumor.created_at}:${rumor.content}`;
        if (seenIds.has(uniqueId))
          continue;
        seenIds.add(uniqueId);
        const sender = rumor.pubkey;
        let isMatch = false;
        let isIncoming = false;
        if (sender === hexTarget) {
          isMatch = true;
          isIncoming = true;
        } else if (sender === ctx.currentPubkey) {
          const pTag = rumor.tags.find((t) => t[0] === "p");
          if (pTag && pTag[1] === hexTarget) {
            isMatch = true;
            isIncoming = false;
          }
        }
        if (isMatch) {
          messages.push({
            id: rumor.id || "unsigned",
            pubkey: hexTarget,
            sender,
            content: rumor.content,
            createdAt: rumor.created_at,
            isIncoming
          });
        }
      } catch (e) {
        continue;
      }
    }
    messages.sort((a, b) => a.createdAt - b.createdAt);
    return { status: 200, body: messages };
  }
  async function sendDM(ctx, targetPubkey, body) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    if (!body?.content)
      return { status: 400, body: { error: "Content required" } };
    let hexTarget = targetPubkey;
    if (hexTarget.startsWith("npub")) {
      try {
        const d = nip19_exports.decode(hexTarget);
        if (d.type === "npub")
          hexTarget = d.data;
      } catch {
        return { status: 400, body: { error: "Invalid pubkey" } };
      }
    }
    const rumor = {
      kind: 14,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["p", hexTarget]],
      content: body.content,
      pubkey: ctx.currentPubkey
    };
    const rumorJson = JSON.stringify(rumor);
    const cipherTextForRecipient = await ctx.requestEncrypt(hexTarget, rumorJson);
    const sealForRecipient = {
      kind: 13,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: cipherTextForRecipient,
      pubkey: ctx.currentPubkey
    };
    const signedSealForRecipient = await ctx.requestSign(sealForRecipient);
    const giftForRecipient = wrapEvent3(signedSealForRecipient, hexTarget);
    await ctx.pool.publish(giftForRecipient);
    if (hexTarget !== ctx.currentPubkey) {
      const cipherTextForSelf = await ctx.requestEncrypt(ctx.currentPubkey, rumorJson);
      const sealForSelf = {
        kind: 13,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: cipherTextForSelf,
        pubkey: ctx.currentPubkey
      };
      const signedSealForSelf = await ctx.requestSign(sealForSelf);
      const giftForSelf = wrapEvent3(signedSealForSelf, ctx.currentPubkey);
      await ctx.pool.publish(giftForSelf);
    }
    return {
      status: 201,
      body: {
        sent: true,
        to: hexTarget,
        content: body.content
      }
    };
  }

  // src/engine/routes/contacts.ts
  function normalizePubkey(pubkey) {
    if (pubkey.startsWith("npub")) {
      try {
        const d = nip19_exports.decode(pubkey);
        if (d.type === "npub")
          return d.data;
      } catch {}
    }
    return pubkey;
  }
  async function fetchContactList(ctx, pubkey) {
    const filter = {
      kinds: [3],
      authors: [pubkey],
      limit: 1
    };
    const event = await ctx.pool.get(filter);
    if (!event)
      return [];
    const latest = event;
    return latest.tags.filter((t) => t[0] === "p").map((t) => ({
      pubkey: t[1],
      relay: t[2] || undefined,
      petname: t[3] || undefined
    }));
  }
  async function listContacts(ctx) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    const contacts = await fetchContactList(ctx, ctx.currentPubkey);
    return { status: 200, body: contacts };
  }
  async function getUserContacts(ctx, targetPubkey) {
    const hexPubkey = normalizePubkey(targetPubkey);
    const contacts = await fetchContactList(ctx, hexPubkey);
    return { status: 200, body: contacts };
  }
  async function updateContacts(ctx, body) {
    if (!ctx.currentPubkey)
      return { status: 401, body: { error: "Not authenticated" } };
    if (!body || !Array.isArray(body.contacts)) {
      return { status: 400, body: { error: "Invalid body, expected { contacts: [] }" } };
    }
    const tags = body.contacts.map((c) => {
      const tag = ["p", normalizePubkey(c.pubkey)];
      if (c.relay)
        tag.push(c.relay);
      if (c.petname) {
        if (!c.relay)
          tag.push("");
        tag.push(c.petname);
      }
      return tag;
    });
    const event = {
      kind: 3,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content: "",
      pubkey: ctx.currentPubkey
    };
    const signed = await ctx.requestSign(event);
    await ctx.pool.publish(signed);
    return { status: 200, body: { success: true } };
  }

  // src/engine/routes/events.ts
  async function getEvents(ctx, params) {
    const limit2 = params.limit ? parseInt(String(params.limit), 10) : 20;
    const filter = {
      limit: limit2
    };
    if (params.kinds) {
      const kindsRaw = Array.isArray(params.kinds) ? params.kinds : String(params.kinds).split(",");
      filter.kinds = kindsRaw.map((k) => parseInt(k.trim(), 10)).filter((n) => !isNaN(n));
    }
    if (params.authors) {
      const authorsRaw = Array.isArray(params.authors) ? params.authors : String(params.authors).split(",");
      filter.authors = authorsRaw.map((a) => a.trim()).filter((a) => a.length > 0);
    }
    if (params.since) {
      filter.since = parseInt(String(params.since), 10);
    }
    if (params.tags) {
      const tagsRaw = Array.isArray(params.tags) ? params.tags : String(params.tags).split(",");
      tagsRaw.forEach((tagStr) => {
        const [key, value] = tagStr.trim().split(":");
        if (key && value) {
          const tagName = `#${key}`;
          if (!filter[tagName]) {
            filter[tagName] = [];
          }
          filter[tagName].push(value);
        }
      });
    }
    const events = await ctx.pool.list([filter]);
    return { status: 200, body: events };
  }
  async function postEvents(ctx, body) {
    if (body.kind === undefined || body.content === undefined) {
      return { status: 400, body: { error: "Missing kind or content" } };
    }
    const unsignedEvent = {
      kind: body.kind,
      content: body.content,
      tags: body.tags ?? [],
      created_at: Math.floor(Date.now() / 1000)
    };
    try {
      const signedEvent = await ctx.requestSign(unsignedEvent);
      const targets = ctx.targetRelays || body.targetRelays;
      await ctx.pool.publish(signedEvent, targets);
      return {
        status: 201,
        body: signedEvent
      };
    } catch (error) {
      return {
        status: 500,
        body: { error: error instanceof Error ? error.message : "Failed to publish event" }
      };
    }
  }

  // src/engine/routes/apps.ts
  async function fetchAppCode(pool, naddr) {
    try {
      const decoded = nip19_exports.decode(naddr);
      if (decoded.type !== "naddr") {
        return { error: "Invalid naddr: Must be an addressable event (Kind 30078)" };
      }
      const { kind, pubkey, identifier } = decoded.data;
      if (kind !== 30078) {
        return { error: "Invalid kind: Mirage apps must be Kind 30078" };
      }
      const filter = {
        kinds: [30078],
        authors: [pubkey],
        "#d": [identifier],
        limit: 1
      };
      const event = await pool.get(filter);
      if (!event) {
        return { error: "App not found on relays" };
      }
      return { html: event.content };
    } catch (error) {
      console.error("[Apps] Fetch failed:", error);
      return { error: error instanceof Error ? error.message : "Unknown fetch error" };
    }
  }

  // src/engine/library.ts
  var APP_LIST_ID = "app_list";
  async function loadAppLibrary(ctx) {
    console.log("[Library] Loading app library...");
    try {
      console.log(`[Library_DEBUG] Fetching APP_LIST_ID="${APP_LIST_ID}"...`);
      const result = await internalGetStorage(ctx, APP_LIST_ID);
      let list = Array.isArray(result) ? result : null;
      if (result && !Array.isArray(result)) {
        console.warn("[Library_DEBUG] Fetched data is corrupted (not an array). Triggering self-healing.");
      }
      console.log(`[Library_DEBUG] Fetched list:`, list ? `${list.length} items` : "NULL");
      console.log("[Library] Loaded apps from NIP-78:", list?.length ?? 0, "apps");
      return list || [];
    } catch (error) {
      console.error("[Library] Failed to load apps:", error);
      return [];
    }
  }
  async function saveAppLibrary(ctx, apps) {
    console.log("[Library] Saving app library...", apps.length, "apps");
    console.log("[Library_DEBUG] Saving Context:", {
      appOrigin: ctx.appOrigin,
      APP_LIST_ID
    });
    try {
      console.log(`[Library_DEBUG] Writing to key="${APP_LIST_ID}"...`);
      const event = await internalPutStorage(ctx, APP_LIST_ID, apps);
      console.log(`[Library_DEBUG] Saved successfully. D-Tag="${event.tags.find((t) => t[0] === "d")?.[1]}" ID=${event.id?.slice(0, 8)}`);
      console.log("[Library] Saved app list to NIP-78");
    } catch (error) {
      console.error("[Library] Failed to save apps:", error);
      throw error;
    }
  }
  async function addAppToLibrary(ctx, app) {
    console.log("[Library] Adding app to library:", app.name, app.naddr?.slice(0, 20) + "...");
    const library = await loadAppLibrary(ctx);
    let newIdentifier;
    let newPubkey;
    try {
      const decoded = nip19_exports.decode(app.naddr);
      if (decoded.type === "naddr") {
        newIdentifier = decoded.data.identifier;
        newPubkey = decoded.data.pubkey;
      }
    } catch (e) {
      console.warn("[Library] Failed to decode new app naddr:", e);
    }
    const filtered = library.filter((existing) => {
      if (existing.naddr === app.naddr)
        return false;
      if (newIdentifier && newPubkey) {
        try {
          const decoded = nip19_exports.decode(existing.naddr);
          if (decoded.type === "naddr") {
            if (decoded.data.identifier === newIdentifier && decoded.data.pubkey === newPubkey) {
              return false;
            }
          }
        } catch (e) {}
      }
      return true;
    });
    const updated = [app, ...filtered];
    console.log("[Library] Library size: before=", library.length, ", after=", updated.length);
    await saveAppLibrary(ctx, updated);
  }
  async function removeAppFromLibrary(ctx, naddr) {
    console.log("[Library] Removing app from library:", naddr?.slice(0, 20) + "...");
    const library = await loadAppLibrary(ctx);
    const filtered = library.filter((a) => a.naddr !== naddr);
    if (filtered.length === library.length) {
      console.log("[Library] App not found in library");
      return false;
    }
    console.log("[Library] Library size: before=", library.length, ", after=", filtered.length);
    await saveAppLibrary(ctx, filtered);
    try {
      const decoded = nip19_exports.decode(naddr);
      if (decoded.type === "naddr") {
        const { identifier } = decoded.data;
        console.log(`[Library] Publishing deletion for d-tag="${identifier}"...`);
        const unsigned = {
          kind: 5,
          pubkey: ctx.currentPubkey,
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ["e", ""],
            ["a", `30078:${ctx.currentPubkey}:${identifier}`]
          ],
          content: "App deleted by user"
        };
        const signed = await ctx.requestSign(unsigned);
        await ctx.pool.publish(signed);
        try {
          if (ctx.pool.getRelays().includes("mirage://local")) {} else {
            await ctx.pool.publish(signed, ["mirage://local"]);
          }
        } catch (localErr) {
          console.warn("[Library] Failed to clean up local storage:", localErr);
        }
        console.log("[Library] Deletion request published.");
      }
    } catch (e) {
      console.error("[Library] Failed to publish deletion request:", e);
    }
    return true;
  }

  // src/engine/streaming.ts
  var activeSubscriptions = new Map;
  async function handleStreamOpen(message, pool, currentPubkey) {
    const { id, path } = message;
    try {
      let filter = null;
      const channelMatch = path.match(/^\/mirage\/v1\/channels\/([a-zA-Z0-9_-]+)\/messages/);
      if (channelMatch) {
        const channelId = channelMatch[1];
        filter = {
          kinds: [42],
          "#e": [channelId],
          limit: 50
        };
      } else if (path === "/mirage/v1/feed") {
        filter = {
          kinds: [1],
          limit: 50
        };
      } else {
        const dmMatch = path.match(/^\/mirage\/v1\/dm\/([a-f0-9]{64})$/);
        if (dmMatch) {
          if (!currentPubkey) {
            sendStreamError(id, "Authentication required for DMs");
            return;
          }
          filter = {
            kinds: [4],
            "#p": [currentPubkey],
            limit: 50
          };
        }
      }
      if (!filter) {
        sendStreamError(id, "Stream route not found: " + path);
        return;
      }
      console.log("[Engine] Starting stream:", id, path, filter);
      const sub = pool.subscribe([filter], {
        onevent: (event) => {
          sendStreamChunk(id, `data: ${JSON.stringify(event)}

`);
        }
      });
      activeSubscriptions.set(id, {
        id,
        unsubscribe: () => sub.close(),
        filter,
        buffer: []
      });
    } catch (error) {
      console.error("[Engine] Stream error:", error);
      sendStreamError(id, "Internal stream error");
    }
  }
  function sendStreamChunk(id, chunk) {
    self.postMessage({
      type: "STREAM_CHUNK",
      id,
      chunk
    });
  }
  function sendStreamError(id, error) {
    self.postMessage({
      type: "STREAM_ERROR",
      id,
      error
    });
  }

  // src/engine/signing.ts
  var pendingSignatures = new Map;
  var pendingEncryptions = new Map;
  var pendingDecryptions = new Map;
  function generateUUID() {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    const bytes4 = new Uint8Array(16);
    crypto.getRandomValues(bytes4);
    bytes4[6] = bytes4[6] & 15 | 64;
    bytes4[8] = bytes4[8] & 63 | 128;
    const hex2 = Array.from(bytes4, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex2.slice(0, 8)}-${hex2.slice(8, 12)}-${hex2.slice(12, 16)}-${hex2.slice(16, 20)}-${hex2.slice(20)}`;
  }
  function requestSign(event) {
    return new Promise((resolve, reject) => {
      const id = generateUUID();
      pendingSignatures.set(id, { resolve, reject });
      const message = {
        type: "ACTION_SIGN_EVENT",
        id,
        event
      };
      self.postMessage(message);
      setTimeout(() => {
        if (pendingSignatures.has(id)) {
          pendingSignatures.delete(id);
          reject(new Error("Signing request timed out"));
        }
      }, 60000);
    });
  }
  function handleSignatureResult(message, setCurrentPubkey, currentPubkey) {
    const pending = pendingSignatures.get(message.id);
    if (!pending) {
      console.warn("[Engine] Received signature for unknown request:", message.id);
      return;
    }
    pendingSignatures.delete(message.id);
    if (message.error) {
      pending.reject(new Error(message.error));
    } else if (message.signedEvent) {
      if (!currentPubkey && message.signedEvent.pubkey) {
        setCurrentPubkey(message.signedEvent.pubkey);
      }
      pending.resolve(message.signedEvent);
    } else {
      pending.reject(new Error("Invalid signature result"));
    }
  }
  function requestEncrypt(pubkey, plaintext) {
    return new Promise((resolve, reject) => {
      const id = generateUUID();
      pendingEncryptions.set(id, { resolve, reject });
      const message = {
        type: "ACTION_ENCRYPT",
        id,
        pubkey,
        plaintext
      };
      self.postMessage(message);
      setTimeout(() => {
        if (pendingEncryptions.has(id)) {
          pendingEncryptions.delete(id);
          reject(new Error("Encryption request timed out"));
        }
      }, 30000);
    });
  }
  function handleEncryptResult(message) {
    const pending = pendingEncryptions.get(message.id);
    if (!pending)
      return;
    pendingEncryptions.delete(message.id);
    if (message.error) {
      pending.reject(new Error(message.error));
    } else if (message.ciphertext) {
      pending.resolve(message.ciphertext);
    } else {
      pending.reject(new Error("Invalid encryption result"));
    }
  }
  function requestDecrypt(pubkey, ciphertext) {
    return new Promise((resolve, reject) => {
      const id = generateUUID();
      pendingDecryptions.set(id, { resolve, reject });
      const message = {
        type: "ACTION_DECRYPT",
        id,
        pubkey,
        ciphertext
      };
      self.postMessage(message);
      setTimeout(() => {
        if (pendingDecryptions.has(id)) {
          pendingDecryptions.delete(id);
          reject(new Error("Decryption request timed out"));
        }
      }, 30000);
    });
  }
  function handleDecryptResult(message) {
    const pending = pendingDecryptions.get(message.id);
    if (!pending)
      return;
    pendingDecryptions.delete(message.id);
    if (message.error) {
      pending.reject(new Error(message.error));
    } else if (message.plaintext) {
      pending.resolve(message.plaintext);
    } else {
      pending.reject(new Error("Invalid decryption result"));
    }
  }

  // src/engine/index.ts
  var pool = null;
  var poolReadyResolve;
  var poolReady = new Promise((resolve) => {
    poolReadyResolve = resolve;
  });
  var currentPubkey = null;
  var appOrigin = SYSTEM_APP_ORIGIN;
  var isCurrentAppOffline = false;
  var currentSpace;
  var keysReadyResolve = null;
  var keysReady = null;
  function setCurrentPubkey(pubkey) {
    currentPubkey = pubkey;
  }
  function initKeysPreload() {
    if (keysReady)
      return;
    keysReady = new Promise((resolve) => {
      keysReadyResolve = resolve;
    });
  }
  var isLoggingWaiting = false;
  async function waitForKeysReady() {
    let attempts = 0;
    while (!keysReady && attempts < 100) {
      if (attempts === 0)
        console.log("[Engine] waitForKeysReady: Waiting for SET_PUBKEY...");
      await new Promise((r) => setTimeout(r, 100));
      attempts++;
    }
    if (keysReady) {
      if (!isLoggingWaiting) {
        isLoggingWaiting = true;
        console.log("[Engine] Waiting for keys to load from relays...");
        keysReady.finally(() => {
          isLoggingWaiting = false;
        });
      }
      await keysReady;
      return true;
    } else {
      console.warn("[Engine] Keys never initialized - SET_PUBKEY not received after 10s");
      return false;
    }
  }
  async function preloadSpaceKeys() {
    await poolReady;
    if (!pool || !currentPubkey) {
      keysReadyResolve?.();
      return;
    }
    console.log("[Engine] Preloading space keys...");
    const ctx = {
      pool,
      requestSign,
      requestEncrypt,
      requestDecrypt,
      currentPubkey,
      appOrigin
    };
    try {
      await loadSpaceKeys(ctx);
      console.log("[Engine] Space keys preloaded");
    } catch (e) {
      console.error("[Engine] Failed to preload space keys:", e);
    } finally {
      startBackgroundSync();
      keysReadyResolve?.();
    }
  }
  function startBackgroundSync() {
    console.log("[InviteDebug] Starting background sync loop (60s interval)");
    const runSync = async () => {
      if (!pool || !currentPubkey)
        return;
      const ctx = {
        pool,
        requestSign,
        requestEncrypt,
        requestDecrypt,
        currentPubkey,
        appOrigin,
        currentSpace
      };
      console.log("[InviteDebug] Running periodic background sync...");
      await syncInvites(ctx);
    };
    runSync().catch((err) => console.error("[InviteDebug] Background sync failed:", err));
    setInterval(() => {
      runSync().catch((err) => console.error("[InviteDebug] Background sync failed:", err));
    }, 60000);
  }
  self.onmessage = async (event) => {
    const message = event.data;
    switch (message.type) {
      case "RELAY_CONFIG":
        await handleRelayConfig(message);
        break;
      case "API_REQUEST":
        await handleApiRequest(message);
        break;
      case "ACTION_FETCH_APP":
        await handleFetchApp(message);
        break;
      case "ACTION_GET_RELAY_STATUS":
        self.postMessage({
          type: "RELAY_STATUS_RESULT",
          id: message.id,
          stats: pool ? pool.getStats() : []
        });
        break;
      case "STREAM_OPEN":
        await poolReady;
        if (pool) {
          let streamPool = pool;
          if (isCurrentAppOffline) {
            streamPool = pool.withRelays(["mirage://local"]);
          }
          await handleStreamOpen(message, streamPool, currentPubkey);
        } else {
          sendStreamError(message.id, "Relay pool not initialized");
        }
        break;
      case "SIGNATURE_RESULT":
        handleSignatureResult(message, setCurrentPubkey, currentPubkey);
        break;
      case "SET_PUBKEY":
        console.log("[Engine] SET_PUBKEY received:", message.pubkey.slice(0, 8) + "...");
        setCurrentPubkey(message.pubkey);
        initKeysPreload();
        preloadSpaceKeys();
        break;
      case "SET_APP_ORIGIN":
        const payload = message;
        appOrigin = payload.origin;
        isCurrentAppOffline = !!payload.offline;
        console.log(`[Engine] App origin set: ${appOrigin?.slice(0, 20)}... (Offline: ${isCurrentAppOffline})`);
        break;
      case "SET_SPACE_CONTEXT":
        const ctxMsg = message;
        currentSpace = { id: ctxMsg.spaceId, name: ctxMsg.spaceName };
        console.log("[Engine] Space context set:", currentSpace);
        break;
      case "ENCRYPT_RESULT":
        handleEncryptResult(message);
        break;
      case "DECRYPT_RESULT":
        handleDecryptResult(message);
        break;
      default:
        console.warn("[Engine] Unknown message type:", message);
    }
  };
  async function handleRelayConfig(message) {
    if (!pool) {
      pool = new MiragePool;
    }
    switch (message.action) {
      case "SET":
        await pool.setRelays(message.relays);
        break;
      case "ADD":
        await Promise.allSettled(message.relays.map((url) => pool.addRelay(url)));
        break;
      case "REMOVE":
        for (const url of message.relays) {
          pool.removeRelay(url);
        }
        break;
    }
    poolReadyResolve();
  }
  async function handleApiRequest(message) {
    const start = performance.now();
    await poolReady;
    if (!pool) {
      sendResponse(message.id, 503, { error: "Relay pool not initialized" });
      return;
    }
    const { method, path, body } = message;
    console.log(`[API] ${method} ${path}`, body ? { body } : "");
    const sender = message._sender;
    if (path.startsWith("/mirage/v1/space") || path.startsWith("/mirage/v1/admin")) {
      const keysReady2 = await waitForKeysReady();
      if (!keysReady2) {
        sendResponse(message.id, 503, { error: "Keys not ready" });
        return;
      }
    }
    let requestPool = pool;
    const isSystemRoute = path.startsWith("/mirage/v1/admin") || path.startsWith("/mirage/v1/spaces") || path.startsWith("/mirage/v1/space") || path.startsWith("/mirage/v1/user");
    if (isCurrentAppOffline && !isSystemRoute) {
      requestPool = pool.withRelays(["mirage://local"]);
    }
    const route = await matchRoute(method, path, requestPool);
    if (!route) {
      sendResponse(message.id, 404, { error: "Not found" });
      return;
    }
    try {
      const result = await route.handler(body, route.params);
      const duration = performance.now() - start;
      sendResponse(message.id, result.status, result.body);
    } catch (err) {
      console.error(`[Engine] API Error: ${method} ${path}`, err);
      sendResponse(message.id, err.status || 500, { error: err.message });
    }
  }
  async function matchRoute(method, fullPath, requestPool) {
    const [path, queryString] = fullPath.split("?");
    const params = {};
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        if (params[key]) {
          if (Array.isArray(params[key])) {
            params[key].push(value);
          } else {
            params[key] = [params[key], value];
          }
        } else {
          params[key] = value;
        }
      });
    }
    const eventsCtx = {
      pool: requestPool,
      requestSign
    };
    const userCtx = {
      pool: requestPool,
      currentPubkey
    };
    const spaceCtx = {
      pool: requestPool,
      requestSign,
      requestEncrypt,
      requestDecrypt,
      currentPubkey,
      appOrigin,
      currentSpace
    };
    const isAdminOrigin = appOrigin === SYSTEM_APP_ORIGIN;
    if (method === "GET" && path === "/mirage/v1/ready") {
      return {
        handler: async () => ({
          status: 200,
          body: {
            ready: true,
            authenticated: !!currentPubkey,
            relayCount: pool?.getRelays().length ?? 0
          }
        }),
        params: {}
      };
    }
    if (method === "GET" && path === "/mirage/v1/events") {
      return {
        handler: async () => getEvents(eventsCtx, params),
        params
      };
    }
    if (method === "POST" && path === "/mirage/v1/events") {
      return {
        handler: async (body) => postEvents(eventsCtx, body),
        params: {}
      };
    }
    if (method === "GET" && path === "/mirage/v1/feed") {
      const feedParams = { ...params, kinds: ["1"] };
      return {
        handler: async () => getEvents(eventsCtx, feedParams),
        params: feedParams
      };
    }
    if (method === "POST" && path === "/mirage/v1/feed") {
      return {
        handler: async (body) => postEvents(eventsCtx, { ...body, kind: 1 }),
        params: {}
      };
    }
    if (method === "GET" && path === "/mirage/v1/user/me") {
      return {
        handler: async () => getCurrentUser(userCtx),
        params: {}
      };
    }
    if (path.startsWith("/mirage/v1/admin/apps")) {
      console.log(`[API_DEBUG] Handling /admin/apps request. Method=${method} IsAdmin=${isAdminOrigin}`);
      if (!isAdminOrigin) {
        console.warn(`[API_DEBUG] Admin access denied for ${path}`);
        return {
          handler: async () => ({
            status: 403,
            body: { error: "Admin access required" }
          }),
          params: {}
        };
      }
      const storageCtx = {
        pool: requestPool,
        requestSign,
        requestEncrypt,
        requestDecrypt,
        currentPubkey,
        appOrigin: SYSTEM_APP_ORIGIN
      };
      if (method === "GET") {
        return {
          handler: async () => ({
            status: 200,
            body: await loadAppLibrary(storageCtx)
          }),
          params: {}
        };
      }
      if (method === "POST") {
        return {
          handler: async (body) => {
            await addAppToLibrary(storageCtx, body);
            return { status: 201, body: { success: true } };
          },
          params: {}
        };
      }
      if (method === "DELETE") {
        return {
          handler: async (body) => {
            const { naddr } = body;
            if (!naddr) {
              return { status: 400, body: { error: "naddr required" } };
            }
            const removed = await removeAppFromLibrary(storageCtx, naddr);
            if (removed) {
              return { status: 200, body: { deleted: naddr } };
            } else {
              return { status: 404, body: { error: "App not found" } };
            }
          },
          params: {}
        };
      }
    }
    const profilesMatch = path.match(/^\/mirage\/v1\/profiles\/([a-f0-9]{64})$/);
    if (method === "GET" && profilesMatch) {
      return {
        handler: async () => getUserByPubkey(userCtx, profilesMatch[1]),
        params: { pubkey: profilesMatch[1] }
      };
    }
    const usersMatch = path.match(/^\/mirage\/v1\/users\/([a-f0-9]{64})$/);
    if (method === "GET" && usersMatch) {
      return {
        handler: async () => getUserByPubkey(userCtx, usersMatch[1]),
        params: { pubkey: usersMatch[1] }
      };
    }
    const storageMatch = path.match(/^\/mirage\/v1\/space\/me\/(.+)$/);
    if (storageMatch) {
      const key = decodeURIComponent(storageMatch[1]);
      const storageCtx = {
        pool: requestPool,
        requestSign,
        requestEncrypt,
        requestDecrypt,
        currentPubkey,
        appOrigin,
        currentSpace
      };
      if (method === "GET") {
        return {
          handler: async () => getStorage(storageCtx, key, { pubkey: params.pubkey }),
          params: { key }
        };
      }
      if (method === "PUT") {
        return {
          handler: async (body) => putStorage(storageCtx, key, body, {
            public: params.public
          }),
          params: { key }
        };
      }
      if (method === "DELETE") {
        return {
          handler: async () => deleteStorage(storageCtx, key),
          params: { key }
        };
      }
    }
    if (method === "DELETE" && path === "/mirage/v1/admin/reset") {
      if (!isAdminOrigin) {
        return {
          handler: async () => ({
            status: 403,
            body: { error: "Admin access required" }
          }),
          params: {}
        };
      }
      return {
        handler: async () => {
          if (!pool || !currentPubkey) {
            return { status: 401, body: { error: "Not authenticated" } };
          }
          console.log("[Admin] Wiping all Mirage data...");
          const events = await pool.list([
            {
              kinds: [30078],
              authors: [currentPubkey],
              limit: 200
            }
          ]);
          const toDelete = [];
          for (const ev of events) {
            const dTag = ev.tags.find((t) => t[0] === "d")?.[1];
            if (dTag && (dTag.startsWith("mirage:") || dTag.startsWith("mirage-app:") || dTag.startsWith("mirage-studio:") || dTag.includes(":mirage:"))) {
              console.log(`[Admin] Marking for deletion: ${dTag}`);
              toDelete.push(dTag);
            }
          }
          if (toDelete.length > 0) {
            for (const dTag of toDelete) {
              try {
                console.log(`[Admin] Deleting ${dTag}...`);
                const unsigned = {
                  kind: 30078,
                  created_at: Math.floor(Date.now() / 1000),
                  tags: [
                    ["d", dTag],
                    ["deleted", "true"]
                  ],
                  content: "",
                  pubkey: currentPubkey
                };
                const signed = await requestSign(unsigned);
                await pool.publish(signed);
              } catch (e) {
                console.error(`[Admin] Failed to delete ${dTag}:`, e);
              }
            }
          }
          return {
            status: 200,
            body: { deletedCount: toDelete.length, keys: toDelete }
          };
        },
        params: {}
      };
    }
    if (method === "GET" && path === "/mirage/v1/spaces") {
      return {
        handler: async () => listSpaces(spaceCtx),
        params: {}
      };
    }
    if (method === "GET" && path === "/mirage/v1/admin/spaces/all") {
      return {
        handler: async () => listAllSpaces(spaceCtx),
        params: {}
      };
    }
    if (method === "POST" && path === "/mirage/v1/spaces") {
      return {
        handler: async (body) => createSpace(spaceCtx, body),
        params: {}
      };
    }
    const updateSpaceMatch = path.match(/^\/mirage\/v1\/spaces\/(.+)$/);
    if (method === "PUT" && updateSpaceMatch) {
      const spaceId = decodeURIComponent(updateSpaceMatch[1]);
      return {
        handler: async (body) => updateSpace(spaceCtx, spaceId, body),
        params: { id: spaceId }
      };
    }
    const deleteSpaceMatch = path.match(/^\/mirage\/v1\/spaces\/(.+)$/);
    if (method === "DELETE" && deleteSpaceMatch) {
      const spaceId = decodeURIComponent(deleteSpaceMatch[1]);
      return {
        handler: async () => deleteSpace(spaceCtx, spaceId),
        params: { id: spaceId }
      };
    }
    if (method === "GET" && path === "/mirage/v1/space") {
      return {
        handler: async () => getSpaceContext(spaceCtx),
        params: {}
      };
    }
    if (method === "PUT" && path === "/mirage/v1/space") {
      return {
        handler: async (body) => {
          const { spaceId, spaceName } = body;
          if (!spaceId) {
            return { status: 400, body: { error: "spaceId required" } };
          }
          currentSpace = { id: spaceId, name: spaceName || "" };
          console.log("[Engine] Space context set via API:", currentSpace);
          return { status: 200, body: { spaceId, spaceName: spaceName || "" } };
        },
        params: {}
      };
    }
    if (method === "GET" && path === "/mirage/v1/space/store") {
      if (!currentSpace?.id) {
        return {
          handler: async () => ({
            status: 400,
            body: { error: "No space context set. Use PUT /space first." }
          }),
          params: {}
        };
      }
      return {
        handler: async () => getSpaceStore(spaceCtx, currentSpace.id),
        params: {}
      };
    }
    const implicitStoreMatch = path.match(/^\/mirage\/v1\/space\/store\/(.+)$/);
    if (method === "PUT" && implicitStoreMatch) {
      if (!currentSpace?.id) {
        return {
          handler: async () => ({
            status: 400,
            body: { error: "No space context set. Use PUT /space first." }
          }),
          params: {}
        };
      }
      const key = decodeURIComponent(implicitStoreMatch[1]);
      return {
        handler: async (body) => updateSpaceStore(spaceCtx, currentSpace.id, key, body),
        params: { key }
      };
    }
    if (method === "GET" && path === "/mirage/v1/space/messages") {
      if (!currentSpace?.id) {
        return {
          handler: async () => ({
            status: 400,
            body: { error: "No space context set. Use PUT /space first." }
          }),
          params: {}
        };
      }
      const getIntParam = (p) => p ? parseInt(String(p), 10) : undefined;
      return {
        handler: async () => getSpaceMessages(spaceCtx, currentSpace.id, {
          since: getIntParam(params.since),
          limit: getIntParam(params.limit)
        }),
        params: {}
      };
    }
    if (method === "POST" && path === "/mirage/v1/space/messages") {
      if (!currentSpace?.id) {
        return {
          handler: async () => ({
            status: 400,
            body: { error: "No space context set. Use PUT /space first." }
          }),
          params: {}
        };
      }
      return {
        handler: async (body) => postSpaceMessage(spaceCtx, currentSpace.id, body),
        params: {}
      };
    }
    if (method === "POST" && path === "/mirage/v1/space/invite") {
      if (!currentSpace?.id) {
        return {
          handler: async () => ({
            status: 400,
            body: { error: "No space context set. Use PUT /space first." }
          }),
          params: {}
        };
      }
      return {
        handler: async (body) => inviteMember(spaceCtx, currentSpace.id, body),
        params: {}
      };
    }
    const dmCtx = {
      pool: requestPool,
      requestSign,
      requestEncrypt,
      requestDecrypt,
      currentPubkey,
      appOrigin
    };
    if (method === "GET" && path === "/mirage/v1/dms") {
      return {
        handler: async () => listDMs(dmCtx),
        params: {}
      };
    }
    const dmMessagesMatch = path.match(/^\/mirage\/v1\/dms\/([a-f0-9]{64})\/messages$/);
    if (method === "GET" && dmMessagesMatch) {
      const peerPubkey = dmMessagesMatch[1];
      return {
        handler: async () => getDMMessages(dmCtx, peerPubkey, {
          limit: params.limit ? parseInt(String(params.limit), 10) : undefined
        }),
        params: { peerPubkey }
      };
    }
    if (method === "POST" && dmMessagesMatch) {
      const peerPubkey = dmMessagesMatch[1];
      return {
        handler: async (body) => sendDM(dmCtx, peerPubkey, {
          content: body.content
        }),
        params: { peerPubkey }
      };
    }
    const contactsCtx = {
      pool: requestPool,
      requestSign,
      requestEncrypt,
      requestDecrypt,
      currentPubkey,
      appOrigin
    };
    if (method === "GET" && path === "/mirage/v1/contacts") {
      return {
        handler: async () => listContacts(contactsCtx),
        params: {}
      };
    }
    if (method === "PUT" && path === "/mirage/v1/contacts") {
      return {
        handler: async (body) => updateContacts(contactsCtx, body),
        params: {}
      };
    }
    const userContactsMatch = path.match(/^\/mirage\/v1\/contacts\/([a-f0-9]{64})$/);
    if (method === "GET" && userContactsMatch) {
      const pubkey = userContactsMatch[1];
      return {
        handler: async () => getUserContacts(contactsCtx, pubkey),
        params: { pubkey }
      };
    }
    return null;
  }
  function sendResponse(id, status, body, headers) {
    const response = {
      type: "API_RESPONSE",
      id,
      status,
      body,
      headers
    };
    self.postMessage(response);
  }
  async function handleFetchApp(message) {
    const result = {
      type: "FETCH_APP_RESULT",
      id: message.id
    };
    try {
      await poolReady;
      if (!pool)
        throw new Error("Pool not ready");
      const appCode = await fetchAppCode(pool, message.naddr);
      if (appCode.error) {
        result.error = appCode.error;
      } else {
        result.html = appCode.html;
      }
    } catch (e) {
      result.error = e.message;
    }
    self.postMessage(result);
  }
})();
