import { icon } from './icons.js';

export function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ---------------------------------------------------------------- Toast */

export function toast(message, kind = '') {
  const root = document.getElementById('toastRoot');
  if (!root) return;
  const el = document.createElement('div');
  el.className = `toast${kind ? ` is-${kind}` : ''}`;
  const glyph = kind === 'error' ? 'alert' : kind === 'ok' ? 'checkCircle' : '';
  el.innerHTML = (glyph ? icon(glyph, 16, 2) : '') + `<span>${escapeHtml(message)}</span>`;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-open'));
  setTimeout(() => {
    el.classList.remove('is-open');
    setTimeout(() => el.remove(), 240);
  }, 2400);
}

/* ---------------------------------------------------------------- 遮罩 */

function ensureMask(zIndex) {
  const mask = document.createElement('div');
  mask.className = 'sheet-mask';
  mask.style.zIndex = String(zIndex);
  document.getElementById('overlayRoot').appendChild(mask);
  requestAnimationFrame(() => mask.classList.add('is-open'));
  return mask;
}

function dismiss(mask, node) {
  if (mask) {
    mask.classList.remove('is-open');
    setTimeout(() => mask.remove(), 240);
  }
  if (node) {
    node.classList.remove('is-open');
    setTimeout(() => node.remove(), 300);
  }
}

/** 底部抽屉。返回 { close, root } */
export function sheet({ title = '', body = '', foot = '', onMount, onClose }) {
  const root = document.getElementById('overlayRoot');
  const mask = ensureMask(60);

  const panel = document.createElement('section');
  panel.className = 'sheet';
  panel.innerHTML = `
    <div class="sheet-grip"></div>
    <div class="sheet-head">
      <div class="sheet-title">${escapeHtml(title)}</div>
      <button class="icon-btn" data-sheet-close aria-label="关闭">${icon('close', 20)}</button>
    </div>
    <div class="sheet-body">${body}</div>
    ${foot ? `<div class="sheet-foot">${foot}</div>` : ''}
  `;
  root.appendChild(panel);
  requestAnimationFrame(() => panel.classList.add('is-open'));

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    dismiss(mask, panel);
    if (onClose) onClose();
  };

  mask.addEventListener('click', close);
  panel.querySelectorAll('[data-sheet-close]').forEach((btn) => {
    btn.addEventListener('click', close);
  });
  if (onMount) onMount(panel, close);

  return { close, root: panel };
}

/** 居中确认框，返回 Promise<boolean> */
export function confirmDialog({
  title,
  desc = '',
  okText = '确定',
  cancelText = '取消',
  danger = false,
}) {
  return new Promise((resolve) => {
    const root = document.getElementById('overlayRoot');
    const mask = ensureMask(60);

    const box = document.createElement('div');
    box.className = 'dialog';
    box.innerHTML = `
      <div class="dialog-title">${escapeHtml(title)}</div>
      ${desc ? `<div class="dialog-desc">${escapeHtml(desc)}</div>` : ''}
      <div class="dialog-actions">
        <button class="btn btn-plain" data-no>${escapeHtml(cancelText)}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${escapeHtml(okText)}</button>
      </div>
    `;
    root.appendChild(box);
    requestAnimationFrame(() => box.classList.add('is-open'));

    const finish = (value) => {
      dismiss(mask, box);
      resolve(value);
    };
    mask.addEventListener('click', () => finish(false));
    box.querySelector('[data-no]').addEventListener('click', () => finish(false));
    box.querySelector('[data-yes]').addEventListener('click', () => finish(true));
  });
}

/* ---------------------------------------------------------------- 时间 */

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function todayKey(date = new Date()) {
  const d = new Date(date);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function formatToday(date = new Date()) {
  const d = new Date(date);
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日 · ${WEEK[d.getDay()]}`;
}

export function formatTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function relativeTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min} 分钟前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} 小时前`;
  const day = Math.floor(hour / 24);
  if (day === 1) return `昨天 ${formatTime(d)}`;
  if (day < 7) return `${day} 天前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function money(value) {
  const n = Number(value) || 0;
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

export function initialOf(name) {
  const s = String(name || '家').trim();
  return s ? s.slice(0, 1) : '家';
}

export function greet() {
  const h = new Date().getHours();
  if (h < 5) return '夜深了';
  if (h < 11) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

export function emptyState({ iconName = 'bowl', title, desc = '', actionHtml = '' }) {
  return `
    <div class="empty">
      <div class="empty-ico">${icon(iconName, 30)}</div>
      <div class="empty-title">${escapeHtml(title)}</div>
      ${desc ? `<div class="empty-desc">${escapeHtml(desc)}</div>` : ''}
      ${actionHtml}
    </div>
  `;
}

export function debounce(fn, wait = 220) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
