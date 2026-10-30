

var WAKE='07:10', OFF1='08:00', OFF1_END='11:30', NAP_START='13:00', WAKE2='15:10',
    OFF2='15:30', OFF2_END='17:30', BED='22:30';
var BASE_CIG=20;


var SLOTS=[
  {tm:'07:10',nm:'起床后第一支',   ease:5,anchor:true,span: 80,why:'睡了一夜，血里尼古丁降到最低，戒断症状和生理性口渴叠在一起 —— 这一支是靠"身体真需要"抽的，最难砍，全程留到最后。'},
  {tm:'08:30',nm:'上班安顿好',     ease:3,span: 90,why:'一天刚开始，注意力在"进入工作状态"，这半支多半是动作惯性，喝杯水就过去了。'},
  {tm:'10:00',nm:'上午中段',       ease:1,span: 80,why:'全时段渴求最弱的一格：手里在干活、尼古丁没到低谷、也没有饭后睡前的钩子。第一刀砍这里，代价最小。'},
  {tm:'11:20',nm:'上午末（下班前）',ease:3,span: 70,why:'临近下班，注意力还在手上的活，走神抽的，扛一下就过去。'},
  {tm:'12:30',nm:'午饭后',         ease:4,span: 30,why:'血糖升到峰值 + 饭后放松，代谢性渴求真实存在，比"闲下来想抽"难对付，所以排到第四才动。'},
  {tm:'15:30',nm:'下午上班',       ease:2,span:115,why:'午休刚起人还困，被"醒一醒"的念头驱动 —— 站起来接水、洗个脸就能顶掉，替代最容易。'},
  {tm:'17:25',nm:'下班前',         ease:2,span: 65,why:'一天工作已收尾，没有后续任务要赶，是典型的"空档抽一支"，最容易替换掉。'},
  {tm:'18:30',nm:'晚饭后',         ease:4,night:true,span:120,x:'饭后别坐。站起来洗碗、擦灶台，20 分钟就过去了。嘴里含一片薄荷糖或无糖口香糖。',why:'饭后血糖升上来 + 一天工作结束身心都松，渴求有生理底座，排到第四才动。'},
  {tm:'20:30',nm:'晚上（高危）',   ease:4,night:true,span: 90,x:'最难的一格。提前 10 分钟出门快走一圈，或泡杯热水坐着。渴求只持续 3–5 分钟，撑过去这格就赢了。',why:'尼古丁代谢到了低谷 + 独处无聊，但比饭后那两格弱一点。'},
  {tm:'22:00',nm:'睡前（高危）',   ease:5,night:true,anchor:true,span: 30,x:'别躺在床上硬扛。起来做 10 分钟拉伸（正好是运动第 4 项），困意上来就赢了。或者刷牙——口腔一动烟瘾弱一半。',why:'一天最后一次，压力大、放松、仪式感都在这一支上，还和"躺下""刷手机"绑成了条件反射。睡前断烟是公认最易崩的时点，全程留到最后。'}
];

var NIGHTKIT=[
  {k:'nk1',a:'无糖口香糖 / 薄荷糖',b:'嘴里有东西，渴求降一半'},
  {k:'nk2',a:'一小把坚果',b:'嚼东西代替抽烟那个动作'},
  {k:'nk3',a:'温水杯',b:'很多"想抽"其实是嘴干'},
  {k:'nk4',a:'牙刷牙膏',b:'口腔一动，烟瘾弱一半'},
  {k:'nk5',a:'跑鞋 / 拖鞋',b:'真想抽就出门走 10 分钟'}
];


var CURVE=[
  15,15,15,15,15,15,15,   
  10,10,10,10,10,10,10,   
   7, 7, 7, 7, 7, 7, 7,   
   5, 5, 5, 5, 5, 5, 5,   
   3, 3, 3, 3, 3, 3, 3,   
   1, 1, 1, 1, 1, 1, 1,   
   0, 0, 0, 0, 0, 0, 0    
];

var SOLIDIFY_DAYS=61;                               
var SOLIDIFY_FROM=CURVE.indexOf(0)+7;
var TOTAL_DAYS=SOLIDIFY_FROM+SOLIDIFY_DAYS;         

var WEEKS=[
  {t:'第 1 周 · 20 → 15 支',g:'每天不超过 **15 支**。这一刀砍掉 5 支，是全程最狠的一步——但正因如此，别用「减量慢一点」安慰自己。江苏疾控原文就这个数：**第 1 周不超过 15 支**。'},
  {t:'第 2 周 · 15 → 10 支',g:'每天不超过 **10 支**。尼古丁已基本排出，躯体症状明显减轻，**但渴求会变频繁**——现在挡你的是习惯不是药。好减的时段（上午中段、下班前）会逐个退出。'},
  {t:'第 3 周 · 10 → 7 支',g:'每天不超过 **7 支**。只剩一半。这时候最容易「已经戒一半了，松一松」——**恰恰不能松**，7 支支撑一整天没问题，10 支也支撑一整天，差别在明天。'},
  {t:'第 4 周 · 7 → 5 支',g:'每天不超过 **5 支**。⚠️ 江苏疾控原文没有这一档（从第 3 周 7 支直接跳第 5 周 3 支），这里补充了 5 支，保证平滑不反弹。你觉得跳得难受也可以直接跳到 3 支，改一处就行。'},
  {t:'第 5 周 · 5 → 3 支',g:'每天不超过 **3 支**。只剩晨起、饭后、睡前那几格了，**每一支都是硬仗**。夜间渴求会反扑，属正常，扛不住就在下面点「扛住了」。'},
  {t:'第 6 周 · 3 → 1 支',g:'每天**只剩 1 支**。这一天最难熬——身体其实已经不需要尼古丁了，剩下的是纯心理惯性。**这一支放在 07:10 起床后抽**，其余时间一律不抽。'},
  {t:'第 7 周 · 完全不抽',g:'**整整一周 0 支。**这是全程最难的一段，夜间渴求会反扑，属正常。每扛住一次就点一下「扛住了」，这些记录比「几天没抽」更能说明问题。'},
  {t:'第 8–16 周 · 巩固期',g:'目标恒为 0 支。**清零不是结束，是最难的一段开始。**行为习惯重建要 1–3 个月，这期间饭后、加班、有人递烟仍会勾起渴求——照旧记进打卡页。'}
];


var EXERCISE=[
  {k:'ex1',tm:'07:10–07:45',a:'起床后快走 35 分钟',b:'空腹有氧，帮助保持运动习惯',goal:'weekday'},
  {k:'ex2',tm:'12:40–13:00',a:'午饭后快走 20 分钟',b:'饭后别马上躺，这 20 分钟专治「午饭后那支」',goal:'weekday'},
  {k:'ex3',tm:'17:40–18:20',a:'下班后有氧 40 分钟',b:'骑车、快走、慢跑都行，出汗就够',goal:'weekday'},
  {k:'ex4',tm:'22:00–22:20',a:'睡前拉伸 20 分钟',b:'改善睡眠；睡着后身体才做烟毒代谢',goal:'weekday'},
  {k:'ex5',tm:'周六上午',a:'长走或打球 60 分钟',b:'每周至少 1 次长时间活动',goal:'sat'}
];

var SCENES=['饭后犯困','压力大','困了想提神','无聊','手里没事干','有人递烟','酒局应酬','刚忙完一口松','加班'];
var CRAVE=[['没有',0],['有点想',1],['挺想',2],['特别想',3]];

