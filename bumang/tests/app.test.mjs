import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";
import { createDatabase, serve, connect } from "./fixture.mjs";

// Build first: node scripts/build.mjs <commit>, then npm test.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = iso(new Date());
const tomorrow = iso(new Date(Date.now() + 86400000));

function seed(database, rows) {
  const insert = database.db.prepare(
    "INSERT INTO bumang_tasks (app_id, id, title, note, important, urgent, day, start_minute, duration_minutes, done, done_at, created_at, updated_at) VALUES ('fixture-app', ?, ?, '', ?, ?, ?, ?, ?, 0, NULL, ?, ?)",
  );
  const time = new Date().toISOString();
  for (const [id, title, important, urgent, day = null, start = null, duration = 60] of rows)
    insert.run(id, title, important, urgent, day, start, duration, time, time);
}
const row = (database, id) => database.db.prepare("SELECT * FROM bumang_tasks WHERE id = ?").get(id);

async function open(browser, options, database, hash) {
  const site = await serve(root);
  const context = await browser.newContext(options);
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await connect(page, database);
  await page.goto(site.url + hash);
  await page.waitForFunction(() => !document.querySelector("#view").inert);
  return { page, errors, close: async () => (await context.close(), await site.close()) };
}
async function mouseDrag(page, from, to) {
  const a = await from.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + Math.min(10, a.height / 2));
  await page.mouse.down();
  for (let i = 1; i <= 8; i++)
    await page.mouse.move(a.x + a.width / 2 + ((to.x - a.x - a.width / 2) * i) / 8, a.y + 10 + ((to.y - a.y - 10) * i) / 8);
  await page.mouse.up();
}
async function touchDrag(page, from, to, hold = 450) {
  const client = await page.context().newCDPSession(page);
  const a = await from.boundingBox();
  const start = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] });
  await page.waitForTimeout(hold);
  for (let i = 1; i <= 10; i++)
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: start.x + ((to.x - start.x) * i) / 10, y: start.y + ((to.y - start.y) * i) / 10 }],
    });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
// Chips are held 12px below their top edge, so aim that far below the minute line.
async function gridPoint(page, minute) {
  const grid = await page.locator(".grid").boundingBox();
  return { x: grid.x + grid.width / 2, y: grid.y + minute + 12 };
}
const settle = (page) => page.waitForTimeout(300);

