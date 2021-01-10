/**
 * An interface which has digest() method
 */

export interface Adapter {
    hash(str: string): string;
}

/**
 * https://github.com/kawanet/sha256-uint8array
 */

export class SHA256Uint8Array implements Adapter {
    private createHash = require("../../lib/sha256-uint8array").createHash;

    // private createHash = require("../../dist/sha256-uint8array.min").createHash;

    hash(str: string): string {
        return this.createHash("sha256").update(str).digest("hex");
    }
}

/**
 * https://nodejs.org/api/crypto.html
 */

export class Crypto implements Adapter {
    private crypto = require("crypto");

    hash(str: string): string {
        return this.crypto.createHash("sha256").update(str).digest("hex");
    }
}

/**
 * https://www.npmjs.com/package/create-hash
 */

export class CreateHash implements Adapter {
    private createHash = require("create-hash/browser");

    hash(str: string): string {
        return this.createHash("sha256").update(str).digest("hex");
    }
}

/**
 * https://www.npmjs.com/package/crypto-js
 */

export class CryptoJs implements Adapter {
    private SHA256 = require("crypto-js/sha256");

    hash(str: string): string {
        return this.SHA256(str).toString();
    }
}

/**
 * https://www.npmjs.com/package/jshashes
 */

export class JsHashes implements Adapter {
    private Hashes = require("jshashes");

    hash(str: string): string {
        return new this.Hashes.SHA256().hex(str);
    }
}

/**
 * https://www.npmjs.com/package/jssha
 */

export class JsSHA implements Adapter {
    private sha256 = require("jssha/dist/sha256");

    hash(str: string): string {
        const shaObj = new this.sha256("SHA-256", "TEXT");
        shaObj.update(str);
        return shaObj.getHash("HEX");
    }
}

/**
 * https://www.npmjs.com/package/sha.js
 */

export class ShaJS implements Adapter {
    private sha256 = require("sha.js/sha256");

    hash(str: string): string {
        return new this.sha256().update(str).digest("hex");
    }
}
