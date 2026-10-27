const style=document.createElement("style"); style.textContent="\n  :root{--bg:#f4f7fb;--card:#fff;--ink:#1f2a37;--sub:#5b6b7b;--line:#e3e9f0;\n    --accent:#2f6df0;--ok:#0f9d58;--warn:#b45309;--bad:#c62828;}\n  *{box-sizing:border-box;}\n  html{scrollbar-gutter:stable;}\n  body{margin:0;font-family:\"Microsoft YaHei\",\"PingFang SC\",system-ui,sans-serif;\n    background:var(--bg);color:var(--ink);line-height:1.6;padding:20px 22px;}\n  .wrap{max-width:1560px;margin:0 auto;}\n  header.hd{background:linear-gradient(120deg,#1e3a8a,#2f6df0);color:#fff;\n    border-radius:14px;padding:10px 22px;box-shadow:0 6px 18px rgba(31,58,138,.16);\n    margin-bottom:14px;}\n  header.hd h1{margin:0;font-size:21px;letter-spacing:.5px;}\n  .badge{display:inline-block;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);\n    padding:2px 10px;border-radius:999px;font-size:12px;white-space:nowrap;}\n  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;\n    box-shadow:0 2px 10px rgba(31,42,55,.04);min-width:0;}\n  .step-title{font-size:15px;font-weight:800;color:#27406b;margin:0 0 10px;display:flex;align-items:center;gap:8px;}\n  .step-title .n{width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;\n    font-size:12px;display:inline-flex;align-items:center;justify-content:center;}\n\n  /* 宽屏主栅格：选择区通栏，下方左舞台 + 右信息栏 */\n  .main{display:grid;gap:16px;grid-template-columns:minmax(0,1fr) 470px;\n    grid-template-areas:\"selector selector\" \"stage fb\" \"info ledger\";align-items:stretch;}\n  .selector-card{grid-area:selector;padding:12px 14px;}\n  .selector-card .step-title{margin-bottom:8px;}\n  .stage-card{grid-area:stage;display:flex;flex-direction:column;}\n  .fb-card{grid-area:fb;display:flex;flex-direction:column;}\n  .info-card{grid-area:info;}\n  .ledger-card{grid-area:ledger;}\n\n  .sp-scroll{padding-right:4px;}\n  .cat-label{font-size:12px;color:var(--sub);font-weight:700;margin:2px 0 4px;letter-spacing:.5px;}\n  .sp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:5px;}\n  .sp{position:relative;border:1.5px solid var(--line);background:#fbfdff;border-radius:8px;\n    padding:3px 4px 4px;cursor:pointer;transition:.12s;text-align:center;overflow:hidden;}\n  .sp:hover{border-color:#9dbcf5;background:#f5f9ff;}\n  .sp.on{border-color:var(--accent);background:#eaf2ff;box-shadow:0 0 0 2px rgba(47,109,240,.12);}\n  .sp .fm{font-size:13px;font-weight:800;color:#1f2a37;font-family:Consolas,monospace;\n    line-height:1.3;white-space:nowrap;letter-spacing:-.2px;}\n  .sp .nm{font-size:10px;color:var(--sub);line-height:1.25;white-space:nowrap;}\n  .sp .tag{position:absolute;top:0;right:1px;background:var(--accent);color:#fff;\n    font-size:9px;border-radius:0 7px 0 6px;padding:0 4px;line-height:13px;display:none;}\n  .sp.on .tag{display:block;}\n\n  /* 选择区两栏：左侧物质网格 + 反应条件，右侧已选反应物 + 操作 */\n  .selector-body{display:grid;grid-template-columns:minmax(0,1fr) 276px;gap:18px;align-items:stretch;}\n  .selector-left{display:flex;flex-direction:column;gap:8px;min-width:0;}\n  .cond-block{display:flex;align-items:center;gap:10px;flex-wrap:wrap;\n    border-top:1px dashed var(--line);padding-top:8px;}\n  .cond-label{font-size:12.5px;font-weight:800;color:#27406b;white-space:nowrap;}\n  .selector-side{display:flex;flex-direction:column;gap:10px;border-left:1px solid var(--line);\n    padding-left:18px;min-height:0;}\n  .side-block{display:flex;flex-direction:column;min-height:0;}\n  .side-block.side-sel{flex:0 0 auto;}\n  .side-title{font-size:12.5px;font-weight:800;color:#27406b;margin-bottom:7px;\n    display:flex;align-items:baseline;justify-content:space-between;gap:8px;}\n  .side-count{font-size:11px;font-weight:600;color:var(--sub);}\n  .side-actions{display:flex;gap:8px;align-items:center;}\n  .side-actions .btn.big{flex:1;justify-content:center;padding:11px 10px;}\n  .side-actions .btn.sec{padding:11px 16px;}\n  .sel-list{display:flex;flex-direction:column;gap:6px;flex:none;height:114px;\n    overflow-y:auto;scrollbar-width:thin;}\n  .sel{display:flex;align-items:center;justify-content:space-between;gap:6px;background:#eef4ff;\n    border:1px solid #c9daf5;border-radius:8px;padding:3px 6px 3px 10px;font-size:13px;\n    min-height:30px;flex:none;}\n  .sel .sf{font-size:13.5px;font-weight:800;font-family:Consolas,monospace;color:#27406b;white-space:nowrap;}\n  .sel .sn{font-size:10.5px;color:var(--sub);flex:1;min-width:0;text-align:left;\n    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\n  .stepper{display:flex;align-items:center;gap:3px;}\n  .stepper button{width:20px;height:20px;border-radius:5px;border:1px solid #b9cdf0;background:#fff;\n    color:var(--accent);font-weight:800;cursor:pointer;line-height:1;}\n  .stepper button:disabled{opacity:.35;cursor:not-allowed;}\n  .stepper .v{min-width:18px;text-align:center;font-weight:800;color:var(--accent);font-size:12.5px;}\n  .sel .del{cursor:pointer;color:#98a7b8;font-weight:800;padding:0 2px;}\n  .sel .del:hover{color:var(--bad);}\n  .sel-empty{font-size:12.5px;color:#98a7b8;padding:6px 2px;}\n\n  .actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:14px;}\n  .hint-note{font-size:11.5px;color:var(--sub);line-height:1.5;margin-left:0;}\n  button.btn{border:none;cursor:pointer;border-radius:10px;padding:10px 18px;font-size:14px;\n    font-weight:700;background:var(--accent);color:#fff;transition:.15s;}\n  button.btn:hover{filter:brightness(1.06);}\n  button.btn.sec{background:#eef2f8;color:var(--ink);}\n  button.btn:disabled{opacity:.45;cursor:not-allowed;filter:none;}\n  button.btn.big{padding:12px 26px;font-size:15px;}\n\n  .verdict{border-radius:12px;padding:14px 16px;margin-bottom:0;border:1px solid var(--line);display:none;}\n  .verdict.show{display:block;}\n  .verdict.good{background:#effaf3;border-color:#bfe8cd;}\n  .verdict.warn{background:#fff8ec;border-color:#f3d9a8;}\n  .verdict.bad{background:#fdf0f0;border-color:#f2c4c4;}\n  .verdict .vt{font-size:16px;font-weight:800;margin-bottom:4px;}\n  .verdict.good .vt{color:var(--ok);} .verdict.warn .vt{color:var(--warn);} .verdict.bad .vt{color:var(--bad);}\n  .verdict .vb{font-size:13.5px;color:#33414f;}\n  .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;}\n  .chip{font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;border:1px solid;}\n  .chip.y{background:#e7f8ee;color:var(--ok);border-color:#bfe8cd;}\n  .chip.n{background:#fdecec;color:var(--bad);border-color:#f2c4c4;}\n  .chip.m{background:#fff4e2;color:var(--warn);border-color:#f3d9a8;}\n  .chip.g{background:#eef2f8;color:#41556e;border-color:#d5dfea;}\n\n  /* 判定 + 问答：右栏竖排，占满卡片高度，不影响左侧画布 */\n  .feedback{display:flex;flex-direction:column;gap:10px;flex:1;min-height:0;}\n  .fb-block{display:flex;flex-direction:column;gap:10px;min-height:0;}\n  .fb-block:first-child{flex:1;}\n  .fb-empty{border:1px dashed #cfdbea;border-radius:12px;min-height:130px;\n    display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;\n    color:var(--sub);background:#fbfdff;padding:16px;flex:1;}\n  .fb-empty .ico{font-size:26px;opacity:.45;margin-bottom:6px;line-height:1;}\n  .fb-empty .t{font-size:14px;font-weight:800;color:#41556e;}\n  .fb-empty .s{font-size:12.5px;margin-top:4px;max-width:320px;}\n  .verdict.show + .fb-empty,.quiz.show + .fb-empty{display:none;}\n\n  .cond-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-height:36px;}\n  .cond-label{font-size:13px;font-weight:800;color:#27406b;}\n  .cond-chips{display:flex;flex-wrap:wrap;gap:8px;}\n  .cchip{border:1.5px solid var(--line);background:#fbfdff;border-radius:999px;padding:4px 14px;\n    font-size:13px;cursor:pointer;color:#41556e;transition:.12s;user-select:none;}\n  .cchip:hover{border-color:#9dbcf5;background:#f5f9ff;}\n  .cchip.on{border-color:var(--accent);background:#eaf2ff;color:var(--accent);font-weight:800;\n    box-shadow:0 0 0 2px rgba(47,109,240,.12);}\n\n  .quiz{display:none;border:1px solid #f3d9a8;background:#fffdf7;border-radius:12px;padding:12px 14px;margin-bottom:0;}\n  .quiz.show{display:block;}\n  .quiz h4{margin:0 0 2px;font-size:15px;color:var(--warn);}\n  .quiz .qhint{font-size:12.5px;color:var(--sub);margin-bottom:8px;}\n  #opts{display:grid;grid-template-columns:1fr;gap:7px;}\n  .opt{display:flex;gap:8px;align-items:flex-start;padding:7px 10px;border:1px solid var(--line);\n    border-radius:10px;margin-bottom:0;cursor:pointer;background:#fff;transition:.12s;}\n  .opt:hover{border-color:#e2c48a;background:#fffaf0;}\n  .opt input{margin-top:3px;accent-color:#d97706;flex:none;}\n  .opt span{font-size:13px;line-height:1.45;}\n  .judge{margin-top:8px;padding:8px 12px;border-radius:10px;font-size:13px;display:none;}\n  .judge.show{display:block;}\n  .judge.right{background:#e7f8ee;border:1px solid #bfe8cd;color:#116b3f;}\n  .judge.wrong{background:#fdecec;border:1px solid #f2c4c4;color:#a11f1f;}\n\n  .stage-wrap{position:relative;}\n  canvas{width:100%;display:block;border-radius:12px;background:#0c1a2e;}\n  .legend{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;align-items:center;\n    height:24px;margin-top:8px;font-size:12.5px;color:var(--sub);overflow:hidden;}\n  .legend span{display:inline-flex;align-items:center;gap:5px;}\n  .dot{width:14px;height:14px;border-radius:50%;display:inline-block;border:1px solid rgba(0,0,0,.12);}\n  .phase{margin-top:8px;text-align:center;font-size:14px;font-weight:600;color:#41556e;min-height:22px;}\n  .controls{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:10px;}\n  .speed{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--sub);margin-left:auto;}\n  .spd{border:1.5px solid var(--line);background:#fbfdff;border-radius:999px;padding:2px 12px;\n    font-size:12px;font-weight:600;color:#41556e;cursor:pointer;font-family:inherit;}\n  .spd:hover{border-color:#9dbcf5;background:#f5f9ff;}\n  .spd.on{border-color:var(--accent);background:#eaf2ff;color:var(--accent);font-weight:800;}\n  .toggle{font-size:13px;color:var(--sub);display:flex;align-items:center;gap:6px;}\n\n  .eq{font-size:19px;text-align:center;padding:4px 0 10px;letter-spacing:.4px;}\n  .eq .eq-cond{display:inline-flex;flex-direction:column;align-items:center;line-height:1.05;\n    vertical-align:middle;margin:0 4px;}\n  .eq .eq-cond i{font-style:normal;font-size:10px;color:var(--warn);white-space:nowrap;font-weight:700;}\n  .eq .eq-cond b,.eq .eq-eq{font-weight:800;}\n  .eq sub{font-size:12px;}\n  /* ↑↓ 跟在下标后：回到主基线再上移，避免叠在下标正上方（下标把基线压低所致） */\n  .eq sup{font-size:12.5px;color:#3d4c5d;font-weight:700;vertical-align:baseline;position:relative;top:-4px;}\n  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}\n  /* 大屏投影（3840×2160 / 300% 缩放 ≈ 1280×720 视口）：左控制栏 + 右舞台，一屏呈现 */\n  @media(max-width:1400px) and (max-height:820px){\n    body{padding:8px 12px;}\n    header.hd{padding:8px 16px;margin-bottom:8px;border-radius:12px;align-items:center;}\n    header.hd h1{font-size:18px;margin:0;}\n    header.hd p{display:none;}\n    .hd-badges{gap:6px;padding:0;}\n    .badge{font-size:10.5px;padding:1px 8px;}\n    .main{grid-template-columns:320px minmax(0,1fr);gap:10px;\n      grid-template-areas:\"selector stage\" \"selector fb\" \"info info\" \"ledger ledger\";}\n    .selector-card{display:flex;flex-direction:column;padding:10px;min-height:0;}\n    .step-title{font-size:13.5px;margin-bottom:6px;}\n    .step-title .n{width:18px;height:18px;font-size:11px;}\n    .sp-scroll{flex:1;min-height:0;overflow:auto;}\n    .sp-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;}\n    .sp{padding:3px 5px;}\n    .sp .fm{font-size:11px;}\n    .sp .nm{font-size:9.5px;}\n    .cat-label{font-size:11px;margin:2px 0 4px;}\n    .selector-body{flex:1;min-height:0;grid-template-columns:1fr;gap:8px;\n      grid-template-rows:auto minmax(0,1fr);}\n    .sp-scroll{flex:0 0 auto;max-height:calc(100vh - 420px);overflow:auto;}\n    .selector-side{border-left:none;padding-left:0;border-top:1px dashed var(--line);\n      padding-top:8px;gap:8px;}\n    .cond-block{padding-top:6px;gap:6px;}\n    .cond-label{font-size:11.5px;}\n    .side-title{font-size:11.5px;margin-bottom:5px;}\n    .side-block.side-sel{flex:none;}\n    .sel-list{flex:none;height:106px;gap:5px;}\n    .sel{padding:3px 6px;}\n    .sel-id b{font-size:12px;}\n    .cond-chips{gap:5px;}\n    .cchip{padding:3px 9px;font-size:11.5px;}\n    .side-actions .btn.big,.side-actions .btn.sec{padding:7px 12px;}\n    button.btn{padding:7px 14px;font-size:12.5px;border-radius:8px;}\n    button.btn.big{padding:7px 12px;font-size:12.5px;}\n    .hint-note{display:none;}\n    .stage-card{padding:10px;}\n    .legend{display:none;}\n    .phase{margin-top:6px;font-size:12.5px;min-height:16px;}\n    .controls{margin-top:6px;gap:8px;}\n    .toggle,.speed{font-size:12px;}\n    .fb-card{padding:10px;}\n    .feedback{max-height:calc(100vh - 300px);overflow:auto;}\n    .verdict{padding:10px 12px;border-radius:10px;}\n    .verdict .vt{font-size:14px;margin-bottom:2px;}\n    .verdict .vb{font-size:12px;}\n    .chips{gap:6px;margin-top:6px;}\n    .chip{font-size:11px;padding:2px 8px;}\n    .quiz{padding:10px 12px;}\n    .quiz h4{font-size:13px;margin-bottom:2px;}\n    .quiz .qhint{font-size:11px;margin-bottom:6px;}\n    #opts{grid-template-columns:1fr 1fr;gap:6px;}\n    .opt{padding:5px 8px;border-radius:8px;}\n    .opt span{font-size:11.5px;line-height:1.4;}\n    .judge{font-size:12px;padding:7px 10px;}\n    .fb-empty{min-height:84px;padding:10px;}\n    .fb-empty .ico{font-size:20px;margin-bottom:3px;}\n    .fb-empty .t{font-size:12.5px;}\n    .fb-empty .s{font-size:11.5px;}\n    .info-card,.ledger-card{padding:10px;}\n    table.cv{font-size:12px;}\n    table.cv th,table.cv td{padding:4px 6px;}\n    .eq{font-size:17px;padding:0 0 8px;}\n    footer{margin-top:10px;}\n  }\n\n  @media(max-width:1080px){\n    body{padding:16px;}\n    .main{grid-template-columns:1fr;grid-template-areas:\"selector\" \"fb\" \"stage\" \"info\" \"ledger\";gap:14px;}\n    .selector-body{grid-template-columns:1fr;gap:12px;}\n    .selector-side{border-left:none;padding-left:0;border-top:1px dashed var(--line);padding-top:12px;}\n    .sel-list{height:96px;flex:none;max-height:none;}\n    .fb-card{min-height:auto;}\n    header.hd{align-items:flex-start;}\n  }\n  @media(max-width:1100px){\n    .sp-scroll{max-height:250px;overflow:auto;}\n  }\n  @media(max-width:720px){\n    .grid2{grid-template-columns:1fr;}\n    .hint-note{margin-left:0;flex-basis:100%;}\n  }\n  .panel{border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:#fbfdff;}\n  .panel h3{margin:0 0 6px;font-size:15px;color:var(--accent);}\n  .panel p{margin:0;font-size:13.5px;color:#33414f;}\n  table.cv{width:100%;border-collapse:collapse;margin-top:6px;font-size:13.5px;}\n  table.cv th,table.cv td{border:1px solid var(--line);padding:7px 8px;text-align:center;}\n  table.cv th{background:#f0f5ff;color:#27406b;}\n  table.cv td.el{font-weight:700;}\n  .pill{display:inline-block;padding:1px 8px;border-radius:999px;font-size:12px;font-weight:700;}\n  .pill.ok{background:#e7f8ee;color:var(--ok);}\n  .total{margin-top:10px;text-align:center;font-size:14px;}\n  .total b{color:var(--ok);}\n  .ledger-title{margin:0 0 6px;color:var(--ok);font-size:15px;}\n  .note{font-size:12.5px;color:var(--sub);margin-top:8px;text-align:center;}\n  footer{text-align:center;color:var(--sub);font-size:12px;margin-top:18px;}\n  .flash{position:fixed;left:50%;top:18px;transform:translateX(-50%);background:#1f2a37;color:#fff;\n    padding:8px 16px;border-radius:10px;font-size:13px;opacity:0;pointer-events:none;transition:.25s;z-index:99;}\n  .flash.show{opacity:1;}\n"; document.head.appendChild(style);
document.body.innerHTML="\n<div class=\"wrap\">\n  <header class=\"hd\">\n    <h1>化学反应微观测试器</h1>\n  </header>\n\n  <div class=\"main\">\n  <div class=\"card selector-card\">\n    <div class=\"step-title\"><span class=\"n\">1</span>选择反应物与反应条件（物质最多 3 种）</div>\n    <div class=\"selector-body\">\n      <div class=\"selector-left\">\n        <div class=\"sp-scroll\" id=\"spScroll\"></div>\n        <div class=\"cond-block\">\n          <span class=\"cond-label\">反应条件</span>\n          <div class=\"cond-chips\" id=\"condChips\"></div>\n        </div>\n      </div>\n      <aside class=\"selector-side\">\n        <div class=\"side-block side-sel\">\n          <div class=\"side-title\">已选反应物<span class=\"side-count\" id=\"countHint\"></span></div>\n          <div class=\"sel-list\" id=\"selList\"></div>\n        </div>\n        <div class=\"side-actions\">\n          <button class=\"btn big\" id=\"testBtn\" disabled>⚗ 测试反应</button>\n          <button class=\"btn sec\" id=\"clearBtn\">清空</button>\n        </div>\n        <div class=\"hint-note\">条件不同，同一组物质可能反应 / 也可能不反应</div>\n      </aside>\n    </div>\n  </div>\n\n    <div class=\"card stage-card\">\n      <div class=\"stage-wrap\">\n        <canvas id=\"cv\"></canvas>\n        <div class=\"legend\" id=\"legend\"></div>\n        <div class=\"phase\" id=\"phase\">先选择反应物，再点「测试反应」</div>\n      </div>\n      <div class=\"controls\">\n        <button class=\"btn sec\" id=\"replay\" disabled>▶ 播放</button>\n        <label class=\"toggle\"><input type=\"checkbox\" id=\"showLabel\" checked /> 显示元素符号</label>\n        <div class=\"speed\">速度\n          <button class=\"spd on\" data-v=\"0.28\">慢</button>\n          <button class=\"spd\" data-v=\"0.5\">中</button>\n          <button class=\"spd\" data-v=\"0.9\">快</button>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"card fb-card\">\n      <div class=\"feedback\" id=\"feedback\">\n        <div class=\"fb-block\">\n          <div class=\"verdict\" id=\"verdict\">\n            <div class=\"vt\" id=\"vt\"></div>\n            <div class=\"vb\" id=\"vb\"></div>\n            <div class=\"chips\" id=\"chips\"></div>\n          </div>\n          <div class=\"fb-empty\" id=\"fbEmpty\">\n            <div class=\"ico\">⚗</div>\n            <div class=\"t\">选择物质与反应条件，点「测试反应」</div>\n            <div class=\"s\">这里会给出判定结论：能否反应、是否恰好完全反应</div>\n          </div>\n          <div class=\"judge\" id=\"judge\"></div>\n        </div>\n        <div class=\"fb-block\">\n          <div class=\"quiz\" id=\"quiz\">\n            <h4>🤔 你认为它们不能反应的原因是什么？（可多选）</h4>\n            <div class=\"qhint\">每次随机给出 4 个选项，恰当的原因可能不止一个，全部勾选后提交判断。</div>\n            <div id=\"opts\"></div>\n            <button class=\"btn\" id=\"submitReason\">提交判断</button>\n          </div>\n          <div class=\"fb-empty\" id=\"fbEmpty2\">\n            <div class=\"ico\">🤔</div>\n            <div class=\"t\">判断区</div>\n            <div class=\"s\">如果没有发生反应，这里会出现原因判断，由你来找出恰当的原因</div>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"card info-card\">\n      <div class=\"eq\" id=\"eq\">—</div>\n      <div class=\"grid2\">\n        <div class=\"panel\"><h3>🔥 宏观现象</h3><p id=\"macro\">—</p></div>\n        <div class=\"panel\"><h3>🔬 微观本质</h3><p id=\"micro\">—</p></div>\n      </div>\n    </div>\n\n    <div class=\"card ledger-card\">\n      <h3 class=\"ledger-title\">⚖️ 质量守恒核对（反应前后原子“三不变”）</h3>\n      <table class=\"cv\" id=\"cvTable\"></table>\n      <div class=\"total\" id=\"total\"></div>\n      <div class=\"note\">演示库覆盖初中常见反应；未收录的组合会判定为“不能反应”，可作课堂拓展讨论。</div>\n    </div>\n  </div>\n\n  <footer>• Designed by BoRon •</footer>\n</div>\n<div class=\"flash\" id=\"flash\"></div>\n\n";

