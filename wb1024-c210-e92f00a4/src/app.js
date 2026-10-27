
(function(){
"use strict";
var KEY = 'deskMate.v1';
var $ = function(id){ return document.getElementById(id); };
var CIRC = 339.29;

/* ---------- storage ---------- */
var DEF = {
  sit:{ interval:45, enabled:true, paused:false, startAt:Date.now(), stand:0, day:'', nextFire:0 },
  water:{ interval:60, enabled:true, paused:false, lastAt:Date.now(), count:0, ml:0, day:'', nextFire:0 },
  goal:8, cup:250,
  work:{ on:false, s:'09:00', e:'18:30' },
  dnd:{ on:true, s:'12:30', e:'13:30' },
  punch:{ days:{}, notify:true },
  sound:true, notify:false,
  todos:[]
};
var S = load();

function load(){
  try{
    var raw = localStorage.getItem(KEY);
    if(!raw) return clone(DEF);
    var o = JSON.parse(raw);
    var d = clone(DEF);
    if(o.sit) for(var k in d.sit) if(o.sit[k]!==undefined) d.sit[k]=o.sit[k];
    if(o.water) for(var k2 in d.water) if(o.water[k2]!==undefined) d.water[k2]=o.water[k2];
    if(o.work) for(var k3 in d.work) if(o.work[k3]!==undefined) d.work[k3]=o.work[k3];
    if(o.dnd) for(var k4 in d.dnd) if(o.dnd[k4]!==undefined) d.dnd[k4]=o.dnd[k4];
    if(o.punch){ d.punch = Object.assign({}, d.punch, o.punch); }
    ['goal','cup','sound','notify'].forEach(function(p){ if(o[p]!==undefined) d[p]=o[p]; });
    if(Array.isArray(o.todos)) d.todos = o.todos;
    return d;
  }catch(e){ return clone(DEF); }
}
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function save(){
  try{
    // 清理空记录与一年前的历史，避免 localStorage 无限膨胀
    var cd = new Date(Date.now() - 400*86400000);
    var cutKey = cd.getFullYear() + '-' + pad(cd.getMonth()+1) + '-' + pad(cd.getDate());
    var ks = Object.keys(S.punch.days);
    for(var i=0;i<ks.length;i++){
      var r = S.punch.days[ks[i]];
      var empty = !r.up && !r.down && !r.upSkip && !r.downSkip &&
                  (r.upSnooze === undefined || r.upSnooze === null) &&
                  (r.downSnooze === undefined || r.downSnooze === null);
      if(empty || ks[i] < cutKey) delete S.punch.days[ks[i]];
    }
    localStorage.setItem(KEY, JSON.stringify(S));
  }
  catch(e){ toast('保存失败：浏览器存储不可用'); }
}
function today(){
  var d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
}
function pad(n){ return n<10 ? '0'+n : ''+n; }
/* 数字+单位的显示统一走这里，避免字符串拼 HTML */
function setNum(id, main, unit){
  var el = $(id);
  while(el.firstChild) el.removeChild(el.firstChild);
  el.appendChild(document.createTextNode(String(main)));
  if(unit){
    var s = document.createElement('small');
    s.textContent = unit;
    el.appendChild(s);
  }
}
function clear(el){ while(el.firstChild) el.removeChild(el.firstChild); }
function hhmmss(d){
  return pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
}

/* daily reset */
function rollDay(){
  var t = today();
  if(S.sit.day !== t){ S.sit.day = t; S.sit.stand = 0; S.sit.startAt = Date.now(); S.sit.nextFire = 0; }
  if(S.water.day !== t){ S.water.day = t; S.water.count = 0; S.water.ml = 0; S.water.lastAt = Date.now(); S.water.nextFire = 0; }
  // 逾期未完成待办跨天不提醒
  S.todos.forEach(function(o){ if(o.fired && o.dueDay !== t) o.fired = false; });
}
rollDay();

/* ---------- time helpers ---------- */
function nowMin(){
  var d = new Date();
  return d.getHours()*60 + d.getMinutes();
}
function toMin(s){
  if(!s) return 0;
  var p = String(s).split(':');
  return (parseInt(p[0],10)||0)*60 + (parseInt(p[1],10)||0);
}

/* ---------- punch ---------- */
function dayRec(d){
  var k = d || today();
  if(!S.punch.days[k]) S.punch.days[k] = {up:'', down:''};
  var r = S.punch.days[k];
  if(!r.up) r.up = '';
  if(!r.down) r.down = '';
  return r;
}
function isWeekend(){
  var w = new Date().getDay();
  return w === 0 || w === 6;
}
function fmtDur(min){
  min = Math.max(0, Math.round(min));
  var h = Math.floor(min/60), m = min%60;
  return (h ? h+' 小时' : '') + (m || !h ? m+' 分' : '');
}
function firePunch(kind){
  var rec = dayRec();
  var isUp = kind === 'up';
  if(isUp && rec.up){ toast('今天已经打过上班卡了'); return; }
  if(!isUp && rec.down){ toast('今天已经打过下班卡了'); return; }
  var now = hhmmss(new Date()).slice(0,5);
  beep(isUp ? 'sit' : 'todo');
  notify(isUp ? '该上班了' : '该下班了', isUp ? '上班时间 ' + S.work.s + '，记得打卡。' : '下班时间 ' + S.work.e + '，今天辛苦了，打个卡吧。');
  showModal({
    icon: isUp ? '🌅' : '🌆',
    bg: isUp ? 'var(--sit-soft)' : 'var(--todo-soft)',
    title: isUp ? '上班打卡时间到' : '下班打卡时间到',
    body: isUp
      ? ('设定上班时间为 ' + S.work.s + '。确认到岗后打卡，系统会记录本次出勤。')
      : ('设定下班时间为 ' + S.work.e + '。确认离开工位后打卡，今日工时会自动结算。'),
    btns:[
      {key:'ok', label: isUp ? '打卡上班' : '打卡下班', color: isUp ? 'var(--sit)' : 'var(--todo)'},
      {key:'later', label: isUp ? '5 分钟后' : '15 分钟后', ghost:true},
      {key:'close', label:'今天不打卡', ghost:true}
    ]
  });
  modalCb = function(k){
    if(k === 'ok'){ punchNow(kind); }
    else if(k === 'later'){
      var t = isUp ? 5 : 15;
      rec[isUp ? 'upSnooze' : 'downSnooze'] = nowMin() + t;
      save();
    } else {
      rec[isUp ? 'upSkip' : 'downSkip'] = today();
      save();
    }
    renderPunch();
  };
}
function punchNow(kind){
  var rec = dayRec();
  var now = hhmmss(new Date()).slice(0,5);
  if(kind === 'up'){ rec.up = now; delete rec.upSnooze; delete rec.upSkip; }
  else { rec.down = now; delete rec.downSnooze; delete rec.downSkip; }
  save(); renderPunch();
  toast(kind === 'up' ? '🌅 上班打卡成功 '+now : '🌆 下班打卡成功 '+now);
  beep('water');
}
function checkPunch(){
  if(isWeekend() || !S.punch.notify) return;
  var rec = dayRec();
  if(rec.up) rec.upSnooze = undefined;
  if(rec.down) rec.downSnooze = undefined;
  // 打卡只在午休免打扰时段内静默，不受"工作时间"限制
  if(S.dnd.on){
    var a = toMin(S.dnd.s), b = toMin(S.dnd.e), nn = nowMin();
    if(a<=b){ if(nn>=a && nn<b) return; }
    else { if(nn>=a || nn<b) return; }
  }
  var n = nowMin(), t = today();
  var s = toMin(S.work.s), e = toMin(S.work.e);
  // 上班：到点后 2 分钟起，30 分钟内未打卡则提醒一次
  if(!rec.up && rec.upSkip !== t && !rec.upSnooze){
    if(n >= s + 2 && n <= s + 30){ rec.upSnooze = s + 35; save(); firePunch('up'); return; }
  }
  if(rec.upSnooze !== undefined && n >= rec.upSnooze){
    rec.upSnooze = undefined;
    if(!rec.up){ save(); firePunch('up'); }
    return;
  }
  // 下班：到点后 2 分钟起，未打卡则提醒
  if(rec.up && !rec.down && rec.downSkip !== t && rec.downSnooze === undefined){
    if(n >= e + 2){ rec.downSnooze = e + 20; save(); firePunch('down'); return; }
  }
  if(rec.downSnooze !== undefined && n >= rec.downSnooze){
    rec.downSnooze = undefined;
    if(!rec.down){ save(); firePunch('down'); }
    return;
  }
}
var punchCache = '';
function renderPunch(){
  var rec = dayRec();
  var t = today();
  var sig = JSON.stringify(rec) + '|' + S.work.s + '|' + S.work.e + '|' + t + '|' + S.punch.notify;
  if(sig === punchCache) return;
  punchCache = sig;
  // 用户正在输入时间时不要覆盖，避免打断编辑
  if(document.activeElement !== $('pWorkS')) $('pWorkS').value = S.work.s;
  if(document.activeElement !== $('pWorkE')) $('pWorkE').value = S.work.e;
  $('pUpV').textContent = rec.up || '—';
  $('pDownV').textContent = rec.down || '—';
  if(rec.up && rec.down){
    var a = toMin(rec.up), b = toMin(rec.down);
    var dur = b > a ? b - a : (1440 - a + b);
    setNum('pWorkV', (dur/60).toFixed(1), '小时');
  } else {
    $('pWorkV').textContent = '—';
  }
  var pill = $('punchPill');
  if(rec.up && rec.down){ pill.className='pill ok'; pill.textContent='今日已完成'; }
  else if(rec.up){ pill.className='pill'; pill.textContent='在岗中'; }
  else { pill.className='pill warn'; pill.textContent='未打卡'; }
  $('pUp').disabled = !!rec.up;
  $('pDown').disabled = !rec.up || !!rec.down;
  $('pUndo').disabled = !rec.up && !rec.down;

  var d = new Date();
  var w = ['日','一','二','三','四','五','六'][d.getDay()];
  var base = '今日 ' + (d.getMonth()+1) + '月'+d.getDate()+' 日 · 星期'+w;
  var extra = '';
  if(rec.up && rec.down) extra = ' · 已打卡上班 '+rec.up+' / 下班 '+rec.down;
  else if(rec.up) extra = ' · 已打卡上班 '+rec.up+'，下班别忘了打卡';
  else if(!isWeekend()) extra = ' · 上班时间 '+S.work.s+'，到点会提醒你';
  else extra = ' · 周末休息，不提醒打卡';
  $('punchToday').textContent = base + extra;
  $('pHint').textContent = '设定：上班 ' + S.work.s + ' · 下班 ' + S.work.e + (S.punch.notify ? '' : '（到点提醒已关闭，仍可手动打卡）');

  // 月度统计
  var y = d.getFullYear(), mo = d.getMonth();
  var dim = new Date(y, mo+1, 0).getDate();
  var days = 0, worked = 0, totalMin = 0;
  var dotData = [];
  for(var i = 1; i <= dim; i++){
    var key = y + '-' + pad(mo+1) + '-' + pad(i);
    var rec2 = S.punch.days[key];
    var wd = new Date(y, mo, i).getDay();
    var we = wd === 0 || wd === 6;
    if(!we) days++;
    if(rec2 && rec2.up){
      worked++;
      if(rec2.down){
        var a2 = toMin(rec2.up), b2 = toMin(rec2.down);
        totalMin += (b2 > a2 ? b2 - a2 : 1440 - a2 + b2);
      }
      dotData.push({cls:'full' + (key === t ? ' today':''), tip: key + ' 上班 '+rec2.up + (rec2.down ? ' / 下班 '+rec2.down : '')});
    } else if(rec2 && (rec2.upSkip || rec2.downSkip)){
      dotData.push({cls:'rest' + (key === t ? ' today':''), tip: key + ' 请假/休息'});
    } else if(we){
      dotData.push({cls:'', tip: key + ' 周末'});
    } else if(new Date(y, mo, i) < new Date()){
      dotData.push({cls:'miss', tip: key + ' 缺卡'});
    } else {
      dotData.push({cls: key === t ? 'today' : '', tip: key});
    }
  }
  var monthEl = $('pMonth');
  while(monthEl.firstChild) monthEl.removeChild(monthEl.firstChild);
  monthEl.appendChild(document.createTextNode(String(worked)));
  var sm = document.createElement('small');
  sm.textContent = '/ ' + days + ' 天';
  monthEl.appendChild(sm);
  $('pMonthMeta').textContent = totalMin
    ? ('本月工时约 ' + (totalMin/60).toFixed(1) + ' 小时 · 平均 ' + fmtDur(totalMin/Math.max(1,worked)))
    : '本月还没有打卡记录';
  // 月历点：用 DOM 节点构建，title 一律走 setAttribute，不拼 HTML 字符串
  var dots = $('pDots');
  clear(dots);
  for(var j = 0; j < dotData.length; j++){
    var di = document.createElement('i');
    if(dotData[j].cls) di.className = dotData[j].cls;
    di.setAttribute('title', dotData[j].tip);
    dots.appendChild(di);
  }
}
$('pUp').addEventListener('click', function(){ punchNow('up'); });
$('pDown').addEventListener('click', function(){ punchNow('down'); });
$('pUndo').addEventListener('click', function(){
  var rec = dayRec();
  showModal({
    icon:'↩️', bg:'#f1f3f9', title:'撤销今日打卡',
    body:'将清除今天的上班/下班打卡记录，其他日期不受影响。',
    btns:[{key:'no', label:'取消', ghost:true},{key:'yes', label:'确认撤销', color:'var(--danger)'}]
  });
  modalCb = function(k){
    if(k !== 'yes') return;
    rec.up = ''; rec.down = '';
    delete rec.upSnooze; delete rec.downSnooze; delete rec.upSkip; delete rec.downSkip;
    save(); renderPunch(); toast('已撤销今日打卡');
  };
});
$('pWorkS').addEventListener('change', function(){
  S.work.s = $('pWorkS').value || '09:00';
  S.punch.notify = true;
  save(); punchCache=''; renderPunch(); initDrawer();
  toast('上班时间已设为 ' + S.work.s);
});
$('pWorkE').addEventListener('change', function(){
  S.work.e = $('pWorkE').value || '18:30';
  S.punch.notify = true;
  save(); punchCache=''; renderPunch(); initDrawer();
  toast('下班时间已设为 ' + S.work.e);
});
function inQuiet(){
  if(S.dnd.on){
    var a = toMin(S.dnd.s), b = toMin(S.dnd.e), n = nowMin();
    if(a<=b){ if(n>=a && n<b) return true; }
    else { if(n>=a || n<b) return true; }
  }
  if(S.work.on){
    var a2 = toMin(S.work.s), b2 = toMin(S.work.e), n2 = nowMin();
    if(a2<=b2){ if(n2<a2 || n2>=b2) return true; }
    else { if(n2<a2 && n2>=b2) return true; }
  }
  return false;
}

/* ---------- sound ---------- */
var AC = null;
function beep(kind){
  if(!S.sound) return;
  try{
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state === 'suspended') AC.resume();
    var seq = kind === 'water' ? [660,880] : kind === 'todo' ? [520,660,520] : [740,590];
    var t0 = AC.currentTime;
    seq.forEach(function(f,i){
      var o = AC.createOscillator(), g = AC.createGain();
      o.type='sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + i*0.18);
      g.gain.exponentialRampToValueAtTime(0.16, t0 + i*0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i*0.18 + 0.16);
      o.connect(g); g.connect(AC.destination);
      o.start(t0 + i*0.18); o.stop(t0 + i*0.18 + 0.18);
    });
  }catch(e){}
}
function notify(title, body){
  if(!S.notify || !('Notification' in window)) return;
  try{
    if(Notification.permission !== 'granted') return;
    var n = new Notification(title, { body:body, tag:'deskMate', silent:true });
    setTimeout(function(){ try{n.close();}catch(e){} }, 12000);
  }catch(e){}
}

/* ---------- toast ---------- */
var toastT = null;
function toast(msg){
  var el = $('toast');
  el.textContent = msg;
  el.className = 'toast on';
  clearTimeout(toastT);
  toastT = setTimeout(function(){ el.className = 'toast'; }, 2200);
}

/* ---------- modal ---------- */
var modalCb = null;
function showModal(opt){
  var box = $('modalBox');
  clear(box);
  var ic = document.createElement('div');
  ic.className = 'mi';
  ic.style.background = opt.bg;
  ic.textContent = opt.icon;
  var h = document.createElement('h3');
  h.textContent = opt.title;
  var p = document.createElement('p');
  p.textContent = opt.body;
  var acts = document.createElement('div');
  acts.className = 'acts';
  opt.btns.forEach(function(b){
    if(!b.label) return;
    var btn = document.createElement('button');
    btn.className = 'btn' + (b.ghost ? ' ghost' : '');
    if(b.color) btn.style.background = b.color;
    btn.textContent = b.label;
    btn.onclick = function(){
      closeModal();
      if(modalCb){ var f = modalCb; modalCb = null; f(b.key); }
    };
    acts.appendChild(btn);
  });
  box.appendChild(ic); box.appendChild(h); box.appendChild(p); box.appendChild(acts);
  $('mask').classList.add('on');
  document.addEventListener('keydown', onEsc);
}
/* 用 classList 增删，保留 mask 类名——否则 position:fixed 失效，弹窗会掉到文档流里 */
function closeModal(){
  $('mask').classList.remove('on');
  document.removeEventListener('keydown', onEsc);
}
function onEsc(e){ if(e.key === 'Escape'){ closeModal(); } }
$('mask').addEventListener('click', function(e){ if(e.target === this){ closeModal(); } });

/* ---------- sit ---------- */
$('sitSeg').addEventListener('click', function(e){
  var b = e.target.closest('button'); if(!b) return;
  S.sit.interval = parseInt(b.dataset.v,10);
  S.sit.startAt = Date.now();
  save(); renderSit(); toast('久坐提醒间隔：'+S.sit.interval+' 分钟');
});
$('sitReset').addEventListener('click', function(){
  S.sit.startAt = Date.now();
  S.sit.stand += 1;
  save(); renderAll();
  toast('👍 已记录一次起身，坐得比上一轮久啦');
});
$('sitPause').addEventListener('click', function(){
  S.sit.paused = !S.sit.paused;
  S.sit.startAt = Date.now();
  save(); renderSit();
});
function fireSit(){
  var mins = Math.floor((Date.now() - S.sit.startAt)/60000);
  beep('sit');
  notify('该起身活动了', '你已经连续坐了 '+mins+' 分钟，起来走两分钟吧。');
  showModal({
    icon:'🧍', bg:'var(--sit-soft)', title:'牛马，该站起来了',
    body:'你已经连续坐了 '+mins+' 分钟。起身接杯水、走两分钟，或者做一组扩胸和肩绕环，会比一直坐着舒服很多。',
    body:'你已经连续坐了 '+mins+' 分钟。起身接杯水、走两分钟，或者做一组扩胸和肩绕环，会比一直坐着舒服很多。',
    btns:[
      {key:'ok', label:'我已起身', color:'var(--sit)'},
      {key:'later', label:'延后 10 分钟', ghost:true}
    ]
  });
  modalCb = function(key){
    if(key === 'ok'){ S.sit.startAt = Date.now(); S.sit.stand += 1; }
    else { S.sit.startAt = Date.now() - (S.sit.interval - 10)*60000; }
    save(); renderAll();
  };
  S.sit.startAt = Date.now();
  save();
}
function renderSit(){
  var left = S.sit.interval - (Date.now() - S.sit.startAt)/60000;
  var ratio = Math.max(0, Math.min(1, left / S.sit.interval));
  $('sitArc').setAttribute('stroke-dashoffset', (CIRC*(1-ratio)).toFixed(1));
  var m = Math.max(0, Math.ceil(left));
  var el = $('sitLeft');
  el.textContent = m >= 60 ? Math.floor(m/60)+'时'+(m%60) : m;
  $('sitUnit').textContent = m >= 60 ? '分后提醒' : '分钟后提醒';
  el.className = 'big' + (left <= 5 ? ' warn' : '');
  $('sitElapsed').textContent = Math.floor((Date.now()-S.sit.startAt)/60000) + ' 分钟';
  var nxt = new Date(S.sit.startAt + S.sit.interval*60000);
  $('sitNext').textContent = '下次提醒：' + hhmmss(nxt).slice(0,5);
  var p = $('sitPill');
  if(S.sit.paused){ p.className='pill warn'; p.textContent='已暂停'; }
  else { p.className='pill'; p.textContent='运行中'; }
  $('sitPause').textContent = S.sit.paused ? '继续' : '暂停';
  var seg = $('sitSeg').children;
  for(var i=0;i<seg.length;i++) seg[i].className = (parseInt(seg[i].dataset.v,10) === S.sit.interval ? 'on':'');
  var streak = S.sit.stand >= 8 ? '今天起身很规律 👍' : '每 45 分钟起身一次最舒服';
  $('sitStreak').textContent = streak;
}

/* ---------- water ---------- */
$('waterSeg').addEventListener('click', function(e){
  var b = e.target.closest('button'); if(!b) return;
  S.water.interval = parseInt(b.dataset.v,10);
  S.water.lastAt = Date.now();
  save(); renderWater(); toast('饮水提醒间隔：'+S.water.interval+' 分钟');
});
$('waterAdd').addEventListener('click', function(){
  addWater(true);
});
$('waterUndo').addEventListener('click', function(){
  if(S.water.count <= 0){ toast('今天还没有记录'); return; }
  S.water.count -= 1;
  S.water.ml = S.water.count * S.cup;
  save(); renderAll(); toast('已撤销一杯');
});
$('waterPause').addEventListener('click', function(){
  S.water.paused = !S.water.paused;
  S.water.lastAt = Date.now();
  save(); renderWater();
});
function addWater(pop){
  S.water.count += 1;
  S.water.ml = S.water.count * S.cup;
  S.water.lastAt = Date.now();
  save(); renderAll();
  if(pop){
    var c = $('cups').children[S.water.count-1];
    if(c){ c.classList.add('pop'); setTimeout(function(){ c.classList.remove('pop'); },200); }
  }
  beep('water');
  if(S.water.count === S.goal){
    notify('今日饮水达标', '已经喝够 '+S.goal+' 杯，身体会谢谢你。');
    toast('🎉 今日饮水目标达成！');
  } else {
    toast('💧 第 '+S.water.count+' 杯已记录');
  }
}
function fireWater(){
  beep('water');
  notify('该喝水了', '距离上一次饮水已超过 '+S.water.interval+' 分钟，去接一杯吧。');
  showModal({
    icon:'💧', bg:'var(--water-soft)', title:'该喝水啦',
    body:'距上次喝水已经 '+S.water.interval+' 分钟。今天已喝 '+S.water.count+' 杯，目标 '+S.goal+' 杯（每次约 '+S.cup+'ml）。',
    btns:[
      {key:'ok', label:'喝了一杯', color:'var(--water)'},
      {key:'later', label:'延后 10 分钟', ghost:true}
    ]
  });
  modalCb = function(key){
    if(key === 'ok') addWater(false);
    else S.water.lastAt = Date.now() - (S.water.interval - 10)*60000;
    save(); renderAll();
  };
  S.water.lastAt = Date.now();
  save();
}
function renderWater(){
  var left = S.water.interval - (Date.now() - S.water.lastAt)/60000;
  var ratio = Math.max(0, Math.min(1, left / S.water.interval));
  $('waterArc').setAttribute('stroke-dashoffset', (CIRC*(1-ratio)).toFixed(1));
  var target = S.goal * S.cup;
  var pct = Math.min(100, Math.round(S.water.ml / target * 100));
  setNum('waterPct', pct, '%');
  $('waterPct').style.color = pct >= 100 ? 'var(--ok)' : 'var(--txt)';
  $('waterMl').textContent = S.water.ml + ' / ' + target + ' ml';
  var t = Math.max(0, left*60);
  var mm = Math.floor(t/60), ss = Math.floor(t%60);
  $('waterLeft').textContent = mm + ':' + pad(ss);
  var gap = Math.max(0, S.goal - S.water.count);
  $('waterTip').textContent = gap > 0 ? ('今天已喝 '+S.water.count+' 杯 · 还差 '+gap+' 杯达标') : '今日目标已完成，继续保持';
  $('cupSizeTxt').textContent = S.cup;
  var box = $('cups');
  while(box.children.length < S.goal){
    var c = document.createElement('div');
    c.className = 'cup';
    box.appendChild(c);
  }
  while(box.children.length > S.goal) box.removeChild(box.lastChild);
  for(var i=0;i<box.children.length;i++){
    box.children[i].className = 'cup' + (i < S.water.count ? ' full':'');
  }
  var p = $('waterPill');
  if(S.water.paused){ p.className='pill warn'; p.textContent='已暂停'; }
  else { p.className='pill'; p.textContent='运行中'; }
  $('waterPause').textContent = S.water.paused ? '继续' : '暂停';
  var seg = $('waterSeg').children;
  for(var j=0;j<seg.length;j++) seg[j].className = (parseInt(seg[j].dataset.v,10) === S.water.interval ? 'on':'');
}

/* ---------- todos ---------- */
var PRI = { h:{t:'高优先',c:'tag h'}, m:{t:'中优先',c:'tag m'}, l:{t:'低优先',c:'tag l'} };
var filter = 'all';

$('todoAdd').addEventListener('click', addTodo);
$('todoText').addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); addTodo(); } });
function addTodo(){
  var txt = $('todoText').value.trim();
  if(!txt){ toast('先写点什么吧'); $('todoText').focus(); return; }
  var btn = $('todoAdd');
  if(btn.disabled) return;
  btn.disabled = true;
  S.todos.unshift({
    id: 't' + Date.now() + Math.floor(Math.random()*1000),
    text: txt,
    pri: $('todoPri').value,
    due: $('todoDue').value || '',
    dueDay: today(),
    done: false,
    createdAt: Date.now(),
    fired: false
  });
  save();
  $('todoText').value = '';
  $('todoDue').value = '';
  renderTodo(); renderAll();
  toast('已添加待办');
  setTimeout(function(){ btn.disabled = false; }, 250);
}
$('todoFilter').addEventListener('click', function(e){
  var b = e.target.closest('button'); if(!b) return;
  filter = b.dataset.v;
  var bs = this.children;
  for(var i=0;i<bs.length;i++) bs[i].className = (bs[i].dataset.v === filter ? 'on':'');
  renderTodo();
});
$('todoClearDone').addEventListener('click', function(){
  var n = 0;
  S.todos = S.todos.filter(function(o){ if(o.done){ n++; return false; } return true; });
  save(); renderTodo(); renderAll();
  toast(n ? ('已清除 '+n+' 条已完成') : '没有已完成的待办');
});
function fmtDue(t){
  if(!t) return '';
  return '截止 ' + t;
}
function renderTodo(){
  var ul = $('todoList');
  clear(ul);
  var list = S.todos.filter(function(o){
    if(filter === 'todo') return !o.done;
    if(filter === 'done') return o.done;
    return true;
  });
  if(!list.length){
    var li = document.createElement('li');
    var em = document.createElement('div');
    em.className = 'empty';
    em.style.width = '100%';
    em.textContent = filter === 'done' ? '还没有完成的待办' : '暂无待办，在上面输入一条吧';
    li.appendChild(em);
    ul.appendChild(li);
    return;
  }
  list.forEach(function(o){
    var li = document.createElement('li');
    if(o.done) li.className = 'done';
    var cb = document.createElement('button');
    cb.className = 'cb' + (o.done ? ' on':'');
    cb.title = o.done ? '标记为未完成' : '标记为已完成';
    cb.onclick = function(){
      o.done = !o.done;
      save(); renderTodo(); renderAll();
    };
    var bd = document.createElement('div');
    bd.className = 'tbody';
    var tt = document.createElement('div');
    tt.className = 'tt';
    tt.textContent = o.text;
    var ti = document.createElement('div');
    ti.className = 'ti';
    var tag = document.createElement('span');
    tag.className = PRI[o.pri] ? PRI[o.pri].c : 'tag l';
    tag.textContent = PRI[o.pri] ? PRI[o.pri].t : '';
    ti.appendChild(tag);
    if(o.due){
      var dtag = document.createElement('span');
      dtag.className = 'tag due';
      dtag.textContent = fmtDue(o.due);
      ti.appendChild(dtag);
    }
    bd.appendChild(tt); bd.appendChild(ti);
    var del = document.createElement('button');
    del.className = 'del';
    del.title = '删除';
    del.textContent = '×';
    del.onclick = function(){ S.todos = S.todos.filter(function(x){ return x.id !== o.id; }); save(); renderTodo(); renderAll(); };
    li.appendChild(cb); li.appendChild(bd); li.appendChild(del);
    ul.appendChild(li);
  });
}
function fireTodoDue(o){
  o.fired = true;
  save();
  beep('todo');
  notify('待办到时间了', o.text);
  showModal({
    icon:'⏰', bg:'var(--todo-soft)', title:'这件事到点了',
    body:'「'+o.text+'」的截止时间是 '+o.due+'。现在处理，还是先标到稍后？',
    btns:[
      {key:'done', label:'已完成', color:'var(--todo)'},
      {key:'later', label:'延后 15 分钟', ghost:true},
      {key:'close', label:'知道了', ghost:true}
    ]
  });
  modalCb = function(key){
    if(key === 'done'){ o.done = true; }
    else if(key === 'later'){ o.due = addMin(o.due, 15); o.fired = false; }
    save(); renderTodo(); renderAll();
  };
}
function addMin(hhmm, m){
  var v = toMin(hhmm) + m;
  v = ((v % 1440) + 1440) % 1440;
  return pad(Math.floor(v/60)) + ':' + pad(v%60);
}
function checkTodoDue(){
  var n = nowMin();
  for(var i=0;i<S.todos.length;i++){
    var o = S.todos[i];
    if(!o.done && !o.fired && o.due && o.dueDay === today() && toMin(o.due) <= n){
      fireTodoDue(o);
      return;
    }
  }
}

