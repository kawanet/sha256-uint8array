/**
 * An interface which has digest() method
 */

import {Sha256 as awsSha256} from "@aws-crypto/sha256-js";
import createHashBrowser from "create-hash/browser.js";
import cryptoJs from "crypto-js";
import hashJs from "hash.js/lib/hash/sha/256.js";
import jsHashes from "jshashes";
import jsSha from "jssha/dist/sha256";
import * as nodeCrypto from "node:crypto";
import shaJs from "sha.js/sha256.js";
import {createHash as ownCreateHash} from "sha256-uint8array";
import {arrayToHex} from "./utils.ts";

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

const isBrowser = ("undefined" !== typeof window);
const isLegacy = ("function" !== typeof TextEncoder);
const hasSubtle = ("undefined" !== typeof crypto) && crypto.subtle && ("function" === typeof crypto.subtle.digest);

/**
 * https://github.com/kawanet/sha256-uint8array
 */

export class SHA256Uint8Array implements Adapter {
    private createHash = ownCreateHash;

    hash(data: string | Uint8Array | ArrayBufferView): string {
        const hash = this.createHash();
        if ("string" === typeof data) {
            hash.update(data); // same call either way: update() is overloaded, not union-typed
        } else {
            hash.update(data);
        }
        return hash.digest("hex");
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
        const input = "string" === typeof data ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        return this.crypto.createHash("sha256").update(input).digest("hex");
    }
}

/**
 * https://www.npmjs.com/package/create-hash
 *
 * Note: create-hash/browser calls sha.js internally.
 */

export class CreateHash implements Adapter {
    private createHash = createHashBrowser;
    noDataView = true;

    hash(data: string | Uint8Array): string {
        return this.createHash("sha256").update(data).digest("hex");
    }
}

/**
 * https://www.npmjs.com/package/crypto-js
 */

export class CryptoJs implements Adapter {
    private CryptoJS = cryptoJs;
    noBinary = true;

    hash(data: string): string {
        return this.CryptoJS.SHA256(data).toString();
    }
}

/**
 * https://www.npmjs.com/package/jshashes
 */

export class JsHashes implements Adapter {
    private Hashes = jsHashes;
    noBinary = true;

    hash(data: string): string {
        return new this.Hashes.SHA256().hex(data);
    }
}

/**
 * https://www.npmjs.com/package/jssha
 */

export class JsSHA implements Adapter {
    private sha256 = jsSha;
    noDataView = true;

    hash(data: string | Uint8Array): string {
        const type = ("string" === typeof data) ? "TEXT" : "UINT8ARRAY";
        const shaObj = new this.sha256("SHA-256", type);
        shaObj.update(data);
        return shaObj.getHash("HEX");
    }
}

/**
 * https://www.npmjs.com/package/sha.js
 */

export class ShaJS implements Adapter {
    private sha256 = shaJs;
    noDataView = true;

    hash(data: string | Uint8Array): string {
        return new this.sha256().update(data).digest("hex");
    }
}

/**
 * https://github.com/indutny/hash.js
 */

export class HashJs implements Adapter {
    private sha256 = hashJs;
    noDataView = true;

    hash(data: string | Uint8Array): string {
        return this.sha256().update(data).digest('hex');
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
        const hash = new this.Sha256();
        hash.update(data);
        return arrayToHex(hash.digestSync());
    }
}

/**
 * https://developer.mozilla.org/docs/Web/API/SubtleCrypto
 */

export class SubtleCrypto implements AsyncAdapter {
    noString = true;
    noBinary = !hasSubtle;

    async hash(data: Uint8Array<ArrayBuffer>): Promise<string> {
        const digest = await crypto.subtle.digest("SHA-256", data);
        return arrayToHex(new Uint8Array(digest));
    }
}
