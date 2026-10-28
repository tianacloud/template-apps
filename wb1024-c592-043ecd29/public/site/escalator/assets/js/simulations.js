/* =========================================================================
 * 仿真层：八大系统工作原理仿真（矢量 SVG + 实时动画）
 * 每个 SIMS 项：{ title, desc, notes[], photos[], controls[], mount(ctx) }
 * ctx = { state, els, stage, readout(rows), logLine(msg) }
 * 控件类型：range / select / checkbox / buttons（hold 按钮 :down / :up）
 * ========================================================================= */

/* ------------------------------ 通用工具 ------------------------------ */
const SVGNS = 'http://www.w3.org/2000/svg';
function E(tag, attrs) {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}
function makeSvg(stage, vb, markup) {
  stage.innerHTML = '';
  const svg = E('svg', { viewBox: vb, preserveAspectRatio: 'xMidYMid meet' });
  svg.style.width = '100%'; svg.style.display = 'block';
  if (markup) svg.innerHTML = markup;
  stage.appendChild(svg);
  return svg;
}
function ticker(cb) {
  let last = performance.now(), run = true;
  function frame(t) {
    if (!run) return;
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    cb(dt); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return () => { run = false; };
}
function line(x1, y1, x2, y2, stroke, w, dash) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w || 2}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
}
function txtEl(x, y, s, o = {}) {
  const { anchor = 'middle', size = 12, fill = '#334155', weight = 700 } = o;
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${fill}" font-weight="${weight}" font-family="inherit">${s}</text>`;
}
function box(x, y, w, h, fill, stroke, sw, rx) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx == null ? 6 : rx}" fill="${fill || '#fff'}" stroke="${stroke || '#94a3b8'}" stroke-width="${sw == null ? 2 : sw}"/>`;
}
/** 链轮：轮体 + 辐条 + 齿 */
function sprocketMarkup(cx, cy, r, color, teeth) {
  let m = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#e2e8f0" stroke="${color}" stroke-width="2.4"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${Math.max(3, r * 0.16).toFixed(1)}" fill="${color}"/>`;
  const n = teeth || 10;
  for (let i = 0; i < n; i++) {
    const a = i * 2 * Math.PI / n;
    m += `<line x1="${(cx + r * 0.5 * Math.cos(a)).toFixed(1)}" y1="${(cy + r * 0.5 * Math.sin(a)).toFixed(1)}" x2="${(cx + r * 0.92 * Math.cos(a)).toFixed(1)}" y2="${(cy + r * 0.92 * Math.sin(a)).toFixed(1)}" stroke="${color}" stroke-width="2"/>`;
  }
  return m;
}
/** 折线总长 / 弧长取点 / 弧长处切线角（deg） */
function polyLen(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}
function polyPoint(pts, s) {
  const T = polyLen(pts);
  s = ((s % T) + T) % T;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (s <= d) {
      const t = d ? s / d : 0;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
    }
    s -= d;
  }
  const n = pts.length - 1;
  return [pts[n][0], pts[n][1]];
}
function polyAngle(pts, s, eps = 3) {
  const a = polyPoint(pts, s - eps), b = polyPoint(pts, s + eps);
  return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
}
/** 圆弧采样点 */
function arcPts(cx, cy, r, a0, a1, n) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * i / n;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}
/** 主轨（主轮轴线 / 链中心线）路径 */
function mainRailD(pts) {
  return 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ');
}
/** 翻转角（与各模块 stepRot 同源）：端部链轮处 0→180（上）→180（返回）→180→360（下） */
function stepRotOf(sv, lenW, lenWD, lenWDR, LEN) {
  if (sv < lenW) return 0;
  if (sv < lenWD) return 180 * (sv - lenW) / (lenWD - lenW);
  if (sv < lenWDR) return 180;
  return 180 + 180 * (sv - lenWDR) / (LEN - lenWDR);
}
/** 辅轨竖直偏置：工作段(rot=0)共面=0；返回段(rot=180)辅轨在主轨之上=-DH；
 *  端部链轮处随 stepRot 在 0↔-DH 间平滑过渡（返回梯路：辅轮轨在上、主轮轨在下）。 */
function auxVertOf(rot, DH) {
  const r = ((rot % 360) + 360) % 360;
  return r <= 180 ? -DH * (r / 180) : -DH * ((360 - r) / 180);
}
/** 辅轮导轨路径：相对主轨（链中心线）的偏置
 *  - 工作段（rot=0）：竖直偏置=0 → 主/辅轮共面（梯级踏面水平，两轨同一平面，级级成台阶）。
 *  - 返回段（rot=180）：竖直偏置=-DH → 辅轨在主轨之上（返回梯路：辅轮轨在上、主轮轨在下，梯级倒置返回）。
 *  - 端部链轮：随 stepRot 在 0↔-DH 平滑过渡（绕链轮转向；梯级绕主轮轴翻转）。
 *  - 水平段（|切线竖直分量|→0）：偏置收敛于 0（辅轨与主轨重合 → 梯级放平）。
 *  - 水平偏置 xA 随切线收敛（方向一致，不随翻转反向）。 */
function auxRailD(pts, lenW, lenWD, lenWDR, LEN, xA, DH, sinRef) {
  const N = pts.length;
  const cum = [0];
  for (let i = 1; i < N; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const SINA = sinRef || Math.sin(Math.PI / 6); // 基准倾角（默认 30°；rail 模块按实际 α 传入）
  return 'M' + pts.map((p, idx) => {
    const a = pts[(idx - 1 + N) % N], b = pts[(idx + 1) % N];
    const tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
    const t = Math.min(1, Math.abs(ty / tl) / SINA); // 0：水平段（放平）· 1：倾斜段
    const ox = xA * t;                                             // 水平偏置：随切线收敛，方向一致
    const oy = auxVertOf(stepRotOf(cum[idx], lenW, lenWD, lenWDR, LEN), DH) * t; // 工作共面 / 返回辅轨在上
    return (p[0] + ox).toFixed(1) + ' ' + (p[1] + oy).toFixed(1);
  }).join(' L ');
}
/** 辅轮相对主轮的偏置 [ox, oy]，与 auxRailD 同算法 —— 用于把辅轮滚轮画在辅轨上 */
function auxOffsetAt(sv, LOOP, lenW, lenWD, lenWDR, LEN, xA, DH, sinRef) {
  const SINA = sinRef || Math.sin(Math.PI / 6);
  const p1 = polyPoint(LOOP, (sv - 1 + LEN) % LEN), p2 = polyPoint(LOOP, (sv + 1) % LEN);
  const tx = p2[0] - p1[0], ty = p2[1] - p1[1], tl = Math.hypot(tx, ty) || 1;
  const t = Math.min(1, Math.abs(ty / tl) / SINA);
  return [xA * t, auxVertOf(stepRotOf(sv, lenW, lenWD, lenWDR, LEN), DH) * t];
}
/** 卸载导轨（v1.2.7）：弯弧段辅轨向外分离后延伸出的短弧，承接滚轮载荷、防止梯级绕主轮轴倾翻。
 *  位于辅轨外侧（远离主轨一侧），覆盖弯弧中段约 ±50°，端头圆滑衔接。
 *  抽成模块级助手供 drive / step / rail 三处共用，避免三处几何漂移。
 *  @param cx,cy 转向弧圆心  @param r 转向半径（rD / rT；本函数在 +12 处画弧）
 *  @param a0,a1 覆盖角度（deg，按辅轨在弯弧 ±50° 处的点位反算）
 *  @param scale 缩放（step / rail 模块传 0.6，drive 传 1）
 *  @param labDeg 可选：标注所在角度（默认取弧中点；drive 上端传 -50°，避免文字压主轴/越界）
 *  —— v1.2.8：标注半径 r+28 → r+22（驱动链轮右移至 x=820 后，r+28 会把文字推出 viewBox 右边界）。 */
function unloadRailMarkup(cx, cy, r, a0, a1, X, scale, labDeg) {
  const k = scale == null ? 1 : scale;
  const T = X || function (x, y) { return [x, y]; };
  const mid = (labDeg == null ? (a0 + a1) / 2 : labDeg) * Math.PI / 180;
  const pts = arcPts(cx, cy, r + 12, a0 * Math.PI / 180, a1 * Math.PI / 180, 12).map(p => T(p[0], p[1]));
  const d = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ');
  const lp = T(cx + (r + 22) * Math.cos(mid), cy + (r + 22) * Math.sin(mid));
  return `<path d="${d}" fill="none" stroke="#059669" stroke-width="${(3.4 * k).toFixed(2)}" stroke-linecap="round" opacity="0.95"/>`
    + `<text x="${lp[0].toFixed(1)}" y="${lp[1].toFixed(1)}" text-anchor="middle" font-size="${(11 * k).toFixed(1)}" fill="#047857" font-weight="700" font-family="inherit">卸载导轨</text>`;
}
/** 弯弧段辅轨分离的小箭头（v1.2.7）：标在分叉起点 / 汇合终点，色随辅轨 #7dd3fc */
function auxSplitArrow(x, y, angDeg, X, scale) {
  const k = scale == null ? 1 : scale;
  const T = X || function (x, y) { return [x, y]; };
  const a = angDeg * Math.PI / 180, sz = 5 * k;
  const p = (dx, dy) => { const q = T(x + dx * Math.cos(a) - dy * Math.sin(a), y + dx * Math.sin(a) + dy * Math.cos(a)); return q[0].toFixed(1) + ' ' + q[1].toFixed(1); };
  return `<polygon points="${p(sz, 0)} ${p(-sz, sz * 0.85)} ${p(-sz, -sz * 0.85)}" fill="#7dd3fc" stroke="#0369a1" stroke-width="${(0.9 * k).toFixed(2)}"/>`;
}
/** S 形速度规划器（限制加速度与加加速度） */
function makePlanner(aMax, jMax) {
  let acc = 0;
  return function (v, target, dt) {
    const dv = target - v;
    if (Math.abs(dv) < 1e-4) { acc = 0; return target; }
    const dir = Math.sign(dv);
    const aLim = Math.sqrt(Math.abs(dv) * jMax);
    const aWant = Math.min(aMax, aLim);
    acc += Math.max(-jMax * dt, Math.min(jMax * dt, dir * aWant - acc));
    let nv = v + acc * dt;
    if (dir > 0 ? nv > target : nv < target) { nv = target; acc = 0; }
    return nv;
  };
}
/** 控件构建（app.js 调用；els[key] 存元素，hold 按钮 :down/:up） */
function buildControls(root, defs, onchange, onaction, els) {
  els = els || {};
  defs.forEach(def => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:10px;margin:10px 0;flex-wrap:wrap';
    if (def.type === 'range' || def.type === 'select' || def.type === 'checkbox') {
      const lab = document.createElement('label');
      lab.style.cssText = 'font-size:.92rem;font-weight:700;color:#334155;min-width:112px';
      lab.textContent = def.label; row.appendChild(lab);
      let inp;
      if (def.type === 'range') {
        inp = document.createElement('input'); inp.type = 'range';
        inp.min = def.min; inp.max = def.max; inp.step = def.step || 1; inp.value = def.value;
        inp.style.cssText = 'flex:1;min-width:120px;accent-color:#1d4ed8';
        const val = document.createElement('span');
        val.style.cssText = 'font-size:.9rem;font-weight:800;color:#1d4ed8;min-width:64px;text-align:right';
        const upd = () => { val.textContent = inp.value + (def.unit || ''); };
        inp.addEventListener('input', () => { upd(); onchange(def.key, +inp.value); });
        upd(); row.appendChild(inp); row.appendChild(val);
      } else if (def.type === 'select') {
        inp = document.createElement('select');
        inp.style.cssText = 'flex:1;min-width:150px;padding:7px 10px;border:1.5px solid #cbd5e1;border-radius:8px;font-family:inherit;font-size:.92rem;font-weight:600;color:#334155;background:#fff';
        (def.options || []).forEach(op => { const o = document.createElement('option'); o.value = op[0]; o.textContent = op[1]; inp.appendChild(o); });
        inp.value = def.value;
        inp.addEventListener('change', () => onchange(def.key, inp.value));
        row.appendChild(inp);
      } else {
        inp = document.createElement('input'); inp.type = 'checkbox'; inp.checked = !!def.value;
        inp.style.cssText = 'width:18px;height:18px;accent-color:#1d4ed8';
        inp.addEventListener('change', () => onchange(def.key, inp.checked));
        row.appendChild(inp);
      }
      els[def.key] = inp;
    } else if (def.type === 'buttons') {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
      (def.items || []).forEach(b => {
        const btn = document.createElement('button');
        const cls = b.cls === 'dang' ? '#dc2626' : b.cls === 'ok' ? '#059669' : b.cls === 'ghost' ? '#64748b' : '#1d4ed8';
        btn.style.cssText = `appearance:none;border:none;background:${cls};color:#fff;font-family:inherit;font-size:.9rem;font-weight:700;padding:9px 14px;border-radius:9px;cursor:pointer`;
        btn.textContent = b.label; if (b.tip) btn.title = b.tip;
        if (b.hold) {
          const dn = e => { e.preventDefault(); onaction(b.key + ':down', btn); };
          const up = () => onaction(b.key + ':up', btn);
          btn.addEventListener('mousedown', dn); btn.addEventListener('mouseup', up); btn.addEventListener('mouseleave', up);
          btn.addEventListener('touchstart', dn, { passive: false }); btn.addEventListener('touchend', up);
        } else btn.addEventListener('click', () => onaction(b.key, btn));
        els[b.key] = btn; wrap.appendChild(btn);
      });
      row.appendChild(wrap);
    }
    root.appendChild(row);
  });
}

/* v1.2.7：梯级链滚子与导板为工程塑料（黄色），故链改黄 #f59e0b；chainNode 为链节塑料件节点色 */
const C = { step: '#fcd34d', stepS: '#b45309', chain: '#f59e0b', chainNode: '#fbbf24', rail: '#64748b', steel: '#94a3b8' };

/** 仿真注册表（app.js 经 SIMS[id] 读取；id 与 data.js SYSTEMS[].sim 对应） */
const SIMS = {};

/* =======================================================================
 * 1. 桁架结构系统 · 载荷与挠度仿真
 * ===================================================================== */
SIMS.truss = {
  title: '桁架结构系统 · 载荷与挠度仿真',
  desc: '调节跨度与载荷，观察桁架挠度变化；勾选中间支撑后挠度显著减小。挠度超过 L/750 限值时报警。',
  photos: [
    { f: 'real-truss', cap: '金属桁架实物（弦杆 + 腹杆焊接整体结构）' },
    { f: 'real-overview-1', cap: '整机与桁架安装形态' }
  ],
  notes: [
    '桁架是扶梯的承载骨架：梯级、乘客与扶手系统的全部载荷经导轨传至弦杆，再由腹杆传至支座。',
    '最大挠度应控制在计算跨度的 1/750 以内，否则导轨直线度被破坏，梯级运行出现台阶感与异响。',
    '提升高度大于 6 m 时应设置中间支撑（间距 6~8 m），可大幅减小跨中挠度。'
  ],
  controls: [
    { key: 'span', type: 'range', label: '计算跨度 L', min: 6, max: 20, step: 1, value: 12, unit: ' m' },
    { key: 'load', type: 'range', label: '均布载荷 w', min: 20, max: 100, step: 5, value: 50, unit: ' kN/m' },
    { key: 'mid', type: 'checkbox', label: '设置中间支撑', value: false }
  ],
  mount(ctx) {
    const svg = makeSvg(ctx.stage, '0 0 800 470', `
      ${txtEl(400, 28, '桁架简化梁模型：均布载荷 → 跨中挠度', { size: 13.5, fill: '#334155' })}
      ${box(25, 356, 750, 92, '#f8fafc', '#cbd5e1', 1.8, 10)}
      ${txtEl(400, 382, '判据：f_max ≤ L / 750（挠度过大 → 导轨直线度被破坏 → 梯级运行抖动、异响）', { size: 12, fill: '#475569' })}
      ${txtEl(400, 412, '中间支撑：提升高度 > 6 m 时设置，间距 6~8 m，将连续梁变为多跨连续体系，挠度大幅减小。', { size: 12, fill: '#475569' })}
    `);
    const beamG = E('g', {}); svg.appendChild(beamG);
    const curveG = E('g', {}); svg.appendChild(curveG);
    const dimG = E('g', {}); svg.appendChild(dimG);
    ctx.state.span = 12; ctx.state.load = 50; ctx.state.mid = false;

    function paint() {
      const L = +ctx.state.span, w = +ctx.state.load, mid = !!ctx.state.mid;
      const x0 = 90, x1 = 710, yb = 210, scale = (x1 - x0) / L;
      // 载荷 → 挠度（教学示意）：f ∝ w·L⁴，中间支撑折减
      const fmm = 0.00092 * w * Math.pow(L, 4) * (mid ? 0.32 : 1) / 100;   // mm（教学标定：L=12m、w=50 时 ≈ 9.5 mm）
      const limit = L * 1000 / 750;
      const fpx = Math.min(70, fmm / limit * 46);
      // 载荷箭头
      let m = '';
      const n = Math.max(6, Math.round(L * 1.2));
      for (let k = 0; k <= n; k++) {
        const x = x0 + (x1 - x0) * k / n;
        m += line(x, 96, x, 132, '#dc2626', 2) +
          `<polygon points="${(x - 4).toFixed(1)},132 ${(x + 4).toFixed(1)},132 ${x},142" fill="#dc2626"/>`;
      }
      m += txtEl(x0 + 8, 88, `乘客 + 梯级 + 扶手系统均布载荷 w = ${w} kN/m`, { anchor: 'start', size: 12, fill: '#b91c1c' });
      // 桁架梁（弦杆 + 腹杆）
      m += line(x0, yb, x1, yb, '#475569', 5);
      m += line(x0, yb + 34, x1, yb + 34, '#475569', 5);
      const seg = 10;
      for (let k = 0; k < seg; k++) {
        const xa = x0 + (x1 - x0) * k / seg, xb = x0 + (x1 - x0) * (k + 1) / seg;
        m += line(xa, yb, xb, yb + 34, '#94a3b8', 2);
        m += line(xb, yb, xa, yb + 34, '#94a3b8', 2);
        m += line(xa, yb, xa, yb + 34, '#cbd5e1', 1.6);
      }
      // 支座
      m += `<polygon points="${x0 - 14},${yb + 56} ${x0 + 14},${yb + 56} ${x0},${yb + 36}" fill="#94a3b8" stroke="#475569" stroke-width="1.6"/>`;
      m += `<polygon points="${x1 - 14},${yb + 56} ${x1 + 14},${yb + 56} ${x1},${yb + 36}" fill="#94a3b8" stroke="#475569" stroke-width="1.6"/>`;
      if (mid) {
        const xm = (x0 + x1) / 2;
        m += line(xm, yb + 34, xm, yb + 92, '#7c3aed', 6);
        m += line(xm - 26, yb + 92, xm + 26, yb + 92, '#7c3aed', 6);
        m += txtEl(xm, yb + 112, '中间支撑', { size: 11.5, fill: '#6d28d9' });
      }
      beamG.innerHTML = m;
      // 挠度曲线（夸大显示）
      let c = `<path d="M${x0} ${yb} Q ${(x0 + x1) / 2} ${yb + fpx * 2} ${x1} ${yb}" fill="none" stroke="${fmm > limit ? '#dc2626' : '#0891b2'}" stroke-width="3" stroke-dasharray="8 5"/>`;
      c += line((x0 + x1) / 2, yb, (x0 + x1) / 2, yb + fpx * 1.62, '#0891b2', 2);
      c += txtEl((x0 + x1) / 2, yb + fpx * 1.62 + 20, `f_max ≈ ${fmm.toFixed(1)} mm`, { size: 12.5, fill: fmm > limit ? '#b91c1c' : '#0e7490' });
      curveG.innerHTML = c;
      // 跨度标注
      dimG.innerHTML =
        line(x0, yb + 150, x1, yb + 150, '#0891b2', 1.4) +
        line(x0, yb + 144, x0, yb + 156, '#0891b2', 1.4) + line(x1, yb + 144, x1, yb + 156, '#0891b2', 1.4) +
        txtEl((x0 + x1) / 2, yb + 144, `计算跨度 L = ${L} m`, { size: 12, fill: '#0e7490' });
      ctx.readout([
        ['计算跨度 L', `${L} m`],
        ['均布载荷 w', `${w} kN/m`],
        ['中间支撑', mid ? '<b style="color:#7c3aed">已设置（挠度折减约 68%）</b>' : '未设置'],
        ['挠度计算值 f_max', `<b style="color:${fmm > limit ? '#dc2626' : '#059669'}">${fmm.toFixed(1)} mm</b>`],
        ['挠度限值 L/750', `${limit.toFixed(1)} mm`],
        ['判定', fmm > limit ? '<b style="color:#dc2626">超限 —— 须增设中间支撑或加大桁架截面</b>' : '<b style="color:#059669">满足要求</b>']
      ]);
    }
    paint();
    return {
      destroy() { },
      onchange(k, v) { ctx.state[k] = v; paint(); },
      onaction() { }
    };
  }
};

/* =======================================================================
 * 2. 主驱动系统 · 全传动链联动仿真（重点：梯级链 + 扶手带同轴联动）
 * 传动链：电机 → 联轴器 → 蜗轮减速箱 → 传动链 → 主驱动轴
 * 主轴同轴：梯级驱动链轮（→梯级链→梯级循环）+ 同步链→扶手带摩擦轮
 * ===================================================================== */
