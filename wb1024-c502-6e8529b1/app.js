document.getElementById("app")?.remove();
document.head.insertAdjacentHTML("beforeend", "<style>\n  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}\n  :root{\n    --bg:#FFF6EC;\n    --card:#FFFFFF;\n    --ink:#2B1D14;\n    --ink2:#8A7869;\n    --ink3:#B9A695;\n    --brand:#FF5B33;\n    --brand2:#FF8A3D;\n    --sun:#FFC940;\n    --mint:#22B07D;\n    --line:#F1E4D6;\n    --shadow:0 10px 30px rgba(74,44,20,.08);\n    --shadow-lg:0 18px 50px rgba(74,44,20,.13);\n  }\n  html,body{height:100%}\n  body{\n    font-family:system-ui,-apple-system,\"PingFang SC\",\"Microsoft YaHei\",\"Segoe UI\",sans-serif;\n    background:var(--bg);\n    color:var(--ink);\n    -webkit-font-smoothing:antialiased;\n    display:flex;justify-content:center;\n    overflow-x:hidden;\n  }\n  /* 背景光斑 */\n  body::before{\n    content:\"\";position:fixed;inset:0;pointer-events:none;z-index:0;\n    background:\n      radial-gradient(680px 480px at 8% -8%, rgba(255,201,64,.22), transparent 70%),\n      radial-gradient(620px 420px at 108% 22%, rgba(255,91,51,.13), transparent 70%),\n      radial-gradient(500px 500px at 50% 115%, rgba(34,176,125,.09), transparent 70%);\n  }\n\n  #app{\n    position:relative;z-index:1;\n    width:100%;max-width:480px;\n    min-height:100dvh;\n    padding:0 20px calc(28px + env(safe-area-inset-bottom));\n    display:flex;flex-direction:column;\n  }\n\n  /* ── 顶栏 ── */\n  .topbar{\n    display:flex;align-items:center;gap:10px;\n    padding:22px 0 6px;\n  }\n  .logo{\n    width:36px;height:36px;border-radius:12px;\n    background:linear-gradient(145deg,var(--brand),var(--brand2));\n    display:grid;place-items:center;font-size:19px;\n    box-shadow:0 6px 16px rgba(255,91,51,.32);\n  }\n  .brand{font-weight:900;font-size:17px;letter-spacing:.5px}\n  .brand small{display:block;font-size:10px;font-weight:600;color:var(--ink3);letter-spacing:1.6px;margin-top:1px}\n  .top-right{margin-left:auto;display:flex;align-items:center;gap:8px}\n  .rec-btn{\n    border:1.5px solid var(--line);background:#fff;\n    border-radius:999px;padding:7px 13px;font-size:12px;font-weight:700;\n    color:var(--ink2);font-family:inherit;cursor:pointer;\n    display:flex;align-items:center;gap:5px;transition:.2s;\n  }\n  .rec-btn:active{transform:scale(.95)}\n  .rec-btn b{color:var(--brand);font-size:13px}\n\n  /* ── 屏幕切换 ── */\n  #stage{flex:1;display:flex;flex-direction:column;justify-content:center;padding:8px 0 4px}\n  .screen{display:none;width:100%}\n  .screen.on{display:block;animation:screenIn .42s cubic-bezier(.2,.8,.3,1) both}\n  @keyframes screenIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}\n\n  /* ── 首屏 ── */\n  .hero{padding:26px 0 0;text-align:left}\n  .hero-tag{\n    display:inline-flex;align-items:center;gap:6px;\n    background:#fff;border:1.5px solid var(--line);\n    border-radius:999px;padding:6px 12px;\n    font-size:11.5px;font-weight:700;color:var(--ink2);margin-bottom:18px;\n  }\n  .dot-live{width:6px;height:6px;border-radius:50%;background:var(--mint);box-shadow:0 0 0 3px rgba(34,176,125,.18)}\n  .hero h1{\n    font-size:clamp(38px,11vw,48px);line-height:1.08;font-weight:900;letter-spacing:-1.5px;\n  }\n  .hero h1 em{\n    font-style:normal;position:relative;color:var(--brand);\n    background:linear-gradient(100deg,var(--brand),var(--brand2));\n    -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;\n  }\n  .hero h1 .q{color:var(--ink3)}\n  .hero p{margin-top:14px;font-size:14.5px;color:var(--ink2);line-height:1.75;font-weight:500}\n  .hero p b{color:var(--ink);font-weight:800}\n\n  .cta-main{\n    margin-top:30px;width:100%;border:none;cursor:pointer;\n    background:linear-gradient(135deg,var(--brand),var(--brand2));\n    color:#fff;font-family:inherit;font-size:17px;font-weight:800;\n    padding:19px;border-radius:20px;letter-spacing:.5px;\n    box-shadow:0 14px 30px rgba(255,91,51,.34);\n    display:flex;align-items:center;justify-content:center;gap:9px;\n    transition:transform .16s,box-shadow .16s;\n  }\n  .cta-main:active{transform:scale(.97);box-shadow:0 6px 16px rgba(255,91,51,.3)}\n  .cta-main .arw{font-size:20px;transition:transform .2s}\n  .cta-main:hover .arw{transform:translateX(3px)}\n\n  .prev-card{\n    margin-top:14px;background:#fff;border:1.5px solid var(--line);border-radius:16px;\n    padding:13px 15px;display:flex;align-items:center;gap:10px;font-size:13px;color:var(--ink2);\n  }\n  .prev-card .e{font-size:20px}\n  .prev-card b{color:var(--ink);font-weight:800}\n  .prev-card .ago{margin-left:auto;font-size:11.5px;color:var(--ink3);font-weight:600}\n\n  /* ── 步骤 ── */\n  .steps{display:flex;gap:6px;margin-bottom:22px}\n  .steps i{height:4px;flex:1;border-radius:99px;background:#EFE1D2;transition:.35s}\n  .steps i.on{background:linear-gradient(90deg,var(--brand),var(--brand2))}\n  .steps i.done{background:#FFC9B6}\n  .step-h{margin-bottom:20px}\n  .step-h h2{font-size:26px;font-weight:900;letter-spacing:-.6px;line-height:1.25}\n  .step-h p{margin-top:7px;font-size:13.5px;color:var(--ink2);font-weight:500}\n\n  .opts{display:flex;flex-direction:column;gap:10px}\n  .opt{\n    display:flex;align-items:center;gap:13px;width:100%;text-align:left;\n    background:#fff;border:1.8px solid transparent;border-radius:18px;\n    padding:15px 16px;cursor:pointer;font-family:inherit;\n    box-shadow:0 4px 14px rgba(74,44,20,.055);\n    transition:transform .16s,border-color .18s,box-shadow .18s,background .18s;\n  }\n  .opt:active{transform:scale(.975)}\n  .opt .ico{\n    width:44px;height:44px;flex:0 0 44px;border-radius:14px;\n    display:grid;place-items:center;font-size:22px;background:#FFF3E6;\n    transition:.2s;\n  }\n  .opt .tx{flex:1;min-width:0}\n  .opt .tx b{display:block;font-size:15.5px;font-weight:800;letter-spacing:.2px}\n  .opt .tx span{display:block;font-size:12px;color:var(--ink2);margin-top:3px;font-weight:500}\n  .opt .tick{\n    width:22px;height:22px;flex:0 0 22px;border-radius:50%;\n    border:2px solid #EDDDCB;display:grid;place-items:center;\n    font-size:12px;color:#fff;transition:.2s;\n  }\n  .opt.sel{border-color:var(--brand);background:#FFFBF7;box-shadow:0 8px 22px rgba(255,91,51,.14)}\n  .opt.sel .ico{background:linear-gradient(140deg,#FFE0D2,#FFD1BE)}\n  .opt.sel .tick{background:linear-gradient(140deg,var(--brand),var(--brand2));border-color:transparent}\n\n  /* 忌口 chips */\n  .chips{display:flex;flex-wrap:wrap;gap:9px}\n  .chip{\n    display:flex;align-items:center;gap:7px;\n    background:#fff;border:1.8px solid transparent;border-radius:14px;\n    padding:12px 15px;font-family:inherit;font-size:14px;font-weight:700;color:var(--ink);\n    cursor:pointer;box-shadow:0 4px 14px rgba(74,44,20,.055);\n    transition:.16s;\n  }\n  .chip:active{transform:scale(.95)}\n  .chip .x{font-size:16px}\n  .chip.sel{border-color:var(--brand);background:#FFF1EA;color:var(--brand)}\n  .chip.sel::after{content:\"✓\";font-size:11px;font-weight:900}\n\n  .step-foot{display:flex;gap:10px;margin-top:26px}\n  .btn-ghost{\n    flex:0 0 auto;padding:17px 22px;border-radius:18px;border:1.8px solid var(--line);\n    background:#fff;color:var(--ink2);font-family:inherit;font-size:14.5px;font-weight:700;cursor:pointer;\n    transition:.16s;\n  }\n  .btn-ghost:active{transform:scale(.96)}\n  .btn-go{\n    flex:1;padding:17px;border-radius:18px;border:none;cursor:pointer;\n    background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff;\n    font-family:inherit;font-size:16px;font-weight:800;letter-spacing:.4px;\n    box-shadow:0 10px 24px rgba(255,91,51,.3);\n    transition:.16s,opacity .2s;\n  }\n  .btn-go:active{transform:scale(.97)}\n  .btn-go:disabled{background:#EADDD0;color:#B9A695;box-shadow:none;cursor:not-allowed;transform:none}\n\n  /* ── 加载 ── */\n  .loading{display:flex;flex-direction:column;align-items:center;padding:70px 0 40px;text-align:center}\n  .bowl{\n    font-size:60px;animation:bob 1.05s ease-in-out infinite;\n    filter:drop-shadow(0 12px 20px rgba(255,91,51,.22));\n  }\n  @keyframes bob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-13px) rotate(4deg)}}\n  .load-txt{margin-top:24px;font-size:14.5px;color:var(--ink2);font-weight:600;min-height:22px}\n  .load-bar{margin-top:18px;width:150px;height:4px;border-radius:99px;background:#F0E1D2;overflow:hidden}\n  .load-bar i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,var(--brand),var(--sun));animation:fill 1.5s ease-out forwards}\n  @keyframes fill{to{width:100%}}\n\n  /* ── 结果卡 ── */\n  .res-wrap{animation:drop .5s cubic-bezier(.2,1.1,.35,1) both}\n  @keyframes drop{from{opacity:0;transform:translateY(24px) scale(.94)}to{opacity:1;transform:none}}\n  .res-card{\n    background:var(--card);border-radius:26px;overflow:hidden;box-shadow:var(--shadow-lg);\n  }\n  .res-top{\n    position:relative;padding:26px 22px 22px;\n    background:linear-gradient(150deg,#FFF2E4,#FFE6D6 60%,#FFDCCB);\n    text-align:center;overflow:hidden;\n  }\n  .res-top::after{\n    content:\"\";position:absolute;width:200px;height:200px;border-radius:50%;\n    background:radial-gradient(circle,rgba(255,255,255,.85),transparent 68%);\n    top:-70px;right:-60px;\n  }\n  .res-kicker{\n    position:relative;display:inline-flex;align-items:center;gap:6px;\n    background:rgba(255,255,255,.82);border-radius:999px;padding:5px 12px;\n    font-size:11px;font-weight:800;color:var(--brand);letter-spacing:.6px;margin-bottom:14px;\n  }\n  .res-emoji{position:relative;font-size:62px;line-height:1;filter:drop-shadow(0 10px 16px rgba(180,90,40,.2))}\n  .res-name{position:relative;font-size:30px;font-weight:900;letter-spacing:-1px;margin-top:12px;line-height:1.2}\n  .res-cat{\n    position:relative;display:inline-block;margin-top:9px;font-size:11.5px;font-weight:700;\n    color:#A8663F;background:rgba(255,255,255,.7);padding:4px 11px;border-radius:99px;\n  }\n  .res-body{padding:20px 22px 6px}\n  .res-blurb{font-size:14.5px;line-height:1.75;color:#4A3529;font-weight:600}\n  .res-meta{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}\n  .mtag{\n    display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;\n    background:#FFF6EC;border:1px solid #F5E7D8;color:#8A6142;\n    padding:7px 11px;border-radius:10px;\n  }\n  .why{margin-top:18px;border-top:1.5px dashed #F0E2D2;padding-top:15px}\n  .why-t{font-size:11px;font-weight:800;color:var(--ink3);letter-spacing:1.4px;margin-bottom:9px}\n  .why li{\n    list-style:none;display:flex;gap:8px;font-size:12.8px;color:#6B5546;\n    line-height:1.6;margin-bottom:6px;font-weight:600;\n  }\n  .why li i{color:var(--mint);font-style:normal;font-weight:900;flex:0 0 auto}\n  .why li.warn i{color:#E8A33D}\n  .res-foot{display:flex;gap:9px;padding:16px 22px 20px}\n  .btn-swap{\n    flex:1;padding:16px;border-radius:16px;border:1.8px solid var(--line);\n    background:#fff;color:var(--ink);font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;\n    transition:.16s;\n  }\n  .btn-swap:active{transform:scale(.97)}\n  .btn-swap:disabled{border-color:#F3E7DA;color:#C7B4A3;cursor:not-allowed;transform:none;background:#FDF8F2}\n  .btn-lock{\n    flex:1.15;padding:16px;border-radius:16px;border:none;cursor:pointer;\n    background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff;\n    font-family:inherit;font-size:15px;font-weight:800;\n    box-shadow:0 10px 22px rgba(255,91,51,.3);transition:.16s;\n  }\n  .btn-lock:active{transform:scale(.97)}\n  .swap-note{\n    text-align:center;font-size:12px;color:var(--ink3);font-weight:600;\n    padding:0 22px 16px;line-height:1.6;\n  }\n  .swap-note b{color:var(--brand);font-weight:800}\n\n  .sub-acts{display:flex;gap:10px;margin-top:12px}\n  .mini{\n    flex:1;padding:13px;border-radius:15px;border:1.5px solid var(--line);\n    background:rgba(255,255,255,.72);color:var(--ink2);\n    font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:.16s;\n  }\n  .mini:active{transform:scale(.97)}\n\n  /* ── 记录 ── */\n  .rec-list{display:flex;flex-direction:column;gap:9px;max-height:58dvh;overflow-y:auto;margin:0 -4px;padding:0 4px 8px}\n  .rec-item{\n    display:flex;align-items:center;gap:12px;background:#fff;border-radius:16px;\n    padding:13px 15px;box-shadow:0 4px 14px rgba(74,44,20,.05);\n  }\n  .rec-item .e{font-size:24px}\n  .rec-item .n{font-weight:800;font-size:14.5px}\n  .rec-item .d{margin-left:auto;font-size:11.5px;color:var(--ink3);font-weight:600}\n  .empty{\n    text-align:center;padding:50px 20px;color:var(--ink3);font-size:13.5px;line-height:1.8;font-weight:600;\n  }\n  .stat-row{display:flex;gap:10px;margin-bottom:16px}\n  .stat{flex:1;background:#fff;border-radius:16px;padding:14px;text-align:center;box-shadow:0 4px 14px rgba(74,44,20,.05)}\n  .stat b{display:block;font-size:24px;font-weight:900;color:var(--brand);letter-spacing:-.5px}\n  .stat span{font-size:11px;color:var(--ink3);font-weight:700}\n\n  /* ── 庆祝浮层 ── */\n  .sheet{\n    position:fixed;inset:0;z-index:50;display:none;\n    align-items:center;justify-content:center;padding:24px;\n    background:rgba(43,29,20,.42);backdrop-filter:blur(6px);\n  }\n  .sheet.on{display:flex;animation:fade .28s both}\n  @keyframes fade{from{opacity:0}to{opacity:1}}\n  .sheet-box{\n    width:100%;max-width:340px;background:#fff;border-radius:26px;\n    padding:34px 24px 22px;text-align:center;\n    box-shadow:0 24px 60px rgba(43,29,20,.3);\n    animation:pop .42s cubic-bezier(.2,1.2,.4,1) both;\n  }\n  @keyframes pop{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:none}}\n  .sheet-emoji{font-size:54px;line-height:1}\n  .sheet-box h3{font-size:21px;font-weight:900;margin-top:14px;letter-spacing:-.4px}\n  .sheet-box p{font-size:13px;color:var(--ink2);margin-top:8px;line-height:1.7;font-weight:600}\n  .sheet-box .btn-lock{width:100%;margin-top:20px;flex:none}\n  .toast{\n    position:fixed;left:50%;bottom:36px;transform:translateX(-50%) translateY(20px);\n    background:rgba(43,29,20,.92);color:#fff;padding:11px 20px;border-radius:99px;\n    font-size:13px;font-weight:700;opacity:0;pointer-events:none;transition:.3s;z-index:60;\n    white-space:nowrap;\n  }\n  .toast.on{opacity:1;transform:translateX(-50%) translateY(0)}\n  .foot{margin-top:auto;padding-top:22px;text-align:center;font-size:10.5px;color:#CBB8A6;font-weight:600;letter-spacing:.6px}\n</style>");
document.body.insertAdjacentHTML("beforeend", "\n<div id=\"app\">\n\n  <div class=\"topbar\">\n    <div class=\"logo\">🍚</div>\n    <div class=\"brand\">吃啥<small>JUST PICK ONE</small></div>\n    <div class=\"top-right\">\n      <button class=\"rec-btn\" id=\"openRec\">📖 记录 <b id=\"recCount\">0</b></button>\n    </div>\n  </div>\n\n  <div id=\"stage\">\n\n    <!-- 首屏 -->\n    <section class=\"screen on\" id=\"s-intro\">\n      <div class=\"hero\">\n        <div class=\"hero-tag\"><span class=\"dot-live\"></span>10 秒做一个决定</div>\n        <h1>今天<em>吃啥</em><span class=\"q\">？</span></h1>\n        <p>别再滑动外卖软件了。<br>回答 <b>3 个问题</b>，它替你把剩下的选项全删掉。</p>\n      </div>\n      <button class=\"cta-main\" id=\"startBtn\">帮我决定 <span class=\"arw\">→</span></button>\n      <div id=\"prevSlot\"></div>\n    </section>\n\n    <!-- 步骤（内容由 JS 渲染） -->\n    <section class=\"screen\" id=\"s-step\">\n      <div class=\"steps\"><i class=\"on\"></i><i></i><i></i></div>\n      <div class=\"step-h\">\n        <h2 id=\"stepTitle\"></h2>\n        <p id=\"stepHint\"></p>\n      </div>\n      <div class=\"opts\" id=\"stepOpts\"></div>\n      <div class=\"step-foot\">\n        <button class=\"btn-ghost\" id=\"stepBack\">返回</button>\n        <button class=\"btn-go\" id=\"stepNext\" disabled>下一步</button>\n      </div>\n    </section>\n\n    <!-- 加载 -->\n    <section class=\"screen\" id=\"s-loading\">\n      <div class=\"loading\">\n        <div class=\"bowl\">🥢</div>\n        <div class=\"load-txt\" id=\"loadTxt\">正在翻你家冰箱…</div>\n        <div class=\"load-bar\"><i></i></div>\n      </div>\n    </section>\n\n    <!-- 结果 -->\n    <section class=\"screen\" id=\"s-result\">\n      <div class=\"res-wrap\">\n        <div class=\"res-card\">\n          <div class=\"res-top\">\n            <div class=\"res-kicker\">今天就吃这个</div>\n            <div class=\"res-emoji\" id=\"rEmoji\">🍗</div>\n            <div class=\"res-name\" id=\"rName\">黄焖鸡米饭</div>\n            <div class=\"res-cat\" id=\"rCat\">米饭 · 一人食友好</div>\n          </div>\n          <div class=\"res-body\">\n            <p class=\"res-blurb\" id=\"rBlurb\"></p>\n            <div class=\"res-meta\" id=\"rMeta\"></div>\n            <div class=\"why\">\n              <div class=\"why-t\">为什么是它</div>\n              <ul id=\"rWhy\"></ul>\n            </div>\n          </div>\n          <div class=\"res-foot\">\n            <button class=\"btn-swap\" id=\"swapBtn\">换一个</button>\n            <button class=\"btn-lock\" id=\"lockBtn\">就它了</button>\n          </div>\n          <div class=\"swap-note\" id=\"swapNote\"></div>\n        </div>\n        <div class=\"sub-acts\">\n          <button class=\"mini\" id=\"shareBtn\">生成分享卡</button>\n          <button class=\"mini\" id=\"restartBtn\">重新选条件</button>\n        </div>\n      </div>\n    </section>\n\n    <!-- 记录 -->\n    <section class=\"screen\" id=\"s-rec\">\n      <div class=\"step-h\">\n        <h2>我的饭点记录</h2>\n        <p>这些是它替你定过的答案。</p>\n      </div>\n      <div class=\"stat-row\" id=\"recStats\"></div>\n      <div class=\"rec-list\" id=\"recList\"></div>\n      <div class=\"step-foot\">\n        <button class=\"btn-ghost\" id=\"recBack\">返回</button>\n        <button class=\"btn-go\" id=\"recClear\" style=\"background:#fff;color:#B9A695;box-shadow:none;border:1.8px solid var(--line)\">清空记录</button>\n      </div>\n    </section>\n\n  </div>\n\n  <div class=\"foot\">吃啥 · 一个专门治疗选择困难的小工具</div>\n</div>\n\n<div class=\"sheet\" id=\"sheet\">\n  <div class=\"sheet-box\">\n    <div class=\"sheet-emoji\" id=\"sheetEmoji\">🎉</div>\n    <h3 id=\"sheetTitle\">定了！</h3>\n    <p id=\"sheetDesc\"></p>\n    <button class=\"btn-lock\" id=\"sheetBtn\">好的，去吃</button>\n  </div>\n</div>\n<div class=\"toast\" id=\"toast\"></div>\n\n");

