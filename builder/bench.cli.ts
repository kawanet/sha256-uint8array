import * as A from "../test/utils/adapters.ts"
import {MAKURANOSOSHI, SAMPLE_JSON} from "../test/utils/sample-text.ts"

/**
 * Benchmark runner. Owns the measurement policy: performance.now(),
 * one untimed warm-up repeat, seeded counterbalanced adapter order,
 * a yielded tick between measurements, then median and MAD.
 * Emits one NDJSON line per cell, then a Markdown table.
 */

// Node reads environment variables; a browser reads location.search.
const param = (key: string, def: string): string => {
    if ("object" === typeof location) return new URLSearchParams(location.search).get(key) ?? def
    return process.env[key] ?? def
}

const REPEAT = +param("REPEAT", "10000")
const SETS = +param("SETS", "10")
const TARGET = param("TARGET", "")
const SHUFFLE_SEED = 0x53484132 // ASCII "SHA2"

// Garbage in, immediate stop: the caller chose the values.
if (!(Number.isInteger(REPEAT) && REPEAT > 0 && Number.isInteger(SETS) && SETS > 0)) {
    throw new Error(`invalid REPEAT=${param("REPEAT", "")} SETS=${param("SETS", "")}`)
}

const sleep = () => new Promise<void>(resolve => setTimeout(resolve, 0))
const stringToArray = (str: string) => Array.from(unescape(encodeURIComponent(str)), (c: string) => c.charCodeAt(0))
const round = (v: number) => Math.round(v * 10) / 10

const median = (a: number[]): number => {
    const s = [...a].sort((x, y) => x - y)
    const m = s.length >> 1
    return (s.length % 2) ? s[m]! : (s[m - 1]! + s[m]!) / 2
}

const mad = (a: number[], med: number): number => median(a.map(v => Math.abs(v - med)))

// A compact deterministic PRNG keeps the adapter order reproducible in
// every JavaScript runtime without adding a benchmark-only dependency.
const mulberry32 = (seed: number) => (): number => {
    let n = seed += 0x6D2B79F5
    n = Math.imul(n ^ n >>> 15, n | 1)
    n ^= n + Math.imul(n ^ n >>> 7, n | 61)
    return ((n ^ n >>> 14) >>> 0) / 0x100000000
}

const shuffle = <T>(source: readonly T[], random: () => number): T[] => {
    const values = [...source]
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        const value = values[i]!
        values[i] = values[j]!
        values[j] = value
    }
    return values
}

// The result lands both on stdout and, when present, in the page's
// <pre> so it can be copied on browsers without a console (iOS).
const out = (line: string): void => {
    if ("object" === typeof document) {
        const pre = document.getElementById("output")
        if (pre) pre.textContent += line + "\n"
    }
    console.log(line)
}

// Progress: one character per finished measurement. Node writes to
// stderr so stdout stays clean NDJSON; browsers append to the <pre>.
const tick = (chunk: string): void => {
    if ("object" === typeof document) {
        const pre = document.getElementById("output")
        if (pre) pre.textContent += chunk
    } else {
        process.stderr.write(chunk)
    }
}

interface Cell {
    name: string;
    input: "string" | "binary";
    impl: "sync" | "async";
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
        ["sha256-uint8array", new A.SHA256Uint8Array()],
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

    // TARGET picks modules by comma-separated substrings;
    // the default (empty) measures everything.
    const wants = TARGET.split(",").map(t => t.trim()).filter(Boolean)
    const picked = ADAPTERS.filter(([name]) => !wants.length || wants.some(t => name.includes(t)))

    if (wants.length && picked.length === 0) {
        throw new Error(`TARGET matched nothing: ${TARGET}`)
    }

    // Two inputs only. An adapter benches the patterns it supports:
    // the sync implementation when it has one, otherwise the async one
    // in the same rotation, and a cell-less adapter is simply skipped.
    const cells: Cell[] = []
    for (const [name, adapter] of picked) {
        const s = adapter.makeStringBench(stringPairs)
        if (s) cells.push({name, input: "string", impl: "sync", fn: s, times: []})
        const b = adapter.makeBinaryBench(binaryPairs)
        const a = b ? null : adapter.makeBinaryBenchAsync(binaryPairs)
        if (b) cells.push({name, input: "binary", impl: "sync", fn: b, times: []})
        else if (a) cells.push({name, input: "binary", impl: "async", fn: a, times: []})
    }

    const env = ("object" === typeof process && process.version) ? `node ${process.version}` : navigator.userAgent
    out(`# ${env} REPEAT=${REPEAT} SETS=${SETS} TARGET=${TARGET || "(all)"}`)

    const random = mulberry32(SHUFFLE_SEED)

    for (const input of ["string", "binary"] as const) {
        const group = cells.filter(cell => cell.input === input)
        if (!group.length) continue
        tick(`# ${input} `)
        // Each seeded shuffle is immediately followed by its reverse. Every
        // adapter therefore has the same mean position within a complete
        // pair, cancelling linear drift while varying neighbours per pair.
        // An odd final set remains a reproducible unpaired shuffle.
        for (let set = 0; set < SETS; set += 2) {
            const order = shuffle(group, random)
            const pair = (set + 1 < SETS) ? [order, [...order].reverse()] : [order]
            for (const cellsInSet of pair) {
                for (const cell of cellsInSet) {
                    await cell.fn(1)
                    const start = performance.now()
                    await cell.fn(REPEAT)
                    cell.times.push(performance.now() - start)
                    tick("o")
                    await sleep()
                }
            }
        }
        tick("\n")
    }

    for (const cell of cells) {
        const med = median(cell.times)
        out(JSON.stringify({
            name: cell.name,
            input: cell.input,
            impl: cell.impl,
            repeat: REPEAT,
            sets: cell.times.map(round),
            median: round(med),
            mad: round(mad(cell.times, med)),
        }))
    }

    // README-shaped summary: string and U8A columns. The fastest and
    // second-fastest cell per column take the medals.
    const value = (name: string, input: Cell["input"]): number | null => {
        const cell = cells.find(c => c.name === name && c.input === input)
        return cell ? median(cell.times) : null
    }
    const rows = picked.map(([name, adapter]) => ({
        name,
        adapter,
        string: value(name, "string"),
        u8a: value(name, "binary"),
    }))
    // ⁎₁ = excluded from the bench on this platform (noBench);
    // ▫️ = the library does not take this input shape at all.
    let noteShape = false
    let noteBench = false
    const format = (row: (typeof rows)[number], col: "string" | "u8a"): string => {
        const v = row[col]
        if (v == null) {
            if (row.adapter.noBench) {
                noteBench = true
                return "⁎₁"
            }
            noteShape = true
            return "▫️"
        }
        const sorted = rows.map(r => r[col]).filter(x => x != null).sort((x, y) => x - y)
        const medal = (v === sorted[0]) ? " 🥇" : (v === sorted[1]) ? " 🥈" : ""
        return `${Math.round(v)}ms${medal}`
    }
    out(`|module|string|U8A|`)
    out(`|---|---|---|`)
    for (const row of rows) {
        out(`|${row.name}|${format(row, "string")}|${format(row, "u8a")}|`)
    }

    // Legend for whichever markers the table actually used.
    const legend = [
        noteShape && "▫️ input shape not supported",
        noteBench && "⁎₁ not benched on this platform",
    ].filter(Boolean).join(" / ")
    if (legend) {
        out("")
        out(legend)
    }
}

main().catch(err => {
    out(String(err))
    if ("object" === typeof process) process.exitCode = 1
})
