/* 用户的购物车和偏好保存在当前应用的数据库中。 */
import { sql } from './sql.js';
import { getUserId } from './db.js';
let ownerId;
let writes = Promise.resolve();
function persist() {
  const cart = JSON.stringify(state.cart), prefs = JSON.stringify(state.prefs);
  writes = writes.catch(() => {}).then(() => sql('INSERT INTO member_preferences(owner_id,cart,prefs) VALUES(?,?,?) ON CONFLICT(owner_id) DO UPDATE SET cart=excluded.cart,prefs=excluded.prefs', [ownerId, cart, prefs])).catch(err => { console.error(err); window.dispatchEvent(new CustomEvent('persistence-error')); });
}
export async function loadPreferences() {
  ownerId = await getUserId();
  const result = await sql('SELECT cart,prefs FROM member_preferences WHERE owner_id=?', [ownerId]);
  if (result.rows[0]) {
    const row = result.rows[0];
    state.cart = JSON.parse(row.cart);
    Object.assign(state.prefs, JSON.parse(row.prefs));
  }
}

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

export function saveCart() { persist(); }

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

export function savePrefs(patch) {
  Object.assign(state.prefs, patch);
  persist();
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
