/* =========================================================================
 * 原理图库（矢量 SVG 绘制）
 * 覆盖：四大区域示意图 + 八大系统原理图
 * 扶梯标准侧立面：下部水平段 → 30° 倾斜段 → 上部水平段
 * ========================================================================= */

let _uid = 0;
const S = {
  /** 文本 */
  txt(x, y, s, o = {}) {
    const { anchor = 'middle', size = 13, fill = '#0f172a', weight = 700, cls = '' } = o;
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${fill}" font-weight="${weight}" font-family="inherit"${cls ? ` class="${cls}"` : ''}>${s}</text>`;
  },
  /** 线条 */
  ln(x1, y1, x2, y2, o = {}) {
    const { stroke = '#334155', w = 2, dash = '' } = o;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  },
  /** 矩形 */
  rc(x, y, w, h, o = {}) {
    const { fill = '#ffffff', stroke = '#334155', sw = 2, rx = 5, dash = '', opacity = 1 } = o;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  },
  /** 圆 */
  ci(cx, cy, r, o = {}) {
    const { fill = 'none', stroke = '#334155', sw = 2, dash = '' } = o;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  },
  /** 多边形（数组或点串） */
  pg(points, o = {}) {
    const { fill = '#ffffff', stroke = '#334155', sw = 2, opacity = 1 } = o;
    const ps = typeof points === 'string' ? points : points.map(p => p.join(',')).join(' ');
    return `<polygon points="${ps}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
  },
  /** 路径 */
  path(d, o = {}) {
    const { fill = 'none', stroke = '#334155', w = 2, dash = '', cap = '' } = o;
    return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}${cap ? ` stroke-linecap="${cap}"` : ''}/>`;
  },
  /** 箭头线 */
  ar(x1, y1, x2, y2, o = {}) {
    const { stroke = '#2563eb', w = 2.4, head = 9, dash = '' } = o;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const bx = x2 - head * Math.cos(ang), by = y2 - head * Math.sin(ang);
    const p1 = [x2 - head * 1.7 * Math.cos(ang - 0.42), y2 - head * 1.7 * Math.sin(ang - 0.42)];
    const p2 = [x2 - head * 1.7 * Math.cos(ang + 0.42), y2 - head * 1.7 * Math.sin(ang + 0.42)];
    return `<line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${stroke}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>` +
      `<polygon points="${p1.join(',')} ${x2},${y2} ${p2.join(',')}" fill="${stroke}"/>`;
  },
  /** 链条（双点划线示意） */
  chain(x1, y1, x2, y2, color = '#78716c') {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3"/>` +
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e7e5e4" stroke-width="1.2" stroke-dasharray="4 4"/>`;
  },
  /** 尺寸标注（水平） */
  dimH(x1, x2, y, label) {
    return S.ln(x1, y, x2, y, { stroke: '#0891b2', w: 1.4 }) +
      S.ln(x1, y - 6, x1, y + 6, { stroke: '#0891b2', w: 1.4 }) +
      S.ln(x2, y - 6, x2, y + 6, { stroke: '#0891b2', w: 1.4 }) +
      S.txt((x1 + x2) / 2, y - 9, label, { size: 12, fill: '#0e7490' });
  },
  /** 尺寸标注（垂直） */
  dimV(y1, y2, x, label) {
    return S.ln(x, y1, x, y2, { stroke: '#0891b2', w: 1.4 }) +
      S.ln(x - 6, y1, x + 6, y1, { stroke: '#0891b2', w: 1.4 }) +
      S.ln(x - 6, y2, x + 6, y2, { stroke: '#0891b2', w: 1.4 }) +
      `<text x="${x - 8}" y="${(y1 + y2) / 2}" text-anchor="middle" font-size="12" fill="#0e7490" font-weight="700" font-family="inherit" transform="rotate(-90 ${x - 8} ${(y1 + y2) / 2})">${label}</text>`;
  }
};

/** 统一封装 */
function svgWrap(w, h, inner, bg) {
  _uid++;
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img">` +
    (bg ? `<rect x="0" y="0" width="${w}" height="${h}" fill="${bg}"/>` : '') +
    inner + `</svg>`;
}

/* ---------------- 扶梯标准侧立面基准（30° 倾角） ---------------- */
const ESC = {
  x0: 60, x1: 200, x2: 560, x3: 720,
  yb: 470, yt: 262, h: 70, k: 0.5774,
  /** 梯级踏面线高度 */
  tread(x) {
    if (x <= this.x1) return this.yb - this.h;
    if (x >= this.x2) return this.yt - this.h;
    return (this.yb - this.h) - (x - this.x1) * this.k;
  },
  /** 桁架上弦（顶） */
  up(x) { return this.tread(x) - 34; },
  /** 桁架下弦（底） */
  lo(x) { return this.tread(x) + 70; }
};

/** 绘制扶梯侧立面骨架（桁架轮廓 + 楼层地坪），可选高亮 */
function escFrame(o = {}) {
  const { showWeb = true, showSteps = true, showHandrail = true } = o;
  const p = [];
  const U = x => ESC.up(x), L = x => ESC.lo(x), T = x => ESC.tread(x);
  const xs = [ESC.x0, ESC.x1, ESC.x2, ESC.x3];
  // 桁架本体
  const top = xs.map(x => `${x},${U(x).toFixed(1)}`).join(' ');
  const bot = [ESC.x3, ESC.x2, ESC.x1, ESC.x0].map(x => `${x},${L(x).toFixed(1)}`).join(' ');
  p.push(S.pg(`${top} ${bot}`, { fill: '#f1f5f9', stroke: '#64748b', sw: 2.4 }));
  // 腹杆
  if (showWeb) {
    for (let i = 0; i <= 12; i++) {
      const x = ESC.x0 + i * (ESC.x3 - ESC.x0) / 12;
      p.push(S.ln(x, U(x), x, L(x), { stroke: '#cbd5e1', w: 2 }));
    }
  }
  // 上下弦加粗
  p.push(S.path(`M${ESC.x0} ${U(ESC.x0).toFixed(1)} L${ESC.x1} ${U(ESC.x1).toFixed(1)} L${ESC.x2} ${U(ESC.x2).toFixed(1)} L${ESC.x3} ${U(ESC.x3).toFixed(1)}`, { stroke: '#475569', w: 3.4 }));
  p.push(S.path(`M${ESC.x0} ${L(ESC.x0).toFixed(1)} L${ESC.x1} ${L(ESC.x1).toFixed(1)} L${ESC.x2} ${L(ESC.x2).toFixed(1)} L${ESC.x3} ${L(ESC.x3).toFixed(1)}`, { stroke: '#475569', w: 3.4 }));
  // 地坪
  p.push(S.rc(0, ESC.yb, 210, 16, { fill: '#d6d3d1', stroke: '#78716c', sw: 1.6, rx: 2 }));
  p.push(S.rc(556, ESC.yt, 244, 16, { fill: '#d6d3d1', stroke: '#78716c', sw: 1.6, rx: 2 }));
  p.push(S.txt(105, ESC.yb + 34, '下部地坪', { size: 11.5, fill: '#57534e' }));
  p.push(S.txt(678, ESC.yt - 8, '上部地坪', { size: 11.5, fill: '#57534e' }));
  // 梯级（沿踏面线排布）
  if (showSteps) {
    for (let i = 0; i < 11; i++) {
      const x = 96 + i * 58;
      if (x > 700) break;
      const y = T(x);
      p.push(S.pg([[x, y - 26], [x + 34, y - 26], [x + 34, y - 6], [x, y]], { fill: '#fcd34d', stroke: '#b45309', sw: 1.4 }));
    }
  }
  // 护栏玻璃 + 扶手带
  if (showHandrail) {
    const gU = x => U(x) - 46;
    p.push(S.path(`M${ESC.x0} ${gU(ESC.x0).toFixed(1)} L${ESC.x3} ${(gU(ESC.x3)).toFixed(1)}`, { stroke: '#bae6fd', w: 0 }));
    p.push(S.pg(xs.map(x => `${x},${gU(x).toFixed(1)}`).join(' ') + ' ' + [ESC.x3, ESC.x2, ESC.x1, ESC.x0].map(x => `${x},${U(x).toFixed(1)}`).join(' '), { fill: '#e0f2fe', stroke: '#7dd3fc', sw: 1.4, opacity: 0.7 }));
    p.push(S.path(`M${ESC.x0} ${gU(ESC.x0).toFixed(1)} L${ESC.x1} ${gU(ESC.x1).toFixed(1)} L${ESC.x2} ${gU(ESC.x2).toFixed(1)} L${ESC.x3} ${gU(ESC.x3).toFixed(1)}`, { stroke: '#334155', w: 6 }));
    p.push(S.txt(628, gU(ESC.x2) - 8, '扶手带 · 护壁板', { size: 11.5, fill: '#334155' }));
  }
  return p;
}