/* ================= CORE（无 DOM 依赖） ================= */
/*CORE-START*/
const EL={
  H:{color:'#eef3f8',text:'#22303f',stroke:'#a9b8c7',mass:1},
  C:{color:'#5b6673',text:'#fff',stroke:'#8a97a6',mass:12},
  N:{color:'#4b6fd6',text:'#fff',stroke:'#8ea6e8',mass:14},
  O:{color:'#e34b4b',text:'#fff',stroke:'#ff8a8a',mass:16},
  Na:{color:'#a06fd0',text:'#fff',stroke:'#c39ce6',mass:23},
  Mg:{color:'#9aa7b5',text:'#1f2a37',stroke:'#c3ccd6',mass:24},
  Al:{color:'#a8b0b8',text:'#1f2a37',stroke:'#cbd2d9',mass:27},
  P:{color:'#ff9f43',text:'#4a2600',stroke:'#ffc98a',mass:31},
  S:{color:'#e0b23c',text:'#3a2c00',stroke:'#f4d27a',mass:32},
  Cl:{color:'#4caf50',text:'#fff',stroke:'#8fd492',mass:35.5},
  K:{color:'#d07fa0',text:'#fff',stroke:'#e8aec4',mass:39},
  Ca:{color:'#5fa79f',text:'#fff',stroke:'#93c8c2',mass:40},
  Mn:{color:'#7a5fb0',text:'#fff',stroke:'#a893d3',mass:55},
  Fe:{color:'#8a6a4f',text:'#fff',stroke:'#b79579',mass:56},
  Cu:{color:'#c47a3a',text:'#fff',stroke:'#e0a878',mass:64},
  Zn:{color:'#7f8c9b',text:'#fff',stroke:'#aab6c3',mass:65},
  Ag:{color:'#c9ced6',text:'#1f2a37',stroke:'#e8ecf1',mass:108},
  Ba:{color:'#b9a56a',text:'#fff',stroke:'#d8c89a',mass:137},
  Hg:{color:'#b6c2ce',text:'#1f2a37',stroke:'#dde5ec',mass:201}
};

function parseFormula(str){
  let i=0;
  function readNum(){let s='';while(i<str.length&&str[i]>='0'&&str[i]<='9'){s+=str[i];i++;}return s?parseInt(s,10):1;}
  function group(){
    const c={};
    while(i<str.length){
      const ch=str[i];
      if(ch==='('){i++;const inner=group();if(str[i]===')')i++;const n=readNum();
        for(const k in inner)c[k]=(c[k]||0)+inner[k]*n;}
      else if(ch===')'){return c;}
      else if(ch==='·'||ch==='•'||ch==='*'){i++;const n=readNum();
        const inner=group();
        for(const k in inner)c[k]=(c[k]||0)+inner[k]*n;}
      else if(ch>='A'&&ch<='Z'){let el=ch;i++;
        while(i<str.length&&str[i]>='a'&&str[i]<='z'){el+=str[i];i++;}
        const n=readNum();c[el]=(c[el]||0)+n;}
      else{i++;}
    }
    return c;
  }
  return group();
}

