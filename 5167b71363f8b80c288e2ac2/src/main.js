import { createTianaFetch } from '@tianacloud/serverless';
import body from './body.html?raw';
import css from './styles.css?raw';
import { ImageStore } from './imgstore.js';
import { startApp } from './app.js';
export async function mount(root, { files }) {
 root.innerHTML = body;
 const style = document.createElement('style'); style.textContent = css; document.head.append(style);
 try {
  const auth = window.tiana?.auth;
  if (typeof auth?.getAccessToken !== 'function' || !files) throw new Error('应用服务未就绪');
  const connection = await window.tiana.connection();
  if (connection.sql_api !== 'hrana-v3') throw new Error('数据库协议不受支持');
  const transport = createTianaFetch({origin:connection.origin,auth,requestBodyMode:'buffered'});
  async function query(sql,args=[]) {
   const response = await transport(`${connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
   if (!response.ok) throw new Error('数据库响应未确认');
   const result=(await response.json()).results?.[0];
   if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作未确认');
   return result.response.result;
  }
  const initial=await query('SELECT payload FROM todo_state WHERE id = 1');
  const raw=initial.rows?.[0]?.[0]?.value || null;
  let queue=Promise.resolve(), failed=false, baseline=raw;
  const store={mode:'cloud',read:()=>raw,write(value){
   const op=queue.then(async()=>{
    if(failed) throw new Error('请重新加载并核对保存结果');
    try {
     const args=[{type:'text',value}];
     const result=baseline === null
      ? await query('INSERT INTO todo_state (id, payload) VALUES (1, ?) ON CONFLICT(id) DO NOTHING',args)
      : await query('UPDATE todo_state SET payload = ? WHERE id = 1 AND payload = ?', [...args,{type:'text',value:baseline}]);
     if (Number(result.affected_row_count) !== 1) throw new Error('数据已在其他会话更改，请重新加载');
     baseline=value;
    }
    catch(error) { failed=true; throw error; }
   });
   queue=op.catch(()=>{}); return op;
  }};
  startApp(store,files,ImageStore);
 } catch(error) { root.textContent='无法加载待办数据，请检查连接后重新打开。'; console.error('应用初始化失败',error); }
 return ()=>style.remove();
}