var KEY='quitFit_v1', KEYC=KEY+'_c';   
function rd(k,d){var v=window.quitStore.cache[k];return v==null?d:JSON.parse(v);}
function wr(k,v){window.quitStore.save(k,JSON.stringify(v));}
function fmt(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function day(s){return Math.round(new Date(s+'T00:00:00').getTime()/86400000);}
var T=fmt(new Date());

var DEFAULT_QUIT=T;

function cfg(){
  var c=rd(KEYC,null);
  if(!c){return {quit:DEFAULT_QUIT,base:BASE_CIG,auto:true};}
  if(!c.quit)c.quit=DEFAULT_QUIT;
  if(c.base!==BASE_CIG){c.base=BASE_CIG;}
  if(c.auto===undefined)c.auto=true;   
  return c;
}
var D=rd(KEY,{});


function targetBase(n){return n<0?0:(n>=CURVE.length?0:CURVE[n]);}


function carryDebt(C, uptoN){
  if(uptoN<=0)return 0;
  var debt=0, q=day(C.quit);
  for(var i=0;i<uptoN;i++){
    var k=fmt(new Date((q+i)*86400000));
    var r=D[k];if(!r)continue;
    var c=0;SLOTS.forEach(function(s,si){c+=(+((r.act||{})[si])||0);});
    var over=c-targetBase(i);
    if(over>0)debt+=over;
  }
  return debt;
}

function target(n){
  var base=targetBase(n);
  if(n<0)return 0;
  if(!cfg().auto)return base;            
  return Math.min(BASE_CIG, base+carryDebt(cfg(),n));
}

function isSolidify(n){return n>=SOLIDIFY_FROM;}

function phaseIndex(n){
  if(n<0)return 0;
  if(isSolidify(n))return 7;
  return Math.floor(n/7);           
}
function phaseName(n){
  if(n<0)return '还没开始';
  if(isSolidify(n))return '巩固期 · 第 '+(Math.floor((n-SOLIDIFY_FROM)/7)+1)+' 周';
  return WEEKS[phaseIndex(n)].t;
}

function zeroDate(C){
  var q=day(C.quit), first0=CURVE.indexOf(0);
  var n=day(T)-day(C.quit);
  var debt=n>0?carryDebt(C,n):0;
  
  var push=0;
  if(debt>0){
    var d=debt;
    for(var i=first0;i<SOLIDIFY_FROM;i++){
      if(d<=0)break;
      var per=Math.max(1,targetBase(i));      
      var take=Math.min(d,per);
      d-=take;push++;
    }
    if(d>0)push+=Math.ceil(d/1);             
  }
  return fmt(new Date((q+first0+push)*86400000));
}


var FINE_PER=100;                
var PAYEE='监督人';              

function penaltyFor(tg,cigs){
  var over=cigs-tg;
  return over>0?over*FINE_PER:0;
}

function fineOf(r,cigs,tn){
  if(r&&r.fine!==undefined)return +r.fine||0;
  return penaltyFor(tn<0?0:targetBase(tn),cigs);
}



var SLOT_MAX=2;              


var UP_ORDER=(function(){
  var a=[];SLOTS.forEach(function(s,i){if(s.anchor)a.push(i);});
  var r=[];SLOTS.forEach(function(s,i){if(!s.anchor)r.push(i);});
  r.sort(function(x,y){return SLOTS[y].ease-SLOTS[x].ease||y-x;});
  return a.concat(r);
})();
var OUT_ORDER=(function(){
  return SLOTS.map(function(s,i){return i;})
    .sort(function(x,y){return SLOTS[x].ease-SLOTS[y].ease||x-y;});
})();

function distribute(t){
  var N=SLOTS.length, plan={}, i;
  for(i=0;i<N;i++)plan[i]=0;
  if(t<=0)return plan;
  if(t===1){plan[0]=1;return plan;}          
  if(t<=N){
    
    for(i=N-t;i<N;i++)plan[OUT_ORDER[i]]=1;
    return plan;
  }
  
  for(i=0;i<N;i++)plan[i]=1;
  for(i=0;i<t-N;i++)plan[UP_ORDER[i]]++;
  return plan;
}


function hmin(hm){var a=String(hm).split(':');return (+a[0])*60+(+a[1]);}
function hstr(m){return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+(m%60)).slice(-2);}
function slotTimes(i,k){
  k=+k||0;
  if(k<=0)return [];
  var base=hmin(SLOTS[i].tm), sp=+SLOTS[i].span||30, out=[], j;
  if(k===1)return [base];
  for(j=0;j<k;j++)out.push(base+Math.round(j*sp/k/5)*5);
  return out;
}

function allTimes(plan){
  var out=[];
  SLOTS.forEach(function(s,i){
    slotTimes(i,+((plan||{})[i])||0).forEach(function(m){out.push(m);});
  });
  return out.sort(function(a,b){return a-b;});
}

var draft=null;
function loadDraft(){
  var n=day(T)-day(cfg().quit);
  
  var plan=distribute(n<0?BASE_CIG:target(n));
  draft={plan:plan,act:{},ex:{},kit:{},held:0,crave:0,scene:''};
  var r=D[T];
  if(r){
    draft.act=r.act||{};draft.ex=r.ex||{};draft.kit=r.kit||{};
    draft.held=+r.held||0;
    draft.crave=+r.crave||0;draft.scene=r.scene||'';
  }
}
function actTotal(){
  var t=0;SLOTS.forEach(function(s,i){t+=(+draft.act[i]||0);});return t;
}
function planTotal(){
  var t=0;SLOTS.forEach(function(s,i){t+=(+draft.plan[i]||0);});return t;
}

