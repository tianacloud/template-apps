import { createTianaFetch } from '@tianacloud/serverless';
document.head.insertAdjacentHTML("beforeend", "<style>\n:root{\n  --bg:#f4f6f5; --card:#fff; --line:#e3e7e5; --ink:#1b2422; --ink2:#5d6b67; --ink3:#93a19d;\n  --brand:#2f6f52; --brand-l:#e6f1eb; --warn:#c9762a; --bad:#c0453d;\n  --pro:#2f6f52; --kcal:#c9762a; --fat:#7b62b8; --carb:#3f7fa8; --fiber:#6b8e3d;\n  --r:14px;\n}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{margin:0;padding:0}\nbody{\n  background:var(--bg);color:var(--ink);\n  font:15px/1.55 -apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n  padding-bottom:64px;\n}\n.hidden{display:none!important}\nbutton{font:inherit;cursor:pointer;border:0;background:none;color:inherit}\ninput,select{font:inherit;color:inherit}\n\n/* ---------- 引导 ---------- */\n.onboard{max-width:560px;margin:0 auto;padding:26px 18px 40px}\n.ob-logo{font-size:29px;font-weight:800;letter-spacing:-.5px;margin:4px 0 4px}\n.ob-logo span{color:var(--brand)}\n.ob-sub{color:var(--ink2);font-size:13.5px;margin-bottom:20px}\n.steps{display:flex;gap:6px;margin-bottom:18px}\n.steps i{flex:1;height:3px;border-radius:2px;background:#dfe5e2;font-style:normal}\n.steps i.on{background:var(--brand)}\n.ob-panel{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:16px;margin-bottom:13px}\n.ob-panel h3{margin:0 0 13px;font-size:15px;font-weight:800}\n.field{margin-bottom:11px}\n.field:last-child{margin-bottom:0}\n.field label{display:block;font-size:12.5px;color:var(--ink2);margin-bottom:5px}\n.field input,.field select{\n  width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:10px;\n  background:#fbfcfb;font-size:15px;outline:none\n}\n.field input:focus,.field select:focus{border-color:var(--brand);background:#fff}\n.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}\n.seg{display:flex;gap:7px}\n.seg button{\n  flex:1;padding:10px;border:1px solid var(--line);border-radius:10px;background:#fbfcfb;\n  font-size:13.5px;color:var(--ink2)\n}\n.seg button.on{background:var(--brand);border-color:var(--brand);color:#fff;font-weight:600}\n.btn{\n  width:100%;padding:14px;border-radius:12px;background:var(--brand);color:#fff;\n  font-size:16px;font-weight:700\n}\n.btn:active{opacity:.86}\n.btn.ghost{background:#fff;border:1px solid var(--line);color:var(--ink);font-weight:600}\n.btn.sm{padding:11px;font-size:14px}\n\n/* 预估卡 */\n.forecast{background:linear-gradient(160deg,#2f6f52,#255840);border-radius:var(--r);padding:17px;color:#fff;margin:14px 0}\n.fc-t{font-size:12.5px;opacity:.82;margin-bottom:6px}\n.fc-big{font-size:27px;font-weight:800;letter-spacing:-.8px;line-height:1.2}\n.fc-big em{font-style:normal;font-size:14px;font-weight:600;opacity:.88}\n.fc-note{font-size:12px;opacity:.85;margin-top:7px;line-height:1.6}\n.fc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:13px}\n.fc-cell{background:rgba(255,255,255,.15);border-radius:9px;padding:9px 10px}\n.fc-cell b{display:block;font-size:15px}\n.fc-cell span{font-size:10.5px;opacity:.85}\n/* 速度三档 */\n.pace-list{display:flex;flex-direction:column;gap:8px;margin:14px 0 4px}\n.pace{\n  display:flex;align-items:center;gap:10px;padding:12px 13px;border:1.5px solid var(--line);\n  border-radius:11px;background:#fbfcfb;text-align:left;transition:.15s\n}\n.pace.on{border-color:var(--brand);background:var(--brand-l)}\n.pace .pc-l{flex:1;min-width:0}\n.pace .pc-l b{font-size:14px;display:block;line-height:1.3}\n.pace .pc-l b em{font-style:normal;font-size:11px;color:var(--ink3);font-weight:600;margin-left:5px}\n.pace .pc-l span{font-size:11.5px;color:var(--ink2);display:block;margin-top:2px}\n.pace .pc-r{text-align:right;flex:none}\n.pace .pc-r b{font-size:14px;color:var(--brand);display:block;line-height:1.3}\n.pace .pc-r span{font-size:11px;color:var(--ink3)}\n.pace .pc-chk{width:18px;height:18px;border-radius:50%;border:1.5px solid #cfd6d3;flex:none;display:grid;place-items:center;font-size:11px;color:transparent}\n.pace.on .pc-chk{background:var(--brand);border-color:var(--brand);color:#fff}\n.pv-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}\n.pv-item{background:var(--brand-l);border-radius:9px;padding:9px 11px}\n.pv-item b{display:block;font-size:19px;letter-spacing:-.5px;color:var(--brand)}\n.pv-item span{font-size:11px;color:var(--ink3)}\n\n/* 动作选择 */\n.exgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}\n.ex{\n  border:1.5px solid var(--line);border-radius:11px;padding:10px 11px;background:#fbfcfb;\n  text-align:left;transition:.15s\n}\n.ex.on{border-color:var(--brand);background:var(--brand-l)}\n.ex .en{font-size:13.5px;font-weight:700;line-height:1.3}\n.ex .ep{font-size:11px;color:var(--ink3);margin-top:2px}\n.ex .es{font-size:11px;color:var(--ink2);margin-top:4px}\n.extabs{display:flex;gap:7px;margin-bottom:4px}\n.extabs button{flex:1;padding:9px;border:1px solid var(--line);border-radius:9px;background:#fbfcfb;font-size:13.5px;color:var(--ink2)}\n.extabs button.on{background:var(--brand);border-color:var(--brand);color:#fff;font-weight:700}\n.ex .eb{font-size:10.5px;color:var(--ink2);margin-top:5px;line-height:1.45}\n.selbar{\n  position:sticky;bottom:70px;background:rgba(255,255,255,.96);backdrop-filter:blur(8px);\n  border:1px solid var(--line);border-radius:12px;padding:11px 14px;margin-top:12px;\n  display:flex;align-items:center;justify-content:space-between;font-size:13px\n}\n.selbar b{color:var(--brand);font-size:15px}\n\n/* 冰箱录入 */\n.mini-form{display:grid;grid-template-columns:1.4fr 1fr;gap:8px;margin-bottom:8px}\n.mini-form input,.mini-form select{padding:10px 11px;border:1px solid var(--line);border-radius:9px;background:#fbfcfb;font-size:14px}\n.mini-form button{padding:10px;border-radius:9px;background:var(--brand);color:#fff;font-weight:700;font-size:14px}\n.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}\n.chip{\n  background:#eef2f0;border-radius:20px;padding:6px 11px;font-size:12px;color:var(--ink2);\n  display:flex;align-items:center;gap:6px\n}\n.chip b{color:var(--ink);font-weight:700}\n.chip button{color:var(--ink3);font-size:14px;line-height:1}\n\n/* ---------- 应用 ---------- */\nheader{\n  position:sticky;top:0;z-index:20;background:rgba(244,246,245,.95);\n  backdrop-filter:blur(10px);border-bottom:1px solid var(--line);padding:11px 16px 9px\n}\n.hd-top{display:flex;align-items:baseline;justify-content:space-between}\n.hd-top h1{margin:0;font-size:17px;font-weight:800;letter-spacing:-.3px}\n.hd-top h1 span{color:var(--brand)}\n.hd-date{font-size:11.5px;color:var(--ink3)}\nmain{max-width:640px;margin:0 auto;padding:14px 14px 20px}\n.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:15px;margin-bottom:12px}\n.card-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}\n.card-h h2{margin:0;font-size:14px;font-weight:800}\n.card-h .sub{font-size:11.5px;color:var(--ink3)}\n.hint{font-size:12px;color:var(--ink3);line-height:1.65}\n\n.statgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}\n.stat{background:#fbfcfb;border:1px solid var(--line);border-radius:10px;padding:10px 12px}\n.stat b{display:block;font-size:19px;font-weight:800;letter-spacing:-.5px;color:var(--ink)}\n.stat span{font-size:11px;color:var(--ink3)}\n.bar{margin-bottom:11px}\n.bar:last-child{margin-bottom:0}\n.bar-t{display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px}\n.bar-t b{font-size:12.5px;font-weight:700}\n.bar-t span{color:var(--ink3)}\n.track{height:7px;border-radius:4px;background:#eef1ef;overflow:hidden}\n.fill{height:100%;border-radius:4px;transition:width .35s ease}\n.fill.p{background:var(--pro)} .fill.k{background:var(--kcal)}\n.fill.f{background:var(--fat)} .fill.c{background:var(--carb)} .fill.fb{background:var(--fiber)}\n.fill.over{background:var(--bad)}\n\n/* 餐单 */\n.meal{border:1px solid var(--line);border-radius:11px;padding:12px;margin-bottom:9px;background:#fbfcfb}\n.meal:last-child{margin-bottom:0}\n.meal-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:9px}\n.meal-h b{font-size:13.5px}\n.meal-h span{font-size:11.5px;color:var(--ink3)}\n.meal li{font-size:13px;margin:0 0 5px;padding-left:2px;list-style:none;color:var(--ink)}\n.meal li em{font-style:normal;color:var(--ink3);font-size:11.5px}\n.meal ul{margin:0;padding:0}\n.meal .sum{font-size:11.5px;color:var(--brand);margin-top:8px;padding-top:8px;border-top:1px dashed var(--line);font-weight:600}\n\n/* 食材网格 */\n.grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}\n.food{border:1px solid var(--line);border-radius:11px;padding:11px;background:#fbfcfb;position:relative}\n.food.out{opacity:.45}\n.food .fn{font-size:13.5px;font-weight:700;margin-bottom:3px;line-height:1.25}\n.food .fm{font-size:11.5px;color:var(--ink3);margin-bottom:8px}\n.food .fp{font-size:11px;color:var(--ink2);margin-bottom:8px;line-height:1.4}\n.egrow{display:flex;gap:10px;padding:8px 0;border-bottom:1px dashed var(--line);font-size:12.5px;align-items:baseline}\n.egrow:last-of-type{border-bottom:0}\n.egrow b{flex:none;width:60px;font-size:13px}\n.egrow span{color:var(--ink2);line-height:1.6}\n.egrow em{font-style:normal;color:var(--brand);font-weight:700}\n.fhead{display:flex;align-items:flex-start;justify-content:space-between;gap:6px;margin-bottom:4px}\n.stock{text-align:center;flex:1;line-height:1.1}\n.stock b{font-size:19px;font-weight:800;color:var(--brand);letter-spacing:-.5px}\n.stock span{font-size:9.5px;color:var(--ink3);margin-left:2px;display:block}\n.stockrow{display:flex;align-items:center;gap:6px;margin-top:9px}\n.stockrow button{width:34px;height:32px;border-radius:9px;background:var(--brand-l);color:var(--brand);font-size:16px;font-weight:700;flex:none}\n.stockrow button:last-child{background:#f1f4f2;color:var(--ink2)}\n.stockrow button:active{opacity:.75}\n.editbtn{width:100%;margin-top:7px;padding:5px 0;border-radius:8px;background:#f7f9f8;color:var(--ink3);font-size:11px}\n.qgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:280px;overflow-y:auto}\n.qitem{border:1px solid var(--line);border-radius:10px;padding:13px 12px;background:#fbfcfb;display:flex;align-items:center;justify-content:space-between;font-size:14px}\n.qitem .qc{width:24px;height:24px;border-radius:50%;background:#eef2f0;color:var(--ink2);display:grid;place-items:center;font-size:13px;font-weight:700}\n.qitem.on{border-color:var(--brand);background:var(--brand-l)}\n.qitem.on .qc{background:var(--brand);color:#fff}\n.waterbtns{display:flex;gap:7px;margin-top:11px}\n.waterbtns button{flex:1;padding:9px 0;border-radius:9px;background:var(--brand-l);color:var(--brand);font-size:13px;font-weight:700}\n.waterbtns button.minus{background:#f1f4f2;color:var(--ink2);flex:none;width:44px}\n.food .fa{display:flex;gap:6px}\n.food .fa button{flex:1;padding:7px 0;border-radius:8px;background:var(--brand-l);color:var(--brand);font-size:12.5px;font-weight:700}\n.food .fa button.sec{background:#f1f4f2;color:var(--ink2);flex:none;width:34px}\n.tag-cat{position:absolute;top:9px;right:9px;font-size:9.5px;color:var(--ink3)}\n\n.logitem{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px dashed var(--line)}\n.logitem:last-child{border-bottom:0}\n.logitem .ln{flex:1;font-size:13px;min-width:0}\n.logitem .ln em{font-style:normal;color:var(--ink3);font-size:11.5px;display:block}\n.logitem .lk{font-size:12px;color:var(--ink2);text-align:right;white-space:nowrap}\n.logitem .del{color:var(--ink3);font-size:16px;padding:0 2px}\n.empty{text-align:center;color:var(--ink3);font-size:13px;padding:20px 10px;line-height:1.7}\n\n.exrow{display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px dashed var(--line)}\n.exrow:last-child{border-bottom:0}\n.chk{width:23px;height:23px;border-radius:7px;border:1.5px solid #cfd6d3;flex:none;display:grid;place-items:center;font-size:13px;color:transparent;background:#fff}\n.chk.on{background:var(--brand);border-color:var(--brand);color:#fff}\n.exrow .exn{flex:1;font-size:13.5px}\n.exrow .exn em{font-style:normal;display:block;font-size:11.5px;color:var(--ink3)}\n.exrow.done .exn{color:var(--ink3);text-decoration:line-through}\n\n.chatbox{border:1px solid var(--line);border-radius:12px;background:#fbfcfb;padding:11px;margin-bottom:9px}\n.chatlog{max-height:210px;overflow-y:auto;margin-bottom:9px}\n.msg{font-size:13px;line-height:1.6;margin-bottom:9px;display:flex}\n.msg.me{justify-content:flex-end}\n.msg .bub{max-width:82%;padding:9px 12px;border-radius:12px;background:#eef2f0;white-space:pre-wrap}\n.msg.me .bub{background:var(--brand);color:#fff}\n.chat-in{display:flex;gap:7px}\n.chat-in input{flex:1;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:#fff;font-size:14px}\n.chat-in button{padding:0 15px;border-radius:10px;background:var(--brand);color:#fff;font-weight:700;font-size:14px}\n.quick{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px}\n.quick button{background:#fff;border:1px solid var(--line);border-radius:16px;padding:6px 11px;font-size:12px;color:var(--ink2)}\n\n.mrow{display:flex;gap:9px;margin-bottom:10px}\n.mrow input{flex:1;padding:10px 11px;border:1px solid var(--line);border-radius:9px;background:#fbfcfb;font-size:14px}\n.mrow button{padding:0 16px;border-radius:9px;background:var(--brand);color:#fff;font-weight:700;font-size:14px}\n.chart{display:flex;align-items:flex-end;gap:7px;height:96px;padding:8px 2px 0;overflow-x:auto}\n.ct-bar{flex:none;width:36px;display:flex;flex-direction:column;align-items:center;gap:5px}\n.ct-bar .bar2{width:100%;min-height:3px;display:flex;align-items:flex-end;justify-content:center}\n.ct-bar .bar2 i{display:block;width:100%;background:var(--brand);border-radius:5px 5px 2px 2px}\n.ct-bar b{font-size:10px;color:var(--ink2);font-weight:700}\n.ct-bar span{font-size:9.5px;color:var(--ink3)}\n.mlist{margin-top:10px}\n.mitem{display:flex;justify-content:space-between;font-size:12.5px;padding:7px 0;border-bottom:1px dashed var(--line);color:var(--ink2)}\n.mitem:last-child{border:0}\n\n.setrow{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px dashed var(--line);font-size:13.5px}\n.setrow:last-child{border:0}\n.setrow span{color:var(--ink2)}\n.danger{color:var(--bad);font-weight:700;font-size:13.5px}\n\n.modal{position:fixed;inset:0;background:rgba(20,28,25,.42);z-index:200;display:flex;align-items:flex-end;justify-content:center}\n.modal .sheet{background:#fff;width:100%;max-width:520px;border-radius:18px 18px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom));animation:sheetup .22s ease}\n@keyframes sheetup{from{transform:translateY(24px);opacity:.5}to{transform:none;opacity:1}}\n.modal h3{margin:0 0 13px;font-size:16px;font-weight:800}\n.modal .field{margin-bottom:11px}\n.modal .field label{display:block;font-size:12.5px;color:var(--ink2);margin-bottom:5px}\n.modal .field input{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:#fbfcfb;font-size:15px;outline:none}\n.modal .field input:focus{border-color:var(--brand);background:#fff}\n.modal .info{background:var(--brand-l);border-radius:9px;padding:9px 11px;font-size:12.5px;color:var(--brand);margin-bottom:12px;line-height:1.6}\n.modal .btns{display:flex;gap:9px;margin-top:15px}\n.modal .btns button{flex:1;padding:13px;border-radius:11px;font-size:15px;font-weight:700}\n.modal .btns .ok{background:var(--brand);color:#fff}\n.modal .btns .cancel{background:#f1f4f2;color:var(--ink2)}\n.modal .btns .del{background:#fdf0ef;color:var(--bad);flex:none;width:64px}\n.tabbar{\n  position:fixed;bottom:0;left:0;right:0;z-index:30;background:rgba(255,255,255,.97);\n  backdrop-filter:blur(12px);border-top:1px solid var(--line);display:flex;\n  padding:6px 0 max(6px,env(safe-area-inset-bottom))\n}\n.tabbar button{flex:1;padding:6px 0 4px;display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--ink3);font-size:10.5px}\n.tabbar button .ic{font-size:18px;line-height:1}\n.tabbar button.on{color:var(--brand);font-weight:700}\n@media(max-width:360px){.grid,.exgrid{grid-template-columns:1fr}}\n</style>");
document.getElementById("app").outerHTML = "\n\n<!-- ================= 引导 ================= -->\n<div id=\"onboard\" class=\"onboard\">\n  <div class=\"ob-logo\">薄肌<span>笔记</span></div>\n  <div class=\"ob-sub\">冰箱里有什么，今天该吃什么、练什么——一次算清。</div>\n  <div class=\"steps\" id=\"obSteps\"><i class=\"on\"></i><i></i><i></i></div>\n\n  <!-- 步骤 1：资料 -->\n  <div id=\"ob1\">\n    <div class=\"ob-panel\">\n      <h3>先认识一下</h3>\n      <div class=\"field\">\n        <div class=\"seg\" id=\"sexSeg\"><button data-v=\"m\" class=\"on\">男</button><button data-v=\"f\">女</button></div>\n      </div>\n      <div class=\"row2\">\n        <div class=\"field\"><label>年龄</label><input id=\"obAge\" type=\"number\" inputmode=\"numeric\"></div>\n        <div class=\"field\"><label>身高 cm</label><input id=\"obH\" type=\"number\" inputmode=\"decimal\"></div>\n      </div>\n      <div class=\"row2\">\n        <div class=\"field\"><label>体重 kg</label><input id=\"obW\" type=\"number\" inputmode=\"decimal\"></div>\n        <div class=\"field\"><label>想减到 kg（可选）</label><input id=\"obGoalW\" type=\"number\" inputmode=\"decimal\"></div>\n      </div>\n      <div class=\"field\">\n        <label>腰围 cm（可选，用来判断内脏脂肪）</label>\n        <input id=\"obWaist\" type=\"number\" inputmode=\"decimal\">\n      </div>\n      <div class=\"field\">\n        <div class=\"seg\" id=\"goalSeg\"><button data-v=\"cut\" class=\"on\">减脂</button><button data-v=\"keep\">维持</button><button data-v=\"bulk\">增肌</button></div>\n      </div>\n      <div class=\"field\">\n        <label>日常活动量</label>\n        <select id=\"obAct\">\n          <option value=\"1.2\">久坐 · 基本不动</option>\n          <option value=\"1.375\">轻度 · 每天走路/少量运动</option>\n          <option value=\"1.55\">中度 · 每周运动 3-5 次</option>\n          <option value=\"1.725\">高强度 · 每天训练</option>\n        </select>\n      </div>\n    </div>\n    <button class=\"btn\" id=\"obNext1\">算出我要怎么吃</button>\n  </div>\n\n  <!-- 步骤 2：预估 -->\n  <div id=\"ob2\" class=\"hidden\">\n    <div id=\"obForecast\"></div>\n    <div id=\"obTargets\"></div>\n    <button class=\"btn\" id=\"obNext2\">下一步：选训练动作</button>\n    <button class=\"btn ghost sm\" id=\"obBack1\" style=\"margin-top:9px\">返回修改</button>\n  </div>\n\n  <!-- 步骤 3：选动作 -->\n  <div id=\"ob3\" class=\"hidden\">\n    <div class=\"ob-panel\">\n      <h3>挑你愿意做的动作</h3>\n      <div class=\"extabs\" id=\"obExTabs\">\n        <button data-extab=\"home\" class=\"on\">居家训练</button>\n        <button data-extab=\"gym\">健身房训练</button>\n      </div>\n      <p class=\"hint\" style=\"margin:10px 0 11px\"><b>至少选 3 个</b>，4-6 个最好。每张卡都写了练它有什么用，看着不顺眼就换一批。</p>\n      <div class=\"exgrid\" id=\"obExGrid\"></div>\n      <button class=\"btn ghost sm\" id=\"obExMore\" style=\"margin-top:10px\">换一批看看 →</button>\n      <div class=\"hint\" id=\"obExPage\" style=\"text-align:center;margin-top:7px\"></div>\n    </div>\n    <div class=\"selbar\"><span>已选 <b id=\"obSelCnt\">0</b> 个</span><span class=\"hint\">建议 4-6 个</span></div>\n    <button class=\"btn\" id=\"obNext3\" style=\"margin-top:12px\">完成，开始用</button>\n  </div>\n<!-- /onboard -->\n</div>\n\n<!-- ================= 应用 ================= -->\n<div id=\"app\" class=\"app hidden\">\n  <header>\n    <div class=\"hd-top\">\n      <h1>薄肌<span>笔记</span></h1>\n      <div class=\"hd-date\" id=\"hdDate\"></div>\n    </div>\n  </header>\n  <main id=\"view\"></main>\n  <nav class=\"tabbar\" id=\"tabbar\">\n    <button data-tab=\"today\" class=\"on\"><span class=\"ic\">◎</span>今日</button>\n    <button data-tab=\"pantry\"><span class=\"ic\">▤</span>冰箱</button>\n    <button data-tab=\"train\"><span class=\"ic\">⚑</span>训练</button>\n    <button data-tab=\"record\"><span class=\"ic\">▦</span>记录</button>\n    <button data-tab=\"setting\"><span class=\"ic\">⚙</span>设置</button>\n  </nav>\n</div>\n\n";

