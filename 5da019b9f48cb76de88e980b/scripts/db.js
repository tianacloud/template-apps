import {createTianaFetch} from '@tianacloud/serverless';
let channel;
async function connection() {
  if (!channel) channel = (async () => {
    const auth = window.tiana?.auth;
    if (typeof auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw Error('账号连接未就绪');
    const c = await window.tiana.connection();
    if (c.sql_api !== 'hrana-v3') throw Error('数据库协议不支持');
    return {origin:c.origin, fetch:createTianaFetch({origin:c.origin, auth, requestBodyMode:'buffered'})};
  })().catch(error => { channel = null; throw error; });
  return channel;
}
export async function sql(text, args=[]) {
  const c=await connection();
  const values=args.map(v => typeof v === 'number' ? {type:'integer',value:String(v)} : {type:'text',value:String(v)});
  const response=await c.fetch(c.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:text,args:values,want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw Error('数据库结果未知');
  const data=await response.json(), result=data.results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作未确认');
  const r=result.response.result;
  return {affected:Number(r.affected_row_count || 0),rows:(r.rows || []).map(row=>Object.fromEntries(r.cols.map((col,i)=>[col.name,row[i]?.type==='null'?null:row[i]?.value??null])))};
}
