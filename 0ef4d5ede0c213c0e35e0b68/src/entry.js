import {createTianaFetch} from '@tianacloud/serverless';
import html from './body.html';
import css from './style.css';
import hero from '../public/hero.png';
export async function mount(root, context) {
  try {
    if (!context.files?.put || !window.tiana?.auth?.getAccessToken) throw Error('数据或文件服务尚未就绪');
    const conn = await window.tiana.connection();
    if (conn.sql_api !== 'hrana-v3') throw Error('不支持当前数据库协议');
    const fetchSql = createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
    async function sql(query,args=[]) {
      const res=await fetchSql(conn.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:query,args:args.map(value=>({type:'text',value:String(value)})),want_rows:true}},{type:'close'}]})});
      if(!res.ok) throw Error('数据库操作结果未知，请重新打开检查');
      const result=(await res.json()).results?.[0];
      if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作失败或结果未知');
      return result.response.result;
    }
    await sql('SELECT 1');
    window.BonCloud={
      async get(key){const r=await sql('SELECT value FROM bon_state WHERE key=?',[key]);return r.rows?.[0]?.[0]?.value||''},
      async set(key,value){await sql('INSERT INTO bon_state(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,value]);return true},
      async savePhoto(data){if(!data)return '';const match=/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(data);if(!match)throw Error('照片格式不受支持');const bytes=Uint8Array.from(atob(match[1]),c=>c.charCodeAt(0));const blob=new Blob([bytes],{type:'image/jpeg'});const path='photos/'+crypto.randomUUID()+'.jpg';await context.files.put(path,blob);return path},
      bindImage(img,path){return context.files.bindImage(img,path)}
    };
    root.innerHTML=html.replace('__ICON__',hero);
    const style=document.createElement('style');style.textContent=css;root.append(style);
    await import('./store.js');await import('./engine.js');await import('./app.js');
    return () => {style.remove()};
  } catch(e) {root.textContent='无法连接数据或文件服务：'+e.message+'。请检查连接后重新打开。'}
}