/* =========================================================
   食材库（每 100g 可食部）
   ========================================================= */
const FOODS = [
  {id:'chicken', name:'鸡胸肉', cat:'pro', per:{pro:23, kcal:133, fat:5, carb:0, fiber:0}},
  {id:'egg', name:'鸡蛋', cat:'pro', per:{pro:13, kcal:143, fat:10, carb:1.5, fiber:0}},
  {id:'beef', name:'瘦牛肉', cat:'pro', per:{pro:20, kcal:125, fat:4, carb:0, fiber:0}},
  {id:'pork', name:'猪里脊', cat:'pro', per:{pro:20, kcal:155, fat:8, carb:0, fiber:0}},
  {id:'shrimp', name:'虾', cat:'pro', per:{pro:18, kcal:93, fat:1, carb:1, fiber:0}},
  {id:'salmon', name:'三文鱼', cat:'pro', per:{pro:20, kcal:208, fat:13, carb:0, fiber:0}},
  {id:'basa', name:'巴沙鱼', cat:'pro', per:{pro:15, kcal:90, fat:2, carb:0, fiber:0}},
  {id:'tofu', name:'北豆腐', cat:'pro', per:{pro:12, kcal:98, fat:5, carb:2, fiber:1}},
  {id:'tofu_s', name:'嫩豆腐', cat:'pro', per:{pro:6, kcal:57, fat:3, carb:2, fiber:0.5}},
  {id:'milk', name:'牛奶', cat:'pro', per:{pro:3.2, kcal:65, fat:3.7, carb:4.8, fiber:0}},
  {id:'yogurt', name:'无糖酸奶', cat:'pro', per:{pro:4, kcal:60, fat:3, carb:5, fiber:0}},
  {id:'greek', name:'希腊酸奶', cat:'pro', per:{pro:10, kcal:60, fat:0, carb:4.5, fiber:0}},
  {id:'whey', name:'蛋白粉', cat:'pro', per:{pro:80, kcal:380, fat:5, carb:8, fiber:0}},
  {id:'sardine', name:'沙丁鱼罐头', cat:'pro', per:{pro:20, kcal:200, fat:11, carb:0, fiber:0}},
  {id:'chickleg', name:'卤鸡腿', cat:'pro', per:{pro:18, kcal:130, fat:5, carb:0, fiber:0}},
  {id:'rice', name:'米饭(熟)', cat:'staple', per:{pro:2.6, kcal:116, fat:0.3, carb:26, fiber:0.3}},
  {id:'brown', name:'糙米饭(熟)', cat:'staple', per:{pro:2.7, kcal:112, fat:0.9, carb:24, fiber:1.6}},
  {id:'oat', name:'燕麦片', cat:'staple', per:{pro:12.2, kcal:412, fat:13.6, carb:54.7, fiber:10.4}},
  {id:'bread', name:'全麦面包', cat:'staple', per:{pro:9, kcal:250, fat:3, carb:45, fiber:6}},
  {id:'potato', name:'土豆', cat:'staple', per:{pro:2, kcal:79, fat:0.2, carb:17, fiber:1.8}},
  {id:'sweetp', name:'红薯', cat:'staple', per:{pro:1.6, kcal:86, fat:0.2, carb:20, fiber:3}},
  {id:'corn', name:'玉米', cat:'staple', per:{pro:3.4, kcal:86, fat:1.2, carb:19, fiber:2.9}},
  {id:'yam', name:'山药', cat:'staple', per:{pro:1.9, kcal:57, fat:0.2, carb:12.4, fiber:0.8}},
  {id:'lotus', name:'莲藕', cat:'staple', per:{pro:1.9, kcal:73, fat:0.2, carb:17, fiber:3}},
  {id:'millet', name:'小米', cat:'staple', per:{pro:9, kcal:361, fat:3, carb:75, fiber:1.6}},
  {id:'pasta', name:'意面(熟)', cat:'staple', per:{pro:5.8, kcal:158, fat:0.9, carb:31, fiber:1.8}},
  {id:'broccoli', name:'西兰花', cat:'veg', per:{pro:4.1, kcal:34, fat:0.6, carb:4.3, fiber:1.6}},
  {id:'spinach', name:'菠菜', cat:'veg', per:{pro:2.6, kcal:23, fat:0.3, carb:2.8, fiber:1.7}},
  {id:'lettuce', name:'生菜', cat:'veg', per:{pro:1.3, kcal:15, fat:0.3, carb:2, fiber:1.3}},
  {id:'cabbage', name:'大白菜', cat:'veg', per:{pro:1.5, kcal:17, fat:0.1, carb:3.2, fiber:1}},
  {id:'tomato', name:'番茄', cat:'veg', per:{pro:0.9, kcal:18, fat:0.2, carb:3.9, fiber:1.2}},
  {id:'cucumber', name:'黄瓜', cat:'veg', per:{pro:0.8, kcal:15, fat:0.2, carb:2.9, fiber:0.5}},
  {id:'pepper', name:'彩椒', cat:'veg', per:{pro:1, kcal:26, fat:0.3, carb:6.4, fiber:2.1}},
  {id:'zucchini', name:'西葫芦', cat:'veg', per:{pro:1.2, kcal:18, fat:0.2, carb:3.4, fiber:1}},
  {id:'edamame', name:'毛豆', cat:'veg', per:{pro:13, kcal:131, fat:5, carb:10, fiber:4}},
  {id:'garlics', name:'蒜薹', cat:'veg', per:{pro:2, kcal:61, fat:0.4, carb:15, fiber:2.5}},
  {id:'okra', name:'秋葵', cat:'veg', per:{pro:1.9, kcal:25, fat:0.1, carb:4.6, fiber:1.8}},
  {id:'mushroom', name:'香菇', cat:'veg', per:{pro:2.2, kcal:26, fat:0.3, carb:5.2, fiber:3.3}},
  {id:'blueberry', name:'蓝莓', cat:'fruit', per:{pro:0.7, kcal:57, fat:0.3, carb:14, fiber:2.4}},
  {id:'apple', name:'苹果', cat:'fruit', per:{pro:0.2, kcal:53, fat:0.2, carb:13.7, fiber:1.7}},
  {id:'banana', name:'香蕉', cat:'fruit', per:{pro:1.4, kcal:93, fat:0.2, carb:22, fiber:1.2}},
  {id:'orange', name:'橙子', cat:'fruit', per:{pro:0.8, kcal:48, fat:0.2, carb:11, fiber:1.7}},
  {id:'nuts', name:'混合坚果', cat:'fat', per:{pro:17, kcal:600, fat:50, carb:20, fiber:7}},
  {id:'peanut', name:'花生米', cat:'fat', per:{pro:25, kcal:574, fat:44, carb:21, fiber:8}},
  {id:'oil', name:'食用油', cat:'fat', per:{pro:0, kcal:884, fat:100, carb:0, fiber:0}},
  {id:'avocado', name:'牛油果', cat:'fat', per:{pro:2, kcal:160, fat:15, carb:9, fiber:7}},
];
// 常见食材用什么单位数（论个的就不该按克填）
const UNIT = {
  egg:'个', tomato:'个', apple:'个', orange:'个', potato:'个', sweetp:'个',
  banana:'根', cucumber:'根', corn:'根', carrot:'根',
  milk:'盒', yogurt:'杯', greek:'杯', tofu:'盒', tofu_s:'盒',
  bread:'片', rice:'碗', brown:'碗'
};
// 液体类食材按 ml 计量（默认 1ml ≈ 1g，密度约等于水/奶）
const LIQUID = {milk:'ml', yogurt:'ml', greek:'ml', oil:'ml', whey:'g'};
const isLiquid = f => !!(f && LIQUID[f.id]);
const unitOf = f => (f && UNIT[f.id]) || 'g';     // 有单位=论个，没有=按克
const byWeight = f => !(f && UNIT[f.id]);          // 按克计量的食材
// 一个 / 一份 大概多少克（生重）
const SERVING = {
  chicken:100, egg:60, beef:100, pork:100, shrimp:100, salmon:100, basa:100,
  tofu:350, tofu_s:175, milk:250, yogurt:150, greek:150, whey:30, sardine:100, chickleg:100,
  rice:150, brown:150, oat:50, bread:40, potato:200, sweetp:250, corn:150, yam:250, lotus:200, millet:50, pasta:150,
  broccoli:250, spinach:200, lettuce:200, cabbage:400, tomato:180, cucumber:200, pepper:200, zucchini:250,
  edamame:150, garlics:150, okra:150, mushroom:150,
  blueberry:100, apple:200, banana:120, orange:200,
  nuts:15, peanut:15, oil:5, avocado:100
};
const servingOf = f => (f && SERVING[f.id]) || 100;
const CAT_NAME = {pro:'蛋白', staple:'主食', veg:'蔬菜', fruit:'水果', fat:'坚果/油', other:'其他'};
// 用户只报名字时，靠关键词猜分类（猜错也不影响记账，营养走估值）
const CAT_KEYS = {
  pro:  ['鸡','鸭','牛','羊','猪','肉','鱼','虾','蟹','蛋','奶','豆腐','豆干','蛋白','肠','火腿','贝','蛤','鱿'],
  staple:['米','面','粉','馒头','包','饺','薯','土豆','玉米','燕麦','麦','山药','藕','莲','年糕','粥','藜麦','红薯','紫薯'],
  veg:  ['菜','瓜','椒','菇','笋','萝卜','茄','豆角','菠菜','生菜','西兰花','芹菜','韭菜','葱','蒜','木耳','海带','番茄','西红柿','西葫芦'],
  fruit:['果','莓','桃','梨','橙','橘','柚','蕉','葡萄','提子','猕猴','火龙','苹果','香蕉'],
  fat:  ['坚果','核桃','杏仁','腰果','花生','芝麻','油','牛油果','瓜子','开心果','夏威夷','榛子']
};
function guessCat(name){
  const f = foundFood(name); if(f) return f.cat;
  for(const cat of ['pro','staple','veg','fruit','fat','other']){
    if(CAT_KEYS[cat].some(k=>name.includes(k))) return cat;
  }
  return 'other';
}
// 分类兜底估值（用户填的食材在库里找不到时用）
const CAT_DEFAULT = {
  pro:   {pro:18, kcal:140, fat:6, carb:2, fiber:0},
  staple:{pro:3,  kcal:120, fat:1, carb:25, fiber:2},
  veg:   {pro:1.8,kcal:30,  fat:0.3, carb:5, fiber:1.8},
  fruit: {pro:0.6,kcal:55,  fat:0.2, carb:13, fiber:2},
  fat:   {pro:15, kcal:580, fat:48, carb:20, fiber:6},
  other: {pro:5,  kcal:110, fat:3,  carb:15, fiber:1},
};

