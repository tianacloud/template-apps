const style=document.createElement('style');style.textContent="\n  :root{\n    --ink:#1a1613; --paper:#f5efe2; --gold:#e9b44c; --gold-d:#b07d2b;\n    --seal:#c0392b; --jade:#57c4a3; --shadow:0 12px 34px rgba(26,22,19,.25);\n    color-scheme:light;\n  }\n  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}\n  button,input{font-family:inherit;}\n  button{color:#3a3226;}\n  input{color:#3a3226;}\n  body{\n    font-family:\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n    background:#171310;color:#2b2622;overflow-x:hidden;min-height:100vh;\n  }\n  .kai{font-family:\"STKaiti\",\"KaiTi\",\"楷体\",\"SimKai\",serif;}\n  .screen{display:none;min-height:100vh;flex-direction:column;align-items:center;}\n  .screen.active{display:flex;animation:fadeUp .6s ease;}\n  @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}\n  .btn{\n    border:none;cursor:pointer;font-family:inherit;font-weight:800;letter-spacing:.12em;\n    border-radius:999px;transition:transform .18s,box-shadow .18s;\n  }\n  .btn:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(0,0,0,.3);}\n  .btn:active{transform:scale(.96);}\n  .btn-gold{background:linear-gradient(90deg,var(--gold),#f6d47c);color:#4a3208;font-size:17px;padding:14px 38px;box-shadow:0 8px 20px rgba(233,180,76,.35);}\n  .btn-dark{background:#2b2622;color:var(--paper);font-size:14px;padding:10px 24px;}\n  .btn-mini{background:#fff;color:#2b2622;font-size:13px;padding:8px 18px;box-shadow:0 3px 10px rgba(0,0,0,.15);}\n\n  /* ============ 彩蛋登录 ============ */\n  #egg{background:radial-gradient(circle at 50% 30%,#241d16,#0f0b08 75%);color:var(--paper);justify-content:center;}\n  .egg-box{text-align:center;padding:30px;}\n  .blackbox{\n    width:150px;height:110px;margin:0 auto 22px;border-radius:12px;position:relative;\n    background:linear-gradient(160deg,#3a322b,#211b15);border:1px solid #57493a;\n    box-shadow:0 18px 40px rgba(0,0,0,.6),inset 0 0 24px rgba(0,0,0,.5);\n    display:flex;align-items:center;justify-content:center;cursor:pointer;\n  }\n  .blackbox::before{content:\"保密\";font-family:\"STKaiti\",\"KaiTi\",serif;color:var(--paper);\n    background:var(--seal);padding:3px 10px;border-radius:4px;font-size:16px;letter-spacing:.2em;transform:rotate(-6deg);}\n  .blackbox:hover{transform:translateY(-4px) rotate(1deg);transition:.3s;}\n  .egg{\n    width:130px;height:168px;margin:14px auto;border-radius:50% 50% 48% 48%/58% 58% 42% 42%;\n    background:radial-gradient(circle at 35% 30%,#fdf3d8,#e8d3a0 55%,#b99a5e);\n    box-shadow:inset -8px -12px 22px rgba(120,90,40,.45),0 14px 34px rgba(0,0,0,.55);\n    display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;\n    user-select:none;transition:transform .15s;\n  }\n  .egg:active{transform:scale(.95);}\n  .egg .carve{\n    font-family:\"STKaiti\",\"KaiTi\",serif;font-size:26px;color:#6e5322;writing-mode:vertical-rl;\n    letter-spacing:.28em;text-shadow:0 1px 0 #fff8e0;pointer-events:none;\n  }\n  .crack{position:absolute;pointer-events:none;font-size:26px;opacity:.9;}\n  .egg.glowing{animation:eggGlow 1.2s ease infinite;}\n  @keyframes eggGlow{0%,100%{box-shadow:inset -8px -12px 22px rgba(120,90,40,.45),0 0 18px 4px rgba(233,180,76,.45);}\n    50%{box-shadow:inset -8px -12px 22px rgba(120,90,40,.45),0 0 60px 18px rgba(233,180,76,.85);}}\n  .egg-hint{margin-top:18px;color:#c9b28a;font-size:14px;letter-spacing:.1em;line-height:2;}\n  .pw-row{margin-top:22px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}\n  .pw-input{padding:11px 16px;border-radius:12px;border:1px solid #5a4a35;background:#241d16;color:var(--paper);\n    text-align:center;font-family:inherit;width:180px;outline:none;}\n  .pw-input:focus{border-color:var(--gold);}\n  .pw-msg{margin-top:10px;min-height:22px;font-size:13px;color:#e9b44c;}\n  .intro-note{\n    margin-top:26px;max-width:560px;background:rgba(255,255,255,.06);border:1px solid rgba(233,180,76,.25);\n    border-radius:16px;padding:18px 22px;font-size:13.5px;line-height:2.1;color:#d8c9a8;text-align:left;\n  }\n  .intro-note b{color:var(--gold);}\n\n  /* ============ 承诺书 ============ */\n  #pledge{background:radial-gradient(circle at 50% 20%,#241d16,#0f0b08 75%);color:var(--paper);justify-content:center;}\n  .scroll{\n    width:min(620px,92vw);background:linear-gradient(#faf4e4,#efe4c8);color:#3a3226;\n    border-radius:14px;padding:34px 32px;box-shadow:var(--shadow);position:relative;\n  }\n  .scroll::before,.scroll::after{content:\"\";position:absolute;left:0;right:0;height:14px;\n    background:repeating-linear-gradient(90deg,#8a6d3b 0 18px,#6e5322 18px 22px);}\n  .scroll::before{top:0;border-radius:14px 14px 0 0;}\n  .scroll::after{bottom:0;border-radius:0 0 14px 14px;}\n  .scroll h2{font-family:\"STKaiti\",\"KaiTi\",serif;text-align:center;font-size:28px;letter-spacing:.3em;margin-bottom:18px;color:#5a3a00;}\n  .scroll p{font-size:14.5px;line-height:2.2;margin-bottom:8px;}\n  .scroll .seal-stamp{position:absolute;right:26px;bottom:30px;width:64px;height:64px;border:3px solid var(--seal);\n    color:var(--seal);border-radius:8px;display:flex;align-items:center;justify-content:center;\n    font-family:\"STKaiti\",\"KaiTi\",serif;font-size:15px;transform:rotate(8deg);opacity:.85;line-height:1.4;text-align:center;}\n  .name-input{display:block;margin:20px auto 6px;padding:13px 20px;font-size:16px;width:min(300px,80vw);\n    border:2px solid #cbb98d;border-radius:12px;background:#fff;text-align:center;font-family:inherit;outline:none;}\n  .name-input:focus{border-color:var(--gold);box-shadow:0 0 0 4px rgba(233,180,76,.2);}\n  .btn-row{display:flex;gap:14px;justify-content:center;margin-top:20px;flex-wrap:wrap;}\n\n  /* ============ 山路地图 ============ */\n  #map{background:linear-gradient(180deg,#101720 0%,#1c2b26 40%,#33473a 78%,#5a6b4d 100%);color:var(--paper);padding:5vh 4vw 8vh;}\n  .map-title{text-align:center;margin-bottom:8px;}\n  .map-title h2{font-family:\"STKaiti\",\"KaiTi\",serif;font-size:clamp(26px,5vw,36px);letter-spacing:.2em;color:var(--gold);text-shadow:0 0 22px rgba(233,180,76,.4);}\n  .map-title p{font-size:13px;color:#b9c4ae;margin-top:8px;line-height:2;}\n  .path{display:flex;flex-direction:column-reverse;align-items:center;gap:6px;margin-top:26px;}\n  .node{\n    display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.07);\n    border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:14px 20px;width:min(560px,92vw);\n    cursor:pointer;transition:transform .2s,background .2s,box-shadow .2s;position:relative;\n  }\n  .node:hover{transform:translateX(6px);}\n  .node.locked{opacity:.45;cursor:not-allowed;}\n  .node.locked:hover{transform:none;}\n  .node.done{background:rgba(87,196,163,.12);border-color:rgba(87,196,163,.4);}\n  .node.current{background:rgba(233,180,76,.14);border-color:var(--gold);box-shadow:0 0 26px rgba(233,180,76,.35);}\n  .node.current::after{content:\"当前关卡\";position:absolute;top:-10px;right:14px;background:var(--gold);color:#4a3208;\n    font-size:11px;font-weight:800;padding:3px 12px;border-radius:12px;letter-spacing:.1em;}\n  .node .pen-mini{width:34px;height:44px;flex-shrink:0;border-radius:4px 4px 8px 8px;position:relative;transform:rotate(18deg);}\n  .node .pen-mini::before{content:\"\";position:absolute;left:50%;top:100%;transform:translateX(-50%);\n    border:7px solid transparent;border-top:12px solid inherit;width:0;height:0;}\n  .node h3{font-size:18px;font-family:\"STKaiti\",\"KaiTi\",serif;letter-spacing:.12em;}\n  .node p{font-size:12.5px;color:#c2cdb8;margin-top:4px;line-height:1.8;}\n  .node .lv{margin-left:auto;font-family:\"STKaiti\",\"KaiTi\",serif;color:var(--gold);font-size:15px;flex-shrink:0;}\n  .peak{font-size:34px;margin-top:20px;filter:drop-shadow(0 0 18px rgba(87,196,163,.8));text-align:center;}\n  .peak-name{font-family:\"STKaiti\",\"KaiTi\",serif;color:var(--jade);letter-spacing:.24em;font-size:16px;text-align:center;margin-top:6px;}\n\n  /* ============ 神笔样式 ============ */\n  .pen{width:22px;height:88px;border-radius:5px 5px 10px 10px;position:relative;margin:0 auto;}\n  .pen::before{content:\"\";position:absolute;left:50%;top:100%;transform:translateX(-50%);\n    border:9px solid transparent;border-top:15px solid #caa64f;width:0;height:0;filter:drop-shadow(0 0 6px rgba(255,209,102,.9));}\n  .pen::after{content:\"\";position:absolute;top:8px;left:50%;transform:translateX(-50%);width:6px;height:26px;border-radius:4px;background:rgba(255,255,255,.5);}\n  .pen.g1{background:linear-gradient(#b08a5f,#6f4e37);}   .pen.g1::before{border-top-color:#9c7b52;filter:none;}\n  .pen.g2{background:linear-gradient(#8fc07a,#3a5a40);}   .pen.g2::before{border-top-color:#caa64f;filter:none;}\n  .pen.g3{background:linear-gradient(#d98e4a,#8a4b1f);}   .pen.g3::before{border-top-color:#caa64f;filter:none;}\n  .pen.g4{background:linear-gradient(#f2f6f9,#9fb0bf);box-shadow:0 0 16px rgba(220,230,240,.55);}\n  .pen.g5{background:linear-gradient(#ffe08a,#d4a017);box-shadow:0 0 22px rgba(255,209,102,.75);}\n  .pen.g6{background:linear-gradient(#8ff0cd,#1b7a68);box-shadow:0 0 30px rgba(87,196,163,.9);animation:jadePulse 1.6s ease infinite;}\n  @keyframes jadePulse{0%,100%{box-shadow:0 0 22px rgba(87,196,163,.7);}50%{box-shadow:0 0 44px rgba(87,196,163,1);}}\n\n  /* ============ 答题 ============ */\n  #quiz{background:linear-gradient(180deg,#141a15,#1e2a20);color:var(--paper);padding:3vh 4vw 8vh;}\n  .quiz-top{width:min(760px,94vw);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:18px;}\n  .qchip{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:18px;padding:7px 16px;font-size:13px;display:flex;align-items:center;gap:8px;}\n  .streak-dots{display:flex;gap:6px;}\n  .streak-dots i{width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,.18);}\n  .streak-dots i.on{background:var(--gold);box-shadow:0 0 10px var(--gold);}\n  .quiz-card{\n    width:min(760px,94vw);background:linear-gradient(#faf4e4,#efe4c8);color:#3a3226;border-radius:20px;\n    padding:30px 28px;box-shadow:var(--shadow);position:relative;overflow:hidden;\n  }\n  .quiz-card .scene{font-size:12px;letter-spacing:.24em;color:#8a6d3b;margin-bottom:12px;}\n  .quiz-card h3{font-family:\"STKaiti\",\"KaiTi\",serif;font-size:clamp(19px,3.4vw,25px);line-height:1.9;margin-bottom:22px;}\n  .opts{display:grid;grid-template-columns:1fr 1fr;gap:14px;}\n  @media (max-width:560px){.opts{grid-template-columns:1fr;}}\n  .opt{\n    background:#fff;border:2px solid #d8c9a0;border-radius:14px;padding:15px 18px;cursor:pointer;\n    font-size:16px;font-family:\"STKaiti\",\"KaiTi\",\"楷体\",serif;line-height:1.7;transition:all .18s;position:relative;text-align:left;color:#3a3226;\n  }\n  .opt:hover{border-color:var(--gold);transform:translateY(-2px);box-shadow:0 8px 18px rgba(233,180,76,.25);}\n  .opt.right{border-color:#2a9d8f;background:#e8f7f0;animation:rightPop .5s ease;}\n  .opt.wrong{border-color:var(--seal);background:#fbeae8;animation:shake .4s;}\n  .opt.dim{opacity:.32;pointer-events:none;}\n  @keyframes rightPop{0%{transform:scale(1);}45%{transform:scale(1.05);}100%{transform:scale(1);}}\n  @keyframes shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-7px);}75%{transform:translateX(7px);}}\n  .quiz-foot{margin-top:20px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}\n  .skill-btn{background:linear-gradient(#fff8e6,#f3e3bb);border:2px solid var(--gold-d);color:#5a3a00;font-size:13.5px;padding:9px 20px;box-shadow:0 4px 12px rgba(176,125,43,.25);}\n  .skill-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;}\n  .verdict-line{margin-top:16px;min-height:26px;text-align:center;font-family:\"STKaiti\",\"KaiTi\",serif;font-size:16px;color:#5a3a00;}\n  .cameo{\n    position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(80px);z-index:40;\n    background:rgba(20,15,10,.92);color:#f0dfae;border:1px solid rgba(233,180,76,.4);border-radius:16px;\n    padding:12px 22px;font-size:14px;max-width:88vw;text-align:center;opacity:0;transition:.45s;line-height:1.9;\n  }\n  .cameo.show{opacity:1;transform:translateX(-50%) translateY(0);}\n  .cameo b{color:var(--gold);}\n\n  /* ============ 升级仪式 ============ */\n  #levelup{background:radial-gradient(circle at 50% 40%,#2a2115,#120d08 75%);color:var(--paper);justify-content:center;text-align:center;}\n  .lu-pen{animation:luRise 1.4s cubic-bezier(.3,0,.2,1) both;transform-origin:center;}\n  @keyframes luRise{from{transform:translateY(70px) scale(.4);opacity:0;}to{transform:none;opacity:1;}}\n  .lu-poem{font-family:\"STKaiti\",\"KaiTi\",serif;font-size:clamp(18px,3.6vw,26px);line-height:2.4;color:#f0dfae;\n    margin-top:26px;white-space:pre-line;animation:fadeUp 1s .8s both;}\n  .lu-title{font-size:30px;font-weight:900;letter-spacing:.2em;color:var(--gold);margin-top:8px;animation:fadeUp .8s .3s both;}\n  .burst{position:absolute;left:50%;top:38%;width:10px;height:10px;border-radius:50%;background:#fff;\n    transform:translate(-50%,-50%);opacity:0;pointer-events:none;}\n  .burst.go{animation:boom2 1s ease-out forwards;}\n  @keyframes boom2{0%{opacity:1;box-shadow:0 0 20px 12px #fff;}100%{opacity:0;box-shadow:0 0 140px 80px rgba(233,180,76,0);}}\n\n  /* ============ 玉笔殿 / 决战 ============ */\n  #jade{background:linear-gradient(180deg,#0d1a16 0%,#12251e 55%,#1d3a2e 100%);color:var(--paper);padding:6vh 4vw 8vh;}\n  .jade-hall{text-align:center;max-width:640px;}\n  .jade-pen-big{width:34px;height:130px;margin:26px auto 10px;}\n  .jade-quote{font-family:\"STKaiti\",\"KaiTi\",serif;color:#bfe9d4;font-size:15px;line-height:2.2;margin-top:14px;}\n  .duel-modes{display:flex;gap:16px;justify-content:center;margin-top:30px;flex-wrap:wrap;}\n  #duel{background:linear-gradient(180deg,#0d1a16,#1d3a2e);color:var(--paper);padding:3vh 4vw 8vh;}\n  .hp-row{display:flex;align-items:center;justify-content:space-between;width:min(760px,94vw);margin-bottom:20px;gap:14px;flex-wrap:wrap;}\n  .fighter{text-align:center;flex:1;min-width:150px;}\n  .fighter .fname{font-family:\"STKaiti\",\"KaiTi\",serif;font-size:18px;letter-spacing:.1em;}\n  .hp-bar{height:14px;background:rgba(255,255,255,.15);border-radius:10px;overflow:hidden;margin-top:8px;}\n  .hp-bar i{display:block;height:100%;background:linear-gradient(90deg,#e74c3c,#ff8fa3);transition:width .5s;}\n  .hp-bar.mine i{background:linear-gradient(90deg,#2a9d8f,#7ee2b8);}\n  .vs{font-family:\"STKaiti\",\"KaiTi\",serif;color:var(--gold);font-size:26px;}\n  .duel-q{width:min(760px,94vw);}\n  .duel-timer{height:8px;background:rgba(255,255,255,.15);border-radius:6px;overflow:hidden;margin:12px 0 18px;}\n  .duel-timer i{display:block;height:100%;background:var(--gold);transition:width 1s linear;}\n  .foe-bubble{\n    margin:14px auto 0;width:fit-content;max-width:90vw;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.2);\n    border-radius:14px;padding:10px 20px;font-size:14px;font-family:\"STKaiti\",\"KaiTi\",serif;min-height:24px;line-height:1.9;\n  }\n  .pass-device{width:min(560px,92vw);text-align:center;background:rgba(255,255,255,.08);border-radius:18px;padding:26px 22px;margin:14px 0 20px;}\n  .pass-device h3{font-family:\"STKaiti\",\"KaiTi\",serif;color:var(--gold);font-size:20px;margin-bottom:10px;}\n\n\n  /* ============ 你问虎答 ============ */\n  #ask{background:radial-gradient(circle at 50% 12%,#2a221a,#14100b 72%);color:var(--paper);padding:3vh 4vw 7vh;}\n  .ask-head{width:min(760px,94vw);display:flex;align-items:center;gap:14px;margin-bottom:16px;flex-wrap:wrap;}\n  .tiger{width:56px;height:56px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;\n    font-size:32px;background:radial-gradient(circle at 34% 30%,#ffe9b8,#e0a53c);\n    box-shadow:0 0 22px rgba(233,180,76,.55);}\n  .ask-head h2{font-family:\"STKaiti\",\"KaiTi\",serif;font-size:24px;letter-spacing:.16em;color:var(--gold);}\n  .ask-head p{font-size:12px;color:#bda98a;margin-top:4px;letter-spacing:.06em;}\n  .ask-note{width:min(760px,94vw);font-size:11.5px;color:#8e7b60;line-height:1.9;margin-bottom:14px;}\n  .chat{width:min(760px,94vw);display:flex;flex-direction:column;gap:14px;min-height:200px;}\n  .msg{display:flex;gap:10px;align-items:flex-start;animation:fadeUp .4s ease;}\n  .msg .who{width:38px;height:38px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:21px;\n    background:radial-gradient(circle at 34% 30%,#ffe9b8,#e0a53c);box-shadow:0 0 12px rgba(233,180,76,.4);}\n  .bubble{max-width:min(560px,80vw);padding:14px 20px;border-radius:18px;font-size:15px;line-height:2;\n    font-family:\"STKaiti\",\"KaiTi\",serif;letter-spacing:.02em;}\n  .msg.tiger-side .bubble{background:linear-gradient(#f8f0da,#efe0bb);color:#3d3220;border-top-left-radius:6px;box-shadow:0 8px 22px rgba(0,0,0,.3);}\n  .msg.me-side{flex-direction:row-reverse;}\n  .msg.me-side .who{background:linear-gradient(#6b4f2a,#3d2c14);color:#ffe9b8;font-size:18px;}\n  .msg.me-side .bubble{background:rgba(255,255,255,.1);color:#f0e6d2;border-top-right-radius:6px;border:1px solid rgba(255,255,255,.14);}\n  .ask-input{width:min(760px,94vw);display:flex;gap:10px;margin-top:18px;}\n  .ask-input input{flex:1;padding:14px 18px;border-radius:14px;border:1px solid rgba(233,180,76,.35);\n    background:rgba(255,255,255,.06);color:#f7ecd6;font-family:inherit;font-size:15px;outline:none;}\n  .ask-input input::placeholder{color:#9d8a6c;}\n  .ask-input input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(233,180,76,.18);}\n  .chips{width:min(760px,94vw);display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}\n  .chip{background:rgba(233,180,76,.12);border:1px solid rgba(233,180,76,.35);color:#f2ddaa;\n    font-size:12.5px;padding:7px 14px;border-radius:20px;cursor:pointer;transition:.18s;font-family:inherit;}\n  .chip:hover{background:rgba(233,180,76,.28);transform:translateY(-2px);}\n  .typing{display:inline-flex;gap:5px;align-items:center;height:20px;}\n  .typing i{width:7px;height:7px;border-radius:50%;background:#a98b4e;animation:tdot 1.1s infinite;}\n  .typing i:nth-child(2){animation-delay:.18s;} .typing i:nth-child(3){animation-delay:.36s;}\n  @keyframes tdot{0%,100%{opacity:.3;transform:translateY(0);}50%{opacity:1;transform:translateY(-4px);}}\n  .ask-actions{width:min(760px,94vw);display:flex;justify-content:space-between;margin-top:20px;gap:12px;flex-wrap:wrap;}\n\n  /* ============ 证书 ============ */\n  #cert{background:radial-gradient(circle at 50% 25%,#33270f,#151006 75%);color:var(--paper);justify-content:center;padding:5vh 4vw;}\n  .cert-scroll{\n    width:min(640px,94vw);background:linear-gradient(160deg,#fbf3dc,#efe0ba);color:#4a3a10;border-radius:16px;\n    padding:44px 36px;box-shadow:0 0 70px rgba(233,180,76,.45),var(--shadow);text-align:center;position:relative;overflow:hidden;\n  }\n  .cert-scroll::before{content:\"\";position:absolute;inset:12px;border:2px solid #b07d2b;border-radius:10px;pointer-events:none;}\n  .cert-scroll .crown{font-size:52px;filter:drop-shadow(0 0 16px rgba(255,209,102,.9));}\n  .cert-scroll h2{font-family:\"STKaiti\",\"KaiTi\",serif;font-size:34px;letter-spacing:.24em;color:#8a5a00;margin:12px 0 6px;}\n  .cert-scroll .who{font-size:16px;font-family:\"STKaiti\",\"KaiTi\",serif;margin-bottom:18px;}\n  .cert-scroll p{font-size:14px;line-height:2.2;color:#5f4a1e;}\n  .secret-code{\n    font-size:24px;font-weight:900;letter-spacing:.3em;color:#8a2f1f;background:rgba(192,57,43,.1);\n    border:1px dashed #c0392b;border-radius:10px;padding:10px 18px;display:inline-block;margin:14px 0 6px;font-family:\"Courier New\",monospace;\n  }\n  .cert-seal{position:absolute;right:30px;bottom:44px;width:72px;height:72px;border:3px solid var(--seal);color:var(--seal);\n    border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:\"STKaiti\",\"KaiTi\",serif;\n    font-size:14px;transform:rotate(10deg);line-height:1.5;text-align:center;opacity:.9;}\n  /* ============ 笔勋章 ============ */\n  #medal{background:radial-gradient(circle at 50% 18%,#3a2c12,#140f07 78%);color:var(--paper);justify-content:center;padding:4vh 4vw;}\n  .medal-scroll{width:min(640px,100%);background:linear-gradient(160deg,#fbf3dc,#efe0ba);color:#4a3a10;border-radius:16px;\n    padding:22px 20px 24px;box-shadow:0 0 70px rgba(233,180,76,.38),var(--shadow);position:relative;}\n  .medal-scroll::before{content:\"\";position:absolute;inset:9px;border:1px solid rgba(176,125,43,.5);border-radius:11px;pointer-events:none;}\n  .medal-scroll h2{font-family:\"STKaiti\",\"KaiTi\",serif;font-size:26px;letter-spacing:.28em;color:#8a5a00;text-align:center;margin:2px 0 8px;}\n  .md-tip{text-align:center;font-size:12px;color:#8a5a00;letter-spacing:.1em;margin:0 0 12px;font-weight:800;opacity:.85;}\n  .md-img{width:100%;border-radius:12px;display:block;box-shadow:0 10px 26px rgba(74,58,16,.24);}\n  .md-copy{font-size:12.8px;line-height:1.95;color:#4a3a10;background:rgba(176,125,43,.1);\n    border:1px dashed rgba(176,125,43,.55);border-radius:12px;padding:12px 14px;margin:12px 0;}\n  .md-loading{text-align:center;color:#6b5220;font-size:13.5px;padding:46px 0;letter-spacing:.1em;}\n  /* —— 一键发朋友圈：三步指引（宣纸风） —— */\n  .mg-mask{position:fixed;inset:0;z-index:90;background:rgba(52,38,16,.6);-webkit-backdrop-filter:blur(3px);\n    backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px;\n    animation:mgIn .2s ease both;}\n  @keyframes mgIn{from{opacity:0}to{opacity:1}}\n  .mg-box{width:100%;max-width:358px;background:#fdf6e6;border:1px solid rgba(176,125,43,.65);\n    border-radius:16px;padding:22px 20px 18px;box-shadow:0 24px 56px rgba(60,40,8,.45);\n    animation:mgUp .26s cubic-bezier(.22,1.2,.4,1) both;}\n  @keyframes mgUp{from{transform:translateY(20px) scale(.96);opacity:0}to{transform:none;opacity:1}}\n  .mg-t{font-family:\"STKaiti\",\"KaiTi\",serif;font-size:19px;color:#7a4a00;letter-spacing:.16em;\n    text-align:center;margin-bottom:14px;font-weight:800;}\n  .mg-steps{margin:0;padding:0;list-style:none;counter-reset:mg;}\n  .mg-steps li{counter-increment:mg;position:relative;padding-left:30px;font-size:13.5px;line-height:1.85;\n    color:#4a3a10;margin-bottom:10px;}\n  .mg-steps li::before{content:counter(mg);position:absolute;left:0;top:2px;width:20px;height:20px;border-radius:50%;\n    background:rgba(176,125,43,.14);border:1px solid rgba(176,125,43,.6);color:#8a5a00;font-size:11.5px;\n    display:flex;align-items:center;justify-content:center;font-weight:800;}\n  .mg-steps li b{color:#0d6b4f;}\n  .mg-acts{display:flex;flex-direction:column;gap:9px;margin-top:16px;}\n  .mg-note{font-size:11.5px;color:#8b7346;line-height:1.8;margin-top:12px;text-align:center;}\n  /* —— 音效开关 —— */\n  #sfxBtn{\n    position:fixed;right:16px;bottom:22px;z-index:75;width:46px;height:46px;border-radius:50%;\n    border:1px solid rgba(233,180,76,.55);background:rgba(20,16,10,.72);color:#f0dfae;\n    font-size:20px;line-height:1;cursor:pointer;backdrop-filter:blur(6px);\n    box-shadow:0 6px 18px rgba(0,0,0,.35);transition:transform .18s,background .18s;\n  }\n  #sfxBtn:hover{transform:scale(1.08);background:rgba(233,180,76,.25);}\n\n  /* —— 课文人物随机表扬卡 —— */\n  .praise{\n    position:fixed;left:50%;bottom:34px;z-index:65;transform:translate(-50%,120px) scale(.9);\n    display:flex;align-items:center;gap:14px;max-width:min(520px,90vw);\n    padding:14px 22px 14px 16px;border-radius:20px;opacity:0;pointer-events:none;\n    background:linear-gradient(135deg,rgba(36,28,18,.96),rgba(56,42,24,.96));\n    border:1px solid rgba(233,180,76,.5);box-shadow:0 16px 44px rgba(0,0,0,.5),inset 0 0 24px rgba(233,180,76,.1);\n    transition:transform .45s cubic-bezier(.2,.9,.3,1.2),opacity .35s;\n  }\n  .praise.show{transform:translate(-50%,0) scale(1);opacity:1;}\n  .praise .avatar{\n    flex-shrink:0;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;\n    font-size:28px;background:radial-gradient(circle at 35% 30%,#f6e2b0,#c9a45c);color:#3a2a10;\n    box-shadow:0 0 18px rgba(233,180,76,.55);\n  }\n  .praise .pbody{text-align:left;}\n  .praise .pname{font-family:\"STKaiti\",\"KaiTi\",serif;font-size:15px;color:#ffd98a;letter-spacing:.1em;margin-bottom:3px;}\n  .praise .pline{font-family:\"STKaiti\",\"KaiTi\",serif;font-size:14.5px;line-height:1.75;color:#f3e7c9;}\n  .praise .pline em{color:#8fe6c4;font-style:normal;}\n\n  /* —— 连击火花 —— */\n  .combo-fx{position:fixed;left:50%;top:22%;transform:translate(-50%,0);z-index:64;pointer-events:none;\n    font-family:\"STKaiti\",\"KaiTi\",serif;font-size:clamp(26px,6vw,44px);font-weight:900;color:#ffd98a;\n    text-shadow:0 0 24px rgba(233,180,76,.9),0 4px 12px rgba(0,0,0,.5);opacity:0;}\n  .combo-fx.go{animation:comboPop .9s ease forwards;}\n  @keyframes comboPop{\n    0%{opacity:0;transform:translate(-50%,20px) scale(.6);}\n    35%{opacity:1;transform:translate(-50%,-6px) scale(1.12);}\n    75%{opacity:1;transform:translate(-50%,-10px) scale(1);}\n    100%{opacity:0;transform:translate(-50%,-34px) scale(.96);}\n  }\n  footer{width:100%;text-align:center;padding:22px;color:rgba(240,223,174,.55);font-size:12px;letter-spacing:.18em;line-height:2;}\n";document.head.appendChild(style);
document.body.innerHTML="\n\n<!--pnid:pvsIHJqn5vH394VTI28Gqo--><!-- ================= 彩蛋 ================= -->\n<section data-page-node-id=\"njJcFnzUTd6gr2XdfU6nvW\" class=\"screen active\" id=\"egg\">\n  <div data-page-node-id=\"z2kFfEWj9fQaA8oLH9Jmh9\" class=\"egg-box\">\n    <div data-page-node-id=\"eXxRGO6hfsVVAzXKw3mhkH\" class=\"blackbox\" id=\"blackBox\" title=\"点开黑色的盒子\"></div>\n    <div data-page-node-id=\"OCImn6pFbBkhRuktqs5tmh\" class=\"egg\" id=\"eggEl\" style=\"display:none\">\n      <span data-page-node-id=\"DZGKJqhhOGCrAz3tmMRH2U\" class=\"carve kai\"><!--pnid:gRGqO63i6zy49dhJRBNY6q-->鬼笔之魂</span>\n    </div>\n    <div data-page-node-id=\"6H2ZsiCcqg6fL8OEvwthta\" class=\"egg-hint\" id=\"eggHint\"><!--pnid:4Yv7xLmfGBrhvAJFF7dpWc-->四虎作品《少年笔侠》· 一个刻着四个字的彩蛋<br data-page-node-id=\"A7tz5wIx8OVLr7Fi3H8Xyu\"><!--pnid:8s27438KzpSDT8w5Hgylar-->👆 点开保密的黑盒子，再轻敲彩蛋三下</div>\n    <div data-page-node-id=\"8Rldtg8jxNBfjU44RLWbgB\" class=\"pw-row\" id=\"pwRow\" style=\"display:none\">\n      <input data-page-node-id=\"CP5lMbFnw2QIPecgXj6doo\" class=\"pw-input\" id=\"pwInput\" maxlength=\"10\" placeholder=\"答案两个字，填在这里\">\n      <button data-page-node-id=\"Mx1yfHQYjp0mBxj75Mp2jf\" class=\"btn btn-gold\" onclick=\"tryPassword()\"><!--pnid:pAq5ag73clUprFusj41Ouy-->登录</button>\n    </div>\n    <div data-page-node-id=\"XoG0V2MoUcZcCVL1bbwyQC\" id=\"loginTip\" style=\"display:none; margin:14px auto 0; max-width:540px; text-align:left; background:rgba(22,17,12,.78); border:1px solid rgba(233,180,76,.38); border-radius:14px; padding:14px 16px; font-size:13.5px; line-height:1.95; color:#e8dcc0; box-shadow:0 8px 26px rgba(0,0,0,.38)\">\n      <div data-page-node-id=\"1V43rSy7Z3e2TGJwdew3Ae\" style=\"color:#e9b44c; font-weight:700; letter-spacing:.06em; margin-bottom:6px\"><!--pnid:rGEW5xVUol36DdSqJUkzag-->🔑 登录提示 · 没读过原著也能进</div>\n      <div data-page-node-id=\"VlPmvSvoyzFTEy3Yv1l4jU\"><!--pnid:RjtnJi8t8taFEUKlPIlXpl-->这道小题的答案，就是密码（<b data-page-node-id=\"jpWUm3GwBtGlx9SoKjpKW4\" style=\"color:#e9b44c\"><!--pnid:rcE83yH7lo32WtUCdEMwAp-->两个字</b><!--pnid:2gYim40hCHEwx6r6iCIXIa-->）：</div>\n      <div data-page-node-id=\"JTKYbP9i52vkYKxFSnx84U\" style=\"margin:9px 0; padding:9px 12px; background:rgba(233,180,76,.1); border-left:3px solid #e9b44c; border-radius:6px; color:#f6eed8; font-family:'STKaiti','KaiTi',serif; font-size:16.5px\"><!--pnid:nARpagy2RLuUhHClB6d4fY-->「鸟宿池边树，僧敲月下门」——这句诗的作者是谁？</div>\n      <div data-page-node-id=\"prXBCdhx1eB3D7yRCoezkL\" style=\"color:#c6b9a0; font-size:12.5px\"><!--pnid:Q8HWCw5VLCx2K9fY5wV87Z-->想不起来？他当年为一个「推」字、一个「敲」字斟酌了半天，「推敲」这个词就是从他那儿来的。<br data-page-node-id=\"WBIPFTB8U714ETSpkjNvaL\"><!--pnid:fFUKh79EHdpa5cNuoC1bTd-->他写过「十年磨一剑」，是唐代一位苦吟诗人。</div>\n      <div data-page-node-id=\"OjBaoe6KLwqNx29Y2k83sg\" style=\"margin-top:10px; display:flex; gap:10px; flex-wrap:wrap\">\n        <button data-page-node-id=\"WStd0w6YaNQpFXAu6l8rgG\" onclick=\"fillPw()\" style=\"background:transparent; border:1px dashed rgba(233,180,76,.65); color:#e9b44c; border-radius:999px; padding:7px 16px; font-size:13px; cursor:pointer\"><!--pnid:YMG5Rvt0gqbvfXZtBrlLkN-->还是想不出来？点这里直接进 →</button>\n        <button data-page-node-id=\"BDchqcvhwfHkghKxf3eYBY\" onclick=\"hintAgain()\" style=\"background:transparent; border:1px dashed rgba(240,223,174,.35); color:#c6b9a0; border-radius:999px; padding:7px 16px; font-size:13px; cursor:pointer\"><!--pnid:0U9H2kiY3NFGWPWTkkKElB-->再给一点提示</button>\n      </div>\n    </div>\n    <div data-page-node-id=\"GpkY2Yk6S4X9IcOKgL3bui\" class=\"pw-msg\" id=\"pwMsg\"></div>\n    <div data-page-node-id=\"KpLcpsCkZqxAflQNO6QUf9\" class=\"intro-note\"><!--pnid:zaRfMskBSWyjhw52aWfC2H-->\n      在《少年笔侠》原著里，<b data-page-node-id=\"r1eHURDRuSYjsk8m7ZoKBu\"><!--pnid:0D2NN7aSDe6Iw8HeIKr833-->《鬼笔之魂》</b><!--pnid:6DYrdSzBoJDkYQq0PQPIUZ-->曾是黑老板设下的陷阱——它偷偷帮人答题，让少年们失去真正的本领。<br data-page-node-id=\"SRYeHx9esfZ09viJ6cwAVv\"><!--pnid:DWEigEyGDhaBVU44WKRNtX-->\n      现在，这个游戏<b data-page-node-id=\"CcU9mIf1BBlSkDUFq2I3ll\"><!--pnid:zAiTYEXyKxtdlXT41EmK52-->是一座真正的试炼场</b><!--pnid:6UGfusXCfO4TcD0UzfwDr3-->：不替你写一个字，只考你小学语文的真功夫。<br data-page-node-id=\"r0EzJRJLaazI6hLcStcWvw\"><!--pnid:19y85QDV2wwN4oN0X9fNcC-->\n      背好诗词、练好笔力，从<b data-page-node-id=\"FPKVJ20beINv2CJvYcI1I9\"><!--pnid:adCM9WokCdXX2uStReTPOW-->土笔</b><!--pnid:VhbGldRlQpHUz1DV95HRTc-->一路升到<b data-page-node-id=\"xtbYjJ3Xner5MfNBPJaTIi\"><!--pnid:CHEkCQTnImRWy9lJP5Bwro-->玉笔</b><!--pnid:q8I3CtQY8oI7s9oriNJnik-->，到山顶争夺<b data-page-node-id=\"e6MBk1eOxp7Mm2U9V1dxmr\"><!--pnid:pV8Xs5S9NfwZaEksHnKQZ7-->鬼笔王</b><!--pnid:QY8zg0r1t0S43JOyO5cDPz-->！\n    </div>\n    <div data-page-node-id=\"WIugVuWUwtNqaaIeDvFeqP\" style=\"margin:16px auto 0; max-width:560px; text-align:center; font-size:12.5px; line-height:1.9; color:rgba(240,223,174,.62); border-top:1px solid rgba(240,223,174,.16); padding-top:12px\"><!--pnid:AeZ6lrN5UjqRSrJODFdjrU-->\n      本游戏根据四虎作品《少年笔侠》改编而成。<br data-page-node-id=\"8AZWMIWZkFicgkYYRTa7OD\">\n      <b data-page-node-id=\"0IsGzbVpVSkE3bUFDrBI9s\" style=\"color:rgba(240,223,174,.9)\"><!--pnid:8rRLCX6yhKh8WxnR2uSHmS-->没有读过原著，也不影响进入游戏</b><!--pnid:D9MMvF2bxCTwP05xKIpedM-->——每一关都有文字提示，跟着提示走就行。欢迎！\n    </div>\n  </div>\n</section>\n\n<!--pnid:b2VPgtbYVGWozPPPA6d8SA--><!-- ================= 承诺书 ================= -->\n<section data-page-node-id=\"tNaP6PKUFaqmv5CWxpJUsW\" class=\"screen\" id=\"pledge\">\n  <div data-page-node-id=\"P3uS1TEb3UfI5LhdDPqaHN\" class=\"scroll\">\n    <h2 data-page-node-id=\"9M0o7zWOHIMIFqObzubYag\"><!--pnid:FL7vjrGFQXAb1cW08Gah8U-->承 诺 书</h2>\n    <p data-page-node-id=\"REUbrNtdAHDhrh0bW2UNyA\"><!--pnid:zo8zJ3cMInVtuL1reYQKMq-->一、我承诺<b data-page-node-id=\"gAHK51Hjocvs5fTd9peBVD\"><!--pnid:PtcEt1D5icQPpkNvKDBsv9-->诚实作答</b><!--pnid:jCGMnMnNhiifQNzR9ApYbL-->，不用任何外挂，也不让无敌玉笔替我写答案——因为真正的功夫要长在自己身上。</p>\n    <p data-page-node-id=\"TdNFaEt4GXv6AfagilZldu\"><!--pnid:tUrFWMaBd8jB5EojnLSvRV-->二、答错了不气馁，把每一道错题变成升级的燃料。</p>\n    <p data-page-node-id=\"xqxZJG2okIZ1YEuQSpjJO1\"><!--pnid:dXrg4BzZI8PmwaJ2fQYsdL-->三、我愿意把学语文的快乐，<b data-page-node-id=\"ASHIJyBB6MCu7jl2KZuCyH\"><!--pnid:CLAhxKDdV0dEnbHgDqY7o2-->分享给爸爸妈妈</b><!--pnid:a2u8Ko63oL4fjza0zqxPGh-->（这条恰好和原著相反 😉）。</p>\n    <div data-page-node-id=\"Z4VA64M31BozcpbBRK7NXt\" class=\"seal-stamp\"><!--pnid:UulZZlsUOZdeWpYW0Y88ps-->鬼笔<br data-page-node-id=\"nFCpTL1jfgB8z3Ht4ADuwb\"><!--pnid:sXTnzYy10DyPGJ7FO8uTqO-->之魂</div>\n    <input data-page-node-id=\"kLFQYFjVwV475w6hJvSwnW\" class=\"name-input\" id=\"heroName\" maxlength=\"8\" placeholder=\"报上你的笔侠名号（如：隐者）\">\n    <div data-page-node-id=\"GqO4cQxvY9kGxgZIiXFKBD\" class=\"btn-row\">\n      <button data-page-node-id=\"DboxyT5uHax7oWGX29ggcp\" class=\"btn btn-gold\" onclick=\"signPledge()\"><!--pnid:tU3T3guUJg6kR221GlEBwu-->✍ 按下笔印 · 进入试炼</button>\n    </div>\n  </div>\n</section>\n\n<!--pnid:yekN0uDPrOkhq553yNoOlu--><!-- ================= 山路地图 ================= -->\n<section data-page-node-id=\"g4ypcwFEoaaRJv93eihEcB\" class=\"screen\" id=\"map\">\n  <div data-page-node-id=\"0j7DA7CTpvIGyDdEfGDhvl\" class=\"map-title\">\n    <h2 data-page-node-id=\"77H9X1sN9AezbXz21dU1b1\"><!--pnid:wcjqoCnsqNPiJtswCuK5yt-->鬼笔试炼之路</h2>\n    <p data-page-node-id=\"bHRbqy7IuiVUr3m0Qo5RYC\" id=\"mapSub\"><!--pnid:QTh8YkpTwgqaNehiOqCVQF-->山谷的雾里传来爷爷的声音：「熟读唐诗三百首，不会作诗也会吟。」</p>\n    <div data-page-node-id=\"0MFhUiZbJSbJnDJz4ZGk6O\" id=\"mapPenSlot\" style=\"margin:14px auto 0\"></div>\n  </div>\n  <div data-page-node-id=\"3C0aztbpXaOE6nWuSvZC33\" class=\"path\" id=\"pathList\"></div>\n  <div data-page-node-id=\"bkmvN2Q9FXt1QpVUIsQkKp\" class=\"peak\"><!--pnid:zcZ1WtDUQPbwqS4cJvY4dJ-->⛰️</div>\n  <div data-page-node-id=\"1UNY3CMJPp267GJkTgpoEP\" class=\"peak-name\"><!--pnid:IPt20rTM1A69JI3mRhQUJU-->山顶 · 玉笔殿 · 鬼笔王之战</div>\n  <div data-page-node-id=\"WRdHh4yp0mEJLJoV1PgiUJ\" style=\"text-align:center; margin-top:18px\">\n    <button data-page-node-id=\"zTHDzkgWKnintX9RodLXOm\" class=\"btn btn-gold\" onclick=\"openAsk()\" style=\"font-size:15px; padding:12px 30px\"><!--pnid:wyFV0Ig6baQeiz5oy5btS2-->🐯 你问虎答 · 找虎叔聊聊</button>\n    <div data-page-node-id=\"BvhFJqqGmzpjQ2o5OXwHEh\" style=\"font-size:11.5px; color:#9fb0a3; margin-top:8px; letter-spacing:.06em\"><!--pnid:GXD880YxHS7vEic6hSPRSD-->童话里的事、写作文的难处、心里的疙瘩，都可以问</div>\n  </div>\n  <footer data-page-node-id=\"aleF80sBsAq9GGuREFg0xL\"><!--pnid:zg13P8YrkOnYcukloinlE4-->每一关连续答对 3 题即可升级 · 六级神笔对应小学六个年级</footer>\n</section>\n\n<!--pnid:vA3MKQwL5N358oB6Mh6iAY--><!-- ================= 答题 ================= -->\n<section data-page-node-id=\"EeaWVZaNvzt5wO6B2mgIf0\" class=\"screen\" id=\"quiz\">\n  <div data-page-node-id=\"ZQqkzP5XEu4tZSmcgCPYaw\" class=\"quiz-top\">\n    <span data-page-node-id=\"AyiDSR4tTxmN2ciOT5p1ot\" class=\"qchip\" id=\"qPenChip\"></span>\n    <span data-page-node-id=\"XQOLaGBIYcgLZbrYwgyFN0\" class=\"qchip\"><!--pnid:jynWJI5NViy1Nz6IbiDz1t-->连击 <span data-page-node-id=\"wlgMNXOx3vpFrQ6YbOuzrh\" class=\"streak-dots\" id=\"streakDots\"><i data-page-node-id=\"Mdremi4FU7yxSaiX46p2va\"></i><i data-page-node-id=\"q2zbpqPIZDPpNf81F1A2bV\"></i><i data-page-node-id=\"u9pAmJydw5gGmA5vORGshs\"></i></span></span>\n    <button data-page-node-id=\"dKjGmUiCn29lelSBtsLiyD\" class=\"btn btn-mini\" onclick=\"useJinnang()\"><!--pnid:Srrt60W0Uga14eeKjkGjww-->🧿 锦囊妙计 ×<span data-page-node-id=\"dMaMSD9TG582hgxpgC9lOr\" id=\"jnCount\"><!--pnid:y8NeuikMvTXCXMQLhgjIOy-->2</span></button>\n    <button data-page-node-id=\"ZSWr8GsNIFjiI8iiWvXb5a\" class=\"btn btn-mini\" onclick=\"useLei()\"><!--pnid:OtO3XVA1CZQCt2YoDfbUah-->⚡ 雷神咒 ×<span data-page-node-id=\"JFWYBjhgzuQlXElWVsw1dy\" id=\"leiCount\"><!--pnid:m7BPDzHXyeGboFJqQRMEVf-->1</span></button>\n    <button data-page-node-id=\"g0n7peU1dN0WEZszGXEW8O\" class=\"btn btn-mini\" onclick=\"go('map')\"><!--pnid:XGXqaapSsrI6QHlL0e6RmM-->暂回山路</button>\n  </div>\n  <div data-page-node-id=\"3sBunpi2pr0Xt2fpoImQRB\" class=\"quiz-card\">\n    <div data-page-node-id=\"fJl8SNOk1u9XVSxjD7bIuX\" class=\"scene\" id=\"qScene\"></div>\n    <h3 data-page-node-id=\"50TGFDMNZb7akoz1XVM7aA\" id=\"qText\"></h3>\n    <div data-page-node-id=\"PZIMwScPnbDZi71oP5bl4Q\" class=\"opts\" id=\"qOpts\"></div>\n    <div data-page-node-id=\"1CGZ7V9YF44nwE8SnalbXp\" class=\"verdict-line\" id=\"qVerdict\"></div>\n    <div data-page-node-id=\"9gJrTsUIzauJ2AAeaeJzRx\" class=\"quiz-foot\" id=\"qFoot\"></div>\n  </div>\n</section>\n\n<!--pnid:OV8zIQpvClVM3Ss4gtCbiC--><!-- ================= 升级仪式 ================= -->\n<section data-page-node-id=\"QN4VQZBP8LTELd7sVA0A5n\" class=\"screen\" id=\"levelup\">\n  <div data-page-node-id=\"1zyZ7rzxAEHtis3s2LZEaj\" style=\"position:relative\">\n    <div data-page-node-id=\"IHwc20LJgv9aTw2p1wuK6W\" class=\"burst\" id=\"luBurst\"></div>\n    <div data-page-node-id=\"odlnGB6J7ipUhDcWNWdsT3\" class=\"pen lu-pen\" id=\"luPen\" style=\"margin-top:40px\"></div>\n  </div>\n  <div data-page-node-id=\"QzUd65V0XJXiODMq28PXy4\" class=\"lu-title\" id=\"luTitle\"></div>\n  <div data-page-node-id=\"Ia5ndDPKm1PiTgol3PRQhn\" class=\"lu-poem kai\" id=\"luPoem\"></div>\n  <div data-page-node-id=\"p2nXEB9EVCKV9KT0EvMY5O\" style=\"margin-top:34px\"><button data-page-node-id=\"4quh4bbFPHiNjeUN5PnTZ7\" class=\"btn btn-gold\" id=\"luBtn\" onclick=\"afterLevelUp()\"><!--pnid:nsjKx8U8oP10FSEtNolymq-->继续攀登 ⛰️</button></div>\n</section>\n\n<!--pnid:WQnaHLAzE4ZcdBImTyYq0c--><!-- ================= 玉笔殿 ================= -->\n<section data-page-node-id=\"fIWXynxITJJGjP1TvqhXSk\" class=\"screen\" id=\"jade\">\n  <div data-page-node-id=\"eQt4S8r409LT3MHthJygKq\" class=\"jade-hall\">\n    <h2 data-page-node-id=\"lDO3sXWVjcJhvSyXMNnNix\" class=\"kai\" style=\"font-size:clamp(24px,4.5vw,32px); letter-spacing:.24em; color:var(--jade); text-shadow:0 0 24px rgba(87,196,163,.6)\"><!--pnid:vm7cYT5zfxomZdNMuLTsgO-->玉 笔 殿</h2>\n    <div data-page-node-id=\"IdogQ47AhO9E31m8gETIsi\" class=\"pen g6 jade-pen-big\"></div>\n    <p data-page-node-id=\"knKqpLL4B4WwHZNYQQvIVE\" class=\"jade-quote\"><!--pnid:jK14BengEnqtCesUakFAMR-->盆地中央，无敌玉笔闪闪发光，黑狼在旁虎视眈眈。<br data-page-node-id=\"AHXGxbsRBkspqDiiksljZD\"><!--pnid:0Keo1nX4dLTlZJfQzOOCoo-->\n    按照原著的规矩：决战者可选一名助手随行。<br data-page-node-id=\"nHFzr2IlPPSWAcdlsZHjCl\"><!--pnid:0hDYrZVandTm2FHDcrqUJP-->「远处的记者们已就位——本届鬼笔王，即将诞生。」</p>\n    <div data-page-node-id=\"rVBvSA3ftGhyT5CE9akuDQ\" style=\"margin:22px 0 4px\">\n      <b data-page-node-id=\"jwNVUk0T7nR3KVWqvqmmSq\" class=\"kai\" style=\"color:var(--gold); font-size:16px\"><!--pnid:OV2337XUoUxX304f1Wo7Ur-->选择你的助手（各带一次绝技）：</b>\n    </div>\n    <div data-page-node-id=\"ziBNFO8gwY5akNjPpGvDfe\" class=\"duel-modes\" id=\"helperRow\"></div>\n    <div data-page-node-id=\"BSoyBEzE0L33nMhSwgOElT\" class=\"duel-modes\" style=\"margin-top:34px\">\n      <button data-page-node-id=\"rHusEMjtPs6bhSV6jX96PJ\" class=\"btn btn-gold\" id=\"aiDuelBtn\" onclick=\"startDuel('ai')\"><!--pnid:P4EVpJWXhP5VEc6QgSdwDn-->⚔ 等待对手出现 · 大决战</button>\n      <button data-page-node-id=\"Ji10XAR0flCqCqbNTTiPQe\" class=\"btn btn-dark\" onclick=\"startDuel('pvp')\"><!--pnid:DJ2MGKGqLi35WvVQ2w4K6n-->👥 邀请朋友 · 同屏对战</button>\n    </div>\n  </div>\n</section>\n\n<!--pnid:ikTbJWPszGtXriaTQn0Akh--><!-- ================= 大决战 ================= -->\n<section data-page-node-id=\"iQSRULiuMaQ2KpS8NdgVuj\" class=\"screen\" id=\"duel\">\n  <div data-page-node-id=\"bJqvz4A5ehDF90mcb9lcUA\" class=\"hp-row\">\n    <div data-page-node-id=\"39mo7sI3LTu1eOyT6HQFCW\" class=\"fighter\">\n      <div data-page-node-id=\"98U4izeaYlhMpYkhYct3MO\" class=\"fname\" id=\"meFName\"><!--pnid:oowyx9rQV2hjB1zNzW1MRS-->隐者</div>\n      <div data-page-node-id=\"eethypD7zF59O3HHREOxoY\" class=\"hp-bar mine\"><i data-page-node-id=\"mTdQfGrQ8Ccao3afijpeWJ\" id=\"meHp\" style=\"width:100%\"></i></div>\n    </div>\n    <div data-page-node-id=\"Frxve5Ln1DdFbI9c55skav\" class=\"vs\"><!--pnid:8ya89ygrVfP8bKvgRX08gp-->笔 力 相 搏</div>\n    <div data-page-node-id=\"BebpRvff6AE36hcEWo7etk\" class=\"fighter\">\n      <div data-page-node-id=\"hedCMekp8Cv1pePj5SwXU8\" class=\"fname\" id=\"foeFName\"><!--pnid:PS4ehzdY6DhvtreInLT23Q-->黑石</div>\n      <div data-page-node-id=\"k28aw7Vtf3HkUPb2XJbVmV\" class=\"hp-bar\"><i data-page-node-id=\"fzEEkFohDtuqWMgYCUqKRG\" id=\"foeHp\" style=\"width:100%\"></i></div>\n    </div>\n  </div>\n  <div data-page-node-id=\"3z5ksIp1KtM1MhRSklAuzJ\" class=\"pass-device\" id=\"passBox\" style=\"display:none\">\n    <h3 data-page-node-id=\"bKNszz8008pCK9Wgl6zU80\" id=\"passTitle\"></h3>\n    <p data-page-node-id=\"kg5fsDXLNxjHfW3815847q\" id=\"passText\" style=\"font-size:13.5px; line-height:2; color:#cfe6d8\"></p>\n    <button data-page-node-id=\"vbQ8V1EXyrF3YF5KS4ePWR\" class=\"btn btn-gold\" id=\"passBtn\" onclick=\"passNext()\" style=\"margin-top:12px\"><!--pnid:e5wh4PgcyL4QP33o8HvUNe-->准备好了 · 开始</button>\n  </div>\n  <div data-page-node-id=\"cG6rBtu8WSMW1vaPr1Qwps\" class=\"duel-q\" id=\"duelQ\" style=\"display:none\">\n    <div data-page-node-id=\"FKV6wXnVRjXr34obPN9NEG\" class=\"quiz-card\">\n      <div data-page-node-id=\"uatQZvlvhl5WBMT2p4bQCw\" class=\"scene\" id=\"dScene\"><!--pnid:rc1qZZwCfDRvGTKjGIOK7s-->山顶 · 大决战</div>\n      <h3 data-page-node-id=\"ppIoF15qDugYsWRFz5gDLi\" id=\"dText\"></h3>\n      <div data-page-node-id=\"3y0daK2arU2S2Pg99pHxuv\" class=\"duel-timer\"><i data-page-node-id=\"AwIEfQpZYSjJpkzAQezsPb\" id=\"dTimer\"></i></div>\n      <div data-page-node-id=\"qhzI05xQywfPHRYAONRgj4\" class=\"opts\" id=\"dOpts\"></div>\n      <div data-page-node-id=\"szEkt99576SlxjTrtiCBnK\" class=\"verdict-line\" id=\"dVerdict\"></div>\n      <div data-page-node-id=\"l5oBteJvc2gZZnWfeGLyMg\" class=\"quiz-foot\" id=\"dFoot\"></div>\n    </div>\n    <div data-page-node-id=\"Fx16TXcSl0Hze1NTg1pQDp\" class=\"foe-bubble kai\" id=\"foeBubble\"><!--pnid:XSmWpb5iqNfAAZKtln0hAd-->……</div>\n  </div>\n</section>\n\n<!--pnid:1dCEwNKDP4SqMNBhBC5bxn--><!-- ================= 你问虎答 ================= -->\n<section data-page-node-id=\"7cQImfMI5vYpxdTMASVhvX\" class=\"screen\" id=\"ask\">\n  <div data-page-node-id=\"nPPfIrp5ImkgZ7oyZmWvZu\" class=\"ask-head\">\n    <div data-page-node-id=\"r4F1jrW8aTxxBLXkIATCJs\" class=\"tiger\"><!--pnid:9pEyN70oiqb1LsXr4MI3H0-->🐯</div>\n    <div data-page-node-id=\"xmHSCKFhkNDo3cAsDCZUO0\">\n      <h2 data-page-node-id=\"r6X4b5QuAfB3F2TKbzxMXf\" class=\"kai\"><!--pnid:kcLC5cGj2ZuL0RE4ARVWYF-->你 问 虎 答</h2>\n      <p data-page-node-id=\"sFlMQEOYSeQoH5u73iyj0r\"><!--pnid:hatvwWiVcY1umVpCb8vswk-->四虎在这儿等着小朋友提问 · 关于童话、关于写作、关于长大</p>\n    </div>\n  </div>\n  <div class=\"ask-note\">💡 根据内置知识库和关键词匹配模拟回答，并非作者本人；拿不准的事，以书里写的为准。</div>\n  <div data-page-node-id=\"ynTtEYHqYsj9Ve9wzLGab9\" class=\"chat\" id=\"chat\"></div>\n  <div data-page-node-id=\"HfvMym4FiSkkoR9lR095p7\" class=\"chips\" id=\"chips\"></div>\n  <div data-page-node-id=\"wpny9EE0Dg6hPw53xu44AC\" class=\"ask-input\">\n    <input data-page-node-id=\"smUSJFL1GElTawwSnQwG37\" id=\"askInput\" maxlength=\"60\" placeholder=\"想问虎叔什么？比如：布巴为什么会变成两半？\">\n    <button data-page-node-id=\"NaUdfHgpvY8CF8IhLZjDzE\" class=\"btn btn-gold\" onclick=\"askHǔ()\" style=\"padding:14px 26px; font-size:15px\"><!--pnid:hO6jv53vVCmeGfPS0YY7cx-->问虎叔</button>\n  </div>\n  <div data-page-node-id=\"0z8V8vVHLy5OfSwFC7ImfX\" class=\"ask-actions\">\n    <button data-page-node-id=\"ZZ2fWF1OFiRnArGpduFrOb\" class=\"btn btn-dark\" onclick=\"go('map')\"><!--pnid:WCXxHeUDkUh1rDd2K8yPn4-->← 回山路</button>\n    <button data-page-node-id=\"mvDdTmY2K58C0E9jy6fHMA\" class=\"btn btn-dark\" onclick=\"chatReset()\"><!--pnid:Xalrma2XY91WoSVGCFvVWk-->重新开始聊</button>\n  </div>\n</section>\n\n<!--pnid:sROIEvQ0o8lDWednOchPyL--><!-- ================= 证书 ================= -->\n<section data-page-node-id=\"5y4FHSaGKHkI2BcdQN2yn4\" class=\"screen\" id=\"cert\">\n  <div data-page-node-id=\"xe4B7JLyNTcblwC6eywB3Z\" class=\"cert-scroll\">\n    <div data-page-node-id=\"beQQmvwFXUzwutJKKAo0Rc\" class=\"crown\"><!--pnid:IogiwmdqtuCjid23xvSZFu-->👑</div>\n    <h2 data-page-node-id=\"Z8q9n14cM0Km3Z2jPsbCsQ\" class=\"kai\"><!--pnid:GDKn328KHTCXEtcKoCfTsW-->鬼 笔 王 证 书</h2>\n    <div data-page-node-id=\"e73taOPtRUptU0zg6a6JrM\" class=\"who kai\" id=\"certWho\"></div>\n    <p data-page-node-id=\"oYLNVT2w2x6bRVmQ9D9Qkc\" id=\"certBody\"></p>\n    <div data-page-node-id=\"QSSQuqgZgYRZ186Sh4ytrx\" class=\"secret-code\" id=\"certCode\"></div>\n    <p data-page-node-id=\"CWiWfIz4vWTywuHoLF1ryj\" style=\"font-size:12.5px\"><!--pnid:9VXzS7sK5TXnmL6LBg39SP-->（王者暗号 · 请截图保存）</p>\n    <div data-page-node-id=\"ZFbG9MzgDqPQfWBGYbnndc\" class=\"cert-seal\"><!--pnid:dFOfonreldakUhg3FYyFvc-->鬼笔<br data-page-node-id=\"4kYcJxvsDL1qykkXIYdqPa\"><!--pnid:geiPTEovRX8I3SEi6HcWu7-->之魂</div>\n    <div data-page-node-id=\"ehv3xs97q82MkxdXAbrAT5\" style=\"margin-top:26px; display:flex; gap:14px; justify-content:center; flex-wrap:wrap\">\n      <button data-page-node-id=\"dULogi5VLnZRRfbl6lC8tZ\" class=\"btn btn-gold\" onclick=\"openPenCard()\" style=\"font-size:14px; padding:12px 24px\"><!--pnid:95SLuLYQS60WpK8RfU03kR-->📜 生成我的笔勋章</button>\n      <button data-page-node-id=\"JzithRQq6UYnxQWuepSCzs\" class=\"btn btn-gold\" onclick=\"openAsk()\" style=\"font-size:14px; padding:12px 24px\"><!--pnid:gNkkNOxHDoHSn830Jl3Ftl-->🐯 问虎叔一个问题</button>\n      <button data-page-node-id=\"s5KG2hOgaVOFvHEwe80El8\" class=\"btn btn-dark\" onclick=\"location.reload()\"><!--pnid:8qEszm2rWleoko5bxSVaQJ-->再战一届</button>\n    </div>\n  </div>\n  <footer data-page-node-id=\"YpDyTIsaTWokTi63p7i419\"><!--pnid:Oflmt0DTfNyNRw4elqnIVW-->原著彩蛋：登录密码「贾岛」的来处——「鸟宿池边树，僧敲月下门」，推敲的故事，你一定记得。</footer>\n</section>\n\n<!--pnid:K4a5WWGU3bLwQQBreMt7ob--><!-- ================= 笔勋章图卡 ================= -->\n<section data-page-node-id=\"Hv6WbiEAdvDyCh0nmjnklO\" class=\"screen\" id=\"medal\">\n  <div data-page-node-id=\"ubpqtwvhhIaHSLbqZl5mz4\" class=\"medal-scroll\">\n    <h2 data-page-node-id=\"36TAi8VwfVPKly7tnPx2bL\" class=\"kai\"><!--pnid:yIOh20ZYHfcqE5u9K4ryH0-->笔 勋 章</h2>\n    <div data-page-node-id=\"TdbJpUCWqpiX0LMaEzQoqP\" class=\"md-tip\" id=\"mdSub\"><!--pnid:7WQa2o3yP8cm5MwkWhiOSD-->长按图片保存 · 发到朋友圈，召唤同窗来战</div>\n    <div data-page-node-id=\"gQrVObovL8zA9hN1IJkbMh\" id=\"mdStage\"></div>\n  </div>\n</section>\n\n<div data-page-node-id=\"XfI3Ul4Qcvz26dc5SroLLj\" class=\"cameo\" id=\"cameo\"></div>\n<button data-page-node-id=\"YCxJTQ7Vb5q5H1b0wJdZgM\" aria-label=\"音效开关\" id=\"sfxBtn\" onclick=\"toggleSfx()\" title=\"音效开关\"><!--pnid:EJKtnRGRuwQJL0gRJ8hgKD-->🔊</button>\n<div data-page-node-id=\"0oPIbhjTfGUf2Ng8UBgNik\" class=\"praise\" id=\"praiseCard\">\n  <div data-page-node-id=\"KhuYMMPivjgQsXbuq49Vdh\" class=\"avatar\" id=\"praiseAvatar\"><!--pnid:jIO24QGnQTjzmkrz6cJdWB-->🧙</div>\n  <div data-page-node-id=\"1x0UwVKferHTDgFrTasHdJ\" class=\"pbody\">\n    <div data-page-node-id=\"s5mLwvwXZJdqlZeaU1PpYb\" class=\"pname\" id=\"praiseName\"><!--pnid:5NE2QGqvYq0eH3tlRX84uF-->老子</div>\n    <div data-page-node-id=\"lMMAGI0yO2iKcJmk16bbWM\" class=\"pline\" id=\"praiseLine\"></div>\n  </div>\n</div>\n<div data-page-node-id=\"VFfwRyTMcGhWZTJHVM2pTf\" class=\"combo-fx\" id=\"comboFx\"><!--pnid:ZtsN7tQeuv1hFtPDgmeU1n-->连对三题！</div>\n\n";

