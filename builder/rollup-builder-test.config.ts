import alias from "@rollup/plugin-alias"
import multiEntry from "@rollup/plugin-multi-entry"
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: ["../test/*.test.ts", "!../test/80.*", "!../test/99.*"],

    // Bare specifiers stay external; only relative paths are bundled.
    external: v => /^[^./]/.test(v) && (v !== "multi-entry.js"),

    output: {
        file: "./tests/bundled.mjs",
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
