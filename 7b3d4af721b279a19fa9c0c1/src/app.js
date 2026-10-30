import { createTianaFetch } from '@tianacloud/serverless';
document.body.innerHTML = "\n<canvas id=\"rain\"></canvas>\n<div class=\"wrap\">\n  <header>\n    <div class=\"logo\">🍅 <b>pomodoro</b></div>\n    <span class=\"badge\">专注 · 休息</span>\n  </header>\n  <div class=\"tagline\"><span class=\"kw\">while</span> (!done) { <span class=\"fn\">focus</span>(); <span class=\"fn\">rest</span>(); } <span class=\"num\">// 25 + 5</span></div>\n\n  <!-- 计时器 -->\n  <div class=\"card\">\n    <div class=\"tabs\">\n      <button class=\"tab on\" data-mode=\"focus\">专注 25</button>\n      <button class=\"tab\" data-mode=\"short\">短休 5</button>\n      <button class=\"tab\" data-mode=\"long\">长休 15</button>\n    </div>\n    <div class=\"ringbox\">\n      <svg class=\"ring\" viewBox=\"0 0 260 260\">\n        <circle class=\"track\" cx=\"130\" cy=\"130\" r=\"118\"></circle>\n        <circle class=\"bar\" cx=\"130\" cy=\"130\" id=\"bar\" r=\"118\"></circle>\n      </svg>\n      <div class=\"center\">\n        <div class=\"time\" id=\"time\">25:00</div>\n        <div class=\"phase\" id=\"phase\">第 1 个番茄 · 本组 0/4</div>\n      </div>\n    </div>\n    <div class=\"btns\">\n      <button class=\"btn primary\" id=\"toggle\">开始</button>\n      <button class=\"btn\" id=\"reset\">重置</button>\n      <button class=\"btn\" id=\"skip\">跳过</button>\n    </div>\n    <div class=\"meta\">\n      <div class=\"dots\" id=\"dots\"><span class=\"dot\"></span><span class=\"dot\"></span><span class=\"dot\"></span><span class=\"dot\"></span></div>\n      <div id=\"stat\">今日 0 个番茄 · 0 min</div>\n    </div>\n  </div>\n\n  <!-- 任务清单 -->\n  <div class=\"card tasks\">\n    <h3>任务清单 <span id=\"tkcount\" style=\"color:var(--faint)\"></span></h3>\n    <div class=\"addrow\">\n      <input id=\"tkinput\" maxlength=\"60\" placeholder=\"这个番茄要做什么？回车添加\">\n      <button id=\"tkadd\">添加</button>\n    </div>\n    <ul class=\"tk\" id=\"tklist\"></ul>\n    <div class=\"empty\" id=\"tkempty\">// 还没有任务，先加一个吧</div>\n  </div>\n\n  <!-- 设置 -->\n  <div class=\"card set\">\n    <h3>设置 <span style=\"color:var(--faint)\">单位：分钟</span></h3>\n    <div class=\"setgrid\">\n      <div class=\"fld\"><label>专注</label><input id=\"d_focus\" max=\"180\" min=\"1\" type=\"number\"></div>\n      <div class=\"fld\"><label>短休</label><input id=\"d_short\" max=\"180\" min=\"1\" type=\"number\"></div>\n      <div class=\"fld\"><label>长休</label><input id=\"d_long\" max=\"180\" min=\"1\" type=\"number\"></div>\n    </div>\n    <label class=\"chk\"><input id=\"autoStart\" type=\"checkbox\"> 阶段结束后自动开始下一阶段</label>\n    <label class=\"chk\"><input id=\"sound\" type=\"checkbox\"> 完成提示音</label>\n  </div>\n\n  <footer>\n    <kbd>空格</kbd> 开始/暂停 · <kbd>R</kbd> 重置 · <kbd>S</kbd> 跳过 · <kbd>N</kbd> 聚焦任务框 · 双击任务标记完成<br>\n    任务、设置和统计保存在应用数据库\n  </footer>\n</div>\n\n";
const style=document.createElement("style"); style.textContent="\n:root{\n  --bg:#0a0e14; --panel:#0f1520; --panel2:#131a26; --line:#1e2a3a;\n  --text:#e6edf3; --dim:#8b98a9; --faint:#54626f;\n  --focus:#f97316; --short:#34d399; --long:#60a5fa;\n  --accent:var(--focus);\n  --mono:'JetBrains Mono','Cascadia Code','SF Mono',Consolas,'Liberation Mono',monospace;\n  --sans:'PingFang SC','Microsoft YaHei','Segoe UI',system-ui,sans-serif;\n}\n*{margin:0;padding:0;box-sizing:border-box}\nbody{\n  background:var(--bg); color:var(--text); font-family:var(--sans);\n  min-height:100vh; display:flex; flex-direction:column; align-items:center;\n  padding:28px 16px 48px; position:relative; overflow-x:hidden;\n}\n#rain{position:fixed; inset:0; z-index:0; pointer-events:none;}\n.wrap{position:relative; z-index:1; width:100%; max-width:520px;}\nheader{display:flex; align-items:baseline; gap:10px; margin-bottom:6px; flex-wrap:wrap;}\n.logo{font-family:var(--mono); font-size:20px; font-weight:700; letter-spacing:.5px;}\n.logo b{color:var(--focus);}\n.badge{font-family:var(--mono); font-size:11px; color:var(--dim); border:1px solid var(--line); border-radius:999px; padding:2px 10px;}\n.tagline{font-family:var(--mono); font-size:12px; color:var(--faint); margin-bottom:22px;}\n.tagline .kw{color:#c792ea;} .tagline .fn{color:#82aaff;} .tagline .num{color:#f78c6c;}\n.card{background:linear-gradient(180deg,var(--panel),var(--panel2)); border:1px solid var(--line); border-radius:16px; padding:22px; margin-bottom:16px; box-shadow:0 10px 40px rgba(0,0,0,.35);}\n/* 模式页签 */\n.tabs{display:flex; gap:8px; margin-bottom:20px;}\n.tab{flex:1; font-family:var(--mono); font-size:13px; padding:9px 0; text-align:center; color:var(--dim); background:transparent; border:1px solid var(--line); border-radius:10px; cursor:pointer; transition:.15s;}\n.tab:hover{color:var(--text);}\n.tab.on{color:#0a0e14; background:var(--accent); border-color:var(--accent); font-weight:700;}\n/* 圆环计时器 */\n.ringbox{position:relative; width:260px; height:260px; margin:0 auto 6px;}\nsvg.ring{transform:rotate(-90deg); width:100%; height:100%;}\n.ring .track{fill:none; stroke:var(--line); stroke-width:10;}\n.ring .bar{fill:none; stroke:var(--accent); stroke-width:10; stroke-linecap:round; transition:stroke-dashoffset .25s linear, stroke .3s;}\n.center{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px;}\n.time{font-family:var(--mono); font-size:52px; font-weight:700; letter-spacing:2px; font-variant-numeric:tabular-nums;}\n.phase{font-family:var(--mono); font-size:12px; color:var(--dim);}\n/* 控制按钮 */\n.btns{display:flex; gap:10px; margin:14px 0 4px;}\n.btn{flex:1; font-family:var(--mono); font-size:14px; padding:11px 0; border-radius:10px; border:1px solid var(--line); background:var(--panel2); color:var(--text); cursor:pointer; transition:.15s;}\n.btn:hover{border-color:var(--dim);}\n.btn.primary{background:var(--accent); border-color:var(--accent); color:#0a0e14; font-weight:700;}\n.btn.primary:hover{filter:brightness(1.1);}\n.meta{display:flex; align-items:center; justify-content:space-between; margin-top:14px; font-family:var(--mono); font-size:12px; color:var(--dim);}\n.dots{display:flex; gap:6px;}\n.dot{width:9px; height:9px; border-radius:50%; background:var(--line); transition:.2s;}\n.dot.on{background:var(--accent); box-shadow:0 0 8px var(--accent);}\n/* 任务清单 */\n.tasks h3, .set h3{font-family:var(--mono); font-size:13px; color:var(--dim); font-weight:600; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;}\n.addrow{display:flex; gap:8px; margin-bottom:12px;}\n.addrow input{flex:1; font-family:var(--sans); font-size:14px; padding:9px 12px; color:var(--text); background:#0b1017; border:1px solid var(--line); border-radius:10px; outline:none;}\n.addrow input:focus{border-color:var(--accent);}\n.addrow button{font-family:var(--mono); font-size:13px; padding:0 16px; border:1px solid var(--line); border-radius:10px; background:var(--panel2); color:var(--text); cursor:pointer;}\n.addrow button:hover{border-color:var(--accent); color:var(--accent);}\nul.tk{list-style:none;}\nul.tk li{display:flex; align-items:center; gap:10px; padding:9px 10px; border:1px solid transparent; border-radius:10px; cursor:pointer; font-size:14px;}\nul.tk li:hover{background:#0b1017;}\nul.tk li.on{border-color:var(--accent); background:#0b1017;}\nul.tk li .t{flex:1;}\nul.tk li.done .t{text-decoration:line-through; color:var(--faint);}\nul.tk li .x{font-family:var(--mono); color:var(--faint); padding:0 4px; visibility:hidden;}\nul.tk li:hover .x{visibility:visible;}\nul.tk li .x:hover{color:#f87171;}\n.empty{font-family:var(--mono); font-size:12px; color:var(--faint); padding:6px 2px;}\n/* 设置 */\n.setgrid{display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:14px;}\n.fld{display:flex; flex-direction:column; gap:6px;}\n.fld label{font-family:var(--mono); font-size:11px; color:var(--dim);}\n.fld input{font-family:var(--mono); font-size:15px; padding:8px 10px; color:var(--text); background:#0b1017; border:1px solid var(--line); border-radius:8px; outline:none; width:100%;}\n.fld input:focus{border-color:var(--accent);}\n.chk{display:flex; align-items:center; gap:8px; font-family:var(--mono); font-size:12px; color:var(--dim); cursor:pointer; margin-bottom:8px;}\n.chk input{accent-color:var(--accent);}\nfooter{margin-top:4px; font-family:var(--mono); font-size:11px; color:var(--faint); text-align:center; line-height:2;}\nfooter kbd{font-family:var(--mono); border:1px solid var(--line); border-bottom-width:2px; border-radius:5px; padding:1px 6px; color:var(--dim); background:var(--panel2);}\n@media (max-width:420px){ .ringbox{width:220px;height:220px;} .time{font-size:44px;} }\n"; document.head.appendChild(style);