SIMS.drive = {
  title: '主驱动系统 · 全传动链联动仿真',
  desc: '动力由电动机→蜗轮减速箱→传动链→主驱动轴；主轴同轴带动梯级链与扶手带。梯级链为闭环：工作梯路（乘客侧·踏面水平）→ 上端主驱动链轮转向 → 返回梯路（倒置 180°）→ 下端张紧链轮回到工作侧；梯级由主轮沿主轨、辅轮沿辅轨保持踏面水平，于端部链轮处完成 180° 翻转。',
  photos: [
    { f: 'real-drive-machine-1', cap: '驱动主机实物（电动机 + 蜗轮减速箱 + 制动器）' },
    { f: 'real-drive-sprocket-1', cap: '主轴梯级驱动链轮实物' },
    { f: 'real-drive-chain-1', cap: '传动链实物' },
    { f: 'real-handrail-drive-1', cap: '扶手带摩擦驱动轮 + 压带轮组实物' }
  ],
  notes: [
    '动力路径：电动机 → 联轴器（含工作制动器）→ 蜗轮蜗杆减速箱 → 传动链 → 主驱动轴，降速增矩。',
    '主驱动轴同轴装设：梯级驱动链轮（牵引梯级链循环）与扶手带摩擦驱动轮（经同步链驱动），实现梯级与扶手带联动。',
    '扶手带速度略快于梯级 0~+2%（本仿真 +1%），使乘客手臂被轻微前拉、身体稳定。',
    '梯级相邻两级间距 400 mm；梯级由主轮沿主轨、辅轮沿辅轨保持踏面水平，于端部链轮处完成 180° 翻转，返回梯路倒置运行。'
  ],
  controls: [
    { key: 'dir', type: 'select', label: '运行方向', value: 'up', options: [['up', '上行'], ['down', '下行'], ['stop', '停机（抱闸）']] },
    { key: 'v', type: 'range', label: '梯级速度', min: 0.4, max: 0.75, step: 0.05, value: 0.5, unit: ' m/s' },
    { key: 'i', type: 'select', label: '减速比 i', value: '24', options: [['20', '20（小提升高度）'], ['24', '24（常用）'], ['32', '32（大提升高度）']] }
  ],
  mount(ctx) {
    /* ---- 几何：梯级链闭环（工作梯路 → 上端链轮 → 返回梯路 → 下端张紧链轮） ---- */
    // 链轮节圆半径放大至 ≈0.8 m（54px），转向弧度接近真实扶梯；梯级沿闭环连续分布，无缺失
    const rD = 54, rT = 54;                        // 主驱动链轮 / 张紧链轮 节圆半径（PCD≈1.08 m）
    /* v1.2.7：随水平段向左加长（150→100），张紧链轮中心同步左移至 x=100，
       使链轮顶点 (100,446) / 底点 (100,554) 仍与水平段两端严格重合——否则 LOOP 会多出
       一段直线，梯级等分出现重叠（实测最近邻间距降到 0.4px）。 */
    const Dc = [820, 290], Tc = [100, 500];         // 主驱动轴 / 张紧链轮 中心
    const al = -30 * Math.PI / 180;                 // 工作梯路倾角 30°
    const cosA = Math.cos(al), sinA = Math.sin(al);
    // 工作梯路 W（前端·承载乘客）：下端梳齿（水平）→ 倾斜 30° → 上端水平（楼层）
    /* v1.2.8：倾斜段 500→420、驱动链轮中心 700→820（y 250→290）。
       倾斜段终点 x = 270+420×cos30° = 633.7、y = 446−210 = 236 = Dc[1]−rD（290−54）→ 严格闭合；
       上水平段 = 820−633.7 = 186.3 px、下水平段 = 270−100 = 170 px，扣掉梳齿板后
       「可见放平段」上 152.3 px / 下 146 px，均 ≥ 2×SP（≈111.3 px）≈ 2.7 / 2.6 级梯级完全放平。
       （v1.2.7 缺陷：基准写成 250 而起点是 270，且上水平段仅 17 px，上端站根本没有放平梯级。）
       提升高度 = 446−236 = 210 px ≈ 1.5 m（比例 140 px/m）。 */
    const iL = 420;                                 // 倾斜段长度
    /* 四件截面边界（抽成常量，供几何与自检断言共用，避免两处数字漂移）：
       下端站 楼层板 12~82 → 前沿板 82~100 → 梳齿板 100~124 → 梯级；
       上端站 梯级 → 梳齿板 786~810 → 前沿板 810~828 → 楼层板 828~896。 */
    const COMB_DN_X2 = 124, COMB_UP_X1 = 786;       // 梳齿板「梯级没入/吐出」内缘
    const W = [[100, 446], [270, 446], [270 + iL * cosA, 446 + iL * sinA], [Dc[0], Dc[1] - rD]];
    const wrapD = arcPts(Dc[0], Dc[1], rD, -Math.PI / 2, Math.PI / 2, 16);   // 主驱动链轮右半圆
    const R = [[Dc[0], Dc[1] + rD], [270 + iL * cosA, 446 + iL * sinA + 2 * rD], [270, 554], [100, 554]];
    const wrapT = arcPts(Tc[0], Tc[1], rT, Math.PI / 2, Math.PI * 1.5, 16);  // 张紧链轮左半圆
    const LOOP = W.concat(wrapD.slice(1), R.slice(1), wrapT.slice(1));
    const LEN = polyLen(LOOP);
    const lenW = polyLen(W), lenWD = lenW + polyLen(wrapD), lenWDR = lenWD + polyLen(R);
    const loopPath = 'M' + LOOP.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ') + ' Z';
    const P_STEP = 56, SCALE = 140;                 // 梯级间距 56px（≈400mm）、比例 140px/m
    const DH = 30;                                  // 辅轮相对主轮垂直偏置（≈214mm，教学值）
    const NSTEP = Math.max(1, Math.round(LEN / P_STEP)); // 整环等分：间距严格一致、无重复
    /* v1.2.8 自检：上、下水平段「可见放平段」均须容纳 ≥2 个梯级间距。
       —— 判据用【可见放平段】= 倾斜段端点 → 梳齿板内缘（被梳齿板压住的部分乘客看不到、也不算放平），
          而不是整段几何长度；v1.2.7 只判了下水平段且用的是几何长度，故上端站无放平梯级未被测出。 */
    const SP = LEN / NSTEP;
    const flatDn = W[1][0] - COMB_DN_X2;            // 下端：倾斜段起点 270 − 梳齿板右缘 124
    const flatUp = COMB_UP_X1 - W[2][0];            // 上端：梳齿板左缘 786 − 倾斜段终点 633.7
    console.assert(flatDn >= 2 * SP, '下水平段放平梯级不足 2 级：' + flatDn.toFixed(1) + ' < ' + (2 * SP).toFixed(1));
    console.assert(flatUp >= 2 * SP, '上水平段放平梯级不足 2 级：' + flatUp.toFixed(1) + ' < ' + (2 * SP).toFixed(1));

    const railPath = (pts, dy) => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + (p[1] + (dy || 0)).toFixed(1)).join(' L ');
    /* ---- 静态底图 ---- */
    const svg = makeSvg(ctx.stage, '0 0 900 672', `
      ${txtEl(682, 652, '', { size: 1 })}
      <!-- 扶手带回路（上部）：v1.2.8 右端随驱动链轮右移 685→805 / 返绳轮 690→810；
           y 保持 183/191（v1.2.7 值）—— 扶手带驱动轮 hG(740,209)/压紧轮 pG(740,170)/
           端部轮 tpuG·tplG(cy=187) 均按此带宽定位；上端站 ①②③④ 标注上移至 y≈172 空带避让。 -->
      ${line(95, 183, 805, 183, '#334155', 7, '')}
      ${line(805, 191, 95, 191, '#334155', 7, '')}
      <circle cx="810" cy="187" r="7.5" fill="#f1f5f9" stroke="#334155" stroke-width="2"/>
      <circle cx="92" cy="187" r="7.5" fill="#f1f5f9" stroke="#334155" stroke-width="2"/>
      ${txtEl(300, 176, '扶手带（与梯级同步 · 超前 +1%）', { size: 12, fill: '#0f766e' })}
      <!-- 导轨：链中心线（灰） + 主轨（橙·主轮） + 辅轨（蓝·辅轮；倾斜段偏置 DH、水平段收敛于主轨） -->
      <path d="${loopPath}" fill="none" stroke="#cbd5e1" stroke-width="3.2" opacity="0.55"/>
      <path d="${mainRailD(LOOP)}" fill="none" stroke="#f59e0b" stroke-width="3.4"/>
      <path d="${auxRailD(LOOP, lenW, lenWD, lenWDR, LEN, -20, 30)}" fill="none" stroke="#7dd3fc" stroke-width="3.4"/>
      <!-- 卸载导轨（v1.2.7）：上下弯弧各一条，位于辅轨外侧，覆盖弯弧中段 ±50°；承接转向区滚轮载荷 -->
      ${unloadRailMarkup(Dc[0], Dc[1], rD, -50, 50, null, 1, -50)}
      ${unloadRailMarkup(Tc[0], Tc[1], rT, 130, 230, null, 1, 140)}
      <!-- 弯弧段辅轨与主轨分离：分叉起点 / 汇合终点各一个小 -->
      ${auxSplitArrow(Dc[0], Dc[1] - rD, 0)}
      ${auxSplitArrow(Dc[0], Dc[1] + rD, 180)}
      ${auxSplitArrow(Tc[0], Tc[1] - rT, 180)}
      ${auxSplitArrow(Tc[0], Tc[1] + rT, 0)}
      ${txtEl(700, 330, '弯弧段：辅轨与主轨分离', { anchor: 'end', size: 10.5, fill: '#0369a1' })}
      ${txtEl(150, 372, '弯弧段：辅轨与主轨分离', { size: 10.5, fill: '#0369a1' })}
      <!-- 主驱动轴（v1.2.8：随 Dc 由 y=250 → y=290，右端收到 885 以免越界） -->
      ${line(720, 290, 885, 290, '#475569', 7)}
      <!-- 传动链（减速箱输出 → 主轴链轮）；v1.2.8：随右上机械组整体平移 x+100 / y+40 -->
      <path id="dcL" d="M788 180 L748 261" fill="none" stroke="#a8a29e" stroke-width="4" stroke-dasharray="9 6"/>
      <path id="dcR" d="M812 180 L772 261" fill="none" stroke="#a8a29e" stroke-width="4" stroke-dasharray="9 6"/>
      ${txtEl(824, 246, '传动链', { anchor: 'start', size: 11.5, fill: '#57534e' })}
      <!-- 同步链（主轴 z2 → 扶手带摩擦轮 hG）：hG 随扶手带右端右移（665→740），y 仍贴扶手带 183/191 -->
      <path id="scL" d="M772 273 L735 219" fill="none" stroke="#a8a29e" stroke-width="3.4" stroke-dasharray="8 5"/>
      <path id="scR" d="M788 273 L751 219" fill="none" stroke="#a8a29e" stroke-width="3.4" stroke-dasharray="8 5"/>
      ${txtEl(696, 228, '扶手带驱动轮', { anchor: 'end', size: 11.5, fill: '#047857' })}
      ${txtEl(742, 282, '同步链', { anchor: 'end', size: 11.5, fill: '#57534e' })}
      ${txtEl(780, 172, '压紧轮', { anchor: 'end', size: 11.5, fill: '#0e7490' })}
      ${txtEl(210, 232, '主驱动轴', { anchor: 'end', size: 12, fill: '#334155' })}
      ${txtEl(897, 358, '附加制动器', { anchor: 'end', size: 11, fill: '#b91c1c' })}
      ${txtEl(700, 262, '梯级驱动链轮（主轴上）', { anchor: 'end', size: 11.5, fill: '#1d4ed8' })}
      ${txtEl(150, 588, '张紧链轮（下部转向）', { size: 11.5, fill: '#7c3aed' })}
      ${txtEl(843, 92, '蜗轮减速箱', { size: 12, fill: '#9a3412' })}
      ${txtEl(720, 95, '电动机', { size: 12, fill: '#1e3a8a' })}
      ${txtEl(712, 168, '工作制动器', { size: 11, fill: '#b91c1c' })}
      ${line(736, 162, 776, 128, '#b91c1c', 1.4, '4 3')}
      ${txtEl(420, 322, '梯级链（梯级间距 400 mm）', { anchor: 'end', size: 11.5, fill: '#57534e' })}
      ${line(422, 328, 458, 348, '#57534e', 1.2, '3 3')}
      ${txtEl(375, 342, '工作梯路（乘客侧·踏面水平）', { anchor: 'end', size: 11.5, fill: '#b45309' })}
      ${txtEl(560, 540, '返回梯路（梯级倒置 180°）', { size: 11.5, fill: '#0e7490' })}
      ${txtEl(232, 392, '辅轮导轨', { size: 11, fill: '#0369a1' })}
      <!-- ===== 四件截面 v1.2.8：① 楼层板 → ② 前沿板 → ③ 梳齿板 → ④ 梯级踏面 =====
           高度关系（用户要求）：楼层板顶面【高于】放平梯级踏面顶面约 8~10 px。
           下端站（切点 x=100）：踏面顶面 446−24=422 → 楼层板顶面 413（高 9px）；
           上端站（切点 x=820）：踏面顶面 236−24=212 → 楼层板顶面 202（高 10px）。
           可见放平段：下端 270−124=146 px、上端 786−633.7=152.3 px，均 ≥ 2×SP。 -->
      <!-- ---- 下端站：楼层板 12~82 → 前沿板 82~100 → 梳齿板 100~124 → 梯级 ---- -->
      <rect x="12" y="413" width="70" height="13" fill="#d6d3d1" stroke="#78716c" stroke-width="1.6"/>
      <polygon points="82,413 100,419 100,427 82,421" fill="#cbd5e1" stroke="#64748b" stroke-width="1.4"/>
      <polygon points="100,419 124,422 124,431 100,428" fill="#f59e0b" stroke="#b45309" stroke-width="1.4"/>
      ${[104, 107, 110, 113, 116, 119, 122].map(x => line(x, 419 + (x - 100) * 3 / 24, x, 424, '#b45309', 1.2)).join('')}
      <!-- 楼层板顶面 ↔ 踏面顶面 高差尺寸线 -->
      ${line(47, 413, 47, 422, '#78716c', 1)}
      ${line(42, 413, 52, 413, '#78716c', 1)}${line(42, 422, 52, 422, '#78716c', 1)}
      ${txtEl(47, 408, '≈10 mm（教学值）', { size: 9, fill: '#78716c', weight: 600 })}
      ${txtEl(36, 394, '① 楼层板', { size: 10.5, fill: '#44403c' })}
      ${txtEl(95, 394, '② 前沿板', { size: 10.5, fill: '#475569' })}
      ${txtEl(124, 405, '③ 梳齿板', { size: 10.5, fill: '#b45309' })}
      ${txtEl(180, 405, '④ 梯级踏面', { size: 10.5, fill: '#57534e' })}
      ${txtEl(130, 470, '梳齿与梯级齿槽啮合（防夹持·间隙 ≤4 mm）', { anchor: 'start', size: 8.5, fill: '#b45309', weight: 600 })}
      <!-- ---- 上端站（镜像换算）：梯级 → 梳齿板 786~810 → 前沿板 810~828 → 楼层板 828~896 ---- -->
      <rect x="828" y="202" width="68" height="13" fill="#d6d3d1" stroke="#78716c" stroke-width="1.6"/>
      <polygon points="828,202 810,208 810,216 828,210" fill="#cbd5e1" stroke="#64748b" stroke-width="1.4"/>
      <polygon points="810,208 786,211 786,220 810,217" fill="#f59e0b" stroke="#b45309" stroke-width="1.4"/>
      ${[806, 803, 800, 797, 794, 791, 788].map(x => line(x, 208 + (810 - x) * 3 / 24, x, 214, '#b45309', 1.2)).join('')}
      ${line(860, 202, 860, 212, '#78716c', 1)}
      ${line(855, 202, 865, 202, '#78716c', 1)}${line(855, 212, 865, 212, '#78716c', 1)}
      ${txtEl(896, 176, '≈10 mm（教学值）', { anchor: 'end', size: 9, fill: '#78716c', weight: 600 })}
      ${txtEl(866, 194, '① 楼层板', { size: 10.5, fill: '#57534e' })}
      ${txtEl(840, 220, '② 前沿板', { size: 10.5, fill: '#475569' })}
      ${txtEl(800, 234, '③ 梳齿板', { size: 10.5, fill: '#b45309' })}
      ${txtEl(650, 238, '④ 梯级踏面', { size: 10.5, fill: '#57534e' })}
      ${txtEl(540, 205, '梳齿与梯级齿槽啮合（防夹持·间隙 ≤4 mm）', { anchor: 'start', size: 8.5, fill: '#b45309', weight: 600 })}
      <!-- 底部说明条 -->
      ${box(25, 596, 850, 34, '#eff6ff', '#bfdbfe', 1.6, 8)}
      ${txtEl(450, 618, '主驱动轴同轴联动：梯级链轮 → 梯级链循环承载乘客；同步链 → 扶手带摩擦轮（压紧轮压紧，摩擦传动，超前 +1%）。梯级主轮沿主轨、辅轮沿辅轨，端部转向处翻转 180°。', { size: 11.5, fill: '#1e3a8a' })}
    `);
    // 电动机 / 减速箱本体
    svg.insertAdjacentHTML('beforeend', `
      ${box(665, 80, 110, 70, '#dbeafe', '#1d4ed8', 2.2, 8)}
      ${box(792, 75, 103, 92, '#ffedd5', '#ea580c', 2.2, 8)}
      <circle cx="784" cy="115" r="13" fill="#fee2e2" stroke="#dc2626" stroke-width="2.2"/>
      <circle cx="784" cy="115" r="4" fill="#dc2626"/>
      ${line(800, 168, 845, 138, '#94a3b8', 4)}
    `);
    /* ---- 动态元件 ---- */
    const mk = (g, cx, cy) => { const el = E('g', {}); g.appendChild(el); el.dataset.cx = cx; el.dataset.cy = cy; return el; };
    const rotG = E('g', {}); svg.appendChild(rotG);
    const fanG = E('g', {}), wormG = E('g', {}), wwG = E('g', {}), z1G = E('g', {}), z2G = E('g', {}),
      addG = E('g', {}), dG = E('g', {}), tG = E('g', {}), hG = E('g', {}), pG = E('g', {}), tpuG = E('g', {}), tplG = E('g', {});
    [fanG, wormG, wwG, z1G, z2G, addG, dG, tG, hG, pG, tpuG, tplG].forEach(g => rotG.appendChild(g));
    fanG.innerHTML = `<circle cx="720" cy="125" r="20" fill="#fff" stroke="#1d4ed8" stroke-width="2"/>` +
      Array.from({ length: 6 }, (_, k) => {
        const a = k * Math.PI / 3;
        return `<line x1="${(720 + 6 * Math.cos(a)).toFixed(1)}" y1="${(125 + 6 * Math.sin(a)).toFixed(1)}" x2="${(720 + 17 * Math.cos(a)).toFixed(1)}" y2="${(125 + 17 * Math.sin(a)).toFixed(1)}" stroke="#1d4ed8" stroke-width="2.4"/>`;
      }).join('');
    wormG.innerHTML = `<rect x="802" y="92" width="64" height="12" rx="6" fill="#fdba74" stroke="#ea580c" stroke-width="1.6"/>` +
      `<g>` + Array.from({ length: 7 }, (_, k) => `<line x1="${805 + k * 9}" y1="104" x2="${811 + k * 9}" y2="92" stroke="#c2410c" stroke-width="2"/>`).join('') + `</g>` +
      line(766, 98, 802, 98, '#94a3b8', 5);
    wwG.innerHTML = `<g id="ww-spin">${sprocketMarkup(845, 138, 17, '#ea580c', 10)}</g>`;
    z1G.innerHTML = `<g id="z1-spin">${sprocketMarkup(800, 168, 12, '#a16207', 8)}</g>`;
    z2G.innerHTML = `<g id="z2-spin">${sprocketMarkup(760, 290, 16, '#a16207', 8)}</g>`;
    addG.innerHTML = `<g id="add-spin"><circle cx="870" cy="290" r="12" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>` +
      Array.from({ length: 4 }, (_, k) => { const a = k * Math.PI / 2; return `<circle cx="${(870 + 6.5 * Math.cos(a)).toFixed(1)}" cy="${(290 + 6.5 * Math.sin(a)).toFixed(1)}" r="2" fill="#dc2626"/>`; }).join('') + `</g>`;
    dG.innerHTML = `<g id="d-spin">${sprocketMarkup(820, 290, 54, '#1d4ed8', 14)}</g>`;
    tG.innerHTML = `<g id="t-spin">${sprocketMarkup(100, 500, 54, '#7c3aed', 14)}</g>`;
    // v1.2.8：扶手带驱动轮 / 压紧轮随扶手带右端右移（665→740），y 保持不变（仍紧贴扶手带 183/191）
    hG.innerHTML = `<g id="h-spin"><circle cx="740" cy="209" r="18" fill="#dcfce7" stroke="#059669" stroke-width="2.4"/>` +
      Array.from({ length: 6 }, (_, k) => { const a = k * Math.PI / 3; return `<line x1="${(740 + 5 * Math.cos(a)).toFixed(1)}" y1="${(209 + 5 * Math.sin(a)).toFixed(1)}" x2="${(740 + 15 * Math.cos(a)).toFixed(1)}" y2="${(209 + 15 * Math.sin(a)).toFixed(1)}" stroke="#059669" stroke-width="2.2"/>`; }).join('') + `</g>`;
    pG.innerHTML = `<g id="p-spin"><circle cx="740" cy="170" r="13" fill="#e0f2fe" stroke="#0e7490" stroke-width="2.2"/>` +
      Array.from({ length: 5 }, (_, k) => { const a = k * 2 * Math.PI / 5; return `<line x1="${(740 + 4 * Math.cos(a)).toFixed(1)}" y1="${(170 + 4 * Math.sin(a)).toFixed(1)}" x2="${(740 + 10.5 * Math.cos(a)).toFixed(1)}" y2="${(170 + 10.5 * Math.sin(a)).toFixed(1)}" stroke="#0e7490" stroke-width="2"/>`; }).join('') + `</g>`;
    tpuG.innerHTML = `<g id="tpu-spin"><circle cx="810" cy="187" r="7.5" fill="#f1f5f9" stroke="#334155" stroke-width="2"/><line x1="810" y1="181" x2="810" y2="193" stroke="#334155" stroke-width="1.6"/></g>`;
    tplG.innerHTML = `<g id="tpl-spin"><circle cx="92" cy="187" r="7.5" fill="#f1f5f9" stroke="#334155" stroke-width="2"/><line x1="92" y1="181" x2="92" y2="193" stroke="#334155" stroke-width="1.6"/></g>`;
    // 梯级链（虚线滚动）+ 黄色塑料链节节点（v1.2.7：周期与链虚线一致 12+7=19，随链同步移动）
    const chainP = E('path', { d: loopPath, fill: 'none', stroke: C.chain, 'stroke-width': 4.6, 'stroke-dasharray': '12 7' });
    svg.appendChild(chainP);
    const chainN = E('path', { d: loopPath, fill: 'none', stroke: C.chainNode, 'stroke-width': 8, 'stroke-dasharray': '3.5 15.5' });
    svg.appendChild(chainN);
    const rollersG = E('g', {}); svg.appendChild(rollersG);
    const stepsG = E('g', {}); svg.appendChild(stepsG);
    const dynG = E('g', {}); svg.appendChild(dynG);
    const statusTxt = E('text', { x: 450, y: 655, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 800, fill: '#1e3a8a', 'font-family': 'inherit' });
    svg.appendChild(statusTxt);

    ctx.state.dir = 'up'; ctx.state.v = 0.5; ctx.state.i = '24';
    let s = 0, offD = 0, offS = 0;

    function stepShape(rot, auxX, auxY) {
      // 轮轴与滚轮固定（不随踏面翻转旋转）：主轮在踏面右下、辅轮在踏面左下；
      // 辅轮竖直偏置随区段变化（工作段共面、返回段在主轨之上），始终骑于辅轨。
      const rM = 12, rA = 7, xM = 7;
      let ribs = '';
      for (let x = -24; x <= 14; x += 3) ribs += line(x, -21.2, x, -15.8, '#a8a29e', 1);
      // 侧板架（v1.2.7 新增·铝合金弧形侧板）：包住主/辅轮外缘的胶囊形包络，
      // 随 auxX/auxY 动态跟随两轮——返回段辅轮上移时仍能正确包裹，不随踏面翻转。
      const side = `<path d="M${(xM + rM + 2).toFixed(1)} 0 A ${rM + 2} ${rM + 2} 0 0 1 ${(xM - rM - 2).toFixed(1)} 0`
        + ` L ${(auxX - rA - 2).toFixed(1)} ${auxY.toFixed(1)} A ${rA + 2} ${rA + 2} 0 0 1 ${(auxX + rA + 2).toFixed(1)} ${auxY.toFixed(1)} Z"`
        + ` fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.4"/>`;
      // 轮轴 + 滚轮（固定，骑于主/辅轨）：主轮红色聚氨酯 + 金属轮毂 + 轴承心；辅轮黑色带毂
      const axle = line(xM, 0, auxX, auxY, '#64748b', 3)
        + `<circle cx="${auxX}" cy="${auxY}" r="${rA}" fill="#27272a" stroke="#18181b" stroke-width="1.8"/>`
        + `<circle cx="${auxX}" cy="${auxY}" r="2.3" fill="#a1a1aa" stroke="#18181b" stroke-width="1.1"/>`
        + `<circle cx="${xM}" cy="0" r="${rM}" fill="#dc2626" stroke="#991b1b" stroke-width="2.4"/>`
        + `<circle cx="${xM}" cy="0" r="4.6" fill="#e2e8f0" stroke="#991b1b" stroke-width="1.6"/>`
        + `<circle cx="${xM}" cy="0" r="2" fill="#57534e"/>`;
      // 踏板（黄色警示条 + 铝本色踏面）+ 铝本色弧形踢板（绕轴翻转：工作段踏面朝上、返回段踏面朝下）
      const body = `<g transform="rotate(${rot})">`
        + `<rect x="-26" y="-24" width="42" height="2.6" rx="1" fill="#fbbf24" stroke="#b45309" stroke-width="0.8"/>`
        + `<rect x="-26" y="-21.4" width="42" height="5.9" rx="1" fill="#d6d3d1" stroke="#94a3b8" stroke-width="1.3"/>`
        + ribs
        + `<path d="M-26 -15.5 C -33 -8 -33 4 -22 11 L -12 11 L -12 -15.5 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="1.4"/>`
        + `</g>`;
      return side + axle + body;
    }
    function stepRot(sv) {
      if (sv < lenW) return 0;                                  // 工作段·踏面水平
      if (sv < lenWD) return 180 * (sv - lenW) / (lenWD - lenW); // 上端链轮：0→180（踏面始终朝环外翻转）
      if (sv < lenWDR) return 180;                              // 返回段·倒置
      return 180 + 180 * (sv - lenWDR) / (LEN - lenWDR);         // 下端链轮：180→360，翻转方向与链轮切线一致（修复反转）
    }
    function paint(dt) {
      const dir = ctx.state.dir === 'up' ? 1 : ctx.state.dir === 'down' ? -1 : 0;
      const v = +ctx.state.v || 0.5, i = +ctx.state.i || 24;
      const vpx = v * SCALE * dir;
      if (dir !== 0) s += vpx * dt;
      const angD = s / 54 * 57.2958;                    // 主轴角（deg，链轮半径 54px）
      const angW = angD * 16 / 12;                      // 减速箱输出（z1/z2 速比）
      const angM = -angW * i;                           // 电机（经蜗轮蜗杆反向）
      $('#d-spin', svg) && $('#d-spin', svg).setAttribute('transform', `rotate(${(angD % 360).toFixed(1)} 820 290)`);
      $('#t-spin', svg) && $('#t-spin', svg).setAttribute('transform', `rotate(${(angD % 360).toFixed(1)} 100 500)`);
      $('#z2-spin', svg) && $('#z2-spin', svg).setAttribute('transform', `rotate(${(angD % 360).toFixed(1)} 760 290)`);
      $('#add-spin', svg) && $('#add-spin', svg).setAttribute('transform', `rotate(${(angD % 360).toFixed(1)} 870 290)`);
      $('#ww-spin', svg) && $('#ww-spin', svg).setAttribute('transform', `rotate(${(angW % 360).toFixed(1)} 845 138)`);
      $('#z1-spin', svg) && $('#z1-spin', svg).setAttribute('transform', `rotate(${(angW % 360).toFixed(1)} 800 168)`);
      fanG.setAttribute('transform', `rotate(${(angM % 360).toFixed(1)} 720 125)`);
      const th = ((angM * 0.18) % 9 + 9) % 9;
      wormG.querySelectorAll('line[stroke="#c2410c"]').forEach((ln, k) => ln.setAttribute('transform', `translate(${th.toFixed(2)} 0)`));
      $('#h-spin', svg) && $('#h-spin', svg).setAttribute('transform', `rotate(${(s * 1.01 / 18 * 57.2958 % 360).toFixed(1)} 740 209)`);
      $('#p-spin', svg) && $('#p-spin', svg).setAttribute('transform', `rotate(${(-s * 1.01 / 13 * 57.2958 % 360).toFixed(1)} 740 170)`);
      $('#tpu-spin', svg) && $('#tpu-spin', svg).setAttribute('transform', `rotate(${(s * 1.01 / 7.5 * 57.2958 % 360).toFixed(1)} 810 187)`);
      $('#tpl-spin', svg) && $('#tpl-spin', svg).setAttribute('transform', `rotate(${(s * 1.01 / 7.5 * 57.2958 % 360).toFixed(1)} 92 187)`);
      chainP.setAttribute('stroke-dashoffset', (-s).toFixed(1));
    if (typeof chainN !== 'undefined') chainN.setAttribute('stroke-dashoffset', (-s).toFixed(1));
      offD -= vpx * 16 / 54 * dt;
      $('#dcL', svg).setAttribute('stroke-dashoffset', offD.toFixed(1));
      $('#dcR', svg).setAttribute('stroke-dashoffset', offD.toFixed(1));
      offS -= vpx * 1.01 * 11 / 18 * dt;
      $('#scL', svg).setAttribute('stroke-dashoffset', offS.toFixed(1));
      $('#scR', svg).setAttribute('stroke-dashoffset', offS.toFixed(1));
      [svg.querySelectorAll('line[x1="95"][y1="183"]')[0], svg.querySelectorAll('line[x1="805"][y1="191"]')[0]].forEach(l => {
        if (l) { l.setAttribute('stroke-dasharray', '10 6'); l.setAttribute('stroke-dashoffset', (-s * 1.01).toFixed(1)); }
      });
      // 链条滚子
      let rl = '';
      for (let d = 0; d < LEN; d += 28) {
        const q = polyPoint(LOOP, ((d - s) % LEN + LEN) % LEN);
        rl += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="2.4" fill="#a8a29e"/>`;
      }
      rollersG.innerHTML = rl;
      // 梯级（踏面水平于工作/返回段；端部链轮处翻转；主轮在主轨、辅轮在辅轨）
      let st = '';
      const SP = LEN / NSTEP;
      for (let k = 0; k < NSTEP; k++) {
        const sv = ((s + k * SP) % LEN + LEN) % LEN;
        const p = polyPoint(LOOP, sv);
        const [auxX, auxY] = auxOffsetAt(sv, LOOP, lenW, lenWD, lenWDR, LEN, -20, 30);
        st += `<g transform="translate(${p[0].toFixed(1)},${p[1].toFixed(1)})">` + stepShape(stepRot(sv), auxX, auxY) + `</g>`;
        if (sv < lenW && k === 5) {
          const ty = p[1] - 22;
          st += `<g transform="translate(${(p[0] + 8).toFixed(1)},${ty.toFixed(1)})" fill="none" stroke="#1d4ed8" stroke-width="2.2" stroke-linecap="round">`
            + `<circle cx="0" cy="-12" r="4.6" fill="#dbeafe"/>`
            + line(0, -7, 0, 6, '#1d4ed8', 2.4) + line(0, -2, 9, 4, '#1d4ed8', 2.2)
            + line(0, 6, -5, 14, '#1d4ed8', 2.4) + line(0, 6, 5, 14, '#1d4ed8', 2.4) + `</g>`;
        }
      }
      stepsG.innerHTML = st;
      // 方向箭头
      dynG.innerHTML = dir !== 0
        ? (dir > 0 ? `<polygon points="196,452 214,446 214,458" fill="#059669"/>` : `<polygon points="214,452 196,446 196,458" fill="#dc2626"/>`)
        : '';
      const n2 = v * 60 / (Math.PI * 0.8), nout = n2 * 16 / 12, nm = nout * i;
      statusTxt.textContent = dir === 0 ? '停机抱闸（工作制动器失电抱闸，附加制动器随动）'
        : `运行中 · ${dir > 0 ? '上行' : '下行'} · 梯级 ${v.toFixed(2)} m/s · 扶手带 ${(v * 1.01).toFixed(2)} m/s（超前 +1%）`;
      statusTxt.setAttribute('fill', dir === 0 ? '#64748b' : dir > 0 ? '#059669' : '#dc2626');
      ctx.readout([
        ['运行方向', dir > 0 ? '<b style="color:#059669">上行</b>' : dir < 0 ? '<b style="color:#dc2626">下行</b>' : '停机'],
        ['梯级速度', `${v.toFixed(2)} m/s`],
        ['扶手带速度', `<b>${(v * 1.01).toFixed(2)} m/s（超前 +1%）</b>`],
        ['主轴转速 n₂', `${n2.toFixed(1)} r/min（链轮 PCD ≈ 0.8 m）`],
        ['减速箱输出转速', `${nout.toFixed(1)} r/min（传动链速比 12/16）`],
        ['电机转速 n₁', `${nm.toFixed(0)} r/min（i = ${i}）`],
        ['梯级间距', '400 mm（链轮齿数 × 链节距）'],
        ['主辅轮轨', '<b style="color:#1d4ed8">主轮沿主轨 · 辅轮沿辅轨保持踏面水平</b>']
      ]);
    }
    paint(0.016);
    return {
      destroy: ticker(dt => paint(dt)),
      onchange(k, v2) { ctx.state[k] = v2; },
      onaction() { }
    };
  }
};

SIMS.step = {
  title: '梯级系统 · 梯级解剖与主辅轮交互仿真',
  desc: '左图解析梯级真实构造：铝合金防滑齿槽踏面在上（顶面黄色警示条）、黄色踢面为前缘弧形板（曲面啮合）、桁架式梯级架连接主轮（前轴·承载·位于踏板右下）与辅轮（后轴·导向·位于弧形踢板正下方）；右图动态演示梯级沿"工作导轨 → 转向导轨（链轮 180° 翻转）→ 返回导轨"闭环运行，主轮沿主轨、辅轮沿辅轨保持踏面水平，端部链轮处平滑翻转。',
  photos: [
    { f: 'real-step-1', cap: '梯级实物（踏板 + 踢板 + 支架）' },
    { f: 'real-step-2', cap: '梯级背面与梯级轴连接' },
    { f: 'real-step-wheel-1', cap: '梯级主轮 / 辅轮实物（聚氨酯包覆）' },
    { f: 'real-step-wheel-worn', cap: '磨损超限的梯级轮（应成套更换）' }
  ],
  notes: [
    '梯级 = 踏板（铝合金防滑齿槽踏面·顶面黄色警示条）+ 踢板（铝合金本色前缘弧形板，仅前缘警示条为黄色）+ 铝合金弧形侧板架 + 主轮（前轴 2 个·承载约 2/3·红色聚氨酯包覆 + 金属轮毂轴承）+ 辅轮（后轴 2 个·导向约 1/3·黑色带金属毂滚轮）+ 桁架式梯级架与梯级轴。',
    '梯级链滚子与导板为工程塑料（黄色），梯级轴经塑料衬套与链节铰接，降低运行噪声；主轮聚氨酯颜色随厂家不同（红 / 米黄 / 橙红 / 蓝绿），磨损检查看轮径与偏磨。',
    '倾斜段主轮沿工作导轨、辅轮沿辅轮导轨，两导轨高差 Δh = 轮距 × tan30° ≈ 231 mm，使踏面保持水平呈台阶状。',
    '上下水平段各 ≥2 级梯级完全放平（本仿真已按此绘制）：水平梯级数与提升高度 / 速度挂钩——提升高度 ≥6 m 或名义速度 ≥0.5 m/s 时，水平段长度应 ≥1.2 m，保证乘客有足够站立缓冲距离。',
    '端部链轮（PCD≈0.8 m）使梯级在 180° 范围内平滑翻转：工作段踏面向上 → 转向段翻转 → 返回段踏面朝下（倒置）运行。',
    '轮面磨损超限会引起梯级抖动与台阶感，滚轮须成套更换。',
    '弯弧段辅轨向外分离并延伸为卸载导轨（图中绿色短弧）—— 滚轮载荷在转向区由卸载导轨承接，防止梯级绕主轮轴倾翻。'
  ],
  controls: [
    { key: 'dir', type: 'select', label: '运行', value: 'run', options: [['run', '连续运行（上行）'], ['pause', '暂停']] },
    { key: 'v', type: 'range', label: '运行速度', min: 0.2, max: 0.75, step: 0.05, value: 0.5, unit: ' m/s' },
    { key: 'wear', type: 'checkbox', label: '模拟轮面磨损（−8%）', value: false }
  ],
  mount(ctx) {
    // v1.2.8：viewBox 800→880、右栏 400→480 宽（梯级闭环随驱动链轮右移至 raw x=874，缩放后到 851）
    const svg = makeSvg(ctx.stage, '0 0 880 560', `
      ${txtEl(440, 26, '梯级解剖（左） · 工作→转向→返回 循环（右）', { size: 13.5, fill: '#b45309' })}
      ${box(25, 44, 330, 400, '#fffbeb', '#fde68a', 2, 10)}
      ${txtEl(190, 70, '梯级真实构造（侧视）', { size: 12.5, fill: '#92400e' })}
      ${box(375, 44, 480, 400, '#f8fafc', '#cbd5e1', 2, 10)}
      ${txtEl(615, 70, '梯级闭环：工作轨 → 链轮 180° 翻转 → 返回轨', { size: 12, fill: '#334155' })}
      ${box(25, 456, 830, 84, '#eff6ff', '#bfdbfe', 1.6, 8)}
      ${txtEl(440, 480, '铝合金防滑齿槽踏面在上（顶面黄色警示条）、黄色踢面为前缘斜板；主轮（前轴·承载约 2/3）与辅轮（后轴·导向）分置前后，两轴高差 Δh = 轮距×tan30° ≈ 231 mm。', { size: 11.5, fill: '#1e40af' })}
      ${txtEl(440, 508, '端部链轮（PCD≈0.8m）使梯级平滑翻转 180°：工作段踏面水平 → 转向段翻转 → 返回段倒置运行。上下水平段各 ≥2 级梯级完全放平。', { size: 11.5, fill: '#1e40af' })}
    `);
    /* ---- 左：解剖图（修正：踏板在上、踢板前缘立板、主轮前/辅轮后） ---- */
    svg.insertAdjacentHTML('beforeend', `
      <!-- 踏板（v1.2.7：铝本色铝合金防滑齿槽踏面 + 顶面黄色警示条） -->
      <rect x="108" y="162" width="196" height="6" rx="2" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
      <rect x="108" y="168" width="196" height="22" rx="3" fill="#d6d3d1" stroke="#94a3b8" stroke-width="2.2"/>
      ${Array.from({ length: 17 }, (_, k) => line(117 + k * 11, 171, 117 + k * 11, 188, '#a8a29e', 1.1)).join('')}
      <!-- 踢板（v1.2.7：铝本色弧形板，位于踏板左下方；正下方为辅轮） -->
      <path d="M108 190 C 98 216 100 246 116 262 L 156 262 L 156 190 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="2.2"/>
      ${[0,1,2].map(k => line(122 + k * 12, 198, 118 + k * 12, 252, '#94a3b8', 0.9)).join('')}
      <!-- 梯级架（桁架式支架：横梁 + 斜撑） -->
      <path d="M286 190 L300 264 M138 256 L300 264 M150 202 L138 256 M180 202 L170 260 M212 202 L208 262 M244 202 L252 264 M270 202 L282 264" fill="none" stroke="#64748b" stroke-width="3.2" stroke-linecap="round"/>
      <rect x="150" y="190" width="120" height="12" rx="3" fill="#94a3b8" stroke="#64748b" stroke-width="1.4"/>
      <!-- 主轮（前轴，大，承载，红色聚氨酯轮 + 金属轮毂 + 轴承心） -->
      <circle cx="290" cy="266" r="26" fill="#dc2626" stroke="#991b1b" stroke-width="2.6"/>
      <circle cx="290" cy="266" r="11" fill="#e2e8f0" stroke="#991b1b" stroke-width="2"/>
      <circle cx="290" cy="266" r="3.2" fill="#57534e"/>
      <circle cx="256" cy="266" r="18" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="3 3"/>
      <!-- 辅轮（v1.2.7：后轴，小，导向，黑色带金属毂滚轮，位置偏低） -->
      <circle cx="150" cy="290" r="17" fill="#27272a" stroke="#18181b" stroke-width="2.2"/>
      <circle cx="150" cy="290" r="7" fill="#a1a1aa" stroke="#18181b" stroke-width="1.8"/>
      <circle cx="124" cy="290" r="12" fill="none" stroke="#52525b" stroke-width="1.8" stroke-dasharray="3 3"/>
      <!-- 前后轴连线（梯级架下沿） -->
      ${line(150, 290, 290, 266, '#64748b', 3)}
      <!-- 梯级轴 / 链连接 -->
      ${line(296, 266, 334, 266, '#78716c', 4, '6 4')}
      ${txtEl(316, 256, '梯级轴', { anchor: 'start', size: 11, fill: '#57534e' })}
      <!-- 标注 -->
      ${txtEl(150, 156, '踏板（防滑齿槽·乘客站立）', { size: 11.5, fill: '#92400e' })}
      ${line(150, 162, 180, 168, '#b45309', 1.1)}
      ${txtEl(96, 232, '踢板', { anchor: 'end', size: 11.5, fill: '#92400e' })}
      ${line(100, 228, 108, 230, '#b45309', 1.1)}
      ${txtEl(250, 322, '主轮（前轴·承载）', { size: 11.5, fill: '#92400e' })}
      ${txtEl(150, 336, '辅轮（后轴·导向）', { size: 11.5, fill: '#92400e' })}
      <!-- Δh 标注（两轴高差） -->
      ${line(108, 266, 108, 290, '#7c3aed', 1.4)}
      ${line(104, 266, 112, 266, '#7c3aed', 1.4)}${line(104, 290, 112, 290, '#7c3aed', 1.4)}
      ${txtEl(98, 282, 'Δh', { anchor: 'end', size: 11, fill: '#7c3aed' })}
      ${txtEl(45, 96, '梯级宽度：600 / 800 / 1000 mm', { anchor: 'start', size: 11, fill: '#57534e' })}
      ${txtEl(45, 118, '材质：不锈钢 / 压铸铝', { anchor: 'start', size: 11, fill: '#57534e', weight: 500 })}
      ${txtEl(45, 140, '滚轮：聚氨酯包覆 + 轴承', { anchor: 'start', size: 11, fill: '#57534e', weight: 500 })}
    `);
    /* ---- 右：梯级闭环（工作→转向→返回），复用 drive 几何并缩放 ---- */
    const S = 0.6, TX = 320, TY = 19;
    const P = (x, y) => [x * S + TX, y * S + TY];
    const al = -30 * Math.PI / 180, cosA = Math.cos(al), sinA = Math.sin(al);
    const rD = 54, rT = 54, iL = 420;
    /* v1.2.8：与 drive 模块严格同步 —— Dc=[820,290]、iL=420、倾斜段基准 270（原写 250 是历史错误）。
       若只改 W 不改链轮中心，闭环会多出一段直线，梯级最近邻间距会塌陷（上一版踩过此坑）。 */
    const Wraw = [[100, 446], [270, 446], [270 + iL * cosA, 446 + iL * sinA], [820, 290 - rD]];
    const wrapDraw = arcPts(820, 290, rD, -Math.PI / 2, Math.PI / 2, 16);
    const Rraw = [[820, 290 + rD], [270 + iL * cosA, 446 + iL * sinA + 2 * rD], [270, 554], [100, 554]];
    const wrapTraw = arcPts(100, 500, rT, Math.PI / 2, Math.PI * 1.5, 16);   // v1.2.7：链轮随水平段左移
    const LOOPraw = Wraw.concat(wrapDraw.slice(1), Rraw.slice(1), wrapTraw.slice(1));
    const LOOP = LOOPraw.map(p => P(p[0], p[1]));
    const Wsc = Wraw.map(p => P(p[0], p[1]));
    const Rsc = Rraw.map(p => P(p[0], p[1]));
    const wrapDsc = wrapDraw.map(p => P(p[0], p[1]));
    const wrapTsc = wrapTraw.map(p => P(p[0], p[1]));
    const lenW = polyLen(Wsc), lenWD = lenW + polyLen(wrapDsc), lenWDR = lenWD + polyLen(Rsc), LEN = polyLen(LOOP);
    const loopPath = 'M' + LOOP.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ') + ' Z';
    const P_STEP = 32, DH = 15;
    const NSTEP = Math.max(1, Math.round(LEN / P_STEP)); // 整环等分：间距严格一致、无重复
    /* v1.2.8 自检：上、下水平段「可见放平段」（缩放后）均须 ≥2 个梯级间距。
       梳齿板边界常量与 drive 模块一致（raw 坐标：下端 124、上端 786）。 */
    const SP = LEN / NSTEP;
    const flatDn = (Wraw[1][0] - 124) * S, flatUp = (786 - Wraw[2][0]) * S;
    console.assert(flatDn >= 2 * SP, '下水平段放平梯级不足 2 级：' + flatDn.toFixed(1) + ' < ' + (2 * SP).toFixed(1));
    console.assert(flatUp >= 2 * SP, '上水平段放平梯级不足 2 级：' + flatUp.toFixed(1) + ' < ' + (2 * SP).toFixed(1));
    const railPath = (pts) => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ');
    svg.insertAdjacentHTML('beforeend', `
      <path d="${railPath(LOOP)}" fill="none" stroke="#cbd5e1" stroke-width="4" opacity="0.6"/>
      <path d="${mainRailD(LOOP)}" fill="none" stroke="#f59e0b" stroke-width="3.4"/>
      <path d="${auxRailD(LOOP, lenW, lenWD, lenWDR, LEN, -11, 15)}" fill="none" stroke="#7dd3fc" stroke-width="3.4"/>
      <!-- 卸载导轨（v1.2.7）：上下弯弧各一条，位于辅轨外侧，覆盖弯弧中段 ±50° -->
      ${unloadRailMarkup(820, 290, 54, -50, 50, P, S)}
      ${unloadRailMarkup(100, 500, 54, 130, 230, P, S)}
      ${auxSplitArrow(820, 290 - 54, 0, P, S)}
      ${auxSplitArrow(820, 290 + 54, 180, P, S)}
      ${auxSplitArrow(100, 500 - 54, 180, P, S)}
      ${auxSplitArrow(100, 500 + 54, 0, P, S)}
      <circle cx="${P(820,290)[0].toFixed(1)}" cy="${P(820,290)[1].toFixed(1)}" r="${(54*S).toFixed(1)}" fill="none" stroke="#1d4ed8" stroke-width="2.2" stroke-dasharray="5 4"/>
      <circle cx="${P(100,500)[0].toFixed(1)}" cy="${P(100,500)[1].toFixed(1)}" r="${(54*S).toFixed(1)}" fill="none" stroke="#7c3aed" stroke-width="2.2" stroke-dasharray="5 4"/>
      <!-- v1.2.8：右侧文字随新几何重排（不越界 880、不互压、不压倾斜段梯级） -->
      ${txtEl(700, 122, '主轨（主轮轨·踏面水平）', { anchor: 'start', size: 10.5, fill: '#b45309' })}
      ${txtEl(430, 320, '辅轨（工作共面·返回在上）', { anchor: 'start', size: 10.5, fill: '#0369a1' })}
      ${txtEl(795, 100, '主驱动链轮（180° 翻转）', { anchor: 'end', size: 10.5, fill: '#1d4ed8' })}
      ${txtEl(390, 400, '张紧链轮（180° 翻回）', { anchor: 'start', size: 10.5, fill: '#7c3aed' })}
      ${txtEl(685, 200, '弯弧段：辅轨与主轨分离', { anchor: 'start', size: 10.5, fill: '#0369a1' })}
      ${txtEl(400, 266, '弯弧段：辅轨与主轨分离', { anchor: 'start', size: 10.5, fill: '#0369a1' })}
      <!-- §四 倾斜段主/辅轮行内标注（引线指向倾斜段中部；主轮在坡上侧承载、辅轮在坡下侧导向） -->
      ${line(660, 292, 600, 228, '#b45309', 1.2, '4 3')}
      ${txtEl(668, 302, '主轮·斜上（承载）', { anchor: 'start', size: 10.5, fill: '#b45309' })}
      ${line(524, 330, 585, 224, '#0369a1', 1.2, '4 3')}
      ${txtEl(516, 340, '辅轮·斜下（导向）', { anchor: 'start', size: 10.5, fill: '#0369a1' })}
    `);
      const chainP = E('path', { d: loopPath, fill: 'none', stroke: C.chain, 'stroke-width': 3.6, 'stroke-dasharray': '10 6' });
      svg.appendChild(chainP);
      // 黄色塑料链节节点（v1.2.7）：周期与链虚线一致（10+6=16），随链同步移动
      const chainN = E('path', { d: loopPath, fill: 'none', stroke: C.chainNode, 'stroke-width': 6.4, 'stroke-dasharray': '3 13' });
      svg.appendChild(chainN);
    const stepsG = E('g', {}); svg.appendChild(stepsG);
    const statusTxt = E('text', { x: 575, y: 432, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 800, fill: '#334155', 'font-family': 'inherit' });
    svg.appendChild(statusTxt);
    ctx.state.dir = 'run'; ctx.state.v = 0.5; ctx.state.wear = false;
    let s = 0;
    function stepShape(rot, auxX, auxY) {
      const rM = 8, rA = 5, xM = 4;
      let ribs = '';
      for (let x = -13; x <= 9; x += 2.6) ribs += line(x, -11.6, x, -9.9, '#a8a29e', 0.8);
      // 侧板架（v1.2.7 新增·铝合金弧形侧板）：包住主/辅轮外缘的胶囊形包络，随 auxX/auxY 动态跟随两轮
      const side = `<path d="M${(xM + rM + 2).toFixed(1)} 0 A ${rM + 2} ${rM + 2} 0 0 1 ${(xM - rM - 2).toFixed(1)} 0`
        + ` L ${(auxX - rA - 2).toFixed(1)} ${auxY.toFixed(1)} A ${rA + 2} ${rA + 2} 0 0 1 ${(auxX + rA + 2).toFixed(1)} ${auxY.toFixed(1)} Z"`
        + ` fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.4"/>`;
      // 轮轴 + 滚轮（固定，骑于主/辅轨）：主轮红色聚氨酯 + 金属轮毂 + 轴承心；辅轮黑色带毂
      const axle = line(xM, 0, auxX, auxY, '#64748b', 1.8)
        + `<circle cx="${auxX}" cy="${auxY}" r="${rA}" fill="#27272a" stroke="#18181b" stroke-width="1.4"/>`
        + `<circle cx="${auxX}" cy="${auxY}" r="1.8" fill="#a1a1aa" stroke="#18181b" stroke-width="0.8"/>`
        + `<circle cx="${xM}" cy="0" r="${rM}" fill="#dc2626" stroke="#991b1b" stroke-width="1.8"/>`
        + `<circle cx="${xM}" cy="0" r="3" fill="#e2e8f0" stroke="#991b1b" stroke-width="1.1"/>`
        + `<circle cx="${xM}" cy="0" r="1.3" fill="#57534e"/>`;
      // 踏板（黄色警示条 + 铝本色踏面）+ 铝本色弧形踢板（绕轴翻转：工作段踏面朝上、返回段踏面朝下）
      const body = `<g transform="rotate(${rot})">`
        + `<rect x="-15" y="-14.6" width="26" height="1.9" rx="0.6" fill="#fbbf24" stroke="#b45309" stroke-width="0.6"/>`
        + `<rect x="-15" y="-12.7" width="26" height="3" rx="0.6" fill="#d6d3d1" stroke="#94a3b8" stroke-width="1"/>`
        + ribs
        + `<path d="M-15 -9.7 C -19 -5 -19 2 -14 5.5 L -8 5.5 L -8 -9.7 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="0.9"/>`
        + `</g>`;
      return side + axle + body;
    }
    function stepRot(sv) {
      if (sv < lenW) return 0;
      if (sv < lenWD) return 180 * (sv - lenW) / (lenWD - lenW);   // 上端链轮：0→180（踏面始终朝环外翻转）
      if (sv < lenWDR) return 180;
      return 180 + 180 * (sv - lenWDR) / (LEN - lenWDR);           // 下端链轮：180→360，翻转方向与链轮切线一致（修复反转）
    }
    function paint() {
      const wear = !!ctx.state.wear;
      chainP.setAttribute('stroke-dashoffset', (-s).toFixed(1));
    if (typeof chainN !== 'undefined') chainN.setAttribute('stroke-dashoffset', (-s).toFixed(1));
      let st = '';
      const SP = LEN / NSTEP;
      for (let k = 0; k < NSTEP; k++) {
        const sv = ((s + k * SP) % LEN + LEN) % LEN;
        const p = polyPoint(LOOP, sv);
        const [auxX, auxY] = auxOffsetAt(sv, LOOP, lenW, lenWD, lenWDR, LEN, -11, 15);
        st += `<g transform="translate(${p[0].toFixed(1)},${p[1].toFixed(1)})">` + stepShape(stepRot(sv), auxX, auxY) + `</g>`;
      }
      stepsG.innerHTML = st;
      statusTxt.textContent = wear
        ? '轮面磨损 −8%：梯面下沉、台阶感与异响 —— 须成套更换滚轮'
        : '闭环运行：工作段水平 → 链轮 180° 翻转 → 返回段倒置';
      statusTxt.setAttribute('fill', wear ? '#b91c1c' : '#334155');
      ctx.readout([
        ['踏板 / 踢板', '踏板水平（乘客站立）· 踢板为前缘弧形板（曲面啮合）'],
        ['主轮（前轴）', `承载约 2/3${wear ? ' · <b style="color:#dc2626">磨损 −8%</b>' : ' · φ76（教学值）'}`],
        ['辅轮（后轴）', `导向保持姿态${wear ? ' · <b style="color:#dc2626">同步磨损</b>' : ' · φ50（教学值）'}`],
        ['轮距 Δh', '400 × tan30° ≈ <b>231 mm</b>（工作共面·返回辅轨在上）'],
        ['端部转向', '链轮 PCD≈0.8m，梯级平滑翻转 180°'],
        ['磨损状态', wear ? '<b style="color:#dc2626">超限 —— 抖动、异响，须更换</b>' : '<b style="color:#059669">正常</b>']
      ]);
    }
    paint();
    return {
      destroy: ticker(dt => { if (ctx.state.dir === 'run') { s = (s + (+ctx.state.v || 0.5) * 140 * dt) % LEN; } paint(); }),
      onchange(k, v2) { ctx.state[k] = v2; },
      onaction() { }
    };
  }
};

