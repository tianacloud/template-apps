"use strict";

/* ---------- 工具函数 ---------- */
const $ = (id)=>document.getElementById(id);
let parsed = { md:"", outline:[], tables:[], full:[] };

function toast(msg){
  const t=$("toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),1800);
}

/* ---------- 解析核心 ---------- */
const CN_NUM = "零〇一二三四五六七八九十百千";

const RE_CH1 = new RegExp("第["+CN_NUM+"0-9]+[篇部编章部分]");
const RE_CH2 = new RegExp("第["+CN_NUM+"0-9]+节");
const RE_CH3 = new RegExp("第["+CN_NUM+"0-9]+[条目]");
function chineseHeadingLevel(s){
  // 章/篇/部/编/部分 -> 1 ; 节 -> 2 ; 条/目 -> 3
  if(RE_CH1.test(s)) return 1;
  if(RE_CH2.test(s)) return 2;
  if(RE_CH3.test(s)) return 3;
  return 0;
}

const SPECIAL = ["前言","引言","附录","参考文献","术语和定义","范围","规范性引用文件","资料性引用文件","总则","一般规定","基本规定"];

function parseDocument(text){
  const lines = text.replace(/\r/g,"").split("\n");
  const md = [];
  const outline = [];
  const tables = [];
  const full = [];
  let para = [];
  let tableBuf = [];

  const flushPara = ()=>{ if(para.length){ md.push(para.join(" ")); md.push(""); para=[]; } };
  const flushTable = ()=>{
    if(tableBuf.length>=2){
      // 判断是否为 | 表格已带分隔
      const isPipe = tableBuf[0].includes("|");
      let rows;
      if(isPipe){
        rows = tableBuf.map(r=>r.split("|").map(c=>c.trim()).filter((cell,i,arr)=>!(i===0&&cell==="")&&!(i===arr.length-1&&cell==="")));
      }else{
        rows = tableBuf.map(r=>r.split(/\t+/).map(c=>c.trim()).filter(c=>c.length));
      }
      // 去掉纯分隔行
      rows = rows.filter(r=>!r.every(cell=>/^:?-{3,}:?$/.test(cell)));
      if(rows.length){
        const maxc = Math.max(...rows.map(r=>r.length));
        const head = rows[0];
        let tbl = "| "+head.concat(Array(maxc-head.length).fill("")).join(" | ")+" |";
        tbl += "\n| "+Array(maxc).fill("---").join(" | ")+" |";
        rows.slice(1).forEach(r=>{ tbl += "\n| "+r.concat(Array(maxc-r.length).fill("")).join(" | ")+" |"; });
        md.push(tbl); md.push("");
        tables.push(rows); // 存入 Excel
      }
    } else if(tableBuf.length===1){
      // 单行疑似表格：回退为正文，避免丢数据
      para.push(tableBuf[0].replace(/\|/g,"丨"));
    }
    tableBuf=[];
  };

  for(let raw of lines){
    const s = raw.trim();
    full.push(raw);

    if(s===""){ flushPara(); flushTable(); continue; }

    // 表格优先识别：含 | 且至少两列，或含制表符且有>1列
    const pipeCols = (s.match(/\|/g)||[]).length;
    const tabCols = (raw.split(/\t+/).filter(c=>c.trim()).length);
    const looksTable = (pipeCols>=1 && s.split("|").filter(x=>x.trim()).length>=2) || (raw.includes("\t") && tabCols>=2);
    if(looksTable){
      flushPara();
      tableBuf.push(s.includes("|")? s : raw);
      continue;
    }

    // 编号标题: 1 / 1.1 / 1.1.1
    let m = s.match(/^(\d{1,3})(?:\.(\d{1,3}))*\s+([^\s].*)$/);
    if(m){
      flushPara(); flushTable();
      const lead = m[0].match(/^\d+(?:\.\d+)*/)[0];
      const level = Math.min(lead.split(".").length, 6);
      const title = s.slice(lead.length).trim();
      md.push("#".repeat(level)+" "+title); md.push("");
      outline.push([level, lead, title]);
      continue;
    }
    // 中文标题
    const cl = chineseHeadingLevel(s);
    if(cl && s.length<40){
      flushPara(); flushTable();
      md.push("#".repeat(cl)+" "+s); md.push("");
      outline.push([cl, "", s]);
      continue;
    }
    // 特殊章节（独立成行）
    if(SPECIAL.some(k=>s===k || s.startsWith(k) && s.length<30)){
      flushPara(); flushTable();
      md.push("# "+s); md.push("");
      outline.push([1,"",s]);
      continue;
    }
    // 普通段落
    flushTable();
    para.push(s);
  }
  flushPara(); flushTable();

  return { md: md.join("\n").replace(/\n{3,}/g,"\n\n").trim(), outline, tables, full };
}

/* ---------- 渲染预览 ---------- */
function renderPreview(md){
  // 轻量 Markdown -> HTML（标题/表格/段落/代码）
  const esc=(t)=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const lines = md.split("\n");
  let html="", i=0;
  while(i<lines.length){
    const l=lines[i];
    if(/^#{1,6}\s/.test(l)){ const lv=l.match(/^#+/)[0].length; html+=`<h${lv}>${esc(l.replace(/^#+\s/,""))}</h${lv}>`; i++; continue; }
    if(l.includes("|") && lines[i+1] && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i+1])){
      const head=l.split("|").map(c=>c.trim()).filter((cell,x,arr)=>!(x===0&&cell==="")&&!(x===arr.length-1&&cell===""));
      i+=2; const rows=[];
      while(i<lines.length && lines[i].includes("|")){ rows.push(lines[i].split("|").map(c=>c.trim()).filter((cell,x,arr)=>!(x===0&&cell==="")&&!(x===arr.length-1&&cell===""))); i++; }
      html+="<table><thead><tr>"+head.map(c=>`<th>${esc(c)}</th>`).join("")+"</tr></thead><tbody>";
      rows.forEach(r=>{ html+="<tr>"+r.map(c=>`<td>${esc(c)}</td>`).join("")+"</tr>"; });
      html+="</tbody></table>"; continue;
    }
    if(l.trim()===""){ i++; continue; }
    let buf=[]; while(i<lines.length && lines[i].trim()!=="" && !/^#{1,6}\s/.test(lines[i]) && !(lines[i].includes("|"))){ buf.push(esc(lines[i])); i++; }
    if(!buf.length){ buf.push(esc(lines[i])); i++; }
    html+="<p>"+buf.join("<br>")+"</p>";
  }
  $("preview").innerHTML = html || '<p style="color:#9aa7b4">暂无内容。</p>';
}

/* ---------- 导出 ---------- */
function download(name, content, type){
  const blob=new Blob([content],{type}); const a=document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href);
}

