
'use strict';
/* ==================== 云服务初始化 ==================== */
var cloud=true; var loggedIn=false,applyingRemote=false,syncTimer=null,authCountdown=0;
/* =====================================================================
 * 架构说明（铁律9：单向调用，无渲染函数互调）
 *   数据层：lsGet/lsSet/saveAll/initDemoData
 *   计算层：calcHourly / calcSim / amountToHours / avgMonthlyFlex
 *   渲染层：renderDashboard / renderRecords / renderHourly /
 *           renderSim / renderGoal / renderChart（互不调用）
 *   统一入口：refreshAll() 按固定顺序调用各渲染函数；事件 → 改数据 → refreshAll
 * ===================================================================== */

/* ==================== 工具函数 ==================== */
function pad2(n){return n<10?'0'+n:''+n}
function fmtDate(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())}
function monthKey(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)}
function monthLabel(mk){return parseInt(String(mk).split('-')[1],10)+'月'}
function addMonthsDate(offset){var n=new Date();return new Date(n.getFullYear(),n.getMonth()+offset,1)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
function setText(id,txt){var el=document.getElementById(id);if(el)el.textContent=txt}
function pn(v,min,max){var n=parseFloat(v);if(!isFinite(n)||n<min)n=min;if(max!==undefined&&n>max)n=max;return n}
/* 取当前主题强调色（SVG 里不能用 CSS 变量，运行时读取） */
function acColor(){
  var v=getComputedStyle(document.body).getPropertyValue('--ac').trim();
  return v||'#111111';
}
function rgba(hex,a){
  hex=String(hex).replace('#','');
  if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  var r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);
  return 'rgba('+r+','+g+','+b+','+a+')';
}

/* ==================== 数据层 ==================== */
/* 可爱预设分类（emoji 辅助 + 统一淡色底） */
var CATS=[
  {k:'nai', e:'☕', n:'奶茶', bg:'#F1E8DC'},
  {k:'eat', e:'🍜', n:'吃饭', bg:'#F6EBDD'},
  {k:'taxi',e:'🚗', n:'打车', bg:'#E4EBEF'},
  {k:'fun', e:'🎮', n:'娱乐', bg:'#EAE6F0'},
  {k:'shop',e:'🛍️', n:'剁手', bg:'#F1E5E7'},
  {k:'dessert',e:'🍰', n:'甜品', bg:'#F3E9E2'},
  {k:'fruit',e:'🍎', n:'水果', bg:'#E9EFE2'},
  {k:'snack',e:'🍪', n:'零食', bg:'#F5EDDE'},
  {k:'commute',e:'🚇', n:'通勤', bg:'#E2E9EE'},
  {k:'phone',e:'📱', n:'话费', bg:'#E6EAEE'},
  {k:'study',e:'📚', n:'学习', bg:'#E7E9F0'},
  {k:'pet', e:'🐱', n:'宠物', bg:'#EFEAE2'},
  {k:'health',e:'💊', n:'医药', bg:'#E8F0EC'},
  {k:'travel',e:'✈️', n:'旅行', bg:'#E3ECEC'},
  {k:'other',e:'✏️', n:'其他', bg:'#EDEDEA'}
];
var CUSTOM_BGS=['#F1E8DC','#E4EBEF','#EAE6F0','#F1E5E7','#E9EEE6','#F6EBDD'];
var EMOJI_PICKS=['☕','🍜','🚗','🎮','🛍️','🍰','🍎','🍪','🚇','📱','📚','🐱','💊','✈️','🏠','💡','🎬','🎁','🐶','🍺','🚴','🎵','💻','🧾'];
function catOf(k){
  var i;
  for(i=0;i<CATS.length;i++){if(CATS[i].k===k)return CATS[i]}
  for(i=0;i<customCats.length;i++){if(customCats[i].k===k)return customCats[i]}
  return CATS[CATS.length-1];
}
var memoryStore={};
var LS_PREFIX='ledger_lock_'+String(window.tiana?.appId||location.pathname)+'_';
function lsGet(k,d){
  if(k==='lock'){try{var v=localStorage.getItem(LS_PREFIX+k);return v===null?d:JSON.parse(v)}catch(e){return d}}
  return Object.prototype.hasOwnProperty.call(memoryStore,k)?memoryStore[k]:d;
}
function lsSet(k,v){
  if(k==='lock'){try{localStorage.setItem(LS_PREFIX+k,JSON.stringify(v))}catch(e){toast('设备锁保存失败')}return}
  memoryStore[k]=JSON.parse(JSON.stringify(v));
}
function saveAll(){lsSet('settings',settings);lsSet('records',records);lsSet('savings',savings);lsSet('goal',goal);lsSet('debts',debts);lsSet('assets',assets);lsSet('cats',customCats);scheduleSync()}

var settings=null,records=[],savings=[],goal={target:0,current:0},debts=[],assets=[];
var customCats=[],selCat='nai',pickedEmoji='☕';
var warnedBackup=false;

function defaultSettings(){
  return {salary:8500,payMonths:12,commuteCost:260,mealCost:520,toolCost:120,
          hoursDay:9.5,commuteMin:50,otWeek:6,fixedMonthly:2300,safetyFund:12000,demoActive:true,
          budget:3000};
}

/* 演示数据：相对"今天"生成近 4 个月记账 + 近 7 个月存款 + 示例负债 */
function demoDebts(){
  var t=Date.now();
  return [
    {id:'debt-demo-1',name:'花呗',amount:1200,demo:true,ts:t-86400000*20},
    {id:'debt-demo-2',name:'信用卡分期',amount:3600,demo:true,ts:t-86400000*45}
  ];
}
function demoAssets(){
  var t=Date.now();
  return [
    {id:'as-demo-1',name:'支付宝',amount:5684,demo:true,ts:t-86400000*30},
    {id:'as-demo-2',name:'微信钱包',amount:1286,demo:true,ts:t-86400000*25},
    {id:'as-demo-3',name:'银行卡',amount:8600,demo:true,ts:t-86400000*15}
  ];
}
function initDemoData(){
  settings=defaultSettings();
  goal={target:50000,current:18600};
  function rec(offM,day,amt,cat,note){
    var d=new Date();d.setHours(12,0,0,0);
    d.setDate(1);d.setMonth(d.getMonth()+offM);d.setDate(day);
    var now=new Date();if(d>now)d=now; // 不生成"未来"的演示记录
    return {id:'demo-'+offM+'-'+day+'-'+cat,date:fmtDate(d),amount:amt,cat:cat,note:note||'',demo:true,ts:d.getTime()};
  }
  records=[
    rec(0,10,32,'nai','周五下午的续命水'),
    rec(0,8,45,'eat','和同事拼单黄焖鸡'),
    rec(0,7,23,'taxi','睡过头打车'),
    rec(0,5,199,'shop','换季买了件外套'),
    rec(0,3,66,'fun','电影票·周末场'),
    rec(0,2,28,'nai','新款杨枝甘露'),
    rec(-1,28,52,'eat','加班晚归点了外卖'),
    rec(-1,24,129,'fun','游戏新赛季皮肤'),
    rec(-1,19,36,'nai','和闺蜜拼单半价'),
    rec(-1,12,310,'shop','工具书 + 文具'),
    rec(-1,6,44,'eat','加班餐'),
    rec(-2,26,88,'taxi','暴雨天打车回家'),
    rec(-2,18,155,'fun','桌游吧聚会'),
    rec(-2,9,240,'shop','预售定金'),
    rec(-2,3,30,'nai','下午茶'),
    rec(-3,21,420,'shop','给家里买的按摩仪'),
    rec(-3,15,68,'eat','火锅 AA'),
    rec(-3,4,25,'nai','试了新开的店')
  ];
  function sv(offM,amt){return {month:monthKey(addMonthsDate(offM)),amount:amt,demo:true}}
  savings=[sv(-6,2800),sv(-5,3300),sv(-4,3100),sv(-3,3600),sv(-2,2900),sv(-1,4600),sv(0,1900)];
  debts=demoDebts();
  assets=demoAssets();
  saveAll();
}

/* ==================== 计算层 ==================== */
/* 真实时薪 =（月薪×发薪月数 − 年度工作成本）÷（在场 + 通勤 + 加班 总小时） */
function calcHourly(s){
  var income=s.salary*s.payMonths;
  var cost=(s.commuteCost+s.mealCost+s.toolCost)*12;
  var presentH=s.hoursDay*5*52;               // 每天×5天×52周
  var commuteH=s.commuteMin*2*5*52/60;        // 单程×2×5天×52周
  var otH=s.otWeek*52;
  var totalH=presentH+commuteH+otH;
  var hourly=totalH>0?(income-cost)/totalH:0;
  return {income:income,cost:cost,presentH:presentH,commuteH:commuteH,otH:otH,
          totalH:totalH,hourly:Math.max(0,hourly)};
}
/* 情景模拟：通勤缩短 cs.commuteSave 分钟/天、加班减 cs.otReduce 小时/周、涨薪 cs.raise% */
function calcSim(s,base,cs){
  var savedCommuteH=cs.commuteSave*2*5*52/60;
  var savedOtH=cs.otReduce*52;
  var savedH=savedCommuteH+savedOtH;
  var newH=Math.max(1,base.totalH-savedH);
  var newIncome=base.income*(1+cs.raise/100);
  var newHourly=Math.max(0,(newIncome-base.cost)/newH);
  return {savedCommuteH:savedCommuteH,savedOtH:savedOtH,savedH:savedH,
          newH:newH,newIncome:newIncome,newHourly:newHourly,delta:newHourly-base.hourly};
}
/* 金额 → 真实工时换算 */
function amountToHours(amount,hourly){
  if(!(hourly>0))return {h:0,m:0};
  var t=amount/hourly,h=Math.floor(t),m=Math.round((t-h)*60);
  if(m===60){h+=1;m=0}
  return {h:h,m:m};
}
/* 近 3 个月平均弹性支出（用于安全垫计算） */
function avgMonthlyFlex(){
  var map={};
  records.forEach(function(r){var m=String(r.date).slice(0,7);map[m]=(map[m]||0)+r.amount});
  var keys=Object.keys(map).sort();
  if(!keys.length)return 0;
  var recent=keys.slice(-3);
  var sum=0;recent.forEach(function(k){sum+=map[k]});
  return sum/recent.length;
}

