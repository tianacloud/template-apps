import mark from './mark.svg';

export async function mountHandbook(root, { store, files, previewGuide }) {
  root.innerHTML = `<main class="handbook"><header class="topbar"><div class="brand"><img id="handbook-mark" width="40" height="40" alt=""/><div><span class="eyebrow">A LITTLE COLLECTION</span><h1>素材手册</h1></div></div><button class="quiet" id="reload-materials">重新读取</button></header><section class="intro"><span class="eyebrow">留住资料，也留住想法</span><h2>每一份素材，<br/>都有自己的笔记。</h2><p>打开图片，读一份指南。把当下的想法记下来，下次接着看。</p></section><div class="workspace"><nav class="library" aria-label="资料列表"><h3>我的资料 <span id="material-count"></span></h3><div id="material-list"></div><p class="library-tip">资料与笔记属于这份手册。</p></nav><article class="detail" aria-labelledby="material-title"><div class="material-stage" id="material-stage"></div><div class="material-info"><span class="eyebrow" id="material-kind"></span><h2 id="material-title">正在打开资料…</h2><p id="material-description"></p><div class="note-heading"><label for="material-note">阅读笔记</label><span id="note-status" role="status" aria-live="polite"></span></div><textarea id="material-note" maxlength="8000" placeholder="记下你看到的细节，或下一步想做的事。" disabled></textarea><div class="note-footer"><span>笔记与这份资料一起保存</span><button class="primary" id="save-note" disabled>保存笔记</button></div><p class="error" id="handbook-error" role="alert"></p></div></article></div><footer class="page-footer">把灵感留在手边。<span>Material Handbook</span></footer></main>`;
  const find = id => root.querySelector(`#${id}`);
  find('handbook-mark').src = mark;
  let items = [], selected, disposed = false, busy = false, pending, selection = 0, deferredRoute = false;
  let releaseImage = () => {};
  const drafts = new Map(), urls = new Set();
  const error = message => { find('handbook-error').textContent = message; };
  function validPath(path) {
    if (typeof path !== 'string' || !path.startsWith('template-assets/') || /(?:\.\.|[\\%?#])/.test(path)) throw new Error('MATERIAL_PATH_UNAVAILABLE');
    return path;
  }
  function setActions() {
    find('save-note').disabled = !selected || busy || Boolean(pending);
    find('material-note').disabled = !selected || busy;
    find('reload-materials').disabled = busy;
  }
  function drawList() {
    const list = find('material-list'); list.replaceChildren();
    find('material-count').textContent = String(items.length);
    for (const item of items) {
      const button = document.createElement('button');
      button.className = 'material-choice'; button.type = 'button';
      button.setAttribute('aria-current', String(item.id === selected?.id));
      const category = document.createElement('span'); category.className = 'choice-kind'; category.textContent = item.kind === 'image' ? 'IMAGE' : 'DOCUMENT';
      const title = document.createElement('strong'); title.textContent = item.title;
      const meta = document.createElement('span'); meta.textContent = item.kind === 'image' ? '图片 · 灵感收藏' : 'PDF · 阅读资料';
      button.append(category, title, meta);
      button.addEventListener('click', () => { if (!busy) location.hash = encodeURIComponent(item.id); });
      list.append(button);
    }
  }
  async function download(item, button) {
    button.disabled = true; error('');
    try {
      const response = await files.get(validPath(item.file_path));
      if (!response.ok) throw new Error('MATERIAL_UNAVAILABLE');
      const blob = await response.blob(); if (disposed) return;
      const url = URL.createObjectURL(blob); urls.add(url);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = item.file_path.split('/').at(-1);
      root.append(anchor); anchor.click(); anchor.remove();
      setTimeout(() => { URL.revokeObjectURL(url); urls.delete(url); }, 30000);
    } catch { if (!disposed) error('暂时无法下载这份资料，请稍后重试。'); }
    finally { if (!disposed) button.disabled = false; }
  }
  async function select(item) {
    if (!item || disposed) return;
    const generation = ++selection;
    releaseImage(); releaseImage = () => {}; selected = item; drawList(); error('');
    find('material-title').textContent = item.title;
    find('material-kind').textContent = item.kind === 'image' ? 'IMAGE / 图片' : 'DOCUMENT / 附件';
    find('material-description').textContent = item.description;
    find('material-note').value = drafts.get(item.id) ?? item.note;
    find('note-status').textContent = pending?.id === item.id ? '保存结果待核对' : drafts.has(item.id) ? '尚未保存' : '';
    setActions();
    const stage = find('material-stage'); stage.replaceChildren();
    try {
      validPath(item.file_path);
      if (item.kind === 'image') {
        const image = document.createElement('img'); image.alt = item.title; stage.append(image);
        image.addEventListener('error', () => { if (!disposed && selection === generation) error('图片暂时无法读取，请重新读取资料。'); });
        image.addEventListener('load', () => { if (!disposed && selection === generation) error(''); });
        const cleanup = await files.bindImage(image, item.file_path);
        if (disposed || selection !== generation) cleanup(); else releaseImage = cleanup;
      } else {
        const card = document.createElement('div'); card.className = 'document-card';
        const badge = document.createElement('span'); badge.className = 'pdf-badge'; badge.textContent = 'PDF';
        const title = document.createElement('strong'); title.textContent = item.title;
        const subtitle = document.createElement('p'); subtitle.textContent = '留一份资料，慢慢读。';
        const button = document.createElement('button'); button.className = 'primary'; button.textContent = previewGuide ? '阅读示例指南' : '下载阅读指南';
        button.addEventListener('click', () => previewGuide ? previewGuide() : download(item, button));
        card.append(badge, title, subtitle, button); stage.append(card);
      }
    } catch { if (!disposed && selection === generation) error('暂时无法读取这份资料，请稍后重新打开。'); }
  }
  const route = () => {
    if (disposed) return;
    if (busy) { deferredRoute = true; return; }
    deferredRoute = false;
    let id = ''; try { id = decodeURIComponent(location.hash.slice(1)); } catch { /* Unknown links open the first material. */ }
    void select(items.find(item => item.id === id) ?? items[0]);
  };
  async function reload() {
    if (busy) return; busy = true; setActions(); error('');
    try {
      const rows = await store.all(); if (disposed) return;
      if (pending) {
        const row = rows.find(item => item.id === pending.id);
        if (!row) throw new Error('MATERIAL_UNAVAILABLE');
        if (row.last_mutation_id === pending.mutationId) drafts.delete(pending.id);
        pending = undefined;
      }
      items = rows; busy = false; route();
      if (!items.length) { selected = undefined; find('material-title').textContent = '还没有资料'; }
    } catch { if (!disposed) error('暂时无法读取笔记。保存结果不明时，请先重新读取核对。'); }
    finally { busy = false; if (!disposed) setActions(); }
  }
  find('material-note').addEventListener('input', event => {
    if (selected) { drafts.set(selected.id, event.target.value); find('note-status').textContent = '尚未保存'; }
  });
  find('reload-materials').addEventListener('click', reload);
  find('save-note').addEventListener('click', async () => {
    if (!selected || busy || pending) return;
    const item = selected, note = find('material-note').value, mutationId = crypto.randomUUID();
    busy = true; setActions(); error(''); find('note-status').textContent = '正在保存…';
    try {
      const row = await store.save(item, note, mutationId); if (disposed) return;
      if (!row) { find('note-status').textContent = '已有更新'; error('这份笔记已在别处修改。请重新读取后再合并你的内容。'); return; }
      items = items.map(value => value.id === row.id ? row : value); selected = row;
      drafts.delete(item.id); find('note-status').textContent = '已保存';
    } catch {
      if (disposed) return;
      pending = { id: item.id, mutationId };
      find('note-status').textContent = '保存结果待核对'; error('保存结果尚未确认。请点击重新读取核对，输入的内容会保留。');
    } finally { busy = false; if (!disposed) { setActions(); if (deferredRoute) route(); } }
  });
  window.addEventListener('hashchange', route);
  await reload();
  return () => { disposed = true; releaseImage(); window.removeEventListener('hashchange', route); for (const url of urls) URL.revokeObjectURL(url); };
}
