import { createTianaFetch } from "@tianacloud/serverless";
const style=document.createElement("style"); style.textContent="\n  :root{\n    --bg:#0f1424; --bg2:#141b30; --card:#1c2640; --card2:#232f52;\n    --line:#2c3a63; --main:#3F6BD5; --main2:#5b86ff;\n    --gold:#F5A623; --green:#22D3A6; --red:#EF4444; --text:#e8edf7; --sub:#9fb0d0;\n    --shadow:0 8px 28px rgba(0,0,0,.45);\n  }\n  *{box-sizing:border-box; -webkit-tap-highlight-color:transparent;}\n  html,body{margin:0;padding:0;}\n  body{\n    font-family:-apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n    background:linear-gradient(180deg,#16203c 0%,#0f1424 100%);\n    color:var(--text); min-height:100vh;\n  }\n  #app{max-width:480px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden;}\n  /* 顶部状态栏 */\n  .topbar{\n    display:flex;align-items:center;gap:10px;padding:14px 16px 10px;\n    background:linear-gradient(180deg,rgba(63,107,213,.18),transparent);\n  }\n  .avatar{\n    width:42px;height:42px;border-radius:14px;flex:0 0 auto;\n    background:linear-gradient(135deg,var(--main),var(--main2));\n    display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#fff;\n    box-shadow:0 4px 14px rgba(63,107,213,.5);\n  }\n  .lvinfo{flex:1;min-width:0;}\n  .lvinfo .name{font-size:13px;color:var(--sub);}\n  .lvinfo .lv{font-size:15px;font-weight:700;}\n  .lvbar{height:7px;border-radius:6px;background:var(--card);margin-top:5px;overflow:hidden;position:relative;}\n  .lvbar>i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:linear-gradient(90deg,var(--gold),#ffd27d);transition:width .5s;}\n  .scorebox{text-align:right;flex:0 0 auto;}\n  .scorebox .num{font-size:20px;font-weight:800;color:var(--gold);line-height:1;}\n  .scorebox .lab{font-size:11px;color:var(--sub);}\n  /* 主体 */\n  .view{flex:1;overflow-y:auto;padding:8px 16px 90px;display:none;}\n  .view.active{display:block;animation:fade .25s ease;}\n  @keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\n  .hero{\n    background:linear-gradient(135deg,rgba(63,107,213,.22),rgba(34,211,166,.12));\n    border:1px solid var(--line);border-radius:18px;padding:16px;margin:6px 0 14px;\n  }\n  .hero h1{margin:0 0 4px;font-size:20px;letter-spacing:1px;}\n  .hero p{margin:0;color:var(--sub);font-size:12.5px;line-height:1.6;}\n  .checkin{margin-top:12px;}\n  .btn{\n    border:0;border-radius:12px;padding:11px 16px;font-size:14px;font-weight:700;cursor:pointer;\n    background:linear-gradient(135deg,var(--main),var(--main2));color:#fff;box-shadow:0 6px 16px rgba(63,107,213,.4);\n    transition:transform .1s,opacity .2s;width:100%;\n  }\n  .btn:active{transform:scale(.97);}\n  .btn.gold{background:linear-gradient(135deg,var(--gold),#ffcf7a);color:#3a2a00;box-shadow:0 6px 16px rgba(245,166,35,.35);}\n  .btn.ghost{background:var(--card2);color:var(--text);box-shadow:none;border:1px solid var(--line);}\n  .btn.sm{padding:8px 12px;font-size:13px;width:auto;}\n  .btn[disabled]{opacity:.5;cursor:not-allowed;}\n  .streak{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--gold);font-weight:700;}\n  .streak .flame{width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#ffb347,#ef4444);box-shadow:0 0 10px rgba(239,68,68,.6);}\n  /* 关卡网格 */\n  .sec-title{font-size:14px;color:var(--sub);margin:14px 2px 10px;font-weight:700;display:flex;align-items:center;gap:8px;}\n  .sec-title::before{content:\"\";width:4px;height:14px;border-radius:3px;background:var(--main);}\n  .levels{display:grid;grid-template-columns:1fr 1fr;gap:12px;}\n  .level{\n    background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;cursor:pointer;\n    position:relative;overflow:hidden;transition:transform .12s,box-shadow .2s;\n  }\n  .level:active{transform:scale(.97);}\n  .level.boss{background:linear-gradient(135deg,rgba(239,68,68,.18),rgba(245,166,35,.16));border-color:#5a2e2e;}\n  .level .ico{font-size:26px;line-height:1;margin-bottom:8px;}\n  .level .ln{font-size:15px;font-weight:800;}\n  .level .ld{font-size:11.5px;color:var(--sub);margin-top:3px;min-height:30px;}\n  .level .stars{margin-top:8px;font-size:14px;letter-spacing:2px;color:var(--gold);}\n  .level .stars .off{color:#39466e;}\n  .level .badge-done{position:absolute;top:10px;right:10px;font-size:10px;background:var(--green);color:#04322a;padding:2px 7px;border-radius:20px;font-weight:800;}\n  /* 答题页 */\n  .quiz-head{display:flex;align-items:center;gap:10px;padding:10px 0 6px;}\n  .back{background:var(--card2);border:1px solid var(--line);color:var(--text);border-radius:10px;padding:7px 12px;font-size:13px;cursor:pointer;}\n  .quiz-prog{flex:1;height:8px;border-radius:6px;background:var(--card);overflow:hidden;}\n  .quiz-prog>i{display:block;height:100%;background:linear-gradient(90deg,var(--main),var(--main2));transition:width .3s;}\n  .combo{font-size:13px;font-weight:800;color:var(--gold);min-width:46px;text-align:right;}\n  .qcard{\n    background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;margin-top:10px;\n    box-shadow:var(--shadow);position:relative;\n  }\n  .qcard .area{display:inline-block;font-size:11px;color:var(--main2);background:rgba(91,134,255,.12);padding:3px 9px;border-radius:20px;margin-bottom:10px;}\n  .qcard .qtext{font-size:16px;line-height:1.6;font-weight:600;}\n  .options{margin-top:16px;display:flex;flex-direction:column;gap:10px;}\n  .opt{\n    background:var(--card2);border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;font-size:14.5px;\n    cursor:pointer;display:flex;gap:10px;align-items:center;transition:border-color .15s,background .15s;line-height:1.4;\n  }\n  .opt .tag{width:22px;height:22px;border-radius:7px;background:var(--card);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:var(--sub);flex:0 0 auto;}\n  .opt:active{border-color:var(--main);}\n  .opt.right{border-color:var(--green);background:rgba(34,211,166,.14);}\n  .opt.wrong{border-color:var(--red);background:rgba(239,68,68,.14);}\n  .opt.dim{opacity:.5;}\n  .feedback{margin-top:14px;display:none;}\n  .feedback.show{display:block;animation:fade .3s ease;}\n  .verdict{font-size:15px;font-weight:800;display:flex;align-items:center;gap:8px;}\n  .verdict.ok{color:var(--green);}\n  .verdict.no{color:var(--red);}\n  .tipbox{margin-top:10px;background:rgba(245,166,35,.10);border:1px solid rgba(245,166,35,.35);border-radius:12px;padding:11px 13px;font-size:13px;line-height:1.6;}\n  .tipbox .t1{color:var(--gold);font-weight:800;margin-right:6px;}\n  .explain{margin-top:8px;color:var(--sub);font-size:13px;line-height:1.65;}\n  .explain b{color:var(--text);}\n  .combo-pop{position:absolute;right:18px;top:18px;font-size:22px;font-weight:900;color:var(--gold);opacity:0;pointer-events:none;}\n  .combo-pop.go{animation:cpop .9s ease;}\n  @keyframes cpop{0%{opacity:0;transform:scale(.5) rotate(-8deg)}30%{opacity:1;transform:scale(1.15) rotate(4deg)}100%{opacity:0;transform:scale(1) translateY(-20px)}}\n  /* 结算 */\n  .mask{position:fixed;inset:0;background:rgba(8,12,24,.72);display:none;align-items:center;justify-content:center;z-index:50;padding:24px;}\n  .mask.show{display:flex;animation:fade .25s;}\n  .result{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:24px;width:100%;max-width:340px;text-align:center;box-shadow:var(--shadow);}\n  .result h2{margin:0 0 6px;font-size:22px;}\n  .result .bigstars{font-size:34px;letter-spacing:6px;color:var(--gold);margin:8px 0;}\n  .result .bigstars .off{color:#39466e;}\n  .result .rstat{color:var(--sub);font-size:13px;line-height:1.7;margin:6px 0 16px;}\n  .result .rstat b{color:var(--text);}\n  /* 错题本 */\n  .wstat{display:flex;gap:12px;margin:6px 0 14px;}\n  .wstat .box{flex:1;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px;text-align:center;}\n  .wstat .box .n{font-size:22px;font-weight:800;color:var(--gold);}\n  .wstat .box .l{font-size:11px;color:var(--sub);margin-top:2px;}\n  .witem{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:13px 14px;margin-bottom:10px;}\n  .witem .wt{font-size:13.5px;line-height:1.5;font-weight:600;}\n  .witem .wm{margin-top:7px;display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--sub);}\n  .witem .wm .pill{background:rgba(239,68,68,.16);color:var(--red);padding:2px 8px;border-radius:20px;font-weight:700;}\n  .witem .wm .pill.m{background:rgba(34,211,166,.16);color:var(--green);}\n  .empty{text-align:center;color:var(--sub);padding:50px 20px;font-size:14px;}\n  .empty .e{font-size:46px;margin-bottom:10px;opacity:.5;}\n  /* 成就 */\n  .ach-hero{background:linear-gradient(135deg,rgba(245,166,35,.16),rgba(63,107,213,.14));border:1px solid var(--line);border-radius:18px;padding:18px;margin:6px 0 14px;}\n  .ach-hero .row{display:flex;justify-content:space-between;align-items:center;}\n  .ach-hero .lvname{font-size:22px;font-weight:800;}\n  .ach-hero .next{font-size:12px;color:var(--sub);margin-top:4px;}\n  .badges{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}\n  .badge{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 8px;text-align:center;}\n  .badge.locked{opacity:.4;filter:grayscale(1);}\n  .badge .bi{font-size:28px;line-height:1;}\n  .badge .bn{font-size:11.5px;margin-top:7px;line-height:1.3;font-weight:600;}\n  .badge .bd{font-size:10px;color:var(--sub);margin-top:3px;}\n  /* 底栏 */\n  .tabbar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;\n    display:flex;background:rgba(20,27,48,.96);backdrop-filter:blur(10px);border-top:1px solid var(--line);z-index:20;}\n  .tab{flex:1;text-align:center;padding:9px 0 10px;cursor:pointer;color:var(--sub);font-size:11px;}\n  .tab .ti{font-size:19px;line-height:1;margin-bottom:3px;}\n  .tab.active{color:var(--main2);}\n  .tab.active .ti{transform:translateY(-1px);}\n  /* toast */\n  .toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%) translateY(20px);background:var(--card2);border:1px solid var(--line);\n    padding:10px 18px;border-radius:30px;font-size:13px;opacity:0;transition:.3s;z-index:60;box-shadow:var(--shadow);pointer-events:none;}\n  .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}\n"; document.head.appendChild(style);
document.querySelector("#app").outerHTML="\n<div id=\"app\">\n  <div class=\"topbar\">\n    <div class=\"avatar\" id=\"avatar\">Lv1</div>\n    <div class=\"lvinfo\">\n      <div class=\"name\" id=\"lvName\">青铜考生</div>\n      <div class=\"lv\"><span id=\"lvTitle\">青铜</span> · <span id=\"scoreText\">0</span> 积分</div>\n      <div class=\"lvbar\"><i id=\"lvFill\" style=\"width:0%\"></i></div>\n    </div>\n    <div class=\"scorebox\">\n      <div class=\"num\" id=\"scoreNum\">0</div>\n      <div class=\"lab\">积分</div>\n    </div>\n  </div>\n\n  <!-- 首页 -->\n  <div class=\"view active\" id=\"view-home\">\n    <div class=\"hero\">\n      <h1>高项突围 · 闯关错题本</h1>\n      <p>信息系统项目管理师（高级）高频考点。答题即闯关，错题自动收录，连对拿积分、攒徽章、每日打卡。把枯燥考点变成升级打怪。</p>\n      <div class=\"checkin\">\n        <div class=\"streak\" id=\"streakBox\" style=\"margin-bottom:8px; display:none\">\n          <span class=\"flame\"></span><span id=\"streakText\">连续 0 天</span>\n        </div>\n        <button class=\"btn gold\" id=\"checkinBtn\">今日签到 +20 积分</button>\n      </div>\n    </div>\n    <div class=\"sec-title\">关卡地图</div>\n    <div class=\"levels\" id=\"levelGrid\"></div>\n  </div>\n\n  <!-- 答题 -->\n  <div class=\"view\" id=\"view-quiz\">\n    <div class=\"quiz-head\">\n      <button class=\"back\" id=\"quizBack\">← 退出</button>\n      <div class=\"quiz-prog\"><i id=\"quizProgFill\"></i></div>\n      <div class=\"combo\" id=\"comboText\">连对 0</div>\n    </div>\n    <div class=\"qcard\" id=\"qcard\">\n      <div class=\"combo-pop\" id=\"comboPop\">连对!+5</div>\n      <span class=\"area\" id=\"qArea\">知识点</span>\n      <div class=\"qtext\" id=\"qText\">题目加载中…</div>\n      <div class=\"options\" id=\"qOptions\"></div>\n      <div class=\"feedback\" id=\"feedback\">\n        <div class=\"verdict\" id=\"verdict\"></div>\n        <div class=\"tipbox\" id=\"tipbox\"></div>\n        <div class=\"explain\" id=\"explain\"></div>\n        <button class=\"btn\" id=\"nextBtn\" style=\"margin-top:14px\">下一题 →</button>\n      </div>\n    </div>\n  </div>\n\n  <!-- 错题本 -->\n  <div class=\"view\" id=\"view-wrong\">\n    <div class=\"sec-title\">我的错题本</div>\n    <div class=\"wstat\">\n      <div class=\"box\"><div class=\"n\" id=\"wrongCount\">0</div><div class=\"l\">待巩固错题</div></div>\n      <div class=\"box\"><div class=\"n\" id=\"wrongTimes\">0</div><div class=\"l\">累计答错次数</div></div>\n      <div class=\"box\"><div class=\"n\" id=\"masteryCount\">0</div><div class=\"l\">已掌握移除</div></div>\n    </div>\n    <button class=\"btn\" id=\"practiceBtn\" style=\"margin-bottom:14px\">🎯 随机重练错题</button>\n    <div id=\"wrongList\"></div>\n  </div>\n\n  <!-- 成就 -->\n  <div class=\"view\" id=\"view-ach\">\n    <div class=\"sec-title\">段位 & 进度</div>\n    <div class=\"ach-hero\">\n      <div class=\"row\">\n        <div>\n          <div class=\"lvname\" id=\"achLvName\">青铜 Lv1</div>\n          <div class=\"next\" id=\"achNext\">距下一段位还需 200 积分</div>\n        </div>\n        <div style=\"text-align:right\">\n          <div id=\"achScore\" style=\"font-size:26px; font-weight:800; color:var(--gold)\">0</div>\n          <div style=\"font-size:11px; color:var(--sub)\">总积分</div>\n        </div>\n      </div>\n      <div class=\"lvbar\" style=\"margin-top:12px\"><i id=\"achFill\"></i></div>\n    </div>\n    <div class=\"sec-title\">徽章墙</div>\n    <div class=\"badges\" id=\"badgeWall\"></div>\n    <div class=\"sec-title\">战绩统计</div>\n    <div class=\"wstat\">\n      <div class=\"box\"><div class=\"n\" id=\"statAnswered\">0</div><div class=\"l\">总答题</div></div>\n      <div class=\"box\"><div class=\"n\" id=\"statRight\">0</div><div class=\"l\">答对</div></div>\n      <div class=\"box\"><div class=\"n\" id=\"statRate\">0%</div><div class=\"l\">正确率</div></div>\n    </div>\n  </div>\n\n  <div class=\"tabbar\">\n    <div class=\"tab active\" data-view=\"home\"><div class=\"ti\">🗺</div>闯关</div>\n    <div class=\"tab\" data-view=\"wrong\"><div class=\"ti\">📕</div>错题本</div>\n    <div class=\"tab\" data-view=\"ach\"><div class=\"ti\">🏆</div>成就</div>\n  </div>\n</div>\n\n<div class=\"mask\" id=\"mask\">\n  <div class=\"result\" id=\"resultCard\"></div>\n</div>\n<div class=\"toast\" id=\"toast\"></div>\n\n";

