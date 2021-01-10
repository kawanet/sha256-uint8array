# sha256-uint8array

[![Node.js CI](https://github.com/kawanet/sha256-uint8array/workflows/Node.js%20CI/badge.svg?branch=main)](https://github.com/kawanet/sha256-uint8array/actions/)
[![npm version](https://badge.fury.io/js/sha256-uint8array.svg)](https://www.npmjs.com/package/sha256-uint8array)

Fast SHA-256 digest hash based on Uint8Array, pure JavaScript.

## SYNOPSIS

```js
const createHash = require("sha256-uint8array").createHash;

const text = "";
const hex = createHash("sha256").update(text).digest("hex");
// => "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

const data = new Uint8Array(0);
const hash = createHash("sha256").update(data).digest();
// => <Uint8Array e3 b0 c4 42 98 fc 1c 14 9a fb f4 c8 99 6f b9 24 27 ae 41 e4 64 9b 93 4c a4 95 99 1b 78 52 b8 55>
```

The interface is a subset of Node.js's [crypto](https://nodejs.org/api/crypto.html) module.
See TypeScript declaration
[sha256-uint8array.d.ts](https://github.com/kawanet/sha256-uint8array/blob/main/types/sha256-uint8array.d.ts)
for detail.

## BENCHMARK

Node.js's native `crypto` module run faster than others on Node.js.
`sha256-uint8array` runs well both on Node.js and browsers with its smaller footprint.

|module|version|node.js V14|Chrome 87|Safari 14|minified|backend|note|
|---|---|---|---|---|---|---|---|
|[crypto](https://nodejs.org/api/crypto.html)|-|124ms 👍|-|-|-|OpenSSL|👍 on node.js|
|[sha256-uint8array](http://github.com/kawanet/sha256-uint8array)|0.8.0|289ms|498ms 👍|260ms 👍|3KB 👍|Uint8Array|👍 on browsers|
|[jssha](https://npmjs.com/package/jssha)|3.2.0|654ms|743ms|812ms|10KB|Uint8Array|jssha/dist/sha256.js|
|[jshashes](https://npmjs.com/package/jshashes)|1.0.8|1,289ms|1,899ms|987ms|23KB|Array|jshashes/hashes.js|
|[sha.js](https://npmjs.com/package/sha.js)|2.4.11|330ms|760ms|3,344ms|27KB|Buffer|sha.js/sha256.js|
|[create-hash](https://npmjs.com/package/create-hash)|1.2.0|409ms|811ms|3,384ms|97KB|Buffer|create-hash/browser.js|
|[crypto-js](https://npmjs.com/package/crypto-js)|4.0.0|827ms|914ms|3,401ms|6KB|Buffer|crypto-js/sha256.js|

The benchmark result above is tested on macOS 10.15.7 Intel Core i7 3.2GHz. You could run the benchmark as below.

```sh
git clone https://github.com/kawanet/sha256-uint8array.git
npm install
npm run build

# run the benchmark on Node.js
REPEAT=100 ./node_modules/.bin/mocha test/99.benchmark.js

# run tests and the benchmark on browser
make -C browser test
```

## BROWSER

- Live Demo https://kawanet.github.io/sha256-uint8array/
- Minified https://cdn.jsdelivr.net/npm/sha256-uint8array/dist/sha256-uint8array.min.js

```html
<script src="https://cdn.jsdelivr.net/npm/sha256-uint8array/dist/sha256-uint8array.min.js"></script>
<script>
  const text = "";
  const hex = SHA256.createHash("sha256").update(text).digest("hex");
  // => "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

  const data = new Uint8Array(0);
  const hash = SHA256.createHash("sha256").update(data).digest();
  // => <Uint8Array e3 b0 c4 42 98 fc 1c 14 9a fb f4 c8 99 6f b9 24 27 ae 41 e4 64 9b 93 4c a4 95 99 1b 78 52 b8 55>
</script>
```

## LINKS

- https://github.com/kawanet/sha256-uint8array
- https://www.npmjs.com/package/sha256-uint8array

## MIT LICENSE

Copyright (c) 2020-2021 Yusuke Kawasaki

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