'use strict';
/* ================= 工具 ================= */
var $ = function (s) { return document.querySelector(s); };
function pad(n) { return String(n).padStart(2, '0'); }
function mmss(s) { return pad(Math.floor(s / 60)) + ':' + pad(s % 60); }
function todayKey() {
  var d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
var memory = {};
var connection, sqlFetch, saveQueue = Promise.resolve();
var statusEl = document.createElement('div');
statusEl.setAttribute('role', 'status');
statusEl.style.cssText = 'color:#f97316;text-align:center;padding:8px';
document.querySelector('.wrap').prepend(statusEl);
document.querySelector('.wrap').inert = true;
statusEl.textContent = '正在读取数据…';
async function execute(sql, args) {
  var response = await sqlFetch(connection.origin + '/v3/pipeline', {
    method:'POST', headers:{'content-type':'application/json'},
    body:JSON.stringify({requests:[{type:'execute',stmt:{sql:sql,args:args || [],want_rows:true}},{type:'close'}]})
  });
  if (!response.ok) throw new Error('数据库响应不可用');
  var body = await response.json(), result = body.results && body.results[0];
  if (!result || result.type !== 'ok' || result.response?.type !== 'execute') throw new Error('数据库操作未确认');
  return result.response.result;
}
function failStorage() {
  statusEl.textContent = '数据操作未确认，请重新打开应用后检查。';
  document.querySelector('.wrap').inert = true;
}
var LS = {
  get: function(k,d) { return Object.prototype.hasOwnProperty.call(memory,k) ? memory[k] : d; },
  set: function(k,v) {
    var value = JSON.stringify(v); memory[k] = JSON.parse(value);
    saveQueue = saveQueue.then(function() {
      return execute('INSERT INTO pomodoro_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
        [{type:'text',value:k},{type:'text',value:value}]);
    }).catch(function(e) { failStorage(); throw e; });
    saveQueue.catch(function() {});
  }
};

/* ================= 状态 ================= */
var DEFAULTS = { focus: 25, short: 5, long: 15, autoStart: true, sound: true };
var settings = Object.assign({}, DEFAULTS, LS.get('pomodoro.settings', {}));
var tasks = LS.get('pomodoro.tasks', []);
var stats = LS.get('pomodoro.stats', null);
if (!stats || stats.date !== todayKey()) stats = { date: todayKey(), count: 0, minutes: 0 };

var MODES = {
  focus: { label: '专注中', color: 'var(--focus)', next: function (s) { return (s.count > 0 && s.count % 4 === 0) ? 'long' : 'short'; } },
  short: { label: '短休中', color: 'var(--short)', next: function () { return 'focus'; } },
  long:  { label: '长休中', color: 'var(--long)',  next: function () { return 'focus'; } }
};
var mode = 'focus';
var total = settings[mode] * 60;
var remaining = total;
var running = false;
var endAt = 0;
var ticker = null;
var activeId = null;

/* ================= DOM ================= */
var bar = $('#bar'), timeEl = $('#time'), phaseEl = $('#phase'), toggleBtn = $('#toggle'),
    dotsEl = $('#dots'), statEl = $('#stat');
var C = 2 * Math.PI * 118; // 圆环周长
bar.style.strokeDasharray = C;

function render() {
  var m = MODES[mode];
  document.documentElement.style.setProperty('--accent', m.color);
  timeEl.textContent = mmss(remaining);
  bar.style.strokeDashoffset = C * (1 - (total > 0 ? remaining / total : 0));
  var done = (stats.count > 0 && stats.count % 4 === 0) ? 4 : stats.count % 4;
  var i, dots = dotsEl.children;
  for (i = 0; i < dots.length; i++) dots[i].classList.toggle('on', i < done);
  phaseEl.textContent = (mode === 'focus' ? '第 ' + (stats.count + 1) + ' 个番茄' : m.label) + ' · 本组 ' + done + '/4';
  statEl.textContent = '今日 ' + stats.count + ' 个番茄 · ' + stats.minutes + ' min';
  toggleBtn.textContent = running ? '暂停' : '开始';
  document.title = (running ? mmss(remaining) + ' · ' + m.label : '番茄时钟') + ' · Pomodoro';
  var tabs = document.querySelectorAll('.tab');
  for (i = 0; i < tabs.length; i++) tabs[i].classList.toggle('on', tabs[i].dataset.mode === mode);
  var left = 0, j;
  for (j = 0; j < tasks.length; j++) if (!tasks[j].done) left++;
  $('#tkcount').textContent = tasks.length ? left + ' 待完成' : '';
  $('#tkempty').style.display = tasks.length ? 'none' : 'block';
}

/* ================= 计时核心（时间戳校准，切后台不回跳） ================= */
function tick() {
  remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
  if (remaining <= 0) { complete(); return; }
  render();
}
function start() {
  if (running) return;
  if (remaining <= 0) remaining = total;
  running = true;
  endAt = Date.now() + remaining * 1000;
  ticker = setInterval(tick, 200);
  wakeAudio();
  render();
}
function pause() {
  running = false;
  clearInterval(ticker);
  remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
  render();
}
function toggle() { if (running) pause(); else start(); }
function reset() { running = false; clearInterval(ticker); remaining = total; render(); }
function skip() {
  running = false; clearInterval(ticker);
  setMode(MODES[mode].next(stats));
  if (settings.autoStart) start();
}
function complete() {
  running = false; clearInterval(ticker); remaining = 0; render();
  beep(1);
  if (mode === 'focus') {
    stats.count += 1;
    stats.minutes += settings.focus;
    LS.set('pomodoro.stats', stats);
  }
  setMode(MODES[mode].next(stats));
  if (settings.autoStart) start();
}
function setMode(m) {
  running = false; clearInterval(ticker);
  mode = m;
  total = settings[m] * 60;
  remaining = total;
  render();
}

/* ================= 提示音（WebAudio 合成，无外部文件） ================= */
var actx = null;
function wakeAudio() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
  } catch (e) {}
}
function beep(kind) {
  if (kind === 1 && !settings.sound) return;
  wakeAudio();
  if (!actx) return;
  try {
    var t0 = actx.currentTime + 0.02;
    var notes = kind === 1 ? [660, 880, 660, 990] : [440];
    notes.forEach(function (f, i) {
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      var t = t0 + i * 0.22;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g); g.connect(actx.destination);
      o.start(t); o.stop(t + 0.25);
    });
  } catch (e) {}
}

