// core/prng.js
// 确定性伪随机数：同一 dayIndex 永远产出同一序列（用于关卡确定性生成）。
// 算法：xmur3 把字符串哈希成 32-bit 种子，mulberry32 由种子展开成 [0,1) 流。

export function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 关卡种子：与设计案一致 —— mulberry32(xmur3("glass365:" + dayIndex)())
export function makeRng(dayIndex) {
  const seed = xmur3('glass365:' + dayIndex)();
  return mulberry32(seed);
}

// 工具：闭区间随机整数 [min, max]
export function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

// 工具：从数组里按 rng 取一个元素
export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}
