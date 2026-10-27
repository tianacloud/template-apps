document.head.insertAdjacentHTML("beforeend", "<style>\n  :root {\n    --bg-cream: #F2ECE1;\n    --bg-card: #FFFDF9;\n    --ink: #243036;\n    --ink-sub: #5C707A;\n    --sage: #3F7D5C;\n    --sage-bg: #E0F0E6;\n    --coral: #E35D44;\n    --coral-bg: #FCE5E0;\n    --honey: #E6961C;\n    --honey-bg: #FDF1D6;\n    --sky: #367CA0;\n    --sky-bg: #DFEFF7;\n  }\n\n  * {\n    box-sizing: border-box;\n    user-select: none;\n    -webkit-user-select: none;\n    -webkit-touch-callout: none;\n  }\n\n  html, body {\n    margin: 0;\n    padding: 0;\n    width: 100%;\n    height: 100%;\n    overflow: hidden;\n    background-color: var(--bg-cream);\n    font-family: \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif;\n    color: var(--ink);\n  }\n\n  #fxCanvas {\n    position: fixed;\n    inset: 0;\n    width: 100%;\n    height: 100%;\n    pointer-events: none;\n    z-index: 200;\n  }\n\n  /* ================= 左右黄金分屏主工作区 ================= */\n  .workspace {\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    padding: 12px;\n    gap: 14px;\n    overflow: hidden;\n  }\n\n  .left-dock {\n    width: clamp(330px, 28vw, 400px);\n    height: 100%;\n    display: flex;\n    flex-direction: column;\n    gap: 10px;\n    flex-shrink: 0;\n    transition: margin-left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s;\n  }\n\n  .workspace.focus-canvas .left-dock {\n    margin-left: calc(-1 * clamp(330px, 28vw, 400px) - 14px);\n    opacity: 0;\n    pointer-events: none;\n  }\n\n  .dock-header {\n    background: var(--bg-card);\n    border-radius: 18px;\n    padding: 10px 16px;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    box-shadow: 0 4px 14px rgba(36, 48, 54, 0.06);\n  }\n\n  .brand-box {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    font-size: 18px;\n    font-weight: 900;\n  }\n\n  .ver-pill {\n    background: var(--sage-bg);\n    color: var(--sage);\n    font-size: 11px;\n    padding: 2px 8px;\n    border-radius: 99px;\n    font-weight: 800;\n  }\n\n  .score-pill {\n    background: var(--honey-bg);\n    color: #AD6D0B;\n    border: 1.5px solid rgba(230, 150, 28, 0.45);\n    padding: 4px 12px;\n    border-radius: 99px;\n    font-size: 14px;\n    font-weight: 900;\n  }\n\n  .unit-grid {\n    background: var(--bg-card);\n    border-radius: 18px;\n    padding: 9px;\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 6px;\n    box-shadow: 0 4px 14px rgba(36, 48, 54, 0.06);\n  }\n\n  .unit-btn {\n    border: none;\n    background: #F0ECE1;\n    color: var(--ink-sub);\n    padding: 8px 10px;\n    border-radius: 11px;\n    font-size: 13px;\n    font-weight: 800;\n    cursor: pointer;\n    text-align: left;\n    transition: all 0.18s;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n  .unit-btn:hover { background: #E4DFD2; color: var(--ink); }\n  .unit-btn.active {\n    background: var(--sage);\n    color: #FFF;\n    box-shadow: 0 4px 10px rgba(63, 125, 92, 0.3);\n  }\n\n  .question-board {\n    flex: 1;\n    min-height: 0;\n    background: linear-gradient(180deg, #FFFDF9 0%, #FAF5E8 100%);\n    border-radius: 22px;\n    padding: 14px 16px;\n    border: 2.5px solid rgba(63, 125, 92, 0.18);\n    box-shadow: 0 8px 22px rgba(36, 48, 54, 0.07);\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    overflow-y: auto;\n    gap: 10px;\n  }\n\n  .sub-modes {\n    display: flex;\n    flex-direction: column;\n    gap: 5px;\n  }\n\n  .mode-chip {\n    border: none;\n    background: #ECE7DC;\n    color: var(--ink-sub);\n    padding: 7px 11px;\n    border-radius: 10px;\n    font-size: 13px;\n    font-weight: 800;\n    cursor: pointer;\n    text-align: left;\n    transition: 0.18s;\n  }\n  .mode-chip:hover { background: #E0D9CA; color: var(--ink); }\n  .mode-chip.active {\n    background: var(--sky);\n    color: #FFF;\n    box-shadow: 0 3px 10px rgba(54, 124, 160, 0.28);\n  }\n\n  .q-header-row {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n  }\n\n  .raccoon-icon {\n    width: 44px;\n    height: 44px;\n    border-radius: 13px;\n    background: var(--honey-bg);\n    border: 2px solid rgba(230, 150, 28, 0.4);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 24px;\n    flex-shrink: 0;\n  }\n\n  .kpoint-tag {\n    background: var(--sage-bg);\n    color: var(--sage);\n    font-size: 12px;\n    font-weight: 900;\n    padding: 4px 9px;\n    border-radius: 8px;\n    line-height: 1.35;\n  }\n\n  .q-body-text {\n    font-size: clamp(17px, 1.35vw, 20px);\n    font-weight: 900;\n    color: var(--ink);\n    line-height: 1.6;\n    background: rgba(255, 255, 255, 0.78);\n    padding: 12px 14px;\n    border-radius: 15px;\n    border: 1.5px solid rgba(36, 48, 54, 0.07);\n  }\n\n  .hl-num {\n    display: inline-block;\n    background: var(--coral-bg);\n    color: var(--coral);\n    border: 1.5px solid rgba(227, 93, 68, 0.35);\n    padding: 0px 7px;\n    border-radius: 7px;\n    font-weight: 900;\n    margin: 0 2px;\n  }\n\n  .hl-key {\n    display: inline-block;\n    background: var(--honey-bg);\n    color: #AD6D0B;\n    padding: 0px 7px;\n    border-radius: 7px;\n    font-weight: 900;\n    margin: 0 2px;\n  }\n\n  .live-math-box {\n    background: var(--sage-bg);\n    border: 1.5px solid rgba(63, 125, 92, 0.3);\n    border-radius: 14px;\n    padding: 10px 12px;\n    display: flex;\n    flex-direction: column;\n    gap: 4px;\n  }\n\n  .formula-text {\n    font-size: 15px;\n    font-weight: 900;\n    color: var(--sage);\n    line-height: 1.4;\n  }\n\n  .summary-text {\n    font-size: 12.5px;\n    font-weight: 800;\n    color: var(--ink-sub);\n    line-height: 1.4;\n  }\n\n  .dock-actions {\n    display: grid;\n    grid-template-columns: 1fr 1.45fr;\n    gap: 10px;\n  }\n\n  .big-btn {\n    border: none;\n    padding: 12px 14px;\n    border-radius: 15px;\n    font-size: 15.5px;\n    font-weight: 900;\n    cursor: pointer;\n    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);\n  }\n  .big-btn:hover { transform: translateY(-2px); }\n  .btn-rand { background: #E6E1D5; color: var(--ink); }\n  .btn-check {\n    background: var(--coral);\n    color: #FFF;\n    box-shadow: 0 6px 16px rgba(227, 93, 68, 0.35);\n  }\n\n  /* ================= 右侧：近100%全屏高度的互动沙盒做题舞台 ================= */\n  .right-stage {\n    flex: 1;\n    height: 100%;\n    min-width: 0;\n    background: var(--bg-card);\n    border-radius: 24px;\n    box-shadow: 0 10px 30px rgba(36, 48, 54, 0.08), inset 0 0 0 2px rgba(36, 48, 54, 0.06);\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n    position: relative;\n  }\n\n  .stage-topbar {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 10px;\n    padding: 8px 16px;\n    background: #F7F3E9;\n    border-bottom: 1.5px solid rgba(36, 48, 54, 0.07);\n    flex-wrap: wrap;\n    z-index: 10;\n  }\n\n  .stage-topbar-left {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n    flex-wrap: wrap;\n  }\n\n  .zoom-toggle-btn {\n    border: 1.5px solid rgba(54, 124, 160, 0.35);\n    background: var(--sky-bg);\n    color: var(--sky);\n    padding: 6px 13px;\n    border-radius: 10px;\n    font-size: 13.5px;\n    font-weight: 900;\n    cursor: pointer;\n    transition: 0.18s;\n  }\n  .zoom-toggle-btn:hover { background: var(--sky); color: #FFF; }\n\n  .gesture-pill {\n    font-size: 13.5px;\n    font-weight: 800;\n    color: var(--ink-sub);\n  }\n\n  .stage-tools {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    flex-wrap: wrap;\n  }\n\n  .tool-btn {\n    border: 1.5px solid rgba(227, 93, 68, 0.4);\n    background: var(--coral-bg);\n    color: var(--coral);\n    padding: 6px 13px;\n    border-radius: 10px;\n    font-size: 13.5px;\n    font-weight: 900;\n    cursor: pointer;\n    transition: 0.18s;\n  }\n  .tool-btn:hover { background: var(--coral); color: #FFF; }\n\n  .mini-floating-prompt {\n    display: none;\n    background: rgba(255, 253, 249, 0.96);\n    padding: 8px 18px;\n    border-bottom: 1.5px solid rgba(63, 125, 92, 0.2);\n    font-size: 16px;\n    font-weight: 900;\n    color: var(--ink);\n    align-items: center;\n    justify-content: space-between;\n    gap: 12px;\n  }\n  .workspace.focus-canvas .mini-floating-prompt {\n    display: flex;\n  }\n\n  .canvas-holder {\n    flex: 1;\n    width: 100%;\n    min-height: 0;\n    position: relative;\n    overflow: hidden;\n  }\n\n  #stageCanvas {\n    width: 100%;\n    height: 100%;\n    display: block;\n    touch-action: none;\n    cursor: pointer;\n  }\n\n  @media (max-width: 880px) {\n    .workspace { flex-direction: column; overflow-y: auto; }\n    .left-dock { width: 100%; height: auto; }\n    .right-stage { min-height: 500px; }\n  }\n</style>");
document.body.insertAdjacentHTML("beforeend", "\n\n<canvas id=\"fxCanvas\"></canvas>\n\n<div class=\"workspace\" id=\"workspace\">\n  <!-- ================= 左侧：大字号题目阅读与单元控制面板 ================= -->\n  <aside class=\"left-dock\">\n    <header class=\"dock-header\">\n      <div class=\"brand-box\">\n        <span>🌿 森灵数学馆</span>\n        <span class=\"ver-pill\">2026新课标</span>\n      </div>\n      <div class=\"score-pill\">🌰 勋章 <span id=\"scoreVal\">0</span></div>\n    </header>\n\n    <nav class=\"unit-grid\" id=\"unitTabs\">\n      <button class=\"unit-btn\" data-unit=\"u1\">🧺 1. 分类与整理</button>\n      <button class=\"unit-btn active\" data-unit=\"u2\">🍯 2. 1~6表内乘法</button>\n      <button class=\"unit-btn\" data-unit=\"u3\">🐿️ 3. 1~6表内除法</button>\n      <button class=\"unit-btn\" data-unit=\"u4\">🧭 4. 方向与导游</button>\n      <button class=\"unit-btn\" data-unit=\"u5\">📏 5. 厘米米&身体尺</button>\n      <button class=\"unit-btn\" data-unit=\"u6\">🛒 6. 7~9乘除应用</button>\n    </nav>\n\n    <section class=\"question-board\">\n      <div class=\"sub-modes\" id=\"subModesGroup\"></div>\n\n      <div class=\"q-header-row\">\n        <div class=\"raccoon-icon\">🦝</div>\n        <div class=\"kpoint-tag\" id=\"kpointPill\">知识点加载中...</div>\n      </div>\n\n      <div class=\"q-body-text\" id=\"questionBig\">正在准备实验台...</div>\n\n      <div class=\"live-math-box\">\n        <div class=\"formula-text\" id=\"liveFormula\">等待动手操作...</div>\n        <div class=\"summary-text\" id=\"liveSummary\">💡 动手在右侧画布点一点、拖一拖！</div>\n      </div>\n    </section>\n\n    <footer class=\"dock-actions\">\n      <button class=\"big-btn btn-rand\" id=\"btnRandom\">🎲 换一题</button>\n      <button class=\"big-btn btn-check\" id=\"btnVerify\">✨ 验证成果</button>\n    </footer>\n  </aside>\n\n  <!-- ================= 右侧：高屏占比互动沙盒做题舞台 ================= -->\n  <main class=\"right-stage\">\n    <div class=\"stage-topbar\">\n      <div class=\"stage-topbar-left\">\n        <button class=\"zoom-toggle-btn\" id=\"btnToggleZoom\">🔍 放大做题区 (收起左栏)</button>\n        <span class=\"gesture-pill\" id=\"gestureBadge\">👆 直接在下方画布中点击或拖动教具</span>\n      </div>\n      <div class=\"stage-tools\" id=\"subToolsGroup\"></div>\n    </div>\n\n    <div class=\"mini-floating-prompt\">\n      <span id=\"miniQuestionText\">题目提示</span>\n      <div style=\"display:flex;gap:8px;flex-shrink:0;\">\n        <button class=\"tool-btn\" id=\"btnMiniRand\">🎲 换一题</button>\n        <button class=\"tool-btn\" id=\"btnMiniVerify\" style=\"background:#E35D44;color:#FFF;\">✨ 验证成果</button>\n      </div>\n    </div>\n\n    <div class=\"canvas-holder\" id=\"sandboxStage\">\n      <canvas id=\"stageCanvas\"></canvas>\n    </div>\n  </main>\n</div>\n\n");

/* ============================================================================
   1. 治愈系木质马林巴琴原声合成器 (Web Audio API)
   ============================================================================ */
class AcousticSynth {
  constructor() {
    this.ctx = null;
    this.scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5];
  }
  ensure() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  playNote(i = 0) {
    this.ensure();
    const t = this.ctx.currentTime;
    const f = this.scale[Math.abs(i) % this.scale.length];
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  }
  playTick(step = 0) {
    this.ensure();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    const f = 320 + (Math.abs(step) % 12) * 26;
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.exponentialRampToValueAtTime(f * 1.3, t + 0.035);
    g.gain.setValueAtTime(0.14, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.045);
  }
  playWin() {
    this.ensure();
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, idx) => {
      const t = this.ctx.currentTime + idx * 0.065;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  }
  playWarn() {
    this.ensure();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, t);
    osc.frequency.linearRampToValueAtTime(190, t + 0.14);
    osc.frequency.linearRampToValueAtTime(230, t + 0.28);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.32);
  }
}
const sfx = new AcousticSynth();

/* ============================================================================
   2. 全屏庆典粒子动画
   ============================================================================ */
const fxCanvas = document.getElementById('fxCanvas');
const fxCtx = fxCanvas.getContext('2d');
let confetti = [];
function resizeFx() {
  fxCanvas.width = window.innerWidth;
  fxCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeFx);
resizeFx();

