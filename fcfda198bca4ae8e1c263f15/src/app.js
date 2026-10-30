import css from "./style.css";
import {createTianaFetch} from "@tianacloud/serverless";
export async function mount(root, {files}) {
if (!files || !window.tiana?.auth?.getAccessToken) { root.textContent="应用服务尚未就绪"; return; }
const conn=await window.tiana.connection();
if(conn.sql_api!=="hrana-v3") {root.textContent="数据库连接方式不受支持"; return;}
const http=createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:"buffered"});
async function sql(sql,args=[]) { const r=await http(`${conn.origin}/v3/pipeline`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({requests:[{type:"execute",stmt:{sql,args,want_rows:true}},{type:"close"}]})}); if(!r.ok) throw Error("数据库请求未确认"); const v=(await r.json()).results?.[0]; if(v?.type!=="ok" || v.response?.type!=="execute") throw Error("数据库操作未确认"); return v.response.result; }
const urls=new Map();
async function resolve(path) {if(!path)return ""; if(urls.has(path))return urls.get(path); const response=await files.get(path); if(!response.ok)throw Error("照片读取失败"); const url=URL.createObjectURL(await response.blob()); urls.set(path,url); return url;}
function imageBlob(url) {const match=/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(url);if(!match)throw Error('图片格式不正确');const raw=atob(match[2]);const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return new Blob([bytes],{type:match[1]});}
async function upload(blob) { const path=`photos/${crypto.randomUUID()}.jpg`; let uploadId; try {await files.put(path,blob,{onPrepared:r=>{uploadId=r.id;}}); await resolve(path); return path;} catch(e) {console.error('照片上传失败',e?.code||e?.name||'unknown');if(uploadId) {try {const status=await files.uploadStatus(uploadId); console.warn("照片上传状态需核对",status?.status || "unknown");} catch(_) {}} root.style.pointerEvents="none"; toast("照片上传结果未确认，请重新打开检查"); throw e;} }
async function hydrate(data) {await Promise.all([data.male?.avatar,data.female?.avatar,...(data.memories||[]).flatMap(m=>m.images||[])].filter(Boolean).map(resolve));}
function imageUrl(path){return urls.get(path)||"";}
async function dataURL(path) {if(!path)return ""; const response=await files.get(path);if(!response.ok)throw Error("照片读取失败");const blob=await response.blob();return await new Promise((ok,fail)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=fail;r.readAsDataURL(blob);});}
async function exportState() {const copy=structuredClone(state);copy.male.avatar=await dataURL(copy.male.avatar);copy.female.avatar=await dataURL(copy.female.avatar);for(const m of copy.memories)m.images=await Promise.all((m.images||[]).map(dataURL));return copy;}
async function importState(data) {if(!data || typeof data!=="object" || !data.male || !data.female || !Array.isArray(data.memories) || data.memories.some(m=>!m || !Array.isArray(m.images||[]))) throw Error("备份格式不正确");const copy=structuredClone(data);async function convert(v){if(!v)return "";if(!/^data:image\//.test(v))throw Error("备份图片格式不正确");return upload(imageBlob(v));} copy.male.avatar=await convert(copy.male.avatar);copy.female.avatar=await convert(copy.female.avatar);for(const m of copy.memories)m.images=await Promise.all((m.images||[]).map(convert));return copy;}
const style=document.createElement("style");style.textContent=css;document.head.appendChild(style);
root.innerHTML="\n<div class=\"wrap\">\n  <header class=\"topbar\">\n    <div class=\"brand\"><span class=\"dot\"></span>我们的恋爱记录</div>\n    <div class=\"top-actions\">\n      <button class=\"btn-ghost\" id=\"btnAdd\">＋ 记录回忆</button>\n      <button class=\"btn-ghost\" id=\"btn短片\">🎬 回忆短片</button>\n      <button class=\"btn-ghost\" id=\"btnBackup\">💾 备份/导入</button>\n      <button class=\"btn-danger\" id=\"btnClear\">🗑 清空重来</button>\n    </div>\n  </header>\n\n  <!-- 情侣头部 -->\n  <section class=\"hero\">\n    <div class=\"person male\">\n      <div class=\"avatar-box\">\n        <div class=\"ring\"><img alt=\"男\" class=\"avatar\" id=\"avMale\" src></div>\n        <div class=\"avatar-edit\" data-side=\"male\">📷</div>\n      </div>\n      <div class=\"name\"><input class=\"name-input\" id=\"nmMale\" maxlength=\"12\" placeholder=\"男生昵称\"></div>\n    </div>\n    <div class=\"center-heart\">\n      <div class=\"heart\">💗</div>\n      <div class=\"days-big\" id=\"daysBig\">0</div>\n      <div class=\"days-label\" id=\"daysLabel\">相恋天数</div>\n    </div>\n    <div class=\"person female\">\n      <div class=\"avatar-box\">\n        <div class=\"ring\"><img alt=\"女\" class=\"avatar\" id=\"avFemale\" src></div>\n        <div class=\"avatar-edit\" data-side=\"female\">📷</div>\n      </div>\n      <div class=\"name\"><input class=\"name-input\" id=\"nmFemale\" maxlength=\"12\" placeholder=\"女生昵称\"></div>\n    </div>\n  </section>\n\n  <!-- 数据卡 -->\n  <section class=\"stats\">\n    <div class=\"stat\">\n      <div class=\"num\" id=\"stTogether\">—</div>\n      <div class=\"lab\">恋爱天数</div>\n      <div class=\"edithint\" data-edit=\"anniversary\">设置纪念日</div>\n    </div>\n    <div class=\"stat\">\n      <div class=\"num\" id=\"stMet\">—</div>\n      <div class=\"lab\">相识天数</div>\n      <div class=\"edithint\" data-edit=\"firstMet\">设置相识日</div>\n    </div>\n    <div class=\"stat\">\n      <div class=\"num\" id=\"stCount\">0</div>\n      <div class=\"lab\">回忆片段</div>\n      <div class=\"edithint\" id=\"addFromStat\" style=\"cursor:pointer; color:var(--pink)\">＋ 添加</div>\n    </div>\n  </section>\n\n  <!-- 回忆时间线 -->\n  <div class=\"section-title\">\n    <h2>💞 恋爱回忆</h2>\n    <span class=\"hint\">按时间倒序 · 点击图片可放大</span>\n  </div>\n  <div class=\"timeline\" id=\"timeline\"></div>\n\n  <footer class=\"foot\">数据保存在应用中 · 可随时导出备份 💛</footer>\n</div>\n\n<!-- 添加回忆弹窗 -->\n<div class=\"mask\" id=\"maskAdd\">\n  <div class=\"modal\">\n    <h3>记录一段恋爱回忆</h3>\n    <div class=\"field\">\n      <label>选择类型</label>\n      <div class=\"type-grid\" id=\"typeGrid\"></div>\n    </div>\n    <div class=\"field\">\n      <label>标题</label>\n      <input id=\"mTitle\" maxlength=\"30\" placeholder=\"例如：第一次一起看海\" type=\"text\">\n    </div>\n    <div class=\"field\">\n      <label>日期</label>\n      <input id=\"mDate\" type=\"date\">\n    </div>\n    <div class=\"field\">\n      <label>小记</label>\n      <textarea id=\"mDesc\" placeholder=\"写下那一刻的心情吧～\"></textarea>\n    </div>\n    <div class=\"field\">\n      <label>照片（可多张）</label>\n      <div class=\"upload-zone\" id=\"uploadZone\">点击或拖拽上传图片</div>\n      <input accept=\"image/*\" hidden id=\"fileInput\" multiple type=\"file\">\n      <div class=\"preview-imgs\" id=\"previewImgs\"></div>\n    </div>\n    <div class=\"modal-actions\">\n      <button class=\"btn-ghost\" id=\"mCancel\">取消</button>\n      <button class=\"btn-blue\" id=\"mSave\">保存回忆</button>\n    </div>\n  </div>\n</div>\n\n<!-- 日期设置弹窗 -->\n<div class=\"mask\" id=\"maskDate\">\n  <div class=\"modal\">\n    <h3 id=\"dateTitle\">设置日期</h3>\n    <div class=\"field\">\n      <label id=\"dateLabel\">选择日期</label>\n      <input id=\"dateInput\" type=\"date\">\n    </div>\n    <div class=\"modal-actions\">\n      <button class=\"btn-ghost\" id=\"dateCancel\">取消</button>\n      <button class=\"btn-blue\" id=\"dateSave\">保存</button>\n    </div>\n  </div>\n</div>\n\n<!-- 备份导入弹窗 -->\n<div class=\"mask\" id=\"maskBackup\">\n  <div class=\"modal\">\n    <h3>备份 / 导入数据</h3>\n    <p style=\"font-size:13px; color:var(--muted); margin-bottom:14px\">导出会把所有信息保存成一个文件，换电脑或清缓存前记得备份；导入可还原之前的备份。</p>\n    <div class=\"field\">\n      <button class=\"btn-blue\" id=\"exportBtn\" style=\"width:100%\">⬇ 导出备份文件（.json）</button>\n    </div>\n    <div class=\"field\">\n      <label style=\"margin-bottom:8px\">从备份文件导入</label>\n      <input accept=\"application/json,.json\" hidden id=\"importInput\" type=\"file\">\n      <button class=\"btn-ghost\" id=\"importPick\" style=\"width:100%\">⬆ 选择备份文件导入</button>\n    </div>\n    <div class=\"modal-actions\">\n      <button class=\"btn-ghost\" id=\"backupCancel\">关闭</button>\n    </div>\n  </div>\n</div>\n\n<div class=\"lightbox\" id=\"lightbox\"><button class=\"close\" id=\"lbClose\">×</button><img id=\"lbImg\" src></div>\n<div class=\"toast\" id=\"toast\"></div>\n<input accept=\"image/*\" hidden id=\"avatarInput\" type=\"file\">\n\n";
/* ============ 数据层 ============ */

const TYPES=[
  {k:'meet',e:'🤝',t:'第一次见面',cls:''},
  {k:'eat',e:'🍜',t:'第一次吃饭',cls:'type-eat'},
  {k:'pet',e:'🐱',t:'共同养宠物',cls:'type-pet'},
  {k:'newyear',e:'🎆',t:'一起跨年',cls:'type-newyear'},
  {k:'travel',e:'✈️',t:'第一次旅行',cls:'type-travel'},
  {k:'confess',e:'💕',t:'告白那天',cls:'type-confess'},
  {k:'propose',e:'💍',t:'求婚时刻',cls:'type-propose'},
  {k:'star',e:'⭐',t:'其他回忆',cls:''},
];
const typeMap=Object.fromEntries(TYPES.map(t=>[t.k,t]));

function load(){return {male:{name:'',avatar:''},female:{name:'',avatar:''},anniversary:'',firstMet:'',memories:[]};}
let state=load(); let revision=0;
try {const result=await sql('SELECT data, revision FROM diary_state WHERE id = 1');if(!result.rows?.length) throw Error('数据库尚未初始化'); state=JSON.parse(result.rows[0][0].value); revision=Number(result.rows[0][1].value);await hydrate(state);} catch(e) {root.textContent='读取失败，请刷新重试：'+e.message;return;}
function paths(data){return new Set([data.male?.avatar,data.female?.avatar,...(data.memories||[]).flatMap(m=>m.images||[])].filter(Boolean));}
let persistedPaths=paths(state);
let queue=Promise.resolve(); let saveFailed=false; let uploads=0;
function save(){const value=JSON.stringify(state);queue=queue.then(async()=>{if(saveFailed)return;try{const result=await sql('UPDATE diary_state SET data=?, revision=revision+1 WHERE id=1 AND revision=?',[{type:'text',value},{type:'integer',value:String(revision)}]);if(result.affected_row_count!==1)throw Error('并发修改或保存结果未知');revision++;const nextPaths=paths(JSON.parse(value));const removed=[...persistedPaths].filter(path=>!nextPaths.has(path));persistedPaths=nextPaths;for(const path of removed){try{await files.delete(path);const url=urls.get(path);if(url)URL.revokeObjectURL(url);urls.delete(path);}catch(e){toast('记录已保存，但旧照片清理未确认');}}}catch(e){saveFailed=true;root.style.pointerEvents='none';toast('保存未确认或发生冲突，请重新打开检查');}});}

/* ============ 工具 ============ */
function $(id){return document.getElementById(id);}
function toast(msg){
  const t=$('toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1800);
}
function daysBetween(a,b){ // a,b: yyyy-mm-dd
  if(!a||!b) return null;
  const d1=new Date(a+'T00:00:00'),d2=new Date(b+'T00:00:00');
  return Math.round((d2-d1)/86400000);
}
function today(){return new Date().toISOString().slice(0,10);}
function fmtDate(s){if(!s)return'';const[y,m,d]=s.split('-');return `${y}年${+m}月${+d}日`;}

/* ============ 渲染 ============ */
function render(){
  $('nmMale').value=state.male.name||'';
  $('nmFemale').value=state.female.name||'';
  setAvatar('avMale',state.male.avatar,'👦');
  setAvatar('avFemale',state.female.avatar,'👧');

  const t=today();
  const together=daysBetween(state.anniversary,t);
  const met=daysBetween(state.firstMet,t);
  $('daysBig').textContent=together!=null&&together>=0?together:0;
  $('stTogether').textContent=together!=null&&together>=0?together+' 天':'未设置';
  $('stMet').textContent=met!=null&&met>=0?met+' 天':'未设置';
  $('stMet').title=state.firstMet?fmtDate(state.firstMet):'';
  $('stCount').textContent=state.memories.length;

  renderTimeline();
}
function setAvatar(id,src,placeholder){
  const el=$(id);
  if(src){el.src=imageUrl(src);el.style.color='transparent';}
  else{el.removeAttribute('src');el.alt=placeholder;el.style.color='';}
}
function renderTimeline(){
  const box=$('timeline');
  if(!state.memories.length){
    box.innerHTML=`<div class="empty"><div class="big">📖</div>还没有回忆，点右上角「＋ 记录回忆」写下第一个故事吧～</div>`;
    return;
  }
  const list=[...state.memories].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  box.innerHTML=list.map(m=>{
    const ty=typeMap[m.type]||{e:'⭐',t:'回忆',cls:''};
    const imgs=(m.images||[]).map(src=>`<img src="${imageUrl(src)}" data-full="${imageUrl(src)}" alt="">`).join('');
    return `<div class="mem ${ty.cls}">
      <div class="mem-head">
        <div class="mem-emoji">${escapeHtml(m.customEmoji||ty.e)}</div>
        <div class="mem-title">${escapeHtml(m.title||ty.t)}</div>
        <div class="mem-date">${m.date?fmtDate(m.date):''}</div>
        <button class="mem-del" data-del="${escapeHtml(String(m.id))}">删除</button>
      </div>
      ${m.desc?`<div class="mem-desc">${escapeHtml(m.desc)}</div>`:''}
      ${imgs?`<div class="mem-imgs">${imgs}</div>`:''}
    </div>`;
  }).join('');
}
function escapeHtml(s){return (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

/* ============ 头像上传 ============ */
document.querySelectorAll('.avatar-edit').forEach(btn=>{
  btn.addEventListener('click',()=>{$('avatarInput').dataset.side=btn.dataset.side;$('avatarInput').click();});
});
$('avatarInput').addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;
  compressImage(f,400,0.85,async b64=>{
    try {const path=await upload(imageBlob(b64));
    const side=$('avatarInput').dataset.side;
    state[side].avatar=path;save();render();toast('正在保存头像');} catch(e){toast('头像上传未确认，请检查后重试');}
  });
});
$('nmMale').addEventListener('input',e=>{state.male.name=e.target.value;save();});
$('nmFemale').addEventListener('input',e=>{state.female.name=e.target.value;save();});

/* ============ 图片压缩 ============ */
function compressImage(file,maxW,quality,cb,onError=()=>toast("图片无法读取")){
  const reader=new FileReader();
  reader.onerror=onError;
  reader.onload=ev=>{
    const img=new Image();
    img.onerror=onError;
    img.onload=()=>{
      let {width,height}=img;
      if(width>maxW){height=Math.round(height*maxW/width);width=maxW;}
      const cv=document.createElement('canvas');cv.width=width;cv.height=height;
      cv.getContext('2d').drawImage(img,0,0,width,height);
      cb(cv.toDataURL('image/jpeg',quality));
    };
    img.src=ev.target.result;
  };
  reader.readAsDataURL(file);
}

/* ============ 添加回忆 ============ */
let curType='meet';let curCustomEmoji=null;let pendingImgs=[];
function buildTypeGrid(){
  $('typeGrid').innerHTML=TYPES.map((t,i)=>
    `<div class="type-chip ${i===0?'sel':''} ${t.k==='star'?'custom':''}" data-k="${t.k}">
       <span class="e">${t.e}</span>${t.t}
     </div>`).join('');
  $('typeGrid').querySelectorAll('.type-chip').forEach(c=>{
    c.addEventListener('click',()=>{
      $('typeGrid').querySelectorAll('.type-chip').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');curType=c.dataset.k;curCustomEmoji=null;
      const ty=typeMap[curType];$('mTitle').value=ty.t;
    });
  });
}
$('btnAdd').addEventListener('click',openAdd);
$('addFromStat').addEventListener('click',openAdd);
function openAdd(){
  curType='meet';curCustomEmoji=null;pendingImgs=[];
  buildTypeGrid();
  $('typeGrid').querySelector('.type-chip').classList.add('sel');
  $('mTitle').value='第一次见面';
  $('mDate').value=today();
  $('mDesc').value='';
  $('previewImgs').innerHTML='';
  $('maskAdd').classList.add('show');
}
$('mCancel').addEventListener('click',()=>$('maskAdd').classList.remove('show'));
$('uploadZone').addEventListener('click',()=>$('fileInput').click());
$('uploadZone').addEventListener('dragover',e=>{e.preventDefault();$('uploadZone').style.borderColor='var(--blue)';});
$('uploadZone').addEventListener('dragleave',()=>$('uploadZone').style.borderColor='');
$('uploadZone').addEventListener('drop',e=>{e.preventDefault();handleFiles(e.dataTransfer.files);});
$('fileInput').addEventListener('change',e=>handleFiles(e.target.files));
function handleFiles(files){
  [...files].forEach(f=>{
    uploads++; compressImage(f,1000,0.8,async b64=>{try {pendingImgs.push(await upload(imageBlob(b64)));renderPreview();}catch(e){toast('照片上传未确认，请检查后重试');}finally{uploads--;}},()=>{uploads--;toast('图片无法读取');});
  });
}
function renderPreview(){
  $('previewImgs').innerHTML=pendingImgs.map((s,i)=>
    `<div class="pv"><img src="${imageUrl(s)}"><button class="x" data-i="${i}">×</button></div>`).join('');
  $('previewImgs').querySelectorAll('.x').forEach(b=>{
    b.addEventListener('click',()=>{pendingImgs.splice(+b.dataset.i,1);renderPreview();});
  });
}
$('mSave').addEventListener('click',()=>{
  if(uploads){toast('照片上传中，请稍候');return;}
  const title=$('mTitle').value.trim()||typeMap[curType].t;
  const date=$('mDate').value;
  if(!date){toast('请选择日期');return;}
  state.memories.push({
    id:'m'+Date.now()+Math.random().toString(36).slice(2,6),
    type:curType,title,date,desc:$('mDesc').value.trim(),
    images:[...pendingImgs],customEmoji:curCustomEmoji
  });
  save();render();$('maskAdd').classList.remove('show');toast('正在保存回忆');
});

/* 删除回忆 */
$('timeline').addEventListener('click',e=>{
  const del=e.target.dataset.del;
  if(del){
    if(confirm('确定删除这段回忆吗？')){
      state.memories=state.memories.filter(m=>m.id!==del);save();render();toast('正在保存删除操作');
    }
    return;
  }
  const full=e.target.dataset.full;
  if(full){$('lbImg').src=full;$('lightbox').classList.add('show');}
});
$('lbClose').addEventListener('click',()=>$('lightbox').classList.remove('show'));
$('lightbox').addEventListener('click',e=>{if(e.target.id==='lightbox')$('lightbox').classList.remove('show');});

/* ============ 日期设置 ============ */
document.querySelectorAll('.edithint[data-edit]').forEach(h=>{
  h.addEventListener('click',()=>{
    const which=h.dataset.edit;
    $('dateTitle').textContent=which==='anniversary'?'设置「在一起」纪念日':'设置「相识」日期';
    $('dateLabel').textContent=which==='anniversary'?'从这一天起正式在一起 💍':'记得最初相遇的那天 👀';
    $('dateInput').value=state[which]||'';
    $('dateSave').dataset.which=which;
    $('maskDate').classList.add('show');
  });
});
$('dateCancel').addEventListener('click',()=>$('maskDate').classList.remove('show'));
$('dateSave').addEventListener('click',()=>{
  const which=$('dateSave').dataset.which;
  state[which]=$('dateInput').value;save();render();
  $('maskDate').classList.remove('show');toast('正在保存日期');
});

/* ============ 备份 / 导入 ============ */
$('btnBackup').addEventListener('click',()=>$('maskBackup').classList.add('show'));
$('backupCancel').addEventListener('click',()=>$('maskBackup').classList.remove('show'));
$('exportBtn').addEventListener('click',async ()=>{
  let data;try {data=await exportState();} catch(e){toast('照片读取失败，无法导出');return;}
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  const name=`恋爱记录备份_${today()}.json`;
  a.href=URL.createObjectURL(blob);a.download=name;a.click();
  URL.revokeObjectURL(a.href);toast('备份已导出 💾');
});
$('importPick').addEventListener('click',()=>$('importInput').click());
$('importInput').addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=async ev=>{
    try{
      const data=JSON.parse(ev.target.result);
      if(!confirm('导入会覆盖当前数据，确定继续吗？'))return;
      state=await importState(Object.assign(load(),data));save();render();
      $('maskBackup').classList.remove('show');toast('正在保存导入的数据');
    }catch(err){toast('导入失败，请检查备份及上传状态');}
  };
  r.readAsText(f);
});

/* ============ 清空重来 ============ */
$('btnClear').addEventListener('click',()=>{
  if(confirm('⚠️ 将清空所有信息、头像和回忆，且无法恢复（除非已备份）。确定吗？')){
    if(confirm('再确认一次：真的要清空重来吗？')){
      state=load();state.memories=[];state.male={name:'',avatar:''};state.female={name:'',avatar:''};
      state.anniversary='';state.firstMet='';save();render();toast('正在保存清空操作');
    }
  }
});

/* ============ 回忆短片（独立可分享 HTML） ============ */
$('btn短片').addEventListener('click',async ()=>{
  if(!state.memories.length){toast('还没有回忆可以做成短片哦');return;}
  let data;try {data=await exportState();}catch(e){toast('照片读取失败，无法生成短片');return;}
  const html=buildSlideshow(data);
  const blob=new Blob([html],{type:'text/html'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=`回忆短片_${today()}.html`;a.click();
  URL.revokeObjectURL(a.href);toast('回忆短片已生成 🎬 用浏览器打开即可播放');
});
function buildSlideshow(state){
  const m=state.male.name||'他',f=state.female.name||'她';
  const list=[...state.memories].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  const slides=list.map(x=>{
    const ty=typeMap[x.type]||{e:'⭐',t:'回忆'};
    const imgs=(x.images||[]).map(s=>`<div class="ph"><img src="${s}"></div>`).join('');
    return `<section class="slide"><div class="emoji">${escapeHtml(x.customEmoji||ty.e)}</div>
      <h2>${escapeHtml(x.title||ty.t)}</h2>
      <p class="dt">${x.date?fmtDate(x.date):''}</p>
      ${x.desc?`<p class="desc">${escapeHtml(x.desc)}</p>`:''}
      ${imgs?`<div class="photos">${imgs}</div>`:''}</section>`;
  }).join('');
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(m)} & ${escapeHtml(f)} 的回忆短片</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:#11131a;color:#fff;overflow:hidden}
.slide{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;
  padding:40px;text-align:center;background:radial-gradient(900px 500px at 50% 30%,rgba(74,144,226,.25),transparent),radial-gradient(900px 500px at 50% 80%,rgba(255,107,157,.25),transparent),#11131a;animation:fade .8s ease}
.slide.on{display:flex}
@keyframes fade{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:none}}
.emoji{font-size:64px;margin-bottom:14px;animation:beat 1.6s infinite}
@keyframes beat{0%,100%{transform:scale(1)}30%{transform:scale(1.12)}}
.slide h2{font-size:30px;margin-bottom:8px}
.dt{color:#ffd2e2;font-weight:600;margin-bottom:14px}
.desc{color:#cfd2dc;max-width:560px;white-space:pre-wrap;line-height:1.7}
.photos{display:flex;gap:12px;margin-top:22px;flex-wrap:wrap;justify-content:center}
.ph img{width:200px;height:200px;object-fit:cover;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.4)}
.hud{position:fixed;left:0;right:0;bottom:18px;text-align:center;color:#9aa;font-size:13px;z-index:5}
.bar{position:fixed;top:0;left:0;height:4px;background:linear-gradient(90deg,#4a90e2,#ff6b9d);z-index:5;transition:width .4s}
.titlecard{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;z-index:3}
.titlecard h1{font-size:40px;background:linear-gradient(135deg,#7db4f0,#ffa6c4);-webkit-background-clip:text;background-clip:text;color:transparent}
.titlecard p{color:#cfd2dc;margin-top:10px}
</style></head><body>
<div class="bar" id="bar"></div>
<div class="titlecard" id="tc"><h1>${escapeHtml(m)} ❤ ${escapeHtml(f)}</h1><p>我们的恋爱回忆短片 · 共 ${list.length} 段</p></div>
${slides}
<div class="hud">空格/→ 下一页 · ← 上一页 · 点击切换</div>
<script>
var s=document.querySelectorAll('.slide'),i=-1,tc=document.getElementById('tc'),bar=document.getElementById('bar');
function show(n){if(n<0){i=-1;tc.style.display='flex';s.forEach(x=>x.classList.remove('on'));bar.style.width='0';return;}
 tc.style.display='none';if(n>=s.length){i=s.length-1;return;}i=n;s.forEach(x=>x.classList.remove('on'));s[i].classList.add('on');
 bar.style.width=((i+1)/s.length*100)+'%';}
function next(){show(i+1);}function prev(){if(i<0)return;show(i-1);}
document.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowRight'){e.preventDefault();next();}
 if(e.code==='ArrowLeft')prev();});
document.body.addEventListener('click',e=>{if(e.target.tagName!=='IMG')next();});
setTimeout(function(){tc.addEventListener('click',next);},300);
<\/script></body></html>`;
}

/* ============ 初始化 ============ */
render();

return ()=>{urls.forEach(URL.revokeObjectURL);style.remove();};
}
