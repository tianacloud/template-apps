/* ===== 宝贝升级乐园 · 英语题库 engbank.js =====
   人教版小学英语 3-6 年级 单词 / 常用表达法 / 谚语 / 不规则动词 / 语音 闯关题库
   - 目录 en-catalog.js 首屏加载；各年级题库 bank/en-gN.js 与通用 bank/en-common.js 按需懒加载
   - 用动态 <script> + window.__EN__ / window.__EN_COMMON__ 回调注册，避开 fetch/CORS，离线也能跑
   - 注册时把通用（不规则动词/语音）并入各年级，并展开为选择题（中英互译 / 配对 / 词形变化 / 语音规律）
   - 掌握度与错题本存 progress.english
*/
(function () {
  'use strict';

  var S = function () { return APP.state; };   // 与 modules.js / pet.js 保持一致

  var CACHE = {};        // { 3: mergedBank, ... }  mergedBank = { g, cats:{vocab,phrases,proverbs,irregular,phonetics}, _base }
  var COMMON = null;     // { irregular:[], phonetics:[] }
  var LOADING = {};      // { 3:[cb], _common:[cb] }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  /* ---------- 分片注册回调 ---------- */
  function mergeCommon(payload) {
    var merged = JSON.parse(JSON.stringify(payload));
    merged.cats = merged.cats || {};
    if (COMMON) {
      if (!merged.cats.irregular) merged.cats.irregular = { name: '不规则动词', items: COMMON.irregular };
      if (!merged.cats.phonetics) merged.cats.phonetics = { name: '语音汇总', items: COMMON.phonetics };
    }
    merged._base = payload;
    return merged;
  }

  window.__EN__ = function (g, payload) {
    var merged = mergeCommon(payload);
    CACHE[g] = merged;
    var cbs = LOADING[g] || []; LOADING[g] = null;
    cbs.forEach(function (cb) { try { cb(merged); } catch (e) { console.error(e); } });
  };

  window.__EN_COMMON__ = function (payload) {
    COMMON = payload;
    for (var g in CACHE) { if (CACHE[g]._base) CACHE[g] = mergeCommon(CACHE[g]._base); }
    var cbs = LOADING._common || []; LOADING._common = null;
    cbs.forEach(function (cb) { try { cb(); } catch (e) { console.error(e); } });
  };

  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src; s.async = false;
    s.onload = function () { cb(); };
    s.onerror = function () { console.error('[engbank] load fail:', src); cb(); };
    document.head.appendChild(s);
  }

  /* 确保某年级分片 + 通用分片都已注册 */
  function ensure(g, cb) {
    var pending = 0;
    var done = function () { if (--pending <= 0) cb(); };
    if (!CACHE[g]) { pending++; loadScript('bank/en-g' + g + '.js', done); }
    if (!COMMON) { pending++; loadScript('bank/en-common.js', done); }
    if (pending === 0) cb();
  }

  /* ---------- 题库访问 ---------- */
  function grade(g) { return CACHE[g] || null; }
  function catalog() { return window.EN_BANK_CATALOG || null; }
  function catList(g) {
    var b = grade(g); if (!b) return [];
    return Object.keys(b.cats).filter(function (k) { return (b.cats[k].items || []).length > 0; });
  }

  /* ---------- 干扰项兜底 ---------- */
  var FALLBACK_ZH = ['苹果', '学校', '老师', '朋友', '红色', '蓝色', '跑步', '阅读', '开心', '书本', '水', '火', '太阳', '月亮', '小猫', '小狗'];
  var FALLBACK_EN = ['apple', 'school', 'teacher', 'friend', 'red', 'blue', 'run', 'read', 'happy', 'book', 'water', 'sun', 'cat', 'dog', 'tree', 'fish'];

  function distractors(pool, correct, n, fallback) {
    var seen = {}; seen[correct] = 1;
    var out = [];
    shuffle(pool).forEach(function (x) { if (!seen[x] && out.length < n) { seen[x] = 1; out.push(x); } });
    var fb = shuffle(fallback || []);
    for (var i = 0; out.length < n && i < fb.length; i++) {
      if (!seen[fb[i]]) { seen[fb[i]] = 1; out.push(fb[i]); }
    }
    return out;
  }

  /* ---------- 出题 ---------- */
  function buildVocab(bank, mode) {
    var items = bank.cats.vocab.items;
    if (!items.length) return null;
    var allZh = items.map(function (x) { return x.m; });
    var allEn = items.map(function (x) { return x.w; });
    var it = pick(items);
    if (mode === 'zh2en') {
      var opts = shuffle([it.w].concat(distractors(allEn, it.w, 3, FALLBACK_EN)));
      return { q: '「' + it.m + '」用英语怎么说？', opts: opts, ans: opts.indexOf(it.w),
               tip: (it.p || '') + ' ' + it.w, speak: it.w, speakLang: 'en-US' };
    }
    var opts2 = shuffle([it.m].concat(distractors(allZh, it.m, 3, FALLBACK_ZH)));
    return { q: '「' + it.w + '」是什么意思？', opts: opts2, ans: opts2.indexOf(it.m),
             tip: (it.p || '') + ' ' + it.m, speak: it.w, speakLang: 'en-US', autoSpeak: true };
  }

  function buildExpr(bank, cat, mode) {
    var items = bank.cats[cat].items;
    if (!items.length) return null;
    var allZh = items.map(function (x) { return x.zh; });
    var allEn = items.map(function (x) { return x.en; });
    var it = pick(items);
    if (mode === 'zh2en') {
      var opts = shuffle([it.en].concat(distractors(allEn, it.en, 3, FALLBACK_EN)));
      return { q: it.zh, opts: opts, ans: opts.indexOf(it.en), tip: it.en, speak: it.en, speakLang: 'en-US' };
    }
    var opts2 = shuffle([it.zh].concat(distractors(allZh, it.zh, 3, FALLBACK_ZH)));
    return { q: it.en, opts: opts2, ans: opts2.indexOf(it.zh), tip: it.en, speak: it.en, speakLang: 'en-US', autoSpeak: true };
  }

  function buildIrregular(bank, mode) {
    var items = bank.cats.irregular.items;
    if (!items.length) return null;
    var allPast = items.map(function (x) { return x.past || x.base; });
    var allBase = items.map(function (x) { return x.base; });
    var it = pick(items);
    if (mode === 'past2base') {
      var opts = shuffle([it.base].concat(distractors(allBase, it.base, 3, FALLBACK_EN)));
      return { q: '「' + (it.past || it.base) + '」的原形（现在式）是？', opts: opts, ans: opts.indexOf(it.base),
               tip: '原形 ' + it.base + ' → 过去式 ' + (it.past || it.base) };
    }
    if (mode === 'base2pp') {
      var pp = it.pp || it.past || it.base;
      var opts2 = shuffle([pp].concat(distractors(allPast, pp, 3, FALLBACK_EN)));
      return { q: '「' + it.base + '」的过去分词是？', opts: opts2, ans: opts2.indexOf(pp),
               tip: '原形 ' + it.base + ' → 过去式 ' + (it.past || it.base) + ' → 过去分词 ' + pp };
    }
    var opts3 = shuffle([(it.past || it.base)].concat(distractors(allPast, (it.past || it.base), 3, FALLBACK_EN)));
    return { q: '「' + it.base + '」的过去式是？', opts: opts3, ans: opts3.indexOf(it.past || it.base),
             tip: '原形 ' + it.base + ' → 过去式 ' + (it.past || it.base) };
  }

  function buildPhonetic(bank) {
    var items = bank.cats.phonetics.items;
    if (!items.length) return null;
    var others = [];
    items.forEach(function (p) { (p.examples || []).forEach(function (e) { others.push(e); }); });
    var it = pick(items);
    if (!it.examples || !it.examples.length) return null;
    var correct = pick(it.examples);
    var opts = shuffle([correct].concat(distractors(others, correct, 3, FALLBACK_EN)));
    return { q: '下面哪个单词的拼写规律「' + it.pattern + '」和「' + it.examples[0] + '」一样？',
             opts: opts, ans: opts.indexOf(correct),
             tip: '「' + it.pattern + '」例词：' + it.examples.join('、') };
  }

  /* 对外：生成一道题；cat 可为 mixed */
  function makeQuestion(g, cat) {
    var b = grade(g);
    if (!b) return null;
    if (cat === 'mixed') {
      var avail = catList(g);
      if (!avail.length) return null;
      cat = pick(avail);
    }
    var r = Math.random();
    switch (cat) {
      case 'vocab':    return buildVocab(b, r < 0.5 ? 'en2zh' : 'zh2en');
      case 'phrases':  return buildExpr(b, 'phrases', r < 0.5 ? 'en2zh' : 'zh2en');
      case 'proverbs': return buildExpr(b, 'proverbs', r < 0.5 ? 'en2zh' : 'zh2en');
      case 'irregular':return buildIrregular(b, pick(['base2past', 'base2pp', 'past2base']));
      case 'phonetics':return buildPhonetic(b);
      default:         return null;
    }
  }

  /* ---------- 错题本 ---------- */
  function qidOf(q) {
    return 'en_' + (q._grade || '') + '_' + (q._cat || '') + '_' + (q.opts[q.ans] || '') + '_' + (q.q || '').slice(0, 24);
  }
  function wrongList(g) {
    var p = S().progress.english; p.wrong = p.wrong || [];
    return p.wrong.filter(function (x) { return x.grade === g || g == null; });
  }
  function recordWrong(g, cat, q) {
    var p = S().progress.english; p.wrong = p.wrong || [];
    var qid = qidOf({ _grade: g, _cat: cat, q: q.q, opts: q.opts, ans: q.ans });
    var hit = null;
    for (var i = 0; i < p.wrong.length; i++) { if (p.wrong[i].qid === qid) { hit = p.wrong[i]; break; } }
    if (hit) { hit.n = (hit.n || 1) + 1; hit.ts = Date.now(); }
    else {
      p.wrong.push({
        qid: qid, grade: g, cat: cat, n: 1, ts: Date.now(),
        q: q.q, opts: q.opts, ans: q.ans, tip: q.tip || '', speak: q.speak || '', speakLang: q.speakLang || 'en-US'
      });
    }
    APP.save();
  }
  function removeWrong(qid) {
    var p = S().progress.english; p.wrong = p.wrong || [];
    p.wrong = p.wrong.filter(function (x) { return x.qid !== qid; });
    APP.save();
  }
  /* 把错题还原成 makeQuiz 题目对象 */
  function questionFromWrong(it) {
    return { qid: it.qid, q: it.q, opts: it.opts, ans: it.ans, tip: it.tip, speak: it.speak, speakLang: it.speakLang };
  }

  window.ENBANK = {
    ensure: ensure,
    grade: grade,
    catalog: catalog,
    catList: catList,
    makeQuestion: makeQuestion,
    wrongList: wrongList,
    recordWrong: recordWrong,
    removeWrong: removeWrong,
    questionFromWrong: questionFromWrong
  };
})();
