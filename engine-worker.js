(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {
        get: all[name],
        enumerable: true,
        configurable: true,
        set: (newValue) => all[name] = () => newValue
      });
  };

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
        for (let window = 0;window < windows; window++) {
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
        for (let window = 0;window < windows; window++) {
          const offset = window * windowSize;
          let wbits = Number(n & mask);
          n >>= shiftBy;
          if (wbits > windowSize) {
            wbits -= maxNumber;
            n += _1n3;
          }
          const offset1 = offset;
          const offset2 = offset + Math.abs(wbits) - 1;
          const cond1 = window % 2 !== 0;
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

  // src/engine/keys.ts
  var SYSTEM_APP_ORIGIN = "mirage";
  var KEY_STORAGE_ID = "space_keys";
  async function loadSpaceKeys(ctx) {
    try {
      const rawMap = await internalGetStorage(ctx, KEY_STORAGE_ID);
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
      await internalPutStorage(ctx, KEY_STORAGE_ID, rawMap);
      console.log("[Keys] Saved keys to NIP-78 (global keychain)");
    } catch (error) {
      console.error("[Keys] Failed to save keys:", error);
      throw error;
    }
  }
  async function internalGetStorage(ctx, key) {
    if (!ctx.currentPubkey)
      return null;
    const origin = SYSTEM_APP_ORIGIN;
    const dTag = `${origin}:${key}`;
    const filter = {
      kinds: [30078],
      authors: [ctx.currentPubkey],
      "#d": [dTag],
      limit: 1
    };
    const event = await ctx.pool.get(ctx.relays, filter);
    if (!event)
      return null;
    const content = event.content;
    try {
      return JSON.parse(content);
    } catch {}
    if (event.pubkey === ctx.currentPubkey) {
      try {
        const plaintext = await ctx.requestDecrypt(ctx.currentPubkey, content);
        try {
          return JSON.parse(plaintext);
        } catch {
          return plaintext;
        }
      } catch {}
    }
    return content;
  }
  async function internalPutStorage(ctx, key, value) {
    if (!ctx.currentPubkey)
      throw new Error("Not authenticated");
    const origin = SYSTEM_APP_ORIGIN;
    const dTag = `${origin}:${key}`;
    const plaintext = typeof value === "string" ? value : JSON.stringify(value);
    const content = await ctx.requestEncrypt(ctx.currentPubkey, plaintext);
    const unsignedEvent = {
      kind: 30078,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["d", dTag]],
      content
    };
    const signedEvent = await ctx.requestSign(unsignedEvent);
    await Promise.any(ctx.pool.publish(ctx.relays, signedEvent));
    return signedEvent;
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

  // src/engine/services/SpaceService.ts
  class SpaceService {
    ctx;
    keyCache = null;
    storeCache = new Map;
    constructor(config) {
      this.ctx = {
        ...config,
        requestEncrypt: config.requestEncrypt || (async () => {
          throw new Error("Encryption provider missing");
        })
      };
    }
    updateContext(patches) {
      this.ctx = { ...this.ctx, ...patches };
      if (patches.currentPubkey && patches.currentPubkey !== this.ctx.currentPubkey || patches.appOrigin && patches.appOrigin !== this.ctx.appOrigin) {
        this.keyCache = null;
      }
    }
    async getKeys() {
      if (!this.keyCache) {
        this.keyCache = await loadSpaceKeys({
          pool: this.ctx.pool,
          relays: this.ctx.relays,
          currentPubkey: this.ctx.currentPubkey,
          requestSign: this.ctx.requestSign,
          requestDecrypt: this.ctx.requestDecrypt,
          requestEncrypt: this.ctx.requestEncrypt,
          appOrigin: this.ctx.appOrigin
        });
      }
      return this.keyCache;
    }
    resolveSpaceId(spaceId) {
      if (spaceId === "current") {
        return this.ctx.currentSpace?.id || "default";
      }
      return spaceId;
    }
    async listSpaces() {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      await this.syncInvites();
      const keys = await this.getKeys();
      const spaces = [];
      const appPrefix = `${this.ctx.appOrigin}:`;
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
            appOrigin: this.ctx.appOrigin
          });
        }
      }
      return spaces;
    }
    async listAllSpaces() {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      const keys = await this.getKeys();
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
      return spaces;
    }
    async createSpace(name, forAppOrigin) {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      const appOrigin = forAppOrigin || this.ctx.appOrigin;
      if (appOrigin === "unknown") {
        throw new Error("Cannot create space for unknown app origin");
      }
      const spaceId = generateRandomId();
      const key = generateSymmetricKey();
      const scopedId = `${appOrigin}:${spaceId}`;
      const createdAt = Math.floor(Date.now() / 1000);
      const keys = await this.getKeys();
      keys.set(scopedId, {
        key,
        version: 1,
        name,
        createdAt,
        deleted: false
      });
      await this.saveKeys(keys);
      return {
        id: spaceId,
        name,
        createdAt,
        memberCount: 1,
        appOrigin
      };
    }
    async deleteSpace(rawSpaceId) {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      const spaceId = this.resolveSpaceId(rawSpaceId);
      const keys = await this.getKeys();
      let targetScopedId = `${this.ctx.appOrigin}:${spaceId}`;
      if (!keys.has(targetScopedId)) {
        const found = Array.from(keys.keys()).find((k) => k.endsWith(`:${spaceId}`));
        if (found) {
          targetScopedId = found;
        } else {
          throw new Error("Space not found");
        }
      }
      const existing = keys.get(targetScopedId);
      keys.set(targetScopedId, {
        ...existing,
        deleted: true,
        deletedAt: Math.floor(Date.now() / 1000)
      });
      await this.saveKeys(keys);
      return spaceId;
    }
    async updateSpace(rawSpaceId, name) {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      const spaceId = this.resolveSpaceId(rawSpaceId);
      const keys = await this.getKeys();
      let targetScopedId = `${this.ctx.appOrigin}:${spaceId}`;
      if (!keys.has(targetScopedId)) {
        const found = Array.from(keys.keys()).find((k) => k.endsWith(`:${spaceId}`));
        if (found)
          targetScopedId = found;
        else
          throw new Error("Space not found");
      }
      const existing = keys.get(targetScopedId);
      keys.set(targetScopedId, {
        ...existing,
        name
      });
      await this.saveKeys(keys);
      return { id: spaceId, name };
    }
    async getMessages(rawSpaceId, limit2 = 50, since) {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      const spaceId = this.resolveSpaceId(rawSpaceId);
      const scopedId = `${this.ctx.appOrigin}:${spaceId}`;
      const keys = await this.getKeys();
      const keyInfo = keys.get(scopedId);
      if (!keyInfo)
        throw new Error("Space key not found");
      const filter = {
        kinds: [42],
        "#e": [spaceId],
        limit: limit2
      };
      if (since)
        filter.since = since;
      const events = await this.ctx.pool.querySync(this.ctx.relays, filter);
      const messages = [];
      for (const ev of events) {
        try {
          const payload = JSON.parse(ev.content);
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
      return messages;
    }
    async sendMessage(rawSpaceId, content) {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      const spaceId = this.resolveSpaceId(rawSpaceId);
      const scopedId = `${this.ctx.appOrigin}:${spaceId}`;
      const keys = await this.getKeys();
      const keyInfo = keys.get(scopedId);
      if (!keyInfo)
        throw new Error("Space key not found");
      const encrypted = encryptSymmetric(keyInfo.key, content);
      const eventContent = JSON.stringify(encrypted);
      const unsigned = {
        kind: 42,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["e", spaceId, "", "root"]],
        content: eventContent,
        pubkey: this.ctx.currentPubkey
      };
      const signed = await this.ctx.requestSign(unsigned);
      await Promise.any(this.ctx.pool.publish(this.ctx.relays, signed));
      return {
        id: signed.id,
        spaceId,
        author: signed.pubkey,
        content,
        type: "message",
        createdAt: signed.created_at
      };
    }
    async saveKeys(keys) {
      await saveSpaceKeys({
        pool: this.ctx.pool,
        relays: this.ctx.relays,
        currentPubkey: this.ctx.currentPubkey,
        requestSign: this.ctx.requestSign,
        requestDecrypt: this.ctx.requestDecrypt,
        requestEncrypt: this.ctx.requestEncrypt,
        appOrigin: this.ctx.appOrigin
      }, keys);
    }
    async inviteMember(rawSpaceId, pubkey, name) {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      const spaceId = this.resolveSpaceId(rawSpaceId);
      let receiverPubkey = pubkey;
      if (receiverPubkey.startsWith("npub")) {
        try {
          const decoded = nip19_exports.decode(receiverPubkey);
          if (decoded.type === "npub") {
            receiverPubkey = decoded.data;
          }
        } catch (e) {
          throw new Error("Invalid npub format");
        }
      }
      const scopedId = `${this.ctx.appOrigin}:${spaceId}`;
      const keys = await this.getKeys();
      const keyInfo = keys.get(scopedId);
      if (!keyInfo)
        throw new Error("Space key not found");
      const invitePayload = {
        type: "mirage_invite",
        spaceId,
        scopedId,
        key: keyInfo.key,
        version: keyInfo.version,
        name: name || keyInfo.name || `Space ${spaceId.slice(0, 8)}`,
        origin: this.ctx.appOrigin
      };
      const innerEvent = {
        kind: 13,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: JSON.stringify(invitePayload),
        pubkey: this.ctx.currentPubkey
      };
      const signedInner = await this.ctx.requestSign(innerEvent);
      const wrapper = wrapEvent3(signedInner, receiverPubkey);
      try {
        await Promise.any(this.ctx.pool.publish(this.ctx.relays, wrapper));
      } catch (e) {
        console.error(`[SpaceService] Failed to publish invite:`, e);
        throw new Error("Failed to publish invite");
      }
      return { invited: receiverPubkey };
    }
    async syncInvites() {
      if (!this.ctx.currentPubkey)
        return;
      const filter = {
        kinds: [1059],
        "#p": [this.ctx.currentPubkey],
        limit: 100,
        since: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60
      };
      const events = await this.ctx.pool.querySync(this.ctx.relays, filter);
      const keys = await this.getKeys();
      let updated = false;
      const newSpaces = [];
      for (const wrap of events) {
        try {
          const innerJson = await this.ctx.requestDecrypt(wrap.pubkey, wrap.content);
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
              }
            }
          }
        } catch (e) {
          continue;
        }
      }
      if (updated) {
        await this.saveKeys(keys);
        for (const space of newSpaces) {
          self.postMessage({
            type: "NEW_SPACE_INVITE",
            id: crypto.randomUUID(),
            spaceId: space.id,
            spaceName: space.name
          });
        }
      }
    }
    async getSpaceStore(rawSpaceId) {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      const spaceId = this.resolveSpaceId(rawSpaceId);
      const scopedId = `${this.ctx.appOrigin}:${spaceId}`;
      const keys = await this.getKeys();
      const keyInfo = keys.get(scopedId);
      if (!keyInfo)
        throw new Error("Space key not found");
      let cache = this.storeCache.get(scopedId);
      if (!cache) {
        cache = { state: new Map, latestTimestamp: 0 };
        this.storeCache.set(scopedId, cache);
      }
      const filter = {
        kinds: [42],
        "#e": [spaceId],
        "#t": ["mirage_store"],
        since: cache.latestTimestamp + 1
      };
      const events = await this.ctx.pool.querySync(this.ctx.relays, filter);
      for (const ev of events) {
        if (ev.created_at > cache.latestTimestamp) {
          cache.latestTimestamp = ev.created_at;
        }
        try {
          const payload = JSON.parse(ev.content);
          const plaintext = decryptSymmetric(keyInfo.key, payload.ciphertext, payload.nonce);
          if (!plaintext)
            continue;
          const data = JSON.parse(plaintext);
          if (Array.isArray(data) && data[0] === "store_put" && data.length === 3) {
            const [_, key, value] = data;
            const existing = cache.state.get(key);
            if (!existing || ev.created_at >= existing.updatedAt) {
              cache.state.set(key, { value, updatedAt: ev.created_at });
            }
          }
        } catch (e) {}
      }
      const stateObj = {};
      for (const [key, record] of cache.state.entries()) {
        stateObj[key] = record.value;
      }
      return stateObj;
    }
    async updateSpaceStore(rawSpaceId, key, value) {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      const spaceId = this.resolveSpaceId(rawSpaceId);
      const scopedId = `${this.ctx.appOrigin}:${spaceId}`;
      const keys = await this.getKeys();
      const keyInfo = keys.get(scopedId);
      if (!keyInfo)
        throw new Error("Space key not found");
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
        pubkey: this.ctx.currentPubkey
      };
      const signed = await this.ctx.requestSign(unsigned);
      await Promise.any(this.ctx.pool.publish(this.ctx.relays, signed));
      let cache = this.storeCache.get(scopedId);
      if (!cache) {
        cache = { state: new Map, latestTimestamp: 0 };
        this.storeCache.set(scopedId, cache);
      }
      cache.state.set(key, { value, updatedAt: signed.created_at });
      if (signed.created_at > cache.latestTimestamp) {
        cache.latestTimestamp = signed.created_at;
      }
      return { key, value, updatedAt: signed.created_at };
    }
  }

  // src/engine/services/AppService.ts
  class AppService {
    ctx;
    constructor(pool, relays, requestSign, requestEncrypt, requestDecrypt, currentPubkey, appOrigin) {
      this.ctx = {
        pool,
        relays,
        requestSign,
        requestEncrypt,
        requestDecrypt,
        currentPubkey,
        appOrigin,
        currentSpace: undefined
      };
    }
    updateContext(updates) {
      this.ctx = { ...this.ctx, ...updates };
    }
    async fetchAppCode(naddr) {
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
        const event = await this.ctx.pool.get(this.ctx.relays, filter);
        if (!event) {
          return { error: "App not found on relays" };
        }
        return { html: event.content };
      } catch (error) {
        console.error("[AppService] Fetch failed:", error);
        return { error: error instanceof Error ? error.message : "Unknown fetch error" };
      }
    }
    async listApps() {
      const APP_LIST_ID = "app_list";
      console.log("[AppService] Loading app library...");
      try {
        const result = await this.internalGetStorage(APP_LIST_ID);
        let list = Array.isArray(result) ? result : null;
        console.log("[AppService] Loaded apps from NIP-78:", list?.length ?? 0, "apps");
        return list || [];
      } catch (error) {
        console.error("[AppService] Failed to load apps:", error);
        return [];
      }
    }
    async addApp(app) {
      console.log("[AppService] Adding app to library:", app.name, app.naddr?.slice(0, 20) + "...");
      const library = await this.listApps();
      let newIdentifier;
      let newPubkey;
      try {
        const decoded = nip19_exports.decode(app.naddr);
        if (decoded.type === "naddr") {
          newIdentifier = decoded.data.identifier;
          newPubkey = decoded.data.pubkey;
        }
      } catch (e) {
        console.warn("[AppService] Failed to decode new app naddr:", e);
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
      await this.saveAppLibrary(updated);
    }
    async removeApp(naddr) {
      console.log("[AppService] Removing app from library:", naddr?.slice(0, 20) + "...");
      const library = await this.listApps();
      const filtered = library.filter((a) => a.naddr !== naddr);
      if (filtered.length === library.length) {
        console.log("[AppService] App not found in library");
        return false;
      }
      await this.saveAppLibrary(filtered);
      await this.publishDeletion(naddr);
      return true;
    }
    async saveAppLibrary(apps) {
      const APP_LIST_ID = "app_list";
      console.log("[AppService] Saving app library...", apps.length, "apps");
      try {
        await this.internalPutStorage(APP_LIST_ID, apps);
        console.log("[AppService] Saved app list to NIP-78");
      } catch (error) {
        console.error("[AppService] Failed to save apps:", error);
        throw error;
      }
    }
    async publishDeletion(naddr) {
      if (!this.ctx.currentPubkey)
        return;
      try {
        const decoded = nip19_exports.decode(naddr);
        if (decoded.type === "naddr") {
          const { identifier } = decoded.data;
          console.log(`[AppService] Publishing deletion for d-tag="${identifier}"...`);
          const unsigned = {
            kind: 5,
            pubkey: this.ctx.currentPubkey,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
              ["a", `30078:${this.ctx.currentPubkey}:${identifier}`]
            ],
            content: "App deleted by user"
          };
          const signed = await this.ctx.requestSign(unsigned);
          await Promise.any(this.ctx.pool.publish(this.ctx.relays, signed));
          if (!this.ctx.relays.includes("mirage://local")) {
            try {
              await Promise.any(this.ctx.pool.publish(["mirage://local"], signed));
            } catch (e) {
              console.warn("[AppService] Failed to clean up local storage:", e);
            }
          }
        }
      } catch (e) {
        console.error("[AppService] Failed to publish deletion request:", e);
      }
    }
    async internalGetStorage(key) {
      if (!this.ctx.currentPubkey)
        return null;
      const dTag = `${SYSTEM_APP_ORIGIN}:${key}`;
      const filter = {
        kinds: [30078],
        authors: [this.ctx.currentPubkey],
        "#d": [dTag],
        limit: 1
      };
      const event = await this.ctx.pool.get(this.ctx.relays, filter);
      if (!event)
        return null;
      const content = event.content;
      try {
        return JSON.parse(content);
      } catch {}
      if (event.pubkey === this.ctx.currentPubkey) {
        try {
          const plaintext = await this.ctx.requestDecrypt(this.ctx.currentPubkey, content);
          try {
            return JSON.parse(plaintext);
          } catch {
            return plaintext;
          }
        } catch {}
      }
      return content;
    }
    async internalPutStorage(key, value, isPublic = false) {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      const dTag = `${SYSTEM_APP_ORIGIN}:${key}`;
      const plaintext = typeof value === "string" ? value : JSON.stringify(value);
      let content = plaintext;
      if (!isPublic) {
        content = await this.ctx.requestEncrypt(this.ctx.currentPubkey, plaintext);
      }
      const unsignedEvent = {
        kind: 30078,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["d", dTag]],
        content
      };
      const signedEvent = await this.ctx.requestSign(unsignedEvent);
      await Promise.any(this.ctx.pool.publish(this.ctx.relays, signedEvent));
      return signedEvent;
    }
  }

  // src/engine/services/ContactService.ts
  class ContactService {
    ctx;
    constructor(pool, relays, requestSign, currentPubkey) {
      this.ctx = {
        pool,
        relays,
        requestSign,
        currentPubkey
      };
    }
    updateContext(updates) {
      this.ctx = { ...this.ctx, ...updates };
    }
    async listContacts() {
      if (!this.ctx.currentPubkey) {
        throw new Error("Not authenticated");
      }
      return this.fetchContactList(this.ctx.currentPubkey);
    }
    async getUserContacts(targetPubkey) {
      const hexPubkey = this.normalizePubkey(targetPubkey);
      return this.fetchContactList(hexPubkey);
    }
    async updateContacts(contacts) {
      if (!this.ctx.currentPubkey) {
        throw new Error("Not authenticated");
      }
      const tags = contacts.map((c) => {
        const tag = ["p", this.normalizePubkey(c.pubkey)];
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
        pubkey: this.ctx.currentPubkey
      };
      const signed = await this.ctx.requestSign(event);
      await Promise.any(this.ctx.pool.publish(this.ctx.relays, signed));
    }
    async fetchContactList(pubkey) {
      const filter = {
        kinds: [3],
        authors: [pubkey],
        limit: 1
      };
      const event = await this.ctx.pool.get(this.ctx.relays, filter);
      if (!event)
        return [];
      return event.tags.filter((t) => t[0] === "p").map((t) => ({
        pubkey: t[1],
        relay: t[2] || undefined,
        petname: t[3] || undefined
      }));
    }
    normalizePubkey(pubkey) {
      if (pubkey.startsWith("npub")) {
        try {
          const d = nip19_exports.decode(pubkey);
          if (d.type === "npub")
            return d.data;
        } catch {}
      }
      return pubkey;
    }
  }

  // src/engine/services/DirectMessageService.ts
  class DirectMessageService {
    ctx;
    constructor(pool, relays, requestSign, requestEncrypt, requestDecrypt, currentPubkey) {
      this.ctx = {
        pool,
        relays,
        requestSign,
        requestEncrypt,
        requestDecrypt,
        currentPubkey
      };
    }
    updateContext(updates) {
      this.ctx = { ...this.ctx, ...updates };
    }
    async listDMs() {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      const filter = {
        kinds: [1059],
        "#p": [this.ctx.currentPubkey],
        limit: 100
      };
      const events = await this.ctx.pool.querySync(this.ctx.relays, filter);
      const conversations = new Map;
      const seenIds = new Set;
      for (const wrap of events) {
        try {
          const sealEvent = await unwrapEvent3(wrap, this.ctx.requestDecrypt);
          if (!sealEvent || sealEvent.kind !== 13)
            continue;
          if (!sealEvent.pubkey)
            continue;
          const senderPubkey = sealEvent.pubkey;
          let rumorJson;
          try {
            rumorJson = await this.ctx.requestDecrypt(senderPubkey, sealEvent.content);
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
          if (sender === this.ctx.currentPubkey) {
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
      return Array.from(conversations.values()).sort((a, b) => b.timestamp - a.timestamp);
    }
    async getMessages(targetPubkey, limit2 = 50) {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      let hexTarget = this.normalizePubkey(targetPubkey);
      const filter = {
        kinds: [1059],
        "#p": [this.ctx.currentPubkey],
        limit: limit2
      };
      const events = await this.ctx.pool.querySync(this.ctx.relays, filter);
      const messages = [];
      const seenIds = new Set;
      for (const wrap of events) {
        try {
          const sealEvent = await unwrapEvent3(wrap, this.ctx.requestDecrypt);
          if (!sealEvent || sealEvent.kind !== 13)
            continue;
          if (!sealEvent.pubkey)
            continue;
          const senderPubkey = sealEvent.pubkey;
          let rumorJson;
          try {
            rumorJson = await this.ctx.requestDecrypt(senderPubkey, sealEvent.content);
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
          } else if (sender === this.ctx.currentPubkey) {
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
      return messages.sort((a, b) => a.createdAt - b.createdAt);
    }
    async sendDM(targetPubkey, content) {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      if (!content)
        throw new Error("Content required");
      let hexTarget = this.normalizePubkey(targetPubkey);
      const rumor = {
        kind: 14,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", hexTarget]],
        content,
        pubkey: this.ctx.currentPubkey
      };
      const rumorJson = JSON.stringify(rumor);
      const cipherTextForRecipient = await this.ctx.requestEncrypt(hexTarget, rumorJson);
      const sealForRecipient = {
        kind: 13,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: cipherTextForRecipient,
        pubkey: this.ctx.currentPubkey
      };
      const signedSealForRecipient = await this.ctx.requestSign(sealForRecipient);
      const giftForRecipient = wrapEvent3(signedSealForRecipient, hexTarget);
      await Promise.any(this.ctx.pool.publish(this.ctx.relays, giftForRecipient));
      if (hexTarget !== this.ctx.currentPubkey) {
        const cipherTextForSelf = await this.ctx.requestEncrypt(this.ctx.currentPubkey, rumorJson);
        const sealForSelf = {
          kind: 13,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: cipherTextForSelf,
          pubkey: this.ctx.currentPubkey
        };
        const signedSealForSelf = await this.ctx.requestSign(sealForSelf);
        const giftForSelf = wrapEvent3(signedSealForSelf, this.ctx.currentPubkey);
        await Promise.any(this.ctx.pool.publish(this.ctx.relays, giftForSelf));
      }
      return {
        id: "sent",
        pubkey: hexTarget,
        sender: this.ctx.currentPubkey,
        content,
        createdAt: rumor.created_at,
        isIncoming: false
      };
    }
    normalizePubkey(pubkey) {
      if (pubkey.startsWith("npub")) {
        try {
          const d = nip19_exports.decode(pubkey);
          if (d.type === "npub")
            return d.data;
        } catch {}
      }
      return pubkey;
    }
  }

  // src/engine/services/EventService.ts
  class EventService {
    ctx;
    constructor(pool, relays, requestSign) {
      this.ctx = {
        pool,
        relays,
        requestSign
      };
    }
    updateContext(updates) {
      this.ctx = { ...this.ctx, ...updates };
    }
    async getEvents(filter) {
      return this.ctx.pool.querySync(this.ctx.relays, filter);
    }
    async publishEvent(partialEvent, targetRelays) {
      const unsignedEvent = {
        kind: partialEvent.kind,
        content: partialEvent.content,
        tags: partialEvent.tags ?? [],
        created_at: Math.floor(Date.now() / 1000)
      };
      const signedEvent = await this.ctx.requestSign(unsignedEvent);
      const targets = targetRelays || this.ctx.relays;
      await Promise.any(this.ctx.pool.publish(targets, signedEvent));
      return signedEvent;
    }
  }

  // src/engine/services/StorageService.ts
  class StorageService {
    ctx;
    constructor(pool, relays, requestSign, requestEncrypt, requestDecrypt, currentPubkey, appOrigin, currentSpace) {
      this.ctx = {
        pool,
        relays,
        requestSign,
        requestEncrypt,
        requestDecrypt,
        currentPubkey,
        appOrigin,
        currentSpace
      };
    }
    updateContext(updates) {
      this.ctx = { ...this.ctx, ...updates };
    }
    async getStorage(key, targetPubkey) {
      if (!this.ctx.currentPubkey && !targetPubkey)
        throw new Error("Not authenticated");
      const isSystemStorage = this.ctx.appOrigin === SYSTEM_APP_ORIGIN;
      if (!isSystemStorage && !this.ctx.currentSpace?.id) {
        throw new Error("Space context required for storage operations");
      }
      const author = targetPubkey || this.ctx.currentPubkey;
      const dTag = isSystemStorage ? `${this.ctx.appOrigin}:${key}` : `${this.ctx.appOrigin}:${this.ctx.currentSpace.id}:${key}`;
      const filter = {
        kinds: [30078],
        authors: [author],
        "#d": [dTag],
        limit: 1
      };
      const event = await this.ctx.pool.get(this.ctx.relays, filter);
      if (!event)
        return null;
      const content = event.content;
      try {
        return JSON.parse(content);
      } catch {}
      if (this.ctx.currentPubkey === author) {
        try {
          const plaintext = await this.ctx.requestDecrypt(this.ctx.currentPubkey, content);
          try {
            return JSON.parse(plaintext);
          } catch {
            return plaintext;
          }
        } catch {}
      }
      return content;
    }
    async putStorage(key, value, isPublic = false) {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      const isSystemStorage = this.ctx.appOrigin === SYSTEM_APP_ORIGIN;
      if (!isSystemStorage && !this.ctx.currentSpace?.id) {
        throw new Error("Space context required for storage operations");
      }
      const dTag = isSystemStorage ? `${this.ctx.appOrigin}:${key}` : `${this.ctx.appOrigin}:${this.ctx.currentSpace.id}:${key}`;
      const plaintext = typeof value === "string" ? value : JSON.stringify(value);
      let content = plaintext;
      if (!isPublic) {
        content = await this.ctx.requestEncrypt(this.ctx.currentPubkey, plaintext);
      }
      const unsignedEvent = {
        kind: 30078,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["d", dTag]],
        content
      };
      const signedEvent = await this.ctx.requestSign(unsignedEvent);
      await Promise.any(this.ctx.pool.publish(this.ctx.relays, signedEvent));
      return signedEvent;
    }
    async deleteStorage(key) {
      if (!this.ctx.currentPubkey)
        throw new Error("Not authenticated");
      const isSystemStorage = this.ctx.appOrigin === SYSTEM_APP_ORIGIN;
      if (!isSystemStorage && !this.ctx.currentSpace?.id) {
        throw new Error("Space context required for storage operations");
      }
      const dTag = isSystemStorage ? `${this.ctx.appOrigin}:${key}` : `${this.ctx.appOrigin}:${this.ctx.currentSpace.id}:${key}`;
      let ciphertext;
      try {
        ciphertext = await this.ctx.requestEncrypt(this.ctx.currentPubkey, "");
      } catch {
        throw new Error("Failed to encrypt deletion marker");
      }
      const unsignedEvent = {
        kind: 30078,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["d", dTag],
          ["deleted", "true"]
        ],
        content: ciphertext
      };
      const signedTombstone = await this.ctx.requestSign(unsignedEvent);
      await Promise.any(this.ctx.pool.publish(this.ctx.relays, signedTombstone));
      const deletionEvent = {
        kind: 5,
        created_at: Math.floor(Date.now() / 1000) + 5,
        content: "Deleted by Mirage",
        tags: [["a", `30078:${this.ctx.currentPubkey}:${dTag}`]]
      };
      const signedDeletion = await this.ctx.requestSign(deletionEvent);
      await Promise.any(this.ctx.pool.publish(this.ctx.relays, signedDeletion));
      return true;
    }
  }

  // src/engine/services/UserService.ts
  class UserService {
    ctx;
    constructor(pool, relays, currentPubkey) {
      this.ctx = {
        pool,
        relays,
        currentPubkey
      };
    }
    updateContext(updates) {
      this.ctx = { ...this.ctx, ...updates };
    }
    async getCurrentUser() {
      if (!this.ctx.currentPubkey) {
        throw new Error("Not authenticated");
      }
      return this.getUserByPubkey(this.ctx.currentPubkey);
    }
    async getUserByPubkey(pubkey) {
      const filter = {
        kinds: [0],
        authors: [pubkey],
        limit: 1
      };
      const event = await this.ctx.pool.get(this.ctx.relays, filter);
      if (!event) {
        throw new Error("User not found");
      }
      try {
        const metadata = JSON.parse(event.content);
        return {
          pubkey: event.pubkey,
          name: metadata.name,
          displayName: metadata.display_name || metadata.displayName,
          about: metadata.about,
          picture: metadata.picture,
          nip05: metadata.nip05,
          lud16: metadata.lud16
        };
      } catch {
        throw new Error("Invalid metadata format");
      }
    }
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

  // src/engine/MirageEngine.ts
  class MirageEngine {
    pool;
    relays;
    spaceService;
    appService;
    contactService;
    directMessageService;
    eventService;
    storageService;
    userService;
    currentPubkey = null;
    appOrigin = "unknown";
    currentSpace;
    constructor(config) {
      this.pool = config.pool || new SimplePool;
      this.relays = config.relays;
      this.spaceService = new SpaceService({
        pool: this.pool,
        relays: this.relays,
        currentPubkey: this.currentPubkey,
        appOrigin: this.appOrigin,
        currentSpace: this.currentSpace,
        requestSign,
        requestDecrypt,
        requestEncrypt
      });
      this.appService = new AppService(this.pool, this.relays, requestSign, requestEncrypt, requestDecrypt, this.currentPubkey, this.appOrigin);
      this.contactService = new ContactService(this.pool, this.relays, requestSign, this.currentPubkey);
      this.directMessageService = new DirectMessageService(this.pool, this.relays, requestSign, requestEncrypt, requestDecrypt, this.currentPubkey);
      this.eventService = new EventService(this.pool, this.relays, requestSign);
      this.storageService = new StorageService(this.pool, this.relays, requestSign, requestEncrypt, requestDecrypt, this.currentPubkey, this.appOrigin, this.currentSpace);
      this.userService = new UserService(this.pool, this.relays, this.currentPubkey);
    }
    async handleMessage(message) {
      switch (message.type) {
        case "API_REQUEST":
          await this.handleApiRequest(message);
          break;
        case "ACTION_FETCH_APP":
          await this.handleFetchApp(message);
          break;
        case "SET_PUBKEY":
          this.currentPubkey = message.pubkey;
          this.updateContext();
          break;
        case "SET_APP_ORIGIN":
          this.appOrigin = message.origin;
          this.updateContext();
          break;
        case "RELAY_CONFIG":
          const relayMsg = message;
          if (relayMsg.action === "SET") {
            this.relays = relayMsg.relays;
            this.updateContext();
          }
          break;
        case "SET_SPACE_CONTEXT":
          const ctxMsg = message;
          this.currentSpace = { id: ctxMsg.spaceId, name: ctxMsg.spaceName };
          this.updateContext();
          break;
      }
    }
    async handleApiRequest(message) {
      const { method, path, body, id, origin: requestOrigin } = message;
      const origin = requestOrigin || this.appOrigin || SYSTEM_APP_ORIGIN;
      let response;
      try {
        if (path.startsWith("/mirage/v1/space/me/")) {
          response = await this.routeStorage(method, path, body, id, origin);
        } else if (path.startsWith("/mirage/v1/space") || path.startsWith("/mirage/v1/admin/spaces")) {
          response = await this.routeSpaces(method, path, body, id, origin);
        } else if (path.startsWith("/mirage/v1/admin/apps")) {
          response = await this.routeApps(method, path, body, id, origin);
        } else if (path.startsWith("/mirage/v1/contacts")) {
          response = await this.routeContacts(method, path, body, id, origin);
        } else if (path.startsWith("/mirage/v1/dms")) {
          response = await this.routeDMs(method, path, body, id, origin);
        } else if (path.startsWith("/mirage/v1/events")) {
          response = await this.routeEvents(method, path, body, id, origin);
        } else if (path.startsWith("/mirage/v1/user") || path.startsWith("/mirage/v1/users")) {
          response = await this.routeUsers(method, path, body, id, origin);
        } else {
          response = { type: "API_RESPONSE", id, status: 404, body: { error: "Not found" } };
        }
      } catch (e) {
        response = { type: "API_RESPONSE", id, status: 500, body: { error: e.message } };
      }
      this.send(response);
    }
    async handleFetchApp(message) {
      const { naddr, id } = message;
      const result = await this.appService.fetchAppCode(naddr);
      const response = {
        type: "FETCH_APP_RESULT",
        id,
        html: result.html,
        error: result.error
      };
      this.send(response);
    }
    async routeApps(method, path, body, id, origin) {
      const isAdminOrigin = origin === SYSTEM_APP_ORIGIN;
      if (!isAdminOrigin) {
        return { type: "API_RESPONSE", id, status: 403, body: { error: "Admin access required" } };
      }
      if (method === "GET" && path === "/mirage/v1/admin/apps") {
        const apps = await this.appService.listApps();
        return { type: "API_RESPONSE", id, status: 200, body: apps };
      }
      if (method === "POST" && path === "/mirage/v1/admin/apps/publish") {
        const { html, name, existingDTag } = body;
        if (!this.currentPubkey) {
          return { type: "API_RESPONSE", id, status: 401, body: { error: "Not authenticated" } };
        }
        if (!html || typeof html !== "string") {
          return { type: "API_RESPONSE", id, status: 400, body: { error: "html required" } };
        }
        const appName = typeof name === "string" && name.trim() ? name.trim() : "Untitled App";
        const dTag = existingDTag || `mirage:app:${crypto.randomUUID()}`;
        const tags = [
          ["d", dTag],
          ["name", appName],
          ["t", "mirage_app"]
        ];
        await this.eventService.publishEvent({
          kind: 30078,
          content: html,
          tags
        });
        const naddr = nip19_exports.naddrEncode({
          kind: 30078,
          pubkey: this.currentPubkey,
          identifier: dTag,
          relays: this.relays
        });
        const appDef = { naddr, name: appName, createdAt: Date.now() };
        await this.appService.addApp(appDef);
        return { type: "API_RESPONSE", id, status: 201, body: appDef };
      }
      if (method === "POST" && path === "/mirage/v1/admin/apps") {
        await this.appService.addApp(body);
        return { type: "API_RESPONSE", id, status: 201, body: { success: true } };
      }
      if (method === "DELETE" && path === "/mirage/v1/admin/apps") {
        const { naddr } = body;
        if (!naddr)
          return { type: "API_RESPONSE", id, status: 400, body: { error: "naddr required" } };
        const deleted = await this.appService.removeApp(naddr);
        if (deleted) {
          return { type: "API_RESPONSE", id, status: 200, body: { deleted: naddr } };
        } else {
          return { type: "API_RESPONSE", id, status: 404, body: { error: "App not found" } };
        }
      }
      return { type: "API_RESPONSE", id, status: 404, body: { error: "Route not found" } };
    }
    async routeContacts(method, path, body, id, _origin) {
      if (method === "GET" && path === "/mirage/v1/contacts") {
        const contacts = await this.contactService.listContacts();
        return { type: "API_RESPONSE", id, status: 200, body: contacts };
      }
      if (method === "PUT" && path === "/mirage/v1/contacts") {
        await this.contactService.updateContacts(body.contacts);
        return { type: "API_RESPONSE", id, status: 200, body: { success: true } };
      }
      const match = this.matchRoute("/mirage/v1/contacts/:pubkey", path);
      if (match && method === "GET") {
        const contacts = await this.contactService.getUserContacts(match.params.pubkey);
        return { type: "API_RESPONSE", id, status: 200, body: contacts };
      }
      return { type: "API_RESPONSE", id, status: 404, body: { error: "Route not found" } };
    }
    async routeDMs(method, path, body, id, _origin) {
      if (method === "GET" && path === "/mirage/v1/dms") {
        const dms = await this.directMessageService.listDMs();
        return { type: "API_RESPONSE", id, status: 200, body: dms };
      }
      let match = this.matchRoute("/mirage/v1/dms/:pubkey", path);
      if (match && method === "GET") {
        const messages = await this.directMessageService.getMessages(match.params.pubkey, body?.limit);
        return { type: "API_RESPONSE", id, status: 200, body: messages };
      }
      match = this.matchRoute("/mirage/v1/dms/:pubkey", path);
      if (match && method === "POST") {
        const result = await this.directMessageService.sendDM(match.params.pubkey, body.content);
        return { type: "API_RESPONSE", id, status: 201, body: result };
      }
      return { type: "API_RESPONSE", id, status: 404, body: { error: "Route not found" } };
    }
    async routeEvents(method, path, body, id, _origin) {
      if (method === "POST" && path === "/mirage/v1/events") {
        const result = await this.eventService.publishEvent(body, body.targetRelays);
        return { type: "API_RESPONSE", id, status: 201, body: result };
      }
      if (method === "GET" && path === "/mirage/v1/events") {
        const [urlPath, queryString] = path.split("?");
        if (urlPath !== "/mirage/v1/events")
          return { type: "API_RESPONSE", id, status: 404, body: { error: "Route not found" } };
        const params = {};
        if (queryString) {
          const searchParams = new URLSearchParams(queryString);
          searchParams.forEach((value, key) => {
            if (key === "kinds" || key === "authors") {
              params[key] = value.split(",").map((v) => v.trim());
              if (key === "kinds")
                params[key] = params[key].map((k) => parseInt(k));
            } else if (key === "limit" || key === "since" || key === "until") {
              params[key] = parseInt(value);
            } else if (key === "tags") {
              const tagsRaw = value.split(",");
              tagsRaw.forEach((tagStr) => {
                const [tKey, tValue] = tagStr.split(":");
                if (tKey && tValue) {
                  const tagName = `#${tKey}`;
                  if (!params[tagName])
                    params[tagName] = [];
                  params[tagName].push(tValue);
                }
              });
            }
          });
        }
        const filter = {};
        if (params.kinds)
          filter.kinds = params.kinds;
        if (params.authors)
          filter.authors = params.authors;
        if (params.limit)
          filter.limit = params.limit;
        if (params.since)
          filter.since = params.since;
        if (params.until)
          filter.until = params.until;
        Object.keys(params).forEach((k) => {
          if (k.startsWith("#"))
            filter[k] = params[k];
        });
        if (!filter.limit)
          filter.limit = 20;
        const events = await this.eventService.getEvents(filter);
        return { type: "API_RESPONSE", id, status: 200, body: events };
      }
      return { type: "API_RESPONSE", id, status: 404, body: { error: "Route not found" } };
    }
    async routeUsers(method, path, _body, id, _origin) {
      if (method === "GET" && path === "/mirage/v1/user/me") {
        try {
          const user = await this.userService.getCurrentUser();
          return { type: "API_RESPONSE", id, status: 200, body: user };
        } catch (e) {
          if (e.message === "Not authenticated")
            return { type: "API_RESPONSE", id, status: 401, body: { error: "Not authenticated" } };
          throw e;
        }
      }
      const match = this.matchRoute("/mirage/v1/users/:pubkey", path);
      if (match && method === "GET") {
        const user = await this.userService.getUserByPubkey(match.params.pubkey);
        return { type: "API_RESPONSE", id, status: 200, body: user };
      }
      return { type: "API_RESPONSE", id, status: 404, body: { error: "Route not found" } };
    }
    async routeStorage(method, path, body, id, origin) {
      this.storageService.updateContext({ appOrigin: origin });
      const match = this.matchRoute("/mirage/v1/space/me/:key", path);
      if (match) {
        const [_urlPath, queryString] = path.split("?");
        const params = {};
        if (queryString) {
          const searchParams = new URLSearchParams(queryString);
          searchParams.forEach((value, key) => params[key] = value);
        }
        if (method === "GET") {
          const val = await this.storageService.getStorage(match.params.key, params.pubkey);
          if (val === null)
            return { type: "API_RESPONSE", id, status: 404, body: { error: "Key not found" } };
          return {
            type: "API_RESPONSE",
            id,
            status: 200,
            body: {
              key: match.params.key,
              value: val,
              updatedAt: Math.floor(Date.now() / 1000)
            }
          };
        }
        if (method === "PUT") {
          const isPublic = params.public === "true";
          const event = await this.storageService.putStorage(match.params.key, body, isPublic);
          return {
            type: "API_RESPONSE",
            id,
            status: 200,
            body: {
              key: match.params.key,
              value: body,
              updatedAt: event.created_at,
              public: isPublic
            }
          };
        }
        if (method === "DELETE") {
          await this.storageService.deleteStorage(match.params.key);
          return { type: "API_RESPONSE", id, status: 200, body: { deleted: true, key: match.params.key } };
        }
      }
      return { type: "API_RESPONSE", id, status: 404, body: { error: "Route not found" } };
    }
    async routeSpaces(method, path, body, id, origin) {
      this.spaceService.updateContext({ appOrigin: origin });
      if (method === "GET" && path === "/mirage/v1/spaces") {
        const spaces = await this.spaceService.listSpaces();
        return { type: "API_RESPONSE", id, status: 200, body: spaces };
      }
      if (method === "GET" && path === "/mirage/v1/admin/spaces") {
        const spaces = await this.spaceService.listAllSpaces();
        return { type: "API_RESPONSE", id, status: 200, body: spaces };
      }
      if (method === "POST" && path === "/mirage/v1/admin/spaces") {
        const space = await this.spaceService.createSpace(body.name, body.appOrigin);
        return { type: "API_RESPONSE", id, status: 201, body: space };
      }
      let match = this.matchRoute("/mirage/v1/spaces/:id", path);
      if (match) {
        if (method === "DELETE") {
          const deleted = await this.spaceService.deleteSpace(match.params.id);
          return { type: "API_RESPONSE", id, status: 200, body: { deleted } };
        }
      }
      match = this.matchRoute("/mirage/v1/admin/spaces/:id", path);
      if (match) {
        if (method === "PUT") {
          const updated = await this.spaceService.updateSpace(match.params.id, body.name);
          return { type: "API_RESPONSE", id, status: 200, body: updated };
        }
        if (method === "DELETE") {
          const deleted = await this.spaceService.deleteSpace(match.params.id);
          return { type: "API_RESPONSE", id, status: 200, body: { deleted } };
        }
      }
      match = this.matchRoute("/mirage/v1/spaces/:id/messages", path);
      if (match) {
        if (method === "GET") {
          const messages = await this.spaceService.getMessages(match.params.id, body?.limit, body?.since);
          return { type: "API_RESPONSE", id, status: 200, body: messages };
        }
        if (method === "POST") {
          const msg = await this.spaceService.sendMessage(match.params.id, body.content);
          return { type: "API_RESPONSE", id, status: 201, body: msg };
        }
      }
      match = this.matchRoute("/mirage/v1/admin/spaces/:id/invitations", path);
      if (match && method === "POST") {
        const result = await this.spaceService.inviteMember(match.params.id, body.pubkey, body.name);
        return { type: "API_RESPONSE", id, status: 200, body: result };
      }
      match = this.matchRoute("/mirage/v1/spaces/:id/store", path);
      if (match && method === "GET") {
        const store = await this.spaceService.getSpaceStore(match.params.id);
        return { type: "API_RESPONSE", id, status: 200, body: store };
      }
      match = this.matchRoute("/mirage/v1/spaces/:id/store/:key", path);
      if (match && method === "PUT") {
        const result = await this.spaceService.updateSpaceStore(match.params.id, match.params.key, body);
        return { type: "API_RESPONSE", id, status: 200, body: result };
      }
      if (method === "GET" && path === "/mirage/v1/space") {
        return {
          type: "API_RESPONSE",
          id,
          status: 200,
          body: {
            spaceId: this.currentSpace?.id || "",
            spaceName: this.currentSpace?.name || ""
          }
        };
      }
      if (method === "PUT" && path === "/mirage/v1/space") {
        const { spaceId, spaceName } = body;
        this.currentSpace = { id: spaceId, name: spaceName || "" };
        this.updateContext();
        return { type: "API_RESPONSE", id, status: 200, body: { spaceId, spaceName: spaceName || "" } };
      }
      if (method === "GET" && path === "/mirage/v1/space/store") {
        if (!this.currentSpace?.id)
          return { type: "API_RESPONSE", id, status: 400, body: { error: "No space context set" } };
        const store = await this.spaceService.getSpaceStore(this.currentSpace.id);
        return { type: "API_RESPONSE", id, status: 200, body: store };
      }
      match = this.matchRoute("/mirage/v1/space/store/:key", path);
      if (match && method === "PUT") {
        if (!this.currentSpace?.id)
          return { type: "API_RESPONSE", id, status: 400, body: { error: "No space context set" } };
        const result = await this.spaceService.updateSpaceStore(this.currentSpace.id, match.params.key, body);
        return { type: "API_RESPONSE", id, status: 200, body: result };
      }
      if (path === "/mirage/v1/space/messages") {
        if (!this.currentSpace?.id)
          return { type: "API_RESPONSE", id, status: 400, body: { error: "No space context set" } };
        if (method === "GET") {
          const messages = await this.spaceService.getMessages(this.currentSpace.id, body?.limit, body?.since);
          return { type: "API_RESPONSE", id, status: 200, body: messages };
        }
        if (method === "POST") {
          const msg = await this.spaceService.sendMessage(this.currentSpace.id, body.content);
          return { type: "API_RESPONSE", id, status: 201, body: msg };
        }
      }
      if (method === "POST" && path === "/mirage/v1/space/invitations") {
        if (!this.currentSpace?.id)
          return { type: "API_RESPONSE", id, status: 400, body: { error: "No space context set" } };
        const result = await this.spaceService.inviteMember(this.currentSpace.id, body.pubkey, body.name);
        return { type: "API_RESPONSE", id, status: 200, body: result };
      }
      return { type: "API_RESPONSE", id, status: 404, body: { error: "Route not found" } };
    }
    matchRoute(pattern, path) {
      const keys = [];
      const regexStr = pattern.replace(/:([a-zA-Z]+)/g, (_, key) => {
        keys.push(key);
        return "([^/]+)";
      });
      const regex2 = new RegExp(`^${regexStr}$`);
      const match = path.match(regex2);
      if (!match)
        return null;
      const params = {};
      keys.forEach((key, i2) => {
        params[key] = match[i2 + 1];
      });
      return { params };
    }
    updateContext() {
      this.spaceService.updateContext({
        relays: this.relays,
        currentPubkey: this.currentPubkey,
        appOrigin: this.appOrigin,
        currentSpace: this.currentSpace
      });
      this.appService.updateContext({
        relays: this.relays,
        currentPubkey: this.currentPubkey,
        appOrigin: this.appOrigin,
        currentSpace: this.currentSpace
      });
      this.contactService.updateContext({
        relays: this.relays,
        currentPubkey: this.currentPubkey
      });
      this.directMessageService.updateContext({
        relays: this.relays,
        currentPubkey: this.currentPubkey
      });
      this.eventService.updateContext({
        relays: this.relays
      });
      this.storageService.updateContext({
        relays: this.relays,
        currentPubkey: this.currentPubkey,
        appOrigin: this.appOrigin,
        currentSpace: this.currentSpace
      });
      this.userService.updateContext({
        relays: this.relays,
        currentPubkey: this.currentPubkey
      });
    }
    send(message) {
      self.postMessage(message);
    }
  }

  // src/engine/streaming.ts
  var activeSubscriptions = new Map;
  async function handleStreamOpen(message, pool, relays, currentPubkey) {
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
      const sub = pool.subscribe(relays, filter, {
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

  // src/engine/index.ts
  var pool = new SimplePool;
  var activeRelays = [];
  var poolReadyResolve;
  var poolReady = new Promise((resolve) => {
    poolReadyResolve = resolve;
  });
  var currentPubkey = null;
  var appOrigin = SYSTEM_APP_ORIGIN;
  var currentSpace;
  var mirageEngine = new MirageEngine({
    pool,
    relays: activeRelays
  });
  function setCurrentPubkey(pubkey) {
    currentPubkey = pubkey;
  }
  self.onmessage = async (event) => {
    const message = event.data;
    switch (message.type) {
      case "RELAY_CONFIG":
        await mirageEngine.handleMessage(message);
        await handleRelayConfig(message);
        break;
      case "API_REQUEST":
        await handleApiRequest(message);
        break;
      case "ACTION_FETCH_APP":
        await mirageEngine.handleMessage(message);
        break;
      case "ACTION_GET_RELAY_STATUS":
        self.postMessage({
          type: "RELAY_STATUS_RESULT",
          id: message.id,
          stats: activeRelays.map((url) => ({ url, status: "active" }))
        });
        break;
      case "STREAM_OPEN":
        await poolReady;
        await handleStreamOpen(message, pool, activeRelays, currentPubkey);
        break;
      case "SIGNATURE_RESULT":
        handleSignatureResult(message, setCurrentPubkey, currentPubkey);
        break;
      case "SET_PUBKEY":
        console.log("[Engine] SET_PUBKEY received:", message.pubkey.slice(0, 8) + "...");
        await mirageEngine.handleMessage(message);
        setCurrentPubkey(message.pubkey);
        break;
      case "SET_APP_ORIGIN":
        const payload = message;
        appOrigin = payload.origin;
        console.log(`[Engine] App origin set: ${appOrigin?.slice(0, 20)}...`);
        await mirageEngine.handleMessage(message);
        break;
      case "SET_SPACE_CONTEXT":
        const ctxMsg = message;
        currentSpace = { id: ctxMsg.spaceId, name: ctxMsg.spaceName };
        console.log("[Engine] Space context set:", currentSpace);
        await mirageEngine.handleMessage(message);
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
    switch (message.action) {
      case "SET":
        activeRelays = message.relays;
        break;
      case "ADD":
        message.relays.forEach((url) => {
          if (!activeRelays.includes(url))
            activeRelays.push(url);
        });
        break;
      case "REMOVE":
        activeRelays = activeRelays.filter((url) => !message.relays.includes(url));
        break;
    }
    poolReadyResolve();
  }
  async function handleApiRequest(message) {
    const start = performance.now();
    await poolReady;
    if (!pool) {
      console.warn(`[API] ${message.method} ${message.path} → 503 (pool not initialized)`);
      sendResponse(message.id, 503, { error: "Relay pool not initialized" });
      return;
    }
    const { method, path, body } = message;
    const delegationPaths = [
      "/mirage/v1/space",
      "/mirage/v1/admin/spaces",
      "/mirage/v1/admin/apps",
      "/mirage/v1/contacts",
      "/mirage/v1/dms",
      "/mirage/v1/events",
      "/mirage/v1/user",
      "/mirage/v1/users"
    ];
    const isDelegatedPath = delegationPaths.find((val) => path.startsWith(val));
    if (isDelegatedPath) {
      await mirageEngine.handleMessage(message);
      return;
    }
    const route = await resolveRoute(method, path, pool);
    if (!route) {
      console.warn(`[API] ${method} ${path} → 404 (no matching route)`);
      sendResponse(message.id, 404, { error: "Not found" });
      return;
    }
    try {
      const result = await route.handler(body, route.params);
      const duration = performance.now() - start;
      if (result.status >= 400) {
        console.warn(`[API] ${method} ${path} → ${result.status} (${duration.toFixed(0)}ms)`);
      } else {
        console.log(`[API] ${method} ${path} → ${result.status} (${duration.toFixed(0)}ms)`);
      }
      sendResponse(message.id, result.status, result.body);
    } catch (err) {
      const duration = performance.now() - start;
      console.error(`[API] ${method} ${path} → 500 (${duration.toFixed(0)}ms)`, err.message);
      sendResponse(message.id, err.status || 500, { error: err.message });
    }
  }
  async function resolveRoute(method, fullPath, _requestPool) {
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
    const isAdminOrigin = appOrigin === SYSTEM_APP_ORIGIN;
    if (method === "GET" && path === "/mirage/v1/ready") {
      return {
        handler: async () => ({
          status: 200,
          body: {
            ready: true,
            authenticated: !!currentPubkey,
            relayCount: activeRelays.length
          }
        }),
        params: {}
      };
    }
    if (method === "DELETE" && path === "/mirage/v1/admin/state") {
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
          const events = await pool.querySync(activeRelays, {
            kinds: [30078],
            authors: [currentPubkey],
            limit: 200
          });
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
                await Promise.all(pool.publish(activeRelays, signed));
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
})();
