
import {StableWrite} from './save.js';
import {Round,scene,trajectory,tiers} from './rules.js';
import {sql} from './db.js';
import css from './style.css';
import {markup} from './layout.js';
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:css}));
document.querySelector('#app').innerHTML=markup;
let round=new Round(),roundWrite=null,saveBusy=false,saved=false,history=[];
const tierKeys=['ss','s','m','x'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* ============ 基础 ============ */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1, S = 1;
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * DPR; canvas.height = H * DPR;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  S = Math.max(0.7, Math.min(1.25, Math.min(W / 1200, H / 800)));
}
window.addEventListener('resize', resize);
resize();

function rr(x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function bez(p0, cp, p1, t) {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * cp.x + t * t * p1.x, y: u * u * p0.y + 2 * u * t * cp.y + t * t * p1.y };
}
function lerp(a, b, t) { return a + (b - a) * t; }

/* ============ 签文池 ============ */
const TIER_META = {
  ss: { label: '上上签', color: '#8A6A0F', bg: '#F7E9BE' },
  s: { label: '上签', color: '#0F6E56', bg: '#DCF2E7' },
  m: { label: '中签', color: '#4A5A6A', bg: '#E9EEF3' },
  x: { label: '下签', color: '#6B6157', bg: '#F0EBE3' }
};

/* ============ 场景 ============ */
const ROWS = [
  { yRel: 0.435, scale: 0.78, xs: [0.20, 0.36, 0.50, 0.64, 0.80] },
  { yRel: 0.60,  scale: 1.00, xs: [0.22, 0.38, 0.50, 0.62, 0.78] }
];
let pots = [];
function buildPots() {
  pots = [];
  ROWS.forEach((row, i) => row.xs.forEach(rx => pots.push({ row: i, relX: rx, yRel: row.yRel, scale: row.scale, alive: true })));
}
buildPots();
function potR(p) { return 34 * S * p.scale; }
function potHit(p) { const r = potR(p); return { x: p.relX * W, y: p.yRel * H - r * 0.3, r: r * 0.95 + 12 }; }

/* ============ 状态 ============ */
const CHARGE = 1.15;
const MAX_BRICKS = 3; // 每回合砖数：砸空也消耗一块——"只有三次机会"的张力就来自这里
let state = 'aim'; // aim / charging / flying / reveal / done
let power = 0, lastTick = 0;
let aim = { x: W / 2, y: H * 0.45 };
let brick = null;
let bricks = 0;
let particles = [], dusts = [], slip = null;
let pendingFortune = null, revealTimer = 0;
let fortunesGot = [];

function handX() { return Math.min(W - 150 * S, W * 0.5 + 320 * S); }
function handY() { return H - 64 * S; }
function computeFlight(pw) {
 const path=trajectory(scene(W,H).hand,aim,pw);
 return {p0:path.start,cp:path.control,p1:path.end,dur:path.duration};
}

/* ============ DOM ============ */
const statsEl = document.getElementById('stats');
const toastEl = document.getElementById('toast');
const fortuneOverlay = document.getElementById('fortuneOverlay');
const endOverlay = document.getElementById('endOverlay');
const fBadge = document.getElementById('fBadge');
const fText = document.getElementById('fText');
const fIdx = document.getElementById('fIdx');
const endStats = document.getElementById('endStats');
const endList = document.getElementById('endList');
const muteBtn = document.getElementById('muteBtn');
const copyBtn = document.getElementById('copyBtn');
let toastTimer = null;
function toast(s) {
  toastEl.textContent = s;
  toastEl.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 1400);
}
function updateStats() {
  const broken = pots.filter(p => !p.alive).length;
  statsEl.textContent = '罐 ' + broken + '/' + pots.length + ' · 砖 ' + bricks + '/' + MAX_BRICKS;
}
updateStats();

