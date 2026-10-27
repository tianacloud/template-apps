const style = document.createElement("style"); style.textContent = "\n  :root{\n    --bg1:#fff6ec; --bg2:#ffe6cf; --card:#ffffff; --ink:#5b3a23;\n    --gold:#d99a2b; --red:#c0392b; --muted:#a98c74;\n  }\n  *{box-sizing:border-box; -webkit-tap-highlight-color:transparent;}\n  html,body{margin:0;padding:0;}\n  body{\n    min-height:100vh;\n    font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n    background:radial-gradient(circle at 50% 0%,var(--bg1),var(--bg2));\n    color:var(--ink);\n    display:flex; flex-direction:column; align-items:center;\n    padding:24px 16px 40px; user-select:none;\n  }\n  .wrap{width:min(440px,94vw); display:flex; flex-direction:column; align-items:center; gap:16px;}\n  h1{font-size:24px; font-weight:700; margin:6px 0 0; letter-spacing:2px;}\n  .sub{font-size:13px; color:var(--muted); margin:0; text-align:center;}\n  .stats{display:flex; gap:14px; width:100%; justify-content:center;}\n  .stat{flex:1; background:var(--card); border-radius:16px; padding:12px 8px; text-align:center;\n    box-shadow:0 6px 18px rgba(180,120,60,.12);}\n  .stat .num{font-size:26px; font-weight:700; color:var(--red); line-height:1.1;}\n  .stat .lab{font-size:12px; color:var(--muted); margin-top:4px;}\n  .stage{position:relative; width:240px; height:240px; display:flex; align-items:center; justify-content:center; margin:6px 0;}\n  .muyu{\n    width:200px; height:200px; border-radius:50%;\n    background:radial-gradient(circle at 35% 30%, #d98c4a, #a85e2a);\n    display:flex; align-items:center; justify-content:center; font-size:84px;\n    box-shadow:0 14px 30px rgba(150,90,40,.35), inset 0 6px 14px rgba(255,255,255,.35);\n    cursor:pointer; transition:transform .08s ease; position:relative; outline:none;\n  }\n  .muyu:active{transform:scale(.92);}\n  .muyu .ring{position:absolute; inset:-14px; border-radius:50%; border:2px dashed rgba(217,154,43,.5);}\n  .float{position:absolute; left:50%; top:46%; font-size:22px; font-weight:700; color:var(--gold); pointer-events:none;\n    transform:translateX(-50%); animation:rise 1s ease-out forwards;}\n  @keyframes rise{0%{opacity:0; transform:translate(-50%,10px) scale(.8);}20%{opacity:1;}100%{opacity:0; transform:translate(-50%,-90px) scale(1.1);}}\n  .toast{position:fixed; left:50%; top:30%; transform:translateX(-50%); background:rgba(91,58,35,.92);\n    color:#fff; padding:10px 18px; border-radius:30px; font-size:15px; opacity:0; transition:opacity .3s; z-index:30; pointer-events:none; max-width:80vw; text-align:center;}\n  .toast.show{opacity:1;}\n  .yiji{background:var(--card); border-radius:16px; padding:14px 16px; width:100%;\n    box-shadow:0 6px 18px rgba(180,120,60,.12); display:flex; gap:14px; justify-content:center; flex-wrap:wrap;}\n  .yiji .col{flex:1; min-width:120px; text-align:center;}\n  .yiji .tag{font-size:12px; color:var(--muted);}\n  .yiji .txt{font-size:15px; font-weight:600; margin-top:4px;}\n  .skinlabel{font-size:12px; color:var(--muted); margin-top:-6px;}\n  .skinlabel b{color:var(--gold);}\n  .skins{display:flex; gap:10px; flex-wrap:wrap; justify-content:center; max-width:340px;}\n  .skin{width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center;\n    font-size:21px; cursor:pointer; background:#fff; box-shadow:0 3px 10px rgba(180,120,60,.18); border:2px solid transparent; transition:transform .15s, border-color .2s;}\n  .skin:hover{transform:translateY(-2px);}\n  .skin.active{border-color:var(--gold);}\n  .skin[data-random]{border-style:dashed; border-color:rgba(91,58,35,.25);}\n  .row{display:flex; gap:12px; width:100%;}\n  .btn{flex:1; border:none; border-radius:14px; padding:14px; font-size:15px; font-weight:600; cursor:pointer;\n    background:linear-gradient(135deg,#e8a33d,#d4842b); color:#fff; box-shadow:0 8px 18px rgba(200,130,40,.3);}\n  .btn.ghost{background:#fff; color:var(--ink); box-shadow:0 4px 12px rgba(180,120,60,.14);}\n  .toggle{display:flex; align-items:center; gap:6px; font-size:13px; color:var(--muted); cursor:pointer;}\n  .foot{font-size:12px; color:var(--muted); text-align:center; margin-top:6px; line-height:1.6;}\n  .foot b{color:var(--gold);}\n  .modal{position:fixed; inset:0; background:rgba(40,20,10,.55); display:none; align-items:center; justify-content:center; z-index:40; padding:20px;}\n  .modal.show{display:flex;}\n  .modal .box{background:#fff; border-radius:18px; padding:16px; width:min(360px,92vw); text-align:center;}\n  .modal img{width:100%; border-radius:12px;}\n  .modal .acts{display:flex; gap:10px; margin-top:12px;}\n  .modal .acts .btn{flex:1; padding:12px; font-size:14px;}\n  .close{position:absolute; top:14px; right:18px; font-size:22px; color:#fff; cursor:pointer;}\n"; document.head.appendChild(style);
document.getElementById("app").innerHTML = "\n  <div class=\"wrap\">\n    <h1>🍀 好运木鱼</h1>\n    <p class=\"sub\">敲一敲，好运 +1。心烦了、想转运了，就来敲两下。</p>\n\n    <div class=\"stats\">\n      <div class=\"stat\"><div class=\"num\" id=\"total\">0</div><div class=\"lab\">累计好运</div></div>\n      <div class=\"stat\"><div class=\"num\" id=\"today\">0</div><div class=\"lab\">今日敲击</div></div>\n    </div>\n\n    <div class=\"stage\">\n      <div class=\"muyu\" id=\"muyu\" tabindex=\"0\"><span class=\"ring\"></span><span id=\"face\">🪵</span></div>\n    </div>\n\n    <div class=\"yiji\">\n      <div class=\"col\"><div class=\"tag\">今日宜</div><div class=\"txt\" id=\"yi\">敲木鱼</div></div>\n      <div class=\"col\"><div class=\"tag\">今日忌</div><div class=\"txt\" id=\"ji\">内耗</div></div>\n    </div>\n\n    <div class=\"skinlabel\">祈福神兽 · 当前：<b id=\"skinName\">木鱼</b></div>\n    <div class=\"skins\" id=\"skins\"></div>\n\n    <div class=\"row\">\n      <button class=\"btn\" id=\"shareBtn\">生成好运卡片</button>\n      <button class=\"btn ghost\" id=\"soundBtn\">🔊 音效开</button>\n    </div>\n\n    <p class=\"foot\">敲得越多，好运越满。<br>生成卡片，发朋友圈 / 小红书，把好运传出去 👇</p>\n  </div>\n\n  <div class=\"toast\" id=\"toast\"></div>\n\n  <div class=\"modal\" id=\"modal\">\n    <span class=\"close\" id=\"closeModal\">✕</span>\n    <div class=\"box\">\n      <img id=\"cardImg\" alt=\"好运卡片\">\n      <div class=\"acts\">\n        <button class=\"btn\" id=\"dlBtn\">保存图片</button>\n        <button class=\"btn ghost\" id=\"againBtn\">再敲敲</button>\n      </div>\n    </div>\n  </div>\n\n";

