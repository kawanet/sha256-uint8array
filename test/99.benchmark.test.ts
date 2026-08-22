import type {TestContext} from "node:test"
import {describe, it} from "node:test"

import * as A from "./utils/adapters.ts"
import {MAKURANOSOSHI, SAMPLE_JSON} from "./utils/sample-text.ts"

// Suite label. Kept a literal so the CommonJS build for the browser
// bundle does not need import.meta.
const TITLE = "99.benchmark.test.ts"

// This suite verifies the benchmark payloads themselves: the closures
// builder/bench.ts measures run here with a small REPEAT, so CI keeps
// covering the measured code path. The numbers live in the runner;
// this file asserts correctness only.
const REPEAT = +(process.env.REPEAT || 100)
const stringToArray = (str: string) => Array.from(unescape(encodeURIComponent(str)), (c: string) => c.charCodeAt(0))

describe(`REPEAT=${REPEAT} ${TITLE}`, () => {

    const expectJSON = (new A.Crypto()).hash(SAMPLE_JSON)
    const expectUTF8 = (new A.Crypto()).hash(MAKURANOSOSHI)

    const stringPairs: A.BenchPair<string>[] = [
        {data: SAMPLE_JSON, expect: expectJSON},
        {data: MAKURANOSOSHI, expect: expectUTF8},
    ]

    const binaryPairs: A.BenchPair<Uint8Array<ArrayBuffer>>[] = [
        {data: new Uint8Array(stringToArray(SAMPLE_JSON)), expect: expectJSON},
        {data: new Uint8Array(stringToArray(MAKURANOSOSHI)), expect: expectUTF8},
    ]

    describe("makeStringBench", () => {
        it("crypto", testString(new A.Crypto()))
        it("sha256-uint8array", testString(new A.SHA256Uint8Array()))
        it("crypto-js", testString(new A.CryptoJs()))
        it("jssha", testString(new A.JsSHA()))
        it("hash.js", testString(new A.HashJs()))
        it("sha.js", testString(new A.ShaJS()))
        it("@noble/hashes", testString(new A.Noble()))
        it("node-forge", testString(new A.NodeForge()))
        it("fast-sha256", testString(new A.FastSha256()))
        it("js-sha256", testString(new A.JsSha256()))
        it("@aws-crypto/sha256-js", testString(new A.AwsCrypto()))
    })

    describe("makeBinaryBench", () => {
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
        it("@aws-crypto/sha256-js", testBinary(new A.AwsCrypto()))
    })

    describe("makeAsyncBench", () => {
        it("crypto.subtle.digest()", testAsync(new A.SubtleCrypto()))
    })

    function testString(adapter: A.Adapter) {
        return (t: TestContext): void => {
            const bench = adapter.makeStringBench(stringPairs)
            if (!bench) return t.skip()
            bench(REPEAT)
        }
    }

    function testBinary(adapter: A.Adapter) {
        return (t: TestContext): void => {
            const bench = adapter.makeBinaryBench(binaryPairs)
            if (!bench) return t.skip()
            bench(REPEAT)
        }
    }

    function testAsync(adapter: A.Adapter) {
        return async (t: TestContext): Promise<void> => {
            const bench = adapter.makeAsyncBench(binaryPairs)
            if (!bench) return t.skip()
            await bench(REPEAT)
        }
    }
})