function fireConfetti() {
  const cols = ['#3F7D5C', '#E35D44', '#E6961C', '#367CA0', '#7E57C2'];
  for (let i = 0; i < 65; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = Math.random() * 9 + 3;
    confetti.push({
      x: window.innerWidth * 0.6,
      y: window.innerHeight * 0.5,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 4,
      r: Math.random() * 7 + 4,
      c: cols[i % cols.length],
      alpha: 1
    });
  }
}
function loopConfetti() {
  fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  for (let i = confetti.length - 1; i >= 0; i--) {
    const p = confetti[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.24; p.alpha -= 0.015;
    if (p.alpha <= 0) { confetti.splice(i, 1); continue; }
    fxCtx.save();
    fxCtx.globalAlpha = p.alpha;
    fxCtx.fillStyle = p.c;
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    fxCtx.fill();
    fxCtx.restore();
  }
  requestAnimationFrame(loopConfetti);
}
loopConfetti();

/* ============================================================================
   3. 920 × 600 饱满黄金比例逻辑画布与等比自适应引擎
   ============================================================================ */
const canvas = document.getElementById('stageCanvas');
const ctx = canvas.getContext('2d');
const VW = 920;
const VH = 600;
let vScale = 1, vOffX = 0, vOffY = 0;

function updateViewport() {
  const box = document.getElementById('sandboxStage');
  const rect = box.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  vScale = Math.min(rect.width / VW, rect.height / VH);
  vOffX = (rect.width - VW * vScale) / 2;
  vOffY = (rect.height - VH * vScale) / 2;
}
new ResizeObserver(updateViewport).observe(document.getElementById('sandboxStage'));
window.addEventListener('resize', updateViewport);

document.getElementById('btnToggleZoom').addEventListener('click', e => {
  const ws = document.getElementById('workspace');
  ws.classList.toggle('focus-canvas');
  const isFocus = ws.classList.contains('focus-canvas');
  e.target.textContent = isFocus ? '📖 展开左侧题目栏' : '🔍 放大做题区 (收起左栏)';
  setTimeout(updateViewport, 310);
});

function getVPos(e) {
  const rect = canvas.getBoundingClientRect();
  const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  return {
    x: clamp((cx - vOffX) / vScale, 16, VW - 16),
    y: clamp((cy - vOffY) / vScale, 16, VH - 16)
  };
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function rRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCard(x, y, w, h, r, bg, border = null) {
  ctx.save();
  ctx.shadowColor = 'rgba(36, 48, 54, 0.08)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = bg;
  rRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = border || 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2.5;
  rRect(ctx, x + 1, y + 1, w - 2, h - 2, r);
  ctx.stroke();
  ctx.restore();
}

const CN = ['零','一','二','三','四','五','六','七','八','九'];
function mantra(a, b) {
  const x = Math.min(a, b), y = Math.max(a, b), p = x * y;
  if (p < 10) return `${CN[x]}${CN[y]}得${CN[p]}`;
  return `${CN[x]}${CN[y]}${CN[Math.floor(p / 10)]}十${p % 10 ? CN[p % 10] : ''}`;
}

let activeUnit = 'u2';
let score = 0;

function winReward(pts = 15) {
  score += pts;
  document.getElementById('scoreVal').textContent = score;
  sfx.playWin();
  fireConfetti();
}

function setMissionUI(kpoint, gesture, questionHtml, formulaHtml, summaryText) {
  document.getElementById('kpointPill').textContent = kpoint;
  document.getElementById('gestureBadge').textContent = gesture;
  document.getElementById('questionBig').innerHTML = questionHtml;
  document.getElementById('miniQuestionText').innerHTML = questionHtml;
  document.getElementById('liveFormula').innerHTML = formulaHtml;
  if (summaryText) document.getElementById('liveSummary').textContent = summaryText;
}

function renderSubToolbar(modes, activeMode, onSelectMode, tools = []) {
  const mBox = document.getElementById('subModesGroup');
  const tBox = document.getElementById('subToolsGroup');
  mBox.innerHTML = modes.map(m =>
    `<button class="mode-chip ${m.id === activeMode ? 'active' : ''}" data-m="${m.id}">${m.label}</button>`
  ).join('');
  mBox.querySelectorAll('.mode-chip').forEach(btn => {
    btn.onclick = () => { sfx.playNote(1); onSelectMode(btn.dataset.m); };
  });

  tBox.innerHTML = tools.map((t, i) =>
    `<button class="tool-btn" data-t="${i}">${t.label}</button>`
  ).join('');
  tBox.querySelectorAll('.tool-btn').forEach(btn => {
    btn.onclick = () => tools[+btn.dataset.t].action();
  });
}

/* ============================================================================
   第一单元：🧺 分类与整理 (1A:按不同标准分类与象形统计图 | 1B:逐层分类树)
   ============================================================================ */
let u1State = {};
const U1_COLS = [
  { id: 'coral', name: '珊瑚红', hex: '#E35D44', bg: '#FCE5E0' },
  { id: 'sage',  name: '森林绿', hex: '#3F7D5C', bg: '#E0F0E6' },
  { id: 'honey', name: '琥珀黄', hex: '#E6961C', bg: '#FDF1D6' }
];
const U1_SHPS = [
  { id: 'circle', name: '圆形果' },
  { id: 'tri',    name: '三角叶' },
  { id: 'star',   name: '星形花' }
];

function initU1(sub = 'single') {
  if (sub === 'single') {
    const n = Math.floor(Math.random() * 4) + 9;
    const items = [];
    for (let i = 0; i < n; i++) {
      const c = U1_COLS[i < 3 ? i : Math.floor(Math.random() * 3)];
      const s = U1_SHPS[i < 3 ? (i + 1) % 3 : Math.floor(Math.random() * 3)];
      const hx = 65 + (i % 3) * 80, hy = 110 + Math.floor(i / 3) * 105;
      items.push({ id: i, colId: c.id, colHex: c.hex, shpId: s.id, x: hx, y: hy, hx, hy, bin: -1 });
    }
    u1State = { sub: 'single', crit: 'color', items, drag: null };
  } else {
    const items = [];
    for (let i = 0; i < 8; i++) {
      const isRed = i < 4 ? (i % 2 === 0) : (Math.random() < 0.5);
      const isCir = i < 4 ? (i < 2) : (Math.random() < 0.5);
      const hx = 68 + (i % 2) * 100, hy = 115 + Math.floor(i / 2) * 108;
      items.push({
        id: i, colId: isRed ? 'coral' : 'sage', colHex: isRed ? '#E35D44' : '#3F7D5C',
        shpId: isCir ? 'circle' : 'star', x: hx, y: hy, hx, hy, leafBin: -1
      });
    }
    u1State = { sub: 'tree', items, drag: null };
  }
  syncU1Toolbar();
  updateU1Text();
}

function syncU1Toolbar() {
  const s = u1State;
  const modes = [
    { id: 'single', label: '📊 1A. 按不同标准分类 & 象形统计图' },
    { id: 'tree',   label: '🌳 1B. 逐层分类树（先颜色→再形状）' }
  ];
  const tools = s.sub === 'single' ? [
    { label: `🎨 切换【按颜色分】`, action: () => { s.crit = 'color'; s.items.forEach(it=>{it.bin=-1;it.x=it.hx;it.y=it.hy;}); sfx.playNote(2); updateU1Text(); } },
    { label: `⭐ 切换【按形状分】`, action: () => { s.crit = 'shape'; s.items.forEach(it=>{it.bin=-1;it.x=it.hx;it.y=it.hy;}); sfx.playNote(4); updateU1Text(); } }
  ] : [
    { label: `🔄 全部重置回起点`, action: () => initU1('tree') }
  ];
  renderSubToolbar(modes, s.sub, m => initU1(m), tools);
}

function updateU1Text() {
  const s = u1State;
  if (s.sub === 'single') {
    const defs = s.crit === 'color' ? U1_COLS : U1_SHPS;
    const cnts = [0, 0, 0];
    s.items.forEach(it => { if (it.bin >= 0) cnts[it.bin]++; });
    const done = cnts[0] + cnts[1] + cnts[2];
    const cname = s.crit === 'color' ? '按颜色' : '按形状';
    setMissionUI(
      '第一单元 · 分类与整理',
      '👆 按住左侧徽章拖进中间对应的藤编篮',
      `请将草地上的森林徽章按照 <span class="hl-key">${cname}</span> 拖入中间的 3 个收纳篮里，观察右侧<b>象形统计图</b>的生长！`,
      `📊 ${defs[0].name}(<b>${cnts[0]}</b>) + ${defs[1].name}(<b>${cnts[1]}</b>) + ${defs[2].name}(<b>${cnts[2]}</b>) ＝ 已整理 <b>${done}/${s.items.length}</b>`,
      '💡 无论按颜色分还是按形状分，合起来的【总数量始终不变】！'
    );
  } else {
    const cnts = [0, 0, 0, 0];
    s.items.forEach(it => { if (it.leafBin >= 0) cnts[it.leafBin]++; });
    const done = cnts.reduce((a, b) => a + b, 0);
    setMissionUI(
      '第一单元 · 逐层分类树',
      '👆 顺着分类树枝，把徽章拖进最右侧对应的第2层终极篮',
      `请顺着树枝进行<b>逐层分类</b>：第1步先看 <span class="hl-key">红/绿颜色</span>，第2步再看 <span class="hl-key">圆/星形状</span>，把 <span class="hl-num">8 枚</span> 徽章拖入最右侧的 4 个终极盒！`,
      `🌳 红圆(<b>${cnts[0]}</b>) + 红星(<b>${cnts[1]}</b>) + 绿圆(<b>${cnts[2]}</b>) + 绿星(<b>${cnts[3]}</b>) ＝ <b>${done}/8</b>`,
      '💡 逐层分类能把既有颜色差异、又有形状差异的物品整理得井井有条！'
    );
  }
}

function drawU1Badge(x, y, r, shp, hex) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = hex;
  if (shp === 'circle') {
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  } else if (shp === 'tri') {
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, r * 0.85); ctx.lineTo(-r, r * 0.85); ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a1 = ((i * 72 - 90) * Math.PI) / 180, a2 = ((i * 72 - 54) * Math.PI) / 180;
      if (i === 0) ctx.moveTo(Math.cos(a1) * r * 1.1, Math.sin(a1) * r * 1.1);
      else ctx.lineTo(Math.cos(a1) * r * 1.1, Math.sin(a1) * r * 1.1);
      ctx.lineTo(Math.cos(a2) * r * 0.5, Math.sin(a2) * r * 0.5);
    }
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.25, r * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawU1() {
  const s = u1State;
  if (s.sub === 'single') {
    const defs = s.crit === 'color' ? U1_COLS : U1_SHPS;
    drawCard(16, 16, 260, 568, 22, '#F4EFE6');
    ctx.fillStyle = '#5C707A'; ctx.font = '900 16px sans-serif';
    ctx.fillText('🌿 待整理标本（拖我）', 36, 48);

    s.bins = [];
    for (let i = 0; i < 3; i++) {
      const by = 16 + i * 194;
      const d = defs[i];
      drawCard(292, by, 300, 178, 20, s.crit === 'color' ? d.bg : '#F4EFE6', s.crit === 'color' ? d.hex : '#C8C1B4');
      s.bins.push({ x: 292, y: by, w: 300, h: 178, idx: i });
      ctx.fillStyle = '#243036'; ctx.font = '900 18px sans-serif';
      ctx.fillText(`🧺 ${d.name}收纳篮`, 312, by + 34);
    }

    drawCard(608, 16, 296, 568, 22, '#F7F5F0');
    ctx.fillStyle = '#243036'; ctx.font = '900 18px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('📊 实时象形统计图', 756, 48);

    const baseY = 505;
    ctx.strokeStyle = '#CFD8DC'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(630, baseY); ctx.lineTo(880, baseY); ctx.stroke();

    for (let i = 0; i < 3; i++) {
      const cx = 668 + i * 88;
      const list = s.items.filter(it => it.bin === i);
      ctx.fillStyle = '#243036'; ctx.font = '800 15px sans-serif';
      ctx.fillText(defs[i].name, cx, baseY + 28);
      ctx.fillStyle = '#E35D44'; ctx.font = '900 17px sans-serif';
      ctx.fillText(`${list.length}个`, cx, baseY + 52);
      list.forEach((it, idx) => drawU1Badge(cx, baseY - 24 - idx * 38, 15, it.shpId, it.colHex));
    }
    ctx.textAlign = 'left';
    s.items.forEach(it => drawU1Badge(it.x, it.y, 24, it.shpId, it.colHex));
  } else {
    drawCard(16, 16, 210, 568, 22, '#F4EFE6');
    ctx.fillStyle = '#5C707A'; ctx.font = '900 16px sans-serif';
    ctx.fillText('🌿 混合标本 (8枚)', 34, 48);

    drawCard(265, 105, 165, 130, 18, '#FCE5E0', '#E35D44');
    ctx.fillStyle = '#E35D44'; ctx.font = '900 17px sans-serif';
    ctx.fillText('第1层：珊瑚红', 288, 175);

    drawCard(265, 365, 165, 130, 18, '#E0F0E6', '#3F7D5C');
    ctx.fillStyle = '#3F7D5C'; ctx.font = '900 17px sans-serif';
    ctx.fillText('第1层：森林绿', 288, 435);

    ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 3.5;
    [[170, 82], [170, 222], [430, 362], [430, 502]].forEach(pair => {
      ctx.beginPath(); ctx.moveTo(430, pair[0]); ctx.lineTo(500, pair[1]); ctx.stroke();
    });

    const leaves = [
      { name: '🔴+● 红圆盒', col: 'coral', shp: 'circle', bg: '#FCE5E0', bdr: '#E35D44' },
      { name: '🔴+★ 红星盒', col: 'coral', shp: 'star',   bg: '#FCE5E0', bdr: '#E35D44' },
      { name: '🟢+● 绿圆盒', col: 'sage',  shp: 'circle', bg: '#E0F0E6', bdr: '#3F7D5C' },
      { name: '🟢+★ 绿星盒', col: 'sage',  shp: 'star',   bg: '#E0F0E6', bdr: '#3F7D5C' }
    ];
    s.leafBins = [];
    leaves.forEach((lf, i) => {
      const ly = 16 + i * 144;
      drawCard(500, ly, 404, 130, 18, lf.bg, lf.bdr);
      s.leafBins.push({ x: 500, y: ly, w: 404, h: 130, idx: i, col: lf.col, shp: lf.shp });
      ctx.fillStyle = '#243036'; ctx.font = '900 17px sans-serif';
      ctx.fillText(`第2层细分 · ${lf.name}`, 522, ly + 34);
    });
    s.items.forEach(it => drawU1Badge(it.x, it.y, 23, it.shpId, it.colHex));
  }
}

/* ============================================================================
   第二单元：🍯 1~6的表内乘法（严格遵循2026新课标：【每份数(相同加数) × 份数(个数)】）
   ============================================================================ */
let u2State = {};

function initU2(sub = 'mulAddSub') {
  if (sub === 'array') {
    const r = Math.floor(Math.random() * 5) + 2, c = Math.floor(Math.random() * 5) + 2;
    u2State = { sub: 'array', r: 1, c: 1, tr: r, tc: c, target: r * c, dragging: false };
  } else if (sub === 'mulAddSub') {
    // 2B: 乘加与乘减（每盘满 perPlate 个，前 fullPlates 盘满，最后1盘 extra 个）
    // 严格按新课标：几个几 -> 每份数(perPlate) × 盘数(userCountedPlates)
    const fullPlates = Math.floor(Math.random() * 3) + 2; // 2~4盘
    const perPlate = Math.floor(Math.random() * 3) + 3;   // 每盘3~5个
    const extra = Math.floor(Math.random() * (perPlate - 1)) + 1;
    u2State = {
      sub: 'mulAddSub',
      fullPlates, perPlate, extra,
      total: perPlate * fullPlates + extra,
      borrowed: false,
      userCountedPlates: fullPlates,
      verified: false
    };
  } else {
    // 2C: 零剧透互动审题挑战（严格按：每排 a 张，有 2 排 -> 2个a -> a × 2）
    const a = Math.floor(Math.random() * 3) + 3; // 3~5
    const b = a === 4 ? 5 : 4;
    const swapOrder = Math.random() < 0.5;

    const leftTask = swapOrder
      ? { type: 'add', r1: a, r2: b, desc: `有 2 排桌子，第一排 ${a} 张，第二排 ${b} 张` }
      : { type: 'mul', r1: a, r2: a, desc: `有 2 排桌子，每排都有 ${a} 张` };

    const rightTask = swapOrder
      ? { type: 'mul', r1: a, r2: a, desc: `有 2 排桌子，每排都有 ${a} 张` }
      : { type: 'add', r1: a, r2: b, desc: `有 2 排桌子，第一排 ${a} 张，第二排 ${b} 张` };

    u2State = {
      sub: 'vsAdd',
      a, b,
      leftTask, rightTask,
      leftR1: 0, leftR2: 0,
      rightR1: 0, rightR2: 0,
      leftOp: null, rightOp: null,
      verified: false
    };
  }
  syncU2Toolbar();
  updateU2Text();
}

function syncU2Toolbar() {
  const s = u2State;
  const modes = [
    { id: 'mulAddSub', label: '🍎 2B. 乘加与乘减双视角果园 (每盘数×盘数)' },
    { id: 'vsAdd',     label: '⚖️ 2C. 乘法 vs 加法对比审题 (动手摆桌挑战)' },
    { id: 'array',     label: '🍯 2A. 1~6乘法蜂巢方阵 & 交换律' }
  ];
  let tools = [];
  if (s.sub === 'array') {
    tools = [{ label: '🔄 90°旋转蜂巢（对比横看与竖看）', action: () => { const t = s.r; s.r = s.c; s.c = t; sfx.playNote(4); updateU2Text(); } }];
  } else if (s.sub === 'mulAddSub') {
    tools = [
      { label: '➕ 选【乘加】思路 (只圈满盘)', action: () => { s.borrowed = false; s.userCountedPlates = s.fullPlates; sfx.playNote(2); updateU2Text(); } },
      { label: '➖ 选【乘减】思路 (借苹果凑成全部满盘)', action: () => { s.borrowed = true; s.userCountedPlates = s.fullPlates + 1; sfx.playNote(5); updateU2Text(); } }
    ];
  } else {
    tools = [
      { label: '🔄 清空两间教室重摆', action: () => {
          s.leftR1 = s.leftR2 = s.rightR1 = s.rightR2 = 0;
          s.leftOp = s.rightOp = null; s.verified = false;
          sfx.playTick(1); updateU2Text();
        }
      }
    ];
  }
  renderSubToolbar(modes, s.sub, m => initU2(m), tools);
}

function updateU2Text() {
  const s = u2State;
  if (s.sub === 'array') {
    const p = s.c * s.r;
    // 横着看：r行，每行c格 -> 表示 r 个 c 相加 -> 新课标规范写为 c × r
    setMissionUI(
      '第二单元 · 1~6的表内乘法（相同加数写在前面：每份数 × 份数）',
      '👆 在蜂巢网格上按住鼠标拖动拉出矩形方阵',
      `小熊需要收集正好 <span class="hl-num">${s.target} 格</span> 蜂蜜（可排成 <span class="hl-key">${s.tr}行、每行${s.tc}格</span> 或 <span class="hl-key">${s.tc}行、每行${s.tr}格</span>）。请在蜂巢上按住鼠标拉出方阵！`,
      `🍯 横着看（<b>${s.r} 个 ${s.c}</b>）：<b>${s.c} × ${s.r} = ${p}</b> ｜ 口诀：<b>【${mantra(s.c, s.r)}】</b>`,
      '💡 2026新课标规范：求几个相同加数的和，相同加数（每份数）写在乘号前面，个数（份数）写在乘号后面！'
    );
  } else if (s.sub === 'mulAddSub') {
    const missing = s.perPlate - s.extra;
    const ansPart = s.verified ? s.total : '?';
    // 严格按照新课标：s.userCountedPlates 盘，每盘 s.perPlate 个 -> 表示 userCountedPlates 个 perPlate -> 列式为 s.perPlate × s.userCountedPlates
    const eqStr = !s.borrowed
      ? `乘加（${s.userCountedPlates}个${s.perPlate}多${s.extra}）：<b>${s.perPlate} × ${s.userCountedPlates} + ${s.extra} = ${ansPart}（个）</b>`
      : `乘减（${s.userCountedPlates}个${s.perPlate}少${missing}）：<b>${s.perPlate} × ${s.userCountedPlates} - ${missing} = ${ansPart}（个）</b>`;
    setMissionUI(
      '第二单元 · 乘加、乘减（每盘个数 × 盘数 ± 多出/少掉的个数）',
      '👆 点击画布中的果盘圈出几个几，或切换上方【乘加/乘减】按钮',
      `果园里有 <span class="hl-num">${s.fullPlates} 盘</span> 满苹果（每盘 <span class="hl-num">${s.perPlate} 个</span>），最后1盘只有 <span class="hl-num">${s.extra} 个</span>。请点击果盘圈出要算乘法的盘数，再点“验证成果”揭晓总数！`,
      `🍎 ${eqStr}`,
      `💡 新课标写法：每盘有 ${s.perPlate} 个（相同加数是 ${s.perPlate}），所以把 ${s.perPlate} 写在乘号前面！`
    );
  } else {
    const lOpTxt = s.leftOp === 'mul' ? '【× 乘法】' : (s.leftOp === 'add' ? '【+ 加法】' : '【? 未选】');
    const rOpTxt = s.rightOp === 'mul' ? '【× 乘法】' : (s.rightOp === 'add' ? '【+ 加法】' : '【? 未选】');
    setMissionUI(
      '第二单元 · 解决问题（区分“求几个几”与“把两部分合起来”）',
      '👆 第1步：点画布中每排的 [+1] 摆对课桌数；第2步：点下方选【×乘法】或【+加法】',
      `【审题大挑战】：<br>①号教室：<span class="hl-key">${s.leftTask.desc}</span>；<br>②号教室：<span class="hl-num">${s.rightTask.desc}</span>。<br>请先在右侧画布里<b>亲手摆出两间教室的课桌</b>，再判断每间教室该用<b>乘法</b>还是<b>加法</b>！`,
      `⚖️ ①号已摆：[${s.leftR1}张, ${s.leftR2}张] 选${lOpTxt} ｜ ②号已摆：[${s.rightR1}张, ${s.rightR2}张] 选${rOpTxt}`,
      '💡 每排张数相同（2个几相加）用乘法：每排张数 × 2；两排张数不同（几和几合起来）用加法！'
    );
  }
}

function drawU2() {
  const s = u2State;
  if (s.sub === 'array') {
    const sz = 66, startX = 52, startY = 85;
    s.grid = { startX, startY, sz };
    drawCard(20, 16, 445, 568, 24, '#FDF1D6', '#E6961C');
    ctx.fillStyle = '#AD6D0B'; ctx.font = '900 18px sans-serif';
    ctx.fillText('🍯 按住鼠标在蜂巢上拉出方阵：', 44, 54);

    drawCard(startX - 5, startY - 5, s.c * sz + 10, s.r * sz + 10, 16, 'rgba(230,150,28,0.25)', '#E35D44');

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const cx = startX + (c + 0.5) * sz, cy = startY + (r + 0.5) * sz;
        const on = r < s.r && c < s.c;
        ctx.fillStyle = on ? '#E6961C' : 'rgba(230,150,28,0.22)';
        ctx.beginPath(); ctx.arc(cx, cy, on ? 25 : 14, 0, Math.PI * 2); ctx.fill();
        if (on) { ctx.fillStyle = '#3E2723'; ctx.fillRect(cx - 9, cy - 3, 18, 4); }
      }
    }

    drawCard(482, 16, 422, 568, 24, '#F4EFE6');
    const p = s.c * s.r;
    ctx.fillStyle = '#243036'; ctx.font = '900 20px sans-serif';
    ctx.fillText('🔍 新课标（每份数 × 份数）透视', 508, 58);

    // 横着看：每行 s.c 格，有 s.r 行 -> 表示 s.r 个 s.c -> 写作 s.c × s.r
    drawCard(504, 86, 378, 136, 18, '#FFFDF9');
    ctx.fillStyle = '#3F7D5C'; ctx.font = '900 16.5px sans-serif';
    ctx.fillText(`👉 横着看：每行 ${s.c} 格，有 ${s.r} 行（${s.r}个${s.c}）`, 520, 120);
    ctx.fillStyle = '#243036'; ctx.font = '800 15.5px sans-serif';
    ctx.fillText(`加法：${Array(s.r).fill(s.c).join(' + ')} = ${p}`, 520, 156);
    ctx.fillStyle = '#E35D44'; ctx.font = '900 18px sans-serif';
    ctx.fillText(`乘法算式：${s.c} × ${s.r} = ${p}`, 520, 196);

    // 竖着看：每列 s.r 格，有 s.c 列 -> 表示 s.c 个 s.r -> 写作 s.r × s.c
    drawCard(504, 240, 378, 136, 18, '#FFFDF9');
    ctx.fillStyle = '#367CA0'; ctx.font = '900 16.5px sans-serif';
    ctx.fillText(`👇 竖着看：每列 ${s.r} 格，有 ${s.c} 列（${s.c}个${s.r}）`, 520, 274);
    ctx.fillStyle = '#243036'; ctx.font = '800 15.5px sans-serif';
    ctx.fillText(`加法：${Array(s.c).fill(s.r).join(' + ')} = ${p}`, 520, 310);
    ctx.fillStyle = '#367CA0'; ctx.font = '900 18px sans-serif';
    ctx.fillText(`乘法算式：${s.r} × ${s.c} = ${p}`, 520, 350);

    drawCard(504, 396, 378, 152, 18, '#FCE5E0');
    ctx.fillStyle = '#E35D44'; ctx.font = '900 22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`${s.c} × ${s.r} = ${p}  ｜  ${s.r} × ${s.c} = ${p}`, 693, 452);
    ctx.font = '900 20px sans-serif';
    ctx.fillText(`口诀：【${mantra(s.c, s.r)}】`, 693, 505);
    ctx.textAlign = 'left';
  } else if (s.sub === 'mulAddSub') {
    drawCard(16, 16, 888, 568, 24, '#F7F5F0');
    const totalPlates = s.fullPlates + 1;
    const gap = 840 / totalPlates;
    s.plateBoxes = [];

    for (let p = 0; p < totalPlates; p++) {
      const px = 40 + (p + 0.5) * gap, py = 210;
      const isLast = p === s.fullPlates;
      const isCounted = p < s.userCountedPlates;

      drawCard(px - 82, py - 95, 164, 190, 22, isCounted ? '#FDF1D6' : '#ECE7DC', isCounted ? '#E6961C' : '#CFD8DC');
      s.plateBoxes.push({ idx: p, x: px - 82, y: py - 95, w: 164, h: 190 });

      ctx.fillStyle = '#243036'; ctx.font = '900 16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(isLast ? `第${p + 1}盘 (${s.extra}个)` : `第${p + 1}盘 (满${s.perPlate}个)`, px, py - 60);

      for (let k = 0; k < s.perPlate; k++) {
        const ax = px - 42 + (k % 3) * 42, ay = py - 10 + Math.floor(k / 3) * 48;
        if (!isLast || k < s.extra) {
          ctx.fillStyle = '#E35D44';
          ctx.beginPath(); ctx.arc(ax, ay, 17, 0, Math.PI * 2); ctx.fill();
        } else if (s.borrowed) {
          ctx.strokeStyle = '#367CA0'; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]);
          ctx.beginPath(); ctx.arc(ax, ay, 17, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = '#367CA0'; ctx.font = '900 12px sans-serif';
          ctx.fillText('借1', ax, ay + 4);
        }
      }
      ctx.fillStyle = isCounted ? '#3F7D5C' : '#5C707A'; ctx.font = '900 13px sans-serif';
      ctx.fillText(isCounted ? '✅已圈入乘法' : '👆点击圈入乘法', px, py + 76);
    }

    const missing = s.perPlate - s.extra;
    const ansTxt = s.verified ? s.total : '?';
    drawCard(50, 360, 820, 185, 20, s.borrowed ? '#DFEFF7' : '#E0F0E6');
    ctx.fillStyle = s.borrowed ? '#367CA0' : '#3F7D5C'; ctx.font = '900 20px sans-serif';
    if (!s.borrowed) {
      ctx.fillText(`➕ 乘加思路：先算 ${s.userCountedPlates} 盘满苹果（表示 ${s.userCountedPlates} 个 ${s.perPlate}），再加上最后 1 盘的 ${s.extra} 个`, 460, 415);
      ctx.fillStyle = '#243036'; ctx.font = '900 27px sans-serif';
      ctx.fillText(`算式：${s.perPlate} × ${s.userCountedPlates} + ${s.extra} = ${ansTxt}（个）`, 460, 485);
    } else {
      ctx.fillText(`➖ 乘减思路：先借 ${missing} 个虚影苹果凑满 ${s.userCountedPlates} 盘（表示 ${s.userCountedPlates} 个 ${s.perPlate}），再减去借的 ${missing} 个`, 460, 415);
      ctx.fillStyle = '#243036'; ctx.font = '900 27px sans-serif';
      ctx.fillText(`算式：${s.perPlate} × ${s.userCountedPlates} - ${missing} = ${ansTxt}（个）`, 460, 485);
    }
    ctx.textAlign = 'left';
  } else {
    // 2C: 零剧透互动审题实验室
    s.vsBtns = [];
    const rooms = [
      { key: 'left',  title: '🏫 ①号教室', task: s.leftTask,  r1: s.leftR1,  r2: s.leftR2,  op: s.leftOp,  x: 16,  col: '#3F7D5C', bg: '#E0F0E6' },
      { key: 'right', title: '🏫 ②号教室', task: s.rightTask, r1: s.rightR1, r2: s.rightR2, op: s.rightOp, x: 468, col: '#367CA0', bg: '#DFEFF7' }
    ];

    rooms.forEach(rm => {
      drawCard(rm.x, 16, 436, 568, 22, rm.bg, rm.col);
      ctx.fillStyle = rm.col; ctx.font = '900 20px sans-serif';
      ctx.fillText(rm.title, rm.x + 22, 52);
      ctx.fillStyle = '#243036'; ctx.font = '900 16px sans-serif';
      ctx.fillText(`题目要求：${rm.task.desc}`, rm.x + 22, 84);

      [ { rowIdx: 1, cnt: rm.r1, y: 108 }, { rowIdx: 2, cnt: rm.r2, y: 232 } ].forEach(row => {
        drawCard(rm.x + 18, row.y, 400, 108, 16, '#FFFDF9');
        ctx.fillStyle = '#243036'; ctx.font = '900 15px sans-serif';
        ctx.fillText(`第 ${row.rowIdx} 排（已摆 ${row.cnt} 张）：`, rm.x + 32, row.y + 28);

        const btnMinusX = rm.x + 245, btnPlusX = rm.x + 320, btnY = row.y + 8;
        drawCard(btnMinusX, btnY, 66, 30, 8, '#ECE7DC');
        ctx.fillStyle = '#243036'; ctx.font = '900 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('−1张', btnMinusX + 33, btnY + 20);
        s.vsBtns.push({ room: rm.key, action: `r${row.rowIdx}_sub`, x: btnMinusX, y: btnY, w: 66, h: 30 });

        drawCard(btnPlusX, btnY, 82, 30, 8, '#E35D44');
        ctx.fillStyle = '#FFF';
        ctx.fillText('＋1张桌', btnPlusX + 41, btnY + 20);
        s.vsBtns.push({ room: rm.key, action: `r${row.rowIdx}_add`, x: btnPlusX, y: btnY, w: 82, h: 30 });
        ctx.textAlign = 'left';

        for (let c = 0; c < 6; c++) {
          const tx = rm.x + 32 + c * 62, ty = row.y + 46;
          if (c < row.cnt) {
            drawCard(tx, ty, 54, 48, 10, '#FDF1D6', '#E6961C');
            ctx.fillStyle = '#AD6D0B'; ctx.font = '900 13px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('🪑课桌', tx + 27, ty + 30);
          } else {
            ctx.strokeStyle = '#E0E0E0'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
            rRect(ctx, tx, ty, 54, 48, 10); ctx.stroke(); ctx.setLineDash([]);
          }
        }
        ctx.textAlign = 'left';
      });

      drawCard(rm.x + 18, 360, 400, 115, 16, '#FFFDF9');
      ctx.fillStyle = '#243036'; ctx.font = '900 15px sans-serif';
      ctx.fillText('🤔 第2步：这间教室求总数应该用什么方法？', rm.x + 32, 388);

      const mulBtnX = rm.x + 32, addBtnX = rm.x + 220, opY = 404;
      const isMul = rm.op === 'mul', isAdd = rm.op === 'add';

      drawCard(mulBtnX, opY, 172, 54, 12, isMul ? '#E35D44' : '#FCE5E0', '#E35D44');
      ctx.fillStyle = isMul ? '#FFF' : '#E35D44'; ctx.font = '900 16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('✖️ 用乘法 (2个几)', mulBtnX + 86, opY + 33);
      s.vsBtns.push({ room: rm.key, action: 'op_mul', x: mulBtnX, y: opY, w: 172, h: 54 });

      drawCard(addBtnX, opY, 172, 54, 12, isAdd ? '#367CA0' : '#DFEFF7', '#367CA0');
      ctx.fillStyle = isAdd ? '#FFF' : '#367CA0';
      ctx.fillText('➕ 用加法 (几和几)', addBtnX + 86, opY + 33);
      s.vsBtns.push({ room: rm.key, action: 'op_add', x: addBtnX, y: opY, w: 172, h: 54 });

      drawCard(rm.x + 18, 490, 400, 76, 16, '#FAF5E8');
      ctx.fillStyle = '#243036'; ctx.font = '900 18.5px sans-serif';
      let previewEq = '请先摆好课桌并选择【乘法】或【加法】';
      if (rm.op === 'mul') {
        const ans = s.verified ? rm.r1 * 2 : '?';
        // 每排 rm.r1 张，有 2 排 -> 2 个 rm.r1 -> 写作 rm.r1 × 2
        previewEq = `你的列式(2个${rm.r1})：${rm.r1} × 2 = ${ans}（张）`;
      } else if (rm.op === 'add') {
        const ans = s.verified ? rm.r1 + rm.r2 : '?';
        previewEq = `你的列式(${rm.r1}和${rm.r2})：${rm.r1} + ${rm.r2} = ${ans}（张）`;
      }
      ctx.fillText(previewEq, rm.x + 218, 535);
      ctx.textAlign = 'left';
    });
  }
}

