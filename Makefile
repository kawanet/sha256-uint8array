# Auxiliary targets that sit outside the package build in builder/.
#
# Both still go through browserify. The size comparison bundles competing
# implementations the way a browser consumer would get them, and the
# browser test page needs the Node builtins those libraries reach for —
# neither is something the rollup pipeline in builder/ is set up to do.

BROWSER_TEST := browser/tests/bundled.js
CJS_TEST_SRC := build/cjs/test

SED_TEST   := 's|require\("node:test"\)|require("../../../browser/node-test.shim.js")|g'
SED_ASSERT := 's|require\("node:assert"\)|require("../../../browser/node-assert.shim.js")|g'
SED_CRYPTO := 's|require\("node:crypto"\)|require("crypto")|g'

all: browser-test

# Bundle for browser/tests.html. The suites are written against node:test
# and the package's public entrypoint, so browserify is pointed at local
# stand-ins for both: mocha-backed shims for the test globals, and
# browser/import.js for the global the minified build leaves behind.
browser-test: $(BROWSER_TEST)

$(BROWSER_TEST): $(wildcard test/*.ts) $(wildcard test/utils/*.ts) $(wildcard browser/*.js)
	$(MAKE) -C builder
	node_modules/.bin/tsc -p tsconfig-browser.json
	@mkdir -p $(dir $@)
	node_modules/.bin/browserify -o $@ \
		-r ./browser/import.js:sha256-uint8array \
		-t [ browserify-sed $(SED_TEST) ] \
		-t [ browserify-sed $(SED_ASSERT) ] \
		-t [ browserify-sed $(SED_CRYPTO) ] \
		$(CJS_TEST_SRC)/*.test.js
	@ls -l $@

# Minified size of this package next to the alternatives, as quoted in the
# README. Each library is measured the way a browser build would ship it,
# so the ones published only as CommonJS go through browserify first.
sizes:
	wc -c dist/sha256-uint8array.min.js
	cat node_modules/crypto-js/*.js | node_modules/.bin/terser -c -m | wc -c
	wc -c node_modules/jssha/dist/sha256.js
	node_modules/.bin/browserify node_modules/hash.js/lib/hash.js | node_modules/.bin/terser -c -m | wc -c
	node_modules/.bin/browserify node_modules/sha.js/sha256.js | node_modules/.bin/terser -c -m | wc -c
	wc -c node_modules/jshashes/hashes.min.js
	node_modules/.bin/browserify node_modules/create-hash/browser.js | node_modules/.bin/terser -c -m | wc -c
	node_modules/.bin/browserify node_modules/@aws-crypto/sha256-js/build/index.js | node_modules/.bin/terser -c -m | wc -c

clean:
	/bin/rm -fr build/ $(BROWSER_TEST)

.PHONY: all browser-test sizes clean
