// Browser-side stand-in for `node:assert`, aliased in by the rollup test
// config. The suites import it as
// `import {strict as assert} from "node:assert"`, so only the `strict`
// surface they actually reach is provided here.

export const strict = {
    // Mirrors `assert.ok(value, message?)`.
    ok(value: unknown, message?: string): void {
        if (!value) {
            throw new Error(message || "expected truthy, got " + JSON.stringify(value))
        }
    },

    // node:assert/strict `equal` compares with Object.is semantics, so
    // NaN equals NaN and 0 does not equal -0 — both unlike `===`.
    equal(actual: unknown, expected: unknown, message?: string): void {
        if (!Object.is(actual, expected)) {
            throw new Error(message || "expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual))
        }
    },

    // Verifies `block` throws. A RegExp is matched against the thrown
    // message; an Error subclass is checked with instanceof.
    throws(block: () => void, expected?: RegExp | (new (...args: unknown[]) => Error)): void {
        let thrown: unknown
        let didThrow = false
        try {
            block()
        } catch (e) {
            thrown = e
            didThrow = true
        }
        if (!didThrow) {
            throw new Error("expected to throw, did not")
        }
        if (expected instanceof RegExp) {
            const msg = thrown instanceof Error ? thrown.message : String(thrown)
            if (!expected.test(msg)) {
                throw new Error("thrown message " + JSON.stringify(msg) + " did not match " + expected)
            }
        } else if ("function" === typeof expected) {
            if (!(thrown instanceof expected)) {
                throw new Error("thrown is not an instance of " + expected.name)
            }
        }
    },

    // Verifies `block` completes normally.
    doesNotThrow(block: () => void): void {
        block()
    },
}