/* =========================================================
   训练动作库（23 个，全部无器械）
   ========================================================= */
const EXERCISES = [
  // ================= 居家（无器械） =================
  {id:'wallangel', where:'home', n:'墙天使',      part:'肩背',   sets:'16×3',     benefit:'打开含胸的胸椎和肩关节，久坐驼背、圆肩的人首选', tip:'背贴墙，手背别离墙'},
  {id:'deadbug',   where:'home', n:'死虫式',      part:'核心',   sets:'16×3',     benefit:'练深层核心，护腰、改善骨盆前倾（久坐塌腰必练）', tip:'腰贴地，手脚交替伸展'},
  {id:'squat',     where:'home', n:'深蹲',        part:'腿臀',   sets:'16×3',     benefit:'全身最大的下肢动作，练腿臀、拉高基础代谢', tip:'站距与肩同宽，蹲到大腿平行就停'},
  {id:'pushup',    where:'home', n:'俯卧撑',      part:'胸肩',   sets:'力竭×3',   benefit:'推力基础，练胸、肩、三头，撑起上半身轮廓', tip:'手与肩同宽，手肘 45°'},
  {id:'glute',     where:'home', n:'臀桥',        part:'臀',     sets:'20×3',     benefit:'唤醒久坐睡着的臀肌，臀形和腰不舒服都靠它', tip:'顶到身体成直线，停 1 秒'},
  {id:'plank',     where:'home', n:'平板支撑',    part:'核心',   sets:'40 秒×3',  benefit:'静态核心稳定，让腰在搬东西时不受伤', tip:'肘在肩下，别塌腰'},
  {id:'lunge',     where:'home', n:'箭步蹲',      part:'腿臀',   sets:'12×3/侧',  benefit:'单腿力量和平衡，练臀腿线条、改善左右不平衡', tip:'前膝不超过脚尖'},
  {id:'rlunge',    where:'home', n:'反向箭步蹲',  part:'腿臀',   sets:'12×3/侧',  benefit:'同箭步蹲，但对膝盖压力小很多，膝盖不舒服就做这个', tip:'向后撤步，身体别前冲'},
  {id:'wallsit',   where:'home', n:'靠墙静蹲',    part:'腿',     sets:'45 秒×3',  benefit:'静态练大腿前侧，护膝、提升爬楼耐力', tip:'大腿平行地面，背贴墙'},
  {id:'jack',      where:'home', n:'开合跳',      part:'全身',   sets:'30×3',     benefit:'30 秒把心率拉起来，训练前热身、平时燃脂都行', tip:'落地轻，膝盖微屈'},
  {id:'highknee',  where:'home', n:'高抬腿',      part:'心肺',   sets:'30 秒×3',  benefit:'心肺+髋部灵活，比慢跑更省时间地出汗', tip:'膝盖抬到腰高'},
  {id:'mountain',  where:'home', n:'登山跑',      part:'核心',   sets:'30 秒×3',  benefit:'核心+心肺双练，短时间消耗高，减脂期好用', tip:'手撑地，膝盖交替收向胸口'},
  {id:'russian',   where:'home', n:'俄罗斯转体',  part:'腹斜肌', sets:'20×3',     benefit:'练侧腹和腰的旋转控制，练出腰线', tip:'腰背挺直，别弓背'},
  {id:'crunch',    where:'home', n:'卷腹',        part:'腹',     sets:'15×3',     benefit:'练上腹，比仰卧起坐护腰（不靠甩脖子起身）', tip:'下巴微收，只抬肩胛'},
  {id:'legraise',  where:'home', n:'仰卧举腿',    part:'下腹',   sets:'12×3',     benefit:'练下腹，改善小腹凸出的视觉感', tip:'腰贴地，别拱腰'},
  {id:'sideplank', where:'home', n:'侧平板',      part:'腹斜肌', sets:'30 秒×2/侧', benefit:'练侧链稳定，跑跳不腰疼、体态不歪', tip:'身体成一条直线'},
  {id:'superman',  where:'home', n:'超人式',      part:'下背',   sets:'12×3',     benefit:'强化下背和臀，久坐腰酸的人对症', tip:'手脚同时抬起，停 1 秒'},
  {id:'birddog',   where:'home', n:'鸟狗式',      part:'核心',   sets:'10×3/侧',  benefit:'核心抗旋转，护腰效果最直接的一类动作', tip:'对侧手脚伸展，骨盆别晃'},
  {id:'calf',      where:'home', n:'站姿提踵',    part:'小腿',   sets:'20×3',     benefit:'练小腿，改善脚踝稳定和腿部整体比例', tip:'踮到最高，停 1 秒'},
  {id:'burpee',    where:'home', n:'波比跳(简版)',part:'全身',   sets:'8×3',      benefit:'全身动员、心率飙升，时间紧时最划算的燃脂动作', tip:'不用跳起，蹲撑-起身即可'},
  {id:'jog',       where:'home', n:'原地慢跑',    part:'心肺',   sets:'2 分钟×3', benefit:'低冲击有氧，膝盖不疼的人拿它当热身和日常活动', tip:'原地轻跑，手脚摆开'},
  {id:'row',       where:'home', n:'毛巾划船',    part:'背',     sets:'15×3',     benefit:'家里没器械也能练背，改善圆肩、让肩胛稳', tip:'毛巾绕桌腿，身体后倾拉'},
  {id:'skater',    where:'home', n:'滑冰步',      part:'腿臀',   sets:'20×3',     benefit:'练臀中肌和侧向稳定，走路膝盖不内扣', tip:'左右侧跳，落地稳住'},

  {id:'sl_glute',  where:'home', n:'单腿臀桥',    part:'臀',     sets:'12×3/侧',  benefit:'单侧练臀，纠正左右臀力量差、练出臀部饱满度', tip:'一腿伸直，靠支撑腿顶起'},
  {id:'clamshell', where:'home', n:'侧卧抬腿',    part:'臀中肌', sets:'15×3/侧',  benefit:'练臀中肌，改善假胯宽和走路膝盖内扣', tip:'身体侧躺成直线，脚尖朝前'},
  {id:'wallpush',  where:'home', n:'靠墙俯卧撑',  part:'胸肩',   sets:'15×3',     benefit:'新手版俯卧撑，一个都做不了时从它起步', tip:'手撑墙，身体成斜线'},
  {id:'kneepush',  where:'home', n:'跪姿俯卧撑',  part:'胸肩',   sets:'12×3',     benefit:'标准俯卧撑做不了几个时，用它过渡', tip:'膝盖着地，核心别塌'},
  {id:'squatjump', where:'home', n:'深蹲跳',      part:'腿臀爆发',sets:'10×3',    benefit:'爆发力+心率，练完腿会发抖，燃脂效率高', tip:'落地屈膝缓冲，膝盖别内扣'},
  {id:'plankknee', where:'home', n:'平板提膝',    part:'核心',   sets:'12×3/侧',  benefit:'在平板基础上练腹斜肌和腹横肌，比单纯撑着强', tip:'骨盆别左右晃'},
  {id:'kickback',  where:'home', n:'站姿后踢腿',  part:'臀',     sets:'15×3/侧',  benefit:'站着就能练臀大肌，办公室间隙也能做', tip:'腰别塌，感觉臀部夹紧'},

  // ================= 健身房（有器械） =================
  {id:'g_squat',   where:'gym', n:'杠铃深蹲',     part:'腿臀',   sets:'8×4',      benefit:'下肢力量之王，腿臀和全身力量的根基', wt:'空杠 20kg 起', tip:'核心收紧，蹲到大腿平行'},
  {id:'g_dead',    where:'gym', n:'硬拉',         part:'后链',   sets:'6×4',      benefit:'练臀、腿后、整个背，最能提升全身力量的动作', wt:'40kg 起', tip:'背别弯，靠腿和髋起'},
  {id:'g_bench',   where:'gym', n:'卧推',         part:'胸肩',   sets:'8×4',      benefit:'胸肌主力，同时练肩前束和三头', wt:'空杠 20kg 起', tip:'肩胛收紧下沉，别塌胸'},
  {id:'g_pulldown',where:'gym', n:'高位下拉',     part:'背',     sets:'10×4',     benefit:'练背阔宽度，把"圆肩塌背"拉开，视觉上肩更宽', wt:'25-30kg', tip:'拉到手柄靠近锁骨，别后仰甩'},
  {id:'g_row',     where:'gym', n:'坐姿划船',     part:'背',     sets:'10×4',     benefit:'练背中部厚度，驼背、含胸的对症动作', wt:'25-30kg', tip:'胸挺起，肘向后不过身体'},
  {id:'g_press',   where:'gym', n:'哑铃肩推',     part:'肩',     sets:'10×4',     benefit:'三角肌整体，练出肩膀的立体感', wt:'每只 5-8kg', tip:'别耸肩，手肘在手腕下方'},
  {id:'g_lateral', where:'gym', n:'侧平举',       part:'肩中束', sets:'12×4',     benefit:'练肩宽视觉的关键，穿衣服显肩线', wt:'每只 3-5kg', tip:'小重量，抬到与肩平即可'},
  {id:'g_legpress',where:'gym', n:'腿举',         part:'腿',     sets:'12×4',     benefit:'安全地大重量练腿，腰不舒服也能做', wt:'40-60kg', tip:'下放时膝盖别锁死，别塌腰'},
  {id:'g_legcurl', where:'gym', n:'腿弯举',       part:'腿后',   sets:'12×4',     benefit:'练腘绳肌，平衡大腿前后力量、护膝', wt:'15-20kg', tip:'动作慢，别甩重量'},
  {id:'g_legext',  where:'gym', n:'腿屈伸',       part:'大腿前', sets:'12×4',     benefit:'孤立练股四头，膝盖康复期常用', wt:'15-20kg', tip:'顶端停 1 秒'},
  {id:'g_pullup',  where:'gym', n:'辅助引体',     part:'背',     sets:'力竭×3',   benefit:'练背阔和二头的复合动作，能做起来是分水岭', wt:'辅助 -20kg 起', tip:'先收肩胛再拉'},
  {id:'g_curl',    where:'gym', n:'哑铃弯举',     part:'二头',   sets:'12×3',     benefit:'手臂围度，最直观的"练过"标志', wt:'每只 5-8kg', tip:'肘别晃，靠二头发力'},
  {id:'g_push',    where:'gym', n:'绳索下压',     part:'三头',   sets:'12×3',     benefit:'三头占手臂 2/3 体积，练手臂别只练二头', wt:'15-20kg', tip:'大臂夹紧身体'},
  {id:'g_facepull',where:'gym', n:'面拉',         part:'后束/肩袖',sets:'15×3',   benefit:'练后束和肩袖，防肩伤，久坐圆肩必做', wt:'10-15kg', tip:'拉向额头，肘高于手腕'},
  {id:'g_fly',     where:'gym', n:'绳索夹胸',     part:'胸',     sets:'12×3',     benefit:'孤立胸肌，改善左右不平衡和胸部饱满度', wt:'每侧 5-10kg', tip:'微屈肘，抱树的感觉'},
  {id:'g_rdl',     where:'gym', n:'罗马尼亚硬拉', part:'臀/腿后',sets:'10×4',     benefit:'练臀线和腿后，比深蹲更直接刺激臀部', wt:'30-40kg', tip:'屈髋不屈腰，腿微屈'},
  {id:'g_hipthrust',where:'gym',n:'臀推',         part:'臀',     sets:'12×4',     benefit:'臀大肌孤立度最高，练臀最直接的动作', wt:'40-60kg', tip:'顶端夹臀停 1 秒'},
  {id:'g_pushdown',where:'gym', n:'直臂下压',     part:'背阔',   sets:'12×3',     benefit:'孤立背阔，找"背在发力"的感觉', wt:'10-15kg', tip:'手臂伸直，别耸肩'},
  {id:'g_crunch',  where:'gym', n:'卷腹机',       part:'腹',     sets:'15×3',     benefit:'腹部可负重训练，比徒手卷腹更能进步', wt:'10-20kg', tip:'靠腹卷起，别靠手拉'},
  {id:'g_farmer',  where:'gym', n:'农夫行走',     part:'全身',   sets:'30 米×3',  benefit:'握力+核心+全身稳定，功能性最强的一项', wt:'每只 15-20kg', tip:'背挺直，走稳不晃'},
  {id:'g_db_bench',where:'gym', n:'哑铃卧推',     part:'胸',     sets:'10×4',     benefit:'比杠铃活动范围大，对肩膀更友好，胸的发力感更好找', wt:'每只 10-15kg', tip:'下放到胸部两侧，肘约45°'},
  {id:'g_db_row',  where:'gym', n:'单臂哑铃划船', part:'背',     sets:'10×3/侧',  benefit:'单侧练背，纠正左右不平衡，背的收缩感最清楚', wt:'10-15kg', tip:'背平，别靠腰提'},
  {id:'g_backext', where:'gym', n:'山羊挺身',     part:'下背',   sets:'12×3',     benefit:'练下背和臀，久坐腰弱的人补这块', wt:'自重起', tip:'抬到身体成直线就停，别过度后仰'},
  {id:'g_cab_lat', where:'gym', n:'绳索侧平举',   part:'肩中束', sets:'15×3',     benefit:'全程有张力，比哑铃侧平举更能练到肩宽', wt:'每侧 5-8kg', tip:'小重量，肘略高于手'},
  {id:'g_hack',    where:'gym', n:'哈克深蹲',     part:'腿',     sets:'10×4',     benefit:'有靠背保护，腰不好也能大重量练腿', wt:'30-40kg', tip:'脚掌踩实，膝盖跟脚尖同向'},
];