/* ======================= 四大区域示意图 ======================= */

/* 上部机房（驱动站） */
function scUpperMachine() {
  const p = escFrame({ showWeb: false, showSteps: true, showHandrail: true });
  p.push(S.txt(40, 34, '上部机房（驱动站）', { anchor: 'start', size: 16, fill: '#1e3a8a' }));
  p.push(S.txt(40, 54, 'Upper Machine Room / Drive Station', { anchor: 'start', size: 11, fill: '#64748b', weight: 500 }));
  // 高亮区域
  p.push(S.rc(556, 96, 244, 166, { fill: 'none', stroke: '#2563eb', sw: 2.4, dash: '8 6', rx: 8 }));
  p.push(S.txt(678, 118, '上部机房区域', { size: 12.5, fill: '#1d4ed8' }));
  // 驱动主机
  p.push(S.rc(580, 130, 120, 62, { fill: '#dbeafe', stroke: '#1d4ed8', sw: 2.2 }));
  p.push(S.txt(640, 156, '驱动主机', { size: 12, fill: '#1e3a8a' }));
  p.push(S.txt(640, 174, '电机 + 减速箱', { size: 11, fill: '#1e3a8a', weight: 500 }));
  p.push(S.ci(600, 161, 15, { fill: '#fff', stroke: '#1d4ed8' }));
  p.push(S.ci(600, 161, 4, { fill: '#1d4ed8', stroke: '#1d4ed8' }));
  // 控制柜
  p.push(S.rc(712, 130, 76, 62, { fill: '#e0e7ff', stroke: '#4f46e5', sw: 2.2 }));
  p.push(S.txt(750, 156, '控制柜', { size: 11.5, fill: '#3730a3' }));
  p.push(S.txt(750, 174, '主控·变频', { size: 11, fill: '#4338ca', weight: 500 }));
  // 驱动链轮 + 转向链轮
  p.push(S.ci(600, 214, 22, { fill: '#e0e7ff', stroke: '#1d4ed8', sw: 2.4 }));
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; p.push(S.ln(600 + 10 * Math.cos(a), 214 + 10 * Math.sin(a), 600 + 20 * Math.cos(a), 214 + 20 * Math.sin(a), { stroke: '#60a5fa', w: 2 })); }
  p.push(S.txt(600, 252, '梯级驱动链轮', { size: 11, fill: '#1d4ed8' }));
  p.push(S.ci(680, 214, 18, { fill: '#dcfce7', stroke: '#059669', sw: 2 }));
  p.push(S.txt(680, 252, '扶手带驱动轮', { size: 11, fill: '#047857' }));
  p.push(S.ci(742, 214, 18, { fill: '#fff', stroke: '#0891b2', sw: 2 }));
  p.push(S.txt(742, 252, '上部转向站', { size: 11, fill: '#0e7490' }));
  // 传动链
  p.push(S.chain(600, 214, 680, 214, '#475569'));
  p.push(S.chain(600, 214, 742, 214, '#94a3b8'));
  // 制动器
  p.push(S.rc(700, 96, 88, 28, { fill: '#fee2e2', stroke: '#dc2626', sw: 2 }));
  p.push(S.txt(744, 115, '工作/附加制动器', { size: 11, fill: '#b91c1c' }));
  p.push(S.ln(700, 110, 660, 140, { stroke: '#dc2626', w: 1.8, dash: '5 4' }));
  // 说明
  p.push(S.txt(60, 500, '① 驱动主机 ② 减速箱 ③ 制动器 ④ 控制柜 ⑤ 梯级驱动链轮 ⑥ 扶手带驱动轮 ⑦ 上部转向站', { size: 11.5, fill: '#334155' }));
  p.push(S.txt(60, 522, '提升高度较小的扶梯不设独立机房，上述设备直接置于上部桁架内。', { size: 11.5, fill: '#64748b', weight: 500 }));
  return svgWrap(800, 540, p.join(''));
}

/* 桁架中段（倾斜梯路段） */
function scTrussMiddle() {
  const p = escFrame({ showWeb: true, showSteps: true, showHandrail: true });
  p.push(S.txt(40, 34, '桁架中段（倾斜梯路段）', { anchor: 'start', size: 16, fill: '#0e7490' }));
  p.push(S.txt(40, 54, 'Truss Sloped Section', { anchor: 'start', size: 11, fill: '#64748b', weight: 500 }));
  p.push(S.rc(200, 40, 360, 220, { fill: 'none', stroke: '#0891b2', sw: 2.4, dash: '8 6', rx: 8 }));
  p.push(S.txt(380, 62, '倾斜梯路段 · 倾角 30°', { size: 12.5, fill: '#0e7490' }));
  // 倾角标注
  p.push(S.ln(200, 400, 400, 400, { stroke: '#0891b2', w: 1.4, dash: '6 5' }));
  p.push(S.path('M240 400 A 40 40 0 0 0 234 377', { stroke: '#0891b2', w: 1.6 }));
  p.push(S.txt(266, 396, 'α = 30°', { size: 12, fill: '#0e7490' }));
  // 导轨标注
  p.push(S.path(`M${ESC.x0} ${ESC.tread(ESC.x0)} L${ESC.x3} ${ESC.tread(ESC.x3)}`, { stroke: '#f59e0b', w: 2.4, dash: '9 5' }));
  p.push(S.txt(672, ESC.tread(ESC.x2) - 14, '梯级主轮工作导轨', { anchor: 'end', size: 11.5, fill: '#b45309' }));
  p.push(S.txt(672, ESC.tread(ESC.x3) + 22, '辅轮返回导轨', { anchor: 'end', size: 11.5, fill: '#b45309' }));
  // 中间支撑
  p.push(S.ln(380, ESC.lo(380), 380, 470, { stroke: '#78716c', w: 5 }));
  p.push(S.ln(350, 470, 410, 470, { stroke: '#78716c', w: 5 }));
  p.push(S.txt(380, 492, '中间支撑（提升高度 > 6 m 时设置，间距 6~8 m）', { size: 11.5, fill: '#57534e' }));
  // 桁架说明
  p.push(S.txt(60, 522, '桁架（弦杆 + 腹杆）承受梯级、乘客与扶手系统的全部载荷，挠度须控制在跨度 1/750 以内。', { size: 11.5, fill: '#334155' }));
  return svgWrap(800, 540, p.join(''));
}