/* ============ 音效（WebAudio 合成，无素材） ============ */
let AC = null, noiseBuf = null, muted = false;
function ensureAudio() {
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      const len = (AC.sampleRate * 0.5) | 0;
      noiseBuf = AC.createBuffer(1, len, AC.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (AC.state === 'suspended') AC.resume();
  } catch (e) { AC = null; }
}
function tone(freq, dur, type, vol, when) {
  if (!AC || muted) return;
  try {
    const t0 = AC.currentTime + (when || 0);
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(vol || 0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(AC.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  } catch (e) {}
}
function noiseHit(dur, vol, filterFreq, type) {
  if (!AC || muted) return;
  try {
    const t0 = AC.currentTime;
    const src = AC.createBufferSource(); src.buffer = noiseBuf;
    const f = AC.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = filterFreq;
    const g = AC.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(AC.destination);
    src.start(t0); src.stop(t0 + dur + 0.02);
  } catch (e) {}
}
function playWhoosh() { noiseHit(0.22, 0.25, 1800, 'bandpass'); }
function playSmash() { noiseHit(0.30, 0.5, 900); tone(110, 0.25, 'sine', 0.3); }
function playThud() { tone(85, 0.12, 'sine', 0.25); }
function playChime(tier) {
  if (tier === 'ss') { tone(659, 0.35, 'triangle', 0.22); tone(988, 0.5, 'triangle', 0.18, 0.14); }
  else if (tier === 's') { tone(587, 0.3, 'triangle', 0.2); tone(784, 0.45, 'triangle', 0.16, 0.12); }
  else if (tier === 'm') { tone(494, 0.3, 'triangle', 0.18); tone(622, 0.4, 'triangle', 0.15, 0.12); }
  else { tone(311, 0.35, 'sawtooth', 0.10); tone(233, 0.6, 'sawtooth', 0.09, 0.18); }
}
muteBtn.addEventListener('click', () => {
  muted = !muted;
  muteBtn.textContent = muted ? '音效：关' : '音效：开';
});

/* ============ 输入 ============ */
canvas.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  ensureAudio();
  if (state === 'aim') { state = 'charging'; power = 0; lastTick = 0; }
});
window.addEventListener('pointerup', () => { if (state === 'charging') release(); });
window.addEventListener('pointermove', e => { aim.x = e.clientX; aim.y = e.clientY; });
window.addEventListener('blur', () => { if (state === 'charging') release(); });
document.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && state === 'reveal' && !fortuneOverlay.classList.contains('hidden')) closeCard();
});

function release() {
  if (power < 0.08) { toast('手一滑，砖掉脚边了'); state = 'aim'; return; }
  const result=round.throw(power,aim,scene(W,H));
  bricks=round.bricks;
  const fl = computeFlight(power);
  brick = { t: 0, dur: fl.dur, p0: fl.p0, cp: fl.cp, p1: fl.p1, rot: -0.3, pos: fl.p0, result };
  state = 'flying';
  playWhoosh();
  updateStats();
}

/* ============ 砸中 / 砸空 ============ */
function spawnShards(x, y) {
  const cols = ['#C96F45', '#A4522F', '#E08A5C', '#B96844'];
  for (let i = 0; i < 15; i++) {
    const a = Math.random() * Math.PI * 2, sp = 120 + Math.random() * 340;
    particles.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 160, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10, sz: (4 + Math.random() * 7) * S, col: cols[i % 4], life: 0.7 + Math.random() * 0.5 });
  }
  for (let i = 0; i < 5; i++) {
    dusts.push({ x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 20, r: 8 * S, vr: 55 * S, alpha: 0.5 });
  }
}
function spawnGold(x, y) {
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2, sp = 90 + Math.random() * 240;
    particles.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 260, rot: 0, vr: 0, sz: (3 + Math.random() * 4) * S, col: '#E8B84B', life: 0.8 + Math.random() * 0.4 });
  }
}
function smash(p, hx, hy, fortune) {
  p.alive = false;
  spawnShards(hx, hy);
  pendingFortune = {tier:tierKeys[fortune.tier],text:fortune.text};
  slip = { x: hx, y: hy - 10, vy: -320, rot: 0, vr: 5, alpha: 1 };
  playSmash();
  if (pendingFortune.tier === 'ss') spawnGold(hx, hy);
  state = 'reveal';
  revealTimer = 0.55;
  updateStats();
}

