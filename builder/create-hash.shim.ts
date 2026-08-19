// Browser-side resolution target for `create-hash`, aliased in by the rollup
// test config. That package is a Node crypto shim rather than a browser
// implementation, so it is left out of the browser comparison and its adapter
// is disabled there; nothing should reach this.

const createHash = (): never => {
    throw new Error("create-hash is not part of the browser bundle")
}

export default createHash
