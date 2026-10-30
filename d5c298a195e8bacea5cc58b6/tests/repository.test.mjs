// Runs the app's SQL against a local SQLite with the template schema.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import * as repo from '../src/data/repository.js';

function local() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
  repo.useTransaction(async statements => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const out = statements.map(s => db.prepare(s.sql).all(...(s.args ?? [])));
      db.exec('COMMIT');
      return out.map(rows => rows.map(r => ({ ...r })));
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  });
  return db;
}
const day = (date, earnedCoins, photos = []) => ({ id: `d-${date}`, date, content: '<span class="font-serif">x</span>', mood: 'happy', completedTaskIds: [], quantities: {}, snapshots: [], earnedCoins, photos, createdAt: 1, updatedAt: 1 });

test('first load restores the example tasks and an empty wallet', async () => {
  local();
  const data = await repo.load();
  assert.equal(data.totalCoins, 0);
  assert.deepEqual(data.tasks.map(t => [t.name, t.coins, t.isBuiltIn]), [['一节网课', 2, true], ['一套卷子', 5, true], ['读书1小时', 3, true]]);
});

test('a deleted example task comes back at the end on the next load', async () => {
  local();
  await repo.load();
  await repo.addTask({ id: 'run', name: '跑步', coins: 4, category: '健身篇' });
  await repo.deleteTask('builtin-online-class');
  const data = await repo.load();
  assert.deepEqual(data.tasks.map(t => t.id), ['builtin-paper-set', 'builtin-reading', 'run', 'builtin-online-class']);
});

test('saving a day adds its coins; re-saving applies only the difference, even below zero', async () => {
  local(); await repo.load();
  assert.equal((await repo.saveDiary(day('2026-10-01', 13), [], new Set())).totalCoins, 13);
  assert.equal((await repo.saveDiary({ ...day('2026-10-01', 4), id: 'other-id' }, [], new Set())).totalCoins, 4);
  const saved = await repo.load();
  assert.equal(saved.diaries.length, 1); assert.equal(saved.diaries[0].id, 'd-2026-10-01');
  await repo.addReward({ id: 'r1', name: '书', requiredCoins: 4, createdAt: 1 });
  assert.equal((await repo.redeemReward('r1', 9)).totalCoins, 0);
  assert.equal((await repo.saveDiary(day('2026-10-01', 0), [], new Set())).totalCoins, -4);
});

test('deleting a day removes its coins without going below zero', async () => {
  local(); await repo.load();
  await repo.saveDiary(day('2026-10-02', 10), [], new Set());
  await repo.addReward({ id: 'r1', name: '书', requiredCoins: 8, createdAt: 1 });
  await repo.redeemReward('r1', 5);
  assert.equal((await repo.deleteDiary('d-2026-10-02')).totalCoins, 0);
  assert.equal((await repo.load()).diaries.length, 0);
});

test('redeeming needs enough coins and happens once', async () => {
  local(); await repo.load();
  await repo.saveDiary(day('2026-10-03', 10), [], new Set());
  await repo.addReward({ id: 'big', name: '大', requiredCoins: 50, createdAt: 1 });
  await repo.addReward({ id: 'small', name: '小', requiredCoins: 6, createdAt: 2 });
  assert.deepEqual(await repo.redeemReward('big', 1), { ok: false, totalCoins: 10 });
  assert.deepEqual(await repo.redeemReward('small', 2), { ok: true, totalCoins: 4 });
  assert.deepEqual(await repo.redeemReward('small', 3), { ok: false, totalCoins: 4 });
  const reward = (await repo.load()).rewards.find(r => r.id === 'small');
  assert.equal(reward.redeemed, true); assert.equal(reward.redeemedAt, 2);
});

test('photos keep their order; removed stickers are deleted and new ones added', async () => {
  local(); await repo.load();
  const a = { id: 'p-a', path: 'photos/a.jpg' }, b = { id: 'p-b', path: 'photos/b.jpg' }, c = { id: 'p-c', path: 'photos/c.jpg' };
  await repo.saveDiary(day('2026-10-04', 0), [a, b], new Set());
  await repo.saveDiary(day('2026-10-04', 0), [b, c], new Set(['p-a', 'p-b']));
  assert.deepEqual((await repo.load()).diaries[0].photos, [b, c]);
});

test('goal order is stored for open goals', async () => {
  local(); await repo.load();
  for (const [i, id] of ['g1', 'g2', 'g3'].entries()) await repo.addReward({ id, name: id, requiredCoins: 1, createdAt: i });
  await repo.setRewardOrder(['g3', 'g1', 'g2']);
  assert.deepEqual((await repo.load()).rewards.map(r => [r.id, r.order]), [['g1', 1], ['g2', 2], ['g3', 0]]);
});
