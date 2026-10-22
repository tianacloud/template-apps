import "./style.css";
import "./load-style.js";
import { sql,verifiedWrite } from "./db.js";

document.title="一页便笺";
const app=document.getElementById("app");
app.innerHTML=`<header><div class="brand"><img id="brand-icon" alt="一页便笺图标"><div><p class="eyebrow">ROOM FOR THOUGHT</p><h1>一页便笺</h1><p class="intro">给想到的事，留一页空间。</p></div></div><button id="reload">重新加载</button></header><div id="status" role="status">正在读取便笺…</div><div class="layout"><aside class="panel"><div class="toolbar"><h2>我的便笺</h2><button id="new">＋ 新建</button></div><div id="entries"></div><p class="hint">最近 100 篇 · 修改后记得保存</p></aside><div class="stack"><section class="panel editor"><form id="editor"><fieldset disabled><div class="toolbar"><h2>把思绪写下来</h2><span class="hint" id="save-state">未保存</span></div><label class="label" for="title">标题</label><input id="title" type="text" maxlength="200" placeholder="给这一页起个名字" required><label class="label" for="body">正文</label><textarea id="body" placeholder="从想到的第一句话开始……"></textarea><div class="actions"><button class="primary" type="submit">保存便笺</button><button id="export" type="button">导出文本</button></div></fieldset></form></section><section class="panel attachments"><h2>附件收纳</h2><p class="hint">原文件随时取回，每个文件最多 10 MiB。</p><label class="label" for="files">选择附件</label><input id="files" type="file" multiple><div class="actions"><button id="upload">上传附件</button><button id="recover" hidden>检查未完成上传</button></div><div id="attachments"></div></section></div></div><footer>留白是为了装下更多想法。</footer>`;
const $=s=>app.querySelector(s),iconPath="../icon.png";
$("#brand-icon").src=new URL(iconPath,import.meta.url).href;
const pendingKey=`notebook-uploads-${window.tiana?.appId||"current"}`;
let entries=[],selected=null,dirty=false,busy=false,pending=[];
try{pending=JSON.parse(localStorage.getItem(pendingKey)||"[]");if(!Array.isArray(pending))pending=[];}catch{}
function status(text,error=false){$("#status").textContent=text;$("#status").classList.toggle("error",error);}
function keepPending(){localStorage.setItem(pendingKey,JSON.stringify(pending));$("#recover").hidden=!pending.length;}
function files(){if(!window.tiana?.files)throw new Error("文件服务未就绪");return window.tiana.files;}
function download(blob,name){const a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function drawEntries(){
  $("#entries").replaceChildren();
  for(const row of entries){const button=document.createElement("button"),title=document.createElement("strong"),time=document.createElement("small");button.className="entry"+(row.id===selected?" selected":"");title.textContent=row.title;time.textContent=new Date(row.updated_at).toLocaleString("zh-CN");button.append(title,time);button.onclick=()=>select(row.id);$("#entries").append(button);}
  if(!entries.length){const empty=document.createElement("p");empty.className="empty";empty.textContent="还没有便笺，写下第一件小事吧。";$("#entries").append(empty);}
}
function select(id){
  if(busy)return;
  if(dirty&&!confirm("有尚未保存的修改，仍要切换便笺吗？"))return;
  const row=entries.find(row=>row.id===id);selected=row?.id||null;dirty=false;$("#title").value=row?.title||"";$("#body").value=row?.body||"";$("#save-state").textContent=row?"已保存":"未保存";
  history.replaceState(null,"",row?`#entry/${encodeURIComponent(row.id)}`:"#new");drawEntries();
}
async function load(){
  if(busy)return;busy=true;$("#editor fieldset").disabled=true;
  try{entries=(await sql("SELECT id,title,body,updated_at FROM notebook_entries ORDER BY updated_at DESC,id LIMIT 100")).rows;drawEntries();await loadAttachments();status("已同步");}
  catch(error){console.error(error);status("读取失败，请重新加载检查连接。",true);}
  finally{busy=false;$("#editor fieldset").disabled=false;}
}
$("#editor").onsubmit=async event=>{
  event.preventDefault();if(busy)return;const row={id:selected||crypto.randomUUID(),title:$("#title").value.trim(),body:$("#body").value,updated_at:new Date().toISOString()};if(!row.title)return;
  busy=true;$("#editor fieldset").disabled=true;status("正在保存…");
  try{await verifiedWrite(()=>sql("INSERT INTO notebook_entries(id,title,body,updated_at) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,body=excluded.body,updated_at=excluded.updated_at",Object.values(row)),()=>sql("SELECT title,body,updated_at FROM notebook_entries WHERE id=?",[row.id]),result=>result.rows[0]?.title===row.title&&result.rows[0]?.body===row.body&&result.rows[0]?.updated_at===row.updated_at);selected=row.id;entries=[row,...entries.filter(item=>item.id!==row.id)].slice(0,100);dirty=false;history.replaceState(null,"",`#entry/${row.id}`);drawEntries();$("#save-state").textContent="已保存";status("便笺已保存");}
  catch(error){console.error(error);status("保存结果暂未确认，请保留内容并重新加载核对。",true);}
  finally{busy=false;$("#editor fieldset").disabled=false;}
};
for(const selector of ["#title","#body"])$(selector).oninput=()=>{dirty=true;$("#save-state").textContent="有未保存的修改";};
$("#new").onclick=()=>select(null);
$("#reload").onclick=async()=>{if(dirty&&!confirm("重新加载会放弃尚未保存的修改，继续吗？"))return;dirty=false;const id=selected;await load();select(id);};
$("#export").onclick=()=>download(new Blob([$("#title").value+"\n\n"+$("#body").value],{type:"text/plain;charset=utf-8"}),"便笺.txt");
async function loadAttachments(){
  const rows=(await sql("SELECT id,name,path,size,created_at FROM notebook_attachments ORDER BY created_at DESC,id LIMIT 100")).rows;$("#attachments").replaceChildren();
  for(const row of rows){const line=document.createElement("div"),label=document.createElement("span"),size=document.createElement("small"),button=document.createElement("button");line.className="file";label.textContent=row.name;size.textContent=`${row.size} 字节`;label.append(size);button.textContent="下载 "+row.name;button.onclick=async()=>{button.disabled=true;try{const response=await files().get(row.path);download(await response.blob(),row.name);status("已准备下载");}catch(error){console.error(error);status("下载未完成，请检查连接后再试。",true);}finally{button.disabled=false;}};line.append(label,button);$("#attachments").append(line);}
  if(!rows.length)$("#attachments").textContent="还没有附件。";
}
async function recordAttachment(row){
  await verifiedWrite(()=>sql("INSERT INTO notebook_attachments(id,name,path,size,created_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING",[row.id,row.name,row.path,row.size,row.created_at]),()=>sql("SELECT path FROM notebook_attachments WHERE id=?",[row.id]),result=>result.rows[0]?.path===row.path);
  pending=pending.filter(item=>item.id!==row.id);keepPending();
}
$("#upload").onclick=async()=>{
  if(busy)return;const chosen=[...$("#files").files];if(!chosen.length)return;
  if(chosen.some(file=>file.size>10*1024*1024)){status("每个附件最多 10 MiB，请重新选择。",true);return;}
  busy=true;$("#upload").disabled=true;
  try{for(const file of chosen){const id=crypto.randomUUID(),row={id,name:file.name,path:`documents/${id}-${file.name.replace(/[^\p{L}\p{N}._-]/gu,"_")}`,size:file.size,created_at:new Date().toISOString()};status("正在上传 "+file.name);await files().put(row.path,file,{onPrepared:receipt=>{row.uploadId=receipt.id;pending.push(row);keepPending();}});await recordAttachment(row);}$("#files").value="";await loadAttachments();status("附件已保存");}
  catch(error){console.error(error);status("上传结果暂未确认，请先检查未完成上传，勿重复选择相同文件。",true);}
  finally{busy=false;$("#upload").disabled=false;}
};
$("#recover").onclick=async()=>{
  if(busy)return;busy=true;$("#recover").disabled=true;
  try{for(const row of [...pending]){if(!row.uploadId)continue;let result=await files().uploadStatus(row.uploadId);if(!result.completed)result=await files().completeUpload(row.uploadId);if(!result.completed)throw new Error("上传仍未完成");await recordAttachment(row);}await loadAttachments();status("上传状态已核对");}
  catch(error){console.error(error);status("仍有上传未确认，请保留原记录，稍后再检查。",true);}
  finally{busy=false;$("#recover").disabled=false;}
};
keepPending();
if(!window.tiana?.files){$("#upload").disabled=true;$("#files").disabled=true;}
window.addEventListener("beforeunload",event=>{if(dirty||busy){event.preventDefault();event.returnValue="";}});
await load();
const match=location.hash.match(/^#entry\/(.+)$/);select(match?decodeURIComponent(match[1]):null);
