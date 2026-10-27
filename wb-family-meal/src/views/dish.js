import { register } from '../js/actions.js';
import { state, addToCart, cartQtyOf } from '../js/state.js';
import { thumb } from '../js/media.js';
import { icon } from '../js/icons.js';
import { escapeHtml, money, relativeTime, emptyState, toast } from '../js/ui.js';
import { openDishForm } from '../js/dish-form.js';

let localQty = 1;
let localNote = '';
let lastId = null;

function findDish(ctx) {
  const id = ctx && ctx.params ? ctx.params.id : null;
  return state.dishes.find((d) => String(d.id) === String(id)) || null;
}

function usageCount(dishId) {
  let count = 0;
  Object.values(state.orderItems).forEach((items) => {
    items.forEach((it) => {
      if (String(it.dish_id) === String(dishId)) count += it.qty || 0;
    });
  });
  return count;
}

function lastOrderedAt(dishId) {
  let latest = null;
  state.orders.forEach((order) => {
    const items = state.orderItems[order.id] || [];
    if (items.some((it) => String(it.dish_id) === String(dishId))) {
      if (!latest || new Date(order.created_at) > new Date(latest)) latest = order.created_at;
    }
  });
  return latest;
}

export function render(ctx) {
  const dish = findDish(ctx);
  if (!dish) {
    return emptyState({
      iconName: 'search',
      title: '这道菜不见了',
      desc: '可能已经被删掉了',
      actionHtml: '<button class="btn btn-primary" data-act="nav" data-to="#/menu">回到菜单</button>',
    });
  }

  if (String(lastId) !== String(dish.id)) {
    lastId = dish.id;
    localQty = 1;
    localNote = '';
  }

  const inCart = cartQtyOf(dish.id);
  const cook = state.members.find((m) => m.role === 'cook');
  const count = usageCount(dish.id);
  const last = lastOrderedAt(dish.id);
  const tags = Array.isArray(dish.tags) ? dish.tags : [];

  return `
    ${thumb(dish.image_path, { size: 'lg', iconName: 'bowl' })}

    <div class="inline-between" style="margin-top:16px;align-items:flex-start">
      <div class="grow">
        <div style="font-size:21px;font-weight:800;letter-spacing:.2px">${escapeHtml(dish.name)}</div>
        <div class="muted" style="font-size:12.5px;margin-top:5px">
          ${count ? `家里点过 ${count} 份${last ? ` · 最近 ${escapeHtml(relativeTime(last))}` : ''}` : '还没有人点过这道菜'}
        </div>
      </div>
      <span class="price" style="font-size:20px"><span class="price-unit">¥</span>${money(dish.price)}</span>
    </div>

    ${tags.length ? `<div class="dish-tags" style="margin-top:12px">${tags.map((t) => `<span class="chip chip-brand">${escapeHtml(t)}</span>`).join('')}</div>` : ''}

    ${dish.description
      ? `<div class="card card-pad mt-16" style="font-size:14px;line-height:1.75;color:var(--text-2)">${escapeHtml(dish.description)}</div>`
      : ''}

    <div class="card mt-16">
      <div class="row">
        <div class="row-main">
          <div class="row-title">份数</div>
          <div class="row-desc">想吃几份就点几份</div>
        </div>
        <div class="row-tail">
          <div class="qty">
            <button class="qty-btn ${localQty > 1 ? '' : 'is-off'}" data-act="dish.qty.dec">${icon('minus', 15, 2.4)}</button>
            <span class="qty-num">${localQty}</span>
            <button class="qty-btn is-plus" data-act="dish.qty.inc">${icon('plus', 15, 2.4)}</button>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="row-main">
          <div class="row-title">这道菜的要求</div>
          <div class="row-desc">例如：少放辣、不要香菜</div>
        </div>
      </div>
      <div style="padding:0 16px 16px">
        <input class="input" id="dishNote" maxlength="40" placeholder="不填也行"
          value="${escapeHtml(localNote)}" />
      </div>
    </div>

    <div class="card mt-16">
      <div class="row">
        <div class="row-main">
          <div class="row-title">谁来做</div>
          <div class="row-desc">${cook ? `${escapeHtml(cook.nickname)} 是家里指定的做饭人` : '还没有指定做饭人，可以在「我的」里设置'}</div>
        </div>
        <div class="row-tail">${icon('flame', 18)}</div>
      </div>
    </div>

    <div class="stack mt-16">
      <button class="btn btn-primary btn-block" data-act="dish.addcart">
        ${icon('cart', 18, 2)}加入点菜单${inCart ? `（已有 ${inCart} 份）` : ''}
      </button>
      <div class="inline" style="gap:10px">
        <button class="btn btn-ghost grow" data-act="dish.edit" data-id="${dish.id}">${icon('edit', 17, 2)}编辑</button>
        <button class="btn btn-ghost grow" data-act="nav" data-to="#/menu">${icon('bowl', 17, 2)}继续点菜</button>
      </div>
    </div>
  `;
}

export function mount(root) {
  const note = root.querySelector('#dishNote');
  if (note) {
    note.addEventListener('input', () => { localNote = note.value; });
    note.addEventListener('blur', () => { localNote = note.value; });
  }
}

register('dish.qty.inc', () => {
  localQty = Math.min(99, localQty + 1);
  rerenderSelf();
});

register('dish.qty.dec', () => {
  localQty = Math.max(1, localQty - 1);
  rerenderSelf();
});

register('dish.addcart', () => {
  const dish = state.dishes.find((d) => String(d.id) === String(lastId));
  if (!dish) return;
  addToCart(dish, localQty, localNote);
  toast(`已加入 ${dish.name} × ${localQty}`, 'ok');
  localQty = 1;
  localNote = '';
  rerenderSelf();
});

function rerenderSelf() {
  const view = document.getElementById('view');
  if (!view) return;
  const noteValue = localNote;
  view.innerHTML = render({ params: { id: lastId } });
  mount(view);
  const note = view.querySelector('#dishNote');
  if (note) note.value = noteValue;
}
