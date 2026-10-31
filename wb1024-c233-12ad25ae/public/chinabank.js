/* ===== 宝贝升级乐园 · 语文题库 chinabank.js =====
   人教版小学语文 1-6 年级 古诗词 / 文言文 / 日积月累 闯关题库（12 册）
   - 目录 cn-catalog.js 首屏加载；各年级题库 bank/cn-gN.js 按需懒加载
   - 用动态 <script> + window.__CN__ 回调注册，避开 fetch/CORS，file:// 也能跑
   - 诗词/日积月累在注册时展开为 MCQ（接句 / 诗名 / 作者 / 补全），词语表/写字表作听写复习
   - 掌握度与错题本存 progress.cn
*/
(function () {
  'use strict';

  var CACHE = {};        // { 1: {g:1, vols:[...]} }
  var LOADING = {};      // { 1: [cb, cb] }
  var INDEX = {};        // { '1a-p1': {kp, vol, grade} }

  /* 题库文件通过这个全局回调注册自己 */
  window.__CN__ = function (g, payload) {
    // 第一遍：先建立索引并写入缓存（展开题目时要用同年级其它篇目做干扰项）
    (payload.vols || []).forEach(function (v) {
      (v.kps || []).forEach(function (kp) {
        kp._vol = v.vol; kp._term = v.term; kp._grade = g;
        INDEX[kp.id] = kp;
      });
    });
    CACHE[g] = payload;
    // 第二遍：把诗词 / 日积月累展开为选择题
    (payload.vols || []).forEach(function (v) {
      (v.kps || []).forEach(function (kp) {
        if (kp.type === 'poem') expandPoem(kp);
        else if (kp.type === 'accum') expandAccum(kp);
      });
    });
    var qs = LOADING[g] || []; LOADING[g] = null;
    qs.forEach(function (cb) { try { cb(payload); } catch (e) { console.error(e); } });
  };

  /* ---------- 出题：把诗词正文切成「句」 ---------- */
  function sentencesOf(kp) {
    var raw = (kp.lines || []).join(' ');
    return raw.split(/[。！？，]/).map(function (s) { return s.trim(); })
              .filter(function (s) { return s.length >= 2; });
  }

  /* 兜底干扰项：低年级篇目少时补足到 4 选 1 */
  var FB_AUTHORS = ['李白', '杜甫', '白居易', '王维', '孟浩然', '苏轼', '王安石', '杨万里', '陆游',
    '柳宗元', '杜牧', '贺知章', '王之涣', '李商隐', '辛弃疾', '范成大', '曾几', '袁枚'];
  var FB_TITLES = ['静夜思', '春晓', '咏鹅', '悯农', '登鹳雀楼', '望庐山瀑布', '山行', '江雪',
    '池上', '小池', '村居', '所见', '赠汪伦', '早发白帝城', '题西林壁', '游子吟', '望天门山', '饮湖上初晴后雨'];

  function makeDistract(pool, correct, n, fallback) {
    var seen = {}; seen[correct] = 1;
    var cand = [];
    (pool || []).forEach(function (x) { if (x && !seen[x]) { seen[x] = 1; cand.push(x); } });
    var out = [];
    while (out.length < n && cand.length) {
      out.push(cand.splice(Math.floor(Math.random() * cand.length), 1)[0]);
    }
    if (out.length < n && fallback) {
      var fb = fallback.filter(function (x) { return !seen[x]; });
      while (out.length < n && fb.length) {
        var c = fb.splice(Math.floor(Math.random() * fb.length), 1)[0];
        seen[c] = 1; out.push(c);
      }
    }
    return out;
  }

  function expandPoem(kp) {
    var ss = sentencesOf(kp);
    var qs = [];
    // 接句
    for (var i = 0; i < ss.length - 1; i++) {
      var nxt = ss[i + 1];
      qs.push({
        id: kp.id + '-j' + (i + 1),
        q: '《' + kp.name + '》中，上句是「' + ss[i] + '」，下一句是？',
        o: [nxt].concat(makeDistract(ss, nxt, 3)),
        a: 0,
        e: '《' + kp.name + '》' + (kp.dynasty ? '（' + kp.dynasty + '·' + kp.author + '）' : '') + '：' + ss[i] + nxt + '。'
      });
    }
    // 诗名（首句 -> 诗名）
    if (ss.length) {
      qs.push({
        id: kp.id + '-t',
        q: '「' + ss[0] + (ss.length > 1 ? '…' : '') + '」出自哪一首诗？',
        o: [kp.name].concat(makeDistract(poolTitles(kp), kp.name, 3)),
        a: 0,
        e: '出自《' + kp.name + '》' + (kp.dynasty ? '（' + kp.dynasty + '·' + kp.author + '）' : '') + '。'
      });
    }
    // 作者
    qs.push({
      id: kp.id + '-a',
      q: '《' + kp.name + '》的作者是谁？',
      o: [kp.author].concat(makeDistract(poolAuthors(kp), kp.author, 3)),
      a: 0,
      e: '《' + kp.name + '》' + (kp.dynasty ? '是' + kp.dynasty + '代' : '') + kp.author + '的作品。'
    });
    kp.qs = qs;
  }

  function expandAccum(kp) {
    var items = kp.items || [];
    var qs = [];
    var idx = 0;
    items.forEach(function (it) {
      var txt = it.text;
      var c = txt.indexOf('，');
      if (c > 0 && c < txt.length - 1) {
        var before = txt.slice(0, c);
        var after = txt.slice(c + 1);
        if (before.length >= 2 && after.length >= 2) {
          idx++;
          qs.push({
            id: kp.id + '-c' + idx,
            q: '请补全：「' + before + '，」下一句是？',
            o: [after].concat(makeDistract(items.map(function (x) { return x.text; }), after, 3)),
            a: 0,
            e: '完整内容：' + txt + '。'
          });
        }
      }
    });
    kp.qs = qs;
  }

  /* 同年级其它诗词的标题 / 作者池（作干扰项） */
  function gradePoems(g) {
    var d = CACHE[g]; if (!d) return [];
    var res = [];
    d.vols.forEach(function (v) { (v.kps || []).forEach(function (k) { if (k.type === 'poem') res.push(k); }); });
    return res;
  }
  function poolTitles(kp) {
    var seen = {}, out = [];
    gradePoems(kp._grade).forEach(function (k) { if (!seen[k.name]) { seen[k.name] = 1; out.push(k.name); } });
    return out;
  }
  function poolAuthors(kp) {
    var seen = {}, out = [];
    gradePoems(kp._grade).forEach(function (k) { if (!seen[k.author]) { seen[k.author] = 1; out.push(k.author); } });
    return out;
  }

  /* ---------- 懒加载 ---------- */
  function load(g, cb) {
    g = parseInt(g, 10);
    if (!(g >= 1 && g <= 6)) { cb(null); return; }
    if (CACHE[g]) { cb(CACHE[g]); return; }
    if (LOADING[g]) { LOADING[g].push(cb); return; }
    LOADING[g] = [cb];
    var s = document.createElement('script');
    s.src = 'bank/cn-g' + g + '.js';
    s.async = true;
    s.onerror = function () {
      var qs = LOADING[g] || []; LOADING[g] = null;
      console.warn('语文题库加载失败：年级 ' + g);
      qs.forEach(function (fn) { fn(null); });
    };
    document.head.appendChild(s);
  }
  function isLoaded(g) { return !!CACHE[g]; }
  function grade(g) { return CACHE[g] || null; }

  /* ---------- 目录 ---------- */
  function catalog(g) {
    var c = window.CN_BANK_CATALOG;
    if (!c || !c.grades) return [];
    return c.grades[String(g)] || [];
  }
  function meta() {
    var c = window.CN_BANK_CATALOG;
    return (c && c.meta) || { qEstimated: 0, kpTotal: 0 };
  }
  function catalogKP(g, kpid) {
    var out = null;
    catalog(g).forEach(function (v) {
      (v.kps || []).forEach(function (k) { if (k.id === kpid) out = { vol: v.vol, term: v.term, name: k.name, n: k.n }; });
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

  /* ---------- 题目转换：题库 -> 引擎格式（选项打乱防背位置） ---------- */
  function toQuiz(raw) {
    var right = raw.o[raw.a];
    var opts = APP.shuffle(raw.o);
    return {
      q: raw.q, opts: opts, ans: opts.indexOf(right),
      tip: raw.e || '', qid: raw.id, kpid: raw.id.replace(/-(j|t|a|c)\d*$/, '')
    };
  }
  function drawFrom(kp, n) {
    var all = (kp && kp.qs) || [];
    if (!all.length) return [];
    return APP.shuffle(all).slice(0, Math.min(n, all.length)).map(toQuiz);
  }
  function drawGrade(g, n) {
    var d = CACHE[g]; if (!d) return [];
    var pool = [];
    d.vols.forEach(function (v) { (v.kps || []).forEach(function (k) { if (k.qs) pool = pool.concat(k.qs); }); });
    return APP.shuffle(pool).slice(0, n).map(toQuiz);
  }

  /* ---------- 掌握度（存 progress.cn.kp） ---------- */
  function kpStat(kpid) {
    var m = APP.state.progress.cn;
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
  function mastered(kpid) {
    var m = APP.state.progress.cn;
    var s = (m.kp || {})[kpid];
    return !!(s && s.t >= 8 && s.c / s.t >= 0.8);
  }

  /* ---------- 错题本 ---------- */
  function wrongList() {
    var m = APP.state.progress.cn;
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
    if (w.length > 300) w.splice(0, w.length - 300);
    APP.save();
  }
  function removeWrong(qid) {
    var w = wrongList();
    for (var i = 0; i < w.length; i++) { if (w[i].id === qid) { w.splice(i, 1); APP.save(); return true; } }
    return false;
  }
  function wrongQuestion(item, cb) {
    load(item.g, function () {
      var kp = kpById(item.kp);
      if (!kp) { cb(null); return; }
      var raw = null;
      (kp.qs || []).forEach(function (q) { if (q.id === item.id) raw = q; });
      cb(raw ? toQuiz(raw) : null, kp);
    });
  }
  function preloadWrongGrades(cb) {
    var gs = {}; wrongList().forEach(function (w) { if (w.g) gs[w.g] = 1; });
    var keys = Object.keys(gs);
    if (!keys.length) { cb(); return; }
    var left = keys.length;
    keys.forEach(function (g) { load(parseInt(g, 10), function () { if (--left === 0) cb(); }); });
  }

  window.CNBANK = {
    load: load, isLoaded: isLoaded, grade: grade,
    catalog: catalog, catalogKP: catalogKP, meta: meta,
    findKP: findKP, kpById: kpById,
    toQuiz: toQuiz, drawFrom: drawFrom, drawGrade: drawGrade,
    kpStat: kpStat, recordKP: recordKP, mastered: mastered,
    wrongList: wrongList, addWrong: addWrong, removeWrong: removeWrong,
    wrongQuestion: wrongQuestion, preloadWrongGrades: preloadWrongGrades
  };
})();
