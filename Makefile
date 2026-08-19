# Size comparison quoted in the README. Each library is measured the way a
# browser build would ship it, so the ones published only as CommonJS go
# through browserify first. Everything else the package builds lives in
# builder/.

sizes:
	wc -c dist/sha256-uint8array.min.js
	cat node_modules/crypto-js/*.js | node_modules/.bin/terser -c -m | wc -c
	wc -c node_modules/jssha/dist/sha256.js
	node_modules/.bin/browserify node_modules/hash.js/lib/hash.js | node_modules/.bin/terser -c -m | wc -c
	node_modules/.bin/browserify node_modules/sha.js/sha256.js | node_modules/.bin/terser -c -m | wc -c
	wc -c node_modules/jshashes/hashes.min.js
	node_modules/.bin/browserify node_modules/create-hash/browser.js | node_modules/.bin/terser -c -m | wc -c
	node_modules/.bin/browserify node_modules/@aws-crypto/sha256-js/build/index.js | node_modules/.bin/terser -c -m | wc -c

.PHONY: sizes
