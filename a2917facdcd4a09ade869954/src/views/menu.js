import { register } from '../js/actions.js';
import { state, addToCart, setCartQty, cartQtyOf } from '../js/state.js';
import { thumb } from '../js/media.js';
import { icon } from '../js/icons.js';
import { escapeHtml, money, emptyState, toast, debounce } from '../js/ui.js';
import { openDishForm, openCategoryForm } from '../js/dish-form.js';

let activeCat = 'all';
let query = '';

function categoryName(id) {
  const hit = state.categories.find((c) => Number(c.id) === Number(id));
  return hit ? hit.name : '未分类';
}

function categoryIcon(id) {
  const hit = state.categories.find((c) => Number(c.id) === Number(id));
  return hit ? hit.icon_key || 'bowl' : 'bowl';
}

function matchDish(dish) {
  if (!query) return true;
  const q = query.toLowerCase();
  const tags = Array.isArray(dish.tags) ? dish.tags.join(' ') : '';
  return (
    String(dish.name || '').toLowerCase().includes(q) ||
    String(dish.description || '').toLowerCase().includes(q) ||
    tags.toLowerCase().includes(q)
  );
}

function visibleDishes() {
  return state.dishes.filter((dish) => {
    if (!matchDish(dish)) return false;
    if (activeCat === 'all') return true;
    if (activeCat === 'none') return dish.category_id == null;
    return Number(dish.category_id) === Number(activeCat);
  });
}

function groups() {
  const list = visibleDishes();
  if (activeCat !== 'all') return [{ id: activeCat, name: categoryName(activeCat), dishes: list }];

  const order = state.categories.map((c) => c.id);
  const buckets = new Map();
  list.forEach((dish) => {
    const key = dish.category_id == null ? 'none' : Number(dish.category_id);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(dish);
  });

  const out = [];
  order.forEach((id) => {
    if (buckets.has(Number(id))) {
      out.push({ id: Number(id), name: categoryName(Number(id)), dishes: buckets.get(Number(id)) });
    }
  });
  if (buckets.has('none')) out.push({ id: 'none', name: '未分类', dishes: buckets.get('none') });
  return out;
}

/* ---------------------------------------------------------------- 渲染 */

function catRail() {
  const total = state.dishes.length;
  const uncategorized = state.dishes.filter((d) => d.category_id == null).length;

  const items = [
    { key: 'all', name: '全部', iconName: 'bowl', count: total },
    ...state.categories.map((c) => ({
      key: String(c.id),
      name: c.name,
      iconName: c.icon_key || 'bowl',
      count: state.dishes.filter((d) => Number(d.category_id) === Number(c.id)).length,
      raw: c,
    })),
  ];
  if (uncategorized) items.push({ key: 'none', name: '未分类', iconName: 'tag', count: uncategorized });

  return items.map((it) => `
    <button class="cat-item ${String(activeCat) === it.key ? 'is-active' : ''}" data-act="cat.select" data-id="${it.key}">
      ${icon(it.iconName, 16, 1.8)}
      <span class="grow nowrap">${escapeHtml(it.name)}</span>
      <span class="cat-count">${it.count}</span>
    </button>
  `).join('');
}

