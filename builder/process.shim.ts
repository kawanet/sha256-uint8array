// Browser-side stand-in for the `process` global, injected by the rollup test
// config. The benchmark reads an environment variable to size its run; leaving
// it empty lets the browser fall back to the default it already defines.

export const process = {env: {} as Record<string, string | undefined>}
