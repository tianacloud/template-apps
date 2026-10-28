
/* ================= 计算引擎（可扩展） =================
   还款方式：
     'equal'     等额本息 — 每月还款额固定
     'principal' 等额本金 — 每月本金固定，利息随剩余本金递减
   新增方式只需扩展以下纯函数，渲染层无需改动。            */

function monthlyRate(annual){ return annual/100/12; }            // 年利率(%) → 月利率(小数)

function monthlyPayment(B, r, n, method){
  if(method==='equal') return B*r*Math.pow(1+r,n)/((1+r)**n - 1);
  return B/n + B*r;                                             // 等额本金：首月
}

function totalInterest(B, r, n, method){
  if(method==='equal'){ const P=monthlyPayment(B,r,n,'equal'); return P*n - B; }
  return r*B*(n+1)/2;                                           // 等额本金：利息等差求和
}

/* 方案A：期限不变，减少月供；返回 {newB, payment(首月/固定), term, intAfter} */
function scenarioKeepTerm(B,r,n,method,X){
  const newB=Math.max(B-X,0);
  if(method==='equal'){
    const newP=monthlyPayment(newB,r,n,'equal');
    return {newB, payment:newP, term:n, intAfter:newP*n-newB};
  }else{
    const pp=newB/n;
    return {newB, payment:pp+newB*r, term:n, intAfter:r*newB*(n+1)/2};
  }
}

/* 方案B：月供(等额本息)或每期本金(等额本金)不变，缩短期限；返回 {newB, payment, term, intAfter} */
function scenarioShortenTerm(B,r,n,method,P0,pp0,X){
  const newB=Math.max(B-X,0);
  if(method==='equal'){
    const nB=-Math.log(1-newB*r/P0)/Math.log(1+r);
    return {newB, payment:P0, term:nB, intAfter:P0*nB-newB};
  }else{
    const pp=pp0;
    const nB=newB/pp;
    return {newB, payment:pp+newB*r, term:nB, intAfter:r*newB*(nB+1)/2};
  }
}

/* 加速还清模拟：每月额外还款 + 每年额外还款（年末一次性冲抵本金） */
function simulateExtra(B,r,n,method,extraMonthly,extraYearly){
  let balance=B, totalInt=0, month=0;
  const P0=monthlyPayment(B,r,n,'equal');
  const pp0=B/n;
  while(balance>1e-6 && month<1200){
    month++;
    const interest=balance*r; totalInt+=interest;
    let pay = (method==='equal') ? P0+extraMonthly : pp0+balance*r+extraMonthly;
    pay=Math.min(pay, balance+interest);
    balance=balance+interest-pay;
    // 年末一次性额外还本
    if(extraYearly>0 && month%12===0 && balance>0){
      const yp=Math.min(extraYearly, balance);
      balance-=yp;
    }
  }
  return {month, totalInt};
}

/* 个税综合所得年度税额（含速算扣除数）。taxable = 年应纳税所得额 */
function taxByBracket(taxable){
  const t=Math.max(taxable,0);
  const tbl=[[36000,0.03,0],[144000,0.10,2520],[300000,0.20,16920],
             [420000,0.25,31920],[660000,0.30,52920],[960000,0.35,85920],
             [Infinity,0.45,181920]];
  for(const [cap,rate,quick] of tbl){ if(t<=cap) return Math.max(t*rate-quick,0); }
  return 0;
}
/* 由年应纳税所得额查边际税率（用于展示，让用户核对所属税档） */
function marginalRate(taxable){
  const t=Math.max(taxable,0);
  const tbl=[[36000,0.03],[144000,0.10],[300000,0.20],[420000,0.25],
             [660000,0.30],[960000,0.35],[Infinity,0.45]];
  for(const [cap,rate] of tbl){ if(t<=cap) return rate; }
  return 0.45;
}

/* ================= 渲染层 ================= */
const fmt = x => Math.round(x).toLocaleString('zh-CN');
const fmt2= x => x.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
const $ = id => document.getElementById(id);

function readConfig(){
  return {
    method: $('method').value,
    B: Math.max(parseFloat($('principal').value)||0,0),
    n: Math.max(parseInt($('periods').value)||1,1),
    annual: Math.max(parseFloat($('rate').value)||0,0),
    isFirst: $('taxDeduct').value==='yes',
    taxableIncome: Math.max(parseFloat($('taxIncome').value)||0,0),
    deductedM: Math.max(parseFloat($('deductedM').value)||0,0)
  };
}

