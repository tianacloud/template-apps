(() => {
  'use strict';
  const { COMFORTS, WOOD_WORDS, END_LINES, shanghaiTime, breathingAt, createJournal } = RestCore;
  const $ = id => document.getElementById(id);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const journal = createJournal(window.restStorage, () => { $('storage-note').hidden = false; });
  let view = 'home';
  let ritualRunning = false;
  let finishing = false;
  let timers = [];
  let sound = journal.read('sound') !== false;
  let audioContext;
  let currentTab = 'wood';
  let activeDay = shanghaiTime().day;
  let breathElapsed = 0;
  let breathStarted = 0;
  let breathRunning = false;
  let breathFrame = 0;
  let breathLastPhase = '';
  let breathCompletionTracked = false;
  const track = kind => { try { window.RestAnalytics?.track(kind); } catch (_) { /* 统计不影响放松。 */ } };

  // 完成与结束语使用同一教室的轻量兜底，独立命名 SVG 资源以免互相干扰。
  for (const slot of ['done-room','ending-room']) {
    const art = document.querySelector('.room-art').cloneNode(true);
    art.setAttribute('aria-hidden','true');
    for (const id of ['ceiling-light-1','ceiling-light-2','chalk-writing','lamp-glow','lamp-bulb']) art.querySelector('#'+id)?.classList.add('is-off');
    const ids = [...art.querySelectorAll('[id]')].map(node=>node.id);
    for (const node of [art,...art.querySelectorAll('*')]) {
      for (const attr of [...node.attributes]) {
        let value=attr.value;
        for(const id of ids) value=value.replaceAll(`url(#${id})`,`url(#${slot}-${id})`);
        if(attr.name==='id')value=`${slot}-${value}`;
        node.setAttribute(attr.name,value);
      }
    }
    $(slot).append(art);
  }

  function later(fn, delay) { const id = setTimeout(fn, delay); timers.push(id); return id; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function show(name) {
    view = name;
    for (const item of ['home', 'ending', 'done', 'tools']) $(item + '-view').hidden = item !== name;
    $('home-footer').hidden = name === 'tools' || name === 'ending' || ritualRunning;
  }
  function renderLampWall(total) {
    // 30 个灯位是封顶的可视量，文案仍写真实次数，不虚报。
    const dots = $('lamp-wall').children;
    const lit = Math.min(total, dots.length);
    for (let i = 0; i < dots.length; i++) dots[i].classList.toggle('on', i < lit);
    const note = $('home-total');
    if (!total) { note.textContent = '不必每天来，想歇一歇时就来。'; return; }
    note.replaceChildren(document.createTextNode('第 '));
    const count = document.createElement('b');
    count.textContent = String(total);
    note.append(count, document.createTextNode(' 次，把时间还给自己。'));
  }
  function renderDoneLampWall(total) {
    // 完成页的灯墙是「今晚这盏已经亮着」的收尾，与首页同一套 30 个灯位。
    const row = $('done-lamp-row');
    if (!row) return;
    if (!row.children.length) for (let i = 0; i < 30; i++) row.append(document.createElement('i'));
    const lit = Math.min(total, row.children.length);
    for (let i = 0; i < row.children.length; i++) row.children[i].classList.toggle('on', i < lit);
  }
  function renderHome(focus = false) {
    const { day } = shanghaiTime();
    activeDay = day;
    $('date-label').textContent = new Intl.DateTimeFormat('zh-CN', { timeZone:'Asia/Shanghai', month:'long', day:'numeric', weekday:'long' }).format(new Date());
    const record = journal.getDay(day);
    if (record) { renderDone(record, focus); return; }
    ritualRunning = false;
    $('home-view').classList.remove('ritual');
    $('ritual-controls').hidden = true;
    $('lamp-button').hidden = true;
    ['ceiling-light-1','ceiling-light-2','chalk-writing','lamp-glow','lamp-bulb'].forEach(id => $(id).classList.remove('is-off'));
    const total = journal.total();
    renderLampWall(total);
    $('shutdown-button').disabled = false;
    show('home');
    if (focus) $('shutdown-button').focus();
  }
  function renderDone(record, focus = false) {
    ritualRunning = false;
    $('done-total').replaceChildren(document.createTextNode('这是你第 '));
    const count = document.createElement('strong'); count.textContent = journal.total();
    $('done-total').append(count, document.createTextNode(' 次，把时间还给自己。'));
    $('comfort').textContent = COMFORTS[record.quote];
    renderDoneLampWall(journal.total());
    $('late-note').hidden = !record.late;
    show('done');
    if (focus) $('done-title').focus();
  }
  function startRitual() {
    if (ritualRunning || finishing) return;
    if (journal.getDay(shanghaiTime().day)) { renderHome(true); return; }
    clearTimers();
    ritualRunning = true;
    $('home-view').classList.add('ritual');
    $('ritual-controls').hidden = false;
    $('home-footer').hidden = true;
    $('ritual-prompt').textContent = '让今天的事，慢慢安静下来。';
    $('skip-button').focus();
    const pace = reducedMotion.matches ? 0.2 : 1;
    later(() => $('ceiling-light-1').classList.add('is-off'), 800 * pace);
    later(() => $('ceiling-light-2').classList.add('is-off'), 2100 * pace);
    later(() => $('chalk-writing').classList.add('is-off'), 3200 * pace);
    later(() => {
      $('ritual-prompt').textContent = '最后这盏灯，留给你关。';
      $('lamp-button').hidden = false;
      $('lamp-button').focus();
    }, 5000 * pace);
  }
  function finishRitual(skip = false) {
    if (!ritualRunning || finishing) return;
    finishing = true;
    clearTimers();
    $('lamp-button').hidden = true;
    $('lamp-glow').classList.add('is-off');
    $('lamp-bulb').classList.add('is-off');
    const { record, created } = journal.complete();
    if (created) track('shutdown_complete');
    if (skip || reducedMotion.matches) {
      finishing = false;
      renderDone(record, true);
      return;
    }
    later(() => {
      show('ending');
      $('ending-lines').replaceChildren();
      $('ending-accessible').textContent = END_LINES.join('');
      $('ending-skip').focus();
      END_LINES.forEach((text, lineIndex) => {
        const line = document.createElement('p');
        line.innerHTML = '&nbsp;';
        $('ending-lines').append(line);
        Array.from(text).forEach((_, index) => later(() => { line.textContent = Array.from(text).slice(0,index+1).join(''); }, lineIndex * 1150 + index * 65));
      });
      later(() => { finishing = false; renderDone(record, true); }, 4000);
    }, 500);
  }
  function skipEnding() {
    clearTimers();
    finishing = false;
    ritualRunning = false;
    renderHome(true);
  }
  function openTools() {
    if (ritualRunning || finishing) return;
    show('tools');
    refreshWood();
    $(currentTab + '-tab').focus();
  }
  function leaveTools() { pauseBreathing(); renderHome(true); }
  function selectTab(name, focus = false) {
    if (name !== 'breath') pauseBreathing();
    currentTab = name;
    for (const item of ['wood','breath']) {
      const selected = item === name;
      $(item + '-tab').setAttribute('aria-selected', String(selected));
      $(item + '-tab').tabIndex = selected ? 0 : -1;
      $(item + '-panel').hidden = !selected;
    }
    if (name === 'wood') refreshWood();
    if (focus) $(name + '-tab').focus();
  }
  function refreshWood() { $('wood-count').textContent = `今天已敲 ${journal.woodCount(shanghaiTime().day)} 下`; }
  function renderSound() {
    $('sound-button').textContent = sound ? '声音已开 · 点击静音' : '声音已关 · 点击开启';
    $('sound-button').setAttribute('aria-pressed', String(sound));
  }
  function playKnock() {
    if (!sound) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) { $('audio-note').textContent = '当前浏览器不支持声音，仍可以轻敲放松。'; return; }
      if (!audioContext || audioContext.state === 'closed') audioContext = new Audio();
      // 创建和恢复都发生在点击手势内，兼容微信的音频启动限制。
      const resumed = audioContext.resume();
      const strike = () => {
        if (!sound) return;
        $('audio-note').textContent = '';
        const now = audioContext.currentTime;
        [410, 630, 940].forEach((frequency, index) => {
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(frequency, now);
          oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.72, now + 0.16);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.18 / (index + 1), now + 0.004);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
          oscillator.connect(gain); gain.connect(audioContext.destination);
          oscillator.start(now); oscillator.stop(now + 0.26);
          oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        });
      };
      if (resumed && typeof resumed.then === 'function') resumed.then(strike).catch(() => { $('audio-note').textContent = '声音暂未开启，可以再轻敲一下。'; });
      else strike();
    } catch (_) { $('audio-note').textContent = '声音暂不可用，仍可以轻敲放松。'; }
  }
  function knock() {
    playKnock();
    if (navigator.vibrate) navigator.vibrate(12);
    const day = shanghaiTime().day;
    const save = () => { journal.knock(day); refreshWood(); track('wood_used'); };
    if (navigator.locks) navigator.locks.request('teacher-rest-wood', save).catch(save);
    else save();
    const words = $('wood-words');
    // 高频敲击时只保留最新一句，避免短句叠在一起。
    words.replaceChildren();
    const word = document.createElement('span'); word.className = 'wood-word';
    word.textContent = WOOD_WORDS[Math.floor(Math.random() * WOOD_WORDS.length)];
    words.append(word);
    setTimeout(() => word.remove(), 1300);
  }
  function elapsedNow() { return breathElapsed + (breathRunning ? performance.now() - breathStarted : 0); }
  function publishBreathing(state) {
    window.restBreathingState = { ...state, running:breathRunning && !state.done };
    window.dispatchEvent(new CustomEvent('rest:breathing', { detail:window.restBreathingState }));
  }
  function paintBreathing() {
    const state = breathingAt(elapsedNow());
    publishBreathing(state);
    $('breath-bubble').style.transform = `scale(${state.scale})`;
    if (state.done) {
      if (!breathCompletionTracked) { breathCompletionTracked = true; track('breathing_complete'); }
      breathRunning = false; breathElapsed = 50000;
      $('breath-phase').textContent = '慢慢收好';
      $('breath-seconds').textContent = '5 轮呼吸，完成了';
      $('breath-progress').textContent = '这 50 秒，留给了自己';
      $('breath-status').textContent = '这一小会儿，只属于你。';
      $('breath-button').textContent = '再呼吸一会儿';
      $('breath-reset').hidden = true;
      return;
    }
    $('breath-phase').textContent = state.phase === 'inhale' ? '吸——' : '呼——';
    $('breath-seconds').textContent = `${state.remaining} 秒`;
    $('breath-progress').textContent = `第 ${state.round} / 5 轮 · 吸气 4 秒，呼气 6 秒`;
    if (state.phase !== breathLastPhase) {
      breathLastPhase = state.phase;
      $('breath-status').textContent = state.phase === 'inhale' ? '轻轻吸气，不用用力。' : '慢慢呼气，肩膀也放松一点。';
    }
    if (breathRunning) breathFrame = requestAnimationFrame(paintBreathing);
  }
  function startBreathing() {
    if (breathRunning) { pauseBreathing(); return; }
    if (breathElapsed >= 50000) breathElapsed = 0;
    if (breathElapsed === 0) { breathCompletionTracked = false; track('breathing_start'); }
    breathStarted = performance.now(); breathRunning = true; breathLastPhase = '';
    $('breath-button').textContent = '暂停一下'; $('breath-reset').hidden = false;
    paintBreathing();
  }
  function pauseBreathing() {
    if (!breathRunning) return;
    breathElapsed = elapsedNow(); breathRunning = false;
    cancelAnimationFrame(breathFrame);
    paintBreathing();
    if (breathElapsed < 50000) {
      $('breath-button').textContent = '继续呼吸';
      $('breath-status').textContent = '已暂停，准备好再继续。';
    }
  }
  function resetBreathing() {
    pauseBreathing(); breathElapsed = 0; breathLastPhase = ''; breathCompletionTracked = false;
    $('breath-bubble').style.transform = 'scale(1)';
    $('breath-phase').textContent = '慢慢来'; $('breath-seconds').textContent = '跟着自己的节奏';
    $('breath-progress').textContent = '吸气 4 秒 · 呼气 6 秒 · 共 5 轮';
    $('breath-status').textContent = '不用深吸，也不必用力。';
    $('breath-button').textContent = '开始呼吸'; $('breath-reset').hidden = true;
    publishBreathing({ scale:1, phase:'idle', done:false, round:1 });
  }
  function syncDay() {
    const day = shanghaiTime().day;
    if (view === 'tools') refreshWood();
    if (day !== activeDay && !ritualRunning && !finishing) {
      activeDay = day;
      if (view !== 'tools') renderHome();
    }
  }
  $('shutdown-button').addEventListener('click', startRitual);
  $('lamp-button').addEventListener('click', () => finishRitual());
  $('skip-button').addEventListener('click', () => finishRitual(true));
  $('ending-skip').addEventListener('click', skipEnding);
  $('tools-button').addEventListener('click', openTools);
  $('back-button').addEventListener('click', leaveTools);
  document.querySelector('.brand').addEventListener('click', event => {
    event.preventDefault();
    if (finishing) { skipEnding(); return; }
    clearTimers(); ritualRunning = false;
    leaveTools();
  });
  for (const name of ['wood','breath']) $(name + '-tab').addEventListener('click', () => selectTab(name));
  document.querySelector('.tool-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    selectTab(event.key === 'Home' ? 'wood' : event.key === 'End' ? 'breath' : currentTab === 'wood' ? 'breath' : 'wood', true);
  });
  $('wood-button').addEventListener('click', knock);
  $('sound-button').addEventListener('click', () => { sound = !sound; journal.write('sound', sound); renderSound(); });
  $('breath-button').addEventListener('click', startBreathing);
  $('breath-reset').addEventListener('click', resetBreathing);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && view === 'tools') leaveTools(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseBreathing(); else syncDay(); });
  window.addEventListener('pageshow', syncDay);
  window.addEventListener('storage', () => {
    sound = journal.read('sound') !== false; renderSound();
    if (!ritualRunning && !finishing && view !== 'tools') renderHome();
    refreshWood();
  });
  setInterval(syncDay, 30000);
  renderSound(); renderHome();
})();
