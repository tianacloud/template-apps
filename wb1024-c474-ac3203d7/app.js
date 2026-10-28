const style=document.createElement("style");style.textContent="\n  :root{\n    --bg:#0f1420;\n    --bg2:#161d2c;\n    --card:rgba(255,255,255,.07);\n    --line:rgba(255,255,255,.14);\n    --txt:#eaf0ff;\n    --sub:#9aa8c7;\n    --accent:#4f8cff;\n    --accent2:#39d3b3;\n    --radius:16px;\n  }\n  *{box-sizing:border-box;}\n  html,body{margin:0;padding:0;}\n  body{\n    background:radial-gradient(1200px 700px at 15% -10%,#1d2a45 0%,var(--bg) 55%) ,var(--bg);\n    color:var(--txt);\n    font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n    min-height:100vh;\n    display:flex;align-items:center;justify-content:center;\n    padding:24px 16px;\n  }\n  img{max-width:100%;height:auto;}\n  .wrap{width:100%;max-width:720px;}\n\n  /* ---------- 首页 ---------- */\n  .home{\n    background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.04));\n    border:1px solid var(--line);\n    border-radius:24px;\n    padding:34px 30px 30px;\n    box-shadow:0 30px 70px rgba(0,0,0,.45);\n    backdrop-filter:blur(12px);\n  }\n  .brand{display:flex;align-items:center;gap:12px;margin-bottom:6px;}\n  .logo{\n    width:42px;height:42px;border-radius:12px;flex:none;\n    background:conic-gradient(from 210deg,#4f8cff,#39d3b3,#ffb020,#4f8cff);\n    display:flex;align-items:center;justify-content:center;\n    font-weight:800;color:#0f1420;font-size:19px;\n    box-shadow:0 6px 18px rgba(79,140,255,.35);\n  }\n  h1{font-size:clamp(24px,5vw,34px);margin:0;letter-spacing:.5px;}\n  .tagline{color:var(--sub);margin:10px 0 26px;font-size:14px;line-height:1.7;}\n\n  .field{margin-bottom:26px;}\n  .field-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px;}\n  .field-label{font-size:15px;font-weight:600;}\n  .field-value{font-size:14px;color:var(--accent2);font-weight:700;letter-spacing:.5px;}\n\n  input[type=range]{\n    -webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:99px;\n    background:linear-gradient(90deg,var(--accent) var(--fill,50%),rgba(255,255,255,.16) var(--fill,50%));\n    outline:none;margin:6px 0 4px;\n  }\n  input[type=range]::-webkit-slider-thumb{\n    -webkit-appearance:none;width:22px;height:22px;border-radius:50%;\n    background:#fff;border:4px solid var(--accent);cursor:pointer;\n    box-shadow:0 3px 10px rgba(0,0,0,.4);transition:transform .15s;\n  }\n  input[type=range]::-webkit-slider-thumb:active{transform:scale(1.15);}\n  input[type=range]::-moz-range-thumb{\n    width:20px;height:20px;border-radius:50%;background:#fff;border:4px solid var(--accent);cursor:pointer;\n  }\n  .ticks{display:flex;justify-content:space-between;margin-top:8px;}\n  .ticks span{font-size:12px;color:var(--sub);transition:.2s;}\n  .ticks span.on{color:#fff;font-weight:700;}\n\n  .start{\n    width:100%;margin-top:8px;padding:16px;border:none;border-radius:14px;cursor:pointer;\n    background:linear-gradient(90deg,var(--accent),#6f6bff);\n    color:#fff;font-size:17px;font-weight:700;letter-spacing:2px;\n    box-shadow:0 12px 28px rgba(79,140,255,.35);transition:transform .15s,box-shadow .15s;\n  }\n  .start:hover{transform:translateY(-2px);box-shadow:0 16px 34px rgba(79,140,255,.45);}\n  .start:active{transform:translateY(0);}\n  .tips{margin-top:20px;padding-top:18px;border-top:1px dashed var(--line);color:var(--sub);font-size:13px;line-height:1.9;}\n  .tips b{color:#cfe0ff;font-weight:600;}\n\n  /* ---------- 游戏页 ---------- */\n  .game{display:none;}\n  .game.on{display:block;}\n  .home.off{display:none;}\n\n  .topbar{\n    display:flex;align-items:center;justify-content:space-between;gap:12px;\n    background:var(--card);border:1px solid var(--line);border-radius:14px;\n    padding:12px 16px;margin-bottom:16px;backdrop-filter:blur(8px);\n  }\n  .back{\n    background:rgba(255,255,255,.08);border:1px solid var(--line);color:var(--txt);\n    padding:9px 16px;border-radius:10px;cursor:pointer;font-size:14px;transition:.2s;\n  }\n  .back:hover{background:rgba(255,255,255,.16);}\n  .timer{\n    font-variant-numeric:tabular-nums;font-size:26px;font-weight:700;letter-spacing:1px;\n    color:#fff;text-shadow:0 0 18px rgba(79,140,255,.5);\n  }\n  .meta{color:var(--sub);font-size:12.5px;white-space:nowrap;}\n  .meta span{margin-left:10px;}\n\n  .board-area{position:relative;}\n  .board{\n    display:grid;gap:8px;padding:14px;border-radius:18px;\n    background:rgba(255,255,255,.05);border:1px solid var(--line);\n    margin:0 auto;max-width:620px;\n  }\n  .g5{grid-template-columns:repeat(5,minmax(0,1fr));}\n  .g6{grid-template-columns:repeat(6,minmax(0,1fr));}\n  .g7{grid-template-columns:repeat(7,minmax(0,1fr));}\n  .cell{\n    position:relative;aspect-ratio:1/1;\n    display:flex;align-items:center;justify-content:center;\n    cursor:pointer;user-select:none;\n  }\n  .cell .inner{\n    position:relative;width:100%;height:100%;\n    display:flex;align-items:center;justify-content:center;\n  }\n  .cell .face{\n    position:absolute;inset:0;border-radius:10px;\n    background:var(--c,#1b2436);\n    border:1px solid rgba(255,255,255,.1);\n    transition:transform .18s ease,filter .2s ease,background .2s ease,border-color .2s ease,box-shadow .2s ease;\n  }\n  .cell .num{\n    position:relative;z-index:2;font-weight:700;color:#e9f0ff;\n    font-size:clamp(15px,3.4vw,24px);line-height:1;\n  }\n  .cell:hover .face{transform:scale(1.07);border-color:var(--accent);box-shadow:0 0 0 2px rgba(79,140,255,.55),0 10px 22px rgba(0,0,0,.45);}\n  .board.irr .cell:hover .face{filter:brightness(1.3);}\n  .cell.done .face{background:linear-gradient(135deg,#1f6f5c,#134a3f);border-color:var(--accent2);box-shadow:0 0 0 1px rgba(57,211,179,.6);filter:none;}\n  .cell.done .num{color:#a9f5e3;}\n  .cell.wrong{animation:shake .38s ease;}\n  @keyframes shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-6px);}50%{transform:translateX(6px);}75%{transform:translateX(-3px);}}\n\n  /* 中/重度干扰：不规则形状 */\n  .board.irr .cell .face{border-radius:0;border:none;clip-path:var(--clip,none);}\n\n  /* 重度：整个方格缓慢旋转，方向随机 */\n  .board.spin .cell .inner{\n    animation:rot var(--dur,9s) linear infinite;\n    animation-direction:var(--dir,normal);\n  }\n  @keyframes rot{from{transform:rotate(0);}to{transform:rotate(360deg);}}\n\n  .actions{display:flex;justify-content:center;gap:12px;margin-top:18px;}\n  .btn{\n    padding:12px 26px;border-radius:12px;cursor:pointer;font-size:15px;font-weight:600;\n    border:1px solid var(--line);background:rgba(255,255,255,.08);color:var(--txt);transition:.2s;\n  }\n  .btn:hover{background:rgba(255,255,255,.16);}\n  .btn.primary{background:linear-gradient(90deg,var(--accent),#6f6bff);border:none;color:#fff;box-shadow:0 10px 24px rgba(79,140,255,.32);}\n\n  .next-hint{margin-top:14px;text-align:center;color:var(--sub);font-size:13.5px;}\n  .next-hint b{color:var(--accent2);font-size:16px;}\n\n  /* 暂停遮罩 + 弹窗 */\n  .overlay{\n    position:absolute;inset:0;display:none;align-items:center;justify-content:center;\n    background:rgba(10,14,22,.35);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);\n    border-radius:18px;z-index:20;\n  }\n  .overlay.on{display:flex;}\n  .modal{\n    width:min(86%,320px);background:linear-gradient(180deg,#1d2740,#161d2c);\n    border:1px solid var(--line);border-radius:16px;padding:26px 22px;text-align:center;\n    box-shadow:0 24px 60px rgba(0,0,0,.55);\n  }\n  .modal h3{margin:0 0 8px;font-size:19px;}\n  .modal p{margin:0 0 20px;color:var(--sub);font-size:13.5px;line-height:1.7;}\n  .modal .row{display:flex;gap:10px;justify-content:center;}\n  .modal .btn{flex:1;padding:11px 8px;font-size:14px;}\n\n  .result{\n    position:fixed;inset:0;display:none;align-items:center;justify-content:center;\n    background:rgba(8,11,18,.6);backdrop-filter:blur(10px);z-index:40;padding:20px;\n  }\n  .result.on{display:flex;}\n  .result .modal{width:min(90%,340px);}\n\n  @media (max-width:640px){\n    .home{padding:26px 20px 22px;}\n    .board{gap:6px;padding:10px;}\n    .topbar{padding:10px 12px;}\n    .timer{font-size:22px;}\n    .meta{font-size:11.5px;}\n  }\n";style.textContent += "\nbody{display:block;padding:0} #app{min-height:100vh;width:100%;display:flex;align-items:center;justify-content:center;padding:24px 16px}";document.head.append(style);document.getElementById("app").innerHTML="\n<div data-page-node-id=\"jjvflEb6RCQBpfgg6qjVgP\" class=\"wrap\">\n\n  <!--pnid:xYDErOYsAZtmGvIGa9dX1j--><!-- ============ 首页 ============ -->\n  <section data-page-node-id=\"zH70OSrFkIl52vTBIdTb9g\" class=\"home\" id=\"home\">\n    <div data-page-node-id=\"k8Y7nBfrQ7EoFc4ZGDoh1D\" class=\"brand\">\n      <div data-page-node-id=\"tJc7D2FhujEqIB9QTJ3u6Y\" class=\"logo\"><!--pnid:i0ScBZGvDsmyOoRTEnO3AL-->舒</div>\n      <h1 data-page-node-id=\"5FM0VWP0VPxmgiXImtYfrA\"><!--pnid:Q5qXUNn4PTXTSU2e9QHVlj-->舒尔特方格训练</h1>\n    </div>\n    <p data-page-node-id=\"3gEuOtFW5JFPWw4VafuxJs\" class=\"tagline\"><!--pnid:JACxFFyd1rD3kNOKJz93g8-->从 1 开始按顺序点击方格中的数字。难度越高、干扰越强，注意力和视搜索能力被训练得越充分。</p>\n\n    <div data-page-node-id=\"b5otte0vqQx4BfQ5b57TH2\" class=\"field\">\n      <div data-page-node-id=\"EIidQU7hEMllkIpmQgs9pV\" class=\"field-head\"><span data-page-node-id=\"S2FAThjcFLH3rA9jGc61a5\" class=\"field-label\"><!--pnid:On2j9V8Gnqwgs5d22jWj7x-->难度</span><span data-page-node-id=\"6OPbGvnlcFAgbdBc9hvRJB\" class=\"field-value\" id=\"diffVal\"><!--pnid:vbcUyYFkoIZLZOUBq4roS3-->初级</span></div>\n      <input data-page-node-id=\"tO9gvFAcgQ5PHPpb7fddfL\" id=\"diff\" max=\"2\" min=\"0\" step=\"1\" type=\"range\" value=\"0\">\n      <div data-page-node-id=\"V53XfEC5cUeyvgpQS5C4TU\" class=\"ticks\" id=\"diffTicks\">\n        <span data-page-node-id=\"tLqNgrppxgNVcVlqgbFGcp\" data-i=\"0\"><!--pnid:ZE4XlLgbeJrPTKl9WXMLY7-->初级 5×5</span><span data-page-node-id=\"io8luwEg7k5cxqEUcfrlyP\" data-i=\"1\"><!--pnid:IokawGkDDv7AoBKx87v3Fy-->中级 6×6</span><span data-page-node-id=\"RlO1NdJIoASbWhnFklyKEN\" data-i=\"2\"><!--pnid:siJeo8VtAHt2qSiIxcWNwY-->高级 7×7</span>\n      </div>\n    </div>\n\n    <div data-page-node-id=\"Zp13nOcpra2RqLL6Fp95wJ\" class=\"field\">\n      <div data-page-node-id=\"SeEtky54W1mXFMd9dAhYdK\" class=\"field-head\"><span data-page-node-id=\"fClxplOS2uf6E90mPEDZzl\" class=\"field-label\"><!--pnid:ZHp8EiuIsltmcKgPA1cPJm-->辅助</span><span data-page-node-id=\"Mes20iITNXGuSEqosAMYXT\" class=\"field-value\" id=\"aidVal\"><!--pnid:AntOvsn4hnvwfZSDdtDOKJ-->关闭</span></div>\n      <input data-page-node-id=\"r1rqglVFXP6Uzs7SBNnyc3\" id=\"aid\" max=\"1\" min=\"0\" step=\"1\" type=\"range\" value=\"0\">\n      <div data-page-node-id=\"wPuSwcJj6vQGoPQbUYNYzb\" class=\"ticks\" id=\"aidTicks\"><span data-page-node-id=\"ShEda8GdDiM60SaaCaZMVL\" data-i=\"0\"><!--pnid:4QB8fBC7DwQ9A4y67h6gZ3-->关闭</span><span data-page-node-id=\"hCagzbTdW671dIaswrK8Rv\" data-i=\"1\"><!--pnid:J7d2eGT07wRX18u62hZHrW-->开启</span></div>\n    </div>\n\n    <div data-page-node-id=\"LT8EUZLX31eb2N8Fi0HKnY\" class=\"field\">\n      <div data-page-node-id=\"z8Rf81Oxr10gvi90dFcBYd\" class=\"field-head\"><span data-page-node-id=\"rDHHiWl0SiqfNOTRyFZAGp\" class=\"field-label\"><!--pnid:qfyMElow9hAKwYeKGu5zwQ-->干扰</span><span data-page-node-id=\"QLEy7BeVi1nQpOLA6HrSFx\" class=\"field-value\" id=\"disVal\"><!--pnid:UKc089xvfu3daSCTgXRbUp-->无</span></div>\n      <input data-page-node-id=\"5m63VHSYKixWjALrwfkrUg\" id=\"dis\" max=\"3\" min=\"0\" step=\"1\" type=\"range\" value=\"0\">\n      <div data-page-node-id=\"tBPRHTYU2WtaN9BLeC42yd\" class=\"ticks\" id=\"disTicks\">\n        <span data-page-node-id=\"xsMRhp9FPHbO2k5SOOlJIk\" data-i=\"0\"><!--pnid:nRjzhy8kJrbDsOT9dI1nWQ-->无</span><span data-page-node-id=\"BGDwuN58YF9I8WNyQTGASI\" data-i=\"1\"><!--pnid:gBFScS3sclBvQl3VXiMiSw-->轻微</span><span data-page-node-id=\"8knKahmPhPOJzCkwxOEOw7\" data-i=\"2\"><!--pnid:Qm4m8yZUrhnId8m0Vq3twl-->中度</span><span data-page-node-id=\"R9cL4jAZO7OiaRSJujStIm\" data-i=\"3\"><!--pnid:dfjjOmfsGRSkwfqwyZ0bVv-->重度</span>\n      </div>\n    </div>\n\n    <button data-page-node-id=\"K5vFr3hmgwhhSHSSm0xvMn\" class=\"start\" id=\"startBtn\"><!--pnid:AcYcU5y2HcMpEomViCLnRi-->开 始 游 戏</button>\n\n    <div data-page-node-id=\"gBZT5COOYBNZ3OY2NhL28A\" class=\"tips\">\n      <b data-page-node-id=\"xiPBbFhydxG6OnkYRWbpBJ\"><!--pnid:ttjeV4Jd7FkJXfv6w1kb1a-->难度</b><!--pnid:drDUdryl3U4clwrO8qmdIB-->：初级 5×5（25 个数字）· 中级 6×6（36 个）· 高级 7×7（49 个）<br data-page-node-id=\"8KfR4thjl0rburWCyJBGHY\">\n      <b data-page-node-id=\"cQKxGEO8hR5oQh67uqITwg\"><!--pnid:Pq3fQB7FassqNPk2mJjwVQ-->辅助</b><!--pnid:uIj2C3AYTzgmS518ypfcwO-->：开启后已按顺序点过的数字会持续高亮，方便初学者定位进度<br data-page-node-id=\"oM2k9EZQNg8peYuScp88hR\">\n      <b data-page-node-id=\"dIZ0WO7jMZyQpSSPkr4gXs\"><!--pnid:OGUk4gjbgOfzyLIZ5t7fF4-->干扰</b><!--pnid:kcabTyqjWdCqny3QBTcwV3-->：轻微＝随机配色；中度＝不规则形状＋随机配色；重度＝在此基础上叠加缓慢旋转\n    </div>\n  </section>\n\n  <!--pnid:kZDZQKWfMuJqTtTVzy3Jd3--><!-- ============ 游戏页 ============ -->\n  <section data-page-node-id=\"xoGOe2Q4Qu4TxKtZ6OQLN8\" class=\"game\" id=\"game\">\n    <div data-page-node-id=\"pLv2LQwfDie5PKVq6nB4Ap\" class=\"topbar\">\n      <button data-page-node-id=\"KT3FPPtDgYq8zH916hjyb5\" class=\"back\" id=\"backBtn\"><!--pnid:LZ5qg37ZNuIKPP6mYErIdF-->← 返回</button>\n      <div data-page-node-id=\"ZsI3QHvfPGmXp1MWz1yFpN\" class=\"timer\" id=\"timer\"><!--pnid:RRUYdsMkRX89fP4zUmUKdz-->00:00.0</div>\n      <div data-page-node-id=\"1EMyc6v1AKWSBaDcnsd6AE\" class=\"meta\" id=\"meta\"></div>\n    </div>\n\n    <div data-page-node-id=\"GEE9mvBU4BRfVCag9FoMRC\" class=\"board-area\">\n      <div data-page-node-id=\"kD6PEqzLPJbbKHhpBzE10M\" class=\"board\" id=\"board\"></div>\n      <div data-page-node-id=\"whc7JQEDiBKp2dVW7YU1l8\" class=\"overlay\" id=\"overlay\">\n        <div data-page-node-id=\"yDVQJW7JJDQz8AmYfpcqv5\" class=\"modal\">\n          <h3 data-page-node-id=\"Bb5ieXKGHWRsxOg5CNtMLk\"><!--pnid:P9PPy3E2RwDMmxvYXH3pbX-->游戏已暂停</h3>\n          <p data-page-node-id=\"5KDxpI72GPgjltZRpOjNpI\"><!--pnid:tOqOKtn9iqVrWEKbNzUgfr-->计时已停止，方格暂时被遮挡。<br data-page-node-id=\"zWJZUHpxsgoyUa68vKgpGd\"><!--pnid:zRU5c4BuZHbvi1VIARAMdd-->准备好后继续训练吧。</p>\n          <div data-page-node-id=\"yj5mC7tGUvCNnxJQyPPbKu\" class=\"row\">\n            <button data-page-node-id=\"mTnjryBX55OIC8heKtyLdd\" class=\"btn primary\" id=\"resumeBtn\"><!--pnid:OCcZKGYPf7NTTAd6WfpAu2-->继续游戏</button>\n            <button data-page-node-id=\"7aQlyp3TfSkoKrNP9NmZhk\" class=\"btn\" id=\"endBtn\"><!--pnid:tm8tch8dVPY7DCWafZ6buF-->结束训练</button>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div data-page-node-id=\"GiyLV4iQzY0fDimePeKWKB\" class=\"next-hint\"><!--pnid:VBdZn1SH4f2BgSQrbHtb3J-->下一个要点击的数字：<b data-page-node-id=\"BpAZbWinUDwtKdJqYAy7iE\" id=\"nextNum\"><!--pnid:X7dSt9mauJenjrcU1pYpJb-->1</b></div>\n\n    <div data-page-node-id=\"UtStdBrnNB5o63CiaqBDLV\" class=\"actions\">\n      <button data-page-node-id=\"8wJBsaPEeSD7srOk1LO7cS\" class=\"btn\" id=\"pauseBtn\"><!--pnid:RkSrirYVMkugVOo5rc3ga4-->暂停训练</button>\n    </div>\n  </section>\n</div>\n\n<!--pnid:GCJP1RTyNqIlddjWQ04DMd--><!-- 完成弹窗 -->\n<div data-page-node-id=\"Wfm6zHT1xo5u3qENOwfTEt\" class=\"result\" id=\"result\">\n  <div data-page-node-id=\"mcHUvmgZpTrRqOZdCWemKu\" class=\"modal\">\n    <h3 data-page-node-id=\"4JtPGoTUJSRFsGHLI9023S\"><!--pnid:abHmAg3BzRrNd2c3xB4iO8-->训练完成 🎉</h3>\n    <p data-page-node-id=\"ti1JXqZlVnilKQ94kVDSnR\"><!--pnid:tih4ZIi7eznXDexEyUWVgA-->本次用时 <b data-page-node-id=\"DfkGVpUBNcW0R4i3GqK1xb\" id=\"rTime\" style=\"color:#fff; font-size:18px\"><!--pnid:jbqqPH0SrrVPNaqHii4Ysv-->00:00.0</b><br data-page-node-id=\"9axaHgYX5OZxq3uDjblvEZ\"><span data-page-node-id=\"UmnkkCO6c6vr4w3ItENKti\" id=\"rLevel\"></span></p>\n    <div data-page-node-id=\"YTxYFRdutLb0OsTsUsB84N\" class=\"row\">\n      <button data-page-node-id=\"tbXJ69cZmEdGSiaBzunyW7\" class=\"btn primary\" id=\"againBtn\"><!--pnid:2LzQaljT7K4NTbz0WajmpB-->再来一局</button>\n      <button data-page-node-id=\"ks4OmtHXDycKlWYICJ7oyL\" class=\"btn\" id=\"homeBtn\"><!--pnid:Ey727h3T2I5gigZc5LPlo1-->返回首页</button>\n    </div>\n  </div>\n</div>\n\n";