/* 下部张紧段（张紧站） */
function scLowerTension() {
  const p = escFrame({ showWeb: false, showSteps: true, showHandrail: true });
  p.push(S.txt(40, 34, '下部张紧段（张紧站）', { anchor: 'start', size: 16, fill: '#5b21b6' }));
  p.push(S.txt(40, 54, 'Lower Tension Station', { anchor: 'start', size: 11, fill: '#64748b', weight: 500 }));
  p.push(S.rc(40, 330, 230, 180, { fill: 'none', stroke: '#7c3aed', sw: 2.4, dash: '8 6', rx: 8 }));
  p.push(S.txt(155, 352, '下部张紧段区域', { size: 12.5, fill: '#6d28d9' }));
  // 张紧小车
  p.push(S.rc(78, 396, 108, 52, { fill: '#ede9fe', stroke: '#7c3aed', sw: 2.2 }));
  p.push(S.txt(132, 418, '张紧小车', { size: 11.5, fill: '#5b21b6' }));
  p.push(S.txt(132, 436, '可沿导轨滑动', { size: 11, fill: '#6d28d9', weight: 500 }));
  // 弹簧
  for (let i = 0; i < 6; i++) p.push(S.path(`M${150 + i * 9} 424 l9 -7 l-9 14 l9 -7`, { stroke: '#7c3aed', w: 2 }));
  p.push(S.txt(226, 428, '张紧弹簧', { anchor: 'start', size: 11, fill: '#5b21b6' }));
  // 下部转向链轮
  p.push(S.ci(120, 396, 22, { fill: '#e0e7ff', stroke: '#1d4ed8', sw: 2.4 }));
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; p.push(S.ln(120 + 10 * Math.cos(a), 396 + 10 * Math.sin(a), 120 + 20 * Math.cos(a), 396 + 20 * Math.sin(a), { stroke: '#60a5fa', w: 2 })); }
  p.push(S.txt(96, 372, '下部转向链轮', { size: 11, fill: '#1d4ed8' }));
  // 张紧行程
  p.push(S.ar(200, 422, 246, 422, { stroke: '#7c3aed', w: 2, head: 8 }));
  p.push(S.txt(250, 410, '张紧行程', { anchor: 'start', size: 11, fill: '#5b21b6' }));
  p.push(S.txt(250, 428, '≥ 链条最大伸长量', { anchor: 'start', size: 11, fill: '#6d28d9', weight: 500 }));
  // 梳齿板
  p.push(S.pg([[152, 400], [200, 400], [200, 392], [152, 388]], { fill: '#f59e0b', stroke: '#b45309', sw: 1.6 }));
  p.push(S.txt(176, 380, '梳齿板', { size: 11, fill: '#b45309' }));
  p.push(S.txt(176, 460, '梳齿板保护开关', { size: 11, fill: '#dc2626' }));
  p.push(S.ln(176, 414, 176, 448, { stroke: '#dc2626', w: 1.6, dash: '4 3' }));
  // 断链保护
  p.push(S.rc(40, 330, 0, 0, { fill: '#fff', stroke: '#fff', sw: 0 }));
  p.push(S.rc(300, 396, 120, 34, { fill: '#fee2e2', stroke: '#dc2626', sw: 1.8 }));
  p.push(S.txt(360, 418, '断链/松弛保护开关', { size: 11, fill: '#b91c1c' }));
  // 说明
  p.push(S.txt(60, 500, '张紧装置补偿梯级链的弹性伸长与磨损伸长，使链条保持恒定张力，防止跳齿、脱链。', { size: 11.5, fill: '#334155' }));
  p.push(S.txt(60, 522, '链条断裂或过度松弛时，断链保护开关动作，扶梯立即抱闸停机。', { size: 11.5, fill: '#64748b', weight: 500 }));
  return svgWrap(800, 540, p.join(''));
}

/* 梯级循环区（梯路循环） */
function scStepCirculation() {
  const p = [];
  const T = x => ESC.tread(x), U = x => ESC.up(x), L = x => ESC.lo(x);
  p.push(S.txt(40, 34, '梯级循环区（工作梯路 + 返回梯路）', { anchor: 'start', size: 16, fill: '#047857' }));
  p.push(S.txt(40, 54, 'Step Circulation Zone', { anchor: 'start', size: 11, fill: '#64748b', weight: 500 }));
  // 工作梯路（主轮）
  p.push(S.path(`M${ESC.x0} ${T(ESC.x0)} L${ESC.x1} ${T(ESC.x1)} L${ESC.x2} ${T(ESC.x2)} L${ESC.x3} ${T(ESC.x3)}`, { stroke: '#f59e0b', w: 3 }));
  // 返回梯路（辅轮）位于桁架下部
  p.push(S.path(`M${ESC.x0} ${U(ESC.x0) + 44} L${ESC.x1} ${U(ESC.x1) + 44} L${ESC.x2} ${U(ESC.x2) + 44} L${ESC.x3} ${U(ESC.x3) + 44}`, { stroke: '#0891b2', w: 3 }));
  // 端部折返曲线
  p.push(S.path(`M${ESC.x3} ${T(ESC.x3)} C ${ESC.x3 + 40} ${T(ESC.x3)} ${ESC.x3 + 40} ${U(ESC.x3) + 44} ${ESC.x3} ${U(ESC.x3) + 44}`, { stroke: '#94a3b8', w: 2.4, dash: '7 5' }));
  p.push(S.path(`M${ESC.x0} ${U(ESC.x0) + 44} C ${ESC.x0 - 40} ${U(ESC.x0) + 44} ${ESC.x0 - 40} ${T(ESC.x0)} ${ESC.x0} ${T(ESC.x0)}`, { stroke: '#94a3b8', w: 2.4, dash: '7 5' }));
  // 梯级（工作段）与返回段
  for (let i = 0; i < 8; i++) {
    const x = 104 + i * 62; const y = T(x);
    p.push(S.pg([[x, y - 20], [x + 30, y - 20], [x + 30, y - 4], [x, y]], { fill: '#fcd34d', stroke: '#b45309', sw: 1.4 }));
  }
  for (let i = 0; i < 6; i++) {
    const x = 250 + i * 62; const y = U(x) + 44;
    p.push(S.pg([[x, y - 16], [x + 28, y - 16], [x + 28, y - 2], [x, y]], { fill: '#bfdbfe', stroke: '#1d4ed8', sw: 1.2, opacity: 0.85 }));
  }
  // 桁架外框
  p.push(S.pg(`${ESC.x0},${U(ESC.x0)} ${ESC.x1},${U(ESC.x1)} ${ESC.x2},${U(ESC.x2)} ${ESC.x3},${U(ESC.x3)} ${ESC.x3},${L(ESC.x3)} ${ESC.x2},${L(ESC.x2)} ${ESC.x1},${L(ESC.x1)} ${ESC.x0},${L(ESC.x0)}`, { fill: 'none', stroke: '#64748b', sw: 2.2 }));
  p.push(S.rc(0, ESC.yb, 210, 16, { fill: '#d6d3d1', stroke: '#78716c', sw: 1.6, rx: 2 }));
  p.push(S.rc(556, ESC.yt, 244, 16, { fill: '#d6d3d1', stroke: '#78716c', sw: 1.6, rx: 2 }));
  // 方向箭头
  p.push(S.ar(300, 320, 360, 285, { stroke: '#f59e0b', w: 3, head: 11 }));
  p.push(S.txt(268, 306, '工作梯路（承载乘客）', { anchor: 'end', size: 11.5, fill: '#b45309' }));
  p.push(S.ar(360, 356, 300, 391, { stroke: '#0891b2', w: 3, head: 11 }));
  p.push(S.txt(372, 366, '返回梯路（空载折返）', { anchor: 'start', size: 11.5, fill: '#0e7490' }));
  // 上下端折返
  p.push(S.txt(700, 236, '上端折返 180°', { anchor: 'end', size: 11.5, fill: '#475569' }));
  p.push(S.txt(30, 468, '下端折返 180°', { anchor: 'start', size: 11.5, fill: '#475569' }));
  p.push(S.txt(60, 522, '梯级由梯级链牵引，沿工作梯路承载乘客运行，经端部转向后沿返回梯路折返，形成闭合循环。', { size: 11.5, fill: '#334155' }));
  return svgWrap(800, 540, p.join(''));
}

/* ======================= 八大系统原理图 ======================= */

