/**
 * 枕草紙 (國文大觀)
 * 作者：清少納言
 * https://ja.wikisource.org/wiki/%E6%9E%95%E8%8D%89%E7%B4%99_(%E5%9C%8B%E6%96%87%E5%A4%A7%E8%A7%80)
 */

export const MAKURANOSOSHI = `
春は曙、やうやう白くなりゆく山ぎはすこしあかりて紫だちたる雲の細くたなびきたる。
夏はよる、月のころはさらなり、闇もなほ螢飛びちがひたる、雨などの降るさへをかし。
秋は夕暮、夕日はなやかにさして、山ぎはいと近くなりたるに、鳥のねどころへゆくとて三つ四つ二つなど飛びゆくさへあはれなり。
まいて雁などのつらねたるがいとちひさく見ゆるいとをかし。
日入りはてゝ風のおと蟲のねなどいとあはれなり。
冬は雪の降りたるはいふべきにもあらず。
霜などのいと白く、又さらでもいと寒き、火などいそぎおこして炭もてわたるもいとつきづきし。
ひるになりてぬるくゆるびもてゆけば、すびつ火桶の火も白き灰がちになりぬるはわろし。
`; // 894 bytes

/**
 * A package.json-shaped ASCII blob of roughly one kilobyte, used as the
 * benchmark input. Held as a literal rather than read from the real
 * package.json so the measured input stays identical across releases.
 */

export const SAMPLE_JSON = "{\"name\":\"sha256-uint8array\",\"description\":\"Fast SHA-256 digest hash based on Uint8Array, pure JavaScript.\",\"version\":\"0.11.0\",\"author\":\"Yusuke Kawasaki <u-suke@kawa.net>\",\"bugs\":{\"url\":\"https://github.com/kawanet/sha256-uint8array/issues\"},\"contributors\":[\"Yusuke Kawasaki <u-suke@kawa.net>\"],\"devDependencies\":{\"@aws-crypto/sha256-js\":\"^3.0.0\",\"@rollup/plugin-node-resolve\":\"^16.0.3\",\"@rollup/plugin-sucrase\":\"^5.1.0\",\"@rollup/plugin-terser\":\"^1.0.0\",\"@types/node\":\"^24.13.3\",\"browserify\":\"^17.0.1\",\"browserify-sed\":\"^0.8.0\",\"create-hash\":\"^1.2.0\",\"crypto-js\":\"^4.1.1\",\"hash.js\":\"^1.1.7\",\"jshashes\":\"^1.0.8\",\"jssha\":\"^3.3.1\",\"mocha\":\"^11.8.0\",\"rollup\":\"^4.62.4\",\"sha.js\":\"^2.4.11\",\"terser\":\"^5.50.0\",\"ts-refine\":\"^0.6.1\",\"typescript\":\"^6.0.3\"},\"devEngines\":{\"runtime\":{\"name\":\"node\",\"version\":\">=22\",\"onFail\":\"warn\"}},\"engines\":{\"node\":\">=20\"},\"exports\":{\".\":{\"types\":\"./types/sha256-uint8array.d.ts\",\"require\":\"./dist/sha256-uint8array.cjs\",\"import\":\"./dist/sha256-uint8array.mjs\"}},\"files\":[\"LICENSE\",\"README.md\",\"browser/import.js\",\"browser/package.json\",\"dist/package.json\",\"dist/sha256-uint8array.cjs\",\"dist/sha256-uint8array.min.js\",\"dist/sha256-uint8array.mjs\",\"lib/*.ts\",\"types/*.d.ts\"],\"homepage\":\"https://github.com/kawanet/sha256-uint8array#readme\",\"keywords\":[\"SHA-256\",\"SHA256\",\"crypto\",\"digest\",\"hash\"],\"license\":\"MIT\",\"main\":\"./dist/sha256-uint8array.cjs\",\"repository\":{\"type\":\"git\",\"url\":\"git+https://github.com/kawanet/sha256-uint8array.git\"},\"scripts\":{\"build\":\"make -C builder\",\"fixpack\":\"fixpack\",\"prepack\":\"make -C builder is-buildable\",\"prepare\":\"make -C builder is-not-buildable 2> /dev/null || make -C builder clean all test\",\"test\":\"make -C builder test\",\"test-browser\":\"make browser-test && open browser/tests.html\",\"ts-refine\":\"./node_modules/.bin/ts-refine format && ./node_modules/.bin/ts-refine imports\"},\"sideEffects\":false,\"type\":\"module\",\"types\":\"./types/sha256-uint8array.d.ts\"}"
