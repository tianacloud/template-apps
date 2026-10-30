import { sql } from './db.js';
export async function loadStorage() {
  const { rows } = await sql('SELECT key, value FROM app_settings');
  const cache = new Map(rows.map(({ key, value }) => [key, value]));
  let queue = Promise.resolve();
  function write(key, value) {
    const previous = cache.get(key);
    if (value === null) cache.delete(key); else cache.set(key, value);
    const task = queue.then(() => value === null
      ? sql('DELETE FROM app_settings WHERE key = ?', [key])
      : sql('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, value]));
    queue = task.catch(() => {});
    task.catch(() => {
      if (cache.get(key) === (value === null ? undefined : value)) {
        if (previous === undefined) cache.delete(key); else cache.set(key, previous);
      }
      const notice = document.getElementById('storage-error');
      if (notice) notice.textContent = '部分设置未能保存，请检查连接后重新操作。';
    });
    return task;
  }
  return { getItem: key => cache.get(key) ?? null, setItem: (key, value) => write(key, String(value)), removeItem: key => write(key, null) };
}
