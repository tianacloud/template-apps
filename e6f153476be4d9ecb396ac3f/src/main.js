import { createTianaFetch } from '@tianacloud/serverless';
const style = document.createElement("style");
style.textContent = "\n  :root{\n    --ink:#5a4436;\n    --ink-soft:#a08a78;\n    --orange:#ff9a62;\n    --orange-deep:#f4804a;\n    --cream:#fff8f0;\n    --line:#f4e2d2;\n    --shadow:0 20px 44px -22px rgba(190,140,105,.55);\n  }\n  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}\n  html,body{margin:0;padding:0;}\n  body{\n    min-height:100vh;\n    font-family:\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",system-ui,-apple-system,sans-serif;\n    color:var(--ink);\n    background:\n      radial-gradient(900px 520px at 10% -10%, #ffe7cf 0%, rgba(255,231,207,0) 62%),\n      radial-gradient(700px 480px at 94% 2%, #ffe1e6 0%, rgba(255,225,230,0) 55%),\n      radial-gradient(900px 620px at 50% 110%, #e8f1ff 0%, rgba(232,241,255,0) 60%),\n      #fffaf4;\n    background-attachment:fixed;\n    overflow-x:hidden;\n  }\n  body::before,body::after{\n    content:\"\";position:fixed;border-radius:50%;pointer-events:none;z-index:0;\n    filter:blur(2px);\n  }\n  body::before{width:180px;height:180px;left:-70px;top:32%;background:radial-gradient(circle,#ffe4c8 0%,rgba(255,228,200,0) 70%);}\n  body::after{width:220px;height:220px;right:-90px;bottom:12%;background:radial-gradient(circle,#ffdde4 0%,rgba(255,221,228,0) 70%);}\n\n  .wrap{position:relative;z-index:1;max-width:540px;margin:0 auto;padding:26px 18px 60px;}\n\n  /* ---------- header ---------- */\n  .top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;}\n  h1{\n    margin:0;font-size:25px;letter-spacing:1px;font-weight:800;color:#6b4c38;\n    display:flex;align-items:center;gap:8px;\n  }\n  h1 .spark{font-size:18px;animation:twinkle 2.4s ease-in-out infinite;}\n  @keyframes twinkle{0%,100%{opacity:.45;transform:scale(.9) rotate(-6deg)}50%{opacity:1;transform:scale(1.1) rotate(6deg)}}\n  .sub{margin:6px 0 0;font-size:13px;color:var(--ink-soft);letter-spacing:.5px;}\n  .icon-btn{\n    flex:0 0 auto;width:44px;height:44px;border-radius:16px;border:1px solid var(--line);\n    background:#fffdfa;font-size:18px;cursor:pointer;box-shadow:0 8px 18px -12px rgba(190,140,105,.8);\n    transition:transform .15s ease,background .2s;\n  }\n  .icon-btn:active{transform:scale(.94);}\n\n  /* ---------- stats ---------- */\n  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;}\n  .stat{\n    background:#fffdfa;border:1px solid var(--line);border-radius:20px;padding:12px 6px 10px;\n    text-align:center;box-shadow:0 12px 26px -20px rgba(190,140,105,.9);\n  }\n  .stat .num{display:block;font-size:23px;font-weight:800;color:var(--orange-deep);line-height:1.15;font-variant-numeric:tabular-nums;}\n  .stat .lab{display:block;margin-top:3px;font-size:11px;color:var(--ink-soft);letter-spacing:.6px;}\n\n  /* ---------- card ---------- */\n  .card{\n    background:#fffdfa;border:1px solid var(--line);border-radius:26px;\n    padding:16px;box-shadow:var(--shadow);margin-bottom:14px;\n  }\n\n  .bubble{\n    position:relative;margin:2px 2px 4px;padding:12px 16px;border-radius:18px;\n    background:#fff5ea;border:2px dashed #ffd8bb;color:#8a6a58;\n    font-size:15px;line-height:1.55;text-align:center;min-height:48px;\n    display:flex;align-items:center;justify-content:center;\n    transition:background .3s,border-color .3s,color .3s,transform .3s;\n  }\n  .bubble.done{background:#eefaf0;border-color:#b7e2bd;color:#51825a;}\n  .bubble.pop{transform:scale(1.03);}\n\n  /* ---------- stage ---------- */\n  .stage{position:relative;margin:6px auto 0;max-width:400px;}\n  .stage svg{width:100%;height:auto;display:block;overflow:visible;}\n  .fx{position:absolute;inset:0;pointer-events:none;overflow:visible;}\n\n  .muyu,.pestle,.char-figure,.ripple{transform-box:fill-box;transform-origin:center;}\n  .pestle{transform-box:view-box;transform-origin:150px 186px;transform:rotate(-26deg);}\n  .ripple{transform-box:view-box;transform-origin:236px 224px;opacity:0;}\n\n  .hitting .pestle{animation:knockArm .27s cubic-bezier(.35,0,.3,1);}\n  @keyframes knockArm{\n    0%{transform:rotate(-26deg)}\n    42%{transform:rotate(6deg)}\n    100%{transform:rotate(-26deg)}\n  }\n  .hitting .char-figure.active{animation:hop .27s ease-out;}\n  @keyframes hop{0%{transform:translateY(0)}40%{transform:translateY(5px)}100%{transform:translateY(0)}}\n  .hitting .muyu{animation:muyuShake .27s ease-out;}\n  @keyframes muyuShake{\n    0%{transform:scale(1)}\n    38%{transform:scale(1.05) translateY(-2px)}\n    100%{transform:scale(1)}\n  }\n  .hitting .ripple{animation:rippleGo .55s ease-out;}\n  @keyframes rippleGo{\n    0%{opacity:.75;transform:scale(.55)}\n    100%{opacity:0;transform:scale(1.9)}\n  }\n\n  .char-figure{display:none;}\n  .char-figure.active{display:block;}\n\n  .eyes{transform-box:fill-box;transform-origin:center;animation:blink 5.4s infinite;}\n  @keyframes blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.08)}}\n\n  /* floating words */\n  .float-word{\n    position:absolute;transform:translate(-50%,-50%);\n    font-size:15px;font-weight:800;color:#f4804a;white-space:nowrap;\n    text-shadow:0 2px 0 #fff,0 0 12px rgba(255,190,140,.9);\n    animation:floatUp 1s ease-out forwards;pointer-events:none;\n  }\n  @keyframes floatUp{\n    0%{opacity:0;transform:translate(-50%,-30%) scale(.7)}\n    25%{opacity:1;transform:translate(-50%,-60%) scale(1.1)}\n    100%{opacity:0;transform:translate(-50%,-160%) scale(1)}\n  }\n\n  /* confetti */\n  .confetti{\n    position:absolute;top:6%;font-size:16px;animation:fall 1.9s ease-in forwards;\n    pointer-events:none;\n  }\n  @keyframes fall{\n    0%{opacity:0;transform:translateY(-10px) rotate(0deg)}\n    15%{opacity:1}\n    100%{opacity:0;transform:translateY(240px) rotate(220deg)}\n  }\n\n  /* ---------- progress ---------- */\n  .dots{display:flex;gap:7px;justify-content:center;margin:8px 0 14px;flex-wrap:wrap;}\n  .dots i{\n    width:9px;height:9px;border-radius:50%;background:#f1e4d7;display:block;\n    transition:background .3s,box-shadow .3s,transform .3s;\n  }\n  .dots i.on{background:linear-gradient(180deg,#ffbe86,#f4834b);box-shadow:0 0 0 3px rgba(255,166,116,.18);}\n\n  .primary{\n    width:100%;border:none;border-radius:20px;padding:16px;cursor:pointer;\n    font-family:inherit;font-size:17px;font-weight:800;letter-spacing:.5px;color:#fff;\n    background:linear-gradient(180deg,#ffb478,#f4804a);\n    box-shadow:0 16px 28px -14px rgba(240,120,60,.9),inset 0 -3px 0 rgba(0,0,0,.07);\n    transition:transform .12s ease,box-shadow .2s,background .3s;\n  }\n  .primary:active{transform:translateY(2px) scale(.992);box-shadow:0 8px 16px -12px rgba(240,120,60,.9);}\n  .primary.ghosted{\n    background:linear-gradient(180deg,#fdf0e2,#f8e6d3);color:#b18d70;\n    box-shadow:inset 0 0 0 2px #f2ddc8;\n  }\n  .hint{margin:11px 0 2px;text-align:center;font-size:12.5px;color:var(--ink-soft);letter-spacing:.4px;}\n\n  /* ---------- calendar ---------- */\n  .cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font-size:13px;color:#8b7361;}\n  .cal-head b{font-weight:800;color:#6b4c38;letter-spacing:.4px;}\n  .muted{color:#b6a293;font-size:11.5px;}\n  .cal{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;}\n  .cell{\n    position:relative;aspect-ratio:1/1;border-radius:13px;background:#fdf4ea;\n    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;\n    border:1px solid #f6e7d8;\n  }\n  .cell .d{font-size:13px;font-weight:700;color:#b29c8a;font-variant-numeric:tabular-nums;}\n  .cell .m{font-size:9px;color:#c9b7a6;}\n  .cell.on{\n    background:linear-gradient(180deg,#ffc48f,#f89157);border-color:#f89157;\n    box-shadow:0 8px 16px -10px rgba(240,130,70,.95);\n  }\n  .cell.on .d{color:#fff;}\n  .cell.on .m{color:#fff6ee;}\n  .cell.today{outline:2px solid #ffd0a8;outline-offset:2px;}\n\n  /* ---------- avatars ---------- */\n  .avatars{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}\n  .av{\n    border:1px solid var(--line);background:#fdf8f2;border-radius:16px;padding:10px 4px 8px;\n    cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:4px;\n    transition:.22s;\n  }\n  .av .e{font-size:21px;line-height:1;}\n  .av .n{font-size:11px;color:#a58d7b;}\n  .av.active{background:#fff1e2;border-color:#ffc79c;box-shadow:0 10px 20px -14px rgba(240,140,70,.9);transform:translateY(-2px);}\n  .av.active .n{color:#e07b3f;font-weight:700;}\n\n  footer{text-align:center;padding:6px 0 0;}\n  .ghost{\n    background:none;border:none;font-family:inherit;font-size:11.5px;color:#c2ad9c;\n    cursor:pointer;padding:8px;letter-spacing:.5px;\n  }\n  .ghost:hover{color:#a08a78;}\n\n  @media (max-width:380px){\n    h1{font-size:22px;}\n    .stat .num{font-size:20px;}\n  }\n";
document.head.appendChild(style);
document.getElementById("app").innerHTML = "\n<div data-page-node-id=\"2c0MwyXcU0xcwYGA4zloi6\" class=\"wrap\">\n\n  <header data-page-node-id=\"VuUEi7kMmRyv8a8uJUmp5w\" class=\"top\">\n    <div data-page-node-id=\"Ol2I95sS7VdyDDaiyvnpGR\">\n      <h1 data-page-node-id=\"NQOi4QtTswEWDYbfYgrc6w\"><!--pnid:TyexsVXWj31wCobAocpTN0-->静心木鱼 <span data-page-node-id=\"t9gbipT3Oo4iAP1oKjSB3E\" class=\"spark\"><!--pnid:gXic1L4hGpdWHWaDL5pmEb-->✦</span></h1>\n      <p data-page-node-id=\"aADzmIeZU4sBi4UloxbA5B\" class=\"sub\"><!--pnid:UaoaAtteKeYtn6Iss403wH-->一敲一放，心自清凉</p>\n    </div>\n    <button data-page-node-id=\"XApZFAv8dDka2XaMmu2tAs\" class=\"icon-btn\" id=\"soundBtn\" title=\"声音开关\"><!--pnid:q5sIBVtl7NcyRJpvgMhM4J-->🔔</button>\n  </header>\n\n  <section data-page-node-id=\"IpNV81iLNezrc71WTmv9fG\" class=\"stats\">\n    <div data-page-node-id=\"7BLJwRETSQ1aWsTS81QU1B\" class=\"stat\"><span data-page-node-id=\"uH7mmkT2HagRySRQgjQN18\" class=\"num\" id=\"streakNum\"><!--pnid:mRDIvvF0RPjsQJ0qWfy0xQ-->0</span><span data-page-node-id=\"Bvp8TwlFgYns53BhvvtF2F\" class=\"lab\"><!--pnid:jTTzAmMWdpNYTUwEFQQDDV-->连续天数</span></div>\n    <div data-page-node-id=\"hdENB3aEjA5hTfip6g1YkD\" class=\"stat\"><span data-page-node-id=\"XUcodEYrURnufdL4Nkwiak\" class=\"num\" id=\"totalNum\"><!--pnid:nQXgn5rQQdvdFDcBpbdRG9-->0</span><span data-page-node-id=\"iK1anbRgBx1J3NpSwgV3Jq\" class=\"lab\"><!--pnid:PkFtTBppRDHYtEo6VkNqKB-->累计打卡</span></div>\n    <div data-page-node-id=\"DINhdD6JvCldsyE9VvmDjS\" class=\"stat\"><span data-page-node-id=\"MM9ax6TOPjbxr9veVczk8l\" class=\"num\" id=\"meritNum\"><!--pnid:Ec2SKPWoH7dqiVecYq9CVN-->0</span><span data-page-node-id=\"64fz6AY6OaoN6GyFTZwdzY\" class=\"lab\"><!--pnid:XTGjl5Js1EuXze6gQYOSXb-->总功德</span></div>\n  </section>\n\n  <section data-page-node-id=\"DCzmBGSKv0ORzPpSbp9gk2\" class=\"card\">\n    <div data-page-node-id=\"SHhQIuGtuxS40pTsJU0eqV\" class=\"bubble\" id=\"bubble\"><!--pnid:TW5lHrSE9I8Ph53VbVN1Jn-->今天还没敲呢，木鱼在等你～</div>\n\n    <div data-page-node-id=\"sX2fxDC5EmOmHUzIpC7y81\" class=\"stage\" id=\"stage\">\n      <svg data-page-node-id=\"z7hxvrcxCLEohg82Ri7J1T\" aria-label=\"小和尚敲木鱼\" id=\"svg\" viewBox=\"0 0 340 300\">\n        <defs data-page-node-id=\"a7QWoAgJGMvfVbmo9sEpb4\">\n          <radialGradient data-page-node-id=\"m8cOZYRG8EFSuuv7h5Mnxi\" cx=\"35%\" cy=\"28%\" id=\"skin\" r=\"80%\">\n            <stop data-page-node-id=\"Avomh37knbCXr027SLwE19\" offset=\"0%\" stop-color=\"#fff3e6\"/>\n            <stop data-page-node-id=\"WBRxN94ZofWFW9eQLWrfx2\" offset=\"100%\" stop-color=\"#f8d3b2\"/>\n          </radialGradient>\n          <linearGradient data-page-node-id=\"dwF1jLQGFjiTgjuawFBbbx\" id=\"robe\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"1\">\n            <stop data-page-node-id=\"KafPq0eftFGZgnaolJnEFR\" offset=\"0%\" stop-color=\"#ffc86f\"/>\n            <stop data-page-node-id=\"gFmKBU3D1XAbuPySThIf4x\" offset=\"100%\" stop-color=\"#ef963c\"/>\n          </linearGradient>\n          <linearGradient data-page-node-id=\"9IVQ4dsmqRBjr2qhkdTms7\" id=\"wood\" x1=\"0.1\" x2=\"0.6\" y1=\"0\" y2=\"1\">\n            <stop data-page-node-id=\"4oIEi8u9uVRI9Q4qjbVcUn\" offset=\"0%\" stop-color=\"#eec08a\"/>\n            <stop data-page-node-id=\"5hBSYs3nP1DEOsUDS9JQPi\" offset=\"52%\" stop-color=\"#d29553\"/>\n            <stop data-page-node-id=\"NIqdaTdw55DGu7zeLTNnwp\" offset=\"100%\" stop-color=\"#b2743a\"/>\n          </linearGradient>\n          <radialGradient data-page-node-id=\"vOGAx4Oi4T74NI6zteUTHB\" cx=\"50%\" cy=\"50%\" id=\"halo\" r=\"50%\">\n            <stop data-page-node-id=\"0jMZEyi3dC44dw7IxsqdKW\" offset=\"0%\" stop-color=\"#ffe9cf\" stop-opacity=\".95\"/>\n            <stop data-page-node-id=\"ZDoVmMCLrs7BN26KpWgLyq\" offset=\"100%\" stop-color=\"#ffe9cf\" stop-opacity=\"0\"/>\n          </radialGradient>\n          <linearGradient data-page-node-id=\"S2vLoQVBvJWnzBmFDlUPjQ\" id=\"catFur\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"1\">\n            <stop data-page-node-id=\"9TYmuEKYMEGlOORzKO7GDy\" offset=\"0%\" stop-color=\"#ffd39d\"/>\n            <stop data-page-node-id=\"1s9DcBvXnRWGXiCUphkVSH\" offset=\"100%\" stop-color=\"#f7b877\"/>\n          </linearGradient>\n          <linearGradient data-page-node-id=\"nRB06PnoXGccwC3tlPBtSc\" id=\"foxFur\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"1\">\n            <stop data-page-node-id=\"lUPGXLgStPlkROT83I8Xkf\" offset=\"0%\" stop-color=\"#ffb782\"/>\n            <stop data-page-node-id=\"DqcmkZqEmQv0xHoLSPV1B8\" offset=\"100%\" stop-color=\"#f28e51\"/>\n          </linearGradient>\n          <linearGradient data-page-node-id=\"VhLw8yDMCGuW58RyVFBdcV\" id=\"penguin\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"1\">\n            <stop data-page-node-id=\"XGoRRZgrDlpYUpvveW7HuG\" offset=\"0%\" stop-color=\"#5c6b7a\"/>\n            <stop data-page-node-id=\"m4PIcJqmzMTASaIxhYepZG\" offset=\"100%\" stop-color=\"#3d4a57\"/>\n          </linearGradient>\n        </defs>\n\n        <!--pnid:DVgEu0EQEZXq5c8yRO9TNu--><!-- 背景光晕 -->\n        <circle data-page-node-id=\"yr0JuvV6w4L2KQgjzvH8OS\" cx=\"172\" cy=\"160\" fill=\"url(#halo)\" r=\"128\"/>\n\n        <!--pnid:aQm9ZIT2DsaJspalVNl4gH--><!-- 影子 -->\n        <ellipse data-page-node-id=\"JpCpDdWH8qLT18A5O7hDoP\" cx=\"100\" cy=\"246\" fill=\"#e9d3bb\" opacity=\".5\" rx=\"58\" ry=\"13\"/>\n        <ellipse data-page-node-id=\"hK87qESSRIY03t9wfzyqGr\" cx=\"236\" cy=\"262\" fill=\"#e9d3bb\" opacity=\".45\" rx=\"62\" ry=\"12\"/>\n\n        <!--pnid:X2uwglgzMfehzhRxYuf1lB--><!-- ===== 形象：小和尚 ===== -->\n        <g data-page-node-id=\"URj0Q7OV2h2qlkuyNndP39\" class=\"char-figure active\" data-avatar=\"monk\">\n          <path data-page-node-id=\"ov4nqDxvAWXped2cuXih6q\" d=\"M62 216 C62 178 74 158 100 158 C126 158 138 178 138 216 Z\" fill=\"url(#robe)\"/>\n          <path data-page-node-id=\"Rvm6adelObjvEusQKdQR5C\" d=\"M86 160 L100 178 L114 160\" fill=\"none\" stroke=\"#e08b3c\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4\"/>\n          <rect data-page-node-id=\"g8WLtYfm8KKxS3UNiNbYoW\" fill=\"#f7d4b3\" height=\"24\" rx=\"8\" width=\"16\" x=\"92\" y=\"138\"/>\n          <circle data-page-node-id=\"KigEDJzSVVtJeAAVjiZnZa\" cx=\"56\" cy=\"114\" fill=\"#f8d3b2\" r=\"9\"/>\n          <circle data-page-node-id=\"HvInBOoQzu9tIFvoHqvB7i\" cx=\"144\" cy=\"114\" fill=\"#f8d3b2\" r=\"9\"/>\n          <circle data-page-node-id=\"BOUUnJBNeDK5bgDgkUIvy8\" cx=\"100\" cy=\"110\" fill=\"url(#skin)\" r=\"44\"/>\n          <circle data-page-node-id=\"AtnSa5z67YuV70baQf5Tnb\" cx=\"90\" cy=\"71\" fill=\"#e2a67f\" r=\"2.6\"/>\n          <circle data-page-node-id=\"NTmE1OFtRFZFramK11qWMA\" cx=\"102\" cy=\"68\" fill=\"#e2a67f\" r=\"2.6\"/>\n          <circle data-page-node-id=\"Wtoq1K0y5Tg1uuvRzD97dN\" cx=\"114\" cy=\"71\" fill=\"#e2a67f\" r=\"2.6\"/>\n          <ellipse data-page-node-id=\"LbH6HDZJCZxrRWgNFXxyTI\" cx=\"70\" cy=\"122\" fill=\"#ffb3ae\" opacity=\".6\" rx=\"10\" ry=\"6.5\"/>\n          <ellipse data-page-node-id=\"WkJWbqhtDz5x5eSh4H6j2Z\" cx=\"130\" cy=\"122\" fill=\"#ffb3ae\" opacity=\".6\" rx=\"10\" ry=\"6.5\"/>\n          <g data-page-node-id=\"ig6floiHwnwkgqiYuNwy9d\" class=\"eyes\">\n            <ellipse data-page-node-id=\"UMKzpu4F7dNnEBWz6s5U55\" cx=\"84\" cy=\"108\" fill=\"#4a3b32\" rx=\"5.6\" ry=\"6.6\"/>\n            <ellipse data-page-node-id=\"sm78FKGAUmuldvFqU5Sh3d\" cx=\"116\" cy=\"108\" fill=\"#4a3b32\" rx=\"5.6\" ry=\"6.6\"/>\n            <circle data-page-node-id=\"rI7hTlY2B6tRpXwzROgQxP\" cx=\"86\" cy=\"105\" fill=\"#fff\" r=\"1.9\"/>\n            <circle data-page-node-id=\"cr0qBGrriRNaJDZgDK4qdx\" cx=\"118\" cy=\"105\" fill=\"#fff\" r=\"1.9\"/>\n          </g>\n          <path data-page-node-id=\"aLyxVGmEq3BB1jFXlutODw\" d=\"M94 124 q6 6 12 0\" fill=\"none\" stroke=\"#4a3b32\" stroke-linecap=\"round\" stroke-width=\"2.6\"/>\n        </g>\n\n        <!--pnid:9GiT2WihV3z4nfFRt6BYLc--><!-- ===== 形象：小橘猫 ===== -->\n        <g data-page-node-id=\"g6UFGWRt567NRV9eLoyfrb\" class=\"char-figure\" data-avatar=\"cat\">\n          <path data-page-node-id=\"EunLHBW4pWV4D3u89wcvxB\" d=\"M62 216 C62 178 74 158 100 158 C126 158 138 178 138 216 Z\" fill=\"url(#catFur)\"/>\n          <path data-page-node-id=\"kej902s6gd1tbcm2fOHiqQ\" d=\"M82 210 q18 12 36 0\" fill=\"none\" opacity=\".7\" stroke=\"#eaa25e\" stroke-linecap=\"round\" stroke-width=\"3\"/>\n          <rect data-page-node-id=\"8LBJS8GdQ3q6IjpyjjjzkG\" fill=\"#ffd9b0\" height=\"22\" rx=\"8\" width=\"16\" x=\"92\" y=\"140\"/>\n          <path data-page-node-id=\"mIIJSJJBjfaRj3oQtuFeCl\" d=\"M66 84 L56 40 L98 64 Z\" fill=\"#ffd39d\"/>\n          <path data-page-node-id=\"w1YYN4wcdhqedMGN4QZQSW\" d=\"M134 84 L144 40 L102 64 Z\" fill=\"#ffd39d\"/>\n          <path data-page-node-id=\"6Sgllb5MWH7zMMrgGv2X5e\" d=\"M71 78 L65 52 L89 66 Z\" fill=\"#ffb0ab\"/>\n          <path data-page-node-id=\"um94vK7Ef24RDPzon0j29U\" d=\"M129 78 L135 52 L111 66 Z\" fill=\"#ffb0ab\"/>\n          <circle data-page-node-id=\"Rgr7J2Yx1CIANXDvG1KZ9X\" cx=\"100\" cy=\"110\" fill=\"#ffe0bd\" r=\"44\"/>\n          <path data-page-node-id=\"xz4QfiR9elWKn2QPzruZic\" d=\"M92 70 q8 -5 16 0\" fill=\"none\" stroke=\"#f2b276\" stroke-linecap=\"round\" stroke-width=\"3.2\"/>\n          <ellipse data-page-node-id=\"8HkWYeea0X7gJnGlclBxNs\" cx=\"70\" cy=\"122\" fill=\"#ffb3ae\" opacity=\".55\" rx=\"10\" ry=\"6.5\"/>\n          <ellipse data-page-node-id=\"bGKZ5SAbRwNi2fAcJxd2pR\" cx=\"130\" cy=\"122\" fill=\"#ffb3ae\" opacity=\".55\" rx=\"10\" ry=\"6.5\"/>\n          <g data-page-node-id=\"EPK8tMFrX4roCfBUQ1gqtH\" class=\"eyes\">\n            <ellipse data-page-node-id=\"6bzwcXCx9za0gvHvygaBR5\" cx=\"84\" cy=\"108\" fill=\"#4a3b32\" rx=\"5.6\" ry=\"6.6\"/>\n            <ellipse data-page-node-id=\"TSgHToRzTD701NQciV9aD8\" cx=\"116\" cy=\"108\" fill=\"#4a3b32\" rx=\"5.6\" ry=\"6.6\"/>\n            <circle data-page-node-id=\"JVa84u8WADOwqvdagD5IaM\" cx=\"86\" cy=\"105\" fill=\"#fff\" r=\"1.9\"/>\n            <circle data-page-node-id=\"pcPqUdeGmJuCyNqUyBrGiL\" cx=\"118\" cy=\"105\" fill=\"#fff\" r=\"1.9\"/>\n          </g>\n          <path data-page-node-id=\"6UGuVVcAfFjCxifLibP4wX\" d=\"M96 120 l4 -4 l4 4 l-4 3 z\" fill=\"#ff8f8f\"/>\n          <path data-page-node-id=\"yyup0jE54bDCDEYd2o7biw\" d=\"M100 123 q-5 6 -10 1 M100 123 q5 6 10 1\" fill=\"none\" stroke=\"#4a3b32\" stroke-linecap=\"round\" stroke-width=\"2.2\"/>\n          <path data-page-node-id=\"l4ivyF4hfxi3V4iP5FaR58\" d=\"M60 116 l-14 -4 M60 124 l-14 4 M140 116 l14 -4 M140 124 l14 4\" opacity=\".75\" stroke=\"#eaa25e\" stroke-linecap=\"round\" stroke-width=\"2\"/>\n        </g>\n\n        <!--pnid:JllgzvgGUDth0D4OG4r8xM--><!-- ===== 形象：小狐狸 ===== -->\n        <g data-page-node-id=\"Kj4Niq15yUhViMCyGVj4ZZ\" class=\"char-figure\" data-avatar=\"fox\">\n          <path data-page-node-id=\"jKH6Juk6QbyVvhSrsCLQlV\" d=\"M62 216 C62 178 74 158 100 158 C126 158 138 178 138 216 Z\" fill=\"url(#foxFur)\"/>\n          <ellipse data-page-node-id=\"TlhXQEIqP5PGtVhw1xCtr9\" cx=\"100\" cy=\"198\" fill=\"#fff3e4\" opacity=\".8\" rx=\"17\" ry=\"13\"/>\n          <rect data-page-node-id=\"xAmP4ImKaMXljXinETRd8S\" fill=\"#ffcf9f\" height=\"22\" rx=\"8\" width=\"16\" x=\"92\" y=\"140\"/>\n          <path data-page-node-id=\"uGBgZGk3IjmIy0raOAzrAf\" d=\"M68 86 L54 34 L100 62 Z\" fill=\"#f28e51\"/>\n          <path data-page-node-id=\"5Tft5HKQaSFHVzgzpOImmJ\" d=\"M132 86 L146 34 L100 62 Z\" fill=\"#f28e51\"/>\n          <path data-page-node-id=\"9DYlkV4RWjtNQ7c6dzyHZO\" d=\"M74 80 L66 50 L92 64 Z\" fill=\"#c9885c\" opacity=\".7\"/>\n          <path data-page-node-id=\"finrf8h52IITRbGSbFvqPj\" d=\"M126 80 L134 50 L108 64 Z\" fill=\"#c9885c\" opacity=\".7\"/>\n          <circle data-page-node-id=\"mKuhwk7pnT01CBK2a1dWoH\" cx=\"100\" cy=\"110\" fill=\"#ffc794\" r=\"44\"/>\n          <ellipse data-page-node-id=\"zOmxxle7PLxrM2tNtwCtMM\" cx=\"100\" cy=\"131\" fill=\"#fff7ec\" rx=\"25\" ry=\"15.5\"/>\n          <ellipse data-page-node-id=\"IcP8PV7giSLkXayYZZvKSf\" cx=\"70\" cy=\"120\" fill=\"#ffab97\" opacity=\".55\" rx=\"9\" ry=\"6\"/>\n          <ellipse data-page-node-id=\"yi2R1Ppk4szcPDBeoqTlD7\" cx=\"130\" cy=\"120\" fill=\"#ffab97\" opacity=\".55\" rx=\"9\" ry=\"6\"/>\n          <g data-page-node-id=\"RVkZFMZOfHcjRIedMni0Df\" class=\"eyes\">\n            <ellipse data-page-node-id=\"a1wDzKSE9YSlobpo0IXGSo\" cx=\"84\" cy=\"106\" fill=\"#4a3b32\" rx=\"5.6\" ry=\"6.6\"/>\n            <ellipse data-page-node-id=\"fJELGh5VMZc5iTi2AoQmQ8\" cx=\"116\" cy=\"106\" fill=\"#4a3b32\" rx=\"5.6\" ry=\"6.6\"/>\n            <circle data-page-node-id=\"xZIxZrESxAwzZ9fIjalP0Y\" cx=\"86\" cy=\"103\" fill=\"#fff\" r=\"1.9\"/>\n            <circle data-page-node-id=\"Q3MiZaAwzvZPOr0Qs8Wolk\" cx=\"118\" cy=\"103\" fill=\"#fff\" r=\"1.9\"/>\n          </g>\n          <ellipse data-page-node-id=\"ailq3EFdBYInTPFLlQQBo6\" cx=\"100\" cy=\"124\" fill=\"#4a3b32\" rx=\"6\" ry=\"4.4\"/>\n          <path data-page-node-id=\"Yz6l2Mo4dDO4yrzaiFgYeh\" d=\"M100 129 q-8 8 -14 3 M100 129 q8 8 14 3\" fill=\"none\" stroke=\"#4a3b32\" stroke-linecap=\"round\" stroke-width=\"2.2\"/>\n        </g>\n\n        <!--pnid:GRclT6Etor7Qa1BovAV86x--><!-- ===== 形象：小企鹅 ===== -->\n        <g data-page-node-id=\"Hli5KVtkaOqLgW4Jmh6TZp\" class=\"char-figure\" data-avatar=\"penguin\">\n          <path data-page-node-id=\"eGkQfCaiql862jGarCCShK\" d=\"M62 216 C62 178 74 158 100 158 C126 158 138 178 138 216 Z\" fill=\"url(#penguin)\"/>\n          <ellipse data-page-node-id=\"ajXDIl1iURKIBxGXArVZPm\" cx=\"100\" cy=\"196\" fill=\"#fff8ee\" rx=\"26\" ry=\"22\"/>\n          <rect data-page-node-id=\"jWgTVMwShHhkb5Q3hvmsOf\" fill=\"#f6d3b4\" height=\"22\" rx=\"8\" width=\"16\" x=\"92\" y=\"140\"/>\n          <circle data-page-node-id=\"czWTnzNAXoLAW26rFcmfAc\" cx=\"100\" cy=\"110\" fill=\"url(#penguin)\" r=\"44\"/>\n          <ellipse data-page-node-id=\"7OYwFdn6U00XTl2nq31Wn1\" cx=\"100\" cy=\"116\" fill=\"#fff8ee\" rx=\"33\" ry=\"29\"/>\n          <ellipse data-page-node-id=\"RWAsbzOuaNcMjpJ2bi0p3B\" cx=\"100\" cy=\"76\" fill=\"#fff8ee\" opacity=\".12\" rx=\"36\" ry=\"10\"/>\n          <ellipse data-page-node-id=\"0lTPc47o02YGYy9RB5Rap3\" cx=\"68\" cy=\"120\" fill=\"#ffb3ae\" opacity=\".55\" rx=\"9\" ry=\"6\"/>\n          <ellipse data-page-node-id=\"KSlpJfdGZAltz3QObdWPs0\" cx=\"132\" cy=\"120\" fill=\"#ffb3ae\" opacity=\".55\" rx=\"9\" ry=\"6\"/>\n          <g data-page-node-id=\"dCuLX42bNz62LCUHC1WpQN\" class=\"eyes\">\n            <ellipse data-page-node-id=\"zkXyJ4noXprRHx6W6fO4uQ\" cx=\"86\" cy=\"108\" fill=\"#33404c\" rx=\"5.4\" ry=\"6.4\"/>\n            <ellipse data-page-node-id=\"YQCRKtYoj32YrFtWyph2Ia\" cx=\"114\" cy=\"108\" fill=\"#33404c\" rx=\"5.4\" ry=\"6.4\"/>\n            <circle data-page-node-id=\"CBXu1DzbDWHtk9Xibwvr62\" cx=\"88\" cy=\"105\" fill=\"#fff\" r=\"1.8\"/>\n            <circle data-page-node-id=\"CyH6hMoI77jf7X1t4v8Akr\" cx=\"116\" cy=\"105\" fill=\"#fff\" r=\"1.8\"/>\n          </g>\n          <path data-page-node-id=\"65XSh1PKiB1P5gxna06ite\" d=\"M100 118 l9 7 l-9 6 l-9 -6 z\" fill=\"#ffb454\"/>\n          <path data-page-node-id=\"prU6vZQ7vpuKHUAU3We1UB\" d=\"M80 214 l-10 6 M120 214 l10 6\" stroke=\"#ffb454\" stroke-linecap=\"round\" stroke-width=\"6\"/>\n        </g>\n\n        <!--pnid:CtaZLmD4h6CdLnZiw6iyzJ--><!-- ===== 木鱼 ===== -->\n        <g data-page-node-id=\"dtFtBXYwqXOVbBTNa79FUq\" class=\"muyu\">\n          <circle data-page-node-id=\"G7KiprTpAMAbQZVDJiCDP9\" class=\"ripple\" cx=\"238\" cy=\"222\" fill=\"none\" r=\"30\" stroke=\"#ffb27a\" stroke-width=\"3\"/>\n          <ellipse data-page-node-id=\"B8SVVq41dcmOXaruAsS3f0\" cx=\"238\" cy=\"256\" fill=\"#f0d3bf\" opacity=\".6\" rx=\"56\" ry=\"11\"/>\n          <path data-page-node-id=\"TNAmvWsdX2gVifZkYImoSq\" d=\"M172 222 C172 196 200 182 238 182 C276 182 304 196 304 222 C304 242 276 252 238 252 C200 252 172 242 172 222 Z\" fill=\"url(#wood)\"/>\n          <path data-page-node-id=\"qip5Lk4mVjMIoihkTwdfoN\" d=\"M188 208 C202 190 222 184 240 184\" fill=\"none\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-opacity=\".32\" stroke-width=\"6\"/>\n          <path data-page-node-id=\"TWXdO9dQEqShBM7N6lxPEb\" d=\"M182 224 C204 238 268 238 296 220\" fill=\"none\" opacity=\".7\" stroke=\"#8d5722\" stroke-linecap=\"round\" stroke-width=\"6\"/>\n          <path data-page-node-id=\"CFcgTQPakulOr0gfgwW7tP\" d=\"M182 224 C204 238 268 238 296 220\" fill=\"none\" opacity=\".5\" stroke=\"#6f4114\" stroke-linecap=\"round\" stroke-width=\"2\"/>\n          <circle data-page-node-id=\"K2eAxfGAi72Qslt3xLWht1\" cx=\"192\" cy=\"212\" fill=\"#a9692f\" r=\"9\"/>\n          <circle data-page-node-id=\"HxbtcYKr4xaXqnDL1Styip\" cx=\"192\" cy=\"212\" fill=\"#7d4a18\" r=\"4\"/>\n          <path data-page-node-id=\"sqve5Z7kk9QUXYtkBn6znz\" d=\"M264 198 q14 12 8 30\" fill=\"none\" opacity=\".3\" stroke=\"#a9692f\" stroke-linecap=\"round\" stroke-width=\"2.5\"/>\n          <ellipse data-page-node-id=\"Hkg7YCZpaUCzAgDCgvJiET\" cx=\"258\" cy=\"238\" fill=\"#8f5a26\" opacity=\".16\" rx=\"16\" ry=\"5\"/>\n        </g>\n\n        <!--pnid:jnmgpxYcjxoCwmCyyjCtzJ--><!-- ===== 共用手臂 + 木槌 ===== -->\n        <path data-page-node-id=\"wMQw37HpUmRjdMyqEG4TKF\" d=\"M130 178 C148 182 158 187 162 193\" fill=\"none\" stroke=\"#f8d3b2\" stroke-linecap=\"round\" stroke-width=\"14\"/>\n        <g data-page-node-id=\"LcusnwuPgQ2xNQxUEwsVei\" class=\"pestle\">\n          <line data-page-node-id=\"zTGVsZiVtWajyIwaCDoDkD\" stroke=\"#c98f57\" stroke-linecap=\"round\" stroke-width=\"9\" x1=\"152\" x2=\"212\" y1=\"188\" y2=\"213\"/>\n          <circle data-page-node-id=\"Bu56wioqECIV2za5Opwgz7\" cx=\"219\" cy=\"216\" fill=\"url(#wood)\" r=\"13.5\"/>\n          <circle data-page-node-id=\"NKqNuPk1OK7xc4WC5eO6lJ\" cx=\"215\" cy=\"211\" fill=\"#fff\" opacity=\".3\" r=\"4\"/>\n        </g>\n      </svg>\n      <div data-page-node-id=\"g34rhEsFIJLdQJyhz1DRrW\" class=\"fx\" id=\"fx\"></div>\n    </div>\n\n    <div data-page-node-id=\"grgvqwBsMfl2z5FHakgIUo\" class=\"dots\" id=\"dots\"></div>\n    <button data-page-node-id=\"wzcUlNtElgt8g9eDdleFRt\" class=\"primary\" id=\"knockBtn\"><!--pnid:ByyDAKwIS1WfTI8jYHFUeN-->敲一下木鱼</button>\n    <p data-page-node-id=\"v0IvjWLwxdZdx6vNaIKdPu\" class=\"hint\" id=\"hint\"></p>\n  </section>\n\n  <section data-page-node-id=\"EFKBjRMk6M2GrJdcJOPXtZ\" class=\"card\">\n    <div data-page-node-id=\"20g9lLvKLfYNMlu0qP1GMw\" class=\"cal-head\"><b data-page-node-id=\"9FlQWQasNd1goZjIqBToor\"><!--pnid:2GdmAmfgKBNs0pezwnbMi2-->最近 21 天</b><span data-page-node-id=\"2lSMYNDmqOg6oto2l9V7GK\" class=\"muted\" id=\"calTip\"></span></div>\n    <div data-page-node-id=\"gLZBhm9nbzVahZWiJ52orh\" class=\"cal\" id=\"cal\"></div>\n  </section>\n\n  <section data-page-node-id=\"rtkoSKiMxpSWgR7SvcAmTn\" class=\"card\">\n    <div data-page-node-id=\"n55qxLtt9uoUtCiHnl1lp5\" class=\"cal-head\"><b data-page-node-id=\"TvW0TDsXfqH8MUvUzltyr1\"><!--pnid:4G6WdvLoX8Ngc8DxCYPNAE-->换个小家伙陪你敲</b><span data-page-node-id=\"rUueIWiyuaFGx28o7kZc7r\" class=\"muted\"><!--pnid:LQbvZ9q5cVytUKkONdWyQ1-->点击切换</span></div>\n    <div data-page-node-id=\"wNOzU2HnDu8Z4nM78iXUHB\" class=\"avatars\" id=\"avatars\"></div>\n  </section>\n\n  <footer data-page-node-id=\"TLX8BIb1ev6qaibGuELpUB\">\n    <button data-page-node-id=\"p80cD1Xs8Qn2caVw8txWXF\" class=\"ghost\" id=\"resetBtn\"><!--pnid:BclQ4D5Di4mxxezaExR4TV-->重置所有数据</button>\n  </footer>\n</div>\n\n";

(async function(){
  'use strict';

  var GOAL = 10;

  var SUCCESS_SLOGANS = [
    '今日功德圆满，心静如月 🌙',
    '戒定生慧，今天你做到了 ✨',
    '一身清爽，明天继续呀 🍃',
    '木鱼一响，烦恼皆忘 🐟',
    '你把念头放下了，很好 🤍',
    '心如止水，今日已清净 🫧',
    '又守住了一天，很了不起 💪',
    '笃、笃、笃——今日心安 🌿',
    '清净是给自己的礼物 🎁',
    '今日已打卡，愿你睡个好觉 😴'
  ];

  var PENDING_SLOGANS = [
    '心猿意马的时候，就来敲一下 🐒',
    '今天还没打卡，小和尚在等你哦 🙏',
    '一敲一放，别急，慢慢来 🌿',
    '色即是空，先敲十下再说 😌',
    '念头来了不怕，怕的是跟着走 🍂',
    '把注意力放回这一声「笃」上 👂',
    '今天是新的一天，从木鱼开始 ☀️',
    '不必完美，只要今天做到了就好 🌱',
    '手在敲，心在听，就很好 🫧',
    '每一次敲击，都是给自己松绑 🪷'
  ];

  var HIT_WORDS = ['功德 +1', '心静 +1', '妄念 -1', '清净 +1', '善哉～', '笃！', '定力 +1', '清凉 +1'];

  var AVATARS = [
    { id:'monk',    name:'小和尚', emoji:'🧘' },
    { id:'cat',     name:'小橘猫', emoji:'🐱' },
    { id:'fox',     name:'小狐狸', emoji:'🦊' },
    { id:'penguin', name:'小企鹅', emoji:'🐧' }
  ];

  var els = {
    bubble:   document.getElementById('bubble'),
    stage:    document.getElementById('stage'),
    svg:      document.getElementById('svg'),
    fx:       document.getElementById('fx'),
    dots:     document.getElementById('dots'),
    knockBtn: document.getElementById('knockBtn'),
    hint:     document.getElementById('hint'),
    streak:   document.getElementById('streakNum'),
    total:    document.getElementById('totalNum'),
    merit:    document.getElementById('meritNum'),
    cal:      document.getElementById('cal'),
    calTip:   document.getElementById('calTip'),
    avatars:  document.getElementById('avatars'),
    sound:    document.getElementById('soundBtn'),
    reset:    document.getElementById('resetBtn')
  };

  var state = { records:{}, merits:0, avatar:'monk', muted:false };
  var pendingSlogan = pick(PENDING_SLOGANS);
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#fffaf4;display:grid;place-items:center;padding:24px;text-align:center';
  overlay.textContent = '正在连接数据…'; document.body.appendChild(overlay);
  var connection, sqlFetch, queue = Promise.resolve(), failed = false;
  async function execute(sql, args) {
    var response = await sqlFetch(connection.origin + '/v3/pipeline', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql:sql,args:args || [],want_rows:true}},{type:'close'}]})});
    if(!response.ok) throw Error('数据库请求失败');
    var body = await response.json(), result = body.results && body.results[0];
    if(result?.type !== 'ok' || result.response?.type !== 'execute') throw Error('数据库操作结果不明');
    return result.response.result;
  }
  try {
    if(typeof window.tiana?.auth?.getAccessToken !== 'function') throw Error('账号服务不可用');
    connection = await window.tiana.connection();
    if(connection.sql_api !== 'hrana-v3') throw Error('数据库协议不可用');
    sqlFetch = createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
    var result = await execute('SELECT data FROM muyu_state WHERE id = 1');
    var raw = result.rows?.[0]?.[0]?.value;
    if(raw) { var saved = JSON.parse(raw); state = {records:saved.records || {},merits:saved.merits || 0,avatar:saved.avatar || 'monk',muted:!!saved.muted}; }
    overlay.remove();
  } catch(e) { overlay.textContent = '无法读取数据，请检查连接后重新打开应用。'; return; }
  function save(){
    var data = JSON.stringify(state);
    queue = queue.then(async function(){
      if(failed) return;
      try { await execute('INSERT INTO muyu_state(id,data) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', [{type:'text',value:data}]); }
      catch(e) { failed = true; overlay.textContent = '保存结果未确认，请重新打开应用检查数据。'; document.body.appendChild(overlay); }
    });
  }

  function pad(n){ return n < 10 ? '0'+n : ''+n; }
  function keyOf(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function todayKey(){ return keyOf(new Date()); }

  function todayRec(){
    var k = todayKey();
    if(!state.records[k]) state.records[k] = { n:0, done:false, slogan:'' };
    return state.records[k];
  }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function streak(){
    var s = 0, d = new Date();
    if(!(state.records[keyOf(d)] && state.records[keyOf(d)].done)){
      d.setDate(d.getDate()-1);
    }
    while(true){
      var r = state.records[keyOf(d)];
      if(r && r.done){ s++; d.setDate(d.getDate()-1); } else break;
    }
    return s;
  }
  function totalDone(){
    var n = 0;
    for(var k in state.records){ if(state.records[k] && state.records[k].done) n++; }
    return n;
  }

  /* ---------------- 音效 ---------------- */
  var actx = null;
  function audio(){
    try{
      if(!actx){
        var AC = window.AudioContext || window.webkitAudioContext;
        if(!AC) return null;
        actx = new AC();
      }
      if(actx.state === 'suspended') actx.resume();
      return actx;
    }catch(e){ return null; }
  }
  function playKnock(){
    if(state.muted) return;
    var ctx = audio(); if(!ctx) return;
    var t = ctx.currentTime;

    var o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(400, t);
    o.frequency.exponentialRampToValueAtTime(132, t + 0.1);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.26);

    var len = Math.floor(ctx.sampleRate * 0.05);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for(var i=0;i<len;i++){ data[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 3); }
    var src = ctx.createBufferSource(); src.buffer = buf;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 0.9;
    var ng = ctx.createGain(); ng.gain.value = 0.16;
    src.connect(bp); bp.connect(ng); ng.connect(ctx.destination);
    src.start(t);
  }
  function playSuccess(){
    if(state.muted) return;
    var ctx = audio(); if(!ctx) return;
    var notes = [659.25, 783.99, 987.77, 1318.51];
    notes.forEach(function(f, i){
      var t = ctx.currentTime + i*0.13;
      var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.62);
    });
  }

  /* ---------------- 特效 ---------------- */
  function floatWord(text){
    var el = document.createElement('div');
    el.className = 'float-word';
    el.textContent = text;
    el.style.left = (52 + Math.random()*18) + '%';
    el.style.top  = (50 + Math.random()*12) + '%';
    els.fx.appendChild(el);
    setTimeout(function(){ el.remove(); }, 1000);
  }
  function confetti(){
    var shapes = ['🌸','✨','🎉','🍃','⭐','💛','🫧'];
    for(var i=0;i<16;i++){
      (function(i){
        var d = document.createElement('div');
        d.className = 'confetti';
        d.textContent = shapes[i % shapes.length];
        d.style.left = (8 + Math.random()*84) + '%';
        d.style.fontSize = (13 + Math.random()*13) + 'px';
        d.style.animationDelay = (Math.random()*0.45) + 's';
        els.fx.appendChild(d);
        setTimeout(function(){ d.remove(); }, 2400);
      })(i);
    }
  }
  function animateHit(){
    els.stage.classList.remove('hitting');
    void els.stage.offsetWidth;
    els.stage.classList.add('hitting');
    clearTimeout(animateHit._t);
    animateHit._t = setTimeout(function(){ els.stage.classList.remove('hitting'); }, 300);
  }

  /* ---------------- 敲击 ---------------- */
  var lastKnock = 0;
  function knock(){
    var now = Date.now();
    if(now - lastKnock < 90) return;
    lastKnock = now;

    var rec = todayRec();
    var wasDone = rec.done;

    rec.n += 1;
    state.merits += 1;

    if(rec.n >= GOAL && !rec.done){
      rec.done = true;
      rec.slogan = pick(SUCCESS_SLOGANS);
      save();
      animateHit();
      playKnock();
      floatWord(pick(HIT_WORDS));
      setTimeout(function(){
        confetti();
        playSuccess();
        els.bubble.classList.add('pop');
        setTimeout(function(){ els.bubble.classList.remove('pop'); }, 260);
        render();
      }, 170);
      render();
      return;
    }

    if(!rec.done){
      pendingSlogan = pick(PENDING_SLOGANS);
    }
    save();
    animateHit();
    playKnock();
    floatWord(pick(HIT_WORDS));
    render();
  }

  /* ---------------- 渲染 ---------------- */
  function render(){
    var rec = todayRec();
    var left = Math.max(0, GOAL - rec.n);

    els.streak.textContent = streak();
    els.total.textContent  = totalDone();
    els.merit.textContent  = state.merits;

    if(rec.done){
      els.bubble.classList.add('done');
      els.bubble.textContent = rec.slogan || SUCCESS_SLOGANS[0];
    }else{
      els.bubble.classList.remove('done');
      els.bubble.textContent = pendingSlogan;
    }

    var html = '';
    for(var i=0;i<GOAL;i++){ html += '<i class="' + (i < rec.n ? 'on' : '') + '"></i>'; }
    els.dots.innerHTML = html;

    if(rec.done){
      els.knockBtn.textContent = '今日已圆满 · 再敲攒功德';
      els.knockBtn.classList.add('ghosted');
      els.hint.textContent = '今天已经打过卡啦，随时可以再来敲敲 🫧';
    }else{
      els.knockBtn.textContent = '敲一下木鱼 (' + Math.min(rec.n, GOAL) + '/' + GOAL + ')';
      els.knockBtn.classList.remove('ghosted');
      els.hint.textContent = '再敲 ' + left + ' 下，今天就算打卡成功 ✨';
    }

    els.sound.textContent = state.muted ? '🔕' : '🔔';

    // 形象
    var figs = els.svg.querySelectorAll('.char-figure');
    for(var j=0;j<figs.length;j++){
      figs[j].classList.toggle('active', figs[j].getAttribute('data-avatar') === state.avatar);
    }
    var avs = els.avatars.querySelectorAll('.av');
    for(var k=0;k<avs.length;k++){
      avs[k].classList.toggle('active', avs[k].getAttribute('data-id') === state.avatar);
    }

    renderCal();
  }

  function renderCal(){
    var cells = [], done = 0;
    for(var i=20;i>=0;i--){
      var d = new Date();
      d.setDate(d.getDate() - i);
      var r = state.records[keyOf(d)];
      var isDone = !!(r && r.done);
      if(isDone) done++;
      cells.push(
        '<div class="cell' + (isDone ? ' on' : '') + (i === 0 ? ' today' : '') + '">' +
          '<span class="d">' + d.getDate() + '</span>' +
          '<span class="m">' + '日一二三四五六'.charAt(d.getDay()) + '</span>' +
        '</div>'
      );
    }
    els.cal.innerHTML = cells.join('');
    els.calTip.textContent = '这 21 天打卡 ' + done + ' 天';
  }

  function buildAvatars(){
    els.avatars.innerHTML = AVATARS.map(function(a){
      return '<button class="av" data-id="' + a.id + '" type="button">' +
               '<span class="e">' + a.emoji + '</span>' +
               '<span class="n">' + a.name + '</span>' +
             '</button>';
    }).join('');
    els.avatars.addEventListener('click', function(e){
      var btn = e.target.closest('.av');
      if(!btn) return;
      state.avatar = btn.getAttribute('data-id');
      save();
      render();
      floatWord('换好啦～');
    });
  }

  /* ---------------- 事件 ---------------- */
  els.stage.addEventListener('click', knock);
  els.knockBtn.addEventListener('click', knock);

  els.sound.addEventListener('click', function(){
    state.muted = !state.muted;
    save();
    render();
    if(!state.muted) playKnock();
  });

  els.reset.addEventListener('click', function(){
    if(confirm('确定要清空全部打卡记录和功德吗？此操作无法撤销。')){
      state = { records:{}, merits:0, avatar:state.avatar, muted:state.muted };
      pendingSlogan = pick(PENDING_SLOGANS);
      save();
      render();
    }
  });

  document.addEventListener('keydown', function(e){
    if(e.code === 'Space' && e.target.tagName !== 'BUTTON'){
      e.preventDefault();
      knock();
    }
  });

  buildAvatars();
  render();
})();
