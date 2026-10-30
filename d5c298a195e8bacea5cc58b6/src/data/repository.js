import { transaction as remote } from './db.js';
import { BUILT_IN_TASKS } from './constants.js';

// Tests run the same statements against a local SQLite.
let transaction = remote;
export function useTransaction(run) { transaction = run; }

const json = value => JSON.stringify(value ?? null);
const parse = (value, fallback) => { try { return JSON.parse(value) ?? fallback; } catch { return fallback; } };
const wallet = { sql: 'SELECT total_coins FROM pool_wallet WHERE id = 1' };
const coins = rows => Number(rows[0]?.total_coins ?? 0);

// Example tasks that are missing come back at the end of the list on every load.
const restoreBuiltIns = BUILT_IN_TASKS.map(task => ({
  sql: `INSERT OR IGNORE INTO pool_tasks (id, name, coins, is_built_in, category, position)
        SELECT ?, ?, ?, 1, ?, COALESCE(MAX(position) + 1, 0) FROM pool_tasks`,
  args: [task.id, task.name, task.coins, task.category],
}));

export async function load() {
  const [, ...rest] = await transaction([
    { sql: 'INSERT OR IGNORE INTO pool_wallet (id, total_coins) VALUES (1, 0)' },
    ...restoreBuiltIns,
    wallet,
    { sql: 'SELECT id, name, coins, is_built_in, category FROM pool_tasks ORDER BY position, rowid' },
    { sql: 'SELECT id, date, content, mood, completed_task_ids, quantities, snapshots, earned_coins, created_at, updated_at FROM pool_diaries ORDER BY created_at, rowid' },
    { sql: 'SELECT id, diary_id, file_path FROM pool_photos ORDER BY diary_id, position, rowid' },
    { sql: 'SELECT id, name, required_coins, redeemed, sort_order, created_at, redeemed_at FROM pool_rewards ORDER BY created_at, rowid' },
  ]);
  const [walletRows, tasks, diaries, photos, rewards] = rest.slice(restoreBuiltIns.length);
  return {
    totalCoins: coins(walletRows),
    tasks: tasks.map(t => ({ id: t.id, name: t.name, coins: Number(t.coins), isBuiltIn: !!t.is_built_in, category: t.category || '学习篇' })),
    diaries: diaries.map(d => ({
      id: d.id, date: d.date, content: d.content, mood: d.mood,
      completedTaskIds: parse(d.completed_task_ids, []), quantities: parse(d.quantities, {}), snapshots: parse(d.snapshots, []),
      earnedCoins: Number(d.earned_coins), createdAt: Number(d.created_at), updatedAt: Number(d.updated_at),
      photos: photos.filter(p => p.diary_id === d.id).map(p => ({ id: p.id, path: p.file_path })),
    })),
    rewards: rewards.map(r => ({
      id: r.id, name: r.name, requiredCoins: Number(r.required_coins), redeemed: !!r.redeemed, createdAt: Number(r.created_at),
      ...(r.sort_order !== null ? { order: Number(r.sort_order) } : {}), ...(r.redeemed_at !== null ? { redeemedAt: Number(r.redeemed_at) } : {}),
    })),
  };
}

export async function addTask(task) {
  await transaction([{ sql: `INSERT INTO pool_tasks (id, name, coins, is_built_in, category, position)
    SELECT ?, ?, ?, 0, ?, COALESCE(MAX(position) + 1, 0) FROM pool_tasks`, args: [task.id, task.name, task.coins, task.category] }]);
}
export async function updateTask(task) {
  await transaction([{ sql: 'UPDATE pool_tasks SET name = ?, coins = ?, category = ? WHERE id = ?', args: [task.name, task.coins, task.category, task.id] }]);
}
export async function deleteTask(id) {
  await transaction([{ sql: 'DELETE FROM pool_tasks WHERE id = ?', args: [id] }]);
}