function clusterCoords(n){
  if(n<=1)return[[0,0]];
  const coords=[[0,0]];
  const ring=Math.min(n-1,6);
  const R1=(ring<=3?34:32);
  for(let k=0;k<ring;k++){const a=-Math.PI/2+k*2*Math.PI/ring;coords.push([Math.cos(a)*R1,Math.sin(a)*R1]);}
  let left=n-1-ring,layer=0;
  while(left>0){
    const cnt=Math.min(left,8),R=52+layer*20;
    for(let k=0;k<cnt;k++){const a=-Math.PI/2+(k+0.5)*2*Math.PI/cnt;coords.push([Math.cos(a)*R,Math.sin(a)*R]);}
    left-=cnt;layer++;
  }
  return coords;
}

/* —— 离子化合物 / 含氧酸几何：金属与氢必须连在氧上（M—O—X、O—H），不得直连酸根中心 —— */
const ACID_C={S:1,C:1,N:1,Cl:1,Mn:1,P:1};
const METAL_EL={Na:1,K:1,Ca:1,Mg:1,Cu:1,Zn:1,Fe:1,Al:1,Ag:1,Ba:1,Hg:1};
function ionicGeo(sp){
  if(sp.id==='NH4Cl'){
    const atoms=[{el:'N',x:-16,y:0}];
    for(let k=0;k<4;k++){const a=-Math.PI/2+k*Math.PI/2;
      atoms.push({el:'H',x:-16+Math.cos(a)*30,y:Math.sin(a)*30});}
    atoms.push({el:'Cl',x:56,y:0});
    const bonds=[1,2,3,4].map(i=>({a:0,b:i,order:1}));
    return {atoms,bonds};
  }
  const cnt=sp.counts,els=Object.keys(cnt);
  const hasO=(cnt.O||0)>0;
  const metals=els.filter(e=>METAL_EL[e]);
  if(!hasO)return null;
  const cEl=els.find(e=>ACID_C[e]&&cnt[e]>0);
  /* 碱 M(OH)n：金属中心，O 围绕，H 在 O 外侧 */
  if(!cEl&&metals.length===1&&cnt.H&&cnt.H===cnt.O){
    const nO=cnt.O,atoms=[{el:metals[0],x:0,y:0}],bonds=[];
    for(let k=0;k<nO;k++){
      const a=-Math.PI/2+k*2*Math.PI/nO;
      const oi=atoms.length;
      atoms.push({el:'O',x:Math.cos(a)*32,y:Math.sin(a)*32});
      atoms.push({el:'H',x:Math.cos(a)*58,y:Math.sin(a)*58});
      bonds.push({a:0,b:oi,order:1},{a:oi,b:oi+1,order:1});
    }
    return {atoms,bonds};
  }
  /* 金属氧化物 M2O3（Fe2O3、Al2O3 等）：W 型交替链 O—M—O—M—O（离子晶体中阴阳离子交替排列） */
  if(!cEl&&metals.length===1&&!cnt.H&&cnt[metals[0]]===2&&cnt.O===3){
    const M=metals[0];
    const seq=['O',M,'O',M,'O'];
    const xs=[-52,-26,0,26,52],ys=[-16,16,-16,16,-16];
    const atoms=seq.map((el,i)=>({el,x:xs[i],y:ys[i]}));
    const bonds=[0,1,2,3].map(i=>({a:i,b:i+1,order:1}));
    return {atoms,bonds};
  }
  /* 金属氧化物 MxOy：主要金属为中心连 O，其余金属为独立离子 */
  if(!cEl&&metals.length&&!cnt.H){
    let M=metals[0];metals.forEach(e=>{if(cnt[e]>cnt[M])M=e;});
    const extra=cnt[M]-1,nO=cnt.O;
    const atoms=[{el:M,x:0,y:0}],bonds=[];
    for(let k=0;k<nO;k++){
      const a=-Math.PI/2+k*2*Math.PI/nO;
      const oi=atoms.length;
      atoms.push({el:'O',x:Math.cos(a)*32,y:Math.sin(a)*32});
      bonds.push({a:0,b:oi,order:1});
    }
    for(let k=0;k<extra;k++){
      const a=Math.PI/2+(k-(extra-1)/2)*0.9;
      atoms.push({el:M,x:Math.cos(a)*72,y:Math.sin(a)*72});
    }
    return {atoms,bonds};
  }
  if(!cEl)return null;
  /* 含氧酸 / 含氧酸盐：酸根团（中心+O），H 与金属附着在 O 外侧；多酸根拆团，多余金属为独立离子 */
  const nC=cnt[cEl],nO=cnt.O;
  const perList=[];
  for(let g=0;g<nC;g++)perList.push(Math.floor(nO/nC)+(g<nO%nC?1:0));
  if(perList.some(p=>p<1||p>4))return null;
  const att=[];
  els.forEach(e=>{if(e!==cEl&&e!=='O'){for(let k=0;k<cnt[e];k++)att.push(e);}});
  const atoms=[],bonds=[];
  const gap=perList[0]>=4?150:132;
  let ai=0;
  for(let g=0;g<nC;g++){
    const cx=(g-(nC-1)/2)*gap;
    const ci=atoms.length;
    const perO=perList[g];
    atoms.push({el:cEl,x:cx,y:0});
    const oIdx=[];
    for(let k=0;k<perO;k++){
      const a=-Math.PI/2+k*2*Math.PI/perO;
      const oi=atoms.length;
      atoms.push({el:'O',x:cx+Math.cos(a)*34,y:Math.sin(a)*34});
      bonds.push({a:ci,b:oi,order:1});
      oIdx.push(oi);
    }
    if(nC===1){
      const nAtt=Math.min(att.length,perO);
      for(let k=0;k<nAtt;k++){
        const a=-Math.PI/2+k*2*Math.PI/perO;
        atoms.push({el:att[ai++],x:cx+Math.cos(a)*62,y:Math.sin(a)*62});
        bonds.push({a:oIdx[k],b:atoms.length-1,order:1});
      }
    }
  }
  if(nC>1){
    const extra=att.length-ai;
    for(let k=0;k<extra;k++){
      atoms.push({el:att[ai++],x:(k-(extra-1)/2)*(gap/Math.max(extra,1)),y:52});
    }
  } else {
    let col=0;
    while(ai<att.length){atoms.push({el:att[ai++],x:(col++-(att.length-ai+col-1)/2)*30,y:66});}
  }
  return {atoms,bonds};
}

function ethanolGeo(){
  const pos=[[0,0],[40,0],[80,0],[-18,-24],[-18,24],[0,32],[40,-30],[40,30],[108,-20]];
  const els=['C','C','O','H','H','H','H','H','H'];
  const bonds=[[0,1],[1,2],[0,3],[0,4],[0,5],[1,6],[1,7],[2,8]];
  return {atoms:pos.map((p,i)=>({el:els[i],x:p[0],y:p[1]})),
          bonds:bonds.map(b=>({a:b[0],b:b[1],order:1}))};
}

/* 甲酸 HCOOH：H—C(=O)—O—H（羧基结构，C 上连 H 和双键 O，羟基 H 连在 O 上） */
function hcoohGeo(){
  const pos=[[0,0],[-17,-36],[36,8],[64,26],[-34,14]];
  const els=['C','O','O','H','H'];
  return {atoms:pos.map((p,i)=>({el:els[i],x:p[0],y:p[1]})),
          bonds:[{a:0,b:1,order:2},{a:0,b:2,order:1},{a:2,b:3,order:1},{a:0,b:4,order:1}]};
}

function buildGeo(sp){
  if(sp.id==='C2H5OH')return ethanolGeo();
  if(sp.id==='HCOOH')return hcoohGeo();
  /* CO、CO2 是共价分子：不走含氧酸分支，保留 C≡O 三键 / O=C=O 双键 */
  const ig=(sp.id==='CO'||sp.id==='CO2')?null:ionicGeo(sp);
  if(ig)return ig;
  const cnt=sp.counts;
  let arr=[];
  for(const el in cnt)for(let k=0;k<cnt[el];k++)arr.push(el);
  const center=sp.center||(cnt['C']?'C':Object.keys(cnt)[0]);
  arr.sort((a,b)=>{if(a===center&&b!==center)return -1;if(b===center&&a!==center)return 1;return 0;});
  if(sp.id==='H2O2')arr=['H','O','O','H'];
  const n=arr.length;let coords=[];
  if(n===1)coords=[[0,0]];
  else if(n===2)coords=[[-15,0],[15,0]];
  else if(n===3){coords=(sp.shape==='bent')?[[0,-4],[-22,15],[22,15]]:[[0,0],[-27,0],[27,0]];}
  else if(n===4){if(sp.id==='H2O2'){coords=[[-33,0],[-11,0],[11,0],[33,0]];}else{coords=clusterCoords(4);}}
  else if(n===5)coords=[[0,0],[-24,-20],[24,-20],[-24,20],[24,20]];
  else coords=clusterCoords(n);
  const atoms=arr.map((el,i)=>({el,x:coords[i][0],y:coords[i][1]}));
  const bonds=[];const bo=sp.bondOrder||1;
  if(n===2)bonds.push({a:0,b:1,order:bo});
  else if(n===3)bonds.push({a:0,b:1,order:bo},{a:0,b:2,order:bo});
  else if(n===4){
    if(sp.id==='H2O2'){bonds.push({a:0,b:1,order:1},{a:1,b:2,order:1},{a:2,b:3,order:1});}
    else{for(let k=1;k<4;k++)bonds.push({a:0,b:k,order:1});}
  }
  else if(n===5){for(let k=1;k<5;k++)bonds.push({a:0,b:k,order:1});}
  return {atoms,bonds};
}

const SPECIES_RAW=[
['O2','氧气','O2','单质',1,{bondOrder:2}],
['H2','氢气','H2','单质',1,{bondOrder:1}],
['N2','氮气','N2','单质',1,{bondOrder:3}],
['C','碳','C','单质',1,{}],
['S','硫','S','单质',1,{}],
['Fe','铁','Fe','单质',1,{}],
['Mg','镁','Mg','单质',1,{}],
['Cu','铜','Cu','单质',1,{}],
['Zn','锌','Zn','单质',1,{}],
['Al','铝','Al','单质',1,{}],
['CO2','二氧化碳','CO2','化合物',1,{center:'C',shape:'linear',bondOrder:2}],
['CO','一氧化碳','CO','化合物',1,{bondOrder:3}],
['SO2','二氧化硫','SO2','化合物',1,{center:'S',shape:'linear',bondOrder:2}],
['H2O','水','H2O','化合物',1,{center:'O',shape:'bent'}],
['H2O2','过氧化氢','H2O2','化合物',1,{center:'O'}],
['CH4','甲烷','CH4','化合物',1,{center:'C'}],
['C2H5OH','乙醇','C2H5OH','化合物',1,{}],
['CaO','氧化钙','CaO','化合物',1,{center:'Ca'}],
['MgO','氧化镁','MgO','化合物',0,{center:'Mg'}],
['ZnO','氧化锌','ZnO','化合物',0,{center:'Zn'}],
['CuO','氧化铜','CuO','化合物',1,{center:'Cu'}],
['Fe2O3','氧化铁','Fe2O3','化合物',1,{center:'Fe'}],
['Fe3O4','四氧化三铁','Fe3O4','化合物',0,{center:'Fe'}],
['FeS','硫化亚铁','FeS','化合物',0,{center:'Fe'}],
['CaCO3','碳酸钙','CaCO3','化合物',1,{center:'C'}],
['Ca(OH)2','氢氧化钙','Ca(OH)2','化合物',1,{center:'Ca'}],
['CaSO4','硫酸钙','CaSO4','化合物',0,{center:'S'}],
['NaOH','氢氧化钠','NaOH','化合物',1,{center:'O'}],
['NaCl','氯化钠','NaCl','化合物',0,{center:'Na'}],
['HCl','盐酸','HCl','化合物',1,{center:'H'}],
['H2SO4','硫酸','H2SO4','化合物',1,{center:'S'}],
['Na2CO3','碳酸钠','Na2CO3','化合物',1,{center:'C'}],
['NaHCO3','碳酸氢钠','NaHCO3','化合物',1,{center:'C'}],
['Na2SO4','硫酸钠','Na2SO4','化合物',0,{center:'S'}],
['KMnO4','高锰酸钾','KMnO4','化合物',1,{center:'Mn'}],
['K2MnO4','锰酸钾','K2MnO4','化合物',0,{center:'Mn'}],
['MnO2','二氧化锰','MnO2','化合物',0,{center:'Mn'}],
['KClO3','氯酸钾','KClO3','化合物',1,{center:'Cl'}],
['KCl','氯化钾','KCl','化合物',0,{center:'K'}],
['CuSO4','硫酸铜','CuSO4','化合物',1,{center:'S'}],
['FeSO4','硫酸亚铁','FeSO4','化合物',0,{center:'S'}],
['ZnSO4','硫酸锌','ZnSO4','化合物',0,{center:'S'}],
['MgSO4','硫酸镁','MgSO4','化合物',0,{center:'S'}],
['CuCl2','氯化铜','CuCl2','化合物',0,{center:'Cu'}],
['FeCl2','氯化亚铁','FeCl2','化合物',0,{center:'Fe'}],
['FeCl3','氯化铁','FeCl3','化合物',0,{center:'Fe'}],
['ZnCl2','氯化锌','ZnCl2','化合物',0,{center:'Zn'}],
['MgCl2','氯化镁','MgCl2','化合物',1,{center:'Mg'}],
['CaCl2','氯化钙','CaCl2','化合物',0,{center:'Ca'}],
['Cu(OH)2','氢氧化铜','Cu(OH)2','化合物',0,{center:'Cu'}],
['H2CO3','碳酸','H2CO3','化合物',0,{center:'C'}],
['Al2O3','氧化铝','Al2O3','化合物',0,{center:'Al'}],
['Hg','汞','Hg','单质',1],
['HgO','氧化汞','HgO','化合物',0,{center:'Hg'}],
['P','红磷','P','单质',1],
['P2O5','五氧化二磷','P2O5','化合物',0,{center:'P'}],
['SO3','三氧化硫','SO3','化合物',1,{center:'S'}],
['H2SO3','亚硫酸','H2SO3','化合物',0,{center:'S'}],
['Al2(SO4)3','硫酸铝','Al2(SO4)3','化合物',0,{center:'S'}],
['AlCl3','氯化铝','AlCl3','化合物',0,{center:'Al'}],
['Al(OH)3','氢氧化铝','Al(OH)3','化合物',1,{center:'Al'}],
['Fe(OH)3','氢氧化铁','Fe(OH)3','化合物',1,{center:'Fe'}],
['Fe2(SO4)3','硫酸铁','Fe2(SO4)3','化合物',0,{center:'S'}],
['Cu(NO3)2','硝酸铜','Cu(NO3)2','化合物',0,{center:'N'}],
['AgNO3','硝酸银','AgNO3','化合物',1,{center:'N'}],
['Ag','银','Ag','单质',0],
['Na2SO3','亚硫酸钠','Na2SO3','化合物',0,{center:'S'}],
['CaSO3','亚硫酸钙','CaSO3','化合物',0,{center:'Ca'}],
['NH3','氨气','NH3','化合物',1,{center:'N'}],
['NO','一氧化氮','NO','化合物',0,{bondOrder:2}],
['NH4Cl','氯化铵','NH4Cl','化合物',0,{center:'N'}],
['HCOOH','甲酸','HCOOH','化合物',1,{}],
['BaCl2','氯化钡','BaCl2','化合物',1,{center:'Ba'}],
['BaSO4','硫酸钡','BaSO4','化合物',0,{center:'S'}],
['BaCO3','碳酸钡','BaCO3','化合物',1,{center:'C'}],
['Mg(OH)2','氢氧化镁','Mg(OH)2','化合物',1,{center:'Mg'}]
];

