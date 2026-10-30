import {createTianaFetch} from '@tianacloud/serverless';
import {run} from './game.js';
export async function mount(root, {files}) {
 const urls=[]; let style;
 root.textContent='正在读取游戏素材与设置…';
 try {
  if(!files || typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('应用服务尚未就绪');
  const connection=await window.tiana.connection();
  if(connection.sql_api !== 'hrana-v3') throw Error('数据库连接方式不受支持');
  const http=createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  async function sql(text,args=[]) {const response=await http(`${connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:text,args,want_rows:true}},{type:'close'}]})}); if(!response.ok) throw Error('数据库请求未确认'); const result=(await response.json()).results?.[0]; if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作未确认'); return result.response.result;}
  const saved=await sql('SELECT muted FROM game_settings WHERE id = 1');
  const initialMuted=saved.rows?.[0]?.[0]?.value === '1';
  const warning=document.createElement('div'); Object.assign(warning.style,{position:'fixed',top:'0',left:'0',zIndex:'99999',background:'#8b1d1d',color:'white',padding:'8px',display:'none'});
  let queue=Promise.resolve(); function saveMuted(value) {queue=queue.then(()=>sql('INSERT INTO game_settings (id, muted) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET muted=excluded.muted',[{type:'integer',value:value?'1':'0'}])).catch(()=>{warning.textContent='声音设置保存未确认，请重新打开应用检查。';warning.style.display='block';});}
  async function get(path) { const r=await files.get('template-assets/'+path); if(!r.ok) throw Error('素材读取失败：'+path); const u=URL.createObjectURL(await r.blob());urls.push(u);return u; }
  const names=Array.from({length:88},(_,i)=>`font-${String(i).padStart(2,'0')}.woff2`);
  const loaded=await Promise.all(names.map(async path=>{const r=await files.get('template-assets/'+path);if(!r.ok) throw Error('素材读取失败：'+path);return r.arrayBuffer();}));
  loaded.push(await get('backdrop.jpg'));
  root.textContent=''; await run(root,initialMuted,saveMuted,loaded); document.body.append(warning);
  return ()=>{urls.forEach(URL.revokeObjectURL);warning.remove();};
 } catch(error) {urls.forEach(URL.revokeObjectURL);root.textContent='游戏无法启动：'+error.message;throw error;}
}
