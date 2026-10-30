import { register } from '../js/actions.js';
import { state, setState } from '../js/state.js';
import { thumb } from '../js/media.js';
import { icon } from '../js/icons.js';
import {
  escapeHtml, greet, formatToday, todayKey, formatTime, relativeTime, emptyState, money, initialOf,
} from '../js/ui.js';
import { MEAL_TYPES, ROLE_LABEL } from '../js/config.js';
import * as db from '../js/db.js';
import { daysLeft, qtyText } from './fridge.js';

let markedSeen = new Set();

function mealLabel(key) {
  const hit = MEAL_TYPES.find((m) => m.key === key);
  return hit ? hit.label : '用餐';
}

export function todaysOrders() {
  const today = todayKey();
  return state.orders.filter((o) => o.serve_date === today && o.status !== 'canceled');
}

function itemsOf(orderId) {
  return state.orderItems[orderId] || [];
}

function dishCountsToday() {
  const counts = new Map();
  todaysOrders().forEach((o) => {
    itemsOf(o.id).forEach((it) => {
      const key = it.dish_name;
      counts.set(key, (counts.get(key) || 0) + (it.qty || 0));
    });
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function hotDishes(limit = 6) {
  const counts = new Map();
  state.orders.forEach((o) => {
    itemsOf(o.id).forEach((it) => {
      const key = it.dish_id != null ? `id:${it.dish_id}` : `name:${it.dish_name}`;
      const cur = counts.get(key) || { name: it.dish_name, count: 0 };
      cur.count += it.qty || 0;
      counts.set(key, cur);
    });
  });
  return [...counts.entries()]
    .map(([key, val]) => ({ key, ...val }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/* ---------------------------------------------------------------- 渲染 */

export function render() {
  const member = state.member;
  const isCook = member && member.role === 'cook';
  const today = todaysOrders();
  const pending = today.filter((o) => o.status === 'pending' || o.status === 'cooking');

  return `
    <section class="hero">
      <div class="hero-top">
        <div>
          <div class="hero-hi">${escapeHtml(greet())}，${escapeHtml(member ? member.nickname : '家人')}</div>
          <div class="hero-sub">${escapeHtml(state.family ? state.family.name : '我的家')} · ${escapeHtml(formatToday())}</div>
        </div>
        <span class="pill ${isCook ? 'pill-brand' : 'pill-accent'}">${icon(isCook ? 'flame' : 'bowl', 13, 2)}${ROLE_LABEL[member ? member.role : 'diner']}</span>
      </div>
      <div class="hero-actions">
        <button class="btn btn-primary btn-sm" data-act="nav" data-to="#/menu">${icon('plus', 16, 2)}去点菜</button>
        <button class="btn btn-ghost btn-sm" data-act="home.random">${icon('sparkle', 16, 2)}今天吃什么</button>
      </div>
    </section>

    ${isCook ? renderCookBoard(pending, today) : renderDinerBoard(today)}

    <div class="quick-grid">
      <button class="quick" data-act="nav" data-to="#/menu">
        <span class="quick-ico">${icon('bowl', 19)}</span>
        <span class="quick-title">看看菜单</span>
        <span class="quick-desc">${state.dishes.length} 道菜可选</span>
      </button>
      <button class="quick" data-act="dish.new">
        <span class="quick-ico accent">${icon('camera', 19)}</span>
        <span class="quick-title">加一道菜</span>
        <span class="quick-desc">拍照上传到家里的菜单</span>
      </button>
    </div>

    ${renderFridgeSection()}

    ${renderCategoryRail()}
    ${renderHot(hotDishes())}
  `;
}

/* ---------------------------------------------------------------- 冰箱 */

function renderFridgeSection() {
  const total = state.fridge.length;

  const head = `
    <div class="section-head">
      <span class="section-title">冰箱里的食材</span>
      <button class="section-link" data-act="nav" data-to="#/fridge">
        ${total ? `${total} 样` : '还没记'}${icon('chevronRight', 14, 2)}
      </button>
    </div>
  `;

  if (!total) {
    return `
      <div class="section">
        ${head}
        <div class="card card-pad">
          <div class="inline" style="gap:13px">
            <span class="quick-ico" style="width:38px;height:38px;border-radius:13px">${icon('fridge', 20)}</span>
            <div class="grow">
              <div class="row-title">冰箱里还剩什么？</div>
              <div class="row-desc">记一下，谁去买菜、今天做什么都有数</div>
            </div>
            <button class="btn btn-soft btn-xs" data-act="fridge.add">记一笔</button>
          </div>
        </div>
      </div>
    `;
  }

  const sorted = [...state.fridge].sort((a, b) => {
    const ka = daysLeft(a);
    const kb = daysLeft(b);
    return (ka === null ? 99999 : ka) - (kb === null ? 99999 : kb);
  });
  const shown = sorted.slice(0, 8);
  const soon = sorted.filter((it) => {
    const d = daysLeft(it);
    return d !== null && d <= 2;
  }).length;

  return `
    <div class="section">
      ${head}
      <div class="card card-pad">
        <div class="chip-row is-wrap">
          ${shown.map((it) => {
            const d = daysLeft(it);
            const urgent = d !== null && d <= 2;
            return `
              <button class="chip ${urgent ? 'chip-accent' : 'chip-line'}" data-act="nav" data-to="#/fridge">
                ${escapeHtml(it.name)}<span class="chip-count">${escapeHtml(qtyText(it))}</span>
              </button>
            `;
          }).join('')}
          ${total > shown.length
            ? `<button class="chip chip-line" data-act="nav" data-to="#/fridge">还有 ${total - shown.length} 样</button>`
            : ''}
        </div>
        ${soon
          ? `<div class="field-hint" style="margin-top:10px;color:#B2743D">${icon('alert', 12, 2)} ${soon} 样两天内要吃掉</div>`
          : ''}
      </div>
    </div>
  `;
}

function renderCookBoard(pending, today) {
  const totalDishes = pending.reduce((sum, o) => sum + (o.total_count || 0), 0);

  const tickets = pending.map((order) => {
    const items = itemsOf(order.id);
    const isNew = !order.seen_by_cook;
    return `
      <div class="ticket">
        <div class="ticket-head">
          <span class="avatar" style="width:30px;height:30px;font-size:12px">${escapeHtml(initialOf(order.orderer_name))}</span>
          <span class="ticket-who">${escapeHtml(order.orderer_name || '家人')}</span>
          <span class="pill pill-${order.status === 'cooking' ? 'brand' : 'warn'}">${order.status === 'cooking' ? '制作中' : '待做'}</span>
          ${isNew ? '<span class="pill pill-danger">新</span>' : ''}
          <span class="ticket-time">${escapeHtml(relativeTime(order.created_at))}</span>
        </div>
        <div class="ticket-dishes">
          ${items.map((it) => `<span class="chip chip-line">${escapeHtml(it.dish_name)} × ${it.qty}</span>`).join('') || '<span class="muted">（这道菜单空了）</span>'}
        </div>
        ${order.note ? `<div class="ticket-note">整单备注：${escapeHtml(order.note)}</div>` : ''}
        ${items.some((it) => it.note) ? `<div class="ticket-note">${items.filter((it) => it.note).map((it) => `${escapeHtml(it.dish_name)}：${escapeHtml(it.note)}`).join('<br/>')}</div>` : ''}
        <div class="ticket-actions">
          ${order.status === 'pending'
            ? `<button class="btn btn-primary btn-xs" data-act="order.status" data-id="${order.id}" data-status="cooking">${icon('flame', 14, 2)}开始做菜</button>`
            : `<button class="btn btn-accent btn-xs" data-act="order.status" data-id="${order.id}" data-status="served">${icon('check', 14, 2)}做好了</button>`}
          <button class="btn btn-plain btn-xs" data-act="order.detail" data-id="${order.id}">看详情</button>
        </div>
      </div>
    `;
  }).join('');

  const servedToday = today.filter((o) => o.status === 'served');

  return `
    <div class="board">
      <div class="board-head">
        <span class="quick-ico" style="width:30px;height:30px;border-radius:10px">${icon('flame', 17)}</span>
        <span class="board-head-title">今天要做</span>
        <span class="section-sub">${pending.length} 单 · ${totalDishes} 份</span>
      </div>
      <div class="board-body">
        ${pending.length
          ? tickets
          : `<div class="empty" style="padding:26px 8px">
               <div class="empty-ico" style="width:50px;height:50px;border-radius:18px">${icon('checkCircle', 26)}</div>
               <div class="empty-title">今天还没有人点菜</div>
               <div class="empty-desc">${servedToday.length ? `已经做好 ${servedToday.length} 单啦，辛苦了` : '等家人点完菜，这里会自动出现'}</div>
             </div>`}
      </div>
    </div>
  `;
}

function renderDinerBoard(today) {
  const counts = dishCountsToday();
  const totalQty = counts.reduce((sum, [, n]) => sum + n, 0);
  const cook = state.members.find((m) => m.role === 'cook');

  const list = counts.map(([name, qty]) => `
    <div class="order-dish">
      <span class="order-dish-name">${escapeHtml(name)}</span>
      <span class="order-dish-qty">× ${qty}</span>
    </div>
  `).join('');

  return `
    <div class="board">
      <div class="board-head">
        <span class="quick-ico accent" style="width:30px;height:30px;border-radius:10px">${icon('receipt', 17)}</span>
        <span class="board-head-title">今天家里的菜单</span>
        <span class="section-sub">${cook ? `由 ${escapeHtml(cook.nickname)} 掌勺` : '还没指定做饭的人'}</span>
      </div>
      <div class="board-body">
        ${totalQty
          ? `${list}<div class="ticket-note" style="margin-top:12px">已点 ${totalQty} 份，共 ${today.length} 单</div>`
          : `<div class="empty" style="padding:26px 8px">
               <div class="empty-ico" style="width:50px;height:50px;border-radius:18px">${icon('bowl', 26)}</div>
               <div class="empty-title">今天还没点菜</div>
               <div class="empty-desc">点完会记进家里的点单记录</div>
               <button class="btn btn-primary btn-sm" data-act="nav" data-to="#/menu">去点菜</button>
             </div>`}
      </div>
    </div>
  `;
}

function renderCategoryRail() {
  if (!state.categories.length) return '';
  const chips = state.categories.map((cat) => {
    const n = state.dishes.filter((d) => Number(d.category_id) === Number(cat.id)).length;
    return `
      <button class="rail-item" data-act="nav" data-to="#/menu?cat=${cat.id}">
        <span class="quick-ico" style="width:30px;height:30px;border-radius:10px">${icon(cat.icon_key || 'bowl', 16)}</span>
        <span class="rail-name">${escapeHtml(cat.name)}</span>
        <span class="rail-meta">${n} 道菜</span>
      </button>
    `;
  }).join('');
  return `
    <div class="section">
      <div class="section-head">
        <span class="section-title">按分类逛</span>
        <button class="section-link" data-act="nav" data-to="#/menu">全部菜单${icon('chevronRight', 14, 2)}</button>
      </div>
      <div class="rail">${chips}</div>
    </div>
  `;
}

function renderHot(hot) {
  if (!hot.length) return '';
  const items = hot.slice(0, 5).map((h, idx) => `
    <div class="row">
      <span class="avatar ${idx % 2 ? 'avatar-accent' : ''}">${idx + 1}</span>
      <div class="row-main">
        <div class="row-title">${escapeHtml(h.name)}</div>
        <div class="row-desc">家里累计点过 ${h.count} 份</div>
      </div>
      <div class="row-tail">${icon('flame', 17)}</div>
    </div>
  `).join('');
  return `
    <div class="section">
      <div class="section-head">
        <span class="section-title">家里常点</span>
        <span class="section-sub">按历史点单统计</span>
      </div>
      <div class="card">${items}</div>
    </div>
  `;
}

/* ---------------------------------------------------------------- 行为 */

/** 做饭人打开首页后，把今天的点单标记为已查看 */
async function markTodaySeen() {
  const member = state.member;
  if (!member || member.role !== 'cook') return;
  const fresh = todaysOrders().filter((o) => !o.seen_by_cook && !markedSeen.has(o.id));
  if (!fresh.length) return;
  fresh.forEach((o) => markedSeen.add(o.id));
  try {
    await Promise.all(fresh.map((o) => db.updateOrder(o.id, { seen_by_cook: true })));
    const patched = state.orders.map((o) => (markedSeen.has(o.id) ? { ...o, seen_by_cook: true } : o));
    setState({ orders: patched });
  } catch (err) {
    fresh.forEach((o) => markedSeen.delete(o.id));
  }
}

export function mount() {
  markTodaySeen();
}

register('home.random', () => {
  const pool = state.dishes.length
    ? state.dishes
    : state.categories.length ? [] : [];
  if (!pool.length) return { nav: '#/menu', toast: '菜单还是空的，先加几道菜吧' };
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { nav: `#/dish/${pick.id}` };
});
