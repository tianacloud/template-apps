const style=document.createElement("style"); style.textContent="\n  :root{\n    --bg:#f4f6fb; --card:#ffffff; --ink:#1c2433; --sub:#6b7585;\n    --line:#e9edf4; --brand:#2f6bff; --brand-d:#1f4fd6;\n    --up:#e23b3b; --down:#1aa463;   /* A股习惯：涨红跌绿 */\n    --warn:#f0a020; --bad:#e23b3b; --good:#1aa463; --okbg:#eafaf1;\n    --shadow:0 6px 22px rgba(28,36,51,.08);\n  }\n  *{box-sizing:border-box;margin:0;padding:0}\n  body{font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n    background:var(--bg);color:var(--ink);line-height:1.55;padding:20px 14px 60px}\n  .wrap{max-width:1040px;margin:0 auto}\n  header.top{background:linear-gradient(120deg,#2f6bff,#5b8bff);color:#fff;border-radius:18px;\n    padding:22px 24px;box-shadow:var(--shadow);position:relative;overflow:hidden}\n  header.top:after{content:\"\";position:absolute;right:-40px;top:-40px;width:180px;height:180px;\n    background:rgba(255,255,255,.12);border-radius:50%}\n  header.top h1{font-size:23px;letter-spacing:.5px;display:flex;align-items:center;gap:10px}\n  header.top .tag{font-size:12px;background:rgba(255,255,255,.22);padding:3px 10px;border-radius:999px;font-weight:400}\n  header.top p{margin-top:8px;opacity:.92;font-size:14px;max-width:680px}\n  .toolbar{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 14px}\n  .btn{border:none;border-radius:10px;padding:10px 16px;font-size:14px;cursor:pointer;font-weight:600;transition:.15s}\n  .btn.primary{background:var(--brand);color:#fff}\n  .btn.primary:hover{background:var(--brand-d)}\n  .btn.ghost{background:#fff;color:var(--brand);border:1px solid var(--line)}\n  .btn.ghost:hover{border-color:var(--brand)}\n  .btn.danger{background:#fff;color:var(--bad);border:1px solid #f3c9c9}\n  .summary{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:16px}\n  .sc{background:var(--card);border-radius:14px;padding:14px 14px;box-shadow:var(--shadow)}\n  .sc .k{font-size:12px;color:var(--sub)}\n  .sc .v{font-size:20px;font-weight:700;margin-top:4px;word-break:break-all}\n  .sc .v.sm{font-size:17px}\n  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px}\n  .panel{background:var(--card);border-radius:14px;padding:16px;box-shadow:var(--shadow)}\n  .panel h3{font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:8px}\n  .panel h3 .dot{width:8px;height:8px;border-radius:50%;background:var(--brand)}\n  .donut-wrap{display:flex;align-items:center;gap:14px}\n  .donut{flex:0 0 150px}\n  .legend{font-size:13px;display:flex;flex-direction:column;gap:6px;flex:1}\n  .legend .li{display:flex;align-items:center;gap:8px}\n  .legend .sw{width:11px;height:11px;border-radius:3px;flex:0 0 auto}\n  .legend .nm{flex:1;color:var(--sub)}\n  .legend .pc{font-weight:700}\n  .bars{display:flex;flex-direction:column;gap:8px}\n  .bar{display:flex;align-items:center;gap:10px;font-size:13px}\n  .bar .nm{width:84px;color:var(--sub);flex:0 0 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n  .bar .track{flex:1;height:14px;background:#eef1f7;border-radius:7px;overflow:hidden}\n  .bar .fill{height:100%;border-radius:7px}\n  .bar .val{width:74px;text-align:right;font-weight:600;flex:0 0 auto}\n  .diag .row{display:flex;gap:10px;padding:10px 0;border-bottom:1px dashed var(--line);font-size:13.5px}\n  .diag .row:last-child{border-bottom:none}\n  .diag .ic{flex:0 0 22px;font-size:15px}\n  .diag .tx{flex:1}\n  .diag .tx b{display:block;margin-bottom:1px}\n  .diag .tx span{color:var(--sub);font-size:12.5px}\n  .score{display:flex;align-items:center;gap:16px;margin-bottom:10px}\n  .score .ring{position:relative;width:84px;height:84px;flex:0 0 auto}\n  .score .ring .num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;\n    font-size:24px;font-weight:800}\n  .score .gl{font-size:13px;color:var(--sub)}\n  .score .gl b{font-size:18px;color:var(--ink);display:block}\n  table{width:100%;border-collapse:collapse;font-size:13.5px;background:var(--card);\n    border-radius:14px;overflow:hidden;box-shadow:var(--shadow)}\n  thead th{background:#f7f9fd;text-align:right;padding:11px 12px;color:var(--sub);font-weight:600;font-size:12.5px;\n    border-bottom:1px solid var(--line);white-space:nowrap}\n  thead th:first-child{text-align:left}\n  tbody td{padding:11px 12px;text-align:right;border-bottom:1px solid var(--line);white-space:nowrap}\n  tbody td:first-child{text-align:left}\n  tbody tr:last-child td{border-bottom:none}\n  .nm-cell b{font-weight:600}\n  .nm-cell small{color:var(--sub);display:block;font-size:11.5px}\n  .pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11.5px;background:#eef1f7;color:var(--sub)}\n  .up{color:var(--up);font-weight:600}\n  .down{color:var(--down);font-weight:600}\n  .rowact button{border:none;background:#f3f5fa;color:var(--sub);border-radius:7px;padding:4px 9px;\n    font-size:12px;cursor:pointer;margin-left:4px}\n  .rowact button:hover{background:#e6e9f1;color:var(--brand)}\n  .empty{padding:30px;text-align:center;color:var(--sub);font-size:14px}\n  /* modal */\n  .mask{position:fixed;inset:0;background:rgba(20,28,45,.45);display:none;align-items:center;justify-content:center;padding:16px;z-index:50}\n  .mask.on{display:flex}\n  .modal{background:#fff;border-radius:16px;width:100%;max-width:440px;padding:20px;box-shadow:0 18px 50px rgba(0,0,0,.25)}\n  .modal h3{font-size:16px;margin-bottom:14px}\n  .fld{margin-bottom:11px}\n  .fld label{display:block;font-size:12.5px;color:var(--sub);margin-bottom:4px}\n  .fld input,.fld select{width:100%;border:1px solid var(--line);border-radius:9px;padding:9px 11px;font-size:14px;outline:none}\n  .fld input:focus,.fld select:focus{border-color:var(--brand)}\n  .f2{display:flex;gap:10px}\n  .f2 .fld{flex:1}\n  .modal .mactions{display:flex;justify-content:flex-end;gap:10px;margin-top:8px}\n  .note{font-size:12px;color:var(--sub);margin-top:10px;text-align:center}\n  @media(max-width:760px){\n    .summary{grid-template-columns:repeat(2,1fr)}\n    .grid2{grid-template-columns:1fr}\n  }\n"; style.textContent += "\n.grid2,.panel{min-width:0}.panel:has(table){overflow-x:auto}.f2 .fld{min-width:0}.modal{min-width:0;max-height:calc(100dvh - 32px);overflow-y:auto}.fld input,.fld select{min-width:0}"; document.head.appendChild(style);
document.getElementById("app").innerHTML="\n<div class=\"wrap\">\n  <header class=\"top\">\n    <h1>🩺 持仓体检表 <span class=\"tag\">投资组合健康诊断助手</span></h1>\n    <p>一键诊断你的投资组合：结构集中度、行业分布、盈亏面与单只风险，给出可执行的体检建议。数据保存在本机浏览器，可导出备份。</p>\n  </header>\n\n  <div class=\"toolbar\">\n    <button class=\"btn primary\" id=\"addBtn\">＋ 添加持仓</button>\n    <button class=\"btn ghost\" id=\"resetBtn\">恢复示例</button>\n    <button class=\"btn ghost\" id=\"exportBtn\">导出 JSON</button>\n    <button class=\"btn danger\" id=\"clearBtn\">清空全部</button>\n  </div>\n\n  <div class=\"summary\" id=\"summary\"></div>\n\n  <div class=\"grid2\">\n    <div class=\"panel\">\n      <h3><span class=\"dot\"></span>行业分布（按市值）</h3>\n      <div class=\"donut-wrap\">\n        <svg class=\"donut\" id=\"donut\" viewBox=\"0 0 120 120\"></svg>\n        <div class=\"legend\" id=\"legend\"></div>\n      </div>\n    </div>\n    <div class=\"panel\">\n      <h3><span class=\"dot\"></span>盈亏贡献（前 6）</h3>\n      <div class=\"bars\" id=\"plBars\"></div>\n    </div>\n  </div>\n\n  <div class=\"grid2\">\n    <div class=\"panel diag\">\n      <h3><span class=\"dot\"></span>综合体检评分</h3>\n      <div class=\"score\" id=\"scoreBox\"></div>\n      <div id=\"diagList\"></div>\n    </div>\n    <div class=\"panel\">\n      <h3><span class=\"dot\"></span>持仓明细</h3>\n      <table>\n        <thead><tr>\n          <th>名称 / 代码</th><th>类型</th><th>市值</th><th>占比</th><th>盈亏%</th><th></th>\n        </tr></thead>\n        <tbody id=\"tbody\"></tbody>\n      </table>\n      <div class=\"empty\" id=\"emptyTip\" style=\"display:none\">还没有持仓，点「＋ 添加持仓」或「恢复示例」体验。</div>\n    </div>\n  </div>\n  <div class=\"note\">示例数据为示意价格，仅用于演示诊断逻辑；正式使用时请填入你真实的持仓与行情。</div>\n</div>\n\n<!-- modal -->\n<div class=\"mask\" id=\"mask\">\n  <div class=\"modal\">\n    <h3 id=\"mTitle\">添加持仓</h3>\n    <div class=\"f2\">\n      <div class=\"fld\"><label>名称</label><input id=\"iName\" placeholder=\"如 贵州茅台\"></div>\n      <div class=\"fld\"><label>代码</label><input id=\"iCode\" placeholder=\"如 600519\"></div>\n    </div>\n    <div class=\"f2\">\n      <div class=\"fld\"><label>类型</label>\n        <select id=\"iType\"><option>股票</option><option>ETF</option><option>基金</option><option>其他</option></select>\n      </div>\n      <div class=\"fld\"><label>行业 / 板块</label><input id=\"iInd\" placeholder=\"如 白酒 / 新能源\"></div>\n    </div>\n    <div class=\"f2\">\n      <div class=\"fld\"><label>数量（股/份）</label><input id=\"iQty\" placeholder=\"100\" type=\"number\"></div>\n      <div class=\"fld\"><label>成本价</label><input id=\"iCost\" placeholder=\"1600\" type=\"number\"></div>\n    </div>\n    <div class=\"fld\"><label>现价</label><input id=\"iPrice\" placeholder=\"1500\" type=\"number\"></div>\n    <div class=\"mactions\">\n      <button class=\"btn ghost\" id=\"mCancel\">取消</button>\n      <button class=\"btn primary\" id=\"mSave\">保存</button>\n    </div>\n  </div>\n</div>\n\n";

