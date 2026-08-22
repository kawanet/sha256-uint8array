const MIN_PROBE_OPS = 1000
const PROBE_OPS_PER_MS = 10 // 10K ops / 100ms, divided by ten
const MAX_OPS = 1_000_000_000

type Measure = (repeat: number) => number | Promise<number>

const repeatForOps = (ops: number, opsPerRepeat: number): number => {
    const repeat = Math.max(1, Math.round(ops / opsPerRepeat))
    if (!Number.isSafeInteger(repeat) || repeat * opsPerRepeat > MAX_OPS) {
        throw new Error(`calibration exceeds ${MAX_OPS} ops`)
    }
    return repeat
}

const elapsedOrThrow = (elapsed: number): number => {
    if (elapsed === 0) {
        throw new Error(`calibration timer did not advance; increase DURATION`)
    }
    if (!(Number.isFinite(elapsed) && elapsed > 0)) {
        throw new Error(`invalid calibration elapsed=${elapsed}`)
    }
    return elapsed
}

const projectRepeat = (repeat: number, elapsed: number, opsPerRepeat: number, duration: number): number => {
    const ops = repeat * opsPerRepeat * duration / elapsed
    return repeatForOps(ops, opsPerRepeat)
}

/**
 * Uses one small probe and one target-sized validation run. The second
 * projection absorbs cold-start and JIT effects without turning DURATION
 * into a minimum that every measured set must overshoot.
 */
export async function calibrateRepeat(opsPerRepeat: number, duration: number, measure: Measure): Promise<number> {
    if (!(Number.isInteger(opsPerRepeat) && opsPerRepeat > 0)) {
        throw new Error(`invalid opsPerRepeat=${opsPerRepeat}`)
    }
    if (!(Number.isFinite(duration) && duration > 0)) {
        throw new Error(`invalid DURATION=${duration}`)
    }

    const probeOps = Math.max(MIN_PROBE_OPS, duration * PROBE_OPS_PER_MS)
    let repeat = repeatForOps(probeOps, opsPerRepeat)
    let elapsed = await measure(repeat)

    // The retry is target-sized under the probe's baseline assumption.
    if (elapsed === 0) {
        repeat = repeatForOps(probeOps * 10, opsPerRepeat)
        elapsed = await measure(repeat)
    }

    repeat = projectRepeat(repeat, elapsedOrThrow(elapsed), opsPerRepeat, duration)
    elapsed = await measure(repeat)
    return projectRepeat(repeat, elapsedOrThrow(elapsed), opsPerRepeat, duration)
}
