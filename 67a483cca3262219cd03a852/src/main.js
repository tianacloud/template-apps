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
  // The installation's database is the source of truth. A revision guards against
  // silently overwriting edits from another open session.
  await execute("INSERT OR IGNORE INTO sync_store(sync_key,payload,rev,updated_at) VALUES(?,?,?,?)", ['__app_state_v1__','{}','0',new Date().toISOString()]);
  const initial = await execute('SELECT payload,rev FROM sync_store WHERE sync_key=?', ['__app_state_v1__']);
  const row = initial.rows?.[0];
  if (!row) throw Error('无法读取课程数据');
  const values = JSON.parse(row[0].value);
  let revision = Number(row[1].value), timer, writing = false, dirty = false, failed = false;
  const banner = document.getElementById('sync-text');
  banner.setAttribute('role','status'); banner.textContent = '云端 · 已读取';
  window.addEventListener('beforeunload', e => { if (dirty || writing || failed) { e.preventDefault(); e.returnValue=''; } });
  function fail(message) {
    failed = true; banner.textContent = message;
    const blocker=document.createElement('div');
    blocker.style.cssText='position:fixed;inset:0;z-index:10000;background:#fffE;display:grid;place-items:center;padding:30px;text-align:center';
    const panel=document.createElement('div');
    const explanation=document.createElement('p'); explanation.textContent=message+'。本次更改可能尚未保存；可先导出备份，再刷新页面读取云端数据。';
    const backup=document.createElement('button'); backup.textContent='导出当前备份'; backup.onclick=()=>window.exportData?.();
    panel.append(explanation,backup); blocker.append(panel); document.body.append(blocker);
  }
  async function flush() {
    if (writing || !dirty || failed) return;
    writing=true; dirty=false;
    const payload=JSON.stringify(values);
    try {
      const result=await execute('UPDATE sync_store SET payload=?,rev=rev+1,updated_at=? WHERE sync_key=? AND rev=? RETURNING rev', [payload,new Date().toISOString(),'__app_state_v1__',revision]);
      if (!result.rows?.length) throw Error('数据已在其他会话更改');
      revision=Number(result.rows[0][0].value);
      banner.textContent=dirty?'正在保存…':'已保存到云端';
      writing=false;
      if(dirty) await flush();
    } catch(e) { writing=false; fail('云端保存失败：'+e.message); }
  }
  window.classStorage={getItem:k=>Object.hasOwn(values,k)?values[k]:null,
    setItem(k,v){values[k]=String(v);dirty=true;banner.textContent='正在保存…';clearTimeout(timer);timer=setTimeout(flush,300);},
    removeItem(k){delete values[k];dirty=true;clearTimeout(timer);timer=setTimeout(flush,300);}};
  window.tianaCloudDb={from(){return {
    async upsert(row){try {await execute('INSERT INTO sync_store(sync_key,payload,rev,updated_at) VALUES(?,?,?,?) ON CONFLICT(sync_key) DO UPDATE SET payload=excluded.payload,rev=excluded.rev,updated_at=excluded.updated_at',[row.sync_key,JSON.stringify(row.payload),row.rev,row.updated_at]);return {error:null};}catch(error){return {error};}},
    select(){return {eq(_column,key){return {async maybeSingle(){try{const r=await execute('SELECT payload FROM sync_store WHERE sync_key=?',[key]);const cell=r.rows?.[0]?.[0];return {data:cell?.value?{payload:JSON.parse(cell.value)}:null,error:null};}catch(error){return {data:null,error};}}};}};}
  };}};
}
try { await setup(); } catch(e) { document.getElementById('app').textContent='无法连接课程数据，请检查网络后刷新重试：'+e.message; throw e; }
const script=document.createElement('script');script.src=new URL('../app-original.js',import.meta.url).href;document.body.append(script);