"use strict";
const $=id=>document.getElementById(id);
function go(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');window.scrollTo(0,0);}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}

/* ================= 音效引擎（WebAudio 实时合成，无需音频文件） ================= */
let AC=null, MASTER=null, muted=false;
function audio(){
  try{
    if(!AC){ AC=new (window.AudioContext||window.webkitAudioContext)(); MASTER=AC.createGain(); MASTER.gain.value=0.55; MASTER.connect(AC.destination); }
    if(AC.state==='suspended') AC.resume();
    return AC;
  }catch(e){ return null; }
}
function tone(freq,dur,type,vol,delay,slideTo){
  const ac=audio(); if(!ac||muted) return;
  const t0=ac.currentTime+(delay||0);
  const o=ac.createOscillator(), g=ac.createGain();
  o.type=type||'sine'; o.frequency.setValueAtTime(freq,t0);
  if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo,t0+dur);
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(vol||0.14,t0+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g); g.connect(MASTER); o.start(t0); o.stop(t0+dur+0.02);
}
let NOISE=null;
function noise(dur,vol,filterFreq,delay){
  const ac=audio(); if(!ac||muted) return;
  if(!NOISE){
    NOISE=ac.createBuffer(1,ac.sampleRate*0.5,ac.sampleRate);
    const d=NOISE.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length);
  }
  const t0=ac.currentTime+(delay||0);
  const src=ac.createBufferSource(); src.buffer=NOISE;
  const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=filterFreq||2200; bp.Q.value=0.8;
  const g=ac.createGain(); g.gain.setValueAtTime(vol||0.16,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  src.connect(bp); bp.connect(g); g.connect(MASTER); src.start(t0); src.stop(t0+dur+0.02);
}
/* —— 各类音色 —— */
const sndBlip=()=>tone(720,.07,'sine',.07);
const sndSwish=()=>{noise(.18,.13,2600); tone(1200,.14,'sine',.04,0,600);};
const sndRight=()=>{tone(784,.12,'sine',.13); tone(1175,.26,'sine',.11,.09); noise(.12,.05,4200,.02);};
const sndWrong=()=>{tone(196,.22,'sawtooth',.07); tone(146,.32,'triangle',.06,.1);};
const sndStreak=n=>{[659,784,988,1319].slice(0,Math.min(4,n+1)).forEach((f,i)=>tone(f,.16,'triangle',.1,i*.07));};
const sndUp=()=>{[523,659,784,1046,1319].forEach((f,i)=>tone(f,.3,'triangle',.12,i*.13)); noise(.5,.05,1800,.05);};
const sndWin=()=>{[523,659,784,1046,1319,1568].forEach((f,i)=>tone(f,.34,'sine',.13,i*.15)); tone(261,.9,'sine',.07,.1);};
const sndHit=()=>{tone(120,.16,'square',.09); noise(.16,.14,900);};
const sndCrown=()=>{tone(392,.5,'sine',.08); tone(587,.5,'sine',.07,.08); tone(784,.7,'sine',.07,.16); noise(.6,.04,5200,.2);};
const sndEgg=()=>{noise(.2,.09,1600); tone(320+Math.random()*180,.12,'square',.05);};
const sndJade=()=>{tone(880,.5,'sine',.05); tone(1320,.6,'sine',.04,.12);};
/* 静音开关 */
function toggleSfx(){
  muted=!muted;
  const b=document.getElementById('sfxBtn');
  b.textContent=muted?'🔇':'🔊';
  b.title=muted?'音效已关闭':'音效已开启';
  if(!muted){ sndBlip(); setTimeout(()=>sndRight(),120); }
}
document.addEventListener('pointerdown',()=>audio(),{once:true});


