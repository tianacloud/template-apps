import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium, firefox, webkit } from "playwright";

const source = await readFile(new URL("../src/data.js", import.meta.url), "utf8");
const photos = await Promise.all(
  ["dog", "cat", "flowers", "friends", "hills", "sea"].map(async (name) => ({
    name,
    type: "image/jpeg",
    base64: (
      await readFile(new URL(`../template-files/starter/${name}.jpg`, import.meta.url))
    ).toString("base64"),
  })),
);
const tinyGif = {
  name: "transparent",
  type: "image/gif",
  base64: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
};

for (const engine of [chromium, firefox, webkit]) {
  test(`${engine.name()}: upload stores correctly encoded, smaller photo variants`, async () => {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage();
      await page.route("http://album.test/**", async (route) => {
        const path = new URL(route.request().url()).pathname;
        if (path === "/data.js") {
          await route.fulfill({ contentType: "text/javascript", body: source });
        } else if (path === "/db.js") {
          await route.fulfill({
            contentType: "text/javascript",
            body: `
              export async function sql(statement, values) {
                window.writes.push({ statement, values });
                return { rows: [] };
              }
              export async function verifiedWrite(action) { await action(); }
            `,
          });
        } else {
          await route.fulfill({ contentType: "text/html", body: "<!doctype html>" });
        }
      });
      await page.goto("http://album.test/");
      for (const input of [...photos, tinyGif, { ...tinyGif, name: "tiny-static", type: "image/png" }]) {
        const result = await page.evaluate(async (input) => {
          const { uploadPhoto, removePhoto } = await import("/data.js");
          let original = await (await fetch(`data:${input.type};base64,${input.base64}`)).blob();
          if (input.name === "tiny-static") {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            original = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
          }
          const stored = new Map(), deleted = [], progress = [];
          window.writes = [];
          window.tiana = { files: {
            async put(path, blob, { onProgress }) {
              stored.set(path, blob);
              onProgress(blob.size, blob.size);
            },
            async delete(path) { deleted.push(path); },
          } };
          const photo = await uploadPhoto(original, { id: input.name }, (n) => progress.push(n));
          const variants = [];
          for (const key of ["thumbnail_path", "preview_path"]) {
            const blob = stored.get(photo[key]);
            const image = await createImageBitmap(blob);
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            variants.push({
              path: photo[key], type: blob.type, bytes: blob.size,
              width: image.width, height: image.height,
              magic: Array.from(new Uint8Array(await blob.slice(0, 3).arrayBuffer())),
              pixel: Array.from(ctx.getImageData(0, 0, 1, 1).data),
            });
            image.close();
          }
          const originalUnchanged = stored.get(photo.original_path) === original;
          await removePhoto(photo);
          return { photo, variants, originalUnchanged, paths: [...stored.keys()], deleted, progress, writes: window.writes };
        }, input);
        const { photo, variants } = result;
        assert.ok(result.originalUnchanged);
        assert.equal(result.progress.at(-1), 1);
        assert.ok(result.progress.every((n, i, all) => n >= 0 && n <= 1 && (!i || n >= all[i - 1])));
        assert.deepEqual(result.deleted, result.paths);
        assert.deepEqual(result.writes[0].values.slice(2, 5), [photo.original_path, photo.thumbnail_path, photo.preview_path]);
        for (const [i, variant] of variants.entries()) {
          if (variant.path === photo.original_path) continue;
          assert.equal(variant.type, "image/jpeg");
          assert.match(variant.path, /\.jpg$/);
          assert.deepEqual(variant.magic, [255, 216, 255]);
          assert.ok(Math.max(variant.width, variant.height) <= [640, 2400][i]);
          assert.ok(variant.width <= photo.width && variant.height <= photo.height);
          if (input.type !== "image/gif") assert.ok(variant.bytes < photo.bytes);
        }
        if (input.name === "dog") {
          assert.equal(result.paths.length, 3);
          assert.ok(variants[0].bytes < 150_000);
          assert.ok(variants[1].bytes < 1_400_000);
        }
        if (input.name === "tiny-static") assert.equal(result.paths.length, 1);
        if (input.type === "image/gif") {
          assert.equal(result.paths.length, 3);
          for (const variant of variants) assert.deepEqual(variant.pixel, [255, 255, 255, 255]);
        }
      }
    } finally {
      await browser.close();
    }
  });
}