function render(){
  var C=cfg(),n=day(T)-day(C.quit),tgt=target(n),act=actTotal();
  
  var tBase=n<0?0:targetBase(n);
  var wi=phaseIndex(n);
  
  var base0=targetBase(n), debt=n>0?carryDebt(C,n):0;
  var adj=debt>0&&tgt>base0;

  document.getElementById('sub').textContent=
    '起始日 '+C.quit+' · '+(n<0?'今天起还有 '+(-n)+' 天':'第 '+(n+1)+' 天')+
    ' · 平时 '+C.base+' 支/天 · 今日目标 '+tgt+' 支'+
    (isSolidify(n)?' · 已进入巩固期':(n<0?' · 今天是准备日':''));

  // 顺延提示条（没欠账就隐藏）
  var ab=document.getElementById('adjust');
  if(adj&&!isSolidify(n)){
    ab.style.display='block';
    ab.innerHTML='<b>今日目标已顺延</b>：原计划 '+base0+' 支，前几天累计多抽 '+debt+' 支，'+
      '今日目标自动调为 <b>'+tgt+' 支</b>，把欠账补回来。补完会自动回到曲线值。'+
      '<br><b>注意：顺延只管任务目标，不管罚款</b>——今天超过 '+base0+' 支的部分照样按 100 元/支罚。';
  }else{ab.style.display='none';}

  document.getElementById('dNum').textContent=Math.max(0,n);
  var cumCigs=0,best=0,run=0,pass=0,passed=0,exDone=0,exNeed=0,wkEx=0,overDays=0,fineTotal=0,fineUnpaid=0,fineDays=0;
  var keys=Object.keys(D).sort();
  keys.forEach(function(k){
    var r=D[k],c=0;
    SLOTS.forEach(function(s,i){c+=(+((r.act||{})[i])||0);});
    cumCigs+=c;
    var tn=day(k)-day(C.quit);
    
    var tg=targetBase(tn), isSat=(new Date(k+'T00:00:00').getDay()===6);
    if(tn>=0){
      pass++;
      if(c<=tg)passed++; else overDays++;
      var fin=fineOf(r,c,tn);
      if(fin>0){
        fineTotal+=fin;fineDays++;
        if(!(r.paid))fineUnpaid+=fin;
      }
      exNeed+=isSat?5:4;
      var e=r.ex||{},ec=0;
      EXERCISE.forEach(function(x){if(e[x.k])ec++;});
      exDone+=ec;
    }
    if(c===0){run++;best=Math.max(best,run);}else run=0;
    if((+r.min||0)>0||(r.ex&&Object.keys(r.ex).length)){ }
  });
  // 近 7 日运动
  var w7=[],dd=new Date();
  for(var i=0;i<7;i++){w7.push(fmt(dd));dd.setDate(dd.getDate()-1);}
  w7.forEach(function(k){var e=D[k]&&D[k].ex;if(e){var any=Object.keys(e).some(function(x){return e[x];});if(any)wkEx++;}});

  document.getElementById('dCum').textContent=Math.max(0,n*C.base-cumCigs)+' 支';
  document.getElementById('dCap').textContent=n<0?'还没到起始日 —— 今天照常抽，但把第 '+(-n)+' 天的量记下来当基线'
    : (tBase===0 ? (act===0?'今天 0 支 · 完全截断，守住了':'今天抽了 '+act+' 支，今天目标 0 支')
               : (act<=tBase?('今天抽了 '+act+' 支，在 '+tBase+' 支目标内'):('今天抽了 '+act+' 支，超出原始计划 '+(act-tBase)+' 支')));
  var prog=Math.max(0,Math.min(1,n/(TOTAL_DAYS-1)));
  document.getElementById('dBar').style.width=(prog*100)+'%';
  document.getElementById('dL').textContent='第 '+(n+1)+' 天'+(isSolidify(n)?'（巩固期）':'');
  document.getElementById('dR').textContent=TOTAL_DAYS+' 天全程';

  document.getElementById('sTgt').textContent=tgt+' / '+act;
  document.getElementById('sTgtR').textContent='日常 '+C.base+' 支';
  document.getElementById('sCig').textContent=pass?Math.round(passed/pass*100)+'%':'—';
  document.getElementById('sCigR').textContent=passed+'/'+pass+' 天达标';
  var exToday=Object.keys(draft.ex).filter(function(x){return draft.ex[x];}).length;
  document.getElementById('sEx').textContent=exNeed?Math.round(exDone/exNeed*100)+'%':exToday+'%';
  document.getElementById('sExR').textContent=exDone+' 项 / 应做 '+exNeed+' 项';
  document.getElementById('sBest').textContent=best+' 天';
  document.getElementById('sWk').textContent='近 7 日运动 '+wkEx+' 天';
  document.getElementById('sFine').textContent=fineTotal+' 元';
  document.getElementById('sFine').className='v '+(fineUnpaid>0?'r':'g');
  document.getElementById('sFineR').textContent=fineDays
    ? ('超标 '+fineDays+' 天 · 待交 '+fineUnpaid+' 元'+(fineUnpaid>0?' ⚠':''))
    : '还没超标过';
  // 累计扛住次数（先算，后面统计卡要用）
  var totalHeld=0,heldDays=0;
  Object.keys(D).forEach(function(k){var h=+D[k].held||0;if(h>0){totalHeld+=h;heldDays++;}});

  document.getElementById('sHeld').textContent=totalHeld+' 次';
  document.getElementById('sHeldR').textContent='累计 · 今日 '+draft.held+' 次';
  var kitToday=Object.keys(draft.kit).filter(function(x){return draft.kit[x];}).length;
  document.getElementById('sKit').textContent=kitToday+' / 5';
  document.getElementById('sOver').textContent=overDays+' 天';
  document.getElementById('sOverR').textContent=pass?('共 '+pass+' 天 · 占 '+Math.round(overDays/pass*100)+'%'):'共 0 天 · 占 0%';

  // 距清零 / 巩固期进度
  if(n<0){
    document.getElementById('sLeftK').textContent='距开始';
    document.getElementById('sLeft').textContent=(-n)+' 天';
    document.getElementById('sLeftR').textContent=C.quit+' 开始，第 '+(CURVE.indexOf(0)+1)+' 天目标降到 0';
    document.getElementById('sLeft').className='v g';
  }else if(isSolidify(n)){
    var sd=n-SOLIDIFY_FROM+1;
    document.getElementById('sLeftK').textContent='巩固期第几天';
    document.getElementById('sLeft').textContent=sd+' 天';
    document.getElementById('sLeftR').textContent='满 3 个月还差 '+Math.max(0,TOTAL_DAYS-1-n)+' 天';
    document.getElementById('sLeft').className='v a';
  }else{
    document.getElementById('sLeftK').textContent='距彻底清零';
    
    var remain=0;
    for(var i2=n;i2<SOLIDIFY_FROM;i2++)remain+=target(i2);
    var effRemain=Math.max(0,remain-debt);
    
    var est=Math.max(1,Math.min(SOLIDIFY_FROM-n,effRemain));
    document.getElementById('sLeft').textContent=est+' 天';
    document.getElementById('sLeftR').textContent=adj
      ? ('原计划 '+(SOLIDIFY_FROM-n)+' 天 · 欠账 '+debt+' 支顺延')
      
      : ('目标先降到 0：'+zeroDate(C)+'（第 '+CURVE.indexOf(0)+' 天）· 第 '+(SOLIDIFY_FROM+1)+' 天进巩固期');
    document.getElementById('sLeft').className='v g';
  }

  // 今天抽没抽 / 超标没超（自动按实际支数判定，可手动点覆盖）
  
  var st2=act===0?'zero':(act<=tBase?'ok':'over');
  var vd=document.getElementById('jgVerdict');
  vd.className='verdict '+st2;
  if(n<0) vd.innerHTML='还有 '+(-n)+' 天开始 · 今天是准备日<small>照常抽，但建议记下来当基线——知道起点是多少，减量才有参照</small>';
  else if(act===0) vd.innerHTML='今天 0 支 · 完全截断<small>这是最干净的一天</small>';
  else if(tBase===0) vd.innerHTML='今天抽了 '+act+' 支 · 今天目标 0 支<small>'+(isSolidify(n)?'巩固期破戒，记下来就行——真正的考验就在这段，从下一支继续':'清零阶段破戒，记下来就行，从下一支继续')+'</small>';
  else if(act<=tBase) vd.innerHTML='今天抽了 '+act+' 支，在 '+tBase+' 支目标内<small>达标，比平时少 '+(C.base-act)+' 支</small>';
  else vd.innerHTML='今天抽了 '+act+' 支，超标 '+(act-tBase)+' 支<small>不用自责——看下面哪一格多抽了，把它记成场景，明天专门盯它</small>';
  document.querySelectorAll('.jg .opts>button').forEach(function(b){
    var s=b.getAttribute('data-s');
    b.className=(s===st2?'on':'')+(s==='over'?' bad':'');
  });

  // 今日处罚单（口径 B：按**原始曲线** tBase 算，与顺延目标无关）
  var fb=document.getElementById('fineBox'), todayFine=n<0?0:penaltyFor(tBase,act);
  var rec=D[T]||{};
  if(todayFine>0){
    fb.className='fine ow';
    document.getElementById('fineAmt').textContent='罚 '+todayFine+' 元';
    document.getElementById('fineR').textContent='超出 '+Math.max(0,act-tBase)+' 支 × 100 元';
    document.getElementById('fineDesc').innerHTML=
      '今天抽了 '+act+' 支，<b>原始计划 '+tBase+' 支</b>，超出 '+(act-tBase)+' 支。<b>每超 1 支罚 100 元，钱交 '+PAYEE+'。</b>'+
      (tgt!==tBase?('（今天任务目标已顺延到 <b>'+tgt+' 支</b>，但罚款按原始计划的 '+tBase+' 支算，顺延不免罚）'):'')+
      (fineUnpaid>0?('目前累计待交 <b>'+fineUnpaid+' 元</b>。'):'');
    var pb=document.getElementById('bPaid');
    pb.style.display='block';
    pb.className=rec.paid?'paid':'';
    pb.textContent=rec.paid?('已交给'+PAYEE+' ✓  点击撤销'):('已交给'+PAYEE+' · 点此确认');
  }else{
    fb.className='fine ok';
    document.getElementById('fineAmt').textContent=act===0?'今天 0 支，不用罚':'今天没超标，不用罚';
    document.getElementById('fineR').textContent=fineTotal>0?('累计 '+fineTotal+' 元 · 待交 '+fineUnpaid+' 元'):'超标才有';
    document.getElementById('fineDesc').innerHTML=
      '规则：当天实际超过<b>原始计划</b>的支数，每超 1 支罚 100 元，钱交 '+PAYEE+'。<b>顺延只管任务目标，不管罚多少。</b>'+
      (tgt!==tBase?('（今天原始计划 '+tBase+' 支，任务目标已顺延到 '+tgt+' 支）'):'')+
      (fineTotal>0?('目前累计 <b>'+fineTotal+' 元</b>'+(fineUnpaid>0?('，<b>还有 '+fineUnpaid+' 元没交</b>'):'，已全部交清')+'。'):'');
    var pb2=document.getElementById('bPaid');
    if(fineUnpaid>0){
      
      pb2.style.display='block';pb2.className='';
      pb2.textContent='结清历史欠款 '+fineUnpaid+' 元 · 点此确认';
    }else{pb2.style.display='none';}
  }

  // 待交罚款提醒条（页面最显眼位置）
  var fineUnpaid=fineUnpaidTotal();
  var dt2=document.getElementById('dueTip');
  if(fineUnpaid>0){
    dt2.style.display='block';
    dt2.innerHTML='<b>还有 '+fineUnpaid+' 元罚款没交 '+PAYEE+'</b>（累计 '+fineTotal+' 元）。'+
      '超标不交，罚上加罚没用——钱要真到手才算数。翻到超标那天，在处罚单里点确认。';
  }else if(fineTotal>0){
    dt2.style.display='block';
    dt2.innerHTML='累计罚款 '+fineTotal+' 元，<b>已全部交清 '+PAYEE+'</b>，账清了。';
  }else{dt2.style.display='none';}

  document.getElementById('wkNm').textContent=WEEKS[wi].t;
  document.getElementById('wkBd').textContent='今日目标 '+tgt+' 支';
  document.getElementById('wkRt').textContent='第 '+(n+1)+' / '+TOTAL_DAYS+' 天';
  document.getElementById('wkGx').innerHTML=WEEKS[wi].g.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  var st=document.getElementById('wkSteps');st.innerHTML='';
  var STEP_LBL=['1–7 天','8–14 天','15–21 天','22–28 天','29–35 天','36–42 天','43–49 天','50–110 天'];
  WEEKS.forEach(function(wx,i){
    var d=document.createElement('div');
    d.className=i===wi?'on':'';
    d.innerHTML='<div class="dt">'+STEP_LBL[i]+'</div><div class="dot"></div><div class="nm">'+wx.t.split(' · ')[1]+'</div>';
    st.appendChild(d);
  });

  document.getElementById('sumNow').textContent=act;
  document.getElementById('sumTgt').textContent=tgt;

  var qc=document.getElementById('quick');qc.innerHTML='';
  for(var v=0;v<=BASE_CIG;v++){
    var b=document.createElement('button');
    b.className='mini'+(v===tgt?' on':'');
    b.textContent=v+(v===tgt?' 支(目标)':' 支');
    b.onclick=(function(val){return function(){setAll(val);};})(v);
    qc.appendChild(b);
  }

  var cc=document.getElementById('craveChips');cc.innerHTML='';
  CRAVE.forEach(function(x){
    var b=document.createElement('button');
    b.textContent=x[0]==='特别想'?'特别想（扛住了最加分）':x[0];
    b.className=draft.crave===x[1]?'on':(x[1]===3?'hot':'');
    b.onclick=function(){draft.crave=draft.crave===x[1]?0:x[1];render();};
    cc.appendChild(b);
  });
  var sc=document.getElementById('sceneChips');sc.innerHTML='';
  SCENES.forEach(function(x){
    var b=document.createElement('button');
    b.className='mini'+(draft.scene===x?' on':'');
    b.textContent=x;
    b.onclick=function(){draft.scene=draft.scene===x?'':x;render();};
    sc.appendChild(b);
  });

  
  var NOW=new Date();
  var nowMin=NOW.getHours()*60+NOW.getMinutes();
  
  var planList=[];
  SLOTS.forEach(function(s,i){
    var pl=+draft.plan[i]||0, av=+draft.act[i]||0;
    var mm=slotTimes(i,pl);
    planList.push({i:i,s:s,pl:pl,av:av,tm:s.tm,ts:mm,txs:mm.map(hstr)});
  });
  planList.sort(function(a,b){return hmin(a.tm)-hmin(b.tm);});
  var canList=planList.filter(function(x){return x.pl>0;});
  var canTotal=canList.reduce(function(a,b){return a+b.pl;},0);
  
  var dayTx=[];
  canList.forEach(function(x){x.txs.forEach(function(t){dayTx.push(t);});});
  
  document.getElementById('tlBd').textContent='目标 '+(n<0?BASE_CIG:tgt)+' 支 · '+canTotal+' 个钟点';
  document.getElementById('tlRt').textContent=n<0?'今天还在基线期':'已抽 '+act+' 支';
  var sumEl=document.getElementById('tlSum');
  if(n<0){
    
    sumEl.innerHTML='<b>今天还没开始戒烟（'+(-n)+' 天后开抽）</b>——照常抽，把基线量出来。'+
      '下面是<b>日常 '+BASE_CIG+' 支</b>按你作息铺出来的 '+dayTx.length+' 个钟点，用来对照你实际抽在哪儿：<br>'+
      '<b>'+dayTx.join(' · ')+'</b><br>'+
      '已记 <b class="cnt">'+act+'</b> 支'+
      (act===0?'，晚上把今天真实抽的补上，这就是你的起点。':'，明天开始就按这个起点往下减。');
  }else if(tgt<=0){
    sumEl.innerHTML='<b>今天目标 0 支</b>——任何钟点都不抽。<b class="cnt">已抽 '+act+' 支</b>，'+
      (act===0?'守住了，继续保持。':(isSolidify(n)?'破戒记下来就行，从下一支继续。':'清零阶段破戒，记下来，从下一支继续。'));
  }else{
    
    sumEl.innerHTML='今天 <b class="cnt">'+tgt+' 支</b>，按你的作息落在这 <b>'+canTotal+' 个钟点</b>：<br>'+
      '<b>'+dayTx.join(' · ')+'</b><br>'+
      '<b>每个钟点抽 1 支</b> —— 到点抽一支就行，<b>别在一个钟点连着抽两支</b>。<br>'+
      '已抽 <b class="cnt">'+act+'</b> 支'+
      (act>tBase?'，<b style="color:#b3261e">超原始计划 '+(act-tBase)+' 支（罚 '+(act-tBase)*FINE_PER+' 元）</b>'
        :(act<tgt?'，还剩 '+(tgt-act)+' 支':'，刚好 ✓'));
  }
  var lb=document.getElementById('tlList');lb.innerHTML='';
  planList.forEach(function(x){
    var slotLast=x.ts.length?x.ts[x.ts.length-1]:hmin(x.tm);
    var past=slotLast<nowMin;             
    var row=document.createElement('div');
    
    row.className='tlrow'+(past?' done':'');
    row.setAttribute('data-si',x.i);
    var stTxt, stCls='';
    if(n<0){
      
      stTxt=x.av>0?('已记 '+x.av+' 支'):'—';
      if(x.av>0)stCls='ok';
    }
    else if(x.pl===0){
      
      stTxt=x.av>0?('计划外 '+x.av+' 支'):'不抽';
      if(x.av>0)stCls='miss';
    }
    else if(x.av>=x.pl){stTxt='抽够 ✓';stCls='ok';}
    else if(x.av>0){stTxt='还差 '+(x.pl-x.av)+' 支';stCls='miss';}
    else {stTxt='还没抽';}
    
    var txHtml=x.txs.length
      ? (x.txs.length>1 ? x.txs[0]+'<i>'+x.txs.slice(1).join(' ')+'</i>' : x.txs[0])
      : x.tm;
    row.innerHTML='<div class="time">'+txHtml+'</div>'+
      '<div class="dot"></div>'+
      '<div class="txt">'+(x.s.night?'🌙 ':'')+x.s.nm+
        (x.s.anchor?' <span class="ord o5">最后才动</span>':(x.s.ease<=2?' <span class="ord o1">第 '+x.s.ease+' 个砍</span>':''))+'</div>'+
      '<div class="plan '+(x.pl>0?'on':'off')+'">'+(x.pl>0?(x.pl+' 支'):(n<0?'基线':'不抽'))+'</div>'+
      '<button class="st '+stCls+'" data-st="'+x.i+'">'+(stTxt||'还没抽')+'</button>'+
      '<div class="qplus" data-q="'+x.i+'">+1</div>';
    
    function bump(delta){
      var cur=+draft.act[x.i]||0;
      var v=Math.max(0,cur+delta);
      draft.act[x.i]=v;
      if(v>0){draft.crave=Math.max(draft.crave,3);draft.held=Math.max(0,(draft.held||0)-1);}
      else {draft.held=(draft.held||0)+1;}
      
      var recTx=x.txs.length?x.txs[Math.min(Math.max(v-1,0),x.txs.length-1)]:x.tm;
      saveNow(recTx+' '+(v>0?'记 '+v+' 支':'清零'));
      if(v>0&&delta>0)askAfterSmoke(recTx);   
    }
    row.onclick=function(e){
      if(e.target&&e.target.getAttribute&&e.target.getAttribute('data-st')!==null)return; 
      bump(1);
    };
    var qp=row.querySelector('.qplus');
    qp.onclick=function(e){e.stopPropagation();bump(1);};
    var sb=row.querySelector('[data-st]');
    sb.onclick=function(e){e.stopPropagation();bump(-(+draft.act[x.i]||0));};
    lb.appendChild(row);
  });
  
  var dots=lb.querySelectorAll('.dot');
  if(dots.length>1&&lb.offsetHeight){
    var d0=dots[0].getBoundingClientRect(), d1=dots[dots.length-1].getBoundingClientRect();
    var lr=lb.getBoundingClientRect();
    var seg=document.createElement('div');
    seg.className='seg';
    seg.style.left=(d0.left+d0.width/2-lr.left)+'px';
    seg.style.top=(d0.top+d0.height/2-lr.top)+'px';
    seg.style.height=((d1.top+d1.height/2)-(d0.top+d0.height/2))+'px';
    seg.style.bottom='auto';
    lb.insertBefore(seg,lb.firstChild);
  }
  
  var alarmEl=document.getElementById('tlAlarm');
  function setAlarm(html,kind){
    alarmEl.style.display='block';
    alarmEl.style.background=kind==='bad'?'#fdecec':'#fdf3dd';
    alarmEl.style.borderColor=kind==='bad'?'#f0c4c0':'#f0dcae';
    alarmEl.style.color=kind==='bad'?'#8c1d18':'#7a5c10';
    alarmEl.innerHTML=html;
  }
  alarmEl.style.display='none';
  if(n>=0&&tgt>0){
    
    var occ=[];
    canList.forEach(function(x){
      x.ts.forEach(function(m,k){
        occ.push({m:m,tx:hstr(m),k:k,si:x.i,s:x.s,av:x.av});
      });
    });
    occ.sort(function(a,b){return a.m-b.m;});
    var missed=occ.filter(function(o){return o.m<=nowMin&&o.av<o.k+1;});
    var lastM=missed.length?missed[missed.length-1]:null;
    var upNext=occ.filter(function(o){return o.m>nowMin&&o.av<o.k+1;})[0];
    if(lastM&&nowMin-lastM.m<=90){
      setAlarm('<b>到点了 · '+lastM.tx+' 该抽 1 支</b>（'+lastM.s.nm+'），'+
        '现在已过 '+(nowMin-lastM.m)+' 分钟，还没记。'+
        
        (missed.length>1?'今天 <b>'+missed.length+' 个钟点</b>已到点还没记（最早 '+missed[0].tx+'）。':'')+
        (lastM.s.night?'晚上这支最难扛，扛住了就在下面点「扛住了」。':'先记上，别漏。'));
    }
    if(!alarmEl.style.display||alarmEl.style.display==='none'){
      if(upNext&&upNext.m-nowMin<=30){
        setAlarm('<b>快到点了 · '+upNext.tx+' 该抽 1 支</b>（'+upNext.s.nm+'），'+
          '还有 '+Math.max(0,upNext.m-nowMin)+' 分钟。'+
          (upNext.s.night?'这格是夜间高危段，先把替代动作准备好。':'提前想好抽完这口干什么，别停下来。'));
      }
    }
    
    var markIdx=lastM?lastM.si:(upNext?upNext.si:-1);
    if(markIdx>=0){
      var rows=lb.querySelectorAll('.tlrow');
      for(var q=0;q<rows.length;q++){
        if(+rows[q].getAttribute('data-si')===markIdx)rows[q].className+=' cur';
      }
    }
  }
  if(alarmEl.style.display==='none'&&act>tBase){
    setAlarm('今天已超<b>原始计划 '+tBase+' 支</b> <b>'+(act-tBase)+' 支</b>，罚款 '+(act-tBase)*FINE_PER+' 元。上面标「计划外」的钟点就是多出来的，看哪个最容易砍。','bad');
  }

  // 10 个时点：夜间三格单独渲染在「夜间高危段」，这里只画白天 7 格
  var box=document.getElementById('slots');box.innerHTML='';
  SLOTS.forEach(function(s,i){
    if(s.night)return;
    var pl=+draft.plan[i]||0, av=+draft.act[i]||0;
    var mm=slotTimes(i,pl).map(hstr);   
    var card=document.createElement('div');
    card.className='slot'+(pl===0?' off':'')+(s.anchor?' anchor':'');
    
    var ordTag=s.ease<=2
      ? '<span class="ord o1">第 '+s.ease+' 个砍</span>'
      : (s.ease>=5?'<span class="ord o5">最后才动</span>':'');
    card.innerHTML='<div class="hd"><div class="no">'+(i+1)+'</div>'+
      '<div><div class="tm">'+(mm.length?mm.join(' · '):s.tm)+'</div><div class="nm">'+s.nm+'</div></div>'+
      '<div class="tg'+(pl>0?' on':'')+'">'+(pl>0?(pl+' 个钟点'):'不抽')+'</div></div>'+
      '<div class="why">'+ordTag+'<span class="wx">'+s.why+'</span></div>'+
      '<div class="bd"><div class="tg3">'+
      '<button data-v="0" class="'+(av===0?'z':'')+'">没抽</button>'+
      '<button data-v="1" class="'+(av===1?'y':'')+'">抽 1 支</button>'+
      '<button data-v="2" class="'+(av===2?'y':'')+'">2 支</button>'+
      '<button data-v="3" class="'+(av>=3?'y':'')+'">3 支</button>'+
      '</div></div>';
    box.appendChild(card);
    card.querySelectorAll('[data-v]').forEach(function(b){
      b.onclick=function(){
        var v=+b.getAttribute('data-v');
        draft.act[i]=v;
        if(v>0){draft.crave=Math.max(draft.crave,2);}
        saveNow(s.tm+' '+(v>0?('记 '+v+' 支'):'记 0 支'));
      };
    });
  });

  // 夜间应急包
  var kl=document.getElementById('kitList');kl.innerHTML='';
  NIGHTKIT.forEach(function(x){
    var on=!!draft.kit[x.k];
    var r=document.createElement('div');
    r.className='kit'+(on?' on':'');
    r.innerHTML='<div class="tk">✓</div><div class="tx"><div class="a">'+x.a+'</div><div class="b">'+x.b+'</div></div>';
    r.onclick=function(){draft.kit[x.k]=!draft.kit[x.k];render();};
    kl.appendChild(r);
  });
  // 累计扛住次数（已在 render 顶部算好）
  document.getElementById('nightHeld').textContent='今日 '+draft.held+' 次 · 累计 '+totalHeld+' 次';

  // 夜间三格
  var ns=document.getElementById('nightSlots');ns.innerHTML='';
  SLOTS.forEach(function(s,i){
    if(!s.night)return;
    var pl=+draft.plan[i]||0, av=+draft.act[i]||0;
    var mm=slotTimes(i,pl).map(hstr);
    var d=document.createElement('div');
    d.className='nslot'+(s.anchor?' anchor':'');
    var ordTag=s.anchor?'<span class="ord o5">最后才动</span>':'<span class="ord o4">较难砍</span>';
    d.innerHTML='<div class="nm">'+(mm.length?mm.join(' · '):s.tm)+' · '+s.nm+'　<span class="tg'+(pl>0?' on':'')+'" style="font-size:11px;padding:2px 8px;border-radius:999px;background:#f6ecd2;color:#8a6410">'+(pl>0?(pl+' 个钟点'):'不抽')+'</span>'+ordTag+'</div>'+
      '<div class="wy2">'+s.why+'</div>'+
      '<div class="x">'+s.x+'</div>'+
      '<div class="tg3">'+
      '<button data-v="0" class="'+(av===0?'z':'')+'">扛住了</button>'+
      '<button data-v="1" class="'+(av===1?'y':'')+'">抽 1 支</button>'+
      '<button data-v="2" class="'+(av>=2?'y':'')+'">2 支</button>'+
      '</div>';
    ns.appendChild(d);
    d.querySelectorAll('[data-v]').forEach(function(b){
      b.onclick=function(){
        var v=+b.getAttribute('data-v');
        draft.act[i]=v;
        if(v>0){draft.crave=3;draft.held=Math.max(0,draft.held-1);}
        else {draft.held=draft.held+1;}
        saveNow(s.tm+' '+(v>0?('记 '+v+' 支'):'记 0 支'));
      };
    });
  });

  // 运动
  var isSat=(new Date().getDay()===6);
  var list=EXERCISE.filter(function(x){return x.goal!=='sat'||isSat;});
  document.getElementById('exBd').textContent=exToday+' / '+list.length+' 完成';
  document.getElementById('exRt').textContent='目标每周 ≥5 天';
  var el=document.getElementById('exList');el.innerHTML='';
  list.forEach(function(x){
    var on=!!draft.ex[x.k];
    var r=document.createElement('div');
    r.className='eitem'+(on?' done':'');
    r.innerHTML='<div class="tk">✓</div><div class="tx"><div class="a">'+x.a+'</div>'+
      '<div class="b">'+x.tm+' · '+x.b+'</div></div>';
    r.onclick=function(){draft.ex[x.k]=!draft.ex[x.k];render();};
    el.appendChild(r);
  });

  // 历史
  var hb=document.getElementById('hist');hb.innerHTML='';
  var recent=keys.slice(-30).reverse();
  if(!recent.length){hb.innerHTML='<div class="empty">还没有记录。填完上面点「保存今天」</div>';}
  recent.forEach(function(k){
    var r=D[k],c=0;
    SLOTS.forEach(function(s,i){c+=(+((r.act||{})[i])||0);});
    var tn=day(k)-day(C.quit),tg=target(tn);
    var pips='';SLOTS.forEach(function(s,i){pips+=(+((r.act||{})[i])||0)?'●':'○';});
    var e=r.ex||{},ec=0;
    EXERCISE.forEach(function(x){if(e[x.k])ec++;});
    var sat=(new Date(k+'T00:00:00').getDay()===6)?5:4;
    var row=document.createElement('div');
    row.className='hrow';
    var held=+r.held||0;
    var finRow=fineOf(r,c,tn);
    row.innerHTML='<div class="dt">'+k.slice(5)+'</div>'+
      '<div class="tg2">'+pips+' <b>'+c+'</b>/'+tg+'</div>'+
      '<div class="ok '+(c<=tg?'g':'r')+'">'+(c===0?'0支':(c<=tg?'达标':'超 '+Math.max(0,c-tg)))+'</div>'+
      (finRow?('<div class="ok '+(r.paid?'g':'r')+'" style="width:66px">'+(r.paid?((r.paidShot?'✓留证交':'✓已交')):'罚'+finRow+'元')+'</div>'):'')+
      '<div class="ok '+(ec>=Math.min(3,sat)?'g':'')+'" style="width:44px">动 '+ec+'/'+sat+'</div>'+
      (held?('<div class="ok g" style="width:40px">扛'+held+'</div>'):'');
    hb.appendChild(row);
  });

  document.getElementById('note').value=D[T]?D[T].note:'';
}
function setAll(v){
  var p=distribute(v);
  SLOTS.forEach(function(s,i){draft.act[i]=p[i]||0;});
  render();
}

