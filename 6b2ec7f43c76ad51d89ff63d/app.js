document.head.insertAdjacentHTML("beforeend","<style>\n  :root{\n    --accent:#7fd1ff;\n    --accent-soft:rgba(127,209,255,.18);\n    --ink:#eef4fb;\n    --ink-dim:rgba(238,244,251,.62);\n    --panel:rgba(14,20,32,.42);\n    --panel-line:rgba(255,255,255,.10);\n  }\n  *{box-sizing:border-box;margin:0;padding:0;}\n  html,body{height:100%;overflow:hidden;background:#05070d;}\n  body{\n    font-family:-apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Microsoft YaHei\",Segoe UI,Roboto,sans-serif;\n    color:var(--ink);\n    -webkit-font-smoothing:antialiased;\n    user-select:none;\n    cursor:default;\n  }\n  #bg{position:fixed;inset:0;width:100%;height:100%;display:block;z-index:0;transition:filter .8s ease;}\n  .veil{position:fixed;inset:0;z-index:1;pointer-events:none;\n    background:radial-gradient(120% 90% at 50% 0%,transparent 40%,rgba(0,0,0,.28) 100%);}\n\n  /* 顶部信息 */\n  .topbar{position:fixed;top:0;left:0;right:0;z-index:5;\n    display:flex;align-items:flex-start;justify-content:space-between;\n    padding:22px 26px;pointer-events:none;}\n  .brand{display:flex;flex-direction:column;gap:6px;}\n  .brand .logo{font-size:15px;letter-spacing:3px;font-weight:600;\n    display:flex;align-items:center;gap:9px;}\n  .brand .logo .dot{width:9px;height:9px;border-radius:50%;\n    background:var(--accent);box-shadow:0 0 14px var(--accent);}\n  .brand .scene-name{font-size:12px;color:var(--ink-dim);letter-spacing:2px;}\n  .clock{pointer-events:none;text-align:right;font-variant-numeric:tabular-nums;}\n  .clock .t{font-size:26px;font-weight:300;letter-spacing:2px;}\n  .clock .d{font-size:11px;color:var(--ink-dim);margin-top:2px;letter-spacing:1px;}\n\n  /* 中央放松语 */\n  .quote{position:fixed;z-index:4;left:50%;top:38%;transform:translate(-50%,-50%);\n    width:min(680px,82vw);text-align:center;pointer-events:none;\n    transition:opacity .6s ease;}\n  .quote .mood-tag{display:inline-block;font-size:12px;letter-spacing:4px;\n    color:var(--accent);margin-bottom:14px;opacity:.9;}\n  .quote .text{font-size:clamp(19px,2.6vw,27px);line-height:1.7;font-weight:300;\n    text-shadow:0 2px 24px rgba(0,0,0,.5);}\n  .quote .sub{margin-top:14px;font-size:13px;color:var(--ink-dim);letter-spacing:1px;}\n\n  /* 底部控制坞 */\n  .dock{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:6;\n    display:flex;gap:8px;align-items:center;padding:9px 11px;border-radius:18px;\n    background:var(--panel);border:1px solid var(--panel-line);\n    backdrop-filter:blur(16px) saturate(140%);\n    -webkit-backdrop-filter:blur(16px) saturate(140%);\n    box-shadow:0 14px 40px rgba(0,0,0,.35);max-width:94vw;flex-wrap:wrap;justify-content:center;}\n  .scenes{display:flex;gap:6px;align-items:center;}\n  .scene-btn{display:flex;flex-direction:column;align-items:center;gap:4px;\n    width:58px;padding:7px 4px;border-radius:12px;border:1px solid transparent;\n    background:transparent;color:var(--ink-dim);cursor:pointer;\n    transition:.25s;font-family:inherit;}\n  .scene-btn .ic{font-size:18px;line-height:1;}\n  .scene-btn .nm{font-size:10px;letter-spacing:.5px;white-space:nowrap;}\n  .scene-btn:hover{color:var(--ink);background:rgba(255,255,255,.06);}\n  .scene-btn.active{color:var(--ink);background:var(--accent-soft);\n    border-color:var(--accent);box-shadow:0 0 16px var(--accent-soft);}\n  .sep{width:1px;height:34px;background:var(--panel-line);margin:0 3px;}\n  .tool-btn{display:flex;align-items:center;gap:6px;padding:9px 12px;border-radius:12px;\n    border:1px solid transparent;background:transparent;color:var(--ink-dim);\n    cursor:pointer;font-size:12px;font-family:inherit;transition:.25s;white-space:nowrap;}\n  .tool-btn:hover{color:var(--ink);background:rgba(255,255,255,.06);}\n  .tool-btn.on{color:var(--ink);background:var(--accent-soft);border-color:var(--accent);}\n\n  /* 护眼小药丸 */\n  .eye-pill{position:fixed;z-index:6;right:22px;bottom:96px;\n    background:var(--panel);border:1px solid var(--panel-line);\n    backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);\n    border-radius:999px;padding:8px 15px;font-size:12px;color:var(--ink-dim);\n    display:none;align-items:center;gap:8px;letter-spacing:.5px;\n    box-shadow:0 8px 24px rgba(0,0,0,.3);}\n  .eye-pill.on{display:flex;}\n  .eye-pill b{color:var(--accent);font-variant-numeric:tabular-nums;font-weight:600;}\n\n  /* 呼吸叠层 */\n  .breath{position:fixed;inset:0;z-index:20;display:none;\n    align-items:center;justify-content:center;flex-direction:column;gap:26px;\n    background:rgba(3,6,12,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}\n  .breath.on{display:flex;}\n  .breath .ring{width:200px;height:200px;border-radius:50%;\n    border:2px solid var(--accent);position:relative;\n    display:flex;align-items:center;justify-content:center;\n    box-shadow:0 0 40px var(--accent-soft),inset 0 0 40px var(--accent-soft);\n    transition:transform 1s ease-in-out;}\n  .breath .ring .lbl{font-size:20px;letter-spacing:6px;font-weight:300;}\n  .breath .hint{font-size:13px;color:var(--ink-dim);letter-spacing:1px;}\n  .breath .cnt{font-size:13px;color:var(--accent);letter-spacing:2px;\n    font-variant-numeric:tabular-nums;}\n\n  /* 护眼弹层 */\n  .rest-overlay{position:fixed;inset:0;z-index:25;display:none;\n    align-items:center;justify-content:center;flex-direction:column;gap:18px;\n    background:rgba(3,6,12,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);\n    text-align:center;padding:24px;}\n  .rest-overlay.on{display:flex;}\n  .rest-overlay .big{font-size:30px;font-weight:300;letter-spacing:2px;}\n  .rest-overlay .small{font-size:14px;color:var(--ink-dim);max-width:420px;line-height:1.7;}\n  .rest-overlay .cdown{font-size:46px;font-weight:200;color:var(--accent);\n    font-variant-numeric:tabular-nums;}\n\n  /* 帮助 */\n  .help{position:fixed;inset:0;z-index:30;display:none;\n    align-items:center;justify-content:center;\n    background:rgba(3,6,12,.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}\n  .help.on{display:flex;}\n  .help .card{background:var(--panel);border:1px solid var(--panel-line);\n    border-radius:18px;padding:26px 30px;max-width:440px;width:88vw;\n    backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);}\n  .help h3{font-size:16px;font-weight:600;letter-spacing:1px;margin-bottom:16px;}\n  .help .row{display:flex;justify-content:space-between;gap:14px;\n    font-size:13px;padding:7px 0;border-bottom:1px dashed rgba(255,255,255,.08);}\n  .help .row:last-child{border-bottom:none;}\n  .help .k{color:var(--accent);font-variant-numeric:tabular-nums;\n    white-space:nowrap;font-family:ui-monospace,Menlo,Consolas,monospace;}\n  .help .v{color:var(--ink-dim);text-align:right;}\n  .help .close{margin-top:18px;width:100%;padding:10px;border-radius:12px;\n    border:1px solid var(--accent);background:var(--accent-soft);color:var(--ink);\n    cursor:pointer;font-family:inherit;font-size:13px;letter-spacing:1px;}\n\n  .toast{position:fixed;left:50%;bottom:118px;transform:translateX(-50%) translateY(14px);\n    z-index:40;background:var(--panel);border:1px solid var(--accent);\n    color:var(--ink);padding:9px 18px;border-radius:999px;font-size:13px;\n    letter-spacing:.5px;opacity:0;transition:.35s;pointer-events:none;\n    backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}\n  .toast.on{opacity:1;transform:translateX(-50%) translateY(0);}\n\n  @media (max-width:560px){\n    .scene-btn{width:46px;}\n    .scene-btn .nm{display:none;}\n    .tool-btn span.tx{display:none;}\n    .clock .t{font-size:20px;}\n  }\n</style>");
document.getElementById("app").innerHTML="\n  <canvas id=\"bg\"></canvas>\n  <div class=\"veil\"></div>\n\n  <div class=\"topbar\">\n    <div class=\"brand\">\n      <div class=\"logo\"><span class=\"dot\"></span>换境 · MOODSHIFT</div>\n      <div class=\"scene-name\" id=\"sceneName\">星河入梦</div>\n    </div>\n    <div class=\"clock\">\n      <div class=\"t\" id=\"clk\">--:--</div>\n      <div class=\"d\" id=\"dat\">欢迎来到换境</div>\n    </div>\n  </div>\n\n  <div class=\"quote\" id=\"quote\">\n    <div class=\"mood-tag\" id=\"moodTag\">MOOD · CALM</div>\n    <div class=\"text\" id=\"quoteText\">bug 也在休息，你也该休息了。</div>\n    <div class=\"sub\" id=\"quoteSub\">按 1–8 切换背景，按 B 开始一次呼吸</div>\n  </div>\n\n  <div class=\"eye-pill\" id=\"eyePill\">\n    <span>护眼 · 下次提醒</span><b id=\"eyeTime\">20:00</b>\n  </div>\n\n  <div class=\"dock\">\n    <div class=\"scenes\" id=\"scenes\"></div>\n    <div class=\"sep\"></div>\n    <button class=\"tool-btn\" id=\"btnBreath\" title=\"呼吸练习 (B)\">🫁<span class=\"tx\">呼吸</span></button>\n    <button class=\"tool-btn\" id=\"btnEye\" title=\"护眼提醒 (E)\">👁<span class=\"tx\">护眼</span></button>\n    <button class=\"tool-btn\" id=\"btnSound\" title=\"环境音 (S)\">🔇<span class=\"tx\">声音</span></button>\n    <button class=\"tool-btn\" id=\"btnFull\" title=\"全屏 (F)\">⛶<span class=\"tx\">全屏</span></button>\n    <button class=\"tool-btn\" id=\"btnHelp\" title=\"快捷键 (?)\">？<span class=\"tx\">帮助</span></button>\n  </div>\n\n  <div class=\"breath\" id=\"breath\">\n    <div class=\"ring\" id=\"breathRing\"><span class=\"lbl\" id=\"breathLbl\">准备</span></div>\n    <div class=\"cnt\" id=\"breathCnt\"></div>\n    <div class=\"hint\">4-7-8 呼吸法 · 按 B 或点击任意处结束</div>\n  </div>\n\n  <div class=\"rest-overlay\" id=\"restOverlay\">\n    <div class=\"big\">👀 该让眼睛歇一歇了</div>\n    <div class=\"small\">把视线移到 6 米（约 20 英尺）外的远处，放松眨眼，保持 20 秒。你的代码不会在这半分钟里坏掉。</div>\n    <div class=\"cdown\" id=\"restCnt\">20</div>\n    <div class=\"small\" style=\"opacity:.7\">20-20-20 法则 · 每 20 分钟看远 20 秒</div>\n  </div>\n\n  <div class=\"help\" id=\"help\">\n    <div class=\"card\">\n      <h3>快捷键 · 随心切换心情</h3>\n      <div class=\"row\"><span class=\"k\">1 – 8</span><span class=\"v\">切换八种背景场景</span></div>\n      <div class=\"row\"><span class=\"k\">B</span><span class=\"v\">开始 / 结束 4-7-8 呼吸</span></div>\n      <div class=\"row\"><span class=\"k\">E</span><span class=\"v\">开启 / 关闭 护眼 20-20-20 提醒</span></div>\n      <div class=\"row\"><span class=\"k\">S</span><span class=\"v\">循环切换环境音（关/雨/海/微风/冥想）</span></div>\n      <div class=\"row\"><span class=\"k\">F</span><span class=\"v\">进入 / 退出全屏</span></div>\n      <div class=\"row\"><span class=\"k\">空格</span><span class=\"v\">换一句当下的放松语</span></div>\n      <div class=\"row\"><span class=\"k\">?</span><span class=\"v\">打开 / 关闭本帮助</span></div>\n      <button class=\"close\" id=\"helpClose\">收下，开始放松</button>\n    </div>\n  </div>\n\n  <div class=\"toast\" id=\"toast\"></div>\n\n";

