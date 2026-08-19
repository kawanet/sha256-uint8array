import {builtinModules} from "node:module"

// This package ships no runtime dependencies, so the list is Node
// builtins plus the package's own name, which keeps a self-reference
// import external instead of inlining a second copy of the source.
// Both the bare and `node:` prefixed spellings are covered so the
// result does not depend on which form a source file happens to use.
const externals = new Set<string>([
    ...builtinModules,
    ...builtinModules.map(m => `node:${m}`),
    "sha256-uint8array",
])

export const isExternal = (id: string): boolean => externals.has(id)