const KEY="wb_portfolio_v1";
const PALETTE=["#2f6bff","#1aa463","#f0a020","#e23b3b","#8a5cf6","#11b5c4","#ef6aa0","#7a869a","#3ec98a","#d9822b"];
let data=load();
let editing=null;

function load(){try{const s=localStorage.getItem(KEY);if(s)return JSON.parse(s);}catch(e){}
  return sample();}
function save(){localStorage.setItem(KEY,JSON.stringify(data));}
function sample(){return [
  {name:"贵州茅台",code:"600519",type:"股票",ind:"白酒",qty:100,cost:1600,price:1500},
  {name:"招商银行",code:"600036",type:"股票",ind:"银行",qty:2000,cost:35,price:38},
  {name:"宁德时代",code:"300750",type:"股票",ind:"新能源",qty:300,cost:250,price:210},
  {name:"比亚迪",code:"002594",type:"股票",ind:"新能源",qty:200,cost:260,price:245},
  {name:"药明康德",code:"603259",type:"股票",ind:"医药",qty:500,cost:80,price:72},
  {name:"东方财富",code:"300059",type:"股票",ind:"科技",qty:1000,cost:14,price:16},
  {name:"沪深300ETF",code:"510300",type:"ETF",ind:"宽基",qty:5000,cost:3.8,price:3.9},
  {name:"万科A",code:"000002",type:"股票",ind:"地产",qty:3000,cost:18,price:8}
];}

