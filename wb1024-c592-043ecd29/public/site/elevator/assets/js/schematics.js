/* =========================================================================
 * 原理图库（矢量 SVG 绘制）
 * 覆盖：四大空间示意图 + 八大系统原理图
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
  /** 多边形 */
  pg(points, o = {}) {
    const { fill = '#ffffff', stroke = '#334155', sw = 2 } = o;
    return `<polygon points="${points.map(p => p.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
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
  /** 钢丝绳（双线） */
  rope(x1, y1, x2, y2) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#475569" stroke-width="2.6"/>` +
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#94a3b8" stroke-width="0.9" stroke-dasharray="5 4"/>`;
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

/* ======================= 四大空间示意图 ======================= */

/* 机房空间 */
function scMachineRoom() {
  const p = [];
  // 房间
  p.push(S.rc(40, 40, 720, 300, { fill: '#f8fafc', stroke: '#94a3b8', sw: 2.5 }));
  p.push(S.ln(40, 200, 760, 200, { stroke: '#cbd5e1', w: 1.5, dash: '6 5' }));
  p.push(S.txt(60, 66, '机房空间', { anchor: 'start', size: 16, fill: '#1e3a8a' }));
  p.push(S.txt(60, 86, 'Machine Room', { anchor: 'start', size: 11, fill: '#64748b', weight: 500 }));
  // 曳引机
  p.push(S.rc(120, 108, 200, 78, { fill: '#dbeafe', stroke: '#1d4ed8' }));
  p.push(S.ci(160, 147, 26, { fill: '#fff', stroke: '#1d4ed8' }));
  p.push(S.ci(160, 147, 8, { fill: '#1d4ed8', stroke: '#1d4ed8' }));
  p.push(S.ln(160, 121, 160, 173, { stroke: '#1d4ed8', w: 2 }));
  p.push(S.ln(134, 147, 186, 147, { stroke: '#1d4ed8', w: 2 }));
  p.push(S.rc(196, 122, 108, 50, { fill: '#bfdbfe', stroke: '#1d4ed8' }));
  p.push(S.txt(250, 145, '曳引电动机', { size: 12, fill: '#1e3a8a' }));
  p.push(S.txt(250, 162, '+ 减速箱', { size: 11, fill: '#1e3a8a', weight: 500 }));
  p.push(S.txt(160, 113, '曳引轮', { size: 11, fill: '#1d4ed8' }));
  // 控制柜
  p.push(S.rc(370, 100, 120, 200, { fill: '#e0e7ff', stroke: '#4f46e5' }));
  p.push(S.txt(430, 122, '控制柜', { size: 13, fill: '#3730a3' }));
  for (let i = 0; i < 5; i++) {
    p.push(S.ln(384, 140 + i * 32, 476, 140 + i * 32, { stroke: '#a5b4fc', w: 6 }));
  }
  p.push(S.txt(430, 284, '主控板·变频器', { size: 11, fill: '#4338ca', weight: 500 }));
  p.push(S.txt(430, 298, '接触器·安全回路', { size: 11, fill: '#4338ca', weight: 500 }));
  // 限速器
  p.push(S.ci(575, 132, 30, { fill: '#fee2e2', stroke: '#dc2626' }));
  p.push(S.ci(575, 132, 11, { fill: '#fecaca', stroke: '#dc2626' }));
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    p.push(S.ci(575 + 15 * Math.cos(a), 132 + 15 * Math.sin(a), 4.5, { fill: '#dc2626', stroke: '#dc2626' }));
  }
  p.push(S.txt(575, 96, '限速器', { size: 12, fill: '#b91c1c' }));
  p.push(S.rope(575, 162, 575, 320));
  p.push(S.txt(612, 250, '限速器钢丝绳', { size: 11, fill: '#64748b', anchor: 'start', weight: 500 }));
  // 导向轮
  p.push(S.ci(680, 145, 24, { fill: '#fff', stroke: '#0891b2' }));
  p.push(S.txt(680, 105, '导向轮', { size: 12, fill: '#0e7490' }));
  // 井道示意
  p.push(S.rc(470, 340, 220, 60, { fill: '#f1f5f9', stroke: '#94a3b8', dash: '7 6' }));
  p.push(S.txt(580, 376, '↓ 通往井道空间', { size: 13, fill: '#475569' }));
  // 曳引绳
  p.push(S.rope(134, 173, 134, 340));
  p.push(S.rope(186, 173, 186, 340));
  p.push(S.txt(110, 300, '曳引钢丝绳', { anchor: 'end', size: 11, fill: '#475569', weight: 500 }));
  return svgWrap(800, 420, p.join(''));
}

/* 井道空间（自井道顶贯通至底坑；底坑并入井道空间） */
function scHoistway() {
  const p = [];
  // 井道外框（含底部底坑）
  p.push(S.rc(220, 40, 360, 500, { fill: '#f8fafc', stroke: '#94a3b8', sw: 2.5 }));
  p.push(S.txt(40, 56, '井道空间', { anchor: 'start', size: 16, fill: '#0e7490' }));
  p.push(S.txt(40, 76, 'Hoistway（含底坑）', { anchor: 'start', size: 11, fill: '#64748b', weight: 500 }));
  // 底坑分界与地坪
  p.push(S.ln(220, 462, 580, 462, { stroke: '#5eead4', w: 1.8, dash: '8 6' }));
  p.push(S.rc(200, 540, 400, 24, { fill: '#d6d3d1', stroke: '#78716c', sw: 2.5 }));
  // 导轨
  p.push(S.rc(244, 50, 16, 478, { fill: '#cbd5e1', stroke: '#64748b', sw: 1.5 }));
  p.push(S.rc(536, 50, 16, 478, { fill: '#cbd5e1', stroke: '#64748b', sw: 1.5 }));
  p.push(S.txt(206, 300, '轿厢导轨', { anchor: 'end', size: 11.5, fill: '#475569' }));
  p.push(S.ar(210, 300, 242, 300, { stroke: '#64748b', w: 1.6, head: 7 }));
  // 楼层与层门（自下而上 1F → 3F）
  [{ y: 390, n: '1F' }, { y: 270, n: '2F' }, { y: 150, n: '3F' }].forEach(f => {
    p.push(S.ln(264, f.y, 536, f.y, { stroke: '#e2e8f0', w: 1.3, dash: '7 6' }));
    p.push(S.ln(220, f.y, 264, f.y, { stroke: '#059669', w: 4 }));
    p.push(S.ln(536, f.y, 580, f.y, { stroke: '#059669', w: 4 }));
    p.push(S.txt(590, f.y + 5, `${f.n} 层门`, { anchor: 'start', size: 12, fill: '#047857' }));
  });
  // 轿厢
  p.push(S.rc(280, 210, 130, 170, { fill: '#dbeafe', stroke: '#1d4ed8' }));
  p.push(S.txt(345, 292, '轿厢', { size: 14, fill: '#1e3a8a' }));
  p.push(S.txt(345, 312, 'Car', { size: 11, fill: '#3b82f6', weight: 500 }));
  // 导靴
  p.push(S.rc(262, 222, 14, 26, { fill: '#fcd34d', stroke: '#b45309', sw: 1.6 }));
  p.push(S.rc(262, 340, 14, 26, { fill: '#fcd34d', stroke: '#b45309', sw: 1.6 }));
  p.push(S.rc(414, 222, 14, 26, { fill: '#fcd34d', stroke: '#b45309', sw: 1.6 }));
  p.push(S.rc(414, 340, 14, 26, { fill: '#fcd34d', stroke: '#b45309', sw: 1.6 }));
  p.push(S.txt(300, 404, '导靴（上下各一对）', { anchor: 'start', size: 11, fill: '#b45309' }));
  // 对重
  p.push(S.rc(468, 180, 56, 150, { fill: '#fef3c7', stroke: '#b45309' }));
  for (let i = 0; i < 4; i++) p.push(S.ln(472, 200 + i * 32, 520, 200 + i * 32, { stroke: '#d97706', w: 6 }));
  p.push(S.txt(496, 174, '对重', { size: 12, fill: '#b45309' }));
  p.push(S.txt(496, 348, '对重导轨', { size: 11, fill: '#b45309' }));
  // 曳引钢丝绳（连至轿厢顶与对重顶）
  p.push(S.rope(320, 44, 320, 210));
  p.push(S.rope(490, 44, 490, 180));
  p.push(S.ln(320, 44, 490, 44, { stroke: '#94a3b8', w: 2, dash: '5 4' }));
  p.push(S.txt(405, 32, '↕ 通往机房曳引轮', { size: 11.5, fill: '#64748b' }));
  p.push(S.txt(320, 202, '曳引绳', { size: 11, fill: '#475569', anchor: 'end' }));
  // 随行电缆
  p.push(`<path d="M300 380 Q 230 428 268 460" fill="none" stroke="#475569" stroke-width="2.4" stroke-dasharray="7 4"/>`);
  p.push(S.txt(232, 424, '随行电缆', { anchor: 'end', size: 11, fill: '#475569' }));
  // 底坑设备：轿厢缓冲器 / 对重缓冲器
  const buffer = cx => S.rc(cx - 26, 530, 52, 10, { fill: '#dc2626', stroke: '#991b1b' }) +
    S.rc(cx - 22, 486, 44, 8, { fill: '#ef4444', stroke: '#991b1b' }) +
    S.ln(cx - 20, 494, cx - 20, 528, { stroke: '#dc2626', w: 2 }) +
    S.ln(cx + 20, 494, cx + 20, 528, { stroke: '#dc2626', w: 2 }) +
    [0, 1, 2, 3].map(i => S.ln(cx - 20, 498 + i * 8, cx + 20, 498 + i * 8, { stroke: '#dc2626', w: 3 })).join('');
  p.push(buffer(342));
  p.push(buffer(494));
  p.push(S.txt(342, 478, '轿厢缓冲器', { size: 11, fill: '#b91c1c' }));
  p.push(S.txt(494, 478, '对重缓冲器', { size: 11, fill: '#b91c1c' }));
  // 限速器绳 + 张紧装置（井道底部，即底坑）
  p.push(S.ln(120, 44, 120, 478, { stroke: '#475569', w: 2.2, dash: '7 5' }));
  p.push(S.txt(104, 300, '限速器钢丝绳', { anchor: 'end', size: 11, fill: '#0e7490' }));
  p.push(S.ci(120, 494, 16, { fill: '#e0f2fe', stroke: '#0e7490', sw: 2 }));
  p.push(S.rc(102, 514, 36, 34, { fill: '#a7f3d0', stroke: '#047857' }));
  p.push(S.ar(120, 556, 120, 536, { stroke: '#047857', w: 1.6, head: 7 }));
  p.push(S.txt(120, 578, '张紧装置', { size: 11, fill: '#047857' }));
  // 底坑爬梯
  p.push(S.ln(560, 536, 560, 468, { stroke: '#78716c', w: 3 }));
  p.push(S.ln(578, 536, 578, 468, { stroke: '#78716c', w: 3 }));
  for (let i = 0; i < 5; i++) p.push(S.ln(560, 476 + i * 14, 578, 476 + i * 14, { stroke: '#78716c', w: 2.5 }));
  p.push(S.txt(590, 500, '底坑爬梯', { anchor: 'start', size: 11, fill: '#57534e' }));
  // 底坑说明
  p.push(S.txt(400, 580, '底坑设备：缓冲器 · 张紧装置 · 检修停止开关 · 爬梯 · 照明 · 排水', { size: 11.5, fill: '#475569' }));
  p.push(S.txt(400, 602, '底坑地坪（须防水、设排水）', { size: 11.5, fill: '#57534e' }));
  return svgWrap(800, 620, p.join(''));
}

