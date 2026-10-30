import {createTianaFetch} from '@tianacloud/serverless';
const transient = /^(?:__gymj_t|gymj\.(?:acc\.|gst\.|home\.|adopt\.|outbox\.|fb\.mine))/;
export async function mount(root, context) {
  root.textContent = '正在读取训练数据和素材…';
  try {
    if (!context.files?.getUrl || !window.tiana?.auth?.getAccessToken) throw Error('数据或文件服务未就绪');
    const c = await window.tiana.connection();
    if (c.sql_api !== 'hrana-v3') throw Error('不支持当前数据库协议');
    const fetchSql = createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
    async function execute(sql, values=[]) {
      const response=await fetchSql(c.origin+'/v3/pipeline',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:values.map(value=>({type:'text',value:String(value)})),want_rows:true}},{type:'close'}]})});
      if (!response.ok) throw Error('数据库操作结果未知，请重新打开检查');
      const result=(await response.json()).results?.[0];
      if(result?.type!=='ok'||result.response?.type!=='execute') throw Error('数据库操作失败或结果未知');
      return result.response.result;
    }
    const data=new Map();
    for(const row of (await execute('SELECT key, value FROM training_state')).rows || []) if(!transient.test(row[0].value)) data.set(row[0].value,row[1].value);
    let queue=Promise.resolve(), failed=false;
    const warn=()=>{failed=true; let el=root.querySelector('[data-save-error]'); if(!el){el=document.createElement('div');el.dataset.saveError='';Object.assign(el.style,{position:'fixed',zIndex:'99999',top:'0',left:'0',right:'0',background:'#b42318',color:'white',padding:'10px',textAlign:'center'});root.append(el)}el.textContent='保存结果未知，请重新打开应用检查数据。';};
    function save(sql,values) { if(failed)return; queue=queue.then(()=>execute(sql,values)).catch(warn); }
    const store={getItem(key){return data.has(String(key))?data.get(String(key)):null},setItem(key,value){key=String(key);value=String(value);data.set(key,value);if(!transient.test(key))save('INSERT INTO training_state(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,value])},removeItem(key){key=String(key);data.delete(key);if(!transient.test(key))save('DELETE FROM training_state WHERE key=?',[key])},key(index){return [...data.keys()][index]??null},get length(){return data.size}};
    const urls={}; await Promise.all(ASSET_NAMES.map(async name=>{urls[name]=await context.files.getUrl('template-assets/img/'+name)}));
    window.__gymjStore=store; window.__gymjAsset=name=>urls[name]||'';
    const base=new URL('../',import.meta.url); window.__gymjBase=base.href; const res=await fetch(new URL('app.html',base));if(!res.ok)throw Error('应用页面加载失败');
    const html=await res.text();root.replaceChildren();const f=document.createElement('iframe');f.title='捉鸡麻将复盘训练工具';f.allow='fullscreen';f.allowFullscreen=true;Object.assign(f.style,{position:'fixed',inset:'0',width:'100%',height:'100%',border:'0'});root.append(f);
    f.srcdoc=html.replaceAll('src="assets/', 'src="'+new URL('assets/',base).href);
    return ()=>{f.remove();delete window.__gymjStore;delete window.__gymjAsset;delete window.__gymjBase};
  } catch(e) {root.textContent='无法读取训练数据或素材：'+e.message+'。请检查连接后重新打开。';}
}
