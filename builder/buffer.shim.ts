// Browser-side stand-in for the `Buffer` global, injected by the rollup test
// config. The suites feed Buffer input to the digest to cover that path, and
// a byte view is all the digest needs, so only `from` is provided — this is
// not a Buffer polyfill. Libraries that want the real thing import it from
// their own dependency rather than the global, and are left alone.

export const Buffer = {
    from(value: string | ArrayLike<number>): Uint8Array {
        return "string" === typeof value ? new TextEncoder().encode(value) : Uint8Array.from(value)
    },
}
