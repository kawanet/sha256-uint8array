// Browser-side stand-in for `node:crypto`, aliased in by the rollup test
// config. The suites use it as an independent reference to check this
// package's digests against, so it needs matching results rather than
// speed — and it is not a general crypto polyfill.
//
// hash.js backs it: the benchmark already bundles that library, it is
// plain JavaScript, and it never reaches for Buffer.
import sha256 from "hash.js/lib/hash/sha/256.js"

type Digest = {update: (data: string | ArrayLike<number>) => Digest, digest: (encoding?: string) => string | Uint8Array}

const supported: Record<string, 1> = {sha256: 1}

export const createHash = (algorithm?: string): Digest => {
    // Mirrors the algorithm-name handling the suites assert against.
    if (!algorithm || !supported[String(algorithm).toLowerCase()]) {
        throw new Error("Digest method not supported")
    }

    const hash = sha256()

    const self: Digest = {
        update(data) {
            hash.update("string" === typeof data ? data : Array.from(data))
            return self
        },
        digest(encoding) {
            const out: number[] = hash.digest()
            if (encoding === "hex") return out.map(b => (b | 0x100).toString(16).substr(-2)).join("")
            return new Uint8Array(out)
        },
    }

    return self
}