/* ============================================================================
   第三单元：🐿️ 1~6的表内除法 (3A:按份数平均分 | 3B:每几个一份圈一圈 | 3C:用口诀求商)
   ============================================================================ */
let u3State = {};

function initU3(sub = 'share') {
  const groups = Math.floor(Math.random() * 3) + 2, each = Math.floor(Math.random() * 3) + 2;
  const total = each * groups;
  const nuts = [];
  for (let i = 0; i < total; i++) {
    const hx = 56 + (i % 4) * 58, hy = 105 + Math.floor(i / 4) * 78;
    nuts.push({ id: i, x: hx, y: hy, hx, hy, owner: -1, packed: false, sel: false });
  }
  u3State = { sub, groups, each, total, nuts, dragNut: null, lasso: [], isLasso: false, bags: 0, sliderR: 1 };
  syncU3Toolbar();
  updateU3Text();
}

function syncU3Toolbar() {
  const s = u3State;
  const modes = [
    { id: 'share',   label: '🐿️ 3A. 按份数平均分 (等分除)' },
    { id: 'lasso',   label: '⭕ 3B. 按每几个一份圈一圈 (包含除)' },
    { id: 'inverse', label: '🔄 3C. 用2~6的乘法口诀求商' }
  ];
  let tools = [];
  if (s.sub === 'share') {
    tools = [{
      label: '⚡ 一人发1颗（观察按轮次平均分）',
      action: () => {
        const free = s.nuts.filter(n => n.owner === -1);
        if (free.length >= s.groups) {
          for (let k = 0; k < s.groups; k++) free[k].owner = k;
          layoutU3Nuts(); sfx.playNote(3); updateU3Text();
        }
      }
    }];
  } else if (s.sub === 'lasso') {
    tools = [{
      label: `⭕ 圈出 1 袋 (${s.each}颗)`,
      action: () => {
        const free = s.nuts.filter(n => !n.packed);
        if (free.length >= s.each) {
          for (let k = 0; k < s.each; k++) free[k].packed = true;
          s.bags++; sfx.playNote(s.bags + 2); updateU3Text();
        }
      }
    }];
  }
  renderSubToolbar(modes, s.sub, m => initU3(m), tools);
}

