/* =========================================================================
 * 仿真运行库：八大系统工作原理动态仿真
 * 每个仿真 = { title, desc, notes[], controls[], mount(ctx) -> {destroy} }
 * ========================================================================= */

const NS = 'http://www.w3.org/2000/svg';
const C = {
  car: '#bfdbfe', carS: '#1d4ed8', cw: '#fde68a', cwS: '#b45309',
  rope: '#475569', rail: '#cbd5e1', railS: '#475569', ok: '#059669', bad: '#dc2626'
};

function E(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
/* role="img" + 可选 aria-label（v1.4.0 可访问性加固）：
   内联 SVG 默认被读屏器当作一组无语义图形，加 role="img" 才作为一个整体图像播报；
   <title> 必须在 innerHTML 之后再插入，否则会被 markup 整体覆盖掉。 */
function makeSvg(stage, vb, markup, label) {
  stage.innerHTML = '';
  const svg = E('svg', { viewBox: vb, xmlns: NS, role: 'img' });
  if (label) svg.setAttribute('aria-label', label);
  if (markup) svg.innerHTML = markup;
  if (label) {
    const t = E('title', {});
    t.textContent = label;
    svg.insertBefore(t, svg.firstChild);
  }
  stage.appendChild(svg);
  return svg;
}
function ticker(cb) {
  let run = true, last = performance.now();
  function loop(t) {
    if (!run) return;
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    cb(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  return () => { run = false; };
}
function buildControls(ctrl, spec, onchange, onaction, els) {
  const root = document.createElement('div');
  (spec || []).forEach(c => {
    if (c.type === 'buttons') {
      const row = document.createElement('div'); row.className = 'btn-row';
      c.items.forEach(it => {
        const b = document.createElement('button');
        b.className = 'btn ' + (it.cls || 'ghost'); b.textContent = it.label;
        b.title = it.tip || '';
        b.dataset.key = it.key;
        if (els) els[it.key] = b;               // INF-3 ①：每个按钮单独登记
        if (it.hold) {
          // INF-3 ②：按住式控件（扶梯检修点动）。pointer + Space/Enter 键程
          const dn = () => onaction(it.key + ':down', b);
          const up = () => onaction(it.key + ':up', b);
          b.addEventListener('pointerdown', e => { e.preventDefault(); dn(); });
          b.addEventListener('pointerup', up);
          b.addEventListener('pointercancel', up);
          b.addEventListener('pointerleave', up);
          b.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); dn(); } });
          b.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') up(); });
        } else {
          b.addEventListener('click', () => onaction(it.key, b));
        }
        row.appendChild(b);
      });
      root.appendChild(row);
      // 兼容：无非按住按钮的按钮组，仍把首个按钮的容器登记到 els（历史行为）
      if (els && !c.items.some(x => x.hold)) els[c.items[0].key] = row;
    } else if (c.type === 'checkbox') {
      const wrap = document.createElement('label');
      wrap.style.cssText = 'display:flex;align-items:center;gap:9px;font-size:.94rem;margin-top:12px;font-weight:600;cursor:pointer';
      const inp = document.createElement('input'); inp.type = 'checkbox'; inp.checked = !!c.value; inp.style.width = '18px'; inp.style.height = '18px';
      inp.addEventListener('change', () => onchange(c.key, inp.checked));
      wrap.appendChild(inp); wrap.appendChild(document.createTextNode(c.label));
      root.appendChild(wrap);
      if (els) els[c.key] = inp;
    } else if (c.type === 'range') {
      const lab = document.createElement('label'); lab.textContent = c.label;
      const out = document.createElement('span');
      out.style.cssText = 'float:right;color:#1d4ed8;font-weight:800;font-variant-numeric:tabular-nums';
      const inp = document.createElement('input');
      inp.type = 'range'; inp.min = c.min; inp.max = c.max; inp.step = c.step; inp.value = c.value;
      const upd = () => out.textContent = inp.value + (c.unit || '');
      inp.addEventListener('input', () => { upd(); onchange(c.key, parseFloat(inp.value)); });
      lab.appendChild(out); upd();
      root.appendChild(lab); root.appendChild(inp);
      if (els) els[c.key] = inp;
    } else if (c.type === 'select') {
      const lab = document.createElement('label'); lab.textContent = c.label;
      const sel = document.createElement('select');
      c.options.forEach(([v, t]) => { const o = document.createElement('option'); o.value = v; o.textContent = t; sel.appendChild(o); });
      sel.value = c.value;
      sel.addEventListener('change', () => onchange(c.key, sel.value));
      root.appendChild(lab); root.appendChild(sel);
      if (els) els[c.key] = sel;
    }
  });
  ctrl.appendChild(root);
  return els || {};
}
function line(x1, y1, x2, y2, stroke, w, dash) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
}
function txtEl(x, y, s, o = {}) {
  const { anchor = 'middle', size = 13, fill = '#0f172a', weight = 700 } = o;
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${fill}" font-weight="${weight}" font-family="inherit">${s}</text>`;
}
function box(x, y, w, h, fill, stroke, sw = 2, rx = 6) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}
/* 加加速度受限的 S 形速度规划器（INF-2，两应用同构，供 drive/control 共用）
 * plan(v, target, dt)：返回本帧应达到的速度，加速度受 jMax 限制，形成平滑 S 形曲线 */
function makePlanner(aMax, jMax) {
  let a = 0;                                   // 当前加速度
  return function plan(v, target, dt) {
    const dv = target - v;
    if (Math.abs(dv) < 1e-4 && Math.abs(a) < 1e-3) { a = 0; return target; }
    const aCmd = Math.sign(dv) * aMax;         // 期望加速度
    const da = Math.max(-jMax * dt, Math.min(jMax * dt, aCmd - a)); // 加加速度受限
    a += da;
    if (Math.abs(dv) < Math.abs(a) * dt) a = dv / dt;               // 防过冲
    let nv = v + a * dt;
    if ((dv > 0 && nv > target) || (dv < 0 && nv < target)) { nv = target; a = 0; }
    return nv;
  };
}

const SIMS = {};

/* =======================================================================
 * 1. 曳引系统仿真
 * ===================================================================== */