function fmt(n){if(n==null||isNaN(n))return"–";const a=Math.abs(n);
  if(a>=1e8)return(n/1e8).toFixed(2)+"亿";
  return a>=1e4? (n/1e4).toFixed(2)+"万" : n.toFixed(2);}
function money(n){if(n==null||isNaN(n))return"–";const s=n<0?"-":"";const a=Math.abs(n);
  return s+"¥"+a.toLocaleString("zh-CN",{maximumFractionDigits:0});}

function calc(){
  let total=0,costAll=0,plAll=0;const rows=[];
  data.forEach((d,i)=>{const mv=d.qty*d.price, cb=d.qty*d.cost, pl=mv-cb, plp=cb>0?pl/cb*100:0;
    rows.push({...d,i,mv,cb,pl,plp});total+=mv;costAll+=cb;plAll+=pl;});
  rows.forEach(r=>r.pct=total>0?r.mv/total*100:0);
  return {rows,total,costAll,plAll,plp:costAll>0?plAll/costAll*100:0};
}

function render(){
  const {rows,total,costAll,plAll,plp}=calc();
  // summary
  const loss = rows.filter(r=>r.pl<0).length;
  const inds = new Set(rows.map(r=>r.ind)).size;
  const sum=[["总资产",money(total),false],["总盈亏",money(plAll),true],
    ["总收益率",(plp>=0?"+":"")+plp.toFixed(1)+"%",true],
    ["持仓数",rows.length+" 只",false],["行业数",inds+" 个",false]];
  document.getElementById("summary").innerHTML=sum.map((s,idx)=>{
    let cls=""; if(s[2]) cls= s[1].startsWith("-")||s[1].startsWith("¥-")?"down":(s[1]==="¥0"||s[1]==="0.0%"?"":"up");
    // total P/L coloring
    if(idx===1) cls = plAll<0?"down":(plAll>0?"up":"");
    if(idx===2) cls = plp<0?"down":"up";
    return `<div class="sc"><div class="k">${s[0]}</div><div class="v ${s[2]?'sm':''}" style="${cls?'color:var(--'+cls+')':''}">${s[1]}</div></div>`;
  }).join("");

  // table
  const tb=document.getElementById("tbody");
  document.getElementById("emptyTip").style.display=rows.length?"none":"block";
  tb.innerHTML=rows.sort((a,b)=>b.mv-a.mv).map(r=>{
    const pc=r.plp>=0?"up":"down";const sign=r.plp>=0?"+":"";
    return `<tr>
      <td class="nm-cell"><b>${esc(r.name)}</b><small>${esc(r.code||'')}</small></td>
      <td><span class="pill">${esc(r.type)}</span></td>
      <td>${money(r.mv)}</td>
      <td>${r.pct.toFixed(1)}%</td>
      <td class="${pc}">${sign}${r.plp.toFixed(1)}%</td>
      <td class="rowact"><button data-e="${r.i}">编辑</button><button data-d="${r.i}">删</button></td>
    </tr>`;
  }).join("");

  renderDonut(rows,total);
  renderPL(rows);
  renderDiag(rows,total);
  bindRow();
}