/* ---------------- 彩蛋开场 ---------------- */
let eggTaps=0;
$('blackBox').onclick=()=>{
  $('blackBox').style.display='none';
  $('eggEl').style.display='flex';
  $('eggHint').innerHTML='盒子里是一枚小彩蛋，蛋壳上刻着四个字——<b style="color:#e9b44c">鬼笔之魂</b><br>👆 轻敲彩蛋三下。没读过原著也没关系，敲开后有登录提示。';
  sndEgg();
};
$('eggEl').onclick=e=>{
  if(!eggTaps){
    $('pwRow').style.display='flex';
    $('pwMsg').textContent='屏幕浮现一行小字：「超过24小时未登录，请输入密码。」';
    $('loginTip').style.display='block';
  }
  eggTaps++;
  const c=document.createElement('span');
  c.className='crack';c.textContent='💥';
  c.style.left=(20+Math.random()*60)+'%';c.style.top=(15+Math.random()*60)+'%';
  $('eggEl').appendChild(c);
  sndEgg();
  if(eggTaps>=3){
    $('eggEl').classList.add('glowing');
    $('pwMsg').innerHTML='<b style="color:#f0dfae">彩蛋裂开了，金光涌出——答对下面的小题，就能进《鬼笔之魂》。</b>';
    $('loginTip').style.display='block';
  }
};
function tryPassword(){
  const v=($('pwInput').value||'').trim();
  if(v==='贾岛'){
    sndRight();
    $('pwMsg').innerHTML='<b style="color:#7ee2b8">「隐者，欢迎回来！」</b> 登录成功！';
    window.isYinzhe=true;
    setTimeout(()=>{ $('heroName').value='隐者'; go('pledge'); },900);
  }else if(!v){
    $('pwMsg').textContent='请输入密码。往下看，有一张登录提示卡。';
    $('loginTip').style.display='block';
  }else if(eggTaps<3){
    $('pwMsg').textContent='先敲开彩蛋，才能输入密码哦。';
  }else{
    sndWrong();
    $('pwMsg').innerHTML='密码错误。答案就在下面的提示卡里——「鸟宿池边树，僧敲月下门」的作者，两个字。';
    $('loginTip').style.display='block';
  }
}
function fillPw(){
  $('pwInput').value='贾岛';
  sndEgg();
  tryPassword();
}
function hintAgain(){
  const tips=[
    '提示一：他是唐代诗人，写过「十年磨一剑，霜刃未曾试」。',
    '提示二：他本是和尚，后来还俗考进士，诗风清苦，人称「苦吟诗人」。',
    '提示三：姓「贾」，名字和「岛」有关——两字合起来，就是答案了。'
  ];
  const i=(window._hintIdx||0)%tips.length;
  window._hintIdx=i+1;
  $('pwMsg').innerHTML='<span style="color:#e9b44c">'+tips[i]+'</span>';
}