(function(){
  'use strict';

  var DIFFS = [
    {name:'初级', size:5, total:25},
    {name:'中级', size:6, total:36},
    {name:'高级', size:7, total:49}
  ];
  var DISTURB = ['无','轻微','中度','重度'];

  /* 不规则形状 clip-path 集合 */
  var SHAPES = [
    'polygon(50% 0%,100% 25%,88% 100%,12% 92%,0% 30%)',
    'polygon(0% 18%,72% 0%,100% 62%,54% 100%,6% 78%)',
    'polygon(20% 0%,100% 12%,78% 100%,0% 70%)',
    'polygon(8% 6%,92% 0%,100% 74%,42% 100%,0% 52%)',
    'polygon(50% 0%,100% 44%,64% 100%,10% 76%,2% 24%)',
    'polygon(0% 30%,58% 0%,100% 46%,72% 100%,14% 88%)'
  ];
  var HUES = [352,18,42,86,150,190,214,262,300];

  var $ = function(id){ return document.getElementById(id); };
  var home=$('home'), game=$('game'), board=$('board'), timerEl=$('timer'), metaEl=$('meta');
  var nextNumEl=$('nextNum'), overlay=$('overlay'), result=$('result');

  var cfg = { diff:0, aid:0, dis:0 };
  var state = null;

  /* ---------- 滑块联动 ---------- */
  function syncRange(input){
    var min=+input.min, max=+input.max, v=+input.value;
    var pct = max===min ? 0 : (v-min)/(max-min)*100;
    input.style.setProperty('--fill', pct+'%');
  }
  function markTicks(box, idx){
    var spans = box.querySelectorAll('span');
    for(var i=0;i<spans.length;i++){
      spans[i].classList.toggle('on', +spans[i].getAttribute('data-i')===idx);
    }
  }
  function bindSlider(id, ticksId, valId, labels, key){
    var input=$(id), box=$(ticksId), val=$(valId);
    function upd(){
      var v=+input.value;
      cfg[key]=v;
      syncRange(input);
      markTicks(box,v);
      val.textContent = labels[v];
    }
    input.addEventListener('input',upd);
    upd();
  }
  bindSlider('diff','diffTicks','diffVal',['初级','中级','高级'],'diff');
  bindSlider('aid','aidTicks','aidVal',['关闭','开启'],'aid');
  bindSlider('dis','disTicks','disVal',DISTURB,'dis');

  /* ---------- 游戏逻辑 ---------- */
  function shuffle(arr){
    for(var i=arr.length-1;i>0;i--){
      var j=Math.floor(Math.random()*(i+1));
      var t=arr[i]; arr[i]=arr[j]; arr[j]=t;
    }
    return arr;
  }
  function randColor(){
    var h = HUES[Math.floor(Math.random()*HUES.length)];
    return 'hsl('+h+',45%,42%)';
  }
  function pad(n){ return n<10 ? '0'+n : ''+n; }
  function fmt(ms){
    var t = ms/1000;
    var m = Math.floor(t/60);
    var s = t - m*60;
    return pad(m)+':'+(s<10?'0':'')+s.toFixed(1);
  }

  function buildBoard(){
    var d = DIFFS[cfg.diff];
    var nums = [];
    for(var i=1;i<=d.total;i++) nums.push(i);
    shuffle(nums);

    board.className = 'board g'+d.size;
    if(cfg.dis>=2) board.classList.add('irr');
    if(cfg.dis>=3) board.classList.add('spin');
    board.innerHTML='';

    for(var k=0;k<nums.length;k++){
      var c=document.createElement('div');
      c.className='cell';
      c.setAttribute('data-n', nums[k]);
      if(cfg.dis>=1){
        c.style.setProperty('--c', randColor());
      }
      if(cfg.dis>=2){
        c.style.setProperty('--clip', SHAPES[Math.floor(Math.random()*SHAPES.length)]);
      }
      if(cfg.dis>=3){
        var dur = 7 + Math.random()*6;                       // 7~13 秒一圈，缓慢
        c.style.setProperty('--dur', dur.toFixed(2)+'s');
        c.style.setProperty('--dir', Math.random()<0.5 ? 'normal' : 'reverse'); // 旋转方向随机
      }
      var inner=document.createElement('div');
      inner.className='inner';
      var face=document.createElement('div');
      face.className='face';
      var s=document.createElement('span');
      s.className='num';
      s.textContent = nums[k];
      inner.appendChild(face);
      inner.appendChild(s);
      c.appendChild(inner);
      board.appendChild(c);
    }
  }

  function startGame(){
    buildBoard();
    var d = DIFFS[cfg.diff];
    state = {
      next:1, total:d.total, start:Date.now(), elapsed:0, timer:null, paused:false, over:false
    };
    nextNumEl.textContent='1';
    metaEl.textContent = '';
    var m1=document.createElement('span'); m1.textContent = d.name+' · '+d.size+'×'+d.size;
    var m2=document.createElement('span'); m2.textContent = cfg.aid?'辅助开':'辅助关';
    var m3=document.createElement('span'); m3.textContent = DISTURB[cfg.dis]+'干扰';
    metaEl.appendChild(m1); metaEl.appendChild(m2); metaEl.appendChild(m3);
    home.classList.add('off');
    game.classList.add('on');
    result.classList.remove('on');
    overlay.classList.remove('on');
    state.timer = setInterval(tick, 100);
    tick();
  }
  function tick(){
    if(!state || state.paused || state.over) return;
    timerEl.textContent = fmt(Date.now()-state.start+state.elapsed);
  }
  function elapsedNow(){
    return Date.now()-state.start+state.elapsed;
  }
  function pause(){
    if(!state || state.paused || state.over) return;
    state.paused = true;
    state.elapsed = elapsedNow();
    clearInterval(state.timer);
    timerEl.textContent = fmt(state.elapsed);
    overlay.classList.add('on');
  }
  function resume(){
    if(!state) return;
    state.paused = false;
    state.start = Date.now();
    overlay.classList.remove('on');
    state.timer = setInterval(tick,100);
  }
  function endGame(){
    if(!state) return;
    clearInterval(state.timer);
    state.over = true;
    game.classList.remove('on');
    home.classList.remove('off');
    overlay.classList.remove('on');
    result.classList.remove('on');
    state = null;
  }
  function finish(){
    clearInterval(state.timer);
    var total = elapsedNow();
    state.over = true;
    $('rTime').textContent = fmt(total);
    $('rLevel').textContent = DIFFS[cfg.diff].name+' · '+DIFFS[cfg.diff].size+'×'+DIFFS[cfg.diff].size+' · '+DISTURB[cfg.dis]+'干扰';
    result.classList.add('on');
  }

  function onCellClick(e){
    if(!state || state.paused || state.over) return;
    var cell = e.target.closest ? e.target.closest('.cell') : null;
    if(!cell) return;
    var n = +cell.getAttribute('data-n');
    if(n === state.next){
      if(cfg.aid){
        cell.classList.add('done');
      }
      state.next++;
      nextNumEl.textContent = state.next<=state.total ? state.next : '完成';
      if(state.next > state.total){ finish(); }
    }else{
      cell.classList.add('wrong');
      setTimeout(function(){ cell.classList.remove('wrong'); },400);
    }
  }

  board.addEventListener('click', onCellClick);

  /* ---------- 事件绑定 ---------- */
  $('startBtn').addEventListener('click', startGame);
  $('backBtn').addEventListener('click', endGame);
  $('pauseBtn').addEventListener('click', pause);
  $('resumeBtn').addEventListener('click', resume);
  $('endBtn').addEventListener('click', endGame);
  $('againBtn').addEventListener('click', startGame);
  $('homeBtn').addEventListener('click', endGame);
})();