/* 轿厢空间 */
function scCar() {
  const p = [];
  p.push(S.txt(40, 40, '轿厢空间', { anchor: 'start', size: 16, fill: '#5b21b6' }));
  p.push(S.txt(40, 60, 'Car', { anchor: 'start', size: 11, fill: '#64748b', weight: 500 }));
  // 轿厢架
  p.push(S.rc(180, 110, 420, 18, { fill: '#c7d2fe', stroke: '#4f46e5' }));
  p.push(S.txt(390, 102, '轿厢架上梁', { size: 12, fill: '#3730a3' }));
  p.push(S.rc(180, 400, 420, 18, { fill: '#c7d2fe', stroke: '#4f46e5' }));
  p.push(S.txt(390, 440, '轿厢架下梁', { size: 12, fill: '#3730a3' }));
  p.push(S.rc(190, 128, 16, 272, { fill: '#a5b4fc', stroke: '#4f46e5' }));
  p.push(S.rc(574, 128, 16, 272, { fill: '#a5b4fc', stroke: '#4f46e5' }));
  p.push(S.txt(120, 270, '立柱', { anchor: 'end', size: 12, fill: '#3730a3' }));
  p.push(S.ar(140, 270, 186, 270, { stroke: '#4f46e5', w: 1.6, head: 7 }));
  // 轿厢体
  p.push(S.rc(210, 150, 360, 240, { fill: '#f5f3ff', stroke: '#7c3aed', sw: 2.2 }));
  p.push(S.rc(210, 150, 360, 24, { fill: '#ddd6fe', stroke: '#7c3aed', sw: 1.6 }));
  p.push(S.txt(255, 167, '轿顶', { size: 11, fill: '#5b21b6' }));
  p.push(S.rc(210, 366, 360, 24, { fill: '#ddd6fe', stroke: '#7c3aed', sw: 1.6 }));
  p.push(S.txt(255, 383, '轿底 / 地板', { size: 11, fill: '#5b21b6' }));
  p.push(S.txt(390, 268, '轿壁', { size: 13, fill: '#6d28d9' }));
  // 轿门
  p.push(S.rc(230, 190, 90, 160, { fill: '#e0f2fe', stroke: '#0e7490' }));
  p.push(S.rc(450, 190, 90, 160, { fill: '#e0f2fe', stroke: '#0e7490' }));
  p.push(S.txt(390, 282, '⇄', { size: 22, fill: '#0e7490' }));
  p.push(S.txt(275, 372, '轿门', { size: 11.5, fill: '#0e7490' }));
  p.push(S.txt(495, 372, '轿门', { size: 11.5, fill: '#0e7490' }));
  // 门机
  p.push(S.rc(320, 158, 140, 22, { fill: '#fed7aa', stroke: '#ea580c', sw: 1.8 }));
  p.push(S.txt(390, 174, '门机', { size: 11, fill: '#9a3412' }));
  // 操纵箱
  p.push(S.rc(536, 210, 34, 96, { fill: '#e2e8f0', stroke: '#475569', sw: 1.8 }));
  for (let i = 0; i < 4; i++) p.push(S.ci(553, 228 + i * 21, 6.5, { fill: '#bfdbfe', stroke: '#475569', sw: 1.2 }));
  p.push(S.txt(600, 262, '操纵箱', { anchor: 'start', size: 11.5, fill: '#334155' }));
  // 绳头组合
  p.push(S.rope(390, 40, 390, 110));
  p.push(S.rc(374, 96, 32, 14, { fill: '#fde68a', stroke: '#b45309', sw: 1.6 }));
  p.push(S.txt(390, 32, '绳头组合（吊挂）', { size: 12, fill: '#b45309' }));
  // 导靴
  p.push(S.rc(160, 150, 18, 30, { fill: '#fcd34d', stroke: '#b45309', sw: 1.5 }));
  p.push(S.rc(160, 380, 18, 30, { fill: '#fcd34d', stroke: '#b45309', sw: 1.5 }));
  p.push(S.rc(212, 470, 18, 30, { fill: '#fcd34d', stroke: '#b45309', sw: 1.5, opacity: .0 }));
  p.push(S.txt(120, 470, '导靴', { anchor: 'end', size: 11.5, fill: '#b45309' }));
  p.push(S.ln(30, 195, 175, 195, { stroke: '#94a3b8', w: 3 }));
  p.push(S.ln(30, 425, 175, 425, { stroke: '#94a3b8', w: 3 }));
  p.push(S.txt(60, 520, '导轨（导向系统）', { anchor: 'start', size: 11.5, fill: '#475569' }));
  return svgWrap(800, 540, p.join(''));
}

/* 层站空间 */
function scLanding() {
  const p = [];
  p.push(S.txt(40, 40, '层站空间', { anchor: 'start', size: 16, fill: '#047857' }));
  p.push(S.txt(40, 60, 'Landing（电梯厅 · 候梯与进出）', { anchor: 'start', size: 11, fill: '#64748b', weight: 500 }));
  // 井道侧（剖面）
  p.push(S.rc(70, 90, 190, 370, { fill: '#f8fafc', stroke: '#94a3b8', sw: 2 }));
  p.push(S.txt(165, 116, '井道', { size: 12, fill: '#0e7490' }));
  p.push(S.rc(100, 200, 130, 170, { fill: '#dbeafe', stroke: '#1d4ed8' }));
  p.push(S.txt(165, 288, '轿厢', { size: 13, fill: '#1e3a8a' }));
  p.push(S.txt(165, 308, '（停靠本层）', { size: 11, fill: '#3b82f6', weight: 500 }));
  // 层楼显示
  p.push(S.rc(296, 84, 124, 48, { fill: '#0f172a', stroke: '#334155', rx: 8 }));
  p.push(S.txt(344, 118, '3F', { size: 16, fill: '#7dd3fc' }));
  p.push(S.txt(396, 116, '▲', { size: 12, fill: '#4ade80' }));
  p.push(S.txt(358, 76, '层楼显示 + 到站灯', { size: 11, fill: '#334155' }));
  // 门锁（层门锁闭）
  p.push(S.rc(436, 84, 110, 48, { fill: '#fee2e2', stroke: '#dc2626', rx: 8 }));
  p.push(S.txt(491, 104, '层门门锁', { size: 11.5, fill: '#b91c1c' }));
  p.push(S.txt(491, 121, '机械锁钩 + 电气触点', { size: 11, fill: '#b91c1c' }));
  p.push(S.ln(491, 132, 480, 176, { stroke: '#dc2626', w: 1.6, dash: '4 3' }));
  // 门套与井道口
  p.push(S.rc(266, 130, 18, 330, { fill: '#e2e8f0', stroke: '#64748b', sw: 1.6 }));
  p.push(S.rc(556, 130, 18, 330, { fill: '#e2e8f0', stroke: '#64748b', sw: 1.6 }));
  p.push(S.txt(258, 124, '门套', { anchor: 'end', size: 11, fill: '#475569' }));
  // 层门（中分双扇，闭合对接于 x=420）
  p.push(S.rc(284, 150, 136, 280, { fill: '#dcfce7', stroke: '#059669', sw: 2.2 }));
  p.push(S.rc(420, 150, 136, 280, { fill: '#dcfce7', stroke: '#059669', sw: 2.2 }));
  p.push(S.txt(352, 292, '层门 L', { size: 11.5, fill: '#065f46' }));
  p.push(S.txt(488, 292, '层门 R', { size: 11.5, fill: '#065f46' }));
  p.push(S.txt(420, 470, '井道口（层门全宽封闭 · 未锁闭禁止运行）', { size: 11.5, fill: '#475569' }));
  // 地坎与滑块
  p.push(S.ln(284, 430, 556, 430, { stroke: '#78716c', w: 5 }));
  p.push(S.txt(582, 438, '层门地坎 + 门滑块', { anchor: 'start', size: 11, fill: '#57534e' }));
  // 层站召唤箱（外呼）
  p.push(S.rc(640, 200, 60, 96, { fill: '#e0e7ff', stroke: '#1d4ed8', rx: 8 }));
  p.push(S.ci(670, 226, 16, { fill: '#dcfce7', stroke: '#059669', sw: 1.8 }));
  p.push(S.ci(670, 270, 16, { fill: '#fee2e2', stroke: '#dc2626', sw: 1.8 }));
  p.push(S.txt(670, 231, '▲', { size: 12, fill: '#059669' }));
  p.push(S.txt(670, 275, '▼', { size: 12, fill: '#dc2626' }));
  p.push(S.txt(670, 188, '层站召唤箱（外呼）', { size: 11.5, fill: '#1e3a8a' }));
  p.push(S.txt(670, 320, '上 / 下召唤按钮', { size: 11, fill: '#475569' }));
  // 消防开关
  p.push(S.rc(716, 236, 48, 44, { fill: '#fee2e2', stroke: '#dc2626', rx: 6 }));
  p.push(S.txt(740, 264, '消防', { size: 11, fill: '#b91c1c' }));
  p.push(S.txt(740, 226, '消防开关', { size: 11, fill: '#b91c1c' }));
  // 候梯区
  p.push(S.ln(582, 430, 780, 430, { stroke: '#a8a29e', w: 3 }));
  p.push(S.txt(682, 452, '候梯区（电梯厅）· 防滑地面', { size: 11, fill: '#57534e' }));
  return svgWrap(800, 500, p.join(''));
}

/* ======================= 八大系统原理图 ======================= */

/* 1 曳引系统 */
function scTraction() {
  const p = [];
  p.push(S.ci(400, 110, 56, { fill: '#e0e7ff', stroke: '#1d4ed8', sw: 3 }));
  p.push(S.ci(400, 110, 10, { fill: '#1d4ed8', stroke: '#1d4ed8' }));
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    p.push(S.ln(400 + 14 * Math.cos(a), 110 + 14 * Math.sin(a), 400 + 44 * Math.cos(a), 110 + 44 * Math.sin(a), { stroke: '#60a5fa', w: 2 }));
  }
  p.push(S.txt(400, 36, '曳引轮（绳槽摩擦驱动）', { size: 14, fill: '#1e3a8a' }));
  // 包角
  p.push(`<path d="M344 110 A 56 56 0 0 1 456 110" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="5 4"/>`);
  p.push(S.txt(400, 196, '包角 α', { size: 12, fill: '#b91c1c' }));
  // 绳
  p.push(S.rope(344, 110, 344, 250));
  p.push(S.rope(456, 110, 456, 210));
  // 轿厢
  p.push(S.rc(254, 250, 180, 190, { fill: '#dbeafe', stroke: '#1d4ed8' }));
  p.push(S.txt(344, 350, '轿厢', { size: 14, fill: '#1e3a8a' }));
  p.push(S.txt(344, 372, 'P + Q', { size: 13, fill: '#1d4ed8' }));
  p.push(S.txt(344, 240, 'T₁（重侧）', { size: 12, fill: '#b91c1c' }));
  // 对重
  p.push(S.rc(426, 210, 60, 150, { fill: '#fef3c7', stroke: '#b45309' }));
  p.push(S.txt(456, 292, '对重', { size: 12, fill: '#b45309' }));
  p.push(S.txt(456, 312, 'W', { size: 12, fill: '#b45309' }));
  p.push(S.txt(560, 200, 'T₂（轻侧）', { size: 12, fill: '#047857', anchor: 'start' }));
  p.push(S.ar(520, 196, 462, 196, { stroke: '#047857', w: 1.6, head: 7 }));
  // 受力
  p.push(S.ar(240, 330, 288, 330, { stroke: '#b91c1c', w: 2, head: 8 }));
  p.push(S.ar(344, 470, 344, 442, { stroke: '#b91c1c', w: 2, head: 8 }));
  p.push(S.txt(200, 334, '(P+Q)g', { anchor: 'end', size: 12, fill: '#b91c1c' }));
  p.push(S.txt(504, 466, 'W·g', { anchor: 'start', size: 12, fill: '#b45309' }));
  p.push(S.ar(486, 462, 486, 366, { stroke: '#b45309', w: 2, head: 8 }));
  // 公式框
  p.push(S.rc(60, 200, 170, 84, { fill: '#0f172a', stroke: '#0f172a', rx: 10 }));
  p.push(S.txt(145, 230, 'T₁ / T₂ ≤ e^(f·α)', { size: 14, fill: '#7dd3fc' }));
  p.push(S.txt(145, 254, '摩擦力是驱动本质', { size: 11, fill: '#a5f3fc', weight: 500 }));
  p.push(S.txt(145, 272, '超限 → 打滑', { size: 11, fill: '#fca5a5', weight: 500 }));
  return svgWrap(800, 500, p.join(''));
}

/* 2 导向系统 */
function scGuide() {
  const p = [];
  p.push(S.txt(400, 36, '导向系统：约束水平位移，保证垂直运行', { size: 14, fill: '#0e7490' }));
  // 导轨剖面放大
  p.push(S.rc(90, 80, 190, 200, { fill: '#f8fafc', stroke: '#cbd5e1', dash: '7 6' }));
  p.push(S.txt(185, 104, 'T 型导轨剖面', { size: 12, fill: '#475569' }));
  p.push(S.pg([[120, 130], [250, 130], [250, 158], [204, 158], [204, 250], [166, 250], [166, 158], [120, 158]], { fill: '#cbd5e1', stroke: '#475569', sw: 2 }));
  p.push(S.txt(139, 122, '顶面', { size: 11, fill: '#475569' }));
  p.push(S.txt(272, 200, '两侧', { size: 11, fill: '#475569', anchor: 'start' }));
  // 导靴
  p.push(S.rc(300, 160, 34, 80, { fill: '#fcd34d', stroke: '#b45309', sw: 2 }));
  p.push(S.txt(317, 300, '导靴', { size: 12, fill: '#b45309' }));
  p.push(S.ar(317, 288, 317, 246, { stroke: '#b45309', w: 1.6, head: 7 }));
  // 导轨剖面（正立面）
  p.push(S.rc(380, 80, 22, 380, { fill: '#cbd5e1', stroke: '#475569', sw: 2 }));
  p.push(S.txt(391, 66, '导轨', { size: 12, fill: '#475569' }));
  // 轿厢
  p.push(S.rc(430, 150, 250, 220, { fill: '#dbeafe', stroke: '#1d4ed8', sw: 2.5 }));
  p.push(S.txt(555, 250, '轿厢', { size: 15, fill: '#1e3a8a' }));
  // 偏载箭头
  p.push(S.ar(555, 250, 640, 250, { stroke: '#dc2626', w: 3, head: 11 }));
  p.push(S.txt(600, 236, '偏载 P', { size: 12, fill: '#b91c1c' }));
  // 导靴
  p.push(S.rc(406, 168, 26, 34, { fill: '#fcd34d', stroke: '#b45309', sw: 1.8 }));
  p.push(S.rc(406, 318, 26, 34, { fill: '#fcd34d', stroke: '#b45309', sw: 1.8 }));
  p.push(S.txt(470, 470, '导靴只允许沿导轨垂直滑移，限制水平位移与扭转', { size: 12, fill: '#475569' }));
  // 约束箭头
  p.push(S.ar(680, 200, 640, 200, { stroke: '#059669', w: 2.4, head: 9 }));
  p.push(S.ar(680, 340, 640, 340, { stroke: '#059669', w: 2.4, head: 9 }));
  p.push(S.txt(740, 270, '水平约束反力', { size: 12, fill: '#047857' }));
  p.push(S.txt(700, 200, 'F', { size: 12, fill: '#047857' }));
  p.push(S.txt(700, 344, 'F', { size: 12, fill: '#047857' }));
  // 偏载力矩
  p.push(S.txt(90, 330, '偏载产生倾覆力矩 M = P × e', { anchor: 'start', size: 13, fill: '#b91c1c' }));
  p.push(S.txt(90, 356, '由上下两对导靴的反力平衡', { anchor: 'start', size: 12, fill: '#475569', weight: 500 }));
  p.push(S.txt(90, 382, 'F = M / L（L 为上下导靴间距）', { anchor: 'start', size: 12, fill: '#475569', weight: 500 }));
  return svgWrap(800, 500, p.join(''));
}

