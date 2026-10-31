import {createTianaFetch} from '@tianacloud/serverless';
export async function initializeStore(){
 const auth=window.tiana?.auth;
 if(typeof auth?.getAccessToken!=='function'||typeof window.tiana?.connection!=='function') throw Error('数据库连接尚未就绪');
 const conn=await window.tiana.connection();
 if(conn.sql_api!=='hrana-v3') throw Error('当前数据库协议暂不支持');
 const request=createTianaFetch({origin:conn.origin,auth,requestBodyMode:'buffered'});
 async function execute(sql,args=[]){
  const response=await request(`${conn.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if(!response.ok) throw Error('数据库请求结果未知');
  const body=await response.json(),statement=body.results?.[0];
  if(statement?.type!=='ok'||statement.response?.type!=='execute') throw Error('数据库操作未确认');
  return statement.response.result;
 }
 const memory=new Map();
 const result=await execute('SELECT key, value FROM milestone_store');
 for(const row of result.rows||[]) memory.set(row[0].value,row[1].value);
 let queue=Promise.resolve(),failed=false;
 window.milestoneStore={getItem(key){return memory.has(key)?memory.get(key):null},setItem(key,value){
  if(failed)return; value=String(value);memory.set(key,value);
  queue=queue.then(()=>{if(failed)return;return execute('INSERT INTO milestone_store (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[{type:'text',value:key},{type:'text',value}])}).catch(()=>{failed=true;const notice=document.createElement('div');notice.setAttribute('role','alert');notice.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#0b1120ee;color:white;display:grid;place-items:center;padding:2rem;font:16px sans-serif';notice.textContent='保存结果未确认，请重新打开应用核对数据。';document.body.append(notice)});
 },removeItem(key){memory.delete(key)}};
}