function saveNow(msg){
  var a=actTotal();
  var tn=day(T)-day(cfg().quit);
  var fin=penaltyFor(tn<0?0:targetBase(tn),a);
  D[T]={act:draft.act,plan:draft.plan,cigs:a,crave:draft.crave,scene:draft.scene,
    ex:draft.ex,kit:draft.kit,held:draft.held,paid:!!(D[T]&&D[T].paid),fine:fin,
    note:(document.getElementById('note')||{}).value||''};
  wr(KEY,D);
  render();
  var m=document.getElementById('msg');
  if(m)m.textContent='✓ 已自动存 '+T.slice(5)+'：今天 '+a+' 支'+(msg?('（'+msg+'）'):'');
}


var ASKQ=[
  {q:'这一支渴求多强？',opts:[['不太想抽',1],['有点想',2],['非常想',3]]},
  {q:'因为什么想抽？',opts:[['饭后',1],['酒局应酬',2],['和同事一起',3],['压力',4],['无聊',5]]}
];
var askStep=0;
function askAfterSmoke(tm){
  askStep=0;
  var box=document.getElementById('askBox');
  if(!box)return;
  box.style.display='block';
  box.innerHTML='<div class="at">'+tm+' · '+ASKQ[0].q+'</div><div class="ach" id="ach0"></div>';
  var c0=document.getElementById('ach0');
  ASKQ[0].opts.forEach(function(o){
    var b=document.createElement('button');
    b.textContent=o[0];
    b.onclick=function(){
      draft.crave=Math.max(draft.crave,o[1]);
      c0.innerHTML='<div class="at" style="margin-top:9px">'+ASKQ[1].q+'</div><div class="ach" id="ach1"></div>';
      var c1=document.getElementById('ach1');
      ASKQ[1].opts.forEach(function(p){
        var bb=document.createElement('button');
        bb.textContent=p[0];
        bb.onclick=function(){
          draft.scene=p[0];
          saveNow(tm+' · 渴求'+o[1]+'/3 · '+p[0]);
          box.style.display='none';
        };
        c1.appendChild(bb);
      });
      var sk=document.createElement('button');
      sk.className='skip';sk.textContent='不记了';
      sk.onclick=function(){box.style.display='none';};
      c1.appendChild(sk);
    };
    c0.appendChild(b);
  });
  var sk0=document.createElement('button');
  sk0.className='skip';sk0.textContent='不记了';
  sk0.onclick=function(){box.style.display='none';};
  c0.appendChild(sk0);
}


