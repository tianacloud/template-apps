// level/generator.js
// 关卡确定性生成：给定 dayIndex(1..365)，产出完全可复现的关卡数据。
// 同 dayIndex 每次进入完全一致（历史可补、刷新一致）。
//
// 产物：材质变体、污渍数量（第1-7天 2-3 块；之后 3→11 随天数递增封顶 11）、
//       污渍类型组合、位置（uv 0..1 留边距 0.12）、金句(QUOTES[dayIndex-1])。
//
// 注意：rng() 的「调用顺序」决定了关卡布局。本文件固定调用顺序以保持跨版本稳定。

import { makeRng, pick, randInt } from '../core/prng.js';
import { QUOTES } from './quotes.js';
import { THRESHOLDS } from './stains.js';

export const PLANE_W = 2.4;
export const PLANE_H = 3.0;
export const UV_MARGIN = 0.12;

// 玻璃厚度（立方体），让玻璃有体积感、可从多个面清理
export const GLASS_THICK = 0.5;

// 立方体 6 个面的索引（与 three.js BoxGeometry 的面顺序一致：+X,-X,+Y,-Y,+Z,-Z）
export const FACE_RIGHT = 0;   // +X
export const FACE_LEFT = 1;    // -X
export const FACE_TOP = 2;     // +Y
export const FACE_BOTTOM = 3;  // -Y
export const FACE_FRONT = 4;   // +Z（金句贴合面）
export const FACE_BACK = 5;    // -Z

// 每个面的世界尺寸 {w,h}（uv 0..1 映射到该矩形）。前/后面 = 宽×高；左/右面 = 厚×高；上/下面 = 宽×厚。
export const FACE_DIMS = {
  [FACE_RIGHT]: { w: GLASS_THICK, h: PLANE_H },
  [FACE_LEFT]: { w: GLASS_THICK, h: PLANE_H },
  [FACE_TOP]: { w: PLANE_W, h: GLASS_THICK },
  [FACE_BOTTOM]: { w: PLANE_W, h: GLASS_THICK },
  [FACE_FRONT]: { w: PLANE_W, h: PLANE_H },
  [FACE_BACK]: { w: PLANE_W, h: PLANE_H },
};

// 金句所在的「主面」：前表面（+Z）。污渍可分布在全部 6 个面，但金句只在前表面，玩家擦前表面时逐步显形。
export const QUOTE_FACE = FACE_FRONT;

// D2：材质按天加权——前 30 天 clear 占主导，之后逐步引入 frosted/tinted/gradient。
// 用「加权候选列表 + 单次 rng() 抽取」实现，保持 rng 调用顺序不变（仍 1 次）。
export function materialCandidates(dayIndex) {
  const clearW = dayIndex < 30 ? 6 : 3;
  const frostedW = dayIndex < 30 ? 0 : dayIndex < 60 ? 2 : 3;
  const tintedW = dayIndex < 30 ? 0 : dayIndex < 60 ? 1 : 3;
  const gradientW = dayIndex < 30 ? 0 : dayIndex < 90 ? 1 : 2;
  const c = [];
  for (let i = 0; i < clearW; i++) c.push('clear');
  for (let i = 0; i < frostedW; i++) c.push('frosted');
  for (let i = 0; i < tintedW; i++) c.push('tinted');
  for (let i = 0; i < gradientW; i++) c.push('gradient');
  return c;
}

// D1：污渍类型池按天渐进解锁——前 7 天仅 mist/dust；@8 +fingerprint；@30 +oil；@60 +stubborn；@90 +sticker。
export function stainPoolForDay(dayIndex) {
  const pool = ['mist', 'dust'];
  if (dayIndex >= 8) pool.push('fingerprint');
  if (dayIndex >= 30) pool.push('oil');
  if (dayIndex >= 60) pool.push('stubborn');
  if (dayIndex >= 90) pool.push('sticker');
  return pool;
}

// 污渍数量：覆盖整块玻璃所需的小污渍数量，随天数温和递增（越多越"脏"、越有得擦）
function totalStainCount(dayIndex) {
  if (dayIndex <= 7) return 28; // 前 7 天教学量，仍覆盖整面
  const span = 365 - 7;
  const t = Math.min(1, (dayIndex - 7) / span);
  return Math.round(28 + t * 132); // 28 -> 160
}

