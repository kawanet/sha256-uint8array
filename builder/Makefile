# Force bash so `set -o pipefail` works in the smoke-minjs recipe below.
SHELL := bash
.SHELLFLAGS := -eo pipefail -c

SRC   := $(wildcard ../lib/*.ts)
TYPES := $(wildcard ../types/*.d.ts)
BUILDER_SRC := $(wildcard ./*.ts)
TEST_SRC := $(wildcard ../test/*.ts) $(wildcard ../test/utils/*.ts)
BROWSER_SRC := $(wildcard ../browser/*.js)

MJS_DST   := ../dist/sha256-uint8array.mjs
CJS_DST   := ../dist/sha256-uint8array.cjs
MINJS_DST := ../dist/sha256-uint8array.min.js
PKG_DST   := ../dist/package.json
TEST_DST  := ../browser/tests/bundled.js
TESTS_DST := ../builder/tests/bundled.js

MJS_CONFIG   := ./rollup-mjs.config.ts
CJS_CONFIG   := ./rollup-cjs.config.ts
MINJS_CONFIG := ./rollup-minjs.config.ts
TEST_CONFIG  := ./rollup-test.config.ts
TESTS_CONFIG := ./rollup-tests.config.ts

# Documented named export that must be verified in every bundle.
NAMED_EXPORTS := createHash

# Each artifact gets its own cap because they are built from different
# targets. The package has no runtime dependencies and uses no Node
# builtins, so all three hold this repository's code alone — a sudden
# jump means something was dragged in that does not belong.
MJS_MAX_BYTES   := 16000
CJS_MAX_BYTES   := 16000

# The browser bundle is minified, so its cap is much tighter than the
# unminified pair above and doubles as a regression guard on the size
# the README advertises.
MINJS_MAX_BYTES := 6000

# The browser test bundle carries the suites and the shims; every compared
# implementation now loads separately from browser/vendor. The cap only
# guards against a step change, such as a dependency slipping back in.
TEST_MAX_BYTES := 60000

ALL := $(MJS_DST) $(CJS_DST) $(MINJS_DST) $(PKG_DST) $(TEST_DST) $(TESTS_DST)

# Build/test paths require Node's native TypeScript type-strip (default on
# Node 22.18+). Older runtimes (e.g. Node 20) report BUILDABLE=NO and can
# still verify pre-built bundles via `make smoke`.
BUILDABLE := $(shell node -e 'console.log(process.features.typescript ? "YES" : "NO")')

####

# Build all artifacts.
all: is-buildable $(ALL)

# Gate consumed by `all` and `npm prepack`: fail loudly unless type-strip
# is available and this is not a NODE_ENV=production install.
is-buildable:
	@ [ "$(BUILDABLE)" = "YES" ] && [ "$(NODE_ENV)" != "production" ]

# Inverse gate used by `npm prepare`: skip build/test without type-strip
# or under NODE_ENV=production; build manually in those environments.
is-not-buildable:
	@ [ "$(BUILDABLE)" != "YES" ] || [ "$(NODE_ENV)" = "production" ]

$(MJS_DST): $(MJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(MJS_MAX_BYTES) || { echo "ERROR: $@ exceeds $(MJS_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

$(CJS_DST): $(CJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(CJS_MAX_BYTES) || { echo "ERROR: $@ exceeds $(CJS_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

$(MINJS_DST): $(MINJS_CONFIG) $(SRC) $(BUILDER_SRC) $(PKG_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(MINJS_MAX_BYTES) || { echo "ERROR: $@ exceeds $(MINJS_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

# The package is "type": "module", so this marks dist/*.min.js as CommonJS
# for Node. The .cjs/.mjs siblings carry that in their extension already.
$(PKG_DST):
	@mkdir -p $(dir $@)
	echo '{"type":"commonjs"}' > $@
	@ls -l $@
	@echo ""

# Bundle loaded by browser/tests.html. The suites run unmodified: the
# rollup config swaps the Node-only pieces for local stand-ins, and the
# package resolves to the global that dist/*.min.js leaves behind.
$(TEST_DST): $(TEST_CONFIG) $(SRC) $(BUILDER_SRC) $(TEST_SRC) $(BROWSER_SRC) $(MINJS_DST)
	@mkdir -p $(dir $@)
	$(MAKE) -C ../browser/vendor
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(TEST_MAX_BYTES) || { echo "ERROR: $@ exceeds $(TEST_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

# Plain-JS bundle of the test suites, importing the package by name.
# Runs against dist/ on any supported Node runtime without type-strip.
$(TESTS_DST): $(TESTS_CONFIG) $(SRC) $(BUILDER_SRC) $(TEST_SRC) $(MJS_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(TEST_MAX_BYTES) || { echo "ERROR: $@ exceeds $(TEST_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

####

# Verify the bundles by importing/requiring the package itself.
# This ensures the public entrypoints (exports/main) are correctly configured.
# Note: process.argv.slice(1) is used because `node -e 'code' arg1 arg2`
# results in process.argv = ['node', 'arg1', 'arg2'].
smoke: smoke-mjs smoke-cjs smoke-minjs

# MJS smoke test via public entrypoint.
smoke-mjs: $(MJS_DST)
	cd .. && node --input-type=module -e 'const m = await import("sha256-uint8array"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing MJS export:", k); process.exit(1); } console.log("MJS export OK:", k); }' $(NAMED_EXPORTS)

# CJS smoke test via public entrypoint.
smoke-cjs: $(CJS_DST)
	cd .. && node --input-type=commonjs -e 'const m = require("sha256-uint8array"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing CJS export:", k); process.exit(1); } console.log("CJS export OK:", k); }' $(NAMED_EXPORTS)

# Smoke the .min.js in two consumer shapes:
#  (1) browser <script>: the bundle leaves a namespace global behind, so
#      look the exports up as properties of that global.
#  (2) CJS require(): the same file is published to a CDN and pulled in
#      by bundlers, so it stays usable as a CommonJS module.
smoke-minjs: $(MINJS_DST) $(PKG_DST)
	(cat $< && echo '; for (const k of process.argv.slice(2)) { if (typeof SHA256[k] !== "function") { console.error("missing browser export:", k); process.exit(1); } console.log("browser export OK:", k); }') | node - $(NAMED_EXPORTS)
	cd .. && node --input-type=commonjs -e 'const m = require("./dist/sha256-uint8array.min.js"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing minjs CJS export:", k); process.exit(1); } console.log("minjs CJS export OK:", k); }' $(NAMED_EXPORTS)

####

# Consumer `npm install` and `npm ci` skip the heavy test-full step.
# CI re-runs `npm test` explicitly so the validation appears in logs.
test:
	@case "$$npm_command" in \
		install|ci) echo "npm $$npm_command detected: skipping full tests." ;; \
		*) $(MAKE) test-full ;; \
	esac

# The benchmark reads REPEAT and defaults it high enough to produce stable
# numbers, which is far more work than a correctness run needs. Pin it low
# here so `npm test` stays quick; `REPEAT=10000 npm test` still measures.
test-full: all
	cd .. && node_modules/.bin/tsc --noEmit
	cd .. && node_modules/.bin/ts-refine format --check && node_modules/.bin/ts-refine imports --check
	cd .. && REPEAT=$${REPEAT:-1} node --test test/*.test.ts

# Run the bundled suites against dist/. CI uses this to cover runtimes
# older than the build requirement, where the .ts sources cannot run.
test-bundled: $(TESTS_DST) smoke
	cd .. && REPEAT=$${REPEAT:-1} node --test builder/tests/bundled.js

####

clean:
	/bin/rm -fr $(ALL)
	$(MAKE) -C ../browser/vendor $@

.PHONY: all clean test smoke smoke-mjs smoke-cjs smoke-minjs test-full test-bundled is-buildable is-not-buildable
