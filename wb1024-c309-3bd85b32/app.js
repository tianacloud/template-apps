document.head.insertAdjacentHTML("beforeend","<style>\n  :root{\n    --primary:#0f4c81;\n    --primary-light:#2563eb;\n    --accent:#1d6fb8;\n    --bg:#f4f7fb;\n    --card:#ffffff;\n    --text:#1f2d3d;\n    --text-soft:#6b7785;\n    --border:#e3e9f0;\n    --warn:#c0392b;\n    --warn-bg:#fdf2f0;\n    --ok:#1e8e5a;\n    --shadow:0 2px 12px rgba(15,76,129,.06);\n    --radius:12px;\n  }\n  *{box-sizing:border-box;margin:0;padding:0}\n  body{\n    font-family:\"Microsoft YaHei\",\"PingFang SC\",\"Segoe UI\",sans-serif;\n    background:var(--bg);\n    color:var(--text);\n    line-height:1.6;\n    -webkit-font-smoothing:antialiased;\n  }\n  .wrap{max-width:1200px;margin:0 auto;padding:24px 20px 60px}\n  header{\n    background:linear-gradient(135deg,#0f4c81 0%,#1d6fb8 100%);\n    color:#fff;border-radius:var(--radius);\n    padding:28px 32px;box-shadow:var(--shadow);margin-bottom:24px;\n  }\n  header h1{font-size:22px;font-weight:700;letter-spacing:.5px}\n  header p{font-size:13px;opacity:.88;margin-top:6px}\n  .layout{display:grid;grid-template-columns:1fr 1.15fr;gap:22px}\n  @media(max-width:880px){.layout{grid-template-columns:1fr}}\n  .card{\n    background:var(--card);border-radius:var(--radius);\n    box-shadow:var(--shadow);padding:22px 24px;margin-bottom:20px;\n    border:1px solid var(--border);\n  }\n  .card-title{\n    font-size:15px;font-weight:700;color:var(--primary);\n    border-left:3px solid var(--primary-light);\n    padding-left:10px;margin-bottom:18px;\n  }\n  .field{margin-bottom:16px}\n  .field label{display:block;font-size:13px;color:var(--text-soft);margin-bottom:6px;font-weight:500}\n  .field input,.field select{\n    width:100%;padding:9px 12px;border:1px solid var(--border);\n    border-radius:8px;font-size:14px;color:var(--text);\n    background:#fbfcfe;transition:border-color .2s;\n  }\n  .field input:focus,.field select:focus{outline:none;border-color:var(--primary-light);background:#fff}\n  .row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}\n  .row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}\n  .rate-table{width:100%;border-collapse:collapse;font-size:13px}\n  .rate-table th,.rate-table td{padding:8px 6px;text-align:center;border-bottom:1px solid var(--border)}\n  .rate-table th{background:#f0f5fb;color:var(--primary);font-weight:600;font-size:12px}\n  .rate-table td:first-child{text-align:left;font-weight:500}\n  .rate-table input{width:64px;padding:5px 6px;text-align:center;border:1px solid var(--border);border-radius:6px;font-size:13px}\n  .rate-table input:focus{outline:none;border-color:var(--primary-light)}\n  .hint{font-size:12px;color:var(--text-soft);margin-top:8px;line-height:1.5}\n  .hint.warn{color:var(--warn)}\n  .toggle-bar{\n    display:flex;justify-content:space-between;align-items:center;\n    cursor:pointer;user-select:none;padding:8px 0;\n  }\n  .toggle-bar .arrow{font-size:12px;color:var(--text-soft);transition:transform .2s}\n  .toggle-bar.open .arrow{transform:rotate(90deg)}\n  .collapsible{max-height:0;overflow:hidden;transition:max-height .3s ease}\n  .collapsible.open{max-height:600px}\n\n  /* 结果区 */\n  .summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:18px}\n  @media(max-width:520px){.summary-grid{grid-template-columns:1fr}}\n  .sum-card{\n    border-radius:10px;padding:16px;text-align:center;\n    border:1px solid var(--border);\n  }\n  .sum-card .lbl{font-size:12px;color:var(--text-soft);margin-bottom:6px}\n  .sum-card .val{font-size:22px;font-weight:700}\n  .sum-card.principal{background:#eef4fc}\n  .sum-card.principal .val{color:var(--primary)}\n  .sum-card.penalty{background:var(--warn-bg)}\n  .sum-card.penalty .val{color:var(--warn)}\n  .sum-card.total{background:#0f4c81;color:#fff;border-color:#0f4c81}\n  .sum-card.total .lbl{color:rgba(255,255,255,.8)}\n  .sum-card.total .val{color:#fff}\n\n  .breakdown{display:flex;gap:18px;margin-bottom:16px;flex-wrap:wrap}\n  .bd-item{flex:1;min-width:120px;background:#f8fafd;border-radius:8px;padding:12px;text-align:center}\n  .bd-item .k{font-size:12px;color:var(--text-soft)}\n  .bd-item .v{font-size:16px;font-weight:600;color:var(--text);margin-top:4px}\n\n  table.detail{width:100%;border-collapse:collapse;font-size:13px}\n  table.detail th,table.detail td{padding:9px 8px;text-align:right;border-bottom:1px solid var(--border)}\n  table.detail th{background:#f0f5fb;color:var(--primary);font-weight:600;font-size:12px;text-align:center}\n  table.detail td:first-child,table.detail th:first-child{text-align:center}\n  table.detail tr:last-child td{font-weight:600;background:#f7faff;border-top:2px solid var(--primary-light)}\n  .empty{text-align:center;color:var(--text-soft);padding:30px;font-size:13px}\n\n  .btn-print{\n    background:var(--primary);color:#fff;border:none;border-radius:8px;\n    padding:9px 20px;font-size:13px;cursor:pointer;float:right;transition:background .2s;\n  }\n  .btn-print:hover{background:#0b3a64}\n  .note-box{\n    background:#fffbe6;border:1px solid #f0d86a;border-radius:8px;\n    padding:12px 14px;font-size:12px;color:#7a5c00;margin-top:16px;line-height:1.6;\n  }\n  @media print{\n    .btn-print,.collapsible header,.layout .card:first-child{display:none}\n    body{background:#fff}\n    .card{box-shadow:none;border:1px solid #ccc}\n  }\n</style>");
document.getElementById("app").innerHTML="\n<div class=\"wrap\">\n  <header>\n    <h1>社保欠缴费用计算器</h1>\n    <p>支持五险分项费率设置 · 按月计算欠缴本金与滞纳金 · 单位/个人分项汇总</p>\n  </header>\n\n  <div class=\"layout\">\n    <!-- 左：输入区 -->\n    <div>\n      <div class=\"card\">\n        <div class=\"card-title\">基础参数</div>\n        <div class=\"row2\">\n          <div class=\"field\">\n            <label>应缴费基数（元/月）</label>\n            <input id=\"dueBase\" min=\"0\" step=\"100\" type=\"number\" value=\"8000\">\n            <div class=\"hint\">按规定应使用的缴费基数</div>\n          </div>\n          <div class=\"field\">\n            <label>实际缴费基数（元/月）</label>\n            <input id=\"actBase\" min=\"0\" step=\"100\" type=\"number\" value=\"5000\">\n            <div class=\"hint\">已实际申报/缴纳的基数</div>\n          </div>\n        </div>\n        <div class=\"field\">\n          <label>基数差额（应缴 − 实际，元/月）</label>\n          <input id=\"baseDiff\" readonly type=\"text\" style=\"background:#eef4fc; font-weight:600; color:var(--primary)\">\n          <div class=\"hint\">差额&gt;0 表示少缴，按差额计算欠缴本金及滞纳金</div>\n        </div>\n        <div class=\"row2\">\n          <div class=\"field\">\n            <label>欠缴起始月</label>\n            <input id=\"startMonth\" type=\"month\" value=\"2025-01\">\n          </div>\n          <div class=\"field\">\n            <label>欠缴结束月</label>\n            <input id=\"endMonth\" type=\"month\" value=\"2025-06\">\n          </div>\n        </div>\n        <div class=\"field\">\n          <label>拟补缴日期</label>\n          <input id=\"payDate\" type=\"date\">\n          <div class=\"hint\">用于计算滞纳金截止日（默认今天）</div>\n        </div>\n      </div>\n\n      <div class=\"card\">\n        <div class=\"card-title\">险种费率设置（%）</div>\n        <table class=\"rate-table\">\n          <thead>\n            <tr><th>险种</th><th>单位(%)</th><th>个人(%)</th><th>合计(%)</th></tr>\n          </thead>\n          <tbody id=\"rateBody\"></tbody>\n        </table>\n        <div class=\"hint\">默认费率仅供参考，各地政策与行业不同（如工伤0.2%~1.9%），请按当地实际调整。</div>\n\n        <div class=\"toggle-bar\" id=\"advToggle\">\n          <span style=\"font-size:13px; color:var(--text-soft); font-weight:500\">高级选项</span>\n          <span class=\"arrow\">▶</span>\n        </div>\n        <div class=\"collapsible\" id=\"advPanel\">\n          <div class=\"field\" style=\"margin-top:10px\">\n            <label>滞纳金费率（每日）</label>\n            <div class=\"row2\">\n              <input id=\"penaltyRate\" min=\"0\" step=\"0.001\" type=\"number\" value=\"0.05\">\n              <select id=\"penaltyUnit\">\n                <option value=\"0.01\">% (百分之)</option>\n                <option value=\"0.00001\">十万分之</option>\n              </select>\n            </div>\n            <div class=\"hint\">《社会保险法》规定按日加收万分之五</div>\n          </div>\n          <div class=\"field\">\n            <label>滞纳金起算规则</label>\n            <select id=\"startRule\">\n              <option value=\"1\">从欠缴月次月1日起算</option>\n              <option value=\"16\">从欠缴月次月16日起算（次月15日为缴费截止）</option>\n              <option value=\"0\">从欠缴当月起算（当月底前应缴）</option>\n            </select>\n            <div class=\"hint\">不同地区社保征缴时间不同，请按当地规定选择</div>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"note-box\">\n        ⚠ 本计算器通过\"应缴费基数 − 实际缴费基数\"的差额计算少缴部分的欠缴本金及滞纳金。结果为估算参考，实际欠缴金额以当地社保经办机构核定为准。生育保险在部分地区已并入医疗保险，如当地已合并可将生育费率设为0并在医疗中合并。\n      </div>\n    </div>\n\n    <!-- 右：结果区 -->\n    <div>\n      <div class=\"card\">\n        <div class=\"card-title\" style=\"display:flex; justify-content:space-between; align-items:center\">\n          <span>计算结果</span>\n          <button class=\"btn-print\" onclick=\"window.print()\">打印 / 导出</button>\n        </div>\n        <div class=\"summary-grid\">\n          <div class=\"sum-card principal\">\n            <div class=\"lbl\">欠缴本金合计</div>\n            <div class=\"val\" id=\"totalPrincipal\">—</div>\n          </div>\n          <div class=\"sum-card penalty\">\n            <div class=\"lbl\">滞纳金合计</div>\n            <div class=\"val\" id=\"totalPenalty\">—</div>\n          </div>\n          <div class=\"sum-card total\">\n            <div class=\"lbl\">应补缴总额</div>\n            <div class=\"val\" id=\"grandTotal\">—</div>\n          </div>\n        </div>\n        <div class=\"breakdown\">\n          <div class=\"bd-item\"><div class=\"k\">月基数差额</div><div class=\"v\" id=\"diffShow\">—</div></div>\n          <div class=\"bd-item\"><div class=\"k\">单位承担</div><div class=\"v\" id=\"empPart\">—</div></div>\n          <div class=\"bd-item\"><div class=\"k\">个人承担</div><div class=\"v\" id=\"indPart\">—</div></div>\n          <div class=\"bd-item\"><div class=\"k\">欠缴月数</div><div class=\"v\" id=\"monthCount\">—</div></div>\n        </div>\n      </div>\n\n      <div class=\"card\">\n        <div class=\"card-title\">险种分项汇总</div>\n        <table class=\"detail\" id=\"insSummary\">\n          <thead>\n            <tr><th>险种</th><th>单位本金</th><th>个人本金</th><th>本金小计</th><th>滞纳金</th></tr>\n          </thead>\n          <tbody id=\"insBody\"><tr><td class=\"empty\" colspan=\"5\">请填写参数后自动计算</td></tr></tbody>\n        </table>\n      </div>\n\n      <div class=\"card\">\n        <div class=\"card-title\">逐月明细</div>\n        <table class=\"detail\" id=\"monthDetail\">\n          <thead>\n            <tr><th>欠缴月份</th><th>欠缴本金</th><th>滞纳金起算日</th><th>天数</th><th>滞纳金</th><th>小计</th></tr>\n          </thead>\n          <tbody id=\"monthBody\"><tr><td class=\"empty\" colspan=\"6\">请填写参数后自动计算</td></tr></tbody>\n        </table>\n      </div>\n    </div>\n  </div>\n</div>\n\n";