function renderDonut(rows,total){
  const byInd={};rows.forEach(r=>{byInd[r.ind]=(byInd[r.ind]||0)+r.mv;});
  const entries=Object.entries(byInd).sort((a,b)=>b[1]-a[1]);
  const svg=document.getElementById("donut");const cx=60,cy=60,r=46,C=2*Math.PI*r;let off=0;
  let html=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#eef1f7" stroke-width="14"/>`;
  entries.forEach((e,i)=>{const frac=total>0?e[1]/total:0;const len=frac*C;
    html+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${PALETTE[i%PALETTE.length]}" stroke-width="14"
      stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})"/>`;
    off+=len;});
  html+=`<text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="11" fill="#6b7585">市值</text>
    <text x="${cx}" y="${cy+13}" text-anchor="middle" font-size="14" font-weight="700" fill="#1c2433">${fmt(total)}</text>`;
  svg.innerHTML=html;
  document.getElementById("legend").innerHTML=entries.map((e,i)=>
    `<div class="li"><span class="sw" style="background:${PALETTE[i%PALETTE.length]}"></span>
     <span class="nm">${esc(e[0])}</span><span class="pc">${(total>0?e[1]/total*100:0).toFixed(1)}%</span></div>`).join("");
}

function renderPL(rows){
  const top=[...rows].sort((a,b)=>b.pl-a.pl).slice(0,6);
  const max=Math.max(...top.map(r=>Math.abs(r.pl)),1);
  document.getElementById("plBars").innerHTML=top.map(r=>{
    const w=Math.abs(r.pl)/max*100;const c=r.pl>=0?"var(--up)":"var(--down)";
    const sign=r.pl>=0?"+":"";
    return `<div class="bar"><span class="nm">${esc(r.name)}</span>
      <span class="track"><span class="fill" style="width:${w}%;background:${c}"></span></span>
      <span class="val ${r.pl>=0?'up':'down'}">${sign}${money(r.pl)}</span></div>`;
  }).join("");
}

