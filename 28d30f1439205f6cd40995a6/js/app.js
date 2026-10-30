'use strict';
/* ==========================================================
   宝贝请起身 —— 主界面逻辑
   ========================================================== */

const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const PAGE_ORDER = ['pomodoro', 'water', 'care', 'stats', 'sound', 'settings'];
const BASE_TITLE = '宝贝请起身';

let D = null;                 // 全局配置
let pomo = { running: false, phase: 'focus', remain: 0, endAt: 0, round: 0 };

let lastActivityAt = Date.now();  
let pumpOpen = false;
let pumpData = null;
let mutedOnce = false;
let titleTimer = null;
let badgeTimer = null;
let toastTimer = null;

/* ---------- 初始化 ---------- */
async function boot() {
  D = await store.load();
  store.rollDay();
  HealthAudio.warmup();

  bindNav();
  bindPomodoro();
  bindWater();
  bindCare();
  bindSound();
  bindSettings();
  bindPump();
  bindActivity();
  bindKeyboard();

  renderAll();

  setInterval(tickPomo, 250);
  setInterval(tickMain, 1000);

  if (D.stats.date) $('#cfgPath').textContent = '应用数据库';
}

/* ==========================================================
   路径读写
   ========================================================== */
function readPath(path) {
  return path.split('.').reduce((o, k) => (o || {})[k], D);
}
function writePath(path, value) {
  const keys = path.split('.');
  let o = D;
  for (let i = 0; i < keys.length - 1; i++) {
    o[keys[i]] = o[keys[i]] || {};
    o = o[keys[i]];
  }
  o[keys[keys.length - 1]] = value;
  store.save();
  updateNextChip();
}

function setSwitch(el, on) { if (el) el.classList.toggle('on', !!on); }
function setField(el, v) { if (el) el.value = v; }

function bindSwitch(el, path, onChange) {
  if (!el) return;
  el.onclick = () => {
    const next = !el.classList.contains('on');
    el.classList.toggle('on', next);
    writePath(path, next);
    if (onChange) onChange(next);
  };
}

function bindNum(el, path) {
  if (!el) return;
  el.onchange = () => {
    let v = Number(el.value);
    if (isNaN(v) || v <= 0) { el.value = readPath(path); return; }
    const min = Number(el.min || 1);
    const max = Number(el.max || 9999);
    v = Math.round(Math.min(max, Math.max(min, v)));
    el.value = v;
    writePath(path, v);
    if (path.indexOf('water.') === 0) renderCups();
  };
}

/* ==========================================================
   导航
   ========================================================== */
function switchPage(name) {
  $$('.nav-item').forEach((x) => x.classList.toggle('active', x.dataset.page === name));
  $$('.page').forEach((p) => p.classList.toggle('active', p.id === 'page-' + name));
  $('#content').scrollTop = 0;
}

function bindNav() {
  $$('.nav-item').forEach((el) => {
    el.onclick = () => switchPage(el.dataset.page);
  });
}

/* ==========================================================
   番茄钟
   ========================================================== */
function phaseMinutes(p) {
  return readPath('pomodoro.' + (p === 'focus' ? 'focusMin' : p === 'short' ? 'shortMin' : 'longMin')) || 25;
}

function bindPomodoro() {
  $('#pomoToggle').onclick = () => togglePomo();
  $('#pomoSkip').onclick = () => { advancePomo(true); renderPomo(); };
  $('#pomoReset').onclick = () => {
    pomo.running = false; pomo.phase = 'focus'; pomo.round = 0;
    pomo.remain = phaseMinutes('focus') * 60; pomo.endAt = 0;
    renderPomo();
  };

  $$('#pomoSeg .seg').forEach((s) => {
    s.onclick = () => {
      pomo.phase = s.dataset.phase;
      pomo.remain = phaseMinutes(pomo.phase) * 60;
      pomo.endAt = pomo.running ? Date.now() + pomo.remain * 1000 : 0;
      renderPomo();
    };
  });

  const map = {
    pomoFocus: 'pomodoro.focusMin',
    pomoShort: 'pomodoro.shortMin',
    pomoLong:  'pomodoro.longMin',
    pomoRounds:'pomodoro.rounds'
  };
  Object.keys(map).forEach((id) => {
    const el = $('#' + id);
    if (!el) return;
    el.onchange = () => {
      let v = Number(el.value);
      if (isNaN(v)) { el.value = readPath(map[id]); return; }
      const min = Number(el.min || 1);
      const max = Number(el.max || 180);
      v = Math.round(Math.min(max, Math.max(min, v)));
      el.value = v;
      writePath(map[id], v);
      const hit = (id === 'pomoFocus' && pomo.phase === 'focus') ||
                  (id === 'pomoShort' && pomo.phase === 'short') ||
                  (id === 'pomoLong'  && pomo.phase === 'long');
      if (hit) {
        pomo.remain = phaseMinutes(pomo.phase) * 60;
        pomo.endAt = pomo.running ? Date.now() + pomo.remain * 1000 : 0;
      }
      renderPomo();
    };
  });
}

