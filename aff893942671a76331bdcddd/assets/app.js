import { createTianaFetch } from '@tianacloud/serverless';
import inlineImages from './inline.js';
const base = new URL('.', import.meta.url);
async function unzip(response) {
  if (!response.ok) throw Error('无法加载应用资源');
  return new Response(response.body.pipeThrough(new DecompressionStream('gzip')));
}
function toBase64(bytes) {
  let chunks = ''; const a = new Uint8Array(bytes);
  for (let i = 0; i < a.length; i += 32768) chunks += String.fromCharCode(...a.subarray(i, i + 32768));
  return btoa(chunks);
}
async function database() {
  const auth = window.tiana?.auth;
  if (typeof auth?.getAccessToken !== 'function') throw Error('数据库授权不可用');
  const conn = await window.tiana.connection();
  if (conn.sql_api !== 'hrana-v3') throw Error('当前数据库协议不支持保存');
  const sqlFetch = createTianaFetch({ origin: conn.origin, auth, requestBodyMode: 'buffered' });
  async function execute(sql, args = []) {
    const response = await sqlFetch(`${conn.origin}/v3/pipeline`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]}) });
    if (!response.ok) throw Error('数据库响应不可用，请重新打开检查保存结果');
    const body = await response.json(), result = body.results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作未确认，请重新打开检查保存结果');
    return result.response.result;
  }
  const row = await execute('SELECT value FROM word_state WHERE id = ?', [{type:'integer',value:'1'}]);
  const text = row.rows?.[0]?.[0]?.value;
  let queue = Promise.resolve(), failed = false;
  return {
    initial: text ? JSON.parse(text) : null,
    save(value) {
      const snapshot = JSON.stringify(value);
      queue = queue.then(async () => {
        if (failed) return;
        try { await execute('INSERT INTO word_state (id, value) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET value=excluded.value', [{type:'integer',value:'1'},{type:'text',value:snapshot}]); }
        catch (error) { failed = true; const notice = document.createElement('div'); notice.textContent = '保存未确认，请重新打开应用核对进度'; notice.style.cssText='position:fixed;top:0;z-index:99999;background:#a22;color:white;padding:12px;width:100%;'; document.body.appendChild(notice); }
      });
      return queue.then(() => { if (failed) throw Error('保存未确认'); });
    }
  };
}
export async function mount(root, { files }) {
  try {
    if (!files?.get) throw Error('文件服务不可用');
    const [shellResponse, dataResponse, store] = await Promise.all([fetch(new URL('shell.html.gz', base)), files.get('template-assets/data.json.gz'), database()]);
    const shell = await (await unzip(shellResponse)).text();
    const data = await (await unzip(dataResponse)).json();
    const refs = [];
    function find(value, parent, key) {
      if (value && typeof value === 'object' && typeof value.$inline === 'string') parent[key] = inlineImages[value.$inline];
      else if (value && typeof value === 'object' && typeof value.$file === 'string') refs.push({ value, parent, key });
      else if (value && typeof value === 'object') for (const k of Object.keys(value)) find(value[k], value, k);
    }
    find(data, null, null);
    let index = 0;
    await Promise.all(Array.from({length: Math.min(8, refs.length)}, async () => {
      while (index < refs.length) {
        const item = refs[index++], ref = item.value;
        let response = await files.get('template-assets/' + ref.$file);
        if (!response.ok) throw Error('素材读取失败：' + ref.$file);
        if (ref.$kind.startsWith('gzip-')) response = await unzip(response);
        const encoded = toBase64(await response.arrayBuffer());
        item.parent[item.key] = ref.$kind.startsWith('url:') ? 'data:' + ref.$kind.slice(4) + ';base64,' + encoded : encoded;
      }
    }));
    window.__wordData = data; window.__wordStore = store;
    const parsed = new DOMParser().parseFromString(shell, 'text/html');
    for (const style of parsed.head.querySelectorAll('style')) document.head.append(style.cloneNode(true));
    root.innerHTML = parsed.body.innerHTML;
    for (const name of ['pixi.min.js','unsafe-eval.min.js','live2d.min.js','cubism2.js','runtime.js']) await new Promise((resolve, reject) => { const script = document.createElement('script'); script.charset = 'utf-8'; script.src = new URL(name,base); script.onload = resolve; script.onerror = reject; document.body.appendChild(script); });
  } catch (error) { root.textContent = '应用无法启动：' + error.message; }
}
