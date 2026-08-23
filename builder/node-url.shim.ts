// Browser stand-in for `node:url`, aliased in by the rollup configs.
// Only the CLI-only dynamic adapter reaches for it, so nothing here is
// ever meant to run; it exists to keep the browser bundle self-contained.

export const pathToFileURL = (): never => {
    throw new Error("pathToFileURL() not supported")
}
