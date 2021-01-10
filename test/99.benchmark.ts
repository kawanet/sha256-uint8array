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

    runTests("crypto", new A.Crypto());

    runTests("crypto-js", new A.CryptoJs());

    runTests("create-hash/browser", new A.CreateHash());

    runTests("hash.js", new A.HashJs());

    runTests("jssha", new A.JsSHA());

    runTests("jshashes", new A.JsHashes());

    runTests("sha.js", new A.ShaJS());

    runTests("sha256-uint8array", new A.SHA256Uint8Array());

    function runTests(title: string, adapter: A.Adapter) {
        it(title, function () {
            this.timeout(10000);

            for (let i = 0; i < REPEAT; i++) {
                assert.equal(adapter.hash(sampleJSON), expectJSON);
                assert.equal(adapter.hash(sampleUTF8), expectUTF8);
            }
        });
    }
});
