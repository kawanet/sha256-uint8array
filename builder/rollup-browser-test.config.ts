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
    input: ["../test/*.test.ts"],

    // Bare specifiers stay external; only relative paths are bundled.
    external: v => /^[^./]/.test(v) && (v !== "multi-entry.js"),

    output: {
        file: "../browser/tests/bundled.mjs",
        format: "esm",
    },

    treeshake: false,

    plugins: [
        alias({
            entries: [
                {find: /^(\.\.\/)+lib\/sha256-uint8array\.ts$/, replacement: "sha256-uint8array"},
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
            disableESTransforms: true,
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