/* =======================================================================
 * 4. 梯路系统 · 导轨断面与端部转向仿真
 * ===================================================================== */
SIMS.rail = {
  title: '梯路系统 · 导轨断面与端部转向仿真',
  desc: '左图解析工作导轨断面与轮轨关系；右图演示梯级沿"工作导轨 → 端部链轮转向（180° 翻转）→ 返回导轨"闭环运行，并支持倾角切换观察 Δh 变化。端部链轮（PCD≈0.8m）给出真实扶梯的正常转向弧度，梯级平滑翻转。',
  photos: [
    { f: 'real-guide-rail', cap: '梯路导轨弯段实物（冷弯成型 + 支架）' }
  ],
  notes: [
    '工作导轨（主轮轨）承载乘客载荷，是梯路的主要受力轨；辅轮轨仅承受梯级自重并保证返回段姿态。',
    '导轨为优质碳素钢冷弯成型，表面硬度 HB220~260，直线度不大于 0.5 mm/m。',
    '端部转向由链轮（PCD≈0.8m）完成：梯级在 180° 范围内平滑翻转，由倾斜平稳过渡到水平，避免冲击。',
    '两列导轨的间距与平行度误差直接影响梯级跑偏，安装时须以桁架基准面找正。'
  ],
  controls: [
    { key: 'alpha', type: 'select', label: '梯路倾角 α', value: '30', options: [['27.3', '27.3°（商用自动人行道）'], ['30', '30°（常用）'], ['35', '35°（特殊场合）']] },
    { key: 'dir', type: 'select', label: '运行', value: 'run', options: [['run', '连续运行'], ['pause', '暂停']] },
    { key: 'v', type: 'range', label: '运行速度', min: 0.2, max: 0.75, step: 0.05, value: 0.5, unit: ' m/s' }
  ],
  mount(ctx) {
    // v1.2.8：viewBox 800→880、右栏 400→485 宽（闭环随驱动链轮右移，27.3° 时 raw x 最大到 895）
    const svg = makeSvg(ctx.stage, '0 0 880 580', `
      ${txtEl(440, 26, '导轨断面（左） · 端部转向曲线（右）', { size: 13.5, fill: '#1d4ed8' })}
      ${box(25, 44, 330, 440, '#f8fafc', '#cbd5e1', 2, 10)}
      ${txtEl(190, 70, '工作导轨断面与轮轨关系', { size: 12.5, fill: '#1e40af' })}
      ${box(375, 44, 485, 440, '#f8fafc', '#cbd5e1', 2, 10)}
      ${txtEl(617, 70, '端部转向导轨（链轮 180° 翻转）', { size: 12.5, fill: '#1e40af' })}
      ${box(25, 496, 830, 64, '#eff6ff', '#bfdbfe', 1.6, 8)}
      ${txtEl(440, 520, '导轨：优质碳素钢冷弯成型 · 表面硬度 HB220~260 · 直线度 ≤ 0.5 mm/m · 经支架与垫板固定于桁架基准面。', { size: 12, fill: '#1e40af' })}
      ${txtEl(440, 544, '梯级主轮沿工作导轨承载运行，辅轮沿辅轮导轨导向；端部链轮（PCD≈0.8m）使梯级平滑翻转 180°。', { size: 12, fill: '#1e40af' })}
      ${txtEl(440, 566, '弯弧段辅轨向外分离并延伸为卸载导轨（绿色）—— 滚轮载荷在转向区由卸载导轨承接，防止梯级绕主轮轴倾翻。', { size: 11.5, fill: '#047857' })}
    `);
    /* ---- 左：断面图 ---- */
    svg.insertAdjacentHTML('beforeend', `
      <polygon points="90,300 250,300 250,340 220,340 220,316 120,316 120,340 90,340" fill="#e2e8f0" stroke="#475569" stroke-width="2.6"/>
      <circle cx="170" cy="272" r="30" fill="#fdba74" stroke="${C.stepS}" stroke-width="2.6"/>
      <circle cx="170" cy="272" r="12" fill="#fff" stroke="${C.stepS}" stroke-width="2"/>
      ${txtEl(170, 240, '梯级主轮（轮缘进入轨槽导向）', { size: 11.5, fill: '#92400e' })}
      ${line(170, 246, 170, 242, '#b45309', 1.2)}
      ${txtEl(45, 400, '工作导轨（帽形冷弯断面）', { anchor: 'start', size: 11.5, fill: '#334155' })}
      <rect x="146" y="340" width="48" height="12" fill="#a8a29e" stroke="#57534e" stroke-width="1.8"/>
      <rect x="158" y="352" width="24" height="26" fill="#78716c" stroke="#57534e" stroke-width="1.8"/>
      ${txtEl(45, 424, '支架 + 垫板（固定于桁架弦杆）', { anchor: 'start', size: 11.5, fill: '#57534e' })}
      <polygon points="255,392 325,392 325,414 305,414 305,404 275,404 275,414 255,414" fill="#e2e8f0" stroke="#475569" stroke-width="2.2"/>
      <circle cx="290" cy="378" r="17" fill="#fdba74" stroke="${C.stepS}" stroke-width="2.2"/>
      ${txtEl(290, 438, '辅轮轨（仅承梯级自重）', { size: 11.5, fill: '#0e7490' })}
      ${txtEl(45, 110, '轨面淬硬：HB220 ~ 260', { anchor: 'start', size: 11.5, fill: '#334155', weight: 500 })}
      ${txtEl(45, 136, '直线度：≤ 0.5 mm/m', { anchor: 'start', size: 11.5, fill: '#334155', weight: 500 })}
      ${txtEl(45, 162, '接头平齐、错开布置', { anchor: 'start', size: 11.5, fill: '#334155', weight: 500 })}
      ${txtEl(45, 188, '防止梯级运行台阶与冲击', { anchor: 'start', size: 11.5, fill: '#64748b', weight: 500 })}
      <!-- §四 倾斜段主/辅轮共面说明 + 30° 坡度示意（主轮在坡上侧、辅轮在坡下侧） -->
      ${box(45, 200, 290, 88, '#f0f9ff', '#7dd3fc', 1.6, 8)}
      ${txtEl(60, 222, '倾斜段：主 / 辅轮同一平面（导轨共面）', { anchor: 'start', size: 11.5, fill: '#0369a1' })}
      ${txtEl(60, 242, '主轮位于坡上侧（承载），辅轮位于坡下侧（导向）', { anchor: 'start', size: 10.5, fill: '#0e7490', weight: 500 })}
      ${line(66, 278, 116, 278, '#94a3b8', 1.2)}
      ${line(66, 278, 109, 253, '#94a3b8', 1.4)}
      ${txtEl(122, 282, '30°', { anchor: 'start', size: 10, fill: '#64748b', weight: 600 })}
      <circle cx="88" cy="266" r="5" fill="#dc2626" stroke="#991b1b" stroke-width="1.4"/>
      <circle cx="73" cy="273" r="3.6" fill="#27272a" stroke="#18181b" stroke-width="1.1"/>
      ${txtEl(150, 266, '主轮（坡上）', { anchor: 'start', size: 9.5, fill: '#b45309', weight: 600 })}
      ${txtEl(150, 281, '辅轮（坡下）', { anchor: 'start', size: 9.5, fill: '#0369a1', weight: 600 })}
    `);
    /* ---- 右：梯级闭环（工作→转向→返回），倾角可调 ---- */
    const S = 0.6, TX = 320, TY = 19;
    const P = (x, y) => [x * S + TX, y * S + TY];
    /* v1.2.8：倾斜段长度固定 iL=420，【上水平段恒定 186.3 px】—— 驱动链轮中心随倾角平移，
       使 27.3 / 30 / 35° 三种倾角的「上水平段可见放平段」同为 152.3 px，均 ≥ 2×SP。
       （若 Dc 固定为 820，27.3° 时倾斜段水平投影 373 px 会把上水平段压到 176 px、可见放平段只剩 142 px。）
       Dc[0] = 倾斜段终点 x + 186.3；Dc[1] = 倾斜段终点 y + rD。 */
    const FLAT_UP = 186.3;                       // 上水平段（几何）长度，与 drive 模块一致（820−633.7）
    function buildLoop(alphaDeg) {
      const al = -alphaDeg * Math.PI / 180, cosA = Math.cos(al), sinA = Math.sin(al);
      const rD = 54, rT = 54, iL = 420;
      const ix = 270 + iL * cosA, iy = 446 + iL * sinA;          // 倾斜段终点
      const Dcx = ix + FLAT_UP, Dcy = iy + rD;                   // 主驱动链轮中心（随 α 平移）
      const Wraw = [[100, 446], [270, 446], [ix, iy], [Dcx, Dcy - rD]];
      const wrapDraw = arcPts(Dcx, Dcy, rD, -Math.PI / 2, Math.PI / 2, 16);
      const Rraw = [[Dcx, Dcy + rD], [ix, iy + 2 * rD], [270, 554], [100, 554]];
      const wrapTraw = arcPts(100, 500, rT, Math.PI / 2, Math.PI * 1.5, 16);   // v1.2.7：链轮随水平段左移
      const LOOPraw = Wraw.concat(wrapDraw.slice(1), Rraw.slice(1), wrapTraw.slice(1));
      const LOOP = LOOPraw.map(p => P(p[0], p[1]));
      const Wsc = Wraw.map(p => P(p[0], p[1]));
      const Rsc = Rraw.map(p => P(p[0], p[1]));
      const wrapDsc = wrapDraw.map(p => P(p[0], p[1]));
      const wrapTsc = wrapTraw.map(p => P(p[0], p[1]));
      const lenW = polyLen(Wsc), lenWD = lenW + polyLen(wrapDsc), lenWDR = lenWD + polyLen(Rsc), LEN = polyLen(LOOP);
      return { LOOP, Wsc, Rsc, wrapDsc, wrapTsc, lenW, lenWD, lenWDR, LEN, Dcx, Dcy, ix, rD };
    }
    let G = buildLoop(30);
    const railPath = (pts) => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ');
    const mainRail = E('path', { d: mainRailD(G.LOOP), fill: 'none', stroke: '#cbd5e1', 'stroke-width': 4, opacity: 0.6 });
    const railW = E('path', { d: mainRailD(G.LOOP), fill: 'none', stroke: '#f59e0b', 'stroke-width': 3.4 });
    const railR = E('path', { d: auxRailD(G.LOOP, G.lenW, G.lenWD, G.lenWDR, G.LEN, -11, 15, Math.sin(30 * Math.PI / 180)), fill: 'none', stroke: '#7dd3fc', 'stroke-width': 3.4 });
    svg.appendChild(mainRail); svg.appendChild(railW); svg.appendChild(railR);
    const wUp = E('circle', { cx: P(820, 290)[0], cy: P(820, 290)[1], r: 54 * S, fill: 'none', stroke: '#1d4ed8', 'stroke-width': 2.2, 'stroke-dasharray': '5 4' });
    const wLo = E('circle', { cx: P(100, 500)[0], cy: P(100, 500)[1], r: 54 * S, fill: 'none', stroke: '#7c3aed', 'stroke-width': 2.2, 'stroke-dasharray': '5 4' });
    svg.appendChild(wUp); svg.appendChild(wLo);
    // 卸载导轨 + 弯弧分离标注 + 倾斜段主/辅轮标注（v1.2.7）：随倾角 α 变化，故放 paint 内重建
    const unloadG = E('g', {}); svg.appendChild(unloadG);
    svg.insertAdjacentHTML('beforeend', `
      ${txtEl(700, 122, '主轨（主轮轨·踏面水平）', { anchor: 'start', size: 10.5, fill: '#b45309' })}
      ${txtEl(430, 320, '辅轨（工作共面·返回在上）', { anchor: 'start', size: 10.5, fill: '#0369a1' })}
      ${txtEl(795, 100, '主驱动链轮（180° 翻转）', { anchor: 'end', size: 10.5, fill: '#1d4ed8' })}
      ${txtEl(390, 400, '张紧链轮（180° 翻回）', { anchor: 'start', size: 10.5, fill: '#7c3aed' })}
      ${txtEl(410, 420, 'α：', { anchor: 'start', size: 12.5, fill: '#7c3aed' })}
    `);
    const alphaTxt = E('text', { x: 444, y: 420, 'text-anchor': 'start', 'font-size': 12.5, 'font-weight': 800, fill: '#7c3aed', 'font-family': 'inherit' });
    svg.appendChild(alphaTxt);
    const loopD = () => 'M' + G.LOOP.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ') + ' Z';
    const chainP = E('path', { d: loopD(), fill: 'none', stroke: C.chain, 'stroke-width': 3.6, 'stroke-dasharray': '10 6' });
    svg.appendChild(chainP);
    // 黄色塑料链节节点（v1.2.7）：周期与链虚线一致（10+6=16），随链同步移动
    const chainN = E('path', { d: loopD(), fill: 'none', stroke: C.chainNode, 'stroke-width': 6.4, 'stroke-dasharray': '3 13' });
    svg.appendChild(chainN);
    const stepsG = E('g', {}); svg.appendChild(stepsG);
    ctx.state.alpha = '30'; ctx.state.dir = 'run'; ctx.state.v = 0.5;
    let s = 0; const P_STEP = 32, DH = 15;
    function stepShape(rot, auxX, auxY) {
      const rM = 8, rA = 5, xM = 4;
      let ribs = '';
      for (let x = -13; x <= 9; x += 2.6) ribs += line(x, -11.6, x, -9.9, '#a8a29e', 0.8);
      // 侧板架（v1.2.7 新增·铝合金弧形侧板）：包住主/辅轮外缘的胶囊形包络，随 auxX/auxY 动态跟随两轮
      const side = `<path d="M${(xM + rM + 2).toFixed(1)} 0 A ${rM + 2} ${rM + 2} 0 0 1 ${(xM - rM - 2).toFixed(1)} 0`
        + ` L ${(auxX - rA - 2).toFixed(1)} ${auxY.toFixed(1)} A ${rA + 2} ${rA + 2} 0 0 1 ${(auxX + rA + 2).toFixed(1)} ${auxY.toFixed(1)} Z"`
        + ` fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.4"/>`;
      // 轮轴 + 滚轮（固定，骑于主/辅轨）：主轮红色聚氨酯 + 金属轮毂 + 轴承心；辅轮黑色带毂
      const axle = line(xM, 0, auxX, auxY, '#64748b', 1.8)
        + `<circle cx="${auxX}" cy="${auxY}" r="${rA}" fill="#27272a" stroke="#18181b" stroke-width="1.4"/>`
        + `<circle cx="${auxX}" cy="${auxY}" r="1.8" fill="#a1a1aa" stroke="#18181b" stroke-width="0.8"/>`
        + `<circle cx="${xM}" cy="0" r="${rM}" fill="#dc2626" stroke="#991b1b" stroke-width="1.8"/>`
        + `<circle cx="${xM}" cy="0" r="3" fill="#e2e8f0" stroke="#991b1b" stroke-width="1.1"/>`
        + `<circle cx="${xM}" cy="0" r="1.3" fill="#57534e"/>`;
      // 踏板（黄色警示条 + 铝本色踏面）+ 铝本色弧形踢板（绕轴翻转：工作段踏面朝上、返回段踏面朝下）
      const body = `<g transform="rotate(${rot})">`
        + `<rect x="-15" y="-14.6" width="26" height="1.9" rx="0.6" fill="#fbbf24" stroke="#b45309" stroke-width="0.6"/>`
        + `<rect x="-15" y="-12.7" width="26" height="3" rx="0.6" fill="#d6d3d1" stroke="#94a3b8" stroke-width="1"/>`
        + ribs
        + `<path d="M-15 -9.7 C -19 -5 -19 2 -14 5.5 L -8 5.5 L -8 -9.7 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="0.9"/>`
        + `</g>`;
      return side + axle + body;
    }
    function stepRot(sv) {
      if (sv < G.lenW) return 0;
      if (sv < G.lenWD) return 180 * (sv - G.lenW) / (G.lenWD - G.lenW);   // 上端链轮：0→180（踏面始终朝环外翻转）
      if (sv < G.lenWDR) return 180;
      return 180 + 180 * (sv - G.lenWDR) / (G.LEN - G.lenWDR);             // 下端链轮：180→360，翻转方向与链轮切线一致（修复反转）
    }
    function paint() {
      const a = +ctx.state.alpha || 30;
      chainP.setAttribute('d', loopD());
      chainP.setAttribute('stroke-dashoffset', (-s).toFixed(1));
      chainN.setAttribute('d', loopD());                       // 链节点随几何变化同步（倾角可调）
      chainN.setAttribute('stroke-dashoffset', (-s).toFixed(1));
      /* 卸载导轨 + 弯弧分离箭头 + 倾斜段主/辅轮标注：几何随 α 变化，每帧重建 */
      const mW = [(G.LOOP[1][0] + G.LOOP[2][0]) / 2, (G.LOOP[1][1] + G.LOOP[2][1]) / 2];   // 倾斜段中点（主轮≈主轨上）
      const mA = [mW[0] - 11 * S, mW[1]];                                                  // 辅轮（工作段共面，仅水平偏置）
      /* v1.2.8：卸载导轨 / 分离箭头随驱动链轮（G.Dcx/G.Dcy，随 α 平移）绘制 */
      unloadG.innerHTML =
        unloadRailMarkup(G.Dcx, G.Dcy, 54, -50, 50, P, S, -50) +
        unloadRailMarkup(100, 500, 54, 130, 230, P, S) +
        auxSplitArrow(G.Dcx, G.Dcy - 54, 0, P, S) + auxSplitArrow(G.Dcx, G.Dcy + 54, 180, P, S) +
        auxSplitArrow(100, 500 - 54, 180, P, S) + auxSplitArrow(100, 500 + 54, 0, P, S) +
        txtEl(685, 200, '弯弧段：辅轨与主轨分离', { anchor: 'start', size: 10.5, fill: '#0369a1' }) +
        txtEl(400, 266, '弯弧段：辅轨与主轨分离', { anchor: 'start', size: 10.5, fill: '#0369a1' }) +
        line(660, 292, mW[0], mW[1], '#b45309', 1.2, '4 3') +
        txtEl(668, 302, '主轮·斜上（承载）', { anchor: 'start', size: 10.5, fill: '#b45309' }) +
        line(524, 330, mA[0], mA[1], '#0369a1', 1.2, '4 3') +
        txtEl(516, 340, '辅轮·斜下（导向）', { anchor: 'start', size: 10.5, fill: '#0369a1' });
      let st = '';
      const NSTEP = Math.max(1, Math.round(G.LEN / P_STEP));
      const SP = G.LEN / NSTEP;
      /* v1.2.8 自检：上、下水平段「可见放平段」（缩放后）均须 ≥2 个梯级间距。
         上水平段恒定 186.3 px（Dc 随 α 平移），故 27.3 / 30 / 35° 三种倾角下 flatUp 同为 152.3×S。 */
      const flatDn = (270 - 124) * S, flatUp = ((G.Dcx - 34) - G.ix) * S;
      console.assert(flatDn >= 2 * SP, '下水平段放平梯级不足 2 级：' + flatDn.toFixed(1) + ' < ' + (2 * SP).toFixed(1));
      console.assert(flatUp >= 2 * SP, '上水平段放平梯级不足 2 级：' + flatUp.toFixed(1) + ' < ' + (2 * SP).toFixed(1));
      for (let k = 0; k < NSTEP; k++) {
        const sv = ((s + k * SP) % G.LEN + G.LEN) % G.LEN;
        const p = polyPoint(G.LOOP, sv);
        const aRad = (+ctx.state.alpha || 30) * Math.PI / 180;
        const [auxX, auxY] = auxOffsetAt(sv, G.LOOP, G.lenW, G.lenWD, G.lenWDR, G.LEN, -11, 15, Math.sin(aRad));
        st += `<g transform="translate(${p[0].toFixed(1)},${p[1].toFixed(1)})">` + stepShape(stepRot(sv), auxX, auxY) + `</g>`;
      }
      stepsG.innerHTML = st;
      const dh = 400 * Math.tan(a * Math.PI / 180);
      alphaTxt.textContent = `${a}° · Δh = 400×tan${a}° ≈ ${dh.toFixed(0)} mm`;
      ctx.readout([
        ['梯路倾角 α', `${a}°`],
        ['每级提升高度', `400 × tan${a}° ≈ <b>${dh.toFixed(0)} mm</b>`],
        /* §四：原「轮距 Δh」措辞改为明确表达倾斜段共面关系 */
        ['倾斜段轮轨关系', `倾斜段主/辅轮共面（导轨共面）；轮距 Δh = 400×tan${a}° ≈ <b>${dh.toFixed(0)} mm</b>（工作段）`],
        ['工作导轨', '承载主轮与乘客载荷（主要受力轨）'],
        ['辅轮导轨', '仅承梯级自重，保证返回段姿态'],
        ['端部转向', '链轮 PCD≈0.8m，梯级平滑翻转 180°'],
        ['导轨精度', '直线度 ≤ 0.5 mm/m；接头平齐错开']
      ]);
    }
    paint();
    return {
      destroy: ticker(dt => { if (ctx.state.dir === 'run') { s = (s + (+ctx.state.v || 0.5) * 140 * dt) % G.LEN; } paint(); }),
      onchange(k, v2) {
        ctx.state[k] = v2;
        if (k === 'alpha') {
          const aRad = (+v2 || 30) * Math.PI / 180;
          G = buildLoop(+v2 || 30);
          mainRail.setAttribute('d', mainRailD(G.LOOP));
          railW.setAttribute('d', mainRailD(G.LOOP));
          railR.setAttribute('d', auxRailD(G.LOOP, G.lenW, G.lenWD, G.lenWDR, G.LEN, -11, 15, Math.sin(aRad)));
          // v1.2.8：驱动链轮节圆随 α 平移，虚线圆须同步移动，否则与转向弧脱开
          wUp.setAttribute('cx', P(G.Dcx, G.Dcy)[0]); wUp.setAttribute('cy', P(G.Dcx, G.Dcy)[1]);
        }
        paint();
      },
      onaction() { }
    };
  }
};

