import {sql} from './db.js';

/* =====================================================
   四年级学习积分乐园 —— 数据与逻辑
===================================================== */
var LS_KEY = 's4_study_points_v1';

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function todayStr(d){ d=d||new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function dateCN(){ var d=new Date(); var wk=['日','一','二','三','四','五','六']; return (d.getMonth()+1)+'月'+d.getDate()+'日 星期'+wk[d.getDay()]; }
function timeStr(){ var d=new Date(); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function deep(o){ return JSON.parse(JSON.stringify(o)); }

function defaultState(){
  return {
    avatar: '🦁',
    points: 0,
    tasks: [
      {id:uid(), name:'完成课后作业', icon:'📖', points:10, penalty:5},
      {id:uid(), name:'阅读30分钟', icon:'📚', points:8, penalty:3},
      {id:uid(), name:'练字一页', icon:'✏️', points:6, penalty:2},
      {id:uid(), name:'口算练习', icon:'🔢', points:6, penalty:2},
      {id:uid(), name:'整理书包', icon:'🎒', points:4, penalty:2},
      {id:uid(), name:'早读20分钟', icon:'🌅', points:5, penalty:2}
    ],
    tempTasks: [],
    gifts: [
      {id:uid(), name:'冰淇淋', icon:'🍦', cost:20},
      {id:uid(), name:'游戏30分钟', icon:'🎮', cost:50},
      {id:uid(), name:'周末看电影', icon:'🎬', cost:80},
      {id:uid(), name:'小玩具', icon:'🛍️', cost:100},
      {id:uid(), name:'神秘大礼', icon:'🎁', cost:200}
    ],
    boxes: [
      {id:uid(), name:'幸运盲盒', icon:'🎁', cost:30, rewards:[
        {type:'points', min:5, max:15, weight:55},
        {type:'points', min:15, max:30, weight:30},
        {type:'gift', giftId:null, weight:10},
        {type:'anygift', weight:5}
      ]}
    ],
    todayCheckins: {},
    history: {},
    lastDate: todayStr(),
    lastDoneDate: null,
    streak: 0,
    bestStreak: 0,
    logs: [],
    inventory: [],
    stats: {earned:0, deducted:0, spent:0, boxes:0},
    sound: true,
    firstDate: todayStr()
  };
}

var state, revision = 0, saveQueue = Promise.resolve(), saveFailed = false;
function storageError(message){ saveFailed=true; var box=document.createElement('div'); box.setAttribute('role','alert'); box.style.cssText='position:fixed;inset:0;z-index:99999;background:#fff6e8;padding:30px;color:#4a3b32;font:16px sans-serif'; box.textContent=message+' 请重新打开应用并核对数据。'; document.body.appendChild(box); }
try {
 var initial=defaultState(); initial.boxes.forEach(b=>b.rewards.forEach(r=>{if(r.type==='gift' && !r.giftId && initial.gifts[0]) r.giftId=initial.gifts[0].id;}));
 await sql('INSERT OR IGNORE INTO study_state (id, document, revision) VALUES (1, ?, 1)',[JSON.stringify(initial)]);
 var row=(await sql('SELECT document, revision FROM study_state WHERE id = 1')).rows[0];
 if(!row) throw Error('数据读取失败'); state=JSON.parse(row.document); revision=Number(row.revision);
 if(!state.history) state.history={}; if(typeof state.bestStreak!=='number') state.bestStreak=0;
} catch(e){ storageError('无法连接或读取云端数据。'); throw e; }
function save(){
 if(saveFailed) return; var snapshot=JSON.stringify(state);
 saveQueue=saveQueue.then(async function(){ if(saveFailed) return; try {
 var result=await sql('UPDATE study_state SET document = ?, revision = revision + 1 WHERE id = 1 AND revision = ?',[snapshot,revision]);
 if(result.affected!==1) throw Error('数据已在其他页面更改'); revision++;
 } catch(e){ storageError('保存未确认或数据已在其他页面更改，当前页面已停止写入。'); } });
}

/* ---------- 等级 ---------- */
var LEVELS = [
  {min:0,   name:'⭐ 学习新星'},
  {min:50,  name:'🌟 进步达人'},
  {min:150, name:'🏆 校园学霸'},
  {min:300, name:'👑 积分王者'},
  {min:600, name:'🚀 传说学神'}
];
function levelOf(p){
  var cur = LEVELS[0], idx = 0;
  for(var i=0;i<LEVELS.length;i++){ if(p >= LEVELS[i].min){ cur = LEVELS[i]; idx = i; } }
  var next = LEVELS[idx+1] || null;
  return {cur:cur, next:next, idx:idx};
}

/* ---------- 每日归档：把当天打卡结果写入历史（永久保留） ---------- */
function archiveDay(d){
  var rec = {date:d, tasks:[], temps:[], updated:timeStr()};
  var earned = 0, deducted = 0, done = 0, miss = 0;
  state.tasks.forEach(function(t){
    var st = state.todayCheckins[t.id] || 'none';
    var delta = st === 'done' ? t.points : (st === 'miss' ? -t.penalty : 0);
    rec.tasks.push({name:t.name, icon:t.icon, status:st, points:delta});
    if(st === 'done'){ done++; earned += t.points; }
    if(st === 'miss'){ miss++; deducted += t.penalty; }
  });
  (state.tempTasks || []).forEach(function(x){
    if(x.date !== d) return;
    rec.temps.push({name:x.name, icon:x.icon, points:x.points, done:!!x.done});
    if(x.done){ done++; earned += x.points; }
  });
  rec.earned = earned; rec.deducted = deducted; rec.net = earned - deducted;
  rec.done = done; rec.miss = miss; rec.total = state.tasks.length;
  state.history[d] = rec;
  return rec;
}
function archiveToday(){ return archiveDay(todayStr()); }
/* 有实际打卡记录的天才算数 */
function hasRecord(r){ return r && (r.done > 0 || r.miss > 0); }

/* ---------- 每日重置：换天时先把昨天归档，再重置今日 ---------- */
function dailyReset(){
  var t = todayStr();
  if(state.lastDate !== t){
    if(state.lastDate) archiveDay(state.lastDate);
    state.todayCheckins = {};
    state.tempTasks = (state.tempTasks || []).filter(function(x){ return x.date === t; });
    state.lastDate = t;
    save();
  }
}
dailyReset();
document.addEventListener('visibilitychange', function(){ if(!document.hidden) dailyReset(); });

/* ---------- 积分操作 ---------- */
function addPoints(delta, text){
  var real = delta;
  if(delta < 0){
    real = -Math.min(state.points, -delta);
  }
  state.points += real;
  if(delta > 0) state.stats.earned += real;
  else state.stats.deducted += (-real);
  state.logs.unshift({t: timeStr(), text: text, delta: real, date: todayStr()});
  if(state.logs.length > 300) state.logs.length = 300;
  save();
  return real;
}
function touchStreak(){
  var t = todayStr();
  if(state.lastDoneDate === t) return;
  var y = new Date(); y.setDate(y.getDate()-1);
  state.streak = (state.lastDoneDate === todayStr(y)) ? state.streak + 1 : 1;
  state.lastDoneDate = t;
  if(state.streak > (state.bestStreak || 0)) state.bestStreak = state.streak;
}

/* ---------- 音效 ---------- */
var audioCtx = null;
function beep(type){
  if(!state.sound) return;
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    var t = audioCtx.currentTime;
    if(type === 'up'){ o.frequency.setValueAtTime(523,t); o.frequency.setValueAtTime(784,t+.08); }
    else if(type === 'down'){ o.frequency.setValueAtTime(392,t); o.frequency.setValueAtTime(262,t+.1); }
    else { o.frequency.setValueAtTime(660,t); o.frequency.setValueAtTime(880,t+.06); o.frequency.setValueAtTime(1046,t+.12); }
    g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.28);
    o.start(t); o.stop(t+.28);
  }catch(e){}
}

