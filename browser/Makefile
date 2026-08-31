# Force bash so `set -o pipefail` works in the recipes below.
SHELL := bash
.SHELLFLAGS := -eo pipefail -c

PLAYWRIGHT_VERSION := 1.62.1

# The bundle rule, its size check, and its dependencies belong to the
# repository-wide builder Makefile. This entry point is for browser CI.
all: bundled

bundled:
	$(MAKE) -C ../builder ../browser/tests/bundled.js

# Keep Playwright out of package.json. CI installs it transiently alongside
# the project's build dependencies, then downloads only the headless shell.
install:
	cd .. && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install playwright@$(PLAYWRIGHT_VERSION) --no-save --ignore-scripts --no-audit --no-fund
	cd .. && npx --no-install playwright install --with-deps --only-shell chromium

test: all
	cd .. && node browser/tests.cli.mjs

# Browser bundle cleanup remains owned by builder/Makefile.
clean:
	@: # NOP

.PHONY: all bundled install test clean
