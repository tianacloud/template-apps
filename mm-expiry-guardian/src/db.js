import { createTianaFetch } from '@tianacloud/serverless';
let channel;
async function connection() {
  if (!window.tiana?.auth?.getAccessToken || !window.tiana?.connection || !window.tiana?.appId) throw Error('账号连接未就绪，请登录后重试');
  if (!channel) channel = window.tiana.connection().then(c => {
    if (c.sql_api !== 'hrana-v3') throw Error('当前数据库协议不支持安全参数化写入');
    return {origin:c.origin, fetch:createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'})};
  }).catch(e => {channel=null;throw e});
  return channel;
}
export async function sql(statement, values=[]) {
  const c=await connection();
  const args=values.map(v => v === null ? {type:'null'} : typeof v==='number' ? {type:'integer',value:String(v)} : {type:'text',value:String(v)});
  const response=await c.fetch(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args,want_rows:true}},{type:'close'}]})});
  if(!response.ok) throw Error('数据库响应未确认，请重新读取后核对');
  const body=await response.json(), result=body.results?.[0];
  if(result?.type!=='ok' || result.response?.type!=='execute') throw Error('数据库操作未确认，请重新读取后核对');
  const r=result.response.result;
  return {rows:(r.rows||[]).map(row=>Object.fromEntries(r.cols.map((col,i)=>[col.name,row[i]?.type==='null'?null:row[i]?.value]))),affected:Number(r.affected_row_count||0)};
}
export async function read(key) {
  const r=await sql('SELECT value, version FROM expiry_data WHERE app_id = ? AND key = ?', [window.tiana.appId,key]);
  return r.rows[0] || null;
}
export async function save(key,value,expected) {
  const id=window.tiana.appId;
  let result;
  try {
    result=expected===null ? await sql('INSERT INTO expiry_data (app_id,key,value,version) VALUES (?,?,?,1) ON CONFLICT(app_id,key) DO NOTHING',[id,key,value]) : await sql('UPDATE expiry_data SET value=?,version=version+1 WHERE app_id=? AND key=? AND version=?',[value,id,key,Number(expected)]);
  } catch(e) {
    try { const actual=await read(key); if(actual?.value===value && Number(actual.version)===(expected===null?1:Number(expected)+1)) return actual; } catch {}
    throw Error('保存结果未确认，请保留编辑内容并重新载入核对');
  }
  if(result.affected!==1) throw Error('数据已被其他窗口修改，请重新载入并合并后保存');
  return {value,version:expected===null?1:Number(expected)+1};
}