/* ---------- toast / 飘字 / 彩带 ---------- */
var toastTimer = null;
function toast(msg){
  var old = document.querySelector('.toast');
  if(old) old.remove();
  var el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  document.body.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ el.remove(); }, 1800);
}
function floatText(x, y, text, color){
  var el = document.createElement('div');
  el.className = 'float-text'; el.textContent = text;
  el.style.left = x+'px'; el.style.top = y+'px'; el.style.color = color;
  document.body.appendChild(el);
  setTimeout(function(){ el.remove(); }, 1000);
}
function confetti(){
  var colors = ['#FF8A3D','#FFC53D','#4D96FF','#FF6B9D','#3ECF8E','#B48CFF'];
  for(var i=0;i<40;i++){
    (function(i){
      var c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = (Math.random()*100)+'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = (Math.random()*0.35)+'s';
      c.style.setProperty('--x', (Math.random()*100-50)+'px');
      document.body.appendChild(c);
      setTimeout(function(){ c.remove(); }, 2400);
    })(i);
  }
}

/* =====================================================
   渲染
===================================================== */
function switchTab(tab){
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  document.getElementById('page-'+tab).classList.add('active');
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.toggle('active', t.dataset.tab === tab); });
  window.scrollTo(0,0);
  renderAll();
}

function renderHeader(){
  var lv = levelOf(state.points);
  document.getElementById('hp-points').textContent = state.points;
  document.getElementById('hp-streak').textContent = '🔥 连续打卡 ' + state.streak + ' 天';
  document.getElementById('hp-level').textContent = lv.cur.name;
  document.getElementById('home-date').textContent = dateCN();
  document.getElementById('shop-points').textContent = state.points;
  document.getElementById('me-avatar').textContent = state.avatar;
  document.getElementById('me-level').textContent = lv.cur.name + ' · ' + state.points + ' 分';
  var bar = document.getElementById('hp-bar'), txt = document.getElementById('hp-text');
  if(lv.next){
    var lo = lv.cur.min, hi = lv.next.min;
    var pct = Math.min(100, Math.round((state.points - lo) / (hi - lo) * 100));
    bar.style.width = pct + '%';
    txt.textContent = '距离 ' + lv.next.name + ' 还需 ' + (lv.next.min - state.points) + ' 分';
  }else{
    bar.style.width = '100%';
    txt.textContent = '已是最高等级，继续闪耀吧！';
  }
}

function renderHome(){
  var list = document.getElementById('task-list');
  if(!state.tasks.length){
    list.innerHTML = '<div class="empty-tip"><span class="big">📭</span>还没有每日任务<br>去「任务」页添加第一个任务吧</div>';
  }else{
    var html = '';
    state.tasks.forEach(function(t){
      var ck = state.todayCheckins[t.id];
      var cls = ck === 'done' ? ' done' : (ck === 'miss' ? ' missed' : '');
      html += '<div class="task-card'+cls+'">'
        + '<div class="task-icon">'+esc(t.icon)+'</div>'
        + '<div class="task-info"><div class="task-name">'+esc(t.name)+'</div>'
        + '<div class="task-points"><span class="plus">完成 +'+t.points+'</span><span class="minus">未完成 -'+t.penalty+'</span></div></div>';
      if(ck === 'done'){
        html += '<div class="done-tag">✅ 已打卡 +'+t.points+'</div>';
      }else if(ck === 'miss'){
        html += '<div class="miss-tag">😅 未完成 -'+t.penalty+'</div>';
      }else{
        html += '<div class="task-actions">'
          + '<button class="btn-mini btn-done" data-click="doComplete(event,\''+t.id+'\')">✅ 完成</button>'
          + '<button class="btn-mini btn-miss" data-click="doMiss(event,\''+t.id+'\')">未完成</button>'
          + '</div>';
      }
      html += '</div>';
    });
    list.innerHTML = html;
  }
  // 临时任务
  var tl = document.getElementById('temp-list');
  var todayTemps = state.tempTasks.filter(function(x){ return x.date === todayStr(); });
  if(!todayTemps.length){
    tl.innerHTML = '<div style="font-size:12px;color:#B8A88F;font-weight:600;padding:8px 2px 2px">今天还没有临时激励，点下面按钮添加一个吧 ✨</div>';
  }else{
    tl.innerHTML = todayTemps.map(function(t){
      var done = t.done;
      return '<div class="temp-card'+(done?' done':'')+'">'
        + '<div class="task-icon">'+esc(t.icon)+'</div>'
        + '<div class="task-info"><div class="task-name">'+esc(t.name)+' <span style="font-size:10px;color:#D98200;font-weight:800">临时</span></div>'
        + '<div class="task-points"><span class="plus">完成 +'+t.points+'</span></div></div>'
        + (done
            ? '<div class="done-tag">✅ 已得 +'+t.points+'</div>'
            : '<button class="btn-mini btn-done" data-click="doTempDone(event,\''+t.id+'\')">✅ 完成</button>')
        + '<button class="temp-del" data-click="delTemp(\''+t.id+'\')" title="删除">✕</button>'
        + '</div>';
    }).join('');
  }
  // 今日小结
  var got = 0, cut = 0, doneN = 0;
  state.tasks.forEach(function(t){
    if(state.todayCheckins[t.id] === 'done'){ got += t.points; doneN++; }
    if(state.todayCheckins[t.id] === 'miss'){ cut += t.penalty; }
  });
  todayTemps.forEach(function(t){ if(t.done){ got += t.points; doneN++; } });
  document.getElementById('day-summary').innerHTML =
    '📊 今日小结：完成 <b>'+doneN+'</b> 项 · 获得 <b class="plus">+'+got+'</b> 分' +
    (cut ? ' · 扣除 <b class="minus">-'+cut+'</b> 分' : '') +
    ' · 剩余任务 <b>'+(state.tasks.length - state.tasks.filter(function(t){return state.todayCheckins[t.id];}).length)+'</b> 个';
}

