# "buffer" module is required as a devDependency to build sha.js.
.DELETE_ON_ERROR:

ALL := \
	lib/@aws-crypto/sha256-js/build/main/index.js \
	lib/@noble/hashes/sha2.js \
	lib/@noble/hashes/utils.js \
	lib/crypto-js/index.js \
	lib/fast-sha256/sha256.js \
	lib/hash.js/lib/hash/sha/256.js \
	lib/js-sha256/build/sha256.js \
	lib/jssha/dist/sha256.js \
	lib/node-forge/lib/sha256.js \
	lib/sha.js/sha256.js \

MINJS_DST := ../../dist/sha256-uint8array.min.js

####

# Derive rollup's --name from the target path: drop "@", turn "/", "-" and "."
# into "_". $* only has a value while a recipe runs, so this must be = not :=.
NAME = $(subst /,_,$(subst -,_,$(subst .,_,$(subst @,,$*))))

all: $(ALL)

lib/%.js: ../../node_modules/%.js
	@mkdir -p $(dir $@)
	../../node_modules/.bin/rollup --name $(NAME) \
	-p 'node-resolve={browser:true,preferBuiltins:false}' \
	-p 'commonjs' \
	--failAfterWarnings --format iife $< -o $@

lib/%.minified.js: lib/%.js
	../../node_modules/.bin/terser $< -o $@ -c -m
	@ls -l $< $@

# The figures the README compatibility table quotes, in KB.
sizes: $(ALL:.js=.minified.js)
	$(MAKE) -C ../../builder smoke-minjs
	@for f in $(MINJS_DST) $^; do \
		printf '  %3dKB  %s\n' "$$(( ($$(wc -c < $$f) + 512) / 1024 ))" "$$f"; \
	done

####

clean:
	/bin/rm -fr lib

.PHONY: all clean sizes