SIMS.traction = {
  title: '曳引系统 · 摩擦驱动、导向轮与绕绳方式仿真',
  desc: '调节载重、运行方向、绕绳方式与绳槽状态：曳引轮与导向轮旋转、钢丝绳按实际走向牵引轿厢与对重反向运动；上行下行均可连续运行并在抵达端站后停止抱闸；对比 1:1 与 2:1 绕绳在绳速、张力、转矩、安全系数与钢丝绳走向上的差异，并按 GB 7588 校核曳引条件。',
  notes: [
    '曳引力来自钢丝绳与曳引轮绳槽的摩擦。电动机、减速箱与制动器外壳固定不动，只有曳引轮随电机转子旋转；导向轮为惰轮，由钢丝绳带动旋转，作用是改变钢丝绳走向、保证进出曳引轮与对重（反绳轮）的绳段垂直。',
    '本仿真布置：钢丝绳自轿厢侧垂直段上行进入曳引轮，包绕 α=135° 后经导向轮偏转 45°，再沿垂直段下行至对重侧，两段主绳均为垂直段（与实际机房布置一致）。',
    'GB 7588 曳引条件：(T₁/T₂)·C₁·C₂ ≤ e^(f·α)，校核取“载有 125% 额定载荷的轿厢位于最低层站”这一最不利工况；C₁ 为动力系数（取 1.2），C₂ 为绳槽截面形状系数。',
    '1:1 绕法：绳速 = 轿厢速度，曳引轮两侧张力即轿厢侧、对重侧的全部静拉力，钢丝绳承受全部载荷。',
    '2:1 绕法：轿厢与对重各增设反绳轮，钢丝绳为“绳头板→轿厢反绳轮→曳引轮→导向轮→对重反绳轮→绳头板”的闭合绳路；绳速 = 2×轿厢速度，曳引轮两侧张力减半、转矩减半、安全系数翻倍，电机功率不变。',
    '2:1 时两段“绳头板↔反绳轮”的绳段始终垂直：轿厢在最底层时绳头下引段仍保持垂直，对重侧返回绳头的绳段同样保持垂直。',
    '绳槽磨损使当量摩擦系数 f 下降（带切口槽 f≈0.25 → 磨损半圆槽 f≈0.11），曳引能力不足即发生打滑，属严重隐患。'
  ],
  photos: [
    { f: 'real-el-traction-system.jpg', cap: '曳引系统全景·半剖视' },
    { f: 'real-el-machine-oiler.jpg', cap: '曳引机油杯·润滑' },
    { f: 'real-el-machine-rope-gripper.jpg', cap: '夹绳器·松闸盘车手轮' },
    { f: 'real-traction-machine-1.jpg', cap: '曳引机整机·制动臂可见' },
    { f: 'real-traction-sheave-1.jpg', cap: '曳引轮绳槽·切口截面' },
    { f: 'real-traction-rope-head-1.jpg', cap: '绳头组合·锥套弹簧' },
    { f: 'real-traction-deflector-1.jpg', cap: '导向轮·绳段包绕' },
    { f: 'real-traction-machine-room-1.jpg', cap: '机房全景·三设备布置' }
  ],
  controls: [
    { key: 'dir', type: 'select', label: '运行方向', value: 'up', options: [['up', '上行 ↑'], ['down', '下行 ↓'], ['stop', '停止 ‖']] },
    { key: 'load', type: 'range', label: '轿厢载重 Q（额定 1000 kg）', min: 0, max: 1600, step: 25, value: 500, unit: ' kg' },
    { key: 'ratio', type: 'select', label: '绕绳方式（悬挂比）', value: '1:1', options: [['1:1', '1:1 绕法（直接吊挂）'], ['2:1', '2:1 绕法（反绳轮）']] },
    { key: 'groove', type: 'select', label: '曳引轮绳槽状态', value: 'normal', options: [['normal', '带切口槽（正常，f≈0.25）'], ['worn', '严重磨损半圆槽（f≈0.11）']] }
  ],
  mount(ctx) {
    const P = 1200, QR = 1000, K = 0.5, W = P + K * QR;        // 轿厢自重 1200 kg，对重 1700 kg
    const A_S = 135 * Math.PI / 180;                            // 曳引轮包角 135°
    const A_D = 45 * Math.PI / 180;                             // 导向轮包角 45°
    const C1 = 1.2, C2 = 1.0;                                   // 动力系数 / 绳槽形状系数
    const FG = { normal: 0.25, worn: 0.11 };                    // 当量摩擦系数
    const G = 9.8, ETA = 0.75, D_S = 0.76, D_D = 0.40, N_ROPE = 4;
    const ROPE_BREAK = 74.1;                                     // φ13 钢丝绳最小破断拉力 kN
    const V_CAR = 1.0;                                           // 轿厢运行速度 m/s
    // 几何常量（px）：曳引轮 / 导向轮 / 轿厢侧绳 / 对重侧绳 / 绳头板
    const SX = 386, SY = 92, RS = 56;
    const DX = 474, DY = 137.6, RD = 26;
    const XCAR = 330, XCW = 500, XT1 = 300, XT2 = 530, RC = 15, YT = 40;
    // 切点：曳引轮入绳 θ=180°、出绳 θ=315°；导向轮入绳 θ=315°、出绳 θ=360°
    const PX1 = SX + RS * Math.cos(315 * Math.PI / 180), PY1 = SY + RS * Math.sin(315 * Math.PI / 180);
    const QX1 = DX + RD * Math.cos(315 * Math.PI / 180), QY1 = DY + RD * Math.sin(315 * Math.PI / 180);

    const svg = makeSvg(ctx.stage, '0 0 680 700', `
      ${box(238, 8, 344, 175, '#f8fafc', '#cbd5e1', 2, 8)}
      ${txtEl(252, 24, '机房', { anchor: 'start', size: 12, fill: '#94a3b8' })}
      ${box(316, 32, 132, 130, '#eef2ff', '#6366f1', 2, 8)}
      ${txtEl(382, 168, '曳引机（电动机 + 制动器）', { size: 11, fill: '#3730a3' })}
      ${txtEl(382, 180, '· 外壳固定不动，仅曳引轮旋转', { size: 11, fill: '#3730a3' })}
      ${txtEl(386, 148, '曳引轮', { size: 11, fill: '#1e3a8a' })}
      ${box(345, 141, 18, 13, '#fca5a5', '#b91c1c', 1.4, 3)}
      ${box(409, 141, 18, 13, '#fca5a5', '#b91c1c', 1.4, 3)}
      ${txtEl(504, 118, '导向轮', { anchor: 'start', size: 11, fill: '#334155' })}
      ${box(292, 26, 16, 14, '#e5e7eb', '#6b7280', 1.4, 3)}
      ${box(522, 26, 16, 14, '#e5e7eb', '#6b7280', 1.4, 3)}
      ${txtEl(300, 20, '绳头板', { size: 11, fill: '#6b7280' })}
      ${txtEl(530, 20, '绳头板', { size: 11, fill: '#6b7280' })}
      ${box(230, 183, 350, 447, '#f8fafc', '#cbd5e1', 2, 8)}
      ${txtEl(437, 204, '井　道', { size: 13, fill: '#94a3b8' })}
      ${[[340, '4F'], [426.7, '3F'], [513.3, '2F'], [600, '1F']].map(([y, f]) => line(230, y, 580, y, '#e2e8f0', 1.4, '7 6') +
        txtEl(592, y + 5, f, { anchor: 'start', size: 12, fill: '#94a3b8' })).join('')}
      ${box(238, 190, 12, 430, C.rail, C.railS, 1.4, 3)}
      ${box(410, 190, 12, 430, C.rail, C.railS, 1.4, 3)}
      ${box(452, 190, 12, 430, C.rail, C.railS, 1.4, 3)}
      ${box(536, 190, 12, 430, C.rail, C.railS, 1.4, 3)}
      ${txtEl(226, 344, '上端站', { anchor: 'end', size: 11, fill: '#b45309' })}
      ${txtEl(226, 604, '下端站', { anchor: 'end', size: 11, fill: '#b45309' })}
      ${box(230, 630, 350, 42, '#f1f5f9', '#94a3b8', 1.6, 4)}
      ${txtEl(405, 656, '底　坑', { size: 12, fill: '#64748b' })}
      <rect id="traction-inset" x="8" y="8" width="214" height="250" rx="8" fill="#fff" stroke="#e2e8f0"/>
      ${txtEl(115, 24, '绕绳方式对比', { size: 11.5, fill: '#334155' })}
    `, '曳引系统仿真：曳引机、钢丝绳与曳引比动态示意');

    // ===== 旋转件（只有轮子转）=====
    const sheave = E('g', { id: 'sheave' });
    sheave.innerHTML = `
      <circle cx="${SX}" cy="${SY}" r="${RS}" fill="#e0e7ff" stroke="#1d4ed8" stroke-width="3"/>
      <circle cx="${SX}" cy="${SY}" r="10" fill="#1d4ed8"/>
      <g>${Array.from({ length: 8 }, (_, i) => {
        const a = i * Math.PI / 4;
        return line(SX + 16 * Math.cos(a), SY + 16 * Math.sin(a), SX + 48 * Math.cos(a), SY + 48 * Math.sin(a), '#60a5fa', 2);
      }).join('')}</g>
      <line x1="${SX}" y1="${SY}" x2="${SX + 48}" y2="${SY}" stroke="#1d4ed8" stroke-width="4"/>
    `;
    svg.appendChild(sheave);
    const defl = E('g', { id: 'defl' });
    defl.innerHTML = `
      <circle cx="${DX}" cy="${DY}" r="${RD}" fill="#f1f5f9" stroke="#475569" stroke-width="2.6"/>
      <circle cx="${DX}" cy="${DY}" r="5" fill="#475569"/>
      <g>${Array.from({ length: 6 }, (_, i) => {
        const a = i * Math.PI / 3;
        return line(DX + 7 * Math.cos(a), DY + 7 * Math.sin(a), DX + 21 * Math.cos(a), DY + 21 * Math.sin(a), '#94a3b8', 1.8);
      }).join('')}</g>
      <line x1="${DX}" y1="${DY}" x2="${DX + 21}" y2="${DY}" stroke="#475569" stroke-width="3"/>
    `;
    svg.appendChild(defl);

    // ===== 钢丝绳：静态段（曳引轮包弧 + 斜段 + 导向轮包弧）+ 动态段（垂直段与反绳轮包弧）=====
    const ropeFix = E('g', {});
    ropeFix.innerHTML = `
      <path d="M ${XCAR} ${SY} A ${RS} ${RS} 0 0 1 ${PX1.toFixed(1)} ${PY1.toFixed(1)}" fill="none" stroke="${C.rope}" stroke-width="2.6"/>
      <path d="M ${PX1.toFixed(1)} ${PY1.toFixed(1)} L ${QX1.toFixed(1)} ${QY1.toFixed(1)}" fill="none" stroke="${C.rope}" stroke-width="2.6"/>
      <path d="M ${QX1.toFixed(1)} ${QY1.toFixed(1)} A ${RD} ${RD} 0 0 1 ${XCW} ${DY.toFixed(1)}" fill="none" stroke="${C.rope}" stroke-width="2.6"/>
    `;
    svg.appendChild(ropeFix);
    const rCar = E('line', { id: 'rope-car', stroke: C.rope, 'stroke-width': 2.6 });      // 轿厢侧垂直段
    const rCw = E('line', { id: 'rope-cw', stroke: C.rope, 'stroke-width': 2.6 });       // 对重侧垂直段
    const rT1 = E('line', { id: 'rope-t1', stroke: C.rope, 'stroke-width': 2.6 });       // 绳头板1 → 轿厢反绳轮
    const rT2 = E('line', { id: 'rope-t2', stroke: C.rope, 'stroke-width': 2.6 });       // 对重反绳轮 → 绳头板2
    const aCar = E('path', { id: 'arc-car', fill: 'none', stroke: C.rope, 'stroke-width': 2.6 });
    const aCw = E('path', { id: 'arc-cw', fill: 'none', stroke: C.rope, 'stroke-width': 2.6 });
    [rCar, rCw, rT1, rT2, aCar, aCw].forEach(x => svg.appendChild(x));

    // ===== 轿厢（含 2:1 反绳轮）=====
    const car = E('g', { id: 't-car' });
    car.innerHTML = `
      ${box(255, 0, 150, 140, C.car, C.carS, 2.4, 4)}
      ${txtEl(330, 62, '轿厢', { size: 15, fill: '#1e3a8a' })}
      ${txtEl(330, 86, 'P + Q', { size: 12, fill: '#1d4ed8', weight: 500 })}
      ${box(243, 14, 12, 26, '#fcd34d', '#b45309', 1.5, 3)}
      ${box(405, 14, 12, 26, '#fcd34d', '#b45309', 1.5, 3)}
      ${box(243, 100, 12, 26, '#fcd34d', '#b45309', 1.5, 3)}
      ${box(405, 100, 12, 26, '#fcd34d', '#b45309', 1.5, 3)}
      <g class="car-divert"><circle cx="315" cy="-18" r="${RC}" fill="#fff" stroke="#b45309" stroke-width="2.4"/>
      <circle cx="315" cy="-18" r="4" fill="#b45309"/>
      ${txtEl(334, -14, '反绳轮', { anchor: 'start', size: 11, fill: '#b45309' })}</g>
    `;
    // ===== 对重（含 2:1 反绳轮）=====
    const cw = E('g', { id: 't-cw' });
    cw.innerHTML = `
      ${box(470, 0, 60, 140, C.cw, C.cwS, 2.2, 4)}
      <g stroke="#d97706" stroke-width="6">${[20, 50, 80, 110].map(y => line(475, y, 525, y, '#d97706', 6)).join('')}</g>
      ${txtEl(500, 158, '对重 W', { size: 11.5, fill: '#b45309' })}
      ${txtEl(500, 175, 'W = P + K·Q', { size: 11, fill: '#b45309', weight: 500 })}
      <g class="cw-divert"><circle cx="515" cy="-18" r="${RC}" fill="#fff" stroke="#b45309" stroke-width="2.4"/>
      <circle cx="515" cy="-18" r="4" fill="#b45309"/></g>
    `;
    svg.appendChild(car); svg.appendChild(cw);

    const warn = E('g', {});
    warn.innerHTML = `${txtEl(340, 690, '', { size: 13.5, fill: '#b91c1c' })}`;
    const warnT = warn.firstChild;
    svg.appendChild(warn);

    /* ===== 绕绳方式对比插图 =====
     * 几何基准（px）：曳引轮 (110,124) r=30；导向轮 (168,138) r=13；反绳轮 r=13、中心 y=170
     * 2:1 闭合绳路：绳头板A(54,90) ↓ 轿厢反绳轮(67,170) → 曳引轮(80,124 左切点) → 导向轮(177.2,128.8 入)
     *                → (181,138) ↓ 对重反绳轮(194,170) → 绳头板B(207,90)
     * 反绳轮均位于轿厢/对重上方（经支架连接），不再压在方块顶边；绳头段不再穿过方块内部。
     */
    const insetG = E('g', {});
    insetG.innerHTML = `
      <text id="ins-t1" x="115" y="44" text-anchor="middle" font-size="11.5" fill="#334155" font-weight="800">1:1 直接吊挂</text>
      <text id="ins-t2" x="115" y="250" text-anchor="middle" font-size="11" fill="#b45309" font-weight="700">绳速 = 1 × 轿厢速度</text>
      <g id="ins-11">
        <circle cx="110" cy="124" r="30" fill="#fff" stroke="#1d4ed8" stroke-width="2.2"/>
        <circle cx="110" cy="124" r="5" fill="#1d4ed8"/>
        ${line(80, 124, 80, 198, '#475569', 2)}
        ${line(140, 124, 140, 198, '#475569', 2)}
        <rect x="52" y="198" width="56" height="32" rx="3" fill="${C.car}" stroke="${C.carS}" stroke-width="2"/>
        <rect x="120" y="198" width="40" height="32" rx="3" fill="${C.cw}" stroke="${C.cwS}" stroke-width="2"/>
        ${txtEl(80, 219, '轿厢', { size: 11, fill: '#1e3a8a' })}
        ${txtEl(140, 219, '对重', { size: 11, fill: '#b45309' })}
        ${txtEl(110, 86, '曳引轮', { size: 10.5, fill: '#1e3a8a' })}
      </g>
      <g id="ins-21" opacity="0">
        <!-- 绳头板（机房侧固定端，左/右各一） -->
        <rect x="40" y="82" width="28" height="8" rx="2" fill="#e5e7eb" stroke="#6b7280" stroke-width="1.4"/>
        <rect x="193" y="82" width="28" height="8" rx="2" fill="#e5e7eb" stroke="#6b7280" stroke-width="1.4"/>
        ${txtEl(54, 78, '绳头板', { size: 9.5, fill: '#6b7280' })}
        ${txtEl(207, 78, '绳头板', { size: 9.5, fill: '#6b7280' })}
        <!-- 闭合绳路：绳头板A → 轿厢反绳轮 → 曳引轮 → 导向轮 → 对重反绳轮 → 绳头板B -->
        <path d="M 54 90 L 54 170" fill="none" stroke="#475569" stroke-width="2"/>
        <path d="M 54 170 A 13 13 0 0 0 80 170" fill="none" stroke="#475569" stroke-width="2"/>
        <path d="M 80 170 L 80 124" fill="none" stroke="#475569" stroke-width="2"/>
        <path d="M 80 124 A 30 30 0 0 1 131.2 102.8" fill="none" stroke="#475569" stroke-width="2"/>
        <path d="M 131.2 102.8 L 177.2 128.8" fill="none" stroke="#475569" stroke-width="2"/>
        <path d="M 177.2 128.8 A 13 13 0 0 1 181 138" fill="none" stroke="#475569" stroke-width="2"/>
        <path d="M 181 138 L 181 170" fill="none" stroke="#475569" stroke-width="2"/>
        <path d="M 181 170 A 13 13 0 0 0 207 170" fill="none" stroke="#475569" stroke-width="2"/>
        <path d="M 207 170 L 207 90" fill="none" stroke="#475569" stroke-width="2"/>
        <!-- 曳引轮 / 导向轮 -->
        <circle cx="110" cy="124" r="30" fill="#fff" stroke="#1d4ed8" stroke-width="2.2"/>
        <circle cx="110" cy="124" r="5" fill="#1d4ed8"/>
        <circle cx="168" cy="138" r="13" fill="#fff" stroke="#475569" stroke-width="2"/>
        <circle cx="168" cy="138" r="3.5" fill="#475569"/>
        <!-- 反绳轮：位于轿厢 / 对重上方，经支架与本体连接 -->
        <circle cx="67" cy="170" r="13" fill="#fff" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="67" cy="170" r="3.5" fill="#b45309"/>
        <circle cx="194" cy="170" r="13" fill="#fff" stroke="#b45309" stroke-width="2.2"/>
        <circle cx="194" cy="170" r="3.5" fill="#b45309"/>
        ${line(67, 183, 67, 198, '#b45309', 2)}
        ${line(194, 183, 194, 198, '#b45309', 2)}
        <!-- 轿厢 / 对重（两者之间留出间距，互不重叠） -->
        <rect x="39" y="198" width="56" height="32" rx="3" fill="${C.car}" stroke="${C.carS}" stroke-width="2"/>
        <rect x="174" y="198" width="40" height="32" rx="3" fill="${C.cw}" stroke="${C.cwS}" stroke-width="2"/>
        ${txtEl(67, 219, '轿厢', { size: 11, fill: '#1e3a8a' })}
        ${txtEl(194, 219, '对重', { size: 11, fill: '#b45309' })}
        <!-- 标注 -->
        ${txtEl(110, 86, '曳引轮', { size: 10.5, fill: '#1e3a8a' })}
        ${txtEl(150, 98, '导向轮', { anchor: 'start', size: 10.5, fill: '#334155' })}
        ${line(166, 101, 173, 123, '#94a3b8', 1, '3 2')}
        ${txtEl(50, 173, '反绳轮', { anchor: 'end', size: 9.5, fill: '#b45309' })}
        ${txtEl(177, 173, '反绳轮', { anchor: 'end', size: 9.5, fill: '#b45309' })}
      </g>
    `;
    svg.appendChild(insetG);

    /* ===== 实物对照小图（v1.3.0 L4）=====
     * 落点：画布左列空闲区（插图下方 x 14-190），不遮挡机房/井道/端站标注 */
    const galG = E('g', {});
    const IMGS = [
      { f: 'real-traction-machine-1.jpg', n: '曳引机', s: '电动机+减速箱+制动器' },
      { f: 'real-traction-sheave-1.jpg', n: '曳引轮绳槽', s: 'V 型切口槽特写' }
    ];
    galG.innerHTML = txtEl(102, 270, '实物对照', { size: 11, fill: '#334155', weight: 800 }) +
      IMGS.map((g, i) => {
        const cx = 14, cy = 278 + i * 154;
        return box(cx, cy, 176, 140, '#f8fafc', '#e2e8f0', 1.4, 6) +
          `<image href="${assetImage(g.f)}" x="${cx + 4}" y="${cy + 4}" width="168" height="92" preserveAspectRatio="xMidYMid meet"/>` +
          txtEl(cx + 88, cy + 116, g.n, { size: 10, fill: '#334155', weight: 700 }) +
          txtEl(cx + 88, cy + 130, g.s, { size: 8.5, fill: '#64748b', weight: 500 });
      }).join('');
    svg.appendChild(galG);

    let t = 0.35, ang = 0, angD = 0, atEnd = '';
    ctx.state.load = 500; ctx.state.dir = 'up'; ctx.state.ratio = '1:1'; ctx.state.groove = 'normal';

    function refresh() {
      const Q = ctx.state.load;
      const n = ctx.state.ratio === '2:1' ? 2 : 1;
      const f = FG[ctx.state.groove] || 0.25;
      const LIMIT = Math.exp(f * A_S);
      const mCar = P + Q, mCw = W;
      const Tcar = mCar * G / n / 1000, Tcw = mCw * G / n / 1000;
      const T1 = Math.max(Tcar, Tcw), T2 = Math.min(Tcar, Tcw);
      const ratio = T1 / Math.max(1e-6, T2);
      const chk = ratio * C1 * C2;
      const slip = chk > LIMIT;
      const dm = mCar - mCw;
      const vRope = V_CAR * n;
      const F = Math.abs(dm) * G / n;
      const kW = (F * vRope / ETA) / 1000;
      const torque = F * (D_S / 2);                    // F 已为曳引轮两侧张力差（含 1/n）
      const rpm = 60 * vRope / (Math.PI * D_S);
      const perRope = mCar * G / (n * N_ROPE) / 1000;
      const safety = ROPE_BREAK / perRope;
      const dirTxt = ctx.state.dir === 'up' ? '上行 ↑' : ctx.state.dir === 'down' ? '下行 ↓' : (atEnd ? atEnd : '停止（制动器抱闸）');
      ctx.readout([
        ['绕绳方式', ctx.state.ratio === '2:1' ? '<b>2:1</b>（反绳轮）' : '<b>1:1</b>（直接吊挂）'],
        ['悬挂段数 / 绳速', `${n} 段 · 绳速 <b>${vRope.toFixed(2)} m/s</b>（轿厢 ${V_CAR.toFixed(2)} m/s）`],
        ['轿厢侧质量 P+Q', `${mCar} kg`],
        ['对重质量 W', `${mCw} kg`],
        ['不平衡质量 Δm', `${dm > 0 ? '+' : ''}${dm} kg`],
        ['曳引轮张力 T₁ / T₂', `${T1.toFixed(2)} / ${T2.toFixed(2)} kN`],
        ['单根钢丝绳张力（4 根）', `${perRope.toFixed(2)} kN`],
        ['钢丝绳安全系数 K', `<b style="color:${safety >= 12 ? '#059669' : '#dc2626'}">${safety.toFixed(1)}</b>（GB 7588 要求 ≥12）`],
        ['曳引校核 (T₁/T₂)·C₁·C₂', `<b style="color:${slip ? '#dc2626' : '#059669'}">${chk.toFixed(3)}</b> / e^(fα) = ${LIMIT.toFixed(3)}`],
        ['当量摩擦系数 f', `${f.toFixed(2)}（${ctx.state.groove === 'normal' ? '带切口槽' : '磨损半圆槽'}）`],
        ['包角 α（曳引轮/导向轮）', `135° / 45°`],
        ['曳引结论', slip ? '<b style="color:#dc2626">打滑！曳引能力不足</b>' : '<b style="color:#059669">满足曳引条件</b>'],
        ['曳引轮圆周力', `${(F / 1000).toFixed(2)} kN`],
        ['电机转矩 / 转速（估）', `${torque.toFixed(0)} N·m / ${rpm.toFixed(1)} r/min`],
        ['电机功率（估）', `${kW.toFixed(2)} kW`],
        ['载荷率', `<b style="color:${Q > QR * 1.1 ? '#dc2626' : '#059669'}">${(Q / QR * 100).toFixed(0)}%${Q > QR * 1.1 ? '（超载 >110%）' : ''}</b>`],
        ['运行状态', dirTxt]
      ]);
      if (ctx.els && ctx.els.dir) ctx.els.dir.value = ctx.state.dir;
      warnT.textContent = slip ? '⚠ (T₁/T₂)·C₁·C₂ > e^(f·α)，钢丝绳在绳槽中打滑，曳引失效！' : '';
      return { vRope, slip, n };
    }

    const stop = ticker(dt => {
      const { vRope, slip, n } = refresh();
      const is21 = n === 2;
      car.querySelector('.car-divert').setAttribute('opacity', is21 ? '1' : '0');
      cw.querySelector('.cw-divert').setAttribute('opacity', is21 ? '1' : '0');
      insetG.querySelector('#ins-11').setAttribute('opacity', is21 ? '0' : '1');
      insetG.querySelector('#ins-21').setAttribute('opacity', is21 ? '1' : '0');
      insetG.querySelector('#ins-t1').textContent = is21 ? '2:1 反绳轮绕法' : '1:1 直接吊挂';
      insetG.querySelector('#ins-t2').textContent = is21 ? '绳速 = 2 × 轿厢速度' : '绳速 = 1 × 轿厢速度';
      [rT1, rT2, aCar, aCw].forEach(x => x.setAttribute('opacity', is21 ? '1' : '0'));

      const moving = ctx.state.dir !== 'stop' && !slip;
      if (moving) {
        atEnd = '';
        const dirSign = ctx.state.dir === 'up' ? -1 : 1;         // 上行 → 轿厢上移
        t += dirSign * (V_CAR / 260 * 55) * dt;
        if (t >= 1) { t = 1; ctx.state.dir = 'stop'; atEnd = '已抵下端站 · 停止（制动器抱闸）'; ctx.logLine('到达下端站：曳引机停止运转，制动器抱闸，轿厢停靠'); }
        else if (t <= 0) { t = 0; ctx.state.dir = 'stop'; atEnd = '已抵上端站 · 停止（制动器抱闸）'; ctx.logLine('到达上端站：曳引机停止运转，制动器抱闸，轿厢停靠'); }
        // 上行（dirSign=-1）→ 曳引轮 θ 增大（顺时针），轿厢侧绳上行、对重侧绳下行
        const wS = vRope / (D_S / 2) * (180 / Math.PI);          // 曳引轮角速度 °/s
        ang += -dirSign * wS * dt;
        angD += -dirSign * wS * (RS / RD) * dt;                  // 导向轮：线速度相同、半径小 → 转速更高
      }
      const carTop = 200 + 260 * t, cwTop = 460 - 260 * t;
      car.setAttribute('transform', `translate(0,${carTop.toFixed(1)})`);
      cw.setAttribute('transform', `translate(0,${cwTop.toFixed(1)})`);
      const cy1 = carTop - 18, cy2 = cwTop - 18;
      // 轿厢侧垂直段：1:1 直连轿厢顶部，2:1 连至反绳轮
      rCar.setAttribute('x1', XCAR); rCar.setAttribute('y1', SY);
      rCar.setAttribute('x2', XCAR); rCar.setAttribute('y2', (is21 ? cy1 : carTop).toFixed(1));
      // 对重侧垂直段：由导向轮出绳点垂直下行
      rCw.setAttribute('x1', XCW); rCw.setAttribute('y1', DY);
      rCw.setAttribute('x2', XCW); rCw.setAttribute('y2', (is21 ? cy2 : cwTop).toFixed(1));
      // 2:1 绳头板 ↔ 反绳轮（始终垂直）
      rT1.setAttribute('x1', XT1); rT1.setAttribute('y1', YT); rT1.setAttribute('x2', XT1); rT1.setAttribute('y2', cy1.toFixed(1));
      rT2.setAttribute('x1', XT2); rT2.setAttribute('y1', YT); rT2.setAttribute('x2', XT2); rT2.setAttribute('y2', cy2.toFixed(1));
      aCar.setAttribute('d', `M ${XT1} ${cy1.toFixed(1)} A ${RC} ${RC} 0 0 0 ${XCAR} ${cy1.toFixed(1)}`);
      aCw.setAttribute('d', `M ${XCW} ${cy2.toFixed(1)} A ${RC} ${RC} 0 0 0 ${XT2} ${cy2.toFixed(1)}`);
      sheave.setAttribute('transform', `rotate(${ang.toFixed(2)} ${SX} ${SY})`);
      defl.setAttribute('transform', `rotate(${angD.toFixed(2)} ${DX} ${DY})`);
    });
    return {
      destroy: stop,
      onchange(k, v) {
        ctx.state[k] = v;
        if (k === 'dir' && v !== 'stop') atEnd = '';
        if (k === 'ratio') ctx.logLine(v === '2:1' ? '切换 2:1 绕法：增设轿厢/对重反绳轮，绳速 = 2×轿厢速度，曳引轮张力减半、转矩减半' : '切换 1:1 绕法：绳速 = 轿厢速度，钢丝绳承受全部载荷');
        if (k === 'groove') ctx.logLine(v === 'worn' ? '绳槽严重磨损：当量摩擦系数降至 0.11，曳引能力显著下降' : '绳槽状态正常：带切口槽，当量摩擦系数 0.25');
      },
      onaction() { }
    };
  }
};

/* =======================================================================
 * 2. 导向系统仿真
 * ===================================================================== */
