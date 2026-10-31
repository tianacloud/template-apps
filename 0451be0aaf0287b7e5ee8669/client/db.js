import { createTianaFetch } from '@tianacloud/serverless';
let channel;
async function sql(statement, values = []) {
  if (!channel) {
    const auth = window.tiana?.auth;
    if (typeof auth?.getAccessToken !== 'function') throw Error('账号连接未就绪');
    const info = await window.tiana.connection();
    if (info.sql_api !== 'hrana-v3') throw Error('不支持的数据库协议');
    channel = { origin: info.origin, fetch: createTianaFetch({origin: info.origin, auth, requestBodyMode:'buffered'}) };
  }
  const args = values.map(v => typeof v === 'number' ? {type:'integer',value:String(v)} : {type:'text',value:String(v)});
  const response = await channel.fetch(channel.origin + '/v3/pipeline', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args,want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw Error('数据库响应未确认');
  const data = await response.json(); const item = data.results?.[0];
  if (item?.type !== 'ok' || item.response?.type !== 'execute' || !item.response.result) throw Error('数据库响应未确认');
  const result = item.response.result;
  return (result.rows || []).map(row => Object.fromEntries(result.cols.map((col,i) => [col.name,row[i]?.value ?? null])));
}
window.calendarDb = {sql};
