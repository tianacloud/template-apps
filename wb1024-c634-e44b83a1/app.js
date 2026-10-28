document.head.insertAdjacentHTML("beforeend","<style>\n  :root{\n    --bg:#faf6ef;\n    --panel:#ffffff;\n    --ink:#3d3229;\n    --ink-soft:#7a6a5a;\n    --ink-faint:#a8988a;\n    --line:#ece2d4;\n    --accent:#c25e3a;\n    --accent-deep:#a34a2c;\n    --accent-soft:#f6e3d8;\n    --gold:#b98a2f;\n    --shadow:0 10px 30px rgba(93,64,41,.10);\n    --shadow-lg:0 24px 60px rgba(93,64,41,.18);\n    --radius:18px;\n  }\n  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}\n  html{scroll-behavior:smooth}\n  body{\n    font-family:\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",\"Source Han Sans SC\",sans-serif;\n    background:var(--bg);color:var(--ink);line-height:1.7;\n    min-height:100vh;\n  }\n  .serif{font-family:\"Noto Serif SC\",\"Songti SC\",\"STSong\",\"SimSun\",serif}\n  button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}\n  input,textarea,select{font-family:inherit;color:inherit}\n  img{display:block;max-width:100%}\n\n  /* ===== 顶部 ===== */\n  header{\n    position:sticky;top:0;z-index:50;\n    background:rgba(250,246,239,.92);backdrop-filter:blur(10px);\n    border-bottom:1px solid var(--line);\n  }\n  .header-in{\n    max-width:1080px;margin:0 auto;padding:14px 20px;\n    display:flex;align-items:center;gap:18px;\n  }\n  .logo{display:flex;align-items:baseline;gap:10px;cursor:pointer}\n  .logo .mark{\n    width:34px;height:34px;border-radius:10px;\n    background:linear-gradient(135deg,var(--accent),#d98a5f);\n    color:#fff;display:flex;align-items:center;justify-content:center;\n    font-size:19px;font-weight:700;box-shadow:0 4px 12px rgba(194,94,58,.35);\n    align-self:center;\n  }\n  .logo h1{font-size:21px;letter-spacing:2px}\n  .logo .sub{font-size:12px;color:var(--ink-faint);letter-spacing:1px}\n  nav{margin-left:auto;display:flex;gap:6px;align-items:center}\n  .nav-btn{\n    padding:8px 14px;border-radius:10px;font-size:14px;color:var(--ink-soft);\n    transition:.2s;\n  }\n  .nav-btn:hover{background:#f1e8da;color:var(--ink)}\n  .nav-btn.active{background:var(--accent-soft);color:var(--accent-deep);font-weight:600}\n  .btn-add{\n    margin-left:6px;padding:9px 18px;border-radius:12px;font-size:14px;font-weight:600;\n    background:var(--accent);color:#fff;box-shadow:0 6px 16px rgba(194,94,58,.35);\n    transition:.2s;display:flex;align-items:center;gap:6px;\n  }\n  .btn-add:hover{background:var(--accent-deep);transform:translateY(-1px)}\n  .btn-add svg{width:15px;height:15px}\n\n  /* ===== Hero ===== */\n  .hero{\n    max-width:1080px;margin:0 auto;padding:56px 20px 30px;\n    display:grid;grid-template-columns:1.15fr .85fr;gap:48px;align-items:center;\n  }\n  .hero-tag{\n    display:inline-flex;align-items:center;gap:8px;\n    background:var(--accent-soft);color:var(--accent-deep);\n    font-size:13px;padding:6px 14px;border-radius:99px;margin-bottom:20px;font-weight:500;\n  }\n  .hero h2{font-size:clamp(30px,4.5vw,44px);line-height:1.35;letter-spacing:1px;font-weight:700}\n  .hero h2 em{font-style:normal;color:var(--accent);position:relative}\n  .hero h2 em::after{\n    content:\"\";position:absolute;left:0;right:0;bottom:4px;height:10px;\n    background:rgba(194,94,58,.14);z-index:-1;border-radius:4px;\n  }\n  .hero p.lead{margin-top:18px;font-size:16px;color:var(--ink-soft);max-width:32em}\n  .hero-cta{margin-top:28px;display:flex;gap:14px;flex-wrap:wrap;align-items:center}\n  .btn-primary{\n    padding:14px 30px;border-radius:14px;font-size:16px;font-weight:600;\n    background:var(--accent);color:#fff;box-shadow:0 10px 24px rgba(194,94,58,.35);transition:.2s;\n  }\n  .btn-primary:hover{background:var(--accent-deep);transform:translateY(-2px)}\n  .btn-ghost{\n    padding:13px 24px;border-radius:14px;font-size:15px;color:var(--ink-soft);\n    border:1.5px solid var(--line);transition:.2s;background:var(--panel);\n  }\n  .btn-ghost:hover{border-color:var(--accent);color:var(--accent-deep)}\n  .hero-steps{margin-top:34px;display:flex;gap:0}\n  .step{flex:1;display:flex;gap:10px;align-items:flex-start;padding-right:16px}\n  .step .num{\n    width:26px;height:26px;border-radius:50%;flex:none;\n    background:#fff;border:1.5px solid var(--accent);color:var(--accent-deep);\n    font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;\n  }\n  .step b{font-size:14px;display:block}\n  .step span{font-size:12px;color:var(--ink-faint);line-height:1.5;display:block}\n  /* hero 卡片插画 */\n  .hero-cards{position:relative;height:380px}\n  .hcard{\n    position:absolute;background:#fff;border-radius:16px;box-shadow:var(--shadow-lg);\n    overflow:hidden;width:200px;\n  }\n  .hcard .ph{height:150px;display:flex;align-items:center;justify-content:center;font-size:52px}\n  .hcard .cap{padding:12px 14px 14px}\n  .hcard .cap b{font-size:14px;display:block}\n  .hcard .cap span{font-size:12px;color:var(--ink-faint)}\n  .hc1{left:4%;top:6%;transform:rotate(-5deg);z-index:1}\n  .hc2{left:34%;top:26%;transform:rotate(3deg);z-index:2}\n  .hc3{left:60%;top:2%;transform:rotate(7deg);z-index:3}\n  .hc1 .ph{background:linear-gradient(140deg,#f3d9c3,#e8b591)}\n  .hc2 .ph{background:linear-gradient(140deg,#dce7d2,#b5cbA2)}\n  .hc3 .ph{background:linear-gradient(140deg,#f5e3c8,#e6c78f)}\n\n  /* ===== 主区 ===== */\n  main{max-width:1080px;margin:0 auto;padding:20px 20px 80px}\n  .sec-head{display:flex;align-items:center;gap:14px;margin:26px 0 18px;flex-wrap:wrap}\n  .sec-head h3{font-size:22px;letter-spacing:1px}\n  .sec-head .count{\n    font-size:13px;color:var(--ink-faint);background:#fff;border:1px solid var(--line);\n    padding:3px 12px;border-radius:99px;\n  }\n  .sec-head .right{margin-left:auto;display:flex;gap:8px}\n  .chip{\n    font-size:13px;padding:6px 14px;border-radius:99px;border:1px solid var(--line);\n    background:#fff;color:var(--ink-soft);transition:.2s;\n  }\n  .chip:hover{border-color:var(--accent);color:var(--accent-deep)}\n  .chip.active{background:var(--ink);color:#fff;border-color:var(--ink)}\n\n  /* 空状态 */\n  .empty{\n    text-align:center;padding:70px 20px;background:var(--panel);\n    border-radius:var(--radius);border:1.5px dashed var(--line);\n  }\n  .empty .big{font-size:44px;margin-bottom:12px}\n  .empty h4{font-size:19px;margin-bottom:8px}\n  .empty p{color:var(--ink-soft);font-size:14px;margin-bottom:22px}\n\n  /* 卡片网格 */\n  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:22px}\n  .card{\n    background:var(--panel);border-radius:var(--radius);overflow:hidden;\n    box-shadow:var(--shadow);cursor:pointer;transition:.25s;position:relative;\n    border:1px solid rgba(236,226,212,.6);\n    animation:pop .35s ease both;\n  }\n  @keyframes pop{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}\n  .card:hover{transform:translateY(-5px);box-shadow:var(--shadow-lg)}\n  .card .cover{height:185px;background:#f0e6d8;position:relative;overflow:hidden}\n  .card .cover img{width:100%;height:100%;object-fit:cover;transition:.4s}\n  .card:hover .cover img{transform:scale(1.04)}\n  .card .era{\n    position:absolute;top:12px;left:12px;background:rgba(61,50,41,.72);color:#fff;\n    font-size:12px;padding:3px 11px;border-radius:99px;backdrop-filter:blur(4px);\n  }\n  .card .body{padding:15px 16px 17px}\n  .card .body b{font-size:17px;display:block;margin-bottom:3px}\n  .card .body .from{font-size:13px;color:var(--accent-deep)}\n  .card .body .excerpt{\n    font-size:13px;color:var(--ink-faint);margin-top:8px;\n    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;\n  }\n\n  /* 时间线 */\n  .timeline{position:relative;padding-left:34px}\n  .timeline::before{\n    content:\"\";position:absolute;left:11px;top:6px;bottom:6px;width:2px;\n    background:linear-gradient(var(--accent) 0%,var(--line) 100%);border-radius:2px;\n  }\n  .tl-group{margin-bottom:34px;position:relative}\n  .tl-group .dot{\n    position:absolute;left:-31px;top:4px;width:16px;height:16px;border-radius:50%;\n    background:var(--accent);border:3.5px solid #fbeede;box-shadow:0 0 0 2px rgba(194,94,58,.25);\n  }\n  .tl-group h4{font-size:19px;margin-bottom:14px;color:var(--accent-deep)}\n  .tl-items{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}\n\n  /* 详情弹层 */\n  .overlay{\n    position:fixed;inset:0;background:rgba(46,35,26,.5);z-index:100;\n    display:flex;align-items:center;justify-content:center;padding:22px;\n    opacity:0;pointer-events:none;transition:.25s;\n  }\n  .overlay.show{opacity:1;pointer-events:auto}\n  .dialog{\n    background:var(--panel);border-radius:22px;width:100%;max-width:640px;\n    max-height:calc(100vh - 44px);overflow-y:auto;box-shadow:var(--shadow-lg);\n    transform:translateY(18px) scale(.98);transition:.25s;\n  }\n  .overlay.show .dialog{transform:none}\n  .dialog::-webkit-scrollbar{width:8px}\n  .dialog::-webkit-scrollbar-thumb{background:#e3d5c2;border-radius:8px}\n  .d-head{position:relative}\n  .d-head .imgwrap{height:300px;background:#efe5d6;overflow:hidden}\n  .d-head .imgwrap img{width:100%;height:100%;object-fit:cover}\n  .d-close{\n    position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;\n    background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;\n    box-shadow:0 4px 12px rgba(0,0,0,.15);transition:.2s;\n  }\n  .d-close:hover{transform:rotate(90deg)}\n  .d-close svg{width:16px;height:16px}\n  .d-body{padding:26px 30px 30px}\n  .d-era{font-size:13px;color:var(--gold);font-weight:600;letter-spacing:1px}\n  .d-body h3{font-size:26px;margin:4px 0 6px}\n  .d-from{font-size:14px;color:var(--accent-deep);margin-bottom:18px}\n  .d-story{\n    font-size:15.5px;color:#5a4c3e;white-space:pre-wrap;line-height:2;\n    padding:20px 22px;background:#fbf7f0;border-radius:14px;border:1px solid var(--line);\n  }\n  .d-tags{margin-top:16px;display:flex;gap:8px;flex-wrap:wrap}\n  .d-tags span{font-size:12px;background:var(--accent-soft);color:var(--accent-deep);padding:4px 12px;border-radius:99px}\n  .d-actions{margin-top:24px;display:flex;gap:10px;flex-wrap:wrap}\n  .d-actions button{\n    padding:10px 18px;border-radius:12px;font-size:14px;border:1.5px solid var(--line);\n    display:flex;align-items:center;gap:7px;transition:.2s;background:#fff;color:var(--ink-soft);\n  }\n  .d-actions button:hover{border-color:var(--accent);color:var(--accent-deep)}\n  .d-actions button.danger:hover{border-color:#c0392b;color:#c0392b}\n  .d-actions svg{width:15px;height:15px}\n  .d-actions .speak-on{background:var(--accent-soft);border-color:var(--accent);color:var(--accent-deep)}\n\n  /* 表单弹层 */\n  .form-dialog{max-width:560px;padding:30px 32px}\n  .form-dialog h3{font-size:21px;margin-bottom:4px}\n  .form-dialog .tip{font-size:13px;color:var(--ink-faint);margin-bottom:20px}\n  .f-row{margin-bottom:16px}\n  .f-row label{font-size:14px;font-weight:600;display:block;margin-bottom:7px}\n  .f-row label i{font-style:normal;color:var(--ink-faint);font-weight:400;font-size:12px;margin-left:6px}\n  .f-row input[type=text],.f-row input[type=number],.f-row textarea,.f-row select{\n    width:100%;padding:11px 14px;border-radius:11px;border:1.5px solid var(--line);\n    font-size:14.5px;background:#fdfaf5;outline:none;transition:.2s;\n  }\n  .f-row input:focus,.f-row textarea:focus{border-color:var(--accent);background:#fff}\n  .f-row textarea{min-height:130px;resize:vertical;line-height:1.8}\n  .f-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}\n  .upload-box{\n    border:1.5px dashed #d8c6ac;border-radius:14px;padding:18px;text-align:center;\n    cursor:pointer;transition:.2s;background:#fdfaf5;\n  }\n  .upload-box:hover{border-color:var(--accent);background:#fff}\n  .upload-box .plus{\n    width:44px;height:44px;margin:0 auto 8px;border-radius:12px;background:var(--accent-soft);\n    display:flex;align-items:center;justify-content:center;color:var(--accent-deep);\n  }\n  .upload-box .plus svg{width:20px;height:20px}\n  .upload-box p{font-size:13.5px;color:var(--ink-soft)}\n  .upload-box .hint{font-size:12px;color:var(--ink-faint);margin-top:2px}\n  .upload-preview{position:relative;border-radius:14px;overflow:hidden}\n  .upload-preview img{width:100%;max-height:260px;object-fit:cover}\n  .upload-preview .rm{\n    position:absolute;top:10px;right:10px;width:32px;height:32px;border-radius:50%;\n    background:rgba(0,0,0,.55);color:#fff;display:flex;align-items:center;justify-content:center;\n  }\n  .f-actions{margin-top:24px;display:flex;gap:12px;justify-content:flex-end}\n  .f-actions .save{\n    padding:12px 30px;border-radius:12px;background:var(--accent);color:#fff;\n    font-size:15px;font-weight:600;transition:.2s;\n  }\n  .f-actions .save:hover{background:var(--accent-deep)}\n  .f-actions .cancel{padding:12px 22px;font-size:14px;color:var(--ink-faint)}\n  .f-actions .cancel:hover{color:var(--ink)}\n\n  /* 关于 */\n  .about-box{\n    background:linear-gradient(150deg,#fff,#fbf4ea);border-radius:var(--radius);\n    padding:36px 34px;border:1px solid var(--line);margin-top:30px;\n  }\n  .about-box h3{font-size:20px;margin-bottom:12px}\n  .about-box p{font-size:14.5px;color:var(--ink-soft);margin-bottom:12px}\n  .about-box .lock{\n    display:flex;gap:10px;align-items:flex-start;margin-top:16px;padding:14px 16px;\n    background:#f2efe6;border-radius:12px;font-size:13.5px;color:var(--ink-soft);\n  }\n  .about-box .lock svg{width:17px;height:17px;flex:none;margin-top:3px;color:var(--gold)}\n  .data-actions{margin-top:20px;display:flex;gap:12px;flex-wrap:wrap}\n  .store-bar{\n    margin-top:18px;font-size:12.5px;color:var(--ink-faint);display:flex;align-items:center;gap:10px;\n  }\n  .store-bar .bar{flex:1;max-width:260px;height:6px;background:#eee3d2;border-radius:6px;overflow:hidden}\n  .store-bar .bar i{display:block;height:100%;background:linear-gradient(90deg,var(--gold),var(--accent));border-radius:6px;transition:.3s}\n\n  /* toast */\n  #toast{\n    position:fixed;bottom:34px;left:50%;transform:translate(-50%,20px);\n    background:rgba(61,50,41,.92);color:#fff;padding:11px 24px;border-radius:99px;\n    font-size:14px;z-index:300;opacity:0;pointer-events:none;transition:.3s;backdrop-filter:blur(6px);\n  }\n  #toast.show{opacity:1;transform:translate(-50%,0)}\n\n  footer{\n    border-top:1px solid var(--line);padding:26px 20px;text-align:center;\n    font-size:13px;color:var(--ink-faint);\n  }\n\n  @media(max-width:820px){\n    .hero{grid-template-columns:1fr;padding-top:36px}\n    .hero-cards{display:none}\n    .hero-steps{flex-direction:column;gap:14px}\n    .header-in{padding:12px 14px;gap:8px}\n    .logo .sub{display:none}\n    nav .nav-btn{padding:7px 9px;font-size:13px}\n    .btn-add span{display:none}\n    .d-body{padding:20px 20px 24px}\n    .d-head .imgwrap{height:230px}\n    .f-grid2{grid-template-columns:1fr}\n  }\n</style>");
document.body.insertAdjacentHTML("beforeend","\n\n<header>\n  <div class=\"header-in\">\n    <div class=\"logo\" onclick=\"scrollTop()\">\n      <div class=\"mark serif\">念</div>\n      <div>\n        <h1 class=\"serif\">念物</h1>\n        <div class=\"sub\">家的记忆馆</div>\n      </div>\n    </div>\n    <nav>\n      <button class=\"nav-btn active\" id=\"navGrid\" onclick=\"switchView('grid')\">我的物件</button>\n      <button class=\"nav-btn\" id=\"navTime\" onclick=\"switchView('time')\">岁月时间线</button>\n      <button class=\"nav-btn\" onclick=\"openAbout()\">关于</button>\n      <button class=\"btn-add\" onclick=\"openForm()\">\n        <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"><path d=\"M12 5v14M5 12h14\"/></svg>\n        <span>记录一件物件</span>\n      </button>\n    </nav>\n  </div>\n</header>\n\n<section class=\"hero\">\n  <div>\n    <div class=\"hero-tag\">◍ 1024 · 遗物挑战参赛作品</div>\n    <h2 class=\"serif\">每件老物件，<br>都是一份<em>没说出口的爱</em></h2>\n    <p class=\"lead\">外婆的顶针、父亲的旧手表、小时候的铁皮饼干盒……它们不会说话，却装着一整个家的时间。拍下它，写下它的故事，把记忆留给下一个十年。</p>\n    <div class=\"hero-cta\">\n      <button class=\"btn-primary\" onclick=\"openForm()\">开始记录第一件</button>\n      <button class=\"btn-ghost\" onclick=\"loadSamples()\">先看看示例</button>\n    </div>\n    <div class=\"hero-steps\">\n      <div class=\"step\"><div class=\"num\">1</div><div><b>拍下它</b><span>手机拍照或选一张照片</span></div></div>\n      <div class=\"step\"><div class=\"num\">2</div><div><b>写下故事</b><span>它从哪儿来，藏着什么回忆</span></div></div>\n      <div class=\"step\"><div class=\"num\">3</div><div><b>留给家人</b><span>生成记忆卡片，分享给爱的人</span></div></div>\n    </div>\n  </div>\n  <div class=\"hero-cards\">\n    <div class=\"hcard hc1\"><div class=\"ph\">🧵</div><div class=\"cap\"><b>外婆的顶针</b><span>来自外婆 · 1960年代</span></div></div>\n    <div class=\"hcard hc2\"><div class=\"ph\">📻</div><div class=\"cap\"><b>爷爷的收音机</b><span>来自爷爷 · 1978年</span></div></div>\n    <div class=\"hcard hc3\"><div class=\"ph\">🍬</div><div class=\"cap\"><b>铁皮饼干盒</b><span>来自妈妈 · 1990年代</span></div></div>\n  </div>\n</section>\n\n<main>\n  <div class=\"sec-head\" id=\"listHead\" style=\"display:none\">\n    <h3 class=\"serif\" id=\"secTitle\">我的物件</h3>\n    <span class=\"count\" id=\"secCount\"></span>\n    <div class=\"right\" id=\"tagFilter\"></div>\n  </div>\n  <div id=\"viewGrid\" class=\"grid\"></div>\n  <div id=\"viewTime\" class=\"timeline\" style=\"display:none\"></div>\n\n  <div class=\"about-box\" id=\"about\">\n    <h3 class=\"serif\">关于「念物」</h3>\n    <p>「念物」是一个记录家中老物件的记忆小馆。我们常常在整理旧物时才想起：那些不起眼的物件——一枚顶针、一块手表、一个饼干盒——其实承载着最珍贵的人和事。趁还记得，把它写下来。</p>\n    <p>你可以为每件物件拍照、记录来源与年代、写下它的故事，还能一键生成一张精美的「记忆卡片」发给家人，或用「岁月时间线」按年代回望家的历史。</p>\n    <div class=\"lock\">\n      <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/></svg>\n      <span><b>隐私承诺：</b>所有照片与故事只保存在你自己的设备上，不经过任何服务器。你也可以随时导出备份文件，或在换设备时导入。</span>\n    </div>\n    <div class=\"data-actions\">\n      <button class=\"chip\" onclick=\"exportJSON()\">导出备份文件</button>\n      <button class=\"chip\" onclick=\"document.getElementById('importFile').click()\">从备份导入</button>\n      <input type=\"file\" id=\"importFile\" accept=\".json\" style=\"display:none\" onchange=\"importJSON(this)\">\n    </div>\n    <div class=\"store-bar\" id=\"storeBar\" style=\"display:none\">\n      <span>本机存储</span>\n      <div class=\"bar\"><i id=\"storeFill\" style=\"width:0%\"></i></div>\n      <span id=\"storeText\"></span>\n    </div>\n  </div>\n</main>\n\n<footer>念物 · 家的记忆馆 — 趁还记得，把爱写下来。<br>1024 程序员节「遗物挑战」参赛作品 · 作者 刘腾</footer>\n\n<!-- 详情 -->\n<div class=\"overlay\" id=\"ovDetail\" onclick=\"if(event.target===this)closeDetail()\">\n  <div class=\"dialog\">\n    <div class=\"d-head\">\n      <div class=\"imgwrap\"><img id=\"dImg\" alt=\"\"></div>\n      <button class=\"d-close\" onclick=\"closeDetail()\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"><path d=\"M18 6L6 18M6 6l12 12\"/></svg></button>\n    </div>\n    <div class=\"d-body\">\n      <div class=\"d-era\" id=\"dEra\"></div>\n      <h3 class=\"serif\" id=\"dName\"></h3>\n      <div class=\"d-from\" id=\"dFrom\"></div>\n      <div class=\"d-story serif\" id=\"dStory\"></div>\n      <div class=\"d-tags\" id=\"dTags\"></div>\n      <div class=\"d-actions\">\n        <button id=\"btnSpeak\" onclick=\"toggleSpeak()\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 5L6 9H2v6h4l5 4V5z\"/><path d=\"M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13\"/></svg><span id=\"speakText\">听我读</span></button>\n        <button onclick=\"exportCard()\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"M7 10l5 5 5-5\"/><path d=\"M12 15V3\"/></svg>保存记忆卡片</button>\n        <button onclick=\"editCurrent()\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 20h9\"/><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z\"/></svg>编辑</button>\n        <button class=\"danger\" onclick=\"deleteCurrent()\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/></svg>删除</button>\n      </div>\n    </div>\n  </div>\n</div>\n\n<!-- 表单 -->\n<div class=\"overlay\" id=\"ovForm\" onclick=\"if(event.target===this)closeForm()\">\n  <div class=\"dialog form-dialog\">\n    <h3 class=\"serif\" id=\"formTitle\">记录一件物件</h3>\n    <div class=\"tip\">不用写得多好，像跟家人聊天一样就好。</div>\n    <div class=\"f-row\" id=\"photoRow\">\n      <label>物件照片 <i>手机拍照或从相册选择</i></label>\n      <div class=\"upload-box\" id=\"uploadBox\" onclick=\"document.getElementById('fileInput').click()\">\n        <div class=\"plus\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/></svg></div>\n        <p>点击上传照片</p>\n        <div class=\"hint\">照片会压缩后保存在本机，不会上传</div>\n      </div>\n      <div class=\"upload-preview\" id=\"uploadPreview\" style=\"display:none\">\n        <img id=\"previewImg\" alt=\"\">\n        <button class=\"rm\" type=\"button\" onclick=\"removePhoto(event)\"><svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"><path d=\"M18 6L6 18M6 6l12 12\"/></svg></button>\n      </div>\n      <input type=\"file\" id=\"fileInput\" accept=\"image/*\" style=\"display:none\" onchange=\"onPhoto(this)\">\n    </div>\n    <div class=\"f-row\">\n      <label>物件名字 <i>必填，例如：外婆的顶针</i></label>\n      <input type=\"text\" id=\"fName\" maxlength=\"30\" placeholder=\"给它起个名字\">\n    </div>\n    <div class=\"f-grid2\">\n      <div class=\"f-row\">\n        <label>来自谁 <i>例如：外婆、父亲</i></label>\n        <input type=\"text\" id=\"fFrom\" maxlength=\"20\" placeholder=\"它的主人或来源\">\n      </div>\n      <div class=\"f-row\">\n        <label>大约年代 <i>例如：1978</i></label>\n        <input type=\"number\" id=\"fEra\" min=\"1900\" max=\"2030\" placeholder=\"1978\">\n      </div>\n    </div>\n    <div class=\"f-row\">\n      <label>它的故事 <i>它从哪儿来？谁用过它？有什么难忘的事？</i></label>\n      <textarea id=\"fStory\" maxlength=\"2000\" placeholder=\"比如：这是外婆做衣服时戴的顶针，小时候总看她坐在缝纫机前，一针一线给我做过年穿的新衣裳……\"></textarea>\n    </div>\n    <div class=\"f-row\">\n      <label>标签 <i>选填，逗号分隔，例如：缝纫,童年,外婆</i></label>\n      <input type=\"text\" id=\"fTags\" maxlength=\"60\" placeholder=\"缝纫, 童年\">\n    </div>\n    <div class=\"f-actions\">\n      <button class=\"cancel\" onclick=\"closeForm()\">取消</button>\n      <button class=\"save\" onclick=\"saveForm()\">保存</button>\n    </div>\n  </div>\n</div>\n\n<div id=\"toast\"></div>\n\n");

