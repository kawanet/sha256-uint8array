import multiEntry from "@rollup/plugin-multi-entry"
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

// Bundles the test suites into a single plain-JS file that imports the
// package by name, so any supported Node.js runtime can run them against
// dist/ without needing type-strip.
const rollupConfig: RollupOptions = {
    input: "../test/*.test.ts",

    // Bare specifiers stay external; only relative paths are bundled.
    external: /^[^.\/]/,

    output: {
        file: "./tests/bundled.js",
        format: "esm",
    },

    treeshake: false,

    plugins: [
        multiEntry(),

        nodeResolve({
            preferBuiltins: false,
        }),

        sucrase({
            disableESTransforms: true,
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),
    ],
}

export default rollupConfig