/* ═══════════════ 数据 ═══════════════
   s 辣度 0-3 | o 油腻 0-3 | cold 生冷 | shell 带壳/多骨 | p 人均
   sc 适合场景 | m 适合心情
*/
const DISHES = [
  // 米饭类
  {n:'黄焖鸡米饭',e:'🍗',c:'米饭',s:1,o:2,p:22,sc:['solo','duo'],m:['normal','starving'],b:'一个人吃饭的安全牌，鸡汁拌饭能吃两碗。'},
  {n:'煲仔饭',e:'🍚',c:'米饭',s:0,o:2,p:30,sc:['solo','duo'],m:['normal'],b:'锅巴才是灵魂，最后刮碗底那口最香。'},
  {n:'蛋炒饭',e:'🍳',c:'米饭',s:0,o:2,p:16,sc:['solo'],m:['starving','light'],b:'十分钟搞定的救急饭，加两个蛋更踏实。'},
  {n:'卤肉饭',e:'🍖',c:'米饭',s:0,o:2,p:25,sc:['solo','duo'],m:['starving','normal'],b:'油亮的卤汁盖在饭上，什么都不用想。'},
  {n:'咖喱鸡饭',e:'🍛',c:'米饭',s:1,o:1,p:28,sc:['solo','duo','fam'],m:['normal'],b:'浓郁的咖喱一浇，米饭永远不够。'},
  {n:'猪脚饭',e:'🍖',c:'米饭',s:0,o:3,p:26,sc:['solo'],m:['starving','treat'],b:'胶质满满，吃完有被认真安慰到。'},
  {n:'青椒肉丝盖饭',e:'🫑',c:'米饭',s:0,o:1,p:20,sc:['solo'],m:['normal'],b:'标准家常味，不会出错也不会惊喜。'},
  {n:'石锅拌饭',e:'🍲',c:'米饭',s:1,o:1,p:32,sc:['solo','duo'],m:['normal'],b:'拌开的那一下，是整顿饭最幸福的时刻。'},
  {n:'番茄牛腩饭',e:'🍅',c:'米饭',s:0,o:1,p:35,sc:['duo','fam'],m:['normal','light'],b:'酸甜开胃，汤泡饭能一直吃到碗底。'},
  {n:'海南鸡饭',e:'🍗',c:'米饭',s:0,o:1,p:38,sc:['solo','duo'],m:['normal','treat'],b:'清清爽爽一盘，米饭是鸡油煮的。'},
  {n:'广式烧腊饭',e:'🍗',c:'米饭',s:1,o:2,p:32,sc:['solo','duo'],m:['starving','normal'],b:'叉烧加烧鹅双拼，站在门口就能决定。'},
  {n:'日式蛋包饭',e:'🍳',c:'米饭',s:0,o:1,p:40,sc:['solo','duo'],m:['normal','treat'],b:'看着就开心，吃完心情真的会变好。'},
  {n:'铁板炒饭',e:'🍳',c:'米饭',s:1,o:3,p:26,sc:['solo','duo'],m:['starving'],b:'滋滋作响上桌，锅气就是最好的调料。'},

  // 面食
  {n:'兰州牛肉面',e:'🍜',c:'面食',s:1,o:1,p:22,sc:['solo'],m:['starving','normal'],b:'清汤配一勺辣油，下肚浑身都热了。'},
  {n:'重庆小面',e:'🌶️',c:'面食',s:3,o:2,p:18,sc:['solo'],m:['starving'],b:'辣得清醒，专治打不起精神的中午。'},
  {n:'番茄鸡蛋面',e:'🍜',c:'面食',s:0,o:1,p:16,sc:['solo'],m:['light','normal'],b:'不舒服的时候，只有这碗能救你。'},
  {n:'热干面',e:'🍜',c:'面食',s:0,o:2,p:12,sc:['solo'],m:['starving'],b:'芝麻酱糊住嘴的那一口，才叫满足。'},
  {n:'油泼面',e:'🍜',c:'面食',s:2,o:3,p:22,sc:['solo','duo'],m:['starving'],b:'热油泼上去的声音，比味道还香。'},
  {n:'饺子',e:'🥟',c:'面食',s:0,o:1,p:30,sc:['solo','duo','fam','grp'],m:['normal'],b:'一个人吃也行，一家人吃也行，万金油。'},
  {n:'小笼包配豆浆',e:'🥟',c:'面食',s:0,o:1,p:18,sc:['solo'],m:['light','normal'],b:'轻量的满足，不用坐下来认真吃。'},
  {n:'鲜肉馄饨',e:'🥣',c:'面食',s:0,o:0,p:18,sc:['solo'],m:['light'],b:'胃在抗议的时候，来碗热的最管用。'},
  {n:'螺蛳粉',e:'🍲',c:'面食',s:2,o:2,p:25,sc:['solo'],m:['normal','treat'],b:'闻着臭吃着香，一个人的快乐。'},
  {n:'酸辣粉',e:'🌶️',c:'面食',s:3,o:2,p:16,sc:['solo'],m:['starving'],b:'酸得开胃辣得过瘾，十分钟解决战斗。'},
  {n:'过桥米线',e:'🍜',c:'面食',s:0,o:1,p:30,sc:['solo','duo'],m:['normal','light'],b:'汤鲜料足，慢慢烫着吃，很治愈。'},
  {n:'意面',e:'🍝',c:'面食',s:0,o:1,p:45,sc:['solo','duo'],m:['treat','normal'],b:'西式里最不容易翻车的一种，稳妥。'},
  {n:'牛肉粉',e:'🍜',c:'面食',s:1,o:1,p:24,sc:['solo'],m:['starving','normal'],b:'汤头够味，加个卤蛋才算完整。'},
  {n:'云吞面',e:'🍜',c:'面食',s:0,o:1,p:28,sc:['solo'],m:['light','normal'],b:'清清爽爽，吃完不犯困。'},
  {n:'泰式炒河粉',e:'🍜',c:'面食',s:1,o:1,p:42,sc:['solo','duo'],m:['normal','treat'],b:'酸甜带点花生香，换个口味的时候很对。'},
  {n:'越南河粉',e:'🍜',c:'面食',s:0,o:0,p:45,sc:['solo'],m:['light','normal'],b:'清汤配一把香草，吃完身体很轻。'},
  {n:'桂林米粉',e:'🍜',c:'面食',s:1,o:1,p:20,sc:['solo'],m:['starving'],b:'卤水够味，加一勺酸笋更地道。'},
  {n:'日式冷面',e:'🍜',c:'面食',s:0,o:0,p:32,sc:['solo'],m:['light'],cold:1,b:'冰冰凉凉吸溜一口，夏天最舒服。'},

  // 汤锅
  {n:'火锅',e:'🍲',c:'汤锅',s:2,o:3,p:85,sc:['duo','fam','grp'],m:['treat'],b:'人多的时候，火锅永远没人反对。'},
  {n:'麻辣烫',e:'🌶️',c:'汤锅',s:2,o:2,p:30,sc:['solo','duo'],m:['normal','starving'],b:'自己配自己吃，丰俭由人。'},
  {n:'冒菜',e:'🌶️',c:'汤锅',s:3,o:3,p:35,sc:['solo','duo'],m:['starving','treat'],b:'一个人的火锅，不用等人也不用让菜。'},
  {n:'砂锅',e:'🍲',c:'汤锅',s:0,o:1,p:28,sc:['solo','duo'],m:['normal','light'],b:'热乎、扎实、完全不费脑子。'},
  {n:'酸菜鱼',e:'🐟',c:'汤锅',s:2,o:2,p:55,sc:['duo','fam','grp'],m:['normal','treat'],b:'酸辣下饭，两个人分一盘刚刚好。'},
  {n:'麻辣香锅',e:'🌶️',c:'汤锅',s:2,o:3,p:50,sc:['duo','grp'],m:['treat'],b:'重口味团伙作案的首选。'},
  {n:'椰子鸡',e:'🥥',c:'汤锅',s:0,o:1,p:78,sc:['duo','fam','grp'],m:['treat','light'],b:'清甜不辣，带长辈吃不尴尬。'},
  {n:'部队锅',e:'🍲',c:'汤锅',s:2,o:2,p:60,sc:['duo','grp'],m:['treat'],b:'泡面芝士一起煮，热量和快乐成正比。'},
  {n:'麻辣拌',e:'🥣',c:'汤锅',s:2,o:2,p:30,sc:['solo'],m:['normal'],b:'没有汤的麻辣烫，拌开更入味。'},

  // 快餐
  {n:'汉堡薯条',e:'🍔',c:'快餐',s:0,o:2,p:32,sc:['solo','duo'],m:['starving'],b:'不用等，五分钟就能塞进嘴里。'},
  {n:'炸鸡',e:'🍗',c:'快餐',s:1,o:3,p:42,sc:['duo','grp'],m:['treat'],b:'脆皮的快乐，谁都拦不住。'},
  {n:'披萨',e:'🍕',c:'快餐',s:0,o:2,p:55,sc:['duo','fam','grp'],m:['treat'],b:'人多点一份，谁都能吃两口，不挑人。'},
  {n:'日式拉面',e:'🍜',c:'快餐',s:1,o:2,p:48,sc:['solo','duo'],m:['normal','treat'],b:'浓汤配一颗溏心蛋，值这个价。'},
  {n:'寿司',e:'🍣',c:'快餐',s:0,o:0,p:65,sc:['solo','duo'],m:['treat','light'],cold:1,b:'清爽精致，罪恶感最低的放纵。'},
  {n:'沙拉碗',e:'🥗',c:'快餐',s:0,o:0,p:32,sc:['solo'],m:['light'],cold:1,b:'想吃清淡的时候，别硬撑着点重口。'},
  {n:'三明治',e:'🥪',c:'快餐',s:0,o:1,p:26,sc:['solo'],m:['light','normal'],cold:1,b:'轻食但真的能饱，下午不犯困。'},
  {n:'轻食鸡胸饭',e:'🥗',c:'快餐',s:0,o:0,p:35,sc:['solo'],m:['light'],cold:1,b:'吃完整个人是清醒的，适合还有下半场。'},

  // 正餐
  {n:'家常菜点菜',e:'🥘',c:'正餐',s:1,o:2,p:50,sc:['duo','fam','grp'],m:['normal'],b:'点三个菜配两碗饭，是最踏实的一顿。'},
  {n:'小炒肉配米饭',e:'🌶️',c:'正餐',s:2,o:2,p:45,sc:['duo','fam'],m:['starving','normal'],b:'湘菜的下饭能力，没人能拒绝。'},
  {n:'锅包肉配饭',e:'🍖',c:'正餐',s:0,o:2,p:55,sc:['fam','grp'],m:['treat'],b:'酸甜酥脆，小孩大人都抢着夹。'},
  {n:'川菜馆子',e:'🌶️',c:'正餐',s:3,o:3,p:60,sc:['duo','grp'],m:['treat'],b:'重口味的集体狂欢，米饭要多叫两碗。'},
  {n:'烧烤',e:'🍢',c:'正餐',s:1,o:3,p:65,sc:['duo','grp'],m:['treat'],b:'晚上九点以后，只有烧烤是对的。'},
  {n:'小龙虾',e:'🦞',c:'正餐',s:2,o:2,p:95,sc:['grp'],m:['treat'],shell:1,b:'剥壳很麻烦，但每年这个时候都值得。'},
  {n:'铁锅炖',e:'🍲',c:'正餐',s:0,o:2,p:70,sc:['fam','grp'],m:['treat'],b:'一锅炖一切，天冷的时候最对。'},
  {n:'粤式茶餐厅',e:'🍛',c:'正餐',s:0,o:1,p:38,sc:['solo','duo'],m:['normal'],b:'碟头饭配冻柠茶，稳妥又有点仪式感。'},
  {n:'粥配小菜',e:'🥣',c:'正餐',s:0,o:0,p:22,sc:['solo'],m:['light'],b:'胃不舒服的时候，热粥比什么都体贴。'},
  {n:'淮扬菜',e:'🥢',c:'正餐',s:0,o:1,p:80,sc:['duo','fam'],m:['treat'],cooked:0,b:'清淡讲究，适合认真坐下来吃一顿。'},
  {n:'东北菜馆',e:'🍖',c:'正餐',s:0,o:2,p:55,sc:['fam','grp'],m:['normal','starving'],b:'量大管饱，性价比之王。'},
  {n:'韩式烤肉',e:'🥩',c:'正餐',s:1,o:3,p:85,sc:['duo','grp'],m:['treat'],b:'自己动手烤，气氛比味道更重要。'},
  {n:'日式居酒屋',e:'🍶',c:'正餐',s:0,o:2,p:90,sc:['duo','grp'],m:['treat'],b:'点一堆小份的，边聊边吃，很解压。'},

  // 轻食 / 早餐
  {n:'煎饼果子',e:'🌯',c:'早餐',s:1,o:2,p:10,sc:['solo'],m:['starving'],b:'五分钟解决，还能边走边吃。'},
  {n:'肠粉',e:'🥟',c:'早餐',s:0,o:1,p:18,sc:['solo'],m:['light','normal'],b:'滑嫩清爽，早餐里的最优解。'},
  {n:'豆浆油条',e:'🥟',c:'早餐',s:0,o:2,p:12,sc:['solo'],m:['normal'],b:'最传统的组合，从来没出过错。'},
  {n:'燕麦酸奶碗',e:'🥣',c:'早餐',s:0,o:0,p:20,sc:['solo'],m:['light'],cold:1,b:'三分钟搞定，身体会感谢你的。'},
  {n:'皮蛋瘦肉粥',e:'🥣',c:'早餐',s:0,o:0,p:16,sc:['solo'],m:['light'],b:'温和到可以天天吃，不会腻。'},
  {n:'关东煮',e:'🍢',c:'轻食',s:0,o:0,p:25,sc:['solo'],m:['light','normal'],b:'一小格一小格慢慢挑，看着就放松。'},
  {n:'饭团',e:'🍙',c:'轻食',s:0,o:0,p:12,sc:['solo'],m:['light'],cold:1,b:'小小一个，垫肚子刚好，不耽误事。'},
  {n:'包子配粥',e:'🥟',c:'轻食',s:0,o:1,p:14,sc:['solo'],m:['light','normal'],b:'热乎、便宜、不用思考，早餐三件套。'},
];

