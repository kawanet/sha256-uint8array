/**
 * sha256-uint8array.ts
 */

// Self-reference via the package name so `tsc --noEmit` resolves these
// types through `package.json` `exports` — the same path an external
// consumer would take. If the `exports.types` mapping ever breaks,
// the build fails here.
import type * as types from "sha256-uint8array"

// first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311
const K = [
    0x428a2f98 | 0, 0x71374491 | 0, 0xb5c0fbcf | 0, 0xe9b5dba5 | 0,
    0x3956c25b | 0, 0x59f111f1 | 0, 0x923f82a4 | 0, 0xab1c5ed5 | 0,
    0xd807aa98 | 0, 0x12835b01 | 0, 0x243185be | 0, 0x550c7dc3 | 0,
    0x72be5d74 | 0, 0x80deb1fe | 0, 0x9bdc06a7 | 0, 0xc19bf174 | 0,
    0xe49b69c1 | 0, 0xefbe4786 | 0, 0x0fc19dc6 | 0, 0x240ca1cc | 0,
    0x2de92c6f | 0, 0x4a7484aa | 0, 0x5cb0a9dc | 0, 0x76f988da | 0,
    0x983e5152 | 0, 0xa831c66d | 0, 0xb00327c8 | 0, 0xbf597fc7 | 0,
    0xc6e00bf3 | 0, 0xd5a79147 | 0, 0x06ca6351 | 0, 0x14292967 | 0,
    0x27b70a85 | 0, 0x2e1b2138 | 0, 0x4d2c6dfc | 0, 0x53380d13 | 0,
    0x650a7354 | 0, 0x766a0abb | 0, 0x81c2c92e | 0, 0x92722c85 | 0,
    0xa2bfe8a1 | 0, 0xa81a664b | 0, 0xc24b8b70 | 0, 0xc76c51a3 | 0,
    0xd192e819 | 0, 0xd6990624 | 0, 0xf40e3585 | 0, 0x106aa070 | 0,
    0x19a4c116 | 0, 0x1e376c08 | 0, 0x2748774c | 0, 0x34b0bcb5 | 0,
    0x391c0cb3 | 0, 0x4ed8aa4a | 0, 0x5b9cca4f | 0, 0x682e6ff3 | 0,
    0x748f82ee | 0, 0x78a5636f | 0, 0x84c87814 | 0, 0x8cc70208 | 0,
    0x90befffa | 0, 0xa4506ceb | 0, 0xbef9a3f7 | 0, 0xc67178f2 | 0,
]

// Hash block/allocation sizes. Plain consts work as-is under Node's
// type-strip, and minifiers inline them as literals.
const N_inputBytes = 64
const N_inputWords = N_inputBytes / 4
const N_highIndex = N_inputWords - 2
const N_lowIndex = N_inputWords - 1
const N_workWords = 64
const N_allocBytes = 80
const N_allocWords = N_allocBytes / 4
const N_allocTotal = N_allocBytes * 100

const algorithms: {[algorithm: string]: number} = {
    sha256: 1,
}

export const createHash: typeof types.createHash = (algorithm?: string) => {
    if (algorithm && !algorithms[algorithm] && !algorithms[algorithm.toLowerCase()]) {
        throw new Error("Digest method not supported")
    }

    return new Hash()
}

export class Hash {
    // first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19
    private A = 0x6a09e667 | 0;
    private B = 0xbb67ae85 | 0;
    private C = 0x3c6ef372 | 0;
    private D = 0xa54ff53a | 0;
    private E = 0x510e527f | 0;
    private F = 0x9b05688c | 0;
    private G = 0x1f83d9ab | 0;
    private H = 0x5be0cd19 | 0;

    private _byte: Uint8Array;
    private _word: Int32Array;
    private _size = 0;
    private _sp = 0; // surrogate pair

    constructor() {
        if (!sharedBuffer || sharedOffset >= N_allocTotal) {
            sharedBuffer = new ArrayBuffer(N_allocTotal)
            sharedOffset = 0
        }

        this._byte = new Uint8Array(sharedBuffer, sharedOffset, N_allocBytes)
        this._word = new Int32Array(sharedBuffer, sharedOffset, N_allocWords)
        sharedOffset += N_allocBytes
    }

    update(data: string, encoding?: string): this;
    update(data: Uint8Array): this;
    update(data: ArrayBufferView): this;
    // The implementation already sorts these out at run time. Declaring
    // the union too lets a caller holding one hand it over directly,
    // instead of narrowing it back down to satisfy the overloads.
    update(data: string | Uint8Array | ArrayBufferView): this;

