import test from "node:test";
import assert from "node:assert/strict";
import { directionsAt } from "../src/touch-controls.js";

test("a single thumb reaches all eight directions and returns to neutral in the center", () => {
  for (const [x, y, expected] of [
    [60, 0, ["RIGHT"]],
    [60, 60, ["DOWN", "RIGHT"]],
    [0, 60, ["DOWN"]],
    [-60, 60, ["DOWN", "LEFT"]],
    [-60, 0, ["LEFT"]],
    [-60, -60, ["UP", "LEFT"]],
    [0, -60, ["UP"]],
    [60, -60, ["UP", "RIGHT"]],
    [0, 0, []],
    [4, -5, []],
    [160, -160, ["UP", "RIGHT"]],
  ])
    assert.deepEqual(directionsAt(x, y, 72), expected);
});

test("small movements engage quickly and centering releases the stick", () => {
  assert.deepEqual(directionsAt(8, 0, 72), ["RIGHT"]);
  assert.deepEqual(directionsAt(6, 0, 72), []);
  assert.deepEqual(directionsAt(6, 0, 72, ["RIGHT"]), ["RIGHT"]);
  assert.deepEqual(directionsAt(3, 0, 72, ["RIGHT"]), []);
});

test("direction boundaries tolerate small tremors without delaying deliberate turns", () => {
  const atAngle = (angle, previous) =>
    directionsAt(
      60 * Math.cos((angle * Math.PI) / 180),
      60 * Math.sin((angle * Math.PI) / 180),
      72,
      previous,
    );
  assert.deepEqual(atAngle(25, ["RIGHT"]), ["RIGHT"]);
  assert.deepEqual(atAngle(32, ["RIGHT"]), ["DOWN", "RIGHT"]);
  assert.deepEqual(atAngle(20, ["DOWN", "RIGHT"]), ["DOWN", "RIGHT"]);
  assert.deepEqual(atAngle(12, ["DOWN", "RIGHT"]), ["RIGHT"]);
  assert.deepEqual(atAngle(180, ["RIGHT"]), ["LEFT"]);
  assert.deepEqual(atAngle(-179, ["LEFT"]), ["LEFT"]);
});
