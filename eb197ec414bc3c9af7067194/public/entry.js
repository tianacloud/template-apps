import { createTianaFetch } from '@tianacloud/serverless';

export async function mount(root, { files }) {
  root.textContent = '正在加载应用数据…';
  try {
    const auth = window.tiana?.auth;
    if (!auth?.getAccessToken || !window.tiana?.connection) throw Error('数据库认证尚未就绪');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw Error('不支持当前数据库协议');
    const http = createTianaFetch({origin: connection.origin, auth, requestBodyMode:'buffered'});
    async function execute(sql, values = []) {
      const response = await http(`${connection.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
      if (!response.ok) throw Error('数据库请求失败，结果需要核对');
      const result = (await response.json()).results?.[0];
      if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作失败或结果未知');
      return result.response.result;
    }
    const rows = (await execute('SELECT key, value FROM posture_state')).rows || [];
    const values = new Map(rows.map(row => [row[0].value, row[1].value]));
    let queue = Promise.resolve(), failed = false;
    const notice = document.createElement('div'); notice.setAttribute('role','alert');
    Object.assign(notice.style,{position:'fixed',top:'0',left:'0',zIndex:'99999',background:'#8a1c1c',color:'white'});
    function enqueue(sql,args) { queue=queue.then(async()=>{if(failed)return;try{await execute(sql,args);}catch{failed=true;notice.textContent='云端保存失败或结果未知，请重新打开应用核对数据。';document.body.appendChild(notice);}}); }
    window.postureStore = {
      getItem(key){return values.get(key) ?? null;},
      setItem(key,value){value=String(value);values.set(key,value);enqueue('INSERT INTO posture_state (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,value]);},
      removeItem(key){values.delete(key);enqueue('DELETE FROM posture_state WHERE key=?',[key]);}
    };
    const response = await files.get('template-assets/pose_landmarker_lite.task');
    if (!response.ok) throw Error('姿态模型读取失败');
    window.postureModelUrl = URL.createObjectURL(await response.blob());
    root.textContent=''; root.id='app';
    await import('./app.js');
  } catch(error) { root.textContent=`应用数据或姿态模型加载失败：${error.message}。请重新打开应用。`; }
}