// 险种默认费率（%）
const INSURANCES = [
  {key:'pension', name:'养老保险', emp:16, ind:8},
  {key:'medical', name:'医疗保险', emp:8,  ind:2},
  {key:'unemp',  name:'失业保险', emp:0.5,ind:0.5},
  {key:'injury', name:'工伤保险', emp:0.4,ind:0},
  {key:'matern', name:'生育保险', emp:0.8,ind:0},
];

const rateBody = document.getElementById('rateBody');
INSURANCES.forEach((it,i)=>{
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${it.name}</td>
    <td><input type="number" data-i="${i}" data-t="emp" value="${it.emp}" min="0" step="0.1"></td>
    <td><input type="number" data-i="${i}" data-t="ind" value="${it.ind}" min="0" step="0.1"></td>
    <td class="sum-rate">${(it.emp+it.ind).toFixed(1)}</td>`;
  rateBody.appendChild(tr);
});

// 高级选项展开
const advToggle=document.getElementById('advToggle');
const advPanel=document.getElementById('advPanel');
advToggle.addEventListener('click',()=>{
  advToggle.classList.toggle('open');
  advPanel.classList.toggle('open');
});

// 默认补缴日为今天
const payDateInput=document.getElementById('payDate');
const today=new Date();
payDateInput.value=today.toISOString().slice(0,10);

function getRates(){
  const inputs=rateBody.querySelectorAll('input');
  const rates=INSURANCES.map((it,i)=>({...it}));
  inputs.forEach(inp=>{
    const i=+inp.dataset.i, t=inp.dataset.t;
    rates[i][t]=parseFloat(inp.value)||0;
    inp.parentElement.nextElementSibling?null:null;
  });
  // 更新合计列
  rateBody.querySelectorAll('tr').forEach((tr,i)=>{
    tr.querySelector('.sum-rate').textContent=(rates[i].emp+rates[i].ind).toFixed(1);
  });
  return rates;
}

rateBody.addEventListener('input',()=>{getRates();compute();});

function parseMonth(str){
  const [y,m]=str.split('-').map(Number);
  return {y,m};
}
function monthDiff(s,e){
  return (e.y-s.y)*12+(e.m-s.m)+1;
}
function fmtDate(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function fmtMoney(n){
  return n.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
}
// 滞纳金起算日：欠缴月(y,m)，按规则计算
function penaltyStartDate(y,m,rule){
  // rule: 0=欠缴当月起算(当月底), 1=次月1日, 16=次月16日
  if(rule===0){
    // 当月底
    return new Date(y, m, 0); // 当月最后一天（m是1-based，传m即上个月最后一天？）
    // 这里 y,m 为欠缴月，m是1-12。当月最后一天 = new Date(y, m, 0) 即下个月第0天=当月最后一天
  } else if(rule===16){
    return new Date(y, m, 16); // 次月16日（JS month是0-based，传m即第m个月（0-based）=欠缴月+1月）
  } else {
    return new Date(y, m, 1); // 次月1日
  }
}

function compute(){
  const dueBase=parseFloat(document.getElementById('dueBase').value)||0;
  const actBase=parseFloat(document.getElementById('actBase').value)||0;
  const base=Math.max(0, dueBase-actBase); // 差额作为计算基数
  const sM=parseMonth(document.getElementById('startMonth').value);
  const eM=parseMonth(document.getElementById('endMonth').value);
  const payD=new Date(document.getElementById('payDate').value+'T00:00:00');
  const penaltyRatePct=parseFloat(document.getElementById('penaltyRate').value)||0;
  const penaltyUnit=parseFloat(document.getElementById('penaltyUnit').value);
  const dailyRate=penaltyRatePct*penaltyUnit; // 日费率小数
  const rule=parseInt(document.getElementById('startRule').value);
  const rates=getRates();

  // 显示差额
  document.getElementById('baseDiff').value='¥'+fmtMoney(base)+' / 月';
  document.getElementById('diffShow').textContent='¥'+fmtMoney(base);

  if(!sM||!eM||isNaN(payD.getTime())){
    return;
  }
  if((eM.y*12+eM.m)<(sM.y*12+sM.m)){
    document.getElementById('monthBody').innerHTML=
      '<tr><td colspan="6" class="empty">结束月早于起始月，请检查</td></tr>';
    return;
  }
  // 实际基数不低于应缴基数，无欠缴
  if(base<=0){
    ['totalPrincipal','totalPenalty','grandTotal','empPart','indPart'].forEach(id=>{
      document.getElementById(id).textContent='¥0.00';
    });
    document.getElementById('monthCount').textContent=monthDiff(sM,eM)+' 个月';
    document.getElementById('insBody').innerHTML='<tr><td colspan="5" class="empty">实际基数≥应缴基数，无少缴欠缴</td></tr>';
    document.getElementById('monthBody').innerHTML='<tr><td colspan="6" class="empty">实际基数≥应缴基数，无少缴欠缴</td></tr>';
    return;
  }

  const months=monthDiff(sM,eM);
  const empTotalRate=rates.reduce((a,b)=>a+b.emp,0);
  const indTotalRate=rates.reduce((a,b)=>a+b.ind,0);
  const monthPrincipal=base*(empTotalRate+indTotalRate)/100;

  // 逐月计算
  let totalPrincipal=0, totalPenalty=0;
  let empPrincipalTotal=0, indPrincipalTotal=0;
  const insData=rates.map(r=>({name:r.name,empP:0,indP:0,pen:0}));
  const monthRows=[];

  for(let i=0;i<months;i++){
    const yy=sM.y+Math.floor((sM.m-1+i)/12);
    const mm=((sM.m-1+i)%12)+1;
    const empPart=base*empTotalRate/100;
    const indPart=base*indTotalRate/100;
    const principal=empPart+indPart;
    totalPrincipal+=principal;
    empPrincipalTotal+=empPart;
    indPrincipalTotal+=indPart;

    // 累加险种本金
    rates.forEach((r,ri)=>{
      insData[ri].empP+=base*r.emp/100;
      insData[ri].indP+=base*r.ind/100;
    });

    // 滞纳金
    const pStart=penaltyStartDate(yy,mm,rule);
    const days=Math.max(0, Math.floor((payD-pStart)/(86400000)));
    const penalty=principal*dailyRate*days;
    totalPenalty+=penalty;

    // 滞纳金分摊到险种（按本金比例）
    rates.forEach((r,ri)=>{
      const p=base*(r.emp+r.ind)/100;
      insData[ri].pen+=p*dailyRate*days;
    });

    monthRows.push({yy,mm,principal,days,pStart,penalty,sub:principal+penalty});
  }

  // 渲染汇总卡片
  document.getElementById('totalPrincipal').textContent='¥'+fmtMoney(totalPrincipal);
  document.getElementById('totalPenalty').textContent='¥'+fmtMoney(totalPenalty);
  document.getElementById('grandTotal').textContent='¥'+fmtMoney(totalPrincipal+totalPenalty);
  // 单位/个人滞纳金按本金比例分摊更准确
  const empPenalty=totalPenalty*empTotalRate/(empTotalRate+indTotalRate||1);
  const indPenalty=totalPenalty*indTotalRate/(empTotalRate+indTotalRate||1);
  document.getElementById('empPart').textContent='¥'+fmtMoney(empPrincipalTotal+empPenalty);
  document.getElementById('indPart').textContent='¥'+fmtMoney(indPrincipalTotal+indPenalty);
  document.getElementById('monthCount').textContent=months+' 个月';

  // 险种汇总
  const insBody=document.getElementById('insBody');
  insBody.innerHTML='';
  insData.forEach(d=>{
    insBody.innerHTML+=`<tr>
      <td style="text-align:left">${d.name}</td>
      <td>${fmtMoney(d.empP)}</td>
      <td>${fmtMoney(d.indP)}</td>
      <td>${fmtMoney(d.empP+d.indP)}</td>
      <td>${fmtMoney(d.pen)}</td>
    </tr>`;
  });
  insBody.innerHTML+=`<tr>
    <td style="text-align:center">合计</td>
    <td>${fmtMoney(empPrincipalTotal)}</td>
    <td>${fmtMoney(indPrincipalTotal)}</td>
    <td>${fmtMoney(totalPrincipal)}</td>
    <td>${fmtMoney(totalPenalty)}</td>
  </tr>`;

  // 逐月明细
  const monthBody=document.getElementById('monthBody');
  monthBody.innerHTML='';
  monthRows.forEach(r=>{
    monthBody.innerHTML+=`<tr>
      <td>${r.yy}-${String(r.mm).padStart(2,'0')}</td>
      <td>${fmtMoney(r.principal)}</td>
      <td>${fmtDate(r.pStart)}</td>
      <td>${r.days}</td>
      <td>${fmtMoney(r.penalty)}</td>
      <td>${fmtMoney(r.sub)}</td>
    </tr>`;
  });
  monthBody.innerHTML+=`<tr>
    <td style="text-align:center">合计</td>
    <td>${fmtMoney(totalPrincipal)}</td>
    <td>—</td>
    <td>—</td>
    <td>${fmtMoney(totalPenalty)}</td>
    <td>${fmtMoney(totalPrincipal+totalPenalty)}</td>
  </tr>`;
}

// 绑定输入事件
['dueBase','actBase','startMonth','endMonth','payDate','penaltyRate','penaltyUnit','startRule'].forEach(id=>{
  document.getElementById(id).addEventListener('input',compute);
  document.getElementById(id).addEventListener('change',compute);
});

// 初始计算
compute();