/* ==================== 渲染层：分类选择（预设 + 自定义） ==================== */
function renderChips(){
  var box=document.getElementById('chipBox');
  if(!box)return;
  var html=CATS.concat(customCats).map(function(c){
    return '<button type="button" class="chip'+(selCat===c.k?' sel':'')+'" data-cat="'+esc(c.k)+'"><span class="ce">'+esc(c.e)+'</span>'+esc(c.n)+'</button>';
  }).join('');
  html+='<button type="button" class="chip chip-add" id="chipAdd">＋ 自定义</button>';
  box.innerHTML=html;
  renderEpGrid();
  renderCustomList();
}
function renderEpGrid(){
  var g=document.getElementById('epGrid');
  if(!g)return;
  g.innerHTML=EMOJI_PICKS.map(function(e){
    return '<button type="button" class="ep-item'+(pickedEmoji===e?' sel':'')+'" data-e="'+e+'">'+e+'</button>';
  }).join('');
}
function renderCustomList(){
  var box=document.getElementById('customCatList');
  if(!box)return;
  box.innerHTML=customCats.length
    ? customCats.map(function(c){
        return '<span class="cc-item">'+esc(c.e)+' '+esc(c.n)+'<button type="button" class="del-btn" data-cc="'+esc(c.k)+'" title="删除这个分类">✕</button></span>';
      }).join('')
    : '<span style="font-size:12px;color:var(--ink-faint)">还没有自定义分类，加一个试试</span>';
}

