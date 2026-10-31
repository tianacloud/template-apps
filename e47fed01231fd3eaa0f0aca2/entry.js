import {createTianaFetch} from '@tianacloud/serverless';
import smallImages from './small-images.json';
import externalImages from './external-images.json';

export async function mount(root, context) {
  const status = document.createElement('div');
  status.style.cssText = 'position:fixed;z-index:99999;top:0;left:0;right:0;background:#542020;color:white;padding:12px;text-align:center';
  status.hidden = true; root.append(status);
  const fail = () => { status.textContent = '存档结果未确认，请检查网络并刷新核对；当前进度可能未保存。'; status.hidden = false; };
  let connection, request;
  async function sql(statement, values = []) {
    if (!connection) {
      if (typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('账号连接未就绪');
      connection = await window.tiana.connection();
      if (connection.sql_api !== 'hrana-v3') throw Error('数据库协议不支持');
      request = createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
    }
    const response = await request(connection.origin + '/v3/pipeline', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库请求结果未确认');
    const result = (await response.json()).results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作结果未确认');
    return result.response.result.rows;
  }
  const objectUrls = [];
  try {
    const rows = await sql('SELECT document FROM game_save WHERE id = 1');
    const storage = {current:rows[0]?.[0]?.value ?? null};
    let queue = Promise.resolve(), failed = false;
    const write = (statement, values) => {
      const operation = queue.then(() => { if (failed) throw Error('存档结果未知'); return sql(statement, values); });
      queue = operation.catch(() => { failed = true; fail(); });
      return operation;
    };
    storage.save = value => { storage.current = value; return write('INSERT INTO game_save (id,document) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document',[value]); };
    storage.clear = () => { storage.current = null; return write('DELETE FROM game_save WHERE id=1',[]); };
    storage.refresh = async () => { await queue; if (failed) throw Error('存档结果未知'); const rows = await sql('SELECT document FROM game_save WHERE id=1'); storage.current = rows[0]?.[0]?.value ?? null; };
    window.gameStorage = storage;
    window.gameAssets = {...smallImages};
    const assets = await Promise.allSettled(externalImages.map(async name => { const response = await context.files.get('template-assets/images/' + name); const url = URL.createObjectURL(await response.blob()); objectUrls.push(url); window.gameAssets[name] = url; }));
    if (assets.some(result => result.status === 'rejected')) throw Error('素材读取失败');
  } catch (error) { objectUrls.forEach(URL.revokeObjectURL); status.hidden = false; status.textContent = '无法读取存档或游戏素材，请检查登录和网络后重新打开。'; return; }
  const style=document.createElement('style'); style.textContent='html,body{margin:0;padding:0;background:#080808;height:100%}body{min-height:100vh;overflow:hidden;-webkit-tap-highlight-color:transparent}#game-container{position:fixed;inset:0;width:100vw;height:100vh}canvas{display:block;touch-action:none}'; document.head.append(style);
  const container=document.createElement('div'); container.id='game-container'; root.append(container);
  const load = src => new Promise((resolve,reject) => {const script=document.createElement('script');script.src=new URL(src,import.meta.url).href;script.onload=resolve;script.onerror=reject;root.append(script);});
  try { await load('phaser.min.js'); await load('game.js'); } catch { status.hidden=false;status.textContent='游戏加载失败，请重新打开。'; }
  return () => { window.GUXUN?.destroy(true); objectUrls.forEach(URL.revokeObjectURL); style.remove();root.replaceChildren(); };
}
