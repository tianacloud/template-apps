import { Browser, NES, Controller } from "jsnes";
import { openStorage, encodeState, decodeState } from "./storage.js";
import { createControls, keyMap } from "./controls.js";
import { createTouchControls } from "./touch-controls.js";
import css from "./style.css";
import { deleteGame } from "./library.js";

const style = document.createElement("style");
style.textContent = css;
document.head.append(style);
document.title = "卡带俱乐部 · 红白机";
document.querySelector("#app").innerHTML = `
<div class="shell">
<header><a class="brand" href="#"><span class="brand-icon" aria-hidden="true">▥</span><span>卡带俱乐部<small>CARTRIDGE CLUB</small></span></a><div class="header-note">熟悉的按键，再玩一局。<span>FAMILY COMPUTER · PLAYER 1</span></div></header>
<main>
<section class="library" aria-label="游戏库"><div class="section-heading"><h1>我的卡带</h1><button id="refresh" class="icon-button" aria-label="刷新游戏库">↻</button></div>
<label class="upload" id="upload-label"><span>＋ 上传 ROM</span><small>.nes 格式 · 保存到文件库</small><input id="upload" type="file" accept=".nes" aria-label="上传 ROM"></label>
<p id="upload-status" role="status" aria-live="polite"></p>
<form id="search-form" class="library-search" role="search"><input id="search" type="search" placeholder="搜索游戏名称" aria-label="搜索游戏名称"><button id="search-submit">搜索</button></form>
<p class="library-order">置顶优先 · 按使用频率排序</p>
<p id="library-status" role="status" aria-live="polite"></p>
<div id="library-scroll" class="library-scroll" tabindex="0" aria-label="卡带列表"><div id="games" class="games"></div><button id="more" class="more" hidden>更多卡带</button></div>
<div class="library-foot"><span class="status-dot"></span><span id="db-status">正在连接游戏库…</span></div></section>
<section class="player" aria-label="模拟器"><div class="player-stage">
<div class="player-heading"><div><span class="eyebrow">NOW PLAYING</span><h2 id="game-title">选一张卡带，开始吧。</h2></div><span id="play-state" class="state-badge">待机</span></div>
<div class="console"><div class="screen-frame"><div id="screen" tabindex="0" aria-label="游戏画面"><div id="overlay" class="overlay"><div class="overlay-card"><div class="pixel-cartridge" aria-hidden="true"><i></i></div><h3 id="overlay-title">今天，玩点什么？</h3><p id="overlay-description">上传你的 NES 卡带，把下一关留到下次。</p><button id="play" class="primary" disabled>等待卡带</button></div></div></div><div class="screen-caption"><span><i class="power"></i> POWER</span><span>8-BIT ENTERTAINMENT SYSTEM</span></div></div>
<div class="console-bar"><span class="console-wordmark">FAMILY<br><b>COMPUTER</b></span><div class="machine-buttons"><button id="pause" disabled>暂停</button><button id="reset" disabled>重启卡带</button><button id="fullscreen">全屏</button></div><div class="vents" aria-hidden="true"></div></div></div>
<div class="control-guide"><div><kbd>W</kbd><span><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span><small>方向</small></div><p><kbd>Tab</kbd> 选择<br><kbd>Space</kbd> / <kbd>Enter</kbd> 确认</p><p><kbd class="round-key">J</kbd> A 连发 <kbd class="round-key">K</kbd> B 连发<br><kbd>N</kbd> 普通 A <kbd>M</kbd> 普通 B<br><small>Esc 暂停 · A/B 动作由游戏决定</small></p></div>
<div class="touch" id="touch-controls" aria-label="触屏控制">
<div class="touch-toolbar"><span>左手移动 · 右手操作</span><button id="rotate" aria-pressed="false">横屏</button><div class="direction-modes" role="group" aria-label="方向控制方式"><button data-mode="stick" aria-pressed="true">摇杆</button><button data-mode="pad" aria-pressed="false">方向键</button></div></div>
<div class="touch-body"><div class="direction-surface" id="direction-surface" data-mode="stick" aria-label="八方向摇杆">
<div class="stick-face" aria-hidden="true"><span class="stick-axis"></span><span class="stick-thumb"></span></div>
<div class="dpad" hidden>${[
  ["UP LEFT", "↖", "左上"],
  ["UP", "▲", "上"],
  ["UP RIGHT", "↗", "右上"],
  ["LEFT", "◀", "左"],
  ["", "", "中心"],
  ["RIGHT", "▶", "右"],
  ["DOWN LEFT", "↙", "左下"],
  ["DOWN", "▼", "下"],
  ["DOWN RIGHT", "↘", "右下"],
]
  .map(([direction, symbol, label]) =>
    direction
      ? `<button data-direction="${direction}" aria-label="${label}">${symbol}</button>`
      : '<span class="dpad-center" aria-hidden="true"></span>',
  )
  .join("")}</div>
</div><div class="ab"><button data-key="TURBO_B" aria-label="B 连发">K<small>B 连发</small></button><button data-key="TURBO_A" aria-label="A 连发">J<small>A 连发</small></button><button class="normal-action" data-key="B" aria-label="普通 B">M<small>普通 B</small></button><button class="normal-action" data-key="A" aria-label="普通 A">N<small>普通 A</small></button></div></div>
<div class="touch-menu"><button data-key="SELECT">选择 <small>SELECT</small></button><button data-key="START">开始 <small>START</small></button></div>
</div>
<p id="notice" role="status" aria-live="polite">从左侧上传 .nes 文件，或选择已保存的游戏。</p>
</div></section>
<aside class="saves" aria-label="游戏存档"><div class="section-heading"><h2>游戏存档</h2><button id="refresh-saves" class="icon-button" aria-label="刷新存档">↻</button></div><p class="aside-note">把这一刻，留给下一次。<br>每张卡带拥有独立存档。</p><div id="slots"></div><p class="save-help">点击保存后可关闭页面。<br>下次打开同一卡带，读取即可继续。</p></aside>
</main><footer><span>你的卡带，你的游戏时间。</span><span>NES · JSNES <span class="footer-sep">/</span> 单人游玩</span></footer></div>
<dialog id="game-dialog" aria-labelledby="dialog-title"><form id="game-form">
<h2 id="dialog-title"></h2><p id="dialog-description"></p>
<label id="rename-label">游戏名称<input id="rename-title" required></label>
<p id="dialog-error" role="alert"></p><div class="dialog-actions"><button type="button" id="dialog-cancel">取消</button><button id="dialog-submit">保存名称</button></div>
</form></dialog>`;

