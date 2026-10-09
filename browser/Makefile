# Force bash so `set -o pipefail` works in the recipes below.
SHELL := bash
.SHELLFLAGS := -eo pipefail -c

MINJS_DST := ../dist/sha256-uint8array.min.js
BROWSER_TEST_DST := ../browser/tests/bundled.mjs

# The bundle rule, its size check, and its dependencies belong to the
# repository-wide builder Makefile. This entry point is for browser CI.
all: bundled

bundled:
	$(MAKE) -C ../builder $(MINJS_DST) $(BROWSER_TEST_DST)

install:
	cd .. && node ./node_modules/.bin/playwright install chromium --only-shell --with-deps

test: all install
	cd .. && node ./node_modules/.bin/chromium-js \
	--script dist/sha256-uint8array.min.js \
	--import-map browser/import-map.json \
	browser/tests/bundled.mjs

# Browser bundle cleanup remains owned by builder/Makefile.
clean:
	@: # NOP

.PHONY: all bundled install test clean
