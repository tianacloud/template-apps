import "./style.css";
const css = document.createElement("link"); css.rel="stylesheet"; css.href=new URL("./wb1024-c211-a084d17c.css", import.meta.url).href; document.head.appendChild(css);
document.getElementById("app").innerHTML = "\n<header class=\"top\">\n  <h1>🛠️ 故障复盘报告生成器</h1>\n  <span class=\"tag\">故障复盘</span>\n  <span class=\"tag\">结构化报告</span>\n  <span class=\"spacer\"></span>\n  <span class=\"tag\" id=\"mttrBadge\" style=\"background:rgba(255,255,255,.25)\">故障时长：—</span>\n</header>\n\n<div class=\"wrap\">\n  <!-- 左：表单 -->\n  <div>\n    <div class=\"card\">\n      <h2><span class=\"n\">1</span>报告视角与基本信息</h2>\n      <label>报告视角（决定详略与措辞）</label>\n      <div class=\"seg\">\n        <label><input checked name=\"view\" type=\"radio\" value=\"internal\"><span class=\"opt\">内部技术档案版</span></label>\n        <label><input name=\"view\" type=\"radio\" value=\"external\"><span class=\"opt\">对外汇报版（弱化技术细节）</span></label>\n      </div>\n      <div class=\"hint\">内部版保留完整技术细节；对外版自动精简根因、突出影响与改进，措辞面向管理层。</div>\n\n      <label>故障标题 *</label>\n      <input id=\"title\" placeholder=\"例：xcjdb 数据库 9/4 集群心跳中断复盘\">\n\n      <div class=\"row\">\n        <div>\n          <label>发生时间 *</label>\n          <input id=\"start\" type=\"datetime-local\">\n        </div>\n        <div>\n          <label>恢复时间 *</label>\n          <input id=\"end\" type=\"datetime-local\">\n        </div>\n      </div>\n\n      <div class=\"row\">\n        <div>\n          <label>严重程度</label>\n          <select id=\"sev\">\n            <option value=\"P1 / 重大\">P1 / 重大</option>\n            <option value=\"P2 / 严重\">P2 / 严重</option>\n            <option value=\"P3 / 一般\">P3 / 一般</option>\n            <option value=\"P4 / 轻微\">P4 / 轻微</option>\n          </select>\n        </div>\n        <div>\n          <label>影响系统 / 业务</label>\n          <input id=\"scope\" placeholder=\"例：xcjdb 生产库 / 营业系统\">\n        </div>\n      </div>\n\n      <label>影响范围 / 用户数</label>\n      <input id=\"impactScope\" placeholder=\"例：3 节点集群，约 1200 并发会话受影响\">\n    </div>\n\n    <div class=\"card\">\n      <h2><span class=\"n\">2</span>故障现象与影响</h2>\n      <label>故障现象（用户/监控侧可见的表现）</label>\n      <textarea id=\"symptom\" placeholder=\"例：09:12 起应用侧批量报 ORA-xxx，VIP 发生漂移……\"></textarea>\n\n      <label>业务影响</label>\n      <textarea id=\"bizImpact\" placeholder=\"例：柜面交易响应变慢，部分时段无法出单，持续约 18 分钟。\"></textarea>\n    </div>\n\n    <div class=\"card\">\n      <h2><span class=\"n\">3</span>处理时间线</h2>\n      <div id=\"timeline\"></div>\n      <button class=\"addbtn\">+ 增加一条时间线</button>\n    </div>\n\n    <div class=\"card\">\n      <h2><span class=\"n\">4</span>根因分析</h2>\n      <label>内部版根因（技术细节，含参数/链路）</label>\n      <textarea id=\"rootInternal\" placeholder=\"例：lo 接口 MTU 与 RDMA 协商不匹配，心跳包在 …… 出现超时累积。\"></textarea>\n      <label>对外版根因概述（一句话，面向管理层）</label>\n      <input id=\"rootExternal\" placeholder=\"例：集群内部通信稳定性不足，导致心跳中断。\">\n    </div>\n\n    <div class=\"card\">\n      <h2><span class=\"n\">5</span>改进项 / 后续动作</h2>\n      <div class=\"muted\" style=\"margin-bottom:6px\">统一以\"流程补齐 / 优化 / 加固\"等面向未来措辞，默认不写责任主体。</div>\n      <div id=\"fixes\"></div>\n      <button class=\"addbtn\">+ 增加一条改进项</button>\n    </div>\n\n    <div class=\"card\">\n      <h2><span class=\"n\">6</span>经验教训</h2>\n      <textarea id=\"lesson\" placeholder=\"例：关键参数变更应纳入变更窗口与双人复核；监控阈值需前置梳理。\"></textarea>\n    </div>\n\n    <div class=\"card\">\n      <h2>🔍 无责措辞检查</h2>\n      <div class=\"muted\" style=\"margin-bottom:8px\">扫描上述文本，标出易引发\"定责\"联想的敏感词并给出替换建议（遵循你既定的\"不写责任主体、不定性责任\"原则）。</div>\n      <button class=\"toolbtn\">运行措辞检查</button>\n      <div class=\"check-result\" id=\"checkOut\" style=\"margin-top:10px\"></div>\n    </div>\n  </div>\n\n  <!-- 右：实时预览 -->\n  <div>\n    <div class=\"preview\">\n      <div class=\"bar\">\n        <span id=\"previewTag\">实时预览 · 内部技术档案版</span>\n        <span class=\"spacer\"></span>\n        <button class=\"alt\">复制 Markdown</button>\n        <button>下载 .md</button>\n        <button>下载报告.html</button>\n      </div>\n      <div class=\"doc\" id=\"doc\"></div>\n    </div>\n    <div class=\"tools\" style=\"justify-content:center; margin-top:12px\">\n      <span class=\"muted\">提示：右侧随输入实时更新；导出文件可直接作为汇报底稿或归档。</span>\n    </div>\n  </div>\n</div>\n\n<div class=\"foot\">本工具为纯前端应用，所有数据仅在本机浏览器处理，不上传任何服务器。· WorkBuddy「1024 造物挑战」参赛作品</div>\n\n";

