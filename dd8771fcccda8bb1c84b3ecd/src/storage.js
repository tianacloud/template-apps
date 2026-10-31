import { createTianaFetch } from '@tianacloud/serverless';
async function execute(sql, args = []) {
  const c = await window.tiana.connection();
  if (c.sql_api !== 'hrana-v3' || typeof window.tiana.auth?.getAccessToken !== 'function') throw new Error('数据库连接不可用');
  const fetcher = createTianaFetch({origin:c.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
  const response = await fetcher(`${c.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw new Error('数据库响应不可用，请刷新核对后再操作');
  const data = await response.json(); const result = data.results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作失败，请刷新核对');
  return result.response.result;
}
const val = x => x == null ? {type:'null'} : Number.isInteger(x) ? {type:'integer',value:String(x)} : {type:'text',value:String(x)};
export const cloud = {database:{from(){return {
  insert(row){return {async select(){try {await execute('INSERT INTO wenmai_notes (id,client_id,title,summary,topics,words,tree,created_at) VALUES (?,?,?,?,?,?,?,?)',[crypto.randomUUID(),row.client_id,row.title,row.summary,row.topics,row.words,JSON.stringify(row.tree),new Date().toISOString()].map(val)); return {data:[]};}catch(error){return {error};}}}},
  select(){return {order(){return {async limit(){try {const result=await execute('SELECT id,title,summary,topics,words,created_at,client_id,tree FROM wenmai_notes ORDER BY created_at DESC LIMIT 50'); const data=result.rows.map(row=>Object.fromEntries(result.cols.map((col,i)=>[col.name,row[i].value ?? null]))); data.forEach(row=>{row.tree=JSON.parse(row.tree)}); return {data};}catch(error){return {error};}}}}}}
}}}};
