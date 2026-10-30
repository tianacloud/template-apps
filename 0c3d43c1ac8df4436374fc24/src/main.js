import { createTianaFetch } from '@tianacloud/serverless';
import body from './body.html';
import './style.css';
export async function mount(root, {files}) {
const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('app.css',import.meta.url);document.head.append(style);
root.innerHTML=body;
const notice=document.createElement('div');
notice.style.cssText='position:fixed;z-index:99999;top:0;left:0;right:0;padding:10px;background:#fff0d6;color:#512b00;text-align:center';
notice.textContent='正在读取生词本和设置…';document.body.appendChild(notice);
try {
 const dictionary=await files.get('template-assets/dictionary.tsv');
 if(!dictionary.ok) throw Error('词库读取失败');
 window.learnerDictionary=await dictionary.text();
 if(!window.tiana?.auth?.getAccessToken || !window.tiana?.connection) throw Error('账号认证尚未就绪');
 const connection=await window.tiana.connection();
 if(connection.sql_api!=='hrana-v3') throw Error('数据库协议不受支持');
 const send=createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
 async function execute(sql,args=[]){
  const response=await send(connection.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
  if(!response.ok) throw Error('数据库请求结果未知');
  const result=(await response.json()).results?.[0];
  if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作未确认');
  return result.response.result;
 }
 const result=await execute('SELECT key, value FROM learner_settings');
 const data=Object.fromEntries(result.rows.map(row=>[row[0].value,row[1].value]));
 let busy=false, failed=false;
 window.learnerStorage={getItem:key=>data[key]??null,async setItem(key,value){
  if(busy||failed) throw Error('保存尚未完成或结果未知');
  busy=true;notice.textContent='正在保存…';notice.hidden=false;
  try {await execute('INSERT INTO learner_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[{type:'text',value:key},{type:'text',value}]);data[key]=value;notice.hidden=true;}
  catch(e){failed=true;notice.textContent='保存结果未确认，请刷新页面读取数据库后再操作。';throw e;}
  finally{busy=false;}
 }};
 notice.hidden=true;
 await import('./engine.js');
} catch(e) {notice.textContent='无法读取生词本或设置，请检查登录和数据库连接后刷新。';}

}