/* 1 桁架结构系统 —— 载荷传递与挠度 */
function scTruss() {
  const p = [];
  p.push(S.txt(400, 34, '桁架载荷传递与挠度', { size: 14, fill: '#334155' }));
  // 简支梁模型
  p.push(S.ln(120, 150, 680, 150, { stroke: '#475569', w: 7 }));
  p.push(S.pg([[104, 176], [136, 176], [120, 150]], { fill: '#94a3b8', stroke: '#475569', sw: 1.6 }));
  p.push(S.pg([[664, 176], [696, 176], [680, 150]], { fill: '#94a3b8', stroke: '#475569', sw: 1.6 }));
  p.push(S.txt(112, 194, '支承', { size: 11, fill: '#475569' }));
  p.push(S.txt(688, 194, '支承', { size: 11, fill: '#475569' }));
  p.push(S.dimH(120, 680, 116, '计算跨度 L'));
  // 分布载荷
  for (let i = 0; i < 12; i++) p.push(S.ar(150 + i * 45, 108, 150 + i * 45, 144, { stroke: '#dc2626', w: 2, head: 7 }));
  p.push(S.txt(400, 100, '乘客 + 梯级 + 扶手系统载荷（均布）', { size: 12, fill: '#b91c1c' }));
  // 挠度曲线
  p.push(S.path('M120 150 Q 400 214 680 150', { stroke: '#0891b2', w: 2.6, dash: '7 5' }));
  p.push(S.ln(400, 150, 400, 182, { stroke: '#0891b2', w: 2 }));
  p.push(S.txt(400, 206, 'f_max ≤ L / 750', { size: 12.5, fill: '#0e7490' }));
  // 弦杆/腹杆示教
  p.push(S.rc(60, 240, 320, 230, { fill: '#f8fafc', stroke: '#cbd5e1', rx: 10 }));
  p.push(S.txt(220, 266, '弦杆 + 腹杆 受力示意', { size: 12.5, fill: '#334155' }));
  p.push(S.ln(100, 300, 340, 300, { stroke: '#1d4ed8', w: 4 }));
  p.push(S.txt(220, 294, '上弦杆（受压）', { size: 11, fill: '#1d4ed8' }));
  p.push(S.ln(100, 440, 340, 440, { stroke: '#b45309', w: 4 }));
  p.push(S.txt(220, 458, '下弦杆（受拉）', { size: 11, fill: '#b45309' }));
  for (let i = 0; i < 6; i++) {
    p.push(S.ln(100 + i * 48, 300, 148 + i * 48, 440, { stroke: '#64748b', w: 2 }));
    p.push(S.ln(148 + i * 48, 300, 148 + i * 48, 440, { stroke: '#64748b', w: 2 }));
  }
  p.push(S.txt(220, 404, '腹杆（传递剪力）', { size: 11, fill: '#475569' }));
  // 右侧要点
  p.push(S.rc(410, 240, 330, 230, { fill: '#ecfdf5', stroke: '#059669', rx: 10 }));
  p.push(S.txt(575, 268, '结构要点', { size: 12.5, fill: '#065f46' }));
  ['整体式焊接桁架刚性好、安装快', '倾角常用 30°，不超过 35°', '提升高度 > 6 m 设中间支撑（6~8 m 一道）', '导轨安装基准面平面度须严格保证', '防腐处理避免锈蚀削弱承载能力'].forEach((s, i) => {
    p.push(S.txt(430, 300 + i * 32, '· ' + s, { anchor: 'start', size: 11.5, fill: '#047857', weight: 500 }));
  });
  p.push(S.txt(400, 502, '乘客与梯级载荷经导轨传至桁架弦杆，再由腹杆以轴力形式传递，最终传至建筑物基础。', { size: 11.5, fill: '#334155' }));
  return svgWrap(800, 520, p.join(''));
}

/* 2 主驱动系统 —— 全传动链（重点：主轴同轴联动梯级链与扶手带） */
function scDrive() {
  const p = [];
  p.push(S.txt(400, 30, '主驱动全传动链：电机 → 联轴/制动 → 减速箱 → 传动链 → 主轴（同轴联动）', { size: 14, fill: '#1e3a8a' }));
  const bx = (x, y, w, h, label, sub, c) => S.rc(x, y, w, h, { fill: c.bg, stroke: c.st, sw: 2 }) +
    S.txt(x + w / 2, y + h / 2 + (sub ? -4 : 5), label, { size: 12.5, fill: c.tx }) +
    (sub ? S.txt(x + w / 2, y + h / 2 + 15, sub, { size: 10.5, fill: c.tx, weight: 500 }) : '');
  const C1 = { bg: '#dbeafe', st: '#1d4ed8', tx: '#1e3a8a' };
  const C2 = { bg: '#ffedd5', st: '#ea580c', tx: '#9a3412' };
  const C3 = { bg: '#ede9fe', st: '#7c3aed', tx: '#5b21b6' };
  const C4 = { bg: '#dcfce7', st: '#059669', tx: '#065f46' };
  const CR = { bg: '#fee2e2', st: '#dc2626', tx: '#b91c1c' };
  p.push(bx(24, 84, 136, 64, '驱动电动机', '三相异步 / 永磁', C1));
  p.push(bx(192, 84, 136, 64, '联轴器', '+ 工作制动器', CR));
  p.push(bx(360, 84, 136, 64, '蜗轮减速箱', '降速增矩 i=20~32', C2));
  p.push(S.ar(160, 116, 192, 116, { stroke: '#1d4ed8' }));
  p.push(S.ar(328, 116, 360, 116, { stroke: '#ea580c' }));
  // 传动链 → 主驱动轴
  p.push(S.ci(560, 96, 11, { fill: '#fff', stroke: '#a16207', sw: 2 }));
  p.push(S.ci(620, 116, 13, { fill: '#fff', stroke: '#a16207', sw: 2 }));
  p.push(S.ln(568, 100, 612, 112, { stroke: '#a8a29e', w: 2.4, dash: '6 4' }));
  p.push(S.ln(568, 92, 612, 120, { stroke: '#a8a29e', w: 2.4, dash: '6 4' }));
  p.push(S.ar(496, 116, 549, 100, { stroke: '#ea580c' }));
  p.push(S.txt(532, 66, '传动链', { size: 11, fill: '#57534e' }));
  p.push(S.rc(620, 96, 156, 40, { fill: '#ede9fe', stroke: '#7c3aed', sw: 2.4, rx: 8 }));
  p.push(S.txt(698, 113, '主驱动轴（同轴布置）', { size: 11.5, fill: '#5b21b6' }));
  p.push(S.txt(698, 129, '同时驱动梯级与扶手带', { size: 10, fill: '#6d28d9', weight: 500 }));
  // 同轴两路输出
  p.push(S.ar(640, 136, 640, 178, { stroke: '#7c3aed', w: 2.2 }));
  p.push(S.txt(634, 162, '同轴', { anchor: 'end', size: 10.5, fill: '#6d28d9' }));
  p.push(S.ar(756, 136, 756, 178, { stroke: '#7c3aed', w: 2.2 }));
  p.push(S.txt(764, 162, '经同步链', { anchor: 'start', size: 10.5, fill: '#6d28d9' }));
  p.push(bx(566, 178, 200, 56, '梯级驱动链轮', '牵引梯级链循环（间距 400 mm）', C1));
  p.push(bx(566, 252, 200, 56, '扶手带摩擦驱动轮', '压紧轮加压 · 超前 0~+2%', C4));
  p.push(S.chain(566, 322, 766, 322, '#78716c'));
  p.push(S.txt(666, 340, '梯级链（闭合循环 · 经下部张紧）', { size: 11, fill: '#57534e' }));
  // 附加制动器
  p.push(bx(300, 178, 196, 56, '附加制动器', '提升高度 > 6 m 必设 · 直接作用于主轴', CR));
  p.push(S.ar(496, 206, 566, 206, { stroke: '#dc2626', w: 2, head: 7, dash: '5 4' }));
  // 公式与要点
  p.push(S.rc(24, 356, 352, 104, { fill: '#0f172a', stroke: '#0f172a', rx: 10 }));
  p.push(S.txt(200, 388, 'v = π·D·n / (60·i)', { size: 16, fill: '#7dd3fc' }));
  p.push(S.txt(200, 412, 'D 链轮节圆直径　n 电机转速　i 减速比', { size: 10.5, fill: '#a5f3fc', weight: 500 }));
  p.push(S.txt(200, 436, '制动器失电抱闸 · 制动力矩 ≥ 1.5 倍额定', { size: 10.5, fill: '#bae6fd', weight: 500 }));
  p.push(S.rc(410, 356, 366, 104, { fill: '#fff7ed', stroke: '#ea580c', rx: 10 }));
  p.push(S.txt(593, 382, '联动关系（教学重点）', { size: 12.5, fill: '#c2410c' }));
  p.push(S.txt(428, 408, '· 主轴同轴：梯级链轮 + 扶手带驱动轮同步转动', { anchor: 'start', size: 10.5, fill: '#9a3412', weight: 500 }));
  p.push(S.txt(428, 430, '· 扶手带速度由同步链与摩擦轮直径比确定', { anchor: 'start', size: 10.5, fill: '#9a3412', weight: 500 }));
  p.push(S.txt(428, 452, '· 立式结构紧凑 / 卧式便于维护检修', { anchor: 'start', size: 10.5, fill: '#9a3412', weight: 500 }));
  p.push(S.txt(400, 496, '动力经全传动链汇聚于主驱动轴，再同轴分配给梯级链与扶手带，实现同步联动运行。', { size: 11.5, fill: '#334155' }));
  return svgWrap(800, 516, p.join(''));
}

