import test from "node:test";
import assert from "node:assert/strict";
import { simulationSteps } from "../src/simulation-time.js";

test("slow frames advance bounded real time using safe physics substeps", () => {
  for (const ms of [16, 100, 900, 1500, 10000]) {
    const steps = simulationSteps(ms);
    assert.ok(steps.every(step => step > 0 && step <= .05 + 1e-12));
    assert.ok(Math.abs(steps.reduce((a, b) => a + b, 0) - Math.min(ms / 1000, 1.5)) < 1e-10);
  }
  assert.deepEqual(simulationSteps(0), []);
  assert.deepEqual(simulationSteps(NaN), []);
});