SIMS.handrail = {
  title: '扶手带系统 · 摩擦驱动与压紧轮仿真',
  desc: '摩擦轮 + 压紧轮（弹簧加压）驱动扶手带循环；调节压紧力、模拟油污，观察摩擦力需求与能力的对比及打滑过程。',
  photos: [
    { f: 'real-handrail-belt-1', cap: '扶手带实物（橡胶包覆钢丝帘布）' },
    { f: 'real-handrail-drive-1', cap: '扶手带驱动轮与压带轮组实物' },
    { f: 'real-handrail-drive-2', cap: '压带轮组弹簧加压结构' },
    { f: 'real-handrail-curve', cap: '扶手带端部转向导轨' }
  ],
  notes: [
    '扶手带靠驱动轮与内表面之间的摩擦力传动：F 传 ≤ μ·N（N 为压紧轮压力），摩擦力不足即打滑。',
    '扶手带速度应略大于梯级速度（0 ~ +2%），本仿真可调超前率并实时对比两速度。',
    '摩擦面油污会使 μ 下降，即使压紧力正常也会打滑 —— 须清洁摩擦面并检查压紧力。',
    '扶手带剖面：橡胶外层 + 钢丝帘布骨架 + 摩擦层（内衬），抗拉且耐磨。'
  ],
  controls: [
    { key: 'lead', type: 'range', label: '超前率', min: 0, max: 2, step: 0.25, value: 1, unit: ' %' },
    { key: 'v', type: 'range', label: '梯级速度', min: 0.4, max: 0.75, step: 0.05, value: 0.5, unit: ' m/s' },
    { key: 'n', type: 'range', label: '压紧轮压力 N', min: 200, max: 800, step: 50, value: 500, unit: ' N' },
    { type: 'buttons', items: [{ key: 'oil', label: '模拟油污', cls: 'dang' }, { key: 'clean', label: '清洁摩擦面', cls: 'ok' }] }
  ],
  mount(ctx) {
    const svg = makeSvg(ctx.stage, '0 0 800 560', `
      ${txtEl(400, 26, '扶手带摩擦驱动：F 传 ≤ μ·N（N 压紧力，μ 摩擦系数）', { size: 13.5, fill: '#0f766e' })}
      ${box(25, 44, 190, 300, '#f0fdfa', '#99f6e4', 2, 10)}
      ${txtEl(120, 70, '扶手带剖面', { size: 12.5, fill: '#115e59' })}
      <rect x="55" y="90" width="130" height="34" rx="17" fill="#334155"/>
      <rect x="62" y="97" width="116" height="20" rx="10" fill="#64748b"/>
      <rect x="69" y="103" width="102" height="8" rx="4" fill="#fbbf24"/>
      ${txtEl(120, 146, '橡胶外层（耐磨）', { size: 11, fill: '#334155' })}
      ${txtEl(120, 166, '钢丝帘布骨架（抗拉）', { size: 11, fill: '#475569' })}
      ${txtEl(120, 186, '摩擦层内衬（传动面）', { size: 11, fill: '#b45309' })}
      ${txtEl(120, 216, '带体宽 70~90 mm', { size: 11, fill: '#0f766e', weight: 500 })}
      ${txtEl(120, 238, '破断安全系数 ≥ 10', { size: 11, fill: '#0f766e', weight: 500 })}
      ${txtEl(120, 260, '护壁板高度 ≥ 1.0 m', { size: 11, fill: '#0f766e', weight: 500 })}
      ${box(580, 44, 195, 190, '#ecfdf5', '#a7f3d0', 2, 10)}
      ${txtEl(677, 70, '同步要求', { size: 12.5, fill: '#065f46' })}
      ${txtEl(677, 96, 'v 扶手 = v 梯级 ×(1+超前)', { size: 11.5, fill: '#047857' })}
      ${txtEl(677, 118, '超前率 0 ~ +2%', { size: 11.5, fill: '#047857' })}
      ${txtEl(677, 140, '略快 → 手臂轻微前拉', { size: 11, fill: '#047857', weight: 500 })}
      ${txtEl(677, 162, '身体保持稳定不后倾', { size: 11, fill: '#047857', weight: 500 })}
      ${txtEl(677, 184, '滞后 → 乘客后倾失稳', { size: 11, fill: '#b91c1c', weight: 500 })}
      ${txtEl(677, 206, '打滑 → 同步失效', { size: 11, fill: '#b91c1c', weight: 500 })}
      ${txtEl(677, 230, '须定期检查压紧力与摩擦面清洁度', { size: 10.5, fill: '#047857', weight: 500 })}
    `);
    /* ---- 中央：驱动回路 ---- */
    svg.insertAdjacentHTML('beforeend', `
      <!-- 带回路：上运行边（右行） / 下返回边（左行） -->
      ${line(255, 252, 700, 252, '#334155', 9, '')}
      ${line(700, 262, 255, 262, '#334155', 9, '')}
      ${line(740, 262, 740, 344, '#334155', 9, '')}
      ${line(740, 348, 260, 348, '#334155', 9, '')}
      ${line(255, 344, 255, 262, '#334155', 9, '')}
      <circle cx="745" cy="303" r="46" fill="#f1f5f9" stroke="#334155" stroke-width="2"/>
      <circle cx="250" cy="303" r="46" fill="#f1f5f9" stroke="#334155" stroke-width="2"/>
      ${txtEl(745, 368, '端部转向轮', { size: 11, fill: '#475569' })}
      ${txtEl(250, 368, '端部转向轮', { size: 11, fill: '#475569' })}
      <!-- 压紧轮弹簧支架 -->
      ${line(395, 150, 555, 150, '#94a3b8', 5)}
      ${txtEl(300, 142, '压紧轮支架（弹簧加压，压力可调）', { anchor: 'start', size: 11, fill: '#475569' })}
    `);
    // 弹簧（随压力长度变化）
    const springG = E('g', {}); svg.appendChild(springG);
    // 驱动摩擦轮（下）
    const hG = E('g', {}); svg.appendChild(hG);
    hG.innerHTML = `<g id="h-spin"><circle cx="430" cy="308" r="46" fill="#dcfce7" stroke="#059669" stroke-width="2.8"/>` +
      Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4; return `<line x1="${(430 + 12 * Math.cos(a)).toFixed(1)}" y1="${(308 + 12 * Math.sin(a)).toFixed(1)}" x2="${(430 + 40 * Math.cos(a)).toFixed(1)}" y2="${(308 + 40 * Math.sin(a)).toFixed(1)}" stroke="#059669" stroke-width="2.4"/>`; }).join('') +
      `<circle cx="430" cy="308" r="8" fill="#059669"/></g>`;
    svg.insertAdjacentHTML('beforeend', txtEl(430, 386, '扶手带驱动轮（摩擦传动）', { size: 12, fill: '#047857' }));
    // 压紧轮 ×2（上）
    const pG = E('g', {}); svg.appendChild(pG);
    pG.innerHTML =
      `<g id="p1-spin"><circle cx="430" cy="222" r="26" fill="#e0f2fe" stroke="#0e7490" stroke-width="2.6"/><circle cx="430" cy="222" r="7" fill="#0e7490"/></g>` +
      `<g id="p2-spin"><circle cx="520" cy="226" r="22" fill="#e0f2fe" stroke="#0e7490" stroke-width="2.4"/><circle cx="520" cy="226" r="6" fill="#0e7490"/></g>`;
    svg.insertAdjacentHTML('beforeend', txtEl(392, 226, '压紧轮', { anchor: 'end', size: 11.5, fill: '#0e7490' }));
    // 带动纹理（滚动虚线覆盖在上/下运行边）
    const bandTop = E('line', { x1: 255, y1: 252, x2: 700, y2: 252, stroke: '#fbbf24', 'stroke-width': 5, 'stroke-dasharray': '14 10' });
    const bandBot = E('line', { x1: 700, y1: 348, x2: 255, y2: 348, stroke: '#fbbf24', 'stroke-width': 5, 'stroke-dasharray': '14 10' });
    svg.appendChild(bandTop); svg.appendChild(bandBot);
    // 打滑标记
    const slipG = E('g', {}); svg.appendChild(slipG);
    const statusTxt = E('text', { x: 475, y: 420, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#047857', 'font-family': 'inherit' });
    svg.appendChild(statusTxt);
    svg.insertAdjacentHTML('beforeend', `
      ${box(255, 440, 440, 96, '#fff', '#e2e8f0', 1.8, 10)}
      ${txtEl(275, 466, '摩擦力对比（N）', { anchor: 'start', size: 12, fill: '#334155' })}
    `);
    const barG = E('g', {}); svg.appendChild(barG);

    ctx.state.lead = 1; ctx.state.v = 0.5; ctx.state.n = 500; ctx.state.oil = false;
    let s = 0, slip = false, slipK = 1;
    function paint(dt) {
      const lead = +ctx.state.lead / 100, v = +ctx.state.v, N = +ctx.state.n;
      const mu = ctx.state.oil ? 0.12 : 0.28;
      const vHand = v * 140 * (1 + lead);
      const demand = 40 + v * 100;                     // 驱动力需求（教学值，默认 < μN）
      const cap = mu * N;                              // 摩擦传动能力
      slip = demand > cap;
      slipK += ((slip ? 0.86 : 1) - slipK) * 0.08;
      s += vHand * slipK * (dt || 0);
      hG.querySelector('#h-spin').setAttribute('transform', `rotate(${(s / 46 * 57.2958 % 360).toFixed(1)} 430 308)`);
      pG.querySelector('#p1-spin').setAttribute('transform', `rotate(${(-s / 26 * 57.2958 % 360).toFixed(1)} 430 222)`);
      pG.querySelector('#p2-spin').setAttribute('transform', `rotate(${(-s / 22 * 57.2958 % 360).toFixed(1)} 520 226)`);
      bandTop.setAttribute('stroke-dashoffset', (-s).toFixed(1));
      bandBot.setAttribute('stroke-dashoffset', (-s).toFixed(1));
      // 弹簧长度随压力
      const comp = (N - 200) / 600;
      let sp = '';
      [395, 475].forEach(px => {
        const len = 62 - comp * 16;
        for (let k = 0; k < 5; k++) sp += `<path d="M${px} ${156 + k * len / 5} l14 ${len / 10} l-14 ${len / 10}" fill="none" stroke="#7c3aed" stroke-width="2.2" transform="translate(-7 0)"/>`;
      });
      springG.innerHTML = sp + line(430, 150, 430, 196, '#94a3b8', 3) + line(520, 150, 520, 204, '#94a3b8', 3);
      // 打滑标记
      slipG.innerHTML = slip
        ? Array.from({ length: 6 }, (_, k) => `<line x1="${(300 + k * 65)}" y1="270" x2="${(312 + k * 65)}" y2="244" stroke="#dc2626" stroke-width="2.4"/>`).join('') +
          txtEl(300, 238, '打滑', { anchor: 'start', size: 12, fill: '#b91c1c', weight: 700 })
        : '';
      statusTxt.textContent = slip ? '打滑！带速 < 轮面速度，同步失效 —— 须清洁摩擦面或加大压紧力'
        : (ctx.state.oil ? '摩擦面油污（μ 下降）—— 尚未打滑，须立即清洁' : '摩擦传动正常 · 扶手带超前运行');
      statusTxt.setAttribute('fill', slip ? '#b91c1c' : ctx.state.oil ? '#b45309' : '#047857');
      // 摩擦力对比条
      const maxV = 260, bw = 380;
      barG.innerHTML =
        txtEl(275, 492, `能力 μ·N = ${(cap).toFixed(0)} N`, { anchor: 'start', size: 11.5, fill: cap >= demand ? '#059669' : '#dc2626' }) +
        `<rect x="445" y="480" width="${(cap / maxV * bw).toFixed(0)}" height="12" rx="6" fill="${cap >= demand ? '#059669' : '#dc2626'}"/>` +
        txtEl(275, 516, `需求 ≈ ${demand.toFixed(0)} N`, { anchor: 'start', size: 11.5, fill: '#334155' }) +
        `<rect x="445" y="504" width="${(demand / maxV * bw).toFixed(0)}" height="12" rx="6" fill="#94a3b8"/>` +
        line(445 + demand / maxV * bw, 476, 445 + demand / maxV * bw, 520, '#dc2626', 2, '4 3');
      ctx.readout([
        ['梯级速度', `${v.toFixed(2)} m/s`],
        ['扶手带速度', `<b>${(v * (1 + lead) * slipK).toFixed(2)} m/s</b>${slip ? ' <b style="color:#dc2626">（打滑中）</b>' : ''}`],
        ['超前率', `${(lead * 100).toFixed(2)} %（要求 0 ~ +2%）`],
        ['压紧力 N', `${N} N`],
        ['摩擦系数 μ', ctx.state.oil ? '<b style="color:#dc2626">0.12（油污）</b>' : '0.28（清洁）'],
        ['传动能力 μ·N', `${cap.toFixed(0)} N`],
        ['驱动力需求', `${demand.toFixed(0)} N`],
        ['状态', slip ? '<b style="color:#dc2626">打滑 —— 清洁摩擦面 / 加大压紧力</b>' : '<b style="color:#059669">同步正常</b>']
      ]);
    }
    paint();
    return {
      destroy: ticker(dt => paint(dt)),
      onchange(k, v2) {
        ctx.state[k] = v2;
        paint();
      },
      onaction(k) {
        if (k === 'oil') { ctx.state.oil = true; ctx.logLine('模拟摩擦面油污：μ 由 0.28 降至 0.12，传动能力大幅下降'); }
        if (k === 'clean') { ctx.state.oil = false; ctx.logLine('清洁摩擦面并检查压紧力：μ 恢复 0.28'); }
        paint();
      }
    };
  }
};