/* 3 梯路系统 —— 主轮/辅轮导轨与高度差 */
function scRail() {
  const p = [];
  p.push(S.txt(400, 34, '梯路：主轮沿工作导轨、辅轮沿返回导轨', { size: 14, fill: '#1d4ed8' }));
  // 局部放大：梯级姿态
  p.push(S.rc(30, 60, 330, 210, { fill: '#f8fafc', stroke: '#cbd5e1', rx: 10 }));
  p.push(S.txt(195, 86, '倾斜段：梯级呈“台阶”状', { size: 12, fill: '#334155' }));
  p.push(S.ln(60, 150, 330, 150, { stroke: '#f59e0b', w: 3 }));      // 工作导轨
  p.push(S.txt(330, 142, '工作导轨（主轮）', { anchor: 'end', size: 11, fill: '#b45309' }));
  p.push(S.ln(60, 240, 330, 240, { stroke: '#0891b2', w: 3 }));      // 返回导轨
  p.push(S.txt(330, 262, '返回导轨（辅轮）', { anchor: 'end', size: 11, fill: '#0e7490' }));
  p.push(S.dimV(150, 240, 96, '高度差 Δh'));
  [0, 1, 2].forEach(i => {
    const x = 90 + i * 80;
    p.push(S.ci(x + 18, 150, 10, { fill: '#fcd34d', stroke: '#b45309', sw: 1.8 }));
    p.push(S.ci(x + 18, 240, 10, { fill: '#bfdbfe', stroke: '#1d4ed8', sw: 1.8 }));
    p.push(S.pg([[x, 150 - 10], [x + 56, 150 - 10], [x + 56, 150], [x, 150]], { fill: '#fde68a', stroke: '#b45309', sw: 1.4 }));
    p.push(S.ln(x + 56, 150, x + 56, 240, { stroke: '#94a3b8', w: 1.6, dash: '5 4' }));
  });
  // 右：端部转向
  p.push(S.rc(400, 60, 370, 210, { fill: '#f8fafc', stroke: '#cbd5e1', rx: 10 }));
  p.push(S.txt(585, 86, '水平段：高度差被消除 → 平层', { size: 12, fill: '#334155' }));
  p.push(S.path('M430 190 L560 190 Q 600 190 630 172 L740 172', { stroke: '#f59e0b', w: 3 }));   // 工作导轨转向
  p.push(S.path('M430 230 L560 230 Q 600 230 630 212 L740 212', { stroke: '#0891b2', w: 3 }));   // 返回导轨转向
  p.push(S.txt(700, 160, '工作导轨', { size: 11, fill: '#b45309' }));
  p.push(S.txt(700, 234, '返回导轨', { size: 11, fill: '#0e7490' }));
  p.push(S.ci(452, 190, 10, { fill: '#fcd34d', stroke: '#b45309', sw: 1.8 }));
  p.push(S.ci(452, 230, 10, { fill: '#bfdbfe', stroke: '#1d4ed8', sw: 1.8 }));
  p.push(S.pg([[434, 180], [490, 180], [490, 190], [434, 190]], { fill: '#fde68a', stroke: '#b45309', sw: 1.4 }));
  p.push(S.pg([[506, 180], [562, 180], [562, 190], [506, 190]], { fill: '#fde68a', stroke: '#b45309', sw: 1.4 }));
  p.push(S.txt(585, 252, '端部转向导轨（圆弧 + 渐开线过渡曲线）', { size: 11, fill: '#475569' }));
  // 参数
  p.push(S.rc(30, 300, 360, 170, { fill: '#eff6ff', stroke: '#3b82f6', rx: 10 }));
  p.push(S.txt(210, 328, '梯路参数', { size: 12.5, fill: '#1d4ed8' }));
  ['导轨材质：优质碳素钢冷弯成型', '表面硬度：HB220 ~ 260', '直线度：≤ 0.5 mm/m', '倾角 30° 时，每级提升高度 400×tan30° ≈ 231 mm'].forEach((s, i) => {
    p.push(S.txt(50, 358 + i * 30, '· ' + s, { anchor: 'start', size: 11.5, fill: '#1e40af', weight: 500 }));
  });
  p.push(S.rc(420, 300, 350, 170, { fill: '#ecfdf5', stroke: '#059669', rx: 10 }));
  p.push(S.txt(595, 328, '梯路功能', { size: 12.5, fill: '#065f46' }));
  ['工作导轨承载主轮并承受乘客载荷', '返回导轨承载辅轮，保证返回段水平', '端部转向实现倾斜 ↔ 水平的平滑过渡', '导轨间距与平行度决定梯级是否跑偏'].forEach((s, i) => {
    p.push(S.txt(440, 358 + i * 30, '· ' + s, { anchor: 'start', size: 11.5, fill: '#047857', weight: 500 }));
  });
  p.push(S.txt(400, 500, '梯级主轮与辅轮的高度差形成台阶；进入端部水平段后被导轨消除，梯级呈平层状并与梳齿板平齐。', { size: 11.5, fill: '#334155' }));
  return svgWrap(800, 520, p.join(''));
}

/* 4 梯级系统 —— 结构与尺寸 */
function scStep() {
  const p = [];
  p.push(S.txt(400, 34, '梯级构造与主辅轮', { size: 14, fill: '#b45309' }));
  // 梯级立体示意（侧立面）
  p.push(S.pg([[120, 180], [400, 180], [400, 120], [120, 120]], { fill: '#fde68a', stroke: '#b45309', sw: 2.4 }));  // 踏板
  p.push(S.pg([[400, 120], [400, 180], [470, 180], [470, 120]], { fill: '#fcd34d', stroke: '#b45309', sw: 2 }));
  p.push(S.txt(260, 156, '梯级踏板（带防滑齿槽）', { size: 12.5, fill: '#92400e' }));
  p.push(S.dimH(120, 400, 102, '踏板深度 ≈ 400 mm'));
  // 踢板
  p.push(S.pg([[120, 180], [120, 120], [90, 120], [90, 180]], { fill: '#fbbf24', stroke: '#b45309', sw: 2 }));
  p.push(S.txt(72, 200, '踢板 h≈200 mm', { anchor: 'start', size: 11, fill: '#92400e' }));
  // 主辅轮
  p.push(S.ci(150, 200, 16, { fill: '#fcd34d', stroke: '#b45309', sw: 2.2 }));
  p.push(S.ci(380, 200, 16, { fill: '#fcd34d', stroke: '#b45309', sw: 2.2 }));
  p.push(S.txt(150, 236, '主轮（2 个）', { size: 11.5, fill: '#b45309' }));
  p.push(S.txt(380, 236, '梯级轴 / 链连接', { size: 11.5, fill: '#57534e' }));
  p.push(S.ci(380, 330, 14, { fill: '#bfdbfe', stroke: '#1d4ed8', sw: 2.2 }));
  p.push(S.txt(380, 362, '辅轮（2 个）', { size: 11.5, fill: '#1d4ed8' }));
  p.push(S.ln(380, 216, 380, 316, { stroke: '#94a3b8', w: 2 }));
  // 梯级间距
  p.push(S.pg([[520, 200], [520, 180], [552, 180], [552, 200]], { fill: '#fde68a', stroke: '#b45309', sw: 1.6 }));
  p.push(S.dimH(150, 536, 268, '梯级间距 400 mm'));
  p.push(S.txt(536, 200, '相邻梯级', { anchor: 'start', size: 11, fill: '#92400e' }));
  // 规格
  p.push(S.rc(30, 288, 300, 190, { fill: '#fffbeb', stroke: '#f59e0b', rx: 10 }));
  p.push(S.txt(180, 314, '梯级规格', { size: 12.5, fill: '#b45309' }));
  ['踏板宽度：600 / 800 / 1000 mm', '踏板深度：约 400 mm', '踢板高度：约 200 mm', '材质：不锈钢 / 压铸铝', '滚轮：聚氨酯或橡胶包覆 + 轴承'].forEach((s, i) => {
    p.push(S.txt(50, 344 + i * 26, '· ' + s, { anchor: 'start', size: 11, fill: '#92400e', weight: 500 }));
  });
  // 安全要点
  p.push(S.rc(420, 288, 350, 190, { fill: '#fef2f2', stroke: '#dc2626', rx: 10 }));
  p.push(S.txt(595, 314, '安全要点', { size: 12.5, fill: '#b91c1c' }));
  ['踏板齿槽须与梳齿板啮合，防止夹入异物', '必须设置防偏载（左右载荷差）检测', '必须设置防沉降措施，防止梯级塌陷', '梯级缺失检测装置动作后应立即停机', '滚轮磨损后须成套更换，保证运行平稳'].forEach((s, i) => {
    p.push(S.txt(440, 344 + i * 30, '· ' + s, { anchor: 'start', size: 11, fill: '#b91c1c', weight: 500 }));
  });
  return svgWrap(800, 500, p.join(''));
}