function render(){
  const {method,B,n,annual,isFirst,taxableIncome,deductedM}=readConfig();
  const r=monthlyRate(annual);
  const P0=monthlyPayment(B,r,n,method);
  const pp0=B/n;
  const totalInt=totalInterest(B,r,n,method);
  // 首套抵税相关常量（定额抵扣：每月 1,000 元应纳税所得额，最长 240 月）
  const MAXD=240;
  const remainDeductM = isFirst ? Math.max(Math.min(n, MAXD-deductedM),0) : 0;
  // 首套抵税：每年定额扣 12,000 元应纳税所得额；边际税率由年应纳税所得额自动匹配
  const annualTax = isFirst ? (taxByBracket(taxableIncome+12000) - taxByBracket(taxableIncome)) : 0;
  const mRate     = isFirst ? marginalRate(taxableIncome) : 0;

  // ① 当前月供
  $('curPay').textContent = method==='equal' ? '¥'+fmt2(P0)+' / 月'
    : '¥'+fmt2(P0)+' / 月（首月，逐月递减）';
  $('loanRateShow').textContent=annual.toFixed(3)+'%';
  $('breakeven').textContent=annual.toFixed(3)+'%';
  $('perYears').textContent='（约 '+(n/12).toFixed(1)+' 年）';

  // ② 利率比较（单位统一：存款率% → 小数）
  const dPct=parseFloat($('depN').value)||0, d=dPct/100;
  const v=$('verdict'); const spread=(annual/100-d)*100;
  $('depShow').textContent=dPct.toFixed(2)+'%';
  $('spread').textContent=(spread>=0?'+':'')+spread.toFixed(3)+'%';
  if(annual/100>d){v.className='verdict win';$('vTitle').textContent='提前还款 = 赚';
    $('vSub').textContent='贷款利率 '+annual.toFixed(2)+'% ＞ 存款 '+dPct.toFixed(2)+'%，每留 1 元现金少赚 '+spread.toFixed(3)+'%/年 → 应提前还款';}
  else if(annual/100<d){v.className='verdict lose';$('vTitle').textContent='提前还款 = 亏';
    $('vSub').textContent='存款利率 '+dPct.toFixed(2)+'% ＞ 贷款 '+annual.toFixed(2)+'%，保留现金更划算 → 不建议提前还款';}
  else{v.className='verdict flat';$('vTitle').textContent='两者持平';
    $('vSub').textContent='存款利率 = 贷款利率，提前还款无明显差异';}

  // ② 首套抵税 · 税盾展示
  if(isFirst){
    $('taxBox').style.display='';
    $('taxMRate').textContent=(mRate*100).toFixed(0)+'%';
    $('taxAnnual').textContent='¥'+fmt(annualTax)+' / 年';
    $('taxRemain').textContent=remainDeductM+' 月（'+(remainDeductM/12).toFixed(1)+' 年）';
    $('taxTotal').textContent='¥'+fmt(annualTax*remainDeductM/12);
  }else{
    $('taxBox').style.display='none';
  }

  // ③ 还款金额与方式（卡片3的输入）→ 计算结果供 ④ 使用
  let X=Math.min(Math.max(parseFloat($('prepayN').value)||0,0),B);
  $('prepay').max=Math.round(B);          // 滑块上限随剩余本金自动适配（通用化）
  $('prepay').value=X;
  const a=scenarioKeepTerm(B,r,n,method,X);
  const b=scenarioShortenTerm(B,r,n,method,P0,pp0,X);

  // 当前基准状态（不提前还款）
  const basePayTxt = method==='equal' ? '¥'+fmt2(P0) : '¥'+fmt2(P0)+' 起';
  const baseTermTxt = (n/12).toFixed(1)+' 年（'+n+' 期）';
  const baseIntTxt = '¥'+fmt(totalInt);
  $('basePay').textContent=basePayTxt;
  $('baseTerm').textContent=baseTermTxt;
  $('baseInt').textContent=baseIntTxt;

  // ④ 测算结论
  // 4.1 一次性提前还款对比（当前 vs 方案A vs 方案B）
  const pct = v => (totalInt>0 ? (v/totalInt*100):0).toFixed(1)+'%';
  $('cellPA').textContent='¥'+fmt(X);  $('cellPB').textContent='¥'+fmt(X);
  $('cPay').textContent=basePayTxt;     $('aPay').textContent=fmt2(a.payment);  $('bPay').textContent=fmt2(P0)+'（不变）';
  $('cTerm').textContent=baseTermTxt;   $('aTerm').textContent=(a.term/12).toFixed(1)+' 年（'+Math.round(a.term)+' 期）';  $('bTerm').textContent=(b.term/12).toFixed(1)+' 年（'+Math.round(b.term)+' 期）';
  $('cInt').textContent=baseIntTxt;     $('aInt').textContent='¥'+fmt(a.intAfter);  $('bInt').textContent='¥'+fmt(b.intAfter);
  $('aSave').textContent=fmt(totalInt-a.intAfter)+'（'+pct(totalInt-a.intAfter)+'）';
  $('bSave').textContent=fmt(totalInt-b.intAfter)+'（'+pct(totalInt-b.intAfter)+'）';

  // 4.1 抵税相关行（首套可享个税利息抵扣）
  const deductM_A = remainDeductM;                                       // 方案A期限不变，抵税月数=剩余可抵扣
  const deductM_B = isFirst ? Math.max(Math.min(b.term, MAXD-deductedM),0) : 0;
  const tax0 = annualTax*(remainDeductM/12);
  const taxA = annualTax*(deductM_A/12);
  const taxB = annualTax*(deductM_B/12);
  const lossTaxA = tax0 - taxA;                                         // 方案A不缩短期限 → 损失税盾=0
  const lossTaxB = tax0 - taxB;                                         // 方案B缩短期限 → 提前终止抵税，损失税盾
  const taxTxt = v => isFirst ? '¥'+fmt(v) : '—';
  $('cTax').textContent=taxTxt(tax0);        $('aTax').textContent=taxTxt(taxA);        $('bTax').textContent=taxTxt(taxB);
  $('cNetCost').textContent=taxTxt(totalInt-tax0);  $('aNetCost').textContent=taxTxt(a.intAfter-taxA);  $('bNetCost').textContent=taxTxt(b.intAfter-taxB);
  $('aNet').textContent='¥'+fmt((totalInt-a.intAfter)-lossTaxA);
  $('bNet').textContent='¥'+fmt((totalInt-b.intAfter)-lossTaxB);

  // 4.2 持续额外还款对比（当前 vs 加速后）
  const E=Math.max(parseFloat($('extra').value)||0,0);
  const EY=Math.max(parseFloat($('extraY').value)||0,0);
  const sim=simulateExtra(B,r,n,method,E,EY);
  $('exE').textContent  = E>0  ? '¥'+fmt(E)  : '—';
  $('exEY').textContent = EY>0 ? '¥'+fmt(EY) : '—';
  $('cTerm2').textContent=baseTermTxt; $('exYears').textContent=(sim.month/12).toFixed(1)+' 年（'+sim.month+' 期）';
  $('cInt2').textContent=baseIntTxt;   $('exInt').textContent='¥'+fmt(sim.totalInt);
  $('exSave').textContent='¥'+fmt(totalInt-sim.totalInt);

  // 4.2 抵税相关行
  const deductM_ex = isFirst ? Math.max(Math.min(sim.month, MAXD-deductedM),0) : 0;
  const taxEx = annualTax*(deductM_ex/12);
  $('cTax2').textContent=taxTxt(tax0);        $('exTax').textContent=taxTxt(taxEx);
  $('cNetCost2').textContent=taxTxt(totalInt-tax0);  $('exNetCost').textContent=taxTxt(sim.totalInt-taxEx);

  // 收益最大化结论框（纳入首套抵税）
  const rec=$('recBox');
  if(X<=0){
    rec.innerHTML='请在第 ③ 部分填入「提前还款金额」或「每月 / 每年额外还款」，此处给出收益最大化结论。';
  }else if(isFirst){
    const saveB=totalInt-b.intAfter;
    const netB=saveB-lossTaxB;
    const holdGain=X*d*(b.term/12);
    const diff=netB-holdGain;
    rec.innerHTML='【收益最大化 · 已计入首套抵税】你手上有 <b>¥'+fmt(X)+'</b> 闲钱。<br>'
      +'• 选<b>提前还款（方案B 缩短期限）</b>：省利息 ¥'+fmt(saveB)+'，但提前还清会损失未来税盾 ¥'+fmt(lossTaxB)+'，<b>净收益 ¥'+fmt(netB)+'</b>。<br>'
      +'• 选<b>不提前、把这笔钱存 '+dPct.toFixed(2)+'%</b>：约 ¥'+fmt(holdGain)+'（按方案B '+(b.term/12).toFixed(1)+' 年计），且保留全部税盾。<br>'
      +'<b>结论：'+(diff>0 ? '提前还款更划算，净收益多出 ¥'+fmt(diff) : '持有现金更划算，多出 ¥'+fmt(-diff)+'，且保留抵税')+'。</b>';
  }else{
    const netB=totalInt-b.intAfter;
    const holdGain=X*d*(b.term/12);
    const diff=netB-holdGain;
    rec.innerHTML='【收益最大化】贷款 '+annual.toFixed(2)+'% '+(annual/100>d?'＞':'≤')+' 存款 '+dPct.toFixed(2)+'%，对手中 <b>¥'+fmt(X)+'</b> 闲钱：<br>'
      +'• 提前还款（方案B 缩短期限）：省利息 ¥'+fmt(netB)+'。<br>'
      +'• 不提前、存 '+dPct.toFixed(2)+'%（按 '+(b.term/12).toFixed(1)+' 年计）：约 ¥'+fmt(holdGain)+'。<br>'
      +'<b>结论：'+(diff>0 ? '提前还款更划算，多赚 ¥'+fmt(diff) : '持有现金更划算，多赚 ¥'+fmt(-diff))+'。</b>';
  }
}

/* ================= 事件绑定 ================= */
['method','principal','periods','rate','prepayN','extra','extraY','taxDeduct','taxIncome','deductedM'].forEach(id=>$(id).addEventListener('input',render));
$('loanType').addEventListener('change',e=>{ if(e.target.value) $('loanName').value=e.target.value; });
$('dep').addEventListener('input',e=>{ $('depN').value=e.target.value; render(); });
$('depN').addEventListener('input',render);
$('prepay').addEventListener('input',e=>{ $('prepayN').value=e.target.value; render(); });

render();