(function(){
  "use strict";
  var canvas=document.getElementById('bg');
  var ctx=canvas.getContext('2d');
  var W=0,H=0,DPR=Math.min(window.devicePixelRatio||1,2);
  function resize(){
    W=window.innerWidth;H=window.innerHeight;
    canvas.width=Math.floor(W*DPR);canvas.height=Math.floor(H*DPR);
    canvas.style.width=W+'px';canvas.style.height=H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  window.addEventListener('resize',resize);resize();

  var rand=function(a,b){return a+Math.random()*(b-a);};
  var pick=function(arr){return arr[Math.floor(Math.random()*arr.length)];};
  var lerp=function(a,b,t){return a+(b-a)*t;};

  /* ---------- 场景定义 ---------- */
  var SCENES=[
    {id:'galaxy', name:'星河入梦', icon:'🌌', accent:'#8fb6ff',
     tag:'MOOD · CALM', css:'#070b1c',
     quotes:['bug 也在休息，你也该休息了。','抬头看看星星，问题会变小。','此刻你只需要呼吸，不需要 answer。'],
     sub:'把思绪交给夜空，让眼睛离开屏幕三分钟。'},
    {id:'ocean', name:'深海呼吸', icon:'🌊', accent:'#5fd0e0',
     tag:'MOOD · DEEP', css:'#04243a',
     quotes:['像海水一样，进来，出去。','下沉一点点，压力就轻一点点。','你的待办清单，暂时沉到海底了。'],
     sub:'跟着气泡的节奏，做一次长长的吐气。'},
    {id:'aurora', name:'极光秘境', icon:'🌠', accent:'#7dffc4',
     tag:'MOOD · AWE', css:'#06231f',
     quotes:['光会流动，心情也会。','再难的 merge，也敌不过一片极光。','深呼吸，你是这片天地的观众。'],
     sub:'让目光追着极光游走，放松眉心与肩膀。'},
    {id:'sakura', name:'樱花纷飞', icon:'🌸', accent:'#ff9ec4',
     tag:'MOOD · SOFT', css:'#2a1830',
     quotes:['花瓣落下的速度，就是现在该有的速度。','软一点，没关系。','今天不追求性能，只追求好看。'],
     sub:'看花瓣飘落，允许自己慢下来一会儿。'},
    {id:'rain', name:'雨夜白噪', icon:'🌧', accent:'#9fb6c9',
     tag:'MOOD · FOCUS', css:'#0a1018',
     quotes:['雨声里，世界只剩下你和此刻。','听雨的人，bug 也会绕道走。','把噪音关在门外，把安静留给自己。'],
     sub:'让雨声盖住杂念，给大脑一段留白。'},
    {id:'forest', name:'林雾萤火', icon:'🌿', accent:'#a9e88a',
     tag:'MOOD · FRESH', css:'#0e2417',
     quotes:['森林不着急长大，你也不用。','一呼一吸之间，已是假期。','萤火虫替你点亮了那行注释。'],
     sub:'看雾气流动、萤火明灭，回到自然的节律。'},
    {id:'campfire', name:'篝火小憩', icon:'🔥', accent:'#ffb15c',
     tag:'MOOD · WARM', css:'#1c0f08',
     quotes:['火光跳动，焦虑退散。','围着火，什么都不用修。','烤一会儿，再回来当英雄。'],
     sub:'盯着跳动的火苗，让肩颈彻底松下来。'},
    {id:'code', name:'码雨禅意', icon:'💻', accent:'#7dff9b',
     tag:'MOOD · ZEN', css:'#04080a',
     quotes:['让代码像雨一样落下，不编译，只观赏。','你已经写得够多了，看一会儿就好。','0 和 1 之间，也有一片空旷。'],
     sub:'把熟悉的字符当成雨，看它们静静流过去。'}
  ];

  var current=null;
  var parts=[]; // 当前场景粒子
  var sceneState={};

  /* 各场景初始化与绘制 */
  function initScene(s){
    parts=[];
    sceneState={};
    if(s.id==='galaxy'){
      for(var i=0;i<180;i++) parts.push({x:rand(0,W),y:rand(0,H),r:rand(.4,1.8),tw:rand(0,Math.PI*2),sp:rand(.6,1.6)});
      sceneState.shoot=null;sceneState.nextShoot=rand(2,6);sceneState.t=0;
    }else if(s.id==='ocean'){
      for(var i=0;i<60;i++) parts.push({x:rand(0,W),y:rand(0,H),r:rand(2,7),sp:rand(.3,1.1),wob:rand(0,Math.PI*2)});
    }else if(s.id==='aurora'){
      sceneState.t=0;
      sceneState.bands=[{c1:'rgba(80,255,180,.0)',c2:'rgba(80,255,180,.5)',y:.32,amp:46,sp:.18,ph:0},
                        {c1:'rgba(120,180,255,.0)',c2:'rgba(120,180,255,.45)',y:.46,amp:60,sp:.12,ph:2},
                        {c1:'rgba(200,120,255,.0)',c2:'rgba(200,120,255,.4)',y:.58,amp:40,sp:.22,ph:4}];
      for(var i=0;i<120;i++) parts.push({x:rand(0,W),y:rand(0,H),r:rand(.3,1.2),tw:rand(0,6.28)});
    }else if(s.id==='sakura'){
      for(var i=0;i<70;i++) parts.push(newPetal());
    }else if(s.id==='rain'){
      for(var i=0;i<260;i++) parts.push({x:rand(0,W),y:rand(0,H),len:rand(10,26),sp:rand(9,16),w:rand(.6,1.4)});
      sceneState.nextLight=rand(4,11);sceneState.flash=0;
    }else if(s.id==='forest'){
      sceneState.fog=[];
      for(var i=0;i<5;i++) sceneState.fog.push({x:rand(0,W),y:rand(H*.2,H*.9),r:rand(180,360),sp:rand(4,12),a:rand(.04,.1)});
      for(var i=0;i<46;i++) parts.push({x:rand(0,W),y:rand(0,H),r:rand(1,2.4),ph:rand(0,6.28),sp:rand(.4,1.2),tw:rand(0,6.28)});
    }else if(s.id==='campfire'){
      sceneState.glow=0;
      for(var i=0;i<90;i++) parts.push(newFire());
    }else if(s.id==='code'){
      sceneState.fontSize=16;sceneState.cols=Math.floor(W/sceneState.fontSize);
      sceneState.drops=[];
      for(var i=0;i<sceneState.cols;i++) sceneState.drops.push(rand(-20,0));
      sceneState.chars='01{}[]()<>/;=+-*&|!?#$%abcxyzABCXYZλπ∑'.split('');
    }
  }
  function newPetal(){return {x:rand(0,W),y:rand(-40,H),r:rand(5,11),sp:rand(.7,1.7),wob:rand(0,6.28),ws:rand(.01,.03),rot:rand(0,6.28),rs:rand(.01,.04)};}
  function newFire(){var a=rand(-.5,.5);return {x:W/2+rand(-26,26),y:H-40,vy:rand(-2.4,-1.1),vx:a*rand(.6,1.6),life:1,decay:rand(.006,.016),size:rand(7,16),hue:rand(18,42)};}

  function drawBg(s,t){
    // 基础渐变
    var g=ctx.createLinearGradient(0,0,0,H);
    if(s.id==='galaxy'){g.addColorStop(0,'#070b1c');g.addColorStop(1,'#0c1230');}
    else if(s.id==='ocean'){g.addColorStop(0,'#04243a');g.addColorStop(1,'#021019');}
    else if(s.id==='aurora'){g.addColorStop(0,'#04140f');g.addColorStop(1,'#06231f');}
    else if(s.id==='sakura'){g.addColorStop(0,'#2a1830');g.addColorStop(.5,'#3a2036');g.addColorStop(1,'#231326');}
    else if(s.id==='rain'){g.addColorStop(0,'#0a1018');g.addColorStop(1,'#05080d');}
    else if(s.id==='forest'){g.addColorStop(0,'#0e2417');g.addColorStop(1,'#06120c');}
    else if(s.id==='campfire'){g.addColorStop(0,'#1c0f08');g.addColorStop(1,'#0a0603');}
    else {g.addColorStop(0,'#04080a');g.addColorStop(1,'#020405');}
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

    if(s.id==='galaxy') drawGalaxy(t);
    else if(s.id==='ocean') drawOcean(t);
    else if(s.id==='aurora') drawAurora(t);
    else if(s.id==='sakura') drawSakura(t);
    else if(s.id==='rain') drawRain(t);
    else if(s.id==='forest') drawForest(t);
    else if(s.id==='campfire') drawCampfire(t);
    else drawCode(t);
  }
  function drawGalaxy(t){
    for(var i=0;i<parts.length;i++){var p=parts[i];
      var a=.5+.5*Math.sin(t*0.001*p.sp+p.tw);
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.28);
      ctx.fillStyle='rgba(255,255,255,'+(a*.9)+')';ctx.fill();
    }
    sceneState.t+=0.016;sceneState.nextShoot-=0.016;
    if(sceneState.nextShoot<=0 && !sceneState.shoot){
      sceneState.shoot={x:rand(0,W*.5),y:rand(0,H*.3),len:rand(120,260),a:rand(.3,.7),life:1};
      sceneState.nextShoot=rand(3,8);
    }
    if(sceneState.shoot){var sh=sceneState.shoot;sh.x+=6;sh.y+=3.2;sh.life-=.012;
      var grad=ctx.createLinearGradient(sh.x,sh.y,sh.x-sh.len,sh.y-sh.len*.53);
      grad.addColorStop(0,'rgba(255,255,255,'+sh.life+')');grad.addColorStop(1,'rgba(255,255,255,0)');
      ctx.strokeStyle=grad;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sh.x,sh.y);ctx.lineTo(sh.x-sh.len,sh.y-sh.len*.53);ctx.stroke();
      if(sh.life<=0||sh.x>W) sceneState.shoot=null;
    }
  }
  function drawOcean(t){
    for(var i=0;i<parts.length;i++){var p=parts[i];p.y-=p.sp;p.wob+=0.02;
      if(p.y<-10){p.y=H+10;p.x=rand(0,W);}
      var x=p.x+Math.sin(p.wob)*8;
      ctx.beginPath();ctx.arc(x,p.y,p.r,0,6.28);
      ctx.fillStyle='rgba(180,235,245,'+(0.10+p.r*0.02)+')';ctx.fill();
      ctx.beginPath();ctx.arc(x-p.r*.3,p.y-p.r*.3,p.r*.4,0,6.28);
      ctx.fillStyle='rgba(255,255,255,.18)';ctx.fill();
    }
  }
  function drawAurora(t){
    sceneState.t+=0.006;
    ctx.globalCompositeOperation='lighter';
    for(var b=0;b<sceneState.bands.length;b++){var band=sceneState.bands[b];
      var yBase=H*band.y;
      for(var layer=0;layer<3;layer++){
        ctx.beginPath();
        for(var x=0;x<=W;x+=14){
          var y=yBase+Math.sin(x*0.004+sceneState.t*band.sp*10+band.ph+layer)*band.amp
                   +Math.sin(x*0.011+sceneState.t*band.sp*6)*band.amp*.4;
          if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        var hueShift=layer*22;
        var grad=ctx.createLinearGradient(0,yBase-band.amp,0,yBase+band.amp*2.2);
        grad.addColorStop(0,'rgba(0,0,0,0)');
        grad.addColorStop(.5,band.c2.replace('.5)',(0.5-layer*0.12)+')').replace('.45)',(0.45-layer*0.1)+')').replace('.4)',(0.4-layer*0.1)+')'));
        grad.addColorStop(1,'rgba(0,0,0,0)');
        ctx.strokeStyle=grad;ctx.lineWidth=22-layer*5;ctx.stroke();
      }
    }
    ctx.globalCompositeOperation='source-over';
    for(var i=0;i<parts.length;i++){var p=parts[i];var a=.4+.5*Math.sin(t*0.002+p.tw);
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.28);ctx.fillStyle='rgba(255,255,255,'+(a*.5)+')';ctx.fill();}
  }
  function drawSakura(t){
    for(var i=0;i<parts.length;i++){var p=parts[i];
      p.y+=p.sp;p.wob+=p.ws;p.rot+=p.rs;
      p.x+=Math.sin(p.wob)*1.1;
      if(p.y>H+20){parts[i]=newPetal();parts[i].y=-20;}
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
      ctx.fillStyle='rgba(255,170,200,.85)';
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.quadraticCurveTo(p.r*0.7,-p.r*0.7,0,-p.r*1.5);
      ctx.quadraticCurveTo(-p.r*0.7,-p.r*0.7,0,0);
      ctx.fill();
      ctx.restore();
    }
  }
  function drawRain(t){
    ctx.strokeStyle='rgba(170,200,225,.35)';ctx.lineWidth=1;
    for(var i=0;i<parts.length;i++){var p=parts[i];
      p.y+=p.sp;if(p.y>H){p.y=-20;p.x=rand(0,W);}
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.w*2,p.y-p.len);ctx.stroke();
    }
    sceneState.nextLight-=0.016;
    if(sceneState.nextLight<=0){sceneState.flash=1;sceneState.nextLight=rand(5,12);}
    if(sceneState.flash>0){ctx.fillStyle='rgba(200,220,255,'+(sceneState.flash*0.12)+')';ctx.fillRect(0,0,W,H);sceneState.flash-=0.06;}
  }
  function drawForest(t){
    for(var i=0;i<sceneState.fog.length;i++){var f=sceneState.fog[i];f.x+=f.sp*0.016*8;
      if(f.x-f.r>W)f.x=-f.r;
      var rg=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);
      rg.addColorStop(0,'rgba(180,220,180,'+f.a+')');rg.addColorStop(1,'rgba(180,220,180,0)');
      ctx.fillStyle=rg;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,6.28);ctx.fill();
    }
    for(var i=0;i<parts.length;i++){var p=parts[i];p.ph+=0.02;p.tw+=p.sp*0.03;
      var a=.3+.6*Math.abs(Math.sin(p.tw));
      var x=p.x+Math.sin(p.ph)*14,y=p.y+Math.cos(p.ph*0.7)*10;
      var rg=ctx.createRadialGradient(x,y,0,x,y,p.r*4);
      rg.addColorStop(0,'rgba(200,255,150,'+a+')');rg.addColorStop(1,'rgba(200,255,150,0)');
      ctx.fillStyle=rg;ctx.beginPath();ctx.arc(x,y,p.r*4,0,6.28);ctx.fill();
    }
  }
  function drawCampfire(t){
    sceneState.glow+=0.05;
    var flick=0.85+0.15*Math.sin(sceneState.glow*3)+0.05*Math.sin(sceneState.glow*7);
    var rg=ctx.createRadialGradient(W/2,H-40,0,W/2,H-40,Math.min(W,H)*0.5*flick);
    rg.addColorStop(0,'rgba(255,150,60,.5)');rg.addColorStop(.4,'rgba(255,110,40,.16)');rg.addColorStop(1,'rgba(255,90,30,0)');
    ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
    for(var i=parts.length-1;i>=0;i--){var p=parts[i];
      p.x+=p.vx;p.y+=p.vy;p.vy*=0.992;p.life-=p.decay;p.size*=0.985;
      if(p.life<=0){parts.splice(i,1);continue;}
      var rg2=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size);
      rg2.addColorStop(0,'hsla('+p.hue+',100%,65%,'+(p.life*0.9)+')');
      rg2.addColorStop(1,'hsla('+p.hue+',100%,50%,0)');
      ctx.fillStyle=rg2;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,6.28);ctx.fill();
    }
    while(parts.length<90) parts.push(newFire());
  }
  function drawCode(t){
    ctx.font=sceneState.fontSize+'px ui-monospace,Menlo,Consolas,monospace';
    for(var i=0;i<sceneState.cols;i++){
      var ch=pick(sceneState.chars);
      var x=i*sceneState.fontSize;var y=sceneState.drops[i]*sceneState.fontSize;
      ctx.fillStyle='rgba(125,255,155,.85)';ctx.fillText(ch,x,y);
      ctx.fillStyle='rgba(125,255,155,.25)';ctx.fillText(ch,x,y-sceneState.fontSize);
      sceneState.drops[i]+=0.18+Math.random()*0.12;
      if(y>H && Math.random()>0.975) sceneState.drops[i]=rand(-20,0);
    }
  }

  /* ---------- 场景切换 ---------- */
  function setScene(s){
    current=s;
    document.documentElement.style.setProperty('--accent',s.accent);
    document.documentElement.style.setProperty('--accent-soft',hexA(s.accent,0.18));
    document.getElementById('sceneName').textContent=s.name;
    document.getElementById('moodTag').textContent=s.tag;
    document.getElementById('quoteSub').textContent=s.sub;
    updateQuote(true);
    initScene(s);
    // 高亮按钮
    var btns=document.querySelectorAll('.scene-btn');
    for(var i=0;i<btns.length;i++) btns[i].classList.toggle('active',btns[i].dataset.id===s.id);
  }
  function hexA(hex,a){var h=hex.replace('#','');var r=parseInt(h.substr(0,2),16),g=parseInt(h.substr(2,2),16),b=parseInt(h.substr(4,2),16);return 'rgba('+r+','+g+','+b+','+a+')';}

  function updateQuote(force){
    if(!current)return;
    var tx=pick(current.quotes);
    if(!force && tx===document.getElementById('quoteText').textContent) tx=pick(current.quotes);
    document.getElementById('quoteText').style.opacity=0;
    setTimeout(function(){document.getElementById('quoteText').textContent=tx;
      document.getElementById('quoteText').style.opacity=1;},250);
  }

  /* ---------- 渲染循环 ---------- */
  var start=performance.now();
  function loop(now){
    var t=now-start;
    if(current) drawBg(current,t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ---------- 构建场景按钮 ---------- */
  var scenesEl=document.getElementById('scenes');
  SCENES.forEach(function(s,idx){
    var b=document.createElement('button');
    b.className='scene-btn';b.dataset.id=s.id;
    b.innerHTML='<span class="ic">'+s.icon+'</span><span class="nm">'+s.name+'</span>';
    b.title='切换：'+s.name+'（'+(idx+1)+'）';
    b.addEventListener('click',function(){setScene(s);toast('已切换到 · '+s.name);});
    scenesEl.appendChild(b);
  });

  /* ---------- 时钟 ---------- */
  function tick(){
    var d=new Date();
    var hh=('0'+d.getHours()).slice(-2),mm=('0'+d.getMinutes()).slice(-2);
    document.getElementById('clk').textContent=hh+':'+mm;
    var wd=['周日','周一','周二','周三','周四','周五','周六'][d.getDay()];
    document.getElementById('dat').textContent=(d.getMonth()+1)+'月'+d.getDate()+'日 '+wd;
  }
  tick();setInterval(tick,1000);

  /* ---------- 呼吸练习 4-7-8 ---------- */
  var breathOn=false,breathTimer=null,breathPhase=0;
  var phases=[{n:'吸气',d:4,s:1.0},{n:'屏息',d:7,s:1.0},{n:'呼气',d:8,s:0.55}];
  var ringEl=document.getElementById('breathRing');
  function breathStep(){
    var ph=phases[breathPhase];
    document.getElementById('breathLbl').textContent=ph.n;
    ringEl.style.transform='scale('+ph.s+')';
    var c=ph.d;
    document.getElementById('breathCnt').textContent=c+'s';
    breathTimer=setInterval(function(){
      c--;document.getElementById('breathCnt').textContent=c+'s';
      if(c<=0){clearInterval(breathTimer);
        breathPhase=(breathPhase+1)%phases.length;breathStep();}
    },1000);
  }
  function startBreath(){if(breathOn)return;breathOn=true;breathPhase=0;
    document.getElementById('breath').classList.add('on');
    document.getElementById('btnBreath').classList.add('on');breathStep();}
  function stopBreath(){if(!breathOn)return;breathOn=false;clearInterval(breathTimer);
    document.getElementById('breath').classList.remove('on');
    document.getElementById('btnBreath').classList.remove('on');
    ringEl.style.transform='scale(1)';}
  document.getElementById('btnBreath').addEventListener('click',function(){breathOn?stopBreath():startBreath();});
  document.getElementById('breath').addEventListener('click',stopBreath);

  /* ---------- 护眼 20-20-20 ---------- */
  var eyeOn=false,eyeLeft=20*60,eyeTick=null;
  function fmt(s){var m=Math.floor(s/60),ss=s%60;return ('0'+m).slice(-2)+':'+('0'+ss).slice(-2);}
  function startEye(){
    eyeOn=true;eyeLeft=20*60;
    document.getElementById('eyePill').classList.add('on');
    document.getElementById('btnEye').classList.add('on');
    document.getElementById('eyeTime').textContent=fmt(eyeLeft);
    clearInterval(eyeTick);
    eyeTick=setInterval(function(){
      eyeLeft--;document.getElementById('eyeTime').textContent=fmt(eyeLeft);
      if(eyeLeft<=0){showRest();eyeLeft=20*60;document.getElementById('eyeTime').textContent=fmt(eyeLeft);}
    },1000);
    toast('护眼提醒已开启 · 每 20 分钟一次');
  }
  function stopEye(){eyeOn=false;clearInterval(eyeTick);
    document.getElementById('eyePill').classList.remove('on');
    document.getElementById('btnEye').classList.remove('on');}
  document.getElementById('btnEye').addEventListener('click',function(){eyeOn?stopEye():startEye();});

  var restOn=false,restLeft=20,restTick=null;
  function showRest(){if(restOn)return;restOn=true;restLeft=20;
    document.getElementById('restCnt').textContent=restLeft;
    document.getElementById('restOverlay').classList.add('on');
    restTick=setInterval(function(){restLeft--;
      document.getElementById('restCnt').textContent=restLeft;
      if(restLeft<=0){clearInterval(restTick);restOn=false;
        document.getElementById('restOverlay').classList.remove('on');toast('很好，继续回来吧');}
    },1000);}
  document.getElementById('restOverlay').addEventListener('click',function(){
    if(restOn){clearInterval(restTick);restOn=false;
      document.getElementById('restOverlay').classList.remove('on');}});

  /* ---------- 环境音（Web Audio 程序化合成，优雅放松向，无素材） ---------- */
  var audioCtx=null, master=null;
  var pinkSrc=null, brownSrc=null, pinkGain=null, brownGain=null;
  var pinkFilter=null, brownFilter=null, breezeSwell=null, oceanSwell=null;
  var padGain=null, chimeGain=null, chimeTimer=null;
  var soundModes=['关','雨','海','微风','冥想']; var soundIdx=0;

  function makePink(ctx){var n=ctx.sampleRate*2,b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);
    var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for(var i=0;i<n;i++){var w=Math.random()*2-1;
      b0=0.99886*b0+w*0.0555179;b1=0.99332*b1+w*0.0750759;b2=0.96900*b2+w*0.1538520;
      b3=0.86650*b3+w*0.3104856;b4=0.55000*b4+w*0.5329522;b5=-0.7616*b5-w*0.0168980;
      d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;b6=w*0.115926;}return b;}
  function makeBrown(ctx){var n=ctx.sampleRate*2,b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);
    var last=0;for(var i=0;i<n;i++){var w=Math.random()*2-1;last=(last+0.02*w)/1.02;d[i]=last*3.5;}return b;}

  function ensureAudio(){
    if(audioCtx)return;
    var AC=window.AudioContext||window.webkitAudioContext; audioCtx=new AC();
    master=audioCtx.createGain(); master.gain.value=0.0; master.connect(audioCtx.destination);

    pinkSrc=audioCtx.createBufferSource(); pinkSrc.buffer=makePink(audioCtx); pinkSrc.loop=true;
    brownSrc=audioCtx.createBufferSource(); brownSrc.buffer=makeBrown(audioCtx); brownSrc.loop=true;
    pinkFilter=audioCtx.createBiquadFilter(); pinkFilter.type='lowpass'; pinkFilter.frequency.value=1400;
    brownFilter=audioCtx.createBiquadFilter(); brownFilter.type='lowpass'; brownFilter.frequency.value=520;
    pinkGain=audioCtx.createGain(); pinkGain.gain.value=0;
    brownGain=audioCtx.createGain(); brownGain.gain.value=0;
    breezeSwell=audioCtx.createGain(); breezeSwell.gain.value=1;
    oceanSwell=audioCtx.createGain(); oceanSwell.gain.value=1;
    pinkSrc.connect(pinkFilter); pinkFilter.connect(pinkGain); pinkGain.connect(breezeSwell); breezeSwell.connect(master);
    brownSrc.connect(brownFilter); brownFilter.connect(brownGain); brownGain.connect(oceanSwell); oceanSwell.connect(master);
    pinkSrc.start(); brownSrc.start();

    // 海浪缓慢起伏、微风轻颤：调制的是 swell 节点，关掉时 gain=0 不会有泄漏
    var oLFO=audioCtx.createOscillator(); oLFO.frequency.value=0.09;
    var og=audioCtx.createGain(); og.gain.value=0.28; oLFO.connect(og); og.connect(oceanSwell.gain); oLFO.start();
    var bLFO=audioCtx.createOscillator(); bLFO.frequency.value=0.17;
    var bg=audioCtx.createGain(); bg.gain.value=0.18; bLFO.connect(bg); bg.connect(breezeSwell.gain); bLFO.start();

    // 冥想 Pad：柔和持续和弦（A 大调 add9 色彩）
    padGain=audioCtx.createGain(); padGain.gain.value=0; padGain.connect(master);
    var chord=[220.00,277.18,329.63,440.00,554.37]; var padOscs=[];
    chord.forEach(function(f){var o=audioCtx.createOscillator();o.type='sine';o.frequency.value=f;
      var g=audioCtx.createGain();g.gain.value=0.05;o.connect(g);g.connect(padGain);o.start();padOscs.push(o);});
    var pLFO=audioCtx.createOscillator(); pLFO.frequency.value=0.07;
    var pg=audioCtx.createGain(); pg.gain.value=2.2; pLFO.connect(pg);
    padOscs.forEach(function(o){pg.connect(o.detune);}); pLFO.start();

    chimeGain=audioCtx.createGain(); chimeGain.gain.value=1; chimeGain.connect(master);
  }

  var PENTA=[523.25,587.33,659.25,783.99,880.00,987.77];
  function playChime(){
    if(!audioCtx)return;
    var t=audioCtx.currentTime, f=PENTA[Math.floor(Math.random()*PENTA.length)];
    var o=audioCtx.createOscillator(); o.type='sine'; o.frequency.value=f;
    var o2=audioCtx.createOscillator(); o2.type='sine'; o2.frequency.value=f*2.01;
    var g=audioCtx.createGain();
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.15,t+0.04);
    g.gain.exponentialRampToValueAtTime(0.0001,t+3.6);
    var g2=audioCtx.createGain(); g2.gain.value=0.4; o2.connect(g2); g2.connect(g);
    o.connect(g); g.connect(chimeGain);
    o.start(t); o2.start(t); o.stop(t+3.8); o2.stop(t+3.8);
    chimeTimer=setTimeout(playChime,4000+Math.random()*5000);
  }

  function applySound(){
    var btn=document.getElementById('btnSound');
    if(soundIdx===0){
      if(master)master.gain.setTargetAtTime(0,audioCtx.currentTime,0.4);
      if(chimeTimer){clearTimeout(chimeTimer);chimeTimer=null;}
      btn.classList.remove('on'); btn.innerHTML='🔇<span class="tx">声音</span>'; return;
    }
    ensureAudio();
    if(audioCtx.state==='suspended')audioCtx.resume();
    var now=audioCtx.currentTime;
    pinkGain.gain.setTargetAtTime(0,now,0.4);
    brownGain.gain.setTargetAtTime(0,now,0.4);
    padGain.gain.setTargetAtTime(0,now,0.4);
    if(chimeTimer){clearTimeout(chimeTimer);chimeTimer=null;}
    master.gain.setTargetAtTime(0.55,now,0.4);

    if(soundIdx===1){ // 雨：粉噪，柔和高频
      pinkFilter.frequency.setTargetAtTime(1500,now,0.4);
      pinkGain.gain.setTargetAtTime(0.85,now,0.5);
    }else if(soundIdx===2){ // 海：棕噪 + 缓慢起伏
      brownFilter.frequency.setTargetAtTime(520,now,0.4);
      brownGain.gain.setTargetAtTime(0.42,now,0.5);
    }else if(soundIdx===3){ // 微风：粉噪低通 + 轻颤
      pinkFilter.frequency.setTargetAtTime(700,now,0.4);
      pinkGain.gain.setTargetAtTime(0.5,now,0.5);
    }else if(soundIdx===4){ // 冥想：柔和和弦 + 偶发风铃
      padGain.gain.setTargetAtTime(0.5,now,0.9);
      chimeTimer=setTimeout(playChime,1500);
    }
    btn.classList.add('on');
    var ic=['','🌧','🌊','🍃','🕊'][soundIdx];
    btn.innerHTML=ic+'<span class="tx">'+soundModes[soundIdx]+'</span>';
  }
  document.getElementById('btnSound').addEventListener('click',function(){
    soundIdx=(soundIdx+1)%soundModes.length; applySound();
    if(soundIdx>0) toast('环境音 · '+soundModes[soundIdx]);
  });

  /* ---------- 全屏 ---------- */
  document.getElementById('btnFull').addEventListener('click',toggleFull);
  function toggleFull(){
    if(!document.fullscreenElement){document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();}
    else{document.exitFullscreen&&document.exitFullscreen();}
  }

  /* ---------- 帮助 ---------- */
  var helpEl=document.getElementById('help');
  function toggleHelp(){helpEl.classList.toggle('on');}
  document.getElementById('help').addEventListener('click',function(e){if(e.target===helpEl)toggleHelp();});
  document.getElementById('helpClose').addEventListener('click',toggleHelp);
  document.getElementById('btnHelp').addEventListener('click',toggleHelp);

  /* ---------- Toast ---------- */
  var toastTimer=null;
  function toast(msg){var el=document.getElementById('toast');el.textContent=msg;el.classList.add('on');
    clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove('on');},1800);}

  /* ---------- 键盘 ---------- */
  document.addEventListener('keydown',function(e){
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
    var k=e.key.toLowerCase();
    if(k>='1'&&k<='8'){var s=SCENES[parseInt(k,10)-1];if(s){setScene(s);toast('已切换到 · '+s.name);}return;}
    if(k==='b'){breathOn?stopBreath():startBreath();}
    else if(k==='e'){eyeOn?stopEye():startEye();}
    else if(k==='s'){soundIdx=(soundIdx+1)%soundModes.length;applySound();if(soundIdx>0)toast('环境音 · '+soundModes[soundIdx]);}
    else if(k==='f'){toggleFull();}
    else if(k===' '){e.preventDefault();updateQuote(false);toast('换一句放松语');}
    else if(k==='?'||k==='/'){toggleHelp();}
  });

  /* ---------- 启动 ---------- */
  setScene(SCENES[0]);
  // 首屏轻提示
  setTimeout(function(){toast('欢迎来到换境 · 按 ? 查看快捷键');},600);

  // 暴露给控制台（可选）
  window.MoodShift={setScene:setScene,SCENES:SCENES};
})();