/* ==================== 智能识别：文字解析 + 图片 AI 识别 ==================== */
var CAT_KEYWORDS=[
  ['pet',['猫粮','狗粮','猫砂','宠物']],
  ['health',['药','医院','挂号','诊所','体检']],
  ['study',['课程','培训','教材','文具','网课']],
  ['phone',['话费','流量','充值','宽带']],
  ['travel',['酒店','民宿','机票','门票','旅行']],
  ['dessert',['蛋糕','甜品','面包']],
  ['fruit',['水果','果切','车厘子','草莓']],
  ['snack',['零食','薯片','糖果','坚果']],
  ['nai',['奶茶','咖啡','茶饮','瑞幸','喜茶','蜜雪','杨枝甘露','柠檬水']],
  ['taxi',['打车','滴滴','出租','地铁','公交','高铁','火车','加油','停车']],
  ['fun',['游戏','电影','演出','桌游','会员','皮肤']],
  ['eat',['餐','饭','外卖','面','粉','堡','鸡','火锅','烧烤','食堂','麻辣烫','寿司','饺子']],
  ['shop',['淘宝','京东','拼多多','衣服','鞋','外套','定金','快递']]
];
function guessCat(text){
  var i,j;
  for(i=0;i<CAT_KEYWORDS.length;i++){
    var kws=CAT_KEYWORDS[i][1];
    for(j=0;j<kws.length;j++){if(text.indexOf(kws[j])>=0)return CAT_KEYWORDS[i][0]}
  }
  return 'other';
}
var pendingBills=[];
function parseBillLine(line){
  /* 日期前缀：10.5 / 10月5日 / 10-05 / 2025.10.5 / 今天 / 昨天 / 前天，可选 */
  var date=fmtDate(new Date()),rest=String(line);
  var md=rest.match(/^\s*(今天|昨天|前天|(?:\d{4}\s*[年./\-])?\d{1,2}\s*[月./\-]\s*\d{1,2}\s*日?)/);
  if(md){
    var tok=md[1].replace(/\s+/g,''),now=new Date(),ym;
    if(tok==='今天'||tok==='昨天'||tok==='前天'){
      var off=tok==='今天'?0:(tok==='昨天'?1:2);
      var d=new Date();d.setDate(d.getDate()-off);
      date=fmtDate(d);
    }else if(ym=tok.match(/^(?:(\d{4})[年./\-])?(\d{1,2})[月./\-](\d{1,2})日?$/)){
      var mo=parseInt(ym[2],10),da=parseInt(ym[3],10);
      if(mo>=1&&mo<=12&&da>=1&&da<=31){
        var y=ym[1]?parseInt(ym[1],10):now.getFullYear();
        var dd=new Date(y,mo-1,da);
        if(dd>now)dd=now;   // 未来日期回落到今天
        date=fmtDate(dd);
      }
    }
    rest=rest.slice(md[0].length);
  }
  var tokens=[],mm;
  var re=/[¥￥]\s*(\d+(?:\.\d{1,2})?)(?:\s*元)?|(\d+(?:\.\d{1,2})?)\s*元/g;
  while((mm=re.exec(rest))){tokens.push({v:parseFloat(mm[1]||mm[2]),i:mm.index,len:mm[0].length})}
  if(!tokens.length){
    var re2=/\d+(?:\.\d{1,2})?/g;
    while((mm=re2.exec(rest))){tokens.push({v:parseFloat(mm[0]),i:mm.index,len:mm[0].length})}
  }
  if(!tokens.length)return null;
  var t=tokens[tokens.length-1];
  if(!(t.v>0)||t.v>1000000)return null;
  var name=(rest.slice(0,t.i)+rest.slice(t.i+t.len)).replace(/^[-—:：、\s·,，]+|[-—:：、\s·,，]+$/g,'').trim();
  return {name:name||'未命名',amount:Math.round(t.v*100)/100,cat:guessCat(name+' '+rest),date:date};
}
function parseBillText(){
  var txt=document.getElementById('billText').value;
  var added=0;
  txt.split(/\n+/).forEach(function(line){
    line=line.trim();
    if(!line)return;
    var b=parseBillLine(line);
    if(b){pendingBills.push(b);added++}
  });
  if(!added){toast('没解析出有效金额，检查一下格式哈');return}
  document.getElementById('billText').value='';
  renderBillPreview();
  toast('解析出 '+added+' 笔，确认后记入 ✓');
}
function renderBillPreview(){
  var box=document.getElementById('billPreview');
  var btn=document.getElementById('btnCommitBills');
  if(!box)return;
  if(!pendingBills.length){box.innerHTML='';if(btn)btn.style.display='none';return}
  var total=0;
  var todayStr=fmtDate(new Date());
  var html=pendingBills.map(function(b,i){
    var c=catOf(b.cat);total+=b.amount;
    var amt=b.amount%1?b.amount.toFixed(2):b.amount.toFixed(0);
    var sub=c.n+(b.date&&b.date!==todayStr?' · '+b.date:'');
    return '<div class="record-item"><div class="rec-emoji" style="background:'+esc(/^#[0-9a-f]{3,8}$/i.test(c.bg)?c.bg:'#EDEDEA')+'">'+esc(c.e)+'</div>'
      +'<div class="rec-main"><div class="rec-title">'+esc(b.name)+'</div><div class="rec-sub">'+sub+'</div></div>'
      +'<div class="rec-side"><div class="rec-amt">-¥'+amt+'</div></div>'
      +'<button class="del-btn" data-bill="'+i+'" title="移除这一笔">✕</button></div>';
  }).join('');
  html+='<div class="bill-total">共 '+pendingBills.length+' 笔 · 合计 ¥'+total.toFixed(total%1?2:0)+'</div>';
  box.innerHTML=html;
  if(btn)btn.style.display='block';
}
function commitBills(){
  if(!pendingBills.length)return;
  var n=pendingBills.length;
  pendingBills.forEach(function(b,i){
    records.push({id:'r'+Date.now()+i+Math.floor(Math.random()*1000),
      date:b.date||fmtDate(new Date()),amount:b.amount,cat:b.cat,note:b.name,demo:false,ts:Date.now()+i});
  });
  pendingBills=[];
  saveAll();
  renderBillPreview();
  refreshAll();
  toast('已记入 '+n+' 笔 ✓');
}

/* ==================== 渲染层：首页仪表盘 ==================== */
function recItemHTML(r,hourly,withDel){
  var c=catOf(r.cat),h=amountToHours(r.amount,hourly);
  var amt=r.amount%1?r.amount.toFixed(2):r.amount.toFixed(0);
  return '<div class="record-item">'
    +'<div class="rec-emoji" style="background:'+esc(/^#[0-9a-f]{3,8}$/i.test(c.bg)?c.bg:'#EDEDEA')+'">'+esc(c.e)+'</div>'
    +'<div class="rec-main"><div class="rec-title">'+esc(c.n)+(r.note?' · '+esc(r.note):'')+'</div>'
    +'<div class="rec-sub">'+r.date+(r.demo?' · 示例':'')+'</div></div>'
    +'<div class="rec-side"><div class="rec-amt">-¥'+amt+'</div>'
    +'<div class="rec-hours">≈ '+h.h+'小时'+h.m+'分工时</div></div>'
    +(withDel?'<button class="del-btn" data-id="'+r.id+'" title="删除这条记录">✕</button>':'')
    +'</div>';
}
function renderDashboard(){
  var base=calcHourly(settings);
  var now=new Date(),today=fmtDate(now),mk=monthKey(now);
  var todaySum=0,monthSum=0;
  records.forEach(function(r){
    if(r.date===today)todaySum+=r.amount;
    if(String(r.date).slice(0,7)===mk)monthSum+=r.amount;
  });
  setText('todayText',now.getFullYear()+' 年 '+(now.getMonth()+1)+' 月 '+now.getDate()+' 日');
  setText('statToday','¥'+todaySum.toFixed(todaySum%1?2:0));
  setText('statMonth','¥'+monthSum.toFixed(monthSum%1?2:0));
  setText('statHourly','¥'+base.hourly.toFixed(1));
  var bud=settings.budget||0;
  if(bud>0){
    var rem=bud-monthSum;
    setText('statBudget',rem<0?'超 ¥'+Math.abs(rem).toFixed(0):'¥'+rem.toFixed(rem%1?2:0));
  }else{
    setText('statBudget','未设置');
  }
  /* 本月账单 */
  setText('sumIncome','¥'+settings.salary.toFixed(0));
  setText('sumFixed','¥'+settings.fixedMonthly.toFixed(0));
  setText('sumFlex','¥'+monthSum.toFixed(monthSum%1?2:0));
  var balance=settings.salary-settings.fixedMonthly-monthSum;
  setText('sumBalance',(balance<0?'-':'')+'¥'+Math.abs(balance).toFixed(Math.abs(balance)%1?2:0));
  /* 最近 4 笔 */
  var recent=records.slice().sort(function(a,b){return a.date<b.date?1:(a.date>b.date?-1:b.ts-a.ts)}).slice(0,4);
  var box=document.getElementById('recentList');
  if(!recent.length){
    box.innerHTML='<div class="empty">还没有记录，去「记账」页记下第一笔吧～</div>';
  }else{
    box.innerHTML=recent.map(function(r){return recItemHTML(r,base.hourly,false)}).join('');
  }
  updateDemoBadge();
  /* 数据积累提醒（铁律2） */
  if(!warnedBackup&&records.length>=30){
    warnedBackup=true;
    toast('数据已有 '+records.length+' 条，建议到「备份」页导出一份 JSON 哦');
  }
}

/* ==================== 渲染层：全部记录列表（记账页） ==================== */
function renderRecords(){
  var base=calcHourly(settings);
  var box=document.getElementById('allList');
  var list=records.slice().sort(function(a,b){return b.ts-a.ts});
  if(!list.length){box.innerHTML='<div class="empty">暂无记录，上面记一笔试试～</div>';return}
  box.innerHTML=list.map(function(r){return recItemHTML(r,base.hourly,true)}).join('');
}

/* ==================== 渲染层：真实时薪 ==================== */
function renderHourly(){
  var s=settings,base=calcHourly(s);
  setText('hourlyResult','¥'+base.hourly.toFixed(2));
  setText('hourlyDesc','公司名义上给你 ¥'+(s.salary*s.payMonths/12/21.75/(s.hoursDay+s.otWeek/5)).toFixed(1)+'/小时，但算上通勤、加班和成本后……');
  var net=base.income-base.cost;
  var f=document.getElementById('formulaBox');
  if(f){
    f.innerHTML=
      '<span class="fh">① 分子 = 到手月薪 × 发薪月数 − 年度工作成本</span><br>'
      +'　= ¥'+s.salary.toFixed(0)+' × '+s.payMonths+' 个月<br>'
      +'　− 年度成本 =（通勤 ¥'+s.commuteCost.toFixed(0)+' + 餐费 ¥'+s.mealCost.toFixed(0)+' + 工具着装 ¥'+s.toolCost.toFixed(0)+'）× 12 = ¥'+(s.commuteCost+s.mealCost+s.toolCost).toFixed(0)+' × 12 = ¥'+base.cost.toFixed(0)+'<br>'
      +'　= ¥'+base.income.toFixed(0)+' − ¥'+base.cost.toFixed(0)+' = <b>¥'+net.toFixed(0)+'</b><br>'
      +'<span class="fh">② 分母 = 在场总小时 + 通勤总小时 + 加班总小时</span><br>'
      +'　在场：'+s.hoursDay+' 小时 × 5 天 × 52 周 = <b>'+base.presentH.toFixed(0)+' 小时</b><br>'
      +'　通勤：'+s.commuteMin+' 分钟 × 2 趟 × 5 天 × 52 周 ÷ 60 = <b>'+base.commuteH.toFixed(0)+' 小时</b><br>'
      +'　加班：'+s.otWeek+' 小时 × 52 周 = <b>'+base.otH.toFixed(0)+' 小时</b><br>'
      +'　合计 = <b>'+base.totalH.toFixed(0)+' 小时 / 年</b><br>'
      +'<span class="fh">③ 真实时薪 = ¥'+net.toFixed(0)+' ÷ '+base.totalH.toFixed(0)+' 小时 ≈ <b>¥'+base.hourly.toFixed(2)+' / 小时</b></span>';
  }
}

/* ==================== 渲染层：情景模拟器 ==================== */
function renderSim(){
  var cs={
    commuteSave:pn(document.getElementById('simCommute').value,0,60),
    otReduce:pn(document.getElementById('simOT').value,0,10),
    raise:pn(document.getElementById('simRaise').value,0,30)
  };
  setText('simCommuteVal',cs.commuteSave+' 分钟/天');
  setText('simOTVal',cs.otReduce+' 小时/周');
  setText('simRaiseVal',cs.raise+'%');
  var base=calcHourly(settings);
  var r=calcSim(settings,base,cs);
  setText('simNew','¥'+r.newHourly.toFixed(2));
  setText('simHours',r.savedH.toFixed(0)+' 小时');
  var raiseMoney=base.income*cs.raise/100;
  var timeMoney=r.newHourly*r.savedH;
  setText('simMoney','¥'+(timeMoney+raiseMoney).toFixed(0));
  var maxH=Math.max(base.hourly,r.newHourly,1);
  var bo=document.getElementById('barOld'),bn=document.getElementById('barNew');
  if(bo)bo.style.width=(base.hourly/maxH*100)+'%';
  if(bn)bn.style.width=(r.newHourly/maxH*100)+'%';
  setText('barOldVal','¥'+base.hourly.toFixed(1));
  setText('barNewVal','¥'+r.newHourly.toFixed(1));
}

/* ==================== 渲染层：目标 & 安全垫 & 存款曲线 ==================== */
function renderGoal(){
  var pct=goal.target>0?Math.min(100,goal.current/goal.target*100):0;
  var fill=document.getElementById('goalFill');if(fill)fill.style.width=pct+'%';
  setText('goalPct',pct.toFixed(1)+'%');
  setText('goalText','已存 ¥'+goal.current.toFixed(0)+' / 目标 ¥'+goal.target.toFixed(0));
  var flexAvg=avgMonthlyFlex();
  var spend=settings.fixedMonthly+flexAvg;
  var months=spend>0?settings.safetyFund/spend:0;
  setText('safeMonths',months.toFixed(1)+' 个月');
  setText('safeDesc','按「固定 ¥'+settings.fixedMonthly.toFixed(0)+' + 近3月平均弹性 ¥'+flexAvg.toFixed(0)+'」每月开销估算，够撑这么久不上班');
  renderChart();
}

/* 原生 SVG 手写存款曲线：面积 + 折线 + 坐标轴 + 悬停/触点提示 */
function renderChart(){
  var wrap=document.getElementById('chartBox');
  var tip=document.getElementById('chartTip');
  if(!wrap)return;
  var data=savings.slice().sort(function(a,b){return a.month<b.month?-1:1});
  if(data.length<2){
    wrap.innerHTML='<div class="empty">存款记录不足两个月，暂时画不出曲线～<br>每月在「目标」页记一笔存款就能长出来啦</div>';
    return;
  }
  var W=640,H=300,L=56,R=20,T=26,B=42,pw=W-L-R,ph=H-T-B;
  var maxV=1;data.forEach(function(d){if(d.amount>maxV)maxV=d.amount});
  var niceMax=Math.ceil(maxV/1000)*1000||1000;
  function xs(i){return data.length===1?L+pw/2:L+pw*i/(data.length-1)}
  function ys(v){return T+ph*(1-v/niceMax)}
  var grid='',labels='',i,y,v;
  for(i=0;i<=4;i++){
    v=niceMax*i/4;y=ys(v);
    grid+='<line x1="'+L+'" y1="'+y.toFixed(1)+'" x2="'+(W-R)+'" y2="'+y.toFixed(1)+'" stroke="'+(i===0?'#CFCFCF':'#ECECEC')+'" stroke-width="1"/>'
         +'<text x="'+(L-8)+'" y="'+(y+4).toFixed(1)+'" text-anchor="end" font-size="11" fill="#9A9A9A">'+(v>=1000?(v/1000)+'k':v)+'</text>';
  }
  data.forEach(function(d,idx){
    labels+='<text x="'+xs(idx).toFixed(1)+'" y="'+(H-14)+'" text-anchor="middle" font-size="11" fill="#9A9A9A">'+monthLabel(d.month)+'</text>';
  });
  var pts=data.map(function(d,idx){return [xs(idx),ys(d.amount)]});
  var line=pts.map(function(p,idx){return (idx?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' ');
  var area=line+' L'+pts[pts.length-1][0].toFixed(1)+','+(T+ph)+' L'+pts[0][0].toFixed(1)+','+(T+ph)+' Z';
  var ac=acColor();
  var dots=pts.map(function(p,idx){
    return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="4.5" fill="#fff" stroke="'+ac+'" stroke-width="2.5"/>';
  }).join('');
  wrap.innerHTML='<svg id="chartSvg" viewBox="0 0 640 300" style="width:100%;height:auto;display:block;touch-action:none">'
    +grid+labels
    +'<path d="'+area+'" fill="'+rgba(ac,.08)+'"/>'
    +'<path d="'+line+'" fill="none" stroke="'+ac+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
    +dots+'</svg>';
  var svg=document.getElementById('chartSvg');
  function showAt(clientX){
    var rect=svg.getBoundingClientRect();
    var x=(clientX-rect.left)/rect.width*W;
    var bi=0,bd=Infinity;
    pts.forEach(function(p,idx){var d=Math.abs(p[0]-x);if(d<bd){bd=d;bi=idx}});
    var d=data[bi],p=pts[bi];
    tip.style.display='block';
    tip.innerHTML='<b>'+esc(d.month)+'</b><br>存款 ¥'+d.amount.toFixed(0);
    var px=p[0]/W*rect.width,py=p[1]/H*rect.height;
    tip.style.left=Math.min(Math.max(px-45,0),Math.max(rect.width-115,0))+'px';
    tip.style.top=Math.max(py-56,0)+'px';
  }
  svg.addEventListener('mousemove',function(e){showAt(e.clientX)});
  svg.addEventListener('mouseleave',function(){tip.style.display='none'});
  svg.addEventListener('touchstart',function(e){showAt(e.touches[0].clientX)},{passive:true});
  svg.addEventListener('touchmove',function(e){showAt(e.touches[0].clientX)},{passive:true});
  svg.addEventListener('touchend',function(){setTimeout(function(){tip.style.display='none'},1200)});
}

/* ==================== 渲染层：目前负债 ==================== */
var DEBT_DOTS=['#A08D74','#7E948B','#7C8B95','#9C8296','#8A9B7C'];
function renderDebt(){
  var list=debts.slice().sort(function(a,b){return b.ts-a.ts});
  var total=0;list.forEach(function(d){total+=d.amount});
  setText('debtTotal','¥'+(total%1?total.toFixed(2):total.toFixed(0)));
  setText('debtCount',list.length?('共 '+list.length+' 笔'):'');
  var box=document.getElementById('debtList');
  if(!box)return;
  if(!list.length){
    box.innerHTML='<div class="empty">还没有负债，太棒了，保持！</div>';
    return;
  }
  box.innerHTML=list.map(function(d,i){
    var amt=d.amount%1?d.amount.toFixed(2):d.amount.toFixed(0);
    return '<div class="debt-item">'
      +'<span class="debt-dot" style="background:'+DEBT_DOTS[i%DEBT_DOTS.length]+'"></span>'
      +'<div class="debt-main"><div class="debt-name">'+esc(d.name)+(d.demo?'<span class="debt-demo">示例</span>':'')+'</div></div>'
      +'<div class="debt-amt">¥'+amt+'</div>'
      +'<button class="del-btn" data-debt="'+d.id+'" title="还清了，删掉这条">✕</button>'
      +'</div>';
  }).join('');
}

/* ==================== 纯色换肤 ==================== */
var THEMES=[
  {id:'',n:'墨黑',c:'#111111'},
  {id:'theme-green',n:'薄荷绿',c:'#5F9482'},
  {id:'theme-blue',n:'雾霾蓝',c:'#64809B'},
  {id:'theme-pink',n:'豆沙粉',c:'#B27E8A'},
  {id:'theme-sand',n:'驼杏',c:'#A3855C'},
  {id:'theme-purple',n:'灰紫',c:'#877FA5'}
];
var curTheme='';
function applyTheme(){
  document.body.className=curTheme;
}
function renderSwatches(){
  var box=document.getElementById('swatchBox');
  if(!box)return;
  box.innerHTML=THEMES.map(function(t){
    return '<button type="button" class="swatch'+(curTheme===t.id?' sel':'')+'" data-theme="'+t.id+'" title="'+t.n+'" style="background:'+t.c+'"></button>';
  }).join('');
}
function onPickTheme(id){
  curTheme=id;
  lsSet('theme',id);
  scheduleSync();
  applyTheme();
  renderSwatches();
  refreshAll();
  var t=THEMES.filter(function(x){return x.id===id})[0];
  toast('已换成「'+(t?t.n:'墨黑')+'」✓');
}

/* ==================== 渲染层：资产账户 ==================== */
function renderAssets(){
  var sum=0;assets.forEach(function(a){sum+=a.amount});
  var debtSum=0;debts.forEach(function(d){debtSum+=d.amount});
  var net=sum-debtSum;
  setText('netWorth',(net<0?'-':'')+'¥'+Math.abs(net).toFixed(Math.abs(net)%1?2:0));
  setText('assetBreak','总资产 ¥'+(sum%1?sum.toFixed(2):sum.toFixed(0))+' · 总负债 ¥'+(debtSum%1?debtSum.toFixed(2):debtSum.toFixed(0)));
  var box=document.getElementById('assetList');
  if(!box)return;
  var list=assets.slice().sort(function(a,b){return b.ts-a.ts});
  if(!list.length){box.innerHTML='<div class="empty">还没有记账户，把支付宝 / 微信余额记上来吧</div>';return}
  box.innerHTML=list.map(function(a,i){
    var amt=a.amount%1?a.amount.toFixed(2):a.amount.toFixed(0);
    return '<div class="debt-item">'
      +'<span class="debt-dot" style="background:'+DEBT_DOTS[i%DEBT_DOTS.length]+'"></span>'
      +'<div class="debt-main"><div class="debt-name">'+esc(a.name)+(a.demo?'<span class="debt-demo">示例</span>':'')+'</div></div>'
      +'<div class="debt-amt">'+(a.amount<0?'-':'')+'¥'+amt+'</div>'
      +'<button class="del-btn" data-asset="'+a.id+'" title="删掉这个账户">✕</button>'
      +'</div>';
  }).join('');
}
function onAddAsset(e){
  e.preventDefault();
  var name=document.getElementById('assetName').value.trim();
  var raw=document.getElementById('assetAmount').value;
  if(raw===''||!isFinite(Number(raw))){toast('先填一个余额哈（可以为负数）');return}
  assets.push({
    id:'a'+Date.now()+Math.floor(Math.random()*1000),
    name:name||'未命名账户',
    amount:Math.round(Number(raw)*100)/100,
    demo:false,ts:Date.now()
  });
  saveAll();
  document.getElementById('assetName').value='';
  document.getElementById('assetAmount').value='';
  toast('账户已记上 ✓');
  refreshAll();
}
function onDeleteAsset(id){
  assets=assets.filter(function(a){return a.id!==id});
  saveAll();
  toast('已删掉这个账户');
  refreshAll();
}

/* ==================== 渲染层：报表（日历 / 分类） ==================== */
var repTab='cal',repMonth=monthKey(new Date()),repDay=null;
var CAT_COLORS=['#A08D74','#7E948B','#7C8B95','#9C8296','#8A9B7C','#B27E8A','#64809B','#A3855C','#877FA5','#5F9482','#9A6673','#6B6B6B'];
function repMonthLabel(mk){var p=String(mk).split('-');return p[0]+' 年 '+parseInt(p[1],10)+' 月'}
function shiftRepMonth(delta){
  var y=parseInt(repMonth.slice(0,4),10),m=parseInt(repMonth.slice(5,7),10)-1;
  repMonth=monthKey(new Date(y,m+delta,1));
  repDay=null;
  renderReport();
}
function renderReport(){
  setText('repMonthLabel',repMonthLabel(repMonth));
  document.querySelectorAll('#repSeg button').forEach(function(b){
    b.classList.toggle('sel',b.getAttribute('data-tab')===repTab);
  });
  document.getElementById('repCal').style.display=repTab==='cal'?'block':'none';
  document.getElementById('repCat').style.display=repTab==='cat'?'block':'none';
  /* 汇总该月每天支出 */
  var days={},monthSpend=0;
  records.forEach(function(r){
    if(String(r.date).slice(0,7)!==repMonth)return;
    days[r.date]=(days[r.date]||0)+r.amount;
    monthSpend+=r.amount;
  });
  if(repTab==='cal')renderCalendar(days,monthSpend);
  else renderCatReport(monthSpend);
}
function renderCalendar(days,monthSpend){
  var y=parseInt(repMonth.slice(0,4),10),m=parseInt(repMonth.slice(5,7),10);
  var startDow=(new Date(y,m-1,1).getDay()+6)%7;      // 周一=0
  var dim=new Date(y,m,0).getDate();
  var today=fmtDate(new Date());
  var maxDay=0,k;
  for(k in days){if(days[k]>maxDay)maxDay=days[k]}
  var ac=acColor(),html='',i,d;
  for(i=0;i<startDow;i++)html+='<div class="cal-cell dim"></div>';
  for(d=1;d<=dim;d++){
    var dk=repMonth+'-'+pad2(d),sp=days[dk]||0;
    var cls='cal-cell';
    if(dk===today)cls+=' today';
    if(repDay===dk)cls+=' sel';
    var style='';
    if(sp>0)style=' style="background:'+rgba(ac,(0.12+0.72*sp/maxDay).toFixed(2))+'"';
    html+='<div class="'+cls+'" data-day="'+dk+'"'+style+'>'
      +'<div class="d">'+d+'</div>'
      +'<div class="a">'+(sp>0?'-'+sp.toFixed(sp%1?2:0):'')+'</div></div>';
  }
  var tail=(7-((startDow+dim)%7))%7;
  for(i=0;i<tail;i++)html+='<div class="cal-cell dim"></div>';
  document.getElementById('calGrid').innerHTML=html;
  /* 月度小结 */
  var isCur=repMonth===monthKey(new Date());
  var elapsed=isCur?new Date().getDate():dim;
  var avg=monthSpend/Math.max(1,elapsed);
  var bal=settings.salary-monthSpend;
  setText('calMonthSpend','¥'+monthSpend.toFixed(monthSpend%1?2:0));
  setText('calMonthBalance',(bal<0?'-':'')+'¥'+Math.abs(bal).toFixed(Math.abs(bal)%1?2:0));
  setText('calDayAvg','¥'+avg.toFixed(avg%1?2:0));
  /* 点选某天 → 当日账单 */
  var box=document.getElementById('calDayDetail');
  var title=document.getElementById('calDayTitle');
  if(!repDay){
    title.textContent='';
    box.innerHTML='<div class="empty">点上面某一天，看那天的账单 ↓</div>';
    return;
  }
  var list=records.filter(function(r){return r.date===repDay}).sort(function(a,b){return a.ts-b.ts});
  var ds=days[repDay]||0;
  title.textContent=repMonthLabel(repMonth)+' '+(parseInt(repDay.slice(8),10))+' 日账单 · 支出 ¥'+ds.toFixed(ds%1?2:0);
  if(!list.length){box.innerHTML='<div class="empty">这天没有记账</div>';return}
  var hourly=calcHourly(settings).hourly;
  box.innerHTML=list.map(function(r){return recItemHTML(r,hourly,false)}).join('');
}
function renderCatReport(monthSpend){
  var donut=document.getElementById('donutBox'),list=document.getElementById('catList');
  if(monthSpend<=0){
    donut.innerHTML='';list.innerHTML='<div class="empty">这个月还没有支出记录</div>';
    return;
  }
  /* 按分类汇总 */
  var map={};
  records.forEach(function(r){
    if(String(r.date).slice(0,7)!==repMonth)return;
    if(!map[r.cat])map[r.cat]={amt:0,n:0};
    map[r.cat].amt+=r.amount;map[r.cat].n++;
  });
  var entries=Object.keys(map).map(function(k){
    return {k:k,amt:map[k].amt,n:map[k].n};
  }).sort(function(a,b){return b.amt-a.amt});
  /* 环形图（原生 SVG，stroke-dasharray 分段） */
  var SZ=230,CX=SZ/2,CY=SZ/2,R=82,SW=34;
  var C=2*Math.PI*R,offset=0,i;
  var arcs='';
  for(i=0;i<entries.length;i++){
    var frac=entries[i].amt/monthSpend;
    var seg=frac*C;
    arcs+='<circle cx="'+CX+'" cy="'+CY+'" r="'+R+'" fill="none" stroke="'+CAT_COLORS[i%CAT_COLORS.length]+'"'
      +' stroke-width="'+SW+'" stroke-dasharray="'+seg.toFixed(2)+' '+(C-seg).toFixed(2)+'"'
      +' stroke-dashoffset="'+(-offset).toFixed(2)+'" transform="rotate(-90 '+CX+' '+CY+')"/>';
    offset+=seg;
  }
  donut.innerHTML='<svg viewBox="0 0 '+SZ+' '+SZ+'" style="width:min(240px,72vw);height:auto">'
    +arcs
    +'<text x="'+CX+'" y="'+(CY-6)+'" text-anchor="middle" font-size="12" fill="#9A9A9A">支出大类</text>'
    +'<text x="'+CX+'" y="'+(CY+16)+'" text-anchor="middle" font-size="17" font-weight="800" fill="#141414">¥'+monthSpend.toFixed(monthSpend%1?2:0)+'</text>'
    +'</svg>';
  /* 分类列表 */
  list.innerHTML=entries.map(function(en,i){
    var c=catOf(en.k),pct=en.amt/monthSpend*100;
    var amt=en.amt%1?en.amt.toFixed(2):en.amt.toFixed(0);
    return '<div class="record-item">'
      +'<div class="rec-emoji" style="background:'+esc(/^#[0-9a-f]{3,8}$/i.test(c.bg)?c.bg:'#EDEDEA')+'">'+esc(c.e)+'</div>'
      +'<div class="rec-main"><div class="rec-title">'+esc(c.n)+' <span class="cat-pct">'+pct.toFixed(1)+'%</span></div>'
      +'<div class="cat-bar"><div style="width:'+pct.toFixed(1)+'%;background:'+CAT_COLORS[i%CAT_COLORS.length]+'"></div></div></div>'
      +'<div class="rec-side"><div class="rec-amt">-¥'+amt+'</div><div class="rec-sub">'+en.n+' 笔</div></div>'
      +'</div>';
  }).join('');
}

/* ==================== 云端同步 ==================== */
function setSync(state){
  var map={off:'未登录',pending:'待同步…',syncing:'同步中…',ok:'已同步',err:'同步失败'};
  document.querySelectorAll('.sync-badge').forEach(function(el){
    el.classList.remove('ok','err');
    if(state==='ok')el.classList.add('ok');
    if(state==='err')el.classList.add('err');
    var t=el.querySelector('.sync-text');if(t)t.textContent=map[state]||state;
  });
}
function scheduleSync(){
  if(!loggedIn||applyingRemote||!cloud)return;
  setSync('pending');
  clearTimeout(syncTimer);
  syncTimer=setTimeout(pushNow,900);
}
function ledgerPayload(){
  return {settings:settings,records:records,savings:savings,goal:goal,debts:debts,assets:assets,cats:customCats,theme:curTheme};
}
async function pushNow(){
 if(!loggedIn)return; setSync('syncing');
 try { await window.ledgerStore.save(JSON.stringify(ledgerPayload())); setSync('ok'); return true; }
 catch(e){setSync('err');toast('云端保存失败，请再次操作重试'); return false;}
}
async function pullCloud(){ var p=await window.ledgerStore.load(); if(p){applyRemote(JSON.parse(p));return true;} return false; }
function applyRemote(p){
  if(!p||typeof p!=='object')return;
  applyingRemote=true;
  if(p.settings&&isFinite(Number(p.settings.salary)))settings=Object.assign(defaultSettings(),p.settings);
  if(Array.isArray(p.records))records=p.records.filter(function(r){return r&&isFinite(Number(r.amount))&&r.date})
    .map(function(r){return {id:String(r.id||('r'+Math.random())),date:String(r.date),
      amount:Number(r.amount),cat:String(r.cat||'other'),note:String(r.note||''),
      demo:!!r.demo,ts:Number(r.ts)||Date.now()}});
  if(Array.isArray(p.savings))savings=p.savings.filter(function(s){return s&&s.month&&isFinite(Number(s.amount))})
    .map(function(s){return {month:String(s.month),amount:Number(s.amount),demo:!!s.demo}});
  if(p.goal&&typeof p.goal==='object')goal={target:Number(p.goal.target)||0,current:Number(p.goal.current)||0};
  if(Array.isArray(p.debts))debts=p.debts.filter(function(d){return d&&d.name&&isFinite(Number(d.amount))})
    .map(function(d){return {id:String(d.id||('d'+Math.random())),name:String(d.name),
      amount:Number(d.amount),demo:!!d.demo,ts:Number(d.ts)||Date.now()}});
  if(Array.isArray(p.assets))assets=p.assets.filter(function(a){return a&&a.name&&isFinite(Number(a.amount))})
    .map(function(a){return {id:String(a.id||('a'+Math.random())),name:String(a.name),
      amount:Number(a.amount),demo:!!a.demo,ts:Number(a.ts)||Date.now()}});
  if(Array.isArray(p.cats))customCats=p.cats.filter(function(c){return c&&c.n&&c.e})
    .map(function(c){return {k:String(c.k||('c'+Math.random())),e:String(c.e),n:String(c.n),
      bg:String(c.bg||'#EDEDEA')}});
  if(typeof p.theme==='string'){curTheme=p.theme;lsSet('theme',curTheme);applyTheme();renderSwatches();}
  if(!CATS.concat(customCats).some(function(c){return c.k===selCat}))selCat='nai';
  saveAll();
  fillInputs();
  refreshAll();
  applyingRemote=false;
}
/* ==================== 云账号：验证码登录 ==================== */
var pendingOtp=null;
function showAuth(show){document.getElementById('authMask').classList.toggle('show',show)}
function updateAccountUI(user){
  var t=document.getElementById('accountText');
  var btn=document.getElementById('btnSignOut');
  if(user){
    var id=user.phone||user.email||'';
    t.textContent=id?('已登录：'+id):'已登录';
    btn.style.display='block';
  }else{
    t.textContent='未登录';
    btn.style.display='none';
  }
}
async function bootAuth(){
 loadLock();renderLockStatus();buildGestureNodes();if(lockCfg)lockOpen('verify');
 try{await window.ledgerStore.connect(); var pulled=await pullCloud(); loggedIn=true; updateAccountUI({email:'Tiana'});document.getElementById('btnSignOut').style.display='none'; if(pulled)setSync('ok'); else await pushNow();}
 catch(e){setSync('err'); document.getElementById('accountText').textContent='云同步不可用'; toast('云端连接失败，请刷新重试');}
 if(loggedIn)document.getElementById('loading-overlay').remove(); else document.getElementById('loading-overlay').textContent='云端连接失败，请刷新后重试。';
}
async function sendAuthCode(){} async function doAuthLogin(){} function onSignOut(){}
/* ==================== 本地锁屏：手势 / 6 位数字密码 ==================== */
/* 密码只存本设备 localStorage，不进云端备份，仅防随手翻看 */
var lockCfg=null,lockCtx=null;
function loadLock(){lockCfg=lsGet('lock',null)}
async function hashStr(s){
  try{
    var buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('xwledger::'+s));
    return Array.prototype.map.call(new Uint8Array(buf),function(b){return b.toString(16).padStart(2,'0')}).join('');
  }catch(e){
    var h=5381;
    for(var i=0;i<s.length;i++){h=((h<<5)+h+s.charCodeAt(i))|0}
    return 'fallback'+(h>>>0).toString(16);
  }
}
function lockOpen(mode,type){
  var t=(mode==='setup')?type:(lockCfg&&lockCfg.type)||'pin';
  lockCtx={mode:mode,type:t,step:0,first:null,input:[],dragging:false,errFlag:false};
  document.getElementById('lockMask').classList.add('show');
  var isPin=t==='pin';
  document.getElementById('lockDots').style.display=isPin?'flex':'none';
  document.getElementById('lockPad').style.display=isPin?'grid':'none';
  document.getElementById('lockGesture').style.display=isPin?'none':'block';
  document.getElementById('lockSwitch').style.display=mode==='verify'?'flex':'none';
  lockSetHead();
  lockReset();
}
function lockClose(){
  document.getElementById('lockMask').classList.remove('show');
  lockCtx=null;
}
function lockSetHead(){
  var c=lockCtx,T=document.getElementById('lockTitle'),S=document.getElementById('lockSub');
  if(c.mode==='verify'){
    T.textContent=c.type==='pin'?'输入密码':'绘制手势解锁';
    S.textContent='解锁「打工人记账小本」';
  }else if(c.step===0){
    T.textContent=c.type==='pin'?'设置 6 位数字密码':'设置手势密码';
    S.textContent=c.type==='pin'?'输入 6 位数字，下次打开账本时用它解锁':'在九宫格上滑动连线，至少连 4 个点，下次打开账本时用它解锁';
  }else{
    T.textContent='再确认一次';
    S.textContent=c.type==='pin'?'再输入一遍同样的密码':'再画一遍同样的图案';
  }
}
function lockReset(){
  if(!lockCtx)return;
  lockCtx.input=[];lockCtx.errFlag=false;
  document.getElementById('lockErr').textContent='';
  if(lockCtx.type==='pin'){
    document.querySelectorAll('#lockDots i').forEach(function(d){d.classList.remove('on')});
  }else{
    document.querySelectorAll('#lockGesture .g-node').forEach(function(n){n.classList.remove('hot')});
    drawLockLines();
  }
}
function lockErr(msg){
  var c=lockCtx;if(!c)return;
  document.getElementById('lockErr').textContent=msg;
  c.errFlag=true;
  var card=document.querySelector('#lockMask .auth-card');
  card.classList.remove('lock-shake');void card.offsetWidth;card.classList.add('lock-shake');
  if(c.type==='gesture')drawLockLines();
  setTimeout(lockReset,550);
}
function lockPinKey(k){
  var c=lockCtx;if(!c||c.type!=='pin')return;
  if(k==='del'){c.input.pop();lockDotsRender();return}
  if(c.input.length>=6)return;
  c.input.push(k);lockDotsRender();
  if(c.input.length===6)setTimeout(function(){lockSubmit(c.input.join(''))},120);
}
function lockDotsRender(){
  var n=lockCtx?lockCtx.input.length:0;
  document.querySelectorAll('#lockDots i').forEach(function(d,i){d.classList.toggle('on',i<n)});
}
function buildGestureNodes(){
  var g=document.getElementById('lockGesture');
  g.querySelectorAll('.g-node').forEach(function(n){n.remove()});
  for(var i=0;i<9;i++){
    var d=document.createElement('div');
    d.className='g-node';d.setAttribute('data-i',String(i));
    d.style.left=(16.67+(i%3)*33.33)+'%';
    d.style.top=(16.67+Math.floor(i/3)*33.33)+'%';
    d.innerHTML='<i></i>';
    g.appendChild(d);
  }
}
function gCenter(i){return [40+(i%3)*80,40+Math.floor(i/3)*80]}
function drawLockLines(){
  var c=lockCtx,svg=document.getElementById('lockLines');
  var seq=c?c.input:[];
  if(seq.length<2){svg.innerHTML='';return}
  var col=c&&c.errFlag?'#B4483E':(getComputedStyle(document.body).getPropertyValue('--ac')||'#111111').trim();
  var pts=seq.map(function(i){var p=gCenter(+i);return p[0]+','+p[1]}).join(' ');
  svg.innerHTML='<polyline points="'+pts+'" fill="none" stroke="'+col+'" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>';
}
function lockGestureStart(e){
  if(!lockCtx||lockCtx.type!=='gesture')return;
  e.preventDefault();
  lockCtx.dragging=true;
  lockGestureMove(e);
}
function lockGestureMove(e){
  if(!lockCtx||!lockCtx.dragging||lockCtx.type!=='gesture')return;
  var el=document.elementFromPoint(e.clientX,e.clientY);
  var node=el&&el.closest?el.closest('.g-node'):null;
  if(!node)return;
  var i=+node.getAttribute('data-i');
  if(lockCtx.input.indexOf(i)<0){
    lockCtx.input.push(i);
    node.classList.add('hot');
    drawLockLines();
  }
}
function lockGestureEnd(){
  var c=lockCtx;if(!c||!c.dragging)return;
  c.dragging=false;
  if(c.input.length>=4)lockSubmit(c.input.join('-'));
  else lockErr('至少要连 4 个点哦');
}
async function lockSubmit(val){
  var c=lockCtx;if(!c)return;
  if(c.mode==='verify'){
    var h=await hashStr(val);
    if(lockCfg&&h===lockCfg.hash){lockClose();return}
    lockErr(c.type==='pin'?'密码不对，再试试':'图案不对，再试试');
  }else{
    if(c.step===0){
      c.first=val;c.step=1;
      lockSetHead();lockReset();
    }else if(val===c.first){
      var hh=await hashStr(val);
      lockCfg={type:c.type,hash:hh};
      lsSet('lock',lockCfg);
      lockClose();
      renderLockStatus();
      toast(c.type==='pin'?'数字密码已设置 ✓':'手势密码已设置 ✓');
    }else{
      lockErr('两次输入不一致，重新来一遍');
      c.step=0;c.first=null;
      lockSetHead();
    }
  }
}
function renderLockStatus(){
  var t=document.getElementById('lockStatusText');
  var bG=document.getElementById('btnLockGesture'),bP=document.getElementById('btnLockPin'),bR=document.getElementById('btnLockRemove');
  if(lockCfg){
    t.innerHTML='已开启<b>'+(lockCfg.type==='pin'?'6 位数字密码':'手势密码')+'</b>，每次打开账本需要解锁。';
    bG.style.display='none';bP.style.display='none';bR.style.display='block';
  }else{
    t.textContent='未设置。设置后每次打开账本需要解锁，防止别人随手翻看。';
    bG.style.display='block';bP.style.display='block';bR.style.display='none';
  }
}
function onLockSetup(type){
  openModal(type==='pin'?'设置后每次打开账本都要输入 6 位数字密码。继续吗？':'设置后每次打开账本都要画手势解锁。继续吗？',function(){
    lockOpen('setup',type);
  });
}
function onLockRemove(){
  openModal('解除后打开账本不再需要密码（数据不受影响）。确定解除吗？',function(){
    lockCfg=null;lsSet('lock',null);
    renderLockStatus();
    toast('锁屏密码已解除');
  });
}
function onLockForgot(){
  openModal('锁屏密码只存在本设备。点「确认」将清除当前密码，之后可在「数据 & 备份」页重新设置。',function(){
    lockCfg=null;lsSet('lock',null);
    lockClose();
    renderLockStatus();
    toast('锁屏密码已清除，建议重新设置一个');
  });
}

/* ==================== 示例数据徽标 ==================== */
function updateDemoBadge(){
  var on=!!(settings&&settings.demoActive&&records.some(function(r){return r.demo}));
  document.querySelectorAll('.demo-badge').forEach(function(el){el.style.display=on?'inline-flex':'none'});
}

/* ==================== 统一刷新入口（唯一调度者） ==================== */
function refreshAll(){
  renderDashboard();   // 内部调用 updateDemoBadge（同层单向）
  renderRecords();
  renderHourly();
  renderSim();
  renderGoal();        // 内部调用 renderChart（同层单向）
  renderDebt();
  renderAssets();
  renderReport();
  renderChips();
}

/* ==================== Toast 与确认弹窗 ==================== */
var toastTimer=null;
function toast(msg){
  var t=document.getElementById('toast');if(!t)return;
  t.textContent=msg;t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){t.classList.remove('show')},2400);
}
var modalCb=null;
function openModal(text,cb){
  setText('modalText',text);
  modalCb=cb||null;
  document.getElementById('modalMask').classList.add('show');
}
function closeModal(){
  document.getElementById('modalMask').classList.remove('show');
  modalCb=null;
}

/* ==================== 事件处理（改数据 → refreshAll） ==================== */
function onAddRecord(e){
  e.preventDefault();
  var amt=parseFloat(document.getElementById('inAmount').value);
  if(!(amt>0)){toast('请先输入正确的金额～');return}
  var dv=document.getElementById('inDate').value;
  var date=/^\d{4}-\d{2}-\d{2}$/.test(dv)?dv:fmtDate(new Date());
  var r={
    id:'r'+Date.now()+Math.floor(Math.random()*1000),
    date:date,
    amount:Math.round(amt*100)/100,
    cat:selCat,
    note:document.getElementById('inNote').value.trim(),
    demo:false,ts:Date.now()
  };
  records.push(r);
  saveAll();
  var h=amountToHours(r.amount,calcHourly(settings).hourly);
  var banner=document.getElementById('saveResult');
  banner.style.display='block';
  banner.innerHTML='💸 这一笔 = <b>'+h.h+' 小时 '+h.m+' 分钟</b> 的真实工时'+(date!==fmtDate(new Date())?'（记在 '+date+'）':'')+'，小猪都替你心疼！';
  document.getElementById('inAmount').value='';
  document.getElementById('inNote').value='';
  document.getElementById('inDate').value=fmtDate(new Date());
  toast('记账成功 ✓');
  refreshAll();
}
function onDeleteRecord(id){
  records=records.filter(function(r){return r.id!==id});
  saveAll();
  toast('已删除这条记录');
  refreshAll();
}
function onAddDebt(e){
  e.preventDefault();
  var name=document.getElementById('debtName').value.trim();
  var amt=parseFloat(document.getElementById('debtAmount').value);
  if(!(amt>0)){toast('先填一个大于 0 的金额哈');return}
  debts.push({
    id:'d'+Date.now()+Math.floor(Math.random()*1000),
    name:name||'未命名负债',
    amount:Math.round(amt*100)/100,
    demo:false,ts:Date.now()
  });
  saveAll();
  document.getElementById('debtName').value='';
  document.getElementById('debtAmount').value='';
  toast('已记上 ✓ 还清后点 ✕ 删掉它');
  refreshAll();
}
function onDeleteDebt(id){
  debts=debts.filter(function(d){return d.id!==id});
  saveAll();
  toast('还清一笔，轻了一分 ✓');
  refreshAll();
}
function onExport(){
  var payload={app:'work-ledger',version:1,exportedAt:new Date().toISOString(),
               settings:settings,records:records,savings:savings,goal:goal,debts:debts,assets:assets,cats:customCats,theme:curTheme};
  var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='打工人记账小本备份-'+fmtDate(new Date())+'.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(a.href)},3000);
  toast('备份已下载 ✓');
}
function onImportFile(file){
  if(!file)return;
  var reader=new FileReader();
  reader.onload=function(){
    var obj=null;
    try{obj=JSON.parse(reader.result)}catch(e){obj=null}
    /* 导入前校验 */
    var ok=obj&&typeof obj==='object'
      &&obj.settings&&typeof obj.settings==='object'&&isFinite(Number(obj.settings.salary))
      &&Array.isArray(obj.records)&&Array.isArray(obj.savings);
    if(!ok){toast('文件格式不对，导入失败：请选择本账本导出的 JSON 文件');return}
    openModal('导入将<b>覆盖</b>当前全部数据（'+records.length+' 条记录），确定继续吗？',function(){
      settings=Object.assign(defaultSettings(),obj.settings);
      records=obj.records.filter(function(r){return r&&isFinite(Number(r.amount))&&r.date})
        .map(function(r){return {id:String(r.id||('r'+Math.random())),date:String(r.date),
          amount:Number(r.amount),cat:String(r.cat||'other'),note:String(r.note||''),
          demo:!!r.demo,ts:Number(r.ts)||Date.now()}});
      savings=obj.savings.filter(function(s){return s&&s.month&&isFinite(Number(s.amount))})
        .map(function(s){return {month:String(s.month),amount:Number(s.amount),demo:!!s.demo}});
      goal={target:Number(obj.goal&&obj.goal.target)||0,current:Number(obj.goal&&obj.goal.current)||0};
      debts=Array.isArray(obj.debts)?obj.debts.filter(function(d){return d&&d.name&&isFinite(Number(d.amount))})
        .map(function(d){return {id:String(d.id||('d'+Math.random())),name:String(d.name),
          amount:Number(d.amount),demo:!!d.demo,ts:Number(d.ts)||Date.now()}}):[];
      assets=Array.isArray(obj.assets)?obj.assets.filter(function(a){return a&&a.name&&isFinite(Number(a.amount))})
        .map(function(a){return {id:String(a.id||('a'+Math.random())),name:String(a.name),
          amount:Number(a.amount),demo:!!a.demo,ts:Number(a.ts)||Date.now()}}):[];
      customCats=Array.isArray(obj.cats)?obj.cats.filter(function(c){return c&&c.n&&c.e})
        .map(function(c){return {k:String(c.k||('c'+Math.random())),e:String(c.e),n:String(c.n),
          bg:String(c.bg||'#EDEDEA')}}):[];
      if(typeof obj.theme==='string'){curTheme=obj.theme;lsSet('theme',curTheme);applyTheme();renderSwatches();}
  if(!CATS.concat(customCats).some(function(c){return c.k===selCat}))selCat='nai';
      saveAll();
      fillInputs();
      refreshAll();
      toast('导入成功，共 '+records.length+' 条记录 ✓');
    });
  };
  reader.readAsText(file,'utf-8');
}
function onClearDemo(){
  var hasDemo=records.some(function(r){return r.demo})||savings.some(function(s){return s.demo})
    ||debts.some(function(d){return d.demo})||assets.some(function(a){return a.demo});
  if(!hasDemo&&!settings.demoActive){toast('已经没有示例数据啦～');return}
  openModal('将清除全部<b>示例</b>记账、存款、负债与账户数据（你自己记的记录不受影响），设置数值会保留。确定吗？',function(){
    records=records.filter(function(r){return !r.demo});
    savings=savings.filter(function(s){return !s.demo});
    debts=debts.filter(function(d){return !d.demo});
    assets=assets.filter(function(a){return !a.demo});
    settings.demoActive=false;
    saveAll();
    refreshAll();
    toast('示例数据已清除 ✓');
  });
}

/* ==================== 初始化 ==================== */
var SETTING_FIELDS=[
  ['inSalary','salary',0],['inPayMonths','payMonths',1,24],
  ['inCommuteCost','commuteCost',0],['inMealCost','mealCost',0],
  ['inToolCost','toolCost',0],['inFixed','fixedMonthly',0],['inBudget','budget',0],
  ['inHoursDay','hoursDay',0],['inCommuteMin','commuteMin',0],
  ['inOTWeek','otWeek',0],['inSafety','safetyFund',0]
];
function fillInputs(){
  SETTING_FIELDS.forEach(function(f){
    var el=document.getElementById(f[0]);
    if(el)el.value=settings[f[1]];
  });
  document.getElementById('inTarget').value=goal.target;
  document.getElementById('inCurrent').value=goal.current;
}
function init(){
  /* 载入数据；首次打开（任一关键数据缺失）→ 预置演示数据 */
  var st=lsGet('settings',null),rc=lsGet('records',null),sv=lsGet('savings',null),gl=lsGet('goal',null),db=lsGet('debts',null),as=lsGet('assets',null);
  if(st===null||rc===null||sv===null||gl===null){
    initDemoData();
  }else{
    settings=Object.assign(defaultSettings(),st);
    records=Array.isArray(rc)?rc:[];
    savings=Array.isArray(sv)?sv:[];
    goal=gl&&typeof gl==='object'?gl:{target:0,current:0};
    debts=Array.isArray(db)?db:(settings.demoActive?demoDebts():[]);
    assets=Array.isArray(as)?as:(settings.demoActive?demoAssets():[]);
    if(db===null||as===null)saveAll();
  }
  customCats=lsGet('cats',[]);
  curTheme=String(lsGet('theme','')||'');
  applyTheme();
  fillInputs();
  document.getElementById('inDate').value=fmtDate(new Date());
  /* 导航切换（侧栏 + 底部 Tab 共用 data-page） */
  document.querySelectorAll('[data-page]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var id=btn.getAttribute('data-page');
      document.querySelectorAll('.page').forEach(function(p){p.classList.toggle('active',p.id==='page-'+id)});
      document.querySelectorAll('[data-page]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-page')===id)});
      window.scrollTo(0,0);
    });
  });
  /* 记账表单 */
  document.getElementById('addForm').addEventListener('submit',onAddRecord);
  document.getElementById('chipBox').addEventListener('click',function(e){
    var addBtn=e.target.closest('.chip-add');
    if(addBtn){
      document.getElementById('customCatPanel').classList.toggle('show');
      return;
    }
    var chip=e.target.closest('.chip');
    if(!chip)return;
    selCat=chip.getAttribute('data-cat');
    document.querySelectorAll('#chipBox .chip').forEach(function(c){c.classList.remove('sel')});
    chip.classList.add('sel');
  });
  /* 自定义分类：选 emoji / 添加 / 删除 */
  document.getElementById('epGrid').addEventListener('click',function(e){
    var b=e.target.closest('.ep-item');
    if(!b)return;
    pickedEmoji=b.getAttribute('data-e');
    renderEpGrid();
  });
  document.getElementById('btnAddCat').addEventListener('click',function(){
    var name=document.getElementById('newCatName').value.trim();
    if(!name){toast('先给分类起个名字哈');return}
    if(CATS.concat(customCats).some(function(c){return c.n===name})){
      toast('已经有叫「'+name+'」的分类啦');return;
    }
    var c={k:'c'+Date.now(),e:pickedEmoji,n:name,bg:CUSTOM_BGS[customCats.length%CUSTOM_BGS.length]};
    customCats.push(c);
    selCat=c.k;
    document.getElementById('newCatName').value='';
    saveAll();
    renderChips();
    document.getElementById('customCatPanel').classList.remove('show');
    toast('分类「'+name+'」已添加 ✓');
  });
  document.getElementById('customCatList').addEventListener('click',function(e){
    var b=e.target.closest('.del-btn');
    if(!b)return;
    var k=b.getAttribute('data-cc');
    var c=customCats.filter(function(x){return x.k===k})[0];
    if(!c)return;
    openModal('删除自定义分类「'+esc(c.n)+'」？用它记过的账会显示为「其他」，记录本身不会丢。',function(){
      customCats=customCats.filter(function(x){return x.k!==k});
      if(selCat===k)selCat='other';
      saveAll();
      renderChips();
      refreshAll();
      toast('已删除该分类');
    });
  });
  /* 记录删除（事件委托） */
  document.getElementById('allList').addEventListener('click',function(e){
    var btn=e.target.closest('.del-btn');
    if(!btn)return;
    var id=btn.getAttribute('data-id');
    var rec=records.filter(function(r){return r.id===id})[0];
    if(rec&&rec.demo){
      openModal('这是<b>示例记录</b>，删除它可以用「备份」页的「清除示例数据」一键搞定，也可以单删这条。确定删除吗？',function(){onDeleteRecord(id)});
    }else if(rec){
      openModal('删除这条 ¥'+rec.amount+' 的记录？删除后无法恢复哦。',function(){onDeleteRecord(id)});
    }
  });
  /* 负债模块 */
  document.getElementById('debtForm').addEventListener('submit',onAddDebt);
  document.getElementById('debtList').addEventListener('click',function(e){
    var btn=e.target.closest('.del-btn');
    if(!btn)return;
    var id=btn.getAttribute('data-debt');
    var d=debts.filter(function(x){return x.id===id})[0];
    if(!d)return;
    openModal('「'+esc(d.name)+'」¥'+d.amount+'，还清了吗？删掉后无法恢复。',function(){onDeleteDebt(id)});
  });
  /* 资产账户模块 */
  document.getElementById('assetForm').addEventListener('submit',onAddAsset);
  document.getElementById('assetList').addEventListener('click',function(e){
    var btn=e.target.closest('.del-btn');
    if(!btn)return;
    var id=btn.getAttribute('data-asset');
    var a=assets.filter(function(x){return x.id===id})[0];
    if(!a)return;
    openModal('删掉账户「'+esc(a.name)+'」（'+(a.amount<0?'-':'')+'¥'+Math.abs(a.amount).toFixed(Math.abs(a.amount)%1?2:0)+'）？删掉后无法恢复。',function(){onDeleteAsset(id)});
  });
  /* 报表：月份切换 / Tab 切换 / 点选日期 */
  document.getElementById('repPrev').addEventListener('click',function(){shiftRepMonth(-1)});
  document.getElementById('repNext').addEventListener('click',function(){shiftRepMonth(1)});
  document.getElementById('repSeg').addEventListener('click',function(e){
    var b=e.target.closest('button');
    if(!b)return;
    repTab=b.getAttribute('data-tab');
    renderReport();
  });
  document.getElementById('calGrid').addEventListener('click',function(e){
    var cell=e.target.closest('.cal-cell');
    if(!cell||!cell.getAttribute('data-day'))return;
    repDay=cell.getAttribute('data-day');
    renderReport();
  });
  /* 纯色换肤 */
  document.getElementById('swatchBox').addEventListener('click',function(e){
    var b=e.target.closest('.swatch');
    if(!b)return;
    onPickTheme(b.getAttribute('data-theme')||'');
  });
  renderSwatches();
  /* 智能识别：文字解析 / 批量记入 */
  document.getElementById('btnParseText').addEventListener('click',parseBillText);
  document.getElementById('btnCommitBills').addEventListener('click',commitBills);
  document.getElementById('billPreview').addEventListener('click',function(e){
    var b=e.target.closest('.del-btn');
    if(!b)return;
    pendingBills.splice(Number(b.getAttribute('data-bill')),1);
    renderBillPreview();
  });
  /* 设置项输入 → 更新数据 → 统一刷新 */
  SETTING_FIELDS.forEach(function(f){
    var el=document.getElementById(f[0]);
    if(!el)return;
    el.addEventListener('input',function(){
      var max=f[3];
      settings[f[1]]=pn(el.value,f[2],max);
      if(f[1]==='safetyFund'&&String(pn(el.value,f[2],max))!==el.value)el.value=settings[f[1]];
      saveAll();
      refreshAll();
    });
  });
  /* 目标输入 */
  [['inTarget','target'],['inCurrent','current']].forEach(function(f){
    var el=document.getElementById(f[0]);
    el.addEventListener('input',function(){
      goal[f[1]]=Math.max(0,Number(el.value)||0);
      saveAll();
      refreshAll();
    });
  });
  /* 情景模拟器滑块（只影响本页结果，无需全量刷新） */
  ['simCommute','simOT','simRaise'].forEach(function(id){
    document.getElementById(id).addEventListener('input',renderSim);
  });
  /* 数据页按钮 */
  document.getElementById('btnExport').addEventListener('click',onExport);
  document.getElementById('btnImport').addEventListener('click',function(){
    document.getElementById('fileImport').click();
  });
  document.getElementById('fileImport').addEventListener('change',function(e){
    onImportFile(e.target.files[0]);
    e.target.value='';
  });
  document.getElementById('btnClearDemo').addEventListener('click',onClearDemo);
  /* 弹窗 */
  document.getElementById('modalOk').addEventListener('click',function(){
    var cb=modalCb;closeModal();if(cb)cb();
  });
  document.getElementById('modalCancel').addEventListener('click',closeModal);
  document.getElementById('modalMask').addEventListener('click',function(e){
    if(e.target===this)closeModal();
  });
  /* 云账号：登录入口（可选）/ 验证码 / 退出 */
  document.getElementById('btnCloudLogin').addEventListener('click',function(){
    toast(loggedIn?'账本已连接云端':'云端连接失败，请刷新');
  });
  document.getElementById('btnAuthClose').addEventListener('click',function(){showAuth(false)});
  document.getElementById('btnSendCode').addEventListener('click',sendAuthCode);
  document.getElementById('btnAuthLogin').addEventListener('click',doAuthLogin);
  document.getElementById('btnSignOut').addEventListener('click',onSignOut);
  /* 本地锁屏 */
  document.getElementById('btnLockGesture').addEventListener('click',function(){onLockSetup('gesture')});
  document.getElementById('btnLockPin').addEventListener('click',function(){onLockSetup('pin')});
  document.getElementById('btnLockRemove').addEventListener('click',onLockRemove);
  document.getElementById('btnLockForgot').addEventListener('click',onLockForgot);
  document.getElementById('lockPad').addEventListener('click',function(e){
    var b=e.target.closest('button');
    if(b)lockPinKey(b.getAttribute('data-k'));
  });
  var gEl=document.getElementById('lockGesture');
  gEl.addEventListener('pointerdown',lockGestureStart);
  gEl.addEventListener('pointermove',lockGestureMove);
  gEl.addEventListener('pointerup',lockGestureEnd);
  gEl.addEventListener('pointercancel',lockGestureEnd);
  gEl.addEventListener('pointerleave',lockGestureEnd);
  refreshAll();
  bootAuth();
}
init();
