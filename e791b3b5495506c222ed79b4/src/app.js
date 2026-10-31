/* 速配一餐 · 交互逻辑 */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* 手绘图标：没装图标库或没配到图就回退 emoji */
  const icon = id => (typeof window.foodSVG === 'function' ? window.foodSVG(id) : '');
  const dishIcon = r => (r && r.need && r.need.length ? icon(r.need[0]) : '');

  const BLOB = ['#FBEBD8', '#F7E6DC', '#EDF2E2', '#FBF2D9', '#F1E9F5', '#E8F0F0', '#FDE9E4', '#F3EDDF'];
  const LEVEL_TXT = { 1: '新手友好', 2: '一般难度', 3: '要看着火' };
  const TIER_TXT = [
    { key: 0, title: '现在就能做', note: '材料齐了，起锅就行' },
    { key: 1, title: '差一样', note: '缺的那样可以省，也可以顺路买' },
    { key: 2, title: '差两样', note: '想换花样再看这些' }
  ];

  const state = {
    selected: new Set(),      // 食材 id
    customs: [],              // 自定义食材 {id,name}
    season: new Set(),        // 调料 id
    cat: 'veg',
    query: '',
    results: [],
    aiRecipes: [],
    aiOk: null,               // 云端模型是否可用，null = 还没探测出来
    expanded: {},             // 各档结果是否已全部展开
    pantryOpen: false,        // 「偶尔才有」调料是否全部展开
    view: 'picker'
  };

  const ingMap = new Map(INGREDIENTS.map(i => [i.id, i]));
  const seasonMap = new Map();
  PANTRY.forEach(g => g.items.forEach(i => seasonMap.set(i.id, i)));

  function blobColor(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
    return BLOB[h % BLOB.length];
  }

  /* ─────────────── 初始化调料 ─────────────── */
  function initPantry() {
    PANTRY.forEach(g => {
      if (g.group === 'base') {
        g.items.forEach(i => state.season.add(i.id));
      } else if (g.defaultOn) {
        g.items.forEach(i => state.season.add(i.id));
      }
    });
  }

  function renderPantry() {
    const box = $('#pantryGroups');
    box.innerHTML = '';
    PANTRY.forEach(g => {
      const wrap = document.createElement('div');
      wrap.className = 'pgroup';
      const head = document.createElement('div');
      head.className = 'pgroup-title';
      head.innerHTML = '<b>' + g.label + '</b><i>' + g.note + '</i>';
      wrap.appendChild(head);

      const pills = document.createElement('div');
      pills.className = 'pills';

      // 调料太多，「偶尔才有」默认只露一小截，避免一屏几十个药丸
      const CAP = 12;
      const collapsed = g.group === 'more' && !state.pantryOpen && g.items.length > CAP;
      const list = collapsed ? g.items.slice(0, CAP) : g.items;

      list.forEach(it => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'pill' + (g.group === 'base' ? ' locked' : '');
        b.setAttribute('aria-pressed', state.season.has(it.id) ? 'true' : 'false');
        b.textContent = it.name;
        if (g.group === 'base') {
          b.disabled = true;
        } else {
          b.addEventListener('click', () => {
            if (state.season.has(it.id)) state.season.delete(it.id);
            else state.season.add(it.id);
            b.setAttribute('aria-pressed', state.season.has(it.id) ? 'true' : 'false');
          });
        }
        pills.appendChild(b);
      });

      if (collapsed) {
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'pill pill-more';
        more.textContent = '更多 ' + (g.items.length - CAP) + ' 种 ▾';
        more.addEventListener('click', () => {
          state.pantryOpen = true;
          renderPantry();
        });
        pills.appendChild(more);
      } else if (g.group === 'more' && state.pantryOpen && g.items.length > CAP) {
        const less = document.createElement('button');
        less.type = 'button';
        less.className = 'pill pill-more';
        less.textContent = '收起 ▴';
        less.addEventListener('click', () => {
          state.pantryOpen = false;
          renderPantry();
        });
        pills.appendChild(less);
      }

      wrap.appendChild(pills);
      box.appendChild(wrap);
    });
  }

  /* ─────────────── 食材网格 ─────────────── */
  function renderTabs() {
    const box = $('#catTabs');
    box.innerHTML = '';
    CATS.forEach(c => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tab';
      b.textContent = c.name;
      b.setAttribute('aria-selected', state.cat === c.id ? 'true' : 'false');
      b.addEventListener('click', () => {
        state.cat = c.id;
        state.query = '';
        $('#searchInput').value = '';
        renderTabs();
        renderGrid();
      });
      box.appendChild(b);
    });
  }

  function renderGrid() {
    const box = $('#ingGrid');
    const q = state.query.trim();
    const list = INGREDIENTS.filter(i => {
      if (!q) return i.cat === state.cat;
      return i.name.includes(q);
    });

    box.innerHTML = '';
    list.forEach(i => box.appendChild(ingButton(i)));

    const hits = renderDishHits(q);

    // 搜索无结果、也不是菜名 → 允许当作自定义食材添加
    if (q && list.length === 0 && hits === 0) {
      const already = state.customs.some(c => c.name === q);
      if (!already) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ing';
        b.innerHTML =
          '<span class="blob" style="--blob-bg:#EFF6E7">➕</span>' +
          '<span class="nm">添加「' + escapeHtml(q.slice(0, 6)) + '」</span>';
        b.addEventListener('click', () => {
          const name = q.slice(0, 8);
          state.customs.push({ id: 'c_' + name, name: name });
          state.selected.add('c_' + name);
          state.query = '';
          $('#searchInput').value = '';
          renderChips();
          renderGrid();
          updateDock();
        });
        box.appendChild(b);
      }
    }

    const cat = CATS.find(c => c.id === state.cat);
    $('#catHint').textContent = q
      ? (list.length ? '找到 ' + list.length + ' 样食材' : (hits ? '' : '没找到，可以直接添加'))
      : (cat ? cat.hint : '');

    renderDishHits(q);
  }

  /* 按菜名搜：直接跳到那道菜的做法，不用先凑食材 */
  function renderDishHits(q) {
    const box = $('#dishHits');
    if (!box) return 0;
    box.innerHTML = '';
    if (!q) return 0;

    const hits = RECIPES.filter(r => r.name.includes(q)).slice(0, 12);
    if (!hits.length) return 0;

    const title = document.createElement('p');
    title.className = 'dish-hits-title';
    title.textContent = '菜单里有这几道（点开直接看做法）';
    box.appendChild(title);

    const wrap = document.createElement('div');
    wrap.className = 'dish-hits-list';
    hits.forEach(r => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dish-hit';
      b.innerHTML =
        '<span class="dh-emoji">' + (dishIcon(r) || r.emoji) + '</span>' +
        '<span class="dh-name">' + escapeHtml(r.name) + '</span>' +
        '<span class="dh-meta">' + r.time + ' 分钟</span>';
      b.addEventListener('click', () => {
        const sel = state.selected;
        openRecipe({
          recipe: r,
          tier: 0,
          covered: r.need.filter(id => sel.has(id)),
          missing: r.need.filter(id => !sel.has(id)),
          missSeason: (r.extra || []).filter(id => !state.season.has(id))
        }, false);
      });
      wrap.appendChild(b);
    });
    box.appendChild(wrap);
    return hits.length;
  }

  function ingButton(i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ing';
    b.setAttribute('aria-pressed', state.selected.has(i.id) ? 'true' : 'false');
    b.innerHTML =
      '<span class="blob' + (icon(i.id) ? ' has-fi' : '') + '" style="--blob-bg:' + blobColor(i.id) + '">' +
        (icon(i.id) || i.emoji) + '</span>' +
      '<span class="nm">' + i.name + '</span>';
    b.addEventListener('click', () => {
      if (state.selected.has(i.id)) state.selected.delete(i.id);
      else state.selected.add(i.id);
      b.setAttribute('aria-pressed', state.selected.has(i.id) ? 'true' : 'false');
      renderChips();
      updateDock();
    });
    return b;
  }

  function renderChips() {
    const box = $('#selectedChips');
    box.innerHTML = '';
    state.selected.forEach(id => {
      const info = ingMap.get(id) || state.customs.find(c => c.id === id);
      if (!info) return;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      const ic = icon(info.id);
      chip.innerHTML = '<span class="chip-ico' + (ic ? ' has-fi' : '') + '">' + (ic || info.emoji || '🥄') + '</span>' +
        escapeHtml(info.name) + '<span class="x">✕</span>';
      chip.addEventListener('click', () => {
        state.selected.delete(id);
        renderChips();
        renderGrid();
        updateDock();
      });
      box.appendChild(chip);
    });
    $('#selCount').textContent = '已选 ' + state.selected.size + ' 样';
  }

  /* ─────────────── 匹配 ─────────────── */
  function selectedNames() {
    return Array.from(state.selected).map(id => {
      const info = ingMap.get(id) || state.customs.find(c => c.id === id);
      return info ? info.name : '';
    }).filter(Boolean);
  }

  function match() {
    const sel = state.selected;
    const out = [];
    if (sel.size === 0) return out;

    RECIPES.forEach(r => {
      const covered = r.need.filter(id => sel.has(id));
      if (covered.length === 0) return;
      const missing = r.need.filter(id => !sel.has(id));
      const missSeason = (r.extra || []).filter(id => !state.season.has(id));
      let tier;
      if (missing.length === 0) tier = 0;
      else if (missing.length === 1) tier = 1;
      else if (missing.length === 2 && covered.length >= 1) tier = 2;
      else return;

      const score =
        (tier === 0 ? 1000 : tier === 1 ? 600 : 300) +
        covered.length * 14 -
        missSeason.length * 26 -
        r.time * 0.15;

      out.push({ recipe: r, covered, missing, missSeason, tier, score });
    });

    out.sort((a, b) => (a.tier - b.tier) || (b.score - a.score));
    return out;
  }

  /* ─────────────── 结果页 ─────────────── */
  function showResults() {
    state.results = match();
    state.expanded = {};
    state.view = 'results';
    $('#picker').classList.add('hidden');
    $('#results').classList.remove('hidden');
    $('#goBtn').classList.add('hidden');
    $('#backBtn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'auto' });
    renderResults();
  }

  function backToPicker() {
    state.view = 'picker';
    $('#picker').classList.remove('hidden');
    $('#results').classList.add('hidden');
    $('#goBtn').classList.remove('hidden');
    $('#backBtn').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  const TIER_CAP = { 0: 40, 1: 18, 2: 12 };

  function renderResults() {
    const res = state.results;
    const head = $('#resultHead');
    const body = $('#resultBody');

    const groups = TIER_TXT
      .map(t => {
        const all = res.filter(r => r.tier === t.key);
        const cap = state.expanded[t.key] ? all.length : TIER_CAP[t.key];
        return {
          key: t.key, title: t.title, note: t.note,
          items: all.slice(0, cap),
          hidden: Math.max(0, all.length - cap)
        };
      })
      .filter(g => g.items.length);

    const shown = groups.reduce((n, g) => n + g.items.length, 0);
    const zero = res.filter(r => r.tier === 0).length;
    const quick = res.filter(r => r.tier === 0 && r.recipe.time <= 20).length;

    if (!shown && state.aiRecipes.length === 0) {
      head.innerHTML =
        '<div class="empty">' +
        '<span class="e-emoji">🍳</span>' +
        '<p>手边这几样，暂时凑不出一顿像样的饭</p>' +
        '<p class="small">再加一样主料试试，比如鸡蛋、肉或者面</p>' +
        '</div>';
    } else {
      const total = res.length + state.aiRecipes.length;
      let words, sub;
      if (zero > 0) {
        words = '手边 ' + state.selected.size + ' 样东西<br>直接能做出 <em>' + zero + '</em> 道菜';
        sub = quick > 0 ? '其中 ' + quick + ' 道二十分钟内能上桌。' : '材料是齐的，就是得在灶台边多守一会儿。';
        const rest = total - zero;
        if (rest > 0) sub += '另有 ' + rest + ' 道差一两样。';
      } else {
        words = '手边 ' + state.selected.size + ' 样东西<br>凑出 <em>' + total + '</em> 道，得补点料';
        sub = '都不算齐，但差一两样的菜，味道也值得一试。';
      }
      head.innerHTML = '<div class="big">' + words + '</div><p class="sub">' + sub + '</p>';
    }

    body.innerHTML = '';

    // AI 现想的菜排最前
    state.aiRecipes.forEach(r => body.appendChild(recipeCard(r, true)));

    groups.forEach(g => {
      const label = document.createElement('div');
      label.className = 'tier-label';
      label.dataset.tier = g.key;
      label.innerHTML = '<b>' + g.title + '</b>' + g.note;
      body.appendChild(label);
      g.items.forEach(r => body.appendChild(recipeCard(r, false)));

      if (g.hidden > 0) {
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'expand-btn';
        more.textContent = '还有 ' + g.hidden + ' 道' + g.title + '的，全部展开';
        more.addEventListener('click', () => {
          state.expanded[g.key] = true;
          renderResults();
          const lb = body.querySelector('.tier-label[data-tier="' + g.key + '"]');
          if (lb) {
            window.scrollTo({ top: Math.max(0, lb.getBoundingClientRect().top + window.scrollY - 70), behavior: 'auto' });
          }
        });
        body.appendChild(more);
      }
    });

    const aiBlock = null;
    if (aiBlock) body.appendChild(aiBlock);

    const lazyLink = document.createElement('button');
    lazyLink.type = 'button';
    lazyLink.className = 'result-lazy';
    lazyLink.textContent = '还是不想动手？摇一个外卖 ›';
    lazyLink.addEventListener('click', openTakeout);
    body.appendChild(lazyLink);
  }

  function recipeCard(item, isAi) {
    const r = item.recipe;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'rcard' + (isAi ? ' aicard' : '');

    const badges = [];
    if (isAi) badges.push('<span class="badge ai">AI 现想</span>');
    else if (item.tier === 0) badges.push('<span class="badge ok">材料齐</span>');
    else if (item.missing.length === 1)
      badges.push('<span class="badge miss">差 ' + ingMap.get(item.missing[0]).name + '</span>');
    else badges.push('<span class="badge miss">差 2 样</span>');

    const meta = [];
    meta.push('约 ' + r.time + ' 分钟');
    meta.push(LEVEL_TXT[r.level] || '家常');
    if (!isAi && item.missSeason.length)
      meta.push('少 ' + item.missSeason.map(id => seasonMap.get(id).name).join('/'));
    if (isAi) meta.push('按你现有调料设计');

    card.innerHTML =
      '<span class="rblob" style="--blob-bg:' + blobColor(r.id) + '">' + (dishIcon(r) || r.emoji) + '</span>' +
      '<span class="rmain">' +
        '<span class="rname">' + escapeHtml(r.name) + badges.join('') + '</span>' +
        '<span class="rmeta">' + meta.map(m => escapeHtml(m)).join('<i class="dot"></i>') + '</span>' +
      '</span>' +
      '<span class="arrow">›</span>';

    card.addEventListener('click', () => openRecipe(item, isAi));
    return card;
  }

  function buildAiBlock() {
    if (state.aiOk === false) return null;
    const wrap = document.createElement('div');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ai-btn';
    btn.id = 'aiBtn';
    btn.innerHTML = '<span>✨</span>都不想吃？让 AI 按现有材料现想一道';
    btn.addEventListener('click', () => askAI(btn));

    const note = document.createElement('p');
    note.className = 'ai-note';
    note.textContent = '菜谱库是精选过的家常做法；AI 会按你手上的食材重新组合，步骤同样能直接照着做。';

    wrap.appendChild(btn);
    wrap.appendChild(note);
    return wrap;
  }

  /* ─────────────── 随机外卖 ─────────────── */
  const tk = { budget: 'all', taste: 'all', cur: null, rolls: 0, rolling: false };
  let rollTimer = null;
  const BUDGETS = [
    { id: 'all', label: '都行' },
    { id: 'low', label: '20 内' },
    { id: 'mid', label: '20–35' },
    { id: 'high', label: '35 以上' }
  ];
  const TASTES = [
    { id: 'all', label: '都行' },
    { id: 'spicy', label: '想吃辣' },
    { id: 'light', label: '清淡点' },
    { id: 'soup', label: '要带汤' },
    { id: 'staple', label: '饭或面' },
    { id: 'slim', label: '轻食' }
  ];

  function tkPool() {
    return TAKEOUT.filter(x => {
      if (tk.budget === 'low' && x.p[0] > 20) return false;
      if (tk.budget === 'mid' && (x.p[0] <= 20 || x.p[0] > 32)) return false;
      if (tk.budget === 'high' && x.p[0] <= 32) return false;
      if (tk.taste === 'spicy' && x.t.indexOf('辣') < 0) return false;
      if (tk.taste === 'light' && x.t.indexOf('清淡') < 0) return false;
      if (tk.taste === 'soup' && x.t.indexOf('带汤') < 0) return false;
      if (tk.taste === 'slim' && x.t.indexOf('轻食') < 0) return false;
      if (tk.taste === 'staple' && x.t.indexOf('饭') < 0 && x.t.indexOf('面') < 0 && x.t.indexOf('粉') < 0) return false;
      return true;
    });
  }

  function tkCard(item, rolling) {
    if (rolling) {
      return '<div class="tk-card tk-rolling">' +
        '<p class="tk-kicker">正在摇…</p>' +
        '<h3 class="tk-name">' + escapeHtml(item.n) + '</h3>' +
        '<p class="tk-price">人均 ¥' + item.p[0] + '–' + item.p[1] + '</p>' +
        '</div>';
    }
    return '<div class="tk-card">' +
      '<p class="tk-kicker">今天就吃</p>' +
      '<h3 class="tk-name">' + escapeHtml(item.n) + '</h3>' +
      '<p class="tk-price">人均 ¥' + item.p[0] + '–' + item.p[1] + '</p>' +
      '<div class="tk-tags">' + item.t.map(t => '<span>' + escapeHtml(t) + '</span>').join('') + '</div>' +
      '<p class="tk-note">' + escapeHtml(item.note) + '</p>' +
      '<button type="button" class="tk-copy" id="tkCopy">复制名字，去外卖 App 搜</button>' +
      '</div>';
  }

  function renderTakeout() {
    const body = $('#tkBody');
    if (!body) return;
    const pool = tkPool();

    const row = (list, key, active) => list.map(o =>
      '<button type="button" class="tk-pill' + (active === o.id ? ' on' : '') + '" data-k="' + key +
      '" data-v="' + o.id + '" aria-pressed="' + (active === o.id) + '">' + o.label + '</button>'
    ).join('');

    body.innerHTML =
      '<div class="tk-head">' +
        '<h2>摇一个外卖</h2>' +
        '<p>替你决定吃什么。下单还是在外卖 App 里，这里不替你掏钱。</p>' +
      '</div>' +
      '<div class="tk-filter"><span class="tk-fl">预算</span><div class="tk-pills">' + row(BUDGETS, 'budget', tk.budget) + '</div></div>' +
      '<div class="tk-filter"><span class="tk-fl">想吃</span><div class="tk-pills">' + row(TASTES, 'taste', tk.taste) + '</div></div>' +
      '<div class="tk-stage" id="tkStage">' +
        (tk.cur ? tkCard(tk.cur) : '<div class="tk-empty">' +
          '<span class="tk-emoji">🥡</span>' +
          '<p>' + (pool.length ? '点下面那颗按钮，摇一个出来' : '这个条件太窄了，放宽一点') + '</p>' +
          '</div>') +
      '</div>' +
      '<button type="button" class="tk-roll" id="tkRoll"' + (pool.length ? '' : ' disabled') + '>' +
        (tk.rolls >= 3 ? '别挑了，就这个' : '摇一个') + '</button>' +
      '<p class="tk-foot">' +
        (pool.length ? '这个条件里有 ' + pool.length + ' 种' : '没有符合条件的，试试「都行」') +
      '</p>';

    $$('.tk-pill', body).forEach(b => {
      b.addEventListener('click', () => {
        tk[b.dataset.k] = b.dataset.v;
        if (tk.cur && tkPool().indexOf(tk.cur) < 0) tk.cur = null;
        tk.rolls = 0;
        renderTakeout();
      });
    });

    const rollBtn = $('#tkRoll', body);
    if (rollBtn) rollBtn.addEventListener('click', doRoll);
    const copyBtn = $('#tkCopy', body);
    if (copyBtn) copyBtn.addEventListener('click', copyTakeout);
  }

  function doRoll() {
    if (tk.rolling) return;
    const pool = tkPool();
    if (!pool.length) return;
    const stage = $('#tkStage');
    const btn = $('#tkRoll');

    tk.rolling = true;
    if (btn) { btn.disabled = true; btn.textContent = '正在掂量…'; }

    let i = 0;
    rollTimer = setInterval(() => {
      const r = pool[Math.floor(Math.random() * pool.length)];
      stage.innerHTML = tkCard(r, true);
      i++;
      if (i > 8) {
        clearInterval(rollTimer);
        rollTimer = null;
        let pick = pool[Math.floor(Math.random() * pool.length)];
        if (pool.length > 1 && pick === tk.cur) pick = pool[(pool.indexOf(pick) + 1) % pool.length];
        tk.cur = pick;
        tk.rolls++;
        tk.rolling = false;
        renderTakeout();
      }
    }, 62);
  }

  function copyTakeout() {
    if (!tk.cur) return;
    const btn = $('#tkCopy');
    const done = ok => {
      if (!btn) return;
      btn.textContent = ok ? '已复制，去外卖 App 粘贴搜索' : '长按上面菜名手动复制';
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tk.cur.n).then(() => done(true)).catch(() => done(false));
    } else {
      done(false);
    }
  }

  function openTakeout() {
    renderTakeout();
    $('#tkMask').classList.add('open');
    $('#tkSheet').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeTakeout() {
    $('#tkMask').classList.remove('open');
    $('#tkSheet').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ─────────────── 详情抽屉 ─────────────── */
  function openRecipe(item, isAi) {
    const r = item.recipe;
    const body = $('#sheetBody');

    let mats = '';
    if (isAi) {
      mats = r.needNames.map(n => '<span class="mat">' + escapeHtml(n) + '</span>').join('');
    } else {
      mats = r.need.map(id => {
        const i = ingMap.get(id);
        const lack = !state.selected.has(id);
        return '<span class="mat' + (lack ? ' lack' : '') + '">' +
          (icon(id) || i.emoji) + escapeHtml(i.name) +
          (lack ? ' <b style="font-size:11px">缺</b>' : '') + '</span>';
      }).join('');
    }

    const baseSeasons = PANTRY[0].items.map(i => '<span class="mat season">' + i.name + '</span>').join('');
    let extraSeasons = '';
    if (isAi) {
      extraSeasons = (r.extraNames || []).map(n => '<span class="mat season">' + escapeHtml(n) + '</span>').join('');
    } else {
      extraSeasons = (r.extra || []).map(id => {
        const s = seasonMap.get(id);
        const lack = !state.season.has(id);
        return '<span class="mat season' + (lack ? ' miss' : '') + '">' + escapeHtml(s.name) +
          (lack ? ' 缺' : '') + '</span>';
      }).join('');
    }

    const steps = (r.steps || []).map(s => '<li>' + escapeHtml(s) + '</li>').join('');

    body.innerHTML =
      '<div class="recipe-hero">' +
        '<span class="rblob" style="--blob-bg:' + blobColor(r.id) + '">' + (dishIcon(r) || r.emoji) + '</span>' +
        '<div>' +
          '<h2>' + escapeHtml(r.name) + '</h2>' +
          '<div class="tags">' +
            '<span>约 ' + r.time + ' 分钟</span>' +
            '<span>' + (LEVEL_TXT[r.level] || '家常') + '</span>' +
            (isAi ? '<span>AI 现想</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sect">' +
        '<h3 class="sect-title">要准备</h3>' +
        '<div class="mats">' + mats + '</div>' +
        '<h3 class="sect-title" style="margin-top:16px">调料</h3>' +
        '<div class="mats">' + baseSeasons + extraSeasons + '</div>' +
      '</div>' +
      '<div class="sect">' +
        '<h3 class="sect-title">怎么做</h3>' +
        '<ol class="steps">' + steps + '</ol>' +
      '</div>' +
      (r.tip ? '<div class="tipbox"><span class="t-ico">💡</span><span>' + escapeHtml(r.tip) + '</span></div>' : '') +
      (r.src ? '<p class="src-line">菜式参考：' + escapeHtml(r.src) + ' 热门菜谱，步骤由本站按家用灶具整理。</p>' : '') +
      (isAi ? '<p class="warn">这道菜由 AI 临时设计，第一次做建议边做边尝咸淡。</p>' : '');

    $('#sheetMask').classList.add('open');
    $('#sheet').classList.add('open');
    document.body.style.overflow = 'hidden';
    $('#sheet').scrollTop = 0;
  }

  function closeSheet() {
    $('#sheetMask').classList.remove('open');
    $('#sheet').classList.remove('open');
    document.body.style.overflow = '';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* ─────────────── 底部条 ─────────────── */
  function updateDock() {
    const btn = $('#goBtn');
    const n = state.selected.size;
    btn.disabled = n === 0;
    btn.innerHTML = n === 0
      ? '先选几样手边有的东西'
      : '看看能做什么 · 已选 ' + n + ' 样';
  }

  /* ─────────────── 事件 ─────────────── */
  function bind() {
    $('#searchInput').addEventListener('input', e => {
      state.query = e.target.value;
      renderGrid();
    });

    $('#goBtn').addEventListener('click', () => {
      if (state.selected.size === 0) return;
      state.aiRecipes = [];
      showResults();
    });

    $('#backBtn').addEventListener('click', backToPicker);
    $('#sheetMask').addEventListener('click', closeSheet);
    $('#sheetClose').addEventListener('click', closeSheet);
    $('#lazyEntry').addEventListener('click', openTakeout);
    $('#tkMask').addEventListener('click', closeTakeout);
    $('#tkClose').addEventListener('click', closeTakeout);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeSheet(); closeTakeout(); }
    });
  }

  const resetDemo = $('#resetDemo');
  if (resetDemo) resetDemo.addEventListener('click', () => {
    if (rollTimer !== null) clearInterval(rollTimer);
    rollTimer = null;
    Object.assign(tk, { budget: 'all', taste: 'all', cur: null, rolls: 0, rolling: false });
    Object.assign(state, { selected: new Set(), customs: [], season: new Set(), cat: 'veg', query: '', results: [], aiRecipes: [], aiOk: null, expanded: {}, pantryOpen: false, view: 'picker' });
    $('#searchInput').value = '';
    closeSheet(); closeTakeout(); backToPicker();
    initPantry(); renderPantry(); renderTabs(); renderGrid(); renderChips(); updateDock();
  });

  /* ─────────────── 启动 ─────────────── */
  initPantry();
  renderPantry();
  renderTabs();
  renderGrid();
  renderChips();
  updateDock();
  bind();

  const statsEl = $('#appStats');
  if (statsEl) {
    const seasonCount = PANTRY.reduce((n, g) => n + g.items.length, 0);
    statsEl.textContent = INGREDIENTS.length + ' 种食材 · ' + RECIPES.length + ' 道家常菜 · ' + seasonCount + ' 味调料';
  }


  // 预览用：?demo=1 直接看结果页，?demo=2 顺带打开做法
  const demo = (location.search.match(/[?&]demo=(\d)/) || [])[1];
  const qParam = (location.search.match(/[?&]q=([^&]+)/) || [])[1];
  if (qParam) {
    state.query = decodeURIComponent(qParam).slice(0, 8);
    $('#searchInput').value = state.query;
    renderGrid();
  }
  const dishParam = (location.search.match(/[?&]dish=([\w-]+)/) || [])[1];
  if (dishParam) {
    const r = RECIPES.find(x => x.id === dishParam);
    if (r) {
      openRecipe({
        recipe: r, tier: 0, covered: [],
        missing: r.need.filter(id => !state.selected.has(id)),
        missSeason: (r.extra || []).filter(id => !state.season.has(id))
      }, false);
    }
  }
  if (demo === '6') {
    openTakeout();
  }
  if (demo === '4') {
    state.cat = 'staple';
    renderTabs();
    renderGrid();
  }
  if (demo === '1' || demo === '2') {
    ['potato', 'tomato', 'egg', 'porkbelly', 'greenpepper'].forEach(id => state.selected.add(id));
    renderChips();
    renderGrid();
    updateDock();
    showResults();
    if (demo === '2') {
      const first = state.results.find(r => r.tier === 0) || state.results[0];
      if (first) openRecipe(first, false);
    }
  }
})();
