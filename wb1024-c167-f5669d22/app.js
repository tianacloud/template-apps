document.documentElement.dataset.theme='dark';
const style = document.createElement('style'); style.textContent="\n  *{box-sizing:border-box;margin:0;padding:0}\n  :root{\n    --bg:#070b14;\n    --panel:rgba(15,23,42,.72);\n    --panel-solid:#0f172a;\n    --glass:rgba(7,11,20,.82);\n    --border:rgba(56,189,248,.16);\n    --border-strong:rgba(0,230,118,.38);\n    --text:#dbe7f3;\n    --muted:#8ba0b8;\n    --faint:#5b6b82;\n    --green:#00e676;\n    --cyan:#22d3ee;\n    --violet:#a78bfa;\n    --gold:#fbbf24;\n    --pink:#f472b6;\n    --red:#f87171;\n    --code-bg:#0a0f1c;\n    --tk-s:#7ef7b8;\n    --shadow:0 8px 32px rgba(0,0,0,.45);\n    --font-mono:\"JetBrains Mono\",\"Cascadia Code\",\"SF Mono\",Consolas,\"Courier New\",monospace;\n    --font-sans:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;\n    --font-kai:\"Kaiti SC\",\"STKaiti\",\"KaiTi\",\"楷体\",serif;\n  }\n  [data-theme=\"light\"]{\n    --bg:#eef2f8;\n    --panel:rgba(255,255,255,.86);\n    --panel-solid:#ffffff;\n    --glass:rgba(238,242,248,.88);\n    --border:rgba(15,23,42,.12);\n    --border-strong:rgba(5,150,105,.42);\n    --text:#1e293b;\n    --muted:#526075;\n    --faint:#8291a5;\n    --green:#059669;\n    --cyan:#0e7490;\n    --violet:#7c3aed;\n    --gold:#b45309;\n    --pink:#db2777;\n    --red:#dc2626;\n    --code-bg:#f6f8fb;\n    --tk-s:#047857;\n    --shadow:0 8px 28px rgba(15,23,42,.10);\n  }\n  html{scroll-behavior:smooth}\n  body{\n    background:\n      radial-gradient(1200px 600px at 70% -10%, rgba(34,211,238,.09), transparent),\n      radial-gradient(900px 520px at 8% 110%, rgba(0,230,118,.08), transparent),\n      var(--bg);\n    color:var(--text);\n    font-family:var(--font-sans);\n    min-height:100vh;\n    overflow-x:hidden;\n    transition:background .3s,color .3s;\n  }\n  ::selection{background:rgba(0,230,118,.32)}\n  #rain{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.5}\n  .wrap{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:0 20px}\n\n  /* ===== header ===== */\n  header{text-align:center;padding:46px 20px 10px}\n  .logo-row{display:flex;align-items:center;justify-content:center;gap:18px}\n  .logo{\n    font-family:var(--font-mono);font-size:76px;font-weight:800;letter-spacing:5px;line-height:1;\n    background:linear-gradient(135deg,#00e676,#22d3ee 55%,#a78bfa);\n    -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;\n    filter:drop-shadow(0 0 24px rgba(0,230,118,.28));\n  }\n  [data-theme=\"light\"] .logo{filter:none}\n  .theme-toggle{font-size:16px;padding:8px 12px}\n  header h1{font-size:21px;letter-spacing:7px;margin-top:10px;font-weight:700}\n  .tagline{font-family:var(--font-mono);color:var(--muted);font-size:13px;margin-top:8px}\n  .status-row{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:18px}\n  .chip{\n    display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);\n    padding:6px 14px;border-radius:999px;font-size:12px;color:var(--muted);\n    background:var(--panel);font-family:var(--font-mono);\n  }\n  #countdown.fest-on{color:var(--gold);border-color:rgba(251,191,36,.55)}\n  .cursor{animation:blink 1.1s steps(1) infinite;color:var(--green)}\n  @keyframes blink{50%{opacity:0}}\n\n  /* ===== tabs ===== */\n  .tabs{position:sticky;top:0;z-index:20;background:var(--glass);backdrop-filter:blur(12px);margin:0 -20px;padding:12px 20px;border-bottom:1px solid var(--border)}\n  .tabs-inner{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:1040px;margin:0 auto}\n  .tab-btn{\n    font-family:var(--font-mono);font-size:14px;padding:10px 16px;border-radius:12px;\n    border:1px solid transparent;background:transparent;color:var(--muted);cursor:pointer;transition:.16s;\n  }\n  .tab-btn:hover{color:var(--text);border-color:var(--border)}\n  .tab-btn.active{color:var(--green);border-color:var(--border-strong);background:rgba(0,230,118,.08);box-shadow:0 0 18px rgba(0,230,118,.12)}\n\n  main{padding:28px 0 8px}\n  .panel{display:none}\n  .panel.active{display:block;animation:fadeUp .35s ease}\n  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}\n\n  .card-big{\n    background:var(--panel);border:1px solid var(--border);border-radius:18px;\n    padding:26px;backdrop-filter:blur(12px);box-shadow:var(--shadow);margin-bottom:28px;\n  }\n  .section-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:18px}\n  .section-head h2{font-size:19px;letter-spacing:1px}\n  .sub{color:var(--muted);font-size:12.5px;margin-top:5px;line-height:1.7}\n\n  /* ===== buttons & fields ===== */\n  .btn{\n    font-family:inherit;font-size:13px;padding:9px 16px;border-radius:10px;\n    border:1px solid var(--border);background:transparent;color:var(--text);cursor:pointer;transition:.15s;\n  }\n  .btn:hover{border-color:var(--border-strong);transform:translateY(-1px)}\n  .btn.primary{\n    background:linear-gradient(135deg,#00e676,#22d3ee);color:#03291b;font-weight:700;border:none;\n    box-shadow:0 4px 18px rgba(0,230,118,.25);\n  }\n  .btn.primary:hover{filter:brightness(1.08)}\n  .btn.big{width:100%;padding:13px;font-size:15px;margin-top:16px;letter-spacing:2px}\n  .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}\n  .field-label{display:block;font-size:13px;color:var(--muted);margin:16px 0 8px;font-weight:600}\n  textarea,select{\n    width:100%;background:var(--code-bg);color:var(--text);border:1px solid var(--border);\n    border-radius:12px;padding:13px 14px;font-size:13px;font-family:var(--font-mono);resize:vertical;\n  }\n  textarea:focus,select:focus{outline:none;border-color:var(--border-strong)}\n  select{font-family:var(--font-sans);width:auto;min-width:200px}\n  pre{\n    background:var(--code-bg);border:1px solid var(--border);border-radius:12px;\n    padding:16px;font-family:var(--font-mono);font-size:13px;line-height:1.65;\n    white-space:pre;overflow:auto;height:480px;\n  }\n  pre::-webkit-scrollbar{width:8px;height:8px}\n  pre::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}\n  .tk-c{color:var(--faint);font-style:italic}\n  .tk-s{color:var(--tk-s)}\n  .tk-k{color:var(--cyan);font-weight:600}\n  .out-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:13px;color:var(--muted);font-weight:600}\n  .out-hint{font-size:12px;color:var(--faint);margin-bottom:10px}\n  .btn.ghost:hover{color:var(--green)}\n  .opt-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}\n  .opt-grid label{display:block;font-size:12px;color:var(--muted);margin-bottom:6px}\n  .egg-grid{display:grid;grid-template-columns:1fr 1.15fr;gap:22px}\n  .chips{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 4px}\n  .chip-btn{\n    display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border:1px solid var(--border);\n    border-radius:999px;cursor:pointer;font-size:12.5px;color:var(--muted);user-select:none;transition:.15s;background:transparent;font-family:inherit;\n  }\n  .chip-btn:hover{color:var(--text)}\n  .chip-btn.on,.chip-btn:has(input:checked){color:var(--green);border-color:var(--border-strong);background:rgba(0,230,118,.08)}\n  .chip-btn input{accent-color:var(--green)}\n  .privacy-note{font-size:12px;color:var(--green);background:rgba(0,230,118,.06);border:1px dashed var(--border-strong);border-radius:10px;padding:8px 12px;margin-top:10px}\n\n  /* ===== calendar ===== */\n  .cal-scroll{overflow-x:auto;padding-bottom:4px}\n  .cal-head{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;min-width:700px;margin-bottom:8px}\n  .cal-head span{text-align:center;font-size:12px;color:var(--muted);font-weight:700}\n  .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;min-width:700px}\n  .day-cell{\n    border:1px solid var(--border);border-radius:10px;background:rgba(148,163,184,.07);\n    padding:7px 8px;display:flex;flex-direction:column;gap:2px;font-size:11.5px;line-height:1.5;min-height:112px;\n  }\n  [data-theme=\"light\"] .day-cell{background:#fff}\n  .day-top{display:flex;justify-content:space-between;align-items:baseline}\n  .day-num{font-family:var(--font-mono);font-weight:800;font-size:15px}\n  .day-wk{color:var(--faint);font-size:10px}\n  .day-yi b,.day-ji b{margin-right:3px;font-size:10px}\n  .day-yi b{color:var(--green)}\n  .day-ji b{color:var(--red)}\n  .day-fish{margin-top:auto;font-size:10px;letter-spacing:1px}\n  .day-cell.fest{background:linear-gradient(160deg,rgba(251,191,36,.18),rgba(251,191,36,.04));border-color:rgba(251,191,36,.55)}\n  .day-cell.fest .day-num{color:var(--gold)}\n  .day-cell.today{outline:1px dashed var(--cyan);outline-offset:2px}\n  .cal-legend{margin-top:12px;font-size:12px;color:var(--faint)}\n  .fish-reason{\n    margin-top:18px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;\n    padding:15px 18px;border-radius:14px;border:1px dashed var(--border-strong);background:rgba(0,230,118,.05);\n  }\n  .fish-reason .fr-label{font-weight:700;font-size:13.5px;white-space:nowrap}\n  .fish-reason .fr-text{flex:1;min-width:220px;font-size:14px;font-family:var(--font-mono);color:var(--green)}\n\n  /* ===== fortune / bug ===== */\n  .bug-grid{display:grid;grid-template-columns:350px 1fr;gap:22px}\n  .fortune-card{\n    background:linear-gradient(170deg,#1a1408,#0f0b04 62%);border:1px solid rgba(251,191,36,.45);\n    border-radius:18px;padding:28px 24px;text-align:center;position:relative;overflow:hidden;\n  }\n  .fortune-card::before{\n    content:\"1024\";position:absolute;top:-18px;right:-8px;font-family:var(--font-mono);font-size:88px;\n    font-weight:800;color:rgba(251,191,36,.06);pointer-events:none;\n  }\n  .fortune-level{font-size:27px;font-weight:800;letter-spacing:5px}\n  .fortune-level.top{color:#fbbf24;text-shadow:0 0 22px rgba(251,191,36,.45)}\n  .fortune-level.good{color:#00e676;text-shadow:0 0 22px rgba(0,230,118,.4)}\n  .fortune-level.mid{color:#22d3ee;text-shadow:0 0 22px rgba(34,211,238,.4)}\n  .fortune-level.low{color:#f87171;text-shadow:0 0 22px rgba(248,113,113,.4)}\n  .fortune-name{font-size:15px;color:#e8d9b0;margin-top:8px;letter-spacing:3px}\n  .fortune-text{font-family:var(--font-kai);font-size:15px;line-height:2.1;color:#f5ead0;margin:20px 0 16px}\n  .fortune-jie{font-size:12px;color:#b8a888;line-height:1.9;text-align:left}\n  .fortune-yj{margin-top:16px;font-size:12.5px;color:#d8c9a8;display:flex;flex-direction:column;gap:5px;text-align:left;border-top:1px dashed rgba(251,191,36,.3);padding-top:14px}\n  .fortune-yj b{color:#fbbf24;margin-right:8px}\n  .card{border:1px solid var(--border);border-radius:16px;padding:20px;background:var(--panel);margin-bottom:18px}\n  .card h3{font-size:15px;margin-bottom:10px}\n  .card p{font-size:13.5px;line-height:1.95;color:var(--text)}\n  .card .row{margin-top:12px}\n  .mokugyo-btn{\n    width:132px;height:132px;border-radius:50%;border:4px solid rgba(0,0,0,.35);\n    background:radial-gradient(circle at 35% 30%,#a5693a,#6b4423 60%,#4a2f18);\n    font-size:46px;cursor:pointer;display:block;margin:16px auto;\n    box-shadow:0 10px 30px rgba(0,0,0,.4),inset 0 -6px 12px rgba(0,0,0,.3),inset 0 6px 12px rgba(255,255,255,.15);\n    transition:transform .08s;\n  }\n  .mokugyo-btn:active{transform:scale(.92)}\n  .mokugyo-stats{text-align:center;font-size:13px;color:var(--muted);margin-top:8px}\n  .mokugyo-stats b{color:var(--gold);font-family:var(--font-mono);font-size:15px}\n  .mokugyo-msg{text-align:center;color:var(--green);font-size:13px;margin-top:8px;min-height:20px;font-family:var(--font-mono)}\n  .merit-float{position:fixed;color:var(--gold);font-weight:700;font-size:15px;pointer-events:none;animation:floatUp .9s ease-out forwards;z-index:99;text-shadow:0 0 10px rgba(251,191,36,.5)}\n  @keyframes floatUp{to{transform:translateY(-64px);opacity:0}}\n\n  /* ===== pot ===== */\n  .pot-meta{display:flex;gap:8px;margin-bottom:12px}\n  .tag{font-size:11px;padding:3px 11px;border-radius:999px;background:rgba(34,211,238,.12);color:var(--cyan);border:1px solid rgba(34,211,238,.3);font-family:var(--font-mono)}\n  .tag.lv{background:rgba(251,191,36,.12);color:var(--gold);border-color:rgba(251,191,36,.3)}\n  #pot-text{font-size:15px;line-height:2.1;white-space:pre-wrap}\n  .pot-scene{color:var(--muted);font-size:12.5px;margin-top:10px}\n  .rules ul{margin:10px 0 0 20px;font-size:13px;line-height:2.1;color:var(--muted)}\n  .rules li::marker{color:var(--green)}\n\n  /* ===== poster ===== */\n  .poster-grid{display:grid;grid-template-columns:360px 1fr;gap:26px;align-items:start}\n  #poster-canvas{width:100%;height:auto;border-radius:16px;border:1px solid var(--border);box-shadow:var(--shadow);display:block}\n  .poster-wrap{position:relative}\n  .poster-wrap::after{\n    content:\"\";position:absolute;inset:8px;border-radius:20px;z-index:-1;\n    background:linear-gradient(135deg,rgba(0,230,118,.25),rgba(167,139,250,.25));filter:blur(28px);\n  }\n  #poster-copy{font-family:var(--font-mono);font-size:13px;line-height:1.9;color:var(--green)}\n\n  /* ===== misc ===== */\n  footer{text-align:center;padding:36px 20px 52px;color:var(--faint);font-size:12.5px;line-height:2.1}\n  footer .hint{color:var(--green);margin-top:6px;font-family:var(--font-mono)}\n  footer .mono{font-family:var(--font-mono);font-size:12px}\n  #toast{\n    position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(20px);\n    background:#0f172a;color:#dbe7f3;border:1px solid var(--border-strong);\n    padding:10px 22px;border-radius:999px;font-size:13px;opacity:0;pointer-events:none;\n    transition:.25s;z-index:100;box-shadow:0 8px 30px rgba(0,0,0,.4);\n  }\n  [data-theme=\"light\"] #toast{background:#fff;color:#1e293b}\n  #toast.show{opacity:1;transform:translateX(-50%) translateY(0)}\n  #easter-overlay{position:fixed;inset:0;pointer-events:none;z-index:90;overflow:hidden}\n  #easter-overlay span{\n    position:fixed;top:-40px;color:var(--green);font-family:var(--font-mono);font-weight:800;\n    animation:fall linear forwards;opacity:.85;text-shadow:0 0 10px rgba(0,230,118,.6);\n  }\n  @keyframes fall{to{transform:translateY(112vh) rotate(75deg);opacity:0}}\n\n  @media(max-width:920px){\n    .egg-grid,.bug-grid,.poster-grid{grid-template-columns:1fr}\n    .poster-wrap{max-width:320px;margin:0 auto}\n    .logo{font-size:58px}\n    header h1{letter-spacing:4px}\n  }\n  @media(max-width:520px){\n    .opt-grid{grid-template-columns:1fr}\n    pre{height:380px}\n    .cal-grid,.cal-head{min-width:620px}\n  }\n"; style.textContent += "\n.egg-grid > *, .bug-grid > *, .poster-grid > * { min-width: 0; }\n"; document.head.appendChild(style);
document.body.innerHTML="\n<canvas id=\"rain\"></canvas>\n<div class=\"wrap\">\n\n  <header>\n    <div class=\"logo-row\">\n      <div class=\"logo\">1024</div>\n      <button class=\"btn ghost theme-toggle\" id=\"theme-btn\" title=\"切换浅色 / 深色\">🌙</button>\n    </div>\n    <h1>程序员专属彩蛋生成器</h1>\n    <p class=\"tagline\">2<sup>10</sup> = 1024 · 把代码，写成节日的样子</p>\n    <div class=\"status-row\">\n      <span class=\"chip\" id=\"countdown\">⏳ 计算中…</span>\n      <span class=\"chip\">$ ./celebrate --date=1024 <span class=\"cursor\">▍</span></span>\n    </div>\n  </header>\n\n  <nav class=\"tabs\">\n    <div class=\"tabs-inner\">\n      <button class=\"tab-btn active\" data-target=\"panel-egg\">🥚 代码彩蛋</button>\n      <button class=\"tab-btn\" data-target=\"panel-fish\">🐟 摸鱼日历</button>\n      <button class=\"tab-btn\" data-target=\"panel-bug\">🙏 Bug 祈福</button>\n      <button class=\"tab-btn\" data-target=\"panel-pot\">🎩 甩锅话术</button>\n      <button class=\"tab-btn\" data-target=\"panel-poster\">🎉 海报文案</button>\n    </div>\n  </nav>\n\n  <main>\n\n    <!-- ============ Module 1: 代码彩蛋 ============ -->\n    <section class=\"panel active\" id=\"panel-egg\">\n      <div class=\"card-big\">\n        <div class=\"section-head\">\n          <div>\n            <h2>🥚 代码彩蛋生成器</h2>\n            <p class=\"sub\">输入代码片段，自动注入节日祝福注释与隐藏彩蛋：控制台惊喜、二进制情书、藏头诗、魔数浪漫……让同事在 review 时发现你的心意。</p>\n          </div>\n        </div>\n        <div class=\"egg-grid\">\n          <div>\n            <label class=\"field-label\" for=\"egg-input\">① 粘贴你的代码</label>\n            <textarea id=\"egg-input\" placeholder=\"// 在这里粘贴代码，或点击下方「载入示例代码」\" rows=\"10\" spellcheck=\"false\"></textarea>\n            <div class=\"row\" style=\"margin-top:10px\">\n              <button class=\"btn\" id=\"egg-sample\">📄 载入示例代码</button>\n              <button class=\"btn\" id=\"egg-clear\">🧹 清空</button>\n            </div>\n            <div class=\"privacy-note\">🔒 隐私承诺：代码仅在本地浏览器中处理，绝不上传到任何服务器。</div>\n            <label class=\"field-label\">② 选择语言 / 注释风格</label>\n            <select id=\"egg-lang\">\n              <option selected value=\"js\">JavaScript / TypeScript</option>\n              <option value=\"py\">Python</option>\n              <option value=\"jvm\">Java / C / C++ / Go / Rust</option>\n              <option value=\"html\">HTML / XML</option>\n              <option value=\"sql\">SQL</option>\n            </select>\n            <label class=\"field-label\">③ 祝福浓度</label>\n            <select id=\"egg-dose\">\n              <option value=\"2\">轻度 · 优雅含蓄</option>\n              <option selected value=\"4\">标准 · 得体大方</option>\n              <option value=\"7\">狂暴 · 锣鼓喧天</option>\n            </select>\n            <label class=\"field-label\">④ 彩蛋类型（可多选）</label>\n            <div class=\"chips\" id=\"egg-types\">\n              <label class=\"chip-btn\"><input checked type=\"checkbox\" value=\"console\"><span>🖥️ 控制台彩蛋</span></label>\n              <label class=\"chip-btn\"><input checked type=\"checkbox\" value=\"binary\"><span>💌 二进制情书</span></label>\n              <label class=\"chip-btn\"><input checked type=\"checkbox\" value=\"acrostic\"><span>📜 藏头诗注释</span></label>\n              <label class=\"chip-btn\"><input checked type=\"checkbox\" value=\"magic\"><span>✨ 魔数浪漫</span></label>\n              <label class=\"chip-btn\"><input type=\"checkbox\" value=\"title\"><span>🏷️ 标题彩蛋</span></label>\n            </div>\n            <button class=\"btn primary big\" id=\"egg-gen\">⚡ 一键生成彩蛋代码</button>\n          </div>\n          <div>\n            <div class=\"out-head\">\n              <span>生成结果</span>\n              <div class=\"row\">\n                <button class=\"btn\" id=\"egg-copy\">📋 复制</button>\n                <button class=\"btn\" id=\"egg-dl\">⬇️ 下载</button>\n              </div>\n            </div>\n            <p class=\"out-hint\">💡 祝福注释按随机行注入，合并进项目前请人工 review 一遍</p>\n            <pre id=\"egg-out\"></pre>\n          </div>\n        </div>\n      </div>\n    </section>\n\n    <!-- ============ Module 2: 摸鱼日历 ============ -->\n    <section class=\"panel\" id=\"panel-fish\">\n      <div class=\"card-big\">\n        <div class=\"section-head\">\n          <div>\n            <h2>🐟 程序员专属摸鱼日历</h2>\n            <p class=\"sub\">天选打工人电子黄历 · 每日宜忌 + 摸鱼指数，科学安排带薪遨游</p>\n          </div>\n          <div class=\"row\">\n            <button class=\"btn\" id=\"fish-regen\">🎲 重新排期</button>\n            <button class=\"btn\" id=\"fish-copy\">📋 复制本月日历</button>\n          </div>\n        </div>\n        <div class=\"cal-head\"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div>\n        <div class=\"cal-scroll\">\n          <div class=\"cal-grid\" id=\"cal-grid\"></div>\n        </div>\n        <div class=\"cal-legend\">🐟 摸鱼指数：1 条 = 宜安心搬砖，5 条 = 宜全天带薪遨游 · 虚线框 = 今天 · 金色 = 程序员节</div>\n        <div class=\"fish-reason\">\n          <span class=\"fr-label\">🎣 今日摸鱼理由</span>\n          <span class=\"fr-text\" id=\"fish-reason-text\">生成中…</span>\n          <button class=\"btn\" id=\"fish-reason-btn\">换一个理由</button>\n        </div>\n      </div>\n    </section>\n\n    <!-- ============ Module 3: Bug 祈福 ============ -->\n    <section class=\"panel\" id=\"panel-bug\">\n      <div class=\"card-big\">\n        <div class=\"section-head\">\n          <div>\n            <h2>🙏 Bug 祈福殿</h2>\n            <p class=\"sub\">求签 · 上香 · 敲电子木鱼——玄学三件套，程序员最后的体面</p>\n          </div>\n        </div>\n        <div class=\"bug-grid\">\n          <div class=\"fortune-card\">\n            <div class=\"fortune-level top\" id=\"fortune-level\">上上签</div>\n            <div class=\"fortune-name\" id=\"fortune-name\">一次跑通签</div>\n            <div class=\"fortune-text\" id=\"fortune-text\">…</div>\n            <div class=\"fortune-jie\" id=\"fortune-jie\">…</div>\n            <div class=\"fortune-yj\">\n              <span><b>宜</b><span id=\"fortune-yi\">…</span></span>\n              <span><b>忌</b><span id=\"fortune-ji\">…</span></span>\n            </div>\n            <button class=\"btn primary\" id=\"bug-draw\" style=\"margin-top:18px; width:100%\">🙏 重新求签</button>\n          </div>\n          <div>\n            <div class=\"card\">\n              <h3>🕯️ 上香文案</h3>\n              <p id=\"incense-text\">…</p>\n              <div class=\"row\">\n                <button class=\"btn\" id=\"incense-btn\">换一炷香</button>\n                <button class=\"btn\" id=\"incense-copy\">📋 复制</button>\n              </div>\n            </div>\n            <div class=\"card\">\n              <h3>🪵 电子木鱼</h3>\n              <p class=\"sub\">敲一下，功德 +1，Bug -1。心诚则绿。</p>\n              <button class=\"mokugyo-btn\" id=\"mokugyo\" title=\"敲木鱼\">🪵</button>\n              <div class=\"mokugyo-stats\">功德 <b id=\"merit\">0</b> · Bug 存量 <b id=\"bugs\">1024</b></div>\n              <p class=\"mokugyo-msg\" id=\"mokugyo-msg\">心静自然绿</p>\n            </div>\n          </div>\n        </div>\n      </div>\n    </section>\n\n    <!-- ============ Module 4: 甩锅话术 ============ -->\n    <section class=\"panel\" id=\"panel-pot\">\n      <div class=\"card-big\">\n        <div class=\"section-head\">\n          <div>\n            <h2>🎩 体面甩锅话术生成器</h2>\n            <p class=\"sub\">对事不对人，留痕不背锅——职场生存的语言艺术（建议配合事实与证据使用）</p>\n          </div>\n          <div class=\"row\">\n            <select id=\"pot-level\">\n              <option value=\"全部\">力度：全部</option>\n              <option value=\"温和\">力度：温和提醒</option>\n              <option selected value=\"标准\">力度：标准职业</option>\n              <option value=\"强硬\">力度：委婉强硬</option>\n            </select>\n            <button class=\"btn primary\" id=\"pot-gen\">🎲 甩一个</button>\n          </div>\n        </div>\n        <div class=\"chips\" id=\"pot-cats\">\n          <button class=\"chip-btn on\" data-cat=\"全部\">全部</button>\n          <button class=\"chip-btn\" data-cat=\"需求类\">需求类</button>\n          <button class=\"chip-btn\" data-cat=\"环境类\">环境类</button>\n          <button class=\"chip-btn\" data-cat=\"历史代码类\">历史代码类</button>\n          <button class=\"chip-btn\" data-cat=\"第三方类\">第三方类</button>\n          <button class=\"chip-btn\" data-cat=\"并发时序类\">并发时序类</button>\n          <button class=\"chip-btn\" data-cat=\"沟通协作类\">沟通协作类</button>\n        </div>\n        <div class=\"card\" style=\"margin-top:16px\">\n          <div class=\"pot-meta\">\n            <span class=\"tag\" id=\"pot-cat\">需求类</span>\n            <span class=\"tag lv\" id=\"pot-lv\">标准</span>\n          </div>\n          <p id=\"pot-text\">…</p>\n          <p class=\"pot-scene\" id=\"pot-scene\">…</p>\n          <div class=\"row\">\n            <button class=\"btn\" id=\"pot-copy\">📋 复制话术</button>\n            <button class=\"btn\" id=\"pot-combo\">🧩 生成完整事件通报</button>\n          </div>\n        </div>\n        <div class=\"card rules\">\n          <h3>📌 甩锅生存法则</h3>\n          <ul id=\"pot-rules\"></ul>\n        </div>\n      </div>\n    </section>\n\n    <!-- ============ Module 5: 海报文案 ============ -->\n    <section class=\"panel\" id=\"panel-poster\">\n      <div class=\"card-big\">\n        <div class=\"section-head\">\n          <div>\n            <h2>🎉 1024 节日海报 &amp; 朋友圈配文</h2>\n            <p class=\"sub\">一键生成海报文案与可直接发布的朋友圈配文，海报可下载为 PNG</p>\n          </div>\n          <button class=\"btn primary\" id=\"poster-gen\">🎉 一键生成海报文案</button>\n        </div>\n        <div class=\"poster-grid\">\n          <div class=\"poster-wrap\">\n            <canvas height=\"1000\" id=\"poster-canvas\" width=\"750\"></canvas>\n          </div>\n          <div>\n            <label class=\"field-label\">海报风格</label>\n            <div class=\"chips\" id=\"poster-styles\">\n              <button class=\"chip-btn on\" data-style=\"随机\">🎲 随机</button>\n              <button class=\"chip-btn\" data-style=\"极客风\">极客风</button>\n              <button class=\"chip-btn\" data-style=\"浪漫风\">浪漫风</button>\n              <button class=\"chip-btn\" data-style=\"硬核风\">硬核风</button>\n              <button class=\"chip-btn\" data-style=\"自嘲风\">自嘲风</button>\n              <button class=\"chip-btn\" data-style=\"治愈风\">治愈风</button>\n              <button class=\"chip-btn\" data-style=\"极简风\">极简风</button>\n            </div>\n            <div class=\"card\">\n              <h3>🖼️ 当前海报文案 <span class=\"tag\" id=\"poster-style-name\" style=\"margin-left:8px\">风格：随机</span></h3>\n              <p id=\"poster-copy\">…</p>\n              <div class=\"row\">\n                <button class=\"btn\" id=\"poster-copy-btn\">📋 复制文案</button>\n                <button class=\"btn\" id=\"poster-dl\">⬇️ 下载海报 PNG</button>\n              </div>\n            </div>\n            <div class=\"card\">\n              <h3>📝 朋友圈配文</h3>\n              <p id=\"moments-text\">…</p>\n              <div class=\"row\">\n                <button class=\"btn\" id=\"moments-btn\">换一条</button>\n                <button class=\"btn\" id=\"moments-copy\">📋 复制配文</button>\n              </div>\n            </div>\n            <div class=\"card\">\n              <h3>#️⃣ 话题标签</h3>\n              <p id=\"hashtags\" style=\"font-family:var(--font-mono); color:var(--cyan)\">…</p>\n              <div class=\"row\">\n                <button class=\"btn\" id=\"hashtags-copy\">📋 复制标签</button>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </section>\n\n  </main>\n\n  <footer>\n    <p>🐱 本工具所有内容均在本地浏览器生成 · 你粘贴的代码不会上传到任何服务器</p>\n    <p class=\"mono\">// 1024 = 1 &lt;&lt; 10 · Happy Programmers' Day · Made with 💚</p>\n    <p class=\"hint\">💡 隐藏彩蛋：在页面任意位置输入 \"1024\" 试试</p>\n  </footer>\n</div>\n\n<div id=\"toast\"></div>\n<div id=\"easter-overlay\"></div>\n\n";