/* =======================================================================
 * 6. 张紧与转向系统 · 张紧小车与断链保护仿真
 * ===================================================================== */
SIMS.tension = {
  title: '张紧装置 · 张紧小车与断链保护仿真',
  desc: '张紧小车沿导轨滑移补偿梯级链伸长，弹簧保持恒定张力；链条过度松弛时张紧行程超限，断链保护开关动作停机。',
  photos: [
    { f: 'real-tension-1', cap: '张紧装置实物（弹簧 + 丝杆 + 小车）' },
    { f: 'real-tension-2', cap: '张紧弹簧与调节丝杆特写' },
    { f: 'real-tension-switch', cap: '张紧轮断链 / 松弛保护开关实物' }
  ],
  notes: [
    '张紧小车带动下部转向链轮沿导轨滑移，弹簧（或重锤、液压缸）保持链条恒定张力。',
    '张紧行程必须大于梯级链最大伸长补偿量，否则链条过松 → 跳齿、脱链、运行冲击。',
    '张紧轮上设断链/松弛保护开关：链条断裂或过度松弛时开关立即动作，切断安全回路抱闸停机。',
    '下部转向链轮与端部转向导轨在此引导梯级完成 180° 折返。'
  ],
  controls: [
    { key: 'ext', type: 'range', label: '链条伸长量', min: 0, max: 40, step: 2, value: 8, unit: ' mm' },
    { key: 'type', type: 'select', label: '张紧形式', value: 'spring', options: [['spring', '弹簧式（常用）'], ['weight', '重锤式（大行程）'], ['hyd', '液压式（可调）']] },
    { type: 'buttons', items: [{ key: 'adj', label: '调整张紧（+10mm 行程）', cls: 'ok' }, { key: 'reset', label: '复位', cls: 'ghost' }] }
  ],
  mount(ctx) {
    ctx.state.ext = 8; ctx.state.type = 'spring'; ctx.state.travel = 20; ctx.state.tripped = false;
    const svg = makeSvg(ctx.stage, '0 0 800 560', `
      ${txtEl(400, 26, '张紧小车：补偿链条伸长 · 保持恒定张力 · 松弛超限停机', { size: 13.5, fill: '#5b21b6' })}
      ${box(25, 44, 750, 350, '#faf5ff', '#ddd6fe', 2, 10)}
      <!-- 桁架端部轮廓 -->
      ${line(60, 120, 740, 120, '#94a3b8', 4)}
      ${txtEl(70, 110, '返回梯路（示意）', { anchor: 'start', size: 11, fill: '#64748b' })}
      <!-- 张紧导轨 -->
      ${line(100, 400, 600, 400, '#475569', 7)}
      ${line(100, 414, 600, 414, '#94a3b8', 3)}
      ${txtEl(110, 434, '张紧小车滑动导轨', { anchor: 'start', size: 11, fill: '#475569' })}
      <!-- 固定端转向轮 -->
      <circle cx="660" cy="330" r="34" fill="#e2e8f0" stroke="#475569" stroke-width="2.4"/>
      <circle cx="660" cy="330" r="6" fill="#475569"/>
      ${txtEl(660, 384, '固定端（梯路延续）', { size: 11, fill: '#475569' })}
      <!-- 弹簧固定座 -->
      <rect x="600" y="300" width="14" height="64" fill="#a8a29e" stroke="#57534e" stroke-width="2"/>
      <!-- 行程标尺 -->
      ${line(100, 466, 560, 466, '#0891b2', 1.6)}
      ${Array.from({ length: 13 }, (_, k) => line(100 + k * 38.3, 460, 100 + k * 38.3, 472, '#0891b2', 1.2)).join('')}
      ${txtEl(100, 488, '0', { size: 10.5, fill: '#0e7490' })}
      ${txtEl(560, 488, '60 mm（张紧行程）', { size: 10.5, fill: '#0e7490' })}
      ${box(25, 504, 750, 40, '#f5f3ff', '#c4b5fd', 1.6, 8)}
      ${txtEl(400, 530, '张紧行程 ≥ 梯级链最大伸长补偿量；弹簧张力 T = k·x 自动随伸长补偿。断链/松弛保护开关动作 → 立即抱闸停机。', { size: 12, fill: '#5b21b6' })}
    `);
    const dyn = E('g', {}); svg.appendChild(dyn);
    function paint() {
      const ext = +ctx.state.ext, travel = +ctx.state.travel, type = ctx.state.type;
      // 小车位置：随伸长量右移（弹簧压缩量增加）
      const carX = 190 + Math.min(travel, ext) * 3.2;
      const need = ext - travel;                        // 需要补偿而未补偿的量
      const slack = need > 0;                           // 过松弛
      const dip = slack ? Math.min(26, need * 1.2) : 2;
      const tripped = ctx.state.tripped = slack && need > 12;
      const sprocketY = 330;
      // 小车 + 链轮 + 弹簧
      let m = '';
      m += `<rect x="${carX}" y="300" width="150" height="64" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="2.6"/>`;
      m += txtEl(carX + 75, 326, '张紧小车', { size: 12.5, fill: '#5b21b6' });
      m += txtEl(carX + 75, 348, type === 'spring' ? '弹簧式' : type === 'weight' ? '重锤式' : '液压式', { size: 11, fill: '#6d28d9', weight: 500 });
      m += `<circle cx="${carX + 30}" cy="392" r="11" fill="#a78bfa" stroke="#5b21b6" stroke-width="2"/><circle cx="${carX + 120}" cy="392" r="11" fill="#a78bfa" stroke="#5b21b6" stroke-width="2"/>`;
      // 转向链轮
      m += `<g transform="translate(${carX + 56} ${sprocketY})">${sprocketMarkup(0, 0, 34, '#7c3aed', 10)}</g>`;
      // 链条：上边（恒紧）+ 下边（松弛时下垂）
      m += line(carX + 90, sprocketY - 34, 626, sprocketY - 34, C.chain, 4);
      if (slack) {
        const x0 = carX + 90, x1 = 626, xm = (x0 + x1) / 2;
        m += `<path d="M${x0} ${sprocketY + 34} Q ${xm} ${sprocketY + 34 + dip * 2.2} ${x1} ${sprocketY + 34}" fill="none" stroke="${tripped ? '#dc2626' : C.chain}" stroke-width="4"/>`;
      } else {
        m += line(carX + 90, sprocketY + 34, 626, sprocketY + 34, C.chain, 4);
      }
      // 弹簧（压缩随位置）
      const sx0 = carX + 150, sx1 = 600, seg = (sx1 - sx0 - 10) / 7;
      for (let k = 0; k < 7; k++) m += `<path d="M${sx0 + k * seg} 332 l${seg / 2} -12 l0 24 l${seg / 2} -12" fill="none" stroke="#7c3aed" stroke-width="2.4"/>`;
      m += line(sx0, 332, sx1, 332, '#a8a29e', 1.6);
      // 断链保护开关（滚轮贴链条下边）
      const levY = sprocketY + 34 + (slack ? dip * 2.2 / 2 + 6 : 8);
      m += `<circle cx="560" cy="${levY.toFixed(1)}" r="7" fill="${tripped ? '#dc2626' : '#a8a29e'}" stroke="#57534e" stroke-width="1.8"/>`;
      m += line(560, levY, 585, tripped ? levY + 18 : levY - 14, '#57534e', 3);
      m += `<rect x="585" y="${(tripped ? levY + 10 : levY - 24).toFixed(1)}" width="34" height="22" rx="3" fill="${tripped ? '#fee2e2' : '#f1f5f9'}" stroke="${tripped ? '#dc2626' : '#94a3b8'}" stroke-width="1.8"/>`;
      m += txtEl(602, 430, '断链/松弛开关', { size: 10.5, fill: tripped ? '#b91c1c' : '#57534e' });
      // 行程指针
      m += `<polygon points="${(carX + 75).toFixed(1)},460 ${(carX + 69).toFixed(1)},448 ${(carX + 81).toFixed(1)},448" fill="#7c3aed"/>`;
      dyn.innerHTML = m;
      ctx.readout([
        ['张紧形式', type === 'spring' ? '弹簧式（结构简单、常用）' : type === 'weight' ? '重锤式（行程大、张力恒定）' : '液压式（张紧力大、可调）'],
        ['链条伸长量', `${ext} mm`],
        ['已补偿行程', `${Math.min(travel, ext).toFixed(0)} mm`],
        ['剩余张紧行程', `<b>${Math.max(0, travel - ext).toFixed(0)} mm</b>`],
        ['链条张力', slack ? '<b style="color:#dc2626">张力不足（松弛）</b>' : '<b style="color:#059669">恒定（T = k·x）</b>'],
        ['保护开关', tripped ? '<b style="color:#dc2626">已动作 —— 松弛超限，抱闸停机</b>' : slack ? '<b style="color:#b45309">接近动作阈值</b>' : '<b style="color:#059669">正常</b>']
      ]);
      if (tripped) ctx.logLine('断链/松弛保护开关动作：链条松弛超过允许值，切断安全回路并抱闸停机');
    }
    paint();
    return {
      destroy() { },
      onchange(k, v) { ctx.state[k] = v; paint(); },
      onaction(k) {
        if (k === 'adj') { ctx.state.travel = Math.min(60, ctx.state.travel + 10); ctx.logLine(`调整张紧丝杆：张紧行程增至 ${ctx.state.travel} mm`); }
        if (k === 'reset') { ctx.state.travel = 20; ctx.logLine('张紧装置复位（行程 20 mm）'); }
        paint();
      }
    };
  }
};

