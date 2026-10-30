import { createTianaFetch } from '@tianacloud/serverless';
let channel;
async function sql(statement, values = []) {
  if (!channel) {
    const auth = window.tiana?.auth;
    if (!auth?.getAccessToken) throw Error('账号连接未就绪');
    const c = await window.tiana.connection();
    if (c.sql_api !== 'hrana-v3') throw Error('数据库协议不受支持');
    channel = { origin: c.origin, fetch: createTianaFetch({ origin: c.origin, auth, requestBodyMode: 'buffered' }) };
  }
  const response = await channel.fetch(`${channel.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw Error('数据库操作结果未确认，请刷新检查');
  const result = (await response.json()).results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作结果未确认，请刷新检查');
  return result.response.result.rows;
}
export async function loadCard() {
  const rows = await sql('SELECT data_json,image_path FROM cup_card WHERE id=?',['main']);
  return rows.length ? { data: JSON.parse(rows[0][0].value), path: rows[0][1].value || '' } : null;
}
export async function saveCard(data,path) {
  const json=JSON.stringify(data);
  try { await sql('INSERT INTO cup_card(id,data_json,image_path) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET data_json=excluded.data_json,image_path=excluded.image_path',['main',json,path]); }
  catch (error) { const actual=await loadCard(); if (!actual || JSON.stringify(actual.data)!==json || actual.path!==path) throw error; }
}
export async function uploadImage(file) {
  const files=window.tiana?.files;
  if (!files) throw Error('文件服务未就绪');
  const path='portraits/'+crypto.randomUUID(); let id;
  try { const result=await files.put(path,file,{onPrepared:r=>{id=String(r.id)}}); if(!result?.completed) throw Error('上传结果未确认'); }
  catch(error) { if (!id) throw error; const status=await files.uploadStatus(id); if(!status.completed) throw Error('上传结果未确认，上传编号 '+id+'；请检查后再操作'); }
  return path;
}
export async function imageUrl(path) { const response=await window.tiana.files.get(path); if(!response.ok) throw Error('立绘读取失败'); return URL.createObjectURL(await response.blob()); }
