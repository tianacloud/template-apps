import {createTianaFetch} from '@tianacloud/serverless';
let client;
async function getClient() {
  if (!client) client = (async () => {
    if (typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('认证不可用');
    const c = await window.tiana.connection();
    if (c.sql_api !== 'hrana-v3') throw Error('不支持的数据库协议');
    return {c, fetch: createTianaFetch({origin:c.origin, auth:window.tiana.auth, requestBodyMode:'buffered'})};
  })().catch(e => {client = null; throw e});
  return client;
}
export async function sql(query, values = []) {
  const {c, fetch} = await getClient();
  const response = await fetch(`${c.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql:query,args:values.map(value=>({type:'text',value:String(value)})),want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw Error('数据库响应未确认');
  const data = await response.json(), result = data.results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作未确认');
  const rows = result.response.result;
  return (rows.rows || []).map(row=>Object.fromEntries(rows.cols.map((col,i)=>[col.name,row[i]?.value ?? null])));
}
