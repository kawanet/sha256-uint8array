import {describe, it} from "node:test"

import {strict as assert} from "node:assert"
import * as crypto from "node:crypto"
import {createHash} from "../lib/sha256-uint8array.ts"

// Suite label. Kept a literal so the CommonJS build for the browser
// bundle does not need import.meta.
const TITLE = "12.algorithm.test.ts"

describe(TITLE, () => {
    it('createHash("invalid")', () => {
        assert.throws(() => crypto.createHash("invalid"))

        assert.throws(() => createHash("invalid"))
    })

    it('createHash("sha256")', () => {
        assert.doesNotThrow(() => crypto.createHash("sha256"))

        assert.doesNotThrow(() => createHash("sha256"))
    })

    it('createHash("SHA256")', () => {
        assert.doesNotThrow(() => crypto.createHash("SHA256"))

        assert.doesNotThrow(() => createHash("SHA256"))
    })

    it('createHash(undefined)', () => {
        assert.throws(() => crypto.createHash(undefined as any))

        assert.doesNotThrow(() => createHash(undefined))
    })
})
