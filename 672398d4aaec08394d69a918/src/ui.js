export const $ = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
));

export const pct = (value) => `${Math.round((Number(value) || 0) * 100)}%`;
export const fmtMs = (ms) => {
  const total = Math.max(0, Math.round((Number(ms) || 0) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};
export const fmtTime = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
export const fmtAvg = (value) => (value === null || value === undefined ? '—' : (Math.round(Number(value) * 10) / 10).toString());

export function toast(message, ms = 2200) {
  document.querySelector('.toast')?.remove();
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.remove(), ms);
}

export function openModal(html, { onMount } = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  overlay.addEventListener('click', (event) => { if (event.target === overlay) overlay.remove(); });
  document.body.append(overlay);
  onMount?.(overlay);
  return overlay;
}

export function statusLabel(status) {
  return { lobby: '未开始', playing: '进行中', ended: '已结束' }[status] || status;
}

export function downloadText(filename, text, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([`\ufeff${text}`], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
