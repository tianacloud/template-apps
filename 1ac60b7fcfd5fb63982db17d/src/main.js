import {StableWrite} from './save.js';
import {sql} from './db.js';
import {mountCubeUI} from './cube-ui.js';
import markup from './ui.html';
import css from './style.css';

document.head.appendChild(Object.assign(document.createElement('style'),{textContent:css}));
const app=document.querySelector('#app');
app.innerHTML=markup+`<details id="personal-library"><summary>个人公式与练习记录</summary><div class="library-content"><label>公式名称<input id="formula-name" maxlength="60" placeholder="例如：入门练习"></label><div class="library-actions"><button id="save-formula">保存输入框公式</button><button id="save-session">保存本次练习</button><button id="refresh">刷新记录</button></div><p id="library-status" role="status">正在连接个人公式库…</p><h2>已保存公式</h2><div id="formula-list"></div><h2>练习记录</h2><div id="session-list"></div></div></details>`;
const settingQueues = new Map();
function saveSetting(key, value) {
 const previous = settingQueues.get(key) || Promise.resolve();
 const next = previous.catch(()=>{}).then(()=>sql('INSERT INTO cube_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,value]));
 settingQueues.set(key,next);
 next.catch(()=>msg('设置保存未确认，请检查连接后重新选择设置。'));
}
const ui=mountCubeUI({saveSetting});
async function loadSettings(){try{const rows=await sql('SELECT key,value FROM cube_settings');ui.applySettings(Object.fromEntries(rows.map(row=>[row.key,row.value])))}catch{msg('设置读取失败，请检查连接后刷新。')}}

const formulaWrites=new Map(),sessionWrites=new Map();
let formulas=[],saveBusy=false,loadRevision=0;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const msg=s=>{document.querySelector('#library-status').textContent=s};
function setSaveBusy(value){saveBusy=value;document.querySelectorAll('#save-formula,#save-session').forEach(e=>{e.disabled=value});}
async function load(){
 const revision=++loadRevision;
 try{
  const [saved,history]=await Promise.all([sql('SELECT id,name,formula FROM cube_formulas ORDER BY updated_at DESC LIMIT 50'),sql('SELECT moves,elapsed_ms,created_at FROM cube_sessions ORDER BY created_at DESC LIMIT 20')]);
  if(revision!==loadRevision)return;
  formulas=saved;
  document.querySelector('#formula-list').innerHTML=saved.map(f=>`<button data-formula-id="${esc(f.id)}">${esc(f.name)}</button>`).join('')||'<p>尚无已保存公式</p>';
  document.querySelectorAll('[data-formula-id]').forEach(b=>b.onclick=()=>{const f=formulas.find(f=>f.id===b.dataset.formulaId);ui.loadFormula(f.formula);document.querySelector('#formula-name').value=f.name;msg('已载入公式，可点击执行查看。')});
  document.querySelector('#session-list').innerHTML=history.map(s=>`<p><time>${esc(s.created_at.slice(0,16))}</time> · ${(+s.elapsed_ms/1000).toFixed(1)}秒 · <span>${esc(s.moves)}</span></p>`).join('')||'<p>尚无练习记录</p>';
  msg('个人公式库已连接');
 }catch(e){if(revision===loadRevision)msg(e.message)}
}
document.querySelector('#save-formula').onclick=async()=>{
 if(saveBusy)return;
 try{
  const name=document.querySelector('#formula-name').value.trim(),formula=document.querySelector('#algIn').value.trim();
  const parsed=ui.validFormula(formula);
  if(!name||!parsed.out.length||parsed.bad.length)throw Error('请填写名称和完整有效的公式后保存');
  const key=JSON.stringify([name,formula]);
  if(!formulaWrites.has(key)){
   const at=new Date().toISOString();
   formulaWrites.set(key,new StableWrite({read:'SELECT id FROM cube_formulas WHERE id=?',insert:'INSERT OR IGNORE INTO cube_formulas(id,name,formula,updated_at) VALUES(?,?,?,?)',args:id=>[id,name,formula,at]}));
  }
  setSaveBusy(true);await formulaWrites.get(key).run(sql);await load();msg('公式已保存');
 }catch(e){msg(e.message)}finally{setSaveBusy(false)}
};
document.querySelector('#save-session').onclick=async()=>{
 if(saveBusy)return;
 try{
  const snapshot=ui.snapshot();
  if(snapshot.busy)throw Error('请等待当前转动与队列执行完毕');
  if(!snapshot.moves)throw Error('先完成一些走法');
  if(!sessionWrites.has(snapshot.revision)){
   const at=new Date().toISOString();
   sessionWrites.set(snapshot.revision,new StableWrite({read:'SELECT id FROM cube_sessions WHERE id=?',insert:'INSERT OR IGNORE INTO cube_sessions(id,moves,elapsed_ms,created_at) VALUES(?,?,?,?)',args:id=>[id,snapshot.moves,snapshot.elapsedMs,at]}));
  }
  setSaveBusy(true);await sessionWrites.get(snapshot.revision).run(sql);await load();
  msg(ui.snapshot().revision===snapshot.revision?'练习记录已保存':'上一份练习快照已保存；当前走法尚未保存');
 }catch(e){msg(e.message)}finally{setSaveBusy(false)}
};
document.querySelector('#refresh').onclick=load;
load();
loadSettings();
export function resetDemo(){ui.resetDemo();formulaWrites.clear();sessionWrites.clear();document.querySelector('#formula-name').value='';load();}
