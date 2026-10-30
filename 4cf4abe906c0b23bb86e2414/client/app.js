
"use strict";
window.onerror = (m, s, l, c) => { document.title = "ERR " + m + " line " + l; };
const META = {
  "default_radar": {
    "lon": 118.94929,
    "lat": 32.248764,
    "col": 498,
    "row": 177
  },
  "bbox_wgs84": [
    118.78,
    32.05,
    119.15,
    32.3
  ],
  "origin": {
    "lon": 118.78,
    "lat": 32.3
  },
  "grid_m": 32.0,
  "nx": 1090,
  "ny": 864,
  "width_m": 34862.9,
  "height_m": 27643.5,
  "water_area_km2": 237.08,
  "water_ratio": 0.2458,
  "yangtze_half_width_m": 750.0,
  "tributary_half_width_m": 60.0,
  "n_outer_rings": 983,
  "n_inner_rings": 56,
  "n_yangtze_lines": 9,
  "n_tributary_lines": 70,
  "n_bridges": 1697,
  "n_piers": 154,
  "n_roads": 1376,
  "n_rail": 303,
  "land_density_note": "B 通道 = 道路/铁路等级加权 + BoxBlur(3) 密度场，作陆地杂波强度 proxy",
  "source": "OpenStreetMap contributors via Overpass",
  "note": "长江主江面由 waterway=river 中心线按半宽缓冲生成，宽度未经实测校准"
};


const NX = META.nx, NY = META.ny, DX = META.grid_m;
const ORIGIN_LON = META.origin.lon, ORIGIN_LAT = META.origin.lat;
const NRAYS = 1440, NGATES = 512;
const TAU = Math.PI * 2;

let land = null, tgt = null, den = null;  // Uint8Array：陆地掩膜 / 目标强度 / 陆地杂波密度
let echo = new Float32Array(NRAYS * NGATES);
let scanCycle = new Int32Array(NRAYS); // 该射线最近一次被扫描的圈号
let cycle = 0, sweepRay = 0;
let cycleHits = 0;

const params = { rangeNm: 4, sea: 2, gain: 0.52, rain: 0, stc: true, afterglow: true, chart: true };
let radar = { col: META.default_radar.col, row: META.default_radar.row };

/* URL 预设参数：?range=8&sea=5&gain=80&stc=0&lat=..&lon=.. （便于分享特定视角） */
try {
  const qs = new URLSearchParams(location.search);
  if (qs.has("range")) { const v = parseFloat(qs.get("range")); if ([0.5, 1, 2, 4, 8].includes(v)) params.rangeNm = v; }
  if (qs.has("sea")) params.sea = Math.min(5, Math.max(0, parseInt(qs.get("sea")) || 0));
  if (qs.has("gain")) params.gain = Math.min(1, Math.max(0, (parseInt(qs.get("gain")) || 52) / 100));
  if (qs.has("rain")) params.rain = Math.min(100, Math.max(0, parseInt(qs.get("rain")) || 0));
  if (qs.has("stc")) params.stc = qs.get("stc") !== "0";
  if (qs.has("chart")) params.chart = qs.get("chart") !== "0";
  const MXD = 111320 * Math.cos(32.175 * Math.PI / 180);
  if (qs.has("lat") && qs.has("lon")) {
    const lat = parseFloat(qs.get("lat")), lon = parseFloat(qs.get("lon"));
    radar = {
      col: Math.round((lon - META.origin.lon) * MXD / DX),
      row: Math.round((META.origin.lat - lat) * 110574 / DX),
    };
  }
} catch (e) { }

const ppi = document.getElementById("ppi"), pctx = ppi.getContext("2d");
const mmc = document.getElementById("minimap"), mctx = mmc.getContext("2d");
const polar = pctx.createImageData(NGATES, NRAYS);
const ppiImg = pctx.createImageData(ppi.width, ppi.height);

/* 探针（截图/验证用调试设施）：动态创建 + 存在性防护——virtual-time 下 onload 可能
   早于静态 img 标签解析触发，探针绝不允许炸掉主流程 */
function setProbe(id, url) {
  if (!document.body) return;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("img");
    el.id = id;
    el.style.display = "none";
    document.body.appendChild(el);
  }
  el.src = url;
}

