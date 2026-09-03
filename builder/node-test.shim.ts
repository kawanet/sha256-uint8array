// Browser-side resolution target for `node:test`, aliased in by the rollup
// test config. mocha installs its BDD globals on `globalThis` once
// `mocha.setup` has run in tests.html.

type Body = () => unknown
type TestContext = {skip: () => void}
type BodyTC = (t: TestContext) => unknown
type Suite = () => void
type Options = {timeout?: number}
type MochaThis = {timeout: (ms: number) => void, skip: () => void}

type ItFn = (name: string, fn: (this: MochaThis) => unknown) => void

const g = globalThis as unknown as {
    describe: (name: string, fn: Suite) => void
    it: ItFn & {skip: ItFn}
    before: (fn: Body) => void
    after: (fn: Body) => void
}

export const {describe, before, after} = g

type ItOverload = ((name: string, fn: BodyTC) => void) & ((name: string, opts: Options, fn: BodyTC) => void)

// The mocha callback takes no argument on purpose: mocha reads its arity
// and would switch to the done-callback style, never finishing the test.
const wrapIt = (itFn: ItFn): ItOverload => (...args: [string, BodyTC] | [string, Options, BodyTC]): void => {
    const [name] = args
    const opts = args.length === 3 ? args[1] : undefined
    const fn = args.length === 3 ? args[2] : args[1]
    itFn(name, function (this: MochaThis) {
        if (opts && "number" === typeof opts.timeout) {
            this.timeout(opts.timeout)
        }
        return fn({skip: () => this.skip()})
    })
}

export const it = wrapIt(g.it) as ItOverload & {skip: ItOverload}
it.skip = wrapIt(g.it.skip)
