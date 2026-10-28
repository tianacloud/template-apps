const style=document.createElement("style"); style.textContent="\n  :root {\n    --bg: #0e1013;\n    --panel: #161920;\n    --panel-2: #1c2029;\n    --border: #262b36;\n    --border-hi: #3a4152;\n    --text: #e8eaf0;\n    --muted: #8b93a3;\n    --accent: #5e6ad2;\n    --accent-hi: #6d79e0;\n    --gold: #f0a81e;\n  }\n  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }\n  html, body { height: 100%; }\n  body {\n    font-family: -apple-system, \"SF Pro Display\", \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif;\n    background:\n      radial-gradient(1100px 700px at 15% -10%, #1b2133 0%, rgba(27,33,51,0) 55%),\n      radial-gradient(900px 600px at 95% 110%, #1a1f2e 0%, rgba(26,31,46,0) 50%),\n      var(--bg);\n    color: var(--text);\n    min-height: 100vh;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    padding: 28px 16px 40px;\n    user-select: none;\n    -webkit-user-select: none;\n  }\n\n  /* ---------- 顶栏 ---------- */\n  .top {\n    width: min(92vw, 480px);\n    display: flex;\n    align-items: flex-end;\n    justify-content: space-between;\n    gap: 16px;\n    margin-bottom: 18px;\n  }\n  .logo {\n    font-size: 44px;\n    font-weight: 800;\n    letter-spacing: -1px;\n    line-height: 1;\n    background: linear-gradient(135deg, #e8eaf0 30%, #8f7ae8 100%);\n    -webkit-background-clip: text;\n    background-clip: text;\n    -webkit-text-fill-color: transparent;\n  }\n  .tagline { margin-top: 6px; font-size: 13px; color: var(--muted); }\n  .tagline b { color: #b9c2d4; font-weight: 600; }\n\n  .scores { display: flex; gap: 10px; }\n  .score-box {\n    position: relative;\n    background: var(--panel);\n    border: 1px solid var(--border);\n    border-radius: 10px;\n    padding: 8px 16px;\n    min-width: 86px;\n    text-align: center;\n  }\n  .score-box .label { display: block; font-size: 11px; letter-spacing: .12em; color: var(--muted); margin-bottom: 2px; }\n  .score-box .val { display: block; font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }\n  .score-box.bump .val { animation: bump .3s ease-out; }\n  @keyframes bump { 0% { scale: 1; } 40% { scale: 1.22; color: var(--gold); } 100% { scale: 1; } }\n  .float-add {\n    position: absolute;\n    left: 50%; top: -2px;\n    font-size: 15px; font-weight: 700; color: var(--gold);\n    pointer-events: none;\n    animation: floatUp .8s ease-out forwards;\n  }\n  @keyframes floatUp {\n    0% { opacity: 0; transform: translate(-50%, 4px); }\n    18% { opacity: 1; }\n    100% { opacity: 0; transform: translate(-50%, -38px); }\n  }\n\n  /* ---------- 工具栏 ---------- */\n  .toolbar {\n    width: min(92vw, 480px);\n    display: flex;\n    gap: 10px;\n    margin-bottom: 14px;\n  }\n  button {\n    font: inherit;\n    font-size: 14px;\n    color: var(--text);\n    background: var(--panel-2);\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    padding: 8px 16px;\n    cursor: pointer;\n    transition: border-color .15s, background .15s, transform .05s, opacity .15s;\n  }\n  button:hover:not(:disabled) { border-color: var(--border-hi); background: #232837; }\n  button:active:not(:disabled) { transform: translateY(1px); }\n  button:disabled { opacity: .38; cursor: not-allowed; }\n  button.primary { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }\n  button.primary:hover:not(:disabled) { background: var(--accent-hi); border-color: var(--accent-hi); }\n  .toolbar .spacer { flex: 1; }\n\n  /* ---------- 棋盘 ---------- */\n  #board {\n    position: relative;\n    width: min(92vw, 480px);\n    aspect-ratio: 1 / 1;\n    background: #14171e;\n    border: 1px solid var(--border);\n    border-radius: 16px;\n    box-shadow: 0 24px 60px rgba(0, 0, 0, .45), inset 0 1px 0 rgba(255,255,255,.03);\n    touch-action: none;\n  }\n  .cell {\n    position: absolute;\n    background: rgba(255, 255, 255, .032);\n    border-radius: 10px;\n  }\n  .tile {\n    position: absolute;\n    transition: left .11s ease-out, top .11s ease-out;\n  }\n  .tile .face {\n    width: 100%; height: 100%;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    border-radius: 10px;\n    font-weight: 700;\n    font-variant-numeric: tabular-nums;\n    letter-spacing: -.02em;\n    background: #2a3040;\n    color: #c8d0e0;\n  }\n  .tile.new .face { animation: appear .18s ease-out; }\n  .tile .face.pop { animation: pop .17s ease-out; }\n  @keyframes appear { from { scale: 0; } to { scale: 1; } }\n  @keyframes pop { 0% { scale: 1; } 45% { scale: 1.15; } 100% { scale: 1; } }\n\n  .tile[data-v=\"2\"]    .face { background: #2a3040; color: #c8d0e0; }\n  .tile[data-v=\"4\"]    .face { background: #323a4e; color: #d5dcec; }\n  .tile[data-v=\"8\"]    .face { background: #3d4a6b; color: #eef1f8; }\n  .tile[data-v=\"16\"]   .face { background: #474d85; color: #f2f4fa; }\n  .tile[data-v=\"32\"]   .face { background: #5b5ad2; color: #ffffff; }\n  .tile[data-v=\"64\"]   .face { background: #6a5ae0; color: #ffffff; }\n  .tile[data-v=\"128\"]  .face { background: #3e8ef7; color: #ffffff; }\n  .tile[data-v=\"256\"]  .face { background: #2f9fd4; color: #ffffff; }\n  .tile[data-v=\"512\"]  .face { background: #1fa98a; color: #ffffff; }\n  .tile[data-v=\"1024\"] .face { background: linear-gradient(135deg, #f5b93b, #e09a10); color: #1a1405; box-shadow: 0 0 26px rgba(240, 168, 30, .40); }\n  .tile[data-v=\"2048\"] .face { background: linear-gradient(135deg, #f0565b, #d63a40); color: #ffffff; box-shadow: 0 0 30px rgba(229, 72, 77, .48); }\n  .tile[data-v=\"super\"].face,\n  .tile[data-v=\"super\"] .face { background: #14171e; color: var(--gold); box-shadow: inset 0 0 0 1px rgba(240,168,30,.55), 0 0 26px rgba(240, 168, 30, .22); }\n\n  /* ---------- 遮罩 ---------- */\n  .overlay {\n    position: absolute; inset: 0; z-index: 10;\n    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;\n    background: rgba(13, 15, 19, .80);\n    backdrop-filter: blur(6px);\n    -webkit-backdrop-filter: blur(6px);\n    border-radius: 16px;\n    animation: fadeIn .22s ease-out;\n  }\n  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }\n  .overlay.hidden { display: none; }\n  .ov-title { font-size: 30px; font-weight: 800; letter-spacing: -.01em; }\n  .overlay.win .ov-title { background: linear-gradient(135deg, #f5b93b, #ffe9a8); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }\n  .ov-sub { font-size: 14px; color: var(--muted); margin-bottom: 10px; }\n  .ov-sub b { color: var(--gold); font-size: 18px; }\n  .ov-btns { display: flex; gap: 10px; margin-top: 4px; }\n\n  /* ---------- 页脚 ---------- */\n  footer {\n    width: min(92vw, 480px);\n    margin-top: 18px;\n    display: flex;\n    flex-wrap: wrap;\n    gap: 8px 20px;\n    font-size: 12.5px;\n    color: var(--muted);\n  }\n  footer span { display: inline-flex; align-items: center; gap: 6px; }\n  footer kbd {\n    font-family: inherit;\n    font-size: 11px;\n    background: var(--panel-2);\n    border: 1px solid var(--border);\n    border-bottom-width: 2px;\n    border-radius: 5px;\n    padding: 1px 6px;\n    color: #b9c2d4;\n  }\n\n  @media (max-width: 420px) {\n    .top { flex-direction: column; align-items: stretch; gap: 12px; }\n    .scores { justify-content: stretch; }\n    .score-box { flex: 1; }\n  }\n"; document.head.appendChild(style); document.body.innerHTML="\n\n  <header class=\"top\">\n    <div class=\"brand\">\n      <div class=\"logo\">1024</div>\n      <p class=\"tagline\">滑动合并相同数字 · 冲击 <b>1024</b>，挑战 <b>2048</b></p>\n    </div>\n    <div class=\"scores\">\n      <div class=\"score-box\" id=\"score-box\"><span class=\"label\">分数</span><span class=\"val\" id=\"score\">0</span></div>\n      <div class=\"score-box\" id=\"best-box\"><span class=\"label\">最高分</span><span class=\"val\" id=\"best\">0</span></div>\n    </div>\n  </header>\n\n  <div class=\"toolbar\">\n    <button id=\"btn-new\" class=\"primary\">新游戏</button>\n    <button id=\"btn-undo\" disabled>撤销</button>\n    <span class=\"spacer\"></span>\n    <button id=\"btn-sound\">音效：开</button>\n  </div>\n\n  <div id=\"board\">\n    <div id=\"grid-bg\"></div>\n    <div id=\"tiles\"></div>\n    <div id=\"overlay\" class=\"overlay hidden\">\n      <div class=\"ov-title\" id=\"ov-title\"></div>\n      <div class=\"ov-sub\" id=\"ov-sub\"></div>\n      <div class=\"ov-btns\">\n        <button id=\"ov-main\" class=\"primary\"></button>\n        <button id=\"ov-alt\"></button>\n      </div>\n    </div>\n  </div>\n\n  <footer>\n    <span><kbd>↑↓←→</kbd> / <kbd>WASD</kbd> 移动</span>\n    <span><kbd>Z</kbd> 撤销</span>\n    <span><kbd>R</kbd> 重开</span>\n    <span>📱 触屏滑动同样有效</span>\n  </footer>\n\n";