/* ---------- summary ---------- */
function renderSummary(){
  var q = inQuiet();
  var st = $('sState');
  st.textContent = q ? '休息中' : '工作中';
  st.style.color = q ? 'var(--muted)' : 'var(--ok)';
  st.style.fontSize = '16px';
  setNum('sStand', S.sit.stand, '次');
  setNum('sWater', S.water.count, '/ ' + S.goal + ' 杯');
  var done = 0;
  S.todos.forEach(function(o){ if(o.done) done++; });
  setNum('sTodo', done, '/ ' + S.todos.length);
}

/* ---------- clock ---------- */
function renderClock(){
  var d = new Date();
  $('clockT').textContent = hhmmss(d);
  var w = ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()];
  $('clockD').textContent = (d.getMonth()+1) + ' 月 '+d.getDate()+' 日 · '+w;
}

/* ---------- main tick ---------- */
function tick(){
  renderClock();
  renderSit();
  renderWater();
  renderSummary();
  var quiet = inQuiet();
  var alert = false;
  if(!S.sit.paused && !quiet && (Date.now() - S.sit.startAt) >= S.sit.interval*60000){
    if(!$('mask').classList.contains('on')){ alert = true; fireSit(); }
  }
  if(!S.water.paused && !quiet && (Date.now() - S.water.lastAt) >= S.water.interval*60000){
    if(!$('mask').classList.contains('on')){ alert = true; fireWater(); }
  }
  checkTodoDue();
  if(!$('mask').classList.contains('on')) checkPunch();
  renderPunch();
  $('alertBadge').className = alert ? 'alert on' : 'alert';
  $('badgeBtn').textContent = alert ? '🔔' : '💧';
}
setInterval(tick, 1000);

