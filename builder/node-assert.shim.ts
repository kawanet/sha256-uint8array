// Browser-side shim for `node:assert`. Aliased into the test bundle
// by the rollup test config. Tests source-import as
// `import {strict as assert} from "node:assert"`, so this file
// exports `strict` matching that surface.

export const strict = {
    // Truthy check. Mirrors `assert.ok(value, message?)` in node:assert.
    ok(value: unknown, message?: string): void {
        if (!value) {
            throw new Error(message || `expected truthy, got ${JSON.stringify(value)}`)
        }
    },

    // node:assert/strict-compatible `equal`. Uses `Object.is`
    // semantics, matching Node — so `equal(NaN, NaN)` passes and
    // `equal(0, -0)` fails, both opposite of `===`.
    equal(actual: unknown, expected: unknown, message?: string): void {
        if (!Object.is(actual, expected)) {
            throw new Error(message || `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
        }
    },

    // Verifies `block` throws. If `expected` is a RegExp the thrown
    // message must match it; if it is an Error subclass the thrown
    // value must be an instance of it. With no `expected` any throw
    // counts.
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
                throw new Error(`thrown message ${JSON.stringify(msg)} did not match ${expected}`)
            }
        } else if (typeof expected === "function") {
            if (!(thrown instanceof expected)) {
                throw new Error(`thrown is not an instance of ${expected.name}`)
            }
        }
    },

    // Inverse of `throws` — surfaces the actual error to ease
    // debugging instead of just reporting "did throw".
    doesNotThrow(block: () => void, message?: string): void {
        try {
            block()
        } catch (e) {
            const detail = e instanceof Error ? e.message : String(e)
            throw new Error(message ? `${message}: ${detail}` : `expected not to throw, got: ${detail}`)
        }
    },
}
