# sha256-uint8array

[![Node.js CI](https://github.com/kawanet/sha256-uint8array/workflows/Node.js%20CI/badge.svg?branch=main)](https://github.com/kawanet/sha256-uint8array/actions/)
[![npm version](https://img.shields.io/npm/v/sha256-uint8array)](https://www.npmjs.com/package/sha256-uint8array)
[![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/sha256-uint8array/dist/sha256-uint8array.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/sha256-uint8array/dist/sha256-uint8array.min.js)

Fast SHA-256 digest hash based on Uint8Array, pure JavaScript.

## SYNOPSIS

```js
import {createHash} from "sha256-uint8array";

const text = "";
const hex = createHash().update(text).digest("hex");
// => "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

const data = new Uint8Array(0);
const hash = createHash().update(data).digest();
// => <Uint8Array e3 b0 c4 42 98 fc 1c 14 9a fb f4 c8 99 6f b9 24 27 ae 41 e4 64 9b 93 4c a4 95 99 1b 78 52 b8 55>
```

See TypeScript declaration
[sha256-uint8array.d.ts](https://github.com/kawanet/sha256-uint8array/blob/main/types/sha256-uint8array.d.ts)
for detail.

## CJS

Both ES Modules and CommonJS supported.

```js
const {createHash} = require("sha256-uint8array");
```

## COMPATIBILITY

It has a better compatibility with Node.js's `crypto` module in its smaller footprint.

|module|string IN|Uint8Array IN|TypedArray IN|hex OUT|Uint8Array OUT|minified|
|---|---|---|---|---|---|---|
|[crypto](https://nodejs.org/api/crypto.html)|✅ OK|✅ OK|✅ OK|✅ OK|✅ OK|-|
|[sha256-uint8array](http://github.com/kawanet/sha256-uint8array)|✅ OK|✅ OK|✅ OK|✅ OK|✅ OK|4KB|
|[crypto-js](https://npmjs.com/package/crypto-js)|✅ OK|🚫 NO|🚫 NO|✅ OK|🚫 NO|66KB|
|[jssha](https://npmjs.com/package/jssha)|✅ OK|✅ OK|🚫 NO|✅ OK|✅ OK|10KB|
|[hash.js](https://www.npmjs.com/package/hash.js)|✅ OK|✅ OK|🚫 NO|✅ OK|✅ OK|7KB|
|[sha.js](https://npmjs.com/package/sha.js)|✅ OK|✅ OK|🚫 NO|✅ OK|✅ OK|52KB|
|[@noble/hashes](https://www.npmjs.com/package/@noble/hashes)|🚫 NO|✅ OK|🚫 NO|✅ OK|✅ OK|11KB|
|[node-forge](https://www.npmjs.com/package/node-forge)|✅ OK|🚫 NO|🚫 NO|✅ OK|🚫 NO|27KB|
|[fast-sha256](https://www.npmjs.com/package/fast-sha256)|🚫 NO|✅ OK|🚫 NO|🚫 NO|✅ OK|6KB|
|[js-sha256](https://www.npmjs.com/package/js-sha256)|✅ OK|✅ OK|🚫 NO|✅ OK|✅ OK|8KB|
|[@aws-crypto/sha256-js](https://www.npmjs.com/package/@aws-crypto/sha256-js)|✅ OK|✅ OK|🚫 NO|🚫 NO|✅ OK|16KB|
|[crypto.subtle.digest()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)|🚫 NO|✅ OK|✅ OK|🚫 NO|🚫 NO|-|

The minified sizes are measured by `make -C browser/vendor`, which bundles
each library for browsers and runs it through terser.

The W3C standard `crypto.subtle.digest()` API has a different interface which
[returns](https://github.com/microsoft/TypeScript/blob/master/lib/lib.dom.d.ts)
`Promise<ArrayBuffer>`.

## SPEED

It runs well both on Node.js and browsers.
Node.js's native `crypto` module definitely runs faster than any others on Node.js, though.

|module|version|Node.js v24 string|Node.js v24 U8A|Safari 26 string|Safari 26 U8A|
|---|---|---|---|---|---|
|[crypto](https://nodejs.org/api/crypto.html)|-|28ms 🥇|21ms 🥇|▫️|▫️|
|[sha256-uint8array](http://github.com/kawanet/sha256-uint8array)|0.11.0|111ms 🥈|88ms 🥈|132ms 🥇|121ms 🥇|
|[crypto-js](https://npmjs.com/package/crypto-js)|4.2.0|508ms|▫️|429ms|▫️|
|[jssha](https://npmjs.com/package/jssha)|3.3.2|615ms|350ms|409ms|298ms|
|[hash.js](https://www.npmjs.com/package/hash.js)|1.1.7|640ms|633ms|461ms|415ms|
|[sha.js](https://npmjs.com/package/sha.js)|2.4.12|352ms|347ms|418ms|192ms|
|[@noble/hashes](https://www.npmjs.com/package/@noble/hashes)|2.3.0|▫️|118ms|▫️|160ms|
|[node-forge](https://www.npmjs.com/package/node-forge)|1.4.0|533ms|▫️|418ms|▫️|
|[fast-sha256](https://www.npmjs.com/package/fast-sha256)|1.3.0|▫️|123ms|▫️|147ms 🥈|
|[js-sha256](https://www.npmjs.com/package/js-sha256)|1.0.0|⁎₁|⁎₁|205ms|215ms|
|[@aws-crypto/sha256-js](https://www.npmjs.com/package/@aws-crypto/sha256-js)|5.2.0|247ms|236ms|170ms 🥈|162ms|
|[crypto.subtle.digest()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)|-|▫️|1473ms|▫️|455ms|

The benchmark above shows the median of ten sets, normalized to milliseconds
per 20,000 SHA-256 `hex` digests. Each cell uses a fixed operation count
calibrated towards 500ms. Each repeat hashes two samples, a 2KB JSON string
and a 1KB UTF-8 text; every measurement is preceded by one untimed repeat
to absorb first-load effects. `▫️` marks an unsupported input shape, and `⁎₁`
a cell excluded because it delegates to native crypto instead of JavaScript.
It is tested on Apple M4, Node.js v24.19.0 and Safari 26.5.2.

You could run the benchmark as below.

```sh
git clone https://github.com/kawanet/sha256-uint8array.git
cd sha256-uint8array
npm install
npm run build

# run the benchmark on Node.js
npm run bench

# options via environment variables
DURATION=500 SETS=10 TARGET=sha256-uint8array,crypto-js npm run bench

# run the benchmark on a browser, options via the query string
open browser/bench.html   # ?DURATION=500&SETS=10&TARGET=sha256-uint8array
```

The runner calibrates each cell towards `DURATION` milliseconds. It prints
one JSON line per cell — ops per set, its median duration in milliseconds,
the measured sets in microseconds per op, their median and median absolute
deviation — followed by a Markdown table normalized to milliseconds per
20,000 ops.

## WEB BROWSERS

- The minified build of the library is also available for Web browsers via
[jsDelivr CDN](https://www.jsdelivr.com/package/npm/sha256-uint8array).
- https://cdn.jsdelivr.net/npm/sha256-uint8array/dist/sha256-uint8array.min.js
- Live Demo https://kawanet.github.io/sha256-uint8array/

```html
<script src="https://cdn.jsdelivr.net/npm/sha256-uint8array/dist/sha256-uint8array.min.js"></script>
<script>
  const text = "";
  const hex = SHA256.createHash().update(text).digest("hex");
  // => "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

  const data = new Uint8Array(0);
  const hash = SHA256.createHash().update(data).digest();
  // => <Uint8Array e3 b0 c4 42 98 fc 1c 14 9a fb f4 c8 99 6f b9 24 27 ae 41 e4 64 9b 93 4c a4 95 99 1b 78 52 b8 55>
</script>
```

## BROWSERIFY

It works great with
[browserify](https://www.npmjs.com/package/browserify)
via `browser` property of `package.json` of your app if you needs
`crypto.createHash("sha256").update(data).digest("hex");` syntax only.

```json
{
  "browser": {
    "crypto": "sha256-uint8array/dist/sha256-uint8array.min.js"
  },
  "devDependencies": {
    "browserify": "^17.0.0",
    "sha256-uint8array": "^0.10.0"
  }
}
```

It costs only about 4KB, whereas `browserify`'s default `crypto` polyfill
costs more than 300KB huge even after minified.

```js
// On Node.js, this loads Node.js's native crypto module which is faster.
// On browsers, this uses sha256-uint8array.min.js which is small and fast.
const crypto = require("crypto");

const hash = crypto.createHash("sha256").update("").digest("hex");
// => "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
```

## LINKS

- https://www.npmjs.com/package/sha1-uint8array
- https://www.npmjs.com/package/sha256-uint8array
- https://github.com/kawanet/sha256-uint8array
- https://github.com/kawanet/sha256-uint8array/blob/main/types/sha256-uint8array.d.ts

## MIT LICENSE

Copyright (c) 2020-2026 Yusuke Kawasaki

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