/* ═══════════════ 配置 ═══════════════ */
const SCENES = [
  {k:'solo', e:'🙋', t:'一个人吃', d:'不用迁就任何人，随便点'},
  {k:'duo',  e:'👫', t:'两个人',   d:'要能一起点、一起吃的'},
  {k:'fam',  e:'👨‍👩‍👧', t:'一家人',   d:'老人小孩都能动筷'},
  {k:'grp',  e:'👯', t:'一群人',   d:'得够热闹、够分量的'},
];
const MOODS = [
  {k:'starving', e:'🔥', t:'饿到发抖',   d:'要快、要顶饱、要扎实'},
  {k:'normal',   e:'🙂', t:'正常饿',     d:'不挑，正常来一顿就行'},
  {k:'light',    e:'🍃', t:'没什么胃口', d:'清淡点，别油别辣'},
  {k:'treat',    e:'✨', t:'想犒劳自己', d:'今天就该吃好一点'},
];
const AVOIDS = [
  {k:'辣', e:'🌶️', t:'不吃辣'},
  {k:'油', e:'💧', t:'怕油腻'},
  {k:'冷', e:'🧊', t:'不吃生冷'},
  {k:'壳', e:'🦴', t:'懒得剥壳去骨'},
  {k:'贵', e:'💸', t:'太贵了不行'},
];
const SCENE_TXT = {solo:'一个人吃',duo:'两个人吃',fam:'一家人吃',grp:'一群人吃'};
const MOOD_TXT = {starving:'饿到发抖',normal:'正常饿',light:'没什么胃口',treat:'想犒劳自己'};