function dishCard(dish) {
  const qty = cartQtyOf(dish.id);
  const tags = (Array.isArray(dish.tags) ? dish.tags : []).slice(0, 3);
  return `
    <div class="dish-card" data-act="dish.open" data-id="${dish.id}">
      ${thumb(dish.image_path, { iconName: categoryIcon(dish.category_id) })}
      <div class="dish-body">
        <div class="dish-name nowrap">${escapeHtml(dish.name)}</div>
        ${dish.description ? `<div class="dish-desc">${escapeHtml(dish.description)}</div>` : ''}
        ${tags.length ? `<div class="dish-tags">${tags.map((t) => `<span class="chip">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
        <div class="dish-foot">
          <span class="price"><span class="price-unit">¥</span>${money(dish.price)}</span>
          <div class="qty">
            <button class="qty-btn ${qty ? '' : 'is-off'}" data-act="dish.dec" data-id="${dish.id}" aria-label="减少">${icon('minus', 15, 2.4)}</button>
            ${qty ? `<span class="qty-num">${qty}</span>` : ''}
            <button class="qty-btn is-plus" data-act="dish.add" data-id="${dish.id}" aria-label="增加">${icon('plus', 15, 2.4)}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function dishColumn() {
  if (!state.dishes.length) {
    return emptyState({
      iconName: 'bowl',
      title: '菜单还是空的',
      desc: '把家里常做的菜加进来，以后点菜就方便了',
      actionHtml: `<button class="btn btn-primary" data-act="dish.new">${icon('plus', 17, 2)}添加第一道菜</button>`,
    });
  }

  if (!query && activeCat === 'all' && !state.categories.length) {
    return emptyState({
      iconName: 'tag',
      title: '还没有分类',
      desc: '先建几个分类，菜单会更好找',
      actionHtml: `<button class="btn btn-primary" data-act="cat.new">${icon('plus', 17, 2)}新建分类</button>`,
    });
  }

  const list = groups();
  if (!list.length || !list.some((g) => g.dishes.length)) {
    return emptyState({
      iconName: 'search',
      title: query ? '没找到这道菜' : '这个分类还是空的',
      desc: query ? '换个关键词试试，或者直接新建一道菜' : '把常做的菜加到这个分类里',
      actionHtml: `<button class="btn btn-primary" data-act="dish.new">${icon('plus', 17, 2)}新增菜品</button>`,
    });
  }

  return list
    .filter((g) => g.dishes.length)
    .map((g) => `
      <div class="dish-group-title">${escapeHtml(g.name)}</div>
      ${g.dishes.map(dishCard).join('')}
    `)
    .join('');
}

export function render(ctx) {
  if (ctx && ctx.query && ctx.query.get('cat')) {
    activeCat = ctx.query.get('cat');
  }

  return `
    <div class="inline" style="gap:10px;margin-top:6px">
      <div class="grow" style="position:relative">
        <span style="position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none">${icon('search', 17)}</span>
        <input class="input" id="menuSearch" placeholder="搜索菜名、标签" style="padding-left:39px"
          value="${escapeHtml(query)}" autocomplete="off" />
      </div>
      ${state.categories.length ? `<button class="icon-btn" data-act="cat.new" aria-label="新建分类" style="background:var(--surface);border:1px solid var(--line)">${icon('tag', 19)}</button>` : ''}
    </div>

    <div class="menu-wrap">
      <div class="cat-col" id="catCol">${catRail()}</div>
      <div class="dish-col" id="dishCol">${dishColumn()}</div>
    </div>
  `;
}

export function mount(root) {
  const input = root.querySelector('#menuSearch');
  const col = root.querySelector('#dishCol');
  if (input && col) {
    input.addEventListener('input', debounce(() => {
      query = input.value.trim();
      col.innerHTML = dishColumn();
    }, 160));
  }
}

/* ---------------------------------------------------------------- 行为 */

register('nav', (ds) => ({ nav: ds.to }));

register('cat.select', (ds) => {
  activeCat = ds.id;
  const col = document.querySelector('#catCol');
  const dishCol = document.querySelector('#dishCol');
  if (col) col.innerHTML = catRail();
  if (dishCol) dishCol.innerHTML = dishColumn();
});

register('cat.new', () => { openCategoryForm(); });

register('cat.edit', (ds) => {
  const cat = state.categories.find((c) => String(c.id) === String(ds.id));
  if (cat) openCategoryForm(cat);
});

register('dish.new', (ds) => {
  openDishForm(null, { categoryId: ds && ds.cat ? ds.cat : undefined });
});

register('dish.edit', (ds) => {
  const dish = state.dishes.find((d) => String(d.id) === String(ds.id));
  if (dish) openDishForm(dish);
});

register('dish.open', (ds) => ({ nav: `#/dish/${ds.id}` }));

register('dish.add', (ds) => {
  const dish = state.dishes.find((d) => String(d.id) === String(ds.id));
  if (!dish) return;
  addToCart(dish, 1);
  toast(`已加入：${dish.name}`, 'ok');
});

register('dish.dec', (ds) => {
  const qty = cartQtyOf(ds.id);
  if (qty <= 0) return;
  setCartQty(ds.id, qty - 1);
});