function layoutU3Nuts() {
  const s = u3State;
  for (let k = 0; k < s.groups; k++) {
    const list = s.nuts.filter(n => n.owner === k);
    const px = 315 + k * (585 / s.groups) + (585 / s.groups) / 2;
    list.forEach((n, idx) => {
      n.x = px - 30 + (idx % 2) * 60;
      n.y = 260 + Math.floor(idx / 2) * 68;
    });
  }
}

function updateU3Text() {
  const s = u3State;
  if (s.sub === 'share') {
    const cnts = Array(s.groups).fill(0);
    s.nuts.forEach(n => { if (n.owner >= 0) cnts[n.owner]++; });
    const done = cnts.every(c => c === s.each);
    setMissionUI(
      '第三单元 · 平均分与除法',
      '👆 拖动左侧松果放入右侧小松鼠的木盘，或点击【⚡一人发1颗】',
      `树桩上有 <span class="hl-num">${s.total} 颗</span> 松果，要 <span class="hl-key">平均分给 ${s.groups} 只</span> 小松鼠。请把松果分进餐盘，看看每只松鼠分到几颗！`,
      `🐿️ 餐盘松果：[ ${cnts.join(' , ')} ] ｜ 算式：<b>${s.total} ÷ ${s.groups} = ${done ? s.each : '?'}（颗）</b>`,
      '💡 每份分得【同样多】才叫平均分！分完后自己发现每只松鼠分到几颗。'
    );
  } else if (s.sub === 'lasso') {
    const rem = s.total - s.bags * s.each;
    const done = s.bags === s.groups;
    setMissionUI(
      '第三单元 · 包含除（圈一圈）',
      `👆 在草地上按住鼠标画圈，每次正好圈住 ${s.each} 颗松果打包`,
      `共有 <span class="hl-num">${s.total} 颗</span> 松果，每 <span class="hl-key">${s.each} 颗装一袋</span>。请在左侧草地上<b>按住鼠标画圈</b>（每次圈 ${s.each} 颗），看看一共能装几袋！`,
      `⭕ 已装满 <b>${s.bags}</b> 袋（还剩 ${rem} 颗） ｜ 算式：<b>${s.total} ÷ ${s.each} = ${done ? s.groups : '?'}（袋）</b>`,
      `💡 求 ${s.total} 里面包含几个 ${s.each}，每圈出1袋就相当于减去1个 ${s.each}！`
    );
  } else {
    const matched = s.sliderR === s.groups;
    // 每行 s.each 颗，有 s.sliderR 行 -> 表示 s.sliderR 个 s.each -> 写作 s.each × s.sliderR
    setMissionUI(
      '第三单元 · 用2~6的乘法口诀求商',
      '👆 上下拖动左侧红色滑块改变松果行数',
      `计算 <span class="hl-num">${s.total} ÷ ${s.each} = ?</span> 时，想口诀：<span class="hl-key">（几）${CN[s.each]}得${CN[s.total] || s.total}？</span> 请上下拖动左侧红色滑块拉出正确的行数！`,
      `🔄 当前（<b>${s.sliderR} 个 ${s.each}</b>）：<b>${s.each} × ${s.sliderR} = ${s.each * s.sliderR}</b> ｜ 商是：<b>${matched ? s.groups : '?'}</b>`,
      '💡 算除法、想乘法：除数是几，就想几的乘法口诀！'
    );
  }
}

