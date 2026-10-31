import { createTianaFetch } from '@tianacloud/serverless';

// A single versioned document keeps the original application's data model intact.
// Conditional updates prevent one open session silently overwriting another.
export async function connectStore() {
  const auth = window.tiana?.auth;
  if (typeof auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw Error('数据库登录服务不可用');
  const conn = await window.tiana.connection();
  if (conn.sql_api !== 'hrana-v3') throw Error('当前数据库连接协议不支持保存');
  const fetchSql = createTianaFetch({ origin: conn.origin, auth, requestBodyMode: 'buffered' });
  async function execute(sql, args = []) {
    const response = await fetchSql(`${conn.origin}/v3/pipeline`, {
      method: 'POST', headers: {'content-type': 'application/json'},
      body: JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})
    });
    if (!response.ok) throw Error('数据库响应不可用，保存结果未知');
    const body = await response.json();
    const item = body.results?.[0];
    if (item?.type !== 'ok' || item.response?.type !== 'execute') throw Error('数据库操作失败或结果未知');
    return item.response.result;
  }
  await execute('INSERT OR IGNORE INTO moneybook_state (id, revision, data) VALUES (1, 0, NULL)');
  const result = await execute('SELECT revision, data FROM moneybook_state WHERE id = 1');
  if (!result.rows?.length) throw Error('无法读取账本');
  let revision = Number(result.rows[0][0].value);
  const raw = result.rows[0][1].value || null;
  let pending = Promise.resolve();
  let failed = false;
  let queued = 0;
  const banner = document.createElement('div');
  Object.assign(banner.style, {position:'fixed', bottom:'12px', right:'12px', zIndex:'99999', background:'#24324a', color:'white', padding:'10px 16px', borderRadius:'8px', display:'none'});
  document.body.appendChild(banner);
  function save(data) {
    if (failed) return;
    const snapshot = JSON.stringify(data);
    queued++; banner.style.display = 'block'; banner.textContent = '正在保存…';
    pending = pending.then(async () => {
      if (failed) return;
      const write = await execute('UPDATE moneybook_state SET data = ?, revision = revision + 1 WHERE id = 1 AND revision = ?', [
        {type:'text',value:snapshot},{type:'integer',value:String(revision)}
      ]);
      if (write.affected_row_count !== 1) throw Error('账本已在其他页面修改');
      revision++;
    }).then(() => { queued--; if (!failed && queued === 0) { banner.textContent = '已保存'; setTimeout(() => { if (banner.textContent === '已保存') banner.style.display='none'; }, 1500); } }).catch(err => {
      queued--; failed = true; banner.style.background='#a11';
      banner.textContent = '保存失败或结果未知：' + err.message + '。请先导出备份，再重新打开核对数据。';
    });
  }
  window.addEventListener('beforeunload', e => { if (failed || queued > 0) { e.preventDefault(); e.returnValue = ''; } });
  return {raw, save};
}