/* =========================================================
   状态
   ========================================================= */
function initialState(){ return {
  profile:null,   // {sex,age,h,w,goalW,goal,act}
  targets:null,   // {kcal,pro,fat,carb,fiber,tdee,deficit}
  exercises:[],   // [id]
  exTab:'home', exBatch:0,
  pantry:[],      // [{name,cat,g,per:{...},count}]
  log:{},         // {'2026-10-22':[{name,g,pro,kcal,fat,carb,fiber}]}
  train:{},       // {'2026-10-22':[true,false]}
  measures:[],
  chat:[],        // [{who:'me'|'ai', text}]
  water:{},       // {'2026-10-22': ml}
  tab:'today'
}; }
let S = initialState();
let sqlFetch, connection, writeQueue = Promise.resolve(), writeFailed = false;
function failStorage(message){
  writeFailed = true;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#f4f6f5;padding:32px;color:#1b2422';
  overlay.textContent = message + ' 请刷新页面核对已保存的数据，再继续操作。';
  document.body.appendChild(overlay);
}
async function sql(statement, args=[]){
  const response = await sqlFetch(`${connection.origin}/v3/pipeline`, {method:'POST', headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:statement,args,want_rows:true}},{type:'close'}]})});
  if(!response.ok) throw new Error('数据库操作结果未知');
  const body=await response.json(), first=body.results?.[0];
  if(first?.type!=='ok' || first.response?.type!=='execute') throw new Error('数据库操作未确认');
  return first.response.result;
}
function save(){
  const value=JSON.stringify(S);
  writeQueue=writeQueue.then(async()=>{
    if(writeFailed) return;
    await sql('INSERT INTO app_state (id, value) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET value=excluded.value', [{type:'text',value}]);
  }).catch(()=>failStorage('保存结果未确认。'));
  return writeQueue;
}
async function load(){
  if(typeof window.tiana?.auth?.getAccessToken!=='function' || typeof window.tiana?.connection!=='function') throw new Error('数据库授权未就绪。');
  connection=await window.tiana.connection();
  if(connection.sql_api!=='hrana-v3') throw new Error('当前数据库连接不受支持。');
  sqlFetch=createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
  const result=await sql('SELECT value FROM app_state WHERE id = 1');
  const raw=result.rows?.[0]?.[0]?.value;
  if(raw){const o=JSON.parse(raw); if(o && typeof o==='object') S=Object.assign(S,o);}
}
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function todayKey(){
  const d=new Date(), p=n=>String(n).padStart(2,'0');
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());
}
const fmt = (n,d=0)=> (Math.round(n*Math.pow(10,d))/Math.pow(10,d)).toFixed(d);

/* =========================================================
   计算
   ========================================================= */
/* 三档速度：每日热量 = 消耗 × 系数 */
const PACE = {
  easy:  {label:'轻松', pct:'−15%', r:0.85, tip:'慢一点，几乎不会饿，最容易坚持'},
  normal:{label:'标准', pct:'−20%', r:0.80, tip:'平衡。掉脂稳，肌肉保得住（推荐）'},
  hard:  {label:'加速', pct:'−28%', r:0.72, tip:'冲刺档：连做最多 8 周就该回「标准」，否则容易反弹'}
};
function calcTargets(p){
  const bmr = 10*p.w + 6.25*p.h - 5*p.age + (p.sex==='m'?5:-161);
  const tdee = bmr * p.act;
  let kcal = tdee;
  if(p.goal==='cut')  kcal = tdee * (PACE[p.pace||'normal'].r);
  if(p.goal==='bulk') kcal = tdee*1.10;
  // 蛋白按体重，但封顶 175g（再高对减脂没额外好处，只会把碳水挤没）
  let pro = Math.min(Math.round(p.w*(p.goal==='cut'?2.0:(p.goal==='bulk'?1.8:1.6))), 175);
  let fat = Math.min(Math.round(p.w*0.9), 80);
  let room = kcal - pro*4 - fat*9;

  if(p.goal==='cut'){
    // 碳水保底 105g：不够就先砍脂肪（到 0.65g/kg），再降蛋白（到 1.8g/kg）
    if(room/4 < 105){
      const fatFloor = Math.round(p.w*0.65);
      if(fat > fatFloor) fat = fatFloor;
      room = kcal - pro*4 - fat*9;
    }
    if(room/4 < 105){
      pro = Math.min(Math.round(p.w*1.8), 160);
      room = kcal - pro*4 - fat*9;
    }
  }
  const carb = Math.max(55, Math.round(room/4));
  return {kcal:Math.round(kcal), pro, fat, carb, fiber:25, tdee:Math.round(tdee)};
}
/* 按热量缺口推算速度：1kg 脂肪 ≈ 7700 kcal */
function forecast(p,t){
  const deficit = Math.round(t.tdee - t.kcal);
  const perWeek = deficit>0 ? (deficit*7/7700) : 0;
  const wk4 = p.w - perWeek*4, wk8 = p.w - perWeek*8, wk12 = p.w - perWeek*12;
  let toGoalWeeks = null;
  if(p.goalW && p.goalW < p.w && perWeek>0) toGoalWeeks = Math.ceil((p.w-p.goalW)/perWeek);
  return {deficit, perWeek, wk4, wk8, wk12, toGoalWeeks};
}
function daySum(date){
  return (S.log[date]||[]).reduce((a,x)=>({
    kcal:a.kcal+x.kcal, pro:a.pro+x.pro, fat:a.fat+x.fat, carb:a.carb+x.carb, fiber:a.fiber+x.fiber
  }),{kcal:0,pro:0,fat:0,carb:0,fiber:0});
}
const foundFood = name => {
  if(!name) return null;
  const q = name.trim();
  let f = FOODS.find(x=>x.name===q);
  if(f) return f;
  f = FOODS.find(x=>q.includes(x.name) || x.name.includes(q));
  return f || null;
};

/* =========================================================
   引导流程
   ========================================================= */
let obSex='m', obGoal='cut', obStep=1;
function setStep(n){
  obStep = n;
  [1,2,3].forEach(i=>document.getElementById('ob'+i).classList.toggle('hidden', i!==n));
  document.querySelectorAll('#obSteps i').forEach((el,i)=>el.classList.toggle('on', i<n));
  window.scrollTo({top:0,behavior:'auto'});
}
document.getElementById('sexSeg').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return; obSex=b.dataset.v;
  [...e.currentTarget.children].forEach(x=>x.classList.toggle('on',x===b));
});
document.getElementById('goalSeg').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return; obGoal=b.dataset.v;
  [...e.currentTarget.children].forEach(x=>x.classList.toggle('on',x===b));
});
function readProfile(){
  const age=+document.getElementById('obAge').value;
  const h=+document.getElementById('obH').value;
  const w=+document.getElementById('obW').value;
  const goalW=+document.getElementById('obGoalW').value || null;
  const waist=+document.getElementById('obWaist').value || null;
  const act=+document.getElementById('obAct').value;
  if(!age||!h||!w) return null;
  if(age<12||age>90||h<120||h>230||w<30||w>250) return null;
  return {sex:obSex, age, h, w, goalW, waist, goal:obGoal, act};
}