/* 页面重新可见时补上错过的提醒 */
document.addEventListener('visibilitychange', function(){
  if(!document.hidden){ rollDay(); tick(); }
});
window.addEventListener('focus', function(){ rollDay(); tick(); });
$('badgeBtn').addEventListener('click', function(){
  if(S.sit.paused){ S.sit.paused = false; S.sit.startAt = Date.now(); }
  if(S.water.paused){ S.water.paused = false; S.water.lastAt = Date.now(); }
  save(); renderAll(); toast('提醒已恢复');
});

/* ---------- settings ---------- */
$('gearBtn').addEventListener('click', function(){ $('drawer').className = 'drawer on'; });
$('drawerClose').addEventListener('click', function(){ $('drawer').className = 'drawer'; });
function bindSw(id, get, set){
  var el = $(id);
  el.className = 'tg' + (get() ? ' on':'');
  el.onclick = function(){
    set(!get());
    el.className = 'tg' + (get() ? ' on':'');
    save(); renderAll();
  };
}
function bindTime(id, get, set){
  var el = $(id);
  el.value = get();
  el.onchange = function(){ set(el.value); save(); punchCache=''; renderAll(); };
}
function renderAll(){ renderSit(); renderWater(); renderTodo(); renderPunch(); renderSummary(); }