const SPECIES=[],SP={};
SPECIES_RAW.forEach(row=>{
  const [id,name,formula,cat,pick,opt]=row;
  const sp=Object.assign({id,name,formula,cat,pick:!!pick,counts:parseFormula(formula)},opt||{});
  sp.geo=buildGeo(sp);
  SPECIES.push(sp);SP[id]=sp;
});

function R(reactants,products,cond,type,phen){
  return {reactants:reactants.map(x=>({s:x[0],k:x[1]})),
          products:products.map(x=>({s:x[0],k:x[1]})),
          cond,type,phen};
}
const REACTIONS=[
R([['C',1],['O2',1]],[['CO2',1]],'点燃','化合','木炭在氧气中剧烈燃烧，发出白光，放出热量，生成能使澄清石灰水变浑浊的气体。'),
R([['H2',2],['O2',1]],[['H2O',2]],'点燃','化合','氢气燃烧发出淡蓝色火焰，放出大量热，干冷烧杯内壁出现水雾。'),
R([['S',1],['O2',1]],[['SO2',1]],'点燃','化合','硫在氧气中燃烧，发出明亮的蓝紫色火焰，生成有刺激性气味的气体。'),
R([['CO',2],['O2',1]],[['CO2',2]],'点燃','化合','一氧化碳燃烧发出蓝色火焰，生成二氧化碳。'),
R([['CH4',1],['O2',2]],[['CO2',1],['H2O',2]],'点燃','燃烧','甲烷燃烧发出蓝色火焰，放出热量，生成 CO₂ 和 H₂O。'),
R([['C2H5OH',1],['O2',3]],[['CO2',2],['H2O',3]],'点燃','燃烧','乙醇燃烧发出淡蓝色火焰，放出大量热。'),
R([['Mg',2],['O2',1]],[['MgO',2]],'点燃','化合','镁条剧烈燃烧，发出耀眼白光，生成白色固体。'),
R([['Cu',2],['O2',1]],[['CuO',2]],'加热','化合','铜丝加热后表面变黑，生成氧化铜。'),
R([['Fe',3],['O2',2]],[['Fe3O4',1]],'点燃','化合','铁丝在氧气中剧烈燃烧，火星四射，生成黑色固体。'),
R([['Zn',2],['O2',1]],[['ZnO',2]],'点燃','化合','锌在空气中燃烧，生成白色氧化锌固体。'),
R([['Fe',1],['S',1]],[['FeS',1]],'加热','化合','铁粉与硫粉混合加热，生成黑色硫化亚铁。'),
R([['CaO',1],['H2O',1]],[['Ca(OH)2',1]],'','化合','氧化钙与水反应放出大量热，生成氢氧化钙。'),
R([['CO2',1],['H2O',1]],[['H2CO3',1]],'','化合','二氧化碳溶于水生成碳酸，紫色石蕊溶液变红。'),
R([['CaO',1],['CO2',1]],[['CaCO3',1]],'','化合','氧化钙与二氧化碳化合生成碳酸钙。'),
R([['C',1],['CO2',1]],[['CO',2]],'高温','化合','炽热的碳与二氧化碳反应，生成一氧化碳。'),
R([['H2O',2]],[['H2',2],['O2',1]],'通电','分解','通电后两极产生气泡，正极产生氧气、负极产生氢气，体积比约 1:2。'),
R([['H2O2',2]],[['H2O',2],['O2',1]],'MnO₂','分解','有大量气泡产生，带火星的木条复燃，说明生成了氧气。'),
R([['KClO3',2]],[['KCl',2],['O2',3]],'MnO₂、加热','分解','加热产生氧气，带火星的木条复燃。'),
R([['KMnO4',2]],[['K2MnO4',1],['MnO2',1],['O2',1]],'加热','分解','加热高锰酸钾产生氧气，固体由紫黑色变黑。'),
R([['CaCO3',1]],[['CaO',1],['CO2',1]],'高温','分解','高温煅烧石灰石，生成生石灰并放出二氧化碳。'),
R([['Zn',1],['HCl',2]],[['ZnCl2',1],['H2',1]],'','置换','锌粒表面产生大量气泡，锌逐渐溶解。'),
R([['Fe',1],['HCl',2]],[['FeCl2',1],['H2',1]],'','置换','铁与稀盐酸反应产生气泡，溶液变为浅绿色。'),
R([['Mg',1],['HCl',2]],[['MgCl2',1],['H2',1]],'','置换','镁与稀盐酸剧烈反应，产生大量气泡。'),
R([['Fe',1],['H2SO4',1]],[['FeSO4',1],['H2',1]],'','置换','铁与稀硫酸反应产生气泡，溶液变为浅绿色。'),
R([['Zn',1],['H2SO4',1]],[['ZnSO4',1],['H2',1]],'','置换','锌与稀硫酸反应产生大量气泡。'),
R([['Mg',1],['H2SO4',1]],[['MgSO4',1],['H2',1]],'','置换','镁与稀硫酸剧烈反应，产生大量气泡。'),
R([['Fe',1],['CuSO4',1]],[['FeSO4',1],['Cu',1]],'','置换','铁表面析出紫红色铜，溶液由蓝色变为浅绿色。'),
R([['Zn',1],['CuSO4',1]],[['ZnSO4',1],['Cu',1]],'','置换','锌表面析出紫红色铜，溶液蓝色变浅。'),
R([['Mg',1],['CuSO4',1]],[['MgSO4',1],['Cu',1]],'','置换','镁表面析出紫红色铜，溶液蓝色变浅。'),
R([['H2',1],['CuO',1]],[['Cu',1],['H2O',1]],'加热','置换','黑色氧化铜变为红色铜，试管口出现水珠。'),
R([['C',1],['CuO',2]],[['Cu',2],['CO2',1]],'高温','置换','黑色固体变为红色，生成能使石灰水变浑浊的气体。'),
R([['CO',1],['CuO',1]],[['Cu',1],['CO2',1]],'加热','氧化还原','黑色氧化铜变为红色铜，生成二氧化碳。'),
R([['Fe2O3',1],['CO',3]],[['Fe',2],['CO2',3]],'高温','氧化还原','红棕色氧化铁变为黑色铁，生成能使石灰水变浑浊的气体。'),
R([['Fe2O3',1],['H2',3]],[['Fe',2],['H2O',3]],'加热','置换','红棕色粉末逐渐变黑，试管口出现水珠。'),
R([['Fe2O3',2],['C',3]],[['Fe',4],['CO2',3]],'高温','置换','红棕色粉末变为黑色，生成能使石灰水变浑浊的气体。'),
R([['HCl',1],['NaOH',1]],[['NaCl',1],['H2O',1]],'','复分解','无明显现象，需借助指示剂判断反应发生。'),
R([['H2SO4',1],['NaOH',2]],[['Na2SO4',1],['H2O',2]],'','复分解','无明显现象，需借助指示剂判断反应发生。'),
R([['HCl',2],['Ca(OH)2',1]],[['CaCl2',1],['H2O',2]],'','复分解','无明显现象，需借助指示剂判断反应发生。'),
R([['H2SO4',1],['Ca(OH)2',1]],[['CaSO4',1],['H2O',2]],'','复分解','无明显现象，需借助指示剂判断反应发生。'),
R([['Na2CO3',1],['HCl',2]],[['NaCl',2],['H2O',1],['CO2',1]],'','复分解','产生大量气泡，生成能使石灰水变浑浊的气体。'),
R([['NaHCO3',1],['HCl',1]],[['NaCl',1],['H2O',1],['CO2',1]],'','复分解','产生大量气泡（泡沫灭火器的原理）。'),
R([['CaCO3',1],['HCl',2]],[['CaCl2',1],['H2O',1],['CO2',1]],'','复分解','固体逐渐溶解，产生大量气泡。'),
R([['Na2CO3',1],['H2SO4',1]],[['Na2SO4',1],['H2O',1],['CO2',1]],'','复分解','产生大量气泡。'),
R([['CaCO3',1],['H2SO4',1]],[['CaSO4',1],['H2O',1],['CO2',1]],'','复分解','产生气泡，固体逐渐溶解。'),
R([['CuO',1],['HCl',2]],[['CuCl2',1],['H2O',1]],'','复分解','黑色固体溶解，溶液变为蓝绿色。'),
R([['Fe2O3',1],['HCl',6]],[['FeCl3',2],['H2O',3]],'','复分解','红棕色固体溶解，溶液变为黄色。'),
R([['CuO',1],['H2SO4',1]],[['CuSO4',1],['H2O',1]],'','复分解','黑色固体溶解，溶液变为蓝色。'),
R([['CaO',1],['HCl',2]],[['CaCl2',1],['H2O',1]],'','复分解','固体溶解，放出热量。'),
R([['CaO',1],['H2SO4',1]],[['CaSO4',1],['H2O',1]],'','复分解','固体溶解，放出热量。'),
R([['NaOH',2],['CuSO4',1]],[['Cu(OH)2',1],['Na2SO4',1]],'','复分解','产生蓝色絮状沉淀。'),
R([['Ca(OH)2',1],['Na2CO3',1]],[['CaCO3',1],['NaOH',2]],'','复分解','产生白色沉淀。'),
R([['CuSO4',1],['Ca(OH)2',1]],[['Cu(OH)2',1],['CaSO4',1]],'','复分解','产生蓝色沉淀（波尔多液配制原理）。'),
R([['CO2',1],['Ca(OH)2',1]],[['CaCO3',1],['H2O',1]],'','复分解','澄清石灰水变浑浊。'),
R([['CO2',1],['NaOH',2]],[['Na2CO3',1],['H2O',1]],'','复分解','无明显现象，CO₂ 被吸收。'),
/* —— 补充：汇总文档中的其余方程式 —— */
R([['Al',4],['O2',3]],[['Al2O3',2]],'','化合','铝在常温下就能与空气中的氧气反应，表面生成一层致密的氧化铝薄膜，阻止内部的铝继续被氧化——这就是铝制品耐腐蚀的原因。'),
R([['Al',4],['O2',3]],[['Al2O3',2]],'点燃','化合','铝箔在氧气中剧烈燃烧，发出耀眼的白光，放出大量热，生成白色固体氧化铝——与常温下的缓慢氧化相比，现象更剧烈，但生成物完全相同。'),
R([['Hg',2],['O2',1]],[['HgO',2]],'加热','化合','银白色液态汞受热与氧气化合，生成红色氧化汞固体。'),
R([['P',4],['O2',5]],[['P2O5',2]],'点燃','化合','红磷剧烈燃烧，放热，产生大量白烟（五氧化二磷固体小颗粒）。'),
R([['C',2],['O2',1]],[['CO',2]],'点燃','化合','氧气不足时碳不充分燃烧，生成有毒的一氧化碳。'),
R([['SO2',1],['H2O',1]],[['H2SO3',1]],'','化合','二氧化硫溶于水生成亚硫酸，溶液能使紫色石蕊变红。'),
R([['SO3',1],['H2O',1]],[['H2SO4',1]],'','化合','三氧化硫溶于水生成硫酸。'),
R([['HgO',2]],[['Hg',2],['O2',1]],'加热','分解','红色氧化汞受热分解为银白色液态汞和使带火星木条复燃的氧气。'),
R([['H2CO3',1]],[['H2O',1],['CO2',1]],'','分解','碳酸很不稳定，分解为水和二氧化碳，石蕊溶液由红恢复紫色。'),
R([['NaHCO3',2]],[['Na2CO3',1],['H2O',1],['CO2',1]],'加热','分解','碳酸氢钠（小苏打）受热分解，产生能使澄清石灰水变浑浊的气体（焙制糕点的原理）。'),
R([['Al',2],['H2SO4',3]],[['Al2(SO4)3',1],['H2',3]],'','置换','铝与稀硫酸反应产生大量气泡。'),
R([['Al',2],['HCl',6]],[['AlCl3',2],['H2',3]],'','置换','铝与稀盐酸反应产生大量气泡。'),
R([['H2',4],['Fe3O4',1]],[['Fe',3],['H2O',4]],'加热','置换','黑色固体逐渐变为银白色，试管口出现水珠。'),
R([['Cu',1],['AgNO3',2]],[['Ag',2],['Cu(NO3)2',1]],'','置换','红色金属表面覆盖一层银白色物质，溶液由无色变为蓝色。'),
R([['Fe2O3',1],['H2SO4',3]],[['Fe2(SO4)3',1],['H2O',3]],'','复分解','红棕色固体溶解，溶液变为黄色。'),
R([['Cu(OH)2',1],['HCl',2]],[['CuCl2',1],['H2O',2]],'','复分解','蓝色沉淀溶解，溶液变为蓝色。'),
R([['Fe(OH)3',1],['HCl',3]],[['FeCl3',1],['H2O',3]],'','复分解','红褐色沉淀溶解，溶液变为黄色。'),
R([['Al(OH)3',1],['HCl',3]],[['AlCl3',1],['H2O',3]],'','复分解','氢氧化铝与盐酸中和（可用于治疗胃酸过多）。'),
R([['Cu(OH)2',1],['H2SO4',1]],[['CuSO4',1],['H2O',2]],'','复分解','蓝色沉淀溶解，溶液变为蓝色。'),
R([['Fe(OH)3',2],['H2SO4',3]],[['Fe2(SO4)3',1],['H2O',6]],'','复分解','红褐色沉淀溶解，溶液变为黄色。'),
R([['FeCl3',1],['NaOH',3]],[['Fe(OH)3',1],['NaCl',3]],'','复分解','溶液黄色褪去，生成红褐色沉淀。'),
R([['CuCl2',1],['NaOH',2]],[['Cu(OH)2',1],['NaCl',2]],'','复分解','溶液蓝色褪去，生成蓝色沉淀。'),
R([['CaCl2',1],['Na2CO3',1]],[['CaCO3',1],['NaCl',2]],'','复分解','两种盐溶液混合，产生白色沉淀。'),
R([['SO2',1],['NaOH',2]],[['Na2SO3',1],['H2O',1]],'','复分解','氢氧化钠溶液吸收二氧化硫气体。'),
R([['SO3',1],['NaOH',2]],[['Na2SO4',1],['H2O',1]],'','复分解','氢氧化钠溶液吸收三氧化硫气体。'),
R([['SO2',1],['Ca(OH)2',1]],[['CaSO3',1],['H2O',1]],'','复分解','熟石灰吸收二氧化硫，生成白色亚硫酸钙。'),
R([['N2',1],['H2',3]],[['NH3',2]],'高温、高压、催化剂','化合','氮气与氢气在高温、高压和催化剂条件下化合生成氨气（工业合成氨）。'),
R([['NH3',4],['O2',5]],[['NO',4],['H2O',6]],'催化剂、加热','氧化还原','氨气在催化剂作用下与氧气反应，生成一氧化氮和水（氨的催化氧化）。'),
R([['NH3',1],['HCl',1]],[['NH4Cl',1]],'','化合','氨气与氯化氢气体相遇，产生大量白烟（氯化铵固体小颗粒）。'),
/* —— 北京中考常见方程式（近五年）—— */
R([['Mg',2],['CO2',1]],[['MgO',2],['C',1]],'点燃','置换','镁条在二氧化碳中剧烈燃烧，发出耀眼白光，瓶壁附着黑色碳粒——所以镁等活泼金属着火时不能用 CO₂ 灭火器扑救。'),
R([['BaCl2',1],['Na2SO4',1]],[['BaSO4',1],['NaCl',2]],'','复分解','产生不溶于稀硝酸的白色沉淀——这是检验硫酸根离子（SO₄²⁻）的常用方法。'),
R([['BaCl2',1],['H2SO4',1]],[['BaSO4',1],['HCl',2]],'','复分解','产生不溶于稀硝酸的白色沉淀；本质是 Ba²⁺ 与 SO₄²⁻ 结合，H⁺ 与 Cl⁻ 并未参加反应。'),
R([['HCOOH',1]],[['CO',1],['H2O',1]],'加热','分解','甲酸（蚁酸）在浓硫酸催化并加热的条件下分解，生成一氧化碳和水——实验室可用此法获得较纯净的 CO。'),
/* —— 目标检测 / 总复习答案文档中出现、且属于初中范围的方程式 —— */
R([['MgCl2',1],['NaOH',2]],[['Mg(OH)2',1],['NaCl',2]],'','复分解','产生白色絮状沉淀——可溶性镁盐与可溶性碱反应生成难溶的氢氧化镁。'),
R([['Mg(OH)2',1],['HCl',2]],[['MgCl2',1],['H2O',2]],'','复分解','白色沉淀逐渐溶解，溶液仍为无色——中和反应的典型表现。'),
R([['Mg(OH)2',1],['H2SO4',1]],[['MgSO4',1],['H2O',2]],'','复分解','白色沉淀溶解，生成可溶的硫酸镁。'),
R([['BaCO3',1],['HCl',2]],[['BaCl2',1],['H2O',1],['CO2',1]],'','复分解','白色固体逐渐溶解并产生气泡，气体能使澄清石灰水变浑浊。'),
R([['BaCO3',1],['H2SO4',1]],[['BaSO4',1],['H2O',1],['CO2',1]],'','复分解','产生气泡，同时生成不溶于酸的白色沉淀硫酸钡。')
];
REACTIONS.forEach((r,idx)=>{
  r.id='r'+idx;
  r._key=r.reactants.map(x=>x.s).sort().join('+');
});
const RXN_BY_KEY={};
REACTIONS.forEach(r=>{
  if(!RXN_BY_KEY[r._key])RXN_BY_KEY[r._key]=[];
  RXN_BY_KEY[r._key].push(r);
});

