import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import terser from "@rollup/plugin-terser"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../lib/sha256-uint8array.ts",

    output: {
        file: "../dist/sha256-uint8array.min.js",
        format: "iife",
        // The package exposes named exports rather than a single callable,
        // so the global stays a namespace object and browser callers reach
        // the API as `SHA256.createHash(...)` — the historical contract.
        name: "SHA256",
        exports: "named",
        // The same file is also require()-d from CommonJS, where it has
        // always resolved to the named exports. Assign inside the IIFE so
        // rollup's injected `exports` object is in scope; in a browser the
        // gate is false and the line does nothing.
        outro: "if (typeof module !== 'undefined') { module.exports = exports }",
    },

    plugins: [
        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        sucrase({
            disableESTransforms: true,
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),

        terser({
            compress: true,
            ecma: 2020,
            // Private state is `_`-prefixed by convention; mangling it was
            // part of how earlier builds stayed small, so keep doing it.
            mangle: {properties: {regex: /^_/}},
        }),
    ],
}

export default rollupConfig
