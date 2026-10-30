/* ============================================================
 *  core.js —— 韵部索引 / 平仄 / 韵脚 / 格律
 * ============================================================ */
(function (root) {
  'use strict';

  var CJK = /[\u4e00-\u9fff]/;

  function clean(s) {
    return (s || '').replace(/[^\u4e00-\u9fff]/g, '');
  }

  function uniq(str) {
    var seen = {}, out = '';
    for (var i = 0; i < str.length; i++) {
      var c = str[i];
      if (CJK.test(c) && !seen[c]) { seen[c] = 1; out += c; }
    }
    return out;
  }

  /* ---------------- 索引构建 ---------------- */
  var INDEX = {};        // bookKey -> { char: { groups:[{name,tone}], tones:{}, detail:{} } }
  var GROUPMAP = {};     // bookKey -> { groupName: [chars] }

  function buildIndex(bookKey) {
    if (INDEX[bookKey]) return INDEX[bookKey];
    var book = root.RHYME_BOOKS[bookKey];
    var idx = {}, gm = {};
    book.groups.forEach(function (g) {
      var tone = g.tone === '平' ? '平' : '仄';
      var detail = g.tone;
      var chars = uniq(clean(g.chars));
      if (!gm[g.name]) gm[g.name] = [];
      for (var i = 0; i < chars.length; i++) {
        var c = chars[i];
        if (!idx[c]) idx[c] = { groups: [], tones: {}, detail: {} };
        idx[c].groups.push({ name: g.name, tone: detail });
        idx[c].tones[tone] = 1;
        idx[c].detail[detail] = 1;
        if (gm[g.name].indexOf(c) < 0) gm[g.name].push(c);
      }
      if (g.zeChars) {                       // 中华新韵的仄声栏
        var zc = uniq(clean(g.zeChars));
        for (var j = 0; j < zc.length; j++) {
          var z = zc[j];
          if (!idx[z]) idx[z] = { groups: [], tones: {}, detail: {} };
          idx[z].groups.push({ name: g.name, tone: '仄' });
          idx[z].tones['仄'] = 1;
          idx[z].detail['仄'] = 1;
          if (gm[g.name].indexOf(z) < 0) gm[g.name].push(z);
        }
      }
    });
    INDEX[bookKey] = idx;
    GROUPMAP[bookKey] = gm;
    return idx;
  }

  /* ---------------- 查询 ---------------- */
  function charInfo(ch, bookKey) {
    var idx = buildIndex(bookKey);
    var it = idx[ch];
    if (!it) return { unknown: true, tones: {}, detail: {}, groups: [] };
    return {
      unknown: false,
      tones: Object.keys(it.tones),
      detail: Object.keys(it.detail),
      groups: it.groups
    };
  }

  /** 平仄判定：'平' / '仄' / '平仄'(两读) / '?'(未收) */
  function pingze(ch, bookKey) {
    var info = charInfo(ch, bookKey);
    if (info.unknown) return '?';
    var t = info.tones;
    if (t.length > 1) return '平仄';
    return t[0];
  }

  /** 该字所属韵部名（优先平声韵部；若无平声读法则取首个） */
  function rhymeOf(ch, bookKey) {
    var info = charInfo(ch, bookKey);
    if (info.unknown) return null;
    var groups = info.groups;
    for (var i = 0; i < groups.length; i++) if (groups[i].tone === '平') return groups[i].name;
    return groups[0] ? groups[0].name : null;
  }

  /** 是否属于某韵部（多音字任一读音命中即可） */
  function inRhyme(ch, groupName, bookKey) {
    var info = charInfo(ch, bookKey);
    if (info.unknown) return false;
    for (var i = 0; i < info.groups.length; i++) if (info.groups[i].name === groupName) return true;
    return false;
  }

  function groupChars(groupName, bookKey) {
    buildIndex(bookKey);
    return GROUPMAP[bookKey][groupName] || [];
  }

  function allGroups(bookKey) {
    var b = root.RHYME_BOOKS[bookKey];
    return b.groups.map(function (g) { return g.name; });
  }

  /* ---------------- 断句 ---------------- */
  var PUNCT = /[，。、？！；：,.?!;:""'「」『』（）()《》〈〉·—…~～]/g;

  function stripPunct(s) { return (s || '').replace(PUNCT, ''); }

  function parseLines(text) {
    return (text || '').split(/\r?\n/).map(function (l) { return l.trim(); })
      .filter(function (l) { return l.length > 0; });
  }

  /* ---------------- 逐句分析 ---------------- */
  function analyzeLine(line, bookKey) {
    var raw = stripPunct(line).replace(/\s/g, '');
    var chars = [];
    for (var i = 0; i < raw.length; i++) {
      var c = raw[i];
      if (!CJK.test(c)) continue;
      var pz = pingze(c, bookKey);
      chars.push({
        ch: c,
        pz: pz,
        ping: pz.indexOf('平') >= 0,
        ze: pz.indexOf('仄') >= 0,
        unknown: pz === '?',
        rhyme: rhymeOf(c, bookKey),
        final: false
      });
    }
    if (chars.length) chars[chars.length - 1].final = true;
    return { raw: raw, chars: chars, final: chars.length ? chars[chars.length - 1].ch : '' };
  }

  function analyze(text, bookKey, forcedRhyme) {
    var lines = parseLines(text).map(function (l) { return analyzeLine(l, bookKey); });
    var tally = {};
    lines.forEach(function (l, i) {
      if (!l.final) return;
      var g = rhymeOf(l.final, bookKey);
      if (!g) return;
      var weight = (i % 2 === 1) ? 3 : 1;      // 偶句（押韵位）权重更高
      tally[g] = (tally[g] || 0) + weight;
    });
    var main = forcedRhyme || '';
    if (!main) {
      var best = '', bestN = 0;
      Object.keys(tally).forEach(function (g) { if (tally[g] > bestN) { bestN = tally[g]; best = g; } });
      main = best;
    }
    var issues = [];
    if (main) {
      lines.forEach(function (l, i) {
        if (!l.final) return;
        if (!inRhyme(l.final, main, bookKey)) {
          var g = rhymeOf(l.final, bookKey);
          issues.push({
            type: 'rhyme', level: (i % 2 === 1) ? 'err' : 'warn', line: i,
            msg: '第 ' + (i + 1) + ' 句末字「' + l.final + '」' + (g ? '属 ' + g : '韵书未收') + '，与主韵 ' + main + ' 不合'
          });
        }
      });
    }
    return { lines: lines, tally: tally, mainRhyme: main, issues: issues };
  }

  /* ---------------- 格律 ---------------- */
  // ○ 平 ● 仄
  var TEMPLATES = {
    wu: {
      '平起·首句入韵': ['平平仄仄平', '仄仄仄平平', '仄仄平平仄', '平平仄仄平'],
      '平起·首句不入韵': ['平平平仄仄', '仄仄仄平平', '仄仄平平仄', '平平仄仄平'],
      '仄起·首句入韵': ['仄仄仄平平', '平平仄仄平', '平平平仄仄', '仄仄仄平平'],
      '仄起·首句不入韵': ['仄仄平平仄', '平平仄仄平', '平平平仄仄', '仄仄仄平平']
    },
    qi: {
      '平起·首句入韵': ['平平仄仄仄平平', '仄仄平平仄仄平', '仄仄平平平仄仄', '平平仄仄仄平平'],
      '平起·首句不入韵': ['平平仄仄平平仄', '仄仄平平仄仄平', '仄仄平平平仄仄', '平平仄仄仄平平'],
      '仄起·首句入韵': ['仄仄平平仄仄平', '平平仄仄仄平平', '平平仄仄平平仄', '仄仄平平仄仄平'],
      '仄起·首句不入韵': ['仄仄平平平仄仄', '平平仄仄仄平平', '平平仄仄平平仄', '仄仄平平仄仄平']
    }
  };

  function toneSeq(line) {
    // 返回每字的平仄可能集合：'平' / '仄' / '平仄' / '?'
    return line.chars.map(function (c) { return c.pz; });
  }

  function matchTemplate(line, tpl) {
    var seq = toneSeq(line);
    if (seq.length !== tpl.length) return null;
    var bad = [], loose = 0;
    for (var i = 0; i < tpl.length; i++) {
      var want = tpl[i];
      var got = seq[i];
      var ok = got.indexOf(want) >= 0;
      var isLoose = (i % 2 === 0) && i !== tpl.length - 1;   // 一三五不论（末字除外）
      if (!ok) {
        if (isLoose) { loose++; bad.push({ pos: i, want: want, got: got, loose: true }); }
        else bad.push({ pos: i, want: want, got: got, loose: false });
      }
    }
    return { bad: bad, score: bad.filter(function (b) { return !b.loose; }).length * 3 + loose };
  }

  /** 判定体式：len=每句字数, n=句数 */
  function detectForm(lines) {
    var lens = lines.filter(function (l) { return l.chars.length > 0; }).map(function (l) { return l.chars.length; });
    if (!lens.length) return { key: 'free', label: '未定', size: 0, n: 0 };
    var n = lens.length;
    var counter = {};
    lens.forEach(function (x) { counter[x] = (counter[x] || 0) + 1; });
    var size = 0, best = 0;
    Object.keys(counter).forEach(function (k) { if (counter[k] > best) { best = counter[k]; size = +k; } });
    var key = 'free', label = '自由诗 / 古体';
    if (size === 5) {
      if (n === 4) { key = 'wujue'; label = '五言绝句'; }
      else if (n === 8) { key = 'wulv'; label = '五言律诗'; }
      else { key = 'wu'; label = '五言古诗（' + n + ' 句）'; }
    } else if (size === 7) {
      if (n === 4) { key = 'qijue'; label = '七言绝句'; }
      else if (n === 8) { key = 'qilv'; label = '七言律诗'; }
      else { key = 'qi'; label = '七言古诗（' + n + ' 句）'; }
    } else if (n === 1) { key = 'free'; label = '单句'; }
    return { key: key, label: label, size: size, n: n, mixed: Object.keys(counter).length > 1 };
  }

  function mark(sym) { return sym; }

  function meterCheck(lines, bookKey) {
    var form = detectForm(lines);
    var out = { form: form, items: [], templates: [], best: null };
    if (form.key !== 'wujue' && form.key !== 'qijue' && form.key !== 'wulv' && form.key !== 'qilv') {
      if (form.mixed) out.items.push({ level: 'warn', msg: '各句字数不一（' + form.label + '），按自由诗处理，不套近体谱式。' });
      else if (form.size === 5 || form.size === 7) {
        out.items.push({ level: 'warn', msg: '句数为 ' + form.n + '，非绝句（4 句）或律诗（8 句），仅作平仄提示，不套谱式。' });
      } else {
        out.items.push({ level: 'warn', msg: '当前为' + form.label + '，不做近体格律比对。' });
      }
      return out;
    }
    var kind = (form.key === 'wujue' || form.key === 'wulv') ? 'wu' : 'qi';
    var need = form.key === 'wujue' || form.key === 'qijue' ? 4 : 8;
    var tpls = TEMPLATES[kind];
    var names = Object.keys(tpls);
    var results = names.map(function (name) {
      var tpl = tpls[name];
      var full = [];
      for (var i = 0; i < need; i++) full.push(tpl[i % 4]);
      var bad = [], score = 0, missing = 0;
      for (var j = 0; j < need; j++) {
        var line = lines[j];
        if (!line || !line.chars.length) { missing++; continue; }
        var m = matchTemplate(line, full[j]);
        if (!m) { score += 99; bad.push({ line: j, pos: -1, msg: '字数不合（应为 ' + full[j].length + ' 字）' }); continue; }
        score += m.score;
        m.bad.forEach(function (b) {
          bad.push({
            line: j, pos: b.pos, loose: b.loose,
            msg: '第 ' + (j + 1) + ' 句第 ' + (b.pos + 1) + ' 字「' + line.chars[b.pos].ch + '」宜' + b.want +
                 '（现读' + (b.got === '?' ? '未收' : b.got) + '）' + (b.loose ? '（一三五不论，可不改）' : '')
          });
        });
      }
      return { name: name, tpl: full, score: score + missing * 99, bad: bad };
    });
    results.sort(function (a, b) { return a.score - b.score; });
    var best = results[0];
    out.best = best;
    out.templates = results;

    var hard = best.bad.filter(function (b) { return !b.loose && b.pos >= 0; });
    if (best.score === 0) out.items.push({ level: 'ok', summary: true, msg: '合「' + best.name + '」谱式，未见出律。' });
    else {
      out.items.push({ level: 'warn', summary: true, msg: '最接近「' + best.name + '」谱式，有 ' + best.bad.length + ' 处偏差（' + hard.length + ' 处须改）。' });
      best.bad.slice(0, 12).forEach(function (b) {
        out.items.push({ level: b.loose ? 'warn' : 'err', msg: b.msg });
      });
    }

    // 孤平 / 三平调 / 三仄尾
    lines.forEach(function (line, i) {
      var s = line.chars.map(function (c) { return c.pz === '平仄' ? '平' : c.pz; });
      var n = s.length;
      if (n < 5) return;
      var tail = s.slice(-3).join('');
      var isRhymeLine = (i % 2 === 1);
      var pingCount = s.slice(0, n - 1).filter(function (x) { return x === '平'; }).length;
      if (isRhymeLine && pingCount === 1) {
        out.items.push({ level: 'err', msg: '第 ' + (i + 1) + ' 句除韵脚外仅一平声，犯「孤平」。' });
      }
      if (!isRhymeLine && tail === '平平平') {
        out.items.push({ level: 'err', msg: '第 ' + (i + 1) + ' 句末三字皆平，犯「三平调」。' });
      }
      if (!isRhymeLine && tail === '仄仄仄') {
        out.items.push({ level: 'warn', msg: '第 ' + (i + 1) + ' 句末三字皆仄（三仄尾），古体常见，近体中宜避。' });
      }
    });

    // 粘对
    function secondTone(i) {
      var l = lines[i];
      if (!l || l.chars.length < 2) return null;
      var pz = l.chars[1].pz;
      return pz === '平' ? '平' : (pz === '仄' ? '仄' : null);
    }
    for (var k = 0; k + 1 < need; k += 2) {
      var a = secondTone(k), b = secondTone(k + 1);
      if (a && b && a === b) out.items.push({ level: 'err', msg: '第 ' + (k + 1) + '、' + (k + 2) + ' 句第二字同为' + a + '，「失对」。' });
      var next = secondTone(k + 2);
      if (b && next && b !== next) out.items.push({ level: 'warn', msg: '第 ' + (k + 2) + '、' + (k + 3) + ' 句第二字平仄不同，「失粘」。' });
    }
    if (need === 8) {
      out.items.push({ level: 'warn', msg: '律诗颔联（3、4 句）与颈联（5、6 句）宜对仗。' });
    }
    out.items.push({ level: 'warn', summary: true, msg: '注：古绝、乐府与古体本不拘近体格律（如《静夜思》），以上仅供打磨时参考。' });
    return out;
  }

  /* ---------------- 候选推荐 ---------------- */
  /** 取某韵部候选字，可按意象关键字过滤（用词库反查） */
  function rhymeCandidates(groupName, bookKey, filter, toneFilter, extraLex) {
    var chars = groupChars(groupName, bookKey);
    var out = chars.map(function (c) {
      var info = charInfo(c, bookKey);
      return { ch: c, pz: info.tones.length > 1 ? '平仄' : info.tones[0], src: '' };
    });
    if (toneFilter) {
      out = out.filter(function (o) { return o.pz.indexOf(toneFilter) >= 0; });
    }
    var kw = (filter || '').trim();
    if (kw) {
      var hit = {}, order = [];
      collectWords(extraLex).forEach(function (w) {
        if (w.word.indexOf(kw) < 0) return;
        var last = w.word[w.word.length - 1];
        if (!inRhyme(last, groupName, bookKey)) return;
        if (!hit[last]) { hit[last] = []; order.push(last); }
        if (hit[last].indexOf(w.word) < 0) hit[last].push(w.word);
      });
      var matched = order.map(function (c) {
        return { ch: c, pz: charInfo(c, bookKey).tones.length > 1 ? '平仄' : charInfo(c, bookKey).tones[0], src: hit[c].slice(0, 3).join('、') };
      });
      if (matched.length) return { matched: matched, rest: out.filter(function (o) { return hit[o.ch] ? false : true; }) };
      return { matched: [], rest: out };
    }
    return { matched: [], rest: out };
  }

  function collectWords(extra) {
    var arr = [], seen = {};
    (root.LEXICON || []).forEach(function (g) {
      g.words.forEach(function (w) {
        if (seen[w]) return;
        seen[w] = 1;
        arr.push({ word: w, cat: g.cat });
      });
    });
    (extra || []).forEach(function (w) {
      if (seen[w]) return;
      seen[w] = 1;
      arr.push({ word: w, cat: '我的词库' });
    });
    return arr;
  }

  /** 合韵词组：末字属于该韵部的词条 */
  function wordCandidates(groupName, bookKey, filter, cat, extraLex) {
    if (!groupName) return [];
    var all = collectWords(extraLex);
    var kw = (filter || '').trim();
    return all.filter(function (w) {
      var last = w.word[w.word.length - 1];
      if (!CJK.test(last)) return false;
      if (!inRhyme(last, groupName, bookKey)) return false;
      if (cat && w.cat !== cat) return false;
      if (kw && w.word.indexOf(kw) < 0 && w.cat.indexOf(kw) < 0) return false;
      return true;
    });
  }

  root.PoemCore = {
    clean: clean,
    uniq: uniq,
    charInfo: charInfo,
    pingze: pingze,
    rhymeOf: rhymeOf,
    inRhyme: inRhyme,
    groupChars: groupChars,
    allGroups: allGroups,
    parseLines: parseLines,
    stripPunct: stripPunct,
    analyzeLine: analyzeLine,
    analyze: analyze,
    meterCheck: meterCheck,
    detectForm: detectForm,
    rhymeCandidates: rhymeCandidates,
    wordCandidates: wordCandidates,
    collectWords: collectWords,
    TEMPLATES: TEMPLATES
  };
})(window);
