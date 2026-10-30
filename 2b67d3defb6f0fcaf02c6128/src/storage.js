import {createTianaFetch} from '@tianacloud/serverless';

export async function openStorage() {
  const data = new Map();
  if (import.meta.env.MODE === 'showcase') return memory(data);
  if (typeof window.tiana?.auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw Error('数据库连接尚未就绪，请登录后重新打开应用');
  const c = await window.tiana.connection();
  if (c.sql_api !== 'hrana-v3') throw Error('当前数据库协议不受支持');
  const http = createTianaFetch({origin:c.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
  async function sql(text, values=[]) {
    const response=await http(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:text,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库操作结果未确认，请刷新核对');
    const result=(await response.json()).results?.[0];
    if(result?.type!=='ok' || result.response?.type!=='execute') throw Error('数据库操作结果未确认，请刷新核对');
    return result.response.result;
  }
  const result=await sql('SELECT key, value FROM question_bank_state');
  for(const row of result.rows || []) data.set(row[0].value,row[1].value);
  let queue=Promise.resolve();
  function persist(text, values) {
    queue=queue.then(()=>sql(text,values)).catch(error=>{
      document.getElementById('storage-error').textContent='保存未确认，请刷新核对：'+error.message;
      throw error;
    });
    // Keep the rejected queue stopped so later writes cannot mask an uncertain write.
    queue.catch(()=>{});
  }
  return {getItem:key=>data.get(key)??null,setItem(key,value){data.set(key,value);persist('INSERT INTO question_bank_state (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,value]);},removeItem(key){data.delete(key);persist('DELETE FROM question_bank_state WHERE key=?',[key]);}};
}
function memory(data){return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};}
