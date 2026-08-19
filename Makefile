# Size comparison quoted in the README. Each library is measured the way a
# browser build would ship it, so the ones published only as CommonJS go
# through browserify first. Everything else the package builds lives in
# builder/.
#
# @noble/hashes is absent: it ships ES modules only and browserify cannot
# parse them, so measuring it needs a different tool than this target uses.

sizes:
	wc -c dist/sha256-uint8array.min.js
	cat node_modules/crypto-js/*.js | node_modules/.bin/terser -c -m | wc -c
	wc -c node_modules/jssha/dist/sha256.js
	node_modules/.bin/browserify node_modules/hash.js/lib/hash.js | node_modules/.bin/terser -c -m | wc -c
	node_modules/.bin/browserify node_modules/sha.js/sha256.js | node_modules/.bin/terser -c -m | wc -c
	node_modules/.bin/browserify node_modules/create-hash/browser.js | node_modules/.bin/terser -c -m | wc -c
	node_modules/.bin/browserify node_modules/@aws-crypto/sha256-js/build/index.js | node_modules/.bin/terser -c -m | wc -c
	node_modules/.bin/browserify node_modules/node-forge/lib/sha256.js | node_modules/.bin/terser -c -m | wc -c
	wc -c node_modules/fast-sha256/sha256.min.js
	wc -c node_modules/js-sha256/build/sha256.min.js

.PHONY: sizes
