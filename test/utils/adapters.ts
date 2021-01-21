/**
 * An interface which has digest() method
 */

export interface Adapter {
    hash(data: string | Uint8Array): string;
}

export interface AsyncAdapter {
    hash(data: string | Uint8Array): Promise<string>;
}

const isBrowser = ("undefined" !== typeof window);

/**
 * https://github.com/kawanet/sha256-uint8array
 */

export class SHA256Uint8Array implements Adapter {
    private createHash = isBrowser
        ? require("../../dist/sha256-uint8array.min").createHash
        : require("../../lib/sha256-uint8array").createHash;

    hash(data: string | Uint8Array): string {
        return this.createHash().update(data).digest("hex");
    }
}

/**
 * https://nodejs.org/api/crypto.html
 */

export class Crypto implements Adapter {
    private crypto = require("crypto");

    hash(data: string | Uint8Array): string {
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

    hash(data: string | Uint8Array): string {
        return this.createHash("sha256").update(data).digest("hex");
    }
}

/**
 * https://www.npmjs.com/package/crypto-js
 */

export class CryptoJs implements Adapter {
    private CryptoJS = require("crypto-js");

    hash(data: string | Uint8Array): string {
        if ("string" !== typeof data) throw new TypeError("Type not supported: " + typeof data);
        return this.CryptoJS.SHA256(data).toString();
    }
}

/**
 * https://www.npmjs.com/package/jshashes
 */

export class JsHashes implements Adapter {
    private Hashes = require("jshashes");

    hash(data: string | Uint8Array): string {
        if ("string" !== typeof data) throw new TypeError("Type not supported: " + typeof data);
        return new this.Hashes.SHA256().hex(data);
    }
}

/**
 * https://www.npmjs.com/package/jssha
 */

export class JsSHA implements Adapter {
    private sha256 = require("jssha/dist/sha256");

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

    hash(data: string | Uint8Array): string {
        return new this.sha256().update(data).digest("hex");
    }
}

/**
 * https://github.com/indutny/hash.js
 */

export class HashJs implements Adapter {
    private sha256 = require("hash.js/lib/hash/sha/256");

    hash(data: string | Uint8Array): string {
        return this.sha256().update(data).digest('hex');
    }
}

/**
 * https://developer.mozilla.org/docs/Web/API/SubtleCrypto
 */

export class SubtleCrypto implements AsyncAdapter {
    static available = ("undefined" !== typeof crypto) && crypto.subtle && ("function" === typeof crypto.subtle.digest);

    async hash(data: string | Uint8Array): Promise<string> {
        if ("string" === typeof data) throw new TypeError("Type not supported: " + typeof data);
        const digest = await crypto.subtle.digest("SHA-256", data);
        return arrayBufferToHex(digest);
    }
}

function arrayBufferToHex(data: ArrayBuffer): string {
    const length = data.byteLength;
    const uint8 = new Uint8Array(data);
    let hex = "";
    for (let i = 0; i < length; i++) {
        hex += (uint8[i] | 0x100).toString(16).substr(-2);
    }
    return hex;
}