/* 3 轿厢系统（传力路径） */
function scCarSystem() {
  const p = [];
  p.push(S.txt(400, 36, '轿厢载荷传力路径', { size: 14, fill: '#5b21b6' }));
  const step = (x, y, label, sub, color) => S.rc(x, y, 150, 66, { fill: color.bg, stroke: color.st, sw: 2 }) +
    S.txt(x + 75, y + 28, label, { size: 13, fill: color.tx }) +
    S.txt(x + 75, y + 48, sub, { size: 11, fill: color.tx, weight: 500 });
  const A = { bg: '#dbeafe', st: '#1d4ed8', tx: '#1e3a8a' };
  const B = { bg: '#e0e7ff', st: '#4f46e5', tx: '#3730a3' };
  const C = { bg: '#fef3c7', st: '#b45309', tx: '#92400e' };
  const D = { bg: '#dcfce7', st: '#059669', tx: '#065f46' };
  p.push(step(60, 90, '轿底 / 地板', '直接承载 P + Q', A));
  p.push(step(280, 90, '轿厢架下梁', '承受弯曲载荷', B));
  p.push(step(500, 90, '立柱（两侧）', '承受拉/压力', B));
  p.push(step(280, 250, '轿厢架上梁', '集中吊挂载荷', B));
  p.push(step(500, 250, '绳头组合', '弹簧均衡 + 缓冲', C));
  p.push(step(280, 400, '曳引钢丝绳', '传递至曳引轮', D));
  p.push(S.ar(210, 123, 280, 123, { stroke: '#4f46e5' }));
  p.push(S.ar(430, 123, 400, 123, { stroke: '#4f46e5' }));
  p.push(S.ar(575, 156, 575, 250, { stroke: '#4f46e5' }));
  p.push(S.ar(430, 283, 500, 283, { stroke: '#b45309' }));
  p.push(S.ar(500, 316, 400, 400, { stroke: '#059669' }));
  p.push(S.ci(270, 195, 8, { fill: '#4f46e5', stroke: 'none' }));
  p.push(`<path d="M270 195 L270 250 L430 283" stroke="#4f46e5" stroke-width="1.6" fill="none" stroke-dasharray="5 4"/>`);
  p.push(S.txt(200, 200, '立柱→上梁', { size: 11, fill: '#4f46e5', weight: 500 }));
  p.push(S.rc(60, 400, 180, 74, { fill: '#f1f5f9', stroke: '#cbd5e1', rx: 10 }));
  p.push(S.txt(150, 426, '吊挂点：轿厢自重 P', { size: 11, fill: '#334155' }));
  p.push(S.txt(150, 446, '+ 额定载重 Q 全部由绳承载', { size: 11, fill: '#334155' }));
  p.push(S.txt(150, 466, '绳安全系数 ≥ 12', { size: 11, fill: '#b91c1c' }));
  return svgWrap(800, 500, p.join(''));
}

/* 4 门系统 */
function scDoor() {
  const p = [];
  p.push(S.txt(400, 34, '门系统：轿门与层门联动（俯视示意）', { size: 14, fill: '#be185d' }));
  // 门机
  p.push(S.rc(300, 70, 200, 46, { fill: '#fed7aa', stroke: '#ea580c', sw: 2 }));
  p.push(S.txt(400, 99, '门机（变频驱动）', { size: 12.5, fill: '#9a3412' }));
  p.push(S.ln(330, 116, 330, 140, { stroke: '#ea580c', w: 2.5 }));
  p.push(S.ln(470, 116, 470, 140, { stroke: '#ea580c', w: 2.5 }));
  // 轿门
  p.push(S.rc(250, 140, 150, 34, { fill: '#e0f2fe', stroke: '#0e7490', sw: 2.2 }));
  p.push(S.rc(400, 140, 150, 34, { fill: '#e0f2fe', stroke: '#0e7490', sw: 2.2 }));
  p.push(S.txt(325, 163, '轿门（左）', { size: 11.5, fill: '#0e7490' }));
  p.push(S.txt(475, 163, '轿门（右）', { size: 11.5, fill: '#0e7490' }));
  p.push(S.ar(396, 190, 300, 190, { stroke: '#0e7490', w: 2, head: 8 }));
  p.push(S.ar(404, 190, 500, 190, { stroke: '#0e7490', w: 2, head: 8 }));
  p.push(S.txt(400, 214, '开门方向', { size: 11, fill: '#0e7490' }));
  // 门刀
  p.push(S.rc(392, 226, 16, 30, { fill: '#dc2626', stroke: '#991b1b', sw: 1.8 }));
  p.push(S.txt(400, 246, '门刀', { size: 11, fill: '#fff' }));
  // 层门锁滚轮
  p.push(S.ci(372, 200, 9, { fill: '#fcd34d', stroke: '#b45309' }));
  p.push(S.ci(428, 200, 9, { fill: '#fcd34d', stroke: '#b45309' }));
  // 层门
  p.push(S.rc(250, 270, 150, 34, { fill: '#dcfce7', stroke: '#059669', sw: 2.2 }));
  p.push(S.rc(400, 270, 150, 34, { fill: '#dcfce7', stroke: '#059669', sw: 2.2 }));
  p.push(S.txt(325, 293, '层门（左）', { size: 11.5, fill: '#065f46' }));
  p.push(S.txt(475, 293, '层门（右）', { size: 11.5, fill: '#065f46' }));
  // 门锁
  p.push(S.rc(508, 262, 46, 50, { fill: '#fee2e2', stroke: '#dc2626', sw: 2 }));
  p.push(S.txt(531, 292, '门锁', { size: 11, fill: '#b91c1c' }));
  p.push(S.ln(470, 287, 508, 287, { stroke: '#dc2626', w: 2, dash: '4 3' }));
  p.push(S.txt(531, 336, '机械锁钩 + 电气触点', { size: 11, fill: '#b91c1c' }));
  p.push(S.txt(531, 354, '（联锁：未锁闭禁止运行）', { size: 11, fill: '#b91c1c' }));
  // 联动
  p.push(`<path d="M392 256 L372 200" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="4 3"/>`);
  p.push(`<path d="M408 256 L428 200" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="4 3"/>`);
  p.push(S.txt(400, 380, '门刀夹持层门锁滚轮 → 轿门、层门同步开闭', { size: 12.5, fill: '#475569' }));
  // 防夹
  p.push(S.rc(240, 400, 320, 40, { fill: '#f0fdf4', stroke: '#86efac', rx: 10 }));
  p.push(S.txt(400, 425, '安全触板 / 光幕：检测障碍即反转开门', { size: 12, fill: '#047857' }));
  // 地坎
  p.push(S.ln(230, 330, 570, 330, { stroke: '#78716c', w: 4 }));
  p.push(S.txt(620, 334, '地坎 + 门滑块（导向）', { anchor: 'start', size: 11, fill: '#57534e' }));
  return svgWrap(800, 470, p.join(''));
}

/* 5 重量平衡系统 */
function scBalance() {
  const p = [];
  p.push(S.txt(400, 34, '重量平衡：对重平衡轿厢自重与部分载荷', { size: 14, fill: '#b45309' }));
  // 曳引轮
  p.push(S.ci(400, 90, 40, { fill: '#e0e7ff', stroke: '#1d4ed8', sw: 2.6 }));
  p.push(S.ci(400, 90, 7, { fill: '#1d4ed8', stroke: '#1d4ed8' }));
  p.push(S.rope(360, 90, 360, 150));
  p.push(S.rope(440, 90, 440, 150));
  // 天平梁
  p.push(S.ln(160, 150, 640, 150, { stroke: '#78350f', w: 6 }));
  p.push(S.ci(400, 150, 9, { fill: '#b45309', stroke: '#78350f' }));
  // 左侧轿厢
  p.push(S.rc(130, 240, 170, 130, { fill: '#dbeafe', stroke: '#1d4ed8' }));
  p.push(S.ln(215, 150, 215, 240, { stroke: '#475569', w: 2.4 }));
  p.push(S.txt(215, 310, 'P + Q', { size: 16, fill: '#1e3a8a' }));
  p.push(S.txt(215, 396, '轿厢自重 P + 载重 Q', { size: 12, fill: '#475569' }));
  // 右侧对重
  p.push(S.rc(500, 250, 140, 120, { fill: '#fef3c7', stroke: '#b45309' }));
  p.push(S.ln(570, 150, 570, 250, { stroke: '#475569', w: 2.4 }));
  p.push(S.txt(570, 315, 'W', { size: 16, fill: '#b45309' }));
  p.push(S.txt(570, 396, '对重总重 W', { size: 12, fill: '#475569' }));
  // 平衡区
  p.push(S.rc(300, 480, 200, 60, { fill: '#0f172a', stroke: '#0f172a', rx: 10 }));
  p.push(S.txt(400, 510, 'W = P + K·Q', { size: 16, fill: '#7dd3fc' }));
  p.push(S.txt(400, 530, 'K ≈ 0.4 ~ 0.5', { size: 11, fill: '#a5f3fc', weight: 500 }));
  // 标注
  p.push(S.txt(120, 470, '当轿厢载重接近 K·Q 时', { anchor: 'start', size: 12, fill: '#047857' }));
  p.push(S.txt(120, 492, '两侧趋近平衡 → 曳引功耗最小', { anchor: 'start', size: 12, fill: '#047857' }));
  p.push(S.rc(60, 190, 90, 40, { fill: '#ecfdf5', stroke: '#059669', rx: 8 }));
  p.push(S.txt(105, 215, '自重侧', { size: 11.5, fill: '#065f46' }));
  p.push(S.rc(650, 190, 90, 40, { fill: '#fef3c7', stroke: '#b45309', rx: 8 }));
  p.push(S.txt(695, 215, '平衡侧', { size: 11.5, fill: '#92400e' }));
  return svgWrap(800, 570, p.join(''));
}