"use strict";
/* ================= 数据层 ================= */
var AUTHOR = "刘腾";
var KEY = "nianwu_items_v1";
var items = [];
try { items = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch(e){ items = []; }

function save(){ localStorage.setItem(KEY, JSON.stringify(items)); updateStoreBar(); }

function esc(s){
  return String(s||"").replace(/[&<>"']/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  });
}
function toast(msg){
  var t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._tm); t._tm = setTimeout(function(){ t.classList.remove("show"); }, 2200);
}
function eraLabel(n){ return n ? n + " 年" : ""; }

/* ================= 视图切换 ================= */
var curView = "grid";
function switchView(v){
  curView = v;
  document.getElementById("viewGrid").style.display = v==="grid" ? "grid" : "none";
  document.getElementById("viewTime").style.display = v==="time" ? "block" : "none";
  document.getElementById("navGrid").classList.toggle("active", v==="grid");
  document.getElementById("navTime").classList.toggle("active", v==="time");
  document.getElementById("secTitle").textContent = v==="grid" ? "我的物件" : "岁月时间线";
  render();
}
function scrollTop(){ window.scrollTo({top:0, behavior:"smooth"}); }

/* ================= 渲染 ================= */
function coverHTML(it){
  if(it.image) return '<img src="'+it.image+'" alt="'+esc(it.name)+'" loading="lazy">';
  return '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:56px;background:linear-gradient(140deg,#f3e3cf,#e7c9a4)">'+(it.icon||"📦")+"</div>";
}
function cardHTML(it){
  var from = it.from ? "来自 " + esc(it.from) : "来源未记录";
  var ex = (it.story||"").slice(0,60);
  return '<div class="card" onclick="openDetail(\''+it.id+'\')">'+
    '<div class="cover">'+coverHTML(it)+(it.era?'<span class="era">'+it.era+" 年代</span>":"")+"</div>"+
    '<div class="body"><b class="serif">'+esc(it.name)+"</b>"+
    '<span class="from">'+from+"</span>"+
    (ex?'<div class="excerpt">'+esc(ex)+"…</div>":"")+"</div></div>";
}
function render(){
  var grid = document.getElementById("viewGrid");
  var tl = document.getElementById("viewTime");
  var head = document.getElementById("listHead");
  document.querySelector(".hero").style.display = items.length ? "none" : "";
  if(!items.length){
    head.style.display = "none"; grid.innerHTML = ""; tl.innerHTML = "";
    grid.style.display = "block";
    grid.innerHTML = '<div class="empty"><div class="big">🏡</div><h4>记忆馆还是空的</h4>'+
      '<p>从家里找一个有故事的物件开始吧，一枚顶针、一块旧手表，都很好。</p>'+
      '<button class="btn-primary" onclick="openForm()">记录第一件物件</button> '+
      '<button class="btn-ghost" style="margin-left:10px" onclick="loadSamples()">看看示例</button></div>';
    return;
  }
  head.style.display = "flex";
  document.getElementById("secCount").textContent = "共 " + items.length + " 件";
  renderTagFilter();
  if(curView === "grid"){
    var sorted = items.filter(function(it){ return !activeTag || (it.tags||[]).includes(activeTag); }).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });
    grid.innerHTML = sorted.map(cardHTML).join("");
  } else {
    var groups = {};
    items.filter(function(it){ return !activeTag || (it.tags||[]).includes(activeTag); }).forEach(function(it){
      var g = it.era ? Math.floor(it.era/10)*10 + " 年代" : "年代不详";
      (groups[g] = groups[g] || []).push(it);
    });
    var keys = Object.keys(groups).sort(function(a,b){
      if(a==="年代不详") return 1; if(b==="年代不详") return -1;
      return parseInt(b) - parseInt(a);
    });
    tl.innerHTML = keys.map(function(k){
      return '<div class="tl-group"><span class="dot"></span><h4 class="serif">'+k+"</h4>"+
        '<div class="tl-items">'+groups[k].map(cardHTML).join("")+"</div></div>";
    }).join("");
  }
}
var activeTag = "";
function renderTagFilter(){
  var tags = {};
  items.forEach(function(it){ (it.tags||[]).forEach(function(t){ tags[t]=(tags[t]||0)+1; }); });
  var box = document.getElementById("tagFilter");
  var keys = Object.keys(tags).sort(function(a,b){ return tags[b]-tags[a]; }).slice(0,8);
  if(!keys.length){ box.innerHTML=""; return; }
  box.innerHTML = keys.map(function(t){
    return '<button class="chip'+(activeTag===t?" active":"")+'" onclick="toggleTag(\''+esc(t)+'\')">'+esc(t)+"</button>";
  }).join("");
}
function toggleTag(t){ activeTag = activeTag===t ? "" : t; render(); }

