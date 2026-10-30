/* 渲染与交互 */
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  const STEPS = [
    {
      name: '晨读', key: 'chen-du', flow: 'chen', when: '每天早上',
      doing: '这一页的下半幅就是本周原文，整篇摆出，一字不改；另给一个五分钟计时。',
      todo: '出声读一遍。读完点「完整」；今天只能读这一遍，点「底线」。',
      auto: '本周原文、单元名、已记过的档位，全部自动带出。',
      writes: 'weekly/&lt;周一&gt;.md 追加「晨读 日期 档位」，state.md 周档位同步。',
      ban: '不解释字词句、不翻译、不引注；记完只回「记下了」，不加引导语、不追问。'
    },
    {
      name: '暮省', key: 'mu-xing', flow: 'mu', when: '当天晚上',
      doing: '四问一屏一问：触 → 情境 → 反应 → 行。触句从原文点选，情境与反应给输入框。',
      todo: '照实写。写不出可观测的「行」，页面只提醒一次，再点一次就按你的原话记下。',
      auto: '原文就在同一页下方，点一句即填入「触」；草稿留七天。',
      writes: 'weekly/&lt;周一&gt;.md 写「触 / 照 / 行」；cards/&lt;日期&gt;-&lt;单元&gt;.md 出章句卡，标签留空。',
      ban: '不复述你的话、不润色、不评价、不编造情境、不替你改写「行」。'
    },
    {
      name: '回照', key: 'hui-zhao', flow: 'zhao', when: '周末',
      doing: '先把上次的「照」与「行」原样摆出，再问三句。问一是点击，问二问三是输入。',
      todo: '点一个，答两问。答不出就写「没有出现」。',
      auto: '最近一次写了「行」的周记自动选中，目标周可切换。',
      writes: 'sessions/&lt;日期&gt;.md 记「回照对象 + 三问原话」。',
      ban: '不做分析、归纳、解读、建议；不概括改写原文；三问之外不生成任何问题。'
    },
    {
      name: '回炉', key: 'zhou-hui-lu', flow: 'lu', when: '每季',
      doing: '挑两到三张卡并排，问一句「有没有在说同一件事」。判「是」才请你写关联语。',
      todo: '点卡片挑选，点一个判断，再写一句话把它们连起来。',
      auto: '同标签的卡片自动排在前面。',
      writes: '每张卡末尾各追加一行「关联：你的原话（与 …）」，不改原文。',
      ban: '不自动分类、不推荐标签、不生成知识图谱；关联语必须是你说的那句。'
    }
  ];

  let curTag = '';

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 1600);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('已复制：' + text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      toast('已复制：' + text);
    }
  }

  /* 一 今读：卷首这一行，把单元、状态、档位、周次、字数一并写完 */
  function unit(d) {
    const s = d.state;
    const active = !!(s && s.active);
    $('u-unit').textContent = active
      ? s.unit.replace(/-/g, ' · ')
      : (s ? '还没有在读的单元' : '未读到 state.md');
    $('u-state').textContent = s ? s.status : '—';
    $('u-gear').textContent = (s && s.gear) || '—';
    $('u-week').textContent = d.weeks.length ? '第 ' + d.weeks.length + ' 周' : '第 1 周';

    const last = latestGear(d);
    if (last) $('u-gear').textContent = last;

    const chars = (d.text || '').replace(/\s/g, '').length;
    $('u-meta').textContent = chars ? chars + ' 字 · 出声约 ' + Math.max(1, Math.round(chars / 120)) + ' 分钟' : '';
  }

  const SEN = /[^。！？]+[。！？]+[”」]?/g;
  function sentences(p) {
    return (p.match(SEN) || [p]).map(x => '<span class="sen" title="点一下取这一句">' + esc(x) + '</span>').join('');
  }

  function text(d) {
    const box = $('text');
    if (!d.text) {
      box.innerHTML = '<p class="note" style="text-indent:0">未取到原文。把文本放到 <b>texts/' +
        (d.state ? d.state.unit : '单元名') + '.txt</b> 后刷新即可。</p>';
      return;
    }
    const ps = d.text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    box.innerHTML = ps.map(p => '<p>' + sentences(p.replace(/\n/g, '')) + '</p>').join('');
  }

  /* 四序：不是另开一节讲流程，点一下就直接起手；要读规矩才展开这一段 */
  function step(i) {
    const s = STEPS[i];
    if (!s) return;
    const p = $('detail');
    p.hidden = false;
    p.innerHTML =
      '<h4>' + s.name + '　<span class="dh-sub">' + s.key + ' · ' + s.when + '</span></h4>' +
      '<dl class="flowmap">' +
      '<div><dt>页面做</dt><dd>' + s.doing + '</dd></div>' +
      '<div><dt>你做</dt><dd>' + s.todo + '</dd></div>' +
      '<div><dt>自动带入</dt><dd>' + s.auto + '</dd></div>' +
      '<div><dt>落盘</dt><dd>' + s.writes + '</dd></div>' +
      '</dl>' +
      '<div class="ban"><b>不做</b>　' + s.ban + '</div>';

    document.querySelectorAll('#order .step').forEach(el => el.classList.toggle('explain', +el.dataset.step === i));
    const hb = $('howBtn');
    if (hb) { hb.textContent = '收起说明'; hb.setAttribute('aria-expanded', 'true'); }
  }

  function hideStep() {
    const p = $('detail');
    if (p) p.hidden = true;
    document.querySelectorAll('#order .step').forEach(el => el.classList.remove('explain'));
    const hb = $('howBtn');
    if (hb) { hb.textContent = '这一步怎么走'; hb.setAttribute('aria-expanded', 'false'); }
  }

  function markOpen(k) {
    document.querySelectorAll('#order .step').forEach(el => el.classList.toggle('open', !!k && el.dataset.go === k));
  }

  /* 三 周录 */
  function latestGear(d) {
    const recs = [];
    d.weeks.forEach(w => w.records.forEach(r => recs.push(r.gear)));
    return recs.length ? recs[recs.length - 1] : '';
  }

  function weeks(d) {
    const box = $('wrec');
    if (!d.weeks.length) {
      box.innerHTML = '<div class="blank">尚无记录 · <b>第一次晨读落盘后，此处出现档位</b></div>';
      return;
    }
    box.innerHTML = '<div class="timeline">' + d.weeks.map(w => {
      const last = w.records.length ? w.records[w.records.length - 1].gear : '';
      const cls = last === '完整' ? 'full' : last === '底线' ? 'base' : '';
      const touch = w.blocks.filter(b => b.touch).length;
      const act = w.blocks.filter(b => b.hasAct).length;
      return '<div class="wrow ' + cls + '">' +
        '<span class="date">' + esc(w.date) + ' 周</span>' +
        (last ? '<span class="gear ' + cls + '">' + last + '</span>' : '<span class="gear">未记档</span>') +
        '<span class="cnt">档位 ' + w.records.length + ' 次</span>' +
        '<span class="sep"></span>' +
        '<span class="has">' + (touch ? '触 ' + touch + ' 条' : '无触') + (act ? ' · 行 ' + act + ' 条' : '') + '</span>' +
        '</div>';
    }).join('') + '</div>';
  }

  function alertStreak(d) {
    const recs = [];
    d.weeks.forEach(w => w.records.forEach(r => recs.push(r.gear)));
    const box = $('walert');
    if (recs.length < 3) { box.innerHTML = ''; return; }
    const tail = recs.slice(-3);
    if (tail.every(g => g === '底线')) {
      box.innerHTML = '<div class="alert"><b>连续三次底线。</b>周节律会在周日二十时把你叫回来问三句话：是时间不够，还是读不进去？时间被什么占掉了？能不能拆成两个十分钟、分两天做。这不是催补课，是重启。</div>';
    } else {
      box.innerHTML = '';
    }
  }

  /* 四 章句卡 */
  const TAG_WORDS = ['自省', '义利', '言语', '独处', '待人', '为学', '孝亲', '交友', '处困', '改过', '节制', '立志'];

  function tags(d) {
    const bar = $('tagBar');
    const count = w => d.cards.filter(c => c.tag === w).length;
    bar.innerHTML = '<span class="lbl">标 签</span>' +
      '<button class="chip' + (curTag === '' ? ' on' : '') + '" data-tag="">全部<span class="n">' + d.cards.length + '</span></button>' +
      TAG_WORDS.map(w => '<button class="chip' + (curTag === w ? ' on' : '') + '" data-tag="' + w + '">' + w +
        '<span class="n">' + count(w) + '</span></button>').join('');
  }

  function cards(d) {
    const box = $('crec');
    const list = curTag ? d.cards.filter(c => c.tag === curTag) : d.cards;
    if (!list.length) {
      box.innerHTML = '<div class="blank">' + (curTag ? '此标签下暂无卡片' : '尚无卡片 · <b>暮省落盘时，触句自动成一张卡</b>') + '</div>';
      return;
    }
    box.innerHTML = '<div class="cards">' + list.map((c, i) =>
      '<div class="card" data-i="' + i + '">' +
      '<button class="tag' + (c.tag ? '' : ' none') + '" data-tagfile="' + esc(c.file) + '" data-tag="' + esc(c.tag || '') +
      '" title="点一下改标签">' + (c.tag || '未填标签') + '</button>' +
      '<div class="quote">' + esc(c.body || '（空）') + '</div>' +
      '<div class="meta">' + esc(c.date) + '</div>' +
      '</div>').join('') + '</div>';
  }

  /* 五 回照 */
  function replay(d) {
    const box = $('replay');
    let hit = null, week = null;
    for (let i = d.weeks.length - 1; i >= 0 && !hit; i--) {
      const b = d.weeks[i].blocks.filter(x => x.hasAct).pop();
      if (b) { hit = b; week = d.weeks[i]; }
    }
    if (!hit) {
      box.innerHTML = '<div class="blank">还没有可回放的「行」 · <b>写完第一份暮省，这里就会出现上次的行动</b></div>';
      return;
    }
    const dd = new Date(week.date + 'T00:00:00');
    const t0 = new Date();
    t0.setHours(0, 0, 0, 0);
    const days = Math.round((t0.getTime() - dd.getTime()) / 86400000);
    box.innerHTML =
      '<div class="replay">' +
      '<div class="hd">这是你 ' + (dd.getMonth() + 1) + ' 月 ' + dd.getDate() + ' 日写的 · 距 ' + days + ' 天</div>' +
      (hit.scene ? '<div class="ln"><b>情境</b>' + esc(hit.scene) + '</div>' : '') +
      (hit.react ? '<div class="ln"><b>反应</b>' + esc(hit.react) + '</div>' : '') +
      '<div class="ln"><b>行</b>' + esc(hit.act) + '</div>' +
      '</div>';
  }

  /* 六 自检 */
  function health(d) {
    const rows = [
      ['state.md', !!d.state, d.state ? d.state.unit : '缺失'],
      ['texts/' + (d.state ? d.state.unit : '单元') + '.txt', !!d.text, d.text ? '已读到' : '缺失'],
      ['weekly/', d.weeks.length > 0, d.weeks.length ? d.weeks.length + ' 份' : '空'],
      ['cards/', d.cards.length > 0, d.cards.length ? d.cards.length + ' 张' : '空'],
      ['sessions/', d.sessions.length > 0, d.sessions.length ? d.sessions.length + ' 份' : '空']
    ];
    $('health').innerHTML = rows.map(([p, ok, msg]) =>
      '<div class="row ' + (ok ? 'ok' : 'bad') + '"><span class="dot"></span>' +
      '<span class="path">' + esc(p) + '</span><span class="msg">' + esc(msg) + '</span></div>').join('');
  }

  function banner(d) {
    const b = $('banner');
    if (d.errors.length) {
      b.className = 'banner show';
      b.textContent = '部分数据未读到，请检查连接后重试。';
    } else {
      b.className = 'banner';
    }
  }

  /* 今 今日：状态机只给一步 */
  let target = null;
  let targets = [];

  function today(d) {
    const t = GX.monday();
    const wk = d.weeks.find(w => w.date === t);
    const gear = wk && wk.records.length ? wk.records[wk.records.length - 1].gear : '';
    const blk = wk && wk.blocks.length ? wk.blocks[wk.blocks.length - 1] : null;
    const noTouch = !!(wk && wk.blocks.some(b => b.noTouch));
    const done = d.sessions.some(s => s.replace(/\.md$/, '') >= t);
    targets = d.weeks.filter(w => w.date !== t && w.blocks.some(b => b.hasAct))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map(w => {
        const dd = new Date(w.date + 'T00:00:00');
        return { date: w.date, label: (dd.getMonth() + 1) + ' 月 ' + dd.getDate() + ' 日 那一周' };
      });
    target = targets.length ? d.weeks.find(w => w.date === targets[0].date) : null;

    const active = !!(d.state && d.state.active);
    const wrote = noTouch || !!(blk && blk.hasAct);
    const go = $('tGo'), note = $('tNote');
    go.disabled = false;
    go.dataset.step = '';

    if (!active) {
      go.textContent = '选一章';
      note.textContent = d.state
        ? '「' + d.state.unit.replace(/-/g, ' · ') + '」现在是「' + d.state.status + '」，还没有在读的单元。点这里挑一章。'
        : '还没有「在读」的单元。点这里，从四书里挑一章放进 texts/。';
      go.dataset.step = 'pick';
    } else if (!gear) {
      go.textContent = '开始晨读';
      note.textContent = '本周还没有档位。读完记一笔，就算这周开过头了。原文就在下面。';
      go.dataset.step = 'chen';
    } else if (noTouch && (!blk || !blk.hasAct)) {
      go.textContent = '本周无触';
      go.disabled = true;
      note.textContent = '已记「本周无触」。这一周就到这儿，下周再读。';
      go.dataset.step = '';
    } else if (!blk || !blk.hasAct) {
      go.textContent = '开始暮省';
      note.textContent = '本周档位已记（' + gear + '）。周日之前把「触照行」写下来。';
      go.dataset.step = 'mu';
    } else if (target && !done) {
      go.textContent = '开始回照';
      note.textContent = '回照对象：' + targets[0].label + '你写的「行」。';
      go.dataset.step = 'zhao';
      zPreview(target);
    } else {
      go.textContent = '本周走完了';
      go.disabled = true;
      note.textContent = done
        ? '三问已记下。下周原话会再拿出来。'
        : wrote
          ? '这周已写完。还没有可回照的旧「行」，下周把这段原样摆出来。'
          : '没有可回放的「行」，先写一份暮省。';
    }

    /* 四序进度：每条只说一件事实，不解释 */
    const states = [
      gear ? '已记 ' + gear : '待读',
      wrote ? (noTouch ? '本周无触' : '已写') : (gear ? '待写' : '待读'),
      done ? '已回照' : (targets.length ? '待回照' : '无对象'),
      d.cards.length >= 2 ? d.cards.length + ' 张卡' : '按需'
    ];
    const flags = [!!gear, wrote, done, false];
    document.querySelectorAll('#order .step').forEach(el => {
      const i = +el.dataset.step;
      el.classList.toggle('done', flags[i]);
      el.classList.toggle('now', !!go.dataset.step && el.dataset.go === go.dataset.step);
      const em = el.querySelector('[data-st]');
      if (em) em.textContent = states[i];
    });

    go.dataset.label = go.textContent;
    go.dataset.lock = go.disabled ? '1' : '';
    UI._step = go.dataset.step || '';
  }

  function zPreview(w) {
    const b = w.blocks.filter(x => x.hasAct).pop();
    if (!b) return;
    const dd = new Date(w.date + 'T00:00:00');
    $('zPreview').innerHTML =
      '<div class="replay" style="margin:0 0 18px">' +
      '<div class="hd">这是你 ' + (dd.getMonth() + 1) + ' 月 ' + dd.getDate() + ' 日写的：</div>' +
      (b.scene ? '<div class="ln"><b>情境</b>' + esc(b.scene) + '</div>' : '') +
      (b.react ? '<div class="ln"><b>反应</b>' + esc(b.react) + '</div>' : '') +
      '<div class="ln"><b>行</b>' + esc(b.act) + '</div>' +
      '</div>';
  }

  /* 复习队列：近四周卡片取三张，只问认不认，不排期 */
  function review(d) {
    const box = $('review');
    const t0 = new Date();
    t0.setHours(0, 0, 0, 0);
    const list = d.cards.filter(c => (t0 - new Date(c.date + 'T00:00:00')) / 86400000 <= 28).slice(0, 3);
    if (!list.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<div class="revs"><div class="rev-hd">本周温故 · 还认这句话吗</div>' +
      list.map(c => '<div class="rev"><span class="tag' + (c.tag ? '' : ' none') + '">' + (c.tag || '未填标签') +
        '</span><span>' + esc(c.body) + '</span></div>').join('') + '</div>';
  }

  function render(d) {
    unit(d); text(d); today(d); weeks(d); alertStreak(d); tags(d); cards(d); review(d); replay(d); health(d); banner(d);
  }

  window.UI = {
    render, step, hideStep, markOpen, toast, copy, esc, TAG_WORDS,
    getTag: () => curTag, setTag: t => { curTag = t; },
    getTarget: () => target, getTargets: () => targets, getStep: () => UI._step || ''
  };
})();
