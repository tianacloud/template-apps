import {createTianaFetch} from '@tianacloud/serverless';
let client;
async function execute(sql, values=[]) {
  if (!client) client = (async () => {
    if (typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('身份未就绪');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw Error('数据库协议不受支持');
    return {connection, fetch: createTianaFetch({origin:connection.origin, auth:window.tiana.auth, requestBodyMode:'buffered'})};
  })().catch(e => { client = undefined; throw e; });
  const {connection, fetch} = await client;
  const response = await fetch(`${connection.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw Error('数据库操作结果未确认');
  const body = await response.json(), statement = body.results?.[0];
  if (statement?.type !== 'ok' || statement.response?.type !== 'execute') throw Error('数据库操作结果未确认');
  return statement.response.result;
}
window.favoriteStore = {
  async list() { const result = await execute('SELECT name FROM favorites ORDER BY name'); return result.rows.map(row => row[0].value); },
  async set(name, wanted) { await execute(wanted ? 'INSERT OR IGNORE INTO favorites(name) VALUES (?)' : 'DELETE FROM favorites WHERE name = ?', [name]); }
};