document.getElementById('obNext1').addEventListener('click',()=>{
  const p = readProfile();
  if(!p){ alert('请把年龄、身高、体重填完整（数字要合理）'); return; }
  p.pace = (S.profile && S.profile.pace) || 'normal';
  S.profile = p; S.targets = calcTargets(p);
  renderForecast();
  setStep(2);
});

function renderForecast(){
  const p=S.profile;
  p.pace = p.pace || 'normal';
  const t = S.targets = calcTargets(p);
  const f = forecast(p,t);
  const box = document.getElementById('obForecast');

  if(p.goal==='cut'){
    const opts = ['easy','normal','hard'].map(k=>{
      const tt = calcTargets(Object.assign({},p,{pace:k}));
      const ff = forecast(p,tt);
      const weeks = (p.goalW && ff.perWeek>0) ? Math.ceil((p.w-p.goalW)/ff.perWeek) : null;
      return `<button class="pace ${p.pace===k?'on':''}" data-pace="${k}">
        <div class="pc-l"><b>${PACE[k].label}<em>${PACE[k].pct}</em></b><span>${PACE[k].tip}</span></div>
        <div class="pc-r"><b>每周 ${fmt(ff.perWeek,2)} kg</b><span>${weeks?(weeks>8?fmt(weeks/4.3,1)+' 个月':weeks+' 周')+'达标':'—'}</span></div>
        <div class="pc-chk">✓</div>
      </button>`;
    }).join('');

    box.innerHTML = `
      <div class="forecast">
        <div class="fc-t">选了「${PACE[p.pace].label}」，每天缺口 ${f.deficit} 千卡</div>
        <div class="fc-big">每周约减 ${fmt(f.perWeek,2)} <em>kg</em></div>
        <div class="fc-note">纯脂肪估算（1 kg 脂肪 ≈ 7700 千卡）。前两周掉得更快，那部分是水。</div>
        <div class="fc-grid">
          <div class="fc-cell"><b>${fmt(f.wk4,1)} kg</b><span>4 周后</span></div>
          <div class="fc-cell"><b>${fmt(f.wk8,1)} kg</b><span>8 周后</span></div>
          <div class="fc-cell"><b>${fmt(f.wk12,1)} kg</b><span>12 周后</span></div>
        </div>
        ${f.toGoalWeeks?`<div class="fc-note" style="margin-top:11px">👉 从 ${p.w} kg 到 ${p.goalW} kg，约需 <b>${fmt(f.toGoalWeeks/4.3,1)} 个月</b>（${f.toGoalWeeks} 周）</div>
        ${f.toGoalWeeks>13?`<div class="fc-note" style="margin-top:8px;opacity:.9">💡 跨度有点大。建议拆成两段：先到 <b>${fmt((p.w+(p.goalW||p.w))/2,1)} kg</b>，达成了再设下一个——比盯着一年后更容易坚持。</div>`:''}`:''}
      </div>

      ${p.waist ? (()=>{
        const r = p.waist/p.h;
        const lvl = r<0.4?['偏瘦','#c9762a']:(r<0.5?['正常','#2f6f52']:(r<0.6?['偏高','#c9762a']:['明显偏高','#c0453d']));
        const tip = r<0.5
          ? '腰围相对身高很健康。继续把蛋白和训练维持住，减脂会集中在皮下，腰腹不会反弹。'
          : `脂肪主要堆在腰腹（中心性肥胖）。这种身材掉秤可能不快，但腰围会先动——因为内脏脂肪对热量缺口最敏感。按这个速度，腰围大概 ${fmt((p.w-(p.goalW||p.w))||3,0)} cm 会跟着降。`;
        return `<div class="ob-panel">
          <h3>腰围判断</h3>
          <div class="setrow"><span>腰高比（腰围 ÷ 身高）</span><b>${fmt(r,3)}</b></div>
          <div class="setrow"><span>判定</span><b style="color:${lvl[1]}">${lvl[0]}</b></div>
          <p class="hint" style="margin:10px 0 0">${tip}<br>参考线：男 &gt;0.5、女 &gt;0.5 即为中心性肥胖风险。</p>
        </div>`;
      })() : ''}
      <div class="ob-panel">
        <h3>觉得慢？换一档</h3>
        <div class="pace-list">${opts}</div>
        <p class="hint" style="margin:10px 0 0">越快的档越难坚持，也越容易掉肌肉。减脂不是越快越好，是<b>你能撑住多久</b>才重要。</p>
      </div>

      <div class="ob-panel">
        <h3>想更快？三个真杠杆</h3>
        <div class="hint" style="line-height:1.85">
          <b>① 把活动量调高 —— 这是最被低估的一条</b><br>
          你选的是「${({1.2:'久坐',1.375:'轻度',1.55:'中度',1.725:'高强度'})[p.act]||'久坐'}」。如果能每天走够 8000 步、少坐着，
          消耗会多 300-400 千卡——相当于每天白送 40 分钟慢跑，<b>而且完全不用少吃</b>。达标时间能缩短 3-4 个月。
          <br><br>
          <b>② 每周掉 1% 体重就是上限</b><br>
          你现在 ${p.w} kg，一周最多掉 ${fmt(p.w*0.01,1)} kg。超过这条线，掉的主要是肌肉和水，而且几乎一定会反弹。
          <br><br>
          <b>③ 别盯终点，盯第一个月</b><br>
          按这个方案，4 周后你就到 ${fmt(f.wk4,1)} kg。先拿到这 4 周的结果，比盯着一年后有用得多。
        </div>
      </div>`;
  } else if(p.goal==='bulk'){
    box.innerHTML = `
      <div class="forecast">
        <div class="fc-t">按这个吃法，每天盈余 ${Math.abs(f.deficit)} 千卡</div>
        <div class="fc-big">每周约增 0.2-0.3 <em>kg</em></div>
        <div class="fc-note">增肌期体重涨得慢才对。涨太快，多出来的基本都是脂肪。</div>
        <div class="fc-grid">
          <div class="fc-cell"><b>${fmt(p.w+1,0)} kg</b><span>4 周后</span></div>
          <div class="fc-cell"><b>${fmt(p.w+2,1)} kg</b><span>8 周后</span></div>
          <div class="fc-cell"><b>${fmt(p.w+3.4,1)} kg</b><span>12 周后</span></div>
        </div>
      </div>`;
  } else {
    box.innerHTML = `
      <div class="forecast">
        <div class="fc-t">按这个吃法</div>
        <div class="fc-big">体重维持 ${p.w} <em>kg</em></div>
        <div class="fc-note">摄入 = 消耗。想让身体变化，就把目标改成减脂或增肌。</div>
      </div>`;
  }

  document.getElementById('obTargets').innerHTML = `
    <div class="ob-panel">
      <h3>你每天的目标</h3>
      <div class="pv-grid">
        <div class="pv-item"><b>${t.kcal}</b><span>千卡</span></div>
        <div class="pv-item"><b>${t.pro} g</b><span>蛋白质</span></div>
        <div class="pv-item"><b>${t.fat} g</b><span>脂肪</span></div>
        <div class="pv-item"><b>${t.carb} g</b><span>碳水</span></div>
      </div>
      <p class="hint" style="margin:11px 0 0">蛋白按每公斤 ${p.goal==='cut'?2.0:(p.goal==='bulk'?1.8:1.6)} g 算——减脂期蛋白高，是为了掉脂肪不掉肌肉。</p>
      ${p.goal==='cut' && t.carb<95 ? `<p class="hint" style="margin:8px 0 0;color:#c9762a">⚠️ 这档碳水只有 ${t.carb} g，属于低碳。短期冲刺可以，长期容易没力气、掉训练表现。</p>` : ''}
    </div>`;

  // 换档位
  box.querySelectorAll('[data-pace]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      S.profile.pace = btn.dataset.pace;
      S.targets = calcTargets(S.profile);
      renderForecast();
    });
  });
}
document.getElementById('obBack1').addEventListener('click',()=>setStep(1));

/* --- 步骤 3：选动作 --- */
const EX_PER = 10;
function renderExPicker(){
  const list = EXERCISES.filter(e=>e.where===(S.exTab||'home'));
  const total = Math.max(1, Math.ceil(list.length/EX_PER));
  S.exBatch = ((S.exBatch||0) % total + total) % total;
  const batch = list.slice(S.exBatch*EX_PER, S.exBatch*EX_PER+EX_PER);
  document.getElementById('obExGrid').innerHTML = batch.map(e=>`
    <button class="ex ${S.exercises.includes(e.id)?'on':''}" data-ex="${e.id}">
      <div class="en">${e.n}</div>
      <div class="ep">${e.part} · ${e.sets}${e.wt?' · '+e.wt:''}</div>
      <div class="eb">${e.benefit}</div>
    </button>`).join('');
  document.getElementById('obSelCnt').textContent = S.exercises.length;
  document.getElementById('obExPage').textContent = '';
  document.querySelectorAll('#obExTabs button').forEach(b=>b.classList.toggle('on', b.dataset.extab===(S.exTab||'home')));
}
document.getElementById('obExGrid').addEventListener('click',e=>{
  const b=e.target.closest('[data-ex]'); if(!b) return;
  const id=b.dataset.ex, i=S.exercises.indexOf(id);
  if(i>=0) S.exercises.splice(i,1); else S.exercises.push(id);
  b.classList.toggle('on');
  document.getElementById('obSelCnt').textContent = S.exercises.length;
});
document.getElementById('obNext2').addEventListener('click',()=>{
  S.exTab = S.exTab || 'home'; S.exBatch = 0;
  renderExPicker(); setStep(3);
});
document.getElementById('obExTabs').addEventListener('click',e=>{
  const b=e.target.closest('[data-extab]'); if(!b) return;
  S.exTab=b.dataset.extab; S.exBatch=0; renderExPicker();
});
document.getElementById('obExMore').addEventListener('click',()=>{
  S.exBatch=(S.exBatch||0)+1; renderExPicker();
});
document.getElementById('obNext3').addEventListener('click',()=>{
  if(S.exercises.length<3){ toast('至少选 3 个动作，3 个也行'); return; }
  finish();
});

/* --- 步骤 4：冰箱 --- */
/* 冰箱填写已移到主页面的「冰箱」页，这里不再需要 */
function finish(){
  save(); enterApp();
}

/* =========================================================
   自动排餐（库存优先）
   ========================================================= */
function recommendMeals(){
  const t=S.targets;
  if(!t) return [];
  const pro   = S.pantry.filter(p=>p.cat==='pro');
  const veg   = S.pantry.filter(p=>p.cat==='veg');
  const staple= S.pantry.filter(p=>p.cat==='staple');
  const fat   = S.pantry.filter(p=>p.cat==='fat');
  const fruit = S.pantry.filter(p=>p.cat==='fruit');

  const split = [{k:'第一餐', t:'约 12:00', r:0.45}, {k:'第二餐', t:'约 18:00', r:0.55}];
  return split.map((m,mi)=>{
    const kcalT = t.kcal*m.r, proT = t.pro*m.r;
    const items=[]; let kc=0, pr=0;

    // 1) 蛋白：先放一个主蛋白，凑到 80% 目标
    const pOrder = pro.slice().sort((a,b)=> (b.per.pro/b.per.kcal) - (a.per.pro/a.per.kcal));
    if(pOrder.length){
      const p0 = pOrder[mi % pOrder.length];
      const need = proT*0.8;
      let g = p0.per.pro>0 ? Math.min(p0.g*3, need/(p0.per.pro/100)) : p0.g;
      g = Math.round(g/10)*10;
      items.push({name:p0.name, g});
      kc += p0.per.kcal*g/100; pr += p0.per.pro*g/100;
    }
    // 2) 蔬菜：固定 300g（多给纤维和饱腹）
    if(veg.length){
      const v = veg[mi % veg.length];
      items.push({name:v.name, g:300});
      kc += v.per.kcal*3; pr += v.per.pro*3;
    }
    // 3) 主食：把剩余热量吃掉（留 15% 给坚果）
    const stapleKcal = (kcalT - kc) * 0.82;
    if(staple.length && stapleKcal>40){
      const s0 = staple[mi % staple.length];
      let g = s0.per.kcal>0 ? stapleKcal/(s0.per.kcal/100) : 100;
      g = Math.max(40, Math.round(g/10)*10);
      items.push({name:s0.name, g});
      kc += s0.per.kcal*g/100; pr += s0.per.pro*g/100;
    }
    // 4) 脂肪：剩余热量给坚果/油
    const restK = kcalT - kc;
    if(restK>30){
      if(fat.length){
        const f0 = fat[mi % fat.length];
        let g = f0.per.kcal>0 ? restK/(f0.per.kcal/100) : 10;
        g = Math.max(5, Math.round(g/5)*5);
        items.push({name:f0.name, g});
        kc += f0.per.kcal*g/100; pr += f0.per.pro*g/100;
      }
    }
    // 5) 水果：第一餐给一份
    if(mi===0 && fruit.length){
      const fr = fruit[0];
      items.push({name:fr.name, g:100});
      kc += fr.per.kcal; pr += fr.per.pro;
    }
    return {name:m.k, time:m.t, items, kcal:kc, pro:pr};
  });
}

/* =========================================================
   主应用
   ========================================================= */
