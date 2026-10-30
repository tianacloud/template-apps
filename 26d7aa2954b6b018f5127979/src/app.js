const link=document.createElement("link"); link.rel="stylesheet"; link.href=new URL("app.css",import.meta.url).href; document.head.appendChild(link);
document.getElementById("app").innerHTML="\n<div class=\"wrap\">\n\n  <header>\n    <h1>🦠 非洲埃博拉疫情监测站 <span class=\"badge-live\"><span class=\"dot\"></span>2026 疫情追踪</span></h1>\n    <p>数据快照更新至 <b>2026-10-20</b> · 本轮疫情为本迪布焦型（Bundibugyo）埃博拉病毒 · WHO 已于 2026-05-17 宣布构成「国际关注的突发公共卫生事件（PHEIC）」</p>\n    <div class=\"src-links\">\n      <a href=\"https://www.who.int/emergencies/disease-outbreak-news\" rel=\"noopener\" target=\"_blank\">WHO 疫情动态（实时）</a>\n      <a href=\"https://www.cdc.gov/ebola/situation-summary/index.html\" rel=\"noopener\" target=\"_blank\">美国 CDC 疫情摘要（实时）</a>\n      <a href=\"https://africacdc.org/outbreaks/\" rel=\"noopener\" target=\"_blank\">非洲疾控中心</a>\n      <a href=\"https://www.chinacdc.cn/\" rel=\"noopener\" target=\"_blank\">中国疾控中心</a>\n    </div>\n  </header>\n\n  <div class=\"alert-banner\">\n    <span style=\"font-size:18px\">⚠️</span>\n    <div><b>最新动态（10月20日）：</b>尼日利亚报告 1 例输入性确诊病例，为本轮疫情第 4 个出现病例的非洲国家；非洲疾控中心已启动对尼日利亚的抗疫支持。有疫区旅居史且出现发热等症状者，请立即联系医疗机构并告知旅行史。</div>\n  </div>\n\n  <section>\n    <h2>📊 疫情总览 <span class=\"tag\">刚果（金）数据截至 10-16</span></h2>\n    <div class=\"kpis\">\n      <div class=\"kpi\"><div class=\"v v-red\" id=\"k-cases\">9,415</div><div class=\"l\">累计确诊</div><div class=\"sub\">刚果（金）</div></div>\n      <div class=\"kpi\"><div class=\"v v-orange\" id=\"k-deaths\">4,536</div><div class=\"l\">累计死亡</div><div class=\"sub\">病死率约 48.2%</div></div>\n      <div class=\"kpi\"><div class=\"v v-green\" id=\"k-rec\">2,522</div><div class=\"l\">累计治愈</div><div class=\"sub\">刚果（金）</div></div>\n      <div class=\"kpi\"><div class=\"v v-blue\">8 省 · 66 区</div><div class=\"l\">波及范围</div><div class=\"sub\">8 个省份 / 66 个卫生区</div></div>\n      <div class=\"kpi\"><div class=\"v v-red\">4 国</div><div class=\"l\">出现病例国家</div><div class=\"sub\">刚果金 · 乌干达 · 肯尼亚 · 尼日利亚</div></div>\n      <div class=\"kpi\"><div class=\"v v-orange\">PHEIC</div><div class=\"l\">WHO 最高警戒级别</div><div class=\"sub\">2026-05-17 宣布</div></div>\n    </div>\n  </section>\n\n  <section>\n    <h2>🔍 分国疫情查询 <span class=\"tag\">点击国家查看详情</span></h2>\n    <div class=\"card\">\n      <div class=\"tabs\" id=\"tabs\"></div>\n      <div id=\"country-panel\"></div>\n    </div>\n  </section>\n\n  <section>\n    <h2>📈 刚果（金）疫情趋势 <span class=\"tag\">累计确诊 / 死亡爬坡</span></h2>\n    <div class=\"card\">\n      <div class=\"legend\"><span class=\"lg1\"><span>累计确诊</span></span><span class=\"lg2\"><span>累计死亡</span></span></div>\n      <div class=\"chart-box\" id=\"chart\"></div>\n      <p style=\"font-size:12px; color:var(--ink2); margin-top:8px\">疫情 5 月 15 日暴发，约 5 个月内确诊突破 9,000 例，扩散速度显著超过刚果（金）历史历次埃博拉疫情。东部伊图里省为疫情「震中」。</p>\n    </div>\n  </section>\n\n  <section>\n    <h2>🗺️ 刚果（金）分省分布 <span class=\"tag\">截至 2026-10-16</span></h2>\n    <div class=\"card\" style=\"overflow-x:auto\">\n      <table>\n        <thead><tr><th>省份</th><th>累计确诊</th><th>卫生区波及</th><th>占全国比重</th></tr></thead>\n        <tbody id=\"prov-body\"></tbody>\n      </table>\n      <p style=\"font-size:12px; color:var(--ink2); margin-top:8px\">截至 10 月 16 日，疫情扩散至第 8 个省份——西北部北乌班吉省（首次报告 2 例，其中 1 例死亡），该省与中非共和国接壤，跨境传播风险进一步上升。</p>\n    </div>\n  </section>\n\n  <section>\n    <h2>🩺 埃博拉健康自检 <span class=\"tag\">风险初筛工具</span></h2>\n    <div class=\"card\">\n      <p style=\"font-size:13px; color:var(--ink2); margin-bottom:14px\">根据 WHO / 非洲疾控中心的防控要点设计。请如实勾选近 21 天内的情况：</p>\n      <div id=\"quiz\"></div>\n      <div style=\"margin-top:18px\">\n        <button class=\"btn\" onclick=\"runCheck()\">开始评估</button>\n        <button class=\"btn btn-ghost\" onclick=\"resetCheck()\">重置</button>\n      </div>\n      <div class=\"result\" id=\"result\"></div>\n      <div class=\"disclaimer\">⚕️ 本工具仅供健康科普与风险初筛参考，不构成医疗诊断建议。如出现可疑症状，请立即通过正规渠道联系医疗机构，并<b>主动告知旅行史与接触史</b>。发热不等于埃博拉，流感、疟疾、肠胃炎均可引起发热，确诊需实验室检测。</div>\n    </div>\n  </section>\n\n  <section>\n    <h2>📅 21 天健康监测计算器 <span class=\"tag\">暴露 / 入境日期推算</span></h2>\n    <div class=\"card\">\n      <p style=\"font-size:13px; color:var(--ink2); margin-bottom:12px\">埃博拉潜伏期为 2–21 天（多为 8–10 天），潜伏期内无传染性，发病后才具备传染性。输入您的<b>最后暴露日期或离开疫区日期</b>，计算监测期满日：</p>\n      <div class=\"calc-row\">\n        <input id=\"calc-date\" type=\"date\">\n        <button class=\"btn\" onclick=\"runCalc()\">计算</button>\n      </div>\n      <div class=\"calc-out\" id=\"calc-out\"></div>\n    </div>\n  </section>\n\n  <section>\n    <h2>📚 防控知识要点</h2>\n    <div class=\"know-grid\">\n      <div class=\"know\"><b>🔬 病毒与传播</b>\n        <ul>\n          <li>不靠空气飞沫传播，日常交谈、蚊虫叮咬不传播</li>\n          <li>主要经接触传播：血液、呕吐物、粪便等体液及被污染物品</li>\n          <li>处理感染者遗体、康复后性传播亦可感染</li>\n          <li>天然宿主为果蝠，患病死亡灵长类也携带病毒</li>\n        </ul>\n      </div>\n      <div class=\"know\"><b>🌡️ 典型症状</b>\n        <ul>\n          <li>初期：发热、明显乏力、肌痛、头痛、咽痛</li>\n          <li>进展：恶心、呕吐、腹泻、腹痛、皮疹</li>\n          <li>病程 3–4 天后：持续高热、不同程度出血</li>\n          <li>早期症状与疟疾相似，需实验室检测确诊</li>\n        </ul>\n        <div class=\"warn\">⚠️ 本迪布焦型目前尚无获批疫苗与特异性疗法，病死率约 25%–50%（历史疫情 30%–50%，本轮约 48.2%）。</div>\n      </div>\n      <div class=\"know\"><b>🛡️ 个人防护</b>\n        <ul>\n          <li>非必要不前往刚果（金）及周边高风险区域</li>\n          <li>不接触蝙蝠、猴子等野生动物</li>\n          <li>不参加遗体直接接触的丧葬仪式</li>\n          <li>避免前往人群密集场所、保持手卫生</li>\n        </ul>\n      </div>\n      <div class=\"know\"><b>✈️ 出入境提示</b>\n        <ul>\n          <li>坦桑尼亚（10-17）：高风险旅客实行 21 天每日健康监测</li>\n          <li>乌干达：曾对刚果（金）入境人员实行 21 天隔离</li>\n          <li>肯尼亚：内罗毕机场加强筛查，5 月以来已筛查超 65 万人次</li>\n          <li>离境后自我监测 21 天，发热立即就医并告知旅行史</li>\n        </ul>\n      </div>\n    </div>\n  </section>\n\n  <footer>\n    <p>数据来源：WHO 疫情动态（DON）· 非洲疾控中心（Africa CDC）· 美国疾控中心（CDC）· 新华社 / 央视新闻 / 中国新闻网等公开通报</p>\n    <p style=\"margin-top:4px\">页面数据为 2026-10-20 快照，点击顶部「权威数据源」按钮可查看实时更新 · 仅作信息参考，防疫决策请以官方机构发布为准</p>\n  </footer>\n</div>\n\n";

