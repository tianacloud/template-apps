import {createTianaFetch} from '@tianacloud/serverless';

export async function openLedgerStore() {
  if (typeof window.tiana?.auth?.getAccessToken !== 'function' || typeof window.tiana?.connection !== 'function') throw new Error('数据库连接尚未就绪，请检查登录状态后刷新。');
  const connection = await window.tiana.connection();
  if (connection.sql_api !== 'hrana-v3') throw new Error('当前数据库协议暂不支持安全写入。');
  const fetchSql = createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  async function execute(sql,args=[]) {
    const response=await fetchSql(`${connection.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
    if(!response.ok) throw new Error('数据库响应异常，写入结果可能未知。');
    const body=await response.json(), result=body.results?.[0];
    if(result?.type!=='ok'||result.response?.type!=='execute') throw new Error('数据库操作失败或结果未知。');
    return result.response.result;
  }
  const result=await execute('SELECT payload, revision FROM ledger_state WHERE id = 1');
  const row=result.rows?.[0];
  if(!row) throw new Error('账本未初始化，请检查安装任务。');
  let data=JSON.parse(row[0].value), revision=Number(row[1].value), busy=false, dirty=false, failed=false;
  if(!data || typeof data!=='object' || Array.isArray(data)) throw new Error('账本数据格式异常，请联系管理员恢复。');
  const status=document.createElement('div');
  status.setAttribute('role','status');
  Object.assign(status.style,{position:'fixed',right:'12px',top:'12px',pointerEvents:'none',zIndex:'99999',background:'#fff',color:'#555',padding:'6px 10px',borderRadius:'8px',boxShadow:'0 1px 8px #0003',fontSize:'12px'});
  document.body.appendChild(status);
  const show=t=>status.textContent=t;
  const block=message=>{failed=true;show(message);const layer=document.createElement('div');Object.assign(layer.style,{position:'fixed',inset:'0',zIndex:'99998',background:'#ffffffdd',display:'grid',placeItems:'center',padding:'24px',textAlign:'center'});layer.textContent=message+' 请刷新后检查数据，必要时从备份恢复。';document.body.appendChild(layer);};
  async function flush(){
    if(busy||failed||!dirty)return;
    busy=true;dirty=false;show('正在保存到云端…');
    const snapshot=JSON.stringify(data), expected=revision;
    try {
      const res=await execute('UPDATE ledger_state SET payload = ?, revision = revision + 1 WHERE id = 1 AND revision = ? RETURNING revision',[{type:'text',value:snapshot},{type:'integer',value:String(expected)}]);
      if(!res.rows?.length){block('账本已在其他页面更改，本次修改未保存。');return;}
      revision=Number(res.rows[0][0].value);show('已保存到云端');
    } catch(e) {block('保存失败或结果未知，勿重复提交。');}
    finally {busy=false;if(dirty&&!failed)flush();}
  }
  function changed(){if(failed)throw new Error('账本不可写');dirty=true;show('等待保存…');queueMicrotask(flush);}
  window.addEventListener('beforeunload',e=>{if(busy||dirty){e.preventDefault();e.returnValue='';}});
  show('已连接云端账本');
  return {getItem:k=>Object.hasOwn(data,k)?data[k]:null,setItem(k,v){data[k]=String(v);changed();},removeItem(k){delete data[k];changed();},key:i=>Object.keys(data)[i]??null,get length(){return Object.keys(data).length;}};
}
