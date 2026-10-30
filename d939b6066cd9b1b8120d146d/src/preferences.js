import { sql } from './storage.js';
const values = new Map(__XINYU_DEMO__ ? [['xinyu.awoke','1']] : []);
const text = value => ({type:'text', value});
let pending = Promise.resolve();
export const preferences = {
  async load() {
    if (__XINYU_DEMO__) return;
    const result = await sql('SELECT key, value FROM xinyu_preferences WHERE app_id=?', [text(window.tiana.appId)]);
    for (const row of result.rows || []) values.set(row[0].value, row[1].value);
  },
  getItem(key) { return values.get(key) ?? null; },
  setItem(key, value) {
    value = String(value); values.set(key, value);
    if (__XINYU_DEMO__ || key === 'xinyu.tab') return;
    pending = pending.then(() => sql('INSERT INTO xinyu_preferences (app_id,key,value) VALUES (?,?,?) ON CONFLICT(app_id,key) DO UPDATE SET value=excluded.value', [text(window.tiana.appId),text(key),text(value)]));
    pending = pending.catch(() => { alert('设置保存失败，请检查连接后重试'); });
  },
  removeItem(key) { values.delete(key); },
  reset() { values.clear(); values.set('xinyu.awoke','1'); }
};
