import { createTianaFetch } from '@tianacloud/serverless';
let channel;
async function getChannel() {
  if (!channel) channel = (async () => {
    const auth=window.tiana?.auth;
    if (!auth?.getAccessToken || !window.tiana?.connection) throw new Error('应用数据库连接尚未就绪');
    const conn=await window.tiana.connection();
    if(conn.sql_api!=='hrana-v3') throw new Error('不支持当前数据库协议');
    return {conn, http:createTianaFetch({origin:conn.origin,auth,requestBodyMode:'buffered'})};
  })().catch(error => { channel = undefined; throw error; });
  return channel;
}
const arg = value => typeof value === 'number' ? {type:'integer',value:String(value)} : {type:'text',value:String(value)};
async function execute(sql, values=[]) {
  const {conn,http}=await getChannel();
  const response=await http(`${conn.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:values.map(arg),want_rows:true}},{type:'close'}]})});
  if(!response.ok) throw new Error('数据库请求失败；写入结果需核对');
  const body=await response.json(), first=body.results?.[0];
  if(first?.type!=='ok' || first.response?.type!=='execute') throw new Error('数据库语句失败或结果未知');
  const result=first.response.result;
  return (result.rows||[]).map(row=>Object.fromEntries(result.cols.map((c,i)=>[c.name,row[i]?.value??null])));
}
export async function saveResult(r) {
  return execute('INSERT INTO quiz_results (id,grade,level,chapter,topic,mode,total,correct,details,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',[r.id,r.grade,r.levelName,r.chapter,r.topic,r.mode,r.total,r.correct,JSON.stringify(r),new Date().toISOString()]);
}
export async function listResults() { return execute('SELECT id,grade,level,chapter,topic,mode,total,correct,created_at FROM quiz_results ORDER BY created_at DESC LIMIT 100'); }

export async function getResult(id) { const rows = await execute('SELECT details FROM quiz_results WHERE id = ?', [id]); return rows.length ? JSON.parse(rows[0].details) : null; }