/* ================= 照片 ================= */
var pendingPhoto = "";
function onPhoto(input){
  var f = input.files && input.files[0];
  if(!f) return;
  if(!/^image\//.test(f.type)){ toast("请选择图片文件"); return; }
  compress(f, 900, 0.72, function(dataURL){
    pendingPhoto = dataURL;
    document.getElementById("uploadBox").style.display = "none";
    var pv = document.getElementById("uploadPreview");
    pv.style.display = "block";
    document.getElementById("previewImg").src = dataURL;
  });
  input.value = "";
}
function removePhoto(e){
  e.stopPropagation();
  pendingPhoto = "";
  document.getElementById("uploadPreview").style.display = "none";
  document.getElementById("uploadBox").style.display = "block";
}
function compress(file, maxW, q, cb){
  var reader = new FileReader();
  reader.onload = function(){
    var img = new Image();
    img.onload = function(){
      var w = img.width, h = img.height;
      if(w > maxW){ h = Math.round(h*maxW/w); w = maxW; }
      var c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      cb(c.toDataURL("image/jpeg", q));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

/* ================= 表单 ================= */
var editingId = null;
function openForm(it){
  editingId = it ? it.id : null;
  document.getElementById("formTitle").textContent = it ? "编辑物件" : "记录一件物件";
  pendingPhoto = it ? (it.image||"") : "";
  document.getElementById("fName").value = it ? it.name : "";
  document.getElementById("fFrom").value = it ? (it.from||"") : "";
  document.getElementById("fEra").value = it && it.era ? it.era : "";
  document.getElementById("fStory").value = it ? (it.story||"") : "";
  document.getElementById("fTags").value = it ? (it.tags||[]).join(", ") : "";
  if(pendingPhoto){
    document.getElementById("uploadBox").style.display = "none";
    var pv = document.getElementById("uploadPreview");
    pv.style.display = "block";
    document.getElementById("previewImg").src = pendingPhoto;
  } else {
    document.getElementById("uploadBox").style.display = "block";
    document.getElementById("uploadPreview").style.display = "none";
  }
  document.getElementById("ovForm").classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeForm(){
  document.getElementById("ovForm").classList.remove("show");
  document.body.style.overflow = "";
  editingId = null;
}
function saveForm(){
  var name = document.getElementById("fName").value.trim();
  if(!name){ toast("先给物件起个名字吧"); document.getElementById("fName").focus(); return; }
  var story = document.getElementById("fStory").value.trim();
  var tags = document.getElementById("fTags").value.split(/[,，、\s]+/).filter(Boolean).slice(0,6);
  var eraRaw = document.getElementById("fEra").value;
  var era = eraRaw ? parseInt(eraRaw,10) : null;
  var data = {
    name: name,
    from: document.getElementById("fFrom").value.trim(),
    era: era && era>1900 && era<2031 ? era : null,
    story: story,
    tags: tags,
    image: pendingPhoto || null
  };
  if(editingId){
    var it = items.find(function(x){ return x.id===editingId; });
    if(it){ Object.assign(it, data); }
    toast("已更新");
  } else {
    data.id = "it_" + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
    data.createdAt = Date.now();
    items.unshift(data);
    toast("已收进记忆馆");
  }
  save(); render(); closeForm();
}

/* ================= 详情 ================= */
var currentId = null, speaking = false;
function openDetail(id){
  var it = items.find(function(x){ return x.id===id; });
  if(!it) return;
  currentId = id;
  document.getElementById("dImg").src = it.image || placeholder(it);
  document.getElementById("dEra").textContent = it.era ? it.era + " 年代" : "";
  document.getElementById("dName").textContent = it.name;
  document.getElementById("dFrom").textContent = it.from ? "来自 · " + it.from : "";
  document.getElementById("dStory").textContent = it.story || "（还没有写下故事）";
  document.getElementById("dTags").innerHTML = (it.tags||[]).map(function(t){ return "<span>"+esc(t)+"</span>"; }).join("");
  document.getElementById("ovDetail").classList.add("show");
  document.body.style.overflow = "hidden";
}
function placeholder(it){
  var c = document.createElement("canvas"); c.width=600; c.height=460;
  var x = c.getContext("2d");
  var g = x.createLinearGradient(0,0,600,460);
  g.addColorStop(0,"#f3e3cf"); g.addColorStop(1,"#e3c19b");
  x.fillStyle = g; x.fillRect(0,0,600,460);
  x.fillStyle = "rgba(120,80,50,.5)";
  x.font = "170px serif"; x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText((it.icon||"📦"), 300, 230);
  return c.toDataURL();
}
function closeDetail(){
  stopSpeak();
  document.getElementById("ovDetail").classList.remove("show");
  document.body.style.overflow = "";
  currentId = null;
}
function editCurrent(){
  var it = items.find(function(x){ return x.id===currentId; });
  closeDetail(); openForm(it);
}
function deleteCurrent(){
  var it = items.find(function(x){ return x.id===currentId; });
  if(!it) return;
  if(!confirm("确定要删除「"+it.name+"」吗？删除后无法恢复。")) return;
  items = items.filter(function(x){ return x.id!==currentId; });
  save(); render(); closeDetail(); toast("已删除");
}

/* ================= 朗读 ================= */
function toggleSpeak(){
  if(speaking){ stopSpeak(); return; }
  if(!("speechSynthesis" in window)){ toast("当前设备不支持朗读"); return; }
  var it = items.find(function(x){ return x.id===currentId; });
  if(!it) return;
  var text = (it.name+"。"+(it.from?"来自"+it.from+"。":"")+(it.story||"")).slice(0,600);
  var u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN"; u.rate = 0.92;
  u.onend = function(){ stopSpeak(); };
  u.onerror = function(){ stopSpeak(); };
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
  speaking = true;
  document.getElementById("btnSpeak").classList.add("speak-on");
  document.getElementById("speakText").textContent = "停止朗读";
}
function stopSpeak(){
  if("speechSynthesis" in window) speechSynthesis.cancel();
  speaking = false;
  var b = document.getElementById("btnSpeak");
  if(b){ b.classList.remove("speak-on"); document.getElementById("speakText").textContent = "听我读"; }
}

/* ================= 记忆卡片导出 ================= */
function exportCard(){
  var it = items.find(function(x){ return x.id===currentId; });
  if(!it) return;
  var W = 1000, H = 1400;
  var c = document.createElement("canvas"); c.width=W; c.height=H;
  var x = c.getContext("2d");
  // 背景
  x.fillStyle = "#faf3e8"; x.fillRect(0,0,W,H);
  x.strokeStyle = "#d9b98f"; x.lineWidth = 3;
  x.strokeRect(40,40,W-80,H-80);
  x.strokeRect(52,52,W-104,H-104);
  // 照片区
  var iw = W-200, ih = 760, ix = 100, iy = 120;
  x.fillStyle = "#fff"; x.fillRect(ix-14, iy-14, iw+28, ih+28);
  var img = new Image();
  var done = function(){
    // 图片 cover 绘制
    x.save();
    x.beginPath(); x.rect(ix,iy,iw,ih); x.clip();
    var s = Math.max(iw/img.width, ih/img.height);
    var dw = img.width*s, dh = img.height*s;
    x.drawImage(img, ix+(iw-dw)/2, iy+(ih-dh)/2, dw, dh);
    x.restore();
    // 文字
    x.fillStyle = "#3d3229"; x.textAlign = "center";
    x.font = "600 52px 'Noto Serif SC','Songti SC','SimSun',serif";
    x.fillText(it.name, W/2, 1010);
    x.fillStyle = "#c25e3a"; x.font = "30px sans-serif";
    x.fillText((it.from?"来自 "+it.from:"一件家里的老物件") + (it.era?" · "+it.era+" 年代":""), W/2, 1064);
    // 故事摘录
    var story = (it.story||"此物无言，却装着一整个家的时间。");
    if(story.length>90) story = story.slice(0,90)+"……";
    x.fillStyle = "#6b5b4a"; x.font = "26px 'Noto Serif SC','Songti SC','SimSun',serif";
    wrapText(x, story, W/2, 1130, W-320, 44);
    // 落款
    x.fillStyle = "#b98a2f"; x.font = "22px sans-serif";
    x.fillText("—— 念物 · 家的记忆馆 · " + AUTHOR + " ——", W/2, H-110);
    // 下载
    var a = document.createElement("a");
    a.download = "记忆卡片-"+it.name+".png";
    a.href = c.toDataURL("image/png");
    a.click();
    toast("记忆卡片已保存");
  };
  if(it.image){ img.onload = done; img.src = it.image; }
  else { img.onload = done; img.src = placeholder(it); }
}
function wrapText(x, text, cx, y, maxW, lh){
  var line = "", lines = [];
  for(var i=0;i<text.length;i++){
    if(x.measureText(line+text[i]).width > maxW){ lines.push(line); line = text[i]; }
    else line += text[i];
  }
  if(line) lines.push(line);
  lines.slice(0,4).forEach(function(l,idx){ x.fillText(l, cx, y+idx*lh); });
}

/* ================= 备份 ================= */
function exportJSON(){
  var blob = new Blob([JSON.stringify(items,null,2)], {type:"application/json"});
  var a = document.createElement("a");
  a.download = "念物备份-"+new Date().toISOString().slice(0,10)+".json";
  a.href = URL.createObjectURL(blob);
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 3000);
  toast("备份文件已导出");
}
function importJSON(input){
  var f = input.files && input.files[0];
  if(!f) return;
  var r = new FileReader();
  r.onload = function(){
    try{
      var arr = JSON.parse(r.result);
      if(!Array.isArray(arr)) throw 0;
      var ids = {};
      items.forEach(function(x){ ids[x.id]=1; });
      var added = 0;
      arr.forEach(function(o){
        if(o && o.name && !ids[o.id]){
          o.createdAt = o.createdAt || Date.now();
          items.push(o); added++;
        }
      });
      save(); render();
      toast(added ? "导入成功，新增 "+added+" 件" : "没有发现新物件");
    }catch(e){ toast("文件格式不对，请选择导出的备份文件"); }
  };
  r.readAsText(f);
  input.value = "";
}
function updateStoreBar(){
  var used = 0;
  try { used = (localStorage.getItem(KEY)||"").length * 2; } catch(e){}
  var quota = 5*1024*1024;
  var pct = Math.min(100, Math.round(used/quota*100));
  if(!items.length){ document.getElementById("storeBar").style.display="none"; return; }
  document.getElementById("storeBar").style.display = "flex";
  document.getElementById("storeFill").style.width = pct + "%";
  document.getElementById("storeText").textContent = (used/1024/1024).toFixed(1) + " MB / 约 5 MB";
  if(pct > 80) document.getElementById("storeText").textContent += "（快满了，建议导出备份后清理）";
}

/* ================= 示例数据 ================= */
function sampleIcon(ch, c1, c2){
  var cv = document.createElement("canvas"); cv.width=600; cv.height=460;
  var x = cv.getContext("2d");
  var g = x.createLinearGradient(0,0,600,460);
  g.addColorStop(0,c1); g.addColorStop(1,c2);
  x.fillStyle = g; x.fillRect(0,0,600,460);
  x.font = "180px serif"; x.textAlign="center"; x.textBaseline="middle";
  x.fillText(ch, 300, 235);
  return cv.toDataURL("image/jpeg", 0.8);
}
function loadSamples(){
  if(items.length){ toast("已有物件，示例不再重复添加"); return; }
  var now = Date.now();
  items = [
    { id:"s1", name:"外婆的顶针", from:"外婆", era:1965,
      story:"这是外婆做衣服时戴的铜顶针。小时候每到腊月，她总坐在缝纫机前，一针一线给我做过年穿的新棉袄。顶针上的小坑，是她纳了几十年鞋底、缝了几十年衣裳留下的。外婆走后，妈妈把它收在首饰盒里，说看见它，就听见缝纫机的声音。",
      tags:["缝纫","外婆","童年"], icon:"🧵", image:sampleIcon("🧵","#f3d9c3","#e0a878"), createdAt:now-3000 },
    { id:"s2", name:"父亲的手表", from:"父亲", era:1988,
      story:"父亲工作后用第一个月工资买的上海牌手表，戴了三十年，表带换过四次，表盘划痕密密麻麻。他说时间就是从这块表开始走得有意义的。现在我把它放在书桌上，写作卡壳时就看看秒针——它还在走，就像父亲从来没停过。",
      tags:["手表","父亲","奋斗"], icon:"⌚", image:sampleIcon("⌚","#dce7d2","#a8c194"), createdAt:now-2000 },
    { id:"s3", name:"铁皮饼干盒", from:"妈妈", era:1992,
      story:"过年时妈妈用来装糖果和花生的铁皮盒，印着大红牡丹。平时锁在柜子顶上，只有除夕才能打开。我和妹妹总踮着脚偷看，闻着里面淡淡的饼干香流口水。现在盒子还在老家的柜子上，装着全家福和我的奖状。",
      tags:["零食","过年","兄妹"], icon:"🍬", image:sampleIcon("🍬","#f5e3c8","#dfb871"), createdAt:now-1000 }
  ];
  save(); render();
  toast("已载入 3 件示例，可长按删除");
}

/* Esc 关闭弹层 */
document.addEventListener("keydown", function(e){
  if(e.key==="Escape"){ closeDetail(); closeForm(); }
});

render(); updateStoreBar();