/* ═══════════════ 状态 ═══════════════ */
const S = { step:0, scene:null, mood:null, avoid:[], excluded:[], cur:null, swaps:0, relaxed:false, whyNotes:[] };
const $ = id => document.getElementById(id);
const store = {
  get(){ try{ return JSON.parse(localStorage.getItem('eatwhat_v1')||'[]') }catch(e){ return [] } },
  add(rec){ const a = store.get(); a.unshift(rec); localStorage.setItem('eatwhat_v1', JSON.stringify(a.slice(0,80))); },
  clear(){ localStorage.removeItem('eatwhat_v1'); }
};

/* ═══════════════ 视图切换 ═══════════════ */
function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
  const el = $(id);
  el.classList.add('on');
  el.style.animation='none'; void el.offsetWidth; el.style.animation='';
  window.scrollTo({top:0,behavior:'instant'});
}

/* ═══════════════ 步骤渲染 ═══════════════ */
const STEP_DEF = [
  {title:'几个人吃？', hint:'先定人数，能砍掉一半错误选项。', cfg:SCENES, key:'scene'},
  {title:'现在有多饿？', hint:'饿的程度决定要不要点硬菜。', cfg:MOODS, key:'mood'},
  {title:'有什么不吃的？', hint:'可以多选，也可以直接跳过。', cfg:AVOIDS, key:'avoid', multi:true},
];

