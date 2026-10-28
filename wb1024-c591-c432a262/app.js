document.title = "赛博木鱼 · 敲功德";
const style=document.createElement("style"); style.textContent="\n  :root{\n    --bg:#0d1117; --bg2:#131a24; --card:#171f2b; --line:#26303f;\n    --ink:#e8edf3; --ink2:#8b98a9; --brand:#3fd68c; --brand2:#2bb377;\n    --wood:#a06834; --wood-d:#7a4a22; --wood-l:#c98d4e;\n    --gold:#ffcf6b;\n  }\n  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}\n  html,body{height:100%}\n  body{\n    background:radial-gradient(1200px 800px at 50% -10%, #1b2735 0%, var(--bg) 55%) fixed, var(--bg);\n    color:var(--ink);\n    font-family:-apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Microsoft YaHei\",\"Segoe UI\",sans-serif;\n    min-height:100dvh; display:flex; flex-direction:column; align-items:center;\n    padding:28px 16px 40px; overflow-x:hidden;\n  }\n  .code-rain{position:fixed;inset:0;pointer-events:none;opacity:.07;z-index:0;\n    background-image:repeating-linear-gradient(0deg,transparent 0 26px,#3fd68c 26px 27px);\n    mask-image:linear-gradient(180deg,#000 0%,transparent 70%);\n    -webkit-mask-image:linear-gradient(180deg,#000 0%,transparent 70%);}\n  main{width:100%;max-width:560px;position:relative;z-index:1}\n\n  header{text-align:center;margin-bottom:18px}\n  .badge{display:inline-block;font-size:12px;letter-spacing:.12em;color:var(--brand);\n    border:1px solid rgba(63,214,140,.35);background:rgba(63,214,140,.08);\n    padding:4px 12px;border-radius:999px;margin-bottom:12px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}\n  h1{font-size:30px;letter-spacing:.04em}\n  h1 .fish-emoji{filter:drop-shadow(0 2px 8px rgba(255,207,107,.35))}\n  .subtitle{margin-top:8px;color:var(--ink2);font-size:14px;line-height:1.6}\n  .subtitle b{color:var(--gold);font-weight:600}\n\n  .panel{background:linear-gradient(180deg,var(--card),var(--bg2));border:1px solid var(--line);\n    border-radius:20px;padding:22px 18px 18px;box-shadow:0 18px 50px rgba(0,0,0,.45)}\n\n  /* ── 木鱼 ── */\n  .stage{position:relative;display:flex;flex-direction:column;align-items:center;padding:6px 0 2px}\n  .fish-wrap{position:relative;width:min(240px,62vw);aspect-ratio:1;cursor:pointer;user-select:none;\n    transition:transform .08s ease;outline:none}\n  .fish-wrap:active,.fish-wrap.knock{transform:scale(.93)}\n  .fish{position:absolute;inset:0;border-radius:50% 50% 46% 46%/58% 58% 42% 42%;\n    background:\n      radial-gradient(60% 45% at 32% 24%, rgba(255,235,200,.35), transparent 60%),\n      linear-gradient(160deg, var(--wood-l) 0%, var(--wood) 42%, var(--wood-d) 100%);\n    box-shadow:\n      inset 0 -14px 28px rgba(0,0,0,.45), inset 0 10px 18px rgba(255,220,170,.18),\n      0 22px 44px rgba(0,0,0,.5), 0 0 0 10px rgba(160,104,52,.12), 0 0 0 22px rgba(160,104,52,.06);\n    display:flex;align-items:center;justify-content:center}\n  .fish::before{content:\"\";position:absolute;left:14%;right:14%;top:47%;height:9px;border-radius:999px;\n    background:linear-gradient(180deg,#4a2c10,#2a1708);\n    box-shadow:0 2px 6px rgba(0,0,0,.6), inset 0 2px 3px rgba(0,0,0,.8)}\n  .fish::after{content:\"卍\";position:absolute;top:16%;font-size:clamp(18px,5vw,26px);color:rgba(255,231,180,.5);\n    text-shadow:0 1px 2px rgba(0,0,0,.4)}\n  .ring{position:absolute;inset:-6%;border-radius:50%;border:2px solid rgba(255,207,107,.5);\n    opacity:0;pointer-events:none}\n  .fish-wrap.knock .ring{animation:ring .5s ease-out}\n  @keyframes ring{0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.35);opacity:0}}\n  .merit{position:absolute;left:50%;top:6%;transform:translateX(-50%);font-weight:700;\n    color:var(--gold);font-size:22px;pointer-events:none;text-shadow:0 0 14px rgba(255,207,107,.6);\n    animation:floatUp .9s ease-out forwards}\n  @keyframes floatUp{0%{opacity:0;transform:translate(-50%,10px) scale(.8)}\n    20%{opacity:1}100%{opacity:0;transform:translate(-50%,-90px) scale(1.15)}}\n  .hint-kbd{margin-top:14px;font-size:12px;color:var(--ink2);font-family:ui-monospace,Consolas,monospace}\n  .hint-kbd kbd{border:1px solid var(--line);border-bottom-width:2px;border-radius:5px;\n    padding:1px 7px;background:#0f1620;color:var(--ink);font-size:11px}\n\n  .combo{margin-top:10px;height:22px;font-size:14px;color:var(--brand);font-weight:600;\n    opacity:0;transition:opacity .2s}\n  .combo.on{opacity:1}\n  .combo .fire{display:inline-block;animation:pulse .6s ease infinite alternate}\n  @keyframes pulse{from{transform:scale(1)}to{transform:scale(1.25)}}\n\n  /* ── 数据 ── */\n  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px}\n  .stat{background:rgba(13,17,23,.6);border:1px solid var(--line);border-radius:14px;\n    padding:12px 6px 10px;text-align:center}\n  .stat .num{font-size:24px;font-weight:700;font-variant-numeric:tabular-nums;\n    font-family:ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--brand)}\n  .stat .lbl{margin-top:3px;font-size:12px;color:var(--ink2)}\n  .stat.gold .num{color:var(--gold)}\n\n  .progress{margin-top:14px}\n  .progress .row{display:flex;justify-content:space-between;font-size:12px;color:var(--ink2);margin-bottom:6px}\n  .progress .row b{color:var(--ink)}\n  .bar{height:8px;border-radius:999px;background:#0a0e14;border:1px solid var(--line);overflow:hidden}\n  .bar i{display:block;height:100%;width:0;border-radius:999px;\n    background:linear-gradient(90deg,var(--brand2),var(--brand));transition:width .35s ease}\n\n  /* ── 成就 ── */\n  .achievements{margin-top:16px}\n  .achievements h2{font-size:13px;color:var(--ink2);font-weight:600;letter-spacing:.08em;margin-bottom:10px}\n  .ach-list{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}\n  .ach{display:flex;align-items:center;gap:9px;border:1px solid var(--line);border-radius:12px;\n    padding:9px 10px;background:rgba(13,17,23,.5);opacity:.45;filter:grayscale(.8);transition:all .3s}\n  .ach.unlocked{opacity:1;filter:none;border-color:rgba(255,207,107,.4);\n    background:linear-gradient(180deg,rgba(255,207,107,.1),rgba(13,17,23,.5));\n    box-shadow:0 0 18px rgba(255,207,107,.12)}\n  .ach .icon{font-size:20px;line-height:1}\n  .ach .t{font-size:13px;font-weight:600}\n  .ach .d{font-size:11px;color:var(--ink2);margin-top:1px}\n\n  .actions{display:flex;gap:10px;margin-top:18px}\n  .btn{flex:1;border:1px solid var(--line);background:#0f1620;color:var(--ink);\n    border-radius:12px;padding:11px 8px;font-size:14px;cursor:pointer;transition:all .15s;\n    display:flex;align-items:center;justify-content:center;gap:6px}\n  .btn:hover{border-color:var(--brand);color:var(--brand)}\n  .btn.primary{background:linear-gradient(180deg,var(--brand),var(--brand2));color:#06281a;\n    border:none;font-weight:700}\n  .btn.primary:hover{filter:brightness(1.08);color:#06281a}\n  .btn:active{transform:scale(.97)}\n\n  .toast{position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(20px);\n    background:#1d2937;border:1px solid var(--brand);color:var(--ink);font-size:14px;\n    padding:10px 18px;border-radius:999px;opacity:0;pointer-events:none;transition:all .3s;z-index:10;\n    box-shadow:0 10px 30px rgba(0,0,0,.5);max-width:86vw;text-align:center}\n  .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}\n\n  footer{margin-top:22px;text-align:center;color:var(--ink2);font-size:12px;line-height:1.8}\n  footer .mono{font-family:ui-monospace,Consolas,monospace;color:rgba(63,214,140,.75)}\n\n  @media (prefers-reduced-motion:reduce){\n    *{animation-duration:.01ms !important;transition-duration:.01ms !important}\n  }\n"; document.head.appendChild(style);
document.body.innerHTML="\n<div class=\"code-rain\" aria-hidden=\"true\"></div>\n<main>\n  <header>\n    <div class=\"badge\">// 1024 · 程序员节特供</div>\n    <h1><span class=\"fish-emoji\">🐟</span> 赛博木鱼</h1>\n    <p class=\"subtitle\">敲一下，<b>功德 +1</b>；CPU 冷静，Bug 退散。<br>专为熬夜写代码的你定制。</p>\n  </header>\n\n  <section class=\"panel\">\n    <div class=\"stage\">\n      <div class=\"fish-wrap\" id=\"fish\" role=\"button\" tabindex=\"0\" aria-label=\"敲木鱼，功德加一\">\n        <div class=\"ring\"></div>\n        <div class=\"fish\"></div>\n      </div>\n      <div class=\"combo\" id=\"combo\"></div>\n      <p class=\"hint-kbd\">点击木鱼，或按 <kbd>空格</kbd> / <kbd>回车</kbd> 敲击</p>\n    </div>\n\n    <div class=\"stats\">\n      <div class=\"stat\"><div class=\"num\" id=\"stToday\">0</div><div class=\"lbl\">今日功德</div></div>\n      <div class=\"stat gold\"><div class=\"num\" id=\"stTotal\">0</div><div class=\"lbl\">累计功德</div></div>\n      <div class=\"stat\"><div class=\"num\" id=\"stCombo\">0</div><div class=\"lbl\">最高连击</div></div>\n    </div>\n\n    <div class=\"progress\">\n      <div class=\"row\"><span>下一成就</span><b id=\"nextName\">Bug 退散 · 1024</b></div>\n      <div class=\"bar\"><i id=\"nextBar\"></i></div>\n    </div>\n\n    <div class=\"achievements\">\n      <h2>🏅 成就墙</h2>\n      <div class=\"ach-list\" id=\"achList\"></div>\n    </div>\n\n    <div class=\"actions\">\n      <button class=\"btn\" id=\"btnSound\">🔊 音效：开</button>\n      <button class=\"btn\" id=\"btnReset\">🗑 重置数据</button>\n    </div>\n  </section>\n\n  <footer>\n    数据仅保存在你自己的浏览器本地 · 灵感来自赛博功德箱<br>\n    <span class=\"mono\">while (alive) { knock(); merit++; }</span>\n  </footer>\n</main>\n\n<div class=\"toast\" id=\"toast\" role=\"status\"></div>\n\n";

