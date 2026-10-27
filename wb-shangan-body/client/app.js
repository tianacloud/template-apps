/* 上岸体质 · app.js
   纯前端、零依赖、localStorage 存储。 */
(function () {
  'use strict';

  const KEY = 'shangan_v1';

  const SUBJECTS = ['行测·言语', '行测·判断', '行测·数量', '行测·资料', '行测·常识', '申论'];
  const CAUSES = ['知识盲点', '审题失误', '时间不够', '计算失误', '蒙错'];
  const DURATIONS = [15, 25, 45, 60];

  const C = { accent: '#d9553c', teal: '#8fa37c', good: '#8fa37c', warn: '#c9a227', bad: '#c9524a' };

  /* ---------------- utils ---------------- */
  const pad = n => String(n).padStart(2, '0');
  const dateKey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const todayKey = () => dateKey(new Date());
  const parseKey = k => { const p = String(k).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const diffDays = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);
  const addDays = (d, n) => { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; };
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : null; };
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
  const wd = k => ['日', '一', '二', '三', '四', '五', '六'][parseKey(k).getDay()];
  const md = k => { const p = k.split('-'); return p[1] + '-' + p[2]; };
  const $ = id => document.getElementById(id);

  /* ---------------- state ---------------- */
  const DEFAULTS = {
    settings: {
      examName: '2028 国考笔试',
      examDate: '2027-11-28',
      startDate: '2026-09-01',
      height: 175,
      qGoal: 80,
      proteinLow: 100,
      proteinHigh: 135,
      sleepGoal: 7
    },
    days: {},
    tasks: [],
    mistakes: [],
    workouts: []
  };

  let S = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULTS));
      const p = JSON.parse(raw);
      const s = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), p || {});
      s.settings = Object.assign(JSON.parse(JSON.stringify(DEFAULTS.settings)), (p && p.settings) || {});
      return s;
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULTS));
    }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { toast('本地存满了，先导出再清一点'); }
  }
  function D(k) {
    k = k || todayKey();
    if (!S.days[k]) S.days[k] = {
      min: 0, q: 0, sessions: 0, sleep: null, weight: null,
      protein: null, kcal: null, sys: null, dia: null, hr: null
    };
    return S.days[k];
  }
  function daySafe(k) {
    return S.days[k] || { min: 0, q: 0, sessions: 0, sleep: null, weight: null, protein: null, kcal: null, sys: null, dia: null, hr: null };
  }

  /* ---------------- toast ---------------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('on'), 2200);
  }

  /* ---------------- 生理判定 ---------------- */
  function bpLevel(sys, dia) {
    if (sys == null || dia == null) return null;
    if (sys >= 180 || dia >= 110) return { t: '3 级高血压', c: 'bad' };
    if (sys >= 160 || dia >= 100) return { t: '2 级高血压', c: 'bad' };
    if (sys >= 140 || dia >= 90) return { t: '1 级高血压', c: 'bad' };
    if (sys >= 120 || dia >= 80) return { t: '正常高值', c: 'warn' };
    return { t: '理想血压', c: 'good' };
  }
  function bmiOf(w, h) {
    if (!w || !h) return null;
    const m = h / 100;
    return w / (m * m);
  }
  function bmiLevel(v) {
    if (v == null) return null;
    if (v < 18.5) return { t: '偏瘦', c: 'warn' };
    if (v < 24) return { t: '正常', c: 'good' };
    if (v < 28) return { t: '超重', c: 'warn' };
    return { t: '肥胖', c: 'bad' };
  }

  /* ---------------- 顶栏 ---------------- */
  function renderClock() {
    const s = S.settings;
    $('examName').textContent = s.examName;
    const left = diffDays(todayKey(), s.examDate);
    $('cdDays').textContent = left >= 0 ? left : 0;
    const total = Math.max(1, diffDays(s.startDate, s.examDate));
    const passed = clamp(diffDays(s.startDate, todayKey()), 0, total);
    const pct = Math.round(passed / total * 100);
    $('cdSub').textContent = left >= 0
      ? '总周期 ' + total + ' 天 · 已走 ' + pct + '%'
      : '考试日已过，去改日期';
    const mDay = $('mDay'), mDate = $('mDate');
    if (mDay) mDay.textContent = passed;
    if (mDate) mDate.textContent = todayKey().replace(/-/g, '.') + ' 周' + wd(todayKey());
  }

  function renderHero() {
    const s = S.settings;
    const total = Math.max(1, diffDays(s.startDate, s.examDate));
    const passed = clamp(diffDays(s.startDate, todayKey()), 0, total);
    const pct = clamp(passed / total * 100, 0, 100);
    $('heroPct').textContent = pct.toFixed(1) + '%';
    $('heroMeta').textContent = '已投入 ' + passed + ' 天 / 共 ' + total + ' 天';
    $('railFill').style.width = pct + '%';
    $('railStart').textContent = s.startDate;
    $('railEnd').textContent = s.examDate;
    $('heroQuote').textContent = heroQuote(passed, total);
  }

  const QUOTES = [
    '起跑线已经画好了，剩下的就是每天往上加一格。',
    '进度条不会自己动。它只在你打开这个页面的日子里动。',
    '别用「还有很久」安慰自己，倒计时从来不参与情绪管理。',
    '一半的路已经走过，说明这套方法是可行的 —— 继续，别改。',
    '后段最容易崩的不是知识，是作息。盯一下睡眠。',
    '最后四分之一的正确做法：少开新战场，多复盘旧账。',
    '快到线了。这时候拼的是体力和手感，不是新题量。'
  ];
  function heroQuote(passed, total) {
    const r = passed / total;
    if (r < 0.15) return QUOTES[0];
    if (r < 0.35) return QUOTES[1];
    if (r < 0.5) return QUOTES[2];
    if (r < 0.7) return QUOTES[3];
    if (r < 0.85) return QUOTES[4];
    if (r < 0.95) return QUOTES[5];
    return QUOTES[6];
  }

  /* ---------------- 四环 ---------------- */
  function ringHTML(pct, color, center, label) {
    const r = 33, c = 2 * Math.PI * r;
    const p = clamp(pct, 0, 1);
    const off = c * (1 - p);
    return '<div class="ring"><div class="ring-svg">' +
      '<svg viewBox="0 0 86 86">' +
      '<circle class="ring-track" cx="43" cy="43" r="' + r + '"></circle>' +
      '<circle class="ring-bar" cx="43" cy="43" r="' + r + '" stroke="' + color +
      '" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"></circle>' +
      '</svg><div class="ring-center" style="color:' + color + '">' + center + '</div></div>' +
      '<div class="ring-lab">' + label + '</div></div>';
  }

  function renderRings() {
    const s = S.settings;
    const t = daySafe(todayKey());
    const tasks = S.tasks.filter(x => x.date === todayKey());
    const done = tasks.filter(x => x.done).length;

    const taskPct = tasks.length ? done / tasks.length : 0;
    const qPct = s.qGoal ? clamp(t.q / s.qGoal, 0, 1.4) : 0;
    const pPct = s.proteinLow ? clamp((t.protein || 0) / s.proteinLow, 0, 1.2) : 0;
    const sPct = s.sleepGoal ? clamp((t.sleep || 0) / s.sleepGoal, 0, 1.2) : 0;

    $('rings').innerHTML =
      ringHTML(taskPct, C.accent, done + '/' + tasks.length, '今日任务') +
      ringHTML(qPct, qPct >= 1 ? C.good : C.accent, t.q || 0, '题数 /' + s.qGoal) +
      ringHTML(pPct, pPct >= 1 ? C.good : C.teal, (t.protein || 0) + 'g', '蛋白 /' + s.proteinLow) +
      ringHTML(sPct, sPct >= 1 ? C.good : C.teal, (t.sleep ? t.sleep : '—'), '睡眠 /' + s.sleepGoal + 'h');

    $('todayLabel').textContent = todayKey().slice(5) + ' 周' + wd(todayKey());
    $('taskCount').textContent = done + '/' + tasks.length;

    const t2 = daySafe(todayKey());
    const avg = (t2.q || 0) > 0 ? Math.round((t2.min || 0) / t2.q) : 0;
    const sub = $('ringStats');
    if (sub) sub.innerHTML =
      '<span>专注 <b>' + Math.round(t2.min || 0) + '</b> min</span>' +
      '<span>均速 <b>' + avg + '</b> min/题</span>' +
      '<span>任务完成 <b>' + (tasks.length ? Math.round(done / tasks.length * 100) : 0) + '%</b></span>';
  }

  /* ---------------- 任务 ---------------- */
  function renderTasks() {
    const list = S.tasks.filter(x => x.date === todayKey());
    const el = $('taskList');
    if (!list.length) { el.innerHTML = ''; }
    else {
      el.innerHTML = list.map(x =>
        '<li class="task-item ' + (x.done ? 'done' : '') + '" data-id="' + x.id + '">' +
        '<button class="cb ' + (x.done ? 'on' : '') + '" data-act="toggle" aria-label="勾选"></button>' +
        '<span class="task-text">' + esc(x.text) + '</span>' +
        '<span class="tag">' + esc(x.subject) + '</span>' +
        '<button class="del" data-act="del" aria-label="删除">×</button>' +
        '</li>').join('');
    }
    const done = list.filter(x => x.done).length;
    $('taskCount').textContent = done + '/' + list.length;
  }

  /* ---------------- 图表 ---------------- */
  function barChart(data, color) {
    const W = 340, H = 110, padB = 18, padT = 18;
    const max = Math.max(1, ...data.map(d => d.v));
    const n = data.length || 1;
    const gap = 14;
    const bw = (W - gap * (n - 1)) / n;
    let bars = '';
    data.forEach((d, i) => {
      const h = Math.max(1.5, (H - padB - padT) * d.v / max);
      const slot = i * (bw + gap);
      const w = bw * 0.68;
      const x = slot + (bw - w) / 2;
      const y = H - padB - h;
      const fill = d.v === 0 ? '#232325' : color;
      bars += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) +
        '" height="' + h.toFixed(1) + '" fill="' + fill + '" opacity="' + (d.v === 0 ? 1 : 0.92) + '">' +
        '<title>' + esc(d.l) + '：' + d.v + '</title></rect>';
      if (d.v > 0) {
        bars += '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (y - 7).toFixed(1) +
          '" text-anchor="middle" font-size="9" fill="#6d675f">' + d.v + '</text>';
      }
      bars += '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (H - 5) +
        '" text-anchor="middle" font-size="9" fill="#4e4a44">' + esc(d.l) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' + bars + '</svg>';
  }

  function last7(fn) {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const k = dateKey(addDays(new Date(), -i));
      out.push({ l: md(k), k: k, v: fn(daySafe(k), k) });
    }
    return out;
  }

  function renderCharts() {
    const minData = last7((d) => Math.round(d.min || 0));
    $('loadChart').innerHTML = barChart(minData, '#c2543c');
    const tot = minData.reduce((a, b) => a + b.v, 0);
    const active = minData.filter(d => d.v > 0).length;
    $('loadStats').innerHTML =
      '<span><b>' + (tot / 60).toFixed(1) + '</b> h 总专注</span>' +
      '<span><b>' + active + '</b>/7 天有记录</span>' +
      '<span><b>' + (active ? Math.round(tot / active) : 0) + '</b> min/活跃日</span>';

    const qData = last7((d) => Math.round(d.q || 0));
    $('qChart').innerHTML = barChart(qData, '#6d7d5f');
  }

  function renderStreak() {
    let n = 0;
    for (let i = 0; i < 400; i++) {
      const k = dateKey(addDays(new Date(), -i));
      const d = daySafe(k);
      if ((d.q || 0) > 0 || (d.min || 0) > 0) n++;
      else if (i > 0) break;
    }
    const today = daySafe(todayKey());
    const todayLive = (today.q || 0) > 0 || (today.min || 0) > 0;
    $('streakBox').innerHTML = '<b>' + n + '</b><span>天</span>' +
      (todayLive ? '<span style="color:#8fa37c">今天已打卡</span>'
        : '<span class="warn">今天还没动</span>');
  }

  /* ---------------- 读数 ---------------- */
  function renderReadout() {
    const s = S.settings;
    const k = todayKey();
    const t = daySafe(k);
    const tasks = S.tasks.filter(x => x.date === k);
    const done = tasks.filter(x => x.done).length;
    const lines = [];

    if ((t.q || 0) === 0 && (t.min || 0) === 0) {
      lines.push('今天 <em>0 题 / 0 分钟</em>。倒计时不会因为你焦虑就多给一天。');
    } else {
      lines.push('今天刷了 <em>' + (t.q || 0) + ' 题</em>，专注 <em>' + Math.round(t.min || 0) + ' 分钟</em>' +
        ((t.q || 0) > 0 ? '，均速 ' + Math.round((t.min || 0) / t.q) + ' 分钟/题' : '') + '。');
    }

    if (tasks.length) {
      lines.push('清单 ' + done + '/' + tasks.length + (done === tasks.length ? '，<span class="ok">清空了</span>。' : '，还欠 ' + (tasks.length - done) + ' 项。'));
    }

    const bp = bpLevel(t.sys, t.dia);
    if (bp) {
      lines.push('血压 ' + t.sys + '/' + t.dia + '，落在 <span class="' + (bp.c === 'good' ? 'ok' : 'flag') + '">' + bp.t + '</span>。' +
        (bp.c === 'bad' ? '这个数字刷题刷不回来，先把盐和熬夜停掉。' : bp.c === 'warn' ? '还在可逆区间，别拖成常态。' : '保持。'));
    }

    if (t.sleep != null) {
      if (t.sleep < 6) lines.push('睡了 ' + t.sleep + ' 小时。记忆巩固要 7 小时以上，省下的睡眠会以错题形式还回来。');
      else if (t.sleep >= s.sleepGoal) lines.push('睡了 ' + t.sleep + ' 小时，<span class="ok">达标</span>。');
      else lines.push('睡了 ' + t.sleep + ' 小时，差 ' + (s.sleepGoal - t.sleep).toFixed(1) + ' 小时。');
    }

    if (t.protein != null) {
      if (t.protein < s.proteinLow) lines.push('蛋白 ' + t.protein + 'g，低于 ' + s.proteinLow + 'g 下限，差 ' + (s.proteinLow - t.protein) + 'g。');
      else if (t.protein > s.proteinHigh) lines.push('蛋白 ' + t.protein + 'g，超了上限 ' + s.proteinHigh + 'g，不是越多越好。');
      else lines.push('蛋白 ' + t.protein + 'g，<span class="ok">在 ' + s.proteinLow + '–' + s.proteinHigh + 'g 区间</span>。');
    }

    const ws = S.workouts.filter(w => w.date === k);
    if (ws.length) {
      const fl = ws.reduce((a, b) => a + (b.floors || 0), 0);
      const mi = ws.reduce((a, b) => a + (b.min || 0), 0);
      lines.push('训练 ' + ws.length + ' 次，共 ' + (fl ? fl + ' 层 / ' : '') + mi + ' 分钟。');
      if (ws.some(w => (w.hr || 0) > 140)) lines.push('<span class="flag">有心率超过 140 的记录</span>，按你的上限算这是超标。');
    }

    const allOk = (t.q || 0) >= s.qGoal && tasks.length && done === tasks.length &&
      (!bp || bp.c === 'good') && (t.sleep == null || t.sleep >= s.sleepGoal);
    if (allOk) lines.push('<span class="ok">今天算可持续的一天。</span>别骄傲，明天还得再来一次。');

    $('readout').innerHTML = lines.join(' ');
  }

  /* ---------------- 刷题钟 ---------------- */
  const timer = { duration: 25, left: 25 * 60, running: false, endAt: 0, tick: null, subject: SUBJECTS[3] };

  function renderTimer() {
    $('timerTime').textContent = pad(Math.floor(timer.left / 60)) + ':' + pad(timer.left % 60);
    $('timerSub').textContent = timer.subject;
    const c = 2 * Math.PI * 88;
    const ratio = timer.duration > 0 ? timer.left / (timer.duration * 60) : 0;
    $('timerProg').style.strokeDashoffset = String(c * (1 - clamp(ratio, 0, 1)));
    $('focusState').textContent = timer.running ? '进行中' :
      (timer.left === timer.duration * 60 ? '待开始' : (timer.left === 0 ? '已完成' : '已暂停'));
    $('btnStart').textContent = timer.running ? '暂停' : (timer.left === timer.duration * 60 ? '开始' : '继续');
    const t = daySafe(todayKey());
    $('stMin').textContent = Math.round(t.min || 0);
    $('stQ').textContent = t.q || 0;
    $('stAvg').textContent = (t.q ? Math.round((t.min || 0) / t.q) : 0);
  }

  function startTimer() {
    if (timer.running) { pauseTimer(); return; }
    if (timer.left <= 0) timer.left = timer.duration * 60;
    timer.running = true;
    timer.endAt = Date.now() + timer.left * 1000;
    timer.tick = setInterval(() => {
      const left = Math.max(0, Math.round((timer.endAt - Date.now()) / 1000));
      timer.left = left;
      renderTimer();
      if (left <= 0) finishTimer();
    }, 250);
    renderTimer();
  }

  function pauseTimer() {
    timer.running = false;
    clearInterval(timer.tick);
    timer.tick = null;
    renderTimer();
  }

  function finishTimer() {
    timer.running = false;
    clearInterval(timer.tick);
    timer.tick = null;
    const t = D(todayKey());
    t.min = (t.min || 0) + timer.duration;
    t.sessions = (t.sessions || 0) + 1;
    const q = num($('sessionQ').value);
    if (q != null && q > 0) { t.q = (t.q || 0) + q; $('sessionQ').value = ''; }
    save();
    timer.left = timer.duration * 60;
    renderTimer();
    renderAll();
    toast('记下了：' + timer.duration + ' 分钟' + (q ? ' · ' + q + ' 题' : ' · 题数还没填'));
  }

  function resetTimer() {
    if (timer.running) pauseTimer();
    if (timer.left !== timer.duration * 60 && timer.left !== 0) toast('重置不记账，时间白站了');
    timer.left = timer.duration * 60;
    renderTimer();
  }

  /* ---------------- 错题本 ---------------- */
  let missFilter = '全部';

  function renderMistakes() {
    const all = S.mistakes;
    const total = all.length;

    const counts = {};
    CAUSES.forEach(c => counts[c] = 0);
    all.forEach(m => { if (counts[m.cause] != null) counts[m.cause]++; });
    const maxC = Math.max(1, ...CAUSES.map(c => counts[c]));
    $('causeBars').innerHTML = CAUSES.map(c =>
      '<div class="cause-row"><span class="cause-name">' + c + '</span>' +
      '<span class="cause-track"><span class="cause-fill" style="width:' + (counts[c] / maxC * 100) + '%"></span></span>' +
      '<span class="cause-num">' + counts[c] + '</span></div>').join('');
    $('causeTotal').textContent = '共 ' + total + ' 道';

    const filters = ['全部'].concat(SUBJECTS);
    $('missFilter').innerHTML = filters.map(f =>
      '<button class="chip ' + (f === missFilter ? 'on' : '') + '" data-f="' + esc(f) + '">' + esc(f) + '</button>').join('');

    const list = all.filter(m => missFilter === '全部' || m.subject === missFilter)
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

    const reviewed = all.filter(m => m.reviewed).length;
    $('missSummary').textContent = total ? '已复盘 ' + reviewed + ' / ' + total : '还没有记录';

    if (!list.length) { $('missList').innerHTML = ''; return; }
    $('missList').innerHTML = list.map(m =>
      '<li class="miss-item ' + (m.reviewed ? 'reviewed' : '') + '" data-id="' + m.id + '">' +
      '<div class="miss-main">' +
      '<div class="miss-top">' +
      '<span class="badge sub">' + esc(m.subject) + '</span>' +
      '<span class="badge cause">' + esc(m.cause) + '</span>' +
      (m.reviewed ? '<span class="badge done">已复盘</span>' : '') +
      '<span class="hint">' + md(m.date) + '</span>' +
      '</div>' +
      '<div class="miss-text">' + esc(m.text) + '</div>' +
      (m.note ? '<div class="miss-note">防：' + esc(m.note) + '</div>' : '') +
      '</div>' +
      '<button class="mini-btn" data-act="review">' + (m.reviewed ? '取消' : '复盘') + '</button>' +
      '<button class="del" data-act="del" style="opacity:1">×</button>' +
      '</li>').join('');
  }

  /* ---------------- 体力账 ---------------- */
  function renderBody() {
    const s = S.settings;
    const k = todayKey();
    const t = daySafe(k);

    $('vSys').value = t.sys == null ? '' : t.sys;
    $('vDia').value = t.dia == null ? '' : t.dia;
    $('vHr').value = t.hr == null ? '' : t.hr;
    $('vSleep').value = t.sleep == null ? '' : t.sleep;
    $('vWeight').value = t.weight == null ? '' : t.weight;
    $('vProtein').value = t.protein == null ? '' : t.protein;
    $('vKcal').value = t.kcal == null ? '' : t.kcal;

    const bp = bpLevel(t.sys, t.dia);
    $('bpTag').textContent = bp ? bp.t : '未记录';
    $('bpTag').style.color = bp ? (bp.c === 'good' ? C.good : bp.c === 'warn' ? C.warn : C.bad) : '';
    $('bpVerdict').innerHTML = bp
      ? '<b style="color:' + (bp.c === 'good' ? C.good : bp.c === 'warn' ? C.warn : C.bad) + '">' + bp.t + '</b> · ' +
        t.sys + '/' + t.dia + ' mmHg' + (t.hr ? ' · 心率 ' + t.hr : '') +
        '<br>' + bpAdvice(bp.c)
      : '今天还没量。量一次比猜一次便宜。';

    // 体重 / BMI
    let w = t.weight;
    if (w == null) {
      const recent = Object.keys(S.days).filter(x => S.days[x].weight != null).sort().pop();
      if (recent) w = S.days[recent].weight;
    }
    const b = bmiOf(w, s.height);
    const bl = bmiLevel(b);
    $('stBmi').textContent = b ? b.toFixed(1) : '—';
    $('bmiTag').textContent = bl ? bl.t + (w ? ' · ' + w + 'kg' : '') : '缺体重';
    $('bmiTag').style.color = bl ? (bl.c === 'good' ? C.good : bl.c === 'warn' ? C.warn : C.bad) : '';

    // 7 日均睡眠 / 蛋白达标率
    const days = [];
    for (let i = 0; i < 7; i++) days.push(daySafe(dateKey(addDays(new Date(), -i))));
    const sleepVals = days.map(d => d.sleep).filter(v => v != null);
    $('stSleep7').textContent = sleepVals.length ? (sleepVals.reduce((a, b2) => a + b2, 0) / sleepVals.length).toFixed(1) : '—';
    const pVals = days.map(d => d.protein).filter(v => v != null);
    $('stProtein7').textContent = pVals.length
      ? Math.round(pVals.filter(v => v >= s.proteinLow).length / pVals.length * 100) + '%'
      : '—';

    // 血压趋势
    $('bpChart').innerHTML = bpChart();

    // 训练
    const ws = S.workouts.slice().sort((a, b2) => b2.date.localeCompare(a.date) || b2.id.localeCompare(a.id)).slice(0, 8);
    $('workList').innerHTML = ws.length ? ws.map(x =>
      '<li class="work-item" data-id="' + x.id + '">' +
      '<span class="d">' + md(x.date) + '</span>' +
      '<span class="v">' + esc(x.type) +
      (x.floors ? ' · <b>' + x.floors + '</b> 层' : '') +
      ' · <b>' + (x.min || 0) + '</b> 分钟' +
      (x.hr ? ' · 均心率 <b' + (x.hr > 140 ? ' style="color:#c9524a"' : '') + '>' + x.hr + '</b>' : '') +
      '</span><button class="del" data-act="delwork" style="opacity:1">×</button></li>').join('')
      : '<li class="list-empty">还没有训练记录。爬楼也算，别拿没场地当借口。</li>';

    // 最近体征
    const recentDays = Object.keys(S.days).filter(x => {
      const d = S.days[x];
      return d.sys != null || d.sleep != null || d.protein != null || d.weight != null;
    }).sort().reverse().slice(0, 8);

    $('vitalList').innerHTML = recentDays.length ? recentDays.map(x => {
      const d = S.days[x];
      const parts = [];
      if (d.sys != null) parts.push('血压 <b>' + d.sys + '/' + d.dia + '</b>');
      if (d.sleep != null) parts.push('睡眠 <b>' + d.sleep + 'h</b>');
      if (d.protein != null) parts.push('蛋白 <b>' + d.protein + 'g</b>');
      if (d.weight != null) parts.push('体重 <b>' + d.weight + 'kg</b>');
      return '<li class="vital-item"><span class="d">' + md(x) + '</span><span class="v">' + parts.join(' · ') + '</span></li>';
    }).join('') : '<li class="list-empty">还没有体征数据。</li>';
  }

  function bpAdvice(c) {
    if (c === 'bad') return '先把熬夜和高盐停掉，别用「年轻扛得住」给自己发许可证；连续偏高建议去门诊查一次。';
    if (c === 'warn') return '还在可逆区间。今天少一顿咸的，多走 20 分钟，明天再量。';
    return '保持。别因为一次正常就恢复通宵。';
  }

  function bpChart() {
    const keys = Object.keys(S.days).filter(k => S.days[k].sys != null && S.days[k].dia != null).sort().slice(-14);
    if (!keys.length) {
      return '<div style="display:grid;place-items:center;height:100%;color:#565149;font-size:12px">还没有血压记录，量一次就有线了</div>';
    }
    const W = 480, H = 170, pl = 30, pr = 12, pt = 12, pb = 22;
    const sysAll = keys.map(k => S.days[k].sys);
    const diaAll = keys.map(k => S.days[k].dia);
    const lo = Math.min.apply(null, diaAll), hi = Math.max.apply(null, sysAll);
    const yMin = Math.max(30, Math.floor((lo - 12) / 10) * 10);
    const yMax = Math.min(230, Math.ceil((hi + 12) / 10) * 10);
    const x = i => keys.length === 1 ? (pl + (W - pl - pr) / 2) : pl + (W - pl - pr) * (i / (keys.length - 1));
    const y = v => pt + (H - pt - pb) * (1 - (v - yMin) / (yMax - yMin));

    let grid = '';
    // 等分刻度
    const step = (yMax - yMin) / 4;
    for (let i = 0; i <= 4; i++) {
      const v = yMin + step * i;
      const yy = y(v).toFixed(1);
      grid += '<line x1="' + pl + '" y1="' + yy + '" x2="' + (W - pr) + '" y2="' + yy +
        '" stroke="#1c1c1e" stroke-width="1"></line>' +
        '<text x="' + (pl - 6) + '" y="' + (+yy + 3) + '" text-anchor="end" font-size="9" fill="#5a554e">' + Math.round(v) + '</text>';
    }
    // 140 / 90 阈值
    [[140, '#3d322d'], [90, '#2f362c']].forEach(t => {
      if (t[0] <= yMin || t[0] >= yMax) return;
      grid += '<line x1="' + pl + '" y1="' + y(t[0]).toFixed(1) + '" x2="' + (W - pr) + '" y2="' + y(t[0]).toFixed(1) +
        '" stroke="' + t[1] + '" stroke-width="1" stroke-dasharray="5 4"></line>';
    });

    const sysPts = keys.map((k, i) => x(i) + ',' + y(S.days[k].sys));
    const diaPts = keys.map((k, i) => x(i) + ',' + y(S.days[k].dia));

    let dots = '';
    keys.forEach((k, i) => {
      const d = S.days[k];
      const over = d.sys >= 140 || d.dia >= 90;
      dots += '<circle cx="' + x(i) + '" cy="' + y(d.sys) + '" r="2.8" fill="' + (over ? '#c9524a' : '#d9553c') + '"></circle>' +
        '<circle cx="' + x(i) + '" cy="' + y(d.dia) + '" r="2.6" fill="#8fa37c"></circle>';
    });

    const labels = '<text x="' + pl + '" y="' + (H - 6) + '" font-size="9" fill="#5a554e">' + md(keys[0]) + '</text>' +
      '<text x="' + (W - pr) + '" y="' + (H - 6) + '" text-anchor="end" font-size="9" fill="#5a554e">' + md(keys[keys.length - 1]) + '</text>';

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' + grid +
      '<polyline points="' + sysPts.join(' ') + '" fill="none" stroke="#d9553c" stroke-width="1.6" stroke-linejoin="round"></polyline>' +
      '<polyline points="' + diaPts.join(' ') + '" fill="none" stroke="#8fa37c" stroke-width="1.6" stroke-linejoin="round"></polyline>' +
      dots + labels + '</svg>';
  }

  /* ---------------- 设置 ---------------- */
  function renderSettings() {
    const s = S.settings;
    $('cName').value = s.examName;
    $('cExam').value = s.examDate;
    $('cStart').value = s.startDate;
    $('cHeight').value = s.height;
    $('cQGoal').value = s.qGoal;
    $('cPLow').value = s.proteinLow;
    $('cPHigh').value = s.proteinHigh;
    $('cSleep').value = s.sleepGoal;
  }

  /* ---------------- 全部渲染 ---------------- */
  function renderAll() {
    renderClock();
    renderHero();
    renderRings();
    renderTasks();
    renderCharts();
    renderStreak();
    renderReadout();
    renderTimer();
    renderMistakes();
    renderBody();
  }

  /* ---------------- 事件 ---------------- */
  function initSelects() {
    $('taskSubject').innerHTML = SUBJECTS.map(s => '<option>' + s + '</option>').join('');
    $('taskSubject').value = SUBJECTS[3];
    $('missSubject').innerHTML = SUBJECTS.map(s => '<option>' + s + '</option>').join('');
    $('missCause').innerHTML = CAUSES.map(s => '<option>' + s + '</option>').join('');
  }

  function initTabs() {
    $('tabs').addEventListener('click', e => {
      const b = e.target.closest('.tab');
      if (!b) return;
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === b));
      document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + b.dataset.view));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initTasks() {
    $('taskForm').addEventListener('submit', e => {
      e.preventDefault();
      const text = $('taskText').value.trim();
      if (!text) return;
      S.tasks.push({ id: uid(), date: todayKey(), text: text, subject: $('taskSubject').value, done: false });
      $('taskText').value = '';
      save(); renderAll();
    });
    $('taskList').addEventListener('click', e => {
      const li = e.target.closest('.task-item');
      if (!li) return;
      const id = li.dataset.id;
      const it = S.tasks.find(x => x.id === id);
      if (!it) return;
      if (e.target.dataset.act === 'toggle') it.done = !it.done;
      else if (e.target.dataset.act === 'del') S.tasks = S.tasks.filter(x => x.id !== id);
      else return;
      save(); renderAll();
    });
  }

  function initFocus() {
    $('subjectChips').innerHTML = SUBJECTS.map(s =>
      '<button class="chip ' + (s === timer.subject ? 'on' : '') + '" data-s="' + esc(s) + '">' + esc(s) + '</button>').join('');
    $('durationChips').innerHTML = DURATIONS.map(d =>
      '<button class="chip ' + (d === timer.duration ? 'on' : '') + '" data-d="' + d + '">' + d + '</button>').join('');

    $('subjectChips').addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      timer.subject = b.dataset.s;
      $('subjectChips').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b));
      renderTimer();
    });
    $('durationChips').addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      if (timer.running) { toast('先暂停再改时长'); return; }
      timer.duration = +b.dataset.d;
      timer.left = timer.duration * 60;
      $('durationChips').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b));
      renderTimer();
    });
    $('btnStart').addEventListener('click', startTimer);
    $('btnReset').addEventListener('click', resetTimer);
    $('btnQLog').addEventListener('click', () => {
      const q = num($('sessionQ').value);
      if (q == null || q <= 0) { toast('填个数字先'); return; }
      const t = D(todayKey());
      t.q = (t.q || 0) + q;
      $('sessionQ').value = '';
      save(); renderAll();
      toast('今天累计 ' + t.q + ' 题');
    });
  }

  function initMistakes() {
    $('missForm').addEventListener('submit', e => {
      e.preventDefault();
      const text = $('missText').value.trim();
      if (!text) { toast('至少写一句错在哪'); return; }
      S.mistakes.push({
        id: uid(), date: todayKey(), subject: $('missSubject').value,
        cause: $('missCause').value, text: text, note: $('missNote').value.trim(), reviewed: false
      });
      $('missText').value = ''; $('missNote').value = '';
      save(); renderAll();
      toast('入本了。别让它躺第二次。');
    });
    $('missFilter').addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      missFilter = b.dataset.f;
      renderMistakes();
    });
    $('missList').addEventListener('click', e => {
      const li = e.target.closest('.miss-item'); if (!li) return;
      const id = li.dataset.id;
      const it = S.mistakes.find(x => x.id === id);
      if (!it) return;
      if (e.target.dataset.act === 'review') it.reviewed = !it.reviewed;
      else if (e.target.dataset.act === 'del') S.mistakes = S.mistakes.filter(x => x.id !== id);
      else return;
      save(); renderMistakes(); renderReadout();
    });
  }

  function initBody() {
    $('vitalForm').addEventListener('submit', e => {
      e.preventDefault();
      const t = D(todayKey());
      const map = { vSys: 'sys', vDia: 'dia', vHr: 'hr', vSleep: 'sleep', vWeight: 'weight', vProtein: 'protein', vKcal: 'kcal' };
      Object.keys(map).forEach(id => {
        const v = num($(id).value);
        t[map[id]] = v;
      });
      save(); renderAll();
      toast('今天体征已存');
    });

    $('workForm').addEventListener('submit', e => {
      e.preventDefault();
      const min = num($('wMin').value);
      const floors = num($('wFloors').value);
      if (!min && !floors) { toast('楼层和分钟至少填一个'); return; }
      const hr = num($('wHr').value);
      S.workouts.push({
        id: uid(), date: todayKey(), type: $('wType').value,
        floors: floors || 0, min: min || 0, hr: hr
      });
      $('wFloors').value = ''; $('wMin').value = ''; $('wHr').value = '';
      save(); renderAll();
      toast(hr && hr > 140 ? '记下了。心率 ' + hr + '，超上限了，下一次放慢。' : '记下了');
    });

    $('workList').addEventListener('click', e => {
      if (e.target.dataset.act !== 'delwork') return;
      const li = e.target.closest('.work-item'); if (!li) return;
      S.workouts = S.workouts.filter(x => x.id !== li.dataset.id);
      save(); renderAll();
    });
  }

  function initSettings() {
    $('cfgForm').addEventListener('submit', e => {
      e.preventDefault();
      const s = S.settings;
      s.examName = $('cName').value.trim() || '2028 国考笔试';
      s.examDate = $('cExam').value || s.examDate;
      s.startDate = $('cStart').value || s.startDate;
      s.height = num($('cHeight').value) || s.height;
      s.qGoal = num($('cQGoal').value) != null ? num($('cQGoal').value) : s.qGoal;
      s.proteinLow = num($('cPLow').value) != null ? num($('cPLow').value) : s.proteinLow;
      s.proteinHigh = num($('cPHigh').value) != null ? num($('cPHigh').value) : s.proteinHigh;
      s.sleepGoal = num($('cSleep').value) || s.sleepGoal;
      save(); renderAll();
      toast('设置已保存');
    });

    $('btnExport').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'shangan-body-' + todayKey() + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      toast('已导出');
    });

    $('btnImport').addEventListener('click', () => $('fileInput').click());
    $('fileInput').addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const p = JSON.parse(r.result);
          if (!p || typeof p !== 'object' || !p.settings) throw new Error('bad');
          S = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), p);
          S.settings = Object.assign(JSON.parse(JSON.stringify(DEFAULTS.settings)), p.settings);
          save(); renderAll(); renderSettings();
          toast('导入完成');
        } catch (err) { toast('这文件不像是我导出的'); }
      };
      r.readAsText(f);
      e.target.value = '';
    });

    $('btnWipe').addEventListener('click', () => {
      if (!confirm('清空全部本地记录？导出的 JSON 还能救回来，没导出就没了。')) return;
      S = JSON.parse(JSON.stringify(DEFAULTS));
      save(); renderAll(); renderSettings();
      toast('已清空');
    });

    $('btnDemo').addEventListener('click', () => {
      if (!confirm('灌入 7 天演示数据，会覆盖现有记录。继续？')) return;
      seedDemo();
      save(); renderAll(); renderSettings();
      toast('演示数据已就位');
    });
  }

  /* ---------------- 演示数据 ---------------- */
  function seedDemo() {
    S = JSON.parse(JSON.stringify(DEFAULTS));
    const mins = [95, 62, 120, 0, 84, 140, 105];
    const qs = [62, 40, 88, 0, 55, 96, 70];
    const sleeps = [6, 6.5, 7, 5.5, 7, 6.5, 7.5];
    const proteins = [92, 108, 118, 85, 124, 116, 112];
    const weights = [81.2, 81.1, 81.0, 81.2, 80.8, 80.6, 80.4];
    const bps = [[148, 92], [144, 90], [146, 91], [140, 88], [138, 86], [136, 85], [132, 83]];
    const kcals = [2050, 1980, 2200, 1750, 2100, 2150, 2050];

    for (let i = 6; i >= 0; i--) {
      const k = dateKey(addDays(new Date(), -i));
      S.days[k] = {
        min: mins[6 - i], q: qs[6 - i], sessions: Math.round(mins[6 - i] / 25),
        sleep: sleeps[6 - i], weight: weights[6 - i], protein: proteins[6 - i],
        kcal: kcals[6 - i], sys: bps[6 - i][0], dia: bps[6 - i][1], hr: 72 + (i % 4)
      };
    }

    const k0 = todayKey();
    const taskSeed = [
      ['资料分析 2 组（20 题，限时）', '行测·资料', true],
      ['判断推理刷 30 题', '行测·判断', true],
      ['申论大作文开头 200 字', '申论', false],
      ['背 20 个常识考点', '行测·常识', false],
      ['睡前拉伸 10 分钟', '申论', false]
    ];
    taskSeed.forEach(t => S.tasks.push({ id: uid(), date: k0, text: t[0], subject: t[1], done: t[2] }));

    const mSeed = [
      ['行测·资料', '审题失误', '同比/环比看反，整组数据跟着错', '先把时间轴写在旁边再找数', true],
      ['行测·数量', '时间不够', '排列组合题卡了 6 分钟，后面 3 题没做', '超过 90 秒直接标记跳过', false],
      ['行测·判断', '知识盲点', '削弱题把「另有他因」当成「无关项」', '先判断论点主体，再看选项是否换主体', false],
      ['申论', '知识盲点', '对策段只写「加强宣传」，没有主体和抓手', '背 5 个万能主体：政府/企业/学校/社区/个人', false],
      ['行测·言语', '蒙错', '成语辨析：不以为然 / 不以为意', '整理 30 组易混成语，每天过 10 组', true],
      ['行测·资料', '计算失误', '增长率化除为乘算错一位', '草稿分栏写，禁止心算两位数', false]
    ];
    mSeed.forEach((m, i) => S.mistakes.push({
      id: uid(), date: dateKey(addDays(new Date(), -(i % 4))),
      subject: m[0], cause: m[1], text: m[2], note: m[3], reviewed: m[4]
    }));

    for (let i = 5; i >= 0; i--) {
      if (i === 2) continue;
      S.workouts.push({
        id: uid(), date: dateKey(addDays(new Date(), -i)), type: i % 2 ? '快走' : '爬楼',
        floors: i % 2 ? 0 : 30 + i * 2, min: 22 + i, hr: 128 + (i % 5) * 4
      });
    }
  }

  /* ---------------- boot ---------------- */
  let booted = false;
  function applyHash() {
    const h = (location.hash || '').replace('#', '');
    if (!h) return;
    const btn = document.querySelector('.tab[data-view="' + h + '"]');
    if (btn) btn.click();
  }
  function boot() {
    if (booted) return;
    booted = true;
    if (/[?&]demo=1/.test(location.search) && Object.keys(S.days).length === 0) {
      seedDemo();
      save();
    }
    initSelects();
    initTabs();
    initTasks();
    initFocus();
    initMistakes();
    initBody();
    initSettings();
    renderSettings();
    renderAll();
    applyHash();
    // 首次访问：给一条提示，但不塞数据
    if (!localStorage.getItem(KEY + '_seen')) {
      localStorage.setItem(KEY + '_seen', '1');
      setTimeout(() => toast('数据只存在这台设备。想先看效果，去「设置 · 数据」灌演示数据。'), 900);
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
  // 若脚本在 DOMContentLoaded 之后执行（缓存情形）
  if (document.readyState === 'interactive' || document.readyState === 'complete') boot();
})();