function drawAcorn(x, y, hi = false) {
  ctx.save();
  ctx.translate(x, y);
  if (hi) { ctx.strokeStyle = '#E35D44'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = '#A1622F'; ctx.beginPath(); ctx.ellipse(0, 3, 15, 19, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5D3A1A'; ctx.beginPath(); ctx.ellipse(0, -10, 16, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawU3() {
  const s = u3State;
  if (s.sub === 'share') {
    drawCard(16, 16, 280, 568, 22, '#F4EFE6');
    ctx.fillStyle = '#5C707A'; ctx.font = '900 16px sans-serif';
    ctx.fillText(`🌰 松果篮（共 ${s.total} 颗）`, 36, 48);

    s.plates = [];
    const w = 590 / s.groups;
    const cnts = Array(s.groups).fill(0);
    s.nuts.forEach(n => { if (n.owner >= 0) cnts[n.owner]++; });
    const maxC = Math.max(...cnts), minC = Math.min(...cnts);

    for (let i = 0; i < s.groups; i++) {
      const px = 312 + i * w;
      const unfair = maxC > minC && cnts[i] < maxC;
      drawCard(px, 80, w - 12, 460, 22, unfair ? '#FCE5E0' : '#FDF1D6', '#E6961C');
      s.plates.push({ x: px, y: 80, w: w - 12, h: 460, idx: i });

      ctx.fillStyle = '#243036'; ctx.font = '900 17px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}号松鼠 (${cnts[i]}颗)`, px + (w - 12) / 2, 124);
      ctx.fillStyle = unfair ? '#E35D44' : '#3F7D5C'; ctx.font = '900 16px sans-serif';
      ctx.fillText(unfair ? '🥺比别人少' : (cnts[i] > 0 && maxC === minC ? '🥰同样多!' : '🐿️等松果'), px + (w - 12) / 2, 156);
      ctx.textAlign = 'left';
    }
    s.nuts.forEach(n => drawAcorn(n.x, n.y));
  } else if (s.sub === 'lasso') {
    drawCard(16, 16, 510, 568, 22, '#E0F0E6');
    ctx.fillStyle = '#3F7D5C'; ctx.font = '900 17px sans-serif';
    ctx.fillText(`⭕ 按住鼠标画圈，每次圈住【${s.each} 颗】松果：`, 38, 50);

    s.nuts.forEach((n, idx) => {
      n.x = 88 + (idx % 4) * 112;
      n.y = 135 + Math.floor(idx / 4) * 120;
      if (!n.packed) drawAcorn(n.x, n.y, n.sel);
    });

    if (s.isLasso && s.lasso.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#E35D44'; ctx.lineWidth = 3.5; ctx.setLineDash([6, 4]);
      ctx.fillStyle = 'rgba(227,93,68,0.15)';
      ctx.beginPath(); ctx.moveTo(s.lasso[0].x, s.lasso[0].y);
      s.lasso.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    drawCard(542, 16, 362, 568, 22, '#F4EFE6');
    ctx.fillStyle = '#243036'; ctx.font = '900 18px sans-serif';
    ctx.fillText(`👜 已打包松果袋：${s.bags} 袋`, 566, 52);
    for (let b = 0; b < s.bags; b++) {
      const bx = 566 + (b % 2) * 164, by = 84 + Math.floor(b / 2) * 140;
      drawCard(bx, by, 150, 118, 16, '#FDF1D6', '#E6961C');
      ctx.fillStyle = '#AD6D0B'; ctx.font = '900 15px sans-serif';
      ctx.fillText(`第 ${b + 1} 袋 (${s.each}颗)`, bx + 20, by + 34);
      for (let k = 0; k < s.each; k++) {
        ctx.beginPath(); ctx.arc(bx + 28 + k * 26, by + 76, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#A1622F'; ctx.fill();
      }
    }
  } else {
    drawCard(16, 16, 420, 568, 22, '#FDF1D6');
    ctx.fillStyle = '#243036'; ctx.font = '900 17px sans-serif';
    ctx.fillText(`↕️ 拖动红球改变行数（每行 ${s.each} 颗）：`, 38, 52);

    const trackX = 64, topY = 115, rowH = 95;
    ctx.strokeStyle = '#CFD8DC'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(trackX, topY); ctx.lineTo(trackX, topY + 4 * rowH); ctx.stroke();

    const knobY = topY + (s.sliderR - 1) * rowH;
    ctx.fillStyle = '#E35D44'; ctx.beginPath(); ctx.arc(trackX, knobY, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.font = '900 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`${s.sliderR}行`, trackX, knobY + 5); ctx.textAlign = 'left';

    for (let r = 0; r < s.sliderR; r++) {
      for (let c = 0; c < s.each; c++) drawAcorn(138 + c * 74, topY + r * rowH);
    }

    drawCard(452, 16, 452, 568, 22, '#F4EFE6');
    const curTotal = s.each * s.sliderR;
    ctx.fillStyle = '#243036'; ctx.font = '900 20px sans-serif';
    ctx.fillText('📖 想乘算除 · 一图三式联动卡', 478, 58);

    drawCard(476, 88, 404, 115, 18, '#FCE5E0');
    ctx.fillStyle = '#E35D44'; ctx.font = '900 21px sans-serif';
    ctx.fillText(`🔑 当前口诀：【${mantra(s.each, s.sliderR)}】`, 498, 134);
    ctx.fillStyle = '#243036'; ctx.font = '900 18px sans-serif';
    ctx.fillText(`乘法(${s.sliderR}个${s.each})：${s.each} × ${s.sliderR} = ${curTotal}`, 498, 178);

    drawCard(476, 226, 404, 145, 18, '#FFFDF9');
    ctx.fillStyle = '#3F7D5C'; ctx.font = '900 19px sans-serif';
    ctx.fillText(`➗ 除法①：${curTotal} ÷ ${s.each} = ${s.sliderR}`, 498, 274);
    ctx.fillStyle = '#5C707A'; ctx.font = '800 16px sans-serif';
    ctx.fillText(`想：${s.each} 乘（${CN[s.sliderR]}）得 ${curTotal}，商是 ${s.sliderR}`, 498, 324);

    drawCard(476, 394, 404, 145, 18, '#FFFDF9');
    ctx.fillStyle = '#367CA0'; ctx.font = '900 19px sans-serif';
    ctx.fillText(`➗ 除法②：${curTotal} ÷ ${s.sliderR} = ${s.each}`, 498, 442);
    ctx.fillStyle = '#5C707A'; ctx.font = '800 16px sans-serif';
    ctx.fillText(`想：（${CN[s.each]}）乘 ${s.sliderR} 得 ${curTotal}，商是 ${s.each}`, 498, 492);
  }
}

/* ============================================================================
   第四单元：🧭 认识方向 & 校园小导游
   ============================================================================ */
let u4State = {};
const DIRS_CW = ['东', '南', '西', '北'];
const CAMPUS_MAP = {
  N: { name: '图书馆', icon: '📚', x: 265, y: 105 },
  S: { name: '校门',   icon: '⛩️', x: 265, y: 445 },
  W: { name: '体育馆', icon: '🏀', x: 95,  y: 275 },
  E: { name: '教学楼', icon: '🏫', x: 435, y: 275 },
  C: { name: '中心花坛', icon: '⛲', x: 265, y: 275 }
};

function initU4(sub = 'sunTurn') {
  const pairs = [
    { a: '图书馆', b: '中心花坛', ans: '北' },
    { a: '中心花坛', b: '图书馆', ans: '南' },
    { a: '教学楼', b: '体育馆',   ans: '东' },
    { a: '体育馆', b: '教学楼',   ans: '西' }
  ];
  u4State = {
    sub, faceIdx: 0, targetFaceIdx: Math.floor(Math.random() * 4),
    qPair: pairs[Math.floor(Math.random() * pairs.length)],
    activeRefKey: 'C', pickedDir: null
  };
  syncU4Toolbar();
  updateU4Text();
}

function syncU4Toolbar() {
  const s = u4State;
  const modes = [
    { id: 'sunTurn', label: '☀️ 4A. 早晨面向太阳 & 转身辨前后左右' },
    { id: 'mapRef',  label: '🗺️ 4B. 校园小导游：切换观测点辨方向' }
  ];
  const tools = s.sub === 'sunTurn' ? [
    { label: '↪️ 向右转 (顺时针90°)', action: () => { s.faceIdx = (s.faceIdx + 1) % 4; sfx.playNote(s.faceIdx); updateU4Text(); } },
    { label: '🔄 向后转 (180°反方向)', action: () => { s.faceIdx = (s.faceIdx + 2) % 4; sfx.playNote(s.faceIdx); updateU4Text(); } }
  ] : ['东', '南', '西', '北'].map(d => ({
    label: `选【${d}面】`,
    action: () => { s.pickedDir = d; sfx.playNote(3); updateU4Text(); }
  }));
  renderSubToolbar(modes, s.sub, m => initU4(m), tools);
}

function updateU4Text() {
  const s = u4State;
  const f = DIRS_CW[s.faceIdx], r = DIRS_CW[(s.faceIdx + 1) % 4], b = DIRS_CW[(s.faceIdx + 2) % 4], l = DIRS_CW[(s.faceIdx + 3) % 4];
  if (s.sub === 'sunTurn') {
    const tName = DIRS_CW[s.targetFaceIdx];
    setMissionUI(
      '第四单元 · 认识东南西北',
      '👆 点击画布中的操场或上方按钮让小朋友转身',
      `早晨太阳从<b>东面</b>升起！请点击旋转操场中央的小朋友，让他 <span class="hl-key">面向${tName}面</span> 站立，观察他的前、后、左、右各是什么方向！`,
      `🧭 当前面向：<b>${f}</b> ｜ 前<b>【${f}】</b> 后<b>【${b}】</b> 左<b>【${l}】</b> 右<b>【${r}】</b>`,
      '💡 东与西相对，南与北相对；顺时针旋转依次是“东→南→西→北”！'
    );
  } else {
    const refName = CAMPUS_MAP[s.activeRefKey].name;
    setMissionUI(
      '第四单元 · 校园小导游（观测点）',
      '👆 先在左图点击【观测点建筑】放十字方向标，再在右上方选方向',
      `【校园导游挑战】：<b>【${s.qPair.a}】</b>在 <span class="hl-key">【${s.qPair.b}】</span> 的什么面？请先在画布左侧点击观测中心 <b>【${s.qPair.b}】</b> 把十字方向标移过去，再选择方向！`,
      `📍 十字方向标中心：<b>${refName}</b> ｜ 你的答案：<b>${s.pickedDir || '? (请点上方按钮选择)'}</b>`,
      '💡 “A在B的什么面”，“在”字后面的 B 就是观测中心！'
    );
  }
}

function drawU4() {
  const s = u4State;
  if (s.sub === 'sunTurn') {
    drawCard(16, 16, 515, 568, 22, '#E0F0E6');
    const cx = 270, cy = 295;
    ctx.fillStyle = '#3F7D5C'; ctx.font = '900 19px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('⬆️ 北 (N)', cx, 55);
    ctx.fillText('⬇️ 南 (S)', cx, 545);
    ctx.fillText('⬅️ 西 (W)', 65, cy);
    ctx.fillText('☀️ 东(太阳)', 460, cy - 34);
    ctx.fillStyle = '#E6961C'; ctx.beginPath(); ctx.arc(465, cy + 16, 30, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = 'rgba(63,125,92,0.3)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, 150, 0, Math.PI * 2); ctx.stroke();

    const angs = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angs[s.faceIdx]);

    drawCard(70, -22, 72, 44, 12, '#E35D44');
    ctx.fillStyle = '#FFF'; ctx.font = '900 15px sans-serif'; ctx.fillText('前面👉', 106, 6);
    drawCard(-142, -22, 72, 44, 12, '#5C707A');
    ctx.fillStyle = '#FFF'; ctx.fillText('👈后面', -106, 6);
    drawCard(-36, -120, 72, 42, 12, '#367CA0');
    ctx.fillStyle = '#FFF'; ctx.fillText('左面', 0, -93);
    drawCard(-36, 78, 72, 42, 12, '#E6961C');
    ctx.fillStyle = '#FFF'; ctx.fillText('右面', 0, 105);

    ctx.fillStyle = '#243036'; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFE0B2'; ctx.beginPath(); ctx.arc(9, 0, 23, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    drawCard(546, 16, 358, 568, 22, '#F4EFE6');
    ctx.textAlign = 'left';
    const f = DIRS_CW[s.faceIdx], r = DIRS_CW[(s.faceIdx + 1) % 4], b = DIRS_CW[(s.faceIdx + 2) % 4], l = DIRS_CW[(s.faceIdx + 3) % 4];
    ctx.fillStyle = '#243036'; ctx.font = '900 20px sans-serif';
    ctx.fillText('🧭 实景辨方向动态看板', 570, 58);

    drawCard(566, 86, 318, 190, 18, '#FFFDF9');
    ctx.fillStyle = '#E35D44'; ctx.font = '900 19px sans-serif';
    ctx.fillText(`👧 当前面向：【${f}面】`, 586, 128);
    ctx.fillStyle = '#243036'; ctx.font = '800 17px sans-serif';
    ctx.fillText(`• 前面是【${f}】  • 后面是【${b}】`, 586, 178);
    ctx.fillText(`• 左面是【${l}】  • 右面是【${r}】`, 586, 228);

    drawCard(566, 300, 318, 250, 18, '#FDF1D6');
    ctx.fillStyle = '#AD6D0B'; ctx.font = '900 18px sans-serif';
    ctx.fillText('💡 大自然指南针口诀：', 586, 340);
    ctx.fillStyle = '#243036'; ctx.font = '800 15px sans-serif';
    ctx.fillText('1. 早晨太阳在【东】，傍晚在【西】', 586, 385);
    ctx.fillText('2. 夜晚北极星永远在【北】方', 586, 425);
    ctx.fillText('3. 向后转(180°)前后左右全相反', 586, 465);
    ctx.fillText('4. 向右转按“东南西北”顺时针走', 586, 505);
  } else {
    drawCard(16, 16, 515, 568, 22, '#F7F5F0');
    ctx.fillStyle = '#243036'; ctx.font = '900 17px sans-serif';
    ctx.fillText('🗺️ 点击建筑移动【十字方向标】（上北下南左西右东）', 34, 50);

    Object.keys(CAMPUS_MAP).forEach(k => {
      const b = CAMPUS_MAP[k];
      const isRef = s.activeRefKey === k;
      drawCard(b.x - 64, b.y - 46, 128, 92, 18, isRef ? '#FDF1D6' : '#FFFDF9', isRef ? '#E6961C' : '#CFD8DC');
      ctx.font = '28px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(b.icon, b.x, b.y - 4);
      ctx.fillStyle = '#243036'; ctx.font = '900 16px sans-serif';
      ctx.fillText(b.name, b.x, b.y + 28);
    });

    const refB = CAMPUS_MAP[s.activeRefKey];
    ctx.save();
    ctx.strokeStyle = 'rgba(227, 93, 68, 0.85)'; ctx.lineWidth = 3.5; ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.moveTo(refB.x, refB.y - 140); ctx.lineTo(refB.x, refB.y + 140);
    ctx.moveTo(refB.x - 150, refB.y); ctx.lineTo(refB.x + 150, refB.y);
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#E35D44'; ctx.font = '900 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`⬆以【${refB.name}】为中心：上北`, refB.x, refB.y - 150);
    ctx.fillText('⬇下南', refB.x, refB.y + 162);
    ctx.fillText('⬅左西', refB.x - 175, refB.y + 5);
    ctx.fillText('右东➡', refB.x + 175, refB.y + 5);
    ctx.restore();

    drawCard(546, 16, 358, 568, 22, '#F4EFE6');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#243036'; ctx.font = '900 20px sans-serif';
    ctx.fillText('🔍 观测点三步解题法', 570, 58);

    drawCard(566, 86, 318, 220, 18, '#FFFDF9');
    ctx.fillStyle = '#E35D44'; ctx.font = '900 18px sans-serif';
    ctx.fillText(`题目：【${s.qPair.a}】在【${s.qPair.b}】的( )面`, 584, 128);
    ctx.fillStyle = '#243036'; ctx.font = '800 15.5px sans-serif';
    ctx.fillText(`第1步：找“在”字后面的【${s.qPair.b}】`, 584, 174);
    ctx.fillText(`第2步：点击左图【${s.qPair.b}】放十字标`, 584, 216);
    ctx.fillText(`第3步：看【${s.qPair.a}】在十字标的哪头`, 584, 258);

    drawCard(566, 326, 318, 220, 18, '#E0F0E6');
    ctx.fillStyle = '#3F7D5C'; ctx.font = '900 18px sans-serif';
    ctx.fillText('💡 方向的相对性：', 584, 366);
    ctx.fillStyle = '#243036'; ctx.font = '800 15.5px sans-serif';
    ctx.fillText('• A 在 B 的【北】面，', 584, 412);
    ctx.fillText('  反过来，B 就在 A 的【南】面！', 584, 448);
    ctx.fillText('• 观测点互换，方向正好相反！', 584, 492);
  }
}

/* ============================================================================
   第五单元：📏 厘米和米 & 身体上的尺子
   ============================================================================ */
let u5State = {};

function initU5(sub = 'ruler') {
  const startTick = Math.random() < 0.65 ? Math.floor(Math.random() * 4) + 2 : 0;
  const targetCm = Math.floor(Math.random() * 5) + 3;
  u5State = {
    sub, pxCm: 52, startTick, targetCm,
    objX: 120, objY: 165, rulerX: 80, rulerY: 280, tilt: 0,
    calL: 52 * 0.5, calR: 52 * 2.5, dragPart: null, dx: 0, dy: 0,
    tenBlocks: 2, foundSegs: [], selPt: null, dadSpans: 0, kidSpans: 0, pickedWho: null
  };
  syncU5Toolbar();
  updateU5Text();
}

function syncU5Toolbar() {
  const s = u5State;
  const modes = [
    { id: 'ruler',    label: '📏 5A. 断尺测量 & 量法正误' },
    { id: 'meter100', label: '🔟 5B. 1米=100厘米拼接尺' },
    { id: 'countSeg', label: '✨ 5C. 巧数线段探索器 (3+2+1)' },
    { id: 'bodySpan', label: '🖐️ 5D. 身体上的尺子对比实验' }
  ];
  let tools = [];
  if (s.sub === 'ruler') {
    tools = [
      { label: '⚠️ 演示错误量法(尺子歪斜)', action: () => { s.tilt = s.tilt === 0 ? -11 : 0; sfx.playWarn(); updateU5Text(); } },
      { label: '✅ 放平尺子并对齐起点', action: () => { s.tilt = 0; s.rulerX = s.objX - 0.5 * s.pxCm; s.rulerY = s.objY + 32; s.calL = 0.5 * s.pxCm; sfx.playNote(4); updateU5Text(); } }
    ];
  } else if (s.sub === 'meter100') {
    tools = [{ label: '➕ 拼入1根【10厘米】竹尺 (+10cm)', action: () => { s.tenBlocks = s.tenBlocks < 10 ? s.tenBlocks + 1 : 1; sfx.playNote(s.tenBlocks); updateU5Text(); } }];
  } else if (s.sub === 'countSeg') {
    tools = [{ label: '🔄 清空已连线段重数', action: () => { s.foundSegs = []; s.selPt = null; sfx.playTick(1); updateU5Text(); } }];
  } else {
    tools = [
      { label: '🖐️ 让爸爸和小孩各量 1 拃', action: () => { if (s.dadSpans < 4) s.dadSpans++; if (s.kidSpans < 6) s.kidSpans = Math.min(6, Math.round(s.dadSpans * 1.5)); sfx.playNote(s.dadSpans); updateU5Text(); } },
      { label: '答：小孩量的拃数更多', action: () => { s.pickedWho = 'kid'; sfx.playNote(6); updateU5Text(); } }
    ];
  }
  renderSubToolbar(modes, s.sub, m => initU5(m), tools);
}

function updateU5Text() {
  const s = u5State;
  if (s.sub === 'ruler') {
    const tL = +(s.startTick + s.calL / s.pxCm - 0.5).toFixed(1);
    const tR = +(s.startTick + s.calR / s.pxCm - 0.5).toFixed(1);
    const diff = +(tR - tL).toFixed(1);
    setMissionUI(
      '第五单元 · 厘米与断尺测量',
      '👆 拖动木尺对齐铅笔，拉动上方【绿/红卡尺】正好夹住铅笔首尾',
      `这把断尺从刻度 <span class="hl-num">${s.startTick}</span> 开始！请拖动木尺<b>放平紧贴</b>铅笔，再拉动<b>绿/红两个游标卡尺</b>正好夹住铅笔的首尾，量出这支铅笔长 <span class="hl-key">? 厘米</span>！`,
      `📏 卡尺读数：终点刻度 <b>${tR}</b> − 起点刻度 <b>${tL}</b> ＝ <b>${diff} 厘米 (cm)</b>`,
      '💡 断尺算理：不能只看右端指着几，要用【终点刻度 − 起点刻度】算出包含几个1厘米大格！'
    );
  } else if (s.sub === 'meter100') {
    setMissionUI(
      '第五单元 · 认识米 (1米 = 100厘米)',
      '👆 点击右上方【➕拼入10厘米竹尺】把米尺槽拼满',
      `为什么 <span class="hl-key">1米 = 100厘米</span>？请点击上方按钮，把长 <span class="hl-num">10 厘米</span> 的竹尺一根接一根拼进 1 米长的木槽里，看看一共需要几根！`,
      `🔟 已拼接：<b>${s.tenBlocks} 个 10厘米 ＝ ${s.tenBlocks * 10} 厘米</b> ${s.tenBlocks === 10 ? '＝ <b>1 米 (1m = 100cm)</b> 🎉' : ''}`,
      '💡 10 个 10 厘米是 100 厘米，正好是 1 米！跨单位比大小要先换算成相同单位。'
    );
  } else if (s.sub === 'countSeg') {
    setMissionUI(
      '第五单元 · 认识线段与有序数线段',
      '👆 依次点击画布上的两个字母端点（如先点A再点B）连出线段',
      `一条直线上有 <span class="hl-key">A、B、C、D 四个端点</span>，一共能数出几条线段？请在画布中依次点击任意两个字母端点，把所有线段都找出来！`,
      `✨ 已找到：<b>${s.foundSegs.length} 条</b> [ ${s.foundSegs.join(', ') || '请点击两个端点'} ]`,
      '💡 按“基本小线段 → 2合1线段 → 3合1最长线段”有序寻找，才能不重复、不遗漏！'
    );
  } else {
    setMissionUI(
      '综合与实践 · 身体上的尺子',
      '👆 点击上方按钮让爸爸和小朋友一拃一拃量课桌并选出结论',
      `爸爸 1 拃长约 <span class="hl-num">18 厘米</span>，小朋友 1 拃长约 <span class="hl-num">12 厘米</span>。他们量<b>同一张课桌</b>，谁量出的拃数更多？请点击按钮动手量一量！`,
      `🖐️ 爸爸已量：<b>${s.dadSpans} 拃</b> ｜ 小朋友已量：<b>${s.kidSpans} 拃</b> ｜ 你的回答：<b>${s.pickedWho === 'kid' ? '小朋友拃数多' : '?'}</b>`,
      '💡 测量同一个物体，身体尺越短，量的次数就越多！'
    );
  }
}

function drawU5() {
  const s = u5State;
  if (s.sub === 'ruler') {
    const penW = s.targetCm * s.pxCm;
    drawCard(s.objX, s.objY - 16, penW, 32, 8, '#E6961C', '#AD6D0B');
    ctx.fillStyle = '#FFF'; ctx.font = '900 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✏️ 待测铅笔 (请用下方尺子和卡尺夹住首尾)', s.objX + penW / 2, s.objY + 5);
    ctx.textAlign = 'left';

    ctx.strokeStyle = 'rgba(63,125,92,0.4)'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(s.objX, s.objY - 45); ctx.lineTo(s.objX, s.objY + 260);
    ctx.moveTo(s.objX + penW, s.objY - 45); ctx.lineTo(s.objX + penW, s.objY + 260);
    ctx.stroke(); ctx.setLineDash([]);

    const rw = 11 * s.pxCm, rh = 100;
    s.rw = rw;
    ctx.save();
    ctx.translate(s.rulerX, s.rulerY);
    ctx.rotate((s.tilt * Math.PI) / 180);
    drawCard(0, 0, rw, rh, 16, s.tilt !== 0 ? '#FCE5E0' : '#FDF1D6', s.tilt !== 0 ? '#E35D44' : '#E6961C');
    ctx.strokeStyle = '#4E342E'; ctx.fillStyle = '#3E2723';
    for (let i = 0; i <= 100; i++) {
      const tx = (0.5 + i / 10) * s.pxCm;
      const th = i % 10 === 0 ? 28 : (i % 5 === 0 ? 18 : 9);
      ctx.lineWidth = i % 10 === 0 ? 2.5 : 1.2;
      ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx, th); ctx.stroke();
      if (i % 10 === 0) {
        ctx.font = '900 20px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(s.startTick + i / 10, tx, 54);
      }
    }

    const span = Math.round((s.calR - s.calL) / s.pxCm);
    if (span > 0 && span <= 10) {
      ctx.strokeStyle = '#3F7D5C'; ctx.lineWidth = 3;
      for (let k = 0; k < span; k++) {
        const x1 = s.calL + k * s.pxCm, x2 = x1 + s.pxCm;
        ctx.beginPath(); ctx.moveTo(x1, 0); ctx.quadraticCurveTo((x1 + x2) / 2, -30, x2, 0); ctx.stroke();
      }
    }
    [{ x: s.calL, c: '#3F7D5C', t: '起点卡尺' }, { x: s.calR, c: '#E35D44', t: '终点卡尺' }].forEach(pin => {
      ctx.strokeStyle = pin.c; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(pin.x, -75); ctx.lineTo(pin.x, 32); ctx.stroke();
      drawCard(pin.x - 34, -106, 68, 30, 9, pin.c);
      ctx.fillStyle = '#FFF'; ctx.font = '900 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(pin.t, pin.x, -86);
    });
    ctx.restore();

    drawCard(40, 445, 840, 120, 18, '#F4EFE6');
    ctx.fillStyle = '#243036'; ctx.font = '900 18px sans-serif';
    ctx.fillText('🔍 测量秘籍：1. 尺子要放正紧贴铅笔； 2. 把绿卡尺拉到铅笔左端，红卡尺拉到铅笔右端！', 65, 492);
    ctx.fillStyle = '#3F7D5C';
    ctx.fillText('💡 生活中的 1 厘米：食指宽 ≈ 1厘米 ｜ 田字格宽 ≈ 1厘米 ｜ 图钉长 ≈ 1厘米', 65, 534);
  } else if (s.sub === 'meter100') {
    drawCard(16, 16, 888, 568, 24, '#FDF1D6');
    ctx.fillStyle = '#243036'; ctx.font = '900 20px sans-serif';
    ctx.fillText('📏 动手实验：用 10 厘米长的竹尺拼成 1 米（1米 = 100厘米）', 44, 62);

    const bx = 40, by = 115, sw = 84, bh = 74;
    drawCard(bx, by, sw * 10, bh, 14, '#EFECE3', '#CFD8DC');
    for (let i = 0; i < 10; i++) {
      const sx = bx + i * sw;
      if (i < s.tenBlocks) {
        drawCard(sx + 2, by + 2, sw - 4, bh - 4, 10, i % 2 === 0 ? '#3F7D5C' : '#367CA0');
        ctx.fillStyle = '#FFF'; ctx.font = '900 16px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('10cm', sx + sw / 2, by + 44);
      }
      ctx.fillStyle = '#243036'; ctx.font = '900 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`${(i + 1) * 10}cm`, sx + sw, by + bh + 28);
    }

    drawCard(40, 265, 840, 280, 20, '#FFFDF9');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#E35D44'; ctx.font = '900 20px sans-serif';
    ctx.fillText('⚖️ 厘米(cm)与米(m) · 核心考点归纳：', 68, 312);
    ctx.fillStyle = '#243036'; ctx.font = '800 17.5px sans-serif';
    ctx.fillText('• 量较短的物体用【厘米】：铅笔长 18 厘米，数学书长 26 厘米', 68, 366);
    ctx.fillText('• 量较长的物体用【米】：黑板长 4 米，教室长 8 米，大树高 10 米', 68, 416);
    ctx.fillText('• 复合单位与比大小：1米25厘米 ＝ 125厘米 ｜ 1米 (100厘米) > 99厘米', 68, 466);
    ctx.fillStyle = '#3F7D5C';
    ctx.fillText('• 只要拼满上方的 10 根 10 厘米竹尺（100厘米），即可点击“验证成果”过关！', 68, 516);
  } else if (s.sub === 'countSeg') {
    drawCard(16, 16, 888, 568, 24, '#F7F5F0');
    const pts = [
      { id: 'A', x: 150, y: 230 }, { id: 'B', x: 356, y: 230 },
      { id: 'C', x: 562, y: 230 }, { id: 'D', x: 768, y: 230 }
    ];
    s.segPts = pts;

    ctx.strokeStyle = '#243036'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(150, 230); ctx.lineTo(768, 230); ctx.stroke();

    const arcCfg = {
      AB: [150, 356, -55, '#3F7D5C'], BC: [356, 562, -55, '#3F7D5C'], CD: [562, 768, -55, '#3F7D5C'],
      AC: [150, 562, -115, '#367CA0'], BD: [356, 768, -135, '#367CA0'],
      AD: [150, 768, -185, '#E35D44']
    };
    s.foundSegs.forEach(code => {
      const cfg = arcCfg[code];
      if (!cfg) return;
      ctx.strokeStyle = cfg[3]; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cfg[0], 230);
      ctx.quadraticCurveTo((cfg[0] + cfg[1]) / 2, 230 + cfg[2], cfg[1], 230);
      ctx.stroke();
    });

    pts.forEach(p => {
      const isSel = s.selPt === p.id;
      ctx.fillStyle = isSel ? '#E35D44' : '#243036';
      ctx.beginPath(); ctx.arc(p.x, p.y, isSel ? 22 : 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#243036'; ctx.font = '900 22px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`端点 ${p.id}`, p.x, p.y + 48);
    });

    const cats = [
      { title: '① 基本小线段 (共3条)', list: ['AB', 'BC', 'CD'], col: '#3F7D5C' },
      { title: '② 2合1组合线段 (共2条)', list: ['AC', 'BD'], col: '#367CA0' },
      { title: '③ 3合1最长线段 (共1条)', list: ['AD'], col: '#E35D44' }
    ];
    cats.forEach((c, idx) => {
      const cx = 42 + idx * 284;
      drawCard(cx, 335, 268, 210, 18, '#FFFDF9', c.col);
      ctx.fillStyle = c.col; ctx.font = '900 17px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(c.title, cx + 134, 374);
      c.list.forEach((code, k) => {
        const has = s.foundSegs.includes(code);
        drawCard(cx + 16 + k * 80, 405, 72, 54, 12, has ? c.col : '#EFECE3');
        ctx.fillStyle = has ? '#FFF' : '#90A4AE'; ctx.font = '900 16px sans-serif';
        ctx.fillText(has ? `线段${code}` : '?', cx + 52 + k * 80, 438);
      });
    });
    ctx.textAlign = 'left';
  } else {
    drawCard(16, 16, 888, 568, 24, '#F7F5F0');
    const deskX = 140, deskW = 648;
    ctx.fillStyle = '#243036'; ctx.font = '900 18px sans-serif';
    ctx.fillText('👨 爸爸的大手（1拃 ≈ 18厘米）：', 48, 68);
    drawCard(deskX, 96, deskW, 64, 14, '#E6C79C', '#C89D66');
    for (let i = 0; i < s.dadSpans; i++) {
      const sx = deskX + i * 162;
      ctx.strokeStyle = '#367CA0'; ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.moveTo(sx + 4, 96); ctx.quadraticCurveTo(sx + 81, 38, sx + 158, 96); ctx.stroke();
      ctx.fillStyle = '#367CA0'; ctx.font = '900 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`爸爸第${i + 1}拃`, sx + 81, 58);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#243036'; ctx.font = '900 18px sans-serif';
    ctx.fillText('👧 小朋友的小手（1拃 ≈ 12厘米）：', 48, 238);
    drawCard(deskX, 268, deskW, 64, 14, '#E6C79C', '#C89D66');
    for (let i = 0; i < s.kidSpans; i++) {
      const sx = deskX + i * 108;
      ctx.strokeStyle = '#E35D44'; ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.moveTo(sx + 4, 268); ctx.quadraticCurveTo(sx + 54, 212, sx + 104, 268); ctx.stroke();
      ctx.fillStyle = '#E35D44'; ctx.font = '900 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`第${i + 1}拃`, sx + 54, 232);
    }

    drawCard(48, 380, 824, 165, 20, '#FDF1D6', '#E6961C');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#AD6D0B'; ctx.font = '900 19px sans-serif';
    ctx.fillText('🖐️ 身体上的4把尺子：一拃(量课桌) ｜ 一步(量走廊) ｜ 一庹(量黑板) ｜ 一脚(量地垫)', 460, 428);
    ctx.fillStyle = '#243036'; ctx.font = '800 16.5px sans-serif';
    ctx.fillText('请先点上方按钮让爸爸和小朋友量完课桌，观察谁的拃数更多，再点“验证成果”！', 460, 488);
    ctx.textAlign = 'left';
  }
}

/* ============================================================================
   第六单元：🛒 7~9的表内乘、除法应用题（严格遵循【每份数 × 份数】书写规范）
   ============================================================================ */
let u6State = {};

const SHOP_GOODS = [
  { id: 'honey', name: '森林蜂蜜罐', icon: '🍯', price: 7, bg: '#FDF1D6', bdr: '#E6961C' },
  { id: 'box',   name: '坚果大礼盒', icon: '🎁', price: 8, bg: '#FCE5E0', bdr: '#E35D44' },
  { id: 'board', name: '松木写生板', icon: '🎨', price: 9, bg: '#DFEFF7', bdr: '#367CA0' }
];

function initU6(sub = 'market') {
  if (sub === 'market') {
    const targetGood = SHOP_GOODS[Math.floor(Math.random() * SHOP_GOODS.length)];
    const targetQty = Math.floor(Math.random() * 5) + 5; // 5~9
    const totalCost = targetGood.price * targetQty;
    const isEnough = Math.random() < 0.55;
    const wallet = isEnough ? totalCost + (Math.floor(Math.random() * 6) + 2) : totalCost - (Math.floor(Math.random() * 5) + 2);
    u6State = { sub: 'market', targetGood, targetQty, totalCost, wallet, isEnough, cartQty: 0, userJudge: null };
  } else if (sub === 'theater') {
    const fullRows = Math.floor(Math.random() * 3) + 4; // 4~6排
    const perRow = [7, 8, 9][Math.floor(Math.random() * 3)]; // 每排座位数(每份数)
    const extra = Math.floor(Math.random() * 5) + 2;
    const totalSeats = perRow * fullRows + extra;
    const canSit = Math.random() < 0.55;
    const guests = canSit ? totalSeats - (Math.floor(Math.random() * 3) + 1) : totalSeats + (Math.floor(Math.random() * 4) + 1);
    u6State = { sub: 'theater', fullRows, perRow, extra, totalSeats, guests, canSit, seatedRows: 0, userJudge: null, verified: false };
  } else if (sub === 'bakery') {
    const perBox = [7, 8, 9][Math.floor(Math.random() * 3)];
    const targetBoxes = Math.floor(Math.random() * 5) + 5; // 5~9
    const totalBreads = perBox * targetBoxes;
    u6State = { sub: 'bakery', perBox, targetBoxes, totalBreads, packedBoxes: 0 };
  } else {
    const targetProds = [18, 24, 36];
    u6State = { sub: 'mulTable', targetProd: targetProds[Math.floor(Math.random() * targetProds.length)], showSquares: false, clickedCells: [] };
  }
  syncU6Toolbar();
  updateU6Text();
}

function syncU6Toolbar() {
  const s = u6State;
  const modes = [
    { id: 'market',   label: '🛒 6A. 森林超市购物 (单价×数量 & 钱够不够)' },
    { id: 'theater',  label: '🎪 6B. 剧场排座位 (乘加应用题：够不够坐)' },
    { id: 'bakery',   label: '🥐 6C. 面包房装盒 (用7~9口诀求商应用题)' },
    { id: 'mulTable', label: '🔢 6D. 九九乘法表规律寻宝镜' }
  ];
  let tools = [];
  if (s.sub === 'market') {
    tools = [
      { label: `➕ 放入1件【${s.targetGood.name}】`, action: () => { if (s.cartQty < 9) { s.cartQty++; sfx.playNote(s.cartQty); updateU6Text(); } } },
      { label: `➖ 拿走1件`, action: () => { if (s.cartQty > 0) { s.cartQty--; sfx.playTick(s.cartQty); updateU6Text(); } } }
    ];
  } else if (s.sub === 'theater') {
    tools = [
      { label: `🐾 让小动物入座 (+1排)`, action: () => { if (s.seatedRows <= s.fullRows) { s.seatedRows++; sfx.playNote(s.seatedRows); updateU6Text(); } } }
    ];
  } else if (s.sub === 'bakery') {
    tools = [
      { label: `📦 装满 1 盒牛角包 (每盒${s.perBox}个)`, action: () => { if (s.packedBoxes < s.targetBoxes) { s.packedBoxes++; sfx.playNote(s.packedBoxes); updateU6Text(); } } },
      { label: `🔄 清空礼盒重装`, action: () => { s.packedBoxes = 0; sfx.playTick(1); updateU6Text(); } }
    ];
  } else {
    tools = [
      { label: '✨ 高亮对角线【平方数】', action: () => { s.showSquares = !s.showSquares; sfx.playNote(5); updateU6Text(); } }
    ];
  }
  renderSubToolbar(modes, s.sub, m => initU6(m), tools);
}

function updateU6Text() {
  const s = u6State;
  if (s.sub === 'market') {
    const curCost = s.targetGood.price * s.cartQty;
    const judgeStr = s.userJudge === 'enough' ? '【✅钱够买】' : (s.userJudge === 'short' ? '【❌钱不够】' : '【? 待盖章】');
    setMissionUI(
      '第六单元 · 7~9乘法购物应用题（单价 × 数量 ＝ 总价）',
      '👆 第1步：点画布左侧商品卡放够数量；第2步：点右侧印章判断【钱够不够】',
      `每个<b>${s.targetGood.name}</b>售价 <span class="hl-num">${s.targetGood.price} 元</span>。小浣熊带了 <span class="hl-key">${s.wallet} 元</span>，想买 <span class="hl-num">${s.targetQty} 个</span>。请先往购物车放入 <b>${s.targetQty} 个</b>，再在收银台盖章判断钱<b>够不够</b>！`,
      `🛒 已放 <b>${s.cartQty}</b> 个（${s.cartQty}个${s.targetGood.price}元） ｜ 算式：<b>${s.targetGood.price} × ${s.cartQty} = ${curCost}（元）</b> ｜ 判断：<b>${judgeStr}</b>`,
      '💡 新课标规范：每个商品的单价是相同加数（写在前面），买的数量是个数（写在后面）！'
    );
  } else if (s.sub === 'theater') {
    const allSeated = s.seatedRows > s.fullRows;
    const shownTotal = allSeated ? s.totalSeats : '?';
    const judgeStr = s.userJudge === 'enough' ? '【✅座位够坐】' : (s.userJudge === 'short' ? '【❌座位不够】' : '【? 待判断】');
    // 严格按照新课标：前 fullRows 排，每排 perRow 个 -> 表示 fullRows 个 perRow -> 写作 s.perRow × s.fullRows + s.extra
    setMissionUI(
      '第六单元 · 乘加两步应用题（每排座位数 × 排数 + 最后一排座位数）',
      '👆 先点击画布左侧座位席一排一排点亮算出总座位数，再点击右侧按钮判断够不够坐',
      `剧场前 <span class="hl-num">${s.fullRows} 排</span> 每排有 <span class="hl-num">${s.perRow} 个</span> 座位，最后 1 排只有 <span class="hl-num">${s.extra} 个</span> 座位。今天来了 <span class="hl-key">${s.guests} 名</span> 小动物观众，座位<b>够坐吗</b>？`,
      `🎪 算式（${s.fullRows}个${s.perRow}加${s.extra}）：<b>${s.perRow} × ${s.fullRows} + ${s.extra} = ${shownTotal}（个）</b> ｜ 观众：<b>${s.guests} 名</b> ｜ 判断：<b>${judgeStr}</b>`,
      `💡 新课标写法：每排有 ${s.perRow} 个座位（相同加数是 ${s.perRow}），有 ${s.fullRows} 排，所以列式为 ${s.perRow} × ${s.fullRows} + ${s.extra}！`
    );
  } else if (s.sub === 'bakery') {
    const rem = s.totalBreads - s.packedBoxes * s.perBox;
    const done = s.packedBoxes === s.targetBoxes;
    setMissionUI(
      '第六单元 · 用7~9的乘法口诀求商应用题',
      '👆 点击画布中的大烤盘或上方【📦装满1盒】按钮，一盒一盒打包直到装完',
      `熊大叔烤好了 <span class="hl-num">${s.totalBreads} 个</span> 牛角包，每 <span class="hl-num">${s.perBox} 个</span> 装一盒，一共可以装满 <span class="hl-key">? 盒</span>？请亲手点击烤盘一盒一盒装满来揭晓答案！`,
      `🥐 已装满：<b>${s.packedBoxes} 盒</b>（剩余 ${rem} 个） ｜ 算式：<b>${s.totalBreads} ÷ ${s.perBox} = ${done ? s.targetBoxes : '?'}（盒）</b>`,
      `💡 想一想：每盒 ${s.perBox} 个，${s.perBox} 乘（几）等于 ${s.totalBreads}？全部装进礼盒后就会揭晓口诀！`
    );
  } else {
    setMissionUI(
      '第六单元 · 九九乘法表规律寻宝',
      `👆 在九九乘法表中点击所有乘积等于 ${s.targetProd} 的算式格子`,
      `请在下方九九乘法表中，找出并点击所有乘积等于 <span class="hl-num">${s.targetProd}</span> 的算式格子（共 4 个格子，对应 2 句不同的口诀）！`,
      `🔢 已找到积为 ${s.targetProd} 的算式：<b>${s.clickedCells.length} / 4 个</b>`,
      '💡 18、24、36 都有两句不同的乘法口诀！'
    );
  }
}

function drawU6() {
  const s = u6State;
  if (s.sub === 'market') {
    drawCard(16, 16, 265, 568, 22, '#F4EFE6');
    ctx.fillStyle = '#243036'; ctx.font = '900 17px sans-serif';
    ctx.fillText('🏪 超市货架 (点商品加购)', 32, 50);

    s.goodBoxes = [];
    SHOP_GOODS.forEach((g, i) => {
      const gy = 74 + i * 162;
      const isTarget = g.id === s.targetGood.id;
      drawCard(30, gy, 237, 142, 18, isTarget ? g.bg : '#FFFDF9', isTarget ? g.bdr : '#CFD8DC');
      s.goodBoxes.push({ id: g.id, x: 30, y: gy, w: 237, h: 142 });

      ctx.font = '40px sans-serif';
      ctx.fillText(g.icon, 44, gy + 74);
      ctx.fillStyle = '#243036'; ctx.font = '900 17px sans-serif';
      ctx.fillText(g.name, 98, gy + 48);
      ctx.fillStyle = '#E35D44'; ctx.font = '900 19px sans-serif';
      ctx.fillText(`单价：${g.price} 元`, 98, gy + 82);
      if (isTarget) {
        ctx.fillStyle = '#3F7D5C'; ctx.font = '900 13px sans-serif';
        ctx.fillText(`👆 本题买它 (点我+1)`, 98, gy + 114);
      }
    });

    drawCard(296, 16, 345, 568, 22, '#FFFDF9');
    ctx.fillStyle = '#243036'; ctx.font = '900 17px sans-serif';
    ctx.fillText(`🛒 购物车（已装 ${s.cartQty} 个，目标买 ${s.targetQty} 个）`, 316, 50);

    for (let i = 0; i < 9; i++) {
      const ix = 320 + (i % 3) * 102, iy = 76 + Math.floor(i / 3) * 86;
      const active = i < s.cartQty;
      drawCard(ix, iy, 88, 74, 14, active ? s.targetGood.bg : '#F4EFE6', active ? s.targetGood.bdr : '#E0E0E0');
      ctx.font = '32px sans-serif'; ctx.textAlign = 'center';
      ctx.globalAlpha = active ? 1 : 0.2;
      ctx.fillText(s.targetGood.icon, ix + 44, iy + 48);
      ctx.globalAlpha = 1;
    }

    drawCard(314, 355, 309, 205, 18, '#F7F5F0');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#367CA0'; ctx.font = '900 16px sans-serif';
    ctx.fillText('📏 单价×数量 线段图：', 330, 390);

    const barStartX = 330, barY = 420, maxSegW = 276 / Math.max(s.targetQty, s.cartQty, 1);
    for (let k = 0; k < s.cartQty; k++) {
      const sx = barStartX + k * maxSegW;
      drawCard(sx, barY, maxSegW - 3, 38, 6, k % 2 === 0 ? '#3F7D5C' : '#367CA0');
      ctx.fillStyle = '#FFF'; ctx.font = '900 12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`${s.targetGood.price}`, sx + (maxSegW - 3) / 2, barY + 24);
    }
    const curCost = s.targetGood.price * s.cartQty;
    ctx.fillStyle = '#243036'; ctx.font = '900 16.5px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(
      s.cartQty > 0 ? `${s.cartQty}个${s.targetGood.price}元：${s.targetGood.price} × ${s.cartQty} = ${curCost}（元）` : '👆 点击左侧商品加入购物车',
      468, 510
    );

    drawCard(656, 16, 248, 568, 22, '#FDF1D6', '#E6961C');
    ctx.fillStyle = '#AD6D0B'; ctx.font = '900 19px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🧾 收银台判断区', 780, 52);

    drawCard(674, 78, 212, 195, 16, '#FFFDF9');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#243036'; ctx.font = '800 16px sans-serif';
    ctx.fillText(`• 需买数量：${s.targetQty} 个`, 690, 118);
    ctx.fillText(`• 购物车总价：${curCost} 元`, 690, 160);
    ctx.fillStyle = '#3F7D5C'; ctx.font = '900 17px sans-serif';
    ctx.fillText(`• 小浣熊带了：${s.wallet} 元`, 690, 202);
    ctx.fillStyle = '#5C707A'; ctx.font = '800 14px sans-serif';
    ctx.fillText(`(装满${s.targetQty}个后对比够不够)`, 690, 244);

    s.judgeBtns = [
      { id: 'enough', label: '✅ 钱够买！', y: 310, bg: s.userJudge === 'enough' ? '#3F7D5C' : '#E0F0E6', fg: s.userJudge === 'enough' ? '#FFF' : '#3F7D5C' },
      { id: 'short',  label: '❌ 钱不够！', y: 405, bg: s.userJudge === 'short'  ? '#E35D44' : '#FCE5E0', fg: s.userJudge === 'short'  ? '#FFF' : '#E35D44' }
    ];
    s.judgeBtns.forEach(b => {
      drawCard(674, b.y, 212, 74, 16, b.bg, b.fg);
      ctx.fillStyle = b.fg; ctx.font = '900 19px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(b.label, 780, b.y + 44);
    });
    ctx.textAlign = 'left';
  } else if (s.sub === 'theater') {
    drawCard(16, 16, 565, 568, 22, '#F7F5F0');
    ctx.fillStyle = '#243036'; ctx.font = '900 17px sans-serif';
    ctx.fillText(`🎪 森林剧场（前 ${s.fullRows} 排每排 ${s.perRow} 座，最后1排 ${s.extra} 座 · 点击座位点亮）`, 34, 50);

    const totalR = s.fullRows + 1;
    const seatW = 50, seatH = 52, startX = 76, startY = 82;
    for (let r = 0; r < totalR; r++) {
      const isLast = r === s.fullRows;
      const cols = isLast ? s.extra : s.perRow;
      const rowLit = r < s.seatedRows;

      ctx.fillStyle = '#5C707A'; ctx.font = '900 14px sans-serif';
      ctx.fillText(`第${r + 1}排`, 26, startY + r * 66 + 32);

      for (let c = 0; c < cols; c++) {
        const sx = startX + c * (seatW + 5);
        const sy = startY + r * 66;
        const bg = rowLit ? (isLast ? '#FCE5E0' : '#E0F0E6') : '#ECE7DC';
        const bdr = rowLit ? (isLast ? '#E35D44' : '#3F7D5C') : '#CFD8DC';
        drawCard(sx, sy, seatW, seatH, 10, bg, bdr);
        ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(rowLit ? '🐿️' : '🪑', sx + seatW / 2, sy + 33);
      }
      ctx.textAlign = 'left';
    }

    drawCard(596, 16, 308, 568, 22, '#F4EFE6');
    ctx.fillStyle = '#243036'; ctx.font = '900 19px sans-serif';
    ctx.fillText('📋 够不够坐·两步推理', 618, 54);

    const allLit = s.seatedRows > s.fullRows;
    drawCard(614, 82, 272, 175, 16, '#FFFDF9');
    ctx.fillStyle = '#3F7D5C'; ctx.font = '900 15.5px sans-serif';
    ctx.fillText(`第1步：先算 ${s.fullRows} 个 ${s.perRow} 加 ${s.extra}`, 628, 118);
    ctx.fillStyle = '#243036'; ctx.font = '900 19px sans-serif';
    ctx.fillText(`算式：${s.perRow} × ${s.fullRows} + ${s.extra}`, 628, 164);
    ctx.fillStyle = '#E35D44';
    ctx.fillText(allLit ? `= ${s.perRow * s.fullRows} + ${s.extra} = ${s.totalSeats}（个）` : `= ? （请先点击左图坐满）`, 628, 212);

    drawCard(614, 276, 272, 95, 16, '#FDF1D6');
    ctx.fillStyle = '#AD6D0B'; ctx.font = '900 16px sans-serif';
    ctx.fillText('第2步：与观众人数比大小', 630, 312);
    ctx.fillStyle = '#243036'; ctx.font = '900 18px sans-serif';
    ctx.fillText(`座位数(${allLit ? s.totalSeats : '?'}) vs 观众(${s.guests}名)`, 630, 348);

    s.theaterBtns = [
      { id: 'enough', label: '✅ 答：座位够坐！', y: 395, bg: s.userJudge === 'enough' ? '#3F7D5C' : '#E0F0E6', fg: s.userJudge === 'enough' ? '#FFF' : '#3F7D5C' },
      { id: 'short',  label: '❌ 答：座位不够坐！', y: 478, bg: s.userJudge === 'short'  ? '#E35D44' : '#FCE5E0', fg: s.userJudge === 'short'  ? '#FFF' : '#E35D44' }
    ];
    s.theaterBtns.forEach(b => {
      drawCard(614, b.y, 272, 66, 16, b.bg, b.fg);
      ctx.fillStyle = b.fg; ctx.font = '900 18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(b.label, 750, b.y + 40);
    });
    ctx.textAlign = 'left';
  } else if (s.sub === 'bakery') {
    const done = s.packedBoxes === s.targetBoxes;
    drawCard(16, 16, 480, 568, 22, '#FDF1D6', '#E6961C');
    ctx.fillStyle = '#AD6D0B'; ctx.font = '900 17px sans-serif';
    ctx.fillText(`🥐 烘焙烤盘（共 ${s.totalBreads} 个，点击烤盘每次装 1 盒）`, 34, 50);

    for (let r = 0; r < s.targetBoxes; r++) {
      const isPackedRow = r < s.packedBoxes;
      for (let c = 0; c < s.perBox; c++) {
        const bx = 36 + c * 48, by = 78 + r * 52;
        drawCard(bx, by, 43, 44, 9, isPackedRow ? '#EFECE3' : '#FFFDF9', isPackedRow ? '#CFD8DC' : '#E6961C');
        ctx.font = '18px sans-serif'; ctx.textAlign = 'center';
        ctx.globalAlpha = isPackedRow ? 0.2 : 1;
        ctx.fillText('🥐', bx + 21, by + 29);
        ctx.globalAlpha = 1;
      }
    }

    drawCard(512, 16, 392, 568, 22, '#F4EFE6');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#243036'; ctx.font = '900 18px sans-serif';
    ctx.fillText(`🎁 已打包礼盒（每盒装 ${s.perBox} 个）：${s.packedBoxes} 盒`, 534, 52);

    for (let b = 0; b < s.packedBoxes; b++) {
      const bx = 534 + (b % 3) * 120, by = 78 + Math.floor(b / 3) * 92;
      drawCard(bx, by, 110, 76, 14, '#E0F0E6', '#3F7D5C');
      ctx.fillStyle = '#3F7D5C'; ctx.font = '900 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`📦第${b + 1}盒`, bx + 55, by + 34);
      ctx.fillText(`(${s.perBox}个)`, bx + 55, by + 58);
    }

    drawCard(534, 375, 348, 185, 18, '#FFFDF9');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#E35D44'; ctx.font = '900 20px sans-serif';
    ctx.fillText(`➗ 算式：${s.totalBreads} ÷ ${s.perBox} = ${done ? s.targetBoxes : '?'}（盒）`, 554, 420);
    ctx.fillStyle = '#243036'; ctx.font = '800 15.5px sans-serif';
    ctx.fillText(`• 剩余未装：${s.totalBreads - s.packedBoxes * s.perBox} 个`, 554, 466);
    ctx.fillStyle = '#3F7D5C'; ctx.font = '900 17px sans-serif';
    ctx.fillText(done ? `🎉 口诀：【${mantra(s.perBox, s.targetBoxes)}】` : `👆 请继续点击烤盘把所有牛角包装完！`, 554, 516);
  } else {
    drawCard(16, 16, 888, 568, 22, '#F7F5F0');
    const ox = 34, oy = 32, cw = 94, ch = 58;
    s.tableCells = [];

    for (let r = 1; r <= 9; r++) {
      for (let c = 1; c <= 9; c++) {
        const cx = ox + (c - 1) * cw, cy = oy + (r - 1) * ch;
        const key = `${r}-${c}`, prod = r * c;
        const isPicked = s.clickedCells.includes(key);
        const isSq = s.showSquares && r === c;

        let bg = '#FFFDF9', bdr = '#E0E0E0';
        if (isPicked) { bg = '#FCE5E0'; bdr = '#E35D44'; }
        else if (isSq) { bg = '#FDF1D6'; bdr = '#E6961C'; }

        drawCard(cx, cy, cw - 6, ch - 6, 10, bg, bdr);
        s.tableCells.push({ r, c, prod, key, x: cx, y: cy, w: cw - 6, h: ch - 6 });

        ctx.fillStyle = isPicked ? '#E35D44' : (isSq ? '#AD6D0B' : '#243036');
        ctx.font = (isPicked || isSq) ? '900 15px sans-serif' : '800 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${c}×${r}=${prod}`, cx + (cw - 6) / 2, cy + 32);
      }
    }
    ctx.textAlign = 'left';
  }
}

/* ============================================================================
   4. 统一指针手势分发与防越界拖拽引擎
   ============================================================================ */
function ptInPoly(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
    if (((yi > pt.y) !== (yj > pt.y)) && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi + 0.001) + xi)) inside = !inside;
  }
  return inside;
}

