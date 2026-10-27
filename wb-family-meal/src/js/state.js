/* 全局状态：一份内存态 + localStorage 里的购物车草稿 */

const CART_KEY = 'nailv.cart.v1';
const PREFS_KEY = 'nailv.prefs.v1';

export const state = {
  booted: false,
  session: null,
  member: null,      // { id, owner_id, family_id, nickname, role }
  family: null,
  members: [],
  categories: [],
  dishes: [],
  fridge: [],        // 冰箱剩余食材
  orders: [],
  orderItems: {},    // order_id -> [items]
  imageUrls: new Map(), // objectKey -> signed url
  route: '#/home',
  cart: [],
  prefs: { mealType: 'dinner', notifyOn: false },
  online: true,
};

const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emit() {
  listeners.forEach((fn) => {
    try { fn(); } catch (err) { console.warn(err); }
  });
}

export function setState(patch) {
  Object.assign(state, patch);
  emit();
}

/* ---------------------------------------------------------------- 购物车 */

export function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    state.cart = Array.isArray(parsed) ? parsed.filter((x) => x && x.dishId) : [];
  } catch (err) {
    state.cart = [];
  }
}

export function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
  } catch (err) { /* 忽略配额问题 */ }
}

export function cartCount() {
  return state.cart.reduce((sum, it) => sum + (it.qty || 0), 0);
}

export function cartTotal() {
  return state.cart.reduce((sum, it) => sum + (Number(it.price) || 0) * (it.qty || 0), 0);
}

export function cartQtyOf(dishId) {
  const found = state.cart.find((it) => Number(it.dishId) === Number(dishId));
  return found ? found.qty : 0;
}

export function addToCart(dish, qty = 1, note = '') {
  const existing = state.cart.find((it) => Number(it.dishId) === Number(dish.id));
  if (existing) {
    existing.qty += qty;
    if (note) existing.note = note;
    existing.price = Number(dish.price) || 0;
    existing.name = dish.name;
    existing.imagePath = dish.image_path || null;
  } else {
    state.cart.push({
      dishId: dish.id,
      name: dish.name,
      price: Number(dish.price) || 0,
      imagePath: dish.image_path || null,
      qty,
      note,
    });
  }
  saveCart();
  emit();
}

export function setCartQty(dishId, qty) {
  const idx = state.cart.findIndex((it) => Number(it.dishId) === Number(dishId));
  if (idx < 0) return;
  if (qty <= 0) state.cart.splice(idx, 1);
  else state.cart[idx].qty = qty;
  saveCart();
  emit();
}

export function setCartNote(dishId, note) {
  const found = state.cart.find((it) => Number(it.dishId) === Number(dishId));
  if (!found) return;
  found.note = note;
  saveCart();
  emit();
}

export function clearCart() {
  state.cart = [];
  saveCart();
  emit();
}

/* ---------------------------------------------------------------- 偏好 */

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) Object.assign(state.prefs, JSON.parse(raw));
  } catch (err) { /* ignore */ }
}

export function savePrefs(patch) {
  Object.assign(state.prefs, patch);
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(state.prefs)); } catch (err) { /* ignore */ }
  emit();
}

/* ---------------------------------------------------------------- 图片 */

export function cachedImage(key) {
  const hit = state.imageUrls.get(key);
  if (!hit) return null;
  if (hit.exp <= Date.now()) {
    state.imageUrls.delete(key);
    return null;
  }
  return hit.url;
}

export function rememberImages(map) {
  const exp = Date.now() + 50 * 60 * 1000;
  Object.entries(map).forEach(([key, url]) => state.imageUrls.set(key, { url, exp }));
}