function renderDiag(rows,total){
  if (!rows.length || total <= 0) { document.getElementById("scoreBox").innerHTML="暂无评分"; document.getElementById("diagList").innerHTML="请添加有市值的持仓后查看体检结果。"; return; }
  const issues=[];
  // 集中度：最大单只
  const sorted=[...rows].sort((a,b)=>b.mv-a.mv);
  const top1=sorted[0], top3=sorted.slice(0,3).reduce((s,r)=>s+r.mv,0);
  const lossCnt=rows.filter(r=>r.pl<0).length, lossPct=rows.length?lossCnt/rows.length*100:0;
  const inds=new Set(rows.map(r=>r.ind)).size;
  const bigLoss=rows.filter(r=>r.plp<=-20);

  if(top1 && top1.pct>40) issues.push(["bad","单一持仓过重","「"+esc(top1.name)+"」占比 "+top1.pct.toFixed(1)+"%，超过 40% 警戒线，回撤会显著拖累整体。","建议将单只仓位控制在 30% 以内。"]);
  else issues.push(["good","单一持仓合理","最大持仓「"+esc(top1.name)+"」占比 "+(top1?top1.pct.toFixed(1):0)+"%，结构相对均衡。","可继续保持。"]);
  if(top3/total>0.7) issues.push(["warn","前三大持仓集中","前三大持仓合计占比 "+(top3/total*100).toFixed(1)+"%，超过 70%，行业或个股联动风险偏高。","适度分散到更多不相关板块。"]);
  else issues.push(["good","持仓分散度良好","前三大持仓合计占比 "+(top3/total*100).toFixed(1)+"%，分散度健康。","维持现有节奏。"]);
  if(lossPct>50) issues.push(["bad","亏损面偏大","当前 "+(lossCnt)+"/"+rows.length+" 只持仓处于亏损，亏损面 "+lossPct.toFixed(0)+"%。","审视逻辑，及时止损弱标的。"]);
  else if(lossPct>0) issues.push(["warn","存在部分亏损","有 "+lossCnt+" 只持仓浮亏，需关注基本面变化。","设置止盈止损线。"]);
  else issues.push(["good","全线盈利","所有持仓当前均为正收益，状态健康。","注意落袋为安。"]);
  if(inds<3) issues.push(["warn","行业覆盖不足","仅覆盖 "+inds+" 个行业，抗单一行业冲击能力弱。","拓展到 3 个以上不相关行业。"]);
  if(bigLoss.length) issues.push(["bad","深度套牢标的","「"+bigLoss.map(r=>esc(r.name)).join("、")+"」浮亏超 20%，警惕价值陷阱。","重新评估持有逻辑。"]);

  // score
  let score=100;
  issues.forEach(it=>{if(it[0]==="bad")score-=18;else if(it[0]==="warn")score-=8;});
  score=Math.max(35,Math.min(100,score));
  const grade=score>=85?"A 优":score>=70?"B 良":score>=55?"C 中":"D 偏弱";
  const col=score>=85?"var(--good)":score>=70?"#3ec98a":score>=55?"var(--warn)":"var(--bad)";
  const circ=2*Math.PI*34;
  document.getElementById("scoreBox").innerHTML=
    `<div class="ring"><svg viewBox="0 0 84 84" width="84" height="84">
      <circle cx="42" cy="42" r="34" fill="none" stroke="#eef1f7" stroke-width="9"/>
      <circle cx="42" cy="42" r="34" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round"
        stroke-dasharray="${score/100*circ} ${circ}" transform="rotate(-90 42 42)"/>
      <text x="42" y="50" text-anchor="middle" font-size="24" font-weight="800" fill="${col}">${score}</text></svg></div>
     <div class="gl">综合健康分<b style="color:${col}">${grade}</b>满分 100，越高越稳健</div>`;

  const icMap={good:"🟢",warn:"🟡",bad:"🔴"};
  document.getElementById("diagList").innerHTML=issues.map(it=>
    `<div class="row"><div class="ic">${icMap[it[0]]}</div>
     <div class="tx"><b>${it[1]}</b><span>${it[2]} ${it[3]}</span></div></div>`).join("");
}