function exportMd(){
  if(!parsed.md){ toast("请先解析"); return; }
  download("标准文档结构化结果.md", parsed.md, "text/markdown;charset=utf-8");
  toast("已导出 Markdown");
}

function exportXlsx(){
  if(!parsed.outline.length && !parsed.tables.length){ toast("请先解析"); return; }
  // 优先用 SheetJS，失败降级 CSV
  try{
    if(typeof XLSX==="undefined") throw new Error("no-xlsx");
    const wb=XLSX.utils.book_new();
    const oa=[["层级","编号","标题"],...parsed.outline.map(r=>[r[0],r[1],r[2]])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(oa), "大纲");
    // 表格汇总：每个表格之间空一行标注
    const ta=[]; let idx=1;
    parsed.tables.forEach(t=>{ ta.push([`表格 ${idx++}`]); t.forEach(row=>ta.push(row)); ta.push([]); });
    if(!ta.length) ta.push(["（未识别到表格）"]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ta), "表格");
    const fa=parsed.full.map(l=>[l]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(fa), "原文");
    XLSX.writeFile(wb, "标准文档结构化结果.xlsx");
    toast("已导出 Excel");
  }catch(e){
    let csv="层级,编号,标题\n"+parsed.outline.map(r=>r.join(",")).join("\n");
    download("标准文档结构化结果.csv", csv, "text/csv;charset=utf-8");
    toast("已导出 CSV（Excel 兼容）");
  }
}

function copyMd(){
  if(!parsed.md){ toast("请先解析"); return; }
  navigator.clipboard.writeText(parsed.md).then(()=>toast("已复制 Markdown")).catch(()=>toast("复制失败"));
}

/* ---------- 示例（通用、无敏感信息） ---------- */
const SAMPLE = `水利水电工程混凝土施工组织设计技术导则（示例·脱敏）
前言
本导则为推荐性技术文件，用于指导中小型水利水电工程混凝土施工。

1 总则
1.1 适用范围
本导则适用于新建、扩建和改建的水利水电工程。
1.2 基本原则
应坚持安全、经济、环保、节约的原则。

2 施工布置
2.1 场地布置
2.1.1 拌合系统
拌合系统应靠近浇筑作业面布置，减少转运距离。
2.1.2 骨料堆场
骨料应按级配分区堆放，并设置遮雨设施。

3 质量控制
3.1 原材料
水泥、粉煤灰、外加剂应有合格证明。

表3.1 混凝土配合比参考
水胶比 | 坍落度(mm) | 28d强度(MPa)
0.45 | 160 | 35.0
0.50 | 180 | 30.0
0.55 | 200 | 25.0

附录A 术语
A.1 冷缝：先后浇筑的混凝土之间形成的薄弱界面。`;

/* ---------- 事件绑定 ---------- */
function doParse(){
  const txt=$("input").value;
  if(!txt.trim()){ toast("请先粘贴文本"); return; }
  parsed = parseDocument(txt);
  renderPreview(parsed.md);
  $("chars").textContent = txt.length;
  $("cntHead").textContent = parsed.outline.length;
  $("cntTab").textContent = parsed.tables.length;
  const lv = parsed.outline.length? Math.max(...parsed.outline.map(r=>r[0])) : "—";
  $("cntLv").textContent = lv;
  $("cntRows").textContent = parsed.tables.reduce((a,t)=>a+t.length,0);
  $("privacy").textContent = "已本地解析 · 未上传";
  toast("解析完成");
}

$("btnParse").onclick=doParse;
$("btnSample").onclick=()=>{ $("input").value=SAMPLE; doParse(); };
$("btnClear").onclick=()=>{ $("input").value=""; parsed={md:"",outline:[],tables:[],full:[]}; renderPreview(""); $("chars").textContent=0; $("cntHead").textContent=0; $("cntTab").textContent=0; $("cntLv").textContent="—"; $("cntRows").textContent="—"; $("privacy").textContent="隐私保护中"; };
$("btnMd").onclick=exportMd;
$("btnXlsx").onclick=exportXlsx;
$("btnCopy").onclick=copyMd;
$("input").addEventListener("input",()=>{ $("chars").textContent=$("input").value.length; });
