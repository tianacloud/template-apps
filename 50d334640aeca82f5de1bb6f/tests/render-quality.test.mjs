import test from "node:test";
import assert from "node:assert/strict";
import { createRenderQuality } from "../src/render-quality.js";

test("resolution adapts only to sustained slow frames and can recover", () => {
  const quality = createRenderQuality(1.5);
  for (let i = 0; i < 4; i++) assert.equal(quality.sample(150), false);
  assert.equal(quality.ratio, 1.5);
  assert.equal(quality.sample(150), true);
  assert.equal(quality.ratio, 1.125);
  for (let i = 0; i < 5; i++) quality.sample(150);
  assert.equal(quality.ratio, .75);
  for (let i = 0; i < 20; i++) assert.equal(quality.sample(150), false);
  for (let i = 0; i < 179; i++) assert.equal(quality.sample(16), false);
  assert.equal(quality.sample(16), true);
  assert.equal(quality.ratio, 1.125);
});

test("pauses and intermittent slow frames do not force downscaling", () => {
  const quality = createRenderQuality(1);
  for (let i = 0; i < 20; i++) { quality.sample(160); quality.sample(60); }
  for (let i = 0; i < 4; i++) quality.sample(200);
  quality.resetSamples();
  assert.equal(quality.sample(200), false);
  assert.equal(quality.sample(NaN), false);
  assert.equal(quality.ratio, 1);
});