/* ================= 任务清单 ================= */
function renderTasks() {
  var ul = $('#tklist');
  ul.innerHTML = '';
  tasks.forEach(function (t) {
    var li = document.createElement('li');
    li.className = (t.done ? 'done ' : '') + (t.id === activeId ? 'on' : '');
    var span = document.createElement('span');
    span.className = 't'; span.textContent = t.text;
    var x = document.createElement('span');
    x.className = 'x'; x.textContent = '×';
    x.onclick = function (e) {
      e.stopPropagation();
      tasks = tasks.filter(function (k) { return k.id !== t.id; });
      if (activeId === t.id) activeId = null;
      LS.set('pomodoro.tasks', tasks);
      renderTasks();
    };
    li.onclick = function () { activeId = (activeId === t.id ? null : t.id); renderTasks(); };
    li.ondblclick = function () { t.done = !t.done; LS.set('pomodoro.tasks', tasks); renderTasks(); };
    li.appendChild(span); li.appendChild(x);
    ul.appendChild(li);
  });
  render();
}
function addTask() {
  var inp = $('#tkinput');
  var v = inp.value.trim();
  if (!v) return;
  tasks.push({ id: Date.now() + '' + Math.floor(Math.random() * 1000), text: v, done: false });
  inp.value = '';
  LS.set('pomodoro.tasks', tasks);
  renderTasks();
}
$('#tkadd').onclick = addTask;
$('#tkinput').addEventListener('keydown', function (e) { if (e.key === 'Enter') addTask(); });