function renderTasks(){
  var ml = document.getElementById('manage-list');
  ml.innerHTML = state.tasks.length ? state.tasks.map(function(t){
    return '<div class="manage-item">'
      + '<div class="task-icon">'+esc(t.icon)+'</div>'
      + '<div class="manage-info"><div class="task-name">'+esc(t.name)+'</div>'
      + '<div class="task-points"><span class="plus">+'+t.points+'</span><span class="minus">-'+t.penalty+'</span></div></div>'
      + '<button class="icon-btn" data-click="openTaskModal(\''+t.id+'\')">✏️</button>'
      + '<button class="icon-btn danger" data-click="delTask(\''+t.id+'\')">🗑️</button>'
      + '</div>';
  }).join('') : '<div class="empty-tip"><span class="big">📭</span>还没有每日任务</div>';
  var mt = document.getElementById('manage-temp-list');
  var temps = state.tempTasks.filter(function(x){ return x.date === todayStr(); });
  mt.innerHTML = temps.length ? temps.map(function(t){
    return '<div class="manage-item">'
      + '<div class="task-icon">'+esc(t.icon)+'</div>'
      + '<div class="manage-info"><div class="task-name">'+esc(t.name)+' <span style="font-size:10px;color:#D98200;font-weight:800">临时</span></div>'
      + '<div class="task-points"><span class="plus">+'+t.points+'</span></div></div>'
      + '<button class="icon-btn danger" data-click="delTemp(\''+t.id+'\')">🗑️</button>'
      + '</div>';
  }).join('') : '<div class="empty-tip"><span class="big">⚡</span>今天还没有临时激励任务</div>';
}

function renderShop(){
  var gl = document.getElementById('gift-list');
  gl.innerHTML = state.gifts.length ? state.gifts.map(function(g){
    var can = state.points >= g.cost;
    return '<div class="gift-card">'
      + '<div class="gift-edit"><button data-click="openGiftModal(\''+g.id+'\')">✏️</button><button data-click="delGift(\''+g.id+'\')">🗑️</button></div>'
      + '<div class="gift-icon">'+esc(g.icon)+'</div>'
      + '<div class="gift-name">'+esc(g.name)+'</div>'
      + '<div class="gift-cost">⭐ '+g.cost+' 积分</div>'
      + '<button class="gift-btn'+(can?'':' disabled')+'" data-click="redeemGift(\''+g.id+'\')">'+(can?'兑换':'积分不足')+'</button>'
      + '</div>';
  }).join('') : '<div class="empty-tip" style="grid-column:1/-1"><span class="big">🎁</span>还没有礼物，添加一个吧</div>';

  var bl = document.getElementById('box-list');
  bl.innerHTML = state.boxes.length ? state.boxes.map(function(b){
    var can = state.points >= b.cost;
    var rw = b.rewards || [];
    var kinds = [];
    if(rw.some(function(r){return r.type==='points';})) kinds.push('积分');
    if(rw.some(function(r){return r.type==='gift'||r.type==='anygift';})) kinds.push('礼物');
    return '<div class="box-card">'
      + '<div class="box-icon">'+esc(b.icon)+'</div>'
      + '<div class="box-info">'
      + '<div class="box-name">'+esc(b.name)+'</div>'
      + '<div class="box-rewards">🎲 '+rw.length+' 种奖励 · 可开：'+(kinds.join(' / ')||'暂无')+'</div>'
      + '<div class="box-cost">消耗 '+b.cost+' 积分</div>'
      + '</div>'
      + '<div class="box-actions">'
      + '<button class="open-btn'+(can?'':' disabled')+'" data-click="openBox(\''+b.id+'\')">'+(can?'开盲盒':'积分不足')+'</button>'
      + '<div class="box-edit"><button data-click="openBoxModal(\''+b.id+'\')">✏️</button><button data-click="delBox(\''+b.id+'\')">🗑️</button></div>'
      + '</div></div>';
  }).join('') : '<div class="empty-tip"><span class="big">🎰</span>还没有盲盒，创建一个吧</div>';
}

function renderMe(){
  var sg = document.getElementById('stat-grid');
  var st = state.stats;
  var cards = [
    {icon:'📈', val:st.earned, label:'累计获得积分', color:'#1D9E62'},
    {icon:'📉', val:st.deducted, label:'累计扣除积分', color:'#E05252'},
    {icon:'🛒', val:st.spent, label:'兑换/开盒花费', color:'#2E6FD9'},
    {icon:'🔥', val:state.streak+' 天', label:'连续打卡', color:'#E8860D'}
  ];
  sg.innerHTML = cards.map(function(c){
    return '<div class="stat-card"><div class="stat-icon">'+c.icon+'</div>'
      + '<div class="stat-val" style="color:'+c.color+'">'+c.val+'</div>'
      + '<div class="stat-label">'+c.label+'</div></div>';
  }).join('');

  var ig = document.getElementById('inv-grid');
  ig.innerHTML = state.inventory.length ? state.inventory.map(function(it){
    return '<div class="inv-item"><div class="inv-icon">'+esc(it.icon)+'</div>'
      + '<div class="inv-name">'+esc(it.name)+'</div>'
      + '<button class="inv-use" data-click="useInv(\''+it.id+'\')">使用</button></div>';
  }).join('') : '<div style="grid-column:1/-1;font-size:12px;color:#C4B6A6;font-weight:600;text-align:center;padding:14px 0">仓库空空的，快去商城兑换礼物吧 🎁</div>';

  var ll = document.getElementById('log-list');
  ll.innerHTML = state.logs.length ? state.logs.slice(0,60).map(function(l){
    var cls = l.delta >= 0 ? 'plus' : 'minus';
    var sign = l.delta >= 0 ? '+' : '';
    return '<div class="log-item"><div class="log-delta '+cls+'">'+sign+l.delta+'</div>'
      + '<div class="log-text">'+esc(l.text)+'</div><div class="log-time">'+esc(l.t)+'</div></div>';
  }).join('') : '<div style="font-size:12px;color:#C4B6A6;font-weight:600;text-align:center;padding:14px 0">还没有积分记录</div>';

  document.getElementById('sound-toggle').classList.toggle('on', !!state.sound);
}

