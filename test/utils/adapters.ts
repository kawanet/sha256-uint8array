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
import {strict as assert} from "node:assert"
import * as nodeCrypto from "node:crypto"
import {pathToFileURL} from "node:url"
import shaJs from "sha.js/sha256.js"
import {createHash as ownCreateHash} from "../../lib/sha256-uint8array.ts"
import {arrayToHex} from "./utils.ts"

export interface BenchPair<T> {
    data: T;
    expect: string;
}

/**
 * Base class for the adapters below: each subclass provides hash(), and
 * inherits the benchmark closure factories shared by the test suite and
 * the benchmark runner.
 */
export abstract class Adapter {
    // declare: type-only, so no own field shadows the subclass initializers
    declare noString?: boolean;
    declare noBinary?: boolean;
    declare noDataView?: boolean;
    declare noAsync?: boolean;
    declare noBench?: boolean;

    // An adapter that has to load something before its first hash()
    // overrides this. The runner awaits it once, before any measuring,
    // so a module load never lands inside a timed window.
    async setup(): Promise<void> {
    }

    hash(_data: string | Uint8Array | ArrayBufferView): string {
        throw new Error("hash() not supported")
    }

    hashAsync(_data: Uint8Array<ArrayBuffer>): Promise<string> {
        throw new Error("hashAsync() not supported")
    }

    // Each call builds a fresh closure per adapter, so the hot loop's
    // hash() call site keeps its own feedback vector and stays
    // monomorphic; a loop shared on the prototype would go megamorphic
    // and skew the comparison between adapters.
    makeStringBench(pairs: BenchPair<string>[]): ((n: number) => void) | null {
        if (this.noBench || this.noString) return null
        return (n) => {
            for (let i = 0; i < n; i++) {
                for (const p of pairs) assert.equal(this.hash(p.data), p.expect)
            }
        }
    }

    makeBinaryBench(pairs: BenchPair<Uint8Array>[]): ((n: number) => void) | null {
        if (this.noBench || this.noBinary) return null
        return (n) => {
            for (let i = 0; i < n; i++) {
                for (const p of pairs) assert.equal(this.hash(p.data), p.expect)
            }
        }
    }

    // The async implementation of the binary input; only Promise-based
    // adapters override this. The default states there is none.
    makeBinaryBenchAsync(_pairs: BenchPair<Uint8Array<ArrayBuffer>>[]): ((n: number) => Promise<void>) | null {
        return null
    }
}

const isBrowser = ("undefined" !== typeof window)
const isLegacy = ("function" !== typeof TextEncoder)
const hasSubtle = ("undefined" !== typeof crypto) && crypto.subtle && ("function" === typeof crypto.subtle.digest)

/**
 * https://github.com/kawanet/sha256-uint8array
 */

export class SHA256Uint8Array extends Adapter {
    private createHash = ownCreateHash;

    hash(data: string | Uint8Array | ArrayBufferView): string {
        const hash = this.createHash()
        hash.update(data)
        return hash.digest("hex")
    }
}

/**
 * https://nodejs.org/api/crypto.html
 */

export class Crypto extends Adapter {
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

export class CryptoJs extends Adapter {
    private CryptoJS = cryptoJs;
    noBinary = true;

    hash(data: string): string {
        return this.CryptoJS.SHA256(data).toString()
    }
}

/**
 * https://www.npmjs.com/package/jssha
 */

export class JsSHA extends Adapter {
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

export class ShaJS extends Adapter {
    private sha256 = shaJs;
    noDataView = true;

    hash(data: string | Uint8Array): string {
        return new this.sha256().update(data).digest("hex")
    }
}

/**
 * https://github.com/indutny/hash.js
 */

export class HashJs extends Adapter {
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

export class AwsCrypto extends Adapter {
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

export class Noble extends Adapter {
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

export class NodeForge extends Adapter {
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

export class FastSha256 extends Adapter {
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

export class JsSha256 extends Adapter {
    // On Node.js it delegates to the native crypto module, so benching
    // it there would measure native code, not this library's JavaScript.
    // The compat suite still verifies correctness on both platforms.
    noBench = !isBrowser;
    private sha256 = jsSha256;
    noDataView = true;

    hash(data: string | Uint8Array): string {
        return this.sha256(data)
    }
}

/**
 * A module named on the command line rather than a package this file
 * knows about. It exists to compare builds of this package with each
 * other — a published dist/, a branch build, the working tree — where
 * every cell runs the same implementation and only the code differs,
 * so the numbers answer "did this change help?" directly.
 *
 * Note: it expects the createHash() entry point this package documents,
 * so it is not a general adapter for arbitrary modules.
 */

export class DynamicModule extends Adapter {
    private readonly path: string;
    private loaded: typeof ownCreateHash | null = null;

    constructor(path: string) {
        super()
        this.path = path
    }

    override async setup(): Promise<void> {
        const module = await import(pathToFileURL(this.path).href)
        if ("function" !== typeof module.createHash) {
            throw new Error(`${this.path}: no createHash export`)
        }
        this.loaded = module.createHash
    }

    hash(data: string | Uint8Array | ArrayBufferView): string {
        const createHash = this.loaded
        if (!createHash) throw new Error(`${this.path}: setup() not awaited`)
        const hash = createHash()
        if ("string" === typeof data) {
            hash.update(data) // same call either way: update() is overloaded, not union-typed
        } else {
            hash.update(data)
        }
        return hash.digest("hex")
    }
}

/**
 * https://developer.mozilla.org/docs/Web/API/SubtleCrypto
 */

export class SubtleCrypto extends Adapter {
    // Both sync shapes stay opted out: this adapter only exists as the
    // async interface, gated by its own flag below.
    noString = true;
    noBinary = true;
    noAsync = !hasSubtle;

    async hashAsync(data: Uint8Array<ArrayBuffer>): Promise<string> {
        const digest = await crypto.subtle.digest("SHA-256", data)
        return arrayToHex(new Uint8Array(digest))
    }

    makeBinaryBenchAsync(pairs: BenchPair<Uint8Array<ArrayBuffer>>[]): ((n: number) => Promise<void>) | null {
        if (this.noBench || this.noAsync) return null
        return async (n) => {
            for (let i = 0; i < n; i++) {
                for (const p of pairs) assert.equal(await this.hashAsync(p.data), p.expect)
            }
        }
    }
}
