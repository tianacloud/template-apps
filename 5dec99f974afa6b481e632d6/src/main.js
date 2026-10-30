import { inlineImages, externalImages } from './asset-manifest.js';
import { createTianaFetch } from '@tianacloud/serverless';

export async function mount(root, { files }) {
const app = root;
app.id = 'app';
try {
 const urls = { ...inlineImages };
 await Promise.all(externalImages.map(async name => { const response = await files.get('template-assets/art/' + name); if (!response.ok) throw Error('素材读取失败'); urls[name] = URL.createObjectURL(await response.blob()); }));
 window.__swordAssets = urls;
app.innerHTML = '<canvas id="game"></canvas><div id="ui-root"></div><div id="sync-status" role="status"></div>';
const style = document.createElement('link');
style.rel = 'stylesheet'; style.href = new URL('./style.css', import.meta.url).href; document.head.appendChild(style);
const conn = await window.tiana.connection();
if (conn.sql_api !== 'hrana-v3' || typeof window.tiana.auth?.getAccessToken !== 'function') throw new Error('数据库连接不可用');
const client = createTianaFetch({origin:conn.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
async function sql(statement, args=[]) {
 const response=await client(`${conn.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:args.map(value=>({type:'text',value:String(value)})),want_rows:true}},{type:'close'}]})});
 if(!response.ok) throw Error('数据库通信失败'); const body=await response.json(); const r=body.results?.[0];
 if(r?.type!=='ok'||r.response?.type!=='execute') throw Error('数据库操作失败');
 return r.response.result.rows.map(row=>row.map(cell=>cell.value ?? null));
}
const cache=Object.fromEntries(await sql('SELECT key, value FROM sword_state'));
const dirty=new Map(); let flushing=false, timer;
const status=document.getElementById('sync-status');
async function flush(){
 if(flushing)return; flushing=true;
 try {for(const [key,value] of dirty){
  try {
   if(value===null) await sql('DELETE FROM sword_state WHERE key=?',[key]);
   else await sql('INSERT INTO sword_state(key,value,updated_at) VALUES(?,?,unixepoch()) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at',[key,value]);
  } catch(e) {
   const rows=await sql('SELECT value FROM sword_state WHERE key=?',[key]);
   if((rows[0]?.[0] ?? null)!==value) throw e;
  }
  if(dirty.get(key)===value) dirty.delete(key);
 } status.textContent='';} catch(e){status.textContent='存档同步失败，请检查网络；点击此处重试'; status.onclick=()=>{status.textContent='';flush()};}
 finally{flushing=false;if(dirty.size&&!status.textContent) timer=setTimeout(flush,300);}
}
window.__swordStore={get:k=>cache[k]??null,set(k,v){cache[k]=String(v);dirty.set(k,String(v));clearTimeout(timer);timer=setTimeout(flush,300)},remove(k){delete cache[k];dirty.set(k,null);clearTimeout(timer);timer=setTimeout(flush,300)}};
window.__swordRank={async submit(key,rec){await sql('INSERT INTO sword_rank(category,player,record,updated_at) VALUES(?,?,?,unixepoch()) ON CONFLICT(category,player) DO UPDATE SET record=excluded.record,updated_at=excluded.updated_at',[key,'player',JSON.stringify(rec)])},async list(key){return (await sql('SELECT record FROM sword_rank WHERE category=?',[key])).map(([v])=>JSON.parse(v)).sort((a,b)=>(b.realm-a.realm)||(b.exp-a.exp)||(b.t-a.t));}};
window.__assetBase=new URL('../',import.meta.url).href;
const game=document.createElement('script'); game.src=new URL('./game.js',import.meta.url).href; document.body.appendChild(game);

} catch (error) { app.textContent = '素材或存档加载失败，请检查网络后重新打开。'; console.error(error); }
}
