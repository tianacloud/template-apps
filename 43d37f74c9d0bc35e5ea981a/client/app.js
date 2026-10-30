import { createTianaFetch } from '@tianacloud/serverless';
import body from './body.html';


export async function mount(root, { files }) {
  document.title = '弹幕幸存者';
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('./styles.css', import.meta.url).href; document.head.appendChild(css);
  root.textContent = '正在加载游戏数据…';
  try {
    const auth = window.tiana?.auth;
    if (!auth?.getAccessToken || !window.tiana?.connection) throw new Error('数据库认证尚未就绪');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw new Error('不支持当前数据库协议');
    const http = createTianaFetch({ origin: connection.origin, auth, requestBodyMode: 'buffered' });
    async function execute(sql, values = []) {
      const response = await http(`${connection.origin}/v3/pipeline`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql, args: values.map(value => ({type: 'text', value})), want_rows: true } }, {type: 'close'}] }),
      });
      if (!response.ok) throw new Error('数据库请求失败，保存结果需要核对');
      const result = (await response.json()).results?.[0];
      if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作失败或结果未知');
      return result.response.result;
    }
    const result = await execute('SELECT key, value FROM game_preferences');
    const values = new Map((result.rows || []).map(row => [row[0].value, row[1].value]));
    let queue = Promise.resolve();
    let failed = false;
    const notice = document.createElement('div');
    notice.setAttribute('role', 'alert');
    Object.assign(notice.style, {position:'fixed', top:'0', left:'0', zIndex:'99999', background:'#8a1c1c', color:'white'});
    window.gameStore = {
      getItem(key) { return values.get(key) ?? null; },
      setItem(key, value) {
        value = String(value); values.set(key, value);
        queue = queue.then(async () => {
          if (failed) return;
          try { await execute('INSERT INTO game_preferences (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key,value]); }
          catch (error) { failed = true; notice.textContent = '云端保存失败或结果未知，请重新打开应用核对数据。'; document.body.appendChild(notice); }
        });
      },
    };
    const names = ['dogmilk.png', 'thrower.jpg'];
    window.gameAssetUrls = Object.fromEntries(await Promise.all(names.map(async name => {
      const response = await files.get(`template-assets/images/${name}`);
      if (!response.ok) throw new Error('角色素材不可读取');
      return [name, URL.createObjectURL(await response.blob())];
    }))); 
    root.innerHTML = body;
    const script = document.createElement('script');
    script.src = new URL('./game.js', import.meta.url).href;
    script.onerror = () => { notice.textContent = '游戏加载失败，请重新打开应用。'; document.body.appendChild(notice); };
    document.body.appendChild(script);
  } catch (error) {
    root.textContent = `游戏数据或素材加载失败：${error.message}。请重新打开应用。`;
  }
}