/* =====================================================
   历史页：日历 / 趋势 / 明细
===================================================== */
var viewMonth = todayStr().slice(0,7);
var DOW = ['日','一','二','三','四','五','六'];

function dateLabel(ds){
  var p = ds.split('-');
  var dt = new Date(+p[0], +p[1]-1, +p[2]);
  return (+p[1]) + '月' + (+p[2]) + '日 星期' + DOW[dt.getDay()];
}
function changeMonth(step){
  if(step === 0){ viewMonth = todayStr().slice(0,7); }
  else{
    var p = viewMonth.split('-');
    var d = new Date(+p[0], (+p[1]-1) + step, 1);
    viewMonth = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
  }
  renderHistory();
}
function renderHistory(){
  var H = state.history || {};
  var days = Object.keys(H).filter(function(d){ return hasRecord(H[d]); }).sort();

  /* --- 统计 --- */
  var totalDone = 0, totalMiss = 0;
  days.forEach(function(d){ totalDone += H[d].done; totalMiss += H[d].miss; });
  var rate = (totalDone + totalMiss) ? Math.round(totalDone / (totalDone + totalMiss) * 100) : 0;
  document.getElementById('hist-stat').innerHTML = [
    {icon:'📅', val:days.length, label:'累计打卡天数', color:'#2E6FD9'},
    {icon:'✅', val:totalDone, label:'累计完成任务', color:'#1D9E62'},
    {icon:'📊', val:rate+'%', label:'任务完成率', color:'#E8860D'},
    {icon:'🏅', val:(state.bestStreak||0)+' 天', label:'最长连续打卡', color:'#FF5C8A'}
  ].map(function(c){
    return '<div class="stat-card"><div class="stat-icon">'+c.icon+'</div>'
      + '<div class="stat-val" style="color:'+c.color+'">'+c.val+'</div>'
      + '<div class="stat-label">'+c.label+'</div></div>';
  }).join('');

  /* --- 日历 --- */
  var p = viewMonth.split('-');
  var y = +p[0], m = +p[1];
  document.getElementById('cal-title').textContent = y + '年' + m + '月';
  document.getElementById('cal-dows').innerHTML = DOW.map(function(d){
    return '<div class="cal-dow">'+d+'</div>';
  }).join('');
  var startDow = new Date(y, m-1, 1).getDay();
  var dayCount = new Date(y, m, 0).getDate();
  var tStr = todayStr();
  var html = '';
  for(var i=0;i<startDow;i++) html += '<div class="cal-cell empty"></div>';
  for(var dd=1; dd<=dayCount; dd++){
    var ds = y + '-' + String(m).padStart(2,'0') + '-' + String(dd).padStart(2,'0');
    var rec = H[ds];
    var cls = 'cal-cell';
    var dot = '';
    if(hasRecord(rec)){
      cls += rec.net >= 0 ? ' good' : ' warn';
      dot = (rec.net >= 0 ? '+' : '') + rec.net;
    }
    if(ds === tStr) cls += ' today';
    html += '<div class="'+cls+'"'+(hasRecord(rec)?' data-click="openDayModal(\''+ds+'\')"':'')+'>'
      + '<div class="cal-num">'+dd+'</div><div class="cal-dot">'+(dot||'·')+'</div></div>';
  }
  document.getElementById('cal-grid').innerHTML = html;

  /* --- 最近 7 天趋势 --- */
  var last7 = [], maxV = 1;
  for(var k=6;k>=0;k--){
    var dt = new Date(); dt.setDate(dt.getDate()-k);
    var dk = todayStr(dt);
    var r = H[dk], net = hasRecord(r) ? r.net : 0;
    last7.push({key:dk, net:net, label:(k===0?'今天':DOW[dt.getDay()])});
    if(Math.abs(net) > maxV) maxV = Math.abs(net);
  }
  document.getElementById('trend').innerHTML = last7.map(function(x){
    var h = x.net === 0 ? 0 : Math.max(6, Math.round(Math.abs(x.net)/maxV*62));
    var cls = x.net > 0 ? '' : (x.net < 0 ? ' neg' : ' zero');
    var col = x.net > 0 ? '#1D9E62' : (x.net < 0 ? '#E05252' : '#C9BCA9');
    return '<div class="trend-col" data-click="openDayModal(\''+x.key+'\')">'
      + '<div class="trend-val" style="color:'+col+'">'+(x.net>0?'+':'')+x.net+'</div>'
      + '<div class="trend-bar '+cls+'" style="height:'+h+'px"></div>'
      + '<div class="trend-label">'+x.label+'</div></div>';
  }).join('');

  /* --- 历史明细（按月分组，倒序） --- */
  var groups = {};
  days.slice().reverse().forEach(function(d){
    var gk = d.slice(0,7);
    (groups[gk] = groups[gk] || []).push(d);
  });
  var listHtml = '';
  Object.keys(groups).sort().reverse().forEach(function(gk){
    var gp = gk.split('-');
    listHtml += '<div class="hist-mtitle">'+gp[0]+'年'+(+gp[1])+'月 · 共 '+groups[gk].length+' 天</div>';
    groups[gk].forEach(function(d){
      var r = H[d];
      var dt = new Date(+d.split('-')[0], +d.split('-')[1]-1, +d.split('-')[2]);
      listHtml += '<div class="hist-row" data-click="openDayModal(\''+d+'\')">'
        + '<div class="hist-date">'+(+d.split('-')[1])+'月'+(+d.split('-')[2])+'日<span>周'+DOW[dt.getDay()]+'</span></div>'
        + '<div class="hist-stat">✅ '+r.done+' 项'+(r.miss?' · ❌ '+r.miss+' 项':'')+' · 共 '+r.total+' 项</div>'
        + '<div class="hist-net '+(r.net>=0?'plus':'minus')+'">'+(r.net>=0?'+':'')+r.net+'</div></div>';
    });
  });
  document.getElementById('hist-list').innerHTML = listHtml ||
    '<div class="empty-tip" style="margin-top:16px"><span class="big">📅</span>还没有历史记录<br>今天去打卡，这里就会留下第一条记录啦</div>';
}
function openDayModal(ds){
  var r = (state.history||{})[ds];
  if(!r || !hasRecord(r)){ toast('这一天还没有打卡记录'); return; }
  document.getElementById('day-modal-title').textContent = dateLabel(ds);
  var items = r.tasks.map(function(t){
    var tag = t.status === 'done'
      ? '<div class="di-tag" style="background:#E9F9F0;color:#1D9E62">✅ 完成 +'+t.points+'</div>'
      : (t.status === 'miss'
          ? '<div class="di-tag" style="background:#FFEFEF;color:#E05252">❌ 未完成 '+t.points+'</div>'
          : '<div class="di-tag" style="background:#F5EFE4;color:#B0A597">⚪ 未打卡</div>');
    return '<div class="day-item"><div class="di-icon">'+esc(t.icon)+'</div>'
      + '<div class="di-name">'+esc(t.name)+'</div>'+tag+'</div>';
  }).join('');
  var temps = (r.temps||[]).length ? '<div class="hist-mtitle" style="padding-left:0">⚡ 临时激励</div>' + r.temps.map(function(x){
    return '<div class="day-item"><div class="di-icon">'+esc(x.icon)+'</div>'
      + '<div class="di-name">'+esc(x.name)+'</div>'
      + (x.done ? '<div class="di-tag" style="background:#E9F9F0;color:#1D9E62">✅ 完成 +'+x.points+'</div>'
                : '<div class="di-tag" style="background:#F5EFE4;color:#B0A597">⚪ 未完成</div>')
      + '</div>';
  }).join('') : '';
  document.getElementById('day-detail').innerHTML =
    '<div class="day-head"><div class="day-date">'+dateLabel(ds)+'</div>'
    + '<div class="day-net '+(r.net>=0?'plus':'minus')+'" style="color:'+(r.net>=0?'#1D9E62':'#E05252')+'">'+(r.net>=0?'+':'')+r.net+' 分</div>'
    + '<div class="day-sub">完成任务 '+r.done+' 项'+(r.miss?' · 未完成 '+r.miss+' 项':'')+' · 获得 '+r.earned+' 分'+(r.deducted?' · 扣除 '+r.deducted+' 分':'')+'</div></div>'
    + items + temps;
  openModalEl('mask-day');
}

