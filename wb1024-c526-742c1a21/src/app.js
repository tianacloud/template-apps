document.title = "比特造物工坊";
const style=document.createElement("style");style.textContent=":root {\n  --bg: #070b07;\n  --bg-soft: #0d140d;\n  --panel: rgba(16, 24, 16, 0.72);\n  --panel-border: rgba(200, 255, 61, 0.22);\n  --lime: #c8ff3d;\n  --lime-dim: #8fbf2e;\n  --text: #d7e4d0;\n  --text-dim: #7e8c78;\n  --mono: \"JetBrains Mono\", \"Fira Code\", \"SF Mono\", \"Cascadia Code\", Consolas, \"Courier New\", monospace;\n}\n\n* { box-sizing: border-box; margin: 0; padding: 0; }\n\nhtml { scroll-behavior: smooth; }\n\nbody {\n  background:\n    radial-gradient(1200px 600px at 50% -10%, rgba(200, 255, 61, 0.08), transparent 60%),\n    var(--bg);\n  color: var(--text);\n  font-family: var(--mono);\n  line-height: 1.6;\n  min-height: 100vh;\n  overflow-x: hidden;\n}\n\n#rain {\n  position: fixed;\n  inset: 0;\n  z-index: 0;\n  opacity: 0.18;\n  pointer-events: none;\n}\n\n/* ---------- Hero ---------- */\n.hero {\n  position: relative;\n  z-index: 1;\n  text-align: center;\n  padding: 72px 20px 36px;\n}\n.badge {\n  display: inline-block;\n  font-size: 14px;\n  letter-spacing: 2px;\n  color: var(--lime);\n  border: 1px solid var(--panel-border);\n  border-radius: 999px;\n  padding: 4px 14px;\n  margin-bottom: 18px;\n  background: var(--panel);\n}\n.badge sup { color: var(--text-dim); }\nh1.glitch {\n  font-size: clamp(34px, 7vw, 72px);\n  letter-spacing: 4px;\n  color: #fff;\n  text-shadow: 0 0 18px rgba(200, 255, 61, 0.45);\n  position: relative;\n}\n.subtitle {\n  margin-top: 14px;\n  font-size: clamp(13px, 2.4vw, 18px);\n  color: var(--lime);\n}\n.tagline {\n  margin-top: 8px;\n  font-size: 12px;\n  color: var(--text-dim);\n  letter-spacing: 1px;\n}\n\n/* ---------- Layout ---------- */\n.container {\n  position: relative;\n  z-index: 1;\n  max-width: 1080px;\n  margin: 0 auto;\n  padding: 0 20px 60px;\n}\n.grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 20px;\n  margin-top: 20px;\n}\n@media (max-width: 760px) {\n  .grid { grid-template-columns: 1fr; }\n}\n\n.card {\n  background: var(--panel);\n  border: 1px solid var(--panel-border);\n  border-radius: 16px;\n  padding: 20px;\n  backdrop-filter: blur(8px);\n  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);\n}\n.card-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 14px;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n.card-head h2 {\n  font-size: 16px;\n  color: var(--lime);\n  letter-spacing: 1px;\n}\n\n/* ---------- Input ---------- */\n.input-card { margin-top: 20px; }\ntextarea {\n  width: 100%;\n  background: #0a0f0a;\n  border: 1px solid var(--panel-border);\n  border-radius: 10px;\n  color: var(--text);\n  font-family: var(--mono);\n  font-size: 15px;\n  padding: 12px 14px;\n  resize: vertical;\n  outline: none;\n}\ntextarea:focus { border-color: var(--lime); box-shadow: 0 0 0 2px rgba(200,255,61,0.15); }\n\n.stats {\n  display: flex;\n  gap: 14px;\n  margin-top: 14px;\n}\n.stat {\n  flex: 1;\n  background: #0a0f0a;\n  border: 1px solid var(--panel-border);\n  border-radius: 10px;\n  padding: 10px;\n  text-align: center;\n}\n.stat .num { display: block; font-size: 24px; color: var(--lime); font-weight: 700; }\n.stat .lbl { font-size: 11px; color: var(--text-dim); }\n\n.progress-wrap {\n  position: relative;\n  margin-top: 14px;\n  height: 26px;\n  background: #0a0f0a;\n  border: 1px solid var(--panel-border);\n  border-radius: 999px;\n  overflow: hidden;\n}\n.progress-bar {\n  height: 100%;\n  width: 0%;\n  background: linear-gradient(90deg, var(--lime-dim), var(--lime));\n  transition: width 0.25s ease;\n}\n.progress-text {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 12px;\n  color: var(--text);\n}\n\n/* ---------- Bits ---------- */\n.seg {\n  display: inline-flex;\n  border: 1px solid var(--panel-border);\n  border-radius: 8px;\n  overflow: hidden;\n}\n.seg-btn {\n  background: transparent;\n  border: none;\n  color: var(--text-dim);\n  padding: 6px 12px;\n  font-family: var(--mono);\n  cursor: pointer;\n  font-size: 12px;\n}\n.seg-btn.active { background: var(--lime); color: #07120a; font-weight: 700; }\n\n.bits {\n  max-height: 320px;\n  overflow-y: auto;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  align-content: flex-start;\n}\n.byte-group {\n  display: inline-flex;\n  flex-direction: column;\n  align-items: center;\n  border: 1px solid var(--panel-border);\n  border-radius: 8px;\n  padding: 6px 4px;\n  background: #0a0f0a;\n}\n.byte-ch {\n  font-size: 11px;\n  color: var(--text-dim);\n  margin-bottom: 4px;\n  max-width: 40px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.bit-row { display: flex; gap: 2px; }\n.bit {\n  width: 12px; height: 16px;\n  display: flex; align-items: center; justify-content: center;\n  font-size: 10px;\n  border-radius: 3px;\n}\n.bit.on { background: var(--lime); color: #07120a; font-weight: 700; }\n.bit.off { background: #162016; color: #3c4a3c; }\n\n/* ---------- Canvas ---------- */\n#bitCanvas, #viz {\n  width: 100%;\n  height: auto;\n  display: block;\n  background: #060a06;\n  border: 1px solid var(--panel-border);\n  border-radius: 10px;\n}\n.hint { font-size: 11px; color: var(--text-dim); margin-top: 10px; }\n\n/* ---------- Buttons ---------- */\n.ghost-btn, .primary-btn {\n  font-family: var(--mono);\n  cursor: pointer;\n  border-radius: 8px;\n  padding: 7px 14px;\n  font-size: 13px;\n  border: 1px solid var(--panel-border);\n  background: transparent;\n  color: var(--lime);\n  transition: all 0.15s ease;\n}\n.ghost-btn:hover { background: rgba(200,255,61,0.12); }\n.primary-btn { background: var(--lime); color: #07120a; font-weight: 700; border-color: var(--lime); }\n.primary-btn:hover { filter: brightness(1.1); }\n.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }\n\n.music-ctrl { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }\n.tempo { font-size: 12px; color: var(--text-dim); display: inline-flex; align-items: center; gap: 6px; }\n.tempo input[type=\"range\"] { accent-color: var(--lime); }\n#tempoVal { color: var(--lime); }\n\n/* ---------- Footer ---------- */\n.foot {\n  position: relative;\n  z-index: 1;\n  text-align: center;\n  padding: 30px 20px 50px;\n  color: var(--text-dim);\n  font-size: 12px;\n}\n.foot .series { margin-bottom: 10px; }\n.foot .series a {\n  color: var(--lime);\n  text-decoration: none;\n  border-bottom: 1px dashed var(--panel-border);\n}\n.foot .series a:hover { border-bottom-style: solid; }\n\n/* ---------- Egg ---------- */\n.egg {\n  position: fixed;\n  inset: 0;\n  z-index: 50;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(3, 6, 3, 0.85);\n  transition: opacity 0.4s ease;\n}\n.egg.hidden { opacity: 0; pointer-events: none; }\n#eggCanvas { position: absolute; inset: 0; width: 100%; height: 100%; }\n.egg-text {\n  position: relative;\n  font-size: clamp(80px, 22vw, 240px);\n  font-weight: 800;\n  color: var(--lime);\n  text-shadow: 0 0 40px rgba(200,255,61,0.7);\n  text-align: center;\n  line-height: 1;\n}\n.egg-text small {\n  display: block;\n  font-size: 18px;\n  letter-spacing: 4px;\n  color: var(--text);\n  margin-top: 10px;\n  text-shadow: none;\n}\n";document.head.appendChild(style);
document.getElementById("app").innerHTML="\n  <!-- 代码雨背景 -->\n  <canvas id=\"rain\" aria-hidden=\"true\"></canvas>\n\n  <header class=\"hero\">\n    <div class=\"badge\">2<sup>10</sup> = 1024</div>\n    <h1 class=\"glitch\" data-text=\"比特造物工坊\">比特造物工坊</h1>\n    <p class=\"subtitle\">BitForge&nbsp;1024 · 把每一个字符锻造成 0 与 1 的诗</p>\n    <p class=\"tagline\">把文字变成像素与旋律</p>\n  </header>\n\n  <main class=\"container\">\n    <!-- 输入区 -->\n    <section class=\"card input-card\">\n      <div class=\"card-head\">\n        <h2>① 造物原料</h2>\n        <button id=\"randomBtn\" class=\"ghost-btn\" type=\"button\">⚡ 随机造物</button>\n      </div>\n      <textarea id=\"source\" rows=\"4\" placeholder=\"在此输入文字 / 代码 / 任意字符……&#10;它们将实时被锻造成二进制、像素艺术与音乐。\">Hello, 1024!</textarea>\n      <div class=\"stats\" id=\"stats\">\n        <div class=\"stat\"><span class=\"num\" id=\"statChars\">0</span><span class=\"lbl\">字符</span></div>\n        <div class=\"stat\"><span class=\"num\" id=\"statBytes\">0</span><span class=\"lbl\">字节(UTF-8)</span></div>\n        <div class=\"stat\"><span class=\"num\" id=\"statBits\">0</span><span class=\"lbl\">比特</span></div>\n      </div>\n      <div class=\"progress-wrap\" title=\"距离 1024 比特的进度\">\n        <div class=\"progress-bar\" id=\"progressBar\"></div>\n        <span class=\"progress-text\" id=\"progressText\">0 / 1024 bits</span>\n      </div>\n    </section>\n\n    <div class=\"grid\">\n      <!-- 二进制转换 -->\n      <section class=\"card\">\n        <div class=\"card-head\">\n          <h2>② 二进制熔炉</h2>\n          <div class=\"seg\" role=\"tablist\">\n            <button class=\"seg-btn active\" data-mode=\"bin\" type=\"button\">BIN</button>\n            <button class=\"seg-btn\" data-mode=\"hex\" type=\"button\">HEX</button>\n          </div>\n        </div>\n        <div class=\"bits\" id=\"bitsOut\"></div>\n      </section>\n\n      <!-- 比特画板 -->\n      <section class=\"card\">\n        <div class=\"card-head\">\n          <h2>③ 比特画板</h2>\n          <button id=\"exportBtn\" class=\"ghost-btn\" type=\"button\">⬇ 导出 PNG</button>\n        </div>\n        <canvas id=\"bitCanvas\" width=\"512\" height=\"512\"></canvas>\n        <p class=\"hint\">1 → 亮格，0 → 暗格。比特流被铺成最接近正方形的网格。</p>\n      </section>\n    </div>\n\n    <!-- 代码音乐盒 -->\n    <section class=\"card\">\n      <div class=\"card-head\">\n        <h2>④ 代码音乐盒</h2>\n        <div class=\"music-ctrl\">\n          <button id=\"playBtn\" class=\"primary-btn\" type=\"button\">▶ 演奏</button>\n          <button id=\"stopBtn\" class=\"ghost-btn\" type=\"button\">■ 停止</button>\n          <label class=\"tempo\">速度\n            <input type=\"range\" id=\"tempo\" min=\"60\" max=\"400\" value=\"180\" />\n            <span id=\"tempoVal\">180</span> BPM\n          </label>\n        </div>\n      </div>\n      <canvas id=\"viz\" width=\"960\" height=\"120\"></canvas>\n      <p class=\"hint\">每个字节映射为一个五声音阶音符，字符即乐谱。</p>\n    </section>\n  </main>\n\n  <footer class=\"foot\">\n\n    <p>⚡ 用代码造物 · 致敬每一个 1024</p>\n  </footer>\n\n  <!-- 1024 彩蛋 -->\n  <div id=\"egg\" class=\"egg hidden\">\n    <canvas id=\"eggCanvas\"></canvas>\n    <div class=\"egg-text\">1024<small>bits forged</small></div>\n  </div>\n\n  ";
/* =========================================================
   比特造物工坊 · BitForge 1024
   纯前端 · 零依赖 · 程序员节造物挑战参赛作品
   ========================================================= */