function findReactions(ids){return RXN_BY_KEY[[...ids].sort().join('+')]||null;}
function findReaction(ids){const a=findReactions(ids);return a?a[0]:null;}

function elCounts(list){
  const c={};
  list.forEach(g=>{
    const sc=SP[g.id].counts;
    for(const el in sc)c[el]=(c[el]||0)+sc[el]*g.count;
  });
  return c;
}
function massOf(c){let m=0;for(const el in c)m+=c[el]*(EL[el]?EL[el].mass:0);return m;}

/* 可选反应条件（学生自己选，作为判定输入） */
const CONDS=[
  {k:'常温',t:'常温',tip:'不加热、不点燃'},
  {k:'点燃',t:'点燃',tip:'用火点燃'},
  {k:'加热',t:'加热',tip:'酒精灯加热'},
  {k:'高温',t:'高温',tip:'高温加热（煅烧）'},
  {k:'通电',t:'通电',tip:'接通电源'},
  {k:'催化剂',t:'催化剂',tip:'加入 MnO₂ 等催化剂'}
];
/* 反应条件文本 → 必需条件集合（空数组表示常温下即可自发进行） */
function condNeed(cond){
  if(!cond)return [];
  const s=[];
  if(cond.includes('通电'))s.push('通电');
  if(cond.includes('高温'))s.push('高温');
  if(cond.includes('加热'))s.push('加热');
  if(cond.includes('点燃'))s.push('点燃');
  if(cond.includes('MnO')||cond.includes('催化剂'))s.push('催化剂');
  return s;
}
REACTIONS.forEach(r=>{r.need=condNeed(r.cond);});
/* 温度类条件强度：高温可覆盖加热/点燃，加热可覆盖点燃 */
const HEAT=['点燃','加热','高温'];
function condSatisfied(need,set){
  if(!set||!set.size)return !need.length;
  return (need||[]).every(c=>{
    if(set.has(c))return true;
    const i=HEAT.indexOf(c);
    if(i>=0)return HEAT.slice(i+1).some(h=>set.has(h));
    return false;
  });
}

function solveTest(selected,condSet){
  const ids=selected.map(x=>x.id);
  const cands=findReactions(ids);
  if(!cands){
    const rsn=classifyNoReaction(ids);
    return {ok:false,reasons:[rsn],reason:rsn,rxn:null};
  }
  // 同一反应物集合可能有多个候选（如 C+O2：充分燃烧生成 CO2 / 不充分燃烧生成 CO）
  const evals=cands.map(rxn=>{
    const need=rxn.need||[];
    const lack=need.filter(c=>!condSatisfied([c],condSet));
    let k=Infinity;
    rxn.reactants.forEach(r=>{
      const s=selected.find(x=>x.id===r.s);
      if(s)k=Math.min(k,s.count/r.k);
    });
    k=Math.floor(k);
    const reasons=[];
    if(lack.length)reasons.push('condition');
    if(!isFinite(k)||k<1)reasons.push('amount');
    const exact=isFinite(k)&&k>=1&&rxn.reactants.every(r=>{
      const s=selected.find(x=>x.id===r.s);
      return s&&s.count===k*r.k;
    });
    return {rxn,lack,k,reasons,exact};
  });
  const feasible=evals.filter(e=>!e.reasons.length);
  if(feasible.length){
    // 优先「恰好完全反应」；同分时优先「条件更专项」的路径
    // 例：铝与氧气——常温走缓慢氧化成膜、点燃走剧烈燃烧，两条方程式相同但现象不同
    feasible.sort((a,b)=>(b.exact-a.exact)
      ||((b.rxn.need||[]).length-(a.rxn.need||[]).length)
      ||(b.k-a.k));
    const {rxn,k}=feasible[0];
    const consumed={};
    rxn.reactants.forEach(r=>{consumed[r.s]=k*r.k;});
    const leftover={};
    selected.forEach(s=>{const l=s.count-(consumed[s.id]||0);if(l>0)leftover[s.id]=l;});
    const after=[];
    Object.keys(leftover).forEach(id=>after.push({id,count:leftover[id],leftover:true}));
    rxn.products.forEach(p=>after.push({id:p.s,count:k*p.k}));
    return {ok:true,rxn,k,consumed,leftover,exact:Object.keys(leftover).length===0,
            after,before:selected.map(s=>({id:s.id,count:s.count}))};
  }
  // 全部候选不可行：合并原因（任一候选条件满足而分子数不足 → amount，否则 condition）
  const condOK=evals.find(e=>!e.lack.length);
  const reasons=condOK?['amount']:['condition'];
  return {ok:false,reasons,reason:reasons[0],rxn:evals[0].rxn,lack:evals[0].lack};
}

function classifyNoReaction(ids){
  const S=new Set(ids);
  const metals=['Mg','Zn','Fe','Cu'];
  const acids=['HCl','H2SO4'];
  const combustibles=['C','S','H2','CO','CH4','C2H5OH','Mg','Fe','Zn'];
  const saltLike=['CuSO4','FeSO4','ZnSO4','MgSO4','CuCl2','FeCl2','FeCl3','ZnCl2','MgCl2','CaCl2','NaCl','Na2SO4','Na2CO3','NaHCO3','CaCO3','BaCO3','KCl','BaCl2','BaSO4'];
  const hasMetal=ids.some(i=>metals.includes(i));
  const hasAcid=ids.some(i=>acids.includes(i));
  const hasSalt=ids.some(i=>saltLike.includes(i));
  const hasCombustible=ids.some(i=>combustibles.includes(i));
  const hasO2=S.has('O2');
  if(hasMetal&&hasAcid)return 'activity';
  if(hasMetal&&hasSalt)return 'activity';
  if(hasCombustible&&!hasO2)return 'combustion';
  if(hasO2)return 'combustion';
  if(ids.length>=2)return 'metathesis';
  return 'noreact';
}