// Re-saving a day adds the difference to the wallet; the result may go below zero.
export async function saveDiary(diary, photos, storedPhotoIds) {
  const order = json(photos.map(p => p.id));
  const fresh = photos.filter(p => !storedPhotoIds.has(p.id));
  const results = await transaction([
    { sql: 'UPDATE pool_wallet SET total_coins = total_coins + ? - COALESCE((SELECT earned_coins FROM pool_diaries WHERE date = ?), 0) WHERE id = 1',
      args: [diary.earnedCoins, diary.date] },
    { sql: `INSERT INTO pool_diaries (id, date, content, mood, completed_task_ids, quantities, snapshots, earned_coins, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET content = excluded.content, mood = excluded.mood, completed_task_ids = excluded.completed_task_ids,
              quantities = excluded.quantities, snapshots = excluded.snapshots, earned_coins = excluded.earned_coins, updated_at = excluded.updated_at`,
      args: [diary.id, diary.date, diary.content, diary.mood, json(diary.completedTaskIds), json(diary.quantities), json(diary.snapshots), diary.earnedCoins, diary.createdAt, diary.updatedAt] },
    { sql: 'DELETE FROM pool_photos WHERE diary_id = (SELECT id FROM pool_diaries WHERE date = ?) AND id NOT IN (SELECT value FROM json_each(?))',
      args: [diary.date, order] },
    ...fresh.map(p => ({ sql: 'INSERT OR IGNORE INTO pool_photos (id, diary_id, position, file_path) SELECT ?, id, 0, ? FROM pool_diaries WHERE date = ?',
      args: [p.id, p.path, diary.date] })),
    { sql: 'UPDATE pool_photos SET position = (SELECT key FROM json_each(?) WHERE value = pool_photos.id) WHERE diary_id = (SELECT id FROM pool_diaries WHERE date = ?)',
      args: [order, diary.date] },
    wallet,
    { sql: 'SELECT id, created_at FROM pool_diaries WHERE date = ?', args: [diary.date] },
  ]);
  const saved = results.at(-1)[0];
  return { totalCoins: coins(results.at(-2)), id: saved.id, createdAt: Number(saved.created_at) };
}

// Deleting a day removes what it earned, never taking the wallet below zero.
export async function deleteDiary(id) {
  const results = await transaction([
    { sql: 'UPDATE pool_wallet SET total_coins = MAX(0, total_coins - COALESCE((SELECT earned_coins FROM pool_diaries WHERE id = ?), 0)) WHERE id = 1', args: [id] },
    { sql: 'DELETE FROM pool_photos WHERE diary_id = ?', args: [id] },
    { sql: 'DELETE FROM pool_diaries WHERE id = ?', args: [id] },
    wallet,
  ]);
  return { totalCoins: coins(results.at(-1)) };
}

export async function addReward(reward) {
  await transaction([{ sql: 'INSERT INTO pool_rewards (id, name, required_coins, redeemed, created_at) VALUES (?, ?, ?, 0, ?)',
    args: [reward.id, reward.name, reward.requiredCoins, reward.createdAt] }]);
}
// Deducts only while the goal is still open and the wallet covers it.
export async function redeemReward(id, at) {
  const results = await transaction([
    { sql: `UPDATE pool_wallet SET total_coins = total_coins - (SELECT required_coins FROM pool_rewards WHERE id = ? AND redeemed = 0)
            WHERE id = 1 AND total_coins >= (SELECT required_coins FROM pool_rewards WHERE id = ? AND redeemed = 0)`, args: [id, id] },
    { sql: 'UPDATE pool_rewards SET redeemed = 1, redeemed_at = ? WHERE id = ? AND redeemed = 0 AND changes() = 1', args: [at, id] },
    { sql: 'SELECT changes() AS redeemed' },
    wallet,
  ]);
  return { ok: Number(results[2][0]?.redeemed) === 1, totalCoins: coins(results.at(-1)) };
}
export async function deleteReward(id) {
  await transaction([{ sql: 'DELETE FROM pool_rewards WHERE id = ?', args: [id] }]);
}
export async function setRewardOrder(orders) {
  await transaction([{ sql: 'UPDATE pool_rewards SET sort_order = (SELECT key FROM json_each(?) WHERE value = pool_rewards.id) WHERE id IN (SELECT value FROM json_each(?))',
    args: [json(orders), json(orders)] }]);
}
