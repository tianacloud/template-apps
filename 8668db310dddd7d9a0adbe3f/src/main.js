import {createTianaFetch} from '@tianacloud/serverless';
import page from './page.html'; import css from './style.css';
const style=document.createElement('style');style.textContent=css;document.head.append(style);document.querySelector('#app').innerHTML=page;
const conn=await window.tiana.connection();
if(conn.sql_api!=='hrana-v3'||typeof window.tiana.auth?.getAccessToken!=='function') throw Error('数据库连接不可用');
const transport=createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
async function sql(q,vals=[]){const res=await transport(`${conn.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:q,args:vals.map(value=>({type:'text',value:String(value)})),want_rows:true}},{type:'close'}]})}); if(!res.ok) throw Error('数据库请求失败，写入结果未知，请刷新核对'); const data=await res.json();const x=data.results?.[0];if(x?.type!=='ok'||x.response?.type!=='execute')throw Error('数据库操作失败'); const result=x.response.result; return result.rows.map(row=>Object.fromEntries(result.cols.map((c,i)=>[c.name,row[i]?.value??null])));}
const fields={builds:{'构建结果':['成功','失败'],'下载状态':['待下载','已下载','已废弃']},tasks:{'环境类型':['测试','UAT','预生产','生产'],'交付通道':['直连','堡垒机跳板','离线拷贝'],'升级阶段':['待下载','已下载','已上传','升级中','验证通过','已回滚']}};
const flatten=p=>Object.fromEntries(Object.entries(p).map(([k,v])=>[k,v.text??v.date??v.select??v.url??'']));
async function all(kind){return (await sql('SELECT id,data FROM records WHERE kind = ? ORDER BY created_at DESC',[kind])).map(x=>({...JSON.parse(x.data),_id:x.id}));}
window.__SMART_PAGE__={database:{
 async getSchema({databaseId}){return {properties:Object.entries(fields[databaseId]).map(([name,choices])=>({name,type:'select',config:{options:choices.map(text=>({text,id:text}))}}))};},
 async query({databaseId,startCursor,pageSize}){let a=await all(databaseId);const key=databaseId==='builds'?'构建日期':'计划日期';a.sort((a,b)=>(b[key]||'').localeCompare(a[key]||''));const off=Number(startCursor||0), end=off+pageSize;return {results:a.slice(off,end),hasMore:end<a.length,nextCursor:String(end)};},
 async addRecord({databaseId,properties}){await sql('INSERT INTO records(id,kind,data) VALUES(?,?,?)',[crypto.randomUUID(),databaseId,JSON.stringify(flatten(properties))]);},
 async updateRecord({databaseId,recordId,properties}){await sql('UPDATE records SET data=json_patch(data,?) WHERE kind=? AND id=?',[JSON.stringify(flatten(properties)),databaseId,recordId]);},
 onUpdated(callback){setInterval(()=>{if(!document.hidden) callback({databaseIds:["builds","tasks"]});},5000);},
 async aggregate({databaseId,aggregates}){const rows=await all(databaseId);return {results:aggregates.map(a=>({name:a.name,value:a.groupBy?Object.entries(rows.reduce((m,r)=>(m[r[a.groupBy]||'']=(m[r[a.groupBy]||'']||0)+1,m),{})).map(([key,count])=>({key,count})):a.filter?rows.filter(r=>r['构建日期']===a.filter.property.date.equals).length:rows.length}))};}
}};
await import('./original.js');