/* ============ 题库（高项精选题，单一事实源） ============ */
const QUESTIONS = [
  {id:1, area:"法律法规", q:"根据《招标投标法》，评标工作由下列哪个主体负责？", options:["招标人","评标委员会","招标代理机构","行政监督部门"], answer:1,
   tip:"评标定由评委会，代理机构只跑腿。",
   explain:"评标由招标人依法组建的<b>评标委员会</b>负责，成员含技术、经济专家且专家不少于2/3。招标代理机构受委托办理招标事宜，评标权在评委会。"},
  {id:2, area:"法律法规", q:"《招标投标法》规定，投标保证金不得超过项目估算价的多少？", options:["1%","2%","5%","10%"], answer:1,
   tip:"保证金，俩个点（2%），再多就违规。",
   explain:"投标保证金一般不得超过项目估算价的<b>2%</b>，且有效期应超出投标有效期30天。过高会限制竞争。"},
  {id:3, area:"法律法规", q:"中标通知书对谁具有法律效力？", options:["招标人","中标人","招标人和中标人","评标委员会"], answer:2,
   tip:"中标通知锁双方，签合同跑不掉。",
   explain:"中标通知书发出后，对<b>招标人和中标人</b>均具有法律效力，双方应自中标通知书发出之日起30日内订立书面合同。"},
  {id:4, area:"法律法规", q:"根据《合同法》，下列哪种情形不会导致要约失效？", options:["拒绝要约的通知到达要约人","要约人依法撤销要约","承诺期限届满受要约人未作出承诺","受要约人对要约内容作出非实质性变更"], answer:3,
   tip:"非实质不变更，要约仍有效；实质变更=新要约。",
   explain:"受要约人对要约内容作出<b>非实质性变更</b>，要约并不失效（除非要约人及时反对）。实质性变更（如价格、数量）构成新要约。"},
  {id:5, area:"法律法规", q:"法人或者其他组织的软件著作权保护期为多少年？", options:["50年","作者终生及其死亡后50年","25年","10年"], answer:0,
   tip:"单位软著五十载，自首次发表算。",
   explain:"法人/其他组织的软件著作权保护期为<b>50年</b>，截止于软件首次发表后第50年的12月31日。自然人软著则是终生加死后50年。"},

  {id:6, area:"新一代信息技术", q:"下列云计算服务模式中，用户最不需要关心底层基础设施的是？", options:["IaaS","PaaS","SaaS","DaaS"], answer:2,
   tip:"SaaS甩手掌柜，IaaS自己搭台。",
   explain:"<b>SaaS</b>（软件即服务）由服务商提供完整应用，用户只管用；IaaS 只给虚拟硬件，平台/软件都要自己来。"},
  {id:7, area:"新一代信息技术", q:"大数据的经典5V特征中，不包括下列哪一项？", options:["Volume（体量大）","Variety（种类多）","Value（价值密度低）","Visualization（可视化）"], answer:3,
   tip:"5V无图：大量多快真值低（价值密度低）。",
   explain:"大数据5V：Volume、Velocity、Variety、Value、Veracity（真实性）。<b>可视化</b>是处理手段，不属于5V特征。"},
  {id:8, area:"新一代信息技术", q:"物联网体系架构通常分为几层？", options:["2层","3层","4层","5层"], answer:1,
   tip:"物联三层：感知→网络→应用。",
   explain:"物联网通常分为<b>感知层、网络层、应用层</b>三层。感知层采集（传感器），网络层传输，应用层处理业务。"},
  {id:9, area:"新一代信息技术", q:"下列关于区块链特征的描述，错误的是？", options:["去中心化","不可篡改","可追溯","高并发实时计算"], answer:3,
   tip:"链上三不：去中心、不可改、可追溯；高并发非所长。",
   explain:"区块链核心是<b>去中心化、不可篡改、可追溯、共识机制</b>。其吞吐与实时性并非优势，高并发计算不是它的典型特征。"},
  {id:10, area:"新一代信息技术", q:"下列不属于人工智能典型技术的是？", options:["机器学习","专家系统","自然语言处理","关系型数据库事务处理"], answer:3,
   tip:"AI三剑：学习、专家、语言；数据库事务是传统IT。",
   explain:"机器学习、专家系统、自然语言处理均为AI范畴。<b>关系型数据库事务处理</b>是传统数据处理技术，不属于AI。"},

  {id:11, area:"项目管理基础", q:"项目管理的五大过程组，正确的顺序是？", options:["启动→规划→执行→监控→收尾","规划→启动→执行→监控→收尾","启动→执行→规划→监控→收尾","启动→规划→监控→执行→收尾"], answer:0,
   tip:"启规执监收，五步一条龙。",
   explain:"五大过程组顺序为<b>启动、规划、执行、监控、收尾</b>。监控贯穿执行全过程，并非排在最后。"},
  {id:12, area:"项目管理基础", q:"十大知识领域中，唯一贯穿项目全过程、不局限于某一过程组的是？", options:["整合管理","范围管理","沟通管理","干系人管理"], answer:0,
   tip:"整合一条线，贯穿全过程。",
   explain:"<b>项目整合管理</b>协调各知识领域，贯穿启动到收尾全过程；其余领域多在特定过程组有集中活动。"},
  {id:13, area:"项目管理基础", q:"关于项目生命周期与产品生命周期，下列说法正确的是？", options:["两者相同","项目生命周期包含产品生命周期","产品生命周期通常更长，项目只是其中一段","两者无关"], answer:2,
   tip:"产品命更长，项目只一段。",
   explain:"<b>产品生命周期</b>（立项→运维→退市）通常远长于项目生命周期，项目只是实现产品某一部分的活动。"},
  {id:14, area:"项目管理基础", q:"项目章程的主要作用是？", options:["制定详细进度计划","正式授权项目成立","分配具体任务给成员","定义验收标准"], answer:1,
   tip:"章程一声令，项目正式成立。",
   explain:"项目章程由发起人签发，<b>正式批准项目成立并授权项目经理</b>动用资源。它是项目存在的法律依据。"},
  {id:15, area:"项目管理基础", q:"识别干系人应当在何时进行？", options:["仅启动阶段一次性完成","项目初期开始并持续进行","收尾阶段","规划完成后"], answer:1,
   tip:"干系人早识别，全程都要盯。",
   explain:"识别干系人<b>从项目初期开始，并贯穿全过程定期更新</b>，因为干系人及其影响力会动态变化。"},

  {id:16, area:"计算题", q:"某项目 PV=100，EV=90，AC=110（单位：万元），则 CPI 与 SPI 分别为？", options:["0.82，0.90","1.22，1.10","0.90，0.82","1.10，1.22"], answer:0,
   tip:"CPI=EV/AC（成本效），SPI=EV/PV（进度效）。",
   explain:"CPI=EV/AC=90/110≈<b>0.82</b>（<1 成本超支）；SPI=EV/PV=90/100=<b>0.90</b>（<1 进度落后）。"},
  {id:17, area:"计算题", q:"关键路径的主要特点是？", options:["总时差最小（为0）","自由时差最大","工期最短的一条路径","资源消耗最少"], answer:0,
   tip:"关键路，时差零，拖一天全延误。",
   explain:"关键路径上活动<b>总时差最小（通常为0）</b>，任意活动延误都会导致项目总工期延误。它是最长而非最短路径。"},
  {id:18, area:"计算题", q:"静态投资回收期是指？", options:["净收益抵偿全部投资所需时间","考虑资金时间价值的回收期","内部收益率","现值指数"], answer:0,
   tip:"回收期，回本快，静态不看折现。",
   explain:"<b>静态投资回收期</b>是不考虑折现时，用项目净收益收回全部投资所需时间，越短越好但不反映盈利总量。"},
  {id:19, area:"计算题", q:"三点估算期望工期 te=(O+4M+P)/6 中，M 表示？", options:["最乐观时间","最有可能时间","最悲观时间","平均值"], answer:1,
   tip:"O乐 M可 P悲，4倍最可能。",
   explain:"三点估算中 O=最乐观、M=<b>最有可能</b>、P=最悲观，期望 te=(O+4M+P)/6 给最可能时间最高权重。"},
  {id:20, area:"计算题", q:"下列属于一致性成本（预防/评估）的是？", options:["返工","保修","召回","测试与评审"], answer:3,
   tip:"一致：先防后检；失败：返修召。",
   explain:"<b>一致性成本</b>包括预防成本（培训、流程）和评估成本（测试、评审）。返工、保修、召回属<b>非一致性（失败）成本</b>。"},

  {id:21, area:"软工与质量", q:"基线配置项的变更通常需要经哪个机构批准？", options:["任何开发人员","CCB（变更控制委员会）","项目经理口头同意","测试人员"], answer:1,
   tip:"基线动，CCB 点头。",
   explain:"基线（受控的配置项）变更须经<b>CCB</b>审批，确保变更受控、可追溯，不能个人随意修改。"},
  {id:22, area:"软工与质量", q:"整体变更控制流程的第一步是？", options:["变更实施","提交变更申请","变更评审","变更验证"], answer:1,
   tip:"变更先申请，评审再实施。",
   explain:"变更流程：<b>提出变更申请</b>→评审（CCB）→实施→验证→纳入配置库。先有书面申请才谈得上评审。"},
  {id:23, area:"软工与质量", q:"定性风险分析的典型输出是？", options:["概率影响矩阵","定量分析结果","风险应对计划","储备分析"], answer:0,
   tip:"定性排矩阵，定量算数值。",
   explain:"<b>定性风险分析</b>输出概率影响矩阵、风险等级，用于优先级排序；定量分析才做期望值、模拟等数值计算。"},
  {id:24, area:"软工与质量", q:"CMMI 成熟度模型中，“已管理级”是第几级？", options:["1级","2级","3级","4级"], answer:1,
   tip:"CMMI五级：初(1)管(2)定(3)量(4)优(5)。",
   explain:"CMMI：1初始级、<b>2已管理级</b>、3已定义级、4量化管理级、5优化级。已管理级强调过程受监督、可追溯。"},
  {id:25, area:"软工与质量", q:"当需求不明确、需快速交付原型验证时，最适合的生命周期模型是？", options:["瀑布模型","螺旋模型","原型/敏捷模型","V模型"], answer:2,
   tip:"需求不清用敏捷，原型试错快交付。",
   explain:"<b>原型/敏捷模型</b>适合需求模糊场景，通过快速迭代和可见原型逐步澄清需求，降低风险。"},

  {id:26, area:"信息安全", q:"信息安全等级保护中，第几级指“信息系统受破坏会对社会秩序和公共利益造成严重损害”？", options:["第二级","第三级","第四级","第五级"], answer:1,
   tip:"等保三级：严重损公益；四级：特别严重。",
   explain:"等保<b>第三级</b>：损害社会秩序和公共利益<b>严重</b>；第四级为“特别严重”。二级是“一般损害”，五级是“特别严重的国家安全损害”。"}
];