function esc(s){return (s==null?"":String(s)).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

function bindRow(){
  document.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>openModal(+b.dataset.e));
  document.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{data.splice(+b.dataset.d,1);save();render();});
}

/* modal */
const mask=document.getElementById("mask");
function openModal(idx){editing=idx;document.getElementById("mTitle").textContent=idx==null?"添加持仓":"编辑持仓";
  const d=idx==null?{}:data[idx];
  iName.value=d.name||"";iCode.value=d.code||"";iType.value=d.type||"股票";
  iInd.value=d.ind||"";iQty.value=d.qty||"";iCost.value=d.cost||"";iPrice.value=d.price||"";
  mask.classList.add("on");}
function closeModal(){mask.classList.remove("on");editing=null;}
addBtn.onclick=()=>openModal(null);
resetBtn.onclick=()=>{if(confirm("恢复为示例数据？将覆盖当前持仓。")){data=sample();save();render();}};
clearBtn.onclick=()=>{if(confirm("确定清空全部持仓？")){data=[];save();render();}};
exportBtn.onclick=()=>{const b=document.createElement("a");
  b.href="data:application/json,"+encodeURIComponent(JSON.stringify(data,null,2));
  b.download="持仓数据.json";b.click();};
mCancel.onclick=closeModal;
mSave.onclick=()=>{const d={name:iName.value.trim(),code:iCode.value.trim(),type:iType.value,
  ind:iInd.value.trim()||"其他",qty:parseFloat(iQty.value)||0,cost:parseFloat(iCost.value)||0,price:parseFloat(iPrice.value)||0};
  if(!d.name){alert("请填写名称");return;}
  if(editing==null)data.push(d);else data[editing]=d;
  save();closeModal();render();};
mask.onclick=e=>{if(e.target===mask)closeModal();};

render();