function togglePomo() {
  if (pomo.running) pausePomo(); else startPomo();
  renderPomo();
}

function startPomo() {
  if (pomo.remain <= 0) pomo.remain = phaseMinutes(pomo.phase) * 60;
  pomo.running = true;
  pomo.endAt = Date.now() + pomo.remain * 1000;
  HealthAudio.play('bell', readPath('audio'));
}

function pausePomo() {
  pomo.running = false;
  pomo.endAt = 0;
}

function tickPomo() {
  if (!pomo.running) return;
  const left = Math.max(0, Math.round((pomo.endAt - Date.now()) / 1000));
  if (left !== pomo.remain) { pomo.remain = left; renderRingOnly(); }
  if (left <= 0) { advancePomo(false); renderPomo(); }
}

function advancePomo(skipped) {
  const cfg = readPath('pomodoro');
  if (pomo.phase === 'focus') {
    if (!skipped) {
      D.stats.focusMin = (D.stats.focusMin || 0) + cfg.focusMin;
      store.save();
    }
    pomo.round += 1;
    if (pomo.round >= cfg.rounds) { pomo.phase = 'long'; pomo.round = 0; }
    else { pomo.phase = 'short'; }
  } else {
    pomo.phase = 'focus';
  }
  pomo.remain = phaseMinutes(pomo.phase) * 60;
  pomo.running = false;
  pomo.endAt = 0;
  if (!skipped) {
    HealthAudio.play('bell', readPath('audio'));
    showBadge(pomo.phase === 'focus' ? '休息结束，继续专注' : '专注结束，去休息一下');
  }
  updateMetrics();
  renderCharts();
}