function tgt4pack(tn){return tn<0?BASE_CIG:targetBase(tn);}

document.getElementById('packCalc').onclick=function(){
  var L=+document.getElementById('packLeft').value;
  var S0=+document.getElementById('packStart').value;
  var out=document.getElementById('packOut');
  if(!(S0>0)||L<0){out.innerHTML='<b style="color:#b3261e">把「开包时满的几支」和「睡前剩几支」都填上（两个都要 ≥0）。</b>';return;}
  if(L>S0){out.innerHTML='<b style="color:#b3261e">剩的比满的多？多半是中途又开了新包——请把「开包时满的几支」按新包重新填。</b>';return;}
  var box=S0-L, a=actTotal(), tn=day(T)-day(cfg().quit);
  var plan=tgt4pack(tn);
  var dif=box-a;
  var msg;
  if(box===0&&a===0)msg='两栏都是 0，今天确实一支没抽。';
  else if(dif>0)msg='<b style="color:#8c1d18">烟盒说你抽了 '+box+' 支，你只记了 '+a+' 支 —— 少记 '+dif+' 支。</b>';
  else if(dif<0)msg='你记了 '+a+' 支，比烟盒算的 '+box+' 支还多 '+(0-dif)+' 支（可能中途开过新包、或烟盒没数准）。';
  else msg='<b style="color:var(--green-d)">烟盒 '+box+' 支 = 记录 '+a+' 支，对得上。</b>';
  out.innerHTML='烟盒算出的真实消耗：<b>'+box+' 支</b>（'+(S0)+' − '+(L)+'）　·　你记的：<b>'+a+' 支</b>'+
    (plan>=0?('　·　今天计划 '+plan+' 支'):'')+'<br>'+msg+
    (plan>=0&&box>plan?('<br>🔴 按烟盒算超了 '+(box-plan)+' 支，罚款 <b>'+penaltyFor(targetBase(tn),box)+' 元</b>（以烟盒为准，别为了少罚少记）。'):'');
};
document.querySelectorAll('.jg .opts>button').forEach(function(b){
  b.onclick=(function(s){return function(){
    
    var n2=day(T)-day(cfg().quit), tb=n2<0?0:targetBase(n2);
    if(s==='zero') setAll(0);
    else if(s==='ok')  setAll(tb);        // 正好填到原始计划
    else               setAll(tb+1);      // 超标一档（可再逐格调）
    var m=s==='zero'?'记下了：今天 0 支。'
        :s==='ok' ?'记下了：按原始计划 '+tb+' 支填好了。'
                  :'记下了：按原始计划 +1 支填成超标（罚 100 元），下面可以逐格调。';
    document.getElementById('msg').textContent=m;
  };})(b.getAttribute('data-s'));
});
document.getElementById('bHeld').onclick=function(){
  draft.held=(draft.held||0)+1;
  render();
  document.getElementById('msg').textContent='记下了，今天已扛住 '+draft.held+' 次';
};
document.getElementById('bSave').onclick=function(){
  var a=actTotal(),ex=Object.keys(draft.ex).filter(function(x){return draft.ex[x];}).length;
  var kitN=Object.keys(draft.kit).filter(function(x){return draft.kit[x];}).length;
  var tn=day(T)-day(cfg().quit);
  
  var fin=penaltyFor(tn<0?0:targetBase(tn),a);   
  D[T]={act:draft.act,plan:draft.plan,cigs:a,crave:draft.crave,scene:draft.scene,
    ex:draft.ex,kit:draft.kit,held:draft.held,paid:!!(D[T]&&D[T].paid),fine:fin,
    note:document.getElementById('note').value};
  wr(KEY,D);
  var tg=tn<0?0:targetBase(tn);
  var vd2=a===0?'今天 0 支，完全截断':(tg===0?('抽了 '+a+' 支，破戒记下了'):(a<=tg?('抽 '+a+'/'+tg+' 支，在目标内'):('抽 '+a+'/'+tg+' 支，超标 '+(a-tg)+' 支')));
  document.getElementById('msg').textContent=
    '已存 '+T.slice(5)+'：'+vd2+'，运动 '+ex+' 项，扛住 '+draft.held+' 次'+(kitN?'，应急包 '+kitN+'/5':'')+
    (fin>0?('，罚款 '+fin+' 元待交 '+PAYEE):'');
  render();
};