function enterApp(){
  document.getElementById('onboard').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  const d=new Date();
  document.getElementById('hdDate').textContent =
    `${d.getMonth()+1}月${d.getDate()}日 · 周${'日一二三四五六'[d.getDay()]}`;
  render();
}
document.getElementById('tabbar').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  S.tab=b.dataset.tab; save(); render();
});
function render(){
  document.querySelectorAll('#tabbar button').forEach(x=>x.classList.toggle('on',x.dataset.tab===S.tab));
  const v=document.getElementById('view');
  try{
    if(S.tab==='today')  v.innerHTML = viewToday();
    if(S.tab==='pantry') v.innerHTML = viewPantry();
    if(S.tab==='train')  v.innerHTML = viewTrain();
    if(S.tab==='record') v.innerHTML = viewRecord();
    if(S.tab==='setting')v.innerHTML = viewSetting();
  }catch(e){
    // 出错时不留白屏，把原因和出口都摆出来
    v.innerHTML = `<div class="card"><div class="empty">
      <b>页面出了点问题</b><br><span style="font-size:12px;color:#93a19d">${(e&&e.message)||e}</span><br><br>
      可以先点下面清空数据重来（不影响别人）
    </div></div>
    <button class="btn ghost" data-act="resetAll">清空数据，重新开始</button>`;
    console.error(e);
  }
  window.scrollTo({top:0,behavior:'auto'});
}

/* ---------- 今日 ---------- */
function bar(label,val,target,cls,unit){
  const pct=Math.min(100, target>0?val/target*100:0);
  const over=target>0 && val>target*1.02;
  return `<div class="bar">
    <div class="bar-t"><b>${label}</b><span>${fmt(val)} / ${fmt(target)} ${unit}</span></div>
    <div class="track"><div class="fill ${cls}${over?' over':''}" style="width:${pct}%"></div></div>
  </div>`;
}
function viewToday(){
  const k=todayKey(), s=daySum(k), t=S.targets;
  const list=S.log[k]||[];
  const myEx = S.exercises.map(id=>EXERCISES.find(e=>e.id===id)).filter(Boolean);
  const tr=S.train[k]||[];
  const done=tr.filter(Boolean).length;
  const meals = recommendMeals();
  const f = S.profile ? forecast(S.profile,t) : null;

  const listHtml = list.length ? list.map((x,i)=>`
    <div class="logitem">
      <div class="ln">${esc(x.name)}<em>${fmt(x.g)} g</em></div>
      <div class="lk">${fmt(x.kcal)} kcal<br>蛋白 ${fmt(x.pro,1)} g</div>
      <button class="del" data-act="delLog" data-i="${i}">×</button>
    </div>`).join('') : `<div class="empty">还没有记录<br>去「冰箱」点一下“吃了一份”，自动开始累计</div>`;

  const mealHtml = meals.map(m=>`
    <div class="meal">
      <div class="meal-h"><b>${m.name}</b><span>${m.time} · ${fmt(m.kcal)} kcal · 蛋白 ${fmt(m.pro,0)}g</span></div>
      <ul>${m.items.map(it=>{
        const p=S.pantry.find(x=>x.name===it.name); const per=p?p.per:CAT_DEFAULT.pro;
        return `<li>${esc(it.name)} <em>${it.g}g · ${fmt(per.kcal*it.g/100)} kcal</em></li>`;
      }).join('')}</ul>
      <div class="sum">按你冰箱现有食材自动排的（${fmt(m.kcal)} kcal / 蛋白 ${fmt(m.pro,0)} g）</div>
    </div>`).join('');

  return `
  <div class="card">
    <div class="card-h"><h2>今日进度</h2><span class="sub">${s.kcal>t.kcal?'已超 '+fmt(s.kcal-t.kcal)+' kcal':`还差 ${fmt(t.kcal-s.kcal)} 千卡`}</span></div>
    ${bar('热量',s.kcal,t.kcal,'k','kcal')}
    ${bar('蛋白质',s.pro,t.pro,'p','g')}
    ${bar('脂肪',s.fat,t.fat,'f','g')}
    ${bar('碳水',s.carb,t.carb,'c','g')}
    ${bar('纤维',s.fiber,t.fiber,'fb','g')}
    ${f&&S.profile.goal==='cut'?`<div class="hint" style="margin-top:10px">按每天 ${f.deficit} 千卡缺口，每周约减 ${fmt(f.perWeek,2)} kg。</div>`:''}
  </div>

  ${waterCard()}

  <div class="card">
    <div class="card-h"><h2>今天吃什么</h2><span class="sub">按冰箱排的</span></div>
    ${mealHtml}
    <button class="btn ghost sm" data-act="reroll" style="margin-top:10px">换一组</button>
  </div>

  <div class="card">
    <div class="card-h"><h2>今天吃了什么</h2><span class="sub">${list.length} 项</span></div>
    <div class="loglist">${listHtml}</div>
    <button class="btn" data-act="quickLog" style="margin-top:12px">＋ 记一顿</button>
  </div>

  ${weeklyCard()}

  <div class="card">
    <div class="card-h"><h2>今日训练</h2><span class="sub">${done}/${myEx.length} 完成</span></div>
    ${myEx.length?myEx.map((e,i)=>`
      <div class="exrow ${tr[i]?'done':''}">
        <button class="chk ${tr[i]?'on':''}" data-act="tglTrain" data-i="${i}">✓</button>
        <div class="exn">${e.n}<em>${e.sets}${e.wt?' · '+e.wt:''} · ${e.tip}</em></div>
      </div>`).join(''):`<div class="empty">还没选动作，去设置里挑几个</div>`}
  </div>

  <div class="card">
    <div class="card-h"><h2>问一句</h2><span class="sub">本地助手</span></div>
    ${viewChat()}
  </div>`;
}

/* ---------- 页面内弹窗（不用系统 prompt，预览环境里会被挡） ---------- */
function openModal(html){
  closeModal();
  const el=document.createElement('div');
  el.className='modal'; el.id='modalLayer';
  el.innerHTML=`<div class="sheet">${html}</div>`;
  document.body.appendChild(el);
  el.addEventListener('click',e=>{ if(e.target===el) closeModal(); });
  return el;
}
function closeModal(){
  const el=document.getElementById('modalLayer');
  if(el) el.remove();
}

/* ---------- 周汇总 ---------- */
function keyOf(d){
  const p=n=>String(n).padStart(2,'0');
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());
}
function weeklyStats(){
  const days=[];
  for(let i=0;i<7;i++){
    const d=new Date(); d.setDate(d.getDate()-i);
    const k=keyOf(d);
    if(S.log[k] && S.log[k].length) days.push(daySum(k));
  }
  if(!days.length) return null;
  const n=days.length;
  const t=days.reduce((a,x)=>({kcal:a.kcal+x.kcal,pro:a.pro+x.pro,fat:a.fat+x.fat,carb:a.carb+x.carb,fiber:a.fiber+x.fiber}),
    {kcal:0,pro:0,fat:0,carb:0,fiber:0});
  return {n, kcal:t.kcal/n, pro:t.pro/n, fat:t.fat/n, carb:t.carb/n, fiber:t.fiber/n, sumKcal:t.kcal};
}
function weeklyCard(){
  const w=weeklyStats(), t=S.targets;
  if(!w) return `<div class="card">
    <div class="card-h"><h2>本周</h2><span class="sub">还没数据</span></div>
    <div class="hint">开始记两天，这里会汇总你一周吃了多少、达标几天。</div>
  </div>`;
  const hit = (v,g,ok)=>{ const r=g>0?v/g:0; return r>=ok[0]&&r<=ok[1]; };
  const proHit = hit(w.pro*7, t.pro*7, [0.9,1.3]);
  return `<div class="card">
    <div class="card-h"><h2>近 7 天</h2><span class="sub">记录了 ${w.n} 天</span></div>
    <div class="statgrid">
      <div class="stat"><b>${fmt(w.kcal)}</b><span>日均千卡</span></div>
      <div class="stat"><b>${fmt(w.pro)}</b><span>日均蛋白 g</span></div>
      <div class="stat"><b>${fmt(w.fiber,1)}</b><span>日均纤维 g</span></div>
      <div class="stat"><b>${fmt(w.sumKcal/1000,1)}k</b><span>本周总热量</span></div>
    </div>
    <div class="hint" style="margin-top:11px">
      ${proHit?'✅ 蛋白达到目标。':'⚠️ 蛋白日均 '+fmt(w.pro)+'g，目标 '+t.pro+'g，差 '+fmt(Math.max(0,t.pro-w.pro))+'g。'}
      ${w.fiber>=25?' 纤维也够了。':' 纤维日均只有 '+fmt(w.fiber,1)+'g（目标 25g），这是你最容易补上的一块。'}
    </div>
  </div>`;
}

/* ---------- 测量提醒 & 调整建议 ---------- */
function daysSince(dateStr){
  const d=new Date(dateStr+'T00:00:00');
  return Math.floor((new Date(keyOf(new Date())+'T00:00:00') - d)/86400000);
}
function measureAdvice(){
  const ms=[...S.measures].sort((a,b)=>a.date<b.date?-1:1);
  if(!ms.length) return null;
  const last=ms[ms.length-1];
  const gap=daysSince(last.date);
  const prev=ms.length>1?ms[ms.length-2]:null;
  const dw=prev?(last.w-prev.w):null;
  const dc=(prev&&last.waist&&prev.waist)?(last.waist-prev.waist):null;
  const spanDays=prev?(daysSince(prev.date)-gap):null;

  let level='ok', title='', body='';

  if(!prev){
    level='info';
    title='这是第一次记录';
    body='一周后再量一次，有两次数据我才能看出趋势，并据此调整你的餐和训练。';
  } else if(dw<-0.3 && dc!==null && dc<-0.4){
    level='good';
    title='掉得很干净';
    body=`体重 ${fmt(dw,1)}kg、腰围 ${fmt(dc,1)}cm，两个一起降说明掉的是脂肪。餐食和训练都不用改，继续。`;
  } else if(dw<=0.1 && dc!==null && dc<0){
    level='good';
    title='体重没动，但腰围在降';
    body=`这通常是在同时长肌肉、掉脂肪，体型比体重更重要。保持现在的吃法和训练。`;
  } else if(dw<-0.5 && (dc===null || dc>=0)){
    level='warn';
    title='掉得有点快，腰围没跟上';
    body=`一周掉 ${fmt(Math.abs(dw),1)}kg 而腰围不动，多半有水份或肌肉流失。把蛋白吃够（每天 ${S.targets.pro}g），别再加有氧。`;
  } else if(Math.abs(dw)<0.2 && (dc===null || Math.abs(dc)<0.3)){
    level='warn';
    title='数据没变化，该调了';
    body=`体重和腰围都原地踏步。两个选择：① 每天热量减 150 千卡（少吃一份主食）② 每天多走 2000 步。优先选②。`;
  } else if(dw>0.3){
    level='warn';
    title='这周涨了';
    body=`涨 ${fmt(dw,1)}kg。先看是不是盐吃多了（水肿，两三天会消），如果连着涨两周，就把热量减 150。`;
  } else {
    level='ok';
    title='趋势正常';
    body=`体重 ${dw>0?'+':''}${fmt(dw,1)}kg，保持现在的节奏。`;
  }

  // 到该量的时间了
  if(gap>=7){
    title = '该量了 · ' + title;
  }

  const color = level==='good'?'#2f6f52' : level==='warn'?'#c9762a' : '#5d6b67';
  const bg = level==='good'?'#e6f1eb' : level==='warn'?'#fdf1e3' : '#f7faf8';

  return `<div class="card" style="background:${bg};border-color:${bg}">
    <div class="card-h"><h2 style="color:${color}">${title}</h2>
      <span class="sub">${gap===0?'今天量过':gap+' 天前量过'}</span></div>
    <div class="hint" style="color:${color};line-height:1.7">${body}</div>
    ${gap>=7?'<div class="hint" style="margin-top:9px">📏 每周固定一天量（建议周一晨起），条件要一样：上完厕所、喝水前、同一把秤。</div>':''}
  </div>`;
}

/* ---------- 快速记一顿（点几下就记完，自动扣库存） ---------- */
function openQuickLog(){
  const k=todayKey();
  const avail = S.pantry.filter(p=>p.count>0);
  const el = openModal(`
    <h3>刚才吃了什么</h3>
    <div class="info">点一下就是一份，再点再加。会自动扣掉冰箱库存。</div>
    <div class="qgrid" id="qgrid">${avail.length ? avail.map(p=>`
      <button class="qitem" data-q="${esc(p.name)}">
        <span class="qn">${esc(p.name)}</span>
        <span class="qc" id="qc_${esc(p.name)}">0</span>
      </button>`).join('') : '<div class="hint">冰箱是空的，先去「冰箱」页加几样食材。</div>'}
    </div>
    <div class="btns">
      <button class="cancel" data-m="close">取消</button>
      <button class="ok" data-m="ok">记上（共 0 份）</button>
    </div>`);

  const picked={};
  const okBtn=el.querySelector('[data-m="ok"]');
  const upd=()=>{
    let total=0;
    for(const n in picked) total+=picked[n];
    okBtn.textContent=`记上（共 ${total} 份）`;
  };

  el.querySelector('#qgrid').addEventListener('click',e=>{
    const b=e.target.closest('[data-q]'); if(!b) return;
    const name=b.dataset.q;
    const p=S.pantry.find(x=>x.name===name);
    picked[name]=(picked[name]||0)+1;
    if(picked[name]>p.count){ picked[name]=p.count; toast('库存没这么多了'); }
    b.querySelector('.qc').textContent=picked[name];
    b.classList.add('on');
    upd();
  });

  el.querySelector('[data-m="close"]').onclick=closeModal;
  okBtn.onclick=()=>{
    let total=0; for(const n in picked) total+=picked[n];
    if(!total){ return; }
    for(const name in picked){
      const n=picked[name];
      if(n<=0) continue;
      const p=S.pantry.find(x=>x.name===name);
      addLog(name, p.g, p.per, n);   // 一次记 n 份
      p.count=Math.max(0,p.count-n);
    }
    save(); render(); closeModal();
    toast(`记上了，共 ${total} 份`);
  };
}