/* 6 电力拖动系统 */
function scDrive() {
  const p = [];
  p.push(S.txt(400, 34, '电力拖动：VVVF 变压变频闭环调速', { size: 14, fill: '#c2410c' }));
  const box = (x, y, w, h, label, sub, c) => S.rc(x, y, w, h, { fill: c.bg, stroke: c.st, sw: 2 }) +
    S.txt(x + w / 2, y + h / 2 + (sub ? -4 : 5), label, { size: 12.5, fill: c.tx }) +
    (sub ? S.txt(x + w / 2, y + h / 2 + 14, sub, { size: 11, fill: c.tx, weight: 500 }) : '');
  const C1 = { bg: '#f1f5f9', st: '#64748b', tx: '#334155' };
  const C2 = { bg: '#ffedd5', st: '#ea580c', tx: '#9a3412' };
  const C3 = { bg: '#dbeafe', st: '#1d4ed8', tx: '#1e3a8a' };
  const C4 = { bg: '#dcfce7', st: '#059669', tx: '#065f46' };
  p.push(box(30, 150, 120, 66, '三相电源', '380V / 50Hz', C1));
  p.push(box(200, 150, 130, 66, '整流器', 'AC → DC', C2));
  p.push(box(200, 250, 130, 50, '直流母线', '滤波储能', C1));
  p.push(box(380, 150, 140, 66, '逆变器', 'DC → 变频 AC', C2));
  p.push(box(570, 150, 160, 66, '曳引电动机', '永磁同步 PM', C3));
  p.push(box(570, 270, 160, 60, '曳引轮', '输出转矩', C3));
  p.push(S.ar(150, 183, 200, 183, { stroke: '#64748b' }));
  p.push(S.ar(330, 183, 380, 183, { stroke: '#ea580c' }));
  p.push(S.ar(520, 183, 570, 183, { stroke: '#ea580c' }));
  p.push(S.ln(265, 200, 265, 250, { stroke: '#64748b', w: 1.8, dash: '5 4' }));
  p.push(S.ar(400, 216, 400, 246, { stroke: '#94a3b8', w: 1.6, dash: '', head: 7 }));
  p.push(S.ln(400, 246, 265, 246, { stroke: '#94a3b8', w: 1.6 }));
  p.push(S.ln(400, 246, 400, 250, { stroke: '#94a3b8', w: 1.6 }));
  p.push(S.ar(650, 216, 650, 270, { stroke: '#1d4ed8' }));
  // 主控与反馈
  p.push(box(380, 320, 140, 56, '主控制器', '速度指令', C4));
  p.push(S.ar(450, 330, 600, 205, { stroke: '#059669', w: 2, dash: '6 4' }));
  p.push(S.txt(556, 268, '速度给定', { size: 11, fill: '#047857' }));
  p.push(box(570, 380, 160, 56, '旋转编码器', '速度/位置反馈', C1));
  p.push(S.ar(650, 380, 650, 330, { stroke: '#64748b', w: 2, dash: '6 4' }));
  p.push(`<path d="M570 408 L340 408" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4" fill="none"/>`);
  p.push(S.ar(340, 408, 380, 380, { stroke: '#64748b', w: 2 }));
  p.push(S.txt(430, 428, '闭环反馈', { size: 11, fill: '#475569' }));
  // S曲线
  p.push(S.rc(30, 340, 300, 150, { fill: '#fff', stroke: '#cbd5e1', rx: 10 }));
  p.push(S.txt(60, 364, 'S 形速度曲线', { anchor: 'start', size: 12, fill: '#334155' }));
  p.push(`<path d="M50 470 L50 385" fill="none" stroke="#94a3b8" stroke-width="1.6"/>`);
  p.push(`<path d="M50 470 L300 470" fill="none" stroke="#94a3b8" stroke-width="1.6"/>`);
  p.push(S.txt(60, 385, 'v', { size: 11, fill: '#64748b' }));
  p.push(S.txt(300, 486, 't', { size: 11, fill: '#64748b' }));
  p.push(`<path d="M50 470 C 90 470 95 400 130 400 L 190 400 C 225 400 230 470 270 470" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2.4"/>`);
  p.push(S.ln(130, 400, 130, 470, { stroke: '#bfdbfe', w: 1.2, dash: '4 3' }));
  p.push(S.ln(190, 400, 190, 470, { stroke: '#bfdbfe', w: 1.2, dash: '4 3' }));
  p.push(S.txt(160, 492, '匀速段', { size: 11, fill: '#64748b' }));
  p.push(S.txt(95, 490, '加速', { size: 11, fill: '#64748b' }));
  p.push(S.txt(228, 490, '减速', { size: 11, fill: '#64748b' }));
  return svgWrap(800, 510, p.join(''));
}

/* 7 电气控制系统 */
function scControl() {
  const p = [];
  p.push(S.txt(400, 34, '电气控制系统：信号采集 → 逻辑运算 → 执行输出', { size: 14, fill: '#4338ca' }));
  // 输入侧
  p.push(S.rc(30, 70, 150, 300, { fill: '#eef2ff', stroke: '#6366f1', rx: 10 }));
  p.push(S.txt(105, 96, '信号采集', { size: 12.5, fill: '#3730a3' }));
  ['轿内操纵箱', '层站召唤箱', '旋转编码器', '平层感应器', '门锁触点', '限速/安全开关'].forEach((s, i) => {
    p.push(S.rc(46, 112 + i * 42, 118, 32, { fill: '#fff', stroke: '#c7d2fe', rx: 7 }));
    p.push(S.txt(105, 133 + i * 42, s, { size: 11, fill: '#3730a3', weight: 600 }));
  });
  // 主控
  p.push(S.rc(310, 130, 180, 120, { fill: '#312e81', stroke: '#312e81', rx: 12 }));
  p.push(S.txt(400, 176, '主控板', { size: 15, fill: '#fff' }));
  p.push(S.txt(400, 200, '调度算法', { size: 11.5, fill: '#a5b4fc', weight: 500 }));
  p.push(S.txt(400, 220, '顺向截梯 / 最远优先', { size: 11, fill: '#c7d2fe', weight: 500 }));
  // 输出侧
  p.push(S.rc(620, 70, 150, 300, { fill: '#ecfdf5', stroke: '#10b981', rx: 10 }));
  p.push(S.txt(695, 96, '执行输出', { size: 12.5, fill: '#065f46' }));
  ['变频器调速', '制动器开闭', '门机控制', '显示与语音', '照明风扇', '报警与对讲'].forEach((s, i) => {
    p.push(S.rc(636, 112 + i * 42, 118, 32, { fill: '#fff', stroke: '#a7f3d0', rx: 7 }));
    p.push(S.txt(695, 133 + i * 42, s, { size: 11, fill: '#065f46', weight: 600 }));
  });
  p.push(S.ar(180, 210, 310, 190, { stroke: '#6366f1' }));
  p.push(S.ar(490, 190, 620, 210, { stroke: '#10b981' }));
  // 安全回路
  p.push(S.rc(230, 290, 340, 62, { fill: '#fef2f2', stroke: '#dc2626', rx: 10 }));
  p.push(S.txt(400, 316, '安全回路（串联）', { size: 12.5, fill: '#b91c1c' }));
  p.push(S.txt(400, 338, '任一触点断开 → 主接触器释放 → 立即停机', { size: 11, fill: '#b91c1c', weight: 500 }));
  p.push(S.ar(400, 250, 400, 290, { stroke: '#dc2626', w: 2 }));
  p.push(S.ln(400, 352, 695, 352, { stroke: '#dc2626', w: 1.8, dash: '5 4' }));
  p.push(S.txt(400, 400, '信号流：采集 → 运算 → 执行 → 反馈闭环', { size: 12.5, fill: '#334155' }));
  return svgWrap(800, 430, p.join(''));
}

/* 8 安全保护系统 */
function scSafety() {
  const p = [];
  p.push(S.txt(400, 34, '安全保护：限速器—提拉机构—安全钳 动作链', { size: 14, fill: '#b91c1c' }));
  // 限速器
  p.push(S.ci(400, 92, 40, { fill: '#fee2e2', stroke: '#dc2626', sw: 2.6 }));
  p.push(S.ci(400, 92, 9, { fill: '#dc2626', stroke: '#dc2626' }));
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + 0.4;
    p.push(S.ci(400 + 22 * Math.cos(a), 92 + 22 * Math.sin(a), 6, { fill: '#dc2626', stroke: '#dc2626' }));
  }
  p.push(S.txt(400, 40, '限速器（≥115% v额 动作）', { size: 12.5, fill: '#b91c1c' }));
  p.push(S.txt(492, 96, '离心甩块/棘轮动作', { anchor: 'start', size: 11, fill: '#b91c1c' }));
  p.push(S.ar(486, 92, 444, 92, { stroke: '#dc2626', w: 1.6, head: 7 }));
  // 绳
  p.push(S.rope(364, 92, 364, 400));
  p.push(S.rope(436, 92, 436, 400));
  // 轿厢
  p.push(S.rc(270, 180, 260, 190, { fill: '#dbeafe', stroke: '#1d4ed8' }));
  p.push(S.txt(400, 250, '轿厢', { size: 15, fill: '#1e3a8a' }));
  // 提拉机构
  p.push(S.rc(430, 180, 34, 34, { fill: '#fde68a', stroke: '#b45309', sw: 2 }));
  p.push(S.txt(447, 202, '提拉', { size: 11, fill: '#92400e' }));
  p.push(S.txt(540, 176, '提拉机构', { anchor: 'start', size: 11.5, fill: '#b45309' }));
  p.push(S.ar(534, 180, 470, 192, { stroke: '#b45309', w: 1.6, head: 7 }));
  // 安全钳
  p.push(S.pg([[330, 340], [370, 330], [370, 372], [330, 362]], { fill: '#dc2626', stroke: '#991b1b', sw: 2 }));
  p.push(S.pg([[470, 340], [430, 330], [430, 372], [470, 362]], { fill: '#dc2626', stroke: '#991b1b', sw: 2 }));
  p.push(S.txt(400, 396, '安全钳（楔块自锁夹紧导轨）', { size: 12, fill: '#b91c1c' }));
  // 导轨
  p.push(S.rc(304, 100, 20, 340, { fill: '#cbd5e1', stroke: '#475569', sw: 2 }));
  p.push(S.rc(476, 100, 20, 340, { fill: '#cbd5e1', stroke: '#475569', sw: 2 }));
  p.push(S.txt(314, 82, '导轨', { size: 11, fill: '#475569' }));
  p.push(S.txt(486, 82, '导轨', { size: 11, fill: '#475569' }));
  // 夹紧力
  p.push(S.ar(292, 352, 330, 352, { stroke: '#dc2626', w: 2.6, head: 9 }));
  p.push(S.ar(508, 352, 470, 352, { stroke: '#dc2626', w: 2.6, head: 9 }));
  p.push(S.txt(250, 356, 'N', { size: 11, fill: '#b91c1c' }));
  p.push(S.txt(550, 356, 'N', { size: 11, fill: '#b91c1c' }));
  // 连锁
  p.push(S.ln(364, 470, 436, 470, { stroke: '#dc2626', w: 1.6, dash: '5 4' }));
  // 三级终端保护
  p.push(S.rc(30, 420, 240, 60, { fill: '#fff7ed', stroke: '#ea580c', rx: 10 }));
  p.push(S.txt(150, 444, '终端三级保护', { size: 12, fill: '#c2410c' }));
  p.push(S.txt(150, 464, '强迫换速 → 限位 → 极限', { size: 11, fill: '#c2410c', weight: 500 }));
  p.push(S.rc(560, 420, 200, 60, { fill: '#f0fdf4', stroke: '#059669', rx: 10 }));
  p.push(S.txt(660, 444, '缓冲器', { size: 12, fill: '#065f46' }));
  p.push(S.txt(660, 464, '吸收越位撞击动能', { size: 11, fill: '#065f46', weight: 500 }));
  return svgWrap(800, 500, p.join(''));
}

/* ======================= 结构剖面图（SECTIONALS） =======================
 * 12 张矢量剖视图：用于系统/空间弹层「② 结构剖面图」栏位，替代原远程实物图。
 * viewBox 800×500 左右，全部标注 font-size ≥ 11，静态图（无运动元素）。
 * ===================================================================== */

/* 1 机房空间剖面 */
function secMachineRoom() {
  const p = [];
  p.push(S.txt(400, 30, '机房空间结构剖面：曳引机 · 控制柜 · 限速器', { size: 14, fill: '#1e3a8a' }));
  p.push(S.rc(28, 46, 744, 292, { fill: '#f8fafc', stroke: '#94a3b8', sw: 2.2 }));
  p.push(S.txt(44, 68, '机房（剖面）', { anchor: 'start', size: 11.5, fill: '#64748b', weight: 600 }));
  // 曳引轮（绳槽剖面）
  p.push(S.ci(140, 196, 50, { fill: '#e0e7ff', stroke: '#1d4ed8', sw: 2.6 }));
  p.push(S.ci(140, 196, 11, { fill: '#1d4ed8', stroke: '#1d4ed8' }));
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; p.push(S.rc(140 + 26 * Math.cos(a) - 4, 196 + 26 * Math.sin(a) - 4, 8, 8, { fill: '#fff', stroke: '#1d4ed8', sw: 1.2, rx: 2 })); }
  p.push(S.txt(140, 264, '曳引轮（绳槽剖面）', { size: 11.5, fill: '#1d4ed8' }));
  // 减速箱 + 电动机 + 制动器
  p.push(S.rc(196, 172, 88, 48, { fill: '#bfdbfe', stroke: '#1d4ed8', sw: 2 }));
  p.push(S.txt(240, 200, '减速箱', { size: 11.5, fill: '#1e3a8a' }));
  p.push(S.rc(292, 164, 96, 64, { fill: '#dbeafe', stroke: '#1d4ed8', sw: 2.2, rx: 8 }));
  p.push(S.ci(340, 196, 20, { fill: '#fff', stroke: '#1d4ed8', sw: 1.8 }));
  p.push(S.ci(340, 196, 6, { fill: '#1d4ed8', stroke: '#1d4ed8' }));
  p.push(S.txt(340, 242, '电动机（定子/转子）', { size: 11, fill: '#1e3a8a' }));
  p.push(S.rc(196, 138, 88, 26, { fill: '#fee2e2', stroke: '#dc2626', sw: 1.8, rx: 5 }));
  p.push(S.txt(240, 156, '制动器（抱闸）', { size: 11, fill: '#b91c1c' }));
  // 动力输出方向
  p.push(S.ar(140, 120, 140, 96, { stroke: '#059669', w: 2.4, head: 9 }));
  p.push(S.txt(140, 90, '动力输出方向', { size: 11, fill: '#047857' }));
  // 控制柜分区
  p.push(S.rc(420, 150, 200, 182, { fill: '#e0e7ff', stroke: '#4f46e5', sw: 2.2, rx: 8 }));
  p.push(S.txt(520, 172, '控制柜', { size: 12.5, fill: '#3730a3' }));
  [['主控板', 190], ['变频器', 224], ['接触器/继电器', 258]].forEach(r => {
    p.push(S.rc(436, r[1], 168, 26, { fill: '#fff', stroke: '#a5b4fc', rx: 6 }));
    p.push(S.txt(520, r[1] + 18, r[0], { size: 11, fill: '#4338ca', weight: 600 }));
  });
  // 限速器 + 限速绳 + 导向轮
  p.push(S.ci(672, 120, 26, { fill: '#fee2e2', stroke: '#dc2626', sw: 2.2 }));
  p.push(S.ci(672, 120, 8, { fill: '#fecaca', stroke: '#dc2626' }));
  p.push(S.txt(672, 84, '限速器', { size: 11.5, fill: '#b91c1c' }));
  p.push(S.ln(672, 146, 672, 330, { stroke: '#475569', w: 2, dash: '7 5' }));
  p.push(S.txt(690, 240, '限速器绳', { anchor: 'start', size: 11, fill: '#64748b' }));
  p.push(S.ci(520, 108, 28, { fill: '#fff', stroke: '#0891b2', sw: 2.2 }));
  p.push(S.txt(520, 72, '导向轮', { size: 11.5, fill: '#0e7490' }));
  // 曳引绳下行至井道
  p.push(S.rope(120, 246, 120, 330));
  p.push(S.rope(160, 246, 160, 330));
  p.push(S.txt(96, 296, '曳引钢丝绳', { anchor: 'end', size: 11, fill: '#475569' }));
  p.push(S.rc(300, 356, 200, 56, { fill: '#ecfeff', stroke: '#0891b2', sw: 1.6, dash: '7 6', rx: 8 }));
  p.push(S.txt(400, 390, '↓ 通往井道空间', { size: 12, fill: '#0e7490' }));
  p.push(S.txt(400, 440, '曳引机 = 电动机 + 减速箱 + 曳引轮 + 制动器；控制柜分主控板 / 变频器 / 接触器三区。', { size: 11.5, fill: '#334155' }));
  p.push(S.txt(400, 464, '限速器绳下连井道底部张紧装置；导向轮改变绳走向并增大包角。', { size: 11.5, fill: '#64748b', weight: 500 }));
  return svgWrap(800, 490, p.join(''));
}

