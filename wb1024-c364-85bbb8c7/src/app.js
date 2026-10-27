/* ============================================================
 *  app.js —— 界面逻辑
 *  原则：用户输入一律以 textContent 渲染，杜绝 innerHTML 注入；
 *        密钥只经 localStorage，不写日志、不外发。
 * ============================================================ */
(function () {
  'use strict';

  var CJK = /[\u4e00-\u9fff]/;
  var C = window.PoemCore;
  var isTouch = false;   // 触屏设备：影响聚焦策略与提示位置

  var $ = function (id) { return document.getElementById(id); };

  var TEMP_KEY = 'shiyun.draft.v1';
  var TEMP_TS = 'shiyun.draft.ts.v1';
  var DRAFTS_KEY = 'shiyun.drafts.v1';

  var state = {
    bookKey: 'pingshui',
    form: 'auto',
    forcedRhyme: '',
    activeLine: -1,        // 原文行号
    rawLines: [],          // 原文非空行号映射
    manual: {},            // 'line:pos' -> '平'|'仄'
    lex: [],
    last: null,
    drafts: [],
    currentDraftId: '',
    tempTs: 0,
    tempSaved: ''
  };

  /* ---------------- 小工具 ---------------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = String(text);
    return e;
  }

  function miniBtn(label, fn) {
    var b = el('button', 'mini-btn', label);
    b.type = 'button';
    b.addEventListener('click', function (ev) { ev.stopPropagation(); fn(); });
    return b;
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function fmtTime(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }
  function shortTime(ts) {
    var d = new Date(ts);
    return pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function fileStamp() {
    var d = new Date();
    return '' + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '-' + pad2(d.getHours()) + pad2(d.getMinutes());
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    if (!t) {
      t = el('div'); t.id = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  function status(msg) { $('status').textContent = msg; }

  function isCJK(s) { return CJK.test(s); }

  /* ---------------- 编辑器读写 ---------------- */
  function getText() { return $('editor').value; }

  function setText(v) {
    $('editor').value = v;
    refresh();
  }

  /** 原文中第 rawIdx 行（非空行序号）替换最后一个汉字 */
  function replaceFinalChar(rawIdx, newChar) {
    var lines = $('editor').value.split('\n');
    var count = -1;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim().length === 0) continue;
      count++;
      if (count !== rawIdx) continue;
      var s = lines[i];
      var pos = -1;
      for (var j = s.length - 1; j >= 0; j--) { if (CJK.test(s[j])) { pos = j; break; } }
      if (pos < 0) { lines[i] = s + newChar; }
      else { lines[i] = s.slice(0, pos) + newChar + s.slice(pos + 1); }
      break;
    }
    $('editor').value = lines.join('\n');
    refresh();
  }

  /** 原文第 rawIdx 行替换句尾 n 字 */
  function replaceTail(rawIdx, word) {
    var lines = $('editor').value.split('\n');
    var count = -1;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim().length === 0) continue;
      count++;
      if (count !== rawIdx) continue;
      var s = lines[i].replace(/[，。、？！；：,.?!;:]+$/, '');
      var idx = -1;
      for (var j = s.length - 1; j >= 0; j--) { if (CJK.test(s[j])) { idx = j; break; } }
      if (idx < 0) { lines[i] = s + word; }
      else {
        var cut = Math.min(idx + 1, word.length);
        lines[i] = s.slice(0, idx + 1 - cut) + word;
      }
      break;
    }
    $('editor').value = lines.join('\n');
    refresh();
  }

  function insertAtCursor(text, doFocus) {
    var ta = $('editor');
    var start = ta.selectionStart || 0, end = ta.selectionEnd || 0;
    var v = ta.value;
    ta.value = v.slice(0, start) + text + v.slice(end);
    var pos = start + text.length;
    ta.setSelectionRange(pos, pos);
    // 触屏上不强制聚焦，避免软键盘反复弹起遮住候选区
    if (doFocus !== false) ta.focus();
    refresh();
  }

  /* ---------------- 分析 ---------------- */
  function refresh() {
    var text = getText();
    var raw = C.parseLines(text);
    state.rawLines = [];
    var all = text.split('\n');
    var k = 0;
    for (var i = 0; i < all.length; i++) {
      if (all[i].trim().length === 0) continue;
      state.rawLines.push(i);
      k++;
    }

    var res = C.analyze(text, state.bookKey, state.forcedRhyme);
    // 应用手动平仄改判
    res.lines.forEach(function (line, li) {
      line.chars.forEach(function (c, ci) {
        var m = state.manual[li + ':' + ci];
        if (m) { c.pz = m; c.ping = m === '平'; c.ze = m === '仄'; c.manual = true; }
      });
    });
    state.last = res;

    var form = C.detectForm(res.lines);
    var formSel = state.form;
    if (formSel && formSel !== 'auto') {
      var map = { wujue: '五言绝句', qijue: '七言绝句', wulv: '五言律诗', qilv: '七言律诗', ci: '词 / 长短句', free: '自由诗' };
      form.label = map[formSel] || form.label;
      form.key = formSel;
    }

    renderAnalysis(res);
    renderVerdict(res, form);
    renderRhymePane(res);
    renderMeterPane(res, form);
    renderWordsPane(res);
    status('共 ' + res.lines.length + ' 句 · 主韵 ' + (res.mainRhyme || '未定') + ' · ' + form.label);
    saveTemp();
  }

  function renderAnalysis(res) {
    var box = $('analysis');
    box.textContent = '';
    if (!res.lines.length) {
      box.appendChild(el('div', 'empty', '尚无诗句，先在左侧写一句吧。'));
      return;
    }
    res.lines.forEach(function (line, i) {
      var row = el('div', 'line-block' + (state.activeLine === i ? ' is-active' : ''));
      row.dataset.line = String(i);
      row.appendChild(el('span', 'line-idx', String(i + 1)));

      var chars = el('div', 'chars');
      line.chars.forEach(function (c, ci) {
        var w = el('div', 'ch' + (c.final ? ' is-final' : ''));
        w.appendChild(el('span', 'ch-t', c.ch));
        var cls = c.pz === '平' ? 'p' : (c.pz === '仄' ? 'z' : 'u');
        var m = el('div', 'ch-m ' + cls);
        m.dataset.pos = String(ci);
        m.title = c.manual ? '手动判定：' + c.pz + '（点击复位）'
          : (c.unknown ? '韵书未收，点击可判定' : (c.pz === '平仄' ? '平仄两读（' + (c.groups || []).map(function (g) { return g.name; }).join('/') + '）' : c.pz + ' · ' + (c.groups && c.groups[0] ? c.groups[0].name : '')));
        m.addEventListener('click', function (ev) {
          ev.stopPropagation();
          cycleTone(i, ci);
        });
        w.appendChild(m);
        chars.appendChild(w);
      });
      row.appendChild(chars);

      var tail = el('div', 'line-tail');
      var gr = line.final ? C.rhymeOf(line.final, state.bookKey) : null;
      var ok = gr && res.mainRhyme ? C.inRhyme(line.final, res.mainRhyme, state.bookKey) : false;
      var badge = el('span', 'rhyme-badge' + (gr ? (ok ? ' ok' : ' bad') : ''), gr ? (ok ? gr : gr + '（出韵）') : '未收');
      tail.appendChild(badge);
      var b = el('button', 'mini-btn', '补韵脚');
      b.type = 'button';
      b.addEventListener('click', function (ev) {
        ev.stopPropagation();
        state.activeLine = i;
        switchTab('rhyme');
        refresh();
      });
      tail.appendChild(b);
      row.appendChild(tail);

      row.addEventListener('click', function () {
        state.activeLine = state.activeLine === i ? -1 : i;
        refresh();
      });
      box.appendChild(row);
    });
  }

  function cycleTone(lineIdx, charIdx) {
    var key = lineIdx + ':' + charIdx;
    var cur = state.manual[key];
    var line = state.last && state.last.lines[lineIdx];
    var auto = line ? line.chars[charIdx].pz : '?';
    if (!cur) state.manual[key] = (auto === '仄') ? '平' : '仄';
    else if (cur === '仄') delete state.manual[key];
    else state.manual[key] = '仄';
    refresh();
  }

  function renderVerdict(res, form) {
    var box = $('verdict');
    box.textContent = '';
    var items = [];
    if (res.mainRhyme) {
      var bad = res.issues.filter(function (x) { return x.level === 'err'; });
      if (!bad.length) items.push({ level: 'ok', msg: '押 ' + res.mainRhyme + '，未见出韵' });
      else items.push({ level: 'err', msg: '有 ' + bad.length + ' 处出韵' });
    } else {
      items.push({ level: 'warn', msg: '尚未确定韵部' });
    }
    items.push({ level: 'warn', msg: '体式：' + form.label });
    var unknown = 0;
    res.lines.forEach(function (l) { l.chars.forEach(function (c) { if (c.unknown) unknown++; }); });
    if (unknown) items.push({ level: 'warn', msg: unknown + ' 字未见于本韵书（多为今字或生僻字）' });
    items.forEach(function (it) {
      box.appendChild(el('span', 'v-item ' + it.level, it.msg));
    });
  }

  /* ---------------- 韵脚面板 ---------------- */
  function renderRhymePane(res) {
    var g = res.mainRhyme || '';
    $('rhymeBelong').textContent = g || '未定';
    var grid = $('rhymeGrid');
    grid.textContent = '';
    var near = $('nearRhyme');
    near.textContent = '';

    if (g) {
      (window.NEAR_RHYME[g] || []).forEach(function (n) {
        var c = el('span', 'chip', '可通押 · ' + n);
        c.addEventListener('click', function () {
          state.forcedRhyme = n;
          $('selRhyme').value = n;
          refresh();
          toast('已切换到 ' + n);
        });
        near.appendChild(c);
      });
      if (!near.children.length) near.appendChild(el('span', 'chip static', '此韵无推荐通押，宜一韵到底'));
    }

    if (!g) {
      grid.appendChild(el('div', 'empty', '请先写一句诗，或在上方「主韵部」中指定。'));
      return;
    }
    var filter = $('rhymeFilter').value;
    var tone = $('rhymeToneFilter').value;
    var r = C.rhymeCandidates(g, state.bookKey, filter, tone, state.lex);
    var list = r.matched.concat(r.rest);
    if (!list.length) {
      grid.appendChild(el('div', 'empty', '该韵部在所选平仄下无候选字。'));
      return;
    }
    if (r.matched.length) {
      var tip = el('div', 'hint', '意象命中 ' + r.matched.length + ' 字，已置顶（悬停可见来源词）');
      tip.style.flexBasis = '100%';
      grid.appendChild(tip);
    }
    var limit = Math.min(list.length, 420);
    for (var i = 0; i < limit; i++) {
      (function (o) {
        var b = el('button', 'char-chip ' + (o.pz === '平' ? 'p' : (o.pz === '仄' ? 'z' : '')), o.ch);
        b.type = 'button';
        b.title = (o.pz === '平仄' ? '平仄两读' : o.pz) + (o.src ? ' · 见于：' + o.src : '');
        b.addEventListener('click', function () { applyChar(o.ch); });
        grid.appendChild(b);
      })(list[i]);
    }
    if (list.length > limit) grid.appendChild(el('div', 'empty', '另有 ' + (list.length - limit) + ' 字未显示，可用意象关键词缩小范围。'));
  }

  function applyChar(ch) {
    if (state.activeLine >= 0) {
      replaceFinalChar(state.activeLine, ch);
      toast('已将第 ' + (state.activeLine + 1) + ' 句末字改为「' + ch + '」');
    } else {
      insertAtCursor(ch, !isTouch);
    }
  }

  /* ---------------- 格律面板 ---------------- */
  function renderMeterPane(res, form) {
    var m = C.meterCheck(res.lines, state.bookKey);
    var box = $('meterResult');
    box.textContent = '';
    var errs = m.items.filter(function (x) { return x.level === 'err' && !x.summary; }).length;
    $('meterScore').textContent = m.best ? (errs ? errs + ' 处须改' : (m.best.score ? '小疵可改' : '通过')) : '—';

    if (!m.items.length) box.appendChild(el('div', 'empty', '写满四句或八句后再看格律。'));
    m.items.forEach(function (it) {
      box.appendChild(el('div', 'result-item ' + it.level, it.msg));
    });

    var tbox = $('meterTemplate');
    tbox.textContent = '';
    if (m.best) {
      var head = el('div', '', m.best.name + '（' + (m.best.tpl.length) + ' 句）');
      head.style.color = '#574f46';
      head.style.fontSize = '12px';
      head.style.letterSpacing = '.1em';
      tbox.appendChild(head);
      var g = el('div', '');
      m.best.tpl.forEach(function (t, i) {
        var line = el('div', '', '');
        for (var k = 0; k < t.length; k++) {
          var sym = t[k] === '平' ? '○' : '●';
          var loose = (k % 2 === 0) && k !== t.length - 1;
          line.appendChild(el('span', '', loose ? '◎' : sym));
        }
        var cur = res.lines[i];
        if (cur && cur.raw) {
          var sp = el('span', '', '   ' + cur.raw);
          sp.style.color = '#8b8377';
          sp.style.fontSize = '13px';
          line.appendChild(sp);
        }
        g.appendChild(line);
      });
      tbox.appendChild(g);
    } else {
      tbox.appendChild(el('div', 'empty', '当前体式不套用近体谱式。'));
    }
  }

  /* ---------------- 词句面板 ---------------- */
  function renderWordsPane(res) {
    var g = res.mainRhyme || '';
    $('wordsBelong').textContent = g || '未定';
    var box = $('wordsList');
    box.textContent = '';
    var filter = $('wordsFilter').value;
    var cat = $('wordsCat').value;
    var list = C.wordCandidates(g, state.bookKey, filter, cat, state.lex);
    if (!g) { box.appendChild(el('div', 'empty', '先确定韵部，这里会列出末字合韵的词组。')); return; }
    if (!list.length) { box.appendChild(el('div', 'empty', '「' + g + '」韵下暂无匹配词组，换个关键词或用「韵脚」页挑单字。')); return; }
    list.slice(0, 200).forEach(function (w) {
      var row = el('div', 'word-item');
      row.appendChild(el('span', 'w-t', w.word));
      var meta = el('span', 'w-m', '');
      var em = el('em', '', w.cat);
      meta.appendChild(em);
      var last = w.word[w.word.length - 1];
      var pz = C.pingze(last, state.bookKey);
      meta.appendChild(document.createTextNode(' · 末字' + (pz === '?' ? '未收' : pz)));
      row.appendChild(meta);
      row.addEventListener('click', function () { applyWord(w.word); });
      box.appendChild(row);
    });
  }

  function applyWord(word) {
    if ($('wordsReplace').checked && state.activeLine >= 0) {
      replaceTail(state.activeLine, word);
      toast('句尾已换为「' + word + '」');
    } else {
      insertAtCursor(word, !isTouch);
    }
  }

  /* ---------------- 词库 ---------------- */
  function loadLex() {
    try {
      var a = JSON.parse(localStorage.getItem('shiyun.lex.v1') || '[]');
      state.lex = Array.isArray(a) ? a : [];
    } catch (e) { state.lex = []; }
  }

  function saveLex(list) {
    try { localStorage.setItem('shiyun.lex.v1', JSON.stringify(list)); } catch (e) { }
  }

  function renderLex() {
    $('lexCount').textContent = state.lex.length + ' 条';
    var box = $('lexPreview');
    box.textContent = '';
    state.lex.slice(0, 60).forEach(function (w) {
      box.appendChild(el('span', 'chip static', w));
    });
    if (state.lex.length > 60) box.appendChild(el('span', 'chip static', '…另有 ' + (state.lex.length - 60) + ' 条'));
  }

  function parseLexText(text) {
    var out = [];
    text.split(/\r?\n/).forEach(function (line) {
      var s = line.trim();
      if (!s) return;
      s = s.split(/[\s\t,，]+/)[0];
      s = s.replace(/[^\u4e00-\u9fff]/g, '');
      if (s.length >= 1 && s.length <= 8 && out.indexOf(s) < 0) out.push(s);
    });
    return out;
  }

  /* ---------------- 设置 ---------------- */
  function fillRhymeSelect() {
    var sel = $('selRhyme');
    var cur = sel.value;
    sel.textContent = '';
    sel.appendChild(el('option', '', '自动推测'));
    C.allGroups(state.bookKey).forEach(function (g) {
      var o = el('option', '', g);
      o.value = g;
      sel.appendChild(o);
    });
    if (cur) sel.value = cur;
  }

  function fillCatSelect() {
    var sel = $('wordsCat');
    var cur = sel.value;
    sel.textContent = '';
    sel.appendChild(el('option', '', '全部分类'));
    (window.LEXICON || []).forEach(function (g) {
      var o = el('option', '', g.cat);
      o.value = g.cat;
      sel.appendChild(o);
    });
    var o2 = el('option', '', '我的词库');
    o2.value = '我的词库';
    sel.appendChild(o2);
    if (cur) sel.value = cur;
  }

  function openDrawer(id, maskId) {
    $(id).hidden = false;
    $(maskId).hidden = false;
  }
  function closeDrawer(id, maskId) {
    $(id).hidden = true;
    $(maskId).hidden = true;
  }

  function saveTemp() {
    var t = getText();
    try {
      localStorage.setItem(TEMP_KEY, t);
      state.tempTs = Date.now();
      localStorage.setItem(TEMP_TS, String(state.tempTs));
      state.tempSaved = t;
    } catch (e) { }
    renderTempTip();
    if (!$('draftsDrawer').hidden) renderTempBox();
  }
  function loadTemp() {
    try {
      var t = localStorage.getItem(TEMP_KEY) || '';
      state.tempTs = Number(localStorage.getItem(TEMP_TS) || 0) || 0;
      state.tempSaved = t;
      return t;
    } catch (e) { return ''; }
  }
  function clearTemp() {
    try { localStorage.removeItem(TEMP_KEY); localStorage.removeItem(TEMP_TS); } catch (e) { }
    state.tempTs = 0; state.tempSaved = '';
    renderTempTip(); renderTempBox();
  }
  function renderTempTip() {
    var tip = $('autosaveTip');
    if (tip) tip.textContent = state.tempTs ? ('已暂存 · ' + shortTime(state.tempTs)) : '未暂存';
  }

  /* ---------------- 稿匣（命名保存多份） ---------------- */
  function loadDrafts() {
    try {
      var a = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
      state.drafts = Array.isArray(a) ? a.filter(function (d) { return d && typeof d.text === 'string'; }) : [];
    } catch (e) { state.drafts = []; }
  }
  function saveDrafts() {
    try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(state.drafts)); return true; }
    catch (e) { return false; }
  }
  function findDraft(id) {
    for (var i = 0; i < state.drafts.length; i++) if (state.drafts[i].id === id) return state.drafts[i];
    return null;
  }

  function draftDefaultName() {
    var lines = getText().split(/\r?\n/).filter(function (s) { return s.trim(); });
    var first = lines[0] || '';
    return first.replace(/[，。、？！；：,.?!;:]/g, '').slice(0, 10) || ('未命名 ' + shortTime(Date.now()));
  }

  function saveDraftAs() {
    var t = getText();
    if (!t.trim()) { toast('没有内容可存'); return; }
    var name = window.prompt('给这一稿起个名字', draftDefaultName());
    if (name === null) return;
    name = String(name).trim() || draftDefaultName();
    var d = {
      id: 'd' + Date.now() + Math.random().toString(36).slice(2, 6),
      name: name, text: t, ts: Date.now(),
      form: state.form, book: state.bookKey
    };
    state.drafts.push(d);
    if (saveDrafts()) { state.currentDraftId = d.id; toast('已存入稿匣：' + name); }
    else toast('保存失败（浏览器禁用了本地存储）');
    renderDrafts();
  }

  function applyDraft(d) {
    if (getText().trim() && !window.confirm('将用「' + d.name + '」替换当前内容，继续？')) return;
    state.currentDraftId = d.id;
    state.form = d.form || 'auto';
    $('selForm').value = state.form;
    if (d.book && d.book !== state.bookKey) {
      state.bookKey = d.book;
      $('selBook').value = d.book;
      fillRhymeSelect();
    }
    setText(d.text);
    saveTemp();
    toast('已载入：' + d.name);
  }

  function overwriteDraft(id) {
    var d = findDraft(id);
    if (!d) return;
    d.text = getText();
    d.ts = Date.now();
    d.form = state.form; d.book = state.bookKey;
    saveDrafts(); renderDrafts(); saveTemp();
    toast('已更新：' + d.name);
  }

  function renameDraft(id) {
    var d = findDraft(id);
    if (!d) return;
    var name = window.prompt('改名为', d.name);
    if (name === null) return;
    d.name = String(name).trim() || d.name;
    d.ts = Date.now();
    saveDrafts(); renderDrafts();
  }

  function deleteDraft(id) {
    var d = findDraft(id);
    if (!d) return;
    if (!window.confirm('删除「' + d.name + '」？此操作不可撤销。')) return;
    state.drafts = state.drafts.filter(function (x) { return x.id !== id; });
    saveDrafts(); renderDrafts();
    toast('已删除');
  }

  function renderTempBox() {
    var box = $('draftTemp');
    box.textContent = '';
    box.appendChild(el('div', '', state.tempTs ? ('临时草稿：' + fmtTime(state.tempTs)) : '临时草稿：暂无'));
    if (state.tempTs && getText() !== state.tempSaved) {
      box.appendChild(el('div', '', '当前编辑区与上次暂存内容不同，可「恢复」回到暂存版本。'));
    }
    var ops = el('div', 'tb-row');
    ops.appendChild(miniBtn('立即暂存', function () { saveTemp(); toast('已暂存'); }));
    ops.appendChild(miniBtn('恢复暂存', function () {
      var t = state.tempSaved;
      if (!t.trim()) { toast('没有可恢复的暂存内容'); return; }
      if (getText().trim() && !window.confirm('用暂存内容替换当前编辑区？')) return;
      setText(t); toast('已恢复暂存');
    }));
    ops.appendChild(miniBtn('清空暂存', function () {
      if (!window.confirm('清空临时草稿？稿匣里的稿件不受影响。')) return;
      clearTemp(); toast('已清空暂存');
    }));
    box.appendChild(ops);
  }

  function renderDrafts() {
    var box = $('draftList');
    box.textContent = '';
    renderTempBox();
    if (!state.drafts.length) {
      box.appendChild(el('div', 'empty', '稿匣还是空的。点「存为新稿」把当前文字收进来，或粘贴一首旧作存着慢慢改。'));
      return;
    }
    state.drafts.slice().sort(function (a, b) { return b.ts - a.ts; }).forEach(function (d) {
      var item = el('div', 'draft-item' + (d.id === state.currentDraftId ? ' is-current' : ''));
      var top = el('div', 'd-top');
      top.appendChild(el('span', 'd-name', d.name));
      top.appendChild(el('span', 'd-time', shortTime(d.ts) + ' · ' + d.text.replace(/\s+/g, '').length + ' 字'));
      item.appendChild(top);
      var prev = d.text.split(/\r?\n/).filter(function (s) { return s.trim(); }).slice(0, 2).join(' ／ ');
      item.appendChild(el('div', 'd-prev', prev || '（空稿）'));
      var ops = el('div', 'd-ops');
      ops.appendChild(miniBtn('载入', function () { applyDraft(d); }));
      ops.appendChild(miniBtn('覆盖', function () { overwriteDraft(d.id); }));
      ops.appendChild(miniBtn('改名', function () { renameDraft(d.id); }));
      ops.appendChild(miniBtn('下载', function () { downloadText(d.text, d.name); }));
      ops.appendChild(miniBtn('删除', function () { deleteDraft(d.id); }));
      item.appendChild(ops);
      box.appendChild(item);
    });
  }

  /* ---------------- 分行 / 整理 ---------------- */
  function splitByPunct(text, keep) {
    var lines = String(text).replace(/\r\n?/g, '\n').split('\n');
    var out = [];
    lines.forEach(function (line) {
      var cur = '';
      for (var i = 0; i < line.length; i++) {
        var c = line[i];
        if (/[，。、？！；：,.?!;:]/.test(c)) {
          if (keep) cur += c;
          if (cur.trim()) { out.push(cur.trim()); cur = ''; }
          continue;
        }
        cur += c;
      }
      if (cur.trim()) out.push(cur.trim());
    });
    return out.filter(function (s) { return s.replace(/[，。、？！；：,.?!;:]/g, '').length > 0; });
  }

  function splitFixed(text, n) {
    var s = String(text)
      .replace(/[\s\u3000]+/g, '')
      .replace(/[，。、？！；：,.?!;:「」『』《》〈〉""''…—－\-]/g, '');
    var out = [];
    for (var i = 0; i < s.length; i += n) out.push(s.substr(i, n));
    return out;
  }

  function doSplit() {
    var t = getText();
    if (!t.trim()) { toast('先写点什么，或上传一个 .txt'); return; }
    var mode = $('selSplit').value;
    var arr;
    if (mode === 'len5') arr = splitFixed(t, 5);
    else if (mode === 'len7') arr = splitFixed(t, 7);
    else arr = splitByPunct(t, mode === 'punct-keep');
    if (!arr.length) { toast('没有可切分的内容'); return; }
    setText(arr.join('\n'));
    toast('已分为 ' + arr.length + ' 行');
  }

  function doTidy() {
    var arr = getText().split(/\r?\n/)
      .map(function (s) { return s.replace(/\u3000/g, ' ').replace(/\s+$/, '').replace(/^\s+/, ''); })
      .filter(function (s) { return s.length; });
    setText(arr.join('\n'));
    toast(arr.length ? ('已整理为 ' + arr.length + ' 行') : '内容为空');
  }

  /* ---------------- 上传 / 下载 / 复制 ---------------- */
  function readFile(f, cb) {
    if (f.size > 1024 * 1024) { toast('文件超过 1MB，未载入'); return; }
    var fr = new FileReader();
    fr.onload = function () { cb(String(fr.result || '').replace(/^\ufeff/, '').replace(/\r\n?/g, '\n'), f.name); };
    fr.onerror = function () { toast('读取失败'); };
    fr.readAsText(f, 'utf-8');
  }

  function pickFile(cb) {
    var inp = $('fileInput');
    inp.value = '';
    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      inp.value = '';
      if (f) readFile(f, cb);
    };
    inp.click();
  }

  function downloadBlob(text, filename, mime) {
    mime = mime || 'text/plain';
    var url = '';
    try {
      url = URL.createObjectURL(new Blob([text], { type: mime + ';charset=utf-8' }));
    } catch (e) { url = ''; }
    if (!url) url = 'data:' + mime + ';charset=utf-8,' + encodeURIComponent(text);  // 兜底
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (url.indexOf('blob:') === 0) { try { URL.revokeObjectURL(url); } catch (e) { } }
      a.remove();
    }, 1500);
  }

  function downloadText(text, name) {
    downloadBlob('\ufeff' + text, (name || '诗韵') + '-' + fileStamp() + '.txt', 'text/plain');
    toast('已下载 .txt');
  }

  function copyText(t) {
    if (!t) { toast('没有内容可复制'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { toast('已复制全文'); }, function () { legacyCopy(t); });
    } else legacyCopy(t);
  }

  function legacyCopy(t) {
    var ta = document.createElement('textarea');
    ta.value = t;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { }
    ta.remove();
    toast(ok ? '已复制全文' : '复制失败，请手动选中复制');
  }

  function exportDrafts() {
    if (!state.drafts.length) { toast('稿匣是空的'); return; }
    downloadBlob(JSON.stringify(state.drafts, null, 2), '诗韵稿匣-' + fileStamp() + '.json', 'application/json');
    toast('已导出 ' + state.drafts.length + ' 份稿');
  }

  function importDrafts() {
    pickFile(function (text) {
      var arr = null;
      try { arr = JSON.parse(text); } catch (e) { arr = null; }
      if (!Array.isArray(arr)) { toast('不是有效的稿匣备份文件'); return; }
      var add = 0;
      arr.forEach(function (d) {
        if (!d || typeof d.text !== 'string') return;
        var id = d.id || ('d' + Date.now() + Math.random().toString(36).slice(2, 6));
        var old = findDraft(id);
        if (old) { old.name = d.name || old.name; old.text = d.text; old.ts = d.ts || Date.now(); }
        else { state.drafts.push({ id: id, name: d.name || '未命名', text: d.text, ts: d.ts || Date.now(), form: d.form || 'auto', book: d.book || 'pingshui' }); add++; }
      });
      if (saveDrafts()) { renderDrafts(); toast('已导入，新增 ' + add + ' 份'); }
      else toast('导入失败（浏览器禁用了本地存储）');
    });
  }

  function switchTab(name) {
    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('is-active', t.dataset.tab === name);
    });
    document.querySelectorAll('.tabpane').forEach(function (p) {
      p.classList.toggle('is-active', p.id === 'pane-' + name);
    });
  }

  /* ---------------- 绑定 ---------------- */
  /** 软键盘弹起时给 body 打标记，让 toast / 状态栏上移不被遮挡 */
  function watchKeyboard() {
    if (!window.visualViewport) return;
    var vv = window.visualViewport;
    var update = function () {
      var hidden = (window.innerHeight || 0) - vv.height;
      document.body.classList.toggle('kb-open', hidden > 120);
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
  }

  function bind() {
    // 中文输入法组词期间（拼音候选未上屏）不做分析，避免把拼音当正文
    var lazy = debounce(function () { refresh(); }, 260);
    $('editor').addEventListener('input', function (e) {
      if (e.isComposing) return;
      lazy();
    });
    $('editor').addEventListener('compositionend', function () { lazy(); });
    $('editor').addEventListener('click', function () {
      var ta = $('editor');
      var upto = ta.value.slice(0, ta.selectionStart).split('\n');
      var nonEmptyBefore = upto.filter(function (l) { return l.trim().length; }).length;
      state.activeLine = -1;
      state._caretLine = nonEmptyBefore - 1;
    });

    $('selForm').addEventListener('change', function () { state.form = this.value; refresh(); });
    $('selBook').addEventListener('change', function () {
      state.bookKey = this.value;
      state.forcedRhyme = '';
      fillRhymeSelect();
      $('selRhyme').value = '';
      refresh();
    });
    $('selRhyme').addEventListener('change', function () {
      state.forcedRhyme = this.value;
      refresh();
    });

    $('btnAnalyze').addEventListener('click', function () { refresh(); toast('已审韵'); });
    $('btnClear').addEventListener('click', function () {
      setText('');
      state.manual = {};
      state.activeLine = -1;
    });
    $('btnDemo').addEventListener('click', function () {
      setText('床前明月光\n疑是地上霜\n举头望明月\n低头思故乡');
      state.form = 'wujue';
      $('selForm').value = 'wujue';
      refresh();
    });

    $('rhymeFilter').addEventListener('input', debounce(function () { renderRhymePane(state.last); }, 200));
    $('rhymeToneFilter').addEventListener('change', function () { renderRhymePane(state.last); });
    $('wordsFilter').addEventListener('input', debounce(function () { renderWordsPane(state.last); }, 200));
    $('wordsCat').addEventListener('change', function () { renderWordsPane(state.last); });


    // 分行 / 整理 / 文件
    $('btnSplit').addEventListener('click', doSplit);
    $('btnTidy').addEventListener('click', doTidy);
    $('btnUpload').addEventListener('click', function () {
      pickFile(function (text, name) {
        if (!text.trim()) { toast('文件内容为空'); return; }
        if (getText().trim() && !window.confirm('将用「' + name + '」替换当前内容，继续？')) return;
        setText(text);
        saveTemp();
        toast('已载入 ' + name);
      });
    });
    $('btnDownload').addEventListener('click', function () {
      if (!getText().trim()) { toast('没有内容可下载'); return; }
      downloadText(getText(), '诗韵');
    });
    $('btnCopy').addEventListener('click', function () { copyText(getText()); });

    // 拖放载入
    var dz = $('dropZone');
    var dragDepth = 0;
    dz.addEventListener('dragenter', function (e) {
      e.preventDefault(); dragDepth++; $('dropMask').hidden = false;
    });
    dz.addEventListener('dragover', function (e) { e.preventDefault(); });
    dz.addEventListener('dragleave', function (e) {
      e.preventDefault(); dragDepth--;
      if (dragDepth <= 0) { dragDepth = 0; $('dropMask').hidden = true; }
    });
    dz.addEventListener('drop', function (e) {
      e.preventDefault(); dragDepth = 0; $('dropMask').hidden = true;
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f) return;
      readFile(f, function (text, name) {
        if (!text.trim()) { toast('文件内容为空'); return; }
        if (getText().trim() && !window.confirm('将用「' + name + '」替换当前内容，继续？')) return;
        setText(text);
        saveTemp();
        toast('已载入 ' + name);
      });
    });

    // 稿匣
    $('btnDrafts').addEventListener('click', function () {
      loadDrafts();
      renderDrafts();
      openDrawer('draftsDrawer', 'draftsMask');
    });
    $('btnCloseDrafts').addEventListener('click', function () { closeDrawer('draftsDrawer', 'draftsMask'); });
    $('draftsMask').addEventListener('click', function () { closeDrawer('draftsDrawer', 'draftsMask'); });
    $('btnDraftSaveAs').addEventListener('click', saveDraftAs);
    $('btnDraftExport').addEventListener('click', exportDrafts);
    $('btnDraftImport').addEventListener('click', importDrafts);
    $('btnDraftWipe').addEventListener('click', function () {
      if (!state.drafts.length) { toast('稿匣已经是空的'); return; }
      if (!window.confirm('清空稿匣里的 ' + state.drafts.length + ' 份稿件？建议先「导出全部」备份。')) return;
      state.drafts = [];
      state.currentDraftId = '';
      saveDrafts(); renderDrafts();
      toast('稿匣已清空');
    });

    $('btnLexSave').addEventListener('click', function () {
      var list = parseLexText($('lexInput').value);
      state.lex = list;
      saveLex(list);
      renderLex();
      refresh();
      toast('已保存 ' + list.length + ' 条');
    });
    $('btnLexClear').addEventListener('click', function () {
      state.lex = [];
      saveLex([]);
      $('lexInput').value = '';
      renderLex();
      refresh();
      toast('词库已清空');
    });

    $('btnHelp').addEventListener('click', function () { openDrawer('help', 'helpMask'); });
    $('btnCloseHelp').addEventListener('click', function () { closeDrawer('help', 'helpMask'); });
    $('helpMask').addEventListener('click', function () { closeDrawer('help', 'helpMask'); });

    document.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () { switchTab(t.dataset.tab); });
    });

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); refresh(); toast('已审韵'); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); saveDraftAs(); }
      if (e.key === 'Escape') {
        closeDrawer('help', 'helpMask');
        closeDrawer('draftsDrawer', 'draftsMask');
      }
    });
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    try { isTouch = !!(window.matchMedia && window.matchMedia('(hover:none)').matches); } catch (e) { isTouch = false; }
    loadLex();
    loadDrafts();
    fillRhymeSelect();
    fillCatSelect();
    bind();
    renderLex();
    $('editor').value = loadTemp() || '';
    renderTempTip();
    refresh();
    watchKeyboard();
    status('就绪 · 数据离线可用');


  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