const $ = (id) => document.getElementById(id);
let storage,
  files,
  emulator,
  controls,
  touchControls,
  current,
  running = false,
  busy = false;
let games = [],
  saved = new Map(),
  hasMore = false,
  searchQuery = "",
  editingGame,
  dialogAction;
const notice = (message) => {
  $("notice").textContent = message;
};
const uploadNotice = (message) => {
  $("upload-status").textContent = message;
  notice(message);
};
const size = (bytes) => `${(Number(bytes) / 1024).toFixed(0)} KB`;
const date = (value) =>
  new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function render() {
  $("game-title").textContent = current?.title || "选一张卡带，开始吧。";
  $("play-state").textContent = running
    ? "游戏中"
    : current
      ? "已暂停"
      : "待机";
  $("play-state").classList.toggle("active", running);
  $("overlay").hidden = running;
  $("overlay").classList.toggle("has-game", !!current);
  $("overlay-title").textContent = current ? "已暂停" : "今天，玩点什么？";
  $("overlay-description").textContent = current
    ? "进度停在这一刻，继续就能接着玩。"
    : "上传你的 NES 卡带，把下一关留到下次。";
  $("play").textContent = current ? "开始 / 继续游戏" : "等待卡带";
  for (const id of ["play", "pause", "reset"])
    $(id).disabled = busy || !current;
  $("pause").textContent = running ? "暂停" : "继续";
  $("upload").disabled = busy || !storage;
  $("upload-label").classList.toggle("disabled", busy || !storage);
  $("refresh").disabled = busy || !storage;
  $("refresh-saves").disabled = busy || !storage || !current;
  $("search-submit").disabled = busy || !storage;
  $("more").hidden = !hasMore;
  $("more").disabled = busy;
  const listScrollTop = $("library-scroll").scrollTop;
  $("games").replaceChildren();
  if (!games.length) {
    const empty = document.createElement("p");
    empty.className = "empty-library";
    empty.textContent = searchQuery
      ? "没有找到匹配的游戏，换个名称试试。"
      : "卡带架还是空的。\n上传第一款游戏，\n从这里开始收藏。";
    $("games").append(empty);
  }
  for (const game of games) {
    const button = document.createElement("button");
    button.className =
      "game" + (current?.rom_hash === game.rom_hash ? " selected" : "");
    button.disabled = busy;
    button.innerHTML =
      '<span class="mini-cartridge" aria-hidden="true">▥</span><span class="game-copy"><strong></strong><small></small></span><span class="game-arrow" aria-hidden="true">↗</span>';
    button.querySelector("strong").textContent = game.title;
    button.querySelector("small").textContent =
      `${size(game.size_bytes)} · ${Number(game.use_count || 0)} 次加载`;
    button.onclick = () => operation(() => loadGame(game));
    button.title = game.title;
    const pinned = Number(game.pinned) === 1;
    if (pinned) {
      button.querySelector(".game-arrow").textContent = "★";
      button.title += "（已置顶）";
    }
    const row = document.createElement("article");
    row.className = "game-row";
    const actions = document.createElement("div");
    actions.className = "game-actions";
    for (const [action, label] of [
      ["pin", pinned ? "取消置顶" : "置顶"],
      ["rename", "改名"],
      ["delete", "删除"],
    ]) {
      const control = document.createElement("button");
      control.textContent = label;
      control.dataset.action = action;
      control.setAttribute("aria-label", `${label} ${game.title}`);
      control.disabled = busy;
      if (action === "pin") {
        control.setAttribute("aria-pressed", String(pinned));
        control.onclick = () =>
          operation(
            async () => {
              await storage.setPinned(game.rom_hash, !pinned);
              await refreshGames();
              $("library-status").textContent = pinned
                ? "已取消置顶。"
                : "已置顶。";
            },
            (message) => {
              $("library-status").textContent = message;
            },
          );
      } else control.onclick = () => openGameDialog(game, action);
      actions.append(control);
    }
    row.append(button, actions);
    $("games").append(row);
  }
  $("library-scroll").scrollTop = listScrollTop;
  $("slots").replaceChildren();
  for (let slot = 1; slot <= 3; slot++) {
    const record = saved.get(slot),
      article = document.createElement("article");
    article.className = "slot";
    article.innerHTML = `<div class="slot-heading"><strong>存档 0${slot}</strong><time></time></div><div class="slot-preview"></div><div class="slot-actions"><button data-save="${slot}">${record ? "覆盖保存" : "保存进度"}</button><button data-load="${slot}">读取</button></div>`;
    article.querySelector("time").textContent = record
      ? date(record.saved_at)
      : "空";
    const preview = article.querySelector(".slot-preview");
    if (record) {
      const img = document.createElement("img");
      img.src = record.previewUrl;
      img.alt = `存档 ${slot} 画面`;
      preview.append(img);
    } else {
      preview.innerHTML =
        '<span aria-hidden="true">＋</span><small>等待一段冒险</small>';
    }
    article.querySelector("[data-save]").disabled =
      busy || !current || !storage;
    article.querySelector("[data-load]").disabled =
      busy || !current || !storage || !record;
    $("slots").append(article);
  }
}
function releaseInputs() {
  touchControls?.reset();
  controls?.releaseAll();
}
function setRunning(value) {
  releaseInputs();
  if (!current || value === running) return;
  running = value;
  if (value) {
    emulator.start();
    $("screen").focus({ preventScroll: true });
  } else emulator.stop();
  render();
}
async function operation(action, report = notice) {
  if (busy) return;
  busy = true;
  render();
  try {
    await action();
  } catch (error) {
    report(error.message);
  } finally {
    busy = false;
    render();
  }
}
async function refreshGames(more = false, query = searchQuery) {
  const page = await storage.listGames(more ? games.at(-1) : undefined, query);
  searchQuery = query;
  games = more ? [...games, ...page] : page;
  hasMore = page.length === 25;
  if (!more) $("library-scroll").scrollTop = 0;
}
function openGameDialog(game, action) {
  setRunning(false);
  editingGame = game;
  dialogAction = action;
  $("dialog-title").textContent =
    action === "rename" ? "给卡带起个名字" : "删除卡带";
  $("dialog-description").textContent =
    action === "rename"
      ? "修改显示名称，游戏进度和存档保持不变。"
      : `删除「${game.title}」及其 ROM 文件和全部存档？此操作无法恢复。`;
  $("rename-label").hidden = action !== "rename";
  $("rename-title").disabled = action !== "rename";
  $("rename-title").value = game.title;
  $("dialog-submit").textContent =
    action === "rename" ? "保存名称" : "删除卡带";
  $("dialog-error").textContent = "";
  $("game-dialog").showModal();
  if (action === "rename") $("rename-title").select();
  else $("dialog-cancel").focus();
}
$("dialog-cancel").onclick = () => $("game-dialog").close();
$("game-dialog").oncancel = (event) => {
  if (busy) event.preventDefault();
};
$("game-form").onsubmit = (event) => {
  event.preventDefault();
  if (busy) return;
  const game = editingGame,
    action = dialogAction,
    title = $("rename-title").value.trim();
  if (action === "rename" && !title) {
    $("dialog-error").textContent = "请输入游戏名称。";
    return;
  }
  $("dialog-submit").disabled = $("dialog-cancel").disabled = true;
  $("dialog-error").textContent = "";
  operation(
    async () => {
      if (action === "rename") {
        await storage.rename(game.rom_hash, title);
        game.title = title;
        if (current?.rom_hash === game.rom_hash) current.title = title;
      } else {
        for (const record of await storage.list(game.rom_hash)) {
          for (const path of [record.state_path, record.screenshot_path]) {
            try { await files.delete(path); } catch (error) { if (error.code !== "FILE_NOT_FOUND") throw error; }
          }
        }
        await deleteGame(storage, files, game);
        if (current?.rom_hash === game.rom_hash) {
          current = undefined;
          saved.clear();
          history.replaceState(null, "", location.pathname + location.search);
          emulator._screen.setBuffer(new Uint32Array(256 * 240));
          emulator._screen.writeBuffer();
        }
        if (await storage.lastGame() === game.rom_hash) await storage.setLastGame("");
        games = games.filter((item) => item.rom_hash !== game.rom_hash);
      }
      $("game-dialog").close();
      $("library-status").textContent =
        action === "rename" ? "名称已保存。" : "卡带、文件和存档已删除。";
      notice($("library-status").textContent);
      await refreshGames();
    },
    (message) => {
      const target = $("game-dialog").open
        ? $("dialog-error")
        : $("library-status");
      target.textContent = `${message}；请重试或刷新游戏库核对。`;
    },
  ).finally(() => {
    $("dialog-submit").disabled = $("dialog-cancel").disabled = false;
  });
};
$("search-form").onsubmit = (event) => {
  event.preventDefault();
  operation(
    async () => {
      await refreshGames(false, $("search").value.trim());
      $("library-status").textContent = searchQuery
        ? `搜索「${searchQuery}」`
        : "显示全部卡带";
    },
    (message) => {
      $("library-status").textContent = message;
    },
  );
};
async function refreshSaves() {
  for (const record of saved.values()) if (record.previewUrl) URL.revokeObjectURL(record.previewUrl);
  saved = new Map(
    (await Promise.all((await storage.list(current.rom_hash)).map(async record => {
      const response = await files.get(record.screenshot_path);
      if (!response.ok) throw new Error("存档预览读取失败");
      return {...record, previewUrl: URL.createObjectURL(await response.blob())};
    }))).map((record) => [
      Number(record.slot),
      record,
    ]),
  );
}
async function loadGame(game, recordUse = true) {
  setRunning(false);
  notice(`正在读取 ${game.title}…`);
  const response = await files.get(game.file_path);
  if (!response.ok) throw new Error("卡带下载失败，请稍后重新选择游戏。");
  const bytes = new Uint8Array(await response.arrayBuffer());
  // Prepare a separate core so a rejected ROM cannot corrupt the current game.
  const probe = new NES();
  probe.loadROM(bytes);
  emulator.nes.loadROM(bytes);
  emulator._screen.setBuffer(emulator.nes.ppu.buffer);
  emulator._screen.writeBuffer();
  releaseInputs();
  current = game;
  await storage.setLastGame(game.rom_hash);
  if (landscapeTouch.matches) setImmersive(true);
  saved.clear();
  history.replaceState(null, "", `#game/${game.rom_hash}`);
  await refreshSaves();
  if (recordUse) {
    await storage.recordUse(game.rom_hash);
    await refreshGames();
  }
  notice("卡带已就绪。点击开始游戏，或读取之前的存档。");
}
$("upload").onchange = () => {
  const file = $("upload").files[0];
  $("upload").value = "";
  if (!file) return;
  operation(async () => {
    setRunning(false);
    uploadNotice(`正在检查 ${file.name}…`);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const probe = new NES();
    try {
      probe.loadROM(bytes);
    } catch (error) {
      const unsupported = /Unsupported mapper: (\d+)/.exec(error.message);
      if (unsupported)
        throw new Error(
          `${file.name} 使用 Mapper ${unsupported[1]}，当前模拟器尚不支持。文件未上传；这不是游戏数量或文件大小限制。`,
        );
      throw new Error(`无法运行此 ROM：${error.message}`);
    }
    const hash = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
      (byte) => byte.toString(16).padStart(2, "0"),
    ).join("");
    const existing = await storage.game(hash);
    if (existing) {
      await loadGame(existing);
      uploadNotice("这张卡带已在游戏库中，已为你打开。");
      return;
    }
    const path = `roms/${crypto.randomUUID()}.nes`;
    let uploadId;
    try {
      uploadNotice(`正在上传 ${file.name}…`);
      await files.put(
        path,
        new Blob([bytes], { type: "application/octet-stream" }),
        {
          onPrepared: (receipt) => {
            uploadId = receipt.id;
          },
        },
      );
    } catch (error) {
      if (!uploadId) throw error;
      const status = await files.uploadStatus(uploadId);
      const confirmed = status.completed
        ? status
        : await files.completeUpload(uploadId);
      if (!confirmed.completed)
        throw new Error(
          "上传尚未确认，请刷新游戏库并核对文件存储中的上传结果。",
        );
    }
    const game = {
      rom_hash: hash,
      title: file.name.replace(/\.nes$/i, ""),
      file_path: path,
      size_bytes: file.size,
      added_at: new Date().toISOString(),
    };
    try {
      await storage.add(game);
    } catch (error) {
      const confirmed = await storage.game(hash);
      if (!confirmed)
        throw new Error("卡带已上传，但游戏库记录未确认。请刷新核对后再操作。");
      await refreshGames();
      await loadGame(confirmed);
      uploadNotice(`${file.name} 已保存，可以开始游戏。`);
      return;
    }
    uploadNotice("上传完成，正在打开卡带…");
    await refreshGames();
    await loadGame(game);
    uploadNotice(`${file.name} 已保存，可以开始游戏。`);
  }, uploadNotice);
};
$("slots").onclick = (event) => {
  const save = event.target.closest("[data-save]"),
    load = event.target.closest("[data-load]");
  if (!save && !load) return;
  operation(async () => {
    setRunning(false);
    const slot = Number((save || load).dataset[save ? "save" : "load"]);
    if (save) {
      notice(`正在保存存档 ${slot}…`);
      const state = await encodeState(emulator.nes.toJSON());
      const previous = await storage.get(current.rom_hash, slot);
      const prefix = `saves/${current.rom_hash}/${slot}-${crypto.randomUUID()}`;
      const statePath = `${prefix}.json.gz`, screenshotPath = `${prefix}.png`;
      const stateBytes = Uint8Array.from(atob(state), c => c.charCodeAt(0));
      const imageData = emulator.screenshot().src.split(",", 2)[1];
      const imageBytes = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
      const screenshot = new Blob([imageBytes], {type: "image/png"});
      await files.put(statePath, new Blob([stateBytes], {type: "application/gzip"}));
      await files.put(screenshotPath, screenshot);
      await storage.save(current.rom_hash, slot, statePath, screenshotPath, new Date().toISOString());
      if (previous) for (const path of [previous.state_path, previous.screenshot_path]) {
        try { await files.delete(path); } catch { /* Old versions can be cleaned up later. */ }
      }
      await refreshSaves();
      notice(`存档 ${slot} 已保存，下次可从这里继续。`);
    } else {
      const record = await storage.get(current.rom_hash, slot);
      if (!record) throw new Error("此存档已不存在，请刷新存档列表。");
      const response = await files.get(record.state_path);
      if (!response.ok) throw new Error("存档文件读取失败");
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = ""; for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      emulator.nes.fromJSON(await decodeState(btoa(binary)));
      releaseInputs();
      setRunning(true);
      notice(`已读取存档 ${slot}。`);
    }
  });
};
$("refresh").onclick = () =>
  operation(async () => {
    await refreshGames();
    notice("游戏库已刷新。");
  });