function renderStep(){
  const d = STEP_DEF[S.step];
  $('stepTitle').textContent = d.title;
  $('stepHint').textContent = d.hint;
  document.querySelectorAll('.steps i').forEach((el,i)=>{
    el.className = i < S.step ? 'done' : (i === S.step ? 'on' : '');
  });

  const box = $('stepOpts');
  box.innerHTML = '';

  if (d.multi){
    const wrap = document.createElement('div');
    wrap.className = 'chips';
    d.cfg.forEach(c=>{
      const b = document.createElement('button');
      b.className = 'chip' + (S.avoid.includes(c.k)?' sel':'');
      b.innerHTML = `<span class="x">${c.e}</span>${c.t}`;
      b.onclick = ()=>{
        const i = S.avoid.indexOf(c.k);
        if (i > -1) S.avoid.splice(i,1); else S.avoid.push(c.k);
        b.classList.toggle('sel');
        $('stepNext').textContent = S.avoid.length ? '就按这个找' : '开始帮我找';
      };
      wrap.appendChild(b);
    });
    box.appendChild(wrap);
  } else {
    d.cfg.forEach(c=>{
      const b = document.createElement('button');
      b.className = 'opt' + (S[d.key]===c.k ? ' sel':'');
      b.innerHTML = `
        <span class="ico">${c.e}</span>
        <span class="tx"><b>${c.t}</b><span>${c.d}</span></span>
        <span class="tick">✓</span>`;
      b.onclick = ()=>{
        S[d.key] = c.k;
        box.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
        b.classList.add('sel');
        $('stepNext').disabled = false;
      };
      box.appendChild(b);
    });
  }

  $('stepBack').textContent = S.step === 0 ? '返回' : '上一步';
  $('stepNext').disabled = S.step === 2 ? false : !S[d.key];
  $('stepNext').textContent = S.step === 2 ? (S.avoid.length?'就按这个找':'开始帮我找') : '下一步';
  show('s-step');
}

