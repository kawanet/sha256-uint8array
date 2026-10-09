import {strict as assert} from "node:assert"
import {test} from "node:test"
import type * as declared from "sha256-uint8array"
import * as m from "../lib/sha256-uint8array.ts"

const isNodeJS = "undefined" !== typeof process && !!process?.versions?.node

const createRequire = async (path: string) => {
    const {createRequire} = await import("node:module")
    return createRequire(path)
}

const resolvePath = async (name: string, path: string) => {
    const require = await createRequire(import.meta.url)
    const {join, dirname} = await import("node:path")
    return join(dirname(require.resolve(name)), path)
}

// tsc fails here when a name declared in the published .d.ts is missing
// from the runtime entry -- the surface check derives from the declarations.
const runtime: typeof declared = m
void runtime

test("import entry (.mjs)", () => {
    // entries
    assert.equal(typeof m.createHash, "function")
})

test("require entry (.cjs)", {skip: !isNodeJS}, async () => {
    const require = await createRequire(import.meta.url)
    const m = require("sha256-uint8array")
    // entries
    assert.equal(typeof m.createHash, "function")
})

test("minified entry (.min.js)", {skip: !isNodeJS}, async () => {
    const require = await createRequire(import.meta.url)
    const m: typeof declared = require(await resolvePath("sha256-uint8array", "sha256-uint8array.min.js"))
    // entries
    assert.equal(typeof m.createHash, "function")
})
