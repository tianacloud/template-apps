import { createTianaFetch } from '@tianacloud/serverless';
let channel;
async function execute(sql, args = []) {
  if (!channel) {
    const auth = window.tiana?.auth;
    if (typeof auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw new Error('数据库连接尚未就绪');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw new Error('当前数据库协议不支持参数化保存');
    channel = {origin: connection.origin, fetch: createTianaFetch({origin:connection.origin, auth, requestBodyMode:'buffered'})};
  }
  const response = await channel.fetch(`${channel.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw new Error('数据库请求失败');
  const body = await response.json();
  const statement = body.results?.[0];
  if (statement?.type !== 'ok' || statement.response?.type !== 'execute') throw new Error('数据库未确认操作结果');
  return statement.response.result;
}
window.boxDatabase = {execute};