$('startBtn').onclick = ()=>{ S.step = 0; S.scene = S.mood = null; S.avoid = []; renderStep(); };
$('restartBtn').onclick = ()=>{ S.step = 0; S.scene = S.mood = null; S.avoid = []; S.excluded = []; S.swaps = 0; renderStep(); };
$('stepBack').onclick = ()=>{ if (S.step === 0) show('s-intro'); else { S.step--; renderStep(); } };
$('stepNext').onclick = ()=>{
  if (S.step < 2){ S.step++; renderStep(); }
  else { startPick(); }
};

/* ═══════════════ 核心：挑选 ═══════════════ */
function pick(){
  S.relaxed = false;
  const inScene = d => d.sc.includes(S.scene);
  const passAvoid = d => {
    if (S.avoid.includes('辣') && d.s >= 2) return false;
    if (S.avoid.includes('油') && d.o >= 2) return false;
    if (S.avoid.includes('冷') && d.cold) return false;
    if (S.avoid.includes('壳') && d.shell) return false;
    if (S.avoid.includes('贵') && d.p > 45) return false;
    return true;
  };
  const notUsed = d => !S.excluded.includes(d.n);

  // 三层收敛：全条件 → 去掉心情 → 只保场景
  let tier1 = DISHES.filter(d => notUsed(d) && inScene(d) && passAvoid(d) && d.m.includes(S.mood));
  let tier2 = DISHES.filter(d => notUsed(d) && inScene(d) && passAvoid(d));
  let tier3 = DISHES.filter(d => notUsed(d) && inScene(d));
  let pool = tier1.length ? tier1 : (tier2.length ? tier2 : tier3);
  if (!tier1.length) S.relaxed = true;
  if (!pool.length){ S.excluded = []; pool = DISHES.filter(d => inScene(d)); S.relaxed = true; }

  // 加权
  const scored = pool.map(d=>{
    let w = 3;
    if (d.m.includes(S.mood)) w += 6;
    if (S.mood === 'starving' && d.p >= 26) w += 2;
    if (S.mood === 'starving' && d.s > 0) w += 1;
    if (S.mood === 'light' && d.o <= 1) w += 3;
    if (S.mood === 'treat' && d.p >= 45) w += 3;
    if (S.mood === 'treat' && d.o >= 2) w += 1;
    if (S.mood === 'normal' && d.o >= 3) w -= 1;
    return {d, w: Math.max(1, w)};
  });
  const total = scored.reduce((a,b)=>a+b.w, 0);
  let r = Math.random() * total;
  for (const it of scored){ r -= it.w; if (r <= 0) return it.d; }
  return scored[scored.length-1].d;
}

