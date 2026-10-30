import {createTianaFetch} from '@tianacloud/serverless';
import body from '../public/body.html';
import css from '../public/styles.css';
export async function mount(root, context) {
  root.innerHTML = body;
  const style = document.createElement('style'); style.textContent = css; document.head.append(style);
  const note = document.getElementById('storage-note');
  const unbind = [];
  for (const img of root.querySelectorAll('[data-file]')) {
    try { unbind.push(await context.files.bindImage(img, `template-assets/images/${img.dataset.file}`)); }
    catch { img.hidden = true; document.documentElement.dataset.sceneState = 'fallback'; }
  }
  try {
    if (!window.tiana?.auth?.getAccessToken) throw Error('登录服务未就绪');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw Error('数据库协议不支持');
    const fetchSql = createTianaFetch({origin:connection.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
    async function sql(text, values = []) {
      const response = await fetchSql(`${connection.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:text,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
      if (!response.ok) throw Error('数据库结果未确认');
      const result = (await response.json()).results?.[0];
      if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库结果未确认');
      return result.response.result;
    }
    const rows = await sql('SELECT key, value FROM rest_journal');
    const data = new Map(rows.rows.map(row=>[row[0].value,row[1].value]));
    let queue = Promise.resolve(), failed = false;
    window.restStorage = {
      getItem(key){return data.get(key) ?? null},
      setItem(key,value){
        if (failed) throw Error('保存暂停，请刷新核对');
        data.set(key,value);
        queue = queue.then(()=>{if(failed) return; return sql('INSERT INTO rest_journal (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,value]);}).catch(()=>{failed=true;note.hidden=false;});
      },
      key(index){return [...data.keys()][index] ?? null},
      get length(){return data.size}
    };
    await import('../public/core.js');
    await import('../public/app.js');
    await import('../public/scene.js');
  } catch (error) {
    note.hidden = false; note.textContent = '无法读取记录，请检查登录和网络后刷新。';
    root.querySelectorAll('button').forEach(button=>button.disabled=true);
  }
  return () => { unbind.forEach(fn=>fn()); style.remove(); };
}