/* ---------------- 承诺书 ---------------- */
let hero={name:'隐者',level:0,jinnang:2,lei:1};
function signPledge(){
  hero.name=($('heroName').value||'').trim()||'隐者';
  sndRight();
  renderMap(); go('map');
}

/* ---------------- 神笔与地图 ---------------- */
const PENS=[
  {name:'土笔',grade:'一年级',g:'g1',scene:'一年级 · 山谷入口',desc:'字词与最浅的诗句，泥土里发芽'},
  {name:'木笔',grade:'二年级',g:'g2',scene:'二年级 · 青竹林',desc:'量词反义与童谣古诗，风里长一寸'},
  {name:'铜笔',grade:'三年级',g:'g3',scene:'三年级 · 半山石阶',desc:'成语寓言与唐诗，敲响半山钟'},
  {name:'银笔',grade:'四年级',g:'g4',scene:'四年级 · 云中栈道',desc:'课文名家与诗意理解，月光洗锋芒'},
  {name:'金笔',grade:'五年级',g:'g5',scene:'五年级 · 金色山脊',desc:'名著与名句，金色满山冈'},
  {name:'玉笔',grade:'六年级',g:'g6',scene:'六年级 · 绝壁天梯',desc:'小古文与诗心，玉魂一声唤'}
];
const POEMS=[
  '小笔呀小笔，\n土里把芽发。\n背好一句话，\n木枝开新花。',
  '木笔呀木笔，\n风里长一寸。\n答对三道题，\n铜花亮闪闪。',
  '铜笔呀铜笔，\n敲响半山钟。\n诗心不迷路，\n银子亮晶晶。',
  '银笔呀银笔，\n月光洗锋芒。\n再攀三百级，\n金色满山冈。',
  '金笔呀金笔，\n山顶云中藏。\n玉魂一声唤，\n翠光照四方。'
];
function renderMap(){
  const slot=$('mapPenSlot');slot.innerHTML='';
  const p=document.createElement('div');p.className='pen '+PENS[hero.level].g;
  p.style.width='26px';p.style.height='100px';slot.appendChild(p);
  const sub=$('mapSub');
  sub.textContent=hero.level>=6
    ? '玉笔在手，笔侠之名已成。山顶的玉笔殿正等着你——鬼笔王只有一位！'
    : '山谷的雾里传来爷爷的声音：「熟读唐诗三百首，不会作诗也会吟。」';
  const list=$('pathList');list.innerHTML='';
  PENS.forEach((pn,i)=>{
    const d=document.createElement('div');
    d.className='node'+(i<hero.level?' done':'')+(i===hero.level?' current':'')+(i>hero.level?' locked':'');
    d.innerHTML='<div class="pen-mini '+pn.g+'" style="background:linear-gradient(#ccc,#999);"></div>'+
      '<div><h3 class="kai">'+pn.name+' · '+pn.grade+'</h3><p>'+pn.desc+'</p></div>'+
      '<span class="lv">'+(i<hero.level?'✓ 已通':(i===hero.level?'试炼':'🔒'))+'</span>';
    if(i===hero.level) d.onclick=()=>startQuiz(i);
    list.appendChild(d);
  });
}

/* ---------------- 题库（按年级） ---------------- */
const BANK=[
[ /* 一年级 · 土笔 */
 {q:'「床前明月光」的下一句是？',o:['疑是地上霜','低头思故乡','举头望明月','夜半钟声到'],a:0,n:'李白《静夜思》：床前明月光，疑是地上霜。'},
 {q:'《悯农》里「谁知盘中餐」的下一句是？',o:['粒粒皆辛苦','汗滴禾下土','春种一粒粟','秋收万颗子'],a:0,n:'每一粒粮食都来得不容易。'},
 {q:'《咏鹅》中「白毛浮绿水」的下一句是？',o:['红掌拨清波','曲项向天歌','鹅鹅鹅','白日依山尽'],a:0,n:'骆宾王七岁写《咏鹅》。'},
 {q:'「远看山有色，近听水无声」写的是什么？',o:['画','山','水','鸟'],a:0,n:'这首诗的题目就叫《画》。'},
 {q:'「春眠不觉晓」的作者是谁？',o:['孟浩然','李白','杜甫','白居易'],a:0,n:'孟浩然《春晓》。'},
 {q:'「大」的反义词是？',o:['小','多','上','长'],a:0,n:'大小是一对反义词。'},
 {q:'一（　）马，括号里填哪个量词？',o:['匹','个','只','条'],a:0,n:'一匹马、一匹布，都是「匹」。'},
 {q:'「一去二三里」的下一句是？',o:['烟村四五家','亭台六七座','八九十枝花','门前大桥下'],a:0,n:'山村数字诗：一去二三里，烟村四五家。'},
 {q:'《画》中「人来鸟不惊」的上一句是？',o:['春去花还在','近听水无声','远看山有色','抬头见飞鸟'],a:0,n:'春去花还在，人来鸟不惊。'},
 {q:'汉字「日」加一笔，可以变成下面哪个字？',o:['目','山','火','木'],a:0,n:'日加一横变成「目」。'}
],
[ /* 二年级 · 木笔 */
 {q:'「飞流直下三千尺」的下一句是？',o:['疑是银河落九天','桃花潭水深千尺','万里长征人未还','唯见长江天际流'],a:0,n:'李白《望庐山瀑布》。'},
 {q:'成语「守株待（　）」，括号里是？',o:['兔','鸟','鱼','羊'],a:0,n:'守株待兔，讽刺不劳而获。'},
 {q:'「忙趁东风放纸鸢」的上一句是？',o:['儿童散学归来早','草长莺飞二月天','拂堤杨柳醉春烟','两个黄鹂鸣翠柳'],a:0,n:'高鼎《村居》，纸鸢就是风筝。'},
 {q:'《赠汪伦》中，李白用什么来比喻汪伦的情谊？',o:['桃花潭水深千尺','飞流直下三千尺','黄河之水天上来','千里江陵一日还'],a:0,n:'桃花潭水深千尺，不及汪伦送我情。'},
 {q:'「危险」的反义词是？',o:['安全','勇敢','害怕','小心'],a:0,n:'危险与安全意思相反。'},
 {q:'《小池》中「小荷才露尖尖角」的下一句是？',o:['早有蜻蜓立上头','映日荷花别样红','风光不与四时同','荷尽已无擎雨盖'],a:0,n:'杨万里《小池》。'},
 {q:'《夜宿山寺》「危楼高百尺」的作者是？',o:['李白','王维','李商隐','杜牧'],a:0,n:'李白：危楼高百尺，手可摘星辰。'},
 {q:'成语「井底之（　）」，括号里是？',o:['蛙','鱼','兔','蛇'],a:0,n:'井底之蛙，比喻见识短浅。'},
 {q:'十二生肖中，排在「龙」后面的是？',o:['蛇','马','羊','猴'],a:0,n:'子鼠、丑牛……辰龙、巳蛇。'},
 {q:'「春雨惊春清谷天」说的是一年中的？',o:['节气','月份','星期','方向'],a:0,n:'这是二十四节气歌。'}
],
[ /* 三年级 · 铜笔 */
 {q:'「独在异乡为异客」的下一句是？',o:['每逢佳节倍思亲','遍插茱萸少一人','遥知兄弟登高处','西出阳关无故人'],a:0,n:'王维《九月九日忆山东兄弟》。'},
 {q:'《望天门山》中「两岸青山相对出」的下一句是？',o:['孤帆一片日边来','碧水东流至此回','轻舟已过万重山','唯见长江天际流'],a:0,n:'李白《望天门山》。'},
 {q:'「欲把西湖比西子」的作者是？',o:['苏轼','李白','杨万里','王安石'],a:0,n:'苏轼《饮湖上初晴后雨》。'},
 {q:'寓言《陶罐和铁罐》中，铁罐的缺点是？',o:['傲慢无礼','胆小怕事','爱哭鼻子','贪吃懒惰'],a:0,n:'铁罐傲慢，最后却锈掉了。'},
 {q:'「霜叶红于二月花」出自哪首诗？',o:['《山行》','《望天门山》','《夜书所见》','《乞巧》'],a:0,n:'杜牧《山行》：停车坐爱枫林晚，霜叶红于二月花。'},
 {q:'成语「掩耳盗铃」的意思是？',o:['自己欺骗自己','勇敢机灵','团结友爱','勤俭节约'],a:0,n:'捂住耳朵偷铃铛，骗得了自己骗不了别人。'},
 {q:'《夜书所见》中「知有儿童挑促织」，「促织」是指？',o:['蟋蟀','螳螂','蜜蜂','蜻蜓'],a:0,n:'促织就是蟋蟀。'},
 {q:'《西游记》的作者是？',o:['吴承恩','罗贯中','施耐庵','曹雪芹'],a:0,n:'吴承恩写了孙悟空的故事。'},
 {q:'「一年好景君须记」的下一句是？',o:['最是橙黄橘绿时','正是河豚欲上时','竹外桃花三两枝','春江水暖鸭先知'],a:0,n:'苏轼赠刘景文：一年好景君须记，最是橙黄橘绿时。'},
 {q:'成语「亡羊补牢」告诉我们？',o:['出了错及时补救还不晚','羊圈一定要修牢','养羊要先补牢','丢羊是难免的'],a:0,n:'亡羊补牢，为时未晚。'}
],
[ /* 四年级 · 银笔 */
 {q:'「不识庐山真面目」的下一句是？',o:['只缘身在此山中','远近高低各不同','横看成岭侧成峰','白云生处有人家'],a:0,n:'苏轼《题西林壁》。'},
 {q:'《精卫填海》中，精卫原来是？',o:['炎帝的小女儿','龙王的小女儿','一只神鹰','一块石头'],a:0,n:'炎帝之女女娃，溺于东海化为精卫。'},
 {q:'「但使龙城飞将在」的下一句是？',o:['不教胡马度阴山','万里长征人未还','秦时明月汉时关','孤城遥望玉门关'],a:0,n:'王昌龄《出塞》。'},
 {q:'课文《爬山虎的脚》的作者是？',o:['叶圣陶','老舍','巴金','冰心'],a:0,n:'叶圣陶观察得可真细致。'},
 {q:'「可怜九月初三夜」中「可怜」的意思是？',o:['可爱','悲惨','可怜巴巴','贫穷'],a:0,n:'白居易《暮江吟》：可怜，是可爱的意思。'},
 {q:'《蟋蟀的住宅》的作者是？',o:['法布尔','安徒生','叶圣陶','丰子恺'],a:0,n:'法国昆虫学家法布尔《昆虫记》。'},
 {q:'「梅须逊雪三分白」的下一句是？',o:['雪却输梅一段香','骚人阁笔费评章','梅雪争春未肯降','遥知不是雪'],a:0,n:'卢钺《雪梅》，梅和雪各有千秋。'},
 {q:'成语「卧薪尝胆」的主人公是？',o:['勾践','夫差','诸葛亮','项羽'],a:0,n:'越王勾践卧薪尝胆，终于复国。'},
 {q:'《夏日绝句》「生当作人杰」的作者是？',o:['李清照','苏轼','王昌龄','陆游'],a:0,n:'李清照：生当作人杰，死亦为鬼雄。'},
 {q:'「降」在「投降」中读作？',o:['xiáng','jiàng','xié','jiāng'],a:0,n:'多音字：投降读 xiáng。'}
],
[ /* 五年级 · 金笔 */
 {q:'「姑苏城外寒山寺」的下一句是？',o:['夜半钟声到客船','江枫渔火对愁眠','月落乌啼霜满天','城阙辅三秦'],a:0,n:'张继《枫桥夜泊》。'},
 {q:'课文《白鹭》的作者是？',o:['郭沫若','老舍','许地山','琦君'],a:0,n:'郭沫若说：白鹭是一首精巧的诗。'},
 {q:'「少年易老学难成」的下一句是？',o:['一寸光阴不可轻','白发无凭吾老矣','梅花香自苦寒来','黑发不知勤学早'],a:0,n:'朱熹劝惜时：一寸光阴不可轻。'},
 {q:'《落花生》中，父亲借花生告诉我们？',o:['做人要做有用的人，不要只讲体面','花生很好吃','种花生很辛苦','要多吃花生'],a:0,n:'许地山《落花生》。'},
 {q:'《示儿》中「王师北定中原日」的下一句是？',o:['家祭无忘告乃翁','但悲不见九州同','死去元知万事空','铁马冰河入梦来'],a:0,n:'陆游临终仍念国家统一。'},
 {q:'《三国演义》的作者是？',o:['罗贯中','吴承恩','曹雪芹','蒲松龄'],a:0,n:'罗贯中写了桃园三结义与赤壁之战。'},
 {q:'《山居秋暝》中「明月松间照」的下一句是？',o:['清泉石上流','竹喧归浣女','莲动下渔舟','空山新雨后'],a:0,n:'王维：诗中有画。'},
 {q:'「太阳会发光，会发热，是个大火球」用了什么说明方法？',o:['打比方','列数字','作比较','举例子'],a:0,n:'把太阳比作火球，是打比方。'},
 {q:'「我劝天公重抖擞」的下一句是？',o:['不拘一格降人才','万马齐喑究可哀','九州生气恃风雷','落红不是无情物'],a:0,n:'龚自珍《己亥杂诗》。'},
 {q:'《鸟的天堂》的作者是？',o:['巴金','老舍','叶圣陶','郭沫若'],a:0,n:'巴金两次经过「鸟的天堂」。'}
],
[ /* 六年级 · 玉笔 */
 {q:'《两小儿辩日》中，两个小孩辩论的问题是？',o:['太阳什么时候离人近','月亮为什么有圆缺','星星为什么会眨眼','风从哪里来'],a:0,n:'一个说早晨近，一个说中午近，孔子也不能决。'},
 {q:'《伯牙鼓琴》中「善哉」的意思是？',o:['好啊','再见','快些','对不起'],a:0,n:'善哉乎鼓琴，巍巍乎若太山。'},
 {q:'《宿建德江》中「野旷天低树」的下一句是？',o:['江清月近人','日暮客愁新','移舟泊烟渚','处处闻啼鸟'],a:0,n:'孟浩然：江清月近人。'},
 {q:'「稻花香里说丰年」的下一句是？',o:['听取蛙声一片','明月别枝惊鹊','清风半夜鸣蝉','两三点雨山前'],a:0,n:'辛弃疾《西江月·夜行黄沙道中》。'},
 {q:'课文《少年闰土》中，闰土在月下的瓜地里刺的是什么？',o:['猹','蛇','兔','狐狸'],a:0,n:'鲁迅笔下：你便捏了胡叉，轻轻地走去……'},
 {q:'《学弈》中「弈」的意思是？',o:['下棋','读书','射箭','写字'],a:0,n:'弈秋，通国之善弈者也。'},
 {q:'「捐躯赴国难」的下一句是？',o:['视死忽如归','猛气冲漂杌','左顾凌鲜卑','长驱蹈匈奴'],a:0,n:'曹植《白马篇》。'},
 {q:'《匆匆》中「我们的日子为什么一去不复返呢」的作者是？',o:['朱自清','鲁迅','巴金','冰心'],a:0,n:'朱自清问时间，也问我们每一个人。'},
 {q:'《春夜喜雨》中「随风潜入夜」的下一句是？',o:['润物细无声','野径云俱黑','花重锦官城','好雨知时节'],a:0,n:'杜甫：随风潜入夜，润物细无声。'},
 {q:'「人生自古谁无死」的下一句是？',o:['留取丹心照汗青','零丁洋里叹零丁','山河破碎风飘絮','惶恐滩头说惶恐'],a:0,n:'文天祥《过零丁洋》。'}
]];

