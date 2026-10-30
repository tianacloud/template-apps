// In-memory data for the preview page: same operations as the SQLite repository, nothing persisted.
import { BUILT_IN_TASKS } from './constants.js';
import { sample } from './sample.js';

let db;
const clone = value => structuredClone(value);
export function reset() { db = clone(sample()); }
reset();

export async function load() {
  for (const task of BUILT_IN_TASKS) if (!db.tasks.some(t => t.id === task.id)) db.tasks.push({ ...task });
  return clone(db);
}
export async function addTask(task) { db.tasks.push(clone(task)); }
export async function updateTask(task) { const t = db.tasks.find(x => x.id === task.id); if (t) Object.assign(t, { name: task.name, coins: task.coins, category: task.category }); }
export async function deleteTask(id) { db.tasks = db.tasks.filter(t => t.id !== id); }
export async function saveDiary(diary, photos) {
  const existing = db.diaries.find(d => d.date === diary.date);
  db.totalCoins += diary.earnedCoins - (existing?.earnedCoins ?? 0);
  if (existing) Object.assign(existing, clone({ ...diary, id: existing.id, createdAt: existing.createdAt, photos }));
  else db.diaries.push(clone({ ...diary, photos }));
  const saved = db.diaries.find(d => d.date === diary.date);
  return { totalCoins: db.totalCoins, id: saved.id, createdAt: saved.createdAt };
}
export async function deleteDiary(id) {
  const diary = db.diaries.find(d => d.id === id);
  if (diary) { db.totalCoins = Math.max(0, db.totalCoins - diary.earnedCoins); db.diaries = db.diaries.filter(d => d.id !== id); }
  return { totalCoins: db.totalCoins };
}
export async function addReward(reward) { db.rewards.push(clone(reward)); }
export async function redeemReward(id, at) {
  const reward = db.rewards.find(r => r.id === id);
  if (!reward || reward.redeemed || db.totalCoins < reward.requiredCoins) return { ok: false, totalCoins: db.totalCoins };
  db.totalCoins -= reward.requiredCoins; reward.redeemed = true; reward.redeemedAt = at;
  return { ok: true, totalCoins: db.totalCoins };
}
export async function deleteReward(id) { db.rewards = db.rewards.filter(r => r.id !== id); }
export async function setRewardOrder(orders) { orders.forEach((id, order) => { const r = db.rewards.find(x => x.id === id); if (r) r.order = order; }); }
