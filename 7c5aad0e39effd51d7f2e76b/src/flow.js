/* 流程引擎：晨读 / 暮省 / 回照 / 回炉，全部在页面内完成；该自动带的不问，该点的按钮不用打字 */
(function () {
  const $ = id => document.getElementById(id);
  const Bus = window.GXBus;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const iso = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  };

  /* 行的可观测性：像「多反省」「注意脾气」这种，抓不住动作 */
  const VAGUE_HEAD = /^(多|要|得|应|应该|注意|尽量|好好|努力|加强|提高|控制|克制|少)/;
  const ACT_HINT = /时|的时候|情况|之前|之后|先|再|停|数到|开口|不|每次|只要|一旦/;
  function vague(s) {
    const t = String(s || '').trim();
    if (t.length < 6) return true;
    return VAGUE_HEAD.test(t) && !ACT_HINT.test(t);
  }

  const HOST = { chen: 'wizChen', mu: 'wizMu', zhao: 'wizZhao', lu: 'wizLu' };

  function unitName() {
    const d = window.GXData;
    return d && d.state ? d.state.unit : '';
  }

  /* 五分钟：到点只把「底线」标出来，不评价 */
  let timer = null;
  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function startTimer() {
    stopTimer();
    let left = 300;
    const tick = () => {
      const el = document.querySelector('.rd-clock');
      if (!el || !el.offsetParent) { stopTimer(); return; }
      el.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
      if (left-- <= 0) {
        stopTimer();
        el.textContent = '到点 · 记底线';
        const b = document.querySelector('[data-v="底线"]');
        if (b) b.classList.add('pulse');
        Bus.emit('timer.done', { note: '五分钟' });
      }
    };
    tick();
    timer = setInterval(tick, 1000);
    Bus.emit('timer.start', { note: '300s' });
  }

  const FLOWS = {
    chen: {
      name: '晨读',
      steps: [{
        f: 'gear', kind: 'read', instant: true,
        q: '出声读一遍。不解释、不翻译、不引注。',
        hint: '读完点「完整」；今天只能读这一遍，点「底线」。只记这一笔，不评价。',
        options: [
          { v: '完整', label: '读完了 · 完整' },
          { v: '底线', label: '只读一遍 · 底线' }
        ]
      }],
      need: v => v.gear === '完整' || v.gear === '底线',
      miss: '点「完整」或「底线」，只记这一笔。',
      body: v => ({ date: iso(), unit: unitName(), gear: v.gear }),
      endpoint: '/api/gear',
      receipt: (v, r) => ({
        t: '记下了',
        d: '本周档位：' + v.gear + (r && r.file ? '　写入 weekly/' + r.file : '') +
          (r && r.skipped ? '　（这一档本周已记过，没有重复写）' : ''),
        next: { k: 'mu', label: '接着写暮省' }
      })
    },

    mu: {
      name: '暮省',
      steps: [
        {
          f: 'touch', rows: 2, pick: true,
          q: '这一周哪一句让你停下来了？',
          hint: '点下方原文里的句子，会自动填进来；也可以自己抄。一字不改。',
          alt: { label: '这周没有', q: '翻一下这周读过的内容，找一句当时让你稍微顿了一下的。', again: '仍想不起来' }
        },
        {
          f: 'scene', rows: 2,
          q: '当时是什么情境？——什么时候、在哪里、谁在场？',
          hint: '时间、地点、在场的人，三样里至少写两样。缺这一框，「照」就不成立。'
        },
        {
          f: 'react', rows: 2,
          q: '你当时的具体反应是什么？',
          hint: '写你实际做了什么、说了什么，不写「很烦」「有点急」这类概括。'
        },
        {
          f: 'act', rows: 2, vague: true,
          q: '下周有意识地在哪一件具体的事上试一下？',
          hint: '写成一个可观测的动作——做什么、在什么情况下做。写不出动作就先空着，别用「多注意」填空。'
        }
      ],
      need: v => !!v.touch && !!v.scene && !!v.react && !!v.act,
      miss: '四项缺一不可。',
      softer: v => ([
        ['scene', /^(最近|这周|最近这|前几天)$|^.{0,5}(很|挺|有点)(烦|急|躁)/, '「' + v.scene + '」还看不出情境。补上什么时候、在哪里、谁在场。'],
        ['react', /^(很|挺|有点|比较)(烦|急|躁|难受|生气)$/, '「' + v.react + '」是感受，不是反应。写你当时做了什么。']
      ].find(([f, re]) => re.test(String(v[f] || '').trim())) || []),
      body: v => ({ date: iso(), unit: unitName(), touch: v.touch, scene: v.scene, react: v.react, act: v.act }),
      endpoint: '/api/sanzhao',
      receipt: (v, r) => ({
        t: '记下了',
        d: '这周的「行」不用回我，周末回照时会原样拿出来。' + (r && r.card ? '　章句卡：cards/' + r.card : '')
      })
    },

    zhao: {
      name: '回照',
      steps: [
        {
          f: 'q1', kind: 'choice', instant: true,
          q: '当时写的这个情境，这周有没有再出现？',
          hint: '只选一个，选完自动进下一问。',
          options: ['有', '没有', '类似但不同']
        },
        {
          f: 'q2', rows: 2,
          q: '如果出现了，你当时怎么做的？和写的「行」一样吗？',
          hint: '问一答「没有」的话，这问写「没有出现」即可。'
        },
        {
          f: 'q3', rows: 2,
          q: '如果没出现，你觉得下次出现时你会怎么做？',
          hint: '问一答「有」的话，这问写「已出现，见问二」即可。'
        }
      ],
      need: v => !!v.q1 && !!v.q2 && !!v.q3,
      miss: '三问都要有回答。',
      softer: () => [],
      body: (v, st) => ({ date: iso(), target: st.target, q1: v.q1, q2: v.q2, q3: v.q3 }),
      endpoint: '/api/replay',
      receipt: (v, r) => ({
        t: '记下了',
        d: '三问原话落盘' + (r && r.file ? '：sessions/' + r.file : '') + '。不分析、不评价。'
      })
    },

    lu: {
      name: '回炉',
      steps: [
        {
          f: 'picks', kind: 'pick2', picks: true,
          q: '挑两到三张卡，看看它们在说同一件事吗？',
          hint: '同标签的排在前面。标签还没填的，也可以自己挑。'
        },
        {
          f: 'judge', kind: 'cards', instant: true,
          q: '这几张，有没有在说同一件事？',
          hint: '点一个。判断权在你，系统不替你连。',
          options: ['是，同一件事', '不是，各说各的', '说不清']
        },
        {
          f: 'note', kind: 'text', rows: 3,
          q: '用你自己的一句话把它们连起来。',
          hint: '这句话会写进每张卡末尾，不改动原文，也不生成图谱。'
        }
      ],
      need: v => !!v.judge,
      miss: '还差一步。',
      body: (v, st) => ({ files: st.picks, note: v.note }),
      endpoint: '/api/link',
      receipt: (v, r) => ({
        t: '记下了',
        d: '每张卡末尾各添一句：' + v.note
      })
    }
  };

  function cardsOf() {
    const d = window.GXData;
    return (d && d.cards) || [];
  }

  function receiptHtml(r) {
    return '<div class="rcpt">' +
      '<div class="rc-t">' + esc(r.t) + '</div>' +
      (r.d ? '<div class="rc-d">' + esc(r.d) + '</div>' : '') +
      '<div class="rc-f">' +
      (r.next ? '<button class="btn-primary" data-act="go" data-k="' + r.next.k + '">' + esc(r.next.label) + '</button>' : '') +
      (r.next ? '' : '<button class="btn-ghost" data-act="again">再记一笔</button>') +
      '</div></div>';
  }

  function Engine(key) {
    const F = FLOWS[key];
    const host = $(HOST[key]);
    const st = { i: 0, vals: {}, picks: [], busy: false, alt: false, vagueAsked: false, overwrite: false, target: '', receipt: null, errMsg: '' };

    const draftKey = () => 'gx.draft.' + key + '.' + GX.monday();

    function saveDraft() {
      try {
        window.GXPreferences.setItem(draftKey(), JSON.stringify({ t: Date.now(), i: st.i, vals: st.vals, picks: st.picks }));
        Bus.emit('draft.save', { note: F.name });
      } catch (e) { /* 存储满或被禁，忽略 */ }
    }

    function loadDraft() {
      try {
        const raw = window.GXPreferences.getItem(draftKey());
        if (!raw) return;
        const d = JSON.parse(raw);
        if (!d || Date.now() - d.t > 7 * 864e5) { window.GXPreferences.removeItem(draftKey()); return; }
        if (d.vals && Object.keys(d.vals).length) {
          st.vals = d.vals;
          st.picks = Array.isArray(d.picks) ? d.picks : [];
          st.i = Math.min(d.i || 0, F.steps.length - 1);
          Bus.emit('draft.restore', { note: F.name + ' 草稿' });
        }
      } catch (e) { /* 坏数据就当没有 */ }
    }

    function clearDraft() {
      try { window.GXPreferences.removeItem(draftKey()); } catch (e) { /* ignore */ }
    }

    function choicesHtml(s) {
      return '<div class="choices">' + s.options.map(o => {
        const v = typeof o === 'string' ? o : o.v;
        const lbl = typeof o === 'string' ? o : o.label;
        const cls = (typeof o === 'object' && o.cls) ? ' ' + o.cls : '';
        return '<button class="choice' + cls + (st.vals[s.f] === v ? ' on' : '') + '" data-act="pick" data-v="' + esc(v) + '">' + esc(lbl) + '</button>';
      }).join('') + '</div>';
    }

    function pick2Html() {
      const list = cardsOf();
      if (list.length < 2) {
        return '<div class="blank" style="border:0">卡片不足两张。<b>暮省落盘时，触句会自动成一张卡</b></div>';
      }
      const sorted = list.slice().sort((a, b) => (a.tag || '～') === (b.tag || '～') ? (a.date < b.date ? 1 : -1) : ((a.tag || '～') < (b.tag || '～') ? -1 : 1));
      return '<div class="lu-pick">' + sorted.map(c => {
        const on = st.picks.indexOf(c.file) > -1;
        return '<button class="lu-card' + (on ? ' on' : '') + '" data-act="toggle" data-file="' + esc(c.file) + '">' +
          '<span class="lu-tag' + (c.tag ? '' : ' none') + '">' + esc(c.tag || '未填标签') + '</span>' +
          '<span class="lu-q">' + esc((c.body || '').replace(/\s+/g, ' ').slice(0, 60)) + '</span>' +
          '<span class="lu-d">' + esc(c.date) + '</span>' +
          '</button>';
      }).join('') + '</div>' +
        '<p class="lu-n">已挑 <b>' + st.picks.length + '</b> 张 · 最多三张</p>';
    }

    function cardsHtml() {
      const list = cardsOf().filter(c => st.picks.indexOf(c.file) > -1)
        .sort((a, b) => st.picks.indexOf(a.file) - st.picks.indexOf(b.file));
      return '<div class="lu-grid">' + list.map(c =>
        '<div class="lu-one"><span class="lu-tag' + (c.tag ? '' : ' none') + '">' + esc(c.tag || '未填标签') + '</span>' +
        '<div class="lu-body">' + esc(c.body) + '</div>' +
        '<span class="lu-d">' + esc(c.date) + '</span></div>').join('') + '</div>' +
        choicesHtml(F.steps[st.i]);
    }

    function stepHtml(s) {
      if (s.kind === 'read') {
        return '<div class="rd-bar">' +
          '<button class="btn-ghost" data-act="timer">五分钟</button>' +
          '<span class="rd-clock"></span>' +
          '<span class="sp"></span>' +
          s.options.map(o => '<button class="' + (o.v === '完整' ? 'btn-primary' : 'btn-ghost') +
            '" data-act="pick" data-v="' + esc(o.v) + '">' + esc(o.label) + '</button>').join('') +
          '</div>' +
          '<p class="rd-tip">' + esc(s.hint) + '</p>' +
          '<p class="rd-tip rd-down">原文就是这一页下方那一篇，整篇摆着，一字没改。' +
          '<button class="link" data-act="to-text">翻到原文</button></p>';
      }
      if (s.kind === 'choice') return choicesHtml(s);
      if (s.kind === 'pick2') return pick2Html();
      if (s.kind === 'cards') return cardsHtml();
      return '<textarea class="wiz-ta" rows="' + (s.rows || 2) + '" data-f="' + s.f + '" placeholder="' +
        (s.pick ? '点下方原文里的句子会自动填到这里，也可以自己抄' : '照实写，越具体越好') + '">' + esc(st.vals[s.f] || '') + '</textarea>';
    }

    /* 回放：把所选那周的「照」与「行」原样摆出来，一字不改 */
    function paintPreview() {
      const box = $('zPreview');
      if (!box) return;
      const d = window.GXData;
      const w = d && d.weeks.find(x => x.date === st.target);
      const b = w && w.blocks.filter(x => x.hasAct).pop();
      if (!b) { box.innerHTML = '<div class="blank" style="border:0">这一周没有「行」可回放。</div>'; return; }
      const dd = new Date(w.date + 'T00:00:00');
      box.innerHTML = '<div class="replay" style="margin:0 0 18px">' +
        '<div class="hd">这是你 ' + (dd.getMonth() + 1) + ' 月 ' + dd.getDate() + ' 日写的：</div>' +
        (b.scene ? '<div class="ln"><b>情境</b>' + esc(b.scene) + '</div>' : '') +
        (b.react ? '<div class="ln"><b>反应</b>' + esc(b.react) + '</div>' : '') +
        '<div class="ln"><b>行</b>' + esc(b.act) + '</div></div>';
    }

    function render() {
      if (!host) return;
      if (st.receipt) { host.innerHTML = receiptHtml(st.receipt); return; }
      const s = F.steps[st.i];
      const q = st.alt && s.alt ? s.alt.q : s.q;
      const last = st.i === F.steps.length - 1;
      const many = F.steps.length > 1;
      const u = unitName();

      let h = '<div class="wiz-top"><span class="wn">' + F.name + '</span>' +
        (u ? '<span class="wu">' + esc(u.replace(/-/g, ' · ')) + '</span>' : '') +
        (many ? '<span class="wi">第 ' + (st.i + 1) + ' / ' + F.steps.length + ' 问</span>' : '') + '</div>';

      if (many) h += '<div class="wiz-bar">' + F.steps.map((_, j) => '<i class="' + (j <= st.i ? 'on' : '') + '"></i>').join('') + '</div>';

      if (key === 'zhao') {
        h += '<label class="wiz-sel">回照对象' +
          '<select data-act="target">' + (st.targets || []).map(t =>
            '<option value="' + esc(t.date) + '"' + (t.date === st.target ? ' selected' : '') + '>' +
            esc(t.label) + '</option>').join('') + '</select></label>';
      }

      h += '<div class="wiz-q">' + esc(q) + '</div>' +
        (s.kind === 'read' ? '' : '<p class="wiz-hint">' + esc(s.hint || '') + (st.alt && s.alt ? '　仍想不起来就点下面「' + s.alt.again + '」。' : '') + '</p>') +
        stepHtml(s) +
        (s.kind === 'read' ? '' : '<p class="wiz-err' + (st.errMsg ? ' on' : '') + '">' + esc(st.errMsg || '') + '</p>') +
        '<div class="wiz-ft">' +
        (st.i > 0 ? '<button class="btn-ghost" data-act="back">上一步</button>' : '') +
        '<span class="sp"></span>' +
        (st.i === 0 && s.alt ? '<button class="btn-ghost" data-act="alt">' + (st.alt ? s.alt.again : s.alt.label) + '</button>' : '') +
        (s.kind === 'read' ? '' : '<button class="btn-primary" data-act="next">' + (last ? (st.overwrite ? '覆盖它' : '记下') : '下一步') + '</button>') +
        '</div>';

      host.innerHTML = h;
      const tx = $('text');
      if (tx) tx.classList.toggle('reading', s.kind === 'read');
      if (key === 'zhao') paintPreview();
      const ta = host.querySelector('.wiz-ta');
      if (ta) { ta.focus(); ta.selectionStart = ta.value.length; }
    }

    function err(msg) {
      st.errMsg = msg;
      const e = host.querySelector('.wiz-err');
      if (e) { e.textContent = msg; e.classList.add('on'); }
      else UI.toast(msg);
    }

    function setVal(f, v) {
      st.vals[f] = v;
      saveDraft();
      Bus.emit('answer.set', { note: F.name + '·' + f });
    }

    function toggle(file) {
      const i = st.picks.indexOf(file);
      if (i > -1) st.picks.splice(i, 1);
      else {
        if (st.picks.length >= 3) { err('最多三张。'); return; }
        st.picks.push(file);
      }
      saveDraft();
      Bus.emit('card.pick', { note: st.picks.length + ' 张' });
      render();
    }

    function next() {
      const s = F.steps[st.i];
      const v = st.vals[s.f];
      st.errMsg = '';

      if (s.picks) {
        if (st.picks.length < 2) { err('至少挑两张，才谈得上「同一件事」。'); Bus.emit('flow.check.fail', { note: '未挑卡' }); return; }
      } else if (!v || !String(v).trim()) {
        err('这一问还没有回答。');
        Bus.emit('flow.check.fail', { note: '空答' });
        return;
      }

      const soft = F.softer ? F.softer(st.vals) : [];
      if (soft.length) { err(soft[2]); Bus.emit('flow.check.fail', { note: '情境不足' }); return; }

      if (s.vague && vague(v)) {
        if (!st.vagueAsked) {
          st.vagueAsked = true;
          err('能不能写成「在 X 情况下做 Y」这样的动作？再点一次「' + (st.i === F.steps.length - 1 ? '记下' : '下一步') + '」就按原话记下。');
          Bus.emit('flow.check.vague', { note: '行不可观测' });
          return;
        }
        Bus.emit('flow.vague.accepted', { note: '按原话记' });
      }

      /* 回炉：判「不是」就不写卡，不替你连 */
      if (key === 'lu' && s.f === 'judge' && v !== '是，同一件事') {
        st.receipt = {
          t: '没连',
          d: '你说它们不是同一件事。系统不替你连，也不记账。'
        };
        Bus.emit('flow.done', { note: '回炉·未连' });
        render();
        return;
      }

      if (st.i < F.steps.length - 1) {
        st.i++;
        Bus.emit('step.enter', { note: F.name + ' ' + (st.i + 1) });
        render();
        saveDraft();
        return;
      }
      commit();
    }

    async function commit() {
      if (!F.need(st.vals, st)) { err(F.miss); return; }
      if (key === 'zhao' && !st.target) { err('还没有可回照的周记。'); return; }
      if (st.busy) return;
      st.busy = true;
      const btn = host.querySelector('[data-act="next"]');
      if (btn) { btn.disabled = true; btn.textContent = '写入…'; }
      try {
        const body = F.body(st.vals, st);
        let r = await GX.post(F.endpoint, body);
        if (r && r.conflict && !st.overwrite) {
          st.overwrite = true;
          st.busy = false;
          Bus.emit('flow.conflict', { note: '本周已有记录' });
          render();
          return;
        }
        if (r && r.conflict) r = await GX.post(F.endpoint, Object.assign({ overwrite: true }, body));
        clearDraft();
        st.busy = false;
        Bus.emit('flow.done', { note: F.name, file: r && (r.file || r.card) });
        st.receipt = F.receipt(st.vals, r);
        st.vals = {};
        st.picks = [];
        st.i = 0;
        if (window.GXRefresh) await window.GXRefresh();
        render();
      } catch (e) {
        st.busy = false;
        err('没写进去：' + e.message);
        Bus.emit('flow.error', { note: e.message });
        render();
      }
    }

    function reset(silent) {
      st.i = 0; st.vals = {}; st.picks = []; st.alt = false; st.vagueAsked = false;
      st.overwrite = false; st.busy = false; st.receipt = null; st.errMsg = '';
      if (!silent) render();
    }

    /* 把一句原文塞进「触」：空的直接填，已有别的就追加，不覆盖你的字 */
    function adoptTouch(text) {
      const t = String(text || '').trim();
      if (!t) return;
      const cur = String(st.vals.touch || '').trim();
      if (!cur) st.vals.touch = t;
      else if (cur.indexOf(t) < 0) st.vals.touch = cur + '\n' + t;
      else return;
      saveDraft();
      if (host && !host.hidden && st.i === 0 && !st.receipt) render();
    }

    if (host) {
      host.addEventListener('click', e => {
        const sn = e.target.closest('.sen');
        if (sn) {
          host.querySelectorAll('.sen.on').forEach(x => x.classList.remove('on'));
          sn.classList.add('on');
          const t = sn.textContent;
          if (key === 'mu') adoptTouch(t);
          else engines.mu.adoptTouch(t);
          Bus.emit('sentence.pick', { note: t.slice(0, 12) });
          UI.toast(key === 'mu' ? '已填入「触」' : '已取这句 · 暮省的「触」带上了');
          return;
        }
        const b = e.target.closest('[data-act]');
        if (!b) return;
        const act = b.dataset.act;
        if (act === 'next') return next();
        if (act === 'back') { st.i = Math.max(0, st.i - 1); st.overwrite = false; render(); Bus.emit('step.enter', { note: '回退' }); return; }
        if (act === 'pick') {
          const s = F.steps[st.i];
          setVal(s.f, b.dataset.v);
          if (s.instant) return next();
          render();
          const at = st.i;
          setTimeout(() => { if (st.i === at) next(); }, 140);
          return;
        }
        if (act === 'toggle') return toggle(b.dataset.file);
        if (act === 'timer') {
          if (timer) {
            stopTimer();
            const el = host.querySelector('.rd-clock');
            if (el) el.textContent = '';
          } else startTimer();
          return;
        }
        if (act === 'go') { if (window.GXGo) window.GXGo(b.dataset.k); return; }
        if (act === 'to-text') {
          const tx = $('text');
          if (tx) tx.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        if (act === 'again') { reset(true); render(); Bus.emit('flow.again', { note: F.name }); return; }
        if (act === 'alt') {
          if (!st.alt) { st.alt = true; render(); Bus.emit('flow.alt', { note: '本周无触' }); return; }
          notouch();
        }
      });

      host.addEventListener('input', e => {
        const t = e.target.closest('.wiz-ta');
        if (!t) return;
        setVal(t.dataset.f, t.value);
      });

      host.addEventListener('change', e => {
        const s = e.target.closest('select[data-act="target"]');
        if (s) { st.target = s.value; paintPreview(); Bus.emit('replay.target', { note: s.value }); }
      });

      host.addEventListener('keydown', e => {
        if (!e.target.closest('.wiz-ta')) return;
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); next(); }
        if (e.key === 'Escape') { if (window.GXFlow.onClose) window.GXFlow.onClose(key); }
      });
    }

    async function notouch() {
      try {
        const r = await GX.post('/api/notouch', { date: iso() });
        clearDraft();
        Bus.emit('flow.done', { note: '本周无触', file: r && r.file });
        st.receipt = { t: '记下了', d: '这周不写「行」。下周再读。' };
        st.vals = {};
        if (window.GXRefresh) await window.GXRefresh();
        render();
      } catch (e) {
        err('没写进去：' + e.message);
      }
    }

    return {
      key,
      open(targets, target) {
        st.targets = targets || [];
        st.target = target || (st.targets[0] && st.targets[0].date) || '';
        reset(true);
        loadDraft();
        render();
        Bus.emit('flow.open', { note: F.name });
      },
      close() { reset(true); },
      adopt: adoptTouch,
      reset
    };
  }

  const engines = { chen: Engine('chen'), mu: Engine('mu'), zhao: Engine('zhao'), lu: Engine('lu') };

  window.GXFlow = {
    open(key, targets, target) { if (engines[key]) engines[key].open(targets, target); },
    close(key) { if (engines[key]) engines[key].close(); },
    fill(v) { engines.mu.adopt(v); },
    value(key, f) { return ''; },
    vague
  };
})();
