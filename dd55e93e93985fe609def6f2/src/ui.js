/**
 * ui.js — 渲染基础设施
 * 视图层统一返回 { title, crumb, actions, html, mount }，由路由挂到 #app。
 */

/* ---------------------------------------------------------------- 基础 */

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const money = (n) => (typeof n === 'number' ? `¥${n.toLocaleString('zh-CN')}` : '—');

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------------------------------------------------------------- 提示 */

export function toast(msg, type = '') {
  const root = $('#toast-root');
  const node = document.createElement('div');
  node.className = `toast ${type}`;
  node.textContent = msg;
  root.appendChild(node);
  setTimeout(() => {
    node.style.transition = 'opacity .25s';
    node.style.opacity = '0';
    setTimeout(() => node.remove(), 260);
  }, 2400);
}

/* ---------------------------------------------------------------- 弹层 */

let openCount = 0;

export function openModal({ title, body, footer = '', wide = false, onMount }) {
  const root = $('#overlay-root');
  const mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.innerHTML = `
    <div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">
      <div class="modal-head">
        <h3>${esc(title)}</h3>
        <button class="x" data-close aria-label="关闭">×</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
    </div>`;
  root.appendChild(mask);
  openCount += 1;
  document.body.style.overflow = 'hidden';

  const close = () => {
    if (!mask.parentNode) return;
    mask.remove();
    openCount = Math.max(0, openCount - 1);
    if (!openCount) document.body.style.overflow = '';
  };

  mask.addEventListener('click', (e) => {
    if (e.target === mask || e.target.closest('[data-close]')) close();
  });
  const onKey = (e) => {
    if (e.key === 'Escape') {
      close();
      window.removeEventListener('keydown', onKey);
    }
  };
  window.addEventListener('keydown', onKey);

  if (onMount) onMount(mask, close);
  return close;
}

export function confirmDialog({ title, body, confirmText = '确认', danger = false }) {
  return new Promise((resolve) => {
    const close = openModal({
      title,
      body: `<div style="font-size:13.5px;line-height:1.8">${body}</div>`,
      footer: `<button class="btn" data-close>取消</button>
               <button class="btn ${danger ? 'danger' : 'primary'}" data-yes>${esc(confirmText)}</button>`,
      onMount(mask, closeFn) {
        mask.querySelector('[data-yes]').addEventListener('click', () => {
          closeFn();
          resolve(true);
        });
        mask.addEventListener('click', (e) => {
          if (e.target === mask || e.target.closest('[data-close]')) resolve(false);
        });
      },
    });
    void close;
  });
}

/* ---------------------------------------------------------------- 组件 */

export function tag(text, cls = '') {
  return `<span class="tag ${cls}">${esc(text)}</span>`;
}

const SOURCE_CLS = { device: 'device', eye: 'eye', self: 'self' };
const SOURCE_TXT = { device: '仪器', eye: '目测', self: '自述' };

export function sourceBadge(src) {
  if (!src) return '';
  return `<span class="source-badge ${SOURCE_CLS[src] || ''}">${SOURCE_TXT[src] || '记录'}</span>`;
}

export function kpi(label, value, unit = '', foot = '', footCls = '') {
  return `<div class="kpi">
    <div class="k-label">${esc(label)}</div>
    <div class="k-value">${esc(value)}${unit ? `<small>${esc(unit)}</small>` : ''}</div>
    ${foot ? `<div class="k-foot ${footCls}">${esc(foot)}</div>` : ''}
  </div>`;
}

export function bar(pctVal, cls = '') {
  const w = Math.max(0, Math.min(100, Math.round(pctVal || 0)));
  return `<div class="bar ${cls}"><i style="width:${w}%"></i></div>`;
}

export function empty(mark, text) {
  return `<div class="empty"><span class="em-mark">${esc(mark)}</span>${text}</div>`;
}

export function sectionTitle(text, hint = '', right = '') {
  return `<div class="section-title">${esc(text)}${hint ? `<span class="hint">${esc(hint)}</span>` : ''}${right ? `<span class="spacer"></span>${right}` : ''}</div>`;
}

export function notice(text, kind = '') {
  return `<div class="notice ${kind}"><span class="n-mark">·</span><div>${text}</div></div>`;
}

export function selectOptions(list, current, { valueKey = 'id', labelKey = 'name', placeholder = '' } = {}) {
  const head = placeholder ? `<option value="">${esc(placeholder)}</option>` : '';
  return head + list
    .map((x) => {
      const v = typeof x === 'string' ? x : x[valueKey];
      const l = typeof x === 'string' ? x : x[labelKey];
      return `<option value="${esc(v)}" ${String(current) === String(v) ? 'selected' : ''}>${esc(l)}</option>`;
    })
    .join('');
}

/* ---------------------------------------------------------------- 路由 */

const routes = [];

export function register(pattern, handler) {
  const keys = [];
  const re = new RegExp(
    '^' +
      pattern
        .replace(/\/:([\w]+)/g, (_, k) => {
          keys.push(k);
          return '/([^/]+)';
        })
        .replace(/\*/g, '.*') +
      '$',
  );
  routes.push({ re, keys, handler });
}

export function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/dashboard';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function navigate(path) {
  location.hash = path;
}

export function currentPath() {
  return parseHash();
}

let disposeFn = null;

export async function renderRoute(host, chrome) {
  const path = parseHash();
  const main = host || $('#view-root');
  for (const r of routes) {
    const m = path.match(r.re);
    if (!m) continue;
    const params = {};
    r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
    if (disposeFn) {
      try { disposeFn(); } catch { /* 忽略卸载异常 */ }
      disposeFn = null;
    }
    try {
      const view = await r.handler(params);
      if (!view) return;
      chrome(view);
      if (main) {
        main.innerHTML = view.html;
        if (view.mount) disposeFn = view.mount(main) || null;
      }
    } catch (e) {
      console.error('[route] 渲染失败', path, e);
      // 单页出错不影响外壳：把异常留在当前视图里，给出可操作的说明
      if (main) {
        main.innerHTML = `<div class="card card-pad">
          <div class="notice red"><span class="n-mark">!</span>
            <div><b>这个页面没渲染出来。</b><br>
            先刷新一次；如果还是这样，说明这条数据的结构有问题，不是网络问题。<br>
            <span style="font-size:11px;color:var(--ink-3);word-break:break-all">${esc(e.message)}</span>
            </div>
          </div>
          <div style="margin-top:12px"><button class="btn" data-nav="/dashboard">回工作台</button></div>
        </div>`;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    return;
  }
  if (main) main.innerHTML = empty('404', '页面不存在。从左侧导航重新进入。');
}

/* ---------------------------------------------------------------- 其他 */

export function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    ta.remove();
  }
}

/** 相对时间，用于列表里的「3 天前」 */
export function ago(iso) {
  if (!iso) return '—';
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return '今天';
  if (d === 1) return '昨天';
  if (d < 30) return `${d} 天前`;
  if (d < 365) return `${Math.floor(d / 30)} 个月前`;
  return `${Math.floor(d / 365)} 年前`;
}