function renderAll(){
  archiveToday(); save();
  renderHeader(); renderHome(); renderTasks(); renderShop(); renderMe(); renderHistory();
}

/* =====================================================
   打卡逻辑
===================================================== */
function doComplete(e, id){
  var t = state.tasks.find(function(x){ return x.id === id; });
  if(!t || state.todayCheckins[id]) return;
  state.todayCheckins[id] = 'done';
  var real = addPoints(t.points, '完成打卡：' + t.name);
  touchStreak();
  save(); renderAll();
  var r = e.currentTarget.getBoundingClientRect();
  floatText(r.left + r.width/2, r.top, '+' + real, '#22B573');
  beep('up'); toast('太棒了！+' + real + ' 分 🎉');
}
function doMiss(e, id){
  var t = state.tasks.find(function(x){ return x.id === id; });
  if(!t || state.todayCheckins[id]) return;
  state.todayCheckins[id] = 'miss';
  var real = addPoints(-t.penalty, '未完成：' + t.name);
  save(); renderAll();
  var r = e.currentTarget.getBoundingClientRect();
  floatText(r.left + r.width/2, r.top, '-' + (-real), '#E05252');
  beep('down');
  toast('记下了，明天加油！-' + (-real) + ' 分');
}
function doTempDone(e, id){
  var t = state.tempTasks.find(function(x){ return x.id === id; });
  if(!t || t.done) return;
  t.done = true;
  var real = addPoints(t.points, '临时激励：' + t.name);
  touchStreak();
  save(); renderAll();
  var r = e.currentTarget.getBoundingClientRect();
  floatText(r.left + r.width/2, r.top, '+' + real, '#22B573');
  beep('up'); confetti(); toast('额外奖励到手！+' + real + ' 分 ✨');
}
function delTemp(id){
  openConfirm('删除临时任务？', '删除后今天就看不到它了', '🗑️', function(){
    state.tempTasks = state.tempTasks.filter(function(x){ return x.id !== id; });
    save(); renderAll(); toast('已删除');
  });
}

/* =====================================================
   任务 / 临时 / 礼物 编辑
===================================================== */
var EMOJIS = {
  task: ['📖','📚','✏️','🔢','🧮','📝','🎒','🌅','⏰','🏃','⚽','🎨','🎵','🪥','🛏️','🍎','💧','🧹','🐕','🌍','🔬','💻','🚴','🥗','😴','📵','🎯','🧩','🏊','🍳'],
  gift: ['🍦','🎮','🎬','🛍️','🎁','🧸','🚲','⚽','🎨','🍰','🍕','🐰','📱','🎧','🕹️','🧃','🍫','🎢','🏖️','👟','🪁','🎂','🍿','🏈','🪀','📚','🌻','💐'],
  box:  ['🎁','🎰','✨','🎉','💝','🎊','🪄','💎','🏆','⭐','🌈','🍀'],
  avatar: ['🦁','🐼','🐯','🐨','🐸','🐵','🦄','🐶','🐱','🐰','🦊','🐷']
};
function renderEmojiGrid(boxId, key, current, onPick){
  var box = document.getElementById(boxId);
  box.innerHTML = '';
  EMOJIS[key].forEach(function(em){
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'emoji-cell' + (em === current ? ' sel' : ''); b.textContent = em;
    b.onclick = function(){ onPick(em); renderEmojiGrid(boxId, key, em, onPick); };
    box.appendChild(b);
  });
}
function openModalEl(id){ document.getElementById(id).classList.add('show'); }
function closeModal(){ document.querySelectorAll('.modal-mask').forEach(function(m){ m.classList.remove('show'); }); }

