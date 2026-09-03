# Force bash so `set -o pipefail` works in the recipes below.
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
BROWSER_TEST_DST := ../browser/tests/bundled.js
BUILDER_TEST_DST := ./tests/bundled.mjs
BUILDER_BENCH_DST := ../builder/tests/bench.mjs
BROWSER_BENCH_DST := ../browser/tests/bench.js

MJS_CONFIG   := ./rollup-mjs.config.ts
CJS_CONFIG   := ./rollup-cjs.config.ts
MINJS_CONFIG := ./rollup-minjs.config.ts
BROWSER_TEST_CONFIG := ./rollup-browser-test.config.ts
BUILDER_TEST_CONFIG := ./rollup-builder-test.config.ts
BENCH_CONFIG := ./rollup-bench.config.ts

# Each artifact gets its own cap because they are built from different
# targets. The package has no runtime dependencies and uses no Node
# builtins, so all three hold this repository's code alone — a sudden
# jump means something was dragged in that does not belong.
MJS_MAX_BYTES   := 16000
CJS_MAX_BYTES   := 16000

# The browser bundle is minified, so its cap is much tighter than the
# unminified pair above and doubles as a regression guard on the size
# the README advertises.
MINJS_MAX_BYTES := 5000

# The browser test bundle carries the suites and the shims; every compared
# implementation now loads separately from browser/vendor. The cap only
# guards against a step change, such as a dependency slipping back in.
TEST_MAX_BYTES := 50000

ALL := $(MJS_DST) $(CJS_DST) $(MINJS_DST) $(PKG_DST)

# Build/test paths require Node's native TypeScript type-strip (default on
# Node 22.18+). Older runtimes (e.g. Node 20) report BUILDABLE=NO and can
# still verify pre-built bundles via the builder/pack targets.
BUILDABLE := $(shell node -e 'console.log(process.features.typescript ? "YES" : "NO")')

####

# Build all artifacts.
all: is-buildable $(ALL)

# Gate consumed by `all` and `npm prepack` so a build starts only where it
# can finish: with native type-strip and the devDependencies installed.
is-buildable:
	@ [ "$(BUILDABLE)" = "YES" ] && [ -f ../node_modules/.bin/rollup ]

# Inverse gate for `npm prepare`: a consumer install skips build/test and
# relies on prebuilt artifacts; contributors build on a capable runtime.
is-not-buildable:
	@ [ "$(BUILDABLE)" != "YES" ] || [ ! -f ../node_modules/.bin/rollup ]

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
$(BROWSER_TEST_DST): $(BROWSER_TEST_CONFIG) $(SRC) $(BUILDER_SRC) $(TEST_SRC) $(BROWSER_SRC) $(MINJS_DST)
	@mkdir -p $(dir $@)
	$(MAKE) -C ../browser/vendor
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(TEST_MAX_BYTES) || { echo "ERROR: $@ exceeds $(TEST_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

# Plain-JS bundle of the test suites, importing the package by name.
# Runs against dist/ on any supported Node runtime without type-strip.
$(BUILDER_TEST_DST): $(BUILDER_TEST_CONFIG) $(SRC) $(BUILDER_SRC) $(TEST_SRC) $(MJS_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(TEST_MAX_BYTES) || { echo "ERROR: $@ exceeds $(TEST_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

# Benchmark runner bundles: one rollup run emits both files, and the
# recipe lives on the builder-side file alone.
bench: $(BUILDER_BENCH_DST) $(BROWSER_BENCH_DST)

$(BUILDER_BENCH_DST): $(BENCH_CONFIG) $(SRC) $(BUILDER_SRC) $(TEST_SRC) $(BROWSER_SRC) $(MJS_DST) $(MINJS_DST)
	@mkdir -p ../builder/tests ../browser/tests
	$(MAKE) -C ../browser/vendor
	../node_modules/.bin/rollup -c $(BENCH_CONFIG)
	@ls -l $@ $(BROWSER_BENCH_DST)
	@test "$$(wc -c < $@)" -le $(TEST_MAX_BYTES) || { echo "ERROR: $@ exceeds $(TEST_MAX_BYTES) byte cap" >&2; exit 1; }
	@test "$$(wc -c < $(BROWSER_BENCH_DST))" -le $(TEST_MAX_BYTES) || { echo "ERROR: $(BROWSER_BENCH_DST) exceeds $(TEST_MAX_BYTES) byte cap" >&2; exit 1; }
	@echo ""

# Emitted by the same rollup run above; just assert it exists.
$(BROWSER_BENCH_DST): $(BUILDER_BENCH_DST)
	@ [ -f $@ ]

####

# Consumer `npm install` skips the heavy test-full step to keep install fast.
# `npm pack` re-runs prepare for a fresh build; tests are skipped there too
# because CI runs them explicitly around the pack, while `npm publish`
# reports npm_command=publish and still gets the full run.
test:
	@case "$$npm_command" in \
		install|ci|pack) echo "npm $$npm_command detected: skipping full tests." ;; \
		*) $(MAKE) test-full ;; \
	esac

test-full: all
	cd .. && node_modules/.bin/tsc --noEmit
	cd .. && node_modules/.bin/ts-refine format --check && node_modules/.bin/ts-refine imports --check
	cd .. && node --test test/*.test.ts

####

clean:
	/bin/rm -fr $(ALL) $(BROWSER_BENCH_DST) $(BROWSER_TEST_DST) $(BUILDER_BENCH_DST) $(BUILDER_TEST_DST) $(PKG_DST)
	$(MAKE) -C ../browser/vendor $@

.PHONY: all bench clean test test-full is-buildable is-not-buildable
