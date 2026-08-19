ALL := \
	aws_crypto_sha256.js \
	js_sha256.js \
	jssha_dist_sha256.js \
	noble_hashes_sha2.js \
	sha_js_sha256.js \

####

all: $(ALL)

aws_crypto_sha256.js: ../../node_modules/@aws-crypto/sha256-js/build/index.js
	../../node_modules/.bin/rollup --name aws_crypto_sha256 \
	-p 'node-resolve={browser:true,preferBuiltins:false}' \
	-p 'commonjs' \
	--format iife $< -o $@
	@ls -l $@

js_sha256.js: ../../node_modules/js-sha256/build/sha256.js
	../../node_modules/.bin/rollup --name js_sha256 \
	-p 'node-resolve={browser:true,preferBuiltins:false}' \
	-p 'commonjs' \
	--format iife $< -o $@
	@ls -l $@

jssha_dist_sha256.js: ../../node_modules/jssha/dist/sha256.js
	../../node_modules/.bin/rollup --name jssha_dist_sha256 \
	-p 'node-resolve={browser:true,preferBuiltins:false}' \
	-p 'commonjs' \
	--format iife $< -o $@
	@ls -l $@

noble_hashes_sha2.js: ../../node_modules/@noble/hashes/sha2.js
	../../node_modules/.bin/rollup --name noble_hashes_sha2 \
	-p 'node-resolve={browser:true,preferBuiltins:false}' \
	-p 'commonjs' \
	--format iife $< -o $@
	@ls -l $@

sha_js_sha256.js: ../../node_modules/sha.js/sha256.js
	../../node_modules/.bin/rollup --name sha_js_sha256 \
	-p 'node-resolve={browser:true,preferBuiltins:false}' \
	-p 'commonjs' \
	--format iife $< -o $@
	@ls -l $@

####

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean
