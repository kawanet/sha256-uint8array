import * as A from "../test/utils/adapters.ts"
import {MAKURANOSOSHI, SAMPLE_JSON} from "../test/utils/sample-text.ts"

/**
 * Benchmark runner. Owns the measurement policy: performance.now(),
 * one discarded warm-up set, round-robin between adapters per set,
 * a yielded tick between measurements, then median and MAD.
 * Emits one NDJSON line per cell, then a Markdown table.
 */

const SELF = "sha256-uint8array"

// Node reads environment variables; a browser reads location.search.
const param = (key: string, def: string): string => {
    if ("object" === typeof location) return new URLSearchParams(location.search).get(key) ?? def
    return process.env[key] ?? def
}

const REPEAT = +param("REPEAT", "10000")
const SETS = +param("SETS", "5")
const ONLY = param("ONLY", "")

const sleep = () => new Promise<void>(resolve => setTimeout(resolve, 0))
const stringToArray = (str: string) => Array.from(unescape(encodeURIComponent(str)), (c: string) => c.charCodeAt(0))
const round = (v: number) => Math.round(v * 10) / 10

const median = (a: number[]): number => {
    const s = [...a].sort((x, y) => x - y)
    const m = s.length >> 1
    return (s.length % 2) ? s[m]! : (s[m - 1]! + s[m]!) / 2
}

const mad = (a: number[], med: number): number => median(a.map(v => Math.abs(v - med)))

// The result lands both on stdout and, when present, in the page's
// <pre> so it can be copied on browsers without a console (iOS).
const out = (line: string): void => {
    if ("object" === typeof document) {
        const pre = document.getElementById("output")
        if (pre) pre.textContent += line + "\n"
    }
    console.log(line)
}

interface Cell {
    name: string;
    input: "string" | "binary" | "async";
    fn: (n: number) => (void | Promise<void>);
    times: number[];
}

async function main(): Promise<void> {
    const expectJSON = (new A.Crypto()).hash(SAMPLE_JSON)
    const expectUTF8 = (new A.Crypto()).hash(MAKURANOSOSHI)

    const stringPairs: A.BenchPair<string>[] = [
        {data: SAMPLE_JSON, expect: expectJSON},
        {data: MAKURANOSOSHI, expect: expectUTF8},
    ]

    const binaryPairs: A.BenchPair<Uint8Array<ArrayBuffer>>[] = [
        {data: new Uint8Array(stringToArray(SAMPLE_JSON)), expect: expectJSON},
        {data: new Uint8Array(stringToArray(MAKURANOSOSHI)), expect: expectUTF8},
    ]

    const ADAPTERS: Array<[string, A.Adapter]> = [
        ["crypto", new A.Crypto()],
        [SELF, new A.SHA256Uint8Array()],
        ["crypto-js", new A.CryptoJs()],
        ["jssha", new A.JsSHA()],
        ["hash.js", new A.HashJs()],
        ["sha.js", new A.ShaJS()],
        ["@noble/hashes", new A.Noble()],
        ["node-forge", new A.NodeForge()],
        ["fast-sha256", new A.FastSha256()],
        ["js-sha256", new A.JsSha256()],
        ["@aws-crypto/sha256-js", new A.AwsCrypto()],
        ["crypto.subtle.digest()", new A.SubtleCrypto()],
    ]

    const picked = ADAPTERS.filter(([name]) => !ONLY || (ONLY === "self" ? name === SELF : name.includes(ONLY)))

    const cells: Cell[] = []
    for (const [name, adapter] of picked) {
        const s = adapter.makeStringBench(stringPairs)
        if (s) cells.push({name, input: "string", fn: s, times: []})
        const b = adapter.makeBinaryBench(binaryPairs)
        if (b) cells.push({name, input: "binary", fn: b, times: []})
        const a = adapter.makeAsyncBench(binaryPairs)
        if (a) cells.push({name, input: "async", fn: a, times: []})
    }

    const env = ("object" === typeof process && process.version) ? `node ${process.version}` : navigator.userAgent
    out(`# ${env} REPEAT=${REPEAT} SETS=${SETS}`)

    for (const input of ["string", "binary", "async"] as const) {
        const group = cells.filter(cell => cell.input === input)
        // set 0 warms the JIT up and is discarded; adapters take turns
        // within each set so slow drift hits all of them equally.
        for (let set = 0; set <= SETS; set++) {
            for (const cell of group) {
                const start = performance.now()
                await cell.fn(REPEAT)
                const ms = performance.now() - start
                if (set > 0) cell.times.push(ms)
                await sleep()
            }
        }
    }

    for (const cell of cells) {
        const med = median(cell.times)
        out(JSON.stringify({
            name: cell.name,
            input: cell.input,
            repeat: REPEAT,
            sets: cell.times.map(round),
            median: round(med),
            mad: round(mad(cell.times, med)),
        }))
    }

    // README-shaped summary: string and U8A columns, with the async
    // (crypto.subtle) result standing in the U8A column of its row.
    const ms = (name: string, input: Cell["input"]): string => {
        const cell = cells.find(c => c.name === name && c.input === input)
        return cell ? `${Math.round(median(cell.times))}ms` : "N/A"
    }
    out(`|module|string|U8A|`)
    out(`|---|---|---|`)
    for (const [name] of picked) {
        const u8a = cells.some(c => c.name === name && c.input === "binary") ? ms(name, "binary") : ms(name, "async")
        out(`|${name}|${ms(name, "string")}|${u8a}|`)
    }
}

main().catch(err => {
    out(String(err))
    if ("object" === typeof process) process.exitCode = 1
})
