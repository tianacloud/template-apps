import {sql} from './db.js';
export async function loadTheme() { const result = await sql("SELECT value FROM settings WHERE key = 'theme'"); return result.rows[0]?.value; }
export async function saveTheme(value) { await sql("INSERT INTO settings (key,value) VALUES ('theme',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", [value]); }