/* 关卡定义（单一事实源） */
const LEVELS = [
  {id:1, icon:"⚖", name:"法规守门人", desc:"招投标·合同·著作权，法规是送分也是送命题。", qids:[1,2,3,4,5]},
  {id:2, icon:"🛰", name:"新技术先锋", desc:"云大物区智，新一代IT高频考点。", qids:[6,7,8,9,10]},
  {id:3, icon:"🧭", name:"管理基石", desc:"五大过程组·十大领域·章程干系人。", qids:[11,12,13,14,15]},
  {id:4, icon:"🧮", name:"计算之王", desc:"挣值·关键路径·回收期·三点估算。", qids:[16,17,18,19,20]},
  {id:5, icon:"🔧", name:"工程与质量", desc:"配置·变更·风险·CMMI·生命周期。", qids:[21,22,23,24,25]},
  {id:6, icon:"👑", name:"综合突围 BOSS", desc:"跨领域随机10题，全对才算通关！", boss:true, qids:"random"}
];

/* 段位 */
const RANKS = [
  {min:0,   title:"青铜", name:"青铜考生"},
  {min:200, title:"白银", name:"白银考生"},
  {min:500, title:"黄金", name:"黄金考生"},
  {min:1000,title:"铂金", name:"铂金考生"},
  {min:2000,title:"钻石", name:"钻石考生"},
  {min:4000,title:"王者", name:"软考王者"}
];
function rankOf(score){
  let r=RANKS[0];
  for(const x of RANKS){ if(score>=x.min) r=x; }
  const idx=RANKS.indexOf(r);
  const next=RANKS[idx+1];
  return {cur:r, next:next, pct: next? Math.min(100,((score-r.min)/(next.min-r.min))*100):100};
}