canvas.addEventListener('pointerdown', e => {
  const pos = getVPos(e);

  if (activeUnit === 'u1') {
    const s = u1State;
    for (let i = s.items.length - 1; i >= 0; i--) {
      if (Math.hypot(pos.x - s.items[i].x, pos.y - s.items[i].y) < 30) {
        s.drag = s.items[i]; sfx.playNote(i); break;
      }
    }
  } else if (activeUnit === 'u2') {
    const s = u2State;
    if (s.sub === 'array') {
      s.dragging = true;
      updateU2Grid(pos);
    } else if (s.sub === 'mulAddSub' && s.plateBoxes) {
      for (const pb of s.plateBoxes) {
        if (pos.x >= pb.x && pos.x <= pb.x + pb.w && pos.y >= pb.y && pos.y <= pb.y + pb.h) {
          s.userCountedPlates = pb.idx + 1;
          s.borrowed = (s.userCountedPlates === s.fullPlates + 1);
          s.verified = false;
          sfx.playNote(pb.idx + 2);
          updateU2Text();
          break;
        }
      }
    } else if (s.sub === 'vsAdd' && s.vsBtns) {
      for (const b of s.vsBtns) {
        if (pos.x >= b.x && pos.x <= b.x + b.w && pos.y >= b.y && pos.y <= b.y + b.h) {
          s.verified = false;
          if (b.room === 'left') {
            if (b.action === 'r1_add') s.leftR1 = Math.min(6, s.leftR1 + 1);
            else if (b.action === 'r1_sub') s.leftR1 = Math.max(0, s.leftR1 - 1);
            else if (b.action === 'r2_add') s.leftR2 = Math.min(6, s.leftR2 + 1);
            else if (b.action === 'r2_sub') s.leftR2 = Math.max(0, s.leftR2 - 1);
            else if (b.action === 'op_mul') s.leftOp = 'mul';
            else if (b.action === 'op_add') s.leftOp = 'add';
          } else {
            if (b.action === 'r1_add') s.rightR1 = Math.min(6, s.rightR1 + 1);
            else if (b.action === 'r1_sub') s.rightR1 = Math.max(0, s.rightR1 - 1);
            else if (b.action === 'r2_add') s.rightR2 = Math.min(6, s.rightR2 + 1);
            else if (b.action === 'r2_sub') s.rightR2 = Math.max(0, s.rightR2 - 1);
            else if (b.action === 'op_mul') s.rightOp = 'mul';
            else if (b.action === 'op_add') s.rightOp = 'add';
          }
          sfx.playNote(3);
          updateU2Text();
          break;
        }
      }
    }
  } else if (activeUnit === 'u3') {
    const s = u3State;
    if (s.sub === 'share') {
      for (let i = s.nuts.length - 1; i >= 0; i--) {
        if (Math.hypot(pos.x - s.nuts[i].x, pos.y - s.nuts[i].y) < 28) {
          s.dragNut = s.nuts[i]; sfx.playNote(i); break;
        }
      }
    } else if (s.sub === 'lasso') {
      s.isLasso = true; s.lasso = [pos];
      s.nuts.forEach(n => (n.sel = false));
    } else if (s.sub === 'inverse' && pos.x < 420) {
      s.draggingSlider = true;
      updateU3Slider(pos);
    }
  } else if (activeUnit === 'u4') {
    const s = u4State;
    if (s.sub === 'sunTurn' && pos.x < 520) {
      s.faceIdx = (s.faceIdx + 1) % 4;
      sfx.playNote(s.faceIdx); updateU4Text();
    } else if (s.sub === 'mapRef') {
      Object.keys(CAMPUS_MAP).forEach(k => {
        const b = CAMPUS_MAP[k];
        if (Math.abs(pos.x - b.x) < 64 && Math.abs(pos.y - b.y) < 46) {
          s.activeRefKey = k; sfx.playNote(4); updateU4Text();
        }
      });
    }
  } else if (activeUnit === 'u5') {
    const s = u5State;
    if (s.sub === 'ruler') {
      const absL = s.rulerX + s.calL, absR = s.rulerX + s.calR;
      if (Math.hypot(pos.x - absL, pos.y - (s.rulerY - 75)) < 42 || Math.abs(pos.x - absL) < 18) s.dragPart = 'calL';
      else if (Math.hypot(pos.x - absR, pos.y - (s.rulerY - 75)) < 42 || Math.abs(pos.x - absR) < 18) s.dragPart = 'calR';
      else if (pos.x >= s.rulerX && pos.x <= s.rulerX + (s.rw || 550) && pos.y >= s.rulerY && pos.y <= s.rulerY + 100) {
        s.dragPart = 'ruler'; s.dx = pos.x - s.rulerX; s.dy = pos.y - s.rulerY;
      }
    } else if (s.sub === 'countSeg' && s.segPts) {
      for (const p of s.segPts) {
        if (Math.hypot(pos.x - p.x, pos.y - p.y) < 34) {
          if (!s.selPt) { s.selPt = p.id; sfx.playNote(1); }
          else if (s.selPt === p.id) { s.selPt = null; }
          else {
            const pair = [s.selPt, p.id].sort().join('');
            if (!s.foundSegs.includes(pair)) { s.foundSegs.push(pair); sfx.playNote(s.foundSegs.length + 2); }
            s.selPt = null;
            updateU5Text();
          }
          break;
        }
      }
    }
  } else if (activeUnit === 'u6') {
    const s = u6State;
    if (s.sub === 'market') {
      for (const gb of (s.goodBoxes || [])) {
        if (pos.x >= gb.x && pos.x <= gb.x + gb.w && pos.y >= gb.y && pos.y <= gb.y + gb.h) {
          if (gb.id === s.targetGood.id && s.cartQty < 9) {
            s.cartQty++; sfx.playNote(s.cartQty); updateU6Text();
          } else sfx.playWarn();
          return;
        }
      }
      for (const jb of (s.judgeBtns || [])) {
        if (pos.x >= 674 && pos.x <= 886 && pos.y >= jb.y && pos.y <= jb.y + 74) {
          s.userJudge = jb.id; sfx.playNote(5); updateU6Text(); return;
        }
      }
    } else if (s.sub === 'theater') {
      if (pos.x < 580) {
        s.seatedRows = (s.seatedRows % (s.fullRows + 1)) + 1;
        sfx.playNote(s.seatedRows); updateU6Text();
      }
      for (const tb of (s.theaterBtns || [])) {
        if (pos.x >= 614 && pos.x <= 886 && pos.y >= tb.y && pos.y <= tb.y + 66) {
          s.userJudge = tb.id; sfx.playNote(5); updateU6Text();
        }
      }
    } else if (s.sub === 'bakery') {
      if (s.packedBoxes < s.targetBoxes) {
        s.packedBoxes++; sfx.playNote(s.packedBoxes); updateU6Text();
      }
    } else if (s.sub === 'mulTable' && s.tableCells) {
      for (const cell of s.tableCells) {
        if (pos.x >= cell.x && pos.x <= cell.x + cell.w && pos.y >= cell.y && pos.y <= cell.y + cell.h) {
          if (cell.prod === s.targetProd) {
            if (!s.clickedCells.includes(cell.key)) s.clickedCells.push(cell.key);
            sfx.playNote(s.clickedCells.length + 3);
            updateU6Text();
          } else sfx.playWarn();
          break;
        }
      }
    }
  }
});