(function () {
  "use strict";

  var SIZE = 4;
  var ANIM = 110;      // 滑动动画时长(ms)，与 CSS transition 对应
  var WIN = 1024;
  var HISTORY_MAX = 20;

  var boardEl   = document.getElementById("board");
  var gridBgEl  = document.getElementById("grid-bg");
  var tilesEl   = document.getElementById("tiles");
  var overlayEl = document.getElementById("overlay");
  var ovTitle   = document.getElementById("ov-title");
  var ovSub     = document.getElementById("ov-sub");
  var ovMain    = document.getElementById("ov-main");
  var ovAlt     = document.getElementById("ov-alt");
  var scoreEl   = document.getElementById("score");
  var bestEl    = document.getElementById("best");
  var scoreBox  = document.getElementById("score-box");
  var bestBox   = document.getElementById("best-box");
  var btnNew    = document.getElementById("btn-new");
  var btnUndo   = document.getElementById("btn-undo");
  var btnSound  = document.getElementById("btn-sound");

  var VECTORS = { up: { r: -1, c: 0 }, down: { r: 1, c: 0 }, left: { r: 0, c: -1 }, right: { r: 0, c: 1 } };

  var cellSize = 0, pad = 0, gap = 0;
  var grid = [];        // grid[r][c] = tile | null
  var tiles = [];       // 所有存活 tile
  var uid = 0;
  var score = 0;
  var best = parseInt(localStorage.getItem("best-1024") || "0", 10) || 0;
  var history = [];
  var animating = false;
  var won = false, over = false;
  var soundOn = localStorage.getItem("sound-1024") !== "off";

  /* ================= 音效（Web Audio，无外部资源） ================= */
  var actx = null;
  function beep(freq, dur, type, vol, delay) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var t = actx.currentTime + (delay || 0);
      var o = actx.createOscillator();
      var g = actx.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol || 0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.08));
      o.connect(g); g.connect(actx.destination);
      o.start(t); o.stop(t + (dur || 0.08) + 0.03);
    } catch (e) { /* 音频不可用时静默降级 */ }
  }
  var MERGE_FREQ = { 4: 294, 8: 330, 16: 392, 32: 440, 64: 494, 128: 587, 256: 659, 512: 784, 1024: 880, 2048: 988 };
  function sndMove()  { beep(170 + Math.random() * 50, 0.05, "triangle", 0.028); }
  function sndMerge(v) {
    var f = MERGE_FREQ[v] || 1046;
    beep(f, 0.09, "sine", 0.05);
    beep(f * 1.5, 0.09, "sine", 0.022, 0.035);
  }
  function sndWin()   { [523, 659, 784, 1046].forEach(function (f, i) { beep(f, 0.14, "triangle", 0.055, i * 0.09); }); }
  function sndOver()  { beep(233, 0.22, "sine", 0.05); beep(175, 0.30, "sine", 0.045, 0.14); }
  function sndClick() { beep(660, 0.04, "triangle", 0.03); }

  /* ================= 布局 ================= */
  function layout() {
    var w = boardEl.clientWidth;
    pad = Math.max(8, Math.round(w * 0.028));
    gap = pad;
    cellSize = (w - pad * (SIZE + 1)) / SIZE;

    gridBgEl.innerHTML = "";
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var d = document.createElement("div");
        d.className = "cell";
        d.style.width = d.style.height = cellSize + "px";
        d.style.left = pad + c * (cellSize + gap) + "px";
        d.style.top  = pad + r * (cellSize + gap) + "px";
        gridBgEl.appendChild(d);
      }
    }
    for (var i = 0; i < tiles.length; i++) renderTile(tiles[i]);
  }

  function fontFor(v) {
    var len = String(v).length;
    var ratio = len <= 2 ? 0.44 : len === 3 ? 0.36 : len === 4 ? 0.30 : 0.25;
    return Math.round(cellSize * ratio) + "px";
  }

  function renderTile(t) {
    t.el.style.width = t.el.style.height = cellSize + "px";
    t.el.style.left = pad + t.c * (cellSize + gap) + "px";
    t.el.style.top  = pad + t.r * (cellSize + gap) + "px";
    var face = t.el.firstChild;
    face.textContent = t.value;
    face.style.fontSize = fontFor(t.value);
    t.el.dataset.v = t.value > 2048 ? "super" : String(t.value);
  }

  function createTile(r, c, value, isNew) {
    var el = document.createElement("div");
    el.className = "tile" + (isNew ? " new" : "");
    var face = document.createElement("div");
    face.className = "face";
    el.appendChild(face);
    var t = { id: ++uid, value: value, r: r, c: c, el: el, merged: false };
    renderTile(t);
    tilesEl.appendChild(el);
    return t;
  }

  /* ================= 游戏逻辑 ================= */
  function emptyGrid() {
    var g = [];
    for (var r = 0; r < SIZE; r++) { g.push([]); for (var c = 0; c < SIZE; c++) g[r].push(null); }
    return g;
  }

  function addRandom() {
    var empty = [];
    for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) if (!grid[r][c]) empty.push([r, c]);
    if (!empty.length) return;
    var pick = empty[Math.floor(Math.random() * empty.length)];
    var t = createTile(pick[0], pick[1], Math.random() < 0.9 ? 2 : 4, true);
    grid[pick[0]][pick[1]] = t;
    tiles.push(t);
  }

  function movesAvailable() {
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var t = grid[r][c];
        if (!t) return true;
        if (c + 1 < SIZE && grid[r][c + 1] && grid[r][c + 1].value === t.value) return true;
        if (r + 1 < SIZE && grid[r + 1][c] && grid[r + 1][c].value === t.value) return true;
      }
    }
    return false;
  }

  function snapshot() {
    return {
      tiles: tiles.map(function (t) { return { id: t.id, value: t.value, r: t.r, c: t.c }; }),
      score: score
    };
  }

  function saveHistory() {
    history.push(snapshot());
    if (history.length > HISTORY_MAX) history.shift();
    refreshUndoBtn();
  }

  function move(dir) {
    if (animating || over) return;
    var vec = VECTORS[dir];
    if (!vec) return;

    var rows = [], cols = [], i;
    for (i = 0; i < SIZE; i++) { rows.push(i); cols.push(i); }
    if (vec.r === 1) rows.reverse();   // 向下：从底部行开始
    if (vec.c === 1) cols.reverse();   // 向右：从最右列开始

    saveHistory();

    var moved = false, gained = 0;
    var merges = [];
    for (i = 0; i < tiles.length; i++) tiles[i].merged = false;

    for (var ri = 0; ri < SIZE; ri++) {
      for (var ci = 0; ci < SIZE; ci++) {
        var r = rows[ri], c = cols[ci];
        var t = grid[r][c];
        if (!t || t.merged) continue;

        var nr = r, nc = c, doMerge = null;
        while (true) {
          var tr = nr + vec.r, tc = nc + vec.c;
          if (tr < 0 || tr >= SIZE || tc < 0 || tc >= SIZE) break;
          var occ = grid[tr][tc];
          if (!occ) { nr = tr; nc = tc; continue; }
          if (occ.value === t.value && !occ.merged) {
            doMerge = occ;
            nr = tr; nc = tc;
          }
          break;
        }

        if (doMerge) {
          // t 滑入 doMerge 所在格，动画结束后翻倍
          grid[r][c] = null;
          t.r = nr; t.c = nc; t.merged = true;
          doMerge.merged = true;
          merges.push({ survivor: doMerge, absorbed: t, value: doMerge.value * 2 });
          gained += doMerge.value * 2;
          moved = true;
        } else if (nr !== r || nc !== c) {
          grid[r][c] = null;
          grid[nr][nc] = t;
          t.r = nr; t.c = nc;
          moved = true;
        }
      }
    }

    if (!moved) {
      history.pop();
      refreshUndoBtn();
      return;
    }

    score += gained;
    updateScore(gained);
    if (gained > 0) sndMerge(merges[0].value); else sndMove();

    animating = true;
    for (i = 0; i < tiles.length; i++) renderTile(tiles[i]); // 触发滑动过渡

    setTimeout(function () {
      // 应用合并：移除被吸收的 tile，survivor 翻倍 + 弹跳
      for (var j = 0; j < merges.length; j++) {
        var m = merges[j];
        m.absorbed.el.remove();
        tiles = tiles.filter(function (x) { return x !== m.absorbed; });
        m.survivor.value = m.value;
        renderTile(m.survivor);
        m.survivor.el.firstChild.classList.add("pop");
        (function (face) {
          setTimeout(function () { face.classList.remove("pop"); }, 180);
        })(m.survivor.el.firstChild);
      }

      addRandom();

      if (!won && tiles.some(function (t) { return t.value >= WIN; })) {
        won = true;
        showOverlay("win");
        sndWin();
      } else if (!movesAvailable()) {
        over = true;
        showOverlay("over");
        sndOver();
      }
      animating = false;
    }, ANIM);
  }

  /* ================= 状态与界面 ================= */
  function updateScore(delta) {
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      localStorage.setItem("best-1024", String(best));
      bestEl.textContent = best;
      bump(bestBox);
    }
    if (delta > 0) {
      var f = document.createElement("span");
      f.className = "float-add";
      f.textContent = "+" + delta;
      scoreBox.appendChild(f);
      setTimeout(function () { f.remove(); }, 820);
      bump(scoreBox);
    }
  }
  function bump(el) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }

  function refreshUndoBtn() { btnUndo.disabled = history.length === 0; }

  function showOverlay(type) {
    overlayEl.classList.remove("hidden", "win", "over");
    overlayEl.classList.add(type);
    if (type === "win") {
      ovTitle.textContent = "1024 达成！";
      ovSub.innerHTML = "总分 <b>" + score + "</b> · 继续滑动，挑战 2048";
      ovMain.textContent = "继续挑战";
      ovMain.onclick = function () { sndClick(); hideOverlay(); };
      ovAlt.textContent = "新游戏";
      ovAlt.onclick = function () { sndClick(); newGame(); };
    } else {
      ovTitle.textContent = "游戏结束";
      ovSub.innerHTML = "最终得分 <b>" + score + "</b> · 最高分 " + best;
      ovMain.textContent = "再来一局";
      ovMain.onclick = function () { sndClick(); newGame(); };
      ovAlt.textContent = "撤销一步";
      ovAlt.onclick = function () { sndClick(); undo(); };
    }
  }
  function hideOverlay() { overlayEl.classList.add("hidden"); }

  function newGame() {
    tilesEl.innerHTML = "";
    tiles = [];
    grid = emptyGrid();
    score = 0;
    history = [];
    won = false;
    over = false;
    animating = false;
    hideOverlay();
    layout();
    addRandom();
    addRandom();
    updateScore(0);
    refreshUndoBtn();
  }

  function undo() {
    if (animating || !history.length) return;
    var h = history.pop();
    tilesEl.innerHTML = "";
    tiles = [];
    grid = emptyGrid();
    h.tiles.forEach(function (s) {
      var t = createTile(s.r, s.c, s.value, false);
      tiles.push(t);
      grid[s.r][s.c] = t;
    });
    score = h.score;
    over = false;
    hideOverlay();
    updateScore(0);
    refreshUndoBtn();
    sndClick();
  }

  function updateSoundBtn() { btnSound.textContent = soundOn ? "音效：开" : "音效：关"; }

  /* ================= 输入 ================= */
  var KEYMAP = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", a: "left", s: "down", d: "right",
    W: "up", A: "left", S: "down", D: "right",
    k: "up", h: "left", j: "down", l: "right"
  };
  window.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var dir = KEYMAP[e.key];
    if (dir) { e.preventDefault(); move(dir); return; }
    if (e.key === "z" || e.key === "Z") { e.preventDefault(); undo(); }
    else if (e.key === "r" || e.key === "R") { e.preventDefault(); newGame(); }
  });

  var tsx = 0, tsy = 0;
  boardEl.addEventListener("touchstart", function (e) {
    var t = e.changedTouches[0];
    tsx = t.clientX; tsy = t.clientY;
  }, { passive: true });
  boardEl.addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });
  boardEl.addEventListener("touchend", function (e) {
    var t = e.changedTouches[0];
    var dx = t.clientX - tsx, dy = t.clientY - tsy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  });

  btnNew.addEventListener("click", function () { sndClick(); newGame(); });
  btnUndo.addEventListener("click", function () { undo(); });
  btnSound.addEventListener("click", function () {
    soundOn = !soundOn;
    localStorage.setItem("sound-1024", soundOn ? "on" : "off");
    updateSoundBtn();
    if (soundOn) sndClick();
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 80);
  });

  /* ================= 启动 ================= */
  bestEl.textContent = best;
  updateSoundBtn();
  layout();
  newGame();
})();
