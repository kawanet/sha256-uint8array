import alias from "@rollup/plugin-alias"
import commonjs from "@rollup/plugin-commonjs"
import inject from "@rollup/plugin-inject"
import json from "@rollup/plugin-json"
import multiEntry from "@rollup/plugin-multi-entry"
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import {fileURLToPath} from "node:url"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

const here = (path: string): string => fileURLToPath(new URL(path, import.meta.url))

const rollupConfig: RollupOptions = {
    input: "../test/*.test.ts",

    /**
     * browser/tests.html
     * browser/vendor/Makefile
     * test/utils/adapters.ts
     */
    external: [
        "jssha/dist/sha256",
        "sha.js/sha256.js",
    ],

    output: {
        file: "../browser/tests/bundled.js",
        format: "iife",
        globals: {
            "jssha/dist/sha256": "jssha_dist_sha256",
            "sha.js/sha256.js": "sha_js_sha256",
        }
    },

    treeshake: false,

    plugins: [
        // Everything the suites reach for that only exists on Node resolves
        // to a local stand-in here. The package itself resolves to the shim
        // that reads the global left behind by dist/*.min.js, so the browser
        // run exercises the published artifact rather than the sources.
        alias({
            entries: [
                {find: "node:test", replacement: here("./node-test.shim.ts")},
                {find: "node:assert", replacement: here("./node-assert.shim.ts")},
                {find: "node:crypto", replacement: here("./node-crypto.shim.ts")},
                {find: "create-hash/browser.js", replacement: here("./create-hash.shim.ts")},
                {find: "sha256-uint8array", replacement: here("../browser/import.js")},
            ],
        }),

        multiEntry(),

        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        // Several of the compared implementations ship as CommonJS, and one
        // of them carries a JSON data file.
        commonjs(),

        json(),

        sucrase({
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        // Globals cannot be aliased, so they are injected instead. This has
        // to run after sucrase: the plugin parses with acorn and would skip
        // any file that still carried TypeScript syntax.
        inject({
            Buffer: [here("./buffer.shim.ts"), "Buffer"],
            process: [here("./process.shim.ts"), "process"],
        }),

        showFiles(),
    ],
}

export default rollupConfig