(function(){
  "use strict";
  var KEY = "cyber_woodfish_v1";
  var ACHIEVEMENTS = [
    {n:1024,   icon:"🐛", name:"Bug 退散",   desc:"敲满 1024 功德"},
    {n:4096,   icon:"⚡", name:"CPU 超频",   desc:"敲满 4096 功德"},
    {n:16384,  icon:"🧠", name:"脑内无尘埃", desc:"敲满 16384 功德"},
    {n:65536,  icon:"🚀", name:"飞升成仙",   desc:"敲满 65536 功德"}
  ];

  var state = load();
  var soundOn = true;
  var combo = 0, comboTimer = null;
  var audioCtx = null;

  function today(){
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();
  }
  function load(){
    try{
      var s = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (!s || typeof s !== "object") s = {};
    }catch(e){ s = {}; }
    return {
      total: s.total|0,
      today: s.today|0,
      day: s.day || today(),
      bestCombo: s.bestCombo|0,
      unlocked: Array.isArray(s.unlocked) ? s.unlocked : []
    };
  }
  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){}
  }
  if (state.day !== today()){ state.day = today(); state.today = 0; save(); }

  var $ = function(id){ return document.getElementById(id); };
  var fish = $("fish"), comboEl = $("combo"), toastEl = $("toast");
  var toastTimer = null;
  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove("show"); }, 2200);
  }

  function fmt(n){
    return n >= 10000 ? (n/10000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/,"") + "w" : String(n);
  }

  function render(){
    $("stToday").textContent = fmt(state.today);
    $("stTotal").textContent = fmt(state.total);
    $("stCombo").textContent = fmt(state.bestCombo);

    var next = null;
    for (var i=0;i<ACHIEVEMENTS.length;i++){
      if (state.unlocked.indexOf(ACHIEVEMENTS[i].n) < 0){ next = ACHIEVEMENTS[i]; break; }
    }
    var bar = $("nextBar"), nameEl = $("nextName");
    if (next){
      nameEl.textContent = next.icon + " " + next.name + " · " + next.n;
      bar.style.width = Math.min(100, state.total / next.n * 100) + "%";
    }else{
      nameEl.textContent = "已全部达成 · 功德无量";
      bar.style.width = "100%";
    }

    var list = $("achList");
    list.innerHTML = "";
    ACHIEVEMENTS.forEach(function(a){
      var on = state.unlocked.indexOf(a.n) >= 0;
      var div = document.createElement("div");
      div.className = "ach" + (on ? " unlocked" : "");
      var icon = document.createElement("span"); icon.className = "icon"; icon.textContent = a.icon;
      var box = document.createElement("div");
      var t = document.createElement("div"); t.className = "t"; t.textContent = a.name;
      var d = document.createElement("div"); d.className = "d";
      d.textContent = on ? "已解锁 ✓" : a.desc;
      box.appendChild(t); box.appendChild(d);
      div.appendChild(icon); div.appendChild(box);
      list.appendChild(div);
    });
  }

  /* ── 音效：WebAudio 合成木鱼声，无需外部素材 ── */
  function knockSound(){
    if (!soundOn) return;
    try{
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      var t = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.11);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t); osc.stop(t + 0.15);
      var len = Math.floor(audioCtx.sampleRate * 0.05);
      var buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i=0;i<len;i++){ data[i] = (Math.random()*2-1) * (1 - i/len); }
      var noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      var ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0.12, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      noise.connect(ng).connect(audioCtx.destination);
      noise.start(t);
    }catch(e){}
  }

  /* ── 敲击 ── */
  function knock(){
    state.total++; state.today++;
    combo++;
    if (combo > state.bestCombo) state.bestCombo = combo;

    var newly = null;
    for (var i=0;i<ACHIEVEMENTS.length;i++){
      var a = ACHIEVEMENTS[i];
      if (state.total >= a.n && state.unlocked.indexOf(a.n) < 0){
        state.unlocked.push(a.n); newly = a;
      }
    }
    save();
    render();

    fish.classList.remove("knock");
    void fish.offsetWidth;
    fish.classList.add("knock");
    knockSound();

    var m = document.createElement("span");
    m.className = "merit";
    m.textContent = "功德 +1";
    m.style.left = (38 + Math.random()*24) + "%";
    fish.appendChild(m);
    setTimeout(function(){ m.remove(); }, 900);

    if (combo >= 5){
      comboEl.innerHTML = '<span class="fire">🔥</span> ' + combo + " 连击！";
      comboEl.classList.add("on");
    }
    clearTimeout(comboTimer);
    comboTimer = setTimeout(function(){
      combo = 0; comboEl.classList.remove("on");
    }, 1500);

    if (newly){
      setTimeout(function(){ toast("🎉 解锁成就「" + newly.name + "」"); }, 250);
    }
  }

  fish.addEventListener("pointerdown", function(e){ e.preventDefault(); knock(); });
  fish.addEventListener("keydown", function(e){
    if (e.key === " " || e.key === "Enter"){ e.preventDefault(); knock(); }
  });
  document.addEventListener("keydown", function(e){
    if ((e.key === " " || e.key === "Enter") && document.activeElement !== fish){
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "BUTTON") return;
      e.preventDefault(); knock();
    }
  });

  $("btnSound").addEventListener("click", function(){
    soundOn = !soundOn;
    this.textContent = soundOn ? "🔊 音效：开" : "🔇 音效：关";
  });

  $("btnReset").addEventListener("click", function(){
    if (!confirm("确定要清空所有功德和成就吗？此操作不可恢复。")) return;
    state = { total:0, today:0, day:today(), bestCombo:0, unlocked:[] };
    save(); render();
    toast("已重置，重新开始积功德吧");
  });

  render();
})();