/* ================= 题库扩充（每年级再增 8 题） ================= */
const BANK_EXTRA=[
[ /* 一年级 追加 */
 {q:'「举头望明月」的下一句是？',o:['低头思故乡','疑是地上霜','夜半钟声到','对影成三人'],a:0,n:'李白《静夜思》最柔软的一句。'},
 {q:'「鹅，鹅，鹅」的下一句是？',o:['曲项向天歌','白毛浮绿水','红掌拨清波','振翅向天飞'],a:0,n:'骆宾王《咏鹅》。'},
 {q:'「锄禾日当午」的下一句是？',o:['汗滴禾下土','粒粒皆辛苦','春种一粒粟','秋收万颗子'],a:0,n:'李绅《悯农》。'},
 {q:'「远看山有色，近听水无声」写的是？',o:['画','山','水','梦'],a:0,n:'诗题就叫《画》——看得见，听不见。'},
 {q:'「早」的反义词是？',o:['晚','快','慢','近'],a:0,n:'早晨对傍晚。'},
 {q:'「春」字一共有几笔？',o:['9笔','8笔','10笔','7笔'],a:0,n:'横横横撇捺竖折横横，共9笔。'},
 {q:'「木」字加上一横，可以变成下面哪个字？',o:['本','林','森','材'],a:0,n:'木加一横在下面，就是「本」。'},
 {q:'「小时不识月」的下一句是？',o:['呼作白玉盘','疑是地上霜','又疑瑶台镜','飞在青云端'],a:0,n:'李白《古朗月行》，孩子眼里的月亮像玉盘。'}
],
[ /* 二年级 追加 */
 {q:'「白日依山尽」的下一句是？',o:['黄河入海流','欲穷千里目','更上一层楼','长河落日圆'],a:0,n:'王之涣《登鹳雀楼》。'},
 {q:'「欲穷千里目」的下一句是？',o:['更上一层楼','黄河入海流','白日依山尽','一览众山小'],a:0,n:'想要看得更远，就要站得更高。'},
 {q:'「两个黄鹂鸣翠柳」的下一句是？',o:['一行白鹭上青天','窗含西岭千秋雪','门泊东吴万里船','万条垂下绿丝绦'],a:0,n:'杜甫《绝句》。'},
 {q:'「窗含西岭千秋雪」的下一句是？',o:['门泊东吴万里船','一行白鹭上青天','两个黄鹂鸣翠柳','孤帆一片日边来'],a:0,n:'一窗一门，一雪一船。'},
 {q:'「碧玉妆成一树高」的下一句是？',o:['万条垂下绿丝绦','不知细叶谁裁出','二月春风似剪刀','拂堤杨柳醉春烟'],a:0,n:'贺知章《咏柳》。'},
 {q:'「不知细叶谁裁出」的下一句是？',o:['二月春风似剪刀','万条垂下绿丝绦','碧玉妆成一树高','吹面不寒杨柳风'],a:0,n:'春风是一把看不见的剪刀。'},
 {q:'「粗心」的反义词是？',o:['细心','小气','认真','耐心'],a:0,n:'粗心大意对细心谨慎。'},
 {q:'一（　）树叶，括号里填？',o:['片','棵','朵','根'],a:0,n:'一片树叶、一片云、一片草地。'}
],
[ /* 三年级 追加 */
 {q:'「停车坐爱枫林晚」中「坐」的意思是？',o:['因为','坐下','座位','立刻'],a:0,n:'坐：因为。因为爱这枫林晚景，才停下车来。'},
 {q:'「知有儿童挑促织」中「挑」的意思是？',o:['用细枝拨弄','挑担子','挑选','挑战'],a:0,n:'挑促织：用细枝拨弄蟋蟀。'},
 {q:'「水光潋滟晴方好」的下一句是？',o:['山色空蒙雨亦奇','欲把西湖比西子','淡妆浓抹总相宜','两岸青山相对出'],a:0,n:'苏轼写西湖：晴也好，雨也奇。'},
 {q:'成语「邯郸学（　）」，括号里是？',o:['步','舌','舞','字'],a:0,n:'邯郸学步，学不像别人，反而忘了自己怎么走。'},
 {q:'「萧萧梧叶送寒声」的下一句是？',o:['江上秋风动客情','独在异乡为异客','知有儿童挑促织','夜深篱落一灯明'],a:0,n:'叶绍翁《夜书所见》。'},
 {q:'寓言《南辕北辙》告诉我们？',o:['方向错了，越努力越远离目标','马车要造得结实','出门要看天气','问路要找老人'],a:0,n:'方向不对，跑得越快错得越远。'},
 {q:'「群儿戏于庭，一儿登瓮」出自课文？',o:['《司马光》','《守株待兔》','《精卫填海》','《王戎不取道旁李》'],a:0,n:'这是小学第一篇小古文。'},
 {q:'司马光「持石击瓮破之」，说明他？',o:['遇事沉着机智','力气特别大','喜欢玩水','不爱说话'],a:0,n:'别人都跑了，他却想到让水离开人。'}
],
[ /* 四年级 追加 */
 {q:'「梅子金黄杏子肥」的下一句是？',o:['麦花雪白菜花稀','日长篱落无人过','惟有蜻蜓蛱蝶飞','篱落疏疏一径深'],a:0,n:'范成大《四时田园杂兴》。'},
 {q:'「不要人夸好颜色」的下一句是？',o:['只留清气满乾坤','朵朵花开淡墨痕','我家洗砚池头树','任尔东西南北风'],a:0,n:'王冕《墨梅》，写的是骨气。'},
 {q:'《题西林壁》告诉我们什么道理？',o:['看问题要全面，多换角度','庐山很高','爬山很累','云雾很美'],a:0,n:'横看成岭侧成峰，角度不同，结论不同。'},
 {q:'《盘古开天地》中，盘古倒下后身体化作了？',o:['山川日月、风雨雷电','一座大山','一条大河','满天星斗'],a:0,n:'呼吸成风云，声音成雷声，双眼成日月。'},
 {q:'成语「悬梁刺（　）」，括号里是？',o:['股','骨','手','背'],a:0,n:'悬梁刺股，说的是刻苦读书。'},
 {q:'「铁杵成针」的故事主人公是？',o:['李白','杜甫','王羲之','匡衡'],a:0,n:'老婆婆磨铁杵，磨的是李白的耐心。'},
 {q:'「程门立雪」形容的是？',o:['尊师重道、求学诚恳','天气很冷','雪下得大','站在门口等人'],a:0,n:'杨时在大雪里等老师醒来。'},
 {q:'「胸有成竹」原来说的是？',o:['画竹前心里已有竹子的样子','肚子里长了竹子','吃竹笋','种竹子'],a:0,n:'画家文与可画竹，先在心中成形。'}
],
[ /* 五年级 追加 */
 {q:'「月落乌啼霜满天」的下一句是？',o:['江枫渔火对愁眠','姑苏城外寒山寺','夜半钟声到客船','独怜幽草涧边生'],a:0,n:'张继《枫桥夜泊》。'},
 {q:'「羌笛何须怨杨柳」的下一句是？',o:['春风不度玉门关','黄河远上白云间','一片孤城万仞山','西出阳关无故人'],a:0,n:'王之涣《凉州词》。'},
 {q:'《将相和》中的「将」指的是？',o:['廉颇','蔺相如','赵王','秦王'],a:0,n:'「将」是廉颇，「相」是蔺相如。'},
 {q:'《草船借箭》里，诸葛亮能借到箭主要靠？',o:['大雾和曹操的多疑','士兵的勇猛','鲁肃的帮忙','船造得结实'],a:0,n:'知天时，也知人心。'},
 {q:'「三万里河东入海」的下一句是？',o:['五千仞岳上摩天','遗民泪尽胡尘里','南望王师又一年','黄河远上白云间'],a:0,n:'陆游《秋夜将晓出篱门迎凉有感》。'},
 {q:'「童孙未解供耕织」的下一句是？',o:['也傍桑阴学种瓜','日长篱落无人过','村庄儿女各当家','忙趁东风放纸鸢'],a:0,n:'范成大笔下的小孩，也在学种瓜。'},
 {q:'成语「一鼓作（　）」，括号里是？',o:['气','势','勇','力'],a:0,n:'一鼓作气，出自《曹刿论战》。'},
 {q:'《景阳冈》中赤手空拳打虎的是？',o:['武松','李逵','鲁智深','林冲'],a:0,n:'《水浒传》里最著名的一场人虎斗。'}
],
[ /* 六年级 追加 */
 {q:'「等闲识得东风面」的下一句是？',o:['万紫千红总是春','胜日寻芳泗水滨','无边光景一时新','一枝红杏出墙来'],a:0,n:'朱熹《春日》。'},
 {q:'「盈盈一水间」的下一句是？',o:['脉脉不得语','迢迢牵牛星','皎皎河汉女','札札弄机杼'],a:0,n:'《迢迢牵牛星》，写的是隔河相望。'},
 {q:'《十六年前的回忆》写的是哪位革命者？',o:['李大钊','方志敏','鲁迅','闻一多'],a:0,n:'李星华回忆父亲李大钊。'},
 {q:'《北京的春节》的作者是？',o:['老舍','朱自清','沈从文','汪曾祺'],a:0,n:'老舍写北京的年味：腊八、除夕、元宵。'},
 {q:'「粉骨碎身浑不怕」的下一句是？',o:['要留清白在人间','烈火焚烧若等闲','千锤万凿出深山','任尔东西南北风'],a:0,n:'于谦《石灰吟》，写的是清白。'},
 {q:'「千磨万击还坚劲」的下一句是？',o:['任尔东西南北风','立根原在破岩中','咬定青山不放松','要留清白在人间'],a:0,n:'郑燮《竹石》，写的是坚韧。'},
 {q:'「燕子去了，有再来的时候；杨柳枯了，有再青的时候」用了什么修辞？',o:['排比','夸张','反问','拟人'],a:0,n:'三个结构相同的句子连用，是排比。'},
 {q:'《学弈》告诉我们什么道理？',o:['学习必须专心致志','下棋要请高手','两个人不能同时学','要常换老师'],a:0,n:'同一位老师，一人专心，一人走神，结果天差地别。'}
]];
BANK_EXTRA.forEach((arr,i)=>BANK[i].push(...arr));


/* ---------------- 闯关答题 ---------------- */
let Q={pool:[],idx:0,streak:0,lv:0,leiArmed:false};
function startQuiz(lv){
  Q={pool:shuffle(BANK[lv].slice()).slice(0,12),idx:0,streak:0,lv,leiArmed:false};
  go('quiz'); updQuizHud(); nextQ();
}
function updQuizHud(){
  const pn=PENS[Q.lv];
  $('qPenChip').innerHTML='<span class="pen '+pn.g+'" style="width:14px;height:30px;"></span> '+pn.name+' · '+pn.grade+'试炼';
  $('jnCount').textContent=hero.jinnang; $('leiCount').textContent=hero.lei;
  [...$('streakDots').children].forEach((d,i)=>d.classList.toggle('on',i<Q.streak));
}
function nextQ(){
  if(Q.idx>=Q.pool.length){ quizFail(); return; }
  const item=Q.pool[Q.idx++];
  Q.cur=item; Q.usedJinnang=false;
  $('qScene').textContent=PENS[Q.lv].scene+' · 第 '+Q.idx+'/'+Q.pool.length+' 题';
  $('qText').textContent=item.q;
  $('qVerdict').textContent=''; $('qFoot').innerHTML='';
  const box=$('qOpts'); box.innerHTML='';
  const order=shuffle(item.o.map((t,i)=>({t,r:i===item.a})));
  order.forEach(o=>{
    const b=document.createElement('button');
    b.className='opt'; b.textContent=o.t;
    b.onclick=()=>answerQ(b,o.r);
    box.appendChild(b);
  });
  updQuizHud();
}
function answerQ(btn,right){
  if(btn.disabled) return;
  document.querySelectorAll('#qOpts .opt').forEach(b=>b.disabled=true);
  flyPen(btn);
  setTimeout(()=>{
    if(right){
      btn.classList.add('right'); sndRight(); Q.streak++;
      $('qVerdict').innerHTML='✒ 笔锋一点，正中靶心！ '+Q.cur.n;
      if(Q.streak>=3){ setTimeout(levelWin,1200); return; }
      if(Q.streak>=2){ sndStreak(Q.streak); comboFx(Q.streak>=2?'连对 '+Q.streak+' 题！':''); }
      if(Math.random()<0.5) setTimeout(()=>praise(),640);
    }else{
      if(Q.leiArmed){
        Q.leiArmed=false;
        tone(880,.5,'sine',.07);
        $('qVerdict').innerHTML='⚡ <b>雷神咒护体！</b>这一答错了，连击却不断——爷爷的法术果然灵。 '+Q.cur.n;
      }else{
        btn.classList.add('wrong'); sndWrong(); sndHit(); Q.streak=0;
        $('qVerdict').innerHTML='墨迹晕开了一角…… '+Q.cur.n;
        setTimeout(()=>praise(true),900);
      }
      document.querySelectorAll('#qOpts .opt').forEach(b=>{ if(!b.classList.contains('wrong')) b.classList.add('dim'); });
      const rb=document.querySelectorAll('#qOpts .opt'); rb.forEach((b,i)=>{ if(!b.classList.contains('wrong')){} });
    }
    updQuizHud();
    const nb=document.createElement('button');
    nb.className='btn btn-gold'; nb.textContent='下一题 →';
    nb.onclick=nextQ; $('qFoot').appendChild(nb);
  },420);
}
function quizFail(){
  $('qScene').textContent='试炼未成';
  $('qText').textContent='题力用尽，连击未满三。别气馁——原著里的若愚，也是摔了跟头才学会握笔的。';
  $('qOpts').innerHTML=''; $('qVerdict').textContent='';
  const nb=document.createElement('button');
  nb.className='btn btn-gold'; nb.textContent='重新挑战本级 ↺';
  nb.onclick=()=>startQuiz(Q.lv); $('qFoot').appendChild(nb);
  sndWrong();
}
function levelWin(){
  sndUp(); sndJade();
  if(Q.lv>=5){ renderMap(); go('jade'); return; }
  $('luPen').className='pen lu-pen '+PENS[Q.lv+1].g;
  $('luTitle').textContent=PENS[Q.lv].name+' → '+PENS[Q.lv+1].name;
  $('luPoem').textContent=POEMS[Q.lv];
  $('luBtn').textContent='继续攀登 ⛰️';
  $('luBurst').classList.remove('go'); void $('luBurst').offsetWidth; $('luBurst').classList.add('go');
  go('levelup');
  $('luBurst').animate([{opacity:1},{opacity:1}],{duration:900});
  setTimeout(()=>{ const b=$('luBurst'); b.classList.add('go'); },300);
  setTimeout(()=>praise(),1200);
}
function afterLevelUp(){ hero.level++; renderMap(); go('map'); cameo(); }

/* ---------------- 锦囊与雷神咒 ---------------- */
function useJinnang(){
  if(hero.jinnang<=0||Q.usedJinnang||!Q.cur) return;
  hero.jinnang--; Q.usedJinnang=true;
  const wrongs=[...document.querySelectorAll('#qOpts .opt')].filter(b=>!b.textContent||true);
  // 排除一个错误项
  const opts=[...document.querySelectorAll('#qOpts .opt')];
  const wrong=opts.filter(b=>b.textContent!==Q.cur.o[Q.cur.a]);
  if(wrong.length){ pick(wrong).classList.add('dim'); }
  updQuizHud();
  $('qVerdict').innerHTML='🧿 爷爷的锦囊妙计展开：「此路不通，另寻明路。」';
}
function useLei(){
  if(hero.lei<=0) return;
  hero.lei--; Q.leiArmed=true; updQuizHud();
  $('qVerdict').innerHTML='⚡ 雷神咒默念完成——下一答若错，连击不断！';
}

/* ---------------- 课文人物串场 ---------------- */
const CAMEOS=[
  ['老子','「大象无形，道隐无名。」白胡子老人骑青牛飘过，留下八个字，仿佛在暗示你按一下空格键……'],
  ['少年闰土','「猹哪里去了？」月下的少年提着银笔跑远了。'],
  ['鲁迅','「那猹却将身一扭，反从他的胯下逃走了。」'],
  ['桂花雨','「这里的桂花再香，也比不上家乡院子里的桂花！」她跑过时，满屏都是桂花般的火焰。'],
  ['孟子','「吾善养吾浩然之气。」孟子不与「最讨厌古文」恋战，扔下几个装备走了。'],
  ['苏东坡','「但愿人长久，千里共婵娟。」他靠在墙边，好像在等你扶他一把。'],
  ['爷爷的声音','「熟读唐诗三百首，不会作诗也会吟。」']
];
let cameoTimer=0;
function cameo(force){
  const c=pick(force?[force]:CAMEOS);
  const el=$('cameo');
  el.innerHTML='<b>【'+c[0]+'】</b> '+c[1];
  el.classList.add('show');
  clearTimeout(cameoTimer);
  cameoTimer=setTimeout(()=>el.classList.remove('show'),4200);
}

