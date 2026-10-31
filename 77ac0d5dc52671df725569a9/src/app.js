import {openStore} from "./store.js";
document.head.insertAdjacentHTML("beforeend", "<style>\n  :root{\n    --bg1:#faf5ec; --bg2:#f2ead9;\n    --body:#fdf3e3; --shade:#efdcc0; --blush:#f3b3a4; --accent:#d9a05e; --leaf:#a8c686;\n    --ink:#5b4a42; --ink-soft:#8a756a;\n    --card:#fffdf8; --line:#eadfc9;\n    --shadow:0 10px 30px rgba(120,95,60,.14);\n  }\n  *{margin:0;padding:0;box-sizing:border-box;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;}\n  html,body{height:100%;overflow:hidden;}\n  body{\n    font-family:\"PingFang SC\",\"Microsoft YaHei\",\"Source Han Sans SC\",system-ui,sans-serif;\n    background:linear-gradient(160deg,var(--bg1),var(--bg2));\n    color:var(--ink);\n    transition:background .6s;\n    -webkit-touch-callout:none;\n  }\n  /* 桌面点缀 */\n  .dot{position:fixed;border-radius:50%;background:rgba(160,130,90,.08);}\n  .dot.d1{width:10px;height:10px;left:12%;top:18%;}\n  .dot.d2{width:6px;height:6px;left:24%;top:62%;}\n  .dot.d3{width:8px;height:8px;left:78%;top:24%;}\n  .dot.d4{width:5px;height:5px;left:60%;top:78%;}\n\n  /* ===== 桌宠本体 ===== */\n  #pet-wrap{\n    position:fixed;left:0;top:0;width:170px;\n    display:flex;flex-direction:column;align-items:center;\n    cursor:grab;touch-action:none;z-index:10;\n  }\n  #pet-wrap.dragging{cursor:grabbing;}\n  #pet-stage{position:relative;width:170px;height:180px;}\n  #pet{width:170px;height:170px;display:block;filter:drop-shadow(0 8px 14px rgba(120,95,60,.18));}\n  #pet-all{transform-box:fill-box;transform-origin:50% 92%;}\n  #pet-soft{transform-box:fill-box;transform-origin:50% 92%;animation:breathe 4.2s ease-in-out infinite;}\n  @keyframes breathe{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.028) translateY(-3px)}}\n  .eye{transform-box:fill-box;transform-origin:center;animation:blink 5.2s infinite;}\n  .eye.e2{animation-duration:6.8s;animation-delay:-2.1s;}\n  @keyframes blink{0%,93%,100%{transform:scaleY(1)}95.5%{transform:scaleY(.08)}}\n  #tail{transform-box:fill-box;transform-origin:8% 85%;animation:sway 3.4s ease-in-out infinite;}\n  @keyframes sway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(7deg)}}\n  .ear{transform-box:fill-box;transform-origin:50% 100%;animation:twitch 8s infinite;}\n  .ear.er{animation-delay:-3.7s;}\n  @keyframes twitch{0%,86%,100%{transform:rotate(0)}90%{transform:rotate(-7deg)}94%{transform:rotate(4deg)}}\n  /* 心情 */\n  .mood-happy .eye{animation:none;transform:scaleY(.38);}\n  .mood-happy #blush-l,.mood-happy #blush-r{opacity:1;}\n  .mood-sleep .eye{animation:none;transform:scaleY(.1);}\n  #blush-l,#blush-r{opacity:.72;transition:opacity .3s;}\n  /* 被摸头 */\n  #pet-wrap.pat #pet-all{animation:hop .55s cubic-bezier(.3,1.6,.4,1);}\n  @keyframes hop{0%{transform:translateY(0) scale(1)}35%{transform:translateY(-16px) scale(1.04,.96)}70%{transform:translateY(0) scale(.96,1.05)}100%{transform:translateY(0) scale(1)}}\n  /* 心心 */\n  .heart{position:absolute;font-size:16px;pointer-events:none;animation:heartUp 1.2s ease-out forwards;opacity:.9;}\n  @keyframes heartUp{0%{transform:translateY(0) scale(.6);opacity:0}20%{opacity:1}100%{transform:translateY(-70px) scale(1.15);opacity:0}}\n  /* 睡着 zzz */\n  #zzz{position:absolute;right:8px;top:14px;display:none;pointer-events:none;}\n  #zzz span{position:absolute;font-size:13px;color:var(--ink-soft);animation:zfloat 2.6s ease-in-out infinite;}\n  #zzz span:nth-child(2){animation-delay:.9s;font-size:16px;right:10px;}\n  #zzz span:nth-child(3){animation-delay:1.8s;font-size:19px;right:22px;}\n  .mood-sleep #zzz{display:block;}\n  @keyframes zfloat{0%{transform:translate(0,6px);opacity:0}30%{opacity:.85}100%{transform:translate(10px,-18px);opacity:0}}\n\n  /* ===== 气泡 ===== */\n  #bubble{\n    position:absolute;left:50%;bottom:100%;transform:translate(-50%,-8px) scale(.9);\n    width:236px;background:var(--card);border:1px solid var(--line);border-radius:14px;\n    padding:10px 13px;font-size:13px;line-height:1.55;color:var(--ink);\n    box-shadow:var(--shadow);opacity:0;pointer-events:none;\n    transition:opacity .35s,transform .35s;transform-origin:50% 100%;\n  }\n  #bubble.show{opacity:1;transform:translate(-50%,-14px) scale(1);}\n  #bubble::after{\n    content:\"\";position:absolute;left:50%;bottom:-6px;width:11px;height:11px;\n    background:var(--card);border-right:1px solid var(--line);border-bottom:1px solid var(--line);\n    transform:translateX(-50%) rotate(45deg);border-radius:0 0 3px 0;\n  }\n  #bubble .b-act{margin-top:8px;display:flex;gap:8px;}\n  #bubble .b-act button{\n    flex:1;border:1px solid var(--line);background:#fff;border-radius:9px;\n    padding:5px 0;font-size:12px;color:var(--ink-soft);cursor:pointer;font-family:inherit;\n  }\n  #bubble .b-act button:hover{border-color:var(--accent);color:var(--accent);}\n\n  /* 名牌 */\n  #name-tag{\n    position:absolute;left:50%;bottom:-4px;transform:translateX(-50%);\n    font-size:11px;color:var(--ink-soft);letter-spacing:2px;\n    opacity:0;transition:opacity .3s;white-space:nowrap;\n  }\n  #pet-wrap:hover #name-tag{opacity:.85;}\n\n  /* ===== 悬浮小按钮 ===== */\n  #dock{\n    position:absolute;left:50%;bottom:-16px;transform:translateX(-50%);\n    display:flex;gap:7px;padding:6px 8px;background:var(--card);\n    border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow);\n    opacity:.55;transition:opacity .25s;\n  }\n  #pet-wrap:hover #dock{opacity:1;}\n  #dock button{\n    position:relative;width:30px;height:30px;border:none;border-radius:9px;background:transparent;\n    cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink-soft);\n  }\n  #dock button:hover{background:rgba(217,160,94,.14);color:var(--accent);}\n  #dock button.on{color:var(--accent);background:rgba(217,160,94,.16);}\n  #dock svg{width:16px;height:16px;}\n  #dRem .badge{\n    position:absolute;top:1px;right:0;min-width:14px;height:14px;border-radius:7px;\n    background:#e8836f;color:#fff;font-size:9px;line-height:14px;padding:0 3px;display:none;\n  }\n  #dRem .badge.show{display:block;}\n\n  /* 收起后的叶子钮 */\n  #leaf-btn{\n    position:fixed;right:26px;bottom:calc(26px + env(safe-area-inset-bottom));width:48px;height:48px;border-radius:50%;\n    border:1px solid var(--line);background:var(--card);box-shadow:var(--shadow);\n    display:none;align-items:center;justify-content:center;cursor:pointer;z-index:10;\n  }\n  #leaf-btn.show{display:flex;}\n  #leaf-btn svg{width:22px;height:22px;color:var(--leaf);}\n\n  /* ===== 面板通用（默认桌面右侧浮窗） ===== */\n  .panel{\n    position:fixed;right:26px;bottom:86px;width:308px;max-height:72vh;\n    background:var(--card);border:1px solid var(--line);border-radius:16px;\n    box-shadow:var(--shadow);z-index:20;display:none;flex-direction:column;overflow:hidden;\n  }\n  .panel.show{display:flex;animation:panelIn .28s cubic-bezier(.3,1.2,.4,1);}\n  @keyframes panelIn{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}\n  .p-head{\n    display:flex;align-items:center;gap:8px;padding:12px 14px 10px;\n    border-bottom:1px solid var(--line);font-size:14px;font-weight:600;\n  }\n  .p-head .count{\n    font-size:11px;font-weight:400;color:var(--accent);\n    background:rgba(217,160,94,.13);border-radius:8px;padding:2px 8px;\n  }\n  .p-head .sp{flex:1;}\n  .p-close{\n    border:none;background:transparent;font-size:13px;color:var(--ink-soft);\n    cursor:pointer;padding:2px 6px;border-radius:6px;font-family:inherit;\n  }\n  .p-close:hover{background:#f5eee0;color:var(--ink);}\n  .p-body{padding:12px 14px;overflow-y:auto;}\n  .p-foot{\n    display:flex;align-items:center;gap:8px;padding:10px 14px;flex-wrap:wrap;\n    border-top:1px solid var(--line);font-size:11px;color:var(--ink-soft);\n  }\n  .p-foot .sp{flex:1;}\n  .tbtn{\n    border:1px solid var(--line);background:#fff;border-radius:9px;padding:5px 11px;\n    font-size:12px;color:var(--ink-soft);cursor:pointer;font-family:inherit;\n  }\n  .tbtn:hover{border-color:var(--accent);color:var(--accent);}\n  .tbtn.primary{background:var(--accent);color:#fff;border-color:var(--accent);}\n  .tbtn.primary:hover{filter:brightness(1.06);color:#fff;}\n\n  /* 提醒面板 */\n  .p-add{display:flex;flex-direction:column;gap:8px;margin-bottom:12px;}\n  .p-add input,.p-add select{\n    border:1px solid var(--line);border-radius:9px;padding:7px 10px;font-size:13px;\n    font-family:inherit;color:var(--ink);background:#fff;outline:none;width:100%;\n  }\n  .p-add input:focus,.p-add select:focus{border-color:var(--accent);}\n  .p-add .row{display:flex;gap:8px;}\n  .p-add .row select{flex:1;}\n  #remAdd{\n    border:none;background:var(--accent);color:#fff;border-radius:9px;\n    padding:8px 0;font-size:13px;cursor:pointer;font-family:inherit;letter-spacing:2px;\n  }\n  #remAdd:hover{filter:brightness(1.06);}\n  .rem{\n    display:flex;align-items:flex-start;gap:9px;padding:9px 10px;border-radius:11px;\n    border:1px solid transparent;\n  }\n  .rem + .rem{margin-top:2px;}\n  .rem:hover{background:#faf5ea;border-color:var(--line);}\n  .rem .dotc{width:7px;height:7px;border-radius:50%;background:var(--accent);margin-top:6px;flex:none;}\n  .rem.soon .dotc{background:#e8836f;}\n  .rem .rmain{flex:1;min-width:0;}\n  .rem .rtext{font-size:13px;line-height:1.45;word-break:break-all;}\n  .rem .rmeta{display:flex;flex-wrap:wrap;gap:6px;margin-top:3px;font-size:11px;color:var(--ink-soft);}\n  .rem .badge2{\n    background:rgba(217,160,94,.14);color:var(--accent);border-radius:6px;padding:1px 6px;\n  }\n  .rem .ract{display:flex;gap:4px;flex:none;}\n  .rem .ract button{\n    width:24px;height:24px;border:1px solid var(--line);background:#fff;border-radius:7px;\n    font-size:11px;color:var(--ink-soft);cursor:pointer;line-height:1;\n  }\n  .rem .ract button:hover{border-color:var(--accent);color:var(--accent);}\n  .empty{padding:26px 0;text-align:center;font-size:12px;color:var(--ink-soft);line-height:1.8;}\n\n  /* 换肤面板 */\n  .skin-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;}\n  .skin-card{\n    border:1.5px solid var(--line);border-radius:12px;padding:9px 5px 8px;cursor:pointer;\n    display:flex;flex-direction:column;align-items:center;gap:6px;background:#fff;\n    transition:border-color .2s,transform .2s;\n  }\n  .skin-card:hover{transform:translateY(-2px);}\n  .skin-card.sel{border-color:var(--accent);background:rgba(217,160,94,.07);}\n  .skin-card span{font-size:11px;color:var(--ink-soft);}\n  .skin-card.sel span{color:var(--accent);}\n  .skin-card svg{width:46px;height:46px;}\n\n  /* 提示条 */\n  #toast{\n    position:fixed;top:calc(26px + env(safe-area-inset-top));left:50%;transform:translate(-50%,-14px);\n    background:var(--ink);color:#fdf8ef;font-size:12.5px;border-radius:10px;\n    padding:8px 16px;box-shadow:var(--shadow);opacity:0;pointer-events:none;\n    transition:opacity .3s,transform .3s;z-index:99;max-width:86vw;text-align:center;\n  }\n  #toast.show{opacity:1;transform:translate(-50%,0);}\n\n  /* ===== 移动端适配（手机优先） ===== */\n  @media (max-width:560px){\n    #pet-wrap{width:150px;}\n    #pet-stage{width:150px;height:160px;}\n    #pet{width:150px;height:150px;}\n    #name-tag{opacity:.7;}\n    #dock{opacity:1;gap:4px;padding:7px 9px;bottom:-14px;}\n    #dock button{width:38px;height:38px;}\n    #dock svg{width:19px;height:19px;}\n    #leaf-btn{right:18px;bottom:calc(18px + env(safe-area-inset-bottom));width:52px;height:52px;}\n    #bubble{width:min(240px,72vw);font-size:14px;padding:12px 14px;}\n    .panel{\n      right:0;left:0;bottom:0;width:auto;max-height:88vh;\n      border-radius:18px 18px 0 0;\n      padding-bottom:env(safe-area-inset-bottom);\n      animation:sheetIn .3s cubic-bezier(.3,1.1,.4,1);\n    }\n    @keyframes sheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}\n    .p-head{font-size:15px;padding:16px 16px 12px;}\n    .p-body{padding:14px 16px;}\n    .p-foot{padding:12px 16px calc(12px + env(safe-area-inset-bottom));}\n    .rem .rtext{font-size:14px;}\n    .skin-grid{grid-template-columns:repeat(3,1fr);gap:11px;}\n    .skin-card svg{width:54px;height:54px;}\n    .tbtn{padding:7px 13px;font-size:13px;}\n    #leaf-btn svg{width:24px;height:24px;}\n  }\n  /* 极窄屏 */\n  @media (max-width:360px){\n    .skin-grid{grid-template-columns:repeat(2,1fr);}\n  }\n</style>");
document.body.innerHTML = "\n  <div class=\"dot d1\"></div><div class=\"dot d2\"></div><div class=\"dot d3\"></div><div class=\"dot d4\"></div>\n\n  <!-- 桌宠 -->\n  <div id=\"pet-wrap\">\n    <div id=\"pet-stage\">\n      <div id=\"bubble\"></div>\n      <svg id=\"pet\" viewBox=\"0 0 200 200\">\n        <g id=\"pet-all\">\n          <ellipse cx=\"100\" cy=\"174\" rx=\"44\" ry=\"7\" fill=\"rgba(90,70,50,.12)\"/>\n          <path id=\"tail\" d=\"M164 130 C188 126 192 104 176 96\" stroke=\"var(--shade)\" stroke-width=\"9\" stroke-linecap=\"round\" fill=\"none\"/>\n          <g id=\"pet-soft\">\n            <path class=\"ear\" d=\"M62 64 C55 44 65 32 76 39 C85 44 87 54 85 64 Z\" fill=\"var(--body)\"/>\n            <path class=\"ear\" d=\"M138 64 C145 44 135 32 124 39 C115 44 113 54 115 64 Z\" fill=\"var(--body)\"/>\n            <path class=\"ear\" d=\"M66 58 C62 46 68 40 74 43 C79 46 80 52 79 58 Z\" fill=\"var(--blush)\" opacity=\".55\"/>\n            <path class=\"ear er\" d=\"M134 58 C138 46 132 40 126 43 C121 46 120 52 121 58 Z\" fill=\"var(--blush)\" opacity=\".55\"/>\n            <path d=\"M100 42 C96 30 100 20 110 16 C118 13 124 16 124 22 C124 27 118 30 112 30 C107 30 103 35 100 42 Z\" fill=\"var(--body)\"/>\n            <path d=\"M100 22 C100 14 104 8 112 6\" stroke=\"var(--leaf)\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/>\n            <ellipse cx=\"119\" cy=\"7\" rx=\"7.5\" ry=\"4\" transform=\"rotate(-28 119 7)\" fill=\"var(--leaf)\"/>\n            <circle cx=\"108\" cy=\"5\" r=\"2.4\" fill=\"var(--leaf)\"/>\n            <path d=\"M100 44 C152 44 170 86 170 116 C170 148 140 166 100 166 C60 166 30 148 30 116 C30 86 48 44 100 44 Z\" fill=\"var(--body)\"/>\n            <ellipse cx=\"72\" cy=\"82\" rx=\"17\" ry=\"11\" transform=\"rotate(-22 72 82)\" fill=\"#ffffff\" opacity=\".38\"/>\n            <ellipse cx=\"40\" cy=\"130\" rx=\"9\" ry=\"7\" transform=\"rotate(-18 40 130)\" fill=\"var(--body)\"/>\n            <ellipse cx=\"160\" cy=\"130\" rx=\"9\" ry=\"7\" transform=\"rotate(18 160 130)\" fill=\"var(--body)\"/>\n            <ellipse cx=\"78\" cy=\"163\" rx=\"11\" ry=\"7\" fill=\"var(--body)\"/>\n            <ellipse cx=\"122\" cy=\"163\" rx=\"11\" ry=\"7\" fill=\"var(--body)\"/>\n            <ellipse id=\"blush-l\" cx=\"59\" cy=\"127\" rx=\"9\" ry=\"5.5\" fill=\"var(--blush)\"/>\n            <ellipse id=\"blush-r\" cx=\"141\" cy=\"127\" rx=\"9\" ry=\"5.5\" fill=\"var(--blush)\"/>\n            <ellipse class=\"eye e1\" cx=\"76\" cy=\"110\" rx=\"5.2\" ry=\"6.8\" fill=\"var(--ink)\"/>\n            <ellipse class=\"eye e2\" cx=\"124\" cy=\"110\" rx=\"5.2\" ry=\"6.8\" fill=\"var(--ink)\"/>\n            <circle cx=\"77.6\" cy=\"107.8\" r=\"1.5\" fill=\"#fff\"/>\n            <circle cx=\"125.6\" cy=\"107.8\" r=\"1.5\" fill=\"#fff\"/>\n            <path d=\"M93 124 q3.5 4.5 7 0\" stroke=\"var(--ink)\" stroke-width=\"2\" stroke-linecap=\"round\" fill=\"none\"/>\n            <path d=\"M100 124 q3.5 4.5 7 0\" stroke=\"var(--ink)\" stroke-width=\"2\" stroke-linecap=\"round\" fill=\"none\"/>\n          </g>\n        </g>\n      </svg>\n      <div id=\"zzz\"><span>z</span><span>z</span><span>Z</span></div>\n      <div id=\"name-tag\">栖</div>\n    </div>\n    <div id=\"dock\">\n      <button id=\"dRem\" title=\"任务提醒\">\n        <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9\"/><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"/></svg>\n        <i class=\"badge\" id=\"remBadge\">0</i>\n      </button>\n      <button id=\"dSkin\" title=\"换肤\">\n        <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"13.5\" cy=\"6.5\" r=\"1.2\" fill=\"currentColor\"/><circle cx=\"17.5\" cy=\"10.5\" r=\"1.2\" fill=\"currentColor\"/><circle cx=\"8.5\" cy=\"7.5\" r=\"1.2\" fill=\"currentColor\"/><circle cx=\"6.5\" cy=\"12.5\" r=\"1.2\" fill=\"currentColor\"/><path d=\"M12 22a10 10 0 1 1 0-20c5.5 0 10 3.6 10 8 0 2.8-2.2 4-4.5 4H14a2 2 0 0 0-1.4 3.4A1.9 1.9 0 0 1 12 22z\"/></svg>\n      </button>\n      <button id=\"dDnd\" title=\"安静模式\">\n        <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z\"/></svg>\n      </button>\n      <button id=\"dHide\" title=\"收起\">\n        <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9l6 6 6-6\"/></svg>\n      </button>\n    </div>\n  </div>\n\n  <button id=\"leaf-btn\" title=\"叫醒栖\">\n    <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 7 0 6-4.5 11-10 11z\"/><path d=\"M2 21c0-3 1.9-5.7 4.5-7\"/></svg>\n  </button>\n\n  <!-- 任务提醒面板 -->\n  <div class=\"panel\" id=\"remPanel\">\n    <div class=\"p-head\">\n      <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--accent)\" stroke-width=\"2\" stroke-linecap=\"round\"><path d=\"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9\"/><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"/></svg>\n      任务提醒 <em class=\"count\" id=\"remCount\" style=\"font-style:normal\"></em>\n      <span class=\"sp\"></span>\n      <button class=\"p-close\" data-close=\"remPanel\">✕</button>\n    </div>\n    <div class=\"p-body\">\n      <div class=\"p-add\">\n        <input id=\"remText\" maxlength=\"60\" placeholder=\"提醒内容，比如：15:00 起来接杯水\">\n        <div class=\"row\">\n          <input id=\"remDt\" type=\"datetime-local\">\n          <select id=\"remRep\">\n            <option value=\"none\">一次</option>\n            <option value=\"daily\">每天</option>\n            <option value=\"weekly\">每周</option>\n            <option value=\"monthly\">每月</option>\n          </select>\n        </div>\n        <button id=\"remAdd\">加 入 日 程</button>\n      </div>\n      <div id=\"remList\"></div>\n    </div>\n    <div class=\"p-foot\">\n      <button class=\"tbtn\" id=\"remImport\">导入 JSON</button>\n      <button class=\"tbtn\" id=\"remExport\">导出备份</button>\n      <button class=\"tbtn primary\" id=\"remShare\">📤 复制链接分享</button>\n      <span class=\"sp\"></span>\n      <span>数据保存在应用中</span>\n    </div>\n    <input type=\"file\" id=\"remFile\" accept=\".json,application/json\" hidden>\n  </div>\n\n  <!-- 换肤面板 -->\n  <div class=\"panel\" id=\"skinPanel\">\n    <div class=\"p-head\">\n      <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--accent)\" stroke-width=\"2\" stroke-linecap=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"8.5\" cy=\"9\" r=\"1.1\" fill=\"var(--accent)\"/><circle cx=\"15\" cy=\"8\" r=\"1.1\" fill=\"var(--accent)\"/><circle cx=\"9.5\" cy=\"15\" r=\"1.1\" fill=\"var(--accent)\"/></svg>\n      换肤 <em class=\"count\" style=\"font-style:normal\">挑一件她喜欢的颜色</em>\n      <span class=\"sp\"></span>\n      <button class=\"p-close\" data-close=\"skinPanel\">✕</button>\n    </div>\n    <div class=\"p-body\">\n      <div class=\"skin-grid\" id=\"skinGrid\"></div>\n    </div>\n    <div class=\"p-foot\"><span class=\"sp\"></span><span>换肤只影响外观，数据不变</span></div>\n  </div>\n\n  <div id=\"toast\"></div>\n\n";

