import { sql } from './db.js';
const keys = new Set(['travel-wallet-theme', 'travel-wallet-style', 'travel-wallet-map-mode', 'travel-wallet-base-layer']);
export async function initPreferences() {
  const values = new Map();
  const preview = window.TRAVEL_PREVIEW === true;
  let ready = preview;
  let queue = Promise.resolve();
  function notice(message) {
    const el = document.querySelector('#preferenceNotice');
    if (el) { el.hidden = false; el.textContent = message; }
  }
  if (!preview) {
    try {
      const result = await sql('SELECT key, value FROM travel_settings');
      for (const row of result.rows) if (keys.has(row.key)) values.set(row.key, row.value);
      ready = true;
    } catch { notice('设置暂时无法读取，请检查数据库连接并刷新。'); }
  }
  window.travelPreferences = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) {
      if (!keys.has(key)) return;
      values.set(key, value);
      if (preview) return;
      if (!ready) { notice('设置未保存，请检查数据库连接并刷新。'); return; }
      queue = queue.then(async () => {
        try {
          await sql('INSERT INTO travel_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key, value]);
          notice('设置已保存');
        } catch { notice('设置保存结果未确认，请刷新后检查。'); }
      });
    },
    clear() { values.clear(); },
  };
}
