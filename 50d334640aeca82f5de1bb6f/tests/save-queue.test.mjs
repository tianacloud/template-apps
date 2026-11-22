import test from "node:test";
import assert from "node:assert/strict";
import { createSaveQueue } from "../src/save-queue.js";

test("a checkpoint requested during a pending save is written after it", async () => {
  let resolveFirst, state = 1;
  const writes = [];
  const queue = createSaveQueue(async manual => {
    writes.push({ state, manual });
    if (writes.length === 1) await new Promise(resolve => { resolveFirst = resolve; });
    return true;
  });
  const first = queue.request();
  state = 2;
  await queue.request();
  await queue.request(true);
  assert.deepEqual(writes, [{ state: 1, manual: false }]);
  resolveFirst();
  await first;
  assert.deepEqual(writes, [{ state: 1, manual: false }, { state: 2, manual: true }]);
});

test("an unconfirmed write never causes automatic replay, including queued requests", async () => {
  let resolveFirst, count = 0;
  const queue = createSaveQueue(async () => {
    count++;
    if (count === 1) return await new Promise(resolve => { resolveFirst = resolve; });
    return true;
  });
  const first = queue.request();
  await queue.request();
  resolveFirst(false);
  await first;
  assert.equal(count, 1);
  await queue.request(true);
  assert.equal(count, 2);
});
