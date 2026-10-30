import {createTianaFetch} from '@tianacloud/serverless';
let channel;
async function sql(text, values=[]) {
  if (!window.tiana?.appId || !window.tiana?.auth?.getAccessToken || !window.tiana?.connection) throw Error('账号连接未就绪');
  if (!channel) channel=window.tiana.connection().then(c=>{if(c.sql_api!=='hrana-v3') throw Error('数据库协议不支持');return {origin:c.origin,fetch:createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'})};}).catch(e=>{channel=null;throw e});
  const c=await channel, args=values.map(v=>typeof v==='number'?{type:'integer',value:String(v)}:{type:'text',value:String(v)});
  const res=await c.fetch(c.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:text,args,want_rows:true}},{type:'close'}]})});
  if(!res.ok) throw Error('数据库请求失败');const data=await res.json(), item=data.results?.[0];
  if(item?.type!=='ok'||item.response?.type!=='execute')throw Error('数据库操作失败');
  const r=item.response.result; return {rows:(r.rows||[]).map(row=>Object.fromEntries(r.cols.map((col,i)=>[col.name,row[i]?.value]))),affected:Number(r.affected_row_count||0)};
}
export async function readState(){return (await sql('SELECT payload,version FROM iron_state WHERE app_id=?',[window.tiana.appId])).rows[0]||null;}
export async function writeState(payload,version){
  let r; try { r=version===null ? await sql('INSERT INTO iron_state(app_id,payload,version) VALUES(?,?,1) ON CONFLICT(app_id) DO NOTHING',[window.tiana.appId,payload]) : await sql('UPDATE iron_state SET payload=?,version=version+1 WHERE app_id=? AND version=?',[payload,window.tiana.appId,version]); }
  catch(e) { const row=await readState(); if(row?.payload===payload && Number(row.version)===(version===null?1:version+1)) return Number(row.version); throw e; }
  if(r.affected!==1) throw Error('存档冲突'); return version===null?1:version+1;
}
