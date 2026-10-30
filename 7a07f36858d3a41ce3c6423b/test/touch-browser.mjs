import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { build } from "esbuild";
import { chromium, webkit } from "playwright";
import { diagnosticROM } from "./fixture.mjs";
import { spriteFix } from "../scripts/jsnes-sprite-fix.mjs";
import { mapper25 } from "../scripts/jsnes-mapper25.mjs";

const source = await readFile("src/app.js", "utf8");
const bundle = await build({
  stdin: {
    contents: source + "\nglobalThis.testNES = () => emulator.nes;",
    resolveDir: new URL("../src", import.meta.url).pathname,
  },
  bundle: true,
  format: "esm",
  write: false,
  loader: { ".css": "text" },
  plugins: [
    spriteFix,
    mapper25,
    {
      name: "test-library",
      setup(builder) {
        builder.onLoad({ filter: /src\/storage\.js$/ }, () => ({
          contents: `
        export async function openStorage() { return {
          listGames: async () => [{rom_hash: "${"a".repeat(64)}", title: "触屏测试卡带", file_path: "diagnostic.nes", size_bytes: 24592}],
          list: async () => [],
          recordUse: async () => {},
        }; }
        export function encodeState() {} export function decodeState() {}
      `,
          loader: "js",
        }));
      },
    },
  ],
});
const rom = diagnosticROM();
const server = createServer((req, res) => {
  if (req.url === "/app.js") {
    res.setHeader("Content-Type", "text/javascript");
    res.end(bundle.outputFiles[0].text);
  } else if (req.url === "/rom") res.end(rom);
  else {
    res.setHeader("Content-Type", "text/html");
    res.end(
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><div id="app"></div><script>window.tiana={files:{get:()=>fetch("/rom")}};const NativeAudio=window.AudioContext;window.AudioContext=class extends NativeAudio{constructor(){super({sampleRate:44100})}};</script><script type="module" src="/app.js"></script>',
    );
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.locator(".game").click();
  await page.locator("#play").click();
  await page.waitForFunction(() => testNES().cpu.mem[0] > 4);
  await page.locator("#pause").click();
  const paused = await page.evaluate(() => ({
    pixels: document.querySelector("canvas").toDataURL(),
    counter: testNES().cpu.mem[0],
    shade: getComputedStyle(document.querySelector("#overlay")).backgroundColor,
  }));
  await page.waitForTimeout(200);
  assert.equal(await page.locator("#overlay-title").textContent(), "已暂停");
  assert.match(paused.shade, /0\.18/);
  assert.equal(
    await page.evaluate(() => document.querySelector("canvas").toDataURL()),
    paused.pixels,
  );
  assert.equal(await page.evaluate(() => testNES().cpu.mem[0]), paused.counter);
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({
    path: "artifacts/paused-mobile.png",
    fullPage: true,
  });
  await page.locator("#play").click();
  await page.locator("#touch-controls").scrollIntoViewIfNeeded();
  const client = await context.newCDPSession(page);
  const state = () => page.evaluate(() => [...testNES().controllers[1].state]);
  const center = async (selector) => {
    const b = await page.locator(selector).boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  const send = async (type, points) => {
    await client.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map((p) => ({
        radiusX: 8,
        radiusY: 8,
        force: 1,
        ...p,
      })),
    });
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
  };
  let c = await center("#direction-surface");
  let stick = { id: 1, x: c.x + 42, y: c.y - 42 };
  let action = { id: 2, ...(await center('[data-key="A"]')) };
  const scrollBefore = await page.evaluate(() => scrollY);
  await send("touchStart", [stick]);
  let keys = await state();
  assert.equal(keys[4], 0x41);
  assert.equal(keys[7], 0x41);
  await send("touchStart", [stick, action]);
  keys = await state();
  assert.equal(keys[0], 0x41);
  assert.equal(keys[4], 0x41);
  assert.equal(keys[7], 0x41);
  stick = { ...stick, x: c.x - 45, y: c.y + 45 };
  await send("touchMove", [stick, action]);
  keys = await state();
  assert.equal(keys[4], 0x40);
  assert.equal(keys[7], 0x40);
  assert.equal(keys[5], 0x41);
  assert.equal(keys[6], 0x41);
  assert.equal(keys[0], 0x41);
  assert.equal(await page.evaluate(() => scrollY), scrollBefore);
  await send("touchEnd", [stick]);
  keys = await state();
  assert.equal(keys[5], 0x40);
  assert.equal(keys[6], 0x40);
  assert.equal(keys[0], 0x41);
  await send("touchEnd", []);
  assert.ok((await state()).every((v) => v === 0x40));
  // Slide to another action while another finger keeps the original action held.
  const aCenter = await center('[data-key="A"]');
  const bCenter = await center('[data-key="B"]');
  const fingerA = { id: 2, x: aCenter.x - 8, y: aCenter.y };
  let sliding = { id: 3, x: aCenter.x + 8, y: aCenter.y };
  await send("touchStart", [fingerA, sliding]);
  assert.equal((await state())[0], 0x41);
  sliding = { id: 3, ...bCenter };
  await send("touchMove", [fingerA, sliding]);
  keys = await state();
  assert.equal(keys[0], 0x41);
  assert.equal(keys[1], 0x41);
  sliding = { id: 3, x: (aCenter.x + bCenter.x) / 2, y: aCenter.y };
  await send("touchMove", [fingerA, sliding]);
  keys = await state();
  assert.equal(keys[0], 0x41);
  assert.equal(keys[1], 0x40);
  sliding = { id: 3, ...bCenter };
  await send("touchMove", [fingerA, sliding]);
  assert.equal((await state())[1], 0x41);
  await send("touchEnd", [fingerA]);
  keys = await state();
  assert.equal(keys[0], 0x40);
  assert.equal(keys[1], 0x41);
  await send("touchCancel", []);
  assert.ok((await state()).every((v) => v === 0x40));
  c = await center("#direction-surface");
  await send("touchStart", [{ id: 1, x: c.x + 8, y: c.y }]);
  assert.equal((await state())[7], 0x41);
  await send("touchEnd", []);
  await send("touchStart", [
    { id: 1, x: c.x + 40, y: c.y },
    { id: 2, ...aCenter },
  ]);
  await page.evaluate(() => document.dispatchEvent(new Event("scroll")));
  assert.ok((await state()).every((v) => v === 0x40));
  await send("touchCancel", []);
  // Pointer capture keeps movement active outside the original hit area, then cancellation releases it.
  await send("touchStart", [stick]);
  await send("touchMove", [{ ...stick, x: c.x + 100, y: c.y - 100 }]);
  keys = await state();
  assert.equal(keys[4], 0x41);
  assert.equal(keys[7], 0x41);
  await send("touchCancel", []);
  assert.ok((await state()).every((v) => v === 0x40));
  await send("touchStart", [stick]);
  await page
    .locator('.direction-modes [data-mode="pad"]')
    .evaluate((el) => el.click());
  assert.ok((await state()).every((v) => v === 0x40));
  await send("touchEnd", []);
  assert.equal(await page.locator(".dpad").isVisible(), true);
  c = await center("#direction-surface");
  stick = { id: 1, x: c.x - 46, y: c.y - 46 };
  await send("touchStart", [stick]);
  keys = await state();
  assert.equal(keys[4], 0x41);
  assert.equal(keys[6], 0x41);
  await send("touchMove", [{ ...stick, x: c.x, y: c.y }]);
  assert.ok((await state()).every((v) => v === 0x40));
  await send("touchEnd", []);
  await page.screenshot({ path: "artifacts/dpad-mobile.png", fullPage: true });
  await page.locator('.direction-modes [data-mode="stick"]').click();
  for (const size of [
    { width: 320, height: 740 },
    { width: 390, height: 667 },
    { width: 844, height: 390 },
  ]) {
    c = await center("#direction-surface");
    await send("touchStart", [{ id: 1, x: c.x + 40, y: c.y - 40 }]);
    await page.setViewportSize(size);
    await client.send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 5,
    });
    await page.waitForFunction(() =>
      testNES().controllers[1].state.every((v) => v === 0x40),
    );
    await send("touchCancel", []);
    await page.evaluate(() => scrollTo(0, 0));
    if (size.width < 700) {
      assert.equal(
        await page.evaluate(
          () =>
            document.querySelector("#touch-controls").getBoundingClientRect()
              .bottom <= innerHeight,
        ),
        true,
      );
    }
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    assert.equal(await page.locator("#touch-controls").isVisible(), true);
  }
  await page.waitForFunction(() =>
    document.querySelector(".player").classList.contains("immersive"),
  );
  assert.equal(await page.locator("#fullscreen").textContent(), "退出全屏");
  await page.locator("#fullscreen").click();
  assert.equal(
    await page
      .locator(".player")
      .evaluate((el) => el.classList.contains("immersive")),
    false,
  );
  await page.locator("#fullscreen").click();
  await page.waitForFunction(() =>
    document.fullscreenElement?.classList.contains("player"),
  );
  const fullscreen = await page.evaluate(() => {
    const controls = document
      .querySelector("#touch-controls")
      .getBoundingClientRect();
    const screen = document.querySelector("#screen").getBoundingClientRect();
    return {
      controlsVisible:
        controls.top >= 0 &&
        controls.bottom <= innerHeight &&
        controls.right <= innerWidth,
      screenVisible:
        screen.height === innerHeight && screen.width === innerWidth,
      floatingControls: ["#direction-surface", ".ab"].every((selector) => {
        const rect = document.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= screen.left &&
          rect.right <= screen.right &&
          rect.top >= screen.top &&
          rect.bottom <= screen.bottom
        );
      }),
    };
  });
  assert.deepEqual(fullscreen, {
    controlsVisible: true,
    screenVisible: true,
    floatingControls: true,
  });
  await page.screenshot({ path: "artifacts/joystick-landscape.png" });
  await page.locator("#pause").click();
  const rotationPixels = await page.evaluate(() =>
    document.querySelector("canvas").toDataURL(),
  );
  const rotationCounter = await page.evaluate(() => testNES().cpu.mem[0]);
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 320, height: 740 },
    { width: 844, height: 390 },
  ]) {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: true,
      screenWidth: viewport.width,
      screenHeight: viewport.height,
      screenOrientation: {
        type:
          viewport.width > viewport.height
            ? "landscapePrimary"
            : "portraitPrimary",
        angle: viewport.width > viewport.height ? 90 : 0,
      },
    });
    await client.send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 5,
    });
    await page.waitForTimeout(100);
    assert.equal(
      await page.evaluate(() =>
        document.fullscreenElement?.classList.contains("player"),
      ),
      true,
    );
    assert.equal(await page.locator("#fullscreen").textContent(), "退出全屏");
    assert.equal(
      await page.locator(".touch-menu").isVisible(),
      viewport.width < viewport.height,
    );
    for (const selector of [
      "#screen",
      "#direction-surface",
      ".ab",
      "#fullscreen",
    ]) {
      const box = await page.locator(selector).boundingBox();
      assert.ok(
        box.width > 0 &&
          box.height > 0 &&
          box.x >= 0 &&
          box.y >= 0 &&
          box.x + box.width <= viewport.width &&
          box.y + box.height <= viewport.height,
        `native rotation ${selector} ${JSON.stringify(box)}`,
      );
    }
    assert.equal(
      await page.evaluate(() => testNES().cpu.mem[0]),
      rotationCounter,
    );
    assert.equal(
      await page.evaluate(() => document.querySelector("canvas").toDataURL()),
      rotationPixels,
    );
  }
  await page.locator("#play").click();

  c = await center("#direction-surface");
  stick = { id: 1, x: c.x + 42, y: c.y - 42 };
  action = { id: 2, ...(await center('[data-key="A"]')) };
  await send("touchStart", [stick, action]);
  keys = await state();
  assert.equal(keys[0], 0x41);
  assert.equal(keys[4], 0x41);
  assert.equal(keys[7], 0x41);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  assert.ok((await state()).every((v) => v === 0x40));
  assert.equal(await page.locator("#overlay").isVisible(), true);
  await send("touchEnd", []);
  await page.locator("#fullscreen").click();
  await page.waitForFunction(() => !document.fullscreenElement);
  // Mobile browsers without the element Fullscreen API still get the full-viewport player.
  await page.evaluate(() => {
    document.querySelector(".player").requestFullscreen = () =>
      Promise.reject(new Error("Unavailable"));
  });
  await page.locator("#fullscreen").click();
  assert.equal(
    await page
      .locator(".player")
      .evaluate((el) => el.classList.contains("immersive")),
    true,
  );
  for (const viewport of [
    { width: 667, height: 375 },
    { width: 568, height: 320 },
  ]) {
    await page.setViewportSize(viewport);
    await client.send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 5,
    });
    await page.waitForTimeout(100);
    for (const selector of [
      "#direction-surface",
      ".ab",
      ".direction-modes",
      ".machine-buttons",
    ]) {
      const box = await page.locator(selector).boundingBox();
      assert.ok(
        box.x >= 0 &&
          box.y >= 0 &&
          box.x + box.width <= viewport.width &&
          box.y + box.height <= viewport.height,
        selector,
      );
    }
    const stickBox = await page.locator("#direction-surface").boundingBox();
    assert.equal(await page.locator(".touch-menu").isVisible(), false);
    const abBox = await page.locator(".ab").boundingBox();
    assert.ok(stickBox.x + stickBox.width <= abBox.x);
  }
  await page.locator("#play").click();
  c = await center("#direction-surface");
  await send("touchStart", [{ id: 1, x: c.x + 42, y: c.y - 42 }]);
  await page.setViewportSize({ width: 390, height: 844 });
  await client.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 5,
  });
  await page.waitForFunction(
    () =>
      innerHeight > innerWidth &&
      document.querySelector(".player").classList.contains("immersive") &&
      testNES().controllers[1].state.every((v) => v === 0x40),
  );
  assert.equal(await page.locator("#fullscreen").textContent(), "退出全屏");
  const portraitControl = await page.locator(".touch-menu").boundingBox();
  assert.ok(portraitControl.y + portraitControl.height <= 844);
  assert.ok((await state()).every((v) => v === 0x40));
  await send("touchCancel", []);
  await page.locator("#fullscreen").click();
  assert.equal(
    await page
      .locator(".player")
      .evaluate((el) => el.classList.contains("immersive")),
    false,
  );
  assert.deepEqual(errors, []);
  // A portrait-only WebView: rotate the game without changing the viewport or native orientation.
  await page.locator("#rotate").click();
  await page.waitForFunction(() =>
    document.querySelector(".player").classList.contains("rotated"),
  );
  assert.deepEqual(
    await page.evaluate(() => [innerWidth, innerHeight]),
    [390, 844],
  );
  assert.equal(await page.locator(".touch-menu").isVisible(), false);
  const rotatedScreen = await page.locator("#screen").boundingBox();
  assert.equal(rotatedScreen.width, 390);
  assert.equal(rotatedScreen.height, 844);
  c = await center("#direction-surface");
  stick = { id: 1, x: c.x + 42, y: c.y + 42 };
  action = { id: 2, ...(await center('[data-key="A"]')) };
  await send("touchStart", [stick, action]);
  keys = await state();
  assert.equal(keys[0], 0x41);
  assert.equal(keys[4], 0x41);
  assert.equal(keys[7], 0x41);
  await send("touchMove", [{ ...stick, x: c.x - 42, y: c.y - 42 }, action]);
  keys = await state();
  assert.equal(keys[0], 0x41);
  assert.equal(keys[5], 0x41);
  assert.equal(keys[6], 0x41);
  assert.equal(keys[4], 0x40);
  assert.equal(keys[7], 0x40);
  await send("touchEnd", []);
  await page.locator('.direction-modes [data-mode="pad"]').click();
  const up = await center('[data-direction="UP"]');
  await send("touchStart", [{ id: 1, ...up }]);
  assert.equal((await state())[4], 0x41);
  await send("touchEnd", []);
  // Hit-test action slides in the rotated viewport as well as the normal viewport.
  action = { id: 2, ...(await center('[data-key="A"]')) };
  await send("touchStart", [action]);
  action = { id: 2, ...(await center('[data-key="B"]')) };
  await send("touchMove", [action]);
  keys = await state();
  assert.equal(keys[0], 0x40);
  assert.equal(keys[1], 0x41);
  await send("touchEnd", []);
  await page.screenshot({ path: "artifacts/portrait-webview-landscape.png" });
  await page.locator("#rotate").click();
  assert.equal(
    await page
      .locator(".player")
      .evaluate((el) => el.classList.contains("rotated")),
    false,
  );
  assert.ok((await state()).every((v) => v === 0x40));
  await page.locator("#fullscreen").click();
  assert.equal(
    await page.locator("#rotate").getAttribute("aria-pressed"),
    "false",
  );
  const safari = await webkit.launch({ headless: true });
  try {
    const phone = await safari.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    phone.on("pageerror", (e) => errors.push(e.message));
    await phone.goto(`http://127.0.0.1:${server.address().port}`);
    await phone.locator(".game").click();
    await phone.setViewportSize({ width: 844, height: 390 });
    await phone.waitForFunction(() =>
      document.querySelector(".player").classList.contains("immersive"),
    );
    assert.equal(
      await phone
        .locator("#screen")
        .evaluate(
          (el) =>
            el.clientWidth === innerWidth && el.clientHeight === innerHeight,
        ),
      true,
    );
    await phone.locator("#play").click();
    await phone.waitForFunction(() => testNES().cpu.mem[0] > 4);
    await phone.locator("#pause").click();
    assert.equal(await phone.locator("#overlay").isVisible(), true);
    await phone.locator("#fullscreen").click();
    assert.equal(
      await phone
        .locator(".player")
        .evaluate((el) => el.classList.contains("immersive")),
      false,
    );
    await phone.evaluate(() => {
      document.querySelector(".player").requestFullscreen = () =>
        Promise.reject(new Error("Unavailable"));
    });
    await phone.locator("#fullscreen").click();
    const savedFrame = await phone.evaluate(() =>
      document.querySelector("canvas").toDataURL(),
    );
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 844, height: 390 },
      { width: 390, height: 844 },
    ]) {
      await phone.setViewportSize(viewport);
      await phone.waitForTimeout(100);
      assert.equal(
        await phone
          .locator(".player")
          .evaluate((el) => el.classList.contains("immersive")),
        true,
      );
      assert.equal(
        await phone.locator("#fullscreen").textContent(),
        "退出全屏",
      );
      assert.equal(
        await phone.evaluate(() =>
          document.querySelector("canvas").toDataURL(),
        ),
        savedFrame,
      );
      assert.equal(
        await phone.locator(".touch-menu").isVisible(),
        viewport.width < viewport.height,
      );
      if (viewport.width < viewport.height) {
        const controls = await phone.locator(".touch-menu").boundingBox();
        assert.ok(controls.y + controls.height <= viewport.height);
      }
    }
    await phone.locator("#rotate").click();
    assert.equal(
      await phone
        .locator(".player")
        .evaluate((el) => el.classList.contains("rotated")),
      true,
    );
    assert.equal(await phone.locator(".touch-menu").isVisible(), false);
    const rotated = await phone.locator("#screen").boundingBox();
    assert.equal(rotated.width, 390);
    assert.equal(rotated.height, 844);
    assert.equal(
      await phone.evaluate(() => document.querySelector("canvas").toDataURL()),
      savedFrame,
    );
    await phone.locator("#fullscreen").click();
    assert.equal(await phone.locator(".library").isVisible(), true);
    await phone.close();
  } finally {
    await safari.close();
  }
  assert.deepEqual(errors, []);
  const result = {
    scrollReleasesTouch: true,
    actionSlideSwitch: true,
    actionSlideOutAndReenter: true,
    independentFingersOnSameAction: true,
    rotatedActionSlide: true,
    smallStickMotion: true,
    landscapeMenuHiddenPortraitMenuVisible: true,
    manualLandscapeInPortraitWebview: true,
    rotatedJoystickAndDpad: true,
    rotatedSimultaneousAction: true,
    webkitManualLandscape: true,
    webkitMobileLandscape: true,
    pausedFramePreserved: true,
    diagonalMovement: true,
    simultaneousAction: true,
    dragWithoutScrolling: true,
    cancellation: true,
    modeSwitchReleases: true,
    dpadDiagonals: true,
    mobileWidths: [320, 390, 844],
    landscapeFullscreen: fullscreen,
    automaticLandscape: true,
    fullViewportWithoutNativeFullscreen: true,
    landscapeSimultaneousAction: true,
    smallLandscapeWidths: [568, 667],
    nativeFullscreenRotation: true,
    pageFullscreenRotation: true,
    rotationPreservesFrameAndState: true,
    blurReleases: true,
    rotationReleases: true,
    errors,
  };
  await writeFile(
    "artifacts/touch-browser-result.json",
    JSON.stringify(result, null, 2),
  );
  console.log(result);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
