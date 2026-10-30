/* 数据层：只读本地 md，不写任何文件 */
(function () {
  /* 一律走站点根：页面即使从 /tests/ 或子路径打开，也读同一份档案 */
  const ROOT = '/';
  const DIRS = { weekly: 'weekly/', cards: 'cards/', sessions: 'sessions/', texts: 'texts/' };
  const at = p => ROOT + String(p).replace(/^\/+/, '');

  async function get(url) { const {files}=await window.GXStorage.read(); if (!(url in files)) throw Error(url + ' → HTTP 404'); return files[url]; }
  async function list(dir) { const {files}=await window.GXStorage.read(); return Object.keys(files).filter(x=>x.startsWith(dir) && !x.slice(dir.length).includes('/')).map(x=>x.slice(dir.length)); }

  function section(text, name) {
    const re = new RegExp('##\\s*' + name + '\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)');
    const m = text.match(re);
    return m ? m[1].trim() : '';
  }

  /* 只认「在读」那一行；没有在读行时退回首行，避免整页空白，但要标出它不是在读 */
  function parseState(t) {
    const re = /\|\s*([^|\n]+?)\s*\|\s*(未读|在读|待回炉|搁置)\s*\|\s*([^|\n]*?)\s*\|/g;
    const rows = [];
    let m;
    while ((m = re.exec(t))) rows.push({ unit: m[1].trim(), status: m[2], gear: (m[3] || '').trim(), active: m[2] === '在读' });
    return rows.find(r => r.status === '在读') || rows[0] || null;
  }

  function parseWeek(file, t) {
    const records = [];
    const head = t.match(/^\s*档位：(完整|底线)/);
    if (head) records.push({ date: null, gear: head[1] });
    for (const m of t.matchAll(/晨读\s*(\d{4}-\d{2}-\d{2})?\s*档位：(完整|底线)/g)) {
      records.push({ date: m[1] || null, gear: m[2] });
    }
    const blocks = [];
    for (const chunk of t.split(/^##\s*触\s*$/m).slice(1)) {
      const touch = chunk.split(/\n##\s/)[0].trim();
      const zhao = section(chunk, '照');
      const xing = section(chunk, '行');
      const scene = (zhao.match(/情境：([\s\S]*?)(?=\n?反应：|$)/) || [, ''])[1].trim();
      const react = (zhao.match(/反应：([\s\S]*)/) || [, ''])[1].trim();
      blocks.push({ touch, scene, react, act: xing, hasAct: !!xing, noTouch: touch === '本周无触' });
    }
    return { file, date: file.replace(/\.md$/, ''), records, blocks };
  }

  function parseCard(file, t) {
    const tag = (t.match(/标签：[ \t]*(.*)/) || [, ''])[1].trim();
    const body = t.split('\n').filter(l => !/^标签：/.test(l)).join('\n').trim();
    return { file, tag, body, date: file.slice(0, 10), unit: file.replace(/\.md$/, '').slice(11) };
  }

  /* 本周周一（周记文件名） */
  function monday(day) {
    const d = day ? new Date(day + 'T00:00:00') : new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }

  /* 写入失败要能看出是哪一步坏的：连不上 / 不是 JSON / 服务报错 */
  function why(status, raw) {
    if (status === 404) return '数据不存在，请刷新后重试';
    if (status === 403) return '没有访问权限，请确认登录状态';
    if (/^\s*</.test(raw || '')) return '返回的数据格式不正确';
    return '服务返回了无法解析的内容';
  }

  async function post(path, body) { return window.GXStorage.mutate(path, body); }

  async function load() {
    const out = { ok: false, mode: 'http', state: null, weeks: [], cards: [], sessions: [], texts: [], text: '', errors: [] };
    if (location.protocol === 'file:') { out.mode = 'file'; return out; }

    try { out.state = parseState(await get('state.md')); }
    catch (e) { out.errors.push(['state.md', e.message]); }

    try {
      const files = (await list(DIRS.weekly)).filter(f => /\.md$/.test(f)).sort();
      for (const f of files) out.weeks.push(parseWeek(f, await get(DIRS.weekly + f)));
    } catch (e) { out.errors.push(['weekly/', e.message]); }

    try {
      for (const f of (await list(DIRS.cards)).filter(f => /\.md$/.test(f)).sort().reverse()) {
        out.cards.push(parseCard(f, await get(DIRS.cards + f)));
      }
    } catch (e) { out.errors.push(['cards/', e.message]); }

    try { out.sessions = (await list(DIRS.sessions)).filter(f => /\.md$/.test(f)); }
    catch (e) { out.errors.push(['sessions/', e.message]); }

    try { out.texts = (await list(DIRS.texts)).filter(f => /\.txt$/.test(f)).map(f => f.replace(/\.txt$/, '')); }
    catch (e) { out.errors.push(['texts/', e.message]); }

    if (out.state) {
      try { out.text = await get(DIRS.texts + out.state.unit + '.txt'); }
      catch (e) { out.errors.push(['texts/' + out.state.unit + '.txt', '缺原文']); }
    }

    out.ok = !out.errors.length || !!out.state;
    return out;
  }

  window.GX = { load, list, get, post, at, parseWeek, monday };
})();
