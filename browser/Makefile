# Force bash so `set -o pipefail` works in the recipes below.
SHELL := bash
.SHELLFLAGS := -eo pipefail -c

MINJS_DST := ../dist/sha256-uint8array.min.js
BROWSER_TEST_DST := ../browser/tests/bundled.mjs

# CI sets CDP_PORT to attach to a running Chrome over CDP instead of installing one.
PLAYWRIGHT_CONFIG := tests/playwright-config-$(or $(CDP_PORT),default).json

ALL := $(PLAYWRIGHT_CONFIG)

# The bundle rule, its size check, and its dependencies belong to the
# repository-wide builder Makefile. This entry point is for browser CI.
all: bundled $(ALL)

bundled:
	$(MAKE) -C ../builder $(MINJS_DST) $(BROWSER_TEST_DST)

install:
	if [ -z "$(CDP_PORT)" ]; then \
		cd .. && node ./node_modules/.bin/playwright install chromium --only-shell --with-deps; \
	fi

test: all install
	cd .. && node ./node_modules/.bin/chromium-js \
	--playwright-config browser/$(PLAYWRIGHT_CONFIG) \
	--script dist/sha256-uint8array.min.js \
	--import-map browser/import-map.json \
	browser/tests/bundled.mjs

$(PLAYWRIGHT_CONFIG): Makefile
	mkdir -p $(dir $@)
	if [ -n "$(CDP_PORT)" ]; then \
		echo '{"connectOverCDP": "http://127.0.0.1:$(CDP_PORT)"}' > $@; \
	else \
		echo '{}' > $@; \
	fi

# Browser bundle cleanup remains owned by builder/Makefile.
clean:
	/bin/rm -fr $(ALL)

.PHONY: all bundled install test clean