/* ================= 课文人物 · 随机表扬卡 ================= */
const PRAISES=[
  {n:'老子',a:'🧙',lines:[
    '小小笔侠，答题如流水。大象无形，你却把字字都看在了眼里。',
    '「道隐无名」——你答得安静，却比谁都快。善哉，善哉。',
    '青牛也想为你停一停。这一笔，有道气。',
    '读书不求人夸，只求心里明白。你已经明白了。'
  ]},
  {n:'苏东坡',a:'🍶',lines:[
    '好一句答得妙！来来，老夫敬你一杯月光。',
    '若在黄州，我定要为你写一首词——「小小笔侠，笔下有神」。',
    '读书如登山，你这一步，走得稳当。',
    '竹杖芒鞋轻胜马，谁怕？你这般从容，最合我意。'
  ]},
  {n:'桂花雨',a:'🌼',lines:[
    '你答得比我当年还快！送你一阵桂花香～',
    '这里的桂花再香，也比不上你答对时心里的甜。',
    '满屏的桂花都为你开了，接着冲呀！',
    '我把最香的那一枝，别在你的笔杆上。'
  ]},
  {n:'少年闰土',a:'🌙',lines:[
    '好本事！这身手，跟我月下刺猹有一拼！',
    '瓜地里的活儿要眼快，读书也要眼快——你都有了。',
    '我带来几个贝壳，换你一道题的答案，成不成？',
    '月下看你答题，比看猹还有意思。'
  ]},
  {n:'鲁迅',a:'📖',lines:[
    '嗯，这孩子读书，是真的读进去了。',
    '世上本没有路，你答得多了，笔下的路就宽了。',
    '不盲从，不敷衍——这四个字，你做到了。',
    '一撇一捺，都要站得住。你的字，站得住。'
  ]},
  {n:'孟子',a:'🏮',lines:[
    '孺子可教也！',
    '吾善养吾浩然之气——你也养着一股认真劲儿。',
    '学问之道无他，求其放心而已。你把心收住了。',
    '尽心知性，你已得其一二。'
  ]},
  {n:'铃月儿',a:'😂',lines:[
    '嘻嘻，你又答对啦！我就说你行吧～',
    '我把这个好消息告诉若愚去！',
    '别得意哦……不过，这次真的厉害！',
    '秘密武器借你用一下——好了，继续答题吧！'
  ]},
  {n:'爷爷',a:'👴',lines:[
    '好孙儿，笔要握稳，心要静。你做到了。',
    '熟读唐诗三百首，不会作诗也会吟。你现在，有点那个味道了。',
    '不错，不错。这字里头，有你的心。',
    '爷把雷神咒再教你一遍——心正，笔就正。'
  ]}
];
const PRAISE_ENCOURAGE=[
  {n:'爷爷',a:'👴',lines:['错了不怕，怕的是不敢再写。来，歇口气，接着来。','笔歪了可以改，心乱了才要停一停。']},
  {n:'苏东坡',a:'🍶',lines:['一篙松劲退千寻——歇一歇，再撑一竿就到了。','我当年也被贬了三次呢。错一题，算什么。']},
  {n:'少年闰土',a:'🌙',lines:['嘿，这一下没刺中。下次看准了再出手！','我给你看着呢，别怕，再来。']},
  {n:'桂花雨',a:'🌼',lines:['别急嘛，桂花也不是一天就开满的。','答错一次，就当捡了一片落花——继续走。']}
];
let praiseTimer=0, lastPraise=-1;
function praise(isWrong){
  const pool=isWrong?PRAISE_ENCOURAGE:PRAISES;
  let idx=Math.floor(Math.random()*pool.length);
  if(pool.length>1 && idx===lastPraise) idx=(idx+1)%pool.length;
  lastPraise=idx;
  const p=pool[idx];
  $('praiseAvatar').textContent=p.a;
  $('praiseName').textContent=p.n;
  $('praiseLine').textContent=pick(p.lines);
  const card=$('praiseCard');
  card.classList.remove('show'); void card.offsetWidth; card.classList.add('show');
  tone(isWrong?392:1046,.14,'triangle',.06);
  clearTimeout(praiseTimer);
  praiseTimer=setTimeout(()=>card.classList.remove('show'),4600);
}
function comboFx(text){
  if(!text) return;
  const el=$('comboFx'); el.textContent=text;
  el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
}

/* ---------------- 笔尖点选动画 ---------------- */
function flyPen(target){
  sndSwish();
  const r=target.getBoundingClientRect();
  const p=document.createElement('div');
  p.className='pen '+(PENS[Math.min(hero.level,5)].g);
  p.style.cssText='position:fixed;z-index:60;left:'+(r.left+r.width/2-11)+'px;top:'+(r.top-110)+'px;width:22px;height:88px;pointer-events:none;transition:transform .28s ease;';
  document.body.appendChild(p);
  requestAnimationFrame(()=>{ p.style.transform='translateY(96px) rotate(8deg) scale(.92)'; });
  setTimeout(()=>{ p.style.opacity='0'; p.style.transition+=',opacity .3s'; },300);
  setTimeout(()=>p.remove(),680);
}

/* ================= 玉笔殿 · 大决战 ================= */
const HELPERS=[
  {n:'567',skill:'「自我牺牲」：一次答错不扣笔力。',icon:'🛡️'},
  {n:'苏东坡',skill:'「东坡指点」：开战前排除一个错误项。',icon:'📜'},
  {n:'老子',skill:'「大象无形」：隐身跳过一道难题。',icon:'🌫️'},
  {n:'桂花雨',skill:'「满屏桂花」：每题增加 5 秒。',icon:'🌼'}
];
let helper=null;
function renderHelpers(){
  const row=$('helperRow'); row.innerHTML='';
  HELPERS.forEach(h=>{
    const b=document.createElement('button');
    b.className='btn btn-dark'; b.style.maxWidth='250px';
    b.innerHTML=h.icon+' <b class="kai">'+h.n+'</b><br><span style="font-size:11.5px;opacity:.85;font-weight:400;">'+h.skill+'</span>';
    b.onclick=()=>{
      helper=h;
      [...row.children].forEach(c=>c.style.outline='');
      b.style.outline='3px solid var(--gold)';
      $('aiDuelBtn').textContent='⚔ 带上'+h.n+' · 大决战';
    };
    row.appendChild(b);
  });
  row.firstChild.click();
}
let D=null;
function startDuel(mode){
  if(!helper) return;
  D={mode,hpMe:3,hpFoe:3,round:0,helper:{...helper,used:false},correctMe:0,correctP1:0,correctP2:0,turn:1,over:false};
  if(mode==='pvp'){
    D.p1=prompt('第一位挑战者的名号：')||'挑战者一';
    D.p2=prompt('第二位挑战者的名号：')||'挑战者二';
    D.qpool=shuffle([...BANK[3],...BANK[4],...BANK[5]]);
    go('duel'); passScreen(1);
  }else{
    const foes=[
      {n:'黑石',skill:.68,quote:'……（黑石一言不发，直接走向玉笔。）'},
      {n:'嘿嘿嘿',skill:.62,quote:'「看我大刀笔的华丽一斩！」'},
      {n:'最讨厌古文',skill:.52,quote:'「古文最难背！我今天要收拾你！」'},
      {n:'屠夫-sun',skill:.58,quote:'「让我来看看你的笔力有几斤几两。」'}
    ];
    D.foe=pick(foes);
    D.qpool=shuffle([...BANK[2],...BANK[3],...BANK[4],...BANK[5]]);
    $('meFName').textContent=hero.name+'（'+helper.n+'随行）';
    $('foeFName').textContent=D.foe.n;
    $('passBox').style.display='none'; $('duelQ').style.display='block';
    go('duel'); updHp();
    duelCameo(D.foe.quote);
    setTimeout(nextDuelQ,1400);
  }
}
function updHp(){
  $('meHp').style.width=(D.hpMe/3*100)+'%';
  $('foeHp').style.width=(D.hpFoe/3*100)+'%';
}
function duelCameo(t){ $('foeBubble').textContent=t; }

/* ---- AI 决战 ---- */
let dTimerId=0,dLeft=0;
function nextDuelQ(){
  if(D.over) return;
  if(D.round>=7){ endDuel(); return; }
  D.round++; D.cur=D.qpool[D.round-1];
  $('dScene').textContent='山顶 · 大决战 · 第 '+D.round+'/7 回合';
  $('dText').textContent=D.cur.q;
  $('dVerdict').textContent=''; $('dFoot').innerHTML='';
  const box=$('dOpts'); box.innerHTML='';
  D.locked=false;
  const order=shuffle(D.cur.o.map((t,i)=>({t,r:i===D.cur.a})));
  order.forEach(o=>{
    const b=document.createElement('button');
    b.className='opt'; b.textContent=o.t;
    b.onclick=()=>duelAnswer(b,o.r);
    box.appendChild(b);
  });
  // 老子隐身：跳过难题
  // 助手技：东坡指点（每场一次，首题自动提示）
  if(!D.helper.used && D.helper.n==='苏东坡' && D.round===1){
    D.helper.used=true;
    const opts=[...document.querySelectorAll('#dOpts .opt')];
    const wrong=opts.filter(b=>b.textContent!==D.cur.o[D.cur.a]);
    if(wrong.length){ pick(wrong).classList.add('dim'); }
    duelCameo('苏东坡捋须而笑：「此路不通，另寻明路。」');
  }
  // 计时
  dLeft=20+(D.helper.n==='桂花雨'?5:0);
  $('dTimer').style.width='100%';
  clearInterval(dTimerId);
  dTimerId=setInterval(()=>{
    dLeft--; $('dTimer').style.width=Math.max(0,dLeft/25*100)+'%';
    if(dLeft<=0){ clearInterval(dTimerId); if(!D.locked){ D.locked=true; duelResolve(null,false,true); } }
  },1000);
}
function duelAnswer(btn,right){
  if(D.locked) return;
  D.locked=true; clearInterval(dTimerId);
  document.querySelectorAll('#dOpts .opt').forEach(b=>b.disabled=true);
  flyPen(btn);
  setTimeout(()=>duelResolve(btn,right,false),420);
}
function duelResolve(btn,right,timeout){
  const foeRight=Math.random()<D.foe.skill;
  let lines='';
  if(right){
    btn&&btn.classList.add('right'); sndRight();
    lines+='✒ 你一笔点中！';
    D.correctMe++;
  }else{
    btn&&btn.classList.add('wrong'); sndWrong();
    lines+= timeout?'⌛ 笔慢了半拍！':'墨迹晕开了……';
    document.querySelectorAll('#dOpts .opt').forEach(b=>{
      if(!b.classList.contains('wrong')&&b.textContent===D.cur.o[D.cur.a]) b.classList.add('right');
    });
  }
  const meHit = right && !foeRight;
  const foeHit = !right && foeRight;
  setTimeout(()=>{
    if(foeRight){ lines+=' 对手'+D.foe.n+'也稳稳一笔。'; }
    else{ lines+=' 对手'+D.foe.n+'失手了！'; }
    if(meHit){
      D.hpFoe--; sndHit(); duelCameo(''+D.foe.n+'的笔力被削去一分！'+pick(['「好个隐者！」','「不可思议！」围观者沸腾了。','「这一笔，稳！」']));
    }else if(foeHit){
      if(!D.helper.used && D.helper.n==='567'){
        D.helper.used=true;
        lines+=' 567 挺身而出，挡在你面前——「自我牺牲」发动，笔力不损！';
      }else{
        D.hpMe--; sndHit(); duelCameo('你被'+D.foe.n+'的大刀笔扫中，笔力少了一分！');
      }
    }else{
      duelCameo('两笔相抵，火花四溅，谁也没占到便宜。');
    }
    $('dVerdict').textContent=lines;
    $('dVerdict').innerHTML=lines+' <span style="font-size:12.5px;color:#8a6d3b;">'+D.cur.n+'</span>';
    updHp();
    setTimeout(()=>{
      if(D.hpMe<=0||D.hpFoe<=0){ endDuel(); return; }
      nextDuelQ();
    },1500);
  },700);
}
function endDuel(){
  clearInterval(dTimerId);
  D.over=true;
  if(D.hpMe>D.hpFoe || (D.hpMe===D.hpFoe&&D.correctMe>D.round/2)) showCert(hero.name+' 击败了 '+D.foe.n+'，山顶只回荡着一句话——「恭喜隐者，获得鬼笔王的称号！」');
  else {
    $('dScene').textContent='败北';
    $('dText').textContent=D.foe.n+' 的笔力更胜一筹。但原著里若愚说过：真正的高手，从来不是一次就赢的。';
    $('dOpts').innerHTML=''; $('dVerdict').textContent='';
    const nb=document.createElement('button');
    nb.className='btn btn-gold'; nb.textContent='回玉笔殿 · 再战 ↺';
    nb.onclick=()=>{ D.over=false; go('jade'); };
    $('dFoot').appendChild(nb);
  }
}

/* ---- 同屏双人对战 ---- */
function passScreen(n){
  $('duelQ').style.display='none'; $('passBox').style.display='block';
  const who=n===1?D.p1:D.p2;
  $('passTitle').textContent='第 '+n+' 轮 · '+who;
  $('passText').textContent='请把设备交给「'+who+'」。每位挑战者将独立作答 5 道山顶考题，答对多者成为鬼笔王；战平则双王同辉！';
  $('passBtn').textContent=(n===1?'我准备好了 · 开始作答':who+' 作答完毕 · 查看战果');
  if(n===2) $('passTitle').textContent='第 2 轮 · '+D.p2;
  $('passBtn').onclick=()=>{
    if(n===1){ runSolo(1,(c1)=>{ D.p1Correct=c1; passScreen(2); }); }
    else{
      runSolo(2,(c2)=>{
        D.p2Correct=c2;
        if(D.p1Correct>D.p2Correct) showCert(D.p1+' 以 '+D.p1Correct+':'+D.p2Correct+' 险胜'+D.p2+'，夺得鬼笔王！');
        else if(D.p2Correct>D.p1Correct) showCert(D.p2+' 以 '+D.p2Correct+':'+D.p1Correct+' 险胜'+D.p1+'，夺得鬼笔王！');
        else showCert(D.p1+' 与 '+D.p2+' 战成平手——山顶罕见的「双鬼笔王同辉」！');
      });
    }
  };
}
function runSolo(turn,onDone){
  const pool=D.qpool.slice(0,5); let correct=0,i=0;
  $('passBox').style.display='none'; $('duelQ').style.display='block';
  const meName=turn===1?D.p1:D.p2;
  $('meFName').textContent=meName; $('foeFName').textContent='山顶考题 ×5';
  const ask=()=>{
    if(i>=5){ $('duelQ').style.display='none'; onDone(correct); return; }
    const item=pool[i++];
    D.cur=item; D.locked=false;
    $('dScene').textContent=meName+' · 第 '+i+'/5 题';
    $('dText').textContent=item.q;
    $('dVerdict').textContent=''; $('dFoot').innerHTML='';
    $('foeBubble').textContent='山顶的风替你数着题。';
    const box=$('dOpts'); box.innerHTML='';
    shuffle(item.o.map((t,i2)=>({t,r:i2===item.a}))).forEach(o=>{
      const b=document.createElement('button');
      b.className='opt'; b.textContent=o.t;
      b.onclick=()=>{
        if(D.locked) return; D.locked=true;
        flyPen(b);
        setTimeout(()=>{
          const ok=o.r;
          if(ok){ b.classList.add('right'); correct++; sndRight(); $('foeBubble').textContent='✒ 好一笔！'; }
          else{ b.classList.add('wrong'); sndWrong(); $('foeBubble').textContent='可惜……'+item.n; }
          updSoloHp(correct,i);
          setTimeout(ask,1200);
        },400);
      };
      box.appendChild(b);
    });
    updSoloHp(correct,i-1);
  };
  ask();
  return correct;
}
function updSoloHp(correct,total){
  $('meHp').style.width=(total?correct/total*100:100)+'%';
  $('foeHp').style.width=(total?Math.max(0,(total-correct))/total*100:100)+'%';
}

/* ---- 鬼笔王证书 ---- */
function showCert(story){
  sndWin(); sndCrown();
  const chars='ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let code='';
  for(let i=0;i<6;i++) code+=chars[Math.floor(Math.random()*chars.length)];
  $('certWho').textContent='兹授予 笔侠「'+hero.name+'」';
  $('certBody').innerHTML=story.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'<br>你已集齐土、木、铜、银、金、玉六级神笔之力，登顶玉笔殿，加冕为本届<b>鬼笔王</b>。<br>'+
    '将这份证书留作你的试炼纪念。';
  $('certCode').textContent='鬼笔之魂·'+code;
  go('cert');
}

/* ================================================================
   笔勋章图卡：六级笔勋章 × 雅号 × 赞美 × 诗句评语
   ================================================================ */
