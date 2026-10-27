// ui/cursors.js
// 不同工具对应不同的鼠标指针（自定义 SVG，纯离线、无需外部文件）。
// 导出的 cursorFor(tool) 返回可直接赋给 element.style.cursor 的 CSS 字符串。

function svgCursor(svg, hx, hy, fallback) {
  const enc = encodeURIComponent(svg.replace(/\s+/g, ' ').trim());
  return `url("data:image/svg+xml,${enc}") ${hx} ${hy}, ${fallback}`;
}

// 🧽 干擦：海绵（青色圆角块 + 白点）
const WIPE = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
  <rect x="4" y="4" width="22" height="20" rx="5" fill="#16b5a6" stroke="#ffffff" stroke-width="2"/>
  <g fill="#ffffff">
    <circle cx="10" cy="10" r="1.6"/><circle cx="16" cy="13" r="1.6"/><circle cx="21" cy="10" r="1.6"/>
    <circle cx="13" cy="18" r="1.6"/><circle cx="20" cy="17" r="1.6"/>
  </g></svg>`;

// 💧 喷水：水滴（蓝色）
const SPRAY = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
  <path d="M15 3 C15 3 24 16 24 20 a9 9 0 0 1 -18 0 C6 16 15 3 15 3 Z" fill="#3aa0ff" stroke="#ffffff" stroke-width="2"/></svg>`;

// 🪥 刷子：手柄 + 刷头
const BRUSH = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
  <rect x="12" y="2" width="6" height="14" rx="2" fill="#b5752f"/>
  <rect x="7" y="15" width="16" height="11" rx="2" fill="#e08a5b" stroke="#ffffff" stroke-width="2"/>
  <g stroke="#ffffff" stroke-width="1">
    <line x1="11" y1="16" x2="11" y2="25"/><line x1="15" y1="16" x2="15" y2="25"/><line x1="19" y1="16" x2="19" y2="25"/></g></svg>`;

// 🧴 清洁剂卡：喷雾瓶
const CARD = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
  <rect x="11" y="3" width="8" height="5" rx="1" fill="#caa06a"/>
  <rect x="8" y="8" width="14" height="19" rx="3" fill="#e08a5b" stroke="#ffffff" stroke-width="2"/>
  <rect x="11" y="13" width="8" height="8" rx="1" fill="#ffffff" opacity="0.85"/></svg>`;

export const TOOL_CURSOR = {
  wipe: svgCursor(WIPE, 15, 14, 'grab'),
  spray: svgCursor(SPRAY, 15, 4, 'crosshair'),
  brush: svgCursor(BRUSH, 15, 25, 'cell'),
  card: svgCursor(CARD, 15, 15, 'pointer'),
};

export function cursorFor(tool) {
  return TOOL_CURSOR[tool] || TOOL_CURSOR.wipe;
}
