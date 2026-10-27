import { register } from '../js/actions.js';
import { state, setState, setCartQty, setCartNote, clearCart, cartCount, cartTotal, savePrefs } from '../js/state.js';
import { thumb } from '../js/media.js';
import { icon } from '../js/icons.js';
import { escapeHtml, money, emptyState, toast, sheet, todayKey, formatToday } from '../js/ui.js';
import { MEAL_TYPES } from '../js/config.js';
import * as db from '../js/db.js';
import { refreshOrders } from '../js/data.js';
import { notifyCook } from '../js/notify.js';

let orderNote = '';
let submitting = false;

export function resetCartDraft() {
  orderNote = '';
}

export function render() {
  if (!state.cart.length) {
    return emptyState({
      iconName: 'cart',
      title: '点菜单还是空的',
      desc: '去菜单挑几道今天想吃的菜吧',
      actionHtml: '<button class="btn btn-primary" data-act="nav" data-to="#/menu">去看看菜单</button>',
    });
  }

  const rows = state.cart.map((it) => `
    <div class="cart-item">
      ${thumb(it.imagePath, { iconName: 'bowl' })}
      <div class="grow">
        <div class="inline-between">
          <span class="row-title nowrap">${escapeHtml(it.name)}</span>
          <span class="price price-sm"><span class="price-unit">¥</span>${money(it.price)}</span>
        </div>
        ${it.note ? `<div class="cart-note">${icon('info', 12, 2)}${escapeHtml(it.note)}</div>` : ''}
        <div class="inline-between" style="margin-top:8px">
          <button class="btn btn-plain btn-xs" data-act="cart.note" data-id="${it.dishId}">
            ${icon('edit', 12, 2)}${it.note ? '改要求' : '加要求'}
          </button>
          <div class="qty">
            <button class="qty-btn" data-act="cart.dec" data-id="${it.dishId}">${icon('minus', 15, 2.4)}</button>
            <span class="qty-num">${it.qty}</span>
            <button class="qty-btn is-plus" data-act="cart.inc" data-id="${it.dishId}">${icon('plus', 15, 2.4)}</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  const cook = state.members.find((m) => m.role === 'cook');
  const count = cartCount();

  return `
    <div class="card" style="margin-top:6px">${rows}</div>

    <div class="section">
      <div class="section-head">
        <span class="section-title">什么时候吃</span>
        <span class="section-sub">${escapeHtml(formatToday(new Date()))}</span>
      </div>
      <div class="seg" id="mealSeg">
        ${MEAL_TYPES.map((m) => `
          <button class="seg-item ${state.prefs.mealType === m.key ? 'is-active' : ''}"
            data-act="cart.meal" data-meal="${m.key}">${escapeHtml(m.label)}</button>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-head"><span class="section-title">给做饭的人留言</span></div>
      <textarea class="textarea" id="cartNote" maxlength="90"
        placeholder="例如：今天不用放辣，晚点开火">${escapeHtml(orderNote)}</textarea>
    </div>

    <div class="card card-pad" style="margin-top:16px">
      <div class="inline-between">
        <span class="muted" style="font-size:13px">共 ${count} 份 · 参考价</span>
        <span class="price" style="font-size:19px"><span class="price-unit">¥</span>${money(cartTotal())}</span>
      </div>
      <div class="inline" style="margin-top:10px;font-size:12.5px;color:var(--muted)">
        ${icon('bell', 15)}
        <span>${cook ? `下单后 ${escapeHtml(cook.nickname)} 可在记录里查看` : '下单后会记进家里的点单记录'}</span>
      </div>
    </div>

    <div class="stack mt-16">
      <button class="btn btn-primary btn-block" data-act="cart.submit" id="cartSubmit">
        ${icon('check', 18, 2)}下单，记进点单记录
      </button>
      <button class="btn btn-plain btn-block btn-sm" data-act="cart.clear">清空点菜单</button>
    </div>
  `;
}

export function mount(root) {
  const note = root.querySelector('#cartNote');
  if (note) {
    note.addEventListener('input', () => { orderNote = note.value; });
    note.addEventListener('blur', () => { orderNote = note.value; });
  }
}

/* ---------------------------------------------------------------- 行为 */

register('cart.inc', (ds) => {
  const item = state.cart.find((i) => String(i.dishId) === String(ds.id));
  if (item) setCartQty(ds.id, item.qty + 1);
});

register('cart.dec', (ds) => {
  const item = state.cart.find((i) => String(i.dishId) === String(ds.id));
  if (item) setCartQty(ds.id, item.qty - 1);
});

register('cart.note', (ds) => {
  const item = state.cart.find((i) => String(i.dishId) === String(ds.id));
  if (!item) return;
  const panel = sheet({
    title: `「${item.name}」的要求`,
    body: `
      <label class="field" style="margin-top:6px">
        <span class="field-label">想怎么做</span>
        <input class="input" id="cnInput" maxlength="40" placeholder="例如：少放辣、多放葱花"
          value="${escapeHtml(item.note || '')}" />
      </label>
      <div class="field-hint">只对这道菜生效，做饭的人会看到</div>
    `,
    foot: `
      <button class="btn btn-plain" data-sheet-close>取消</button>
      <button class="btn btn-primary" id="cnSave">确定</button>
    `,
    onMount(root, close) {
      const input = root.querySelector('#cnInput');
      root.querySelector('#cnSave').addEventListener('click', () => {
        setCartNote(ds.id, input.value.trim());
        close();
      });
      setTimeout(() => input.focus(), 220);
    },
  });
  return panel;
});

register('cart.meal', (ds) => {
  savePrefs({ mealType: ds.meal });
});

register('cart.clear', () => {
  if (!state.cart.length) return;
  clearCart();
  toast('点菜单已清空');
});

register('cart.submit', async () => {
  if (submitting) return;
  const member = state.member;
  if (!member) { toast('请先登录', 'error'); return; }
  if (!state.cart.length) { toast('点菜单还是空的', 'error'); return; }

  const btn = document.querySelector('#cartSubmit');
  submitting = true;
  if (btn) {
    btn.classList.add('is-disabled');
    btn.innerHTML = `<span class="spinner"></span>正在下单`;
  }

  const snapshot = state.cart.map((it) => ({ ...it }));
  const dishText = snapshot.map((i) => `${i.name}×${i.qty}`).join('、');
  const totalQty = snapshot.reduce((s, i) => s + i.qty, 0);

  try {
    const order = await db.createOrderWithItems({
      familyId: member.family_id,
      ordererName: member.nickname,
      mealType: state.prefs.mealType,
      note: orderNote.trim(),
      serveDate: todayKey(),
      items: snapshot,
    });

    const optimistic = snapshot.map((it) => ({
      order_id: order.id,
      dish_id: it.dishId,
      dish_name: it.name,
      dish_image: it.imagePath || null,
      qty: it.qty,
      note: it.note || '',
    }));

    setState({
      orders: [order, ...state.orders],
      orderItems: { ...state.orderItems, [order.id]: optimistic },
    });

    clearCart();
    orderNote = '';

    const result = await notifyCook(order, { dishText, totalQty });
    if (result.pushed) {
      toast(`已经通知做饭的人（${result.sent} 台设备）`, 'ok');
    } else {
      toast('下单成功，已放进家里的点单记录', 'ok');
    }

    location.hash = '#/orders';
    refreshOrders(member.family_id).catch(() => {});
  } catch (err) {
    toast(err.friendly || err.message || '下单失败，请重试', 'error');
  } finally {
    submitting = false;
    const live = document.querySelector('#cartSubmit');
    if (live) {
      live.classList.remove('is-disabled');
      live.innerHTML = `${icon('check', 18, 2)}下单，记进点单记录`;
    }
  }
});