/* 2 井道空间全高剖面 */
function secHoistway() {
  const p = [];
  p.push(S.txt(400, 28, '井道空间全高剖面：导轨 · 轿厢 · 对重 · 底坑', { size: 14, fill: '#0e7490' }));
  p.push(S.rc(250, 40, 300, 400, { fill: '#f8fafc', stroke: '#94a3b8', sw: 2.2 }));
  // 轿厢导轨 / 对重导轨
  p.push(S.rc(268, 48, 14, 470, { fill: '#cbd5e1', stroke: '#64748b', sw: 1.4 }));
  p.push(S.rc(518, 48, 14, 470, { fill: '#cbd5e1', stroke: '#64748b', sw: 1.4 }));
  p.push(S.txt(275, 400, '轿厢导轨', { anchor: 'start', size: 11, fill: '#475569' }));
  p.push(S.txt(512, 400, '对重导轨', { anchor: 'end', size: 11, fill: '#475569' }));
  // 楼层线 + 层门
  [[150, '3F'], [270, '2F'], [390, '1F']].forEach(f => {
    p.push(S.ln(250, f[0], 550, f[0], { stroke: '#e2e8f0', w: 1.2, dash: '7 6' }));
    p.push(S.ln(550, f[0], 596, f[0], { stroke: '#059669', w: 4 }));
    p.push(S.txt(604, f[0] + 5, f[1], { anchor: 'start', size: 11, fill: '#047857' }));
  });
  // 轿厢 + 导靴
  p.push(S.rc(300, 200, 150, 120, { fill: '#dbeafe', stroke: '#1d4ed8', sw: 2.2 }));
  p.push(S.txt(375, 264, '轿厢', { size: 14, fill: '#1e3a8a' }));
  p.push(S.rc(286, 214, 14, 24, { fill: '#fcd34d', stroke: '#b45309', sw: 1.4 }));
  p.push(S.rc(286, 296, 14, 24, { fill: '#fcd34d', stroke: '#b45309', sw: 1.4 }));
  p.push(S.rc(450, 214, 14, 24, { fill: '#fcd34d', stroke: '#b45309', sw: 1.4 }));
  p.push(S.rc(450, 296, 14, 24, { fill: '#fcd34d', stroke: '#b45309', sw: 1.4 }));
  p.push(S.txt(283, 340, '导靴', { anchor: 'end', size: 11, fill: '#b45309' }));
  // 对重 + 对重块
  p.push(S.rc(470, 150, 60, 150, { fill: '#fef3c7', stroke: '#b45309', sw: 2 }));
  for (let i = 0; i < 4; i++) p.push(S.ln(474, 176 + i * 32, 526, 176 + i * 32, { stroke: '#d97706', w: 6 }));
  p.push(S.txt(500, 144, '对重块', { size: 11, fill: '#b45309' }));
  // 曳引绳（连至顶部机房）
  p.push(S.ln(340, 40, 340, 200, { stroke: '#94a3b8', w: 2, dash: '5 4' }));
  p.push(S.txt(356, 60, '↕ 通往机房曳引轮', { anchor: 'start', size: 11, fill: '#64748b' }));
  // 随行电缆
  p.push('<path d="M320 320 Q 240 380 292 424" fill="none" stroke="#475569" stroke-width="2.2" stroke-dasharray="7 4"/>');
  p.push(S.txt(232, 372, '随行电缆', { anchor: 'end', size: 11, fill: '#475569' }));
  // 底坑：缓冲器 + 张紧装置 + 限速器绳
  p.push(S.ln(250, 424, 550, 424, { stroke: '#5eead4', w: 1.6, dash: '8 6' }));
  p.push(S.txt(400, 442, '底坑（并入井道空间）', { size: 11, fill: '#047857' }));
  const buf = cx => S.rc(cx - 24, 456, 48, 22, { fill: '#dc2626', stroke: '#991b1b', sw: 1.6 }) +
    [0, 1, 2].map(i => S.ln(cx - 16, 464 + i * 6, cx + 16, 464 + i * 6, { stroke: '#fca5a5', w: 2 })).join('');
  p.push(buf(320)); p.push(buf(480));
  p.push(S.txt(320, 450, '轿厢缓冲器', { size: 11, fill: '#b91c1c' }));
  p.push(S.txt(480, 450, '对重缓冲器', { size: 11, fill: '#b91c1c' }));
  p.push(S.ci(600, 470, 16, { fill: '#e0f2fe', stroke: '#0e7490', sw: 2 }));
  p.push(S.rc(582, 486, 36, 30, { fill: '#a7f3d0', stroke: '#047857', sw: 1.6 }));
  p.push(S.txt(600, 534, '限速绳张紧装置', { size: 11, fill: '#047857' }));
  // 载荷传递路径
  p.push(S.rc(600, 150, 180, 200, { fill: '#fff', stroke: '#cbd5e1', sw: 1.6, rx: 10 }));
  p.push(S.txt(690, 176, '载荷传递路径', { size: 12.5, fill: '#1e3a8a' }));
  ['轿厢+载荷', '↓ 导靴/导轨', '↓ 轿厢导轨', '↓ 导轨支架', '↓ 井道壁/基础'].forEach((s, i) => {
    p.push(S.txt(616, 206 + i * 30, s, { anchor: 'start', size: 11, fill: '#334155', weight: 600 }));
  });
  p.push(S.txt(400, 470, '井道自顶部贯通至底坑；底坑设轿厢/对重缓冲器与限速绳张紧装置。', { size: 11.5, fill: '#334155' }));
  return svgWrap(800, 560, p.join(''));
}

/* 3 轿厢空间剖面 */
function secCar() {
  const p = [];
  p.push(S.txt(400, 30, '轿厢结构剖面：轿厢架 · 绳头组合 · 导靴', { size: 14, fill: '#5b21b6' }));
  // 上梁
  p.push(S.rc(180, 70, 420, 22, { fill: '#c7d2fe', stroke: '#4f46e5', sw: 2.2, rx: 5 }));
  p.push(S.txt(390, 62, '轿厢架上梁', { size: 12, fill: '#3730a3' }));
  // 下梁
  p.push(S.rc(180, 400, 420, 22, { fill: '#c7d2fe', stroke: '#4f46e5', sw: 2.2, rx: 5 }));
  p.push(S.txt(390, 440, '轿厢架下梁', { size: 12, fill: '#3730a3' }));
  // 立柱
  p.push(S.rc(190, 92, 18, 308, { fill: '#a5b4fc', stroke: '#4f46e5', sw: 2 }));
  p.push(S.rc(572, 92, 18, 308, { fill: '#a5b4fc', stroke: '#4f46e5', sw: 2 }));
  p.push(S.txt(120, 250, '立柱', { anchor: 'end', size: 12, fill: '#3730a3' }));
  // 轿壁 / 轿底
  p.push(S.rc(212, 100, 356, 268, { fill: '#f5f3ff', stroke: '#7c3aed', sw: 2 }));
  p.push(S.txt(390, 250, '轿壁', { size: 13, fill: '#6d28d9' }));
  p.push(S.rc(212, 368, 356, 24, { fill: '#ddd6fe', stroke: '#7c3aed', sw: 1.6 }));
  p.push(S.txt(250, 386, '轿底 / 地板', { anchor: 'start', size: 11, fill: '#5b21b6' }));
  // 绳头组合（压簧特写）
  p.push(S.rope(390, 40, 390, 70));
  p.push(S.rc(360, 34, 60, 16, { fill: '#fde68a', stroke: '#b45309', sw: 1.8, rx: 4 }));
  p.push(S.txt(390, 28, '绳头组合（吊挂点）', { size: 11.5, fill: '#b45309' }));
  p.push(S.rc(374, 70, 32, 26, { fill: '#fde68a', stroke: '#b45309', sw: 1.8, rx: 4 }));
  for (let i = 0; i < 3; i++) p.push(S.ln(378, 78 + i * 6, 402, 78 + i * 6, { stroke: '#b45309', w: 1.6 }));
  p.push(S.txt(452, 84, '压簧（均衡/缓冲）', { anchor: 'start', size: 11, fill: '#b45309' }));
  // 导靴（贴导轨）
  p.push(S.ln(120, 120, 190, 120, { stroke: '#94a3b8', w: 4 }));
  p.push(S.ln(120, 372, 190, 372, { stroke: '#94a3b8', w: 4 }));
  p.push(S.rc(150, 104, 20, 32, { fill: '#fcd34d', stroke: '#b45309', sw: 1.6 }));
  p.push(S.rc(150, 356, 20, 32, { fill: '#fcd34d', stroke: '#b45309', sw: 1.6 }));
  p.push(S.txt(108, 200, '导轨', { anchor: 'end', size: 11, fill: '#475569' }));
  p.push(S.txt(108, 250, '导靴', { anchor: 'end', size: 11, fill: '#b45309' }));
  // 传力路径标注
  p.push(S.rc(560, 150, 210, 200, { fill: '#fff', stroke: '#cbd5e1', sw: 1.6, rx: 10 }));
  p.push(S.txt(665, 176, '吊挂点与传力路径', { size: 12, fill: '#5b21b6' }));
  ['绳头组合 → 上梁', '上梁 → 立柱', '立柱 → 下梁', '下梁 → 轿底/载荷'].forEach((s, i) => {
    p.push(S.txt(576, 208 + i * 32, '· ' + s, { anchor: 'start', size: 11, fill: '#334155', weight: 600 }));
  });
  p.push(S.txt(400, 470, '轿厢自重 P 与载荷 Q 全部经绳头组合由曳引钢丝绳吊挂；导靴约束水平位移。', { size: 11.5, fill: '#334155' }));
  return svgWrap(800, 500, p.join(''));
}