SIMS.guide = {
  title: '导向系统 · 偏载、导靴受力与导轨固定仿真',
  desc: '观察井道壁、导轨支架、导轨压板、导轨、导靴与轿厢之间的连接固定关系，以及偏载下轿厢的微小倾覆趋势与导靴反力变化。',
  notes: ['导轨只约束水平位移与扭转，垂直载荷由钢丝绳承担。', '偏载产生倾覆力矩 M = P·e，由上下两对导靴（共 4 个）以 F = M/L 的反力平衡。', '偏载力为 0 时轿厢无倾覆趋势，4 个导靴均与导轨正常接触，轿厢位于两列导轨的正中位置。', '滚动导靴摩擦小、噪音低，适用于高速梯。', '导轨通过导轨支架和压板固定在井道壁上：支架间距一般不大于 2.5 m，每根导轨至少 2 个支架（GB 50310《电梯工程施工质量验收规范》、GB/T 22562《电梯 T 型导轨》、TSG T7001）。'],
  photos: [
    { f: 'real-el-guide-system.jpg', cap: '导向系统全景·半剖视' },
    { f: 'real-el-guide-t-rail.jpg', cap: 'T 形实心导轨·冷拉成型' },
    { f: 'real-el-guide-bracket.jpg', cap: '导轨支架·壁装固定' },
    { f: 'real-el-guide-clip.jpg', cap: '导轨压板·螺栓固定' },
    { f: 'real-el-guide-shoe.jpg', cap: '滑动导靴·靴座靴衬' },
    { f: 'real-guide-rail-1.jpg', cap: 'T 形导轨·断面可见' },
    { f: 'real-guide-bracket-1.jpg', cap: '导轨支架与压板·螺栓固定' },
    { f: 'real-guide-shoe-1.jpg', cap: '滑动导靴·靴衬贴合' },
    { f: 'real-guide-joint-1.jpg', cap: '导轨接导板·对接螺栓' }
  ],
  controls: [
    { key: 'ecc', type: 'range', label: '偏载力 P', min: 0, max: 3000, step: 100, value: 600, unit: ' N' },
    { key: 'moving', type: 'checkbox', label: '轿厢运行（沿导轨上下）', value: true }
  ],
  mount(ctx) {
    const svg = makeSvg(ctx.stage, '0 0 760 640', `
      ${box(140, 30, 10, 570, '#e2e8f0', '#94a3b8', 1.6, 2)}
      ${box(610, 30, 10, 570, '#e2e8f0', '#94a3b8', 1.6, 2)}
      ${txtEl(145, 20, '井道壁', { size: 12, fill: '#64748b' })}
      ${txtEl(615, 20, '井道壁', { size: 12, fill: '#64748b' })}
      ${box(260, 40, 12, 540, C.rail, C.railS, 1.6, 3)}
      ${box(488, 40, 12, 540, C.rail, C.railS, 1.6, 3)}
      ${txtEl(266, 26, '导轨（固定不动）', { size: 12, fill: '#64748b' })}
      <!-- 上导轨支架（左）：槽钢横臂 + 斜撑 + 膨胀螺栓固定于井道壁，经导轨压板压紧导轨 -->
      ${box(150, 86, 100, 14, '#cbd5e1', '#64748b', 1.4, 2)}
      ${box(150, 82, 100, 5, '#e2e8f0', '#94a3b8', 1.2, 1)}
      ${box(150, 99, 100, 5, '#e2e8f0', '#94a3b8', 1.2, 1)}
      ${line(154, 93, 196, 84, '#94a3b8', 1.6)}
      ${line(154, 93, 196, 102, '#94a3b8', 1.6)}
      ${circle3(156, 84.5, 4.2)}${circle3(156, 101.5, 4.2)}
      ${box(242, 84, 14, 20, '#fcd34d', '#b45309', 1.6, 2)}
      ${line(256, 94, 260, 94, '#b45309', 1.6)}
      <!-- 上导轨支架（右）：与左镜像 -->
      ${box(510, 86, 100, 14, '#cbd5e1', '#64748b', 1.4, 2)}
      ${box(510, 82, 100, 5, '#e2e8f0', '#94a3b8', 1.2, 1)}
      ${box(510, 99, 100, 5, '#e2e8f0', '#94a3b8', 1.2, 1)}
      ${line(606, 93, 564, 84, '#94a3b8', 1.6)}
      ${line(606, 93, 564, 102, '#94a3b8', 1.6)}
      ${circle3(604, 84.5, 4.2)}${circle3(604, 101.5, 4.2)}
      ${box(504, 84, 14, 20, '#fcd34d', '#b45309', 1.6, 2)}
      ${line(500, 94, 504, 94, '#b45309', 1.6)}
      <!-- 下导轨支架（左 / 右）：与上支架同构 -->
      ${box(150, 540, 100, 14, '#cbd5e1', '#64748b', 1.4, 2)}
      ${box(150, 536, 100, 5, '#e2e8f0', '#94a3b8', 1.2, 1)}
      ${box(150, 553, 100, 5, '#e2e8f0', '#94a3b8', 1.2, 1)}
      ${line(154, 547, 196, 538, '#94a3b8', 1.6)}
      ${line(154, 547, 196, 556, '#94a3b8', 1.6)}
      ${circle3(156, 538.5, 4.2)}${circle3(156, 555.5, 4.2)}
      ${box(242, 538, 14, 20, '#fcd34d', '#b45309', 1.6, 2)}
      ${line(256, 548, 260, 548, '#b45309', 1.6)}
      ${box(510, 540, 100, 14, '#cbd5e1', '#64748b', 1.4, 2)}
      ${box(510, 536, 100, 5, '#e2e8f0', '#94a3b8', 1.2, 1)}
      ${box(510, 553, 100, 5, '#e2e8f0', '#94a3b8', 1.2, 1)}
      ${line(606, 547, 564, 538, '#94a3b8', 1.6)}
      ${line(606, 547, 564, 556, '#94a3b8', 1.6)}
      ${circle3(604, 538.5, 4.2)}${circle3(604, 555.5, 4.2)}
      ${box(504, 538, 14, 20, '#fcd34d', '#b45309', 1.6, 2)}
      ${line(500, 548, 504, 548, '#b45309', 1.6)}
      <!-- 支架标注 -->
      ${txtEl(200, 72, '导轨支架', { size: 11.5, fill: '#475569' })}
      ${txtEl(205, 118, '导轨压板', { size: 11, fill: '#b45309' })}
      ${txtEl(120, 60, '膨胀螺栓', { anchor: 'end', size: 10.5, fill: '#94a3b8' })}
      ${line(120, 63, 152, 84, '#94a3b8', 1, '3 2')}
      <!-- 支架间距标注（国标 ≤2.5 m） -->
      ${line(645, 88, 645, 542, '#b45309', 1.6)}
      <polygon points="645,88 639,100 651,100" fill="#b45309"/>
      <polygon points="645,542 639,530 651,530" fill="#b45309"/>
      ${line(645, 315, 614, 315, '#b45309', 1, '3 2')}
      ${txtEl(690, 306, '导轨支架间距', { size: 12, fill: '#b45309', weight: 700 })}
      ${txtEl(690, 326, '≤ 2.5 m（国标）', { size: 12, fill: '#b45309', weight: 700 })}
      ${txtEl(690, 350, '每根导轨 ≥2 个支架', { size: 11.5, fill: '#334155' })}
      ${txtEl(690, 370, 'GB 50310 / TSG T7001', { size: 10.5, fill: '#94a3b8' })}
      <!-- 连接固定链 -->
      ${txtEl(380, 616, '固定链：井道壁 ←膨胀螺栓→ 导轨支架 ←导轨压板→ 导轨 ←导靴→ 轿厢', { size: 12, fill: '#334155' })}
      ${txtEl(380, 598, 'L = 上下导靴间距（决定导靴反力大小）', { size: 12, fill: '#0e7490' })}
    `, '导向系统仿真：导轨、支架、导靴与轿厢导向');
    const majority = E('g', {});
    majority.innerHTML = `
      ${box(0, 0, 220, 260, C.car, C.carS, 2.4, 5)}
      ${txtEl(110, 118, '轿厢', { size: 16, fill: '#1e3a8a' })}
      ${txtEl(110, 144, 'Car', { size: 11, fill: '#3b82f6', weight: 500 })}
      ${txtEl(110, 232, '载荷作用点', { size: 11, fill: '#94a3b8' })}
    `;
    // 导靴
    const shoes = E('g', {});
    const shoeTL = E('rect', { x: -16, y: -12, width: 18, height: 34, rx: 4, fill: '#fcd34d', stroke: '#b45309', 'stroke-width': 1.8 });
    const shoeBL = E('rect', { x: -16, y: 238, width: 18, height: 34, rx: 4, fill: '#fcd34d', stroke: '#b45309', 'stroke-width': 1.8 });
    const shoeTR = E('rect', { x: 218, y: -12, width: 18, height: 34, rx: 4, fill: '#fcd34d', stroke: '#b45309', 'stroke-width': 1.8 });
    const shoeBR = E('rect', { x: 218, y: 238, width: 18, height: 34, rx: 4, fill: '#fcd34d', stroke: '#b45309', 'stroke-width': 1.8 });
    [shoeTL, shoeBL, shoeTR, shoeBR].forEach(s => shoes.appendChild(s));
    // 反力箭头
    const forces = E('g', {});
    const carG = E('g', {});
    carG.appendChild(majority); carG.appendChild(shoes); carG.appendChild(forces);
    svg.appendChild(carG);

    // 偏载箭头（缩短至轿厢投影范围内，避免穿越导轨与支架）
    const loadArrow = E('g', {});
    loadArrow.innerHTML = `<line x1="110" y1="130" x2="200" y2="130" stroke="#dc2626" stroke-width="4"/>
      <polygon points="200,130 186,123 186,137" fill="#dc2626"/>
      ${txtEl(155, 112, '偏载 P', { size: 12.5, fill: '#b91c1c' })}`;
    carG.appendChild(loadArrow);

    let y = 200, dirn = -1;
    const L = 164; // 上下导靴间距（px）
    const Lm = 2.4; // 换算为 m

    ctx.state.ecc = 600; ctx.state.moving = true;
    function refresh() {
      const P = ctx.state.ecc;
      const M = P * 0.35;            // 偏心距取 0.35 m
      const F = M / Lm;              // 单侧导靴反力
      const tilt = P / 3000 * 2.6;   // 视觉倾角（度）
      ctx.readout([
        ['偏载力 P', `${P} N`],
        ['偏心距 e（假定）', `0.35 m`],
        ['倾覆力矩 M = P·e', `${M.toFixed(0)} N·m`],
        ['导靴间距 L', `${Lm} m`],
        ['单侧导靴反力 F = M/L', `<b style="color:${F > 1200 ? '#dc2626' : '#059669'}">${F.toFixed(0)} N</b>`],
        ['轿厢倾角（示意）', `${tilt.toFixed(2)} °`],
        ['评价', F > 1200 ? '<b style="color:#dc2626">导靴受力偏大，需校核</b>' : '<b style="color:#059669">导靴受力正常</b>']
      ]);
      return { F, tilt, P };
    }
    const stop = ticker(dt => {
      const { F, tilt, P } = refresh();
      if (ctx.state.moving) {
        y += dirn * 70 * dt;
        if (y < 60) { y = 60; dirn = 1; }
        if (y > 330) { y = 330; dirn = -1; }
      }
      carG.setAttribute('transform', `translate(270,${y}) rotate(${tilt.toFixed(2)} 110 130)`);
      loadArrow.setAttribute('opacity', P > 0 ? '1' : '0.2');
      const fw = Math.min(90, F / 10);
      forces.innerHTML = `
        <line x1="236" y1="5" x2="${236 - fw}" y2="5" stroke="#059669" stroke-width="4"/>
        <polygon points="${236 - fw},5 ${236 - fw + 14},${-2} ${236 - fw + 14},12" fill="#059669"/>
        <line x1="-16" y1="255" x2="${-16 + fw}" y2="255" stroke="#059669" stroke-width="4"/>
        <polygon points="${-16 + fw},255 ${-16 + fw - 14},248 ${-16 + fw - 14},262" fill="#059669"/>
        ${txtEl(256, -6, 'F 反力', { anchor: 'start', size: 11.5, fill: '#059669' })}
        ${txtEl(-26, 246, 'F 反力', { anchor: 'end', size: 11.5, fill: '#059669' })}
      `;
    });
    return { destroy: stop, onchange(k, v) { ctx.state[k] = v; } };
  }
};

/* =======================================================================
 * 3. 轿厢系统仿真（传力路径）
 * ===================================================================== */
