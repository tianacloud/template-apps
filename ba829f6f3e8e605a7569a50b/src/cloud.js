import { createTianaFetch } from '@tianacloud/serverless';
const status = document.createElement('div');
status.setAttribute('role', 'status');
Object.assign(status.style, {position:'fixed',bottom:'0',left:'0',right:'0',zIndex:'9999',padding:'8px',textAlign:'center',background:'#fff4dd',color:'#672b16',font:'14px sans-serif'});
status.textContent = '正在连接存档…'; document.body.append(status);
try {
  if (typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('登录状态未就绪');
  const connection = await window.tiana.connection();
  if (connection.sql_api !== 'hrana-v3') throw Error('数据库协议不受支持');
  const request = createTianaFetch({origin:connection.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
  async function sql(statement, values=[]) {
    const response = await request(`${connection.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库请求结果未知');
    const first = (await response.json()).results?.[0];
    if (first?.type !== 'ok' || first.response?.type !== 'execute') throw Error('数据库操作未完成');
    return first.response.result;
  }
  const result = await sql('SELECT key, value FROM simulator_storage');
  const data = new Map(result.rows.map(row => [row[0].value, row[1].value]));
  let queue = Promise.resolve(), failed = false, pending = 0;
  function persist(key, value) {
    if (failed) throw Error('存档连接已中断');
    pending++; status.textContent = '正在保存…'; status.hidden = false;
    queue = queue.then(async () => {
      if (failed) { pending--; return; }
      try {
        if (value === null) await sql('DELETE FROM simulator_storage WHERE key = ?', [key]);
        else await sql('INSERT INTO simulator_storage (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key,value]);
      } catch (_) { failed = true; status.textContent = '存档结果未确认，请刷新后检查记录。'; }
      finally { pending--; if (!pending && !failed) status.hidden = true; }
    });
  }
  window.hallStore = {getItem(key) { return data.get(key) ?? null; }, setItem(key,value) { value=String(value); persist(key,value); data.set(key,value); }, removeItem(key) { persist(key,null); data.delete(key); }};
  window.addEventListener('beforeunload', event => { if (pending) { event.preventDefault(); event.returnValue = ''; } });
  const frame = document.createElement('iframe'); frame.title = '模拟器大厅';
  frame.src = new URL('../hall/index.html', import.meta.url).href;
  Object.assign(frame.style,{position:'fixed',inset:'0',width:'100%',height:'100%',border:'0'});
  document.body.append(frame); status.hidden = true;
} catch (_) { status.textContent = '无法读取云端存档，请检查登录及网络后刷新重试。'; }