var draftTask = null;
function openTaskModal(id){
  var t = id ? state.tasks.find(function(x){ return x.id === id; }) : null;
  draftTask = t ? deep(t) : {id:null, name:'', icon:'📖', points:10, penalty:5};
  document.getElementById('task-modal-title').textContent = t ? '编辑每日任务' : '添加每日任务';
  document.getElementById('task-name').value = draftTask.name;
  document.getElementById('task-points').value = draftTask.points;
  document.getElementById('task-penalty').value = draftTask.penalty;
  document.getElementById('task-del-btn').style.display = t ? 'block' : 'none';
  renderEmojiGrid('task-emoji','task',draftTask.icon,function(em){ draftTask.icon = em; });
  openModalEl('mask-task');
}
function saveTask(){
  var name = document.getElementById('task-name').value.trim();
  var p = parseInt(document.getElementById('task-points').value, 10);
  var pen = parseInt(document.getElementById('task-penalty').value, 10);
  if(!name){ toast('给任务起个名字吧'); return; }
  if(!(p > 0)){ toast('完成得分要大于 0'); return; }
  if(!(pen >= 0)) pen = 0;
  draftTask.name = name; draftTask.points = p; draftTask.penalty = pen;
  if(draftTask.id){
    var t = state.tasks.find(function(x){ return x.id === draftTask.id; });
    if(t){ t.name = name; t.icon = draftTask.icon; t.points = p; t.penalty = pen; }
  }else{
    draftTask.id = uid();
    state.tasks.push(deep(draftTask));
  }
  save(); renderAll(); closeModal(); beep('up');
  toast(draftTask.id && state.todayCheckins[draftTask.id] ? '任务已更新' : '任务保存成功 ✅');
}

function openTempModal(){
  document.getElementById('temp-name').value = '';
  document.getElementById('temp-points').value = 10;
  renderEmojiGrid('temp-emoji','task','⭐',function(){});
  openModalEl('mask-temp');
}
function saveTemp(){
  var name = document.getElementById('temp-name').value.trim();
  var p = parseInt(document.getElementById('temp-points').value, 10);
  if(!name){ toast('给激励起个名字吧'); return; }
  if(!(p > 0)){ toast('奖励积分要大于 0'); return; }
  state.tempTasks.push({id:uid(), name:name, icon:'⭐', points:p, date:todayStr(), done:false});
  save(); renderAll(); closeModal(); beep('up'); toast('临时激励已添加 ⚡');
}

var draftGift = null;
function openGiftModal(id){
  var g = id ? state.gifts.find(function(x){ return x.id === id; }) : null;
  draftGift = g ? deep(g) : {id:null, name:'', icon:'🎁', cost:20};
  document.getElementById('gift-modal-title').textContent = g ? '编辑礼物' : '添加礼物';
  document.getElementById('gift-name').value = draftGift.name;
  document.getElementById('gift-cost').value = draftGift.cost;
  document.getElementById('gift-del-btn').style.display = g ? 'block' : 'none';
  renderEmojiGrid('gift-emoji','gift',draftGift.icon,function(em){ draftGift.icon = em; });
  openModalEl('mask-gift');
}
function saveGift(){
  var name = document.getElementById('gift-name').value.trim();
  var c = parseInt(document.getElementById('gift-cost').value, 10);
  if(!name){ toast('给礼物起个名字吧'); return; }
  if(!(c > 0)){ toast('所需积分要大于 0'); return; }
  draftGift.name = name; draftGift.cost = c;
  if(draftGift.id){
    var g = state.gifts.find(function(x){ return x.id === draftGift.id; });
    if(g){ g.name = name; g.icon = draftGift.icon; g.cost = c; }
  }else{
    draftGift.id = uid();
    state.gifts.push(deep(draftGift));
  }
  save(); renderAll(); closeModal(); beep('up'); toast('礼物保存成功 🎁');
}

/* ---------- 删除 ---------- */
function delTask(id){
  var t = state.tasks.find(function(x){ return x.id === id; });
  openConfirm('删除每日任务？', '「'+(t?t.name:'')+'」将被移除', '🗑️', function(){
    state.tasks = state.tasks.filter(function(x){ return x.id !== id; });
    delete state.todayCheckins[id];
    save(); renderAll(); closeModal(); toast('已删除');
  });
}
function delGift(id){
  var g = state.gifts.find(function(x){ return x.id === id; });
  openConfirm('删除礼物？', '「'+(g?g.name:'')+'」将从商城移除', '🗑️', function(){
    state.gifts = state.gifts.filter(function(x){ return x.id !== id; });
    save(); renderAll(); closeModal(); toast('已删除');
  });
}
function delBox(id){
  var b = state.boxes.find(function(x){ return x.id === id; });
  openConfirm('删除盲盒？', '「'+(b?b.name:'')+'」将被移除', '🗑️', function(){
    state.boxes = state.boxes.filter(function(x){ return x.id !== id; });
    save(); renderAll(); closeModal(); toast('已删除');
  });
}

/* ---------- 兑换礼物 ---------- */
function redeemGift(id){
  var g = state.gifts.find(function(x){ return x.id === id; });
  if(!g) return;
  if(state.points < g.cost){ toast('积分还不够，继续加油！'); return; }
  openConfirm('兑换 ' + g.name + '？', '将花费 ' + g.cost + ' 积分', g.icon, function(){
    state.points -= g.cost; state.stats.spent += g.cost;
    state.logs.unshift({t:timeStr(), text:'兑换礼物：'+g.name, delta:-g.cost, date:todayStr()});
    state.inventory.unshift({id:uid(), giftId:g.id, name:g.name, icon:g.icon, t:todayStr()});
    save(); renderAll(); closeModal(); beep('up'); confetti();
    toast('兑换成功！' + g.icon + ' ' + g.name + ' 已入库');
  });
}
function useInv(id){
  var it = state.inventory.find(function(x){ return x.id === id; });
  openConfirm('使用 ' + (it?it.name:'礼物') + '？', '使用后会从仓库移除', it?it.icon:'🎁', function(){
    state.inventory = state.inventory.filter(function(x){ return x.id !== id; });
    state.logs.unshift({t:timeStr(), text:'使用了礼物：'+(it?it.name:''), delta:0, date:todayStr()});
    save(); renderAll(); closeModal(); beep('up');
    toast('玩得开心！' + (it?it.icon:''));
  });
}

