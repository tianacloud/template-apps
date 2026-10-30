import {createTianaFetch} from '@tianacloud/serverless';
import {preview,clone} from './ui.js';
let transport;
async function sql(statement,values=[]){
 if(!transport){const auth=window.tiana?.auth;if(typeof auth?.getAccessToken!=='function')throw Error('账号连接未就绪，请正常登录后重新打开');const connection=await window.tiana.connection();if(connection.sql_api!=='hrana-v3')throw Error('此应用需要支持参数化查询的数据库连接');transport={origin:connection.origin,fetch:createTianaFetch({origin:connection.origin,auth,requestBodyMode:'buffered'})};}
 const args=values.map(x=>x===null?{type:'null'}:Number.isInteger(x)?{type:'integer',value:String(x)}:{type:'text',value:String(x)});
 const response=await transport.fetch(transport.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args,want_rows:true}},{type:'close'}]})});
 if(!response.ok)throw Error('数据库响应未确认，请保留输入并检查保存状态');const body=await response.json();const first=body.results?.[0];if(first?.type!=='ok'||first.response?.type!=='execute')throw Error('数据库操作未确认，请检查记录');const result=first.response.result;
 return (result.rows||[]).map(row=>Object.fromEntries(result.cols.map((col,i)=>[col.name,row[i]?.type==='null'?null:row[i]?.value])));
}
export function documentStore(initial){
 let revision=0,previewValue=clone(initial),pending=false;
 const read=async()=>{if(preview)return{value:clone(previewValue),revision};const rows=await sql('SELECT content,version FROM app_documents WHERE id=?',['primary']);return rows.length?{value:JSON.parse(rows[0].content),revision:Number(rows[0].version)}:{value:clone(initial),revision:0}};
 return {
 async load(){const actual=await read();revision=actual.revision;return actual.value},
 async save(value){if(pending)throw Error('正在保存，请稍候');pending=true;const content=JSON.stringify(value),next=revision+1;try{
 if(preview){previewValue=clone(value);revision=next;return}
 let rows;try{rows=revision?await sql('UPDATE app_documents SET content=?,version=?,updated=? WHERE id=? AND version=? RETURNING version',[content,next,Date.now(),'primary',revision]):await sql('INSERT INTO app_documents(id,content,version,updated) VALUES(?,?,?,?) ON CONFLICT(id) DO NOTHING RETURNING version',['primary',content,next,Date.now()]);}
 catch(error){let actual;try{actual=await read()}catch{throw Error('保存结果未知。输入仍保留，请恢复连接后重新读取核对')}if(actual.revision===next&&JSON.stringify(actual.value)===content){revision=next;return}throw error}
 if(!rows.length)throw Error('另一标签页已保存新版本。请导出当前内容后重新读取，避免覆盖');revision=next;
 }finally{pending=false}},
 reset(){if(preview){previewValue=clone(initial);revision=0;return clone(initial)}throw Error('仅示例体验可恢复初始数据')}
 };
}