/* =======================================================================
 * 7. 电气控制系统 · 运行控制 + GB16899 安全回路串联仿真
 * ===================================================================== */
/* =======================================================================
 * 7. 电气控制系统 · 主回路 / 控制回路 / 检修控制 / 安全回路（GB 16899-2011）
 * ===================================================================== */
SIMS.control = {
  title: '电气控制系统 · 主回路 / 控制回路 / 安全回路仿真',
  desc: '主回路（主开关→相序→热过载→变频器→电动机 + 制动回路）、控制回路梯形图、便携检修盒「公共 + 方向」点动、12 项安全触点串联（GB 16899-2011），任一断开 → 安全继电器 K 失电 → 抱闸 + 附加制动器。',
  photos: [
    { f: 'edu-control-box', cap: '控制箱（主控 + 变频器 + 安全继电器）' },
    { f: 'edu-chain-switch', cap: '驱动链断链 / 松弛保护开关' },
    { f: 'real-inspection-box', cap: '便携检修盒（检修 / 正常 / 急停）' },
    { f: 'real-control-cabinet-1', cap: '控制柜实物（主控板 + 变频器 + 安全回路）' }
  ],
  notes: [
    '主回路：主开关 QF（带锁，检修时可挂锁切断）→ 相序 / 缺相 KP → 热过载 FR → 变频器 VVVF → 电动机 M；制动回路含工作制动器 YB（失电抱闸）与附加制动器 AB（常闭，由安全回路直接控制）。',
    '控制回路（梯形图）：停止 SB1 / 启动 SB2 / 模式选择 → 安全继电器 K → 上下行接触器 KM1、KM2 互锁；制动接触器 KB 与松闸监控 KT——发出运行指令而制动器未松闸时拒绝启动。',
    '安全回路：梳齿板 ×2、扶手带入口 ×2、围裙板、梯级下陷 / 缺失、断链 / 松弛、超速（>1.2 倍）、非操纵逆转、附加制动器、急停 ×2、检修开关共 12 项触点串联；任一断开 → K 失电 → 抱闸停机。',
    '检修控制（GB 16899-2011 5.12.3）：便携式检修盒，转换开关置「检修」后自动运行指令失效，先按【公共】按钮保持、再按住【上行/下行】点动，松开即减速停车；安全回路仍然有效；柔性电缆 ≥ 3 m；点动速度 ≤ 0.3 m/s（本仿真取 0.30）。'
  ],
  controls: [
    { key: 'mode', type: 'select', label: '运行模式', value: 'cont', options: [['cont', '连续运行（商业）'], ['auto', '自动运行（节能）'], ['insp', '检修运行']] },
    { key: 'vmax', type: 'range', label: '额定速度', min: 0.4, max: 0.75, step: 0.05, value: 0.5, unit: ' m/s' },
    { type: 'buttons', items: [
      { key: 'pass', label: '模拟乘客进入', cls: 'ok', tip: '自动模式下触发启动' },
      { key: 'brakeFail', label: '制动未松闸', cls: 'dang', tip: '松闸监控 KT 拦截启动' },
      { key: 'estop', label: '急停', cls: 'dang' },
      { key: 'reset', label: '复位', cls: 'ghost' }
    ] },
    { type: 'buttons', items: [
      { key: 'faultComb', label: '梳齿板(下)', cls: 'dang' },
      { key: 'faultCombU', label: '梳齿板(上)', cls: 'dang' },
      { key: 'faultEntry', label: '入口(下)', cls: 'dang' },
      { key: 'faultEntryU', label: '入口(上)', cls: 'dang' },
      { key: 'faultSkirt', label: '围裙板', cls: 'dang' },
      { key: 'faultSag', label: '梯级下陷', cls: 'dang' }
    ] },
    { type: 'buttons', items: [
      { key: 'faultChain', label: '断链', cls: 'dang' },
      { key: 'faultOver', label: '超速', cls: 'dang' },
      { key: 'faultRev', label: '逆转', cls: 'dang' },
      { key: 'faultAux', label: '附加制动器', cls: 'dang' }
    ] },
    { type: 'buttons', items: [
      { key: 'insp', label: '检修/正常 转换开关', cls: 'ghost', tip: '点击切换检修状态（GB 16899-2011 5.12.3）' },
      { key: 'com', label: '【公共】（点击保持）', cls: 'ok', tip: '检修态下点击自锁保持，再按一次解除' }
    ] },
    { type: 'buttons', items: [
      { key: 'up', label: '【上行】（按住）', cls: 'ghost', hold: true, tip: '检修 + 公共保持后按住点动，松开即减速停车' },
      { key: 'dn', label: '【下行】（按住）', cls: 'ghost', hold: true, tip: '检修 + 公共保持后按住点动，松开即减速停车' }
    ] }
  ],
  mount(ctx) {
    /* 安全回路触点表（GB 16899-2011 串联；warn=检修位旁路自动指令但不旁路保护） */
    const CONTACTS = [
      { k: 'faultComb', n: '梳齿板(下)', s: '异物卡入上抬' },
      { k: 'faultCombU', n: '梳齿板(上)', s: '异物卡入上抬' },
      { k: 'faultEntry', n: '入口(下)', s: '异物卷入挡板' },
      { k: 'faultEntryU', n: '入口(上)', s: '异物卷入挡板' },
      { k: 'faultSkirt', n: '围裙板', s: '间隙超限内移' },
      { k: 'faultSag', n: '梯级下陷/缺失', s: '缺级检测' },
      { k: 'faultChain', n: '断链/松弛', s: '张紧超程' },
      { k: 'faultOver', n: '超速', s: '>1.2 倍额定' },
      { k: 'faultRev', n: '非操纵逆转', s: '运行方向改变' },
      { k: 'faultAux', n: '附加制动器', s: '监控 / 动作' },
      { k: 'eStop', n: '急停 ×2', s: '上下端站各一' },
      { k: 'inspSw', n: '检修开关', s: '检修位·自动失效', warn: true }
    ];
    /* 检修点动速度（v1.2.7）：GB 16899-2011 5.12.3.2 规定检修点动 ≤0.3 m/s。
       全链路唯一常量，改一处即可；若需与电梯侧一致改 0.50，只改本行 + 两处文案。 */
    const V_INSP = 0.30;
    ctx.state.mode = 'cont'; ctx.state.vmax = 0.5; ctx.state.v = 0;
    Object.keys(FAULT_INIT).forEach(k => ctx.state[k] = FAULT_INIT[k]);
    ctx.state.inspSw = false; ctx.state.inspMode = false;
    ctx.state.board = false; ctx.state.brakeFail = false;
    let comLatch = false, holdUp = false, holdDn = false;   // 公共自锁 / 方向按住（局部态，与电梯侧同语义）
    const plan = makePlanner(0.3, 0.5);

    const svg = makeSvg(ctx.stage, '0 0 900 730', `
      ${txtEl(450, 24, '电气控制系统 · 主回路 / 控制回路 / 检修控制 / 安全回路（GB 16899-2011）', { size: 13, fill: '#4338ca' })}
      <!-- ============ A. 主回路 ============ -->
      ${box(18, 36, 545, 226, '#f8fafc', '#cbd5e1', 2, 10)}
      ${txtEl(38, 62, '主回路（动力回路）· 单线示意', { anchor: 'start', size: 12.5, fill: '#334155' })}
      <!-- 三相电源 -->
      ${line(44, 96, 78, 96, '#0f172a', 2.4)}
      ${line(44, 110, 78, 110, '#0f172a', 2.4)}
      ${line(44, 124, 78, 124, '#0f172a', 2.4)}
      ${txtEl(40, 92, 'L1', { anchor: 'start', size: 9.5, fill: '#64748b', weight: 600 })}
      ${txtEl(40, 106, 'L2', { anchor: 'start', size: 9.5, fill: '#64748b', weight: 600 })}
      ${txtEl(40, 120, 'L3', { anchor: 'start', size: 9.5, fill: '#64748b', weight: 600 })}
      ${txtEl(61, 146, '三相电源', { size: 10, fill: '#64748b', weight: 600 })}
      <!-- 主开关 QF（带锁） -->
      ${box(84, 90, 48, 46, '#fff', '#334155', 2, 5)}
      ${line(90, 113, 126, 113, '#0f172a', 3)}
      ${line(90, 113, 122, 99, '#0f172a', 3)}
      ${box(96, 80, 24, 10, '#fde68a', '#b45309', 1.6, 2)}
      ${txtEl(108, 152, 'QF 主开关', { size: 10, fill: '#334155', weight: 700 })}
      ${txtEl(108, 165, '带锁·检修挂锁', { size: 8.5, fill: '#64748b', weight: 500 })}
      <!-- 相序 KP -->
      ${box(146, 94, 44, 38, '#fff', '#334155', 2, 5)}
      ${txtEl(168, 117, 'KP', { size: 11, fill: '#0f172a' })}
      ${txtEl(168, 152, '相序/缺相', { size: 10, fill: '#334155', weight: 700 })}
      <!-- 热过载 FR -->
      ${box(204, 94, 42, 38, '#fff', '#334155', 2, 5)}
      ${txtEl(225, 117, 'FR', { size: 11, fill: '#0f172a' })}
      ${txtEl(225, 152, '热过载', { size: 10, fill: '#334155', weight: 700 })}
      <!-- 变频器 VFD -->
      ${box(260, 88, 84, 50, '#eef2ff', '#4f46e5', 2, 6)}
      ${txtEl(302, 108, '变频器', { size: 11.5, fill: '#3730a3' })}
      ${txtEl(302, 126, 'VVVF', { size: 10, fill: '#6366f1', weight: 600 })}
      ${txtEl(302, 154, 'S 曲线软启', { size: 9, fill: '#64748b', weight: 500 })}
      <!-- 电动机 M -->
      <circle cx="428" cy="113" r="25" fill="#fff" stroke="#334155" stroke-width="2.4"/>
      <text id="mSym" x="428" y="119" text-anchor="middle" font-size="16" font-weight="800" fill="#0f172a" font-family="inherit">M</text>
      <circle id="mRot" cx="428" cy="113" r="19" fill="none" stroke="#94a3b8" stroke-width="1.6" stroke-dasharray="4 5"/>
      ${txtEl(428, 156, '电动机', { size: 10, fill: '#334155', weight: 700 })}
      ${txtEl(428, 169, '驱动梯级 + 扶手带', { size: 8.5, fill: '#64748b', weight: 500 })}
      ${txtEl(500, 108, '单线示意', { anchor: 'start', size: 9, fill: '#94a3b8', weight: 500 })}
      ${txtEl(500, 122, '（三相）', { anchor: 'start', size: 9, fill: '#94a3b8', weight: 500 })}
      <!-- 制动回路支路 -->
      ${box(150, 196, 62, 38, '#fff', '#334155', 2, 5)}
      ${txtEl(181, 220, 'KB', { size: 11, fill: '#0f172a' })}
      ${txtEl(181, 250, '制动接触器', { size: 9, fill: '#334155', weight: 700 })}
      ${box(230, 196, 100, 38, '#fff7ed', '#c2410c', 2, 5)}
      ${txtEl(280, 220, 'YB 工作制动器', { size: 10, fill: '#9a3412' })}
      ${txtEl(280, 250, '失电抱闸（常闭）', { size: 9, fill: '#64748b', weight: 500 })}
      ${box(348, 196, 100, 38, '#fef2f2', '#dc2626', 2, 5)}
      ${txtEl(398, 220, 'AB 附加制动器', { size: 10, fill: '#b91c1c' })}
      ${txtEl(398, 250, '安全回路直控', { size: 9, fill: '#64748b', weight: 500 })}
      ${box(466, 196, 66, 38, '#fff', '#334155', 2, 5)}
      ${txtEl(499, 220, 'KT', { size: 11, fill: '#0f172a' })}
      ${txtEl(499, 250, '松闸监控', { size: 9, fill: '#334155', weight: 700 })}
      <!-- ============ B. 控制回路（梯形图） ============ -->
      ${box(576, 36, 306, 226, '#f8fafc', '#cbd5e1', 2, 10)}
      ${txtEl(596, 62, '控制回路（梯形图）', { anchor: 'start', size: 12.5, fill: '#334155' })}
      ${line(600, 74, 600, 246, '#0f172a', 2.6)}
      ${line(862, 74, 862, 246, '#0f172a', 2.6)}
      ${txtEl(600, 258, 'L+', { size: 9, fill: '#64748b', weight: 600 })}
      ${txtEl(862, 258, 'L−', { size: 9, fill: '#64748b', weight: 600 })}
      <!-- ============ C. 检修控制 ============ -->
      ${box(18, 274, 430, 182, '#fffbeb', '#fde68a', 2, 10)}
      ${txtEl(38, 300, '检修控制 · 便携检修盒（GB 16899-2011 5.12.3.2）', { anchor: 'start', size: 12.5, fill: '#92400e' })}
      <!-- 检修盒（v1.2.7：公共 + 方向 模式，删除 A/B 双手同按） -->
      ${box(52, 316, 168, 96, '#fef3c7', '#b45309', 2.2, 8)}
      <!-- ① 转换开关：旋钮 + 正常/检修刻度 -->
      ${box(72, 328, 120, 16, '#fff', '#b45309', 1.6, 3)}
      ${txtEl(78, 340, '正常', { anchor: 'start', size: 8, fill: '#92400e', weight: 600 })}
      ${txtEl(186, 340, '检修', { anchor: 'end', size: 8, fill: '#92400e', weight: 600 })}
      <circle id="knob" cx="96" cy="336" r="7" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
      <path id="knobPtr" d="M96 336 L96 330" fill="none" stroke="#475569" stroke-width="2.2"/>
      ${txtEl(132, 356, '转换开关', { size: 8.5, fill: '#92400e', weight: 600 })}
      <!-- 急停（保留） -->
      <circle cx="206" cy="336" r="10" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/>
      ${txtEl(206, 358, '急停', { size: 8.5, fill: '#b91c1c', weight: 600 })}
      <!-- ② 公共按钮（点击自锁） -->
      <circle id="btnCom" cx="82" cy="382" r="13" fill="#e2e8f0" stroke="#475569" stroke-width="2.4"/>
      ${txtEl(82, 404, '公共', { size: 9, fill: '#475569', weight: 800 })}
      <!-- ③ 上行 / 下行（按住点动） -->
      <circle id="btnUp" cx="140" cy="382" r="13" fill="#e2e8f0" stroke="#475569" stroke-width="2.4"/>
      ${txtEl(140, 404, '上行', { size: 9, fill: '#475569', weight: 800 })}
      <circle id="btnDn" cx="192" cy="382" r="13" fill="#e2e8f0" stroke="#475569" stroke-width="2.4"/>
      ${txtEl(192, 404, '下行', { size: 9, fill: '#475569', weight: 800 })}
      <path d="M52 412 Q 40 436 26 440 Q 40 444 52 448" fill="none" stroke="#78716c" stroke-width="2.4"/>
      ${txtEl(30, 462, '柔性电缆 ≥ 3 m', { anchor: 'start', size: 9, fill: '#78716c', weight: 600 })}
      <!-- 右侧说明 -->
      ${txtEl(246, 322, '① 转换开关置「检修」→ 自动运行指令失效', { anchor: 'start', size: 11, fill: '#334155' })}
      ${txtEl(246, 344, '② 先按【公共】保持，再按住【上行/下行】点动', { anchor: 'start', size: 11, fill: '#334155' })}
      ${txtEl(246, 366, '③ 安全回路（11 项安全装置）仍然有效', { anchor: 'start', size: 11, fill: '#334155' })}
      ${txtEl(246, 388, '④ 点动速度 ≤ 0.3 m/s（本仿真 0.30）', { anchor: 'start', size: 11, fill: '#334155' })}
      <text id="jogStat" x="246" y="416" text-anchor="start" font-size="11" font-weight="800" fill="#64748b" font-family="inherit">按钮状态：公共未保持 · 方向未按下</text>
      ${txtEl(246, 438, '点动有效条件：检修态 + 公共保持 + 按住方向 + K 吸合', { anchor: 'start', size: 9.5, fill: '#92400e', weight: 600 })}
      <!-- ============ D. S 曲线 + 状态 ============ -->
      ${box(460, 274, 422, 182, '#0f172a', '#0f172a', 2, 10)}
      ${txtEl(480, 300, '变频器 S 形速度曲线 · 实时状态', { anchor: 'start', size: 12, fill: '#93c5fd' })}
      ${line(486, 424, 700, 424, '#475569', 1.4)}
      ${line(486, 314, 486, 424, '#475569', 1.4)}
      ${txtEl(480, 442, '时间 →', { anchor: 'start', size: 10, fill: '#94a3b8' })}
      ${txtEl(712, 320, '运行模式', { anchor: 'start', size: 10.5, fill: '#a5f3fc', weight: 600 })}
      ${txtEl(712, 360, '当前速度', { anchor: 'start', size: 10.5, fill: '#a5f3fc', weight: 600 })}
      ${txtEl(712, 400, '安全继电器 K', { anchor: 'start', size: 10.5, fill: '#a5f3fc', weight: 600 })}
      <!-- ============ E. 安全回路（串联） ============ -->
      ${box(18, 468, 864, 246, '#fef2f2', '#fecaca', 2.2, 10)}
      ${txtEl(450, 494, '安全回路（串联）—— 任一触点断开 → 安全继电器 K 失电 → 抱闸 + 附加制动器', { size: 12.5, fill: '#b91c1c' })}
      ${line(24, 534, 34, 534, '#dc2626', 2.4)}
      ${txtEl(22, 500, 'L+', { anchor: 'start', size: 9, fill: '#b91c1c', weight: 700 })}
    `);
    /* ---------- 动态图层 ---------- */
    const q = (sel, r) => r.querySelector(sel);
    const CONTACT_W = 118, GAP = 9, X0 = 34, Y1 = 508, Y2 = 574, CH = 52;
    const colC = c => X0 + c * (CONTACT_W + GAP) + CONTACT_W / 2;
    const ladderG = E('g', {}); svg.appendChild(ladderG);
    const wireG = E('g', {}); svg.appendChild(wireG);
    const contG = E('g', {}); svg.appendChild(contG);
    const curveG = E('g', {}); svg.appendChild(curveG);
    const statusG = E('g', {}); svg.appendChild(statusG);
    let hist = [];

    function contactSym(x, y, closed, color) {
      return `<circle cx="${x - 15}" cy="${y}" r="3.6" fill="#334155"/><circle cx="${x + 15}" cy="${y}" r="3.6" fill="#334155"/>` +
        (closed ? line(x - 13, y, x + 13, y, color, 2.8) : line(x - 13, y, x + 13, y - 15, color, 2.8));
    }
    function drawLadder(kOk, running, brakeFail, mode) {
      const G = '#0f172a', OK = '#16a34a', BAD = '#dc2626';
      let m = '';
      // 梯级 1：停止 / 启动 / K 线圈
      m += line(600, 92, 862, 92, G, 1.8);
      m += contactSym(648, 92, true, G) + txtEl(648, 80, 'SB1 停止', { size: 10, fill: '#334155' });
      m += contactSym(724, 92, false, G) + txtEl(724, 80, 'SB2 启动', { size: 10, fill: '#334155' });
      m += `<rect x="788" y="80" width="64" height="24" rx="5" fill="${kOk ? '#f0fdf4' : '#fef2f2'}" stroke="${kOk ? OK : BAD}" stroke-width="2.2"/>`;
      m += txtEl(820, 97, 'K', { size: 12, fill: kOk ? OK : BAD });
      // 梯级 2：K → KM1 / KM2 互锁 → 方向输出
      m += line(600, 140, 862, 140, G, 1.8);
      m += contactSym(648, 140, kOk, kOk ? OK : BAD) + txtEl(648, 128, 'K', { size: 10, fill: '#334155' });
      m += contactSym(724, 140, running, running ? OK : '#94a3b8') + txtEl(724, 128, 'KM1 上行', { size: 10, fill: '#334155' });
      m += contactSym(792, 140, true, G) + txtEl(792, 128, 'KM2 互锁', { size: 10, fill: '#334155' });
      m += txtEl(840, 145, 'M', { size: 11, fill: running ? OK : '#94a3b8', weight: 800 });
      // 梯级 3：K → KB 制动 → KT 松闸监控
      m += line(600, 188, 862, 188, G, 1.8);
      m += contactSym(648, 188, kOk, kOk ? OK : BAD) + txtEl(648, 176, 'K', { size: 10, fill: '#334155' });
      m += contactSym(724, 188, running, running ? OK : '#94a3b8') + txtEl(724, 176, 'KB 制动', { size: 10, fill: '#334155' });
      m += contactSym(792, 188, !brakeFail, brakeFail ? BAD : G) + txtEl(792, 176, 'KT 松闸监控', { size: 10, fill: brakeFail ? BAD : '#334155' });
      // 梯级 4：模式选择（三选一）
      m += line(600, 228, 862, 228, G, 1.8);
      [['cont', '连续', 640], ['auto', '自动', 692], ['insp', '检修', 744]].forEach(mo => {
        const on = mode === mo[0];
        m += contactSym(mo[2], 228, on, on ? OK : '#94a3b8');
        m += txtEl(mo[2], 216, mo[1], { size: 9.5, fill: on ? '#059669' : '#94a3b8', weight: on ? 800 : 600 });
      });
      ladderG.innerHTML = m;
    }
    function drawContacts(kOk) {
      let m = '';
      CONTACTS.forEach((c, i) => {
        const row = i < 6 ? 0 : 1, col = i < 6 ? i : 11 - i;
        const x = X0 + col * (CONTACT_W + GAP), y = row === 0 ? Y1 : Y2;
        const tripped = !!ctx.state[c.k];
        const warnOnly = !!c.warn && tripped;
        const sc = tripped ? (warnOnly ? '#b45309' : '#dc2626') : '#fca5a5';
        const sw = tripped ? 2.6 : 1.6;
        m += `<rect x="${x}" y="${y}" width="${CONTACT_W}" height="${CH}" rx="7" fill="${tripped ? (warnOnly ? '#fffbeb' : '#fff') : '#fff'}" stroke="${sc}" stroke-width="${sw}"/>`;
        m += txtEl(x + CONTACT_W / 2, y + 16, `${i + 1}. ${c.n}`, { size: 10.5, fill: tripped ? (warnOnly ? '#b45309' : '#b91c1c') : '#7f1d1d' });
        m += txtEl(x + CONTACT_W / 2, y + 28, c.s, { size: 8.5, fill: '#94a3b8', weight: 500 });
        const cx = x + CONTACT_W / 2, cy = y + 42;
        m += `<circle cx="${cx - 14}" cy="${cy}" r="3.2" fill="#334155"/><circle cx="${cx + 14}" cy="${cy}" r="3.2" fill="#334155"/>`;
        m += tripped ? line(cx - 12, cy, cx + 12, cy - 14, warnOnly ? '#b45309' : '#dc2626', 2.4) : line(cx - 12, cy, cx + 12, cy, '#16a34a', 2.4);
        // 行内连线（第一行左→右，第二行右→左）
        if (i < 6 ? col < 5 : col > 0) {
          const dir = i < 6 ? 1 : -1;
          m += line(x + (dir > 0 ? CONTACT_W : 0), y + CH / 2, x + (dir > 0 ? CONTACT_W + GAP : -GAP), y + CH / 2, '#dc2626', 2.4);
        }
      });
      // 行间连接（右端下行）→ 第二行行至左端 → K → 抱闸 → 附加制动器
      m += line(colC(5), Y1 + CH, colC(5), Y2, '#dc2626', 2.4);
      m += line(colC(0), Y2 + CH, colC(0), 669, '#dc2626', 2.4);
      m += line(colC(0), 669, 496, 669, '#dc2626', 2.4);
      m += `<rect x="496" y="638" width="48" height="62" rx="6" fill="#fff" stroke="${kOk ? '#16a34a' : '#dc2626'}" stroke-width="2.4"/>`;
      m += txtEl(520, 664, 'K', { size: 15, fill: kOk ? '#16a34a' : '#b91c1c' });
      m += txtEl(520, 680, kOk ? '吸合' : '失电', { size: 9.5, fill: kOk ? '#16a34a' : '#b91c1c', weight: 700 });
      m += txtEl(520, 696, '安全继电器', { size: 9, fill: '#64748b', weight: 600 });
      m += line(544, 669, 566, 669, '#dc2626', 2.4);
      m += `<rect x="566" y="646" width="46" height="52" rx="5" fill="#fde68a" stroke="#b45309" stroke-width="2"/>`;
      m += txtEl(589, 666, '工作', { size: 9.5, fill: '#92400e', weight: 700 });
      m += txtEl(589, 680, '制动器', { size: 9.5, fill: '#92400e', weight: 700 });
      m += line(612, 669, 634, 669, '#dc2626', 2.4);
      m += `<rect x="634" y="646" width="104" height="52" rx="5" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>`;
      m += txtEl(686, 666, '附加制动器 AB', { size: 9.5, fill: '#b91c1c', weight: 700 });
      m += txtEl(686, 680, '减速度 ≤ 1 m/s²', { size: 8.5, fill: '#64748b', weight: 500 });
      m += txtEl(756, 664, '超速 / 逆转 / 断链时', { anchor: 'start', size: 9, fill: '#b91c1c', weight: 600 });
      m += txtEl(756, 678, '直接作用于驱动主轴', { anchor: 'start', size: 9, fill: '#b91c1c', weight: 600 });
      m += txtEl(450, 706, '* 检修开关（⑫）仅在“检修”位时旁路自动运行指令；点动仍受其余 11 项触点保护', { size: 9.5, fill: '#b45309', weight: 600 });
      contG.innerHTML = m;
    }
    function paint(dt) {
      const mode = ctx.state.mode, vmax = +ctx.state.vmax;
      const kOk = CONTACTS.every(c => c.warn || !ctx.state[c.k]);
      const insp = ctx.state.inspMode;                                         // 检修真值源（与 mode==='insp' 同步）
      const dirHeld = holdUp || holdDn;
      const jogOk = insp && comLatch && dirHeld;                               // 公共保持 + 按住方向
      let target = 0;
      if (ctx.state.brakeFail) target = 0;                                     // 松闸监控拦截
      else if (insp) target = (jogOk && kOk) ? (holdUp ? V_INSP : -V_INSP) : 0; // 检修点动（上行 + / 下行 −）
      else if (kOk) target = mode === 'cont' ? vmax : (ctx.state.board ? vmax : 0);
      ctx.state.v = plan(ctx.state.v, target, dt);
      const v = ctx.state.v, running = v > 0.02;
      // 主回路电流流动动画（仅绘制器件间隙段，避免穿越器件）
      const off = (performance.now() / 1000 * 70) % 24;
      const wSeg = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${running ? '#2563eb' : '#0f172a'}" stroke-width="${running ? 3 : 2.4}"${running ? ' stroke-dasharray="10 14" stroke-dashoffset="' + (-off).toFixed(1) + '"' : ''}/>`;
      wireG.innerHTML =
        wSeg(78, 110, 84, 110) + wSeg(132, 110, 146, 110) + wSeg(190, 110, 204, 110) + wSeg(246, 110, 260, 110) + wSeg(344, 110, 403, 110) +
        wSeg(141, 110, 141, 196) + `<circle cx="141" cy="110" r="3.4" fill="${running ? '#2563eb' : '#0f172a'}"/>` +
        wSeg(141, 196, 150, 196) + wSeg(212, 196, 230, 196) + wSeg(330, 196, 348, 196) + wSeg(448, 196, 466, 196) + wSeg(532, 196, 540, 196) +
        wSeg(453, 110, 470, 110);
      q('#mRot', svg).setAttribute('stroke', running ? '#2563eb' : '#94a3b8');
      q('#mRot', svg).setAttribute('transform', `rotate(${((performance.now() / 1000 * (running ? 240 : 0)) % 360).toFixed(1)} 428 113)`);
      // 检修盒：转换开关旋钮 + 公共 / 上行 / 下行（v1.2.7）
      q('#knob', svg).setAttribute('cx', insp ? 180 : 96);
      q('#knobPtr', svg).setAttribute('d', `M${insp ? 180 : 96} 336 L${insp ? 180 : 96} 330`);
      q('#btnCom', svg).setAttribute('fill', comLatch ? '#86efac' : '#e2e8f0');
      q('#btnUp', svg).setAttribute('fill', holdUp ? '#86efac' : '#e2e8f0');
      q('#btnDn', svg).setAttribute('fill', holdDn ? '#86efac' : '#e2e8f0');
      q('#jogStat', svg).textContent = !insp
        ? '按钮状态：非检修态，公共/方向均无效'
        : (!comLatch ? '按钮状态：未保持公共 → 方向无效'
          : (dirHeld ? '按钮状态：公共保持 + 方向按下 → 点动运行' : '按钮状态：公共已保持，待按上行/下行'));
      q('#jogStat', svg).setAttribute('fill', (insp && jogOk && kOk) ? '#059669' : '#64748b');
      // S 曲线
      hist.push(v); if (hist.length > 250) hist.shift();
      const px = i => 486 + i / 250 * 214, py = val => 424 - val / 0.8 * 100;
      curveG.innerHTML = `<path d="M${hist.map((val, i) => px(i).toFixed(0) + ' ' + py(val).toFixed(1)).join(' L ')}" fill="none" stroke="#38bdf8" stroke-width="2.2"/>` +
        (target > 0 ? line(486, py(target), 700, py(target), '#fbbf24', 1.2, '5 4') : '');
      // 状态面板
      statusG.innerHTML =
        txtEl(712, 340, mode === 'cont' ? '连续运行' : mode === 'auto' ? '自动运行' : '检修运行', { anchor: 'start', size: 11, fill: '#e2e8f0', weight: 800 }) +
        txtEl(712, 380, `${v.toFixed(2)} / ${target.toFixed(2)} m/s`, { anchor: 'start', size: 11, fill: '#93c5fd', weight: 800 }) +
        txtEl(712, 420, kOk ? '闭合 · 吸合' : '断开 · 失电', { anchor: 'start', size: 11, fill: kOk ? '#4ade80' : '#f87171', weight: 800 }) +
        txtEl(712, 442, ctx.state.brakeFail ? 'KT 松闸监控：拦截启动' : (running ? 'KB 吸合 · 制动器释放' : '失电 · 抱闸'), { anchor: 'start', size: 9.5, fill: ctx.state.brakeFail ? '#f87171' : '#94a3b8', weight: 600 });
      drawLadder(kOk, running, ctx.state.brakeFail, mode);
      drawContacts(kOk);
      ctx.readout([
        ['运行模式', insp ? '<b style="color:#b45309">检修（点动）</b>' : mode === 'cont' ? '连续运行（商业）' : '自动运行（节能）'],
        ['当前速度', `<b>${v.toFixed(2)}</b> m/s${insp ? `（检修速度 ${V_INSP.toFixed(2)}）` : ''}`],
        ['公共按钮', comLatch ? '<b style="color:#059669">信号保持中</b>' : '未保持'],
        ['检修按钮时序', insp
          ? (comLatch ? (dirHeld ? '<b style="color:#059669">公共保持 + 方向 → 运行</b>' : '已保持公共，待按方向')
            : '<b style="color:#dc2626">未按公共 → 不运行</b>')
          : '—'],
        ['安全继电器 K', kOk ? '<b style="color:#059669">吸合</b>' : '<b style="color:#dc2626">失电 → 抱闸</b>'],
        ['点动方向', !insp ? '—（非检修态）' : holdUp ? '<b style="color:#059669">上行</b>' : holdDn ? '<b style="color:#059669">下行</b>' : '停止']
      ]);
    }
    paint(0.016);
    return {
      destroy: ticker(dt => paint(dt)),
      onchange(k, v) {
        ctx.state[k] = v;
        if (k === 'mode') {
          const wasInsp = ctx.state.inspMode;
          ctx.state.inspSw = (v === 'insp');
          ctx.state.inspMode = (v === 'insp');
          hist = [];
          if (v === 'insp') {
            if (!wasInsp) ctx.logLine('检修状态：正常运行控制已被取消');
          } else {
            // 切回正常：comLatch / holdUp / holdDn 全部复位
            comLatch = false; holdUp = false; holdDn = false;
            if (wasInsp) ctx.logLine('恢复正常运行；检修自锁信号已复位');
            else ctx.logLine(`切换运行模式：${v === 'cont' ? '连续运行' : '自动运行'}`);
          }
        }
      },
      onaction(k) {
        /* ---- 检修控制：公共 + 方向（v1.2.7） ---- */
        if (k === 'insp') {
          const next = !ctx.state.inspMode;
          ctx.state.mode = next ? 'insp' : 'cont';
          ctx.state.inspSw = next; ctx.state.inspMode = next;
          if (ctx.els && ctx.els.mode) ctx.els.mode.value = ctx.state.mode;   // 同步下拉显示
          if (!next) { comLatch = false; holdUp = false; holdDn = false; }
          ctx.logLine(next ? '检修状态：正常运行控制已被取消' : '恢复正常运行；检修自锁信号已复位');
          paint(0.016); return;
        }
        if (k === 'com') {
          if (!ctx.state.inspMode) { ctx.logLine('防误操作：公共按钮仅在检修状态有效'); paint(0.016); return; }
          comLatch = !comLatch;
          if (!comLatch) { holdUp = false; holdDn = false; }
          ctx.logLine(comLatch ? '公共按钮：信号保持（须再按住上行/下行方可点动运行）' : '公共按钮：信号解除，检修运行停止');
          paint(0.016); return;
        }
        if (k === 'up:down') { holdUp = true; if (ctx.state.inspMode && !comLatch) ctx.logLine('防误操作：未先按下【公共】按钮并保持，上行无效'); paint(0.016); return; }
        if (k === 'up:up') { holdUp = false; paint(0.016); return; }
        if (k === 'dn:down') { holdDn = true; if (ctx.state.inspMode && !comLatch) ctx.logLine('防误操作：未先按下【公共】按钮并保持，下行无效'); paint(0.016); return; }
        if (k === 'dn:up') { holdDn = false; paint(0.016); return; }
        if (k === 'pass') { ctx.state.board = true; ctx.logLine('出入口感应到乘客 → 自动模式启动'); setTimeout(() => { ctx.state.board = false; }, 4000); }
        if (k === 'estop') { ctx.state.eStop = true; ctx.logLine('急停按钮按下：安全回路断开，立即抱闸'); }
        if (k === 'brakeFail') { ctx.state.brakeFail = true; ctx.logLine('发出运行指令但制动器未松闸 → 松闸监控 KT 动作，拒绝启动'); }
        if (k === 'faultComb') { ctx.state.faultComb = true; ctx.logLine('梳齿板保护动作（下部）：异物卡入梳齿板'); }
        if (k === 'faultCombU') { ctx.state.faultCombU = true; ctx.logLine('梳齿板保护动作（上部）：异物卡入梳齿板'); }
        if (k === 'faultEntry') { ctx.state.faultEntry = true; ctx.logLine('扶手带入口保护动作（下部）：异物卷入入口'); }
        if (k === 'faultEntryU') { ctx.state.faultEntryU = true; ctx.logLine('扶手带入口保护动作（上部）：异物卷入入口'); }
        if (k === 'faultSkirt') { ctx.state.faultSkirt = true; ctx.logLine('围裙板保护动作：异物楔入围裙板与梯级之间'); }
        if (k === 'faultSag') { ctx.state.faultSag = true; ctx.logLine('梯级下陷 / 缺失保护动作：梯级异常，切断安全回路'); }
        if (k === 'faultChain') { ctx.state.faultChain = true; ctx.logLine('驱动链断链 / 松弛保护动作'); }
        if (k === 'faultOver') { ctx.state.faultOver = true; ctx.state.faultAux = true; ctx.logLine('超速保护动作：超过额定速度 1.2 倍 → 附加制动器直接作用于主轴'); }
        if (k === 'faultRev') { ctx.state.faultRev = true; ctx.state.faultAux = true; ctx.logLine('非操纵逆转保护动作 → 附加制动器直接作用于主轴'); }
        if (k === 'faultAux') { ctx.state.faultAux = true; ctx.logLine('附加制动器监控动作：安全回路断开时机械锁紧主轴'); }
        if (k === 'reset') {
          CONTACTS.forEach(c => { if (c.k !== 'inspSw') ctx.state[c.k] = false; });
          ctx.state.brakeFail = false;
          ctx.logLine('故障复位：安全回路重新闭合');
        }
        paint(0.016);
      }
    };
  }
};
const FAULT_INIT = { faultComb: false, faultEntry: false, faultSkirt: false, faultChain: false, faultOver: false, faultRev: false, faultCombU: false, faultEntryU: false, faultSag: false, faultAux: false, eStop: false };