/* =====================================================
   盲盒
===================================================== */
var draftBox = null;
function openBoxModal(id){
  var b = id ? state.boxes.find(function(x){ return x.id === id; }) : null;
  draftBox = b ? deep(b) : {id:null, name:'', icon:'🎁', cost:30, rewards:[{type:'points', min:5, max:15, weight:50}]};
  document.getElementById('box-modal-title').textContent = b ? '编辑盲盒' : '创建礼物盲盒';
  document.getElementById('box-name').value = draftBox.name;
  document.getElementById('box-cost').value = draftBox.cost;
  document.getElementById('box-del-btn').style.display = b ? 'block' : 'none';
  renderEmojiGrid('box-emoji','box',draftBox.icon,function(em){ draftBox.icon = em; });
  renderRewards();
  openModalEl('mask-box');
}
function giftOptions(selId){
  return '<option value="">（请选择礼物）</option>' + state.gifts.map(function(g){
    return '<option value="'+g.id+'"'+(g.id===selId?' selected':'')+'>'+esc(g.icon+' '+g.name)+'</option>';
  }).join('');
}
function renderRewards(){
  var box = document.getElementById('reward-list');
  var total = draftBox.rewards.reduce(function(s,r){ return s + (r.weight||0); }, 0) || 1;
  box.innerHTML = draftBox.rewards.map(function(r, i){
    var prob = Math.round((r.weight||0)/total*100);
    var inner = '';
    if(r.type === 'points'){
      inner = '<div class="reward-fields"><span>随机</span>'
        + '<input type="number" min="0" value="'+r.min+'" data-change="onRewardChange('+i+',\'min\',this.value)">'
        + '<span>~</span>'
        + '<input type="number" min="0" value="'+r.max+'" data-change="onRewardChange('+i+',\'max\',this.value)">'
        + '<span>积分</span></div>';
    }else if(r.type === 'gift'){
      inner = '<div class="reward-fields"><select data-change="onRewardChange('+i+',\'giftId\',this.value)">'+giftOptions(r.giftId)+'</select></div>';
    }else{
      inner = '<div class="reward-fields"><span>🎁 从礼物库随机任选一个</span></div>';
    }
    return '<div class="reward-row"><div class="reward-top">'
      + '<select data-change="onRewardChange('+i+',\'type\',this.value)">'
      + '<option value="points"'+(r.type==='points'?' selected':'')+'>💰 积分奖励</option>'
      + '<option value="gift"'+(r.type==='gift'?' selected':'')+'>🎁 指定礼物</option>'
      + '<option value="anygift"'+(r.type==='anygift'?' selected':'')+'>✨ 随机礼物</option>'
      + '</select>'
      + '<span style="font-size:12px;font-weight:800;color:#9C8E82">权重</span>'
      + '<input type="number" min="1" value="'+(r.weight||1)+'" style="width:56px" data-change="onRewardChange('+i+',\'weight\',this.value)">'
      + '<button class="reward-del" data-click="delReward('+i+')">✕</button>'
      + '</div>' + inner
      + '<div class="reward-fields" style="margin-top:6px"><span class="reward-prob">中奖概率约 '+prob+'%</span></div>'
      + '</div>';
  }).join('') || '<div style="font-size:12px;color:#C4B6A6;font-weight:600;text-align:center;padding:10px 0">还没有奖励，点下面按钮添加</div>';
}
function onRewardChange(i, field, val){
  var r = draftBox.rewards[i];
  if(field === 'type'){
    r.type = val;
    if(val === 'points'){ r.min = 5; r.max = 15; }
    if(val === 'gift'){ r.giftId = state.gifts[0] ? state.gifts[0].id : null; }
    else { delete r.giftId; }
  }else if(field === 'weight'){ r.weight = Math.max(1, parseInt(val,10) || 1); }
  else if(field === 'min'){ r.min = Math.max(0, parseInt(val,10) || 0); if(r.max < r.min) r.max = r.min; }
  else if(field === 'max'){ r.max = Math.max(0, parseInt(val,10) || 0); if(r.min > r.max) r.min = r.max; }
  else if(field === 'giftId'){ r.giftId = val; }
  renderRewards();
}
function addReward(){
  draftBox.rewards.push({type:'points', min:5, max:15, weight:20});
  renderRewards();
}
function delReward(i){
  draftBox.rewards.splice(i,1);
  renderRewards();
}
function saveBox(){
  var name = document.getElementById('box-name').value.trim();
  var cost = parseInt(document.getElementById('box-cost').value, 10);
  if(!name){ toast('给盲盒起个名字吧'); return; }
  if(!(cost > 0)){ toast('开启积分要大于 0'); return; }
  if(!draftBox.rewards.length){ toast('至少添加 1 种奖励'); return; }
  draftBox.name = name; draftBox.cost = cost;
  if(draftBox.id){
    var b = state.boxes.find(function(x){ return x.id === draftBox.id; });
    if(b){ b.name = name; b.icon = draftBox.icon; b.cost = cost; b.rewards = deep(draftBox.rewards); }
  }else{
    draftBox.id = uid();
    state.boxes.push(deep(draftBox));
  }
  save(); renderAll(); closeModal(); beep('up'); toast('盲盒保存成功 🎰');
}

/* ---------- 开盲盒 ---------- */
var currentBox = null;
function openBox(id){
  var b = state.boxes.find(function(x){ return x.id === id; });
  if(!b) return;
  if(state.points < b.cost){ toast('积分不足，先去做任务赚分吧'); return; }
  if(!b.rewards || !b.rewards.length){ toast('这个盲盒还没有奖励，先编辑一下'); return; }
  currentBox = b;
  document.getElementById('open-box-emoji').textContent = b.icon;
  document.getElementById('open-box-emoji').classList.remove('shake');
  document.getElementById('open-tip').textContent = '「' + b.name + '」要花 ' + b.cost + ' 积分，准备好啦！';
  document.getElementById('open-result').innerHTML = '';
  var btn = document.getElementById('open-btn');
  btn.textContent = '🎉 开启盲盒';
  btn.onclick = doOpenBox;
  btn.style.display = 'block';
  openModalEl('mask-open');
}
function doOpenBox(){
  var b = currentBox;
  if(!b) return;
  if(state.points < b.cost){ toast('积分不足'); closeModal(); return; }
  var btn = document.getElementById('open-btn');
  btn.style.display = 'none';
  var emoji = document.getElementById('open-box-emoji');
  emoji.classList.add('shake');
  document.getElementById('open-tip').textContent = '盒子摇摇晃晃…';
  setTimeout(function(){
    // 扣积分
    state.points -= b.cost; state.stats.spent += b.cost; state.stats.boxes += 1;
    // 加权随机
    var total = b.rewards.reduce(function(s,r){ return s + (r.weight||0); }, 0);
    var roll = Math.random() * total, pick = b.rewards[b.rewards.length-1];
    for(var i=0;i<b.rewards.length;i++){
      roll -= (b.rewards[i].weight||0);
      if(roll <= 0){ pick = b.rewards[i]; break; }
    }
    var resEl = document.getElementById('open-result');
    emoji.classList.remove('shake');
    if(pick.type === 'points'){
      var lo = Math.min(pick.min, pick.max), hi = Math.max(pick.min, pick.max);
      var gain = lo + Math.floor(Math.random() * (hi - lo + 1));
      state.points += gain; state.stats.earned += gain;
      state.logs.unshift({t:timeStr(), text:'开盲盒「'+b.name+'」获得积分', delta:gain - b.cost, date:todayStr()});
      resEl.innerHTML = '<div class="result-points">+' + gain + ' 积分</div><div class="result-sub">积分已到账，运气不错！</div>';
      beep('up'); confetti();
    }else{
      var gift = null;
      if(pick.type === 'gift'){
        gift = state.gifts.find(function(g){ return g.id === pick.giftId; });
      }
      if(!gift && state.gifts.length){
        gift = state.gifts[Math.floor(Math.random() * state.gifts.length)];
      }
      if(gift){
        state.inventory.unshift({id:uid(), giftId:gift.id, name:gift.name, icon:gift.icon, t:todayStr()});
        state.logs.unshift({t:timeStr(), text:'开盲盒「'+b.name+'」开出礼物', delta:-b.cost, date:todayStr()});
        resEl.innerHTML = '<div class="result-gift"><div class="result-emoji">'+esc(gift.icon)+'</div>'
          + '<div class="result-name">'+esc(gift.name)+'</div>'
          + '<div class="result-sub">已放入礼物仓库 🎒</div></div>';
      }else{
        state.points += b.cost;
        state.logs.unshift({t:timeStr(), text:'开盲盒「'+b.name+'」返还积分', delta:0, date:todayStr()});
        resEl.innerHTML = '<div class="result-points">+' + b.cost + ' 积分</div><div class="result-sub">礼物库空空的，积分退还你</div>';
      }
      beep('up'); confetti();
    }
    save(); renderAll();
    document.getElementById('open-tip').textContent = '🎊 恭喜恭喜！';
    btn.textContent = '开心收下 🥳';
    btn.onclick = function(){ closeModal(); };
    btn.style.display = 'block';
  }, 1100);
}

