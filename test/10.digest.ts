#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import * as crypto from "crypto";
import {createHash} from "../";
import {MAKURANOSOSHI} from "./utils/sample-text";

const TITLE = __filename.split("/").pop()!!;

describe(TITLE, () => {
    it("0 byte to hex", () => {
        const input = ""; // 0 byte

        assert.equal(crypto.createHash("sha256").update(input).digest("hex"), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        assert.equal(createHash().update(input).digest("hex"), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    });

    it("0 byte to Uint8Array", () => {
        const input = ""; // 0 byte

        assert.equal(toHEX(crypto.createHash("sha256").update(input).digest()), "e3-b0-c4-42-98-fc-1c-14-9a-fb-f4-c8-99-6f-b9-24-27-ae-41-e4-64-9b-93-4c-a4-95-99-1b-78-52-b8-55");
        assert.equal(toHEX(createHash().update(input).digest()), "e3-b0-c4-42-98-fc-1c-14-9a-fb-f4-c8-99-6f-b9-24-27-ae-41-e4-64-9b-93-4c-a4-95-99-1b-78-52-b8-55");
    });

    it("43 bytes string", () => {
        const input = "The quick brown fox jumps over the lazy dog";

        assert.equal(crypto.createHash("sha256").update(input).digest("hex"), "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592");
        assert.equal(createHash().update(input).digest("hex"), "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592");
    });

    it("43 bytes Buffer", () => {
        const input = Buffer.from("The quick brown fox jumps over the lazy dog");

        assert.equal(crypto.createHash("sha256").update(input).digest("hex"), "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592");
        assert.equal(createHash().update(input).digest("hex"), "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592");
    });

    it("117 bytes string", () => {
        const input = "Oh, wet Alex, a jar, a fag! Up, disk, curve by! Man Oz, Iraq, Arizona, my Bev? Ruck's id-pug, a far Ajax, elate? Who?";

        assert.equal(crypto.createHash("sha256").update(input).digest("hex"), "f9a85ef0cd92c2f3c4352d19531007f33c189088fd321d45d90073d971577dc8");
        assert.equal(createHash().update(input).digest("hex"), "f9a85ef0cd92c2f3c4352d19531007f33c189088fd321d45d90073d971577dc8");
    });

    it("117 bytes Buffer", () => {
        const input = Buffer.from("Oh, wet Alex, a jar, a fag! Up, disk, curve by! Man Oz, Iraq, Arizona, my Bev? Ruck's id-pug, a far Ajax, elate? Who?");

        assert.equal(crypto.createHash("sha256").update(input).digest("hex"), "f9a85ef0cd92c2f3c4352d19531007f33c189088fd321d45d90073d971577dc8");
        assert.equal(createHash().update(input).digest("hex"), "f9a85ef0cd92c2f3c4352d19531007f33c189088fd321d45d90073d971577dc8");
    });

    it("multiple string updates", () => {
        const input = "Oh, wet Alex, a jar, a fag! Up, disk, curve by! Man Oz, Iraq, Arizona, my Bev? Ruck's id-pug, a far Ajax, elate? Who?";

        const hash = createHash("sha256");
        input.split("").forEach(c => hash.update(c));
        assert.equal(hash.digest("hex"), "f9a85ef0cd92c2f3c4352d19531007f33c189088fd321d45d90073d971577dc8");
    });

    it("multiple Buffer updates", () => {
        const input = "Oh, wet Alex, a jar, a fag! Up, disk, curve by! Man Oz, Iraq, Arizona, my Bev? Ruck's id-pug, a far Ajax, elate? Who?";

        const hash = createHash("sha256");
        input.split("").forEach(c => hash.update(Buffer.from(c)));
        assert.equal(hash.digest("hex"), "f9a85ef0cd92c2f3c4352d19531007f33c189088fd321d45d90073d971577dc8");
    });

    it("UTF-8 characters", () => {
        const input = MAKURANOSOSHI;
        assert.equal(crypto.createHash("sha256").update(input).digest("hex"), "d5ac150856a272a4af705f720054628f5099d69e77a8074daa32f5eeff1b2d9c", "crypto");
        assert.equal(createHash().update(input).digest("hex"), "d5ac150856a272a4af705f720054628f5099d69e77a8074daa32f5eeff1b2d9c", "single text at once");

        const hash = createHash("sha256");
        input.split(/(\n)/).forEach(s => hash.update(s));
        assert.equal(hash.digest("hex"), "d5ac150856a272a4af705f720054628f5099d69e77a8074daa32f5eeff1b2d9c", "chunked text");
    });
});

const toHEX = (array: Uint8Array) => [].map.call(array, (c: number) => (c < 16 ? "0" : "") + c.toString(16)).join("-");
