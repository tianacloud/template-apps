const link=document.createElement("link"); link.rel="stylesheet"; link.href=new URL("./wb1024-c556-ab1432e6.css", import.meta.url).href; document.head.appendChild(link);
import "./style.css";
document.body.innerHTML = "\n<div class=\"wrap\">\n  <header>\n    <div class=\"logo\" id=\"logo\">\n      <span class=\"fish\">🐟</span>\n      <h1>摸鱼办 <small>MOYU BUREAU</small><span class=\"badge-official\">编制内</span></h1>\n    </div>\n    <div class=\"clock\">\n      <div class=\"time\" id=\"clock\">--:--:--</div>\n      <div class=\"date\" id=\"date\"></div>\n    </div>\n  </header>\n\n  <div class=\"grid\">\n    <!-- 下班倒计时 -->\n    <div class=\"card c6 offwork\">\n      <h3>⏰ 距离下班 <span class=\"tag\">朝九晚六版</span></h3>\n      <div class=\"big\" id=\"offwork\">--<small> 时 -- 分 -- 秒</small></div>\n      <div class=\"bar\"><i id=\"daybar\" style=\"width:0%\"></i></div>\n      <div class=\"bar-meta\"><span>上班 09:00</span><span id=\"daypct\">今日工作进度 0%</span><span>下班 18:00</span></div>\n    </div>\n\n    <!-- 带薪摸鱼收入 -->\n    <div class=\"card c6 money\">\n      <h3>💰 带薪摸鱼收入 <span class=\"tag\">实时到账</span></h3>\n      <div class=\"num\" id=\"earned\">¥0.00<small> · 今日已赚</small></div>\n      <div class=\"row\">\n        <input type=\"number\" id=\"salary\" placeholder=\"月薪多少？填这里\" min=\"0\">\n        <input type=\"number\" id=\"workdays\" placeholder=\"每月上班天数\" value=\"22\" min=\"1\">\n      </div>\n      <div class=\"tip\" id=\"moneytip\">填上月薪，看看发呆、喝水、上厕所各值多少钱。</div>\n    </div>\n\n    <!-- 摸鱼计时器 -->\n    <div class=\"card c6 timer\">\n      <h3>🎣 摸鱼修行计时 <span class=\"tag\">点击开始</span></h3>\n      <div class=\"num\" id=\"fishclock\">00:00:00</div>\n      <div class=\"rank\" id=\"rank\">🐟 见习鱼苗</div>\n      <div class=\"rankbar\"><i id=\"rankbar\" style=\"width:0%\"></i></div>\n      <button class=\"btn btn-start\" id=\"fishbtn\">开始摸鱼</button>\n    </div>\n\n    <!-- 节假日倒计时 -->\n    <div class=\"card c6\">\n      <h3>🎉 放假倒计时 <span class=\"tag\">法定精神慰藉</span></h3>\n      <div class=\"hol-list\" id=\"hollist\"></div>\n    </div>\n\n    <!-- 今日宜忌 -->\n    <div class=\"card c12 almanac\">\n      <h3>📜 摸鱼老黄历 <span class=\"tag\" id=\"almanac-date\"></span></h3>\n      <div class=\"yiji\">\n        <div class=\"yj yi\"><h4>✅ 宜</h4><p id=\"yi\"></p></div>\n        <div class=\"yj ji\"><h4>🚫 忌</h4><p id=\"ji\"></p></div>\n      </div>\n    </div>\n\n    <!-- 语录 -->\n    <div class=\"card c8 quote\">\n      <h3>💬 摸鱼语录 <span class=\"tag\">每日精神食粮</span></h3>\n      <blockquote id=\"quote\">「上班就是拿命换钱，摸鱼才是拿回自己。」</blockquote>\n      <div class=\"from\" id=\"quote-from\">—— 佚名摸鱼学家</div>\n      <button class=\"btn btn-q\" id=\"quotebtn\">🎲 换一句</button>\n    </div>\n\n    <!-- 守则 -->\n    <div class=\"card c4 rules\">\n      <h3>📌 摸鱼三定律</h3>\n      <ol>\n        <li><b>宁摸十分钟，不赶三班倒</b></li>\n        <li><b>屏幕要比脸忙</b>，Alt+Tab 要比心跳快</li>\n        <li><b>工资是老板给的</b>，摸鱼是自己挣的</li>\n      </ol>\n    </div>\n  </div>\n\n  <footer>\n    <div class=\"fish\">🐟</div>\n    摸鱼办 · 非官方网站 · 本站不生产快乐，只是快乐的搬运工<br>\n    温馨提示：摸鱼一时爽，绩效考核火葬场 —— 适度摸鱼，保住饭碗\n  </footer>\n</div>\n\n<button class=\"boss-btn\" id=\"bossbtn\"><kbd>Esc</kbd>老板键</button>\n\n<!-- 伪装层：假文档 -->\n<div class=\"disguise\" id=\"disguise\">\n  <div class=\"fake-doc\">\n    <h2>2026年第四季度重点项目进度汇报</h2>\n    <div class=\"sub\">部门：战略发展部 &nbsp;|&nbsp; 汇报人：（你的名字） &nbsp;|&nbsp; 密级：内部资料</div>\n    <h4>一、总体进展</h4>\n    <p>本季度各项重点工作总体推进平稳有序，核心指标完成情况符合预期。团队围绕年度战略目标，持续深化业务协同，强化过程管控，确保各条线任务按里程碑节点高质量交付。</p>\n    <p>截至本汇报日，重点项目累计完成率达 87.4%，较上季度提升 6.2 个百分点，风险项均已建立台账并落实责任人闭环管理。</p>\n    <h4>二、关键数据</h4>\n    <table>\n      <tr><th>指标</th><th>目标值</th><th>实际值</th><th>完成率</th></tr>\n      <tr><td>核心业务交付</td><td>100%</td><td>96.5%</td><td>96.5%</td></tr>\n      <tr><td>客户满意度</td><td>92分</td><td>94.1分</td><td>102.3%</td></tr>\n      <tr><td>流程优化项</td><td>12项</td><td>13项</td><td>108.3%</td></tr>\n      <tr><td>成本管控</td><td>降本5%</td><td>降本5.8%</td><td>116%</td></tr>\n    </table>\n    <h4>三、下阶段计划</h4>\n    <p>下阶段将进一步压实责任、聚焦重点，围绕交付质量与效率提升双主线，完善跨部门协作机制，推动关键成果落地见效，为全年目标达成奠定坚实基础。</p>\n    <h4>四、风险与建议</h4>\n    <p>当前整体风险可控。建议继续加大资源倾斜力度，优化排期颗粒度，强化复盘机制，形成\"目标—执行—反馈\"的完整闭环。</p>\n  </div>\n  <div class=\"fake-hint\">（按 Esc 或点击右下角按钮返回摸鱼现场 —— 别让任何人看到你按了它）</div>\n</div>\n\n<div class=\"toast\" id=\"toast\"></div>\n\n";

