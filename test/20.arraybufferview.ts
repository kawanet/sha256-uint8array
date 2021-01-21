#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {createHash} from "../lib/sha256-uint8array";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    const expected = createHash().update("ABCDEFGH").digest("hex");
    const buffer = ArrayBufferFromString("ABCDEFGH");

    it("Int8Array", () => {
        const data = new Int8Array(buffer);
        assert.equal(data.BYTES_PER_ELEMENT, 1);
        assert.equal(data.byteLength, 8);
        assert.equal(data.byteOffset, 0);
        assert.equal(createHash().update(data).digest("hex"), expected);
    });

    it("Uint16Array", () => {
        const data = new Uint16Array(buffer);
        assert.equal(data.BYTES_PER_ELEMENT, 2);
        assert.equal(data.byteLength, 8);
        assert.equal(data.byteOffset, 0);
        assert.equal(createHash().update(data).digest("hex"), expected);
    });

    it("Uint16Array offset 0", testFor(0));
    it("Uint16Array offset 2", testFor(2));
    it("Uint16Array offset 4", testFor(4));

    it("Uint32Array", () => {
        const data = new Uint32Array(buffer);
        assert.equal(data.BYTES_PER_ELEMENT, 4);
        assert.equal(data.byteLength, 8);
        assert.equal(data.byteOffset, 0);
        assert.equal(createHash().update(data).digest("hex"), expected);
    });

    it("DataView", () => {
        const data = new DataView(buffer);
        assert.equal(data.byteLength, 8);
        assert.equal(data.byteOffset, 0);
        assert.equal(data.getInt8(0), 0x41);
        assert.equal(createHash().update(data).digest("hex"), expected);
    });

    it("null", () => {
        assert.throws(() => createHash().update(null));
        assert.doesNotThrow(() => createHash().update(""));
    });

    function testFor(offset: number) {
        return function (this: Mocha.Context) {
            const word = new Uint8Array(buffer, offset, 4).slice();
            const expected = createHash().update(word).digest("hex");

            // one word array with offset
            const data = new Uint16Array(buffer, offset, 2);
            assert.equal(data.BYTES_PER_ELEMENT, 2);
            assert.equal(data.byteLength, 4);
            assert.equal(data.byteOffset, offset);
            assert.equal(createHash().update(data).digest("hex"), expected);
        }
    }
});

function ArrayBufferFromString(str: string) {
    str = unescape(encodeURIComponent(str));
    const buffer = new ArrayBuffer(str.length);
    const data = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++) {
        data[i] = str.charCodeAt(i);
    }
    return buffer;
}
