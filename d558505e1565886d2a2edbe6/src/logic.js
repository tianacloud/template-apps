/* 星星打卡 · 前后端共用的纯逻辑层（浏览器 + Node 均可加载） */
(function (g) {
  'use strict';

  var AVATARS = ['🐻', '🐰', '🐱', '🐶', '🦊', '🐼', '🦁', '🐯', '🦄', '🐧', '🐸', '🐨', '🐵', '🦖'];
  var WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];
  var SLOTS = {
    morning: { label: '早晨', emoji: '🌅', time: '06:00-11:00' },
    afternoon: { label: '下午', emoji: '🌤️', time: '11:00-17:00' },
    evening: { label: '晚上', emoji: '🌙', time: '17:00-21:00' }
  };
  var GOAL_TYPES = {
    streak: { label: '连续打卡', unit: '天' },
    points: { label: '累计积分', unit: '分' },
    checks: { label: '累计打卡', unit: '次' },
    weekRate: { label: '本周完成率', unit: '%' }
  };
  var BADGE_DEFS = [
    { id: 'b_first', emoji: '🌟', name: '启程之星', desc: '完成第一次打卡', test: function (s) { return s.totalChecks >= 1; } },
    { id: 'b_3', emoji: '🔥', name: '三日火热', desc: '连续打卡 3 天', test: function (s) { return s.streak >= 3; } },
    { id: 'b_7', emoji: '🏆', name: '一周坚持', desc: '连续打卡 7 天', test: function (s) { return s.streak >= 7; } },
    { id: 'b_30', emoji: '👑', name: '月度王者', desc: '连续打卡 30 天', test: function (s) { return s.streak >= 30; } },
    { id: 'b_100', emoji: '💎', name: '百分达人', desc: '累计获得 100 积分', test: function (s) { return s.totalPoints >= 100; } },
    { id: 'b_500', emoji: '🌈', name: '彩虹收藏家', desc: '累计获得 500 积分', test: function (s) { return s.totalPoints >= 500; } },
    { id: 'b_perfect', emoji: '☀️', name: '完美一天', desc: '单日任务全部完成', test: function (s) { return s.todayTotal > 0 && s.todayDone === s.todayTotal; } },
    { id: 'b_50', emoji: '🎖️', name: '勤勉勋章', desc: '累计打卡 50 次', test: function (s) { return s.totalChecks >= 50; } }
  ];

  function uid(p) { return (p || 'id') + '_' + Math.random().toString(36).slice(2, 9); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function keyOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayKey() { return keyOf(new Date()); }
  function shiftKey(k, delta) {
    var p = k.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setDate(d.getDate() + delta);
    return keyOf(d);
  }
  function weekdayOf(k) {
    var p = k.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]).getDay();
  }
  function prettyDate(k) {
    var p = k.split('-');
    return (+p[1]) + '月' + (+p[2]) + '日';
  }

  /* ---- 基于 state 的查询 ---- */
  function activeTasks(st) { return (st.tasks || []).filter(function (t) { return t.active !== false; }); }
  function tasksOfDay(st, k) {
    var wd = weekdayOf(k);
    return activeTasks(st).filter(function (t) {
      var days = t.days && t.days.length ? t.days : [0, 1, 2, 3, 4, 5, 6];
      return days.indexOf(wd) >= 0;
    });
  }
  function dayRecords(st, k) { return (st.records && st.records[k]) || {}; }
  function isDone(st, k, id) { return !!dayRecords(st, k)[id]; }

  /* ---- 统计 ---- */
  function points(st) {
    var p = 0;
    (st.pointsLog || []).forEach(function (x) { p += x.delta; });
    return p;
  }
  function totalPoints(st) {
    var p = 0;
    (st.pointsLog || []).forEach(function (x) { if (x.delta > 0) p += x.delta; });
    return p;
  }
  function totalChecks(st) {
    var n = 0;
    for (var k in (st.records || {})) n += Object.keys(st.records[k]).length;
    return n;
  }
  function streak(st) {
    var n = 0, k = todayKey();
    if (Object.keys(dayRecords(st, k)).length === 0) k = shiftKey(k, -1);
    while (Object.keys(dayRecords(st, k)).length > 0) { n++; k = shiftKey(k, -1); }
    return n;
  }
  function last7(st) {
    var arr = [];
    for (var i = 6; i >= 0; i--) {
      var k = shiftKey(todayKey(), -i);
      var ts = tasksOfDay(st, k), rec = dayRecords(st, k), done = 0;
      ts.forEach(function (t) { if (rec[t.id]) done++; });
      arr.push({
        key: k, label: WEEK_CN[weekdayOf(k)], total: ts.length, done: done,
        rate: ts.length ? Math.round(done / ts.length * 100) : 0
      });
    }
    return arr;
  }
  function weekRate(st) {
    var wd = weekdayOf(todayKey());
    var monday = shiftKey(todayKey(), (wd === 0 ? -6 : 1 - wd));
    var done = 0, total = 0, today = todayKey();
    for (var i = 0; i < 7; i++) {
      var k = shiftKey(monday, i);
      if (k > today) break;
      var ts = tasksOfDay(st, k), rec = dayRecords(st, k);
      ts.forEach(function (t) { total++; if (rec[t.id]) done++; });
    }
    return total ? Math.round(done / total * 100) : 0;
  }
  function monthRate(st) {
    var now = new Date(), y = now.getFullYear(), m = now.getMonth();
    var done = 0, total = 0, seen = {};
    for (var k in (st.records || {})) {
      var p = k.split('-');
      if (+p[0] === y && (+p[1] - 1) === m) {
        seen[k] = 1;
        var ts = tasksOfDay(st, k), rec = st.records[k];
        ts.forEach(function (t) { total++; if (rec[t.id]) done++; });
      }
    }
    var d = new Date(y, m, 1), today = todayKey();
    while (d.getMonth() === m) {
      var kk = keyOf(d);
      if (kk <= today && !seen[kk]) {
        var ts2 = tasksOfDay(st, kk), rec2 = dayRecords(st, kk);
        ts2.forEach(function (t) { total++; if (rec2[t.id]) done++; });
      }
      d.setDate(d.getDate() + 1);
    }
    return total ? Math.round(done / total * 100) : 0;
  }
  function computeStats(st) {
    var tk = todayKey(), ts = tasksOfDay(st, tk), rec = dayRecords(st, tk), done = 0;
    ts.forEach(function (t) { if (rec[t.id]) done++; });
    return {
      todayKey: tk, todayTotal: ts.length, todayDone: done,
      todayRate: ts.length ? Math.round(done / ts.length * 100) : 0,
      streak: streak(st), points: points(st), totalPoints: totalPoints(st),
      totalChecks: totalChecks(st), week: last7(st),
      weekRate: weekRate(st), monthRate: monthRate(st)
    };
  }

  function goalProgress(st, g, s) {
    s = s || computeStats(st);
    var cur = 0;
    if (g.type === 'streak') cur = s.streak;
    else if (g.type === 'points') cur = s.totalPoints;
    else if (g.type === 'checks') cur = s.totalChecks;
    else if (g.type === 'weekRate') cur = s.weekRate;
    var pct = g.target > 0 ? Math.min(100, Math.round(cur / g.target * 100)) : 0;
    return { cur: cur, target: g.target, pct: pct, done: cur >= g.target };
  }

  /* 会修改 st.badges / st.goals，返回本次新增项 */
  function checkBadges(st) {
    var s = computeStats(st), got = [];
    st.badges = st.badges || [];
    BADGE_DEFS.forEach(function (b) {
      var has = st.badges.some(function (x) { return x.id === b.id; });
      if (!has && b.test(s)) { st.badges.push({ id: b.id, gotAt: Date.now() }); got.push(b); }
    });
    return got;
  }
  function checkGoals(st) {
    var s = computeStats(st), done = [];
    st.goals = st.goals || [];
    st.goals.forEach(function (g) {
      if (!g.achievedAt && goalProgress(st, g, s).done) { g.achievedAt = Date.now(); done.push(g); }
    });
    return done;
  }
  function badgeList(st) {
    st.badges = st.badges || [];
    return BADGE_DEFS.map(function (b) {
      return {
        id: b.id, emoji: b.emoji, name: b.name, desc: b.desc,
        got: st.badges.some(function (x) { return x.id === b.id; })
      };
    });
  }

  /* ---------------- 密码 / 访问锁规则（前后端共用） ---------------- */
  var PWD_MIN = 8;           // 登录密码最短 8 位
  var PIN_LEN = [4, 5, 6];   // 访问锁只支持 4~6 位数字

  /* 密码强度：0 很弱 / 1 弱 / 2 中 / 3 强；ok 表示是否达到注册/修改要求 */
  function pwdStrength(pwd) {
    pwd = String(pwd || '');
    var kinds = 0;
    if (/[a-z]/.test(pwd)) kinds++;
    if (/[A-Z]/.test(pwd)) kinds++;
    if (/[0-9]/.test(pwd)) kinds++;
    if (/[^A-Za-z0-9]/.test(pwd)) kinds++;
    var long = pwd.length >= 12 ? 1 : 0;
    var score = 0;
    if (pwd.length >= PWD_MIN && kinds >= 2) score = 2;
    if (pwd.length >= PWD_MIN && kinds >= 3) score = 3;
    if (pwd.length < PWD_MIN || kinds < 2) score = pwd.length >= PWD_MIN ? 1 : 0;
    if (score === 3 && long && kinds >= 3) score = 3;
    var tips = [];
    if (pwd.length < PWD_MIN) tips.push('至少 ' + PWD_MIN + ' 位');
    if (kinds < 2) tips.push('字母 + 数字混着用');
    if (kinds < 3) tips.push('加个大写或符号更安全');
    return {
      score: score,
      label: ['很弱', '弱', '中等', '很强'][score],
      percent: [20, 40, 70, 100][score],
      ok: pwd.length >= PWD_MIN && kinds >= 2,
      tips: tips
    };
  }
  function pinValid(pin) {
    pin = String(pin || '');
    return PIN_LEN.indexOf(pin.length) >= 0 && /^[0-9]+$/.test(pin);
  }

  var api = {
    AVATARS: AVATARS, WEEK_CN: WEEK_CN, SLOTS: SLOTS, GOAL_TYPES: GOAL_TYPES, BADGE_DEFS: BADGE_DEFS,
    PWD_MIN: PWD_MIN, PIN_LEN: PIN_LEN, pwdStrength: pwdStrength, pinValid: pinValid,
    uid: uid, pad: pad, keyOf: keyOf, todayKey: todayKey, shiftKey: shiftKey, weekdayOf: weekdayOf, prettyDate: prettyDate,
    activeTasks: activeTasks, tasksOfDay: tasksOfDay, dayRecords: dayRecords, isDone: isDone,
    points: points, totalPoints: totalPoints, totalChecks: totalChecks, streak: streak,
    last7: last7, weekRate: weekRate, monthRate: monthRate, computeStats: computeStats,
    goalProgress: goalProgress, checkBadges: checkBadges, checkGoals: checkGoals, badgeList: badgeList
  };

  g.KidsLogic = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
