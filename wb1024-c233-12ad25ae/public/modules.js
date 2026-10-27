/* ===== 宝贝升级乐园 · 功能模块 modules.js =====
   字母乐园 / 大文豪 / 诗仙花园 / 数字小分队 / 小小外交官 / 逻辑挑战 / 闯关冒险
*/
(function () {
  'use strict';
  var $ = APP.$, $$ = APP.$$, esc = APP.esc, shuffle = APP.shuffle, rnd = APP.rnd, pick = APP.pick;
  var S = function () { return APP.state; };

  /* ---------- 公共：拼音注音 ---------- */
  function isHan(c) { return /[\u4e00-\u9fa5]/.test(c); }
  function rubyHTML(t, p) {
    var toks = (p || '').trim().split(/\s+/).filter(Boolean);
    var k = 0, out = '';
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (isHan(c)) { out += '<ruby>' + esc(c) + '<rt>' + esc(toks[k++] || '') + '</rt></ruby>'; }
      else { out += '<span style="opacity:.65">' + esc(c) + '</span>'; }
    }
    return out;
  }
  function speakBtn(text, lang, label, cls) {
    return '<button class="btn ' + (cls || 'blue') + ' sm spk" data-t="' + esc(text) + '" data-l="' + (lang || 'zh-CN') + '">🔊 ' + (label || '朗读') + '</button>';
  }
  function bindSpeak(root) {
    $$('.spk', root).forEach(function (b) {
      b.onclick = function (e) { e.stopPropagation(); APP.speak(b.dataset.t, b.dataset.l); };
    });
  }
  function gradeTabs(active, onPick) {
    var wrap = document.createElement('div');
    wrap.className = 'tabs';
    for (var g = 1; g <= 6; g++) {
      (function (g) {
        var b = document.createElement('button');
        b.className = 'tab' + (g === active ? ' active' : '');
        b.textContent = g + ' 年级';
        b.onclick = function () { onPick(g); };
        wrap.appendChild(b);
      })(g);
    }
    return wrap;
  }
  function head(title, sub, backHash) {
    return '<div class="page-head">' +
      (backHash ? '<button class="btn ghost sm" data-back="' + esc(backHash) + '">← 返回</button>' : '') +
      '<h1>' + title + '</h1><span class="page-sub">' + esc(sub || '') + '</span></div>';
  }
  function bindBack(root) {
    $$('[data-back]', root).forEach(function (b) { b.onclick = function () { APP.go(b.dataset.back); }; });
  }
  function demoNote() { return '<div class="note">示例内容用于功能演示，正式学习请以学校正版教材为准。</div>'; }

  /* ---------- 公共：答题引擎 ---------- */
  function makeQuiz(host, cfg) {
    var idx = 0, score = 0, streak = 0, locked = false;
    var box = document.createElement('div');
    box.className = 'q-card';
    host.appendChild(box);

    function finish() {
      box.innerHTML = '<div style="text-align:center;padding:10px">' +
        '<div style="font-size:56px">' + (score >= cfg.total * 0.8 ? '🏆' : score >= cfg.total * 0.5 ? '💪' : '🌱') + '</div>' +
        '<h2>本轮结束：答对 ' + score + ' / ' + cfg.total + '</h2>' +
        '<p class="page-sub">' + (score >= cfg.total * 0.8 ? '太棒啦，你是小学霸！' : '继续加油，多练几次就熟啦！') + '</p>' +
        '<div class="btn-row" style="justify-content:center;margin-top:12px">' +
        '<button class="btn primary" id="qAgain">🔁 再来一轮</button>' +
        (cfg.backHash ? '<button class="btn ghost" data-back="' + esc(cfg.backHash) + '">← 返回</button>' : '') +
        '</div></div>';
      bindBack(box);
      $('#qAgain', box).onclick = function () { idx = 0; score = 0; streak = 0; render(); };
      cfg.onFinish && cfg.onFinish(score, cfg.total);
    }

    function render() {
      if (idx >= cfg.total) { finish(); return; }
      locked = false;
      var q = cfg.next(idx);
      box.innerHTML =
        '<div class="q-meta"><span class="pill">第 ' + (idx + 1) + ' / ' + cfg.total + ' 题</span>' +
        '<span class="pill g">✅ 答对 ' + score + '</span><span class="pill y">🔥 连对 ' + streak + '</span></div>' +
        '<div class="q-title">' + (q.html || esc(q.q)) + '</div>' +
        (q.speak ? '<div style="text-align:center;margin-top:6px">' + speakBtn(q.speak, q.speakLang || 'zh-CN', '再听一遍') + '</div>' : '') +
        '<div class="opts"></div><div class="feedback"></div>' +
        '<div class="btn-row" style="justify-content:center;margin-top:12px"><button class="btn primary" id="qNext" style="display:none">下一题 →</button></div>';
      var optsEl = $('.opts', box), fb = $('.feedback', box), nextBtn = $('#qNext', box);
      bindSpeak(box);
      if (q.speak && q.autoSpeak !== false) setTimeout(function () { APP.speak(q.speak, q.speakLang || 'zh-CN'); }, 260);

      q.opts.forEach(function (o, i) {
        var b = document.createElement('button');
        b.className = 'opt'; b.innerHTML = esc(o);
        b.onclick = function () {
          if (locked) return; locked = true;
          var ok = i === q.ans;
          if (ok) {
            b.classList.add('right'); score++; streak++;
            fb.className = 'feedback ok'; fb.textContent = '答对啦！' + (q.tip ? '💡 ' + q.tip : '');
            APP.awardStars(1, '答对一题', b);
          } else {
            b.classList.add('wrong');
            $$('.opt', box)[q.ans].classList.add('right');
            streak = 0;
            fb.className = 'feedback no'; fb.textContent = '不对哦，正确答案是「' + q.opts[q.ans] + '」' + (q.tip ? ' 💡 ' + q.tip : '');
          }
          cfg.onResult && cfg.onResult(ok, q, streak);
          idx++;
          if (ok) { setTimeout(function () { render(); }, 1000); }
          else { nextBtn.style.display = ''; nextBtn.onclick = render; }
        };
        optsEl.appendChild(b);
      });
    }
    render();
    return { restart: function () { idx = 0; score = 0; streak = 0; render(); } };
  }

  /* ================= 1. 字母乐园 ================= */
  APP.registerModule({
    id: 'letters', hash: '/字母乐园', name: '字母乐园', short: '字母', icon: '🔤', order: 1,
    desc: 'ABC 发音 · 大小写配对',
    render: function (view, params) {
      var tab = params[0] || '卡片';
      var L = DATA.letters(), pg = S().progress.letters;
      var html = head('🔤 字母乐园', '点一点，听发音；玩配对，得星星');
      html += '<div class="tabs"><button class="tab' + (tab === '卡片' ? ' active' : '') + '" data-t="卡片">🃏 字母卡片</button>' +
        '<button class="tab' + (tab === '配对' ? ' active' : '') + '" data-t="配对">🎯 大小写配对</button>' +
        '<span class="pill g" style="align-self:center">已掌握 ' + pg.mastered.length + '/26</span></div>';
      html += '<div id="lBody"></div>';
      view.innerHTML = html;
      $$('.tab', view).forEach(function (b) { b.onclick = function () { APP.go('/字母乐园/' + b.dataset.t); }; });

      var body = $('#lBody', view);
      if (tab === '配对') { renderMatch(body); } else { renderCards(body); }

      function renderCards(host) {
        var h = '<div class="grid g4">';
        L.forEach(function (o) {
          var done = pg.mastered.indexOf(o.u) >= 0;
          h += '<div class="tile' + (done ? ' done' : '') + '" data-u="' + o.u + '">' +
            '<div class="big" style="color:#7B5CD6">' + o.u + ' ' + o.l + '</div>' +
            '<div style="font-size:24px">' + o.emoji + '</div>' +
            '<div class="sm">' + esc(o.word) + ' ' + esc(o.zh) + '</div>' +
            (done ? '<div class="sm" style="color:#2E8C63">✓ 已掌握</div>' : '') + '</div>';
        });
        h += '</div>';
        host.innerHTML = h;
        $$('.tile', host).forEach(function (t) {
          t.onclick = function () {
            var o = L.filter(function (x) { return x.u === t.dataset.u; })[0];
            APP.speak(o.u + '. ' + o.word, 'en-US');
            if (APP.uniqPush(pg.mastered, o.u)) {
              t.classList.add('done');
              APP.awardStars(1, '学会字母 ' + o.u, t);
              APP.save();
            }
          };
        });
      }

      function renderMatch(host) {
        var set = shuffle(L).slice(0, 6);
        var left = shuffle(set), right = shuffle(set), sel = null, done = 0;
        var h = '<div class="card"><p class="page-sub">把左边的<b>大写字母</b>和右边的<b>小写字母</b>配成一对，全部配对成功有大奖励！</p>' +
          '<div class="match-wrap"><div class="match-col" id="colL"></div><div class="match-col" id="colR"></div></div>' +
          '<div class="btn-row" style="margin-top:14px"><button class="btn ghost" id="mAgain">🔁 换一组</button></div></div>';
        host.innerHTML = h;
        var cl = $('#colL', host), cr = $('#colR', host);
        left.forEach(function (o) { var d = document.createElement('button'); d.className = 'mtile'; d.textContent = o.u; d.dataset.u = o.u; d.dataset.side = 'L'; cl.appendChild(d); });
        right.forEach(function (o) { var d = document.createElement('button'); d.className = 'mtile'; d.textContent = o.l; d.dataset.u = o.u; d.dataset.side = 'R'; cr.appendChild(d); });
        $$('.mtile', host).forEach(function (d) {
          d.onclick = function () {
            APP.speak(d.textContent, 'en-US');
            if (!sel) { sel = d; d.classList.add('sel'); return; }
            if (sel === d) { d.classList.remove('sel'); sel = null; return; }
            if (sel.dataset.side === d.dataset.side) { sel.classList.remove('sel'); sel = d; d.classList.add('sel'); return; }
            if (sel.dataset.u === d.dataset.u) {
              sel.classList.add('done'); d.classList.add('done'); sel.classList.remove('sel'); sel = null; done++;
              APP.awardStars(1, '配对成功', d);
              if (done === set.length) {
                APP.awardStars(5, '全部配对完成！', d); APP.confetti(40);
                var pgl = S().progress.letters; pgl.best = Math.max(pgl.best || 0, set.length); APP.save();
                setTimeout(function () { renderMatch(host); }, 1400);
              }
            } else {
              var a = sel; a.classList.add('bad'); d.classList.add('bad');
              setTimeout(function () { a.classList.remove('bad', 'sel'); d.classList.remove('bad'); }, 420);
              sel = null;
            }
          };
        });
        $('#mAgain', host).onclick = function () { renderMatch(host); };
      }
    }
  });

  /* ================= 2. 大文豪 ================= */
  APP.registerModule({
    id: 'reading', hash: '/大文豪', name: '大文豪', short: '课文', icon: '📖', order: 2,
    desc: '课文朗读 · 生字 · 连词成句',
    render: function (view, params) {
      var g = parseInt(params[0], 10); if (!(g >= 1 && g <= 6)) g = 1;
      var tid = params[1];
      var list = DATA.readingGrade(g);
      if (tid) { var t = list.filter(function (x) { return x.id === tid; })[0]; if (t) { detail(view, g, t); return; } }

      view.innerHTML = head('📖 大文豪', '选一篇课文，读一读、认生字') + '<div id="tabsHost"></div><div id="list"></div>' + demoNote();
      $('#tabsHost', view).appendChild(gradeTabs(g, function (n) { APP.go('/大文豪/' + n); }));
      var host = $('#list', view);
      if (!list.length) { host.innerHTML = '<div class="empty"><div class="e-ico">📚</div>这个年级还没有内容，可在「设置 → 内容管理」添加。</div>'; return; }
      var pg = S().progress.reading;
      host.innerHTML = list.map(function (x) {
        var done = pg.read.indexOf(x.id) >= 0;
        return '<div class="list-item" data-id="' + esc(x.id) + '"><span class="li-ico">' + (done ? '✅' : '📄') + '</span>' +
          '<div class="li-main"><div class="li-title">' + esc(x.title) + '</div>' +
          '<div class="li-sub">' + (x.lines[0] ? esc(x.lines[0].t) : '') + '</div></div><span class="pill">进入 ›</span></div>';
      }).join('');
      $$('.list-item', host).forEach(function (el) { el.onclick = function () { APP.go('/大文豪/' + g + '/' + el.dataset.id); }; });

      function detail(view, g, t) {
        var pg = S().progress.reading;
        var full = t.lines.map(function (l) { return l.t; }).join('');
        var h = head('📖 ' + esc(t.title), g + ' 年级 · 示例课文', '/大文豪/' + g);
        h += '<div class="card"><div class="btn-row" style="margin-bottom:10px">' + speakBtn(full, 'zh-CN', '朗读全文', 'green') + '</div>';
        h += '<div class="ruby-text">' + t.lines.map(function (l) { return '<div style="margin-bottom:6px">' + rubyHTML(l.t, l.p) + ' <button class="btn ghost sm spk" data-t="' + esc(l.t) + '" data-l="zh-CN" style="vertical-align:middle">🔊</button></div>'; }).join('') + '</div></div>';

        h += '<div class="card" style="margin-top:14px"><h3>⭐ 本课重点</h3>';
        h += '<div class="grid g4" style="margin:8px 0">' + (t.chars || []).map(function (c) {
          return '<div class="tile spk" data-t="' + esc(c.c) + '" data-l="zh-CN"><div class="big">' + esc(c.c) + '</div><div class="sm">' + esc(c.p) + '</div><div class="sm">' + esc(c.w) + '</div></div>';
        }).join('') + '</div>';
        h += '<p><b>重点词语：</b>' + (t.words || []).map(function (w) { return '<span class="pill p" style="margin:2px">' + esc(w) + '</span>'; }).join('') + '</p>';
        h += '<p><b>句式练习：</b><span class="pill b">' + esc(t.pattern || '') + '</span></p></div>';

        h += '<div class="card" style="margin-top:14px"><h3>🎮 小游戏</h3><div class="tabs">' +
          '<button class="tab active" data-gm="find">🔍 找生字</button>' +
          '<button class="tab" data-gm="order">🧩 连词成句</button></div><div id="gameHost"></div></div>';
        view.innerHTML = h;
        bindBack(view); bindSpeak(view);

        if (APP.uniqPush(pg.read, t.id)) { APP.awardStars(2, '读完《' + t.title + '》'); APP.save(); }

        var gh = $('#gameHost', view);
        $$('[data-gm]', view).forEach(function (b) {
          b.onclick = function () {
            $$('[data-gm]', view).forEach(function (x) { x.classList.remove('active'); });
            b.classList.add('active');
            b.dataset.gm === 'find' ? gameFind(gh, t) : gameOrder(gh, t);
          };
        });
        gameFind(gh, t);
      }

      function gameFind(host, t) {
        host.innerHTML = '';
        var chars = (t.chars || []); if (chars.length < 2) { host.innerHTML = '<p class="page-sub">这篇课文还没有生字数据。</p>'; return; }
        var pool = '春草花鸟早书师家秋果梨摘棵浇护校银扇飘落操赛参虽乡缓映捉蚁群搬团静透页翻封梦努希毕即却招戴仿迷'.split('');
        makeQuiz(host, {
          total: Math.min(5, chars.length + 2),
          next: function () {
            var c = pick(chars);
            var wrongs = shuffle(pool.filter(function (x) { return x !== c.c; })).slice(0, 3);
            var opts = shuffle([c.c].concat(wrongs));
            return { q: '哪个是「' + c.p + '」（' + c.w + '）里的字？', opts: opts, ans: opts.indexOf(c.c), tip: c.w, speak: c.w, speakLang: 'zh-CN' };
          },
          onResult: function (ok) { var p = S().progress.reading; p.total++; if (ok) p.correct++; APP.save(); },
          onFinish: function (s, tt) { if (s === tt) { APP.awardStars(3, '找生字全对！'); APP.confetti(30); } }
        });
      }
      function gameOrder(host, t) {
        var sents = t.sentences || [];
        if (!sents.length) { host.innerHTML = '<p class="page-sub">这篇课文还没有连词成句数据。</p>'; return; }
        var si = 0;
        draw();
        function draw() {
          var target = sents[si % sents.length];
          var pool = shuffle(target);
          var picked = [];
          host.innerHTML = '<p class="page-sub">按顺序点击词语，组成一句通顺的话：</p>' +
            '<div class="q-card" style="margin-top:8px"><div id="ansLine" style="min-height:54px;font-size:20px;font-weight:800;border-bottom:3px dashed #EFE7FA;padding:8px 4px"></div>' +
            '<div class="opts" id="tokens" style="grid-template-columns:repeat(auto-fit,minmax(84px,1fr))"></div>' +
            '<div class="feedback"></div>' +
            '<div class="btn-row" style="margin-top:12px"><button class="btn ghost" id="oReset">↺ 重来</button><button class="btn primary" id="oCheck">✔ 检查</button></div></div>';
          var tk = $('#tokens', host), line = $('#ansLine', host), fb = $('.feedback', host);
          pool.forEach(function (w, i) {
            var b = document.createElement('button'); b.className = 'opt'; b.textContent = w; b.dataset.i = i;
            b.onclick = function () { if (b.disabled) return; b.disabled = true; b.style.opacity = '.35'; picked.push({ w: w, el: b }); line.textContent = picked.map(function (x) { return x.w; }).join(' '); };
            tk.appendChild(b);
          });
          $('#oReset', host).onclick = draw;
          $('#oCheck', host).onclick = function () {
            if (picked.length !== target.length) { fb.className = 'feedback no'; fb.textContent = '还有词语没有用上哦～'; return; }
            var ok = picked.map(function (x) { return x.w; }).join('') === target.join('');
            var p = S().progress.reading; p.total++; if (ok) p.correct++; APP.save();
            if (ok) {
              fb.className = 'feedback ok'; fb.textContent = '完全正确！这句话是：' + target.join('');
              APP.speak(target.join(''), 'zh-CN'); APP.awardStars(2, '连词成句正确'); APP.confetti(20);
              si++; setTimeout(draw, 1800);
            } else { fb.className = 'feedback no'; fb.textContent = '顺序不太对，正确的是：' + target.join(' '); }
          };
        }
      }
    }
  });

  /* ================= 3. 诗仙花园（人教版古诗文 · 日积月累 · 词语表） ================= */
  function cnStatLine() {
    var p = S().progress.cn;
    var rate = p.total ? Math.round(p.correct / p.total * 100) : 0;
    return '累计答对 ' + p.correct + ' 题 · 正确率 ' + rate + '%';
  }
  /* 示例库里的拼音与赏析，用来给同名古诗做注音增强 */
  var _cnEx = null;
  function cnKey(s) { return String(s || '').replace(/[（(][^）)]*[）)]/g, '').trim(); }
  function cnExtra(name) {
    if (!_cnEx) {
      _cnEx = {};
      try {
        DATA.allPoems().forEach(function (p) {
          var k = cnKey(p.title);
          if (k && !_cnEx[k]) _cnEx[k] = p;
        });
      } catch (e) { _cnEx = {}; }
    }
    return _cnEx[cnKey(name)] || null;
  }
  function hanOnly(s) { return String(s).replace(/[^\u4e00-\u9fa5]/g, ''); }

  /* 统一处理一道语文题的作答结果 */
  function handleCnResult(ok, q, g, kp) {
    var p = S().progress.cn;
    p.total++; if (ok) p.correct++;
    CNBANK.recordKP(q.kpid, ok);
    if (ok) {
      if (CNBANK.removeWrong(q.qid)) {
        p.fixed = (p.fixed || 0) + 1;
        APP.toast('订正成功，已移出错题本 🧹', 'good');
      }
    } else {
      CNBANK.addWrong(q, { g: g, kpName: kp ? kp.name : '', vol: kp ? kp._vol : '' });
    }
    APP.save(); APP.checkBadges();
  }

  APP.registerModule({
    id: 'poems', hash: '/诗仙花园', name: '诗仙花园', short: '语文', icon: '🎋', order: 3,
    desc: '人教版古诗文 · 日积月累',
    render: function (view, params) {
      if (params[0] === 'wrong') { renderCnWrong(view); return; }
      var g = parseInt(params[0], 10); if (!(g >= 1 && g <= 6)) g = 1;
      var kind = params[1], id = params[2];
      if (kind === 'kp' && id) { renderCnKP(view, g, id); return; }
      if (kind === 'mix') { renderCnMix(view, g); return; }
      renderCnGrade(view, g);
    }
  });

  /* ---------- 年级页：上册 / 下册 ---------- */
  function renderCnGrade(view, g) {
    var pp = S().progress.poems;
    var wrongN = CNBANK.wrongList().length;
    var m = CNBANK.meta();

    var h = head('🎋 诗仙花园', cnStatLine() + ' · 会背 ' + pp.recited.length + ' 篇');
    h += '<div id="tabsHost"></div>';
    h += '<div class="grid g2">' +
      '<div class="card go-card" data-go="/诗仙花园/' + g + '/mix" style="background:#F1EAFF">' +
      '<div style="display:flex;align-items:center;gap:12px"><span style="font-size:32px">🎯</span>' +
      '<div><div style="font-weight:900;font-size:18px">综合闯关</div>' +
      '<div class="page-sub">本年级古诗文 + 日积月累混合出题</div></div></div></div>' +
      '<div class="card go-card" data-go="/诗仙花园/wrong" style="background:' + (wrongN ? '#FFE6F0' : '#E6FBF0') + '">' +
      '<div style="display:flex;align-items:center;gap:12px"><span style="font-size:32px">📕</span>' +
      '<div><div style="font-weight:900;font-size:18px">语文错题本' + (wrongN ? ' · ' + wrongN : '') + '</div>' +
      '<div class="page-sub">' + (wrongN ? '有 ' + wrongN + ' 道题等你订正' : '暂时没有错题，真棒！') + '</div></div></div></div>' +
      '</div>';
    h += '<div id="cnVols">' + loadingCard('正在加载语文题库…') + '</div>';
    h += '<div class="note" style="margin-top:18px">📚 语文题库依据<b>重庆南岸区 · 人教版小学语文 1-6 年级教材整理</b>制作，共 ' +
      (m.poemCount || 0) + ' 篇必背古诗文 / ' + (m.kpTotal || 0) + ' 个知识点；古诗文正文经人工校勘。正式学习请以学校发放的正版教材为准。</div>';

    view.innerHTML = h;
    $('#tabsHost', view).appendChild(gradeTabs(g, function (n) { APP.go('/诗仙花园/' + n); }));
    $$('[data-go]', view).forEach(function (el) { el.onclick = function () { APP.go(el.dataset.go); }; });

    CNBANK.load(g, function (data) {
      var host = $('#cnVols', view); if (!host) return;
      if (!data) { host.innerHTML = bankFailCard(); return; }
      host.innerHTML = (data.vols || []).map(function (v) { return cnVolHTML(v); }).join('');
      $$('[data-kp]', host).forEach(function (el) {
        el.onclick = function () { APP.go('/诗仙花园/' + g + '/kp/' + el.dataset.kp); };
      });
    });
  }

  function cnVolHTML(v) {
    var pp = S().progress.poems;
    var poems = [], others = [], doneN = 0;
    (v.kps || []).forEach(function (k) {
      if (CNBANK.mastered(k.id)) doneN++;
      (k.type === 'poem' ? poems : others).push(k);
    });

    var h = '<h2 style="margin-top:22px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
      (VOL_ICO[v.term] || '📘') + ' ' + esc(v.vol) +
      '<span class="pill b">' + poems.length + ' 篇古诗文</span>' +
      '<span class="pill g">🏅 已掌握 ' + doneN + '</span></h2>';

    h += '<div class="grid g2">';
    poems.forEach(function (k) {
      var rec = pp.recited.indexOf(k.id) >= 0;
      var ok = CNBANK.mastered(k.id);
      var st = CNBANK.kpStat(k.id);
      var first = String((k.lines && k.lines[0]) || '');
      h += '<div class="card kp-card" data-kp="' + esc(k.id) + '">' +
        '<div style="display:flex;align-items:flex-start;gap:10px">' +
        '<span style="font-size:26px;line-height:1.1">' + (ok ? '🏅' : (k.kind === 'prose' ? '📖' : '📜')) + '</span>' +
        '<div style="flex:1;min-width:0"><div style="font-weight:900;font-size:17px;line-height:1.4">' + esc(k.name) + '</div>' +
        '<div class="page-sub">' + esc((k.dynasty ? k.dynasty + '·' : '') + (k.author || '')) + '</div></div>' +
        (rec ? '<span class="pill y">✨会背</span>' : '') + '</div>' +
        '<div class="page-sub" style="margin-top:8px">' + esc(first.length > 16 ? first.slice(0, 16) + '…' : first) + '</div>' +
        '<div class="page-sub" style="margin-top:4px">' +
        (st.t ? '已练 ' + st.t + ' 题 · 正确率 ' + Math.round(st.c / st.t * 100) + '%' : '共 ' + ((k.qs && k.qs.length) || k.n || 0) + ' 题 · 还没练过') +
        '</div></div>';
    });
    h += '</div>';

    if (others.length) {
      h += '<div class="grid g2" style="margin-top:12px">';
      others.forEach(function (k) {
        var ok = CNBANK.mastered(k.id);
        var isAcc = k.type === 'accum';
        var cnt = isAcc ? ((k.items || []).length + ' 条')
          : (((k.words || []).length || (k.chars || []).length) + ((k.words || []).length ? ' 个词语' : ' 个生字'));
        h += '<div class="card kp-card" data-kp="' + esc(k.id) + '" style="background:' + (isAcc ? '#FFF6D9' : '#E4F3FF') + '">' +
          '<div style="display:flex;align-items:center;gap:10px">' +
          '<span style="font-size:26px">' + (ok ? '🏅' : (isAcc ? '🗓️' : '✍️')) + '</span>' +
          '<div style="font-weight:900;font-size:17px">' + esc(k.name) + '</div></div>' +
          '<div class="page-sub" style="margin-top:8px">' + cnt + ' · ' + (isAcc ? '补全闯关' : '听写练习') + '</div></div>';
      });
      h += '</div>';
    }
    return h;
  }

  /* ---------- 知识点页：分派 ---------- */
  function renderCnKP(view, g, kpid) {
    var back = '/诗仙花园/' + g;
    var lite = CNBANK.catalogKP(g, kpid);
    view.innerHTML = head('🎋 ' + esc(lite ? lite.name : '语文'), lite ? esc(lite.vol) : '', back) + loadingCard();
    bindBack(view);

    CNBANK.load(g, function (data) {
      if (!data) { view.innerHTML = head('🎋 语文', '', back) + bankFailCard(); bindBack(view); return; }
      var kp = CNBANK.findKP(g, kpid);
      if (!kp) { view.innerHTML = head('🎋 语文', '', back) + '<div class="card"><h3>没找到这个内容</h3></div>'; bindBack(view); return; }
      if (kp.type === 'accum') drawCnAccum(view, g, kp, back);
      else if (kp.type === 'vocab') drawCnVocab(view, g, kp, back);
      else drawCnPoem(view, g, kp, back);
    });
  }

  function cnMasteryPills(kp) {
    var st = CNBANK.kpStat(kp.id);
    var rate = st.t ? Math.round(st.c / st.t * 100) : 0;
    return '<span class="pill g">已练 ' + st.t + ' 题</span>' +
      '<span class="pill y">正确率 ' + rate + '%</span>' +
      (CNBANK.mastered(kp.id) ? '<span class="pill p">🏅 已掌握</span>' : '<span class="pill">练满 8 题且正确率 80% 即掌握</span>');
  }

  /* ---------- 古诗文：全文 + 背诵闯关 ---------- */
  function drawCnPoem(view, g, kp, back) {
    var pp = S().progress.poems;
    var lines = kp.lines || [];
    var full = lines.join('');
    var rec = pp.recited.indexOf(kp.id) >= 0;
    var ex = cnExtra(kp.name);
    var useRuby = !!(ex && hanOnly(full) === hanOnly(ex.lines.map(function (l) { return l.t; }).join('')));
    var isProse = kp.kind === 'prose';

    var h = head('🎋 ' + esc(kp.name),
      esc((kp.dynasty ? '［' + kp.dynasty + '］' : '') + (kp.author || '') + ' · ' + (kp._vol || '')), back);

    h += '<div class="card"><div class="btn-row" style="margin-bottom:12px;justify-content:center">' +
      speakBtn(kp.name + '，' + (kp.author || '') + '。' + full, 'zh-CN', '朗读全文', 'green') +
      '<button class="btn ' + (rec ? 'ghost' : 'yellow') + '" id="btnRecite">' + (rec ? '✨ 已标记会背' : '🎤 我会背了 (+3⭐)') + '</button></div>';

    if (useRuby) {
      h += '<div class="ruby-text poem-body">' + ex.lines.map(function (l) {
        return '<div style="margin-bottom:8px">' + rubyHTML(l.t, l.p) + '</div>';
      }).join('') + '</div>';
    } else {
      h += '<div class="poem-body" style="font-size:' + (isProse ? 18 : 22) + 'px;line-height:2.1;font-weight:800;text-align:' + (isProse ? 'left' : 'center') + '">' +
        lines.map(function (l) {
          return '<div style="margin-bottom:8px">' + esc(l) +
            ' <button class="btn ghost sm spk" data-t="' + esc(l) + '" data-l="zh-CN" style="vertical-align:middle">🔊</button></div>';
        }).join('') + '</div>';
    }
    h += '</div>';

    if (ex && ex.note) h += '<div class="card" style="margin-top:14px"><h3>💡 小提示</h3><p>' + esc(ex.note) + '</p></div>';

    var list = CNBANK.drawFrom(kp, 10);
    h += '<div class="card" style="margin-top:14px"><h3>🎯 背诵闯关' + (list.length ? '（本轮 ' + list.length + ' 题）' : '') + '</h3>' +
      '<div class="btn-row" style="margin:8px 0">' + cnMasteryPills(kp) + '</div>' +
      '<div id="cGame"></div></div>';

    view.innerHTML = h;
    bindBack(view); bindSpeak(view);

    if (APP.uniqPush(pp.read, kp.id)) { APP.awardStars(2, '读完《' + kp.name + '》'); APP.save(); APP.checkBadges(); }

    $('#btnRecite', view).onclick = function () {
      if (APP.uniqPush(pp.recited, kp.id)) {
        APP.awardStars(3, '背诵《' + kp.name + '》', this); APP.confetti(26); APP.save(true); APP.route();
      } else APP.toast('已经标记过啦 ✨');
    };

    if (!list.length) { $('#cGame', view).innerHTML = '<p class="page-sub">这一篇暂时没有闯关题，多读几遍背下来吧～</p>'; return; }
    makeQuiz($('#cGame', view), {
      total: list.length, backHash: back,
      next: function (i) { return list[i]; },
      onResult: function (ok, q) { handleCnResult(ok, q, g, kp); },
      onFinish: function (s, t) {
        if (t && s >= Math.ceil(t * 0.8)) { APP.awardStars(5, '背诵闯关优秀！'); APP.confetti(34); }
        else { APP.toast('答错的题已收进错题本，记得回去订正哦 📕'); }
      }
    });
  }

  /* ---------- 日积月累：条目 + 补全闯关 ---------- */
  function drawCnAccum(view, g, kp, back) {
    var items = kp.items || [];
    var cats = {}, order = [];
    items.forEach(function (it) {
      var c = it.cat || '积累';
      if (!cats[c]) { cats[c] = []; order.push(c); }
      cats[c].push(it.text);
    });

    var h = head('🗓️ ' + esc(kp.name), esc((kp._vol || '') + ' · 共 ' + items.length + ' 条'), back);
    h += order.map(function (c) {
      return '<div class="card" style="margin-top:14px"><h3>' + esc(c) + '（' + cats[c].length + '）</h3>' +
        cats[c].map(function (t) {
          return '<div class="list-item" style="cursor:default"><span class="li-ico">🔸</span>' +
            '<div class="li-main"><div class="li-title" style="font-size:16.5px;line-height:1.7">' + esc(t) + '</div></div>' +
            '<button class="btn ghost sm spk" data-t="' + esc(t) + '" data-l="zh-CN">🔊</button></div>';
        }).join('') + '</div>';
    }).join('');

    var list = CNBANK.drawFrom(kp, 10);
    h += '<div class="card" style="margin-top:14px"><h3>🎯 补全闯关' + (list.length ? '（本轮 ' + list.length + ' 题）' : '') + '</h3>' +
      '<div class="btn-row" style="margin:8px 0">' + cnMasteryPills(kp) + '</div>' +
      '<div id="cGame"></div></div>';

    view.innerHTML = h;
    bindBack(view); bindSpeak(view);

    if (!list.length) {
      $('#cGame', view).innerHTML = '<p class="page-sub">这一组以词语、成语为主，读一读、记一记就好啦～</p>';
      return;
    }
    makeQuiz($('#cGame', view), {
      total: list.length, backHash: back,
      next: function (i) { return list[i]; },
      onResult: function (ok, q) { handleCnResult(ok, q, g, kp); },
      onFinish: function (s, t) {
        if (t && s >= Math.ceil(t * 0.8)) { APP.awardStars(5, '日积月累闯关优秀！'); APP.confetti(34); }
      }
    });
  }

  /* ---------- 词语表 / 写字表：听写练习 ---------- */
  function drawCnVocab(view, g, kp, back) {
    var words = kp.words || [], chars = kp.chars || [];
    var isChar = !words.length;
    var all = (isChar ? chars : words).slice();
    var unit = isChar ? '生字' : '词语';

    var h = head('✍️ ' + esc(kp.name), esc((kp._vol || '') + ' · 共 ' + all.length + ' 个' + unit), back);
    h += '<div class="card"><h3>🎧 听写练习</h3>' +
      '<p class="page-sub">爸爸妈妈不用念啦——点开始，App 会一个一个读给你听，写完再对答案。</p>' +
      '<div class="btn-row" style="margin:10px 0">' + cnMasteryPills(kp) + '</div>' +
      '<div class="btn-row"><button class="btn primary" id="btnDict">▶️ 开始听写（10 个）</button></div>' +
      '<div id="dictHost"></div></div>';
    h += '<div class="card" style="margin-top:14px"><h3>📋 全部' + unit + '（点一点会读）</h3>' +
      '<div class="grid ' + (isChar ? 'g6' : 'g4') + '" style="margin-top:10px">' +
      all.map(function (w) {
        return '<div class="tile spk" data-t="' + esc(w) + '" data-l="zh-CN"><div class="big" style="font-size:' + (isChar ? 30 : 20) + 'px">' + esc(w) + '</div></div>';
      }).join('') + '</div></div>';

    view.innerHTML = h;
    bindBack(view); bindSpeak(view);

    var dictHost = $('#dictHost', view);
    if (!all.length) { $('#btnDict', view).disabled = true; return; }
    $('#btnDict', view).onclick = startDict;

    function startDict() {
      var pool = shuffle(all.slice()).slice(0, 10);
      var i = 0, right = 0;
      draw();
      function draw() {
        if (i >= pool.length) {
          dictHost.innerHTML = '<div class="q-card" style="margin-top:12px;text-align:center">' +
            '<div style="font-size:52px">' + (right === pool.length ? '🏆' : right >= pool.length * 0.6 ? '💪' : '🌱') + '</div>' +
            '<h3>听写结束：写对 ' + right + ' / ' + pool.length + '</h3>' +
            '<div class="btn-row" style="justify-content:center;margin-top:12px">' +
            '<button class="btn primary" id="dAgain">🔁 再来一组</button></div></div>';
          $('#dAgain', dictHost).onclick = startDict;
          if (right === pool.length) { APP.awardStars(5, '听写全对！'); APP.confetti(34); }
          else if (right) APP.awardStars(2, '完成一组听写');
          APP.save(); APP.checkBadges();
          return;
        }
        var w = pool[i];
        dictHost.innerHTML = '<div class="q-card" style="margin-top:12px">' +
          '<div class="q-meta"><span class="pill">第 ' + (i + 1) + ' / ' + pool.length + ' 个</span>' +
          '<span class="pill g">✅ 写对 ' + right + '</span></div>' +
          '<div style="text-align:center;padding:10px 0">' +
          '<div style="font-size:46px">🎧</div>' +
          '<p class="page-sub">听一听，在本子上写下来</p>' +
          '<div class="btn-row" style="justify-content:center;margin-top:10px">' +
          '<button class="btn blue" id="dPlay">🔊 再听一遍</button>' +
          '<button class="btn yellow" id="dShow">👀 看答案</button></div>' +
          '<div id="dAns" style="font-size:38px;font-weight:900;margin-top:14px;letter-spacing:4px;visibility:hidden">' + esc(w) + '</div>' +
          '<div class="btn-row" id="dJudge" style="justify-content:center;margin-top:12px;display:none">' +
          '<button class="btn green" id="dOk">✅ 我写对了</button>' +
          '<button class="btn ghost" id="dNo">✍️ 写错了，再练</button></div>' +
          '</div></div>';
        APP.speak(w, 'zh-CN');
        $('#dPlay', dictHost).onclick = function () { APP.speak(w, 'zh-CN'); };
        $('#dShow', dictHost).onclick = function () {
          $('#dAns', dictHost).style.visibility = 'visible';
          $('#dJudge', dictHost).style.display = '';
        };
        $('#dOk', dictHost).onclick = function () {
          right++; CNBANK.recordKP(kp.id, true); APP.awardStars(1, '写对一个' + unit, this); i++; draw();
        };
        $('#dNo', dictHost).onclick = function () { CNBANK.recordKP(kp.id, false); i++; draw(); };
      }
    }
  }

  /* ---------- 综合闯关 ---------- */
  function renderCnMix(view, g) {
    var back = '/诗仙花园/' + g;
    view.innerHTML = head('🎯 语文综合闯关', g + ' 年级 · 古诗文 + 日积月累', back) + loadingCard();
    bindBack(view);
    CNBANK.load(g, function (data) {
      if (!data) { view.innerHTML = head('🎯 语文综合闯关', '', back) + bankFailCard(); bindBack(view); return; }
      var list = CNBANK.drawGrade(g, 10);
      if (!list.length) {
        view.innerHTML = head('🎯 语文综合闯关', '', back) + '<div class="card"><h3>这个年级还没有闯关题</h3></div>';
        bindBack(view); return;
      }
      view.innerHTML = head('🎯 语文综合闯关', g + ' 年级 · 本轮 ' + list.length + ' 题', back) +
        '<div class="card"><div id="cGame"></div></div>';
      bindBack(view);
      makeQuiz($('#cGame', view), {
        total: list.length, backHash: back,
        next: function (i) { return list[i]; },
        onResult: function (ok, q) { handleCnResult(ok, q, g, CNBANK.kpById(q.kpid)); },
        onFinish: function (s, t) {
          if (t && s >= Math.ceil(t * 0.8)) { APP.awardStars(5, '语文综合闯关优秀！'); APP.confetti(34); }
          else { APP.toast('答错的题已收进语文错题本 📕'); }
        }
      });
    });
  }

  /* ---------- 语文错题本 ---------- */
  function cnWrongCardsHTML() {
    var w = CNBANK.wrongList().slice().sort(function (a, b) { return (b.n || 1) - (a.n || 1) || b.ts - a.ts; });
    if (!w.length) return '<div class="card" style="text-align:center;padding:26px"><div style="font-size:48px">🎉</div><h3>错题都订正完啦！</h3></div>';
    return '<div class="grid g2">' + w.map(function (it) {
      var q = String(it.q || '');
      return '<div class="card kp-card" data-credo="' + esc(it.id) + '">' +
        '<div style="font-weight:800;font-size:16px;line-height:1.5">' + esc(q.length > 46 ? q.slice(0, 46) + '…' : q) + '</div>' +
        '<div class="page-sub" style="margin-top:8px">' + esc((it.vol || (it.g + ' 年级')) + ' · ' + (it.kpName || '')) + '</div>' +
        '<div class="btn-row" style="margin-top:10px">' +
        '<span class="pill p">错 ' + (it.n || 1) + ' 次</span>' +
        '<span class="pill b">👉 点我重做</span></div></div>';
    }).join('') + '</div>';
  }

  function renderCnWrong(view) {
    var w = CNBANK.wrongList();
    var h = head('📕 语文错题本', '答错的题自动收进来 · 订正答对就移出', '/诗仙花园/1');

    if (!w.length) {
      h += '<div class="card" style="text-align:center;padding:36px">' +
        '<div style="font-size:64px">🎉</div><h3 style="margin-top:8px">错题本是空的！</h3>' +
        '<p class="page-sub">继续保持～背错的诗句会自动收进这里，方便回头再练一遍。</p>' +
        '<div class="btn-row" style="justify-content:center;margin-top:14px">' +
        '<button class="btn primary" data-back="/诗仙花园/1">去背诗 →</button></div></div>';
      view.innerHTML = h; bindBack(view); return;
    }

    h += '<div class="card"><div class="btn-row">' +
      '<button class="btn primary" id="cwAll">🔁 一起重做（' + Math.min(w.length, 10) + ' 题一轮）</button>' +
      '<button class="btn ghost" id="cwClear" style="color:#C0392B">🗑️ 清空错题本</button>' +
      '</div><p class="page-sub" style="margin-top:8px">订正答对一道 +2⭐，一轮全对再 +5⭐。</p></div>';
    h += '<div id="cwGame"></div>';
    h += '<h2 style="margin-top:20px">📋 错题清单（<span id="cwCount">' + w.length + '</span> 道）</h2>';
    h += '<div id="cwList">' + cnWrongCardsHTML() + '</div>';

    view.innerHTML = h;
    bindBack(view);
    bindCnWrongList(view);

    $('#cwAll', view).onclick = function () { cnRedoAll(view); };
    $('#cwClear', view).onclick = function () {
      APP.confirm('清空语文错题本？', '一共 ' + CNBANK.wrongList().length + ' 道错题会被全部删除，无法恢复。学习进度和星星不受影响。', function () {
        S().progress.cn.wrong = [];
        APP.save(true); APP.toast('语文错题本已清空');
        renderCnWrong(view);
      }, '确定清空');
    };
  }
  function bindCnWrongList(view) {
    $$('[data-credo]', view).forEach(function (el) {
      el.onclick = function () {
        var id = el.dataset.credo;
        var it = CNBANK.wrongList().filter(function (x) { return x.id === id; })[0];
        if (it) cnRedoOne(it, view);
      };
    });
  }
  function refreshCnWrongList(view) {
    var box = $('#cwList', view); if (!box) return;
    box.innerHTML = cnWrongCardsHTML();
    var c = $('#cwCount', view); if (c) c.textContent = CNBANK.wrongList().length;
    bindCnWrongList(view);
  }
  function cnRedoOne(item, view) {
    var host = document.createElement('div');
    host.innerHTML = '<p class="page-sub" style="text-align:center;padding:20px">⏳ 正在加载题目…</p>';
    var mo = APP.modal({ title: '📕 语文错题重做', body: host, actions: [{ label: '关闭', cls: 'ghost' }] });

    CNBANK.wrongQuestion(item, function (q) {
      if (!q) { host.innerHTML = '<p>题目加载失败，可能是断网了。联网后再试试。</p>'; return; }
      host.innerHTML = '<div class="q-title" style="font-size:19px">' + esc(q.q) + '</div>' +
        '<div class="opts"></div><div class="feedback"></div>';
      var optsEl = $('.opts', host), fb = $('.feedback', host), locked = false;
      q.opts.forEach(function (o, i) {
        var b = document.createElement('button');
        b.className = 'opt'; b.textContent = o;
        b.onclick = function () {
          if (locked) return; locked = true;
          var ok = i === q.ans;
          var p = S().progress.cn;
          p.total++; if (ok) p.correct++;
          CNBANK.recordKP(q.kpid, ok);
          if (ok) {
            b.classList.add('right');
            fb.className = 'feedback ok';
            fb.textContent = '答对啦！🧹 已从错题本移出。' + (q.tip ? ' 💡 ' + q.tip : '');
            CNBANK.removeWrong(q.qid);
            p.fixed = (p.fixed || 0) + 1;
            APP.awardStars(2, '订正一道错题', b);
            APP.confetti(18);
            setTimeout(function () { mo.close(); refreshCnWrongList(view); }, 1500);
          } else {
            b.classList.add('wrong');
            $$('.opt', host)[q.ans].classList.add('right');
            fb.className = 'feedback no';
            fb.textContent = '还是不对哦，正确答案是「' + q.opts[q.ans] + '」' + (q.tip ? ' 💡 ' + q.tip : '');
            CNBANK.addWrong(q, { g: item.g, kpName: item.kpName, vol: item.vol });
          }
          APP.save(); APP.checkBadges();
        };
        optsEl.appendChild(b);
      });
    });
  }
  function cnRedoAll(view) {
    var host = $('#cwGame', view);
    host.innerHTML = loadingCard('正在加载错题…');
    CNBANK.preloadWrongGrades(function () {
      var items = shuffle(CNBANK.wrongList()).slice(0, 10);
      var list = [];
      items.forEach(function (it) {
        var kp = CNBANK.kpById(it.kp); if (!kp) return;
        (kp.qs || []).forEach(function (raw) { if (raw.id === it.id) list.push(CNBANK.toQuiz(raw)); });
      });
      if (!list.length) { host.innerHTML = bankFailCard(); return; }
      host.innerHTML = '<div class="card"><h3>🔁 错题重做（' + list.length + ' 题）</h3><div id="cwq"></div></div>';
      makeQuiz($('#cwq', host), {
        total: list.length,
        next: function (i) { return list[i]; },
        onResult: function (ok, q) {
          var p = S().progress.cn;
          p.total++; if (ok) p.correct++;
          CNBANK.recordKP(q.kpid, ok);
          if (ok && CNBANK.removeWrong(q.qid)) { p.fixed = (p.fixed || 0) + 1; APP.awardStars(1, '订正成功'); }
          APP.save(); APP.checkBadges();
          refreshCnWrongList(view);
        },
        onFinish: function (s, t) {
          if (s === t) { APP.awardStars(5, '语文错题全部订正！'); APP.confetti(44); }
          else { APP.toast('没答对的还留在错题本里，再练一遍吧 💪'); }
        }
      });
      try { host.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { }
    });
  }

  /* ================= 4. 数字小分队（人教版真题题库 + 速算 + 错题本） ================= */
  var VOL_ICO = { 1: '📘', 2: '📗' };

  function mathStatLine() {
    var pg = S().progress.math;
    var rate = pg.total ? Math.round(pg.correct / pg.total * 100) : 0;
    return '累计答对 ' + pg.correct + ' 题 · 正确率 ' + rate + '%';
  }
  function loadingCard(txt) {
    return '<div class="card" style="text-align:center;padding:34px">' +
      '<div style="font-size:44px" class="loading-emo">⏳</div>' +
      '<div class="page-sub" style="margin-top:10px">' + esc(txt || '正在加载题库…') + '</div></div>';
  }
  function bankFailCard() {
    return '<div class="card"><h3>😵 题库加载失败</h3>' +
      '<p class="page-sub">可能是网络中断且还没缓存过这个年级。请联网后刷新页面重试；联网打开过一次之后，离线也能用。</p></div>';
  }
  /* 统一处理一道真题的作答结果：总分 / 知识点掌握度 / 错题本 */
  function handleMathResult(ok, q, g, kp) {
    var p = S().progress.math;
    p.total++; if (ok) p.correct++;
    MBANK.recordKP(q.kpid, ok);
    if (ok) {
      if (MBANK.removeWrong(q.qid)) {
        p.fixed = (p.fixed || 0) + 1;
        APP.toast('订正成功，已移出错题本 🧹', 'good');
      }
    } else {
      MBANK.addWrong(q, { g: g, kpName: kp ? kp.name : '', vol: kp ? kp._vol : '' });
    }
    APP.save(); APP.checkBadges();
  }

  APP.registerModule({
    id: 'math', hash: '/数字小分队', name: '数字小分队', short: '数学', icon: '🧮', order: 4,
    desc: '人教版真题 · 知识点闯关',
    render: function (view, params) {
      if (params[0] === 'wrong') { renderWrongBook(view); return; }
      var g = parseInt(params[0], 10); if (!(g >= 1 && g <= 6)) g = 1;
      var kind = params[1], id = params[2];
      if (kind === 'kp' && id) { renderKP(view, g, id); return; }
      if (kind === 'su') { if (id) renderSuDetail(view, g, id); else renderSuList(view, g); return; }
      renderGrade(view, g);
    }
  });

  /* ---------- 年级页：上册 / 下册 知识点清单 ---------- */
  function renderGrade(view, g) {
    var pg = S().progress.math;
    var vols = MBANK.catalog(g);
    var wrongN = MBANK.wrongList().length;
    var m = MBANK.meta();

    var h = head('🧮 数字小分队', mathStatLine() + ' · 题库共 ' + (m.questions || 0) + ' 题');
    h += '<div id="tabsHost"></div>';

    h += '<div class="grid g2">' +
      '<div class="card go-card" data-go="/数字小分队/' + g + '/su" style="background:#FFF6D9">' +
      '<div style="display:flex;align-items:center;gap:12px"><span style="font-size:32px">⚡</span>' +
      '<div><div style="font-weight:900;font-size:18px">速算挑战</div>' +
      '<div class="page-sub">无限随机口算，练手速</div></div></div></div>' +
      '<div class="card go-card" data-go="/数字小分队/wrong" style="background:' + (wrongN ? '#FFE6F0' : '#E6FBF0') + '">' +
      '<div style="display:flex;align-items:center;gap:12px"><span style="font-size:32px">📕</span>' +
      '<div><div style="font-weight:900;font-size:18px">错题本' + (wrongN ? ' · ' + wrongN : '') + '</div>' +
      '<div class="page-sub">' + (wrongN ? '有 ' + wrongN + ' 道题等你订正' : '暂时没有错题，真棒！') + '</div></div></div></div>' +
      '</div>';

    if (!vols.length) {
      h += '<div class="card" style="margin-top:14px"><h3>题库目录未加载</h3><p class="page-sub">请刷新页面重试。</p></div>';
    }
    vols.forEach(function (v) {
      var doneN = 0;
      v.kps.forEach(function (k) { if (MBANK.mastered(k.id)) doneN++; });
      h += '<h2 style="margin-top:22px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
        (VOL_ICO[v.term] || '📘') + ' ' + esc(v.vol) +
        '<span class="pill b">' + v.kps.length + ' 个知识点</span>' +
        '<span class="pill g">🏅 已掌握 ' + doneN + '</span></h2>';
      h += '<div class="grid g2">';
      v.kps.forEach(function (k) {
        var st = (pg.kp || {})[k.id] || { c: 0, t: 0 };
        var rate = st.t ? Math.round(st.c / st.t * 100) : 0;
        var ok = MBANK.mastered(k.id);
        var pct = Math.min(100, Math.round(st.t / Math.max(1, k.n) * 100));
        h += '<div class="card kp-card" data-kp="' + esc(k.id) + '">' +
          '<div style="display:flex;align-items:flex-start;gap:10px">' +
          '<span style="font-size:26px;line-height:1.1">' + (ok ? '🏅' : '🔢') + '</span>' +
          '<div style="font-weight:900;font-size:17px;line-height:1.4">' + esc(k.name) + '</div></div>' +
          '<div class="page-sub" style="margin-top:8px">共 ' + k.n + ' 题' +
          (st.t ? ' · 已练 ' + st.t + ' 题 · 正确率 ' + rate + '%' : ' · 还没练过') + '</div>' +
          '<div class="kp-bar"><i style="width:' + pct + '%"></i></div>' +
          '</div>';
      });
      h += '</div>';
    });

    h += '<div class="note" style="margin-top:18px">📚 数学题库依据<b>人教版小学数学 1-6 年级知识点与公式汇总</b>整理，共 ' +
      (m.knowledgePoints || 0) + ' 个知识点 / ' + (m.questions || 0) + ' 道题，用于课前预习与课后巩固；正式学习请以学校发放的正版教材为准。</div>';

    view.innerHTML = h;
    $('#tabsHost', view).appendChild(gradeTabs(g, function (n) { APP.go('/数字小分队/' + n); }));
    $$('[data-go]', view).forEach(function (el) { el.onclick = function () { APP.go(el.dataset.go); }; });
    $$('[data-kp]', view).forEach(function (el) { el.onclick = function () { APP.go('/数字小分队/' + g + '/kp/' + el.dataset.kp); }; });
  }

  /* ---------- 知识点详情：说明 + 真题闯关 ---------- */
  function renderKP(view, g, kpid) {
    var lite = MBANK.catalogKP(g, kpid);
    var back = '/数字小分队/' + g;
    view.innerHTML = head('🧮 ' + esc(lite ? lite.name : '知识点'), lite ? lite.vol + ' · 共 ' + lite.n + ' 题' : '', back) + loadingCard();
    bindBack(view);

    MBANK.load(g, function (data) {
      if (!data) { view.innerHTML = head('🧮 知识点', '', back) + bankFailCard(); bindBack(view); return; }
      var kp = MBANK.findKP(g, kpid);
      if (!kp) { view.innerHTML = head('🧮 知识点', '', back) + '<div class="card"><h3>没找到这个知识点</h3></div>'; bindBack(view); return; }
      draw(kp);
    });

    function draw(kp) {
      var st = MBANK.kpStat(kp.id);
      var rate = st.t ? Math.round(st.c / st.t * 100) : 0;
      var list = MBANK.drawFrom(kp, 10);

      var h = head('🧮 ' + esc(kp.name), kp._vol + ' · 题库共 ' + kp.qs.length + ' 题', back);
      h += '<div class="card"><h3>📌 知识点说明</h3>' +
        '<p style="font-size:17px;line-height:1.9">' + esc(kp.desc || '') + '</p>' +
        '<div class="btn-row" style="margin-top:10px;align-items:center">' +
        speakBtn(kp.name + '。' + (kp.desc || ''), 'zh-CN', '读一读') +
        '<span class="pill g">已练 ' + st.t + ' 题</span>' +
        '<span class="pill y">正确率 ' + rate + '%</span>' +
        (MBANK.mastered(kp.id) ? '<span class="pill p">🏅 已掌握</span>' : '<span class="pill">练满 8 题且正确率 80% 即掌握</span>') +
        '</div></div>';
      h += '<div class="card" style="margin-top:14px"><h3>🎯 知识点闯关（本轮 ' + list.length + ' 题）</h3><div id="mGame"></div></div>';
      view.innerHTML = h;
      bindBack(view); bindSpeak(view);

      APP.uniqPush(S().progress.math.practiced, kp.id); APP.save();

      makeQuiz($('#mGame', view), {
        total: list.length, backHash: back,
        next: function (i) { return list[i]; },
        onResult: function (ok, q) { handleMathResult(ok, q, g, kp); },
        onFinish: function (s, t) {
          if (t && s >= Math.ceil(t * 0.8)) { APP.awardStars(5, '知识点闯关优秀！'); APP.confetti(34); }
          else { APP.toast('答错的题已收进错题本，记得回去订正哦 📕'); }
        }
      });
    }
  }

  /* ---------- 速算挑战（原程序化题库，无限出题） ---------- */
  function renderSuList(view, g) {
    var list = DATA.mathGrade(g);
    var h = head('⚡ 速算挑战', mathStatLine() + ' · 题目随机生成，练多少都有', '/数字小分队/' + g);
    h += '<div id="tabsHost"></div><div class="grid g2" id="suList"></div>';
    view.innerHTML = h; bindBack(view);
    $('#tabsHost', view).appendChild(gradeTabs(g, function (n) { APP.go('/数字小分队/' + n + '/su'); }));
    var pg = S().progress.math;
    $('#suList', view).innerHTML = list.map(function (x) {
      var done = pg.practiced.indexOf(x.id) >= 0;
      return '<div class="card kp-card" data-id="' + esc(x.id) + '">' +
        '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:26px">' + (done ? '✅' : '⚡') + '</span>' +
        '<div style="font-weight:900;font-size:18px">' + esc(x.name) + '</div></div>' +
        '<div class="page-sub" style="margin-top:8px">' + esc((x.summary || '').slice(0, 42)) + '…</div></div>';
    }).join('');
    $$('[data-id]', view).forEach(function (el) { el.onclick = function () { APP.go('/数字小分队/' + g + '/su/' + el.dataset.id); }; });
  }
  function renderSuDetail(view, g, id) {
    var kp = DATA.mathGrade(g).filter(function (x) { return x.id === id; })[0];
    if (!kp) { renderSuList(view, g); return; }
    var h = head('⚡ ' + esc(kp.name), g + ' 年级 · 速算', '/数字小分队/' + g + '/su');
    h += '<div class="card"><h3>📌 总结重点</h3><p style="font-size:17px;line-height:1.9">' + esc(kp.summary || '') + '</p></div>';
    h += '<div class="card" style="margin-top:14px"><h3>🎲 随机出题（每轮 10 题）</h3><div id="mGame"></div></div>';
    view.innerHTML = h; bindBack(view);
    APP.uniqPush(S().progress.math.practiced, kp.id); APP.save();
    makeQuiz($('#mGame', view), {
      total: 10, backHash: '/数字小分队/' + g + '/su',
      next: function () { return DATA.mathQuestion(kp); },
      onResult: function (ok) { var p = S().progress.math; p.total++; if (ok) p.correct++; APP.save(); APP.checkBadges(); },
      onFinish: function (s) { if (s >= 8) { APP.awardStars(5, '本轮表现优秀！'); APP.confetti(34); } }
    });
  }

  /* ---------- 错题本 ---------- */
  function wrongCardsHTML() {
    var w = MBANK.wrongList().slice().sort(function (a, b) { return (b.n || 1) - (a.n || 1) || b.ts - a.ts; });
    if (!w.length) return '<div class="card" style="text-align:center;padding:26px"><div style="font-size:48px">🎉</div><h3>错题都订正完啦！</h3></div>';
    return '<div class="grid g2">' + w.map(function (it) {
      var q = String(it.q || '');
      return '<div class="card kp-card" data-redo="' + esc(it.id) + '">' +
        '<div style="font-weight:800;font-size:16px;line-height:1.5">' + esc(q.length > 46 ? q.slice(0, 46) + '…' : q) + '</div>' +
        '<div class="page-sub" style="margin-top:8px">' + esc((it.vol || (it.g + ' 年级')) + ' · ' + (it.kpName || '')) + '</div>' +
        '<div class="btn-row" style="margin-top:10px">' +
        '<span class="pill p">错 ' + (it.n || 1) + ' 次</span>' +
        '<span class="pill b">👉 点我重做</span></div></div>';
    }).join('') + '</div>';
  }

  function renderWrongBook(view) {
    var w = MBANK.wrongList();
    var h = head('📕 错题本', '答错的题自动收进来 · 订正答对就移出', '/数字小分队/1');

    if (!w.length) {
      h += '<div class="card" style="text-align:center;padding:36px">' +
        '<div style="font-size:64px">🎉</div><h3 style="margin-top:8px">错题本是空的！</h3>' +
        '<p class="page-sub">继续保持～做错的题会自动收进这里，方便回头再练一遍。</p>' +
        '<div class="btn-row" style="justify-content:center;margin-top:14px">' +
        '<button class="btn primary" data-back="/数字小分队/1">去做题 →</button></div></div>';
      view.innerHTML = h; bindBack(view); return;
    }

    h += '<div class="card"><div class="btn-row">' +
      '<button class="btn primary" id="wAll">🔁 一起重做（' + Math.min(w.length, 10) + ' 题一轮）</button>' +
      '<button class="btn ghost" id="wClear" style="color:#C0392B">🗑️ 清空错题本</button>' +
      '</div><p class="page-sub" style="margin-top:8px">订正答对一道 +2⭐，一轮全对再 +5⭐。</p></div>';
    h += '<div id="wGame"></div>';
    h += '<h2 style="margin-top:20px">📋 错题清单（<span id="wCount">' + w.length + '</span> 道）</h2>';
    h += '<div id="wList">' + wrongCardsHTML() + '</div>';

    view.innerHTML = h;
    bindBack(view);
    bindWrongList(view);

    $('#wAll', view).onclick = function () { redoAll(view); };
    $('#wClear', view).onclick = function () {
      APP.confirm('清空错题本？', '一共 ' + MBANK.wrongList().length + ' 道错题会被全部删除，无法恢复。学习进度和星星不受影响。', function () {
        S().progress.math.wrong = [];
        APP.save(true); APP.toast('错题本已清空');
        renderWrongBook(view);
      }, '确定清空');
    };
  }
  function bindWrongList(view) {
    $$('[data-redo]', view).forEach(function (el) {
      el.onclick = function () {
        var id = el.dataset.redo;
        var it = MBANK.wrongList().filter(function (x) { return x.id === id; })[0];
        if (it) redoOne(it, view);
      };
    });
  }
  function refreshWrongList(view) {
    var box = $('#wList', view); if (!box) return;
    box.innerHTML = wrongCardsHTML();
    var c = $('#wCount', view); if (c) c.textContent = MBANK.wrongList().length;
    bindWrongList(view);
  }

  /* 单题重做（弹窗） */
  function redoOne(item, view) {
    var host = document.createElement('div');
    host.innerHTML = '<p class="page-sub" style="text-align:center;padding:20px">⏳ 正在加载题目…</p>';
    var mo = APP.modal({ title: '📕 错题重做', body: host, actions: [{ label: '关闭', cls: 'ghost' }] });

    MBANK.wrongQuestion(item, function (q) {
      if (!q) { host.innerHTML = '<p>题目加载失败，可能是断网了。联网后再试试。</p>'; return; }
      host.innerHTML = '<div class="q-title" style="font-size:20px">' + esc(q.q) + '</div>' +
        '<div class="opts"></div><div class="feedback"></div>';
      var optsEl = $('.opts', host), fb = $('.feedback', host), locked = false;
      q.opts.forEach(function (o, i) {
        var b = document.createElement('button');
        b.className = 'opt'; b.textContent = o;
        b.onclick = function () {
          if (locked) return; locked = true;
          var ok = i === q.ans;
          var p = S().progress.math;
          p.total++; if (ok) p.correct++;
          MBANK.recordKP(q.kpid, ok);
          if (ok) {
            b.classList.add('right');
            fb.className = 'feedback ok';
            fb.textContent = '答对啦！🧹 已从错题本移出。' + (q.tip ? ' 💡 ' + q.tip : '');
            MBANK.removeWrong(q.qid);
            p.fixed = (p.fixed || 0) + 1;
            APP.awardStars(2, '订正一道错题', b);
            APP.confetti(18);
            setTimeout(function () { mo.close(); refreshWrongList(view); }, 1500);
          } else {
            b.classList.add('wrong');
            $$('.opt', host)[q.ans].classList.add('right');
            fb.className = 'feedback no';
            fb.textContent = '还是不对哦，正确答案是「' + q.opts[q.ans] + '」' + (q.tip ? ' 💡 ' + q.tip : '');
            MBANK.addWrong(q, { g: item.g, kpName: item.kpName, vol: item.vol });
          }
          APP.save(); APP.checkBadges();
        };
        optsEl.appendChild(b);
      });
    });
  }

  /* 批量重做 */
  function redoAll(view) {
    var host = $('#wGame', view);
    host.innerHTML = loadingCard('正在加载错题…');
    MBANK.preloadWrongGrades(function () {
      var items = shuffle(MBANK.wrongList()).slice(0, 10);
      var list = [];
      items.forEach(function (it) {
        var kp = MBANK.kpById(it.kp); if (!kp) return;
        kp.qs.forEach(function (raw) { if (raw.id === it.id) list.push(MBANK.toQuiz(raw)); });
      });
      if (!list.length) { host.innerHTML = bankFailCard(); return; }
      host.innerHTML = '<div class="card"><h3>🔁 错题重做（' + list.length + ' 题）</h3><div id="wq"></div></div>';
      makeQuiz($('#wq', host), {
        total: list.length,
        next: function (i) { return list[i]; },
        onResult: function (ok, q) {
          var p = S().progress.math;
          p.total++; if (ok) p.correct++;
          MBANK.recordKP(q.kpid, ok);
          if (ok && MBANK.removeWrong(q.qid)) { p.fixed = (p.fixed || 0) + 1; APP.awardStars(1, '订正成功'); }
          APP.save(); APP.checkBadges();
          refreshWrongList(view);
        },
        onFinish: function (s, t) {
          if (s === t) { APP.awardStars(5, '错题全部订正！'); APP.confetti(44); }
          else { APP.toast('没答对的还留在错题本里，再练一遍吧 💪'); }
        }
      });
      try { host.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { }
    });
  }

  /* ================= 5. 小小外交官（真题题库驱动） ================= */
  APP.registerModule({
    id: 'english', hash: '/小小外交官', name: '小小外交官', short: '英语', icon: '🗽', order: 5,
    desc: '单词 · 常用表达法 · 谚语 · 不规则动词 · 语音',
    render: function (view, params) {
      var g = parseInt(params[0], 10); if (!(g >= 3 && g <= 6)) g = 3;
      var sub = params[0];

      // 错题本子路由
      if (sub === 'wrong') { renderEnWrong(view, g); return; }

      // 确保题库（年级分片 + 通用分片）已加载
      ENBANK.ensure(g, function () { renderHome(view, g); });

      function renderHome(view, g) {
        var bank = ENBANK.grade(g);
        if (!bank) { view.innerHTML = loadingCard('题库加载失败'); return; }
        var pg = S().progress.english; pg.cats = pg.cats || {}; pg.wrong = pg.wrong || [];
        var cats = ENBANK.catList(g);
        var wrongN = ENBANK.wrongList(g).length;

        var doneN = Object.keys(pg.cats).filter(function (k) { return k !== '_done'; }).length;
        var h = head('🗽 小小外交官', '累计答对 ' + pg.correct + ' 题 · ' + doneN + ' 个分类练过');
        // 自定义年级 tabs（英语 3-6 年级）
        h += '<div class="tabs">' + [3, 4, 5, 6].map(function (n) {
          return '<button class="tab' + (n === g ? ' active' : '') + '" data-g="' + n + '">' + n + ' 年级</button>';
        }).join('') + '</div>';
        h += '<div class="page-sub" style="margin:8px 0 4px">选择一个分类开始闯关 👇</div>';
        h += '<div class="grid g3" id="cats"></div>';
        if (wrongN) h += '<div class="go-card" data-go="/小小外交官/wrong" style="background:#FFE6F0;margin-top:14px"><div style="font-size:30px">📕</div><div><div style="font-weight:900;font-size:18px">英语错题本 · ' + wrongN + '</div><div class="page-sub">有 ' + wrongN + ' 道错题等你订正</div></div></div>';
        h += demoNote();
        view.innerHTML = h;
        bindBack(view);

        $$('[data-g]', view).forEach(function (b) { b.onclick = function () { APP.go('/小小外交官/' + b.dataset.g); }; });
        var host = $('#cats', view);
        var CARDS = [
          { id: 'vocab', ico: '🔤', sub: '单词中英互译' },
          { id: 'phrases', ico: '💬', sub: '常用表达法配对' },
          { id: 'proverbs', ico: '📜', sub: '谚语中英配对' },
          { id: 'irregular', ico: '🔁', sub: '不规则动词变化' },
          { id: 'phonetics', ico: '🔊', sub: '语音拼写规律' },
          { id: 'mixed', ico: '🎲', sub: '混合随机闯关' }
        ];
        host.innerHTML = CARDS.filter(function (c) { return cats.indexOf(c.id) >= 0; }).map(function (c) {
          var n = (bank.cats[c.id] && bank.cats[c.id].items.length) || 0;
          var done = pg.cats[c.id];
          return '<div class="card" data-cat="' + c.id + '" style="cursor:pointer">' +
            '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:26px">' + c.ico + '</span>' +
            '<div style="font-weight:900;font-size:18px">' + c.id.toUpperCase() + '</div>' + (done ? ' <span>✅</span>' : '') + '</div>' +
            '<div class="page-sub" style="margin-top:6px">' + c.sub + ' · ' + n + ' 题</div></div>';
        }).join('');
        $$('[data-cat]', host).forEach(function (el) {
          el.onclick = function () { startQuiz(view, g, el.dataset.cat); };
        });
        bindSpeak(view);
      }

      function startQuiz(view, g, cat) {
        var pg = S().progress.english; pg.cats = pg.cats || {}; pg.wrong = pg.wrong || [];
        var titleMap = { vocab: '单词表', phrases: '常用表达法', proverbs: '谚语', irregular: '不规则动词', phonetics: '语音汇总', mixed: '混合闯关' };
        var h = head('🗽 ' + (titleMap[cat] || cat), g + ' 年级 · 每轮 10 题', '/小小外交官/' + g);
        h += '<div class="card"><div id="eq"></div></div>';
        h += '<div class="page-sub" style="text-align:center;margin-top:10px">点选项作答 · 自动朗读英文 · 答错收进错题本</div>';
        view.innerHTML = h; bindBack(view);
        var total = 10;
        makeQuiz($('#eq', view), {
          total: total, backHash: '/小小外交官/' + g,
          next: function () { return ENBANK.makeQuestion(g, cat); },
          onResult: function (ok, q) {
            var p = S().progress.english; p.total++; if (ok) p.correct++;
            p.cats[cat] = (p.cats[cat] || 0) + 1; p.cats._done = (p.cats._done || 0);
            if (!ok && q) ENBANK.recordWrong(g, cat, q);
            APP.save(); APP.checkBadges();
          },
          onFinish: function (s, t) {
            if (s >= t * 0.8) { APP.awardStars(5, '英语小达人！'); APP.confetti(30); }
            else if (s > 0) { APP.awardStars(2, '继续加油！'); }
          }
        });
      }
    }
  });

  /* 英语错题本 */
  function renderEnWrong(view, g) {
    var pg = S().progress.english; pg.wrong = pg.wrong || [];
    var list = ENBANK.wrongList(g);
    var h = head('📕 英语错题本', g + ' 年级 · 答错的题自动收进来 · 订正答对就移出', '/小小外交官/' + g);
    if (!list.length) {
      h += '<div class="card" style="text-align:center;padding:26px"><div style="font-size:48px">🎉</div><h3>错题都订正完啦！</h3></div>';
      view.innerHTML = h; bindBack(view); return;
    }
    h += '<div style="font-size:64px;text-align:center">📚</div>';
    h += '<div class="card"><h3>🔁 错题重做（' + list.length + ' 道）</h3><div id="ewq"></div></div>';
    view.innerHTML = h; bindBack(view);
    var items = shuffle(list).slice(0, 10);
    makeQuiz($('#ewq', view), {
      total: items.length, backHash: '/小小外交官/' + g,
      next: function () { return ENBANK.questionFromWrong(items.shift()); },
      onResult: function (ok, q) {
        if (ok && q && q.qid) {
          ENBANK.removeWrong(q.qid);
          pg.fixed = (pg.fixed || 0) + 1;
          APP.awardStars(2, '订正一道错题');
        }
        APP.save(); APP.checkBadges();
      },
      onFinish: function (s, t) { if (s >= t * 0.8) { APP.awardStars(3, '错题清光啦！'); APP.confetti(26); } }
    });
  }
  // 把错题渲染接入英语模块的 /wrong 子路由（renderEnWrong 供外部调用）
  APP._renderEnWrong = renderEnWrong;

  /* ================= 6. 逻辑挑战 ================= */
  APP.registerModule({
    id: 'logic', hash: '/逻辑挑战', name: '逻辑挑战', short: '逻辑', icon: '🧩', order: 6,
    desc: '找规律 · 图形 · 排序',
    render: function (view, params) {
      var lv = parseInt(params[0], 10); if (!(lv >= 1 && lv <= 3)) lv = 1;
      var pg = S().progress.logic;
      var names = { 1: '⭐ 初级', 2: '⭐⭐ 中级', 3: '⭐⭐⭐ 高级' };
      var h = head('🧩 逻辑挑战', '最高连对 ' + pg.streakBest + ' 题 · 累计答对 ' + pg.correct + ' 题');
      h += '<div class="tabs">' + [1, 2, 3].map(function (n) { return '<button class="tab' + (n === lv ? ' active' : '') + '" data-lv="' + n + '">' + names[n] + '</button>'; }).join('') + '</div>';
      h += '<div id="lgGame"></div>';
      view.innerHTML = h;
      $$('[data-lv]', view).forEach(function (b) { b.onclick = function () { APP.go('/逻辑挑战/' + b.dataset.lv); }; });

      var bank = DATA.logicSet(lv), bi = 0;
      makeQuiz($('#lgGame', view), {
        total: 6,
        next: function () { if (bi >= bank.length) { bank = DATA.logicSet(lv); bi = 0; } return bank[bi++]; },
        onResult: function (ok, q, streak) {
          var p = S().progress.logic; p.total++;
          if (ok) { p.correct++; p.streakBest = Math.max(p.streakBest, streak); }
          APP.save(); APP.checkBadges();
        },
        onFinish: function (s, t) { if (s >= 5) { APP.awardStars(5, '逻辑高手！'); APP.confetti(32); } }
      });
    }
  });

  /* ================= 7. 闯关冒险 ================= */
  var LEVELS = [
    { n: 1, name: '草地新手村', ico: '🌱', mix: ['letters', 'math1'] },
    { n: 2, name: '数字小溪', ico: '💧', mix: ['math1', 'math2'] },
    { n: 3, name: '拼音森林', ico: '🌳', mix: ['reading', 'letters'] },
    { n: 4, name: '古诗竹林', ico: '🎋', mix: ['poem', 'reading'] },
    { n: 5, name: '英语港口', ico: '⛵', mix: ['english', 'letters'] },
    { n: 6, name: '逻辑迷宫', ico: '🌀', mix: ['logic', 'math3'] },
    { n: 7, name: '数学火山', ico: '🌋', mix: ['math4', 'math5'] },
    { n: 8, name: '智慧城堡', ico: '🏰', mix: ['math6', 'english', 'logic', 'poem'] }
  ];
  function mixQuestion(kind) {
    if (kind === 'letters') {
      var L = DATA.letters(), o = pick(L), others = shuffle(L.filter(function (x) { return x.u !== o.u; })).slice(0, 3);
      var opts = shuffle([o.u].concat(others.map(function (x) { return x.u; })));
      return { q: '「' + o.word + ' ' + o.emoji + '」是哪个字母开头？', opts: opts, ans: opts.indexOf(o.u), tip: o.word + ' = ' + o.zh, speak: o.word, speakLang: 'en-US' };
    }
    if (kind === 'english') {
      var u = pick(DATA.englishGrade(rnd(1, 6))), w = pick(u.words);
      var ot = shuffle(u.words.filter(function (x) { return x.en !== w.en; })).slice(0, 3);
      var op = shuffle([w.zh].concat(ot.map(function (x) { return x.zh; })));
      return { q: '「' + w.en + '」是什么意思？', opts: op, ans: op.indexOf(w.zh), tip: w.e + ' ' + w.en, speak: w.en, speakLang: 'en-US' };
    }
    if (kind === 'poem') {
      var ps = DATA.allPoems(), p = pick(ps), others2 = shuffle(ps.filter(function (x) { return x.id !== p.id; })).slice(0, 3);
      var op2 = shuffle([p.title].concat(others2.map(function (x) { return x.title; })));
      return { q: '「' + p.lines[0].t + '」出自哪首诗？', opts: op2, ans: op2.indexOf(p.title), tip: p.author + '《' + p.title + '》', speak: p.lines[0].t, speakLang: 'zh-CN', autoSpeak: false };
    }
    if (kind === 'reading') {
      var t = pick(DATA.readingGrade(rnd(1, 6)));
      var c = pick(t.chars || [{ c: '春', p: 'chūn', w: '春天' }]);
      var pool = '春草花鸟早书师家秋果梨摘棵浇护校银扇飘落操赛参虽乡缓映捉蚁群搬团静透页翻封梦努希毕即却招戴仿迷'.split('');
      var wr = shuffle(pool.filter(function (x) { return x !== c.c; })).slice(0, 3);
      var op3 = shuffle([c.c].concat(wr));
      return { q: '「' + c.w + '」的「' + c.p + '」是哪个字？', opts: op3, ans: op3.indexOf(c.c), tip: c.w, speak: c.w, speakLang: 'zh-CN' };
    }
    if (kind === 'logic') { var set = DATA.logicSet(rnd(1, 3)); return pick(set); }
    var g = parseInt(kind.replace('math', ''), 10) || 1;
    // 优先出人教版真题（该年级题库已加载时），否则回退到程序化速算题
    if (window.MBANK && MBANK.isLoaded(g)) {
      var real = MBANK.drawGrade(g, 1)[0];
      if (real) return real;
    }
    return DATA.mathQuestion(pick(DATA.mathGrade(g)));
  }

  APP.registerModule({
    id: 'adventure', hash: '/闯关冒险', name: '闯关冒险', short: '闯关', icon: '🗺️', order: 7,
    desc: '跨学科闯关 · 徽章墙',
    render: function (view, params) {
      var lvn = parseInt(params[0], 10);
      var pg = S().progress.adventure;
      if (lvn >= 1 && lvn <= LEVELS.length) { playLevel(view, LEVELS[lvn - 1]); return; }

      var h = head('🗺️ 闯关冒险', '已通关 ' + pg.cleared.length + ' / ' + LEVELS.length + ' 关');
      h += '<div class="grid g3">';
      LEVELS.forEach(function (L) {
        var cleared = pg.cleared.indexOf(L.n) >= 0;
        var unlocked = L.n === 1 || pg.cleared.indexOf(L.n - 1) >= 0;
        h += '<div class="mod-card" data-lv="' + L.n + '" style="background:' + (cleared ? '#E6FBF0' : unlocked ? '#FFF6D9' : '#F0EEF5') + ';' + (unlocked ? '' : 'opacity:.6') + '">' +
          '<div><div class="m-ico">' + (unlocked ? L.ico : '🔒') + '</div><div class="m-name">第 ' + L.n + ' 关 · ' + esc(L.name) + '</div>' +
          '<div class="m-desc">5 道综合题 · 答对 4 题过关 (+5⭐)</div></div>' +
          '<div class="m-desc">' + (cleared ? '✅ 已通关' : unlocked ? '👉 点击开始' : '通过上一关解锁') + '</div></div>';
      });
      h += '</div>';

      h += '<h2 style="margin-top:22px">🏅 成就徽章墙</h2><div class="grid g4">';
      APP.badges.forEach(function (b) {
        var on = S().badges.indexOf(b.id) >= 0;
        h += '<div class="badge' + (on ? ' on' : '') + '"><div class="b-ico">' + b.ico + '</div><div class="b-name">' + esc(b.name) + '</div><div class="b-desc">' + esc(b.desc) + '</div></div>';
      });
      h += '</div>';
      view.innerHTML = h;
      $$('[data-lv]', view).forEach(function (el) {
        el.onclick = function () {
          var n = parseInt(el.dataset.lv, 10);
          var unlocked = n === 1 || S().progress.adventure.cleared.indexOf(n - 1) >= 0;
          if (!unlocked) { APP.toast('先通过第 ' + (n - 1) + ' 关才能解锁哦 🔒', 'warn'); return; }
          APP.go('/闯关冒险/' + n);
        };
      });
    }
  });

  function playLevel(view, L) {
    view.innerHTML = head(L.ico + ' 第 ' + L.n + ' 关 · ' + esc(L.name), '答对 4 题即可通关', '/闯关冒险') + loadingCard('正在准备关卡…');
    bindBack(view);
    // 本关涉及的数学年级先把真题题库拉下来，拉不到就用速算题兜底
    var grades = [];
    L.mix.forEach(function (k) { if (k.indexOf('math') === 0) grades.push(parseInt(k.replace('math', ''), 10)); });
    var left = grades.length;
    if (!left) start(); else grades.forEach(function (g) { MBANK.load(g, function () { if (--left === 0) start(); }); });

    function start() {
      view.innerHTML = head(L.ico + ' 第 ' + L.n + ' 关 · ' + esc(L.name), '答对 4 题即可通关', '/闯关冒险') + '<div id="advGame"></div>';
      bindBack(view);
      makeQuiz($('#advGame', view), {
        total: 5, backHash: '/闯关冒险',
        next: function () { return mixQuestion(pick(L.mix)); },
        onResult: function (ok, q) {
          if (!q || !q.qid) return;                    // 只有真题才计入数学统计与错题本
          var p = S().progress.math;
          p.total++; if (ok) p.correct++;
          MBANK.recordKP(q.kpid, ok);
          if (ok) { if (MBANK.removeWrong(q.qid)) p.fixed = (p.fixed || 0) + 1; }
          else {
            var kp = MBANK.kpById(q.kpid);
            MBANK.addWrong(q, { g: kp ? kp._grade : 0, kpName: kp ? kp.name : '', vol: kp ? kp._vol : '' });
          }
          APP.save();
        },
        onFinish: function (s) {
          var pg = S().progress.adventure;
          pg.best = Math.max(pg.best || 0, s);
          if (s >= 4) {
            var isNew = APP.uniqPush(pg.cleared, L.n);
            pg.level = Math.max(pg.level, L.n + 1);
            APP.save(true);
            if (isNew) { APP.awardStars(5, '通关第 ' + L.n + ' 关！'); APP.confetti(50); APP.speak('恭喜通关', 'zh-CN'); }
            else { APP.awardStars(2, '再次通关'); }
            APP.checkBadges();
          } else { APP.toast('差一点点，再试一次吧！', 'warn'); }
        }
      });
    }
  }

  window.MODULE_HELPERS = { makeQuiz: makeQuiz, head: head, bindBack: bindBack, speakBtn: speakBtn, bindSpeak: bindSpeak, gradeTabs: gradeTabs };
})();