    update(data: string | Uint8Array | ArrayBufferView): this {
        // data: string
        if ("string" === typeof data) {
            return this._utf8(data)
        }

        // data: undefined
        if (data == null) {
            throw new TypeError("Invalid type: " + typeof data)
        }

        const byteOffset = data.byteOffset
        const length = data.byteLength
        let blocks = (length / N_inputBytes) | 0
        let offset = 0

        // longer than 1 block
        if (blocks && !(byteOffset & 3) && !(this._size % N_inputBytes)) {
            const block = new Int32Array(data.buffer, byteOffset, blocks * N_inputWords)
            while (blocks--) {
                this._int32(block, offset >> 2)
                offset += N_inputBytes
            }
            this._size += offset
        }

        // data: TypedArray | DataView
        const BYTES_PER_ELEMENT = (data as Uint8Array).BYTES_PER_ELEMENT
        if (BYTES_PER_ELEMENT !== 1 && data.buffer) {
            const rest = new Uint8Array(data.buffer, byteOffset + offset, length - offset)
            return this._uint8(rest)
        }

        // no more bytes
        if (offset === length) return this

        // data: Uint8Array | Int8Array
        return this._uint8(data as any, offset)
    }

    private _uint8(data: Uint8Array, offset?: number) {
        const {_byte, _word} = this
        const length = data.length
        offset = offset!! | 0

        while (offset < length) {
            const start = this._size % N_inputBytes
            let index = start

            while (offset < length && index < N_inputBytes) {
                _byte[index++] = data[offset++]
            }

            if (index >= N_inputBytes) {
                this._int32(_word)
            }

            this._size += index - start
        }

        return this
    }

    private _utf8(text: string): this {
        const {_byte, _word} = this
        const length = text.length
        let surrogate = this._sp

        for (let offset = 0; offset < length; ) {
            const start = this._size % N_inputBytes
            let index = start

            while (offset < length && index < N_inputBytes) {
                // Runs of ASCII land as whole words while the write stays
                // word-aligned: four code units fold into one int32 store,
                // replacing four byte stores and three loop trips. The
                // first non-ASCII unit falls through to the scalar path,
                // which may unalign the cursor until the next block.
                if (!(index & 3)) {
                    while (offset + 4 <= length && index + 4 <= N_inputBytes) {
                        const c0 = text.charCodeAt(offset)
                        if (c0 >= 0x80) break
                        const c1 = text.charCodeAt(offset + 1)
                        const c2 = text.charCodeAt(offset + 2)
                        const c3 = text.charCodeAt(offset + 3)
                        if ((c1 | c2 | c3) >= 0x80) break
                        _word[index >> 2] = pack32(c0, c1, c2, c3)
                        offset += 4
                        index += 4
                    }
                    if (offset >= length || index >= N_inputBytes) break
                }
                let code = text.charCodeAt(offset++) | 0
                if (code < 0x80) {
                    // ASCII characters
                    _byte[index++] = code
                } else if (code < 0x800) {
                    // 2 bytes
                    _byte[index++] = 0xC0 | (code >>> 6)
                    _byte[index++] = 0x80 | (code & 0x3F)
                } else if (code < 0xD800 || code > 0xDFFF) {
                    // 3 bytes
                    _byte[index++] = 0xE0 | (code >>> 12)
                    _byte[index++] = 0x80 | ((code >>> 6) & 0x3F)
                    _byte[index++] = 0x80 | (code & 0x3F)
                } else if (surrogate) {
                    // 4 bytes - surrogate pair
                    code = ((surrogate & 0x3FF) << 10) + (code & 0x3FF) + 0x10000
                    _byte[index++] = 0xF0 | (code >>> 18)
                    _byte[index++] = 0x80 | ((code >>> 12) & 0x3F)
                    _byte[index++] = 0x80 | ((code >>> 6) & 0x3F)
                    _byte[index++] = 0x80 | (code & 0x3F)
                    surrogate = 0
                } else {
                    surrogate = code
                }
            }

            if (index >= N_inputBytes) {
                this._int32(_word)
                _word[0] = _word[N_inputWords]
            }

            this._size += index - start
        }

        this._sp = surrogate
        return this
    }

    private _int32(data: Int32Array, offset?: number): void {
        let {A, B, C, D, E, F, G, H} = this
        let i = 0
        offset = offset!! | 0

        // The 64 rounds run as two loops so the round body carries no
        // per-round branch: the first 16 load input words, the rest
        // extend the schedule with direct in-bounds indices into W.
        // Rounds go in pairs: the second reads the first through fresh
        // bindings, halving the a..h state rotation assignments.
        for (i = 0; i < N_inputWords; i += 2) {
            const w0 = W[i] = swap32(data[offset++])
            const T1 = (H + sigma1(E) + ch(E, F, G) + K[i] + w0) | 0
            const T2 = (sigma0(A) + maj(A, B, C)) | 0
            const E1 = (D + T1) | 0
            const A1 = (T1 + T2) | 0
            const w1 = W[i + 1] = swap32(data[offset++])
            const T3 = (G + sigma1(E1) + ch(E1, E, F) + K[i + 1] + w1) | 0
            const T4 = (sigma0(A1) + maj(A1, A, B)) | 0
            H = F
            G = E
            F = E1
            E = (C + T3) | 0
            D = B
            C = A
            B = A1
            A = (T3 + T4) | 0
        }

        for (i = N_inputWords; i < N_workWords; i += 2) {
            const w0 = W[i] = (
                gamma1(W[i - 2]) +
                W[i - 7] +
                gamma0(W[i - 15]) +
                W[i - 16]
            ) | 0
            const T1 = (H + sigma1(E) + ch(E, F, G) + K[i] + w0) | 0
            const T2 = (sigma0(A) + maj(A, B, C)) | 0
            const E1 = (D + T1) | 0
            const A1 = (T1 + T2) | 0
            const w1 = W[i + 1] = (
                gamma1(W[i - 1]) +
                W[i - 6] +
                gamma0(W[i - 14]) +
                W[i - 15]
            ) | 0
            const T3 = (G + sigma1(E1) + ch(E1, E, F) + K[i + 1] + w1) | 0
            const T4 = (sigma0(A1) + maj(A1, A, B)) | 0
            H = F
            G = E
            F = E1
            E = (C + T3) | 0
            D = B
            C = A
            B = A1
            A = (T3 + T4) | 0
        }

        this.A = (A + this.A) | 0
        this.B = (B + this.B) | 0
        this.C = (C + this.C) | 0
        this.D = (D + this.D) | 0
        this.E = (E + this.E) | 0
        this.F = (F + this.F) | 0
        this.G = (G + this.G) | 0
        this.H = (H + this.H) | 0
    }

