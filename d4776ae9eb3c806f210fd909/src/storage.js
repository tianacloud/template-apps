import { createTianaFetch } from '@tianacloud/serverless';
let execute;
let pending = Promise.resolve();
export async function loadStorage() {
  const auth = window.tiana?.auth;
  if (typeof auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw Error('授权尚未就绪');
  const c = await window.tiana.connection();
  if (c.sql_api !== 'hrana-v3') throw Error('不支持当前数据库协议');
  const sqlFetch = createTianaFetch({origin:c.origin, auth, requestBodyMode:'buffered'});
  execute = async (sql, args = []) => {
    const response = await sqlFetch(`${c.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:args.map(value=>({type:'text',value:String(value)})),want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库操作结果未知');
    const statement = (await response.json()).results?.[0];
    if (statement?.type !== 'ok' || statement.response?.type !== 'execute') throw Error('数据库操作失败或结果未知');
    return statement.response.result;
  };
  const result = await execute('SELECT key, value FROM settings');
  return Object.fromEntries(result.rows.map(row => [row[0].value, row[1].value]));
}
export function writeStorage(key, value) {
  const write = pending.then(() => execute('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key, value]));
  pending = write.catch(() => {});
  return write;
}
