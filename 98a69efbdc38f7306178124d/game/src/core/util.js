// 基础工具：确定性随机、噪声、轻量 store、事件总线

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const TAU = Math.PI * 2;

/** 可种子化随机（mulberry32），同一 seed 序列完全可复现 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** 平滑值噪声，用于地形起伏 */
export function noise2(x, y, seed = 1) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed), b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed), d = hash2(ix + 1, iy + 1, seed);
  return lerp(lerp(a, b, sx), lerp(c, d, sx), sy);
}

export const dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

export function uid(prefix = 'e') {
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

/** 极简 store：get / set / patch / subscribe，接口对齐 Zustand 的心智模型 */
export function createStore(initial) {
  let state = initial;
  const subs = new Set();
  return {
    get: () => state,
    set(next) {
      state = typeof next === 'function' ? next(state) : { ...state, ...next };
      subs.forEach((fn) => fn(state));
      return state;
    },
    patch(partial) {
      state = { ...state, ...partial };
      subs.forEach((fn) => fn(state));
      return state;
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

export const bus = {
  map: new Map(),
  on(evt, fn) {
    if (!this.map.has(evt)) this.map.set(evt, new Set());
    this.map.get(evt).add(fn);
    return () => this.map.get(evt).delete(fn);
  },
  emit(evt, payload) {
    const s = this.map.get(evt);
    if (s) s.forEach((fn) => fn(payload));
  },
};

export function fmt(n) {
  if (!isFinite(n)) return '0';
  return Math.round(n).toLocaleString('en-US');
}

export function goldStr(copper) {
  const g = Math.floor(copper / 100);
  const s = Math.floor((copper % 100) / 10);
  const c = copper % 10;
  return `${g}金 ${s}银 ${c}铜`;
}

export function pickWeighted(list, rng) {
  const total = list.reduce((s, x) => s + x.w, 0);
  let r = rng() * total;
  for (const x of list) {
    r -= x.w;
    if (r <= 0) return x;
  }
  return list[list.length - 1];
}

export function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
