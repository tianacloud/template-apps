const style = document.createElement("style"); style.textContent = "\n  *,*::before,*::after{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\n  :root{\n    --ink:#151412;\n    --cream:#FFF7E6;\n    --pink:#FF4E88;\n    --yellow:#FFD93D;\n    --blue:#3DA9FC;\n    --green:#7BE495;\n    --purple:#B983FF;\n    --orange:#FF8A3D;\n    --line:3px solid var(--ink);\n    --sh:5px 5px 0 var(--ink);\n    --sh-sm:3px 3px 0 var(--ink);\n  }\n  html,body{margin:0;padding:0;height:100%}\n  body{\n    background:var(--cream);\n    color:var(--ink);\n    font-family:\"PingFang SC\",\"Hiragino Sans GB\",\"Noto Sans SC\",\"Microsoft YaHei\",system-ui,-apple-system,sans-serif;\n    -webkit-font-smoothing:antialiased;\n    overscroll-behavior-y:none;\n    overflow-x:hidden;\n    min-height:100dvh;\n    position:relative;\n  }\n  button{font-family:inherit;color:inherit}\n\n  /* ============ 背景层 ============ */\n  .bg{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none}\n  .blob{position:absolute;border-radius:50%;filter:blur(50px);opacity:.42;will-change:transform}\n  .b1{width:270px;height:270px;background:var(--pink);top:-80px;left:-90px;animation:drift1 16s ease-in-out infinite}\n  .b2{width:230px;height:230px;background:var(--blue);bottom:-70px;right:-80px;animation:drift2 19s ease-in-out infinite}\n  .b3{width:200px;height:200px;background:var(--yellow);top:42%;right:-70px;animation:drift3 22s ease-in-out infinite}\n  .b4{width:160px;height:160px;background:var(--green);bottom:18%;left:-70px;animation:drift1 25s ease-in-out infinite reverse}\n  @keyframes drift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(46px,60px) scale(1.16)}}\n  @keyframes drift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-50px,-46px) scale(1.12)}}\n  @keyframes drift3{0%,100%{transform:translate(0,0) scale(1.05)}50%{transform:translate(-38px,52px) scale(.9)}}\n\n  .dots{\n    position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.32;\n    background-image:radial-gradient(var(--ink) 1.1px, transparent 1.2px);\n    background-size:22px 22px;\n    mask-image:radial-gradient(circle at 50% 40%, transparent 42%, #000 88%);\n    -webkit-mask-image:radial-gradient(circle at 50% 40%, transparent 42%, #000 88%);\n  }\n  /* 米色柔光罩：保证任何色块上都读得清字 */\n  .veil{\n    position:fixed;inset:0;z-index:1;pointer-events:none;\n    background:radial-gradient(circle at 50% 34%, rgba(255,247,230,.24), rgba(255,247,230,.62) 82%);\n  }\n\n  .floaters{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}\n  .floater{position:absolute;bottom:-60px;font-size:20px;opacity:.45;will-change:transform;animation:rise linear infinite}\n  @keyframes rise{\n    0%{transform:translateY(0) rotate(0deg)}\n    100%{transform:translateY(-118vh) rotate(300deg)}\n  }\n\n  /* ============ 布局 ============ */\n  .app{\n    position:relative;z-index:3;width:100%;max-width:430px;margin:0 auto;\n    padding:calc(18px + env(safe-area-inset-top)) 20px calc(20px + env(safe-area-inset-bottom));\n    min-height:100dvh;display:flex;flex-direction:column;\n  }\n  .view{display:none;flex:1;flex-direction:column}\n  .view.active{display:flex;animation:viewIn .48s cubic-bezier(.2,.9,.3,1.25) both}\n  @keyframes viewIn{from{opacity:0;transform:translateY(22px) scale(.965)}to{opacity:1;transform:none}}\n\n  /* ============ 首页 ============ */\n  .tape{\n    display:inline-block;align-self:flex-start;\n    background:var(--ink);color:var(--cream);\n    font-size:11px;font-weight:900;letter-spacing:2.4px;\n    padding:7px 14px;border-radius:4px;transform:rotate(-2.5deg);\n    box-shadow:3px 3px 0 var(--pink);\n    animation:tapeWob 5s ease-in-out infinite;\n  }\n  @keyframes tapeWob{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(1.5deg)}}\n\n  .title{\n    margin:24px 0 6px;font-size:clamp(50px,16vw,68px);line-height:1.06;\n    font-weight:900;letter-spacing:1px;\n  }\n  .t-chunk{\n    display:inline-block;padding:0 3px;\n    text-shadow:3px 3px 0 var(--ink);\n    animation:hop 2.6s cubic-bezier(.3,1.5,.5,1) infinite;\n  }\n  .c1{color:var(--pink);animation-delay:0s}\n  .c2{color:var(--yellow);animation-delay:.12s}\n  .c3{color:var(--blue);animation-delay:.24s}\n  .c4{color:var(--green);animation-delay:.36s}\n  .q{display:inline-block;color:var(--ink);animation:hop 2.6s cubic-bezier(.3,1.5,.5,1) infinite;animation-delay:.5s}\n  @keyframes hop{\n    0%,72%,100%{transform:translateY(0) rotate(0)}\n    80%{transform:translateY(-14px) rotate(-6deg) scale(1.06)}\n    88%{transform:translateY(2px) rotate(3deg)}\n  }\n  .sub{\n    margin:12px 0 0;font-size:15px;font-weight:800;color:#4a453e;letter-spacing:.5px;\n  }\n  .sub b{color:var(--ink);background:var(--yellow);padding:1px 6px;border-radius:5px;border:2px solid var(--ink);display:inline-block;transform:rotate(-1.5deg)}\n\n  .actions{margin-top:34px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;flex:0 0 auto}\n  .btn{\n    position:relative;display:flex;align-items:center;justify-content:center;gap:10px;\n    border:var(--line);border-radius:26px;background:#fff;color:var(--ink);\n    font-weight:900;font-size:20px;letter-spacing:1px;\n    padding:18px 24px;box-shadow:var(--sh);\n    cursor:pointer;touch-action:manipulation;user-select:none;\n    transition:transform .16s cubic-bezier(.34,1.56,.64,1),box-shadow .16s ease;\n    animation:breathe 3.4s ease-in-out infinite;\n  }\n  @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.022)}}\n  .btn:active{animation:none;transform:translate(4px,4px);box-shadow:1px 1px 0 var(--ink)}\n  .btn-emoji{font-size:24px;line-height:1}\n\n  .btn-eat{width:100%;background:var(--green)}\n  .btn-date{\n    width:74%;background:var(--pink);color:#fff;font-size:19px;padding:16px 20px;\n    text-shadow:2px 2px 0 var(--ink);\n    animation:none;\n    transition:transform .44s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease;\n    will-change:transform;z-index:5;\n  }\n  .btn-date .btn-emoji{font-size:22px}\n  .btn-date::after{\n    content:\"\";position:absolute;inset:-8px;border-radius:34px;\n    border:3px dashed rgba(255,78,136,.9);\n    animation:ringPulse 2.6s ease-in-out infinite;pointer-events:none;\n  }\n  @keyframes ringPulse{\n    0%,100%{opacity:.35;transform:scale(1)}\n    50%{opacity:1;transform:scale(1.035)}\n  }\n  .btn-date:active{transform:translate(4px,4px)}\n\n  .btn-date.tired{\n    background:var(--yellow);color:var(--ink);text-shadow:none;\n    animation:tiredPulse 1s ease-in-out infinite;\n  }\n  .btn-date.tired::after{border-color:var(--green);border-style:solid;animation-duration:2.2s}\n  @keyframes tiredPulse{\n    0%,100%{box-shadow:5px 5px 0 var(--ink),0 0 0 0 rgba(255,78,136,.6)}\n    50%{box-shadow:5px 5px 0 var(--ink),0 0 0 14px rgba(255,78,136,0)}\n  }\n\n  .hint{\n    margin:18px 0 0;text-align:center;font-size:13px;font-weight:800;\n    color:#6b665e;min-height:20px;transition:color .2s;\n  }\n  .hint.hot{color:var(--pink)}\n\n  /* 跑走残影 & 吐槽气泡 */\n  .ghost{\n    position:fixed;z-index:4;border:3px dashed var(--pink);border-radius:26px;\n    background:rgba(255,255,255,.4);pointer-events:none;\n    animation:ghostOut .55s ease-out forwards;\n  }\n  @keyframes ghostOut{to{opacity:0;transform:scale(1.14)}}\n  .taunt{\n    position:fixed;z-index:9;pointer-events:none;\n    background:var(--ink);color:var(--cream);font-size:13px;font-weight:900;\n    padding:7px 12px;border-radius:14px;white-space:nowrap;\n    animation:tauntUp .9s ease-out forwards;\n  }\n  @keyframes tauntUp{\n    0%{opacity:0;transform:translate(-50%,6px) scale(.7) rotate(-6deg)}\n    25%{opacity:1;transform:translate(-50%,-6px) scale(1.06) rotate(3deg)}\n    100%{opacity:0;transform:translate(-50%,-52px) scale(.9) rotate(-4deg)}\n  }\n  .spark{\n    position:fixed;z-index:9;pointer-events:none;font-size:15px;\n    animation:sparkOut .6s ease-out forwards;\n  }\n  @keyframes sparkOut{\n    0%{opacity:1;transform:translate(0,0) scale(.5)}\n    100%{opacity:0;transform:translate(var(--sx),var(--sy)) scale(1.3)}\n  }\n\n  /* 页面中部的装饰贴纸 */\n  .sticker-row{\n    flex:1 1 auto;display:flex;align-items:center;justify-content:center;\n    gap:15px;min-height:90px;pointer-events:none;\n  }\n  .stk{\n    display:grid;place-items:center;width:58px;height:58px;font-size:27px;\n    background:#fff;border:3px solid var(--ink);border-radius:19px;\n    box-shadow:4px 4px 0 var(--ink);\n  }\n  .s1{background:var(--yellow);animation:stk1 3.6s ease-in-out infinite}\n  .s2{background:#fff;animation:stk2 4.2s ease-in-out infinite .3s}\n  .s3{background:var(--blue);animation:stk3 3.9s ease-in-out infinite .6s}\n  @keyframes stk1{0%,100%{transform:rotate(-9deg) translateY(0)}50%{transform:rotate(-9deg) translateY(-11px)}}\n  @keyframes stk2{0%,100%{transform:rotate(6deg) translateY(0)}50%{transform:rotate(6deg) translateY(-14px)}}\n  @keyframes stk3{0%,100%{transform:rotate(-4deg) translateY(0)}50%{transform:rotate(-4deg) translateY(-9px)}}\n\n  /* 跑马灯 */\n  .ticker{\n    margin-top:auto;padding-top:26px;overflow:hidden;\n    border-top:3px dashed rgba(21,20,18,.18);\n  }\n  .ticker-track{display:flex;width:max-content;animation:marquee 18s linear infinite}\n  .ticker-track span{\n    font-size:12px;font-weight:900;letter-spacing:2px;color:#a09a91;\n    padding-right:26px;white-space:nowrap;\n  }\n  @keyframes marquee{to{transform:translateX(-50%)}}\n\n  /* ============ 子页头 ============ */\n  .subhead{display:flex;align-items:center;gap:12px;margin-bottom:6px}\n  .back{\n    width:44px;height:44px;flex:0 0 auto;border:var(--line);border-radius:14px;\n    background:#fff;box-shadow:var(--sh-sm);font-size:20px;font-weight:900;\n    display:grid;place-items:center;cursor:pointer;transition:transform .12s;\n  }\n  .back:active{transform:translate(3px,3px);box-shadow:none}\n  .subhead h2{margin:0;font-size:24px;font-weight:900;letter-spacing:.5px}\n  .subhead h2 em{font-style:normal;display:inline-block;animation:shake 2.2s ease-in-out infinite}\n  @keyframes shake{0%,100%{transform:rotate(0)}25%{transform:rotate(-12deg)}75%{transform:rotate(12deg)}}\n  .lede{\n    margin:8px 0 14px;font-size:13.5px;font-weight:800;color:#4a453e;line-height:1.6;\n  }\n  .lede u{text-decoration:none;background:var(--yellow);border-bottom:3px solid var(--ink);padding:0 3px}\n\n  /* ============ 选择组 ============ */\n  .group{margin-bottom:15px}\n  .group-head{display:flex;align-items:center;gap:9px;margin-bottom:9px}\n  .tag{\n    font-size:13px;font-weight:900;padding:4px 11px;border:2.5px solid var(--ink);\n    border-radius:9px;background:var(--accent,var(--yellow));transform:rotate(-1.5deg);\n    box-shadow:2px 2px 0 var(--ink);letter-spacing:1px;display:inline-block;\n  }\n  .group-tip{font-size:12px;font-weight:800;color:#6b655c}\n  .group[data-group=\"meat\"],.group[data-group=\"food\"]{--accent:var(--pink)}\n  .group[data-group=\"veg\"]{--accent:var(--green)}\n  .group[data-group=\"soup\"]{--accent:var(--yellow)}\n  .group[data-group=\"play\"]{--accent:var(--blue)}\n\n  .chips{\n    position:relative;display:flex;gap:9px;overflow-x:auto;padding:5px 3px 9px;\n    scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-behavior:smooth;\n  }\n  .chips::-webkit-scrollbar{display:none}\n  .chip{\n    flex:0 0 auto;display:flex;align-items:center;gap:6px;\n    border:2.5px solid var(--ink);border-radius:999px;background:#fff;\n    padding:9px 15px;font-size:14.5px;font-weight:800;letter-spacing:.3px;\n    box-shadow:2.5px 2.5px 0 var(--ink);cursor:pointer;\n    transition:transform .16s cubic-bezier(.34,1.56,.64,1),background .16s,box-shadow .16s;\n    touch-action:manipulation;user-select:none;\n  }\n  .chip i{font-style:normal;font-size:15px}\n  .chip:active{transform:translate(2.5px,2.5px);box-shadow:none}\n  .chip.selected{\n    background:var(--accent,var(--yellow));\n    transform:translate(-1px,-2px) rotate(-2deg);\n    box-shadow:3.5px 4px 0 var(--ink);\n  }\n  .chip.pop{animation:chipPop .42s cubic-bezier(.34,1.56,.64,1)}\n  @keyframes chipPop{\n    0%{transform:scale(.86) rotate(-5deg)}\n    60%{transform:scale(1.1) rotate(2deg)}\n    100%{transform:translate(-1px,-2px) rotate(-2deg)}\n  }\n\n  /* ============ 备注 ============ */\n  .note-box{\n    margin-top:2px;border:var(--line);border-radius:20px;background:#fff;\n    padding:13px 13px 14px;box-shadow:var(--sh-sm);\n  }\n  .note-box label{display:block;font-size:13.5px;font-weight:900;margin-bottom:10px}\n  .quick{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px}\n  .quick button{\n    border:2px solid var(--ink);border-radius:999px;background:#FFF3D0;\n    font-size:12.5px;font-weight:800;padding:6px 11px;cursor:pointer;\n    transition:transform .12s,background .12s;\n  }\n  .quick button:active{transform:scale(.93);background:var(--yellow)}\n  .note-box input{\n    width:100%;border:2.5px solid var(--ink);border-radius:13px;background:#FFFDF7;\n    padding:12px 13px;font-size:14.5px;font-weight:700;font-family:inherit;color:var(--ink);\n    outline:none;transition:box-shadow .2s,background .2s;\n  }\n  .note-box input::placeholder{color:#b9b2a7;font-weight:700}\n  .note-box input:focus{background:#fff;box-shadow:0 0 0 4px rgba(255,217,61,.55)}\n\n  /* 约会页中部的装饰占位 */\n  .filler{flex:1 1 auto;display:grid;place-items:center;padding:10px 0 6px;min-height:96px}\n  .filler-card{\n    border:3px dashed rgba(21,20,18,.32);border-radius:22px;\n    padding:16px 26px;text-align:center;background:rgba(255,255,255,.5);\n    animation:bob 4.6s ease-in-out infinite;\n  }\n  @keyframes bob{\n    0%,100%{transform:rotate(-2deg) translateY(0)}\n    50%{transform:rotate(1.2deg) translateY(-7px)}\n  }\n  .filler-ico{display:block;font-size:30px;line-height:1;animation:shake 3.4s ease-in-out infinite}\n  .filler-card p{margin:9px 0 0;font-size:12.5px;font-weight:800;line-height:1.9;color:#5d574f;letter-spacing:.5px}\n  .filler-card b{\n    display:inline-block;background:var(--purple);color:#fff;font-weight:900;\n    padding:1px 8px;border-radius:7px;border:2px solid var(--ink);\n    transform:rotate(-1.5deg);margin-top:2px;\n  }\n\n  /* ============ 底部按钮区 ============ */\n  .cta{\n    position:sticky;bottom:0;z-index:6;margin-top:auto;\n    padding:18px 0 calc(4px + env(safe-area-inset-bottom));\n    display:flex;flex-direction:column;gap:11px;\n    background:linear-gradient(to bottom,rgba(255,247,230,0) 0%,rgba(255,247,230,.95) 26%,var(--cream) 58%);\n  }\n  .btn-roll{background:var(--purple);color:#fff;text-shadow:2px 2px 0 var(--ink);font-size:17px;padding:15px}\n  .btn-go{background:var(--yellow);font-size:18px;padding:17px}\n  .btn-go:disabled{opacity:.55;filter:grayscale(.5)}\n\n  /* ============ 结果弹层 ============ */\n  .overlay{\n    position:fixed;inset:0;z-index:20;display:none;\n    align-items:center;justify-content:center;padding:22px;\n    background:rgba(21,20,18,.42);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);\n  }\n  .overlay.show{display:flex;animation:fadeIn .28s ease both}\n  @keyframes fadeIn{from{opacity:0}to{opacity:1}}\n  .card{\n    position:relative;width:100%;max-width:362px;\n    animation:cardIn .55s cubic-bezier(.2,.9,.3,1.3) both;\n  }\n  @keyframes cardIn{\n    0%{opacity:0;transform:scale(.7) rotate(-6deg) translateY(30px)}\n    100%{opacity:1;transform:scale(1) rotate(-1deg) translateY(0)}\n  }\n  .card-body{\n    position:relative;background:var(--cream);border:4px solid var(--ink);\n    border-radius:26px;box-shadow:8px 8px 0 var(--ink);\n    padding:22px 20px 18px;max-height:84dvh;overflow-y:auto;\n    -webkit-overflow-scrolling:touch;\n  }\n  .card-stamp{\n    position:absolute;top:-14px;right:14px;z-index:3;background:var(--pink);color:#fff;\n    font-size:11px;font-weight:900;letter-spacing:2px;padding:6px 12px;\n    border:2.5px solid var(--ink);border-radius:8px;transform:rotate(6deg);\n    box-shadow:2px 2px 0 var(--ink);\n  }\n  .card h3{margin:0 0 4px;font-size:22px;font-weight:900;letter-spacing:.5px}\n  .card-date{margin:0 0 16px;font-size:11.5px;font-weight:800;color:#6b655c;letter-spacing:1.2px}\n  .card-items{display:flex;flex-direction:column;gap:10px}\n  .item{\n    display:flex;align-items:center;gap:12px;background:#fff;\n    border:3px solid var(--ink);border-radius:16px;padding:12px 14px;\n    box-shadow:3px 3px 0 var(--ink);\n    animation:itemIn .45s cubic-bezier(.2,.9,.3,1.4) both;\n  }\n  .item:nth-child(1){animation-delay:.12s}\n  .item:nth-child(2){animation-delay:.22s}\n  .item:nth-child(3){animation-delay:.32s}\n  @keyframes itemIn{from{opacity:0;transform:translateX(-18px) rotate(-2deg)}to{opacity:1;transform:none}}\n  .item-ico{font-size:24px;line-height:1;filter:drop-shadow(1px 1px 0 rgba(0,0,0,.12))}\n  .item-main{display:flex;flex-direction:column;gap:2px;min-width:0}\n  .item-key{font-size:10.5px;font-weight:900;letter-spacing:1.5px;color:#7a746b}\n  .item-val{font-size:17px;font-weight:900;letter-spacing:.4px}\n  .card-note{\n    margin-top:13px;padding:11px 13px;background:var(--yellow);\n    border:2.5px dashed var(--ink);border-radius:13px;\n    font-size:13.5px;font-weight:800;line-height:1.55;\n  }\n  .card-actions{display:flex;flex-direction:column;gap:10px;margin-top:18px}\n  .card-actions .btn{font-size:15px;padding:14px;border-radius:18px;animation:none}\n  .ca-row{display:flex;gap:10px}\n  .ca-row .btn{flex:1;font-size:14px;padding:14px 8px}\n  .ca-primary{background:var(--green)}\n  .ca-ghost{background:#fff;box-shadow:3px 3px 0 var(--ink)}\n\n  .confetti{position:fixed;inset:0;z-index:25;pointer-events:none;overflow:hidden}\n  .confetti i{\n    position:absolute;top:-24px;border-radius:2px;border:1.5px solid var(--ink);\n    animation:fall linear forwards;\n  }\n  @keyframes fall{\n    0%{opacity:1;transform:translateY(0) rotate(0)}\n    100%{opacity:.9;transform:translateY(110vh) rotate(var(--rot))}\n  }\n\n  .toast{\n    position:fixed;left:50%;bottom:calc(34px + env(safe-area-inset-bottom));\n    transform:translateX(-50%) translateY(20px);z-index:40;\n    background:var(--ink);color:var(--cream);font-size:13.5px;font-weight:900;\n    padding:12px 20px;border-radius:16px;opacity:0;pointer-events:none;\n    transition:opacity .25s,transform .25s;white-space:nowrap;\n  }\n  .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}\n\n  @media (prefers-reduced-motion:reduce){\n    .blob,.floater,.ticker-track{animation-duration:60s}\n  }\n  @media (min-width:520px){\n    .app{border-left:3px solid rgba(21,20,18,.1);border-right:3px solid rgba(21,20,18,.1)}\n  }\n"; document.head.appendChild(style);
document.body.insertAdjacentHTML("beforeend", "\n\n<div class=\"bg\">\n  <span class=\"blob b1\"></span>\n  <span class=\"blob b2\"></span>\n  <span class=\"blob b3\"></span>\n  <span class=\"blob b4\"></span>\n</div>\n<div class=\"dots\"></div>\n<div class=\"veil\"></div>\n<div class=\"floaters\" id=\"floaters\"></div>\n\n<main class=\"app\">\n\n  <!-- ==================== 首页 ==================== -->\n  <section class=\"view active\" id=\"view-home\">\n    <span class=\"tape\">FOR TWO · 只给我们俩</span>\n\n    <h1 class=\"title\">\n      <span class=\"t-chunk c1\">今</span><span class=\"t-chunk c2\">晚</span><br>\n      <span class=\"t-chunk c3\">吃</span><span class=\"t-chunk c4\">啥</span><span class=\"q\">?</span>\n    </h1>\n\n    <p class=\"sub\">选一个 · <b>不许反悔</b> 😝</p>\n\n    <div class=\"actions\">\n      <button class=\"btn btn-eat\" id=\"btnEat\">\n        <span class=\"btn-emoji\">🍚</span><span class=\"btn-label\">在家吃</span>\n      </button>\n      <button class=\"btn btn-date\" id=\"btnDate\">\n        <span class=\"btn-emoji\">🚶</span><span class=\"btn-label\" id=\"btnDateLabel\">外出约会</span>\n      </button>\n      <p class=\"hint\" id=\"dodgeHint\">（友情提示：它可能会跑）</p>\n    </div>\n\n    <div class=\"sticker-row\">\n      <span class=\"stk s1\">🍚</span>\n      <span class=\"stk s2\">🍲</span>\n      <span class=\"stk s3\">🍜</span>\n    </div>\n\n    <div class=\"ticker\">\n      <div class=\"ticker-track\" id=\"tickerTrack\"></div>\n    </div>\n  </section>\n\n  <!-- ==================== 在家吃 ==================== -->\n  <section class=\"view\" id=\"view-eat\">\n    <div class=\"subhead\">\n      <button class=\"back\" data-back>←</button>\n      <h2>在家吃 <em>🏠</em></h2>\n    </div>\n    <p class=\"lede\">一荤一素一汤，<u>随便挑</u>，挑不出来就交给手气。</p>\n\n    <div class=\"group\" data-group=\"meat\">\n      <div class=\"group-head\"><span class=\"tag\">肉</span><span class=\"group-tip\">今天想吃哪种肉？</span></div>\n      <div class=\"chips\" data-group=\"meat\">\n        <button class=\"chip\" data-value=\"猪肉\"><i>🥩</i>猪肉</button>\n        <button class=\"chip\" data-value=\"牛肉\"><i>🍖</i>牛肉</button>\n        <button class=\"chip\" data-value=\"鸭肉\"><i>🦆</i>鸭肉</button>\n        <button class=\"chip\" data-value=\"鸡肉\"><i>🍗</i>鸡肉</button>\n        <button class=\"chip\" data-value=\"羊肉\"><i>🐑</i>羊肉</button>\n        <button class=\"chip\" data-value=\"排骨\"><i>🦴</i>排骨</button>\n        <button class=\"chip\" data-value=\"鲜虾\"><i>🦐</i>鲜虾</button>\n        <button class=\"chip\" data-value=\"鲈鱼\"><i>🐟</i>鲈鱼</button>\n      </div>\n    </div>\n\n    <div class=\"group\" data-group=\"veg\">\n      <div class=\"group-head\"><span class=\"tag\">菜</span><span class=\"group-tip\">来点绿的吧</span></div>\n      <div class=\"chips\" data-group=\"veg\">\n        <button class=\"chip\" data-value=\"空心菜\"><i>🥬</i>空心菜</button>\n        <button class=\"chip\" data-value=\"生菜\"><i>🥬</i>生菜</button>\n        <button class=\"chip\" data-value=\"白菜\"><i>🥬</i>白菜</button>\n        <button class=\"chip\" data-value=\"菜心\"><i>🌿</i>菜心</button>\n        <button class=\"chip\" data-value=\"黄瓜\"><i>🥒</i>黄瓜</button>\n        <button class=\"chip\" data-value=\"西兰花\"><i>🥦</i>西兰花</button>\n        <button class=\"chip\" data-value=\"土豆丝\"><i>🥔</i>土豆丝</button>\n        <button class=\"chip\" data-value=\"茄子\"><i>🍆</i>茄子</button>\n        <button class=\"chip\" data-value=\"豆角\"><i>🫛</i>豆角</button>\n      </div>\n    </div>\n\n    <div class=\"group\" data-group=\"soup\">\n      <div class=\"group-head\"><span class=\"tag\">汤</span><span class=\"group-tip\">没汤不算一顿饭</span></div>\n      <div class=\"chips\" data-group=\"soup\">\n        <button class=\"chip\" data-value=\"紫菜蛋花汤\"><i>🥣</i>紫菜蛋花汤</button>\n        <button class=\"chip\" data-value=\"丝瓜皮蛋汤\"><i>🥣</i>丝瓜皮蛋汤</button>\n        <button class=\"chip\" data-value=\"豆腐海带汤\"><i>🍲</i>豆腐海带汤</button>\n        <button class=\"chip\" data-value=\"番茄鸡蛋汤\"><i>🍅</i>番茄鸡蛋汤</button>\n        <button class=\"chip\" data-value=\"冬瓜排骨汤\"><i>🍲</i>冬瓜排骨汤</button>\n        <button class=\"chip\" data-value=\"玉米胡萝卜汤\"><i>🌽</i>玉米胡萝卜汤</button>\n        <button class=\"chip\" data-value=\"酸辣汤\"><i>🌶️</i>酸辣汤</button>\n      </div>\n    </div>\n\n    <div class=\"note-box\">\n      <label>📝 备注加菜（想吃啥写下来）</label>\n      <div class=\"quick\" id=\"quickNotes\">\n        <button data-add=\"加个卤蛋\">加个卤蛋</button>\n        <button data-add=\"再来碗米饭\">再来碗米饭</button>\n        <button data-add=\"要辣一点\">要辣一点</button>\n        <button data-add=\"加瓶冰饮料\">加瓶冰饮料</button>\n        <button data-add=\"少油少盐\">少油少盐</button>\n        <button data-add=\"我来洗碗\">我来洗碗 🧼</button>\n      </div>\n      <input id=\"noteInput\" type=\"text\" maxlength=\"40\" placeholder=\"比如：再炒个蛋炒饭…\" autocomplete=\"off\">\n    </div>\n\n    <div class=\"cta\">\n      <button class=\"btn btn-roll\" id=\"btnRollEat\">🎲 随机搭一套</button>\n      <button class=\"btn btn-go\" id=\"btnGoEat\">就这顿了 →</button>\n    </div>\n  </section>\n\n  <!-- ==================== 外出约会 ==================== -->\n  <section class=\"view\" id=\"view-date\">\n    <div class=\"subhead\">\n      <button class=\"back\" data-back>←</button>\n      <h2>外出约会 <em>🎈</em></h2>\n    </div>\n    <p class=\"lede\">去哪玩 + 吃什么，<u>各选一个</u>，今晚就出发。</p>\n\n    <div class=\"group\" data-group=\"play\">\n      <div class=\"group-head\"><span class=\"tag\">去哪</span><span class=\"group-tip\">先定个去处</span></div>\n      <div class=\"chips\" data-group=\"play\">\n        <button class=\"chip\" data-value=\"看电影\"><i>🎬</i>看电影</button>\n        <button class=\"chip\" data-value=\"逛公园\"><i>🌳</i>逛公园</button>\n        <button class=\"chip\" data-value=\"逛街\"><i>🛍️</i>逛街</button>\n        <button class=\"chip\" data-value=\"江边走走\"><i>🌊</i>江边走走</button>\n        <button class=\"chip\" data-value=\"电玩城\"><i>🕹️</i>电玩城</button>\n        <button class=\"chip\" data-value=\"逛书店\"><i>📚</i>逛书店</button>\n        <button class=\"chip\" data-value=\"看展\"><i>🖼️</i>看展</button>\n        <button class=\"chip\" data-value=\"夜市瞎逛\"><i>🏮</i>夜市瞎逛</button>\n      </div>\n    </div>\n\n    <div class=\"group\" data-group=\"food\">\n      <div class=\"group-head\"><span class=\"tag\">吃啥</span><span class=\"group-tip\">别再说\"随便\"了</span></div>\n      <div class=\"chips\" data-group=\"food\">\n        <button class=\"chip\" data-value=\"火锅\"><i>🍲</i>火锅</button>\n        <button class=\"chip\" data-value=\"烤肉\"><i>🥩</i>烤肉</button>\n        <button class=\"chip\" data-value=\"牛杂\"><i>🍜</i>牛杂</button>\n        <button class=\"chip\" data-value=\"日料\"><i>🍣</i>日料</button>\n        <button class=\"chip\" data-value=\"烧烤\"><i>🍢</i>烧烤</button>\n        <button class=\"chip\" data-value=\"小龙虾\"><i>🦞</i>小龙虾</button>\n        <button class=\"chip\" data-value=\"麻辣烫\"><i>🌶️</i>麻辣烫</button>\n        <button class=\"chip\" data-value=\"吃碗面\"><i>🍥</i>吃碗面</button>\n        <button class=\"chip\" data-value=\"广式茶餐厅\"><i>🥟</i>茶餐厅</button>\n      </div>\n    </div>\n\n    <div class=\"filler\">\n      <div class=\"filler-card\">\n        <span class=\"filler-ico\">🎈</span>\n        <p>选完就出发<br>别再说<b>随便</b></p>\n      </div>\n    </div>\n\n    <div class=\"cta\">\n      <button class=\"btn btn-roll\" id=\"btnRollDate\">🎲 手气决定今晚</button>\n      <button class=\"btn btn-go\" id=\"btnGoDate\">出发！ →</button>\n    </div>\n  </section>\n\n</main>\n\n<!-- ==================== 结果弹层 ==================== -->\n<div class=\"overlay\" id=\"overlay\">\n  <div class=\"card\" id=\"card\">\n    <span class=\"card-stamp\" id=\"cardStamp\">DINNER</span>\n    <div class=\"card-body\">\n      <h3 id=\"cardTitle\">今晚就这么吃</h3>\n      <p class=\"card-date\" id=\"cardDate\"></p>\n      <div class=\"card-items\" id=\"cardItems\"></div>\n      <div class=\"card-note\" id=\"cardNote\" style=\"display:none\"></div>\n      <div class=\"card-actions\">\n        <button class=\"btn ca-primary\" id=\"btnCopy\">📋 复制发给 TA</button>\n        <div class=\"ca-row\">\n          <button class=\"btn ca-ghost\" id=\"btnShare\" style=\"display:none\">📤 分享</button>\n          <button class=\"btn ca-ghost\" id=\"btnAgain\">🔁 再来一次</button>\n        </div>\n        <button class=\"btn ca-ghost\" id=\"btnClose\">← 返回改一改</button>\n      </div>\n    </div>\n  </div>\n</div>\n<div class=\"confetti\" id=\"confetti\"></div>\n<div class=\"toast\" id=\"toast\"></div>\n\n");