$("more").onclick = () => operation(() => refreshGames(true));
$("refresh-saves").onclick = () =>
  operation(async () => {
    await refreshSaves();
    notice("存档已刷新。");
  });
$("play").onclick = () => setRunning(true);
$("pause").onclick = () => setRunning(!running);
$("reset").onclick = () => {
  setRunning(false);
  emulator.nes.reloadROM();
  releaseInputs();
  setRunning(true);
  notice("卡带已重启，按空格或 Enter 确认。");
};
const player = document.querySelector(".player");
let fullscreenRequested = false;
let manualLandscape = false;
const landscapeTouch = matchMedia(
  "(any-pointer: coarse) and (orientation: landscape)",
);
function updateOrientation() {
  releaseInputs();
  const landscape = matchMedia("(orientation: landscape)").matches;
  const immersive = player.classList.contains("immersive");
  player.classList.toggle(
    "landscape-layout",
    immersive && (landscape || manualLandscape),
  );
  player.classList.toggle(
    "rotated",
    immersive && manualLandscape && !landscape,
  );
  $("rotate").textContent = manualLandscape ? "自动转屏" : "横屏";
  $("rotate").setAttribute("aria-pressed", String(manualLandscape));
}
$("rotate").onclick = () => {
  manualLandscape = !manualLandscape;
  fullscreenRequested = true;
  setImmersive(true);
};
function setImmersive(value) {
  if (!value) manualLandscape = false;
  player.classList.toggle("immersive", value);
  updateOrientation();
  document.body.classList.toggle("playing-fullscreen", value);
  $("fullscreen").textContent =
    value || document.fullscreenElement ? "退出全屏" : "全屏";
}
landscapeTouch.addEventListener("change", () => {
  if (!document.fullscreenElement)
    setImmersive(fullscreenRequested || (landscapeTouch.matches && !!current));
  else updateOrientation();
});
$("fullscreen").onclick = async () => {
  if (document.fullscreenElement) {
    fullscreenRequested = false;
    await document.exitFullscreen();
    return;
  }
  if (player.classList.contains("immersive")) {
    fullscreenRequested = false;
    setImmersive(false);
    return;
  }
  const touch = getComputedStyle($("touch-controls")).display !== "none";
  if (touch) {
    fullscreenRequested = true;
    setImmersive(true);
  }
  const target = touch ? player : $("screen");
  try {
    await target.requestFullscreen();
  } catch {
    if (!touch) notice("此浏览器不支持全屏。");
  }
};
document.addEventListener("fullscreenchange", () => {
  fullscreenRequested = document.fullscreenElement === player;
  setImmersive(fullscreenRequested);
});
window.addEventListener("keydown", (event) => {
  if (event.code === "Escape") {
    setRunning(false);
    return;
  }
  if (
    $("game-dialog").open ||
    !running ||
    busy ||
    /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) ||
    event.target.isContentEditable
  )
    return;
  const button = keyMap[event.code];
  if (button === undefined) return;
  event.preventDefault();
  controls.press(event.code, button);
});
window.addEventListener("keyup", (event) => {
  if (running && keyMap[event.code] !== undefined) event.preventDefault();
  controls?.release(event.code);
});
window.addEventListener("blur", () => setRunning(false));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) setRunning(false);
});
window.addEventListener("hashchange", () => operation(restoreRoute));
async function restoreRoute() {
  const match = location.hash.match(/^#game\/([a-f0-9]{64})$/);
  const hash = match?.[1] || await storage.lastGame();
  if (!hash || hash === current?.rom_hash) return;
  const game = await storage.game(hash);
  if (game) await loadGame(game, false);
  else {
    if (await storage.lastGame() === hash) await storage.setLastGame("");
    notice("这张卡带已不在游戏库中，请选择其他游戏。");
  }
}
render();
async function init() {
  emulator = new Browser({
    container: $("screen"),
    onError: (error) => {
      running = false;
      releaseInputs();
      render();
      notice(`游戏已停止：${error.message}`);
    },
  });
  emulator.keyboard.keys = {};
  emulator._gamepadPolling.stop();
  controls = createControls(emulator.nes);
  touchControls = createTouchControls(
    $("touch-controls"),
    controls,
    () => running && !busy,
  );
  window.addEventListener("resize", updateOrientation);
  new ResizeObserver(() => emulator.fitInParent()).observe($("screen"));
  files = window.tiana.files;
  if (!files)
    throw new Error("当前运行环境未提供文件存储，无法上传和读取卡带。");
  storage = await openStorage();
  await refreshGames();
  $("db-status").textContent = "游戏库已连接";
  try {
    await restoreRoute();
  } catch (error) {
    notice(`自动加载卡带失败：${error.message} 请重新选择卡带重试。`);
  }
  render();
}
init().catch((error) => {
  $("db-status").textContent = "连接失败，请刷新重试";
  notice(error.message);
  render();
});