/* =====================================================
   确认弹窗 / 头像 / 设置
===================================================== */
var pendingOk = null;
function openConfirm(title, msg, icon, onOk){
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  document.getElementById('confirm-icon').textContent = icon || '🤔';
  pendingOk = onOk;
  document.getElementById('confirm-ok').onclick = function(){
    if(pendingOk) pendingOk();
    pendingOk = null;
  };
  openModalEl('mask-confirm');
}
function openAvatarModal(){
  renderEmojiGrid('avatar-emoji','avatar',state.avatar,function(em){
    state.avatar = em; save(); renderHeader();
    document.getElementById('me-avatar').textContent = em;
    document.querySelectorAll('#avatar-emoji .emoji-cell').forEach(function(c){
      c.classList.toggle('sel', c.textContent === em);
    });
  });
  openModalEl('mask-avatar');
}
function toggleSound(){
  state.sound = !state.sound; save(); renderMe();
  toast(state.sound ? '音效已开启 🔔' : '音效已关闭 🔕');
}
function exportData(){
  try{
    var blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '积分乐园备份_' + todayStr() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    toast('备份文件已下载 📤');
  }catch(e){ toast('导出失败，请重试'); }
}
function importData(input){
  var f = input.files && input.files[0];
  if(!f) return;
  var r = new FileReader();
  r.onload = function(){
    try{
      var d = JSON.parse(r.result);
      if(!d || typeof d.points !== 'number' || !Array.isArray(d.tasks)){ toast('文件格式不正确'); return; }
      openConfirm('导入备份？', '当前数据将被备份文件覆盖', '📥', function(){
        var def = defaultState();
        state = Object.assign(def, d);
        if(!state.todayCheckins) state.todayCheckins = {};
        save(); dailyReset(); renderAll(); closeModal();
        toast('导入成功 ✅');
      });
    }catch(e){ toast('文件读取失败'); }
  };
  r.readAsText(f);
  input.value = '';
}
function resetAll(){
  openConfirm('重置所有数据？', '积分、任务、礼物、记录都会清空，建议先导出备份', '⚠️', function(){
    state = defaultState();
    save(); dailyReset(); renderAll(); closeModal();
    toast('已重置，重新开始吧 🌱');
  });
}

/* =====================================================
   初始化
===================================================== */
function tickTime(){
  var d = new Date();
  document.getElementById('sb-time').textContent = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}
tickTime(); setInterval(tickTime, 10000);
renderAll();
// Inline controls are evaluated in the window scope while the entry is a module.
Object.assign(window,{doComplete,doMiss,doTempDone,delTemp,openTaskModal,delTask,openGiftModal,delGift,redeemGift,openBox,openBoxModal,delBox,useInv,openDayModal,onRewardChange,delReward,openTempModal,changeMonth,openAvatarModal,toggleSound,exportData,resetAll,importData,switchTab,closeModal,saveTask,saveTemp,saveGift,addReward,saveBox,doOpenBox});
Object.defineProperties(window,{draftTask:{get:()=>draftTask},draftGift:{get:()=>draftGift},draftBox:{get:()=>draftBox}});

// Route declarative controls without inline script, compatible with hosted CSP.
const actions={doComplete,doMiss,doTempDone,delTemp,openTaskModal,delTask,openGiftModal,delGift,redeemGift,openBox,openBoxModal,delBox,useInv,openDayModal,onRewardChange,delReward,openTempModal,changeMonth,openAvatarModal,toggleSound,exportData,resetAll,importData,switchTab,closeModal,saveTask,saveTemp,saveGift,addReward,saveBox,doOpenBox};
function dispatchControl(e,attr){
 const el=e.target.closest('['+attr+']'); if(!el)return;
 const expression=el.getAttribute(attr);
 if(expression==='if(event.target===this)closeModal()'){if(e.target===el)closeModal();return;}
 if(expression==="document.getElementById('import-file').click()"){document.getElementById('import-file').click();return;}
 const match=expression.match(/^([A-Za-z]+)\((.*)\)$/);if(!match || !actions[match[1]])return;
 const args=match[2]?match[2].split(',').map(raw=>{const x=raw.trim();if(x==='event')return {currentTarget:el};if(x==='this')return el;if(x==='this.value')return el.value;if(x==='draftTask.id')return draftTask.id;if(x==='draftGift.id')return draftGift.id;if(x==='draftBox.id')return draftBox.id;if(/^['"].*['"]$/.test(x))return x.slice(1,-1);return Number(x);}):[];
 actions[match[1]](...args);
}
document.addEventListener('click',e=>dispatchControl(e,'data-click'));
document.addEventListener('change',e=>dispatchControl(e,'data-change'));