/* 4 层站空间剖面 */
function secLanding() {
  const p = [];
  p.push(S.txt(400, 30, '层站结构剖面：层门 · 门锁 · 召唤箱 · 层楼显示', { size: 14, fill: '#047857' }));
  // 井道侧 + 轿厢
  p.push(S.rc(70, 60, 180, 340, { fill: '#f8fafc', stroke: '#94a3b8', sw: 2 }));
  p.push(S.txt(160, 84, '井道', { size: 11.5, fill: '#0e7490' }));
  p.push(S.rc(100, 180, 120, 150, { fill: '#dbeafe', stroke: '#1d4ed8', sw: 2 }));
  p.push(S.txt(160, 258, '轿厢', { size: 13, fill: '#1e3a8a' }));
  // 层门（中分双扇，闭合）
  p.push(S.rc(272, 130, 116, 270, { fill: '#dcfce7', stroke: '#059669', sw: 2.2 }));
  p.push(S.rc(388, 130, 116, 270, { fill: '#dcfce7', stroke: '#059669', sw: 2.2 }));
  p.push(S.txt(330, 300, '层门 L', { size: 11, fill: '#065f46' }));
  p.push(S.txt(446, 300, '层门 R', { size: 11, fill: '#065f46' }));
  // 门锁（锁钩 + 触点）剖视
  p.push(S.rc(508, 150, 92, 60, { fill: '#fee2e2', stroke: '#dc2626', sw: 2, rx: 8 }));
  p.push(S.txt(554, 174, '层门门锁', { size: 11, fill: '#b91c1c' }));
  p.push(S.txt(554, 192, '锁钩 + 电气触点', { size: 11, fill: '#b91c1c' }));
  p.push(S.ln(504, 180, 470, 180, { stroke: '#dc2626', w: 1.8, dash: '4 3' }));
  p.push(S.txt(554, 232, '联锁：未锁闭禁止运行', { size: 11, fill: '#b91c1c' }));
  // 地坎 + 门滑块
  p.push(S.ln(272, 400, 504, 400, { stroke: '#78716c', w: 5 }));
  p.push(S.rc(360, 396, 30, 12, { fill: '#a8a29e', stroke: '#57534e', sw: 1.4 }));
  p.push(S.txt(600, 404, '地坎 + 门滑块', { anchor: 'start', size: 11, fill: '#57534e' }));
  // 层楼显示 + 召唤箱
  p.push(S.rc(600, 120, 120, 54, { fill: '#0f172a', stroke: '#334155', rx: 8 }));
  p.push(S.txt(660, 154, '3F ▲', { size: 15, fill: '#7dd3fc' }));
  p.push(S.txt(660, 106, '层楼显示 / 到站灯', { size: 11, fill: '#334155' }));
  p.push(S.rc(600, 220, 90, 96, { fill: '#e0e7ff', stroke: '#1d4ed8', rx: 8 }));
  p.push(S.ci(645, 250, 16, { fill: '#dcfce7', stroke: '#059669', sw: 1.6 }));
  p.push(S.txt(645, 255, '▲', { size: 12, fill: '#059669' }));
  p.push(S.ci(645, 292, 16, { fill: '#fee2e2', stroke: '#dc2626', sw: 1.6 }));
  p.push(S.txt(645, 297, '▼', { size: 12, fill: '#dc2626' }));
  p.push(S.txt(660, 208, '层站召唤箱（外呼）', { size: 11, fill: '#1e3a8a' }));
  // 门套
  p.push(S.rc(254, 118, 16, 290, { fill: '#e2e8f0', stroke: '#64748b', sw: 1.6 }));
  p.push(S.rc(506, 118, 16, 290, { fill: '#e2e8f0', stroke: '#64748b', sw: 1.6 }));
  p.push(S.txt(400, 440, '层门全宽封闭井道口；门锁电气联锁保证层门锁闭后电梯才可运行。', { size: 11.5, fill: '#334155' }));
  p.push(S.txt(400, 464, '地坎与门滑块防止门扇脱轨；召唤箱采集外呼信号，层楼显示当前楼层与方向。', { size: 11.5, fill: '#64748b', weight: 500 }));
  return svgWrap(800, 490, p.join(''));
}

/* 5 曳引系统剖面（绳槽特写 + 绕法对照） */
function secTraction() {
  const p = [];
  p.push(S.txt(400, 28, '曳引系统剖面：绳槽特写 · 包角 α · T₁/T₂ · 绕法对照', { size: 13.5, fill: '#1e3a8a' }));
  // 左：绳槽剖面特写（V 形 / 带切口半圆槽）
  p.push(S.rc(30, 48, 360, 200, { fill: '#f8fafc', stroke: '#cbd5e1', sw: 1.6, rx: 10 }));
  p.push(S.txt(210, 72, '绳槽剖面特写', { size: 12.5, fill: '#334155' }));
  // V 形槽
  p.push(S.pg([[80, 210], [150, 130], [166, 138], [96, 218]], { fill: '#e0e7ff', stroke: '#1d4ed8', sw: 2 }));
  p.push(S.ci(123, 174, 7, { fill: '#475569', stroke: '#334155', sw: 1.4 }));
  p.push(S.txt(123, 240, 'V 形槽（摩擦大）', { size: 11, fill: '#1d4ed8' }));
  // 带切口半圆槽
  p.push(S.pg([[220, 150], [300, 150], [300, 200], [272, 218], [248, 200], [248, 168], [220, 168]], { fill: '#e0e7ff', stroke: '#1d4ed8', sw: 2 }));
  p.push(S.ci(274, 184, 8, { fill: '#475569', stroke: '#334155', sw: 1.4 }));
  p.push(S.txt(274, 240, '带切口半圆槽（兼顾寿命）', { size: 11, fill: '#1d4ed8' }));
  // 右：曳引轮 + 包角 + T1/T2
  p.push(S.ci(600, 150, 56, { fill: '#e0e7ff', stroke: '#1d4ed8', sw: 2.6 }));
  p.push(S.ci(600, 150, 10, { fill: '#1d4ed8', stroke: '#1d4ed8' }));
  p.push('<path d="M544 150 A 56 56 0 0 1 656 150" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="5 4"/>');
  p.push(S.txt(600, 240, '包角 α（绕绳包围角）', { size: 11.5, fill: '#b91c1c' }));
  p.push(S.rope(544, 150, 544, 214)); p.push(S.rope(656, 150, 656, 214));
  p.push(S.txt(528, 200, 'T₁（重侧）', { size: 11, fill: '#b91c1c' }));
  p.push(S.txt(672, 200, 'T₂（轻侧）', { size: 11, fill: '#047857', anchor: 'start' }));
  // 公式
  p.push(S.rc(470, 260, 300, 56, { fill: '#0f172a', stroke: '#0f172a', rx: 10 }));
  p.push(S.txt(620, 284, 'T₁ / T₂ ≤ e^(f·α)', { size: 14, fill: '#7dd3fc' }));
  p.push(S.txt(620, 306, '超限 → 钢丝绳打滑，失去提升能力', { size: 11, fill: '#fca5a5', weight: 500 }));
  // 底部：绕法 1:1 与 2:1 对照
  p.push(S.txt(210, 300, '绕法对照', { size: 12.5, fill: '#334155' }));
  // 1:1
  p.push(S.ci(150, 360, 26, { fill: '#fff', stroke: '#1d4ed8', sw: 2.2 }));
  p.push(S.ci(150, 360, 6, { fill: '#1d4ed8', stroke: '#1d4ed8' }));
  p.push(S.rc(120, 400, 60, 34, { fill: '#dbeafe', stroke: '#1d4ed8', sw: 1.8 }));
  p.push(S.txt(150, 452, '1:1 绕法', { size: 11.5, fill: '#1e3a8a' }));
  p.push(S.txt(150, 470, '轿厢速度 = 绳速', { size: 11, fill: '#475569', weight: 500 }));
  // 2:1
  p.push(S.ci(360, 350, 22, { fill: '#fff', stroke: '#1d4ed8', sw: 2.2 }));
  p.push(S.ci(360, 350, 5, { fill: '#1d4ed8', stroke: '#1d4ed8' }));
  p.push(S.txt(360, 322, '曳引轮', { size: 11, fill: '#64748b' }));
  p.push(S.ci(360, 412, 18, { fill: '#fff', stroke: '#b45309', sw: 2 }));
  p.push(S.txt(360, 448, '轿厢反绳轮', { size: 11, fill: '#b45309' }));
  p.push(S.rc(332, 432, 56, 30, { fill: '#dbeafe', stroke: '#1d4ed8', sw: 1.8 }));
  p.push(S.txt(360, 478, '2:1 绕法', { size: 11.5, fill: '#1e3a8a' }));
  p.push(S.txt(360, 496, '轿厢速度 = 绳速 ÷ 2', { size: 11, fill: '#475569', weight: 500 }));
  p.push(S.txt(620, 360, '曳引力受欧拉公式约束：', { anchor: 'start', size: 11.5, fill: '#334155' }));
  p.push(S.txt(620, 386, '· 增大包角 α 或摩擦系数 f', { anchor: 'start', size: 11, fill: '#475569', weight: 500 }));
  p.push(S.txt(620, 410, '· 或改用 2:1 绕法减小拉力比', { anchor: 'start', size: 11, fill: '#475569', weight: 500 }));
  p.push(S.txt(620, 434, '· 均可避免打滑、提升载重能力', { anchor: 'start', size: 11, fill: '#475569', weight: 500 }));
  return svgWrap(800, 520, p.join(''));
}

/* 6 导向系统剖面 */
function secGuide() {
  const p = [];
  p.push(S.txt(400, 30, '导向系统剖面：T 型导轨 · 导靴 · 偏载力矩', { size: 14, fill: '#0e7490' }));
  // T 型导轨剖面放大
  p.push(S.rc(40, 54, 300, 220, { fill: '#f8fafc', stroke: '#cbd5e1', sw: 1.6, rx: 10 }));
  p.push(S.txt(190, 78, 'T 型导轨剖面', { size: 12.5, fill: '#334155' }));
  p.push(S.pg([[120, 120], [250, 120], [250, 150], [204, 150], [204, 250], [166, 250], [166, 150], [120, 150]], { fill: '#cbd5e1', stroke: '#475569', sw: 2 }));
  p.push(S.txt(135, 112, '顶面', { size: 11, fill: '#475569' }));
  p.push(S.txt(262, 200, '两侧工作面', { size: 11, fill: '#475569', anchor: 'start' }));
  p.push(S.txt(185, 200, '导轨本体', { size: 11, fill: '#475569' }));
  // 导轨支架
  p.push(S.rc(250, 176, 70, 16, { fill: '#94a3b8', stroke: '#475569', sw: 1.6 }));
  p.push(S.txt(320, 190, '导轨支架', { anchor: 'start', size: 11, fill: '#475569' }));
  // 右：导靴 + 偏载力矩
  p.push(S.rc(400, 54, 370, 220, { fill: '#f8fafc', stroke: '#cbd5e1', sw: 1.6, rx: 10 }));
  p.push(S.txt(585, 78, '导靴约束与偏载力矩', { size: 12.5, fill: '#334155' }));
  p.push(S.rc(470, 130, 22, 100, { fill: '#cbd5e1', stroke: '#475569', sw: 2 }));
  p.push(S.txt(481, 118, '导轨', { size: 11, fill: '#475569' }));
  // 滑动导靴 / 滚动导靴
  p.push(S.rc(500, 140, 40, 34, { fill: '#fcd34d', stroke: '#b45309', sw: 2 }));
  p.push(S.txt(560, 162, '滑动导靴', { anchor: 'start', size: 11, fill: '#b45309' }));
  p.push(S.rc(500, 190, 40, 34, { fill: '#fcd34d', stroke: '#b45309', sw: 2 }));
  p.push(S.ci(508, 207, 6, { fill: '#fff', stroke: '#b45309', sw: 1.4 }));
  p.push(S.ci(532, 207, 6, { fill: '#fff', stroke: '#b45309', sw: 1.4 }));
  p.push(S.txt(560, 214, '滚动导靴', { anchor: 'start', size: 11, fill: '#b45309' }));
  // 偏载 + 反力
  p.push(S.rc(560, 130, 180, 96, { fill: '#dbeafe', stroke: '#1d4ed8', sw: 2 }));
  p.push(S.txt(650, 180, '轿厢', { size: 12, fill: '#1e3a8a' }));
  p.push(S.ar(560, 158, 508, 158, { stroke: '#dc2626', w: 2.6, head: 9 }));
  p.push(S.txt(534, 148, '偏载 P', { size: 11, fill: '#b91c1c' }));
  p.push(S.ar(742, 140, 700, 140, { stroke: '#059669', w: 2, head: 8 }));
  p.push(S.ar(742, 220, 700, 220, { stroke: '#059669', w: 2, head: 8 }));
  p.push(S.txt(748, 180, 'F', { size: 11, fill: '#047857', anchor: 'start' }));
  // 底部要点
  p.push(S.txt(80, 320, '偏载产生倾覆力矩 M = P × e', { anchor: 'start', size: 12.5, fill: '#b91c1c' }));
  p.push(S.txt(80, 346, '由上下两对导靴以反力 F = M / L 平衡', { anchor: 'start', size: 11.5, fill: '#475569', weight: 500 }));
  p.push(S.txt(80, 372, '导轨约束轿厢水平位移与扭转，保证垂直运行', { anchor: 'start', size: 11.5, fill: '#475569', weight: 500 }));
  p.push(S.rc(430, 400, 340, 80, { fill: '#ecfdf5', stroke: '#059669', sw: 1.6, rx: 10 }));
  p.push(S.txt(600, 426, '导靴类型', { size: 12, fill: '#065f46' }));
  p.push(S.txt(600, 450, '滑动导靴刚度大；滚动导靴摩擦小、噪音低', { size: 11, fill: '#047857', weight: 500 }));
  p.push(S.txt(600, 470, '导轨接头须错开并平滑过渡，避免运行台阶', { size: 11, fill: '#047857', weight: 500 }));
  return svgWrap(800, 500, p.join(''));
}

