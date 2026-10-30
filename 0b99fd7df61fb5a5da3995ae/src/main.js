import { createTianaFetch } from '@tianacloud/serverless';
import body from './body.js';
import './style.css';
const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = new URL('./app.css', import.meta.url).href; document.head.appendChild(link);
document.getElementById('app').innerHTML = body;
let conn, sqlFetch;
async function execute(sql, values = []) {
  if (!conn) {
    conn = await window.tiana.connection();
    if (conn.sql_api !== 'hrana-v3' || typeof window.tiana.auth?.getAccessToken !== 'function') throw new Error('数据库连接不可用');
    sqlFetch = createTianaFetch({origin:conn.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
  }
  const args = values.map(v => typeof v === 'number' ? {type:'integer',value:String(v)} : {type:'text',value:String(v)});
  const response = await sqlFetch(`${conn.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if (!response.ok) throw new Error('数据库响应不可用，请刷新核实');
  const data = await response.json(), result = data.results?.[0];
  if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作未确认，请刷新核实');
  return result.response.result;
}
const styles = ['周会口播版','群消息版','绩效自评版'];
window.__SMART_PAGE__ = {database:{
  async readDraft() { const r = await execute('SELECT raw_input, period FROM draft WHERE id = 1'); const row = r.rows[0]; return row ? {raw_input:row[0].value, report_period:row[1].value} : null; },
  async saveDraft(draft) { if (!draft) return execute('DELETE FROM draft WHERE id = 1'); return execute('INSERT INTO draft (id, raw_input, period) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET raw_input=excluded.raw_input, period=excluded.period', [draft.raw_input, draft.report_period]); },
  async getSchema(){return {properties:[{name:'输出风格',type:'select',config:{options:styles.map(x=>({id:x,text:x}))}}]};},
  async addRecord({properties:p}) { await execute('INSERT INTO reports (id,title,item_count,style,period,body,raw_input,created_at) VALUES (?,?,?,?,?,?,?,?)',[crypto.randomUUID(),p['周报标题'].text,p['条目数'].number,p['输出风格'].select,p['周期'].text,p['正文'].text,p['原始记录'].text,p['创建时间'].date]); },
  async query(){const r=await execute('SELECT id,title,item_count,style,period,body,raw_input,created_at FROM reports ORDER BY created_at DESC'); return {results:r.rows.map(row=>{const v=row.map(x=>x.value??'');return {record_id:v[0],'周报标题':v[1],'条目数':v[2],'输出风格':v[3],'周期':v[4],'正文':v[5],'原始记录':v[6],'创建时间':v[7]};}),hasMore:false};},
  async deleteRecord({recordId}) {await execute('DELETE FROM reports WHERE id=?',[recordId]);}
}};
await import('./original.js');
