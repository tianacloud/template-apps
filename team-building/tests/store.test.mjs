import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { createStore } from "../src/store.js";
import { newEvent } from "../src/domain.js";
function fixture() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
  const execute = async (q, args = []) => {
    const s = db.prepare(q);
    if (s.columns().length) return { rows: s.all(...args) };
    return { rows: [], affectedRows: s.run(...args).changes };
  };
  return { db, execute, store: createStore(execute) };
}
const alice = { id: "a", name: "小禾" },
  bob = { id: "b", name: "小林" };
test("SQLite persists activity edits, comments, closed state and indexed historical restaurant search", async () => {
  const f = fixture();
  try {
    const e = newEvent(alice);
    await f.store.create(e);
    await f.store.change(e.id, bob, {
      type: "add-option",
      name: "山野小馆（滨江店）",
      url: "https://example.com",
    });
    assert.equal((await f.store.search("小馆")).options[0].eventId, e.id);
    await f.store.change(e.id, bob, {
      type: "comment",
      text: "一起去",
      mentions: [],
    });
    await f.store.change(e.id, alice, { type: "close" });
    assert.equal((await f.store.list(null, true)).length, 0);
    await assert.rejects(
      () =>
        f.store.change(e.id, bob, { type: "edit", fields: { title: "修改" } }),
      /已关闭/,
    );
    assert.equal((await f.store.read(e.id)).event.comments.length, 1);
  } finally {
    f.db.close();
  }
});
test("two simultaneous writers never overwrite each other silently", async () => {
  const f = fixture();
  try {
    const e = newEvent(alice);
    await f.store.create(e);
    const results = await Promise.allSettled([
      f.store.change(e.id, alice, {
        type: "edit",
        fields: { title: "第一个名字" },
      }),
      f.store.change(e.id, bob, {
        type: "edit",
        fields: { title: "第二个名字" },
      }),
    ]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    assert.match(
      results.find((r) => r.status === "rejected").reason.message,
      /新变化/,
    );
    assert.equal((await f.store.read(e.id)).event.history.length, 1);
  } finally {
    f.db.close();
  }
});
test("lost response after commit is recovered by reading, without repeating the write", async () => {
  const f = fixture();
  try {
    const e = newEvent(alice);
    await f.store.create(e);
    let writes = 0;
    const store = createStore(async (q, args) => {
      const r = await f.execute(q, args);
      if (q.startsWith("UPDATE")) {
        writes++;
        throw new Error("lost response");
      }
      return r;
    });
    await store.change(e.id, alice, {
      type: "edit",
      fields: { location: "门口" },
    });
    assert.equal(writes, 1);
    assert.equal((await store.read(e.id)).event.location, "门口");
  } finally {
    f.db.close();
  }
});

test("history pagination includes every activity sharing a creation timestamp", async () => {
  const f = fixture();
  try {
    for (let i = 0; i < 21; i++)
      await f.store.create(
        newEvent(alice, { createdAt: "2026-10-06T00:00:00.000Z" }),
      );
    const first = await f.store.list();
    const second = await f.store.list(first.at(-1));
    assert.equal(first.length, 20);
    assert.equal(second.length, 1);
    assert.equal(new Set([...first, ...second].map((e) => e.id)).size, 21);
  } finally {
    f.db.close();
  }
});