/* 7 轿厢系统剖面（传力路径） */
function secCarSystem() {
  const p = [];
  p.push(S.txt(400, 30, '轿厢系统剖面：载荷传力路径', { size: 14, fill: '#5b21b6' }));
  const step = (x, y, label, sub, c) => S.rc(x, y, 200, 62, { fill: c.bg, stroke: c.st, sw: 2 }) +
    S.txt(x + 100, y + 26, label, { size: 12.5, fill: c.tx }) +
    S.txt(x + 100, y + 46, sub, { size: 11, fill: c.tx, weight: 500 });
  const A = { bg: '#dbeafe', st: '#1d4ed8', tx: '#1e3a8a' };
  const B = { bg: '#e0e7ff', st: '#4f46e5', tx: '#3730a3' };
  const Cc = { bg: '#fef3c7', st: '#b45309', tx: '#92400e' };
  const D = { bg: '#dcfce7', st: '#059669', tx: '#065f46' };
  // 传力链：轿底 → 下梁(弯矩) → 立柱(轴力) → 上梁 → 绳头组合 → 绳
  p.push(step(40, 70, '轿底 / 地板', '直接承载 P + Q', A));
  p.push(step(300, 70, '轿厢架下梁', '承受弯曲（弯矩）', B));
  p.push(step(560, 70, '立柱（两侧）', '承受拉/压（轴力）', B));
  p.push(step(300, 200, '轿厢架上梁', '承受集中吊挂载荷', B));
  p.push(step(560, 200, '绳头组合', '压簧均衡 + 缓冲', Cc));
  p.push(step(300, 340, '曳引钢丝绳', '传递至曳引轮', D));
  // 箭头连接
  p.push(S.ar(240, 101, 300, 101, { stroke: '#4f46e5' }));
  p.push(S.ar(500, 101, 560, 101, { stroke: '#4f46e5' }));
  p.push(S.ar(660, 132, 660, 200, { stroke: '#4f46e5' }));
  p.push(S.ar(560, 231, 500, 231, { stroke: '#b45309' }));
  p.push(S.ar(560, 262, 500, 340, { stroke: '#059669' }));
  // 立柱→上梁虚线
  p.push(S.ci(360, 168, 7, { fill: '#4f46e5', stroke: 'none' }));
  p.push('<path d="M360 168 L360 200 L300 231" stroke="#4f46e5" stroke-width="1.6" fill="none" stroke-dasharray="5 4"/>');
  p.push(S.txt(372, 186, '立柱 → 上梁', { anchor: 'start', size: 11, fill: '#4f46e5', weight: 500 }));
  // 说明框
  p.push(S.rc(40, 340, 200, 120, { fill: '#f1f5f9', stroke: '#cbd5e1', sw: 1.6, rx: 10 }));
  p.push(S.txt(140, 366, '受力特点', { size: 12, fill: '#334155' }));
  p.push(S.txt(52, 392, '· 下梁：弯曲（弯矩）', { anchor: 'start', size: 11, fill: '#334155', weight: 500 }));
  p.push(S.txt(52, 416, '· 立柱：轴向拉/压', { anchor: 'start', size: 11, fill: '#334155', weight: 500 }));
  p.push(S.txt(52, 440, '· 钢丝绳安全系数 ≥ 12', { anchor: 'start', size: 11, fill: '#b91c1c', weight: 500 }));
  p.push(S.txt(400, 480, '传力路径：轿底 → 下梁 → 立柱 → 上梁 → 绳头组合 → 曳引钢丝绳，载荷全部由绳吊挂。', { size: 11.5, fill: '#334155' }));
  return svgWrap(800, 500, p.join(''));
}

/* 8 门系统剖面 */
function secDoor() {
  const p = [];
  p.push(S.txt(400, 30, '门系统剖面：门刀 · 门锁滚轮 · 门机 · 光幕', { size: 14, fill: '#be185d' }));
  // 门机
  p.push(S.rc(300, 52, 200, 44, { fill: '#fed7aa', stroke: '#ea580c', sw: 2, rx: 8 }));
  p.push(S.txt(400, 80, '门机（变频驱动）', { size: 12, fill: '#9a3412' }));
  p.push(S.ln(340, 96, 340, 120, { stroke: '#ea580c', w: 2.4 }));
  p.push(S.ln(460, 96, 460, 120, { stroke: '#ea580c', w: 2.4 }));
  // 轿门
  p.push(S.rc(250, 120, 148, 32, { fill: '#e0f2fe', stroke: '#0e7490', sw: 2.2 }));
  p.push(S.rc(402, 120, 148, 32, { fill: '#e0f2fe', stroke: '#0e7490', sw: 2.2 }));
  p.push(S.txt(324, 142, '轿门', { size: 11.5, fill: '#0e7490' }));
  p.push(S.txt(476, 142, '轿门', { size: 11.5, fill: '#0e7490' }));
  // 门刀 + 门锁滚轮配合
  p.push(S.rc(392, 168, 16, 28, { fill: '#dc2626', stroke: '#991b1b', sw: 1.8 }));
  p.push(S.txt(400, 188, '门刀', { size: 11, fill: '#fff' }));
  p.push(S.ci(372, 152, 9, { fill: '#fcd34d', stroke: '#b45309', sw: 1.6 }));
  p.push(S.ci(428, 152, 9, { fill: '#fcd34d', stroke: '#b45309', sw: 1.6 }));
  p.push('<path d="M392 168 L372 160" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4 3"/>');
  p.push('<path d="M408 168 L428 160" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4 3"/>');
  p.push(S.txt(400, 216, '门刀夹持门锁滚轮 → 轿门、层门同步', { size: 11, fill: '#475569' }));
  // 层门
  p.push(S.rc(250, 250, 148, 32, { fill: '#dcfce7', stroke: '#059669', sw: 2.2 }));
  p.push(S.rc(402, 250, 148, 32, { fill: '#dcfce7', stroke: '#059669', sw: 2.2 }));
  p.push(S.txt(324, 272, '层门', { size: 11.5, fill: '#065f46' }));
  p.push(S.txt(476, 272, '层门', { size: 11.5, fill: '#065f46' }));
  // 门锁（锁钩 + 触点）
  p.push(S.rc(556, 244, 92, 46, { fill: '#fee2e2', stroke: '#dc2626', sw: 2, rx: 8 }));
  p.push(S.txt(602, 262, '门锁', { size: 11, fill: '#b91c1c' }));
  p.push(S.txt(602, 280, '锁钩 + 触点', { size: 11, fill: '#b91c1c' }));
  p.push(S.ln(550, 266, 500, 266, { stroke: '#dc2626', w: 1.8, dash: '4 3' }));
  p.push(S.txt(602, 306, '联锁：未锁闭禁止运行', { size: 11, fill: '#b91c1c' }));
  // 光幕 / 安全触板
  p.push(S.rc(250, 320, 300, 44, { fill: '#f0fdf4', stroke: '#86efac', sw: 1.8, rx: 10 }));
  p.push(S.txt(400, 347, '光幕 / 安全触板：检测障碍即反转开门', { size: 11.5, fill: '#047857' }));
  p.push(S.ln(300, 296, 300, 320, { stroke: '#ef4444', w: 2, dash: '5 4' }));
  p.push(S.ln(500, 296, 500, 320, { stroke: '#ef4444', w: 2, dash: '5 4' }));
  // 地坎 + 滑块
  p.push(S.ln(240, 292, 560, 292, { stroke: '#78716c', w: 4 }));
  p.push(S.txt(600, 296, '地坎 + 门滑块（导向）', { anchor: 'start', size: 11, fill: '#57534e' }));
  p.push(S.txt(400, 400, '门锁电气联锁是强制要求：任一扇层门未锁闭，电梯不得运行或立即停止。', { size: 11.5, fill: '#334155' }));
  p.push(S.txt(400, 424, '门机采用变频控制实现慢—快—慢速度曲线，减小冲击；光幕响应快、防护面宽。', { size: 11.5, fill: '#64748b', weight: 500 }));
  return svgWrap(800, 460, p.join(''));
}

/* 9 重量平衡系统剖面 */
function secBalance() {
  const p = [];
  p.push(S.txt(400, 30, '重量平衡系统剖面：对重块 · 对重架 · 补偿装置', { size: 13.5, fill: '#b45309' }));
  // 左：对重块压紧特写
  p.push(S.rc(40, 50, 340, 240, { fill: '#f8fafc', stroke: '#cbd5e1', sw: 1.6, rx: 10 }));
  p.push(S.txt(210, 74, '对重块压紧特写', { size: 12.5, fill: '#334155' }));
  p.push(S.rc(150, 96, 120, 170, { fill: '#fef3c7', stroke: '#b45309', sw: 2.2 }));
  for (let i = 0; i < 5; i++) p.push(S.ln(154, 122 + i * 30, 266, 122 + i * 30, { stroke: '#d97706', w: 7 }));
  p.push(S.txt(210, 200, '对重块', { size: 12, fill: '#b45309' }));
  // 压紧螺栓/压板
  p.push(S.rc(140, 88, 140, 12, { fill: '#94a3b8', stroke: '#475569', sw: 1.6 }));
  p.push(S.ln(160, 88, 160, 74, { stroke: '#475569', w: 2.4 }));
  p.push(S.ln(260, 88, 260, 74, { stroke: '#475569', w: 2.4 }));
  p.push(S.txt(210, 300, '压板 + 螺栓可靠压紧，防窜动', { size: 11, fill: '#475569' }));
  // 对重架
  p.push(S.txt(210, 288, '对重架（钢制框架）', { size: 11, fill: '#334155' }));
  // 右：对重架 + 导靴 + 绳连接
  p.push(S.rc(420, 50, 350, 240, { fill: '#f8fafc', stroke: '#cbd5e1', sw: 1.6, rx: 10 }));
  p.push(S.txt(595, 74, '对重装置连接', { size: 12.5, fill: '#334155' }));
  p.push(S.rope(595, 88, 595, 130));
  p.push(S.rc(560, 130, 70, 14, { fill: '#fde68a', stroke: '#b45309', sw: 1.6 }));
  p.push(S.txt(595, 122, '绳头组合', { size: 11, fill: '#b45309' }));
  p.push(S.rc(500, 150, 190, 110, { fill: '#fef3c7', stroke: '#b45309', sw: 2 }));
  p.push(S.txt(595, 210, '对重架 + 对重块', { size: 11.5, fill: '#92400e' }));
  p.push(S.rc(486, 170, 14, 26, { fill: '#fcd34d', stroke: '#b45309', sw: 1.4 }));
  p.push(S.rc(486, 220, 14, 26, { fill: '#fcd34d', stroke: '#b45309', sw: 1.4 }));
  p.push(S.txt(478, 200, '对重导靴', { anchor: 'end', size: 11, fill: '#b45309' }));
  // 补偿链/绳 + 张紧装置
  p.push(S.rc(40, 320, 730, 120, { fill: '#eff6ff', stroke: '#3b82f6', sw: 1.6, rx: 10 }));
  p.push(S.txt(405, 346, '补偿链 / 补偿绳 与张紧装置', { size: 12.5, fill: '#1d4ed8' }));
  p.push(S.rc(90, 370, 120, 50, { fill: '#dbeafe', stroke: '#1d4ed8', sw: 1.8 }));
  p.push(S.txt(150, 400, '补偿链/绳', { size: 11, fill: '#1e3a8a' }));
  p.push(S.ar(210, 395, 260, 395, { stroke: '#1d4ed8', w: 2, head: 8 }));
  p.push(S.ci(300, 395, 22, { fill: '#e0f2fe', stroke: '#0e7490', sw: 2 }));
  p.push(S.txt(300, 442, '张紧轮', { size: 11, fill: '#0e7490' }));
  p.push(S.rc(360, 372, 130, 46, { fill: '#a7f3d0', stroke: '#047857', sw: 1.8 }));
  p.push(S.txt(425, 400, '张紧装置（底坑）', { size: 11, fill: '#047857' }));
  p.push(S.txt(640, 400, '提升高度 > 30 m 须设补偿装置', { anchor: 'start', size: 11, fill: '#b91c1c', weight: 600 }));
  p.push(S.txt(640, 424, '补偿绳/链重量与曳引绳匹配', { anchor: 'start', size: 11, fill: '#475569', weight: 500 }));
  return svgWrap(800, 470, p.join(''));
}

