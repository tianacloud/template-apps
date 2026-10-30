import { state, setState } from './state.js';
import { ensureImages } from './media.js';
import * as db from './db.js';

const PROFILE_KEY = 'nailv.profile.v1';

function cacheProfile(member, family, members, fridge) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      member,
      family: family || null,
      members: members || [],
      fridge: fridge || [],
    }));
  } catch (err) { /* 存不下不影响使用 */ }
}

/** 上次成功读到过的家庭身份，断网时用来兜底 */
export function cachedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && parsed.member ? parsed : null;
  } catch (err) {
    return null;
  }
}

export function clearCachedProfile() {
  try { localStorage.removeItem(PROFILE_KEY); } catch (err) { /* ignore */ }
}

/** 网络读不到时用缓存顶上，避免让用户以为家庭没绑上 */
export function hydrateFromCache() {
  const cached = cachedProfile();
  if (!cached) return null;
  const patch = {
    member: cached.member,
    family: cached.family || null,
    members: cached.members && cached.members.length ? cached.members : [cached.member],
  };
  // 冰箱清单也顺手恢复，否则断网时会误显示成「冰箱还是空的」
  if (Array.isArray(cached.fridge)) patch.fridge = cached.fridge;
  setState(patch);
  return cached;
}

/** 读当前登录账号所属的家庭与成员身份；没有则把 member/family 清空 */
export async function loadMembership() {
  const member = await db.fetchMembership();
  if (!member) {
    clearCachedProfile();
    setState({ member: null, family: null, members: [] });
    return null;
  }
  const family = await db.fetchFamily(member.family_id);
  setState({ member, family, members: [member] });
  await loadFamilyData(member.family_id);
  cacheProfile(state.member, state.family, state.members, state.fridge);
  return { member, family };
}

export async function loadFamilyData(familyId) {
  const [categories, dishes, members, fridge] = await Promise.all([
    db.listCategories(familyId),
    db.listDishes(familyId),
    db.listMembers(familyId),
    // 冰箱是新加的板块，读失败不该拖垮整个首页
    db.listFridgeItems(familyId).catch(() => []),
  ]);
  setState({ categories, dishes, members, fridge });
  await refreshOrders(familyId);
  await hydrateImages();
  return { categories, dishes, members, fridge };
}

export async function refreshFridge(familyId) {
  const fid = familyId || (state.member && state.member.family_id);
  if (!fid) return [];
  const fridge = await db.listFridgeItems(fid);
  setState({ fridge });
  return fridge;
}

export async function refreshOrders(familyId) {
  const fid = familyId || (state.member && state.member.family_id);
  if (!fid) return [];
  const orders = await db.listOrders(fid);
  const items = await db.listOrderItems(orders.map((o) => o.id));
  const grouped = {};
  items.forEach((it) => {
    if (!grouped[it.order_id]) grouped[it.order_id] = [];
    grouped[it.order_id].push(it);
  });
  setState({ orders, orderItems: grouped });
  return orders;
}

export async function hydrateImages() {
  const paths = [];
  state.dishes.forEach((d) => { if (d.image_path) paths.push(d.image_path); });
  Object.values(state.orderItems).forEach((list) => {
    list.forEach((it) => { if (it.dish_image) paths.push(it.dish_image); });
  });
  const added = await ensureImages(paths);
  if (added) setState({});
  return added;
}

export async function reloadMemberAndFamily(member) {
  if (!member) return {};
  const family = await db.fetchFamily(member.family_id);
  setState({ member, family });
  return family;
}
