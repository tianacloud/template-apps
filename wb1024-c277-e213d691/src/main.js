import './style.css';
import layout from './layout.html?raw';
import knowledge from './knowledge.json';
import { sql } from './db.js';
const css = document.createElement('link');
css.rel = 'stylesheet'; css.href = new URL('./app.css', import.meta.url).href; document.head.appendChild(css);
document.getElementById('app').innerHTML = layout;
window.__SMART_PAGE__ = { database: {
  async query({databaseId}) {
    if (databaseId === 'v7azdIm5lGSHw6TQhzzRI0') return {results: knowledge};
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
import('./logic.js');
