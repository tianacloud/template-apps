/* ============================================================
 * NameSmith 命名工坊 - 应用逻辑
 * ============================================================ */
(function () {
  'use strict';

  const D = window.DICT;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.prototype.slice.call(document.querySelectorAll(s));

  /* ---------------------------------------------------------
   * 0. 小工具
   * ------------------------------------------------------- */
  const lower = (s) => String(s || '').toLowerCase();
  const cap = (s) => {
    s = String(s || '');
    if (!s) return '';
    // 已含内部大写的词（loggedIn / readOnly）只抬首字母，别把驼峰量纲毁掉
    if (/[a-z][A-Z]/.test(s)) return s[0].toUpperCase() + s.slice(1);
    return s[0].toUpperCase() + s.slice(1).toLowerCase();
  };
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const uniq = (arr) => Array.prototype.filter.call(arr, (v, i, a) => a.indexOf(v) === i && v);

  function pluralize(w) {
    w = String(w || '');
    if (!w) return w;
    if (/(s|x|z|ch|sh)$/i.test(w)) return w + 'es';
    if (/[^aeiou]y$/i.test(w)) return w.slice(0, -1) + 'ies';
    return w + 's';
  }

  function splitWords(raw) {
    return String(raw || '')
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2')
      .replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2')
      .split(/[^a-zA-Z0-9\u4e00-\u9fa5]+/)
      .filter(Boolean);
  }

  const CASER = {
    camel: (ws) => ws.map((w, i) => (i === 0 ? lower(w) : cap(w))).join(''),
    pascal: (ws) => ws.map(cap).join(''),
    snake: (ws) => ws.map(lower).join('_'),
    kebab: (ws) => ws.map(lower).join('-'),
    screaming: (ws) => ws.map((w) => lower(w).toUpperCase()).join('_'),
    lower: (ws) => ws.map(lower).join('')
  };

  function applyCase(words, style) {
    const flat = [];
    words.forEach((w) => { splitWords(w).forEach((p) => flat.push(p)); });
    const fn = CASER[style] || CASER.camel;
    return fn(flat);
  }

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    $('#toastWrap').appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .25s, transform .25s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      setTimeout(() => el.remove(), 260);
    }, 1700);
  }

  function copyText(text, okMsg) {
    const done = () => toast(okMsg || '已复制到剪贴板');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallback());
    } else {
      fallback();
    }
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('复制失败，请手动选择'); }
      ta.remove();
    }
  }

  const COPY_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const CHECK_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  /* ---------------------------------------------------------
   * 1. 词典索引
   * ------------------------------------------------------- */
  const IX = { v: {}, n: {}, m: {}, s: {} };

  function putEntry(dict, role) {
    dict.forEach((e) => {
      // 只把「主词」写进语义索引，近义词仅用于候选派生，避免语义漂移
      const pool = [e.w];
      if (e.p) pool.push(e.p);
      if (e.adj) pool.push(e.adj);
      uniq(pool.filter(Boolean).map(lower)).forEach((w) => { IX[role][w] = e; });
    });
  }
  putEntry(D.NOUNS, 'n');
  putEntry(D.VERBS, 'v');
  putEntry(D.MODS, 'm');
  putEntry(D.STATES, 's');

  /* ---- 自定义词库：用户补过的词会记在本地，下次自动识别 ---- */
  const LEX_KEY = 'namesmith.lexicon.v1';
  let LEXICON = {};
  let CUSTOM_SEQ = 0;

  function loadLexicon() {
    try { LEXICON = JSON.parse(localStorage.getItem(LEX_KEY) || '{}') || {}; } catch (e) { LEXICON = {}; }
  }
  function saveLexicon() {
    try { localStorage.setItem(LEX_KEY, JSON.stringify(LEXICON)); } catch (e) { /* ignore */ }
  }

  const CN_KEY_MAP = {}; // key → {role, e}，供纠错表反查
  const CN_PAIRS = (function () {
    const pairs = [];
    // 顺序即优先级：名词 > 动词 > 修饰 > 状态
    D.NOUNS.forEach((e) => e.k.forEach((k) => pairs.push({ k: k, role: 'n', e: e })));
    D.VERBS.forEach((e) => e.k.forEach((k) => pairs.push({ k: k, role: 'v', e: e })));
    D.MODS.forEach((e) => e.k.forEach((k) => pairs.push({ k: k, role: 'm', e: e })));
    D.STATES.forEach((e) => e.k.forEach((k) => pairs.push({ k: k, role: 's', e: e })));
    pairs.forEach((p) => { if (!CN_KEY_MAP[p.k]) CN_KEY_MAP[p.k] = { role: p.role, e: p.e }; });
    return pairs.sort((a, b) => b.k.length - a.k.length);
  })();

  // 自定义词条动态并入匹配表（最长优先），用户补过的词下次直接命中
  let CN_PAIRS_LIVE = null;
  let STOP_PAIRS = null; // 惰性构建：STOPWORDS 定义在下方

  function getPairs() {
    if (CN_PAIRS_LIVE) return CN_PAIRS_LIVE;
    if (!STOP_PAIRS) STOP_PAIRS = STOPWORDS.map((w) => ({ k: w, role: 'stop' }));
    const extra = Object.keys(LEXICON).map((cn) => ({
      k: cn, role: 'n', e: null, custom: true, word: LEXICON[cn]
    }));
    // 停用词放在最前：同长度时优先被丢弃，避免"对账"被"对"劈开
    CN_PAIRS_LIVE = STOP_PAIRS.concat(CN_PAIRS, extra).sort((a, b) => b.k.length - a.k.length);
    return CN_PAIRS_LIVE;
  }
  function invalidatePairs() { CN_PAIRS_LIVE = null; }

  const STOPWORDS = ['帮我', '我想', '我要', '需要', '请', '生成', '起名', '取个', '命名', '叫做', '名字',
    '的变量', '变量', '属性', '的函数', '函数', '方法', '布尔', '的类', '组件名', '常量', '路由',
    '数据库表', '数据表', '表名', '文件名', '分支名', '分支', '钩子', 'hook', '的', '了', '和', '与',
    '或', '把', '将', '在', '给', '对', '从', '到', '为', '是', '有', '那个', '这个', '一个', '一下',
    '怎样', '怎么', '什么', '名称', '程序员', '代码', '给我', '希望', '应该', '可以', '求', '大佬',
    '谢谢', '并', '然后', '以及', '还有', '一些', '所有', '每个'];

  // 顺序敏感：长词在前，避免「列表」被误判成「表」
  const TYPE_HINT = [
    ['数据库表', 'table'], ['数据表', 'table'], ['表名', 'table'],
    ['文件名', 'file'], ['文件', 'file'], ['分支', 'branch'],
    ['hook', 'hook'], ['钩子', 'hook'], ['事件处理', 'handler'], ['回调', 'handler'], ['事件', 'handler'],
    ['路由', 'route'], ['接口', 'route'], ['api', 'route'],
    ['布尔', 'boolean'], ['是否', 'boolean'],
    ['常量', 'constant'], ['组件', 'class'], ['类', 'class'],
    ['函数', 'function'], ['方法', 'function'], ['变量', 'variable'], ['属性', 'variable'], ['字段', 'variable']
  ];

  /* ---------------------------------------------------------
   * 2. 分词 / 语义 tokenize
   * ------------------------------------------------------- */
  /* ---------------------------------------------------------
   * 2. 分词 / 语义 tokenize（带容错）
   * ------------------------------------------------------- */

  // 全角转半角 + 统一小写
  function normalizeText(raw) {
    return String(raw || '')
      .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
      .replace(/\u3000/g, ' ')
      .toLowerCase()
      .trim();
  }

  // 编辑距离（只用于 2-4 字短串，成本可忽略）
  function editDistance(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = [];
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      prev = cur;
    }
    return prev[n];
  }

  // 精确最长匹配（含用户自定义词）
  function exactMatch(text, i) {
    const pairs = getPairs();
    for (let p = 0; p < pairs.length; p++) {
      if (text.substr(i, pairs[p].k.length) === pairs[p].k) return pairs[p];
    }
    return null;
  }

  // 纠错：只查显式错别字表。通用编辑距离会把「量子」硬掰成「帖子」，误伤生词
  function fuzzyMatch(text, i) {
    if (!/[\u4e00-\u9fa5]/.test(text[i] || '')) return null;
    for (let len = 4; len >= 2; len--) {
      const seg = text.substr(i, len);
      if (seg.length < 2) continue;
      const fixed = D.TYPO_FIX[seg];
      if (!fixed || fixed === seg) continue;
      const hit = CN_KEY_MAP[fixed];
      if (hit) return { role: hit.role, e: hit.e, k: fixed, consumed: len };
    }
    return null;
  }

  // 中文扫描：产出 token，同时收集英文碎片与「没看懂的中文」
  function scanChinese(text) {
    const tokens = [];
    const leftovers = [];
    const unknowns = [];
    let i = 0;
    let buffer = '';
    let cnBuf = '';
    const flushEn = () => { if (buffer) { leftovers.push(buffer); buffer = ''; } };
    // 词库里没有的中文：不再丢弃，转成「待补英文」的语义单元，直接参与生成
    const flushCn = () => {
      if (!cnBuf) return;
      const cn = cnBuf;
      cnBuf = '';
      const mapped = LEXICON[cn];
      const word = mapped || ('custom' + (++CUSTOM_SEQ));
      tokens.push({
        role: 'n', e: null, word: word, plural: pluralize(word), alt: [],
        raw: cn, rawText: cn, cnText: cn,
        unknownWord: !mapped, mappedWord: mapped || null
      });
    };

    while (i < text.length) {
      let hit = exactMatch(text, i);
      let typo = false;
      let consumed = hit ? hit.k.length : 0;
      if (!hit) {
        const fz = fuzzyMatch(text, i);
        if (fz) { hit = fz; typo = true; consumed = fz.consumed; }
      }
      if (hit) {
        // 停用词：丢弃，但不 flush 中文缓冲，避免"玄学的调度器"被切成两段
        if (hit.role === 'stop') { flushEn(); i += hit.k.length; continue; }
        flushEn(); flushCn();
        let tk;
        if (hit.custom) {
          tk = { role: 'n', e: null, word: hit.word, plural: pluralize(hit.word), alt: [], raw: hit.k, mappedWord: hit.word };
        } else {
          tk = mkToken(hit.role, hit.e, hit.k);
        }
        if (typo) { tk.typo = true; tk.guess = hit.k; tk.rawText = text.substr(i, consumed); }
        tokens.push(tk);
        i += consumed;
      } else {
        const ch = text[i];
        if (/[a-zA-Z0-9]/.test(ch)) { flushCn(); buffer += ch; }
        else if (/[\u4e00-\u9fa5]/.test(ch)) { flushEn(); cnBuf += ch; }
        else { flushEn(); flushCn(); }
        i++;
      }
    }
    flushEn(); flushCn();
    return { tokens: tokens, leftovers: leftovers, unknowns: unknowns };
  }

  function tokenize(raw) {
    const text = normalizeText(raw);
    CUSTOM_SEQ = 0;
    let typeHint = null;
    TYPE_HINT.forEach((pair) => {
      if (!typeHint && text.indexOf(pair[0]) !== -1) typeHint = pair[1];
    });
    // 全大写的英文短语（MAX RETRY COUNT）几乎必然是常量
    if (!typeHint && !/[\u4e00-\u9fa5]/.test(String(raw)) && /[A-Z]/.test(String(raw)) &&
        String(raw) === String(raw).toUpperCase() && /[A-Z_ ]{3,}/.test(String(raw))) {
      typeHint = 'constant';
    }

    let clean = text;
    // 停用词不再预先剥离（会劈坏"对账"这类词），改由分词阶段丢弃
    const boolHint = D.BOOL_HINTS.some((h) => text.indexOf(h) !== -1) ||
      ['吗', '能否', '有没有'].some((h) => text.indexOf(h) !== -1);

    const hasCN = /[\u4e00-\u9fa5]/.test(clean);
    let tokens = [];
    let leftovers = [];
    let unknowns = [];

    if (hasCN) {
      const scanned = scanChinese(clean);
      tokens = scanned.tokens;
      leftovers = scanned.leftovers;
      unknowns = scanned.unknowns;
    }

    // 残余英文片段：先查词库，再查拼音表（yonghu → 用户），最后当成原样名词
    const restWords = hasCN ? splitWords(leftovers.join(' ')) : splitWords(clean);
    restWords.filter((w) => !/^[\u4e00-\u9fa5]+$/.test(w)).forEach((w) => {
      const lw = lower(w);
      let found = null;
      const roles = ['n', 'v', 'm', 's']; // 名词优先：英文短语多数时候是名词短语
      for (let r = 0; r < roles.length && !found; r++) {
        if (IX[roles[r]][lw]) found = { role: roles[r], e: IX[roles[r]][lw] };
      }
      if (found) { tokens.push(mkToken(found.role, found.e, lw)); return; }

      // 拼音 / 首字母容错
      const py = D.PINYIN[lw];
      if (py) {
        const sub = scanChinese(py);
        if (sub.tokens.length) {
          sub.tokens.forEach((tk) => { tk.pinyin = lw; tk.rawText = lw; tokens.push(tk); });
          return;
        }
      }
      tokens.push({ role: 'n', e: null, word: lw, plural: pluralize(lw), alt: [], raw: lw, isRaw: true });
    });

    return { tokens: tokens, boolHint: boolHint, typeHint: typeHint, hasCN: hasCN, source: String(raw), unknowns: unknowns };
  }

  function mkToken(role, e, rawKey) {
    if (role === 'n') return { role: 'n', e: e, word: e.w, plural: e.p || pluralize(e.w), alt: (e.alt || []).slice(0, 2), raw: rawKey };
    if (role === 'v') return { role: 'v', e: e, word: e.w, alt: (e.alt || []).slice(0, 2), raw: rawKey };
    if (role === 'm') return { role: 'm', e: e, word: e.w, alt: (e.alt || []).slice(0, 1), raw: rawKey };
    return { role: 's', e: e, word: e.w, adj: e.adj || e.w, truthy: e.truthy, alt: [], raw: rawKey };
  }

  /* ---------------------------------------------------------
   * 3. 候选命名生成
   * ------------------------------------------------------- */
  const DEFAULT_CASE = {
    variable: 'camel', function: 'camel', boolean: 'camel', 'class': 'pascal', constant: 'screaming',
    handler: 'camel', hook: 'camel', route: 'kebab', table: 'snake', field: 'snake',
    file: 'kebab', branch: 'kebab', interface: 'pascal', enum: 'pascal', enumMember: 'screaming',
    props: 'pascal', dbIndex: 'snake', redisKey: 'lower', docker: 'kebab', env: 'screaming',
    cli: 'kebab', cssClass: 'kebab', cssVar: 'kebab', test: 'snake', track: 'snake'
  };

  const KIND_LABEL = {
    variable: '变量', function: '函数', boolean: '布尔', 'class': '类', constant: '常量',
    handler: '事件处理', hook: 'Hook', route: '路由', table: '数据表', field: '数据库字段',
    file: '文件名', branch: '分支', interface: '接口 / 类型', enum: '枚举', enumMember: '枚举成员',
    props: 'Props', dbIndex: '数据库索引', redisKey: 'Redis Key', docker: '镜像', env: '环境变量',
    cli: '命令行参数', cssClass: 'CSS 类', cssVar: 'CSS 变量', test: '测试用例', track: '埋点事件'
  };

  // 各语言对风格的覆盖（未列出的沿用 DEFAULT_CASE）
  const LANG_OVERRIDE = {
    ts: {},
    js: {},
    py: { variable: 'snake', function: 'snake', boolean: 'snake', props: 'snake', hook: 'snake', handler: 'snake', route: 'snake', file: 'snake', test: 'snake', field: 'snake' },
    java: { file: 'pascal', test: 'camel' },
    go: { function: 'pascal', constant: 'camel', test: 'snake' },
    cs: { variable: 'pascal', function: 'pascal', boolean: 'pascal', constant: 'pascal', handler: 'pascal', hook: 'pascal', props: 'pascal', test: 'pascal' },
    rust: { variable: 'snake', function: 'snake', boolean: 'snake', handler: 'snake', hook: 'snake', test: 'snake', props: 'pascal' },
    sql: { variable: 'snake', function: 'snake' },
    css: { variable: 'kebab', function: 'kebab' }
  };

  const LANG_NAME = {
    ts: 'TypeScript', js: 'JavaScript', py: 'Python', java: 'Java',
    go: 'Go', cs: 'C#', rust: 'Rust', sql: 'SQL', css: 'CSS'
  };

  function pickTarget(parsed, explicit) {
    if (explicit && explicit !== 'auto') return explicit;
    if (parsed.typeHint) return parsed.typeHint;
    const t = parsed.tokens;
    const has = (r) => t.some((x) => x.role === r);
    if (parsed.boolHint && (has('s') || !has('v'))) return 'boolean';
    if (has('v') && has('n')) return 'function';
    if (has('v')) return 'function';
    if (has('s')) return 'boolean';
    return 'variable';
  }

  function dedupe(list) {
    const seen = {};
    return list.filter((c) => {
      const k = c.name;
      if (seen[k]) return false;
      seen[k] = 1;
      return true;
    });
  }

  function demoteVerbs(tokens) {
    return tokens.map((x) => (x.role === 'v'
      ? { role: 'n', e: x.e, word: x.word, plural: pluralize(x.word), alt: x.alt || [], raw: x.raw }
      : x));
  }

  /**
   * 模糊匹配：一次算出「这句话可能是什么类型」，按置信度排序
   * 用户不该被迫在下拉里做单选题
   */
  function detectTypes(parsed) {
    const t = parsed.tokens;
    const has = (r) => t.some((x) => x.role === r);
    const list = [];
    const push = (tp, w) => { if (list.every((x) => x.type !== tp)) list.push({ type: tp, weight: w }); };

    if (parsed.boolHint) push('boolean', 99);
    if (has('v') && has('n')) push('function', 96);
    else if (has('v')) push('function', 88);

    if (has('n')) {
      push('variable', has('v') ? 76 : 94);
      if (has('v')) push('handler', 58);
      push('class', 66);
      push('interface', 57);
      push('route', has('v') ? 52 : 42);
      push('constant', 50);
      push('table', 46);
      push('props', 38);
      push('field', 34);
    } else if (has('v')) {
      push('handler', 60);
      push('variable', 55);
    }

    // 描述里自带类型词时，直接置顶
    if (parsed.typeHint) {
      const hit = list.filter((x) => x.type === parsed.typeHint)[0];
      if (hit) hit.weight = 100;
      else list.push({ type: parsed.typeHint, weight: 100 });
    }
    return list.sort((a, b) => b.weight - a.weight);
  }

  function buildFor(target, t, lenPref) {
    const mods = t.filter((x) => x.role === 'm');
    const states = t.filter((x) => x.role === 's');

    let rawOut = [];

    switch (target) {
      case 'boolean': rawOut = genBoolean(t, lenPref); break;
      case 'class': rawOut = genClass(t); break;
      case 'constant': rawOut = genConstant(t, mods, lenPref); break;
      case 'handler': rawOut = genHandler(t, states); break;
      case 'hook': rawOut = genHook(t); break;
      case 'route': rawOut = genRoute(t, states); break;
      case 'table': rawOut = genTable(t); break;
      case 'file': rawOut = genFile(t); break;
      case 'branch': rawOut = genBranch(t); break;
      case 'function': rawOut = genFunction(t, lenPref); break;
      case 'interface': rawOut = genAffix(t, '接口 / 类型', [
        ['suffix', 'Props', '组件的 props 类型：一眼看出这是 UI 入参'],
        ['suffix', 'Params', '函数的入参集合'],
        ['suffix', 'Options', '可选配置项'],
        ['suffix', 'Payload', '请求 / 事件负载'],
        ['suffix', 'Result', '返回值结构']
      ], false); break;
      case 'enum': rawOut = genAffix(t, '枚举', [
        ['suffix', 'Status', '状态枚举：最常见的枚举场景'],
        ['suffix', 'Type', '类型枚举'],
        ['suffix', 'Mode', '模式枚举'],
        ['suffix', 'Level', '等级枚举']
      ], false); break;
      case 'enumMember': rawOut = genAffix(t, '枚举成员', [
        ['suffix', 'Active', '成员用「值 + 状态」表达：OrderStatus.Active 读起来像一句话'],
        ['suffix', 'Pending', '待处理状态，和 Active 成对出现'],
        ['prefix', 'Active', '前缀式：同类成员共享后缀也常见']
      ], false); break;
      case 'props': rawOut = genAffix(t, 'Props', [
        ['suffix', 'Props', '组件入参类型，React 社区通用写法'],
        ['suffix', 'PropsWithChildren', '需要插槽 / 子节点时'],
        ['prefix', 'I', 'C# / 老派 TS 风格（现代 TS 不建议）']
      ], false); break;
      case 'field': rawOut = genField(t); break;
      case 'dbIndex': rawOut = genRaw(t, '索引', [
        ['idx_', '_index', 'idx_ + 表名 + 字段：运维一眼看懂作用对象'],
        ['uk_', '_unique', '唯一索引用 uk_ 前缀，和普通索引区分开']
      ]); break;
      case 'redisKey': rawOut = genRedis(t); break;
      case 'docker': rawOut = genRaw(t, '镜像', [
        ['', '_plain', '镜像名只能小写，用中划线分词'],
        ['', '_tag', '显式打 tag，别把 latest 当时尚']
      ]); break;
      case 'env': rawOut = genRaw(t, '环境变量', [
        ['APP_', '_upper', '大写 + 下划线 + 应用前缀，避免与其他服务撞名'],
        ['VITE_', '_vite', 'Vite 只把 VITE_ 前缀暴露给前端']
      ]); break;
      case 'cli': rawOut = genRaw(t, '命令行参数', [
        ['--', '_long', 'POSIX 风格长参数'],
        ['-', '_short', '短参数：取首字母，别滥用']
      ]); break;
      case 'cssClass': rawOut = genRaw(t, 'CSS 类', [
        ['', '_plain', 'kebab-case 是 CSS 的母语'],
        ['', '_bem', 'BEM：block__element，元素名统一用 item 最省心'],
        ['is-', '_status', '状态类：is- 前缀，只叠加不改写']
      ]); break;
      case 'cssVar': rawOut = genRaw(t, 'CSS 变量', [
        ['--', '_var', 'CSS 自定义属性必须双中划线开头'],
        ['--color-', '_color', '带语义分组前缀，主题切换时更好管']
      ]); break;
      case 'test': rawOut = genTest(t); break;
      case 'track': rawOut = genRaw(t, '埋点事件', [
        ['', '_click', '事件名以动作收尾：用户做了什么一眼可知'],
        ['evt_', '_prefix', '统一前缀，方便数据侧批量过滤']
      ]); break;
      default: rawOut = genVariable(t, lenPref); break;
    }
    return rawOut;
  }

  function generate(raw, type, casePref, lenPref, lang) {
    return generateFromParsed(tokenize(raw), type, casePref, lenPref, lang);
  }

  /**
   * 从已解析的 token 直接生成 —— 解析面板改词后走这条路径，不必重新分词
   */
  // 语序规范化：动词前置、集合类名词殿后（"列表 用户 获取" → get + user + list）
  const COLLECTION_LIKE = ['list', 'lists', 'items', 'count', 'counts', 'total', 'collection',
    'array', 'set', 'detail', 'details', 'result', 'summary', 'metric', 'stat', 'logEntry'];

  function normalizeOrder(tokens) {
    const verbs = tokens.filter((x) => x.role === 'v');
    const mods = tokens.filter((x) => x.role === 'm');
    const states = tokens.filter((x) => x.role === 's');
    const nouns = tokens.filter((x) => x.role === 'n').slice().sort((a, b) => {
      const pa = COLLECTION_LIKE.indexOf(a.word) !== -1 ? 1 : 0;
      const pb = COLLECTION_LIKE.indexOf(b.word) !== -1 ? 1 : 0;
      return pa - pb; // 稳定排序：同类保持原始语序
    });
    if (!verbs.length) return mods.concat(nouns, states);
    return [verbs[0]].concat(verbs.slice(1), mods, nouns, states);
  }

  function generateFromParsed(input, type, casePref, lenPref, lang) {
    // 拷贝一份，避免降级逻辑污染解析面板持有的 tokens
    const parsed = {
      tokens: input.tokens.slice(),
      boolHint: input.boolHint,
      typeHint: input.typeHint,
      hasCN: input.hasCN,
      source: input.source
    };

    // 没有任何实体名词时（例如「max retry count」），动词整体降级为名词，按名词短语处理
    if (!parsed.tokens.some((x) => x.role === 'n') && parsed.tokens.some((x) => x.role === 'v')) {
      parsed.tokens = demoteVerbs(parsed.tokens);
      if (!parsed.typeHint) parsed.typeHint = 'variable';
    } else {
      // 动词前面挂着修饰词（max retry count / 最新的用户需求），整体更像名词短语
      const firstV = parsed.tokens.findIndex((x) => x.role === 'v');
      if (firstV > 0 && parsed.tokens.slice(0, firstV).some((x) => x.role === 'm') && !parsed.typeHint) {
        parsed.tokens = demoteVerbs(parsed.tokens);
        parsed.typeHint = 'variable';
      }
    }

    const t = normalizeOrder(parsed.tokens);
    const langOverride = LANG_OVERRIDE[lang] || {};
    const auto = (!type || type === 'auto');
    const styleOf = (tp) => (casePref === 'auto'
      ? (langOverride[tp] || DEFAULT_CASE[tp] || 'camel')
      : casePref);

    if (!t.length) {
      return { target: auto ? 'variable' : type, style: 'camel', lang: lang || 'auto', types: [], multi: false, list: [], parsed: parsed, tokens: t };
    }

    const picked = auto ? detectTypes(parsed).slice(0, 5) : [{ type: type, weight: 100 }];
    const primary = picked[0].type;

    const pool = [];
    picked.forEach((item, gi) => {
      const st = styleOf(item.type);
      const out = buildFor(item.type, t, lenPref);
      const take = gi === 0 ? 8 : 3; // 主类型给足候选，其余类型各来三个「备选理解」
      out.slice(0, take).forEach((p, idx) => {
        const isRaw = p.name !== undefined && p.name !== null;
        let nm = isRaw ? p.name : applyCase(p.words, st);
        if (item.type === 'hook') nm = nm.replace(/^Use/, 'use');
        if (!nm) return;
        const sc = scoreName(nm, isRaw ? 'raw' : st);
        // 含未确认词的候选：降权并说明，避免它挤掉干净的方案
        const hasTodo = /custom\d+/i.test(nm);
        pool.push({
          name: nm,
          kind: item.type,
          why: hasTodo ? p.why + '（含待补词，补上英文更准）' : p.why,
          tag: p.tag || KIND_LABEL[item.type],
          extra: p.extra || '',
          score: hasTodo ? Math.max(0, sc.score - 10) : sc.score,
          stars: stars(sc.score),
          prio: gi * 100 + idx
        });
      });
    });

    let list = dedupe(pool);
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.prio !== b.prio) return a.prio - b.prio;
      const la = a.name.length, lb = b.name.length;
      if (lenPref === 'terse') return la - lb;
      if (lenPref === 'verbose') return lb - la;
      return Math.abs(la - 14) - Math.abs(lb - 14);
    });

    return {
      target: primary,
      style: styleOf(primary),
      lang: lang || 'auto',
      types: picked.map((x) => x.type),
      typeMeta: picked.map((x) => ({ type: x.type, weight: x.weight })),
      multi: auto && picked.length > 1,
      list: list,
      parsed: parsed,
      tokens: t
    };
  }

  function nounPhrase(nouns, mods, plural) {
    if (!nouns.length) return [];
    const words = mods.map((m) => m.word);
    nouns.forEach((n, i) => {
      const last = i === nouns.length - 1;
      words.push(last && plural ? (n.plural || pluralize(n.word)) : n.word);
    });
    return words;
  }

  /* ---- 通用生成器：前后缀 / 原生格式 ---- */
  function genAffix(t, label, affixes, allowPlural) {
    const nouns = t.filter((x) => x.role === 'n');
    const mods = t.filter((x) => x.role === 'm');
    const base = nounPhrase(nouns, mods, false);
    const basePlural = nounPhrase(nouns, mods, true);
    const out = [];
    if (!base.length) return out;
    affixes.forEach((a) => {
      const words = a[0] === 'suffix' ? base.concat([a[1]]) : [a[1]].concat(base);
      out.push({ words: words, why: a[2], tag: label });
    });
    if (allowPlural !== false) {
      out.push({ words: basePlural, why: '复数主体：明确这是一个集合类型', tag: label });
    }
    out.push({ words: base, why: '不加任何后缀：上下文足够明确时最干净', tag: label });
    return out;
  }

  /**
   * 生成原生格式的名字（不走 applyCase）
   * variants: [prefix, mode, why]
   */
  function genRaw(t, label, variants) {
    const nouns = t.filter((x) => x.role === 'n');
    const mods = t.filter((x) => x.role === 'm');
    const words = nounPhrase(nouns, mods, false);
    const wordsP = nounPhrase(nouns, mods, true);
    if (!words.length) return [];
    const out = [];
    variants.forEach((v) => {
      const prefix = v[0], mode = v[1], why = v[2];
      let name = '';
      switch (mode) {
        case '_plain': name = CASER.kebab(words); break;
        case '_plainUpper': name = CASER.screaming(words); break;
        case '_upper': name = prefix + CASER.screaming(words); break;
        case '_state': name = CASER.screaming(words); break;
        case '_tag': name = CASER.kebab(words) + ':latest'; break;
        case '_index': name = prefix + words.map(lower).join('_'); break;
        case '_unique': name = prefix + words.map(lower).join('_'); break;
        case '_long': name = '--' + CASER.kebab(words); break;
        case '_short': name = '-' + lower(words[0]).charAt(0); break;
        case '_bem': name = CASER.kebab(words) + '__item'; break;
        case '_status': name = prefix + CASER.kebab(words) + '-active'; break;
        case '_var': name = prefix + CASER.kebab(words); break;
        case '_color': name = prefix + CASER.kebab(words); break;
        case '_click': name = words.map(lower).join('_') + '_click'; break;
        case '_prefix': name = prefix + words.map(lower).join('_'); break;
        case '_vite': name = prefix + CASER.screaming(words); break;
        default: name = CASER.kebab(words);
      }
      if (name) out.push({ name: name, why: why, tag: label });
    });
    return out;
  }

  function genField(t) {
    const words = nounPhrase(t.filter((x) => x.role === 'n'), t.filter((x) => x.role === 'm'), false);
    if (!words.length) return [];
    const segs = words.map(lower);
    const out = [
      { name: segs.join('_'), why: 'snake_case 字段名，与表名保持同一风格', tag: '字段' },
      { name: segs.join('_') + '_at', why: '_at 后缀：时间点字段的通用约定', tag: '字段' },
      { name: 'is_' + segs.join('_'), why: 'is_ 前缀：布尔字段一眼识别', tag: '字段' }
    ];
    out.push({ name: lower(segs[segs.length - 1]) + '_id', why: '外键统一用「表名单数_id」，join 时不用查文档', tag: '字段' });
    return out;
  }

  function genRedis(t) {
    const words = nounPhrase(t.filter((x) => x.role === 'n'), t.filter((x) => x.role === 'm'), false);
    if (!words.length) return [];
    const segs = words.map(lower);
    return [
      { name: 'app:' + segs.join(':'), why: '冒号分层：业务:实体:id，SCAN 时天然可分组', tag: 'Redis Key' },
      { name: 'app:' + segs.join(':') + ':{id}', why: '用占位符标出变量段，读代码时不用猜', tag: 'Redis Key' },
      { name: 'app:' + segs.join(':') + ':list', why: '后缀标明数据结构，排查内存占用时省事', tag: 'Redis Key' }
    ];
  }

  function genTest(t) {
    const words = nounPhrase(t.filter((x) => x.role === 'n'), t.filter((x) => x.role === 'm'), false);
    if (!words.length) return [];
    const phrase = words.map(lower).join(' ');
    return [
      { name: 'should handle ' + phrase + ' correctly', why: '行为描述式：测试名本身就是一份可执行的规格', tag: '测试' },
      { name: 'should throw when ' + phrase + ' is empty', why: '边界场景：把异常路径也写进测试名', tag: '边界测试' },
      { name: 'test_' + words.map(lower).join('_'), why: 'pytest 风格：test_ 前缀 + 行为描述', tag: '测试' },
      { name: words.map(cap).join('') + 'Test', why: 'JUnit 风格：被测对象 + Test', tag: '测试' }
    ];
  }

  function genVariable(t, lenPref) {
    const nouns = t.filter((x) => x.role === 'n');
    const mods = t.filter((x) => x.role === 'm');
    const states = t.filter((x) => x.role === 's');
    const out = [];
    const push = (words, why, tag) => { if (words && words.length) out.push({ words: words, why: why, tag: tag || '变量' }); };

    if (nouns.length) {
      const core = nouns[nouns.length - 1];
      const quals = nouns.slice(0, -1);
      const build = (q, m, pluralLast) => {
        const w = [];
        (m || []).forEach((x) => w.push(x.word));
        (q || []).forEach((x) => w.push(x.word));
        w.push(pluralLast ? (core.plural || pluralize(core.word)) : core.word);
        return w;
      };

      push(build(quals, mods, false), describes(nouns, mods, false));
      push(build(quals, mods, true), '复数形态：暗示这是一个集合或列表');
      if (mods.length) push(build(quals, [], false), '省略修饰词，上下文足够时更清爽');
      if (quals.length) push(build(quals.slice(-1), mods, false), '只保留最近的一层限定语');
      (core.alt || []).slice(0, 2).forEach((a) => {
        push(build(quals, mods, false).slice(0, -1).concat([a]), '核心词换成同义词 ' + a);
      });
      if (quals.length) {
        (quals[0].alt || []).slice(0, 1).forEach((a) => {
          push(build([{ word: a }].concat(quals.slice(1)), mods, false), '限定语同义替换，' + a + ' 更地道');
        });
      }
      if (states.length) push([states[0].word].concat(build(quals, mods, false)), '状态词 + 主体，读起来像一句断言');
      if (lenPref === 'terse') push([core.word], '极简版：上下文足够时最短即可');
      if (lenPref === 'verbose') push(build(quals, mods, false).concat(['value']), '宁长不模糊：把语义写全');
    }
    return out;
  }

  function describes(nouns, mods, isPlural) {
    const core = nouns[nouns.length - 1];
    const parts = [];
    if (mods.length) parts.push('修饰词 ' + mods.map((m) => m.word).join('/'));
    if (nouns.length > 1) parts.push('限定语 ' + nouns.slice(0, -1).map((n) => n.word).join('/'));
    if (core) parts.push('主体 ' + (isPlural ? core.plural || pluralize(core.word) : core.word));
    return parts.length ? parts.join(' + ') : '按语义直译';
  }

  function verbWhy(word, base) {
    const h = D.VERB_HINTS[word];
    return base + (h ? '；' + word + ' 侧重「' + h + '」' : '');
  }

  function genFunction(t, lenPref) {
    const verbs = t.filter((x) => x.role === 'v');
    const nouns = t.filter((x) => x.role === 'n');
    const mods = t.filter((x) => x.role === 'm');
    const out = [];
    if (!verbs.length) return genVariable(t, lenPref);
    const v = verbs[0];

    // 无宾语时，把多余的动词降级为宾语（"max retry count" → retryCount）
    let objNouns = nouns;
    if (!objNouns.length && verbs.length > 1) {
      objNouns = verbs.slice(1).map((x) => ({ role: 'n', word: x.word, plural: pluralize(x.word), alt: x.alt || [] }));
    }

    const objSing = nounPhrase(objNouns, mods, false);
    const objPlur = nounPhrase(objNouns, mods, true);

    const push = (words, why) => out.push({ words: words, why: why, tag: '函数' });

    if (objSing.length) {
      push([v.word].concat(objSing), verbWhy(v.word, '动词 + 宾语，最标准的动宾结构'));
      push([v.word].concat(objPlur), verbWhy(v.word, '宾语用复数，暗示批量或集合'));
    } else {
      push([v.word], verbWhy(v.word, '纯动作动词，无宾语时使用'));
    }
    (v.alt || []).slice(0, 3).forEach((altV) => {
      if (objSing.length) push([altV].concat(objSing), '换成 ' + altV + '：' + (D.VERB_HINTS[altV] || '语气略有差别'));
      if (objPlur.length) push([altV].concat(objPlur), '换成 ' + altV + ' + 复数宾语，批量场景');
    });
    if (lenPref !== 'terse' && objSing.length) {
      push([v.word].concat(objSing, ['result']), '把返回值语义写进名字（冗长版）');
    }
    if (lenPref === 'terse' && objSing.length > 1 && objNouns.length) {
      push([v.word, objNouns[objNouns.length - 1].word], '精简版：只留核心宾语');
    }
    if (mods.length && objNouns.length) {
      push([v.word].concat(objNouns.map((n) => n.word)), '去掉修饰词，把范围收敛到核心');
    }
    if (objNouns.length) {
      const core = objNouns[objNouns.length - 1];
      (core.alt || []).slice(0, 1).forEach((a) => {
        push([v.word].concat(objSing.slice(0, -1), [a]), '宾语换同义词 ' + a);
      });
    }
    return out;
  }

  function genBoolean(t) {
    const BOOL_HINT = {
      is: '判断「是不是」，适合状态与身份',
      has: '判断「有没有」，适合拥有关系',
      should: '判断「该不该」，适合业务规则',
      can: '判断「能不能」，适合权限与能力'
    };
    const nouns = t.filter((x) => x.role === 'n');
    const states = t.filter((x) => x.role === 's');
    const mods = t.filter((x) => x.role === 'm');
    const out = [];
    const prefixes = ['is', 'has', 'should', 'can'];
    const baseNoun = nounPhrase(nouns, mods, false);
    const st = states[0];
    const push = (words, why) => out.push({ words: words, why: why, tag: '布尔' });

    if (st) {
      const adj = st.adj || st.word;
      push(['is'].concat([adj]), 'is + 形容词：最地道的布尔命名；' + BOOL_HINT.is);
      push(['is'].concat([st.word]), 'is + 状态词：直接可读');
      if (baseNoun.length) {
        push(['is'].concat(baseNoun, [cap(adj)]), '主体写全，避免上下文依赖');
        push(['has'].concat(baseNoun, [cap(st.word)]), 'has + 主体 + 过去分词：强调「是否已发生」');
      }
      if (st.truthy === false) {
        push(['is', 'not'].concat([cap(adj)]), '反向表达有时比 wasFailed 更清楚');
      }
    } else if (baseNoun.length) {
      prefixes.slice(0, 4).forEach((p) => {
        push([p].concat(baseNoun), BOOL_HINT[p]);
      });
      const pn = baseNoun.slice(0, -1).concat([pluralize(baseNoun[baseNoun.length - 1])]);
      push(['has'].concat(pn), '是否包含多个成员');
    } else {
      push(['is', 'ready'], '实在没解析出来，先给个占位');
    }
    return out;
  }

  function genClass(t) {
    const nouns = t.filter((x) => x.role === 'n');
    const mods = t.filter((x) => x.role === 'm');
    const out = [];
    const base = nounPhrase(nouns, mods, false);
    const core = cap(base[base.length - 1] || 'entity');
    const full = base.map(cap);
    const picks = D.CLASS_SUFFIX.slice(0, 4);
    picks.forEach((p) => {
      out.push({ words: full.concat([p.s]), why: p.s + '：' + p.hint, tag: '类' });
    });
    if (full.length) out.push({ words: full, why: '纯名词作为类名，不暴露实现细节', tag: '类' });
    out.push({ words: [core].concat(['Factory']), why: 'Factory：负责创建实例', tag: '类' });
    return out;
  }

  function genConstant(t, mods, lenPref) {
    const nouns = t.filter((x) => x.role === 'n');
    const states = t.filter((x) => x.role === 's');
    const out = [];
    const base = nounPhrase(nouns, mods, false);
    if (base.length) {
      out.push({ words: base, why: '名词短语直接全大写', tag: '常量' });
      out.push({ words: ['default'].concat(base), why: 'default 前缀：默认值场景', tag: '常量' });
      out.push({ words: ['max'].concat(base), why: 'max 前缀：上限场景', tag: '常量' });
      if (states.length) {
        out.push({ words: base.concat([states[0].truthy === false ? 'failed' : states[0].adj || states[0].word]), why: '状态 + 主体，表达配置分支', tag: '常量' });
      }
      out.push({ words: base.concat(['limit']), why: '带上限定词，说明这是边界值', tag: '常量' });
    }
    return out;
  }

  function genHandler(t, states) {
    const nouns = t.filter((x) => x.role === 'n');
    const verbs = t.filter((x) => x.role === 'v');
    const out = [];
    const base = nounPhrase(nouns, [], false).map(cap);
    const act = verbs.length ? cap(verbs[0].word) : 'Change';
    if (base.length) {
      out.push({ words: ['handle'].concat(base, [act]), why: 'handle + 主体 + 动作：事件的自我说明', tag: '处理函数' });
      out.push({ words: ['on'].concat(base, [act]), why: 'on 前缀：作为 props 传递的回调', tag: '回调 props' });
      if (states.length) {
        out.push({ words: ['on'].concat(base, [cap(states[0].adj || states[0].word)]), why: '事件 + 结果状态', tag: '回调 props' });
      }
      out.push({ words: ['handle'].concat([act]), why: '简版：上下文已明确主体时', tag: '处理函数' });
    } else {
      out.push({ words: ['handle', act], why: '只有动作，没有主体', tag: '处理函数' });
    }
    return out;
  }

  function genHook(t) {
    const nouns = t.filter((x) => x.role === 'n');
    const verbs = t.filter((x) => x.role === 'v');
    const out = [];
    const base = nounPhrase(nouns, [], false).map(cap);
    const v = verbs[0] ? cap(verbs[0].word) : null;
    if (base.length) {
      out.push({ words: ['use'].concat(base), why: 'use + 资源：Hook 的标准形态', tag: 'Hook' });
      if (v) out.push({ words: ['use'].concat(base, [v]), why: '把动作写进去，语义更完整', tag: 'Hook' });
      out.push({ words: ['use'].concat(base, ['State']), why: 'State 后缀：纯状态 Hook', tag: 'Hook' });
      out.push({ words: ['use'].concat(base, ['Query']), why: 'Query 后缀：取数类 Hook', tag: 'Hook' });
    }
    return out;
  }

  const HTTP_MAP = {
    create: 'POST', add: 'POST', insert: 'POST', send: 'POST', submit: 'POST', register: 'POST', upload: 'POST',
    delete: 'DELETE', remove: 'DELETE', clear: 'DELETE',
    update: 'PUT', modify: 'PATCH', edit: 'PATCH', toggle: 'PATCH'
  };

  function genRoute(t) {
    const nouns = t.filter((x) => x.role === 'n');
    const verbs = t.filter((x) => x.role === 'v');
    const out = [];
    const segs = nouns.map((n) => lower(n.word)).filter(Boolean);
    if (!segs.length) return out;
    const last = segs[segs.length - 1];
    const parents = segs.slice(0, -1);
    const pl = pluralize(last);
    const parentPath = parents.length
      ? '/' + parents.map((s) => pluralize(s)).join('/') + '/{' + parents[parents.length - 1] + 'Id}'
      : '';
    const full = parentPath ? parentPath + '/' + pl : '/' + pl;

    out.push({ words: [], name: 'GET ' + full, why: parentPath ? '嵌套资源：把从属关系写进路径，语义最完整' : 'REST 集合资源，复数形式是共识', tag: 'GET', extra: '列表' });
    out.push({ words: [], name: 'GET ' + full + '/{' + last + 'Id}', why: '单个资源用 {id} 路径参数', tag: 'GET', extra: '详情' });
    if (parentPath) {
      out.push({ words: [], name: 'GET /' + pl + '?' + parents[parents.length - 1] + 'Id={' + parents[parents.length - 1] + 'Id}', why: '平铺 + 查询参数：跨层筛选时更灵活', tag: 'GET', extra: '筛选' });
    }
    const v = verbs[0];
    if (v) {
      const m = HTTP_MAP[v.word] || 'POST';
      out.push({ words: [], name: m + ' ' + full, why: '写操作用对应 HTTP 方法，动词不进 URL', tag: m, extra: '写操作' });
      out.push({ words: [], name: m + ' /' + pl + '/{' + last + 'Id}/' + lower(v.word), why: '子动作确实是 RPC 语义时才把动词放进路径', tag: m, extra: '动作' });
    }
    return out;
  }

  function genTable(t) {
    const nouns = t.filter((x) => x.role === 'n');
    const mods = t.filter((x) => x.role === 'm');
    const out = [];
    const segs = nouns.map((n) => lower(n.word));
    const modWords = mods.map((m) => lower(m.word));
    if (!segs.length) return out;
    const core = pluralize(segs[segs.length - 1]);
    out.push({ words: modWords.concat(segs.slice(0, -1), [core]), why: '表名用复数 snake_case，主流 ORM 默认约定', tag: '数据表' });
    out.push({ words: segs.slice(0, -1).concat([core]), why: '只保留实体层级', tag: '数据表' });
    if (segs.length > 1) {
      out.push({ words: [segs[0] + '_' + core].concat(modWords), why: '前缀式：同一库内的模块分组', tag: '数据表' });
    }
    out.push({ words: segs.concat(['id']).map(lower), why: '字段命名参考：主键统一用 id', tag: '字段' });
    return out;
  }

  function genFile(t) {
    const nouns = t.filter((x) => x.role === 'n');
    const verbs = t.filter((x) => x.role === 'v');
    const out = [];
    const base = nounPhrase(nouns, [], false).map(lower);
    if (!base.length) return out;
    const kebab = base.join('-');
    out.push({ words: [], name: kebab + '.ts', why: '工具/模块文件：kebab-case + .ts', tag: '文件' });
    out.push({ words: [], name: kebab + '.tsx', why: 'React 组件：kebab-case + .tsx', tag: '文件' });
    out.push({ words: [], name: kebab + '.module.css', why: '样式模块', tag: '文件' });
    if (verbs.length) out.push({ words: [], name: base.map(cap).join('') + '.tsx', why: '组件文件也可与组件同名（PascalCase）', tag: '文件' });
    return out;
  }

  function genBranch(t) {
    const nouns = t.filter((x) => x.role === 'n');
    const verbs = t.filter((x) => x.role === 'v');
    const out = [];
    const desc = nounPhrase(nouns, [], false).map(lower).join('-') || 'update';
    const v = verbs[0] ? verbs[0].word : '';
    let type = 'feat';
    if (['fix', 'delete', 'remove', 'clear'].indexOf(v) !== -1) type = v === 'fix' ? 'fix' : 'chore';
    if (['update', 'modify', 'edit', 'patch'].indexOf(v) !== -1) type = 'refactor';
    if (['test'].indexOf(v) !== -1) type = 'test';
    if (v === 'format' || v === 'style') type = 'style';
    if (v === 'build' || v === 'compile') type = 'build';
    out.push({ words: [], name: type + '/' + desc, why: 'type/短描述，最主流的分支约定', tag: 'Git 分支' });
    out.push({ words: [], name: 'feature/' + desc, why: '另一种写法：完整单词前缀', tag: 'Git 分支' });
    if (nouns.length) out.push({ words: [], name: type + '/' + lower(nouns[nouns.length - 1].word), why: '极简版：只留核心词', tag: 'Git 分支' });
    return out;
  }

  /* ---------------------------------------------------------
   * 4. 命名打分
   * ------------------------------------------------------- */
  const KNOWN = (function () {
    const set = {};
    const addRole = (dict) => dict.forEach((e) => {
      [e.w].concat(e.alt || []).concat([e.p, e.adj]).filter(Boolean).forEach((w) => { set[lower(w)] = 1; });
    });
    addRole(D.VERBS); addRole(D.NOUNS); addRole(D.MODS); addRole(D.STATES);
    ['id', 'url', 'api', 'http', 'https', 'json', 'uuid', 'ui', 'db', 'key', 'value', 'state', 'props',
      'index', 'count', 'total', 'list', 'items', 'params', 'args', 'callback', 'event', 'error', 'err',
      'name', 'type', 'code', 'time', 'date', 'day', 'result', 'res', 'req', 'item', 'node', 'tree',
      'input', 'output', 'current', 'prev', 'next', 'default', 'max', 'min', 'sum', 'avg', 'to', 'by',
      'use', 'handle', 'on', 'get', 'set', 'is', 'has', 'can', 'should', 'will', 'did', 'not', 'and', 'or',
      'profile', 'settings', 'options', 'detail', 'details', 'info', 'meta', 'payload', 'context', 'ctx',
      'filter', 'sort', 'page', 'size', 'offset', 'limit', 'token', 'session', 'cache', 'store', 'value',
      'enable', 'disable', 'visible', 'hidden', 'ready', 'loading', 'pending', 'success', 'successful',
      'work', 'line', 'entry', 'base', 'core', 'main', 'sub', 'pre', 'post', 'auto', 'custom', 'quick',
      'big', 'small', 'long', 'short', 'high', 'low', 'new', 'first', 'last', 'next', 'prev', 'top',
      'bottom', 'left', 'right', 'inner', 'outer', 'show', 'hide', 'open', 'close', 'edit', 'save',
      'group', 'role', 'rule', 'flow', 'step', 'node', 'tree', 'map', 'set', 'tag', 'note', 'path',
      'link', 'uri', 'app', 'web', 'mode', 'level', 'rate', 'page', 'size', 'num', 'str', 'group',
      'batch', 'single', 'multi', 'custom1', 'custom2', 'custom3',
      'medical', 'financial', 'physical', 'social', 'digital', 'virtual', 'mobile', 'desktop',
      'server', 'client', 'master', 'primary', 'secondary', 'internal', 'external', 'detail'
    ].forEach((w) => { set[w] = 1; });
    Object.keys(D.ABBR).forEach((w) => { set[w] = 1; });
    return set;
  })();

  function detectStyle(name) {
    if (/^[a-z][a-zA-Z0-9]*$/.test(name)) return /[A-Z]/.test(name) ? 'camel' : 'lower';
    if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) return 'pascal';
    if (/^[A-Z][A-Z0-9_]*$/.test(name)) return 'screaming';
    if (/^[a-z][a-z0-9_]*$/.test(name)) return 'snake';
    if (/^[a-z][a-z0-9-]*$/.test(name)) return 'kebab';
    return 'mixed';
  }

  function scoreName(name, style) {
    let score = 100;
    const issues = [];
    const words = splitWords(name).map(lower);
    const st = style || detectStyle(name);
    // 路由 / 文件名 / CSS 变量 / Redis Key / 测试名等非标识符走宽松检查
    const isPath = /[\/.]/.test(name) || st === 'raw' || /^--/.test(name) || name.indexOf(':') !== -1;

    if (/[\u4e00-\u9fa5]/.test(name)) { score -= 35; issues.push('混入了中文：跨团队协作时这会变成坑'); }
    if (name.length <= 2) { score -= 28; issues.push('太短了，三个月后连你自己都认不出来'); }
    else if (name.length > 32) { score -= 14; issues.push('超过 32 字符，写测试的时候你会恨它'); }

    if (st !== 'raw' && !isPath) {
      words.forEach((w) => {
        const hit = D.SMELL.filter((s) => s.w === w)[0];
        if (hit) { score -= 16; issues.push(hit.why + '（建议：' + hit.tip + '）'); }
      });
    }

    if (/\d+$/.test(name)) { score -= 12; issues.push('数字后缀：命名已经放弃治疗的经典标志'); }
    if (/^\d/.test(name)) { score -= 25; issues.push('以数字开头，大多数语言不允许'); }

    if (!isPath) {
      if ((st === 'camel' || st === 'pascal' || st === 'lower') && /[_-]/.test(name)) { score -= 20; issues.push('大小写风格里混用了下划线或中划线'); }
      if (st === 'snake' && /[A-Z]/.test(name)) { score -= 15; issues.push('snake_case 里出现了大写字母'); }
      if (st === 'snake' && /-/.test(name)) { score -= 12; issues.push('混入了中划线，请统一用下划线'); }
      if (st === 'kebab' && /[A-Z]/.test(name)) { score -= 15; issues.push('kebab-case 里出现了大写字母'); }
      if (st === 'kebab' && /_/.test(name)) { score -= 12; issues.push('混入了下划线，请统一用中划线'); }
      if (st === 'screaming' && /[a-z]/.test(name.replace(/[^a-zA-Z]/g, ''))) { score -= 12; issues.push('常量请全部大写'); }
      if (st === 'camel' && /^[A-Z]/.test(name)) { score -= 12; issues.push('camelCase 的首字母应当小写'); }
      if (st === 'pascal' && /^[a-z]/.test(name)) { score -= 10; issues.push('PascalCase 的首字母应当大写'); }
      if (st === 'mixed') { score -= 18; issues.push('风格不统一：挑一种命名法并贯彻到底'); }
    }

    if (words.length === 1 && words[0].length <= 2) { score -= 16; issues.push('单字词信息量不足'); }
    if (words.length >= 6) { score -= 8; issues.push('六个单词以上，考虑拆一拆'); }

    const dup = {};
    words.forEach((w) => { dup[w] = (dup[w] || 0) + 1; });
    Object.keys(dup).forEach((w) => {
      if (dup[w] > 1) { score -= 12; issues.push('「' + w + '」重复出现了一次以上'); }
    });

    if (st !== 'raw') {
      words.forEach((w) => {
        const isSmell = D.SMELL.some((s) => s.w === w);
        if (D.ABBR[w] && w.length <= 5) { score -= 5; issues.push('缩写 ' + w + ' 建议展开为 ' + D.ABBR[w]); }
        // 只对较长的陌生词提示：camelCase 拆出来的短碎片（work / line）不该被扣分
        else if (!isSmell && !KNOWN[w] && w.length >= 5) { score -= 3; issues.push('「' + w + '」不是常见词，确认一下拼写'); }
      });
    }

    score = Math.max(0, Math.min(100, score));
    return { score: score, issues: uniq(issues), style: st };
  }

  function stars(score) {
    const n = score >= 92 ? 5 : score >= 84 ? 4 : score >= 72 ? 3 : score >= 60 ? 2 : 1;
    return n;
  }

  function fixSuggestion(name) {
    const words = splitWords(name).map(lower);
    const out = [];
    words.forEach((w) => {
      if (D.ABBR[w]) out.push(D.ABBR[w]);
      else {
        const smell = D.SMELL.filter((s) => s.w === w)[0];
        out.push(smell ? null : w);
      }
    });
    const cleaned = out.filter(Boolean);
    return cleaned.length ? cleaned : ['value'];
  }

  /* ---------------------------------------------------------
   * 5. 渲染：生成结果
   * ------------------------------------------------------- */
  let LAST_RESULT = null;

  let RES_FILTER = 'all';
  let RES_PAGE = 0;
  let CURRENT_PARSED = null;
  let CURRENT_QUERY = '';
  let LAST_SIG = '';
  const PAGE_SIZE = 13;

  function filteredItems(res) {
    return RES_FILTER === 'all' ? res.list : res.list.filter((c) => c.kind === RES_FILTER);
  }

  function renderCards(res) {
    const grid = $('#resGrid');
    const items = filteredItems(res);
    const total = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    if (RES_PAGE >= total) RES_PAGE = 0;
    const pageItems = items.slice(RES_PAGE * PAGE_SIZE, (RES_PAGE + 1) * PAGE_SIZE);

    grid.innerHTML = '';
    pageItems.forEach((c, i) => {
      const el = document.createElement('div');
      const isMain = c.kind === res.target;
      el.className = 'res-card' + (i === 0 && RES_PAGE === 0 && RES_FILTER === 'all' ? ' best' : '');
      el.style.animationDelay = (Math.min(i, 10) * 34) + 'ms';
      const tags = '<span class="tag' + (isMain ? '' : ' n') + '">' + escapeHtml(c.tag) + '</span>' +
        (c.extra ? '<span class="tag a">' + escapeHtml(c.extra) + '</span>' : '') +
        '<span class="tag n">' + c.name.length + ' 字符</span>';
      el.innerHTML =
        '<h4 class="res-name' + (c.name.length > 19 ? ' name-sm' : '') + '">' + escapeHtml(c.name) + '</h4>' +
        '<div class="res-meta">' + tags + '<span class="stars">' + starStr(c.stars) + '</span></div>' +
        '<p class="res-why">' + escapeHtml(c.why) + '</p>' +
        '<button class="copy-btn" data-copy="' + escapeAttr(c.name) + '" title="复制">' + COPY_ICON + '</button>';
      grid.appendChild(el);
    });

    $('#batchInfo').textContent = total > 1 ? ' ' + (RES_PAGE + 1) + '/' + total : '';
    $('#btnBatch').style.display = total > 1 ? '' : 'none';
    $('#resCount').textContent = items.length + ' 个候选' +
      (RES_FILTER === 'all' ? '' : '（' + KIND_LABEL[RES_FILTER] + '）') +
      ' · ' + (res.multi ? '模糊匹配 ' + res.types.length + ' 类' : KIND_LABEL[res.target]) + ' · ' + res.style;
  }

  function renderKindFilter(res) {
    const box = $('#kindFilter');
    box.innerHTML = '';
    if (!res.multi || res.types.length < 2) { box.style.display = 'none'; return; }
    box.style.display = 'flex';

    const mk = (label, key, count, on) => {
      const b = document.createElement('button');
      b.className = 'chip' + (on ? ' on' : '');
      b.textContent = label + ' · ' + count;
      b.addEventListener('click', () => {
        RES_FILTER = key;
        RES_PAGE = 0;
        $$('#kindFilter .chip').forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
        renderCards(res);
      });
      box.appendChild(b);
    };
    mk('全部理解', 'all', res.list.length, RES_FILTER === 'all');
    (res.typeMeta || []).forEach((meta) => {
      const n = res.list.filter((c) => c.kind === meta.type).length;
      if (n) mk(KIND_LABEL[meta.type] + ' ' + meta.weight + '%', meta.type, n, RES_FILTER === meta.type);
    });
  }

  /* ---- 语义解析面板：看得见理解结果，也改得动 ---- */
  function renderParse() {
    const box = $('#parseBox');
    const tokens = (CURRENT_PARSED && CURRENT_PARSED.tokens) || [];
    if (!tokens.length) { box.style.display = 'none'; return; }
    box.style.display = '';

    const chips = $('#parseChips');
    chips.innerHTML = '';
    tokens.forEach((tk, idx) => {
      // 词库外的词：给一个输入框，补上英文就记住（下次自动识别）
      if (tk.unknownWord) {
        const wrap = document.createElement('span');
        wrap.className = 'tk tk-todo';
        wrap.innerHTML = '<span class="tk-src">' + escapeHtml(tk.cnText || tk.raw) + '</span>' +
          '<span class="tk-arrow">→</span>' +
          '<input class="tk-input" maxlength="24" placeholder="补英文" value="' + escapeAttr(tk.mappedWord || '') + '">' +
          '<span class="tk-del" title="忽略这个词">×</span>';
        const input = wrap.querySelector('.tk-input');
        const commit = () => {
          const v = input.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!v) return;
          tk.word = v;
          tk.plural = pluralize(v);
          tk.unknownWord = false;
          tk.mappedWord = v;
          LEXICON[tk.cnText || tk.raw] = v;
          saveLexicon();
          invalidatePairs();
          refreshFromParsed();
          toast('已记住：' + (tk.cnText || tk.raw) + ' → ' + v);
        };
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
        });
        input.addEventListener('blur', commit);
        wrap.querySelector('.tk-del').addEventListener('click', (e) => {
          e.stopPropagation();
          CURRENT_PARSED.tokens.splice(idx, 1);
          refreshFromParsed();
        });
        chips.appendChild(wrap);
        return;
      }

      const unknown = tk.role === 'n' && !tk.e;
      const el = document.createElement('span');
      el.className = 'tk' + (tk.typo ? ' tk-typo' : '') + (tk.pinyin ? ' tk-py' : '') + (unknown ? ' tk-unknown' : '');
      const src = tk.rawText || tk.raw || tk.word;
      el.innerHTML =
        '<span class="tk-src">' + escapeHtml(src) + '</span>' +
        '<span class="tk-arrow">→</span>' +
        '<span class="tk-word">' + escapeHtml(tk.word) + '</span>' +
        (tk.alt && tk.alt.length ? '<span class="tk-cycle" title="点击切换同义词">⇄</span>' : '') +
        '<span class="tk-del" title="移除这个语义">×</span>';
      el.title = tk.typo ? '疑似错别字，已按「' + tk.guess + '」理解'
        : tk.pinyin ? '按拼音「' + tk.pinyin + '」理解'
          : (tk.alt && tk.alt.length ? '点击切换同义词：' + [tk.word].concat(tk.alt).join(' / ') : '');
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('tk-del')) {
          CURRENT_PARSED.tokens.splice(idx, 1);
          refreshFromParsed();
          return;
        }
        if (!tk.alt || !tk.alt.length) return;
        const pool = [tk.e ? tk.e.w : tk.word].concat(tk.alt);
        const cur = pool.indexOf(tk.word);
        tk.word = pool[(cur + 1) % pool.length];
        tk.plural = pluralize(tk.word);
        tk.pinyin = null;
        refreshFromParsed();
      });
      chips.appendChild(el);
    });

    // 未确认词提示 / 自定义词库状态
    const todo = tokens.filter((t) => t.unknownWord).length;
    const lexCount = Object.keys(LEXICON).length;
    const warn = $('#parseWarn');
    if (todo) {
      warn.style.display = '';
      warn.innerHTML = '有 <b>' + todo + '</b> 个词不在词库，补上英文我帮你记住 —— 也可以点 × 忽略。';
    } else if (lexCount) {
      warn.style.display = '';
      warn.innerHTML = '已记住 <b>' + lexCount + '</b> 个自定义词 <button class="link-btn" id="btnLexClear">清空词库</button>';
      $('#btnLexClear').addEventListener('click', () => {
        LEXICON = {};
        saveLexicon();
        invalidatePairs();
        refreshFromParsed();
        toast('自定义词库已清空');
      });
    } else {
      warn.style.display = 'none';
    }

    $('#parseTypes').innerHTML = '';
    const typesBox = $('#parseTypes');
    const meta = (LAST_PARSE_META || []);
    meta.forEach((m, i) => {
      const s = document.createElement('span');
      s.className = 'pt' + (i === 0 ? ' pt-main' : '');
      s.innerHTML = KIND_LABEL[m.type] + '<b>' + m.weight + '%</b>';
      typesBox.appendChild(s);
    });
  }

  let SILENT = false;

  function refreshFromParsed() {
    if (!CURRENT_PARSED) return;
    const res = generateFromParsed(CURRENT_PARSED, $('#genType').value, $('#genCase').value, $('#genLen').value, $('#genLang').value);
    LAST_PARSE_META = res.typeMeta || [];
    SILENT = true;
    renderParse();
    renderResult(res, CURRENT_QUERY);
    SILENT = false;
  }

  function renderResult(res, query) {
    const empty = $('#resEmpty');
    const head = $('#resHead');
    RES_FILTER = 'all';
    RES_PAGE = 0;

    if (!res.list.length) {
      empty.style.display = '';
      empty.innerHTML = '<div class="big">🤔</div><p>这句话里我没找到能翻译的关键词。</p><p>换个说法试试，例如「<b>购物车里已选商品的数量</b>」或直接写英文关键词。</p>';
      head.style.display = 'none';
      $('#kindFilter').style.display = 'none';
      $('#resGrid').innerHTML = '';
      LAST_RESULT = null;
      return;
    }

    empty.style.display = 'none';
    head.style.display = 'flex';
    renderCards(res);
    renderKindFilter(res);

    LAST_RESULT = { query: query, res: res };
    $('#heroQuery').textContent = '「' + (query.length > 16 ? query.slice(0, 15) + '…' : query) + '」';
    $('#heroName').textContent = res.list[0].name;
    if (!SILENT) bumpCount(res.list.length);
  }

  let LAST_PARSE_META = [];

  function starStr(n) {
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= n ? '★' : '<span class="off">★</span>';
    return s;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  /* ---------------------------------------------------------
   * 6. 历史记录
   * ------------------------------------------------------- */
  const HIST_KEY = 'namesmith.history.v1';
  const COUNT_KEY = 'namesmith.count.v1';

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveHistory(list) {
    try { localStorage.setItem(HIST_KEY, JSON.stringify(list.slice(0, 40))); } catch (e) { /* ignore */ }
  }
  function pushHistory(item) {
    const h = loadHistory();
    h.unshift(item);
    saveHistory(h);
    renderHistory();
  }
  function renderHistory() {
    const h = loadHistory();
    const box = $('#histList');
    const panel = $('#histPanel');
    panel.style.display = h.length ? '' : 'none';
    box.innerHTML = '';
    h.forEach((it, i) => {
      const el = document.createElement('div');
      el.className = 'hist-item';
      el.innerHTML = '<span class="src">' + escapeHtml(it.q) + '</span>' +
        '<span class="tag n">' + escapeHtml(it.kind) + '</span>' +
        '<span class="nm">' + escapeHtml(it.name) + '</span>' +
        '<button class="x" data-idx="' + i + '" title="删除">×</button>';
      box.appendChild(el);
    });
  }
  function bumpCount(n) {
    let c = 0;
    try { c = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10) || 0; } catch (e) { c = 0; }
    c += n;
    try { localStorage.setItem(COUNT_KEY, String(c)); } catch (e) { /* ignore */ }
    $('#footStat').textContent = '本机已生成 ' + c + ' 个命名';
  }
  function initFoot() {
    let c = 0;
    try { c = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10) || 0; } catch (e) { c = 0; }
    $('#footStat').textContent = '本机已生成 ' + c + ' 个命名';
  }

  /* ---------------------------------------------------------
   * 7. 导出：Markdown / 分享卡片
   * ------------------------------------------------------- */
  function buildMarkdown() {
    if (!LAST_RESULT) return '';
    const r = LAST_RESULT.res;
    const lines = ['## NameSmith 命名结果', '', '> 需求描述：' + LAST_RESULT.query, '',
      '- 目标类型：' + KIND_LABEL[r.target], '- 命名风格：' + r.style, '',
      '| 命名 | 类型 | 评分 | 说明 |', '| --- | --- | --- | --- |'];
    r.list.forEach((c) => {
      lines.push('| `' + c.name + '` | ' + c.tag + ' | ' + c.score + ' | ' + c.why + ' |');
    });
    lines.push('', '> 由 NameSmith 命名工坊生成 · WorkBuddy 1024 造物挑战');
    return lines.join('\n');
  }

  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  function drawShareCard() {
    if (!LAST_RESULT) { toast('先生成一批命名'); return; }
    const cv = $('#shotCanvas');
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#f7f8ff');
    g.addColorStop(1, '#fff4ec');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // 顶部装饰条
    const gg = ctx.createLinearGradient(0, 0, W, 0);
    gg.addColorStop(0, '#5b5bd6');
    gg.addColorStop(0.55, '#7c6cf0');
    gg.addColorStop(1, '#ff8a2b');
    ctx.fillStyle = gg;
    ctx.fillRect(0, 0, W, 14);

    const pad = 76;
    ctx.fillStyle = '#5b5bd6';
    ctx.font = 'bold 30px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('NameSmith 命名工坊', pad, 110);
    ctx.fillStyle = '#8b90a5';
    ctx.font = '24px system-ui, "PingFang SC", sans-serif';
    ctx.fillText('专治 data2 / handleThing / tempFinal 综合症', pad, 152);

    // 需求卡片
    roundRect(ctx, pad, 190, W - pad * 2, 168, 22);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e4e6ef';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#8b90a5';
    ctx.font = '22px system-ui, "PingFang SC", sans-serif';
    ctx.fillText('需求描述', pad + 32, 236);

    ctx.fillStyle = '#1b1d29';
    ctx.font = 'bold 34px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
    wrapText(ctx, LAST_RESULT.query, pad + 32, 288, W - pad * 2 - 64, 46);

    // 候选列表
    let y = 420;
    ctx.fillStyle = '#8b90a5';
    ctx.font = '22px system-ui, "PingFang SC", sans-serif';
    ctx.fillText('AI 推荐命名 TOP ' + Math.min(5, LAST_RESULT.res.list.length), pad, y);
    y += 42;

    LAST_RESULT.res.list.slice(0, 5).forEach((c, i) => {
      const h = 150;
      roundRect(ctx, pad, y, W - pad * 2, h, 20);
      ctx.fillStyle = i === 0 ? '#fffaf4' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = i === 0 ? '#ff8a2b' : '#e4e6ef';
      ctx.lineWidth = i === 0 ? 3 : 2;
      ctx.stroke();

      if (i === 0) {
        roundRect(ctx, pad + 28, y + 26, 96, 40, 12);
        ctx.fillStyle = '#ff8a2b';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px system-ui, "PingFang SC", sans-serif';
        ctx.fillText('推荐', pad + 48, y + 54);
      }

      ctx.fillStyle = '#1b1d29';
      ctx.font = 'bold 36px "JetBrains Mono", Consolas, monospace';
      const nm = c.name.length > 26 ? c.name.slice(0, 25) + '…' : c.name;
      ctx.fillText(nm, pad + (i === 0 ? 140 : 30), y + 58);

      ctx.fillStyle = '#ff8a2b';
      ctx.font = '26px system-ui, sans-serif';
      let st = '';
      for (let s = 0; s < c.stars; s++) st += '★';
      ctx.fillText(st, W - pad - 30 - ctx.measureText(st).width, y + 58);

      ctx.fillStyle = '#5a5f75';
      ctx.font = '23px system-ui, "PingFang SC", sans-serif';
      wrapText(ctx, c.why, pad + 30, y + 104, W - pad * 2 - 60, 34);

      y += h + 18;
    });

    ctx.fillStyle = '#a0a5bb';
    ctx.font = '22px system-ui, "PingFang SC", sans-serif';
    ctx.fillText('由 NameSmith 生成 · WorkBuddy「1024 造物挑战」参赛作品', pad, H - 54);

    const url = cv.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'namesmith-' + Date.now() + '.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('分享卡片已下载，发朋友圈时请务必带上素质');
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    let line = '';
    let yy = y;
    const chars = String(text).split('');
    for (let i = 0; i < chars.length; i++) {
      const test = line + chars[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, yy);
        line = chars[i];
        yy += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, yy);
    return yy;
  }

  /* ---------------------------------------------------------
   * 8. 事件绑定
   * ------------------------------------------------------- */
  function doGenerate() {
    const q = $('#genInput').value.trim();
    if (!q) { toast('先写点东西，我可不会读心术'); $('#genInput').focus(); return; }
    CURRENT_QUERY = q;
    CURRENT_PARSED = tokenize(q);
    LAST_SIG = q + '::' + $('#genType').value + $('#genCase').value + $('#genLen').value + $('#genLang').value;
    const res = generateFromParsed(CURRENT_PARSED, $('#genType').value, $('#genCase').value, $('#genLen').value, $('#genLang').value);
    LAST_PARSE_META = res.typeMeta || [];
    $('#crossWrap').style.display = 'none';
    renderParse();
    renderResult(res, q);
    if (res.list.length) {
      pushHistory({ q: q, kind: KIND_LABEL[res.target], name: res.list[0].name, ts: Date.now() });
    }
  }

  /* ---- 跨语言对照：同一个概念，八种语言八种写法 ---- */
  function buildCrossTable(query) {
    const langs = [['ts', 'TypeScript'], ['js', 'JavaScript'], ['py', 'Python'], ['java', 'Java'],
      ['go', 'Go'], ['cs', 'C#'], ['rust', 'Rust'], ['sql', 'SQL']];
    const types = [['variable', '变量'], ['function', '函数'], ['boolean', '布尔'], ['class', '类'],
      ['constant', '常量'], ['interface', '接口'], ['table', '表名'], ['enumMember', '枚举成员']];
    let html = '<thead><tr><th>语言</th>' + types.map((t) => '<th>' + t[1] + '</th>').join('') + '</tr></thead><tbody>';
    langs.forEach((pair) => {
      const cells = types.map((tp) => {
        const r = generate(query, tp[0], 'auto', 'normal', pair[0]);
        const first = r.list[0];
        return '<td class="mono-cell">' + (first ? escapeHtml(first.name) : '—') + '</td>';
      });
      html += '<tr><td class="lang-cell">' + pair[1] + '</td>' + cells.join('') + '</tr>';
    });
    return html + '</tbody>';
  }

  function bindTabs() {
    $$('#tabs .tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('#tabs .tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        $$('.view').forEach((v) => v.classList.remove('active'));
        $('#' + btn.dataset.view).classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function initExamples() {
    const box = $('#exampleChips');
    D.EXAMPLES.forEach((ex) => {
      const b = document.createElement('button');
      b.className = 'chip ghost';
      b.textContent = ex;
      b.addEventListener('click', () => {
        $('#genInput').value = ex;
        doGenerate();
      });
      box.appendChild(b);
    });
  }

  /* ---- 转换 ---- */
  const CONV_TARGETS = [
    { id: 'camel', label: 'camelCase' },
    { id: 'pascal', label: 'PascalCase' },
    { id: 'snake', label: 'snake_case' },
    { id: 'kebab', label: 'kebab-case' },
    { id: 'screaming', label: 'SCREAMING_SNAKE' },
    { id: 'lower', label: '全小写连写' }
  ];
  let convTarget = 'camel';

  function initConvert() {
    const box = $('#convTargets');
    CONV_TARGETS.forEach((t, i) => {
      const b = document.createElement('button');
      b.className = 'chip' + (i === 0 ? ' on' : '');
      b.textContent = t.label;
      b.addEventListener('click', () => {
        convTarget = t.id;
        $$('#convTargets .chip').forEach((c) => c.classList.remove('on'));
        b.classList.add('on');
        doConvert();
      });
      box.appendChild(b);
    });
  }

  const ZH2EN = {
    '购物车': 'cart', '数量': 'count', '单价': 'unitPrice', '总价': 'totalPrice', '订单': 'order',
    '时间': 'time', '用户': 'user', '名称': 'name', '状态': 'status', '地址': 'address',
    '价格': 'price', '图片': 'image', '列表': 'list', '详情': 'detail', '编号': 'id'
  };

  function doConvert() {
    const lines = $('#convIn').value.split('\n');
    const out = [];
    let n = 0, skip = 0;
    lines.forEach((ln) => {
      const raw = ln.trim();
      if (!raw) return;
      n++;
      let words = splitWords(raw);
      // 中文词组
      const zh = words.filter((w) => /[\u4e00-\u9fa5]/.test(w));
      const en = words.filter((w) => !/[\u4e00-\u9fa5]/.test(w));
      const mapped = [];
      let leftoverCn = zh.join('');
      Object.keys(ZH2EN).forEach((k) => {
        while (leftoverCn.indexOf(k) !== -1) {
          mapped.push(ZH2EN[k]);
          leftoverCn = leftoverCn.replace(k, '|');
        }
      });
      const finalWords = en.concat(mapped);
      if (!finalWords.length) { skip++; out.push(raw + '   // 无法识别'); return; }
      out.push(applyCase(finalWords, convTarget));
    });
    $('#convOut').textContent = out.join('\n') || '结果会出现在这里';
    $('#convCount').textContent = String(n);
    $('#convSkipped').textContent = String(skip);
  }

  /* ---- 体检 ---- */
  function doAudit() {
    const lines = $('#auditIn').value.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!lines.length) { toast('先交上来几个变量名'); return; }
    const box = $('#auditList');
    box.innerHTML = '';
    let sum = 0, issues = 0, fail = 0;
    lines.forEach((name) => {
      const sc = scoreName(name);
      sum += sc.score;
      issues += sc.issues.length;
      if (sc.score < 60) fail++;
      const fixed = applyCase(fixSuggestion(name), name === name.toUpperCase() && name.length > 4 && /_/.test(name) ? 'screaming' : 'camel');
      const cls = sc.score >= 80 ? 's-good' : sc.score >= 60 ? 's-warn' : 's-bad';
      const el = document.createElement('div');
      el.className = 'audit-item';
      el.innerHTML =
        '<div class="audit-top">' +
        '<span class="audit-name">' + escapeHtml(name) + '</span>' +
        '<span class="stars">' + starStr(stars(sc.score)) + '</span>' +
        '<span class="audit-score ' + cls + '">' + sc.score + ' 分</span>' +
        '</div>' +
        (sc.issues.length
          ? '<ul class="audit-issues">' + sc.issues.map((i) => '<li>' + escapeHtml(i) + '</li>').join('') + '</ul>'
          : '<ul class="audit-issues"><li>没挑出毛病，这名字可以放心上线。</li></ul>') +
        (sc.score < 95 ? '<div class="audit-fix">建议改名：<code>' + escapeHtml(fixed) + '</code></div>' : '');
      box.appendChild(el);
    });
    const avg = Math.round(sum / lines.length);
    $('#auTotal').textContent = String(lines.length);
    $('#auAvg').textContent = String(avg);
    $('#auIssues').textContent = String(issues);
    $('#auFail').textContent = String(fail);
    const avgBox = $('#auAvgBox');
    avgBox.className = 'stat ' + (avg >= 80 ? 'good' : avg >= 60 ? 'warn' : 'bad');
    $('#auditResult').style.display = '';
  }

  function buildAuditReport() {
    const lines = $('#auditIn').value.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!lines.length) return '';
    const out = ['# 命名体检报告', '', '> 由 NameSmith 命名工坊生成', '', '| 命名 | 得分 | 问题 |', '| --- | --- | --- |'];
    lines.forEach((name) => {
      const sc = scoreName(name);
      out.push('| `' + name + '` | ' + sc.score + ' | ' + (sc.issues.join('；') || '无') + ' |');
    });
    return out.join('\n');
  }

  /* ---- 彩蛋 ---- */
  function rollFun() {
    const adj = rnd(D.FUN_ADJ);
    const noun = rnd(D.FUN_NOUN);
    const useSuffix = Math.random() > 0.35;
    const name = applyCase([adj, noun], 'pascal') + (useSuffix ? rnd(D.FUN_SUFFIX) : '');
    $('#funName').textContent = name;
    const notes = [
      '念出来试试，它会不会比 userInfo2 更有灵魂？',
      '如果这个进了代码 review，记得提前准备好解释。',
      '抽象得恰到好处，以至于没人敢删它。',
      '命名即艺术，维护者即考古学家。',
      '它在代码里存在了三年，没人知道它做什么。',
      '建议配一句注释：// TODO 解释一下这个是干嘛的'
    ];
    $('#funNote').textContent = rnd(notes);
    $('#mA').style.width = (55 + Math.random() * 45) + '%';
    $('#mB').style.width = (30 + Math.random() * 65) + '%';
    $('#mC').style.width = (50 + Math.random() * 50) + '%';
  }

  function initCommitTypes() {
    const sel = $('#cmType');
    D.COMMIT_TYPES.forEach((t) => {
      const o = document.createElement('option');
      o.value = t.t;
      o.textContent = t.t + ' - ' + t.cn;
      sel.appendChild(o);
    });
  }

  function doCommit() {
    const type = $('#cmType').value || 'feat';
    const scope = $('#cmScope').value.trim();
    const desc = $('#cmDesc').value.trim();
    const wild = $('#cmMode').value === 'wild';
    const head = type + (scope ? '(' + scope + ')' : '') + ': ';
    if (wild) {
      $('#cmOut').textContent = head + rnd(D.COMMIT_JOKES);
    } else if (!desc) {
      $('#cmOut').textContent = head + '请填写具体改动，例如「修复优惠券金额精度丢失」';
    } else {
      const body = [
        '',
        '- 变更动机：' + desc,
        '- 影响范围：' + (scope || '全局'),
        '- 自测情况：本地已验证，边界场景待补充'
      ];
      $('#cmOut').textContent = head + desc + body.join('\n');
    }
  }

  const BUZZ = {
    target: ['核心转化路径', '用户全生命周期', '首屏体验水位', '履约链路履约率', '心智触点矩阵', '端到端闭环'],
    verb: ['策略调优', '链路治理', '能力沉淀', '颗粒度细化', '维度打通', '对齐打法'],
    method: ['中台化能力复用', '原子化组件编排', '灰度实验机制', '数据驱动闭环', '低代码编排', '领域模型重塑'],
    asset: ['方法论沉淀', '标准化能力资产', '可复用中台模块', '行业最佳实践', '组织级复用件'],
    goal: ['降本增效', 'GMV 第二增长曲线', '用户 LTV 提升', '心智占位', '留存水位抬升']
  };

  function doBuzz() {
    const raw = $('#buzzIn').value.trim();
    if (!raw) { toast('先说点人话'); return; }
    const lv = parseInt($('#buzzLevel').value, 10);
    const has = (w) => raw.indexOf(w) !== -1;
    let t = rnd(BUZZ.target);
    if (has('按钮') || has('交互')) t = '核心交互触点';
    else if (has('数据') || has('报表')) t = '底层数据资产';
    else if (has('性能') || has('慢')) t = '性能水位';
    else if (has('bug') || has('报错') || has('bug'.toUpperCase())) t = '历史技术债';
    else if (has('接口') || has('联调')) t = '服务间契约';
    else if (has('文档')) t = '知识资产沉淀';
    else if (has('重构') || has('祖传')) t = '架构韧性';
    else if (has('页面') || has('UI') || has('界面')) t = '用户视觉体验';

    let out = '';
    if (lv === 1) {
      out = '围绕「' + raw + '」这件事，我们先从' + t + '切入，做一轮' + rnd(BUZZ.verb) + '，预期整体效率提升 ' + (8 + Math.random() * 20).toFixed(1) + '%。';
    } else if (lv === 2) {
      out = '本次以' + t + '为切入点，通过' + rnd(BUZZ.method) + '完成一轮' + rnd(BUZZ.verb) +
        '，形成"度量—归因—迭代"的数据闭环，沉淀为可复用的' + rnd(BUZZ.asset) + '，最终赋能业务实现' + rnd(BUZZ.goal) + '。';
    } else {
      out = '立足于' + t + '的长期价值锚点，我们将以' + rnd(BUZZ.method) + '为底座，对' + t +
        '实施全链路' + rnd(BUZZ.verb) + '，打通"' + rnd(BUZZ.goal) + '"的战略传导链路，' +
        '沉淀组织级' + rnd(BUZZ.asset) + '，最终实现' + rnd(BUZZ.goal) + '的指数级跃迁。\n\n（人话版本：' + raw + '）';
    }
    $('#buzzOut').textContent = out;
  }

  /* ---- 规范表 ---- */
  const GUIDE_STATE = { lang: 'ts', cat: '全部', q: '' };

  function curLang() {
    return D.LANG_MATRIX.filter((x) => x.id === GUIDE_STATE.lang)[0] || D.LANG_MATRIX[0];
  }

  function renderGuideTable() {
    const L = curLang();
    const q = GUIDE_STATE.q;
    const rows = L.rows.filter((r) => {
      if (!q) return true;
      return [r.el, r.rule, r.good, r.bad, r.note].join(' ').toLowerCase().indexOf(q) !== -1;
    });
    $('#guideBody').innerHTML = rows.map((r) =>
      '<tr><td>' + escapeHtml(r.el) + '</td>' +
      '<td>' + escapeHtml(r.rule) + '</td>' +
      '<td>' + escapeHtml(r.bad) + '</td>' +
      '<td>' + escapeHtml(r.good) + '</td>' +
      '<td class="note-cell">' + escapeHtml(r.note) + '</td></tr>'
    ).join('');
    $('#guideEmpty').style.display = rows.length ? 'none' : '';
  }

  function renderPatterns() {
    const list = D.PATTERNS.filter((p) => GUIDE_STATE.cat === '全部' || p.cat === GUIDE_STATE.cat);
    $('#patternGrid').innerHTML = list.map((p) =>
      '<div class="res-card pattern-card">' +
      '<h4 class="res-name pattern-name">' + escapeHtml(p.n) + '</h4>' +
      '<div class="res-meta"><span class="tag">' + escapeHtml(p.cat) + '</span>' +
      '<span class="tag n">' + escapeHtml(p.ex) + '</span></div>' +
      '<p class="res-why">' + escapeHtml(p.use) + '</p>' +
      (p.warn ? '<p class="res-why warn-line">注意：' + escapeHtml(p.warn) + '</p>' : '') +
      '</div>'
    ).join('');
  }

  function initGuide() {
    const langBox = $('#langChips');
    D.LANG_MATRIX.forEach((L, i) => {
      const b = document.createElement('button');
      b.className = 'chip' + (i === 0 ? ' on' : '');
      b.textContent = L.short;
      b.addEventListener('click', () => {
        GUIDE_STATE.lang = L.id;
        $$('#langChips .chip').forEach((c) => c.classList.remove('on'));
        b.classList.add('on');
        renderGuideTable();
      });
      langBox.appendChild(b);
    });

    $('#guideSearch').addEventListener('input', (e) => {
      GUIDE_STATE.q = e.target.value.trim().toLowerCase();
      renderGuideTable();
    });

    const cats = ['全部'].concat(uniq(D.PATTERNS.map((p) => p.cat)));
    const catBox = $('#patternCats');
    cats.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'chip' + (i === 0 ? ' on' : '');
      b.textContent = c;
      b.addEventListener('click', () => {
        GUIDE_STATE.cat = c;
        $$('#patternCats .chip').forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
        renderPatterns();
      });
      catBox.appendChild(b);
    });

    const grid = $('#smellGrid');
    D.SMELL.forEach((s) => {
      const el = document.createElement('div');
      el.className = 'res-card';
      el.style.cursor = 'default';
      el.innerHTML = '<h4 class="res-name" style="margin-right:0">' + escapeHtml(s.w) + '</h4>' +
        '<div class="res-meta"><span class="tag a">禁用词</span></div>' +
        '<p class="res-why">' + escapeHtml(s.why) + '</p>' +
        '<p class="res-why" style="margin-top:8px;color:var(--ok)">→ ' + escapeHtml(s.tip) + '</p>';
      grid.appendChild(el);
    });

    renderGuideTable();
    renderPatterns();

    const cl = $('#checklist');
    D.NAMING_CHECKLIST.forEach((item, i) => {
      const li = document.createElement('li');
      li.innerHTML = '<span class="ck-num">' + (i + 1) + '</span><span>' + escapeHtml(item) + '</span>';
      cl.appendChild(li);
    });
  }

  function guideMarkdown(onlyCurrent) {
    const langs = onlyCurrent ? [curLang()] : D.LANG_MATRIX;
    const lines = ['# 团队命名规范速查', '', '> Generated by NameSmith 命名工坊 · https://workbuddy.cn', ''];
    langs.forEach((L) => {
      lines.push('## ' + L.name, '', '| 元素 | 规范 | 反例 | 正例 | 备注 |', '| --- | --- | --- | --- | --- |');
      L.rows.forEach((r) => {
        lines.push('| ' + r.el + ' | ' + r.rule + ' | ~~' + r.bad + '~~ | `' + r.good + '` | ' + (r.note || '') + ' |');
      });
      lines.push('');
    });
    if (!onlyCurrent) {
      lines.push('## 命名模式库', '', '| 后缀 | 分类 | 职责 | 示例 | 常见误用 |', '| --- | --- | --- | --- | --- |');
      D.PATTERNS.forEach((p) => lines.push('| ' + p.n + ' | ' + p.cat + ' | ' + p.use + ' | `' + p.ex + '` | ' + (p.warn || '') + ' |'));
      lines.push('', '## 禁用词清单', '');
      D.SMELL.forEach((s) => lines.push('- **' + s.w + '**：' + s.why + ' → ' + s.tip));
    }
    return lines.join('\n');
  }

  /* ---------------------------------------------------------
   * 9. 全局事件
   * ------------------------------------------------------- */
  function bindAll() {
    $('#btnGen').addEventListener('click', doGenerate);
    $('#btnGenClear').addEventListener('click', () => {
      $('#genInput').value = '';
      $('#resGrid').innerHTML = '';
      $('#resEmpty').style.display = '';
      $('#resHead').style.display = 'none';
      $('#parseBox').style.display = 'none';
      $('#kindFilter').style.display = 'none';
      CURRENT_PARSED = null;
      LAST_RESULT = null;
      $('#genInput').focus();
    });

    document.addEventListener('click', (e) => {
      const cb = e.target.closest ? e.target.closest('.copy-btn') : null;
      if (cb) {
        copyText(cb.dataset.copy, '已复制 ' + cb.dataset.copy);
        cb.classList.add('done');
        cb.innerHTML = CHECK_ICON;
        setTimeout(() => { cb.classList.remove('done'); cb.innerHTML = COPY_ICON; }, 1200);
        return;
      }
      const x = e.target.closest ? e.target.closest('.hist-item .x') : null;
      if (x) {
        const idx = parseInt(x.dataset.idx, 10);
        const h = loadHistory();
        h.splice(idx, 1);
        saveHistory(h);
        renderHistory();
      }
    });

    $('#btnCopyAll').addEventListener('click', () => {
      if (!LAST_RESULT) return;
      copyText(LAST_RESULT.res.list.map((c) => c.name).join('\n'), '已复制全部候选');
    });
    $('#btnExportMd').addEventListener('click', () => {
      if (!LAST_RESULT) return;
      download('namesmith-' + Date.now() + '.md', buildMarkdown(), 'text/markdown;charset=utf-8');
      toast('Markdown 已导出');
    });
    $('#btnShareCard').addEventListener('click', drawShareCard);
    $('#btnClearHist').addEventListener('click', () => { saveHistory([]); renderHistory(); toast('历史已清空'); });

    $('#convIn').addEventListener('input', doConvert);
    $('#btnConvDemo').addEventListener('click', () => {
      $('#convIn').value = ['user_profile_name', 'getUserList', 'order-item-price', 'MAX RETRY COUNT', '购物车数量', 'is_user_login'].join('\n');
      doConvert();
    });
    $('#btnConvCopy').addEventListener('click', () => copyText($('#convOut').textContent, '结果已复制'));
    $('#btnConvSwap').addEventListener('click', () => { $('#convIn').value = $('#convOut').textContent; doConvert(); toast('已回填'); });

    $('#btnAudit').addEventListener('click', doAudit);
    $('#btnAuditDemo').addEventListener('click', () => {
      $('#auditIn').value = ['data', 'userInfoList2', 'handleData', 'tmp', 'ProductManagerManager', 'getUsr Password', '我是一个变量', 'a'].join('\n');
      doAudit();
    });
    $('#btnAuditClear').addEventListener('click', () => { $('#auditIn').value = ''; $('#auditResult').style.display = 'none'; });
    $('#btnAuditCopy').addEventListener('click', () => copyText(buildAuditReport(), '体检报告已复制'));

    $('#btnFun').addEventListener('click', rollFun);
    $('#btnFunCopy').addEventListener('click', () => copyText($('#funName').textContent, '抽象命名已复制'));
    $('#btnCm').addEventListener('click', doCommit);
    $('#btnCmCopy').addEventListener('click', () => copyText($('#cmOut').textContent, 'commit 已复制'));
    $('#btnBuzz').addEventListener('click', doBuzz);
    $('#btnBuzzCopy').addEventListener('click', () => copyText($('#buzzOut').textContent, '黑话已复制'));

    $('#btnGuideCopy').addEventListener('click', () => copyText(guideMarkdown(true), '当前语言的规范已复制'));
    $('#btnGuideDown').addEventListener('click', () => download('team-naming-convention.md', guideMarkdown(false), 'text/markdown;charset=utf-8'));

    // 跨语言对照
    $('#btnCross').addEventListener('click', () => {
      const q = $('#genInput').value.trim();
      if (!q) { toast('先写个需求描述'); return; }
      $('#crossTable').innerHTML = buildCrossTable(q);
      $('#crossWrap').style.display = '';
      toast('同一概念，八种语言写法一次看全');
    });
    $('#btnCrossClose').addEventListener('click', () => { $('#crossWrap').style.display = 'none'; });

    // 任何选项变化都实时重算，不用反复点"生成"
    ['genType', 'genCase', 'genLen', 'genLang'].forEach((id) => {
      $('#' + id).addEventListener('change', () => {
        const q = $('#genInput').value.trim();
        if (!q) return;
        CURRENT_QUERY = q;
        CURRENT_PARSED = tokenize(q);
        refreshFromParsed();
        $('#crossWrap').style.display = 'none';
      });
    });

    // 换一批：候选池翻页，避免"就这几个"
    $('#btnBatch').addEventListener('click', () => {
      if (!LAST_RESULT) return;
      RES_PAGE += 1;
      renderCards(LAST_RESULT.res);
    });

    // 边打边解析：输入停顿 400ms 后即时刷新理解结果
    let inputTimer = null;
    $('#genInput').addEventListener('input', () => {
      clearTimeout(inputTimer);
      inputTimer = setTimeout(() => {
        const q = $('#genInput').value.trim();
        if (!q) return;
        const sig = q + '::' + $('#genType').value + $('#genCase').value + $('#genLen').value + $('#genLang').value;
        if (sig === LAST_SIG) return;
        LAST_SIG = sig;
        CURRENT_QUERY = q;
        CURRENT_PARSED = tokenize(q);
        refreshFromParsed();
      }, 400);
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if ($('#v-gen').classList.contains('active')) doGenerate();
      }
      if ((e.ctrlKey || e.metaKey) && lower(e.key) === 'k') {
        e.preventDefault();
        $('#genInput').focus();
      }
    });

    $('#themeBtn').addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('namesmith.theme', next); } catch (err) { /* ignore */ }
      toast(next === 'dark' ? '已切换到深色模式' : '已切换到浅色模式');
    });
  }

  /* ---------------------------------------------------------
   * 10. 启动
   * ------------------------------------------------------- */
  function init() {
    loadLexicon();
    try {
      const t = localStorage.getItem('namesmith.theme');
      if (t) document.documentElement.setAttribute('data-theme', t);
    } catch (e) { /* ignore */ }
    bindTabs();
    initExamples();
    initConvert();
    initCommitTypes();
    initGuide();
    bindAll();
    renderHistory();
    initFoot();
    rollFun();
    if (!$('#genInput').value.trim()) $('#genInput').value = '获取用户列表';
    CURRENT_QUERY = $('#genInput').value.trim();
    CURRENT_PARSED = tokenize(CURRENT_QUERY);
    const demoRes = generateFromParsed(CURRENT_PARSED, 'auto', 'auto', 'normal', $('#genLang').value);
    LAST_PARSE_META = demoRes.typeMeta || [];
    renderParse();
    renderResult(demoRes, CURRENT_QUERY);

    // 深链直达：index.html#audit / #conv / #fun / #guide，方便把某个功能直接分享给别人
    const hash = (location.hash || '').replace(/^#/, '');
    const HASH_MAP = {
      gen: 'v-gen', generate: 'v-gen', cross: 'v-gen', demo: 'v-gen', conv: 'v-conv',
      convert: 'v-conv', audit: 'v-audit', fun: 'v-fun', guide: 'v-guide'
    };
    const view = HASH_MAP[hash] || (/^v-[a-z]+$/.test(hash) ? hash : null);
    if (view) {
      const btn = document.querySelector('.tab[data-view="' + view + '"]');
      if (btn) {
        btn.click();
        if (hash === 'cross') {
          $('#crossTable').innerHTML = buildCrossTable($('#genInput').value.trim());
          $('#crossWrap').style.display = '';
        } else if (hash === 'demo') {
          $('#genInput').value = '螺蛳粉库存数量';
          doGenerate();
        } else if (view === 'v-audit') {
          $('#auditIn').value = ['data', 'userInfoList2', 'handleData', 'tmp', 'ProductManagerManager', 'getUsr Password', 'MAX RETRY COUNT', 'a'].join('\n');
          doAudit();
        } else if (view === 'v-conv') {
          $('#convIn').value = ['user_profile_name', 'getUserList', 'order-item-price', 'MAX RETRY COUNT', '购物车数量', 'is_user_login'].join('\n');
          doConvert();
        } else if (view === 'v-fun') {
          rollFun();
          $('#cmDesc').value = '修复优惠券金额精度丢失';
          $('#cmScope').value = 'coupon';
          doCommit();
          $('#buzzIn').value = '把这个按钮改好看一点';
          doBuzz();
        }
      }
    }
  }

  // 对外暴露引擎 API，方便你在控制台里玩（也方便写测试）
  window.NameSmith = {
    generate: generate, generateFromParsed: generateFromParsed, tokenize: tokenize,
    scoreName: scoreName, detectStyle: detectStyle, detectTypes: detectTypes,
    applyCase: applyCase, splitWords: splitWords, stars: stars, version: '1.2.0',
    loadLexicon: loadLexicon, getLexicon: () => Object.assign({}, LEXICON),
    setLexiconEntry: (cn, en) => { LEXICON[cn] = en; saveLexicon(); invalidatePairs(); },
    renderResult: renderResult, doGenerate: doGenerate
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
