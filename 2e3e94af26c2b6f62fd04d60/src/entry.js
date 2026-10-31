import { createTianaFetch } from '@tianacloud/serverless';
import body from './body.html';
import css from './style.css';
import assets from './assets.json';
import external from './external.json';
import { start } from './app.js';

export async function mount(root, context) {
  root.textContent = '正在读取学习进度和素材…';
  let connection, send;
  async function sql(statement, values = []) {
    if (!connection) {
      if (typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('登录未就绪');
      connection = await window.tiana.connection();
      if (connection.sql_api !== 'hrana-v3') throw Error('数据库协议不支持');
      send = createTianaFetch({origin:connection.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
    }
    const response = await send(connection.origin + '/v3/pipeline', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库请求结果未知');
    const result = (await response.json()).results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作结果未知');
    return result.response.result.rows;
  }
  try {
    const rows = await sql('SELECT document FROM pet_progress WHERE id=1');
    if (rows[0]?.[0]?.value) {
      const data = JSON.parse(rows[0][0].value);
      if (!data || typeof data.profiles !== 'object' || !Object.keys(data.profiles).length) throw Error('进度数据格式无效');
    }
    const wordResponse = await context.files.get('template-assets/media/words.json');
    if (!wordResponse.ok) throw Error('词库读取失败');
    const words = await wordResponse.json();
    const resolved = structuredClone(assets);
    await Promise.all(external.map(async item => {
      const url = await context.files.getUrl('template-assets/' + item.path);
      if (item.key === 'bg') resolved.bg[item.index] = url; else resolved[item.key] = url;
    }));
    let queue = Promise.resolve(), failed = false;
    const warning = document.createElement('div');
    warning.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#9b2020;color:white;text-align:center;padding:12px';
    warning.hidden = true;
    const persist = value => {
      queue = queue.then(async () => {
        if (failed) return;
        await sql('INSERT INTO pet_progress (id,document) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document',[value]);
      }).catch(() => { failed = true; warning.textContent = '进度保存结果未确认，请检查网络并刷新核对。'; warning.hidden = false; });
    };
    const style = document.createElement('style'); style.textContent = css; document.head.append(style);
    root.innerHTML = body; root.append(warning);
    start(resolved, words, rows[0]?.[0]?.value ?? null, persist);
    return () => { style.remove(); root.replaceChildren(); };
  } catch (error) {
    root.textContent = '无法读取学习进度或素材，请检查登录和网络后重新打开。';
    console.error(error);
  }
}
