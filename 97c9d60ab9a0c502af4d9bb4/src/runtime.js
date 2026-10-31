import { createTianaFetch } from '@tianacloud/serverless';
export async function prepareStorage(onError) {
  if (!window.tiana?.auth?.getAccessToken || !window.tiana?.connection) throw Error('登录服务未就绪');
  const connection = await window.tiana.connection();
  if (connection.sql_api !== 'hrana-v3') throw Error('数据库协议不支持');
  const fetchSql = createTianaFetch({origin: connection.origin, auth: window.tiana.auth, requestBodyMode:'buffered'});
  async function sql(text, args = []) {
    const response = await fetchSql(`${connection.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:text,args:args.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库结果未确认');
    const result = (await response.json()).results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库结果未确认');
    return result.response.result;
  }
  const rows = await sql('SELECT key,value FROM jade_state');
  const data = new Map(rows.rows.map(row=>[row[0].value,row[1].value]));
  let queue = Promise.resolve(), failed = false;
  return {
    getItem(key) { return data.get(key) ?? null; },
    setItem(key,value) {
      if (failed) throw Error('保存暂停');
      data.set(key,value);
      queue = queue.then(() => { if (!failed) return sql('INSERT INTO jade_state (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,value]); }).catch(() => { failed=true; onError(); });
    }
  };
}
