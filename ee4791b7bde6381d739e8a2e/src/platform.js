import { createTianaFetch } from '@tianacloud/serverless';
let client;
async function sql(statement, values = []) {
  if (!client) client = (async () => {
    const c = await window.tiana.connection();
    if (c.sql_api !== 'hrana-v3' || !window.tiana.auth?.getAccessToken) throw Error('数据库连接不可用');
    return {c, fetch: createTianaFetch({origin:c.origin, auth:window.tiana.auth, requestBodyMode:'buffered'})};
  })().catch(e => { client = null; throw e; });
  const {c, fetch} = await client;
  const response = await fetch(`${c.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw Error('数据库请求结果未确认');
  const result = (await response.json()).results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作未确认');
  return result.response.result.rows.map(row => row.map(value => value.value));
}
export async function loadState() { return Object.fromEntries(await sql('SELECT key, value FROM app_state')); }
let writes = Promise.resolve();
export function saveState(key, value) {
  const next = writes.then(() => sql('INSERT INTO app_state (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key,value]));
  writes = next.catch(() => {});
  return next;
}
