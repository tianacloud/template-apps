import { createTianaFetch } from '@tianacloud/serverless';

export async function openStorage(files) {
  if (!files || typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('应用存储或登录尚未就绪');
  const c = await window.tiana.connection();
  if (c.sql_api !== 'hrana-v3') throw Error('不支持的数据库协议');
  const request = createTianaFetch({origin:c.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
  async function sql(statement, values=[]) {
    const response=await request(c.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args:values.map(value=>({type:'text',value})),want_rows:true}},{type:'close'}]})});
    if (!response.ok) throw Error('数据库操作结果未确认');
    const first=(await response.json()).results?.[0];
    if (first?.type!=='ok' || first.response?.type!=='execute') throw Error('数据库操作未确认');
    return first.response.result;
  }
  const rows=(await sql('SELECT key, value FROM medreg_settings')).rows;
  const data=new Map(rows.map(row=>[row[0].value,row[1].value]));
  let fulltextPath=data.get('medreg.fulltext.path') || null;
  if (fulltextPath) {
    const response=await files.get(fulltextPath);
    if (!response.ok) throw Error('无法读取已保存的全文');
    data.set('medreg.fulltext',await response.text());
  }
  const status=document.createElement('div');
  status.setAttribute('role','status');
  Object.assign(status.style,{position:'fixed',bottom:'0',left:'0',right:'0',zIndex:'9999',padding:'8px',textAlign:'center',background:'#fff4dd',color:'#672b16'});
  document.body.append(status); status.hidden=true;
  let queue=Promise.resolve(), failed=false, pending=0;
  const write=(key,value)=>sql('INSERT INTO medreg_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,value]);
  function setItem(key,value) {
    if(failed) throw Error('保存连接已中断，请刷新并检查');
    value=String(value); data.set(key,value); pending++; status.hidden=false; status.textContent='正在保存…';
    queue=queue.then(async()=>{
      if(failed) return;
      if(key==='medreg.fulltext') {
        const path='fulltext/'+crypto.randomUUID()+'.json';
        await files.put(path,new Blob([value],{type:'application/json'}));
        await write('medreg.fulltext.path',path);
        const old=fulltextPath; fulltextPath=path;
        if(old) { try { await files.delete(old); } catch (_) { /* 已保存的新版本不受清理失败影响 */ } }
      } else await write(key,value);
    }).catch(()=>{failed=true; status.textContent='保存结果未确认，请刷新后检查；当前页面的修改可能未保存。';}).finally(()=>{pending--; if(!pending&&!failed) status.hidden=true;});
  }
  window.addEventListener('beforeunload',e=>{if(pending){e.preventDefault();e.returnValue='';}});
  return {getItem:key=>data.get(key) ?? null,setItem};
}
