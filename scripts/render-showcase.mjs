import { writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const name = process.argv[2];
if (!name || name.includes("/") || name.includes("\\") || name === "." || name === "..") throw new Error("Supply one template directory name");
const directory = path.resolve(name, "showcase");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(directory, "preview.html")).href);
  await page.evaluate(() => document.fonts.ready);
  if (errors.length) throw new Error(errors.join("\n"));
  const png = await page.screenshot();
  const webp = await page.evaluate(async png => {
    const image = new Image(); image.src = png; await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = 1280; canvas.height = 800;
    canvas.getContext("2d").drawImage(image, 0, 0);
    return canvas.toDataURL("image/webp", 0.85).split(",")[1];
  }, `data:image/png;base64,${png.toString("base64")}`);
  await writeFile(path.join(directory, "cover.webp"), Buffer.from(webp, "base64"));
  console.log(`${name}/showcase/cover.webp`);
} finally { await browser.close(); }