(function(){
  /* ================= 数据（快照 2026-10-20） ================= */
  var DATA = {
    countries:[
      {id:"cod",name:"刚果（金）",st:"st-active",stText:"活跃暴发 · 疫情震中",updated:"2026-10-16",
       items:[["累计确诊","9,415"],["累计死亡","4,536（病死率约 48.2%）"],["累计治愈","2,522"],["波及范围","8 省 · 66 个卫生区"],["毒株","本迪布焦型（Bundibugyo）"],["首报暴发","2026-05-15"]],
       note:"本轮疫情 5 月 15 日暴发，为刚果（金）历史上致死性最强、扩散最快的埃博拉疫情之一。东部伊图里省为震中，占全国病例 73.2%。部分地区武装冲突持续、医疗资源不足、社区隐匿传播，密接追踪难度极大。WHO 风险评估：国内风险非常高、区域风险高、全球风险低。",
       tl:[["2026-05-15","宣布暴发本迪布焦型埃博拉疫情"],["2026-05-17","WHO 宣布构成国际关注的突发公共卫生事件（PHEIC）"],["2026-08-21","确诊医护 160 人中 43 人殉职；疫情在约一个法国本土面积的区域指数级扩散"],["2026-10-16","累计确诊 9,415 例、死亡 4,536 例"],["2026-10-16","蔓延至第 8 省——北乌班吉省（与中非共和国接壤）"]]},
      {id:"uga",name:"乌干达",st:"st-ended",stText:"疫情已结束",updated:"2026-08-26",
       items:[["累计确诊","20 例"],["累计死亡","2 例"],["疫情状态","已结束（WHO 于 08-26 宣布）"],["传播来源","刚果（金）输入为主"],["结束条件","连续 42 天无新增"],["首报","2026-05-15"]],
       note:"乌干达 5 月 15 日报告病例（多为自刚果（金）输入），5 月 27 日一度关闭对刚果（金）边境并对入境者实施 21 天隔离。7 月 16 日治疗工作取得进展，7 月 28 日宣布阻断本地传播，8 月 26 日 WHO 与非洲疾控中心联合宣布疫情结束。鉴于与刚果（金）人员往来密切，仍存在再次输入风险。",
       tl:[["2026-05-15","报告疫情，病例多为刚果（金）输入"],["2026-05-27","关闭对刚（金）边境至少四周，入境者隔离 21 天"],["2026-07-16","治疗工作取得进展"],["2026-07-28","宣布阻断本地传播"],["2026-08-26","WHO 宣布疫情结束"]]},
      {id:"ken",name:"肯尼亚",st:"st-active",stText:"聚集性疫情 · 隔离治疗中",updated:"2026-10-18",
       items:[["累计确诊","8 例"],["累计死亡","1 例"],["疫情状态","报告输入病例"],["密接追踪","130 人中 128 人已纳入隔离"],["收治能力","5 家医院 244 张床位"],["口岸筛查","5 月以来超 65 万人次"]],
       note:"病例包含输入及关联病例。卫生部门表示尚无证据表明病毒已在社区持续传播，防控重点为密接追踪、院感防控与口岸筛查。肯尼亚 6 日确认首例后已在全国实验室网络检测 267 份样本，4,971 名医务人员完成培训。",
       tl:[["2026-10-06","确认输入性病例"],["2026-10-14","累计 2 例"],["2026-10-16","累计 3 例"],["2026-10-17","新增 4 例"],["2026-10-18","累计 8 例、1 例死亡"]]},
      {id:"nga",name:"尼日利亚",st:"st-import",stText:"输入病例 · 隔离治疗中",updated:"2026-10-20",
       items:[["累计确诊","1 例"],["累计死亡","0 例"],["疫情状态","报告输入病例"],["密接管理","已确认 44 名密切接触者"],["感染地点","调查中（途经乌干达不代表在乌感染）"],["支持","非洲疾控中心已启动抗疫支持"]],
       note:"尼日利亚卫生和社会福利部 10 月 20 日通报，在联邦首都区发现 1 例实验室确诊埃博拉病例，政府已启动防止传播的公共卫生措施。尼日利亚成为本轮疫情第 4 个发现确诊病例的非洲国家。鉴于人口规模与国际航空枢纽地位，疫情跨境扩散风险受到区域高度关注。",
       tl:[["2026-10-20","卫生和社会福利部通报 1 例确诊病例，44 名密接者纳入管理"],["2026-10-20","非洲疾控中心主任呼吁全球团结应对，阻止疫情蔓延至更多国家"]]},
      {id:"tza",name:"坦桑尼亚",st:"st-watch",stText:"暂无病例 · 预警升级",updated:"2026-10-17",
       items:[["累计确诊","0 例"],["防控措施","10-17 发布旅行公告"],["高风险旅客","21 天每日健康监测"],["监测对象","刚果（金）疫情 + 肯尼亚关联病例风险"],["定位","东非门户 · 跨境防线"]],
       note:"坦桑尼亚目前无确诊病例。卫生部 10 月 17 日发布旅行公告，加强对国际旅客的健康筛查与监测，被认定为高风险的旅客需接受为期 21 天的每日健康监测。坦桑尼亚为中国公民在东非的重要停留地，赴坦前请关注口岸检疫要求。",
       tl:[["2026-10-17","卫生部发布旅行公告，升级入境健康筛查；高风险旅客实施 21 天每日健康监测"]]}
    ],
    /* 刚果（金）累计确诊 / 死亡爬坡（公开里程碑通报） */
    trend:[
      {d:"6/20",c:1000,de:0},{d:"7/13",c:2000,de:0},{d:"7/21",c:0,de:1000},{d:"7/24",c:3000,de:0},
      {d:"8/7",c:4000,de:0},{d:"8/9",c:0,de:2000},{d:"8/17",c:5000,de:0},{d:"8/30",c:6000,de:0},
      {d:"8/31",c:0,de:3000},{d:"9/11",c:7000,de:0},{d:"9/27",c:8000,de:0},{d:"10/2",c:0,de:4000},
      {d:"10/16",c:9415,de:4536}
    ],
    provinces:[
      ["伊图里省（震中）",6891,"73.2%","28 / 36 个卫生区"],
      ["北基伍省",2027,"21.5%","17 / 34 个卫生区"],
      ["上韦莱省",406,"4.3%","7 / 13 个卫生区"],
      ["乔波省",71,"0.8%","7 / 23 个卫生区"],
      ["下韦莱省",13,"0.14%","4 / 11 个卫生区"],
      ["南基伍省",3,"<0.1%","1 / 34 个卫生区"],
      ["南乌班吉省",2,"<0.1%","1 / 16 个卫生区"],
      ["北乌班吉省（新增第 8 省）",2,"<0.1%","1 / 11 个卫生区"]
    ],
    quiz:[
      {q:"1. 近 21 天内，您是否到过以下国家或地区？",multi:true,key:"expo",opts:[
        {t:"刚果（金）（尤其东部伊图里、北基伍等省）",s:3},
        {t:"肯尼亚（内罗毕等地）",s:2},
        {t:"乌干达 / 尼日利亚相关入境城市",s:2},
        {t:"均未去过",s:0}]},
      {q:"2. 近 21 天内，您是否有过以下接触？",multi:true,key:"contact",opts:[
        {t:"接触过确诊/疑似患者或其血液、呕吐物、粪便等体液",s:3},
        {t:"参与过遗体处理或遗体接触式丧葬仪式",s:3},
        {t:"接触过蝙蝠、猴子等野生动物或生食其肉",s:2},
        {t:"均没有",s:0}]},
      {q:"3. 您目前是否出现以下症状？",multi:true,key:"symptom",opts:[
        {t:"发热（≥38℃）",s:2},
        {t:"明显乏力、肌肉酸痛、头痛、咽痛",s:1},
        {t:"恶心、呕吐、腹泻、腹痛或皮疹",s:1},
        {t:"出血倾向（牙龈出血、皮下瘀斑、呕血、便血等）",s:3},
        {t:"无上述症状",s:0}]}
    ]
  };

  /* ================= 分国查询 ================= */
  var cur = DATA.countries[0].id;
  var tabsEl = document.getElementById("tabs");
  var panelEl = document.getElementById("country-panel");
  DATA.countries.forEach(function(c){
    var b=document.createElement("button");b.className="tab";b.textContent=c.name;b.dataset.id=c.id;
    b.onclick=function(){cur=c.id;renderCountry();};tabsEl.appendChild(b);
  });
  function esc(s){return String(s).replace(/[&<>]/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[ch];});}
  function renderCountry(){
    Array.prototype.forEach.call(tabsEl.children,function(b){b.className="tab"+(b.dataset.id===cur?" on":"");});
    var c = DATA.countries.filter(function(x){return x.id===cur;})[0];
    var items = c.items.map(function(it){return '<div class="c-item"><div class="k">'+esc(it[0])+'</div><div class="v">'+esc(it[1])+'</div></div>';}).join("");
    var tl = c.tl.map(function(t){return "<li><b>"+esc(t[0])+"</b>　"+esc(t[1])+"</li>";}).join("");
    panelEl.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;"><span class="status-pill '+c.st+'">'+esc(c.stText)+'</span>'+
      '<span style="font-size:12px;color:var(--ink2);">数据更新至 '+esc(c.updated)+'</span></div>'+
      '<div class="c-grid">'+items+'</div>'+
      '<div class="c-note">'+esc(c.note)+'</div>'+
      '<div style="font-size:13px;font-weight:600;margin-top:14px;">关键时间线</div><ul class="tl">'+tl+'</ul>';
  }
  renderCountry();

  /* ================= 分省表 ================= */
  var pb=document.getElementById("prov-body");
  DATA.provinces.forEach(function(p){
    var tr=document.createElement("tr");
    var bar = (typeof p[1]==="number") ? '<div class="bar"><i style="width:'+Math.max(4,p[1]/6891*100).toFixed(1)+'%"></i></div>' : "";
    tr.innerHTML="<td>"+esc(p[0])+"</td><td><b>"+esc(p[1])+"</b>"+bar+"</td><td>"+esc(p[3])+"</td><td>"+esc(p[2])+"</td>";
    pb.appendChild(tr);
  });

  /* ================= SVG 趋势图 ================= */
  function drawChart(){
    var W=860,H=300,padL=52,padB=34,padT=18,padR=14;
    var maxC=10000,maxD=5000;
    var pts=DATA.trend;
    var iw=W-padL-padR, ih=H-padT-padB;
    function x(i){return padL+iw*i/(pts.length-1);}
    function yC(v){return padT+ih*(1-v/maxC);}
    function yD(v){return padT+ih*(1-v/maxC);}
    var s='<svg width="100%" viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="刚果金疫情趋势图">';
    s+='<rect width="'+W+'" height="'+H+'" fill="#ffffff"/>';
    for(var g=0;g<=5;g++){
      var gy=padT+ih*g/5;
      s+='<line x1="'+padL+'" y1="'+gy+'" x2="'+(W-padR)+'" y2="'+gy+'" stroke="#eef1f5" stroke-width="1"/>';
      s+='<text x="'+(padL-8)+'" y="'+(gy+4)+'" font-size="11" fill="#94a3b8" text-anchor="end">'+(maxC-maxC*g/5)+'</text>';
    }
    /* 死亡折线（灰色，右轴概念合并展示，同比例画布） */
    var dp=pts.filter(function(p){return p.de>0;});
    if(dp.length>1){
      var path="";dp.forEach(function(p,i){path+=(i?" L":"M")+x(pts.indexOf(p))+" "+yD(p.de);});
      s+='<path d="'+path+'" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,4"/>';
      dp.forEach(function(p){s+='<circle cx="'+x(pts.indexOf(p))+'" cy="'+yD(p.de)+'" r="3.5" fill="#94a3b8"/>';});
    }
    /* 确诊折线（红色） */
    var cp=pts.filter(function(p){return p.c>0;});
    var cpath="";
    cp.forEach(function(p,i){cpath+=(i?" L":"M")+x(pts.indexOf(p))+" "+yC(p.c);});
    s+='<path d="'+cpath+'" fill="none" stroke="#b91c1c" stroke-width="2.5"/>';
    cp.forEach(function(p){
      var cx=x(pts.indexOf(p)),cy=yC(p.c);
      s+='<circle cx="'+cx+'" cy="'+cy+'" r="4" fill="#b91c1c"/>';
      s+='<text x="'+cx+'" y="'+(cy-10)+'" font-size="11" fill="#b91c1c" text-anchor="middle" font-weight="bold">'+p.c.toLocaleString()+'</text>';
    });
    pts.forEach(function(p,i){
      s+='<text x="'+x(i)+'" y="'+(H-10)+'" font-size="11" fill="#94a3b8" text-anchor="middle">'+p.d+'</text>';
    });
    s+='</svg>';
    document.getElementById("chart").innerHTML=s;
  }
  drawChart();

  /* ================= 自检工具 ================= */
  var quizEl=document.getElementById("quiz");
  var picked={};
  DATA.quiz.forEach(function(item,qi){
    picked[item.key]={};
    var d=document.createElement("div");d.className="q";
    var h='<div class="qt">'+item.q+'</div><div class="opts">';
    item.opts.forEach(function(o,oi){
      h+='<span class="opt" data-q="'+qi+'" data-o="'+oi+'">'+o.t+'</span>';
    });
    h+='</div>';d.innerHTML=h;quizEl.appendChild(d);
  });
  quizEl.addEventListener("click",function(e){
    var el=e.target;if(!el.classList.contains("opt"))return;
    var qi=+el.dataset.q,oi=+el.dataset.o,item=DATA.quiz[qi];
    var isNone=item.opts[oi].s===0;
    if(isNone){
      /* 选「无」清空该题其他选择 */
      picked[item.key]={};
      Array.prototype.forEach.call(el.parentNode.children,function(o2){o2.classList.remove("on");});
      picked[item.key][oi]=true;el.classList.add("on");return;
    }
    if(picked[item.key][oi]){
      delete picked[item.key][oi];el.classList.remove("on");
    }else if(!isNone){
      /* 若选了具体项，取消「无」 */
      item.opts.forEach(function(o2,oi2){
        if(o2.s===0){delete picked[item.key][oi2];}
      });
      Array.prototype.forEach.call(el.parentNode.children,function(o2,i2){
        if(item.opts[i2].s===0)o2.classList.remove("on");
      });
      picked[item.key][oi]=true;el.classList.add("on");
    }
  });
  function resetCheck(){
    picked={};
    DATA.quiz.forEach(function(item){picked[item.key]={};});
    Array.prototype.forEach.call(document.querySelectorAll(".opt"),function(o){o.classList.remove("on");});
    document.getElementById("result").style.display="none";
  }
  window.resetCheck=resetCheck;
  function runCheck(){
    if(DATA.quiz.some(function(item){return Object.keys(picked[item.key]).length===0;})){var r=document.getElementById("result");r.className="result r-mid";r.textContent="请先回答全部三个问题。";r.style.display="block";return;}
    var score=0,expo=false,contact=false,sym=false,bleed=false,noExpo=true;
    DATA.quiz.forEach(function(item){
      var sel=picked[item.key],sum=0;
      Object.keys(sel).forEach(function(k){sum+=item.opts[+k].s;});
      if(item.key==="expo"){
        Object.keys(sel).forEach(function(k){var o=item.opts[+k];if(o.s>0){expo=true;noExpo=false;}});
      }
      if(item.key==="contact"){
        Object.keys(sel).forEach(function(k){var o=item.opts[+k];if(o.s>0){contact=true;noExpo=false;}});
      }
      if(item.key==="symptom"){
        Object.keys(sel).forEach(function(k){var o=item.opts[+k];if(o.s>0)sym=true;if(o.s===3)bleed=true;});
      }
      score+=sum;
    });
    var res=document.getElementById("result"),level,cls,head,body;
    if((expo||contact)&&(sym||bleed)){
      level="高危";cls="r-high";
      head="⚠️ 高风险：流行病学史 + 症状同时存在";
      body="您存在疫区旅居或高危接触史，并已出现"+(bleed?"出血倾向":"可疑症状")+"。请<b>立即</b>联系当地定点医疗机构或疾控部门，主动告知旅行史与接触史，避免乘坐公共交通、避免与他人密切接触，等待专业转运与检测。埃博拉早期治疗可显著降低死亡风险，切勿自行服药观察。";
    }else if((expo||contact)&&!sym){
      level="中危";cls="r-mid";
      head="🟠 中风险：有流行病学史，暂无症状";
      body="您有疫区旅居史或高危接触史。潜伏期为 2–21 天，请在最后暴露之日起<b>连续 21 天自我健康监测</b>（可用下方计算器推算期满日）：每日测量体温，避免与他人共用餐具及密切接触，暂缓献血；一旦出现发热等症状立即就医并主动告知暴露史。";
    }else if(noExpo&&sym){
      level="低–中危";cls="r-mid";
      head="🟡 未见明确流行病学史，但有症状";
      body="您目前未勾选疫区旅居史或高危接触史，发热更可能由流感、疟疾、肠胃炎等常见疾病引起。但若疫情地区信息更新（如新增输入病例），建议仍有必要就医排查；如后续出现出血倾向，请立即就医。";
    }else{
      level="低危";cls="r-low";
      head="🟢 低风险";
      body="未发现明确流行病学史与可疑症状。请继续保持良好卫生习惯：勤洗手、避免接触可疑患者体液与野生动物、避免前往疫情高风险区域。前往东非/中非旅行前，请查询最新官方疫情通报。";
    }
    res.className="result "+cls;
    res.innerHTML="<h3>"+esc(head)+"　<span style=\"font-size:12px;font-weight:normal;\">评估等级："+esc(level)+"</span></h3><p>"+body+"</p>";
    res.style.display="block";
    res.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  window.runCheck=runCheck;

  /* ================= 监测计算器 ================= */
  function runCalc(){
    var v=document.getElementById("calc-date").value;
    var out=document.getElementById("calc-out");
    if(!v){out.style.display="block";out.innerHTML="请先选择日期。";return;}
    var parts=v.split("-");
    var d=new Date(+parts[0],+parts[1]-1,+parts[2]);
    d.setDate(d.getDate()+21);
    var y=d.getFullYear(),m=("0"+(d.getMonth()+1)).slice(-2),dd=("0"+d.getDate()).slice(-2);
    var vd=esc(v);
    out.style.display="block";
    out.innerHTML="从 <b>"+vd+"</b> 起连续监测 21 天，监测期满日为 <b>"+y+"年"+m+"月"+dd+"日</b>。<br>监测期间请每日测量体温并记录；若期间出现发热等症状，请立即就医并主动告知流行病学史。监测是否结束请遵循当地公共卫生部门的指引。";
  }
  window.runCalc=runCalc;
})();
