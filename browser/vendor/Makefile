ALL := \
	sha_js_sha256.js \

all: $(ALL)

sha_js_sha256.js: ../../node_modules/sha.js/sha256.js
	../../node_modules/.bin/rollup --name sha_js_sha256 \
	-p 'node-resolve={browser:true,preferBuiltins:false}' \
	-p 'commonjs' \
	--format iife $< -o $@
	@ls -l $@
