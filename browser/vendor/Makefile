ALL := \
	js_sha256.js \
	jssha_dist_sha256.js \
	sha_js_sha256.js \

####

all: $(ALL)

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