/* ---------- 动态行 ---------- */
function addTimeline(t='',a=''){
  const box=document.getElementById('timeline');
  const row=document.createElement('div');row.className='timeline-row';
  row.innerHTML=`<input type="datetime-local" value="${t}">
    <input type="text" placeholder="处理动作 / 处置说明" value="${a.replace(/"/g,'&quot;')}">
    <button class="btn-ic">×</button>`;
  box.appendChild(row);render();
}
function addFix(item='',type='流程补齐',due=''){
  const box=document.getElementById('fixes');
  const row=document.createElement('div');row.className='fix-row';
  row.innerHTML=`<input type="text" placeholder="改进项描述" value="${item.replace(/"/g,'&quot;')}">
    <select>
      ${['流程补齐','优化','加固','监控补齐','演练'].map(o=>`<option ${o===type?'selected':''}>${o}</option>`).join('')}
    </select>
    <input type="date" value="${due}">
    <button class="btn-ic">×</button>`;
  box.appendChild(row);render();
}

/* ---------- 工具 ---------- */
function fmt(dt){ if(!dt) return ''; const d=new Date(dt); if(isNaN(d)) return dt;
  const p=n=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }
function calcMTTR(){
  const s=document.getElementById('start').value, e=document.getElementById('end').value;
  const badge=document.getElementById('mttrBadge');
  if(s&&e){ const ms=new Date(e)-new Date(s);
    if(ms>=0){ const m=Math.floor(ms/60000), h=Math.floor(m/60);
      const txt= h>0?`${h} 小时 ${m%60} 分`:`${m} 分钟`;
      badge.textContent='故障时长：'+txt; render(); return; } }
  badge.textContent='故障时长：—'; render();
}

/* ---------- 收集 ---------- */
function collect(){
  const view=document.querySelector('input[name=view]:checked').value;
  const tl=[...document.querySelectorAll('#timeline .timeline-row')].map(r=>{
    const i=r.querySelectorAll('input'); return {t:i[0].value,a:i[1].value};}).filter(x=>x.t||x.a);
  const fx=[...document.querySelectorAll('#fixes .fix-row')].map(r=>{
    const i=r.querySelectorAll('input'),s=r.querySelector('select'); return {item:i[0].value,type:s.value,due:i[1].value};}).filter(x=>x.item);
  return {
    view,
    title:document.getElementById('title').value.trim(),
    start:document.getElementById('start').value,
    end:document.getElementById('end').value,
    sev:document.getElementById('sev').value,
    scope:document.getElementById('scope').value.trim(),
    impactScope:document.getElementById('impactScope').value.trim(),
    symptom:document.getElementById('symptom').value.trim(),
    bizImpact:document.getElementById('bizImpact').value.trim(),
    tl,
    rootInternal:document.getElementById('rootInternal').value.trim(),
    rootExternal:document.getElementById('rootExternal').value.trim(),
    fx,
    lesson:document.getElementById('lesson').value.trim(),
  };
}

