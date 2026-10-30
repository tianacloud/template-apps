import { createTianaFetch } from '@tianacloud/serverless';
let client;
async function getClient(){
 if (!client) client=(async()=>{
  const auth=window.tiana?.auth;
  if(typeof auth?.getAccessToken !== 'function') throw Error('账号连接未就绪');
  const connection=await window.tiana.connection();
  if(connection.sql_api !== 'hrana-v3') throw Error('数据库协议不支持');
  return {origin:connection.origin,fetch:createTianaFetch({origin:connection.origin,auth,requestBodyMode:'buffered'})};
 })().catch(e=>{client=null;throw e});
 return client;
}
export async function execute(sql,values=[]){
 const c=await getClient();
 const response=await c.fetch(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
 if(!response.ok) throw Error('数据库响应不可用');
 const body=await response.json(), result=body.results?.[0];
 if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作未确认');
 return result.response.result;
}
