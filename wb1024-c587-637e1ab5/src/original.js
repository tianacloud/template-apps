
export default function start(){
  'use strict';

  var GOAL_DB = 'goals';
  var LOG_DB  = 'logs';
  var CONTENT_DB = 'contents';

  var OPT_GOAL_STATUS = [];   // 由 db.getSchema 填充
  var OPT_CONTENT_SUBJECT = [];
  var OPT_CONTENT_STATUS = [];
  var OPTIONS = { goalStatus: [], subject: [], contentStatus: [] };

  var STATE = {
    goals: [],
    logs: [],
    contents: [],
    tab: 'goals',
    subject: 'all',
    status: 'all',
    search: '',
    expanded: {},
    loaded: { goals: false, logs: false, contents: false }
  };

  var CACHE_PREFIX = 'wb_study_goal_';
  var TIMER = { id: null, seconds: 0, running: false };

  /* ===================== 基础工具（纯函数，无副作用） ===================== */

  function $(id){ return document.getElementById(id); }

  function p2(n){ return (n < 10 ? '0' : '') + n; }

  function esc(s){
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* 把「学习内容」文本切成要点数组：兼容 \n / 全角分号 / 分号 / 项目符号 */
  function splitPoints(txt){
    if (!txt) return [];
    var raw = String(txt).split(/\r?\n|；|;/);
    var out = [];
    for (var i = 0; i < raw.length; i++){
      var s = raw[i].replace(/^[\s·•‧∙\-—*]+/, '').trim();
      if (s) out.push(s);
    }
    return out;
  }

  function pointsHtml(points, cls){
    if (!points || !points.length) return '';
    var h = '<ul class="' + cls + '">';
    for (var i = 0; i < points.length; i++) h += '<li>' + esc(points[i]) + '</li>';
    return h + '</ul>';
  }

  function dayKeyOf(d){ return d.getFullYear() + '-' + p2(d.getMonth()+1) + '-' + p2(d.getDate()); }

  function todayKey(){ return dayKeyOf(new Date()); }

  function shiftKey(key, delta){
    var parts = String(key).split('-');
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + delta);
    return dayKeyOf(d);
  }

  function keyOfAnyDate(v){
    if (!v) return '';
    return String(v).slice(0, 10);
  }

  function shortKey(key){ return key.slice(5).replace('-', '/'); }

  function weekday(key){
    var parts = String(key).split('-');
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return ['日','一','二','三','四','五','六'][d.getDay()];
  }

  function num(v, dflt){
    var n = parseFloat(v);
    return isFinite(n) ? n : (dflt === undefined ? 0 : dflt);
  }

  function fmtNum(n){
    var r = Math.round(n * 10) / 10;
    return (r % 1 === 0) ? String(r) : r.toFixed(1);
  }

  function diffDays(fromKey, toKey){
    var a = String(fromKey).split('-'), b = String(toKey).split('-');
    var da = Date.UTC(Number(a[0]), Number(a[1]) - 1, Number(a[2]));
    var db = Date.UTC(Number(b[0]), Number(b[1]) - 1, Number(b[2]));
    return Math.round((db - da) / 86400000);
  }

  function toast(msg){
    var el = document.querySelector('.toast');
    if (!el){
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-show');
    if (el._t) clearTimeout(el._t);
    el._t = setTimeout(function(){ el.classList.remove('is-show'); }, 2200);
  }

  function setSync(mode, text){
    var box = $('syncStatus'), t = $('syncText');
    if (!box) return;
    box.className = 'sync ' + (mode ? 'is-' + mode : '');
    if (t && text) t.textContent = text;
  }

  function recId(row){
    if (!row) return '';
    return row._id || row.record_id || row.id || '';
  }

  /* ===================== 本地缓存（断网兜底 + 表单草稿） ===================== */

  function cacheGet(key){
    try{ return localStorage.getItem(CACHE_PREFIX + key) || ''; }catch(e){ return ''; }
  }
  function cacheSet(key, val){
    try{ localStorage.setItem(CACHE_PREFIX + key, val); }catch(e){}
  }
  function cacheDel(key){
    try{ localStorage.removeItem(CACHE_PREFIX + key); }catch(e){}
  }
  function cacheSnapshot(kind, data){
    try{ localStorage.setItem(CACHE_PREFIX + 'snap_' + kind, JSON.stringify(data)); }catch(e){}
  }
  function cacheSnapshotGet(kind){
    try{
      var raw = localStorage.getItem(CACHE_PREFIX + 'snap_' + kind);
      return raw ? JSON.parse(raw) : null;
    }catch(e){ return null; }
  }

  /* ===================== 数据层：只负责读写，不做渲染 ===================== */

  var db = (window.__SMART_PAGE__ && window.__SMART_PAGE__.database) || null;

  function pageGoals(cursor, acc, guard){
    if (guard > 100) return Promise.resolve(acc);
    return db.query({ databaseId: 'goals', pageSize: 200, startCursor: cursor })
      .then(function(r){
        var merged = acc.concat(r.results || []);
        var next = r.nextCursor;
        if (r.hasMore && next && next !== cursor && (r.results || []).length) {
          return pageGoals(next, merged, guard + 1);
        }
        return merged;
      });
  }

  function pageLogs(cursor, acc, guard){
    if (guard > 100) return Promise.resolve(acc);
    return db.query({ databaseId: 'logs', pageSize: 200, startCursor: cursor })
      .then(function(r){
        var merged = acc.concat(r.results || []);
        var next = r.nextCursor;
        if (r.hasMore && next && next !== cursor && (r.results || []).length) {
          return pageLogs(next, merged, guard + 1);
        }
        return merged;
      });
  }

  function pageContents(cursor, acc, guard){
    if (guard > 100) return Promise.resolve(acc);
    return db.query({ databaseId: 'contents', pageSize: 200, startCursor: cursor })
      .then(function(r){
        var merged = acc.concat(r.results || []);
        var next = r.nextCursor;
        if (r.hasMore && next && next !== cursor && (r.results || []).length) {
          return pageContents(next, merged, guard + 1);
        }
        return merged;
      });
  }

  function loadGoals(){
    return pageGoals(undefined, [], 0).then(function(rows){
      STATE.goals = rows;
      STATE.loaded.goals = true;
      cacheSnapshot('goals', rows);
    }).catch(function(err){
      console.error('[database] 目标加载失败:', err);
      STATE.goals = cacheSnapshotGet('goals') || [];
      STATE.loaded.goals = false;
    });
  }

  function loadLogs(){
    return pageLogs(undefined, [], 0).then(function(rows){
      STATE.logs = rows;
      STATE.loaded.logs = true;
      cacheSnapshot('logs', rows);
    }).catch(function(err){
      console.error('[database] 打卡加载失败:', err);
      STATE.logs = cacheSnapshotGet('logs') || [];
      STATE.loaded.logs = false;
    });
  }

  function loadContents(){
    return pageContents(undefined, [], 0).then(function(rows){
      STATE.contents = rows;
      STATE.loaded.contents = true;
      cacheSnapshot('contents', rows);
    }).catch(function(err){
      console.error('[database] 内容加载失败:', err);
      STATE.contents = cacheSnapshotGet('contents') || [];
      STATE.loaded.contents = false;
    });
  }

  function loadSchemaOptions(){
    if (!db) return Promise.resolve();
    return Promise.all([
      db.getSchema({ databaseId: 'goals' }),
      db.getSchema({ databaseId: 'contents' })
    ]).then(function(list){
      readOptions(list[0], ['状态'], OPTIONS.goalStatus);
      readOptions(list[1], ['科目'], OPTIONS.subject);
      readOptions(list[1], ['状态'], OPTIONS.contentStatus);
    }).catch(function(err){
      console.error('[database] schema 加载失败:', err);
    });
  }

  function readOptions(schema, names, bucket){
    var props = (schema && schema.properties) || [];
    for (var i = 0; i < props.length; i++){
      if (names.indexOf(props[i].name) !== -1 && props[i].config && props[i].config.options){
        var opts = props[i].config.options;
        for (var j = 0; j < opts.length; j++) bucket.push({ id: opts[j].id, text: opts[j].text });
      }
    }
  }

  function optionId(bucket, text){
    for (var i = 0; i < bucket.length; i++){ if (bucket[i].text === text) return bucket[i].id; }
    return text;
  }

  function tagColorFor(text){
    if (text === '进行中') return 'blue';
    if (text === '已完成') return 'green';
    if (text === '已暂停') return 'neutral';
    if (text === '未学') return 'neutral';
    if (text === '已学') return 'green';
    return 'blue';
  }

  /* ===================== 计算层：纯计算，不碰 DOM ===================== */

  function logsInRange(fromKey, toKey){
    var out = [];
    for (var i = 0; i < STATE.logs.length; i++){
      var k = keyOfAnyDate(STATE.logs[i]['日期']);
      if (k && k >= fromKey && k <= toKey) out.push(STATE.logs[i]);
    }
    return out;
  }

  function logsOfGoal(name){
    var out = [];
    for (var i = 0; i < STATE.logs.length; i++){
      if (String(STATE.logs[i]['目标名称'] || '') === name) out.push(STATE.logs[i]);
    }
    return out;
  }

  function sumBy(rows, field){
    var s = 0;
    for (var i = 0; i < rows.length; i++) s += num(rows[i][field], 0);
    return s;
  }

  function speedWindow(){
    var t = todayKey();
    return { from: shiftKey(t, -7), to: shiftKey(t, -1), days: 7 };
  }

  function speedOfGoal(name){
    var w = speedWindow();
    var rows = logsInRange(w.from, w.to);
    var mine = [];
    for (var i = 0; i < rows.length; i++){
      if (String(rows[i]['目标名称'] || '') === name) mine.push(rows[i]);
    }
    var total = sumBy(mine, '完成量');
    return {
      total: total,
      avg: total / w.days,
      days: countDistinctDays(mine),
      from: w.from,
      to: w.to
    };
  }

  function countDistinctDays(rows){
    var seen = {}, n = 0;
    for (var i = 0; i < rows.length; i++){
      var k = keyOfAnyDate(rows[i]['日期']);
      if (k && !seen[k]) { seen[k] = 1; n++; }
    }
    return n;
  }

  function streakOfGoal(name){
    var set = {};
    for (var i = 0; i < STATE.logs.length; i++){
      var r = STATE.logs[i];
      if (String(r['目标名称'] || '') !== name) continue;
      var k = keyOfAnyDate(r['日期']);
      if (k) set[k] = 1;
    }
    return countBack(set);
  }

  function globalStreak(){
    var set = {};
    for (var i = 0; i < STATE.logs.length; i++){
      var k = keyOfAnyDate(STATE.logs[i]['日期']);
      if (k) set[k] = 1;
    }
    return countBack(set);
  }

  function countBack(set){
    var cur = todayKey();
    if (!set[cur]) cur = shiftKey(cur, -1);
    var n = 0;
    while (set[cur] && n < 3000){ n++; cur = shiftKey(cur, -1); }
    return n;
  }

  function goalMetrics(goal){
    var name = String(goal['目标名称'] || '');
    var total = num(goal['总量'], 0);
    var done = num(goal['已完成'], 0);
    var remain = Math.max(0, total - done);
    var rate = total > 0 ? Math.min(1, done / total) : 0;
    var sp = speedOfGoal(name);
    var due = keyOfAnyDate(goal['截止日']);

    var eta = '';
    var delta = null;        // 正数=提前，负数=拖后
    var etaDayGap = null;
    if (sp.avg > 0 && remain > 0) {
      etaDayGap = Math.ceil(remain / sp.avg);
      eta = shiftKey(todayKey(), etaDayGap);
      if (due) delta = diffDays(eta, due);
    } else if (remain === 0) {
      eta = todayKey();
      if (due) delta = diffDays(eta, due);
    }

    return {
      name: name,
      total: total,
      done: done,
      unit: String(goal['单位'] || ''),
      remain: remain,
      rate: rate,
      status: String(goal['状态'] || '进行中'),
      due: due,
      eta: eta,
      etaDayGap: etaDayGap,
      delta: delta,
      speed: sp,
      streak: streakOfGoal(name),
      dueIn: due ? diffDays(todayKey(), due) : null
    };
  }

  function allMetrics(){
    var out = [];
    for (var i = 0; i < STATE.goals.length; i++) out.push(goalMetrics(STATE.goals[i]));
    out.sort(function(a, b){
      if (a.status === '已完成' && b.status !== '已完成') return 1;
      if (b.status === '已完成' && a.status !== '已完成') return -1;
      var da = (a.delta === null ? 9999 : a.delta);
      var db2 = (b.delta === null ? 9999 : b.delta);
      return da - db2;
    });
    return out;
  }

  function nextLesson(){
    var order = ['经济基础知识', '工商管理'];
    for (var o = 0; o < order.length; o++){
      for (var i = 0; i < STATE.contents.length; i++){
        var c = STATE.contents[i];
        if (String(c['科目'] || '') === order[o] && String(c['状态'] || '') === '未学'){
          return c;
        }
      }
    }
    return null;
  }

  function guessGoalName(subject){
    var key = subject === '工商管理' ? '工商管理' : '经济基础';
    for (var i = 0; i < STATE.goals.length; i++){
      var n = String(STATE.goals[i]['目标名称'] || '');
      if (n.indexOf(key) !== -1) return n;
    }
    return STATE.goals.length ? String(STATE.goals[0]['目标名称'] || '') : '';
  }

  function todayMinutes(){
    var t = todayKey(), s = 0;
    for (var i = 0; i < STATE.logs.length; i++){
      if (keyOfAnyDate(STATE.logs[i]['日期']) === t) s += num(STATE.logs[i]['时长分钟'], 0);
    }
    return s;
  }

  /* ===================== 渲染层：只负责把数据写进 DOM ===================== */

  function ringSvg(rate){
    var r = 25, c = 2 * Math.PI * r;
    var off = c * (1 - Math.min(1, Math.max(0, rate)));
    var color = rate >= 1 ? '#0f9d63' : '#3d6df2';
    return '<svg class="ring" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">'
      + '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="#eef0f6" stroke-width="7"></circle>'
      + '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="7" '
      + 'stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" '
      + 'transform="rotate(-90 32 32)"></circle>'
      + '<text x="32" y="37" text-anchor="middle" font-size="15" font-weight="600" fill="#171a21">'
      + Math.round(rate * 100) + '%</text>'
      + '</svg>';
  }

  function deltaTag(m){
    if (m.remain === 0) return '<span class="tag green">已达成</span>';
    if (m.delta === null) return '<span class="tag neutral">速度不足，待推算</span>';
    if (m.delta >= 0) return '<span class="tag green">提前 ' + m.delta + ' 天</span>';
    return '<span class="tag red">拖后 ' + Math.abs(m.delta) + ' 天</span>';
  }

  function renderToday(){
    var box = $('todayList');
    if (!box) return;
    var items = [];
    var tKey = todayKey();
    var mins = todayMinutes();

    // 1) 今日打卡状态
    if (mins > 0) {
      items.push({
        cls: 'is-ok',
        color: '#0f9d63',
        title: '今天已打卡 <b>' + mins + ' 分钟</b>',
        sub: mins >= 60 ? '已达标，继续保持' : '距 60 分钟目标还差 ' + (60 - mins) + ' 分钟',
        action: null
      });
    } else {
      items.push({
        cls: 'is-warn',
        color: '#dc3b40',
        title: '今天还没打卡',
        sub: '按计划今天要学 1 小时，别断了节奏',
        action: { label: '去打卡', act: 'go-checkin' }
      });
    }

    // 2) 今日推荐学习内容（带本章学习内容要点）
    var lesson = nextLesson();
    if (lesson) {
      var lessonPts = splitPoints(lesson['学习内容']);
      items.push({
        cls: '',
        color: '#3d6df2',
        hasPoints: true,
        title: '今天建议学：<b>' + esc(lesson['章节名称']) + '</b>',
        sub: esc(lesson['科目']) + ' · 核心考点：' + esc(lesson['核心考点'] || '—'),
        points: lessonPts,
        foot: lessonPts.length
          ? '本章学习内容 · 建议 45min 听课 + 10min 做题 + 5min 复盘'
          : '该章还没录入学习内容，可到「学习内容库」补充',
        action: { label: '填入打卡', act: 'use-lesson', lesson: lesson['章节名称'], subject: lesson['科目'] }
      });
    }

    // 3) 落后预警
    var ms = allMetrics();
    var behind = [];
    for (var i = 0; i < ms.length; i++){
      if (ms[i].remain > 0 && ms[i].delta !== null && ms[i].delta < 0) behind.push(ms[i]);
    }
    if (behind.length) {
      behind.sort(function(a, b){ return a.delta - b.delta; });
      var names = [];
      for (var j = 0; j < behind.length && j < 3; j++){
        names.push('《' + esc(behind[j].name) + '》拖后 ' + Math.abs(behind[j].delta) + ' 天');
      }
      items.push({
        cls: 'is-warn',
        color: '#dc3b40',
        title: behind.length + ' 个目标进度落后',
        sub: names.join(' · ') + '。按近 7 天速度推算，照当前节奏赶不上截止日',
        action: { label: '看目标', act: 'go-goals' }
      });
    }

    // 4) 连续打卡
    var gs = globalStreak();
    items.push({
      cls: gs > 0 ? 'is-ok' : '',
      color: gs > 0 ? '#0f9d63' : '#98a0ae',
      title: '连续打卡 <b>' + gs + ' 天</b>',
      sub: gs > 0 ? '保持住，明天继续' : '昨天没有记录，今天重新开始',
      action: null
    });

    var html = '';
    for (var k = 0; k < items.length; k++){
      var it = items[k];
      var pts = it.points || [];
      html += '<div class="today-item ' + it.cls + (pts.length ? ' has-points' : '') + '">'
        + '<span class="ti-icon"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="' + it.color + '"></circle></svg></span>'
        + '<div class="ti-body"><div>' + it.title + '</div><div class="ti-sub">' + it.sub + '</div>'
        + pointsHtml(pts, 'ti-points')
        + (it.foot ? '<div class="ti-foot">' + esc(it.foot) + '</div>' : '')
        + '</div>'
        + (it.action ? '<button class="btn tiny" type="button" data-act="' + it.action.act + '"'
            + (it.action.lesson ? ' data-lesson="' + esc(it.action.lesson) + '" data-subject="' + esc(it.action.subject) + '"' : '')
            + '>' + it.action.label + '</button>' : '')
        + '</div>';
    }
    box.innerHTML = html || '<div class="today-empty">暂无待处理事项</div>';

    var dt = $('todayDate');
    if (dt) dt.textContent = tKey + ' 周' + weekday(tKey);
  }

  function renderGoals(){
    var box = $('goalList');
    if (!box) return;
    var ms = allMetrics();
    if (!ms.length) {
      box.innerHTML = '<div class="empty">还没有学习目标。点右上角「+ 新增目标」建一个，例如「经济基础知识 精学 · 37 章 · 截止 2026-11-07」。</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < ms.length; i++){
      var m = ms[i];
      var remainTxt = m.remain > 0 ? ('还差 ' + fmtNum(m.remain) + (m.unit || '')) : '已全部完成';
      html += '<div class="goal-card">'
        + '<div class="goal-top">' + ringSvg(m.rate)
        + '<div class="goal-head">'
        + '<div class="goal-name" data-sp-bindable="database" data-sp-database-id="goals">' + esc(m.name) + '</div>'
        + '<div class="goal-tags">'
        + '<span class="tag ' + tagColorFor(m.status) + '">' + esc(m.status) + '</span>'
        + deltaTag(m)
        + (m.dueIn !== null ? '<span class="tag neutral">距截止 ' + m.dueIn + ' 天</span>' : '')
        + '</div>'
        + '<div class="progress"><i style="width:' + Math.round(m.rate * 100) + '%"></i></div>'
        + '</div></div>'
        + '<div class="goal-metrics">'
        + '<div class="metric"><div class="k">完成率</div><div class="v" data-sp-bindable="database" data-sp-database-id="goals">'
          + Math.round(m.rate * 100) + '%<small> · ' + fmtNum(m.done) + '/' + fmtNum(m.total) + (m.unit || '') + '</small></div></div>'
        + '<div class="metric"><div class="k">连续打卡</div><div class="v" data-sp-bindable="database" data-sp-database-id="logs">'
          + m.streak + '<small> 天</small></div></div>'
        + '<div class="metric"><div class="k">近 7 天日均</div><div class="v">'
          + fmtNum(m.speed.avg) + '<small> ' + esc(m.unit || '') + '/天 · 打卡 ' + m.speed.days + ' 天</small></div></div>'
        + '<div class="metric"><div class="k">预计完成日</div><div class="v" data-sp-bindable="database" data-sp-database-id="goals">'
          + (m.eta ? esc(m.eta) : '—') + '</div></div>'
        + '</div>'
        + '<div class="goal-foot">'
        + '<span class="hint">截止 ' + (m.due ? esc(m.due) : '未设') + ' · ' + remainTxt + '</span>'
        + '<span class="acts">'
        + '<button class="btn tiny" type="button" data-act="goal-checkin" data-goal="' + esc(m.name) + '">去打卡</button>'
        + '<button class="btn tiny danger-ghost" type="button" data-act="goal-del" data-goal="' + esc(m.name) + '">删除</button>'
        + '</span></div>'
        + '</div>';
    }
    box.innerHTML = html;
  }

  function renderLogs(){
    var box = $('logList');
    if (!box) return;
    var rows = STATE.logs.slice();
    rows.sort(function(a, b){
      var ka = keyOfAnyDate(a['日期']), kb = keyOfAnyDate(b['日期']);
      if (ka === kb) return 0;
      return ka < kb ? 1 : -1;
    });
    var cnt = $('logCount');
    if (cnt) cnt.textContent = '共 ' + rows.length + ' 条 · 累计 ' + fmtNum(sumBy(rows, '时长分钟')) + ' 分钟';

    if (!rows.length) {
      box.innerHTML = '<div class="empty">还没有打卡记录，去上面提交第一条吧。</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < rows.length && i < 60; i++){
      var r = rows[i];
      var k = keyOfAnyDate(r['日期']);
      html += '<div class="log-item">'
        + '<div class="log-date"><div class="d">' + esc(k.slice(8)) + '</div><div class="m">' + esc(k.slice(5, 7)) + '月</div></div>'
        + '<div class="log-body">'
        + '<div class="t" data-sp-bindable="database" data-sp-database-id="logs">' + esc(r['学习内容'] || '未填写学习内容') + '</div>'
        + '<div class="s">' + esc(r['目标名称'] || '') + ' · ' + num(r['时长分钟'], 0) + ' 分钟'
          + (r['备注'] ? ' · ' + esc(r['备注']) : '') + '</div>'
        + '</div>'
        + '<div class="log-amount">+' + fmtNum(num(r['完成量'], 0)) + '</div>'
        + '<button class="btn tiny danger-ghost" type="button" data-act="log-del" data-id="' + esc(recId(r)) + '">删</button>'
        + '</div>';
    }
    box.innerHTML = html;
  }

  function renderSelects(){
    var goalSel = document.querySelector('#logForm select[name="logGoal"]');
    if (goalSel){
      var keep = goalSel.value;
      var opts = '<option value="">请选择目标</option>';
      for (var i = 0; i < STATE.goals.length; i++){
        var n = String(STATE.goals[i]['目标名称'] || '');
        opts += '<option value="' + esc(n) + '">' + esc(n) + '</option>';
      }
      goalSel.innerHTML = opts;
      var exists = false;
      for (var j = 0; j < STATE.goals.length; j++){
        if (String(STATE.goals[j]['目标名称'] || '') === keep) exists = true;
      }
      if (keep && exists) goalSel.value = keep;
    }
    var stSel = document.querySelector('#goalForm select[name="goalStatus"]');
    if (stSel){
      var keepS = stSel.value;
      var o2 = '';
      for (var k = 0; k < OPTIONS.goalStatus.length; k++){
        o2 += '<option value="' + esc(OPTIONS.goalStatus[k].id) + '">' + esc(OPTIONS.goalStatus[k].text) + '</option>';
      }
      if (!o2) o2 = '<option value="进行中">进行中</option>';
      stSel.innerHTML = o2;
      if (keepS) stSel.value = keepS;
    }
  }

  function renderContents(){
    var box = $('contentList');
    if (!box) return;

    var subjChips = $('subjectFilter');
    if (subjChips){
      var subs = [];
      for (var i = 0; i < STATE.contents.length; i++){
        var s = String(STATE.contents[i]['科目'] || '');
        if (s && subs.indexOf(s) === -1) subs.push(s);
      }
      subs.sort();
      var sh = '<button class="chip' + (STATE.subject === 'all' ? ' is-active' : '') + '" type="button" data-act="filter-subject" data-value="all">全部科目</button>';
      for (var a = 0; a < subs.length; a++){
        sh += '<button class="chip' + (STATE.subject === subs[a] ? ' is-active' : '') + '" type="button" data-act="filter-subject" data-value="' + esc(subs[a]) + '">' + esc(subs[a]) + '</button>';
      }
      subjChips.innerHTML = sh;
    }

    var stChips = $('statusFilter');
    if (stChips){
      var stats = ['全部状态', '未学', '已学'];
      var vals = ['all', '未学', '已学'];
      var th = '';
      for (var b = 0; b < stats.length; b++){
        th += '<button class="chip' + (STATE.status === vals[b] ? ' is-active' : '') + '" type="button" data-act="filter-status" data-value="' + vals[b] + '">' + stats[b] + '</button>';
      }
      stChips.innerHTML = th;
    }

    var q = STATE.search.toLowerCase();
    var rows = [];
    for (var c = 0; c < STATE.contents.length; c++){
      var it = STATE.contents[c];
      if (STATE.subject !== 'all' && String(it['科目'] || '') !== STATE.subject) continue;
      if (STATE.status !== 'all' && String(it['状态'] || '') !== STATE.status) continue;
      if (q){
        var hay = (String(it['章节名称'] || '') + ' ' + String(it['核心考点'] || '') + ' ' + String(it['学习内容'] || '')).toLowerCase();
        if (hay.indexOf(q) === -1) continue;
      }
      rows.push(it);
    }

    var doneAll = 0;
    for (var d = 0; d < STATE.contents.length; d++){ if (String(STATE.contents[d]['状态'] || '') === '已学') doneAll++; }
    var cnt = $('contentCount');
    if (cnt) cnt.textContent = '已学 ' + doneAll + '/' + STATE.contents.length + ' 章 · 当前筛选 ' + rows.length + ' 条';

    if (!rows.length){
      box.innerHTML = '<div class="empty">没有匹配的章节。</div>';
      return;
    }
    var html = '';
    for (var e = 0; e < rows.length; e++){
      var r = rows[e];
      var rid = recId(r);
      var isDone = String(r['状态'] || '') === '已学';
      var isOpen = !!STATE.expanded[rid];
      var pts = splitPoints(r['学习内容']);
      html += '<div class="content-item' + (isDone ? ' is-done' : '') + '">'
        + '<div class="content-body">'
        + '<div class="t" data-sp-bindable="database" data-sp-database-id="contents">' + esc(r['章节名称'] || '') + '</div>'
        + '<div class="s"><span class="tag ' + tagColorFor(String(r['科目'] || '')) + '">' + esc(r['科目'] || '') + '</span> '
        + esc(r['核心考点'] || '—') + '</div>'
        + (pts.length
            ? '<button class="lesson-toggle' + (isOpen ? ' is-open' : '') + '" type="button" data-act="content-expand" data-id="' + esc(rid) + '">'
              + '<span class="caret"><svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="#3d6df2" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>'
              + (isOpen ? '收起学习内容' : '查看学习内容') + '（' + pts.length + ' 个要点）</button>'
              + (isOpen ? pointsHtml(pts, 'lesson-points') : '')
            : '<div class="lesson-cta">该章暂无学习内容</div>')
        + '</div>'
        + '<div class="content-acts">'
        + '<span class="tag ' + (isDone ? 'green' : 'neutral') + '">' + esc(r['状态'] || '未学') + '</span>'
        + '<button class="btn tiny" type="button" data-act="content-add" data-id="' + esc(recId(r)) + '" data-name="' + esc(r['章节名称'] || '') + '" data-subject="' + esc(r['科目'] || '') + '">加入今日</button>'
        + '<button class="btn tiny" type="button" data-act="content-toggle" data-id="' + esc(recId(r)) + '" data-next="' + (isDone ? '未学' : '已学') + '">' + (isDone ? '改回未学' : '标记已学') + '</button>'
        + '</div></div>';
    }
    box.innerHTML = html;
  }

  function renderStats(){
    var grid = $('statGrid');
    if (!grid) return;

    var totalMin = sumBy(STATE.logs, '时长分钟');
    var dayMap = {};
    for (var i = 0; i < STATE.logs.length; i++){
      var k = keyOfAnyDate(STATE.logs[i]['日期']);
      if (k) dayMap[k] = (dayMap[k] || 0) + num(STATE.logs[i]['时长分钟'], 0);
    }
    var dayCount = 0;
    for (var kk in dayMap){ if (dayMap.hasOwnProperty(kk)) dayCount++; }

    var ms = allMetrics();
    var rateSum = 0;
    for (var j = 0; j < ms.length; j++) rateSum += ms[j].rate;
    var avgRate = ms.length ? rateSum / ms.length : 0;

    var w = speedWindow();
    var weekRows = logsInRange(w.from, w.to);
    var weekMin = sumBy(weekRows, '时长分钟');

    var gh = ''
      + '<div class="stat"><div class="k">累计学习时长</div><div class="v" data-sp-bindable="database" data-sp-database-id="logs">'
        + fmtNum(totalMin / 60) + '<small>小时</small></div></div>'
      + '<div class="stat"><div class="k">累计打卡天数</div><div class="v" data-sp-bindable="database" data-sp-database-id="logs">'
        + dayCount + '<small>天</small></div></div>'
      + '<div class="stat"><div class="k">当前连续打卡</div><div class="v" data-sp-bindable="database" data-sp-database-id="logs">'
        + globalStreak() + '<small>天</small></div></div>'
      + '<div class="stat"><div class="k">目标平均完成率</div><div class="v" data-sp-bindable="database" data-sp-database-id="goals">'
        + Math.round(avgRate * 100) + '<small>%</small></div></div>'
      + '<div class="stat"><div class="k">近 7 天日均时长</div><div class="v" data-sp-bindable="database" data-sp-database-id="logs">'
        + fmtNum(weekMin / 7) + '<small>分钟</small></div></div>';
    grid.innerHTML = gh;

    renderBarChart(dayMap);
    renderHeatMap(dayMap);
    renderGoalBars(ms);
  }

  function renderBarChart(dayMap){
    var box = $('barChart');
    if (!box) return;
    var t = todayKey();
    var days = [];
    for (var i = 13; i >= 0; i--) days.push(shiftKey(t, -i));
    var max = 60;
    for (var j = 0; j < days.length; j++){ if ((dayMap[days[j]] || 0) > max) max = dayMap[days[j]]; }

    var W = 660, H = 200, padL = 34, padR = 12, baseY = H - 32, top = 14;
    var bw = (W - padL - padR) / days.length;
    var svg = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" data-sp-bindable="database" data-sp-database-id="logs" role="img">';

    var y60 = baseY - (60 / max) * (baseY - top);
    svg += '<line x1="' + padL + '" y1="' + y60.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y60.toFixed(1) + '" stroke="#b9c6f5" stroke-width="1" stroke-dasharray="5 5"></line>'
      + '<text x="' + (W - padR) + '" y="' + (y60 - 5).toFixed(1) + '" text-anchor="end" font-size="10" fill="#8d96a8">60 分钟达标线</text>';

    for (var b = 0; b < days.length; b++){
      var v = dayMap[days[b]] || 0;
      var h = max > 0 ? (v / max) * (baseY - top) : 0;
      if (v > 0 && h < 3) h = 3;
      var x = padL + b * bw + bw * 0.18;
      var w2 = bw * 0.64;
      var y = baseY - h;
      var fill = v === 0 ? '#e9ecf3' : (v >= 60 ? '#0f9d63' : '#3d6df2');
      if (v === 0) h = 3;
      svg += '<rect x="' + x.toFixed(1) + '" y="' + (baseY - h).toFixed(1) + '" width="' + w2.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="' + fill + '"></rect>';
      if (v > 0){
        svg += '<text x="' + (x + w2 / 2).toFixed(1) + '" y="' + (baseY - h - 5).toFixed(1) + '" text-anchor="middle" font-size="10" fill="#6b7280">' + Math.round(v) + '</text>';
      }
      svg += '<text x="' + (x + w2 / 2).toFixed(1) + '" y="' + (baseY + 15) + '" text-anchor="middle" font-size="10" fill="#98a0ae">' + shortKey(days[b]) + '</text>';
    }
    svg += '<line x1="' + padL + '" y1="' + baseY + '" x2="' + (W - padR) + '" y2="' + baseY + '" stroke="#e5e7ef" stroke-width="1"></line>';
    svg += '</svg>';
    box.innerHTML = svg;
  }

  function renderHeatMap(dayMap){
    var box = $('heatMap');
    if (!box) return;
    var t = todayKey();
    var cells = [];
    for (var i = 69; i >= 0; i--) cells.push(shiftKey(t, -i));
    var cell = 14, gap = 4, W = 10 * (cell + gap) + 34, H = 7 * (cell + gap) + 40;
    var x0 = 26, y0 = 24;

    var svg = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" data-sp-bindable="database" data-sp-database-id="logs" role="img">';
    var labels = ['一', '', '三', '', '五', '', '日'];
    for (var r = 0; r < 7; r++){
      if (!labels[r]) continue;
      svg += '<text x="' + (x0 - 8) + '" y="' + (y0 + r * (cell + gap) + 11) + '" text-anchor="end" font-size="9" fill="#98a0ae">' + labels[r] + '</text>';
    }
    for (var c = 0; c < 70; c++){
      var key = cells[c];
      var col = Math.floor(c / 7), row = c % 7;
      var v = dayMap[key] || 0;
      var fill = '#eef0f6';
      if (v > 0 && v < 30) fill = '#c9dcf7';
      else if (v >= 30 && v < 60) fill = '#7ea3f2';
      else if (v >= 60) fill = '#2f5fe0';
      svg += '<rect x="' + (x0 + col * (cell + gap)) + '" y="' + (y0 + row * (cell + gap)) + '" width="' + cell + '" height="' + cell + '" rx="3" fill="' + fill + '">'
        + '<title>' + key + ' · ' + Math.round(v) + ' 分钟</title></rect>';
    }
    var lgY = y0 + 7 * (cell + gap) + 8;
    var lg = [['#eef0f6', '未打卡'], ['#c9dcf7', '<30分'], ['#7ea3f2', '30-60分'], ['#2f5fe0', '≥60分']];
    var lx = x0;
    for (var g = 0; g < lg.length; g++){
      svg += '<rect x="' + lx + '" y="' + lgY + '" width="10" height="10" rx="2" fill="' + lg[g][0] + '"></rect>'
        + '<text x="' + (lx + 14) + '" y="' + (lgY + 9) + '" font-size="9" fill="#98a0ae">' + lg[g][1] + '</text>';
      lx += 14 + 10 + lg[g][1].length * 6 + 10;
    }
    svg += '</svg>';
    box.innerHTML = svg;
  }

  function renderGoalBars(ms){
    var box = $('goalBars');
    if (!box) return;
    if (!ms.length){ box.innerHTML = '<div class="empty">还没有目标。</div>'; return; }
    var max = 0;
    for (var i = 0; i < ms.length; i++){ if (ms[i].speed.total > max) max = ms[i].speed.total; }
    if (max <= 0) max = 1;
    var rowH = 40, W = 660, labelW = 168, barW = W - labelW - 90;
    var H = ms.length * rowH + 12;
    var svg = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" data-sp-bindable="database" data-sp-database-id="logs" role="img">';
    for (var j = 0; j < ms.length; j++){
      var m = ms[j];
      var y = 12 + j * rowH;
      var wpx = Math.max(2, (m.speed.total / max) * barW);
      var color = (m.delta !== null && m.delta < 0) ? '#dc3b40' : '#3d6df2';
      svg += '<text x="0" y="' + (y + 15) + '" font-size="11.5" fill="#171a21">' + esc(m.name.length > 16 ? m.name.slice(0, 16) + '…' : m.name) + '</text>';
      svg += '<rect x="' + labelW + '" y="' + (y + 4) + '" width="' + barW + '" height="14" rx="7" fill="#f1f3f8"></rect>';
      svg += '<rect x="' + labelW + '" y="' + (y + 4) + '" width="' + wpx.toFixed(1) + '" height="14" rx="7" fill="' + color + '"></rect>';
      svg += '<text x="' + (labelW + barW + 8) + '" y="' + (y + 15) + '" font-size="11.5" fill="#6b7280">' + fmtNum(m.speed.total) + (m.unit || '') + '</text>';
    }
    svg += '</svg>';
    box.innerHTML = svg;
  }

  /* ===================== 统一刷新入口（渲染函数之间不互相调用） ===================== */

  function refreshAll(){
    renderSelects();
    renderToday();
    renderGoals();
    renderLogs();
    renderContents();
    renderStats();
  }

  /* ===================== 演示数据兜底（访客/未连云端时不留白屏） ===================== */

  /* 格式：科目|章节名|核心考点|学习要点（分号分隔） */
  var DEMO_CHAPTERS = [
    '经济基础知识|01 社会主义基本经济制度|所有制结构 · 收入分配制度 · 市场经济体制|公有制为主体、多种所有制经济共同发展；按劳分配为主体、多种分配方式并存；社会主义市场经济体制的基本特征',
    '经济基础知识|02 市场需求、供给与均衡价格|需求供给曲线 · 均衡价格 · 弹性|需求变动与需求量变动的区别；均衡价格的形成与移动；需求价格弹性与总收益的关系',
    '经济基础知识|03 生产和成本理论|生产函数 · 成本函数 · 短期成本曲线|边际报酬递减规律；规模报酬的三个阶段；TC、AC、AVC、MC 的形状与交点',
    '经济基础知识|04 市场结构理论|四类市场结构 · 生产者决策|完全竞争、垄断竞争、寡头、垄断的划分标准；完全竞争厂商的短期均衡；垄断厂商的定价与产量',
    '经济基础知识|05 生产要素市场理论|要素使用原则 · 劳动供给曲线|边际产品价值与要素需求曲线；劳动供给曲线向后弯曲的原因；要素市场均衡与工资决定',
    '经济基础知识|06 市场失灵和政府的干预|帕累托最优 · 外部性 · 公共物品|垄断造成的低效率与政府管制；外部性的四种干预手段；公共物品与信息不对称',
    '经济基础知识|07 国民收入核算和宏观经济模型|GDP与GNI · 核算方法|GDP 的三种核算方法；名义 GDP 与实际 GDP；两部门到四部门的收入恒等式',
    '经济基础知识|08 经济增长和经济发展理论|增长因素 · 新发展理念|增长核算与索洛余值；新发展理念的内涵；中国式现代化的基本特征',
    '经济基础知识|09 价格总水平和就业、失业|价格指数 · 失业类型 · 菲利普斯曲线|CPI 与 PPI 的编制思路；失业的四种类型与自然失业率；奥肯定律与菲利普斯曲线',
    '经济基础知识|10 国际贸易理论和政策|绝对优势 · 比较优势 · 关税壁垒|绝对优势与比较优势的区别；要素禀赋理论；关税与非关税壁垒的经济效应',
    '经济基础知识|11 公共物品与财政职能|公共物品特征 · 财政三大职能|非竞争性与非排他性；资源配置、收入分配、经济稳定三大职能；市场与政府的边界',
    '经济基础知识|12 财政支出|购买性支出 · 转移性支出 · 支出效益|购买性支出与转移性支出的区别；支出规模增长的两种理论解释；成本效益分析的常用方法',
    '经济基础知识|13 财政收入|宏观税负 · 税负转嫁 · 国债制度|财政集中度与宏观税负的衡量；税负转嫁的四种形式；国债的功能与适度规模',
    '经济基础知识|14 税收制度|税制要素 · 增值税 · 所得税|税制三要素；增值税的计税依据与进项抵扣；个人所得税综合与分类相结合',
    '经济基础知识|15 政府预算|预算职能 · 预算分类 · 编制执行|预算的职能与基本原则；单式预算与复式预算；四本预算的构成',
    '经济基础知识|16 财政管理体制|分税制 · 转移支付|分税制的核心内容；一般性与专项转移支付的区别；事权与支出责任划分',
    '经济基础知识|17 财政政策|政策工具 · 财政乘数 · 时滞|自动稳定器与相机抉择；财政乘数的一般计算；政策时滞与挤出效应',
    '经济基础知识|18 货币供求与货币均衡|货币需求理论 · 货币供给机制|费雪方程与剑桥方程；货币乘数与基础货币；社会融资规模的构成',
    '经济基础知识|19 中央银行与货币政策|政策工具 · 传导机制|三大传统货币政策工具；结构性货币政策工具；货币政策的传导渠道',
    '经济基础知识|20 商业银行与金融市场|商业银行经营 · 金融市场|商业银行的资产负债业务；存款保险制度要点；货币市场与资本市场子市场',
    '经济基础知识|21 金融风险与金融监管|金融风险类型 · 宏观审慎|金融风险的四种类型；巴塞尔协议的核心要求；影子银行与宏观审慎管理',
    '经济基础知识|22 对外金融关系与政策|汇率制度 · 国际储备|固定汇率与浮动汇率的利弊；国际储备的构成；人民币国际化的路径',
    '经济基础知识|23 统计与数据科学|描述统计与推断统计|描述统计与推断统计的分工；变量类型与计量尺度；数据来源与误差种类',
    '经济基础知识|24 描述统计|集中趋势 · 离散程度|均值、中位数、众数的适用场景；方差、标准差与离散系数；偏度与峰度',
    '经济基础知识|25 抽样调查|概率抽样 · 抽样误差|五种概率抽样方法；抽样误差与非抽样误差；样本量的影响因素',
    '经济基础知识|26 回归分析|最小二乘法 · 决定系数|一元线性回归模型设定；最小二乘估计的性质；决定系数与显著性检验',
    '经济基础知识|27 时间序列分析|四要素分解 · 速度分析|时间序列的四种构成要素；发展速度与增长速度；移动平均与指数平滑',
    '经济基础知识|28 会计概论|会计要素 · 信息质量要求|六大会计要素的定义；四项会计基本前提；八项会计信息质量要求',
    '经济基础知识|29 会计循环|借贷记账法 · 账务处理程序|会计确认与计量属性；借贷记账法的记账规则；账务处理程序的选择',
    '经济基础知识|30 会计报表|资产负债表 · 利润表 · 现金流量表|三大报表的编制基础；资产负债表的平衡关系；现金流量表的三类活动',
    '经济基础知识|31 财务报表分析|偿债能力 · 营运能力 · 盈利能力|流动比率与速动比率；存货周转率与应收账款周转率；净资产收益率的分解',
    '经济基础知识|32 政府会计|预算会计 · 财务会计|双功能、双基础、双报告；预算会计要素；政府决算报告的构成',
    '经济基础知识|33 法律对经济关系的调整|法律调整机制 · 经济法律体系|法律调整的对象与方法；经济法律体系的构成；法律责任的三种形式',
    '经济基础知识|34 物权法律制度|所有权 · 用益物权 · 担保物权|物权的种类与基本原则；用益物权的四种类型；抵押与质押的区别',
    '经济基础知识|35 合同法律制度|订立 · 履行 · 担保保全|要约与承诺的规则；合同履行的抗辩权；保证与定金',
    '经济基础知识|36 公司法律制度|公司设立 · 组织机构|有限责任公司与股份有限公司的区别；三会一层的职权划分；合并、分立与清算',
    '经济基础知识|37 其他法律制度|劳动合同 · 消费者权益 · 反不正当竞争|劳动合同的解除与经济补偿；消费者的九项权利；不正当竞争行为类型',
    '工商管理|01 企业战略与经营决策|战略层次 · SWOT · 决策方法|企业战略的三个层次；SWOT 组合策略；确定型与风险型决策方法',
    '工商管理|02 公司法人治理结构|股东会 · 董事会 · 监事会|股东会的职权范围；董事会与监事会的构成；经理层的激励与约束',
    '工商管理|03 市场营销与品牌管理|市场细分定位 · 营销组合4P · 品牌资产|市场细分与目标市场选择；营销组合 4P；品牌资产五要素',
    '工商管理|04 分销渠道管理|渠道类型 · 渠道冲突|渠道的层级与宽度；渠道冲突的类型与成因；渠道管理的主要决策',
    '工商管理|05 生产管理|生产计划指标 · 生产能力|生产计划指标体系；生产能力的核算方法；生产作业控制手段',
    '工商管理|06 物流管理|物流功能 · 供应链管理|物流的七项基本功能；仓储与运输决策；供应链管理的核心思想',
    '工商管理|07 技术创新管理|技术创新类型 · 技术转移|技术创新的三种类型；技术转移与技术贸易；知识产权管理要点',
    '工商管理|08 人力资源规划与薪酬管理|人力规划 · 绩效考核 · 薪酬设计|人力资源需求预测方法；绩效考核的常用方法；薪酬结构与宽带薪酬',
    '工商管理|09 企业投融资决策及并购重组|资金时间价值 · 资本成本|复利与年金计算；资本成本与资本结构；并购动因与反收购措施',
    '工商管理|10 电子商务|电商模式 · 电子支付|B2B、B2C、C2C、O2O 模式区别；电子支付与第三方支付；网络营销方式',
    '工商管理|11 国际商务运营|国际化动因 · 进入方式|企业国际化的动因；五种市场进入方式；国际市场营销组合'
  ];

  /* [几天前, 目标, 学习内容, 完成量, 时长, 备注] */
  var DEMO_LOGS = [
    [1, '《经济基础知识》精学', '06 市场失灵和政府的干预', 1, 60, '外部性四种干预手段'],
    [1, '《工商管理》精学', '05 生产管理', 1, 55, '生产计划指标体系待复习'],
    [1, '真题实战训练', '经济学基础 章节真题 55 题', 55, 60, '正确率回到 82%'],
    [2, '《经济基础知识》精学', '05 生产要素市场理论', 1, 62, '劳动供给曲线偏难'],
    [2, '《工商管理》精学', '04 分销渠道管理', 1, 55, '渠道冲突类型要背'],
    [2, '真题实战训练', '统计与会计 章节真题 60 题', 60, 65, '抽样与回归是弱项'],
    [3, '《经济基础知识》精学', '04 市场结构理论', 1, 58, '做了四类市场结构对比表'],
    [3, '《工商管理》精学', '03 市场营销与品牌管理', 1, 55, '品牌资产五要素'],
    [3, '真题实战训练', '经济学基础 章节真题 45 题', 45, 60, '正确率约 78%'],
    [4, '《经济基础知识》精学', '03 生产和成本理论', 1, 60, '短期成本曲线容易混'],
    [4, '《工商管理》精学', '02 公司法人治理结构', 1, 60, '三会一层职责边界'],
    [8, '《经济基础知识》精学', '02 市场需求、供给与均衡价格', 1, 65, '弹性计算要练熟'],
    [9, '《工商管理》精学', '01 企业战略与经营决策', 1, 60, 'SWOT 与决策树'],
    [11, '《经济基础知识》精学', '01 社会主义基本经济制度', 1, 60, '先搭制度框架'],
    [13, '真题实战训练', '统计与会计 章节真题 50 题', 50, 60, '抽样误差概念理清']
  ];

  function demoContents(){
    var out = [];
    for (var i = 0; i < DEMO_CHAPTERS.length; i++){
      var f = DEMO_CHAPTERS[i].split('|');
      var no = parseInt(String(f[1]).slice(0, 2), 10);
      var done = f[0] === '经济基础知识' ? no <= 28 : no <= 6;
      out.push({
        '章节名称': f[1], '科目': f[0], '核心考点': f[2], '学习内容': f[3],
        '状态': done ? '已学' : '未学'
      });
    }
    return out;
  }

  function demoGoals(){
    var due = shiftKey(todayKey(), 15);
    return [
      { '目标名称': '《经济基础知识》精学', '总量': 37, '已完成': 28, '单位': '章', '截止日': due, '状态': '进行中' },
      { '目标名称': '《工商管理》精学', '总量': 11, '已完成': 6, '单位': '章', '截止日': due, '状态': '进行中' },
      { '目标名称': '真题实战训练', '总量': 1200, '已完成': 380, '单位': '题', '截止日': due, '状态': '进行中' }
    ];
  }

  function demoLogs(){
    var t = todayKey(), out = [];
    for (var i = 0; i < DEMO_LOGS.length; i++){
      var r = DEMO_LOGS[i];
      out.push({
        '日期': shiftKey(t, -r[0]), '目标名称': r[1], '学习内容': r[2],
        '完成量': r[3], '时长分钟': r[4], '备注': r[5]
      });
    }
    return out;
  }

  function showDemoBanner(){
    var b = $('demoBanner');
    if (b) b.className = 'demo-banner is-on';
  }

  /* 仅当三张表一条数据都没有时启用演示数据，绝不覆盖真实记录 */
  function ensureDemo(){
    if (STATE.goals.length || STATE.logs.length || STATE.contents.length) return false;
    STATE.goals = demoGoals();
    STATE.logs = demoLogs();
    STATE.contents = demoContents();
    showDemoBanner();
    return true;
  }

  function loadAll(){
    setSync('loading', '同步中…');
    return Promise.all([loadGoals(), loadLogs(), loadContents()]).then(function(){
      var demo = ensureDemo();
      var off = !STATE.loaded.goals || !STATE.loaded.logs || !STATE.loaded.contents;
      setSync((off || demo) ? 'off' : 'ok', demo ? '演示数据' : (off ? '离线模式' : '已同步'));
      refreshAll();
      restoreDraftsOnce();
    });
  }

  /* ===================== 交互层：改数据 → refreshAll() ===================== */

  function switchTab(name){
    STATE.tab = name;
    var tabs = document.querySelectorAll('#tabs .tab');
    for (var i = 0; i < tabs.length; i++){
      tabs[i].className = 'tab' + (tabs[i].getAttribute('data-tab') === name ? ' is-active' : '');
    }
    var views = document.querySelectorAll('.view');
    for (var j = 0; j < views.length; j++){
      views[j].className = 'view' + (views[j].id === 'view-' + name ? ' is-active' : '');
    }
  }

  function prefillLog(goalName, lessonName){
    var goalSel = document.querySelector('#logForm select[name="logGoal"]');
    var cInput = document.querySelector('#logForm input[name="logContent"]');
    var dInput = document.querySelector('#logForm input[name="logDate"]');
    if (dInput && !dInput.value) dInput.value = todayKey();
    if (goalSel && goalName){
      for (var i = 0; i < goalSel.options.length; i++){
        if (goalSel.options[i].value === goalName){ goalSel.value = goalName; break; }
      }
    }
    if (cInput && lessonName) cInput.value = lessonName;
    if (goalSel === null) return;
    if (goalSel.value) goalSel.dispatchEvent(new Event('change'));
    if (cInput) cInput.dispatchEvent(new Event('input'));
  }

  function prefillRecommended(){
    var lesson = nextLesson();
    if (lesson){
      prefillLog(guessGoalName(String(lesson['科目'] || '')), String(lesson['章节名称'] || ''));
      toast('已填入推荐内容：' + lesson['章节名称']);
    } else {
      toast('内容库已全部标记为已学');
    }
  }

  function bumpGoal(goalName, delta){
    var target = null;
    for (var i = 0; i < STATE.goals.length; i++){
      if (String(STATE.goals[i]['目标名称'] || '') === goalName) target = STATE.goals[i];
    }
    if (!target || !db) return Promise.resolve();
    var rid = recId(target);
    if (!rid) return Promise.resolve();
    var properties = {};
    properties["已完成"] = { number: num(target['已完成'], 0) + delta };
    return db.updateRecord({ databaseId: 'goals', recordId: rid, properties: properties })
      .catch(function(err){ console.error('[database] 目标进度更新失败:', err); });
  }

  function submitGoal(e){
    e.preventDefault();
    var form = e.currentTarget;
    var name = form.querySelector('[name="goalName"]').value.trim();
    var total = parseFloat(form.querySelector('[name="goalTotal"]').value);
    var unit = form.querySelector('[name="goalUnit"]').value.trim();
    var done = parseFloat(form.querySelector('[name="goalDone"]').value);
    var due = form.querySelector('[name="goalDue"]').value;
    var statusId = form.querySelector('[name="goalStatus"]').value;

    if (!name){ toast('请填写目标名称'); return; }
    if (!isFinite(total) || total <= 0){ toast('总量必须大于 0'); return; }

    var properties = {};
    properties["目标名称"] = { text: name };
    properties["总量"] = { number: total };
    properties["已完成"] = { number: isFinite(done) ? done : 0 };
    properties["单位"] = { text: unit };
    if (due) properties["截止日"] = { date: due };
    if (statusId) properties["状态"] = { select: statusId };

    var btn = form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;

    db.addRecord({ databaseId: 'goals', properties: properties })
      .then(function(){
        form.reset();
        form.hidden = true;
        clearDraft('goal');
        toast('目标已保存');
        return loadAll();
      })
      .catch(function(err){
        console.error('[database] 目标保存失败:', err);
        toast('保存失败，请重试');
      })
      .then(function(){ if (btn) btn.disabled = false; });
  }

  function submitLog(e){
    e.preventDefault();
    var form = e.currentTarget;
    var dateV = form.querySelector('[name="logDate"]').value || todayKey();
    var goalV = form.querySelector('[name="logGoal"]').value;
    var contentV = form.querySelector('[name="logContent"]').value.trim();
    var amountV = parseFloat(form.querySelector('[name="logAmount"]').value);
    var minutesV = parseFloat(form.querySelector('[name="logMinutes"]').value);
    var noteV = form.querySelector('[name="logNote"]').value.trim();

    if (!goalV){ toast('请选择目标'); return; }
    if (!isFinite(amountV) || amountV < 0){ toast('请填写完成量'); return; }

    var properties = {};
    properties["日期"] = { date: dateV };
    properties["目标名称"] = { text: goalV };
    properties["学习内容"] = { text: contentV };
    properties["完成量"] = { number: amountV };
    properties["时长分钟"] = { number: isFinite(minutesV) ? minutesV : 0 };
    properties["备注"] = { text: noteV };

    var btn = form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;

    db.addRecord({ databaseId: 'logs', properties: properties })
      .then(function(){ return bumpGoal(goalV, amountV); })
      .then(function(){
        form.querySelector('[name="logContent"]').value = '';
        form.querySelector('[name="logNote"]').value = '';
        clearDraft('log');
        resetTimer();
        toast('打卡成功，目标进度 +' + fmtNum(amountV));
        return loadAll();
      })
      .catch(function(err){
        console.error('[database] 打卡失败:', err);
        toast('提交失败，请重试');
      })
      .then(function(){ if (btn) btn.disabled = false; });
  }

  function deleteLog(id){
    if (!id || !db) return;
    db.deleteRecord({ databaseId: 'logs', recordId: id })
      .then(function(){ toast('已删除该条打卡'); return loadAll(); })
      .catch(function(err){ console.error('[database] 删除失败:', err); toast('删除失败'); });
  }

  function deleteGoal(name){
    var target = null;
    for (var i = 0; i < STATE.goals.length; i++){
      if (String(STATE.goals[i]['目标名称'] || '') === name) target = STATE.goals[i];
    }
    if (!target || !db) return;
    if (!window.confirm('确定删除目标「' + name + '」吗？已打卡的记录会保留。')) return;
    var rid = recId(target);
    if (!rid) return;
    db.deleteRecord({ databaseId: 'goals', recordId: rid })
      .then(function(){ toast('目标已删除'); return loadAll(); })
      .catch(function(err){ console.error('[database] 删除目标失败:', err); toast('删除失败'); });
  }

  function toggleContent(id, nextStatus){
    if (!id || !db) return;
    var properties = {};
    properties["状态"] = { select: nextStatus };
    db.updateRecord({ databaseId: 'contents', recordId: id, properties: properties })
      .then(function(){ toast('已标记为' + nextStatus); return loadAll(); })
      .catch(function(err){ console.error('[database] 内容状态更新失败:', err); toast('更新失败'); });
  }

  function clearAllData(){
    var n = STATE.goals.length + STATE.logs.length + STATE.contents.length;
    if (!n){ toast('当前没有数据'); return; }
    if (!window.confirm('⚠️ 将删除全部 ' + n + ' 条数据（目标 / 打卡 / 内容进度），此操作不可撤销。确定继续？')) return;
    if (!window.confirm('二次确认：真的要清空吗？建议先点「导出备份」留一份。')) return;

    var jobs = [];
    var groups = [
      { kind: 'goal', rows: STATE.goals },
      { kind: 'log', rows: STATE.logs },
      { kind: 'content', rows: STATE.contents }
    ];
    for (var g = 0; g < groups.length; g++){
      var ids = [];
      for (var i = 0; i < groups[g].rows.length; i++){
        var rid = recId(groups[g].rows[i]);
        if (rid) ids.push(rid);
      }
      for (var s = 0; s < ids.length; s += 100){
        jobs.push(delChunk(groups[g].kind, ids.slice(s, s + 100)));
      }
    }
    Promise.all(jobs).then(function(){
      cacheDel('snap_goals'); cacheDel('snap_logs'); cacheDel('snap_contents');
      toast('已清空');
      return loadAll();
    }).catch(function(err){
      console.error('[database] 清空失败:', err);
      toast('部分数据删除失败，请重试');
      return loadAll();
    });
  }

  function delChunk(kind, ids){
    if (!db || !ids.length) return Promise.resolve();
    var p = null;
    if (kind === 'goal') p = db.deleteRecord({ databaseId: 'goals', recordId: ids[0] });
    else if (kind === 'log') p = db.deleteRecord({ databaseId: 'logs', recordId: ids[0] });
    else p = db.deleteRecord({ databaseId: 'contents', recordId: ids[0] });
    return p.then(function(){
      if (ids.length > 1) return delChunk(kind, ids.slice(1));
      return null;
    });
  }

  function exportBackup(){
    var payload = {
      app: 'study-goal-desk',
      exportedAt: new Date().toISOString(),
      目标: STATE.goals,
      打卡: STATE.logs,
      内容: STATE.contents
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '学习目标台备份-' + todayKey() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    toast('备份已导出');
  }

  function importBackup(file){
    var reader = new FileReader();
    reader.onload = function(){
      var data;
      try { data = JSON.parse(String(reader.result)); }
      catch (err) { toast('文件格式不对，无法解析'); return; }
      var jobs = [];
      jobs.push(importRows('goal', data['目标'] || [], goalToProperties));
      jobs.push(importRows('log', data['打卡'] || [], logToProperties));
      jobs.push(importRows('content', data['内容'] || [], contentToProperties));
      Promise.all(jobs).then(function(){
        toast('导入完成');
        return loadAll();
      }).catch(function(err){
        console.error('[database] 导入失败:', err);
        toast('导入失败');
      });
    };
    reader.readAsText(file, 'utf-8');
  }

  function importRows(kind, rows, mapper){
    if (!db || !rows.length) return Promise.resolve();
    var jobs = [];
    for (var i = 0; i < rows.length; i += 30){
      jobs.push(addChunk(kind, rows.slice(i, i + 30), mapper));
    }
    return Promise.all(jobs);
  }

  function addChunk(kind, rows, mapper){
    if (!rows.length) return Promise.resolve();
    var properties = mapper(rows[0]);
    var p = null;
    if (kind === 'goal') p = db.addRecord({ databaseId: 'goals', properties: properties });
    else if (kind === 'log') p = db.addRecord({ databaseId: 'logs', properties: properties });
    else p = db.addRecord({ databaseId: 'contents', properties: properties });
    return p.then(function(){
      return addChunk(kind, rows.slice(1), mapper);
    });
  }

  function goalToProperties(r){
    var properties = {};
    properties["目标名称"] = { text: String(r['目标名称'] || '') };
    properties["总量"] = { number: num(r['总量'], 0) };
    properties["已完成"] = { number: num(r['已完成'], 0) };
    properties["单位"] = { text: String(r['单位'] || '') };
    if (r['截止日']) properties["截止日"] = { date: keyOfAnyDate(r['截止日']) };
    if (r['状态']) properties["状态"] = { select: String(r['状态']) };
    return properties;
  }

  function logToProperties(r){
    var properties = {};
    properties["日期"] = { date: keyOfAnyDate(r['日期']) || todayKey() };
    properties["目标名称"] = { text: String(r['目标名称'] || '') };
    properties["学习内容"] = { text: String(r['学习内容'] || '') };
    properties["完成量"] = { number: num(r['完成量'], 0) };
    properties["时长分钟"] = { number: num(r['时长分钟'], 0) };
    properties["备注"] = { text: String(r['备注'] || '') };
    return properties;
  }

  function contentToProperties(r){
    var properties = {};
    properties["章节名称"] = { text: String(r['章节名称'] || '') };
    if (r['科目']) properties["科目"] = { select: String(r['科目']) };
    properties["核心考点"] = { text: String(r['核心考点'] || '') };
    if (r['状态']) properties["状态"] = { select: String(r['状态']) };
    return properties;
  }

  /* ---------------- 计时器 ---------------- */

  function paintTimer(){
    var el = $('timerDisplay');
    if (!el) return;
    var s = TIMER.seconds;
    el.textContent = p2(Math.floor(s / 3600)) + ':' + p2(Math.floor((s % 3600) / 60)) + ':' + p2(s % 60);
    var card = $('timerCard');
    if (card) card.className = 'card timer-card' + (TIMER.running ? ' is-running' : '');
    var btn = $('btnTimer');
    if (btn) btn.textContent = TIMER.running ? '暂停' : (s > 0 ? '继续' : '开始学习');
  }

  function toggleTimer(){
    if (TIMER.running){
      clearInterval(TIMER.id);
      TIMER.id = null;
      TIMER.running = false;
      paintTimer();
      return;
    }
    TIMER.running = true;
    TIMER.id = setInterval(function(){ TIMER.seconds++; paintTimer(); }, 1000);
    paintTimer();
  }

  function resetTimer(){
    if (TIMER.id){ clearInterval(TIMER.id); TIMER.id = null; }
    TIMER.running = false;
    TIMER.seconds = 0;
    paintTimer();
  }

  function stopTimerAndFill(){
    if (TIMER.seconds <= 0){ toast('计时还没开始'); return; }
    var mins = Math.max(1, Math.round(TIMER.seconds / 60));
    var input = document.querySelector('#logForm input[name="logMinutes"]');
    if (input){
      input.value = String(mins);
      input.dispatchEvent(new Event('input'));
    }
    resetTimer();
    toast('已填入 ' + mins + ' 分钟');
  }

  /* ---------------- 表单草稿缓存 ---------------- */

  var draftTimers = {};

  function bindDraft(form, key){
    if (!form) return;
    var fields = form.querySelectorAll('input, select');
    for (var i = 0; i < fields.length; i++){
      var el = fields[i];
      if (el.type === 'file' || el.type === 'password' || el.type === 'submit') continue;
      var ev = (el.tagName === 'SELECT' || el.type === 'date' || el.type === 'number') ? 'change' : 'input';
      el.addEventListener(ev, function(){
        if (draftTimers[key]) clearTimeout(draftTimers[key]);
        draftTimers[key] = setTimeout(function(){ saveDraft(form, key); }, 300);
      });
    }
  }

  var draftsReady = false;

  function restoreDraftsOnce(){
    if (draftsReady) return;
    draftsReady = true;
    restoreDraft($('logForm'), 'log');
    restoreDraft($('goalForm'), 'goal');
  }

  function saveDraft(form, key){
    var out = {};
    var fields = form.querySelectorAll('input, select');
    for (var i = 0; i < fields.length; i++){
      var el = fields[i];
      if (!el.name || el.type === 'file' || el.type === 'password' || el.type === 'date') continue;
      out[el.name] = el.value;
    }
    cacheSet('draft_' + key, JSON.stringify(out));
  }

  function restoreDraft(form, key){
    var raw = cacheGet('draft_' + key);
    if (!raw) return;
    var data;
    try { data = JSON.parse(raw); } catch (e) { return; }
    var fields = form.querySelectorAll('input, select');
    for (var i = 0; i < fields.length; i++){
      var el = fields[i];
      if (!el.name || !(el.name in data)) continue;
      if (el.type === 'date' && !data[el.name]) continue;
      el.value = data[el.name];
    }
  }

  function clearDraft(key){
    cacheDel('draft_' + key);
  }

  /* ---------------- 事件绑定 ---------------- */

  function handleAction(act, el){
    if (act === 'go-checkin'){ switchTab('checkin'); }
    else if (act === 'go-goals'){ switchTab('goals'); }
    else if (act === 'use-lesson'){
      switchTab('checkin');
      prefillLog(guessGoalName(el.getAttribute('data-subject')), el.getAttribute('data-lesson'));
      toast('已填入打卡表单');
    }
    else if (act === 'goal-checkin'){
      switchTab('checkin');
      prefillLog(el.getAttribute('data-goal'), '');
    }
    else if (act === 'goal-del'){ deleteGoal(el.getAttribute('data-goal')); }
    else if (act === 'log-del'){ deleteLog(el.getAttribute('data-id')); }
    else if (act === 'content-toggle'){ toggleContent(el.getAttribute('data-id'), el.getAttribute('data-next')); }
    else if (act === 'content-expand'){
      var cid = el.getAttribute('data-id');
      if (STATE.expanded[cid]) delete STATE.expanded[cid];
      else STATE.expanded[cid] = true;
      renderContents();
    }
    else if (act === 'content-add'){
      switchTab('checkin');
      prefillLog(guessGoalName(el.getAttribute('data-subject')), el.getAttribute('data-name'));
      toast('已加入今日打卡');
    }
    else if (act === 'filter-subject'){ STATE.subject = el.getAttribute('data-value'); renderContents(); }
    else if (act === 'filter-status'){ STATE.status = el.getAttribute('data-value'); renderContents(); }
  }

  function bindEvents(){
    var tabs = document.querySelectorAll('#tabs .tab');
    for (var i = 0; i < tabs.length; i++){
      tabs[i].addEventListener('click', function(){ switchTab(this.getAttribute('data-tab')); });
    }

    document.addEventListener('click', function(e){
      var el = e.target;
      while (el && el !== document.body && !(el.getAttribute && el.getAttribute('data-act'))){
        el = el.parentNode;
      }
      if (el && el !== document.body && el.getAttribute){
        var act = el.getAttribute('data-act');
        if (act) handleAction(act, el);
      }
    });

    var logForm = $('logForm');
    if (logForm) logForm.addEventListener('submit', submitLog);
    var goalForm = $('goalForm');
    if (goalForm) goalForm.addEventListener('submit', submitGoal);

    bindDraft(logForm, 'log');
    bindDraft(goalForm, 'goal');

    var tg = $('btnToggleGoalForm');
    if (tg) tg.addEventListener('click', function(){
      var f = $('goalForm');
      f.hidden = !f.hidden;
      if (!f.hidden){
        var due = f.querySelector('[name="goalDue"]');
        if (due && !due.value) due.value = shiftKey(todayKey(), 30);
        var d0 = f.querySelector('[name="goalDone"]');
        if (d0) d0.value = '0';
      }
    });
    var cg = $('btnCancelGoal');
    if (cg) cg.addEventListener('click', function(){ $('goalForm').hidden = true; });

    var bt = $('btnTimer');
    if (bt) bt.addEventListener('click', toggleTimer);
    var bs = $('btnTimerReset');
    if (bs) bs.addEventListener('click', stopTimerAndFill);
    var bp = $('btnPrefillToday');
    if (bp) bp.addEventListener('click', prefillRecommended);

    var bq = $('contentSearch');
    if (bq) bq.addEventListener('input', function(){
      STATE.search = this.value.trim();
      renderContents();
    });

    var bb = $('btnBackup');
    if (bb) bb.addEventListener('click', exportBackup);
    var br = $('btnRestore');
    if (br) br.addEventListener('click', function(){ $('fileRestore').click(); });
    var fr = $('fileRestore');
    if (fr) fr.addEventListener('change', function(){
      if (this.files && this.files[0]) importBackup(this.files[0]);
      this.value = '';
    });
    var bc = $('btnClear');
    if (bc) bc.addEventListener('click', clearAllData);
  }

  function subscribeUpdates(){
    if (!db || typeof db.onUpdated !== 'function') return;
    var timer = null;
    db.onUpdated(function(payload){
      var ids = (payload && payload.databaseIds) || [];
      if (ids.indexOf(GOAL_DB) === -1 && ids.indexOf(LOG_DB) === -1 && ids.indexOf(CONTENT_DB) === -1) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function(){ timer = null; loadAll(); }, 300);
    });
  }

  /* ===================== 初始化 ===================== */

  function init(){
    var d = document.querySelector('#logForm input[name=logDate]');
    if (d) d.value = todayKey();
    var st = $('todayDate');
    if (st) st.textContent = todayKey() + ' 周' + weekday(todayKey());

    var w = speedWindow();
    var hint = $('dataHint');
    if (hint) hint.textContent = '近 7 天窗口：' + w.from + ' ~ ' + w.to + '（不含今天）';

    if (!db){
      setSync('off', '离线模式');
      STATE.goals = cacheSnapshotGet('goals') || [];
      STATE.logs = cacheSnapshotGet('logs') || [];
      STATE.contents = cacheSnapshotGet('contents') || [];
      var demoOff = ensureDemo();
      setSync('off', demoOff ? '演示数据' : '离线模式');
      refreshAll();
      restoreDraftsOnce();
      toast(demoOff ? '未连接到云端数据，当前展示内置演示数据' : '未连接到在线数据，已切换为本地缓存模式');
      return;
    }

    loadSchemaOptions().then(function(){ renderSelects(); });
    loadAll();
    subscribeUpdates();
    paintTimer();
  }

  bindEvents();
  init();
}
