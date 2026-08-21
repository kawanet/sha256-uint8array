import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../lib/sha256-uint8array.ts",

    output: {
        file: "../dist/sha256-uint8array.mjs",
        format: "esm",
    },

    external: /^[^.\/]/,

    plugins: [
        nodeResolve({
            preferBuiltins: true,
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