/* 徽章定义 */
const BADGES = [
  {id:"firstClear", icon:"🥇", name:"初战告捷", desc:"首次通关任意关卡"},
  {id:"threeStar",  icon:"🎯", name:"神射手",   desc:"单关获得3星（全对）"},
  {id:"lawStar",    icon:"📜", name:"法规猎人", desc:"法规关3星通关"},
  {id:"mathStar",   icon:"🧮", name:"计算大神", desc:"计算关3星通关"},
  {id:"streak3",    icon:"🔥", name:"坚持星",   desc:"连续打卡≥3天"},
  {id:"clearWrong", icon:"💎", name:"错题清零", desc:"错题本清空"},
  {id:"king",       icon:"👑", name:"软考王者", desc:"积分达到4000"}
];

/* ============ 状态管理 ============ */
const defaultState={score:0, streak:0, lastCheckin:"", badges:{}, levelStars:{}, wrong:{}, masteryTotal:0, stats:{answered:0,right:0}};
let S=structuredClone(defaultState), execute, writes=Promise.resolve(), saveFailed=false;
function failStorage(){ saveFailed=true; document.querySelector("#app").inert=true; const n=document.createElement("div"); n.style.cssText="position:fixed;inset:0;background:#0f1424;z-index:100;display:grid;place-items:center;padding:24px;text-align:center;color:white"; n.textContent="云端数据连接或保存失败，结果可能尚未确认。请刷新后检查进度。"; document.body.appendChild(n); }
function save(){ const value=JSON.stringify(S); writes=writes.then(async()=>{if(!saveFailed) await execute("INSERT INTO progress (id, state) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET state=excluded.state",[{type:"text",value}]);}).catch(failStorage); }
async function initialize(){
 document.querySelector("#app").inert=true;
 try { const auth=window.tiana?.auth; if(typeof auth?.getAccessToken!=="function" || typeof window.tiana?.connection!=="function") throw Error("运行时未就绪");
 const c=await window.tiana.connection(); if(c.sql_api!=="hrana-v3") throw Error("不支持的数据库协议");
 const f=createTianaFetch({origin:c.origin,auth,requestBodyMode:"buffered"});
 execute=async(sql,args=[])=>{const r=await f(`${c.origin}/v3/pipeline`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({requests:[{type:"execute",stmt:{sql,args,want_rows:true}},{type:"close"}]})}); if(!r.ok) throw Error("数据库请求失败"); const b=await r.json(),v=b.results?.[0]; if(v?.type!=="ok" || v.response?.type!=="execute") throw Error("数据库执行失败"); return v.response.result;};
 const result=await execute("SELECT state FROM progress WHERE id = 1"); if(result.rows?.length) S=Object.assign(structuredClone(defaultState),JSON.parse(result.rows[0][0].value)); refreshTop(); renderHome(); document.querySelector("#app").inert=false;
 } catch(e){failStorage();}
}

