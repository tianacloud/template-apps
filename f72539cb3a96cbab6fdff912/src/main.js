import styles from './styles.css?inline';
import {sql} from './sql.js';
export async function mount(root, {files}) {
const urls=[];
try {
async function asset(path){const response=await files.get('template-assets/'+path);if(!response.ok)throw new Error('素材读取失败');const url=URL.createObjectURL(await response.blob());urls.push(url);return url;}
window.__GATE_SRC=await asset('gate.jpg');
const fontResponse=await files.get('template-assets/bei.woff');
if(!fontResponse.ok)throw new Error('字体读取失败');
const font=new FontFace('BeiTi',await fontResponse.arrayBuffer());
document.fonts.add(await font.load());
const style=document.createElement('style');style.textContent=styles.replace(/@font-face\s*\{[^{}]*__BEI_FONT__[^{}]*\}/,'');document.head.appendChild(style);
const app=root;app.innerHTML='<div class="scr-open" id="p-gate"></div><div class="scr-gate hide" id="p-home"></div><div class="scr-roster hide" id="p-roster"></div><div class="scr-quiz hide" id="p-quiz"></div><div class="scr-quiz hide" id="p-bridge"></div><div class="scr-res hide" id="p-result"></div><div class="scr-board hide" id="p-board"></div><div class="scr-poster hide" id="p-poster"></div>';
const R='celingbei_roster_v1', B='celingbei_records_v2', C='celingbei_current_v1';
let selected='';
let cache={[R]:[],[B]:{},[C]:selected}, queue=Promise.resolve(), failed=false;
const copy=x=>JSON.parse(JSON.stringify(x));
function enqueue(fn) { queue=queue.then(fn).catch(e=>{failed=true;console.error(e);alert('保存结果未确认，请重新打开应用检查数据。');}); }
function map(key,v){if(key===R)return Object.fromEntries((v||[]).map(x=>[x.id,x]));if(key===B)return v||{};return {};}
function set(key,val) {
 if(key===C){cache[C]=val;return;}
 if(key!==R&&key!==B)return;
 const old=map(key,cache[key]), next=map(key,val), table=key===R?'members':'records';
 cache[key]=copy(val);
 for(const id of Object.keys(old))if(!(id in next))enqueue(()=>sql(`DELETE FROM ${table} WHERE id=?`,[id]));
 for(const [id,value] of Object.entries(next))if(JSON.stringify(old[id])!==JSON.stringify(value)) {
   const payload=JSON.stringify(value);
   if(key===B) enqueue(()=>sql(`INSERT INTO records(id,payload) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET payload=CASE WHEN CAST(json_extract(excluded.payload,'$.score') AS REAL)>CAST(json_extract(records.payload,'$.score') AS REAL) OR json_extract(excluded.payload,'$.total')!=json_extract(records.payload,'$.total') THEN json_set(excluded.payload,'$.tries',COALESCE(json_extract(records.payload,'$.tries'),1)+1,'$.prev',json_extract(records.payload,'$.score')) ELSE json_set(records.payload,'$.tries',COALESCE(json_extract(records.payload,'$.tries'),1)+1,'$.prev',json_extract(excluded.payload,'$.score'),'$.lastTs',json_extract(excluded.payload,'$.ts'),'$.duration',json_extract(excluded.payload,'$.duration')) END`,[id,payload]));
   else enqueue(()=>sql('INSERT INTO members(id,payload) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload',[id,payload]));
 }
}
window.wx={getStorageSync:k=>cache[k]===undefined?'':copy(cache[k]),setStorageSync:set,removeStorageSync:k=>set(k,k===R?[]:{}),getStorageInfoSync:()=>({keys:Object.keys(cache)})};
async function refresh(){await queue;if(failed)throw Error('保存结果未确认');const [members,records]=await Promise.all([sql('SELECT id,payload FROM members'),sql('SELECT id,payload FROM records')]);cache[R]=members.rows.map(x=>JSON.parse(x.payload));cache[B]=Object.fromEntries(records.rows.map(x=>[x.id,JSON.parse(x.payload)]));}
try {
 await refresh();
 let replay=false, busy=false;
 document.addEventListener('click',async e=>{
  if(replay)return;
  const target=e.target.closest?.('[data-act]'); if(!target)return;
  const action=target.getAttribute('data-act');
  if(!['enter','roster','board','pick-member','add-member','edit-member','save-member','del-member','wipe'].includes(action))return;
  e.stopImmediatePropagation();e.preventDefault();if(busy)return;busy=true;
  try{await refresh();if(target.isConnected){replay=true;target.click();replay=false;await queue;}}catch(err){alert('数据连接未就绪，请重新打开应用检查。');}finally{replay=false;busy=false;}
 },true);
 await import('./original.js');
} catch(error) {app.innerHTML='<p style="padding:2em">数据连接未就绪，请刷新后重试。</p>';console.error(error);}

return () => { style.remove(); document.fonts.delete(font); urls.forEach(URL.revokeObjectURL); root.innerHTML=''; };
} catch(error) { urls.forEach(URL.revokeObjectURL); root.textContent='素材或数据加载失败，请刷新后重试。'; console.error(error); }
}
