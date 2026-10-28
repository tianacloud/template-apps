import { createTianaFetch } from '@tianacloud/serverless';
import body from './body.html?raw';
import './style.css';
const link=document.createElement('link'); link.rel='stylesheet'; link.href=new URL('./app.css',import.meta.url).href; document.head.append(link);
document.getElementById('app').innerHTML=body;
async function setup(){
  if(typeof window.tiana?.auth?.getAccessToken!=='function') throw Error('账号授权未就绪');
  const c=await window.tiana.connection();
  if(c.sql_api!=='hrana-v3') throw Error('数据库协议不支持安全参数绑定: '+c.sql_api);
  const fetchSql=createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  async function execute(sql,args){
    const r=await fetchSql(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:args.map(v=>({type:'text',value:String(v)})),want_rows:true}},{type:'close'}]})});
    if(!r.ok) throw Error('数据库请求失败，写入结果可能未知，请刷新核对');
    const result=(await r.json()).results?.[0];
    if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库执行失败或结果未知');
    return result.response.result;
  }
  window.tianaCloudDb={from(){return {
    async upsert(row){try {await execute('INSERT INTO sync_store(sync_key,payload,rev,updated_at) VALUES(?,?,?,?) ON CONFLICT(sync_key) DO UPDATE SET payload=excluded.payload,rev=excluded.rev,updated_at=excluded.updated_at',[row.sync_key,JSON.stringify(row.payload),row.rev,row.updated_at]);return {error:null};}catch(error){return {error};}},
    select(){return {eq(_column,key){return {async maybeSingle(){try{const r=await execute('SELECT payload FROM sync_store WHERE sync_key=?',[key]);const cell=r.rows?.[0]?.[0];return {data:cell?.value?{payload:JSON.parse(cell.value)}:null,error:null};}catch(error){return {data:null,error};}}};}};}
  };}};
}
try { await setup(); } catch(e) { console.error('同步初始化失败',e.message); }
const script=document.createElement('script');script.src=new URL('../app-original.js',import.meta.url).href;document.body.append(script);