(() => {
  "use strict";

  const LIME = "#c8ff3d";
  const DARK = "#162016";
  const encoder = new TextEncoder();

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const source = $("source");
  const bitsOut = $("bitsOut");
  const statChars = $("statChars");
  const statBytes = $("statBytes");
  const statBits = $("statBits");
  const progressBar = $("progressBar");
  const progressText = $("progressText");
  const bitCanvas = $("bitCanvas");
  const bctx = bitCanvas.getContext("2d");
  const viz = $("viz");
  const vctx = viz.getContext("2d");
  const egg = $("egg");
  const eggCanvas = $("eggCanvas");

  let mode = "bin";          // bin | hex
  let bytes = [];            // UTF-8 字节数组
  let bits = [];             // 0/1 数组
  let eggShown = false;

  /* ====================== 代码雨背景 ====================== */
  function initRain() {
    const cv = $("rain");
    const ctx = cv.getContext("2d");
    let cols, drops, fontSize = 14;
    const chars = "01ｱｲｳｴｵ10ABCDEF<>{}[]/*+-=#".split("");

    function resize() {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
      cols = Math.floor(cv.width / fontSize);
      drops = new Array(cols).fill(1);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      ctx.fillStyle = "rgba(7,11,7,0.08)";
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = LIME;
      ctx.font = fontSize + "px monospace";
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > cv.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ====================== 核心：文字 → 比特 ====================== */
  function recompute() {
    const text = source.value;
    bytes = Array.from(encoder.encode(text));
    bits = [];
    for (const b of bytes) {
      for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
    }
    statChars.textContent = [...text].length;
    statBytes.textContent = bytes.length;
    statBits.textContent = bits.length;

    const ratio = Math.min(bits.length / 1024, 1);
    progressBar.style.width = (ratio * 100).toFixed(1) + "%";
    progressText.textContent = bits.length + " / 1024 bits";

    renderBits();
    drawBitCanvas();
    maybeEgg();

    // 音乐谱随原料更新
    buildScore();
  }

  /* ====================== ② 二进制熔炉 ====================== */
  function renderBits() {
    bitsOut.innerHTML = "";
    if (bytes.length === 0) {
      bitsOut.innerHTML = '<span style="color:#7e8c78;font-size:12px">等待造物原料…</span>';
      return;
    }
    const frag = document.createDocumentFragment();
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      const group = document.createElement("div");
      group.className = "byte-group";

      const ch = document.createElement("div");
      ch.className = "byte-ch";
      const c = [...source.value][i] || "";
      ch.textContent = c === " " ? "␣" : c === "\n" ? "⏎" : c;
      group.appendChild(ch);

      const row = document.createElement("div");
      row.className = "bit-row";
      if (mode === "bin") {
        for (let j = 7; j >= 0; j--) {
          const bit = (b >> j) & 1;
          const span = document.createElement("span");
          span.className = "bit " + (bit ? "on" : "off");
          span.textContent = bit;
          row.appendChild(span);
        }
      } else {
        const hex = b.toString(16).toUpperCase().padStart(2, "0");
        const span = document.createElement("span");
        span.className = "bit on";
        span.style.width = "auto";
        span.style.padding = "0 8px";
        span.textContent = hex;
        row.appendChild(span);
      }
      group.appendChild(row);
      frag.appendChild(group);
    }
    bitsOut.appendChild(frag);
  }

  /* ====================== ③ 比特画板 ====================== */
  function drawBitCanvas() {
    const n = bits.length;
    const ctx = bctx;
    ctx.clearRect(0, 0, bitCanvas.width, bitCanvas.height);
    if (n === 0) return;

    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const cell = Math.floor(Math.min(bitCanvas.width / cols, bitCanvas.width / rows));
    const offX = (bitCanvas.width - cell * cols) / 2;
    const offY = (bitCanvas.height - cell * rows) / 2;

    // 同步一次性绘制：输入即出完整像素画，截图/体验都稳定
    for (let idx = 0; idx < n; idx++) {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      const x = offX + c * cell;
      const y = offY + r * cell;
      ctx.fillStyle = bits[idx] === 1 ? LIME : DARK;
      ctx.fillRect(x, y, cell - 1, cell - 1);
    }
  }

  function exportPNG() {
    if (bits.length === 0) return;
    const link = document.createElement("a");
    link.download = "bitforge-1024.png";
    link.href = bitCanvas.toDataURL("image/png");
    link.click();
  }

  /* ====================== ④ 代码音乐盒 ====================== */
  // 五声音阶（C 大调五声）：C D E G A，跨 4 个八度，预生成 256 个频率
  // 关键：把 256 个字节值铺在固定音域内（约 130–1570Hz），避免频率溢出可听范围
  const PENTA = [0, 2, 4, 7, 9];
  const BASE = 130.81; // C3
  const OCTAVES = 4;
  const scaleNotes = [];
  for (let o = 0; o < OCTAVES; o++) {
    for (const n of PENTA) scaleNotes.push(BASE * Math.pow(2, o) * Math.pow(2, n / 12));
  }
  const MAXF = scaleNotes[scaleNotes.length - 1];
  const freqTable = (() => {
    const t = [];
    for (let i = 0; i < 256; i++) {
      const idx = Math.floor((i / 255) * (scaleNotes.length - 1));
      t.push(scaleNotes[idx]);
    }
    return t;
  })();

  let audioCtx = null;
  let score = [];          // {freq, byteIdx}
  let playing = false;
  let playTimer = null;
  let vizRAF = null;

  function buildScore() {
    score = bytes.map((b, i) => ({ freq: freqTable[b], byte: b, i }));
  }

  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function playNote(freq, dur) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  function startPlay() {
    if (bytes.length === 0 || playing) return;
    ensureAudio();
    playing = true;
    $("playBtn").disabled = true;
    let i = 0;
    const bpm = parseInt($("tempo").value, 10);
    const noteLen = 60 / bpm; // 秒
    const interval = noteLen * 1000;

    function tick() {
      if (!playing || i >= score.length) { stopPlay(); return; }
      const s = score[i];
      playNote(s.freq, noteLen * 0.9);
      flashViz(s.freq, i);
      i++;
      playTimer = setTimeout(tick, interval);
    }
    tick();
  }

  function stopPlay() {
    playing = false;
    if (playTimer) clearTimeout(playTimer);
    playTimer = null;
    $("playBtn").disabled = false;
    if (vizRAF) cancelAnimationFrame(vizRAF);
    vctx.clearRect(0, 0, viz.width, viz.height);
  }

  function flashViz(freq, idx) {
    const w = viz.width, h = viz.height;
    vctx.clearRect(0, 0, w, h);
    // 频率 → 高度
    const norm = Math.min((freq - BASE) / (MAXF - BASE), 1);
    const barH = norm * h * 0.9 + 6;
    const x = (idx / Math.max(score.length, 1)) * w;
    vctx.fillStyle = LIME;
    vctx.fillRect(x - 2, h - barH, 4, barH);
    // 扫描线
    vctx.fillStyle = "rgba(200,255,61,0.25)";
    vctx.fillRect(x, 0, 2, h);
  }

  /* ====================== 1024 彩蛋 ====================== */
  function maybeEgg() {
    if (bits.length >= 1024 && !eggShown) {
      eggShown = true;
      showEgg();
    }
    if (bits.length < 1024) eggShown = false; // 允许再次触发
  }

  function showEgg() {
    egg.classList.remove("hidden");
    const cv = eggCanvas;
    const ctx = cv.getContext("2d");
    function resize() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    const parts = [];
    for (let i = 0; i < 160; i++) {
      parts.push({
        x: Math.random() * cv.width,
        y: Math.random() * cv.height,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        r: Math.random() * 4 + 1,
      });
    }
    let t = 0;
    function frame() {
      if (egg.classList.contains("hidden")) return;
      ctx.fillStyle = "rgba(3,6,3,0.25)";
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = LIME;
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > cv.width) p.vx *= -1;
        if (p.y < 0 || p.y > cv.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      t++;
      if (t < 260) requestAnimationFrame(frame);
    }
    frame();
    setTimeout(() => egg.classList.add("hidden"), 3200);
  }

  /* ====================== 事件绑定 ====================== */
  source.addEventListener("input", recompute);

  document.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      mode = btn.dataset.mode;
      renderBits();
    });
  });

  $("randomBtn").addEventListener("click", () => {
    const samples = [
      "Hello, 1024! 用代码造物 🚀",
      "while(alive){ create(); }",
      "01001000 01101001 帅哥",
      "git commit -m '造了个物'",
      "1024 是程序员的浪漫",
    ];
    source.value = samples[Math.floor(Math.random() * samples.length)];
    recompute();
  });

  $("exportBtn").addEventListener("click", exportPNG);
  $("playBtn").addEventListener("click", startPlay);
  $("stopBtn").addEventListener("click", stopPlay);
  $("tempo").addEventListener("input", (e) => { $("tempoVal").textContent = e.target.value; });

  /* ====================== 启动 ====================== */
  // 支持 ?text=... 预填造物原料，方便分享带文字的链接
  try {
    const q = new URLSearchParams(location.search).get("text");
    if (q) source.value = q;
  } catch (e) { /* ignore */ }
  initRain();
  recompute();
})();
