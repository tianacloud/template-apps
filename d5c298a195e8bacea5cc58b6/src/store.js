import { reactive, computed } from 'vue';
import * as repository from './data/repository.js';
import { CATEGORIES } from './data/constants.js';
import { newId } from './utils.js';
import { notify } from './dialog.js';
import { resolvePhotos, uploadPhotos } from './files.js';

export const state = reactive({ ready: false, error: '', totalCoins: 0, tasks: [], diaries: [], rewards: [] });

// Applies a confirmed snapshot of the stored data.
function apply(data) { Object.assign(state, { totalCoins: data.totalCoins, tasks: data.tasks, diaries: data.diaries, rewards: data.rewards }); }
export async function start() {
  try { apply(await resolvePhotos(await repository.load())); state.ready = true; }
  catch (error) { state.error = error?.message || '数据暂时无法读取，请稍后刷新。'; }
}
// A failed write keeps the user's input; reload what is actually stored.
async function persist(work) {
  try { return await work(); }
  catch (error) {
    notify(error?.message || '保存没有完成，请再试一次。');
    try { apply(await resolvePhotos(await repository.load())); } catch { /* Keep the current view. */ }
    throw error;
  }
}

export const tasksByCategory = computed(() => {
  const groups = {};
  for (const c of CATEGORIES) groups[c] = [];
  for (const task of state.tasks) { const c = task.category || '学习篇'; (groups[c] ||= []).push(task); }
  return groups;
});
export const allCategories = computed(() => Object.keys(tasksByCategory.value));
export function findDiaryByDate(date) { return state.diaries.find(d => d.date === date); }

export async function addTask(name, coins, category) {
  const task = { id: newId(), name: name.trim(), coins: Math.max(0, Math.round(coins)), isBuiltIn: false, category: category || '学习篇' };
  await persist(() => repository.addTask(task));
  state.tasks.push(task);
}
export async function updateTask(id, name, coins, category) {
  const index = state.tasks.findIndex(t => t.id === id);
  if (index === -1) return;
  const task = { ...state.tasks[index], name: name.trim(), coins: Math.max(0, Math.round(coins)), category: category || state.tasks[index].category };
  await persist(() => repository.updateTask(task));
  state.tasks[index] = task;
}
export async function deleteTask(id) {
  await persist(() => repository.deleteTask(id));
  state.tasks = state.tasks.filter(t => t.id !== id);
}

// Coins are snapshotted from the task list at save time; later task edits never rewrite history.
export async function saveDiary(input) {
  const now = Date.now();
  const completedTaskIds = Object.entries(input.quantities).filter(([, n]) => n > 0).map(([id]) => id);
  const snapshots = completedTaskIds.map(id => {
    const task = state.tasks.find(t => t.id === id);
    return task ? { taskId: task.id, taskName: task.name, coins: task.coins, category: task.category, count: Math.max(1, input.quantities[id] || 1) } : null;
  }).filter(Boolean);
  const earnedCoins = snapshots.reduce((sum, s) => sum + s.coins * s.count, 0);
  const existing = findDiaryByDate(input.date);
  const diary = { id: existing?.id ?? newId(), date: input.date, content: input.content, mood: input.mood, completedTaskIds,
    quantities: { ...input.quantities }, snapshots, earnedCoins, photos: input.photos,
    createdAt: existing?.createdAt ?? now, updatedAt: now };
  const stored = new Set((existing?.photos ?? []).map(p => p.id));
  const saved = await persist(async () => { await uploadPhotos(diary.photos.filter(p => !stored.has(p.id))); return repository.saveDiary(diary, diary.photos, stored); });
  diary.id = saved.id; diary.createdAt = saved.createdAt;
  state.totalCoins = saved.totalCoins;
  if (existing) Object.assign(existing, diary); else state.diaries.push(diary);
}
export async function deleteDiary(id) {
  const saved = await persist(() => repository.deleteDiary(id));
  state.totalCoins = saved.totalCoins;
  state.diaries = state.diaries.filter(d => d.id !== id);
}

export async function addReward(name, coins) {
  const reward = { id: newId(), name: name.trim(), requiredCoins: Math.max(1, Math.round(coins)), redeemed: false, createdAt: Date.now() };
  await persist(() => repository.addReward(reward));
  state.rewards.push(reward);
}
export async function redeemReward(id) {
  const reward = state.rewards.find(r => r.id === id);
  if (!reward || reward.redeemed || state.totalCoins < reward.requiredCoins) return false;
  const at = Date.now();
  const result = await persist(() => repository.redeemReward(id, at));
  state.totalCoins = result.totalCoins;
  if (result.ok) { reward.redeemed = true; reward.redeemedAt = at; }
  return result.ok;
}
export async function deleteReward(id) {
  await persist(() => repository.deleteReward(id));
  state.rewards = state.rewards.filter(r => r.id !== id);
}
export async function reorderRewards(id, target) {
  const open = state.rewards.filter(r => !r.redeemed).sort((a, b) => (a.order ?? state.rewards.indexOf(a)) - (b.order ?? state.rewards.indexOf(b)));
  const from = open.findIndex(r => r.id === id);
  if (from === -1) return;
  const [moved] = open.splice(from, 1);
  open.splice(Math.max(0, Math.min(open.length, target)), 0, moved);
  await persist(() => repository.setRewardOrder(open.map(r => r.id)));
  open.forEach((r, order) => { r.order = order; });
}