/* ---------- 场景加载 ---------- */
const img = new Image();
let sceneUrl;
function sceneError() { root.insertAdjacentHTML('afterbegin', '<p role="alert">场景素材加载失败，请刷新重试。</p>'); }
img.onerror = sceneError;
img.onload = () => {
  if (sceneUrl) URL.revokeObjectURL(sceneUrl);
  document.getElementById("pRange").value = String(params.rangeNm);
  document.getElementById("pSea").value = params.sea;
  document.getElementById("vSea").textContent = params.sea + " 级";
  document.getElementById("pGain").value = Math.round(params.gain * 100);
  document.getElementById("vGain").textContent = Math.round(params.gain * 100) + "%";
  document.getElementById("pStc").checked = params.stc;
  document.getElementById("pAfter").checked = params.afterglow;
  document.getElementById("pChart").checked = params.chart;
  const oc = document.createElement("canvas");
  oc.width = NX; oc.height = NY;
  const c2 = oc.getContext("2d", { willReadFrequently: true });
  c2.drawImage(img, 0, 0);
  const d = c2.getImageData(0, 0, NX, NY).data;
  land = new Uint8Array(NX * NY);
  tgt = new Uint8Array(NX * NY);
  den = new Uint8Array(NX * NY);
  for (let i = 0; i < NX * NY; i++) { land[i] = d[i * 4]; tgt[i] = d[i * 4 + 1]; den[i] = d[i * 4 + 2]; }
  initShips();
  drawMinimap();
  rescan();
  // 首帧探针：不等 rAF，保证 dump-dom 竞态下也有数据可抓
  setProbe("probePpi", ppi.toDataURL());
  setProbe("probeMm", mmc.toDataURL());
  {
    const pr = ppi.getBoundingClientRect(), mr = mmc.getBoundingClientRect();
    document.title = "loaded | ppi " + [Math.round(pr.left), Math.round(pr.top), Math.round(pr.width)].join(",")
      + " | mm " + [Math.round(mr.left), Math.round(mr.top), Math.round(mr.width), Math.round(mr.height)].join(",");
  }
  requestAnimationFrame(loop);
};
files.get('template-assets/scene.png').then(response => {
  if (!response.ok) throw new Error('scene fetch failed');
  return response.blob();
}).then(blob => { sceneUrl = URL.createObjectURL(blob); img.src = sceneUrl; }).catch(sceneError);

