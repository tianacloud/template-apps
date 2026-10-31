// game/wiper.js
// 覆盖率模型 + 6 种污渍 × 3 种道具的处理矩阵。纯逻辑，不直接依赖 three / DOM，便于推理与测试。
//
// 每帧（指针按住时）由控制器调用 tick(stains, uv, dt)：
//   - 计算指针相对上一帧的位移（世界量）与转向，用于打圈/贴纸判定
//   - 对笔刷范围内的每块污渍，按其类型与当前工具降低 coverage
//   - coverage <= threshold 即视为该块清除
//
// 道具：wipe(🧽 干擦) / spray(💧 喷水) / brush(🪥 刷子)
// 污渍：mist(水雾) / dust(灰尘) / fingerprint(指纹) / oil(油污) / stubborn(顽固渍) / sticker(贴纸)
//
// 处理矩阵（细化不同道具对不同污渍的效率，见 TOOL_EFF）：
//   🧽 干擦   : 去水雾/灰尘/指纹；对油污无效（需先喷水）；顽固渍/贴纸效率低
//   💧 喷水   : 不直接擦除，仅「打湿油污」使其可被擦除；对浮尘有轻微冲洗
//   🪥 刷子   : 大笔刷、力度强；灰尘/顽固渍/贴纸更在行，油污仍需先喷水

import { PLANE_W, PLANE_H, FACE_DIMS } from '../level/generator.js';

const AVG = (PLANE_W + PLANE_H) / 2;

// 笔刷半径（uv 比例），brush 更大
const BRUSH_R = { wipe: 0.1, brush: 0.14, spray: 0.16 };
export { BRUSH_R };

// 各污渍每秒降 coverage 基准速率（factor=1、对应道具效率=1 时）
const BASE_RATE = {
  mist: 14,
  dust: 13,
  fingerprint: 11,
  oil: 18,        // 仅在 wet>=1（喷水后）才生效
  stubborn: 20,   // 仅在打圈累积后才明显生效
  sticker: 45,    // 仅在 peeling（已进入剥离）后生效
};

// 道具 × 污渍 效率矩阵（细化每种道具对不同污渍的处理）
// spray 的 oil 固定走「打湿」分支（见 tick），此处 0 仅表示 spray 不直接降低油污 coverage
const TOOL_EFF = {
  wipe:  { mist: 1.0, dust: 1.0, fingerprint: 1.0, oil: 0.9, stubborn: 1.0, sticker: 0.6 },
  spray: { mist: 0.12, dust: 0.1, fingerprint: 0.0, oil: 0.0, stubborn: 0.0, sticker: 0.0 },
  brush: { mist: 0.7, dust: 1.2, fingerprint: 1.1, oil: 1.1, stubborn: 1.4, sticker: 1.2 },
};

const FINGER_PRESS_MS = 600; // 指纹「稍长按压更明显」的 ramp 时长
const STICKER_HOLD_MS = 400; // 长按进入剥离
const STICKER_MOVE_EPS = 0.004; // 视为「基本不动」的位移阈值（uv 世界量）

export function isCleared(s) {
  return s.coverage <= s.threshold;
}

export class Wiper {
  constructor() {
    this.active = false;
    this.tool = 'wipe';
    this.brushScale = 1; // 触摸端略大
    this.face = null; // 当前正在擦拭的面（null = 不限面，兼容旧测试桩）
    this.downTime = 0;
    this.lastUv = null;
    this.lastHeading = null;
    this.hold = new Map(); // stainId -> 静止累计毫秒（贴纸用）
  }

  setTool(tool) {
    if (tool === 'wipe' || tool === 'spray' || tool === 'brush') this.tool = tool;
  }

  // face：当前命中面（由控制器从射线拾取得到）。传入后只影响该面的污渍；不传则不限面（兼容旧调用）。
  begin(uv, tool, face) {
    this.active = true;
    if (tool) this.setTool(tool);
    if (face != null) this.face = face;
    this.downTime = performance.now();
    this.lastUv = { ...uv };
    this.lastHeading = null;
    this.hold.clear();
  }

  end() {
    this.active = false;
    this.lastUv = null;
    this.lastHeading = null;
    this.hold.clear();
  }

  _brushWorld(fd) {
    const f = fd || { w: PLANE_W, h: PLANE_H };
    return BRUSH_R[this.tool] * (f.w + f.h) / 2 * this.brushScale;
  }

  // 供外部（如清洁剂卡命中测试）读取当前笔刷世界半径（可传面尺寸）
  brushWorldNow(fd) {
    return this._brushWorld(fd);
  }

