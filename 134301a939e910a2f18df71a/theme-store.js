import { createTianaFetch } from '@tianacloud/serverless';
let channel;
let writes = Promise.resolve();
async function execute(sql, args = []) {
  if (!channel) channel = window.tiana.connection().then(c => {
    if (c.sql_api !== 'hrana-v3' || typeof window.tiana.auth?.getAccessToken !== 'function') throw new Error('数据库连接未就绪');
    return { origin: c.origin, fetch: createTianaFetch({origin:c.origin, auth:window.tiana.auth, requestBodyMode:'buffered'}) };
  }).catch(e => { channel = undefined; throw e; });
  const c = await channel;
  const response = await c.fetch(`${c.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw new Error('数据库响应未确认');
  const body = await response.json(); const result = body.results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作未确认');
  return result.response.result;
}
window.themeStore = {
  async read() { const r = await execute("SELECT value FROM dashboard_settings WHERE key = 'theme'"); return r.rows?.[0]?.[0]?.value; },
  write(value) { const next = writes.catch(() => {}).then(() => execute("INSERT INTO dashboard_settings (key,value) VALUES ('theme',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", [{type:'text',value}])); writes = next; return next; }
};