(async function(){
  "use strict";
  var LS;
  try { LS = await openStore(); } catch (error) { document.body.textContent = "无法连接数据，请登录后刷新重试。"; return; }
  var $ = function(id){ return document.getElementById(id); };
  var PET_NAME = "栖";


  /* ================= 皮肤 ================= */
  var SKINS = {
    cream:  {name:"奶油云朵", bg1:"#faf5ec", bg2:"#f2ead9", body:"#fdf3e3", shade:"#efdcc0", blush:"#f3b3a4", accent:"#d9a05e", leaf:"#a8c686", ink:"#5b4a42"},
    apricot:{name:"桂花奶兔", bg1:"#fbf1e6", bg2:"#f4e2cd", body:"#fbe3cd", shade:"#f2c9a8", blush:"#ef9f8a", accent:"#d97757", leaf:"#b5a06a", ink:"#6b4a38"},
    matcha: {name:"抹茶小熊", bg1:"#f2f5e8", bg2:"#e3ead2", body:"#e9efd9", shade:"#cfdcb4", blush:"#e3a08c", accent:"#7d9b57", leaf:"#8fae5f", ink:"#4f5b40"},
    violet: {name:"暮山紫",   bg1:"#f1ecf7", bg2:"#e2d9ef", body:"#e7dff2", shade:"#cbbde0", blush:"#d98fa8", accent:"#8a6fc4", leaf:"#9d8cc9", ink:"#544a66"},
    salt:   {name:"海盐蓝",   bg1:"#e9f2f8", bg2:"#d7e7f1", body:"#ddeaf3", shade:"#bcd6e8", blush:"#e59aa5", accent:"#5d8fb8", leaf:"#7fa88f", ink:"#42586b"}
  };
  var curSkin = LS.get("xm.skin", "cream");
  function applySkin(k){
    var s = SKINS[k]; if(!s) return;
    curSkin = k; LS.set("xm.skin", k);
    var r = document.documentElement.style;
    r.setProperty("--bg1", s.bg1); r.setProperty("--bg2", s.bg2);
    r.setProperty("--body", s.body); r.setProperty("--shade", s.shade);
    r.setProperty("--blush", s.blush); r.setProperty("--accent", s.accent);
    r.setProperty("--leaf", s.leaf); r.setProperty("--ink", s.ink);
    document.querySelectorAll(".skin-card").forEach(function(c){
      c.classList.toggle("sel", c.getAttribute("data-skin")===k);
    });
  }
  function buildSkins(){
    var grid = $("skinGrid");
    Object.keys(SKINS).forEach(function(k){
      var s = SKINS[k];
      var card = document.createElement("div");
      card.className = "skin-card"; card.setAttribute("data-skin", k);
      card.innerHTML =
        '<svg viewBox="0 0 48 48"><ellipse cx="24" cy="41" rx="12" ry="2.5" fill="rgba(90,70,50,.12)"/>' +
        '<path d="M13 17 C11 9 16 6 20 9 C23 11 24 14 23 17 Z" fill="'+s.body+'"/>' +
        '<path d="M35 17 C37 9 32 6 28 9 C25 11 24 14 25 17 Z" fill="'+s.body+'"/>' +
        '<path d="M24 10 C34 10 39 21 39 29 C39 37 32 41 24 41 C16 41 9 37 9 29 C9 21 14 10 24 10 Z" fill="'+s.body+'"/>' +
        '<ellipse cx="18.5" cy="27" rx="2.2" ry="2.8" fill="'+s.ink+'"/><ellipse cx="29.5" cy="27" rx="2.2" ry="2.8" fill="'+s.ink+'"/>' +
        '<ellipse cx="16" cy="32" rx="3" ry="1.8" fill="'+s.blush+'"/><ellipse cx="32" cy="32" rx="3" ry="1.8" fill="'+s.blush+'"/><path d="M21.5 31 q1.3 1.8 2.5 0" stroke="'+s.ink+'" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M24 31 q1.3 1.8 2.5 0" stroke="'+s.ink+'" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>' +
        "<span>"+s.name+"</span>";
      card.addEventListener("click", function(){
        applySkin(k); toast("换成「"+s.name+"」啦");
        say(pick(["这件颜色很衬你。","嗯，这件好看。","她也挺喜欢这件。"]));
      });
      grid.appendChild(card);
    });
  }

  /* ================= 语气气泡 ================= */
  var bubbleTimer = null;
  function say(text, actions){
    var b = $("bubble");
    b.innerHTML = "";
    var t = document.createElement("div");
    t.textContent = text;
    b.appendChild(t);
    if(actions && actions.length){
      var bar = document.createElement("div"); bar.className = "b-act";
      actions.forEach(function(a){
        var btn = document.createElement("button");
        btn.textContent = a.label;
        btn.addEventListener("click", function(){ a.fn(); hideBubble(); });
        bar.appendChild(btn);
      });
      b.appendChild(bar);
    }
    b.classList.add("show");
    clearTimeout(bubbleTimer);
    var dur = actions? 20000 : 6500;
    bubbleTimer = setTimeout(hideBubble, dur);
  }
  function hideBubble(){ $("bubble").classList.remove("show"); }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  /* ================= 心心 & 心情 ================= */
  var moodTimer = null;
  function setMood(m){
    var w = $("pet-wrap");
    w.classList.remove("mood-happy","mood-sleep");
    if(m) w.classList.add("mood-"+m);
    clearTimeout(moodTimer);
    if(m==="happy"){
      moodTimer = setTimeout(function(){
        w.classList.remove("mood-happy");
        if(isNight()) setMood("sleep");
      }, 2600);
    }
  }
  function isNight(){ var h = new Date().getHours(); return h>=22 || h<7; }
  function spawnHearts(){
    var stage = $("pet-stage");
    for(var i=0;i<3;i++){
      (function(i){
        setTimeout(function(){
          var h = document.createElement("span");
          h.className = "heart"; h.textContent = "♥";
          h.style.left = (52+Math.random()*66)+"px";
          h.style.top = (92+Math.random()*20)+"px";
          h.style.color = "var(--blush)";
          stage.appendChild(h);
          setTimeout(function(){ h.remove(); }, 1300);
        }, i*160);
      })(i);
    }
  }
  var PAT_LINES = [
    "嘿嘿，被你发现啦。","再摸摸，不收费。","今天也辛苦啦。",
    "有我在呢，慢慢来。","陪你坐一会儿。","头发乱了没？"
  ];

  /* ================= 任务提醒 ================= */
  var reminders = LS.get("xm.reminders", null);
  if(!reminders){
    reminders = [
      {text:"喝口水，润一下", dt:nextAt(10,0), repeat:"daily"},
      {text:"起来接杯水、走走", dt:nextAt(15,0), repeat:"daily"},
      {text:"早点休息，我守着", dt:nextAt(22,30), repeat:"daily"}
    ];
    LS.set("xm.reminders", reminders);
  }
  function nextAt(h, m){
    var d = new Date(); d.setHours(h, m, 0, 0);
    if(d.getTime() <= Date.now()) d.setDate(d.getDate()+1);
    return d.getTime();
  }
  var WD = ["周日","周一","周二","周三","周四","周五","周六"];
  function fmtTime(ts){
    var d = new Date(ts);
    return (d.getMonth()+1)+"月"+d.getDate()+"日 "+WD[d.getDay()]+" "+pad(d.getHours())+":"+pad(d.getMinutes());
  }
  function pad(n){ return (n<10?"0":"")+n; }
  function leftText(ts){
    var ms = ts - Date.now();
    if(ms < 0) return "刚刚";
    var mi = Math.floor(ms/60000);
    if(mi < 60) return "还有 "+mi+" 分钟";
    var h = Math.floor(mi/60);
    if(h < 24) return "还有 "+h+" 小时";
    return "还有 "+Math.floor(h/24)+" 天";
  }
  function repName(r){ return r==="daily"?"每天":r==="weekly"?"每周":r==="monthly"?"每月":"一次"; }

  function renderReminders(){
    var list = $("remList");
    list.innerHTML = "";
    var future = reminders.filter(function(r){ return r.dt > Date.now() - 60000; })
                          .sort(function(a,b){ return a.dt - b.dt; });
    $("remCount").textContent = future.length? future.length+" 个待提醒" : "";
    var badge = $("remBadge");
    badge.textContent = future.length;
    badge.classList.toggle("show", future.length>0);
    if(!future.length){
      list.innerHTML = '<div class="empty">今天没有要提醒的事。<br>添一条，'+PET_NAME+'帮你记着。</div>';
      return;
    }
    future.forEach(function(r){
      var idx = reminders.indexOf(r);
      var item = document.createElement("div");
      item.className = "rem" + (r.dt - Date.now() < 3600000 ? " soon" : "");
      var meta = document.createElement("div"); meta.className = "rmeta";
      meta.innerHTML = '<span>'+fmtTime(r.dt)+'</span><span class="badge2">'+repName(r.repeat)+'</span><span>'+leftText(r.dt)+'</span>';
      var main = document.createElement("div"); main.className = "rmain";
      var text = document.createElement("div"); text.className = "rtext"; text.textContent = r.text;
      main.appendChild(text); main.appendChild(meta);
      var act = document.createElement("div"); act.className = "ract";
      var bDone = document.createElement("button"); bDone.title = "完成"; bDone.textContent = "✓";
      bDone.addEventListener("click", function(){ doneReminder(idx); });
      var bDel = document.createElement("button"); bDel.title = "删除"; bDel.textContent = "✕";
      bDel.addEventListener("click", function(){ delReminder(idx); });
      act.appendChild(bDone); act.appendChild(bDel);
      var dot = document.createElement("div"); dot.className = "dotc";
      item.appendChild(dot); item.appendChild(main); item.appendChild(act);
      list.appendChild(item);
    });
  }
  function saveReminders(){ LS.set("xm.reminders", reminders); renderReminders(); }
  function addReminder(text, dt, repeat){
    if(!text || !dt) return false;
    reminders.push({text:text, dt:dt, repeat:repeat||"none"});
    saveReminders();
    return true;
  }
  function doneReminder(idx){
    var r = reminders[idx]; if(!r) return;
    reminders.splice(idx,1); saveReminders();
    toast("好，「"+r.text+"」完成了");
    setMood("happy"); say(pick(["嗯，又办妥一件。","效率真高。","给你记上一功。"]));
  }
  function delReminder(idx){
    var r = reminders[idx]; if(!r) return;
    reminders.splice(idx,1); saveReminders();
    toast("已删除");
  }

  /* 到点触发 */
  var firedThisSession = {};
  function checkReminders(){
    var now = Date.now();
    var due = [];
    reminders.forEach(function(r){
      if(r.dt <= now && !firedThisSession[r.dt+"|"+r.text]){
        due.push(r);
        firedThisSession[r.dt+"|"+r.text] = true;
      }
    });
    if(!due.length) return;
    due.forEach(function(r, i){
      setTimeout(function(){
        fireReminder(r);
        if(r.repeat === "daily" || r.repeat === "weekly" || r.repeat === "monthly"){
          r.dt = nextOccurrence(r.dt, r.repeat);
          delete firedThisSession[r.dt+"|"+r.text];
        }
        reminders = reminders.filter(function(x){ return x.dt > now || x.repeat !== "none"; });
        saveReminders();
      }, i*900);
    });
  }
  function nextOccurrence(ts, repeat){
    var d = new Date(ts);
    if(repeat === "daily") d.setDate(d.getDate()+1);
    else if(repeat === "weekly") d.setDate(d.getDate()+7);
    else if(repeat === "monthly"){
      var day = d.getDate();
      d.setMonth(d.getMonth()+1);
      if(d.getDate() < day) d.setDate(0);
    }
    return d.getTime();
  }
  function fireReminder(r){
    chime();
    setMood("happy");
    say("到点啦：" + r.text);
    toast("⏰ " + r.text);
    try{
      if(window.Notification && Notification.permission === "granted"){
        new Notification(PET_NAME+"提醒", { body: r.text });
      }
    }catch(e){}
  }

  /* 提示音：轻柔三连音 */
  var audioCtx = null;
  function chime(){
    try{
      if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state === "suspended") audioCtx.resume();
      var t0 = audioCtx.currentTime;
      [523.25, 659.25, 783.99].forEach(function(f, i){
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = "sine"; o.frequency.value = f;
        var t = t0 + i*0.13;
        g.gain.setValueAtTime(0.001, t);
        g.gain.exponentialRampToValueAtTime(0.09, t+0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t+0.7);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t); o.stop(t+0.75);
      });
    }catch(e){}
  }

  /* 导入 / 导出 */
  $("remImport").addEventListener("click", function(){ $("remFile").click(); });
  $("remFile").addEventListener("change", function(e){
    var f = e.target.files[0]; if(!f) return;
    var rd = new FileReader();
    rd.onload = function(){
      try{
        var arr = JSON.parse(rd.result);
        if(!Array.isArray(arr)) throw 0;
        var n = 0;
        arr.forEach(function(x){
          if(!x || typeof x.text !== "string") return;
          var ts = parseDt(x.dt);
          if(ts == null) return;
          var dup = reminders.some(function(r){ return r.text===x.text && Math.abs(r.dt-ts)<60000; });
          if(dup) return;
          reminders.push({text:x.text, dt:ts, repeat:["none","daily","weekly","monthly"].indexOf(x.repeat)>=0? x.repeat:"none"});
          n++;
        });
        saveReminders();
        toast(n? ("导入成功 "+n+" 条") : "没有新的提醒可导入");
        if(n) say("都记下了，一条不落。");
      }catch(err){
        toast("文件格式不对，需要 JSON 数组");
      }
      e.target.value = "";
    };
    rd.readAsText(f, "utf-8");
  });
  function parseDt(s){
    if(typeof s === "number") return s;
    if(typeof s !== "string") return null;
    var m = s.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
    if(!m) return null;
    return new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]).getTime();
  }
  $("remExport").addEventListener("click", function(){
    var arr = reminders.map(function(r){
      var d = new Date(r.dt);
      return {text:r.text, dt:d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+" "+pad(d.getHours())+":"+pad(d.getMinutes()), repeat:r.repeat};
    });
    var blob = new Blob([JSON.stringify(arr, null, 2)], {type:"application/json"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = PET_NAME+"-任务提醒备份.json";
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 3000);
    toast("已导出备份");
  });

  /* 分享：复制链接 / 调起系统分享 */
  function shareLink(){
    var url = location.href;
    var shareData = { title: PET_NAME+" · 桌角小伙伴", text: "一只安静陪你的桌面小宠物，点开就能用～", url: url };
    try{
      if(navigator.share){ navigator.share(shareData).catch(function(){}); return; }
    }catch(e){}
    function fallback(){ toast("链接已复制，发给朋友就能用"); try{ if(window.getSelection) window.getSelection().removeAllRanges(); }catch(e){} }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(fallback, function(){ prompt("复制下面的链接发给朋友：", url); });
    } else {
      prompt("复制下面的链接发给朋友：", url);
    }
  }
  $("remShare").addEventListener("click", function(){ shareLink(); });

  /* 添加表单 */
  function defaultDt(){
    var d = new Date();
    d.setHours(d.getHours()+1, 0, 0, 0);
    return d;
  }
  function fillDtInput(){
    var d = defaultDt();
    $("remDt").value = d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T"+pad(d.getHours())+":"+pad(d.getMinutes());
  }
  $("remAdd").addEventListener("click", function(){
    var text = $("remText").value.trim();
    var dv = $("remDt").value;
    if(!text){ toast("写点什么再添加"); $("remText").focus(); return; }
    if(!dv){ toast("选个时间"); $("remDt").focus(); return; }
    var ts = parseDt(dv.replace("T"," "));
    if(ts == null){ toast("时间没看懂"); return; }
    if(ts <= Date.now()){ toast("这个时间已经过了"); return; }
    if(addReminder(text, ts, $("remRep").value)){
      $("remText").value = ""; fillDtInput();
      toast("记下了："+text);
      setMood("happy");
      say(pick(["嗯，到点我叫你。","记下啦，放心吧。","这一条我盯着。"]));
    }
  });
  $("remText").addEventListener("keydown", function(e){ if(e.key==="Enter") $("remAdd").click(); });

  /* ================= 安静模式 / 收起 ================= */
  var dnd = LS.get("xm.dnd", false);
  function applyDnd(){
    $("dDnd").classList.toggle("on", dnd);
    toast(dnd? "安静模式开了，我少说话" : "安静模式关了，我回来啦");
  }
  $("dDnd").addEventListener("click", function(){ dnd = !dnd; LS.set("xm.dnd", dnd); applyDnd(); });
  $("dHide").addEventListener("click", function(){
    $("pet-wrap").style.display = "none";
    $("leaf-btn").classList.add("show");
    closePanels();
  });
  $("leaf-btn").addEventListener("click", function(){
    $("pet-wrap").style.display = "";
    $("leaf-btn").classList.remove("show");
    say(pick(["我回来啦。","喊我啦？","在呢在呢。"]));
  });

  /* ================= 面板开关 ================= */
  function closePanels(){
    document.querySelectorAll(".panel").forEach(function(p){ p.classList.remove("show"); });
  }
  function togglePanel(id){
    var p = $(id);
    var was = p.classList.contains("show");
    closePanels();
    if(!was){ p.classList.add("show"); if(id==="remPanel") renderReminders(); }
  }
  $("dRem").addEventListener("click", function(){ togglePanel("remPanel"); });
  $("dSkin").addEventListener("click", function(){ togglePanel("skinPanel"); });
  document.querySelectorAll(".p-close").forEach(function(b){
    b.addEventListener("click", function(){ closePanels(); });
  });
  document.addEventListener("keydown", function(e){ if(e.key==="Escape") closePanels(); });
  document.addEventListener("pointerdown", function(e){
    if(!e.target.closest(".panel") && !e.target.closest("#dock")) closePanels();
  });

  /* ================= 拖动 ================= */
  var pos = LS.get("xm.pos", null);
  var wrap = $("pet-wrap");
  function place(){
    var isSmall = window.innerWidth <= 560;
    var w = wrap.offsetWidth || 170;
    var x, y;
    if(isSmall){
      x = (window.innerWidth - w)/2;
      y = window.innerHeight - w - 24 - (window.innerWidth<=560? 30:0);
    } else {
      x = pos? pos.x : window.innerWidth - 230;
      y = pos? pos.y : window.innerHeight - 210;
    }
    x = Math.max(4, Math.min(x, window.innerWidth - w - 4));
    y = Math.max(4, Math.min(y, window.innerHeight - w - 4));
    wrap.style.left = x+"px"; wrap.style.top = y+"px";
  }
  place();
  var drag = null;
  wrap.addEventListener("pointerdown", function(e){
    if(e.target.closest("#dock") || e.target.closest("#bubble")) return;
    drag = {dx: e.clientX - wrap.offsetLeft, dy: e.clientY - wrap.offsetTop};
    wrap.classList.add("dragging");
    try{ wrap.setPointerCapture(e.pointerId); }catch(err){}
    markActive();
  });
  wrap.addEventListener("pointermove", function(e){
    if(!drag) return;
    var w = wrap.offsetWidth || 170;
    var nx = Math.max(4, Math.min(e.clientX - drag.dx, window.innerWidth - w - 4));
    var ny = Math.max(4, Math.min(e.clientY - drag.dy, window.innerHeight - w - 4));
    wrap.style.left = nx+"px"; wrap.style.top = ny+"px";
  });
  function endDrag(){
    if(!drag) return;
    drag = null; wrap.classList.remove("dragging");
    pos = {x: wrap.offsetLeft, y: wrap.offsetTop};
    LS.set("xm.pos", pos);
  }
  wrap.addEventListener("pointerup", endDrag);
  wrap.addEventListener("pointercancel", endDrag);

  /* 摸头 */
  var lastPat = 0;
  $("pet").addEventListener("click", function(){
    var now = Date.now();
    if(now - lastPat < 700) return;
    lastPat = now;
    wrap.classList.remove("pat"); void wrap.offsetWidth; wrap.classList.add("pat");
    setTimeout(function(){ wrap.classList.remove("pat"); }, 600);
    spawnHearts(); setMood("happy");
    say(pick(PAT_LINES));
    markActive();
  });
  $("pet").addEventListener("dblclick", function(){ togglePanel("remPanel"); });

  /* ================= 贴心小动作（懂她，不唠叨） ================= */
  var state = LS.get("xm.state", {lastNudge:0, lastActive:Date.now(), lastGreetDate:"", lastQuietDay:""});
  function saveState(){ LS.set("xm.state", state); }
  function markActive(){ state.lastActive = Date.now(); saveState(); }
  document.addEventListener("pointerdown", markActive);

  function autoQuiet(){ return dnd || isNight(); }

  var NUDGES = [
    {key:"water", text:"嘴巴干啦，去接杯水好不好？", ok:"好，听你的", later:"等一下"},
    {key:"move",  text:"坐了好久啦，起来伸个懒腰？", ok:"马上起", later:"再坐会儿"},
    {key:"eye",   text:"看看远处，让眼睛歇两分钟。", ok:"歇一会", later:"等下看"},
    {key:"food",  text:"这个点啦，午饭/晚饭吃了吗？", ok:"这就去吃", later:"还不饿"}
  ];
  function nudge(){
    var n = pick(NUDGES);
    say(n.text, [
      {label:n.ok, fn:function(){
        state.lastNudge = Date.now() + 3600000; saveState();
        setMood("happy"); say(pick(["真乖。","嗯，照顾自己最重要。","回来我给你接着盯着。"]));
      }},
      {label:n.later, fn:function(){
        state.lastNudge = Date.now() + 900000; saveState();
        say("好，那一刻钟后我再说一声。");
      }}
    ]);
  }
  function tick(){
    checkReminders();
    var now = Date.now();
    if(isNight()){ if(!wrap.classList.contains("mood-sleep") && !wrap.classList.contains("mood-happy")) setMood("sleep"); }
    else if(wrap.classList.contains("mood-sleep")) setMood(null);
    if(autoQuiet()) return;
    var today = new Date().toDateString();
    if(state.lastGreetDate !== today && !isNight()){
      state.lastGreetDate = today; saveState();
      setTimeout(function(){
        say(greeting(), [{label:"嗯，知道啦", fn:function(){ setMood("happy"); }}]);
      }, 800);
    }
    if(now - state.lastActive > 50*60000 && now - state.lastNudge > 10*60000){
      state.lastNudge = now; saveState();
      nudge();
      return;
    }
    if(now - state.lastNudge > 50*60000){
      state.lastNudge = now; saveState();
      nudge();
    }
  }
  function greeting(){
    var h = new Date().getHours();
    if(h < 6)  return "夜深了，早点休息，我守着。";
    if(h < 9)  return "早呀，新的一天，慢慢来。";
    if(h < 12) return "上午好，喝口水再忙。";
    if(h < 14) return "午后啦，记得吃饭。";
    if(h < 18) return "下午好，起来走两步？";
    if(h < 22) return "晚上好，让节奏慢一点。";
    return "不早啦，收拾收拾准备休息。";
  }
  setInterval(tick, 30000);

  setInterval(function(){
    if($("remPanel").classList.contains("show")) renderReminders();
  }, 60000);

  /* ================= 提示条 ================= */
  var toastTimer = null;
  function toast(msg){
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove("show"); }, 2400);
  }

  /* ================= 启动 ================= */
  buildSkins();
  applySkin(curSkin);
  fillDtInput();
  renderReminders();
  applyDnd();
  setTimeout(function(){
    if(isNight()){ setMood("sleep"); say("夜深了，早点休息，我守着。"); }
    else say("我是"+PET_NAME+"，你的桌角小伙伴。点我摸头，双击加提醒～想分享给朋友，打开「任务提醒」点「复制链接分享」就好。");
  }, 600);
  setTimeout(function(){
    try{ if(window.Notification && Notification.permission === "default") Notification.requestPermission(); }catch(e){}
  }, 3000);
})();
