import {strict as assert} from "node:assert"
import {describe, it} from "node:test"

import {calibrateRepeat} from "../builder/bench-calibrate.ts"

const TITLE = "98.calibration.test.ts"

describe(TITLE, () => {
    it("uses two proportional projections", async () => {
        const calls: number[] = []
        const repeat = await calibrateRepeat(2, 500, (n) => {
            calls.push(n)
            return calls.length === 1 ? 10 : 625
        })

        assert.equal(calls.join(","), "500,25000")
        assert.equal(repeat, 20000)
    })

    it("retries a zero-duration probe with ten times the ops", async () => {
        const calls: number[] = []
        const repeat = await calibrateRepeat(2, 500, (n) => {
            calls.push(n)
            if (calls.length === 1) return 0
            return n * 2 / 100
        })

        assert.equal(calls.join(","), "500,5000,25000")
        assert.equal(repeat, 25000)
    })

    it("rejects a timer that remains at zero", async () => {
        let error: unknown
        try {
            await calibrateRepeat(2, 500, () => 0)
        } catch (err) {
            error = err
        }

        assert.ok(error instanceof Error)
        assert.ok(/elapsed=0/.test(error.message))
    })

    it("rejects a projected ops count over the safety limit", async () => {
        let error: unknown
        try {
            await calibrateRepeat(2, 500, () => 0.0001)
        } catch (err) {
            error = err
        }

        assert.ok(error instanceof Error)
        assert.ok(/exceeds 1000000000 ops/.test(error.message))
    })
})
