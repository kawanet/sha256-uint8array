// Browser-side resolution target for `node:test`, aliased in by the rollup
// test config. mocha installs its BDD globals on `globalThis` once
// `mocha.setup` has run in tests.html, so the suite functions pass straight
// through. `it` is wrapped because node:test hands the test a context object
// as its first argument, and a mocha callback that declares an argument would
// be treated as the done-callback style instead.

type Body = (t: TestContext) => unknown
type Suite = () => void
type MochaThis = {skip: () => void}
type TestContext = {skip: () => void, diagnostic: (message: string) => void}
type ItFn = (name: string, fn: () => unknown) => void

const g = globalThis as unknown as {
    describe: (name: string, fn: Suite) => void
    it: ItFn & {skip: ItFn}
    before: (fn: () => unknown) => void
    after: (fn: () => unknown) => void
}

export const {describe, before, after} = g

const wrap = (register: ItFn) => (name: string, fn: Body): void => {
    register(name, function (this: MochaThis) {
        return fn({skip: () => this.skip(), diagnostic: () => undefined})
    })
}

export const it = wrap(g.it) as ((name: string, fn: Body) => void) & {skip: (name: string, fn: Body) => void}

// Suites also declare permanently skipped cases. Without this the call throws
// while mocha is still building the suite, which drops every declaration after
// it without failing anything. mocha never runs a skipped body, so the context
// wrapper is not needed here.
it.skip = g.it.skip as unknown as (name: string, fn: Body) => void