window.addEventListener('pointermove', e => {
  const pos = getVPos(e);

  if (activeUnit === 'u1' && u1State.drag) {
    u1State.drag.x = clamp(pos.x, 36, VW - 36);
    u1State.drag.y = clamp(pos.y, 36, VH - 36);
  } else if (activeUnit === 'u2' && u2State.sub === 'array' && u2State.dragging) {
    updateU2Grid(pos);
  } else if (activeUnit === 'u3') {
    const s = u3State;
    if (s.sub === 'share' && s.dragNut) {
      s.dragNut.x = clamp(pos.x, 36, VW - 36);
      s.dragNut.y = clamp(pos.y, 36, VH - 36);
    } else if (s.sub === 'lasso' && s.isLasso) {
      s.lasso.push(pos);
      s.nuts.forEach(n => { if (!n.packed) n.sel = ptInPoly(n, s.lasso); });
    } else if (s.sub === 'inverse' && s.draggingSlider) {
      updateU3Slider(pos);
    }
  } else if (activeUnit === 'u5') {
    const s = u5State;
    if (s.sub === 'ruler' && s.dragPart) {
      if (s.dragPart === 'ruler') {
        s.rulerX = clamp(pos.x - s.dx, 20, 320);
        s.rulerY = clamp(pos.y - s.dy, 120, 380);
        if (Math.abs(s.rulerY - (s.objY + 32)) < 16) s.rulerY = s.objY + 32;
      } else if (s.dragPart === 'calL') {
        const raw = clamp(pos.x - s.rulerX, 0.5 * s.pxCm, s.calR - 0.5 * s.pxCm);
        const snap = Math.round((raw / s.pxCm - 0.5) * 2) / 2;
        s.calL = (snap + 0.5) * s.pxCm;
        sfx.playTick(snap * 2); updateU5Text();
      } else if (s.dragPart === 'calR') {
        const raw = clamp(pos.x - s.rulerX, s.calL + 0.5 * s.pxCm, 10.5 * s.pxCm);
        const snap = Math.round((raw / s.pxCm - 0.5) * 2) / 2;
        s.calR = (snap + 0.5) * s.pxCm;
        sfx.playTick(snap * 2); updateU5Text();
      }
    }
  }
});