(function(){
  // 9 款祈福神兽：face 表情、bg 主盘渐变、accent/light 卡片配色、name 名称
  var SKINS = [
    {face:'🪵', name:'木鱼', bg:'radial-gradient(circle at 35% 30%, #d98c4a, #a85e2a)', accent:'#d99a2b', light:'#ffe1a3'},
    {face:'🐱', name:'猫猫', bg:'radial-gradient(circle at 35% 30%, #ffc1d6, #f48fb1)', accent:'#ff7eb6', light:'#ffd1e8'},
    {face:'🐟', name:'锦鲤', bg:'radial-gradient(circle at 35% 30%, #ffb877, #f0883e)', accent:'#ff8a3d', light:'#ffd0a8'},
    {face:'🐉', name:'祥龙', bg:'radial-gradient(circle at 35% 30%, #ff6b6b, #c0392b)', accent:'#ff4d4d', light:'#ffb3b3'},
    {face:'🦊', name:'狐仙', bg:'radial-gradient(circle at 35% 30%, #c9a3ff, #8e5bd6)', accent:'#b07cff', light:'#e0ccff'},
    {face:'🪷', name:'莲花', bg:'radial-gradient(circle at 35% 30%, #5fe0cf, #1d9e75)', accent:'#2ec5b6', light:'#a8efe6'},
    {face:'🍀', name:'四叶草', bg:'radial-gradient(circle at 35% 30%, #8fe89a, #3fae54)', accent:'#4cd964', light:'#bdf5c6'},
    {face:'🌟', name:'星辰', bg:'radial-gradient(circle at 35% 30%, #8fb4ff, #3f6fe0)', accent:'#5b8cff', light:'#bcd2ff'},
    {face:'🐰', name:'玉兔', bg:'radial-gradient(circle at 35% 30%, #e3c4ff, #b07ce0)', accent:'#c9a0ff', light:'#e8d6ff'}
  ];
  var BLESS = [
    '平安喜乐，万事胜意','财源滚滚，好事发生','所愿皆所成，所行化坦途',
    '好运正在路上，请保持期待','今天也要被温柔以待','烦恼清零，快乐加倍',
    '愿你被世界温柔相拥','霉运退散，好运爆棚','心想事成，平安顺遂',
    '越努力，越幸运','万物皆有裂痕，那是光照进来的地方'
  ];
  var YI = ['敲木鱼','摸鱼','发呆','晒太阳','早点睡','对自己好一点','勇敢表达','放下执念','晒月光','喝杯热茶'];
  var JI = ['内耗','熬夜','emo','钻牛角尖','过度自省','假装坚强','拖延','比较','焦虑','硬扛'];

  // hex(#rrggbb) + alpha -> rgba()
  function hexA(hex,a){
    var h=hex.replace('#','');
    var r=parseInt(h.substr(0,2),16), g=parseInt(h.substr(2,2),16), b=parseInt(h.substr(4,2),16);
    return 'rgba('+r+','+g+','+b+','+a+')';
  }
  // 累计好运 -> 称号段位
  function rankOf(n){
    if(n>=1000) return {t:'鸿运当头', s:'天命之子'};
    if(n>=200)  return {t:'福星高照', s:'福运亨通'};
    if(n>=50)   return {t:'好运连连', s:'福气渐浓'};
    if(n>=10)   return {t:'渐入佳境', s:'小有福气'};
    return {t:'初心萌动', s:'好运萌芽'};
  }

  var KEY_T='lucky_muyu_total', KEY_D='lucky_muyu_date', KEY_N='lucky_muyu_today', KEY_S='lucky_muyu_skin';
  var todayStr = new Date().toISOString().slice(0,10);

  // 安全存储封装：隐私模式 / 沙箱禁用 localStorage 时不致整页白屏
  var store = {
    get:function(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
    set:function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
  };

  var total = parseInt(store.get(KEY_T)||'0',10) || 0;
  var savedDate = store.get(KEY_D);
  var today = (savedDate===todayStr)? (parseInt(store.get(KEY_N)||'0',10)||0) : 0;
  var skin = parseInt(store.get(KEY_S)||'0',10) || 0;
  if(skin<0||skin>=SKINS.length) skin=0;

  var $ = function(id){return document.getElementById(id);};
  var muyu=$('muyu'), face=$('face'), totalEl=$('total'), todayEl=$('today'), toast=$('toast'), ring=muyu.querySelector('.ring');

  function save(){
    store.set(KEY_T,total);
    store.set(KEY_D,todayStr);
    store.set(KEY_N,today);
    store.set(KEY_S,skin);
  }
  function render(){
    totalEl.textContent=total; todayEl.textContent=today;
    var s=SKINS[skin];
    face.textContent=s.face;
    muyu.style.background=s.bg;
    muyu.style.boxShadow='0 14px 30px '+hexA(s.accent,.35)+', inset 0 6px 14px rgba(255,255,255,.35)';
    ring.style.borderColor=hexA(s.accent,.6);
    $('skinName').textContent=s.name;
    var dots=document.querySelectorAll('.skin');
    dots.forEach(function(d){ d.classList.toggle('active', parseInt(d.dataset.i,10)===skin); });
  }

  // 动态生成皮肤选择（加一款只需在 SKINS 加一行）
  (function buildSkins(){
    var box=$('skins');
    SKINS.forEach(function(s,i){
      var d=document.createElement('div');
      d.className='skin'+(i===skin?' active':'');
      d.dataset.i=i; d.textContent=s.face; d.title=s.name;
      box.appendChild(d);
    });
    var r=document.createElement('div');
    r.className='skin'; r.dataset.random='1'; r.textContent='🎲'; r.title='随机抽签';
    box.appendChild(r);
  })();

  // 今日宜忌：按日期确定性生成
  function hashStr(s){var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0;}return h;}
  var seed=hashStr(todayStr);
  $('yi').textContent=YI[seed%YI.length];
  $('ji').textContent=JI[(seed>>3)%JI.length];

  // 音效（Web Audio 合成木鱼声）
  var actx=null, soundOn=true;
  function playWood(){
    if(!soundOn) return;
    try{
      actx = actx || new (window.AudioContext||window.webkitAudioContext)();
      if(actx.state==='suspended') actx.resume();
      var t=actx.currentTime;
      var o=actx.createOscillator(), g=actx.createGain();
      o.type='triangle';
      o.frequency.setValueAtTime(540,t);
      o.frequency.exponentialRampToValueAtTime(170,t+0.12);
      g.gain.setValueAtTime(0.0001,t);
      g.gain.linearRampToValueAtTime(0.45,t+0.005);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.2);
      o.connect(g).connect(actx.destination);
      o.start(t); o.stop(t+0.22);
      var o2=actx.createOscillator(), g2=actx.createGain();
      o2.type='sine'; o2.frequency.setValueAtTime(1300,t);
      g2.gain.setValueAtTime(0.12,t); g2.gain.exponentialRampToValueAtTime(0.0001,t+0.04);
      o2.connect(g2).connect(actx.destination); o2.start(t); o2.stop(t+0.05);
    }catch(e){}
  }

  var toastTimer=null, lastBless='';
  function showToast(msg){
    toast.textContent=msg; toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){toast.classList.remove('show');},1400);
  }

  function knock(){
    playWood();
    total++; today++;
    var stage=document.querySelector('.stage');
    var f=document.createElement('span');
    f.className='float'; f.textContent='+1 好运';
    stage.appendChild(f);
    setTimeout(function(){f.remove();},1000);
    if(Math.random()<0.35){
      lastBless=BLESS[Math.floor(Math.random()*BLESS.length)];
      showToast(lastBless);
    }
    if(navigator.vibrate) navigator.vibrate(15);
    render(); save();
  }

  // 多重事件兜底：mousedown + touchstart(preventDefault) + click + 键盘(空格/回车)，250ms 去重防重复计数
  var lastTapTime=0;
  function tap(e){
    var now=Date.now();
    if(now-lastTapTime<250){ return; }
    lastTapTime=now;
    if(e && e.preventDefault) e.preventDefault();
    knock();
  }
  function keyTap(e){ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); tap(e); } }
  muyu.addEventListener('mousedown', tap);
  muyu.addEventListener('touchstart', tap, {passive:false});
  muyu.addEventListener('click', tap);
  muyu.addEventListener('keydown', keyTap);

  // 皮肤切换：手动点选某一款，或点 🎲 随机抽签（尽量避开当前款）
  document.getElementById('skins').addEventListener('click',function(e){
    var d=e.target.closest('.skin'); if(!d) return;
    if(d.dataset.random){
      var r; do{ r=Math.floor(Math.random()*SKINS.length); }while(r===skin && SKINS.length>1);
      skin=r;
    } else {
      skin=parseInt(d.dataset.i,10);
    }
    render(); save();
  });

  // 音效开关
  var soundBtn=$('soundBtn');
  soundBtn.addEventListener('click',function(){
    soundOn=!soundOn;
    soundBtn.textContent= soundOn? '🔊 音效开' : '🔇 音效关';
    if(soundOn) playWood();
  });

  // 绘制高级「祈福证书」分享卡
  function fit(x, txt, maxW, size, minS){
    var s=size; x.font='500 '+s+'px '+SERIF;
    while(x.measureText(txt).width>maxW && s>minS){ s-=2; x.font='500 '+s+'px '+SERIF; }
    return s;
  }
  var SERIF='"Songti SC","STSong","SimSun","Noto Serif CJK SC",serif';
  var SANS='"PingFang SC","Microsoft YaHei",sans-serif';

  function drawCard(){
    var c=document.createElement('canvas');
    c.width=800; c.height=1120;
    var x=c.getContext('2d');
    var s=SKINS[skin];
    var m=44; // 外框边距

    // 深色底（优雅墨底）
    var bg=x.createLinearGradient(0,0,0,1120);
    bg.addColorStop(0,'#2a1c3d'); bg.addColorStop(1,'#120a20');
    x.fillStyle=bg; x.fillRect(0,0,800,1120);
    // 顶部光晕（皮肤色个性化）
    var glow=x.createRadialGradient(400,260,40,400,260,420);
    glow.addColorStop(0,hexA(s.accent,.28)); glow.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=glow; x.fillRect(0,0,800,1120);

    // 外框 + 内描边（烫金线）
    x.strokeStyle=hexA(s.accent,.85); x.lineWidth=3;
    x.strokeRect(m,m,800-2*m,1120-2*m);
    x.strokeStyle=hexA(s.light,.45); x.lineWidth=1;
    x.strokeRect(m+12,m+12,800-2*(m+12),1120-2*(m+12));
    // 四角花饰
    x.strokeStyle=hexA(s.light,.9); x.lineWidth=3;
    [[m,m,1,1],[800-m,m,-1,1],[m,1120-m,1,-1],[800-m,1120-m,-1,-1]].forEach(function(c2){
      var cx=c2[0], cy=c2[1], dx=c2[2], dy=c2[3];
      x.beginPath(); x.moveTo(cx,cy+dy*38); x.lineTo(cx,cy); x.lineTo(cx+dx*38,cy); x.stroke();
    });

    x.textAlign='center';
    // 顶部 kicker
    x.fillStyle=hexA(s.light,.95); x.font='500 30px '+SERIF;
    x.fillText('· 祈 福 证 书 ·',400,128);
    x.fillStyle=hexA(s.light,.7); x.font='400 24px '+SANS;
    x.fillText('好 运 木 鱼 · 赛 博 祈 福',400,170);

    // 勋章
    x.beginPath(); x.arc(400,360,118,0,Math.PI*2);
    var med=x.createRadialGradient(400,320,20,400,360,118);
    med.addColorStop(0,hexA(s.accent,.35)); med.addColorStop(1,hexA(s.accent,.08));
    x.fillStyle=med; x.fill();
    x.strokeStyle=hexA(s.light,.9); x.lineWidth=3; x.stroke();
    x.fillStyle='#fff'; x.textBaseline='middle'; x.font='150px '+SANS;
    x.fillText(s.face,400,372);
    x.textBaseline='alphabetic';

    // 称号段位
    var rk=rankOf(total);
    x.fillStyle=hexA(s.light,1); x.font='700 58px '+SERIF;
    x.fillText(rk.t,400,560);
    x.fillStyle=hexA(s.light,.8); x.font='400 28px '+SERIF;
    x.fillText(rk.s,400,602);

    // 大数字（金色渐变）
    x.fillStyle=hexA(s.light,.85); x.font='400 26px '+SERIF;
    x.fillText('累 计 好 运 值',400,680);
    var ng=x.createLinearGradient(0,700,0,820);
    ng.addColorStop(0,'#ffffff'); ng.addColorStop(1,hexA(s.light,1));
    var numStr=String(total), numSize=128;
    x.font='700 '+numSize+'px '+SERIF;
    while(x.measureText(numStr).width>560 && numSize>44){ numSize-=6; x.font='700 '+numSize+'px '+SERIF; }
    x.fillStyle=ng; x.fillText(numStr,400,790);
    x.fillStyle=hexA(s.light,.7); x.font='400 24px '+SANS;
    x.fillText('今日已敲 '+today+' 下 · 祈福神兽：'+s.name,400,840);

    // 祝福语（自动缩字号防溢出）
    var b = lastBless || BLESS[seed%BLESS.length];
    x.fillStyle=hexA(s.light,.92);
    var bs=fit(x,b,600,36,22);
    x.fillText(b,400,920);

    // 分隔线
    x.strokeStyle=hexA(s.light,.5); x.lineWidth=1;
    x.beginPath(); x.moveTo(240,960); x.lineTo(560,960); x.stroke();

    // 印章（右下角「福」）
    x.beginPath(); x.arc(640,1010,58,0,Math.PI*2);
    x.fillStyle=hexA(s.accent,.22); x.fill();
    x.strokeStyle=hexA(s.light,.9); x.lineWidth=2.5; x.stroke();
    x.beginPath(); x.arc(640,1010,46,0,Math.PI*2); x.stroke();
    x.fillStyle='#fff'; x.textBaseline='middle'; x.font='700 56px '+SERIF;
    x.fillText('福',640,1014); x.textBaseline='alphabetic';

    // 底部
    x.fillStyle='rgba(255,255,255,.6)'; x.font='400 22px '+SANS;
    x.fillText('一起敲木鱼，把好运传出去',400,1078);

    return c.toDataURL('image/png');
  }

  var modal=$('modal'), cardImg=$('cardImg');
  $('shareBtn').addEventListener('click',function(){
    cardImg.src=drawCard(); modal.classList.add('show');
  });
  $('closeModal').addEventListener('click',function(){ modal.classList.remove('show'); });
  modal.addEventListener('click',function(e){ if(e.target===modal) modal.classList.remove('show'); });
  // 再敲敲：原地刷新卡片（计数+1、换一句祝福），留在弹窗内，不弹运势浮层
  $('againBtn').addEventListener('click',function(){
    playWood();
    total++; today++; render(); save();
    lastBless=BLESS[Math.floor(Math.random()*BLESS.length)];
    cardImg.src=drawCard();
    if(navigator.vibrate) navigator.vibrate(15);
  });
  $('dlBtn').addEventListener('click',function(){
    var a=document.createElement('a');
    a.href=cardImg.src; a.download='好运木鱼_'+total+'.png';
    document.body.appendChild(a); a.click(); a.remove();
  });

  render();
})();