function renderRingOnly() {
  const total = phaseMinutes(pomo.phase) * 60;
  const pct = total ? pomo.remain / total : 0;
  const C = 2 * Math.PI * 52;
  const ring = $('#pomoRing');
  ring.setAttribute('stroke-dasharray', C.toFixed(1));
  ring.setAttribute('stroke-dashoffset', (C * (1 - pct)).toFixed(1));
  const m = Math.floor(pomo.remain / 60), s = pomo.remain % 60;
  $('#pomoTime').textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function renderPomo() {
  renderRingOnly();
  $$('#pomoSeg .seg').forEach((s) => s.classList.toggle('active', s.dataset.phase === pomo.phase));

  const atStart = pomo.remain === phaseMinutes(pomo.phase) * 60;
  $('#pomoToggle').textContent = pomo.running ? '暂停' : (atStart ? '开始' : '继续');

  const status = { focus: '专注中', short: '短休息', long: '长休息' }[pomo.phase];
  $('#pomoStatus').textContent = pomo.running ? status : (atStart ? '准备开始' : '已暂停');
  $('#pomoRound').textContent = `第 ${pomo.round} 轮 · 共 ${readPath('pomodoro.rounds')} 轮`;

  const ring = $('#pomoRing');
  ring.classList.toggle('short', pomo.phase === 'short');
  ring.classList.toggle('long', pomo.phase === 'long');
}

/* ==========================================================
   喝水
   ========================================================== */
function bindWater() {
  $('#wAdd').onclick = () => addCup(1);
  $('#wUndo').onclick = () => addCup(-1);
  bindSwitch($('#wEnabled'), 'water.enabled');
  bindNum($('#wInterval'), 'water.intervalMin');
  bindNum($('#wTargetIn'), 'water.targetCups');
  bindNum($('#wSize'), 'water.cupSize');
}

function addCup(delta) {
  const n = Math.max(0, (D.stats.waterCups || 0) + delta);
  D.stats.waterCups = n;
  store.save();
  if (delta > 0) {
    HealthAudio.play('heart', readPath('audio'));
    const target = readPath('water.targetCups');
    if (n === target) HealthAudio.play('chime', readPath('audio'));
  }
  updateMetrics();
  renderCups();
  renderCharts();
  renderStreak();
}

function renderCups() {
  const target = readPath('water.targetCups') || 8;
  const cur = D.stats.waterCups || 0;
  const box = $('#wCups');
  box.innerHTML = '';
  for (let i = 0; i < target; i++) {
    const d = document.createElement('div');
    d.className = 'cup' + (i < cur ? ' filled' : '');
    d.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-3.3 4-5 6.6-5 9.2A5 5 0 0 0 12 17a5 5 0 0 0 5-4.8C17 9.6 15.3 7 12 3z"></path></svg>';
    box.appendChild(d);
  }
  $('#wCount').textContent = cur;
  $('#wTarget').textContent = target;
  const size = readPath('water.cupSize') || 250;
  $('#wVolume').textContent = `按 ${size} ml 计，今日约 ${cur * size} ml`;
}

/* ==========================================================
   护眼久坐
   ========================================================== */
function bindCare() {
  bindSwitch($('#eyeEnabled'), 'eye.enabled');
  bindNum($('#eyeInterval'), 'eye.intervalMin');
  bindSwitch($('#sitEnabled'), 'sit.enabled');
  bindNum($('#sitInterval'), 'sit.intervalMin');
  bindSwitch($('#sitIdle'), 'sit.idleGuard');
  bindSwitch($('#standEnabled'), 'stand.enabled');
  bindNum($('#standInterval'), 'stand.intervalMin');

  $$('[data-test]').forEach((b) => {
    b.onclick = () => trigger(b.dataset.test, { manual: true });
  });
}

/* ==========================================================
   提示音
   ========================================================== */
function bindSound() {
  const grid = $('#soundGrid');
  HealthAudio.list.forEach((s) => {
    const item = document.createElement('div');
    item.className = 'sound-item';
    item.dataset.sid = s.id;
    item.innerHTML = `
      <div class="sound-play">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10v4h3l4 4V6l-4 4H7z"></path><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" fill="none"></path></svg>
      </div>
      <div class="sound-meta">
        <div class="sound-name">${s.name}</div>
        <div class="sound-desc">${s.desc}</div>
      </div>
      <div class="sound-tag ${s.kind}">${s.kind === 'calm' ? '柔和' : s.kind === 'bright' ? '明亮' : '短促'}</div>`;
    item.querySelector('.sound-play').onclick = () => {
      HealthAudio.play(s.id, readPath('audio'));
      item.classList.add('playing');
      setTimeout(() => item.classList.remove('playing'), 1400);
    };
    grid.appendChild(item);
  });

  bindSwitch($('#aMuted'), 'audio.muted', () => syncSoundTags());
  bindSwitch($('#aFade'), 'audio.fade');

  const vol = $('#aVolume');
  vol.value = Math.round((readPath('audio.volume') || 0.7) * 100);
  vol.oninput = () => {
    writePath('audio.volume', Number(vol.value) / 100);
    $('#volHint').textContent = vol.value + '%';
  };

  const map = { sndWater: 'water', sndEye: 'eye', sndSit: 'sit', sndStand: 'stand', sndPomo: 'pomodoro' };
  for (const id in map) {
    const sel = $('#' + id);
    if (!sel) continue;
    HealthAudio.list.forEach((s) => {
      const o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.name;
      sel.appendChild(o);
    });
    sel.onchange = () => {
      writePath(map[id] + '.sound', sel.value);
      HealthAudio.play(sel.value, readPath('audio'));
    };
  }
}

function syncSoundTags() {
  const muted = readPath('audio.muted');
  $$('.sound-item').forEach((i) => { i.style.opacity = muted ? '0.45' : '1'; });
}

/* ==========================================================
   设置
   ========================================================== */
function bindSettings() {
  bindSwitch($('#gNotify'), 'general.notify', (on) => {
    if (!on) return;
    if (!('Notification' in window)) {
      toast('当前浏览器不支持系统通知');
      setSwitch($('#gNotify'), false);
      writePath('general.notify', false);
      return;
    }
    if (Notification.permission === 'granted') {
      $('#notifyHint').textContent = '已授权，页面在后台也能收到提醒';
      return;
    }
    if (Notification.permission === 'denied') {
      toast('通知权限已被拒绝，请在浏览器地址栏重新允许');
      $('#notifyHint').textContent = '权限被拒绝，需在浏览器站点设置里允许';
      setSwitch($('#gNotify'), false);
      writePath('general.notify', false);
      return;
    }
    Notification.requestPermission().then((p) => {
      if (p === 'granted') {
        $('#notifyHint').textContent = '已授权，页面在后台也能收到提醒';
        toast('系统通知已开启');
      } else {
        $('#notifyHint').textContent = '未授权，仅页面内提醒';
        setSwitch($('#gNotify'), false);
        writePath('general.notify', false);
      }
    });
  });

  bindSwitch($('#gBadge'), 'general.badgeBreath');
  bindSwitch($('#gWorkHours'), 'general.workHoursOnly', (on) => {
    $('#workHoursRow').hidden = !on;
  });

  const ws = $('#workStart'), we = $('#workEnd');
  ws.value = readPath('general.workStart');
  we.value = readPath('general.workEnd');
  ws.onchange = () => { writePath('general.workStart', ws.value || '09:00'); renderWorkHours(); };
  we.onchange = () => { writePath('general.workEnd', we.value || '18:00'); renderWorkHours(); };

  $('#resetStats').onclick = () => {
    D.stats.waterCups = 0;
    D.stats.focusMin = 0;
    D.stats.remindTotal = 0;
    D.stats.remindDone = 0;
    D.stats.logs = [];
    D.lastWaterAt = 0; D.lastEyeAt = 0; D.lastSitAt = 0; D.lastStandAt = 0;
    store.save();
    updateMetrics(); renderCups(); renderCharts(); renderRemindLog(); renderStreak();
    toast('今日统计已清空');
  };

  $('#exportData').onclick = () => {
    const blob = new Blob([JSON.stringify(D, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    const d = new Date();
    const stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    a.href = URL.createObjectURL(blob);
    a.download = `baobei-qishen-backup-${stamp}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast('备份已导出');
  };

  $('#importData').onclick = () => $('#importFile').click();
  $('#importFile').onchange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result));
        if (!obj || typeof obj !== 'object') throw new Error('格式不对');
        store.replace(obj);
        D = store.data;
        renderAll();
        toast('备份已导入');
      } catch (err) {
        toast('导入失败：' + err.message);
      }
    };
    reader.readAsText(f);
    e.target.value = '';
  };
}

function renderWorkHours() {
  const s = readPath('general.workStart');
  const e = readPath('general.workEnd');
  $('#workHoursHint').textContent = `${s} 至 ${e}`;
}

/* ==========================================================
   久坐/离席检测（网页版：监听鼠标键盘活动）
   ========================================================== */
function bindActivity() {
  const touch = () => { lastActivityAt = Date.now(); };
  ['mousemove', 'mousedown', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll']
    .forEach((ev) => window.addEventListener(ev, touch, { passive: true }));
}

function idleSeconds() {
  return (Date.now() - lastActivityAt) / 1000;
}

/* ==========================================================
   提醒引擎
   ========================================================== */
const lastOf = (key, fallback) => {
  const v = D[key];
  return (!v || v <= 0) ? fallback : v;
};
const due = (key, intervalMin) => Date.now() - lastOf(key, Date.now()) >= intervalMin * 60000;

function inWorkHours() {
  const nowD = new Date();
  const hm = nowD.getHours() * 60 + nowD.getMinutes();
  const p = (s) => {
    const [a, b] = String(s).split(':').map(Number);
    return (a || 0) * 60 + (b || 0);
  };
  const start = p(D.general.workStart);
  const end = p(D.general.workEnd);
  if (start <= end) return hm >= start && hm <= end;
  return hm >= start || hm <= end;   // 跨零点的时段
}

function checkReminders() {
  if (pumpOpen) return;
  const nowTs = Date.now();
  if (D.general.workHoursOnly && !inWorkHours()) return;

  const idle = D.sit.idleGuard ? idleSeconds() : 0;

  if (D.water.enabled && due('lastWaterAt', D.water.intervalMin)) { trigger('water'); return; }
  if (D.eye.enabled && due('lastEyeAt', D.eye.intervalMin)) { trigger('eye'); return; }
  // 久坐：正在用电脑（1 分钟内有操作）才提醒
  if (D.sit.enabled && idle < 60 && due('lastSitAt', D.sit.intervalMin)) { trigger('sit'); return; }
  if (D.stand.enabled && due('lastStandAt', D.stand.intervalMin)) { trigger('stand'); return; }
}

const ICON_OF = { water: 'drop', eye: 'eye', sit: 'stand', stand: 'walk', pomodoro: 'timer' };

function titleOf(kind) {
  if (kind === 'water') return '该喝水了';
  if (kind === 'eye') return '护眼时间';
  if (kind === 'sit') return '该起身活动了';
  if (kind === 'stand') return '起来走两步';
  if (kind === 'pomodoro') return '该开始专注了';
  return '提醒';
}

function bodyOf(kind) {
  const nowTs = Date.now();
  const mins = (from) => Math.max(0, Math.round((nowTs - (from || nowTs - 3600000)) / 60000));

  if (kind === 'water') {
    const m = mins(D.lastWaterAt);
    const left = Math.max(0, (D.water.targetCups || 8) - (D.stats.waterCups || 0));
    if (left > 0) return `距离上次喝水已经过去 ${m} 分钟\n今天还差 ${left} 杯达到目标`;
    return `距离上次喝水已经过去 ${m} 分钟\n今天的饮水目标已经达成`;
  }
  if (kind === 'eye') {
    return `已经连续用眼 ${Math.max(D.eye.intervalMin, mins(D.lastEyeAt))} 分钟\n看看 20 英尺外的地方，放松 20 秒`;
  }
  if (kind === 'sit') {
    return `已经连续坐着 ${Math.max(D.sit.intervalMin, mins(D.lastSitAt))} 分钟\n站起来走一走，伸展一下肩颈`;
  }
  if (kind === 'stand') return '站起来活动一下，喝口水\n顺便眺望远处放松眼睛';
  if (kind === 'pomodoro') return `准备开始一段 ${D.pomodoro.focusMin || 25} 分钟的专注\n把手机放远一点`;
  return '';
}

function trigger(kind, opts) {
  const cfgMap = { water: D.water, eye: D.eye, sit: D.sit, stand: D.stand, pomodoro: D.pomodoro };
  const c = cfgMap[kind] || {};
  if (!c.enabled && !(opts && opts.manual)) return;

  D.stats.remindTotal = (D.stats.remindTotal || 0) + 1;
  pushLog(kind, 'fired');
  store.save();

  const payload = {
    kind: kind,
    title: titleOf(kind),
    body: bodyOf(kind),
    sound: c.sound || 'bell',
    icon: ICON_OF[kind] || 'drop',
    manual: !!(opts && opts.manual),
    targetCups: D.water.targetCups,
    currentCups: D.stats.waterCups || 0
  };

  showPump(payload);
  showBadge(payload.title + ' · ' + payload.body.split('\n')[0]);
  notifySystem(payload);
  updateMetrics();
  renderRemindLog();
}

/* ==========================================================
   提醒弹窗
   ========================================================== */
const ICONS = {
  drop:  { cls: 'bg-blue',
    path: '<path d="M12 3c-3.3 4-5 6.6-5 9.2A5 5 0 0 0 12 17a5 5 0 0 0 5-4.8C17 9.6 15.3 7 12 3z"></path><path d="M12 20a2.5 2.5 0 0 0 2.5-2.5"></path>' },
  eye:   { cls: 'bg-green',
    path: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"></path><circle cx="12" cy="12" r="2.6"></circle>' },
  stand: { cls: 'bg-orange',
    path: '<circle cx="12" cy="4.5" r="2"></circle><path d="M12 7v6M8 21l4-6 4 6M12 13l-3 2"></path>' },
  walk:  { cls: 'bg-purple',
    path: '<circle cx="13" cy="4.5" r="2"></circle><path d="M13 7l-2 4 2 3 1 6M11 11L8 10M13 14l3 3"></path>' },
  timer: { cls: 'bg-blue',
    path: '<circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l2.5 2"></path><path d="M9 2h6"></path>' }
};

const BUTTONS = {
  water: [{ label: '喝了一杯', cls: 'primary', action: 'drink' },
          { label: '延后 10 分钟', action: 'snooze', minutes: 10 }],
  eye:   [{ label: '已远眺放松', cls: 'primary', action: 'done' },
          { label: '延后 10 分钟', action: 'snooze', minutes: 10 }],
  sit:   [{ label: '已起身活动', cls: 'primary', action: 'done' },
          { label: '延后 10 分钟', action: 'snooze', minutes: 10 }],
  stand: [{ label: '已走动', cls: 'primary', action: 'done' },
          { label: '延后 15 分钟', action: 'snooze', minutes: 15 }],
  pomodoro: [{ label: '开始专注', cls: 'primary', action: 'done' },
             { label: '今天先不开始', action: 'snooze', minutes: 60 }]
};

const SUB_BUTTONS = [
  { label: '今天不再提醒', action: 'skipToday' },
  { label: '自定义文案', action: 'custom' }
];

function showPump(p) {
  pumpData = p;
  pumpOpen = true;
  mutedOnce = false;

  const ic = ICONS[p.icon] || ICONS.drop;
  $('#iconWrap').className = 'icon-wrap ' + ic.cls;
  $('#iconSvg').innerHTML = ic.path;

  $('#pumpTitle').textContent = p.title;
  $('#pumpBody').textContent = p.body;
  $('#soundName').textContent = HealthAudio.names[p.sound] || '清铃';

  if (p.kind === 'water' && p.targetCups) {
    $('#pumpProgress').hidden = false;
    $('#pumpProgressFill').style.width = Math.min(100, (p.currentCups / p.targetCups) * 100) + '%';
  } else {
    $('#pumpProgress').hidden = true;
  }

  buildRow($('#rowMain'), BUTTONS[p.kind] || BUTTONS.water);
  buildRow($('#rowSub'), SUB_BUTTONS);

  $('#hintRow').textContent = p.manual ? '手动触发的测试提醒' : '点击卡片外区域可关闭';
  $('#pumpMask').hidden = false;
  $('#btnMute').style.opacity = '1';

  setTimeout(() => {
    HealthAudio.play(p.sound, audioCfg());
    $('#soundBtn').classList.add('playing');
  }, 120);

  startTitleFlash(p.title);
}

function buildRow(box, list) {
  box.innerHTML = '';
  list.forEach((b) => {
    const el = document.createElement('div');
    el.className = 'pbtn' + (b.cls ? ' ' + b.cls : '');
    el.textContent = b.label;
    el.onclick = () => {
      if (b.action === 'custom') { doCustom(); return; }
      pumpAction(b.action, { kind: pumpData.kind, minutes: b.minutes || 10 });
    };
    box.appendChild(el);
  });
}

function doCustom() {
  const map = {
    water: '该喝水了\n记得喝够一杯水',
    eye: '护眼时间\n看看远处放松一下',
    sit: '该起身活动了\n站起来走两步',
    stand: '起来走两步\n顺便眺望远方',
    pomodoro: '开始一段专注\n把手机放远一点'
  };
  const base = map[pumpData.kind] || pumpData.title;
  const txt = window.prompt('自定义提醒文案（留空则用默认）', base);
  if (txt === null) return;
  $('#pumpTitle').textContent = txt.split('\n')[0].slice(0, 30) || pumpData.title;
  const rest = txt.split('\n').slice(1).join('\n');
  if (rest) $('#pumpBody').textContent = rest;
}

function closePump() {
  pumpOpen = false;
  $('#pumpMask').hidden = true;
  $('#soundBtn').classList.remove('playing');
  stopTitleFlash();
}

function pumpAction(action, payload) {
  const nowTs = Date.now();
  const kind = payload && payload.kind;

  if (action === 'drink') {
    D.stats.waterCups = (D.stats.waterCups || 0) + 1;
    D.lastWaterAt = nowTs;
    D.stats.remindDone = (D.stats.remindDone || 0) + 1;
    pushLog(kind, 'drink');
  } else if (action === 'done') {
    D.stats.remindDone = (D.stats.remindDone || 0) + 1;
    if (kind === 'water') D.lastWaterAt = nowTs;
    if (kind === 'eye')   D.lastEyeAt = nowTs;
    if (kind === 'sit')   D.lastSitAt = nowTs;
    if (kind === 'stand') D.lastStandAt = nowTs;
    pushLog(kind, 'done');
  } else if (action === 'snooze') {
    const back = (payload.minutes || 10) * 60000;
    const iv = (D[kind] && D[kind].intervalMin) || 10;
    const set = (k) => { D[k] = nowTs - iv * 60000 + back; };
    if (kind === 'water') set('lastWaterAt');
    if (kind === 'eye')   set('lastEyeAt');
    if (kind === 'sit')   set('lastSitAt');
    if (kind === 'stand') set('lastStandAt');
    pushLog(kind, 'snooze');
  } else if (action === 'skipToday') {
    // 压到今晚 24 点之后才再次到期
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    const iv = (D[kind] && D[kind].intervalMin) || 10;
    const until = midnight.getTime() - iv * 60000;
    if (kind === 'water') D.lastWaterAt = until;
    if (kind === 'eye')   D.lastEyeAt = until;
    if (kind === 'sit')   D.lastSitAt = until;
    if (kind === 'stand') D.lastStandAt = until;
    pushLog(kind, 'skip');
    toast('今天不再提醒这一类');
  }

  store.save();
  closePump();
  updateMetrics();
  renderCups();
  renderCharts();
  renderRemindLog();
  renderStreak();
  updateNextChip();
}

function audioCfg() {
  const base = readPath('audio') || { volume: 0.7, fade: true, fadeSec: 5 };
  return {
    volume: base.volume,
    fade: base.fade,
    fadeSec: base.fadeSec,
    muted: mutedOnce || base.muted
  };
}

function bindPump() {
  $('#soundBtn').onclick = $('#btnReplay').onclick = () => {
    HealthAudio.play(pumpData.sound, audioCfg());
    $('#soundBtn').classList.add('playing');
  };

  $('#btnMute').onclick = () => {
    mutedOnce = !mutedOnce;
    $('#btnMute').style.opacity = mutedOnce ? '0.35' : '1';
    $('#hintRow').textContent = mutedOnce ? '本条提醒已静音' : '点击卡片外区域可关闭';
    if (!mutedOnce) HealthAudio.play(pumpData.sound, audioCfg());
  };

  // 点遮罩关闭（点卡片内不关）
  $('#pumpMask').addEventListener('click', (e) => {
    if (e.target === $('#pumpMask')) closePump();
  });
}

/* ==========================================================
   角标 / 系统通知 / 标题闪动
   ========================================================== */
function showBadge(text) {
  if (!D.general.badgeBreath) return;
  $('#badgeText').textContent = text;
  $('#badgeHint').hidden = false;
  clearTimeout(badgeTimer);
  badgeTimer = setTimeout(() => { $('#badgeHint').hidden = true; }, 15000);
}

function notifySystem(p) {
  if (!D.general.notify) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(p.title, { body: p.body, tag: 'baobei-' + p.kind });
  } catch (e) { /* 部分浏览器需 ServiceWorker，忽略 */ }
}

function startTitleFlash(title) {
  stopTitleFlash();
  let on = false;
  titleTimer = setInterval(() => {
    on = !on;
    document.title = on ? '● ' + title : BASE_TITLE;
  }, 900);
}

function stopTitleFlash() {
  if (titleTimer) { clearInterval(titleTimer); titleTimer = null; }
  document.title = BASE_TITLE;
}

/* ==========================================================
   主循环
   ========================================================== */
function tickMain() {
  if (store.rollDay()) { renderAll(); toast('新的一天，记录已重置'); return; }
  checkReminders();
  updateNextChip();
}

function updateNextChip() {
  if (!D) return;
  const nowTs = Date.now();
  const cands = [];
  if (D.water.enabled) cands.push(lastOf('lastWaterAt', nowTs) + D.water.intervalMin * 60000);
  if (D.eye.enabled)   cands.push(lastOf('lastEyeAt', nowTs) + D.eye.intervalMin * 60000);
  if (D.sit.enabled)   cands.push(lastOf('lastSitAt', nowTs) + D.sit.intervalMin * 60000);
  if (D.stand.enabled) cands.push(lastOf('lastStandAt', nowTs) + D.stand.intervalMin * 60000);

  const chip = $('#nextChip');
  if (!cands.length) { chip.textContent = '提醒已全部关闭'; return; }

  const soon = Math.min.apply(null, cands) - nowTs;
  if (soon <= 0) { chip.textContent = '即将提醒'; return; }
  const m = Math.ceil(soon / 60000);
  chip.textContent = '下次提醒 ' + (m >= 60 ? `${Math.floor(m / 60)} 小时 ${m % 60} 分后` : `${m} 分钟后`);
}

/* ==========================================================
   渲染汇总
   ========================================================== */
function renderAll() {
  setSwitch($('#wEnabled'), readPath('water.enabled'));
  setField($('#wInterval'), readPath('water.intervalMin'));
  setField($('#wTargetIn'), readPath('water.targetCups'));
  setField($('#wSize'), readPath('water.cupSize'));

  setSwitch($('#eyeEnabled'), readPath('eye.enabled'));
  setField($('#eyeInterval'), readPath('eye.intervalMin'));
  setSwitch($('#sitEnabled'), readPath('sit.enabled'));
  setField($('#sitInterval'), readPath('sit.intervalMin'));
  setSwitch($('#sitIdle'), readPath('sit.idleGuard'));
  setSwitch($('#standEnabled'), readPath('stand.enabled'));
  setField($('#standInterval'), readPath('stand.intervalMin'));

  setField($('#pomoFocus'), readPath('pomodoro.focusMin'));
  setField($('#pomoShort'), readPath('pomodoro.shortMin'));
  setField($('#pomoLong'), readPath('pomodoro.longMin'));
  setField($('#pomoRounds'), readPath('pomodoro.rounds'));
  if (!pomo.running && pomo.remain <= 0) pomo.remain = phaseMinutes(pomo.phase) * 60;
  renderPomo();

  setSwitch($('#aMuted'), readPath('audio.muted'));
  setSwitch($('#aFade'), readPath('audio.fade'));
  setField($('#aVolume'), Math.round((readPath('audio.volume') || 0.7) * 100));
  $('#volHint').textContent = Math.round((readPath('audio.volume') || 0.7) * 100) + '%';
  $('#sndWater').value = readPath('water.sound');
  $('#sndEye').value = readPath('eye.sound');
  $('#sndSit').value = readPath('sit.sound');
  $('#sndStand').value = readPath('stand.sound');
  $('#sndPomo').value = readPath('pomodoro.sound');
  syncSoundTags();

  setSwitch($('#gBadge'), readPath('general.badgeBreath'));
  setSwitch($('#gNotify'), readPath('general.notify'));
  setSwitch($('#gWorkHours'), readPath('general.workHoursOnly'));
  $('#workHoursRow').hidden = !readPath('general.workHoursOnly');
  $('#workStart').value = readPath('general.workStart');
  $('#workEnd').value = readPath('general.workEnd');
  renderWorkHours();

  renderCups();
  updateMetrics();
  renderCharts();
  renderStreak();
  renderRemindLog();
  updateNextChip();
}

function updateMetrics() {
  const cups = D.stats.waterCups || 0;
  $('#mWater').textContent = cups;
  $('#mFocus').textContent = D.stats.focusMin || 0;
  $('#sWater').textContent = cups;
  $('#sFocus').textContent = D.stats.focusMin || 0;
  const rate = D.stats.remindTotal ? Math.round((D.stats.remindDone || 0) / D.stats.remindTotal * 100) : 0;
  $('#sRate').textContent = rate;
  $('#remindSummary').textContent = `${D.stats.remindDone || 0} / ${D.stats.remindTotal || 0}`;
}

function renderCharts() {
  const h = D.stats.history || [];
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const rec = h.find((x) => x.date === key);
    days.push({
      label: (d.getMonth() + 1) + '/' + d.getDate(),
      water: i === 0 ? (D.stats.waterCups || 0) : (rec ? rec.waterCups : 0),
      focus: i === 0 ? (D.stats.focusMin || 0) : (rec ? rec.focusMin : 0),
      today: i === 0
    });
  }

  const draw = (sel, key, alt, emptyText) => {
    const max = Math.max(...days.map((d) => d[key]));
    if (max <= 0) {
      $(sel).innerHTML = `<div class="chart-empty">${emptyText}</div>`;
      return;
    }
    $(sel).innerHTML = days.map((d) => `
      <div class="chart-col">
        <div class="chart-bar${alt ? ' alt' : ''}" style="height:${Math.max(3, d[key] / max * 88)}px"
             title="${d.label} ${d[key]}"></div>
        <div class="chart-x"${d.today ? ' style="color:var(--accent);font-weight:500;"' : ''}>${d.label}</div>
      </div>`).join('');
  };
  draw('#waterChart', 'water', false, '最近七天还没有饮水记录，先喝一杯试试');
  draw('#focusChart', 'focus', true, '最近七天还没有专注记录，开一轮番茄钟试试');
}

function renderStreak() {
  const h = D.stats.history || [];
  const byDate = new Map(h.map((r) => [r.date, r]));
  const todayKey = new Date().toISOString().slice(0, 10);
  const hasToday = (D.stats.waterCups || 0) > 0;

  let n = 0;
  const cursor = new Date();
  if (!hasToday) cursor.setDate(cursor.getDate() - 1);

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    const rec = key === todayKey ? { waterCups: D.stats.waterCups } : byDate.get(key);
    if (rec && (rec.waterCups || 0) > 0) { n++; cursor.setDate(cursor.getDate() - 1); }
    else break;
    if (n > 400) break;
  }
  $('#sStreak').textContent = n;
  $('#streakDays').textContent = n + ' 天';
}

const KIND_LABEL = { water: '喝水', eye: '护眼', sit: '久坐', stand: '走动', pomodoro: '番茄钟' };
const ACTION_LABEL = { fired: '已提醒', drink: '喝了一杯', done: '已处理', snooze: '延后', skip: '今日静默' };
const ACTION_DOT = { fired: 'var(--orange)', drink: 'var(--accent)', done: 'var(--green)', snooze: 'var(--text-tertiary)', skip: 'var(--purple)' };

function pushLog(kind, action) {
  D.stats.logs = D.stats.logs || [];
  D.stats.logs.push({ ts: Date.now(), kind, action });
  if (D.stats.logs.length > 60) D.stats.logs.shift();
}

function renderRemindLog() {
  const box = $('#remindLog');
  const logs = (D.stats.logs || []).slice().reverse().slice(0, 12);
  if (!logs.length) {
    box.innerHTML = '<div class="empty">今天还没有提醒记录</div>';
    return;
  }
  box.innerHTML = logs.map((l) => {
    const d = new Date(l.ts);
    const t = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    return `<div class="log-row">
      <span class="log-dot" style="background:${ACTION_DOT[l.action] || 'var(--text-tertiary)'}"></span>
      <span class="log-time tnum">${t}</span>
      <span class="log-text">${KIND_LABEL[l.kind] || l.kind}</span>
      <span class="log-state${l.action === 'done' || l.action === 'drink' ? ' ok' : ''}">${ACTION_LABEL[l.action] || l.action}</span>
    </div>`;
  }).join('');
}

/* ==========================================================
   快捷键 / 提示条
   ========================================================== */
function bindKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (pumpOpen) closePump(); return; }

    const tag = (e.target.tagName || '').toLowerCase();
    const editing = tag === 'input' || tag === 'select' || tag === 'textarea';

    if (e.code === 'Space' && !editing) {
      e.preventDefault();
      if (pumpOpen) return;
      switchPage('pomodoro');
      togglePomo();
      return;
    }
    if (!editing && /^[1-6]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      switchPage(PAGE_ORDER[Number(e.key) - 1]);
    }
  });
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => { t.hidden = true; }, 240);
  }, 2200);
}
window.__toast = toast;

$('#badgeHint').onclick = () => { $('#badgeHint').hidden = true; };

boot().catch(error => { console.error(error); document.body.textContent = '无法连接应用数据库，请重新打开应用后重试。'; });