SIMS.car = {
  title: '轿厢系统 · 结构承载与超载保护仿真',
  desc: '调节载重，观察载荷经轿底 → 称重装置 → 下梁 → 立柱 → 上梁 → 绳头 → 钢丝绳的传递路径，以及称重装置判定超载后禁止电梯启动的保护逻辑。',
  notes: [
    '轿厢 = 轿厢体（轿底/轿壁/轿顶）+ 轿厢架（上梁/立柱/下梁）。轿厢架是承力骨架，载荷最终全部由曳引钢丝绳吊挂。',
    '立柱主要承受轴向拉压；下梁承受弯曲；上梁承受绳头组合传递的集中吊挂载荷。',
    '称重装置（轿底/绳头式）检测实际载重，载荷率达 110% 额定载重时输出超载信号：电梯保持开门、不能启动，并发出声光报警（GB 7588 / TSG T7001）。',
    '轿厢每侧设上、下两个导靴（共 4 个），沿导轨约束轿厢水平位移与扭转；安全钳安装在轿厢架下梁两端、位于下导靴的上方，动作时楔块楔入夹紧导轨。'
  ],
  photos: [
    { f: 'real-el-car-system.jpg', cap: '轿厢系统全景·半剖视' },
    { f: 'real-car-frame-1.jpg', cap: '轿厢架·上梁立柱可见' },
    { f: 'real-car-floor-load-1.jpg', cap: '轿底称重装置·传感器位' },
    { f: 'real-car-interior-1.jpg', cap: '轿厢内部·操纵箱可见' },
    { f: 'real-car-top-sheave-1.jpg', cap: '轿顶反绳轮·绳头板' }
  ],
  controls: [
    { key: 'load', type: 'range', label: '轿厢载重 Q（额定 1000 kg）', min: 0, max: 1300, step: 25, value: 600, unit: ' kg' },
    { key: 'showPath', type: 'checkbox', label: '显示载荷传力路径动画', value: true }
  ],
  mount(ctx) {
    const P = 1200, QR = 1000, G = 9.8, AREA = 2.4, L = 1.6, N_ROPE = 4;
    const svg = makeSvg(ctx.stage, '0 0 720 620', `
      ${box(92, 60, 14, 340, C.rail, C.railS, 1.6, 3)}
      ${box(534, 60, 14, 340, C.rail, C.railS, 1.6, 3)}
      ${txtEl(99, 50, '导轨', { size: 11.5, fill: '#64748b' })}
      ${txtEl(541, 50, '导轨', { size: 11.5, fill: '#64748b' })}
      ${box(110, 60, 420, 18, '#c7d2fe', '#4f46e5', 2, 5)}
      ${txtEl(556, 74, '轿厢架上梁', { anchor: 'start', size: 12.5, fill: '#3730a3' })}
      ${box(118, 78, 16, 342, '#a5b4fc', '#4f46e5', 2, 4)}
      ${box(506, 78, 16, 342, '#a5b4fc', '#4f46e5', 2, 4)}
      ${txtEl(112, 220, '立柱', { anchor: 'end', size: 12.5, fill: '#3730a3' })}
      ${box(110, 368, 420, 18, '#c7d2fe', '#4f46e5', 2, 5)}
      ${txtEl(556, 382, '轿厢架下梁', { anchor: 'start', size: 12.5, fill: '#3730a3' })}
      ${box(110, 344, 44, 22, '#fee2e2', '#dc2626', 1.6, 4)}
      ${box(486, 344, 44, 22, '#fee2e2', '#dc2626', 1.6, 4)}
      ${txtEl(132, 359, '安全钳', { size: 11, fill: '#b91c1c' })}
      ${txtEl(508, 359, '安全钳', { size: 11, fill: '#b91c1c' })}
      ${box(104, 96, 14, 28, '#fcd34d', '#b45309', 1.6, 4)}
      ${box(104, 392, 14, 28, '#fcd34d', '#b45309', 1.6, 4)}
      ${box(522, 96, 14, 28, '#fcd34d', '#b45309', 1.6, 4)}
      ${box(522, 392, 14, 28, '#fcd34d', '#b45309', 1.6, 4)}
      ${txtEl(60, 90, '上导靴', { anchor: 'end', size: 11, fill: '#b45309' })}
      ${txtEl(60, 410, '下导靴', { anchor: 'end', size: 11, fill: '#b45309' })}
      ${txtEl(548, 90, '上导靴', { anchor: 'start', size: 11, fill: '#b45309' })}
      ${txtEl(548, 410, '下导靴', { anchor: 'start', size: 11, fill: '#b45309' })}
      ${line(330, 18, 330, 60, '#475569', 2.6)}
      ${box(312, 44, 36, 16, '#fde68a', '#b45309', 1.6, 4)}
      ${txtEl(330, 12, '绳头组合', { size: 12, fill: '#b45309' })}
      ${txtEl(150, 424, '底坑侧', { size: 11, fill: '#94a3b8' })}
      <defs>
        <style>
          .flow { stroke-dasharray: 12 8; animation: dashmove 1s linear infinite; }
          @keyframes dashmove { to { stroke-dashoffset: -20; } }
        </style>
      </defs>
    `, '轿厢系统仿真：轿厢架、轿底称重与轿内布置');
    // 轿厢体（随载重产生微小下沉，体现称重弹性形变）
    const body = E('g', {});
    body.innerHTML = `
      ${box(150, 100, 340, 226, '#f5f3ff', '#c4b5fd', 1.6, 6)}
      ${txtEl(320, 200, '轿　厢　体', { size: 15, fill: '#5b21b6' })}
      ${txtEl(320, 226, '轿壁 · 轿顶', { size: 11.5, fill: '#7c3aed' })}
      ${box(150, 326, 340, 24, '#ddd6fe', '#7c3aed', 1.6, 4)}
      ${txtEl(200, 343, '轿底 / 地板', { size: 11.5, fill: '#5b21b6' })}
      ${box(470, 150, 18, 74, '#c7d2fe', '#4f46e5', 1.4, 4)}
      ${txtEl(452, 192, '操纵箱', { anchor: 'end', size: 11, fill: '#3730a3' })}
      ${box(392, 84, 74, 18, '#fef3c7', '#b45309', 1.4, 4)}
      ${txtEl(429, 98, '轿顶检修盒', { size: 11, fill: '#b45309' })}
    `;
    svg.appendChild(body);
    // 称重装置（轿底与下梁之间）
    const weigh = E('g', {});
    weigh.innerHTML = `
      ${box(286, 350, 88, 18, '#e0f2fe', '#0e7490', 1.6, 4)}
      ${txtEl(330, 363, '称重装置', { size: 11, fill: '#0e7490' })}
    `;
    svg.appendChild(weigh);
    // 传力路径
    const path = E('g', {});
    path.innerHTML = `
      <path class="flow" d="M230 330 L230 250 L230 100" fill="none" stroke="#4f46e5" stroke-width="5" stroke-linecap="round"/>
      <path class="flow" d="M430 330 L430 250 L430 100" fill="none" stroke="#4f46e5" stroke-width="5" stroke-linecap="round"/>
      <path class="flow" d="M230 100 L330 100" fill="none" stroke="#4f46e5" stroke-width="5" stroke-linecap="round"/>
      <path class="flow" d="M430 100 L330 100" fill="none" stroke="#4f46e5" stroke-width="5" stroke-linecap="round"/>
      <path class="flow" d="M330 100 L330 18" fill="none" stroke="#b45309" stroke-width="5" stroke-linecap="round"/>
      <path class="flow" d="M230 330 L330 338" fill="none" stroke="#059669" stroke-width="5" stroke-linecap="round"/>
      <path class="flow" d="M430 330 L330 338" fill="none" stroke="#059669" stroke-width="5" stroke-linecap="round"/>
      <path class="flow" d="M330 368 L330 386" fill="none" stroke="#059669" stroke-width="5" stroke-linecap="round"/>
    `;
    svg.appendChild(path);
    const lab = E('g', {});
    lab.innerHTML = `
      ${txtEl(244, 250, '① 轿底承载', { anchor: 'start', size: 11, fill: '#065f46' })}
      ${txtEl(244, 290, '② 称重→下梁', { anchor: 'start', size: 11, fill: '#3730a3' })}
      ${txtEl(336, 74, '③ 上梁集载', { anchor: 'start', size: 11, fill: '#3730a3' })}
      ${txtEl(336, 34, '④ 绳头吊挂', { anchor: 'start', size: 11, fill: '#b45309' })}
    `;
    svg.appendChild(lab);
    // 载重条形指示（称重装置输出）
    const barBg = E('rect', { x: 560, y: 120, width: 30, height: 200, rx: 6, fill: '#f1f5f9', stroke: '#cbd5e1', 'stroke-width': 1.5 });
    const barFill = E('rect', { x: 560, y: 200, width: 30, height: 120, rx: 6, fill: '#059669' });
    const bar110 = E('line', { x1: 552, y1: 120 + 200 * (1 - 1.1), x2: 588, y2: 120 + 200 * (1 - 1.1), stroke: '#dc2626', 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    [barBg, barFill, bar110].forEach(x => svg.appendChild(x));
    const barLab = E('g', {});
    barLab.innerHTML = `${txtEl(575, 112, '载荷率', { size: 11.5, fill: '#475569' })}${txtEl(594, 120 + 200 * (1 - 1.1) + 4, '110%', { anchor: 'start', size: 11, fill: '#b91c1c' })}`;
    svg.appendChild(barLab);
    // 状态文字
    const stateT = E('text', { x: 330, y: 448, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: '#059669', 'font-family': 'inherit' });
    svg.appendChild(stateT);
    const subT = E('text', { x: 330, y: 472, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 600, fill: '#64748b', 'font-family': 'inherit' });
    svg.appendChild(subT);
    // 轿内人数示意
    const pax = E('g', {});
    svg.appendChild(pax);

    ctx.state.load = 600; ctx.state.showPath = true;
    function refresh() {
      const Q = ctx.state.load, T = P + Q;
      const pct = Q / QR;                                  // 载荷率
      const over = Q > QR * 1.1;                            // 超载（110%）
      const w = 5 + Math.min(1.4, pct) * 9;
      path.querySelectorAll('path').forEach(p => p.setAttribute('stroke-width', w.toFixed(1)));
      path.setAttribute('opacity', ctx.state.showPath ? '1' : '0');
      lab.setAttribute('opacity', ctx.state.showPath ? '1' : '0');
      const sag = Math.min(1, pct) * 5;                     // 称重弹性下沉示意（px）
      body.setAttribute('transform', `translate(0,${sag.toFixed(1)})`);
      weigh.setAttribute('transform', `translate(0,${(sag * 0.6).toFixed(1)})`);
      // 载荷条形
      const h = Math.max(0, Math.min(200, 200 * pct));
      barFill.setAttribute('y', 320 - h); barFill.setAttribute('height', h);
      barFill.setAttribute('fill', over ? '#dc2626' : (pct > 0.8 ? '#f59e0b' : '#059669'));
      // 轿内乘客示意（每人 75 kg）
      const n = Math.round(Q / 75);
      let paxS = '';
      for (let i = 0; i < Math.min(n, 12); i++) {
        const cx = 190 + (i % 6) * 46, cy = 290 - Math.floor(i / 6) * 46 + sag;
        paxS += `<circle cx="${cx}" cy="${cy - 8}" r="8" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
          <rect x="${cx - 9}" y="${cy}" width="18" height="26" rx="7" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>`;
      }
      pax.innerHTML = paxS + (n > 12 ? txtEl(320, 250, `… 约 ${n} 人`, { size: 11, fill: '#b45309' }) : '');
      stateT.textContent = over ? '⚠ 超载：电梯保持开门、不能启动' : (pct > 0.8 ? '接近满载（≥80%）' : '正常载荷 · 允许启动');
      stateT.setAttribute('fill', over ? '#dc2626' : (pct > 0.8 ? '#f59e0b' : '#059669'));
      subT.textContent = over ? '称重装置输出超载信号 → 切断启动回路并发出声光报警（需减载至 ≤110% 方可恢复）' :
        `称重装置读数 ${Q} kg，载荷率 ${(pct * 100).toFixed(0)}%（报警阈值 110% = ${QR * 1.1} kg）`;
      ctx.readout([
        ['轿厢自重 P', `${P} kg`],
        ['载重 Q（称重读数）', `<b>${Q} kg</b> ≈ ${n} 人（按 75 kg/人）`],
        ['总吊挂载荷 P+Q', `<b>${T} kg</b>（约 ${(T * G / 1000).toFixed(1)} kN）`],
        ['载荷率', `<b style="color:${over ? '#dc2626' : (pct > 0.8 ? '#f59e0b' : '#059669')}">${(pct * 100).toFixed(0)}%</b>（报警阈值 110%）`],
        ['超载保护判定', over ? '<b style="color:#dc2626">超载动作：禁止启动 + 声光报警</b>' : '<b style="color:#059669">未超载，允许启动</b>'],
        ['轿底均布面载', `${(Q / AREA).toFixed(0)} kg/m²（轿底面积 ${AREA} m²）`],
        ['下梁最大弯矩（估）', `${(T * G * L / 8 / 1000).toFixed(1)} kN·m（跨度 ${L} m）`],
        ['单侧立柱轴力', `${(T * G / 2 / 1000).toFixed(1)} kN`],
        ['单根钢丝绳张力（4 根）', `${(T * G / N_ROPE / 1000).toFixed(2)} kN`],
        ['称重弹性下沉（示意）', `${(sag / 5 * 3).toFixed(1)} mm`]
      ]);
    }
    const stop = ticker(() => refresh());
    return {
      destroy: stop,
      onchange(k, v) {
        ctx.state[k] = v;
        if (k === 'load' && v > QR * 1.1) ctx.logLine(`载重 ${v} kg 超过 110% 额定载重：超载装置动作，电梯保持开门、禁止启动并发出声光报警`);
        if (k === 'load' && v <= QR * 1.1 && ctx.state._wasOver) ctx.logLine('载重恢复正常，超载信号解除');
        ctx.state._wasOver = v > QR * 1.1;
      },
      onaction() { }
    };
  }
};

/* =======================================================================
 * 4. 门系统仿真
 * ===================================================================== */
SIMS.door = {
  title: '门系统 · 轿门—层门联动与门锁回路仿真',
  desc: '执行开门/关门观察门刀夹持层门同步动作；可单独打开任一层的层门，观察门锁回路断开后电梯禁止运行的保护逻辑。',
  notes: [
    '轿门由门机驱动，门刀夹持层门门锁滚轮带动层门同步开闭（机械联动，层门本身无动力）。',
    '门锁回路 = 轿门门锁触点 + 各层站层门门锁触点串联：任一触点未接通（门未锁闭），回路断开，电梯不能运行（GB 7588 7.7）。',
    '门锁触点必须验证机械锁钩的啮合状态（啮合深度 ≥7 mm），而不是仅检测门扇是否靠近。',
    '光幕 / 安全触板检测到障碍时立即反转开门，防止夹人。'
  ],
  photos: [
    { f: 'real-el-door-panels.jpg', cap: '层门轿门·门挂轮组' },
    { f: 'real-el-door-system.jpg', cap: '门系统·门机传动' },
    { f: 'real-el-door-operator.jpg', cap: '门机与控制器' },
    { f: 'real-door-car-door-1.jpg', cap: '轿门门挂装置·门滑块' },
    { f: 'real-door-landing-lock-1.jpg', cap: '层门门锁·锁钩触点' },
    { f: 'real-door-knife-1.jpg', cap: '门刀与门球·夹持啮合' },
    { f: 'real-door-threshold-1.jpg', cap: '层门地坎·滑槽门滑块' }
  ],
  controls: [
    { type: 'buttons', items: [
      { key: 'open', label: '开门', cls: 'ok' },
      { key: 'close', label: '关门' },
      { key: 'cycle', label: '自动循环' }
    ] },
    { type: 'buttons', items: [
      { key: 'l1', label: '开 1F 层门' }, { key: 'l2', label: '开 2F 层门' },
      { key: 'l3', label: '开 3F 层门' }, { key: 'l4', label: '开 4F 层门' }
    ] },
    { key: 'obs', type: 'checkbox', label: '光幕前放置障碍物', value: false }
  ],
  mount(ctx) {
    const svg = makeSvg(ctx.stage, '0 0 760 660', `
      ${box(90, 70, 280, 300, '#f8fafc', '#cbd5e1', 2, 8)}
      ${txtEl(230, 92, '层站 / 井道口', { size: 12, fill: '#94a3b8' })}
      ${box(160, 40, 220, 30, '#fed7aa', '#ea580c', 2, 8)}
      ${txtEl(270, 61, '门机（变频驱动）', { size: 12, fill: '#9a3412' })}
      ${line(60, 240, 90, 240, '#e2e8f0', 1.4, '6 5')}
      ${txtEl(56, 244, '轿门轨道', { anchor: 'end', size: 11, fill: '#94a3b8' })}
      ${line(120, 380, 340, 380, '#78716c', 5)}
      ${txtEl(390, 384, '地坎 + 门滑块', { anchor: 'start', size: 11, fill: '#57534e' })}
      ${txtEl(230, 404, '轿门 / 层门机械联动', { size: 12, fill: '#475569' })}
      ${box(470, 60, 270, 400, '#fffbeb', '#fbbf24', 1.6, 8)}
      ${txtEl(605, 84, '门 锁 回 路（串联）', { size: 12.5, fill: '#b45309' })}
      ${txtEl(605, 104, '轿门触点 + 各层门触点', { size: 11, fill: '#92400e' })}
    `, '门系统仿真：层门轿门、门锁与门机联动');
    // 门锁回路电气图
    const LOOPX = 500, LOOPX2 = 700, LOOPY0 = 130, LOOPY1 = 430;
    const circuit = E('g', {});
    circuit.innerHTML = `${line(LOOPX, LOOPY0, LOOPX, LOOPY1, '#475569', 2.5)}${line(LOOPX2, LOOPY0, LOOPX2, LOOPY1, '#475569', 2.5)}
      ${box(LOOPX - 6, LOOPY0 - 22, 12, 22, '#e5e7eb', '#6b7280', 1.6, 3)}
      ${txtEl(LOOPX - 14, LOOPY0 - 6, '电源', { anchor: 'end', size: 11, fill: '#6b7280' })}
      ${box(LOOPX2 - 26, LOOPY1 + 4, 52, 22, '#e5e7eb', '#6b7280', 1.6, 4)}
      ${txtEl(LOOPX2, LOOPY1 + 19, '运行继电器', { size: 11, fill: '#6b7280' })}
      ${line(LOOPX, LOOPY1, LOOPX2, LOOPY1, '#475569', 2.5)}${line(LOOPX, LOOPY0, LOOPX2, LOOPY0, '#475569', 2.5)}`;
    svg.appendChild(circuit);
    // 5 个触点：轿门 + 1F~4F 层门
    const CONTACT_Y = { car: 170, 1: 240, 2: 300, 3: 360, 4: 420 };
    const contacts = {};
    Object.keys(CONTACT_Y).forEach(k => {
      const y = CONTACT_Y[k];
      const g = E('g', {});
      g.innerHTML = `
        <circle cx="${LOOPX + 60}" cy="${y}" r="5" fill="#475569"/>
        <circle cx="${LOOPX + 140}" cy="${y}" r="5" fill="#475569"/>
        <line class="blade" x1="${LOOPX + 60}" y1="${y}" x2="${LOOPX + 140}" y2="${y}" stroke="#059669" stroke-width="3.4" stroke-linecap="round"/>
        ${txtEl(LOOPX + 100, y + 20, k === 'car' ? '轿门锁' : k + 'F 层门锁', { size: 11.5, fill: '#334155' })}
        <text class="cstat" x="${LOOPX + 176}" y="${y + 5}" font-size="11" font-weight="700" fill="#059669" font-family="inherit">闭合</text>
      `;
      svg.appendChild(g);
      contacts[k] = g;
    });

    // 门扇：层门（外，绿）+ 轿门（内，蓝）
    const carDoorG = E('g', {});
    const cdL = E('g', {}); cdL.innerHTML = box(0, 0, 118, 190, '#e0f2fe', '#0e7490', 2.4, 4) + txtEl(59, 100, '轿门', { size: 12.5, fill: '#0e7490' });
    const cdR = E('g', {}); cdR.innerHTML = box(0, 0, 118, 190, '#e0f2fe', '#0e7490', 2.4, 4) + txtEl(59, 100, '轿门', { size: 12.5, fill: '#0e7490' });
    carDoorG.appendChild(cdL); carDoorG.appendChild(cdR);
    const landDoorG = E('g', {});
    const ldL = E('g', {}); ldL.innerHTML = box(0, 0, 118, 170, '#dcfce7', '#059669', 2.4, 4) + txtEl(59, 15, '层门', { size: 12.5, fill: '#065f46' });
    const ldR = E('g', {}); ldR.innerHTML = box(0, 0, 118, 170, '#dcfce7', '#059669', 2.4, 4) + txtEl(59, 15, '层门', { size: 12.5, fill: '#065f46' });
    landDoorG.appendChild(ldL); landDoorG.appendChild(ldR);
    svg.appendChild(landDoorG); svg.appendChild(carDoorG);
    // 门刀 + 门锁滚轮
    const knife = E('g', {});
    knife.innerHTML = `${box(0, 0, 14, 30, '#dc2626', '#991b1b', 1.8, 3)}
      ${line(0, 0, -28, -46, '#dc2626', 1.8, '4 3')}
      ${line(0, 0, 28, -46, '#dc2626', 1.8, '4 3')}`;
    svg.appendChild(knife);
    const rollerL = E('circle', { r: 9, fill: '#fcd34d', stroke: '#b45309' });
    const rollerR = E('circle', { r: 9, fill: '#fcd34d', stroke: '#b45309' });
    svg.appendChild(rollerL); svg.appendChild(rollerR);
    const knifeLab = E('g', {});
    knifeLab.innerHTML = txtEl(300, 130, '门刀 → 夹持门锁滚轮', { anchor: 'start', size: 11, fill: '#b91c1c' });
    svg.appendChild(knifeLab);
    // 光幕 + 障碍
    const curtain = E('g', {});
    curtain.innerHTML = `${line(178, 96, 178, 352, '#ef4444', 3, '8 6')}${line(282, 96, 282, 352, '#ef4444', 3, '8 6')}
      ${txtEl(230, 424, '光幕保护', { size: 11, fill: '#b91c1c' })}`;
    svg.appendChild(curtain);
    const obstacle = E('g', {});
    obstacle.innerHTML = `${box(200, 90, 60, 262, '#fca5a5', '#dc2626', 2, 6)}${txtEl(230, 226, '障碍', { size: 12, fill: '#991b1b' })}`;
    obstacle.setAttribute('opacity', '0');
    svg.appendChild(obstacle);
    const stateTxt = E('text', { x: 230, y: 448, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#1e3a8a', 'font-family': 'inherit' });
    svg.appendChild(stateTxt);
    const loopTxt = E('text', { x: 605, y: 476, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#059669', 'font-family': 'inherit' });
    svg.appendChild(loopTxt);

    /* ===== 实物对照小图（v1.3.0 L4）=====
     * 落点：画布底部空闲带（y 488-634，门锁回路面板下方左侧），viewBox 高度已 560→660 */
    const galG = E('g', {});
    const IMGS = [
      { f: 'real-door-knife-1.jpg', n: '门刀', s: '夹持层门门球滚轮' },
      { f: 'real-door-landing-lock-1.jpg', n: '层门门锁', s: '锁钩 + 电气触点' }
    ];
    galG.innerHTML = txtEl(252, 480, '实物对照', { size: 11, fill: '#334155', weight: 800 }) +
      IMGS.map((g, i) => {
        const cx = 24 + i * 238, cy = 488;
        return box(cx, cy, 218, 146, '#f8fafc', '#e2e8f0', 1.4, 6) +
          `<image href="${assetImage(g.f)}" x="${cx + 4}" y="${cy + 4}" width="210" height="100" preserveAspectRatio="xMidYMid meet"/>` +
          txtEl(cx + 109, cy + 120, g.n, { size: 10, fill: '#334155', weight: 700 }) +
          txtEl(cx + 109, cy + 134, g.s, { size: 8.5, fill: '#64748b', weight: 500 });
      }).join('');
    svg.appendChild(galG);

    let r = 0.0;            // 门开度 0 关 ~ 1 开
    let mode = 'idle';      // idle | opening | closing | open
    let dwell = 0, autoT = 0;
    ctx.state.obs = false; ctx.state.cycle = false;
    ctx.state.lock = { 1: true, 2: true, 3: true, 4: true };   // true = 层门锁闭

    function speedOf(rr) { return 0.45 + 0.85 * Math.sin(Math.PI * Math.min(1, Math.max(0, rr))); }

    function paint() {
      const open = r * 108;
      ldL.setAttribute('transform', `translate(${112 - open},80)`);
      ldR.setAttribute('transform', `translate(${230 + open},80)`);
      cdL.setAttribute('transform', `translate(${112 - open},100)`);
      cdR.setAttribute('transform', `translate(${230 + open},100)`);
      knife.setAttribute('transform', `translate(${230 - open - 7},96)`);
      rollerL.setAttribute('cx', 112 - open); rollerL.setAttribute('cy', 46);
      rollerR.setAttribute('cx', 348 + open); rollerR.setAttribute('cy', 46);
      obstacle.setAttribute('opacity', ctx.state.obs ? '1' : '0');
      const carLocked = r < 0.02;
      const openFloors = [1, 2, 3, 4].filter(f => !ctx.state.lock[f]);
      const loopOk = carLocked && openFloors.length === 0;
      // 回路触点状态
      Object.keys(CONTACT_Y).forEach(k => {
        const g = contacts[k], ok = k === 'car' ? carLocked : ctx.state.lock[k];
        const blade = g.querySelector('.blade'), st = g.querySelector('.cstat');
        blade.setAttribute('stroke', ok ? '#059669' : '#dc2626');
        if (ok) { blade.setAttribute('x2', LOOPX + 140); blade.setAttribute('y2', CONTACT_Y[k]); }
        else { blade.setAttribute('x2', LOOPX + 122); blade.setAttribute('y2', CONTACT_Y[k] - 18); }
        st.textContent = ok ? '闭合' : '断开';
        st.setAttribute('fill', ok ? '#059669' : '#dc2626');
      });
      stateTxt.textContent = loopOk ? '门锁回路接通 · 电梯可以运行'
        : (carLocked ? `${openFloors.map(f => f + 'F').join('、')} 层门未锁闭 → 电梯禁止运行` : '轿门未锁闭 → 电梯禁止运行');
      stateTxt.setAttribute('fill', loopOk ? '#059669' : '#b91c1c');
      loopTxt.textContent = loopOk ? '门锁回路：接通 ✔' : '门锁回路：断开 ✘（禁止运行）';
      loopTxt.setAttribute('fill', loopOk ? '#059669' : '#dc2626');
      ctx.readout([
        ['门开度', `${(r * 100).toFixed(0)} %`],
        ['轿门门锁触点', carLocked ? '<b style="color:#059669">闭合</b>' : '<b style="color:#dc2626">断开</b>'],
        ['1F 层门门锁', ctx.state.lock[1] ? '闭合' : '<b style="color:#dc2626">断开</b>'],
        ['2F 层门门锁', ctx.state.lock[2] ? '闭合' : '<b style="color:#dc2626">断开</b>'],
        ['3F 层门门锁', ctx.state.lock[3] ? '闭合' : '<b style="color:#dc2626">断开</b>'],
        ['4F 层门门锁', ctx.state.lock[4] ? '闭合' : '<b style="color:#dc2626">断开</b>'],
        ['门锁回路（串联）', loopOk ? '<b style="color:#059669">接通</b>' : '<b style="color:#dc2626">断开</b>'],
        ['电梯可否运行', loopOk ? '<b style="color:#059669">允许</b>' : '<b style="color:#dc2626">禁止</b>'],
        ['光幕 / 触板', ctx.state.obs ? '<b style="color:#dc2626">检测到障碍</b>' : '无遮挡'],
        ['运行状态', mode === 'opening' && ctx.state.obs ? '遇阻反转开门'
          : { idle: '待机', opening: '开门中', closing: '关门中', open: '门已开' }[mode]]
      ]);
    }
    paint();

    const stop = ticker(dt => {
      if (mode === 'opening') {
        r += speedOf(r) * dt;
        if (r >= 1) { r = 1; mode = 'open'; dwell = 3.2; ctx.logLine('门全开'); }
      } else if (mode === 'closing') {
        r -= speedOf(r) * dt;
        if (ctx.state.obs) {                       // 关门全程：光幕被遮挡 → 立即反转
          mode = 'opening';
          ctx.logLine('光幕动作：关门遇阻，反转开门');
        } else if (r <= 0) { r = 0; mode = 'idle'; ctx.logLine('轿门闭合，轿门门锁触点接通'); }
      } else if (mode === 'open') {
        dwell -= dt;
        if (ctx.state.cycle && dwell <= 0) { mode = 'closing'; ctx.logLine('延时结束，开始关门'); }
      } else if (mode === 'idle' && ctx.state.cycle) {
        autoT += dt;
        if (autoT > 2.4) { autoT = 0; mode = 'opening'; ctx.logLine('自动循环：开始开门'); }
      }
      paint();
    });
    return {
      destroy: stop,
      onchange(k, v) { ctx.state[k] = v; },
      onaction(k, btn) {
        if (k === 'open') { mode = 'opening'; ctx.logLine('指令：开门'); }
        if (k === 'close') { if (ctx.state.obs) ctx.logLine('光幕被遮挡：禁止关门，请清除障碍物'); else { mode = 'closing'; ctx.logLine('指令：关门'); } }
        if (k === 'cycle') { ctx.state.cycle = !ctx.state.cycle; btn.classList.toggle('ok', ctx.state.cycle); btn.classList.toggle('ghost', !ctx.state.cycle); ctx.logLine('自动循环：' + (ctx.state.cycle ? '开' : '关')); }
        const m = /^l([1-4])$/.exec(k);
        if (m) {
          const f = parseInt(m[1], 10);
          ctx.state.lock[f] = !ctx.state.lock[f];
          const open = !ctx.state.lock[f];
          btn.textContent = open ? `关 ${f}F 层门` : `开 ${f}F 层门`;
          btn.classList.toggle('dang', open); btn.classList.toggle('ghost', !open);
          ctx.logLine(open ? `${f}F 层门被打开：层门门锁触点断开 → 门锁回路断开，电梯禁止运行` : `${f}F 层门恢复锁闭：门锁触点接通`);
        }
      }
    };
  }
};

/* =======================================================================
 * 5. 重量平衡系统仿真
 * ===================================================================== */
SIMS.balance = {
  title: '重量平衡系统 · 平衡系数与拖动电流方向仿真',
  desc: '按国标取平衡系数 K = 0.40~0.50，配合轿厢载重与运行方向（上行/下行），观察轿厢与对重的质量差 Δm 如何决定电动机的电动/发电工况与拖动电流方向：Δm 与运行方向共同决定电机是吸收电网功率还是把机械能回馈出去，K≈0.5 时全载荷区间的最大不平衡载荷最小、能耗最低。',
  notes: [
    '对重重量 W = 轿厢自重 P + 平衡系数 K × 额定载重 Q额。平衡系数 K 的国标取值区间为 0.40~0.50（GB/T 10058《电梯技术条件》、GB 7588—2003《电梯制造与安装安全规范》），工程上常取 0.45~0.50。',
    '不平衡质量 Δm = (P + Q) − W：Δm > 0 为轿厢侧重，Δm < 0 为对重侧重；不平衡力 F = Δm·g，曳引轮轴功率 P = F·v。',
    '拖动电流由 Δm 与运行方向共同决定：上行且 Δm > 0（轿厢侧重）→ 电动工况，电机转矩与转向同向，从电网吸收功率；上行且 Δm < 0（对重侧重）→ 对重下行的位能反拖电机，电机转矩与转向相反，进入发电（回馈/耗能制动）工况。下行时两者恰好相反。',
    '本仿真以 +I 表示电动（变频器→电机，从电网吸收功率），以 −I 表示发电（电机→变频器，机械能回馈电网；无能量回馈单元时由制动电阻耗能）。',
    'K 取 0.5 时 Q = 50% 额定载重处 Δm = 0，常用载荷区间内 |Δm| 与拖动电流最小；K 偏小则满载上行、空载下行时电流偏大，K 偏大则空载上行、满载下行时电流偏大。',
    '提升高度较大时须设补偿装置（补偿链 / 补偿绳），抵消钢丝绳与随行电缆重量随轿厢位置变化引起的不平衡。'
  ],
  photos: [
    { f: 'real-el-balance-system.jpg', cap: '重量平衡系统·半剖视' },
    { f: 'real-balance-counterweight-1.jpg', cap: '对重装置·对重块叠装' },
    { f: 'real-balance-chain-1.jpg', cap: '补偿链·两端固定' },
    { f: 'real-balance-block-1.jpg', cap: '对重块·压紧固定' }
  ],
  controls: [
    { key: 'K', type: 'range', label: '平衡系数 K（GB/T 10058 要求 0.40~0.50）', min: 0.40, max: 0.50, step: 0.01, value: 0.50 },
    { key: 'load', type: 'range', label: '轿厢载重 Q', min: 0, max: 1000, step: 25, value: 500, unit: ' kg' },
    { key: 'dir', type: 'select', label: '运行方向（决定电动 / 发电工况）', value: 'up', options: [['up', '上行 ↑（轿厢上升、对重下降）'], ['down', '下行 ↓（轿厢下降、对重上升）']] }
  ],
  mount(ctx) {
    const P = 1200, QR = 1000, G = 9.8;
    const V = 1.0;                            // 轿厢运行速度 m/s（计算轴功率用）
    const ETA_M = 0.75, ETA_V = 0.97;         // 机械传动效率 / 变频器效率
    const ETA = ETA_M * ETA_V;                // 电动工况总效率（电网→曳引轮轴）
    const U_L = 380, COSF = 0.85, SQ3 = Math.sqrt(3);   // 电网侧三相 380 V / 功率因数
    const I_FS = 16;                          // 曲线图纵轴满量程 ±16 A
    const CX0 = 130, CX1 = 600, CZERO = 440, CHALF = 60; // 曲线区：x 130~600，零线 y=440，半幅 60 px
    const svg = makeSvg(ctx.stage, '0 0 720 560', `
      ${txtEl(360, 28, '对重平衡原理（杠杆示意）', { size: 14, fill: '#b45309' })}
      ${circle3(360, 88, 28)}${txtEl(360, 60, '曳引轮', { size: 11, fill: '#1e3a8a' })}
      ${line(120, 130, 600, 130, '#78350f', 7)}
      ${circle3(360, 130, 9)}
      ${txtEl(96, 166, '轿厢', { size: 12.5, fill: '#1e3a8a' })}
      ${txtEl(624, 166, '对重', { size: 12.5, fill: '#b45309' })}
    `, '重量平衡系统仿真：对重与补偿链平衡系数');
    const carG = E('g', {});
    carG.innerHTML = `${line(196, 130, 196, 172, '#475569', 2.4)}${box(116, 172, 160, 110, C.car, C.carS, 2.4, 5)}
      ${txtEl(196, 232, 'P + Q', { size: 15, fill: '#1e3a8a' })}${txtEl(196, 320, '轿厢自重 P + 载重 Q', { size: 11.5, fill: '#475569' })}`;
    const cwG = E('g', {});
    cwG.innerHTML = `${line(524, 130, 524, 172, '#475569', 2.4)}${box(444, 172, 160, 110, C.cw, C.cwS, 2.4, 5)}
      ${txtEl(524, 232, 'W', { size: 15, fill: '#b45309' })}${txtEl(524, 320, '对重总重 W = P + K·Q', { size: 11.5, fill: '#475569' })}`;
    svg.appendChild(carG); svg.appendChild(cwG);
    const beam = svg.querySelector('line[y1="130"]');
    /* 拖动电流曲线图：纵轴为带符号电流 I（+ 电动 / − 发电），横轴为载重 Q */
    const chart = E('g', {});
    chart.innerHTML = `${box(96, 360, 528, 150, '#fff', '#cbd5e1', 1.6, 10)}
      ${txtEl(120, 376, '拖动电流 I — Q 曲线（+ 电动 / − 发电回馈）', { anchor: 'start', size: 11.5, fill: '#334155' })}
      ${line(CX0, CZERO, CX1, CZERO, '#94a3b8', 1.6)}
      ${line(CX0, CZERO - CHALF, CX0, CZERO + CHALF, '#94a3b8', 1.6)}
      ${txtEl(CX0 - 6, CZERO - CHALF + 4, '+I', { anchor: 'end', size: 11, fill: '#dc2626' })}
      ${txtEl(CX0 - 6, CZERO + CHALF, '−I', { anchor: 'end', size: 11, fill: '#059669' })}
      ${txtEl(CX0 - 6, CZERO + 4, '0', { anchor: 'end', size: 11, fill: '#94a3b8' })}
      ${txtEl(CX1 + 4, CZERO + 14, 'Q（kg）→', { anchor: 'end', size: 11, fill: '#94a3b8' })}
      ${line(CX0, CZERO - CHALF, CX1, CZERO - CHALF, '#e2e8f0', 1, '4 4')}
      ${line(CX0, CZERO + CHALF, CX1, CZERO + CHALF, '#e2e8f0', 1, '4 4')}`;
    svg.appendChild(chart);
    const balLine = E('line', { stroke: '#0e7490', 'stroke-width': 1.4, 'stroke-dasharray': '5 4' });
    const balTxt = E('text', { 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: '#0e7490', 'font-family': 'inherit' });
    const curve = E('path', { fill: 'none', stroke: '#dc2626', 'stroke-width': 2.6 });
    const marker = E('circle', { r: 6, fill: '#dc2626', stroke: '#fff', 'stroke-width': 2 });
    [balLine, balTxt, curve, marker].forEach(x => svg.appendChild(x));
    // 不平衡质量动态标注（杠杆图与曲线图之间）
    const dmT = E('text', { x: 360, y: 346, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#b45309', 'font-family': 'inherit' });
    svg.appendChild(dmT);
    const note = E('text', { x: 360, y: 534, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#334155', 'font-family': 'inherit' });
    svg.appendChild(note);

    ctx.state.K = 0.5; ctx.state.load = 500; ctx.state.dir = 'up';
    /* 给定不平衡质量 d（kg）与运行方向符号，返回带符号电流 I（A）与轴功率（kW） */
    function elec(d, dirSign) {
      const pm = d * G * V * dirSign / 1000;                       // 曳引轮轴功率 kW（>0 电动，<0 发电）
      const pg = pm > 0 ? pm / ETA : (pm < 0 ? pm * ETA : 0);      // 电网侧功率 kW（>0 吸收，<0 回馈）
      return { pm: pm, pg: pg, I: pg * 1000 / (SQ3 * U_L * COSF) };
    }
    const clampY = y => Math.max(CZERO - CHALF, Math.min(CZERO + CHALF, y));
    function paint() {
      const K = ctx.state.K, Q = ctx.state.load;
      const up = ctx.state.dir !== 'down';
      const dirSign = up ? 1 : -1;                                  // 轿厢上行 = +1
      const W = P + K * QR;
      const dm = (P + Q) - W;                                       // 不平衡质量 kg（+ 轿厢侧重）
      const F = dm * G;                                             // 不平衡力 N
      const e = elec(dm, dirSign);                                  // 轴功率 / 电网功率 / 电流
      const motoring = e.pm > 0.02, generating = e.pm < -0.02;
      const PIVX = 360, PIVY = 130, OFF = 164;            // 支点 + 吊挂在梁上的偏移（196/524 → ±164）
      const tilt = Math.max(-4, Math.min(4, -dm / 900 * 4)); // dm>0（轿厢侧重）→ 左侧下沉 → 负角（逆时针）
      const rad = tilt * Math.PI / 180;
      const ax = PIVX - OFF * Math.cos(rad), ay = PIVY - OFF * Math.sin(rad);  // 左吊挂点（随梁转动）
      const bx = PIVX + OFF * Math.cos(rad), by = PIVY + OFF * Math.sin(rad);  // 右吊挂点（随梁转动）
      // 曲线：带符号电流 I 随 Q 变化（当前方向）
      const pts = [];
      for (let q = 0; q <= 1000; q += 50) {
        const ei = elec((P + q) - W, dirSign);
        pts.push([CX0 + q / 1000 * (CX1 - CX0), clampY(CZERO - ei.I / I_FS * CHALF)]);
      }
      curve.setAttribute('d', 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L'));
      // 平衡点（Δm = 0 处，Q = K·Q额）
      const bx0 = CX0 + (K * QR) / 1000 * (CX1 - CX0);
      balLine.setAttribute('x1', bx0.toFixed(1)); balLine.setAttribute('y1', CZERO - CHALF);
      balLine.setAttribute('x2', bx0.toFixed(1)); balLine.setAttribute('y2', CZERO + CHALF);
      balTxt.setAttribute('x', bx0.toFixed(1)); balTxt.setAttribute('y', CZERO - CHALF + 16);
      balTxt.textContent = `平衡点 Q=${(K * QR).toFixed(0)}`;
      marker.setAttribute('cx', (CX0 + Q / 1000 * (CX1 - CX0)).toFixed(1));
      marker.setAttribute('cy', clampY(CZERO - e.I / I_FS * CHALF).toFixed(1));
      marker.setAttribute('fill', motoring ? '#dc2626' : (generating ? '#059669' : '#64748b'));
      beam.setAttribute('transform', `rotate(${tilt.toFixed(2)} ${PIVX} ${PIVY})`);
      carG.setAttribute('transform', `translate(${(ax - 196).toFixed(2)},${(ay - 130).toFixed(2)})`);
      cwG.setAttribute('transform', `translate(${(bx - 524).toFixed(2)},${(by - 130).toFixed(2)})`);
      dmT.textContent = `Δm = (P+Q) − W = ${dm > 0 ? '+' : ''}${dm.toFixed(0)} kg（${dm > 0 ? '轿厢侧重' : dm < 0 ? '对重侧重' : '完全平衡'}）`;
      dmT.setAttribute('fill', Math.abs(dm) < 25 ? '#059669' : '#b45309');
      note.textContent = `K = ${K.toFixed(2)}（国标 0.40~0.50）· ${up ? '上行' : '下行'}：${Math.abs(dm) < 25 ? '★ 处于平衡点附近，拖动功率≈0，能耗最低' : (motoring ? `电动工况——电机从电网吸收 ${Math.abs(e.pg).toFixed(2)} kW` : `发电工况——机械能回馈 ${Math.abs(e.pg).toFixed(2)} kW`)}`;
      note.setAttribute('fill', Math.abs(dm) < 25 ? '#059669' : (motoring ? '#b45309' : '#0e7490'));
      ctx.readout([
        ['轿厢自重 P', `${P} kg`],
        ['额定载重 Q额', `${QR} kg`],
        ['平衡系数 K', `<b>${K.toFixed(2)}</b>（GB/T 10058 / GB 7588：0.40~0.50）`],
        ['对重总重 W = P + K·Q额', `<b>${W.toFixed(0)} kg</b>`],
        ['当前载重 Q', `${Q} kg`],
        ['不平衡质量 Δm = (P+Q) − W', `<b style="color:${Math.abs(dm) > 600 ? '#dc2626' : '#059669'}">${dm > 0 ? '+' : ''}${dm.toFixed(0)} kg</b>（${dm > 0 ? '轿厢侧重' : dm < 0 ? '对重侧重' : '平衡'}）`],
        ['不平衡力 F = Δm·g', `${(F / 1000).toFixed(2)} kN`],
        ['运行方向', `<b>${up ? '上行 ↑（轿厢上升）' : '下行 ↓（轿厢下降）'}</b>`],
        ['拖动状态（电动 / 发电）', motoring ? '<b style="color:#dc2626">电动：转矩与转向同向，电机拖动负载</b>'
          : generating ? '<b style="color:#059669">发电：转矩与转向相反，位能反拖电机发电</b>'
            : '<b style="color:#059669">平衡：Δm≈0，仅需克服摩擦与损耗</b>'],
        ['曳引轮轴功率 P = F·v', `${e.pm > 0 ? '+' : ''}${e.pm.toFixed(2)} kW（v = ${V.toFixed(1)} m/s）`],
        ['电网侧功率（估）', `${e.pg > 0 ? '+' : ''}${e.pg.toFixed(2)} kW（${e.pg > 0 ? '吸收' : e.pg < 0 ? '回馈' : '—'}）`],
        ['拖动电流 I（示意，带符号）', `<b style="color:${motoring ? '#dc2626' : generating ? '#059669' : '#64748b'}">${e.I > 0 ? '+' : ''}${e.I.toFixed(1)} A</b>（${motoring ? '由变频器流向电机（电动）' : generating ? '由电机流向变频器（发电回馈）' : '≈0（仅励磁与损耗）'}）`],
        ['电流方向说明', motoring ? '上行 Δm>0 或下行 Δm<0：重侧下行方向被电机提升 → 电动，电流为正'
          : generating ? '上行 Δm<0 或下行 Δm>0：重侧自然下行、位能反拖电机 → 发电，电流为负（回馈电网；无回馈单元时由制动电阻耗能）'
            : 'Δm≈0：电机不输出机械功率，电流仅含励磁与损耗分量'],
        ['能耗评价', Math.abs(dm) < 25 ? '<b style="color:#059669">最节能工况点</b>' : (Math.abs(dm) > 500 ? '<b style="color:#dc2626">|Δm| 偏大，拖动电流偏高</b>' : '<b style="color:#059669">|Δm| 适中</b>')]
      ]);
    }
    const stop = ticker(() => paint());
    return { destroy: stop, onchange(k, v) { ctx.state[k] = v; } };
  }
};
function circle3(cx, cy, r) { return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#e0e7ff" stroke="#1d4ed8" stroke-width="2.4"/>`; }

/* =======================================================================
 * 6. 电力拖动系统仿真
 * ===================================================================== */
SIMS.drive = {
  title: '电力拖动系统 · VVVF 变频调速与 S 形速度曲线',
  desc: '点击“启动/停止”，观察变频器输出电压、频率与速度按 S 形曲线平滑建立的过程，以及电机转动。',
  notes: ['VVVF = 变压变频，通过改变频率 f 实现无级调速。', 'S 形速度曲线使加速度连续变化，减小冲击、提高舒适性。', '编码器实时反馈转速，构成速度闭环控制。', '运行状态四态：加速中（S 曲线前段，加速度由 0 渐增）→ 匀速运行（v≈给定）→ 减速中（S 曲线后段，接近目标层站时按距离给定降速，末端抱闸）→ 停止（v≈0 且运行指令撤销，制动器抱闸）。'],
  photos: [
    { f: 'real-el-drive-machine.jpg', cap: '有齿轮曳引机组' },
    { f: 'real-el-drive-cabinet.jpg', cap: '一体化驱动电箱' },
    { f: 'real-drive-motor-1.jpg', cap: '曳引电动机·尾部编码器' },
    { f: 'real-drive-vvvf-1.jpg', cap: 'VVVF 变频器·柜内安装' },
    { f: 'real-drive-brake-1.jpg', cap: '电磁制动器·闸瓦弹簧' },
    { f: 'real-drive-encoder-1.jpg', cap: '旋转编码器·联轴器' }
  ],
  controls: [
    { key: 'vmax', type: 'range', label: '目标速度', min: 0.5, max: 2.5, step: 0.1, value: 1.5, unit: ' m/s' },
    { type: 'buttons', items: [{ key: 'run', label: '启动', cls: 'ok' }, { key: 'stop', label: '停止' }, { key: 'reset', label: '复位' }] }
  ],
  mount(ctx) {
    const svg = makeSvg(ctx.stage, '0 0 720 560', `
      ${box(30, 40, 190, 150, '#fff', '#cbd5e1', 1.8, 10)}
      ${txtEl(125, 64, 'S 形速度曲线', { size: 12, fill: '#334155' })}
      ${line(52, 170, 205, 170, '#94a3b8', 1.6)}
      ${line(52, 170, 52, 80, '#94a3b8', 1.6)}
      ${txtEl(46, 84, 'v', { anchor: 'end', size: 11, fill: '#94a3b8' })}
      ${txtEl(205, 186, 't', { anchor: 'end', size: 11, fill: '#94a3b8' })}
      ${box(30, 220, 320, 90, '#fff', '#cbd5e1', 1.8, 10)}
      ${txtEl(190, 244, '变频器 VVVF', { size: 12.5, fill: '#9a3412' })}
      ${txtEl(190, 268, '整流 → 直流母线 → 逆变', { size: 11, fill: '#475569', weight: 500 })}
      ${txtEl(190, 292, '输出：频率 f / 电压 U 可调', { size: 11, fill: '#475569', weight: 500 })}
      ${box(410, 220, 280, 90, '#e0e7ff', '#1d4ed8', 1.8, 10)}
      ${txtEl(470, 258, '', { size: 12 })}
      ${txtEl(410, 300, '', {})}
      ${box(430, 350, 240, 60, '#f1f5f9', '#64748b', 1.8, 8)}
      ${txtEl(550, 386, '旋转编码器（速度反馈）', { size: 11.5, fill: '#475569' })}
    `, '电力拖动系统仿真：电动机、变频器与制动器状态');
    const motor = E('g', {});
    motor.setAttribute('transform', 'translate(0,0)');
    motor.innerHTML = `
      <circle cx="550" cy="265" r="40" fill="#fff" stroke="#1d4ed8" stroke-width="3"/>
      <g class="rot">
        <circle cx="550" cy="265" r="7" fill="#1d4ed8"/>
        ${Array.from({ length: 6 }, (_, i) => {
          const a = i * Math.PI / 3;
          return line(550 + 9 * Math.cos(a), 265 + 9 * Math.sin(a), 550 + 33 * Math.cos(a), 265 + 33 * Math.sin(a), '#60a5fa', 2.4);
        }).join('')}
      </g>
      ${txtEl(550, 330, '曳引电动机', { size: 12, fill: '#1e3a8a' })}
    `;
    svg.appendChild(motor);
    const rotG = motor.querySelector('.rot');
    // 曳引轮
    const sheave = E('g', {});
    sheave.innerHTML = `<circle cx="550" cy="470" r="34" fill="#e0e7ff" stroke="#1d4ed8" stroke-width="2.4"/>
      <circle cx="550" cy="470" r="6" fill="#1d4ed8"/>
      ${line(550, 436, 550, 400, '#1d4ed8', 2.6)}
      ${txtEl(550, 526, '曳引轮 / 轿厢升降', { size: 11, fill: '#475569' })}`;
    svg.appendChild(sheave);
    const curve = E('path', { fill: 'none', stroke: '#1d4ed8', 'stroke-width': 2.6 });
    svg.appendChild(curve);
    const dot = E('circle', { r: 5, fill: '#dc2626', stroke: '#fff', 'stroke-width': 2 });
    svg.appendChild(dot);
    const vTxt = E('text', { x: 550, y: 265, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#1e3a8a', 'font-family': 'inherit' });
    motor.appendChild(vTxt);

    let v = 0, vPrev = 0, running = false, ang = 0, hist = [];
    ctx.state.vmax = 1.5;
    const planV = makePlanner(0.9, 2.5);            // aMax=0.9 m/s²，jMax=2.5 m/s³（示意）
    function paint(dt) {
      const vmax = ctx.state.vmax;
      v = planV(v, running ? vmax : 0, dt);         // dt 驱动 + S 形
      ang += v * 360 * dt;                          // 360°/s @1m/s，与 60fps 原观感一致且 dt 驱动
      rotG.setAttribute('transform', `rotate(${ang.toFixed(1)} 550 265)`);
      // 曲线
      hist.push(v);
      if (hist.length > 200) hist.shift();
      const d = hist.map((val, i) => `${i === 0 ? 'M' : 'L'}${(52 + i * 0.75).toFixed(1)},${(170 - val / 2.5 * 82).toFixed(1)}`).join(' ');
      curve.setAttribute('d', d);
      dot.setAttribute('cx', 52 + (hist.length - 1) * 0.75);
      dot.setAttribute('cy', 170 - v / 2.5 * 82);
      vTxt.textContent = v.toFixed(2);
      const f = v * 12.0;          // 示意换算
      const U = 40 + v / 2.5 * 340;
      const T = running && v < vmax ? 1.35 : 1.0;
      /* 运行状态四态判定（D-04）：
       * 停止 = 运行指令已撤销且 v≈0；减速中 = v 正在下降（含目标速度下调后的降速段）；
       * 加速中 = 有运行指令且 v 未达给定；匀速 = 有运行指令且 v≈给定。 */
      const dv = v - vPrev; vPrev = v;
      const stRun = (!running && v < 0.01) ? '停止（制动器抱闸）'
        : (dv < -1e-4) ? '减速中（S 曲线后段 → 末端抱闸）'
          : (running && v < vmax - 0.01) ? '加速中（S 曲线前段）'
            : (running && Math.abs(v - vmax) <= 0.01) ? '匀速运行'
              : '减速中（S 曲线后段 → 末端抱闸）';
      ctx.readout([
        ['给定速度', `${vmax.toFixed(1)} m/s`],
        ['实际速度', `<b>${v.toFixed(2)} m/s</b>`],
        ['输出频率 f（示意）', `${f.toFixed(1)} Hz`],
        ['输出电压 U（示意）', `${U.toFixed(0)} V`],
        ['转矩指令 T', `${T.toFixed(2)} 倍额`],
        ['运行状态', `<b style="color:${stRun === '停止（制动器抱闸）' ? '#64748b' : (stRun.indexOf('减速') >= 0 ? '#b45309' : '#1d4ed8')}">${stRun}</b>`]
      ]);
    }
    paint(0.016);
    const stop = ticker(paint);
    return {
      destroy: stop,
      onchange(k, v2) { ctx.state[k] = v2; },
      onaction(k) {
        if (k === 'run') { running = true; ctx.logLine('启动：变频器输出按 S 曲线升速'); }
        if (k === 'stop') { running = false; ctx.logLine('停止：按 S 曲线减速，末端抱闸'); }
        if (k === 'reset') { v = 0; ang = 0; hist = []; running = false; ctx.logLine('复位'); }
      }
    };
  }
};

/* =======================================================================
 * 7. 电气控制系统仿真（平层控制）
 * ===================================================================== */
SIMS.control = {
  title: '电气控制系统 · 集选控制、召唤登记与检修手柄仿真',
  desc: '集选控制仿真：层站外呼与轿内内选统一登记，控制系统按"顺向截梯"自动定向、顺序应答，并支持检修点动与急停保护。所有操作可直接在示意图上进行：点按层站外呼盒与轿内操纵箱登记召唤，拨动检修手柄、按急停/公共/方向按钮，观察控制逻辑与轿厢响应。',
  notes: [
    '外呼规则：底层仅上行、顶层仅下行、中间层上下行（与电梯可运行方向一致）。',
    '集选控制：内选与外呼汇总为集选信号，自动定向并按"顺向截梯"顺序应答，到达最远后端站自动反向。',
    '检修运行（GB 7588）：进入检修即取消正常运行；先按下公共按钮保持，再按住上行/下行，轿厢以 0.50 m/s 点动，松开即停。',
    '急停与检修均可停止电梯并取消已登记召唤；只有两者都恢复正常后，轿厢若不在平层区，才以检修速度就近平层，平层开门后恢复集选运行。'
  ],
  photos: [
    { f: 'real-el-control-cabinet.jpg', cap: '电气控制柜·半剖视' },
    { f: 'real-control-cabinet-1.jpg', cap: '控制柜·板件分区' },
    { f: 'real-control-car-op-1.jpg', cap: '轿内操纵箱·按钮显示' },
    { f: 'real-control-hall-box-1.jpg', cap: '厅外呼梯盒·上下行钮' },
    { f: 'real-control-inspection-1.jpg', cap: '检修盒·急停点动钮' },
    { f: 'real-control-estop-1.jpg', cap: '急停按钮·蘑菇头自锁' }
  ],
  /* 交互全部内置在示意图（外呼盒 / 操纵箱 / 检修手柄可直接点击），无需面板按钮 */
  controls: [],
  mount(ctx) {
    const FY = { 1: 480, 2: 360, 3: 240, 4: 120 };
    const H = 3.0;                       // 层高 3 m（用于速度换算）
    const V_INSP = 0.50;                 // 检修速度（本仿真设定 0.50 m/s，GB 7588 要求 ≤0.63 m/s）
    const svg = makeSvg(ctx.stage, '0 0 780 660', `
      ${box(60, 60, 240, 480, '#f8fafc', '#cbd5e1', 2, 8)}
      ${txtEl(180, 82, '井　道', { size: 12, fill: '#94a3b8' })}
      ${[1, 2, 3, 4].map(f => line(60, FY[f], 300, FY[f], '#e2e8f0', 1.4, '7 6') +
        txtEl(54, FY[f] + 4, f + 'F', { anchor: 'end', size: 12, fill: '#94a3b8' })).join('')}
      ${txtEl(180, 570, '轿厢（1F~4F）', { size: 12, fill: '#475569' })}
      ${txtEl(345, 44, '层站外呼盒', { size: 11.5, fill: '#475569' })}
      ${box(420, 70, 170, 250, '#fff', '#cbd5e1', 1.6, 8)}
      ${txtEl(505, 92, '轿内操纵箱（内选）', { size: 11.5, fill: '#475569' })}
      ${box(440, 360, 320, 230, '#fff7ed', '#ea580c', 2, 8)}
      ${txtEl(600, 384, '轿顶检修手柄', { size: 12.5, fill: '#9a3412' })}
      ${box(60, 596, 300, 56, '#f1f5f9', '#cbd5e1', 1.4, 6)}
      ${txtEl(210, 616, '集选控制：内选 + 外呼 → 顺向截梯、顺序应答', { size: 11.5, fill: '#334155' })}
      ${txtEl(210, 638, '集选决策', { size: 11, fill: '#64748b' })}
    `, '电气控制系统仿真：呼梯登记、选层与检修急停');
    // 外呼盒：底层仅上行、顶层仅下行、中间层上下
    const hall = E('g', {});
    const hallDef = [
      { f: 1, keys: ['u'] }, { f: 2, keys: ['u', 'd'] }, { f: 3, keys: ['u', 'd'] }, { f: 4, keys: ['d'] }
    ];
    const hallEls = {};
    hallDef.forEach(({ f, keys }) => {
      const y = FY[f];
      const g = E('g', {});
      let s = box(310, y - 26, 74, 52, '#f1f5f9', '#94a3b8', 1.4, 6);
      keys.forEach(k => {
        const bx = keys.length === 1 ? 347 : (k === 'u' ? 324 : 370);
        s += `<circle id="hl-${f}${k}" cx="${bx}" cy="${k === 'u' ? y - 12 : y + 12}" r="11" fill="#e5e7eb" stroke="#64748b" stroke-width="1.6"/>`;
        s += `<text x="${bx}" y="${(k === 'u' ? y - 12 : y + 12) + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#475569" font-family="inherit">${k === 'u' ? '▲' : '▼'}</text>`;
      });
      g.innerHTML = s;
      hall.appendChild(g);
      keys.forEach(k => { hallEls[f + k] = g.querySelector('#hl-' + f + k); });
    });
    svg.appendChild(hall);
    // 轿内操纵箱：楼层显示 + 1F~4F 内选按钮
    const disp = E('text', { x: 505, y: 128, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: '#1d4ed8', 'font-family': 'inherit' });
    svg.appendChild(disp);
    const dirT = E('text', { x: 505, y: 156, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#059669', 'font-family': 'inherit' });
    svg.appendChild(dirT);
    const cabBtns = {};
    [1, 2, 3, 4].forEach(f => {
      const g = E('g', {});
      g.innerHTML = `<circle id="cb-${f}" cx="${455 + (f - 1) * 34}" cy="200" r="14" fill="#e5e7eb" stroke="#64748b" stroke-width="1.6"/>
        <text x="${455 + (f - 1) * 34}" y="205" text-anchor="middle" font-size="11.5" font-weight="800" fill="#475569" font-family="inherit">${f}</text>`;
      svg.appendChild(g);
      cabBtns[f] = g.querySelector('#cb-' + f);
    });
    const cabT = E('text', { x: 505, y: 240, 'text-anchor': 'middle', 'font-size': 11.5, fill: '#64748b', 'font-family': 'inherit' });
    svg.appendChild(cabT);
    const regT = E('text', { x: 505, y: 262, 'text-anchor': 'middle', 'font-size': 11.5, fill: '#b45309', 'font-family': 'inherit' });
    svg.appendChild(regT);
    // 检修手柄图形
    const handle = E('g', {});
    handle.innerHTML = `
      <rect id="sw-knob" x="466" y="404" width="44" height="44" rx="22" fill="#e5e7eb" stroke="#64748b" stroke-width="2"/>
      <line id="sw-ptr" x1="488" y1="426" x2="488" y2="404" stroke="#1e3a8a" stroke-width="4" stroke-linecap="round"/>
      <text x="488" y="470" text-anchor="middle" font-size="11.5" font-weight="700" fill="#334155" font-family="inherit">检修/正常</text>
      <text id="sw-txt" x="488" y="486" text-anchor="middle" font-size="11" font-weight="800" fill="#059669" font-family="inherit">正常</text>
      <circle id="es-btn" cx="592" cy="412" r="20" fill="#fee2e2" stroke="#dc2626" stroke-width="2.4"/>
      <text x="592" y="417" text-anchor="middle" font-size="11.5" font-weight="800" fill="#b91c1c" font-family="inherit">急停</text>
      <text id="es-txt" x="592" y="450" text-anchor="middle" font-size="11" font-weight="700" fill="#059669" font-family="inherit">正常</text>
      <text x="592" y="466" text-anchor="middle" font-size="11" fill="#64748b" font-family="inherit">须人工复位</text>
      <circle id="btn-com" cx="680" cy="412" r="18" fill="#e5e7eb" stroke="#64748b" stroke-width="2"/>
      <text x="680" y="417" text-anchor="middle" font-size="11" font-weight="800" fill="#475569" font-family="inherit">公共</text>
      <text id="com-txt" x="680" y="446" text-anchor="middle" font-size="11" fill="#64748b" font-family="inherit">未保持</text>
      <circle id="btn-up" cx="500" cy="530" r="18" fill="#e5e7eb" stroke="#64748b" stroke-width="2"/>
      <text x="500" y="535" text-anchor="middle" font-size="12" font-weight="800" fill="#475569" font-family="inherit">▲</text>
      <circle id="btn-dn" cx="560" cy="530" r="18" fill="#e5e7eb" stroke="#64748b" stroke-width="2"/>
      <text x="560" y="535" text-anchor="middle" font-size="12" font-weight="800" fill="#475569" font-family="inherit">▼</text>
      <text x="652" y="534" text-anchor="middle" font-size="11" fill="#64748b" font-family="inherit">先按公共并保持，再按住方向</text>
      <text x="530" y="562" text-anchor="middle" font-size="11" fill="#9a3412" font-family="inherit">检修速度 0.50 m/s（GB 7588 要求 ≤0.63 m/s）</text>
    `;
    svg.appendChild(handle);
    const swKnob = handle.querySelector('#sw-knob'), swPtr = handle.querySelector('#sw-ptr'), swTxt = handle.querySelector('#sw-txt');
    const esBtn = handle.querySelector('#es-btn'), esTxt = handle.querySelector('#es-txt');
    const btnCom = handle.querySelector('#btn-com'), comTxt = handle.querySelector('#com-txt');
    const btnUp = handle.querySelector('#btn-up'), btnDn = handle.querySelector('#btn-dn');
    // 轿厢
    const car = E('g', {});
    car.innerHTML = `${box(110, -30, 140, 60, C.car, C.carS, 2.4, 5)}${txtEl(180, 4, '轿厢', { size: 14, fill: '#1e3a8a' })}`;
    svg.appendChild(car);
    const doorL = E('g', {}), doorR = E('g', {});
    doorL.innerHTML = box(110, -30, 66, 60, '#e0f2fe', '#0e7490', 2, 4);
    doorR.innerHTML = box(184, -30, 66, 60, '#e0f2fe', '#0e7490', 2, 4);
    svg.appendChild(doorL); svg.appendChild(doorR);
    const decT = E('text', { x: 210, y: 660, 'text-anchor': 'middle', 'font-size': 12, fill: '#1d4ed8', 'font-family': 'inherit' });
    svg.appendChild(decT);

    // ===== 状态 =====
    let pos = 1, dirn = 0, state = 'idle', target = null, v = 0, doorR2 = 0, dwell = 0, leveling = 0;
    const carCalls = { 1: false, 2: false, 3: false, 4: false };
    const hallU = { 1: false, 2: false, 3: false, 4: false };
    const hallD = { 1: false, 2: false, 3: false, 4: false };
    ctx.state.inspMode = false; ctx.state.estop = false;
    let comLatch = false, holdUp = false, holdDn = false;
    let rescueTo = null, rescueNote = '';
    const planV = makePlanner(1.2, 3.0);
    const lev = f => Math.abs(pos - f) < 0.02;

    function hallAny(f) { return hallU[f] || hallD[f]; }
    function anyCall() { return [1, 2, 3, 4].some(f => carCalls[f] || hallAny(f)); }
    function callsAbove(p) { return [1, 2, 3, 4].filter(f => f > p + 0.02 && (carCalls[f] || hallAny(f))); }
    function callsBelow(p) { return [1, 2, 3, 4].filter(f => f < p - 0.02 && (carCalls[f] || hallAny(f))); }
    /* 集选控制：内选 + 外呼汇总 → 顺向截梯、自动定向、顺序应答 */
    function choose() {
      const p = pos, here = Math.round(p);
      if (dirn === 1) {
        const up = callsAbove(p);
        if (up.length) {
          const stop = up.find(f => carCalls[f] || hallU[f]);            // 顺向最近的停靠点
          const extreme = up[up.length - 1];                              // 该方向最远端
          return { floor: (stop !== undefined ? stop : extreme), dir: 1 };
        }
        if (carCalls[here] || hallAny(here)) return { floor: here, dir: 0 };
        const dn = callsBelow(p);
        if (dn.length) return { floor: dn[dn.length - 1], dir: -1 };
        return null;
      }
      if (dirn === -1) {
        const dn = callsBelow(p).sort((a, b) => b - a);                   // 由近及远
        if (dn.length) {
          const stop = dn.find(f => carCalls[f] || hallD[f]);
          const extreme = dn[dn.length - 1];                              // 最低端
          return { floor: (stop !== undefined ? stop : extreme), dir: -1 };
        }
        if (carCalls[here] || hallAny(here)) return { floor: here, dir: 0 };
        const up = callsAbove(p);
        if (up.length) return { floor: up[0], dir: 1 };
        return null;
      }
      // 定向：先由最近召唤确定运行方向，再按该方向的顺向截梯规则选目标
      let nearest = null, bd = 1e9;
      [1, 2, 3, 4].forEach(f => {
        if (carCalls[f] || hallAny(f)) { const d = Math.abs(f - p); if (d < bd) { bd = d; nearest = f; } }
      });
      if (nearest === null) return null;
      if (Math.abs(nearest - p) < 0.02) return { floor: nearest, dir: 0 };
      if (nearest > p) {
        const up = callsAbove(p);
        const stop = up.find(f => carCalls[f] || hallU[f]);
        return { floor: (stop !== undefined ? stop : up[up.length - 1]), dir: 1 };
      }
      const dn = callsBelow(p).sort((a, b) => b - a);
      const stop = dn.find(f => carCalls[f] || hallD[f]);
      return { floor: (stop !== undefined ? stop : dn[dn.length - 1]), dir: -1 };
    }
    function clearAt(f) {
      carCalls[f] = false;
      if (dirn === 1) { hallU[f] = false; if (!callsAbove(f).length) hallD[f] = false; }
      else if (dirn === -1) { hallD[f] = false; if (!callsBelow(f).length) hallU[f] = false; }
      else { hallU[f] = false; hallD[f] = false; }
    }
    function offLevel() { return Math.abs(pos - Math.round(pos)) > 0.02; }
    function startRescue(note) {
      rescueTo = Math.round(pos);
      if (Math.abs(pos - rescueTo) < 0.02) rescueTo = null;
      rescueNote = note;
      if (rescueTo !== null) { state = 'rescue'; dirn = rescueTo > pos ? 1 : -1; }
    }
    /* 就近平层仅在急停与检修都已恢复（两者均不在动作状态）时执行；
     * 任一仍动作 → 只提示等待，不自动移动轿厢 */
    function tryRestore(src) {
      if (ctx.state.estop || ctx.state.inspMode) {
        const other = ctx.state.estop ? '急停仍按下' : '仍在检修状态';
        ctx.logLine(src + '：' + other + '，暂不恢复运行；待急停与检修均恢复正常后再就近平层');
        return;
      }
      if (offLevel()) { startRescue(src + '：轿厢不在平层区，以检修速度就近平层'); ctx.logLine(rescueNote + ' → ' + rescueTo + 'F'); }
      else ctx.logLine(src + '：轿厢已在平层区，恢复运行控制');
    }
    function addCarCall(f) {
      if (ctx.state.inspMode) { ctx.logLine('检修状态：正常运行控制已被取消，内选不登记'); return; }
      if (ctx.state.estop) { ctx.logLine('急停已按下：电梯停止，无法登记召唤'); return; }
      if (carCalls[f]) return;
      carCalls[f] = true; ctx.logLine(`登记轿内内选：${f}F`);
    }
    function toggleHall(f, d) {
      if (ctx.state.inspMode) { ctx.logLine('检修状态：正常运行控制已被取消，外呼不登记'); return; }
      if (ctx.state.estop) { ctx.logLine('急停已按下：电梯停止，无法登记召唤'); return; }
      const key = d === 'u' ? hallU : hallD;
      key[f] = !key[f];
      if (key[f]) ctx.logLine(`登记 ${f}F ${d === 'u' ? '上行' : '下行'}外呼`);
      else ctx.logLine(`取消 ${f}F ${d === 'u' ? '上行' : '下行'}外呼登记`);
    }

    function paint() {
      const yy = FY[1] + (pos - 1) * (FY[4] - FY[1]) / 3;
      car.setAttribute('transform', `translate(0,${yy})`);
      const open = doorR2 * 30;
      doorL.setAttribute('transform', `translate(${-open},${yy})`);
      doorR.setAttribute('transform', `translate(${open},${yy})`);
      disp.textContent = `${Math.round(pos)}F`;
      dirT.textContent = dirn > 0 ? '▲ 上行' : dirn < 0 ? '▼ 下行' : '● 停止';
      dirT.setAttribute('fill', dirn > 0 ? '#059669' : dirn < 0 ? '#dc2626' : '#64748b');
      // 外呼灯：仅反映本层站外呼登记
      Object.keys(hallEls).forEach(k => {
        const f = parseInt(k[0], 10), d = k[1];
        hallEls[k].setAttribute('fill', (d === 'u' ? hallU[f] : hallD[f]) ? '#fde047' : '#e5e7eb');
      });
      // 内选灯：仅反映轿内内选（外呼不在此显示）
      [1, 2, 3, 4].forEach(f => cabBtns[f].setAttribute('fill', carCalls[f] ? '#fde047' : '#e5e7eb'));
      cabT.textContent = '内选指令 1F~4F（仅显示轿内登记）';
      const reg = [];
      [1, 2, 3, 4].forEach(f => { if (carCalls[f]) reg.push('内' + f); });
      [1, 2, 3, 4].forEach(f => { if (hallU[f]) reg.push(f + '▲'); if (hallD[f]) reg.push(f + '▼'); });
      regT.textContent = reg.length ? '已登记：' + reg.join(' ') : '无登记召唤';
      // 手柄状态
      swKnob.setAttribute('fill', ctx.state.inspMode ? '#fed7aa' : '#e5e7eb');
      swPtr.setAttribute('transform', ctx.state.inspMode ? 'rotate(140 488 426)' : 'rotate(0 488 426)');
      swTxt.textContent = ctx.state.inspMode ? '检修' : '正常';
      swTxt.setAttribute('fill', ctx.state.inspMode ? '#b45309' : '#059669');
      esBtn.setAttribute('fill', ctx.state.estop ? '#dc2626' : '#fee2e2');
      esTxt.textContent = ctx.state.estop ? '已按下（停止）' : '正常';
      esTxt.setAttribute('fill', ctx.state.estop ? '#dc2626' : '#059669');
      btnCom.setAttribute('fill', comLatch ? '#86efac' : '#e5e7eb');
      comTxt.textContent = comLatch ? '信号保持中' : '未保持';
      comTxt.setAttribute('fill', comLatch ? '#059669' : '#64748b');
      btnUp.setAttribute('fill', holdUp ? '#86efac' : '#e5e7eb');
      btnDn.setAttribute('fill', holdDn ? '#86efac' : '#e5e7eb');
      const cond = ctx.state.inspMode && !ctx.state.estop && comLatch && (holdUp || holdDn);
      decT.textContent = ctx.state.estop ? '⛔ 急停已按下：电梯停止，须人工复位'
        : ctx.state.inspMode ? (state === 'rescue' ? '检修状态：就近平层已暂停，切回正常后继续'
          : (cond ? '检修点动运行（0.50 m/s）' : '检修状态：先按【公共】并保持，再按【上行/下行】'))
          : (state === 'rescue' ? '救援运行：以检修速度 ' + V_INSP.toFixed(2) + ' m/s 就近平层 → ' + rescueTo + 'F'
            : (target ? `集选应答：前往 ${target}F（顺向截梯）` : (anyCall() ? '集选待命' : '无召唤，轿厢待机')));
      decT.setAttribute('fill', ctx.state.estop ? '#dc2626' : ((ctx.state.inspMode || state === 'rescue') ? '#b45309' : '#1d4ed8'));
      const err = Math.abs(pos - Math.round(pos)) * 1000;
      ctx.readout([
        ['当前楼层', `<b>${Math.round(pos)}F</b>（${pos.toFixed(3)}）`],
        ['运行方向', dirn > 0 ? '上行' : dirn < 0 ? '下行' : '停止'],
        ['当前速度', `<b style="color:${(ctx.state.inspMode || state === 'rescue') && v > V_INSP + 0.01 ? '#dc2626' : '#1d4ed8'}">${v.toFixed(2)} m/s</b>${ctx.state.inspMode || state === 'rescue' ? `（检修速度 ${V_INSP.toFixed(2)}）` : ''}`],
        ['平层误差', `${(Math.abs(pos - Math.round(pos)) < 0.02 ? 0 : err).toFixed(0)} mm`],
        ['目标楼层', state === 'rescue' ? `<b style="color:#b45309">${rescueTo}F（救援平层）</b>` : (target ? target + 'F' : '—')],
        ['门状态', doorR2 > 0.02 ? '开启中' : '关闭（门锁闭合）'],
        ['运行模式', ctx.state.inspMode ? '<b style="color:#b45309">检修（点动）</b>' : (state === 'rescue' ? '<b style="color:#b45309">救援平层</b>' : '正常（集选）')],
        ['急停开关', ctx.state.estop ? '<b style="color:#dc2626">已按下（停止）</b>' : '正常'],
        ['公共按钮（保持）', comLatch ? '<b style="color:#059669">信号保持中</b>' : '未保持'],
        ['检修按钮时序', ctx.state.inspMode ? (comLatch ? (holdUp || holdDn ? '<b style="color:#059669">公共保持 + 方向 → 运行</b>' : '已保持公共，待按方向') : '<b style="color:#dc2626">未按公共按钮 → 不运行</b>') : '—'],
        ['内选登记（轿内）', [1, 2, 3, 4].filter(f => carCalls[f]).map(f => f + 'F').join('、') || '—'],
        ['外呼登记（层站）', (() => { const a = []; [1, 2, 3, 4].forEach(f => { if (hallU[f]) a.push(f + 'F▲'); if (hallD[f]) a.push(f + 'F▼'); }); return a.join('、') || '—'; })()],
        ['系统状态', { idle: '待机', move: '运行中', level: '平层校正', dooropen: '开门', dwell: '保持开门', doorclose: '关门', jog: '检修点动', rescue: '救援就近平层' }[state] || state]
      ]);
    }
    paint();
    const stop = ticker(dt => {
      const insp = ctx.state.inspMode;
      if (ctx.state.estop) {
        v = 0;
      } else if (state === 'rescue') {
        if (ctx.state.inspMode) { v = 0; }   // 检修介入：暂停就近平层，切回正常后继续
        else {
          // 救援：只能以检修速度就近平层
          const d = Math.sign(rescueTo - pos);
          v = Math.min(V_INSP, v + 1.0 * dt);
          pos += d * v / H * dt;
          dirn = d;
          if ((d > 0 && pos >= rescueTo) || (d < 0 && pos <= rescueTo)) { pos = rescueTo; v = 0; state = 'level'; leveling = 0; }
        }
      } else if (insp) {
        if (comLatch && (holdUp || holdDn)) {
          const d = holdUp ? 1 : -1;
          v = Math.min(V_INSP, v + 1.2 * dt);
          pos += d * v / H * dt;
          if (pos > 4) { pos = 4; v = 0; }
          if (pos < 1) { pos = 1; v = 0; }
          dirn = d; state = 'jog';
        } else { v = 0; dirn = 0; if (state === 'jog') state = 'idle'; }
      } else {
        const vmax = 1.6, acc = 1.2;
        if (state === 'idle') {
          const c = choose();
          if (c) {
            if (c.dir === 0) { v = 0; dirn = 0; state = 'dooropen'; doorR2 = 0; target = c.floor; ctx.logLine(`本层召唤：直接开门应答 ${c.floor}F`); }
            else { target = c.floor; dirn = c.dir; state = 'move'; ctx.logLine(`集选控制：方向 ${c.dir > 0 ? '上行' : '下行'}，下一应答 ${c.floor}F`); }
          }
        } else if (state === 'move') {
          // 运行中若有同向更近的召唤（顺向截梯），动态插入为下一应答层
          const c2 = choose();
          if (c2 && c2.dir === dirn && ((dirn > 0 && c2.floor < target) || (dirn < 0 && c2.floor > target))) {
            target = c2.floor; ctx.logLine(`顺向截梯：插入同向更近的 ${c2.floor}F 为下一应答层`);
          }
          const d = target - pos;
          dirn = Math.sign(d);
          if (Math.abs(d) < 0.02) { v = 0; pos = target; state = 'level'; leveling = 0; }
          else {
            const vSafe = Math.sqrt(2 * acc * Math.abs(d) * 0.9);
            v = Math.max(0, planV(v, Math.min(vmax, vSafe), dt));
            pos += dirn * v / H * dt;
            if ((dirn > 0 && pos > target) || (dirn < 0 && pos < target)) pos = target;
          }
        } else if (state === 'level') {
          leveling += dt;
          if (leveling > 0.9) { v = 0; state = 'dooropen'; doorR2 = 0; ctx.logLine('平层完成，编码器 + 平层感应器双重确认'); }
        } else if (state === 'dooropen') {
          doorR2 = Math.min(1, doorR2 + dt * 1.1);
          if (doorR2 >= 1) { dwell = 2.4; state = 'dwell'; const f = Math.round(pos); clearAt(f); ctx.logLine(`${f}F 开门到位，清除该层内选与本方向外呼`); }
        } else if (state === 'dwell') {
          dwell -= dt;
          if (dwell <= 0) { state = 'doorclose'; ctx.logLine('延时结束，执行关门'); }
        } else if (state === 'doorclose') {
          doorR2 = Math.max(0, doorR2 - dt * 1.4);
          if (doorR2 <= 0) {
            const done = Math.round(pos);
            if (rescueNote) { ctx.logLine(rescueNote + '：就近平层完成，恢复正常运行控制'); rescueNote = ''; }
            target = null;
            if (!anyCall()) dirn = 0;
            state = 'idle'; ctx.logLine('门锁闭合，安全回路接通');
            if (done === 1 || done === 4) dirn = done === 1 ? 1 : -1;   // 端站自动定向
          }
        }
      }
      paint();
    });
    /* 动作分发：面板按钮（若有）与示意图内控件共用 */
    function doAction(k) {
      const cm = /^c([1-4])$/.exec(k);
      if (cm) { addCarCall(parseInt(cm[1], 10)); return; }
      const hm = /^h([1-4])([ud])$/.exec(k);
      if (hm) { toggleHall(parseInt(hm[1], 10), hm[2]); return; }
      if (k === 'sw') {
        ctx.state.inspMode = !ctx.state.inspMode;
        if (ctx.state.inspMode) {
          [1, 2, 3, 4].forEach(f => { carCalls[f] = false; hallU[f] = false; hallD[f] = false; });
          target = null; dirn = 0; v = 0; state = 'idle'; comLatch = false;
          ctx.logLine('转换开关切至【检修】：取消正常运行控制与全部召唤，进入点动检修（0.50 m/s）');
        } else {
          comLatch = false;
          tryRestore('检修转正常');
        }
        return;
      }
      if (k === 'estop') {
        ctx.state.estop = !ctx.state.estop;
        if (ctx.state.estop) {
          // 急停：立即停止 + 取消全部召唤登记（安全回路断开，控制系统失电）
          v = 0; comLatch = false; holdUp = false; holdDn = false;
          [1, 2, 3, 4].forEach(f => { carCalls[f] = false; hallU[f] = false; hallD[f] = false; });
          target = null; dirn = 0; state = 'idle'; doorR2 = 0; dwell = 0;
          ctx.logLine('⛔ 急停按下：电梯立即停止，取消全部呼梯登记（须人工复位）');
        }
        else {
          tryRestore('急停复位');
        }
        return;
      }
      if (k === 'com') {
        // 公共按钮：按下后保持信号（再按一次解除）
        comLatch = !comLatch;
        if (!ctx.state.inspMode) ctx.logLine('提示：公共按钮仅在检修状态有效');
        else ctx.logLine(comLatch ? '公共按钮：信号保持（须再按住上行/下行方可点动运行）' : '公共按钮：信号解除，检修运行停止');
        return;
      }
      if (k === 'up:down') { holdUp = true; if (ctx.state.inspMode && !comLatch) ctx.logLine('防误操作：未先按下【公共】按钮并保持，上行无效'); return; }
      if (k === 'up:up') { holdUp = false; return; }
      if (k === 'dn:down') { holdDn = true; if (ctx.state.inspMode && !comLatch) ctx.logLine('防误操作：未先按下【公共】按钮并保持，下行无效'); return; }
      if (k === 'dn:up') { holdDn = false; return; }
    }
    /* 示意图内控件直接可操作：按钮与井道/轿厢同页可见，便于操作和理解；
     * 透明热区扩大触控范围（触屏友好），pointer-events=all 保证可点中 */
    const hot = (el, fn, r, key) => {
      if (!el) return;
      el.style.cursor = 'pointer';
      let hit;
      if (el.getAttribute('cx')) hit = E('circle', { cx: el.getAttribute('cx'), cy: el.getAttribute('cy'), r: r || 22, fill: 'transparent', 'pointer-events': 'all' });
      else {
        const x = +el.getAttribute('x'), y = +el.getAttribute('y'), w = +el.getAttribute('width'), h = +el.getAttribute('height');
        hit = E('rect', { x: x - 8, y: y - 8, width: w + 16, height: h + 16, fill: 'transparent', 'pointer-events': 'all' });
      }
      if (key) hit.setAttribute('data-hot', key);
      hit.style.cursor = 'pointer';
      el.parentNode.appendChild(hit);
      hit.addEventListener('click', fn);
    };
    const hotHold = (el, key) => {
      if (!el) return;
      el.style.cursor = 'pointer';
      const hit = E('circle', { cx: el.getAttribute('cx'), cy: el.getAttribute('cy'), r: 24, fill: 'transparent', 'pointer-events': 'all' });
      hit.setAttribute('data-hot', key);
      hit.style.cursor = 'pointer';
      el.parentNode.appendChild(hit);
      const dn = e => { e.preventDefault(); doAction(key + ':down'); };
      const up = () => doAction(key + ':up');
      hit.addEventListener('pointerdown', dn);
      hit.addEventListener('pointerup', up);
      hit.addEventListener('pointerleave', up);
      hit.addEventListener('pointercancel', up);
      hit.addEventListener('touchstart', dn, { passive: false });
      hit.addEventListener('touchend', up);
      hit.addEventListener('touchcancel', up);
    };
    Object.keys(hallEls).forEach(k => {
      const f = parseInt(k[0], 10), d = k[1];
      hot(hallEls[k], () => toggleHall(f, d), 22, 'h-' + f + d);
    });
    [1, 2, 3, 4].forEach(f => hot(cabBtns[f], () => addCarCall(f), 16, 'cb-' + f));
    hot(swKnob, () => doAction('sw'), 0, 'sw');
    hot(esBtn, () => doAction('estop'), 24, 'estop');
    hot(btnCom, () => doAction('com'), 24, 'com');
    hotHold(btnUp, 'up');
    hotHold(btnDn, 'dn');
    return {
      destroy: stop,
      onchange(k, v2) { ctx.state[k] = v2; },
      onaction(k) { doAction(k); }
    };
  }
};

/* =======================================================================
 * 8. 安全保护系统仿真
 * ===================================================================== */
SIMS.safety = {
  title: '安全保护系统 · 限速器—安全钳联动、缓冲器与端站保护仿真',
  desc: '模拟正常下行/上行、失控超速与安全钳失效三种工况：限速器绳呈闭合环并随轿厢速度转动，限速器与张紧装置两轮同步旋转；超速自轿厢当前位置开始下滑，达 115% 时限速器先电气动作、再机械夹绳，轿厢借惯性再下行一小段后提拉安全钳楔块夹紧导轨制停；安全钳失效时轿厢由缓冲器作最后一道保护并停在缓冲器上（体现压缩）；下端站三级开关与上端站对称布置（下极限贴近缓冲器上方），正常运行时动作后轿厢减速停靠在该方向极限位置并锁定，失控超速时仅给出信号、不干预运行。',
  notes: [
    '限速器—安全钳是机械联动闭环：限速器绳绕经限速器轮与底坑张紧轮形成闭合环，环上一点与轿厢安全钳提拉机构连接并随轿厢运动；故绳速 = 轿厢速度，限速器轮与张紧轮同步转动。',
    '超速约 5% 时限速器电气开关先动作，切断安全回路使制动器抱闸；若仍未制停且达 115% 额定速度，限速器机械动作夹住限速器绳——绳被制停而轿厢继续下行，二者产生相对运动，绳通过连接点提拉安全钳操纵杆，楔块楔入夹紧导轨制停。',
    '安全钳失效时轿厢继续下坠，最后由缓冲器吸收能量（耗能型行程 ≥0.0674v²，蓄能型 0.135v² 且 ≥65 mm，适用于 v≤1.0 m/s；设计平均减速度 ≤1g）。缓冲器是最后一道保护，不能替代安全钳。',
    '端站保护三级：强迫减速开关（端站前强制减速）→ 限位开关（停止该方向运行）→ 极限开关（切断安全回路）。开关按端站对称布置：上端站以轿顶为基准、下端站以轿底为基准，下极限开关位于缓冲器正上方约 0.2 m 处，先于轿厢接触缓冲器动作；正常运行时各级开关动作后轿厢减速并停靠在该方向极限位置，随后锁定。',
    '点按「旁路限位开关」可演示限位失效场景（教学演示用）：旁路后限位开关仅给出信号，轿厢越过限位停靠位继续运行，直至极限开关动作切断安全回路。',
    '失控超速时下端站保护开关仅给出信号（指示灯与读数反馈），不干预轿厢运行——超速工况由限速器—安全钳与缓冲器逐级接管。',
    '轿厢每侧设上、下两个导靴共 4 个，安全钳安装在下导靴的上方。'
  ],
  photos: [
    { f: 'real-el-safety-governor.jpg', cap: '超速保护装置·限速器' },
    { f: 'real-el-safety-clamp.jpg', cap: '限速器安全钳·联动' },
    { f: 'real-el-safety-buffer.jpg', cap: '缓冲器·弹簧与油压' },
    { f: 'real-el-safety-limit.jpg', cap: '端站保护开关组' },
    { f: 'real-safety-governor-1.jpg', cap: '限速器·抛块夹绳钳' },
    { f: 'real-safety-clamp-1.jpg', cap: '安全钳·楔块连杆' },
    { f: 'real-safety-buffer-1.jpg', cap: '油压缓冲器·油缸柱塞' },
    { f: 'real-safety-buffer-2.jpg', cap: '弹簧缓冲器·螺旋弹簧' },
    { f: 'real-safety-limit-1.jpg', cap: '端站三级保护开关' },
    { f: 'real-safety-door-contact-1.jpg', cap: '门联锁触点·银触头' }
  ],
  controls: [
    { key: 'vrated', type: 'range', label: '额定速度', min: 0.5, max: 2.5, step: 0.1, value: 1.5, unit: ' m/s' },
    { type: 'buttons', items: [
      { key: 'normal', label: '下行运行', cls: 'ok' }, { key: 'uprun', label: '上行运行', cls: 'ok' },
      { key: 'fault', label: '失控超速', cls: 'dang' }, { key: 'gearfail', label: '安全钳失效', cls: 'dang' }
    ] },
    { type: 'buttons', items: [
      { key: 'bypass', label: '旁路限位开关', cls: 'dang', tip: '教学演示用：旁路后限位开关仅给出信号，轿厢越过限位停靠位继续运行，直至极限开关动作切断安全回路' },
      { key: 'reset', label: '复位', cls: 'ghost' }
    ] }
  ],
  mount(ctx) {
    const PX = 38;                       // 1 m ≈ 38 px
    const G = 9.8;
    const CAR_H = 120;                   // 轿厢高度（示意）
    const Y_TOP = 150, Y_BUF = 450;      // 轿厢上极限停靠位（轿顶）/ 轿厢接触缓冲器位（轿顶）
    const Y_FLOOR = Y_BUF + CAR_H;       // 轿底接触缓冲器位（下端站开关以轿底为基准，与上端站以轿顶为基准对称）
    const Y_STOP_DN = 418, Y_STOP_UP = 182;        // 限位开关动作后的停靠位（下/上）
    const Y_STOP_DN_E = 435, Y_STOP_UP_E = 165;    // 极限开关动作后的停靠位（下/上；限位被旁路时）
    const BUF_H = 60, BUF_S = 40;        // 缓冲器全高 / 最大压缩行程（示意放大）
    const svg = makeSvg(ctx.stage, '0 0 780 700', `
      ${box(170, 20, 240, 120, '#fee2e2', '#dc2626', 2, 8)}
      ${txtEl(240, 42, '机房 · 限速器', { size: 12, fill: '#b91c1c' })}
      ${box(198, 140, 82, 520, '#f8fafc', '#cbd5e1', 1.4, 4)}
      ${txtEl(239, 156, '限速器绳', { size: 11, fill: '#94a3b8' })}
      ${box(280, 140, 250, 490, '#f8fafc', '#cbd5e1', 2, 8)}
      ${txtEl(405, 160, '井　道', { size: 12, fill: '#94a3b8' })}
      ${box(288, 150, 12, 470, C.rail, C.railS, 1.4, 3)}
      ${box(500, 150, 12, 470, C.rail, C.railS, 1.4, 3)}
      ${txtEl(294, 144, '轿厢导轨', { anchor: 'start', size: 11, fill: '#64748b' })}
      ${box(280, 630, 250, 50, '#f1f5f9', '#94a3b8', 1.6, 4)}
      ${txtEl(405, 660, '底坑地坪', { size: 12, fill: '#57534e' })}
      ${box(540, 140, 230, 490, '#fffbeb', '#fbbf24', 1.6, 8)}
      ${txtEl(655, 150, '端站保护开关（三级）· 下极限贴近缓冲器上方', { size: 12, fill: '#b45309' })}
    `, '安全保护系统仿真：限速器、安全钳与缓冲器联动');
    // 端站保护开关（强迫减速 → 限位 → 极限）；上端站以轿顶 y 为基准、下端站以轿底 y+CAR_H 为基准，位置对称
    const SW = [
      { id: 'upF', y: Y_TOP + 75, t: '上强迫减速开关' },
      { id: 'upL', y: Y_TOP + 45, t: '上限位开关·停止上行' },
      { id: 'upE', y: Y_TOP + 15, t: '上极限开关·切断安全回路' },
      { id: 'dnF', y: Y_FLOOR - 75, t: '下强迫减速开关' },
      { id: 'dnL', y: Y_FLOOR - 45, t: '下限位开关·停止下行' },
      { id: 'dnE', y: Y_FLOOR - 15, t: '下极限开关·切断安全回路' }
    ];
    const swEls = {};
    SW.forEach(s => {
      const g = E('g', {});
      g.innerHTML = `${line(530, s.y, 570, s.y, '#94a3b8', 2)}
        <rect id="swr-${s.id}" x="570" y="${s.y - 13}" width="30" height="26" rx="5" fill="#e5e7eb" stroke="#64748b" stroke-width="1.8"/>
        <circle id="swl-${s.id}" cx="617" cy="${s.y}" r="8" fill="#e5e7eb" stroke="#64748b" stroke-width="1.6"/>
        ${txtEl(632, s.y + 4, s.t, { anchor: 'start', size: 11, fill: '#334155' })}`;
      svg.appendChild(g);
      swEls[s.id] = { rect: g.querySelector('#swr-' + s.id), led: g.querySelector('#swl-' + s.id) };
    });
    // 缓冲器（底坑，座于地坪 630）
    const bufG = E('g', {});
    svg.appendChild(bufG);
    const bufComp = E('g', {});
    svg.appendChild(bufComp);
    // 限速器轮（旋转）+ 张紧轮（旋转）
    const gov = E('g', { id: 'gov' });
    gov.innerHTML = `<circle cx="240" cy="85" r="30" fill="#fff" stroke="#dc2626" stroke-width="2.6"/>
      <g class="gr">${Array.from({ length: 4 }, (_, i) => {
        const a = i * Math.PI / 2 + 0.5;
        return `<circle cx="${240 + 16 * Math.cos(a)}" cy="${85 + 16 * Math.sin(a)}" r="5" fill="#dc2626"/>`;
      }).join('')}<circle cx="240" cy="85" r="5" fill="#dc2626"/></g>`;
    svg.appendChild(gov);
    const grG = gov.querySelector('.gr');
    const ten = E('g', { id: 'ten' });
    ten.innerHTML = `<circle cx="240" cy="610" r="30" fill="#fff" stroke="#475569" stroke-width="2.6"/>
      <g class="tr">${Array.from({ length: 4 }, (_, i) => {
        const a = i * Math.PI / 2 + 0.5;
        return `<circle cx="${240 + 16 * Math.cos(a)}" cy="${610 + 16 * Math.sin(a)}" r="5" fill="#64748b"/>`;
      }).join('')}<circle cx="240" cy="610" r="5" fill="#475569"/></g>
      ${txtEl(240, 652, '底坑 · 张紧装置（张紧轮）', { size: 11, fill: '#475569' })}`;
    svg.appendChild(ten);
    const trG = ten.querySelector('.tr');
    // 限速器绳闭合环
    const ropeG = E('g', {});
    ropeG.innerHTML = `
      <path d="M 210 85 A 30 30 0 0 1 270 85" fill="none" stroke="#475569" stroke-width="2.4"/>
      <line x1="210" y1="85" x2="210" y2="610" stroke="#475569" stroke-width="2.4"/>
      <line x1="270" y1="85" x2="270" y2="610" stroke="#475569" stroke-width="2.4"/>
      <path d="M 210 610 A 30 30 0 0 0 270 610" fill="none" stroke="#475569" stroke-width="2.4"/>
    `;
    svg.appendChild(ropeG);
    // 绳—钳连接点（夹持在绳环右肢上）
    const clamp = E('g', { id: 'clamp' });
    clamp.innerHTML = `${box(262, -9, 16, 18, '#f59e0b', '#b45309', 1.6, 4)}
      ${txtEl(246, 4, '绳—钳连接点', { anchor: 'end', size: 11, fill: '#b45309' })}`;
    svg.appendChild(clamp);
    const rod = E('line', { id: 'rod', stroke: '#b45309', 'stroke-width': 3.4, 'stroke-linecap': 'round' });
    svg.appendChild(rod);
    // 轿厢（4 个导靴 + 安全钳位于下导靴上方 + 提拉机构）
    const car = E('g', { id: 'car-g' });
    car.innerHTML = `${box(0, 0, 200, 120, C.car, C.carS, 2.4, 5)}
      ${txtEl(108, 44, '轿　厢', { size: 15, fill: '#1e3a8a' })}
      <text id="cv" x="108" y="66" text-anchor="middle" font-size="12.5" font-weight="800" fill="#1d4ed8" font-family="inherit">v = 0.00 m/s</text>
      ${box(-14, 12, 14, 24, '#fcd34d', '#b45309', 1.6, 4)}
      ${box(200, 12, 14, 24, '#fcd34d', '#b45309', 1.6, 4)}
      ${box(-14, 96, 14, 24, '#fcd34d', '#b45309', 1.6, 4)}
      ${box(200, 96, 14, 24, '#fcd34d', '#b45309', 1.6, 4)}
      ${txtEl(12, 30, '上导靴', { anchor: 'start', size: 11, fill: '#b45309' })}
      ${txtEl(12, 114, '下导靴', { anchor: 'start', size: 11, fill: '#b45309' })}
      ${box(-16, 66, 16, 26, '#fee2e2', '#dc2626', 1.6, 4)}
      ${box(200, 66, 16, 26, '#fee2e2', '#dc2626', 1.6, 4)}
      ${txtEl(12, 84, '安全钳', { anchor: 'start', size: 11, fill: '#b91c1c' })}
      <g class="lift">
        <line x1="-10" y1="24" x2="-10" y2="72" stroke="#b45309" stroke-width="3.4" stroke-linecap="round"/>
        <line x1="-10" y1="72" x2="14" y2="78" stroke="#b45309" stroke-width="3.4" stroke-linecap="round"/>
        <polygon class="wg" points="-22,64 8,56 8,92 -22,84" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
        <polygon class="wg" points="222,56 192,64 192,84 222,92" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
      </g>`;
    svg.appendChild(car);
    const cvT = car.querySelector('#cv');
    const liftG = car.querySelector('.lift');
    const stateT = E('text', { x: 405, y: 26, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#1e3a8a', 'font-family': 'inherit' });
    svg.appendChild(stateT);
    const warnT = E('text', { x: 405, y: 46, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#b91c1c', 'font-family': 'inherit' });
    svg.appendChild(warnT);

    /* ===== 实物对照小图（v1.3.0 L4）=====
     * 落点：画布左条空闲区（x 8-158，机房/限速器绳左侧），不遮挡既有图形与标注 */
    const galG = E('g', {});
    const IMGS = [
      { f: 'real-safety-governor-1.jpg', n: '限速器', s: '超速 → 夹绳钳动作' },
      { f: 'real-safety-clamp-1.jpg', n: '安全钳', s: '楔块夹紧导轨' },
      { f: 'real-safety-buffer-1.jpg', n: '缓冲器', s: '压缩吸能 · 最后防线' }
    ];
    galG.innerHTML = txtEl(83, 66, '实物对照', { size: 11, fill: '#334155', weight: 800 }) +
      IMGS.map((g, i) => {
        const cx = 8, cy = 76 + i * 154;
        return box(cx, cy, 150, 140, '#f8fafc', '#e2e8f0', 1.4, 6) +
          `<image href="${assetImage(g.f)}" x="${cx + 4}" y="${cy + 4}" width="142" height="92" preserveAspectRatio="xMidYMid meet"/>` +
          txtEl(cx + 75, cy + 116, g.n, { size: 10, fill: '#334155', weight: 700 }) +
          txtEl(cx + 75, cy + 130, g.s, { size: 8.5, fill: '#64748b', weight: 500 });
      }).join('');
    svg.appendChild(galG);

    let y = Y_TOP, v = 0, mode = 'normal', ang = 0, angT = 0, brakeDist = 0;
    let govElec = false, govMech = false, gearActed = false, gearFail = false, bufHit = false, bufTravel = 0;
    let lift = 0, yClamp = null, vImpact = 0, yMech = 0, atLimit = false;
    const swOn = { upE: false, upL: false, upF: false, dnF: false, dnL: false, dnE: false };
    ctx.state.vrated = 1.5;
    function reset(startY) {
      y = (startY === undefined ? Y_TOP : startY); v = 0; brakeDist = 0; mode = 'normal'; ang = 0; angT = 0;
      govElec = govMech = gearActed = bufHit = false; bufTravel = 0; lift = 0; yClamp = null; vImpact = 0; yMech = 0; atLimit = false;
      Object.keys(swOn).forEach(k => swOn[k] = false);
      ctx.logLine('系统复位');
    }
    function bufStroke(vr) { return vr <= 1.0 ? Math.max(0.065, 0.135 * vr * vr) : 0.0674 * vr * vr; }   // m
    function paint() {
      const vr = ctx.state.vrated, thr = vr * 1.15;
      car.setAttribute('transform', `translate(300,${y.toFixed(1)})`);
      liftG.setAttribute('transform', `translate(0,${(-lift).toFixed(1)})`);
      Array.prototype.forEach.call(car.querySelectorAll('.wg'), w => {
        w.setAttribute('opacity', gearActed ? '1' : '0');
        w.setAttribute('fill', gearActed ? '#b91c1c' : '#dc2626');
      });
      const yc = (yClamp === null ? y + 20 : yClamp);
      clamp.setAttribute('transform', `translate(0,${yc.toFixed(1)})`);
      clamp.setAttribute('fill', govMech ? '#b45309' : '#b45309');
      rod.setAttribute('x1', 278); rod.setAttribute('y1', yc.toFixed(1));
      rod.setAttribute('x2', 292); rod.setAttribute('y2', (y + 24 - lift).toFixed(1));
      rod.setAttribute('stroke', gearActed ? '#dc2626' : '#b45309');
      cvT.textContent = `v = ${Math.abs(v).toFixed(2)} m/s（额定 ${vr.toFixed(1)}）`;
      cvT.setAttribute('fill', Math.abs(v) > thr ? '#dc2626' : (Math.abs(v) > vr * 1.05 ? '#b45309' : '#1d4ed8'));
      const gv = Math.min(1, Math.abs(v) / (vr * 1.6));
      grG.setAttribute('opacity', govMech ? '1' : (0.35 + gv * 0.65).toFixed(2));
      // 端站开关灯
      SW.forEach(s => {
        swEls[s.id].led.setAttribute('fill', swOn[s.id] ? '#ef4444' : '#e5e7eb');
        swEls[s.id].rect.setAttribute('fill', swOn[s.id] ? '#fee2e2' : '#e5e7eb');
      });
      // 缓冲器
      bufG.innerHTML = `${box(320, 630 - BUF_H, 44, BUF_H, '#dc2626', '#991b1b', 1.8, 4)}
        ${box(436, 630 - BUF_H, 44, BUF_H, '#dc2626', '#991b1b', 1.8, 4)}
        ${txtEl(342, 560, '缓冲器', { size: 11, fill: '#b91c1c' })}
        ${txtEl(458, 560, '缓冲器', { size: 11, fill: '#b91c1c' })}`;
      bufComp.innerHTML = bufTravel > 0 ? `${box(320, 630 - BUF_H + BUF_S * bufTravel, 44, BUF_H - BUF_S * bufTravel, '#fca5a5', '#991b1b', 1.6, 3)}
        ${box(436, 630 - BUF_H + BUF_S * bufTravel, 44, BUF_H - BUF_S * bufTravel, '#fca5a5', '#991b1b', 1.6, 3)}` : '';
      const bs = bufStroke(vr);
      const aBuf = vImpact > 0 ? (vImpact * vImpact) / (2 * bs) : 0;
      stateT.textContent = bufHit ? '缓冲器介入：最后一道保护，吸收轿厢动能' :
        gearActed ? '安全钳已动作：楔块夹紧导轨，轿厢制停' :
          govMech ? '限速器机械动作：夹绳 → 提拉安全钳' :
            govElec ? '限速器电气开关动作：切断安全回路，制动器抱闸' :
              atLimit ? '端站保护停靠：轿厢已停在该方向极限位置' : '正常运行';
      stateT.setAttribute('fill', (bufHit || gearActed || govMech) ? '#dc2626' : (govElec ? '#b45309' : (atLimit ? '#0e7490' : '#059669')));
      warnT.textContent = bufHit ? `缓冲器压缩中：冲击速度 ${vImpact.toFixed(2)} m/s，平均减速度 ≈ ${(aBuf / G).toFixed(2)} g（设计 ≤1g）${aBuf / G > 1 ? ' ⚠ 超出设计值——安全钳必须先起作用' : ''}`
        : (gearActed ? `安全钳制动距离 ≈ ${brakeDist.toFixed(2)} m` : '');
      ctx.readout([
        ['额定速度', `${vr.toFixed(1)} m/s`],
        ['限速器动作值（115%）', `<b>${thr.toFixed(2)} m/s</b>`],
        ['轿厢当前速度', `<b style="color:${Math.abs(v) > thr ? '#dc2626' : '#059669'}">${Math.abs(v).toFixed(2)} m/s</b>`],
        ['限速器轮 / 张紧轮', '<b>随绳速同步转动</b>（绳速 = 轿厢速度）'],
        ['限速器（电气）', govElec ? '<b style="color:#dc2626">已动作：安全回路断开</b>' : '正常'],
        ['限速器（机械夹绳）', govMech ? '<b style="color:#dc2626">已夹绳 → 绳被制停，提拉安全钳</b>' : '未动作'],
        ['安全钳', gearActed ? '<b style="color:#dc2626">楔块楔入夹紧导轨</b>' : (gearFail ? '<b style="color:#dc2626">失效（模拟）</b>' : `松开（待命）`)],
        ['安全钳制动距离', gearActed ? `${brakeDist.toFixed(2)} m` : '—'],
        ['缓冲器类型 / 要求行程', `${vr <= 1.0 ? '蓄能型（可用）' : '耗能型'} / ${(bs * 1000).toFixed(0)} mm（${vr <= 1.0 ? '0.135v²' : '0.0674v²'}）`],
        ['缓冲器状态', bufHit ? `<b style="color:#dc2626">介入吸能（压缩 ${(bufTravel * bs * 1000).toFixed(0)} mm）</b>` : '待命'],
        ['上端站保护', `强迫减速 ${swOn.upF ? '✔' : '—'} / 限位 ${swOn.upL ? (ctx.state.bypassL ? '✔(旁路)' : '✔') : '—'} / 极限 ${swOn.upE ? '✔' : '—'}`],
        ['下端站保护', `强迫减速 ${swOn.dnF ? '✔' : '—'} / 限位 ${swOn.dnL ? (ctx.state.bypassL ? '✔(旁路)' : '✔') : '—'} / 极限 ${swOn.dnE ? '✔' : '—'}`],
        ['限位旁路', ctx.state.bypassL ? '<b style="color:#dc2626">已旁路（越限位继续运行）</b>' : '正常'],
        ['端站停靠状态', atLimit ? ((swOn.dnE || swOn.upE) ? '<b style="color:#0e7490">已停靠锁定（极限开关动作，安全回路切断）</b>' : '<b style="color:#0e7490">已停靠锁定（限位保护动作后锁定，不再运行）</b>') : '—'],
        ['轿厢—缓冲器间距', `${((Y_BUF - y) / PX).toFixed(2)} m（接触缓冲器前须先由极限开关保护）`],
        ['运行模式', mode === 'fault' ? '<b style="color:#dc2626">失控超速</b>' : (mode === 'uprun' ? '上行运行' : '下行运行')]
      ]);
    }
    /* sig=true（失控超速）：端站开关仅给出信号，不改变速度、不停靠
     * 上端站以轿顶 y 判定；下端站以轿底 y+CAR_H 判定（与开关安装位置一致，和上端站对称） */
    function fireDown(sig) {
      const yb = y + CAR_H;
      if (yb >= Y_FLOOR - 75 && !swOn.dnF) {
        swOn.dnF = true;
        if (sig) ctx.logLine('失控下行：下端站强迫减速开关动作（仅给出信号，不干预运行）');
        else { v = Math.min(v, 0.5); ctx.logLine('下端站强迫减速开关动作：强制减速至 ≤0.5 m/s'); }
      }
      if (yb >= Y_FLOOR - 45 && !swOn.dnL) {
        swOn.dnL = true;
        if (sig) { ctx.logLine('失控下行：下限位开关动作（仅给出信号，不干预运行）'); return null; }
        if (ctx.state.bypassL) { ctx.logLine('下限位开关动作：已被旁路——仅给出信号，轿厢继续下行（教学演示）'); return null; }
        ctx.logLine('下限位开关动作：停止向下运行（制动停靠，不得触及缓冲器）'); return 'stopdn';
      }
      if (yb >= Y_FLOOR - 15 && !swOn.dnE) {
        swOn.dnE = true;
        if (sig) { ctx.logLine('失控下行：下极限开关动作（仅给出信号，不干预运行）'); return null; }
        ctx.logLine('下极限开关动作：切断安全回路（先于接触缓冲器）'); return 'stopdn';
      }
      return null;
    }
    function fireUp() {
      if (y <= Y_TOP + 75 && !swOn.upF) { swOn.upF = true; v = Math.min(v, 0.5); ctx.logLine('上端站强迫减速开关动作：强制减速至 ≤0.5 m/s'); }
      if (y <= Y_TOP + 45 && !swOn.upL) { swOn.upL = true; ctx.logLine('上限位开关动作：停止向上运行'); return 'stopup'; }
      if (y <= Y_TOP + 15 && !swOn.upE) { swOn.upE = true; ctx.logLine('上极限开关动作：切断安全回路'); return 'stopup'; }
      return null;
    }
    paint();
    const stop = ticker(dt => {
      const vr = ctx.state.vrated, thr = vr * 1.15;
      const vRope = govMech ? 0 : Math.abs(v);          // 夹绳后绳被制停，两轮停转
      ang += vRope / 0.2 * (180 / Math.PI) * dt * 0.35;
      angT += vRope / 0.2 * (180 / Math.PI) * dt * 0.35;
      if (bufHit) {
        // 缓冲器吸能：按全行程内匀减速模型压缩，速度归零后保持压缩
        const bs = bufStroke(vr);
        const a = (vImpact * vImpact) / (2 * bs);
        v = Math.max(0, v - a * dt);
        bufTravel = Math.min(1, (vImpact * vImpact - v * v) / Math.max(1e-6, vImpact * vImpact));
        y = Y_BUF + BUF_S * bufTravel;
        if (v <= 0.02) { v = 0; }
      } else if (gearActed) {
        v = Math.max(0, v - 0.6 * G * dt);
        brakeDist += v * dt;
        y += v * PX * dt;
        lift = Math.min(12, lift + 30 * dt);
        if (v <= 0.02) { v = 0; }
      } else if (mode === 'fault') {
        // 失控超速：自当前位置下滑；夹绳后轿厢再下行一小段，安全钳才楔入动作；端站开关仅给出信号
        v += 2.0 * dt;
        if (!govElec && v >= vr * 1.05) { govElec = true; ctx.logLine('超速约 5%：限速器电气开关动作，切断安全回路，制动器抱闸（本场景模拟制动失效）'); }
        if (!govMech && v >= thr) {
          govMech = true; yClamp = y + 20; yMech = y;
          if (gearFail) ctx.logLine('达 115% 额定速度：限速器机械夹绳，绳被制停——但安全钳已失效，无法制停！');
          else ctx.logLine('达 115% 额定速度：限速器机械夹绳，绳被制停；轿厢借惯性再下行一小段后提拉安全钳');
        }
        if (govMech && !gearActed && !gearFail && y >= yMech + 20) {
          gearActed = true;
          ctx.logLine('绳与轿厢相对运动 → 提拉安全钳操纵杆，楔块楔入夹紧导轨，轿厢制停');
        }
        y += v * PX * dt;
        fireDown(true);                                // 失控下行：端站三级开关仅给出信号，不干预
      } else if (atLimit) {
        v = 0;                                         // 端站限位停靠：锁定，不再继续运行
      } else {
        const dir = mode === 'uprun' ? -1 : 1;
        const bypassL = !!ctx.state.bypassL;
        v = Math.min(vr, v + 2.5 * dt);
        /* 端站开关持续生效（不限于首次触发帧）：
         * 强迫减速 → 持续 ≤0.5 m/s；限位/极限 → 持续 ≤0.35 m/s 并趋向停靠位
         * 限位旁路开启时：限位开关仅给出信号，轿厢继续运行至极限开关动作 */
        if (swOn.dnF) v = Math.min(v, 0.5);
        if ((swOn.dnL && !bypassL) || swOn.dnE) v = Math.min(v, 0.35);
        if (swOn.upF) v = Math.min(v, 0.5);
        if ((swOn.upL && !bypassL) || swOn.upE) v = Math.min(v, 0.35);
        y += dir * v * PX * dt;
        if (dir > 0) fireDown(); else fireUp();
        const stopDn = bypassL ? Y_STOP_DN_E : Y_STOP_DN;
        if (!atLimit && ((swOn.dnL && !bypassL) || swOn.dnE) && y >= stopDn) {
          y = stopDn; v = 0; atLimit = true;
          ctx.logLine(bypassL && swOn.dnE
            ? `下限位已旁路：轿厢继续下行至下极限开关动作——切断安全回路，轿厢紧急停靠（轿底距缓冲器 ${((Y_FLOOR - (y + CAR_H)) / PX).toFixed(2)} m，已锁定）`
            : `轿厢在下限位保护下停靠（距缓冲器 ${((Y_BUF - Y_STOP_DN) / PX).toFixed(2)} m，未接触缓冲器，已锁定不再下行）`);
        }
        const stopUp = bypassL ? Y_STOP_UP_E : Y_STOP_UP;
        if (!atLimit && ((swOn.upL && !bypassL) || swOn.upE) && y <= stopUp) {
          y = stopUp; v = 0; atLimit = true;
          ctx.logLine(bypassL && swOn.upE
            ? '上限位已旁路：轿厢继续上行至上极限开关动作——切断安全回路，轿厢紧急停靠（已锁定）'
            : '轿厢在上限位保护下停靠（已锁定不再上行）');
        }
      }
      // 撞及缓冲器（安全钳失效或未制停）
      if (!bufHit && y >= Y_BUF && v > 0.05) {
        bufHit = true; vImpact = Math.abs(v);
        ctx.logLine(`安全钳未能制停：轿厢以 ${vImpact.toFixed(2)} m/s 撞击缓冲器，缓冲器压缩吸能作为最后一道保护`);
      }
      grG.setAttribute('transform', `rotate(${ang.toFixed(1)} 240 85)`);
      trG.setAttribute('transform', `rotate(${angT.toFixed(1)} 240 610)`);
      paint();
    });
    return {
      destroy: stop,
      onchange(k, v2) { ctx.state[k] = v2; },
      onaction(k, btn) {
        if (k === 'normal') { reset(Y_TOP); mode = 'normal'; ctx.logLine('下行运行：接近下端站时由强迫减速/限位/极限三级保护，下极限先于接触缓冲器动作'); }
        if (k === 'uprun') { reset(Y_BUF - 32); mode = 'uprun'; ctx.logLine('上行运行：接近上端站时由强迫减速/限位/极限三级保护'); }
        if (k === 'fault') {
          // 失控超速：从轿厢当前位置开始下滑（不强制回顶端），安全钳在当前位置下方动作
          v = 0; brakeDist = 0; mode = 'fault'; ang = 0; angT = 0;
          govElec = govMech = gearActed = bufHit = false; bufTravel = 0; lift = 0; yClamp = null; vImpact = 0; yMech = 0; atLimit = false;
          Object.keys(swOn).forEach(k2 => swOn[k2] = false);
          ctx.logLine(`模拟失控：轿厢自当前位置（底坑上方 ${((Y_BUF - y) / PX).toFixed(2)} m）加速下滑，观察限速器—安全钳联动（绳环连接点随轿厢运动）`);
        }
        if (k === 'gearfail') {
          gearFail = !gearFail;
          ctx.logLine(gearFail ? '已设置【安全钳失效】：超速时限速器虽动作但安全钳不制停，最终由缓冲器保护' : '安全钳恢复正常');
        }
        if (k === 'bypass') {
          // 限位旁路（教学演示用）：旁路后限位开关仅给出信号，轿厢继续运行至极限开关动作
          ctx.state.bypassL = !ctx.state.bypassL;
          if (btn && btn.textContent !== undefined) btn.textContent = ctx.state.bypassL ? '限位旁路中（点此恢复）' : '旁路限位开关';
          if (btn && btn.classList) btn.classList.toggle('dang', !ctx.state.bypassL);
          ctx.logLine(ctx.state.bypassL
            ? '已旁路上下限位开关（教学演示）：轿厢将越过限位停靠位继续运行，直至上下极限开关动作切断安全回路'
            : '限位旁路已取消：恢复限位开关停靠功能');
        }
        if (k === 'reset') { gearFail = false; reset(); }
      }
    };
  }
};
