import type {TestContext} from "node:test"
import {before, describe, it} from "node:test"

import {strict as assert} from "node:assert"
import * as A from "./utils/adapters.ts"
import {MAKURANOSOSHI, SAMPLE_JSON} from "./utils/sample-text.ts"

// Suite label. Kept a literal so the CommonJS build for the browser
// bundle does not need import.meta.
const TITLE = "99.benchmark.test.ts"

const isBrowser = ("undefined" !== typeof window)
const isLegacy = ("function" !== typeof TextEncoder)
const REPEAT = +(process.env.REPEAT || (isBrowser ? (isLegacy ? 1000 : 10000) : 10000))
const SLEEP = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const stringToArray = (str: string) => Array.from(unescape(encodeURIComponent(str)), (c: string) => c.charCodeAt(0))

describe(`REPEAT=${REPEAT} ${TITLE}`, () => {

    const sampleJSON = SAMPLE_JSON
    const binaryJSON = new Uint8Array(stringToArray(sampleJSON))
    const expectJSON = (new A.Crypto()).hash(sampleJSON)

    const sampleUTF8 = MAKURANOSOSHI
    const binaryUTF8 = new Uint8Array(stringToArray(sampleUTF8))
    const expectUTF8 = (new A.Crypto()).hash(sampleUTF8)

    describe("input: string => output: hex", () => {
        before(() => SLEEP(100))
        it("crypto", testFor(new A.Crypto()))
        it("sha256-uint8array", testFor(new A.SHA256Uint8Array()))
        it("crypto-js", testFor(new A.CryptoJs()))
        it("jssha", testFor(new A.JsSHA()))
        it("hash.js", testFor(new A.HashJs()))
        it("sha.js", testFor(new A.ShaJS()))
        it("@noble/hashes", testFor(new A.Noble()))
        it("node-forge", testFor(new A.NodeForge()))
        it("fast-sha256", testFor(new A.FastSha256()))
        it("js-sha256", testFor(new A.JsSha256()))
        it.skip("@aws-crypto/sha256-js", testFor(new A.AwsCrypto()))
    })

    describe("input: Uint8Array => output: hex", () => {
        before(() => SLEEP(100))
        it("crypto", testBinary(new A.Crypto()))
        it("sha256-uint8array", testBinary(new A.SHA256Uint8Array()))
        it("crypto-js", testBinary(new A.CryptoJs()))
        it("jssha", testBinary(new A.JsSHA()))
        it("hash.js", testBinary(new A.HashJs()))
        it("sha.js", testBinary(new A.ShaJS()))
        it("@noble/hashes", testBinary(new A.Noble()))
        it("node-forge", testBinary(new A.NodeForge()))
        it("fast-sha256", testBinary(new A.FastSha256()))
        it("js-sha256", testBinary(new A.JsSha256()))
        it.skip("@aws-crypto/sha256-js", testBinary(new A.AwsCrypto()))
        it.skip("crypto.subtle.digest()", testAsync(new A.SubtleCrypto()))
    })

    function testFor(adapter: A.Adapter) {
        return (t: TestContext): void => {
            if (adapter.noString) return t.skip()

            for (let i = 0; i < REPEAT; i++) {
                assert.equal(adapter.hash(sampleJSON), expectJSON)
                assert.equal(adapter.hash(sampleUTF8), expectUTF8)
            }
        }
    }

    function testBinary(adapter: A.Adapter) {
        return (t: TestContext): void => {
            if (adapter.noBinary) return t.skip()

            for (let i = 0; i < REPEAT; i++) {
                assert.equal(adapter.hash(binaryJSON), expectJSON)
                assert.equal(adapter.hash(binaryUTF8), expectUTF8)
            }
        }
    }

    function testAsync(adapter: A.AsyncAdapter) {
        return async (t: TestContext): Promise<void> => {
            if (adapter.noBinary) return t.skip()

            for (let i = 0; i < REPEAT; i++) {
                assert.equal(await adapter.hash(binaryJSON), expectJSON)
                assert.equal(await adapter.hash(binaryUTF8), expectUTF8)
            }
        }
    }
})