/* ================= 设置 ================= */
['focus', 'short', 'long'].forEach(function (k) {
  var el = $('#d_' + k);
  el.value = settings[k];
  el.addEventListener('change', function () {
    var v = parseInt(el.value, 10);
    if (!(v >= 1)) v = DEFAULTS[k];
    v = Math.min(180, Math.max(1, v));
    settings[k] = v; el.value = v;
    LS.set('pomodoro.settings', settings);
    if (!running && mode === k) { total = v * 60; remaining = total; }
    render();
  });
});
$('#autoStart').checked = settings.autoStart;
$('#autoStart').addEventListener('change', function (e) {
  settings.autoStart = e.target.checked;
  LS.set('pomodoro.settings', settings);
});
$('#sound').checked = settings.sound;
$('#sound').addEventListener('change', function (e) {
  settings.sound = e.target.checked;
  LS.set('pomodoro.settings', settings);
});

/* ================= 事件绑定 ================= */
var tabEls = document.querySelectorAll('.tab');
for (var i = 0; i < tabEls.length; i++) {
  tabEls[i].addEventListener('click', function () { setMode(this.dataset.mode); });
}
$('#toggle').onclick = toggle;
$('#reset').onclick = reset;
$('#skip').onclick = skip;
document.addEventListener('keydown', function (e) {
  var tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea') return;
  if (e.code === 'Space') { e.preventDefault(); toggle(); }
  else if (e.key === 'r' || e.key === 'R') reset();
  else if (e.key === 's' || e.key === 'S') skip();
  else if (e.key === 'n' || e.key === 'N') $('#tkinput').focus();
});
document.addEventListener('pointerdown', wakeAudio, { once: true });

