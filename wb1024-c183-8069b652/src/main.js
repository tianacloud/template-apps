import {createTianaFetch} from '@tianacloud/serverless';
import css from './style.css';
import body from './body.html';
const style=document.createElement('style'); style.textContent=css; document.head.appendChild(style); document.getElementById('app').innerHTML=body;
const stages=['连载中','待完本体检','已完本体检','已拆书蒸馏','经验已吸纳','待榨干判定','已移库归档'];
const platforms=['起点中文网','番茄小说','其他平台'];
let client;
async function sql(query, values=[]) {
 if(!client){const c=await window.tiana.connection(); if(c.sql_api!=='hrana-v3'||typeof window.tiana.auth?.getAccessToken!=='function') throw Error('数据库连接不可用'); client={c,fetch:createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'})};}
 const args=values.map(v=>v===null?{type:'null'}:typeof v==='number'?{type:'integer',value:String(v)}:{type:'text',value:String(v)});
 const res=await client.fetch(`${client.c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:query,args,want_rows:true}},{type:'close'}]})});
 if(!res.ok) throw Error('数据库请求失败，写入结果可能未知，请刷新核对'); const data=await res.json(), first=data.results?.[0]; if(first?.type!=='ok'||first.response?.type!=='execute') throw Error('数据库操作失败');
 const result=first.response.result; return (result.rows||[]).map(row=>Object.fromEntries(result.cols.map((col,i)=>[col.name,row[i]?.type==='null'?null:row[i]?.value])));
}
const props=p=>Object.fromEntries(Object.entries(p).map(([k,v])=>[k,Object.values(v)[0]]));
window.bookDatabase={
 async getSchema(){return {properties:[{name:'平台',config:{options:platforms.map(x=>({id:x,text:x}))}},{name:'链路状态',config:{options:stages.map(x=>({id:x,text:x}))}}]};},
 async query(){const rows=await sql('SELECT * FROM books ORDER BY start DESC'); return {results:rows.map(r=>({_id:r.id,'作品名称':r.name,'平台':r.platform,'开书日期':r.start,'目标字数':r.target,'当前字数':r.current,'日均更新':r.daily,'链路状态':r.stage,'备注':r.note}))};},
 async addRecord({properties}){const p=props(properties); await sql('INSERT INTO books (id,name,platform,start,target,current,daily,stage,note) VALUES (?,?,?,?,?,?,?,?,?)',[crypto.randomUUID(),p['作品名称'],p['平台'],p['开书日期']||null,p['目标字数'],p['当前字数'],p['日均更新'],p['链路状态'],p['备注']]);},
 async updateRecord({recordId,properties}){const p=props(properties); await sql('UPDATE books SET current=?, stage=?, note=? WHERE id=?',[p['当前字数'],p['链路状态'],p['备注'],recordId]);},
 async deleteRecord({recordId}){await sql('DELETE FROM books WHERE id=?',[recordId]);}
};
await import('./ui.js');
