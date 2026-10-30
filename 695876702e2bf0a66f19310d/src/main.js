import {StableWrite} from './save.js';
import {sql} from './db.js';
import {mountEngine} from './engine.js';
import markup from './ui.html';
import css from './style.css';
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:css}));
document.querySelector('#app').innerHTML=markup;
for (const [index, image] of document.querySelectorAll('#kart-cards .kart-img').entries()) image.src = Object.values(window.__kartImages)[index];
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const format=n=>n==null?'未完赛':Math.floor(n/60000)+':'+((n%60000)/1000).toFixed(3).padStart(6,'0');
const tracks={silverstone:'银石湾',neon:'星港城',circuit:'银石湾',city:'星港城'};
let round=null,pending=false,loadRevision=0;
const writes=new WeakMap();
async function load(){
 const version=++loadRevision;
 $('records-status').textContent='正在连接个人成绩…';
 try{
  const rows=await sql('SELECT track,kart,rank,time_ms,created_at FROM race_records ORDER BY created_at DESC LIMIT 30');
  if(version!==loadRevision)return;
  $('records-body').innerHTML=rows.map(r=>`<tr><td>${esc(r.created_at.slice(0,16))}</td><td>${esc(tracks[r.track]||r.track)}</td><td>${esc(r.kart)}</td><td>${esc(r.rank)}</td><td>${esc(format(r.time_ms===null?null:+r.time_ms))}</td></tr>`).join('')||'<tr><td colspan="5">尚无已保存成绩</td></tr>';
  $('records-status').textContent='个人成绩已连接';
 }catch(e){if(version===loadRevision)$('records-status').textContent=e.message}
}
function setPending(value){pending=value;['save-result','btn-again','btn-menu','btn-start','btn-quit'].forEach(id=>$(id).disabled=value)}
async function save(){
 if(pending||!round)return;
 const snapshot=round;
 if(snapshot.write.saved){$('result-upload').textContent='本局成绩已保存';return}
 setPending(true);$('result-upload').textContent='正在保存本局成绩…';
 try{
  await snapshot.write.run(sql);
  if(round===snapshot){$('result-upload').textContent='本局成绩已保存';$('save-result').textContent='成绩已保存'}
 }catch(e){if(round===snapshot)$('result-upload').textContent=e.message}
 finally{setPending(false);if(round===snapshot)$('save-result').disabled=snapshot.write.saved}
}
const hooks={
 isPending:()=>pending,
 openHistory(){
  ['menu','result','pause','board'].forEach(n=>$('screen-'+n).classList.toggle('hidden',n!=='board'));load();
 },
 finished(r,settings){
  if(!writes.has(r)){
   const me=r.playerResult;
   const result=r.results.map(x=>({rank:x.rank,name:x.name,kart:x.kart,time:x.time,bestLap:x.bestLap,grade:x.grade,points:x.points,dnf:x.dnf}));
   const values=[settings.trackId,settings.mode,settings.kartId,me.rank,me.time==null?null:Math.round(me.time*1000),JSON.stringify(result),new Date().toISOString()];
   const write=new StableWrite({read:'SELECT id FROM race_records WHERE id=?',insert:'INSERT OR IGNORE INTO race_records(id,track,mode,kart,rank,time_ms,result,created_at) VALUES(?,?,?,?,?,?,?,?)',args:id=>[id,...values]});
   writes.set(r,{write});
  }
  round=writes.get(r);$('save-result').disabled=round.write.saved;$('save-result').textContent=round.write.saved?'成绩已保存':'保存本局成绩';$('result-upload').textContent=round.write.saved?'本局成绩已保存':'可将本局成绩保存到个人历史';
 }
};
mountEngine(hooks, window.__kartImages);
$('save-result').onclick=save;
$('records-refresh').onclick=load;
$('board-close').onclick=()=>$('btn-menu').click();
