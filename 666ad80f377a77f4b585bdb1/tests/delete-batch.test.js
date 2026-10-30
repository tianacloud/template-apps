import { test } from "node:test";
import assert from "node:assert/strict";
import { deletePhotoBatch } from "../src/delete-batch.js";

test("large batches stay bounded, report every result and retry only failures", async () => {
  const photos = Array.from({ length: 200 }, (_, id) => ({ id }));
  let active = 0,
    peak = 0,
    ticks = 0;
  const calls = [],
    updates = [];
  const heartbeat = setInterval(() => ticks++, 0);
  try {
    const failed = await deletePhotoBatch(
      photos,
      async (photo) => {
        calls.push(photo.id);
        peak = Math.max(peak, ++active);
        await new Promise((resolve) => setTimeout(resolve, 1));
        active--;
        if (photo.id % 31 === 0) throw new Error("Temporary failure");
      },
      (_, error, progress) => updates.push(progress),
    );
    assert.equal(peak, 3);
    assert.equal(new Set(calls).size, 200);
    assert.equal(updates.length, 200);
    updates.forEach((p, i) => assert.equal(p.completed, i + 1));
    assert.equal(updates.at(-1).succeeded, 193);
    assert.equal(updates.at(-1).failed, 7);
    assert.ok(ticks > 10);
    const retried = [];
    const remaining = await deletePhotoBatch(
      failed,
      async (p) => retried.push(p.id),
      () => {},
    );
    assert.deepEqual(
      retried.sort((a, b) => a - b),
      [0, 31, 62, 93, 124, 155, 186],
    );
    assert.deepEqual(remaining, []);
  } finally {
    clearInterval(heartbeat);
  }
});
