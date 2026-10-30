/* 选篇抽屉：书目 → 篇卷 → 章 → 预览 → 放入 texts/ */
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  let corpus = null, book = '', vol = '', cur = null, have = new Set(), busy = false, pref = '', prefTitle = '';

  const haveSet = () => new Set((window.GXData && window.GXData.texts) || []);
  const unitsOf = () => (corpus ? corpus.units.filter(u => u.book === book) : []);
  const volsOf = () => [...new Set(unitsOf().map(u => u.vol).filter(Boolean))];
  const listOf = () => unitsOf().filter(u => !vol || u.vol === vol);
  const labelOf = u => (vol && u.vol ? u.title.replace(u.vol + '·', '') : u.title);

  const waitData = () => new Promise(res => {
    if (window.GXData) return res();
    const t = setInterval(() => { if (window.GXData) { clearInterval(t); res(); } }, 80);
    setTimeout(() => { clearInterval(t); res(); }, 2500);
  });

  async function open(want, wantTitle) {
    if (want) pref = want;
    if (wantTitle !== undefined) prefTitle = wantTitle;
    $('pickMask').hidden = false;
    $('picker').hidden = false;
    document.documentElement.style.overflow = 'hidden';
    if (corpus) { have = haveSet(); reset(); return; }
    $('pickList').innerHTML = '<div class="blank" style="border:0">读取语料…</div>';
    await waitData();
    try {
      const r = await window.GXFiles.get('template-assets/corpus/sishu.json');
      if (!r.ok) throw new Error('HTTP ' + r.status + ' · 文件不存在');
      const raw = await r.text();
      try { corpus = JSON.parse(raw); }
      catch (e) { throw new Error('语料格式不正确（' + e.message + '）'); }
      if (!corpus || !corpus.books || !corpus.units) throw new Error('结构不对 · 缺 books / units');
      have = haveSet();
      book = (pref && corpus.books[pref]) ? pref : Object.keys(corpus.books)[0];
      reset();
    } catch (e) {
      $('pickList').innerHTML = '<div class="blank" style="border:0">语料读不出来：' + esc(e.message) +
        '<br>请检查网络连接后重试。</div>';
    }
  }

  function reset() {
    vol = '';
    if (prefTitle) {
      const v = volsOf().find(x => x === prefTitle || x.endsWith(prefTitle));
      if (v) vol = v;
    }
    const v0 = volsOf();
    if (!vol && v0.length) vol = v0[0];
    paint();
  }

  function close() {
    $('picker').hidden = true;
    $('pickMask').hidden = true;
    document.documentElement.style.overflow = '';
  }

  function paint() {
    $('pickBooks').innerHTML = Object.keys(corpus.books).map(b =>
      '<button data-book="' + esc(b) + '" class="' + (b === book ? 'on' : '') + '">' + esc(b) + '</button>').join('');

    const vols = volsOf();
    $('pickVols').innerHTML = vols.length
      ? '<button data-vol="" class="' + (vol ? '' : 'on') + '">全部</button>' +
        vols.map(v => '<button data-vol="' + esc(v) + '" class="' + (v === vol ? 'on' : '') + '">' + esc(v) + '</button>').join('')
      : '';

    const list = listOf();
    $('pickList').innerHTML = list.length
      ? list.map(u => {
          const done = have.has(u.id);
          const head = u.paras[0] || '';
          return '<button data-id="' + esc(u.id) + '" class="' + (cur && cur.id === u.id ? 'on ' : '') + (done ? 'done' : '') + '">' +
            '<span>' + esc(labelOf(u)) + '</span>' +
            '<em>' + esc(head.slice(0, 12)) + '</em>' +
            '<i>' + (done ? '已收 · ' : '') + u.chars + ' 字</i></button>';
        }).join('')
      : '<div class="blank" style="border:0">此卷为空</div>';

    if (cur && !list.some(u => u.id === cur.id)) cur = null;
    if (!cur && prefTitle) {
      cur = list.find(u => u.title === prefTitle) || null;
    }
    renderPrev();
  }

  function renderPrev() {
    const box = $('pickPrev');
    if (!cur) {
      box.innerHTML = '<div class="blank" style="border:0">选一章，看原文</div>';
      return;
    }
    const done = have.has(cur.id);
    box.innerHTML =
      '<div class="prev-hd"><b>' + esc(cur.title) + '</b>' +
      '<span>' + cur.chars + ' 字 · 单元名 ' + esc(cur.id) + '</span></div>' +
      '<div class="prev-body">' + cur.paras.map(p => '<p>' + esc(p) + '</p>').join('') + '</div>' +
      (cur.variants && cur.variants.length
        ? '<div class="prev-var">异文校记：' + cur.variants.map(esc).join('；') + '</div>' : '') +
      '<div class="prev-act">' +
      '<button class="btn-primary" id="pickPut">' + (done ? '重新放入 texts/' : '放入 texts/ 并设为在读') + '</button>' +
      '<span class="prev-note">写入 ' + esc(cur.id) + '.txt，并把 state.md 的这一行置为「在读」</span>' +
      '</div>';
    $('pickPut').onclick = () => put(cur);
  }

  async function put(u) {
    if (busy) return;
    busy = true;
    const btn = $('pickPut');
    btn.disabled = true;
    btn.textContent = '写入中…';
    try {
      const d = await GX.post('/api/select', { unit: u.id, paras: u.paras });
      UI.toast(d.prev ? '已放入 ' + d.unit + '　原「' + d.prev + '」转待回炉' : '已放入 ' + d.unit);
      close();
      if (window.GXRefresh) await window.GXRefresh();
      have = haveSet();
    } catch (e) {
      UI.toast('写入失败：' + e.message);
      btn.disabled = false;
      btn.textContent = '重试';
    } finally {
      busy = false;
    }
  }

  $('pickOpen').onclick = () => open('');
  $('pickClose').onclick = close;
  $('pickMask').onclick = close;
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('picker').hidden) close(); });

  $('pickBooks').addEventListener('click', e => {
    const b = e.target.closest('[data-book]');
    if (!b) return;
    book = b.dataset.book; cur = null; prefTitle = ''; reset();
  });
  $('pickVols').addEventListener('click', e => {
    const b = e.target.closest('[data-vol]');
    if (!b) return;
    vol = b.dataset.vol; cur = null; paint();
  });
  $('pickList').addEventListener('click', e => {
    const b = e.target.closest('[data-id]');
    if (!b) return;
    cur = listOf().find(u => u.id === b.dataset.id) || null;
    [...$('pickList').children].forEach(c => c.classList.remove('on'));
    b.classList.add('on');
    renderPrev();
  });

  const deep = location.hash.match(/^#pick(?:\/([^/]+))?(?:\/(.+))?$/);
  if (deep) open(deep[1] ? decodeURIComponent(deep[1]) : '', deep[2] ? decodeURIComponent(deep[2]) : '');

  window.GXPicker = { open, close };
})();
