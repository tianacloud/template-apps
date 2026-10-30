import { createTianaFetch } from '@tianacloud/serverless';
const cache = new Map();
let channel;
async function sql(statement, args = []) {
  if (!channel) {
    const auth = window.tiana?.auth;
    if (typeof auth?.getAccessToken !== 'function') throw new Error('账号连接未就绪');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw new Error('数据库协议不受支持');
    channel = { origin: connection.origin, fetch: createTianaFetch({ origin: connection.origin, auth, requestBodyMode: 'buffered' }) };
  }
  const response = await channel.fetch(`${channel.origin}/v3/pipeline`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql: statement, args: args.map(value => ({type:'text', value})), want_rows: true } }, {type:'close'}] }) });
  if (!response.ok) throw new Error('数据库响应未确认');
  const body = await response.json();
  const item = body.results?.[0];
  if (item?.type !== 'ok' || item.response?.type !== 'execute') throw new Error('数据库操作未确认');
  return item.response.result;
}
export async function loadStorage() {
  const result = await sql('SELECT key, value FROM namesmith_settings');
  for (const row of result.rows || []) cache.set(row[0].value, row[1].value);
}
let queue = Promise.resolve();
export const storage = {
  getItem(key) { return cache.get(key) ?? null; },
  setItem(key, value) {
    value = String(value); cache.set(key, value);
    queue = queue.then(() => sql('INSERT INTO namesmith_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key,value])).catch(() => {
      const notice = document.getElementById('storage-error');
      if (notice) notice.textContent = '保存结果未确认，请保留内容并重新打开应用检查。';
    });
  }
};