/* ---------- 喝水 ---------- */
function waterGoal(){
  const w = S.profile ? S.profile.w : 70;
  return Math.round(w * 35 / 50) * 50;   // 每公斤 35ml，取整到 50
}
function waterToday(){ return (S.water && S.water[todayKey()]) || 0; }
function waterCard(){
  const cur = waterToday(), goal = waterGoal();
  const pct = Math.min(100, goal>0 ? cur/goal*100 : 0);
  return `<div class="card">
    <div class="card-h"><h2>喝水</h2><span class="sub">${fmt(cur)} / ${goal} ml</span></div>
    <div class="track" style="height:8px"><div class="fill c" style="width:${pct}%"></div></div>
    <div class="waterbtns">
      <button data-act="water" data-ml="200">+200</button>
      <button data-act="water" data-ml="300">+300</button>
      <button data-act="water" data-ml="500">+500</button>
      <button data-act="water" data-ml="-200" class="minus">－</button>
    </div>
    <div class="hint" style="margin-top:8px">${cur>=goal?'今天喝够了 ✅':'还差 '+fmt(goal-cur)+' ml，大概 '+(Math.ceil((goal-cur)/250))+' 杯'}</div>
  </div>`;
}

/* ---------- 对话（规则型本地助手） ---------- */
function viewChat(){
  const msgs = S.chat.slice(-12);
  return `
  <div class="chatbox">
    <div class="chatlog" id="chatlog">
      ${msgs.length?msgs.map(m=>`<div class="msg ${m.who==='me'?'me':''}"><div class="bub">${esc(m.text)}</div></div>`).join('')
        :`<div class="msg"><div class="bub">我是这台设备里的记录助手。问我：\n· 今天还能吃多少\n· 晚饭吃什么\n· 蛋白还差多少\n· 这个动作练哪</div></div>`}
    </div>
    <div class="quick">
      <button data-q="今天还能吃多少">今天还能吃多少</button>
      <button data-q="晚饭吃什么">晚饭吃什么</button>
      <button data-q="蛋白还差多少">蛋白还差多少</button>
      <button data-q="冰箱里有什么">冰箱里有什么</button>
    </div>
    <div class="chat-in">
      <input id="chatInput" placeholder="问点什么…">
      <button data-act="sendChat">发送</button>
    </div>
  </div>`;
}
function botReply(q){
  const k=todayKey(), s=daySum(k), t=S.targets;
  const txt = q.replace(/\s/g,'');
  if(/还能吃|剩余|剩下多少/.test(txt)){
    const rk=t.kcal-s.kcal, rp=t.pro-s.pro;
    if(rk<=0) return `今天热量已经用完了（${fmt(s.kcal)} / ${t.kcal} 千卡）。还想吃，就吃蔬菜——西兰花、黄瓜、白菜基本不占额度。`;
    return `今天还能吃 ${fmt(rk)} 千卡，蛋白还差 ${fmt(Math.max(0,rp))} g。\n换算一下：蛋白还差 ${fmt(Math.max(0,rp))} g，大概还要 ${Math.ceil(Math.max(0,rp)/18)} 个鸡蛋，或者 ${fmt(Math.max(0,rp)/0.23)} g 鸡胸肉。`;
  }
  if(/晚饭|晚餐|晚上吃/.test(txt)){
    const meals=recommendMeals(); const m=meals[1]||meals[0];
    if(!m) return '冰箱里还没有食材，先去「冰箱」加几样。';
    return `${m.name}按你的库存排这样：\n` + m.items.map(i=>`· ${i.name} ${i.g}g`).join('\n') + `\n共 ${fmt(m.kcal)} 千卡、蛋白 ${fmt(m.pro,0)}g。`;
  }
  if(/蛋白/.test(txt)){
    const rp=t.pro-s.pro;
    if(rp<=0) return `蛋白已经够了（${fmt(s.pro)} / ${t.pro} g），今天这块达标。`;
    return `还差 ${fmt(rp)} g 蛋白。最省事的补法：\n· 鸡蛋 ${Math.ceil(rp/6)} 个\n· 或鸡胸肉 ${fmt(rp/0.23)} g\n· 或牛奶 ${fmt(rp/0.032)} ml`;
  }
  if(/冰箱|有什么/.test(txt)){
    if(!S.pantry.length) return '冰箱是空的，去「冰箱」页加几样。';
    const by={}; S.pantry.forEach(p=>{ (by[p.cat]=by[p.cat]||[]).push(p.name); });
    return Object.keys(by).map(c=>`${CAT_NAME[c]}：${by[c].join('、')}`).join('\n');
  }
  if(/动作|训练|练哪/.test(txt)){
    const m = EXERCISES.find(e=>txt.includes(e.n));
    if(m) return `${m.n}（${m.part}）：${m.sets}\n要点：${m.tip}`;
    return '你选的动作是：' + S.exercises.map(id=>EXERCISES.find(e=>e.id===id)?.n).filter(Boolean).join('、') + '。\n想看哪个动作的要点，直接说名字。';
  }
  if(/减多少|多久|速度|几周/.test(txt)){
    const f=forecast(S.profile,t);
    return `按每天 ${f.deficit} 千卡缺口算，每周约减 ${fmt(f.perWeek,2)} kg。\n4 周后约 ${fmt(f.wk4,1)} kg，8 周后约 ${fmt(f.wk8,1)} kg。`;
  }
  return '这个问题超出我的本地知识范围了。我能回答：今天还能吃多少、晚饭吃什么、蛋白还差多少、冰箱里有什么、某个动作练哪、多久减多少。';
}
function sendChat(q){
  const text=(q||'').trim(); if(!text) return;
  S.chat.push({who:'me',text});
  S.chat.push({who:'ai',text:botReply(text)});
  save(); render();
  setTimeout(()=>{ const el=document.getElementById('chatlog'); if(el) el.scrollTop=el.scrollHeight; },40);
}

/* ---------- 冰箱 ---------- */
function viewPantry(){
  const tip = `<div class="card" style="background:#f7faf8;border-color:#dfeae3">
    <div class="hint" style="line-height:1.75">
      💡 <b>建议备一个厨房秤（30-50 块那种）</b>。<br>
      食材一上秤，克数才准——不然"一份"到底多少全靠猜，算出来的热量也就不可信了。<br>
      体重秤在「记录」页用，每周固定一天晨起称一次就够。
    </div>
  </div>
`;
  if(!S.pantry.length) return tip + `<div class="card"><div class="empty">冰箱是空的<br>点下面「添加食材」写几样你现在有的</div></div>
    <button class="btn" data-act="addFood">＋ 添加食材</button>`;
  const by={pro:[],staple:[],veg:[],fruit:[],fat:[],other:[]};
  S.pantry.forEach(p=>{ (by[p.cat]||by.pro).push(p); });
  let html='';
  for(const cat of ['pro','staple','veg','fruit','fat','other']){
    if(!by[cat].length) continue;
    html += `<div class="card">
      <div class="card-h"><h2>${CAT_NAME[cat]}</h2><span class="sub">${by[cat].length} 种</span></div>
      <div class="grid">${by[cat].map(p=>{
        const kcal=p.per.kcal*p.g/100, pro=p.per.pro*p.g/100;
        const u=unitOf(FOODS.find(x=>x.name===p.name));
        return `<div class="food ${p.count<=0?'out':''}">
          <div class="fn">${esc(p.name)}</div>
          <div class="fp">${p.liquid ? `一次吃 ${p.g}ml` : (p.byG ? `一次吃 ${p.g}g` : `按每${u} ${p.g}g`)} · ${fmt(kcal)} kcal · 蛋白 ${fmt(pro,1)}g</div>
          <div class="stockrow">
            <button data-act="stock" data-name="${esc(p.name)}" data-d="1">＋</button>
            <div class="stock"><b>${p.byG ? Math.round(p.count) : p.count}</b><span>${p.byG ? 'g' : u}</span></div>
            <button data-act="stock" data-name="${esc(p.name)}" data-d="-1">－</button>
          </div>
          <button class="editbtn" data-act="editFood" data-name="${esc(p.name)}">改份量 / 删除</button>
        </div>`;
      }).join('')}</div>
    </div>`;
  }
  return tip + html + `<button class="btn" data-act="addFood">＋ 添加食材</button>
    <p class="hint" style="margin-top:10px">「⋯」可以改份数或删除。吃完一份会自动扣库存，并计入今天。</p>`;
}

/* ---------- 训练 ---------- */
function viewTrain(){
  const k=todayKey(), tr=S.train[k]||[];
  const myEx=S.exercises.map(id=>EXERCISES.find(e=>e.id===id)).filter(Boolean);
  if(!myEx.length) return `<div class="card"><div class="empty">还没选动作<br>去「设置 → 重新选动作」挑几个</div></div>`;
  const done=tr.filter(Boolean).length;
  const days=[];
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    days.push({key,n:(S.train[key]||[]).filter(Boolean).length,md:`${d.getMonth()+1}/${d.getDate()}`});
  }
  return `
  <div class="card">
    <div class="card-h"><h2>今天要做的</h2><span class="sub">${done}/${myEx.length} 完成</span></div>
    ${myEx.map((e,i)=>`
      <div class="exrow ${tr[i]?'done':''}">
        <button class="chk ${tr[i]?'on':''}" data-act="tglTrain" data-i="${i}">✓</button>
        <div class="exn">${e.n}<em>${e.sets}${e.wt?' · '+e.wt:''}</em></div>
      </div>`).join('')}
  </div>
  <div class="card">
    <div class="card-h"><h2>最近 7 天</h2><span class="sub">个数 = 完成动作数</span></div>
    <div class="chart">${days.map(d=>`<div class="ct-bar">
      <div class="bar2"><i style="height:${(d.n/Math.max(1,myEx.length))*56}px"></i></div>
      <b>${d.n}</b><span>${d.md}</span></div>`).join('')}</div>
  </div>
  <div class="card">
    <div class="card-h"><h2>动作要点</h2></div>
    <div class="hint">${myEx.map(e=>`· <b>${e.n}</b>（${e.part}）：${e.tip}`).join('<br>')}</div>
  </div>`;
}

/* ---------- 记录 ---------- */
function viewRecord(){
  const ms=[...S.measures].sort((a,b)=>a.date<b.date?-1:1);
  const last=ms[ms.length-1];
  const listHtml=ms.slice().reverse().slice(0,10).map(m=>{
    const i=ms.findIndex(x=>x.date===m.date), prev=i>0?ms[i-1]:null;
    const dw=prev?(m.w-prev.w):null, dc=(prev&&m.waist&&prev.waist)?(m.waist-prev.waist):null;
    return `<div class="mitem"><span>${m.date}</span>
      <span>${m.w} kg${dw!==null?` (${dw>0?'+':''}${fmt(dw,1)})`:''}${m.waist?` · ${m.waist} cm${dc!==null?` (${dc>0?'+':''}${fmt(dc,1)})`:''}`:''}</span></div>`;
  }).join('');
  const chart = ms.length>=2 ? (()=>{
    const arr=ms.slice(-8), vals=arr.map(m=>m.w);
    const min=Math.min(...vals)-1, max=Math.max(...vals)+1;
    return `<div class="chart">${arr.map(m=>{
      const h=Math.max(6,(m.w-min)/(max-min||1)*56);
      return `<div class="ct-bar"><div class="bar2"><i style="height:${h}px"></i></div>
        <b>${m.w}</b><span>${m.date.slice(5)}</span></div>`;
    }).join('')}</div>`;
  })() : `<div class="empty">记录两次以上，这里会出现趋势</div>`;

  return `
  ${measureAdvice()||''}

  <div class="card">
    <div class="card-h"><h2>记一笔</h2><span class="sub">${last?`上次 ${last.date}`:'还没有记录'}</span></div>
    <div class="row2" style="margin-bottom:9px">
      <div class="field"><label>体重 kg</label>
        <input id="inW" type="number" inputmode="decimal" step="0.1" value="${last?last.w:''}"></div>
      <div class="field"><label>腰围 cm（可选）</label>
        <input id="inWaist" type="number" inputmode="decimal" step="0.5" value="${last&&last.waist?last.waist:''}"></div>
    </div>
    <button class="btn sm" data-act="addMeasure">记录这一次</button>
    <div class="hint">晨起、上完厕所、喝水前测最准。腰围量肚脐水平，自然呼气末，别吸肚子。</div>
  </div>
  <div class="card">
    <div class="card-h"><h2>体重趋势</h2><span class="sub">最近 ${Math.min(ms.length,8)} 次</span></div>
    ${chart}
  </div>
  <div class="card">
    <div class="card-h"><h2>历史记录</h2><span class="sub">${ms.length} 条</span></div>
    ${ms.length?listHtml:`<div class="empty">还没有记录</div>`}
  </div>`;
}

