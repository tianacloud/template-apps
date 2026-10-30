import {createTianaFetch} from '@tianacloud/serverless';
let channel;
async function sql(statement, values=[]) {
  if(!window.tiana?.auth?.getAccessToken || !window.tiana?.connection || !window.tiana?.appId) throw Error('账号连接未就绪');
  if(!channel) channel=window.tiana.connection().then(c=>{if(c.sql_api!=='hrana-v3') throw Error('不支持的数据库协议');return {origin:c.origin,fetch:createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'})}});
  const c=await channel;
  const args=values.map(v=>typeof v==='number'?{type:'integer',value:String(v)}:{type:'text',value:String(v)});
  const response=await c.fetch(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args,want_rows:true}},{type:'close'}]})});
  if(!response.ok)throw Error('数据库结果未确认');
  const body=await response.json(), item=body.results?.[0];
  if(item?.type!=='ok'||item.response?.type!=='execute')throw Error('数据库结果未确认');
  const r=item.response.result;
  return {rows:(r.rows||[]).map(row=>Object.fromEntries(r.cols.map((col,i)=>[col.name,row[i]?.value]))),affected:Number(r.affected_row_count||0)};
}
export async function readState(){return (await sql('SELECT value, version FROM nutrition_state WHERE app_id = ?',[window.tiana.appId])).rows[0]||null;}
export async function writeState(value,version){
  let result;
  try {result=version===null?await sql('INSERT INTO nutrition_state (app_id,value,version) VALUES (?,?,1) ON CONFLICT(app_id) DO NOTHING',[window.tiana.appId,value]):await sql('UPDATE nutrition_state SET value=?, version=version+1 WHERE app_id=? AND version=?',[value,window.tiana.appId,version]);}
  catch(e){const actual=await readState();if(actual?.value===value && Number(actual.version)===(version===null?1:version+1))return Number(actual.version);throw e;}
  if(result.affected!==1)throw Error('数据冲突');return version===null?1:version+1;
}