(function(){
  "use strict";
  var $=function(id){return document.getElementById(id)};
  // ---------- 时钟 ----------
  var WEEK=["日","一","二","三","四","五","六"];
  function two(n){return n<10?"0"+n:""+n}
  function tick(){
    var d=new Date();
    $("clock").textContent=two(d.getHours())+":"+two(d.getMinutes())+":"+two(d.getSeconds());
    $("date").textContent=d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日 星期"+WEEK[d.getDay()];
  }
  tick(); setInterval(tick,1000);

  // ---------- 下班倒计时 & 今日进度 ----------
  function offwork(){
    var now=new Date(), h=now.getHours()+now.getMinutes()/60+now.getSeconds()/3600;
    var start=9, end=18, pct, left;
    if(h<start){pct=0;left=(end-h)*3600;}
    else if(h>end){pct=100;left=0;}
    else {pct=(h-start)/(end-start)*100;left=(end-h)*3600;}
    var hh=Math.floor(left/3600), mm=Math.floor(left%3600/60), ss=Math.floor(left%60);
    $("offwork").innerHTML=(pct>=100?"下班了！快跑！":two(hh)+" 时 "+two(mm)+" 分 "+two(ss)+" 秒")+"<small> 后下班</small>";
    $("daybar").style.width=pct+"%";
    $("daypct").textContent="今日工作进度 "+pct.toFixed(1)+"%";
  }
  offwork(); setInterval(offwork,1000);

  // ---------- 工资 ----------
  var salaryKey="moyu_salary", daysKey="moyu_workdays";
  $("salary").value=localStorage.getItem(salaryKey)||"";
  $("workdays").value=localStorage.getItem(daysKey)||"22";
  function perMinute(){
    var s=parseFloat($("salary").value)||0;
    var d=parseFloat($("workdays").value)||22;
    return s>0&&d>0? s/d/(8*60) : 0;
  }
  ["salary","workdays"].forEach(function(id){
    $(id).addEventListener("input",function(){
      localStorage.setItem(id==="salary"?salaryKey:daysKey,$(id).value);
      moneyTip();
    });
  });
  function moneyTip(){
    var pm=perMinute();
    if(pm<=0){$("moneytip").textContent="填上月薪，看看发呆、喝水、上厕所各值多少钱。";return;}
    var wk=pm*25, day=pm*8*60;
    $("moneytip").innerHTML="摸鱼 1 分钟 = 白赚 <b>¥"+pm.toFixed(3)+"</b>；带薪拉屎 25 分钟 = <b>¥"+wk.toFixed(2)+"</b>；摸满一天 = <b>¥"+day.toFixed(2)+"</b> 入账。";
  }
  function earn(){
    var pm=perMinute();
    if(pm>0){
      var now=new Date(), h=now.getHours()+now.getMinutes()/60+now.getSeconds()/3600;
      var worked=Math.max(0,Math.min(h,18)-9)*60;
      if(h<9) worked=0;
      $("earned").innerHTML="¥"+(worked*pm).toFixed(2)+"<small> · 今日已赚</small>";
    }else{
      $("earned").innerHTML="¥0.00<small> · 今日已赚</small>";
    }
  }
  moneyTip(); earn(); setInterval(earn,1000);

  // ---------- 摸鱼计时 ----------
  var running=false, acc=0, last=null;
  var KEY="moyu_timer_"+new Date().toDateString();
  acc=parseFloat(localStorage.getItem(KEY))||0;
  var RANKS=[
    [0,"🐟 见习鱼苗"],[60,"🥬 入门咸鱼"],[300,"🐸 摸鱼学徒"],[900,"🎯 摸鱼达人"],
    [1800,"🦈 摸鱼大师"],    [3600,"🐉 带薪摸鱼宗师"],[7200,"🧙 摸鱼仙人·编制内"]
  ];
  function fmt(s){var h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=Math.floor(s%60);return two(h)+":"+two(m)+":"+two(x)}
  function renderTimer(){
    $("fishclock").textContent=fmt(acc);
    var r=RANKS[0][1], idx=0;
    for(var i=0;i<RANKS.length;i++){if(acc>=RANKS[i][0]){r=RANKS[i][1];idx=i;}}
    $("rank").textContent=r;
    var next=idx<RANKS.length-1?RANKS[idx+1][0]:RANKS[idx][0];
    var base=RANKS[idx][0];
    var p=idx<RANKS.length-1?((acc-base)/(next-base)*100):100;
    $("rankbar").style.width=Math.min(100,p)+"%";
  }
  function saveTimer(){localStorage.setItem(KEY,acc)}
  setInterval(function(){
    if(running){acc+=1;saveTimer();}
    renderTimer();
  },1000);
  renderTimer();
  $("fishbtn").addEventListener("click",function(){
    running=!running;
    this.textContent=running?"收手！停止摸鱼":"开始摸鱼";
    this.className="btn "+(running?"btn-stop":"btn-start");
    if(running) toast("🐟 摸鱼开始，这条鱼你值得拥有");
    else toast("收手了？段位已保存，明天继续");
  });

  // ---------- 节假日 ----------
  var HOLIDAYS=[
    ["元旦","2027-01-01"],["春节","2027-02-06"],["清明节","2027-04-05"],
    ["劳动节","2027-05-01"],["端午节","2027-06-09"],["中秋节","2027-09-15"],
    ["国庆节","2027-10-01"],["元旦","2028-01-01"]
  ];
  function renderHolidays(){
    var today=new Date(); today.setHours(0,0,0,0);
    var list=HOLIDAYS.map(function(h){
      return {name:h[0],date:new Date(h[1]+"T00:00:00"),days:Math.ceil((new Date(h[1]+"T00:00:00")-today)/86400000)};
    }).filter(function(h){return h.days>=0}).sort(function(a,b){return a.days-b.days}).slice(0,4);
    var html="",first=true;
    list.forEach(function(h){
      html+='<div class="hol'+(first?" next":"")+'"><div class="name">'+h.name+
        '<span>'+(h.date.getMonth()+1)+"月"+h.date.getDate()+"日</span></div>"+
        '<div class="days">'+(h.days===0?"就是今天！":h.days+'<small> 天</small>')+"</div></div>";
      first=false;
    });
    $("hollist").innerHTML=html;
  }
  renderHolidays();

  // ---------- 老黄历（按日期固定）----------
  var YI=["带薪喝水","认真发呆","久坐拉伸","去茶水间散步","给绿萝浇水","和同事交换零食","准点下班","盯着窗外思考人生","整理桌面（装忙）","慢工出细活"];
  var JI=["主动加班","秒回「在吗」","开会抢着发言","接新需求","凌晨回老板消息","说「这个简单」","当面拆穿领导PPT","周五下午提上线","摸鱼摸到忘记打卡","真的把活干完"];
  function seedRand(seed){return function(){seed=(seed*9301+49297)%233280;return seed/233280}}
  function pick(arr,r,n){var a=arr.slice(),out=[];while(out.length<n&&a.length){out.push(a.splice(Math.floor(r()*a.length),1)[0])}return out}
  var ds=new Date().toDateString(), r=seedRand(parseInt(ds.replace(/\D/g,"").slice(-9),10)||7);
  $("almanac-date").textContent=ds;
  $("yi").textContent=pick(YI,r,3).join(" · ");
  $("ji").textContent=pick(JI,r,3).join(" · ");

  // ---------- 语录 ----------
  var QUOTES=[
    ["「上班就是拿命换钱，摸鱼才是拿回自己。」","佚名摸鱼学家"],
    ["「工资是老板给的，摸鱼是自己挣的。」","职场经济学派"],
    ["「只要我摸得够快，KPI 就追不上我。」","快手谚语"],
    ["「带薪如厕，是打工人最后的尊严。」","厕所哲学家"],
    ["「不是我不努力，是我在等需求自己过期。」","需求管理学"],
    ["「工位是我的，八小时之内，灵魂属于我自己。」","摸鱼宣言起草人"],
    ["「会哭的孩子有奶吃，会摸的员工有命活。」","养生打工人"],
    ["「deadline 是第一生产力，但摸鱼是续航动力。」","项目观察家"],
    ["「别人在卷，我在充电——毕竟电池也要歇。」","可持续摸鱼理论"],
    ["「假装忙碌一天，比真正忙碌三天还累，所以请科学摸鱼。」","摸鱼科学委员会"],
    ["「上班的意义在于下班，正如人生的意义在于摸鱼。」","存在主义咸鱼"],
    ["「领导画的饼再香，也不如下午三点的一口蛋糕。」","下午茶主义"]
  ];
  var qi=0;
  function showQuote(i){
    $("quote").textContent=QUOTES[i][0];
    $("quote-from").textContent="—— "+QUOTES[i][1];
  }
  $("quotebtn").addEventListener("click",function(){
    var n;do{n=Math.floor(Math.random()*QUOTES.length)}while(n===qi);
    qi=n; showQuote(n);
  });
  showQuote(Math.floor(Math.random()*QUOTES.length));

  // ---------- 老板键 ----------
  function toggleDisguise(force){
    var d=$("disguise");
    var show=force!==undefined?force:!d.classList.contains("show");
    d.classList.toggle("show",show);
  }
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape") toggleDisguise();
  });
  $("bossbtn").addEventListener("click",function(){toggleDisguise()});
  $("disguise").addEventListener("dblclick",function(){toggleDisguise(false)});

  // ---------- 彩蛋 & toast ----------
  var logoClicks=0,logoTimer=null;
  $("logo").addEventListener("click",function(){
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer=setTimeout(function(){logoClicks=0},1200);
    if(logoClicks>=5){logoClicks=0;toast("🐟 摸鱼办欢迎您，编制已发放")}
  });
  var toastTimer=null;
  function toast(msg){
    var t=$("toast");t.textContent=msg;t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){t.classList.remove("show")},2200);
  }
})();
