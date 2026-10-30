import './style.css';
import layout from './layout.html?raw';
import { sql } from './db.js';
export async function mount(root, { files }) {
const css = document.createElement('link');
css.rel = 'stylesheet'; css.href = new URL('./app.css', import.meta.url).href; document.head.appendChild(css);
root.innerHTML = layout;
let knowledge;
try {
  const response = await files.get('template-assets/knowledge.json');
  if (!response.ok) throw new Error('素材读取失败');
  knowledge = await response.json();
  if (!Array.isArray(knowledge)) throw new Error('素材格式不正确');
} catch (error) {
  root.textContent = '知识点资料加载失败，请检查连接并重试。';
  return;
}
window.__SMART_PAGE__ = { database: {
  async query({databaseId}) {
    if (databaseId === 'knowledge') return {results: knowledge};
    const result = await sql('SELECT payload FROM practice_records ORDER BY rowid');
    return {results: result.rows.map(row => JSON.parse(row.payload))};
  },
  async addRecord({properties}) {
    const record = Object.fromEntries(Object.entries(properties).map(([key,value]) => [key, value.text ?? value.select ?? value.date ?? '']));
    const id = crypto.randomUUID();
    try { await sql('INSERT INTO practice_records (id, payload) VALUES (?, ?)', [id, JSON.stringify(record)]); }
    catch (err) {
      const found = await sql('SELECT id FROM practice_records WHERE id = ?', [id]);
      if (!found.rows.length) throw err;
    }
  }
}};
const cache = Object.create(null);
let writeQueue = Promise.resolve();
function cacheError() {
  let warning = document.getElementById('cacheWarning');
  if (!warning) {
    warning = document.createElement('div');
    warning.id = 'cacheWarning'; warning.className = 'state err';
    warning.setAttribute('role', 'alert');
    root.prepend(warning);
  }
  warning.textContent = '设置或草稿未能保存，请检查连接后重试。';
}
window.workbenchCache = {
  get(key) { return cache[key] || ''; },
  set(key, value) {
    cache[key] = value;
    writeQueue = writeQueue.catch(() => {}).then(() => sql(
      'INSERT INTO workbench_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, value]
    )).catch(cacheError);
  },
  remove(key) {
    delete cache[key];
    writeQueue = writeQueue.catch(() => {}).then(() => sql('DELETE FROM workbench_settings WHERE key = ?', [key])).catch(cacheError);
  }
};
async function start() {
try {
  const saved = await sql('SELECT key, value FROM workbench_settings');
  for (const row of saved.rows) cache[row.key] = row.value;
} catch (error) { cacheError(); }
await import('./logic.js');
}
await start();
return () => { root.innerHTML = ""; css.remove(); };
}
