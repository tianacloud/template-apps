import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
const names = process.argv.slice(2),
  output = path.resolve("dist/showcase-validation");
await mkdir(output, { recursive: true });
const browser = await chromium.launch(),
  receipts = await readFile(path.join(output, "receipts.json"), "utf8")
    .then(JSON.parse)
    .then((rows) => rows.filter((row) => !names.includes(row.name)))
    .catch(() => []);
try {
  for (const name of names) {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });
    page.setDefaultTimeout(8000);
    const requests = [];
    page.on("request", (r) => requests.push(r.url()));
    const size = (await readFile(path.resolve(name, "showcase/preview.html")))
      .length;
    assert.ok(size <= 500000, `${name}: preview exceeds 500 KB`);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (e) => {
      if (e.type() === "error" && !e.text().startsWith("Blocked autofocusing"))
        errors.push(e.text().slice(0, 180));
    });
    await page.route("https://showcase.test/**", async (r) =>
      r.fulfill({
        status: 200,
        headers: {
          "content-type": "text/html",
          ...(r.request().url().endsWith("/preview")
            ? {
                "content-security-policy":
                  "default-src 'self' data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-ancestors 'self'",
              }
            : {}),
        },
        body: r.request().url().endsWith("/preview")
          ? await readFile(path.resolve(name, "showcase/preview.html"))
          : '<!doctype html><style>body{margin:0}iframe{border:0;width:100vw;height:100vh}</style><iframe sandbox="allow-scripts" src="/preview"></iframe>',
      }),
    );
    try {
      await page.goto("https://showcase.test/", {
        waitUntil: "domcontentloaded",
      });
      const ui = page.frameLocator("iframe");
      await ui.locator("#preview-reset").waitFor();
      await page.waitForTimeout(800);
      const body = await ui.locator("body").innerText();
      assert.ok(body.length > 160, "application must render");
      const screenshot = await page.screenshot({
        path: path.join(output, name + ".png"),
        timeout: 60000,
      });
      const cover = await page.evaluate(
        async (data) => {
          const img = new Image();
          img.src = data;
          await img.decode();
          const canvas = document.createElement("canvas");
          canvas.width = 1280;
          canvas.height = 800;
          canvas.getContext("2d").drawImage(img, 0, 0);
          return canvas.toDataURL("image/webp", 0.85).split(",")[1];
        },
        "data:image/png;base64," + screenshot.toString("base64"),
      );
      await writeFile(
        path.resolve(name, "showcase/cover.webp"),
        Buffer.from(cover, "base64"),
      );
      const flow = [];
      if (name === "notes") {
        await ui.locator("[data-template=daily]").click();
        await ui.locator("#note-title").fill("预览里的周末计划");
        await ui.locator("#note-body").fill("去书店，然后散步。");
        await ui.locator("#save-state").filter({ hasText: "已保存" }).waitFor();
        await ui.locator("#pin-note").click();
        await ui.locator("[data-view=pinned]").click();
        await ui.locator("#note-search").fill("预览里的周末计划");
        await ui
          .locator(".note-card")
          .filter({ hasText: "预览里的周末计划" })
          .click();
        assert.equal(
          await ui.locator("#note-body").inputValue(),
          "去书店，然后散步。",
        );
        flow.push("新建、编辑、搜索与置顶");
      } else if (name === "calendar") {
        await ui.locator("[data-new-event]").first().click();
        await ui.locator("[name=title]").fill("预览日程");
        await ui.locator("[name=start]").fill("10:00");
        await ui.locator("[name=end]").fill("11:00");
        await ui.getByRole("button", { name: "保存日程" }).click();
        await ui.locator("dialog").waitFor({ state: "hidden" });
        await ui.locator("[data-view=agenda]").click();
        await ui
          .locator("#preview-records")
          .getByText("预览日程", { exact: true })
          .waitFor();
        flow.push("添加日程并切换列表找到");
      } else if (name === "ledger") {
        await ui.locator('[data-quick-ledger="餐饮"]').click();
        await ui.locator("[name=amount]").fill("12.30");
        await ui.locator("[name=title]").fill("预览午餐");
        await ui.getByRole("button", { name: "保存账单" }).click();
        await ui.locator("dialog").waitFor({ state: "hidden" });
        await ui
          .locator("#preview-records")
          .filter({ hasText: "预览午餐" })
          .waitFor();
        assert.ok(
          (await ui.locator("#preview-records").innerText()).includes("12.30"),
        );
        flow.push("填写账单并查看本页记录");
      } else if (name === "bumang") {
        await ui.getByRole("button", { name: "新建", exact: true }).click();
        await ui.getByRole("textbox", { name: "事项名称" }).fill("预览新事项");
        await ui.getByRole("button", { name: "保存", exact: true }).click();
        await ui.getByText("预览新事项", { exact: true }).waitFor();
        flow.push("新建事项并保存到象限");
      }
      if (name === "sunlit-album") {
        await ui.locator(".favorite-button").first().click();
        assert.equal(
          await ui
            .locator(".favorite-button")
            .first()
            .getAttribute("aria-pressed"),
          "true",
        );
        flow.push("收藏照片");
      }
      const beforeReset = requests.length;
      await ui.locator("#preview-reset").click();
      await ui.locator("#preview-reset").click();
      assert.equal(await ui.locator("#preview-records").count(), 0);
      assert.equal(await ui.locator("body").innerText(), body);
      assert.equal(
        requests.length,
        beforeReset,
        "reset stays in the current document",
      );
      flow.push("连续恢复示例两次，恢复初始界面");
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(150);
      await page.screenshot({
        path: path.join(output, name + "-mobile.png"),
        timeout: 60000,
      });
      assert.deepEqual(errors, []);
      receipts.push({ name, passed: true, bytes: size, flow });
      console.log(name, "PASS", flow.join("、"));
    } catch (e) {
      receipts.push({ name, passed: false, error: e.message, errors });
      console.log(name, "FAIL", e.message.slice(0, 220));
      process.exitCode = 1;
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
  await writeFile(
    path.join(output, "receipts.json"),
    JSON.stringify(receipts, null, 2),
  );
}
