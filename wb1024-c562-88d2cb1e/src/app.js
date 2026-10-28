'use strict';

/**
 * 番茄专注 · 网页版 —— 主逻辑
 * 计时引擎（Worker 抗后台节流）/ 番茄循环 / 提醒调度 / 任务与记账 / 本地存储
 */

(function () {

  const Audio = window.AudioEngine;

  /* ---------------- 常量 ---------------- */

  const K_SETTINGS = 'tfw.settings.v1';
  const K_DATA = 'tfw.data.v1';
  const RING_SPAN = 344;      // 圆环可用弧长（360 - 两端留白）
  const RING_START = 8;       // 起始偏移角度

  const DEFAULT_SETTINGS = {
    focusMin: 25,
    shortBreakMin: 5,
    longBreakMin: 15,
    roundsBeforeLongBreak: 4,
    autoStartBreak: true,
    autoStartNextFocus: false,
    focusModeOnFocusStart: false,
    volume: 0.6,
    focusAudio: { type: 'builtin', builtin: 'rain', files: [], fileNames: [], url: '' },
    breakAudio: { type: 'none', builtin: 'waves', files: [], fileNames: [], url: '' },
    remindFocus: { sound: true, notify: true, fullscreen: false, flash: false },
    remindBreak: { sound: true, notify: false, fullscreen: false, flash: false },
    alertTone: 'chime',
    alertVolume: 0.8
  };

  /* ---------------- 状态 ---------------- */

  let S = clone(DEFAULT_SETTINGS);
  let D = { dayKey: '', tasks: [], activeTaskId: null, records: [] };

  let phase = 'focus';
  let running = false;
  let total = 0;
  let remaining = 0;
  let endTime = 0;
  let completedRounds = 0;

  let audioTarget = 'focus';
  let previewing = false;

  let alertCb = null;
  let blinkHandle = null;
  let blinkStopTimer = null;

  let focusElapsed = 0;
  let segmentStart = 0;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.prototype.slice.call(document.querySelectorAll(s));

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------------- 本地存储 ---------------- */

  function loadSettings() {
    try {
      const raw = localStorage.getItem(K_SETTINGS);
      if (raw) {
        const s = JSON.parse(raw);
        S = deepMerge(clone(DEFAULT_SETTINGS), s);
      }
    } catch (e) { /* 损坏则用默认值 */ }
  }

  function deepMerge(base, patch) {
    if (!patch || typeof patch !== 'object') return base;
    Object.keys(patch).forEach((k) => {
      const v = patch[k];
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        base[k] = deepMerge((base && typeof base[k] === 'object') ? base[k] : {}, v);
      } else {
        base[k] = v;
      }
    });
    return base;
  }

  let saveTimer = null;
  function saveSettings() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(K_SETTINGS, JSON.stringify(S)); } catch (e) { /* 配额满时忽略 */ }
    }, 150);
  }

  function todayKey(d) {
    const t = d || new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(K_DATA);
      if (raw) {
        const d = JSON.parse(raw);
        D = {
          dayKey: d.dayKey || todayKey(),
          tasks: Array.isArray(d.tasks) ? d.tasks : [],
          activeTaskId: d.activeTaskId || null,
          records: Array.isArray(d.records) ? d.records : []
        };
      } else {
        D.dayKey = todayKey();
      }
    } catch (e) {
      D = { dayKey: todayKey(), tasks: [], activeTaskId: null, records: [] };
    }
    if (!D.dayKey) D.dayKey = todayKey();
  }

  let dataTimer = null;
  function saveData() {
    if (dataTimer) clearTimeout(dataTimer);
    dataTimer = setTimeout(() => {
      try {
        // 记录上限 5000 条，避免 localStorage 无限膨胀
        if (D.records.length > 5000) D.records = D.records.slice(-5000);
        localStorage.setItem(K_DATA, JSON.stringify(D));
      } catch (e) {
        toast('本机存储空间不足，建议导出备份后清理');
      }
    }, 160);
  }

  /* ---------------- 工具 ---------------- */

  function fmt(sec) {
    const s = Math.max(0, Math.ceil(sec));
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${m}:${ss}`;
  }

  function fmtShort(sec) {
    const m = Math.round(Math.max(0, sec) / 60);
    if (m < 1) return '';
    if (m < 60) return `${m} 分钟`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r ? `${h} 小时 ${r} 分` : `${h} 小时`;
  }

  let toastTimer = null;
  function toast(msg) {
    const el = $('#toastBox');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  /* ---------------- 记账 ---------------- */

  function beginSegment() { segmentStart = Date.now(); }

  function endSegment() {
    if (segmentStart) {
      focusElapsed += (Date.now() - segmentStart) / 1000;
      segmentStart = 0;
    }
  }

  function liveFocusSeconds() {
    return Math.max(0, focusElapsed + (segmentStart ? (Date.now() - segmentStart) / 1000 : 0));
  }

  /** 落账：不足 1 分钟不记，避免误触产生垃圾数据 */
  function flushFocusRecord(completed) {
    endSegment();
    const seconds = Math.round(focusElapsed);
    focusElapsed = 0;
    if (seconds < 60) return null;

    const task = D.tasks.find((t) => t.id === D.activeTaskId) || null;
    const endedAt = new Date();
    D.records.push({
      id: `r_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
      taskId: task ? task.id : null,
      taskTitle: task ? task.title : '',
      dayKey: todayKey(endedAt),
      startedAt: new Date(endedAt.getTime() - seconds * 1000).toISOString(),
      endedAt: endedAt.toISOString(),
      durationSeconds: seconds,
      completed: !!completed
    });
    saveData();
    return { durationSeconds: seconds };
  }

  function todayStats() {
    const key = todayKey();
    const st = { totalSeconds: 0, completedPomodoros: 0, recordCount: 0, byTask: {} };
    D.records.forEach((r) => {
      if (r.dayKey !== key) return;
      st.totalSeconds += r.durationSeconds || 0;
      st.recordCount++;
      if (r.completed) st.completedPomodoros++;
      if (r.taskId) st.byTask[r.taskId] = (st.byTask[r.taskId] || 0) + (r.durationSeconds || 0);
    });
    return st;
  }

  function roundsPerCycle() {
    return Math.max(2, Number(S.roundsBeforeLongBreak) || 4);
  }

  function phaseDuration(p) {
    if (p === 'focus') return Math.max(1, Number(S.focusMin) || 25) * 60;
    if (p === 'shortBreak') return Math.max(1, Number(S.shortBreakMin) || 5) * 60;
    return Math.max(1, Number(S.longBreakMin) || 15) * 60;
  }

  function currentAudioCfg() {
    return phase === 'focus' ? S.focusAudio : S.breakAudio;
  }

  function isTargetPhase() {
    return audioTarget === 'focus' ? phase === 'focus' : phase !== 'focus';
  }

  /* ---------------- 渲染 ---------------- */

  const PHASE_TEXT = {
    focus: { idle: '待专注', running: '专注中', full: '专 注 中', pill: '专注' },
    shortBreak: { idle: '待休息', running: '短休息', full: '短 休 息', pill: '短休息' },
    longBreak: { idle: '待长休', running: '长休息', full: '长 休 息', pill: '长休息' }
  };

  function updateTitle() {
    if (blinkHandle) return;
    document.title = running
      ? `${fmt(remaining)} · ${PHASE_TEXT[phase].pill} — 番茄专注`
      : '番茄专注 · 一小时只做一件事';
  }

  function updateDisplay() {
    const text = fmt(remaining);
    $('#timeText').textContent = text;
    $('#foTime').textContent = text;

    const ratio = total > 0 ? Math.min(1, Math.max(0, 1 - remaining / total)) : 0;
    const deg = RING_START + ratio * RING_SPAN;
    $('#timerRing').style.setProperty('--progress', deg.toFixed(2) + 'deg');
    $('#foBar').style.width = (ratio * 100).toFixed(2) + '%';

    const p = PHASE_TEXT[phase];
    $('#phaseLabel').textContent = p.pill;
    $('#phaseState').textContent = running ? p.running : p.idle;
    $('#foPhase').textContent = p.full;

    const cur = D.tasks.find((t) => t.id === D.activeTaskId);
    $('#foTask').textContent = cur ? cur.title : '';
    $('#foRound').textContent = `第 ${Math.min(completedRounds + 1, roundsPerCycle())} / ${roundsPerCycle()} 轮`;

    updateTitle();
    updateLiveStats();
  }

  function updateButtons() {
    const label = $('#startLabel');
    label.textContent = running ? '暂停' : (phase === 'focus' ? '开始专注' : '开始休息');
    $('#startIcon').innerHTML = running
      ? '<path d="M8 5h3v14H8zM13 5h3v14h-3z"/>'
      : '<path d="m8 5 11 7-11 7V5Z"/>';
    $('#foToggle').textContent = running ? '暂停' : '开始';
    $$('.mode-button').forEach((b) => b.classList.toggle('active', b.dataset.mode === phase));
    document.body.classList.toggle('is-break', phase !== 'focus');
    document.body.classList.toggle('running', running);
  }

  function updateRounds() {
    const n = roundsPerCycle();
    const el = $('#rounds');
    el.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const d = document.createElement('span');
      d.className = 'round-dot';
      if (i < completedRounds) d.classList.add('done');
      else if (i === completedRounds && phase === 'focus') d.classList.add('current');
      el.appendChild(d);
    }
  }

  function renderCurTask() {
    const t = D.tasks.find((x) => x.id === D.activeTaskId) || null;
    const el = $('#curTaskName');
    if (t) {
      el.textContent = t.title;
      el.classList.remove('none');
    } else {
      el.textContent = D.tasks.length ? '未指定任务，点任务名选择' : '还没有任务';
      el.classList.add('none');
    }
  }

  function renderTasks() {
    const ul = $('#taskList');
    ul.innerHTML = '';
    const st = todayStats();

    D.tasks.forEach((t) => {
      const li = document.createElement('li');
      li.className = 'task-item';
      if (t.id === D.activeTaskId) li.classList.add('active');
      if (t.done) li.classList.add('done');

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'task-check';
      cb.checked = !!t.done;
      cb.title = '标记完成';
      cb.addEventListener('click', (e) => { e.stopPropagation(); toggleTaskDone(t.id); });

      const title = document.createElement('span');
      title.className = 'task-title';
      title.textContent = t.title;
      title.title = '点击设为当前专注任务';
      title.addEventListener('click', () => setActiveTask(t.id));

      li.appendChild(cb);
      li.appendChild(title);

      if (t.id === D.activeTaskId) {
        const badge = document.createElement('span');
        badge.className = 'task-now';
        badge.textContent = '当前';
        li.appendChild(badge);
      }

      let secs = st.byTask[t.id] || 0;
      if (t.id === D.activeTaskId && running && phase === 'focus') secs += liveFocusSeconds();
      if (secs >= 60) {
        const tm = document.createElement('span');
        tm.className = 'task-time';
        tm.textContent = fmtShort(secs);
        li.appendChild(tm);
      }

      const del = document.createElement('button');
      del.className = 'task-del';
      del.textContent = '✕';
      del.title = '删除任务';
      del.addEventListener('click', (e) => { e.stopPropagation(); removeTask(t.id); });

      li.appendChild(del);
      ul.appendChild(li);
    });

    $('#taskEmpty').style.display = D.tasks.length ? 'none' : '';

    const doneCount = D.tasks.filter((t) => t.done).length;
    $('#taskCount').textContent = D.tasks.length ? `${doneCount} / ${D.tasks.length}` : '';

    renderCurTask();
  }

  function renderStats() {
    const st = todayStats();
    $('#statTotal').textContent = fmtShort(st.totalSeconds) || '0 分钟';
    $('#statPomo').textContent = String(st.completedPomodoros || 0);

    const doneCount = D.tasks.filter((t) => t.done).length;
    $('#statDone').textContent = `${doneCount} / ${D.tasks.length}`;

    $('#statTip').textContent = st.recordCount
      ? `今日已记录 ${st.recordCount} 段专注；正在进行的一段结束后计入`
      : '今天还没有记录。专注满 1 分钟自动记账。';

    // 今日进度条：以 8 个番茄为满格参考
    const pct = Math.min(100, (st.completedPomodoros / 8) * 100);
    $('#todayBar').style.width = pct + '%';
  }

  function updateLiveStats() {
    if (!(phase === 'focus' && running)) return;
    const st = todayStats();
    const txt = fmtShort(st.totalSeconds + liveFocusSeconds()) || '0 分钟';
    const el = $('#statTotal');
    if (el.textContent !== txt) el.textContent = txt;
  }

  /* ---------------- 阶段控制 ---------------- */

  function setPhase(p) {
    phase = p;
    total = phaseDuration(p);
    remaining = total;
    running = false;
    endTime = 0;
    stopTick();

    updateDisplay();
    updateRounds();
    updateButtons();
  }

  function start() {
    if (running) return;
    if (remaining <= 0) remaining = total;

    const fresh = Math.abs(remaining - total) < 0.05;

    running = true;
    endTime = Date.now() + remaining * 1000;
    if (phase === 'focus') beginSegment();

    updateButtons();
    updateDisplay();
    startTick();

    if (previewing) { previewing = false; $('#previewTip').textContent = ''; }
    Audio.play(currentAudioCfg());

    if (phase === 'focus' && fresh && S.focusModeOnFocusStart) enterFocusMode();
  }

  function pause() {
    if (!running) return;
    running = false;
    remaining = Math.max(0, (endTime - Date.now()) / 1000);
    if (phase === 'focus') endSegment();
    stopTick();
    updateButtons();
    updateDisplay();
    Audio.stop();
  }

  function toggle() {
    if (running) pause(); else start();
  }

  function reset() {
    running = false;
    endTime = 0;
    stopTick();
    if (phase === 'focus') {
      const rec = flushFocusRecord(false);
      if (rec) toast(`已记录 ${Math.max(1, Math.round(rec.durationSeconds / 60))} 分钟专注`);
    } else {
      focusElapsed = 0;
      segmentStart = 0;
    }
    remaining = total;
    Audio.stop();
    updateButtons();
    updateDisplay();
    renderTasks();
    renderStats();
  }

  function skip() {
    if (remaining <= 0) return;
    completePhase(true, false);
  }

  function switchMode(m) {
    if (m === phase && !running) return;
    if (running) pause();
    if (phase === 'focus') {
      const rec = flushFocusRecord(false);
      if (rec) toast(`已记录 ${Math.max(1, Math.round(rec.durationSeconds / 60))} 分钟专注`);
    } else {
      focusElapsed = 0;
      segmentStart = 0;
    }
    Audio.stop();
    setPhase(m);
    renderTasks();
    renderStats();
  }

  /* ---------------- 阶段完成与提醒 ---------------- */

  function playRemindFx(cfg, title, body) {
    if (cfg.sound) Audio.playAlert(S.alertTone, S.alertVolume);
    if (cfg.notify) notify(title, body);
    if (cfg.flash) startBlinkTitle();
  }

  function notify(title, body) {
    try {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'granted') {
        new Notification(title, { body, tag: 'tomato-focus', icon: FAVICON });
      }
    } catch (e) { /* 静默失败 */ }
  }

  const FAVICON = 'data:image/svg+xml,' + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='37' r='23' fill='#ff6058'/><path d='M32 15c-6-8-16-8-16-8 2 8 8 12 8 12s-2 2-6 9c8 0 12-4 12-4s2 6 2 10c3-8 6-10 6-10s5 5 12 4c-4-7-11-8-11-8s6-3 8-11c0 0-9 0-15 6z' fill='#3b8e5a'/></svg>"
  );

  function completePhase(silent, natural) {
    running = false;
    stopTick();
    Audio.stop();
    const finished = phase;

    if (finished === 'focus') {
      flushFocusRecord(natural !== false);
      completedRounds++;
      const n = roundsPerCycle();
      const isLong = completedRounds >= n;
      const nextPhase = isLong ? 'longBreak' : 'shortBreak';
      const title = '专注结束';
      const body = isLong ? '辛苦了，来一次长休息' : '起身活动一下，放松眼睛';

      setPhase(nextPhase);

      const proceed = () => {
        if (S.autoStartBreak) start();
      };

      renderTasks();
      renderStats();

      if (silent) { proceed(); return; }

      const cfg = S.remindFocus;
      playRemindFx(cfg, title, body);

      if (cfg.fullscreen) {
        enterFullscreen();
        showAlert(title, body, () => {
          exitFullscreen();
          proceed();
        });
      } else {
        proceed();
      }
      return;
    }

    // 休息结束
    const wasLong = finished === 'longBreak';
    setPhase('focus');
    if (wasLong) completedRounds = 0;
    updateRounds();
    updateDisplay();

    const cfg = S.remindBreak;
    const title = '休息结束';
    const body = '准备好进入下一个专注了吗？';

    const askOrStart = () => {
      if (S.autoStartNextFocus) start();
      else showAsk(!!cfg.fullscreen);
    };

    if (silent) { askOrStart(); return; }

    playRemindFx(cfg, title, body);

    if (cfg.fullscreen) {
      enterFullscreen();
      setTimeout(askOrStart, 200);
    } else {
      askOrStart();
    }
  }

  /* ---------------- 计时循环（Worker 抗后台节流） ---------------- */

  let worker = null;
  let fallbackTimer = null;

  function initTick() {
    try {
      const code = 'let id=null;onmessage=function(e){if(e.data==="start"){if(id)clearInterval(id);id=setInterval(function(){postMessage(0)},250);}else{clearInterval(id);id=null;}};';
      const blob = new Blob([code], { type: 'text/javascript' });
      worker = new Worker(URL.createObjectURL(blob));
      worker.onmessage = tick;
    } catch (e) {
      worker = null;
    }
  }

  function startTick() {
    if (worker) worker.postMessage('start');
    // A blocked blob Worker can fail asynchronously under the host CSP.
    // Keep a timer as a fallback; tick is based on wall time and is idempotent.
    if (!fallbackTimer) fallbackTimer = setInterval(() => { if (running) tick(); }, 250);
  }

  function stopTick() {
    if (worker) worker.postMessage('stop');
    if (fallbackTimer) { clearInterval(fallbackTimer); fallbackTimer = null; }
  }

  function tick() {
    if (!running) return;
    remaining = Math.max(0, (endTime - Date.now()) / 1000);
    updateDisplay();
    if (remaining <= 0) completePhase(false, true);
  }

  /* ---------------- 覆盖层 ---------------- */

  function showAlert(title, body, cb) {
    $('#alertTitle').textContent = title;
    $('#alertBody').textContent = body;
    alertCb = cb;
    $('#alertOverlay').classList.remove('hidden');
  }

  function confirmAlert() {
    $('#alertOverlay').classList.add('hidden');
    const cb = alertCb;
    alertCb = null;
    if (typeof cb === 'function') cb();
  }

  function showAsk(goFull) {
    $('#askOverlay').classList.remove('hidden');
    if (goFull) $('#askOverlay').classList.add('is-full');
  }

  function closeAsk(startNext) {
    $('#askOverlay').classList.add('hidden');
    exitFullscreen();
    if (startNext) start();
  }

  function enterFocusMode() {
    $('#focusOverlay').classList.remove('hidden');
    enterFullscreen();
  }

  function exitFocusMode() {
    $('#focusOverlay').classList.add('hidden');
    exitFullscreen();
  }

  function enterFullscreen() {
    const el = document.documentElement;
    if (document.fullscreenElement) return;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) {
      try {
        const p = req.call(el);
        if (p && p.catch) p.catch(() => { /* 用户拒绝或环境不支持 */ });
      } catch (e) { /* ignore */ }
    }
  }

  function exitFullscreen() {
    if (!document.fullscreenElement) return;
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) {
      try {
        const p = exit.call(document);
        if (p && p.catch) p.catch(() => { /* ignore */ });
      } catch (e) { /* ignore */ }
    }
  }

  /* ---------------- 标题闪烁 ---------------- */

  function startBlinkTitle() {
    stopBlinkTitle();
    let on = false;
    blinkHandle = setInterval(() => {
      on = !on;
      document.title = on ? '⏰ 时间到！' : '番茄专注';
    }, 900);
    blinkStopTimer = setTimeout(stopBlinkTitle, 60000);
  }

  function stopBlinkTitle() {
    if (blinkHandle) { clearInterval(blinkHandle); blinkHandle = null; }
    if (blinkStopTimer) { clearTimeout(blinkStopTimer); blinkStopTimer = null; }
    updateTitle();
  }

  window.addEventListener('focus', stopBlinkTitle);

  /* ---------------- 任务操作 ---------------- */

  function addTask(title) {
    const raw = String(title || '').trim();
    if (!raw) return;
    D.tasks.push({
      id: `t_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      title: raw.slice(0, 200),
      done: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    });
    if (!D.activeTaskId) D.activeTaskId = D.tasks[D.tasks.length - 1].id;
    saveData();
    renderTasks();
    renderStats();
    updateDisplay();
  }

  function toggleTaskDone(id) {
    const t = D.tasks.find((x) => x.id === id);
    if (!t) return;
    t.done = !t.done;
    t.completedAt = t.done ? new Date().toISOString() : null;
    saveData();
    renderTasks();
    renderStats();
  }

  function removeTask(id) {
    D.tasks = D.tasks.filter((x) => x.id !== id);
    if (D.activeTaskId === id) {
      const next = D.tasks.find((x) => !x.done) || D.tasks[0] || null;
      D.activeTaskId = next ? next.id : null;
    }
    saveData();
    renderTasks();
    renderStats();
    updateDisplay();
  }

  function setActiveTask(id) {
    D.activeTaskId = (D.activeTaskId === id) ? null : id;
    saveData();
    renderTasks();
    updateDisplay();
  }

  /** 跨天：清空今日任务，历史记录保留 */
  function rolloverIfNeeded() {
    const today = todayKey();
    if (!D.dayKey || D.dayKey === today) return;
    D.dayKey = today;
    D.tasks = [];
    D.activeTaskId = null;
    saveData();
    renderTasks();
    renderStats();
    updateDisplay();
    toast('已进入新的一天，今日任务已重置');
  }

  /* ---------------- 声音面板 ---------------- */

  function buildBuiltinOptions() {
    const sel = $('#audioBuiltin');
    sel.innerHTML = '';
    Audio.BUILTIN_SOURCES.forEach((s) => {
      const o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.name;
      sel.appendChild(o);
    });
  }

  function renderFileList(names) {
    const ul = $('#fileList');
    ul.innerHTML = '';
    (names || []).forEach((nm, i) => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.className = 'nm';
      span.textContent = nm;
      const rm = document.createElement('button');
      rm.className = 'rm';
      rm.type = 'button';
      rm.textContent = '✕';
      rm.title = '移除';
      rm.addEventListener('click', () => {
        const key = audioTarget === 'focus' ? 'focusAudio' : 'breakAudio';
        const removed = S[key].files.splice(i, 1)[0];
        if (removed) { Audio.forgetLocalFile(removed); URL.revokeObjectURL(removed); }
        S[key].fileNames.splice(i, 1);
        saveSettings();
        renderFileList(S[key].fileNames);
      });
      li.appendChild(span);
      li.appendChild(rm);
      ul.appendChild(li);
    });
  }

  function toggleAudioRows() {
    const t = $('#audioType').value;
    $('#rowBuiltin').style.display = (t === 'builtin') ? '' : 'none';
    $('#rowLocal').style.display = (t === 'local') ? '' : 'none';
    $('#rowUrl').style.display = (t === 'url') ? '' : 'none';
  }

  function fillAudioUI() {
    const cfg = currentAudioCfg();
    $('#audioType').value = cfg.type || 'none';
    $('#audioBuiltin').value = cfg.builtin || 'rain';
    $('#audioUrl').value = cfg.url || '';
    renderFileList(cfg.fileNames || []);
    toggleAudioRows();
    $$('#audioTarget .seg-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.target === audioTarget);
    });
  }

  function applyAudioChange() {
    const key = audioTarget === 'focus' ? 'focusAudio' : 'breakAudio';
    S[key].type = $('#audioType').value;
    S[key].builtin = $('#audioBuiltin').value;
    S[key].url = $('#audioUrl').value.trim();
    saveSettings();
    toggleAudioRows();
    if (running && isTargetPhase()) Audio.play(S[key]);
  }

  /* ---------------- 导出 / 导入 ---------------- */

  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function csvEscape(v) {
    const s = String(v == null ? '' : v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function exportCsv() {
    if (!D.records.length) { toast('还没有专注记录，先专注一段吧'); return; }
    const rows = [['日期', '开始时间', '结束时间', '任务', '时长（分钟）', '是否完成']];
    D.records.forEach((r) => {
      const st = new Date(r.startedAt);
      const en = new Date(r.endedAt);
      const hm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      rows.push([
        r.dayKey,
        hm(st),
        hm(en),
        r.taskTitle || '（未指定任务）',
        (r.durationSeconds / 60).toFixed(1),
        r.completed ? '是' : '早退'
      ]);
    });
    const csv = '\uFEFF' + rows.map((r) => r.map(csvEscape).join(',')).join('\r\n');
    download(`番茄专注-专注记录-${todayKey()}.csv`, csv, 'text/csv;charset=utf-8');
    toast(`已导出 ${D.records.length} 条记录`);
  }

  function exportJson() {
    const payload = {
      app: 'tomato-focus-web',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: D
    };
    download(`番茄专注-备份-${todayKey()}.json`, JSON.stringify(payload, null, 2), 'application/json');
    toast('备份已下载');
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const src = parsed && parsed.data ? parsed.data : parsed;
        if (!src || !Array.isArray(src.records)) throw new Error('格式不符');

        const exist = new Set(D.records.map((r) => r.id));
        let added = 0;
        src.records.forEach((r) => {
          if (!r || !r.id || exist.has(r.id)) return;
          D.records.push(r);
          exist.add(r.id);
          added++;
        });

        if (Array.isArray(src.tasks) && src.dayKey === D.dayKey) {
          const tExist = new Set(D.tasks.map((t) => t.id));
          src.tasks.forEach((t) => {
            if (t && t.id && !tExist.has(t.id)) D.tasks.push(t);
          });
        }

        saveData();
        renderTasks();
        renderStats();
        toast(`已合并导入，新增 ${added} 条记录`);
      } catch (e) {
        toast('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
  }

  function clearAllData() {
    if (!confirm('确定清空本机的任务与专注记录吗？此操作不可撤销，建议先导出备份。')) return;
    D = { dayKey: todayKey(), tasks: [], activeTaskId: null, records: [] };
    saveData();
    renderTasks();
    renderStats();
    updateDisplay();
    toast('本机数据已清空');
  }

  /* ---------------- UI 绑定 ---------------- */

  function bindUI() {

    // 主控制
    $('#btnStart').addEventListener('click', () => { Audio.unlock(); toggle(); });
    $('#btnSkip').addEventListener('click', skip);
    $('#btnReset').addEventListener('click', reset);

    // 全屏专注页
    $('#foToggle').addEventListener('click', () => { Audio.unlock(); toggle(); });
    $('#foSkip').addEventListener('click', skip);
    $('#foExit').addEventListener('click', exitFocusMode);

    // 强提醒 / 询问
    $('#alertOk').addEventListener('click', confirmAlert);
    $('#askYes').addEventListener('click', () => { Audio.unlock(); closeAsk(true); });
    $('#askNo').addEventListener('click', () => closeAsk(false));

    // 模式切换
    $$('.mode-button').forEach((b) => {
      b.addEventListener('click', () => { Audio.unlock(); switchMode(b.dataset.mode); });
    });

    // 弹窗开关
    $('#btnSound').addEventListener('click', () => { fillAudioUI(); $('#soundDialog').showModal(); });
    $('#btnSettings').addEventListener('click', () => { applySettingsToUI(); $('#settingsDialog').showModal(); });
    $$('[data-close]').forEach((b) => {
      b.addEventListener('click', () => {
        const d = document.getElementById(b.dataset.close);
        if (d) d.close();
      });
    });
    $$('dialog.sheet').forEach((d) => {
      d.addEventListener('click', (e) => {
        if (e.target === d) d.close();   // 点遮罩关闭
      });
    });

    // 时长输入
    ['focusMin', 'shortBreakMin', 'longBreakMin', 'roundsBeforeLongBreak'].forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener('change', () => {
        const min = Number(el.min), max = Number(el.max);
        let v = Math.round(Number(el.value));
        if (!Number.isFinite(v)) v = Number(S[id]);
        v = Math.max(min, Math.min(max, v));
        el.value = v;
        S[id] = v;
        saveSettings();
        markChips();
        updateRounds();
        if (!running) {
          if (id === 'focusMin' && phase === 'focus') setPhase('focus');
          if (id === 'shortBreakMin' && phase === 'shortBreak') setPhase('shortBreak');
          if (id === 'longBreakMin' && phase === 'longBreak') setPhase('longBreak');
        }
      });
    });

    // 快捷时长
    $$('.chip[data-set]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.set;
        const val = Number(btn.dataset.val);
        S[key] = val;
        document.getElementById(key).value = val;
        saveSettings();
        markChips();
        if (!running && phase === 'focus') setPhase('focus');
      });
    });

    // 自动化
    const autoMap = {
      setFocusMode: 'focusModeOnFocusStart',
      setAutoBreak: 'autoStartBreak',
      setAutoNext: 'autoStartNextFocus'
    };
    Object.keys(autoMap).forEach((id) => {
      document.getElementById(id).addEventListener('change', (e) => {
        S[autoMap[id]] = e.target.checked;
        saveSettings();
      });
    });

    // 提醒勾选
    $$('input[data-remind]').forEach((cb) => {
      cb.addEventListener('change', async () => {
        const parts = cb.dataset.remind.split('.');
        const key = parts[0] === 'focus' ? 'remindFocus' : 'remindBreak';
        if (parts[1] === 'notify' && cb.checked) {
          const ok = await ensureNotifyPermission();
          if (!ok) {
            cb.checked = false;
            toast('浏览器未授予通知权限，已关闭该项');
            return;
          }
        }
        S[key][parts[1]] = cb.checked;
        saveSettings();
      });
    });

    // 提示音
    $('#alertTone').addEventListener('change', () => {
      S.alertTone = $('#alertTone').value;
      saveSettings();
    });
    $('#btnTonePreview').addEventListener('click', () => {
      Audio.unlock();
      Audio.playAlert(S.alertTone, S.alertVolume);
    });
    $('#alertVolume').addEventListener('input', () => {
      const v = Number($('#alertVolume').value) / 100;
      S.alertVolume = v;
      $('#alertVolumeText').textContent = Math.round(v * 100) + '%';
      saveSettings();
    });

    // 声音面板
    $$('#audioTarget .seg-btn').forEach((b) => {
      b.addEventListener('click', () => {
        audioTarget = b.dataset.target;
        fillAudioUI();
      });
    });
    ['audioType', 'audioBuiltin', 'audioUrl'].forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener('change', applyAudioChange);
      if (id === 'audioUrl') el.addEventListener('input', applyAudioChange);
    });

    $('#audioFiles').addEventListener('change', (e) => {
      const files = Array.prototype.slice.call(e.target.files || []);
      if (!files.length) return;
      const key = audioTarget === 'focus' ? 'focusAudio' : 'breakAudio';
      (S[key].files || []).forEach((url) => { Audio.forgetLocalFile(url); URL.revokeObjectURL(url); });
      S[key].files = files.map((f) => { const url = URL.createObjectURL(f); Audio.registerLocalFile(url, f); return url; });
      S[key].fileNames = files.map((f) => f.name);
      S[key].type = 'local';
      $('#audioType').value = 'local';
      saveSettings();
      renderFileList(S[key].fileNames);
      toggleAudioRows();
      if (running && isTargetPhase()) Audio.play(S[key]);
    });

    $('#btnPreview').addEventListener('click', () => {
      Audio.unlock();
      if (previewing) {
        Audio.stop();
        previewing = false;
        $('#previewTip').textContent = '';
        return;
      }
      const ok = Audio.play(currentAudioCfg());
      previewing = ok;
      $('#previewTip').textContent = ok ? '正在试听…' : '没有可播放的内容';
      if (!ok) setTimeout(() => { $('#previewTip').textContent = ''; }, 1800);
    });

    $('#volume').addEventListener('input', () => {
      const v = Number($('#volume').value) / 100;
      S.volume = v;
      Audio.setVolume(v);
      $('#volumeText').textContent = Math.round(v * 100) + '%';
      saveSettings();
    });

    // 任务
    const submitTask = () => {
      const input = $('#taskInput');
      addTask(input.value);
      input.value = '';
      input.focus();
    };
    $('#addTaskForm').addEventListener('submit', (e) => { e.preventDefault(); submitTask(); });
    $('#btnToggleAdd').addEventListener('click', () => $('#taskInput').focus());

    // 数据
    $('#btnExportCsv').addEventListener('click', exportCsv);
    $('#btnExportJson').addEventListener('click', exportJson);
    $('#btnImportJson').addEventListener('click', () => $('#importFile').click());
    $('#importFile').addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) importJson(f);
      e.target.value = '';
    });
    $('#btnClearData').addEventListener('click', clearAllData);

    // 快捷键
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (document.querySelector('dialog[open]')) return;

      if (e.code === 'Space') {
        e.preventDefault();
        Audio.unlock();
        toggle();
      } else if (e.key === 'Escape') {
        if (!$('#alertOverlay').classList.contains('hidden')) return;
        if (!$('#askOverlay').classList.contains('hidden')) return;
        if (!$('#focusOverlay').classList.contains('hidden')) exitFocusMode();
      } else if (e.key === 's' || e.key === 'S') {
        skip();
      } else if (e.key === 'r' || e.key === 'R') {
        reset();
      }
    });
  }

  function ensureNotifyPermission() {
    return new Promise((resolve) => {
      if (!('Notification' in window)) { resolve(false); return; }
      if (Notification.permission === 'granted') { resolve(true); return; }
      if (Notification.permission === 'denied') { resolve(false); return; }
      try {
        Notification.requestPermission().then((p) => resolve(p === 'granted'));
      } catch (e) {
        // 老版本浏览器回调式
        try { Notification.requestPermission((p) => resolve(p === 'granted')); } catch (e2) { resolve(false); }
      }
    });
  }

  function markChips() {
    $$('.chip[data-set]').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.dataset.val) === Number(S[btn.dataset.set]));
    });
  }

  function applySettingsToUI() {
    ['focusMin', 'shortBreakMin', 'longBreakMin', 'roundsBeforeLongBreak'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = S[id];
    });
    markChips();

    $('#volume').value = Math.round(S.volume * 100);
    $('#volumeText').textContent = Math.round(S.volume * 100) + '%';

    $('#alertVolume').value = Math.round(S.alertVolume * 100);
    $('#alertVolumeText').textContent = Math.round(S.alertVolume * 100) + '%';
    $('#alertTone').value = S.alertTone || 'chime';

    $$('input[data-remind]').forEach((cb) => {
      const parts = cb.dataset.remind.split('.');
      const key = parts[0] === 'focus' ? 'remindFocus' : 'remindBreak';
      cb.checked = !!(S[key] && S[key][parts[1]]);
    });

    $('#setFocusMode').checked = !!S.focusModeOnFocusStart;
    $('#setAutoBreak').checked = !!S.autoStartBreak;
    $('#setAutoNext').checked = !!S.autoStartNextFocus;

    fillAudioUI();
  }

  function renderDate() {
    const d = new Date();
    const w = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
    $('#todayDate').textContent = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · ${w}`;
  }

  /* ---------------- 启动 ---------------- */

  function init() {
    loadSettings();
    loadData();

    // 本机文件的声音配置刷新后失效，重置为内置音源，避免无声
    ['focusAudio', 'breakAudio'].forEach((k) => {
      if (S[k].type === 'local' && (!S[k].files || !S[k].files.length)) {
        S[k].type = 'builtin';
        S[k].files = [];
        S[k].fileNames = [];
      }
      if (!Array.isArray(S[k].fileNames)) S[k].fileNames = [];
      if (!Array.isArray(S[k].files)) S[k].files = [];
    });

    serializeLocalFiles();

    buildBuiltinOptions();
    bindUI();
    applySettingsToUI();
    Audio.setVolume(S.volume);
    renderDate();

    setPhase('focus');
    updateRounds();
    renderTasks();
    renderStats();

    initTick();

    // 跨天检查
    setInterval(rolloverIfNeeded, 30000);
    // 同步剩余时间到标题（Worker 已负责主循环，这里只兜底）
    setInterval(() => { if (running) updateTitle(); }, 1000);
  }

  /** 清理失效的 blob URL（刷新后不可用） */
  function serializeLocalFiles() {
    let changed = false;
    ['focusAudio', 'breakAudio'].forEach((k) => {
      const cfg = S[k];
      if (cfg.type === 'local') {
        const valid = (cfg.files || []).filter((u) => typeof u === 'string' && u.indexOf('blob:') === 0);
        if (!valid.length) {
          cfg.type = 'none';
          changed = true;
        }
      }
    });
    if (changed) saveSettings();
    return changed;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
