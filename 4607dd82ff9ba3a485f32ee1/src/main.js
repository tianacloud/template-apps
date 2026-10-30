import { createTianaFetch } from '@tianacloud/serverless';

async function start() {
  if (typeof window.tiana?.connection !== 'function' || typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('云端连接不可用');
  const connection = await window.tiana.connection();
  if (connection.sql_api !== 'hrana-v3') throw Error('数据库协议不受支持');
  const request = createTianaFetch({origin: connection.origin, auth: window.tiana.auth, requestBodyMode:'buffered'});
  async function execute(sql, values=[]) {
    const args=values.map(value => ({type:'text',value:String(value)}));
    const response=await request(`${connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库请求结果未知');
    const item=(await response.json()).results?.[0];
    if(item?.type!=='ok'||item.response?.type!=='execute') throw Error('数据库操作失败或结果未知');
    return item.response.result;
  }
  const rows=await execute('SELECT document, revision FROM habit_state WHERE id = 1');
  if (!rows.rows?.length) throw Error('数据库尚未初始化');
  const memory=JSON.parse(rows.rows[0][0].value); let revision=Number(rows.rows[0][1].value);
  let queue=Promise.resolve(), failed=false, pending=0;
  function status(state,message){window.__saveStatus=state;window.__saveText=message;window.__showSaveStatus?.(state,message);}
  function write() {
    if (failed) return;
    const snapshot=JSON.stringify(memory); pending++; status('busy','正在保存');
    queue=queue.then(async()=>{
      if(failed) return;
      try {
        const result=await execute('UPDATE habit_state SET document = ?, revision = revision + 1 WHERE id = 1 AND revision = ?', [snapshot,revision]);
        if(Number(result.affected_row_count)!==1) throw Error('其他页面已更新数据');
        revision++; pending--; if (!pending) status('on','已保存到云端');
      } catch(error) {
        failed=true; status('off','保存失败，请导出备份并刷新');
        alert('保存失败或其他页面已更新。请先导出备份，再刷新页面；本页后续修改不会保存。');
      }
    });
  }
  window.__cloudStorage={getItem(k){return Object.hasOwn(memory,k)?memory[k]:null;},setItem(k,v){memory[k]=String(v);if(k!=='__wb_store_test')write();},removeItem(k){delete memory[k];if(k!=='__wb_store_test')write();}};
  await import('./app.js');
}
start().catch(()=>{document.getElementById('app').textContent='无法连接云端数据，请检查网络和登录状态后刷新。';});
