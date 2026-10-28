import { createTianaFetch } from '@tianacloud/serverless';
import { style, body } from './layout.js';
import start from './original.js';
const css=document.createElement('style'); css.textContent=style; document.head.append(css); document.body.innerHTML=body;
async function main(){
 const conn=await window.tiana.connection();
 if(conn.sql_api !== 'hrana-v3') throw Error('不支持的数据库协议');
 const send=createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
 async function sql(query, values=[]){
  const args=values.map(v=>v===null?{type:'null'}:{type:'text',value:String(v)});
  const resp=await send(`${conn.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:query,args,want_rows:true}},{type:'close'}]})});
  if(!resp.ok) throw Error('数据库响应不可用，请核对后再操作');
  const payload=await resp.json(), result=payload.results?.[0];
  if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作失败');
  return result.response.result.rows.map(row=>row.map(cell=>cell.value));
 }
 const unpack=properties=>Object.fromEntries(Object.entries(properties).map(([k,v])=>[k,Object.values(v)[0]]));
 window.__SMART_PAGE__={database:{
  async query({databaseId}){const rows=await sql('SELECT id,data FROM study_records WHERE kind=? ORDER BY rowid',[databaseId]); return {results:rows.map(([id,data])=>({...JSON.parse(data),_id:id})),hasMore:false};},
  async addRecord({databaseId,properties}){await sql('INSERT INTO study_records(id,kind,data) VALUES(?,?,?)',[crypto.randomUUID(),databaseId,JSON.stringify(unpack(properties))]);},
  async updateRecord({databaseId,recordId,properties}){const rows=await sql('SELECT data FROM study_records WHERE id=? AND kind=?',[recordId,databaseId]); if(!rows.length) throw Error('记录不存在'); const data={...JSON.parse(rows[0][0]),...unpack(properties)}; await sql('UPDATE study_records SET data=? WHERE id=? AND kind=?',[JSON.stringify(data),recordId,databaseId]);},
  async deleteRecord({databaseId,recordId}){await sql('DELETE FROM study_records WHERE id=? AND kind=?',[recordId,databaseId]);},
  async getSchema({databaseId}){const opts=xs=>xs.map(x=>({id:x,text:x}));return {properties:databaseId==='goals'?[{name:'状态',config:{options:opts(['进行中','已完成','已暂停'])}}]:[{name:'科目',config:{options:opts(['经济基础知识','工商管理'])}},{name:'状态',config:{options:opts(['未学','已学'])}}]};}
 }};
 start();
}
main().catch(e=>{document.body.innerHTML='应用连接失败，请刷新重试。'; console.error(e)});
