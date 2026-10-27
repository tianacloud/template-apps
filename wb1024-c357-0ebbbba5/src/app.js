/* 引导：主题、字号、面板开关、四序入口、卡片标签、事件装配 */
(function () {
  const $ = id => document.getElementById(id);
  const Bus = window.GXBus;
  const THEMES = [['paper', '宣纸'], ['night', '夜读'], ['celadon', '青瓷']];
  const PANELS = { chen: 'tChen', mu: 'tMu', zhao: 'tZhao', lu: 'tLu' };
  const STEP_OF = { chen: 0, mu: 1, zhao: 2, lu: 3 };
  const NAME_OF = { chen: '晨读', mu: '暮省', zhao: '回照', lu: '回炉' };

  /* 主题 */
  let ti = Math.max(0, THEMES.findIndex(t => t[0] === (localStorage.getItem('gx.theme') || 'paper')));
  function paint() {
    document.documentElement.dataset.theme = THEMES[ti][0];
    $('themeName').textContent = THEMES[ti][1];
    localStorage.setItem('gx.theme', THEMES[ti][0]);
  }
  paint();
  $('themeBtn').onclick = () => { ti = (ti + 1) % THEMES.length; paint(); UI.toast('纸色：' + THEMES[ti][1]); };

  /* 字号 */
  let size = localStorage.getItem('gx.size') || 'md';
  function setSize(s) {
    size = s;
    $('text').dataset.size = s;
    document.querySelectorAll('button[data-size]').forEach(b => b.classList.toggle('on', b.dataset.size === s));
    localStorage.setItem('gx.size', s);
  }
  setSize(size);
  document.querySelectorAll('button[data-size]').forEach(b => b.onclick = () => setSize(b.dataset.size));

  /* 面板：谁开着由这里说了算，刷新数据不会把正在写的面板关掉 */
  let openKey = '', appliedKey = '';

  function syncPanels() {
    Object.entries(PANELS).forEach(([k, id]) => { const el = $(id); if (el) el.hidden = k !== openKey; });
    UI.markOpen(openKey);
    syncTodayBtn();
    if (appliedKey === openKey) return;
    appliedKey = openKey;
    if (openKey === 'chen') GXFlow.open('chen');
    if (openKey === 'mu') GXFlow.open('mu');
    if (openKey === 'zhao') GXFlow.open('zhao', UI.getTargets(), (UI.getTarget() || {}).date);
    if (openKey === 'lu') GXFlow.open('lu');
  }

  /* 主按钮：正在走的这一步，按下去是收起，不再重复「开始」 */
  function syncTodayBtn() {
    const b = $('tGo');
    if (!b) return;
    if (openKey && openKey === UI.getStep()) { b.textContent = '收起' + NAME_OF[openKey]; b.disabled = false; return; }
    if (b.dataset.label) b.textContent = b.dataset.label;
    b.disabled = b.dataset.lock === '1';
  }

  function go(k) {
    if (!k) { openKey = ''; appliedKey = ''; syncPanels(); return; }
    const d = window.GXData;
    const noUnit = !(d && d.state && d.state.active);
    if (k === 'pick' || (noUnit && k !== 'lu')) {
      if (window.GXPicker) window.GXPicker.open('');
      return;
    }
    openKey = k === openKey ? '' : k;
    appliedKey = '';
    if (openKey) {
      if (curTab !== 'jindu') setTab('jindu', { silent: true });  /* 四序面板都在今读这一卷 */
      curStep = STEP_OF[openKey];
      if (!$('detail').hidden) UI.step(curStep);
    }
    syncPanels();
    if (!openKey) return;
    Bus.emit('step.enter', { note: openKey });
    const el = $(PANELS[openKey]);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 40);
  }
  window.GXGo = go;

  /* 今日：一步一件事 */
  $('tGo').onclick = () => {
    if (openKey && openKey === UI.getStep()) { go(openKey); return; }
    const k = $('tGo').dataset.step || UI.getStep();
    if (!k) return;
    if (k === 'pick') { if (window.GXPicker) window.GXPicker.open(''); return; }
    go(k);
  };

  /* 四序：点一步直接起手；要知道这一步的规矩，再点「这一步怎么走」 */
  let curStep = 0;

  $('howBtn').onclick = () => {
    if (!$('detail').hidden) { UI.hideStep(); return; }
    const fromFlow = openKey ? STEP_OF[openKey] : STEP_OF[UI.getStep()];
    curStep = fromFlow == null ? 0 : fromFlow;
    UI.step(curStep);
  };

  document.addEventListener('keydown', e => {
    if ($('detail').hidden) return;
    if (e.target && e.target.matches && e.target.matches('input, textarea, select')) return;
    if (e.key === 'ArrowRight') { curStep = (curStep + 1) % 4; UI.step(curStep); }
    if (e.key === 'ArrowLeft') { curStep = (curStep + 3) % 4; UI.step(curStep); }
  });

  /* 任何地方出现的起手按钮 */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-start],[data-go]');
    if (!b) return;
    go(b.dataset.start || b.dataset.go);
  });

  /* 点原文句子 → 暮省的「触」 */
  $('text').addEventListener('click', e => {
    const s = e.target.closest('.sen');
    if (!s) return;
    document.querySelectorAll('.sen.on').forEach(x => x.classList.remove('on'));
    s.classList.add('on');
    Bus.emit('sentence.pick', { note: s.textContent.slice(0, 12) });
    GXFlow.fill(s.textContent);
    UI.toast('已取这一句 · 暮省的「触」带上了');
  });

  /* 卡片：展开 / 改标签 */
  $('crec').addEventListener('click', e => {
    const tb = e.target.closest('[data-tagfile]');
    if (tb) { editTag(tb); return; }
    const c = e.target.closest('.card');
    if (c) c.classList.toggle('open');
  });

  function editTag(el) {
    const file = el.dataset.tagfile;
    const cur = el.dataset.tag || '';
    const sel = document.createElement('select');
    sel.className = 'tag-sel';
    sel.innerHTML = '<option value="">未填标签</option>' +
      UI.TAG_WORDS.map(w => '<option' + (w === cur ? ' selected' : '') + '>' + w + '</option>').join('');
    el.replaceWith(sel);
    sel.focus();
    let done = false;
    sel.onchange = async () => {
      done = true;
      sel.disabled = true;
      try {
        await GX.post('/api/tag', { file, tag: sel.value });
        Bus.emit('tag.set', { note: (sel.value || '清空') });
        UI.toast('标签：' + (sel.value || '已清空'));
        await GXRefresh();
      } catch (err) {
        UI.toast('没写上：' + err.message);
        sel.disabled = false;
      }
    };
    sel.onblur = () => { if (!done && sel.parentNode) sel.replaceWith(el); };
  }

  /* 标签筛选 */
  $('tagBar').addEventListener('click', e => {
    const b = e.target.closest('[data-tag]');
    if (!b || !DATA) return;
    UI.setTag(b.dataset.tag);
    UI.render(DATA);
    syncPanels();
  });

  /* 分卷：顶部一条横向 tab，一次只摆一卷，不再往下堆成长页 */
  const TABS = ['jindu', 'zhoulu', 'kapian', 'huizhao', 'jielv', 'beifen'];
  const tabEls = [...document.querySelectorAll('#nav a')];
  let curTab = 'jindu';

  function setTab(id, opts) {
    id = TABS.indexOf(id) > -1 ? id : 'jindu';
    curTab = id;
    TABS.forEach(k => {
      const sec = $(k);
      if (sec) { sec.hidden = k !== id; sec.classList.toggle('on', k === id); }
    });
    tabEls.forEach(a => {
      const on = a.dataset.tab === id;
      a.classList.toggle('active', on);
      a.setAttribute('aria-selected', on ? 'true' : 'false');
      a.tabIndex = on ? 0 : -1;
    });
    if (opts && opts.silent) return;
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    Bus.emit('tab.switch', { note: id });
  }
  window.GXTab = { set: id => setTab(id), get: () => curTab };

  tabEls.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    setTab(a.dataset.tab);
  }));
  const brand = document.querySelector('.tb-brand');
  if (brand) brand.addEventListener('click', e => { e.preventDefault(); setTab('jindu'); });

  $('nav').addEventListener('keydown', e => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = (TABS.indexOf(curTab) + d + TABS.length) % TABS.length;
    setTab(TABS[i]);
    const t = tabEls.find(a => a.dataset.tab === TABS[i]);
    if (t) t.focus();
  });

  window.addEventListener('hashchange', () => setTab(location.hash.slice(1), { silent: true }));

  setTab(TABS.indexOf((location.hash || '').slice(1)) > -1 ? location.hash.slice(1) : 'jindu', { silent: true });

  /* 键盘：晨读面板内 1/2 记档位，Esc 收起 */
  document.addEventListener('keydown', e => {
    const t = e.target;
    if (t && t.matches && t.matches('input, textarea, select')) return;
    if (e.key === 'Escape') {
      if (!$('picker').hidden) return;
      if (openKey) { openKey = ''; appliedKey = ''; syncPanels(); return; }
      if (!$('detail').hidden) UI.hideStep();
      return;
    }
    if (openKey !== 'chen') return;
    const hit = e.key === '1' ? '完整' : e.key === '2' ? '底线' : '';
    if (!hit) return;
    const b = document.querySelector('#wizChen [data-v="' + hit + '"]');
    if (b) b.click();
  });

  /* 数据 */
  let DATA = null, deepDone = false;
  window.GXRefresh = () => GX.load().then(d => {
    DATA = d;
    window.GXData = d;
    UI.render(d);
    syncPanels();
    Bus.emit('data.load', { note: d.errors.length ? d.errors.length + ' 处缺' : 'ok' });
    if (d.state && d.state.active) document.title = d.state.unit + ' · 四书修习';
    const deep = new URLSearchParams(location.search).get('step');
    if (!deepDone && deep) {
      deepDone = true;
      if (PANELS[deep]) setTimeout(() => go(deep), 260);
    }
  });
  window.GXSvc = { ok: true };
  window.GXRefresh().catch(e => { $('banner').className='banner show'; $('banner').textContent='数据读取失败：'+e.message; });
})();