test("不忙: quadrants, timeline scheduling, persistence and layouts", async (t) => {
  const browser = await chromium.launch();
  t.after(() => browser.close());

  await t.test("desktop: create, re-prioritise, finish and undo", async () => {
    const database = createDatabase(path.join(root, "schema.sql"));
    const app = await open(browser, { viewport: { width: 1366, height: 860 } }, database, "#/matrix");
    const { page } = app;
    await page.click(".new-button");
    await page.fill("input[name=title]", "写周报");
    await page.check(".quad-pick .q1 input");
    await page.click("[data-quick='" + today + "']");
    await page.fill("input[name=start]", "14:30");
    await page.click("button[type=submit]");
    await page.locator("#editor").waitFor({ state: "hidden" });
    const created = database.db.prepare("SELECT * FROM bumang_tasks").get();
    assert.equal(created.title, "写周报");
    assert.equal(created.important, 1);
    assert.equal(created.urgent, 1);
    assert.equal(created.day, today);
    assert.equal(created.start_minute, 870);
    assert.match(await page.locator(".quad.q1 .card").textContent(), /今天 14:30/);

    // Drag the card from 马上做 to 放一放.
    const target = await page.locator(".quad.q4").boundingBox();
    await mouseDrag(page, page.locator(".quad.q1 .card"), { x: target.x + 80, y: target.y + 120 });
    await settle(page);
    assert.equal(row(database, created.id).important, 0);
    assert.equal(row(database, created.id).urgent, 0);
    assert.equal(await page.locator(".quad.q4 .card").count(), 1);

    await page.click(".quad.q4 .card .check");
    await settle(page);
    assert.equal(row(database, created.id).done, 1);
    assert.equal(await page.locator(".quad.q4 .card").count(), 0);
    await page.click("#toast button");
    await settle(page);
    assert.equal(row(database, created.id).done, 0);
    assert.equal(row(database, created.id).done_at, null);

    // Reload: the database is the source of truth.
    await page.reload();
    await page.waitForFunction(() => !document.querySelector("#view").inert);
    assert.equal(await page.locator(".quad.q4 .card").count(), 1);

    // Delete needs a second confirmation tap.
    await page.click(".quad.q4 .card-body");
    await page.click("[data-delete]");
    assert.ok(row(database, created.id));
    await page.click("[data-delete]");
    await page.locator("#editor").waitFor({ state: "hidden" });
    assert.equal(row(database, created.id), undefined);
    assert.deepEqual(app.errors, []);
    await app.close();
  });

  await t.test("desktop: tray to timeline, move, resize, back to tray, other day", async () => {
    const database = createDatabase(path.join(root, "schema.sql"));
    seed(database, [["t1", "整理读书笔记", 1, 0], ["t2", "周会", 1, 1, today, 600, 60]]);
    const app = await open(browser, { viewport: { width: 1366, height: 860 } }, database, `#/timeline/${today}`);
    const { page } = app;
    await page.locator(".scroller").evaluate((el) => (el.scrollTop = 480));
    await mouseDrag(page, page.locator(".chip", { hasText: "整理读书笔记" }), await gridPoint(page, 540));
    await settle(page);
    let task = row(database, "t1");
    assert.equal(task.day, today);
    assert.ok(Math.abs(task.start_minute - 540) <= 15, `start ${task.start_minute}`);
    assert.equal(task.start_minute % 15, 0);
    assert.equal(await page.locator(".chip", { hasText: "整理读书笔记" }).count(), 0);

    // Move the block down by about an hour.
    const block = page.locator(".block", { hasText: "整理读书笔记" });
    const box = await block.boundingBox();
    await mouseDrag(page, block, { x: box.x + box.width / 2, y: box.y + 10 + 60 });
    await settle(page);
    assert.equal(row(database, "t1").start_minute, task.start_minute + 60);

    // Pull the bottom edge to make it 90 minutes.
    const grip = block.locator(".grip");
    const g = await grip.boundingBox();
    await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2);
    await page.mouse.down();
    await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2 + 15);
    await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2 + 30);
    await page.mouse.up();
    await settle(page);
    assert.equal(row(database, "t1").duration_minutes, 90);

    // Back to the tray clears the time but keeps the day.
    const tray = await page.locator(".tray").boundingBox();
    await mouseDrag(page, block, { x: tray.x + 200, y: tray.y + 30 });
    await settle(page);
    task = row(database, "t1");
    assert.equal(task.start_minute, null);
    assert.equal(task.day, today);
    assert.equal(await page.locator(".chip", { hasText: "整理读书笔记" }).count(), 1);

    // Drop the scheduled meeting on tomorrow's date keeps its time.
    const next = await page.locator(`.day[data-day="${tomorrow}"]`).boundingBox();
    if (next) {
      await mouseDrag(page, page.locator(".block", { hasText: "周会" }), { x: next.x + next.width / 2, y: next.y + next.height / 2 });
      await settle(page);
      assert.equal(row(database, "t2").day, tomorrow);
      assert.equal(row(database, "t2").start_minute, 600);
    }
    // Tapping an empty half hour opens a prefilled editor.
    await page.locator(".scroller").evaluate((el) => (el.scrollTop = 900));
    const grid = await page.locator(".grid").boundingBox();
    await page.mouse.click(grid.x + grid.width - 40, grid.y + 15 * 60 + 40);
    assert.equal(await page.inputValue("input[name=start]"), "15:30");
    assert.equal(await page.inputValue("input[name=day]"), today);
    assert.deepEqual(app.errors, []);
    await app.close();
  });

  await t.test("mobile: long-press drag, scrolling stays native, layout fits", async () => {
    const database = createDatabase(path.join(root, "schema.sql"));
    seed(database, [
      ["m1", "回复客户邮件", 1, 1],
      ["m2", "取快递", 0, 1],
      ["m3", "刷新闻", 0, 0],
      ["m4", "跑步", 1, 0, today, 1140, 60],
    ]);
    const app = await open(browser, { ...devices["iPhone 13"] }, database, "#/matrix");
    const { page } = app;
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(width <= 390, `matrix overflows: ${width}`);
    assert.equal(await page.locator(".quad").count(), 4);
    assert.ok(await page.locator(".fab").isVisible());
    assert.ok(await page.locator(".tabs").isVisible());

    // A quick swipe does not drag.
    const q2 = await page.locator(".quad.q2").boundingBox();
    await touchDrag(page, page.locator(".card", { hasText: "回复客户邮件" }), { x: q2.x + 60, y: q2.y + 100 }, 40);
    await settle(page);
    assert.equal(row(database, "m1").urgent, 1);
    // A long press does.
    await touchDrag(page, page.locator(".card", { hasText: "回复客户邮件" }), { x: q2.x + 60, y: q2.y + 100 });
    await settle(page);
    assert.equal(row(database, "m1").urgent, 0);
    assert.equal(row(database, "m1").important, 1);

    await page.click(".tabs [data-tab=timeline]");
    await page.waitForSelector(".grid");
    assert.ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= 390);
    await page.locator(".scroller").evaluate((el) => (el.scrollTop = 600));
    const point = await gridPoint(page, 720);
    await touchDrag(page, page.locator(".chip", { hasText: "取快递" }), point);
    await settle(page);
    const task = row(database, "m2");
    assert.equal(task.day, today);
    assert.ok(Math.abs(task.start_minute - 720) <= 15, `start ${task.start_minute}`);

    // The editor sheet fits the phone screen.
    await page.click(".fab");
    const sheet = await page.locator(".sheet").boundingBox();
    assert.ok(sheet.y >= 0 && sheet.y + sheet.height <= 844 + 1, JSON.stringify(sheet));
    await page.click("[data-close]");
    assert.deepEqual(app.errors, []);
    await app.close();
  });

  await t.test("a lost write response is verified by reading the row", async () => {
    const database = createDatabase(path.join(root, "schema.sql"));
    seed(database, [["v1", "预约牙医", 0, 1]]);
    const app = await open(browser, { viewport: { width: 1366, height: 860 } }, database, "#/matrix");
    const { page } = app;
    database.failNextWrite("lost");
    await page.click(".card .check");
    await settle(page);
    assert.equal(row(database, "v1").done, 1);
    assert.equal(await page.locator(".card").count(), 0);
    assert.doesNotMatch(await page.locator("#toast").textContent(), /没有保存/);
    // Recently finished tasks come back after a reload under 显示已完成.
    await page.reload();
    await page.waitForFunction(() => !document.querySelector("#view").inert);
    assert.equal(await page.locator(".card").count(), 0);
    await page.check("[data-action=show-done]");
    assert.equal(await page.locator(".quad.q3 .card.is-done").count(), 1);
    assert.deepEqual(app.errors, []);
    await app.close();
  });
});