const PEN_URL=location.href;
const PEN_QR='';
const PEN_TIERS=[
  {min:92,k:'玉',n:'玉 笔 勋 章',dm:'玉笔 · 万里挑一',c1:'#b6f2e2',c2:'#2f7f6e',ink:'#1c6154'},
  {min:82,k:'金',n:'金 笔 勋 章',dm:'金笔 · 锋芒毕露',c1:'#ffe6a3',c2:'#b8860b',ink:'#8a5a00'},
  {min:72,k:'银',n:'银 笔 勋 章',dm:'银笔 · 月光洗笔',c1:'#f2f6fa',c2:'#8b96a3',ink:'#57616c'},
  {min:60,k:'铜',n:'铜 笔 勋 章',dm:'铜笔 · 半山钟响',c1:'#f0c796',c2:'#9c6b3a',ink:'#7a4b22'},
  {min:45,k:'木',n:'木 笔 勋 章',dm:'木笔 · 风里长一寸',c1:'#c4e0a6',c2:'#4e7a3f',ink:'#3c6034'},
  {min:0, k:'土',n:'土 笔 勋 章',dm:'土笔 · 泥土里发芽',c1:'#e2c9ae',c2:'#8a6a4f',ink:'#654a34'}
];
const PEN_TITLES=[
  '墨池边的少年','把字写进风里的人','砚台不必磨第二遍','书页里的侠客','推敲先生','一字之师',
  '青竹林的抄书人','月下改诗的人','纸上散步的隐者','半山钟的敲钟人','笔画里的猎手','诗句搬运工',
  '笔锋上的舞者','墨香追风者','旧纸堆的守夜人','会背诗的小狼','山道上最后离开的人','拆句子的人',
  '把古文读成故事的人','砚边小先生','笔下生花的那位','题海里钓月亮的人','写字最快的少年','最后一个交卷却全对的人'
];
const PEN_PRAISE=[
  '你背过的诗，会在你没留意的时候，替你把话说漂亮。',
  '你写字的时候不看别人，所以你的字越来越像你自己。',
  '你能在一堆错答案里认出对的那句，这叫眼力。',
  '古文在你嘴里不老，反而像是刚写完的。',
  '你不怕生字，你只是先把它拆开看看。',
  '你读得慢，但读进去的东西不会再跑掉。',
  '你的记性不吵，需要的时候它自己开门。',
  '你把「不会」两个字，当成「还没会」。',
  '你答错的时候不脸红——这是能走远的人才有的样子。',
  '你能把一句诗读成一幅画，这本事别人学不来。',
  '你手上有一支笔，心里有一股劲。',
  '你越难的题越安静，安静里有刀。',
  '你不急着抢答，你想把每个字都放对位置。',
  '你的错题本比别人的课本干净，因为你是真改过。',
  '你课堂上没说完的话，都写进答案里了。',
  '你听得懂古人的口气，所以古文对你客气。',
  '你的笔画像走路，一步一步，稳。',
  '你把厚书读薄了，又把薄书读厚了。',
  '你不迷信标准答案，你要先弄明白为什么。',
  '你的字里有风，风里站着一个人。',
  '你比昨天多认识一个字，这就是很了不起的事。',
  '你读过的东西，正在悄悄替你铺路。',
  '你身上有一点旧书卷气，这东西很贵。',
  '你是那种，老师讲到一半会停下来看一眼的学生。'
];
const PEN_LINES=[
  '笔下有风，字里有光。','一横一竖，皆是少年。','墨尽处，字犹香。',
  '山中无捷径，笔下有通途。','字是人的影子，你的影子站得直。','读过的书，会替你说话。',
  '锋芒不必外露，落笔自知。','少年不负笔，笔不负少年。','玉笔在手，心仍如土。',
  '笔下千军，纸上万里。','墨池三尺，可养一生。','写完这一笔，山就过去了。'
];
const penUsed = Object.create(null);
function penPickNo(pool,key){
  let used=penUsed[key] || [];
  if(!Array.isArray(used)||used.length>=pool.length) used=[];
  let i,guard=0;
  do{ i=Math.floor(Math.random()*pool.length); guard++; }while(used.includes(i)&&guard<60);
  used.push(i);
  penUsed[key]=used;
  return pool[i];
}
function penStats(){
  const d=(typeof D!=='undefined'&&D)?D:{};
  const correct=Math.max(d.correctMe||0, d.correctP1||0, d.correctP2||0);
  const rounds=Math.max(correct, d.round||correct, 1);
  const hp=(typeof d.hpMe==='number')?d.hpMe:3;
  const acc=Math.min(1,correct/rounds);
  const s=Math.max(0,Math.min(100,Math.round(acc*62+(hp/3)*26+8)));
  return {correct, rounds, hp, acc, s};
}
function pRr(x,px,py,w,h,r){
  x.beginPath();
  x.moveTo(px+r,py); x.arcTo(px+w,py,px+w,py+h,r); x.arcTo(px+w,py+h,px,py+h,r);
  x.arcTo(px,py+h,px,py,r); x.arcTo(px,py,px+w,py,r); x.closePath();
}
function pWrap(x,text,maxW){
  const out=[]; let line='';
  for(const ch of String(text)){
    if(x.measureText(line+ch).width>maxW && line){ out.push(line); line=ch; }
    else line+=ch;
  }
  if(line) out.push(line);
  return out;
}
function buildPenCard(){
  const st=penStats();
  const tier=PEN_TIERS.filter(t=>st.s>=t.min)[0]||PEN_TIERS[PEN_TIERS.length-1];
  const title=penPickNo(PEN_TITLES,'title');
  const praise=penPickNo(PEN_PRAISE,'praise');
  const line=penPickNo(PEN_LINES,'line');
  const name=(typeof hero==='object'&&hero&&hero.name)?hero.name:'隐者';
  const W=1080,H=1780;
  const c=document.createElement('canvas'); c.width=W; c.height=H;
  const x=c.getContext('2d');
  /* 宣纸底 */
  const bg=x.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#fdf8e9'); bg.addColorStop(.5,'#f8efd8'); bg.addColorStop(1,'#eddfc0');
  x.fillStyle=bg; x.fillRect(0,0,W,H);
  let seed=(name.length*7919+title.length*104729+Math.floor(Date.now()/86400000))>>>0;
  const rnd=()=>{ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; };
  for(let i=0;i<260;i++){
    x.globalAlpha=rnd()*.07+.015; x.fillStyle='#6b4f2a';
    x.beginPath(); x.arc(rnd()*W,rnd()*H,rnd()*1.7+.3,0,7); x.fill();
  }
  x.globalAlpha=1;
  /* 双层边框 */
  x.strokeStyle='rgba(176,125,43,.72)'; x.lineWidth=4; pRr(x,34,34,W-68,H-68,26); x.stroke();
  x.strokeStyle='rgba(176,125,43,.3)'; x.lineWidth=1.5; pRr(x,52,52,W-104,H-104,20); x.stroke();
  const KAI=(sz,w)=>(w?'900 ':'')+sz+"px 'STKaiti','KaiTi','楷体',serif";
  const SANS=(sz,w)=>(w?'800 ':'')+sz+"px 'PingFang SC','Microsoft YaHei',sans-serif";
  const T=(t,y,f,col,al)=>{ x.font=f; x.fillStyle=col; x.textAlign=al||'center'; x.textBaseline='alphabetic'; x.fillText(t,W/2,y); };
  /* 顶部 */
  T('少 年 笔 侠 · 鬼 笔 之 魂',96,SANS(28,true),'rgba(74,58,16,.55)');
  /* 勋章 */
  const cx=W/2, cy=362, R=118;
  [-1,1].forEach(dir=>{
    x.save(); x.translate(cx+dir*40,cy-R+18); x.rotate(dir*0.3);
    const rg=x.createLinearGradient(0,-118,0,14);
    rg.addColorStop(0,tier.c2); rg.addColorStop(1,tier.c1);
    x.fillStyle=rg; x.fillRect(-27,-118,54,146);
    x.restore();
  });
  const mg=x.createLinearGradient(cx-R,cy-R,cx+R,cy+R);
  mg.addColorStop(0,tier.c1); mg.addColorStop(.42,tier.c2); mg.addColorStop(.75,tier.c1); mg.addColorStop(1,tier.c2);
  x.beginPath(); x.arc(cx,cy,R,0,7); x.fillStyle=mg; x.fill();
  x.beginPath(); x.arc(cx,cy,R-17,0,7); x.fillStyle='#fbf4e0'; x.fill();
  x.strokeStyle=tier.c2; x.lineWidth=2;
  x.beginPath(); x.arc(cx,cy,R-17,0,7); x.stroke();
  x.beginPath(); x.arc(cx,cy,R-24,0,7); x.strokeStyle='rgba(176,125,43,.35)'; x.lineWidth=1;
  for(let i=0;i<56;i++){
    const a=i/56*Math.PI*2;
    x.beginPath();
    x.moveTo(cx+Math.cos(a)*(R-17),cy+Math.sin(a)*(R-17));
    x.lineTo(cx+Math.cos(a)*(R-(i%2?9:12)),cy+Math.sin(a)*(R-(i%2?9:12)));
    x.strokeStyle=i%2?tier.c2:'rgba(176,125,43,.55)'; x.lineWidth=i%2?4:2; x.stroke();
  }
  x.font=KAI(132,true); x.fillStyle=tier.ink; x.textAlign='center';
  x.fillText(tier.k,cx,cy+48);
  /* 等级名 */
  T(tier.n,578,KAI(70,true),tier.ink);
  T(tier.dm,622,SANS(27,true),'rgba(74,58,16,.6)');
  /* 雅号 */
  T('「 '+title+' 」',716,KAI(54,true),'#3a2c12');
  /* 名字与战绩 */
  T('笔侠 '+name+' · 决战答对 '+st.correct+' 题 · 笔力剩 '+st.hp+'/3',762,SANS(28),'rgba(74,58,16,.72)');
  /* 分隔 */
  x.strokeStyle='rgba(176,125,43,.55)'; x.lineWidth=2;
  x.beginPath(); x.moveTo(W/2-210,806); x.lineTo(W/2-30,806); x.moveTo(W/2+30,806); x.lineTo(W/2+210,806); x.stroke();
  x.font=SANS(26); x.fillStyle='#b07d2b'; x.fillText('❖',W/2,818);
  /* 赞美 */
  x.font=SANS(34);
  const pl=pWrap(x,praise,860);
  let py=884;
  pl.forEach(t=>{ T(t,py,SANS(34),'#41321a'); py+=58; });
  /* 评语（诗句） */
  const by=Math.max(py+4,958), boxH=138;
  x.setLineDash([10,7]); x.strokeStyle='rgba(176,125,43,.65)'; x.lineWidth=2;
  pRr(x,112,by,W-224,boxH,16); x.stroke(); x.setLineDash([]);
  x.fillStyle='rgba(176,125,43,.07)'; pRr(x,112,by,W-224,boxH,16); x.fill();
  x.font=SANS(22,true); x.fillStyle='rgba(138,90,0,.7)'; x.textAlign='left';
  x.fillText('墨 评',150,by+38);
  x.textAlign='center';
  T(line,by+96,KAI(48,true),'#3a2c12');
  /* 印章 */
  x.save(); x.translate(884,by-6); x.rotate(-0.09);
  x.strokeStyle='#c0392b'; x.lineWidth=5; pRr(x,0,0,104,104,10); x.stroke();
  x.font=KAI(30,true); x.fillStyle='#c0392b'; x.textAlign='center';
  x.fillText('鬼',26,42); x.fillText('笔',78,42);
  x.fillText('之',26,86); x.fillText('魂',78,86);
  x.restore();
  /* 纪念图案 */
  const qs=250, qx=(W-qs)/2, qy=by+boxH+58;
  x.fillStyle='rgba(176,125,43,.08)'; pRr(x,qx-13,qy-13,qs+26,qs+26,16); x.fill();
  T('试炼纪念',qy+qs/2,KAI(42,true),'#8a5a00');
  const out={url:'',text:''};
  return new Promise(res=>{
    const done=img=>{
      try{ if(img) x.drawImage(img,qx,qy,qs,qs); }catch(e){}
      T('笔侠试炼 · 看看你是什么笔',qy+qs+58,SANS(34,true),'rgba(58,44,18,.9)');
      T('长按保存这张勋章 · 发到朋友圈，喊同窗来比武',qy+qs+104,SANS(26),'rgba(58,44,18,.55)');
      out.url=c.toDataURL('image/png');
      res(out);
    };
    done(null);
  }).then(o=>{
    o.text='我是【'+tier.n.replace(/\s/g,'')+'】「'+title+'」\n'+praise+'\n《鬼笔之魂》六级神笔已通关——来比比谁的笔更硬：\n👉 '+PEN_URL;
    return o;
  });
}
function openPenCard(){
  go('medal'); sndRight(); renderPenCard();
}
function renderPenCard(){
  const st=$('mdStage'); if(!st) return;
  st.innerHTML='<div class="md-loading">🖌 笔墨正在晾干……</div>';
  buildPenCard().then(p=>{
    if(!p||!p.url){ st.innerHTML='<div class="md-loading">勋章没画出来，请重试一次。</div>'; return; }
    renderPenCard._last={text:p.text, url:p.url};
    st.innerHTML=
      '<img class="md-img" src="'+p.url+'" alt="我的笔勋章">'+
      '<div class="md-tip" style="margin-top:12px;">勋章 + 文案都已备好 · 点一下就能发</div>'+
      '<div class="md-copy">'+p.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>')+'</div>'+
      '<div style="text-align:center;">'+
        '<button class="btn btn-gold" style="font-size:15px;padding:13px 28px;" onclick="sharePenMoments(this)">📲 一键发朋友圈</button>'+
        '<div style="margin-top:9px;"><button class="btn btn-dark" style="font-size:12.5px;padding:9px 20px;" onclick="copyPenText(this)">📋 只复制文案</button></div>'+
        '<div style="margin-top:12px;"><button class="btn btn-dark" onclick="go(\'cert\')">← 回到证书</button></div>'+
      '</div>';
  }).catch(()=>{ st.innerHTML='<div class="md-loading">勋章没画出来，请重试一次。</div>'; });
}
/* —— 一键发朋友圈：优先系统分享面板，否则存图 + 复制文案 + 三步指引 —— */
function penWeixin(){ return /micromessenger/i.test(navigator.userAgent||''); }
function penDataURLtoFile(u,name){
  const sp=String(u).split(',');
  const mime=(sp[0].match(/:(.*?);/)||[,'image/png'])[1];
  const bin=atob(sp[1]||''); const arr=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
  return new File([arr], name||'medal.png', {type:mime});
}
function penSaveDataURL(u,name){
  try{
    const a=document.createElement('a');
    a.href=u; a.download=name||'medal.png'; a.rel='noopener';
    document.body.appendChild(a); a.click(); a.remove(); return true;
  }catch(e){ return false; }
}
function penMomentGuide(txt){
  const old=document.getElementById('mgMask'); if(old) old.parentNode.removeChild(old);
  const wx=penWeixin();
  const div=document.createElement('div');
  div.className='mg-mask'; div.id='mgMask';
  div.innerHTML='<div class="mg-box">'+
    '<div class="mg-t">三步发到朋友圈</div>'+
    '<ol class="mg-steps">'+
      '<li>'+(wx?'<b>长按上面那张勋章图</b> → 选「保存图片」':'勋章图已保存到相册；<b>万一没存上，长按图保存</b>')+'</li>'+
      '<li>文案<b>已经复制好了</b>'+
        (wx?'——微信里有时不让自动复制，点下面的「再复制一次」最稳':'')+'</li>'+
      '<li>打开微信 →「发现」→ 朋友圈 → 右上角相机 → 从相册选这张图 → 长按输入框「粘贴」→ 发表</li>'+
    '</ol>'+
    '<div class="mg-acts">'+
      '<button class="btn btn-gold" id="mgCopy">📋 再复制一次文案</button>'+
      '<button class="btn btn-dark" style="font-size:13px;" id="mgClose">知道了</button>'+
    '</div>'+
    '<div class="mg-note">微信不允许网页替你把内容直接发出去——最后一步得你亲手按一下。<br>分享文案中的链接可用于再次打开应用。</div>'+
  '</div>';
  document.body.appendChild(div);
  div.addEventListener('click',e=>{ if(e.target===div) div.parentNode.removeChild(div); });
  const c=div.querySelector('#mgClose'); if(c) c.onclick=()=>{ if(div.parentNode) div.parentNode.removeChild(div); };
  const g=div.querySelector('#mgCopy'); if(g) g.onclick=function(){ copyPenText(this, txt); };
}
function sharePenMoments(btn){
  const d=renderPenCard._last||{};
  if(!d.url) return;
  const txt=d.text||'';
  const name='我的笔勋章.png';
  if(btn){ const o=btn.textContent; btn.textContent='📤 正在准备…'; btn.disabled=true;
    setTimeout(()=>{ btn.textContent=o; btn.disabled=false; },2200); }
  try{ copyPenText(null, txt); }catch(e){}
  let handed=false;
  try{
    const file=penDataURLtoFile(d.url, name);
    if(navigator.canShare && navigator.canShare({files:[file]}) && navigator.share){
      handed=true;
      navigator.share({files:[file], text:txt}).then(()=>{
        setTimeout(()=>penMomentGuide(txt), 700);
      }).catch(()=>{ penMomentGuide(txt); });
    }
  }catch(e){}
  if(!handed){
    if(!penWeixin()) penSaveDataURL(d.url, name);
    setTimeout(()=>penMomentGuide(txt), 420);
  }
}
function copyPenText(btn, txt){
  txt = txt || (renderPenCard._last&&renderPenCard._last.text) || '';
  const ok=()=>{ if(btn){ const o=btn.textContent; btn.textContent='✅ 已复制，去粘贴吧'; btn.disabled=true;
    setTimeout(()=>{ btn.textContent=o; btn.disabled=false; },1800); } };
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(ok,()=>penFallbackCopy(txt,ok)); }
    else penFallbackCopy(txt,ok);
  }catch(e){ penFallbackCopy(txt,ok); }
}
function penFallbackCopy(txt,ok){
  try{
    const ta=document.createElement('textarea');
    ta.value=txt; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta); ok();
  }catch(e){}
}


/* ================================================================
   你问虎答 · 四虎知识库 + 讲述风格引擎
   ================================================================ */
