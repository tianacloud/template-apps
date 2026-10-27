/**
 * main.js — 应用外壳
 * 负责：初始化数据、渲染侧栏与顶栏、注册路由、身份切换。
 */

import { initState, currentUser, setCurrentUser, getState, scope, scopedTodos, storeName, customers } from './db.js';
import { register, renderRoute, navigate, currentPath, $, esc, $$ } from './ui.js';
import { dayGreeting } from './util.js';

import dashboard from './views/dashboard.js';
import customersView, { customerDetail } from './views/customers.js';
import intakeView from './views/intake.js';
import scriptView from './views/script.js';
import askView from './views/ask.js';
import todosView from './views/todos.js';
import reviewView from './views/review.js';
import libraryView from './views/library.js';
import settingsView from './views/settings.js';

const NAV = [
  {
    group: '日常',
    items: [
      { path: '/dashboard', label: '工作台', icon: '一' },
      { path: '/customers', label: '客户档案', icon: '档' },
      { path: '/intake', label: '面诊录入', icon: '录' },
      { path: '/script', label: '话术工作台', icon: '话' },
    ],
  },
  {
    group: '协作',
    items: [
      { path: '/todos', label: '待办与跟进', icon: '办', badge: 'todo' },
      { path: '/ask', label: '智能问答', icon: '问' },
    ],
  },
  {
    group: '经营',
    items: [
      { path: '/review', label: '复盘', icon: '析' },
      { path: '/library', label: '品项库', icon: '库' },
    ],
  },
];

const ROLE_LABEL = { consultant: '顾问', manager: '店长', hq: '总部' };

function badgeCount(kind) {
  if (kind !== 'todo') return 0;
  const me = currentUser();
  const open = scopedTodos().filter((t) => t.status === 'open');
  if (me.role === 'hq') return open.length;
  const overdue = open.filter((t) => t.dueAt && new Date(t.dueAt) < new Date());
  return overdue.length || open.length;
}

function renderSidebar() {
  const me = currentUser();
  const path = currentPath();
  const groups = NAV.map(
    (g) => `
    <div class="nav-group-label">${g.group}</div>
    ${g.items
      .map((it) => {
        const active = path === it.path || path.startsWith(`${it.path}/`);
        const n = badgeCount(it.badge);
        return `<button class="nav-item ${active ? 'active' : ''}" data-nav="${it.path}">
          <span class="ni">${it.icon}</span>
          <span>${it.label}</span>
          ${n ? `<span class="badge">${n}</span>` : ''}
        </button>`;
      })
      .join('')}`,
  ).join('');

  const s = getState();
  const userOptions = s.users
    .map((u) => {
      const store = u.storeId ? storeName(u.storeId).replace('沈阳', '') : '全部门店';
      return `<option value="${u.id}" ${u.id === me.id ? 'selected' : ''}>${esc(u.name)} · ${ROLE_LABEL[u.role]} · ${esc(store)}</option>`;
    })
    .join('');

  return `
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">客</div>
      <div class="brand-text">
        <strong>美业客情助手</strong>
        <span>面诊 · 话术 · 方案</span>
      </div>
    </div>
    <nav class="nav">
      ${groups}
      <div class="nav-group-label">系统</div>
      <button class="nav-item ${path === '/settings' ? 'active' : ''}" data-nav="/settings">
        <span class="ni">设</span><span>设置</span>
      </button>
    </nav>
    <div class="sidebar-foot">
      <div class="who">
        <div class="avatar">${esc(me.name.slice(0, 1))}</div>
        <div class="who-meta">
          <strong>${esc(me.name)}</strong>
          <span>${ROLE_LABEL[me.role]} · ${me.storeId ? esc(storeName(me.storeId).replace('沈阳', '')) : '全部门店'}</span>
        </div>
      </div>
      <select class="select store-switch" id="identity-switch" aria-label="切换身份">
        ${userOptions}
      </select>
    </div>
  </aside>`;
}

function shell() {
  const greeting = dayGreeting();
  return `
  <div id="shell-sidebar">${renderSidebar()}</div>
  <div class="main">
    <header class="topbar">
      <div>
        <div class="crumb" id="crumb">${esc(greeting)}</div>
        <h1 id="page-title">工作台</h1>
      </div>
      <div class="topbar-actions" id="topbar-actions"></div>
    </header>
    <div class="page"><div id="view-root"></div></div>
  </div>`;
}

function applyChrome(view) {
  const t = $('#page-title');
  const c = $('#crumb');
  const a = $('#topbar-actions');
  if (t) t.textContent = view.title || '';
  if (c) c.innerHTML = view.crumb || esc(dayGreeting());
  if (a) a.innerHTML = view.actions || '';
  document.title = `${view.title || '工作台'} · 美业客情助手`;
  if (view.onChrome) view.onChrome(a);
}

function bindGlobal() {
  // 导航委托：侧栏、卡片、任意带 data-nav 的元素
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      e.preventDefault();
      navigate(nav.dataset.nav);
      return;
    }
    // 移动端点击当前项时把侧栏滚到可见
    const side = e.target.closest('#shell-sidebar');
    void side;
  });

  document.addEventListener('change', (e) => {
    if (e.target.id === 'identity-switch') {
      setCurrentUser(e.target.value);
      const me = currentUser();
      document.getElementById('shell-sidebar').innerHTML = renderSidebar();
      // 身份变了，当前客户可能已不在可见范围内 —— 回工作台更稳妥
      const p = currentPath();
      if (/^\/(customers|script|intake)\//.test(p)) {
        navigate('/dashboard');
      } else {
        renderRoute($('#view-root'), applyChrome);
      }
      import('./ui.js').then((m) => m.toast(`已切换为 ${me.name}（${ROLE_LABEL[me.role]}）`));
    }
  });
}

function boot() {
  initState();

  const app = $('#app');
  app.innerHTML = shell();
  app.hidden = false;
  const loading = $('#app-loading');
  if (loading) loading.remove();

  register('/dashboard', dashboard);
  register('/customers', customersView);
  register('/customers/:id', customerDetail);
  register('/intake', intakeView);
  register('/intake/:id', intakeView);
  register('/script', scriptView);
  register('/script/:id', scriptView);
  register('/ask', askView);
  register('/todos', todosView);
  register('/review', reviewView);
  register('/library', libraryView);
  register('/settings', settingsView);

  bindGlobal();

  const rerender = () => {
    const me = currentUser();
    document.getElementById('shell-sidebar').innerHTML = renderSidebar();
    void me;
    renderRoute($('#view-root'), applyChrome);
  };
  window.addEventListener('hashchange', rerender);
  // 视图内部触发数据变更后，重绘侧栏徽标
  window.addEventListener('mkt:refresh', () => {
    document.getElementById('shell-sidebar').innerHTML = renderSidebar();
    renderRoute($('#view-root'), applyChrome);
  });
  if (!location.hash) location.hash = '/dashboard';
  rerender();

  // 首屏提示：本地存储版本
  const s = getState();
  if (s.customers.length) {
    // 只在首次会话提示一次
    if (!sessionStorage.getItem('mkt_notice')) {
      sessionStorage.setItem('mkt_notice', '1');
      const n = customers().length;
      import('./ui.js').then((m) => m.toast(`已载入 ${n} 位可见客户 · 数据存本机`));
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

export { ROLE_LABEL, NAV };