function initDrawer(){
  $('setGoal').value = S.goal;
  $('setGoal').onchange = function(){
    var v = parseInt($('setGoal').value,10);
    S.goal = (isNaN(v) || v<1) ? 8 : Math.min(20,v);
    $('setGoal').value = S.goal;
    save(); renderAll();
  };
  $('setCup').value = S.cup;
  $('setCup').onchange = function(){ S.cup = parseInt($('setCup').value,10)||250; save(); renderAll(); };
  bindSw('tgWork', function(){ return S.work.on; }, function(v){ S.work.on = v; $('workTimes').style.opacity = v ? '1' : '.45'; });
  bindTime('setWs', function(){ return S.work.s; }, function(v){ S.work.s = v||'09:00'; punchCache=''; });
  bindTime('setWe', function(){ return S.work.e; }, function(v){ S.work.e = v||'18:30'; punchCache=''; });
  bindSw('tgDnd', function(){ return S.dnd.on; }, function(v){ S.dnd.on = v; $('dndTimes').style.opacity = v ? '1' : '.45'; });
  bindTime('setDs', function(){ return S.dnd.s; }, function(v){ S.dnd.s = v||'12:30'; });
  bindTime('setDe', function(){ return S.dnd.e; }, function(v){ S.dnd.e = v||'13:30'; });
  bindSw('tgSound', function(){ return S.sound; }, function(v){ if(v) beep('sit'); });
  bindSw('tgPunch', function(){ return S.punch.notify; }, function(v){
    S.punch.notify = v; save(); punchCache=''; renderPunch(); renderPunchNote();
  });
  renderPunchNote();
  /* 桌面通知单独处理：授权是异步的，不能套用通用开关逻辑 */
  $('tgNotify').className = 'tg' + (S.notify ? ' on' : '');
  $('tgNotify').onclick = askNotifyPermission;
  $('workTimes').style.opacity = S.work.on ? '1' : '.45';
  $('dndTimes').style.opacity = S.dnd.on ? '1' : '.45';
  renderNotifyNote();
}
/* 独立窗口可用于申请桌面通知。 */
var DIRECT_URL = location.href.split('#')[0];
var PAGE_URL = DIRECT_URL;
function inFrame(){
  try{ return window.self !== window.top; }catch(e){ return true; }
}
function isLocalFile(){
  return location.protocol === 'file:';
}
function openStandalone(){ var w = window.open(PAGE_URL, '_blank'); if(!w) toast('请允许弹出窗口'); }
function askNotifyPermission(){
  // 再次点击= 关闭
  if(S.notify && Notification.permission === 'granted'){
    S.notify = false;
    save(); $('tgNotify').className = 'tg'; renderNotifyNote();
    toast('已关闭桌面通知');
    return;
  }
  if(isLocalFile()){
    S.notify = false; renderNotifyNote();
    showModal({
      icon:'📄', bg:'var(--water-soft)', title:'本地文件方式无法开启桌面通知',
      body:'你现在是用本地文件（file:// 方式）打开的，Chrome 和 Edge 在这种打开方式下会直接禁用系统通知能力，网页无权开启。\n\n' +
           '请用浏览器直接打开线上链接，通知功能就能正常授权：\n' +
           PAGE_URL + '\n\n' +
           '页面内的弹窗和提示音在本地文件下照常可用，不影响其他功能。',
      btns:[
        {key:'copy', label:'复制线上链接', color:'var(--water)'},
        {key:'ok', label:'知道了', ghost:true}
      ]
    });
    modalCb = function(k){
      if(k === 'copy'){
        copyText(PAGE_URL);
      }
    };
    return;
  }
  if(!('Notification' in window)){
    S.notify = false; renderNotifyNote();
    showModal({
      icon:'🔕', bg:'#f1f3f9', title:'当前环境不支持桌面通知',
      body:'这个浏览器或预览环境没有提供系统通知能力。页面内的弹窗和提示音依然正常工作，不影响使用。\n\n想用桌面通知，请把作品链接复制到 Chrome / Edge 浏览器中打开。',
      btns:[{key:'ok', label:'知道了', color:'var(--todo)'}]
    });
    modalCb = function(){};
    return;
  }
  if(inFrame()){
    // 内嵌窗口里浏览器会自动把权限置为 denied，这属于环境限制而非用户拒绝，
    // 必须在 denied 分支之前判断，否则会给出"去站点设置放开"这种无效指引
    S.notify = false; renderNotifyNote();
    showModal({
      icon:'🪟', bg:'var(--water-soft)', title:'当前是内嵌窗口，需要独立打开',
      body:'当前页面运行在内嵌窗口里，浏览器规定内嵌窗口不能申请系统通知权限——这不是应用的问题，换任何网站都一样。\n\n' +
           '点下面的按钮，会在「独立窗口」中打开同一份页面，那里有顶层窗口权限，桌面通知就能正常授权了。\n\n' +
           '（页面内的弹窗和提示音在内嵌窗口里照常可用，不受影响。）',
      btns:[
        {key:'open', label:'🪟 独立窗口打开', color:'var(--water)'},
        {key:'copy', label:'复制地址', ghost:true},
        {key:'ok', label:'暂不开启', ghost:true}
      ]
    });
    modalCb = function(k){
      if(k === 'open') openStandalone();
      else if(k === 'copy') copyText(DIRECT_URL);
    };
    return;
  }
  if(Notification.permission === 'denied'){
    S.notify = false; renderNotifyNote();
    showModal({
      icon:'🔕', bg:'#ffeceb', title:'通知权限已被浏览器拒绝',
      body:'权限一旦拒绝，网页无法自行恢复，需要你手动放开：\n\n' +
           '· Chrome / Edge：点地址栏左侧的图标 → 「网站设置」→ 找到「通知」→ 改为「允许」\n' +
           '· Safari：点地址栏左侧「aA」图标 → 「网站设置」→ 勾选「通知」\n\n' +
           '改完刷新页面，开关就能打开了。',
      btns:[{key:'ok', label:'知道了', color:'var(--danger)'}]
    });
    modalCb = function(){};
    return;
  }
  // 权限还没问过：先弹窗说明要授权，等用户确认再请求，避免被浏览器静默拦截
  showModal({
    icon:'🔔', bg:'var(--todo-soft)', title:'开启桌面通知',
    body:'开启后，浏览器会弹出一个「是否允许通知」的授权窗口，请点击「允许」。\n\n' +
         '授权后即使你切到其他标签页或最小化窗口，久坐、饮水、待办和打卡的提醒也能在系统通知里看到。\n\n' +
         '如果浏览器直接跳过了弹窗，说明它记住了上次的拒绝选择，需要到地址栏左侧的站点设置里手动放开。',
    btns:[
      {key:'yes', label:'去授权', color:'var(--todo)'},
      {key:'no', label:'暂不开启', ghost:true}
    ]
  });
  modalCb = function(k){
    if(k !== 'yes'){ S.notify = false; save(); renderNotifyNote(); return; }
    try{
      var p = Notification.requestPermission();
      if(p && typeof p.then === 'function'){
        p.then(function(perm){
          applyNotifyPermission(perm);
        }).catch(function(){
          applyNotifyPermission('denied');
        });
      } else {
        applyNotifyPermission(Notification.permission);
      }
    }catch(e){
      applyNotifyPermission('denied');
    }
  };
}
function copyText(txt){
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(function(){ toast('链接已复制，粘贴到浏览器打开即可'); },
        function(){ fallbackCopy(txt); });
      return;
    }
  }catch(e){}
  fallbackCopy(txt);
}
function fallbackCopy(txt){
  try{
    var ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    var ok = document.execCommand('copy');
    document.body.removeChild(ta);
    toast(ok ? '链接已复制，粘贴到浏览器打开即可' : '复制失败，请手动选中链接');
  }catch(e){
    toast('复制失败，请手动选中链接');
  }
}
function applyNotifyPermission(perm){
  S.notify = (perm === 'granted');
  save();
  $('tgNotify').className = 'tg' + (S.notify ? ' on' : '');
  renderNotifyNote();
  if(S.notify){
    toast('🔔 桌面通知已开启');
    notify('桌面通知已开启', '之后到点可以直接在系统通知里看到提醒。');
  } else {
    toast('未获得通知权限，仍使用页面内弹窗提醒');
  }
}
function renderNotifyNote(){
  var n = $('notifyNote');
  var sw = $('tgNotify');
  // 权限被用户在浏览器侧改掉时，开关状态跟着回滚，避免出现"假开启"
  if(S.notify && 'Notification' in window && Notification.permission !== 'granted'){
    S.notify = false;
    save();
  }
  if(sw) sw.className = 'tg' + (S.notify ? ' on' : '');
  if(isLocalFile()){
    n.textContent = '当前以本地文件方式打开，浏览器禁用了系统通知。请用线上链接打开应用。';
    return;
  }
  if(!('Notification' in window)){
    n.textContent = '当前环境不支持桌面通知，仅使用页面弹窗 + 提示音提醒（功能不受影响）。';
    return;
  }
  if(inFrame()){
    n.textContent = '当前在内嵌窗口中，浏览器不允许此环境申请通知权限。点上方「独立窗口打开」即可正常授权。';
    return;
  }
  if(Notification.permission === 'denied'){
    n.textContent = '通知权限已被拒绝，需在地址栏左侧的站点设置里手动改为「允许」。';
    return;
  }
  if(Notification.permission === 'default'){
    n.textContent = '点击开关后按提示完成一次授权即可生效。';
    return;
  }
  n.textContent = S.notify ? '已开启：切到其他标签页也能收到系统通知。' : '未开启：目前只有页面内弹窗 + 提示音提醒。';
}
function renderPunchNote(){
  var n = $('punchNote');
  if(!n) return;
  var wk = ['日','一','二','三','四','五','六'][new Date().getDay()];
  n.textContent = S.punch.notify
    ? ('开启后：工作日（周一至周五，' + S.work.s + ' 上班 / ' + S.work.e + ' 下班）到点弹窗提醒打卡，午休免打扰时段内不打扰。')
    : '已关闭到点提醒，你仍可以在页面上手动点击「上班打卡 / 下班打卡」。';
}
$('standaloneBtn').addEventListener('click', openStandalone);
$('standaloneTop').addEventListener('click', openStandalone);
$('testBtn').addEventListener('click', function(){
  beep('sit');
  var perm = ('Notification' in window) ? Notification.permission : 'unsupported';
  var permTxt = {granted:'已授权', default:'未询问（需授权）', denied:'已拒绝', unsupported:'不支持'}[perm];
  var env = '';
  if(isLocalFile()) env = '本地文件方式（file://）——浏览器在此方式下禁用系统通知';
  else if(inFrame()) env = '内嵌窗口——浏览器禁止此类窗口申请通知权限，请点「独立窗口打开」';
  var sent = false;
  if(S.notify && perm === 'granted'){
    try{ notify('测试提醒', '这是一条测试通知，收到就说明提醒工作正常。'); sent = true; }
    catch(e){ sent = false; }
  }
  showModal({
    icon:'🔔', bg:'var(--todo-soft)', title:'提醒测试',
    body:'弹窗、提示音、桌面通知都按当前设置工作。久坐提醒每 '+S.sit.interval+' 分钟一次，饮水提醒每 '+S.water.interval+' 分钟一次。\n\n' +
         '通知权限：' + permTxt + (env ? '\n运行环境：' + env : '') + '\n' +
         '本次是否实际发出通知：' + (sent ? '已发出' : '未发出（页面内弹窗和提示音不受影响）'),
    btns:[
      {key:'ok', label:'知道了', color:'var(--todo)'},
      {key:'open', label: (perm === 'granted') ? '' : '🪟 独立窗口打开', ghost:true}
    ]
  });
  modalCb = function(k){
    if(k === 'open' && perm !== 'granted') openStandalone();
  };
});
$('resetBtn').addEventListener('click', function(){
  showModal({
    icon:'⚠️', bg:'#ffeceb', title:'清空所有数据？',
    body:'将删除本地保存的全部待办、饮水记录和设置，且无法恢复。建议先「导出备份」。',
    btns:[
      {key:'no', label:'再想想', ghost:true},
      {key:'yes', label:'确认清空', color:'var(--danger)'}
    ]
  });
  modalCb = function(k){
    if(k !== 'yes') return;
    try{ localStorage.removeItem(KEY); }catch(e){}
    S = clone(DEF); rollDay(); save(); punchCache=''; initDrawer(); renderAll();
    toast('已清空本地数据');
  };
});

