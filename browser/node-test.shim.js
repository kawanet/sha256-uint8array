/* globals describe, it, before, after */

// Browser-side stand-in for `node:test`, swapped in when the test bundle
// is built. mocha installs the BDD globals on `globalThis` once
// `mocha.setup` has run in tests.html, so the suite functions pass
// straight through. `it` is wrapped because node:test hands the test a
// context object as its first argument, which mocha does not provide,
// and because a mocha callback taking an argument would be treated as
// the done-callback style.

exports.describe = describe;
exports.before = before;
exports.after = after;

exports.it = function (name, fn) {
    it(name, function () {
        const ctx = {
            skip: () => this.skip(),
            diagnostic: () => undefined,
        };
        return fn(ctx);
    });
};
