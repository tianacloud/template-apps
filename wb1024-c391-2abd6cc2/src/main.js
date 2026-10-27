import { createTianaFetch } from '@tianacloud/serverless';
import './style.css';
const link=document.createElement('link'); link.rel='stylesheet'; link.href=new URL('./app.css',import.meta.url).href; document.head.append(link);
import markup from './markup.js';
document.body.innerHTML=markup;
let conn, client;
async function execute(sql,values=[]) {
 if(!conn){conn=await window.tiana.connection(); if(conn.sql_api!=='hrana-v3') throw Error('不支持的数据库协议'); client=createTianaFetch({origin:conn.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});}
 const args=values.map(v=>typeof v==='number'?{type:'integer',value:String(v)}:{type:'text',value:String(v)});
 const response=await client(`${conn.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
 if(!response.ok) throw Error('数据库请求结果未知，请刷新核对'); const data=await response.json(); const item=data.results?.[0]; if(item?.type!=='ok'||item.response?.type!=='execute') throw Error('数据库操作失败'); return item.response.result.rows.map(row=>row.map(cell=>cell.value??null));
}

"use strict";
const OUTLINE_DIR = "20-大纲/细纲";
const SKIP = new Set([".versions",".workbuddy","tools"]);
const TKEY = "wr_token";
const PKEY = "wr_project";
let allDocs = {};     // path -> {category,name,content,updated_at}（path 形如 项目名/目录/文件.md）
let curPath = null;
let curProject = localStorage.getItem(PKEY) || "";
let token = localStorage.getItem(TKEY) || "";

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const projOf = p => p.split("/")[0];
const catOf = p => p.split("/")[1] || "_根";
const nameOf = p => p.split("/").pop();
const relOf = p => p.split("/").slice(2).join("/") || nameOf(p);

/* ================= API ================= */
async function api(path, opts = {}) {
 const method=opts.method||"GET";
 if(path.startsWith('/api/docs')) { const rows=await execute('SELECT path, content FROM docs ORDER BY path'); return {docs:rows.map(([path,content])=>({path,content}))}; }
 if(path === '/api/doc' && method==='POST') { const {path:p,content}=JSON.parse(opts.body); await execute('INSERT INTO docs(path,content) VALUES (?,?) ON CONFLICT(path) DO UPDATE SET content=excluded.content',[p,content]); return {}; }
 if(path.startsWith('/api/doc?') && method==='DELETE') { await execute('DELETE FROM docs WHERE path=?',[new URLSearchParams(path.split('?')[1]).get('path')]); return {}; }
 if(path.startsWith('/api/project?') && method==='DELETE') { const name=new URLSearchParams(path.split('?')[1]).get('name'); const n=Object.keys(allDocs).filter(p=>projOf(p)===name).length; await execute('DELETE FROM docs WHERE substr(path,1,?)=?',[name.length+1,name+'/']); return {name,removed:n}; }
 if(path==='/api/import') { const {docs}=JSON.parse(opts.body); for(const d of docs) await execute('INSERT INTO docs(path,content) VALUES (?,?) ON CONFLICT(path) DO UPDATE SET content=excluded.content',[d.path,d.content]); return {imported:docs.length,skipped:0}; }
 throw Error('未知操作');
}
/* ================= 登录 ================= */
async function tryEnter(tk, silent){
  token = tk;
  try {
    const d = await api("/api/docs?full=1");
    localStorage.setItem(TKEY, tk);
    allDocs = {};
    (d.docs||[]).forEach(r => { allDocs[r.path] = r; });
    $("loginView").style.display = "none";
    $("appView").style.display = "flex";
    $("uname").textContent = "🔒 已连接云端";
    renderProjectSel(); buildTree(); renderPanels();
    $("st1").textContent = "✅ 已加载 " + Object.keys(allDocs).length + " 个文件 · 项目「" + curProject + "」";
    if (!Object.keys(allDocs).length) {
      $("st1").textContent = "⚠ 服务器还没有资料，点「＋ 新项目」或「📥 从本地底稿导入」开始";
    }
    return true;
  } catch(e) {
    token = "";
    localStorage.removeItem(TKEY);
    if (!silent) $("loginErr").textContent = e.message;
    else $("loginErr").textContent = "上次的口令已失效，请重新输入。";
    return false;
  }
}
$("btnLogin").onclick = async () => {
  const v = $("inToken").value.trim();
  if (!v) { $("loginErr").textContent = "请输入访问口令"; return; }
  $("loginErr").textContent = "验证中…";
  await tryEnter(v, false);
};
$("inToken").addEventListener("keydown", e => { if (e.key === "Enter") $("btnLogin").click(); });
$("btnLogout").onclick = () => { location.href = window.tiana?.logoutUrl || "/"; };
$("btnBack").onclick = () => {
  if (document.referrer) history.back();
  else location.reload();
};

/* ================= 数据操作 ================= */
async function loadAll(){
  $("st1").textContent = "正在加载…";
  try {
    const d = await api("/api/docs?full=1");
    allDocs = {};
    (d.docs||[]).forEach(r => { allDocs[r.path] = r; });
    renderProjectSel(); buildTree(); renderPanels();
    $("st1").textContent = "✅ 已加载 " + Object.keys(allDocs).length + " 个文件 · 项目「" + curProject + "」";
  } catch(e) { $("st1").textContent = "❌ 加载失败：" + e.message; }
}
async function saveDoc(path, content){
  await api("/api/doc", { method:"POST", body: JSON.stringify({ path, content }) });
  allDocs[path] = { path, category: catOf(path), name: nameOf(path), content, updated_at: new Date().toISOString() };
}
async function deleteDoc(path){
  await api("/api/doc?path=" + encodeURIComponent(path), { method:"DELETE" });
  delete allDocs[path];
}

/* ================= 项目切换 ================= */
function projectList(){
  const s = new Set();
  Object.keys(allDocs).forEach(p => s.add(projOf(p)));
  return [...s].sort((a,b)=>a.localeCompare(b,"zh"));
}
function renderProjectSel(){
  const sel = $("projSel");
  const list = projectList();
  if (!list.length) { sel.innerHTML = '<option>（无项目）</option>'; return; }
  if (!curProject || list.indexOf(curProject) < 0) curProject = list[0];
  sel.innerHTML = list.map(p =>
    '<option value="' + esc(p) + '"' + (p === curProject ? " selected" : "") + '>' + esc(p) + '</option>'
  ).join("");
  localStorage.setItem(PKEY, curProject);
}
function resetView(){
  curPath = null;
  $("fname").textContent = "（未打开文件）";
  $("fmode").textContent = "";
  $("fcount").textContent = "";
  $("editor").style.display = "none";
  $("content").style.display = "block";
  $("content").innerHTML = '<p style="color:var(--sub)">左侧选择文件。所有文件都可直接编辑保存。</p>';
  $("btnSave").disabled = $("btnDel").disabled = $("btnLint").disabled = $("btnCopy").disabled = true;
}
$("projSel").onchange = () => {
  curProject = $("projSel").value;
  localStorage.setItem(PKEY, curProject);
  resetView(); buildTree(); renderPanels();
  $("st1").textContent = "✅ 已加载 " + Object.keys(allDocs).length + " 个文件 · 项目「" + curProject + "」";
};

/* ================= 文件树 ================= */
function buildTree(){
  const tree = $("treewrap"); tree.innerHTML = "";
  const paths = Object.keys(allDocs).filter(p => projOf(p) === curProject).sort();
  if (!paths.length) {
    tree.innerHTML = '<div style="color:var(--sub);font-size:12px;padding:6px;">（本项目还没有文件）</div>';
    return;
  }
  const cats = {};
  paths.forEach(p => (cats[catOf(p)] = cats[catOf(p)] || []).push(p));
  Object.keys(cats).sort((a,b)=> (a==="_根"? -1 : b==="_根"? 1 : a.localeCompare(b,"zh"))).forEach(c => {
    const d = document.createElement("div"); d.className = "dir"; d.textContent = "📁 " + (c === "_根" ? "根目录" : c); tree.appendChild(d);
    cats[c].forEach(p => {
      const f = document.createElement("div");
      f.className = "file" + (p.indexOf("/" + OUTLINE_DIR + "/") > -1 ? " outline" : "") + (p === curPath ? " active" : "");
      f.textContent = relOf(p);
      f.title = p;
      f.onclick = () => openFile(p);
      tree.appendChild(f);
    });
  });
}

/* ================= 打开 / 保存 / 删除 ================= */
function openFile(path){
  const doc = allDocs[path];
  if (!doc) return;
  curPath = path;
  $("fname").textContent = path;
  $("fmode").textContent = "✏ 可编辑（改动需点「💾 保存」）";
  $("content").style.display = "none";
  $("editor").style.display = "block";
  $("editor").value = doc.content || "";
  $("btnSave").disabled = false;
  $("btnDel").disabled = false;
  $("btnLint").disabled = path.indexOf("/30-正文/") < 0;
  $("btnCopy").disabled = path.indexOf("/" + OUTLINE_DIR + "/") < 0;
  updateCount(); buildTree();
}
async function saveCurrent(){
  if (!curPath) return;
  $("st2").textContent = "保存中…";
  try {
    await saveDoc(curPath, $("editor").value);
    $("st2").textContent = "✅ 已保存 " + new Date().toLocaleTimeString();
    renderPanels(); buildTree();
  } catch(e) { $("st2").textContent = "❌ 保存失败：" + e.message; }
}
$("btnSave").onclick = saveCurrent;
$("editor").addEventListener("input", updateCount);
$("editor").addEventListener("keydown", e => {
  if ((e.ctrlKey||e.metaKey) && e.key === "s") { e.preventDefault(); saveCurrent(); }
});
function updateCount(){
  const body = $("editor").value.replace(/^---[\s\S]*?---\r?\n/, "");
  $("fcount").textContent = "字数：" + body.replace(/\s/g,"").length;
}
$("btnDel").onclick = async () => {
  if (!curPath) return;
  if (!confirm("确定删除「" + curPath + "」？此操作不可恢复。")) return;
  try {
    await deleteDoc(curPath);
    curPath = null;
    $("fname").textContent = "（未打开文件）";
    $("editor").style.display = "none"; $("content").style.display = "block";
    $("content").innerHTML = '<p style="color:var(--sub)">已删除。左侧选择其他文件。</p>';
    $("btnSave").disabled = $("btnDel").disabled = $("btnLint").disabled = $("btnCopy").disabled = true;
    buildTree(); renderPanels(); $("st2").textContent = "🗑 已删除";
    $("st1").textContent = "✅ 已加载 " + Object.keys(allDocs).length + " 个文件";
  } catch(e) { $("st2").textContent = "❌ 删除失败：" + e.message; }
};

/* ================= Markdown 渲染 ================= */
function renderMD(src){
  let s = esc(src);
  s = s.replace(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/, (m,fm)=>'<div class="fm">ⓘ 元信息\n'+fm+'</div>\n');
  const codes=[];
  s = s.replace(/```([\s\S]*?)```/g,(m,c)=>{codes.push(c);return "\u0000"+(codes.length-1)+"\u0000";});
  const lines = s.split("\n"); const out=[]; let i=0;
  const inline = t => t
    .replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")
    .replace(/`([^`]+)`/g,"<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<span style="color:var(--acc)">$1</span>');
  while(i<lines.length){
    const L=lines[i];
    if(/^\s*$/.test(L)){i++;continue;}
    if(/^(---|\*\*\*)\s*$/.test(L)){out.push("<hr>");i++;continue;}
    let m;
    if(m=L.match(/^(#{1,4})\s+(.*)/)){const n=Math.min(m[1].length,4);out.push(`<h${n}>${inline(m[2])}</h${n}>`);i++;continue;}
    if(m=L.match(/^&gt;\s?(.*)/)){const buf=[];while(i<lines.length&&/^&gt;/.test(lines[i])){buf.push(lines[i].replace(/^&gt;\s?/,""));i++;}out.push("<blockquote>"+inline(buf.join(" "))+"</blockquote>");continue;}
    if(/^\|.+\|/.test(L) && i+1<lines.length && /^\|[\s:|-]+\|/.test(lines[i+1])){
      const head=L.split("|").slice(1,-1).map(x=>x.trim());
      i+=2; const rows=[];
      while(i<lines.length&&/^\|.+\|/.test(lines[i])){rows.push(lines[i].split("|").slice(1,-1).map(x=>x.trim()));i++;}
      out.push("<table><tr>"+head.map(h=>`<th>${inline(h)}</th>`).join("")+"</tr>"
        + rows.map(r=>"<tr>"+r.map(c=>`<td>${inline(c)}</td>`).join("")+"</tr>").join("")+"</table>");
      continue;
    }
    if(/^[-*]\s+/.test(L)){const buf=[];while(i<lines.length&&/^[-*]\s+/.test(lines[i])){buf.push(lines[i].replace(/^[-*]\s+/,""));i++;}out.push("<ul>"+buf.map(x=>"<li>"+inline(x)+"</li>").join("")+"</ul>");continue;}
    if(/^\d+\.\s+/.test(L)){const buf=[];while(i<lines.length&&/^\d+\.\s+/.test(lines[i])){buf.push(lines[i].replace(/^\d+\.\s+/,""));i++;}out.push("<ol>"+buf.map(x=>"<li>"+inline(x)+"</li>").join("")+"</ol>");continue;}
    const buf=[L];i++;
    while(i<lines.length&&!/^\s*$/.test(lines[i])&&!/^(#{1,4}\s|[-*]\s|\d+\.\s|&gt;|\||---)/.test(lines[i])){buf.push(lines[i]);i++;}
    out.push("<p>"+inline(buf.join(" ")).replace(/\n/g,"<br>")+"</p>");
  }
  let html=out.join("\n");
  html = html.replace(/\u0000(\d+)\u0000/g,(m,n)=>"<pre><code>"+codes[n]+"</code></pre>");
  return html;
}

/* ================= 门禁 ================= */
const BAN=["不禁","与此同时","一股","涌上心头","然而","内心深处","缓缓说道","命运的齿轮","宿命感","忍不住","下意识地","不由自主地"];
const WARN=["深吸一口气","时间来到了","另一边","仿佛","似乎"];
function lintText(body){
  const text=body.replace(/^---[\s\S]*?---\r?\n/,"");
  const words=text.replace(/\s/g,"").length;
  const dash=(text.match(/——/g)||[]).length;
  const ban=BAN.filter(w=>text.includes(w));
  const warnHits=WARN.filter(w=>text.includes(w));
  const feel=(text.match(/感到|觉得/g)||[]).length;
  const lines=text.split("\n").filter(x=>x.trim());
  const last=lines.length?lines[lines.length-1].trim():"";
  const issues=[];
  if(words<2500) issues.push("❌ 字数 "+words+"，不足 2500");
  else if(words>3200) issues.push("⚠ 字数 "+words+"，超出 3000 较多（确认是否有意）");
  else issues.push("✅ 字数 "+words+"（2500–3000 达标）");
  issues.push((dash<=12?"✅":"❌")+" 破折号 "+dash+"/12");
  issues.push((ban.length===0?"✅":"❌")+" ban词："+(ban.length?ban.join("、"):"0"));
  issues.push((warnHits.length<=3?"✅":"⚠")+" warn词："+(warnHits.length?warnHits.join("、"):0)+"（≤3）");
  issues.push((feel<=2?"✅":"⚠")+" 感到/觉得："+feel+"（≤2）");
  const endBad=/[?？!！]\s*$/.test(last)||/^（?第.+章完/.test(last);
  issues.push(endBad?"❌ 章末为反问/感叹/平收":"✅ 章末收在陈述句");
  return {issues, words, pass: ban.length===0 && dash<=12 && words>=2500 && !endBad};
}
$("btnLint").onclick = () => {
  if (!curPath) return;
  const doc = allDocs[curPath];
  const r = lintText(doc.content || "");
  const html = "<b>🔍 量化门禁 · "+esc(curPath)+"</b><br>"+r.issues.map(x=>'<div class="li">'+esc(x)+"</div>").join("")
    + '<div class="li" style="margin-top:8px">'+(r.pass?'<span class="pass">总体：通过</span>':'<span class="fail">总体：未通过，需修订</span>')+"</div>";
  $("editor").style.display = "none";
  $("content").style.display = "block";
  $("content").innerHTML = '<div style="background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px 18px;margin-bottom:16px">'+html+"</div>"
    + renderMD(doc.content||"")
    + '<p style="margin-top:16px"><button onclick="backToEditor()">✏ 返回编辑</button></p>';
};
function backToEditor(){
  $("content").style.display = "none";
  $("editor").style.display = "block";
}

/* ================= 新建细纲 ================= */
const FALLBACK_TPL = "---\nchapter: 0\ntitle: 章名\nstatus: 待扩写\npov: 许临\ntimeline: 新纪·今·（时间点）\ncharacters: []\nlocations: []\nthreads: []\nforeshadow: []\npayoff: []\nhook: 悬疑\nwords_target: 2500-3000\n---\n\n# 第000章 章名 · 细纲\n\n## 本章任务\n\n（一句话）\n\n## 场景节拍\n\n1. **开场钩子**：\n2. **发展**：\n3. **转折**：\n4. **章末钩子**：\n\n## 必须出现\n\n- **角色**：\n- **设定**：\n- **伏笔**：埋 / 收\n- **爽点**：\n\n## 禁止\n\n- \n\n## 备注\n\n- ";
$("btnNew").onclick = ()=>$("dlgNew").showModal();
$("btnNewGo").onclick = async () => {
  if (!curProject) { alert("请先选择或新建一个项目"); return; }
  const n=parseInt($("inNum").value,10), t=$("inTitle").value.trim();
  if(!n||!t){alert("章号和章名都要填");return;}
  const nn=String(n).padStart(3,"0");
  const tplPath = curProject + "/" + OUTLINE_DIR + "/_细纲模板.md";
  let tpl = (allDocs[tplPath]||{}).content || FALLBACK_TPL;
  tpl = tpl.replace(/^chapter: 0$/m,"chapter: "+n).replace(/^title: 章名$/m,"title: "+t)
           .replace("# 第000章 章名 · 细纲", "# 第"+nn+"章 "+t+" · 细纲");
  const path = curProject + "/" + OUTLINE_DIR + "/第"+nn+"章-"+t+"-细纲.md";
  $("st2").textContent = "创建中…";
  try {
    await saveDoc(path, tpl);
    $("dlgNew").close();
    $("inNum").value=""; $("inTitle").value="";
    buildTree(); openFile(path);
    $("st2").textContent = "✅ 细纲已创建";
    $("st1").textContent = "✅ 已加载 " + Object.keys(allDocs).length + " 个文件";
  } catch(e){ $("st2").textContent = "❌ 创建失败：" + e.message; }
};

/* ================= 新建正文 / 任意文件 ================= */
function tplChapter(path){
  const fname = nameOf(path).replace(/\.md$/,"");
  const m = fname.match(/^第(\d+)章[-_ ]*(.*)$/);
  const num = m ? parseInt(m[1],10) : 0;
  const nm = m ? (m[2] || "（章名）") : fname;
  const vol = parseInt((path.match(/第(\d+)卷/)||[])[1] || "1", 10);
  const nn = String(num).padStart(3,"0");
  const today = new Date().toISOString().slice(0,10);
  return `---\nchapter: ${num}\nvolume: ${vol}\ntitle: 第${nn}章 ${nm}\nstatus: 草稿\npov: \ntimeline: \ncharacters: []\nlocations: []\nthreads: []\nforeshadow: []\npayoff: []\nwords: 0\nupdated: ${today}\n---\n\n# 第${nn}章 ${nm}\n\n（正文从这里开始。一段一行，段间空行。）\n`;
}
function tplWorld(path){
  const fname = nameOf(path).replace(/\.md$/,"");
  const m = fname.match(/^(W-\d+)[-_ ]*(.*)$/);
  const id = m ? m[1] : "W-000";
  const topic = m ? (m[2] || "主题") : fname;
  const today = new Date().toISOString().slice(0,10);
  return `---\nid: ${id}\ntopic: ${topic}\ncategory: 待定\nstatus: 初稿\nrefs: []\nupdated: ${today}\n---\n\n# ${topic}\n\n## 一句话概括\n\n（待补充）\n\n## 核心内容\n\n\n## 规则与限制\n\n| 项 | 说明 |\n| --- | --- |\n| 能做到什么 | |\n| 不能做到什么 | |\n| 代价 / 成本 | |\n\n## 关联条目\n\n- 相关：\n`;
}
function tplChar(path){
  const fname = nameOf(path).replace(/\.md$/,"");
  const m = fname.match(/^(C-\d+)[-_ ]*(.*)$/);
  const id = m ? m[1] : "C-000";
  const nm = m ? (m[2] || "姓名") : fname;
  const today = new Date().toISOString().slice(0,10);
  return `---\nid: ${id}\nname: ${nm}\nrole: 配角\nfaction: \nstatus: 未登场\nfirst_appear: \ntags: []\nupdated: ${today}\n---\n\n# ${nm}\n\n## 一句话人设\n\n（待补充）\n\n## 核心三件套\n\n| 项 | 内容 |\n| --- | --- |\n| **想要**（表层目标） | |\n| **需要**（深层缺口） | |\n| **恐惧** | |\n\n## 关系网\n\n| 对象 | 关系 | 情感基调 | 起始章节 | 备注 |\n| --- | --- | --- | --- | --- |\n`;
}
$("btnNewFile").onclick = () => {
  if (!curProject) { alert("请先选择或新建项目"); return; }
  $("inPath").value = "";
  $("dlgFile").showModal();
};
$("btnFileGo").onclick = async () => {
  if (!curProject) return;
  const rel = $("inPath").value.trim().replace(/^\/+/, "");
  if (!rel) { alert("请填写文件路径"); return; }
  if (!/\.md$/i.test(rel)) { alert("文件名必须以 .md 结尾"); return; }
  const path = curProject + "/" + rel;
  if (allDocs[path] && !confirm("该文件已存在，确定覆盖？")) return;
  const t = $("inTpl").value;
  const content = t === "chapter" ? tplChapter(path)
                : t === "world" ? tplWorld(path)
                : t === "char" ? tplChar(path) : "";
  $("st2").textContent = "创建中…";
  try {
    await saveDoc(path, content);
    $("dlgFile").close();
    await loadAll();
    openFile(path);
    $("st2").textContent = "✅ 已创建 " + rel;
  } catch(e) { $("st2").textContent = "❌ 创建失败：" + e.message; }
};

/* ================= 删除项目 ================= */
$("btnDelProj").onclick = async () => {
  if (!curProject) return;
  const cnt = Object.keys(allDocs).filter(p => projOf(p) === curProject).length;
  if (!confirm("确定删除项目「" + curProject + "」及其全部 " + cnt + " 个文件？\n\n此操作不可恢复（服务器保留 docs.json.bak）。")) return;
  const typed = prompt("再次确认：请输入项目名「" + curProject + "」");
  if (typed !== curProject) { $("st2").textContent = "已取消（项目名不匹配）"; return; }
  try {
    const r = await api("/api/project?name=" + encodeURIComponent(curProject), { method:"DELETE" });
    curProject = "";
    localStorage.removeItem(PKEY);
    await loadAll();
    resetView();
    $("st2").textContent = "🗑 已删除项目「" + r.name + "」，共移除 " + r.removed + " 个文件";
  } catch(e) { $("st2").textContent = "❌ 删除失败：" + e.message; }
};

/* ================= 复制扩写指令 ================= */
$("btnCopy").onclick = async () => {
  if (!curPath) return;
  const doc = allDocs[curPath];
  const fm = (doc.content||"").match(/^---\n([\s\S]*?)\n---/);
  let meta="";
  if (fm) {
    const get=k=>{const m=fm[1].match(new RegExp("^"+k+":\\s*(.*)$","m"));return m?m[1].trim():"";};
    meta=`（章号 ${get("chapter")}｜章名「${get("title")}」｜钩子类型 ${get("hook")}｜目标字数 ${get("words_target")||"2500-3000"}）`;
  }
  const numMatch = curPath.match(/第(\d+)章/);
  const num = numMatch ? numMatch[1] : "000";
  const cmd = `请按《${projOf(curPath)}》写作台（自建服务器 （写作台服务））的细纲「${curPath}」扩写本章正文，2500–3000 字，写入文档路径「${projOf(curPath)}/30-正文/第01卷/第${num}章-（章名）.md」。要求：先读细纲与相关设定（W 系列 / 角色卡 / 伏笔追踪），扩写后跑量化门禁（字数≥2500、破折号≤12、ban词0、warn≤3、感到/觉得≤2、章末陈述句钩子），并更新「${projOf(curPath)}/20-大纲/章节摘要.md」与「${projOf(curPath)}/40-线索与时间线/伏笔追踪.md」。细纲元信息：${meta}`;
  try { await navigator.clipboard.writeText(cmd); $("st2").textContent = "✅ 扩写指令已复制，去对话粘贴即可"; }
  catch(e){ prompt("复制失败，请手动复制：", cmd); }
};

/* ================= 从本地底稿导入 ================= */
$("btnImport").onclick = async () => {
  if (!window.showDirectoryPicker) { alert("当前浏览器不支持本地目录读取，请用 Chrome / Edge。"); return; }
  let dir;
  try { dir = await showDirectoryPicker({mode:"read", id:"xz2-import"}); }
  catch(e){ return; }
  const files=[];
  async function walk(h, prefix){
    for await (const [name, child] of h.entries()){
      if (SKIP.has(name) || name.startsWith(".")) continue;
      if (child.kind === "directory") await walk(child, prefix + name + "/");
      else if (name.endsWith(".md")) {
        const f = await child.getFile();
        files.push({ path: prefix + name, content: await f.text() });
      }
    }
  }
  $("st2").textContent = "读取本地文件中…";
  await walk(dir, "");
  if (!files.length) { $("st2").textContent = "⚠ 未找到 md 文件"; return; }
  const projName = (prompt("导入到哪个项目？（填小说名，如：我的小说）", curProject || dir.name) || "").trim();
  if (!projName) { $("st2").textContent = "已取消导入"; return; }
  const docs = files.map(f => ({ path: projName + "/" + f.path, content: f.content }));
  $("st2").textContent = "上传中… " + docs.length + " 个文件";
  try {
    const r = await api("/api/import", { method:"POST", body: JSON.stringify({ docs }) });
    curProject = projName;
    localStorage.setItem(PKEY, curProject);
    await loadAll();
    $("st2").textContent = "✅ 导入完成：写入 " + r.imported + " 个" + (r.skipped ? "，跳过 " + r.skipped + " 个" : "");
  } catch(e) { $("st2").textContent = "❌ 导入失败：" + e.message; }
};

/* ================= 新建项目 ================= */
$("btnNewProj").onclick = async () => {
  const raw = prompt("新项目名称（小说名，如：骨临天下）");
  if (!raw) return;
  const n = raw.trim().replace(/[\/\\]/g, "");
  if (!n) { alert("名称不能为空"); return; }
  if (projectList().indexOf(n) >= 0) { alert("已存在同名项目： " + n); return; }
  const today = new Date().toISOString().slice(0, 10);
  const skeleton = [
    ["00-项目管理/项目总览.md",
`---
project: ${n}
type: 长篇小说
status: 立项中
started: ${today}
updated: ${today}
---

# 《${n}》

## 一句话简介

（待补充）

## 核心设定

| 项目 | 内容 |
| --- | --- |
| 题材类型 | |
| 目标读者 | |
| 整体基调 | |
| 预计篇幅 | |

## 进度看板

| 指标 | 当前 | 目标 |
| --- | --- | --- |
| 已写正文字数 | 0 | |
`],
    ["20-大纲/章节摘要.md",
`---
doc: 章节摘要
book: ${n}
updated: ${today}
---

# 章节摘要

| 章 | 章名 | 卷 | 一句话摘要 | 状态 |
| --- | --- | --- | --- | --- |
`],
    ["40-线索与时间线/伏笔追踪.md",
`---
doc: 伏笔追踪
book: ${n}
updated: ${today}
---

# 伏笔追踪

| 编号 | 伏笔内容 | 类型 | 埋设章节 | 计划回收 | 实际回收 | 状态 | 重要度 | 关联角色 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
`],
    ["20-大纲/细纲/_细纲模板.md", FALLBACK_TPL],
  ];
  $("st2").textContent = "创建项目中…";
  try {
    for (const [p, c] of skeleton) await saveDoc(n + "/" + p, c);
    curProject = n;
    localStorage.setItem(PKEY, curProject);
    await loadAll();
    resetView();
    $("st2").textContent = "✅ 项目「" + n + "」已创建（含项目总览/章节摘要/伏笔追踪/细纲模板）";
  } catch(e) { $("st2").textContent = "❌ 创建失败：" + e.message; }
};

/* ================= 右侧面板 ================= */
document.querySelectorAll("#tabs div").forEach(t=>{
  t.onclick=()=>{ document.querySelectorAll("#tabs div").forEach(x=>x.classList.remove("on")); t.classList.add("on"); renderPanels(t.dataset.t); };
});
function renderPanels(tab){
  tab = tab || document.querySelector("#tabs .on").dataset.t;
  const b=$("panelbody");
  const P = (curProject || "") + "/";
  if (tab==="fs") {
    const ft = allDocs[P + "40-线索与时间线/伏笔追踪.md"];
    const rows = ft ? [...(ft.content||"").matchAll(/^\| (F-\d+) \|([^|]+)\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|\s*(待回收|部分回收|已回收|弃用)/gm)] : [];
    b.innerHTML = rows.length
      ? rows.map(m=>`<div class="pitem"><b>${m[1]}</b><span class="tag ${m[3]==="待回收"?"warn":""}">${m[3]}</span><br>${esc(m[2].trim().slice(0,40))}…</div>`).join("")
      : '<div class="pitem">（本项目暂无伏笔数据）</div>';
  } else if (tab==="chars") {
    const out = Object.keys(allDocs).filter(p=>p.startsWith(P + "10-设定/角色/C-")).sort().map(p=>{
      const t=allDocs[p].content||"";
      const g=k=>{const m=t.match(new RegExp("^"+k+":\\s*(.+)$","m"));return m?m[1].trim():"";};
      return `<div class="pitem"><b>${esc(g("name")||nameOf(p))}</b><span class="tag">${esc(g("id")||"")}</span><br>${esc(g("role"))} · ${esc(g("status"))}</div>`;
    }).join("");
    b.innerHTML = out || '<div class="pitem">（本项目暂无角色卡）</div>';
  } else if (tab==="chaps") {
    const sum = allDocs[P + "20-大纲/章节摘要.md"];
    const rows = sum ? [...(sum.content||"").matchAll(/^\| (\d+) \| ([^|]+) \| \d+ \|([^|]+)\|/gm)] : [];
    b.innerHTML = rows.length
      ? rows.map(m=>`<div class="pitem"><b>第${m[1]}章 ${esc(m[2].trim())}</b><br>${esc(m[3].trim().slice(0,30))}…</div>`).join("")
      : '<div class="pitem">（本项目暂无章节数据）</div>';
  } else {
    b.innerHTML = `
      <div class="pitem"><b>境界即职级</b><br>骨醒(无籍)→练气·塑形(劳务)→筑基·神通(技术岗)→金丹·真人(管理岗)→元婴·骨婴(决策层)</div>
      <div class="pitem"><b>塑形顺序</b><br>内五脏六腑 → 中筋肉 → 外皮毛（练气九层）</div>
      <div class="pitem"><b>神通两途</b><br>肉体神通＝贵途（直通真人）／法术神通＝贱途（不动血肉）</div>
      <div class="pitem"><b>体系铁律</b><br>①塑形要真料 ②读骨担执念 ③骨是根不是壳 ④体法价值反转＝制度筛选器</div>
      <div class="pitem"><b>门禁规则</b><br>≥2500字 · 破折号≤12 · ban词0 · warn≤3 · 感到/觉得≤2 · 章末陈述句钩子</div>
      <div class="pitem"><b>钩子类型</b><br>危机/悬疑/反转/信息/情感/时间/选择/生存（连续三章不重样）</div>`;
  }
}

window.backToEditor = backToEditor;
tryEnter("", false);
