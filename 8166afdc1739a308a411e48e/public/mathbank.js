/* ===== 宝贝升级乐园 · 数学真题题库 mathbank.js =====
   人教版小学数学 1-6 年级知识点闯关题库（12 册 / 95 知识点 / 1900 题）
   - 目录 catalog.js 首屏加载（5KB），各年级题库 bank/math-gN.js 按需懒加载
   - 用动态 <script> + window.__MB__ 回调注册，避开 fetch/CORS，file:// 也能跑
   - 同时提供错题本读写
*/
(function () {
  'use strict';

  var CACHE = {};        // { 1: {g:1, vols:[...]} }
  var LOADING = {};      // { 1: [cb, cb] }
  var INDEX = {};        // { '1a-01': {kp, vol, grade} } 扁平索引，便于错题本回查

  /* 题库文件通过这个全局回调注册自己 */
  window.__MB__ = function (g, payload) {
    CACHE[g] = payload;
    (payload.vols || []).forEach(function (v) {
      (v.kps || []).forEach(function (kp) {
        kp._vol = v.vol; kp._term = v.term; kp._grade = g;
        INDEX[kp.id] = kp;
      });
    });
    var qs = LOADING[g] || []; LOADING[g] = null;
    qs.forEach(function (cb) { try { cb(payload); } catch (e) { console.error(e); } });
  };

  /* ---------- 懒加载 ---------- */
  function load(g, cb) {
    g = parseInt(g, 10);
    if (!(g >= 1 && g <= 6)) { cb(null); return; }
    if (CACHE[g]) { cb(CACHE[g]); return; }
    if (LOADING[g]) { LOADING[g].push(cb); return; }
    LOADING[g] = [cb];
    window.loadBank('math-g' + g).then(function (data) { window.__MB__(g, data); }).catch(function () {
      var qs = LOADING[g] || []; LOADING[g] = null;
      APP.toast('题库加载失败，请检查网络后重试', 'warn');
      qs.forEach(function (fn) { fn(null); });
    });
  }
  function isLoaded(g) { return !!CACHE[g]; }
  function grade(g) { return CACHE[g] || null; }

  /* ---------- 目录（首屏可用，不需要加载完整题库） ---------- */
  function catalog(g) {
    var c = window.MATH_BANK_CATALOG;
    if (!c || !c.grades) return [];
    return c.grades[String(g)] || [];
  }
  function meta() {
    var c = window.MATH_BANK_CATALOG;
    return (c && c.meta) || { questions: 0, knowledgePoints: 0 };
  }
  /* 目录里查某知识点属于哪一册、共几题 */
  function catalogKP(g, kpid) {
    var out = null;
    catalog(g).forEach(function (v) {
      v.kps.forEach(function (k) { if (k.id === kpid) out = { vol: v.vol, term: v.term, name: k.name, n: k.n }; });
    });
    return out;
  }

  function kpById(id) { return INDEX[id] || null; }
  function findKP(g, kpid) {
    var d = CACHE[g]; if (!d) return null;
    for (var i = 0; i < d.vols.length; i++) {
      var ks = d.vols[i].kps;
      for (var j = 0; j < ks.length; j++) { if (ks[j].id === kpid) return ks[j]; }
    }
    return null;
  }

  /* ---------- 题目格式转换：题库格式 -> makeQuiz 格式 ---------- */
  /* 题库：{id,q,o:[...],a:idx,e} → 引擎：{q,opts,ans,tip}，选项打乱防背位置 */
  function toQuiz(raw) {
    var right = raw.o[raw.a];
    var opts = APP.shuffle(raw.o);
    return {
      q: raw.q, opts: opts, ans: opts.indexOf(right),
      tip: raw.e || '', qid: raw.id, kpid: raw.id.replace(/-\d+$/, '')
    };
  }

  /* 从一个知识点里抽 n 道不重复的题 */
  function drawFrom(kp, n) {
    var all = (kp && kp.qs) || [];
    return APP.shuffle(all).slice(0, Math.min(n, all.length)).map(toQuiz);
  }
  /* 从整个年级随机抽 n 道（用于闯关冒险 / 混合练习） */
  function drawGrade(g, n) {
    var d = CACHE[g]; if (!d) return [];
    var pool = [];
    d.vols.forEach(function (v) { v.kps.forEach(function (k) { pool = pool.concat(k.qs); }); });
    return APP.shuffle(pool).slice(0, n).map(toQuiz);
  }

  /* ---------- 知识点掌握度（存 progress.math.kp） ---------- */
  function kpStat(kpid) {
    var m = APP.state.progress.math;
    if (!m.kp) m.kp = {};
    if (!m.kp[kpid]) m.kp[kpid] = { c: 0, t: 0 };
    return m.kp[kpid];
  }
  function recordKP(kpid, ok) {
    if (!kpid) return;
    var s = kpStat(kpid);
    s.t++; if (ok) s.c++;
    APP.save();
  }
  /* 掌握判定：做过 ≥8 题且正确率 ≥80% */
  function mastered(kpid) {
    var m = APP.state.progress.math;
    var s = (m.kp || {})[kpid];
    return !!(s && s.t >= 8 && s.c / s.t >= 0.8);
  }

  /* ---------- 错题本 ---------- */
  function wrongList() {
    var m = APP.state.progress.math;
    if (!Array.isArray(m.wrong)) m.wrong = [];
    return m.wrong;
  }
  function addWrong(raw, extra) {
    if (!raw || !raw.qid) return;
    var w = wrongList();
    for (var i = 0; i < w.length; i++) {
      if (w[i].id === raw.qid) { w[i].n = (w[i].n || 1) + 1; w[i].ts = Date.now(); APP.save(); return; }
    }
    w.push({
      id: raw.qid, kp: raw.kpid || '', g: (extra && extra.g) || 0,
      kpName: (extra && extra.kpName) || '', vol: (extra && extra.vol) || '',
      q: raw.q, n: 1, ts: Date.now()
    });
    if (w.length > 300) w.splice(0, w.length - 300);   // 上限保护，限制错题数量
    APP.save();
  }
  function removeWrong(qid) {
    var w = wrongList();
    for (var i = 0; i < w.length; i++) { if (w[i].id === qid) { w.splice(i, 1); APP.save(); return true; } }
    return false;
  }
  /* 拿到错题的完整题面（需要对应年级题库已加载） */
  function wrongQuestion(item, cb) {
    load(item.g, function () {
      var kp = kpById(item.kp);
      if (!kp) { cb(null); return; }
      var raw = null;
      kp.qs.forEach(function (q) { if (q.id === item.id) raw = q; });
      cb(raw ? toQuiz(raw) : null, kp);
    });
  }
  /* 预加载错题本涉及的所有年级，然后回调 */
  function preloadWrongGrades(cb) {
    var gs = {}; wrongList().forEach(function (w) { if (w.g) gs[w.g] = 1; });
    var keys = Object.keys(gs);
    if (!keys.length) { cb(); return; }
    var left = keys.length;
    keys.forEach(function (g) { load(parseInt(g, 10), function () { if (--left === 0) cb(); }); });
  }

  window.MBANK = {
    load: load, isLoaded: isLoaded, grade: grade,
    catalog: catalog, catalogKP: catalogKP, meta: meta,
    findKP: findKP, kpById: kpById,
    toQuiz: toQuiz, drawFrom: drawFrom, drawGrade: drawGrade,
    kpStat: kpStat, recordKP: recordKP, mastered: mastered,
    wrongList: wrongList, addWrong: addWrong, removeWrong: removeWrong,
    wrongQuestion: wrongQuestion, preloadWrongGrades: preloadWrongGrades
  };
})();
