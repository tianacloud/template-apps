import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { chromium } from "playwright";
import {
  decodeRequestFrameBytes,
  encodeResponseFrameBytes,
} from "../node_modules/@tianacloud/serverless/dist/codec.js";
const db = new DatabaseSync(":memory:");
db.exec(await readFile(new URL("../schema.sql", import.meta.url), "utf8"));
const accounts = {
  alice: { user_id: "alice", display_name: "小禾", username: "alice" },
  bob: { user_id: "bob", display_name: "小林", username: "bob" },
};
const server = createServer(async (req, res) => {
  try {
    if (req.url === "/web/demo/_tiana/session") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ user: accounts.alice }));
      return;
    }
    if (req.url === "/web/demo/") {
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(
        `<!doctype html><html lang="zh-CN"><meta name="viewport" content="width=device-width,initial-scale=1"><title>一起出发</title><div id="app"></div><script>window.tiana={appId:'demo',auth:{getAccessToken:async()=> 'test-only'},connection:async()=>({origin:'https://ep-00000000000000000000000000.fixture.test',sql_api:'hrana-v3'})}</script><script type="module" src="/assets/app.js"></script></html>`,
      );
      return;
    }
    if (req.url === "/restaurant") {
      res.setHeader("content-type", "text/html");
      res.end('<meta property="og:image" content="/restaurant-cover.svg">');
      return;
    }
    if (req.url === "/restaurant-cover.svg") {
      res.setHeader("content-type", "image/svg+xml");
      res.end(
        '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="240"><rect width="480" height="240" fill="#dceac9"/><circle cx="240" cy="120" r="80" fill="#fff4dd"/></svg>',
      );
      return;
    }
    const file = req.url.replace(/^\/assets\//, "");
    if (!["app.js", "app.css"].includes(file)) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader(
      "content-type",
      file.endsWith("css") ? "text/css" : "text/javascript",
    );
    res.end(await readFile(new URL(`../dist/assets/${file}`, import.meta.url)));
  } catch (error) {
    res.writeHead(500).end(error.message);
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch();
const errors = [];
let delayed;
function delayOnce(matches) {
  let started, release;
  const signal = new Promise((r) => (started = r)),
    waiting = new Promise((r) => (release = r));
  delayed = { matches, started, waiting };
  return { signal, release };
}

async function pageFor(account) {
  const context = await browser.newContext({
    viewport: { width: 1512, height: 1100 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/_tiana/session", (r) =>
    r.fulfill({ json: { user: accounts[account] } }),
  );
  await page.route(
    "https://ep-00000000000000000000000000.fixture.test/**",
    async (route) => {
      const request = decodeRequestFrameBytes(
        new Uint8Array(route.request().postDataBuffer()),
      );
      const pipeline = JSON.parse(new TextDecoder().decode(request.body));
      const { sql, args = [] } = pipeline.requests[0].stmt;
      let first;
      try {
        const values = args.map((a) =>
          a.type === "null"
            ? null
            : a.type === "integer"
              ? Number(a.value)
              : a.value,
        );
        const stmt = db.prepare(sql);
        const cols = stmt.columns();
        const rows = cols.length ? stmt.all(...values) : [];
        const affected = cols.length ? 0 : stmt.run(...values).changes;
        first = {
          type: "ok",
          response: {
            type: "execute",
            result: {
              cols: cols.map((c) => ({ name: c.name, decltype: null })),
              rows: rows.map((row) =>
                cols.map((c) => {
                  const v = row[c.name];
                  return v === null
                    ? { type: "null" }
                    : typeof v === "number"
                      ? { type: "integer", value: String(v) }
                      : { type: "text", value: String(v) };
                }),
              ),
              affected_row_count: affected,
            },
          },
        };
      } catch (error) {
        first = {
          type: "error",
          error: { message: error.message, code: "SQL_ERROR" },
        };
      }
      if (delayed?.matches(sql)) {
        const hold = delayed;
        delayed = null;
        hold.started();
        await hold.waiting;
      }
      const body = Buffer.from(
        JSON.stringify({
          results: [first, { type: "ok", response: { type: "close" } }],
        }),
      );
      const frame = encodeResponseFrameBytes(
        {
          metadata_version: 1,
          request_id: request.metadata.request_id,
          status: 200,
          status_text: "OK",
          headers: [
            { name: "content-type", value: "application/json" },
            { name: "content-length", value: String(body.length) },
          ],
          body_length: body.length,
        },
        body,
      );
      await route.fulfill({
        status: 200,
        headers: {
          "content-type": "application/vnd.tiana.fetch.v1",
          "cache-control": "no-store",
        },
        body: Buffer.from(frame),
      });
    },
  );
  return page;
}
const page = await pageFor("alice");
const url = `http://127.0.0.1:${server.address().port}/web/demo/`;
async function dialogGone(p = page) {
  await p.locator("dialog").waitFor({ state: "hidden" });
}
async function click(p, name) {
  await p.getByRole("button", { name, exact: true }).click();
}
async function add(name, link = new URL("/no-preview", url).href) {
  await click(page, "推荐一家餐厅");
  await page.getByLabel("粘贴分享文案").fill(`【${name}】 ${link}`);
  await click(page, "加入候选");
  await dialogGone();
}
try {
  await page.goto(url);
  await click(page, "发起第一次小聚");
  await page
    .getByLabel("活动名称", { exact: true })
    .fill("周五的快乐，提前开席");
  await page.getByLabel("聚餐时间", { exact: true }).fill("2026-10-09T19:00");
  await page.getByLabel("出发时间", { exact: true }).fill("2026-10-09T18:30");
  await page
    .getByLabel("集合地点", { exact: true })
    .fill("一楼大厅 · 电梯口集合");
  await page
    .getByLabel("注意事项", { exact: true })
    .fill("下班后轻装出发。素食和忌口提前说，快乐和好胃口记得带上。");
  await click(page, "创建活动");
  await dialogGone();
  const restaurantUrl = new URL("/restaurant", url).href;
  let previewStarted, releasePreview;
  const previewSignal = new Promise((resolve) => {
    previewStarted = resolve;
  });
  const previewGate = new Promise((resolve) => {
    releasePreview = resolve;
  });
  await page.route(restaurantUrl, async (route) => {
    previewStarted();
    await previewGate;
    await route.continue();
  });
  const firstAddition = add("山野小馆 · 云南菜", restaurantUrl);
  await previewSignal;
  const frozenDuringSave = await page
    .getByLabel("餐厅 / 套餐名称", { exact: true })
    .isDisabled();
  releasePreview();
  await firstAddition;
  await page.unroute(restaurantUrl);
  assert.equal(
    frozenDuringSave,
    true,
    "restaurant draft cannot change while its submitted preview is loading",
  );
  await page.locator(".restaurant-card img.restaurant-photo").waitFor();
  assert.equal(
    await page.locator("img.restaurant-photo").getAttribute("src"),
    new URL("/restaurant-cover.svg", url).href,
  );
  await add("炭火之间 · 日式烧肉");
  await add("海边食堂 · 海鲜小聚");
  assert.equal(await page.locator(".restaurant-card").count(), 3);
  const chart = page.getByRole("region", { name: "餐厅得票排行", exact: true });
  await chart.waitFor();
  assert.deepEqual(await chart.locator(".vote-chart-count").allTextContents(), [
    "0 票",
    "0 票",
    "0 票",
  ]);
  assert.deepEqual(
    await chart
      .locator(".vote-chart-fill")
      .evaluateAll((xs) => xs.map((x) => x.style.width)),
    ["0%", "0%", "0%"],
  );
  assert.equal(await page.locator("main input").count(), 0);
  assert.equal(await page.locator(".edit-history").getAttribute("open"), null);
  await page
    .locator(".restaurant-card")
    .nth(0)
    .getByRole("button", { name: "就想吃这家", exact: true })
    .click();
  await page.waitForFunction(
    () => document.querySelector(".hero-meta strong")?.textContent === "1",
  );
  await page
    .locator(".restaurant-card")
    .first()
    .getByRole("button", { name: "我也想吃这家", exact: true })
    .click();
  await page.waitForFunction(
    () => document.querySelector(".hero-meta strong")?.textContent === "0",
  );
  assert.match(
    await chart.locator(".vote-chart-heading").innerText(),
    /0 人已投票/,
  );
  assert.deepEqual(await chart.locator(".vote-chart-count").allTextContents(), [
    "0 票",
    "0 票",
    "0 票",
  ]);
  await page
    .locator(".restaurant-card")
    .first()
    .getByRole("button", { name: "就想吃这家", exact: true })
    .click();
  await page.waitForFunction(
    () => document.querySelector(".hero-meta strong")?.textContent === "1",
  );
  const eventUrl = page.url();
  const bob = await pageFor("bob");
  await bob.goto(eventUrl);
  await bob
    .locator(".restaurant-card")
    .nth(1)
    .getByRole("button", { name: "就想吃这家", exact: true })
    .click();
  await page.waitForFunction(
    () => document.querySelector(".hero-meta strong")?.textContent === "2",
  );
  await bob
    .getByLabel("写评论", { exact: true })
    .fill("云南菜太适合秋天了！我可以晚一点出发。");
  await click(bob, "发送评论");
  await page.waitForFunction(
    () => document.querySelector(".count-badge")?.textContent === "1",
  );
  const composer = page.getByLabel("写评论", { exact: true });
  await composer.fill("安排～ @小");
  await page.getByRole("listbox", { name: "选择要提到的伙伴" }).waitFor();
  assert.equal(await page.getByRole("option").count(), 2);
  await mkdir(new URL("../.artifacts/", import.meta.url), { recursive: true });
  await page.screenshot({
    path: new URL("../.artifacts/mentions.png", import.meta.url).pathname,
    fullPage: true,
  });
  await composer.press("ArrowDown");
  await composer.press("Enter");
  assert.equal(await composer.inputValue(), "安排～ @小林 ");
  await composer.fill("前面 @小林 后面");
  await composer.evaluate((el) => {
    el.focus();
    el.setSelectionRange(6, 6);
  });
  await composer.press("ArrowLeft");
  await composer.press("ArrowRight");
  await page.getByRole("option", { name: "小林", exact: true }).click();
  assert.equal(await composer.inputValue(), "前面 @小林  后面");
  await click(page, "@ 提到伙伴");
  await page.getByRole("listbox", { name: "选择要提到的伙伴" }).waitFor();
  await composer.press("Escape");
  assert.equal(await page.getByRole("listbox").count(), 0);
  await composer.fill("安排～ @小林");
  await page.getByRole("option", { name: "小林", exact: true }).click();
  await click(page, "发送评论");
  await page.waitForFunction(
    () => document.querySelector(".count-badge")?.textContent === "2",
  );
  const savedComment = JSON.parse(
    db
      .prepare("SELECT doc FROM dining_events WHERE id=?")
      .get(new URL(eventUrl).hash.replace("#event/", "")).doc,
  ).comments.at(-1);
  assert.deepEqual(savedComment.mentions, ["bob"]);
  await click(page, "设置投票规则");
  await click(page, "多选 · 喜欢的都选");
  await page.getByLabel("每人最多选择几家").fill("2");
  await click(page, "保存投票规则");
  await dialogGone();
  await page
    .locator(".restaurant-card")
    .nth(1)
    .getByRole("button", { name: "就想吃这家", exact: true })
    .click();
  await page.waitForFunction(
    () => document.querySelectorAll(".vote-button.selected").length === 2,
  );
  await page.waitForFunction(
    () => document.querySelector(".vote-chart-count")?.textContent === "2 票",
  );
  assert.deepEqual(await chart.locator(".vote-chart-name").allTextContents(), [
    "炭火之间 · 日式烧肉",
    "山野小馆 · 云南菜",
    "海边食堂 · 海鲜小聚",
  ]);
  assert.deepEqual(await chart.locator(".vote-chart-count").allTextContents(), [
    "2 票",
    "1 票",
    "0 票",
  ]);
  assert.deepEqual(
    await chart
      .locator(".vote-chart-fill")
      .evaluateAll((xs) => xs.map((x) => x.style.width)),
    ["100%", "50%", "0%"],
  );
  await page.waitForTimeout(500);
  await mkdir(new URL("../.artifacts/", import.meta.url), { recursive: true });
  await page.screenshot({
    path: new URL("../.artifacts/desktop.png", import.meta.url).pathname,
    fullPage: true,
    animations: "disabled",
  });
  await click(page, "结束投票，确定餐厅");
  await page.getByRole("radio").nth(1).check();
  await click(page, "确定最终餐厅");
  await dialogGone();
  assert.match(await page.locator(".winner-banner").innerText(), /炭火之间/);
  await click(page, "更换最终餐厅");
  await page.getByRole("radio").nth(0).check();
  await click(page, "确定最终餐厅");
  await dialogGone();
  assert.match(await page.locator(".winner-banner").innerText(), /山野小馆/);
  await click(page, "编辑集合地点");
  await page.getByLabel("集合地点", { exact: true }).fill("地铁站 A 出口");
  await click(page, "保存修改");
  await dialogGone();
  await page.reload();
  await page.getByText("地铁站 A 出口", { exact: true }).waitFor();
  assert.equal(await page.locator("img.restaurant-photo").count(), 1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: new URL("../.artifacts/mobile.png", import.meta.url).pathname,
    fullPage: true,
    animations: "disabled",
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "mobile should not overflow",
  );
  await click(page, "结束这次团建");
  await click(page, "确认关闭活动");
  await dialogGone();
  assert.equal(
    await page
      .getByRole("button", { name: "编辑集合地点", exact: true })
      .count(),
    0,
  );
  assert.equal(await page.getByLabel("写评论", { exact: true }).count(), 0);
  assert.deepEqual(await chart.locator(".vote-chart-count").allTextContents(), [
    "2 票",
    "1 票",
    "0 票",
  ]);
  await click(page, "复制这次活动");
  await page.waitForFunction(() =>
    document.querySelector("h1")?.textContent.includes("副本"),
  );
  assert.equal(await page.locator(".restaurant-card").count(), 3);
  assert.equal(await page.locator(".hero-meta strong").innerText(), "0");
  assert.equal(await page.locator(".count-badge").innerText(), "0");
  await click(page, "从历史里找找");
  await page
    .getByRole("textbox", { name: "搜索历史餐厅", exact: true })
    .fill("山野");
  await click(page, "搜索");
  await page
    .locator(".search-results")
    .getByRole("button")
    .filter({ hasText: "山野小馆" })
    .first()
    .click();
  await dialogGone();
  assert.equal(await page.locator(".restaurant-card").count(), 4);
  await click(page, "打开菜单");
  await click(page, "历史团建");
  await page.locator(".history-item").first().waitFor();
  assert.equal(await page.locator(".history-item").count(), 2);
  await page.locator(".history-item").filter({ hasText: "副本" }).click();
  await click(page, "从历史里找找");
  await page
    .getByRole("textbox", { name: "搜索历史餐厅", exact: true })
    .fill("山野");
  const searchDelay = delayOnce((sql) => sql.includes("dining_search MATCH"));
  await click(page, "搜索");
  await searchDelay.signal;
  await page
    .getByRole("textbox", { name: "搜索历史餐厅", exact: true })
    .fill("炭火");
  searchDelay.release();
  await page.waitForFunction(
    () => !document.querySelector("dialog .search-form button").disabled,
  );
  await click(page, "搜索");
  await page
    .locator(".search-results button")
    .filter({ hasText: "炭火之间" })
    .first()
    .waitFor();
  await click(page, "关闭对话框");
  const saveDelay = delayOnce((sql) => sql.startsWith("UPDATE dining_events"));
  await page
    .locator(".restaurant-card")
    .first()
    .getByRole("button", { name: "就想吃这家", exact: true })
    .click();
  await saveDelay.signal;
  await click(page, "打开菜单");
  await click(page, "历史团建");
  await page.locator(".history-item").last().click();
  await page.getByText("已关闭 · 留住好时光", { exact: true }).waitFor();
  saveDelay.release();
  await page.waitForFunction(
    () =>
      !document.querySelector(".sync-state").textContent.includes("正在保存"),
  );
  assert.equal(await page.locator("h1").innerText(), "周五的快乐，提前开席");
  assert.deepEqual(errors, []);
  console.log(
    "Browser passed: two accounts, live votes, settings, mentions, final venue override, editing, reload persistence, close, copy, history search, mobile overflow.",
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
  db.close();
}