'use strict';
/* ================= 工具函数 ================= */
const $  = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
const pick = a => a[Math.floor(Math.random() * a.length)];
const pickN = (a, n) => { const c = [...a]; const r = []; while (r.length < n && c.length) r.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]); return r; };

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1900);
}
function fallbackCopy(text, done, fail) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { fail(); }
  document.body.removeChild(ta);
}
function copyText(text, okMsg) {
  const done = () => toast(okMsg || '已复制到剪贴板 ✅');
  const fail = () => toast('复制失败，请手动选择复制 😅');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done, fail));
  } else fallbackCopy(text, done, fail);
}

/* ================= 主题切换 ================= */
const themeBtn = $('#theme-btn');
themeBtn.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'light' : 'dark';
  themeBtn.textContent = dark ? '☀️' : '🌙';
});

/* ================= 倒计时 ================= */
function next1024() {
  const now = new Date();
  const y = now.getFullYear();
  const t = (now < new Date(y, 9, 25)) ? new Date(y, 9, 24) : new Date(y + 1, 9, 24);
  const sod = n => new Date(n.getFullYear(), n.getMonth(), n.getDate());
  const days = Math.round((sod(t) - sod(now)) / 86400000);
  return { date: t, days: days };
}
function updateCountdown() {
  const n = next1024();
  const el = $('#countdown');
  if (n.days === 0) {
    el.textContent = '🎉 今天就是 1024 程序员节！';
    el.classList.add('fest-on');
  } else {
    el.textContent = '⏳ 距 1024 程序员节还有 ' + n.days + ' 天';
    el.classList.remove('fest-on');
  }
}