/* ============ 卡片 ============ */
function showFortuneCard() {
  const m = TIER_META[pendingFortune.tier];
  fBadge.textContent = m.label;
  fBadge.style.color = m.color;
  fBadge.style.background = m.bg;
  fText.textContent = pendingFortune.text;
  fIdx.textContent = fortunesGot.length + 1;
  fortunesGot.push(pendingFortune);
  fortuneOverlay.classList.remove('hidden');
  playChime(pendingFortune.tier);
}
function closeCard() {
  if (fortuneOverlay.classList.contains('hidden')) return;
  fortuneOverlay.classList.add('hidden');
  if (bricks < MAX_BRICKS) { state = 'aim'; }
  else { state = 'done'; showEnd(); }
}
fortuneOverlay.addEventListener('pointerdown', closeCard);

function showEnd() {
  const cnt = { ss: 0, s: 0, m: 0, x: 0 };
  fortunesGot.forEach(f => cnt[f.tier]++);
  const hit = pots.filter(p => !p.alive).length;
  endStats.textContent = '砸中 ' + hit + ' / ' + MAX_BRICKS + ' · 签运：上上×' + cnt.ss + ' 上×' + cnt.s + ' 中×' + cnt.m + ' 下×' + cnt.x;
  endList.innerHTML = fortunesGot.length ? fortunesGot.map(f => {
    const m = TIER_META[f.tier];
    return '<div class="fRow"><span class="dot" style="background:' + m.color + '"></span><span>' + m.label + ' · ' + f.text + '</span></div>';
  }).join('') : '<div class="fRow"><span class="dot" style="background:#6B6157"></span><span>一块都没砸中，签运欠奉，再来一轮吧</span></div>';
  endOverlay.classList.remove('hidden');
  updateSaveControls();
}
function resetRound() {
  if(saveBusy)return;
  round=new Round();roundWrite=null;saved=false;
  document.querySelector('#save-status').textContent='';
  buildPots();
  bricks = 0; fortunesGot = [];
  particles = []; dusts = []; slip = null; brick = null; pendingFortune = null; power = 0;
  state = 'aim';
  endOverlay.classList.add('hidden');
  updateStats();
}
document.getElementById('againBtn').addEventListener('click',resetRound);
copyBtn.addEventListener('click', async () => {
  const cnt = { ss: 0, s: 0, m: 0, x: 0 };
  fortunesGot.forEach(f => cnt[f.tier]++);
  const hit = pots.filter(p => !p.alive).length;
  const best = (fortunesGot.find(f => f.tier === 'ss') || fortunesGot.find(f => f.tier === 's') || fortunesGot[0] || { text: '一块都没砸中，无签可晒' }).text;
  const txt = '【砸罐战报】3 块砖 · 砸中 ' + hit + ' 个罐子\n上上×' + cnt.ss + ' 上×' + cnt.s + ' 中×' + cnt.m + ' 下×' + cnt.x + '\n最欧的一签：' + best + '\n——来自程序员节砸罐抽签';
  let ok = false;
  try { await navigator.clipboard.writeText(txt); ok = true; } catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = txt; document.body.appendChild(ta); ta.select();
      ok = document.execCommand('copy'); ta.remove();
    } catch (e2) { ok = false; }
  }
  copyBtn.textContent = ok ? '已复制' : '复制失败';
  setTimeout(() => { copyBtn.textContent = '复制战报'; }, 1600);
});