const LOADS = ['正在翻你家冰箱…','划掉昨天刚吃过的那几家…','算一下你今天的胃口…','问问隔壁桌的老王…','就快好了，别再想了…'];
let loadTimer = null;
function startPick(){
  show('s-loading');
  let i = 0;
  $('loadTxt').textContent = LOADS[0];
  $('loadTxt').style.opacity = 1;
  clearInterval(loadTimer);
  loadTimer = setInterval(()=>{
    i++;
    if (i < LOADS.length){
      $('loadTxt').style.opacity = 0;
      setTimeout(()=>{ $('loadTxt').textContent = LOADS[i]; $('loadTxt').style.opacity = 1; }, 160);
    }
  }, 320);
  setTimeout(()=>{
    clearInterval(loadTimer);
    S.swaps = 0;
    const d = pick();
    S.cur = d;
    renderResult(d);
    show('s-result');
  }, 1500);
}

/* ═══════════════ 结果渲染 ═══════════════ */
function renderResult(d){
  $('rEmoji').textContent = d.e;
  $('rName').textContent = d.n;
  $('rCat').textContent = `${d.c} · 人均 ¥${d.p} 左右`;

  const blurbs = {
    starving:'先吃上再说，别的都是后话。',
    light:'今天别为难自己的胃。',
    treat:'今天你值得一顿像样的。',
    normal:'不用多想，这个不会让你失望。'
  };
  $('rBlurb').textContent = d.b;

  const spicy = d.s === 0 ? '不辣' : '🌶'.repeat(d.s);
  $('rMeta').innerHTML = `
    <span class="mtag">${spicy}</span>
    <span class="mtag">💰 人均 ¥${d.p}</span>
    <span class="mtag">👥 ${SCENE_TXT[S.scene]}</span>
    ${d.shell?'<span class="mtag">🦴 要动手剥</span>':''}
    ${d.cold?'<span class="mtag">🧊 是凉的</span>':''}`;

  // 决策依据
  const list = [];
  list.push(`人数锁定在「${SCENE_TXT[S.scene]}」，不符合的 ${DISHES.length - DISHES.filter(x=>x.sc.includes(S.scene)).length} 道已经删掉了`);
  if (!S.relaxed && d.m.includes(S.mood)) list.push(`你选了「${MOOD_TXT[S.mood]}」，它的分量和口味正好对得上`);
  if (S.avoid.length === 0) list.push('你没设忌口，所以全品类都在候选里');
  else list.push(`避开了你不想吃的：${S.avoid.join('、')}`);
  if (d.p > 60) list.push('这顿偏贵，符合「犒劳自己」的定位');
  const whyEl = $('rWhy');
  whyEl.innerHTML = list.map(t=>`<li><i>✓</i><span>${t}</span></li>`).join('');
  if (S.relaxed){
    whyEl.insertAdjacentHTML('beforeend',
      `<li class="warn"><i>!</i><span>你的条件有点苛刻，我把范围放宽了一点</span></li>`);
  }

  // 换一个按钮状态
  const btn = $('swapBtn'), note = $('swapNote');
  const left = 5 - S.swaps;
  if (left <= 0){
    btn.disabled = true;
    btn.textContent = '不能再换了';
    note.innerHTML = '<b>已经换 5 次了。</b>今天就这么定吧，再挑下去饭就凉了。';
  } else {
    btn.disabled = false;
    btn.textContent = '换一个';
    if (S.swaps === 0) note.textContent = '';
    else if (S.swaps < 3) note.innerHTML = `已经换过 <b>${S.swaps}</b> 次了，可选范围正在变小。`;
    else note.innerHTML = `换了 <b>${S.swaps}</b> 次还没满意？说实话，第一个可能就挺好。`;
  }
}

$('swapBtn').onclick = ()=>{
  if (!S.cur) return;
  S.excluded.push(S.cur.n);
  S.swaps++;
  const d = pick();
  S.cur = d;
  const el = document.querySelector('.res-wrap');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  renderResult(d);
};

$('lockBtn').onclick = ()=>{
  const d = S.cur;
  if (!d) return;
  store.add({n:d.n, e:d.e, t:Date.now()});
  refreshCount();
  const recs = store.get();
  const monthCount = recs.filter(r=>new Date(r.t).getMonth()===new Date().getMonth() && new Date(r.t).getFullYear()===new Date().getFullYear()).length;
  $('sheetEmoji').textContent = '🎉';
  $('sheetTitle').textContent = '定了，就吃这个';
  $('sheetDesc').innerHTML = `已记下 <b>${d.n}</b><br>这是你本月第 ${monthCount} 次让它替你做决定。`;
  $('sheetBtn').textContent = '好，去吃';
  $('sheet').classList.add('on');
};
$('sheetBtn').onclick = ()=>{
  $('sheet').classList.remove('on');
  show('s-intro');
  renderPrev();
};

