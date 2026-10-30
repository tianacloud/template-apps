import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { CloudRepository, Conflict, Uncertain } from "../src/storage";
import { newRoster } from "../src/model";
function fixture() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(new URL("../sql/schema.sql", import.meta.url), "utf8"));
  const session = new Map<string, string>();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => session.get(k) ?? null,
      setItem: (k: string, v: string) => session.set(k, v),
      removeItem: (k: string) => session.delete(k),
    },
  });
  let dropWrite = false,
    blockRead = false,
    writeCount = 0,
    rejectWrite = false,
    emptyReturning = false;
  const fetcher = async (_url: unknown, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)),
      stmt = body.requests[0].stmt;
    const write = !stmt.sql.startsWith("SELECT");
    if (write) writeCount++;
    if (write && rejectWrite)
      return Response.json({
        results: [{ type: "error", error: { code: "SQL_ERROR" } }],
      });
    if (!write && blockRead) throw new Error("read unavailable");
    const params = stmt.args.map((v: { type: string; value: string }) =>
      v.type === "integer" ? Number(v.value) : v.value,
    );
    let rows = db.prepare(stmt.sql).all(...params);
    if (write && emptyReturning) {
      emptyReturning = false;
      rows = [];
    }
    const keys = rows.length ? Object.keys(rows[0]) : [];
    if (write && dropWrite) {
      dropWrite = false;
      throw new Error("response lost after commit");
    }
    return Response.json({
      results: [
        {
          type: "ok",
          response: {
            type: "execute",
            result: {
              cols: keys.map((name) => ({ name })),
              rows: rows.map((row) =>
                keys.map((key) =>
                  row[key] === null
                    ? { type: "null" }
                    : {
                        type: typeof row[key] === "number" ? "integer" : "text",
                        value: String(row[key]),
                      },
                ),
              ),
            },
          },
        },
        { type: "ok", response: { type: "close" } },
      ],
    });
  };
  const make = () =>
    new CloudRepository(
      {
        appId: "test-app",
        auth: { getAccessToken: async () => "test-only" },
        connection: async () => ({
          origin: "http://fixture.invalid",
          sql_api: "hrana-v3",
        }),
      },
      () => fetcher as never,
    );
  return {
    db,
    make,
    setDrop: () => {
      dropWrite = true;
    },
    setEmpty: () => {
      emptyReturning = true;
    },
    block: () => {
      blockRead = true;
    },
    unblock: () => {
      blockRead = false;
    },
    reject: () => {
      rejectWrite = true;
    },
    count: () => writeCount,
  };
}
test("SQLite conditional writes and atomic receipts prevent lost updates across two pages", async () => {
  const f = fixture();
  try {
    const a = f.make(),
      b = f.make(),
      initial = await a.load(),
      other = await b.load(),
      next = structuredClone(initial.data);
    next.rosters.push(newRoster("页面一", next.shifts));
    await a.save(initial, next);
    const second = structuredClone(other.data);
    second.rosters.push(newRoster("页面二", second.shifts));
    await assert.rejects(() => b.save(other, second), Conflict);
    assert.equal((await b.load()).data.rosters[0].name, "页面一");
    assert.equal(
      f.db.prepare("SELECT COUNT(*) AS n FROM qingban_receipts").get()!.n,
      2,
    );
  } finally {
    f.db.close();
  }
});
test("a response lost after commit is resolved by reading the receipt without replaying the write", async () => {
  const f = fixture();
  try {
    const repo = f.make(),
      before = await repo.load(),
      next = structuredClone(before.data);
    next.rosters.push(newRoster("已提交", next.shifts));
    const count = f.count();
    f.setDrop();
    const after = await repo.save(before, next);
    assert.equal(after.data.rosters[0].name, "已提交");
    assert.equal(f.count(), count + 1);
    assert.equal(repo.pending, false);
  } finally {
    f.db.close();
  }
});
test("uncertain outcomes survive page recreation and block writes until read verification succeeds", async () => {
  const f = fixture();
  try {
    const repo = f.make(),
      before = await repo.load(),
      next = structuredClone(before.data);
    next.rosters.push(newRoster("不重放", next.shifts));
    f.setDrop();
    f.block();
    await assert.rejects(() => repo.save(before, next), Uncertain);
    assert.equal(repo.pending, true);
    const resumed = f.make();
    assert.equal(resumed.pending, true);
    await assert.rejects(() => resumed.save(before, next), Uncertain);
    const count = f.count();
    f.unblock();
    const after = await resumed.verifyPending();
    assert.equal(after.data.rosters[0].name, "不重放");
    assert.equal(f.count(), count);
    assert.equal(resumed.pending, false);
  } finally {
    f.db.close();
  }
});
test("a known SQL rejection clears pending state and never reports a successful save", async () => {
  const f = fixture();
  try {
    const repo = f.make(),
      before = await repo.load();
    f.reject();
    await assert.rejects(() => repo.save(before, before.data), /拒绝/);
    assert.equal(repo.pending, false);
  } finally {
    f.db.close();
  }
});
test("an empty CAS result with this operation receipt resolves as committed rather than a false conflict", async () => {
  const f = fixture();
  try {
    const repo = f.make(),
      before = await repo.load(),
      next = structuredClone(before.data);
    next.rosters.push(newRoster("已提交回执", next.shifts));
    f.setEmpty();
    const count = f.count(),
      after = await repo.save(before, next);
    assert.equal(after.data.rosters[0].name, "已提交回执");
    assert.equal(f.count(), count + 1);
    assert.equal(repo.pending, false);
  } finally {
    f.db.close();
  }
});