/* ============ 渲染通用 ============ */
const $=s=>document.querySelector(s);
function starStr(n){ let s=""; for(let i=0;i<3;i++) s+= i<n?"★":"☆"; return s; }
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),1600); }

function refreshTop(){
  const r=rankOf(S.score);
  $("#avatar").textContent="Lv"+(RANKS.indexOf(r.cur)+1);
  $("#lvName").textContent=r.cur.name;
  $("#lvTitle").textContent=r.cur.title;
  $("#scoreNum").textContent=S.score;
  $("#scoreText").textContent=S.score;
  $("#lvFill").style.width=r.pct+"%";
}
function renderHome(){
  // 打卡
  const today=dateStr(new Date());
  const cb=$("#streakBox");
  if(S.streak>0){ cb.style.display="flex"; $("#streakText").textContent="连续 "+S.streak+" 天"; }
  else cb.style.display="none";
  const btn=$("#checkinBtn");
  if(S.lastCheckin===today){ btn.disabled=true; btn.textContent="今日已签到 ✓"; }
  else { btn.disabled=false; btn.textContent="今日签到 +20 积分"; }
  // 关卡
  const grid=$("#levelGrid"); grid.innerHTML="";
  LEVELS.forEach(lv=>{
    const stars=S.levelStars[lv.id]||0;
    const cleared=stars>0;
    const el=document.createElement("div");
    el.className="level"+(lv.boss?" boss":"");
    el.innerHTML=`<div class="ico">${lv.icon}</div>
      <div class="ln">${lv.name}</div>
      <div class="ld">${lv.desc}</div>
      <div class="stars">${starStr(stars).replace(/☆/g,'<span class="off">☆</span>')}</div>
      ${cleared?'<div class="badge-done">已通关</div>':''}`;
    el.onclick=()=>startLevel(lv.id);
    grid.appendChild(el);
  });
}
function dateStr(d){ return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
function isYesterday(last){ if(!last) return false; const y=new Date(); y.setDate(y.getDate()-1); return dateStr(y)===last; }

function doCheckin(){
  const today=dateStr(new Date());
  if(S.lastCheckin===today) return;
  if(isYesterday(S.lastCheckin)) S.streak+=1; else S.streak=1;
  S.lastCheckin=today;
  S.score+=20;
  if(S.streak>=3) unlock("streak3");
  save(); refreshTop(); renderHome();
  toast("签到成功 +20 积分，连续 "+S.streak+" 天 🔥");
}

/* ============ 闯关 ============ */
let QS=null; // 当前答题会话
function startLevel(id){
  locked=false;
  const lv=LEVELS.find(x=>x.id===id);
  let qids;
  if(lv.qids==="random"){
    const pool=QUESTIONS.map(q=>q.id);
    for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    qids=pool.slice(0,10);
  } else qids=lv.qids.slice();
  QS={lv, qids, idx:0, right:0, combo:0, maxCombo:0, answered:0, lvId:id};
  showView("quiz");
  renderQuestion();
}
function curQ(){ return QUESTIONS.find(q=>q.id===QS.qids[QS.idx]); }
function renderQuestion(){
  const q=curQ();
  $("#qArea").textContent=q.area;
  $("#qText").textContent=(QS.idx+1)+". "+q.q;
  const optWrap=$("#qOptions"); optWrap.innerHTML="";
  const letters=["A","B","C","D"];
  q.options.forEach((opt,i)=>{
    const el=document.createElement("div");
    el.className="opt"; el.dataset.i=i;
    el.innerHTML=`<span class="tag">${letters[i]}</span><span>${opt}</span>`;
    el.onclick=()=>choose(i,el);
    optWrap.appendChild(el);
  });
  $("#feedback").classList.remove("show");
  const total=QS.qids.length;
  $("#quizProgFill").style.width=((QS.idx)/total*100)+"%";
  $("#comboText").textContent="连对 "+QS.combo;
}
let locked=false;
function choose(i,el){
  if(locked) return; locked=true;
  const q=curQ();
  const opts=[...document.querySelectorAll("#qOptions .opt")];
  opts.forEach(o=>o.onclick=null);
  const correct=(i===q.answer);
  if(correct){ el.classList.add("right"); QS.right++; QS.combo++; QS.maxCombo=Math.max(QS.maxCombo,QS.combo); }
  else{
    el.classList.add("wrong");
    opts[q.answer].classList.add("right");
    QS.combo=0;
    // 记入错题本
    const w=S.wrong[q.id]||{wrong:0,mastery:0}; w.wrong++; S.wrong[q.id]=w;
  }
  QS.answered++;
  S.stats.answered++; if(correct) S.stats.right++;
  // 连对额外积分
  let gain=10;
  if(correct && QS.combo>=2){ gain+=5; popCombo(); }
  S.score+=gain;
  save(); refreshTop();
  // 反馈
  const v=$("#verdict");
  v.className="verdict "+(correct?"ok":"no");
  v.innerHTML=(correct?"✓ 回答正确":"✗ 回答错误")+(correct?("  +"+gain+" 积分"):"");
  $("#tipbox").innerHTML=`<span class="t1">记忆点</span>${q.tip}`;
  $("#explain").innerHTML="<b>解析：</b>"+q.explain;
  $("#nextBtn").textContent=(QS.idx+1>=QS.qids.length)?"查看战果 →":"下一题 →";
  $("#feedback").classList.add("show");
}
function popCombo(){
  const p=$("#comboPop"); p.textContent="连对!+5"; p.classList.remove("go"); void p.offsetWidth; p.classList.add("go");
}
function nextQuestion(){
  locked=false;
  if(QS.idx+1>=QS.qids.length){ finishLevel(); return; }
  QS.idx++;
  renderQuestion();
}
function finishLevel(){
  const total=QS.qids.length;
  const stars= QS.right===total?3 : (QS.right>=total-2?2:1);
  const lv=QS.lv;
  // 通关奖励
  let bonus=0;
  if(stars>=1){ bonus=50; S.score+=bonus; }
  const prev=S.levelStars[lv.id]||0;
  if(stars>prev) S.levelStars[lv.id]=stars;
  // 徽章
  unlock("firstClear");
  if(stars===3){ unlock("threeStar"); if(lv.id===1) unlock("lawStar"); if(lv.id===4) unlock("mathStar"); }
  if(S.score>=4000) unlock("king");
  // 错题清零检查
  if(Object.keys(S.wrong).length===0) unlock("clearWrong");
  save(); refreshTop(); renderHome();
  // 结果弹窗
  const rc=$("#resultCard");
  rc.innerHTML=`<h2>${stars===3?"完美通关!":(stars===2?"通关!":"闯关结束")}</h2>
    <div class="bigstars">${starStr(stars).replace(/☆/g,'<span class="off">☆</span>')}</div>
    <div class="rstat">答对 <b>${QS.right}</b> / ${total} 题<br>最高连对 <b>${QS.maxCombo}</b> 题<br>通关奖励 <b>+${bonus}</b> 积分</div>
    <button class="btn" id="rAgain">再来一次</button>
    <button class="btn ghost" id="rHome" style="margin-top:10px;">返回关卡地图</button>`;
  $("#mask").classList.add("show");
  $("#rAgain").onclick=()=>{ $("#mask").classList.remove("show"); startLevel(lv.id); };
  $("#rHome").onclick=()=>{ $("#mask").classList.remove("show"); showView("home"); };
}

/* ============ 错题本 ============ */
function renderWrong(){
  const ids=Object.keys(S.wrong);
  let times=0, mastery=0;
  ids.forEach(id=>{ times+=S.wrong[id].wrong; mastery+=S.wrong[id].mastery; });
  $("#wrongCount").textContent=ids.length;
  $("#wrongTimes").textContent=times;
  $("#masteryCount").textContent=S.masteryTotal;
  const list=$("#wrongList");
  if(ids.length===0){
    list.innerHTML=`<div class="empty"><div class="e">✓</div>错题本空空如也<br>答错会自动出现在这里，去闯关吧！</div>`;
    return;
  }
  // 按错误次数降序
  ids.sort((a,b)=>S.wrong[b].wrong-S.wrong[a].wrong);
  list.innerHTML="";
  ids.forEach(id=>{
    const q=QUESTIONS.find(x=>x.id==id); const w=S.wrong[id];
    const el=document.createElement("div"); el.className="witem";
    el.innerHTML=`<div class="wt">${q.q}</div>
      <div class="wm"><span class="pill">错 ${w.wrong} 次</span>
      <span class="pill m">已掌握 ${w.mastery}/3</span>
      <span style="margin-left:auto;color:var(--main2);">${q.area}</span></div>`;
    list.appendChild(el);
  });
}
function practiceWrong(){
  locked=false;
  const ids=Object.keys(S.wrong);
  if(ids.length===0){ toast("暂无错题可练"); return; }
  // 随机抽取一道错题练习（用答题页复用，单题模式）
  const id=ids[Math.floor(Math.random()*ids.length)];
  QS={lv:{name:"错题重练"}, qids:[parseInt(id)], idx:0, right:0, combo:0, maxCombo:0, answered:0, lvId:0, practice:true};
  showView("quiz"); renderQuestion();
}
/* 错题重练答对后，增加 mastery，满3移除 */
function afterPracticeRight(qid){
  const w=S.wrong[qid]; if(!w) return;
  w.mastery++; S.masteryTotal++;
  if(w.mastery>=3){ delete S.wrong[qid]; if(Object.keys(S.wrong).length===0) unlock("clearWrong"); }
  save();
}

/* ============ 成就 ============ */
function renderAch(){
  const r=rankOf(S.score);
  $("#achLvName").textContent=r.cur.title+" Lv"+(RANKS.indexOf(r.cur)+1);
  $("#achScore").textContent=S.score;
  $("#achNext").textContent= r.next? ("距【"+r.next.title+"】还需 "+(r.next.min-S.score)+" 积分") : "已达最高段位！";
  $("#achFill").style.width=r.pct+"%";
  const wall=$("#badgeWall"); wall.innerHTML="";
  BADGES.forEach(b=>{
    const got=!!S.badges[b.id];
    const el=document.createElement("div"); el.className="badge"+(got?"":" locked");
    el.innerHTML=`<div class="bi">${b.icon}</div><div class="bn">${b.name}</div><div class="bd">${b.desc}</div>`;
    wall.appendChild(el);
  });
  $("#statAnswered").textContent=S.stats.answered;
  $("#statRight").textContent=S.stats.right;
  $("#statRate").textContent=(S.stats.answered? Math.round(S.stats.right/S.stats.answered*100):0)+"%";
}
function unlock(id){
  if(S.badges[id]) return;
  S.badges[id]=true; save();
  const b=BADGES.find(x=>x.id===id);
  if(b) toast("🎉 解锁徽章："+b.name);
}

/* ============ 视图切换 ============ */
function showView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  $("#view-"+name).classList.add("active");
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.view===name));
  if(name==="home") renderHome();
  if(name==="wrong") renderWrong();
  if(name==="ach") renderAch();
}

/* ============ 绑定 ============ */
$("#checkinBtn").onclick=doCheckin;
$("#quizBack").onclick=()=>{ locked=false; showView("home"); };
$("#nextBtn").onclick=()=>{
  if(QS && QS.practice){
    // 练习模式：答对处理 mastery 后回错题本
    const q=curQ();
    if($("#verdict").classList.contains("ok")) afterPracticeRight(q.id);
    locked=false; showView("wrong"); return;
  }
  nextQuestion();
};
$("#practiceBtn").onclick=practiceWrong;
document.querySelectorAll(".tab").forEach(t=> t.onclick=()=>showView(t.dataset.view));

/* 启动 */
initialize();
