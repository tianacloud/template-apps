import { createTianaFetch } from '@tianacloud/serverless';
import manifest from './asset-manifest.json';
export async function mount(root, context) {
  root.innerHTML = '<div style="padding:1rem;font-family:sans-serif">正在准备教学资源和学习档案…</div>';
  const status = root.firstElementChild;
  try {
    if (!context.files || !window.tiana?.auth?.getAccessToken || !window.tiana?.connection) throw new Error('应用运行环境尚未提供文件或数据库访问');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw new Error('当前数据库协议不支持安全参数写入');
    const sqlFetch = createTianaFetch({origin:connection.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
    async function execute(sql, args = []) {
      const res = await sqlFetch(`${connection.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
      if (!res.ok) throw new Error('数据库请求结果未知');
      const body = await res.json(); const item = body.results?.[0];
      if (item?.type !== 'ok' || item.response?.type !== 'execute') throw new Error('数据库操作未确认');
      return item.response.result;
    }
    const rows = await execute('SELECT profile_key, payload FROM learning_profiles');
    const data = new Map((rows.rows || []).map(row => [row[0].value,row[1].value]));
    let chain = Promise.resolve(); let failed = false;
    window.classroomProfiles = {
      get(key) { return data.get(key) || null; },
      set(key, value) {
        if (value === null) data.delete(key); else data.set(key,value);
        chain = chain.then(async () => {
          if (failed) return;
          try {
            if (value === null) await execute('DELETE FROM learning_profiles WHERE profile_key = ?', [{type:'text',value:key}]);
            else await execute('INSERT INTO learning_profiles (profile_key,payload) VALUES (?,?) ON CONFLICT(profile_key) DO UPDATE SET payload=excluded.payload', [{type:'text',value:key},{type:'text',value}]);
          } catch { failed=true; status.hidden=false; status.textContent='学习档案保存未确认，请重新打开应用检查云端记录。'; }
        });
      }
    };
    const urls = []; let index = 0;
    await Promise.all(Array.from({length: Math.min(6, manifest.external.length)}, async () => {
      while (index < manifest.external.length) {
        const path = manifest.external[index++];
        urls.push([path, await context.files.getUrl('template-assets/' + path)]);
      }
    }));
    window.classroomAssets = Object.assign({}, manifest.inline, Object.fromEntries(urls));
    status.hidden = true;
    const frame = document.createElement('iframe'); frame.title='电梯与扶梯仿真课堂'; frame.style.cssText='border:0;width:100%;height:100vh;display:block';
    frame.src = new URL('../site/index.html', import.meta.url).href; root.append(frame);
    return () => { frame.remove(); delete window.classroomAssets; delete window.classroomProfiles; };
  } catch (error) { status.textContent = `无法准备课堂：${error.message}。请检查网络和应用授权后重新打开。`; }
}
