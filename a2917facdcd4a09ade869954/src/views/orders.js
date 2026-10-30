import { register } from '../js/actions.js';
import { saveCart, state, setState } from '../js/state.js';
import { icon } from '../js/icons.js';
import { escapeHtml, money, relativeTime, emptyState, toast, confirmDialog, initialOf } from '../js/ui.js';
import { ORDER_STATUS, MEAL_TYPES, ROLE_LABEL } from '../js/config.js';
import * as db from '../js/db.js';
import { refreshOrders } from '../js/data.js';

let filter = 'all';

function mealLabel(key) {
  const hit = MEAL_TYPES.find((m) => m.key === key);
  return hit ? hit.label : '用餐';
}

function statusPill(status) {
  const meta = ORDER_STATUS[status] || ORDER_STATUS.pending;
  return `<span class="pill pill-${meta.tone === 'brand' ? 'brand' : meta.tone === 'ok' ? 'ok' : meta.tone === 'muted' ? 'muted' : 'warn'}">${meta.label}</span>`;
}

function filtered() {
  if (filter === 'all') return state.orders;
  return state.orders.filter((o) => o.status === filter);
}

function orderCard(order) {
  const items = state.orderItems[order.id] || [];
  const mine = state.member && String(order.owner_id) === String(state.member.owner_id);
  const isCook = state.member && state.member.role === 'cook';

  return `
    <div class="card order-card">
      <div class="order-head">
        <span class="avatar" style="width:32px;height:32px;font-size:13px">${escapeHtml(initialOf(order.orderer_name))}</span>
        <span class="order-who">${escapeHtml(order.orderer_name || '家人')}</span>
        <span class="pill pill-muted">${escapeHtml(mealLabel(order.meal_type))}</span>
        ${statusPill(order.status)}
        <span class="order-time">${escapeHtml(relativeTime(order.created_at))}</span>
      </div>

      <div class="order-dishes">
        ${items.length
          ? items.map((it) => `
              <div class="order-dish">
                <span class="order-dish-name">${escapeHtml(it.dish_name)}</span>
                <span class="order-dish-qty">× ${it.qty}</span>
              </div>
              ${it.note ? `<div class="order-dish" style="padding-left:2px"><span class="cart-note">${icon('info', 12, 2)}${escapeHtml(it.note)}</span></div>` : ''}
            `).join('')
          : '<span class="muted">（没有明细）</span>'}
      </div>

      ${order.note ? `<div class="order-note">留言：${escapeHtml(order.note)}</div>` : ''}

      <div class="order-foot">
        <span class="order-total">${items.reduce((s, i) => s + (i.qty || 0), 0)} 份</span>
        ${isCook && order.status === 'pending' ? `<button class="btn btn-primary btn-xs" data-act="order.status" data-id="${order.id}" data-status="cooking">开始做菜</button>` : ''}
        ${isCook && order.status === 'cooking' ? `<button class="btn btn-accent btn-xs" data-act="order.status" data-id="${order.id}" data-status="served">做好了</button>` : ''}
        ${order.status === 'served' ? `<button class="btn btn-soft btn-xs" data-act="order.repeat" data-id="${order.id}">再做一次</button>` : ''}
        ${mine && order.status !== 'served' ? `<button class="btn btn-plain btn-xs" data-act="order.cancel" data-id="${order.id}">取消</button>` : ''}
      </div>
    </div>
  `;
}

export function render() {
  const list = filtered();

  const segs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待做' },
    { key: 'cooking', label: '制作中' },
    { key: 'served', label: '已上桌' },
  ];

  if (!state.orders.length) {
    return emptyState({
      iconName: 'receipt',
      title: '还没有点单记录',
      desc: '点完菜下单，这里会留下每一次的饭桌记录',
      actionHtml: '<button class="btn btn-primary" data-act="nav" data-to="#/menu">去点菜</button>',
    });
  }

  return `
    <div class="seg" style="margin-top:6px" id="orderSeg">
      ${segs.map((s) => `
        <button class="seg-item ${filter === s.key ? 'is-active' : ''}" data-act="order.filter" data-key="${s.key}">${s.label}</button>
      `).join('')}
    </div>

    <div class="section" style="margin-top:14px">
      ${list.length
        ? list.map(orderCard).join('')
        : emptyState({ iconName: 'filter', title: '这个状态下没有单子', desc: '换个筛选条件看看' })}
    </div>
  `;
}

let lastRefresh = 0;

export function mount() {
  const member = state.member;
  if (!member) return;
  // 避免每次重绘都打一次接口
  if (Date.now() - lastRefresh < 15000) return;
  lastRefresh = Date.now();
  refreshOrders(member.family_id).catch(() => {});
}

/* ---------------------------------------------------------------- 行为 */

register('order.filter', (ds) => {
  filter = ds.key;
  const view = document.getElementById('view');
  if (!view) return;
  view.innerHTML = render();
  mount(view);
});

register('order.status', async (ds) => {
  try {
    const updated = await db.updateOrder(ds.id, { status: ds.status, seen_by_cook: true });
    setState({
      orders: state.orders.map((o) => (String(o.id) === String(ds.id) ? { ...o, ...updated } : o)),
    });
    const labels = { cooking: '开始做菜', served: '已上桌' };
    toast(labels[ds.status] || '已更新', 'ok');
  } catch (err) {
    toast(err.friendly || err.message || '更新失败', 'error');
  }
});

register('order.cancel', async (ds) => {
  const ok = await confirmDialog({
    title: '取消这一单？',
    desc: '取消后做饭的人就不会再看到它了。',
    okText: '取消这一单',
    cancelText: '再想想',
    danger: true,
  });
  if (!ok) return;
  try {
    const updated = await db.updateOrder(ds.id, { status: 'canceled' });
    setState({
      orders: state.orders.map((o) => (String(o.id) === String(ds.id) ? { ...o, ...updated } : o)),
    });
    toast('已取消', 'ok');
  } catch (err) {
    toast(err.friendly || err.message || '取消失败', 'error');
  }
});

register('order.repeat', (ds) => {
  const items = state.orderItems[ds.id] || [];
  if (!items.length) { toast('这一单没有可复制的菜品', 'error'); return; }
  const cart = items.map((it) => {
    const dish = state.dishes.find((d) => String(d.id) === String(it.dish_id));
    return {
      dishId: it.dish_id || `x-${it.id}`,
      name: it.dish_name,
      price: dish ? Number(dish.price) || 0 : 0,
      imagePath: it.dish_image || null,
      qty: it.qty || 1,
      note: it.note || '',
    };
  });
  setState({ cart });
  saveCart();
  toast('已经放进点菜单', 'ok');
  return { nav: '#/cart' };
});

register('order.detail', (ds) => {
  const order = state.orders.find((o) => String(o.id) === String(ds.id));
  if (!order) return;
  const items = state.orderItems[order.id] || [];
  toast(`${order.orderer_name} 的 ${mealLabel(order.meal_type)}：${items.map((i) => `${i.dish_name}×${i.qty}`).join('、')}`);
});