/* ================= 二进制雨背景 ================= */
const rain = $('#rain'), rctx = rain.getContext('2d');
let cols = 0, drops = [];
function resizeRain() {
  rain.width = window.innerWidth;
  rain.height = window.innerHeight;
  cols = Math.floor(rain.width / 18);
  drops = Array.from({ length: cols }, () => Math.random() * -50);
}
window.addEventListener('resize', resizeRain);
resizeRain();
(function drawRain() {
  rctx.clearRect(0, 0, rain.width, rain.height);
  rctx.font = '14px "JetBrains Mono", Consolas, monospace';
  const dark = document.documentElement.dataset.theme !== 'light';
  const step = 18;
  for (let i = 0; i < cols; i++) {
    const x = i * step, y = drops[i] * step;
    rctx.fillStyle = dark ? 'rgba(0,230,118,0.6)' : 'rgba(5,150,105,0.42)';
    rctx.fillText(Math.random() < 0.5 ? '0' : '1', x, y);
    if (y > rain.height && Math.random() > 0.975) drops[i] = 0;
    drops[i] += 0.5;
  }
  requestAnimationFrame(drawRain);
})();

/* ================= 页内隐藏彩蛋：输入 1024 ================= */
let keyBuf = '';
window.addEventListener('keydown', e => {
  if (e.key && e.key.length === 1) {
    keyBuf = (keyBuf + e.key).slice(-4);
    if (keyBuf === '1024') triggerMetaEgg();
  }
});
function triggerMetaEgg() {
  const ov = $('#easter-overlay');
  ov.innerHTML = '';
  for (let i = 0; i < 50; i++) {
    const s = document.createElement('span');
    s.textContent = Math.random() < 0.5 ? '1024' : '10';
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDuration = (1.5 + Math.random() * 1.6) + 's';
    s.style.animationDelay = (Math.random() * 0.5) + 's';
    s.style.fontSize = (14 + Math.random() * 24) + 'px';
    ov.appendChild(s);
  }
  toast('🎉 恭喜发现隐藏彩蛋：1024 = 2^10，快乐也是双倍！');
  setTimeout(() => { ov.innerHTML = ''; }, 3800);
}

