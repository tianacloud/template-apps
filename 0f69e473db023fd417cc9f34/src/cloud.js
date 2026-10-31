import {createTianaFetch} from '@tianacloud/serverless';
export function createStore(onRemote, onStatus) {
  let conn, transport, revision, dirty = false, pushing = false, failed = false, generation = 0, timer, getState;
  const text = value => ({type:'text', value:String(value)});
  const integer = value => ({type:'integer', value:String(value)});
  async function sql(query, args = []) {
    const res = await transport(conn.origin + '/v3/pipeline', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({requests:[{type:'execute',stmt:{sql:query,args,want_rows:true}},{type:'close'}]})});
    if (!res.ok) throw Error('数据库请求失败');
    const body = await res.json(), statement = body.results?.[0];
    if (statement?.type !== 'ok' || statement.response?.type !== 'execute') throw Error('数据库操作结果未知');
    return statement.response.result;
  }
  async function read() {
    const result = await sql('SELECT data, revision FROM pigeon_state WHERE id=1');
    return result.rows?.length ? {data:JSON.parse(result.rows[0][0].value), revision:Number(result.rows[0][1].value)} : null;
  }
  async function push() {
    if (pushing || failed) return;
    pushing = true;
    const g = generation, payload = JSON.stringify(getState());
    try {
      const result = await sql('UPDATE pigeon_state SET data=?, revision=revision+1 WHERE id=1 AND revision=? RETURNING revision',[text(payload),integer(revision)]);
      if (!result.rows?.length) throw Error('数据已在其他页面更改');
      revision = Number(result.rows[0][0].value); dirty = g !== generation;
      onStatus(dirty ? '正在保存…' : '已保存到云端');
    } catch (error) {
      failed = true; document.querySelector('.composer').inert = true; document.getElementById('list').inert = true; onStatus('保存未确认或数据已更改，请刷新页面核对后再操作');
    } finally {
      pushing = false; if (dirty && !failed) timer = setTimeout(push, 500);
    }
  }
  return {
    async start(defaults, stateGetter) {
      getState = stateGetter;
      if (typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('账号连接未就绪');
      conn = await window.tiana.connection();
      if (conn.sql_api !== 'hrana-v3') throw Error('数据库协议不支持');
      transport = createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
      await sql('INSERT OR IGNORE INTO pigeon_state(id,data,revision) VALUES(1,?,0)',[text(JSON.stringify(defaults))]);
      const row = await read(); if (!row) throw Error('数据库读取失败'); revision = row.revision;
      setInterval(async () => { if (dirty || pushing || failed || ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return; try { const current = await read(); if (current && current.revision > revision) {revision = current.revision; onRemote(current.data);} } catch {onStatus('读取失败，请检查连接');} }, 6000);
      return row.data;
    },
    save() {generation++; dirty = true; onStatus('正在保存…'); clearTimeout(timer); if (!failed) timer = setTimeout(push, 500);}
  };
}