// 在给定面上以「抖动网格」密铺 n 个污渍，保证覆盖整面、彼此略重叠、位置确定性。
// 返回 [{u, v, r}]，r 为 uv 半径（使相邻污渍略重叠 => 整面被覆盖）。
// 限制：r 上限 0.2（避免单块污渍过大超出玻璃比例）；圆盘中心夹紧到 [r, 1-r]，
// 保证整块污渍（半径 r）落在面内，不会溢出玻璃边缘。
function scatterOnFace(dims, n, rng) {
  const aspect = dims.w / dims.h;
  let cols = Math.max(2, Math.round(Math.sqrt(n * aspect)));
  let rows = Math.max(2, Math.round(n / cols));
  while (cols * rows < n) {
    if ((cols / rows) < aspect) cols++; else rows++;
  }
  const minHalf = 0.5 * Math.min(1 / cols, 1 / rows);
  let r = minHalf * 1.4; // uv 半径：相邻污渍略重叠，覆盖整面
  r = Math.min(r, 0.2); // 上限：污渍不要超出玻璃尺寸太多
  const pts = [];
  let k = 0;
  for (let rr = 0; rr < rows && k < n; rr++) {
    for (let c = 0; c < cols && k < n; c++) {
      const jx = (rng() - 0.5) * 0.5;
      const jy = (rng() - 0.5) * 0.5;
      let u = Math.min(0.97, Math.max(0.03, (c + 0.5 + jx) / cols));
      let v = Math.min(0.97, Math.max(0.03, (rr + 0.5 + jy) / rows));
      // 夹紧：整块污渍（半径 r）必须落在面内，不溢出玻璃边缘
      u = Math.min(1 - r, Math.max(r, u));
      v = Math.min(1 - r, Math.max(r, v));
      pts.push({ u, v, r });
      k++;
    }
  }
  return pts;
}

// 污渍呈现形态：重污渍（顽固渍 / 贴纸）以「附着在玻璃表面的 3D 块」呈现，其余以轻薄污点呈现。
function shapeFor(type) {
  if (type === 'stubborn' || type === 'sticker') return 'block';
  return 'dot';
}

// 污渍在 6 个面间的分配：前表面（金句面）承载较多以遮挡金句；其余 5 个面平分剩余，实现「整块玻璃 6 面都可擦」。
function facePlan(total) {
  const frontN = Math.max(14, Math.round(total * 0.38));
  const othersN = total - frontN;
  const sides = [FACE_RIGHT, FACE_LEFT, FACE_TOP, FACE_BOTTOM, FACE_BACK];
  const per = Math.floor(othersN / sides.length);
  let rem = othersN - per * sides.length;
  const plan = [{ face: FACE_FRONT, n: frontN }];
  for (const f of sides) {
    plan.push({ face: f, n: per + (rem-- > 0 ? 1 : 0) });
  }
  return plan;
}

export function generateLevel(dayIndex) {
  // F2 修复：dayIndex 封顶到 1..365，避免 QUOTES[dayIndex-1] 越界（undefined）。
  // 游戏为有限 365 天，越界天按第 365 天处理（与 currentDayIndex 封顶一致）。
  const idx = Math.min(365, Math.max(1, dayIndex | 0));
  const rng = makeRng(idx);

  // 1) 材质变体（按天加权，D2）
  const material = pick(rng, materialCandidates(idx));

  // 2) 污渍：覆盖整块玻璃的密铺小污渍（小点 / 3D 块），分布在全部 6 个面
  const total = totalStainCount(idx);
  const plan = facePlan(total);
  const stains = [];
  let id = 0;
  for (const p of plan) {
    const dims = FACE_DIMS[p.face];
    const pts = scatterOnFace(dims, p.n, rng);
    for (const pt of pts) {
      const type = pick(rng, stainPoolForDay(idx));
      stains.push({
        id: id++,
        type,
        u: pt.u,
        v: pt.v,
        face: p.face,
        fw: dims.w, // 该面世界宽（wiper 用）
        fh: dims.h, // 该面世界高（wiper 用）
        radius: pt.r,
        shape: shapeFor(type),
        coverage: 100,
        threshold: THRESHOLDS[type],
        wet: 0, // oil 专用
        circularAccum: 0, // stubborn 专用：打圈累积
        peeling: false, // sticker 专用：是否已进入剥离
      });
    }
  }

  // 4) 金句
  const quote = QUOTES[idx - 1];

  return {
    dayIndex: idx,
    material,
    quote,
    stains,
  };
}

// 仅生成「元数据」（用于日历/调试，不依赖 three）
export function generateSummary(dayIndex) {
  const lvl = generateLevel(dayIndex);
  return {
    dayIndex: lvl.dayIndex,
    material: lvl.material,
    quote: lvl.quote,
    stainCount: lvl.stains.length,
    stainTypes: lvl.stains.map((s) => s.type),
  };
}
