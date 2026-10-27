import { describeError } from './js/cloud.js';
import { state, setState, subscribe, loadCart, loadPrefs, cartCount } from './js/state.js';
import { icon } from './js/icons.js';
import { toast } from './js/ui.js';
import { run, register } from './js/actions.js';
import * as db from './js/db.js';
import { loadMembership } from './js/data.js';
import * as homeView from './views/home.js';
import * as menuView from './views/menu.js';
import * as dishView from './views/dish.js';
import * as fridgeView from './views/fridge.js';
import * as cartView from './views/cart.js';
import * as ordersView from './views/orders.js';
import * as meView from './views/me.js';

const el = {
  app: document.getElementById('app'),
  bar: document.getElementById('appBar'),
  barInner: null,
  view: document.getElementById('view'),
  tabs: document.getElementById('tabBar'),
  boot: document.getElementById('boot'),
  bootMsg: document.getElementById('bootMsg'),
};

const TABS = [
  { key: 'home', label: '首页', iconName: 'home', route: '#/home' },
  { key: 'menu', label: '点菜', iconName: 'bowl', route: '#/menu' },
  { key: 'cart', label: '点菜单', iconName: 'cart', route: '#/cart' },
  { key: 'orders', label: '记录', iconName: 'receipt', route: '#/orders' },
  { key: 'me', label: '我的', iconName: 'user', route: '#/me' },
];

const ROUTES = {
  home: { view: homeView, title: () => (state.family ? state.family.name : '奶绿家今天的饭'), tab: 'home' },
  menu: {
    view: menuView,
    title: () => '点家里的菜',
    tab: 'menu',
    actions: () => `<button class="icon-btn is-brand" data-act="dish.new" aria-label="新增菜品">${icon('plus', 22)}</button>`,
  },
  dish: { view: dishView, title: () => '菜品详情', tab: 'menu', back: true },
  fridge: {
    view: fridgeView,
    title: () => '冰箱里的食材',
    tab: 'home',
    back: true,
    actions: () => `<button class="icon-btn is-brand" data-act="fridge.add" aria-label="加食材">${icon('plus', 22)}</button>`,
  },
  cart: { view: cartView, title: () => '点菜单', tab: 'cart' },
  orders: { view: ordersView, title: () => '点单记录', tab: 'orders' },
  me: { view: meView, title: () => '我的', tab: 'me' },
};

let cartBar = null;
let currentKey = 'home';

/* ---------------------------------------------------------------- 路由 */

