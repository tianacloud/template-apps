import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('自动刷新设置保存并在重新打开后恢复', async () => {
  const rows = new Map();
  globalThis.location = { origin: 'https://example.test' };
  globalThis.__testDb = {
    async read(key) { return rows.get(key) ?? null; },
    async save(key, value, expected) {
      const row = rows.get(key);
      if ((row?.version ?? null) !== expected) throw Error('数据已被其他窗口修改');
      const next = { value, version: (row?.version ?? 0) + 1 };
      rows.set(key, next);
      return next;
    }
  };
  const db = 'data:text/javascript,' + encodeURIComponent('export const read=(...a)=>globalThis.__testDb.read(...a);export const save=(...a)=>globalThis.__testDb.save(...a);');
  const logic = new URL('../src/logic.js', import.meta.url).href;
  let source = await readFile(new URL('../src/adapter.js', import.meta.url), 'utf8');
  source = source.replace("'./db.js'", JSON.stringify(db)).replace("'./logic.js'", JSON.stringify(logic));
  const load = n => import('data:text/javascript,' + encodeURIComponent(source + `\n// instance ${n}`));
  const first = await load(1);
  assert.equal((await (await first.apiFetch('/api/auto?enabled=0',{method:'POST'})).json()).autoEnabled, false);
  assert.equal((await (await first.apiFetch('/api/auto-interval?ms=30000',{method:'POST'})).json()).autoIntervalMs, 30000);
  const second = await load(2);
  const state = await (await second.apiFetch('/api/state')).json();
  assert.equal(state.autoEnabled, false);
  assert.equal(state.autoIntervalMs, 30000);
  assert.equal(second.interval(), 30000);
  delete globalThis.__testDb;
  delete globalThis.location;
});