const REASONS=[
  {k:'condition',t:'反应条件不具备（该反应需要点燃、加热、高温、通电或催化剂）'},
  {k:'activity',t:'金属活动性顺序不符，不能发生置换反应'},
  {k:'metathesis',t:'生成物中没有沉淀、气体或水，不符合复分解反应的条件'},
  {k:'combustion',t:'缺少可燃物或助燃的氧气，不能燃烧'},
  {k:'amount',t:'反应物分子数不足，无法按整数个分子发生反应'},
  {k:'noreact',t:'这些物质之间本来就不能发生化学反应'}
];
const EXPLAIN={
  condition:'很多反应需要特定条件才能发生：燃烧要「点燃」，多数分解要「加热」或「高温」，电解要「通电」，过氧化氢分解要「催化剂」。条件不具备，微粒之间无法重新组合，就没有新物质生成。',
  activity:'金属活动性顺序：K Ca Na Mg Al Zn Fe Sn Pb (H) Cu Hg Ag Pt Au。排在氢前面的金属才能置换酸中的氢；排在前面的金属才能把后面的金属从其盐溶液中置换出来。',
  metathesis:'复分解反应发生的条件：两种化合物互相交换成分后，生成物中必须有沉淀、气体或水，否则反应不能发生。',
  combustion:'燃烧需要可燃物与氧气（或空气）接触并达到着火点。缺少可燃物或缺少氧气，都不能燃烧。',
  amount:'化学方程式中的分子个数必须是整数。你给的分子数达不到反应所需的最小整数比，所以无法反应，请适当增加分子数。',
  noreact:'这两类物质之间没有能生成新物质的反应路径（例如金属与金属、氧化物与氧化物等），所以无论怎么改变条件都不会发生反应。'
};
/*CORE-END*/

/* ================= 画布引擎 ================= */
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const W=1000,H=520;
const LEFT={x0:16,y0:46,x1:484,y1:466};
const RIGHT={x0:516,y0:46,x1:984,y1:466};
const MIDX=500;
let dpr=1,stage=null,progress=0,playing=false,speed=0.28,showLabel=true,lastTs=0;
let current=null,beforeList=[],afterList=[],arrowCond='—';
let resultReady=false;
/* 微粒热运动：任何状态下原子都持续做无规则微振动（客观事实） */
let thermoT=0;
/* 返回某原子的抖动偏移量 [dx,dy]（叠加在基础坐标上） */
function joff(i,amp){
  const p=i*2.399;
  return [Math.sin(thermoT*2.1+p)*amp, Math.cos(thermoT*1.55+p*1.757)*amp];
}

function fitCanvas(){
  dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1));
  cv.width=W*dpr;cv.height=H*dpr;
  cv.style.height=(cv.clientWidth*H/W)+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
function gridSpec(n,area,maxCols){
  if(n<=0)return{slots:[],cellW:area.x1-area.x0,cellH:area.y1-area.y0,cx:(area.x0+area.x1)/2,cy:(area.y0+area.y1)/2};
  const cols=Math.min(maxCols,Math.max(1,Math.ceil(Math.sqrt(n))));
  const rows=Math.ceil(n/cols);
  const cw=(area.x1-area.x0)/cols,ch=(area.y1-area.y0)/rows;
  const slots=[];
  for(let i=0;i<n;i++){const c=i%cols,r=Math.floor(i/cols);slots.push({x:area.x0+cw*(c+0.5),y:area.y0+ch*(r+0.5)});}
  return{slots,cellW:cw,cellH:ch,cx:(area.x0+area.x1)/2,cy:(area.y0+area.y1)/2};
}
function maxBBox(list){
  let w=0,h=0;
  list.forEach(g=>{
    const geo=SP[g.id].geo;let a=1e9,b=-1e9,c=1e9,d=-1e9;
    geo.atoms.forEach(p=>{a=Math.min(a,p.x);b=Math.max(b,p.x);c=Math.min(c,p.y);d=Math.max(d,p.y);});
    w=Math.max(w,b-a+30);h=Math.max(h,d-c+30);
  });
  return{w,h};
}
function placeMolecules(list,spec,scale){
  const atoms=[],bonds=[],mols=[];let slot=0;
  list.forEach(g=>{
    const geo=SP[g.id].geo;
    let cx=0,cy=0;geo.atoms.forEach(a=>{cx+=a.x;cy+=a.y;});
    cx/=geo.atoms.length;cy/=geo.atoms.length;
    for(let i=0;i<g.count;i++){
      const center=spec.slots[slot++]||{x:spec.cx,y:spec.cy};
      const base=atoms.length;
      geo.atoms.forEach(a=>atoms.push({el:a.el,x:center.x+(a.x-cx)*scale,y:center.y+(a.y-cy)*scale}));
      geo.bonds.forEach(b=>bonds.push({a:base+b.a,b:base+b.b,order:b.order}));
      mols.push({id:g.id,cx:center.x,cy:center.y,from:base,to:atoms.length-1});
    }
  });
  return{atoms,bonds,mols};
}
function buildStage(beforeList,afterList){
  const BL=beforeList.filter(g=>g.count>0),AL=afterList.filter(g=>g.count>0);
  const bN=BL.reduce((s,g)=>s+g.count,0),aN=AL.reduce((s,g)=>s+g.count,0);
  const bSpec=gridSpec(bN,LEFT,3),aSpec=gridSpec(aN,RIGHT,4);
  const bMax=maxBBox(BL),aMax=maxBBox(AL);
  let bScale=1.5,aScale=1.5;
  if(bN>0&&bMax.w>0)bScale=Math.min(bSpec.cellW*0.84/bMax.w,bSpec.cellH*0.84/bMax.h,1.5);
  if(aN>0&&aMax.w>0)aScale=Math.min(aSpec.cellW*0.84/aMax.w,aSpec.cellH*0.84/aMax.h,1.5);
  let scale=Math.max(0.24,Math.min(bScale,aScale,1.5));
  /* 原子放大：少分子时整体等比放大（上限 1.5 倍），后排学生可辨；框架/布局不变 */
  const atomR=Math.max(6,Math.min(20,13*scale));
  const b=placeMolecules(BL,bSpec,scale),a=placeMolecules(AL,aSpec,scale);
  const bBy={},aBy={};
  b.atoms.forEach((x,i)=>{(bBy[x.el]=bBy[x.el]||[]).push(i);});
  a.atoms.forEach((x,i)=>{(aBy[x.el]=aBy[x.el]||[]).push(i);});
  const anim=b.atoms.map(x=>({el:x.el,sx:x.x,sy:x.y,ex:x.x,ey:x.y}));
  Object.keys(bBy).forEach(el=>{
    const bi=bBy[el],ai=aBy[el]||[],kk=Math.min(bi.length,ai.length);
    for(let j=0;j<kk;j++){anim[bi[j]].ex=a.atoms[ai[j]].x;anim[bi[j]].ey=a.atoms[ai[j]].y;}
  });
  return{anim,startBonds:b.bonds,endBonds:a.bonds,rAtoms:b.atoms,pAtoms:a.atoms,
         mols:b.mols,atomR,scale,mode:'ok'};
}

/* 失败演示：分子靠近 → 受阻 → 退回（按失败原因呈现不同效果） */
function buildFailStage(beforeList,res){
  const st=buildStage(beforeList,[]);
  st.mode='fail';
  st.failKind=res.reasons.includes('condition')?'condition'
             :res.reasons.includes('amount')?'amount':'noreact';
  st.lone=[];
  // 向中线聚拢的位移（保持分子形状不变）
  st.shift=0.62;
  st.mols.forEach(m=>{
    const dx=(MIDX-m.cx)*st.shift;
    for(let i=m.from;i<=m.to;i++){st.anim[i].ex=st.anim[i].sx+dx;}
  });
  if(st.failKind==='amount'&&res.rxn){
    // 找出"等不到伙伴"的多余分子：数量与系数的比值最大者
    const ratios=res.rxn.reactants.map(r=>{
      const s=beforeList.find(x=>x.id===r.s);
      return {id:r.s,ratio:(s?s.count:0)/r.k};
    });
    const minR=Math.min.apply(null,ratios.map(x=>x.ratio));
    const shortIds={};
    ratios.forEach(x=>{if(x.ratio<=minR+1e-9)shortIds[x.id]=1;});
    st.mols.forEach((m,idx)=>{if(!shortIds[m.id])st.lone.push(idx);});
    if(!st.lone.length)st.mols.forEach((m,idx)=>st.lone.push(idx));
  }
  return st;
}

function roundRect(x,y,w,h,rd,fill){
  ctx.beginPath();ctx.moveTo(x+rd,y);ctx.arcTo(x+w,y,x+w,y+h,rd);ctx.arcTo(x+w,y+h,x,y+h,rd);
  ctx.arcTo(x,y+h,x,y,rd);ctx.arcTo(x,y,x+w,y,rd);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
}
function strokeBond(x1,y1,x2,y2,order,color){
  const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,px=-dy/len,py=dx/len;
  const offs=order===3?[-6.5,0,6.5]:order===2?[-4.2,4.2]:[0];
  ctx.strokeStyle=color;ctx.lineWidth=order===1?3.4:2.6;ctx.lineCap='round';
  offs.forEach(o=>{ctx.beginPath();ctx.moveTo(x1+px*o,y1+py*o);ctx.lineTo(x2+px*o,y2+py*o);ctx.stroke();});
}
/* 各元素原子相对半径（以常见原子半径与质量综合估计，H 最小） */
const ATOM_R={H:.56,C:.78,N:.78,O:.76,S:.92,P:.9,Cl:.88,Na:.84,Mg:.88,Al:.88,
  K:.96,Ca:.95,Ba:.98,Mn:.9,Fe:.92,Cu:.92,Zn:.92,Ag:1,Hg:1.04};
function drawAtom(el,x,y,r){
  const e=EL[el]||{color:'#888',text:'#fff'};
  r=r*(ATOM_R[el]||.85);
  ctx.save();ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=6;ctx.shadowOffsetY=2;
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=e.color;ctx.fill();
  ctx.shadowColor='transparent';
  if(e.stroke){ctx.lineWidth=1.1;ctx.strokeStyle=e.stroke;ctx.stroke();}
  if(showLabel&&r>=6){
    ctx.fillStyle=e.text;ctx.font='bold '+Math.max(7,Math.round(r*0.92))+'px "Microsoft YaHei",sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(el,x,y+0.5);
  }
  ctx.restore();
}
function easeInOut(t){return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}

function draw(){
  ctx.clearRect(0,0,W,H);
  roundRect(LEFT.x0-6,LEFT.y0-34,LEFT.x1-LEFT.x0+12,LEFT.y1-LEFT.y0+50,14,'#0e2138');
  roundRect(RIGHT.x0-6,RIGHT.y0-34,RIGHT.x1-RIGHT.x0+12,RIGHT.y1-RIGHT.y0+50,14,'#0e2138');
  ctx.textAlign='center';ctx.fillStyle='#7fa8dd';ctx.font='bold 15px "Microsoft YaHei",sans-serif';
  ctx.fillText('反应前（微观）',(LEFT.x0+LEFT.x1)/2,LEFT.y0-14);
  ctx.fillText('反应后（微观）',(RIGHT.x0+RIGHT.x1)/2,RIGHT.y0-14);

  const bc=beforeList.reduce((s,g)=>s+g.count,0),ac=afterList.reduce((s,g)=>s+g.count,0);
  ctx.font='12px "Microsoft YaHei",sans-serif';ctx.fillStyle='#9fb4cc';
  ctx.fillText(bc>0?('共 '+bc+' 个分子'):'',(LEFT.x0+LEFT.x1)/2,LEFT.y1+30);
  ctx.fillText(ac>0?('共 '+ac+' 个分子'):'—',(RIGHT.x0+RIGHT.x1)/2,RIGHT.y1+30);

  ctx.strokeStyle='rgba(255,255,255,.18)';ctx.setLineDash([6,7]);ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(MIDX,LEFT.y0-10);ctx.lineTo(MIDX,LEFT.y1+10);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=(stage&&stage.mode==='fail')?'#4a6076':'#cfe0ff';
  ctx.font='bold 26px sans-serif';ctx.fillText('→',MIDX,(LEFT.y0+LEFT.y1)/2+8);
  ctx.fillStyle='#f6c560';ctx.font='12px "Microsoft YaHei",sans-serif';
  ctx.fillText(arrowCond||'—',MIDX,LEFT.y1+30);

  if(!stage||stage.anim.length===0){
    ctx.fillStyle='#5f7694';ctx.font='14px "Microsoft YaHei",sans-serif';
    ctx.fillText('请选择反应物，然后点「测试反应」',(LEFT.x0+LEFT.x1)/2,(LEFT.y0+LEFT.y1)/2);
    return;
  }

  if(stage.mode==='fail'){drawFailStage();return;}

  const both=progress>=0.995,bondColor='rgba(185,205,228,.6)';
  const AMP=Math.max(1.1,Math.min(2.2,stage.atomR*0.13));
  if(progress<=0.14||both){
    stage.startBonds.forEach(b=>{const a=stage.anim[b.a],c=stage.anim[b.b];
      const o1=joff(b.a,AMP),o2=joff(b.b,AMP);
      strokeBond(a.sx+o1[0],a.sy+o1[1],c.sx+o2[0],c.sy+o2[1],b.order,bondColor);});
  }
  if(progress>=0.86){
    const off=stage.rAtoms.length;
    stage.endBonds.forEach(b=>{const a=stage.pAtoms[b.a],c=stage.pAtoms[b.b];
      const o1=joff(off+b.a,AMP),o2=joff(off+b.b,AMP);
      strokeBond(a.x+o1[0],a.y+o1[1],c.x+o2[0],c.y+o2[1],b.order,bondColor);});
  }
  if(both){
    const off=stage.rAtoms.length;
    stage.rAtoms.forEach((a,i)=>{const o=joff(i,AMP);drawAtom(a.el,a.x+o[0],a.y+o[1],stage.atomR);});
    stage.pAtoms.forEach((a,i)=>{const o=joff(off+i,AMP);drawAtom(a.el,a.x+o[0],a.y+o[1],stage.atomR);});
  }else{
    const p=easeInOut(progress);
    stage.anim.forEach((a,i)=>{
      const o=joff(i,AMP);
      drawAtom(a.el,a.sx+(a.ex-a.sx)*p+o[0],a.sy+(a.ey-a.sy)*p+o[1],stage.atomR);
    });
  }
}