/* ================= 标签页 ================= */
function activate(id) {
  $$('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.target === id));
  $$('.panel').forEach(p => p.classList.toggle('active', p.id === id));
}
$$('.tab-btn').forEach(b => b.addEventListener('click', () => {
  activate(b.dataset.target);
  try { history.replaceState(null, '', '#' + b.dataset.target); } catch (e) { /* file:// 等受限环境下忽略 */ }
}));
window.addEventListener('hashchange', () => {
  const id = location.hash.replace('#', '');
  if (id && document.getElementById(id)) activate(id);
});

/* ================= 模块一：代码彩蛋生成器 ================= */
const LANGS = {
  js  : { label: 'JS / TS', line: '// ', ext: 'js' },
  py  : { label: 'Python',  line: '# ',  ext: 'py' },
  jvm : { label: 'JVM 系',  line: '// ', ext: 'java' },
  html: { label: 'HTML',    line: '',    ext: 'html', block: true },
  sql : { label: 'SQL',     line: '-- ', ext: 'sql' }
};
function commentLine(lang, text) {
  return lang.block ? '<!-- ' + text + ' -->' : lang.line + text;
}
function commentBlock(lang, lines) {
  return lang.block ? ['<!--'].concat(lines, ['-->']) : lines.map(l => lang.line + l);
}
const BLESSINGS = [
  '1024 快乐！愿你 Ctrl+S 常按，Bug 不请自来',
  '1024 快乐！while (true) { happiness++; }，永真永快乐',
  '1024 快乐！foreach 遍历万物，find 命中唯一',
  '1024 快乐！cache 全命中，Redis 永不挂，连接池永远够用',
  '1024 快乐！PM 的需求如同 final 常量，上线永不变更',
  '1024 快乐！0 Error · 0 Warning，编译一次通过',
  '1024 快乐！内存不泄漏，句柄不泄漏，工资到账不延迟',
  '1024 快乐！find 真爱，like 佳人，delete 烦恼，insert 快乐',
  '1024 快乐！merge 无冲突，rebase 无分歧，push 无拒绝',
  '1024 快乐！网络永远 200，超时永远不存在，重试永远用不上',
  '1024 快乐！愿你写的代码像 this 一样，只指向一个人',
  '1024 快乐！接口永远幂等，消息永远恰好一次，分布式永远一致',
  '1024 快乐！单测覆盖率 100%，CI 一次过，早下班',
  '1024 快乐！没有 996，只有 2^10 的幸福；没有 P0，只有 1024 的浪漫',
  '1024 快乐！快捷键比你对象还懂你，但今晚要早点下班'
];
const ACRO = [
  '序之美，在于删繁就简；码之力，源于深思熟虑。',
  '章写罢，测试全绿，上线无警。',
  '工们节日快乐，工资翻倍涨，头发浓密如初。',
  '日里许个愿：需求不变更，Bug 不上门。',
  '马加鞭，不如准时下班。',
  '在其中：2 的 10 次方，是程序员独有的浪漫。'
];
function banner(lang) {
  const b = pick(BLESSINGS);
  const bar = '═'.repeat(36);
  return [
    commentLine(lang, bar),
    commentLine(lang, '  2^10 = 1024  ·  程序员节快乐'),
    commentLine(lang, '  ' + b),
    commentLine(lang, '  // generated by 1024 程序员专属彩蛋生成器'),
    commentLine(lang, bar)
  ];
}
function eggConsole(lang) {
  return commentBlock(lang, [
    '── 🥚 隐藏彩蛋 · 控制台祝福（每年 10 月 24 日自动触发）──',
    'const _0x1024 = () => {',
    '  const d = new Date();',
    '  if (d.getMonth() === 9 && d.getDate() === 24) {',
    '    console.log("%c🎉 1024 程序员节快乐！", "color:#00e676;font-size:20px;font-weight:bold;");',
    '    console.log("%c愿你 0 Error · 0 Warning · 100% Happiness", "color:#22d3ee;font-size:14px;");',
    '  }',
    '};',
    '_0x1024();'
  ]);
}
function eggBinary(lang) {
  const msg = '程序员节快乐';
  const bin = [...msg].map(ch => ch.codePointAt(0).toString(2).padStart(16, '0'));
  const lines = [];
  for (let i = 0; i < bin.length; i += 4) lines.push(bin.slice(i, i + 4).join(' '));
  return commentBlock(lang, [
    '── 🥚 二进制情书 ─────────────────────────────',
    '下面是一串二进制编码的祝福。破译方法：每 16 位一组转十进制，即 Unicode 码位',
    '例：00110000 01100001 → "0a"'
  ].concat(lines.map(l => l)).concat([
    '破译出来的六个字，是程序员最朴素的愿望'
  ]));
}
function eggAcrostic(lang) {
  const chars = '程序员节快乐';
  const raw = ['── 🥚 藏头诗注释 ───────────────────────────', '每行首字连读，有惊喜'];
  chars.split('').forEach((ch, i) => raw.push(ch + ' ' + ACRO[i]));
  return commentBlock(lang, raw);
}
function eggMagic(lang) {
  return commentBlock(lang, [
    '── 🥚 魔数浪漫 ───────────────────────────────',
    'const TWO_TO_TEN = 1 << 10;   // 1024，程序员的身份编号',
    'const HEX_1024   = 0x400;     // 同一份浪漫，换个进制',
    '// 1KB = 1024B；而我们的快乐，恰好是 2 的 10 次方'
  ]);
}
function eggTitle(lang) {
  return commentBlock(lang, [
    '── 🥚 标题彩蛋（Web 项目适用）────────────────',
    '每年 10 月 24 日，网页标题会自动变身',
    '(function celebrate1024() {',
    '  const d = new Date();',
    '  if (d.getMonth() === 9 && d.getDate() === 24) {',
    '    document.title = "🎉 1024 程序员节快乐 - " + document.title;',
    '  }',
    '})();'
  ]);
}
function luckyLine(lang) {
  return [commentLine(lang, '🐱 幸运注释：请勿删除。据不可靠统计，保留此注释的程序员，当年都没出线上故障。')];
}
function sprinkle(lines, lang, count) {
  const n = lines.length;
  const max = Math.min(count, Math.max(n - 1, 0));
  const pos = new Set();
  while (pos.size < max) pos.add(Math.floor(Math.random() * n));
  const sorted = [...pos].sort((a, b) => a - b);
  const res = [];
  let si = 0;
  for (let i = 0; i < n; i++) {
    if (si < sorted.length && sorted[si] === i) {
      const ind = (lines[i].match(/^[ \t]*/) || [''])[0];
      res.push(ind + commentLine(lang, '🎉 ' + pick(BLESSINGS)));
      si++;
    }
    res.push(lines[i]);
  }
  return res;
}
function highlight(code) {
  const kw = /\b(const|let|var|function|return|if|else|for|while|new|class|import|export|from|def|print|self|try|catch|throw|async|await|select|where|insert|update|delete)\b/g;
  return code.split('\n').map(line => {
    const t = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (/^(\/\/|#|--|&lt;!--|\/\*|\*|╔|╚|═|─)/.test(t.trimStart())) {
      return '<span class="tk-c">' + t + '</span>';
    }
    return t
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="tk-s">$1</span>')
      .replace(kw, '<span class="tk-k">$1</span>');
  }).join('\n');
}
const SAMPLE = [
  'function quickSort(arr) {',
  '  if (arr.length <= 1) return arr;',
  '  const pivot = arr[Math.floor(arr.length / 2)];',
  '  const left = arr.filter(x => x < pivot);',
  '  const right = arr.filter(x => x > pivot);',
  '  return [...quickSort(left), pivot, ...quickSort(right)];',
  '}',
  '',
  'const nums = [3, 6, 1, 8, 2, 9, 4];',
  'console.log(quickSort(nums));'
].join('\n');
let currentEggOut = '';
function genEgg() {
  const lang = LANGS[$('#egg-lang').value];
  let code = $('#egg-input').value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!code) code = SAMPLE;
  const count = +$('#egg-dose').value;
  const types = $$('#egg-types input:checked').map(i => i.value);
  const note = ($('#egg-lang').value !== 'js')
    ? [commentLine(lang, '⚠️ 当前语言非 JS 家族：代码类彩蛋已转为注释形式，可按你的语言自行改写')]
    : [];
  const eggs = [];
  if (types.includes('console'))  eggs.push(...eggConsole(lang));
  if (types.includes('binary'))   eggs.push(...eggBinary(lang));
  if (types.includes('acrostic')) eggs.push(...eggAcrostic(lang));
  if (types.includes('magic'))    eggs.push(...eggMagic(lang));
  if (types.includes('title'))    eggs.push(...eggTitle(lang));
  if (!eggs.length) eggs.push(commentLine(lang, '（未选择彩蛋类型，至少勾一个嘛 🙃）'));
  const out = [].concat(
    note, banner(lang), [''],
    sprinkle(code.split('\n'), lang, count), [''],
    eggs, [''], luckyLine(lang)
  );
  currentEggOut = out.join('\n');
  $('#egg-out').innerHTML = highlight(currentEggOut);
}
$('#egg-gen').addEventListener('click', () => { genEgg(); toast('⚡ 彩蛋已注入，请查收！'); });
$('#egg-sample').addEventListener('click', () => { $('#egg-input').value = SAMPLE; toast('示例代码已载入'); });
$('#egg-clear').addEventListener('click', () => { $('#egg-input').value = ''; toast('已清空'); });
$('#egg-copy').addEventListener('click', () => copyText(currentEggOut, '彩蛋代码已复制 ✅'));
$('#egg-dl').addEventListener('click', () => {
  const ext = LANGS[$('#egg-lang').value].ext;
  const d = new Date().toISOString().slice(0, 10);
  const blob = new Blob([currentEggOut], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '1024-blessed-' + d + '.' + ext;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('已下载 ⬇️');
});

/* ================= 模块二：摸鱼日历 ================= */
const YI = ['带薪如厕', '咖啡续命', '刷技术周刊', '逛 GitHub 趋势榜', '假装看日志', '摸鱼看番', '准点下班', '带薪学新技术', '深度思考人生', '与产品斗智斗勇', '茶水间社交', '窗口神游', '整理收藏夹', '给 IDE 换主题', '重装环境（假装在工作）'];
const JI = ['临时接需求', '深夜上线', '帮同事 debug', '自己写 Bug', '回答"在吗"', '开无准备的会', '写周报', '改上一行代码', '周五发布', '接到"很简单"的需求', '对齐颗粒度', '电话静音装掉线'];
const FISH_REASONS = [
  '编译要 3 分钟，我等一下很合理',
  '我在看日志，这是深度 debugging',
  'CI 还在跑，现在动不了',
  '正在调研业界最新解决方案（刷手机中）',
  '需求还没定，先不急',
  '重启大法好，等电脑反应过来',
  '我在等接口，对方还没好',
  '刚开完会，脑子需要缓冲降频',
  '需求还在"对齐颗粒度"，我先等着',
  '正在从 0 到 1 搭建摸鱼基础设施',
  '测试环境又挂了，这不能怪我',
  '我在等设计稿，前端不能没有灵魂'
];
let calData = [];
function buildCalendar() {
  const y = next1024().date.getFullYear();
  const grid = $('#cal-grid');
  grid.innerHTML = '';
  calData = [];
  const first = new Date(y, 9, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(y, 10, 0).getDate();
  const today = new Date();
  for (let i = 0; i < offset; i++) grid.appendChild(document.createElement('div'));
  for (let d = 1; d <= days; d++) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    const wk = '日一二三四五六'[new Date(y, 9, d).getDay()];
    let yi, ji, fish, fest = false;
    if (d === 24) {
      yi = ['一切（包括敲代码庆祝）']; ji = ['无（程序员节最大）']; fish = 5; fest = true;
      cell.classList.add('fest');
    } else {
      yi = pickN(YI, 2);
      ji = pickN(JI, Math.random() < 0.4 ? 2 : 1);
      fish = 1 + Math.floor(Math.random() * 5);
    }
    if (y === today.getFullYear() && today.getMonth() === 9 && today.getDate() === d) cell.classList.add('today');
    cell.innerHTML =
      '<div class="day-top"><span class="day-num">' + d + '</span><span class="day-wk">周' + wk + '</span></div>' +
      '<div class="day-yi"><b>宜</b>' + yi.join('、') + '</div>' +
      '<div class="day-ji"><b>忌</b>' + ji.join('、') + '</div>' +
      '<div class="day-fish">' + '🐟'.repeat(fish) + '</div>';
    grid.appendChild(cell);
    calData.push({ d: d, wk: wk, yi: yi, ji: ji, fish: fish, fest: fest });
  }
}
function calText() {
  const y = next1024().date.getFullYear();
  const L = ['════ ' + y + ' 年 10 月 · 程序员专属摸鱼日历 ════', '摸鱼指数：🐟 越多越适合遨游（不是）', ''];
  calData.forEach(c => {
    L.push(String(c.d).padStart(2, '0') + '日 周' + c.wk + (c.fest ? ' 🎉 程序员节' : '') + ' | 摸鱼指数 ' + '🐟'.repeat(c.fish));
    L.push('  宜：' + c.yi.join('、'));
    L.push('  忌：' + c.ji.join('、'));
    L.push('');
  });
  return L.join('\n');
}
function newReason() { $('#fish-reason-text').textContent = pick(FISH_REASONS); }
$('#fish-regen').addEventListener('click', () => { buildCalendar(); newReason(); toast('🐟 本月排期已重新生成'); });
$('#fish-copy').addEventListener('click', () => copyText(calText(), '本月摸鱼日历已复制 ✅'));
$('#fish-reason-btn').addEventListener('click', newReason);

/* ================= 模块三：Bug 祈福 ================= */
const FORTUNES = [
  { level: '上上签', cls: 'top',  name: '一次跑通签',   text: '千行代码落，运行一次成。测试皆绿过，无需再返工。', jie: '大吉。今日所写代码自带正确性，但该写的自测还是要写。', yi: '提交代码、顺手重构、认领小需求', ji: '改需求、临时上线、手滑 force push' },
  { level: '上上签', cls: 'top',  name: '需求冻结签',   text: '产品不言改，测试不挑刺。需求如磐石，稳如泰山姿。', jie: '大吉。今日需求文档纹丝不动，且改且珍惜。', yi: '需求评审、排期评估、从容写码', ji: '私下接需求、口头承诺排期' },
  { level: '上签',   cls: 'good', name: '线上无警签',   text: '监控不报警，日志无异常。发布如细雨，润物细无声。', jie: '吉。发布窗口选得好，报警绕道走。', yi: '发布上线、灰度扩容、半夜不看手机', ji: '盲目自信、跳过灰度、不写回滚方案' },
  { level: '上签',   cls: 'good', name: '秒级定位签',   text: '日志一打开，问题现原形。定位三分整，修复五分钟。', jie: '吉。今日的你拥有福尔摩斯般的调试视力。', yi: '排查疑难 Bug、读源码、带新人', ji: '乱改一通、不记结论、同一个坑摔两次' },
  { level: '中签',   cls: 'mid',  name: '改 A 坏 B 签', text: '改罢 A 处码，B 处报红灯。修修补补间，一日又黄昏。', jie: '平。改动之前多想一层影响面，提交之前再跑一遍回归。', yi: '小步提交、写注释、画依赖图', ji: '一把梭大重构、不看调用方、跳过自测' },
  { level: '中签',   cls: 'mid',  name: '玄学复现签',   text: '本地跑无恙，线上偶现踪。重启大法后，天下自太平。', jie: '平。玄学问题的尽头是监控和日志，先留证据再施法。', yi: '加监控、补日志、留现场', ji: '重启了事、掩耳盗铃关报警' },
  { level: '下签',   cls: 'low',  name: '上线惊魂签',   text: '方才发布毕，报警响连环。回滚保平安，复盘待明天。', jie: '凶中藏吉。备好回滚方案，便是上上策；活着回来，就是胜利。', yi: '准备回滚、拉群同步、写复盘', ji: '心存侥幸、不带回滚、周五晚上上线' }
];
function drawFortune() {
  const f = pick(FORTUNES);
  $('#fortune-level').textContent = f.level;
  $('#fortune-level').className = 'fortune-level ' + f.cls;
  $('#fortune-name').textContent = f.name;
  $('#fortune-text').textContent = f.text;
  $('#fortune-jie').textContent = '解曰：' + f.jie;
  $('#fortune-yi').textContent = f.yi;
  $('#fortune-ji').textContent = f.ji;
}
$('#bug-draw').addEventListener('click', () => { drawFortune(); toast('🙏 签已重新求取，心诚则灵'); });
const INCENSE = [
  '信女愿一生荤素搭配，换 Bug 自行消失、需求不再变更、测试一次通过。',
  '信男愿三年不写 Bug，换 1024 节日全天无报警。',
  '三炷香：一炷求编译通过，一炷求上线无警，一炷求准时下班。',
  '今日供奉：冰美式一杯、机械键盘一把，求 Bug 退散。',
  '代码千万行，安全第一条；祈福不规范，程序员两行泪。',
  '焚香祷祝：愿我的 commit 都受人善待，愿我的分支都不起冲突。'
];
let currentIncense = '';
function newIncense() { currentIncense = pick(INCENSE); $('#incense-text').textContent = currentIncense; }
$('#incense-btn').addEventListener('click', newIncense);
$('#incense-copy').addEventListener('click', () => copyText(currentIncense, '上香文案已复制 ✅'));
const MOKU = ['功德 +1，Bug -1', '愿代码无 Bug，愿需求不变更', '心静自然绿，测试全通过', '敲的是木鱼，渡的是工期', 'Bug 皆虚妄，CI 皆坦途', '木鱼一响，需求退让'];
let merit = 0, bugs = 1024;
$('#mokugyo').addEventListener('click', function () {
  merit++;
  bugs = Math.max(0, bugs - (1 + Math.floor(Math.random() * 9)));
  $('#merit').textContent = merit;
  $('#bugs').textContent = bugs;
  $('#mokugyo-msg').textContent = pick(MOKU);
  const r = this.getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'merit-float';
  f.textContent = '功德 +1';
  f.style.left = (r.left + r.width / 2 - 34) + 'px';
  f.style.top = (r.top - 6) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 900);
  if (bugs === 0) {
    $('#mokugyo-msg').textContent = '🙏 功德圆满，Bug 已悉数退散，去写代码吧';
    toast('🙏 功德圆满！Bug 已悉数退散');
  }
});

/* ================= 模块四：甩锅话术 ================= */
const POT = [
  { cat: '需求类', level: '温和', scene: '适用：需求理解出现偏差时', text: '这块实现我理解是以当前需求文档为准的，方便的话我们对齐一下最新口径，避免方向性返工。' },
  { cat: '需求类', level: '标准', scene: '适用：需求中途变更时', text: '目前逻辑与上一版需求保持一致；最新的调整我还没收到正式同步，我先按现状跟进，需求确认后第一时间更新。' },
  { cat: '需求类', level: '强硬', scene: '适用：被临时追加隐性需求时', text: '需求文档里没有覆盖这个场景，我按通用方案实现了。如果这是隐性需求，建议走需求变更流程评估排期。' },
  { cat: '环境类', level: '温和', scene: '适用：本地无法复现时', text: '本地和测试环境都没能复现，我整理一份环境差异清单，我们逐个排查变量。' },
  { cat: '环境类', level: '标准', scene: '适用：仅预发环境出现时', text: '这个问题只在预发环境出现，我倾向于配置漂移，已经同步运维同学一起排查。' },
  { cat: '历史代码类', level: '温和', scene: '适用：踩到祖传代码时', text: '这段逻辑是历史沿用的实现，我梳理一下上下文再跟进，避免误伤其他链路。' },
  { cat: '历史代码类', level: '标准', scene: '适用：祖传代码连环坑时', text: '这个模块经过多任负责人迭代，我整理了一份变更谱系，我们基于它讨论怎么改最安全。' },
  { cat: '第三方类', level: '温和', scene: '适用：第三方回调丢失时', text: '从链路时间线看，请求卡在了第三方回调环节，我已整理好时间线同步对方排查。' },
  { cat: '第三方类', level: '标准', scene: '适用：第三方文档与实现不符时', text: '对方接口文档与实测行为不一致，我列了差异点清单，需要双方对齐后再推进。' },
  { cat: '并发时序类', level: '标准', scene: '适用：极端时序边界 case', text: '这属于极端时序下的边界情况，我先加监控和兜底防止扩散，再逐步根治。' },
  { cat: '并发时序类', level: '强硬', scene: '适用：被催立刻修复玄学问题时', text: '没有日志和现场的 Bug 只能定位到概率层面，我先补可观测性再谈修复，否则只是把问题藏起来。' },
  { cat: '沟通协作类', level: '温和', scene: '适用：改动影响多方时', text: '这个改动会影响三个业务方，我拉个短会对齐影响面和排期。' },
  { cat: '沟通协作类', level: '标准', scene: '适用：方案需要决策时', text: '我把方案 A / B 的利弊整理成了一页纸，方便大家快速决策，执行侧我来跟进。' },
  { cat: '沟通协作类', level: '强硬', scene: '适用：职责边界模糊时', text: '这个问题的 Owner 目前比较模糊，我建议拉齐相关方明确边界，避免三不管，也避免重复建设。' }
];
const RULES = [
  '凡事留痕：口头需求，聊天记录就是护身符',
  '先同步，后动手：方向对齐了，锅才飞不过来',
  '周五不上线：周末的报警，没有程序员想收到',
  '不接"很简单"的需求：越简单，越要留证据',
  '回滚方案先行：能回去的路，才叫路'
];
let potCat = '全部', potLevel = '标准', currentPot = '';
function genPot() {
  const pool = POT.filter(p => (potCat === '全部' || p.cat === potCat) && (potLevel === '全部' || p.level === potLevel));
  if (!pool.length) { toast('这个组合没有库存，换一个条件试试 😅'); return; }
  const p = pick(pool);
  $('#pot-cat').textContent = p.cat;
  $('#pot-lv').textContent = p.level;
  $('#pot-text').textContent = p.text;
  $('#pot-scene').textContent = p.scene;
  currentPot = p.text;
}
function genCombo() {
  const t = '同步一下「接口偶发超时」问题的进展：\n' +
    '1）现象：部分请求 RT 明显升高，暂未影响主链路；\n' +
    '2）定位：初步判断与' + pick(['环境配置', '需求口径', '历史实现', '第三方链路', '极端时序']) + '相关，日志与现场已留存；\n' +
    '3）兜底：已上线' + pick(['降级开关', '限流兜底', '回滚预案', '监控告警']) + '，影响未继续扩大；\n' +
    '4）下一步：' + pick(['对齐需求后更新', '配置对齐后验证', '与对方联调定位', '补充用例后回归']) + '；\n' +
    '5）需要支持：' + pick(['需求方确认口径', '运维配合排查', '相关方拉会对齐']) + '。\n' +
    '结论：问题在轨，责任清晰，推进有我。';
  $('#pot-cat').textContent = '完整事件通报';
  $('#pot-lv').textContent = '组合拳';
  $('#pot-text').textContent = t;
  $('#pot-scene').textContent = '把模板里的内容换成事实，就是一份体面、专业、留痕的通报';
  currentPot = t;
}
$$('#pot-cats .chip-btn').forEach(c => c.addEventListener('click', () => {
  $$('#pot-cats .chip-btn').forEach(x => x.classList.remove('on'));
  c.classList.add('on');
  potCat = c.dataset.cat;
  genPot();
}));
$('#pot-level').addEventListener('change', e => { potLevel = e.target.value; genPot(); });
$('#pot-gen').addEventListener('click', () => { genPot(); toast('🎩 话术已生成，请谨慎使用'); });
$('#pot-copy').addEventListener('click', () => copyText(currentPot, '话术已复制 ✅'));
$('#pot-combo').addEventListener('click', () => { genCombo(); toast('🧩 完整事件通报已生成'); });
RULES.forEach(r => { const li = document.createElement('li'); li.textContent = r; $('#pot-rules').appendChild(li); });

/* ================= 模块五：海报文案 ================= */
const POSTER_STYLES = {
  '极客风': [
    { main: 'Hello World，然后改变世界。', sub: '致每一位用 0 和 1 造梦的人' },
    { main: '代码是写给人看的，', sub: '顺便，才能在机器上运行。' }
  ],
  '浪漫风': [
    { main: '你是我唯一的 200 OK，', sub: '我是你永恒的 localhost。' },
    { main: '我把心跳写进了循环，', sub: '每一圈，都是 while(true)。' }
  ],
  '硬核风': [
    { main: '1 个程序员 = 2¹⁰ 种可能', sub: '1024，把世界重构成喜欢的样子' },
    { main: '不解释，懂的自然懂。', sub: '2^10 的快乐，二进制才懂。' }
  ],
  '自嘲风': [
    { main: '我们不生产代码，', sub: '我们只是 Bug 的搬运工。' },
    { main: '别人过节收花，', sub: '我们过节收 0 Error。' }
  ],
  '治愈风': [
    { main: '愿你每一次 commit 都不再忐忑，', sub: '每一次上线，都平安归来。' },
    { main: '愿你敲下的每一行代码，', sub: '都长成别人路上的灯。' }
  ],
  '极简风': [
    { main: '1024', sub: "PROGRAMMERS' DAY · 2^10 · 节日快乐" }
  ]
};
const MOMENTS = [
  '1024｜用 0 和 1，写尽人间浪漫 💻✨',
  '今天 find 到了快乐，delete 了 Bug，insert 了头发 🎉',
  '2¹⁰ = 1024，程序员的浪漫也是二进制 🖤',
  '别人过节收花，我们过节收 0 Error 🎈 祝各位 CRUD Boy & Girl 快乐',
  '程序员节愿望：代码零 Bug、需求零变更、工资零拖欠 🐟',
  'Hello World，然后改变世界。1024 快乐 🌍',
  '不装了，摊牌了，今天我是主角 🕶️ 1024 程序员节快乐'
];
const HASHTAGS = '#1024程序员节 #程序员日常 #代码改变世界 #Bug退散 #今天我最酷';
let posterStyle = '随机', currentPoster = null;
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = [...text];
  let line = '', yy = y;
  for (const ch of chars) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = ch;
      yy += lineHeight;
    } else line += ch;
  }
  ctx.fillText(line, x, yy);
  return yy;
}
function drawPoster(p) {
  const c = $('#poster-canvas'), ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const g = ctx.createLinearGradient(0, 0, W * 0.35, H);
  g.addColorStop(0, '#0a0f1e');
  g.addColorStop(0.5, '#101a33');
  g.addColorStop(1, '#1a1030');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.font = '16px Consolas, monospace';
  for (let x = 6; x < W; x += 18) {
    for (let y = 6; y < H; y += 18) {
      if (Math.random() < 0.07) {
        ctx.fillStyle = 'rgba(0,230,118,' + (0.04 + Math.random() * 0.1) + ')';
        ctx.fillText(Math.random() < 0.5 ? '0' : '1', x, y);
      }
    }
  }
  ctx.strokeStyle = 'rgba(0,230,118,.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7ef7b8';
  ctx.font = '600 24px "Microsoft YaHei", sans-serif';
  ctx.fillText("HAPPY 1024 · PROGRAMMERS' DAY", W / 2, 108);
  const gg = ctx.createLinearGradient(W / 2 - 220, 0, W / 2 + 220, 0);
  gg.addColorStop(0, '#00e676');
  gg.addColorStop(0.5, '#22d3ee');
  gg.addColorStop(1, '#a78bfa');
  ctx.fillStyle = gg;
  ctx.font = 'bold 230px "Arial Black", Arial, sans-serif';
  ctx.fillText('1024', W / 2, 380);
  ctx.fillStyle = '#9fb3c8';
  ctx.font = '26px Consolas, monospace';
  ctx.fillText('2^10 = 1024 · 每一个 bit 都是浪漫', W / 2, 442);
  ctx.strokeStyle = 'rgba(255,255,255,.16)';
  ctx.beginPath();
  ctx.moveTo(W / 2 - 190, 496);
  ctx.lineTo(W / 2 + 190, 496);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px "Microsoft YaHei", sans-serif';
  wrapText(ctx, p.main, W / 2, 566, W - 170, 62);
  ctx.fillStyle = '#8ba0b8';
  ctx.font = '29px "Microsoft YaHei", sans-serif';
  wrapText(ctx, p.sub, W / 2, 700, W - 190, 42);
  ctx.fillStyle = '#00e676';
  ctx.font = '600 30px "Microsoft YaHei", sans-serif';
  ctx.fillText('程序员节快乐', W / 2, H - 118);
  ctx.fillStyle = '#5b6b82';
  ctx.font = '20px Consolas, monospace';
  ctx.fillText('// generated by 1024 easter-egg generator', W / 2, H - 74);
}
function genPoster() {
  const style = posterStyle === '随机' ? pick(Object.keys(POSTER_STYLES)) : posterStyle;
  const v = pick(POSTER_STYLES[style]);
  currentPoster = Object.assign({}, v, { style: style });
  drawPoster(currentPoster);
  $('#poster-style-name').textContent = '风格：' + style;
  $('#poster-copy').textContent = v.main + v.sub;
}
function genMoments() { $('#moments-text').textContent = pick(MOMENTS); }
$$('#poster-styles .chip-btn').forEach(c => c.addEventListener('click', () => {
  $$('#poster-styles .chip-btn').forEach(x => x.classList.remove('on'));
  c.classList.add('on');
  posterStyle = c.dataset.style;
  genPoster();
}));
$('#poster-gen').addEventListener('click', () => { genPoster(); genMoments(); toast('🎉 海报文案与朋友圈配文已生成'); });
$('#poster-copy-btn').addEventListener('click', () => copyText($('#poster-copy').textContent, '海报文案已复制 ✅'));
$('#poster-dl').addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = '1024-程序员节海报.png';
  a.href = $('#poster-canvas').toDataURL('image/png');
  a.click();
  toast('海报已下载 ⬇️');
});
$('#moments-btn').addEventListener('click', genMoments);
$('#moments-copy').addEventListener('click', () => copyText($('#moments-text').textContent, '朋友圈配文已复制 ✅'));
$('#hashtags-copy').addEventListener('click', () => copyText(HASHTAGS, '话题标签已复制 ✅'));

/* ================= 初始化 ================= */
function init() {
  const hash = location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) activate(hash);
  updateCountdown();
  genEgg();
  buildCalendar();
  newReason();
  drawFortune();
  newIncense();
  genPot();
  genPoster();
  genMoments();
  $('#hashtags').textContent = HASHTAGS;
}
init();