/* ---------- 设置 ---------- */
function viewSetting(){
  const p=S.profile, t=S.targets;
  const myEx=S.exercises.map(id=>EXERCISES.find(e=>e.id===id)?.n).filter(Boolean);
  return `
  <div class="card">
    <div class="card-h"><h2>我的资料</h2></div>
    <div class="setrow"><span>性别 / 年龄</span><b>${p.sex==='m'?'男':'女'} · ${p.age} 岁</b></div>
    <div class="setrow"><span>身高 / 体重</span><b>${p.h} cm · ${p.w} kg</b></div>
    <div class="setrow"><span>目标</span><b>${({cut:'减脂',keep:'维持',bulk:'增肌'})[p.goal]}${p.goalW?` → ${p.goalW} kg`:''}</b></div>
    <div class="setrow"><span>每日热量</span><b>${t.kcal} kcal</b></div>
    <div class="setrow"><span>蛋白 / 脂肪 / 碳水</span><b>${t.pro} / ${t.fat} / ${t.carb} g</b></div>
  </div>
  <div class="card">
    <div class="card-h"><h2>我的训练动作</h2><span class="sub">${myEx.length} 个</span></div>
    <div class="hint">${myEx.length?myEx.join('、'):'还没选'}</div>
    <button class="btn ghost sm" data-act="reselectEx" style="margin-top:11px">重新选动作</button>
  </div>
  <div class="card">
    <div class="card-h"><h2>调整</h2></div>
    <button class="btn ghost sm" data-act="redoProfile" style="margin-bottom:9px">重新填写资料与目标</button>
    <button class="btn ghost sm" data-act="addFood">添加食材</button>
  </div>
  <div class="card">
    <div class="card-h"><h2>数据</h2></div>
    <div class="hint" style="margin-bottom:12px">所有数据只存在你这台设备的浏览器里，不上传、不联网。换设备或清缓存会丢，重要数据请定期导出。</div>
    <button class="btn ghost sm" data-act="exportData" style="margin-bottom:9px">导出全部数据（JSON）</button>
    <button class="btn ghost sm danger" data-act="resetAll">清空全部数据</button>
  </div>
  <p class="hint" style="text-align:center;margin:18px 0 8px">薄肌笔记 · 冰箱里有什么，就吃什么</p>`;
}

/* =========================================================
   交互
   ========================================================= */
function addLog(name, grams, per, times){
  const t=times||1;
  const r=grams*t/100, k=todayKey();
  if(!S.log[k]) S.log[k]=[];
  S.log[k].push({
    name, g:grams*t,
    pro:per.pro*r, kcal:per.kcal*r, fat:per.fat*r, carb:per.carb*r, fiber:per.fiber*r
  });
}
function openAddFood(){
  const el = openModal(`
    <h3>加个食材</h3>
    <div class="field">
      <label>名称</label>
      <input id="mName" autocomplete="off">
    </div>
    <div class="info" id="mInfo">写个名字，比如「鸡蛋」「鸡胸肉」「燕麦」</div>
    <div class="field">
      <label id="mQLabel">数量</label>
      <input id="mQty" type="number" inputmode="numeric" value="1">
    </div>
    <div class="field">
      <label id="mGLabel">净含量（选填）</label>
      <input id="mG" type="number" inputmode="numeric">
    </div>
    <div class="btns">
      <button class="cancel" data-m="close">取消</button>
      <button class="ok" data-m="ok">加入冰箱</button>
    </div>`);

  const nameEl=el.querySelector('#mName'), qtyEl=el.querySelector('#mQty'), gEl=el.querySelector('#mG');
  const infoEl=el.querySelector('#mInfo'), qLabel=el.querySelector('#mQLabel'), gLabel=el.querySelector('#mGLabel');
  let cur=null;

  const refresh=()=>{
    const name=nameEl.value.trim();
    if(!name){
      cur=null;
      infoEl.textContent='写个名字，比如「鸡蛋」「鸡胸肉」「燕麦」';
      qLabel.textContent='数量';
      gLabel.textContent='净含量（选填）';
      return;
    }
    const f=foundFood(name);
    if(f){
      cur=f;
      const def=servingOf(f);
      if(byWeight(f)){
        const gUnit = isLiquid(f)?'ml':'g';
        infoEl.innerHTML=`✅ 认出「${f.name}」（${CAT_NAME[f.cat]}）· 按${gUnit}记录`;
        qLabel.textContent=`总共有多少${gUnit}`;
        gLabel.textContent=`一次吃多少${gUnit}（必填）`;
        gEl.value=def;
        if(qtyEl.value==='1') qtyEl.value='500';
      }else{
        const u=unitOf(f);
        const gUnit = isLiquid(f)?'ml':'g';
        infoEl.innerHTML=`✅ 认出「${f.name}」（${CAT_NAME[f.cat]}）· 按${u}记录`;
        qLabel.textContent=`有多少${u}`;
        gLabel.textContent=`每${u}多少${gUnit}（必填，已填常见值）`;
        gEl.value=def;
        if(qtyEl.value==='1') qtyEl.value='10';
      }
    }else{
      cur=null;
      infoEl.innerHTML=`没收录「${esc(name)}」，营养按分类估`;
      qLabel.textContent='总共有多少克';
      gLabel.textContent='每次吃多少克（必填）';
      gEl.value=100;
      if(qtyEl.value==='1') qtyEl.value='500';
    }
  };
  nameEl.addEventListener('input', refresh);
  setTimeout(()=>nameEl.focus(),120);

  el.querySelector('[data-m="close"]').onclick=closeModal;
  el.querySelector('[data-m="ok"]').onclick=()=>{
    const name=nameEl.value.trim();
    if(!name){ infoEl.innerHTML='<b>先写个名称</b>'; return; }
    const f=cur || foundFood(name);
    const cat=guessCat(name);
    const per=f?Object.assign({},f.per):Object.assign({},CAT_DEFAULT[cat]);
    const defG=f?servingOf(f):100;
    const userG=parseFloat(gEl.value);
    if(!(userG>0)){
      gLabel.textContent='这里必须填，不能留空';
      gLabel.style.color='#c0453d';
      gEl.focus();
      return;
    }
    const g=userG;
    const bg=f?byWeight(f):true;
    const liq=f?isLiquid(f):false;
    const qty=Math.max(1, parseFloat(qtyEl.value)||1);
    const finalName=f?f.name:name;

    const exist=S.pantry.find(x=>x.name===finalName);
    if(exist){ exist.count += qty; if(userG>0) exist.g=g; exist.liquid=liq; }
    else S.pantry.push({name:finalName, cat:f?f.cat:cat, g, per, count:qty, byG:bg, liquid:liq});

    save(); render(); closeModal();
    toast(`已加入 ${finalName} ${bg?Math.round(qty)+'g':qty+unitOf(FOODS.find(x=>x.name===finalName))}`);
  };
}

function editFood(name){
  const p=S.pantry.find(x=>x.name===name); if(!p) return;
  const f=FOODS.find(x=>x.name===name) || null;
  const u=unitOf(f);
  const unitTxt = p.liquid ? 'ml' : (p.byG ? 'g' : u);
  const el = openModal(`
    <h3>${esc(p.name)}</h3>
    <div class="info">${p.byG?'一次吃':'按每'+unitTxt+' '} ${p.g} g（估）· ${fmt(p.per.kcal*p.g/100)} kcal · 蛋白 ${fmt(p.per.pro*p.g/100,1)} g<br>不准就改成实际重量，热量会跟着重算。</div>
    <div class="field">
      <label>现在还剩多少${unitTxt}</label>
      <input id="eQty" type="number" inputmode="numeric" value="${Math.round(p.count)}">
    </div>
    <div class="btns">
      <button class="del" data-m="del">删除</button>
      <button class="cancel" data-m="close">取消</button>
      <button class="ok" data-m="ok">保存</button>
    </div>`);
  el.querySelector('[data-m="close"]').onclick=closeModal;
  el.querySelector('[data-m="ok"]').onclick=()=>{
    const n=parseInt(el.querySelector('#eQty').value,10);
    if(isNaN(n)||n<0){ return; }
    if(n===0) S.pantry=S.pantry.filter(x=>x.name!==name);
    else p.count=n;
    save(); render(); closeModal();
  };
  el.querySelector('[data-m="del"]').onclick=()=>{
    S.pantry=S.pantry.filter(x=>x.name!==name);
    save(); render(); closeModal(); toast('已删除');
  };
}
document.getElementById('view').addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b) return;
  const act=b.dataset.act;

  if(act==='eat'){
    const name=b.dataset.name;
    const p=S.pantry.find(x=>x.name===name); if(!p) return;
    addLog(p.name, p.g, p.per);
    p.count=Math.max(0,p.count-1);
    save(); render(); toast(`已记录 ${p.name} ${p.g}g`);
    return;
  }
  if(act==='stock'){
    const name=b.dataset.name, d=parseInt(b.dataset.d,10);
    const p=S.pantry.find(x=>x.name===name); if(!p) return;
    const step = p.byG ? p.g : 1;
    const unitWord = p.liquid ? 'ml' : (p.byG ? 'g' : '份');
    if(d>0){
      p.count += step;
      save(); render(); toast(`${p.name} +${step}${unitWord}`);
    }else{
      if(p.count<=0){ toast('已经没了'); return; }
      p.count = Math.max(0, p.count - step);
      addLog(p.name, p.g, p.per);          // 减 = 吃了，自动计入今天
      save(); render(); toast(`已吃掉 ${p.name} ${p.g}g`);
    }
    return;
  }
  if(act==='quickLog'){ openQuickLog(); return; }
  if(act==='water'){
    const ml=parseInt(b.dataset.ml,10)||0;
    const k=todayKey();
    if(!S.water) S.water={};
    S.water[k]=Math.max(0,(S.water[k]||0)+ml);
    save(); render();
    return;
  }
  if(act==='editFood'){ editFood(b.dataset.name); return; }
  if(act==='addFood'){ openAddFood(); return; }
  if(act==='delLog'){
    const k=todayKey(), i=+b.dataset.i;
    if(S.log[k]){ S.log[k].splice(i,1); save(); render(); }
    return;
  }
  if(act==='tglTrain'){
    const k=todayKey(), i=+b.dataset.i;
    if(!S.train[k]) S.train[k]=new Array(S.exercises.length).fill(false);
    S.train[k][i]=!S.train[k][i];
    save(); render();
    return;
  }
  if(act==='addMeasure'){
    const w=parseFloat(document.getElementById('inW').value);
    const waist=parseFloat(document.getElementById('inWaist').value);
    if(!w||w<20||w>300){ alert('体重填一下（20-300 kg）'); return; }
    const k=todayKey();
    S.measures=S.measures.filter(m=>m.date!==k);
    S.measures.push({date:k, w:Math.round(w*10)/10, waist:waist?Math.round(waist*10)/10:null});
    save(); render(); toast('已记录');
    return;
  }
  if(act==='sendChat'){
    const el=document.getElementById('chatInput');
    sendChat(el?el.value:'');
    return;
  }
  if(act==='reroll'){
    // 简单换一组：把冰箱顺序转一下，排餐结果就变了
    S.pantry.push(S.pantry.shift());
    save(); render(); toast('换了一组');
    return;
  }
  if(act==='reselectEx'){
    S.tab='train'; save();
    renderExPicker();
    alert('动作选择在设置里改：这里先打开完整列表，选完点「下一步」即可生效。');
    setStep(3); document.getElementById('app').classList.add('hidden');
    document.getElementById('onboard').classList.remove('hidden');
    return;
  }
  if(act==='redoProfile'){
    document.getElementById('app').classList.add('hidden');
    document.getElementById('onboard').classList.remove('hidden');
    document.getElementById('obAge').value=S.profile.age;
    document.getElementById('obH').value=S.profile.h;
    document.getElementById('obW').value=S.profile.w;
    document.getElementById('obGoalW').value=S.profile.goalW||'';
    document.getElementById('obWaist').value=S.profile.waist||'';
    setStep(1);
    return;
  }
  if(act==='exportData'){
    const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`薄肌笔记_${todayKey()}.json`;
    a.click();
    return;
  }
  if(act==='resetAll'){
    if(!confirm('确定清空全部数据？不能撤销。')) return;
    if(!confirm('真的要清空吗？食材、记录、打卡都会消失。')) return;
    S=initialState(); save();
    document.getElementById('app').classList.add('hidden');
    document.getElementById('onboard').classList.remove('hidden');
    setStep(1);
    return;
  }
});
document.getElementById('view').addEventListener('click',e=>{
  const q=e.target.closest('[data-q]'); if(!q) return;
  sendChat(q.dataset.q);
});
document.getElementById('view').addEventListener('keydown',e=>{
  if(e.target.id==='chatInput' && e.key==='Enter'){ sendChat(e.target.value); }
});

function toast(msg){
  const el=document.createElement('div');
  el.textContent=msg;
  el.style.cssText='position:fixed;left:50%;bottom:84px;transform:translateX(-50%);background:#1b2422;color:#fff;padding:9px 16px;border-radius:20px;font-size:13px;z-index:99;opacity:0;transition:opacity .2s';
  document.body.appendChild(el);
  requestAnimationFrame(()=>el.style.opacity='1');
  setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>el.remove(),220); },1200);
}

/* =========================================================
   启动
   ========================================================= */
const loading = document.createElement('div');
loading.style.cssText='position:fixed;inset:0;z-index:9998;background:#f4f6f5;padding:32px';
loading.textContent='正在读取数据…'; document.body.appendChild(loading);
load().then(()=>{
  loading.remove();
  if(S.profile && S.targets && S.exercises.length) enterApp();
  else { document.getElementById('onboard').classList.remove('hidden'); setStep(1); }
}).catch(()=>failStorage('无法读取数据。'));