window.addEventListener('pointerup', () => {
  if (activeUnit === 'u1' && u1State.drag) {
    const s = u1State;
    const it = s.drag;
    if (s.sub === 'single') {
      const defs = s.crit === 'color' ? U1_COLS : U1_SHPS;
      let hit = -1;
      for (const b of (s.bins || [])) {
        if (it.x >= b.x && it.x <= b.x + b.w && it.y >= b.y && it.y <= b.y + b.h) {
          const k = s.crit === 'color' ? it.colId : it.shpId;
          if (k === defs[b.idx].id) hit = b.idx; else sfx.playWarn();
          break;
        }
      }
      if (hit >= 0) {
        it.bin = hit;
        const cnt = s.items.filter(x => x.bin === hit && x !== it).length;
        const b = s.bins[hit];
        it.x = b.x + 48 + (cnt % 4) * 56;
        it.y = b.y + 82 + Math.floor(cnt / 4) * 48;
        sfx.playNote(hit + 3);
      } else { it.bin = -1; it.x = it.hx; it.y = it.hy; }
    } else {
      let hit = -1;
      for (const b of (s.leafBins || [])) {
        if (it.x >= b.x && it.x <= b.x + b.w && it.y >= b.y && it.y <= b.y + b.h) {
          if (it.colId === b.col && it.shpId === b.shp) hit = b.idx; else sfx.playWarn();
          break;
        }
      }
      if (hit >= 0) {
        it.leafBin = hit;
        const cnt = s.items.filter(x => x.leafBin === hit && x !== it).length;
        const b = s.leafBins[hit];
        it.x = b.x + 190 + cnt * 56;
        it.y = b.y + 74;
        sfx.playNote(hit + 3);
      } else { it.leafBin = -1; it.x = it.hx; it.y = it.hy; }
    }
    s.drag = null;
    updateU1Text();
  } else if (activeUnit === 'u2') {
    u2State.dragging = false;
  } else if (activeUnit === 'u3') {
    const s = u3State;
    if (s.sub === 'share' && s.dragNut) {
      let ok = false;
      for (const p of (s.plates || [])) {
        if (s.dragNut.x >= p.x && s.dragNut.x <= p.x + p.w && s.dragNut.y >= p.y && s.dragNut.y <= p.y + p.h) {
          s.dragNut.owner = p.idx; ok = true; break;
        }
      }
      if (!ok) { s.dragNut.owner = -1; s.dragNut.x = s.dragNut.hx; s.dragNut.y = s.dragNut.hy; }
      layoutU3Nuts(); s.dragNut = null; sfx.playNote(2); updateU3Text();
    } else if (s.sub === 'lasso' && s.isLasso) {
      const sel = s.nuts.filter(n => !n.packed && n.sel);
      if (sel.length === s.each) {
        sel.forEach(n => { n.packed = true; n.sel = false; });
        s.bags++; sfx.playNote(s.bags + 2);
      } else if (sel.length > 0) {
        sfx.playWarn(); s.nuts.forEach(n => (n.sel = false));
      }
      s.isLasso = false; s.lasso = []; updateU3Text();
    }
    s.draggingSlider = false;
  } else if (activeUnit === 'u5') {
    u5State.dragPart = null;
  }
});

function updateU2Grid(pos) {
  const s = u2State;
  if (!s.grid) return;
  const c = clamp(Math.ceil((pos.x - s.grid.startX) / s.grid.sz), 1, 6);
  const r = clamp(Math.ceil((pos.y - s.grid.startY) / s.grid.sz), 1, 6);
  if (r !== s.r || c !== s.c) {
    s.r = r; s.c = c; sfx.playNote(r + c); updateU2Text();
  }
}

function updateU3Slider(pos) {
  const s = u3State;
  const r = clamp(Math.round((pos.y - 115) / 95) + 1, 1, 4);
  if (r !== s.sliderR) {
    s.sliderR = r; sfx.playNote(r + 2); updateU3Text();
  }
}

/* ============================================================================
   5. 验证成果与全局导航控制
   ============================================================================ */
function verifyCurrentTask() {
  if (activeUnit === 'u1') {
    const s = u1State;
    const ok = s.sub === 'single' ? s.items.every(it => it.bin >= 0) : s.items.every(it => it.leafBin >= 0);
    if (ok) { winReward(); setTimeout(() => initU1(s.sub), 1500); } else sfx.playWarn();
  } else if (activeUnit === 'u2') {
    const s = u2State;
    if (s.sub === 'array') {
      if (s.r * s.c === s.target) { winReward(); setTimeout(() => initU2('array'), 1500); } else sfx.playWarn();
    } else if (s.sub === 'mulAddSub') {
      const ok = (!s.borrowed && s.userCountedPlates === s.fullPlates) || (s.borrowed && s.userCountedPlates === s.fullPlates + 1);
      if (ok) {
        s.verified = true; updateU2Text(); winReward();
        setTimeout(() => initU2('mulAddSub'), 1800);
      } else sfx.playWarn();
    } else {
      const leftOk = s.leftR1 === s.leftTask.r1 && s.leftR2 === s.leftTask.r2 && s.leftOp === s.leftTask.type;
      const rightOk = s.rightR1 === s.rightTask.r1 && s.rightR2 === s.rightTask.r2 && s.rightOp === s.rightTask.type;
      if (leftOk && rightOk) {
        s.verified = true; updateU2Text(); winReward();
        setTimeout(() => initU2('vsAdd'), 2000);
      } else {
        sfx.playWarn();
      }
    }
  } else if (activeUnit === 'u3') {
    const s = u3State;
    if (s.sub === 'share') {
      const cnts = Array(s.groups).fill(0);
      s.nuts.forEach(n => { if (n.owner >= 0) cnts[n.owner]++; });
      if (cnts.every(c => c === s.each)) { winReward(); setTimeout(() => initU3('share'), 1500); } else sfx.playWarn();
    } else if (s.sub === 'lasso') {
      if (s.bags === s.groups) { winReward(); setTimeout(() => initU3('lasso'), 1500); } else sfx.playWarn();
    } else {
      if (s.sliderR === s.groups) { winReward(); setTimeout(() => initU3('inverse'), 1500); } else sfx.playWarn();
    }
  } else if (activeUnit === 'u4') {
    const s = u4State;
    if (s.sub === 'sunTurn') {
      if (s.faceIdx === s.targetFaceIdx) { winReward(); setTimeout(() => initU4('sunTurn'), 1500); } else sfx.playWarn();
    } else {
      if (s.pickedDir === s.qPair.ans) { winReward(); setTimeout(() => initU4('mapRef'), 1500); } else sfx.playWarn();
    }
  } else if (activeUnit === 'u5') {
    const s = u5State;
    if (s.sub === 'ruler') {
      const span = Math.round((s.calR - s.calL) / s.pxCm);
      if (s.tilt === 0 && span === s.targetCm) { winReward(); setTimeout(() => initU5('ruler'), 1500); } else sfx.playWarn();
    } else if (s.sub === 'meter100') {
      if (s.tenBlocks === 10) { winReward(); setTimeout(() => initU5('meter100'), 1500); } else sfx.playWarn();
    } else if (s.sub === 'countSeg') {
      if (s.foundSegs.length === 6) { winReward(); setTimeout(() => initU5('countSeg'), 1500); } else sfx.playWarn();
    } else {
      if (s.dadSpans === 4 && s.pickedWho === 'kid') { winReward(); setTimeout(() => initU5('bodySpan'), 1500); } else sfx.playWarn();
    }
  } else if (activeUnit === 'u6') {
    const s = u6State;
    if (s.sub === 'market') {
      const correctJudge = s.isEnough ? 'enough' : 'short';
      if (s.cartQty === s.targetQty && s.userJudge === correctJudge) {
        winReward(); setTimeout(() => initU6('market'), 1500);
      } else sfx.playWarn();
    } else if (s.sub === 'theater') {
      const correctJudge = s.canSit ? 'enough' : 'short';
      if (s.seatedRows > s.fullRows && s.userJudge === correctJudge) {
        winReward(); setTimeout(() => initU6('theater'), 1500);
      } else sfx.playWarn();
    } else if (s.sub === 'bakery') {
      if (s.packedBoxes === s.targetBoxes) {
        winReward(); setTimeout(() => initU6('bakery'), 1500);
      } else sfx.playWarn();
    } else {
      if (s.clickedCells.length === 4) {
        winReward(); setTimeout(() => initU6('mulTable'), 1500);
      } else sfx.playWarn();
    }
  }
}

document.getElementById('btnVerify').addEventListener('click', verifyCurrentTask);
document.getElementById('btnMiniVerify').addEventListener('click', verifyCurrentTask);

function initActiveUnit() {
  if (activeUnit === 'u1') initU1('single');
  else if (activeUnit === 'u2') initU2('mulAddSub');
  else if (activeUnit === 'u3') initU3('share');
  else if (activeUnit === 'u4') initU4('sunTurn');
  else if (activeUnit === 'u5') initU5('ruler');
  else if (activeUnit === 'u6') initU6('market');
}

document.querySelectorAll('.unit-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeUnit = btn.dataset.unit;
    sfx.playNote(1);
    initActiveUnit();
  });
});

document.getElementById('btnRandom').addEventListener('click', () => { sfx.playNote(3); initActiveUnit(); });
document.getElementById('btnMiniRand').addEventListener('click', () => { sfx.playNote(3); initActiveUnit(); });

function renderMainLoop() {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(vScale * dpr, 0, 0, vScale * dpr, vOffX * dpr, vOffY * dpr);

  if (activeUnit === 'u1') drawU1();
  else if (activeUnit === 'u2') drawU2();
  else if (activeUnit === 'u3') drawU3();
  else if (activeUnit === 'u4') drawU4();
  else if (activeUnit === 'u5') drawU5();
  else if (activeUnit === 'u6') drawU6();

  requestAnimationFrame(renderMainLoop);
}

updateViewport();
initActiveUnit();
renderMainLoop();