/* ---------- 渲染 ---------- */
function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function durText(){
  const s=document.getElementById('start').value,e=document.getElementById('end').value;
  if(s&&e){const ms=new Date(e)-new Date(s);if(ms>=0){const m=Math.floor(ms/60000),h=Math.floor(m/60);return h>0?`${h} 小时 ${m%60} 分`:`${m} 分钟`;}}
  return '—';
}
function render(){
  const d=collect();
  const isExt=d.view==='external';
  document.getElementById('previewTag').textContent='实时预览 · '+(isExt?'对外汇报版':'内部技术档案版');
  const viewPill=isExt?'<span class="pill">对外汇报版</span>':'<span class="pill">内部技术档案版</span>';
  let h='';
  h+=`<h1>${esc(d.title||'（未命名故障）复盘报告')}</h1>`;
  h+=`<div class="meta">${viewPill}<span class="pill">${esc(d.sev)}</span> 故障时段：${fmt(d.start)||'—'} ~ ${fmt(d.end)||'—'} ｜ 时长：${durText()}<br>影响范围：${esc(d.scope||'—')} ${d.impactScope?('（'+esc(d.impactScope)+'）'):''}</div>`;

  h+=`<h3>一、故障现象</h3><p>${esc(d.symptom)||'（待补充）'}</p>`;
  h+=`<h3>二、业务影响</h3><p>${esc(d.bizImpact)||'（待补充）'}</p>`;

  h+=`<h3>三、处理时间线</h3>`;
  if(d.tl.length){ h+='<ol>'+d.tl.map(x=>`<li><b>${fmt(x.t)||'时间未填'}</b> — ${esc(x.a)||'（动作未填）'}</li>`).join('')+'</ol>'; }
  else h+='<p>（待补充）</p>';

  h+=`<h3>四、根因分析</h3>`;
  if(isExt){ h+=`<p>${esc(d.rootExternal)||'（待补充：一句话概述）'}</p>`; }
  else { h+=`<p>${esc(d.rootInternal)||'（待补充：技术细节）'}</p>`; }

  h+=`<h3>五、改进项 / 后续动作</h3>`;
  if(d.fx.length){
    h+='<table><tr><th>改进项</th><th>类型</th><th>计划完成</th></tr>'+
      d.fx.map(x=>`<tr><td>${esc(x.item)}</td><td>${esc(x.type)}</td><td>${esc(x.due)||'—'}</td></tr>`).join('')+'</table>';
  } else h+='<p>（待补充）</p>';

  h+=`<h3>六、经验教训</h3><p>${esc(d.lesson)||'（待补充）'}</p>`;
  document.getElementById('doc').innerHTML=h;
}

