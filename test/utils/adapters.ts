/**
 * An interface which has digest() method
 */

import {arrayToHex} from "./utils";

export interface Adapter {
    noString?: boolean;
    noBinary?: boolean;
    noDataView?: boolean;

    hash(data: string | Uint8Array | ArrayBufferView): string;
}

export interface AsyncAdapter {
    noBinary?: boolean;

    hash(data: Uint8Array): Promise<string>;
}

const isBrowser = ("undefined" !== typeof window);
const isLegacy = ("function" !== typeof TextEncoder);
const hasSubtle = ("undefined" !== typeof crypto) && crypto.subtle && ("function" === typeof crypto.subtle.digest);

/**
 * https://github.com/kawanet/sha256-uint8array
 */

export class SHA256Uint8Array implements Adapter {
    private createHash = isBrowser
        ? require("../../dist/sha256-uint8array.min").createHash
        : require("../../lib/sha256-uint8array").createHash;

    hash(data: string | Uint8Array | ArrayBufferView): string {
        return this.createHash().update(data).digest("hex");
    }
}

/**
 * https://nodejs.org/api/crypto.html
 */

export class Crypto implements Adapter {
    private crypto = require("crypto");
    noString = isBrowser;
    noBinary = isBrowser;

    hash(data: string | Uint8Array | ArrayBufferView): string {
        return this.crypto.createHash("sha256").update(data).digest("hex");
    }
}

/**
 * https://www.npmjs.com/package/create-hash
 *
 * Note: create-hash/browser calls sha.js internally.
 */

export class CreateHash implements Adapter {
    private createHash = require("create-hash/browser");
    noDataView = true;

    hash(data: string | Uint8Array): string {
        return this.createHash("sha256").update(data).digest("hex");
    }
}

/**
 * https://www.npmjs.com/package/crypto-js
 */

export class CryptoJs implements Adapter {
    private CryptoJS = require("crypto-js");
    noBinary = true;

    hash(data: string): string {
        return this.CryptoJS.SHA256(data).toString();
    }
}

/**
 * https://www.npmjs.com/package/jshashes
 */

export class JsHashes implements Adapter {
    private Hashes = require("jshashes");
    noBinary = true;

    hash(data: string): string {
        return new this.Hashes.SHA256().hex(data);
    }
}

/**
 * https://www.npmjs.com/package/jssha
 */

export class JsSHA implements Adapter {
    private sha256 = require("jssha/dist/sha256");
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
    private sha256 = require("sha.js/sha256");
    noDataView = true;

    hash(data: string | Uint8Array): string {
        return new this.sha256().update(data).digest("hex");
    }
}

/**
 * https://github.com/indutny/hash.js
 */

export class HashJs implements Adapter {
    private sha256 = require("hash.js/lib/hash/sha/256");
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
    private Sha256 = (!isLegacy && require("@aws-crypto/sha256-js").Sha256);
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

    async hash(data: Uint8Array): Promise<string> {
        const digest = await crypto.subtle.digest("SHA-256", data);
        return arrayToHex(new Uint8Array(digest));
    }
}
