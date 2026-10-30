/* ===== CET-6 词汇训练营 · 应用逻辑 ===== */
(function () {
  'use strict';

  /* ---------- 题库索引（按级别分片、按需加载） ---------- */
  let META = window.CET6_META;
  const BANK = { words: [], questions: [] };      // 仅含已加载分片

  /* 兼容层：页面若加载的是完整版题库（例如浏览器缓存中的旧页面，
     只会定义 window.CET6_BANK），在此把它拆成轻量索引 + 三个分片 */
  if (!META && window.CET6_BANK) {
    const B = window.CET6_BANK;
    const lvOf = w => w.lv || 1;
    const levels = {};
    window.CET6_PARTS = window.CET6_PARTS || {};
    [1, 2, 3, 4].forEach(lv => {
      const ws = B.words.filter(w => lvOf(w) === lv);
      const set = new Set(ws.map(w => w.w));
      const qs = B.questions.filter(q => set.has(q.word));
      window.CET6_PARTS[lv] = { words: ws, questions: qs };
      levels[lv] = { words: ws.length, questions: qs.length };
    });
    META = {
      count_words: B.words.length,
      count_questions: B.questions.length,
      byKind: B.meta.byKind,
      bySubtype: B.meta.bySubtype,
      levels,
      index: B.words.map(w => [w.w, lvOf(w), w.meaning]),
    };
    window.CET6_META = META;
  }
  const WORD_MAP = Object.create(null);
  const Q_MAP = Object.create(null);
  const loadedLevels = new Set();

  /* 轻量索引：词 → 级别（用于归档记录定级与查词） */
  const INDEX_LV = Object.create(null);
  META.index.forEach(it => { INDEX_LV[it[0]] = it[1]; });

  function mergePart(lv) {
    const part = window.CET6_PARTS && window.CET6_PARTS[lv];
    if (!part) return false;
    part.words.forEach(w => { WORD_MAP[w.w] = w; });
    part.questions.forEach(q => { Q_MAP[q.id] = q; });
    BANK.words = BANK.words.concat(part.words);
    BANK.questions = BANK.questions.concat(part.questions);
    loadedLevels.add(Number(lv));
    return true;
  }

  /* 单文件版已把分片内联在 window.CET6_PARTS，无需网络请求 */
  function loadLevel(lv) {
    lv = Number(lv);
    return new Promise((resolve, reject) => {
      if (loadedLevels.has(lv)) return resolve();
      if (mergePart(lv)) return resolve();
      window.cet6Files.get('template-assets/vocabulary/data-' + lv + '.json')
        .then(res => { if (!res.ok) throw new Error('词库读取失败'); return res.json(); })
        .then(part => { window.CET6_PARTS = window.CET6_PARTS || {}; window.CET6_PARTS[lv] = part; if (mergePart(lv)) resolve(); else reject(new Error('分片数据缺失')); })
        .catch(() => reject(new Error('级别 ' + lv + ' 数据加载失败')));
    });
  }

  function ensureLevels(lvs) {
    return Promise.all(lvs.map(loadLevel));
  }

  const levelList = lv => (lv === 'all' ? [1, 2, 3, 4] : [Number(lv)]);

  const SUBTYPE_LABEL = {
    en2zh: '词义选择 · 英译中',
    zh2en: '词义选择 · 中译英',
    cloze: '理解应用 · 语境填空',
    context: '理解应用 · 语境理解'
  };
  const SUBTYPE_SHORT = { en2zh: '英译中', zh2en: '中译英', cloze: '语境填空', context: '语境理解' };
  const POS_LABEL = { v: 'v.', adj: 'adj.', n: 'n.', adv: 'adv.' };
  const LETTERS = ['A', 'B', 'C', 'D'];
  const APP_VERSION = 'v7';   // 版本标识，用于确认线上加载的是哪一版
  const LV_NAME = { 1: '六级核心', 2: '六级进阶', 3: '扩展巩固', 4: '拓展认知' };

  /* ---------- 状态 ---------- */
  const STORE_KEY = 'cet6_trainer_v1';
  let state = {
    v: 1,
    archive: {},                                   // qid -> { ok, at, tries, wrong }
    stats: { answered: 0, correct: 0, rounds: 0 },
    theme: 'light',
    owner: null,                                   // 本机缓存进度所属账号
    watermark: 0,                                  // 云端同步水位（毫秒）
    favorites: {}                                  // word -> 收藏时间戳
  };
  let cfg = { scope: 'all', size: 20, order: 'random', level: '1' };
  let session = null;
  let locked = false;
  let archPage = 1;
  const ARCH_PAGE_SIZE = 20;
  let archFilter = { result: 'all', kind: 'all', q: '' };
  let selected = new Set();

  /* ---------- 工具 ---------- */
  const $ = id => document.getElementById(id);
  /* 老版本页面（浏览器缓存）里没有账号相关元素，绑定前先做存在性判断，
     避免新版脚本加载到旧 DOM 上直接抛错、把整站拖崩 */
  function on(id, evt, fn) {
    const el = $(id);
    if (el) el.addEventListener(evt, fn);
    return el;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }

  function fmtTime(ts) {
    const d = new Date(ts);
    const p = n => String(n).padStart(2, '0');
    const hm = `${p(d.getHours())}:${p(d.getMinutes())}`;
    const today = new Date();
    const same = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (same(d, today)) return `今天 ${hm}`;
    const y = new Date(today); y.setDate(y.getDate() - 1);
    if (same(d, y)) return `昨天 ${hm}`;
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${hm}`;
  }

  /* ---------- 服务端通信 ---------- */
  const OFFLINE = true;   // 离线单文件版不接账号体系
  const HAS_AUTH_UI = !!document.getElementById('view-auth');
  let account = null;                             // 当前登录用户 { email, createdAt }
  let pendingSync = new Set();                    // 待上传的题目 id
  let syncing = false;
  let syncTimer = null;
  let syncError = '';
  let curView = 'train';

  async function api(path, opts) {
    const o = Object.assign({ credentials: 'same-origin', headers: {} }, opts || {});
    if (o.body !== undefined && typeof o.body !== 'string') {
      o.headers['Content-Type'] = 'application/json';
      o.body = JSON.stringify(o.body);
      o.method = o.method || 'POST';
    }
    let res;
    try {
      res = await fetch(path, o);
    } catch (e) {
      const err = new Error('网络连接失败，请检查网络后重试');
      err.network = true;
      throw err;
    }
    let data = null;
    try { data = await res.json(); } catch (e) { /* 非 JSON 响应 */ }
    if (!res.ok) {
      const err = new Error((data && data.error) || `请求失败（${res.status}）`);
      err.status = res.status;
      throw err;
    }
    return data || {};
  }

  /* ---------- 进度同步 ---------- */
  function mergeRemote(remote) {
    let changed = 0;
    for (const qid in remote) {
      const rec = remote[qid];
      if (!rec) continue;
      const cur = state.archive[qid];
      if (!cur || (rec.at || 0) >= (cur.at || 0)) {
        if (!cur || cur.ok !== rec.ok || cur.picked !== rec.picked) changed++;
        state.archive[qid] = rec;
      }
    }
    return changed;
  }

  function markDirty(qid) {
    if (OFFLINE || !account) return;
    pendingSync.add(qid);
    scheduleSync();
    updateSyncBadge();
  }

  function scheduleSync(delay) {
    if (OFFLINE || !account) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => flushSync(), delay === undefined ? 1200 : delay);
    updateSyncBadge();
  }

  async function flushSync() {
    if (OFFLINE || !account) return true;
    if (syncing) return false;
    if (pendingSync.size === 0) { updateSyncBadge(); return true; }

    syncing = true;
    updateSyncBadge();
    const ids = Array.from(pendingSync);
    const payload = {};
    ids.forEach(id => { if (state.archive[id]) payload[id] = state.archive[id]; });

    try {
      const res = await api('/api/progress/sync', {
        body: { archive: payload, since: state.watermark || 0 }
      });
      ids.forEach(id => pendingSync.delete(id));
      if (res.archive) {
        const changed = mergeRemote(res.archive);
        if (changed && curView === 'archive') renderArchive();
        if (changed && curView === 'stats') renderStats();
      }
      if (typeof res.serverTime === 'number') state.watermark = res.serverTime;
      syncError = '';
      save();
      syncing = false;
      updateSyncBadge();
      return true;
    } catch (e) {
      syncing = false;
      syncError = e.message;
      updateSyncBadge();
      return false;
    }
  }

  async function loadAllProgress() {
    const snapshot = Object.assign({}, state.archive);   // 合并前的本机记录
    const res = await api('/api/progress?since=0');
    const remote = res.archive || {};
    mergeRemote(remote);
    if (typeof res.serverTime === 'number') state.watermark = res.serverTime;

    // 只上传「服务端没有」或「本机更新」的记录，避免重复搬运整包
    const up = {};
    Object.keys(snapshot).forEach(qid => {
      const l = snapshot[qid], r = remote[qid];
      if (!r || (l.at || 0) > (r.at || 0)) up[qid] = l;
    });
    if (Object.keys(up).length) {
      const r2 = await api('/api/progress/sync', { body: { archive: up, since: state.watermark } });
      mergeRemote(r2.archive || {});
      if (typeof r2.serverTime === 'number') state.watermark = r2.serverTime;
    }
    save();
  }

  function updateSyncBadge() {
    const el = $('syncBadge');
    if (!el) return;
    if (OFFLINE || !account) { el.hidden = true; return; }
    el.hidden = false;
    el.classList.remove('busy', 'bad', 'ok');
    if (syncing) {
      el.textContent = '同步中…';
      el.classList.add('busy');
    } else if (syncError) {
      el.textContent = '同步失败';
      el.title = syncError + '（点击重试）';
      el.classList.add('bad');
    } else if (pendingSync.size > 0) {
      el.textContent = `${pendingSync.size} 条待同步`;
      el.classList.add('busy');
    } else {
      el.textContent = '已同步';
      el.classList.add('ok');
      el.title = '进度已保存到账号';
    }
  }

  /* ---------- 存档 ---------- */
  async function load() {
    const saved = await window.cet6Store.read();
    if (saved) state = Object.assign(state, saved);
  }
  function save() {
    window.cet6Store.write(JSON.stringify(state)).catch(e => {
      console.error('保存失败', e);
      toast('云端保存失败，请检查连接后重试');
    });
  }

  /* ---------- 主题 ---------- */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
  }

  /* ---------- 题库池 ---------- */
  function matchScope(q, scope, level) {
    const w = WORD_MAP[q.word];
    if (level && level !== 'all' && String(w.lv) !== String(level)) return false;
    if (scope === 'all') return true;
    if (scope === 'meaning') return q.kind === 'meaning';
    if (scope === 'usage') return q.kind === 'usage';
    return q.subtype === scope;
  }

  function matchCfg(q, scope, level) {
    return matchScope(q, scope || cfg.scope, level || cfg.level);
  }

  function pendingCount(scope, level) {
    let n = 0;
    for (const q of BANK.questions) if (!state.archive[q.id] && matchCfg(q, scope, level)) n++;
    return n;
  }

  function pendingIds(scope, level) {
    const out = [];
    for (const q of BANK.questions) if (!state.archive[q.id] && matchCfg(q, scope, level)) out.push(q.id);
    return out;
  }

  /* ---------- 顶部统计 ---------- */
  /* 从归档记录取出所属单词（旧记录无词字段时由 ID 解析） */
  function archiveWord(id) {
    const q = Q_MAP[id];
    if (q) return q.word;
    const i = id.indexOf(':');
    return i >= 0 ? id.slice(i + 1) : '';
  }

  function renderStatStrip() {
    const total = META.count_questions;
    const archived = Object.keys(state.archive).length;
    const pending = Math.max(0, total - archived);
    const s = state.stats;
    const rate = s.answered ? Math.round(s.correct / s.answered * 100) : 0;
    const wordsDone = new Set(
      Object.keys(state.archive).map(archiveWord).filter(Boolean)
    ).size;

    $('statStrip').innerHTML = `
      <div class="mini brand"><div class="k">待刷题目</div><div class="v">${pending}<small>&nbsp;/ ${total}</small></div></div>
      <div class="mini"><div class="k">已归档</div><div class="v">${archived}<small>&nbsp;题</small></div></div>
      <div class="mini ok"><div class="k">累计正确率</div><div class="v">${rate}<small>%</small></div></div>
      <div class="mini"><div class="k">已练单词</div><div class="v">${wordsDone}<small>&nbsp;/ ${META.count_words}</small></div></div>
    `;
  }

  function renderPoolInfo() {
    const el = $('poolInfo');
    if (!levelList(cfg.level).every(lv => loadedLevels.has(lv))) {
      el.innerHTML = '正在加载所选级别的题库…';
      $('startBtn').disabled = true;
      return;
    }
    const n = pendingCount(cfg.scope, cfg.level);
    if (n === 0) {
      el.innerHTML = '<span class="empty">当前范围已经没有待刷题目了</span> —— 去「题库归档」里把题目放回题库，就能继续练习。';
    } else {
      let html = `当前范围共 <b>${n}</b> 道待刷题目，本轮将抽取 <b>${cfg.size > 0 ? Math.min(cfg.size, n) : n}</b> 道。`;
      if (cfg.level === '4') {
        html += '<br><span class="pool-note">拓展认知词库只提供「英译中」练习，用于快速扩充词汇量。</span>';
      }
      el.innerHTML = html;
    }
    $('startBtn').disabled = n === 0;
  }

  /* ---------- 视图切换 ---------- */
  function switchView(name) {
    ['train', 'archive', 'favorites', 'dict', 'stats', 'account'].forEach(v => {
      const el = $('view-' + v);
      if (el) el.classList.toggle('hidden', v !== name);
    });
    curView = name;
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.nav === name);
    });
    if (name === 'archive') {
      renderArchive();
      ensureLevels([1, 2, 3, 4]).then(renderArchive).catch(() => {});
    }
    if (name === 'stats') {
      renderStats();
      ensureLevels([1, 2, 3, 4]).then(renderStats).catch(() => {});
    }
    if (name === 'dict') {
      ensureLevels([1, 2, 3, 4]).then(() => renderDict($('dictInput').value)).catch(() => {});
      renderDict($('dictInput').value);
    }
    if (name === 'favorites') {
      renderFavorites();
      ensureLevels([1, 2, 3, 4]).then(renderFavorites).catch(() => {});
    }
    if (name === 'account') renderAccount();
    if (name === 'train') { renderStatStrip(); renderPoolInfo(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showPanel(name) {
    $('trainSetup').classList.toggle('hidden', name !== 'setup');
    $('quizPanel').classList.toggle('hidden', name !== 'quiz');
    $('summaryPanel').classList.toggle('hidden', name !== 'summary');
  }

  /* ---------- 开始一轮 ---------- */
  async function startRound() {
    try {
      await ensureLevels(levelList(cfg.level));
    } catch (e) {
      toast(e.message);
      return;
    }
    let pool = pendingIds(cfg.scope, cfg.level);
    if (!pool.length) { toast('这个范围已经没有待刷的题了'); return; }
    if (cfg.order === 'random') shuffle(pool);

    const n = cfg.size > 0 ? Math.min(cfg.size, pool.length) : pool.length;
    session = {
      ids: pool.slice(0, n),
      idx: 0,
      ok: 0,
      bad: 0,
      answered: 0,
      wrongIds: []
    };
    showPanel('quiz');
    renderQuestion();
  }

  function currentQ() { return Q_MAP[session.ids[session.idx]]; }

  /* 高亮句中的目标词；支持 -ed/-ing/-s 等常见变形（如 abandoned、criteria） */
  function markTarget(text, word) {
    const exact = new RegExp('\\b' + word + '\\b');
    if (exact.test(text)) return text.replace(exact, m => `<em class="target">${m}</em>`);
    const stem = word.slice(0, Math.max(4, word.length - 3));
    const loose = new RegExp('\\b' + stem + '[a-z]*\\b');
    return text.replace(loose, m => `<em class="target">${m}</em>`);
  }

  /* 归档列表里用粗体高亮目标词 */
  function markTargetBold(text, word) {
    const re = new RegExp('\\b' + word + '\\b');
    return text.replace(re, m => `<b class="hl">${m}</b>`);
  }

  /* ---------- 题干 / 选项渲染（答题页与归档详情共用） ---------- */
  function buildStem(q) {
    const w = WORD_MAP[q.word];
    if (q.subtype === 'en2zh') {
      return {
        cls: 'stem word',
        html: escapeHtml(w.w) +
          `<span class="ph">${escapeHtml(w.ph)}&nbsp;&nbsp;<span style="font-style:italic">${POS_LABEL[w.pos]}</span></span>`,
        note: '选出与该单词对应的中文释义'
      };
    }
    if (q.subtype === 'zh2en') {
      return {
        cls: 'stem',
        html: `<span class="zh-stem">${escapeHtml(w.meaning)}</span>`,
        note: '选出与之对应的英文单词'
      };
    }
    if (q.subtype === 'cloze') {
      return {
        cls: 'stem',
        html: escapeHtml(w.sent).replace('___', '<span class="blank"></span>'),
        note: '根据语境，选出最恰当的一项填入空格'
      };
    }
    return {
      cls: 'stem',
      html: markTarget(escapeHtml(w.full), w.w),
      note: '根据整句句意，判断划线单词最接近的含义'
    };
  }

  /* picked 为 null 时是未作答状态（答题页）；传具体序号则是回顾状态（归档详情） */
  function buildOptions(q, picked) {
    const isWordOpt = q.subtype === 'zh2en' || q.subtype === 'cloze';
    const answered = typeof picked === 'number';
    return q.options.map((o, i) => {
      let cls = 'opt' + (isWordOpt ? ' word-opt' : '');
      let mark = '';
      if (answered) {
        cls += ' locked';
        if (i === q.answer) { cls += ' correct'; mark = '✓'; }
        else if (i === picked) { cls += ' wrong'; mark = '✗'; }
        else { cls += ' dim'; }
      }
      return `<button class="${cls}" data-i="${i}">
        <span class="key">${LETTERS[i]}</span>
        <span class="txt">${escapeHtml(o)}</span>
        <span class="mark">${mark}</span>
      </button>`;
    }).join('');
  }

  function renderQuestion() {
    const q = currentQ();
    locked = false;

    $('quizCounter').textContent = `${session.idx + 1} / ${session.ids.length}`;
    $('quizOk').textContent = session.ok;
    $('quizBad').textContent = session.bad;
    $('progressBar').style.width = (session.idx / session.ids.length * 100) + '%';

    const typeEl = $('qType');
    typeEl.textContent = SUBTYPE_LABEL[q.subtype];
    typeEl.className = 'qtype' + (q.kind === 'usage' ? ' usage' : '');

    const st = buildStem(q);
    const stemEl = $('qStem');
    stemEl.className = st.cls;
    stemEl.innerHTML = st.html;
    $('qNote').textContent = st.note;
    $('qOptions').innerHTML = buildOptions(q, null);

    $('qExplain').classList.add('hidden');
    $('qExplain').innerHTML = '';
    $('nextBtn').disabled = true;
    $('nextBtn').textContent = session.idx === session.ids.length - 1 ? '完成本轮' : '下一题';
  }

  /* ---------- 解析区 ----------
     ① 正确答案解析  ② 其余三个选项的释义
     ③ 它们各自成题时题干该改成什么样  ④ 本题涉及的全部固定搭配
  ------------------------------------------------------------ */
  function buildExplain(q, ok, withNext) {
    if (withNext === undefined) withNext = true;
    const w = WORD_MAP[q.word];
    const cfLabel = q.kind === 'usage'
      ? '若以此词为答案，题干需改为'
      : '若以此词为考点，题干会是';

    /* 每个选项对应的单词（新题库自带 optWords，兼容旧数据） */
    let optWords = q.optWords;
    if (!optWords && (q.subtype === 'zh2en' || q.subtype === 'cloze')) optWords = q.options;

    let review = '';
    let colloc = '';

    if (optWords) {
      const items = [];
      for (let i = 0; i < q.options.length; i++) {
        if (i === q.answer) continue;
        const ow = WORD_MAP[optWords[i]];
        if (!ow) continue;
        items.push(`
          <div class="or-item">
            <div class="or-head">
              <span class="or-key">${LETTERS[i]}</span>
              <span class="or-word">${escapeHtml(ow.w)}</span>
              <span class="or-ph">${escapeHtml(ow.ph)}</span>
              <span class="or-pos">${POS_LABEL[ow.pos]}</span>
            </div>
            <div class="or-meaning">${escapeHtml(ow.meaning)}</div>
            <div class="or-cf">
              <span class="or-label">${cfLabel}：</span>
              <div class="or-en">${markTarget(escapeHtml(ow.alt), ow.w)}</div>
              <div class="or-zh">${escapeHtml(ow.altZh)}</div>
            </div>
            <div class="or-cp"><b>固定搭配</b><span>${escapeHtml(ow.cp)}</span></div>
          </div>`);
      }

      review = `
        <div class="opt-review">
          <div class="or-title">其余三个选项全解
            <span>它们的释义，以及各自成为答案时题干会是什么样</span>
          </div>
          ${items.join('')}
        </div>`;

      colloc = `
        <div class="colloc-box">
          <div class="cb-title">本题涉及的全部固定搭配 / 语言点</div>
          <ul>
            ${optWords.map(ow => {
              const x = WORD_MAP[ow];
              if (!x) return '';
              const right = ow === q.word;
              return `<li class="${right ? 'is-right' : ''}">
                <b>${escapeHtml(x.w)}${right ? '<em>√ 答案</em>' : ''}</b>
                <span>${escapeHtml(x.cp)}</span>
              </li>`;
            }).join('')}
          </ul>
        </div>`;
    }

    return `
      <div class="explain-title">
        <span>${ok ? '回答正确 · 解析' : '回答错误 · 解析'}</span>
        ${favButton(w.w)}
      </div>
      <div class="explain-word">${escapeHtml(w.w)}<span class="ph">${escapeHtml(w.ph)}</span><span class="pos">${POS_LABEL[w.pos]}</span></div>
      <div class="explain-zh">${escapeHtml(w.meaning)}</div>
      <div class="explain-sent">
        <div class="en">${markTarget(escapeHtml(w.full), w.w)}</div>
        <div class="zh">${escapeHtml(w.tr)}</div>
      </div>
      <div class="explain-cp"><b>固定搭配 / 考点</b><span>${escapeHtml(w.cp || '')}</span></div>
      ${review}
      ${colloc}
      ${withNext ? '<div class="explain-foot"><button class="btn primary" id="explainNext">下一题 →</button></div>' : ''}
    `;
  }

  /* ---------- 我的收藏 ---------- */
  function favButton(word) {
    const on = !!state.favorites[word];
    return `<button type="button" class="fav-btn${on ? ' on' : ''}" data-fav="${escapeHtml(word)}"
              title="${on ? '从我的收藏中移除' : '加入我的收藏'}" aria-pressed="${on}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="${on ? 'currentColor' : 'none'}"
                   stroke="currentColor" stroke-width="1.9" stroke-linejoin="round">
                <path d="M12 3.4l2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 17.92l-5.3 2.79 1.01-5.9-4.29-4.18 5.93-.86z"/>
              </svg>
              <span>${on ? '已收藏' : '收藏'}</span>
            </button>`;
  }

  function refreshFavButtons(word) {
    const on = !!state.favorites[word];
    document.querySelectorAll('.fav-btn').forEach(btn => {
      if (btn.dataset.fav !== word) return;
      btn.classList.toggle('on', on);
      btn.title = on ? '从我的收藏中移除' : '加入我的收藏';
      btn.setAttribute('aria-pressed', String(on));
      const span = btn.querySelector('span');
      if (span) span.textContent = on ? '已收藏' : '收藏';
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', on ? 'currentColor' : 'none');
    });
  }

  async function toggleFavorite(word) {
    if (!word) return;
    const prev = state.favorites[word];
    const on = !prev;

    /* 先本地生效，界面即时反馈；同步失败再回滚 */
    if (on) state.favorites[word] = Date.now();
    else delete state.favorites[word];
    save();
    refreshFavButtons(word);
    if (curView === 'favorites') renderFavorites();

    if (OFFLINE || !account) {
      toast(on ? `已收藏 ${word}` : `已取消收藏 ${word}`);
      return;
    }

    try {
      await api('/api/favorites', { body: { word, on } });
      toast(on ? `已收藏 ${word}` : `已取消收藏 ${word}`);
    } catch (e) {
      if (prev) state.favorites[word] = prev;
      else delete state.favorites[word];
      save();
      refreshFavButtons(word);
      if (curView === 'favorites') renderFavorites();
      toast('操作失败：' + e.message);
    }
  }

  async function loadFavorites() {
    if (OFFLINE || !account) return;
    try {
      const r = await api('/api/favorites');
      const map = {};
      (r.words || []).forEach(it => { if (it && it.w) map[it.w] = it.at || Date.now(); });
      state.favorites = map;
      save();
    } catch (e) {
      console.warn('收藏同步失败，保留本机数据', e);
    }
  }

  function renderFavorites() {
    const box = $('favList');
    if (!box) return;

    const kw = (($('favSearch') || {}).value || '').trim().toLowerCase();
    const all = Object.keys(state.favorites)
      .sort((a, b) => (state.favorites[b] || 0) - (state.favorites[a] || 0));

    const items = all.filter(w => {
      if (!kw) return true;
      const d = WORD_MAP[w];
      return w.toLowerCase().includes(kw) || (d && d.meaning.toLowerCase().includes(kw));
    });

    $('favCount').textContent = all.length
      ? `已收藏 ${all.length} 个词${kw ? ` · 匹配 ${items.length} 个` : ''}`
      : '已收藏 0 个词';

    if (!all.length) {
      box.innerHTML = `<div class="fav-empty">
        <div class="fav-empty-icon">☆</div>
        <p>还没有收藏任何单词</p>
        <span>答题后在解析区点「收藏」，或在归档里回看某题时点「收藏」。</span>
      </div>`;
      return;
    }
    if (!items.length) {
      box.innerHTML = `<div class="dict-empty">没有匹配「${escapeHtml(kw)}」的收藏</div>`;
      return;
    }

    box.innerHTML = items.map(w => {
      const d = WORD_MAP[w];
      const at = state.favorites[w];
      if (!d) {
        return `<div class="fav-item">
          <div class="fav-head">
            <span class="fav-w">${escapeHtml(w)}</span>
            <span class="fav-ph">词条详情加载中…</span>
            ${favButton(w)}
          </div>
        </div>`;
      }
      return `<div class="fav-item" data-word="${escapeHtml(w)}">
        <div class="fav-head">
          <span class="fav-w">${escapeHtml(d.w)}</span>
          <span class="fav-ph">${escapeHtml(d.ph)}</span>
          <span class="fav-pos">${POS_LABEL[d.pos]}</span>
          <span class="dict-lv lv${d.lv}">${LV_NAME[d.lv]}</span>
          <span class="fav-time">${fmtTime(at)}</span>
          ${favButton(w)}
        </div>
        <div class="fav-meaning">${escapeHtml(d.meaning)}</div>
        <div class="fav-sent">${markTarget(escapeHtml(d.full), d.w)}</div>
        <div class="fav-cp"><b>搭配</b>${escapeHtml(d.cp || '')}</div>
      </div>`;
    }).join('');
  }

  /* ---------- 导出单词表 ---------- */
  function favoriteRows() {
    return Object.keys(state.favorites)
      .sort((a, b) => (state.favorites[b] || 0) - (state.favorites[a] || 0))
      .map(w => WORD_MAP[w])
      .filter(Boolean);
  }

  function csvCell(v) {
    const s = String(v == null ? '' : v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function downloadFile(name, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
  }

  function exportFavorites(fmt) {
    const rows = favoriteRows();
    if (!rows.length) {
      toast('还没有收藏任何单词，先去收藏几个吧');
      return;
    }
    const d = new Date();
    const p2 = n => String(n).padStart(2, '0');
    const stamp = `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}`;

    if (fmt === 'csv') {
      const head = ['单词', '音标', '词性', '级别', '释义', '例句', '翻译', '固定搭配'];
      const lines = [head.map(csvCell).join(',')];
      rows.forEach(w => {
        lines.push([
          w.w, w.ph, POS_LABEL[w.pos] || w.pos, LV_NAME[w.lv] || '',
          w.meaning, w.full, w.tr, w.cp || ''
        ].map(csvCell).join(','));
      });
      /* 开头加 BOM，否则 Excel 打开中文会乱码 */
      downloadFile(`我的收藏-${stamp}.csv`, '\ufeff' + lines.join('\r\n'), 'text/csv;charset=utf-8');
    } else {
      const lines = [
        `# 我的收藏（${rows.length} 个词）`,
        '',
        `> 导出于 ${d.toLocaleString('zh-CN')}　·　CET-6 词汇训练营`,
        ''
      ];
      rows.forEach(w => {
        lines.push(`- **${w.w}** ${w.ph} *${POS_LABEL[w.pos] || ''}* ${w.meaning}`);
        lines.push(`  - ${w.full}　${w.tr}`);
        if (w.cp) lines.push(`  - 搭配：${w.cp}`);
      });
      downloadFile(`我的收藏-${stamp}.md`, lines.join('\n'), 'text/markdown;charset=utf-8');
    }
    toast(`已导出 ${rows.length} 个词`);
  }

  /* ---------- 归档详情：回看某题的作答结果 ---------- */
  function openDetail(qid) {
    const q = Q_MAP[qid];
    const rec = state.archive[qid];
    if (!q || !rec) return;

    const hasPicked = typeof rec.picked === 'number';
    const picked = hasPicked ? rec.picked : q.answer;   // 老记录没存选项时，只标出正确答案
    const ok = !!rec.ok;
    const st = buildStem(q);

    const status = hasPicked
      ? `<span class="d-badge ${ok ? 'ok' : 'bad'}">${ok ? '✓ 答对了' : '✗ 答错了'}</span>
         <span class="d-meta">你的选择：${LETTERS[picked]}　·　${fmtTime(rec.at || Date.now())}${rec.tries > 1 ? `　·　本题共作答 ${rec.tries} 次` : ''}</span>`
      : `<span class="d-badge ${ok ? 'ok' : 'bad'}">${ok ? '✓ 答对' : '✗ 答错'}</span>
         <span class="d-meta">${fmtTime(rec.at || Date.now())} · 这条是早期记录，未保存你当时的具体选项</span>`;

    $('qModalBox').innerHTML = `
      <div class="modal-head">
        <div class="qtype${q.kind === 'usage' ? ' usage' : ''}">${SUBTYPE_LABEL[q.subtype]}</div>
        <button class="modal-close" data-close="1" title="关闭">✕</button>
      </div>
      <div class="detail-status">${status}</div>
      <div class="detail-body">
        <div class="${st.cls}">${st.html}</div>
        <div class="qnote">${escapeHtml(st.note)}</div>
        <div class="options">${buildOptions(q, picked)}</div>
        <div class="explain">${buildExplain(q, ok, false)}</div>
      </div>
      <div class="modal-foot">
        <button class="btn" id="detailRestore">放回题库重刷</button>
        <button class="btn primary" data-close="1">关闭</button>
      </div>
    `;

    $('qModal').classList.add('open');
    document.body.style.overflow = 'hidden';

    $('detailRestore').onclick = () => {
      restoreIds([qid]);
      closeDetail();
    };
  }

  function closeDetail() {
    $('qModal').classList.remove('open');
    $('qModalBox').innerHTML = '';
    document.body.style.overflow = '';
  }

  function choose(i) {
    if (locked) return;
    locked = true;

    const q = currentQ();
    const w = WORD_MAP[q.word];
    const ok = i === q.answer;

    const btns = Array.prototype.slice.call($('qOptions').querySelectorAll('.opt'));
    btns.forEach((b, j) => {
      b.classList.add('locked');
      const mark = b.querySelector('.mark');
      if (j === q.answer) { b.classList.add('correct'); mark.textContent = '✓'; }
      else if (j === i) { b.classList.add('wrong'); mark.textContent = '✗'; }
      else { b.classList.add('dim'); }
    });

    /* 本轮统计 */
    session.answered++;
    if (ok) session.ok++; else { session.bad++; session.wrongIds.push(q.id); }

    /* 全局统计 */
    state.stats.answered++;
    if (ok) state.stats.correct++;

    /* 归档 */
    const rec = state.archive[q.id] || { tries: 0, wrong: 0 };
    rec.tries++;
    rec.ok = ok;
    rec.at = Date.now();
    rec.picked = i;          // 记录本次所选项，供归档页回看作答详情
    rec.w = q.word;          // 记录所属单词与级别，便于分级统计
    rec.lv = WORD_MAP[q.word].lv;
    if (!ok) rec.wrong++;
    state.archive[q.id] = rec;
    save();
    markDirty(q.id);          // 交给同步队列上传

    /* 解析（含其余三个选项全解 + 固定搭配汇总） */
    $('qExplain').innerHTML = buildExplain(q, ok);
    $('qExplain').classList.remove('hidden');
    const en = $('explainNext');
    if (en) en.onclick = nextQuestion;

    $('progressBar').style.width = ((session.idx + 1) / session.ids.length * 100) + '%';
    $('nextBtn').disabled = false;
    $('nextBtn').textContent = session.idx === session.ids.length - 1 ? '完成本轮' : '下一题';
    renderStatStrip();
  }

  function nextQuestion() {
    if (session.idx < session.ids.length - 1) {
      session.idx++;
      renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      finishRound();
    }
  }

  function finishRound() {
    if (!session || session.answered === 0) {
      session = null;
      showPanel('setup');
      renderStatStrip();
      renderPoolInfo();
      return;
    }
    state.stats.rounds++;
    save();
    renderSummary();
    showPanel('summary');
  }

  function ringSvg(percent) {
    const r = 52, c = 2 * Math.PI * r;
    const off = c * (1 - percent / 100);
    const color = percent >= 80 ? 'var(--ok)' : percent >= 60 ? 'var(--brand)' : 'var(--bad)';
    return `<svg class="ring" width="132" height="132" viewBox="0 0 132 132">
      <circle cx="66" cy="66" r="${r}" fill="none" stroke="var(--bg-soft)" stroke-width="11"/>
      <circle cx="66" cy="66" r="${r}" fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round"
        stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"
        transform="rotate(-90 66 66)"/>
      <text x="66" y="63" text-anchor="middle" font-size="27" font-weight="700" fill="var(--text)">${percent}%</text>
      <text x="66" y="84" text-anchor="middle" font-size="11.5" fill="var(--text-3)">本轮正确率</text>
    </svg>`;
  }

  function renderSummary() {
    const total = session.answered;
    const rate = total ? Math.round(session.ok / total * 100) : 0;
    const wrongList = session.wrongIds;

    const preview = wrongList.length ? `
      <div class="wrong-preview">
        <div class="head">本轮错题（${wrongList.length}）</div>
        ${wrongList.slice(0, 8).map(id => {
          const w = WORD_MAP[Q_MAP[id].word];
          return `<div class="row"><b>${escapeHtml(w.w)}</b><span>${escapeHtml(w.meaning)}</span></div>`;
        }).join('')}
        ${wrongList.length > 8 ? `<div class="row"><span>… 还有 ${wrongList.length - 8} 个</span></div>` : ''}
      </div>` : '';

    $('summaryPanel').innerHTML = `
      <h2>本轮完成</h2>
      <p>这些题目已自动归档，不会出现在下一轮里</p>
      ${ringSvg(rate)}
      <div class="summary-grid">
        <div class="mini brand"><div class="k">本轮题量</div><div class="v">${total}</div></div>
        <div class="mini ok"><div class="k">答对</div><div class="v">${session.ok}</div></div>
        <div class="mini bad"><div class="k">答错</div><div class="v">${session.bad}</div></div>
        <div class="mini"><div class="k">待刷剩余</div><div class="v">${pendingCount('all')}</div></div>
      </div>
      ${preview}
      <div class="summary-actions">
        ${wrongList.length ? '<button class="btn primary" id="sumRestoreWrong">把本轮错题放回题库重刷</button>' : ''}
        <button class="btn" id="sumAgain">再来一轮（同设置）</button>
        <button class="btn ghost" id="sumSetup">调整设置</button>
      </div>
    `;

    const rw = $('sumRestoreWrong');
    if (rw) rw.onclick = () => {
      const ids = session.wrongIds.slice();
      ids.forEach(id => { delete state.archive[id]; });
      save();
      toast(`已把 ${ids.length} 道错题放回题库`);
      session = null;
      renderStatStrip(); renderPoolInfo();
      showPanel('setup');
    };
    $('sumAgain').onclick = () => { session = null; startRound(); };
    $('sumSetup').onclick = () => { session = null; showPanel('setup'); renderStatStrip(); renderPoolInfo(); };
  }

  /* ---------- 归档 ---------- */
  function archiveEntries() {
    let list = Object.keys(state.archive)
      .map(id => ({ id, rec: state.archive[id] || {}, q: Q_MAP[id] }))
      .filter(x => x.q && x.rec && typeof x.rec === 'object');

    if (archFilter.result === 'wrong') list = list.filter(x => !x.rec.ok);
    else if (archFilter.result === 'correct') list = list.filter(x => x.rec.ok);
    if (archFilter.kind !== 'all') list = list.filter(x => x.q.subtype === archFilter.kind);

    const kw = archFilter.q.trim().toLowerCase();
    if (kw) {
      list = list.filter(x => {
        const w = WORD_MAP[x.q.word];
        return (w.w + ' ' + w.meaning + ' ' + w.sent + ' ' + w.tr).toLowerCase().includes(kw);
      });
    }
    list.sort((a, b) => (b.rec.at || 0) - (a.rec.at || 0));
    return list;
  }

  function briefOf(q) {
    const w = WORD_MAP[q.word];
    if (q.subtype === 'en2zh') return `<b class="hl">${escapeHtml(w.w)}</b>`;
    if (q.subtype === 'zh2en') return escapeHtml(w.meaning);
    if (q.subtype === 'cloze') return escapeHtml(w.sent).replace('___', '____');
    return markTargetBold(escapeHtml(w.full), w.w);
  }

  function renderArchive() {
    const all = archiveEntries();
    const totalPages = Math.max(1, Math.ceil(all.length / ARCH_PAGE_SIZE));
    if (archPage > totalPages) archPage = totalPages;
    const start = (archPage - 1) * ARCH_PAGE_SIZE;
    const pageItems = all.slice(start, start + ARCH_PAGE_SIZE);

    /* 列表 */
    const listEl = $('archList');
    if (!all.length) {
      listEl.innerHTML = `<div class="arch-empty">${
        Object.keys(state.archive).length
          ? '当前筛选条件下没有匹配的题目'
          : '还没有归档题目，先去「训练」里刷几道吧'
      }</div>`;
    } else {
      listEl.innerHTML = pageItems.map(item => {
        const html = briefOf(item.q);
        const rec = item.rec;
        const cnt = rec.wrong ? `<span class="tag bad">错过 ${rec.wrong} 次</span>` : '';
        return `
          <div class="arch-item${selected.has(item.id) ? ' selected' : ''}" data-id="${item.id}">
            <input type="checkbox" data-check="${item.id}" ${selected.has(item.id) ? 'checked' : ''}>
            <div class="arch-main" data-open="${item.id}" title="点击查看当时的作答详情">
              <span class="arch-stem">${html}</span>
              <span class="arch-sub">
                <span class="tag">${SUBTYPE_SHORT[item.q.subtype]}</span>
                <span class="tag ${rec.ok ? 'ok' : 'bad'}">${rec.ok ? '最近答对' : '最近答错'}</span>
                ${cnt}
                <span>${fmtTime(rec.at || Date.now())}</span>
              </span>
            </div>
            <span class="arch-open">详情 ›</span>
          </div>`;
      }).join('');
    }

    /* 分页 */
    $('archPager').innerHTML = totalPages > 1 ? `
      <button data-pg="prev" ${archPage === 1 ? 'disabled' : ''}>上一页</button>
      <span class="pinfo">第 ${archPage} / ${totalPages} 页 · 共 ${all.length} 题</span>
      <button data-pg="next" ${archPage === totalPages ? 'disabled' : ''}>下一页</button>
    ` : (all.length ? `<span class="pinfo">共 ${all.length} 题</span>` : '');

    /* 计数与按钮 */
    $('archCount').textContent = `已归档 ${Object.keys(state.archive).length} 题 · 当前筛选 ${all.length} 题 · 已选 ${selected.size} 题`;
    $('restoreSelected').disabled = selected.size === 0;
    $('restoreShown').disabled = all.length === 0;
    $('restoreAll').disabled = Object.keys(state.archive).length === 0;

    const pageIds = pageItems.map(x => x.id);
    const allChecked = pageIds.length > 0 && pageIds.every(id => selected.has(id));
    $('archSelectAll').checked = allChecked;
    $('archSelectAll').indeterminate = !allChecked && pageIds.some(id => selected.has(id));
    $('archSelectAllText').textContent = allChecked ? '取消全选' : '全选本页';
  }

  function restoreIds(ids, msg) {
    if (!ids.length) return;
    ids.forEach(id => { delete state.archive[id]; });
    ids.forEach(id => selected.delete(id));
    save();
    renderArchive();
    renderStatStrip();
    renderPoolInfo();
    toast(msg || `已把 ${ids.length} 道题放回题库`);
  }

  /* ---------- 查词 ---------- */
  function searchIndex(kw) {
    const q = (kw || '').trim().toLowerCase();
    if (!q) return [];
    const hit = [];
    for (const it of META.index) {
      const w = it[0], lv = it[1], mz = it[2];
      const lw = w.toLowerCase();
      if (lw === q) hit.push({ w, lv, mz, rank: -1 });
      else if (lw.startsWith(q)) hit.push({ w, lv, mz, rank: 0 });
      else if (lw.includes(q)) hit.push({ w, lv, mz, rank: 1 });
      else if (mz.includes(kw.trim())) hit.push({ w, lv, mz, rank: 2 });
    }
    hit.sort((a, b) => a.rank - b.rank || a.w.length - b.w.length || a.w.localeCompare(b.w));
    return hit.slice(0, 80);
  }

  function renderDict(kw) {
    const box = $('dictResult');
    const hint = $('dictHint');
    if (!box) return;
    const q = (kw || '').trim();
    hint.textContent = q ? '' : `词库共 ${META.count_words} 词`;
    if (!q) {
      box.innerHTML = `<div class="dict-empty">输入英文单词或中文释义开始查询，例如 <b>abandon</b>、<b>放弃</b>、<b>ab-</b>（前缀检索）</div>`;
      return;
    }
    const list = searchIndex(q);
    if (!list.length) {
      box.innerHTML = `<div class="dict-empty">没有找到匹配 <b>${escapeHtml(q)}</b> 的词条</div>`;
      return;
    }
    box.innerHTML =
      `<div class="dict-count">找到 ${list.length} 个词条${list.length >= 80 ? '（仅显示前 80 条）' : ''}</div>` +
      list.map(x => `
        <div class="dict-item" data-word="${escapeHtml(x.w)}">
          <span class="dict-w">${escapeHtml(x.w)}</span>
          <span class="dict-lv lv${x.lv}">${LV_NAME[x.lv]}</span>
          <span class="dict-m">${escapeHtml(x.mz)}</span>
        </div>`).join('');
  }

  async function openWordCard(word) {
    const panel = $('dictCardPanel');
    const card = $('dictCard');
    panel.classList.remove('hidden');
    const lv = INDEX_LV[word];
    if (lv && !loadedLevels.has(lv)) {
      card.innerHTML = '<div class="dict-empty">正在加载词条详情…</div>';
      try { await loadLevel(lv); } catch (e) {
        card.innerHTML = '<div class="dict-empty">词条详情加载失败</div>';
        return;
      }
    }
    const w = WORD_MAP[word];
    if (!w) { card.innerHTML = '<div class="dict-empty">未找到该词条的详细数据</div>'; return; }
    card.innerHTML = `
      <div class="card-head">
        <span class="cw">${escapeHtml(w.w)}</span>
        <span class="cph">${escapeHtml(w.ph)}</span>
        <span class="cpos">${POS_LABEL[w.pos]}</span>
        <span class="dict-lv lv${w.lv}">${LV_NAME[w.lv]}</span>
        <button class="card-close" id="cardClose" title="收起">✕</button>
      </div>
      <div class="card-meaning">${escapeHtml(w.meaning)}</div>
      <div class="card-block"><b>例句</b>
        <div class="en">${markTarget(escapeHtml(w.full), w.w)}</div>
        <div class="zh">${escapeHtml(w.tr)}</div>
      </div>
      <div class="card-block"><b>备用例句</b>
        <div class="en">${markTarget(escapeHtml(w.alt), w.w)}</div>
        <div class="zh">${escapeHtml(w.altZh)}</div>
      </div>
      <div class="card-block"><b>固定搭配 / 考点</b>
        <div class="cp">${escapeHtml(w.cp)}</div>
      </div>
      <div class="card-foot">
        <button class="btn small" id="cardRestore">把该词的题放回题库重刷</button>
      </div>
    `;
    $('cardClose').onclick = () => panel.classList.add('hidden');
    $('cardRestore').onclick = () => {
      const ids = Object.keys(state.archive).filter(id => archiveWord(id) === w.w);
      if (!ids.length) { toast('该词的题目还没有刷过'); return; }
      restoreIds(ids);
    };
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ---------- 数据页 ---------- */
  function renderStats() {
    const total = META.count_questions;
    const archived = Object.keys(state.archive).length;
    const pending = Math.max(0, total - archived);
    const s = state.stats;
    const rate = s.answered ? Math.round(s.correct / s.answered * 100) : 0;

    /* 各题型统计（基于归档记录的对错） */
    const subs = ['en2zh', 'zh2en', 'cloze', 'context'];
    const bySub = subs.map(k => {
      let done = 0, ok = 0;
      for (const id in state.archive) {
        const q = Q_MAP[id];
        if (!q || q.subtype !== k) continue;
        done++;
        if (state.archive[id].ok) ok++;
      }
      return { k, done, ok, rate: done ? Math.round(ok / done * 100) : 0 };
    });

    /* 错词排行 */
    const wrongMap = {};
    for (const id in state.archive) {
      const rec = state.archive[id];
      const q = Q_MAP[id];
      if (!q || !rec.wrong) continue;
      const e = wrongMap[q.word] || (wrongMap[q.word] = { word: q.word, wrong: 0 });
      e.wrong += rec.wrong;
    }
    const topWrong = Object.values(wrongMap).sort((a, b) => b.wrong - a.wrong).slice(0, 10);

    /* 各级别进度 */
    const byLevel = [1, 2, 3, 4].map(lv => {
      const totalQ = META.levels[lv].questions;
      let done = 0;
      for (const id in state.archive) {
        const rec = state.archive[id];
        const lvv = rec.lv || INDEX_LV[rec.w || archiveWord(id)];
        if (lvv === lv) done++;
      }
      return { lv, done, totalQ, rate: totalQ ? Math.round(done / totalQ * 100) : 0 };
    });

    $('statsBody').innerHTML = `
      <div class="statstrip">
        <div class="mini brand"><div class="k">题目总数</div><div class="v">${total}</div></div>
        <div class="mini ok"><div class="k">累计作答</div><div class="v">${s.answered}<small>次</small></div></div>
        <div class="mini"><div class="k">整体正确率</div><div class="v">${rate}<small>%</small></div></div>
        <div class="mini"><div class="k">完成轮次</div><div class="v">${s.rounds}</div></div>
      </div>

      <div class="grid-2">
        <div class="card">
          <h3>各题型掌握情况</h3>
          <div class="bars">
            ${bySub.map(x => `
              <div class="bar-row">
                <div class="bar-top"><span>${SUBTYPE_LABEL[x.k]}</span><b>${x.ok} / ${x.done} · ${x.rate}%</b></div>
                <div class="bar-track"><div class="bar-fill${x.rate >= 80 ? ' ok' : x.rate < 60 ? ' bad' : ''}" style="width:${x.rate}%"></div></div>
              </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <h3>进度概览</h3>
          <div class="bars">
            <div class="bar-row">
              <div class="bar-top"><span>已刷题目</span><b>${archived} / ${total}</b></div>
              <div class="bar-track"><div class="bar-fill" style="width:${total ? (archived / total * 100).toFixed(1) : 0}%"></div></div>
            </div>
            <div class="bar-row">
              <div class="bar-top"><span>待刷题目</span><b>${pending} / ${total}</b></div>
              <div class="bar-track"><div class="bar-fill" style="width:${total ? (pending / total * 100).toFixed(1) : 0}%"></div></div>
            </div>
          </div>
          <h3 style="margin-top:22px">各级别进度</h3>
          <div class="bars">
            ${byLevel.map(x => `
              <div class="bar-row">
                <div class="bar-top"><span>${LV_NAME[x.lv]}</span><b>${x.done} / ${x.totalQ} · ${x.rate}%</b></div>
                <div class="bar-track"><div class="bar-fill" style="width:${x.rate}%"></div></div>
              </div>`).join('')}
          </div>

          <h3 style="margin-top:22px">错词排行</h3>
          <div class="top-list">
            ${topWrong.length ? topWrong.map((x, i) => {
              const w = WORD_MAP[x.word];
              const mz = w ? w.meaning : (META.index.find(it => it[0] === x.word) || [, , ''])[2];
              return `<div class="top-row">
                <span class="rank">${i + 1}</span>
                <span class="w">${escapeHtml(x.word)}</span>
                <span class="m">${escapeHtml(mz || '')}</span>
                <span class="c">错 ${x.wrong} 次</span>
              </div>`;
            }).join('') : '<div class="arch-empty" style="padding:24px">还没有错题记录，继续保持</div>'}
          </div>
        </div>
      </div>

      <div class="card danger-zone">
        <h3>重置数据</h3>
        <p>清空所有练习进度与归档记录，题库回到未刷状态。此操作不可撤销。</p>
        <button class="btn danger-ghost" id="resetBtn">清空全部进度</button>
      </div>
    `;

    $('resetBtn').onclick = () => {
      if (!confirm('确定要清空全部练习进度吗？此操作不可撤销。')) return;
      state.archive = {};
      state.stats = { answered: 0, correct: 0, rounds: 0 };
      selected.clear();
      save();
      renderStats(); renderStatStrip(); renderPoolInfo(); renderArchive();
      toast('已清空全部进度');
    };
  }

  /* ---------- 事件绑定 ---------- */
  function bindChips(containerId, key, cast) {
    const box = $(containerId);
    box.addEventListener('click', e => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      box.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      cfg[key] = cast ? cast(btn.dataset[key]) : btn.dataset[key];
      renderPoolInfo();
    });
  }

  function bind() {
    /* 导航 */
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => switchView(el.dataset.nav));
    });

    /* 主题 */
    $('themeBtn').addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      save();
    });

    /* 配置 */
    bindChips('scopeChips', 'scope');
    bindChips('sizeChips', 'size', v => parseInt(v, 10));
    bindChips('orderChips', 'order');
    /* 词汇级别：切换时按需加载对应分片 */
    $('levelChips').addEventListener('click', async e => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      $('levelChips').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      cfg.level = btn.dataset.level;
      renderPoolInfo();
      try {
        await ensureLevels(levelList(cfg.level));
      } catch (err) {
        toast(err.message);
      }
      renderPoolInfo();
      renderStatStrip();
    });

    /* 开始 */
    $('startBtn').addEventListener('click', startRound);

    /* 答题 */
    $('qOptions').addEventListener('click', e => {
      const btn = e.target.closest('.opt');
      if (!btn) return;
      choose(parseInt(btn.dataset.i, 10));
    });
    $('nextBtn').addEventListener('click', nextQuestion);
    $('quitBtn').addEventListener('click', () => {
      if (session && session.answered > 0) finishRound();
      else { session = null; showPanel('setup'); renderStatStrip(); renderPoolInfo(); }
    });

    /* 键盘 */
    document.addEventListener('keydown', e => {
      if ($('quizPanel').classList.contains('hidden')) return;
      if (e.key >= '1' && e.key <= '4') {
        if (!locked) choose(parseInt(e.key, 10) - 1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (!$('nextBtn').disabled) { e.preventDefault(); nextQuestion(); }
      }
    });

    /* 归档筛选 */
    $('archResult').addEventListener('click', e => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      $('archResult').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      archFilter.result = btn.dataset.result;
      archPage = 1;
      selected.clear();
      renderArchive();
    });
    $('archKind').addEventListener('change', e => {
      archFilter.kind = e.target.value;
      archPage = 1;
      selected.clear();
      renderArchive();
    });
    let searchTimer;
    $('archSearch').addEventListener('input', e => {
      clearTimeout(searchTimer);
      const v = e.target.value;
      searchTimer = setTimeout(() => {
        archFilter.q = v;
        archPage = 1;
        selected.clear();
        renderArchive();
      }, 180);
    });

    /* 归档选择 */
    $('archList').addEventListener('change', e => {
      const cb = e.target.closest('input[data-check]');
      if (!cb) return;
      const id = cb.dataset.check;
      if (cb.checked) selected.add(id); else selected.delete(id);
      renderArchive();
    });

    /* 点击题目内容 → 回看当时的作答详情 */
    $('archList').addEventListener('click', e => {
      if (e.target.closest('input[data-check]')) return;   // 点复选框只作选择
      const open = e.target.closest('[data-open]');
      if (!open) return;
      openDetail(open.dataset.open);
    });

    /* 详情弹层关闭 */
    $('qModal').addEventListener('click', e => {
      if (e.target.closest('[data-close]')) closeDetail();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && $('qModal').classList.contains('open')) closeDetail();
    });
    $('archSelectAll').addEventListener('change', e => {
      const all = archiveEntries();
      const start = (archPage - 1) * ARCH_PAGE_SIZE;
      const pageIds = all.slice(start, start + ARCH_PAGE_SIZE).map(x => x.id);
      if (e.target.checked) pageIds.forEach(id => selected.add(id));
      else pageIds.forEach(id => selected.delete(id));
      renderArchive();
    });

    /* 批量放回 */
    $('restoreSelected').addEventListener('click', () => {
      restoreIds(Array.from(selected));
    });
    $('restoreShown').addEventListener('click', () => {
      const ids = archiveEntries().map(x => x.id);
      restoreIds(ids, `已把当前筛选的 ${ids.length} 道题放回题库`);
    });
    $('restoreAll').addEventListener('click', () => {
      const n = Object.keys(state.archive).length;
      if (!n) return;
      if (!confirm(`确定要把全部 ${n} 道已归档题目放回题库吗？`)) return;
      state.archive = {};
      selected.clear();
      save();
      renderArchive(); renderStatStrip(); renderPoolInfo();
      toast(`已把 ${n} 道题全部放回题库`);
    });

    /* 分页 */
    $('archPager').addEventListener('click', e => {
      const btn = e.target.closest('button[data-pg]');
      if (!btn) return;
      archPage += btn.dataset.pg === 'next' ? 1 : -1;
      renderArchive();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* 查词 */
    let dictTimer;
    $('dictInput').addEventListener('input', e => {
      clearTimeout(dictTimer);
      const v = e.target.value;
      dictTimer = setTimeout(() => renderDict(v), 140);
    });
    $('dictInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const first = $('dictResult').querySelector('[data-word]');
        if (first) openWordCard(first.dataset.word);
      }
    });
    $('dictResult').addEventListener('click', e => {
      const it = e.target.closest('[data-word]');
      if (it) openWordCard(it.dataset.word);
    });

    /* ---------- 账号菜单 ---------- */
    on('acctBtn', 'click', e => {
      e.stopPropagation();
      toggleAcctDrop();
    });
    document.addEventListener('click', e => {
      const menu = $('acctMenu');
      if (!menu || !menu.contains(e.target)) toggleAcctDrop(false);
    });
    const drop = $('acctDrop');
    if (drop) drop.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => toggleAcctDrop(false));
    });
    on('logoutBtn', 'click', doLogout);
    on('acctLogoutBtn', 'click', doLogout);
    on('syncBadge', 'click', async () => {
      syncError = '';
      await flushSync();
      updateSyncBadge();
    });

    on('acctSyncBtn', 'click', async () => {
      const btn = $('acctSyncBtn');
      btn.disabled = true;
      const l = btn.textContent;
      btn.textContent = '同步中…';
      try {
        await flushSync();
        await loadAllProgress();
        toast('进度已同步');
      } catch (e) {
        toast('同步失败：' + e.message);
      }
      btn.disabled = false;
      btn.textContent = l;
      renderAccount();
      renderStatStrip();
    });

    on('acctClearBtn', 'click', async () => {
      if (!confirm('确定清空账号里的全部刷题进度吗？本机与云端都会清空，且不可撤销。')) return;
      try {
        await api('/api/progress/clear', { body: {} });
        state.archive = {};
        state.stats = { answered: 0, correct: 0, rounds: 0 };
        state.watermark = 0;
        pendingSync.clear();
        save();
        renderStatStrip();
        renderPoolInfo();
        renderAccount();
        renderArchive();
        toast('账号进度已清空');
      } catch (e) {
        toast('清空失败：' + e.message);
      }
    });

    /* ---------- 我的收藏 ---------- */
    /* 事件委托：解析区、归档详情、收藏页的收藏按钮都由这里统一处理 */
    document.addEventListener('click', e => {
      const b = e.target.closest('.fav-btn');
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(b.dataset.fav);
    });
    on('favSearch', 'input', () => renderFavorites());
    on('favExportCsv', 'click', () => exportFavorites('csv'));
    on('favExportMd', 'click', () => exportFavorites('md'));

    /* ---------- 登录 / 注册 / 重置 ---------- */
    on('authForm', 'submit', submitAuth);
    on('pwdForm', 'submit', submitPwdChange);
    /* 事件委托：重置页动态替换的链接按钮同样能响应 */
    on('authLinks', 'click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.id === 'authToRegister') setAuthMode('register');
      else if (b.id === 'authToForgot' || b.id === 'authRetryForgot') setAuthMode('forgot');
      else if (b.id === 'authToLogin') setAuthMode('login');
      else if (b.id === 'authBackApp') { clearUrlParams(); enterApp(account); }
    });

    /* 退出/关闭页面时，尽力把未上传的改动推上去 */
    window.addEventListener('pagehide', () => {
      if (OFFLINE || !account || pendingSync.size === 0) return;
      const payload = {};
      pendingSync.forEach(id => { if (state.archive[id]) payload[id] = state.archive[id]; });
      try {
        fetch('/api/progress/sync', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archive: payload, since: state.watermark || 0 }),
          keepalive: true
        });
      } catch (e) { /* 忽略 */ }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && account && pendingSync.size) flushSync();
    });
  }

  /* ---------- 账号界面 ---------- */
  let authMode = 'login';
  let authBusy = false;
  let resetToken = '';
  let resetEmail = '';

  const AUTH_TEXT = {
    login: {
      title: '登录',
      sub: '刷题进度保存在账号里，换设备登录同一邮箱即可接着刷。',
      submit: '登录'
    },
    register: {
      title: '创建账号',
      sub: '注册后进度会跟随账号同步，手机、平板、电脑都能接着刷。',
      submit: '注册并开始'
    },
    forgot: {
      title: '找回密码',
      sub: '填写注册时使用的邮箱，我们会发送一封带重置链接的邮件。',
      submit: '发送重置邮件'
    },
    reset: {
      title: '设置新密码',
      sub: '',
      submit: '保存新密码'
    }
  };

  const AUTH_LINKS_DEFAULT = `
        <button type="button" class="link-btn" id="authToRegister">还没有账号？立即注册</button>
        <span class="auth-dot">·</span>
        <button type="button" class="link-btn" id="authToForgot">忘记密码</button>`;

  /* 重置链接失效时，给一个能走出去的出口：已登录就回应用，未登录就重新申请 */
  function renderResetFallback() {
    const box = $('authLinks');
    box.innerHTML = account
      ? `<button type="button" class="link-btn" id="authBackApp">← 返回应用</button>
         <span class="auth-dot">·</span>
         <button type="button" class="link-btn" id="authRetryForgot">重新申请重置邮件</button>`
      : `<button type="button" class="link-btn" id="authRetryForgot">重新申请重置邮件</button>
         <span class="auth-dot">·</span>
         <button type="button" class="link-btn" id="authToLogin">返回登录</button>`;
    box.classList.remove('hidden');
  }

  function setAuthMsg(text, kind) {
    const el = $('authMsg');
    if (!text) { el.className = 'auth-msg hidden'; el.textContent = ''; return; }
    el.className = 'auth-msg' + (kind === 'bad' ? ' bad' : kind === 'ok' ? ' ok' : '');
    el.textContent = text;
  }

  function setAuthMode(mode, opt) {
    authMode = mode;
    const t = AUTH_TEXT[mode] || AUTH_TEXT.login;
    const isReset = mode === 'reset';
    const needEmail = !isReset;
    const needPass = mode !== 'forgot';
    const needPass2 = mode === 'register' || isReset;

    $('authTitle').textContent = t.title;
    $('authSub').textContent = (opt && opt.sub !== undefined) ? opt.sub : t.sub;
    $('authSub').style.display = $('authSub').textContent ? '' : 'none';
    $('authSubmit').textContent = t.submit;
    $('authSubmit').disabled = false;

    $('authEmailField').classList.toggle('hidden', !needEmail);
    $('authPassField').classList.toggle('hidden', !needPass);
    $('authPass2Field').classList.toggle('hidden', !needPass2);
    if (isReset) {
      $('authLinks').classList.add('hidden');
    } else {
      $('authLinks').innerHTML = AUTH_LINKS_DEFAULT;   // 从失效重置页返回时复原
      $('authLinks').classList.remove('hidden');
    }
    $('authDemo').classList.add('hidden');

    $('authPass').value = '';
    $('authPass2').value = '';
    $('authPass').setAttribute('autocomplete', mode === 'login' ? 'current-password' : 'new-password');
    setAuthMsg('');

    if (isReset) {
      // 重置时邮箱由链接携带，只做展示
      let f = $('authEmailRo');
      if (!f) {
        f = document.createElement('div');
        f.id = 'authEmailRo';
        f.className = 'auth-field';
        $('authEmailField').parentNode.insertBefore(f, $('authEmailField'));
      }
      f.innerHTML = `<label>账号</label><div class="auth-ro">${escapeHtml(resetEmail || '—')}</div>`;
    } else {
      const f = $('authEmailRo');
      if (f) f.remove();
      $('authEmail').disabled = false;
    }

    const focusEl = needEmail ? $('authEmail') : $('authPass');
    if (focusEl && window.innerWidth > 720) setTimeout(() => focusEl.focus(), 60);
  }

  function showAuth() {
    ['train', 'archive', 'dict', 'stats', 'account'].forEach(v => {
      const el = $('view-' + v);
      if (el) el.classList.add('hidden');
    });
    $('view-auth').classList.remove('hidden');
    $('nav').classList.add('hidden');
    $('acctMenu').classList.add('hidden');
    $('syncBadge').hidden = true;
    document.body.classList.add('auth-mode');
    $('footerInfo').textContent =
      `CET-6 词汇训练营 ${APP_VERSION} · ${META.count_words} 个核心词 / ${META.count_questions} 道题`;
    window.scrollTo({ top: 0 });
  }

  function hideAuth() {
    $('view-auth').classList.add('hidden');
    $('nav').classList.remove('hidden');
    document.body.classList.remove('auth-mode');
  }

  function applyAccountUI() {
    if (!account) return;
    $('acctMenu').classList.remove('hidden');
    $('acctEmail').textContent = account.email;
    $('acctAvatar').textContent = (account.email || '?').charAt(0).toUpperCase();
  }

  function toggleAcctDrop(force) {
    const d = $('acctDrop');
    if (!d) return;
    const show = force !== undefined ? force : d.classList.contains('hidden');
    d.classList.toggle('hidden', !show);
    const b = $('acctBtn');
    if (b) b.setAttribute('aria-expanded', show ? 'true' : 'false');
  }

  function clearUrlParams() {
    try {
      const u = new URL(location.href);
      u.searchParams.delete('reset');
      const q = u.searchParams.toString();
      history.replaceState(null, '', u.pathname + (q ? '?' + q : '') + u.hash);
    } catch (e) { /* 忽略 */ }
  }

  async function enterApp(user) {
    account = user || account;
    if (account) {
      // 本机缓存若属于另一个账号，先清掉，免得把别人的进度合并进来；
      // owner 为空说明是「登录前遗留的本机进度」，应当保留并上传
      if (state.owner && state.owner !== account.email) {
        state.archive = {};
        state.stats = { answered: 0, correct: 0, rounds: 0 };
        state.watermark = 0;
        state.favorites = {};
      }
      state.owner = account.email;
    }
    pendingSync.clear();
    syncError = '';
    save();

    applyAccountUI();
    hideAuth();
    session = null;
    showPanel('setup');
    switchView('train');
    renderStatStrip();
    renderPoolInfo();

    try {
      await loadAllProgress();
    } catch (e) {
      toast('进度同步失败：' + e.message);
    }
    await loadFavorites();
    if (curView === 'favorites') renderFavorites();
    if (!loadedLevels.has(1)) {
      try { await loadLevel(1); } catch (e) { /* 已提示 */ }
    }
    renderStatStrip();
    renderPoolInfo();
    updateSyncBadge();
  }

  async function doLogout() {
    toggleAcctDrop(false);
    try { await flushSync(); } catch (e) { /* 尽力同步 */ }
    try { await api('/api/auth/logout', { body: {} }); } catch (e) { /* 忽略 */ }

    account = null;
    pendingSync.clear();
    syncError = '';
    clearTimeout(syncTimer);
    state.archive = {};
    state.stats = { answered: 0, correct: 0, rounds: 0 };
    state.owner = null;
    state.watermark = 0;
    state.favorites = {};
    save();

    session = null;
    $('acctMenu').classList.add('hidden');
    $('authEmail').value = '';
    setAuthMode('login');
    showAuth();
  }

  function showForgotResult(r, email) {
    const box = $('authDemo');
    let html = `<div class="demo-head">${escapeHtml(r.message || '')}</div>`;
    if (r.demoLink) {
      html += `<div class="demo-tip">未配置发信邮箱，当前为演示模式 —— 直接点下面这条链接即可重置密码。</div>
        <a class="demo-link" href="${escapeHtml(r.demoLink)}">${escapeHtml(r.demoLink)}</a>`;
    }
    html += `<div class="demo-note">链接 ${r.ttlMinutes || 30} 分钟内有效，且只能使用一次。</div>`;
    box.innerHTML = html;
    box.classList.remove('hidden');
    $('authSubmit').textContent = '重新发送';
  }

  async function submitAuth(e) {
    if (e) e.preventDefault();
    if (authBusy) return;

    const email = $('authEmail').value.trim();
    const pass = $('authPass').value;
    const pass2 = $('authPass2').value;

    if (authMode !== 'reset') {
      if (!email) return setAuthMsg('请输入邮箱地址');
      if (!/^[^@\s]+@[^@\s.]+\.[^@\s.]+$/.test(email)) return setAuthMsg('邮箱格式看起来不太对，请检查一下');
    }
    if (authMode !== 'forgot') {
      if (!pass) return setAuthMsg('请输入密码');
      if (authMode !== 'login' && pass.length < 8) return setAuthMsg('密码至少需要 8 位');
      if (authMode !== 'login' && pass !== pass2) return setAuthMsg('两次输入的密码不一致');
    }

    authBusy = true;
    const btn = $('authSubmit');
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = '处理中…';
    setAuthMsg('');

    try {
      if (authMode === 'login') {
        const r = await api('/api/auth/login', { body: { email, password: pass } });
        await enterApp(r.user);
      } else if (authMode === 'register') {
        const r = await api('/api/auth/register', { body: { email, password: pass } });
        await enterApp(r.user);
      } else if (authMode === 'forgot') {
        const r = await api('/api/auth/forgot', { body: { email } });
        showForgotResult(r, email);
      } else if (authMode === 'reset') {
        const r = await api('/api/auth/reset', { body: { token: resetToken, password: pass } });
        clearUrlParams();
        setAuthMsg('');
        await enterApp(r.user);
        toast('密码已更新');
      }
    } catch (err) {
      setAuthMsg(err.message, 'bad');
    } finally {
      authBusy = false;
      btn.disabled = false;
      btn.textContent = (authMode === 'forgot' && !$('authDemo').classList.contains('hidden'))
        ? '重新发送' : (AUTH_TEXT[authMode] || AUTH_TEXT.login).submit;
      void label;
    }
  }

  async function checkResetToken(token) {
    resetToken = token;
    try {
      const r = await api('/api/auth/reset-check?token=' + encodeURIComponent(token));
      if (r.valid) {
        resetEmail = r.email || '';
        setAuthMode('reset', { sub: `正在为 ${r.email} 设置新密码，设置后原密码立即失效。` });
      } else {
        resetEmail = '';
        setAuthMode('reset', { sub: '这个重置链接无效或已过期。' });
        $('authSubmit').disabled = true;
        setAuthMsg('链接无效或已过期，请重新申请一封重置邮件。', 'bad');
        renderResetFallback();
      }
    } catch (err) {
      setAuthMode('reset', { sub: '无法校验重置链接。' });
      $('authSubmit').disabled = true;
      setAuthMsg(err.message, 'bad');
      renderResetFallback();
    }
  }

  /* ---------- 账号设置页 ---------- */
  function renderAccount() {
    if (!account) return;
    $('acctBigAvatar').textContent = (account.email || '?').charAt(0).toUpperCase();
    $('acctBigEmail').textContent = account.email;

    const t = account.createdAt ? new Date(account.createdAt * 1000) : null;
    const p2 = n => String(n).padStart(2, '0');
    const reg = t ? `注册于 ${t.getFullYear()}-${p2(t.getMonth() + 1)}-${p2(t.getDate())}` : '';

    const ids = Object.keys(state.archive);
    const words = new Set(ids.map(archiveWord).filter(Boolean)).size;
    $('acctBigMeta').textContent = [reg, `已归档 ${ids.length} 题`, `已练 ${words} 个词`]
      .filter(Boolean).join(' · ');

    const stateCls = syncError ? 'bad' : (syncing || pendingSync.size ? 'busy' : 'ok');
    const stateText = syncError ? '同步失败'
      : syncing ? '正在同步…'
        : pendingSync.size ? `有 ${pendingSync.size} 条待上传` : '进度已同步到账号';

    $('acctSync').innerHTML = `
      <div class="sync-dot ${stateCls}"></div>
      <div class="sync-text">
        <b>${stateText}</b>
        <span>${syncError ? escapeHtml(syncError) : '改动会自动上传，无需手动保存'}</span>
      </div>
      <button class="btn small" id="acctSyncInline" type="button">立即同步</button>`;

    const b = $('acctSyncInline');
    if (b) {
      b.onclick = async () => {
        b.disabled = true;
        b.textContent = '同步中…';
        try {
          await flushSync();
          await loadAllProgress();
          toast('进度已同步');
        } catch (e) {
          toast('同步失败：' + e.message);
        }
        renderAccount();
        renderStatStrip();
      };
    }
  }

  async function submitPwdChange(e) {
    e.preventDefault();
    const oldPw = $('pwdOld').value;
    const nw = $('pwdNew').value;
    const nw2 = $('pwdNew2').value;
    const msg = $('pwdMsg');
    const show = (text, kind) => {
      msg.textContent = text;
      msg.className = 'auth-msg' + (kind ? ' ' + kind : '');
    };

    if (!oldPw) return show('请输入当前密码', 'bad');
    if (!nw) return show('请输入新密码', 'bad');
    if (nw.length < 8) return show('新密码至少需要 8 位', 'bad');
    if (nw !== nw2) return show('两次输入的新密码不一致', 'bad');
    if (nw === oldPw) return show('新密码不能与当前密码相同', 'bad');

    const btn = $('pwdSubmit');
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = '更新中…';
    try {
      await api('/api/auth/change-password', { body: { oldPassword: oldPw, newPassword: nw } });
      $('pwdOld').value = '';
      $('pwdNew').value = '';
      $('pwdNew2').value = '';
      show('密码已更新，下次登录请使用新密码。', 'ok');
      toast('密码已更新');
    } catch (err) {
      show(err.message, 'bad');
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  /* ---------- 启动 ---------- */
  async function init() {
    try { await load(); } catch (e) { document.getElementById('app').textContent = '无法读取学习进度：' + e.message; return; }
    applyTheme();
    bind();
    $('footerInfo').textContent =
      `CET-6 词汇训练营 ${APP_VERSION} · ${META.count_words} 个核心词 / ${META.count_questions} 道题`
      + (OFFLINE ? ' · 进度保存在云端' : '');
    /* 级别筛选上标注各级词数 */
    document.querySelectorAll('#levelChips .chip').forEach(btn => {
      const lv = btn.dataset.level;
      btn.textContent = lv === 'all'
        ? `全部（${META.count_words}）`
        : `${LV_NAME[lv]}（${META.levels[lv].words}）`;
    });
    const af = $('authFoot');
    if (af) af.innerHTML =
      '密码以 scrypt 加盐哈希存储，我们不会保存明文。<br>刷题进度保存在账号中，登录即可跨设备继续。';

    /* 先用轻量索引渲染框架 */
    renderStatStrip();
    renderPoolInfo();
    showPanel('setup');
    renderDict('');

    /* 离线单文件版，或浏览器缓存了没有账号界面的旧页面：不接账号体系，进度只存本机 */
    if (OFFLINE || !HAS_AUTH_UI) {
      document.body.classList.add('offline');
      hideAuth();
      updateSyncBadge();
      try { await loadLevel(1); } catch (e) { toast('题库加载失败：' + e.message); }
      renderStatStrip();
      renderPoolInfo();
      return;
    }

    /* 邮件里的重置链接优先处理 */
    let tk = '';
    try { tk = new URLSearchParams(location.search).get('reset') || ''; } catch (e) { /* 忽略 */ }

    let me = null;
    try {
      const r = await api('/api/auth/me');
      me = r.user;
    } catch (err) {
      if (err.status !== 401) {
        setAuthMode('login', { sub: '暂时无法连接服务器，请稍后重试。' });
        setAuthMsg(err.message, 'bad');
        $('authSubmit').disabled = true;
      }
    }

    if (tk) {
      account = me || null;
      if (me) { state.owner = me.email; }
      showAuth();
      await checkResetToken(tk);
      return;
    }

    if (me) {
      await enterApp(me);
      return;
    }

    setAuthMode('login');
    showAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