/* ---------- 导出 ---------- */
function buildMD(){
  const d=collect(); const isExt=d.view==='external';
  const L=[];
  L.push(`# ${d.title||'（未命名故障）复盘报告'}`);
  L.push(`> 视角：${isExt?'对外汇报版':'内部技术档案版'} ｜ 严重程度：${d.sev} ｜ 时段：${fmt(d.start)||'—'} ~ ${fmt(d.end)||'—'} ｜ 时长：${durText()}`);
  L.push(`> 影响范围：${d.scope||'—'} ${d.impactScope?('（'+d.impactScope+'）'):''}`);
  L.push('');
  L.push('## 一、故障现象'); L.push(d.symptom||'（待补充）'); L.push('');
  L.push('## 二、业务影响'); L.push(d.bizImpact||'（待补充）'); L.push('');
  L.push('## 三、处理时间线');
  if(d.tl.length) d.tl.forEach(x=>L.push(`- **${fmt(x.t)||'时间未填'}** — ${x.a||'（动作未填）'}`)); else L.push('（待补充）');
  L.push('');
  L.push('## 四、根因分析');
  L.push(isExt?(d.rootExternal||'（待补充）'):(d.rootInternal||'（待补充）')); L.push('');
  L.push('## 五、改进项 / 后续动作');
  if(d.fx.length){ L.push('| 改进项 | 类型 | 计划完成 |'); L.push('| --- | --- | --- |');
    d.fx.forEach(x=>L.push(`| ${x.item} | ${x.type} | ${x.due||'—'} |`)); } else L.push('（待补充）');
  L.push('');
  L.push('## 六、经验教训'); L.push(d.lesson||'（待补充）');
  return L.join('\n');
}
function buildStandaloneHTML(){
  const d=collect(); const isExt=d.view==='external';
  const body=document.getElementById('doc').innerHTML;
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>${esc(d.title||'故障复盘报告')}</title>
  <style>body{font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;max-width:820px;margin:40px auto;padding:0 20px;color:#1f2733;line-height:1.7}
  h1{font-size:22px}h3{color:#2b3650;border-left:3px solid #4f6ef7;padding-left:8px;margin-top:22px}
  .meta{color:#5b6776;font-size:13px;border-bottom:1px dashed #e6eaf0;padding-bottom:10px}
  table{border-collapse:collapse;width:100%;margin:8px 0;font-size:13px}th,td{border:1px solid #e6eaf0;padding:6px 8px}
  th{background:#eef1fe}.pill{background:#eef1fe;color:#4f6ef7;border-radius:6px;padding:1px 8px;font-size:12px;margin-right:6px}</style></head>
  <body>${body}<hr><p style="color:#999;font-size:12px">由「故障复盘报告生成器」生成</p></body></html>`;
}
function copyMD(){ navigator.clipboard.writeText(buildMD()).then(()=>alert('Markdown 已复制到剪贴板')); }
function dlMD(){ const b=new Blob([buildMD()],{type:'text/markdown'}); const a=document.createElement('a');
  a.href=URL.createObjectURL(b); a.download=(collect().title||'故障复盘报告')+'.md'; a.click(); }
function dlHTML(){ const b=new Blob([buildStandaloneHTML()],{type:'text/html'}); const a=document.createElement('a');
  a.href=URL.createObjectURL(b); a.download=(collect().title||'故障复盘报告')+'.html'; a.click(); }

/* ---------- 措辞检查 ---------- */
const SENS=[
  ['失误','偏差'],['失职','流程缺口'],['误操作','操作偏差'],['人为','操作层面'],['疏漏','覆盖不足'],
  ['责任','改进责任'],['不当','待优化'],['违规','待规范'],['故障系XX导致','改进项如下'],['粗心','环节待加强'],
  ['未按要求','流程待补齐'],['管理不善','机制待完善']
];
function runCheck(){
  const d=collect();
  const text=[d.symptom,d.bizImpact,d.rootInternal,d.rootExternal,d.lesson,...d.fx.map(x=>x.item)].join('\n');
  const found=[];
  SENS.forEach(([w,s])=>{ if(text.includes(w)) found.push([w,s]); });
  const out=document.getElementById('checkOut');
  if(!found.length){ out.innerHTML='<div class="item ok">✅ 未发现明显"定责"类敏感词，措辞符合无责原则。</div>'; return; }
  out.innerHTML=found.map(([w,s])=>`<div class="item"><span class="bad">⚠ 命中："${w}"</span> → 建议替换为 <span class="sug">"${s}"</span></div>`).join('')+
    `<div class="item muted">共 ${found.length} 处建议调整，替换后可更稳妥地面向汇报场景。</div>`;
}

/* ---------- 初始化 ---------- */
addTimeline(); addFix(); render();
document.querySelectorAll('input[name=view]').forEach(r=>r.addEventListener('change',render));
['title','start','end','sev','scope','impactScope','symptom','bizImpact','rootInternal','rootExternal','lesson']
  .forEach(id=>document.getElementById(id).addEventListener('input',render));
document.getElementById('end').addEventListener('change',calcMTTR);
document.getElementById('start').addEventListener('input',calcMTTR);

document.addEventListener('input',e=>{if(e.target.closest('#timeline,#fixes')) render();});
document.addEventListener('change',e=>{if(e.target.closest('#fixes')) render();});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.matches('#timeline .btn-ic,#fixes .btn-ic')){b.parentNode.remove();render();}else if(b.matches('#timeline + .addbtn'))addTimeline();else if(b.matches('#fixes + .addbtn'))addFix();else if(b.closest('.check-result')){}else if(b.textContent.trim()==='运行措辞检查')runCheck();else if(b.textContent.trim()==='复制 Markdown')copyMD();else if(b.textContent.trim()==='下载 .md')dlMD();else if(b.textContent.trim()==='下载报告.html')dlHTML();});
