import {createTianaFetch} from '@tianacloud/serverless';
import styles from './styles.css';

export async function mount(container, {files}) {
  const urls = [];
  container.textContent = '正在读取游戏数据和素材…';
  try {
    if (!files || typeof window.tiana?.auth?.getAccessToken !== 'function') throw new Error('应用服务尚未就绪');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw new Error('不支持的数据库连接方式');
    const sqlFetch = createTianaFetch({origin: connection.origin, auth: window.tiana.auth, requestBodyMode: 'buffered'});
    async function execute(sql, args = []) {
      const response = await sqlFetch(`${connection.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
      if (!response.ok) throw new Error('数据库请求失败');
      const result = (await response.json()).results?.[0];
      if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作失败');
      return result.response.result;
    }
    const result = await execute('SELECT data FROM basketball_save WHERE id = 1');
    let current = result.rows?.[0]?.[0]?.value ?? null;
    let queue = Promise.resolve();
    const warning = document.createElement('div');
    Object.assign(warning.style,{position:'fixed',top:'0',left:'0',zIndex:'99999',background:'#8b1d1d',color:'white',padding:'12px',display:'none'});
    document.body.append(warning);
    globalThis.__basketballSave = {read:()=>current, write(value) { current=value; queue=queue.then(()=>execute('INSERT INTO basketball_save (id,data) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',[{type:'text',value}])).catch(()=>{warning.textContent='保存失败，请检查连接后重新打开应用。'; warning.style.display='block';}); }};
    async function asset(path) {const response=await files.get(`template-assets/${path}`); if (!response.ok) throw new Error(`素材读取失败：${path}`); const url=URL.createObjectURL(await response.blob()); urls.push(url); return url;}
    const [sprites,...fonts] = await Promise.all(['sprites.png','font-0.ttf','font-1.woff2','font-2.woff2'].map(asset));
    globalThis.__basketballAssets={sprites};
    const style=document.createElement('style'); style.textContent=styles.replace(/__BASKETBALL_FONT_(\d)__/g,(_,n)=>fonts[Number(n)]); document.head.append(style);
    container.innerHTML='<div id="root"></div>';
    await import('./game.js');
    return ()=>{style.remove(); warning.remove(); urls.forEach(URL.revokeObjectURL);};
  } catch(error) {container.textContent=`游戏无法启动：${error.message}`; urls.forEach(URL.revokeObjectURL); throw error;}
}
