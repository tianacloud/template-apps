import { createTianaFetch } from '@tianacloud/serverless';
let connection;
async function execute(sql, args = []) {
  if (!connection) {
    const c = await window.tiana.connection();
    if (c.sql_api !== 'hrana-v3' || typeof window.tiana.auth?.getAccessToken !== 'function') throw new Error('数据库连接不可用');
    connection = { origin: c.origin, fetch: createTianaFetch({origin:c.origin, auth:window.tiana.auth, requestBodyMode:'buffered'}) };
  }
  const r = await connection.fetch(`${connection.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if (!r.ok) throw new Error('数据库请求结果未知');
  const b = await r.json(); const x = b.results?.[0];
  if (x?.type !== 'ok' || x.response?.type !== 'execute') throw new Error('数据库操作失败');
  return x.response.result;
}
async function write(data) {
  await execute('INSERT INTO timezone_preferences(id,value) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value', [{type:'text',value:data}]);
}
window.prefStore = {write, async read() {
  const result = await execute('SELECT value FROM timezone_preferences WHERE id=1');
  const value = result.rows?.[0]?.[0]?.value;
  if (value) return JSON.parse(value);
  let legacy;
  try { legacy = localStorage.getItem(window.TZ_TIME.STORAGE_KEY); if (legacy) JSON.parse(legacy); } catch { legacy = null; }
  if (legacy) { await execute('INSERT OR IGNORE INTO timezone_preferences(id,value) VALUES(1,?)', [{type:'text',value:legacy}]); const current = await execute('SELECT value FROM timezone_preferences WHERE id=1'); localStorage.removeItem(window.TZ_TIME.STORAGE_KEY); return JSON.parse(current.rows[0][0].value); }
  return null;
}};
