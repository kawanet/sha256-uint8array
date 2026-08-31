import {strict as assert} from "node:assert"
import {createRequire} from "node:module"
import {test} from "node:test"
import type * as declared from "sha256-uint8array"
import * as m from "../lib/sha256-uint8array.ts"

const require = createRequire(import.meta.url)

// tsc fails here when a name declared in the published .d.ts is missing
// from the runtime entry -- the surface check derives from the declarations.
const runtime: typeof declared = m
void runtime

test("import entry (.mjs)", () => {
    assert.equal(typeof m.createHash, "function")
})

test("require entry (.cjs)", () => {
    const m = require("sha256-uint8array")
    assert.equal(typeof m.createHash, "function")
})

test("minified entry (.min.js)", () => {
    const cjs = require.resolve("sha256-uint8array")
    const m = require(cjs.replace(/\.cjs$/, ".min.js"))
    assert.equal(typeof m.createHash, "function")
})