/* ---------- import / export ---------- */
$('expBtn').addEventListener('click', function(){
  var data = JSON.stringify(S, null, 2);
  var blob = new Blob([data], {type:'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '牛马站起来备份-' + today() + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 3000);
  toast('备份文件已导出');
});
$('impBtn').addEventListener('click', function(){ $('impFile').click(); });
$('impFile').addEventListener('change', function(e){
  var f = e.target.files && e.target.files[0];
  if(!f) return;
  var rd = new FileReader();
  rd.onload = function(){
    try{
      var o = JSON.parse(String(rd.result));
      var t = load();
      if(o.sit) t.sit = Object.assign({}, t.sit, o.sit);
      if(o.water) t.water = Object.assign({}, t.water, o.water);
      if(o.work) t.work = Object.assign({}, t.work, o.work);
      if(o.dnd) t.dnd = Object.assign({}, t.dnd, o.dnd);
      if(o.punch) t.punch = Object.assign({}, t.punch, o.punch);
      ['goal','cup','sound','notify'].forEach(function(p){ if(o[p]!==undefined) t[p]=o[p]; });
      if(Array.isArray(o.todos)) t.todos = o.todos;
      S = t; rollDay(); save(); punchCache=''; initDrawer(); renderAll();
      toast('✅ 备份已导入');
    }catch(err){
      toast('导入失败：文件格式不正确');
    }
  };
  rd.readAsText(f);
  e.target.value = '';
});

/* ---------- boot ---------- */
initDrawer();
renderAll();
tick();
// 首次进入：直接命中条件的（比如久坐超时）立刻提醒
setTimeout(function(){
  var missed = [];
  if(!inQuiet()){
    if((Date.now()-S.sit.startAt) >= S.sit.interval*60000) missed.push('sit');
    if((Date.now()-S.water.lastAt) >= S.water.interval*60000) missed.push('water');
  }
  if(missed.length){
    var mins = Math.floor((Date.now()-S.sit.startAt)/60000);
    showModal({
      icon:'👋', bg:'var(--sit-soft)', title:'欢迎回来',
      body:'你离开的这段时间里，'+((Date.now()-S.sit.startAt)/60000>=S.sit.interval?'已经坐了 '+mins+' 分钟':'还有一会儿就要到提醒时间了')+'。要不要先起来走两步？',
      btns:[
        {key:'ok', label:'现在就去', color:'var(--sit)'},
        {key:'later', label:'10 分钟后再提醒', ghost:true}
      ]
    });
    modalCb = function(k){
      if(k === 'ok'){ S.sit.startAt = Date.now(); S.sit.stand += 1; }
      else S.sit.startAt = Date.now() - (S.sit.interval - 10)*60000;
      save(); renderAll();
    };
  }
}, 400);
})();
