import { createTianaFetch } from '@tianacloud/serverless';
import html from './body.html';
import css from './style.css';
export async function mount(root, context) {
  try {
    if (!window.tiana?.auth?.getAccessToken || !context.files?.put) throw Error('数据或文件服务未就绪');
    const conn = await window.tiana.connection();
    if (conn.sql_api !== 'hrana-v3') throw Error('不支持当前数据库协议');
    const sqlFetch = createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
    async function sql(query,args=[]) {
      const response = await sqlFetch(conn.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:query,args:args.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
      if (!response.ok) throw Error('数据库操作结果未知');
      const result=(await response.json()).results?.[0];
      if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作失败或结果未知');
      return result.response.result;
    }
    const today=new Date(); const start=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
    await sql('INSERT OR IGNORE INTO quit_state(key,value) VALUES(?,?)',['quitFit_v1_c',JSON.stringify({quit:start,base:20,auto:true})]);
    const result=await sql('SELECT key,value FROM quit_state');
    const cache=Object.fromEntries((result.rows||[]).map(row=>[row[0].value,row[1].value]));
    let queue=Promise.resolve(), failed=false;
    window.quitStore={cache,save(key,value){
      cache[key]=value;
      queue=queue.then(async()=>{if(failed)return; await sql('INSERT INTO quit_state(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,value]);}).catch(()=>{failed=true;root.style.pointerEvents='none';const warning=document.createElement('div');warning.setAttribute('role','alert');warning.textContent='保存结果未确认，请重新打开应用检查数据。';warning.style.cssText='position:fixed;z-index:99999;top:0;background:#a32d2d;color:white;padding:12px;width:100%';document.body.append(warning)});
    },async savePhoto(data){
      const match=/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(data);if(!match)throw Error('照片格式不支持');
      const bytes=Uint8Array.from(atob(match[1]),c=>c.charCodeAt(0));const path='proofs/'+crypto.randomUUID()+'.jpg';
      const receipt=await context.files.put(path,new Blob([bytes],{type:'image/jpeg'}));if(!receipt?.completed)throw Error('上传结果未知');return path;
    }};
    root.innerHTML=html;const style=document.createElement('style');style.textContent=css;root.append(style);
    await import('./app.js');
    return ()=>{style.remove();delete window.quitStore};
  } catch(e){root.textContent='无法连接数据或文件服务，请检查连接后重新打开。';}
}