/* 失败演示：分子靠近 → 受阻 → 退回 */
function drawFailStage(){
  const pr=progress,atomR=stage.atomR,bondColor='rgba(185,205,228,.55)';
  const AMP=Math.max(1.1,Math.min(2.2,atomR*0.13));
  let t,shake=0;
  if(pr<0.40)t=easeInOut(pr/0.40);
  else if(pr<0.66){t=1;shake=Math.sin((pr-0.40)*Math.PI*2*7)*1.6;}
  else t=Math.max(0,1-easeInOut((pr-0.66)/0.34));
  const px=a=>a.sx+(a.ex-a.sx)*t, py=a=>a.sy+(a.ey-a.sy)*t;

  // 靠近时的碰撞波纹
  if(pr>0.32&&pr<0.74){
    const k=(pr-0.32)/0.42;
    ctx.save();ctx.globalAlpha=0.3*(1-k);ctx.strokeStyle='#7fa8dd';ctx.lineWidth=2;
    stage.mols.forEach(m=>{
      const dx=(MIDX-m.cx)*0.62*t;
      ctx.beginPath();ctx.arc(m.cx+dx,m.cy,24+k*30,0,Math.PI*2);ctx.stroke();
    });
    ctx.restore();
  }

  // 化学键（分子整体平移，键随之移动，始终不断裂）
  stage.startBonds.forEach(b=>{
    const a=stage.anim[b.a],c=stage.anim[b.b];
    const o1=joff(b.a,AMP),o2=joff(b.b,AMP);
    strokeBond(px(a)+shake+o1[0],py(a)+o1[1],px(c)+shake+o2[0],py(c)+o2[1],b.order,bondColor);
  });
  stage.anim.forEach((a,i)=>{const o=joff(i,AMP);
    drawAtom(a.el,px(a)+shake+o[0],py(a)+o[1],atomR);});

  const al=Math.min(1,(pr-0.42)/0.10)*Math.min(1,(0.96-pr)/0.10);
  // 原因①：条件不足 —— 灰色闪电被划掉（能量/条件不够）
  if(stage.failKind==='condition'&&al>0){
    ctx.save();ctx.globalAlpha=al*0.95;ctx.translate(MIDX,256);
    ctx.beginPath();
    ctx.moveTo(9,-36);ctx.lineTo(-14,3);ctx.lineTo(-1,3);ctx.lineTo(-9,36);ctx.lineTo(15,-5);ctx.lineTo(2,-5);
    ctx.closePath();ctx.fillStyle='rgba(150,168,188,.9)';ctx.fill();
    ctx.strokeStyle='rgba(226,74,74,.92)';ctx.lineWidth=5;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-26,28);ctx.lineTo(26,-28);ctx.stroke();
    ctx.restore();
  }
  // 原因②：分子数不足 —— 多余分子被虚线圈住并标“？”
  if(stage.failKind==='amount'&&al>0){
    ctx.save();ctx.globalAlpha=al;
    ctx.setLineDash([6,5]);ctx.strokeStyle='rgba(246,197,96,.95)';ctx.lineWidth=2;
    stage.lone.forEach(idx=>{
      const m=stage.mols[idx],dx=(MIDX-m.cx)*0.62*t;
      ctx.beginPath();ctx.arc(m.cx+dx,m.cy,32,0,Math.PI*2);ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(246,197,96,1)';ctx.font='bold 20px "Microsoft YaHei",sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    stage.lone.forEach(idx=>{
      const m=stage.mols[idx],dx=(MIDX-m.cx)*0.62*t;
      ctx.fillText('?',m.cx+dx,m.cy-40);
    });
    ctx.restore();
  }
  // 原因③：物质本身不反应 —— 碰撞后直接弹开（淡灰叉号）
  if(stage.failKind==='noreact'&&al>0){
    ctx.save();ctx.globalAlpha=al*0.7;ctx.strokeStyle='rgba(150,170,190,.95)';
    ctx.lineWidth=5;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(MIDX-16,238);ctx.lineTo(MIDX+16,274);
    ctx.moveTo(MIDX+16,238);ctx.lineTo(MIDX-16,274);ctx.stroke();
    ctx.restore();
  }
}

/* ================= UI ================= */
const selected=new Map();
let conds=new Set(['常温']);
const $=id=>document.getElementById(id);

function condText(set){
  if(!set||set.size===0)return '常温';
  return CONDS.filter(c=>set.has(c.k)).map(c=>c.t).join(' + ');
}
function renderConds(){
  const box=$('condChips');box.innerHTML='';
  CONDS.forEach(c=>{
    const b=document.createElement('span');
    b.className='cchip'+(conds.has(c.k)?' on':'');
    b.title=c.tip;
    b.textContent=c.t;
    b.onclick=()=>{
      if(c.k==='常温'){
        conds=new Set(['常温']);
      }else{
        conds.delete('常温');
        if(conds.has(c.k))conds.delete(c.k);else conds.add(c.k);
        if(conds.size===0)conds=new Set(['常温']);
      }
      renderConds();
      onSelChange();   // 条件改变后需要重新测试
    };
    box.appendChild(b);
  });
}

function fmtFormula(f){return f.replace(/(\d+)/g,'<sub>$1</sub>');}
function flash(msg){
  const f=$('flash');f.textContent=msg;f.classList.add('show');
  clearTimeout(f._t);f._t=setTimeout(()=>f.classList.remove('show'),1600);
}

/* 反应物排列顺序：单质（气体→固体非金属→金属按活动性）→化合物（氧化物→氨气→酸→碱→盐→有机物），不分组标签 */
const SP_GROUPS=[
  {label:'单质 · 气体',ids:['O2','H2','N2']},
  {label:'单质 · 固体非金属',ids:['C','S','P']},
  {label:'单质 · 金属（活动性由强到弱）',ids:['Mg','Al','Zn','Fe','Cu','Hg']},
  {label:'氧化物',ids:['H2O','H2O2','CO2','CO','SO2','SO3','CaO','CuO','Fe2O3']},
  {label:'其他气体化合物',ids:['NH3']},
  {label:'酸',ids:['HCl','H2SO4','HCOOH']},
  {label:'碱',ids:['NaOH','Ca(OH)2','Mg(OH)2','Al(OH)3','Fe(OH)3']},
  {label:'盐',ids:['NaCl','Na2CO3','NaHCO3','CaCO3','BaCO3','BaCl2','BaSO4','MgCl2','CuSO4','AgNO3','KMnO4','KClO3']},
  {label:'有机化合物',ids:['CH4','C2H5OH']}
];
function renderSpecies(){
  const box=$('spScroll');box.innerHTML='';
  const grid=document.createElement('div');grid.className='sp-grid';
  SP_GROUPS.forEach(gr=>{
    gr.ids.map(id=>SP[id]).filter(s=>s&&s.pick).forEach(sp=>{
      const d=document.createElement('div');
      d.className='sp'+(selected.has(sp.id)?' on':'');
      d.innerHTML='<div class="fm">'+fmtFormula(sp.formula)+'</div><div class="nm">'+sp.name+'</div><div class="tag">✓</div>';
      d.onclick=()=>toggle(sp.id);
      grid.appendChild(d);
    });
  });
  box.appendChild(grid);
}
function toggle(id){
  if(selected.has(id))selected.delete(id);
  else{
    if(selected.size>=3){flash('最多选择 3 种反应物');return;}
    selected.set(id,1);
  }
  onSelChange();
}
function renderSelected(){
  const box=$('selList');box.innerHTML='';
  if(selected.size===0){box.innerHTML='<span class="sel-empty">尚未选择反应物</span>';}
  selected.forEach((cnt,id)=>{
    const sp=SP[id];
    const el=document.createElement('div');el.className='sel';
    el.title=sp.name;
    el.innerHTML='<b class="sf">'+fmtFormula(sp.formula)+'</b><span class="sn">'+sp.name+'</span>'+
      '<span class="stepper"><button data-a="m" '+(cnt<=1?'disabled':'')+'>−</button>'+
      '<span class="v">'+cnt+'</span><button data-a="p" '+(cnt>=6?'disabled':'')+'>+</button></span>'+
      '<span class="del">×</span>';
    el.querySelector('[data-a=m]').onclick=()=>{if(cnt>1){selected.set(id,cnt-1);onSelChange();}};
    el.querySelector('[data-a=p]').onclick=()=>{if(cnt<6){selected.set(id,cnt+1);onSelChange();}};
    el.querySelector('.del').onclick=()=>{selected.delete(id);onSelChange();};
    box.appendChild(el);
  });
  $('testBtn').disabled=selected.size===0;
  const total=[...selected.values()].reduce((a,b)=>a+b,0);
  $('countHint').textContent=selected.size?('已选 '+selected.size+' 种，共 '+total+' 个分子'):'';
}

const FB_DEFAULT={t:'选择物质与反应条件，点「测试反应」',s:'这里会给出判定结论：能否反应、是否恰好完全反应'};
function setFbEmpty(t,s){
  const e=$('fbEmpty');if(!e)return;
  e.querySelector('.t').textContent=t;e.querySelector('.s').textContent=s;
}
/* 三态按钮：播放中 → 「暂停」；暂停中 → 「播放」；播完 → 「重播」 */
function syncPlayBtn(){
  const b=$('replay');if(!b)return;
  if(!current||!stage||stage.anim.length===0){
    b.disabled=true;b.textContent='▶ 播放';b.title='先选择反应物并测试';return;
  }
  b.disabled=false;
  if(playing){b.textContent='⏸ 暂停';b.title='暂停演示，便于讲解';}
  else if(progress>=0.995){b.textContent='↺ 重播';b.title='从反应物开始重新演示';}
  else{b.textContent='▶ 播放';b.title='继续演示';}
}
function clearResultUI(){
  resultReady=false;
  $('verdict').className='verdict';
  $('quiz').className='quiz';
  $('judge').className='judge';
  syncPlayBtn();
  $('eq').textContent='—';$('macro').textContent='—';$('micro').textContent='—';
  setFbEmpty('⚛','正在演示微观变化…','先观察分子如何接近、碰撞，再看它们有没有重新组合');
}
function onAnimEnd(){
  if(!current)return;
  resultReady=true;
  setFbEmpty(FB_DEFAULT.t,FB_DEFAULT.s);
  if(current.ok)showSuccess(current);else showFail(current);
  renderLedger();updatePhase();syncPlayBtn();draw();
}

function onSelChange(){
  current=null;arrowCond='—';resultReady=false;
  beforeList=[...selected.entries()].map(([id,c])=>({id,count:c}));
  afterList=[];
  stage=buildStage(beforeList,afterList);
  progress=0;playing=false;
  $('verdict').className='verdict';
  $('quiz').className='quiz';
  $('judge').className='judge';
  syncPlayBtn();
  $('eq').textContent='—';$('macro').textContent='—';$('micro').textContent='—';
  setFbEmpty(FB_DEFAULT.t,FB_DEFAULT.s);
  renderSpecies();renderSelected();renderLegend();renderLedger();updatePhase();draw();
}

function renderLegend(){
  const set=new Set();
  beforeList.forEach(g=>Object.keys(SP[g.id].counts).forEach(e=>set.add(e)));
  afterList.forEach(g=>Object.keys(SP[g.id].counts).forEach(e=>set.add(e)));
  const box=$('legend');box.innerHTML='';
  [...set].forEach(el=>{
    const e=EL[el];if(!e)return;
    const k=Math.round(11*(ATOM_R[el]||.85));
    const s=document.createElement('span');
    s.innerHTML='<i class="dot" style="background:'+e.color+';border-color:'+(e.stroke||'#fff')+
      ';width:'+k+'px;height:'+k+'px"></i>'+el+' 原子';
    box.appendChild(s);
  });
}

/* 常温为气体的物质（用于 ↑ 判断）与溶液中生成的沉淀（用于 ↓ 判断） */
const GAS_SET={H2:1,O2:1,CO2:1,CO:1,N2:1,SO2:1,NH3:1};
const PPT_SET={'CaCO3':1,'Cu(OH)2':1,'Fe(OH)3':1,'Al(OH)3':1,'CaSO3':1,'BaSO4':1,'Mg(OH)2':1};
function eqHTML(rxn){
  const hasGas=rxn.reactants.some(x=>GAS_SET[x.s]);
  const side=(arr,isProd)=>arr.map(x=>{
    let s=(x.k===1?'':'<b>'+x.k+'</b>')+fmtFormula(SP[x.s].formula);
    if(isProd){
      if(GAS_SET[x.s]&&!hasGas)s+='<sup>↑</sup>';
      else if(PPT_SET[x.s]&&rxn.type==='复分解')s+='<sup>↓</sup>';
    }
    return s;
  }).join(' + ');
  const mid=rxn.cond
    ?'<span class="eq-cond"><i>'+rxn.cond+'</i><b>＝</b></span>'
    :'<span class="eq-eq">＝</span>';
  return side(rxn.reactants,false)+mid+side(rxn.products,true);
}

function showSuccess(res){
  const ct=condText(conds);
  const v=$('verdict');v.className='verdict show '+(res.exact?'good':'warn');
  $('vt').textContent=res.exact?'✅ 能反应 · 恰好完全反应':'✅ 能反应（有剩余反应物）';
  const prodText=res.rxn.products.map(p=>{
    const n=res.k*p.k;return n+' 个 '+SP[p.s].name;
  }).join('、');
  let body='在「'+ct+'」条件下生成 '+prodText+'。';
  if(!res.exact){
    const left=Object.keys(res.leftover).map(id=>res.leftover[id]+' 个 '+SP[id].name).join('、');
    body+=' 剩余 '+left+' 没有参加反应。';
  }
  body+=' 原子的种类、数目和质量都没有改变。';
  $('vb').textContent=body;
  $('chips').innerHTML=
    '<span class="chip g">条件：'+ct+'</span>'+
    '<span class="chip y">能反应 ✓</span>'+
    '<span class="chip y">配平 ✓</span>'+
    '<span class="chip '+(res.exact?'y':'m')+'">'+(res.exact?'恰好':'有剩余')+'</span>'+
    '<span class="chip y">质量守恒 ✓</span>';
  $('quiz').className='quiz';
  syncPlayBtn();
  $('eq').innerHTML=eqHTML(res.rxn);
  $('macro').textContent=(res.rxn.phen||'有新物质生成。')+(res.exact?'':' 本组反应物中有物质过量，未完全消耗。');
  renderMicro(res);
}
function renderMicro(res){
  const b=elCounts(res.before),a=elCounts(res.after);
  const bTxt=Object.keys(b).map(e=>e+' '+b[e]+' 个').join('、');
  const prod=res.rxn.products.map(p=>res.k*p.k+' 个 '+SP[p.s].name).join('、');
  $('micro').textContent='反应前共有 '+bTxt+'原子。化学键断裂后，这些原子重新组合成 '+prod+
    '。反应后原子种类、数目、质量都不变——这就是质量守恒的微观原因。';
}

function showFail(res){
  const v=$('verdict');v.className='verdict show bad';
  const ct=condText(conds);
  // 委婉反馈：不直接说出原因，把判断权交给学生
  $('vt').textContent='🤔 没有观察到新物质生成';
  $('vb').textContent=res.reasons.includes('condition')
    ? '在「'+ct+'」条件下，这组物质之间没有发生反应。请判断：原因是什么？（可能不止一个，也可以换个条件或分子数再测）'
    : '这组物质混合后，没有发生化学反应。请判断：它们为什么不能反应？（可能不止一个原因）';
  $('eq').textContent='—';
  $('macro').textContent='没有观察到明显现象，没有新物质生成。';
  $('micro').textContent='没有发生化学反应时，原子本身也没有改变——这同样说明原子是化学变化中的最小微粒。';
  $('chips').innerHTML='<span class="chip n">不能反应</span><span class="chip g">条件：'+ct+'</span>';
  $('quiz').className='quiz show';
  renderQuiz();
  syncPlayBtn();
}
function renderQuiz(){
  const box=$('opts');box.innerHTML='';
  // 正确原因可能有多个（如：条件不具备 + 分子数不足），随机选项中全部包含
  const correctKeys=current.reasons||[current.reason];
  const wrongs=REASONS.filter(r=>!correctKeys.includes(r.k))
    .map(r=>({r,ord:Math.random()})).sort((a,b)=>a.ord-b.ord);
  const nWrong=Math.max(0,4-correctKeys.length);
  const chosen=wrongs.slice(0,nWrong).map(x=>x.r);
  const corr=correctKeys.map(k=>REASONS.find(r=>r.k===k));
  const opts=chosen.concat(corr)
    .map(r=>({r,ord:Math.random()})).sort((a,b)=>a.ord-b.ord).map(x=>x.r);
  opts.forEach(r=>{
    const lab=document.createElement('label');lab.className='opt';
    lab.innerHTML='<input type="checkbox" name="reason" value="'+r.k+'"><span>'+r.t+'</span>';
    box.appendChild(lab);
  });
  $('judge').className='judge';$('judge').textContent='';
}

function renderLedger(){
  if(!resultReady){
    $('cvTable').innerHTML='<tr><th>元素</th><th>反应前原子数</th><th>反应后原子数</th><th>是否相等</th><th>相对原子质量</th><th>反应前质量</th><th>反应后质量</th></tr>'+
      '<tr><td colspan="7" style="color:#98a7b8">'+(playing?'微观变化演示中…':'先选择反应物并点击「测试反应」')+'</td></tr>';
    $('total').innerHTML='';
    return;
  }
  const before=current&&current.before?current.before:beforeList;
  const after=(current&&current.ok)?current.after:null;
  const b=elCounts(before);
  const a=after?elCounts(after):null;
  const order=['C','H','O','N','P','S','Cl','Na','Mg','Al','K','Ca','Ba','Mn','Fe','Cu','Zn','Ag','Hg'];
  const els=order.filter(e=>b[e]||(a&&a[e]));
  let html='<tr><th>元素</th><th>反应前原子数</th><th>反应后原子数</th><th>是否相等</th><th>相对原子质量</th><th>反应前质量</th><th>反应后质量</th></tr>';
  let tB=0,tA=0,okAll=true;
  els.forEach(el=>{
    const bef=b[el]||0,aft=a?(a[el]||0):null;
    const m=EL[el].mass;tB+=bef*m;
    if(aft!==null){
      if(aft!==bef)okAll=false;tA+=aft*m;
      html+='<tr><td class="el">'+el+'</td><td>'+bef+'</td><td>'+aft+'</td>'+
        '<td><span class="pill ok">'+(aft===bef?'相等 ✓':'不等 ✗')+'</span></td>'+
        '<td>'+m+'</td><td>'+(bef*m)+'</td><td>'+(aft*m)+'</td></tr>';
    }else{
      html+='<tr><td class="el">'+el+'</td><td>'+bef+'</td><td>—</td>'+
        '<td><span class="pill" style="background:#eef2f8;color:#5b6b7b">未反应</span></td>'+
        '<td>'+m+'</td><td>'+(bef*m)+'</td><td>—</td></tr>';
    }
  });
  $('cvTable').innerHTML=html;
  if(after){
    $('total').innerHTML='反应前总质量 = <b>'+tB+'</b> &nbsp;=&nbsp; 反应后总质量 = <b>'+tA+'</b> &nbsp;→&nbsp; '+
      (okAll?'<b>质量守恒成立 ✔</b>':'<b style="color:#c62828">请检查配平</b>');
  }else{
    $('total').innerHTML='反应前总质量 = <b>'+tB+'</b> &nbsp;·&nbsp; <span style="color:#5b6b7b">未发生反应，原子未改变</span>';
  }
}

function updatePhase(){
  let t='';
  if(!stage||stage.anim.length===0)t='先选择反应物，再点「测试反应」';
  else if(!current)t='已选好物质，点「⚗ 测试反应」开始演示';
  else if(playing){
    if(stage.mode==='fail'){
      if(progress<0.16)t='① 反应物分子保持原状';
      else if(progress<0.42)t='② 分子相互接近，发生碰撞';
      else if(progress<0.70)t='③ 碰撞后原子没有重新组合';
      else t='④ 分子重新分开，没有新物质生成';
    }else{
      if(progress<0.14)t='① 反应物分子保持原状';
      else if(progress<0.5)t='② 化学键断裂，原子获得自由';
      else if(progress<0.86)t='③ 原子重新组合成新分子';
      else t='④ 生成新物质，原子总数不变 ✔';
    }
  }else if(progress>=0.995){
    t=(current&&!current.ok)
      ? '没有新物质生成，原子仍是原来的样子——请判断原因'
      : '对比视图：两边原子种类、数目、质量都相同 → 质量守恒 ✔（微粒仍在不停地运动）';
  }
  else if(progress>0)t='⏸ 已暂停——点「▶ 播放」继续观察，点「↺ 重播」重新演示';
  else t='点「▶ 播放」观看原子重新组合的过程';
  $('phase').textContent=t;
}

/* ---------- 事件 ---------- */
$('testBtn').onclick=()=>{
  const sel=[...selected.entries()].map(([id,c])=>({id,count:c}));
  if(!sel.length)return;
  const res=solveTest(sel,conds);current=res;
  // 先演示微观变化，播完才给结论
  clearResultUI();
  if(res.ok){
    beforeList=res.before;afterList=res.after;arrowCond=res.rxn.cond||'反应';
    stage=buildStage(beforeList,afterList);
  }else{
    beforeList=sel;afterList=[];arrowCond=res.rxn?(res.rxn.cond||'反应'):'—';
    stage=buildFailStage(sel,res);
  }
  renderLegend();renderLedger();
  progress=0;playing=true;updatePhase();syncPlayBtn();draw();
};
$('clearBtn').onclick=()=>{selected.clear();onSelChange();};
$('replay').onclick=()=>{
  if(!current||!stage||stage.anim.length===0)return;
  if(playing){                 // 演示中 → 暂停（停在当前帧，便于讲解）
    playing=false;updatePhase();syncPlayBtn();draw();return;
  }
  if(progress>=0.995){         // 已播完 → 重播（回到反应物，重新演示）
    clearResultUI();
    stage=current.ok?buildStage(beforeList,afterList):buildFailStage(beforeList,current);
    progress=0;
  }
  playing=true;updatePhase();syncPlayBtn();draw();
};
$('submitReason').onclick=()=>{
  const boxes=[...document.querySelectorAll('input[name=reason]:checked')];
  if(!boxes.length){flash('请先勾选原因（可多选）');return;}
  const j=$('judge');
  const picked=boxes.map(b=>b.value).sort();
  const correct=[...(current.reasons||[current.reason])].sort();
  const same=picked.length===correct.length&&picked.every((v,i)=>v===correct[i]);
  if(same){
    j.className='judge show right';
    let extra='';
    if(current.reasons.includes('condition')&&current.rxn){
      extra+='<br>该反应需要的条件是：<b>'+(current.rxn.cond||'常温')+'</b>。';
    }
    if(current.reasons.includes('amount')&&current.rxn){
      extra+='<br>按化学计量比，至少需要 '+current.rxn.reactants.map(r=>r.k+' 个 '+SP[r.s].name).join(' + ')+'。';
    }
    const exp=[...new Set(current.reasons)].map(k=>EXPLAIN[k]).join('<br>');
    j.innerHTML='✅ 回答正确！<br>'+exp+extra;
  }else{
    // 委婉反馈，不揭示正确答案，鼓励继续判断
    j.className='judge show wrong';
    j.innerHTML='🤔 嗯…勾选的原因还不太完整或不准确。别急，调整勾选后再提交一次试试。';
  }
};
/* 速度三档：慢 / 中 / 快 */
document.querySelectorAll('.spd').forEach(b=>b.onclick=()=>{
  speed=parseFloat(b.dataset.v);
  document.querySelectorAll('.spd').forEach(x=>x.classList.toggle('on',x===b));
});
$('showLabel').onchange=e=>{showLabel=e.target.checked;draw();};

function loop(ts){
  if(!lastTs)lastTs=ts;
  const dt=(ts-lastTs)/1000;lastTs=ts;
  thermoT+=dt;
  if(playing){
    progress+=speed*dt;
    if(progress>=1){progress=1;playing=false;onAnimEnd();}
    updatePhase();
  }
  draw();   // 每帧重绘：即使静止对比，微粒也在持续做热运动
  requestAnimationFrame(loop);
}

/* ---------- 启动 ---------- */
fitCanvas();
renderSpecies();
renderSelected();
renderConds();
renderLegend();
renderLedger();
updatePhase();
draw();
window.addEventListener('resize',()=>{fitCanvas();draw();});
requestAnimationFrame(loop);
