// level/stains.js
// 6 种污渍定义：阈值、颜色（灰盒用纯色块）、对应手法、是否需要前置条件。
//
// 手法（technique）说明：
//   wipe   : 拖拭直接降 coverage
//   spray  : 必须先用喷水工具使其 wet=1 才能擦动（否则几乎不动 + 提示「先喷点水」）
//   circle : 需打圈累积移动距离才快速下降（单方向快划效率低）
//   peel   : 长按进入 peel，再沿拖拽方向剥离
// 其中 fingerprint 也用 wipe，但「稍长按压更明显」（按下时长提升速率）。

export const STAIN_TYPES = ['mist', 'dust', 'fingerprint', 'oil', 'stubborn', 'sticker'];

export const THRESHOLDS = {
  mist: 90,
  dust: 92,
  fingerprint: 90,
  oil: 93,
  stubborn: 95,
  sticker: 98,
};

// 灰盒颜色（擦除前可见的污渍色块）
export const STAIN_COLOR = {
  mist: 0xbfe0ff, // 水雾：淡蓝白
  dust: 0xc9b08a, // 灰尘：土黄
  fingerprint: 0xe2cfa6, // 指纹：偏肤色
  oil: 0x8a8068, // 油污：暗油黄
  stubborn: 0x6b5b4b, // 顽固渍：深褐
  sticker: 0xff8f8f, // 贴纸：粉红
};

// 手法映射
export const STAIN_TECHNIQUE = {
  mist: 'wipe',
  dust: 'wipe',
  fingerprint: 'wipe',
  oil: 'spray',
  stubborn: 'circle',
  sticker: 'peel',
};

// 是否需要「喷水润湿」前置（oil）
export function needsWet(type) {
  return type === 'oil';
}

// 覆盖率 -> 污渍视觉透明度。coverage=100 时最明显(alpha=1)，降到阈值时淡出为 0。
export function coverageToAlpha(coverage, threshold) {
  const t = (coverage - threshold) / (100 - threshold);
  return Math.max(0, Math.min(1, t));
}