/* ================= 二进制雨背景（低透明度氛围） ================= */
(function rain() {
  var cv = $('#rain'), ctx = cv.getContext('2d');
  var cols, drops, w, h;
  function resize() {
    w = cv.width = window.innerWidth;
    h = cv.height = window.innerHeight;
    cols = Math.floor(w / 16);
    drops = [];
    for (var i = 0; i < cols; i++) drops.push(Math.random() * h / 16);
  }
  resize();
  window.addEventListener('resize', resize);
  setInterval(function () {
    if (document.hidden) return;
    ctx.fillStyle = 'rgba(10,14,20,0.10)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = '12px monospace';
    for (var i = 0; i < cols; i++) {
      var ch = Math.random() > 0.5 ? '0' : '1';
      ctx.fillStyle = 'rgba(96,165,250,0.055)';
      ctx.fillText(ch, i * 16, drops[i] * 16);
      if (drops[i] * 16 > h && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 1;
    }
  }, 110);
})();

/* ================= 启动 ================= */
async function initialize() {
  try {
    if (typeof window.tiana?.auth?.getAccessToken !== 'function') throw new Error('登录能力未就绪');
    connection = await window.tiana.connection();
    if (connection.sql_api !== 'hrana-v3') throw new Error('数据库协议不支持');
    sqlFetch = createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:'buffered'});
    var data = await execute('SELECT key, value FROM pomodoro_state');
    (data.rows || []).forEach(function(row) { memory[row[0].value] = JSON.parse(row[1].value); });
    settings = Object.assign({}, DEFAULTS, LS.get('pomodoro.settings', {}));
    tasks = LS.get('pomodoro.tasks', []);
    stats = LS.get('pomodoro.stats', null);
    if (!stats || stats.date !== todayKey()) stats = {date:todayKey(),count:0,minutes:0};
    ['focus','short','long'].forEach(function(k){ $('#d_'+k).value=settings[k]; });
    $('#autoStart').checked=settings.autoStart; $('#sound').checked=settings.sound;
    total=settings[mode]*60; remaining=total;
    renderTasks(); render();
    document.querySelector('.wrap').inert = false; statusEl.textContent = '';
  } catch (e) { failStorage(); }
}
initialize();
