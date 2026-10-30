import { sql as defaultSql, verifiedWrite } from './db.js';
export async function openStorage(onError, sql = defaultSql) {
  const result = await sql('SELECT key, value FROM workspace_state');
  const data = Object.fromEntries(result.rows.map(row => [row.key, row.value]));
  const dirty = new Map();
  let timer, blocked = false, pending = Promise.resolve();
  function schedule(delay = 5000) { if (!timer && !blocked) timer = setTimeout(() => { timer = undefined; flush().catch(onError); }, delay); }
  function flush() {
    clearTimeout(timer); timer = undefined;
    pending = pending.catch(() => {}).then(async () => {
      for (const [key, value] of [...dirty]) {
        const actual = (await sql('SELECT value FROM workspace_state WHERE key = ?', [key])).rows[0]?.value ?? null;
        if (actual !== value) await verifiedWrite(
          () => value === null ? sql('DELETE FROM workspace_state WHERE key = ?', [key]) : sql('INSERT INTO workspace_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, value]),
          async () => (await sql('SELECT value FROM workspace_state WHERE key = ?', [key])).rows[0]?.value ?? null,
          actual => actual === value,
        );
        if (dirty.get(key) === value) dirty.delete(key);
      }
    });
    return pending.catch(error => { blocked = true; throw error; });
  }
  return {
    getItem(key) { return data[key] ?? null; },
    setItem(key, value) { data[key] = String(value); dirty.set(key, data[key]); if (key === 'moyu_settings') { clearTimeout(timer); timer = undefined; schedule(250); } else schedule(); },
    removeItem(key) { delete data[key]; dirty.set(key, null); schedule(); },
    flush,
    retry() { blocked = false; return flush(); },
  };
}
