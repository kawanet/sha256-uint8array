/**
 * An interface which has digest() method
 */

import {Sha256 as awsSha256} from "@aws-crypto/sha256-js"
import {sha256 as noble} from "@noble/hashes/sha2.js"
import {bytesToHex} from "@noble/hashes/utils.js"
import cryptoJs from "crypto-js"
import fastSha256 from "fast-sha256"
import hashJs from "hash.js/lib/hash/sha/256.js"
import {sha256 as jsSha256} from "js-sha256"
import jsSha from "jssha/dist/sha256"
import forgeSha from "node-forge/lib/sha256.js"
import * as nodeCrypto from "node:crypto"
import shaJs from "sha.js/sha256.js"
import {createHash as ownCreateHash} from "../../lib/sha256-uint8array.ts"
import {arrayToHex} from "./utils.ts"

export interface Adapter {
    noString?: boolean;
    noBinary?: boolean;
    noDataView?: boolean;

    hash(data: string | Uint8Array | ArrayBufferView): string;
}

export interface AsyncAdapter {
    noBinary?: boolean;

    hash(data: Uint8Array<ArrayBuffer>): Promise<string>;
}

const isBrowser = ("undefined" !== typeof window)
const isLegacy = ("function" !== typeof TextEncoder)
const hasSubtle = ("undefined" !== typeof crypto) && crypto.subtle && ("function" === typeof crypto.subtle.digest)

/**
 * https://github.com/kawanet/sha256-uint8array
 */

export class SHA256Uint8Array implements Adapter {
    private createHash = ownCreateHash;

    hash(data: string | Uint8Array | ArrayBufferView): string {
        const hash = this.createHash()
        if ("string" === typeof data) {
            hash.update(data) // same call either way: update() is overloaded, not union-typed
        } else {
            hash.update(data)
        }
        return hash.digest("hex")
    }
}

/**
 * https://nodejs.org/api/crypto.html
 */

export class Crypto implements Adapter {
    private crypto = nodeCrypto;
    noString = isBrowser;
    noBinary = isBrowser;

    hash(data: string | Uint8Array | ArrayBufferView): string {
        // BinaryLike covers the concrete views rather than the abstract
        // ArrayBufferView, so narrow before handing the value over.
        const input = "string" === typeof data ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
        return this.crypto.createHash("sha256").update(input).digest("hex")
    }
}

/**
 * https://www.npmjs.com/package/crypto-js
 */

export class CryptoJs implements Adapter {
    private CryptoJS = cryptoJs;
    noBinary = true;

    hash(data: string): string {
        return this.CryptoJS.SHA256(data).toString()
    }
}

/**
 * https://www.npmjs.com/package/jssha
 */

export class JsSHA implements Adapter {
    private sha256 = jsSha;
    noDataView = true;

    hash(data: string | Uint8Array): string {
        const type = ("string" === typeof data) ? "TEXT" : "UINT8ARRAY"
        const shaObj = new this.sha256("SHA-256", type)
        shaObj.update(data)
        return shaObj.getHash("HEX")
    }
}

/**
 * https://www.npmjs.com/package/sha.js
 */

export class ShaJS implements Adapter {
    private sha256 = shaJs;
    noDataView = true;

    hash(data: string | Uint8Array): string {
        return new this.sha256().update(data).digest("hex")
    }
}

/**
 * https://github.com/indutny/hash.js
 */

export class HashJs implements Adapter {
    private sha256 = hashJs;
    noDataView = true;

    hash(data: string | Uint8Array): string {
        return this.sha256().update(data).digest('hex')
    }
}

/**
 * https://www.npmjs.com/package/@aws-crypto/sha256-js
 * https://github.com/aws/aws-sdk-js-crypto-helpers/tree/master/packages/sha256-js
 */

export class AwsCrypto implements Adapter {
    private Sha256 = awsSha256;
    noString = isLegacy;
    noBinary = isLegacy;

    hash(data: string | Uint8Array): string {
        const hash = new this.Sha256()
        hash.update(data)
        return arrayToHex(hash.digestSync())
    }
}

/**
 * https://www.npmjs.com/package/@noble/hashes
 *
 * Note: it rejects a string outright rather than guessing an encoding.
 */

export class Noble implements Adapter {
    private sha256 = noble;
    noString = true;
    noDataView = true;

    hash(data: Uint8Array): string {
        return bytesToHex(this.sha256(data))
    }
}

/**
 * https://www.npmjs.com/package/node-forge
 *
 * Note: the SHA-256 module is imported on its own; the package root
 * pulls in the whole crypto suite.
 */

export class NodeForge implements Adapter {
    private md = forgeSha;
    noBinary = true;

    hash(data: string): string {
        const md = this.md.create()
        // update() reads a string as latin1 unless the encoding is named.
        md.update(data, "utf8")
        return md.digest().toHex()
    }
}

/**
 * https://www.npmjs.com/package/fast-sha256
 */

export class FastSha256 implements Adapter {
    private sha256 = fastSha256;
    noString = true;
    noDataView = true;

    hash(data: Uint8Array): string {
        return arrayToHex(this.sha256(data))
    }
}

/**
 * https://www.npmjs.com/package/js-sha256
 */

export class JsSha256 implements Adapter {
    private sha256 = jsSha256;
    noDataView = true;

    hash(data: string | Uint8Array): string {
        return this.sha256(data)
    }
}

/**
 * https://developer.mozilla.org/docs/Web/API/SubtleCrypto
 */

export class SubtleCrypto implements AsyncAdapter {
    noString = true;
    noBinary = !hasSubtle;

    async hash(data: Uint8Array<ArrayBuffer>): Promise<string> {
        const digest = await crypto.subtle.digest("SHA-256", data)
        return arrayToHex(new Uint8Array(digest))
    }
}