    digest(): Uint8Array;
    digest(encoding: string): string;
    digest(encoding?: string) {
        const {_byte, _word} = this
        let i = (this._size % N_inputBytes) | 0
        _byte[i++] = 0x80

        // pad 0 for current word
        while (i & 3) {
            _byte[i++] = 0
        }
        i >>= 2

        if (i > N_highIndex) {
            while (i < N_inputWords) {
                _word[i++] = 0
            }
            i = 0
            this._int32(_word)
        }

        // pad 0 for rest words
        while (i < N_inputWords) {
            _word[i++] = 0
        }

        // input size
        const bits64 = this._size * 8
        const low32 = (bits64 & 0xffffffff) >>> 0
        const high32 = (bits64 - low32) / 0x100000000
        if (high32) _word[N_highIndex] = swap32(high32)
        if (low32) _word[N_lowIndex] = swap32(low32)

        this._int32(_word)

        return (encoding === "hex") ? this._hex() : this._bin()
    }

    private _hex(): string {
        const {A, B, C, D, E, F, G, H} = this

        return hex32(A) + hex32(B) + hex32(C) + hex32(D) + hex32(E) + hex32(F) + hex32(G) + hex32(H)
    }

    private _bin(): Uint8Array {
        const {A, B, C, D, E, F, G, H, _byte, _word} = this

        _word[0] = swap32(A)
        _word[1] = swap32(B)
        _word[2] = swap32(C)
        _word[3] = swap32(D)
        _word[4] = swap32(E)
        _word[5] = swap32(F)
        _word[6] = swap32(G)
        _word[7] = swap32(H)

        return _byte.slice(0, 32)
    }
}

type NS = (num: number) => string
type NN = (num: number) => number
type N3N = (x: number, y: number, z: number) => number

// Full 64-word message schedule. The flat layout costs 192 bytes over
// a 16-word ring but frees the hot loop from masking every index.
const W = new Int32Array(N_workWords)

let sharedBuffer: ArrayBuffer
let sharedOffset: number = 0

// Two hex digits per byte value, built once at load. Concatenating four
// prebuilt pairs avoids Number#toString(16), which runs on the slower
// double path here because the int32 word is offset beyond 2^32 first.
const HEX: string[] = []
for (let i = 0; i < 256; i++) {
    HEX.push((i + 0x100).toString(16).substr(-2))
}

const hex32: NS = num => HEX[(num >>> 24)] + HEX[(num >>> 16) & 0xFF] + HEX[(num >>> 8) & 0xFF] + HEX[num & 0xFF]
const swapLE: NN = (c => (((c << 24) & 0xff000000) | ((c << 8) & 0xff0000) | ((c >> 8) & 0xff00) | ((c >> 24) & 0xff)))
const swapBE: NN = (c => c)
const swap32: NN = isBE() ? swapBE : swapLE

// Folds four ASCII bytes into one int32 in the platform's byte order,
// so a word store lays them out exactly as four byte stores would.
type N4N = (c0: number, c1: number, c2: number, c3: number) => number
const packLE: N4N = (c0, c1, c2, c3) => (c0 | (c1 << 8) | (c2 << 16) | (c3 << 24))
const packBE: N4N = (c0, c1, c2, c3) => ((c0 << 24) | (c1 << 16) | (c2 << 8) | c3)
const pack32: N4N = isBE() ? packBE : packLE

const ch: N3N = (x, y, z) => (z ^ (x & (y ^ z)))
const maj: N3N = (x, y, z) => ((x & y) | (z & (x | y)))

const sigma0: NN = x => ((x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10))
const sigma1: NN = x => ((x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7))
const gamma0: NN = x => ((x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3))
const gamma1: NN = x => ((x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ (x >>> 10))

function isBE(): boolean {
    const buf = new Uint8Array(new Uint16Array([0xFEFF]).buffer) // BOM
    return (buf[0] === 0xFE)
}
