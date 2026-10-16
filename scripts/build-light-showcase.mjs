import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { transform } from "esbuild";

// Capture production-rendered markup and styles; ship only the selected preview interactions.
const configs = {
  notes: [
    ['[data-view="pinned"]', "置顶笔记"],
    ['[data-view="生活"]', "生活"],
    ['[data-view="工作"]', "工作"],
    ['[data-view="灵感"]', "灵感"],
    ['[data-note="weekend"]', "note"],
    ['[data-template="blank"]', "new"],
  ],
  calendar: [
    ['[data-view="agenda"]', "日程列表"],
    ["[data-new-event]", "new"],
  ],
  ledger: [
    ['[data-view="analysis"]', "分类统计"],
    ['[data-filter="expense"]', "支出"],
    ['[data-filter="income"]', "收入"],
    ["[data-add-ledger]", "new"],
  ],
  study: [
    ['[data-nav="tasks"]', "学习任务"],
    ['[data-nav="focus"]', "专注记录"],
    ['[data-nav="insights"]', "学习复盘"],
    ["#add-task", "new"],
  ],
  "two-to-three": [
    ['[data-nav="tasks"]', "每周清单"],
    ['[data-nav="moments"]', "心情日记"],
    ['[data-nav="rewards"]', "小小奖励"],
    ['[data-phase="early"]', "孕早期"],
    ["#add-note", "new"],
  ],
  whiteboard: [
    ["#quick-add", "new"],
    ["#help", "帮助"],
  ],
  "bedtime-talk": [
    ["nav a:nth-child(2)", "问题库"],
    ["nav a:nth-child(3)", "聊过的时光"],
    [".draw-button", "card"],
  ],
  zhiji: [
    ["nav a:nth-child(2)", "日历"],
    ["nav a:nth-child(3)", "观察"],
    ["nav a:nth-child(4)", "我的"],
    [".primary-button", "new"],
  ],
  "team-building": [[".new-event", "new"]],
  "sunlit-album": [[".photo-open", "photo"]],
  "nes-loader": [],
  "downtown-beatdown": [["#credits", "许可"]],
  "neon-coast": [["#how", "驾驶指南"]],
};
const browser = await chromium.launch();
try {
  for (const name of process.argv.slice(2)) {
    // Templates with their own preview build keep it; snapshots would replace real interactions.
    if (!configs[name]) {
      console.log(`${name}: no light preview config; use the template's own preview build`);
      continue;
    }
    const p = await browser.newPage({ viewport: { width: 1100, height: 780 } });
    if (name === "neon-coast")
      await p.addInitScript(() => {
        const raf = window.requestAnimationFrame;
        let frames = 0;
        window.requestAnimationFrame = (cb) =>
          ++frames <= 2 ? raf.call(window, cb) : 0;
      });
    const original =
      "file://" + path.resolve("dist/live-showcases", name + ".html");
    const images = {},
      styles = new Set(),
      states = {},
      actions = {};
    async function load() {
      await p.goto(original, { waitUntil: "domcontentloaded" });
      if (name === "neon-coast")
        await p.locator("#start:not([disabled])").waitFor({ timeout: 90000 });
      else if (name === "sunlit-album")
        await p.locator(".photo-open").first().waitFor({ timeout: 15000 });
      else await p.waitForTimeout(900);
    }
    async function capture() {
      const result = await p.evaluate(async () => {
        const css = [...document.querySelectorAll("style")].map(
          (e) => e.textContent,
        );
        const clone = document.body.cloneNode(true);
        clone.querySelectorAll("script,style").forEach((e) => e.remove());
        [...clone.querySelectorAll("div")]
          .find((e) => e.style.zIndex === "2147483647")
          ?.remove();
        const photos = {};
        const originalImages = [...document.querySelectorAll("img")];
        for (const [i, img] of [...clone.querySelectorAll("img")].entries()) {
          const live = originalImages[i];
          if (!live?.complete || !live.naturalWidth) {
            img.removeAttribute("src");
            continue;
          }
          const c = document.createElement("canvas");
          const scale = Math.min(
            1,
            480 / live.naturalWidth,
            360 / live.naturalHeight,
          );
          c.width = Math.round(live.naturalWidth * scale);
          c.height = Math.round(live.naturalHeight * scale);
          c.getContext("2d").drawImage(live, 0, 0, c.width, c.height);
          const data = c.toDataURL("image/webp", 0.55),
            key = "img" + i;
          photos[key] = data;
          img.removeAttribute("src");
          img.removeAttribute("srcset");
          img.setAttribute("data-preview-image", key);
        }
        // Serialize live input state, which outerHTML does not otherwise include.
        const controls = [
          ...document.querySelectorAll("input,textarea,select"),
        ];
        [...clone.querySelectorAll("input,textarea,select")].forEach((e, i) => {
          const live = controls[i];
          if (e.tagName === "TEXTAREA") e.textContent = live.value;
          else if (e.tagName === "INPUT") {
            e.setAttribute("value", live.value);
            if (live.checked) e.setAttribute("checked", "");
            else e.removeAttribute("checked");
          } else
            [...e.options].forEach((o) =>
              o.toggleAttribute("selected", o.value === live.value),
            );
        });
        clone.querySelectorAll("a").forEach((e) => e.removeAttribute("target"));
        return {
          css,
          html: clone.innerHTML,
          bodyClass: document.body.className,
          photos,
        };
      });
      for (const css of result.css) styles.add(css);
      // Stable image references shared between screens, rather than duplicated base64 payloads.
      for (const [key, value] of Object.entries(result.photos)) {
        let id = Object.keys(images).find((k) => images[k] === value);
        if (!id) {
          id = "p" + Object.keys(images).length;
          images[id] = value;
        }
        result.html = result.html.replaceAll(
          `data-preview-image="${key}"`,
          `data-preview-image="${id}"`,
        );
      }
      return { html: result.html, bodyClass: result.bodyClass };
    }
    await load();
    states.home = await capture();
    for (const [selector, id] of configs[name]) {
      await load();
      await p.evaluate(() =>
        [...document.querySelectorAll("div")]
          .find((e) => e.style.zIndex === "2147483647")
          ?.remove(),
      );
      const button = p.locator(selector).first();
      if (!(await button.isVisible()))
        throw Error(name + ": missing " + selector);
      const text = (await button.innerText()).trim();
      await button.click();
      await p.waitForTimeout(250);
      states[id] = await capture();
      actions[selector] = id;
      if (text) actions["text:" + text] = id;
    }
    if (name === "neon-coast" || name === "downtown-beatdown") {
      await load();
      await p.evaluate(() => {
        const c = document.querySelector("canvas");
        for (const e of document.querySelectorAll("body *"))
          e.style.visibility = "hidden";
        c.style.visibility = "visible";
      });
      const shot = await p.screenshot({
        timeout: 60000,
        clip: await p.locator("canvas").first().boundingBox(),
      });
      images.scene = await p.evaluate(
        async (data) => {
          const img = new Image();
          img.src = data;
          await img.decode();
          const c = document.createElement("canvas");
          c.width = 900;
          c.height = 640;
          c.getContext("2d").drawImage(img, 0, 0, 900, 640);
          return c.toDataURL("image/webp", 0.6);
        },
        "data:image/png;base64," + shot.toString("base64"),
      );
    }
    await mkdir(path.resolve("dist/light-showcases"), { recursive: true });
    await writeFile(
      path.resolve("dist/light-showcases", name + ".json"),
      JSON.stringify({
        name,
        states,
        actions,
        images,
        css: [...styles].join("\n"),
      }),
    );
    const css = (
      await transform([...styles].join("\n"), { loader: "css", minify: true })
    ).code;
    const runtime = await readFile(
      new URL("./light-showcase-runtime.js", import.meta.url),
      "utf8",
    );
    const payload = { name, states, actions, images };
    const js = (
      await transform(
        "const preview=" + JSON.stringify(payload) + ";\n" + runtime,
        { minify: true, target: "es2022" },
      )
    ).code.replace(/<\/script/gi, "<\\/script");
    const title = JSON.parse(
      await readFile(path.resolve(name, "metadata.json"), "utf8"),
    ).display_name;
    const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}</style><body><script>${js}</script></body></html>`;
    const size = Buffer.byteLength(html);
    if (size > 500000) throw Error(name + " preview exceeds 500 KB: " + size);
    await mkdir(path.resolve(name, "showcase"), { recursive: true });
    await writeFile(path.resolve(name, "showcase/preview.html"), html);
    console.log(name, size);
    await p.close();
  }
} finally {
  await browser.close();
}
