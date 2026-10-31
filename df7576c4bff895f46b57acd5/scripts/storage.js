import { createTianaFetch } from '@tianacloud/serverless';
let client;
async function execute(sql, values = []) {
  if (!client) {
    if (!window.tiana?.appId || typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('应用连接不可用');
    const conn = await window.tiana.connection();
    if (conn.sql_api !== 'hrana-v3') throw Error('数据库协议不支持');
    client = { conn, fetch: createTianaFetch({ origin: conn.origin, auth: window.tiana.auth, requestBodyMode: 'buffered' }) };
  }
  const r = await client.fetch(`${client.conn.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
  if (!r.ok) throw Error('数据库操作结果未知');
  const result = (await r.json()).results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作未确认');
  return result.response.result.rows;
}
window.ssoStorage = {
  async load() { const rows = await execute('SELECT data FROM sso_config WHERE app_id=?',[window.tiana.appId]); return rows.length ? JSON.parse(rows[0][0].value) : null; },
  async save(data) { await execute('INSERT INTO sso_config(app_id,data) VALUES(?,?) ON CONFLICT(app_id) DO UPDATE SET data=excluded.data',[window.tiana.appId,JSON.stringify(data)]); }
};