/* ---------- 船舶目标（程序化推演 + ARPA 跟踪） ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const ships = [];
let lockedShip = null;
const found = new Set();
const danger = new Set();
let mission = null;  // {t0, dur(s)}

function waterAt(c, r) {
  if (c < 0 || c >= NX || r < 0 || r >= NY) return false;
  return land[(r | 0) * NX + (c | 0)] <= 127;
}
function deepWater(c, r) {  // 周围 6 格（约 190m）内全是水才算深水航道
  for (let dr = -6; dr <= 6; dr += 3)
    for (let dc = -6; dc <= 6; dc += 3)
      if (!waterAt(c + dc, r + dr)) return false;
  return true;
}

function initShips() {
  const rnd = mulberry32(20261023);   // 固定种子：每次加载同样的船阵，演示可复现
  const cand = [];
  for (let k = 0; k < 8000 && cand.length < 80; k++) {
    const c = (rnd() * NX) | 0, r = (rnd() * NY) | 0;
    if (deepWater(c, r)) cand.push({ c, r });
  }
  const picked = [];
  for (const p of cand) {
    if (picked.every(q => Math.hypot(q.c - p.c, q.r - p.r) > 90)) picked.push(p);  // 两船间距 ≥2.9km
    if (picked.length >= 5) break;
  }
  picked.forEach((p, i) => {
    let bestA = 0, bestD = -1;
    for (let a = 0; a < 16; a++) {     // 初始航向 = 局部水域最深方向（近似顺航道）
      const t = a / 16 * TAU;
      let dpt = 0;
      for (let d = 4; d <= 22; d += 3) {
        if (!waterAt(p.c + d * Math.sin(t), p.r - d * Math.cos(t))) break;
        dpt = d;
      }
      if (dpt > bestD) { bestD = dpt; bestA = t; }
    }
    if (rnd() < 0.5) bestA += Math.PI;  // 顺流/逆流随机
    ships.push({
      id: i + 1, c: p.c, r: p.r, hdg: bestA, tgtHdg: bestA,
      spdG: (3 + rnd() * 6) * 0.5144 / DX,  // 3~9 kn → 格/秒
      decide: 0,
    });
  });
}

function updateShips(dt) {
  for (const s of ships) {
    let dh = s.tgtHdg - s.hdg;                       // 平滑转向（内河船约 21°/s）
    while (dh > Math.PI) dh -= TAU;
    while (dh < -Math.PI) dh += TAU;
    const rate = 0.37 * dt;
    s.hdg += Math.max(-rate, Math.min(rate, dh));
    s.c += s.spdG * dt * Math.sin(s.hdg);
    s.r -= s.spdG * dt * Math.cos(s.hdg);
    s.decide -= dt;
    if (s.decide <= 0) {                             // 避岸决策（每 0.4s）
      s.decide = 0.4;
      if (!waterAt(s.c, s.r)) { s.tgtHdg = s.hdg + Math.PI; continue; }  // 异常搁浅：掉头
      const ahead = 14;                              // 前探约 450m
      const px = s.c + ahead * Math.sin(s.hdg), py = s.r - ahead * Math.cos(s.hdg);
      if (!waterAt(px, py)) {
        const la = s.hdg - 50 * Math.PI / 180, ra = s.hdg + 50 * Math.PI / 180;
        const lw = waterAt(s.c + ahead * Math.sin(la), s.r - ahead * Math.cos(la));
        const rw = waterAt(s.c + ahead * Math.sin(ra), s.r - ahead * Math.cos(ra));
        if (lw && rw) s.tgtHdg = s.hdg + (Math.random() < 0.5 ? -50 : 50) * Math.PI / 180;
        else if (lw) s.tgtHdg = la;
        else if (rw) s.tgtHdg = ra;
        else s.tgtHdg = s.hdg + Math.PI;
      } else if (Math.random() < 0.04) {
        s.tgtHdg = s.hdg + (Math.random() - 0.5) * 0.25;  // 轻微蛇行，航迹更自然
      }
    }
  }
}

function shipCPA(s) {  // 本船（雷达站）静止：CPA/TCPA 标准相对运动解算
  const px = (s.c - radar.col) * DX, py = (s.r - radar.row) * DX;   // 东/南，米
  const vx = s.spdG * DX * Math.sin(s.hdg), vy = -s.spdG * DX * Math.cos(s.hdg);
  const v2 = vx * vx + vy * vy;
  if (v2 < 1e-6) return { cpa: Math.hypot(px, py), tcpa: -1 };
  const tcpa = -(px * vx + py * vy) / v2;
  if (tcpa < 0) return { cpa: Math.hypot(px, py), tcpa: -1 };
  return { cpa: Math.hypot(px + vx * tcpa, py + vy * tcpa), tcpa };
}

function fmtTime(sec) {
  sec = Math.max(0, Math.round(sec));
  return String((sec / 60) | 0).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");
}

function shipScreenPos(s) {  // 船 → PPI 画布坐标（量程外返回 null）
  const dc = s.c - radar.col, dr = s.r - radar.row;
  const Rm = Math.hypot(dc, dr) * DX;
  if (Rm > params.rangeNm * 1852) return null;
  let az = Math.atan2(dc, -dr); if (az < 0) az += TAU;
  const rad = ppi.width / 2 - 26;
  const R = Rm / (params.rangeNm * 1852) * rad;
  return { x: ppi.width / 2 + R * Math.sin(az), y: ppi.height / 2 - R * Math.cos(az), Rm, az };
}

function updateLockReadout() {
  const box = document.getElementById("lockBox");
  if (!lockedShip) { box.style.display = "none"; return; }
  box.style.display = "";
  const s = lockedShip;
  const dc = s.c - radar.col, dr = s.r - radar.row;
  const Rm = Math.hypot(dc, dr) * DX;
  let az = Math.atan2(dc, -dr); if (az < 0) az += TAU;
  const cp = shipCPA(s);
  document.getElementById("lkId").textContent = "T" + s.id;
  document.getElementById("lkBrg").textContent = String(Math.round(az * 180 / Math.PI)).padStart(3, "0") + "°";
  document.getElementById("lkRng").textContent = (Rm / 1852).toFixed(2) + " nm";
  document.getElementById("lkCse").textContent = String(Math.round((s.hdg * 180 / Math.PI + 360) % 360)).padStart(3, "0") + "°";
  document.getElementById("lkSpd").textContent = (s.spdG * DX / 0.5144).toFixed(1) + " kn";
  document.getElementById("lkCpa").textContent = (cp.cpa / 1852).toFixed(2) + " nm";
  document.getElementById("lkTcpa").textContent = cp.tcpa < 0 ? "远离中" : fmtTime(cp.tcpa);
}

function updateMission() {
  const el = document.getElementById("stMission");
  if (!mission) { return; }
  const used = (performance.now() - mission.t0) / 1000;
  if (found.size >= ships.length && ships.length) {
    el.textContent = "✓ 全部发现！用时 " + used.toFixed(0) + " s";
    el.className = "mission ok";
    mission = null;
  } else if (used >= mission.dur) {
    el.textContent = "时间到：发现 " + found.size + "/" + ships.length;
    el.className = "mission bad";
    mission = null;
  } else {
    el.textContent = "任务 " + fmtTime(mission.dur - used) + " · 已发现 " + found.size + "/" + ships.length;
    el.className = "mission run";
  }
}

/* ---------- 回波计算 ---------- */
// 确定性位置噪声：同一栅格每次扫描结果一致（陆地不闪烁，海水仍闪烁）
function hash2(c, r) {
  let h = (c * 374761393 + r * 668265263) | 0;
  h = (h ^ (h >> 13)) * 1274126177 | 0;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

function computeRay(r) {
  const az = r * TAU / NRAYS;
  const sa = Math.sin(az), ca = Math.cos(az);
  const rangeM = params.rangeNm * 1852;
  const gateM = rangeM / NGATES;
  const SS = params.sea;
  const baseSea = 0.006 + 0.016 * Math.pow(SS / 5, 2.2);  // 海杂波基底：压到远低于陆地杂波，保证陆/海对比
  const rain = params.rain / 100;
  const refM = params.rangeNm * 1852 * 0.55;
  let hits = 0;
  for (let g = 0; g < NGATES; g++) {
    const Rm = (g + 0.5) * gateM;
    const col = radar.col + Rm * sa / DX;
    const row = radar.row - Rm * ca / DX;
    const idx = (row | 0) * NX + (col | 0);
    let sig;
    if (col < 0 || col >= NX || row < 0 || row >= NY) {
      sig = 0;
    } else if (land[idx] > 127) {
      const pc = col - sa * gateM / DX, pr = row + ca * gateM / DX;
      const pc2 = col - 2 * sa * gateM / DX, pr2 = row + 2 * ca * gateM / DX;
      const prev = g > 0 ? land[(pr | 0) * NX + (pc | 0)] : 0;
      const prev2 = g > 1 ? land[(pr2 | 0) * NX + (pc2 | 0)] : 0;
      const tv = tgt[idx] / 255;
      if (prev <= 127) {
        sig = 2.3;                                       // 岸壁强回波（水→陆第 1 门）
      } else if (prev2 <= 127) {
        sig = 1.5;                                       // 岸线余脉（第 2 门衰减）
      } else {
        sig = 0.30 + 0.70 * (den[idx] / 255) + 0.06 * hash2(col | 0, row | 0);  // 陆地杂波：真实密度 + 稳定位置噪声
      }
      if (tv > 0.1) sig += tv * 1.6;
      if (tv > 0.1) hits++;
    } else {
      const tv = tgt[idx] / 255;
      if (tv > 0.1) {                                  // 水中强目标：桥 / 码头
        sig = 0.05 + tv * 2.6; hits++;
      } else {
        const graz = Math.min(2.6, Math.pow(160 / Math.max(Rm, 40), 0.62) * 0.9 + 0.12);
        sig = baseSea * graz;
        const u = Math.random();
        sig *= Math.min(2.4, Math.sqrt(-2 * Math.log(1 - 0.999 * u)));  // 瑞利闪烁（截尾：抑制远距亮斑过密）
        if (rain > 0) sig += rain * 0.22 * Math.random();
      }
    }
    const R4 = Math.pow(Math.max(Rm, 30) / refM, 4);
    let I = sig / R4;                                   // 1/R⁴
    if (params.stc) I *= R4;                            // STC 补偿
    I += (0.004 + 0.02 * Math.random()) * (1.25 - params.gain);  // 噪底随增益
    echo[r * NGATES + g] = I;
  }
  // 船舶目标注入：扫描线经过船位时打出亮点（真实 PPI 显影方式：扫过才亮、余辉拖尾）
  const rayAz = r * TAU / NRAYS;
  for (const s of ships) {
    const dc = s.c - radar.col, dr = s.r - radar.row;
    const Rm = Math.hypot(dc, dr) * DX;
    if (Rm > rangeM || Rm < 30) continue;
    let az = Math.atan2(dc, -dr); if (az < 0) az += TAU;
    let dAz = az - rayAz;
    while (dAz > Math.PI) dAz -= TAU;
    while (dAz < -Math.PI) dAz += TAU;
    if (Math.abs(dAz) > 1.3 * TAU / NRAYS) continue;   // 波束宽度内（约 ±0.33°）
    const g0 = Math.round(Rm / gateM);
    const u = Math.random();
    const shipSig = 2.6 + 0.9 * Math.sqrt(-2 * Math.log(1 - 0.999 * u));  // 强散射体 + 瑞利闪烁
    for (let dg = -2; dg <= 2; dg++) {                 // 船身径向延伸 ±2 门（约 60–90m）
      const g = g0 + dg;
      if (g < 0 || g >= NGATES) continue;
      const R4s = Math.pow(Math.max((g + 0.5) * gateM, 30) / refM, 4);
      let I = shipSig / R4s;                           // 目标回波同样走 1/R⁴ + STC 管线
      if (params.stc) I *= R4s;
      const o = r * NGATES + g;
      if (I > echo[o]) echo[o] = I;
    }
    hits++;
  }
  if (hits > 0) cycleHits += hits;
  scanCycle[r] = cycle;
}

function rescan() {
  cycleHits = 0;
  for (let r = 0; r < NRAYS; r++) computeRay(r);
  paintAll();
}

/* ---------- PPI 渲染 ---------- */
function levelColor(L, out, o) {
  const g = Math.pow(Math.min(1, Math.max(0, L)), 0.6);
  out[o] = 6 + g * 40; out[o + 1] = 12 + g * 205; out[o + 2] = 9 + g * 95;
}

function paintPolar() {
  const pd = polar.data;
  for (let r = 0; r < NRAYS; r++) {
    const fresh = params.afterglow || scanCycle[r] === cycle;
    const base = r * NGATES;
    for (let g = 0; g < NGATES; g++) {
      const o = (base + g) * 4;
      if (!fresh) { pd[o] = 5; pd[o + 1] = 9; pd[o + 2] = 7; pd[o + 3] = 255; continue; }
      let L = echo[base + g] * (0.35 + params.gain * 1.35);
      levelColor(L, pd, o);
      pd[o + 3] = 255;
    }
  }
}

function paintAll() {
  paintPolar();
  const W = ppi.width, H = ppi.height, cx = W / 2, cy = H / 2;
  const rad = W / 2 - 26;
  const out = ppiImg.data, inpd = polar.data;
  const gateScale = NGATES / rad;
  for (let y = 0; y < H; y++) {
    const dy = y - cy;
    for (let x = 0; x < W; x++) {
      const dx = x - cx;
      const R = Math.sqrt(dx * dx + dy * dy);
      const o = (y * W + x) * 4;
      if (R > rad) { out[o] = 5; out[o + 1] = 9; out[o + 2] = 7; out[o + 3] = 255; continue; }
      let az = Math.atan2(dx, -dy); if (az < 0) az += TAU;
      const ray = (az * NRAYS / TAU) | 0;
      const gate = (R * gateScale) | 0;
      const s = (ray * NGATES + Math.min(gate, NGATES - 1)) * 4;
      out[o] = inpd[s]; out[o + 1] = inpd[s + 1]; out[o + 2] = inpd[s + 2]; out[o + 3] = 255;
    }
  }
  pctx.putImageData(ppiImg, 0, 0);
  drawOverlay();
}

function drawOverlay() {
  // 刻度环 / 方位标签 / 扫描线直接画在 PPI 画布上（putImageData 之后调用）。
  // 不再使用独立叠加画布：GPU 合成下叠加层会遮挡 putImageData 的内容（实测黑屏根因）。
  const W = ppi.width, H = ppi.height, cx = W / 2, cy = H / 2;
  const rad = W / 2 - 26;
  const rings = 4;
  pctx.strokeStyle = "rgba(120,190,140,0.28)";
  pctx.lineWidth = 1;
  pctx.font = "11px Consolas,monospace";
  pctx.fillStyle = "rgba(150,210,170,0.75)";
  pctx.textAlign = "left";
  for (let i = 1; i <= rings; i++) {
    const rr = rad * i / rings;
    pctx.beginPath(); pctx.arc(cx, cy, rr, 0, TAU); pctx.stroke();
    pctx.fillText((params.rangeNm * i / rings).toFixed(1), cx + 4, cy - rr + 12);
  }
  for (let a = 0; a < 360; a += 30) {
    const t = a * Math.PI / 180;
    pctx.fillStyle = "rgba(150,210,170,0.8)";
    pctx.textAlign = "center";
    pctx.fillText(String(a).padStart(3, "0"), cx + (rad + 20) * Math.sin(t), cy - (rad + 20) * Math.cos(t) + 4);
    pctx.strokeStyle = "rgba(120,190,140,0.18)";
    pctx.beginPath(); pctx.moveTo(cx, cy);
    pctx.lineTo(cx + rad * Math.sin(t), cy - rad * Math.cos(t)); pctx.stroke();
  }
  const az = sweepRay * TAU / NRAYS;
  pctx.strokeStyle = "rgba(160,255,190,0.9)";
  pctx.lineWidth = 2;
  pctx.beginPath(); pctx.moveTo(cx, cy);
  pctx.lineTo(cx + rad * Math.sin(az), cy - rad * Math.cos(az)); pctx.stroke();
  pctx.fillStyle = "#FFC707";
  pctx.beginPath(); pctx.arc(cx, cy, 3, 0, TAU); pctx.fill();
  // ARPA 目标符号：锁定框（青色四角括号）/ 碰撞危险（红圈）/ 任务已发现（细圈）
  for (const s of ships) {
    const p = shipScreenPos(s);
    if (!p) continue;
    if (s === lockedShip) {
      pctx.strokeStyle = "#5df2ff";
      pctx.lineWidth = 2;
      const L = 9, B = 14;
      for (const q of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        pctx.beginPath();
        pctx.moveTo(p.x + q[0] * B, p.y + q[1] * (B - L));
        pctx.lineTo(p.x + q[0] * B, p.y + q[1] * B);
        pctx.lineTo(p.x + q[0] * (B - L), p.y + q[1] * B);
        pctx.stroke();
      }
      pctx.fillStyle = "#5df2ff";
      pctx.font = "bold 12px Consolas,monospace";
      pctx.textAlign = "left";
      pctx.fillText("T" + s.id, p.x + B + 4, p.y - B + 4);
    } else if (danger.has(s.id)) {
      pctx.strokeStyle = "rgba(255,107,93,0.95)";
      pctx.lineWidth = 2;
      pctx.beginPath(); pctx.arc(p.x, p.y, 12, 0, TAU); pctx.stroke();
      pctx.fillStyle = "rgba(255,107,93,0.95)";
      pctx.font = "bold 11px Consolas,monospace";
      pctx.textAlign = "left";
      pctx.fillText("T" + s.id, p.x + 14, p.y - 10);
    } else if (mission && found.has(s.id)) {
      pctx.strokeStyle = "rgba(93,242,255,0.55)";
      pctx.lineWidth = 1;
      pctx.beginPath(); pctx.arc(p.x, p.y, 10, 0, TAU); pctx.stroke();
    }
  }
}

/* ---------- 小地图 ---------- */
function drawMinimap() {
  const W = mmc.width, H = mmc.height;
  if (!params.chart) {  // 海图关闭：沉浸式——只给量程圈和站标，地理信息全靠 PPI 判读
    mctx.fillStyle = "#0a1210";
    mctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    mctx.strokeStyle = "rgba(120,190,140,0.3)";
    mctx.lineWidth = 1;
    mctx.beginPath(); mctx.arc(cx, cy, Math.min(W, H) / 2 - 34, 0, TAU); mctx.stroke();
    mctx.fillStyle = "rgba(150,210,170,0.85)";
    mctx.font = "13px sans-serif";
    mctx.textAlign = "center";
    mctx.fillText("海图已关闭 · 仅凭 PPI 判读态势", cx, cy - 8);
    mctx.font = "11.5px sans-serif";
    mctx.fillStyle = "rgba(150,210,170,0.55)";
    mctx.fillText("仍可点击换位——但点在江上还是岸上，自己掂量", cx, cy + 14);
    mctx.fillStyle = "#FFC707";
    mctx.beginPath(); mctx.arc(cx, cy, 4, 0, TAU); mctx.fill();
    mctx.font = "bold 12px Consolas,monospace";
    mctx.fillText("N", cx, 24);
    return;
  }
  const sx = W / NX, sy = H / NY;
  const im = mctx.createImageData(W, H);
  const d = im.data;
  for (let y = 0; y < H; y++) {
    const sy0 = (y / sy) | 0;
    for (let x = 0; x < W; x++) {
      const i = sy0 * NX + ((x / sx) | 0);
      const o = (y * W + x) * 4;
      if (land[i] > 127) {
        const dv = den[i] / 255;                        // 陆地按杂波密度明暗：建成区亮、郊野暗
        const g0 = 66 + 150 * dv;
        d[o] = g0 * 0.95; d[o + 1] = g0; d[o + 2] = g0 * 0.92;
      }
      else { d[o] = 34; d[o + 1] = 66; d[o + 2] = 92; }
      d[o + 3] = 255;
      const tv = tgt[i];
      if (tv > 200) { d[o] = 235; d[o + 1] = 90; d[o + 2] = 80; }        // 码头
      else if (tv >= 150) { d[o] = 230; d[o + 1] = 190; d[o + 2] = 60; } // 桥梁
    }
  }
  mctx.putImageData(im, 0, 0);
  const cx = radar.col * sx, cy = radar.row * sy;
  const rangePx = params.rangeNm * 1852 / DX * sx;
  mctx.strokeStyle = "rgba(255,199,7,0.85)";
  mctx.lineWidth = 1.5;
  mctx.beginPath(); mctx.arc(cx, cy, Math.min(rangePx, 400), 0, TAU); mctx.stroke();
  mctx.fillStyle = "#FFC707";
  mctx.beginPath(); mctx.arc(cx, cy, 5, 0, TAU); mctx.fill();
}

/* ---------- 主循环 ---------- */
const SHOT_MODE = new URLSearchParams(location.search).has("shot");  // 截图模式：加密探针刷新
const RAYS_PER_FRAME = 12;
let lastT = 0;
function loop(t) {
  const dt = lastT ? Math.min(0.1, (t - lastT) / 1000) : 0.016;  // 真实时间步长：不同刷新率下船速一致
  lastT = t;
  updateShips(dt);
  for (let k = 0; k < RAYS_PER_FRAME; k++) {
    computeRay(sweepRay);
    sweepRay = (sweepRay + 1) % NRAYS;
    if (sweepRay === 0) { cycle++; cycleHits = 0; }
  }
  paintAll();
  updateStatus();
  updateMission();
  if ((loop._w = (loop._w || 0) + 1) % 30 === 0) {   // ARPA 碰撞告警（节流 0.5s）
    danger.clear();
    for (const s of ships) {
      const cp = shipCPA(s);
      if (cp.tcpa > 0 && cp.tcpa < 480 && cp.cpa < 0.6 * 1852) danger.add(s.id);
    }
    const w = document.getElementById("stWarn");
    if (danger.size) {
      w.textContent = "⚠ 碰撞危险 " + [...danger].map(i => "T" + i).join(" ");
      w.style.display = "";
    } else w.style.display = "none";
  }
  if ((loop._t = (loop._t || 0) + 1) % (SHOT_MODE ? 3 : 30) === 0) {
    let mx = 0, sum = 0, n = 0;
    for (let i = 0; i < echo.length; i += 101) { if (echo[i] > mx) mx = echo[i]; sum += echo[i]; n++; }
    setProbe("probePpi", ppi.toDataURL());
    if (!SHOT_MODE) {
      setProbe("probeMm", mmc.toDataURL());
    }
    const pr = ppi.getBoundingClientRect(), mr = mmc.getBoundingClientRect();
    document.title = "E max=" + mx.toFixed(3) + " mean=" + (sum / n).toFixed(4)
      + " | ppi " + [Math.round(pr.left), Math.round(pr.top), Math.round(pr.width)].join(",")
      + " | mm " + [Math.round(mr.left), Math.round(mr.top), Math.round(mr.width), Math.round(mr.height)].join(",");
  }
  requestAnimationFrame(loop);
}

/* ---------- 状态与交互 ---------- */
function nearestWater(col, row) {
  if (col >= 0 && col < NX && row >= 0 && row < NY && land[row * NX + col] <= 127) return { col, row };
  for (let r = 2; r < 220; r += 2) {
    for (let a = 0; a < 48; a++) {
      const t = a / 48 * TAU;
      const c = (col + r * Math.cos(t)) | 0, w = (row + r * Math.sin(t)) | 0;
      if (c >= 0 && c < NX && w >= 0 && w < NY && land[w * NX + c] <= 127) return { col: c, row: w };
    }
  }
  return { col: META.default_radar.col, row: META.default_radar.row };
}

const MX_PER_DEG = 111320 * Math.cos(32.175 * Math.PI / 180);
function col2lon(c) { return ORIGIN_LON + c * DX / MX_PER_DEG; }
function row2lat(r) { return ORIGIN_LAT - r * DX / 110574; }

function updateStatus() {
  const lon = col2lon(radar.col), lat = row2lat(radar.row);
  document.getElementById("stPos").textContent = lat.toFixed(4) + "°N, " + lon.toFixed(4) + "°E";
  document.getElementById("stRange").textContent = params.rangeNm + " n mile";
  document.getElementById("stSweep").textContent = String(Math.round(sweepRay * 360 / NRAYS)).padStart(3, "0") + "°";
  const gateM = params.rangeNm * 1852 / NGATES;
  document.getElementById("stRes").textContent = Math.round(gateM) + " m";
  document.getElementById("rLon").textContent = lon.toFixed(5) + "° E";
  document.getElementById("rLat").textContent = lat.toFixed(5) + "° N";
  const i = radar.row * NX + radar.col;
  document.getElementById("rOn").textContent = (land && land[i] > 127) ? "陆地（建议移至水面）" : "水域";
  document.getElementById("rHits").textContent = cycleHits;
  updateLockReadout();
}

mmc.addEventListener("click", e => {
  const rect = mmc.getBoundingClientRect();
  const col = (e.clientX - rect.left) / rect.width * NX;
  const row = (e.clientY - rect.top) / rect.height * NY;
  const p = nearestWater(col | 0, row | 0);
  radar = p;
  rescan(); drawMinimap();
});

document.getElementById("pRange").addEventListener("change", e => {
  params.rangeNm = parseFloat(e.target.value); rescan(); drawMinimap();
});
document.getElementById("pSea").addEventListener("input", e => {
  params.sea = +e.target.value;
  document.getElementById("vSea").textContent = params.sea + " 级";
  rescan();
});
document.getElementById("pGain").addEventListener("input", e => {
  params.gain = e.target.value / 100;
  document.getElementById("vGain").textContent = e.target.value + "%";
  paintAll();
});
document.getElementById("pRain").addEventListener("input", e => {
  params.rain = +e.target.value;
  document.getElementById("vRain").textContent = params.rain === 0 ? "关" : e.target.value + "%";
  rescan();
});
document.getElementById("pStc").addEventListener("change", e => { params.stc = e.target.checked; rescan(); });
document.getElementById("pAfter").addEventListener("change", e => { params.afterglow = e.target.checked; });
document.getElementById("pChart").addEventListener("change", e => { params.chart = e.target.checked; drawMinimap(); });
document.getElementById("btnMission").addEventListener("click", () => {
  if (mission) {   // 再按一次 = 放弃任务
    mission = null;
    const el = document.getElementById("stMission");
    el.textContent = "";
    el.className = "mission";
    return;
  }
  mission = { t0: performance.now(), dur: 90 };
  found.clear();
  lockedShip = null;
  updateLockReadout();
});
// PPI 点击锁定：点中亮点（26px 捕获窗）→ ARPA 锁定；点空白 → 解锁
ppi.addEventListener("click", e => {
  const rect = ppi.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (ppi.width / rect.width);
  const py = (e.clientY - rect.top) * (ppi.height / rect.height);
  let best = null, bestD = 26;
  for (const s of ships) {
    const p = shipScreenPos(s);
    if (!p) continue;
    const d = Math.hypot(p.x - px, p.y - py);
    if (d < bestD) { bestD = d; best = s; }
  }
  lockedShip = best;
  if (best) found.add(best.id);
  updateLockReadout();
});
document.getElementById("btnHome").addEventListener("click", () => {
  radar = { col: META.default_radar.col, row: META.default_radar.row };
  rescan(); drawMinimap();
});
document.getElementById("btnRescan").addEventListener("click", rescan);
