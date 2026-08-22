import {strict as assert} from "node:assert"
import {createRequire} from "node:module"
import {test} from "node:test"

const require = createRequire(import.meta.url)

test("require entry (.cjs)", () => {
    const m = require("sha256-uint8array")
    assert.equal(typeof m.createHash, "function")
})

test("minified entry (.min.js)", () => {
    const cjs = require.resolve("sha256-uint8array")
    const m = require(cjs.replace(/\.cjs$/, ".min.js"))
    assert.equal(typeof m.createHash, "function")
})
