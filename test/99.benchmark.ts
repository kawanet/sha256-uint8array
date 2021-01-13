#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import * as A from "./utils/adapters";
import {MAKURANOSOSHI} from "./utils/sample-text";

const TESTNAME = __filename.replace(/^.*\//, "");

const isBrowser = ("undefined" !== typeof window);

const REPEAT = process.env.REPEAT || (isBrowser ? 10000 : 10000);

describe(TESTNAME, () => {
    const sampleJSON = JSON.stringify(require("../package.json"));
    const expectJSON = (new A.Crypto()).hash(sampleJSON);

    const sampleUTF8 = MAKURANOSOSHI;
    const expectUTF8 = (new A.Crypto()).hash(sampleUTF8);

    it("crypto", testFor(new A.Crypto()));

    it("sha256-uint8array", testFor(new A.SHA256Uint8Array()));

    it("crypto-js", testFor(new A.CryptoJs()));

    it("jssha", testFor(new A.JsSHA()));

    it("hash.js", testFor(new A.HashJs()));

    it("sha.js", testFor(new A.ShaJS()));

    it("create-hash/browser", testFor(new A.CreateHash()));

    it("jshashes", testFor(new A.JsHashes()));

    function testFor(adapter: A.Adapter) {
        return function (this: Mocha.Context) {
            this.timeout(10000);

            for (let i = 0; i < REPEAT; i++) {
                assert.equal(adapter.hash(sampleJSON), expectJSON);
                assert.equal(adapter.hash(sampleUTF8), expectUTF8);
            }
        };
    }
});