const HU_KB=[
/* —— 《半边人》 —— */
{t:['布巴','变两半','两半','分裂','怎么变'],q:'布巴为什么会变成两个半边人？',
 a:'嗐，这事儿说起来都怪那顶魔术帽。布巴五岁生日，他爸爸送了他一顶帽子，放进什么东西都能变成一模一样的两份。大人千叮咛万嘱咐，说帽子不能往头上戴——结果你猜怎么着？小孩哪有不想试试的。他一戴上去，人就成了两个，一人一半身子，各有各的脾气。你看，故事往往就从一句"千万别"开始。'},
{t:['帽子','魔术帽','来历','谁给的'],q:'那顶魔术帽是从哪里来的？',
 a:'书里我给它安排了一段来历，不是随便捡来的道具。你想想，一个能把世界复制一份的帽子，它背后一定藏着个秘密——所以后面才有"魔术帽数字之谜"那些章节。虎叔写东西有个习惯：先给宝贝编个来路，故事才站得住。你也可以试试，给你的魔法道具写一份"出生证明"。'},
{t:['布鲁布','巴拉巴','两个半边人','区别','一个变好'],q:'布鲁布和巴拉巴为什么一个好一个坏？',
 a:'他俩本来是同一个人，分开了，各走进一条沟：一个进了青青沟，一个进了红红沟。环境不一样，遇上的人不一样，性子就慢慢岔开了。这也是我想说的那句话——好和坏不是天生的标签，是长出来的。你别急着给谁下结论，包括你自己。'},
{t:['青青沟','红红沟','两个沟'],q:'青青沟和红红沟是什么样的地方？',
 a:'一绿一红，一个柔软，一个滚烫。青青沟适合养耐心，红红沟容易点着火气。人这一辈子，两条沟都得走一走。你在这两个游戏里选红还是选绿，其实也是在认自己身上那两半。'},
{t:['半边国','半边人的世界'],q:'半边国是一个怎样的世界？',
 a:'一整个国家，人人只有半边身子。你乍一听觉得荒唐，可你细想——我们成年人，不也常常只剩半边吗？会挣钱的那半边长得壮，会好好说话、好好难过的那半边，早就萎缩了。所以我把它写成个国家，让小孩先看见这件事。'},
{t:['结局','合体','后来','最后'],q:'布鲁布和巴拉巴最后合体了吗？',
 a:'这我可不能全说，说了你还看什么书呢。我只能告诉你：这个故事的名字叫"半边人"，它从"分开"开始，一定得走到"遇上"那一步。合不合体，怎么合，你自己翻到最后一页——记得回来告诉虎叔你猜对没有。'},
{t:['为什么写','灵感','怎么想出来','创作'],q:'《半边人》这个故事您是怎么想出来的？',
 a:'说出来有点不好意思——是我给孩子讲睡前故事偷懒。那天我随口编了个开头："从前有个小孩，突然变成两半了，一半叫布鲁布，另一半叫巴拉巴。"孩子一听就来劲，天天追着问后来呢。我没法赖账，只好一天接一天地编，编到最后，成了书。你看，好故事有时候不是想出来的，是被追问出来的。'},
{t:['寓意','想告诉','道理','意思'],q:'《半边人》到底想告诉我们什么？',
 a:'我不想端着讲道理，就说一句心里话：每个孩子长大，都得跟自己心里那个"不太好的半边"打一架，最后再跟他讲和。打完讲和了，人才完整。所以别怕自己身上有那一半，怕的是你从来不认它。'},
{t:['我也有','我自己','我有时候','半个自己'],q:'我有时候也会做坏事，我是不是也是半边人？',
 a:'你当然是，虎叔也是，谁都是。人不是一块完整的玉，是两块拼起来的石头。你今天想偷懒，明天又想争气——这不叫坏，这叫活着。要紧的是，你得知道自己有那半边，还得愿意跟它商量。'},
{t:['布巴爸爸','爸爸妈妈','家长','父母'],q:'布巴的爸爸妈妈是怎么做的？',
 a:'书里的爸爸妈妈，一开始也慌，也想赶紧把两个半边人捏回一个。他们犯过错、闹过笑话，但他们没放弃。当爹妈的最难的一课，是承认孩子身上有你管不了的那一半。你爸妈要是也慌，你就把这本书塞给他们看看。'},
{t:['咖啡厅','大书柜','数字之谜','书柜'],q:'书里的咖啡厅和大书柜藏着什么秘密？',
 a:'嘘——那些是书里的暗门，虎叔一说破，你读的时候就少了"咔哒"一声的乐子。我只能提醒你：凡是反复出现的数字和门，都不是随手写的。你读的时候拿支笔，把它们圈出来，自己串一串，比问我强。'},
{t:['最喜欢','哪个角色','最爱的'],q:'您最喜欢书里哪个角色？',
 a:'布鲁布和巴拉巴，我一样疼。当爹的偏心哪个孩子，都对不起另一个。真要挑，我偏爱那个不太讨人喜欢的——因为写他的时候，我更像在照镜子。'},

/* —— 《少年笔侠》 —— */
{t:['若愚','主角','原型','是不是你'],q:'若愚是不是照您孩子写的？',
 a:'若愚身上有我家孩子的影子，也有我自己的小时候。小孩那种笨笨的认真、怕被说笨、又想被看见，我全记得。写童话有个方便处：你可以把童年那个自己重新领回家，让他这回过得好一点。'},
{t:['鬼笔之魂','这个游戏','游戏是真的吗','陷阱'],q:'《鬼笔之魂》这个游戏真的存在吗？',
 a:'书里的游戏，是黑老板做的一个漂亮陷阱——它替孩子答题、替孩子写作文，看起来满分，实际上把本领偷偷拿走了。现实里没有那顶帽子，但"替你写作业的东西"一直都在。所以我干脆把它做成真的游戏，反过来考你：这回没人替你写，你自己上。'},
{t:['密码','贾岛','登录'],q:'为什么登录密码是"贾岛"？',
 a:'贾岛是那个"推敲"的诗人——"鸟宿池边树，僧敲月下门"，一个字想半天，撞了官老爷的仪仗队都不知道。若愚能猜出密码，不是他聪明，是他把诗读进了心里。我把密码设成他，就是想告诉小朋友：你背过的诗，会在你想不到的时候替你开门。'},
{t:['小玉笔','玉笔','黑石头','秀玉'],q:'小玉笔真的存在吗？',
 a:'书里那支小玉笔，是用爷爷猪圈里那块黑石头切出来的秀玉雕的，吴师傅的手艺。现实里当然没有会答题的芯片笔——但"一支属于自己的笔"是真的有。你手里那支写得最顺的笔，就是你的小玉笔，别弄丢了。'},
{t:['雷神咒','咒语','咒'],q:'雷神咒怎么念？真的有用吗？',
 a:'雷神咒不是拿来念给别人听的，是念给自己的。爷爷教若愚之前，先让他站好、静一静、心里想着要办的事——那套仪式比咒语本身要紧。说白了，它是一种"我要开始了"的自我提醒。你要愿意，也可以给自己编一句，考试前默念三遍，比什么都管用。'},
{t:['锦囊妙计','锦囊','三个锦囊'],q:'爷爷的锦囊妙计里写的是什么？',
 a:'爷爷给孩子留了三个锦囊，关于怎么写东西。具体的话你得去书里找——但我可以告诉你它们的共同点：都不是教你耍花招，而是教你别撒谎。写东西最怕装，一装，读者立刻闻出来。'},
{t:['567','五六七'],q:'567 是谁？为什么叫这么个名字？',
 a:'567 是若愚的同学，也是游戏里的战友，名字就是个代号，念起来像敲门声。这人有意思：平时笑嘻嘻、上课偷偷睡觉、看《鬼笔秘密攻略》，关键时候却把自己所有的积分和装备都送给了朋友。虎叔写他，是想说：看着不靠谱的人，心里可能最讲义气。'},
{t:['黑石','女','对手','反派'],q:'黑石是好人还是坏人？',
 a:'黑石是个女孩，出手极狠，一直蒙着脸，谁都以为她是最大的对手。可你读到最后会发现，事情没那么简单——她的脸，藏着整本书最大的一个秘密。人不是非黑即白的，连名字里带"黑"的都未必是黑的。'},
{t:['闰土','桂花雨','苏东坡','老子','课文人物','鲁迅','孟子'],q:'为什么游戏里会出现课文里的人物？',
 a:'因为那些人物本来就活在孩子的课本里，只是一直没被"请出来"玩过。我让他们提着笔在山路上走：老子骑青牛丢下一句"大象无形"，桂花雨一跑过满屏桂花，少年闰土还在问"猹哪里去了"。你把课文当朋友，它就不是背诵任务了。'},
{t:['鬼笔王','称号','金指甲','奖品','玉笔殿'],q:'鬼笔王是什么？赢了真的有小玉笔吗？',
 a:'书里说，山顶有一支无敌玉笔，谁赢了谁就是鬼笔王，还能得到一套"金指甲"——芯片里装着小学所有答案，笔会自动替你写。听着诱人吧？可你想想，那样的话，"你"还在哪儿呢。游戏中的证书与暗号仅作通关纪念。'},
{t:['结局','谁赢了','冠军'],q:'最后谁赢了？若愚当上鬼笔王了吗？',
 a:'书里那场山顶决战，打得比游戏复杂得多：有人偷袭，有人背叛，有人把命都豁出去护着朋友。最后谁举起玉笔，我不剧透。但你可以留意一件事——真正让局面翻过来的，不是笔的等级，是若愚先鞠的那个躬。'},
{t:['六级','土笔','木笔','铜笔','银笔','金笔','玉笔','等级'],q:'为什么笔要分成土、木、铜、银、金、玉六级？',
 a:'土最贱，也最贴地；木会生长；铜会响；银亮；金贵；玉呢，是石头里养出来的温润。六级不是战斗力排行，是一条"人怎么长起来"的路——从泥里起，最后成了玉。你在这个网页里一级一级升，就是在走这条路。'},
{t:['隐者','名字','网名'],q:'若愚为什么在游戏里叫"隐者"？',
 a:'因为他一开始谁也不敢惹，只想躲起来看清楚。老子还专门给了他一句"大象无形，道隐无名"——按一下空格就能隐身。可你注意，隐者最后是站出来的。躲，是为了看清；看清了，就得出来。'},
{t:['最想','记住','一句话'],q:'您最想让小朋友记住书里哪句话？',
 a:'"熟读唐诗三百首，不会作诗也会吟。"这是爷爷的话，也是我的老实话。你不用急着会写，先把好东西装进肚子里；装够了，它自己会说话。'},

/* —— 写作 —— */
{t:['作文','怎么写','写不好','提高'],q:'作文总是写不好怎么办？',
 a:'我跟你讲个笨办法：别一上来就想"写一篇好作文"，先想"我要告诉谁一件什么事"。你把它讲给同桌听，讲得他抬头了，你再落笔，八成就不差。作文写不好，多半不是词少，是心里没有一个真想说的人。'},
{t:['流水账','没话说','不知道写什么','写不出'],q:'一写就是流水账，怎么办？',
 a:'流水账的毛病是"什么都写，什么都不深"。你试试砍掉一半：早上起床、刷牙、吃饭，全删；只留那个让你"咦"了一下的瞬间——比如水龙头滴了一滴水在你手上，凉的。从一个很小的点往下挖，挖出水来，就是好文章。'},
{t:['题目','起名字','标题'],q:'怎么给作文起一个好题目？',
 a:'别起"记一件难忘的事"这种帽子题。题目要像钩子，钩住人。你可以从文章里挑一个具体的物件当题目：《那半块橡皮》《一碗没吃完的面》。越具体越小，越有人想往下看。'},
{t:['开头','怎么开始','编故事'],q:'故事的开头怎么写才抓人？',
 a:'我编《半边人》的开头，就一句话："从前有个小孩，突然变成两半了。"没有背景，没有天气，直接把怪事扔出来。孩子立刻就问：后来呢？——这就是好开头：它逼着人问下一句。你可以拿你最喜欢的三个故事开头念一念，找找它们的共同点。'},
{t:['背诗','古诗','背不下来','有用吗'],q:'背古诗到底有什么用？',
 a:'现在看不出用，将来会在你想不到的时候冒出来。你在山顶看日落，别人只会说"哇好看"，你心里蹦出"夕阳无限好"——那一刻你就知道，那些诗没白背。它们是提前存进你身体里的钥匙。'},
{t:['想象力','想象','怎么练'],q:'想象力怎么练？',
 a:'三个小练习：一，给家里的旧东西编来历（这把椅子以前在谁家？）；二，把两件不相干的事硬连起来（下雨和考试有什么关系？）；三，把"如果"问到底（如果人只需要半边身体，会怎样？）。《半边人》就是从第三个问题长出来的。'},
{t:['写人','人物','像'],q:'怎么把一个人写得像真的？',
 a:'别写"他很善良"，写他做什么。我写567，不夸他好，只写他把所有积分都送给了朋友。人是用动作露出来的。你写你妈，别写"我妈很辛苦"，写她半夜起来给你关窗时那声轻轻的"咔"。'},
{t:['日记','每天写'],q:'日记不知道写什么？',
 a:'日记不用写给谁看，就写一句真话。今天最想骂谁、最想谢谢谁、哪一刻最想哭——写那个。写三十个字也算数。日记不是作业，是你给自己留的证据。'},
{t:['读书笔记','读后感'],q:'读后感怎么写才不假？',
 a:'别写"这本书让我明白了……"这种总结。你就写：书里哪一句让你停了一下？为什么停？那一停，就是真的读后感。假话写多了，你自己都会烦自己。'},
{t:['好词好句','优美词句','辞藻'],q:'作文要不要堆好词好句？',
 a:'好词好句像盐，一点点提味，一把下去整锅齁住。我的经验是：一句漂亮话，配三句大白话，才好看。你看老舍、汪曾祺，句句都像在跟你聊天，可就是忘不掉。'},
{t:['当作家','成为作家','写小说'],q:'我想当作家，现在该做什么？',
 a:'三件事：大量读、天天写、把人当人看。前两件你听过一百遍，第三件最要紧——作家的工作说到底就是"看见别人"。你今天放学路上，认真看一个陌生人的鞋，猜他今天过得怎么样，这就是训练。'},
{t:['一天写','写作习惯','坚持'],q:'您一天写多少字？',
 a:'当记者那些年，一天几千字是家常便饭；写童话反而慢，一天能磨出八百字就算不错。写作不靠灵感，靠坐得住。我给自己定的规矩很土：不管好坏，先写完。写完再改，改的时候才配上"才华"这两个字。'},

/* —— 成长 —— */
{t:['怕黑','黑','一个人睡','害怕'],q:'我晚上怕黑，怎么办？',
 a:'怕黑不丢人，虎叔小时候也怕。后来我学会一招：给黑的地方起名字。床底那块黑影，我叫它"守夜的老猫"；门后那条缝，我叫它"站岗的兵"。你把恐惧编成故事，它就没那么大了。这也是童话的一个用处。'},
{t:['嘲笑','被笑','同学笑','欺负'],q:'同学总笑我，我该怎么办？',
 a:'先记住一句：笑你的人，多半是怕自己被人笑。你不用跟他吵，也别急着证明自己。把力气留给喜欢的事——若愚一开始也被当成笨蛋，他后来靠的不是嘴，是笔。'},
{t:['爸妈','不理解','管我','吵架','父母'],q:'爸爸妈妈不理解我怎么办？',
 a:'我当爹也当过"不理解的爸爸"，说句公道话：大人常常是急，不是坏。你可以试试换个说法——不说"你别管我"，说"这件事我想自己试一次，行不行？给我三天"。给大人一个具体的方案，比吵十架管用。'},
{t:['考砸','成绩','没考好','分数'],q:'考试考砸了，很难受。',
 a:'砸一次不要紧，要紧的是别把"这次没考好"听成"我就是不行"。你看若愚，在游戏里也被人打得落花流水，还得靠朋友护着。他后来赢，不是因为从没输过，是因为输了还愿意再走上山顶。'},
{t:['没朋友','孤独','一个人','交朋友'],q:'我没有朋友，很孤单。',
 a:'孤单这件事，虎叔懂。你先别急着"交朋友"，先去找一件你真心喜欢的事，去那个事儿的场合——喜欢画画的去画室，喜欢虫子的去草丛。朋友不是找来的，是在同一件事旁边站久了，自然就认识的。'},
{t:['脾气','生气','控制不住','发火'],q:'我脾气不好，老是发火。',
 a:'脾气像红红沟的火，旺，但不全是坏事——它说明你心里有劲儿。要学的不是把火掐灭，是给它找个正经出口：跑步、打球、写下来、把纸撕碎。虎叔写东西，一半是为了这个。'},
{t:['放弃','坚持不下去','太难'],q:'我想放弃了，太难了。',
 a:'那就先歇一会儿，别急着做决定。放弃和休息，看着像，其实差得远：休息是"我缓缓再上"，放弃是"我不来了"。你只要还想着"再试试"，就没输。'},
{t:['看书','阅读','读书','成绩不好'],q:'我很爱看书，可是成绩不好。',
 a:'这俩不是一回事，别慌。爱看书的人，脑子里存的东西多，只是还没学会在考卷上把它取出来。你试着读完一段，合上书，用自己的话讲一遍——讲得出来，就是学会了提取。'},

/* —— 关于四虎 —— */
{t:['四虎','笔名','为什么叫'],q:'您为什么叫"四虎"？',
 a:'"四虎"是我给自己起的名号，好记、有点野气。当记者要用真名跑现场，写童话就用它——像换了双鞋，走路轻快些。你也可以给自己起个笔名，写东西的时候，胆子会大一点。'},
{t:['记者','职业','采访'],q:'当记者和写童话有关系吗？',
 a:'关系大了。记者教我一件事：真话最有劲。我跑现场二十多年，见过太多编不出来的细节——那些细节后来都变成了童话里的血肉。写童话不是逃开现实，是把现实熬软了给孩子吃。'},
{t:['孩子听','讲故事','睡前'],q:'您还给孩子讲故事吗？',
 a:'讲，只是现在轮到他挑我的错了。当年我最爱偷懒，随口编个开头敷衍他，结果被追问了几年，编出了一本书。你看，当爹的偷懒，也能偷出点好东西——但别学我，认真点更好。'},
{t:['下一本','新书','还有','续集'],q:'还会写新故事吗？',
 a:'会。心里还压着几个没说出口的故事，都是这些年跑现场、陪孩子攒下的。你别急，好故事跟柿子一样，得等它软。等书出来了，虎叔第一个想告诉你。'},
{t:['点子','灵感哪来','素材'],q:'您的点子都是从哪来的？',
 a:'从"多看一眼"来。别人看猪圈就是猪圈，我看那块黑石头，就想：这石头要是有来历呢？《少年笔侠》最要紧的那支小玉笔，就是这么长出来的。灵感不神秘，它只是奖励那个多站了三秒钟的人。'},
{t:['小时候','作文','语文'],q:'您小时候作文写得好吗？',
 a:'一般，甚至有点怕写。真正开窍是当记者以后——被逼着把事情讲清楚，讲不清楚就交不了稿。所以你要现在写得不好，别急，人是在"非讲清楚不可"的时候才学会写的。'}
];

const HU_OPEN=[
 '这个问题问得好，虎叔慢慢跟你说。',
 '来，坐下，虎叔给你讲讲。',
 '你这一问，倒把我问笑了。',
 '嗯，这事儿我正好想过。',
 '好问题，比标准答案值钱。'
];
const HU_CLOSE=[
 '你要是还有想法，接着问，虎叔不嫌烦。',
 '这只是虎叔的看法，你也可以有你的。',
 '想明白了，讲给同学听听——讲得清，才算真懂。',
 '记住这一句就够了，剩下的你自己长。'
];
const HU_FALLBACK=[
 '这个问题虎叔一时答不上来——不过别急：你可以自行保存问题，和家人或老师一起探讨。',
 '嗯……这个虎叔得老实认输。你可以自行保存问题，和家人或老师一起探讨。',
 '问得挺刁，可虎叔肚子里偏偏没有这个答案。你可以自行保存问题，和家人或老师一起探讨。'
];
const HU_GREET=['你好','您好','hi','hello','在吗','虎叔','四虎老师'];
const HU_THANKS=['谢谢','感谢','多谢','谢了'];

let huHistory=[];
function huNorm(t){return (t||'').toLowerCase().replace(/[\s，。！？、,.!?~～…—\-·"'"'（）()《》<>【】\[\]]/g,'');}
function huScore(q,topic){
  let sc=0;
  for(const k of topic.t){
    const kk=huNorm(k);
    if(kk && q.includes(kk)) sc += kk.length>=3?3:2;
  }
  return sc;
}
function huAnswer(raw){
  huAnswer.fallback=false;
  const q=huNorm(raw);
  if(!q) return '你还没写问题呢，虎叔等着。';
  if(HU_THANKS.some(w=>q.includes(w)) && q.length<=8)
    return '客气啥。回去把书翻一翻，比谢我强。';
  if(HU_GREET.some(w=>q.includes(w)) && q.length<=10)
    return '哎，我在。你随便问——书里的人物、怎么写作文、心里憋着的事，都行。';
  let best=null,bestScore=0,second=null;
  for(const item of HU_KB){
    const sc=huScore(q,item);
    if(sc>bestScore){ second=best; best=item; bestScore=sc; }
    else if(!second || sc>huScore(q,second)){ if(sc>0) second=item; }
  }
  if(best && bestScore>=2){
    let extra='';
    if(second && huScore(q,second)>=bestScore-1 && second!==best) extra=' 顺便说一句，你这个问题还牵着另一件事——'+second.q.replace(/？$/,'')+'，想听虎叔也说两句吗？';
    return pick(HU_OPEN)+best.a+extra+' '+pick(HU_CLOSE);
  }
  huAnswer.fallback=true;
  return pick(HU_FALLBACK);
}

/* —— 聊天界面 —— */
function chatBubble(side,text){
  const wrap=document.createElement('div');
  wrap.className='msg '+(side==='me'?'me-side':'tiger-side');
  const who=document.createElement('div'); who.className='who';
  who.textContent=side==='me'?'🧍':'🐯';
  const b=document.createElement('div'); b.className='bubble'; b.textContent=text;
  wrap.appendChild(who); wrap.appendChild(b);
  $('chat').appendChild(wrap);
  wrap.scrollIntoView({behavior:'smooth',block:'center'});
  return b;
}
function chatTyping(){
  const wrap=document.createElement('div');
  wrap.className='msg tiger-side'; wrap.id='typingRow';
  wrap.innerHTML='<div class="who">🐯</div><div class="bubble"><span class="typing"><i></i><i></i><i></i></span></div>';
  $('chat').appendChild(wrap);
  wrap.scrollIntoView({behavior:'smooth',block:'center'});
  return wrap;
}
const HU_CHIPS=[
 '布巴为什么会变成两半？','布鲁布和巴拉巴有什么区别？','鬼笔之魂是陷阱吗？',
 '密码为什么是贾岛？','作文写不好怎么办？','一写就是流水账怎么办？',
 '背古诗有什么用？','我晚上怕黑怎么办？','您为什么叫四虎？',
 '雷神咒真的有用吗？','567 是谁？','我可以当作家吗？'
];
function chatChips(){
  const box=$('chips'); box.innerHTML='';
  shuffle(HU_CHIPS.slice()).slice(0,4).forEach(t=>{
    const b=document.createElement('button');
    b.className='chip'; b.textContent=t;
    b.onclick=()=>{ $('askInput').value=t; askHǔ(); };
    box.appendChild(b);
  });
}
function chatReset(){
  huHistory=[]; $('chat').innerHTML=''; chatChips();
  const b=chatBubble('tiger','虎叔在。想聊《半边人》里那两个半边人，还是《少年笔笔》里那支会答题的鬼笔？要不你问我点别的也行——写作文、怕黑、跟爸妈吵架，我都管。');
  b.textContent=b.textContent.replace('少年笔笔','少年笔侠');
}
function askHǔ(){
  const inp=$('askInput');
  const text=(inp.value||'').trim();
  if(!text) { inp.focus(); return; }
  chatBubble('me',text);
  huHistory.push({r:'me',t:text});
  inp.value='';
  tone(640,.08,'sine',.05);
  const row=chatTyping();
  const ans=huAnswer(text);
  const delay=Math.min(2600,900+ans.length*14);
  setTimeout(()=>{
    row.remove();
    const bub=chatBubble('tiger',ans);
    huHistory.push({r:'tiger',t:ans});
    
    tone(880,.1,'sine',.05);
    chatChips();
  },delay);
}
/* 答不上来时：给一个"转到公众号"的按钮（复制原问题，家长/孩子发过去） */
function addTransfer(bubble, question){
  const wrap=document.createElement('div');
  wrap.style.cssText='margin:8px 0 2px;display:flex;gap:8px;flex-wrap:wrap;align-items:center';
  const btn=document.createElement('button');
  btn.className='chip';
  btn.style.cssText='font-size:12.5px;padding:8px 14px';
  btn.textContent='📮 复制这个问题，发给《少年笔侠》公众号';
  btn.onclick=()=>copyQuestion(question, btn);
  wrap.appendChild(btn);
  bubble.parentNode.appendChild(wrap);
}
function copyQuestion(q, btn){
  const txt='四虎老师您好：孩子在《鬼笔之魂》里问了一个问题，想请您回答——「'+q+'」';
  const ok=()=>{
    btn.textContent='✅ 已复制，去微信搜「少年笔侠」发过去就行';
    btn.disabled=true;
    setTimeout(()=>{ btn.textContent='📮 复制这个问题，发给《少年笔侠》公众号'; btn.disabled=false; },4200);
  };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(ok).catch(()=>legacyCopy(txt,ok));
  }else legacyCopy(txt,ok);
}
function legacyCopy(txt, cb){
  const ta=document.createElement('textarea');
  ta.value=txt; ta.style.cssText='position:fixed;left:-9999px;top:0';
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); cb(); }catch(e){ alert('请手动复制这段话发给《少年笔侠》公众号：\n\n'+txt); }
  ta.remove();
}
document.addEventListener('keydown',e=>{
  if(e.key==='Enter' && document.getElementById('ask').classList.contains('active')){ askHǔ(); }
});
function openAsk(){
  go('ask');
  if(!$('chat').children.length) chatReset();
  setTimeout(()=>$('askInput').focus(),300);
}

/* ---------------- 启动 ---------------- */
renderHelpers();
cameo();
chatChips();

Object.assign(window,{go,shuffle,pick,audio,tone,noise,toggleSfx,tryPassword,fillPw,hintAgain,signPledge,renderMap,startQuiz,updQuizHud,nextQ,answerQ,quizFail,levelWin,afterLevelUp,useJinnang,useLei,cameo,praise,comboFx,flyPen,renderHelpers,startDuel,updHp,duelCameo,nextDuelQ,duelAnswer,duelResolve,endDuel,passScreen,runSolo,updSoloHp,showCert,penPickNo,penStats,pRr,pWrap,buildPenCard,openPenCard,renderPenCard,penWeixin,penDataURLtoFile,penSaveDataURL,penMomentGuide,sharePenMoments,copyPenText,penFallbackCopy,huNorm,huScore,huAnswer,chatBubble,chatTyping,chatChips,chatReset,askHǔ,addTransfer,copyQuestion,legacyCopy,openAsk});