(function(){
  "use strict";
  var $ = function(s){ return document.querySelector(s); };
  var $$ = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var rand = function(a,b){ return a + Math.random()*(b-a); };
  var randInt = function(a,b){ return Math.floor(rand(a,b+1)); };
  var buzz = function(ms){
    try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(e){}
  };

  /* ================= 背景漂浮 emoji ================= */
  (function floaters(){
    var box = $('#floaters');
    var icons = ['🍜','🍲','🥟','🍡','🥬','🍖','🌶️','🍚','🥩','🍥','❤️','✨'];
    for(var i=0;i<9;i++){
      var el = document.createElement('span');
      el.className = 'floater';
      el.textContent = icons[i % icons.length];
      el.style.left = rand(4,92) + '%';
      el.style.fontSize = rand(16,26) + 'px';
      el.style.animationDuration = rand(16,30) + 's';
      el.style.animationDelay = (-rand(0,26)) + 's';
      box.appendChild(el);
    }
  })();

  /* ================= 跑马灯 ================= */
  (function ticker(){
    var t = $('#tickerTrack');
    var txt = 'TODAY\'S MENU ✦ 抓不到我 ✦ 今晚吃啥 ✦ 一荤一素一汤 ✦ 不许说随便 ✦ ';
    var s = '';
    for(var i=0;i<8;i++) s += '<span>' + txt + '</span>';
    t.innerHTML = s;
  })();

  /* ================= 视图切换 ================= */
  var views = { home: $('#view-home'), eat: $('#view-eat'), date: $('#view-date') };

  function applyView(name){
    Object.keys(views).forEach(function(k){
      views[k].classList.toggle('active', k === name);
    });
    window.scrollTo(0,0);
    if(name !== 'home'){
      // 进入二级页一律从第一项开始显示，不自动滚到已选项
      setTimeout(function(){
        $$('.chips').forEach(function(box){ box.scrollLeft = 0; });
      }, 0);
    }
  }

  // 进入二级页 = 往历史里压一层，手机原生返回键才能逐级退回
  function go(name){
    applyView(name);
    try{ history.pushState({ t: name }, ''); }catch(e){}
  }

  // 页面内的返回键统一走浏览器历史，和原生返回键行为完全一致
  $$('[data-back]').forEach(function(b){
    b.addEventListener('click', function(){
      if(overlay.classList.contains('show')){ closeCard(true); }
      history.back();
    });
  });

  try{ history.replaceState({ t: 'home' }, ''); }catch(e){}

  window.addEventListener('popstate', function(e){
    var st = e.state || { t: 'home' };
    if(overlay.classList.contains('show')) closeCard(true);
    if(st.t === 'eat' || st.t === 'date' || st.t === 'home') applyView(st.t);
    else applyView('home');
  });
  /* ================= 溜走的「外出约会」按钮 ================= */
  var btnDate = $('#btnDate');
  var btnDateLabel = $('#btnDateLabel');
  var hint = $('#dodgeHint');
  var DODGE_TARGET = randInt(5,8);   // 每次进页面随机 5~8 次
  var dodgeCount = 0;
  var lastDodgeAt = 0;
  var readyAt = 0;
  var caught = false;
  var ox = 0, oy = 0, lastRot = 0;

  var taunts = ['哎～','追不到我','嘿嘿','手滑了吧','再试一次嘛','差一点点','我在那边'];
  var hints = [
    '（友情提示：它可能会跑）',
    '哦？跑了',
    '再来呀～',
    '手速不太行哦',
    '它有点怕痒',
    '快了快了别急',
    '它快跑不动了…',
    '就是现在！点它！'
  ];

  function setHint(){
    if(caught) return;
    var idx = Math.min(dodgeCount, hints.length - 1);
    hint.textContent = hints[idx];
    hint.classList.toggle('hot', dodgeCount >= DODGE_TARGET - 1);
  }

  function spawnGhost(r){
    var g = document.createElement('div');
    g.className = 'ghost';
    g.style.left = r.left + 'px';
    g.style.top = r.top + 'px';
    g.style.width = r.width + 'px';
    g.style.height = r.height + 'px';
    document.body.appendChild(g);
    setTimeout(function(){ g.remove(); }, 600);
  }

  function spawnTaunt(r){
    var el = document.createElement('div');
    el.className = 'taunt';
    el.textContent = taunts[randInt(0, taunts.length-1)];
    el.style.left = (r.left + r.width/2) + 'px';
    el.style.top = (r.top - 8) + 'px';
    document.body.appendChild(el);
    setTimeout(function(){ el.remove(); }, 950);
  }

  function spawnSpark(r){
    var icons = ['✨','💨','⭐','💫'];
    for(var i=0;i<3;i++){
      (function(i){
        var s = document.createElement('div');
        s.className = 'spark';
        s.textContent = icons[randInt(0,3)];
        s.style.left = (r.left + rand(10, r.width-10)) + 'px';
        s.style.top = (r.top + rand(8, r.height-8)) + 'px';
        s.style.setProperty('--sx', rand(-40,40) + 'px');
        s.style.setProperty('--sy', rand(-50,-10) + 'px');
        document.body.appendChild(s);
        setTimeout(function(){ s.remove(); }, 650);
      })(i);
    }
  }

  function dodge(){
    var pad = 12;
    var r = btnDate.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;

    // 当前可活动区间（保证按钮始终在屏幕内）
    var dxMin = pad - r.left,  dxMax = vw - pad - r.right;
    var dyMin = pad - r.top,   dyMax = vh - pad - r.bottom;

    var amount = rand(72, 128);
    var dirs = [[1,0],[-1,0],[0,1],[0,-1],[.72,.72],[-.72,.72],[.72,-.72],[-.72,-.72]];
    var eatRect = $('#btnEat').getBoundingClientRect();
    var cands = dirs.map(function(d){
      var dx = Math.min(Math.max(d[0]*amount, dxMin), dxMax);
      var dy = Math.min(Math.max(d[1]*amount, dyMin), dyMax);
      var nl = r.left + dx, nt = r.top + dy;
      // 尽量避免盖住「在家吃」按钮（否则会挡住去路）
      var clash = !(nl + r.width < eatRect.left - 6 || nl > eatRect.right + 6 ||
                    nt + r.height < eatRect.top - 6 || nt > eatRect.bottom + 6);
      return { dx: dx, dy: dy, len: Math.sqrt(dx*dx + dy*dy), clash: clash };
    });
    var ok = cands.filter(function(c){ return c.len > 34 && !c.clash; });
    if(!ok.length) ok = cands.filter(function(c){ return c.len > 34; });
    if(!ok.length) ok = [cands.reduce(function(a,b){ return a.len > b.len ? a : b; })];
    var pick = ok[randInt(0, ok.length-1)];

    ox += pick.dx; oy += pick.dy;
    lastRot = rand(-9, 9);

    spawnGhost(r);
    spawnTaunt(r);
    spawnSpark(r);

    btnDate.style.transform = 'translate(' + ox + 'px,' + oy + 'px) rotate(' + lastRot + 'deg) scale(.94)';
    setTimeout(function(){
      btnDate.style.transform = 'translate(' + ox + 'px,' + oy + 'px) rotate(' + (lastRot*0.35) + 'deg) scale(1)';
    }, 230);

    dodgeCount++;
    lastDodgeAt = Date.now();
    buzz(12);
    setHint();

    if(dodgeCount >= DODGE_TARGET){
      btnDate.classList.add('tired');
      btnDateLabel.textContent = '被逮到了 ❤️';
      hint.textContent = '它跑不动了，快点它！';
      hint.classList.add('hot');
      readyAt = Date.now() + 520;   // 留一点时间让"跑不动了"这个瞬间被看见
      buzz([18,50,18]);
    }
  }

  btnDate.addEventListener('pointerdown', function(e){
    if(caught) return;
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    if(dodgeCount >= DODGE_TARGET) return;  // 已放行，交给 click
    if(e.cancelable) e.preventDefault();
    dodge();
  });

  btnDate.addEventListener('click', function(e){
    if(Date.now() < readyAt) return;
    // 已经抓到过一次：不再溜走，直接进约会页
    if(caught){ go('date'); return; }
    if(dodgeCount < DODGE_TARGET){
      // 同一串动作里 pointerdown 已经算过，避免一次点击被记两次
      if(Date.now() - lastDodgeAt < 420) return;
      dodge();
      return;
    }
    caught = true;
    buzz(20);
    go('date');
  });

  // 键盘可达性：回车/空格直接放行（不做"溜走"惩罚）
  btnDate.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
      e.preventDefault();
      caught = true;
      go('date');
    }
  });

  $('#btnEat').addEventListener('click', function(){ buzz(12); go('eat'); });

  /* ================= 选择器通用逻辑 ================= */
  function bindChips(){
    $$('.chips').forEach(function(box){
      box.addEventListener('click', function(e){
        var chip = e.target.closest('.chip');
        if(!chip) return;
        Array.prototype.forEach.call(box.querySelectorAll('.chip'), function(c){
          c.classList.remove('selected');
        });
        chip.classList.add('selected');
        chip.classList.add('pop');
        setTimeout(function(){ chip.classList.remove('pop'); }, 430);
        buzz(8);
      });
    });
  }
  bindChips();

  function getChip(group){
    var el = document.querySelector('.chips[data-group="' + group + '"] .chip.selected');
    return el ? el.dataset.value : null;
  }

  function rollChips(group, dur){
    dur = dur || 720;
    return new Promise(function(resolve){
      var box = document.querySelector('.chips[data-group="' + group + '"]');
      var chips = Array.prototype.slice.call(box.querySelectorAll('.chip'));
      var start = performance.now();
      var lastIdx = -1;
      function frame(t){
        var elapsed = t - start;
        var idx = Math.floor(elapsed / 65) % chips.length;
        if(idx !== lastIdx){
          chips.forEach(function(c){ c.classList.remove('selected'); });
          chips[idx].classList.add('selected');
          lastIdx = idx;
          if(elapsed / 65 % 3 < 1){
            chips[idx].scrollIntoView({ behavior:'auto', inline:'center', block:'nearest' });
          }
        }
        if(elapsed < dur){ requestAnimationFrame(frame); }
        else {
          chips.forEach(function(c){ c.classList.remove('selected'); });
          var pick = chips[randInt(0, chips.length-1)];
          pick.classList.add('selected','pop');
          setTimeout(function(){ pick.classList.remove('pop'); }, 440);
          pick.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' });
          resolve(pick.dataset.value);
        }
      }
      requestAnimationFrame(frame);
    });
  }

  /* ================= 结果卡片 ================= */
  var overlay = $('#overlay');
  var cardItems = $('#cardItems');
  var cardNote = $('#cardNote');
  var cardTitle = $('#cardTitle');
  var cardStamp = $('#cardStamp');
  var cardDate = $('#cardDate');
  var currentPayload = { kind:'eat', rows:[], note:'' };

  function confetti(){
    var box = $('#confetti');
    var colors = ['#FF4E88','#FFD93D','#3DA9FC','#7BE495','#B983FF','#FF8A3D'];
    for(var i=0;i<30;i++){
      var s = document.createElement('i');
      s.style.left = rand(0,100) + '%';
      s.style.background = colors[i % colors.length];
      s.style.width = rand(6,12) + 'px';
      s.style.height = rand(7,14) + 'px';
      s.style.animationDelay = rand(0,.45) + 's';
      s.style.animationDuration = rand(1.4,2.6) + 's';
      s.style.setProperty('--rot', rand(-540,540) + 'deg');
      box.appendChild(s);
    }
    setTimeout(function(){ box.innerHTML = ''; }, 2900);
  }

  function todayKey(){
    var d = new Date();
    return (d.getMonth()+1) + '月' + d.getDate() + '日 · 星期' + '日一二三四五六'[d.getDay()];
  }

  function openCard(cfg, noPush){
    cardStamp.textContent = cfg.stamp;
    cardTitle.textContent = cfg.title;
    cardDate.textContent = cfg.sub;
    cardItems.innerHTML = cfg.rows.map(function(r){
      return '<div class="item">' +
               '<span class="item-ico">' + r.ico + '</span>' +
               '<span class="item-main">' +
                 '<span class="item-key">' + r.key + '</span>' +
                 '<span class="item-val">' + r.val + '</span>' +
               '</span>' +
             '</div>';
    }).join('');
    if(cfg.note){
      cardNote.style.display = 'block';
      cardNote.textContent = '📝 ' + cfg.note;
    } else {
      cardNote.style.display = 'none';
    }
    currentPayload = { kind: cfg.kind, rows: cfg.rows, note: cfg.note || '', title: cfg.title };
    overlay.classList.add('show');
    confetti();
    buzz([14,60,14]);
    // 弹层也压一层历史：原生返回先关弹层，再退页面
    if(!noPush){ try{ history.pushState({ t:'card' }, ''); }catch(e){} }
  }

  // skipHistory=true 表示历史已经在动了（popstate 触发 / 就地重开），不要再 back()
  function closeCard(skipHistory){
    overlay.classList.remove('show');
    if(!skipHistory){ try{ history.back(); }catch(e){} }
  }

  $('#btnClose').addEventListener('click', function(){ closeCard(); });
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeCard(); });

  /* ---- 复制 / 分享 ---- */
  function buildText(){
    var p = currentPayload;
    var lines = [ p.kind === 'eat' ? '今晚在家吃 🏠' : '今晚出去约会啦 🎉' ];
    p.rows.forEach(function(r){
      lines.push(r.ico + ' ' + String(r.key).split(' · ')[0] + '：' + r.val);
    });
    if(p.note) lines.push('📝 备注：' + p.note);
    lines.push('—— 就这么定了，不许反悔 😝');
    return lines.join('\n');
  }

  function toast(msg){
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(function(){ t.classList.remove('show'); }, 1900);
  }

  function copyText(text){
    if(navigator.clipboard && navigator.clipboard.writeText){
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function(res, rej){
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '-999px';
      document.body.appendChild(ta);
      ta.select();
      try{ document.execCommand('copy'); res(); }catch(e){ rej(e); }
      ta.remove();
    });
  }

  $('#btnCopy').addEventListener('click', function(){
    copyText(buildText())
      .then(function(){ toast('已复制，去发给他/她吧 💌'); buzz(15); })
      .catch(function(){ toast('复制失败，长按选中文字试试'); });
  });

  if(navigator.share){
    var bs = $('#btnShare');
    bs.style.display = 'flex';
    bs.addEventListener('click', function(){
      navigator.share({ title:'今晚吃啥', text: buildText() }).catch(function(){});
    });
  }

  $('#btnAgain').addEventListener('click', function(){
    var kind = currentPayload.kind;
    closeCard(true);          // 历史不动，弹层留在"card"这一层
    setTimeout(function(){
      if(kind === 'eat') doEat(true, true);
      else doDate(true, true);
    }, 220);
  });

  /* ================= 在家吃 ================= */
  function doEat(auto, noPush){
    var meat = getChip('meat'), veg = getChip('veg'), soup = getChip('soup');
    if(auto || !meat || !veg || !soup){
      Promise.all([rollChips('meat'), rollChips('veg'), rollChips('soup')])
        .then(function(){
          setTimeout(function(){
            openEatCard(document.querySelector('#noteInput').value.trim(), noPush);
          }, 260);
        });
    } else {
      openEatCard(document.querySelector('#noteInput').value.trim(), noPush);
    }
  }

  var icoMap = {
    '猪肉':'🥩','牛肉':'🍖','鸭肉':'🦆','鸡肉':'🍗','羊肉':'🐑','排骨':'🦴','鲜虾':'🦐','鲈鱼':'🐟',
    '空心菜':'🥬','生菜':'🥬','白菜':'🥬','菜心':'🌿','黄瓜':'🥒','西兰花':'🥦','土豆丝':'🥔','茄子':'🍆','豆角':'🫛',
    '紫菜蛋花汤':'🥣','丝瓜皮蛋汤':'🥣','豆腐海带汤':'🍲','番茄鸡蛋汤':'🍅','冬瓜排骨汤':'🍲','玉米胡萝卜汤':'🌽','酸辣汤':'🌶️',
    '看电影':'🎬','逛公园':'🌳','逛街':'🛍️','江边走走':'🌊','电玩城':'🕹️','逛书店':'📚','看展':'🖼️','夜市瞎逛':'🏮',
    '火锅':'🍲','烤肉':'🥩','牛杂':'🍜','日料':'🍣','烧烤':'🍢','小龙虾':'🦞','麻辣烫':'🌶️','吃碗面':'🍥','广式茶餐厅':'🥟'
  };
  function ico(v){ return icoMap[v] || '🍽️'; }

  function openEatCard(note, noPush){
    var rows = [
      { ico: ico(getChip('meat')), key:'肉 · MEAT', val: getChip('meat') || '猪肉' },
      { ico: ico(getChip('veg')),  key:'菜 · VEGGIE', val: getChip('veg') || '空心菜' },
      { ico: ico(getChip('soup')), key:'汤 · SOUP', val: getChip('soup') || '紫菜蛋花汤' }
    ];
    openCard({
      kind:'eat', stamp:'DINNER', title:'今晚就这么吃',
      sub: todayKey() + ' · 一荤一素一汤',
      rows: rows, note: note
    }, noPush);
  }

  $('#btnRollEat').addEventListener('click', function(){
    buzz(12);
    var b = this;
    b.disabled = true;
    Promise.all([rollChips('meat'), rollChips('veg'), rollChips('soup')]).then(function(){
      b.disabled = false;
    });
  });

  $('#btnGoEat').addEventListener('click', function(){ buzz(12); doEat(false); });

  $$('#quickNotes button').forEach(function(b){
    b.addEventListener('click', function(){
      var inp = $('#noteInput');
      var add = b.dataset.add;
      if(add.indexOf('我来洗碗') === 0){
        inp.value = '我来洗碗 🧼';
      } else if(inp.value.indexOf(add) === -1){
        inp.value = inp.value ? (inp.value.replace(/[，,]\s*$/,'') + '，' + add) : add;
      }
      buzz(8);
      inp.focus();
    });
  });

  /* ================= 外出约会 ================= */
  function doDate(auto, noPush){
    var play = getChip('play'), food = getChip('food');
    if(auto || !play || !food){
      Promise.all([rollChips('play'), rollChips('food')]).then(function(){
        setTimeout(function(){ openDateCard(noPush); }, 260);
      });
    } else {
      openDateCard(noPush);
    }
  }

  function openDateCard(noPush){
    openCard({
      kind:'date', stamp:'DATE NIGHT', title:'今晚的计划',
      sub: todayKey() + ' · 出发不要磨蹭',
      rows: [
        { ico: ico(getChip('play')), key:'去哪 · GO', val: getChip('play') || '看电影' },
        { ico: ico(getChip('food')), key:'吃啥 · EAT', val: getChip('food') || '火锅' }
      ],
      note: ''
    }, noPush);
  }

  $('#btnRollDate').addEventListener('click', function(){
    buzz(12);
    var b = this;
    b.disabled = true;
    Promise.all([rollChips('play'), rollChips('food')]).then(function(){
      b.disabled = false;
    });
  });

  $('#btnGoDate').addEventListener('click', function(){ buzz(12); doDate(false); });

  /* 初始给每组预选一个，避免空状态 */
  (function preset(){
    ['meat','veg','soup','play','food'].forEach(function(g){
      var first = document.querySelector('.chips[data-group="' + g + '"] .chip');
      if(first) first.classList.add('selected');
    });
    setHint();
  })();

})();
