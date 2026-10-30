import {loadCard,saveCard,uploadImage,imageUrl} from './storage.js';

(function(){
'use strict';

/* ============================================================
   常量 / 主题色（主色调 + 强调色可在面板调整）
   ============================================================ */
const W = 1080, H = 800, DPR = 2;

function hx(h){
  h = String(h || '#000000').replace('#', '');
  if(h.length === 3) h = h.split('').map(c => c + c).join('');
  return [parseInt(h.slice(0,2),16) || 0, parseInt(h.slice(2,4),16) || 0, parseInt(h.slice(4,6),16) || 0];
}
function toHex(a){
  return '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2,'0')).join('');
}
function mixA(c1, c2, t){          // t=0 → c1，t=1 → c2
  const a = hx(c1), b = hx(c2);
  return toHex([a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t, a[2] + (b[2]-a[2])*t]);
}
function rgba(c, a){
  const v = hx(c);
  return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + a + ')';
}

let PINK        = '#FF2D8A';   // 主色调
let PINK_DEEP   = '#E8206F';   // 主色调-深
let PINK_SOFT   = '#FFB3D5';   // 主色调-浅
let PINK_TINT   = '#FFE3F0';   // 主色调-极浅（背景）
let PINK_XLIGHT = '#FFF1F8';
let PINK_EDGE   = '#F0E6EE';   // 卡片描边
let YELLOW      = '#F2EF3A';   // 强调色
let YELLOW_TINT = '#FDFDF0';   // 强调色-极浅（卡片底）
let YELLOW_LINE = '#E9E9D2';   // 强调色-描边
let YELLOW_DEEP = '#E8E31E';   // 强调色-深（圆点）

function buildColors(){
  const t = state.theme  || '#FF2D8A';
  const a = state.accent || '#F2EF3A';
  PINK        = t;
  PINK_DEEP   = mixA(t, '#000000', 0.20);
  PINK_SOFT   = mixA(t, '#FFFFFF', 0.62);
  PINK_TINT   = mixA(t, '#FFFFFF', 0.90);
  PINK_XLIGHT = mixA(t, '#FFFFFF', 0.965);
  PINK_EDGE   = mixA(t, '#FFFFFF', 0.90);
  YELLOW      = a;
  YELLOW_TINT = mixA(a, '#FFFFFF', 0.955);
  YELLOW_LINE = mixA(a, '#FFFFFF', 0.80);
  YELLOW_DEEP = mixA(a, '#000000', 0.12);

  // 面板 CSS 变量联动
  const root = document.documentElement.style;
  root.setProperty('--main',       t);
  root.setProperty('--main-light', mixA(t, '#FFFFFF', 0.34));
  root.setProperty('--main-soft',  mixA(t, '#FFFFFF', 0.95));
  root.setProperty('--main-deep',  PINK_DEEP);
}

const INK  = '#111114';
const CN = '"Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif';
const MONO = '"Consolas","Courier New",monospace';

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
cv.width = W * DPR; cv.height = H * DPR;

/* ============================================================
   状态
   ============================================================ */
const DEFAULT = {
  theme: '#FF2D8A', accent: '#F2EF3A',
  imgScale: 100, imgX: 0, imgY: 0,
  bgOpacity: 55, bgBlur: 24, showBg: true,
  name: '', race: '', job: '', age: '', level: '', gender: '',
  matches: '2390', kda: '17.7', knock: 'A', win: '42%',
  stats: [
    { label: '击倒', value: 82, letter: 'A' },
    { label: '助攻', value: 95, letter: 'S' },
    { label: '存活', value: 88, letter: 'S' },
    { label: '伤害', value: 78, letter: 'A' },
    { label: '承伤', value: 86, letter: 'S' },
    { label: '治疗', value: 64, letter: 'B' }
  ],
  intro: 'XX是 MMORPG 游戏《最终幻想14》的战场PVP玩家。PVP风格非常XX，喜欢组四小，倒老三。经常恶劣地欺负新人豆芽，后面新人豆芽前往新月岛开启了隐藏职业：时魔法师，这是可以控制游戏时间系统的隐藏职业，于是对这位恶劣的玩家进行了报复。'
};
const LETTERS = ['S','A','B','C','D','E'];
let imagePath = '';
let saving = Promise.resolve();
let saveTimer;
const status = document.createElement('span'); status.setAttribute('role','status'); document.querySelector('.actions').append(status);
function notice(message){ status.textContent=message; }

let state = JSON.parse(JSON.stringify(DEFAULT));
let img = null;          // 立绘 Image
let imgURL = null;

/* ============================================================
   通用绘图工具
   ============================================================ */
function rr(x, y, w, h, r){
  r = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function fillRR(x, y, w, h, r, color){
  ctx.fillStyle = color; rr(x, y, w, h, r); ctx.fill();
}
function strokeRR(x, y, w, h, r, color, lw){
  ctx.strokeStyle = color; ctx.lineWidth = lw || 1; rr(x, y, w, h, r); ctx.stroke();
}
function star4(cx, cy, r, color){
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + r*0.16, cy - r*0.16, cx + r, cy);
  ctx.quadraticCurveTo(cx + r*0.16, cy + r*0.16, cx, cy + r);
  ctx.quadraticCurveTo(cx - r*0.16, cy + r*0.16, cx - r, cy);
  ctx.quadraticCurveTo(cx - r*0.16, cy - r*0.16, cx, cy - r);
  ctx.fill();
}
function cat(cx, cy, s, color, eyeColor){
  ctx.fillStyle = color;
  // 左耳
  ctx.beginPath();
  ctx.moveTo(cx - s*0.54, cy - s*0.20);
  ctx.lineTo(cx - s*0.34, cy - s*1.00);
  ctx.lineTo(cx + s*0.02, cy - s*0.42);
  ctx.closePath(); ctx.fill();
  // 右耳
  ctx.beginPath();
  ctx.moveTo(cx + s*0.54, cy - s*0.20);
  ctx.lineTo(cx + s*0.34, cy - s*1.00);
  ctx.lineTo(cx - s*0.02, cy - s*0.42);
  ctx.closePath(); ctx.fill();
  // 脸
  ctx.beginPath();
  ctx.ellipse(cx, cy + s*0.08, s*0.56, s*0.50, 0, 0, Math.PI*2);
  ctx.fill();
  // 眼
  if(eyeColor){
    ctx.fillStyle = eyeColor;
    ctx.beginPath(); ctx.ellipse(cx - s*0.22, cy + s*0.02, s*0.085, s*0.11, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + s*0.22, cy + s*0.02, s*0.085, s*0.11, 0, 0, Math.PI*2); ctx.fill();
  }
}
// 字间距文本，返回总宽
function tracked(text, x, y, spacing, align){
  const chars = [...text];
  let total = 0;
  const widths = chars.map(c => ctx.measureText(c).width);
  widths.forEach(w => total += w);
  total += spacing * (chars.length - 1);
  let cx = x;
  if(align === 'center') cx = x - total/2;
  else if(align === 'right') cx = x - total;
  const oldAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += widths[i] + spacing; });
  ctx.textAlign = oldAlign;
  return total;
}
function wrap(text, maxWidth){
  const out = [];
  text.split('\n').forEach(para => {
    if(para === ''){ out.push(''); return; }
    let line = '';
    for(const ch of para){
      const test = line + ch;
      if(ctx.measureText(test).width > maxWidth && line !== ''){
        out.push(line); line = ch;
      } else line = test;
    }
    if(line !== '') out.push(line);
  });
  return out;
}
function drawCover(im, x, y, w, h, zoom, ox, oy){ return drawCoverOn(ctx, im, x, y, w, h, zoom, ox, oy); }
function drawCoverOn(c, im, x, y, w, h, zoom, ox, oy){
  const ir = im.width / im.height, br = w / h;
  let sw, sh;
  if(ir > br){ sh = im.height; sw = sh * br; }
  else { sw = im.width; sh = sw / br; }
  sw /= (zoom || 1); sh /= (zoom || 1);
  const maxX = (im.width - sw) / 2, maxY = (im.height - sh) / 2;
  const cx = Math.max(0, Math.min(im.width - sw, maxX + (ox || 0) * maxX));
  const cy = Math.max(0, Math.min(im.height - sh, maxY + (oy || 0) * maxY));
  c.drawImage(im, cx, cy, sw, sh, x, y, w, h);
}
function rrOn(c, x, y, w, h, r){
  r = Math.min(r, w/2, h/2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/* ============================================================
   布局常量
   ============================================================ */
const HEAD_H   = 52;
const PORT     = { x: 8, y: HEAD_H, w: 424, h: 500 };
const RADAR    = { cx: 640, cy: 300, r: 132 };
const CARD_B   = { x: 826, y: 96,  w: 234, h: 100 };   // 黄卡 基本资料
const CARD_S   = { x: 826, y: 204, w: 234, h: 250 };   // 白卡 战绩
const CARD_I   = { x: 20,  y: 520, w: 470, h: 258 };   // 基础信息
const CARD_BIO = { x: 506, y: 520, w: 554, h: 258 };   // 个人介绍

/* ============================================================
   1. 背景
   ============================================================ */
function drawBg(){
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  if(!img || !state.showBg){
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0,    PINK_TINT);
    g.addColorStop(0.45, PINK_XLIGHT);
    g.addColorStop(1,    '#FFFFFF');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } else {
    ctx.save();
    ctx.globalAlpha = state.bgOpacity / 100;
    if(state.bgBlur > 0) ctx.filter = 'blur(' + state.bgBlur + 'px)';
    const pad = 80;
    const bw = W + pad*2, bh = H + pad*2;
    const ir = img.width / img.height, br = bw / bh;
    let dw, dh;
    if(ir > br){ dh = bh; dw = dh * ir; } else { dw = bw; dh = dw / ir; }
    ctx.drawImage(img, (W - dw)/2, (H - dh)/2, dw, dh);
    ctx.restore();

    // 白色柔化
    const g2 = ctx.createLinearGradient(0, 0, W, 0);
    g2.addColorStop(0,   'rgba(255,255,255,0.10)');
    g2.addColorStop(0.50,'rgba(255,255,255,0.66)');
    g2.addColorStop(1,   'rgba(255,255,255,0.88)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

    // 粉色氛围
    ctx.fillStyle = rgba(PINK, 0.10);
    ctx.fillRect(0, 0, W, H);
  }

  // 左下角点阵
  ctx.fillStyle = rgba(PINK, 0.28);
  for(let r = 0; r < 4; r++){
    for(let c = 0; c < 8; c++){
      ctx.beginPath(); ctx.arc(28 + c*15, 470 + r*15, 2.2, 0, Math.PI*2); ctx.fill();
    }
  }
  // 右上角点阵（白卡下方留白处）
  ctx.fillStyle = rgba(PINK, 0.30);
  for(let r = 0; r < 3; r++){
    for(let c = 0; c < 7; c++){
      ctx.beginPath(); ctx.arc(852 + c*16, 468 + r*15, 2.2, 0, Math.PI*2); ctx.fill();
    }
  }
}

/* ============================================================
   2. 立绘（离屏画布 + 边缘羽化，融入背景）
   ============================================================ */
let portCv = null;
function drawPortrait(){
  const {x, y, w, h} = PORT;

  if(!portCv){
    portCv = document.createElement('canvas');
    portCv.width = Math.round(w * DPR);
    portCv.height = Math.round(h * DPR);
  }
  const oc = portCv.getContext('2d');
  const fw = img ? 132 : 70;
  const fh = img ? 116 : 0;   // 无立绘时不做底部擦除，避免提示文字被吃掉

  oc.setTransform(DPR, 0, 0, DPR, 0, 0);
  oc.clearRect(0, 0, w, h);
  oc.globalCompositeOperation = 'source-over';

  oc.save();
  rrOn(oc, 0, 0, w, h, 18);
  oc.clip();

  if(img){
    drawCoverOn(oc, img, 0, 0, w, h, state.imgScale/100, state.imgX/100, state.imgY/100);
  } else {
    const g = oc.createLinearGradient(0, 0, w, h);
    g.addColorStop(0,    mixA(PINK, '#FFFFFF', 0.74));
    g.addColorStop(0.55, mixA(PINK, '#FFFFFF', 0.88));
    g.addColorStop(1,    mixA(PINK, '#FFFFFF', 0.965));
    oc.fillStyle = g; oc.fillRect(0, 0, w, h);

    const cx = w/2;
    oc.fillStyle = rgba(PINK, 0.30);
    oc.beginPath(); oc.ellipse(cx, h*0.30, 96, 104, 0, 0, Math.PI*2); oc.fill();
    oc.fillStyle = rgba(PINK, 0.42);
    oc.beginPath(); oc.arc(cx, h*0.31, 60, 0, Math.PI*2); oc.fill();
    oc.beginPath(); oc.ellipse(cx, h*0.92, 128, 152, 0, 0, Math.PI*2); oc.fill();

    oc.textAlign = 'center'; oc.textBaseline = 'middle';
    oc.fillStyle = rgba(PINK_DEEP, 0.72);
    oc.font = '700 17px ' + CN;
    oc.fillText('点击上传角色立绘', cx, h - 46);
    oc.fillStyle = rgba(PINK_DEEP, 0.45);
    oc.font = '600 12.5px ' + CN;
    oc.fillText('支持 JPG / PNG，也可直接拖入', cx, h - 24);
  }
  oc.restore();

  // 羽化：擦除边缘，露出下层背景
  oc.globalCompositeOperation = 'destination-out';
  const gr = oc.createLinearGradient(w - fw, 0, w, 0);
  gr.addColorStop(0, 'rgba(0,0,0,0)');
  gr.addColorStop(0.55, 'rgba(0,0,0,0.55)');
  gr.addColorStop(1, 'rgba(0,0,0,0.97)');
  oc.fillStyle = gr; oc.fillRect(w - fw, 0, fw, h);

  const gb = oc.createLinearGradient(0, Math.max(0, h - fh), 0, h);
  gb.addColorStop(0, 'rgba(0,0,0,0)');
  gb.addColorStop(1, 'rgba(0,0,0,0.92)');
  if(fh > 0){ oc.fillStyle = gb; oc.fillRect(0, h - fh, w, fh); }

  // 左侧轻羽化
  const gl = oc.createLinearGradient(0, 0, 26, 0);
  gl.addColorStop(0, 'rgba(0,0,0,0.6)');
  gl.addColorStop(1, 'rgba(0,0,0,0)');
  oc.fillStyle = gl; oc.fillRect(0, 0, 26, h);
  oc.globalCompositeOperation = 'source-over';

  ctx.drawImage(portCv, x, y, w, h);

  // 左侧装饰 +++
  ctx.fillStyle = INK;
  for(let i = 0; i < 3; i++){
    const py = 78 + i*24;
    ctx.fillRect(26, py, 3, 13);
    ctx.fillRect(21, py + 5, 13, 3);
  }
}

/* ============================================================
   3. 雷达图
   ============================================================ */
function drawRadar(){
  const {cx, cy, r} = RADAR;
  const angles = state.stats.map((_, i) => -Math.PI/2 + i * Math.PI/3);
  const pt = (a, rad) => [cx + Math.cos(a)*rad, cy + Math.sin(a)*rad];

  // 网格
  for(let lvl = 1; lvl <= 4; lvl++){
    const rad = r * lvl / 4;
    ctx.beginPath();
    angles.forEach((a, i) => {
      const [px, py] = pt(a, rad);
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    });
    ctx.closePath();
    if(lvl === 4){ ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill(); }
    ctx.strokeStyle = lvl === 4 ? rgba(PINK, 0.55) : rgba(PINK_SOFT, 0.40);
    ctx.lineWidth = lvl === 4 ? 2 : 1;
    ctx.stroke();
  }

  // 轴线
  ctx.strokeStyle = rgba(PINK_SOFT, 0.34);
  ctx.lineWidth = 1;
  angles.forEach(a => {
    const [px, py] = pt(a, r);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
  });

  // 数据多边形
  ctx.beginPath();
  state.stats.forEach((s, i) => {
    const v = Math.max(2, Math.min(100, Number(s.value) || 0)) / 100;
    const [px, py] = pt(angles[i], r * v);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  });
  ctx.closePath();
  const g = ctx.createRadialGradient(cx, cy, 6, cx, cy, r);
  g.addColorStop(0, rgba(PINK, 0.55));
  g.addColorStop(1, rgba(PINK, 0.38));
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = PINK;
  ctx.lineWidth = 2.6;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // 顶点
  state.stats.forEach((s, i) => {
    const v = Math.max(2, Math.min(100, Number(s.value) || 0)) / 100;
    const [px, py] = pt(angles[i], r * v);
    ctx.beginPath(); ctx.arc(px, py, 5.2, 0, Math.PI*2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.strokeStyle = PINK; ctx.lineWidth = 2.4; ctx.stroke();
  });

  // 标签 + 等级
  ctx.textBaseline = 'middle';
  const letterR = 15;

  state.stats.forEach((s, i) => {
    const a = angles[i];
    const [vx, vy] = pt(a, r);
    const label = String(s.label || '');
    ctx.font = '700 21px ' + CN;
    const lw = ctx.measureText(label).width;
    const gapTxt = 11;
    const totalW = lw + gapTxt + letterR*2;   // 文字 + 间隔 + 圆

    let ctrX, midY;
    if(i === 0){                       // 顶
      ctrX = vx; midY = vy - 40;
    } else if(i === 1){                // 右上
      ctrX = vx + 22; midY = vy - 9;
    } else if(i === 2){                // 右下
      ctrX = vx + 22; midY = vy + 9;
    } else if(i === 3){                // 底
      ctrX = vx; midY = vy + 48;
    } else if(i === 4){                // 左下
      ctrX = vx - 22; midY = vy + 9;
    } else {                           // 左上
      ctrX = vx - 22; midY = vy - 9;
    }

    const textLeft = ctrX - totalW/2;

    // 白色描边保证在花背景上可读
    ctx.font = '700 21px ' + CN;
    ctx.textAlign = 'left';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeText(label, textLeft, midY + 1);
    ctx.fillStyle = INK;
    ctx.fillText(label, textLeft, midY + 1);

    // 等级圆
    const lcx = textLeft + lw + gapTxt + letterR;
    ctx.beginPath(); ctx.arc(lcx, midY, letterR, 0, Math.PI*2);
    ctx.fillStyle = INK; ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.stroke();
    ctx.fillStyle = YELLOW;
    ctx.font = '800 17px ' + MONO;
    ctx.textAlign = 'center';
    ctx.fillText(String(s.letter || 'A'), lcx, midY + 1);
    ctx.textAlign = 'left';
  });
  ctx.textBaseline = 'alphabetic';
}

/* ============================================================
   4. 右上：基本资料（黄卡）
   ============================================================ */
function drawBasicTitle(){
  const {x, y, w, h} = CARD_B;
  fillRR(x, y, w, h, 16, YELLOW);
  cat(x + 28, y + h/2 + 6, 16, INK);
  ctx.fillStyle = INK;
  ctx.font = '900 29px ' + CN;
  ctx.textBaseline = 'middle';
  ctx.fillText('基本资料', x + 54, y + h/2 + 1);
  ctx.textBaseline = 'alphabetic';
}

/* ============================================================
   5. 右上：战绩（白卡）
   ============================================================ */
function drawStats(){
  const {x, y, w, h} = CARD_S;
  fillRR(x, y, w, h, 16, YELLOW_TINT);
  strokeRR(x, y, w, h, 16, YELLOW_LINE, 1.2);

  const rows = [
    { k: '场次', v: state.matches },
    { k: 'KDA',  v: state.kda },
    { k: '击倒', v: state.knock },
    { k: '胜率', v: state.win }
  ];
  const rh = (h - 26) / rows.length;

  ctx.textBaseline = 'middle';
  rows.forEach((row, i) => {
    const cyy = y + 13 + rh * i + rh/2;

    ctx.beginPath(); ctx.arc(x + 20, cyy, 4.6, 0, Math.PI*2);
    ctx.fillStyle = YELLOW_DEEP; ctx.fill();
    ctx.strokeStyle = mixA(YELLOW, '#000000', 0.28); ctx.lineWidth = 1.2; ctx.stroke();

    ctx.fillStyle = INK;
    ctx.font = '700 20px ' + CN;
    ctx.textAlign = 'left';
    ctx.fillText(row.k, x + 34, cyy + 1);

    ctx.fillStyle = PINK_DEEP;
    ctx.font = '900 27px ' + CN;
    ctx.textAlign = 'right';
    ctx.fillText(String(row.v || ''), x + w - 16, cyy + 2);
    ctx.textAlign = 'left';

    if(i < rows.length - 1){
      ctx.strokeStyle = 'rgba(17,17,20,0.82)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x + 14, y + 13 + rh*(i+1));
      ctx.lineTo(x + w - 14, y + 13 + rh*(i+1));
      ctx.stroke();
    }
  });
  ctx.textBaseline = 'alphabetic';
}

/* ============================================================
   6. 左下：基础信息
   ============================================================ */
function drawInfo(){
  const {x, y, w, h} = CARD_I;
  // 阴影
  ctx.save();
  ctx.shadowColor = 'rgba(120,80,110,0.16)';
  ctx.shadowBlur = 16; ctx.shadowOffsetY = 4;
  fillRR(x, y, w, h, 16, '#ffffff');
  ctx.restore();
  strokeRR(x, y, w, h, 16, PINK_EDGE, 1.2);

  const pad = 18, gap = 12, rowH = 66, rowGap = 8;
  const colW = (w - pad*2 - gap) / 2;
  const tagW = 78, valW = colW - tagW;

  const rows = [
    [['昵称', state.name], ['种族', state.race]],
    [['职业', state.job],  ['年龄', state.age]],
    [['等级', state.level],['性别', state.gender]]
  ];

  ctx.textBaseline = 'middle';
  rows.forEach((pair, r) => {
    const ry = y + pad + r * (rowH + rowGap);
    pair.forEach(([k, v], c) => {
      const rx = x + pad + c * (colW + gap);
      // 标签
      fillRR(rx, ry, tagW, rowH, 9, YELLOW);
      ctx.fillStyle = INK;
      ctx.font = '800 21px ' + CN;
      ctx.textAlign = 'center';
      ctx.fillText(k, rx + tagW/2, ry + rowH/2 + 1);
      // 值
      const vx = rx + tagW + 8;
      fillRR(vx, ry, valW - 8, rowH, 9, '#FFFFFF');
      strokeRR(vx, ry, valW - 8, rowH, 9, '#E4E4EC', 1.1);
      ctx.fillStyle = INK;
      ctx.font = '800 21px ' + CN;
      ctx.textAlign = 'left';
      let txt = String(v || '');
      let fs = 21;
      while(ctx.measureText(txt).width > valW - 30 && fs > 12){
        fs -= 1;
        ctx.font = '800 ' + fs + 'px ' + CN;
      }
      ctx.fillText(txt, vx + 14, ry + rowH/2 + 1);
    });
  });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // 猫爪装饰
  ctx.save();
  ctx.globalAlpha = 0.9;
  cat(x + w - 44, y + h - 30, 13, 'rgba(225,225,232,0.95)');
  ctx.restore();
}

/* ============================================================
   7. 右下：个人介绍
   ============================================================ */
function drawBio(){
  const {x, y, w, h} = CARD_BIO;
  ctx.save();
  ctx.shadowColor = 'rgba(120,80,110,0.14)';
  ctx.shadowBlur = 16; ctx.shadowOffsetY = 4;
  fillRR(x, y, w, h, 16, '#ffffff');
  ctx.restore();
  strokeRR(x, y, w, h, 16, PINK_EDGE, 1.2);

  const pad = 22;
  const titleY = y + 34;

  // 标题
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PINK_DEEP;
  ctx.font = '900 27px ' + CN;
  ctx.textAlign = 'left';
  ctx.fillText('个人介绍', x + pad, titleY);
  const tw = ctx.measureText('个人介绍').width;

  // 菱形
  star4(x + pad + tw + 18, titleY, 9, PINK_SOFT);

  // 分隔线
  const lineX1 = x + pad + tw + 38;
  const lineX2 = x + w - pad - 132;
  const lg = ctx.createLinearGradient(lineX1, 0, lineX2, 0);
  lg.addColorStop(0, rgba(PINK, 0.85));
  lg.addColorStop(1, rgba(PINK_SOFT, 0.25));
  ctx.fillStyle = lg;
  ctx.fillRect(lineX1, titleY - 0.8, Math.max(0, lineX2 - lineX1), 1.6);

  // 小字
  ctx.fillStyle = rgba(mixA(PINK, '#FFFFFF', 0.42), 0.95);
  ctx.font = '700 10px ' + CN;
  tracked('PROFILE CARD', x + w - pad, titleY + 1, 2.4, 'right');

  // 正文
  ctx.fillStyle = '#2E2E38';
  ctx.font = '400 16px ' + CN;
  ctx.textBaseline = 'top';
  const bodyX = x + pad;
  const bodyW = w - pad*2;
  const bodyY = titleY + 30;
  const lh = 26;
  const maxLines = Math.floor((y + h - 22 - bodyY) / lh);

  const lines = wrap(String(state.intro || ''), bodyW);
  for(let i = 0; i < Math.min(lines.length, maxLines); i++){
    let line = lines[i];
    if(i === maxLines - 1 && lines.length > maxLines){
      while(ctx.measureText(line + '…').width > bodyW && line.length > 1){
        line = line.slice(0, -1);
      }
      line += '…';
    }
    ctx.fillText(line, bodyX, bodyY + i * lh);
  }
  ctx.textBaseline = 'alphabetic';
}

/* ============================================================
   8. 顶栏
   ============================================================ */
function trackedWidth(text, spacing){
  let t = 0;
  const chars = [...text];
  chars.forEach(c => t += ctx.measureText(c).width);
  return t + spacing * Math.max(0, chars.length - 1);
}

function drawHeader(){
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, HEAD_H);

  // 猫头方块
  fillRR(12, 8, 42, 36, 9, '#ffffff');
  cat(33, 28, 12, INK);

  // 标题（居中）
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 19px ' + MONO;
  ctx.textBaseline = 'middle';
  const TITLE = 'Masturbator Cup Profile';
  const tsp = 6.2;
  tracked(TITLE, W/2, 27, tsp, 'center');

  // 右侧斜线装饰
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '800 16px ' + MONO;
  tracked('//////', 828, 27, 2, 'left');
  star4(912, 26, 7, 'rgba(255,255,255,0.85)');

  star4(1000, 26, 6.5, '#ffffff');
  star4(1026, 26, 6.5, '#ffffff');
  star4(1052, 26, 6.5, '#ffffff');

  // 主色调强调线
  const g = ctx.createLinearGradient(0, HEAD_H, W, HEAD_H);
  g.addColorStop(0,    PINK);
  g.addColorStop(0.5,  mixA(PINK, '#FFFFFF', 0.45));
  g.addColorStop(1,    PINK);
  ctx.fillStyle = g;
  ctx.fillRect(0, HEAD_H - 1.5, W, 3);

  ctx.textBaseline = 'alphabetic';
}

/* ============================================================
   主绘制
   ============================================================ */
function draw(){
  buildColors();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.filter = 'none';
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  drawBg();
  drawPortrait();
  drawRadar();
  drawBasicTitle();
  drawStats();
  drawInfo();
  drawBio();
  drawHeader();
}

/* ============================================================
   UI 绑定
   ============================================================ */
function $(id){ return document.getElementById(id); }

// 六维行
const dimsBox = $('dims');
state.stats.forEach((s, i) => {
  const d = document.createElement('div');
  d.className = 'dim';
  d.innerHTML =
    '<input type="text" class="dn" maxlength="6" data-i="' + i + '">' +
    '<input type="range" class="dv" min="0" max="100" data-i="' + i + '">' +
    '<input type="number" class="dnum" min="0" max="100" data-i="' + i + '">' +
    '<select class="dl" data-i="' + i + '">' +
      LETTERS.map(l => '<option value="' + l + '">' + l + '</option>').join('') +
    '</select>';
  dimsBox.appendChild(d);
});

function syncUI(){
  $('themeColor').value  = state.theme;
  $('themeHex').textContent  = String(state.theme).toUpperCase();
  $('accentColor').value = state.accent;
  $('accentHex').textContent = String(state.accent).toUpperCase();

  $('f_name').value    = state.name;
  $('f_race').value    = state.race;
  $('f_job').value     = state.job;
  $('f_age').value     = state.age;
  $('f_level').value   = state.level;
  $('f_gender').value  = state.gender;
  $('f_matches').value = state.matches;
  $('f_kda').value     = state.kda;
  $('f_knock').value   = state.knock;
  $('f_win').value     = state.win;
  $('f_intro').value   = state.intro;

  $('imgScale').value   = state.imgScale;  $('imgScaleV').textContent = state.imgScale + '%';
  $('imgX').value       = state.imgX;      $('imgXV').textContent = state.imgX;
  $('imgY').value       = state.imgY;      $('imgYV').textContent = state.imgY;
  $('bgOpacity').value  = state.bgOpacity; $('bgOpacityV').textContent = state.bgOpacity;
  $('bgBlur').value     = state.bgBlur;    $('bgBlurV').textContent = state.bgBlur;
  $('showBg').checked   = state.showBg;

  dimsBox.querySelectorAll('.dim').forEach((row, i) => {
    const s = state.stats[i];
    row.querySelector('.dn').value    = s.label;
    row.querySelector('.dv').value    = s.value;
    row.querySelector('.dnum').value  = s.value;
    row.querySelector('.dl').value    = s.letter;
  });
}

function save(){
  clearTimeout(saveTimer);
  const data=JSON.parse(JSON.stringify(state)), path=imagePath;
  notice('保存中…');
  saveTimer=setTimeout(()=>{ saving=saving.catch(()=>{}).then(()=>saveCard(data,path)).then(()=>notice('已保存')).catch(e=>{notice('保存失败：'+e.message);}); },400);
}

// 文本字段
const TEXT_MAP = {
  f_name:'name', f_race:'race', f_job:'job', f_age:'age', f_level:'level',
  f_gender:'gender', f_matches:'matches', f_kda:'kda', f_knock:'knock',
  f_win:'win', f_intro:'intro'
};
Object.keys(TEXT_MAP).forEach(id => {
  $(id).addEventListener('input', e => {
    state[TEXT_MAP[id]] = e.target.value;
    draw(); save();
  });
});

// 配色
const PRESETS = ['#FF2D8A','#E8206F','#A855F7','#6366F1','#3B82F6','#14B8A6','#22C55E','#FB923C','#EF4444'];
const swBox = $('swatches');
PRESETS.forEach(c => {
  const dot = document.createElement('i');
  dot.style.background = c;
  dot.title = c;
  dot.addEventListener('click', () => {
    state.theme = c.toLowerCase();
    syncUI(); draw(); save();
  });
  swBox.appendChild(dot);
});
$('themeColor').addEventListener('input', e => {
  state.theme = e.target.value;
  $('themeHex').textContent = e.target.value.toUpperCase();
  draw(); save();
});
$('accentColor').addEventListener('input', e => {
  state.accent = e.target.value;
  $('accentHex').textContent = e.target.value.toUpperCase();
  draw(); save();
});

// 数值滑块
[['imgScale','imgScaleV','%'], ['imgX','imgXV',''], ['imgY','imgYV',''],
 ['bgOpacity','bgOpacityV',''], ['bgBlur','bgBlurV','']].forEach(([id, vid, suf]) => {
  $(id).addEventListener('input', e => {
    state[id] = Number(e.target.value);
    $(vid).textContent = e.target.value + suf;
    draw(); save();
  });
});
$('showBg').addEventListener('change', e => {
  state.showBg = e.target.checked; draw(); save();
});

// 六维
dimsBox.addEventListener('input', e => {
  const i = Number(e.target.dataset.i);
  if(isNaN(i)) return;
  const t = e.target;
  if(t.classList.contains('dn'))      state.stats[i].label  = t.value;
  else if(t.classList.contains('dv')){ state.stats[i].value = Number(t.value); t.parentNode.querySelector('.dnum').value = t.value; }
  else if(t.classList.contains('dnum')){ state.stats[i].value = Math.max(0, Math.min(100, Number(t.value) || 0)); t.parentNode.querySelector('.dv').value = state.stats[i].value; }
  draw(); save();
});
dimsBox.addEventListener('change', e => {
  if(e.target.classList.contains('dl')){
    state.stats[Number(e.target.dataset.i)].letter = e.target.value;
    draw(); save();
  }
});

/* ---------------- 图片 ---------------- */
const MAX_SIDE = 2200;   // 超大图先降采样，保证滚动滑块流畅

function useImage(src, persist){
  const im = new Image();
  im.onload = () => {
    // 降采样
    let out = im;
    const side = Math.max(im.width, im.height);
    if(side > MAX_SIDE){
      const k = MAX_SIDE / side;
      const oc = document.createElement('canvas');
      oc.width = Math.round(im.width * k);
      oc.height = Math.round(im.height * k);
      const octx = oc.getContext('2d');
      octx.imageSmoothingQuality = 'high';
      octx.drawImage(im, 0, 0, oc.width, oc.height);
      out = oc;
    }
    img = out;
    imgURL = src;

    draw();
  };
  im.src = src;
}

async function setImageFromFile(file){
  if(!file || !/^image\//.test(file.type)) return;
  notice('正在上传立绘…');
  const app=document.querySelector('.app'); app.inert=true;
  try { const path=await uploadImage(file); const url=await imageUrl(path); imagePath=path; useImage(url,false); save(); }
  catch(e) { notice('立绘上传失败：'+e.message); }
  finally { app.inert=false; }
}
$('fileImg').addEventListener('change', e => setImageFromFile(e.target.files[0]));

const previewEl = $('preview');
['dragenter','dragover'].forEach(ev =>
  previewEl.addEventListener(ev, e => { e.preventDefault(); previewEl.classList.add('drag'); }));
['dragleave','drop'].forEach(ev =>
  previewEl.addEventListener(ev, e => { e.preventDefault(); if(ev === 'drop' || e.target === previewEl) previewEl.classList.remove('drag'); }));
previewEl.addEventListener('drop', e => {
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if(f) setImageFromFile(f);
});

/* ---------------- 画布直接操作立绘 ---------------- */
function toCardPos(e){
  const r = cv.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (W / r.width),
    y: (e.clientY - r.top)  * (H / r.height)
  };
}
function inPort(p){
  return p.x >= PORT.x - 20 && p.x <= PORT.x + PORT.w &&
         p.y >= PORT.y      && p.y <= PORT.y + PORT.h;
}
function clamp(v, a, b){ return Math.min(b, Math.max(a, v)); }

let dragging = false, lastPos = null;

function applyDrag(p){
  const dx = p.x - lastPos.x, dy = p.y - lastPos.y;
  state.imgX = clamp(Math.round(state.imgX + dx / (PORT.w * 0.55) * 100), -100, 100);
  state.imgY = clamp(Math.round(state.imgY + dy / (PORT.h * 0.55) * 100), -100, 100);
  lastPos = p;
  $('imgX').value = state.imgX; $('imgXV').textContent = state.imgX;
  $('imgY').value = state.imgY; $('imgYV').textContent = state.imgY;
  draw();
}

cv.addEventListener('mousedown', e => {
  if(!img) return;
  const p = toCardPos(e);
  if(!inPort(p)) return;
  dragging = true; lastPos = p;
  cv.style.cursor = 'grabbing';
  e.preventDefault();
});
window.addEventListener('mousemove', e => {
  if(dragging){
    applyDrag(toCardPos(e));
  } else if(img && e.target === cv){
    cv.style.cursor = inPort(toCardPos(e)) ? 'grab' : 'default';
  }
});
window.addEventListener('mouseup', () => {
  if(dragging){
    dragging = false;
    cv.style.cursor = img ? 'grab' : 'default';
    save();
  }
});

/* 触摸：单指拖动立绘 + 轻点看大图 */
let touchT0 = 0, touchMoved = false;

cv.addEventListener('touchstart', e => {
  touchT0 = Date.now();
  touchMoved = false;
  if(!img || e.touches.length !== 1) return;
  const p = toCardPos(e.touches[0]);
  if(!inPort(p)){ cv.style.touchAction = 'pan-y'; return; }
  cv.style.touchAction = 'none';
  dragging = true; lastPos = p;
}, { passive: true });

cv.addEventListener('touchmove', e => {
  if(!dragging || e.touches.length !== 1) return;
  e.preventDefault();
  touchMoved = true;
  applyDrag(toCardPos(e.touches[0]));
}, { passive: false });

cv.addEventListener('touchend', () => {
  if(dragging){ dragging = false; save(); }
  cv.style.touchAction = 'pan-y';
  if(!touchMoved && Date.now() - touchT0 < 320) openLightbox();
});
cv.addEventListener('touchcancel', () => {
  if(dragging){ dragging = false; save(); }
  cv.style.touchAction = 'pan-y';
});

cv.addEventListener('wheel', e => {
  if(!img) return;
  if(!inPort(toCardPos(e))) return;
  e.preventDefault();
  state.imgScale = clamp(Math.round(state.imgScale - e.deltaY * 0.12), 100, 260);
  $('imgScale').value = state.imgScale;
  $('imgScaleV').textContent = state.imgScale + '%';
  draw(); save();
}, { passive: false });

cv.addEventListener('dblclick', e => {
  if(inPort(toCardPos(e))) $('fileImg').click();
});

/* ---------------- 导出 ---------------- */
$('btnExport').addEventListener('click', () => {
  const a = document.createElement('a');
  const safe = (state.name || '').replace(/[\\/:*?"<>|]/g, '').trim();
  a.download = '杯子角色卡' + (safe ? '_' + safe : '') + '.png';
  a.href = cv.toDataURL('image/png');
  a.click();
});

$('btnCopy').addEventListener('click', async () => {
  try {
    const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    const btn = $('btnCopy');
    const old = btn.textContent;
    btn.textContent = '已复制 ✓';
    setTimeout(() => btn.textContent = old, 1400);
  } catch(err){
    alert('当前浏览器不支持直接复制图片，请用「下载 PNG」。');
  }
});

/* ---------------- 全屏查看 ---------------- */
function openLightbox(){
  try {
    $('lightboxImg').src = cv.toDataURL('image/png');
    $('lightbox').classList.add('on');
    document.body.style.overflow = 'hidden';
  } catch(err){
    alert('预览生成失败，请重试。');
  }
}
function closeLightbox(){
  $('lightbox').classList.remove('on');
  document.body.style.overflow = '';
}
$('btnFull').addEventListener('click', openLightbox);
$('lightboxClose').addEventListener('click', closeLightbox);
$('lightbox').addEventListener('click', e => {
  if(e.target.id === 'lightbox') closeLightbox();
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeLightbox();
});

$('btnReset').addEventListener('click', () => {
  if(!confirm('确定恢复默认内容？当前填写会被清空。')) return;
  state = JSON.parse(JSON.stringify(DEFAULT));
  img = null; imgURL = null;
  $('fileImg').value = '';
  imagePath = '';
  syncUI(); draw(); save();
});

/* ---------------- 启动 ---------------- */
const app=document.querySelector('.app'); app.inert=true;
(async()=>{
  try { const saved=await loadCard(); if(saved && Array.isArray(saved.data.stats) && saved.data.stats.length===6){ state=Object.assign(state,saved.data); imagePath=saved.path; } syncUI(); draw(); if(imagePath) useImage(await imageUrl(imagePath),false); app.inert=false; notice('已连接'); }
  catch(e){ notice('加载失败：'+e.message+'，请刷新重试'); }
})();
})();
