import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createScoreStore} from '../src/scores.js';
function database() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
  return {db, execute: async (sql, values = []) => ({rows: db.prepare(sql).all(...values)})};
}
const record = total => ({total, grade: total >= 95 ? 'S' : 'A', mttr: 80, impact: 65000, ts: 1000});
test('reopening preserves highest scores, lower scores cannot overwrite them, and applications are isolated', async () => {
  const {db, execute} = database(), first = createScoreStore(execute, 'app-one');
  assert.deepEqual(await first.load(), {});
  await first.save('pool', record(95));
  const reopened = createScoreStore(execute, 'app-one');
  assert.equal((await reopened.load()).pool.total, 95);
  await first.save('pool', record(90));
  assert.equal((await reopened.load()).pool.total, 95);
  await reopened.save('pool', record(100));
  assert.equal((await first.load()).pool.total, 100);
  assert.deepEqual(await createScoreStore(execute, 'app-two').load(), {});
  db.close();
});
test('a committed write with a lost response is verified without replay', async () => {
  const {db, execute} = database(); let writes = 0;
  const store = createScoreStore(async (sql, values) => {
    const result = await execute(sql, values);
    if (sql.startsWith('INSERT')) { writes++; throw new Error('response lost'); }
    return result;
  }, 'app-one');
  assert.equal((await store.save('pool', record(95))).pool.total, 95);
  assert.equal(writes, 1); db.close();
});
test('a rejected write stays a failure and does not create a local score', async () => {
  const {db, execute} = database();
  const store = createScoreStore(async (sql, values) => {
    if (sql.startsWith('INSERT')) throw new Error('write rejected');
    return execute(sql, values);
  }, 'app-one');
  await assert.rejects(store.save('pool', record(95)), /write rejected/);
  assert.deepEqual(await store.load(), {}); db.close();
});