/* 10 电力拖动系统剖面 */
function secDrive() {
  const p = [];
  p.push(S.txt(400, 30, '电力拖动系统剖面：电动机 · 变频链路 · 编码器 · 制动器', { size: 13.5, fill: '#c2410c' }));
  // 左：电动机剖视（定子/转子）
  p.push(S.rc(40, 52, 250, 200, { fill: '#f8fafc', stroke: '#cbd5e1', sw: 1.6, rx: 10 }));
  p.push(S.txt(165, 76, '电动机剖视', { size: 12.5, fill: '#334155' }));
  p.push(S.ci(165, 160, 62, { fill: '#dbeafe', stroke: '#1d4ed8', sw: 2.4 }));
  p.push(S.ci(165, 160, 26, { fill: '#fff', stroke: '#1d4ed8', sw: 2 }));
  p.push(S.ci(165, 160, 7, { fill: '#1d4ed8', stroke: '#1d4ed8' }));
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; p.push(S.ln(165 + 30 * Math.cos(a), 160 + 30 * Math.sin(a), 165 + 58 * Math.cos(a), 160 + 58 * Math.sin(a), { stroke: '#60a5fa', w: 2 })); }
  p.push(S.txt(165, 240, '定子 + 转子（永磁同步）', { size: 11, fill: '#1e3a8a' }));
  // 中：变频器链路
  p.push(S.rc(320, 52, 250, 200, { fill: '#f8fafc', stroke: '#cbd5e1', sw: 1.6, rx: 10 }));
  p.push(S.txt(445, 76, '变频器链路 VVVF', { size: 12.5, fill: '#334155' }));
  const bx = (x, y, w, h, t, c) => S.rc(x, y, w, h, { fill: c.bg, stroke: c.st, sw: 1.8, rx: 6 }) + S.txt(x + w / 2, y + h / 2 + 4, t, { size: 11, fill: c.tx });
  const O = { bg: '#ffedd5', st: '#ea580c', tx: '#9a3412' }, G = { bg: '#f1f5f9', st: '#64748b', tx: '#334155' };
  p.push(bx(336, 100, 96, 44, '整流 AC→DC', O));
  p.push(bx(336, 164, 96, 44, '直流母线', G));
  p.push(bx(452, 100, 104, 44, '逆变 DC→AC', O));
  p.push(S.ar(384, 144, 384, 164, { stroke: '#64748b', w: 1.6, head: 7 }));
  p.push(S.ar(432, 122, 452, 122, { stroke: '#ea580c', w: 1.6, head: 7 }));
  p.push(S.txt(445, 232, '输出频率 / 电压可调', { size: 11, fill: '#475569' }));
  // 右：编码器 + 制动器
  p.push(S.rc(600, 52, 170, 200, { fill: '#f8fafc', stroke: '#cbd5e1', sw: 1.6, rx: 10 }));
  p.push(S.txt(685, 76, '反馈与制动', { size: 12.5, fill: '#334155' }));
  p.push(S.rc(620, 96, 130, 52, { fill: '#f1f5f9', stroke: '#64748b', sw: 1.8, rx: 6 }));
  p.push(S.txt(685, 118, '旋转编码器', { size: 11.5, fill: '#334155' }));
  p.push(S.txt(685, 136, '安装于电机轴', { size: 11, fill: '#64748b', weight: 500 }));
  p.push(S.rc(620, 168, 130, 52, { fill: '#fee2e2', stroke: '#dc2626', sw: 1.8, rx: 6 }));
  p.push(S.txt(685, 190, '制动器（抱闸）', { size: 11.5, fill: '#b91c1c' }));
  p.push(S.txt(685, 208, '失电抱闸防溜车', { size: 11, fill: '#b91c1c', weight: 500 }));
  // 底部闭环
  p.push(S.rc(40, 280, 730, 56, { fill: '#ecfdf5', stroke: '#059669', sw: 1.6, rx: 10 }));
  p.push(S.txt(405, 306, '速度闭环：主控给定 → 变频器 → 电动机 → 编码器反馈 → 校正（S 形曲线）', { size: 11.5, fill: '#047857' }));
  p.push(S.txt(405, 328, 'n = 60f(1−s)/p，改变频率 f 即可平滑调节电机转速', { size: 11, fill: '#047857', weight: 500 }));
  p.push(S.txt(400, 380, '永磁同步曳引机效率高、体积小，配合变频器实现低转速大转矩；抱闸须失电抱闸，是安全底线。', { size: 11.5, fill: '#334155' }));
  p.push(S.txt(400, 404, '制动电阻 / 能量回馈装置消耗或回收制动时产生的再生能量。', { size: 11.5, fill: '#64748b', weight: 500 }));
  return svgWrap(800, 440, p.join(''));
}

/* 11 电气控制系统剖面 */
function secControl() {
  const p = [];
  p.push(S.txt(400, 30, '电气控制系统剖面：主控板 · 安全回路 · 位置检测', { size: 13.5, fill: '#4338ca' }));
  // 主控板
  p.push(S.rc(300, 60, 200, 120, { fill: '#312e81', stroke: '#312e81', sw: 2, rx: 12 }));
  p.push(S.txt(400, 100, '主控板', { size: 15, fill: '#fff' }));
  p.push(S.txt(400, 124, '调度算法', { size: 11, fill: '#a5b4fc', weight: 500 }));
  p.push(S.txt(400, 146, '顺向截梯 / 最远优先', { size: 11, fill: '#c7d2fe', weight: 500 }));
  // 输入：位置检测
  p.push(S.rc(40, 60, 220, 120, { fill: '#eef2ff', stroke: '#6366f1', sw: 1.8, rx: 10 }));
  p.push(S.txt(150, 82, '位置检测', { size: 12, fill: '#3730a3' }));
  p.push(S.txt(52, 106, '· 旋转编码器（脉冲计数）', { anchor: 'start', size: 11, fill: '#3730a3', weight: 600 }));
  p.push(S.txt(52, 130, '· 平层感应器 / 隔磁板', { anchor: 'start', size: 11, fill: '#3730a3', weight: 600 }));
  p.push(S.txt(52, 154, '· 强迫换速开关', { anchor: 'start', size: 11, fill: '#3730a3', weight: 600 }));
  p.push(S.ar(260, 120, 300, 110, { stroke: '#6366f1' }));
  // 输出
  p.push(S.rc(540, 60, 220, 120, { fill: '#ecfdf5', stroke: '#10b981', sw: 1.8, rx: 10 }));
  p.push(S.txt(650, 82, '执行输出', { size: 12, fill: '#065f46' }));
  p.push(S.txt(552, 106, '· 变频器调速指令', { anchor: 'start', size: 11, fill: '#065f46', weight: 600 }));
  p.push(S.txt(552, 130, '· 制动器 / 门机控制', { anchor: 'start', size: 11, fill: '#065f46', weight: 600 }));
  p.push(S.txt(552, 154, '· 显示与语音报站', { anchor: 'start', size: 11, fill: '#065f46', weight: 600 }));
  p.push(S.ar(500, 110, 540, 120, { stroke: '#10b981' }));
  // 安全回路（串联触点）
  p.push(S.rc(60, 220, 680, 150, { fill: '#fef2f2', stroke: '#dc2626', sw: 1.8, rx: 12 }));
  p.push(S.txt(400, 246, '安全回路（串联）：任一触点断开 → 主接触器释放 → 立即停机', { size: 12.5, fill: '#b91c1c' }));
  const contacts = ['门锁触点', '限速器开关', '安全钳开关', '缓冲器开关', '急停开关'];
  contacts.forEach((s, i) => {
    const x = 84 + i * 132;
    p.push(S.rc(x, 268, 108, 44, { fill: '#fff', stroke: '#fca5a5', sw: 1.8, rx: 8 }));
    p.push(S.txt(x + 54, 295, s, { size: 11, fill: '#b91c1c', weight: 600 }));
    if (i < contacts.length - 1) p.push(S.ln(x + 108, 290, x + 132, 290, { stroke: '#dc2626', w: 2.4 }));
  });
  p.push(S.txt(400, 344, '串联链路：', { size: 11, fill: '#7f1d1d', weight: 600 }));
  p.push(S.txt(400, 362, '轿内操纵箱 · 层站召唤箱采集请求 → 主控板运算 → 闭环控制并输出显示', { size: 11, fill: '#7f1d1d', weight: 500 }));
  // 底部要点
  p.push(S.txt(120, 420, '位置控制：编码器计数为主 + 平层感应器校正为辅', { anchor: 'start', size: 11.5, fill: '#334155' }));
  p.push(S.txt(120, 444, '安全回路为串联回路，是电梯安全的核心保障', { anchor: 'start', size: 11.5, fill: '#334155' }));
  p.push(S.txt(120, 468, '检修状态下轿顶/轿内检修按钮可低速点动运行', { anchor: 'start', size: 11.5, fill: '#334155' }));
  return svgWrap(800, 500, p.join(''));
}

/* 12 安全保护系统剖面 */
function secSafety() {
  const p = [];
  p.push(S.txt(400, 30, '安全保护系统剖面：限速器 · 提拉机构 · 安全钳 · 缓冲器', { size: 13, fill: '#b91c1c' }));
  // 限速器（甩块 + 棘轮）
  p.push(S.rc(40, 52, 230, 180, { fill: '#f8fafc', stroke: '#cbd5e1', sw: 1.6, rx: 10 }));
  p.push(S.txt(155, 76, '限速器（甩块 + 棘轮）', { size: 12, fill: '#334155' }));
  p.push(S.ci(155, 140, 44, { fill: '#fee2e2', stroke: '#dc2626', sw: 2.4 }));
  p.push(S.ci(155, 140, 9, { fill: '#dc2626', stroke: '#dc2626' }));
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; p.push(S.ci(155 + 24 * Math.cos(a), 140 + 24 * Math.sin(a), 7, { fill: '#dc2626', stroke: '#dc2626' })); }
  p.push(S.txt(155, 208, '≥ 115% 额定速度动作', { size: 11, fill: '#b91c1c' }));
  // 提拉机构 + 安全钳楔块自锁剖面
  p.push(S.rc(300, 52, 460, 180, { fill: '#f8fafc', stroke: '#cbd5e1', sw: 1.6, rx: 10 }));
  p.push(S.txt(530, 76, '提拉机构 → 安全钳楔块自锁剖面', { size: 12, fill: '#334155' }));
  // 导轨
  p.push(S.rc(470, 96, 20, 120, { fill: '#cbd5e1', stroke: '#475569', sw: 2 }));
  p.push(S.txt(480, 92, '导轨', { size: 11, fill: '#475569' }));
  // 楔块（自锁）
  p.push(S.pg([[430, 150], [470, 138], [470, 182], [430, 170]], { fill: '#dc2626', stroke: '#991b1b', sw: 2 }));
  p.push(S.pg([[530, 138], [570, 150], [570, 170], [530, 182]], { fill: '#dc2626', stroke: '#991b1b', sw: 2 }));
  p.push(S.txt(500, 232, '楔块自锁夹紧导轨', { size: 11, fill: '#b91c1c' }));
  // 提拉连杆
  p.push(S.ln(300, 160, 430, 160, { stroke: '#b45309', w: 3 }));
  p.push(S.rc(356, 146, 34, 28, { fill: '#fde68a', stroke: '#b45309', sw: 1.8 }));
  p.push(S.txt(373, 138, '提拉机构', { size: 11, fill: '#b45309' }));
  p.push(S.ar(320, 128, 356, 148, { stroke: '#b45309', w: 1.6, head: 7 }));
  // 夹紧力
  p.push(S.ar(410, 160, 430, 160, { stroke: '#dc2626', w: 2.4, head: 8 }));
  p.push(S.ar(590, 160, 570, 160, { stroke: '#dc2626', w: 2.4, head: 8 }));
  p.push(S.txt(400, 152, 'N', { size: 11, fill: '#b91c1c' }));
  p.push(S.txt(600, 152, 'N', { size: 11, fill: '#b91c1c' }));
  // 缓冲器（弹簧/液压）
  p.push(S.rc(40, 260, 720, 120, { fill: '#eff6ff', stroke: '#3b82f6', sw: 1.6, rx: 10 }));
  p.push(S.txt(400, 286, '缓冲器（底坑）：吸收越位撞击动能', { size: 12.5, fill: '#1d4ed8' }));
  // 弹簧式
  p.push(S.rc(120, 306, 160, 56, { fill: '#fff', stroke: '#cbd5e1', sw: 1.6, rx: 8 }));
  p.push(S.txt(200, 328, '弹簧式（低速 ≤0.63 m/s）', { size: 11, fill: '#334155' }));
  for (let i = 0; i < 6; i++) p.push(`<path d="M${140 + i * 14} 348 l14 -10 l-14 20 l14 -10" fill="none" stroke="#3b82f6" stroke-width="2"/>`);
  // 液压式
  p.push(S.rc(320, 306, 160, 56, { fill: '#fff', stroke: '#cbd5e1', sw: 1.6, rx: 8 }));
  p.push(S.txt(400, 328, '液压式（高速，行程耗能）', { size: 11, fill: '#334155' }));
  p.push(S.rc(360, 322, 80, 26, { fill: '#dbeafe', stroke: '#1d4ed8', sw: 1.6, rx: 4 }));
  p.push(S.txt(400, 340, '油缸', { size: 11, fill: '#1e3a8a' }));
  // 公式
  p.push(S.rc(520, 306, 220, 56, { fill: '#0f172a', stroke: '#0f172a', rx: 8 }));
  p.push(S.txt(630, 330, 'E = ½·m·v²', { size: 13, fill: '#7dd3fc' }));
  p.push(S.txt(630, 350, '缓冲器吸收越位动能', { size: 11, fill: '#a5f3fc', weight: 500 }));
  p.push(S.txt(400, 412, '动作链：限速器超速 → 夹住限速绳 → 提拉机构 → 安全钳楔块自锁夹紧导轨 → 制停轿厢。', { size: 11.5, fill: '#334155' }));
  p.push(S.txt(400, 436, '终端三级保护：强迫换速 → 限位 → 极限，逐级拦截越位运行。', { size: 11.5, fill: '#64748b', weight: 500 }));
  return svgWrap(800, 460, p.join(''));
}

/* ======================= 剖面图表 ======================= */
const SECTIONALS = {
  'machine-room-section': secMachineRoom,
  'hoistway-section': secHoistway,
  'car-section': secCar,
  'landing-section': secLanding,
  'traction-section': secTraction,
  'guide-section': secGuide,
  'car-system-section': secCarSystem,
  'door-section': secDoor,
  'balance-section': secBalance,
  'drive-section': secDrive,
  'control-section': secControl,
  'safety-section': secSafety
};

function sectionalSvg(key) {
  const f = SECTIONALS[key];
  return f ? f() : '';
}

/* ======================= 调度总表 ======================= */
const SCHEMATICS = {
  'machine-room': scMachineRoom,
  'hoistway': scHoistway,
  'car': scCar,
  'landing': scLanding,
  'traction': scTraction,
  'guide': scGuide,
  'car-system': scCarSystem,
  'door': scDoor,
  'balance': scBalance,
  'drive': scDrive,
  'control': scControl,
  'safety': scSafety
};

function schematicSvg(key) {
  const f = SCHEMATICS[key];
  return f ? f() : '';
}
