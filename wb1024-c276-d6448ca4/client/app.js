/* =========================================================
   1024 像素画板  —  32×32 = 1024 像素（零依赖）
   ========================================================= */
(function () {
  "use strict";

  const SIZE = 32;
  const COUNT = SIZE * SIZE;
  const STORE_KEY = "wb1024_pixel_v1";

  // 调色板：0 = 背景/橡皮，其余为颜料色
  const PALETTE = [
    "#0a0e14", // 0 背景/橡皮
    "#39ff14", // 1 荧光绿
    "#2dd4bf", // 2 青
    "#f472b6", // 3 粉
    "#f59e0b", // 4 橙
    "#60a5fa", // 5 蓝
    "#ffffff", // 6 白
    "#a78bfa", // 7 紫
    "#fca5a5", // 8 红粉
    "#34d399"  // 9 绿2
  ];
  const BINARY_PALETTE = [PALETTE[0], PALETTE[1]];

  // 状态
  let grid = new Array(COUNT).fill(0);
  let currentColor = 1;
  let tool = "paint";
  let mirrorOn = false;
  let binaryOn = false;
  let isDrawing = false;
  const cells = [];

  /* ---------- DOM ---------- */
  const gridEl = document.getElementById("grid");
  const paletteEl = document.getElementById("palette");
  const hintEl = document.getElementById("hint");
  const toastEl = document.getElementById("toast");

  /* ---------- 工具函数 ---------- */
  function idx(row, col) { return row * SIZE + col; }
  function rowOf(i) { return (i / SIZE) | 0; }
  function colOf(i) { return i % SIZE; }
  function mirrorIndex(i) { return idx(rowOf(i), SIZE - 1 - colOf(i)); }

  function setCell(i, c, doMirror) {
    if (i < 0 || i >= COUNT) return;
    grid[i] = c;
    paintCell(i);
    if (doMirror && mirrorOn) {
      const m = mirrorIndex(i);
      grid[m] = c;
      paintCell(m);
    }
  }

  function paintCell(i) {
    const c = cells[i];
    if (!c) return;
    c.style.background = PALETTE[grid[i]];
    if (binaryOn) c.classList.toggle("on", grid[i] !== 0);
  }

  function refreshAll() { for (let i = 0; i < COUNT; i++) paintCell(i); }

  /* ---------- 持久化 ---------- */
  function save() {
    try { localStorage.setItem(STORE_KEY, serialize()); } catch (e) { /* ignore */ }
  }
  function serialize() {
    let s = "";
    for (let i = 0; i < COUNT; i++) s += grid[i].toString(16); // 0-f，每格 1 字符
    return s;
  }
  function deserialize(str) {
    if (!str || str.length !== COUNT) return false;
    for (let i = 0; i < COUNT; i++) {
      const v = parseInt(str[i], 16);
      if (isNaN(v) || v < 0 || v >= PALETTE.length) return false;
      grid[i] = v;
    }
    return true;
  }

  /* ---------- 调色板渲染 ---------- */
  function renderPalette() {
    const list = binaryOn ? BINARY_PALETTE : PALETTE;
    paletteEl.innerHTML = "";
    list.forEach((color, localIndex) => {
      // localIndex 在 binary 模式下：0=背景,1=绿；普通模式即全局索引
      const globalIndex = binaryOn ? (localIndex === 0 ? 0 : 1) : localIndex;
      const sw = document.createElement("div");
      sw.className = "swatch" + (globalIndex === 0 ? " eraser" : "") + (globalIndex === currentColor ? " active" : "");
      sw.style.background = color;
      sw.title = globalIndex === 0 ? "橡皮 / 背景" : color;
      if (globalIndex === 0) sw.innerHTML = '<span class="lbl">⌫</span>';
      sw.addEventListener("click", () => {
        currentColor = globalIndex;
        if (tool === "erase") setTool("paint");
        renderPalette();
      });
      paletteEl.appendChild(sw);
    });
  }

  /* ---------- 工具切换 ---------- */
  function setTool(name) {
    tool = name;
    document.querySelectorAll("#tools .tool").forEach((b) => {
      b.classList.toggle("active", b.dataset.tool === name);
    });
  }

  /* ---------- 绘制交互 ---------- */
  function applyTool(i, isDrag) {
    if (i == null) return;
    if (tool === "fill" && !isDrag) {
      floodFill(i, currentColor);
    } else {
      const c = tool === "erase" ? 0 : currentColor;
      setCell(i, c, true);
    }
    save();
  }

  function floodFill(start, c) {
    const target = grid[start];
    if (target === c) return;
    const stack = [start];
    while (stack.length) {
      const cur = stack.pop();
      if (grid[cur] !== target) continue;
      setCell(cur, c, false);
      const r = rowOf(cur), col = colOf(cur);
      if (r > 0) stack.push(idx(r - 1, col));
      if (r < SIZE - 1) stack.push(idx(r + 1, col));
      if (col > 0) stack.push(idx(r, col - 1));
      if (col < SIZE - 1) stack.push(idx(r, col + 1));
    }
  }

  function cellIndexFromEvent(e) {
    const t = e.pointerType === "touch" ? document.elementFromPoint(e.clientX, e.clientY) : e.target;
    if (!t || !t.classList || !t.classList.contains("cell")) return null;
    return parseInt(t.dataset.i, 10);
  }

  function initGrid() {
    gridEl.innerHTML = "";
    for (let i = 0; i < COUNT; i++) {
      const c = document.createElement("div");
      c.className = "cell";
      c.dataset.i = i;
      cells[i] = c;
      gridEl.appendChild(c);
    }
    // 事件委托：指针按下 / 移动
    gridEl.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      isDrawing = true;
      applyTool(cellIndexFromEvent(e), false);
    });
    gridEl.addEventListener("pointermove", (e) => {
      if (!isDrawing) return;
      applyTool(cellIndexFromEvent(e), true);
    });
    window.addEventListener("pointerup", () => { isDrawing = false; });
    gridEl.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  /* ---------- 预设图案 ---------- */
  const FONT = {
    "0": ["01110","10001","10011","10101","11001","10001","01110"],
    "1": ["00100","01100","00100","00100","00100","00100","01110"],
    "2": ["01110","10001","00001","00010","00100","01000","11111"],
    "3": ["11111","00010","00100","00010","00001","10001","01110"],
    "4": ["00010","00110","01010","10010","11111","00010","00010"],
    "5": ["11111","10000","11110","00001","00001","10001","01110"],
    "6": ["00110","01000","10000","11110","10001","10001","01110"],
    "7": ["11111","00001","00010","00100","01000","01000","01000"],
    "8": ["01110","10001","10001","01110","10001","10001","01110"],
    "9": ["01110","10001","10001","01111","00001","00010","01100"]
  };

  function drawText(str, color) {
    clearGrid(false);
    const n = str.length;
    const totalW = n * 5 + (n - 1) * 1;
    const startX = Math.floor((SIZE - totalW) / 2);
    const startY = Math.floor((SIZE - 7) / 2);
    for (let k = 0; k < n; k++) {
      const glyph = FONT[str[k]];
      if (!glyph) continue;
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) {
          if (glyph[r][c] === "1") {
            const x = startX + k * 6 + c;
            const y = startY + r;
            if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) setCell(idx(y, x), color, false);
          }
        }
      }
    }
    save();
  }

  function drawHeart(color) {
    clearGrid(false);
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const nx = (c - 16) / 9;
        const ny = (8 - r) / 9;
        const v = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny;
        if (v <= 0) setCell(idx(r, c), color, false);
      }
    }
    save();
  }

  function drawSmile(face, bg) {
    clearGrid(false);
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const d = Math.hypot(c - 16, r - 16);
        let v = 0;
        if (d <= 13) v = face;                                   // 脸
        if (Math.hypot(c - 11, r - 11) <= 2 || Math.hypot(c - 21, r - 11) <= 2) v = bg; // 眼
        if (r >= 19 && Math.hypot(c - 16, r - 20) <= 7 && Math.hypot(c - 16, r - 20) >= 4) v = bg; // 嘴
        if (v) setCell(idx(r, c), v, false);
      }
    }
    save();
  }

  function randomize() {
    for (let i = 0; i < COUNT; i++) {
      grid[i] = Math.random() < 0.14 ? (1 + Math.floor(Math.random() * 9)) : 0;
    }
    refreshAll();
    save();
  }

  function clearGrid(doSave) {
    for (let i = 0; i < COUNT; i++) grid[i] = 0;
    refreshAll();
    if (doSave !== false) save();
  }

  /* ---------- 导出 PNG ---------- */
  function exportPNG() {
    const ec = document.getElementById("export-canvas");
    if (!ec) return;
    const ctx = ec.getContext("2d");
    const px = ec.width / SIZE;
    ctx.clearRect(0, 0, ec.width, ec.height);
    for (let i = 0; i < COUNT; i++) {
      ctx.fillStyle = PALETTE[grid[i]];
      ctx.fillRect(colOf(i) * px, rowOf(i) * px, px, px);
    }
    const finish = (url, revoke) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = "1024-pixel-art.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (revoke) setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    if (ec.toBlob) {
      ec.toBlob((blob) => finish(URL.createObjectURL(blob), true), "image/png");
    } else {
      finish(ec.toDataURL("image/png"), false);
    }
    toast("已保存 PNG ✅");
  }

  /* ---------- 分享链接 ---------- */
  function shareLink() {
    const hex = serialize();
    const url = location.origin + location.pathname + "#d=" + hex;
    try { history.replaceState(null, "", "#d=" + hex); } catch (e) { /* ignore */ }
    const copy = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => toast("分享链接已复制 ✅")).catch(fallback);
      } else fallback();
    };
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = url; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast("分享链接已复制 ✅"); }
      catch (e) { toast("复制失败，链接已写入地址栏"); }
      ta.remove();
    };
    copy();
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  /* ---------- 代码雨背景 ---------- */
  function initRain() {
    const canvas = document.getElementById("rain");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, cols, drops;
    const fontSize = 16;
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.floor(w / fontSize);
      drops = new Array(cols).fill(1).map(() => Math.random() * -100);
    }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      ctx.fillStyle = "rgba(10, 14, 20, 0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = fontSize + "px monospace";
      for (let i = 0; i < cols; i++) {
        const ch = Math.random() < 0.5 ? "0" : "1";
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        if (Math.random() < 0.012) { ctx.fillStyle = "#39ff14"; ctx.fillText("1024", x, y); }
        else { ctx.fillStyle = Math.random() < 0.05 ? "#2dd4bf" : "#1f6f63"; ctx.fillText(ch, x, y); }
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.6;
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------- 进场动画 ---------- */
  function initReveal() {
    const els = document.querySelectorAll(".section, .hero");
    els.forEach((el) => el.classList.add("fade-up"));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.08 });
      els.forEach((el) => io.observe(el));
    } else {
      els.forEach((el) => el.classList.add("in"));
    }
    const hero = document.querySelector(".hero");
    if (hero) hero.classList.add("in");
  }

  /* ---------- 启动 ---------- */
  function init() {
    initGrid();
    renderPalette();
    setTool("paint");

    // 1) 优先：分享链接还原  2) 其次：本地存储  3) 默认：1024 字样
    const m = location.hash && location.hash.match(/d=([0-9a-f]+)/i);
    if (m && deserialize(m[1])) {
      refreshAll();
    } else {
      let loaded = false;
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw && deserialize(raw)) { refreshAll(); loaded = true; }
      } catch (e) { /* ignore */ }
      if (!loaded) drawText("1024", 1);
    }

    // 工具栏
    document.getElementById("tools").addEventListener("click", (e) => {
      const b = e.target.closest("[data-tool]");
      if (b) setTool(b.dataset.tool);
    });
    const mirrorBtn = document.getElementById("btn-mirror");
    mirrorBtn.addEventListener("click", () => {
      mirrorOn = !mirrorOn;
      mirrorBtn.classList.toggle("active", mirrorOn);
    });
    const binaryBtn = document.getElementById("btn-binary");
    binaryBtn.addEventListener("click", () => {
      binaryOn = !binaryOn;
      binaryBtn.classList.toggle("active", binaryOn);
      gridEl.classList.toggle("binary", binaryOn);
      if (binaryOn) { currentColor = 1; setTool("paint"); }
      renderPalette();
      refreshAll();
    });
    document.getElementById("btn-random").addEventListener("click", randomize);
    document.getElementById("btn-clear").addEventListener("click", () => { clearGrid(true); toast("已清空"); });

    // 预设
    document.querySelectorAll(".preset").forEach((b) => {
      b.addEventListener("click", () => {
        const p = b.dataset.preset;
        if (p === "text") drawText("1024", 1);
        else if (p === "heart") drawHeart(3);
        else if (p === "smile") drawSmile(4, 0);
        else if (p === "random") randomize();
        toast("已载入预设：" + b.textContent.trim());
      });
    });

    // 导出 / 分享
    document.getElementById("btn-png").addEventListener("click", exportPNG);
    document.getElementById("btn-share").addEventListener("click", shareLink);

    initRain();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
