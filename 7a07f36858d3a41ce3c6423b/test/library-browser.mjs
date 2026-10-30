import assert from "node:assert/strict";
import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { build } from "esbuild";
import { chromium } from "playwright";
import { diagnosticROM } from "./fixture.mjs";
import { spriteFix } from "../scripts/jsnes-sprite-fix.mjs";
import { mapper25 } from "../scripts/jsnes-mapper25.mjs";

const db = new DatabaseSync(":memory:");
db.exec(await readFile("schema.sql", "utf8"));
const insert = db.prepare(
  "INSERT INTO nes_games (app_id,rom_hash,title,file_path,size_bytes,added_at) VALUES (?,?,?,?,?,?)",
);
for (let i = 0; i < 300; i++)
  insert.run(
    "test",
    String(i).padStart(64, "0"),
    `测试卡带 ${String(i).padStart(3, "0")}`,
    `roms/${i}.nes`,
    24592,
    "2026-10-13",
  );
insert.run(
  "other",
  "0".repeat(64),
  "其他应用",
  "roms/other.nes",
  24592,
  "2026-10-13",
);
db.prepare("INSERT INTO nes_save_slots VALUES (?,?,?,?,?,?)").run(
  "test",
  "0".repeat(64),
  1,
  "saves/test-state.gz",
  "saves/test-image.png",
  "2026-10-13",
);
db.prepare("INSERT INTO nes_save_slots VALUES (?,?,?,?,?,?)").run(
  "other",
  "0".repeat(64),
  1,
  "saves/other-state.gz",
  "saves/other-image.png",
  "2026-10-13",
);
const bundle = await build({
  entryPoints: ["src/app.js"],
  bundle: true,
  format: "esm",
  write: false,
  loader: { ".css": "text" },
  plugins: [
    spriteFix,
    mapper25,
    {
      name: "local-sql-transport",
      setup(b) {
        b.onResolve({ filter: /^@tianacloud\/serverless$/ }, () => ({
          path: "transport",
          namespace: "test",
        }));
        b.onLoad({ filter: /.*/, namespace: "test" }, () => ({
          contents: "export const createTianaFetch = () => fetch;",
        }));
      },
    },
  ],
});
const rom = diagnosticROM();
const fileSet = new Set(Array.from({ length: 300 }, (_, i) => `roms/${i}.nes`));
fileSet.add("saves/test-state.gz");
fileSet.add("saves/test-image.png");
const fileContents = new Map();
const calls = [];
let failDelete = false;
let failDownload = false;
const server = createServer(async (req, res) => {
  if (req.url === "/app.js") {
    res.setHeader("Content-Type", "text/javascript");
    res.end(bundle.outputFiles[0].text);
  } else if (req.url === "/v3/pipeline") {
    let data = "";
    for await (const chunk of req) data += chunk;
    const stmt = JSON.parse(data).requests[0].stmt;
    const prepared = db.prepare(stmt.sql);
    const rows = prepared.all(
      ...stmt.args.map((a) =>
        a.type === "integer" ? Number(a.value) : a.value,
      ),
    );
    const cols = prepared.columns().map((c) => ({ name: c.name }));
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        results: [
          {
            type: "ok",
            response: {
              type: "execute",
              result: {
                cols,
                rows: rows.map((row) =>
                  cols.map((c) => ({ type: "text", value: row[c.name] })),
                ),
              },
            },
          },
        ],
      }),
    );
  } else if (req.url.startsWith("/file?")) {
    const path = new URL(req.url, "http://local").searchParams.get("path");
    if (req.method === "PUT") {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      fileContents.set(path, Buffer.concat(chunks)); fileSet.add(path); res.end("ok");
    } else if (req.method === "DELETE") {
      calls.push(path);
      if (failDelete) {
        res.statusCode = 503;
        res.end("FILE_UNAVAILABLE");
      } else if (!fileSet.delete(path)) {
        res.statusCode = 404;
        res.end("FILE_NOT_FOUND");
      } else res.end("ok");
    } else if (failDownload) {
      res.statusCode = 503;
      res.end("Unavailable");
    } else res.end(fileContents.get(path) ?? rom);
  } else {
    res.setHeader("Content-Type", "text/html");
    res.end(`<meta name="viewport" content="width=device-width, initial-scale=1"><div id="app"></div><script>
      window.tiana = {appId:"test", connection:async()=>({sql_api:"hrana-v3",origin:location.origin}),files:{
        get:(path)=>fetch('/file?path='+encodeURIComponent(path)),
        put:async(path,blob)=>{const r=await fetch('/file?path='+encodeURIComponent(path),{method:'PUT',body:blob});if(!r.ok)throw new Error('upload failed');},
        delete:async(path)=>{const r=await fetch('/file?path='+encodeURIComponent(path),{method:'DELETE'});if(!r.ok)throw Object.assign(new Error(await r.text()),{code:r.status===404?'FILE_NOT_FOUND':'FILE_UNAVAILABLE'});}
      }};const NativeAudio=window.AudioContext;window.AudioContext=class extends NativeAudio{constructor(){super({sampleRate:44100})}};
      </script><script type="module" src="/app.js"></script>`);
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const url = `http://127.0.0.1:${server.address().port}`;
  const waitRows = async (n) =>
    page.waitForFunction(
      (n) =>
        document.querySelectorAll(".game").length === n &&
        !document.querySelector("#search-submit").disabled,
      n,
    );
  const search = async (value) => {
    await page.locator("#search").fill(value);
    await page.locator("#search-submit").click();
    await page.waitForFunction(
      () => !document.querySelector("#search-submit").disabled,
    );
  };
  await page.goto(url);
  await waitRows(25);
  const hash = (i) => String(i).padStart(64, "0");
  const row = (title) =>
    page
      .locator(".game-row")
      .filter({ has: page.locator("strong", { hasText: title }) });
  const count = (i) =>
    db
      .prepare(
        "SELECT use_count FROM nes_games WHERE app_id='test' AND rom_hash=?",
      )
      .get(hash(i)).use_count;
  await search("010");
  await row("测试卡带 010").locator(".game").click();
  await waitRows(1);
  assert.equal(count(10), 1);
  await page.locator('[data-save="1"]').click();
  await page.waitForFunction(() => document.querySelector("#notice").textContent.includes("已保存"));
  const saved = db.prepare("SELECT state_path,screenshot_path FROM nes_save_slots WHERE app_id='test' AND rom_hash=?").get(hash(10));
  assert.ok(fileContents.get(saved.state_path)?.length);
  assert.ok(fileContents.get(saved.screenshot_path)?.length);
  await page.locator('[data-load="1"]').click();
  await page.waitForFunction(() => document.querySelector("#notice").textContent.includes("已读取"));
  await page.reload();
  await waitRows(25);
  assert.equal(count(10), 1);
  await page.goto(url);
  await page.waitForFunction(
    () => document.querySelector("#game-title").textContent === "测试卡带 010",
  );
  assert.equal(await page.locator("#play-state").textContent(), "已暂停");
  assert.equal(count(10), 1);
  assert.equal(
    db.prepare("SELECT last_game FROM nes_settings WHERE app_id='test'").get()?.last_game,
    hash(10),
  );
  const reopened = await page.context().newPage();
  await reopened.goto(url);
  await reopened.waitForFunction(
    () => document.querySelector("#game-title").textContent === "测试卡带 010",
  );
  await reopened.goto(`${url}/#game/${hash(12)}`);
  await reopened.waitForFunction(
    () => document.querySelector("#game-title").textContent === "测试卡带 012",
  );
  assert.equal(count(12), 0);
  await reopened.close();
  assert.equal(
    await page.locator(".game strong").first().textContent(),
    "测试卡带 010",
  );
  await search("011");
  for (let i = 0; i < 2; i++) {
    await page.locator(".game").click();
    await waitRows(1);
  }
  await search("");
  await waitRows(25);
  assert.equal(count(11), 2);
  assert.deepEqual(
    (await page.locator(".game strong").allTextContents()).slice(0, 2),
    ["测试卡带 011", "测试卡带 010"],
  );
  await search("012");
  await page.locator('[data-action="pin"]').click();
  await waitRows(1);
  await search("");
  await waitRows(25);
  assert.equal(
    await page.locator(".game strong").first().textContent(),
    "测试卡带 012",
  );
  await page.reload();
  await waitRows(25);
  assert.equal(
    await page.locator(".game strong").first().textContent(),
    "测试卡带 012",
  );
  await row("测试卡带 010").locator('[data-action="pin"]').click();
  await waitRows(25);
  assert.deepEqual(
    (await page.locator(".game strong").allTextContents()).slice(0, 3),
    ["测试卡带 010", "测试卡带 012", "测试卡带 011"],
  );
  await row("测试卡带 010").locator('[data-action="pin"]').click();
  await waitRows(25);
  await row("测试卡带 012").locator('[data-action="pin"]').click();
  await waitRows(25);
  assert.equal(
    await page.locator(".game strong").first().textContent(),
    "测试卡带 011",
  );
  assert.equal(
    db.prepare("SELECT use_count FROM nes_games WHERE app_id='other'").get()
      .use_count,
    0,
  );
  // Exercise a page boundary within a pinned group, then across the frequency groups.
  for (let i = 100; i < 130; i++)
    db.prepare(
      "UPDATE nes_games SET pinned=1 WHERE app_id='test' AND rom_hash=?",
    ).run(hash(i));
  await page.locator("#refresh").click();
  await waitRows(25);
  assert.equal(
    await page
      .locator("#library-scroll")
      .evaluate((el) => el.scrollHeight > el.clientHeight),
    true,
  );
  await page.locator("#more").click();
  await waitRows(50);
  const titles = await page.locator(".game strong").allTextContents();
  assert.equal(new Set(titles).size, 50);
  assert.equal(
    await page.locator('[data-action="pin"][aria-pressed="true"]').count(),
    30,
  );
  assert.deepEqual(titles.slice(30, 32), ["测试卡带 011", "测试卡带 010"]);
  const expected = db
    .prepare(
      "SELECT title FROM nes_games WHERE app_id='test' ORDER BY pinned DESC,use_count DESC,added_at DESC,rom_hash DESC LIMIT 50",
    )
    .all()
    .map((r) => r.title);
  assert.deepEqual(titles, expected);
  assert.ok(
    await page.locator("#library-scroll").evaluate((el) => el.scrollTop > 0),
  );
  await search("050");
  await waitRows(1);
  assert.equal(
    await page.locator(".game strong").textContent(),
    "测试卡带 050",
  );
  await search("%_");
  await waitRows(0);
  await search("000");
  await waitRows(1);
  await page.locator(".game").click();
  await page.waitForFunction(() => !document.querySelector("#play").disabled);
  await page.locator('[data-action="rename"]').click();
  await page.locator("#rename-title").fill("忍者神龟 Adventure %_");
  await page.locator("#dialog-submit").click();
  await waitRows(0);
  assert.equal(
    await page.locator("#game-title").textContent(),
    "忍者神龟 Adventure %_",
  );
  const renamed = db
    .prepare("SELECT * FROM nes_games WHERE app_id='test' AND rom_hash=?")
    .get("0".repeat(64));
  assert.equal(renamed.file_path, "roms/0.nes");
  assert.equal(
    db.prepare("SELECT state_path FROM nes_save_slots WHERE app_id='test'").get()
      .state_path,
    "saves/test-state.gz",
  );
  await page.reload();
  await waitRows(25);
  await search("adventure %_");
  await waitRows(1);
  await page.locator('[data-action="delete"]').click();
  await page.locator("#dialog-cancel").click();
  assert.equal(calls.length, 0);
  failDelete = true;
  await page.locator('[data-action="delete"]').click();
  await page.locator("#dialog-submit").click();
  await page.waitForFunction(() =>
    document
      .querySelector("#dialog-error")
      .textContent.includes("FILE_UNAVAILABLE"),
  );
  assert.ok(
    db
      .prepare("SELECT 1 FROM nes_games WHERE app_id='test' AND rom_hash=?")
      .get("0".repeat(64)),
  );
  failDelete = false;
  fileSet.delete("roms/0.nes");
  await page.locator("#dialog-submit").click();
  await waitRows(0);
  assert.equal(
    db
      .prepare("SELECT 1 FROM nes_games WHERE app_id='test' AND rom_hash=?")
      .get("0".repeat(64)),
    undefined,
  );
  assert.equal(
    db.prepare("SELECT 1 FROM nes_save_slots WHERE app_id='test' AND rom_hash=?").get("0".repeat(64)),
    undefined,
  );
  assert.ok(db.prepare("SELECT 1 FROM nes_games WHERE app_id='other'").get());
  assert.ok(
    db.prepare("SELECT 1 FROM nes_save_slots WHERE app_id='other'").get(),
  );
  assert.equal(
    await page.locator("#game-title").textContent(),
    "选一张卡带，开始吧。",
  );
  assert.equal(new URL(page.url()).hash, "");
  assert.equal(
    db.prepare("SELECT last_game FROM nes_settings WHERE app_id='test'").get()?.last_game,
    "",
  );
  // Another tab has already removed both the file and rows before this tab confirms.
  await search("001");
  await waitRows(1);
  await page.locator('[data-action="delete"]').click();
  db.prepare("DELETE FROM nes_games WHERE app_id='test' AND rom_hash=?").run(
    String(1).padStart(64, "0"),
  );
  fileSet.delete("roms/1.nes");
  await page.locator("#dialog-submit").click();
  await waitRows(0);
  await search("");
  await waitRows(25);
  db.prepare("UPDATE nes_settings SET last_game=? WHERE app_id='test'").run(hash(2));
  db.prepare("DELETE FROM nes_games WHERE app_id='test' AND rom_hash=?").run(
    hash(2),
  );
  await page.goto(url);
  await waitRows(25);
  await page.waitForFunction(
    () =>
      document.querySelector("#db-status").textContent === "游戏库已连接",
  );
  assert.equal(
    await page.locator("#game-title").textContent(),
    "选一张卡带，开始吧。",
  );
  db.prepare("UPDATE nes_settings SET last_game=? WHERE app_id='test'").run(hash(3));
  failDownload = true;
  await page.goto(url);
  await waitRows(25);
  await page.waitForFunction(() =>
    document.querySelector("#notice").textContent.includes("自动加载卡带失败"),
  );
  assert.equal(await page.locator("#db-status").textContent(), "游戏库已连接");
  assert.equal(await page.locator("#search-submit").isEnabled(), true);
  failDownload = false;
  await page.goto(url);
  await page.waitForFunction(
    () => document.querySelector("#game-title").textContent === "测试卡带 003",
  );
  assert.equal(count(3), 0);
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({
    path: "artifacts/library-desktop.png",
    fullPage: true,
  });
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 740 });
    await page.locator(".library").scrollIntoViewIfNeeded();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    assert.equal(
      await page
        .locator("#library-scroll")
        .evaluate(
          (el) =>
            el.scrollHeight > el.clientHeight &&
            el.clientHeight <= innerHeight / 2,
        ),
      true,
    );
    assert.ok(
      (await page.locator('[data-action="rename"]').first().boundingBox())
        .height >= 44,
    );
  }
  await page.screenshot({
    path: "artifacts/library-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  const result = {
    games: 300,
    pagination: true,
    frequencyOrder: true,
    lastGameRestoredWithoutHash: true,
    lastGameRestoredInNewTab: true,
    explicitGameLinkTakesPrecedence: true,
    deletedLastGameCleared: true,
    failedAutoLoadLeavesLibraryUsable: true,
    pinnedPriorityAndPersistence: true,
    unpin: true,
    refreshDoesNotCountUse: true,
    paginationAcrossPinnedAndFrequencyGroups: true,
    searchBeyondFirstPage: true,
    literalSubstringSearch: true,
    renamePersists: true,
    saveIdentityPreserved: true,
    deletionFailureRetry: true,
    missingFileAndRowsIdempotent: true,
    otherAppUnaffected: true,
    mobileWidths: [320, 390],
    errors,
  };
  await writeFile(
    "artifacts/library-browser-result.json",
    JSON.stringify(result, null, 2),
  );
  console.log(result);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  db.close();
}