/* ============ 更新 ============ */
function update(dt) {
  if (state === 'charging') {
    power = Math.min(1, power + dt / CHARGE);
    const step = Math.floor(power * 4);
    if (step > lastTick) { lastTick = step; tone(380 + step * 160, 0.05, 'square', 0.12); }
  }
  if (state === 'flying' && brick) {
    brick.t += dt / brick.dur;
    const tt = Math.min(1, brick.t);
    brick.pos = bez(brick.p0, brick.cp, brick.p1, tt);
    brick.rot += dt * 6;
    if (brick.t >= 1) {
      // 只在落点结算：预览圈指哪打哪，砖从前排头顶飞过去，不会被半路挡下
      const land = brick.p1;
      const result=brick.result;
      const hitPot=result.index>=0?pots[result.index]:null;
      brick = null;
      if (hitPot) { smash(hitPot, land.x, land.y,result.fortune); }
      else {
        for (let i = 0; i < 4; i++) dusts.push({ x: land.x + (Math.random() - 0.5) * 24, y: land.y + (Math.random() - 0.5) * 16, r: 7 * S, vr: 45 * S, alpha: 0.45 });
        playThud();
        toast('砸空了，一块砖没了');
        if (bricks >= MAX_BRICKS) { state = 'done'; setTimeout(showEnd, 1000); }
        else { state = 'aim'; }
      }
    }
  }
  if (state === 'reveal') {
    revealTimer -= dt;
    if (revealTimer <= 0 && fortuneOverlay.classList.contains('hidden')) showFortuneCard();
  }
  particles = particles.filter(pt => (pt.life -= dt) > 0);
  particles.forEach(pt => { pt.vy += 1500 * dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.rot += pt.vr * dt; });
  dusts = dusts.filter(d => (d.alpha -= dt * 1.1) > 0);
  dusts.forEach(d => { d.r += d.vr * dt; });
  if (slip) {
    slip.vy += 900 * dt; slip.y += slip.vy * dt; slip.rot += slip.vr * dt; slip.alpha -= dt * 1.4;
    if (slip.alpha <= 0) slip = null;
  }
}