/* =======================================================================
 * 8. 安全保护系统 · 装置布点 + 动作过程特写仿真
 * ===================================================================== */
/* =======================================================================
 * 8. 安全保护系统 · 装置布点 / 实物图库 / 动作过程 / 安全回路（GB 16899-2011）
 * ===================================================================== */
SIMS.safety = {
  title: '安全保护系统 · 装置布点与动作过程仿真',
  desc: '上图为安全装置布点与实物图库；注入故障后左下特写分三阶段演示动作过程（运行 → 装置动作 → 抱闸停机），右下为安全回路与制动器状态，底部为附加制动器与扶手带监测及国标关键参数。',
  photos: [
    { f: 'edu-comb-protect', cap: '梳齿板保护装置（异物卡入上抬触发）' },
    { f: 'edu-handrail-entry', cap: '扶手带入口保护（挡板 + 开关）' },
    { f: 'edu-step-sag', cap: '梯级下陷 / 缺失保护' },
    { f: 'edu-aux-brake', cap: '附加制动器原理（机械摩擦式）' },
    { f: 'real-brake-1', cap: '工作制动器实物（失电抱闸）' },
    { f: 'real-safety-switch-1', cap: '安全保护开关实物' }
  ],
  notes: [
    '安全装置布点：梳齿板保护（上下）×2、扶手带入口保护 ×2、围裙板保护、梯级下陷 / 缺失、驱动链断链 / 松弛、超速、非操纵逆转、扶手带速度监测、急停 ×2、附加制动器。',
    '动作逻辑：任一装置动作 → 安全回路断开 → 安全继电器 K 失电 → 工作制动器抱闸；超速 / 逆转 / 断链时附加制动器直接作用于驱动主轴。',
    '附加制动器（GB 16899-2011 5.4.2.2）：在超过 1.4 倍名义速度前或运行方向改变时动作，机械式摩擦原理，减速度 ≤ 1 m/s²，动作时切断控制电路。',
    '超速保护（5.4.2.3.1）：速度超过额定 1.2 倍前停止；扶手带速度偏离 ±15% 持续 5~15 s 停止；制停距离 0.5 m/s 时 0.20~1.00 m。'
  ],
  controls: [
    { key: 'v', type: 'range', label: '运行速度', min: 0.4, max: 0.75, step: 0.05, value: 0.5, unit: ' m/s' },
    { type: 'buttons', items: [
      { key: 'run', label: '正常运行', cls: 'ok' },
      { key: 'fComb', label: '梳齿板(下)', cls: 'dang' },
      { key: 'fCombU', label: '梳齿板(上)', cls: 'dang' },
      { key: 'fEntry', label: '入口(下)', cls: 'dang' },
      { key: 'fEntryU', label: '入口(上)', cls: 'dang' },
      { key: 'fSkirt', label: '围裙板', cls: 'dang' },
      { key: 'fSag', label: '梯级下陷', cls: 'dang' }
    ] },
    { type: 'buttons', items: [
      { key: 'fChain', label: '断链/松弛', cls: 'dang' },
      { key: 'fOver', label: '超速 115%', cls: 'dang' },
      { key: 'fRev', label: '非操纵逆转', cls: 'dang' },
      { key: 'fHand', label: '扶手带偏离', cls: 'dang' },
      { key: 'fStop', label: '急停', cls: 'dang' },
      { key: 'fAux', label: '附加制动器', cls: 'dang' },
      { key: 'reset', label: '复位', cls: 'ghost' }
    ] }
  ],
  mount(ctx) {
    ctx.state.v = 0.5; ctx.state.fault = ''; ctx.state.phase = 0; ctx.state.vNow = 0.5;
    const plan = makePlanner(0.35, 0.6);
    const q = (sel, r) => r.querySelector(sel);
    /* 布点装置表：x/y=布点徽标坐标，n=名称，scene=特写场景 */
    const DEV = [
      { k: 'fComb', n: '梳齿板(下)', x: 52, y: 184, scene: 'comb' },
      { k: 'fEntry', n: '入口(下)', x: 88, y: 158, scene: 'entry' },
      { k: 'fSkirt', n: '围裙板', x: 152, y: 141, scene: 'skirt' },
      { k: 'fSag', n: '梯级下陷/缺失', x: 208, y: 122, scene: 'sag' },
      { k: 'fChain', n: '断链/松弛', x: 110, y: 196, scene: 'chain' },
      { k: 'fStop', n: '急停 ×2', x: 34, y: 160, scene: 'stop' },
      { k: 'fOver', n: '超速', x: 348, y: 124, scene: 'over' },
      { k: 'fRev', n: '非操纵逆转', x: 386, y: 124, scene: 'rev' },
      { k: 'fHand', n: '扶手带监测', x: 348, y: 148, scene: 'handrail' },
      { k: 'fAux', n: '附加制动器', x: 386, y: 148, scene: 'brake' },
      { k: 'fCombU', n: '梳齿板(上)', x: 306, y: 72, scene: 'comb' },
      { k: 'fEntryU', n: '入口(上)', x: 310, y: 100, scene: 'entry' }
    ];
    const svg = makeSvg(ctx.stage, '0 0 900 816', `
      ${txtEl(450, 24, '安全保护系统 · 装置布点 / 实物图库 / 动作过程 / 安全回路（GB 16899-2011）', { size: 13, fill: '#b91c1c' })}
      <!-- ============ A. 布点图 ============ -->
      ${box(18, 36, 400, 280, '#f8fafc', '#e2e8f0', 2, 10)}
      ${txtEl(218, 60, '安全装置布点（编号见图例）', { size: 12.5, fill: '#334155' })}
      ${line(40, 196, 150, 196, '#a8a29e', 3)}
      ${line(300, 84, 392, 84, '#a8a29e', 3)}
      <path d="M40 196 L300 84" stroke="#94a3b8" stroke-width="9" fill="none"/>
      <path d="M54 186 L292 78" stroke="#fcd34d" stroke-width="6" stroke-dasharray="24 8"/>
      ${box(328, 92, 78, 68, '#dbeafe', '#1d4ed8', 1.8, 6)}
      ${txtEl(367, 110, '驱动站', { size: 10, fill: '#1e3a8a' })}
      ${txtEl(160, 218, '下部张紧 / 返回段', { size: 9.5, fill: '#57534e', weight: 600 })}
      ${txtEl(348, 98, '上部出口', { size: 9.5, fill: '#57534e', weight: 600 })}
      <!-- ============ B. 实物图库 ============ -->
      ${box(430, 36, 452, 280, '#fff', '#e2e8f0', 2, 10)}
      ${txtEl(656, 60, '安全装置实物图库', { size: 12.5, fill: '#334155' })}
      <!-- ============ C. 动作过程特写 ============ -->
      ${box(18, 332, 560, 268, '#fff', '#e2e8f0', 2, 10)}
      ${txtEl(298, 356, '动作过程特写（三阶段）', { size: 12.5, fill: '#334155' })}
      <text id="sceneTitle" x="298" y="378" text-anchor="middle" font-size="12" font-weight="800" fill="#b91c1c" font-family="inherit">选择故障按钮查看动作过程</text>
      <!-- ============ D. 安全回路 + 制动器 ============ -->
      ${box(590, 332, 292, 268, '#fef2f2', '#fecaca', 2, 10)}
      ${txtEl(736, 356, '安全回路 → K → 制动器', { size: 12.5, fill: '#b91c1c' })}
      <!-- ============ E. 附加制动器 / 扶手带监测 / 国标参数 ============ -->
      ${box(18, 616, 864, 184, '#f8fafc', '#e2e8f0', 2, 10)}
      ${txtEl(450, 640, '附加制动器与扶手带监测 · 国标关键参数（GB 16899-2011）', { size: 12.5, fill: '#334155' })}
    `);
    /* ---------- A 布点徽标 + 图例 ---------- */
    const devG = E('g', {}); svg.appendChild(devG);
    const pulse = E('circle', { r: 15, fill: 'none', stroke: '#dc2626', 'stroke-width': 2.6 });
    svg.appendChild(pulse);
    function drawDevs() {
      let m = '';
      DEV.forEach((d, i) => {
        const act = ctx.state.fault === d.k;
        m += `<circle cx="${d.x}" cy="${d.y}" r="10.5" fill="${act ? '#dc2626' : '#fff'}" stroke="${act ? '#991b1b' : '#dc2626'}" stroke-width="2.2"/>`;
        m += `<text x="${d.x}" y="${d.y + 4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${act ? '#fff' : '#b91c1c'}" font-family="inherit">${i + 1}</text>`;
      });
      // 图例（两列六行，标签不压图）
      for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) {
        const idx = c * 6 + r;
        if (idx >= DEV.length) continue;
        m += txtEl(36 + c * 196, 240 + r * 14, `${idx + 1} ${DEV[idx].n}`, { anchor: 'start', size: 9.5, fill: '#57534e', weight: 600 });
      }
      devG.innerHTML = m;
    }
    /* ---------- B 实物图库（SVG 内嵌图片） ---------- */
    const galG = E('g', {}); svg.appendChild(galG);
    const IMGS = [
      { f: 'edu-comb-protect', n: '梳齿板保护', s: '异物卡入 → 梳齿板上抬' },
      { f: 'edu-handrail-entry', n: '扶手带入口', s: '异物卷入 → 挡板变形' },
      { f: 'real-skirt-1', n: '围裙板防夹', s: '间隙 ≤ 4 mm + 毛刷' },
      { f: 'edu-step-sag', n: '梯级下陷/缺失', s: '梯级异常 → 缺级检测' },
      { f: 'edu-chain-switch', n: '断链/松弛开关', s: '张紧超程 → 开关断开' },
      { f: 'edu-aux-brake', n: '附加制动器', s: '机械摩擦 · 减速度 ≤ 1 m/s²' }
    ];
    galG.innerHTML = IMGS.map((g, i) => {
      const col = i % 3, row = (i / 3) | 0;
      const cx = 442 + col * 146, cy = 76 + row * 138;
      return box(cx, cy, 138, 128, '#f8fafc', '#e2e8f0', 1.4, 6) +
        `<image href="assets/images/${g.f}.png" x="${cx + 4}" y="${cy + 4}" width="130" height="86" preserveAspectRatio="xMidYMid meet"/>` +
        txtEl(cx + 69, cy + 106, g.n, { size: 10, fill: '#334155' }) +
        txtEl(cx + 69, cy + 120, g.s, { size: 8.5, fill: '#64748b', weight: 500 });
    }).join('');
    /* ---------- C 特写舞台 ---------- */
    const sceneG = E('g', {}); svg.appendChild(sceneG);
    let t = 0;
    function scene() {
      const f = DEV.find(d => d.k === ctx.state.fault);
      if (!f) { sceneG.innerHTML = ''; q('#sceneTitle', svg).textContent = '选择故障按钮查看动作过程'; return; }
      const p = ctx.state.phase;   // 0 运行 1 动作 2 停机
      q('#sceneTitle', svg).textContent = `${f.n}：${p === 0 ? '① 正常运行' : p === 1 ? '② 装置动作，开关触发' : '③ 安全回路断开 → 抱闸停机'}`;
      let m = `<g transform="translate(56 400)">`;
      const band = p === 0 ? line(0, 62, 300, 62, '#fcd34d', 9, '26 8') + `<line x1="${(t * 90 % 34)}" y1="62" x2="300" y2="62" stroke="#b45309" stroke-width="1.2" stroke-dasharray="2 32"/>` : line(0, 62, 300, 62, p === 1 ? '#fbbf24' : '#94a3b8', 9);
      if (f.scene === 'comb') {
        m += band;
        m += `<path d="M196 62 L250 62 L250 44 L196 51 Z" fill="${p >= 1 ? '#fbbf24' : '#f59e0b'}" stroke="#b45309" stroke-width="1.6"/>`;
        for (let k = 0; k < 9; k++) m += line(202 + k * 6, 46 + k * 1.5, 202 + k * 6, 62, '#b45309', 1.4);
        m += `<rect x="130" y="${p >= 1 ? 34 : 44}" width="48" height="14" rx="3" fill="#a16207" stroke="#78350f" stroke-width="1.6"/>`;
        m += txtEl(0, 26, p === 0 ? '鞋尖接近梳齿板' : p === 1 ? '异物卡入，梳齿板上抬' : '开关已触发 → 停机', { anchor: 'start', size: 11, fill: p === 0 ? '#334155' : '#b91c1c' });
        m += txtEl(0, 96, p === 0 ? '啮合 ≥ 4 mm · 间隙 ≤ 4 mm' : '梳齿板开关断开 → K 失电', { anchor: 'start', size: 9.5, fill: '#64748b', weight: 500 });
      } else if (f.scene === 'entry') {
        m += `<rect x="70" y="26" width="130" height="62" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/>`;
        m += txtEl(135, 18, '扶手带入口', { size: 11, fill: '#334155' });
        m += `<rect x="164" y="42" width="36" height="14" rx="7" fill="#334155"/>`;
        if (p >= 1) m += `<rect x="182" y="26" width="15" height="${p === 1 ? 24 : 42}" rx="4" fill="#b91c1c"/>`;
        m += band;
        m += txtEl(0, 110, p === 0 ? '异物接近入口毛刷' : p === 1 ? '异物卷入，入口挡板变形' : '入口保护开关断开 → 停机', { anchor: 'start', size: 11, fill: p === 0 ? '#334155' : '#b91c1c' });
      } else if (f.scene === 'skirt') {
        m += band;
        m += line(170, 22, 170, 62, '#94a3b8', 7);
        m += txtEl(170, 15, '围裙板', { size: 10.5, fill: '#64748b' });
        if (p >= 1) m += `<polygon points="208,54 230,46 230,62 208,62" fill="#b91c1c"/>`;
        m += txtEl(0, 96, p === 0 ? '梯级与围裙板间隙 ≤ 4 mm（两侧和 ≤ 7 mm）' : p === 1 ? '异物楔入，围裙板内移' : '围裙板开关断开 → 停机', { anchor: 'start', size: 11, fill: p === 0 ? '#334155' : '#b91c1c' });
      } else if (f.scene === 'sag') {
        m += `<rect x="0" y="26" width="300" height="10" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.4"/>`;
        m += txtEl(150, 18, '楼层板 / 返回段检测面', { size: 10, fill: '#64748b', weight: 600 });
        for (let k = 0; k < 4; k++) {
          const dip = p >= 1 ? (k === 1 ? 16 : 6) : 0;
          m += `<rect x="${40 + k * 62}" y="${36 + dip}" width="52" height="22" rx="3" fill="#fbbf24" stroke="#b45309" stroke-width="1.6"/>`;
        }
        if (p >= 1) m += `<circle cx="120" cy="${36 + 16 + 11}" r="5" fill="#dc2626"/>` + line(120, 63, 120, 78, '#dc2626', 2);
        m += txtEl(0, 110, p === 0 ? '梯级间距 400 mm，踏面平整' : p === 1 ? '梯级下陷 / 缺失，检测开关动作' : '缺级保护断开 → 停机', { anchor: 'start', size: 11, fill: p === 0 ? '#334155' : '#b91c1c' });
      } else if (f.scene === 'chain') {
        m += `<circle cx="60" cy="62" r="22" fill="#e2e8f0" stroke="#7c3aed" stroke-width="2.4"/>`;
        m += `<g transform="translate(60 62)">${sprocketMarkup(0, 0, 22, '#7c3aed', 8)}</g>`;
        if (p === 0) m += line(82, 80, 280, 80, '#78716c', 4);
        else m += `<path d="M82 80 Q 181 ${p === 1 ? 102 : 120} 280 80" fill="none" stroke="#dc2626" stroke-width="4"/>`;
        m += txtEl(0, 122, p === 0 ? '链条保持张紧' : p === 1 ? '链条松弛 / 断裂下垂' : '张紧开关断开 → 停机', { anchor: 'start', size: 11, fill: p === 0 ? '#334155' : '#b91c1c' });
      } else if (f.scene === 'over') {
        m += `<path d="M46 92 A54 54 0 0 1 154 92" fill="none" stroke="#475569" stroke-width="4"/>`;
        for (let k = 0; k <= 6; k++) { const a = Math.PI + k * Math.PI / 6; m += line(100 + 42 * Math.cos(a), 92 + 42 * Math.sin(a), 100 + 50 * Math.cos(a), 92 + 50 * Math.sin(a), '#475569', 2); }
        m += line(100 + 33 * Math.cos(Math.PI + 1.15), 92 + 33 * Math.sin(Math.PI + 1.15), 100 + 47 * Math.cos(Math.PI + 1.15), 92 + 47 * Math.sin(Math.PI + 1.15), '#dc2626', 3);
        const na = p === 0 ? Math.PI + 0.75 : p === 1 ? Math.PI + 1.62 : Math.PI + 1.78;
        m += line(100, 92, 100 + 46 * Math.cos(na), 92 + 46 * Math.sin(na), '#dc2626', 3);
        m += txtEl(100, 108, 'v', { size: 11, fill: '#475569' });
        m += txtEl(154, 60, '1.2×', { size: 9, fill: '#dc2626', weight: 800 });
        m += txtEl(0, 128, p === 0 ? '速度在允许范围内' : p === 1 ? '速度超 1.2 倍额定值' : '超速开关断开 → 停机', { anchor: 'start', size: 11, fill: p === 0 ? '#334155' : '#b91c1c' });
      } else if (f.scene === 'rev') {
        m += band;
        const dir = p === 0 ? 1 : -1;
        m += `<polygon points="${140 + dir * 40},62 ${120 + dir * 40},52 ${120 + dir * 40},72" fill="${p >= 1 ? '#dc2626' : '#334155'}"/>`;
        m += txtEl(140, 44, p === 0 ? '规定方向：上行' : p === 1 ? '非操纵逆转：方向改变' : '防逆转开关断开 → 停机', { size: 11, fill: p >= 1 ? '#b91c1c' : '#334155' });
        m += txtEl(0, 96, p >= 1 ? '附加制动器同时动作，直接锁紧主轴' : '运行方向由操纵装置给定', { anchor: 'start', size: 9.5, fill: '#64748b', weight: 500 });
      } else if (f.scene === 'handrail') {
        m += txtEl(0, 26, '扶手带速度 vs 梯级速度', { anchor: 'start', size: 11, fill: '#334155' });
        const dev = p >= 1 ? 0.22 : 0.01;
        m += line(110, 40, 110, 84, '#94a3b8', 1.6);
        m += `<rect x="118" y="42" width="${(200 * (1 + dev)).toFixed(0)}" height="14" rx="3" fill="#0ea5e9"/>`;
        m += txtEl(118, 36, '扶手带', { anchor: 'start', size: 9, fill: '#0369a1', weight: 700 });
        m += `<rect x="118" y="64" width="200" height="14" rx="3" fill="#fbbf24"/>`;
        m += txtEl(118, 94, '梯级', { anchor: 'start', size: 9, fill: '#b45309', weight: 700 });
        if (p >= 1) m += line(320, 36, 320, 88, '#dc2626', 2, '4 3');
        m += txtEl(0, 122, p === 0 ? '偏离 +1%（允许 0 ~ +2%）' : p === 1 ? '偏离超 ±15% 且持续 5~15 s' : '扶手带监测断开 → 停机', { anchor: 'start', size: 11, fill: p === 0 ? '#334155' : '#b91c1c' });
      } else if (f.scene === 'stop') {
        m += `<circle cx="70" cy="62" r="26" fill="${p >= 1 ? '#dc2626' : '#fee2e2'}" stroke="#b91c1c" stroke-width="3"/>`;
        m += txtEl(70, 68, '急停', { size: 12, fill: p >= 1 ? '#fff' : '#b91c1c' });
        m += band;
        m += txtEl(0, 116, p === 0 ? '急停按钮待命（上 / 下端各一）' : p === 1 ? '按钮按下，触点断开' : '安全回路断开 → 停机', { anchor: 'start', size: 11, fill: p === 0 ? '#334155' : '#b91c1c' });
      } else {
        m += `<circle cx="90" cy="62" r="30" fill="#e2e8f0" stroke="#334155" stroke-width="3"/>`;
        if (p >= 1) m += `<rect x="52" y="54" width="24" height="16" rx="3" fill="#dc2626"/><rect x="104" y="54" width="24" height="16" rx="3" fill="#dc2626"/>`;
        else m += `<rect x="46" y="54" width="24" height="16" rx="3" fill="#94a3b8"/><rect x="110" y="54" width="24" height="16" rx="3" fill="#94a3b8"/>`;
        m += txtEl(90, 112, '附加制动器（主轴）', { size: 10, fill: '#475569', weight: 600 });
        m += txtEl(0, 140, p === 0 ? '制动器保持释放（得电）' : p === 1 ? '线圈失电，制动瓦抱紧' : '主轴锁停（减速度 ≤ 1 m/s²）', { anchor: 'start', size: 11, fill: p === 0 ? '#334155' : '#b91c1c' });
      }
      m += `</g>`;
      sceneG.innerHTML = m;
    }
    /* ---------- D 安全回路 + 制动器 ---------- */
    const loopG = E('g', {}); svg.appendChild(loopG);
    const brakeG = E('g', {}); svg.appendChild(brakeG);
    const brakeStat = E('text', { x: 736, y: 566, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#475569', 'font-family': 'inherit' });
    svg.appendChild(brakeStat);
    function drawLoop() {
      const f = DEV.find(d => d.k === ctx.state.fault);
      const tripped = !!ctx.state.fault;
      let m = '';
      m += txtEl(736, 380, tripped ? `动作装置：${f ? f.n : ''}` : '安全回路：闭合（无动作）', { size: 10.5, fill: tripped ? '#b91c1c' : '#059669', weight: 700 });
      const nodes = [
        { x: 630, y: 404, t: 'L+' },
        { x: 690, y: 404, t: tripped ? '装置' : '闭合' },
        { x: 750, y: 404, t: 'K' },
        { x: 810, y: 404, t: '抱闸' }
      ];
      nodes.forEach((n, i) => {
        const on = !tripped || (i === 3 && ctx.state.phase >= 1);
        m += `<circle cx="${n.x}" cy="${n.y}" r="16" fill="${on ? (i === 3 ? '#fde68a' : '#dcfce7') : '#fee2e2'}" stroke="${on ? (i === 3 ? '#b45309' : '#16a34a') : '#dc2626'}" stroke-width="2.2"/>`;
        m += txtEl(n.x, n.y + 4, n.t, { size: 9.5, fill: on ? (i === 3 ? '#92400e' : '#166534') : '#b91c1c', weight: 800 });
        if (i < 3) m += line(n.x + 16, n.y, nodes[i + 1].x - 16, n.y, tripped && i < 2 ? '#dc2626' : '#16a34a', 2.4);
      });
      m += txtEl(736, 448, tripped ? 'K 失电 → 制动线圈断电' : 'K 吸合 → 制动器释放', { size: 10, fill: tripped ? '#b91c1c' : '#059669', weight: 700 });
      m += line(736, 462, 736, 486, tripped ? '#dc2626' : '#16a34a', 2.4);
      m += box(660, 486, 152, 22, tripped ? '#fee2e2' : '#f0fdf4', tripped ? '#fecaca' : '#bbf7d0', 1.6, 5);
      m += txtEl(736, 501, tripped ? '切断控制电路 + 抱闸' : '控制电路正常', { size: 9.5, fill: tripped ? '#b91c1c' : '#166534', weight: 700 });
      loopG.innerHTML = m;
    }
    function paint(dt) {
      t += dt;
      const vT = ctx.state.fault ? (ctx.state.phase === 0 ? +ctx.state.v : 0) : +ctx.state.v;
      ctx.state.vNow = plan(ctx.state.vNow, vT, dt);
      if (ctx.state.fault) ctx.state.phase = Math.min(2, Math.floor(t / 2.2));
      const act = DEV.findIndex(d => d.k === ctx.state.fault);
      if (act >= 0) {
        const d = DEV[act];
        pulse.setAttribute('cx', d.x); pulse.setAttribute('cy', d.y);
        pulse.setAttribute('r', (13 + (t * 22) % 14).toFixed(1));
        pulse.setAttribute('opacity', (1 - (t * 22 % 14) / 14).toFixed(2));
        pulse.setAttribute('display', '');
      } else pulse.setAttribute('display', 'none');
      drawDevs(); scene(); drawLoop();
      const brk = ctx.state.vNow < 0.02 && !!ctx.state.fault;
      brakeG.innerHTML =
        `<circle cx="736" cy="540" r="22" fill="#e2e8f0" stroke="#334155" stroke-width="2.4"/>` +
        `<circle cx="736" cy="540" r="7" fill="#94a3b8"/>` +
        (brk ? `<rect x="706" y="528" width="20" height="24" rx="4" fill="#dc2626"/><rect x="746" y="528" width="20" height="24" rx="4" fill="#dc2626"/>`
          : `<rect x="698" y="528" width="20" height="24" rx="4" fill="#94a3b8"/><rect x="754" y="528" width="20" height="24" rx="4" fill="#94a3b8"/>`);
      brakeStat.textContent = brk ? '抱闸（瓦贴紧制动盘）' : ctx.state.fault ? '制动中…' : '释放（得电）';
      brakeStat.setAttribute('fill', brk ? '#b91c1c' : '#475569');
      const kOk = !ctx.state.fault;
      ctx.readout([
        ['当前状态', ctx.state.fault ? `<b style="color:#dc2626">故障：${(DEV.find(d => d.k === ctx.state.fault) || {}).n || ''}（阶段 ${ctx.state.phase + 1}/3）</b>` : '<b style="color:#059669">正常运行</b>'],
        ['梯级速度', `${ctx.state.vNow.toFixed(2)} m/s`],
        ['安全回路', kOk ? '<b style="color:#059669">闭合</b>' : '<b style="color:#dc2626">断开</b>'],
        ['工作制动器', brk ? '<b style="color:#dc2626">已抱闸</b>' : (ctx.state.fault ? '制动中…（减速至停后抱闸）' : '释放')],
        ['附加制动器', (ctx.state.fault === 'fOver' || ctx.state.fault === 'fRev' || ctx.state.fault === 'fAux' || ctx.state.fault === 'fChain') && ctx.state.phase >= 1 ? '<b style="color:#dc2626">已动作（超速 / 逆转 / 断链）</b>' : '待命（提升高度 > 6 m 必设）'],
        ['布点编号', DEV.map((d, i) => `${i + 1}${d.n}`).join(' ')]
      ]);
    }
    /* ---------- E 附加制动器 / 扶手带监测 / 国标参数 ---------- */
    const eG = E('g', {}); svg.appendChild(eG);
    eG.innerHTML =
      `<image href="assets/images/edu-aux-brake.webp" x="36" y="654" width="150" height="132" preserveAspectRatio="xMidYMid meet"/>` +
      box(36, 654, 150, 132, 'none', '#cbd5e1', 1.2, 4) +
      txtEl(111, 798, '附加制动器（机械摩擦式）', { size: 9.5, fill: '#334155', weight: 700 }) +
      `<image href="assets/images/edu-handrail-monitor.webp" x="204" y="660" width="150" height="122" preserveAspectRatio="xMidYMid meet"/>` +
      box(204, 660, 150, 122, 'none', '#cbd5e1', 1.2, 4) +
      txtEl(279, 798, '扶手带速度监测器', { size: 9.5, fill: '#334155', weight: 700 }) +
      txtEl(382, 668, '· 附加制动器（5.4.2.2）：超过 1.4 倍名义速度前或改变规定方向时动作；', { anchor: 'start', size: 10, fill: '#334155' }) +
      txtEl(382, 688, '  机械式摩擦原理，减速度 ≤ 1 m/s²，动作时强制切断控制电路；', { anchor: 'start', size: 10, fill: '#334155' }) +
      txtEl(382, 708, '· 超速保护（5.4.2.3.1）：额定速度 1.2 倍前停止；非操纵逆转（5.4.2.3.2）；', { anchor: 'start', size: 10, fill: '#334155' }) +
      txtEl(382, 728, '· 扶手带监测：速度偏离 ±15% 且持续 5~15 s 停止；顶面距踏面 0.90~1.10 m；', { anchor: 'start', size: 10, fill: '#334155' }) +
      txtEl(382, 748, '· 制停距离：0.50 m/s → 0.20~1.00 m；0.65 → 0.30~1.30 m；0.75 → 0.40~1.50 m；', { anchor: 'start', size: 10, fill: '#334155' }) +
      txtEl(382, 768, '· 间隙尺寸：梳齿啮合 ≥ 4 mm、围裙板任侧 ≤ 4 mm（两侧和 ≤ 7 mm）、相邻梯级 ≤ 6 mm。', { anchor: 'start', size: 10, fill: '#334155' }) +
      txtEl(382, 790, '空载 / 满载速度偏差不超过 ±5%；制动器未松闸时监控装置应阻止启动。', { anchor: 'start', size: 9.5, fill: '#64748b', weight: 500 });
    paint(0.016);
    return {
      destroy: ticker(dt => paint(dt)),
      onchange() { },
      onaction(k) {
        if (k === 'run' || k === 'reset') { ctx.state.fault = ''; ctx.state.phase = 0; t = 0; ctx.logLine(k === 'run' ? '恢复正常运行' : '保护装置复位'); }
        else { ctx.state.fault = k; ctx.state.phase = 0; t = 0; ctx.logLine(`注入故障：${(DEV.find(d => d.k === k) || {}).n}—— 观察特写分镜与抱闸过程`); }
      }
    };
  }
};