function parseRoute() {
  const raw = location.hash || '#/home';
  const body = raw.replace(/^#\/?/, '');
  const [path, qs] = body.split('?');
  const segs = path.split('/').filter(Boolean);
  const name = ROUTES[segs[0]] ? segs[0] : 'home';
  return {
    name,
    params: { id: segs[1] || null },
    query: new URLSearchParams(qs || ''),
    raw,
  };
}

export function go(hash) {
  if (!hash) return;
  if (location.hash === hash) {
    scheduleRender();
    return;
  }
  location.hash = hash;
}

register('app.back', () => {
  if (history.length > 1) history.back();
  else go('#/home');
});

/* ---------------------------------------------------------------- 渲染调度 */

let renderScheduled = false;

export function scheduleRender() {
  if (renderScheduled) return;
  renderScheduled = true;
  Promise.resolve().then(() => {
    renderScheduled = false;
    render();
  });
}

/* ---------------------------------------------------------------- 渲染 */

function showBoot(message) {
  el.boot.hidden = false;
  el.app.hidden = true;
  if (message && el.bootMsg) el.bootMsg.textContent = message;
}

function renderFullscreen(module, html) {
  el.boot.hidden = true;
  el.app.hidden = false;
  el.app.classList.add('is-full');
  el.bar.hidden = true;
  el.tabs.hidden = true;
  el.view.className = 'view is-plain';
  el.view.style.padding = '0';
  el.view.innerHTML = html;
  if (module && module.mount) module.mount(el.view);
}

function renderShell() {
  // 有本地缓存时会直接走到这里，别忘了把启动遮罩收掉、把主容器亮出来
  el.boot.hidden = true;
  el.app.hidden = false;
  el.app.classList.remove('is-full');
  el.bar.hidden = false;
  el.tabs.hidden = false;
  el.view.style.padding = '';

  const route = parseRoute();
  currentKey = route.name;
  const def = ROUTES[route.name];
  if (!def) return;

  el.view.className = 'view';

  const prevScroll = el.view.scrollTop;

  const backBtn = def.back
    ? `<button class="icon-btn" data-act="app.back" aria-label="返回">${icon('chevronLeft', 22)}</button>`
    : '';
  const actions = def.actions ? def.actions() : '';

  el.bar.innerHTML = `
    <div class="app-bar-inner">
      ${backBtn}
      <div class="app-bar-title">${escapeText(def.title())}</div>
      <div class="app-bar-actions">${actions}</div>
    </div>
  `;

  el.view.innerHTML = def.view.render(route);
  el.view.scrollTop = prevScroll;

  if (def.view.mount) def.view.mount(el.view);

  renderTabs(def.tab);
  renderCartBar();
}

function escapeText(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderTabs(activeKey) {
  const count = cartCount();
  el.tabs.innerHTML = TABS.map((tab) => {
    const badge = tab.key === 'cart' && count ? `<span class="tab-dot">${count > 99 ? '99+' : count}</span>` : '';
    return `
      <button class="tab ${tab.key === activeKey ? 'is-active' : ''}" data-act="nav" data-to="${tab.route}">
        ${icon(tab.iconName, 22, tab.key === activeKey ? 1.9 : 1.6)}
        <span>${tab.label}</span>
        ${badge}
      </button>
    `;
  }).join('');
}

function renderCartBar() {
  if (!cartBar) return;
  const count = cartCount();
  const show = count > 0 && ['menu', 'home', 'dish'].includes(currentKey);
  el.app.classList.toggle('has-cart', show);
  if (!show) {
    cartBar.classList.add('is-hidden');
    return;
  }
  cartBar.classList.remove('is-hidden');
  cartBar.innerHTML = `
    <div class="cart-bar-badge">${icon('cart', 19)}<span>${count > 99 ? '99+' : count}</span></div>
    <div class="cart-bar-info">
      <div class="cart-bar-sum">已点 ${count} 份</div>
      <div class="cart-bar-tip">下单后记入家里的记录</div>
    </div>
    <button class="btn btn-accent" data-act="nav" data-to="#/cart">去下单</button>
  `;
}

export function render() {
  if (!state.booted) return;

  renderShell();
}

/* ---------------------------------------------------------------- 事件 */

el.view.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-act]');
  if (!target || !el.view.contains(target)) return;
  await handleAction(target, event);
});

el.bar.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-act]');
  if (target) await handleAction(target, event);
});

el.tabs.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-act]');
  if (target) await handleAction(target, event);
});

/** 这些动作自己负责局部刷新，不需要整体重绘 */
const LOCAL_ACTIONS = new Set([
  'cat.select', 'order.filter', 'dish.qty.inc', 'dish.qty.dec',
  'auth.tab', 'auth.role', 'auth.sendCode', 'auth.phoneLogin',
  'fridge.cat', 'fridge.all',
]);

async function handleAction(target, event) {
  const name = target.dataset.act;
  if (!name) return;
  event.stopPropagation();
  try {
    const result = await run(name, { ...target.dataset }, event, target);
    if (result && result.toast) toast(result.toast);
    if (result && result.nav) {
      go(result.nav);
      return;
    }
    if (LOCAL_ACTIONS.has(name)) {
      const tab = ROUTES[currentKey] ? ROUTES[currentKey].tab : currentKey;
      renderTabs(tab);
      renderCartBar();
      return;
    }
    scheduleRender();
  } catch (err) {
    console.error('[action]', name, err);
    toast(describeError(err), 'error');
  }
}

subscribe(() => {
  if (state.booted) scheduleRender();
});

window.addEventListener('hashchange', () => {
  scheduleRender();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.session && state.member) {
    scheduleRender();
  }
});

/* 启动：身份和数据由平台提供 */
async function boot() {
  loadCart(); loadPrefs();
  const session=await db.getSession();
  setState({session});
  await loadMembership();
  try { const n=await db.recoverPendingUploads(); if(n){await loadMembership();toast('已恢复未完成的图片菜品','ok');} } catch(err){toast(err.message,'error');}
  setState({booted:true});
  cartBar=document.createElement('div');
  cartBar.className='cart-bar is-hidden';
  cartBar.addEventListener('click', async e => {const target=e.target.closest('[data-act]');if(target) await handleAction(target,e)});
  el.app.appendChild(cartBar);
  if (!location.hash) history.replaceState(null,'',`${location.pathname}#/home`);
  render();
}
boot().catch(err => showBoot(describeError(err)));