/* ═══════════════ 记录 ═══════════════ */
function refreshCount(){
  const n = store.get().length;
  $('recCount').textContent = n;
}
function renderPrev(){
  const recs = store.get();
  const slot = $('prevSlot');
  if (!recs.length){ slot.innerHTML = ''; return; }
  const r = recs[0];
  const diff = Date.now() - r.t;
  const txt = diff < 3600e3 ? Math.max(1,Math.round(diff/60e3))+' 分钟前'
            : diff < 86400e3 ? Math.round(diff/3600e3)+' 小时前'
            : Math.round(diff/86400e3)+' 天前';
  slot.innerHTML = `<div class="prev-card"><span class="e">${r.e}</span>
    上一次吃的是 <b>${r.n}</b><span class="ago">${txt}</span></div>`;
}
$('openRec').onclick = ()=>{
  const recs = store.get();
  const now = new Date();
  const month = recs.filter(r=>new Date(r.t).getMonth()===now.getMonth() && new Date(r.t).getFullYear()===now.getFullYear());
  const unique = new Set(month.map(r=>r.n)).size;
  $('recStats').innerHTML = `
    <div class="stat"><b>${month.length}</b><span>本月决定</span></div>
    <div class="stat"><b>${unique}</b><span>不同种类</span></div>
    <div class="stat"><b>${recs.length}</b><span>累计次数</span></div>`;
  if (!recs.length){
    $('recList').innerHTML = '<div class="empty">还没有记录。<br>先去让「吃啥」替你定一顿饭吧。</div>';
  } else {
    $('recList').innerHTML = recs.map(r=>{
      const dt = new Date(r.t);
      const s = `${dt.getMonth()+1}月${dt.getDate()}日 ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
      return `<div class="rec-item"><span class="e">${r.e}</span><span class="n">${r.n}</span><span class="d">${s}</span></div>`;
    }).join('');
  }
  show('s-rec');
};
$('recBack').onclick = ()=>{ renderPrev(); show('s-intro'); };
$('recClear').onclick = ()=>{
  if (!store.get().length) return toast('本来就没有记录');
  store.clear(); refreshCount(); renderPrev();
  $('recStats').innerHTML = '';
  $('recList').innerHTML = '<div class="empty">记录清空了。<br>下一顿重新开始。</div>';
  toast('已清空记录');
};

function toast(msg){
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(t._tm);
  t._tm = setTimeout(()=>t.classList.remove('on'), 1800);
}

/* ═══════════════ 分享卡（Canvas 导出） ═══════════════ */
function wrapText(ctx, text, x, y, maxW, lh){
  let line = '', lines = [];
  for (const ch of text){
    if (ctx.measureText(line + ch).width > maxW && line){ lines.push(line); line = ch; }
    else line += ch;
  }
  if (line) lines.push(line);
  lines.forEach((l,i)=> ctx.fillText(l, x, y + i*lh));
  return y + lines.length*lh;
}

$('shareBtn').onclick = ()=>{
  const d = S.cur;
  if (!d) return;
  const W = 680, H = 920, K = 2;
  const cv = document.createElement('canvas');
  cv.width = W*K; cv.height = H*K;
  const x = cv.getContext('2d');
  x.scale(K,K);

  // 背景
  x.fillStyle = '#FFF6EC'; x.fillRect(0,0,W,H);
  const g1 = x.createRadialGradient(80,-60,0,80,-60,520);
  g1.addColorStop(0,'rgba(255,201,64,.42)'); g1.addColorStop(1,'rgba(255,201,64,0)');
  x.fillStyle = g1; x.fillRect(0,0,W,H);
  const g2 = x.createRadialGradient(W-40,300,0,W-40,300,480);
  g2.addColorStop(0,'rgba(255,91,51,.22)'); g2.addColorStop(1,'rgba(255,91,51,0)');
  x.fillStyle = g2; x.fillRect(0,0,W,H);

  // 品牌
  x.fillStyle = '#B9A695';
  x.font = '700 15px system-ui,"PingFang SC","Microsoft YaHei",sans-serif';
  x.textAlign = 'left';
  x.fillText('吃 啥 · JUST PICK ONE', 56, 78);
  x.textAlign = 'right';
  x.fillText(new Date().toLocaleDateString('zh-CN'), W-56, 78);

  // 主卡
  const cx = 56, cy = 118, cw = W-112, ch = 560;
  x.save();
  x.shadowColor = 'rgba(120,70,35,.16)'; x.shadowBlur = 44; x.shadowOffsetY = 18;
  x.fillStyle = '#fff';
  x.beginPath(); x.roundRect(cx, cy, cw, ch, 34); x.fill();
  x.restore();

  // 卡内头部暖色块
  x.save();
  x.beginPath(); x.roundRect(cx, cy, cw, 250, [34,34,0,0]); x.clip();
  const g3 = x.createLinearGradient(cx, cy, cx+cw, cy+250);
  g3.addColorStop(0,'#FFF2E4'); g3.addColorStop(1,'#FFD9C5');
  x.fillStyle = g3; x.fillRect(cx, cy, cw, 250);
  x.restore();

  // 小标签
  x.fillStyle = 'rgba(255,255,255,.9)';
  x.beginPath(); x.roundRect(cx+150, cy+34, 100, 34, 17); x.fill();
  x.fillStyle = '#FF5B33'; x.textAlign = 'center';
  x.font = '800 14px system-ui,"PingFang SC",sans-serif';
  x.fillText('今天就吃', cx+200, cy+56);

  // emoji
  x.textAlign = 'center';
  x.font = '84px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
  x.fillText(d.e, cx+cw/2, cy+150);

  // 菜名
  x.fillStyle = '#2B1D14';
  x.font = '900 40px system-ui,"PingFang SC","Microsoft YaHei",sans-serif';
  x.fillText(d.n, cx+cw/2, cy+215);

  // 正文
  x.textAlign = 'left';
  x.fillStyle = '#4A3529';
  x.font = '600 20px system-ui,"PingFang SC","Microsoft YaHei",sans-serif';
  let ty = wrapText(x, d.b, cx+40, cy+310, cw-80, 34) + 26;

  // 分隔线
  x.strokeStyle = '#F1E4D6'; x.lineWidth = 2;
  x.beginPath(); x.setLineDash([6,8]); x.moveTo(cx+40, ty-6); x.lineTo(cx+cw-40, ty-6); x.stroke();
  x.setLineDash([]);

  // 依据
  const reasons = [
    `适合「${SCENE_TXT[S.scene]}」，人均 ¥${d.p} 左右`,
    `口味：${d.s===0?'不辣':'辣度 '+d.s+'/3'} · ${d.o>=3?'偏油':'清爽度尚可'}`,
    S.avoid.length ? `已避开：${S.avoid.join('、')}` : '没有忌口，全品类可选'
  ];
  x.font = '600 17px system-ui,"PingFang SC","Microsoft YaHei",sans-serif';
  reasons.forEach((r,i)=>{
    x.fillStyle = '#22B07D';
    x.fillText('✓', cx+42, ty+26+i*38);
    x.fillStyle = '#6B5546';
    x.fillText(r, cx+70, ty+26+i*38);
  });

  // 底部
  x.textAlign = 'center';
  x.fillStyle = '#CBB8A6';
  x.font = '700 15px system-ui,"PingFang SC","Microsoft YaHei",sans-serif';
  x.fillText('别再纠结了，就它了。', W/2, H-64);
  x.fillStyle = '#E0CFBE';
  x.font = '600 13px system-ui,"PingFang SC",sans-serif';
  x.fillText('— 由「吃啥」替你决定 · Made with WorkBuddy —', W/2, H-38);

  cv.toBlob(b=>{
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url;
    a.download = `今天吃_${d.n}.png`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 4000);
    toast('分享卡已保存到下载文件夹');
  }, 'image/png');
};

/* ═══════════════ 初始化 ═══════════════ */
refreshCount();
renderPrev();

const platformFooter = document.querySelector("[data-tiana-site-footer]");
if (platformFooter) { document.body.appendChild(platformFooter); document.body.style.display = "block"; document.querySelector("#app").style.marginInline = "auto"; }