  // 主循环：返回 { hints: string[], clearedNow: number[] }
  tick(stains, uv, dt) {
    if (!this.active) return { hints: [], clearedNow: [] };
    const hints = new Set();
    const clearedNow = [];

    // 指针移动的世界量：用当前命中面的尺寸换算（默认取前表面尺寸）
    const fd = (this.face != null && FACE_DIMS[this.face]) ? FACE_DIMS[this.face] : { w: PLANE_W, h: PLANE_H };
    const dx = (uv.u - this.lastUv.u) * fd.w;
    const dy = (uv.v - this.lastUv.v) * fd.h;
    const deltaLen = Math.hypot(dx, dy);
    const heading = deltaLen > 1e-6 ? Math.atan2(dy, dx) : this.lastHeading;
    const turn = this.lastHeading != null && deltaLen > 1e-6
      ? Math.abs(Math.sin(heading - this.lastHeading))
      : 0;

    const now = performance.now();

    if (this.tool === 'spray') {
      // 喷水：范围内 oil 打湿(wet=1，便于后续擦拭)，其余污渍按 spray 效率轻微冲洗
      const brushW = this._brushWorld(fd);
      for (const s of stains) {
        if (this.face != null && s.face !== this.face) continue;
        if (isCleared(s)) continue;
        const fw = s.fw ?? PLANE_W, fh = s.fh ?? PLANE_H;
        const sx = (s.u - uv.u) * fw, sy = (s.v - uv.v) * fh;
        const dist = Math.hypot(sx, sy);
        const stainW = s.radius * (fw + fh) / 2;
        if (dist >= brushW + stainW) continue;
        const factor = Math.max(0, 1 - dist / (brushW + stainW));
        if (s.type === 'oil') {
          s.wet = 1; // 打湿油污：后续用擦拭/刷子才能清除
        } else {
          const eff = TOOL_EFF.spray[s.type] || 0;
          if (eff > 0) s.coverage -= BASE_RATE[s.type] * eff * dt * factor;
        }
      }
      this.lastUv = { ...uv };
      this.lastHeading = heading;
      return { hints: [], clearedNow: [] };
    }

    // wipe / brush：擦拭（仅作用于当前命中面）
    for (const s of stains) {
      if (isCleared(s)) continue;
      if (this.face != null && s.face !== this.face) continue;
      const fw = s.fw ?? PLANE_W;
      const fh = s.fh ?? PLANE_H;
      const sx = (s.u - uv.u) * fw;
      const sy = (s.v - uv.v) * fh;
      const dist = Math.hypot(sx, sy);
      const brushW = this._brushWorld({ w: fw, h: fh });
      const stainW = s.radius * (fw + fh) / 2;
      if (dist >= brushW + stainW) continue;

      const factor = Math.max(0, 1 - dist / (brushW + stainW)); // 重叠度
      const eff = TOOL_EFF[this.tool][s.type] ?? 0;

      switch (s.type) {
        case 'mist':
        case 'dust': {
          s.coverage -= BASE_RATE[s.type] * eff * dt * factor;
          break;
        }
        case 'fingerprint': {
          const press = Math.min(1, (now - this.downTime) / FINGER_PRESS_MS);
          const ramp = 0.4 + 0.6 * press; // 长按更明显
          s.coverage -= BASE_RATE.fingerprint * ramp * eff * dt * factor;
          break;
        }
        case 'oil': {
          if (s.wet >= 1) {
            s.coverage -= BASE_RATE.oil * eff * dt * factor;
          } else {
            s.coverage -= 0; // 未打湿：几乎不动
            hints.add('先喷点水（油污需先喷水）');
          }
          break;
        }
        case 'stubborn': {
          // 打圈累积：转向越大、移动越多，累积越快；单方向快划效率低
          s.circularAccum = Math.min(1, s.circularAccum + deltaLen * turn * 6);
          s.circularAccum *= 1 - dt * 0.4; // 停止打圈则缓慢衰减
          const effC = (0.15 + 0.85 * s.circularAccum) * eff;
          s.coverage -= BASE_RATE.stubborn * effC * dt * factor;
          break;
        }
        case 'sticker': {
          if (s.peeling) {
            // 已进入剥离：拖动即剥离（刷子效率更高）
            s.coverage -= BASE_RATE.sticker * eff * dt * factor;
          } else if (deltaLen < STICKER_MOVE_EPS) {
            // 基本不动 -> 累计长按
            const h = (this.hold.get(s.id) || 0) + dt * 1000;
            this.hold.set(s.id, h);
            if (h >= STICKER_HOLD_MS) {
              s.peeling = true;
              hints.add('贴纸开始剥离，拖动撕下（刷子更快）');
            }
          } else {
            // 移动了 -> 重置长按（必须先按住）
            this.hold.set(s.id, 0);
          }
          break;
        }
        default:
          break;
      }

      if (s.coverage < 0) s.coverage = 0;
      if (isCleared(s) && !s._wasCleared) {
        s._wasCleared = true;
        clearedNow.push(s.id);
      }
    }

    this.lastUv = { ...uv };
    this.lastHeading = heading;
    return { hints: [...hints], clearedNow };
  }
}
