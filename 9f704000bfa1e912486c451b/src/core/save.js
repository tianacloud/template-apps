import { createTianaFetch } from '@tianacloud/serverless';

// Load once before the game starts. Writes are ordered and any uncertain outcome
// stops subsequent writes until the user reloads and reads the database again.
export class SaveStore {
  static async open() {
    if (typeof window.tiana?.auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw new Error('请登录后打开应用以读取云端存档');
    const connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw new Error('当前数据库协议不受支持');
    const store = new SaveStore(connection, createTianaFetch({origin: connection.origin, auth: window.tiana.auth, requestBodyMode: 'buffered'}));
    const rows = await store.query('SELECT key, value FROM glassquest_save');
    for (const row of rows) store.cache.set(row.key, row.value);
    return store;
  }
  constructor(connection, fetcher) { this.connection=connection; this.fetcher=fetcher; this.cache=new Map(); this.queue=Promise.resolve(); this.failed=false; }
  async query(sql, values=[]) {
    const response=await this.fetcher(`${this.connection.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw new Error('数据库响应未确认');
    const body=await response.json(), result=body.results?.[0];
    if (result?.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作未确认');
    const data=result.response.result;
    return (data.rows || []).map(row=>Object.fromEntries(data.cols.map((col,i)=>[col.name,row[i]?.value ?? null])));
  }
  read(key) { const raw=this.cache.get(key); return raw == null ? null : JSON.parse(raw); }
  safeWrite(key,value) {
    if (this.failed) return false;
    const raw=JSON.stringify(value); this.cache.set(key,raw);
    this.queue=this.queue.then(async()=>{
      if (this.failed) return;
      try { await this.query('INSERT INTO glassquest_save (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,raw]); }
      catch (error) { this.failed=true; console.error(error); const el=document.getElementById('save-error'); if(el) el.hidden=false; }
    });
    return true;
  }
  remove(key) { this.cache.delete(key); }
}
