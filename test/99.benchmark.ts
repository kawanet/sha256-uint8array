#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import * as A from "./utils/adapters";
import {MAKURANOSOSHI} from "./utils/sample-text";

const TESTNAME = __filename.replace(/^.*\//, "");

const isBrowser = ("undefined" !== typeof window);

const REPEAT = process.env.REPEAT || (isBrowser ? 100 : 100);

describe(TESTNAME, () => {
    const expects = {} as { [length: string]: string };

    before(() => {
        const adapter = new A.Crypto();

        for (let i = 1; i < MAKURANOSOSHI.length; i++) {
            const input = MAKURANOSOSHI.substring(0, i);
            expects[i] = adapter.hash(input);
        }
    });

    runTests("crypto", new A.Crypto());

    runTests("crypto-js", new A.CryptoJs());

    runTests("create-hash/browser", new A.CreateHash());

    runTests("jssha", new A.JsSHA());

    runTests("jshashes", new A.JsHashes());

    runTests("sha.js", new A.ShaJS());

    runTests("sha256-uint8array", new A.SHA256Uint8Array());

    function runTests(title: string, adapter: A.Adapter) {
        it(title, function () {
            this.timeout(10000);

            for (let repeat = 1; repeat < REPEAT; repeat++) {
                for (let i = 1; i < MAKURANOSOSHI.length; i++) {
                    const input = MAKURANOSOSHI.substring(0, i);
                    assert.equal(adapter.hash(input), expects[i], `${i} characters`);
                }
            }
        });
    }
});
