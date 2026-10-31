import {createTianaFetch} from '@tianacloud/serverless';
export async function prepare(context){
 const auth=window.tiana?.auth;
 if(typeof auth?.getAccessToken!=='function'||!context?.files?.get) throw Error('账号或文件服务未就绪');
 const conn=await window.tiana.connection(); if(conn.sql_api!=='hrana-v3') throw Error('数据库协议不支持');
 const send=createTianaFetch({origin:conn.origin,auth,requestBodyMode:'buffered'});
 async function sql(statement,args=[]){
  const response=await send(conn.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:args.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
  if(!response.ok)throw Error('数据库响应不可用，写入结果可能未知');
  const item=(await response.json()).results?.[0];if(item?.type!=='ok'||item.response?.type!=='execute')throw Error('数据库操作失败或结果未知');return item.response.result;
 }
 const [bank,result]=await Promise.all([context.files.get('template-assets/bank.json'),sql('SELECT key,value FROM exam_settings')]);
 if(!bank.ok)throw Error('内置题库读取失败'); window.QUESTION_BANK=await bank.json();
 const values={};for(const row of result.rows||[]) values[row[0].value]=row[1].value;
 let queue=Promise.resolve(),failed=false,pending=0;
 const warning=document.createElement('div');warning.hidden=true;warning.style.cssText='position:fixed;z-index:99999;top:0;left:0;right:0;padding:12px;background:#9b2020;color:white;text-align:center';document.body.append(warning);
 function enqueue(statement,args){pending++;queue=queue.then(async()=>{if(failed)return;await sql(statement,args)}).catch(()=>{failed=true;warning.hidden=false;warning.textContent='保存失败或结果未知，请保留当前页面并重新打开核对数据。';}).finally(()=>pending--);}
 window.addEventListener('beforeunload',e=>{if(failed||pending){e.preventDefault();e.returnValue='';}});
 window.examStore={getItem:key=>values[key]??null,setItem(key,value){values[key]=String(value);enqueue('INSERT INTO exam_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,String(value)]);},removeItem(key){delete values[key];enqueue('DELETE FROM exam_settings WHERE key=?',[key]);}};
}
