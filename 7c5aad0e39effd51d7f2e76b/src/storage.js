import { createTianaFetch } from '@tianacloud/serverless';
let client, conn;
async function sql(q,args=[]) {
  if (!client) {
    if (!window.tiana?.auth?.getAccessToken || !window.tiana?.connection) throw Error('应用连接尚未就绪');
    conn=await window.tiana.connection();
    if(conn.sql_api !== 'hrana-v3') throw Error('当前数据库协议不支持此应用');
    client=createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  }
  const r=await client(`${conn.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:q,args,want_rows:true}},{type:'close'}]})});
  if(!r.ok) throw Error('数据库请求结果未知，请刷新检查后再操作');
  const b=await r.json(), s=b.results?.[0];
  if(s?.type!=='ok'||s.response?.type!=='execute') throw Error('数据库操作失败');
  return s.response.result;
}
const text=v=>({type:'text',value:String(v)}), integer=v=>({type:'integer',value:String(v)});
export async function read(){let r=await sql('SELECT revision, content FROM gx_store WHERE id = 1'); if(!r.rows?.length) throw Error('数据库尚未初始化'); let row=r.rows[0];return {revision:Number(row[0].value),files:JSON.parse(row[1].value)};}
export async function change(fn){let {revision,files}=await read();let result=fn(files); if(result?.conflict||result?.skipped)return result;let r=await sql('UPDATE gx_store SET content = ?, revision = revision + 1 WHERE id = 1 AND revision = ?',[text(JSON.stringify(files)),integer(revision)]);if(Number(r.affected_row_count)!==1)throw Error('记录已被其他窗口更新，请刷新后重试');return result;}
const initial='# 四书 · 状态\n\n| 单元 | 状态 | 周档位 |\n| --- | --- | --- |\n';
const ROW=/^\|\s*([^|]+?)\s*\|\s*(未读|在读|待回炉|搁置)\s*\|\s*([^|]*?)\s*\|\s*$/;
function week(day){let d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10)}
const clean=(s,n=4000)=>String(s??'').replace(/\r\n?/g,'\n').trim().slice(0,n);
export async function mutate(path,d){return change(f=>{
  let name=path.slice(5), day=d.date, wf='weekly/'+(day?week(day):'')+'.md', body=f[wf]||'';
  if(name==='select'){
    if(!d.unit||!Array.isArray(d.paras)||!d.paras.length)throw Error('单元名不合法或正文为空');
    f['texts/'+d.unit+'.txt']=d.paras.map(x=>String(x).trim()).filter(Boolean).join('\n\n')+'\n';
    let prev=null,found=false,lines=(f['state.md']||initial).split('\n'),last=-1;
    lines=lines.map((ln,i)=>{let m=ln.match(ROW);if(!m)return ln;last=i;let [_,unit,status,gear]=m;unit=unit.trim();if(status==='在读'&&unit!==d.unit){prev=unit;status='待回炉'} if(unit===d.unit){found=true;status='在读'} return `| ${unit} | ${status} | ${gear.trim()||'—'} |`});
    if(!found)lines.splice(last+1,0,`| ${d.unit} | 在读 | — |`);f['state.md']=lines.join('\n');return {ok:true,unit:d.unit,prev};
  }
  if(name==='gear'){
    if(!['完整','底线'].includes(d.gear))throw Error('档位只能是 完整 / 底线');let line=`晨读 ${day} 档位：${d.gear}`;if(body.includes(line))return {skipped:true,file:week(day)+'.md'};
    if(!body.trim())body=`档位：${d.gear}\n`;else if(!body.trimStart().startsWith('档位：'))body=`档位：${d.gear}\n\n`+body;
    f[wf]=body.replace(/\n+$/,'')+'\n\n'+line+'\n';f['state.md']=(f['state.md']||initial).split('\n').map(ln=>{let m=ln.match(ROW);return m&&m[1].trim()===d.unit?`| ${d.unit} | ${m[2]} | ${d.gear} |`:ln}).join('\n');return {file:week(day)+'.md'};
  }
  if(name==='sanzhao'){
    let {unit}=d, [touch,scene,react,act]=['touch','scene','react','act'].map(k=>clean(d[k]));if(!touch||!scene||!react||!act)throw Error('触、情境、反应、行 四项缺一不可');if(body.includes('## 触')&&!d.overwrite)return {conflict:true};let g=body.match(/^档位：(完整|底线)/m),keep=(body.includes('## 触')?body.split('## 触')[0]:body).trim()||('档位：'+(g?g[1]:'—')); f[wf]=[keep,'## 触\n'+touch,'## 照\n情境：'+scene+'\n反应：'+react,'## 行\n'+act].join('\n\n')+'\n'; let card=`${day}-${unit}.md`;f['cards/'+card]='标签：\n\n'+touch+'\n';return {ok:true,file:week(day)+'.md',card};
  }
  if(name==='notouch'){if(body.includes('## 触'))return {conflict:true};f[wf]=(body.trim()?body.replace(/\s+$/,'')+'\n\n':'')+'## 触\n本周无触\n';return {ok:true,file:week(day)+'.md'}}
  if(name==='replay'){if(!d.target||!d.q1||!d.q2||!d.q3)throw Error('三问都要有回答');f['sessions/'+day+'.md']=`回照对象：${d.target}\n\n问一：${clean(d.q1)}\n问二：${clean(d.q2)}\n问三：${clean(d.q3)}\n`;return {ok:true,file:day+'.md'}}
  if(name==='tag'){let key='cards/'+d.file;if(!(key in f))throw Error('卡片不存在');let tag=clean(d.tag,20).replace(/\n/g,' '),s=f[key];f[key]=(/^标签：.*$/m.test(s)?s.replace(/^标签：.*$/m,'标签：'+tag):'标签：'+tag+'\n\n'+s).replace(/\n+$/,'')+'\n';return {ok:true}}
  if(name==='link'){let files=d.files||[], note=clean(d.note,400);if(!note||files.length<2||files.length>3||files.some(x=>!('cards/'+x in f)))throw Error('请选择两到三张卡并填写关联语');for(let file of files){let key='cards/'+file,others=files.filter(x=>x!==file).map(x=>x.slice(0,-3)).join('、'),line=`关联：${note}（与 ${others}）`;if(!f[key].includes(line))f[key]=f[key].replace(/\n+$/,'')+'\n\n'+line+'\n'}return {ok:true,files}}
  throw Error('未知操作');
})}
window.GXStorage={read,mutate};

const cache = Object.create(null), pending = new Map();
let queue = Promise.resolve();
function warning() {
  let el = document.getElementById('storage-warning');
  if (!el) { el = document.createElement('div'); el.id = 'storage-warning'; el.setAttribute('role', 'alert'); document.body.prepend(el); }
  el.textContent = '设置或草稿保存失败，请检查连接并重新操作。';
}
function persist(key, value) {
  queue = queue.catch(() => {}).then(() => value === null
    ? sql('DELETE FROM gx_preferences WHERE key = ?', [text(key)])
    : sql('INSERT INTO gx_preferences (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [text(key), text(value)])
  ).catch(warning);
}
export async function initPreferences() {
  const r = await sql('SELECT key, value FROM gx_preferences');
  for (const row of r.rows || []) cache[row[0].value] = row[1].value;
}
window.GXPreferences = {
  getItem(key) { return cache[key] ?? null; },
  setItem(key, value) { cache[key] = String(value); clearTimeout(pending.get(key)); pending.set(key, setTimeout(() => { pending.delete(key); persist(key, cache[key]); }, 300)); },
  removeItem(key) { delete cache[key]; clearTimeout(pending.get(key)); pending.delete(key); persist(key, null); }
};
