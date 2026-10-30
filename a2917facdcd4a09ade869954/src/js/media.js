import { cachedImage, rememberImages } from './state.js';
import { signImagePaths } from './db.js';
import { icon } from './icons.js';

export function imgSrc(path) {
  if (!path) return null;
  return cachedImage(path);
}

/** 把还没换过签名地址的 objectKey 补齐；返回是否有新增 */
export async function ensureImages(paths) {
  const missing = [...new Set((paths || []).filter(Boolean))].filter((p) => !cachedImage(p));
  if (!missing.length) return false;
  const map = await signImagePaths(missing);
  rememberImages(map);
  return Object.keys(map).length > 0;
}

export function collectImagePaths() {
  return [];
}

/**
 * 菜品缩略图。没有图片时用统一图标占位，保持视觉一致。
 */
export function thumb(path, { size = 'md', iconName = 'bowl', className = '' } = {}) {
  const url = imgSrc(path);
  const cls = `dish-thumb${size === 'lg' ? ' dish-thumb-lg' : ''}${className ? ` ${className}` : ''}`;
  if (url) {
    return `<div class="${cls}"><img src="${url}" alt="" loading="lazy" decoding="async" /></div>`;
  }
  const dim = size === 'lg' ? 40 : 30;
  return `<div class="${cls}">${icon(iconName, dim, 1.6)}</div>`;
}
