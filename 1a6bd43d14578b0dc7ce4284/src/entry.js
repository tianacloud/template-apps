import { createTianaFetch } from '@tianacloud/serverless';
import body from './body.html';
import css from './style.css';
import images from 'inline-images';
import './data.js';
import { start } from './app.js';

export async function mount(root, context) {
  root.textContent = '正在读取学习进度…';
  let channel;
  async function sql(statement, values = []) {
    if (!channel) {
      if (typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('账号连接未就绪');
      const connection = await window.tiana.connection();
      if (connection.sql_api !== 'hrana-v3') throw Error('不支持的数据库协议');
      channel = {origin: connection.origin, send: createTianaFetch({origin: connection.origin, auth: window.tiana.auth, requestBodyMode: 'buffered'})};
    }
    const response = await channel.send(channel.origin + '/v3/pipeline', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库响应未确认');
    const result = (await response.json()).results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作未确认');
    return result.response.result.rows;
  }
  try {
    if (!context.files?.bindImage) throw Error('素材服务未就绪');
    const rows = await sql('SELECT document FROM driving_progress WHERE id=1');
    const data = rows[0]?.[0]?.value ? JSON.parse(rows[0][0].value) : {};
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error('进度格式无效');
    const warning = document.createElement('div');
    warning.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#9b2020;color:white;text-align:center;padding:12px';
    warning.hidden = true;
    let queue = Promise.resolve(), failed = false;
    function persist() {
      const document = JSON.stringify(data);
      queue = queue.then(async () => {
        if (failed) return;
        try { await sql('INSERT INTO driving_progress (id,document) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document', [document]); }
        catch (e) {
          try { const actual = await sql('SELECT document FROM driving_progress WHERE id=1'); if (actual[0]?.[0]?.value === document) return; } catch (_) {}
          throw e;
        }
      }).catch(() => { failed = true; warning.textContent = '进度保存结果未确认，请检查网络并重新打开核对。'; warning.hidden = false; });
    }
    const store = {getItem:key => data[key] ?? null, setItem(key,value) {data[key]=String(value);persist();}, removeItem(key) {delete data[key];persist();}};
    const style = document.createElement('style'); style.textContent = css; document.head.append(style);
    root.innerHTML = body; root.append(warning);
    start(store, images, context.files);
    return () => { style.remove(); root.replaceChildren(); };
  } catch (error) {
    root.textContent = '无法读取学习进度或素材，请检查登录和网络后重新打开。';
    console.error(error);
  }
}