/* ============ 绘制 ============ */
function drawScene(t) {
  ctx.fillStyle = '#F3E6D2'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#E7D6BC'; ctx.fillRect(0, H * 0.66, W, H * 0.34);
  ctx.fillStyle = '#D9C4A5'; ctx.fillRect(0, H * 0.66, W, 3);
  const awH = 76 * S;
  let x = 0, i = 0;
  while (x < W) {
    const w = 62 * S;
    ctx.fillStyle = (i % 2) ? '#FBF3E6' : '#E2574C';
    ctx.fillRect(x, 0, w + 1, awH);
    x += w; i++;
  }
  ctx.fillStyle = '#C8463C'; ctx.fillRect(0, awH - 6 * S, W, 6 * S);
  // 挂牌
  const cx = W / 2, cy = awH + 30 * S, sw = 210 * S, sh = 44 * S;
  ctx.fillStyle = '#B98A5C'; rr(cx - sw / 2, cy - sh / 2, sw, sh, 8 * S); ctx.fill();
  ctx.strokeStyle = '#9A6A3C'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#4A331F';
  ctx.font = '600 ' + (17 * S) + 'px system-ui,"Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('程序员节快乐', cx, cy + 1);
  // 两排罐子与木板
  ROWS.forEach((row, idx) => {
    const r0 = 34 * S * row.scale;
    const baseY = row.yRel * H + r0;
    const xs = row.xs.map(rx => rx * W);
    const x0 = Math.min.apply(null, xs) - r0 * 1.6, x1 = Math.max.apply(null, xs) + r0 * 1.6;
    ctx.fillStyle = '#C08A54'; rr(x0, baseY, x1 - x0, 13 * S, 4 * S); ctx.fill();
    ctx.fillStyle = '#9A6A3C'; ctx.fillRect(x0, baseY + 13 * S, x1 - x0, 3 * S);
    pots.filter(p => p.row === idx && p.alive).forEach(drawPot);
  });
}
function drawPot(p) {
  const x = p.relX * W, y = p.yRel * H, r = 34 * S * p.scale;
  ctx.fillStyle = 'rgba(59,46,36,0.14)';
  ctx.beginPath(); ctx.ellipse(x, y + r * 0.98, r * 0.85, r * 0.16, 0, 0, 7); ctx.fill();
  ctx.fillStyle = p.row === 0 ? '#B96844' : '#C96F45';
  ctx.beginPath(); ctx.ellipse(x, y, r * 0.8, r, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(90,42,20,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = p.row === 0 ? '#A85B3A' : '#BA6540';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.34, y - r * 0.72); ctx.lineTo(x - r * 0.42, y - r * 1.12);
  ctx.lineTo(x + r * 0.42, y - r * 1.12); ctx.lineTo(x + r * 0.34, y - r * 0.72);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E08A5C';
  ctx.beginPath(); ctx.ellipse(x, y - r * 1.12, r * 0.46, r * 0.13, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,244,228,0.55)'; ctx.lineWidth = Math.max(2, 3 * S);
  ctx.beginPath(); ctx.ellipse(x, y + r * 0.15, r * 0.62, r * 0.72, 0, 0.6, 2.5); ctx.stroke();
}
function drawBrickShape(x, y, rot, sc) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const w = 128 * sc, h = 58 * sc;
  ctx.fillStyle = '#C4553B'; rr(-w / 2, -h / 2, w, h, 7 * sc); ctx.fill();
  ctx.strokeStyle = '#8E3B28'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#A6432C';
  rr(-w / 2 + 8 * sc, -h / 2 + 8 * sc, w - 16 * sc, 4 * sc, 2 * sc); ctx.fill();
  rr(-w / 2 + 8 * sc, h / 2 - 12 * sc, w - 16 * sc, 4 * sc, 2 * sc); ctx.fill();
  ctx.fillStyle = '#9C3F2B';
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
    if ((i + j + 2) % 2 === 0) { ctx.beginPath(); ctx.ellipse(i * 30 * sc, j * 13 * sc, 7 * sc, 5 * sc, 0, 0, 7); ctx.fill(); }
  }
  ctx.restore();
}
function drawHandBrick(t) {
  let ox = 0, oy = Math.sin(t * 2.2) * 4 * S, rot = -0.06;
  if (state === 'charging') {
    ox = power * 30 * S; oy = power * 22 * S; rot = -0.06 - power * 0.45;
    if (power >= 1) { ox += Math.sin(t * 55) * 2.5; oy += Math.cos(t * 47) * 2.5; }
  }
  drawBrickShape(handX() + ox, handY() + oy, rot, 1.05 * S);
}
function drawTraj() {
  const fl = computeFlight(power);
  for (let i = 1; i <= 14; i++) {
    const tt = i / 15;
    const pt = bez(fl.p0, fl.cp, fl.p1, tt);
    ctx.fillStyle = 'rgba(59,46,36,' + (0.08 + tt * 0.32) + ')';
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 4.5 * S * (1 - tt * 0.4), 0, 7); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(59,46,36,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(fl.p1.x, fl.p1.y, 9 * S, 0, 7); ctx.stroke();
}
function drawPower() {
  const bw = 230 * S, bh = 14 * S, bx = W / 2 - bw / 2, by = H - 46 * S;
  ctx.fillStyle = 'rgba(59,46,36,0.15)'; rr(bx, by, bw, bh, bh / 2); ctx.fill();
  const c = power < 0.55 ? '#1D9E75' : (power < 0.9 ? '#EF9F27' : '#E24B4A');
  ctx.fillStyle = c;
  if (power > 0.02) { rr(bx + 2, by + 2, (bw - 4) * power, bh - 4, (bh - 4) / 2); ctx.fill(); }
  ctx.fillStyle = '#3B2E24';
  ctx.font = '600 ' + (12 * S) + 'px system-ui,"Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('力度' + (power >= 1 ? ' · 拉满！' : ''), W / 2, by - 8 * S);
}
function render(t) {
  drawScene(t);
  // 尘土
  dusts.forEach(d => {
    ctx.fillStyle = 'rgba(120,100,80,' + Math.max(0, d.alpha) + ')';
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill();
  });
  // 碎片
  particles.forEach(pt => {
    ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.rot);
    ctx.globalAlpha = Math.max(0, Math.min(1, pt.life));
    ctx.fillStyle = pt.col;
    ctx.fillRect(-pt.sz / 2, -pt.sz / 2, pt.sz, pt.sz * 0.7);
    ctx.restore();
  });
  ctx.globalAlpha = 1;
  // 飞出的签纸
  if (slip) {
    ctx.save(); ctx.translate(slip.x, slip.y); ctx.rotate(slip.rot);
    ctx.globalAlpha = Math.max(0, slip.alpha);
    ctx.fillStyle = '#FFFBF0'; rr(-13 * S, -19 * S, 26 * S, 38 * S, 3 * S); ctx.fill();
    ctx.strokeStyle = '#D8C9AE'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#D9534F'; ctx.fillRect(-13 * S, -19 * S, 26 * S, 7 * S);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  // 手里的砖 / 飞行中的砖
  if (state === 'flying' && brick) {
    const tt = Math.min(1, brick.t);
    drawBrickShape(brick.pos.x, brick.pos.y, brick.rot, (0.85 - 0.45 * tt) * 1.1 * S);
  } else {
    drawHandBrick(t);
  }
  // 准星
  if (state === 'aim' || state === 'charging') {
    ctx.strokeStyle = 'rgba(59,46,36,0.75)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(aim.x, aim.y, 11 * S, 0, 7); ctx.stroke();
    ctx.fillStyle = 'rgba(59,46,36,0.75)';
    ctx.beginPath(); ctx.arc(aim.x, aim.y, 2.2, 0, 7); ctx.fill();
  }
  // 蓄力 UI
  if (state === 'charging') { drawTraj(); drawPower(); }
}

/* ============ 主循环 ============ */
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  render(now / 1000);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* 只读调试口（自动化验证用，不影响玩法） */
window.__dbg = {
  state: () => state,
  power: () => power,
  bricks: () => bricks,
  pots: () => pots.filter(p => p.alive).map(p => { const h = potHit(p); h.row = p.row; return h; })
};

function updateSaveControls(){const button=document.querySelector('#save');button.disabled=saved||saveBusy;button.textContent=saved?'已保存':saveBusy?'保存中…':'保存战报';document.querySelector('#againBtn').disabled=saveBusy;}
async function save(){if(saveBusy||saved)return;const savingRound=round;if(!roundWrite){const payload=JSON.stringify(round.summary()),hits=round.broken.size,at=new Date().toISOString();roundWrite=new StableWrite({read:'SELECT id FROM draw_rounds WHERE id=?',insert:'INSERT OR IGNORE INTO draw_rounds(id,hits,report,created_at) VALUES(?,?,?,?)',args:id=>[id,hits,payload,at]})}const write=roundWrite;saveBusy=true;updateSaveControls();try{await write.run(sql);if(round===savingRound){saved=true;await load();if(round===savingRound&&state==='done')document.querySelector('#save-status').textContent='战报已保存'}}catch(e){if(round===savingRound&&state==='done')document.querySelector('#save-status').textContent=e.message}finally{saveBusy=false;if(round===savingRound&&state==='done')updateSaveControls()}}
async function load(){try{history=await sql('SELECT hits,report,created_at FROM draw_rounds ORDER BY created_at DESC LIMIT 20');document.querySelector('#records').innerHTML=history.map(r=>`<p>${esc(r.created_at.slice(0,16))} · 命中 ${esc(r.hits)}/3 · ${JSON.parse(r.report).draws.map(f=>tiers[f.tier]).join('、')}</p>`).join('')||'还没有保存的战报';document.querySelector('#cloudStatus').textContent='个人云战报已读取'}catch(e){document.querySelector('#records').textContent=e.message;document.querySelector('#cloudStatus').textContent=e.message}}
document.querySelector('#save').onclick=save;
document.querySelector('#reload').onclick=load;
document.querySelector('#historyBtn').onclick=()=>document.querySelector('#historyOverlay').classList.remove('hidden');
document.querySelector('#historyClose').onclick=()=>document.querySelector('#historyOverlay').classList.add('hidden');
load();