/* 5 扶手带系统 —— 回路与同步 */
function scHandrail() {
  const p = [];
  p.push(S.txt(400, 34, '扶手带：闭合回路与同步传动', { size: 14, fill: '#0f766e' }));
  // 扶手带闭合回路（长圆）
  p.push(S.rc(70, 90, 520, 150, { fill: 'none', stroke: '#334155', sw: 10, rx: 75 }));
  p.push(S.rc(80, 100, 500, 130, { fill: '#f1f5f9', stroke: '#94a3b8', sw: 2, rx: 65 }));
  p.push(S.txt(330, 150, '扶手带（橡胶 + 钢丝帘布骨架）', { size: 12.5, fill: '#334155' }));
  p.push(S.txt(330, 178, '内表面为摩擦传动面', { size: 11, fill: '#64748b', weight: 500 }));
  // 驱动轮
  p.push(S.ci(330, 300, 40, { fill: '#dcfce7', stroke: '#059669', sw: 2.6 }));
  p.push(S.ci(330, 300, 8, { fill: '#059669', stroke: '#059669' }));
  p.push(S.txt(330, 356, '扶手带驱动轮（摩擦传动）', { size: 11.5, fill: '#047857' }));
  p.push(S.ar(330, 262, 330, 232, { stroke: '#059669', w: 2.4, head: 9 }));
  p.push(S.ar(330, 338, 330, 368, { stroke: '#059669', w: 2.4, head: 9 }));
  // 压紧轮
  p.push(S.ci(400, 300, 22, { fill: '#e0f2fe', stroke: '#0e7490', sw: 2.2 }));
  p.push(S.txt(452, 306, '压紧轮', { anchor: 'start', size: 11, fill: '#0e7490' }));
  p.push(S.ar(378, 300, 360, 300, { stroke: '#0e7490', w: 2, head: 7 }));
  // 张紧轮
  p.push(S.ci(180, 300, 26, { fill: '#ede9fe', stroke: '#7c3aed', sw: 2.2 }));
  p.push(S.txt(136, 306, '张紧轮', { anchor: 'end', size: 11, fill: '#5b21b6' }));
  p.push(S.ar(206, 300, 226, 300, { stroke: '#7c3aed', w: 2, head: 7 }));
  // 右侧：同步关系
  p.push(S.rc(620, 90, 160, 150, { fill: '#ecfdf5', stroke: '#059669', rx: 10 }));
  p.push(S.txt(700, 118, '速度同步', { size: 12.5, fill: '#065f46' }));
  p.push(S.txt(700, 148, 'v 扶手 ≥ v 梯级', { size: 12, fill: '#047857' }));
  p.push(S.txt(700, 174, '偏差 0 ~ +2%', { size: 12, fill: '#047857' }));
  p.push(S.txt(700, 202, '略快 → 手臂轻微前拉', { size: 11, fill: '#047857', weight: 500 }));
  p.push(S.txt(700, 222, '身体保持稳定', { size: 11, fill: '#047857', weight: 500 }));
  // 公式条
  p.push(S.rc(70, 372, 710, 46, { fill: '#0f172a', stroke: '#0f172a', rx: 10 }));
  p.push(S.txt(425, 402, '0 ≤ ( v_扶手 − v_梯级 ) / v_梯级 ≤ 2%　　（扶手带应与梯级同步并略微超前）', { size: 13.5, fill: '#7dd3fc' }));
  // 部件
  p.push(S.rc(70, 436, 350, 96, { fill: '#f0fdfa', stroke: '#0f766e', rx: 10 }));
  p.push(S.txt(245, 460, '组成部件', { size: 12, fill: '#0f766e' }));
  p.push(S.txt(86, 486, '扶手带 · 驱动轮 · 压紧轮 · 导向轮 · 张紧轮 · 护壁板 · 入口保护', { anchor: 'start', size: 11, fill: '#115e59', weight: 500 }));
  p.push(S.txt(86, 512, '护壁板高度 ≥ 1.0 m；入口处必须设扶手带入口保护开关', { anchor: 'start', size: 11, fill: '#b91c1c', weight: 500 }));
  p.push(S.rc(440, 436, 340, 96, { fill: '#fff7ed', stroke: '#ea580c', rx: 10 }));
  p.push(S.txt(610, 460, '维护要点', { size: 12, fill: '#c2410c' }));
  p.push(S.txt(456, 486, '保持摩擦面清洁，防止打滑；定期检查压紧力与张紧力', { anchor: 'start', size: 11, fill: '#9a3412', weight: 500 }));
  p.push(S.txt(456, 512, '室外扶梯可配置扶手带加热装置，防止低温变硬打滑', { anchor: 'start', size: 11, fill: '#9a3412', weight: 500 }));
  return svgWrap(800, 546, p.join(''));
}