function fineUnpaidTotal(){
  var C=cfg(), q=day(C.quit), sum=0;
  Object.keys(D).forEach(function(k){
    var tn=day(k)-q; if(tn<0)return;
    var r=D[k],c=0;SLOTS.forEach(function(s,i){c+=(+((r.act||{})[i])||0);});
    var f=fineOf(r,c,tn);
    if(f>0&&!r.paid)sum+=f;
  });
  return sum;
}
var VCODE='', VSHOT='', VCAM=null, VSETTLE=false;

function openVfy(settle){
  var C=cfg(), n=day(T)-day(C.quit);
  VSETTLE=!!settle;
  var amt=settle?fineUnpaidTotal():fineOf(D[T],+D[T].cigs||0,n);
  VCODE=String(Math.floor(1000+Math.random()*9000));   
  VSHOT='';VCAM=null;
  document.getElementById('vAmt').textContent=
    (settle?'累计待交罚款':(D[T].paid?'已确认交款，可撤销':'本次待确认罚款'))+'：'+amt+' 元（收款人 '+PAYEE+'）';
  document.getElementById('vCode').textContent=VCODE;
  document.getElementById('vIn').value='';
  document.getElementById('vSt').textContent='口令由 '+PAYEE+' 念出并输入，或点「拍一张」让监督人对着摄像头留证。';
  document.getElementById('vSt').className='vst';
  document.getElementById('vOk').disabled=true;
  document.getElementById('vCam').style.display='none';
  document.getElementById('vShot').style.display='none';
  document.getElementById('vShot').src='';
  document.getElementById('vShotBtn').style.display='none';
  document.getElementById('vfy').className='vfy on';
}
function closeVfy(){
  document.getElementById('vfy').className='vfy';
  if(VCAM){VCAM.getTracks().forEach(function(t){t.stop();});VCAM=null;}
}
function vfyReady(){ return VSHOT || (document.getElementById('vIn').value===VCODE); }
document.getElementById('vIn').oninput=function(){
  var ok=(this.value===VCODE);
  document.getElementById('vOk').disabled=!ok;
  if(this.value.length===4){
    document.getElementById('vSt').textContent=ok
      ? '口令核对通过 ✓ 点下面按钮完成确认。'
      : '口令不对。必须是 '+PAYEE+' 当面念出的 4 位码，别自己乱填。';
    document.getElementById('vSt').className='vst '+(ok?'good':'bad');
  }
};
document.getElementById('vCamBtn').onclick=function(){
  var self=this;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    self.textContent='摄像头不可用';
    document.getElementById('vSt').textContent='这个打开方式不支持摄像头（用 file:// 直接打开时浏览器会禁）。改用口令核验，照样能确认。';
    document.getElementById('vSt').className='vst bad';
    return;
  }
  navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false})
  .then(function(st){
    VCAM=st;
    var v=document.getElementById('vCam');
    v.srcObject=st;v.style.display='block';v.play();
    self.textContent='摄像头已开';
    document.getElementById('vShotBtn').style.display='block';
    document.getElementById('vSt').textContent='请把手机递给 '+PAYEE+'，让监督人对着摄像头点「拍一张」。';
  })
  .catch(function(e){
    self.textContent='摄像头不可用';
    document.getElementById('vSt').textContent='打不开摄像头（'+((e&&e.name)||'错误')+'）。改用口令核验，功能不受影响。';
    document.getElementById('vSt').className='vst bad';
  });
};
document.getElementById('vShotBtn').onclick=function(){
  var v=document.getElementById('vCam');
  if(!v.videoWidth){document.getElementById('vSt').textContent='摄像头还没打开。';return;}
  var cv=document.createElement('canvas');
  var w=480, h=Math.round(480*v.videoHeight/v.videoWidth);
  cv.width=w;cv.height=h;
  cv.getContext('2d').drawImage(v,0,0,w,h);
  try{ VSHOT=cv.toDataURL('image/jpeg',0.5); }   
  catch(e){ VSHOT=''; }
  var im=document.getElementById('vShot');
  im.src=VSHOT;im.style.display='block';v.style.display='none';
  document.getElementById('vOk').disabled=false;
  document.getElementById('vSt').textContent='已留证 ✓ 请确认照片里是 '+PAYEE+' 本人，再点下面按钮。';
  document.getElementById('vSt').className='vst good';
};
document.getElementById('vOk').onclick=async function(){
  this.disabled=true;
  if(VSHOT && VSHOT.startsWith('data:')) { try { VSHOT=await window.quitStore.savePhoto(VSHOT); } catch(e) { document.getElementById('vSt').textContent='照片上传结果未确认，请重新打开后检查。'; document.getElementById('vOk').disabled=true; return; } }
  var C=cfg(), n=day(T)-day(C.quit);
  var ts=fmt(new Date())+' '+new Date().toTimeString().slice(0,5);
  if(VSETTLE){
    
    var cnt=0;
    Object.keys(D).forEach(function(k){
      var tn=day(k)-day(C.quit); if(tn<0)return;
      var r=D[k],c=0;SLOTS.forEach(function(s,i){c+=(+((r.act||{})[i])||0);});
      var f=fineOf(r,c,tn);
      if(f>0&&!r.paid){r.paid=true;r.paidAt=ts;r.paidBy=PAYEE;r.paidCode=VCODE;if(VSHOT)r.paidShot=VSHOT;cnt++;}
    });
    wr(KEY,D);closeVfy();
    document.getElementById('msg').textContent='已确认：累计罚款已交 '+PAYEE+'，共结清 '+cnt+' 天（'+(VSHOT?'有照片留证':'口令核验')+'）';
    render();return;
  }
  if(!D[T]){closeVfy();document.getElementById('msg').textContent='今天还没保存，先点「保存今天」';return;}
  D[T].paid=true;
  D[T].paidAt=ts;
  D[T].paidBy=PAYEE;
  if(VSHOT)D[T].paidShot=VSHOT;
  D[T].paidCode=VCODE;
  wr(KEY,D);
  closeVfy();
  document.getElementById('msg').textContent='已确认：罚款已交 '+PAYEE+'（'+(VSHOT?'有照片留证':'口令核验')+'）';
  render();
};
document.getElementById('vCancel').onclick=closeVfy;
document.getElementById('bPaid').onclick=function(){
  
  var nn=day(T)-day(cfg().quit);
  var tFine=nn<0?0:penaltyFor(target(nn), actTotal());
  if(!(D[T]&&D[T].paid)&&tFine<=0){openVfy(true);return;}  
  if(!D[T]){document.getElementById('msg').textContent='请先点「保存今天」，再确认交款';return;}
  if(D[T].paid){
    
    D[T].paid=false;D[T].paidShot='';wr(KEY,D);
    document.getElementById('msg').textContent='已撤销交款标记';
    render();return;
  }
  openVfy(false);
};
document.getElementById('bUndo').onclick=function(){
  delete D[T];wr(KEY,D);loadDraft();
  document.getElementById('msg').textContent='已清掉今天的记录，可以重填';
  render();
};
document.getElementById('bCfg').onclick=function(){
  var c=cfg();
  var msg='戒烟起始日：'+c.quit+
    '\n日常量：'+c.base+' 支/天'+
    '\n目标模式：'+(c.auto?'顺延（昨天超标，今天自动补）':'固定（严格按曲线，不补）')+
    '\n\n输入新起始日（格式 2026-10-20），直接回车保持不变：';
  var q=prompt(msg,c.quit);
  if(q!==null){
    q=q.trim();
    if(q){
      if(!/^\d{4}-\d{2}-\d{2}$/.test(q)){alert('日期格式不对，请用 2026-10-20 这种写法');return;}
      c.quit=q;
    }
  }
  var a=prompt('目标模式：输入 1 = 顺延（昨天超标今天自动补），输入 0 = 固定（严格按曲线）',
    c.auto?'1':'0');
  if(a!==null){
    a=a.trim();
    if(a==='1'||a==='0') c.auto=(a==='1');
  }
  wr(KEYC,c);loadDraft();render();
  document.getElementById('msg').textContent='已保存 · 起始日 '+c.quit+' · '+(c.auto?'顺延模式':'固定模式');
};
document.getElementById('note').onchange=function(){
  D[T]=D[T]||{act:{},ex:{}};D[T].note=this.value;wr(KEY,D);
};
loadDraft();
render();
