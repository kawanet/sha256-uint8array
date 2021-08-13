#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import * as A from "./utils/adapters";
import {arrayToArrayBuffer} from "./utils/utils";

const TITLE = __filename.split("/").pop()!!;

describe(TITLE, () => {
    it("crypto", testFor(new A.Crypto()));

    it("sha256-uint8array", testFor(new A.SHA256Uint8Array()));

    it("crypto-js", testFor(new A.CryptoJs()));

    it("jssha", testFor(new A.JsSHA()));

    it("hash.js", testFor(new A.HashJs()));

    it("sha.js", testFor(new A.ShaJS()));

    it("create-hash/browser", testFor(new A.CreateHash()));

    it("jshashes", testFor(new A.JsHashes()));

    it("@aws-crypto/sha256-js", testFor(new A.AwsCrypto()));
});

function testFor(adapter: A.Adapter) {
    return function (this: Mocha.Context): void {
        if (adapter.noString) return this.skip();

        {
            const input = ""; // 0 byte
            assert.equal(adapter.hash(input), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "empty");
        }

        {
            const input = "A"; // 1 byte
            assert.equal(adapter.hash(input), "559aead08264d5795d3909718cdd05abd49572e84fe55590eef31a88a08fdffd", "1 byte");
        }

        {
            const input = "α"; // 2 bytes
            assert.equal(adapter.hash(input), "3e32da9648c78feedcc821d56e483c126dcd270e9fe49973c528e3a88912d557", "2 bytes");
        }

        {
            const input = "漢"; // 3 bytes
            assert.equal(adapter.hash(input), "fc9f0d61dd80076ae5f0e41688aa0c3e8727b232b7a8c40c4f0671e0cd5d94c9", "3 bytes");
        }

        {
            const input = "\u{1F60D}"; // 4 bytes
            assert.equal(adapter.hash(input), "453cb3b789e7b403d4cb5342bc1469fb418be79e1ef74f30b79e6f699f20a39d", "4 bytes");
        }

        {
            const input = "1234567890123456789012345678901234567890123456789012345678901234"; // 64 byte
            assert.equal(adapter.hash(input), "676491965ed3ec50cb7a63ee96315480a95c54426b0b72bca8a0d4ad1285ad55", "64 byte");
        }

        {
            const input = "Oh, wet Alex, a jar, a fag! Up, disk, curve by! Man Oz, Iraq, Arizona, my Bev? Ruck's id-pug, a far Ajax, elate? Who?"; // 117 bytes
            assert.equal(adapter.hash(input), "f9a85ef0cd92c2f3c4352d19531007f33c189088fd321d45d90073d971577dc8", shorten(input));
        }

        {
            const input = "Le cœur déçu mais l'âme plutôt naïve, Louÿs rêva de crapaüter en canoë au delà des îles, près du mälströn où brûlent les novæ."; // 144 bytes
            assert.equal(adapter.hash(input), "d613a065feafa4fd87f43933a777ad3aaf888804a9e84efb88fe0468f740e70d", shorten(input));
        }

        {
            const input = "Victor jagt zwölf Boxkämpfer quer über den großen Sylter Deich."; // 67 bytes
            assert.equal(adapter.hash(input), "76eaafdaed7b0d034218518c712e61154a21fea3993590aa1af38f20722b7a5c", shorten(input));
        }

        {
            const input = "El veloz murciélago hindú comía feliz cardillo y kiwi. La cigüeña tocaba el saxofón detrás del palenque de paja."; // 119 bytes
            assert.equal(adapter.hash(input), "c6574ab38b84d6c9967170995f4ff8f415f58e3e8740b0402f97cf7aacde6412", shorten(input));
        }

        if (!adapter.noBinary) {
            const buffer = arrayToArrayBuffer([0, 1, 126, 127, 128, 129, 254, 255]);
            const expected = "22b44ea02cb8ae041867a7bddffc3c610b098d761cc8c3b21bcdff63af67ee3c";

            {
                assert.equal(adapter.hash(new Uint8Array(buffer)), expected);
            }

            if (!adapter.noDataView) {
                assert.equal(adapter.hash(new Int8Array(buffer)), expected);
                assert.equal(adapter.hash(new Int16Array(buffer)), expected);
                assert.equal(adapter.hash(new Int32Array(buffer)), expected);
                assert.equal(adapter.hash(new Uint16Array(buffer)), expected);
                assert.equal(adapter.hash(new Uint32Array(buffer)), expected);
                assert.equal(adapter.hash(new DataView(buffer)), expected);
            }
        }
    };
}

function shorten(str: string) {
    return str.split(" ").slice(0, 4).join(" ");
}