/* 6 张紧与转向系统 */
function scTension() {
  const p = [];
  p.push(S.txt(400, 34, '张紧装置与端部转向', { size: 14, fill: '#5b21b6' }));
  // 左：张紧小车
  p.push(S.rc(40, 70, 360, 220, { fill: '#f8fafc', stroke: '#cbd5e1', rx: 10 }));
  p.push(S.txt(220, 96, '张紧小车（可沿导轨滑移）', { size: 12.5, fill: '#5b21b6' }));
  p.push(S.ln(70, 250, 380, 250, { stroke: '#94a3b8', w: 6 }));   // 滑动导轨
  p.push(S.rc(90, 190, 140, 58, { fill: '#ede9fe', stroke: '#7c3aed', sw: 2.2 }));
  p.push(S.txt(160, 216, '张紧小车', { size: 11.5, fill: '#5b21b6' }));
  p.push(S.txt(160, 236, '+ 下部转向链轮', { size: 11, fill: '#6d28d9', weight: 500 }));
  p.push(S.ci(120, 190, 20, { fill: '#e0e7ff', stroke: '#1d4ed8', sw: 2.2 }));
  // 弹簧
  for (let i = 0; i < 7; i++) p.push(S.path(`M${240 + i * 11} 219 l11 -8 l-11 16 l11 -8`, { stroke: '#7c3aed', w: 2.2 }));
  p.push(S.txt(336, 222, '弹簧', { anchor: 'start', size: 11, fill: '#5b21b6' }));
  p.push(S.rc(330, 190, 56, 58, { fill: '#e5e7eb', stroke: '#4b5563', sw: 2 }));
  p.push(S.txt(358, 226, '固定座', { size: 11, fill: '#374151' }));
  // 行程
  p.push(S.ar(90, 272, 158, 272, { stroke: '#7c3aed', w: 2.4, head: 9 }));
  p.push(S.txt(124, 292, '张紧行程 x', { size: 11.5, fill: '#5b21b6' }));
  // 张力公式
  p.push(S.rc(40, 306, 360, 66, { fill: '#0f172a', stroke: '#0f172a', rx: 10 }));
  p.push(S.txt(220, 336, 'T = k · x', { size: 17, fill: '#c4b5fd' }));
  p.push(S.txt(220, 358, 'k 弹簧刚度　x 压缩量　张力恒定、自动补偿伸长', { size: 11, fill: '#ddd6fe', weight: 500 }));
  // 右：三种张紧形式
  p.push(S.rc(420, 70, 350, 302, { fill: '#f5f3ff', stroke: '#7c3aed', rx: 10 }));
  p.push(S.txt(595, 96, '三种张紧形式', { size: 12.5, fill: '#5b21b6' }));
  [['弹簧式张紧', '结构简单、成本低；补偿行程有限', '适用于提升高度较小的扶梯'],
  ['重锤式张紧', '行程大、张力恒定', '适用于提升高度大、链条较长的场合'],
  ['液压式张紧', '张紧力大、行程可调', '适用于大型与重载扶梯']].forEach((r, i) => {
    p.push(S.rc(440, 116 + i * 86, 310, 74, { fill: '#fff', stroke: '#c4b5fd', rx: 8 }));
    p.push(S.txt(456, 142 + i * 86, r[0], { anchor: 'start', size: 12, fill: '#5b21b6' }));
    p.push(S.txt(456, 164 + i * 86, r[1], { anchor: 'start', size: 11, fill: '#6d28d9', weight: 500 }));
    p.push(S.txt(456, 182 + i * 86, r[2], { anchor: 'start', size: 11, fill: '#7c3aed', weight: 500 }));
  });
  // 底部：转向
  p.push(S.rc(40, 386, 730, 132, { fill: '#eef2ff', stroke: '#6366f1', rx: 10 }));
  p.push(S.txt(405, 412, '端部转向：引导梯级完成 180° 折返', { size: 12.5, fill: '#3730a3' }));
  p.push(S.ci(180, 470, 26, { fill: '#e0e7ff', stroke: '#1d4ed8', sw: 2.4 }));
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; p.push(S.ln(180 + 12 * Math.cos(a), 470 + 12 * Math.sin(a), 180 + 24 * Math.cos(a), 470 + 24 * Math.sin(a), { stroke: '#60a5fa', w: 2 })); }
  p.push(S.txt(180, 512, '转向链轮', { size: 11, fill: '#1d4ed8' }));
  p.push(S.path('M230 470 L300 470 Q 350 470 380 440', { stroke: '#f59e0b', w: 3 }));
  p.push(S.path('M230 492 L300 492 Q 350 492 380 522', { stroke: '#0891b2', w: 3 }));
  p.push(S.txt(400, 440, '工作梯路', { anchor: 'start', size: 11.5, fill: '#b45309' }));
  p.push(S.txt(400, 522, '返回梯路', { anchor: 'start', size: 11.5, fill: '#0e7490' }));
  p.push(S.txt(560, 452, '断链 / 松弛保护开关：动作后立即停机抱闸', { anchor: 'start', size: 11.5, fill: '#b91c1c' }));
  p.push(S.txt(560, 480, '张紧行程不足会导致链条松弛、跳齿甚至脱链', { anchor: 'start', size: 11.5, fill: '#64748b', weight: 500 }));
  return svgWrap(800, 540, p.join(''));
}

/* 7 电气控制系统（GB16899 安全回路串联 + VVVF 运行控制） */
function scControl() {
  const p = [];
  p.push(S.txt(400, 30, '电气控制系统：运行控制（VVVF）+ 安全回路串联（GB 16899）', { size: 14, fill: '#4338ca' }));
  /* ---- 上：运行控制流 ---- */
  const bx = (x, y, w, h, label, sub, c) => S.rc(x, y, w, h, { fill: c.bg, stroke: c.st, sw: 2 }) +
    S.txt(x + w / 2, y + h / 2 + (sub ? -4 : 5), label, { size: 12, fill: c.tx }) +
    (sub ? S.txt(x + w / 2, y + h / 2 + 14, sub, { size: 10, fill: c.tx, weight: 500 }) : '');
  const CI = { bg: '#eef2ff', st: '#6366f1', tx: '#3730a3' };
  const CP = { bg: '#312e81', st: '#312e81', tx: '#ffffff' };
  const CV = { bg: '#ffedd5', st: '#ea580c', tx: '#9a3412' };
  const CO = { bg: '#ecfdf5', st: '#10b981', tx: '#065f46' };
  p.push(bx(24, 52, 160, 56, '信号采集', '出入口感应 / 检修盒 / 钥匙', CI));
  p.push(bx(224, 52, 180, 56, '主控板 PLC / 微机', '启停 · 方向 · 逻辑互锁', CP));
  p.push(bx(444, 52, 160, 56, '变频器 VVVF', 'S 形曲线 · a ≤ 0.3 m/s²', CV));
  p.push(bx(644, 52, 132, 56, '驱动电动机', '运行 / 照明 / 指示', CO));
  p.push(S.ar(184, 80, 224, 80, { stroke: '#6366f1' }));
  p.push(S.ar(404, 80, 444, 80, { stroke: '#6366f1' }));
  p.push(S.ar(604, 80, 644, 80, { stroke: '#10b981' }));
  p.push(S.txt(400, 126, '自动运行：无人待机减速节能 · 检修运行：点动 ≤ 0.3 m/s（检修开关动作后自动运行失效）', { size: 10.5, fill: '#64748b', weight: 500 }));
  /* ---- 中下：GB16899 安全回路串联 ---- */
  p.push(S.txt(46, 168, '安全回路（串联触点，任一断开 → K 失电 → 抱闸）', { anchor: 'start', size: 12.5, fill: '#b91c1c' }));
  // 主母线
  const Y = 208;
  p.push(S.rc(24, 150, 752, 232, { fill: '#fef2f2', stroke: '#fecaca', sw: 1.6, rx: 10 }));
  // 触点符号（串联）
  const contact = (x, label, small) => {
    const cy = Y;
    const w = 64;
    let m = S.ln(x, cy, x + 10, cy, { stroke: '#dc2626', w: 2 }) +
      `<circle cx="${x + 14}" cy="${cy}" r="2.8" fill="#334155"/>` +
      `<line x1="${x + 17}" y1="${cy}" x2="${x + w - 6}" y2="${cy - 13}" stroke="#334155" stroke-width="2"/>` +
      `<circle cx="${x + w - 3}" cy="${cy}" r="2.8" fill="#334155"/>` +
      S.ln(x + w, cy, x + w + 4, cy, { stroke: '#dc2626', w: 2 }) +
      S.txt(x + w / 2, cy + (small ? 13 : 15), label, { size: 9.5, fill: '#7f1d1d', weight: 700 });
    return m;
  };
  const G = 84, X0 = 40;
  const row1 = ['梳齿板下', '入口下', '围裙板', '断链松弛', '超速', '防逆转'];
  const row2 = ['梳齿板上', '入口上', '急停(下)', '急停(上)', '检修开关'];
  row1.forEach((s, i) => { p.push(contact(X0 + i * G, s)); if (i < row1.length - 1) p.push(S.ln(X0 + i * G + 68, Y, X0 + (i + 1) * G, Y, { stroke: '#dc2626', w: 2 })); });
  p.push(S.ln(X0 + 5 * G + 68, Y, 792, Y, { stroke: '#dc2626', w: 2 }));
  p.push(S.ln(792, Y, 792, Y + 56, { stroke: '#dc2626', w: 2 }));
  p.push(S.ln(792, Y + 56, X0 + 4 * G + 34, Y + 56, { stroke: '#dc2626', w: 2 }));
  p.push(S.ln(28, Y, X0, Y, { stroke: '#dc2626', w: 2 }));
  p.push(S.ln(28, Y, 28, Y + 56, { stroke: '#dc2626', w: 2 }));
  p.push(S.ln(28, Y + 56, X0, Y + 56, { stroke: '#dc2626', w: 2 }));
  const Y2 = Y + 56;
  row2.forEach((s, i) => { p.push(contact(X0 + i * G, s)); if (i < row2.length - 1) p.push(S.ln(X0 + i * G + 68, Y2, X0 + (i + 1) * G, Y2, { stroke: '#dc2626', w: 2 })); });
  // 电源与继电器
  p.push(S.txt(28, Y - 12, 'L+', { anchor: 'start', size: 10.5, fill: '#b91c1c' }));
  p.push(S.txt(28, Y2 - 8, 'L−', { anchor: 'start', size: 10.5, fill: '#b91c1c' }));
  // K 继电器 + 抱闸输出
  p.push(S.rc(646, Y2 + 22, 120, 66, { fill: '#fff', stroke: '#16a34a', sw: 2.2, rx: 8 }));
  p.push(S.txt(706, Y2 + 48, '安全继电器 K', { size: 11, fill: '#16a34a' }));
  p.push(S.txt(706, Y2 + 68, '吸合 → 允许运行', { size: 9.5, fill: '#047857', weight: 500 }));
  p.push(S.ln(762, Y2, 792, Y2, { stroke: '#dc2626', w: 2 }));
  p.push(S.rc(24, Y2 + 22, 560, 66, { fill: '#fff', stroke: '#fca5a5', sw: 1.6, rx: 8 }));
  p.push(S.txt(304, Y2 + 48, '断开后果：K 失电 → 制动接触器断开 → 工作制动器抱闸 + 附加制动器（超速/逆转）', { size: 11, fill: '#b91c1c', weight: 600 }));
  p.push(S.txt(304, Y2 + 68, '恢复运行须手动复位并确认无人为危险后，方可用检修或正常操作重新启动', { size: 10, fill: '#991b1b', weight: 500 }));
  /* ---- 底：控制要点 ---- */
  p.push(S.txt(24, 424, '运行控制要点：', { anchor: 'start', size: 11.5, fill: '#334155' }));
  p.push(S.txt(120, 424, '① 出入口感应启动 → S 曲线加速至额定速度', { anchor: 'start', size: 11.5, fill: '#4338ca', weight: 500 }));
  p.push(S.txt(24, 446, '', { anchor: 'start', size: 10 }));
  p.push(S.txt(120, 446, '② 乘客离开后延时减速待机（自动模式节能）', { anchor: 'start', size: 11.5, fill: '#4338ca', weight: 500 }));
  p.push(S.txt(120, 468, '③ 与安全回路硬件联锁：K 断开时变频器使能撤销', { anchor: 'start', size: 11.5, fill: '#4338ca', weight: 500 }));
  p.push(S.txt(400, 504, '任一保护触点断开 → 安全继电器 K 失电 → 抱闸停机；故障未复位前不能重新启动。', { size: 11.5, fill: '#334155' }));
  return svgWrap(800, 524, p.join(''));
}

/* 8 安全保护系统（布点 + 动作链 + 串联回路，GB 16899） */
function scSafety() {
  const p = [];
  p.push(S.txt(400, 30, '安全保护：装置布点 → 动作链 → 串联安全回路（GB 16899）', { size: 14, fill: '#b91c1c' }));
  /* ---- 上：扶梯侧视布点（与仿真一致） ---- */
  p.push(S.rc(24, 44, 752, 210, { fill: '#f8fafc', stroke: '#e2e8f0', sw: 1.6, rx: 10 }));
  // 桁架轮廓：下水平 → 30° → 上水平
  p.push(S.path('M60 226 L96 226 L596 112 L736 112', { stroke: '#94a3b8', w: 9 }));
  p.push(S.ln(40, 226, 244, 226, { stroke: '#a8a29e', w: 3 }));
  p.push(S.ln(600, 112, 786, 112, { stroke: '#a8a29e', w: 3 }));
  p.push(S.txt(64, 244, '下部地坪', { size: 10.5, fill: '#57534e' }));
  p.push(S.txt(770, 132, '上部地坪', { size: 10.5, fill: '#57534e' }));
  // 布点（编号圆 + 引线 + 标签，标签错位避让）
  const dev = (n, x, y, lx, ly, label, above) => S.ci(x, y, 10, { fill: '#dc2626', stroke: '#991b1b', sw: 2 }) +
    `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" font-family="inherit">${n}</text>` +
    S.ln(x, y + (above ? -10 : 10), lx, ly, { stroke: '#dc2626', w: 1.4, dash: '4 3' }) +
    S.txt(lx, ly + (above ? -8 : 14), label, { size: 11, fill: '#b91c1c' });
  p.push(dev(1, 148, 214, 116, 186, '① 梳齿板保护（下）', true));
  p.push(dev(2, 214, 198, 216, 168, '② 扶手带入口（下）', true));
  p.push(dev(3, 330, 168, 322, 130, '③ 围裙板保护', true));
  p.push(dev(4, 396, 150, 428, 108, '④ 梯级缺失/防偏载', true));
  p.push(dev(5, 560, 116, 560, 64, '⑤ 梳齿板保护（上）', true));
  p.push(dev(6, 626, 116, 648, 88, '⑥ 超速/防逆转', true));
  p.push(dev(7, 700, 116, 726, 66, '⑦ 附加制动器', true));
  p.push(dev(8, 108, 222, 120, 246, '⑧ 断链/松弛（下部张紧）', false));
  p.push(dev(9, 700, 168, 728, 200, '⑨ 急停（上/下端）', false));
  p.push(S.txt(280, 246, '⑩ 检修盒（急停/检修开关，上端机房与下端）', { size: 11, fill: '#b91c1c' }));
  /* ---- 中：动作链 ---- */
  p.push(S.rc(24, 272, 752, 74, { fill: '#fff', stroke: '#fca5a5', sw: 1.8, rx: 10 }));
  p.push(S.txt(400, 292, '动作链', { size: 12, fill: '#991b1b' }));
  const chain = ['装置动作', '安全回路断开', '继电器 K 失电', '制动接触器断开', '制动器抱闸', '梯级停止'];
  chain.forEach((s, i) => {
    const x = 44 + i * 124;
    p.push(S.rc(x, 306, 104, 30, { fill: '#fef2f2', stroke: '#fca5a5', rx: 7 }));
    p.push(S.txt(x + 52, 326, s, { size: 11, fill: '#b91c1c', weight: 700 }));
    if (i < chain.length - 1) p.push(S.ar(x + 104, 321, x + 124, 321, { stroke: '#dc2626', w: 2, head: 7 }));
  });
  /* ---- 下：串联安全回路 ---- */
  p.push(S.rc(24, 362, 752, 156, { fill: '#fef2f2', stroke: '#fecaca', sw: 1.6, rx: 10 }));
  p.push(S.txt(400, 386, '安全回路（串联）：任一触点断开 → 立即抱闸停机', { size: 12.5, fill: '#b91c1c' }));
  const items = ['①梳齿板(下)', '②入口(下)', '③围裙板', '④梯级缺失', '⑤梳齿板(上)', '⑥超速/逆转', '⑦附加制动器', '⑧断链/松弛', '⑨急停×2', '⑩检修开关'];
  items.forEach((s, i) => {
    const x = 44 + (i % 5) * 146; const y = 402 + Math.floor(i / 5) * 46;
    p.push(S.rc(x, y, 130, 36, { fill: '#fff', stroke: '#fca5a5', rx: 7 }));
    p.push(S.txt(x + 65, y + 23, s, { size: 10.5, fill: '#b91c1c', weight: 700 }));
    if (i % 5 < 4) p.push(S.ln(x + 130, y + 18, x + 146, y + 18, { stroke: '#dc2626', w: 2.2 }));
  });
  // 末尾 → K → 抱闸
  p.push(S.ln(774, 448, 784, 448, { stroke: '#dc2626', w: 2.2 }));
  p.push(S.rc(40, 494, 720, 20, { fill: '#fff', stroke: '#fff', sw: 0, rx: 0 }));
  p.push(S.txt(400, 512, '附加制动器仅在超速、逆转或驱动元件失效时直接作用于主轴；恢复运行前必须排除故障并复位。', { size: 11.5, fill: '#334155' }));
  return svgWrap(800, 534, p.join(''));
}

/* ======================= 调度总表 ======================= */
const SCHEMATICS = {
  'upper-machine': scUpperMachine,
  'truss-middle': scTrussMiddle,
  'lower-tension': scLowerTension,
  'step-circulation': scStepCirculation,
  'truss': scTruss,
  'drive': scDrive,
  'rail': scRail,
  'step': scStep,
  'handrail': scHandrail,
  'tension': scTension,
  'control': scControl,
  'safety': scSafety
};

function schematicSvg(key) {
  const f = SCHEMATICS[key];
  return f ? f() : '';
}
